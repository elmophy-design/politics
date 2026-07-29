"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowUpRight } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

type CampaignEvent = {
  id: number;
  title: string;
  venue: string | null;
  starts_at: string;
  ward: { id: number; name: string } | null;
};
type Paginated<T> = { data: T[] };
type Variant = "light" | "dark";

const dateFormatter = new Intl.DateTimeFormat("en-NG", { day: "2-digit", month: "short" });
const timeFormatter = new Intl.DateTimeFormat("en-NG", { timeStyle: "short" });

/**
 * A quiet, ceremonial strip above the hero eyebrow that rotates through
 * upcoming campaign events pulled live from /events. Falls back silently
 * (renders nothing) if there are no upcoming events, rather than showing
 * a placeholder.
 */
export function CredentialSlider({ variant = "light" }: { variant?: Variant }) {
  const [events, setEvents] = useState<CampaignEvent[] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    apiFetch<Paginated<CampaignEvent>>("/events?upcoming=1&per_page=5")
      .then((res) => setEvents(res.data ?? []))
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    if (!events || events.length < 2) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % events.length);
    }, 4200);
    return () => clearInterval(id);
  }, [events]);

  if (!events || events.length === 0) return null;

  const isDark = variant === "dark";
  const event = events[index];
  const date = new Date(event.starts_at);

  return (
    <Link
      href={`/events/${event.id}`}
      className={`group mb-8 inline-flex max-w-full items-center gap-3 border-b pb-3 transition-colors ${
        isDark
          ? "border-parchment-50/15 hover:border-gold-300/60"
          : "border-ink-900/10 hover:border-gold-500/60"
      }`}
    >
      <span
        className={`flex h-8 shrink-0 flex-col items-center justify-center rounded-sm border px-2 leading-none ${
          isDark
            ? "border-gold-300/50 bg-parchment-50/5 text-gold-300"
            : "border-gold-500/50 bg-forest-600/5 text-forest-600"
        }`}
      >
        <span key={`d-${index}`} className="credential-icon-in font-mono text-[10px] font-semibold uppercase tracking-wide">
          {dateFormatter.format(date)}
        </span>
      </span>

      <span className="relative inline-flex min-w-0 items-baseline gap-2 overflow-hidden">
        <span
          key={index}
          className={`credential-slide-in flex min-w-0 items-baseline gap-2 font-mono text-xs uppercase tracking-[0.16em] ${
            isDark ? "text-parchment-100" : "text-graphite-700"
          }`}
        >
          <span className={`shrink-0 ${isDark ? "text-gold-300" : "text-forest-600"}`}>Upcoming ·</span>
          <span className="truncate normal-case tracking-normal">{event.title}</span>
          <span className={`hidden shrink-0 items-center gap-1 sm:inline-flex ${isDark ? "text-parchment-100/60" : "text-graphite-500"}`}>
            <CalendarDays className="h-3 w-3" /> {timeFormatter.format(date)}
          </span>
          {event.venue && (
            <span className={`hidden shrink-0 items-center gap-1 md:inline-flex ${isDark ? "text-parchment-100/60" : "text-graphite-500"}`}>
              <MapPin className="h-3 w-3" /> {event.venue}
            </span>
          )}
        </span>
      </span>

      <ArrowUpRight
        className={`h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
          isDark ? "text-gold-300" : "text-forest-600"
        }`}
      />

      {events.length > 1 && (
        <span className="ml-1 hidden gap-1.5 sm:flex" aria-hidden="true">
          {events.map((_, i) => (
            <span
              key={i}
              className={`h-1 w-1 rounded-full transition-colors duration-500 ${
                i === index ? "bg-gold-500" : isDark ? "bg-parchment-50/20" : "bg-ink-900/15"
              }`}
            />
          ))}
        </span>
      )}
    </Link>
  );
}
