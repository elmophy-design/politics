"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { Plus, Trash2, Pencil, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { DataState } from "@/components/admin/Shared/DataState";

type HeroSlide = {
  id: number;
  eyebrow: string | null;
  headline: string;
  headline_highlight: string | null;
  quote: string | null;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
};

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

function imageSrc(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STORAGE_URL}/${path}`;
}

const emptyForm = {
  eyebrow: "",
  headline: "",
  headline_highlight: "",
  quote: "",
  is_active: true,
};

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    apiFetch<HeroSlide[]>("/admin/hero-slides")
      .then(setSlides)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load slides"));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(slide: HeroSlide) {
    setEditingId(slide.id);
    setForm({
      eyebrow: slide.eyebrow ?? "",
      headline: slide.headline,
      headline_highlight: slide.headline_highlight ?? "",
      quote: slide.quote ?? "",
      is_active: slide.is_active,
    });
    setImageFile(null);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const body = new FormData();
    body.append("eyebrow", form.eyebrow);
    body.append("headline", form.headline);
    body.append("headline_highlight", form.headline_highlight);
    body.append("quote", form.quote);
    body.append("is_active", form.is_active ? "1" : "0");
    if (imageFile) body.append("image", imageFile);

    try {
      if (editingId) {
        body.append("_method", "PUT");
        await apiFetch(`/admin/hero-slides/${editingId}`, { method: "POST", body });
      } else {
        await apiFetch("/admin/hero-slides", { method: "POST", body });
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save slide");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this hero slide?")) return;
    try {
      await apiFetch(`/admin/hero-slides/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete");
    }
  }

  async function toggleActive(slide: HeroSlide) {
    try {
      const body = new FormData();
      body.append("is_active", slide.is_active ? "0" : "1");
      body.append("_method", "PUT");
      await apiFetch(`/admin/hero-slides/${slide.id}`, { method: "POST", body });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status");
    }
  }

  async function moveSlide(index: number, direction: "up" | "down") {
    if (!slides) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= slides.length) return;

    const reordered = [...slides];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSlides(reordered);

    try {
      await apiFetch("/admin/hero-slides/reorder", {
        method: "POST",
        body: { order: reordered.map((s) => s.id) },
      });
    } catch {
      load();
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Homepage"
        title="Hero Write-ups"
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-sm bg-ink-900 px-4 py-2.5 text-sm font-medium text-parchment-50 hover:bg-ink-800"
          >
            <Plus className="h-4 w-4" /> Add Write-up
          </button>
        }
      />

      <p className="mt-2 max-w-2xl text-sm text-graphite-500">
        Each write-up appears as a full hero slide on the homepage. Slides rotate automatically every
        4 seconds with a fade animation. Add an image for the background (same styling as the
        original hero).
      </p>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6"
        >
          <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">
            {editingId ? "Edit Write-up" : "New Write-up"}
          </p>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
              Eyebrow (small label above headline)
            </label>
            <input
              value={form.eyebrow}
              onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))}
              placeholder="e.g. Constituency Representative · Barrister · Public Servant"
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
              Headline (main white text)
            </label>
            <input
              required
              value={form.headline}
              onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              placeholder="e.g. A voice for every ward,"
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
              Headline Highlight (italic gold text)
            </label>
            <input
              value={form.headline_highlight}
              onChange={(e) => setForm((f) => ({ ...f, headline_highlight: e.target.value }))}
              placeholder="e.g. a record you can verify."
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
              Quote
            </label>
            <textarea
              rows={3}
              value={form.quote}
              onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
              placeholder="Governance is not a promise made once every four years…"
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
              Background Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
            <p className="mt-1 text-xs text-graphite-500">
              Recommended: wide landscape photo. Dark overlay is applied automatically so text stays
              readable.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-graphite-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="rounded-sm border-ink-900/20"
            />
            Active (show on homepage)
          </label>

          {formError && <p className="text-sm text-clay-600">{formError}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-forest-600 px-5 py-2.5 text-sm font-medium text-parchment-50 hover:bg-forest-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-sm border border-ink-900/15 px-5 py-2.5 text-sm text-graphite-700 hover:border-ink-900/30"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <DataState
        loading={slides === null}
        empty={slides?.length === 0}
        error={error}
        emptyIcon={Plus}
        emptyText="No hero write-ups yet. Add your first one."
      />

      {slides && slides.length > 0 && (
        <div className="mt-8 space-y-4">
          {slides.map((slide, index) => {
            const src = imageSrc(slide.image_path);
            return (
              <div
                key={slide.id}
                className="flex gap-4 overflow-hidden rounded-sm border border-ink-900/10 bg-parchment-50"
              >
                <div className="relative h-32 w-40 shrink-0 bg-ink-900">
                  {src ? (
                    <Image src={src} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-parchment-50/40">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center py-3 pr-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {slide.eyebrow && (
                        <p className="font-mono text-[10px] uppercase tracking-wide text-gold-600">
                          {slide.eyebrow}
                        </p>
                      )}
                      <p className="mt-0.5 truncate font-medium text-ink-900">
                        {slide.headline}{" "}
                        {slide.headline_highlight && (
                          <span className="italic text-forest-600">{slide.headline_highlight}</span>
                        )}
                      </p>
                      {slide.quote && (
                        <p className="mt-1 line-clamp-2 text-sm italic text-graphite-500">
                          &ldquo;{slide.quote}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => moveSlide(index, "up")}
                        disabled={index === 0}
                        className="rounded p-1.5 text-graphite-500 hover:bg-ink-900/5 disabled:opacity-30"
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveSlide(index, "down")}
                        disabled={index === slides.length - 1}
                        className="rounded p-1.5 text-graphite-500 hover:bg-ink-900/5 disabled:opacity-30"
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(slide)}
                        className="rounded p-1.5 text-graphite-500 hover:bg-ink-900/5"
                        title={slide.is_active ? "Deactivate" : "Activate"}
                      >
                        {slide.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openEdit(slide)}
                        className="rounded p-1.5 text-graphite-500 hover:bg-ink-900/5"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="rounded p-1.5 text-graphite-500 hover:text-clay-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {!slide.is_active && (
                    <span className="mt-1 inline-block w-fit rounded-sm bg-ink-900/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-graphite-500">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}