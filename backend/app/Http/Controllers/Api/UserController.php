<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

/**
 * Super-admin-only staff management — invite a team member, assign one of
 * the 7 spec roles, deactivate access. Public self-registration (AuthController)
 * creates accounts with no role; this is how they get one.
 */
class UserController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = User::with('roles:id,name')->latest();

        if ($request->filled('role')) {
            $query->whereHas('roles', fn ($q) => $q->where('name', $request->string('role')));
        }

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(fn ($q) => $q->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%"));
        }

        return $this->success($query->paginate($request->integer('per_page', 25)));
    }

    public function roles()
    {
        return $this->success(Role::orderBy('name')->pluck('name'));
    }

    public function show(User $user)
    {
        return $this->success($user->load('roles'));
    }

    /**
     * Invite a staff member directly with a role already assigned (skips the
     * public self-registration + manual promotion flow for admin-created accounts).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'role' => ['required', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        $user->assignRole($validated['role']);

        return $this->success($user->load('roles'), 'Staff account created', 201);
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => ['required', 'exists:roles,name'],
        ]);

        $user->syncRoles([$validated['role']]);

        return $this->success($user->load('roles'), 'Role updated');
    }

    public function updateStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $user->update($validated);

        return $this->success($user, $validated['is_active'] ? 'Account activated' : 'Account deactivated');
    }
}
