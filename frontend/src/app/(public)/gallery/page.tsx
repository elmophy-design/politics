import type { Metadata } from "next";
import { GalleryGrid } from "@/components/public/Gallery/GalleryGrid";
import { CategoryChips } from "@/components/public/Gallery/CategoryChips";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">Gallery</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
        Moments from the field.
      </h1>
      <p className="mt-4 max-w-xl text-graphite-500">
        Photos from campaign events, constituency visits, and Foundation programs.
      </p>

      <CategoryChips />

      <div className="mt-10">
        <GalleryGrid />
      </div>
    </div>
  );
}
