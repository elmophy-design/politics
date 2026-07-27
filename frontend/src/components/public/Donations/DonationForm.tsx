"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";

type Campaign = { id: number; title: string };
type Paginated<T> = { data: T[] };

const presetAmounts = [5000, 10000, 25000, 50000];

const gateways = [
  { value: "paystack", label: "Card (Paystack)" },
  { value: "flutterwave", label: "Card (Flutterwave)" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

export function DonationForm() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [amount, setAmount] = useState<number | "">(10000);
  const [gateway, setGateway] = useState("paystack");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "bank_pending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [bankReference, setBankReference] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Paginated<Campaign>>("/campaigns")
      .then((res) => setCampaigns(res.data ?? []))
      .catch(() => setCampaigns([]));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const result = await apiFetch<{ authorization_url?: string; reference: string }>(
        "/donations/initialize",
        {
          method: "POST",
          body: {
            campaign_id: form.get("campaign_id") || undefined,
            donor_name: isAnonymous ? undefined : form.get("donor_name") || undefined,
            donor_email: form.get("donor_email") || undefined,
            donor_phone: form.get("donor_phone") || undefined,
            is_anonymous: isAnonymous,
            amount,
            gateway,
          },
        }
      );

      if (gateway === "bank_transfer") {
        setBankReference(result.reference);
        setStatus("bank_pending");
      } else if (result.authorization_url) {
        window.location.href = result.authorization_url;
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Something went wrong — please try again.");
    }
  }

  if (status === "bank_pending" && bankReference) {
    return (
      <div className="rounded-sm border border-forest-600/30 bg-forest-600/5 px-6 py-8">
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-forest-700">
          Almost there — complete your bank transfer
        </p>
        <p className="mt-3 text-sm text-graphite-700">
          Use the reference below when making your transfer. The team will confirm
          receipt and mark your donation as complete.
        </p>
        <p className="mt-4 rounded-sm bg-parchment-100 px-4 py-3 font-mono text-sm text-ink-900">
          {bankReference}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
          Amount (₦)
        </label>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {presetAmounts.map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => setAmount(preset)}
              className={`rounded-sm border px-3 py-2 text-sm transition-colors ${
                amount === preset
                  ? "border-forest-600 bg-forest-600/10 text-forest-700"
                  : "border-ink-900/15 text-graphite-700 hover:border-forest-600/50"
              }`}
            >
              {preset.toLocaleString()}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={100}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
          className="mt-3 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
          placeholder="Or enter a custom amount"
        />
      </div>

      {campaigns.length > 0 && (
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
            Campaign (optional)
          </label>
          <select
            name="campaign_id"
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
          >
            <option value="">General Fund</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-graphite-700">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="h-4 w-4 rounded-sm border-ink-900/30"
        />
        Donate anonymously
      </label>

      {!isAnonymous && (
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Full Name</label>
          <input
            name="donor_name"
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
          />
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
            Email {gateway !== "bank_transfer" && "(required)"}
          </label>
          <input
            name="donor_email"
            type="email"
            required={gateway !== "bank_transfer"}
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Phone</label>
          <input
            name="donor_phone"
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
          Payment Method
        </label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {gateways.map((g) => (
            <button
              type="button"
              key={g.value}
              onClick={() => setGateway(g.value)}
              className={`rounded-sm border px-3 py-2.5 text-xs font-medium transition-colors ${
                gateway === g.value
                  ? "border-forest-600 bg-forest-600/10 text-forest-700"
                  : "border-ink-900/15 text-graphite-700 hover:border-forest-600/50"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-sm border border-clay-500/30 bg-clay-500/5 px-4 py-3 text-sm text-clay-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || !amount}
        className="w-full rounded-sm bg-forest-600 px-6 py-3.5 text-sm font-semibold text-parchment-50 transition-colors hover:bg-forest-700 disabled:opacity-60"
      >
        {status === "submitting" ? "Processing..." : `Donate ₦${amount ? Number(amount).toLocaleString() : "0"}`}
      </button>
    </form>
  );
}
