"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { apiFetch, ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/admin/Shared/PageHeader";

type HomepageSettings = {
  home_hero_eyebrow: string;
  home_hero_headline: string;
  home_hero_headline_highlight: string;
  home_hero_quote: string;
  home_hero_background_image: string;
};

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

  useEffect(() => {
    apiFetch<HomepageSettings>("/settings?group=homepage").then(setHomepage).catch(() => setHomepage(null));
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
            <p className="mt-1 text-xs text-graphite-500">
              {identity.site_logo_image
                ? "A logo is set — it now appears in the header next to the site name."
                : "No logo set — the header shows the site name as text only."}
            </p>
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
            <p className="mt-1 text-xs text-graphite-500">
              {homepage.home_hero_background_image
                ? "A background photo is set — the hero switches to a photo layout with white/gold text automatically."
                : "No background photo set — the hero uses the default textured white layout."}
            </p>
            <input
              type="file"
              accept="image/*"
              disabled={uploadingBg}
              onChange={(e) => e.target.files?.[0] && handleBackgroundUpload(e.target.files[0])}
              className="mt-2 w-full rounded-sm border border-ink-900/15 bg-parchment-100 px-3 py-2 text-sm outline-none focus:border-forest-600"
            />
            {uploadingBg && <p className="mt-1 text-xs text-graphite-500">Uploading…</p>}
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
