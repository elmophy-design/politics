"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Check, Flag, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { StatusBadge } from "@/components/admin/Shared/StatusBadge";
import { DataState } from "@/components/admin/Shared/DataState";

type ElectionResult = {
  id: number;
  party_votes: Record<string, number>;
  total_votes_cast: number | null;
  status: "pending" | "verified" | "flagged" | "rejected";
  pollingUnit: { id: number; name: string; ward: { id: number; name: string } | null } | null;
  submitter: { id: number; name: string } | null;
};
type Paginated<T> = { data: T[] };

const filters = ["", "pending", "verified", "flagged", "rejected"];

export default function AdminSituationRoomResultsPage() {
  const [results, setResults] = useState<ElectionResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending");

  function load() {
    setResults(null);
    const query = statusFilter ? `?status=${statusFilter}` : "";
    apiFetch<Paginated<ElectionResult>>(`/situation-room/results${query}`)
      .then((res) => setResults(res.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load results"));
  }

  useEffect(load, [statusFilter]);

  async function verify(id: number, status: "verified" | "flagged" | "rejected") {
    try {
      await apiFetch(`/situation-room/results/${id}/verify`, { method: "PATCH", body: { status } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update result");
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Election Situation Room" title="Result Submissions" />

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
              statusFilter === s
                ? "border-forest-600 bg-forest-600/10 text-forest-700"
                : "border-ink-900/15 text-graphite-700 hover:border-forest-600/50"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <DataState
        loading={results === null}
        empty={results?.length === 0}
        error={error}
        emptyIcon={ShieldAlert}
        emptyText="No results in this category."
      />

      {results && results.length > 0 && (
        <div className="mt-8 space-y-4">
          {results.map((r) => (
            <div key={r.id} className="rounded-sm border border-ink-900/10 bg-parchment-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">
                    {r.pollingUnit?.ward?.name ?? "—"} · {r.pollingUnit?.name ?? "Unknown polling unit"}
                  </p>
                  <p className="mt-1 text-xs text-graphite-500">
                    Submitted by {r.submitter?.name ?? "—"} · {r.total_votes_cast ?? "—"} votes cast
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                {Object.entries(r.party_votes).map(([party, votes]) => (
                  <div key={party} className="rounded-sm bg-parchment-100 px-3 py-1.5 font-mono text-xs">
                    <span className="font-semibold text-ink-900">{party}</span>{" "}
                    <span className="text-graphite-500">{votes}</span>
                  </div>
                ))}
              </div>

              {r.status === "pending" && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => verify(r.id, "verified")}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-forest-600 px-3 py-1.5 text-xs font-medium text-parchment-50 hover:bg-forest-700"
                  >
                    <Check className="h-3.5 w-3.5" /> Verify
                  </button>
                  <button
                    onClick={() => verify(r.id, "flagged")}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-gold-500 px-3 py-1.5 text-xs font-medium text-gold-600 hover:bg-gold-500/10"
                  >
                    <Flag className="h-3.5 w-3.5" /> Flag
                  </button>
                  <button
                    onClick={() => verify(r.id, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-clay-500 px-3 py-1.5 text-xs font-medium text-clay-600 hover:bg-clay-500/10"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
