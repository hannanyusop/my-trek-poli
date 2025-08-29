<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Religion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReligionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/Religions', [
            'religions' => Religion::orderBy('created_at', 'desc')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Religions/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:religions,code',
            'is_active' => 'boolean',
        ]);

        try {
            Religion::create([
                'name' => $request->name,
                'code' => $request->code,
                'is_active' => $request->boolean('is_active', true),
            ]);

            return redirect()->route('admin.religions.index')->with('success', 'Religion created successfully!');
        } catch (\Exception $e) {
            \Log::error('Error creating religion: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create religion. Please try again.')->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Religion $religion)
    {
        return Inertia::render('Admin/Religions/Show', [
            'religion' => $religion,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Religion $religion)
    {
        return Inertia::render('Admin/Religions/Edit', [
            'religion' => $religion,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Religion $religion)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:religions,code,' . $religion->id,
            'is_active' => 'boolean',
        ]);

        try {
            $religion->update([
                'name' => $request->name,
                'code' => $request->code,
                'is_active' => $request->boolean('is_active', false),
            ]);

            return redirect()->route('admin.religions.index')->with('success', 'Religion updated successfully!');
        } catch (\Exception $e) {
            \Log::error('Error updating religion: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update religion. Please try again.')->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Religion $religion)
    {
        try {
            $religionName = $religion->name;
            $religion->delete();

            return redirect()->route('admin.religions.index')->with('success', "Religion '{$religionName}' deleted successfully!");
        } catch (\Exception $e) {
            \Log::error('Error deleting religion: ' . $e->getMessage());
            return redirect()->route('admin.religions.index')->with('error', 'Failed to delete religion. It may be linked to other records.');
        }
    }
}
