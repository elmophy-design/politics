import Link from "next/link";
import { XCircle } from "lucide-react";

export default function DonationCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <XCircle className="mx-auto h-12 w-12 text-graphite-500" strokeWidth={1.5} />
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink-900">
        Donation cancelled
      </h1>
      <p className="mt-3 text-graphite-500">No charge was made. You can try again anytime.</p>
      <Link
        href="/donations"
        className="mt-8 inline-block rounded-sm bg-ink-900 px-6 py-3 text-sm font-medium text-parchment-50 hover:bg-ink-800"
      >
        Back to Donations
      </Link>
    </div>
  );
}
