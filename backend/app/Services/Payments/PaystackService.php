<?php

namespace App\Services\Payments;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class PaystackService implements PaymentGatewayInterface
{
    private string $baseUrl = 'https://api.paystack.co';

    public function initialize(array $data): array
    {
        $response = Http::withToken(config('services.paystack.secret_key'))
            ->post("{$this->baseUrl}/transaction/initialize", [
                'email' => $data['email'],
                'amount' => (int) round($data['amount'] * 100), // kobo
                'reference' => $data['reference'],
                'callback_url' => $data['callback_url'] ?? null,
                'metadata' => $data['metadata'] ?? [],
            ]);

        if (! $response->successful() || ! $response->json('status')) {
            throw new RuntimeException('Paystack initialization failed: '.$response->json('message', 'Unknown error'));
        }

        return [
            'authorization_url' => $response->json('data.authorization_url'),
            'reference' => $response->json('data.reference'),
        ];
    }

    public function verify(string $reference): array
    {
        $response = Http::withToken(config('services.paystack.secret_key'))
            ->get("{$this->baseUrl}/transaction/verify/{$reference}");

        $data = $response->json('data', []);
        $paystackStatus = $data['status'] ?? null;

        return [
            'status' => $paystackStatus === 'success' ? 'successful' : 'failed',
            'amount' => isset($data['amount']) ? $data['amount'] / 100 : 0,
            'raw' => $data,
        ];
    }
}
