<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
