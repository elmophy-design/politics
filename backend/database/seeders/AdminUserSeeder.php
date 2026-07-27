<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Creates the first Super Admin. Change this password immediately after first login.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@luckyeseigbe.org'],
            [
                'name' => 'Platform Administrator',
                'password' => Hash::make('ChangeMe!12345'),
                'is_active' => true,
            ]
        );

        if (! $admin->hasRole('super-admin')) {
            $admin->assignRole('super-admin');
        }
    }
}
