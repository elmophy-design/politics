"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Layout/Sidebar";
import { useAuth } from "@/lib/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Live Situation Room is a full-viewport command centre — no parchment shell / max-width.
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

  // Full-bleed for live command centre (it draws its own sidebar + dark UI)
  if (isLiveSituationRoom) {
    return <div className="min-h-screen bg-[#060d1a]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-parchment-100">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-10">{children}</div>
      </div>
    </div>
  );
}
