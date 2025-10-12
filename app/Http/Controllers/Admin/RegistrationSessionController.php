<?php

namespace App\Http\Controllers\Admin;

use App\Exports\StudentsExport;
use App\Http\Controllers\Controller;
use App\Models\Classes;
use App\Models\RegistrationSession;
use App\Models\Student;
use App\Models\Track;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class RegistrationSessionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/RegistrationSessions/Create', [
            'tracks' => Track::where('is_active', true)->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Debug: Log what we received
        \Log::info('Registration session store request data:', $request->all());

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'tracks' => 'required|array|min:1',
            'tracks.*' => 'exists:tracks,id',
            'classes' => 'nullable|array', // Make classes nullable for now
        ]);

        // For now, just redirect back with success message
        // You can implement the actual storage logic here
        return redirect()->route('semester-registration')->with('success', 'Registration session created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $session = RegistrationSession::findOrFail($id);

        // Get classes related to this registration session through registration_session_tracks
        $classes = Classes::with(['registrationSessionTrack.track'])
            ->whereHas('registrationSessionTrack', function ($query) use ($session) {
                $query->where('registration_session_id', $session->id);
            })->get();

        // Get students registered for this session
        $students = Student::where('registration_session_id', $session->id)->get();

        // Generate registration link - for now just use a placeholder route
        // You can adjust this based on your actual student registration route
        $registrationLink = url("/register/{$session->link_token}");

        return Inertia::render('Admin/RegistrationSessions/Show', [
            'session' => $session,
            'classes' => $classes,
            'students' => $students,
            'registrationLink' => $registrationLink,
        ]);
    }

    /**
     * Display the projector view for live registration tracking.
     */
    public function projector(string $id)
    {
        $session = RegistrationSession::findOrFail($id);

        // Get classes with live counts
        $classes = Classes::with(['registrationSessionTrack.track'])
            ->whereHas('registrationSessionTrack', function ($query) use ($session) {
                $query->where('registration_session_id', $session->id);
            })->get();

        // Get total student count for this session
        $totalStudents = Student::where('registration_session_id', $session->id)->count();
        $submittedStudents = Student::where('registration_session_id', $session->id)
            ->where('is_submitted', true)->count();

        // Generate registration link
        $registrationLink = url("/register/{$session->link_token}");

        return Inertia::render('Admin/RegistrationSessions/Projector', [
            'session' => $session,
            'classes' => $classes,
            'totalStudents' => $totalStudents,
            'submittedStudents' => $submittedStudents,
            'registrationLink' => $registrationLink,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Undo submission status for a student.
     */
    public function undoSubmission(Request $request, string $sessionId)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
        ]);

        $student = Student::where('id', $request->student_id)
            ->where('registration_session_id', $sessionId)
            ->firstOrFail();

        $student->update([
            'is_submitted' => false,
            'submitted_at' => null,
        ]);

        return back()->with('success', 'Student submission status has been reset successfully.');
    }

    /**
     * Export students data to Excel for a registration session.
     */
    public function exportExcel(string $id)
    {
        $session = RegistrationSession::findOrFail($id);

        $filename = 'students_'.str_replace(['/', '\\'], '_', $session->name).'_'.now()->format('Y-m-d').'.xlsx';

        return Excel::download(
            new StudentsExport($id),
            $filename
        );
    }

    /**
     * Export students data to PDF for a registration session.
     */
    public function exportPdf(string $id)
    {
        $session = RegistrationSession::findOrFail($id);
        $students = Student::where('registration_session_id', $id)->get();

        // TODO: Install barryvdh/laravel-dompdf package to enable PDF export
        return back()->withErrors(['pdf' => 'PDF export is not available. Please install barryvdh/laravel-dompdf package.']);
    }

    /**
     * Show the bulk upload page.
     */
    public function bulkUpload(string $id)
    {
        $session = RegistrationSession::findOrFail($id);

        return Inertia::render('Admin/RegistrationSessions/BulkUpload', [
            'session' => $session,
        ]);
    }

    /**
     * Download Excel template for student bulk upload.
     */
    public function downloadTemplate(string $id)
    {
        $session = RegistrationSession::findOrFail($id);

        // Create CSV template with headers based on students table structure
        $headers = [
            'matric_number',
            'identification_number',
            'name',
            'gender',
            'race',
            'religion',
            'email',
            'phone',
        ];

        $filename = 'student_upload_template.csv';

        $response = response()->streamDownload(function () use ($headers) {
            $handle = fopen('php://output', 'w');

            // Add headers
            fputcsv($handle, $headers);

            // Add sample row
            fputcsv($handle, [
                'S12345678',
                '123456789012',
                'John Doe',
                'Male',
                'Malay',
                'Islam',
                'john.doe@example.com',
                '0123456789',
            ]);

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);

        return $response;
    }

    /**
     * Process the uploaded CSV file and show preview.
     */
    public function processUpload(Request $request, string $id)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $session = RegistrationSession::findOrFail($id);
        $file = $request->file('file');

        try {
            $previewData = [];
            $errors = [];
            $seenMatricNumbers = []; // Track matric numbers in current file
            $seenIdentificationNumbers = []; // Track identification numbers in current file

            // Get existing matric numbers and identification numbers from database for this session
            $existingMatricNumbers = Student::where('registration_session_id', $id)
                ->pluck('matric_number')
                ->toArray();
            $existingIdentificationNumbers = Student::where('registration_session_id', $id)
                ->pluck('identification_number')
                ->toArray();

            $handle = fopen($file->path(), 'r');
            $headers = fgetcsv($handle); // Read header row
            $rowNumber = 2; // Start from row 2 (after headers)

            while (($data = fgetcsv($handle)) !== false) {
                if (count($data) < 3) {
                    continue;
                } // Skip empty rows

                $studentData = [
                    'matric_number' => trim($data[0] ?? ''),
                    'identification_number' => trim($data[1] ?? ''),
                    'name' => trim($data[2] ?? ''),
                    'gender' => trim($data[3] ?? ''),
                    'race' => trim($data[4] ?? ''),
                    'religion' => trim($data[5] ?? ''),
                    'email' => trim($data[6] ?? ''),
                    'phone' => trim($data[7] ?? ''),
                ];

                // Validate required fields and duplicates
                $rowErrors = [];

                if (empty($studentData['matric_number'])) {
                    $rowErrors[] = 'Matric number is required';
                } else {
                    // Check for duplicate in database
                    if (in_array($studentData['matric_number'], $existingMatricNumbers)) {
                        $rowErrors[] = 'Matric number already exists in database';
                    }

                    // Check for duplicate in current file
                    if (in_array($studentData['matric_number'], $seenMatricNumbers)) {
                        $rowErrors[] = 'Duplicate matric number in file';
                    } else {
                        $seenMatricNumbers[] = $studentData['matric_number'];
                    }
                }

                if (empty($studentData['identification_number'])) {
                    $rowErrors[] = 'Identification number is required';
                } else {
                    // Check for duplicate identification number in database
                    if (in_array($studentData['identification_number'], $existingIdentificationNumbers)) {
                        $rowErrors[] = 'Identification number already exists in database for this session';
                    }

                    // Check for duplicate identification number in current file
                    if (in_array($studentData['identification_number'], $seenIdentificationNumbers)) {
                        $rowErrors[] = 'Duplicate identification number in file';
                    } else {
                        $seenIdentificationNumbers[] = $studentData['identification_number'];
                    }
                }
                if (empty($studentData['name'])) {
                    $rowErrors[] = 'Name is required';
                }
                if (empty($studentData['gender']) || ! in_array(strtolower($studentData['gender']), ['male', 'female'])) {
                    $rowErrors[] = 'Gender must be Male or Female';
                }
                if (empty($studentData['race'])) {
                    $rowErrors[] = 'Race is required';
                }
                if (empty($studentData['religion'])) {
                    $rowErrors[] = 'Religion is required';
                }
                if (! empty($studentData['email']) && ! filter_var($studentData['email'], FILTER_VALIDATE_EMAIL)) {
                    $rowErrors[] = 'Invalid email format';
                }
                if (empty($studentData['phone'])) {
                    $rowErrors[] = 'Phone number is required';
                }

                $previewData[] = [
                    'row_number' => $rowNumber,
                    'data' => $studentData,
                    'has_errors' => ! empty($rowErrors),
                ];

                if (! empty($rowErrors)) {
                    $errors[$rowNumber] = $rowErrors;
                }

                $rowNumber++;
            }

            fclose($handle);

            return Inertia::render('Admin/RegistrationSessions/BulkUpload', [
                'session' => $session,
                'previewData' => $previewData,
                'errors' => $errors,
                'showPreview' => true,
            ]);

        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Error processing file: '.$e->getMessage()]);
        }
    }

    /**
     * Confirm and save the uploaded student data.
     */
    public function confirmUpload(Request $request, string $id)
    {
        $session = RegistrationSession::findOrFail($id);
        $studentsData = $request->input('students_data', []);

        $createdCount = 0;
        $updatedCount = 0;
        $errorCount = 0;

        foreach ($studentsData as $studentData) {
            try {
                $studentData['registration_session_id'] = $session->id;
                $studentData['is_submitted'] = false;

                $student = Student::updateOrCreate(
                    [
                        'registration_session_id' => $session->id,
                        'matric_number' => $studentData['matric_number'],
                    ],
                    $studentData
                );

                if ($student->wasRecentlyCreated) {
                    $createdCount++;
                } else {
                    $updatedCount++;
                }

            } catch (\Exception $e) {
                $errorCount++;
                \Log::error('Error creating student: '.$e->getMessage(), $studentData);
            }
        }

        $message = "Bulk upload completed. Created: {$createdCount}, Updated: {$updatedCount}";
        if ($errorCount > 0) {
            $message .= ", Errors: {$errorCount}";
        }

        return redirect()
            ->route('admin.registration-sessions.show', $session->id)
            ->with('success', $message);
    }

    /**
     * Add a single student to the registration session.
     */
    public function addStudent(Request $request, string $id)
    {
        $session = RegistrationSession::findOrFail($id);

        // Convert matric number to uppercase
        $request->merge([
            'matric_number' => strtoupper($request->matric_number),
        ]);

        $request->validate([
            'matric_number' => [
                'required',
                'string',
                'max:255',
                'unique:students,matric_number',
            ],
        ], [
            'matric_number.unique' => 'Student with this matric number already exists in the system.',
        ]);

        // Create student with minimal data - just matric number
        // Generate a temporary unique identification number to satisfy the constraint
        $tempIdNumber = 'TEMP_'.time().'_'.rand(1000, 9999);

        Student::create([
            'registration_session_id' => $session->id,
            'matric_number' => $request->matric_number,
            'name' => 'TBD', // Will be filled during registration
            'identification_number' => $tempIdNumber,
            'gender' => 'male', // Default value since it's enum
            'race' => 'TBD',
            'religion' => 'TBD',
            'email' => '',
            'phone' => '',
            'is_submitted' => false,
        ]);

        return back()->with('success', 'Student added successfully.');
    }

    /**
     * Delete a student from the registration session (only if not submitted).
     */
    public function deleteStudent(Request $request, string $sessionId)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
        ]);

        $session = RegistrationSession::findOrFail($sessionId);

        $student = Student::where('id', $request->student_id)
            ->where('registration_session_id', $session->id)
            ->firstOrFail();

        // Only allow deletion if student hasn't submitted
        if ($student->is_submitted) {
            return back()->withErrors([
                'student' => 'Cannot delete student who has already submitted their registration.',
            ]);
        }

        // Delete student preferences first (if any)
        \App\Models\StudentPreference::where('student_id', $student->id)->delete();

        // Delete the student
        $student->delete();

        return back()->with('success', 'Student deleted successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
