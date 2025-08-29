<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegistrationSessionTrack extends Model
{
    protected $fillable = [
        'registration_session_id',
        'track_id',
        'name',
        'description',
    ];

    public function registrationSession(): BelongsTo
    {
        return $this->belongsTo(RegistrationSession::class);
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(Track::class);
    }

    public function classes(): HasMany
    {
        return $this->hasMany(Classes::class);
    }
}
