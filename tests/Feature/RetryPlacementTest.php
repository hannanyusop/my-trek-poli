<?php

use App\Jobs\ProcessPlacementJob;
use App\Models\RegistrationSession;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

test('retry placement requires session to be in processing status', function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
    Queue::fake();

    $user = User::factory()->create();
    $session = RegistrationSession::factory()->closed()->create();

    $response = $this->actingAs($user)
        ->post(route('admin.registration-sessions.retry-placement', $session->id));

    $response->assertSessionHasErrors('status');
    Queue::assertNothingPushed();
});

test('retry placement dispatches job when session is in processing status', function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
    Queue::fake();

    $user = User::factory()->create();
    $session = RegistrationSession::factory()->processing()->create();

    $response = $this->actingAs($user)
        ->post(route('admin.registration-sessions.retry-placement', $session->id));

    $response->assertRedirect();
    $response->assertSessionHas('success');
    Queue::assertPushed(ProcessPlacementJob::class, function ($job) use ($session) {
        return $job->sessionId === $session->id;
    });
});

test('retry placement prevents duplicate jobs when job already pending', function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $user = User::factory()->create();
    $session = RegistrationSession::factory()->processing()->create();

    // Simulate a pending job in the database with the actual Laravel queue payload format
    $job = new ProcessPlacementJob($session->id);
    $payload = json_encode([
        'uuid' => \Illuminate\Support\Str::uuid()->toString(),
        'displayName' => 'App\\Jobs\\ProcessPlacementJob',
        'job' => 'Illuminate\\Queue\\CallQueuedHandler@call',
        'data' => [
            'commandName' => 'App\\Jobs\\ProcessPlacementJob',
            'command' => serialize($job),
        ],
        'timeout' => 600,
        'tries' => 1,
    ]);

    \DB::table('jobs')->insert([
        'queue' => 'default',
        'payload' => $payload,
        'attempts' => 0,
        'available_at' => now()->timestamp,
        'created_at' => now()->timestamp,
    ]);

    $response = $this->actingAs($user)
        ->post(route('admin.registration-sessions.retry-placement', $session->id));

    $response->assertSessionHasErrors('job');
});
