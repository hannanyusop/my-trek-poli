<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Placement extends Model
{
    protected $fillable = [
        'student_id',
        'assigned_class_id',
        'placement_status',
        'placement_notes',
        'track_priority',
        'assigned_by',
        'admin_id',
        'assigned_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'track_priority' => 'integer',
            'assigned_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function assignedClass(): BelongsTo
    {
        return $this->belongsTo(Classes::class, 'assigned_class_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(PlacementLog::class);
    }
}
