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
    public function show(string $token): Response
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

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

    public function lookupStudent(Request $request, string $token): Response
    {
        $request->validate([
            'matric_number' => 'required|string|max:255',
        ]);

        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

        $student = Student::where('registration_session_id', $registrationSession->id)
            ->where('matric_number', $request->matric_number)
            ->first();

        if ($student && $student->is_submitted) {
            return Inertia::render('StudentRegistration/AlreadySubmitted', [
                'student' => $student,
                'registrationSession' => $registrationSession,
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

        return redirect()->route('student.registration.tracks', $token)
            ->with('student_id', $student->id);
    }

    public function showTrackSelection(string $token): Response
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();
        $studentId = session('student_id');

        if (! $studentId) {
            return redirect()->route('student.registration.show', $token);
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
            return redirect()->route('student.registration.show', $token);
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

        return Inertia::render('StudentRegistration/Success', [
            'student' => $student->fresh(),
            'registrationSession' => $registrationSession,
        ]);
    }
}
