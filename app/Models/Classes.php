<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function placements(): HasMany
    {
        return $this->hasMany(Placement::class, 'assigned_class_id');
    }

    public function activePlacements(): HasMany
    {
        return $this->hasMany(Placement::class, 'assigned_class_id')->where('is_active', true);
    }

    public function placementLogs(): HasMany
    {
        return $this->hasMany(PlacementLog::class, 'class_id');
    }
}
