<?php

use App\Enums\PlacementAlgorithm;
use App\Enums\RegistrationSessionStatus;
use App\Models\RegistrationSession;
use App\Models\Track;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('registration session defaults to global balance placement algorithm', function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $user = User::factory()->create();
    $track = Track::create([
        'name' => 'Test Track',
        'description' => 'Test Description',
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->post(route('admin.registration-sessions.store'), [
        'name' => 'Test Registration Session',
        'description' => 'Test Description',
        'start_date' => now()->addDay()->format('Y-m-d H:i:s'),
        'end_date' => now()->addDays(7)->format('Y-m-d H:i:s'),
        'tracks' => [$track->id],
        'classes' => [
            $track->id => [
                ['id' => 'class_1', 'name' => 'Class A', 'quota' => 30],
            ],
        ],
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('registration_sessions', [
        'name' => 'Test Registration Session',
        'placement_algorithm' => PlacementAlgorithm::GlobalBalance->value,
    ]);
});

test('admin can update placement algorithm before placement starts', function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $user = User::factory()->create();
    $session = RegistrationSession::factory()->closed()->create([
        'placement_algorithm' => PlacementAlgorithm::GlobalBalance->value,
    ]);

    $response = $this->actingAs($user)->put(
        route('admin.registration-sessions.update-placement-algorithm', $session->id),
        ['placement_algorithm' => PlacementAlgorithm::GlobalBalance->value]
    );

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect($session->fresh()->placement_algorithm)->toBe(PlacementAlgorithm::GlobalBalance->value);
});

test('admin cannot update placement algorithm after placement starts', function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $user = User::factory()->create();
    $session = RegistrationSession::factory()->create([
        'status' => RegistrationSessionStatus::Placement,
        'placement_algorithm' => PlacementAlgorithm::GlobalBalance->value,
    ]);

    $response = $this->actingAs($user)->put(
        route('admin.registration-sessions.update-placement-algorithm', $session->id),
        ['placement_algorithm' => PlacementAlgorithm::GlobalBalance->value]
    );

    $response->assertSessionHasErrors('status');
});

test('admin cannot save unsupported placement algorithm', function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $user = User::factory()->create();
    $session = RegistrationSession::factory()->closed()->create();

    $response = $this->actingAs($user)->put(
        route('admin.registration-sessions.update-placement-algorithm', $session->id),
        ['placement_algorithm' => 'unknown_algorithm']
    );

    $response->assertSessionHasErrors('placement_algorithm');
});
