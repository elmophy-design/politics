import type { Metadata } from "next";
import { ContactForm } from "@/components/public/Contact/ContactForm";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">Get in Touch</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
        Reach the constituency office
      </h1>
      <p className="mt-4 max-w-xl text-graphite-500">
        Report an issue, raise a complaint, or send a suggestion — every submission
        is logged and routed to the right ward coordinator.
      </p>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-8">
          <div className="flex gap-4">
            <MapPin className="h-5 w-5 shrink-0 text-forest-600" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-ink-900">Constituency Office</p>
              <p className="text-sm text-graphite-500">Address to be confirmed</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Phone className="h-5 w-5 shrink-0 text-forest-600" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-ink-900">Phone</p>
              <p className="text-sm text-graphite-500">To be confirmed</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Mail className="h-5 w-5 shrink-0 text-forest-600" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-ink-900">Email</p>
              <p className="text-sm text-graphite-500">contact@luckyeseigbe.org</p>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-ink-900/10 bg-parchment-100/50 p-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
