"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Layout/Sidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { AdminThemeProvider, useAdminTheme } from "@/lib/context/AdminThemeContext";
import { cn } from "@/lib/utils/cn";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useAdminTheme();

  const isLiveSituationRoom = pathname === "/admin/situation-room";

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment-100">
        <p className="font-mono text-sm text-graphite-500">Checking session…</p>
      </div>
    );
  }

  // Sidebar is excluded from theme: always the brand dark nav.
  // Dark/light mode applies only to the main content column.
  return (
    <div className="admin-shell flex h-screen overflow-hidden bg-parchment-100">
      <Sidebar />
      <div
        className={cn(
          "admin-content min-h-0 flex-1 overflow-y-auto transition-colors",
          isLiveSituationRoom
            ? "bg-[#060d1a]"
            : isDark
              ? "admin-dark bg-[var(--admin-canvas)] text-[var(--admin-fg)]"
              : "bg-parchment-100"
        )}
      >
        {isLiveSituationRoom ? (
          <div className="min-h-full">{children}</div>
        ) : (
          <div className="mx-auto max-w-6xl px-8 py-10">{children}</div>
        )}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminShell>{children}</AdminShell>
    </AdminThemeProvider>
  );
}
