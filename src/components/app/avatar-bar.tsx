"use client";

import { CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface AvatarBarProps {
  /** Right-aligned slot (e.g. account menu, notifications, avatar). */
  children?: React.ReactNode;
  className?: string;
}

/**
 * 64px strip at the top of the main column (right of the sidebar), above the page `TitleBar`.
 * Uses `bg-sidebar` so the chrome matches the left nav. Use for global account / avatar affordances.
 */
export function AvatarBar({ children, className }: AvatarBarProps) {
  return (
    <div
      className={cn(
        "flex h-16 shrink-0 items-center justify-end border-b border-border bg-sidebar px-8",
        className
      )}
      role="region"
      aria-label="Avatar bar"
    >
      {children}
    </div>
  );
}

function deriveInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export interface AvatarBarShiftActionsProps {
  /** Primary label for the help control (Shift 2.0 Sort UI). */
  helpLabel?: string;
  onHelpClick?: () => void;
  displayName: string;
  role: string;
  /** Overrides auto-initials from `displayName`. */
  initials?: string;
  avatarSrc?: string;
  className?: string;
}

/**
 * Right-side cluster from Shift 2.0 Sort UI: dashed pill **Help** + **account** (32px avatar, name, role).
 */
export function AvatarBarShiftActions({
  helpLabel = "Help",
  onHelpClick,
  displayName,
  role,
  initials,
  avatarSrc,
  className,
}: AvatarBarShiftActionsProps) {
  const resolvedInitials = initials?.trim() || deriveInitials(displayName);

  return (
    <div
      className={cn("flex min-w-0 items-center justify-end gap-4", className)}
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="rounded-full border-dashed"
        leadingIcon={<CircleHelp className="size-4" aria-hidden />}
        onClick={onHelpClick}
      >
        {helpLabel}
      </Button>

      <div className="flex min-w-0 items-center gap-2">
        <Avatar className="size-8 shrink-0">
          {avatarSrc ? (
            <AvatarImage src={avatarSrc} alt="" />
          ) : null}
          <AvatarFallback className="bg-zinc-500 text-xs font-medium text-white dark:bg-zinc-600">
            {resolvedInitials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex flex-col items-start justify-center text-left">
          <span className="w-full truncate text-sm font-medium leading-5 text-foreground">
            {displayName}
          </span>
          <span className="w-full truncate text-xs leading-4 text-muted-foreground">
            {role}
          </span>
        </div>
      </div>
    </div>
  );
}
