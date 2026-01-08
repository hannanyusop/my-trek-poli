<?php

namespace App\Http\Controllers;

use App\Enums\RegistrationSessionStatus;
use App\Http\Requests\StudentRegistrationRequest;
use App\Http\Requests\TrackPreferencesRequest;
use App\Models\Placement;
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
    /**
     * Check if the registration session status allows student access.
     * Returns an Inertia response with appropriate message if access is denied.
     */
    private function checkSessionStatus(RegistrationSession $registrationSession, ?Student $student = null): ?Response
    {
        $status = $registrationSession->status;

        // Draft status - registration not yet open
        if ($status === RegistrationSessionStatus::Draft) {
            return Inertia::render('StudentRegistration/SessionStatus', [
                'registrationSession' => $registrationSession,
                'status' => 'draft',
                'title' => 'Registration Not Yet Open',
                'message' => 'This registration session is currently in draft mode and has not been opened for student registration yet.',
                'description' => 'Please check back later or contact your administrator for more information about when registration will begin.',
                'icon' => 'clock',
            ]);
        }

        // Closed status - registration period ended
        if ($status === RegistrationSessionStatus::Closed) {
            return Inertia::render('StudentRegistration/SessionStatus', [
                'registrationSession' => $registrationSession,
                'status' => 'closed',
                'title' => 'Registration Closed',
                'message' => 'The registration period for this session has ended.',
                'description' => 'No new registrations or changes are being accepted at this time. If you have already submitted your registration, your preferences have been recorded.',
                'icon' => 'lock',
            ]);
        }

        // Processing status - placements being calculated
        if ($status === RegistrationSessionStatus::Processing) {
            return Inertia::render('StudentRegistration/SessionStatus', [
                'registrationSession' => $registrationSession,
                'status' => 'processing',
                'title' => 'Processing in Progress',
                'message' => 'Class placements are currently being processed.',
                'description' => 'The system is assigning students to classes based on preferences and availability. Please check back later to view your results.',
                'icon' => 'spinner',
            ]);
        }

        // Placement status - placements completed, awaiting publish
        if ($status === RegistrationSessionStatus::Placement) {
            return Inertia::render('StudentRegistration/SessionStatus', [
                'registrationSession' => $registrationSession,
                'status' => 'placement',
                'title' => 'Placements Under Review',
                'message' => 'Class placements have been completed and are currently under review.',
                'description' => 'Results will be published soon. Please check back later or wait for notification about your class assignment.',
                'icon' => 'review',
            ]);
        }

        // Published status - redirect to view results if student has submitted
        if ($status === RegistrationSessionStatus::Published && $student && $student->is_submitted) {
            return null; // Allow access - will be handled by the calling method
        }

        return null; // Open status or Published without submitted student - allow normal flow
    }

    public function show(Request $request, string $token): Response|RedirectResponse
    {
        $registrationSession = RegistrationSession::where('link_token', $token)
            ->firstOrFail();

        // Check if matric_number is provided in query parameters
        $matricNumber = $request->query('matric_number');
        $student = null;

        if ($matricNumber) {
            $student = Student::where('matric_number', $matricNumber)
                ->where('registration_session_id', $registrationSession->id)
                ->first();
        }

        // For non-open statuses with submitted student, redirect to summary (view only)
        $nonOpenStatuses = [
            RegistrationSessionStatus::Closed,
            RegistrationSessionStatus::Processing,
            RegistrationSessionStatus::Placement,
            RegistrationSessionStatus::Published,
        ];

        if (in_array($registrationSession->status, $nonOpenStatuses) && $student && $student->is_submitted) {
            return redirect()->route('student.registration.summary', [
                'token' => $token,
                'matric_number' => $matricNumber,
            ]);
        }

        // Check session status for access restrictions
        $statusResponse = $this->checkSessionStatus($registrationSession, $student);
        if ($statusResponse) {
            return $statusResponse;
        }

        if ($matricNumber) {
            if (! $student) {
                return Inertia::render('StudentRegistration/Show', [
                    'registrationSession' => [
                        'id' => $registrationSession->id,
                        'name' => $registrationSession->name,
                        'description' => $registrationSession->description,
                        'link_token' => $registrationSession->link_token,
                        'start_date' => $registrationSession->start_date,
                        'end_date' => $registrationSession->end_date,
                        'enable_public_registration' => $registrationSession->enable_public_registration,
                    ],
                    'error' => 'Student not found. Please ask assistance from admin.',
                ]);
            }

            if ($student->is_submitted) {
                return redirect()->route('student.registration.summary', [
                    'token' => $token,
                    'matric_number' => $matricNumber,
                ]);
            }

            return redirect()->route('student.registration.form', $token)->with('student_data', $student);
        }

        return Inertia::render('StudentRegistration/Show', [
            'registrationSession' => [
                'id' => $registrationSession->id,
                'name' => $registrationSession->name,
                'description' => $registrationSession->description,
                'link_token' => $registrationSession->link_token,
                'start_date' => $registrationSession->start_date,
                'end_date' => $registrationSession->end_date,
                'enable_public_registration' => $registrationSession->enable_public_registration,
            ],
        ]);
    }

    public function showForm(string $token): Response|RedirectResponse
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

        $studentId = session('student_id');
        $student = $studentId ? Student::find($studentId) : null;

        // For non-open statuses with submitted student, redirect to summary (view only)
        $nonOpenStatuses = [
            RegistrationSessionStatus::Closed,
            RegistrationSessionStatus::Processing,
            RegistrationSessionStatus::Placement,
            RegistrationSessionStatus::Published,
        ];

        if (in_array($registrationSession->status, $nonOpenStatuses) && $student && $student->is_submitted) {
            return redirect()->route('student.registration.summary', [
                'token' => $token,
                'matric_number' => $student->matric_number,
            ]);
        }

        // Check session status for access restrictions
        $statusResponse = $this->checkSessionStatus($registrationSession);
        if ($statusResponse) {
            return $statusResponse;
        }

        // Require student lookup first - redirect if no student data in session
        if (! $studentId) {
            return redirect()->route('student.registration.show', $token);
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

    public function lookupStudent(Request $request, string $token): Response|RedirectResponse
    {
        $request->validate([
            'matric_number' => 'required|string|max:255',
        ]);

        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

        $student = Student::where('matric_number', $request->matric_number)
            ->where('registration_session_id', $registrationSession->id)
            ->first();

        // For non-open statuses with submitted student, redirect to summary (view only)
        $nonOpenStatuses = [
            RegistrationSessionStatus::Closed,
            RegistrationSessionStatus::Processing,
            RegistrationSessionStatus::Placement,
            RegistrationSessionStatus::Published,
        ];

        if (in_array($registrationSession->status, $nonOpenStatuses) && $student && $student->is_submitted) {
            return redirect()->route('student.registration.summary', [
                'token' => $token,
                'matric_number' => $request->matric_number,
            ]);
        }

        // Check session status for access restrictions
        $statusResponse = $this->checkSessionStatus($registrationSession, $student);
        if ($statusResponse) {
            return $statusResponse;
        }

        if (! $student) {
            return redirect()->back()->withErrors(['matric_number' => 'Student not found. Please ask assistance from admin.']);
        }

        if ($student->is_submitted) {
            return redirect()->route('student.registration.summary', [
                'token' => $token,
                'matric_number' => $request->matric_number,
            ]);
        }

        // Set student session for form access
        session(['student_id' => $student->id]);

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

    public function registerNewStudent(Request $request, string $token): RedirectResponse
    {
        $request->validate([
            'matric_number' => 'required|string|max:255',
            'identification_number' => 'required|string|max:255',
        ]);

        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

        // Check if public registration is enabled
        if (! $registrationSession->enable_public_registration) {
            return redirect()->back()->withErrors([
                'registration' => 'Public registration is not enabled for this session.',
            ]);
        }

        // Check session status
        if ($registrationSession->status !== RegistrationSessionStatus::Open) {
            return redirect()->back()->withErrors([
                'registration' => 'Registration is not currently open.',
            ]);
        }

        // Check if matric number already exists for this session
        $existingStudent = Student::where('matric_number', $request->matric_number)
            ->where('registration_session_id', $registrationSession->id)
            ->first();

        if ($existingStudent) {
            return redirect()->back()->withErrors([
                'matric_number' => 'A student with this matric number already exists.',
            ]);
        }

        // Check if identification number already exists for this session
        $existingIC = Student::where('identification_number', $request->identification_number)
            ->where('registration_session_id', $registrationSession->id)
            ->first();

        if ($existingIC) {
            return redirect()->back()->withErrors([
                'identification_number' => 'A student with this identification number already exists.',
            ]);
        }

        // Get default race and religion
        $defaultRace = Race::where('is_active', true)->first();
        $defaultReligion = Religion::where('is_active', true)->first();

        // Create new student with minimal data
        $student = Student::create([
            'registration_session_id' => $registrationSession->id,
            'matric_number' => strtoupper($request->matric_number),
            'identification_number' => $request->identification_number,
            'name' => 'Pending',
            'gender' => 'male',
            'race' => $defaultRace ? $defaultRace->name : 'Unknown',
            'religion' => $defaultReligion ? $defaultReligion->name : 'Unknown',
            'email' => '',
            'phone' => '',
            'is_submitted' => false,
        ]);

        // Set student session for form access
        session(['student_id' => $student->id]);

        return redirect()->route('student.registration.form', $token);
    }

    public function storeStudent(StudentRegistrationRequest $request, string $token): RedirectResponse|Response
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

        // Check session status - only allow during Open status
        $statusResponse = $this->checkSessionStatus($registrationSession);
        if ($statusResponse) {
            return $statusResponse;
        }

        $existingStudent = Student::where('matric_number', $request->matric_number)
            ->where('registration_session_id', $registrationSession->id)
            ->first();

        if (! $existingStudent) {
            return redirect()->route('student.registration.show', $token)
                ->withErrors(['matric_number' => 'Student not found. Please ask assistance from admin.']);
        }

        $validatedData = $request->validated();
        unset($validatedData['matric_number']);

        $student = Student::where('registration_session_id', $registrationSession->id)
            ->where('matric_number', $request->matric_number)
            ->firstOrFail();

        $student->update($validatedData);

        session(['student_id' => $student->id]);

        return redirect()->route('student.registration.tracks', $token);
    }

    public function showTrackSelection(string $token): Response|RedirectResponse
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

        $studentId = session('student_id');
        $student = $studentId ? Student::find($studentId) : null;

        // For non-open statuses with submitted student, redirect to summary (view only)
        $nonOpenStatuses = [
            RegistrationSessionStatus::Closed,
            RegistrationSessionStatus::Processing,
            RegistrationSessionStatus::Placement,
            RegistrationSessionStatus::Published,
        ];

        if (in_array($registrationSession->status, $nonOpenStatuses) && $student && $student->is_submitted) {
            return redirect()->route('student.registration.summary', [
                'token' => $token,
                'matric_number' => $student->matric_number,
            ]);
        }

        // Check session status - only allow during Open status
        $statusResponse = $this->checkSessionStatus($registrationSession);
        if ($statusResponse) {
            return $statusResponse;
        }

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

    public function storeTrackPreferences(TrackPreferencesRequest $request, string $token): RedirectResponse|Response
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

        // Check session status - only allow during Open status
        $statusResponse = $this->checkSessionStatus($registrationSession);
        if ($statusResponse) {
            return $statusResponse;
        }

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

        return redirect()->route('student.registration.preview', $token);
    }

    public function showPreview(string $token): Response|RedirectResponse
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

        $studentId = session('student_id');
        $student = $studentId ? Student::find($studentId) : null;

        // For non-open statuses with submitted student, redirect to summary (view only)
        $nonOpenStatuses = [
            RegistrationSessionStatus::Closed,
            RegistrationSessionStatus::Processing,
            RegistrationSessionStatus::Placement,
            RegistrationSessionStatus::Published,
        ];

        if (in_array($registrationSession->status, $nonOpenStatuses) && $student && $student->is_submitted) {
            return redirect()->route('student.registration.summary', [
                'token' => $token,
                'matric_number' => $student->matric_number,
            ]);
        }

        // Check session status - only allow during Open status
        $statusResponse = $this->checkSessionStatus($registrationSession);
        if ($statusResponse) {
            return $statusResponse;
        }

        if (! $studentId) {
            return Inertia::render('StudentRegistration/Show', [
                'registrationSession' => $registrationSession,
            ]);
        }

        $student = Student::findOrFail($studentId);

        // Get student preferences with track information
        $preferences = StudentPreference::where('student_id', $student->id)
            ->with(['registrationSessionTrack.track'])
            ->orderBy('priority')
            ->get();

        return Inertia::render('StudentRegistration/Preview', [
            'student' => $student,
            'registrationSession' => $registrationSession,
            'preferences' => $preferences,
        ]);
    }

    public function submitRegistration(string $token): Response|RedirectResponse
    {
        $registrationSession = RegistrationSession::where('link_token', $token)->firstOrFail();

        $studentId = session('student_id');
        $student = $studentId ? Student::find($studentId) : null;

        // For non-open statuses with submitted student, redirect to summary (view only)
        $nonOpenStatuses = [
            RegistrationSessionStatus::Closed,
            RegistrationSessionStatus::Processing,
            RegistrationSessionStatus::Placement,
            RegistrationSessionStatus::Published,
        ];

        if (in_array($registrationSession->status, $nonOpenStatuses) && $student && $student->is_submitted) {
            return redirect()->route('student.registration.summary', [
                'token' => $token,
                'matric_number' => $student->matric_number,
            ]);
        }

        // Check session status - only allow during Open status
        $statusResponse = $this->checkSessionStatus($registrationSession);
        if ($statusResponse) {
            return $statusResponse;
        }

        if (! $studentId) {
            return Inertia::render('StudentRegistration/Show', [
                'registrationSession' => $registrationSession,
            ]);
        }

        $student = Student::findOrFail($studentId);

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
        if ($registrationSession->status === RegistrationSessionStatus::Published) {
            $placement = Placement::where('student_id', $student->id)
                ->where('is_active', true)
                ->with(['assignedClass.registrationSessionTrack.track'])
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
        if ($registrationSession->status === RegistrationSessionStatus::Published) {
            $placement = Placement::where('student_id', $student->id)
                ->where('is_active', true)
                ->with(['assignedClass.registrationSessionTrack.track'])
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
