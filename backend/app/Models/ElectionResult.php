<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ElectionResult extends Model
{
    protected $fillable = [
        'polling_unit_id', 'submitted_by', 'party_agent_name', 'party_votes',
        'total_accredited_voters', 'total_votes_cast', 'result_sheet_image',
        'status', 'verified_by', 'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'party_votes' => 'array',
            'verified_at' => 'datetime',
        ];
    }

    public function pollingUnit()
    {
        return $this->belongsTo(PollingUnit::class);
    }

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function audits()
    {
        return $this->hasMany(ElectionResultAudit::class);
    }
}

