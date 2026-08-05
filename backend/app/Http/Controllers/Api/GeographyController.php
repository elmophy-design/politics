<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Constituency;
use App\Models\ElectionResult;
use App\Models\Lga;
use App\Models\PollingUnit;
use App\Models\State;
use App\Models\Ward;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

/**
 * Geography hierarchy for the Situation Room:
 *   State → LGA → Constituency → Ward → Polling Unit
 *
 * Constituencies are the campaign's electoral units. Admins create them,
 * attach wards (and polling units), and live collation charts read those
 * counts automatically.
 */
class GeographyController extends Controller
{
    use ApiResponse;

    // ------------------------------------------------------------------
    // Public reads
    // ------------------------------------------------------------------

    public function states()
    {
        return $this->success(State::with('lgas')->orderBy('name')->get());
    }

    public function constituencies(Request $request)
    {
        $query = Constituency::with('state')
            ->withCount(['wards', 'pollingUnits'])
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($request->boolean('active_only')) {
            $query->active();
        }

        if ($request->filled('state_id')) {
            $query->where('state_id', $request->integer('state_id'));
        }

        return $this->success($query->get());
    }

    /**
     * Full tree for one constituency: wards → polling units + result progress.
     * Powers the admin setup UI and can feed the live map.
     */
    public function constituencyTree(Constituency $constituency)
    {
        $constituency->load(['state']);

        $wards = Ward::with(['lga', 'pollingUnits'])
            ->withCount('pollingUnits')
            ->where('constituency_id', $constituency->id)
            ->orderBy('name')
            ->get();

        $wardIds = $wards->pluck('id');
        $puIds = PollingUnit::whereIn('ward_id', $wardIds)->pluck('id');

        $verifiedByPu = ElectionResult::where('status', 'verified')
            ->whereIn('polling_unit_id', $puIds)
            ->get(['polling_unit_id', 'party_votes'])
            ->groupBy('polling_unit_id');

        $treeWards = $wards->map(function (Ward $ward) use ($verifiedByPu) {
            $units = $ward->pollingUnits->map(function (PollingUnit $pu) use ($verifiedByPu) {
                $results = $verifiedByPu->get($pu->id, collect());
                $hasResult = $results->isNotEmpty();
                $tally = [];
                foreach ($results as $r) {
                    foreach ($r->party_votes ?? [] as $party => $votes) {
                        $tally[$party] = ($tally[$party] ?? 0) + (int) $votes;
                    }
                }

                return [
                    'id' => $pu->id,
                    'name' => $pu->name,
                    'code' => $pu->code,
                    'registered_voters' => $pu->registered_voters,
                    'latitude' => $pu->latitude,
                    'longitude' => $pu->longitude,
                    'has_verified_result' => $hasResult,
                    'party_votes' => $tally,
                ];
            });

            $reported = $units->where('has_verified_result', true)->count();
            $total = $units->count();

            return [
                'id' => $ward->id,
                'name' => $ward->name,
                'code' => $ward->code,
                'lga' => $ward->lga ? ['id' => $ward->lga->id, 'name' => $ward->lga->name] : null,
                'polling_units_count' => $total,
                'results_received' => $reported,
                'percentage_completed' => $total > 0 ? round(($reported / $total) * 100, 1) : 0,
                'polling_units' => $units->values(),
            ];
        });

        $totalPu = $treeWards->sum('polling_units_count');
        $reportedPu = $treeWards->sum('results_received');

        return $this->success([
            'constituency' => $constituency->only(['id', 'name', 'code', 'type', 'description', 'is_active', 'state_id']),
            'state' => $constituency->state?->only(['id', 'name', 'code']),
            'summary' => [
                'wards' => $treeWards->count(),
                'polling_units' => $totalPu,
                'results_received' => $reportedPu,
                'percentage_completed' => $totalPu > 0 ? round(($reportedPu / $totalPu) * 100, 2) : 0,
            ],
            'wards' => $treeWards->values(),
        ]);
    }

