"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useSiteIdentity } from "@/lib/hooks/useSiteIdentity";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const [open, setOpen] = useState(false);
  const identity = useSiteIdentity();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-900/10 bg-parchment-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          {identity.logoUrl ? (
            <Image
              src={identity.logoUrl}
              alt={identity.name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-sm object-contain"
            />
          ) : null}
          <span className="flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-ink-900">
              {identity.name}
            </span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-gold-600 sm:inline">
              Official Platform
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {siteConfig.primaryNav.map((item) => {
            // Check if this is the Donations link
            const isDonations = item.label === "Donations";
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors hover:text-forest-600",
                  isDonations 
                    ? "rounded-sm bg-forest-600 px-5 py-2.5 font-medium text-parchment-50 hover:bg-forest-700" 
                    : "text-graphite-700"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6 text-ink-900" /> : <Menu className="h-6 w-6 text-ink-900" />}
        </button>
      </div>

      <nav
        className={cn(
          "grid overflow-hidden border-t border-ink-900/10 bg-parchment-50 transition-[grid-template-rows] duration-300 lg:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          <ul className="flex flex-col px-6 py-2">
            {siteConfig.primaryNav.map((item) => {
              const isDonations = item.label === "Donations";
              
              return (
                <li key={item.href} className={cn(isDonations && "mt-2")}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block py-3 text-sm text-graphite-700",
                      isDonations && "rounded-sm bg-forest-600 px-5 py-2.5 text-center font-medium text-parchment-50 hover:bg-forest-700"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}
