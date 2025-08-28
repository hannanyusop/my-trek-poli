<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('User Management', function () {
    test('can view users index page', function () {
        $users = User::factory()->count(3)->create();

        $response = $this->get(route('admin.users.index'));

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/Users')
                ->has('users.data', 4) // 3 created + 1 authenticated user
            );
    });

    test('can view create user page', function () {
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'user']);

        $response = $this->get(route('admin.users.create'));

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/CreateUser')
                ->has('roles', 2)
            );
    });

    test('can create a new user', function () {
        $roleAdmin = Role::create(['name' => 'admin']);
        $roleUser = Role::create(['name' => 'user']);

        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roles' => ['admin', 'user'],
        ];

        $response = $this->post(route('admin.users.store'), $userData);

        $response->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success', 'User created successfully.');

        $user = User::where('email', 'john@example.com')->first();
        expect($user)->not()->toBeNull()
            ->and($user->name)->toBe('John Doe')
            ->and($user->hasRole('admin'))->toBeTrue()
            ->and($user->hasRole('user'))->toBeTrue();
    });

    test('validates required fields when creating user', function () {
        $response = $this->post(route('admin.users.store'), []);

        $response->assertSessionHasErrors(['name', 'email', 'password']);
    });

    test('validates email uniqueness when creating user', function () {
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->post(route('admin.users.store'), [
            'name' => 'John Doe',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors(['email']);
    });

    test('can view edit user page', function () {
        $user = User::factory()->create();
        $roles = [
            Role::create(['name' => 'admin']),
            Role::create(['name' => 'user']),
        ];
        $user->assignRole('admin');

        $response = $this->get(route('admin.users.edit', $user));

        $response->assertSuccessful()
            ->assertInertia(fn ($page) => $page->component('Admin/EditUser')
                ->where('user.id', $user->id)
                ->where('user.name', $user->name)
                ->has('roles', 2)
            );
    });

    test('can update user information', function () {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'original@example.com',
        ]);
        $roleAdmin = Role::create(['name' => 'admin']);
        $roleUser = Role::create(['name' => 'user']);

        $updateData = [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'roles' => ['admin'],
        ];

        $response = $this->put(route('admin.users.update', $user), $updateData);

        $response->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success', 'User updated successfully.');

        $user->refresh();
        expect($user->name)->toBe('Updated Name')
            ->and($user->email)->toBe('updated@example.com')
            ->and($user->hasRole('admin'))->toBeTrue();
    });

    test('can update user password', function () {
        $user = User::factory()->create();

        $updateData = [
            'name' => $user->name,
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ];

        $response = $this->put(route('admin.users.update', $user), $updateData);

        $response->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success', 'User updated successfully.');

        $user->refresh();
        expect(Hash::check('newpassword123', $user->password))->toBeTrue();
    });

    test('can delete user', function () {
        $userToDelete = User::factory()->create();

        $response = $this->delete(route('admin.users.destroy', $userToDelete));

        $response->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success', 'User deleted successfully.');

        expect(User::find($userToDelete->id))->toBeNull();
    });

    test('cannot delete own account', function () {
        $response = $this->delete(route('admin.users.destroy', $this->user));

        $response->assertRedirect()
            ->assertSessionHas('error', 'You cannot delete your own account.');

        expect(User::find($this->user->id))->not()->toBeNull();
    });

    test('validates email uniqueness when updating user but ignores current user', function () {
        $user1 = User::factory()->create(['email' => 'user1@example.com']);
        $user2 = User::factory()->create(['email' => 'user2@example.com']);

        // Should fail - email belongs to another user
        $response = $this->put(route('admin.users.update', $user1), [
            'name' => $user1->name,
            'email' => 'user2@example.com',
        ]);

        $response->assertSessionHasErrors(['email']);

        // Should succeed - same email as current user
        $response = $this->put(route('admin.users.update', $user1), [
            'name' => 'Updated Name',
            'email' => 'user1@example.com',
        ]);

        $response->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success');
    });
});
