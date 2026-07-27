"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { StatusBadge } from "@/components/admin/Shared/StatusBadge";
import { DataState } from "@/components/admin/Shared/DataState";

type Incident = {
  id: number;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "reported" | "under_review" | "resolved" | "dismissed";
  ward: { id: number; name: string } | null;
  pollingUnit: { id: number; name: string } | null;
  reporter: { id: number; name: string } | null;
};
type Paginated<T> = { data: T[] };

const severityStyles: Record<Incident["severity"], string> = {
  low: "bg-ink-900/10 text-graphite-500",
  medium: "bg-gold-500/10 text-gold-600",
  high: "bg-clay-500/10 text-clay-600",
  critical: "bg-clay-600 text-parchment-50",
};

const statusOptions = ["reported", "under_review", "resolved", "dismissed"];

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState("");

  function load() {
    setIncidents(null);
    const query = severityFilter ? `?severity=${severityFilter}` : "";
    apiFetch<Paginated<Incident>>(`/situation-room/incidents${query}`)
      .then((res) => setIncidents(res.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load incidents"));
  }

  useEffect(load, [severityFilter]);

  async function updateStatus(id: number, status: string) {
    try {
      await apiFetch(`/situation-room/incidents/${id}`, { method: "PATCH", body: { status } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update incident");
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Election Situation Room" title="Incidents" />

      <div className="mt-6 flex flex-wrap gap-2">
        {["", "low", "medium", "high", "critical"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setSeverityFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
              severityFilter === s
                ? "border-forest-600 bg-forest-600/10 text-forest-700"
                : "border-ink-900/15 text-graphite-700 hover:border-forest-600/50"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <DataState
        loading={incidents === null}
        empty={incidents?.length === 0}
        error={error}
        emptyIcon={AlertTriangle}
        emptyText="No incidents reported in this category."
      />

      {incidents && incidents.length > 0 && (
        <div className="mt-8 space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="rounded-sm border border-ink-900/10 bg-parchment-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">
                    {incident.ward?.name ?? "—"}
                    {incident.pollingUnit ? ` · ${incident.pollingUnit.name}` : ""} · Reported by {incident.reporter?.name ?? "—"}
                  </p>
                  <p className="mt-1 font-medium text-ink-900">{incident.title}</p>
                  <p className="mt-1 text-sm text-graphite-500">{incident.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wide ${severityStyles[incident.severity]}`}>
                    {incident.severity}
                  </span>
                  <StatusBadge status={incident.status} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(incident.id, s)}
                    disabled={incident.status === s}
                    className="rounded-full border border-ink-900/15 px-3 py-1 text-[11px] font-medium capitalize text-graphite-700 hover:border-forest-600/50 disabled:opacity-40"
                  >
                    Mark {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
