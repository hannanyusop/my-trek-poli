<?php

namespace App\Services;

use App\Enums\PlacementAlgorithm;
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

    /**
     * Ideal target size for each class, considering quotas.
     *
     * @var array<int, float>
     */
    private array $idealClassSizes = [];

    private int $totalClasses = 0;

    private int $totalProcessed = 0;

    private int $totalPlaced = 0;

    private int $totalFlagged = 0;

    private string $currentAlgorithm = '';

    public function processSession(int $sessionId): array
    {
        $this->resetRunState();

        DB::beginTransaction();

        try {
            $session = RegistrationSession::findOrFail($sessionId);
            $algorithm = PlacementAlgorithm::tryFrom($session->placement_algorithm ?? PlacementAlgorithm::GlobalBalance->value);

            if (! $algorithm) {
                DB::rollBack();

                return [
                    'success' => false,
                    'message' => "Unsupported placement algorithm: {$session->placement_algorithm}",
                ];
            }

            $this->currentAlgorithm = $algorithm->value;

            return match ($algorithm) {
                PlacementAlgorithm::GlobalBalance => $this->processGlobalBalanceSession($session),
                PlacementAlgorithm::FcfsPreferenceBalance => $this->processFcfsPreferenceBalanceSession($session),
                PlacementAlgorithm::PreferenceBalancedOptimization => $this->processPreferenceBalancedOptimizationSession($session),
            };

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

    private function processGlobalBalanceSession(RegistrationSession $session): array
    {
        $sessionId = $session->id;

        try {
            // Get all submitted students ordered by submission time (FCFS)
            $students = Student::where('registration_session_id', $sessionId)
                ->where('is_submitted', true)
                ->orderBy('submitted_at', 'asc')
                ->orderBy('id', 'asc')
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

    private function processFcfsPreferenceBalanceSession(RegistrationSession $session): array
    {
        $sessionId = $session->id;

        try {
            $students = Student::where('registration_session_id', $sessionId)
                ->where('is_submitted', true)
                ->orderBy('submitted_at', 'asc')
                ->orderBy('id', 'asc')
                ->with([
                    'preferences' => fn ($query) => $query->orderBy('priority', 'asc'),
                    'preferences.registrationSessionTrack',
                ])
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

            $this->calculateTargetProportions($students);
            $this->initializeClassDistributions($sessionId, $totalStudents);

            foreach ($students as $student) {
                $this->updateProgress($sessionId, ++$this->totalProcessed, $totalStudents);

                $this->processStudentByPreferences($student, $sessionId);
            }

            DB::commit();

            Cache::forget("placement_progress_{$sessionId}");

            return [
                'success' => true,
                'placed' => $this->totalPlaced,
                'flagged' => $this->totalFlagged,
                'total' => $totalStudents,
                'message' => "Placement complete using {$this->currentAlgorithm}. {$this->totalPlaced} placed, {$this->totalFlagged} flagged for review.",
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Placement processing error', [
                'session_id' => $sessionId,
                'algorithm' => $this->currentAlgorithm,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Placement failed: '.$e->getMessage(),
            ];
        }
    }

    private function processPreferenceBalancedOptimizationSession(RegistrationSession $session): array
    {
        $sessionId = $session->id;

        try {
            $students = Student::where('registration_session_id', $sessionId)
                ->where('is_submitted', true)
                ->orderBy('matric_number', 'asc')
                ->orderBy('id', 'asc')
                ->with([
                    'preferences' => fn ($query) => $query->orderBy('priority', 'asc'),
                    'preferences.registrationSessionTrack',
                ])
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

            $tracks = $this->getTrackCapacities($sessionId);

            if ($tracks->isEmpty()) {
                foreach ($students as $student) {
                    $this->flagStudent($student, 'No active tracks with class capacity', $sessionId);
                }

                DB::commit();
                Cache::forget("placement_progress_{$sessionId}");

                return [
                    'success' => true,
                    'placed' => 0,
                    'flagged' => $this->totalFlagged,
                    'total' => $totalStudents,
                    'message' => "Placement complete using {$this->currentAlgorithm}. 0 placed, {$this->totalFlagged} flagged for review.",
                ];
            }

            $this->calculateTargetProportions($students);
            $this->initializeClassDistributions($sessionId, $totalStudents);

            $assignments = $this->buildInitialTrackAssignments($students, $tracks->toArray(), $sessionId);
            $assignments = $this->optimizeTrackAssignments($students, $assignments, $tracks->toArray());

            foreach ($students as $student) {
                $this->updateProgress($sessionId, ++$this->totalProcessed, $totalStudents);

                $assignment = $assignments[$student->id] ?? null;

                if (! $assignment) {
                    continue;
                }

                $bestClass = $this->selectBestClassInTrack($assignment['track_id'], $student);

                if (! $bestClass) {
                    $this->flagStudent($student, 'No class capacity available in assigned track', $sessionId);

                    continue;
                }

                $this->assignStudentToClass($student, $bestClass, $assignment['priority'], $sessionId);
                $this->totalPlaced++;
            }

            DB::commit();
            Cache::forget("placement_progress_{$sessionId}");

            return [
                'success' => true,
                'placed' => $this->totalPlaced,
                'flagged' => $this->totalFlagged,
                'total' => $totalStudents,
                'message' => "Placement complete using {$this->currentAlgorithm}. {$this->totalPlaced} placed, {$this->totalFlagged} flagged for review.",
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Placement processing error', [
                'session_id' => $sessionId,
                'algorithm' => $this->currentAlgorithm,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Placement failed: '.$e->getMessage(),
            ];
        }
    }

    private function getTrackCapacities(int $sessionId): Collection
    {
        return Classes::whereHas('registrationSessionTrack', function ($query) use ($sessionId) {
            $query->where('registration_session_id', $sessionId);
        })
            ->where('is_active', true)
            ->with('registrationSessionTrack')
            ->get()
            ->groupBy('registration_session_track_id')
            ->map(fn (Collection $classes, int $trackId) => [
                'track_id' => $trackId,
                'capacity' => $classes->sum('quota'),
                'assigned' => 0,
            ])
            ->filter(fn (array $track) => $track['capacity'] > 0)
            ->sortKeys()
            ->values()
            ->keyBy('track_id');
    }

    private function buildInitialTrackAssignments(Collection $students, array $tracks, int $sessionId): array
    {
        $assignments = [];
        $trackCounts = array_map(fn (array $track) => $track['assigned'], $tracks);
        $studentsById = $students->keyBy('id');

        for ($priority = 1; $priority <= 3; $priority++) {
            foreach ($students as $student) {
                if (isset($assignments[$student->id])) {
                    continue;
                }

                $preference = $student->preferences
                    ->first(fn ($item) => $item->priority === $priority && $item->registrationSessionTrack !== null);

                if (! $preference) {
                    continue;
                }

                $trackId = $preference->registration_session_track_id;

                if (! isset($tracks[$trackId])) {
                    continue;
                }

                if (($trackCounts[$trackId] ?? 0) >= $tracks[$trackId]['capacity']) {
                    continue;
                }

                $assignments[$student->id] = [
                    'student_id' => $student->id,
                    'track_id' => $trackId,
                    'priority' => $priority,
                    'preference_score' => $this->preferenceScore($priority),
                ];
                $trackCounts[$trackId]++;
            }
        }

        foreach ($studentsById as $student) {
            if (! isset($assignments[$student->id])) {
                $this->flagStudent($student, 'All preferred tracks are full or unavailable', $sessionId);
            }
        }

        return $assignments;
    }

    private function optimizeTrackAssignments(Collection $students, array $assignments, array $tracks): array
    {
        $studentsById = $students->keyBy('id');
        $maxIterations = max(1, count($assignments) * count($assignments));
        $iteration = 0;

        do {
            $improved = false;
            $currentScore = $this->getSystemTrackScore($studentsById, $assignments, $tracks);
            $currentGenderDeviation = $this->getTrackBalanceDeviation($studentsById, $assignments, 'gender');
            $currentRaceDeviation = $this->getTrackBalanceDeviation($studentsById, $assignments, 'race');
            $studentIds = collect(array_keys($assignments))->sort()->values()->all();

            foreach ($studentIds as $leftId) {
                foreach ($studentIds as $rightId) {
                    if ($leftId >= $rightId) {
                        continue;
                    }

                    if ($assignments[$leftId]['track_id'] === $assignments[$rightId]['track_id']) {
                        continue;
                    }

                    $leftStudent = $studentsById[$leftId] ?? null;
                    $rightStudent = $studentsById[$rightId] ?? null;

                    if (! $leftStudent || ! $rightStudent) {
                        continue;
                    }

                    $leftNewPriority = $this->priorityForTrack($leftStudent, $assignments[$rightId]['track_id']);
                    $rightNewPriority = $this->priorityForTrack($rightStudent, $assignments[$leftId]['track_id']);

                    if ($leftNewPriority === null || $rightNewPriority === null) {
                        continue;
                    }

                    $newPreferenceTotal = $this->preferenceScore($leftNewPriority) + $this->preferenceScore($rightNewPriority);
                    $oldPreferenceTotal = $assignments[$leftId]['preference_score'] + $assignments[$rightId]['preference_score'];

                    if (($oldPreferenceTotal - $newPreferenceTotal) > 80) {
                        continue;
                    }

                    $candidate = $assignments;
                    $candidate[$leftId] = [
                        ...$candidate[$leftId],
                        'track_id' => $assignments[$rightId]['track_id'],
                        'priority' => $leftNewPriority,
                        'preference_score' => $this->preferenceScore($leftNewPriority),
                    ];
                    $candidate[$rightId] = [
                        ...$candidate[$rightId],
                        'track_id' => $assignments[$leftId]['track_id'],
                        'priority' => $rightNewPriority,
                        'preference_score' => $this->preferenceScore($rightNewPriority),
                    ];

                    $candidateGenderDeviation = $this->getTrackBalanceDeviation($studentsById, $candidate, 'gender');
                    $candidateRaceDeviation = $this->getTrackBalanceDeviation($studentsById, $candidate, 'race');

                    if ($candidateGenderDeviation > $currentGenderDeviation + 0.000001) {
                        continue;
                    }

                    if ($candidateRaceDeviation > $currentRaceDeviation + 0.000001) {
                        continue;
                    }

                    $candidateScore = $this->getSystemTrackScore($studentsById, $candidate, $tracks);

                    if ($candidateScore <= $currentScore + 0.000001) {
                        continue;
                    }

                    $assignments = $candidate;
                    $improved = true;
                    break 2;
                }
            }

            $iteration++;
        } while ($improved && $iteration < $maxIterations);

        return $assignments;
    }

    private function selectBestClassInTrack(int $trackId, Student $student): ?Classes
    {
        $classes = Classes::where('registration_session_track_id', $trackId)
            ->where('is_active', true)
            ->with('registrationSessionTrack')
            ->orderBy('id', 'asc')
            ->get()
            ->filter(function ($class) {
                $assignedCount = $this->classDistributions[$class->id]['count'] ?? 0;

                return $assignedCount < $class->quota;
            });

        if ($classes->isEmpty()) {
            return null;
        }

        return $this->selectBestBalancedClass($classes, $student);
    }

    private function getSystemTrackScore(Collection $studentsById, array $assignments, array $tracks): float
    {
        $preferenceTotal = collect($assignments)->sum('preference_score');
        $genderScore = $this->balanceScoreFromDeviation($this->getTrackBalanceDeviation($studentsById, $assignments, 'gender'), $tracks);
        $raceScore = $this->balanceScoreFromDeviation($this->getTrackBalanceDeviation($studentsById, $assignments, 'race'), $tracks);
        $assignedCount = max(1, count($assignments));

        return (($preferenceTotal / $assignedCount) * 0.80) + ($genderScore * 0.10) + ($raceScore * 0.10);
    }

    private function balanceScoreFromDeviation(float $deviation, array $tracks): float
    {
        $capacity = max(1, collect($tracks)->sum('capacity'));
        $normalized = min(1, $deviation / $capacity);

        return (1 - $normalized) * 100;
    }

    private function getTrackBalanceDeviation(Collection $studentsById, array $assignments, string $attribute): float
    {
        $totalAssigned = count($assignments);

        if ($totalAssigned === 0) {
            return 0.0;
        }

        $globalCounts = [];
        $trackCounts = [];

        foreach ($assignments as $assignment) {
            $student = $studentsById[$assignment['student_id']] ?? null;

            if (! $student) {
                continue;
            }

            $value = $student->{$attribute} ?: 'Unknown';
            $trackId = $assignment['track_id'];

            $globalCounts[$value] = ($globalCounts[$value] ?? 0) + 1;
            $trackCounts[$trackId]['total'] = ($trackCounts[$trackId]['total'] ?? 0) + 1;
            $trackCounts[$trackId]['values'][$value] = ($trackCounts[$trackId]['values'][$value] ?? 0) + 1;
        }

        $deviation = 0.0;

        foreach ($trackCounts as $track) {
            $trackTotal = $track['total'];

            foreach ($globalCounts as $value => $globalCount) {
                $target = ($globalCount / $totalAssigned) * $trackTotal;
                $actual = $track['values'][$value] ?? 0;
                $deviation += abs($actual - $target);
            }
        }

        return $deviation;
    }

    private function priorityForTrack(Student $student, int $trackId): ?int
    {
        $preference = $student->preferences
            ->first(fn ($item) => $item->registration_session_track_id === $trackId);

        return $preference?->priority;
    }

    private function preferenceScore(?int $priority): int
    {
        return match ($priority) {
            1 => 100,
            2 => 60,
            3 => 30,
            default => 0,
        };
    }

    private function processStudent(Student $student, int $sessionId): void
    {
        // Get ALL active classes in the session with available capacity (global balance)
        $classes = Classes::whereHas('registrationSessionTrack', function ($query) use ($sessionId) {
            $query->where('registration_session_id', $sessionId);
        })
            ->where('is_active', true)
            ->with('registrationSessionTrack')
            ->orderBy('id', 'asc')
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
        $bestClass = $this->selectBestBalancedClass($classes, $student);

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

    private function processStudentByPreferences(Student $student, int $sessionId): void
    {
        $preferences = $student->preferences
            ->filter(fn ($preference) => $preference->registrationSessionTrack !== null)
            ->sortBy('priority')
            ->values();

        if ($preferences->isEmpty()) {
            $this->flagStudent($student, 'No track preferences found', $sessionId);

            return;
        }

        foreach ($preferences as $preference) {
            $classes = Classes::where('registration_session_track_id', $preference->registration_session_track_id)
                ->where('is_active', true)
                ->with('registrationSessionTrack')
                ->orderBy('id', 'asc')
                ->get()
                ->filter(function ($class) {
                    $assignedCount = $this->classDistributions[$class->id]['count'] ?? 0;

                    return $assignedCount < $class->quota;
                });

            if ($classes->isEmpty()) {
                continue;
            }

            $bestClass = $this->selectBestClassBySizeThenBalance($classes, $student);

            if ($bestClass) {
                $this->assignStudentToClass($student, $bestClass, $preference->priority, $sessionId);
                $this->totalPlaced++;

                return;
            }
        }

        $this->flagStudent($student, 'All preferred tracks are full or unavailable', $sessionId);
    }

    private function selectBestBalancedClass(Collection $classes, Student $student): ?Classes
    {
        $bestClass = null;
        $bestScore = PHP_FLOAT_MAX;

        foreach ($classes as $class) {
            $score = $this->getClassBalanceScore($class, $student);

            if ($score < $bestScore || ($score === $bestScore && $bestClass && $class->id < $bestClass->id)) {
                $bestScore = $score;
                $bestClass = $class;
            }
        }

        return $bestClass;
    }

    private function selectBestClassBySizeThenBalance(Collection $classes, Student $student): ?Classes
    {
        $bestClass = null;
        $bestCount = PHP_INT_MAX;
        $bestScore = PHP_FLOAT_MAX;

        foreach ($classes as $class) {
            $count = $this->classDistributions[$class->id]['count'] ?? 0;
            $score = $this->getClassBalanceScore($class, $student);

            if (
                $count < $bestCount
                || ($count === $bestCount && $score < $bestScore)
                || ($count === $bestCount && $score === $bestScore && $bestClass && $class->id < $bestClass->id)
            ) {
                $bestClass = $class;
                $bestCount = $count;
                $bestScore = $score;
            }
        }

        return $bestClass;
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
            'balance_metrics' => [
                ...$this->classDistributions[$class->id],
                'algorithm' => $this->currentAlgorithm,
            ],
            'notes' => "Auto-assigned to {$class->name} using {$this->currentAlgorithm} algorithm with priority {$priority}",
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
            'notes' => "{$reason} using {$this->currentAlgorithm} algorithm",
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

        // Calculate ideal class sizes considering quotas
        // This ensures balanced distribution while respecting quota limits
        $this->calculateIdealClassSizes($classes, $totalStudents);

        foreach ($classes as $class) {
            $this->initializeClassDistribution($class);
        }
    }

    /**
     * Calculate ideal class sizes considering quota limits.
     *
     * Example: 100 students, 4 classes with quotas [30, 30, 30, 20]
     * - Initial ideal: 100/4 = 25 per class
     * - Class D (quota 20) is capped, so it gets 20
     * - Remaining: 80 students for 3 classes = ~27 each
     * - Final: A=27, B=27, C=26, D=20
     */
    private function calculateIdealClassSizes(Collection $classes, int $totalStudents): void
    {
        if ($classes->isEmpty()) {
            return;
        }

        // Build array of class IDs and quotas
        $classData = $classes->mapWithKeys(fn ($c) => [$c->id => $c->quota])->toArray();

        $remainingStudents = $totalStudents;
        $remainingClasses = $classData;

        // Iteratively calculate ideal sizes
        // Classes with quota < ideal get capped, then we redistribute
        while (! empty($remainingClasses)) {
            $idealPerClass = $remainingStudents / count($remainingClasses);
            $cappedThisRound = [];

            foreach ($remainingClasses as $classId => $quota) {
                if ($quota < $idealPerClass) {
                    // This class is capped at its quota
                    $this->idealClassSizes[$classId] = (float) $quota;
                    $remainingStudents -= $quota;
                    $cappedThisRound[] = $classId;
                }
            }

            // Remove capped classes from remaining
            foreach ($cappedThisRound as $classId) {
                unset($remainingClasses[$classId]);
            }

            // If no classes were capped this round, distribute evenly among remaining
            if (empty($cappedThisRound)) {
                $idealPerClass = count($remainingClasses) > 0
                    ? $remainingStudents / count($remainingClasses)
                    : 0;

                foreach ($remainingClasses as $classId => $quota) {
                    $this->idealClassSizes[$classId] = $idealPerClass;
                }
                break;
            }
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

        // Get ideal size for this class (calculated considering quotas)
        $idealSize = $this->idealClassSizes[$class->id] ?? ($this->totalClasses > 0 ? 1 : 0);

        // Calculate how far this class is from its ideal target
        // Classes below their ideal get lower (better) scores
        // This ensures balanced distribution relative to each class's target
        $sizeDeviation = $currentCount - $idealSize;

        // Normalize by ideal size to make comparison fair across classes with different targets
        // A class at 5/10 ideal should score similar to a class at 10/20 ideal
        $normalizedDeviation = $idealSize > 0 ? $sizeDeviation / $idealSize : $sizeDeviation;

        if ($currentCount === 0) {
            // First student in class - strongly prefer empty classes
            // Use negative deviation to prioritize filling empty classes
            return $normalizedDeviation * 0.7;
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
        return ($normalizedDeviation * 0.7) + ($genderDeviation * 0.15) + ($raceDeviation * 0.15);
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

    private function resetRunState(): void
    {
        $this->targetProportions = [];
        $this->classDistributions = [];
        $this->idealClassSizes = [];
        $this->totalClasses = 0;
        $this->totalProcessed = 0;
        $this->totalPlaced = 0;
        $this->totalFlagged = 0;
        $this->currentAlgorithm = '';
    }
}
