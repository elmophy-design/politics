"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Megaphone, Plus, Trash2, Pencil } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { StatusBadge } from "@/components/admin/Shared/StatusBadge";
import { DataState } from "@/components/admin/Shared/DataState";

type Campaign = {
  id: number;
  title: string;
  summary: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
};
type Paginated<T> = { data: T[] };

const emptyDraft = { title: "", summary: "", status: "draft", start_date: "", end_date: "" };

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    apiFetch<Paginated<Campaign>>("/campaigns?status=")
      .then((res) => setCampaigns(res.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load campaigns"));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId(null);
    setDraft(emptyDraft);
    setFormError(null);
    setFormOpen(true);
  }

  function startEdit(c: Campaign) {
    setEditingId(c.id);
    setDraft({
      title: c.title,
      summary: c.summary ?? "",
      status: c.status,
      start_date: c.start_date ?? "",
      end_date: c.end_date ?? "",
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await apiFetch(`/campaigns/${editingId}`, { method: "PUT", body: draft });
      } else {
        await apiFetch("/campaigns", { method: "POST", body: draft });
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Archive this campaign?")) return;
    try {
      await apiFetch(`/campaigns/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete campaign");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Campaign Management"
        title="Campaigns"
        action={
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-sm bg-ink-900 px-4 py-2.5 text-sm font-medium text-parchment-50 hover:bg-ink-800"
          >
            <Plus className="h-4 w-4" /> New Campaign
          </button>
        }
      />

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Title</label>
              <input
                required
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Status</label>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              >
                {["draft", "active", "paused", "completed", "archived"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Summary</label>
            <textarea
              rows={2}
              value={draft.summary}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Start Date</label>
              <input
                type="date"
                value={draft.start_date}
                onChange={(e) => setDraft({ ...draft, start_date: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">End Date</label>
              <input
                type="date"
                value={draft.end_date}
                onChange={(e) => setDraft({ ...draft, end_date: e.target.value })}
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
              {saving ? "Saving…" : editingId ? "Save Changes" : "Create Campaign"}
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
        loading={campaigns === null}
        empty={campaigns?.length === 0}
        error={error}
        emptyIcon={Megaphone}
        emptyText="No campaigns yet — create your first one above."
      />

      {campaigns && campaigns.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-sm border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-parchment-100 text-xs uppercase tracking-wide text-graphite-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10 bg-parchment-50">
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{c.title}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-graphite-500">
                    {c.start_date ?? "—"} → {c.end_date ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => startEdit(c)} className="text-graphite-500 hover:text-forest-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-graphite-500 hover:text-clay-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
