import type { CampaignWorkflow } from "./types";

/** Canvas node dimensions (aligned with workflow block UI). */
export const WORKFLOW_LAYOUT_NODE_WIDTH = 200;
export const WORKFLOW_LAYOUT_NODE_HEIGHT = 100;
const H_GAP = 100;
const V_GAP = 48;

/**
 * Deterministic layered layout: longest-path layering from the entry node.
 * Positions are top-left of each node box in canvas coordinates.
 */
export function layoutWorkflowNodes(workflow: CampaignWorkflow): Record<string, { x: number; y: number }> {
  const { nodes, edges, entryNodeId } = workflow;
  const idSet = new Set(nodes.map((n) => n.id));
  const layer = new Map<string, number>();

  for (const n of nodes) {
    layer.set(n.id, n.id === entryNodeId ? 0 : -1);
  }

  if (!idSet.has(entryNodeId)) {
    const positions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n, i) => {
      positions[n.id] = { x: 0, y: i * (WORKFLOW_LAYOUT_NODE_HEIGHT + V_GAP) };
    });
    return positions;
  }

  layer.set(entryNodeId, 0);

  for (let pass = 0; pass < Math.max(1, nodes.length); pass++) {
    for (const e of edges) {
      if (!idSet.has(e.from) || !idSet.has(e.to)) continue;
      const fromL = layer.get(e.from) ?? -1;
      if (fromL < 0) continue;
      const next = fromL + 1;
      const toL = layer.get(e.to) ?? -1;
      if (next > toL) {
        layer.set(e.to, next);
      }
    }
  }

  for (const n of nodes) {
    if ((layer.get(n.id) ?? -1) < 0) {
      layer.set(n.id, 0);
    }
  }

  const byLayer = new Map<number, string[]>();
  for (const n of nodes) {
    const l = Math.max(0, layer.get(n.id) ?? 0);
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(n.id);
  }

  for (const [, ids] of byLayer) {
    ids.sort((a, b) => a.localeCompare(b));
  }

  const positions: Record<string, { x: number; y: number }> = {};
  const sortedLayers = Array.from(byLayer.keys()).sort((a, b) => a - b);
  for (const l of sortedLayers) {
    const ids = byLayer.get(l)!;
    const x = l * (WORKFLOW_LAYOUT_NODE_WIDTH + H_GAP);
    ids.forEach((id, row) => {
      positions[id] = { x, y: row * (WORKFLOW_LAYOUT_NODE_HEIGHT + V_GAP) };
    });
  }

  return positions;
}

/**
 * Merge auto-layout with user-saved positions. Saved positions win when the node still exists.
 */
export function mergeWorkflowLayout(
  workflow: CampaignWorkflow,
  saved: Record<string, { x: number; y: number }> | undefined,
): Record<string, { x: number; y: number }> {
  const auto = layoutWorkflowNodes(workflow);
  if (!saved || Object.keys(saved).length === 0) {
    return auto;
  }
  const ids = new Set(workflow.nodes.map((n) => n.id));
  const merged = { ...auto };
  for (const [id, pos] of Object.entries(saved)) {
    if (ids.has(id)) {
      merged[id] = pos;
    }
  }
  return merged;
}
