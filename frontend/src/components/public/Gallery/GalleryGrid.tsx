"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import type { MediaItem, Paginated } from "@/lib/types/media";

import { CardGridSkeleton } from "@/components/common/Skeleton/CardSkeleton";

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

export function GalleryGrid({ category }: { category?: string }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);

  useEffect(() => {
    setItems(null);
    const query = new URLSearchParams({ type: "gallery_image" });
    if (category) query.set("category", category);

    apiFetch<Paginated<MediaItem>>(`/media?${query.toString()}`)
      .then((res) => setItems(res.data ?? []))
      .catch(() => setItems([]));
  }, [category]);

  if (items === null) {
    return <CardGridSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-ink-900/15 py-24 text-center">
        <ImageOff className="h-8 w-8 text-graphite-500" strokeWidth={1.5} />
        <p className="text-sm text-graphite-500">
          {category
            ? "No photos in this category yet."
            : "No photos published yet — check back soon, or upload from the Media Centre."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="group relative aspect-square overflow-hidden rounded-sm bg-ink-900/5">
          <Image
            src={item.file_path ? `${STORAGE_URL}/${item.file_path}` : item.external_url ?? ""}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="text-xs text-parchment-100">{item.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
