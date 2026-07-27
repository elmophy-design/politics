<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FoundationProject extends Model
{
    protected $fillable = [
        'title', 'slug', 'category', 'summary', 'description', 'cover_image',
        'ward_id', 'start_date', 'end_date', 'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function beneficiaries()
    {
        return $this->hasMany(FoundationBeneficiary::class);
    }

    public function successStories()
    {
        return $this->hasMany(FoundationBeneficiary::class)->where('is_success_story', true);
    }
}
