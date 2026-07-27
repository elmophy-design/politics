"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";

type Pillar = { title: string; body: string };

const fallbackIntro =
  "This manifesto is a working commitment, not a slogan — each pillar below maps directly to a module on this platform where progress is tracked and reported.";

const fallbackPillars: Pillar[] = [
  { title: "Infrastructure & Roads", body: "A phased, transparent rehabilitation of failed roads and drainage across every ward, with contractor accountability tracked publicly through the Constituency Project Tracker." },
  { title: "Education & Youth Development", body: "Expanded scholarship coverage through the Lucky Eseigbe Foundation, skills-acquisition centres, and a direct pipeline from vocational training to local employment." },
  { title: "Healthcare Access", body: "Regular medical outreach programs and support for primary healthcare centres in underserved communities, with beneficiary outcomes reported openly." },
  { title: "Transparent Governance", body: "Every constituency project, every donation, and every election result on this platform is logged and auditable — governance as an open ledger, not a closed office." },
  { title: "Economic Empowerment", body: "Grants and micro-enterprise support for artisans, traders, and cooperatives, coordinated through ward-level empowerment programs." },
];

export default function ManifestoPage() {
  const [intro, setIntro] = useState(fallbackIntro);
  const [pillars, setPillars] = useState<Pillar[]>(fallbackPillars);

  useEffect(() => {
    apiFetch<{ manifesto_intro?: string; manifesto_pillars_json?: string }>("/settings?group=content_manifesto")
      .then((res) => {
        if (res.manifesto_intro) setIntro(res.manifesto_intro);
        if (res.manifesto_pillars_json) {
          try {
            const parsed = JSON.parse(res.manifesto_pillars_json);
            if (Array.isArray(parsed) && parsed.length > 0) setPillars(parsed);
          } catch {
            // Keep fallback pillars if the stored JSON is malformed.
          }
        }
      })
      .catch(() => {
        // Keep fallback content — nothing to do.
      });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">
        The Manifesto
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900 sm:text-5xl">
        A commitment in five parts.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-graphite-500">{intro}</p>

      <div className="mt-16 space-y-14">
        {pillars.map((pillar, i) => (
          <div key={`${pillar.title}-${i}`} className="border-l-2 border-gold-500 pl-8">
            <p className="font-mono text-xs text-gold-600">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink-900">
              {pillar.title}
            </h2>
            <p className="mt-3 leading-relaxed text-graphite-700">{pillar.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
