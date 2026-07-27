"use client";

import { useEffect, useState } from "react";
import { Landmark } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

type Role = { period: string; role: string };

const fallbackBody =
  "Placeholder overview of political career and current office — replace with the confirmed record of positions held, committees served on, and legislative or constituency work delivered.";

const fallbackRoles: Role[] = [
  { period: "—", role: "Current elected office — replace with confirmed title and constituency." },
  { period: "—", role: "Prior political or public service roles." },
  { period: "—", role: "Party positions held, if any." },
];

export default function PoliticalProfilePage() {
  const [body, setBody] = useState(fallbackBody);
  const [roles, setRoles] = useState<Role[]>(fallbackRoles);

  useEffect(() => {
    apiFetch<{ political_profile_body?: string; political_profile_roles_json?: string }>(
      "/settings?group=content_political_profile"
    )
      .then((res) => {
        if (res.political_profile_body) setBody(res.political_profile_body);
        if (res.political_profile_roles_json) {
          try {
            const parsed = JSON.parse(res.political_profile_roles_json);
            if (Array.isArray(parsed) && parsed.length > 0) setRoles(parsed);
          } catch {
            // Keep fallback roles.
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">About</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
        Political Profile
      </h1>
      <p className="mt-6 leading-relaxed text-graphite-700">{body}</p>

      <div className="mt-14">
        <div className="flex items-center gap-3">
          <Landmark className="h-5 w-5 text-forest-600" strokeWidth={1.5} />
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink-900">
            Positions Held
          </h2>
        </div>
        <div className="mt-6 space-y-6 border-l border-ink-900/10 pl-8">
          {roles.map((r, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-[41px] top-1 h-2 w-2 rounded-full bg-gold-500" />
              <p className="font-mono text-xs text-gold-600">{r.period}</p>
              <p className="mt-1 text-graphite-700">{r.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
