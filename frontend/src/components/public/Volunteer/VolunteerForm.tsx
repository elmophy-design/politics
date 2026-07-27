"use client";

import { useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";

const interestOptions = [
  "Ward Mobilization",
  "Event Support",
  "Social Media",
  "Youth Outreach",
  "Women's Affairs",
  "Logistics",
];

export function VolunteerForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      await apiFetch("/volunteers", {
        method: "POST",
        body: {
          full_name: form.get("full_name"),
          phone: form.get("phone"),
          email: form.get("email") || undefined,
          address: form.get("address") || undefined,
          occupation: form.get("occupation") || undefined,
          gender: form.get("gender") || undefined,
          areas_of_interest: interests,
        },
      });
      setStatus("success");
      e.currentTarget.reset();
      setInterests([]);
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Something went wrong — please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-forest-600/30 bg-forest-600/5 px-6 py-8 text-center">
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-forest-700">
          Thank you for signing up!
        </p>
        <p className="mt-2 text-sm text-graphite-500">
          Your registration is pending review — a ward coordinator will be in touch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            required
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Email</label>
          <input
            name="email"
            type="email"
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Gender</label>
          <select
            name="gender"
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Address</label>
        <input
          name="address"
          className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Occupation</label>
        <input
          name="occupation"
          className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-4 py-2.5 text-graphite-700 outline-none focus:border-forest-600"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
          Areas of Interest
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {interestOptions.map((interest) => (
            <button
              type="button"
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                interests.includes(interest)
                  ? "border-forest-600 bg-forest-600/10 text-forest-700"
                  : "border-ink-900/15 text-graphite-700 hover:border-forest-600/50"
              }`}
            >
              {interest}
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
        disabled={status === "submitting"}
        className="w-full rounded-sm bg-forest-600 px-6 py-3.5 text-sm font-semibold text-parchment-50 transition-colors hover:bg-forest-700 disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting..." : "Register as a Volunteer"}
      </button>
    </form>
  );
}
