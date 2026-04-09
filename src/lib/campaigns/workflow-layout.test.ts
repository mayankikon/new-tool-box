import { describe, expect, it } from "vitest";

import type { CampaignWorkflow } from "./types";
import {
  layoutWorkflowNodes,
  mergeWorkflowLayout,
  WORKFLOW_LAYOUT_NODE_WIDTH,
} from "./workflow-layout";

function minimalWorkflow(overrides: Partial<CampaignWorkflow> = {}): CampaignWorkflow {
  return {
    entryNodeId: "node-entry",
    goalNodeId: "node-goal",
    nodes: [
      { id: "node-entry", type: "entry", label: "Start" },
      { id: "node-a", type: "message", label: "Message 1", messageIndex: 0 },
      { id: "node-goal", type: "goal", label: "Goal" },
    ],
    edges: [
      { id: "e1", from: "node-entry", to: "node-a" },
      { id: "e2", from: "node-a", to: "node-goal" },
    ],
    ...overrides,
  };
}

describe("layoutWorkflowNodes", () => {
  it("places entry at layer 0 and increases x along a chain", () => {
    const wf = minimalWorkflow();
    const pos = layoutWorkflowNodes(wf);
    expect(pos["node-entry"]!.x).toBe(0);
    expect(pos["node-a"]!.x).toBeGreaterThan(pos["node-entry"]!.x);
    expect(pos["node-goal"]!.x).toBeGreaterThan(pos["node-a"]!.x);
  });

  it("uses consistent node box dimensions in spacing", () => {
    const wf = minimalWorkflow();
    const pos = layoutWorkflowNodes(wf);
    expect(pos["node-entry"]).toEqual({ x: 0, y: 0 });
    const step = pos["node-a"]!.x - pos["node-entry"]!.x;
    expect(step).toBe(WORKFLOW_LAYOUT_NODE_WIDTH + 100);
  });

  it("assigns parallel branches different rows at the same layer", () => {
    const wf: CampaignWorkflow = {
      entryNodeId: "node-entry",
      goalNodeId: "node-goal",
      nodes: [
        { id: "node-entry", type: "entry", label: "Start" },
        { id: "node-m1", type: "message", label: "M1", messageIndex: 0 },
        { id: "node-b1", type: "condition", label: "B1" },
        { id: "node-b2", type: "condition", label: "B2" },
        { id: "node-goal", type: "goal", label: "Goal" },
      ],
      edges: [
        { id: "e0", from: "node-entry", to: "node-m1" },
        { id: "e1", from: "node-m1", to: "node-b1" },
        { id: "e2", from: "node-m1", to: "node-b2" },
        { id: "e3", from: "node-b1", to: "node-goal" },
        { id: "e4", from: "node-b2", to: "node-goal" },
      ],
    };
    const pos = layoutWorkflowNodes(wf);
    expect(pos["node-b1"]!.x).toBe(pos["node-b2"]!.x);
    expect(pos["node-b1"]!.y).not.toBe(pos["node-b2"]!.y);
  });
});

describe("mergeWorkflowLayout", () => {
  it("overrides auto positions for saved node ids", () => {
    const wf = minimalWorkflow();
    const auto = layoutWorkflowNodes(wf);
    const merged = mergeWorkflowLayout(wf, { "node-a": { x: 999, y: 42 } });
    expect(merged["node-a"]).toEqual({ x: 999, y: 42 });
    expect(merged["node-entry"]).toEqual(auto["node-entry"]);
  });

  it("ignores saved keys for nodes that no longer exist", () => {
    const wf = minimalWorkflow();
    const merged = mergeWorkflowLayout(wf, { "ghost": { x: 1, y: 2 } });
    expect(merged["ghost"]).toBeUndefined();
  });
});
