<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ElectionResult;
use App\Models\Incident;
use App\Models\PollingUnit;
use App\Models\Ward;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ElectionController extends Controller
{
    use ApiResponse;

    // ---------------------------------------------------------------
    // Result submission & verification
    // ---------------------------------------------------------------

    /**
     * List results, filterable by ward, polling unit, or status.
     * Ward coordinators+ see everything; polling agents see only their own submissions.
     */
    public function results(Request $request)
    {
        $query = ElectionResult::with(['pollingUnit.ward', 'submitter:id,name'])->latest();

        if ($request->user()->hasRole('polling-agent') && ! $request->user()->hasAnyRole(['ward-coordinator', 'campaign-director', 'super-admin'])) {
            $query->where('submitted_by', $request->user()->id);
        }

        if ($request->filled('ward_id')) {
            $query->whereHas('pollingUnit', fn ($q) => $q->where('ward_id', $request->integer('ward_id')));
        }

        if ($request->filled('polling_unit_id')) {
            $query->where('polling_unit_id', $request->integer('polling_unit_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return $this->success($query->paginate($request->integer('per_page', 25)));
    }

    /**
     * Polling agent submits a result sheet for their assigned polling unit.
     * party_votes example: {"APC": 214, "PDP": 178, "LP": 96}
     */
    public function submitResult(Request $request)
    {
        $validated = $request->validate([
            'polling_unit_id' => ['required', 'exists:polling_units,id'],
            'party_agent_name' => ['nullable', 'string', 'max:255'],
            'party_votes' => ['required', 'array', 'min:1'],
            'party_votes.*' => ['required', 'integer', 'min:0'],
            'total_accredited_voters' => ['nullable', 'integer', 'min:0'],
            'total_votes_cast' => ['nullable', 'integer', 'min:0'],
            'result_sheet_image' => ['nullable', 'string'],
        ]);

        $validated['submitted_by'] = $request->user()->id;
        $validated['status'] = 'pending';

        $result = ElectionResult::create($validated);

        return $this->success($result, 'Result submitted for verification', 201);
    }

    /**
     * Ward coordinator+ verifies, flags, or rejects a submitted result.
     * Flagging/rejecting keeps the entry (for audit) but excludes it from collation totals.
     */
    public function verifyResult(Request $request, ElectionResult $result)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:verified,flagged,rejected'],
        ]);

        $result->update([
            'status' => $validated['status'],
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return $this->success($result, 'Result status updated');
    }

    // ---------------------------------------------------------------
    // Incidents
    // ---------------------------------------------------------------

    public function incidents(Request $request)
    {
        $query = Incident::with(['pollingUnit', 'ward', 'reporter:id,name'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('severity')) {
            $query->where('severity', $request->string('severity'));
        }

        return $this->success($query->paginate($request->integer('per_page', 25)));
    }

    public function reportIncident(Request $request)
    {
        $validated = $request->validate([
            'polling_unit_id' => ['nullable', 'exists:polling_units,id'],
            'ward_id' => ['nullable', 'exists:wards,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'severity' => ['required', 'in:low,medium,high,critical'],
            'attachments' => ['nullable', 'array'],
        ]);

        $validated['reported_by'] = $request->user()->id;
        $validated['status'] = 'reported';

        $incident = Incident::create($validated);

        return $this->success($incident, 'Incident reported', 201);
    }

    public function updateIncidentStatus(Request $request, Incident $incident)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:reported,under_review,resolved,dismissed'],
        ]);

        $incident->update($validated);

        return $this->success($incident, 'Incident status updated');
    }

    // ---------------------------------------------------------------
    // Live collation dashboards — only 'verified' results count toward totals
    // ---------------------------------------------------------------

    public function wardDashboard(Ward $ward)
    {
        return $this->success($this->collate(
            ElectionResult::whereHas('pollingUnit', fn ($q) => $q->where('ward_id', $ward->id))
        ) + ['ward' => $ward->only('id', 'name')]);
    }

    public function lgaDashboard(int $lgaId)
    {
        $wards = Ward::where('lga_id', $lgaId)->pluck('id');

        return $this->success($this->collate(
            ElectionResult::whereHas('pollingUnit', fn ($q) => $q->whereIn('ward_id', $wards))
        ));
    }

    public function constituencyDashboard()
    {
        return $this->success($this->collate(ElectionResult::query()));
    }

    /**
     * Sum party_votes across a result query, counting only verified submissions.
     */
    private function collate($query): array
    {
        $verified = (clone $query)->where('status', 'verified')->get(['party_votes', 'total_votes_cast', 'polling_unit_id']);

        $tally = [];
        foreach ($verified as $result) {
            foreach ($result->party_votes as $party => $votes) {
                $tally[$party] = ($tally[$party] ?? 0) + (int) $votes;
            }
        }
        arsort($tally);

        return [
            'party_totals' => $tally,
            'polling_units_reported' => $verified->pluck('polling_unit_id')->unique()->count(),
            'total_votes_cast' => $verified->sum('total_votes_cast'),
            'pending_results' => (clone $query)->where('status', 'pending')->count(),
            'flagged_results' => (clone $query)->where('status', 'flagged')->count(),
        ];
    }
}
