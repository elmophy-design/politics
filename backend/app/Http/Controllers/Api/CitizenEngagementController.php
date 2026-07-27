<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CitizenReport;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CitizenEngagementController extends Controller
{
    use ApiResponse;

    /**
     * Admin listing — ward coordinators+ triage complaints, issues, requests, and suggestions here.
     */
    public function index(Request $request)
    {
        $query = CitizenReport::with(['ward:id,name', 'assignee:id,name'])->latest();

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('ward_id')) {
            $query->where('ward_id', $request->integer('ward_id'));
        }

        return $this->success($query->paginate($request->integer('per_page', 25)));
    }

    /**
     * Public submission — the contact/citizen-engagement form on the public site posts here.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:complaint,issue,request,suggestion'],
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email'],
            'ward_id' => ['nullable', 'exists:wards,id'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'photos' => ['nullable', 'array'],
        ]);

        $validated['status'] = 'submitted';

        $report = CitizenReport::create($validated);

        return $this->success($report, 'Thank you — your submission has been received.', 201);
    }

    /**
     * Ward coordinator+ assigns a report to a staff member for follow-up.
     */
    public function assign(Request $request, CitizenReport $citizenReport)
    {
        $validated = $request->validate([
            'assigned_to' => ['required', 'exists:users,id'],
        ]);

        $citizenReport->update([...$validated, 'status' => 'assigned']);

        return $this->success($citizenReport, 'Report assigned');
    }

    /**
     * Update resolution status/notes as the report is worked.
     */
    public function updateStatus(Request $request, CitizenReport $citizenReport)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:submitted,assigned,in_progress,resolved,closed'],
            'resolution_notes' => ['nullable', 'string'],
        ]);

        $citizenReport->update($validated);

        return $this->success($citizenReport, 'Report status updated');
    }
}
