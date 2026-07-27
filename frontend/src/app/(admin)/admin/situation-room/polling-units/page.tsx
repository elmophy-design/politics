"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Landmark, Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { DataState } from "@/components/admin/Shared/DataState";

type Ward = { id: number; name: string };
type PollingUnit = {
  id: number;
  name: string;
  code: string;
  registered_voters: number | null;
  ward: { id: number; name: string };
};
type Paginated<T> = { data: T[] };

const emptyDraft = { ward_id: "", name: "", code: "", registered_voters: "" };

export default function AdminPollingUnitsPage() {
  const [units, setUnits] = useState<PollingUnit[] | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    apiFetch<Paginated<PollingUnit>>("/polling-units")
      .then((res) => setUnits(res.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load polling units"));
  }

  useEffect(() => {
    load();
    apiFetch<Ward[]>("/wards").then(setWards).catch(() => setWards([]));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiFetch("/polling-units", {
        method: "POST",
        body: {
          ward_id: Number(draft.ward_id),
          name: draft.name,
          code: draft.code,
          registered_voters: draft.registered_voters ? Number(draft.registered_voters) : undefined,
        },
      });
      setFormOpen(false);
      setDraft(emptyDraft);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create polling unit");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this polling unit?")) return;
    try {
      await apiFetch(`/polling-units/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete polling unit");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Situation Room Setup"
        title="Polling Units"
        action={
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-sm bg-ink-900 px-4 py-2.5 text-sm font-medium text-parchment-50 hover:bg-ink-800"
          >
            <Plus className="h-4 w-4" /> New Polling Unit
          </button>
        }
      />

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Ward</label>
              <select
                required
                value={draft.ward_id}
                onChange={(e) => setDraft({ ...draft, ward_id: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              >
                <option value="">Select Ward</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Code</label>
              <input
                required
                placeholder="e.g. PU-014"
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Name</label>
              <input
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Registered Voters</label>
              <input
                type="number"
                min={0}
                value={draft.registered_voters}
                onChange={(e) => setDraft({ ...draft, registered_voters: e.target.value })}
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
              {saving ? "Saving…" : "Create Polling Unit"}
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
        loading={units === null}
        empty={units?.length === 0}
        error={error}
        emptyIcon={Landmark}
        emptyText="No polling units set up yet."
      />

      {units && units.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-sm border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-parchment-100 text-xs uppercase tracking-wide text-graphite-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Ward</th>
                <th className="px-4 py-3">Registered Voters</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10 bg-parchment-50">
              {units.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-mono text-xs text-graphite-700">{u.code}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{u.name}</td>
                  <td className="px-4 py-3 text-graphite-500">{u.ward.name}</td>
                  <td className="px-4 py-3 text-graphite-500">{u.registered_voters ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(u.id)} className="text-graphite-500 hover:text-clay-600">
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
