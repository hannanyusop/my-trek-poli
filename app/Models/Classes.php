<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Classes extends Model
{
    protected $fillable = [
        'registration_session_track_id',
        'name',
        'quota',
        'current_count',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'quota' => 'integer',
            'current_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function registrationSessionTrack(): BelongsTo
    {
        return $this->belongsTo(RegistrationSessionTrack::class);
    }
}
