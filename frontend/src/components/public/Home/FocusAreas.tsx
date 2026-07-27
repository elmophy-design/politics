import Link from "next/link";
import { Landmark, HeartHandshake, ShieldCheck, MessageSquareWarning } from "lucide-react";

const areas = [
  {
    icon: Landmark,
    title: "Constituency Projects",
    description:
      "Every road, borehole, and classroom funded through this office, tracked by ward with real progress photos.",
    href: "/constituency-projects",
  },
  {
    icon: HeartHandshake,
    title: "Lucky Eseigbe Foundation",
    description:
      "Scholarships, medical outreach, and empowerment programs reaching communities beyond the campaign cycle.",
    href: "/foundation",
  },
  {
    icon: ShieldCheck,
    title: "Election Situation Room",
    description:
      "Ward-by-ward result collation and accredited polling agents, built for transparency on election day.",
    href: "/about/political-profile",
  },
  {
    icon: MessageSquareWarning,
    title: "Citizen Engagement",
    description:
      "Report an issue, request assistance, or send a suggestion directly — and track how it's resolved.",
    href: "/contact",
  },
];

export function FocusAreas() {
  return (
    <section className="border-t border-ink-900/10 bg-parchment-100/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">
          Four Pillars
        </p>
        <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold text-ink-900 sm:text-4xl">
          One office, four commitments to the constituency.
        </h2>

        <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-ink-900/10 bg-ink-900/10 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col gap-4 bg-parchment-50 p-8 transition-colors hover:bg-parchment-100"
            >
              <Icon className="h-6 w-6 text-forest-600" strokeWidth={1.5} />
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink-900">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-graphite-500">
                {description}
              </p>
              <span className="mt-auto text-xs font-medium uppercase tracking-wide text-gold-600 opacity-0 transition-opacity group-hover:opacity-100">
                View &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
