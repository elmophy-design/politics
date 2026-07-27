"use client";

import { useEffect, useState } from "react";
import { MessagesSquare } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { StatusBadge } from "@/components/admin/Shared/StatusBadge";
import { DataState } from "@/components/admin/Shared/DataState";

type CitizenReport = {
  id: number;
  type: "complaint" | "issue" | "request" | "suggestion";
  full_name: string;
  subject: string;
  description: string;
  status: "submitted" | "assigned" | "in_progress" | "resolved" | "closed";
  ward: { id: number; name: string } | null;
};
type Paginated<T> = { data: T[] };

const statusOptions = ["submitted", "assigned", "in_progress", "resolved", "closed"];

export default function AdminCitizenReportsPage() {
  const [reports, setReports] = useState<CitizenReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("");

  function load() {
    setReports(null);
    const query = typeFilter ? `?type=${typeFilter}` : "";
    apiFetch<Paginated<CitizenReport>>(`/citizen-reports${query}`)
      .then((res) => setReports(res.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load reports"));
  }

  useEffect(load, [typeFilter]);

  async function updateStatus(id: number, status: string) {
    try {
      await apiFetch(`/citizen-reports/${id}`, { method: "PATCH", body: { status } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update report");
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Citizen Engagement" title="Reports" />

      <div className="mt-6 flex flex-wrap gap-2">
        {["", "complaint", "issue", "request", "suggestion"].map((t) => (
          <button
            key={t || "all"}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
              typeFilter === t
                ? "border-forest-600 bg-forest-600/10 text-forest-700"
                : "border-ink-900/15 text-graphite-700 hover:border-forest-600/50"
            }`}
          >
            {t || "All"}
          </button>
        ))}
      </div>

      <DataState
        loading={reports === null}
        empty={reports?.length === 0}
        error={error}
        emptyIcon={MessagesSquare}
        emptyText="No reports in this category yet."
      />

      {reports && reports.length > 0 && (
        <div className="mt-8 space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="rounded-sm border border-ink-900/10 bg-parchment-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">
                    {r.type} · {r.full_name} · {r.ward?.name ?? "Ward not specified"}
                  </p>
                  <p className="mt-1 font-medium text-ink-900">{r.subject}</p>
                  <p className="mt-1 text-sm text-graphite-500">{r.description}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(r.id, s)}
                    disabled={r.status === s}
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
