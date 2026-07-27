"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, Stethoscope, Briefcase, FolderKanban, HeartHandshake } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { CardGridSkeleton } from "@/components/common/Skeleton/CardSkeleton";

type FoundationProject = {
  id: number;
  title: string;
  slug: string;
  category: "project" | "scholarship" | "empowerment" | "medical_outreach";
  summary: string | null;
  status: "planned" | "ongoing" | "completed";
  ward: { id: number; name: string } | null;
  beneficiaries_count: number;
};
type Paginated<T> = { data: T[] };

const categoryMeta: Record<FoundationProject["category"], { label: string; icon: typeof GraduationCap }> = {
  scholarship: { label: "Scholarship", icon: GraduationCap },
  medical_outreach: { label: "Medical Outreach", icon: Stethoscope },
  empowerment: { label: "Empowerment", icon: Briefcase },
  project: { label: "Project", icon: FolderKanban },
};

const statusStyles: Record<FoundationProject["status"], string> = {
  ongoing: "bg-forest-600/10 text-forest-700",
  completed: "bg-ink-900/10 text-ink-900",
  planned: "bg-gold-500/10 text-gold-600",
};

export default function FoundationPage() {
  const [projects, setProjects] = useState<FoundationProject[] | null>(null);

  useEffect(() => {
    apiFetch<Paginated<FoundationProject>>("/foundation/projects")
      .then((res) => setProjects(res.data ?? []))
      .catch(() => setProjects([]));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">
        Lucky Eseigbe Foundation
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
        Impact beyond the campaign cycle.
      </h1>
      <p className="mt-4 max-w-xl text-graphite-500">
        Scholarships, medical outreach, and empowerment programs reaching
        communities across every ward.
      </p>

      {projects === null && (
        <div className="mt-16">
          <CardGridSkeleton count={6} aspect="aspect-[4/3]" columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
        </div>
      )}

      {projects?.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 rounded-sm border border-dashed border-ink-900/15 py-24 text-center">
          <HeartHandshake className="h-8 w-8 text-graphite-500" strokeWidth={1.5} />
          <p className="text-sm text-graphite-500">No Foundation projects published yet.</p>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const meta = categoryMeta[project.category];
            const Icon = meta.icon;
            return (
              <Link
                key={project.id}
                href={`/foundation/projects/${project.slug}`}
                className="group flex flex-col gap-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6 transition-colors hover:border-forest-600/40"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-forest-600" strokeWidth={1.5} />
                  <span className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wide ${statusStyles[project.status]}`}>
                    {project.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">{meta.label}</p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-ink-900 group-hover:text-forest-600">
                    {project.title}
                  </h2>
                </div>
                {project.summary && (
                  <p className="line-clamp-2 text-sm text-graphite-500">{project.summary}</p>
                )}
                <p className="mt-auto text-xs text-graphite-500">
                  {project.ward?.name ?? "Constituency-wide"} · {project.beneficiaries_count} beneficiaries
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
