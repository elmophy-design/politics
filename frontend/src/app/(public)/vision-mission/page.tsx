"use client";

import { useEffect, useState } from "react";
import { Eye, Target } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

const fallbackVision =
  "Placeholder vision statement — replace with the confirmed long-term vision for the constituency: what it looks like when this office's work succeeds.";
const fallbackMission =
  "Placeholder mission statement — replace with the confirmed day-to-day mission: how this office intends to serve the constituency and deliver on the manifesto.";

export default function VisionMissionPage() {
  const [vision, setVision] = useState(fallbackVision);
  const [mission, setMission] = useState(fallbackMission);

  useEffect(() => {
    apiFetch<{ vision_text?: string; mission_text?: string }>("/settings?group=content_vision_mission")
      .then((res) => {
        if (res.vision_text) setVision(res.vision_text);
        if (res.mission_text) setMission(res.mission_text);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-forest-600">Guiding Principles</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-ink-900">
        Vision &amp; Mission
      </h1>

      <div className="mt-14 space-y-14">
        <div className="border-l-2 border-gold-500 pl-8">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-forest-600" strokeWidth={1.5} />
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink-900">Vision</h2>
          </div>
          <p className="mt-4 leading-relaxed text-graphite-700">{vision}</p>
        </div>

        <div className="border-l-2 border-gold-500 pl-8">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-forest-600" strokeWidth={1.5} />
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink-900">Mission</h2>
          </div>
          <p className="mt-4 leading-relaxed text-graphite-700">{mission}</p>
        </div>
      </div>
    </div>
  );
}
