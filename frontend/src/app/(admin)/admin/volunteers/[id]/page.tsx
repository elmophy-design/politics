"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { StatusBadge } from "@/components/admin/Shared/StatusBadge";

type Volunteer = {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  occupation: string | null;
  gender: string | null;
  status: "pending" | "approved" | "rejected";
  skills: string[] | null;
  areas_of_interest: string[] | null;
  ward: { id: number; name: string } | null;
  pollingUnit: { id: number; name: string } | null;
};

export default function AdminVolunteerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiFetch<Volunteer>(`/volunteers/${id}`)
      .then(setVolunteer)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load volunteer"));
  }

  useEffect(load, [id]);

  async function updateStatus(status: "approved" | "rejected") {
    try {
      await apiFetch(`/volunteers/${id}`, { method: "PATCH", body: { status } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update volunteer");
    }
  }

  return (
    <div>
      <Link href="/admin/volunteers" className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-700">
        <ArrowLeft className="h-4 w-4" /> Back to Volunteers
      </Link>

      {error && <p className="mt-6 rounded-sm border border-clay-500/30 bg-clay-500/5 px-4 py-3 text-sm text-clay-600">{error}</p>}

      {volunteer && (
        <div className="mt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink-900">
                {volunteer.full_name}
              </h1>
              <p className="mt-1 text-sm text-graphite-500">
                {volunteer.ward?.name ?? "Ward not specified"}
                {volunteer.pollingUnit ? ` · ${volunteer.pollingUnit.name}` : ""}
              </p>
            </div>
            <StatusBadge status={volunteer.status} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-sm border border-ink-900/10 bg-parchment-50 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-graphite-500">Phone</p>
              <p className="mt-1 text-ink-900">{volunteer.phone}</p>
            </div>
            <div className="rounded-sm border border-ink-900/10 bg-parchment-50 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-graphite-500">Email</p>
              <p className="mt-1 text-ink-900">{volunteer.email ?? "—"}</p>
            </div>
            <div className="rounded-sm border border-ink-900/10 bg-parchment-50 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-graphite-500">Occupation</p>
              <p className="mt-1 text-ink-900">{volunteer.occupation ?? "—"}</p>
            </div>
            <div className="rounded-sm border border-ink-900/10 bg-parchment-50 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-graphite-500">Address</p>
              <p className="mt-1 text-ink-900">{volunteer.address ?? "—"}</p>
            </div>
          </div>

          {volunteer.areas_of_interest && volunteer.areas_of_interest.length > 0 && (
            <div className="mt-6">
              <p className="font-mono text-[11px] uppercase tracking-wide text-graphite-500">Areas of Interest</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {volunteer.areas_of_interest.map((i) => (
                  <span key={i} className="rounded-full bg-forest-600/10 px-3 py-1 text-xs text-forest-700">{i}</span>
                ))}
              </div>
            </div>
          )}

          {volunteer.status === "pending" && (
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => updateStatus("approved")}
                className="inline-flex items-center gap-2 rounded-sm bg-forest-600 px-5 py-2.5 text-sm font-medium text-parchment-50 hover:bg-forest-700"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => updateStatus("rejected")}
                className="inline-flex items-center gap-2 rounded-sm border border-clay-500 px-5 py-2.5 text-sm font-medium text-clay-600 hover:bg-clay-500/10"
              >
                <X className="h-4 w-4" /> Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
