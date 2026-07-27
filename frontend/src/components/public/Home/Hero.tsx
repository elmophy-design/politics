"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

type HeroSettings = {
  home_hero_eyebrow?: string;
  home_hero_headline?: string;
  home_hero_headline_highlight?: string;
  home_hero_quote?: string;
  home_hero_background_image?: string;
};

const defaults: Required<HeroSettings> = {
  home_hero_eyebrow: "Constituency Representative · Barrister · Public Servant",
  home_hero_headline: "A voice for every ward,",
  home_hero_headline_highlight: "a record you can verify.",
  home_hero_quote:
    "Governance is not a promise made once every four years — it is a ledger, open to the people who gave you their vote.",
  home_hero_background_image: "",
};

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

export function Hero() {
  const [settings, setSettings] = useState<Required<HeroSettings>>(defaults);

  useEffect(() => {
    apiFetch<HeroSettings>("/settings?group=homepage")
      .then((res) => setSettings({ ...defaults, ...res }))
      .catch(() => setSettings(defaults));
  }, []);

  const hasBackground = Boolean(settings.home_hero_background_image);
  const bgSrc = hasBackground
    ? settings.home_hero_background_image.startsWith("http")
      ? settings.home_hero_background_image
      : `${STORAGE_URL}/${settings.home_hero_background_image}`
    : null;

  return (
    <section className="relative overflow-hidden bg-ink-900">
      {bgSrc ? (
        <>
          <Image
            src={bgSrc}
            alt=""
            fill
            priority
            className="object-cover"
          />
          {/* Dark gradient so white text stays readable over any photo */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/70 to-ink-950/40" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-parchment-50" />
          <div className="ward-grid-texture pointer-events-none absolute inset-0" />
        </>
      )}

      <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <p
          className={`font-mono text-xs uppercase tracking-[0.24em] ${
            hasBackground ? "text-gold-300" : "text-forest-600"
          }`}
        >
          {settings.home_hero_eyebrow}
        </p>

        <h1
          className={`mt-6 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl ${
            hasBackground ? "text-parchment-50" : "text-ink-900"
          }`}
        >
          {settings.home_hero_headline}
          <span className={hasBackground ? "italic text-gold-300" : "italic text-forest-600"}>
            {" "}
            {settings.home_hero_headline_highlight}
          </span>
        </h1>

        <div
          className={`mt-10 flex max-w-2xl gap-4 border-l-2 pl-6 ${
            hasBackground ? "border-gold-500" : "border-gold-500"
          }`}
        >
          <p
            className={`font-[family-name:var(--font-display)] text-xl italic leading-relaxed ${
              hasBackground ? "text-parchment-100" : "text-graphite-700"
            }`}
          >
            &ldquo;{settings.home_hero_quote}&rdquo;
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/manifesto"
            className={
              hasBackground
                ? "inline-flex items-center gap-2 rounded-sm bg-gold-500 px-6 py-3 text-sm font-medium text-ink-950 transition-colors hover:bg-gold-300"
                : "inline-flex items-center gap-2 rounded-sm bg-ink-900 px-6 py-3 text-sm font-medium text-parchment-50 transition-colors hover:bg-ink-800"
            }
          >
            Read the Manifesto
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/constituency-projects"
            className={
              hasBackground
                ? "inline-flex items-center gap-2 rounded-sm border border-parchment-50/40 px-6 py-3 text-sm font-medium text-parchment-50 transition-colors hover:border-parchment-50/70"
                : "inline-flex items-center gap-2 rounded-sm border border-ink-900/20 px-6 py-3 text-sm font-medium text-ink-900 transition-colors hover:border-ink-900/40"
            }
          >
            Track Constituency Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
