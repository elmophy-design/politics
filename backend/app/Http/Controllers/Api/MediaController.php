<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    use ApiResponse;

    /**
     * Public browsing (published only) and admin browsing (everything, incl. drafts)
     * of the Media Centre — press releases, videos, interviews, downloads, gallery
     * images, and livestream links. Filterable by `type` and `category`.
     */
    public function index(Request $request)
    {
        $query = Media::with('uploader:id,name')->latest();

        if (! $request->user()) {
            $query->where('is_published', true);
        } elseif ($request->boolean('published_only')) {
            $query->where('is_published', true);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        return $this->success($query->paginate($request->integer('per_page', 24)));
    }

    /**
     * Distinct, non-empty categories for a given type — powers the gallery's
     * category chips without the frontend having to guess what exists.
     */
    public function categories(Request $request)
    {
        $categories = Media::where('is_published', true)
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->string('type')))
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return $this->success($categories);
    }

    /**
     * Public single-item lookup by slug — used for full news article pages.
     * Falls back to numeric id lookup so admin tooling can link by id too.
     */
    public function show(string $slug)
    {
        $media = Media::where('slug', $slug)->orWhere('id', $slug)->firstOrFail();

        if (! $media->is_published && ! request()->user()) {
            abort(404);
        }

        return $this->success($media);
    }

    /**
     * Media/content team uploads a new item. Accepts either a direct file
     * upload (stored on the public disk) or an external_url (e.g. a YouTube
     * livestream link) — at least one of the two is required. A unique slug
     * is generated from the title automatically.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:press_release,video,interview,download,gallery_image,livestream_link'],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file' => ['nullable', 'file', 'max:20480'], // 20MB
            'external_url' => ['nullable', 'url'],
            'is_published' => ['boolean'],
        ]);

        if (empty($validated['file'] ?? null) && empty($validated['external_url'] ?? null)) {
            return $this->error('Provide either a file upload or an external_url.', 422);
        }

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('media/'.$validated['type'], 'public');
        }

        $media = Media::create([
            'type' => $validated['type'],
            'title' => $validated['title'],
            'slug' => $this->uniqueSlug($validated['title']),
            'category' => $validated['category'] ?? null,
            'description' => $validated['description'] ?? null,
            'file_path' => $filePath,
            'external_url' => $validated['external_url'] ?? null,
            'uploaded_by' => $request->user()->id,
            'is_published' => $validated['is_published'] ?? true,
        ]);

        return $this->success($media, 'Media item uploaded', 201);
    }

    public function update(Request $request, Media $medium)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_published' => ['boolean'],
        ]);

        if (isset($validated['title']) && $validated['title'] !== $medium->title) {
            $validated['slug'] = $this->uniqueSlug($validated['title'], $medium->id);
        }

        $medium->update($validated);

        return $this->success($medium, 'Media item updated');
    }

    public function destroy(Media $medium)
    {
        if ($medium->file_path) {
            Storage::disk('public')->delete($medium->file_path);
        }

        $medium->delete();

        return $this->success(null, 'Media item deleted');
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;

        while (Media::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
