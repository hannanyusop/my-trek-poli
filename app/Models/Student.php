<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Student extends Model
{
    protected $fillable = [
        'registration_session_id',
        'matric_number',
        'identification_number',
        'name',
        'gender',
        'race',
        'religion',
        'email',
        'phone',
        'submitted_at',
        'is_submitted',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'is_submitted' => 'boolean',
        ];
    }

    public function registrationSession(): BelongsTo
    {
        return $this->belongsTo(RegistrationSession::class);
    }

    public function preferences(): HasMany
    {
        return $this->hasMany(StudentPreference::class);
    }

    public function placements(): HasMany
    {
        return $this->hasMany(Placement::class);
    }

    public function activePlacement(): HasOne
    {
        return $this->hasOne(Placement::class)->where('is_active', true);
    }

    public function placementLogs(): HasMany
    {
        return $this->hasMany(PlacementLog::class);
    }
}
