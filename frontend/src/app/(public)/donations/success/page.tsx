"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";

type Donation = { reference: string; status: string; amount: number };

function SuccessContent() {
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref");
  const [state, setState] = useState<"checking" | "success" | "failed" | "missing">(
    reference ? "checking" : "missing"
  );
  const [donation, setDonation] = useState<Donation | null>(null);

  useEffect(() => {
    if (!reference) return;

    apiFetch<Donation>(`/donations/verify/${reference}`)
      .then((res) => {
        setDonation(res);
        setState(res.status === "successful" ? "success" : "failed");
      })
      .catch(() => setState("failed"));
  }, [reference]);

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      {state === "checking" && (
        <>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-forest-600" />
          <p className="mt-4 font-mono text-sm text-graphite-500">Confirming your donation…</p>
        </>
      )}

      {state === "success" && (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-forest-600" strokeWidth={1.5} />
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink-900">
            Thank you for your support
          </h1>
          <p className="mt-3 text-graphite-500">
            Your donation of ₦{donation?.amount?.toLocaleString()} has been confirmed.
          </p>
          <p className="mt-1 font-mono text-xs text-graphite-500">Reference: {donation?.reference}</p>
        </>
      )}

      {(state === "failed" || state === "missing") && (
        <>
          <XCircle className="mx-auto h-12 w-12 text-clay-500" strokeWidth={1.5} />
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink-900">
            We couldn&rsquo;t confirm that donation
          </h1>
          <p className="mt-3 text-graphite-500">
            If an amount was deducted, it will be reconciled shortly — or try again below.
          </p>
        </>
      )}

      <Link
        href="/donations"
        className="mt-8 inline-block rounded-sm bg-ink-900 px-6 py-3 text-sm font-medium text-parchment-50 hover:bg-ink-800"
      >
        Back to Donations
      </Link>
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
