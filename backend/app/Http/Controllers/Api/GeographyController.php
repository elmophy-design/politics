<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lga;
use App\Models\PollingUnit;
use App\Models\State;
use App\Models\Ward;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

/**
 * Manages the states → LGAs → wards → polling units hierarchy that the
 * Election Situation Room, Volunteer Portal, and Constituency Tracker all
 * depend on. Public reads (dropdowns need this before login); writes are
 * ward-coordinator+ only.
 */
class GeographyController extends Controller
{
    use ApiResponse;

    public function states()
    {
        return $this->success(State::with('lgas')->orderBy('name')->get());
    }

    public function wards(Request $request)
    {
        $query = Ward::with('lga.state')->withCount('pollingUnits')->orderBy('name');

        if ($request->filled('lga_id')) {
            $query->where('lga_id', $request->integer('lga_id'));
        }

        return $this->success($query->get());
    }

    public function storeWard(Request $request)
    {
        $validated = $request->validate([
            'lga_id' => ['required', 'exists:lgas,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
        ]);

        $ward = Ward::create($validated);

        return $this->success($ward, 'Ward created', 201);
    }

    public function updateWard(Request $request, Ward $ward)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
        ]);

        $ward->update($validated);

        return $this->success($ward, 'Ward updated');
    }

    public function destroyWard(Ward $ward)
    {
        $ward->delete();

        return $this->success(null, 'Ward deleted');
    }

    public function pollingUnits(Request $request)
    {
        $query = PollingUnit::with('ward.lga')->orderBy('name');

        if ($request->filled('ward_id')) {
            $query->where('ward_id', $request->integer('ward_id'));
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

        return $this->success($pollingUnit, 'Polling unit created', 201);
    }

    public function updatePollingUnit(Request $request, PollingUnit $pollingUnit)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['sometimes', 'required', 'string', 'max:30', 'unique:polling_units,code,'.$pollingUnit->id],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'registered_voters' => ['nullable', 'integer', 'min:0'],
        ]);

        $pollingUnit->update($validated);

        return $this->success($pollingUnit, 'Polling unit updated');
    }

    public function destroyPollingUnit(PollingUnit $pollingUnit)
    {
        $pollingUnit->delete();

        return $this->success(null, 'Polling unit deleted');
    }
}
