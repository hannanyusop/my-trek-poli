<?php

use App\Http\Controllers\Admin\RaceController;
use App\Http\Controllers\Admin\RegistrationSessionController;
use App\Http\Controllers\Admin\ReligionController;
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
    Route::get('{token}/form', [StudentRegistrationController::class, 'showForm'])->name('form');
    Route::post('{token}/student', [StudentRegistrationController::class, 'storeStudent'])->name('store.student');
    Route::get('{token}/tracks', [StudentRegistrationController::class, 'showTrackSelection'])->name('tracks');
    Route::post('{token}/tracks', [StudentRegistrationController::class, 'storeTrackPreferences'])->name('store.tracks');
    Route::get('{token}/preview', [StudentRegistrationController::class, 'showPreview'])->name('preview');
    Route::post('{token}/submit', [StudentRegistrationController::class, 'submitRegistration'])->name('submit');
    Route::get('{token}/summary/{matric_number}', [StudentRegistrationController::class, 'showSummary'])->name('summary');
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
        Route::get('registration-sessions/{registration_session}/projector', [RegistrationSessionController::class, 'projector'])->name('registration-sessions.projector');
        Route::post('registration-sessions/{registration_session}/undo-submission', [RegistrationSessionController::class, 'undoSubmission'])->name('registration-sessions.undo-submission');
        Route::get('registration-sessions/{registration_session}/export/excel', [RegistrationSessionController::class, 'exportExcel'])->name('registration-sessions.export.excel');
        Route::get('registration-sessions/{registration_session}/export/pdf', [RegistrationSessionController::class, 'exportPdf'])->name('registration-sessions.export.pdf');
        Route::get('registration-sessions/{registration_session}/bulk-upload', [RegistrationSessionController::class, 'bulkUpload'])->name('registration-sessions.bulk-upload');
        Route::get('registration-sessions/{registration_session}/download-template', [RegistrationSessionController::class, 'downloadTemplate'])->name('registration-sessions.download-template');
        Route::post('registration-sessions/{registration_session}/process-upload', [RegistrationSessionController::class, 'processUpload'])->name('registration-sessions.process-upload');
        Route::post('registration-sessions/{registration_session}/confirm-upload', [RegistrationSessionController::class, 'confirmUpload'])->name('registration-sessions.confirm-upload');
        Route::resource('tracks', TrackController::class);
        Route::resource('races', RaceController::class);
        Route::resource('religions', ReligionController::class);

        Route::get('/roles', function () {
            return Inertia::render('Admin/Roles');
        })->name('roles');
    });
});
