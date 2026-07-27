import { cn } from "@/lib/utils/cn";

const toneMap: Record<string, string> = {
  // positive
  active: "bg-forest-600/10 text-forest-700",
  approved: "bg-forest-600/10 text-forest-700",
  verified: "bg-forest-600/10 text-forest-700",
  successful: "bg-forest-600/10 text-forest-700",
  completed: "bg-forest-600/10 text-forest-700",
  resolved: "bg-forest-600/10 text-forest-700",
  ongoing: "bg-forest-600/10 text-forest-700",
  published: "bg-forest-600/10 text-forest-700",
  // neutral / pending
  pending: "bg-gold-500/10 text-gold-600",
  draft: "bg-gold-500/10 text-gold-600",
  planned: "bg-gold-500/10 text-gold-600",
  submitted: "bg-gold-500/10 text-gold-600",
  assigned: "bg-gold-500/10 text-gold-600",
  in_progress: "bg-gold-500/10 text-gold-600",
  // negative
  rejected: "bg-clay-500/10 text-clay-600",
  flagged: "bg-clay-500/10 text-clay-600",
  failed: "bg-clay-500/10 text-clay-600",
  stalled: "bg-clay-500/10 text-clay-600",
  critical: "bg-clay-500/10 text-clay-600",
  // muted
  archived: "bg-ink-900/10 text-graphite-500",
  closed: "bg-ink-900/10 text-graphite-500",
  paused: "bg-ink-900/10 text-graphite-500",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wide",
        toneMap[status] ?? "bg-ink-900/10 text-graphite-500"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
