<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FoundationBeneficiary extends Model
{
    protected $fillable = [
        'foundation_project_id', 'full_name', 'phone', 'ward_id',
        'story', 'is_success_story',
    ];

    protected function casts(): array
    {
        return [
            'is_success_story' => 'boolean',
        ];
    }

    public function project()
    {
        return $this->belongsTo(FoundationProject::class, 'foundation_project_id');
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }
}
