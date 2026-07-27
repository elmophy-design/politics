"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { StatusBadge } from "@/components/admin/Shared/StatusBadge";
import { DataState } from "@/components/admin/Shared/DataState";

type ConstituencyProject = {
  id: number;
  title: string;
  project_type: string;
  community: string | null;
  progress_percentage: number;
  status: string;
  ward: { id: number; name: string } | null;
};
type Paginated<T> = { data: T[] };

const emptyDraft = { title: "", project_type: "", community: "", status: "planned" };

export default function AdminConstituencyProjectsPage() {
  const [projects, setProjects] = useState<ConstituencyProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [progressDrafts, setProgressDrafts] = useState<Record<number, number>>({});

  function load() {
    apiFetch<Paginated<ConstituencyProject>>("/constituency-projects")
      .then((res) => setProjects(res.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load projects"));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiFetch("/constituency-projects", { method: "POST", body: draft });
      setFormOpen(false);
      setDraft(emptyDraft);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create project");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this project?")) return;
    try {
      await apiFetch(`/constituency-projects/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete project");
    }
  }

  async function saveProgress(id: number) {
    const value = progressDrafts[id];
    if (value === undefined) return;
    try {
      await apiFetch(`/constituency-projects/${id}/progress`, {
        method: "PATCH",
        body: { progress_percentage: value },
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update progress");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Transparency Tracker"
        title="Constituency Projects"
        action={
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-sm bg-ink-900 px-4 py-2.5 text-sm font-medium text-parchment-50 hover:bg-ink-800"
          >
            <Plus className="h-4 w-4" /> New Project
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
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Project Type</label>
              <input
                required
                placeholder="e.g. Road Rehabilitation"
                value={draft.project_type}
                onChange={(e) => setDraft({ ...draft, project_type: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Community</label>
            <input
              value={draft.community}
              onChange={(e) => setDraft({ ...draft, community: e.target.value })}
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
          </div>
          {formError && <p className="text-sm text-clay-600">{formError}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-forest-600 px-5 py-2.5 text-sm font-medium text-parchment-50 hover:bg-forest-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Create Project"}
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
        loading={projects === null}
        empty={projects?.length === 0}
        error={error}
        emptyIcon={Building2}
        emptyText="No constituency projects logged yet."
      />

      {projects && projects.length > 0 && (
        <div className="mt-8 space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="rounded-sm border border-ink-900/10 bg-parchment-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">
                    {p.project_type} · {p.ward?.name ?? "Constituency-wide"}{p.community ? ` · ${p.community}` : ""}
                  </p>
                  <p className="mt-1 font-medium text-ink-900">{p.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.status} />
                  <button onClick={() => handleDelete(p.id)} className="text-graphite-500 hover:text-clay-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progressDrafts[p.id] ?? p.progress_percentage}
                  onChange={(e) => setProgressDrafts({ ...progressDrafts, [p.id]: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="w-10 text-right font-mono text-xs text-graphite-500">
                  {progressDrafts[p.id] ?? p.progress_percentage}%
                </span>
                <button
                  onClick={() => saveProgress(p.id)}
                  className="rounded-sm border border-ink-900/15 px-3 py-1.5 text-xs font-medium text-graphite-700 hover:border-forest-600/50"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
