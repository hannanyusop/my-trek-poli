<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegistrationSessionTracksSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('registration_session_tracks')->insert([
            [
                'registration_session_id' => 1,
                'track_id' => 1,
                'name' => 'Computer Science - Semester 1',
                'description' => 'Programming fundamentals, data structures, and software development principles.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_id' => 1,
                'track_id' => 2,
                'name' => 'Mathematics - Semester 1',
                'description' => 'Advanced mathematics courses covering calculus, algebra, and statistics.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_id' => 1,
                'track_id' => 3,
                'name' => 'Engineering - Semester 1',
                'description' => 'Engineering fundamentals covering mechanical, electrical, and civil engineering principles.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_id' => 2,
                'track_id' => 1,
                'name' => 'Computer Science - Semester 2',
                'description' => 'Advanced programming concepts, algorithms, and system design.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_id' => 2,
                'track_id' => 2,
                'name' => 'Mathematics - Semester 2',
                'description' => 'Continuation of mathematics curriculum with focus on differential equations and linear algebra.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_session_id' => 3,
                'track_id' => 1,
                'name' => 'Computer Science - Summer Intensive',
                'description' => 'Intensive programming bootcamp for summer session.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
