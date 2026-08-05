"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AdminThemeMode = "light" | "dark";

const STORAGE_KEY = "le_admin_theme";

type AdminThemeContextValue = {
  mode: AdminThemeMode;
  isDark: boolean;
  setMode: (mode: AdminThemeMode) => void;
  toggle: () => void;
};

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

function readStored(): AdminThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  return "light";
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AdminThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setModeState(readStored());
    setReady(true);
  }, []);

  const setMode = useCallback((next: AdminThemeMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const value = useMemo(
    () => ({ mode, isDark: mode === "dark", setMode, toggle }),
    [mode, setMode, toggle]
  );

  // Avoid flash: don't render children until we know stored preference
  // (admin is client-only gated by auth anyway)
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment-100">
        <p className="font-mono text-sm text-graphite-500">Loading…</p>
      </div>
    );
  }

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return ctx;
}
