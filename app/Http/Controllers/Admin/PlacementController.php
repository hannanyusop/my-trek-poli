<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RegistrationSessionStatus;
use App\Http\Controllers\Controller;
use App\Models\Classes;
use App\Models\PlacementLog;
use App\Models\RegistrationSession;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlacementController extends Controller
{
    /**
     * Display placement management page.
     */
    public function index(string $sessionId)
    {
        $session = RegistrationSession::findOrFail($sessionId);

        // Get all students with their assigned classes and placement info
        $students = Student::where('registration_session_id', $sessionId)
            ->where('is_submitted', true)
            ->with(['assignedClass.registrationSessionTrack.track', 'preferences.registrationSessionTrack.track'])
            ->orderBy('placement_status')
            ->orderBy('name')
            ->get();

        // Get all classes with distribution metrics
        $classes = Classes::whereHas('registrationSessionTrack', function ($query) use ($sessionId) {
            $query->where('registration_session_id', $sessionId);
        })
            ->with(['registrationSessionTrack.track', 'students'])
            ->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'track' => $class->registrationSessionTrack->track->name,
                    'quota' => $class->quota,
                    'assigned_count' => $class->students->count(),
                    'available_slots' => $class->quota - $class->students->count(),
                    'gender_distribution' => $class->students->countBy('gender'),
                    'race_distribution' => $class->students->countBy('race'),
                ];
            });

        // Calculate overall statistics
        $stats = [
            'total_students' => $students->count(),
            'placed' => $students->where('placement_status', 'placed')->count(),
            'manually_assigned' => $students->where('placement_status', 'manually_assigned')->count(),
            'flagged' => $students->where('placement_status', 'flagged')->count(),
            'pending' => $students->where('placement_status', 'pending')->count(),
        ];

        return Inertia::render('Admin/RegistrationSessions/Placement', [
            'session' => $session,
            'students' => $students,
            'classes' => $classes,
            'stats' => $stats,
        ]);
    }

    /**
     * Manually assign a student to a class.
     */
    public function update(Request $request, string $sessionId, string $studentId)
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id',
        ]);

        $session = RegistrationSession::findOrFail($sessionId);
        $student = Student::where('id', $studentId)
            ->where('registration_session_id', $sessionId)
            ->firstOrFail();

        $newClass = Classes::findOrFail($request->class_id);

        // Check if class has capacity
        $assignedCount = Student::where('assigned_class_id', $newClass->id)->count();
        if ($assignedCount >= $newClass->quota) {
            return back()->withErrors(['class' => 'Selected class is at full capacity.']);
        }

        $previousClassId = $student->assigned_class_id;

        // Update student assignment
        $student->update([
            'assigned_class_id' => $newClass->id,
            'placement_status' => 'manually_assigned',
            'placement_notes' => 'Manually assigned by admin',
        ]);

        // Log the change
        PlacementLog::create([
            'registration_session_id' => $sessionId,
            'student_id' => $student->id,
            'class_id' => $newClass->id,
            'previous_class_id' => $previousClassId,
            'action' => 'manual_assigned',
            'performed_by_user_id' => auth()->id(),
            'notes' => 'Manually assigned from '.($previousClassId ? "class ID {$previousClassId}" : 'unassigned')." to {$newClass->name}",
        ]);

        return back()->with('success', "Student {$student->name} has been assigned to {$newClass->name}.");
    }

    /**
     * Swap two students between classes.
     */
    public function swap(Request $request, string $sessionId)
    {
        $request->validate([
            'student1_id' => 'required|exists:students,id',
            'student2_id' => 'required|exists:students,id|different:student1_id',
        ]);

        $student1 = Student::where('id', $request->student1_id)
            ->where('registration_session_id', $sessionId)
            ->firstOrFail();

        $student2 = Student::where('id', $request->student2_id)
            ->where('registration_session_id', $sessionId)
            ->firstOrFail();

        if (! $student1->assigned_class_id || ! $student2->assigned_class_id) {
            return back()->withErrors(['swap' => 'Both students must be assigned to classes before swapping.']);
        }

        // Swap the classes
        $class1 = $student1->assigned_class_id;
        $class2 = $student2->assigned_class_id;

        $student1->update([
            'assigned_class_id' => $class2,
            'placement_status' => 'manually_assigned',
        ]);

        $student2->update([
            'assigned_class_id' => $class1,
            'placement_status' => 'manually_assigned',
        ]);

        // Log both swaps
        PlacementLog::create([
            'registration_session_id' => $sessionId,
            'student_id' => $student1->id,
            'class_id' => $class2,
            'previous_class_id' => $class1,
            'action' => 'swapped',
            'performed_by_user_id' => auth()->id(),
            'notes' => "Swapped with {$student2->name}",
        ]);

        PlacementLog::create([
            'registration_session_id' => $sessionId,
            'student_id' => $student2->id,
            'class_id' => $class1,
            'previous_class_id' => $class2,
            'action' => 'swapped',
            'performed_by_user_id' => auth()->id(),
            'notes' => "Swapped with {$student1->name}",
        ]);

        return back()->with('success', "Students {$student1->name} and {$student2->name} have been swapped.");
    }

    /**
     * Clear all placements and reset to closed status.
     */
    public function clear(string $sessionId)
    {
        $session = RegistrationSession::findOrFail($sessionId);

        // Clear all student assignments
        Student::where('registration_session_id', $sessionId)
            ->update([
                'assigned_class_id' => null,
                'placement_status' => 'pending',
                'placement_notes' => null,
            ]);

        // Log the clear action
        PlacementLog::create([
            'registration_session_id' => $sessionId,
            'student_id' => null,
            'action' => 'cleared',
            'performed_by_user_id' => auth()->id(),
            'notes' => 'All placements cleared by admin',
        ]);

        // Reset session status to closed
        $session->update(['status' => RegistrationSessionStatus::Closed]);

        return redirect()->route('admin.registration-sessions.show', $sessionId)
            ->with('success', 'All placements have been cleared. You can start the placement process again.');
    }
}
