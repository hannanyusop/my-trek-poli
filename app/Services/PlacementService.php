<?php

namespace App\Services;

use App\Models\Classes;
use App\Models\PlacementLog;
use App\Models\RegistrationSession;
use App\Models\Student;
use App\Models\StudentPreference;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlacementService
{
    private array $targetProportions = [];

    private array $classDistributions = [];

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

            // Initialize class distributions tracking
            $this->initializeClassDistributions($sessionId);

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
        // Get student preferences ordered by priority
        $preferences = $student->preferences()->orderBy('priority', 'asc')->get();

        if ($preferences->isEmpty()) {
            $this->flagStudent($student, 'No preferences found', $sessionId);

            return;
        }

        // Try each preference (1st → 2nd → 3rd)
        foreach ($preferences as $preference) {
            $result = $this->tryAssignToTrack($student, $preference, $sessionId);

            if ($result['success']) {
                $this->totalPlaced++;

                return;
            }
        }

        // If we get here, no assignment was possible
        $this->flagStudent($student, 'All preferred tracks/classes are full or imbalanced', $sessionId);
    }

    private function tryAssignToTrack(Student $student, StudentPreference $preference, int $sessionId): array
    {
        // Get all classes for this track with available capacity
        $classes = Classes::where('registration_session_track_id', $preference->registration_session_track_id)
            ->where('is_active', true)
            ->get()
            ->filter(function ($class) {
                $assignedCount = $this->classDistributions[$class->id]['count'] ?? 0;

                return $assignedCount < $class->quota;
            });

        if ($classes->isEmpty()) {
            return ['success' => false, 'reason' => 'No available classes'];
        }

        // Find the best class based on balance score
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
            $this->assignStudentToClass($student, $bestClass, $preference->priority, $sessionId);

            return ['success' => true];
        }

        return ['success' => false, 'reason' => 'No suitable class found'];
    }

    private function assignStudentToClass(Student $student, Classes $class, int $priority, int $sessionId): void
    {
        // Update student
        $student->update([
            'assigned_class_id' => $class->id,
            'placement_status' => 'placed',
            'placement_notes' => null,
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
        $student->update([
            'placement_status' => 'flagged',
            'placement_notes' => $reason,
        ]);

        PlacementLog::create([
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

    private function initializeClassDistributions(int $sessionId): void
    {
        $classes = Classes::whereHas('registrationSessionTrack', function ($query) use ($sessionId) {
            $query->where('registration_session_id', $sessionId);
        })->get();

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

        if ($currentCount === 0) {
            // First student in class, no imbalance yet
            return 0;
        }

        // Calculate projected count if we add this student
        $projectedCount = $currentCount + 1;

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
        // Weight gender and race equally
        return ($genderDeviation + $raceDeviation) / 2;
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
}
