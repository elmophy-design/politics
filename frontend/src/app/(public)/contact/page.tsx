"use client";

import { useEffect, useState } from "react";
import { ContactForm } from "@/components/public/Contact/ContactForm";
import { Mail, MapPin, Phone } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

type PageCopy = {
  contact_page_eyebrow?: string;
  contact_page_title?: string;
  contact_page_intro?: string;
  contact_office_address?: string;
  contact_office_phone?: string;
  contact_office_email?: string;
};

const defaults = {
  eyebrow: "Get in Touch",
  title: "Reach the constituency office",
  intro:
    "Report an issue, raise a complaint, or send a suggestion — every submission is logged and routed to the right ward coordinator.",
  address: "Address to be confirmed",
  phone: "To be confirmed",
  email: "contact@luckyeseigbe.org",
};

export default function ContactPage() {
  const [copy, setCopy] = useState(defaults);

  useEffect(() => {
    apiFetch<PageCopy>("/settings?group=content_contact")
      .then((res) =>
        setCopy({
          eyebrow: res.contact_page_eyebrow || defaults.eyebrow,
          title: res.contact_page_title || defaults.title,
          intro: res.contact_page_intro || defaults.intro,
          address: res.contact_office_address || defaults.address,
          phone: res.contact_office_phone || defaults.phone,
          email: res.contact_office_email || defaults.email,
        })
      )
      .catch(() => setCopy(defaults));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">{copy.eyebrow}</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
        {copy.title}
      </h1>
      <p className="mt-4 max-w-xl text-graphite-500">{copy.intro}</p>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-8">
          <div className="flex gap-4">
            <MapPin className="h-5 w-5 shrink-0 text-forest-600" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-ink-900">Constituency Office</p>
              <p className="text-sm text-graphite-500 whitespace-pre-line">{copy.address}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Phone className="h-5 w-5 shrink-0 text-forest-600" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-ink-900">Phone</p>
              <p className="text-sm text-graphite-500">{copy.phone}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Mail className="h-5 w-5 shrink-0 text-forest-600" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-ink-900">Email</p>
              <p className="text-sm text-graphite-500">{copy.email}</p>
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
