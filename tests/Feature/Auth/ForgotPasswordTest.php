<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

test('forgot password page can be rendered', function () {
    $response = $this->get('/forgot-password');

    $response->assertSuccessful();
});

test('password reset link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create();

    $response = $this->post('/forgot-password', [
        'email' => $user->email,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
});

test('password reset link request requires email', function () {
    $response = $this->post('/forgot-password', []);

    $response->assertInvalid(['email']);
});

test('password reset link request requires valid email', function () {
    $response = $this->post('/forgot-password', [
        'email' => 'invalid-email',
    ]);

    $response->assertInvalid(['email']);
});
