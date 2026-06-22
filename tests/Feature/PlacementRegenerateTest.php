<?php

use App\Enums\RegistrationSessionStatus;
use App\Jobs\ProcessPlacementJob;
use App\Models\RegistrationSession;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

test('admin can queue placement regeneration before results are published', function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
    Queue::fake();

    $user = User::factory()->create();
    $session = RegistrationSession::factory()->create([
        'status' => RegistrationSessionStatus::Placement,
    ]);

    $response = $this->actingAs($user)
        ->post(route('admin.registration-sessions.placement.regenerate', $session->id));

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Placement rerun has been queued. This may take a few minutes.');

    expect($session->fresh()->status)->toBe(RegistrationSessionStatus::Processing);

    Queue::assertPushed(ProcessPlacementJob::class, function (ProcessPlacementJob $job) use ($session) {
        return $job->sessionId === $session->id && $job->regenerate === true;
    });
});

test('admin cannot regenerate placements after results are published', function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
    Queue::fake();

    $user = User::factory()->create();
    $session = RegistrationSession::factory()->create([
        'status' => RegistrationSessionStatus::Published,
    ]);

    $response = $this->actingAs($user)
        ->post(route('admin.registration-sessions.placement.regenerate', $session->id));

    $response->assertSessionHasErrors('error');
    Queue::assertNothingPushed();
});
