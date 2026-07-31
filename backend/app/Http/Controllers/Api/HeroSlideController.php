<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HeroSlideController extends Controller
{
    use ApiResponse;

    public function indexPublic()
    {
        $slides = HeroSlide::active()->ordered()->get();
        return $this->success($slides);
    }

    public function index()
    {
        $slides = HeroSlide::ordered()->get();
        return $this->success($slides);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'eyebrow' => ['nullable', 'string', 'max:255'],
            'headline' => ['required', 'string', 'max:500'],
            'headline_highlight' => ['nullable', 'string', 'max:500'],
            'quote' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'image', 'max:10240'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('hero-slides', 'public');
        }

        $maxOrder = HeroSlide::max('sort_order') ?? 0;

        $slide = HeroSlide::create([
            'eyebrow' => $validated['eyebrow'] ?? null,
            'headline' => $validated['headline'],
            'headline_highlight' => $validated['headline_highlight'] ?? null,
            'quote' => $validated['quote'] ?? null,
            'image_path' => $imagePath,
            'sort_order' => $validated['sort_order'] ?? ($maxOrder + 1),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return $this->success($slide, 'Hero slide created', 201);
    }

    public function update(Request $request, HeroSlide $heroSlide)
    {
        $validated = $request->validate([
            'eyebrow' => ['nullable', 'string', 'max:255'],
            'headline' => ['sometimes', 'required', 'string', 'max:500'],
            'headline_highlight' => ['nullable', 'string', 'max:500'],
            'quote' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'image', 'max:10240'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        if ($request->hasFile('image')) {
            if ($heroSlide->image_path) {
                Storage::disk('public')->delete($heroSlide->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('hero-slides', 'public');
        }

        unset($validated['image']);
        $heroSlide->update($validated);

        return $this->success($heroSlide->fresh(), 'Hero slide updated');
    }

    public function destroy(HeroSlide $heroSlide)
    {
        if ($heroSlide->image_path) {
            Storage::disk('public')->delete($heroSlide->image_path);
        }
        $heroSlide->delete();
        return $this->success(null, 'Hero slide deleted');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:hero_slides,id'],
        ]);

        foreach ($validated['order'] as $index => $id) {
            HeroSlide::where('id', $id)->update(['sort_order' => $index]);
        }

        return $this->success(HeroSlide::ordered()->get(), 'Order updated');
    }
}