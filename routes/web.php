<?php

use App\Http\Controllers\Admin\RegistrationSessionController;
use App\Http\Controllers\Admin\TrackController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\StudentRegistrationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Student Registration Routes (public)
Route::prefix('register')->name('student.registration.')->group(function () {
    Route::get('{token}', [StudentRegistrationController::class, 'show'])->name('show');
    Route::post('{token}/lookup', [StudentRegistrationController::class, 'lookupStudent'])->name('lookup');
    Route::post('{token}/student', [StudentRegistrationController::class, 'storeStudent'])->name('store.student');
    Route::get('{token}/tracks', [StudentRegistrationController::class, 'showTrackSelection'])->name('tracks');
    Route::post('{token}/tracks', [StudentRegistrationController::class, 'storeTrackPreferences'])->name('store.tracks');
});

// Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('login', [LoginController::class, 'create'])->name('login');
    Route::post('login', [LoginController::class, 'store']);
    Route::get('register', [RegisterController::class, 'create'])->name('register');
    Route::post('register', [RegisterController::class, 'store']);

    // Password Reset Routes
    Route::get('forgot-password', [PasswordResetController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetController::class, 'store'])->name('password.email');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [LoginController::class, 'destroy'])->name('logout');

    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/profile', function () {
        return Inertia::render('Profile');
    })->name('profile');

    // Main Navigation Routes
    Route::get('/semester-registration', function () {
        return Inertia::render('SemesterRegistration', [
            'registrationSessions' => \App\Models\RegistrationSession::orderBy('created_at', 'desc')->get(),
            'tracks' => \App\Models\Track::all(),
            'availableTracks' => \App\Models\Track::where('is_active', true)->get(),
        ]);
    })->name('semester-registration');

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', UserController::class);
        Route::resource('registration-sessions', RegistrationSessionController::class);
        Route::get('registration-sessions/{registrationSession}/projector', [RegistrationSessionController::class, 'projector'])->name('registration-sessions.projector');
        Route::resource('tracks', TrackController::class);

        Route::get('/roles', function () {
            return Inertia::render('Admin/Roles');
        })->name('roles');
    });
});
