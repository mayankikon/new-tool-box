"use client";

import { Agentation } from "agentation";

/**
 * Renders the Agentation dev overlay only in development.
 * NODE_ENV is set at build time so this is tree-shaken in production.
 */
export function AgentationDev() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Agentation />;
}
