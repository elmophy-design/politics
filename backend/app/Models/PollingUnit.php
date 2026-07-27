<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PollingUnit extends Model
{
    protected $fillable = [
        'ward_id', 'name', 'code', 'latitude', 'longitude', 'registered_voters',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function electionResults()
    {
        return $this->hasMany(ElectionResult::class);
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class);
    }
}
