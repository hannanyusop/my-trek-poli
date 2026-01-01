<?php

namespace App\Services;

use App\Models\Classes;
use App\Models\Placement;
use App\Models\PlacementLog;
use App\Models\RegistrationSession;
use App\Models\Student;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlacementService
{
    private array $targetProportions = [];

    private array $classDistributions = [];

    private float $idealClassSize = 0;

    private int $totalClasses = 0;

    private int $totalProcessed = 0;

    private int $totalPlaced = 0;

    private int $totalFlagged = 0;

    public function processSession(int $sessionId): array
    {
        DB::beginTransaction();

        try {
            $session = RegistrationSession::findOrFail($sessionId);

            // Get all submitted students ordered by submission time (FCFS)
            $students = Student::where('registration_session_id', $sessionId)
                ->where('is_submitted', true)
                ->orderBy('submitted_at', 'asc')
                ->with('preferences.registrationSessionTrack')
                ->get();

            $totalStudents = $students->count();

            if ($totalStudents === 0) {
                DB::commit();

                return [
                    'success' => true,
                    'placed' => 0,
                    'flagged' => 0,
                    'total' => 0,
                    'message' => 'No students to process.',
                ];
            }

            // Calculate target proportions from total population
            $this->calculateTargetProportions($students);

            // Initialize class distributions tracking (includes ideal class size calculation)
            $this->initializeClassDistributions($sessionId, $totalStudents);

            // Process each student
            foreach ($students as $student) {
                $this->updateProgress($sessionId, ++$this->totalProcessed, $totalStudents);

                $this->processStudent($student, $sessionId);
            }

            DB::commit();

            // Clear progress cache
            Cache::forget("placement_progress_{$sessionId}");

            return [
                'success' => true,
                'placed' => $this->totalPlaced,
                'flagged' => $this->totalFlagged,
                'total' => $totalStudents,
                'message' => "Placement complete. {$this->totalPlaced} placed, {$this->totalFlagged} flagged for review.",
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Placement processing error', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Placement failed: '.$e->getMessage(),
            ];
        }
    }

    private function processStudent(Student $student, int $sessionId): void
    {
        // Get ALL active classes in the session with available capacity (global balance)
        $classes = Classes::whereHas('registrationSessionTrack', function ($query) use ($sessionId) {
            $query->where('registration_session_id', $sessionId);
        })
            ->where('is_active', true)
            ->with('registrationSessionTrack')
            ->get()
            ->filter(function ($class) {
                $assignedCount = $this->classDistributions[$class->id]['count'] ?? 0;

                return $assignedCount < $class->quota;
            });

        if ($classes->isEmpty()) {
            $this->flagStudent($student, 'No available classes with capacity', $sessionId);

            return;
        }

        // Find the best class based on balance score (globally across all classes)
        $bestClass = null;
        $bestScore = PHP_FLOAT_MAX;

        foreach ($classes as $class) {
            $score = $this->getClassBalanceScore($class, $student);

            if ($score < $bestScore) {
                $bestScore = $score;
                $bestClass = $class;
            }
        }

        if ($bestClass) {
            // Calculate track priority for logging (if student had this track in preferences)
            $trackId = $bestClass->registrationSessionTrack->track_id ?? null;
            $preferences = $student->preferences()->with('registrationSessionTrack')->get();
            $preference = $preferences->first(fn ($p) => $p->registrationSessionTrack?->track_id === $trackId);
            $priority = $preference?->priority;

            $this->assignStudentToClass($student, $bestClass, $priority, $sessionId);
            $this->totalPlaced++;
        } else {
            $this->flagStudent($student, 'No suitable class found', $sessionId);
        }
    }

    private function assignStudentToClass(Student $student, Classes $class, ?int $priority, int $sessionId): void
    {
        // Deactivate any existing active placement
        Placement::where('student_id', $student->id)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        // Create new placement
        $placement = Placement::create([
            'student_id' => $student->id,
            'assigned_class_id' => $class->id,
            'placement_status' => 'placed',
            'placement_notes' => null,
            'track_priority' => $priority,
            'assigned_by' => 'system',
            'assigned_at' => now(),
            'is_active' => true,
        ]);

        // Update class distribution tracking
        if (! isset($this->classDistributions[$class->id])) {
            $this->initializeClassDistribution($class);
        }

        $this->classDistributions[$class->id]['count']++;
        $this->classDistributions[$class->id]['genders'][$student->gender] =
            ($this->classDistributions[$class->id]['genders'][$student->gender] ?? 0) + 1;
        $this->classDistributions[$class->id]['races'][$student->race] =
            ($this->classDistributions[$class->id]['races'][$student->race] ?? 0) + 1;

        // Log the placement
        PlacementLog::create([
            'placement_id' => $placement->id,
            'registration_session_id' => $sessionId,
            'student_id' => $student->id,
            'class_id' => $class->id,
            'track_priority' => $priority,
            'action' => 'auto_assigned',
            'balance_metrics' => $this->classDistributions[$class->id],
            'notes' => "Auto-assigned to {$class->name} using priority {$priority}",
        ]);
    }

    private function flagStudent(Student $student, string $reason, int $sessionId): void
    {
        // Deactivate any existing active placement
        Placement::where('student_id', $student->id)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        // Create flagged placement
        $placement = Placement::create([
            'student_id' => $student->id,
            'assigned_class_id' => null,
            'placement_status' => 'flagged',
            'placement_notes' => $reason,
            'track_priority' => null,
            'assigned_by' => 'system',
            'assigned_at' => now(),
            'is_active' => true,
        ]);

        PlacementLog::create([
            'placement_id' => $placement->id,
            'registration_session_id' => $sessionId,
            'student_id' => $student->id,
            'action' => 'flagged',
            'notes' => $reason,
        ]);

        $this->totalFlagged++;
    }

    private function calculateTargetProportions(Collection $students): void
    {
        $total = $students->count();

        // Gender proportions
        $genderCounts = $students->countBy('gender');
        $this->targetProportions['genders'] = $genderCounts->map(fn ($count) => $count / $total)->toArray();

        // Race proportions
        $raceCounts = $students->countBy('race');
        $this->targetProportions['races'] = $raceCounts->map(fn ($count) => $count / $total)->toArray();
    }

    private function initializeClassDistributions(int $sessionId, int $totalStudents): void
    {
        $classes = Classes::whereHas('registrationSessionTrack', function ($query) use ($sessionId) {
            $query->where('registration_session_id', $sessionId);
        })->where('is_active', true)->get();

        $this->totalClasses = $classes->count();

        // Calculate ideal class size for balancing across all tracks
        $this->idealClassSize = $this->totalClasses > 0
            ? $totalStudents / $this->totalClasses
            : 0;

        foreach ($classes as $class) {
            $this->initializeClassDistribution($class);
        }
    }

    private function initializeClassDistribution(Classes $class): void
    {
        $this->classDistributions[$class->id] = [
            'count' => 0,
            'genders' => [],
            'races' => [],
        ];
    }

    private function getClassBalanceScore(Classes $class, Student $student): float
    {
        if (! isset($this->classDistributions[$class->id])) {
            $this->initializeClassDistribution($class);
        }

        $distribution = $this->classDistributions[$class->id];
        $currentCount = $distribution['count'];
        $projectedCount = $currentCount + 1;

        // Prefer classes with fewer students for even distribution
        // Lower count = lower score = better (e.g., 18 students / 2 classes = 9 each)
        // Use currentCount directly to balance by count, not by fill percentage
        $sizeDeviation = $currentCount;

        if ($currentCount === 0) {
            // First student in class - only consider size balance
            return $sizeDeviation * 0.7;
        }

        // Calculate projected gender distribution
        $projectedGenderCount = ($distribution['genders'][$student->gender] ?? 0) + 1;
        $projectedGenderProportion = $projectedGenderCount / $projectedCount;
        $targetGenderProportion = $this->targetProportions['genders'][$student->gender] ?? 0;
        $genderDeviation = abs($projectedGenderProportion - $targetGenderProportion);

        // Calculate projected race distribution
        $projectedRaceCount = ($distribution['races'][$student->race] ?? 0) + 1;
        $projectedRaceProportion = $projectedRaceCount / $projectedCount;
        $targetRaceProportion = $this->targetProportions['races'][$student->race] ?? 0;
        $raceDeviation = abs($projectedRaceProportion - $targetRaceProportion);

        // Combined score (lower is better)
        // Weights: Class size 70% (primary), Gender 15%, Race 15%
        // Size is prioritized to ensure balanced student counts across classes
        return ($sizeDeviation * 0.7) + ($genderDeviation * 0.15) + ($raceDeviation * 0.15);
    }

    private function updateProgress(int $sessionId, int $processed, int $total): void
    {
        Cache::put("placement_progress_{$sessionId}", [
            'processed' => $processed,
            'total' => $total,
            'percentage' => round(($processed / $total) * 100, 2),
            'flagged' => $this->totalFlagged,
        ], now()->addMinutes(60));
    }

    public function getProgress(int $sessionId): ?array
    {
        return Cache::get("placement_progress_{$sessionId}");
    }

    /**
     * Clear all placements for a session and re-run the placement process.
     */
    public function regenerateSession(int $sessionId): array
    {
        // Clear all existing active placements for this session
        $this->clearSessionPlacements($sessionId);

        // Re-run the placement process
        return $this->processSession($sessionId);
    }

    /**
     * Clear all active placements for a session.
     */
    public function clearSessionPlacements(int $sessionId): void
    {
        // First, delete all inactive placements to avoid unique constraint violation
        // (student_id, is_active) must be unique
        Placement::whereHas('student', function ($query) use ($sessionId) {
            $query->where('registration_session_id', $sessionId);
        })
            ->where('is_active', false)
            ->delete();

        // Now deactivate all active placements for this session
        Placement::whereHas('student', function ($query) use ($sessionId) {
            $query->where('registration_session_id', $sessionId);
        })
            ->where('is_active', true)
            ->update(['is_active' => false]);

        // Log the clear action
        PlacementLog::create([
            'registration_session_id' => $sessionId,
            'student_id' => null,
            'action' => 'cleared',
            'notes' => 'All placements cleared for regeneration',
        ]);
    }
}
