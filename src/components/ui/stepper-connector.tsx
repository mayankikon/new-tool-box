import { cn } from "@/lib/utils"

interface StepperConnectorProps extends React.ComponentProps<"div"> {
  orientation?: "vertical" | "horizontal"
  isCompleted?: boolean
}

function StepperConnector({
  className,
  orientation = "vertical",
  isCompleted = false,
  ...props
}: StepperConnectorProps) {
  return (
    <div
      data-slot="stepper-connector"
      data-orientation={orientation}
      aria-hidden="true"
      className={cn(
        "transition-colors",
        isCompleted
          ? "bg-primary"
          : "bg-[var(--theme-stroke-default)]",
        orientation === "vertical"
          ? "w-px flex-1 min-h-4 self-center"
          : "h-px flex-1 min-w-4 self-center",
        className
      )}
      {...props}
    />
  )
}

export { StepperConnector }
export type { StepperConnectorProps }
