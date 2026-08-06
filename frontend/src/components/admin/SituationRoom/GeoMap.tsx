"use client";

import { useEffect, useMemo, useState } from "react";

type MapWard = {
  ward_id?: number;
  ward?: string;
  status?: string;
  percentage_completed?: number;
};

type Feature = {
  type: "Feature";
  properties?: { name?: string; lga?: string; center_lat?: number; center_lng?: number };
  geometry: { type: string; coordinates: unknown };
};

/**
 * Live map:
 * 1) Tries API /situation-room/map.geojson (wards with stored polygons)
 * 2) Falls back to bundled /geo/edo_lgas.geojson (all Edo LGAs — no admin upload needed)
 * Colours polygons by matching map_wards status when names align.
 */
export function GeoMap({
  constituencyId,
  mapWards,
}: {
  constituencyId: number | null;
  mapWards: MapWard[];
}) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [source, setSource] = useState<"api" | "bundled" | "none">("none");

  useEffect(() => {
    let cancelled = false;
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");
    const token = typeof window !== "undefined" ? localStorage.getItem("le_platform_token") : null;
    const q = constituencyId ? `?constituency_id=${constituencyId}` : "";

    async function load() {
      // Prefer API (seeded wards)
      try {
        const res = await fetch(`${base}/situation-room/map.geojson${q}`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const fc = await res.json();
          const list = Array.isArray(fc?.features) ? fc.features : [];
          if (list.length > 0) {
            if (!cancelled) {
              setFeatures(list);
              setSource("api");
            }
            return;
          }
        }
      } catch {
        /* fall through */
      }

      // Bundled Edo LGA polygons — zero admin work
      try {
        const res = await fetch("/geo/edo_lgas.geojson");
        if (res.ok) {
          const fc = await res.json();
          const list = Array.isArray(fc?.features) ? fc.features : [];
          if (!cancelled) {
            setFeatures(list);
            setSource(list.length ? "bundled" : "none");
          }
          return;
        }
      } catch {
        /* ignore */
      }

      if (!cancelled) {
        setFeatures([]);
        setSource("none");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [constituencyId]);

  const statusByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const w of mapWards) {
      if (w.ward) m.set(w.ward.toLowerCase(), w.status ?? "no_result");
    }
    return m;
  }, [mapWards]);

  const color: Record<string, string> = {
    strong_lead: "#22c55e",
    leading: "#84cc16",
    close: "#eab308",
    trailing: "#ef4444",
    no_result: "#1e3a5f",
  };

  // SVG path from simple polygons (outer ring only) — scaled to viewBox
  const paths = useMemo(() => {
    if (!features.length) return [];

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    const rings: { name: string; status: string; pts: [number, number][] }[] = [];

    for (const f of features) {
      const name = f.properties?.name || f.properties?.lga || "Area";
      const status =
        statusByName.get(name.toLowerCase()) ||
        statusByName.get((f.properties?.lga || "").toLowerCase()) ||
        "no_result";
      const g = f.geometry;
      const polys: number[][][] =
        g.type === "Polygon"
          ? [g.coordinates as number[][]]
          : g.type === "MultiPolygon"
            ? (g.coordinates as number[][][]).map((p) => p[0] as unknown as number[])
            : [];

      // normalize: Polygon coordinates is number[][][] (rings), MultiPolygon number[][][][]
      let outerRings: [number, number][][] = [];
      if (g.type === "Polygon") {
        outerRings = [(g.coordinates as [number, number][][])[0]];
      } else if (g.type === "MultiPolygon") {
        outerRings = (g.coordinates as [number, number][][][]).map((poly) => poly[0]);
      }

      for (const ring of outerRings) {
        if (!ring?.length) continue;
        for (const [x, y] of ring) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
        rings.push({ name, status, pts: ring });
      }
    }

    if (!Number.isFinite(minX)) return [];

    const pad = 8;
    const w = 240 - pad * 2;
    const h = 180 - pad * 2;
    const sx = w / (maxX - minX || 1);
    const sy = h / (maxY - minY || 1);
    const s = Math.min(sx, sy);

    return rings.map((r, i) => {
      const d = r.pts
        .map(([x, y], idx) => {
          const px = pad + (x - minX) * s;
          const py = pad + (maxY - y) * s; // flip Y for SVG
          return `${idx === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
        })
        .join(" ") + " Z";
      return { id: i, d, name: r.name, fill: color[r.status] ?? color.no_result };
    });
  }, [features, statusByName]);

  if (!paths.length) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center rounded-lg border border-dashed border-slate-700 text-xs text-slate-500">
        Loading Edo map…
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[180px] w-full overflow-hidden rounded-lg">
      <p className="absolute left-2 top-2 z-10 rounded bg-black/50 px-2 py-0.5 text-[9px] text-slate-400">
        {source === "api" ? "Live boundaries" : "Edo LGAs (bundled)"} · {paths.length} areas
      </p>
      <svg viewBox="0 0 240 180" className="h-full w-full">
        <rect width="240" height="180" fill="#0a1220" />
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            fill={p.fill}
            fillOpacity={0.75}
            stroke="#94a3b8"
            strokeWidth={0.6}
          >
            <title>{p.name}</title>
          </path>
        ))}
      </svg>
    </div>
  );
}
