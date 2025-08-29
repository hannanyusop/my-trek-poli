<?php

namespace App\Models;

use App\Enums\RegistrationSessionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegistrationSession extends Model
{
    protected $fillable = [
        'name',
        'status',
        'link_token',
        'start_date',
        'end_date',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'status' => RegistrationSessionStatus::class,
            'start_date' => 'datetime',
            'end_date' => 'datetime',
        ];
    }

    public function tracks(): HasMany
    {
        return $this->hasMany(RegistrationSessionTrack::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }
}
