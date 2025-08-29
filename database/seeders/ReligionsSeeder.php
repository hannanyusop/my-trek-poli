<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReligionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $religions = [
            ['name' => 'Islam', 'code' => 'ISLAM', 'is_active' => true],
            ['name' => 'Christianity', 'code' => 'CHRISTIANITY', 'is_active' => true],
            ['name' => 'Buddhism', 'code' => 'BUDDHISM', 'is_active' => true],
            ['name' => 'Hinduism', 'code' => 'HINDUISM', 'is_active' => true],
            ['name' => 'Taoism', 'code' => 'TAOISM', 'is_active' => true],
            ['name' => 'Sikhism', 'code' => 'SIKHISM', 'is_active' => true],
            ['name' => 'Others', 'code' => 'OTHERS', 'is_active' => true],
        ];

        DB::table('religions')->insert($religions);
    }
}
