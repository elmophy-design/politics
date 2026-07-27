import Link from "next/link";

export function CtaSection() {
  return (
    <section className="border-t border-ink-900/10 bg-parchment-50 py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink-900 sm:text-4xl">
          Join the movement, ward by ward.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-graphite-500">
          Register as a volunteer, follow the campaign calendar, or support the
          work directly — every contribution is logged and accounted for.
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
            className="rounded-sm border border-ink-900/20 px-6 py-3 text-sm font-medium text-ink-900 transition-colors hover:border-ink-900/40"
          >
            Support the Campaign
          </Link>
        </div>
      </div>
    </section>
  );
}
