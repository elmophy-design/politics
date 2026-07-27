"use client";

import { useEffect, useState } from "react";
import { HandCoins } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { StatusBadge } from "@/components/admin/Shared/StatusBadge";
import { DataState } from "@/components/admin/Shared/DataState";

type Donation = {
  id: number;
  donor_name: string | null;
  is_anonymous: boolean;
  amount: number;
  gateway: string;
  reference: string;
  status: string;
  created_at: string;
  campaign: { id: number; title: string } | null;
};
type Paginated<T> = { data: T[] };

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" });

export default function AdminDonationsReportsPage() {
  const [donations, setDonations] = useState<Donation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Paginated<Donation>>("/donations")
      .then((res) => setDonations(res.data ?? []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load donations"));
  }, []);

  const totalRaised = donations?.filter((d) => d.status === "successful").reduce((sum, d) => sum + Number(d.amount), 0) ?? 0;

  return (
    <div>
      <PageHeader eyebrow="Donation Reports" title="Donations" />

      {donations && donations.length > 0 && (
        <p className="mt-4 font-mono text-sm text-graphite-500">
          Total confirmed: <span className="font-semibold text-forest-700">{currency.format(totalRaised)}</span>
        </p>
      )}

      <DataState
        loading={donations === null}
        empty={donations?.length === 0}
        error={error}
        emptyIcon={HandCoins}
        emptyText="No donations recorded yet."
      />

      {donations && donations.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-sm border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-parchment-100 text-xs uppercase tracking-wide text-graphite-500">
              <tr>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Gateway</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10 bg-parchment-50">
              {donations.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {d.is_anonymous ? "Anonymous" : d.donor_name ?? "Anonymous"}
                  </td>
                  <td className="px-4 py-3 text-graphite-500">{d.campaign?.title ?? "General Fund"}</td>
                  <td className="px-4 py-3 font-mono text-graphite-700">{currency.format(d.amount)}</td>
                  <td className="px-4 py-3 capitalize text-graphite-500">{d.gateway.replace("_", " ")}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-graphite-500">{dateFormatter.format(new Date(d.created_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
