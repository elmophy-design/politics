"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Flag, X, XIcon } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";

type ResultRow = {
  id: number;
  party_votes: Record<string, number>;
  total_votes_cast: number | null;
  result_sheet_image: string | null;
  status: string;
  polling_unit?: { name: string; code?: string; ward?: { name: string } | null } | null;
  pollingUnit?: { name: string; code?: string; ward?: { name: string } | null } | null;
  submitter?: { name: string } | null;
};
type Paginated<T> = { data: T[] };

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

export function PendingQueue({
  open,
  onClose,
  constituencyId,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  constituencyId: number | null;
  onChanged: () => void;
}) {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(() => {
    const q = new URLSearchParams({ status: "pending", per_page: "30" });
    if (constituencyId) q.set("constituency_id", String(constituencyId));
    apiFetch<Paginated<ResultRow>>(`/situation-room/pending?${q}`)
      .then((r) => setRows(r.data ?? []))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load queue"));
  }, [constituencyId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function act(id: number, status: "verified" | "flagged" | "rejected") {
    setBusy(id);
    try {
      await apiFetch(`/situation-room/results/${id}/verify`, {
        method: "PATCH",
        body: { status },
      });
      load();
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col border-l border-slate-800 bg-[#0a1220] shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Pending verification</p>
          <p className="text-[10px] text-slate-500">{rows.length} awaiting review</p>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
          <XIcon className="h-5 w-5" />
        </button>
      </div>
      {error && <p className="px-4 py-2 text-xs text-red-400">{error}</p>}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {rows.length === 0 && (
          <p className="py-12 text-center text-xs text-slate-500">Queue empty — all clear.</p>
        )}
        {rows.map((r) => {
          const pu = r.polling_unit ?? r.pollingUnit;
          return (
            <div key={r.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
              <p className="text-sm font-medium text-white">
                {pu?.name ?? "Unit"}{" "}
                <span className="text-xs text-slate-500">{pu?.ward?.name}</span>
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-400">
                {Object.entries(r.party_votes ?? {})
                  .map(([k, v]) => `${k} ${v}`)
                  .join(" · ")}
              </p>
              {r.result_sheet_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${STORAGE}/${r.result_sheet_image}`}
                  alt="Result sheet"
                  className="mt-2 max-h-32 rounded border border-slate-700 object-cover"
                />
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() => act(r.id, "verified")}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded bg-emerald-600/20 py-1.5 text-[11px] font-medium text-emerald-400 hover:bg-emerald-600/30"
                >
                  <Check className="h-3 w-3" /> Verify
                </button>
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() => act(r.id, "flagged")}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded bg-amber-500/20 py-1.5 text-[11px] font-medium text-amber-400"
                >
                  <Flag className="h-3 w-3" /> Flag
                </button>
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() => act(r.id, "rejected")}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded bg-red-500/20 py-1.5 text-[11px] font-medium text-red-400"
                >
                  <X className="h-3 w-3" /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
