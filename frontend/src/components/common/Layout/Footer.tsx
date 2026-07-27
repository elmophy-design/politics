"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, Youtube, Twitter, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { useSiteIdentity } from "@/lib/hooks/useSiteIdentity";

type FooterSettings = {
  social_facebook_url?: string;
  social_twitter_url?: string;
  social_instagram_url?: string;
  social_youtube_url?: string;
};

type PaymentSettings = {
  payment_paystack_enabled?: string;
  payment_flutterwave_enabled?: string;
};

const socialIcons = [
  { key: "social_facebook_url" as const, label: "Facebook", icon: Facebook },
  { key: "social_twitter_url" as const, label: "X (Twitter)", icon: Twitter },
  { key: "social_instagram_url" as const, label: "Instagram", icon: Instagram },
  { key: "social_youtube_url" as const, label: "YouTube", icon: Youtube },
];

export function Footer() {
  const identity = useSiteIdentity();
  const [social, setSocial] = useState<FooterSettings>({});
  const [payments, setPayments] = useState<PaymentSettings>({
    payment_paystack_enabled: "true",
    payment_flutterwave_enabled: "true",
  });

  useEffect(() => {
    apiFetch<FooterSettings>("/settings?group=footer").then(setSocial).catch(() => setSocial({}));
    apiFetch<PaymentSettings>("/settings?group=payments")
      .then((res) => setPayments((prev) => ({ ...prev, ...res })))
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t border-parchment-100/10 bg-ink-900 text-parchment-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            {identity.name}
          </p>
          <p className="mt-3 max-w-sm text-sm text-parchment-100/70">
            {identity.tagline}
          </p>

          {/* Social icons — only rendered once a real URL is configured in Settings */}
          <div className="mt-6 flex gap-3">
            {socialIcons
              .filter(({ key }) => social[key])
              .map(({ key, label, icon: Icon }) => (
                <a
                  key={key}
                  href={social[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-parchment-100/15 text-parchment-100/70 transition-colors hover:border-gold-500 hover:text-gold-300"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </a>
              ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold-300">
            Platform
          </p>
          <ul className="mt-4 space-y-2 text-sm text-parchment-100/80">
            <li><Link href="/manifesto" className="hover:text-gold-300">Manifesto</Link></li>
            <li><Link href="/constituency-projects" className="hover:text-gold-300">Constituency Projects</Link></li>
            <li><Link href="/foundation" className="hover:text-gold-300">Foundation</Link></li>
            <li><Link href="/donations" className="hover:text-gold-300">Donate</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold-300">
            Get Involved
          </p>
          <ul className="mt-4 space-y-2 text-sm text-parchment-100/80">
            <li><Link href="/volunteer" className="hover:text-gold-300">Volunteer</Link></li>
            <li><Link href="/contact" className="hover:text-gold-300">Contact</Link></li>
            <li><Link href="/gallery" className="hover:text-gold-300">Gallery</Link></li>
          </ul>
        </div>
      </div>

      {/* Payment trust badges — descriptive text + generic shield icon, not the gateways' actual logo marks */}
      {(payments.payment_paystack_enabled === "true" || payments.payment_flutterwave_enabled === "true") && (
        <div className="border-t border-parchment-100/10 px-6 py-5">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wide text-parchment-100/40">
              Donations secured by
            </span>
            {payments.payment_paystack_enabled === "true" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-parchment-100/15 px-3 py-1 text-xs text-parchment-100/70">
                <ShieldCheck className="h-3.5 w-3.5 text-gold-300" strokeWidth={1.75} /> Paystack
              </span>
            )}
            {payments.payment_flutterwave_enabled === "true" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-parchment-100/15 px-3 py-1 text-xs text-parchment-100/70">
                <ShieldCheck className="h-3.5 w-3.5 text-gold-300" strokeWidth={1.75} /> Flutterwave
              </span>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-parchment-100/10 px-6 py-6">
        <p className="mx-auto max-w-6xl font-mono text-xs text-parchment-100/50">
          © {new Date().getFullYear()} {identity.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
