import type { LucideIcon } from "lucide-react";
import {
  CircleDot,
  Flag,
  GitBranch,
  MessageSquare,
  TicketPercent,
  Timer,
} from "lucide-react";

import type { CampaignWorkflow, WorkflowNode as DomainWorkflowNode } from "./types";

export type SequenceCanvasColorKey = "emerald" | "blue" | "amber" | "purple" | "indigo";

export interface SequenceCanvasNode {
  id: string;
  title: string;
  description: string;
  typeLabel: string;
  colorKey: SequenceCanvasColorKey;
  icon: LucideIcon;
}

/**
 * Stable signature when node ids change (add/remove rules → new graph).
 */
export function workflowGraphSignature(workflow: CampaignWorkflow): string {
  return workflow.nodes
    .map((n) => n.id)
    .sort()
    .join("|");
}

export function mapWorkflowNodesToSequenceCanvas(workflow: CampaignWorkflow): SequenceCanvasNode[] {
  return workflow.nodes.map((node) => mapDomainNodeToCanvas(node));
}

function mapDomainNodeToCanvas(node: DomainWorkflowNode): SequenceCanvasNode {
  const description = node.description ?? "";
  switch (node.type) {
    case "entry":
      return {
        id: node.id,
        title: node.label,
        description,
        typeLabel: "Trigger",
        colorKey: "emerald",
        icon: CircleDot,
      };
    case "message":
      return {
        id: node.id,
        title: node.label,
        description,
        typeLabel: "Action",
        colorKey: "blue",
        icon: MessageSquare,
      };
    case "wait":
      return {
        id: node.id,
        title: node.label,
        description,
        typeLabel: "Wait",
        colorKey: "indigo",
        icon: Timer,
      };
    case "condition":
      return {
        id: node.id,
        title: node.label,
        description,
        typeLabel: "Condition",
        colorKey: "amber",
        icon: GitBranch,
      };
    case "offer":
      return {
        id: node.id,
        title: node.label,
        description,
        typeLabel: "Offer",
        colorKey: "emerald",
        icon: TicketPercent,
      };
    case "goal":
      return {
        id: node.id,
        title: node.label,
        description,
        typeLabel: "Goal",
        colorKey: "purple",
        icon: Flag,
      };
    default:
      return {
        id: node.id,
        title: node.label,
        description,
        typeLabel: "Step",
        colorKey: "blue",
        icon: MessageSquare,
      };
  }
}
