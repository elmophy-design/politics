<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $fillable = [
        'campaign_id', 'donor_name', 'donor_email', 'donor_phone',
        'is_anonymous', 'amount', 'currency', 'gateway', 'reference',
        'status', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'is_anonymous' => 'boolean',
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function displayName(): string
    {
        return $this->is_anonymous ? 'Anonymous Donor' : ($this->donor_name ?? 'Anonymous Donor');
    }
}
