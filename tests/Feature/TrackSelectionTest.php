<?php

use App\Models\RegistrationSession;
use App\Models\RegistrationSessionTrack;
use App\Models\Student;
use App\Models\Track;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('track selection validation requires all tracks to be selected', function () {
    // Create test data manually
    $registrationSession = RegistrationSession::create([
        'name' => 'Test Session',
        'status' => 'open',
        'link_token' => 'test-token-123',
        'start_date' => now(),
        'end_date' => now()->addDays(30),
        'description' => 'Test description',
    ]);
    
    $student = Student::create([
        'registration_session_id' => $registrationSession->id,
        'matric_number' => 'TEST001',
        'identification_number' => '123456789012',
        'name' => 'Test Student',
        'gender' => 'male',
        'race' => 'chinese',
        'religion' => 'buddhism',
        'email' => 'test@example.com',
        'phone' => '0123456789',
        'is_submitted' => false,
    ]);
    
    // Create tracks
    $track1 = Track::create(['name' => 'Track 1', 'description' => 'Description 1', 'is_active' => true]);
    $track2 = Track::create(['name' => 'Track 2', 'description' => 'Description 2', 'is_active' => true]);
    $track3 = Track::create(['name' => 'Track 3', 'description' => 'Description 3', 'is_active' => true]);
    
    // Create registration session tracks
    $sessionTrack1 = RegistrationSessionTrack::create([
        'registration_session_id' => $registrationSession->id,
        'track_id' => $track1->id,
        'name' => 'Track 1',
        'description' => 'Description 1',
    ]);
    
    $sessionTrack2 = RegistrationSessionTrack::create([
        'registration_session_id' => $registrationSession->id,
        'track_id' => $track2->id,
        'name' => 'Track 2',
        'description' => 'Description 2',
    ]);
    
    $sessionTrack3 = RegistrationSessionTrack::create([
        'registration_session_id' => $registrationSession->id,
        'track_id' => $track3->id,
        'name' => 'Track 3',
        'description' => 'Description 3',
    ]);
    
    // Start session with student
    session(['student_id' => $student->id]);
    
    // Try to submit with only 2 out of 3 tracks - should fail
    $response = $this->post(route('student.registration.store.tracks', $registrationSession->link_token), [
        'preferences' => [
            $sessionTrack1->id,
            $sessionTrack2->id,
        ],
    ]);
    
    $response->assertSessionHasErrors('preferences');
});

test('track selection succeeds when all tracks are selected', function () {
    // Create test data manually
    $registrationSession = RegistrationSession::create([
        'name' => 'Test Session',
        'status' => 'open',
        'link_token' => 'test-token-456',
        'start_date' => now(),
        'end_date' => now()->addDays(30),
        'description' => 'Test description',
    ]);
    
    $student = Student::create([
        'registration_session_id' => $registrationSession->id,
        'matric_number' => 'TEST002',
        'identification_number' => '123456789013',
        'name' => 'Test Student 2',
        'gender' => 'female',
        'race' => 'malay',
        'religion' => 'islam',
        'email' => 'test2@example.com',
        'phone' => '0123456788',
        'is_submitted' => false,
    ]);
    
    // Create tracks
    $track1 = Track::create(['name' => 'Track A', 'description' => 'Description A', 'is_active' => true]);
    $track2 = Track::create(['name' => 'Track B', 'description' => 'Description B', 'is_active' => true]);
    $track3 = Track::create(['name' => 'Track C', 'description' => 'Description C', 'is_active' => true]);
    
    // Create registration session tracks
    $sessionTrack1 = RegistrationSessionTrack::create([
        'registration_session_id' => $registrationSession->id,
        'track_id' => $track1->id,
        'name' => 'Track A',
        'description' => 'Description A',
    ]);
    
    $sessionTrack2 = RegistrationSessionTrack::create([
        'registration_session_id' => $registrationSession->id,
        'track_id' => $track2->id,
        'name' => 'Track B',
        'description' => 'Description B',
    ]);
    
    $sessionTrack3 = RegistrationSessionTrack::create([
        'registration_session_id' => $registrationSession->id,
        'track_id' => $track3->id,
        'name' => 'Track C',
        'description' => 'Description C',
    ]);
    
    // Start session with student
    session(['student_id' => $student->id]);
    
    // Submit with all 3 tracks - should succeed
    $response = $this->post(route('student.registration.store.tracks', $registrationSession->link_token), [
        'preferences' => [
            $sessionTrack1->id,
            $sessionTrack2->id,
            $sessionTrack3->id,
        ],
    ]);
    
    $response->assertOk();
    
    // Verify student was marked as submitted
    expect($student->fresh()->is_submitted)->toBeTrue();
    expect($student->fresh()->submitted_at)->not->toBeNull();
});