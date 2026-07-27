<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConstituencyProject;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ConstituencyController extends Controller
{
    use ApiResponse;

    /**
     * Public + admin listing of constituency projects, filterable by ward,
     * status, and project type — this is the transparency tracker citizens use
     * to see what's being built where.
     */
    public function index(Request $request)
    {
        $query = ConstituencyProject::with('ward:id,name')->latest();

        if ($request->filled('ward_id')) {
            $query->where('ward_id', $request->integer('ward_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('project_type')) {
            $query->where('project_type', $request->string('project_type'));
        }

        return $this->success($query->paginate($request->integer('per_page', 15)));
    }

    public function show(ConstituencyProject $constituencyProject)
    {
        return $this->success($constituencyProject->load('ward'));
    }

    /**
     * Ward coordinator+ logs a new project. Budget/contractor are optional
     * per the spec — some projects are tracked before contract award.
     */
    public function store(Request $request)
    {
        $validated = $this->validated($request);

        $project = ConstituencyProject::create($validated);

        return $this->success($project, 'Constituency project logged', 201);
    }

    public function update(Request $request, ConstituencyProject $constituencyProject)
    {
        $validated = $this->validated($request);

        $constituencyProject->update($validated);

        return $this->success($constituencyProject, 'Constituency project updated');
    }

    /**
     * Quick progress-percentage + photo update — the common weekly action,
     * split from the full update() so field staff don't need every field.
     */
    public function updateProgress(Request $request, ConstituencyProject $constituencyProject)
    {
        $validated = $request->validate([
            'progress_percentage' => ['required', 'integer', 'min:0', 'max:100'],
            'status' => ['sometimes', 'in:planned,ongoing,completed,stalled'],
            'photo_gallery' => ['nullable', 'array'],
        ]);

        $constituencyProject->update($validated);

        return $this->success($constituencyProject, 'Progress updated');
    }

    public function destroy(ConstituencyProject $constituencyProject)
    {
        $constituencyProject->delete();

        return $this->success(null, 'Constituency project deleted');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'ward_id' => ['nullable', 'exists:wards,id'],
            'community' => ['nullable', 'string', 'max:255'],
            'project_type' => ['required', 'string', 'max:255'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'contractor' => ['nullable', 'string', 'max:255'],
            'progress_percentage' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'status' => ['sometimes', 'in:planned,ongoing,completed,stalled'],
            'description' => ['nullable', 'string'],
            'photo_gallery' => ['nullable', 'array'],
        ]);
    }
}
