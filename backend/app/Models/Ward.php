<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ward extends Model
{
    protected $fillable = [
        'lga_id', 'constituency_id', 'name', 'code',
        'geojson', 'center_lat', 'center_lng',
    ];

    protected function casts(): array
    {
        return [
            'geojson' => 'array',
            'center_lat' => 'float',
            'center_lng' => 'float',
        ];
    }

    public function lga()
    {
        return $this->belongsTo(Lga::class);
    }

    public function constituency()
    {
        return $this->belongsTo(Constituency::class);
    }

    public function pollingUnits()
    {
        return $this->hasMany(PollingUnit::class);
    }

    public function volunteers()
    {
        return $this->hasMany(Volunteer::class);
    }

    public function constituencyProjects()
    {
        return $this->hasMany(ConstituencyProject::class);
    }

    public function citizenReports()
    {
        return $this->hasMany(CitizenReport::class);
    }
}
