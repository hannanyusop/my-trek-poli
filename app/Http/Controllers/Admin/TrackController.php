<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Track;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrackController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/Tracks', [
            'tracks' => Track::orderBy('created_at', 'desc')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Tracks/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        try {
            Track::create([
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->boolean('is_active', true),
            ]);

            return redirect()->route('admin.tracks.index')->with('success', 'Track created successfully!');
        } catch (\Exception $e) {
            \Log::error('Error creating track: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create track. Please try again.')->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Track $track)
    {
        return Inertia::render('Admin/Tracks/Show', [
            'track' => $track,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Track $track)
    {
        return Inertia::render('Admin/Tracks/Edit', [
            'track' => $track,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Track $track)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        try {
            $track->update([
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->boolean('is_active', false),
            ]);

            return redirect()->route('admin.tracks.index')->with('success', 'Track updated successfully!');
        } catch (\Exception $e) {
            \Log::error('Error updating track: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update track. Please try again.')->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Track $track)
    {
        try {
            $trackName = $track->name;
            $track->delete();

            return redirect()->route('admin.tracks.index')->with('success', "Track '{$trackName}' deleted successfully!");
        } catch (\Exception $e) {
            \Log::error('Error deleting track: ' . $e->getMessage());
            return redirect()->route('admin.tracks.index')->with('error', 'Failed to delete track. It may be linked to other records.');
        }
    }
}
