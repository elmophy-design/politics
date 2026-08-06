"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Upload, Send } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";

type Ward = { id: number; name: string; polling_units_count?: number };
type PU = { id: number; name: string; code: string; ward_id?: number };
type Paginated<T> = { data: T[] };

const PARTIES = ["APC", "PDP", "LP", "NNPP", "Others"];

export default function SubmitResultPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [units, setUnits] = useState<PU[]>([]);
  const [wardId, setWardId] = useState("");
  const [puId, setPuId] = useState("");
  const [votes, setVotes] = useState<Record<string, string>>(
    Object.fromEntries(PARTIES.map((p) => [p, ""]))
  );
  const [accredited, setAccredited] = useState("");
  const [totalCast, setTotalCast] = useState("");
  const [agentName, setAgentName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Ward[]>("/wards").then(setWards).catch(() => setWards([]));
  }, []);

  useEffect(() => {
    if (!wardId) {
      setUnits([]);
      return;
    }
    apiFetch<Paginated<PU>>(`/polling-units?ward_id=${wardId}&per_page=100`)
      .then((r) => setUnits(r.data ?? (r as unknown as PU[])))
      .catch(() => setUnits([]));
  }, [wardId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      const party_votes: Record<string, number> = {};
      for (const [p, v] of Object.entries(votes)) {
        const n = Number(v);
        if (!Number.isNaN(n) && v !== "") party_votes[p] = n;
      }
      if (!puId || Object.keys(party_votes).length === 0) {
        throw new Error("Select a polling unit and enter at least one party total");
      }

      const fd = new FormData();
      fd.append("polling_unit_id", puId);
      fd.append("party_votes", JSON.stringify(party_votes));
      if (accredited) fd.append("total_accredited_voters", accredited);
      if (totalCast) fd.append("total_votes_cast", totalCast);
      if (agentName) fd.append("party_agent_name", agentName);
      if (image) fd.append("result_sheet_image", image);

      await apiFetch("/situation-room/results", { method: "POST", body: fd });
      setMsg("Result submitted for verification");
      setVotes(Object.fromEntries(PARTIES.map((p) => [p, ""])));
      setImage(null);
      setAccredited("");
      setTotalCast("");
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : error instanceof Error ? error.message : "Submit failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Situation Room" title="Submit Result" />
      <p className="mt-2 max-w-xl text-sm text-graphite-500">
        Field agents enter polling-unit tallies here. Uploads go to verification before they count on the live board.
      </p>

      <form onSubmit={onSubmit} className="mt-8 max-w-xl space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs">
            <span className="font-mono text-graphite-500">Ward</span>
            <select
              required
              value={wardId}
              onChange={(e) => {
                setWardId(e.target.value);
                setPuId("");
              }}
              className="mt-1 w-full rounded-sm border border-ink-900/15 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select ward</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            <span className="font-mono text-graphite-500">Polling unit</span>
            <select
              required
              value={puId}
              onChange={(e) => setPuId(e.target.value)}
              className="mt-1 w-full rounded-sm border border-ink-900/15 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select unit</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.code} — {u.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PARTIES.map((p) => (
            <label key={p} className="block text-xs">
              <span className="font-mono text-graphite-500">{p}</span>
              <input
                type="number"
                min={0}
                value={votes[p]}
                onChange={(e) => setVotes((v) => ({ ...v, [p]: e.target.value }))}
                className="mt-1 w-full rounded-sm border border-ink-900/15 bg-white px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs">
            <span className="font-mono text-graphite-500">Accredited voters</span>
            <input
              type="number"
              min={0}
              value={accredited}
              onChange={(e) => setAccredited(e.target.value)}
              className="mt-1 w-full rounded-sm border border-ink-900/15 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs">
            <span className="font-mono text-graphite-500">Total votes cast</span>
            <input
              type="number"
              min={0}
              value={totalCast}
              onChange={(e) => setTotalCast(e.target.value)}
              className="mt-1 w-full rounded-sm border border-ink-900/15 bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="block text-xs">
          <span className="font-mono text-graphite-500">Party agent name (optional)</span>
          <input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="mt-1 w-full rounded-sm border border-ink-900/15 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex cursor-pointer flex-col items-start gap-2 rounded-sm border border-dashed border-ink-900/20 bg-white px-4 py-6 text-xs">
          <span className="inline-flex items-center gap-2 font-medium text-forest-700">
            <Upload className="h-4 w-4" /> Result sheet photo
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="text-graphite-500"
          />
          {image && <span className="text-graphite-500">{image.name}</span>}
        </label>

        {err && <p className="text-sm text-clay-600">{err}</p>}
        {msg && <p className="text-sm text-forest-700">{msg}</p>}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-sm bg-forest-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {saving ? "Submitting…" : "Submit for verification"}
        </button>
      </form>
    </div>
  );
}
