import { describe, expect, it } from "vitest";

import type { CampaignWorkflow } from "./types";
import {
  mapWorkflowNodesToSequenceCanvas,
  workflowGraphSignature,
} from "./workflow-canvas-view";

const goal = {
  id: "goal-1",
  label: "Booked",
  successEvent: "booked-appointment" as const,
  stopOnGoal: true,
};

const baseWorkflow: CampaignWorkflow = {
  entryNodeId: "node-entry",
  goalNodeId: "node-goal",
  nodes: [
    { id: "node-entry", type: "entry", label: "Campaign starts" },
    {
      id: "node-goal",
      type: "goal",
      label: "Booked",
      goal,
    },
  ],
  edges: [
    { id: "e1", from: "node-entry", to: "node-goal" },
  ],
};

describe("mapWorkflowNodesToSequenceCanvas", () => {
  it("maps entry to Trigger + emerald", () => {
    const mapped = mapWorkflowNodesToSequenceCanvas(baseWorkflow);
    const entry = mapped.find((n) => n.id === "node-entry");
    expect(entry?.typeLabel).toBe("Trigger");
    expect(entry?.colorKey).toBe("emerald");
  });

  it("maps goal to Goal + purple", () => {
    const mapped = mapWorkflowNodesToSequenceCanvas(baseWorkflow);
    const g = mapped.find((n) => n.id === "node-goal");
    expect(g?.typeLabel).toBe("Goal");
    expect(g?.colorKey).toBe("purple");
  });

  it("maps condition to Condition + amber", () => {
    const wf: CampaignWorkflow = {
      ...baseWorkflow,
      nodes: [
        ...baseWorkflow.nodes,
        {
          id: "node-condition-x",
          type: "condition",
          label: "If replied",
          description: "Branch",
        },
      ],
      edges: baseWorkflow.edges,
    };
    const mapped = mapWorkflowNodesToSequenceCanvas(wf);
    const c = mapped.find((n) => n.id === "node-condition-x");
    expect(c?.typeLabel).toBe("Condition");
    expect(c?.colorKey).toBe("amber");
  });
});

describe("workflowGraphSignature", () => {
  it("changes when node ids change", () => {
    const a = workflowGraphSignature(baseWorkflow);
    const wf2: CampaignWorkflow = {
      ...baseWorkflow,
      nodes: [
        ...baseWorkflow.nodes,
        { id: "node-extra", type: "message", label: "M1", messageIndex: 0 },
      ],
    };
    const b = workflowGraphSignature(wf2);
    expect(a).not.toBe(b);
  });
});
