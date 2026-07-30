"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api/client";

type PillarSettings = {
  pillars_section_eyebrow?: string;
  pillars_section_headline?: string;
  pillar_constituency_title?: string;
  pillar_constituency_description?: string;
  pillar_constituency_image?: string;
  pillar_constituency_href?: string;
  pillar_foundation_title?: string;
  pillar_foundation_description?: string;
  pillar_foundation_image?: string;
  pillar_foundation_href?: string;
  pillar_election_title?: string;
  pillar_election_description?: string;
  pillar_election_image?: string;
  pillar_election_href?: string;
  pillar_engagement_title?: string;
  pillar_engagement_description?: string;
  pillar_engagement_image?: string;
  pillar_engagement_href?: string;
};

const defaults = {
  pillars_section_eyebrow: "Four Pillars",
  pillars_section_headline: "One office, four commitments to the constituency.",
  pillars: [
    {
      id: "constituency" as const,
      titleKey: "pillar_constituency_title" as const,
      descriptionKey: "pillar_constituency_description" as const,
      imageKey: "pillar_constituency_image" as const,
      hrefKey: "pillar_constituency_href" as const,
      title: "Constituency Projects",
      description:
        "Every road, borehole, and classroom funded through this office, tracked by ward with real progress photos.",
      href: "/constituency-projects",
    },
    {
      id: "foundation" as const,
      titleKey: "pillar_foundation_title" as const,
      descriptionKey: "pillar_foundation_description" as const,
      imageKey: "pillar_foundation_image" as const,
      hrefKey: "pillar_foundation_href" as const,
      title: "Lucky Eseigbe Foundation",
      description:
        "Scholarships, medical outreach, and empowerment programs reaching communities beyond the campaign cycle.",
      href: "/foundation",
    },
    {
      id: "election" as const,
      titleKey: "pillar_election_title" as const,
      descriptionKey: "pillar_election_description" as const,
      imageKey: "pillar_election_image" as const,
      hrefKey: "pillar_election_href" as const,
      title: "Election Situation Room",
      description:
        "Ward-by-ward result collation and accredited polling agents, built for transparency on election day.",
      href: "/about/political-profile",
    },
    {
      id: "engagement" as const,
      titleKey: "pillar_engagement_title" as const,
      descriptionKey: "pillar_engagement_description" as const,
      imageKey: "pillar_engagement_image" as const,
      hrefKey: "pillar_engagement_href" as const,
      title: "Citizen Engagement",
      description:
        "Report an issue, request assistance, or send a suggestion directly — and track how it's resolved.",
      href: "/contact",
    },
  ],
};

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  return `${STORAGE_URL}/${path.replace(/^\//, "")}`;
}

function resolveHref(href?: string | null, fallback = "/"): string {
  const value = (href || fallback).trim();
  if (!value) return fallback;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return value;
  return `/${value}`;
}

export function FocusAreas() {
  const [settings, setSettings] = useState<PillarSettings>({});

  useEffect(() => {
    apiFetch<PillarSettings>("/settings?group=homepage")
      .then((res) => setSettings(res ?? {}))
      .catch(() => setSettings({}));
  }, []);

  const eyebrow = settings.pillars_section_eyebrow || defaults.pillars_section_eyebrow;
  const headline = settings.pillars_section_headline || defaults.pillars_section_headline;

  return (
    <section className="border-t border-ink-900/10 bg-parchment-100/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">{eyebrow}</p>
        <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold text-ink-900 sm:text-4xl">
          {headline}
        </h2>

        <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-ink-900/10 bg-ink-900/10 sm:grid-cols-2 lg:grid-cols-4">
          {defaults.pillars.map((pillar) => {
            const title = settings[pillar.titleKey] || pillar.title;
            const description = settings[pillar.descriptionKey] || pillar.description;
            const src = resolveImageUrl(settings[pillar.imageKey]);
            const href = resolveHref(settings[pillar.hrefKey], pillar.href);
            const isExternal = href.startsWith("http://") || href.startsWith("https://");

            const body = (
              <>
                {src ? (
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-900/5">
                    <Image
                      src={src}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col gap-3 p-8">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink-900">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-graphite-500">{description}</p>
                  <span className="mt-auto pt-2 text-xs font-medium uppercase tracking-wide text-gold-600 opacity-0 transition-opacity group-hover:opacity-100">
                    View &rarr;
                  </span>
                </div>
              </>
            );

            const className =
              "group flex flex-col bg-parchment-50 transition-colors hover:bg-parchment-100";

            if (isExternal) {
              return (
                <a
                  key={pillar.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {body}
                </a>
              );
            }

            return (
              <Link key={pillar.id} href={href} className={className}>
                {body}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
