"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Maximize2,
  Send,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type PartySlice = { party: string; votes: number; percentage: number };
type LgaRow = {
  lga: string;
  percentage_completed: number;
  candidate_votes: number;
  total_votes: number;
  units_reported: number;
  units_total: number;
};
type WardRow = {
  ward: string;
  ward_id: number;
  percentage_completed: number;
  candidate_votes: number;
  units_reported: number;
  units_total: number;
};
type MapWard = {
  ward: string;
  ward_id: number;
  status: "strong_lead" | "leading" | "close" | "trailing" | "no_result" | string;
  candidate_votes: number;
  percentage_completed: number;
};
type LatestResult = {
  id: number;
  polling_unit: string;
  ward: string | null;
  party_votes: Record<string, number>;
  candidate_votes: number;
  submitted_at: string | null;
};
type IncidentRow = {
  id: number;
  title: string;
  severity: string;
  status: string;
  polling_unit: string | null;
  ward: string | null;
  reported_at: string | null;
};
type TrendPoint = { time: string; candidate: number; others: number };

type LiveData = {
  total_polling_units: number;
  results_received: number;
  percentage_completed: number;
  total_valid_votes: number;
  candidate: { name: string; party: string; votes: number; percentage: number };
  other_parties: { votes: number; percentage: number };
  party_breakdown: PartySlice[];
  results_by_lga: LgaRow[];
  top_wards: WardRow[];
  map_wards: MapWard[];
  latest_results: LatestResult[];
  incidents: IncidentRow[];
  trend: TrendPoint[];
  pending_results: number;
  flagged_results: number;
  updated_at: string;
};

/* ------------------------------------------------------------------ */
/* Demo / fallback data (matches the design mock)                      */
/* ------------------------------------------------------------------ */

