"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { siteConfig } from "@/config/site";

type IdentitySettings = {
  site_name?: string;
  site_tagline?: string;
  site_logo_image?: string;
};

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";

/**
 * Site name/tagline/logo, admin-editable via Settings → Identity. Falls back
 * to the build-time defaults in config/site.ts if nothing's been set yet.
 */
export function useSiteIdentity() {
  const [identity, setIdentity] = useState({
    name: siteConfig.name,
    tagline: siteConfig.tagline,
    logoUrl: null as string | null,
  });

  useEffect(() => {
    apiFetch<IdentitySettings>("/settings?group=identity")
      .then((res) => {
        setIdentity({
          name: res.site_name || siteConfig.name,
          tagline: res.site_tagline || siteConfig.tagline,
          logoUrl: res.site_logo_image
            ? res.site_logo_image.startsWith("http")
              ? res.site_logo_image
              : `${STORAGE_URL}/${res.site_logo_image}`
            : null,
        });
      })
      .catch(() => {
        // Keep the config/site.ts defaults already set above.
      });
  }, []);

  return identity;
}
