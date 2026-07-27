"use client";

import { useEffect, useState } from "react";
import { Megaphone, HandCoins, Users, ShieldAlert, AlertTriangle, MessagesSquare } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { StatCard } from "@/components/admin/Dashboard/StatCard";

type DashboardData = {
  campaigns: { active: number; total: number };
  donations: { total_raised: number; successful_count: number; pending_count: number };
  volunteers: { total: number; pending_approval: number };
  situation_room: {
    results_pending_verification: number;
    results_verified: number;
    open_incidents: number;
    critical_incidents: number;
  };
  citizen_engagement: { open_reports: number; resolved_reports: number };
};

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<DashboardData>("/dashboard")
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load dashboard data"));
  }, []);

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">Overview</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink-900">
        Dashboard
      </h1>

      {error && (
        <p className="mt-6 rounded-sm border border-clay-500/30 bg-clay-500/5 px-4 py-3 text-sm text-clay-600">
          {error}
        </p>
      )}

      {!data && !error && (
        <p className="mt-6 font-mono text-sm text-graphite-500">Loading live figures…</p>
      )}

      {data && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Active Campaigns" value={data.campaigns.active} icon={Megaphone} sublabel={`${data.campaigns.total} total`} />
            <StatCard
              label="Total Raised"
              value={currency.format(data.donations.total_raised)}
              icon={HandCoins}
              sublabel={`${data.donations.successful_count} successful · ${data.donations.pending_count} pending`}
            />
            <StatCard label="Volunteers" value={data.volunteers.total} icon={Users} sublabel={`${data.volunteers.pending_approval} awaiting approval`} />
            <StatCard
              label="Results Pending Verification"
              value={data.situation_room.results_pending_verification}
              icon={ShieldAlert}
              tone={data.situation_room.results_pending_verification > 0 ? "alert" : "default"}
              sublabel={`${data.situation_room.results_verified} verified`}
            />
            <StatCard
              label="Open Incidents"
              value={data.situation_room.open_incidents}
              icon={AlertTriangle}
              tone={data.situation_room.critical_incidents > 0 ? "alert" : "default"}
              sublabel={`${data.situation_room.critical_incidents} critical`}
            />
            <StatCard
              label="Open Citizen Reports"
              value={data.citizen_engagement.open_reports}
              icon={MessagesSquare}
              sublabel={`${data.citizen_engagement.resolved_reports} resolved`}
            />
          </div>
        </>
      )}
    </div>
  );
}
