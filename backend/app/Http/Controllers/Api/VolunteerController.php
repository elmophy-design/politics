<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Volunteer;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class VolunteerController extends Controller
{
    use ApiResponse;

    /**
     * Admin listing — ward coordinators+ review and approve volunteer signups.
     */
    public function index(Request $request)
    {
        $query = Volunteer::with(['ward:id,name', 'pollingUnit:id,name'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('ward_id')) {
            $query->where('ward_id', $request->integer('ward_id'));
        }

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(fn ($q) => $q->where('full_name', 'like', "%{$term}%")->orWhere('phone', 'like', "%{$term}%"));
        }

        return $this->success($query->paginate($request->integer('per_page', 25)));
    }

    /**
     * Public self-registration — the Volunteer & Membership Portal form on the public site.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email'],
            'address' => ['nullable', 'string', 'max:500'],
            'ward_id' => ['nullable', 'exists:wards,id'],
            'polling_unit_id' => ['nullable', 'exists:polling_units,id'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'in:male,female,other'],
            'skills' => ['nullable', 'array'],
            'areas_of_interest' => ['nullable', 'array'],
        ]);

        $validated['user_id'] = $request->user()?->id;
        $validated['status'] = 'pending';

        $volunteer = Volunteer::create($validated);

        return $this->success($volunteer, 'Thank you for signing up — your registration is pending review.', 201);
    }

    public function show(Volunteer $volunteer)
    {
        return $this->success($volunteer->load('ward', 'pollingUnit'));
    }

    /**
     * Ward coordinator+ approves or rejects a pending registration.
     */
    public function updateStatus(Request $request, Volunteer $volunteer)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
        ]);

        $volunteer->update($validated);

        return $this->success($volunteer, 'Volunteer status updated');
    }

    public function destroy(Volunteer $volunteer)
    {
        $volunteer->delete();

        return $this->success(null, 'Volunteer record removed');
    }
}
