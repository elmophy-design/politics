import { ImageIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Consistent "no image yet" state — used anywhere a photo is expected but
 * hasn't been uploaded via the Media Centre yet (biography portrait, project
 * covers, etc.), instead of a blank colored box.
 */
export function PicturePlaceholder({
  icon: Icon = ImageIcon,
  label = "No image yet",
  aspect = "aspect-[3/4]",
  className,
}: {
  icon?: LucideIcon;
  label?: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-ink-900/15 bg-parchment-100 text-graphite-500",
        aspect,
        className
      )}
    >
      <Icon className="h-8 w-8" strokeWidth={1.25} />
      <p className="px-4 text-center font-mono text-[11px] uppercase tracking-wide">{label}</p>
    </div>
  );
}
