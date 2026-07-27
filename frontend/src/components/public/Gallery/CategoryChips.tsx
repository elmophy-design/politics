"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

export function CategoryChips({ active }: { active?: string }) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    apiFetch<string[]>("/media/categories?type=gallery_image")
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="mt-8 flex flex-wrap gap-2">
      <Link
        href="/gallery"
        className={cn(
          "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
          !active
            ? "border-forest-600 bg-forest-600/10 text-forest-700"
            : "border-ink-900/15 text-graphite-700 hover:border-forest-600/50"
        )}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category}
          href={`/gallery/${encodeURIComponent(category)}`}
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-colors",
            active === category
              ? "border-forest-600 bg-forest-600/10 text-forest-700"
              : "border-ink-900/15 text-graphite-700 hover:border-forest-600/50"
          )}
        >
          {category}
        </Link>
      ))}
    </div>
  );
}
