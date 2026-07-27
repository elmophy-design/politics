import type { Metadata } from "next";
import { VolunteerForm } from "@/components/public/Volunteer/VolunteerForm";
import { Users, MapPinned, CalendarCheck } from "lucide-react";

export const metadata: Metadata = { title: "Volunteer" };

const reasons = [
  { icon: Users, text: "Join thousands of volunteers already mobilizing ward by ward." },
  { icon: MapPinned, text: "Get matched to activities in your own ward and polling unit." },
  { icon: CalendarCheck, text: "Be the first to hear about upcoming campaign events near you." },
];

export default function VolunteerPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">Get Involved</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
        Become a volunteer
      </h1>
      <p className="mt-4 max-w-xl text-graphite-500">
        Every ward needs hands on the ground — sign up below and a coordinator
        will reach out with next steps.
      </p>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          {reasons.map(({ icon: Icon, text }) => (
            <div key={text} className="flex gap-4">
              <Icon className="h-5 w-5 shrink-0 text-forest-600" strokeWidth={1.5} />
              <p className="text-sm leading-relaxed text-graphite-700">{text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-sm border border-ink-900/10 bg-parchment-100/50 p-8">
          <VolunteerForm />
        </div>
      </div>
    </div>
  );
}
