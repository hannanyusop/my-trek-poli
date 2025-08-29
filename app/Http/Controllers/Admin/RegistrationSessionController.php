<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Classes;
use App\Models\RegistrationSession;
use App\Models\Student;
use App\Models\Track;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $classes = Classes::whereHas('registrationSessionTrack', function ($query) use ($session) {
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
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
