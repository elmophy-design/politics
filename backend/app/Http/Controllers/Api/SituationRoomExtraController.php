<?php

namespace App\Http\Controllers\Api;

use App\Events\SituationRoomUpdated;
use App\Http\Controllers\Controller;
use App\Models\ElectionResult;
use App\Models\ElectionResultAudit;
use App\Models\Incident;
use App\Models\Lga;
use App\Models\PollingUnit;
use App\Models\Ward;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Extra Situation Room endpoints: pending queue, audit, drill-down, export, geojson.
 */
class SituationRoomExtraController extends Controller
{
    use ApiResponse;

    /** Pending (and optionally flagged) results for the live queue */
    public function pendingQueue(Request $request)
    {
        $statuses = $request->input('status', 'pending');
        $statusList = is_array($statuses) ? $statuses : explode(',', (string) $statuses);

        $query = ElectionResult::with([
            'pollingUnit.ward.lga',
            'pollingUnit.ward.constituency',
            'submitter:id,name',
        ])
            ->whereIn('status', $statusList)
            ->latest();

        if ($request->filled('constituency_id')) {
            $cid = $request->integer('constituency_id');
            $query->whereHas('pollingUnit.ward', fn ($q) => $q->where('constituency_id', $cid));
        }

        return $this->success($query->paginate($request->integer('per_page', 20)));
    }

    public function auditLog(Request $request)
    {
        $query = ElectionResultAudit::with([
            'user:id,name',
            'result.pollingUnit.ward',
        ])->latest();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }
        if ($request->filled('action')) {
            $query->where('action', $request->string('action'));
        }
        if ($request->filled('election_result_id')) {
            $query->where('election_result_id', $request->integer('election_result_id'));
        }

