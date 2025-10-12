<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlacementLog extends Model
{
    const UPDATED_AT = null;

    protected $table = 'placement_audit_logs';

    protected $fillable = [
        'registration_session_id',
        'student_id',
        'class_id',
        'track_priority',
        'action',
        'performed_by_user_id',
        'previous_class_id',
        'notes',
        'balance_metrics',
    ];

    protected function casts(): array
    {
        return [
            'balance_metrics' => 'array',
            'track_priority' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function registrationSession(): BelongsTo
    {
        return $this->belongsTo(RegistrationSession::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }

    public function previousClass(): BelongsTo
    {
        return $this->belongsTo(Classes::class, 'previous_class_id');
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by_user_id');
    }
}
