"use client";

import { cn } from "@/lib/utils";

interface FluidShellPilotFrameProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FluidShellPilotFrame({
  sidebar,
  children,
  className,
}: FluidShellPilotFrameProps) {
  return (
    <div className={cn("fluid-shell-pilot-root", className)}>
      <div className="fluid-shell-pilot-surface">
        <div className="fluid-shell-pilot-sidebar">{sidebar}</div>
        <div className="fluid-shell-pilot-content">{children}</div>
      </div>
    </div>
  );
}
