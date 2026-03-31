/**
 * VFD (vacuum fluorescent display) style — vintage 1980s green glow.
 */
export const DASHBOARD_LED_CAPSULE_LOOK_IDS = ["vfd"] as const;

export type DashboardLedCapsuleLook = (typeof DASHBOARD_LED_CAPSULE_LOOK_IDS)[number];

/** Fragment shader uniform `u_look` (float index). */
export const DASHBOARD_LED_CAPSULE_LOOK_INDEX: Record<DashboardLedCapsuleLook, number> = {
  vfd: 0,
};
