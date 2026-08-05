<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Constituency extends Model
{
    protected $fillable = [
        'state_id', 'name', 'code', 'type', 'description', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function wards()
    {
        return $this->hasMany(Ward::class)->orderBy('name');
    }

    public function pollingUnits()
    {
        return $this->hasManyThrough(PollingUnit::class, Ward::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
