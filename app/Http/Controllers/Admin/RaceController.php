<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Race;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/Races', [
            'races' => Race::orderBy('created_at', 'desc')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Races/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:races,code',
            'is_active' => 'boolean',
        ]);

        try {
            Race::create([
                'name' => $request->name,
                'code' => $request->code,
                'is_active' => $request->boolean('is_active', true),
            ]);

            return redirect()->route('admin.races.index')->with('success', 'Race created successfully!');
        } catch (\Exception $e) {
            \Log::error('Error creating race: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create race. Please try again.')->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Race $race)
    {
        return Inertia::render('Admin/Races/Show', [
            'race' => $race,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Race $race)
    {
        return Inertia::render('Admin/Races/Edit', [
            'race' => $race,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Race $race)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:races,code,' . $race->id,
            'is_active' => 'boolean',
        ]);

        try {
            $race->update([
                'name' => $request->name,
                'code' => $request->code,
                'is_active' => $request->boolean('is_active', false),
            ]);

            return redirect()->route('admin.races.index')->with('success', 'Race updated successfully!');
        } catch (\Exception $e) {
            \Log::error('Error updating race: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update race. Please try again.')->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Race $race)
    {
        try {
            $raceName = $race->name;
            $race->delete();

            return redirect()->route('admin.races.index')->with('success', "Race '{$raceName}' deleted successfully!");
        } catch (\Exception $e) {
            \Log::error('Error deleting race: ' . $e->getMessage());
            return redirect()->route('admin.races.index')->with('error', 'Failed to delete race. It may be linked to other records.');
        }
    }
}
