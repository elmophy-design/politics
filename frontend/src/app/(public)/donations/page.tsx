import type { Metadata } from "next";
import { DonationForm } from "@/components/public/Donations/DonationForm";
import { ShieldCheck, Receipt, Landmark } from "lucide-react";

export const metadata: Metadata = { title: "Donations" };

const assurances = [
  { icon: ShieldCheck, text: "Every donation is logged against a reference you can trace." },
  { icon: Receipt, text: "Successful donations generate a downloadable receipt automatically." },
  { icon: Landmark, text: "Card payments are processed securely by Paystack or Flutterwave — we never see your card details." },
];

export default function DonationsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">Support the Campaign</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
        Every naira, accounted for.
      </h1>
      <p className="mt-4 max-w-xl text-graphite-500">
        Your contribution funds campaign operations and constituency outreach —
        tracked openly, the same way every other module on this platform is.
      </p>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          {assurances.map(({ icon: Icon, text }) => (
            <div key={text} className="flex gap-4">
              <Icon className="h-5 w-5 shrink-0 text-forest-600" strokeWidth={1.5} />
              <p className="text-sm leading-relaxed text-graphite-700">{text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-sm border border-ink-900/10 bg-parchment-100/50 p-8">
          <DonationForm />
        </div>
      </div>
    </div>
  );
}
