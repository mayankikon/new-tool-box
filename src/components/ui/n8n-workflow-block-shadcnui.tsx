"use client";

import { motion, type PanInfo } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowRight, ChevronDown, MessageSquareQuote, Plus, TicketPercent } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CampaignWorkflow, WorkflowEdge } from "@/lib/campaigns/types";
import { mapWorkflowNodesToSequenceCanvas, type SequenceCanvasNode } from "@/lib/campaigns/workflow-canvas-view";
import {
  WORKFLOW_LAYOUT_NODE_HEIGHT,
  WORKFLOW_LAYOUT_NODE_WIDTH,
} from "@/lib/campaigns/workflow-layout";
import { cn } from "@/lib/utils";

const NODE_WIDTH = WORKFLOW_LAYOUT_NODE_WIDTH;
const NODE_HEIGHT = WORKFLOW_LAYOUT_NODE_HEIGHT;

const colorClasses: Record<SequenceCanvasNode["colorKey"], string> = {
  emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
  blue: "border-blue-400/40 bg-blue-400/10 text-blue-400",
  amber: "border-amber-400/40 bg-amber-400/10 text-amber-400",
  purple: "border-purple-400/40 bg-purple-400/10 text-purple-400",
  indigo: "border-indigo-400/40 bg-indigo-400/10 text-indigo-400",
};

function WorkflowConnectionLine({
  edge,
  layout,
}: {
  edge: WorkflowEdge;
  layout: Record<string, { x: number; y: number }>;
}) {
  const fromPos = layout[edge.from] ?? { x: 0, y: 0 };
  const toPos = layout[edge.to] ?? { x: 0, y: 0 };

  const startX = fromPos.x + NODE_WIDTH;
  const startY = fromPos.y + NODE_HEIGHT / 2;
  const endX = toPos.x;
  const endY = toPos.y + NODE_HEIGHT / 2;

  const cp1X = startX + (endX - startX) * 0.5;
  const cp2X = endX - (endX - startX) * 0.5;

  const path = `M${startX},${startY} C${cp1X},${startY} ${cp2X},${endY} ${endX},${endY}`;

  return (
    <path
      d={path}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeDasharray="8,6"
      strokeLinecap="round"
      opacity={0.35}
      className="text-foreground"
    />
  );
}

export interface N8nWorkflowBlockProps {
  workflow: CampaignWorkflow;
  layout: Record<string, { x: number; y: number }>;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onLayoutChange?: (next: Record<string, { x: number; y: number }>) => void;
  readOnly?: boolean;
  headerTitle?: string;
  onAddResponseRule?: () => void;
  onAddNoResponseRule?: () => void;
  onAddOfferEscalation?: () => void;
}

