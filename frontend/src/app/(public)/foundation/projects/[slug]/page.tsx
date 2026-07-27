import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";

type FoundationProject = {
  id: number;
  title: string;
  category: string;
  summary: string | null;
  description: string | null;
  status: string;
  ward: { id: number; name: string } | null;
  successStories: { id: number; full_name: string; story: string | null }[];
};

export default async function FoundationProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let project: FoundationProject | null = null;
  let notFoundMessage: string | null = null;

  try {
    project = await apiFetch<FoundationProject>(`/foundation/projects/${slug}`);
  } catch (err) {
    notFoundMessage = err instanceof ApiError ? err.message : "Project not found.";
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Link href="/foundation/projects" className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-700">
        <ArrowLeft className="h-4 w-4" /> Back to Foundation
      </Link>

      {project ? (
        <>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.24em] text-forest-600">
            {project.category.replace("_", " ")} · {project.ward?.name ?? "Constituency-wide"}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
            {project.title}
          </h1>
          {project.summary && (
            <p className="mt-4 text-lg text-graphite-500">{project.summary}</p>
          )}
          {project.description && (
            <p className="mt-8 whitespace-pre-line leading-relaxed text-graphite-700">
              {project.description}
            </p>
          )}

          {project.successStories?.length > 0 && (
            <div className="mt-16">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink-900">
                Success Stories
              </h2>
              <div className="mt-6 space-y-6">
                {project.successStories.map((story) => (
                  <div key={story.id} className="border-l-2 border-gold-500 pl-6">
                    <p className="font-medium text-ink-900">{story.full_name}</p>
                    {story.story && <p className="mt-2 text-sm text-graphite-700">{story.story}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="mt-12 text-graphite-500">{notFoundMessage}</p>
      )}
    </div>
  );
}
