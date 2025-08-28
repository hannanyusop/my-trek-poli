<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create placement permissions
        $permissions = [
            'placement-manage',
            'placement-read', 
            'placement-create',
            'placement-edit',
            'placement-delete',
            'placement-release',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        
        // Assign all permissions to admin role
        $adminRole->syncPermissions($permissions);

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role to user
        $admin->assignRole('admin');
    }
}
