"use client";

import { useEffect, useState } from "react";
import { Bell, Download, Maximize2, Minimize2 } from "lucide-react";
import { apiFetch, ApiError, getToken } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

type Constituency = { id: number; name: string };

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");
const STORAGE_KEY = "le_live_constituency_id";

type Props = {
  constituencyId: number | null;
  onConstituencyChange: (id: number | null) => void;
  projector: boolean;
  onProjectorToggle: () => void;
  pendingCount: number;
  onOpenQueue: () => void;
};

export function LiveToolbar({
  constituencyId,
  onConstituencyChange,
  projector,
  onProjectorToggle,
  pendingCount,
  onOpenQueue,
}: Props) {
  const [list, setList] = useState<Constituency[]>([]);
  const [critical, setCritical] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Constituency[]>("/constituencies")
      .then(setList)
      .catch(() => setList([]));
  }, []);

  useEffect(() => {
    const load = () => {
      apiFetch<{ count: number }>("/situation-room/notifications/critical")
        .then((r) => {
          if (r.count > critical && critical > 0) {
            setToast("Critical incident reported");
            try {
              // Browser notification if permitted
              if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                new Notification("Situation Room", { body: "Critical incident reported" });
              }
            } catch {
              /* ignore */
            }
          }
          setCritical(r.count);
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [critical]);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  function exportResults() {
    const token = getToken();
    const q = constituencyId ? `?constituency_id=${constituencyId}` : "";
    fetch(`${API_URL}/situation-room/export/results${q}`, {
      headers: { Authorization: `Bearer ${token ?? ""}`, Accept: "text/csv" },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `results-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => setToast("Export failed"));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={constituencyId ?? ""}
        onChange={(e) => {
          const v = e.target.value ? Number(e.target.value) : null;
          onConstituencyChange(v);
          try {
            if (v) localStorage.setItem(STORAGE_KEY, String(v));
            else localStorage.removeItem(STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }}
        className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] text-slate-200"
      >
        <option value="">All constituencies</option>
        {list.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onOpenQueue}
        className="relative rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] text-slate-200 hover:bg-slate-800"
      >
        Pending queue
        {pendingCount > 0 && (
          <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-black">
            {pendingCount}
          </span>
        )}
      </button>

      <button
        type="button"
        className="relative rounded border border-slate-700 bg-slate-900 p-1.5 text-slate-200 hover:bg-slate-800"
        title="Critical incidents"
      >
        <Bell className={cn("h-3.5 w-3.5", critical > 0 && "text-red-400")} />
        {critical > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold">
            {critical}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={exportResults}
        className="rounded border border-slate-700 bg-slate-900 p-1.5 text-slate-200 hover:bg-slate-800"
        title="Export verified results CSV"
      >
        <Download className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={onProjectorToggle}
        className="rounded border border-slate-700 bg-slate-900 p-1.5 text-slate-200 hover:bg-slate-800"
        title={projector ? "Exit projector mode" : "Projector mode"}
      >
        {projector ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </button>

      {toast && (
        <span className="rounded bg-red-500/20 px-2 py-1 text-[10px] text-red-300" onAnimationEnd={() => setToast(null)}>
          {toast}
        </span>
      )}
    </div>
  );
}

export function readStoredConstituencyId(): number | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}
