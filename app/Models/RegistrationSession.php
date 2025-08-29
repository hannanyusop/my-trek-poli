<?php

namespace App\Models;

use App\Enums\RegistrationSessionStatus;
use Illuminate\Database\Eloquent\Model;

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
}
