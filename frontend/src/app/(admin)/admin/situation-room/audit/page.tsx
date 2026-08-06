"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { apiFetch, ApiError, getToken } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { DataState } from "@/components/admin/Shared/DataState";
import { Building2 } from "lucide-react";

type Audit = {
  id: number;
  action: string;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_at: string;
  user: { id: number; name: string } | null;
  result: {
    id: number;
    polling_unit?: { name: string; ward?: { name: string } | null } | null;
  } | null;
};
type Paginated<T> = { data: T[] };

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

export default function AuditLogPage() {
  const [rows, setRows] = useState<Audit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Paginated<Audit>>("/situation-room/audit?per_page=50")
      .then((r) => setRows(r.data ?? []))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load audit log"));
  }, []);

  function exportCsv() {
    const token = getToken();
    window.open(`${API_URL}/situation-room/export/audit?token=${token ?? ""}`, "_blank");
    // Prefer fetch blob with Authorization header
    fetch(`${API_URL}/situation-room/export/audit`, {
      headers: { Authorization: `Bearer ${token ?? ""}`, Accept: "text/csv" },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `election-audit-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => setError("Export failed"));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Situation Room"
        title="Audit log"
        action={
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-sm border border-ink-900/15 px-3 py-2 text-xs hover:bg-parchment-100"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        }
      />
      <DataState
        loading={rows === null}
        empty={rows?.length === 0}
        error={error}
        emptyIcon={Building2}
        emptyText="No audit entries yet"
      />
      {rows && rows.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-sm border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-900/5 font-mono text-[11px] uppercase text-graphite-500">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5 bg-parchment-50">
              {rows.map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-graphite-500">
                    {new Date(a.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{a.user?.name ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs capitalize">{a.action}</td>
                  <td className="px-3 py-2 text-xs">
                    {a.result?.polling_unit?.name ?? `#${a.result?.id ?? "—"}`}
                    {a.result?.polling_unit?.ward?.name ? (
                      <span className="text-graphite-500"> · {a.result.polling_unit.ward.name}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {a.from_status ?? "—"} → {a.to_status ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-graphite-500">{a.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
