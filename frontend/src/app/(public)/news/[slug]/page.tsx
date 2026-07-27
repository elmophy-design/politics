import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { MediaItem } from "@/lib/types/media";

const dateFormatter = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "long", year: "numeric" });

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let article: MediaItem | null = null;
  let notFoundMessage: string | null = null;

  try {
    article = await apiFetch<MediaItem>(`/media/${slug}`);
  } catch (err) {
    notFoundMessage = err instanceof ApiError ? err.message : "Article not found.";
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Link href="/news" className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-700">
        <ArrowLeft className="h-4 w-4" /> Back to News
      </Link>

      {article ? (
        <>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.24em] text-forest-600">
            {dateFormatter.format(new Date(article.created_at))}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
            {article.title}
          </h1>
          {article.description && (
            <p className="mt-8 whitespace-pre-line leading-relaxed text-graphite-700">
              {article.description}
            </p>
          )}
        </>
      ) : (
        <p className="mt-12 text-graphite-500">{notFoundMessage}</p>
      )}
    </div>
  );
}