const DEMO: LiveData = {
  total_polling_units: 987,
  results_received: 623,
  percentage_completed: 63.12,
  total_valid_votes: 128845,
  candidate: { name: "Lucky Eseigbe", party: "APC", votes: 74523, percentage: 57.8 },
  other_parties: { votes: 54322, percentage: 42.2 },
  party_breakdown: [
    { party: "APC", votes: 74523, percentage: 57.84 },
    { party: "PDP", votes: 28145, percentage: 21.84 },
    { party: "LP", votes: 12387, percentage: 9.61 },
    { party: "NNPP", votes: 7245, percentage: 5.62 },
    { party: "Others", votes: 6545, percentage: 5.08 },
  ],
  results_by_lga: [
    { lga: "Esan West", percentage_completed: 85.4, candidate_votes: 18245, total_votes: 25000, units_reported: 40, units_total: 47 },
    { lga: "Esan Central", percentage_completed: 78.6, candidate_votes: 15842, total_votes: 22000, units_reported: 35, units_total: 45 },
    { lga: "Igueben", percentage_completed: 72.1, candidate_votes: 12456, total_votes: 18000, units_reported: 28, units_total: 39 },
    { lga: "Owan East", percentage_completed: 62.3, candidate_votes: 9845, total_votes: 15000, units_reported: 22, units_total: 35 },
    { lga: "Owan West", percentage_completed: 58.9, candidate_votes: 8742, total_votes: 14000, units_reported: 20, units_total: 34 },
    { lga: "Etsako Central", percentage_completed: 51.2, candidate_votes: 5987, total_votes: 11000, units_reported: 18, units_total: 35 },
    { lga: "Etsako West", percentage_completed: 42.5, candidate_votes: 3456, total_votes: 9000, units_reported: 15, units_total: 35 },
    { lga: "Other LGAs", percentage_completed: 35.1, candidate_votes: 1950, total_votes: 6000, units_reported: 12, units_total: 34 },
  ],
  top_wards: [
    { ward: "Ward 6, Irruekpen", ward_id: 6, percentage_completed: 100, candidate_votes: 3456, units_reported: 8, units_total: 8 },
    { ward: "Ward 3, Ujaro", ward_id: 3, percentage_completed: 100, candidate_votes: 3210, units_reported: 7, units_total: 7 },
    { ward: "Ward 2, Ekpoma", ward_id: 2, percentage_completed: 98, candidate_votes: 2987, units_reported: 9, units_total: 10 },
    { ward: "Ward 1, Auchi", ward_id: 1, percentage_completed: 96, candidate_votes: 2845, units_reported: 8, units_total: 9 },
    { ward: "Ward 4, Igueben", ward_id: 4, percentage_completed: 95, candidate_votes: 2654, units_reported: 7, units_total: 8 },
  ],
  map_wards: [],
  latest_results: [
    {
      id: 1,
      polling_unit: "Unit 009",
      ward: "Central School, Irruekpen",
      party_votes: { APC: 238, PDP: 115, LP: 32 },
      candidate_votes: 238,
      submitted_at: new Date().toISOString(),
    },
    {
      id: 2,
      polling_unit: "Unit 015",
      ward: "Ujaro Primary",
      party_votes: { APC: 214, PDP: 104, LP: 26 },
      candidate_votes: 214,
      submitted_at: new Date().toISOString(),
    },
    {
      id: 3,
      polling_unit: "Unit 023",
      ward: "St. Mary School",
      party_votes: { APC: 167, PDP: 98, LP: 21 },
      candidate_votes: 167,
      submitted_at: new Date().toISOString(),
    },
    {
      id: 4,
      polling_unit: "Unit 002",
      ward: "Ekpoma College",
      party_votes: { APC: 189, PDP: 99, LP: 18 },
      candidate_votes: 189,
      submitted_at: new Date().toISOString(),
    },
  ],
  incidents: [
    {
      id: 1,
      title: "Ballot box snatching reported",
      severity: "high",
      status: "reported",
      polling_unit: "Unit 045",
      ward: "Owan East",
      reported_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Violence at polling unit",
      severity: "high",
      status: "under_review",
      polling_unit: "Unit 012",
      ward: "Etsako West",
      reported_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Vote buying reported",
      severity: "medium",
      status: "reported",
      polling_unit: "Unit 067",
      ward: "Esan Central",
      reported_at: new Date().toISOString(),
    },
  ],
  trend: [
    { time: "08:00", candidate: 2000, others: 1500 },
    { time: "10:00", candidate: 12000, others: 9000 },
    { time: "12:00", candidate: 28000, others: 20000 },
    { time: "14:00", candidate: 45000, others: 32000 },
    { time: "16:00", candidate: 62000, others: 45000 },
    { time: "18:00", candidate: 74523, others: 54322 },
  ],
  pending_results: 42,
  flagged_results: 8,
  updated_at: new Date().toISOString(),
};

const PARTY_COLORS: Record<string, string> = {
  APC: "#22c55e",
  PDP: "#3b82f6",
  LP: "#eab308",
  NNPP: "#ef4444",
  Others: "#a855f7",
  OTHER: "#a855f7",
};