    public function storeConstituency(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:30', 'unique:constituencies,code'],
            'type' => ['nullable', 'in:federal,state,senatorial,lga,other'],
            'state_id' => ['nullable', 'exists:states,id'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $c = Constituency::create($validated);

        return $this->success($c->load('state')->loadCount(['wards', 'pollingUnits']), 'Constituency created', 201);
    }

    public function updateConstituency(Request $request, Constituency $constituency)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:30', 'unique:constituencies,code,'.$constituency->id],
            'type' => ['nullable', 'in:federal,state,senatorial,lga,other'],
            'state_id' => ['nullable', 'exists:states,id'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $constituency->update($validated);

        return $this->success(
            $constituency->fresh()->load('state')->loadCount(['wards', 'pollingUnits']),
            'Constituency updated'
        );
    }

    public function destroyConstituency(Constituency $constituency)
    {
        // Detach wards (keep them under LGA) rather than cascade-delete geography
        Ward::where('constituency_id', $constituency->id)->update(['constituency_id' => null]);
        $constituency->delete();

        return $this->success(null, 'Constituency deleted');
    }

    // ------------------------------------------------------------------
    // Wards
    // ------------------------------------------------------------------

    public function wards(Request $request)
    {
        $query = Ward::with(['lga.state', 'constituency'])
            ->withCount('pollingUnits')
            ->orderBy('name');

        if ($request->filled('lga_id')) {
            $query->where('lga_id', $request->integer('lga_id'));
        }

        if ($request->filled('constituency_id')) {
            $query->where('constituency_id', $request->integer('constituency_id'));
        }

        return $this->success($query->get());
    }

    public function storeWard(Request $request)
    {
        $validated = $request->validate([
            'lga_id' => ['required', 'exists:lgas,id'],
            'constituency_id' => ['nullable', 'exists:constituencies,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
        ]);

        $ward = Ward::create($validated);

        return $this->success(
            $ward->load(['lga', 'constituency'])->loadCount('pollingUnits'),
            'Ward created',
            201
        );
    }

    public function updateWard(Request $request, Ward $ward)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
            'lga_id' => ['sometimes', 'exists:lgas,id'],
            'constituency_id' => ['nullable', 'exists:constituencies,id'],
        ]);

        $ward->update($validated);

        return $this->success(
            $ward->fresh()->load(['lga', 'constituency'])->loadCount('pollingUnits'),
            'Ward updated'
        );
    }

    public function destroyWard(Ward $ward)
    {
        if ($ward->pollingUnits()->exists()) {
            return $this->error('Remove polling units under this ward first.', 422);
        }

        $ward->delete();

        return $this->success(null, 'Ward deleted');
    }

    // ------------------------------------------------------------------
    // Polling units
    // ------------------------------------------------------------------

    public function pollingUnits(Request $request)
    {
        $query = PollingUnit::with(['ward.lga', 'ward.constituency'])->orderBy('name');

        if ($request->filled('ward_id')) {
            $query->where('ward_id', $request->integer('ward_id'));
        }

        if ($request->filled('constituency_id')) {
            $query->whereHas('ward', fn ($q) => $q->where('constituency_id', $request->integer('constituency_id')));
        }

        return $this->success($query->paginate($request->integer('per_page', 50)));
    }

    public function storePollingUnit(Request $request)
    {
        $validated = $request->validate([
            'ward_id' => ['required', 'exists:wards,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:30', 'unique:polling_units,code'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'registered_voters' => ['nullable', 'integer', 'min:0'],
        ]);

        $pollingUnit = PollingUnit::create($validated);

        return $this->success(
            $pollingUnit->load('ward'),
            'Polling unit created',
            201
        );
    }

    public function updatePollingUnit(Request $request, PollingUnit $pollingUnit)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['sometimes', 'required', 'string', 'max:30', 'unique:polling_units,code,'.$pollingUnit->id],
            'ward_id' => ['sometimes', 'exists:wards,id'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'registered_voters' => ['nullable', 'integer', 'min:0'],
        ]);

        $pollingUnit->update($validated);

        return $this->success($pollingUnit->fresh()->load('ward'), 'Polling unit updated');
    }

    public function destroyPollingUnit(PollingUnit $pollingUnit)
    {
        if ($pollingUnit->electionResults()->exists()) {
            return $this->error('This polling unit has submitted results and cannot be deleted.', 422);
        }

        $pollingUnit->delete();

        return $this->success(null, 'Polling unit deleted');
    }
}
