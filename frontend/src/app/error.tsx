"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-parchment-50 px-6 text-center">
      <AlertOctagon className="h-10 w-10 text-clay-500" strokeWidth={1.5} />
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink-900">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-graphite-500">
        An unexpected error occurred while loading this page.
      </p>
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => reset()}
          className="rounded-sm bg-ink-900 px-6 py-3 text-sm font-medium text-parchment-50 hover:bg-ink-800"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-sm border border-ink-900/20 px-6 py-3 text-sm font-medium text-ink-900 hover:border-ink-900/40"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
