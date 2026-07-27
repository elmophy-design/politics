"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Check, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { StatusBadge } from "@/components/admin/Shared/StatusBadge";
import { DataState } from "@/components/admin/Shared/DataState";

type Volunteer = {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  status: "pending" | "approved" | "rejected";
  ward: { id: number; name: string } | null;
};
type Paginated<T> = { data: T[] };

const filters = ["", "pending", "approved", "rejected"];

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  function load() {
    setVolunteers(null);
    const query = statusFilter ? `?status=${statusFilter}` : "";
    apiFetch<Paginated<Volunteer>>(`/volunteers${query}`)
      .then((res) => setVolunteers(res.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load volunteers"));
  }

  useEffect(load, [statusFilter]);

  async function updateStatus(id: number, status: "approved" | "rejected") {
    try {
      await apiFetch(`/volunteers/${id}`, { method: "PATCH", body: { status } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update volunteer");
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Membership Portal" title="Volunteers" />

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
        loading={volunteers === null}
        empty={volunteers?.length === 0}
        error={error}
        emptyIcon={Users}
        emptyText="No volunteers in this category yet."
      />

      {volunteers && volunteers.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-sm border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-parchment-100 text-xs uppercase tracking-wide text-graphite-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Ward</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10 bg-parchment-50">
              {volunteers.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    <Link href={`/admin/volunteers/${v.id}`} className="hover:text-forest-600">
                      {v.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-graphite-500">{v.phone}{v.email ? ` · ${v.email}` : ""}</td>
                  <td className="px-4 py-3 text-graphite-500">{v.ward?.name ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3">
                    {v.status === "pending" && (
                      <div className="flex justify-end gap-3">
                        <button onClick={() => updateStatus(v.id, "approved")} className="text-graphite-500 hover:text-forest-600">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => updateStatus(v.id, "rejected")} className="text-graphite-500 hover:text-clay-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
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
