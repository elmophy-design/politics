<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CampaignEvent;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

/**
 * Public + admin management of the Campaign Calendar / Campaign Events —
 * listed under "Campaign Management" in the spec but was never given its
 * own endpoints; CampaignController only ever handled the parent Campaign.
 */
class EventController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = CampaignEvent::with(['campaign:id,title', 'ward:id,name'])->orderBy('starts_at');

        if (! $request->user()) {
            $query->where('starts_at', '>=', now()->subDay());
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('ward_id')) {
            $query->where('ward_id', $request->integer('ward_id'));
        }

        return $this->success($query->paginate($request->integer('per_page', 20)));
    }

    public function show(CampaignEvent $event)
    {
        return $this->success($event->load('campaign', 'ward'));
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);

        $event = CampaignEvent::create($validated);

        return $this->success($event, 'Event created', 201);
    }

    public function update(Request $request, CampaignEvent $event)
    {
        $validated = $this->validated($request);

        $event->update($validated);

        return $this->success($event, 'Event updated');
    }

    public function destroy(CampaignEvent $event)
    {
        $event->delete();

        return $this->success(null, 'Event deleted');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'campaign_id' => ['nullable', 'exists:campaigns,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'venue' => ['nullable', 'string', 'max:255'],
            'ward_id' => ['nullable', 'exists:wards,id'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'status' => ['sometimes', 'in:scheduled,ongoing,completed,cancelled'],
        ]);
    }
}
