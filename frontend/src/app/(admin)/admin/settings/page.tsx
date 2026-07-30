"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";


const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  return `${STORAGE_URL}/${path.replace(/^\//, "")}`;
}

function ImagePreview({
  path,
  label,
  onClear,
}: {
  path?: string | null;
  label: string;
  onClear?: () => void;
}) {
  const src = mediaUrl(path);
  if (!src) {
    return (
      <div className="mt-2 flex h-20 w-full items-center justify-center rounded-sm border border-dashed border-ink-900/15 bg-parchment-100 text-[11px] uppercase tracking-wide text-graphite-500">
        No image
      </div>
    );
  }
  return (
    <div className="mt-2 flex items-start gap-3">
      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-sm border border-ink-900/10 bg-ink-900/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="h-full w-full object-cover" />
      </div>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-sm border border-ink-900/15 px-2.5 py-1 text-xs text-graphite-700 hover:border-clay-500 hover:text-clay-600"
        >
          Remove
        </button>
      )}
    </div>
  );
}


type HomepageSettings = {
  home_hero_eyebrow: string;
  home_hero_headline: string;
  home_hero_headline_highlight: string;
  home_hero_quote: string;
  home_hero_background_image: string;
  pillars_section_eyebrow: string;
  pillars_section_headline: string;
  pillar_constituency_title: string;
  pillar_constituency_description: string;
  pillar_constituency_image: string;
  pillar_constituency_href: string;
  pillar_foundation_title: string;
  pillar_foundation_description: string;
  pillar_foundation_image: string;
  pillar_foundation_href: string;
  pillar_election_title: string;
  pillar_election_description: string;
  pillar_election_image: string;
  pillar_election_href: string;
  pillar_engagement_title: string;
  pillar_engagement_description: string;
  pillar_engagement_image: string;
  pillar_engagement_href: string;
};

const PILLAR_FIELDS: {
  label: string;
  titleKey: keyof HomepageSettings;
  descriptionKey: keyof HomepageSettings;
  imageKey: keyof HomepageSettings;
  hrefKey: keyof HomepageSettings;
  defaultHref: string;
}[] = [
  {
    label: "Constituency Projects",
    titleKey: "pillar_constituency_title",
    descriptionKey: "pillar_constituency_description",
    imageKey: "pillar_constituency_image",
    hrefKey: "pillar_constituency_href",
    defaultHref: "/constituency-projects",
  },
  {
    label: "Lucky Eseigbe Foundation",
    titleKey: "pillar_foundation_title",
    descriptionKey: "pillar_foundation_description",
    imageKey: "pillar_foundation_image",
    hrefKey: "pillar_foundation_href",
    defaultHref: "/foundation",
  },
  {
    label: "Election Situation Room",
    titleKey: "pillar_election_title",
    descriptionKey: "pillar_election_description",
    imageKey: "pillar_election_image",
    hrefKey: "pillar_election_href",
    defaultHref: "/about/political-profile",
  },
  {
    label: "Citizen Engagement",
    titleKey: "pillar_engagement_title",
    descriptionKey: "pillar_engagement_description",
    imageKey: "pillar_engagement_image",
    hrefKey: "pillar_engagement_href",
    defaultHref: "/contact",
  },
];

type FooterSettings = {
  social_facebook_url: string;
  social_twitter_url: string;
  social_instagram_url: string;
  social_youtube_url: string;
};

type PaymentSettings = {
  payment_paystack_enabled: string;
  payment_flutterwave_enabled: string;
};

type ThemeSettings = {
  theme_color_primary: string;
  theme_color_action: string;
  theme_color_gold: string;
};

