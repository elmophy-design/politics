"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

type NewsItem = { id: number; title: string; slug: string | null };
type Paginated<T> = { data: T[] };

export function NewsTicker() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    apiFetch<Paginated<NewsItem>>("/media?type=press_release&per_page=5")
      .then((res) => setItems(res.data ?? []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % items.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="relative z-50 overflow-hidden bg-gold-500 text-ink-950">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2">
        <span className="flex shrink-0 items-center gap-1.5 border-r border-ink-950/20 pr-3 font-mono text-[11px] font-semibold uppercase tracking-wide">
          <Radio className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} />
          Latest
        </span>

        <div className="relative h-5 flex-1 overflow-hidden">
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={`/news/${item.slug ?? item.id}`}
              aria-hidden={i !== activeIndex}
              tabIndex={i === activeIndex ? 0 : -1}
              className={`absolute inset-0 truncate text-sm font-medium transition-all duration-500 ease-in-out hover:underline ${
                i === activeIndex
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-2 opacity-0"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>

        <Link
          href="/news"
          className="hidden shrink-0 text-xs font-semibold uppercase tracking-wide hover:underline sm:inline"
        >
          All News →
        </Link>
      </div>
    </div>
  );
}
