<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CitizenReport extends Model
{
    protected $fillable = [
        'type', 'full_name', 'phone', 'email', 'ward_id', 'subject',
        'description', 'photos', 'status', 'assigned_to', 'resolution_notes',
    ];

    protected function casts(): array
    {
        return [
            'photos' => 'array',
        ];
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
