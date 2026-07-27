<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Volunteer extends Model
{
    protected $fillable = [
        'user_id', 'full_name', 'phone', 'email', 'address',
        'ward_id', 'polling_unit_id', 'occupation', 'gender',
        'skills', 'areas_of_interest', 'status',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'areas_of_interest' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function pollingUnit()
    {
        return $this->belongsTo(PollingUnit::class);
    }
}
