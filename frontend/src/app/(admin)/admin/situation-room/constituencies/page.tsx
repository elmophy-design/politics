"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  MapPinned,
  Plus,
  Trash2,
  Vote,
  RefreshCw,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { DataState } from "@/components/admin/Shared/DataState";
import { cn } from "@/lib/utils/cn";

type StateRow = { id: number; name: string; code: string; lgas: { id: number; name: string }[] };
type Constituency = {
  id: number;
  name: string;
  code: string | null;
  type: string;
  description: string | null;
  is_active: boolean;
  state_id: number | null;
  state?: { id: number; name: string } | null;
  wards_count?: number;
  polling_units_count?: number;
};
type TreeUnit = {
  id: number;
  name: string;
  code: string;
  registered_voters: number | null;
  has_verified_result: boolean;
  party_votes: Record<string, number>;
};
type TreeWard = {
  id: number;
  name: string;
  code: string | null;
  lga: { id: number; name: string } | null;
  polling_units_count: number;
  results_received: number;
  percentage_completed: number;
  polling_units: TreeUnit[];
};
type TreePayload = {
  constituency: Constituency;
  state?: { id: number; name: string; code?: string } | null;
  summary: {
    wards: number;
    polling_units: number;
    results_received: number;
    percentage_completed: number;
  };
  wards: TreeWard[];
};

const TYPES = [
  { value: "federal", label: "Federal Constituency" },
  { value: "state", label: "State Constituency" },
  { value: "senatorial", label: "Senatorial District" },
  { value: "lga", label: "LGA Constituency" },
  { value: "other", label: "Other" },
];

