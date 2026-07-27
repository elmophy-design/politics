import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="ward-grid-texture relative flex min-h-screen flex-col items-center justify-center bg-parchment-50 px-6 text-center">
      <p className="relative font-mono text-xs uppercase tracking-[0.24em] text-forest-600">
        Page Not Found
      </p>
      <h1 className="relative mt-4 font-[family-name:var(--font-display)] text-7xl font-semibold text-ink-900">
        404
      </h1>
      <p className="relative mt-4 max-w-md text-graphite-500">
        This page doesn&rsquo;t exist, or has moved — the road you&rsquo;re
        looking for might not be on this map yet.
      </p>
      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-sm bg-ink-900 px-6 py-3 text-sm font-medium text-parchment-50 transition-colors hover:bg-ink-800"
        >
          <Compass className="h-4 w-4" /> Back to Homepage
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-sm border border-ink-900/20 px-6 py-3 text-sm font-medium text-ink-900 transition-colors hover:border-ink-900/40"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
