<?php

namespace App\Services\Payments;

interface PaymentGatewayInterface
{
    /**
     * Start a transaction. Returns ['authorization_url' => string, 'reference' => string].
     */
    public function initialize(array $data): array;

    /**
     * Confirm a transaction with the gateway. Returns ['status' => 'successful'|'failed', 'amount' => float, 'raw' => array].
     */
    public function verify(string $reference): array;
}
