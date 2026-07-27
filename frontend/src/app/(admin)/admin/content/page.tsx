"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";
import { JsonListEditor } from "@/components/admin/Shared/JsonListEditor";

type Pillar = { title: string; body: string };
type Role = { period: string; role: string };
type TimelineItem = { year: string; event: string };

function SaveButton({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="rounded-sm bg-forest-600 px-5 py-2.5 text-sm font-medium text-parchment-50 hover:bg-forest-700 disabled:opacity-60"
    >
      {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
    </button>
  );
}

export default function AdminContentPage() {
  // Manifesto
  const [manifestoIntro, setManifestoIntro] = useState("");
  const [pillars, setPillars] = useState<Pillar[]>([]);

  // Vision & Mission
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");

  // Political Profile
  const [profileBody, setProfileBody] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);

  // Biography
  const [bioIntro, setBioIntro] = useState("");
  const [bioPortrait, setBioPortrait] = useState("");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);

  const [savingGroup, setSavingGroup] = useState<string | null>(null);
  const [savedGroup, setSavedGroup] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<{ manifesto_intro?: string; manifesto_pillars_json?: string }>("/settings?group=content_manifesto")
      .then((res) => {
        setManifestoIntro(res.manifesto_intro ?? "");
        setPillars(res.manifesto_pillars_json ? JSON.parse(res.manifesto_pillars_json) : []);
      })
      .catch(() => {});

    apiFetch<{ vision_text?: string; mission_text?: string }>("/settings?group=content_vision_mission")
      .then((res) => {
        setVision(res.vision_text ?? "");
        setMission(res.mission_text ?? "");
      })
      .catch(() => {});

    apiFetch<{ political_profile_body?: string; political_profile_roles_json?: string }>(
      "/settings?group=content_political_profile"
    )
      .then((res) => {
        setProfileBody(res.political_profile_body ?? "");
        setRoles(res.political_profile_roles_json ? JSON.parse(res.political_profile_roles_json) : []);
      })
      .catch(() => {});

    apiFetch<{ biography_intro?: string; biography_portrait_image?: string; biography_timeline_json?: string }>(
      "/settings?group=content_biography"
    )
      .then((res) => {
        setBioIntro(res.biography_intro ?? "");
        setBioPortrait(res.biography_portrait_image ?? "");
        setTimeline(res.biography_timeline_json ? JSON.parse(res.biography_timeline_json) : []);
      })
      .catch(() => {});
  }, []);

  async function saveGroup(group: string, values: Record<string, string>) {
    setSavingGroup(group);
    setSavedGroup(null);
    setErrors((e) => ({ ...e, [group]: "" }));
    try {
      await apiFetch("/settings", { method: "PUT", body: { group, values } });
      setSavedGroup(group);
      setTimeout(() => setSavedGroup(null), 2000);
    } catch (err) {
      setErrors((e) => ({ ...e, [group]: err instanceof ApiError ? err.message : "Failed to save" }));
    } finally {
      setSavingGroup(null);
    }
  }

  async function handlePortraitUpload(file: File) {
    setUploadingPortrait(true);
    try {
      const formData = new FormData();
      formData.append("type", "gallery_image");
      formData.append("title", "Biography Portrait");
      formData.append("file", file);
      const media = await apiFetch<{ file_path: string }>("/media", { method: "POST", body: formData });
      setBioPortrait(media.file_path);
    } catch (err) {
      setErrors((e) => ({ ...e, content_biography: err instanceof ApiError ? err.message : "Upload failed" }));
    } finally {
      setUploadingPortrait(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Site Content" title="Articles & Pages" />
      <p className="mt-2 max-w-2xl text-sm text-graphite-500">
        Edits here go live on the Manifesto, Vision &amp; Mission, Political Profile, and Biography pages immediately.
      </p>

      {/* Manifesto */}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          saveGroup("content_manifesto", {
            manifesto_intro: manifestoIntro,
            manifesto_pillars_json: JSON.stringify(pillars),
          });
        }}
        className="mt-6 max-w-2xl space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6"
      >
        <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">Manifesto</p>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Intro Paragraph</label>
          <textarea
            rows={2}
            value={manifestoIntro}
            onChange={(e) => setManifestoIntro(e.target.value)}
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Pillars</label>
          <div className="mt-2">
            <JsonListEditor
              items={pillars}
              onChange={setPillars}
              fieldA="title"
              fieldB="body"
              fieldALabel="Pillar title"
              fieldBLabel="Description"
              emptyItem={{ title: "", body: "" }}
            />
          </div>
        </div>

        {errors.content_manifesto && <p className="text-sm text-clay-600">{errors.content_manifesto}</p>}
        <SaveButton saving={savingGroup === "content_manifesto"} saved={savedGroup === "content_manifesto"} />
      </form>

      {/* Vision & Mission */}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          saveGroup("content_vision_mission", { vision_text: vision, mission_text: mission });
        }}
        className="mt-6 max-w-2xl space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6"
      >
        <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">Vision &amp; Mission</p>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Vision Statement</label>
          <textarea
            rows={3}
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Mission Statement</label>
          <textarea
            rows={3}
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
          />
        </div>

        {errors.content_vision_mission && <p className="text-sm text-clay-600">{errors.content_vision_mission}</p>}
        <SaveButton saving={savingGroup === "content_vision_mission"} saved={savedGroup === "content_vision_mission"} />
      </form>

      {/* Political Profile */}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          saveGroup("content_political_profile", {
            political_profile_body: profileBody,
            political_profile_roles_json: JSON.stringify(roles),
          });
        }}
        className="mt-6 max-w-2xl space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6"
      >
        <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">Political Profile</p>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Overview</label>
          <textarea
            rows={3}
            value={profileBody}
            onChange={(e) => setProfileBody(e.target.value)}
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Positions Held</label>
          <div className="mt-2">
            <JsonListEditor
              items={roles}
              onChange={setRoles}
              fieldA="period"
              fieldB="role"
              fieldALabel="Period (e.g. 2019–2023)"
              fieldBLabel="Role / position"
              fieldBMultiline={false}
              emptyItem={{ period: "", role: "" }}
            />
          </div>
        </div>

        {errors.content_political_profile && <p className="text-sm text-clay-600">{errors.content_political_profile}</p>}
        <SaveButton saving={savingGroup === "content_political_profile"} saved={savedGroup === "content_political_profile"} />
      </form>

      {/* Biography */}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          saveGroup("content_biography", {
            biography_intro: bioIntro,
            biography_portrait_image: bioPortrait,
            biography_timeline_json: JSON.stringify(timeline),
          });
        }}
        className="mt-6 max-w-2xl space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6"
      >
        <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">Biography</p>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Intro Paragraph</label>
          <textarea
            rows={3}
            value={bioIntro}
            onChange={(e) => setBioIntro(e.target.value)}
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Portrait Photo</label>
          <p className="mt-1 text-xs text-graphite-500">
            {bioPortrait ? "A portrait is set." : "No portrait set — the biography page shows a placeholder."}
          </p>
          <input
            type="file"
            accept="image/*"
            disabled={uploadingPortrait}
            onChange={(e) => e.target.files?.[0] && handlePortraitUpload(e.target.files[0])}
            className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
          />
          {uploadingPortrait && <p className="mt-1 text-xs text-graphite-500">Uploading…</p>}
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Milestones</label>
          <div className="mt-2">
            <JsonListEditor
              items={timeline}
              onChange={setTimeline}
              fieldA="year"
              fieldB="event"
              fieldALabel="Year"
              fieldBLabel="Milestone description"
              fieldBMultiline={false}
              emptyItem={{ year: "", event: "" }}
            />
          </div>
        </div>

        {errors.content_biography && <p className="text-sm text-clay-600">{errors.content_biography}</p>}
        <SaveButton saving={savingGroup === "content_biography"} saved={savedGroup === "content_biography"} />
      </form>
    </div>
  );
}
