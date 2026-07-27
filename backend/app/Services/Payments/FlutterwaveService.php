<?php

namespace App\Services\Payments;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class FlutterwaveService implements PaymentGatewayInterface
{
    private string $baseUrl = 'https://api.flutterwave.com/v3';

    public function initialize(array $data): array
    {
        $response = Http::withToken(config('services.flutterwave.secret_key'))
            ->post("{$this->baseUrl}/payments", [
                'tx_ref' => $data['reference'],
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'NGN',
                'redirect_url' => $data['callback_url'] ?? null,
                'customer' => [
                    'email' => $data['email'],
                    'name' => $data['name'] ?? 'Anonymous Donor',
                ],
                'meta' => $data['metadata'] ?? [],
            ]);

        if (! $response->successful() || $response->json('status') !== 'success') {
            throw new RuntimeException('Flutterwave initialization failed: '.$response->json('message', 'Unknown error'));
        }

        return [
            'authorization_url' => $response->json('data.link'),
            'reference' => $data['reference'],
        ];
    }

    public function verify(string $reference): array
    {
        // Flutterwave verifies by their internal transaction id, obtained via the tx_ref lookup endpoint.
        $lookup = Http::withToken(config('services.flutterwave.secret_key'))
            ->get("{$this->baseUrl}/transactions/verify_by_reference", ['tx_ref' => $reference]);

        $data = $lookup->json('data', []);
        $status = $data['status'] ?? null;

        return [
            'status' => $status === 'successful' ? 'successful' : 'failed',
            'amount' => $data['amount'] ?? 0,
            'raw' => $data,
        ];
    }
}
