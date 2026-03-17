"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function EmptyState({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state"
      className={cn("flex flex-col items-center gap-3 text-center", className)}
      {...props}
    />
  );
}

function EmptyStateIcon({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="empty-state-icon" className={cn("shrink-0", className)} {...props} />;
}

function EmptyStateContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="empty-state-content" className={cn("space-y-1", className)} {...props} />;
}

function EmptyStateTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="empty-state-title" className={cn("font-medium", className)} {...props} />;
}

function EmptyStateDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-state-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function EmptyStateActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-actions"
      className={cn("flex flex-wrap justify-center gap-2 pt-1", className)}
      {...props}
    />
  );
}

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateContent,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
};
