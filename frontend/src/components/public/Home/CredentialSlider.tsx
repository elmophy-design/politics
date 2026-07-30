"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

// Constant travel speed for the marquee, in pixels/second. Duration is
// derived from this per event so a short title and a long title both cross
// the lane at the same visual speed rather than the same fixed duration.
const MARQUEE_SPEED_PX_PER_SEC = 90;
const FALLBACK_DURATION_SEC = 10;

/**
 * A bold, headline-style strip above the hero eyebrow that scrolls through
 * upcoming campaign events pulled live from /events. Each title enters as a
 * horizontal marquee from beyond the right edge of its lane, travels left at
 * a constant speed, exits past the left edge, then hands off to the next
 * upcoming event for another pass. Renders nothing if there are no upcoming
 * events, rather than showing a placeholder.
 */
export function CredentialSlider({ variant = "light" }: { variant?: Variant }) {
  const [events, setEvents] = useState<CampaignEvent[] | null>(null);
  // Increments on every pass (even with a single event) so the marquee row's
  // `key` always changes and the animation restarts cleanly from the right.
  const [cycle, setCycle] = useState(0);
  const [duration, setDuration] = useState(FALLBACK_DURATION_SEC);
  const [travel, setTravel] = useState({ start: "100%", end: "-100%" });

  const laneRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<Paginated<CampaignEvent>>("/events?upcoming=1&per_page=5")
      .then((res) => setEvents(res.data ?? []))
      .catch(() => setEvents([]));
  }, []);

  const index = events && events.length > 0 ? cycle % events.length : 0;

  // Measure the lane's width and this title's rendered width so the travel
  // distance (and therefore the duration, at a fixed speed) is exact: the
  // title starts fully clear of the right edge and ends fully clear of the
  // left edge, regardless of how long the text is.
  useLayoutEffect(() => {
    if (!events || events.length === 0) return;
    const lane = laneRef.current;
    const text = textRef.current;
    if (!lane || !text) return;

    const measure = () => {
      const laneWidth = lane.getBoundingClientRect().width;
      const textWidth = text.getBoundingClientRect().width || text.scrollWidth;
      setTravel({ start: `${laneWidth}px`, end: `-${textWidth}px` });
      setDuration((laneWidth + textWidth) / MARQUEE_SPEED_PX_PER_SEC || FALLBACK_DURATION_SEC);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(lane);
    return () => observer.disconnect();
  }, [events, cycle]);

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

      <div ref={laneRef} className="relative mt-2 h-10 overflow-hidden sm:h-12">
        <div
          key={cycle}
          ref={textRef}
          onAnimationEnd={() => setCycle((c) => c + 1)}
          className={`credential-marquee absolute inset-y-0 left-0 flex items-center gap-3 whitespace-nowrap font-[family-name:var(--font-display)] text-2xl font-bold leading-tight sm:text-3xl ${
            isDark ? "text-parchment-50" : "text-ink-900"
          }`}
          style={
            {
              "--marquee-start": travel.start,
              "--marquee-end": travel.end,
              animationDuration: `${duration}s`,
            } as React.CSSProperties
          }
        >
          <span>{event.title}</span>
          <ArrowUpRight
            className={`h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 ${
              isDark ? "text-gold-300" : "text-forest-600"
            }`}
          />
        </div>
        {/* Static, non-moving copy for screen readers — the visible copy is
            constantly in motion and shouldn't be the thing assistive tech reads. */}
        <span className="sr-only">{event.title}</span>
      </div>

      <div
        key={`meta-${cycle}`}
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