type IdentitySettings = {
  site_name: string;
  site_tagline: string;
  site_logo_image: string;
};

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

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const [homepage, setHomepage] = useState<HomepageSettings | null>(null);
  const [footer, setFooter] = useState<FooterSettings | null>(null);
  const [payments, setPayments] = useState<PaymentSettings | null>(null);
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [identity, setIdentity] = useState<IdentitySettings | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [savingGroup, setSavingGroup] = useState<string | null>(null);
  const [savedGroup, setSavedGroup] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingPillar, setUploadingPillar] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<HomepageSettings>("/settings?group=homepage")
      .then((res) =>
        setHomepage({
          home_hero_eyebrow: res?.home_hero_eyebrow ?? "",
          home_hero_headline: res?.home_hero_headline ?? "",
          home_hero_headline_highlight: res?.home_hero_headline_highlight ?? "",
          home_hero_quote: res?.home_hero_quote ?? "",
          home_hero_background_image: res?.home_hero_background_image ?? "",
          pillars_section_eyebrow: res?.pillars_section_eyebrow ?? "Four Pillars",
          pillars_section_headline:
            res?.pillars_section_headline ?? "One office, four commitments to the constituency.",
          pillar_constituency_title: res?.pillar_constituency_title ?? "Constituency Projects",
          pillar_constituency_description:
            res?.pillar_constituency_description ??
            "Every road, borehole, and classroom funded through this office, tracked by ward with real progress photos.",
          pillar_constituency_image: res?.pillar_constituency_image ?? "",
          pillar_constituency_href: res?.pillar_constituency_href ?? "/constituency-projects",
          pillar_foundation_title: res?.pillar_foundation_title ?? "Lucky Eseigbe Foundation",
          pillar_foundation_description:
            res?.pillar_foundation_description ??
            "Scholarships, medical outreach, and empowerment programs reaching communities beyond the campaign cycle.",
          pillar_foundation_image: res?.pillar_foundation_image ?? "",
          pillar_foundation_href: res?.pillar_foundation_href ?? "/foundation",
          pillar_election_title: res?.pillar_election_title ?? "Election Situation Room",
          pillar_election_description:
            res?.pillar_election_description ??
            "Ward-by-ward result collation and accredited polling agents, built for transparency on election day.",
          pillar_election_image: res?.pillar_election_image ?? "",
          pillar_election_href: res?.pillar_election_href ?? "/about/political-profile",
          pillar_engagement_title: res?.pillar_engagement_title ?? "Citizen Engagement",
          pillar_engagement_description:
            res?.pillar_engagement_description ??
            "Report an issue, request assistance, or send a suggestion directly — and track how it's resolved.",
          pillar_engagement_image: res?.pillar_engagement_image ?? "",
          pillar_engagement_href: res?.pillar_engagement_href ?? "/contact",
        })
      )
      .catch(() => setHomepage(null));
    apiFetch<FooterSettings>("/settings?group=footer").then(setFooter).catch(() => setFooter(null));
    apiFetch<PaymentSettings>("/settings?group=payments").then(setPayments).catch(() => setPayments(null));
    apiFetch<ThemeSettings>("/settings?group=theme").then(setTheme).catch(() => setTheme(null));
    apiFetch<IdentitySettings>("/settings?group=identity").then(setIdentity).catch(() => setIdentity(null));
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

  async function handleBackgroundUpload(file: File) {
    if (!homepage) return;
    setUploadingBg(true);
    try {
      const formData = new FormData();
      formData.append("type", "gallery_image");
      formData.append("title", "Homepage Hero Background");
      formData.append("file", file);
      const media = await apiFetch<{ file_path: string }>("/media", { method: "POST", body: formData });
      const updated = { ...homepage, home_hero_background_image: media.file_path };
      setHomepage(updated);
      await saveGroup("homepage", updated);
    } catch (err) {
      setErrors((e) => ({ ...e, homepage: err instanceof ApiError ? err.message : "Upload failed" }));
    } finally {
      setUploadingBg(false);
    }
  }

  async function handleLogoUpload(file: File) {
    if (!identity) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("type", "gallery_image");
      formData.append("title", "Site Logo");
      formData.append("file", file);
      const media = await apiFetch<{ file_path: string }>("/media", { method: "POST", body: formData });
      const updated = { ...identity, site_logo_image: media.file_path };
      setIdentity(updated);
      await saveGroup("identity", updated);
    } catch (err) {
      setErrors((e) => ({ ...e, identity: err instanceof ApiError ? err.message : "Upload failed" }));
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handlePillarUpload(key: keyof HomepageSettings, label: string, file: File) {
    if (!homepage) return;
    setUploadingPillar(key);
    try {
      const formData = new FormData();
      formData.append("type", "gallery_image");
      formData.append("title", `Four Pillars — ${label}`);
      formData.append("file", file);
      const media = await apiFetch<{ file_path: string }>("/media", { method: "POST", body: formData });
      const updated = { ...homepage, [key]: media.file_path };
      setHomepage(updated);
      await saveGroup("homepage", updated);
    } catch (err) {
      setErrors((e) => ({ ...e, homepage: err instanceof ApiError ? err.message : "Upload failed" }));
    } finally {
      setUploadingPillar(null);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Site Configuration" title="Settings" />

      {/* Account */}
      <div className="mt-8 max-w-2xl space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6">
        <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">Account</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-graphite-500">Name</p>
            <p className="mt-1 text-ink-900">{user?.name}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-graphite-500">Email</p>
            <p className="mt-1 text-ink-900">{user?.email}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-graphite-500">Role</p>
            <p className="mt-1 capitalize text-ink-900">{user?.roles?.[0]?.name ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Site identity */}
      {identity && (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            saveGroup("identity", identity);
          }}
          className="mt-6 max-w-2xl space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6"
        >
          <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">Site Identity</p>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Site Name</label>
            <input
              value={identity.site_name}
              onChange={(e) => setIdentity({ ...identity, site_name: e.target.value })}
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Tagline</label>
            <input
              value={identity.site_tagline}
              onChange={(e) => setIdentity({ ...identity, site_tagline: e.target.value })}
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Logo</label>
            <ImagePreview
              path={identity.site_logo_image}
              label="Site logo"
              onClear={
                identity.site_logo_image
                  ? () => setIdentity({ ...identity, site_logo_image: "" })
                  : undefined
              }
            />
            <input
              type="file"
              accept="image/*"
              disabled={uploadingLogo}
              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
            {uploadingLogo && <p className="mt-1 text-xs text-graphite-500">Uploading…</p>}
          </div>

          {errors.identity && <p className="text-sm text-clay-600">{errors.identity}</p>}
          <SaveButton saving={savingGroup === "identity"} saved={savedGroup === "identity"} />
        </form>
      )}

      {/* Theme colors */}
      {theme && (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            saveGroup("theme", theme);
          }}
          className="mt-6 max-w-2xl space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6"
        >
          <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">Theme Colors</p>
          <p className="text-xs text-graphite-500">
            Changes the site-wide color palette immediately — headings, buttons, and accents everywhere.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Primary (Deep Green)</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={theme.theme_color_primary}
                  onChange={(e) => setTheme({ ...theme, theme_color_primary: e.target.value })}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded-sm border border-ink-900/15"
                />
                <input
                  value={theme.theme_color_primary}
                  onChange={(e) => setTheme({ ...theme, theme_color_primary: e.target.value })}
                  className="w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-2 py-1.5 font-mono text-xs outline-none focus:border-forest-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Action Green</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={theme.theme_color_action}
                  onChange={(e) => setTheme({ ...theme, theme_color_action: e.target.value })}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded-sm border border-ink-900/15"
                />
                <input
                  value={theme.theme_color_action}
                  onChange={(e) => setTheme({ ...theme, theme_color_action: e.target.value })}
                  className="w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-2 py-1.5 font-mono text-xs outline-none focus:border-forest-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Gold Accent</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={theme.theme_color_gold}
                  onChange={(e) => setTheme({ ...theme, theme_color_gold: e.target.value })}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded-sm border border-ink-900/15"
                />
                <input
                  value={theme.theme_color_gold}
                  onChange={(e) => setTheme({ ...theme, theme_color_gold: e.target.value })}
                  className="w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-2 py-1.5 font-mono text-xs outline-none focus:border-forest-600"
                />
              </div>
            </div>
          </div>

          {errors.theme && <p className="text-sm text-clay-600">{errors.theme}</p>}
          <SaveButton saving={savingGroup === "theme"} saved={savedGroup === "theme"} />
        </form>
      )}

      {/* Homepage content */}
      {homepage && (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            saveGroup("homepage", homepage);
          }}
          className="mt-6 max-w-2xl space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6"
        >
          <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">Homepage Hero</p>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Eyebrow Text</label>
            <input
              value={homepage.home_hero_eyebrow}
              onChange={(e) => setHomepage({ ...homepage, home_hero_eyebrow: e.target.value })}
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Headline (start)</label>
              <input
                value={homepage.home_hero_headline}
                onChange={(e) => setHomepage({ ...homepage, home_hero_headline: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Headline (highlighted)</label>
              <input
                value={homepage.home_hero_headline_highlight}
                onChange={(e) => setHomepage({ ...homepage, home_hero_headline_highlight: e.target.value })}
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Pull Quote</label>
            <textarea
              rows={3}
              value={homepage.home_hero_quote}
              onChange={(e) => setHomepage({ ...homepage, home_hero_quote: e.target.value })}
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
              Background Image
            </label>
            <ImagePreview
              path={homepage.home_hero_background_image}
              label="Hero background"
              onClear={
                homepage.home_hero_background_image
                  ? () => setHomepage({ ...homepage, home_hero_background_image: "" })
                  : undefined
              }
            />
            <input
              type="file"
              accept="image/*"
              disabled={uploadingBg}
              onChange={(e) => e.target.files?.[0] && handleBackgroundUpload(e.target.files[0])}
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
            {uploadingBg && <p className="mt-1 text-xs text-graphite-500">Uploading…</p>}
          </div>

          <div className="border-t border-ink-900/10 pt-4 space-y-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">Four Pillars Section</p>
              <p className="mt-1 text-xs text-graphite-500">
                Heading, card copy, optional images, and link targets for the homepage cards under the hero.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
                  Section Eyebrow
                </label>
                <input
                  value={homepage.pillars_section_eyebrow}
                  onChange={(e) =>
                    setHomepage({ ...homepage, pillars_section_eyebrow: e.target.value })
                  }
                  className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
                  Section Headline
                </label>
                <input
                  value={homepage.pillars_section_headline}
                  onChange={(e) =>
                    setHomepage({ ...homepage, pillars_section_headline: e.target.value })
                  }
                  className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
                />
              </div>
            </div>

            <div className="space-y-6">
              {PILLAR_FIELDS.map(({ label, titleKey, descriptionKey, imageKey, hrefKey, defaultHref }) => (
                <div
                  key={imageKey}
                  className="rounded-sm border border-ink-900/10 bg-parchment-100/60 p-4 space-y-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-900">{label}</p>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
                      Title
                    </label>
                    <input
                      value={homepage[titleKey]}
                      onChange={(e) =>
                        setHomepage({ ...homepage, [titleKey]: e.target.value })
                      }
                      className="mt-1 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-3 py-2 text-sm outline-none focus:border-forest-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={homepage[descriptionKey]}
                      onChange={(e) =>
                        setHomepage({ ...homepage, [descriptionKey]: e.target.value })
                      }
                      className="mt-1 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-3 py-2 text-sm outline-none focus:border-forest-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
                      Link Target
                    </label>
                    <input
                      value={homepage[hrefKey]}
                      onChange={(e) =>
                        setHomepage({ ...homepage, [hrefKey]: e.target.value })
                      }
                      placeholder={defaultHref}
                      className="mt-1 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-3 py-2 font-mono text-sm outline-none focus:border-forest-600"
                    />
                    <p className="mt-1 text-[11px] text-graphite-500">
                      Relative path (e.g. /foundation) or full URL.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">
                      Card Image
                    </label>
                    <ImagePreview
                      path={homepage[imageKey]}
                      label={label}
                      onClear={
                        homepage[imageKey]
                          ? () => setHomepage({ ...homepage, [imageKey]: "" })
                          : undefined
                      }
                    />
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingPillar === imageKey}
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handlePillarUpload(imageKey, label, e.target.files[0])
                      }
                      className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-50 px-3 py-2 text-sm outline-none focus:border-forest-600"
                    />
                    {uploadingPillar === imageKey && (
                      <p className="mt-1 text-xs text-graphite-500">Uploading…</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {errors.homepage && <p className="text-sm text-clay-600">{errors.homepage}</p>}
          <SaveButton saving={savingGroup === "homepage"} saved={savedGroup === "homepage"} />
        </form>
      )}

      {/* Footer / social links */}
      {footer && (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            saveGroup("footer", footer);
          }}
          className="mt-6 max-w-2xl space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6"
        >
          <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">Footer &amp; Social Links</p>
          <p className="text-xs text-graphite-500">
            Leave a field blank to hide that icon from the footer entirely.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Facebook URL</label>
              <input
                value={footer.social_facebook_url}
                onChange={(e) => setFooter({ ...footer, social_facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">X (Twitter) URL</label>
              <input
                value={footer.social_twitter_url}
                onChange={(e) => setFooter({ ...footer, social_twitter_url: e.target.value })}
                placeholder="https://x.com/..."
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">Instagram URL</label>
              <input
                value={footer.social_instagram_url}
                onChange={(e) => setFooter({ ...footer, social_instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-graphite-500">YouTube URL</label>
              <input
                value={footer.social_youtube_url}
                onChange={(e) => setFooter({ ...footer, social_youtube_url: e.target.value })}
                placeholder="https://youtube.com/..."
                className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
              />
            </div>
          </div>

          {errors.footer && <p className="text-sm text-clay-600">{errors.footer}</p>}
          <SaveButton saving={savingGroup === "footer"} saved={savedGroup === "footer"} />
        </form>
      )}

      {/* Payment gateway badges */}
      {payments && (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            saveGroup("payments", payments);
          }}
          className="mt-6 max-w-2xl space-y-4 rounded-sm border border-ink-900/10 bg-parchment-50 p-6"
        >
          <p className="font-mono text-[11px] uppercase tracking-wide text-gold-600">Payment Gateway Badges</p>
          <p className="text-xs text-graphite-500">
            Controls whether the trust badges show in the footer — actual payment processing keys still live in the backend .env file.
          </p>

          <label className="flex items-center justify-between rounded-sm border border-ink-900/10 px-4 py-3">
            <span className="text-sm text-ink-900">Show Paystack badge</span>
            <input
              type="checkbox"
              checked={payments.payment_paystack_enabled === "true"}
              onChange={(e) =>
                setPayments({ ...payments, payment_paystack_enabled: e.target.checked ? "true" : "false" })
              }
              className="h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between rounded-sm border border-ink-900/10 px-4 py-3">
            <span className="text-sm text-ink-900">Show Flutterwave badge</span>
            <input
              type="checkbox"
              checked={payments.payment_flutterwave_enabled === "true"}
              onChange={(e) =>
                setPayments({ ...payments, payment_flutterwave_enabled: e.target.checked ? "true" : "false" })
              }
              className="h-4 w-4"
            />
          </label>

          {errors.payments && <p className="text-sm text-clay-600">{errors.payments}</p>}
          <SaveButton saving={savingGroup === "payments"} saved={savedGroup === "payments"} />
        </form>
      )}
    </div>
  );
}
