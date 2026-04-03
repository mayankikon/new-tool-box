import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronsLeft } from "lucide-react";
import {
  VehicleListItem,
  type VehicleListItemProps,
} from "@/components/ui/vehicle-list-item";

/* ─── Vehicle list panel header ─── */

interface VehicleListPanelHeaderProps extends React.ComponentProps<"div"> {
  vehicleCount: number;
  onCollapse?: () => void;
  rightContent?: React.ReactNode;
}

function VehicleListCountBar({
  vehicleCount,
  onCollapse,
  rightContent,
  className,
  ...props
}: VehicleListPanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-10 shrink-0 items-center justify-between border-b border-border bg-sidebar px-4",
        className
      )}
      {...props}
    >
      <span className="text-sm font-medium leading-5 text-muted-foreground">
        Showing {vehicleCount} vehicle{vehicleCount !== 1 ? "s" : ""}
      </span>
      {(rightContent || onCollapse) && (
        <div className="flex items-center gap-3">
          {rightContent}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="flex size-4 items-center justify-center text-muted-foreground/60 transition-colors hover:text-foreground"
              aria-label="Collapse panel"
            >
              <ChevronsLeft className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function VehicleListPanelHeader(props: VehicleListPanelHeaderProps) {
  return <VehicleListCountBar {...props} />;
}

/* ─── Vehicle list panel ─── */

/** Row data for the panel (avoid Omit<div> — `title` would be stripped as an HTML attribute). */
export type VehicleListPanelRow = Pick<
  VehicleListItemProps,
  "title" | "stockNumber" | "vin" | "price" | "mileage" | "stockType" | "statusIcons" | "imageSrc" | "imageAlt"
>;

interface VehicleListPanelProps extends React.ComponentProps<"div"> {
  vehicles: VehicleListPanelRow[];
  onCollapse?: () => void;
  onVehicleClick?: (vehicle: VehicleListPanelRow) => void;
  /** Replaces the default “Showing N vehicles” header row. */
  listHeader?: React.ReactNode;
  /** Shown when `vehicles` is empty (e.g. filtered similar matches). */
  emptyState?: React.ReactNode;
}

function VehicleListPanel({
  vehicles,
  onCollapse,
  onVehicleClick,
  listHeader,
  emptyState,
  className,
  ...props
}: VehicleListPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-border bg-sidebar",
        className
      )}
      {...props}
    >
      {listHeader ?? (
        <VehicleListPanelHeader
          vehicleCount={vehicles.length}
          onCollapse={onCollapse}
        />
      )}
      <div className="flex-1 overflow-y-auto">
        {vehicles.length === 0 && emptyState ? (
          emptyState
        ) : (
          vehicles.map((vehicle, index) => (
            <VehicleListItem
              key={vehicle.vin ?? index}
              {...vehicle}
              onClick={onVehicleClick ? () => onVehicleClick(vehicle) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}

export { VehicleListCountBar, VehicleListPanel, VehicleListPanelHeader };
export type { VehicleListPanelProps, VehicleListPanelHeaderProps };
