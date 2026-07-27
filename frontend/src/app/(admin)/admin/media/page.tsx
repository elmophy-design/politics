"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { DataState } from "@/components/admin/Shared/DataState";
import type { MediaItem, Paginated } from "@/lib/types/media";

const typeOptions = [
  "press_release",
  "video",
  "interview",
  "download",
  "gallery_image",
  "livestream_link",
];

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [type, setType] = useState("gallery_image");

  function load() {
    apiFetch<Paginated<MediaItem>>("/media?published_only=false")
      .then((res) => setItems(res.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load media"));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await apiFetch("/media", { method: "POST", body: formData });
      setFormOpen(false);
      e.currentTarget.reset();
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to upload media");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this media item?")) return;
    try {
      await apiFetch(`/media/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete media item");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Media Centre"
        title="Media"
        action={
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-sm bg-ink-900 px-4 py-2.5 text-sm font-medium text-parchment-50 hover:bg-ink-800"
          >
            <Plus className="h-4 w-4" /> Upload
          </button>
        }
      />

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Type</label>
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Category (optional)</label>
              <input
                name="category"
                placeholder="e.g. Campaign Events"
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Title</label>
            <input
              name="title"
              required
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Description</label>
            <textarea
              name="description"
              rows={3}
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
                File {type !== "livestream_link" && "(or use external URL below)"}
              </label>
              <input
                type="file"
                name="file"
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">External URL</label>
              <input
                name="external_url"
                type="url"
                placeholder="https://..."
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
          </div>

          {formError && <p className="text-sm text-clay-600">{formError}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-forest-600 px-5 py-2.5 text-sm font-medium text-parchment-50 hover:bg-forest-700 disabled:opacity-60"
            >
              {saving ? "Uploading…" : "Upload"}
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
        loading={items === null}
        empty={items?.length === 0}
        error={error}
        emptyIcon={ImageIcon}
        emptyText="No media uploaded yet."
      />

      {items && items.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-sm border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-parchment-100 text-xs uppercase tracking-wide text-graphite-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10 bg-parchment-50">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{item.title}</td>
                  <td className="px-4 py-3 capitalize text-graphite-500">{item.type.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-graphite-500">{item.category ?? "—"}</td>
                  <td className="px-4 py-3 text-graphite-500">{item.is_published ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(item.id)} className="text-graphite-500 hover:text-clay-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
