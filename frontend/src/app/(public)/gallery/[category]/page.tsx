import { GalleryGrid } from "@/components/public/Gallery/GalleryGrid";
import { CategoryChips } from "@/components/public/Gallery/CategoryChips";

export default async function GalleryCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decoded = decodeURIComponent(category);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">Gallery</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold capitalize text-ink-900">
        {decoded.replace(/-/g, " ")}
      </h1>

      <CategoryChips active={decoded} />

      <div className="mt-10">
        <GalleryGrid category={decoded} />
      </div>
    </div>
  );
}
