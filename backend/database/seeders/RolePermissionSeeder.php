<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Roles from the project spec, each with a starter permission set.
     * Super Admin implicitly bypasses all checks via Gate::before in AppServiceProvider.
     */
    public function run(): void
    {
        $roles = [
            'super-admin' => ['*'],
            'campaign-director' => [
                'campaigns.manage', 'campaign-events.manage', 'volunteers.manage', 'reports.view',
            ],
            'media-team' => [
                'media.manage', 'gallery.manage',
            ],
            'foundation-admin' => [
                'foundation.manage', 'beneficiaries.manage',
            ],
            'ward-coordinator' => [
                'volunteers.view', 'constituency-projects.manage', 'citizen-reports.manage',
            ],
            'polling-agent' => [
                'election-results.submit', 'incidents.report',
            ],
            'content-manager' => [
                'media.manage', 'news.manage',
            ],
        ];

        $allPermissions = collect($roles)->flatten()->unique()->reject(fn ($p) => $p === '*');

        foreach ($allPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        foreach ($roles as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

            if ($permissions === ['*']) {
                $role->syncPermissions(Permission::all());
            } else {
                $role->syncPermissions($permissions);
            }
        }
    }
}
