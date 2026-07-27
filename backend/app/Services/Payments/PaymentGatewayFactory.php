<?php

namespace App\Services\Payments;

use InvalidArgumentException;

class PaymentGatewayFactory
{
    public static function make(string $gateway): PaymentGatewayInterface
    {
        return match ($gateway) {
            'paystack' => new PaystackService,
            'flutterwave' => new FlutterwaveService,
            default => throw new InvalidArgumentException("Unsupported gateway: {$gateway}"),
        };
    }
}
