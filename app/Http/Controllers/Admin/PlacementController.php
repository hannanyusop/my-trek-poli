<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RegistrationSessionStatus;
use App\Exports\PlacementsExport;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessPlacementJob;
use App\Models\Classes;
use App\Models\Placement;
use App\Models\PlacementLog;
use App\Models\RegistrationSession;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class PlacementController extends Controller
{
    /**
     * Display placement management page.
     */
    public function index(string $sessionId)
    {
        $session = RegistrationSession::findOrFail($sessionId);

        // Get all students with their placements
        $students = Student::where('registration_session_id', $sessionId)
            ->where('is_submitted', true)
            ->with(['activePlacement.assignedClass.registrationSessionTrack.track', 'preferences.registrationSessionTrack.track'])
            ->orderBy('submitted_at')
            ->orderBy('id')
            ->get()
            ->map(function ($student) {
                $placement = $student->activePlacement;

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'matric_number' => $student->matric_number,
                    'gender' => $student->gender,
                    'race' => $student->race,
                    'email' => $student->email,
                    'phone' => $student->phone,
                    'submitted_at' => $student->submitted_at?->toISOString(),
                    'placement_status' => $placement?->placement_status ?? 'pending',
                    'placement_notes' => $placement?->placement_notes,
                    'track_priority' => $placement?->track_priority,
                    'assigned_class' => $placement && $placement->assignedClass ? [
                        'id' => $placement->assignedClass->id,
                        'name' => $placement->assignedClass->name,
                        'registration_session_track' => [
                            'track' => [
                                'name' => $placement->assignedClass->registrationSessionTrack->track->name,
                            ],
                        ],
                    ] : null,
                    'track_choices' => $student->preferences
                        ->sortBy('priority')
                        ->map(fn ($pref) => [
                            'priority' => $pref->priority,
                            'track_name' => $pref->registrationSessionTrack->track->name,
                        ])
                        ->values()
                        ->all(),
                ];
            })
            ->values();

        // Get all classes with distribution metrics
        $classes = Classes::whereHas('registrationSessionTrack', function ($query) use ($sessionId) {
            $query->where('registration_session_id', $sessionId);
        })
            ->with(['registrationSessionTrack.track', 'activePlacements.student'])
            ->get()
            ->map(function ($class) {
                $placedStudents = $class->activePlacements->pluck('student');

                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'track' => $class->registrationSessionTrack->track->name,
                    'quota' => $class->quota,
                    'assigned_count' => $placedStudents->count(),
                    'available_slots' => $class->quota - $placedStudents->count(),
                    'gender_distribution' => $placedStudents->countBy('gender'),
                    'race_distribution' => $placedStudents->countBy('race'),
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

        // Prevent editing if results are published
        if ($session->status === RegistrationSessionStatus::Published) {
            return back()->withErrors(['error' => 'Cannot edit placements after results have been published.']);
        }
        $student = Student::where('id', $studentId)
            ->where('registration_session_id', $sessionId)
            ->with(['preferences.registrationSessionTrack', 'activePlacement'])
            ->firstOrFail();

        $newClass = Classes::with('registrationSessionTrack')->findOrFail($request->class_id);

        // Check if class has capacity
        $assignedCount = Placement::where('assigned_class_id', $newClass->id)
            ->where('is_active', true)
            ->count();
        if ($assignedCount >= $newClass->quota) {
            return back()->withErrors(['class' => 'Selected class is at full capacity.']);
        }

        $previousPlacement = $student->activePlacement;
        $previousClassId = $previousPlacement?->assigned_class_id;

        // Calculate track priority
        $assignedTrackId = $newClass->registrationSessionTrack->track_id;
        $preference = $student->preferences->firstWhere('registrationSessionTrack.track_id', $assignedTrackId);
        $trackPriority = $preference?->priority;

        // Deactivate previous placement if exists
        if ($previousPlacement) {
            $previousPlacement->update(['is_active' => false]);
        }

        // Create new placement
        $placement = Placement::create([
            'student_id' => $student->id,
            'assigned_class_id' => $newClass->id,
            'placement_status' => 'manually_assigned',
            'placement_notes' => 'Manually assigned by admin',
            'track_priority' => $trackPriority,
            'assigned_by' => 'admin',
            'admin_id' => auth()->id(),
            'assigned_at' => now(),
            'is_active' => true,
        ]);

        // Log the change
        PlacementLog::create([
            'placement_id' => $placement->id,
            'registration_session_id' => $sessionId,
            'student_id' => $student->id,
            'class_id' => $newClass->id,
            'track_priority' => $trackPriority,
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

        $session = RegistrationSession::findOrFail($sessionId);

        // Prevent editing if results are published
        if ($session->status === RegistrationSessionStatus::Published) {
            return back()->withErrors(['error' => 'Cannot edit placements after results have been published.']);
        }

        $student1 = Student::where('id', $request->student1_id)
            ->where('registration_session_id', $sessionId)
            ->with('activePlacement')
            ->firstOrFail();

        $student2 = Student::where('id', $request->student2_id)
            ->where('registration_session_id', $sessionId)
            ->with('activePlacement')
            ->firstOrFail();

        $placement1 = $student1->activePlacement;
        $placement2 = $student2->activePlacement;

        if (! $placement1 || ! $placement2 || ! $placement1->assigned_class_id || ! $placement2->assigned_class_id) {
            return back()->withErrors(['swap' => 'Both students must be assigned to classes before swapping.']);
        }

        // Swap the classes
        $class1 = $placement1->assigned_class_id;
        $class2 = $placement2->assigned_class_id;

        // Update placements
        $placement1->update([
            'assigned_class_id' => $class2,
            'placement_status' => 'manually_assigned',
        ]);

        $placement2->update([
            'assigned_class_id' => $class1,
            'placement_status' => 'manually_assigned',
        ]);

        // Log both swaps
        PlacementLog::create([
            'placement_id' => $placement1->id,
            'registration_session_id' => $sessionId,
            'student_id' => $student1->id,
            'class_id' => $class2,
            'previous_class_id' => $class1,
            'action' => 'swapped',
            'performed_by_user_id' => auth()->id(),
            'notes' => "Swapped with {$student2->name}",
        ]);

        PlacementLog::create([
            'placement_id' => $placement2->id,
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

        // Prevent clearing if results are published
        if ($session->status === RegistrationSessionStatus::Published) {
            return back()->withErrors(['error' => 'Cannot clear placements after results have been published.']);
        }

        // First, delete all inactive placements to avoid unique constraint violation
        // (student_id, is_active) must be unique
        Placement::whereHas('student', function ($query) use ($sessionId) {
            $query->where('registration_session_id', $sessionId);
        })
            ->where('is_active', false)
            ->delete();

        // Deactivate all active placements for this session
        Placement::whereHas('student', function ($query) use ($sessionId) {
            $query->where('registration_session_id', $sessionId);
        })
            ->where('is_active', true)
            ->update(['is_active' => false]);

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

    /**
     * Export all placements to Excel.
     */
    public function exportAll(string $sessionId)
    {
        $session = RegistrationSession::findOrFail($sessionId);
        $filename = 'placements_all_'.str_replace(['/', '\\', ' '], '_', $session->name).'_'.now()->format('Y-m-d').'.xlsx';

        return Excel::download(
            new PlacementsExport($sessionId),
            $filename
        );
    }

    /**
     * Export placements for a specific class to Excel.
     */
    public function exportByClass(string $sessionId, string $classId)
    {
        $session = RegistrationSession::findOrFail($sessionId);
        $class = Classes::findOrFail($classId);
        $filename = 'placements_'.str_replace(['/', '\\', ' '], '_', $class->name).'_'.now()->format('Y-m-d').'.xlsx';

        return Excel::download(
            new PlacementsExport($sessionId, (int) $classId),
            $filename
        );
    }

    /**
     * Clear all placements and regenerate them.
     */
    public function regenerate(string $sessionId)
    {
        $session = RegistrationSession::findOrFail($sessionId);

        // Prevent regenerating if results are published
        if ($session->status === RegistrationSessionStatus::Published) {
            return back()->withErrors(['error' => 'Cannot regenerate placements after results have been published.']);
        }

        // Must be in Placement status to regenerate
        if ($session->status !== RegistrationSessionStatus::Placement) {
            return back()->withErrors(['status' => 'Session must be in Placement status to regenerate.']);
        }

        $hasPendingJob = DB::table('jobs')
            ->where('payload', 'like', '%ProcessPlacementJob%')
            ->where('payload', 'like', '%sessionId\\\";i:'.$session->id.';%')
            ->exists();

        if ($hasPendingJob) {
            return back()->withErrors(['job' => 'A placement job is already pending in the queue. Please wait for it to complete.']);
        }

        $session->update(['status' => RegistrationSessionStatus::Processing]);

        ProcessPlacementJob::dispatch($session->id, regenerate: true);

        return back()->with('success', 'Placement rerun has been queued. This may take a few minutes.');
    }
}
