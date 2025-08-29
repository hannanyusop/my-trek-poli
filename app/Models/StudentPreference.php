<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentPreference extends Model
{
    protected $fillable = [
        'student_id',
        'registration_session_track_id',
        'priority',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function registrationSessionTrack(): BelongsTo
    {
        return $this->belongsTo(RegistrationSessionTrack::class);
    }
}
