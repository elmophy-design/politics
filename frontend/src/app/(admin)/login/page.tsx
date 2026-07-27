"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { ApiError } from "@/lib/api/client";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-900 px-6 py-16">
      {/* Layered backdrop: solid deep green base + subtle ward-grid texture + soft gold glow — not blended into the base color, so it stays crisp */}
      <div className="ward-grid-texture pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-gold-500), transparent 70%)" }}
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-500">
            <ShieldCheck className="h-6 w-6 text-ink-950" strokeWidth={2} />
          </div>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.24em] text-gold-300">
            Secure Admin Access
          </p>
        </div>

        <div className="rounded-sm bg-parchment-50 p-10 shadow-2xl shadow-black/30">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink-900">
            Sign in to the dashboard
          </h1>
          <p className="mt-1 text-sm text-graphite-500">
            Campaign, Foundation, and Situation Room access — by invitation only.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-graphite-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-4 py-2.5 text-ink-900 outline-none transition-colors focus:border-forest-600 focus:bg-parchment-50 focus:ring-2 focus:ring-forest-600/15"
                placeholder="you@luckyeseigbe.org"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-graphite-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-4 py-2.5 text-ink-900 outline-none transition-colors focus:border-forest-600 focus:bg-parchment-50 focus:ring-2 focus:ring-forest-600/15"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-sm border border-clay-500/30 bg-clay-500/5 px-4 py-2.5 text-sm text-clay-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm bg-ink-900 px-4 py-3 text-sm font-semibold text-parchment-50 transition-colors hover:bg-ink-800 disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="relative mt-6 text-center font-mono text-[11px] text-parchment-100/40">
          Hon. Barr. Lucky Eseigbe — Official Platform
        </p>
      </div>
    </div>
  );
}
