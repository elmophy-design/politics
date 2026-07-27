import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";

type ConstituencyProject = {
  id: number;
  title: string;
  community: string | null;
  project_type: string;
  budget: number | null;
  contractor: string | null;
  progress_percentage: number;
  status: string;
  description: string | null;
  ward: { id: number; name: string } | null;
};

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export default async function ConstituencyProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let project: ConstituencyProject | null = null;
  let notFoundMessage: string | null = null;

  try {
    project = await apiFetch<ConstituencyProject>(`/constituency-projects/${id}`);
  } catch (err) {
    notFoundMessage = err instanceof ApiError ? err.message : "Project not found.";
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Link href="/constituency-projects" className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-700">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      {project ? (
        <>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.24em] text-forest-600">
            {project.project_type} · {project.ward?.name ?? "Constituency-wide"}
            {project.community ? ` · ${project.community}` : ""}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
            {project.title}
          </h1>

          <div className="mt-8">
            <div className="flex items-center justify-between text-sm text-graphite-500">
              <span>Progress</span>
              <span>{project.progress_percentage}% · {project.status}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-900/10">
              <div
                className="h-full rounded-full bg-forest-600"
                style={{ width: `${project.progress_percentage}%` }}
              />
            </div>
          </div>

          {(project.budget || project.contractor) && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {project.budget && (
                <div className="rounded-sm border border-ink-900/10 bg-parchment-100 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-graphite-500">Budget</p>
                  <p className="mt-1 font-medium text-ink-900">{currency.format(project.budget)}</p>
                </div>
              )}
              {project.contractor && (
                <div className="rounded-sm border border-ink-900/10 bg-parchment-100 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-graphite-500">Contractor</p>
                  <p className="mt-1 font-medium text-ink-900">{project.contractor}</p>
                </div>
              )}
            </div>
          )}

          {project.description && (
            <p className="mt-8 whitespace-pre-line leading-relaxed text-graphite-700">{project.description}</p>
          )}
        </>
      ) : (
        <p className="mt-12 text-graphite-500">{notFoundMessage}</p>
      )}
    </div>
  );
}
