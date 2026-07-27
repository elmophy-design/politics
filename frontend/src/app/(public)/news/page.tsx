"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { ListCardSkeleton } from "@/components/common/Skeleton/CardSkeleton";
import type { MediaItem, Paginated } from "@/lib/types/media";

const dateFormatter = new Intl.DateTimeFormat("en-NG", { dateStyle: "long" });

export default function NewsPage() {
  const [items, setItems] = useState<MediaItem[] | null>(null);

  useEffect(() => {
    apiFetch<Paginated<MediaItem>>("/media?type=press_release")
      .then((res) => setItems(res.data ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">Newsroom</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
        Press Releases &amp; Updates
      </h1>

      {items === null && (
        <div className="mt-16"><ListCardSkeleton count={4} /></div>
      )}

      {items?.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 rounded-sm border border-dashed border-ink-900/15 py-24 text-center">
          <Newspaper className="h-8 w-8 text-graphite-500" strokeWidth={1.5} />
          <p className="text-sm text-graphite-500">No press releases published yet — check back soon.</p>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="mt-14 divide-y divide-ink-900/10">
          {items.map((item) => (
            <Link key={item.id} href={`/news/${item.slug ?? item.id}`} className="block py-8 first:pt-0">
              <p className="font-mono text-xs text-gold-600">{dateFormatter.format(new Date(item.created_at))}</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink-900 transition-colors hover:text-forest-600">
                {item.title}
              </h2>
              {item.description && (
                <p className="mt-3 line-clamp-2 leading-relaxed text-graphite-700">{item.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
