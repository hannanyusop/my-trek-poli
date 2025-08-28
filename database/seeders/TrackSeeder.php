<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TrackSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tracks = [
            [
                'name' => 'SAP (System Application Development)',
                'description' => 'Comprehensive training in SAP system development, configuration, and business process integration.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Networking',
                'description' => 'Network infrastructure design, implementation, and management including routing, switching, and security.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Cybersecurity Information',
                'description' => 'Information security fundamentals, threat analysis, risk management, and security best practices.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('tracks')->insert($tracks);
    }
}
