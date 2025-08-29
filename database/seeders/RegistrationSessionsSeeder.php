<?php

namespace Database\Seeders;

use App\Enums\RegistrationSessionStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RegistrationSessionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('registration_sessions')->insert([
            [
                'name' => 'Semester 1 2024/2025 Registration',
                'status' => RegistrationSessionStatus::Open->value,
                'link_token' => Str::uuid(),
                'start_date' => now()->subDays(5),
                'end_date' => now()->addDays(30),
                'description' => 'Registration for Semester 1 academic year 2024/2025. Students can register for their preferred courses and classes.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Semester 2 2024/2025 Registration',
                'status' => RegistrationSessionStatus::Draft->value,
                'link_token' => Str::uuid(),
                'start_date' => now()->addMonths(4),
                'end_date' => now()->addMonths(5),
                'description' => 'Registration for Semester 2 academic year 2024/2025. This session is currently in draft mode.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Summer Intensive 2025',
                'status' => RegistrationSessionStatus::Closed->value,
                'link_token' => Str::uuid(),
                'start_date' => now()->subMonths(2),
                'end_date' => now()->subDays(10),
                'description' => 'Summer intensive courses registration. This session has been closed.',
                'created_at' => now()->subMonths(2),
                'updated_at' => now()->subDays(10),
            ],
        ]);
    }
}
