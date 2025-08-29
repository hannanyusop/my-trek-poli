<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RacesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $races = [
            ['name' => 'Malay', 'code' => 'MALAY', 'is_active' => true],
            ['name' => 'Chinese', 'code' => 'CHINESE', 'is_active' => true],
            ['name' => 'Indian', 'code' => 'INDIAN', 'is_active' => true],
            ['name' => 'Others', 'code' => 'OTHERS', 'is_active' => true],
        ];

        DB::table('races')->insert($races);
    }
}
