import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  sublabel,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "alert";
  sublabel?: string;
}) {
  return (
    <div className="rounded-sm border border-ink-900/10 bg-parchment-50 p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-graphite-500">
          {label}
        </p>
        <Icon
          className={cn("h-4 w-4", tone === "alert" ? "text-clay-500" : "text-forest-600")}
          strokeWidth={1.5}
        />
      </div>
      <p
        className={cn(
          "mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold",
          tone === "alert" ? "text-clay-600" : "text-ink-900"
        )}
      >
        {value}
      </p>
      {sublabel && <p className="mt-1 text-xs text-graphite-500">{sublabel}</p>}
    </div>
  );
}
