<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value', 'group'];

    /**
     * Fetch all settings as a flat key => value map, optionally filtered by group.
     * Used by the public frontend so it only ever needs one request.
     */
    public static function map(?string $group = null): array
    {
        return static::query()
            ->when($group, fn ($q) => $q->where('group', $group))
            ->pluck('value', 'key')
            ->toArray();
    }
}
