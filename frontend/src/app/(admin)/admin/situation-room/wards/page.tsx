"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MapPinned, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { DataState } from "@/components/admin/Shared/DataState";

type Lga = { id: number; name: string; state: { id: number; name: string } };
type Ward = {
  id: number;
  name: string;
  code: string | null;
  lga: { id: number; name: string; state?: { id: number; name: string } };
  polling_units_count: number;
};

const emptyDraft = { lga_id: "", name: "", code: "" };

export default function AdminWardsPage() {
  const [wards, setWards] = useState<Ward[] | null>(null);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    apiFetch<Ward[]>("/wards")
      .then(setWards)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load wards"));
  }

  useEffect(() => {
    load();
    apiFetch<{ id: number; name: string; lgas: Lga[] }[]>("/states")
      .then((states) => setLgas(states.flatMap((s) => s.lgas.map((l) => ({ ...l, state: { id: s.id, name: s.name } })))))
      .catch(() => setLgas([]));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiFetch("/wards", { method: "POST", body: { ...draft, lga_id: Number(draft.lga_id) } });
      setFormOpen(false);
      setDraft(emptyDraft);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create ward");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this ward? Polling units under it must be removed first.")) return;
    try {
      await apiFetch(`/wards/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete ward");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Situation Room Setup"
        title="Wards"
        action={
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-sm bg-ink-900 px-4 py-2.5 text-sm font-medium text-parchment-50 hover:bg-ink-800"
          >
            <Plus className="h-4 w-4" /> New Ward
          </button>
        }
      />

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">LGA</label>
              <select
                required
                value={draft.lga_id}
                onChange={(e) => setDraft({ ...draft, lga_id: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              >
                <option value="">Select LGA</option>
                {lgas.map((l) => (
                  <option key={l.id} value={l.id}>{l.state.name} — {l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Ward Name</label>
              <input
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Code (optional)</label>
              <input
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
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
              {saving ? "Saving…" : "Create Ward"}
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
        loading={wards === null}
        empty={wards?.length === 0}
        error={error}
        emptyIcon={MapPinned}
        emptyText="No wards set up yet — add the constituency's wards to unlock polling units, results, and volunteer assignment."
      />

      {wards && wards.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-sm border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-parchment-100 text-xs uppercase tracking-wide text-graphite-500">
              <tr>
                <th className="px-4 py-3">Ward</th>
                <th className="px-4 py-3">LGA</th>
                <th className="px-4 py-3">Polling Units</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10 bg-parchment-50">
              {wards.map((w) => (
                <tr key={w.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{w.name}{w.code ? ` (${w.code})` : ""}</td>
                  <td className="px-4 py-3 text-graphite-500">{w.lga.name}</td>
                  <td className="px-4 py-3 text-graphite-500">{w.polling_units_count}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(w.id)} className="text-graphite-500 hover:text-clay-600">
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
