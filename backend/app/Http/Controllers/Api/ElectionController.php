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
     * Full live Situation Room payload for the command-centre dashboard.
     * Only verified results count toward party totals and map status.
     */
    public function liveDashboard(Request $request)
    {
        $constituencyId = $request->filled('constituency_id') ? $request->integer('constituency_id') : null;

        $puQuery = PollingUnit::query();
        if ($constituencyId) {
            $puQuery->whereHas('ward', fn ($q) => $q->where('constituency_id', $constituencyId));
        }
        $scopedPuIds = (clone $puQuery)->pluck('id');
        $totalPollingUnits = $scopedPuIds->count();

        $verifiedQuery = ElectionResult::with(['pollingUnit.ward.lga', 'pollingUnit.ward.constituency', 'submitter:id,name'])
            ->where('status', 'verified');
        if ($constituencyId) {
            $verifiedQuery->whereIn('polling_unit_id', $scopedPuIds);
        }
        $verified = $verifiedQuery->latest()->get();

        $pendingQuery = ElectionResult::where('status', 'pending');
        $flaggedQuery = ElectionResult::where('status', 'flagged');
        if ($constituencyId) {
            $pendingQuery->whereIn('polling_unit_id', $scopedPuIds);
            $flaggedQuery->whereIn('polling_unit_id', $scopedPuIds);
        }
        $pendingCount = $pendingQuery->count();
        $flaggedCount = $flaggedQuery->count();

        // Party tally
        $tally = [];
        foreach ($verified as $result) {
            foreach ($result->party_votes ?? [] as $party => $votes) {
                $tally[$party] = ($tally[$party] ?? 0) + (int) $votes;
            }
        }
        arsort($tally);

        $totalValidVotes = array_sum($tally);
        $resultsReceived = $verified->pluck('polling_unit_id')->unique()->count();
        $percentageCompleted = $totalPollingUnits > 0
            ? round(($resultsReceived / $totalPollingUnits) * 100, 2)
            : 0;

        // Identify leading candidate party (APC for Lucky Eseigbe by convention in this campaign)
        $candidateParty = 'APC';
        $candidateVotes = $tally[$candidateParty] ?? 0;
        $otherVotes = $totalValidVotes - $candidateVotes;

        $partyBreakdown = [];
        foreach ($tally as $party => $votes) {
            $partyBreakdown[] = [
                'party' => $party,
                'votes' => $votes,
                'percentage' => $totalValidVotes > 0 ? round(($votes / $totalValidVotes) * 100, 2) : 0,
            ];
        }

        // Results by LGA
        $byLga = [];
        $lgaPuQuery = PollingUnit::with('ward.lga');
        if ($constituencyId) {
            $lgaPuQuery->whereIn('id', $scopedPuIds);
        }
        $lgaUnits = $lgaPuQuery->get()->groupBy(fn ($pu) => optional(optional($pu->ward)->lga)->name ?? 'Unknown');
        foreach ($lgaUnits as $lgaName => $units) {
            $unitIds = $units->pluck('id');
            $lgaVerified = $verified->whereIn('polling_unit_id', $unitIds);
            $lgaTally = [];
            foreach ($lgaVerified as $r) {
                foreach ($r->party_votes ?? [] as $p => $v) {
                    $lgaTally[$p] = ($lgaTally[$p] ?? 0) + (int) $v;
                }
            }
            $reported = $lgaVerified->pluck('polling_unit_id')->unique()->count();
            $totalInLga = $units->count();
            $candidateLga = $lgaTally[$candidateParty] ?? 0;
            $byLga[] = [
                'lga' => $lgaName,
                'percentage_completed' => $totalInLga > 0 ? round(($reported / $totalInLga) * 100, 2) : 0,
                'candidate_votes' => $candidateLga,
                'total_votes' => array_sum($lgaTally),
                'units_reported' => $reported,
                'units_total' => $totalInLga,
            ];
        }
        usort($byLga, fn ($a, $b) => $b['percentage_completed'] <=> $a['percentage_completed']);

        // Top performing wards (by candidate votes)
        $byWard = [];
        $wardPuQuery = PollingUnit::with('ward');
        if ($constituencyId) {
            $wardPuQuery->whereIn('id', $scopedPuIds);
        }
        $wardUnits = $wardPuQuery->get()->groupBy(fn ($pu) => optional($pu->ward)->id);
        foreach ($wardUnits as $wardId => $units) {
            if (! $wardId) {
                continue;
            }
            $ward = $units->first()->ward;
            $unitIds = $units->pluck('id');
            $wardVerified = $verified->whereIn('polling_unit_id', $unitIds);
            $wardTally = [];
            foreach ($wardVerified as $r) {
                foreach ($r->party_votes ?? [] as $p => $v) {
                    $wardTally[$p] = ($wardTally[$p] ?? 0) + (int) $v;
                }
            }
            $reported = $wardVerified->pluck('polling_unit_id')->unique()->count();
            $totalInWard = $units->count();
            $byWard[] = [
                'ward' => $ward->name ?? 'Unknown',
                'ward_id' => $wardId,
                'percentage_completed' => $totalInWard > 0 ? round(($reported / $totalInWard) * 100, 2) : 0,
                'candidate_votes' => $wardTally[$candidateParty] ?? 0,
                'units_reported' => $reported,
                'units_total' => $totalInWard,
            ];
        }
        usort($byWard, fn ($a, $b) => $b['candidate_votes'] <=> $a['candidate_votes']);
        $topWards = array_slice($byWard, 0, 6);

        // Map status per ward: strong lead / leading / close / trailing / no result
        // Include every ward that has polling units so the map reflects admin setup.
        $mapWards = [];
        foreach ($byWard as $w) {
            $status = 'no_result';
            if ($w['units_reported'] > 0) {
                $status = $w['percentage_completed'] >= 80
                    ? 'strong_lead'
                    : ($w['percentage_completed'] >= 50 ? 'leading' : 'close');
            }
            $mapWards[] = [
                'ward' => $w['ward'],
                'ward_id' => $w['ward_id'],
                'status' => $status,
                'candidate_votes' => $w['candidate_votes'],
                'percentage_completed' => $w['percentage_completed'],
                'units_reported' => $w['units_reported'],
                'units_total' => $w['units_total'],
            ];
        }

        // Ensure wards with zero PUs still appear if they exist in scope
        if ($mapWards === [] && $totalPollingUnits === 0) {
            $emptyWardQuery = \App\Models\Ward::query()->orderBy('name');
            if ($constituencyId) {
                $emptyWardQuery->where('constituency_id', $constituencyId);
            }
            foreach ($emptyWardQuery->limit(48)->get(['id', 'name']) as $ew) {
                $mapWards[] = [
                    'ward' => $ew->name,
                    'ward_id' => $ew->id,
                    'status' => 'no_result',
                    'candidate_votes' => 0,
                    'percentage_completed' => 0,
                    'units_reported' => 0,
                    'units_total' => 0,
                ];
            }
        }

        // Latest results (most recent verified)
        $latest = $verified->take(6)->map(function ($r) use ($candidateParty) {
            $pv = $r->party_votes ?? [];
            return [
                'id' => $r->id,
                'polling_unit' => $r->pollingUnit->name ?? 'Unknown',
                'ward' => optional($r->pollingUnit->ward)->name,
                'party_votes' => $pv,
                'candidate_votes' => $pv[$candidateParty] ?? 0,
                'submitted_at' => $r->updated_at?->toIso8601String(),
            ];
        })->values();

        // Open incidents
        $incidents = Incident::with(['pollingUnit', 'ward', 'reporter:id,name'])
            ->whereIn('status', ['reported', 'under_review'])
            ->orderByRaw("FIELD(severity, 'critical', 'high', 'medium', 'low')")
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($i) => [
                'id' => $i->id,
                'title' => $i->title,
                'severity' => $i->severity,
                'status' => $i->status,
                'polling_unit' => optional($i->pollingUnit)->name,
                'ward' => optional($i->ward)->name,
                'reported_at' => $i->created_at?->toIso8601String(),
            ]);

        // Simple trend: cumulative candidate vs others by hour of verified_at (fallback created_at)
        $trendBuckets = [];
        foreach ($verified->sortBy('verified_at') as $r) {
            $ts = $r->verified_at ?? $r->created_at;
            if (! $ts) {
                continue;
            }
            $key = $ts->format('H:00');
            if (! isset($trendBuckets[$key])) {
                $trendBuckets[$key] = ['time' => $key, 'candidate' => 0, 'others' => 0];
            }
            foreach ($r->party_votes ?? [] as $p => $v) {
                if ($p === $candidateParty) {
                    $trendBuckets[$key]['candidate'] += (int) $v;
                } else {
                    $trendBuckets[$key]['others'] += (int) $v;
                }
            }
        }
        // cumulative
        $cumC = 0;
        $cumO = 0;
        $trend = [];
        foreach ($trendBuckets as $b) {
            $cumC += $b['candidate'];
            $cumO += $b['others'];
            $trend[] = ['time' => $b['time'], 'candidate' => $cumC, 'others' => $cumO];
        }

        return $this->success([
            'total_polling_units' => $totalPollingUnits,
            'results_received' => $resultsReceived,
            'percentage_completed' => $percentageCompleted,
            'total_valid_votes' => $totalValidVotes,
            'candidate' => [
                'name' => 'Lucky Eseigbe',
                'party' => $candidateParty,
                'votes' => $candidateVotes,
                'percentage' => $totalValidVotes > 0 ? round(($candidateVotes / $totalValidVotes) * 100, 2) : 0,
            ],
            'other_parties' => [
                'votes' => $otherVotes,
                'percentage' => $totalValidVotes > 0 ? round(($otherVotes / $totalValidVotes) * 100, 2) : 0,
            ],
            'party_breakdown' => $partyBreakdown,
            'results_by_lga' => $byLga,
            'top_wards' => $topWards,
            'map_wards' => $mapWards,
            'latest_results' => $latest,
            'incidents' => $incidents,
            'trend' => $trend,
            'pending_results' => $pendingCount,
            'flagged_results' => $flaggedCount,
            'constituency_id' => $constituencyId,
            'wards_count' => count($byWard),
            'lgas_count' => count($byLga),
            'updated_at' => now()->toIso8601String(),
        ]);
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

