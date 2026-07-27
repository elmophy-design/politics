<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CampaignController extends Controller
{
    use ApiResponse;

    /**
     * Public + admin listing. Public callers only ever see 'active' campaigns.
     */
    public function index(Request $request)
    {
        $query = Campaign::query()->withCount('events')->latest();

        if (! $request->user()) {
            $query->where('status', 'active');
        } elseif ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return $this->success($query->paginate($request->integer('per_page', 15)));
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $validated['slug'] = $this->uniqueSlug($validated['title']);
        $validated['created_by'] = $request->user()->id;

        $campaign = Campaign::create($validated);

        return $this->success($campaign, 'Campaign created', 201);
    }

    public function show(Campaign $campaign)
    {
        return $this->success($campaign->load('events')->loadCount('donations'));
    }

    public function update(Request $request, Campaign $campaign)
    {
        $validated = $this->validated($request, $campaign->id);

        if (isset($validated['title']) && $validated['title'] !== $campaign->title) {
            $validated['slug'] = $this->uniqueSlug($validated['title'], $campaign->id);
        }

        $campaign->update($validated);

        return $this->success($campaign, 'Campaign updated');
    }

    public function destroy(Campaign $campaign)
    {
        $campaign->delete();

        return $this->success(null, 'Campaign archived');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'summary' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:draft,active,paused,completed,archived'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;

        while (Campaign::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
