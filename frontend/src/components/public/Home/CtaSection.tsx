"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api/client";

type CtaSettings = {
  home_cta_headline?: string;
  home_cta_body?: string;
  home_cta_background_image?: string;
};

const defaults = {
  home_cta_headline: "Join the movement, ward by ward.",
  home_cta_body:
    "Register as a volunteer, follow the campaign calendar, or support the work directly — every contribution is logged and accounted for.",
  home_cta_background_image: "",
};

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  return `${STORAGE_URL}/${path.replace(/^\//, "")}`;
}

/**
 * Closing homepage call-to-action. Text and optional full-bleed background
 * image are admin-editable via Settings → Homepage (group=homepage). When a
 * background is set, content switches to light-on-dark with a soft gradient
 * overlay so type stays readable over any photo — same pattern as Hero.
 */
export function CtaSection() {
  const [settings, setSettings] = useState(defaults);

  useEffect(() => {
    apiFetch<CtaSettings>("/settings?group=homepage")
      .then((res) =>
        setSettings({
          home_cta_headline: res?.home_cta_headline || defaults.home_cta_headline,
          home_cta_body: res?.home_cta_body || defaults.home_cta_body,
          home_cta_background_image: res?.home_cta_background_image || "",
        })
      )
      .catch(() => setSettings(defaults));
  }, []);

  const bgSrc = resolveImageUrl(settings.home_cta_background_image);
  const hasBackground = Boolean(bgSrc);

  return (
    <section
      className={`relative overflow-hidden border-t border-ink-900/10 py-24 ${
        hasBackground ? "bg-ink-950" : "bg-parchment-50"
      }`}
    >
      {hasBackground && bgSrc ? (
        <>
          <Image
            src={bgSrc}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority={false}
          />
          {/* Dark gradient keeps headline + body readable over any photo */}
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/75 via-ink-950/65 to-ink-950/80" />
        </>
      ) : null}

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2
          className={`font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl ${
            hasBackground ? "text-parchment-50" : "text-ink-900"
          }`}
        >
          {settings.home_cta_headline}
        </h2>
        <p
          className={`mx-auto mt-4 max-w-xl ${
            hasBackground ? "text-parchment-100/80" : "text-graphite-500"
          }`}
        >
          {settings.home_cta_body}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/volunteer"
            className="rounded-sm bg-forest-600 px-6 py-3 text-sm font-medium text-parchment-50 transition-colors hover:bg-forest-700"
          >
            Become a Volunteer
          </Link>
          <Link
            href="/donations"
            className={
              hasBackground
                ? "rounded-sm border border-parchment-50/40 px-6 py-3 text-sm font-medium text-parchment-50 transition-colors hover:border-parchment-50/70"
                : "rounded-sm border border-ink-900/20 px-6 py-3 text-sm font-medium text-ink-900 transition-colors hover:border-ink-900/40"
            }
          >
            Support the Campaign
          </Link>
        </div>
      </div>
    </section>
  );
}
