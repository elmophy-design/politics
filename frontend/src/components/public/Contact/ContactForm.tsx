"use client";

import { useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";

const types = [
  { value: "complaint", label: "Complaint" },
  { value: "issue", label: "Community Issue" },
  { value: "request", label: "Request" },
  { value: "suggestion", label: "Suggestion" },
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = new FormData(e.currentTarget);

    try {
      await apiFetch("/citizen-reports", {
        method: "POST",
        body: {
          type: form.get("type"),
          full_name: form.get("full_name"),
          email: form.get("email") || undefined,
          phone: form.get("phone") || undefined,
          subject: form.get("subject"),
          description: form.get("description"),
        },
      });
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong — please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-forest-600/30 bg-forest-600/5 px-6 py-8 text-center">
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-forest-700">
          Thank you — your message has been received.
        </p>
        <p className="mt-2 text-sm text-graphite-500">
          A member of the constituency team will follow up as needed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
          What is this about?
        </label>
        <select
          name="type"
          required
          defaultValue="suggestion"
          className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
        >
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Full Name</label>
          <input
            name="full_name"
            required
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Phone</label>
          <input
            name="phone"
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Email (optional)</label>
        <input
          name="email"
          type="email"
          className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Subject</label>
        <input
          name="subject"
          required
          className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Message</label>
        <textarea
          name="description"
          required
          rows={5}
          className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
        />
      </div>

      {status === "error" && (
        <p className="rounded-sm border border-clay-500/30 bg-clay-500/5 px-4 py-3 text-sm text-clay-600">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-sm bg-ink-900 px-6 py-3 text-sm font-medium text-parchment-50 transition-colors hover:bg-ink-800 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
