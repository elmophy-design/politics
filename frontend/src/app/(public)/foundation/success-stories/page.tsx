"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

type SuccessStory = {
  id: number;
  full_name: string;
  story: string | null;
  project: { id: number; title: string; slug: string } | null;
};
type Paginated<T> = { data: T[] };

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[] | null>(null);

  useEffect(() => {
    apiFetch<Paginated<SuccessStory>>("/foundation/success-stories")
      .then((res) => setStories(res.data ?? []))
      .catch(() => setStories([]));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">Foundation</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
        Success Stories
      </h1>
      <p className="mt-4 text-graphite-500">Real outcomes from real Foundation programs.</p>

      {stories === null && <p className="mt-16 font-mono text-sm text-graphite-500">Loading stories…</p>}

      {stories?.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 rounded-sm border border-dashed border-ink-900/15 py-24 text-center">
          <Sparkles className="h-8 w-8 text-graphite-500" strokeWidth={1.5} />
          <p className="text-sm text-graphite-500">No success stories published yet.</p>
        </div>
      )}

      {stories && stories.length > 0 && (
        <div className="mt-14 space-y-10">
          {stories.map((s) => (
            <div key={s.id} className="border-l-2 border-gold-500 pl-6">
              <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink-900">
                {s.full_name}
              </p>
              {s.project && (
                <p className="mt-1 font-mono text-xs uppercase tracking-wide text-gold-600">{s.project.title}</p>
              )}
              {s.story && <p className="mt-3 leading-relaxed text-graphite-700">{s.story}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
