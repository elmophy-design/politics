"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { ListCardSkeleton } from "@/components/common/Skeleton/CardSkeleton";

type ConstituencyProject = {
  id: number;
  title: string;
  community: string | null;
  project_type: string;
  progress_percentage: number;
  status: "planned" | "ongoing" | "completed" | "stalled";
  ward: { id: number; name: string } | null;
};
type Paginated<T> = { data: T[] };

const statusStyles: Record<ConstituencyProject["status"], string> = {
  ongoing: "bg-forest-600/10 text-forest-700",
  completed: "bg-ink-900/10 text-ink-900",
  planned: "bg-gold-500/10 text-gold-600",
  stalled: "bg-clay-500/10 text-clay-600",
};

export default function ConstituencyProjectsPage() {
  const [projects, setProjects] = useState<ConstituencyProject[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const query = statusFilter ? `?status=${statusFilter}` : "";
    apiFetch<Paginated<ConstituencyProject>>(`/constituency-projects${query}`)
      .then((res) => setProjects(res.data ?? []))
      .catch(() => setProjects([]));
  }, [statusFilter]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">Transparency Tracker</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
        Constituency Projects
      </h1>
      <p className="mt-4 max-w-xl text-graphite-500">
        Every road, borehole, and classroom funded through this office — tracked
        by ward, with real progress.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {["", "planned", "ongoing", "completed", "stalled"].map((s) => (
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

      {projects === null && (
        <div className="mt-16"><ListCardSkeleton count={4} /></div>
      )}

      {projects?.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 rounded-sm border border-dashed border-ink-900/15 py-24 text-center">
          <Building2 className="h-8 w-8 text-graphite-500" strokeWidth={1.5} />
          <p className="text-sm text-graphite-500">No projects logged in this category yet.</p>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mt-10 space-y-4">
          {projects.map((project) => (
            <Link
              href={`/constituency-projects/${project.id}`}
              key={project.id}
              className="block rounded-sm border border-ink-900/10 bg-parchment-50 p-6 transition-colors hover:border-forest-600/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">
                    {project.project_type} · {project.ward?.name ?? "Constituency-wide"}
                    {project.community ? ` · ${project.community}` : ""}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-ink-900">
                    {project.title}
                  </h2>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wide ${statusStyles[project.status]}`}>
                  {project.status}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-graphite-500">
                  <span>Progress</span>
                  <span>{project.progress_percentage}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-900/10">
                  <div
                    className="h-full rounded-full bg-forest-600 transition-all"
                    style={{ width: `${project.progress_percentage}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
