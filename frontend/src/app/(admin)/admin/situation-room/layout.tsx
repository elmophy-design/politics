"use client";

/**
 * Situation Room uses its own full-viewport dark shell.
 * Skip the standard admin max-w-6xl / parchment wrapper so charts
 * and the command centre render edge-to-edge.
 */
export default function SituationRoomLayout({ children }: { children: import("react").ReactNode }) {
  return <>{children}</>;
}