export default function AdminConstituenciesPage() {
  const [list, setList] = useState<Constituency[] | null>(null);
  const [states, setStates] = useState<StateRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tree, setTree] = useState<TreePayload | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [cDraft, setCDraft] = useState({
    name: "",
    code: "",
    type: "federal",
    state_id: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [expandedWards, setExpandedWards] = useState<Record<number, boolean>>({});
  const [wardForm, setWardForm] = useState<{ open: boolean; lga_id: string; name: string; code: string }>({
    open: false,
    lga_id: "",
    name: "",
    code: "",
  });
  const [puForm, setPuForm] = useState<{
    ward_id: number | null;
    name: string;
    code: string;
    registered_voters: string;
  }>({ ward_id: null, name: "", code: "", registered_voters: "" });

  const loadList = useCallback(() => {
    apiFetch<Constituency[]>("/constituencies")
      .then((rows) => {
        setList(rows);
        if (rows.length && selectedId === null) setSelectedId(rows[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load constituencies"));
  }, [selectedId]);

  const loadTree = useCallback((id: number) => {
    setTreeLoading(true);
    apiFetch<TreePayload>(`/constituencies/${id}/tree`)
      .then(setTree)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load tree"))
      .finally(() => setTreeLoading(false));
  }, []);

  useEffect(() => {
    loadList();
    apiFetch<StateRow[]>("/states")
      .then(setStates)
      .catch(() => setStates([]));
  }, [loadList]);

  useEffect(() => {
    if (selectedId) loadTree(selectedId);
  }, [selectedId, loadTree]);

  const lgas = states.flatMap((s) => s.lgas.map((l) => ({ ...l, stateName: s.name })));

  async function createConstituency(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const created = await apiFetch<Constituency>("/constituencies", {
        method: "POST",
        body: {
          name: cDraft.name,
          code: cDraft.code || null,
          type: cDraft.type,
          state_id: cDraft.state_id ? Number(cDraft.state_id) : null,
          description: cDraft.description || null,
        },
      });
      setShowCreate(false);
      setCDraft({ name: "", code: "", type: "federal", state_id: "", description: "" });
      loadList();
      setSelectedId(created.id);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteConstituency(id: number) {
    if (!confirm("Delete this constituency? Wards will be detached (not deleted).")) return;
    try {
      await apiFetch(`/constituencies/${id}`, { method: "DELETE" });
      if (selectedId === id) {
        setSelectedId(null);
        setTree(null);
      }
      loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  async function addWard(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setFormError(null);
    try {
      await apiFetch("/wards", {
        method: "POST",
        body: {
          constituency_id: selectedId,
          lga_id: Number(wardForm.lga_id),
          name: wardForm.name,
          code: wardForm.code || null,
        },
      });
      setWardForm({ open: false, lga_id: "", name: "", code: "" });
      loadTree(selectedId);
      loadList();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to add ward");
    } finally {
      setSaving(false);
    }
  }

  async function deleteWard(id: number) {
    if (!confirm("Delete this ward? All its polling units must be removed first.")) return;
    try {
      await apiFetch(`/wards/${id}`, { method: "DELETE" });
      if (selectedId) loadTree(selectedId);
      loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete ward");
    }
  }

  async function addPu(e: FormEvent) {
    e.preventDefault();
    if (!puForm.ward_id || !selectedId) return;
    setSaving(true);
    setFormError(null);
    try {
      await apiFetch("/polling-units", {
        method: "POST",
        body: {
          ward_id: puForm.ward_id,
          name: puForm.name,
          code: puForm.code,
          registered_voters: puForm.registered_voters ? Number(puForm.registered_voters) : null,
        },
      });
      setPuForm({ ward_id: null, name: "", code: "", registered_voters: "" });
      loadTree(selectedId);
      loadList();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to add polling unit");
    } finally {
      setSaving(false);
    }
  }

  async function deletePu(id: number) {
    if (!confirm("Delete this polling unit?")) return;
    try {
      await apiFetch(`/polling-units/${id}`, { method: "DELETE" });
      if (selectedId) loadTree(selectedId);
      loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete polling unit");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Situation Room Setup"
        title="Constituencies"
        action={
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="inline-flex items-center gap-2 rounded-sm bg-forest-600 px-4 py-2 text-sm font-medium text-parchment-50 hover:bg-forest-700"
          >
            <Plus className="h-4 w-4" /> New constituency
          </button>
        }
      />

      <p className="mt-2 max-w-2xl text-sm text-graphite-500">
        Build the electoral map the live chart reads: create a constituency, add wards under it, then
        polling units. Verified results from those units feed the Situation Room automatically.
      </p>

      {error && (
        <p className="mt-4 rounded-sm border border-clay-500/30 bg-clay-500/5 px-4 py-3 text-sm text-clay-600">
          {error}
        </p>
      )}

      {showCreate && (
        <form onSubmit={createConstituency} className="mt-6 space-y-3 rounded-sm border border-ink-900/10 bg-parchment-50 p-5">
          <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">New constituency</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Name e.g. Esan West / Esan Central"
              value={cDraft.name}
              onChange={(e) => setCDraft((d) => ({ ...d, name: e.target.value }))}
              className="rounded-sm border border-ink-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
            <input
              placeholder="Code (optional)"
              value={cDraft.code}
              onChange={(e) => setCDraft((d) => ({ ...d, code: e.target.value }))}
              className="rounded-sm border border-ink-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
            <select
              value={cDraft.type}
              onChange={(e) => setCDraft((d) => ({ ...d, type: e.target.value }))}
              className="rounded-sm border border-ink-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-forest-600"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={cDraft.state_id}
              onChange={(e) => setCDraft((d) => ({ ...d, state_id: e.target.value }))}
              className="rounded-sm border border-ink-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-forest-600"
            >
              <option value="">State (optional)</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Short description"
            value={cDraft.description}
            onChange={(e) => setCDraft((d) => ({ ...d, description: e.target.value }))}
            rows={2}
            className="w-full rounded-sm border border-ink-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-forest-600"
          />
          {formError && <p className="text-sm text-clay-600">{formError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-forest-600 px-4 py-2 text-sm font-medium text-white hover:bg-forest-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Create"}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-sm px-4 py-2 text-sm text-graphite-500">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* List */}
        <div className="rounded-sm border border-ink-900/10 bg-parchment-50">
          <div className="border-b border-ink-900/10 px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-graphite-500">
            All constituencies
          </div>
          {!list && (
            <DataState loading empty={false} error={null} emptyIcon={Building2} emptyText="" />
          )}
          {list && list.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-graphite-500">No constituencies yet.</p>
          )}
          <ul className="divide-y divide-ink-900/5">
            {list?.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                    selectedId === c.id ? "bg-forest-600/10" : "hover:bg-parchment-100"
                  )}
                >
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{c.name}</p>
                    <p className="mt-0.5 text-[11px] text-graphite-500">
                      {c.type} · {c.wards_count ?? 0} wards · {c.polling_units_count ?? 0} PUs
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tree detail */}
        <div className="rounded-sm border border-ink-900/10 bg-parchment-50">
          {!selectedId && (
            <p className="px-6 py-16 text-center text-sm text-graphite-500">Select a constituency to manage wards & polling units.</p>
          )}
          {selectedId && treeLoading && (
            <DataState loading empty={false} error={null} emptyIcon={Building2} emptyText="" />
          )}
          {selectedId && tree && !treeLoading && (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-900/10 px-5 py-4">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink-900">
                    {tree.constituency.name}
                  </h2>
                  <p className="mt-1 text-xs text-graphite-500">
                    {tree.constituency.type}
                    {tree.state ? ` · ${tree.state.name}` : ""}
                    {tree.constituency.code ? ` · ${tree.constituency.code}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
                    <span className="rounded-full bg-ink-900/5 px-2.5 py-1 font-mono">
                      {tree.summary.wards} wards
                    </span>
                    <span className="rounded-full bg-ink-900/5 px-2.5 py-1 font-mono">
                      {tree.summary.polling_units} polling units
                    </span>
                    <span className="rounded-full bg-forest-600/10 px-2.5 py-1 font-mono text-forest-700">
                      {tree.summary.results_received} results · {tree.summary.percentage_completed}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => selectedId && loadTree(selectedId)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-ink-900/10 px-3 py-1.5 text-xs text-graphite-600 hover:bg-parchment-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteConstituency(tree.constituency.id)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-clay-500/30 px-3 py-1.5 text-xs text-clay-600 hover:bg-clay-500/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">Wards & polling units</p>
                  <button
                    type="button"
                    onClick={() => setWardForm((f) => ({ ...f, open: !f.open }))}
                    className="inline-flex items-center gap-1 text-xs font-medium text-forest-600 hover:text-forest-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add ward
                  </button>
                </div>

                {wardForm.open && (
                  <form onSubmit={addWard} className="mb-4 grid gap-2 rounded-sm border border-ink-900/10 bg-white p-3 sm:grid-cols-4">
                    <select
                      required
                      value={wardForm.lga_id}
                      onChange={(e) => setWardForm((f) => ({ ...f, lga_id: e.target.value }))}
                      className="rounded-sm border border-ink-900/15 px-2 py-1.5 text-xs outline-none focus:border-forest-600"
                    >
                      <option value="">Select LGA</option>
                      {lgas.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.stateName})
                        </option>
                      ))}
                    </select>
                    <input
                      required
                      placeholder="Ward name"
                      value={wardForm.name}
                      onChange={(e) => setWardForm((f) => ({ ...f, name: e.target.value }))}
                      className="rounded-sm border border-ink-900/15 px-2 py-1.5 text-xs outline-none focus:border-forest-600"
                    />
                    <input
                      placeholder="Code"
                      value={wardForm.code}
                      onChange={(e) => setWardForm((f) => ({ ...f, code: e.target.value }))}
                      className="rounded-sm border border-ink-900/15 px-2 py-1.5 text-xs outline-none focus:border-forest-600"
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-sm bg-forest-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-forest-700 disabled:opacity-50"
                    >
                      Save ward
                    </button>
                  </form>
                )}

                {formError && <p className="mb-3 text-sm text-clay-600">{formError}</p>}

                {tree.wards.length === 0 && (
                  <p className="py-8 text-center text-sm text-graphite-500">No wards yet — add the first ward above.</p>
                )}

                <ul className="space-y-2">
                  {tree.wards.map((w) => {
                    const open = expandedWards[w.id] ?? false;
                    return (
                      <li key={w.id} className="rounded-sm border border-ink-900/10 bg-white">
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => setExpandedWards((m) => ({ ...m, [w.id]: !open }))}
                            className="text-graphite-500"
                          >
                            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                          <MapPinned className="h-4 w-4 text-forest-600" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-ink-900">{w.name}</p>
                            <p className="text-[11px] text-graphite-500">
                              {w.lga?.name ?? "—"} · {w.polling_units_count} PUs · {w.results_received} results (
                              {w.percentage_completed}%)
                            </p>
                          </div>
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-900/5">
                            <div
                              className="h-full rounded-full bg-forest-600"
                              style={{ width: `${Math.min(100, w.percentage_completed)}%` }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setPuForm({
                                ward_id: puForm.ward_id === w.id ? null : w.id,
                                name: "",
                                code: "",
                                registered_voters: "",
                              })
                            }
                            className="text-xs text-forest-600 hover:underline"
                          >
                            + PU
                          </button>
                          <button type="button" onClick={() => deleteWard(w.id)} className="text-graphite-400 hover:text-clay-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {puForm.ward_id === w.id && (
                          <form onSubmit={addPu} className="grid gap-2 border-t border-ink-900/5 bg-parchment-50 px-3 py-2 sm:grid-cols-4">
                            <input
                              required
                              placeholder="Unit name"
                              value={puForm.name}
                              onChange={(e) => setPuForm((f) => ({ ...f, name: e.target.value }))}
                              className="rounded-sm border border-ink-900/15 px-2 py-1.5 text-xs outline-none focus:border-forest-600"
                            />
                            <input
                              required
                              placeholder="Code (unique)"
                              value={puForm.code}
                              onChange={(e) => setPuForm((f) => ({ ...f, code: e.target.value }))}
                              className="rounded-sm border border-ink-900/15 px-2 py-1.5 text-xs outline-none focus:border-forest-600"
                            />
                            <input
                              type="number"
                              min={0}
                              placeholder="Registered voters"
                              value={puForm.registered_voters}
                              onChange={(e) => setPuForm((f) => ({ ...f, registered_voters: e.target.value }))}
                              className="rounded-sm border border-ink-900/15 px-2 py-1.5 text-xs outline-none focus:border-forest-600"
                            />
                            <button
                              type="submit"
                              disabled={saving}
                              className="rounded-sm bg-forest-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                            >
                              Add unit
                            </button>
                          </form>
                        )}

                        {open && (
                          <ul className="border-t border-ink-900/5 divide-y divide-ink-900/5">
                            {w.polling_units.length === 0 && (
                              <li className="px-10 py-3 text-xs text-graphite-500">No polling units in this ward.</li>
                            )}
                            {w.polling_units.map((u) => (
                              <li key={u.id} className="flex items-center gap-2 px-10 py-2 text-xs">
                                <Vote
                                  className={cn(
                                    "h-3.5 w-3.5",
                                    u.has_verified_result ? "text-forest-600" : "text-graphite-400"
                                  )}
                                />
                                <span className="font-mono text-graphite-500">{u.code}</span>
                                <span className="flex-1 font-medium text-ink-900">{u.name}</span>
                                {u.registered_voters != null && (
                                  <span className="text-graphite-500">{u.registered_voters} voters</span>
                                )}
                                {u.has_verified_result ? (
                                  <span className="rounded bg-forest-600/10 px-1.5 py-0.5 text-[10px] text-forest-700">
                                    Result in
                                  </span>
                                ) : (
                                  <span className="rounded bg-ink-900/5 px-1.5 py-0.5 text-[10px] text-graphite-500">
                                    Awaiting
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => deletePu(u.id)}
                                  className="text-graphite-400 hover:text-clay-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