        return $this->success($query->paginate($request->integer('per_page', 40)));
    }

    /** LGA → wards → polling units drill-down */
    public function drilldown(Request $request)
    {
        $constituencyId = $request->filled('constituency_id') ? $request->integer('constituency_id') : null;
        $lgaId = $request->filled('lga_id') ? $request->integer('lga_id') : null;
        $wardId = $request->filled('ward_id') ? $request->integer('ward_id') : null;

        if ($wardId) {
            $ward = Ward::with(['lga', 'pollingUnits'])->findOrFail($wardId);
            $puIds = $ward->pollingUnits->pluck('id');
            $verified = ElectionResult::where('status', 'verified')
                ->whereIn('polling_unit_id', $puIds)
                ->get()
                ->keyBy('polling_unit_id');

            $units = $ward->pollingUnits->map(function (PollingUnit $pu) use ($verified) {
                $r = $verified->get($pu->id);

                return [
                    'id' => $pu->id,
                    'name' => $pu->name,
                    'code' => $pu->code,
                    'registered_voters' => $pu->registered_voters,
                    'status' => $r ? 'verified' : (
                        ElectionResult::where('polling_unit_id', $pu->id)->where('status', 'pending')->exists()
                            ? 'pending'
                            : (ElectionResult::where('polling_unit_id', $pu->id)->where('status', 'flagged')->exists()
                                ? 'flagged'
                                : 'awaiting')
                    ),
                    'party_votes' => $r?->party_votes ?? null,
                    'result_id' => $r?->id,
                ];
            });

            return $this->success([
                'level' => 'ward',
                'ward' => $ward->only(['id', 'name', 'code']),
                'lga' => $ward->lga?->only(['id', 'name']),
                'polling_units' => $units->values(),
            ]);
        }

        if ($lgaId) {
            $lga = Lga::findOrFail($lgaId);
            $wardsQ = Ward::withCount('pollingUnits')->where('lga_id', $lgaId);
            if ($constituencyId) {
                $wardsQ->where('constituency_id', $constituencyId);
            }
            $wards = $wardsQ->orderBy('name')->get()->map(function (Ward $w) {
                $puIds = PollingUnit::where('ward_id', $w->id)->pluck('id');
                $reported = ElectionResult::where('status', 'verified')
                    ->whereIn('polling_unit_id', $puIds)
                    ->distinct('polling_unit_id')
                    ->count('polling_unit_id');
                $total = $w->polling_units_count;

                return [
                    'id' => $w->id,
                    'name' => $w->name,
                    'code' => $w->code,
                    'units_total' => $total,
                    'units_reported' => $reported,
                    'percentage_completed' => $total > 0 ? round(($reported / $total) * 100, 1) : 0,
                ];
            });

            return $this->success([
                'level' => 'lga',
                'lga' => $lga->only(['id', 'name']),
                'wards' => $wards->values(),
            ]);
        }

        // Top level: LGAs in scope
        $puQ = PollingUnit::with('ward.lga');
        if ($constituencyId) {
            $puQ->whereHas('ward', fn ($q) => $q->where('constituency_id', $constituencyId));
        }
        $grouped = $puQ->get()->groupBy(fn ($pu) => optional(optional($pu->ward)->lga)->id);

        $lgas = [];
        foreach ($grouped as $id => $units) {
            if (! $id) {
                continue;
            }
            $lga = $units->first()->ward->lga;
            $unitIds = $units->pluck('id');
            $reported = ElectionResult::where('status', 'verified')
                ->whereIn('polling_unit_id', $unitIds)
                ->distinct('polling_unit_id')
                ->count('polling_unit_id');
            $total = $units->count();
            $lgas[] = [
                'id' => $lga->id,
                'name' => $lga->name,
                'units_total' => $total,
                'units_reported' => $reported,
                'percentage_completed' => $total > 0 ? round(($reported / $total) * 100, 1) : 0,
            ];
        }
        usort($lgas, fn ($a, $b) => $b['percentage_completed'] <=> $a['percentage_completed']);

        return $this->success(['level' => 'root', 'lgas' => $lgas]);
    }

    /** GeoJSON FeatureCollection for map */
    public function mapGeoJson(Request $request)
    {
        $query = Ward::query()->whereNotNull('geojson');
        if ($request->filled('constituency_id')) {
            $query->where('constituency_id', $request->integer('constituency_id'));
        }
        if ($request->filled('lga_id')) {
            $query->where('lga_id', $request->integer('lga_id'));
        }

        $features = [];
        foreach ($query->get() as $ward) {
            $geo = $ward->geojson;
            if (! $geo) {
                continue;
            }
            // Allow storing raw geometry or full Feature
            if (($geo['type'] ?? '') === 'Feature') {
                $geo['properties'] = array_merge($geo['properties'] ?? [], [
                    'ward_id' => $ward->id,
                    'name' => $ward->name,
                    'code' => $ward->code,
                ]);
                $features[] = $geo;
            } else {
                $features[] = [
                    'type' => 'Feature',
                    'properties' => [
                        'ward_id' => $ward->id,
                        'name' => $ward->name,
                        'code' => $ward->code,
                    ],
                    'geometry' => $geo,
                ];
            }
        }

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }

    public function updateWardGeoJson(Request $request, Ward $ward)
    {
        $validated = $request->validate([
            'geojson' => ['required', 'array'],
            'center_lat' => ['nullable', 'numeric'],
            'center_lng' => ['nullable', 'numeric'],
        ]);

        $ward->update($validated);

        return $this->success($ward->fresh(), 'Ward GeoJSON saved');
    }

    /** CSV export of verified results */
    public function exportResults(Request $request): StreamedResponse
    {
        $query = ElectionResult::with(['pollingUnit.ward.lga', 'submitter', 'verifier'])
            ->where('status', 'verified')
            ->latest('verified_at');

        if ($request->filled('constituency_id')) {
            $cid = $request->integer('constituency_id');
            $query->whereHas('pollingUnit.ward', fn ($q) => $q->where('constituency_id', $cid));
        }

        $rows = $query->get();

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, [
                'result_id', 'polling_unit', 'code', 'ward', 'lga',
                'party_votes_json', 'total_votes_cast', 'accredited',
                'submitted_by', 'verified_by', 'verified_at',
            ]);
            foreach ($rows as $r) {
                fputcsv($out, [
                    $r->id,
                    $r->pollingUnit?->name,
                    $r->pollingUnit?->code,
                    $r->pollingUnit?->ward?->name,
                    $r->pollingUnit?->ward?->lga?->name,
                    json_encode($r->party_votes),
                    $r->total_votes_cast,
                    $r->total_accredited_voters,
                    $r->submitter?->name,
                    $r->verifier?->name,
                    optional($r->verified_at)?->toIso8601String(),
                ]);
            }
            fclose($out);
        }, 'election-results-verified-'.now()->format('Ymd-His').'.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function exportAudit(Request $request): StreamedResponse
    {
        $rows = ElectionResultAudit::with(['user', 'result.pollingUnit'])
            ->latest()
            ->limit(5000)
            ->get();

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['id', 'result_id', 'polling_unit', 'user', 'action', 'from', 'to', 'note', 'at']);
            foreach ($rows as $a) {
                fputcsv($out, [
                    $a->id,
                    $a->election_result_id,
                    $a->result?->pollingUnit?->name,
                    $a->user?->name,
                    $a->action,
                    $a->from_status,
                    $a->to_status,
                    $a->note,
                    $a->created_at?->toIso8601String(),
                ]);
            }
            fclose($out);
        }, 'election-audit-'.now()->format('Ymd-His').'.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    /** Critical incidents for notification bell */
    public function criticalIncidents(Request $request)
    {
        $query = Incident::with(['pollingUnit', 'ward', 'reporter:id,name'])
            ->whereIn('severity', ['high', 'critical'])
            ->whereIn('status', ['reported', 'under_review'])
            ->latest();

        return $this->success([
            'count' => (clone $query)->count(),
            'items' => $query->limit(15)->get(),
        ]);
    }
}
