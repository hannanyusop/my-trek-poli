<?php

use App\Http\Controllers\Admin\RaceController;
use App\Http\Controllers\Admin\RegistrationSessionController;
use App\Http\Controllers\Admin\ReligionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\TrackController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\StudentRegistrationController;
use App\Models\Student;
use App\Models\Track;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Student Registration Routes (public)
Route::prefix('register')->name('student.registration.')->group(function () {
    Route::get('{token}', [StudentRegistrationController::class, 'show'])->name('show');
    Route::post('{token}/lookup', [StudentRegistrationController::class, 'lookupStudent'])->name('lookup');
    Route::get('{token}/lookup', function ($token) {
        return redirect()->route('student.registration.show', $token);
    });
    Route::post('{token}/register-new', [StudentRegistrationController::class, 'registerNewStudent'])->name('register.new');
    Route::get('{token}/form', [StudentRegistrationController::class, 'showForm'])->name('form');
    Route::post('{token}/student', [StudentRegistrationController::class, 'storeStudent'])->name('store.student');
    Route::get('{token}/tracks', [StudentRegistrationController::class, 'showTrackSelection'])->name('tracks');
    Route::post('{token}/tracks', [StudentRegistrationController::class, 'storeTrackPreferences'])->name('store.tracks');
    Route::get('{token}/preview', [StudentRegistrationController::class, 'showPreview'])->name('preview');
    Route::match(['GET', 'POST'], '{token}/submit', [StudentRegistrationController::class, 'submitRegistration'])->name('submit');
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
        return Inertia::render('Dashboard', [
            'stats' => [
                'total_users' => User::count(),
                'total_students' => Student::count(),
                'total_tracks' => Track::count(),
                'active_sessions' => \App\Models\RegistrationSession::where('status', 'active')->count(),
                'total_registrations' => \App\Models\Student::whereNotNull('submitted_at')->count(),
            ],
            'recent_sessions' => \App\Models\RegistrationSession::with('tracks')
                ->latest()
                ->take(5)
                ->get(),
            'recent_registrations' => \App\Models\Student::whereNotNull('submitted_at')
                ->latest('submitted_at')
                ->take(10)
                ->get(),
        ]);
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
        Route::post('registration-sessions/{registration_session}/add-student', [RegistrationSessionController::class, 'addStudent'])->name('registration-sessions.add-student');
        Route::delete('registration-sessions/{registration_session}/delete-student', [RegistrationSessionController::class, 'deleteStudent'])->name('registration-sessions.delete-student');
        Route::get('registration-sessions/{registration_session}/export/excel', [RegistrationSessionController::class, 'exportExcel'])->name('registration-sessions.export.excel');
        Route::get('registration-sessions/{registration_session}/export/pdf', [RegistrationSessionController::class, 'exportPdf'])->name('registration-sessions.export.pdf');
        Route::get('registration-sessions/{registration_session}/bulk-upload', [RegistrationSessionController::class, 'bulkUpload'])->name('registration-sessions.bulk-upload');
        Route::get('registration-sessions/{registration_session}/download-template', [RegistrationSessionController::class, 'downloadTemplate'])->name('registration-sessions.download-template');
        Route::post('registration-sessions/{registration_session}/process-upload', [RegistrationSessionController::class, 'processUpload'])->name('registration-sessions.process-upload');
        Route::post('registration-sessions/{registration_session}/confirm-upload', [RegistrationSessionController::class, 'confirmUpload'])->name('registration-sessions.confirm-upload');
        Route::post('registration-sessions/{registration_session}/generate-dummy', [RegistrationSessionController::class, 'generateDummyStudent'])->name('registration-sessions.generate-dummy');
        Route::post('registration-sessions/{registration_session}/generate-test-student', [RegistrationSessionController::class, 'generateTestStudent'])->name('registration-sessions.generate-test-student');
        Route::post('registration-sessions/{registration_session}/open', [RegistrationSessionController::class, 'openSession'])->name('registration-sessions.open');
        Route::post('registration-sessions/{registration_session}/close', [RegistrationSessionController::class, 'closeSession'])->name('registration-sessions.close');
        Route::post('registration-sessions/{registration_session}/toggle-public-registration', [RegistrationSessionController::class, 'togglePublicRegistration'])->name('registration-sessions.toggle-public-registration');

        // Class management routes
        Route::put('registration-sessions/{registration_session}/classes/{class}', [RegistrationSessionController::class, 'updateClass'])->name('registration-sessions.update-class');
        Route::delete('registration-sessions/{registration_session}/classes/{class}', [RegistrationSessionController::class, 'deleteClass'])->name('registration-sessions.delete-class');
        Route::post('registration-sessions/{registration_session}/classes', [RegistrationSessionController::class, 'addClass'])->name('registration-sessions.add-class');

        // Placement routes
        Route::post('registration-sessions/{registration_session}/start-placement', [RegistrationSessionController::class, 'startPlacement'])->name('registration-sessions.start-placement');
        Route::post('registration-sessions/{registration_session}/retry-placement', [RegistrationSessionController::class, 'retryPlacement'])->name('registration-sessions.retry-placement');
        Route::get('registration-sessions/{registration_session}/placement-progress', [RegistrationSessionController::class, 'placementProgress'])->name('registration-sessions.placement-progress');
        Route::post('registration-sessions/{registration_session}/publish', [RegistrationSessionController::class, 'publishResults'])->name('registration-sessions.publish');
        Route::get('registration-sessions/{registration_session}/placement', [\App\Http\Controllers\Admin\PlacementController::class, 'index'])->name('registration-sessions.placement.index');
        Route::put('registration-sessions/{registration_session}/placement/students/{student}', [\App\Http\Controllers\Admin\PlacementController::class, 'update'])->name('registration-sessions.placement.update');
        Route::post('registration-sessions/{registration_session}/placement/swap', [\App\Http\Controllers\Admin\PlacementController::class, 'swap'])->name('registration-sessions.placement.swap');
        Route::delete('registration-sessions/{registration_session}/placement/clear', [\App\Http\Controllers\Admin\PlacementController::class, 'clear'])->name('registration-sessions.placement.clear');
        Route::post('registration-sessions/{registration_session}/placement/regenerate', [\App\Http\Controllers\Admin\PlacementController::class, 'regenerate'])->name('registration-sessions.placement.regenerate');
        Route::get('registration-sessions/{registration_session}/placement/export', [\App\Http\Controllers\Admin\PlacementController::class, 'exportAll'])->name('registration-sessions.placement.export-all');
        Route::get('registration-sessions/{registration_session}/placement/export/{class}', [\App\Http\Controllers\Admin\PlacementController::class, 'exportByClass'])->name('registration-sessions.placement.export-class');

        Route::resource('tracks', TrackController::class);
        Route::resource('races', RaceController::class);
        Route::resource('religions', ReligionController::class);
        Route::resource('roles', RoleController::class)->except(['show']);
    });
});
