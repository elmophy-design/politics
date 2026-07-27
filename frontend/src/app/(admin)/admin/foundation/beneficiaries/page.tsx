"use client";

import { useEffect, useState } from "react";
import { Users2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { DataState } from "@/components/admin/Shared/DataState";

type Beneficiary = {
  id: number;
  full_name: string;
  phone: string | null;
  is_success_story: boolean;
  project: { id: number; title: string } | null;
  ward: { id: number; name: string } | null;
};
type Paginated<T> = { data: T[] };

export default function AdminBeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiFetch<Paginated<Beneficiary>>("/foundation/beneficiaries")
      .then((res) => setBeneficiaries(res.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load beneficiaries"));
  }

  useEffect(load, []);

  async function toggleSuccessStory(b: Beneficiary) {
    try {
      await apiFetch(`/foundation/beneficiaries/${b.id}`, {
        method: "PATCH",
        body: { is_success_story: !b.is_success_story },
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update beneficiary");
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Lucky Eseigbe Foundation" title="Beneficiaries" />
      <p className="mt-2 text-sm text-graphite-500">
        Add new beneficiaries from a project&rsquo;s page — this view is for
        reviewing everyone registered and flagging success stories for the public site.
      </p>

      <DataState
        loading={beneficiaries === null}
        empty={beneficiaries?.length === 0}
        error={error}
        emptyIcon={Users2}
        emptyText="No beneficiaries recorded yet."
      />

      {beneficiaries && beneficiaries.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-sm border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-parchment-100 text-xs uppercase tracking-wide text-graphite-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Ward</th>
                <th className="px-4 py-3">Success Story</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10 bg-parchment-50">
              {beneficiaries.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{b.full_name}</td>
                  <td className="px-4 py-3 text-graphite-500">{b.project?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-graphite-500">{b.ward?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSuccessStory(b)}
                      className={b.is_success_story ? "text-forest-700" : "text-graphite-500 hover:text-forest-600"}
                    >
                      {b.is_success_story ? "Featured" : "Feature this story"}
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
