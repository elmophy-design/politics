"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

type CampaignEvent = {
  id: number;
  title: string;
  venue: string | null;
  starts_at: string;
  ward: { id: number; name: string } | null;
};
type Paginated<T> = { data: T[] };

const dateFormatter = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" });

export default function EventsPage() {
  const [events, setEvents] = useState<CampaignEvent[] | null>(null);

  useEffect(() => {
    apiFetch<Paginated<CampaignEvent>>("/events")
      .then((res) => setEvents(res.data ?? []))
      .catch(() => setEvents([]));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">Campaign Calendar</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
        Upcoming Events
      </h1>

      {events === null && <p className="mt-16 font-mono text-sm text-graphite-500">Loading events…</p>}

      {events?.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 rounded-sm border border-dashed border-ink-900/15 py-24 text-center">
          <CalendarDays className="h-8 w-8 text-graphite-500" strokeWidth={1.5} />
          <p className="text-sm text-graphite-500">No upcoming events scheduled — check back soon.</p>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="mt-14 space-y-4">
          {events.map((ev) => (
            <Link
              key={ev.id}
              href={`/events/${ev.id}`}
              className="flex items-center justify-between gap-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6 transition-colors hover:border-forest-600/40"
            >
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink-900">
                  {ev.title}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-graphite-500">
                  <CalendarDays className="h-4 w-4" /> {dateFormatter.format(new Date(ev.starts_at))}
                </p>
                {ev.venue && (
                  <p className="mt-1 flex items-center gap-2 text-sm text-graphite-500">
                    <MapPin className="h-4 w-4" /> {ev.venue}{ev.ward ? ` · ${ev.ward.name}` : ""}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
