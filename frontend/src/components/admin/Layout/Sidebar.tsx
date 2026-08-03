"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  ShieldAlert,
  HandCoins,
  Users,
  HeartHandshake,
  Building2,
  MessagesSquare,
  Image as ImageIcon,
  UserCog,
  Settings,
  FileText,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils/cn";

const navItems: (
  | { type: "link"; href: string; label: string; icon: typeof LayoutDashboard }
  | { type: "group"; label: string; icon: typeof LayoutDashboard; children: { href: string; label: string }[] }
)[] = [
  { type: "link", href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { type: "link", href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { type: "link", href: "/admin/events", label: "Events", icon: CalendarDays },
  {
    type: "group",
    label: "Situation Room",
    icon: ShieldAlert,
    children: [
      { href: "/admin/situation-room", label: "Live Command Centre" },
      { href: "/admin/situation-room/results", label: "Results" },
      { href: "/admin/situation-room/incidents", label: "Incidents" },
      { href: "/admin/situation-room/wards", label: "Wards" },
      { href: "/admin/situation-room/polling-units", label: "Polling Units" },
    ],
  },
  { type: "link", href: "/admin/donations/reports", label: "Donations", icon: HandCoins },
  { type: "link", href: "/admin/volunteers", label: "Volunteers", icon: Users },
  { type: "link", href: "/admin/foundation/projects", label: "Foundation", icon: HeartHandshake },
  { type: "link", href: "/admin/constituency/projects", label: "Constituency Projects", icon: Building2 },
  { type: "link", href: "/admin/citizen-engagement/reports", label: "Citizen Reports", icon: MessagesSquare },
  { type: "link", href: "/admin/media", label: "Media Centre", icon: ImageIcon },
  { type: "link", href: "/admin/hero-slides", label: "Hero Write-ups", icon: Sparkles },
  { type: "link", href: "/admin/users", label: "Users", icon: UserCog },
  { type: "link", href: "/admin/content", label: "Content", icon: FileText },
  { type: "link", href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col self-stretch border-r border-parchment-100/10 bg-ink-950 text-parchment-100">
      <div className="border-b border-parchment-100/10 px-6 py-6">
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold">Lucky Eseigbe</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold-300">Admin Dashboard</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {navItems.map((item) => {
          if (item.type === "group") {
            const groupActive = item.children.some((c) => pathname?.startsWith(c.href));
            return (
              <div key={item.label}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm",
                    groupActive ? "text-gold-300" : "text-parchment-100/70"
                  )}
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.5} />
                  {item.label}
                </div>
                <div className="ml-7 space-y-0.5 border-l border-parchment-100/10 pl-3">
                  {item.children.map((child) => {
                    const active = pathname === child.href || pathname?.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-sm px-3 py-1.5 text-xs transition-colors",
                          active
                            ? "bg-parchment-100/10 text-gold-300"
                            : "text-parchment-100/60 hover:bg-parchment-100/5 hover:text-parchment-100"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-parchment-100/10 text-gold-300"
                  : "text-parchment-100/70 hover:bg-parchment-100/5 hover:text-parchment-100"
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-parchment-100/10 px-6 py-5">
        <p className="truncate text-sm text-parchment-100/90">{user?.name}</p>
        <p className="truncate font-mono text-xs text-parchment-100/50">
          {user?.roles?.[0]?.name ?? "staff"}
        </p>
        <button
          onClick={() => logout()}
          className="mt-3 flex items-center gap-2 text-xs text-parchment-100/60 hover:text-clay-500"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}