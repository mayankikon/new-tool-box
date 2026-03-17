"use client";

import { Hand, Circle, Undo2, Redo2, RotateCcw, Pentagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GeofenceDrawTool = "polygon" | "circle" | "pan";

interface GeofenceDrawingToolbarProps {
  activeTool: GeofenceDrawTool;
  onToolChange: (tool: GeofenceDrawTool) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onReset?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  hasShape?: boolean;
  className?: string;
}

export function GeofenceDrawingToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onReset,
  canUndo = false,
  canRedo = false,
  hasShape = false,
  className,
}: GeofenceDrawingToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-md border border-border bg-card/95 p-1.5",
        className
      )}
      role="toolbar"
      aria-label="Drawing tools"
    >
      <Button
        type="button"
        variant={activeTool === "polygon" ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => onToolChange("polygon")}
        aria-pressed={activeTool === "polygon"}
        aria-label="Draw polygon"
        title="Draw polygon"
      >
        <Pentagon className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant={activeTool === "circle" ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => onToolChange("circle")}
        aria-pressed={activeTool === "circle"}
        aria-label="Draw circle"
        title="Draw circle"
      >
        <Circle className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant={activeTool === "pan" ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => onToolChange("pan")}
        aria-pressed={activeTool === "pan"}
        aria-label="Pan map"
        title="Pan map"
      >
        <Hand className="size-3.5" />
      </Button>

      <div className="mx-1 h-6 w-px shrink-0 bg-border/60" aria-hidden />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo"
        title="Undo"
      >
        <Undo2 className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Redo"
        title="Redo"
      >
        <Redo2 className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onReset}
        disabled={!hasShape}
        aria-label="Reset"
        title="Reset"
      >
        <RotateCcw className="size-3.5" />
      </Button>
    </div>
  );
}
