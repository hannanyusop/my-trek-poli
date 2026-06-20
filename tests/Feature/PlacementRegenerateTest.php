<?php

use App\Enums\RegistrationSessionStatus;
use App\Models\RegistrationSession;
use App\Models\User;
use App\Services\PlacementService;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can regenerate placements before results are published', function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $user = User::factory()->create();
    $session = RegistrationSession::factory()->create([
        'status' => RegistrationSessionStatus::Placement,
    ]);

    $placementService = \Mockery::mock(PlacementService::class);
    $placementService
        ->shouldReceive('regenerateSession')
        ->once()
        ->with($session->id)
        ->andReturn([
            'success' => true,
            'message' => 'Placements regenerated.',
        ]);

    $this->instance(PlacementService::class, $placementService);

    $response = $this->actingAs($user)
        ->post(route('admin.registration-sessions.placement.regenerate', $session->id));

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Placements regenerated.');
});

test('admin cannot regenerate placements after results are published', function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $user = User::factory()->create();
    $session = RegistrationSession::factory()->create([
        'status' => RegistrationSessionStatus::Published,
    ]);

    $placementService = \Mockery::mock(PlacementService::class);
    $placementService->shouldNotReceive('regenerateSession');

    $this->instance(PlacementService::class, $placementService);

    $response = $this->actingAs($user)
        ->post(route('admin.registration-sessions.placement.regenerate', $session->id));

    $response->assertSessionHasErrors('error');
});
