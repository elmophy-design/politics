<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FoundationBeneficiary;
use App\Models\FoundationProject;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FoundationController extends Controller
{
    use ApiResponse;

    /**
     * Public + admin project listing. Public callers only see published-in-spirit
     * projects (all statuses are shown publicly — planned/ongoing/completed are all
     * legitimate transparency content — but draft-like filtering can be layered on
     * later if the Foundation wants unlisted projects).
     */
    public function index(Request $request)
    {
        $query = FoundationProject::with('ward:id,name')->withCount('beneficiaries')->latest();

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return $this->success($query->paginate($request->integer('per_page', 15)));
    }

    public function show(string $slug)
    {
        $project = FoundationProject::with(['ward', 'successStories'])->where('slug', $slug)->orWhere('id', $slug)->firstOrFail();

        return $this->success($project);
    }

    /**
     * Foundation admin creates a new project/scholarship/empowerment/medical-outreach entry.
     */
    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $validated['slug'] = $this->uniqueSlug($validated['title']);

        $project = FoundationProject::create($validated);

        return $this->success($project, 'Foundation project created', 201);
    }

    public function update(Request $request, FoundationProject $foundationProject)
    {
        $validated = $this->validated($request, $foundationProject->id);

        if (isset($validated['title']) && $validated['title'] !== $foundationProject->title) {
            $validated['slug'] = $this->uniqueSlug($validated['title'], $foundationProject->id);
        }

        $foundationProject->update($validated);

        return $this->success($foundationProject, 'Foundation project updated');
    }

    public function destroy(FoundationProject $foundationProject)
    {
        $foundationProject->delete();

        return $this->success(null, 'Foundation project deleted');
    }

    // ---------------------------------------------------------------
    // Beneficiaries
    // ---------------------------------------------------------------

    public function storeBeneficiary(Request $request, FoundationProject $foundationProject)
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'ward_id' => ['nullable', 'exists:wards,id'],
            'story' => ['nullable', 'string'],
            'is_success_story' => ['boolean'],
        ]);

        $validated['foundation_project_id'] = $foundationProject->id;

        $beneficiary = FoundationBeneficiary::create($validated);

        return $this->success($beneficiary, 'Beneficiary added', 201);
    }

    /**
     * Admin listing across all projects — powers the standalone beneficiaries screen.
     */
    public function beneficiaries(Request $request)
    {
        $query = FoundationBeneficiary::with('project:id,title', 'ward:id,name')->latest();

        if ($request->filled('foundation_project_id')) {
            $query->where('foundation_project_id', $request->integer('foundation_project_id'));
        }

        return $this->success($query->paginate($request->integer('per_page', 25)));
    }

    public function updateBeneficiary(Request $request, FoundationBeneficiary $beneficiary)
    {
        $validated = $request->validate([
            'full_name' => ['sometimes', 'required', 'string', 'max:255'],
            'story' => ['nullable', 'string'],
            'is_success_story' => ['boolean'],
        ]);

        $beneficiary->update($validated);

        return $this->success($beneficiary, 'Beneficiary updated');
    }

    public function successStories(Request $request)
    {
        $stories = FoundationBeneficiary::with('project:id,title,slug')
            ->where('is_success_story', true)
            ->latest()
            ->paginate($request->integer('per_page', 12));

        return $this->success($stories);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'category' => ['sometimes', 'required', 'in:project,scholarship,empowerment,medical_outreach'],
            'summary' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string'],
            'ward_id' => ['nullable', 'exists:wards,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'in:planned,ongoing,completed'],
        ]);
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;

        while (FoundationProject::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
