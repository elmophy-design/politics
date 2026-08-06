"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";

type LgaRow = { id: number; name: string; units_total: number; units_reported: number; percentage_completed: number };
type WardRow = { id: number; name: string; units_total: number; units_reported: number; percentage_completed: number };
type PuRow = { id: number; name: string; code: string; status: string; party_votes: Record<string, number> | null };

export function DrilldownPanel({ constituencyId }: { constituencyId: number | null }) {
  const [lgas, setLgas] = useState<LgaRow[]>([]);
  const [wards, setWards] = useState<WardRow[] | null>(null);
  const [units, setUnits] = useState<PuRow[] | null>(null);
  const [lgaName, setLgaName] = useState("");
  const [wardName, setWardName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = constituencyId ? `?constituency_id=${constituencyId}` : "";
    apiFetch<{ lgas: LgaRow[] }>(`/situation-room/drilldown${q}`)
      .then((r) => setLgas(r.lgas ?? []))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Drill-down failed"));
    setWards(null);
    setUnits(null);
  }, [constituencyId]);

  async function openLga(id: number, name: string) {
    setLgaName(name);
    setWardName("");
    setUnits(null);
    const q = new URLSearchParams({ lga_id: String(id) });
    if (constituencyId) q.set("constituency_id", String(constituencyId));
    const r = await apiFetch<{ wards: WardRow[] }>(`/situation-room/drilldown?${q}`);
    setWards(r.wards ?? []);
  }

  async function openWard(id: number, name: string) {
    setWardName(name);
    const r = await apiFetch<{ polling_units: PuRow[] }>(`/situation-room/drilldown?ward_id=${id}`);
    setUnits(r.polling_units ?? []);
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
        Drill-down · LGA → Ward → PU
      </p>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="grid gap-3 lg:grid-cols-3">
        <ul className="max-h-48 space-y-1 overflow-y-auto text-xs">
          {lgas.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => openLga(l.id, l.name)}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left hover:bg-slate-800"
              >
                <span className="text-slate-200">{l.name}</span>
                <span className="font-mono text-[10px] text-slate-500">
                  {l.percentage_completed}% <ChevronRight className="inline h-3 w-3" />
                </span>
              </button>
            </li>
          ))}
          {lgas.length === 0 && <li className="px-2 text-slate-500">No LGA data</li>}
        </ul>
        <ul className="max-h-48 space-y-1 overflow-y-auto text-xs">
          <li className="px-2 font-mono text-[10px] text-slate-500">{lgaName || "Wards"}</li>
          {(wards ?? []).map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => openWard(w.id, w.name)}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left hover:bg-slate-800"
              >
                <span className="text-slate-200">{w.name}</span>
                <span className="font-mono text-[10px] text-slate-500">{w.percentage_completed}%</span>
              </button>
            </li>
          ))}
        </ul>
        <ul className="max-h-48 space-y-1 overflow-y-auto text-xs">
          <li className="px-2 font-mono text-[10px] text-slate-500">{wardName || "Polling units"}</li>
          {(units ?? []).map((u) => (
            <li key={u.id} className="flex items-center justify-between rounded px-2 py-1.5">
              <span className="text-slate-200">
                <span className="font-mono text-slate-500">{u.code}</span> {u.name}
              </span>
              <span
                className={
                  u.status === "verified"
                    ? "text-emerald-400"
                    : u.status === "pending"
                      ? "text-amber-400"
                      : u.status === "flagged"
                        ? "text-red-400"
                        : "text-slate-500"
                }
              >
                {u.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
