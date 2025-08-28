<?php

use App\Models\Track;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can create a registration session without status field', function () {
    $user = User::factory()->create();
    $tracks = Track::factory(2)->create(['is_active' => true]);

    $response = $this->actingAs($user)->post(route('admin.registration-sessions.store'), [
        'name' => 'Test Registration Session',
        'description' => 'Test Description',
        'start_date' => now()->addDay()->format('Y-m-d\TH:i'),
        'end_date' => now()->addDays(7)->format('Y-m-d\TH:i'),
        'tracks' => [$tracks[0]->id, $tracks[1]->id],
        'classes' => [
            $tracks[0]->id => [
                ['id' => 'class_1', 'name' => 'Class A', 'quota' => 30],
            ],
            $tracks[1]->id => [
                ['id' => 'class_2', 'name' => 'Class B', 'quota' => 25],
            ],
        ],
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('registration_sessions', [
        'name' => 'Test Registration Session',
        'description' => 'Test Description',
        'status' => 'pending', // Should default to pending
    ]);
});

it('validates required fields for registration session', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.registration-sessions.store'), [
        'name' => '', // Empty name should fail validation
        'start_date' => '',
        'end_date' => '',
    ]);

    $response->assertSessionHasErrors(['name', 'start_date', 'end_date']);
});
