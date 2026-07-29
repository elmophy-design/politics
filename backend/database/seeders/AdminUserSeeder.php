<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Creates the first Super Admin from env vars.
     * ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME must be set — no fallback
     * values are hardcoded here. Change the password immediately after first login.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');
        $name = env('ADMIN_NAME');

        if (! $email || ! $password || ! $name) {
            throw new \RuntimeException(
                'ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME must all be set in the environment before seeding the admin user.'
            );
        }

        $admin = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'is_active' => true,
            ]
        );

        if (! $admin->hasRole('super-admin')) {
            $admin->assignRole('super-admin');
        }
    }
}
