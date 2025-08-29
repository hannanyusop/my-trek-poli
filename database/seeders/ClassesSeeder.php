<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClassesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('classes')->insert([
            [
                'registration_session_track_id' => 1,
                'name' => 'CS101 - Programming Fundamentals A',
                'quota' => 30,
                'current_count' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_track_id' => 1,
                'name' => 'CS101 - Programming Fundamentals B',
                'quota' => 25,
                'current_count' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_track_id' => 2,
                'name' => 'MATH101 - Calculus A',
                'quota' => 35,
                'current_count' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_track_id' => 2,
                'name' => 'MATH101 - Calculus B',
                'quota' => 30,
                'current_count' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_track_id' => 3,
                'name' => 'ENG101 - Engineering Mechanics A',
                'quota' => 28,
                'current_count' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_track_id' => 3,
                'name' => 'ENG101 - Engineering Mechanics B',
                'quota' => 32,
                'current_count' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_track_id' => 4,
                'name' => 'CS201 - Data Structures A',
                'quota' => 30,
                'current_count' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_track_id' => 5,
                'name' => 'MATH201 - Linear Algebra A',
                'quota' => 25,
                'current_count' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_track_id' => 6,
                'name' => 'CS Summer - Intensive Programming',
                'quota' => 20,
                'current_count' => 0,
                'is_active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
