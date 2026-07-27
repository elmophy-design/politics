<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Donation;
use App\Services\Payments\PaymentGatewayFactory;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use RuntimeException;

class DonationController extends Controller
{
    use ApiResponse;

    /**
     * Admin donor/report listing.
     */
    public function index(Request $request)
    {
        $query = Donation::with('campaign:id,title')->latest();

        if ($request->filled('campaign_id')) {
            $query->where('campaign_id', $request->integer('campaign_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $result = $query->paginate($request->integer('per_page', 25));

        return $this->success($result);
    }

    /**
     * Start a donation. Card/bank-transfer via Paystack or Flutterwave; returns a checkout URL
     * the frontend redirects the donor to. Bank transfer without a gateway is recorded as pending
     * for manual reconciliation.
     */
    public function initialize(Request $request)
    {
        $validated = $request->validate([
            'campaign_id' => ['nullable', 'exists:campaigns,id'],
            'donor_name' => ['nullable', 'string', 'max:255'],
            'donor_email' => ['required_unless:gateway,bank_transfer', 'nullable', 'email'],
            'donor_phone' => ['nullable', 'string', 'max:20'],
            'is_anonymous' => ['boolean'],
            'amount' => ['required', 'numeric', 'min:100'],
            'gateway' => ['required', 'in:paystack,flutterwave,bank_transfer'],
        ]);

        $reference = 'DON-'.strtoupper(Str::random(10));

        $donation = Donation::create([
            ...$validated,
            'currency' => 'NGN',
            'reference' => $reference,
            'status' => 'pending',
        ]);

        if ($validated['gateway'] === 'bank_transfer') {
            return $this->success([
                'donation' => $donation,
                'message' => 'Please complete the transfer using the reference below; the admin team will confirm receipt.',
                'reference' => $reference,
            ], 'Donation recorded — pending bank transfer', 201);
        }

        try {
            $gatewayService = PaymentGatewayFactory::make($validated['gateway']);

            $init = $gatewayService->initialize([
                'email' => $validated['donor_email'],
                'name' => $validated['donor_name'] ?? 'Anonymous Donor',
                'amount' => $validated['amount'],
                'currency' => 'NGN',
                'reference' => $reference,
                'callback_url' => config('services.frontend.url').'/donations/success?reference='.$reference,
                'metadata' => ['campaign_id' => $validated['campaign_id'] ?? null],
            ]);
        } catch (RuntimeException $e) {
            $donation->update(['status' => 'failed']);

            return $this->error($e->getMessage(), 502);
        }

        return $this->success([
            'donation' => $donation,
            'authorization_url' => $init['authorization_url'],
        ], 'Redirect the donor to authorization_url to complete payment', 201);
    }

    /**
     * Called by the frontend (or the gateway's webhook) to confirm and finalize a donation.
     */
    public function verify(Request $request, string $reference)
    {
        $donation = Donation::where('reference', $reference)->firstOrFail();

        if ($donation->status === 'successful') {
            return $this->success($donation, 'Already confirmed');
        }

        if ($donation->gateway === 'bank_transfer') {
            return $this->error('Bank transfer donations are confirmed manually by an admin.', 422);
        }

        $gatewayService = PaymentGatewayFactory::make($donation->gateway);
        $result = $gatewayService->verify($reference);

        $donation->update([
            'status' => $result['status'],
            'paid_at' => $result['status'] === 'successful' ? now() : null,
        ]);

        return $this->success($donation, 'Donation status updated from gateway');
    }

    /**
     * Public campaign fundraising progress (goal tracking is derived from successful donations).
     */
    public function campaignProgress(Campaign $campaign)
    {
        return $this->success([
            'campaign' => $campaign->only('id', 'title'),
            'total_raised' => $campaign->totalRaised(),
            'donor_count' => $campaign->donations()->where('status', 'successful')->count(),
        ]);
    }

    public function receipt(Donation $donation)
    {
        abort_unless($donation->status === 'successful', 404, 'Receipt unavailable for unconfirmed donations.');

        return $this->success([
            'reference' => $donation->reference,
            'donor' => $donation->displayName(),
            'amount' => $donation->amount,
            'currency' => $donation->currency,
            'paid_at' => $donation->paid_at,
        ]);
    }
}
