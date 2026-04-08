"use client";

import dynamic from "next/dynamic";

/**
 * Loads Agentation in a separate chunk so `app/layout` stays small and dev chunk loads
 * are less likely to hit Webpack client timeouts (ChunkLoadError: layout.js).
 */
const Agentation = dynamic(
  () => import("agentation").then((mod) => mod.Agentation),
  { ssr: false, loading: () => null },
);

export function AgentationDevOverlay() {
  return <Agentation />;
}