/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG").format(n);
}

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function DonutChart({ slices, total }: { slices: PartySlice[]; total: number }) {
  const size = 168;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  // Precompute segments so React keys/offsets are stable
  const segments: { party: string; color: string; dash: number; offset: number }[] = [];
  let offset = 0;
  const safeTotal = total > 0 ? total : slices.reduce((a, s) => a + s.votes, 0) || 1;
  for (const s of slices) {
    const pct = s.votes / safeTotal;
    const dash = Math.max(0, pct * c);
    segments.push({
      party: s.party,
      color: PARTY_COLORS[s.party] ?? "#64748b",
      dash,
      offset,
    });
    offset += dash;
  }

  return (
    <div className="relative mx-auto flex h-[168px] w-[168px] shrink-0 items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1e293b"
          strokeWidth={stroke}
        />
        {segments.map((seg) => (
          <circle
            key={seg.party}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${seg.dash} ${Math.max(0, c - seg.dash)}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-lg font-bold tabular-nums text-white">{fmt(total)}</p>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Valid Votes</p>
      </div>
    </div>
  );
}

function TrendChart({ points }: { points: TrendPoint[] }) {
  if (!points.length) {
    return <div className="flex h-36 items-center justify-center text-xs text-slate-500">No trend data yet</div>;
  }
  const w = 400;
  const h = 140;
  const padL = 8;
  const padR = 8;
  const padT = 10;
  const padB = 22;
  const maxY = Math.max(...points.flatMap((p) => [p.candidate, p.others]), 1);
  const stepX = points.length > 1 ? (w - padL - padR) / (points.length - 1) : 0;

  const coords = (key: "candidate" | "others") =>
    points.map((p, i) => {
      const x = padL + i * stepX;
      const y = padT + (1 - p[key] / maxY) * (h - padT - padB);
      return { x, y };
    });

  const toPath = (key: "candidate" | "others") => {
    const pts = coords(key);
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  };

  const toArea = (key: "candidate" | "others") => {
    const pts = coords(key);
    if (!pts.length) return "";
    const base = h - padB;
    return (
      `M${pts[0].x},${base} ` +
      pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") +
      ` L${pts[pts.length - 1].x},${base} Z`
    );
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="none">
      {/* grid lines */}
      {[0.25, 0.5, 0.75].map((t) => {
        const y = padT + t * (h - padT - padB);
        return <line key={t} x1={padL} x2={w - padR} y1={y} y2={y} stroke="#1e293b" strokeWidth="1" />;
      })}
      <path d={toArea("candidate")} fill="rgba(34,197,94,0.12)" />
      <path d={toPath("candidate")} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d={toPath("others")} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords("candidate").map((p, i) => (
        <circle key={`c-${i}`} cx={p.x} cy={p.y} r="3" fill="#22c55e" />
      ))}
      {coords("others").map((p, i) => (
        <circle key={`o-${i}`} cx={p.x} cy={p.y} r="3" fill="#ef4444" />
      ))}
      {points.map((p, i) => (
        <text
          key={p.time}
          x={padL + i * stepX}
          y={h - 4}
          textAnchor="middle"
          fill="#64748b"
          style={{ fontSize: 10 }}
        >
          {p.time}
        </text>
      ))}
    </svg>
  );
}

function ResultsMap({ wards }: { wards: MapWard[] }) {
  // Stylized abstract ward grid matching the mock (not geo-accurate)
  const cells = useMemo(() => {
    const statuses = ["strong_lead", "leading", "close", "trailing", "no_result"] as const;
    if (wards.length) {
      return wards.slice(0, 48).map((w, i) => ({
        id: w.ward_id || i,
        status: w.status,
        label: w.ward,
      }));
    }
    // demo mosaic
    const demoStatus = [
      ...Array(12).fill("strong_lead"),
      ...Array(10).fill("leading"),
      ...Array(8).fill("close"),
      ...Array(6).fill("trailing"),
      ...Array(12).fill("no_result"),
    ];
    return demoStatus.map((s, i) => ({ id: i, status: s, label: `W${i + 1}` }));
  }, [wards]);

  const color: Record<string, string> = {
    strong_lead: "#22c55e",
    leading: "#84cc16",
    close: "#eab308",
    trailing: "#ef4444",
    no_result: "#334155",
  };

  return (
    <div className="relative h-full min-h-[180px] w-full overflow-hidden rounded-lg">
      <svg viewBox="0 0 240 180" className="h-full w-full">
        {/* abstract constituency silhouette */}
        <path
          d="M40,30 L90,15 L140,20 L190,35 L220,70 L210,120 L180,155 L120,165 L60,150 L25,100 L30,55 Z"
          fill="#0f172a"
          stroke="#1e293b"
          strokeWidth="2"
        />
        {cells.map((cell, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const x = 45 + col * 20 + (row % 2) * 6;
          const y = 35 + row * 22;
          return (
            <rect
              key={cell.id}
              x={x}
              y={y}
              width={18}
              height={18}
              rx={3}
              fill={color[cell.status] ?? "#334155"}
              opacity={0.9}
            >
              <title>{cell.label}</title>
            </rect>
          );
        })}
      </svg>
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 text-[9px]">
        {[
          ["strong_lead", "Strong Lead"],
          ["leading", "Leading"],
          ["close", "Close"],
          ["trailing", "Trailing"],
          ["no_result", "No Result"],
        ].map(([k, label]) => (
          <span key={k} className="flex items-center gap-1 text-slate-300">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: color[k] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function SituationRoomLivePage() {
  const [data, setData] = useState<LiveData>(DEMO);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState(() => new Date());
  const [chatMsg, setChatMsg] = useState("");
  const [feed, setFeed] = useState<
    { id: number; role: string; name: string; text: string; time: string; tag?: string }[]
  >([
    {
      id: 1,
      role: "Observer",
      name: "Ward 6 Observer",
      text: "Results from Unit 009, Central School, Irruekpen\nAPC – 238 | PDP – 115 | LP – 32",
      time: "04:41 PM",
      tag: "Observer",
    },
    {
      id: 2,
      role: "Agent",
      name: "Owan West Agent",
      text: "Unit 023, St. Mary School\nAPC – 167 | PDP – 98 | LP – 21",
      time: "04:40 PM",
      tag: "Agent",
    },
    {
      id: 3,
      role: "Admin",
      name: "Situation Room",
      text: "Results from Unit 015, Ujaro Primary\nAPC – 214 | PDP – 104 | LP – 26",
      time: "04:39 PM",
      tag: "Admin",
    },
    {
      id: 4,
      role: "Agent",
      name: "Igueben Youth",
      text: "Good turnout in Unit 007, Igueben Town!",
      time: "04:38 PM",
    },
    {
      id: 5,
      role: "Agent",
      name: "Ward 2 Agent",
      text: "Unit 002, Ekpoma College\nAPC – 189 | PDP – 99 | LP – 18",
      time: "04:37 PM",
      tag: "Agent",
    },
    {
      id: 6,
      role: "Volunteer",
      name: "Volunteer Team",
      text: "Keep it up everyone! Let's secure every vote.",
      time: "04:36 PM",
      tag: "Volunteer",
    },
    {
      id: 7,
      role: "System",
      name: "System",
      text: "New results received from 12 polling units.",
      time: "04:34 PM",
      tag: "Alert",
    },
  ]);

  const load = useCallback(() => {
    apiFetch<LiveData>("/situation-room/dashboard/live")
      .then((res) => {
        // Only adopt API data when there is real tally content.
        // Empty party_breakdown / trend would blank the charts — keep DEMO then.
        const hasVotes = res && (res.total_valid_votes > 0 || res.results_received > 0);
        const hasCharts =
          Array.isArray(res?.party_breakdown) &&
          res.party_breakdown.length > 0 &&
          Array.isArray(res?.trend);
        if (hasVotes && hasCharts) {
          setData({
            ...DEMO,
            ...res,
            party_breakdown: res.party_breakdown.length ? res.party_breakdown : DEMO.party_breakdown,
            trend: res.trend?.length ? res.trend : DEMO.trend,
            results_by_lga: res.results_by_lga?.length ? res.results_by_lga : DEMO.results_by_lga,
            top_wards: res.top_wards?.length ? res.top_wards : DEMO.top_wards,
            latest_results: res.latest_results?.length ? res.latest_results : DEMO.latest_results,
            incidents: res.incidents?.length ? res.incidents : DEMO.incidents,
            map_wards: res.map_wards ?? DEMO.map_wards,
          });
        }
        setLive(true);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "");
        setLive(false);
      });
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, 15000);
    const tick = setInterval(() => setClock(new Date()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [load]);

  const d = data;

  return (
    <div className="flex min-h-[calc(100vh-0px)] w-full flex-col bg-[#060d1a] text-slate-100">
      {/* Main — uses normal admin Sidebar from layout; no second nav */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800/80 px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-wide text-white">SITUATION ROOM</h1>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
              Live Election Results
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-red-600/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400 ring-1 ring-red-500/40">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="font-mono tabular-nums">
              {clock.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              {clock.toLocaleTimeString("en-GB")}
            </span>
            <button type="button" className="rounded p-1.5 hover:bg-slate-800" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </button>
            <button type="button" className="rounded p-1.5 hover:bg-slate-800" aria-label="Fullscreen">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        {error && (
          <div className="border-b border-amber-500/20 bg-amber-500/10 px-6 py-1.5 text-[11px] text-amber-300">
            {error}
          </div>
        )}

        {/* Body grid */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4">
            {/* KPI strip */}
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-6">
              <Kpi
                label="Total Polling Units"
                value={fmt(d.total_polling_units)}
                sub="100%"
                accent="blue"
              />
              <Kpi
                label="Results Received"
                value={fmt(d.results_received)}
                sub={`${d.percentage_completed}%`}
                accent="green"
              />
              <Kpi
                label="Percentage Completed"
                value={`${d.percentage_completed}%`}
                accent="emerald"
              />
              <Kpi
                label="Total Valid Votes"
                value={fmt(d.total_valid_votes)}
                accent="cyan"
              />
              <Kpi
                label="Lucky Eseigbe"
                value={fmt(d.candidate.votes)}
                sub={`${d.candidate.percentage}%`}
                accent="lime"
                highlight
              />
              <Kpi
                label="Other Parties"
                value={fmt(d.other_parties.votes)}
                sub={`${d.other_parties.percentage}%`}
                accent="rose"
              />
            </div>

            {/* Middle row: party + map */}
            <div className="mb-4 grid gap-4 lg:grid-cols-2">
              <Panel title="Results by Party">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <DonutChart slices={d.party_breakdown} total={d.total_valid_votes} />
                  <ul className="w-full flex-1 space-y-2 text-xs">
                    {d.party_breakdown.map((s) => (
                      <li key={s.party} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-sm"
                            style={{ background: PARTY_COLORS[s.party] ?? "#64748b" }}
                          />
                          <span className="font-medium text-slate-200">
                            {s.party === "APC" ? "Lucky Eseigbe (APC)" : s.party}
                          </span>
                        </span>
                        <span className="font-mono tabular-nums text-slate-400">
                          {fmt(s.votes)}{" "}
                          <span className="text-slate-500">({s.percentage}%)</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Panel>

              <Panel title="Results Map">
                <ResultsMap wards={d.map_wards} />
              </Panel>
            </div>

            {/* Bottom charts row */}
            <div className="mb-4 grid gap-4 lg:grid-cols-3">
              <Panel title="Results Trend">
                <div className="mb-2 flex gap-4 text-[10px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="h-1.5 w-4 rounded-full bg-emerald-500" /> Lucky Eseigbe
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="h-1.5 w-4 rounded-full bg-red-500" /> Other Parties
                  </span>
                </div>
                <div className="h-36">
                  <TrendChart points={d.trend} />
                </div>
              </Panel>

              <Panel title="Results by LGA">
                <div className="max-h-44 overflow-y-auto">
                  <table className="w-full text-[11px]">
                    <thead className="sticky top-0 bg-[#0f1a2e] text-slate-500">
                      <tr>
                        <th className="pb-2 text-left font-medium">LGA</th>
                        <th className="pb-2 text-right font-medium">% Completed</th>
                        <th className="pb-2 text-right font-medium">Lucky Eseigbe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.results_by_lga.map((row) => (
                        <tr key={row.lga} className="border-t border-slate-800/60">
                          <td className="py-1.5 text-slate-300">{row.lga}</td>
                          <td className="py-1.5 text-right font-mono text-slate-400">
                            {row.percentage_completed}%
                          </td>
                          <td className="py-1.5 text-right font-mono text-emerald-400">
                            {fmt(row.candidate_votes)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Top Performing Wards">
                <ul className="space-y-2.5">
                  {d.top_wards.map((w) => (
                    <li key={w.ward_id + w.ward} className="text-[11px]">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-slate-300">{w.ward}</span>
                        <span className="font-mono text-emerald-400">{fmt(w.candidate_votes)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                          style={{ width: `${Math.min(100, w.percentage_completed)}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-500">{w.percentage_completed}% completed</p>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>

            {/* Latest results + incidents */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel
                title="Latest Results"
                action={
                  <Link href="/admin/situation-room/results" className="text-[10px] text-emerald-400 hover:underline">
                    View all
                  </Link>
                }
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {d.latest_results.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-md border border-slate-800 bg-[#0a1528] px-3 py-2.5"
                    >
                      <p className="text-[10px] font-medium text-slate-400">
                        {r.polling_unit}
                        {r.ward ? ` · ${r.ward}` : ""}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {Object.entries(r.party_votes).map(([p, v]) => (
                          <span
                            key={p}
                            className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px]"
                          >
                            <span style={{ color: PARTY_COLORS[p] ?? "#94a3b8" }}>{p}</span>{" "}
                            <span className="text-white">{v}</span>
                          </span>
                        ))}
                      </div>
                      <p className="mt-1.5 text-[9px] text-slate-600">{timeAgo(r.submitted_at)}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel
                title="Incident Alerts"
                action={
                  <Link href="/admin/situation-room/incidents" className="text-[10px] text-emerald-400 hover:underline">
                    View all
                  </Link>
                }
              >
                <ul className="space-y-2">
                  {d.incidents.length === 0 && (
                    <li className="text-xs text-slate-500">No open incidents</li>
                  )}
                  {d.incidents.map((inc) => (
                    <li
                      key={inc.id}
                      className="flex items-start gap-2 rounded-md border border-slate-800 bg-[#0a1528] px-3 py-2"
                    >
                      <AlertTriangle
                        className={cn(
                          "mt-0.5 h-3.5 w-3.5 shrink-0",
                          inc.severity === "critical" || inc.severity === "high"
                            ? "text-red-400"
                            : "text-amber-400"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-slate-200">{inc.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {[inc.polling_unit, inc.ward].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                          inc.severity === "critical" || inc.severity === "high"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-amber-500/20 text-amber-400"
                        )}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-[9px] text-slate-600">{timeAgo(inc.reported_at)}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>

          {/* ---- Right: Live chat ---- */}
          <aside className="hidden w-72 shrink-0 flex-col border-l border-slate-800/80 bg-[#0a1220] xl:flex">
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Live Chat & Reports
              </h2>
              <span className="text-[10px] text-emerald-400">1,256 online</span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
              {feed.map((m) => (
                <div key={m.id} className="text-[11px]">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-slate-300">
                      {m.name.charAt(0)}
                    </span>
                    <span className="font-medium text-slate-200">{m.name}</span>
                    {m.tag && (
                      <span className="rounded bg-slate-800 px-1 py-0.5 text-[8px] uppercase text-slate-400">
                        {m.tag}
                      </span>
                    )}
                    <span className="ml-auto text-[9px] text-slate-600">{m.time}</span>
                  </div>
                  <p className="ml-8 whitespace-pre-line text-slate-400">{m.text}</p>
                </div>
              ))}
            </div>
            <form
              className="flex gap-2 border-t border-slate-800/80 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatMsg.trim()) return;
                setFeed((prev) => [
                  {
                    id: Date.now(),
                    role: "You",
                    name: "You",
                    text: chatMsg.trim(),
                    time: new Date().toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                  ...prev,
                ]);
                setChatMsg("");
              }}
            >
              <input
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-emerald-600"
              />
              <button
                type="submit"
                className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-500"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-800/80 bg-[#0f1a2e] px-3 py-3",
        highlight && "ring-1 ring-emerald-500/30"
      )}
    >
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-white">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] font-medium text-emerald-400">{sub}</p>}
    </div>
  );
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-800/80 bg-[#0f1a2e] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
