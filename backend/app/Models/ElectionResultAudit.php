<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ElectionResultAudit extends Model
{
    protected $fillable = [
        'election_result_id', 'user_id', 'action',
        'from_status', 'to_status', 'note', 'meta',
    ];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function result()
    {
        return $this->belongsTo(ElectionResult::class, 'election_result_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