export function N8nWorkflowBlock({
  workflow,
  layout,
  selectedNodeId,
  onSelectNode,
  onLayoutChange,
  readOnly = false,
  headerTitle = "Workflow Builder",
  onAddResponseRule,
  onAddNoResponseRule,
  onAddOfferEscalation,
}: N8nWorkflowBlockProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null);
  const activeDragNodeIdRef = useRef<string | null>(null);
  const positionsRef = useRef<Record<string, { x: number; y: number }>>({ ...layout });

  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number }>>(
    () => ({ ...layout }),
  );
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const visualNodes = useMemo(() => mapWorkflowNodesToSequenceCanvas(workflow), [workflow]);

  const contentSize = useMemo(
    () => computeContentSize(workflow, localPositions),
    [workflow, localPositions],
  );

  useEffect(() => {
    positionsRef.current = localPositions;
  }, [localPositions]);

  const handleDragStart = (nodeId: string) => {
    activeDragNodeIdRef.current = nodeId;
    setDraggingNodeId(nodeId);
    const pos = localPositions[nodeId];
    if (pos) {
      dragStartPosition.current = { x: pos.x, y: pos.y };
    }
  };

  const handleDrag = (nodeId: string, { offset }: PanInfo) => {
    if (activeDragNodeIdRef.current !== nodeId || !dragStartPosition.current) return;

    const newX = Math.max(0, dragStartPosition.current.x + offset.x);
    const newY = Math.max(0, dragStartPosition.current.y + offset.y);

    flushSync(() => {
      setLocalPositions((prev) => {
        const next = {
          ...prev,
          [nodeId]: { x: newX, y: newY },
        };
        positionsRef.current = next;
        return next;
      });
    });
  };

  const handleDragEnd = () => {
    activeDragNodeIdRef.current = null;
    setDraggingNodeId(null);
    dragStartPosition.current = null;
    onLayoutChange?.(positionsRef.current);
  };

  const canDrag = !readOnly && Boolean(onLayoutChange);

  const showAddMenu = Boolean(
    onAddResponseRule || onAddNoResponseRule || onAddOfferEscalation,
  );

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/40 bg-background/60 backdrop-blur p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="rounded-full border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400"
          >
            Active
          </Badge>
          <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-foreground/50">
            {headerTitle}
          </span>
        </div>
        {showAddMenu ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-xs font-medium uppercase tracking-[0.2em] text-foreground/70 shadow-xs outline-none hover:bg-accent hover:text-foreground sm:px-3",
              )}
              aria-label="Add step"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Add node</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[14rem]">
              {onAddResponseRule ? (
                <DropdownMenuItem
                  onClick={() => {
                    onAddResponseRule();
                  }}
                >
                  <Plus className="size-3.5" />
                  Response rule
                </DropdownMenuItem>
              ) : null}
              {onAddNoResponseRule ? (
                <DropdownMenuItem
                  onClick={() => {
                    onAddNoResponseRule();
                  }}
                >
                  <MessageSquareQuote className="size-3.5" />
                  No-response rule
                </DropdownMenuItem>
              ) : null}
              {onAddOfferEscalation ? (
                <DropdownMenuItem
                  onClick={() => {
                    onAddOfferEscalation();
                  }}
                >
                  <TicketPercent className="size-3.5" />
                  Offer escalation
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <div
        ref={canvasRef}
        className="relative h-[400px] w-full overflow-auto rounded-xl border border-border/30 bg-background/40 sm:h-[500px] md:h-[600px]"
        style={{ minHeight: "400px" }}
        role="region"
        aria-label="Workflow canvas"
        tabIndex={0}
        onClick={() => onSelectNode(null)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onSelectNode(null);
        }}
      >
        <div
          className="relative"
          style={{
            minWidth: contentSize.width,
            minHeight: contentSize.height,
          }}
        >
          <svg
            className="pointer-events-none absolute top-0 left-0"
            width={contentSize.width}
            height={contentSize.height}
            style={{ overflow: "visible" }}
            aria-hidden="true"
          >
            {workflow.edges.map((edge) => (
              <WorkflowConnectionLine key={edge.id} edge={edge} layout={localPositions} />
            ))}
          </svg>

          {visualNodes.map((v) => {
            const pos = localPositions[v.id] ?? { x: 0, y: 0 };
            const Icon = v.icon;
            const cc = colorClasses[v.colorKey];
            const isDragging = draggingNodeId === v.id;
            const isSelected = selectedNodeId === v.id;

            return (
              <motion.div
                key={v.id}
                drag={canDrag}
                dragMomentum={false}
                dragConstraints={{ left: 0, top: 0, right: 100000, bottom: 100000 }}
                onDragStart={() => handleDragStart(v.id)}
                onDrag={(_, info) => handleDrag(v.id, info)}
                onDragEnd={handleDragEnd}
                style={{
                  x: pos.x,
                  y: pos.y,
                  width: NODE_WIDTH,
                  transformOrigin: "0 0",
                }}
                className="absolute cursor-grab"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: canDrag ? 1.02 : 1.01 }}
                whileDrag={{ scale: 1.05, zIndex: 50, cursor: "grabbing" }}
                aria-grabbed={isDragging}
              >
                <Card
                  className={cn(
                    "group/node relative w-full overflow-hidden rounded-xl border bg-background/70 p-3 backdrop-blur transition-all hover:shadow-lg",
                    cc,
                    isSelected && "ring-2 ring-primary/60",
                    isDragging && "shadow-xl ring-2 ring-primary/50",
                  )}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${v.typeLabel} node: ${v.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNode(v.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectNode(v.id);
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/node:opacity-100" />

                  <div className="relative space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background/80 backdrop-blur",
                          cc,
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Badge
                          variant="outline"
                          className="mb-0.5 rounded-full border-border/40 bg-background/80 px-1.5 py-0 text-[9px] uppercase tracking-[0.15em] text-foreground/60"
                        >
                          {v.typeLabel}
                        </Badge>
                        <h3 className="truncate text-xs font-semibold tracking-tight text-foreground">
                          {v.title}
                        </h3>
                      </div>
                    </div>
                    {v.description ? (
                      <p className="line-clamp-2 text-[10px] leading-relaxed text-foreground/70">
                        {v.description}
                      </p>
                    ) : null}
                    <div className="flex items-center gap-1.5 text-[10px] text-foreground/50">
                      <ArrowRight className="h-2.5 w-2.5" aria-hidden="true" />
                      <span className="uppercase tracking-[0.1em]">Connected</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div
        className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/30 bg-background/40 px-4 py-2.5 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/60">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="uppercase tracking-[0.15em]">
              {visualNodes.length} {visualNodes.length === 1 ? "Node" : "Nodes"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            <span className="uppercase tracking-[0.15em]">
              {workflow.edges.length}{" "}
              {workflow.edges.length === 1 ? "Connection" : "Connections"}
            </span>
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">
          Drag nodes to reposition
        </p>
      </div>
    </div>
  );
}

function computeContentSize(
  workflow: CampaignWorkflow,
  positions: Record<string, { x: number; y: number }>,
): { width: number; height: number } {
  let maxX = NODE_WIDTH + 50;
  let maxY = NODE_HEIGHT + 50;
  for (const node of workflow.nodes) {
    const pos = positions[node.id] ?? { x: 0, y: 0 };
    maxX = Math.max(maxX, pos.x + NODE_WIDTH + 50);
    maxY = Math.max(maxY, pos.y + NODE_HEIGHT + 50);
  }
  return { width: maxX, height: maxY };
}
