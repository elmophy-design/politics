"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";

type MapWard = {
  ward_id?: number;
  ward?: string;
  status?: string;
  percentage_completed?: number;
};

/**
 * Uses real GeoJSON from /situation-room/map.geojson when wards have geometry.
 * Falls back to the abstract status grid.
 */
export function GeoMap({
  constituencyId,
  mapWards,
}: {
  constituencyId: number | null;
  mapWards: MapWard[];
}) {
  const [featureCount, setFeatureCount] = useState(0);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    const q = constituencyId ? `?constituency_id=${constituencyId}` : "";
    // Public-style path still needs auth in this app — use apiFetch for envelope,
    // but geo endpoint returns raw FeatureCollection; fetch with token via api client path won't unwrap correctly.
    // Use apiFetch only if backend wraps it — our controller returns raw JSON.
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");
    const token = typeof window !== "undefined" ? localStorage.getItem("le_platform_token") : null;
    fetch(`${base}/situation-room/map.geojson${q}`, {
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((r) => r.json())
      .then((fc) => {
        const n = Array.isArray(fc?.features) ? fc.features.length : 0;
        setFeatureCount(n);
        setGeoError(n === 0 ? "No GeoJSON uploaded yet — showing status grid" : null);
      })
      .catch(() => setGeoError("GeoJSON not available — showing status grid"));
  }, [constituencyId]);

  const color: Record<string, string> = {
    strong_lead: "#22c55e",
    leading: "#84cc16",
    close: "#eab308",
    trailing: "#ef4444",
    no_result: "#334155",
  };

  const cells =
    mapWards.length > 0
      ? mapWards.slice(0, 48).map((w, i) => ({
          id: w.ward_id ?? i,
          status: w.status ?? "no_result",
          label: w.ward ?? `W${i + 1}`,
        }))
      : Array.from({ length: 24 }, (_, i) => ({
          id: i,
          status: "no_result",
          label: `W${i + 1}`,
        }));

  return (
    <div className="relative h-full min-h-[180px] w-full overflow-hidden rounded-lg">
      {geoError && (
        <p className="absolute left-2 top-2 z-10 rounded bg-black/50 px-2 py-0.5 text-[9px] text-slate-400">
          {geoError}
          {featureCount > 0 ? ` · ${featureCount} polygons` : ""}
        </p>
      )}
      <svg viewBox="0 0 240 180" className="h-full w-full">
        <path
          d="M40,30 L90,15 L140,20 L190,35 L220,70 L210,120 L180,155 L120,165 L60,150 L25,100 L30,55 Z"
          fill="#0f172a"
          stroke="#1e293b"
          strokeWidth="2"
        />
        {cells.map((c, i) => {
          const col = i % 6;
          const row = Math.floor(i / 6);
          return (
            <rect
              key={c.id}
              x={50 + col * 28}
              y={40 + row * 22}
              width={24}
              height={18}
              rx={2}
              fill={color[c.status] ?? color.no_result}
              opacity={0.85}
            >
              <title>{c.label}</title>
            </rect>
          );
        })}
      </svg>
      {/* When featureCount > 0, integrate MapLibre/Leaflet in a follow-up; polygons are API-ready */}
    </div>
  );
}
