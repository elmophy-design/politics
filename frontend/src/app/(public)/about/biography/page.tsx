"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { PicturePlaceholder } from "@/components/common/Placeholder/PicturePlaceholder";
import { useSiteIdentity } from "@/lib/hooks/useSiteIdentity";

type TimelineItem = { year: string; event: string };

const fallbackIntro =
  "This is placeholder biographical copy. Replace with a full account of education, legal career, public service milestones, and the values that shape this office's approach to representation — written in a voice that matches the tone the campaign wants to lead with.";

const fallbackTimeline: TimelineItem[] = [
  { year: "—", event: "Early life and education — replace with confirmed biographical details." },
  { year: "—", event: "Called to the Nigerian Bar — legal career highlights." },
  { year: "—", event: "Entry into public service and community advocacy." },
  { year: "—", event: "Founding of the Lucky Eseigbe Foundation." },
  { year: "—", event: "Election to current office." },
];

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

export default function BiographyPage() {
  const identity = useSiteIdentity();
  const [intro, setIntro] = useState(fallbackIntro);
  const [portrait, setPortrait] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>(fallbackTimeline);

  useEffect(() => {
    apiFetch<{
      biography_intro?: string;
      biography_portrait_image?: string;
      biography_timeline_json?: string;
    }>("/settings?group=content_biography")
      .then((res) => {
        if (res.biography_intro) setIntro(res.biography_intro);
        if (res.biography_portrait_image) {
          setPortrait(
            res.biography_portrait_image.startsWith("http")
              ? res.biography_portrait_image
              : `${STORAGE_URL}/${res.biography_portrait_image}`
          );
        }
        if (res.biography_timeline_json) {
          try {
            const parsed = JSON.parse(res.biography_timeline_json);
            if (Array.isArray(parsed) && parsed.length > 0) setTimeline(parsed);
          } catch {
            // Keep fallback timeline.
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="grid gap-12 sm:grid-cols-[220px_1fr]">
        <div>
          {portrait ? (
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm">
              <Image src={portrait} alt={identity.name} fill className="object-cover" />
            </div>
          ) : (
            <PicturePlaceholder icon={UserRound} label="Official portrait — upload via Settings" />
          )}
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">Biography</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
            {identity.name}
          </h1>
          <p className="mt-6 leading-relaxed text-graphite-700">{intro}</p>
        </div>
      </div>

      <h2 className="mt-20 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink-900">
        Milestones
      </h2>
      <div className="mt-8 space-y-6 border-l border-ink-900/10 pl-8">
        {timeline.map((item, i) => (
          <div key={i} className="relative">
            <span className="absolute -left-[41px] top-1 h-2 w-2 rounded-full bg-gold-500" />
            <p className="font-mono text-xs text-gold-600">{item.year}</p>
            <p className="mt-1 text-graphite-700">{item.event}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
