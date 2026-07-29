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
 * A bold, headline-style strip above the hero eyebrow that rotates through
 * upcoming campaign events pulled live from /events. Each event's title
 * enters as a big, bold left-to-right slide. Renders nothing if there are
 * no upcoming events, rather than showing a placeholder.
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
    }, 4500);
    return () => clearInterval(id);
  }, [events]);

  if (!events || events.length === 0) return null;

  const isDark = variant === "dark";
  const event = events[index];
  const date = new Date(event.starts_at);

  return (
    <Link href={`/events/${event.id}`} className="group mb-8 block max-w-2xl">
      <div className="flex items-center gap-2">
        <span
          className={`font-mono text-xs uppercase tracking-[0.24em] ${
            isDark ? "text-gold-300" : "text-forest-600"
          }`}
        >
          Upcoming Event
        </span>
        {events.length > 1 && (
          <span className="flex gap-1.5" aria-hidden="true">
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
      </div>

      <div className="mt-2 overflow-hidden">
        <div
          key={index}
          className={`credential-slide-in flex items-center gap-3 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight sm:text-3xl ${
            isDark ? "text-parchment-50" : "text-ink-900"
          }`}
        >
          <span className="truncate">{event.title}</span>
          <ArrowUpRight
            className={`h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 ${
              isDark ? "text-gold-300" : "text-forest-600"
            }`}
          />
        </div>
      </div>

      <div
        key={`meta-${index}`}
        className={`credential-icon-in mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs ${
          isDark ? "text-parchment-100/70" : "text-graphite-500"
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {dateFormatter.format(date)} · {timeFormatter.format(date)}
        </span>
        {event.venue && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {event.venue}
            {event.ward ? ` · ${event.ward.name}` : ""}
          </span>
        )}
      </div>
    </Link>
  );
}
