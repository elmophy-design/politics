"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { CredentialSlider } from "./CredentialSlider";

type HeroSlide = {
  id: number;
  eyebrow: string | null;
  headline: string;
  headline_highlight: string | null;
  quote: string | null;
  image_path: string | null;
};

const FALLBACK: HeroSlide = {
  id: 0,
  eyebrow: "Constituency Representative · Barrister · Public Servant",
  headline: "A voice for every ward,",
  headline_highlight: "a record you can verify.",
  quote:
    "Governance is not a promise made once every four years — it is a ledger, open to the people who gave you their vote.",
   headline_hero_background_image: "",
};

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";
const SLIDE_INTERVAL_MS = 4000;
const FADE_MS = 700;

function resolveImage(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STORAGE_URL}/${path}`;
}

export function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch<HeroSlide[]>("/hero-slides")
      .then((data) => {
        setSlides(data.length > 0 ? data : [FALLBACK]);
        setLoaded(true);
      })
      .catch(() => {
        setSlides([FALLBACK]);
        setLoaded(true);
      });
  }, []);

  const goNext = useCallback(() => {
    if (slides.length <= 1) return;
    setVisible(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % slides.length);
      setVisible(true);
    }, FADE_MS);
  }, [slides.length]);

  useEffect(() => {
    if (!loaded || slides.length <= 1) return;
    const timer = setInterval(goNext, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [loaded, slides.length, goNext]);

  const slide = slides[index] ?? FALLBACK;
  const bgSrc = resolveImage(slide.image_path);
  const hasBackground = Boolean(bgSrc);

  return (
    <section className="relative overflow-hidden bg-ink-900">
      {bgSrc && (
        <>
          <Image
            key={slide.id}
            src={bgSrc}
            alt=""
            fill
            priority={index === 0}
            className={`object-cover transition-opacity duration-700 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/70 to-ink-950/40" />
        </>
      )}
      {!hasBackground && (
        <>
          <div className="absolute inset-0 bg-parchment-50" />
          <div className="ward-grid-texture pointer-events-none absolute inset-0" />
        </>
      )}

      <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <CredentialSlider variant={hasBackground ? "dark" : "light"} />

        <div
          className={`transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          {slide.eyebrow && (
            <p
              className={`font-mono text-xs uppercase tracking-[0.24em] ${
                hasBackground ? "text-gold-300" : "text-forest-600"
              }`}
            >
              {slide.eyebrow}
            </p>
          )}

          <h1
            className={`mt-6 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl ${
              hasBackground ? "text-parchment-50" : "text-ink-900"
            }`}
          >
            {slide.headline}
            {slide.headline_highlight && (
              <span className={hasBackground ? "italic text-gold-300" : "italic text-forest-600"}>
                {" "}
                {slide.headline_highlight}
              </span>
            )}
          </h1>

          {slide.quote && (
            <div className="mt-10 flex max-w-2xl gap-4 border-l-2 border-gold-500 pl-6">
              <p
                className={`font-[family-name:var(--font-display)] text-xl italic leading-relaxed ${
                  hasBackground ? "text-parchment-100" : "text-graphite-700"
                }`}
              >
                &ldquo;{slide.quote}&rdquo;
              </p>
            </div>
          )}
        </div>

        {slides.length > 1 && (
          <div className="mt-8 flex gap-2" aria-hidden="true">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (i === index) return;
                  setVisible(false);
                  setTimeout(() => {
                    setIndex(i);
                    setVisible(true);
                  }, FADE_MS);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index
                    ? "w-8 bg-gold-500"
                    : hasBackground
                      ? "w-1.5 bg-parchment-50/30 hover:bg-parchment-50/50"
                      : "w-1.5 bg-ink-900/20 hover:bg-ink-900/40"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

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