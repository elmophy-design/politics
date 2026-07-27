<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConstituencyProject extends Model
{
    protected $fillable = [
        'title', 'ward_id', 'community', 'project_type', 'budget',
        'contractor', 'progress_percentage', 'status', 'description', 'photo_gallery',
    ];

    protected function casts(): array
    {
        return [
            'budget' => 'decimal:2',
            'photo_gallery' => 'array',
        ];
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }
}
