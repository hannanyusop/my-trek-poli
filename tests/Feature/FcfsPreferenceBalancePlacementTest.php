<?php

use App\Enums\PlacementAlgorithm;
use App\Models\Placement;
use App\Models\RegistrationSession;
use App\Models\Student;
use App\Models\Track;
use App\Services\PlacementService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createTrack(string $name): Track
{
    return Track::create([
        'name' => $name,
        'description' => "{$name} description",
        'is_active' => true,
    ]);
}

test('fcfs preference balance gives first submitted student their first choice when available', function () {
    $session = RegistrationSession::factory()->create([
        'placement_algorithm' => PlacementAlgorithm::FcfsPreferenceBalance->value,
    ]);

    $trackA = createTrack('Track A');
    $trackB = createTrack('Track B');

    $sessionTrackA = $session->tracks()->create([
        'track_id' => $trackA->id,
        'name' => $trackA->name,
        'description' => $trackA->description,
    ]);
    $sessionTrackB = $session->tracks()->create([
        'track_id' => $trackB->id,
        'name' => $trackB->name,
        'description' => $trackB->description,
    ]);

    $classA = $sessionTrackA->classes()->create([
        'name' => 'A1',
        'quota' => 1,
        'current_count' => 0,
        'is_active' => true,
    ]);
    $classB = $sessionTrackB->classes()->create([
        'name' => 'B1',
        'quota' => 1,
        'current_count' => 0,
        'is_active' => true,
    ]);

    $firstStudent = Student::create([
        'registration_session_id' => $session->id,
        'matric_number' => 'S001',
        'identification_number' => 'ID001',
        'name' => 'First Student',
        'gender' => 'male',
        'race' => 'Race A',
        'religion' => 'Religion A',
        'email' => 'first@example.com',
        'phone' => '0100000001',
        'submitted_at' => now()->subMinutes(2),
        'is_submitted' => true,
    ]);
    $secondStudent = Student::create([
        'registration_session_id' => $session->id,
        'matric_number' => 'S002',
        'identification_number' => 'ID002',
        'name' => 'Second Student',
        'gender' => 'female',
        'race' => 'Race B',
        'religion' => 'Religion B',
        'email' => 'second@example.com',
        'phone' => '0100000002',
        'submitted_at' => now()->subMinute(),
        'is_submitted' => true,
    ]);

    foreach ([$firstStudent, $secondStudent] as $student) {
        $student->preferences()->create([
            'registration_session_track_id' => $sessionTrackA->id,
            'priority' => 1,
        ]);
        $student->preferences()->create([
            'registration_session_track_id' => $sessionTrackB->id,
            'priority' => 2,
        ]);
    }

    $result = app(PlacementService::class)->processSession($session->id);

    expect($result['success'])->toBeTrue();
    expect($result['placed'])->toBe(2);

    expect($firstStudent->fresh()->activePlacement->assigned_class_id)->toBe($classA->id);
    expect($firstStudent->fresh()->activePlacement->track_priority)->toBe(1);
    expect($secondStudent->fresh()->activePlacement->assigned_class_id)->toBe($classB->id);
    expect($secondStudent->fresh()->activePlacement->track_priority)->toBe(2);
});

test('fcfs preference balance flags student when all preferred tracks are full', function () {
    $session = RegistrationSession::factory()->create([
        'placement_algorithm' => PlacementAlgorithm::FcfsPreferenceBalance->value,
    ]);

    $track = createTrack('Track A');
    $sessionTrack = $session->tracks()->create([
        'track_id' => $track->id,
        'name' => $track->name,
        'description' => $track->description,
    ]);

    $sessionTrack->classes()->create([
        'name' => 'A1',
        'quota' => 1,
        'current_count' => 0,
        'is_active' => true,
    ]);

    $students = collect([
        ['S001', 'ID001', now()->subMinutes(2)],
        ['S002', 'ID002', now()->subMinute()],
    ])->map(function (array $data) use ($session, $sessionTrack) {
        $student = Student::create([
            'registration_session_id' => $session->id,
            'matric_number' => $data[0],
            'identification_number' => $data[1],
            'name' => $data[0],
            'gender' => 'male',
            'race' => 'Race A',
            'religion' => 'Religion A',
            'email' => "{$data[0]}@example.com",
            'phone' => '0100000000',
            'submitted_at' => $data[2],
            'is_submitted' => true,
        ]);

        $student->preferences()->create([
            'registration_session_track_id' => $sessionTrack->id,
            'priority' => 1,
        ]);

        return $student;
    });

    $result = app(PlacementService::class)->processSession($session->id);

    expect($result['success'])->toBeTrue();
    expect($result['placed'])->toBe(1);
    expect($result['flagged'])->toBe(1);

    $secondPlacement = Placement::where('student_id', $students[1]->id)->where('is_active', true)->first();

    expect($secondPlacement->placement_status)->toBe('flagged');
    expect($secondPlacement->placement_notes)->toBe('All preferred tracks are full or unavailable');
});
