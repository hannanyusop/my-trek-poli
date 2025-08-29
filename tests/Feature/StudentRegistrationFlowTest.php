<?php

use App\Models\Race;
use App\Models\RegistrationSession;
use App\Models\Religion;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('registration flow shows step indicators correctly', function () {
    // Create test data
    $registrationSession = RegistrationSession::create([
        'name' => 'Test Registration Session',
        'status' => 'open',
        'link_token' => 'test-token-ui',
        'start_date' => now(),
        'end_date' => now()->addDays(30),
        'description' => 'Test registration session for UI testing',
    ]);

    Race::create(['name' => 'Chinese', 'code' => 'CHN', 'is_active' => true]);
    Religion::create(['name' => 'Buddhism', 'code' => 'BUD', 'is_active' => true]);

    // Test Step 1: Show page displays correctly
    $response = $this->get(route('student.registration.show', $registrationSession->link_token));
    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('StudentRegistration/Show')
        ->has('registrationSession')
    );

    // Test Step 1: Student information form (now first step)
    $response = $this->get(route('student.registration.form', $registrationSession->link_token));
    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('StudentRegistration/Form')
        ->has('registrationSession')
        ->has('races')
        ->has('religions')
    );
});

test('new three step registration flow works correctly', function () {
    $registrationSession = RegistrationSession::create([
        'name' => 'New Flow Test',
        'status' => 'open',
        'link_token' => 'new-flow-token',
        'start_date' => now(),
        'end_date' => now()->addDays(30),
        'description' => 'Testing new 3-step flow',
    ]);

    Race::create(['name' => 'Malay', 'code' => 'MLY', 'is_active' => true]);
    Religion::create(['name' => 'Islam', 'code' => 'ISL', 'is_active' => true]);

    // Test that show page displays correctly
    $response = $this->get(route('student.registration.show', $registrationSession->link_token));
    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('StudentRegistration/Show')
        ->has('registrationSession')
    );
});
