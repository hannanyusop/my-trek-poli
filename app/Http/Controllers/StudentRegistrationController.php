<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentRegistrationRequest;
use App\Http\Requests\TrackPreferencesRequest;
use App\Models\Race;
use App\Models\RegistrationSession;
use App\Models\RegistrationSessionTrack;
use App\Models\Religion;
use App\Models\Student;
use App\Models\StudentPreference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentRegistrationController extends Controller
{
    public function show(Request $request, string $token): Response|RedirectResponse
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

        // Check if matric_number is provided in query parameters
        $matricNumber = $request->query('matric_number');
        if ($matricNumber) {
            // Check if student exists with the provided matric number and correct session ID
            $student = Student::where('matric_number', $matricNumber)
                ->where('registration_session_id', $registrationSession->id)
                ->first();

            // If student doesn't exist, return error message
            if (!$student) {
                return Inertia::render('StudentRegistration/Show', [
                    'registrationSession' => $registrationSession,
                    'error' => 'Student not found. Please ask assistance from admin.',
                ]);
            }

            // If student exists and is submitted, redirect to summary
            if ($student->is_submitted) {
                return redirect()->route('student.registration.summary', [
                    'token' => $token,
                    'matric_number' => $matricNumber,
                ]);
            }

            // If student exists but not submitted, redirect to form with student data
            return redirect()->route('student.registration.form', $token)->with('student_data', $student);
        }

        return Inertia::render('StudentRegistration/Show', [
            'registrationSession' => $registrationSession,
        ]);
    }

    public function showLookupForm(string $token): Response
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();
        $tracks = RegistrationSessionTrack::where('registration_session_id', $registrationSession->id)->with('track')->get();
        $races = Race::where('is_active', true)->orderBy('name')->get();
        $religions = Religion::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('StudentRegistration/Form', [
            'registrationSession' => $registrationSession,
            'student' => null,
            'tracks' => $tracks,
            'races' => $races,
            'religions' => $religions,
        ]);
    }

    public function lookupStudent(Request $request, string $token): Response|RedirectResponse
    {
        $request->validate([
            'matric_number' => 'required|string|max:255',
        ]);

        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

        $student = Student::where('matric_number', $request->matric_number)
            ->where('registration_session_id', $registrationSession->id)
            ->first();

        if (!$student) {
            return redirect()->back()->withErrors(['matric_number' => 'Student not found. Please ask assistance from admin.']);
        }

        if ($student->is_submitted) {
            return redirect()->route('student.registration.summary', [
                'token' => $token,
                'matric_number' => $request->matric_number,
            ]);
        }

        $tracks = RegistrationSessionTrack::where('registration_session_id', $registrationSession->id)->with('track')->get();
        $races = Race::where('is_active', true)->orderBy('name')->get();
        $religions = Religion::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('StudentRegistration/Form', [
            'registrationSession' => $registrationSession,
            'student' => $student,
            'tracks' => $tracks,
            'races' => $races,
            'religions' => $religions,
        ]);
    }

    public function storeStudent(StudentRegistrationRequest $request, string $token): RedirectResponse
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->first();
        $student = Student::updateOrCreate(
            [
                'registration_session_id' => $registrationSession->id,
                'matric_number' => $request->matric_number,
            ],
            $request->validated()
        );

        session(['student_id' => $student->id]);

        return redirect()->route('student.registration.tracks', $token);
    }

    public function showTrackSelection(string $token): Response
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();
        $studentId = session('student_id');

        if (! $studentId) {
            return Inertia::render('StudentRegistration/Show', [
                'registrationSession' => $registrationSession,
            ]);
        }

        $student = Student::findOrFail($studentId);
        $tracks = RegistrationSessionTrack::where('registration_session_id', $registrationSession->id)->with('track')->get();

        $existingPreferences = StudentPreference::where('student_id', $student->id)
            ->with('registrationSessionTrack.track')
            ->orderBy('priority')
            ->get();

        return Inertia::render('StudentRegistration/TrackSelection', [
            'registrationSession' => $registrationSession,
            'student' => $student,
            'tracks' => $tracks,
            'existingPreferences' => $existingPreferences,
        ]);
    }

    public function storeTrackPreferences(TrackPreferencesRequest $request, string $token): Response
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();
        $studentId = session('student_id');

        if (! $studentId) {
            return Inertia::render('StudentRegistration/Show', [
                'registrationSession' => $registrationSession,
            ]);
        }

        $student = Student::findOrFail($studentId);

        StudentPreference::where('student_id', $student->id)->delete();

        foreach ($request->preferences as $priority => $trackId) {
            StudentPreference::create([
                'student_id' => $student->id,
                'registration_session_track_id' => $trackId,
                'priority' => $priority + 1,
            ]);
        }

        $student->update([
            'is_submitted' => true,
            'submitted_at' => now(),
        ]);

        // Get student preferences with track information
        $preferences = StudentPreference::where('student_id', $student->id)
            ->with(['registrationSessionTrack.track'])
            ->orderBy('priority')
            ->get();

        // Get student placement if available (only when session status is 'published')
        $placement = null;
        if ($registrationSession->status === 'published') {
            $placement = \App\Models\Placement::where('student_id', $student->id)
                ->where('is_active', true)
                ->with(['class.registrationSessionTrack.track'])
                ->first();
        }

        return Inertia::render('StudentRegistration/Success', [
            'student' => $student->fresh(),
            'registrationSession' => $registrationSession,
            'preferences' => $preferences,
            'placement' => $placement,
        ]);
    }

    public function showSummary(string $token, string $matric_number): Response
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

        $student = Student::where('registration_session_id', $registrationSession->id)
            ->where('matric_number', $matric_number)
            ->where('is_submitted', true)
            ->firstOrFail();

        // Get student preferences with track information
        $preferences = StudentPreference::where('student_id', $student->id)
            ->with(['registrationSessionTrack.track'])
            ->orderBy('priority')
            ->get();

        // Get student placement if available (only when session status is 'published')
        $placement = null;
        if ($registrationSession->status === 'published') {
            $placement = \App\Models\Placement::where('student_id', $student->id)
                ->where('is_active', true)
                ->with(['class.registrationSessionTrack.track'])
                ->first();
        }

        return Inertia::render('StudentRegistration/Success', [
            'student' => $student,
            'registrationSession' => $registrationSession,
            'preferences' => $preferences,
            'placement' => $placement,
        ]);
    }
}
