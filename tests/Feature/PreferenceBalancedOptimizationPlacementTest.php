<?php

use App\Enums\PlacementAlgorithm;
use App\Models\Classes;
use App\Models\RegistrationSession;
use App\Models\RegistrationSessionTrack;
use App\Models\Student;
use App\Models\Track;
use App\Services\PlacementService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createOptimizedTrack(RegistrationSession $session, string $name, int $quota): RegistrationSessionTrack
{
    $track = Track::create([
        'name' => $name,
        'description' => "{$name} description",
        'is_active' => true,
    ]);

    $sessionTrack = $session->tracks()->create([
        'track_id' => $track->id,
        'name' => $track->name,
        'description' => $track->description,
    ]);

    $sessionTrack->classes()->create([
        'name' => "{$name} 1",
        'quota' => $quota,
        'current_count' => 0,
        'is_active' => true,
    ]);

    return $sessionTrack;
}

function createOptimizedStudent(
    RegistrationSession $session,
    string $matricNumber,
    string $gender,
    string $race,
    array $preferences,
    int $submittedMinutesAgo,
): Student {
    $student = Student::create([
        'registration_session_id' => $session->id,
        'matric_number' => $matricNumber,
        'identification_number' => "ID{$matricNumber}",
        'name' => $matricNumber,
        'gender' => $gender,
        'race' => $race,
        'religion' => 'Religion A',
        'email' => "{$matricNumber}@example.com",
        'phone' => '0100000000',
        'submitted_at' => now()->subMinutes($submittedMinutesAgo),
        'is_submitted' => true,
    ]);

    foreach ($preferences as $priority => $sessionTrack) {
        $student->preferences()->create([
            'registration_session_track_id' => $sessionTrack->id,
            'priority' => $priority,
        ]);
    }

    return $student;
}

test('preference balanced optimization does not allocate by first come first served', function () {
    $session = RegistrationSession::factory()->create([
        'placement_algorithm' => PlacementAlgorithm::PreferenceBalancedOptimization->value,
    ]);

    $network = createOptimizedTrack($session, 'Network', 1);
    $is = createOptimizedTrack($session, 'IS', 1);

    $laterSubmittedLowerMatric = createOptimizedStudent(
        $session,
        'S001',
        'male',
        'Malay',
        [1 => $network, 2 => $is],
        1,
    );
    $earlierSubmittedHigherMatric = createOptimizedStudent(
        $session,
        'S002',
        'female',
        'Chinese',
        [1 => $network, 2 => $is],
        10,
    );

    $result = app(PlacementService::class)->processSession($session->id);

    expect($result['success'])->toBeTrue();
    expect($result['placed'])->toBe(2);

    expect($laterSubmittedLowerMatric->fresh()->activePlacement->assigned_class_id)
        ->toBe(Classes::where('registration_session_track_id', $network->id)->first()->id);
    expect($laterSubmittedLowerMatric->fresh()->activePlacement->track_priority)->toBe(1);

    expect($earlierSubmittedHigherMatric->fresh()->activePlacement->assigned_class_id)
        ->toBe(Classes::where('registration_session_track_id', $is->id)->first()->id);
    expect($earlierSubmittedHigherMatric->fresh()->activePlacement->track_priority)->toBe(2);
});

test('preference balanced optimization swaps students when balance improves without major preference loss', function () {
    $session = RegistrationSession::factory()->create([
        'placement_algorithm' => PlacementAlgorithm::PreferenceBalancedOptimization->value,
    ]);

    $network = createOptimizedTrack($session, 'Network', 2);
    $is = createOptimizedTrack($session, 'IS', 2);

    createOptimizedStudent($session, 'S001', 'male', 'Malay', [1 => $network, 2 => $is], 4);
    createOptimizedStudent($session, 'S002', 'male', 'Malay', [1 => $network, 2 => $is], 3);
    createOptimizedStudent($session, 'S003', 'female', 'Chinese', [1 => $is, 2 => $network], 2);
    createOptimizedStudent($session, 'S004', 'female', 'Chinese', [1 => $is, 2 => $network], 1);

    $result = app(PlacementService::class)->processSession($session->id);

    expect($result['success'])->toBeTrue();
    expect($result['placed'])->toBe(4);

    $networkClassId = Classes::where('registration_session_track_id', $network->id)->first()->id;
    $isClassId = Classes::where('registration_session_track_id', $is->id)->first()->id;

    $networkStudents = Student::whereHas('activePlacement', fn ($query) => $query->where('assigned_class_id', $networkClassId))->get();
    $isStudents = Student::whereHas('activePlacement', fn ($query) => $query->where('assigned_class_id', $isClassId))->get();

    expect($networkStudents->countBy('gender')->all())->toBe(['male' => 1, 'female' => 1]);
    expect($isStudents->countBy('gender')->all())->toBe(['male' => 1, 'female' => 1]);
    expect($networkStudents->countBy('race')->all())->toBe(['Malay' => 1, 'Chinese' => 1]);
    expect($isStudents->countBy('race')->all())->toBe(['Malay' => 1, 'Chinese' => 1]);
});
