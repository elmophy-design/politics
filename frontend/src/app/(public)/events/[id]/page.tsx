import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";

type CampaignEvent = {
  id: number;
  title: string;
  description: string | null;
  venue: string | null;
  starts_at: string;
  ends_at: string | null;
  ward: { id: number; name: string } | null;
  campaign: { id: number; title: string } | null;
};

const dateFormatter = new Intl.DateTimeFormat("en-NG", { dateStyle: "full", timeStyle: "short" });

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event: CampaignEvent | null = null;
  let notFoundMessage: string | null = null;

  try {
    event = await apiFetch<CampaignEvent>(`/events/${id}`);
  } catch (err) {
    notFoundMessage = err instanceof ApiError ? err.message : "Event not found.";
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Link href="/events" className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-700">
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      {event ? (
        <>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.24em] text-forest-600">
            {event.campaign?.title ?? "Campaign Event"}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
            {event.title}
          </h1>

          <div className="mt-6 space-y-2">
            <p className="flex items-center gap-2 text-sm text-graphite-700">
              <CalendarDays className="h-4 w-4 text-forest-600" /> {dateFormatter.format(new Date(event.starts_at))}
            </p>
            {event.venue && (
              <p className="flex items-center gap-2 text-sm text-graphite-700">
                <MapPin className="h-4 w-4 text-forest-600" /> {event.venue}{event.ward ? ` · ${event.ward.name}` : ""}
              </p>
            )}
          </div>

          {event.description && (
            <p className="mt-8 whitespace-pre-line leading-relaxed text-graphite-700">{event.description}</p>
          )}
        </>
      ) : (
        <p className="mt-12 text-graphite-500">{notFoundMessage}</p>
      )}
    </div>
  );
}
