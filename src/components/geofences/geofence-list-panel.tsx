"use client";

import { MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { GeofenceFeature } from "@/lib/geofences/geofence-store";

interface GeofenceListPanelProps {
  geofences: GeofenceFeature[];
  onRemove: (id: string) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

export function GeofenceListPanel({
  geofences,
  onRemove,
  onEdit,
  className,
}: GeofenceListPanelProps) {
  if (geofences.length === 0) return null;

  return (
    <ul
      className={cn("flex flex-col gap-0 overflow-y-auto", className)}
      role="list"
    >
      {geofences.map((feature) => {
        const { id, name, address } = feature.properties ?? {};
        if (!id) return null;
        return (
          <li
            key={id}
            className="flex items-start gap-2 border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <span className="truncate text-sm font-medium text-foreground">
                {name}
              </span>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {address ?? "—"}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
                <MoreVertical className="size-4" aria-hidden />
                <span className="sr-only">Actions for {name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(id)}>
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onRemove(id)}
                >
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        );
      })}
    </ul>
  );
}
