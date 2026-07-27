import Link from "next/link";
import { GraduationCap, Stethoscope, Briefcase, FolderKanban, ArrowRight } from "lucide-react";

const pillars = [
  { icon: GraduationCap, label: "Scholarships", text: "Funding education for students across the constituency." },
  { icon: Stethoscope, label: "Medical Outreach", text: "Free health screenings and treatment in underserved communities." },
  { icon: Briefcase, label: "Empowerment", text: "Grants and skills training for artisans, traders, and cooperatives." },
  { icon: FolderKanban, label: "Community Projects", text: "Small-scale infrastructure and welfare projects, ward by ward." },
];

export default function FoundationOverviewPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">
        Lucky Eseigbe Foundation
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900 sm:text-5xl">
        Impact beyond the campaign cycle.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-graphite-500">
        The Foundation exists to serve the constituency between election cycles —
        scholarships, medical outreach, and empowerment programs delivered directly
        to the communities that need them.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/foundation/projects"
          className="inline-flex items-center gap-2 rounded-sm bg-forest-600 px-6 py-3 text-sm font-medium text-parchment-50 hover:bg-forest-700"
        >
          View All Projects <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/foundation/success-stories"
          className="inline-flex items-center gap-2 rounded-sm border border-ink-900/20 px-6 py-3 text-sm font-medium text-ink-900 hover:border-ink-900/40"
        >
          Read Success Stories
        </Link>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {pillars.map(({ icon: Icon, label, text }) => (
          <div key={label} className="rounded-sm border border-ink-900/10 bg-parchment-50 p-6">
            <Icon className="h-6 w-6 text-forest-600" strokeWidth={1.5} />
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-ink-900">
              {label}
            </h2>
            <p className="mt-2 text-sm text-graphite-500">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
