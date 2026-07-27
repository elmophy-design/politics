<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ward extends Model
{
    protected $fillable = ['lga_id', 'name', 'code'];

    public function lga()
    {
        return $this->belongsTo(Lga::class);
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
