<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campaign extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'summary', 'description', 'cover_image',
        'status', 'start_date', 'end_date', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function events()
    {
        return $this->hasMany(CampaignEvent::class);
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function totalRaised(): float
    {
        return (float) $this->donations()->where('status', 'successful')->sum('amount');
    }
}
