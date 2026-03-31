import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inlineTipVariants = cva(
  "flex items-center gap-3 overflow-hidden rounded-sm border px-3 py-2.5 text-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]",
  {
    variants: {
      variant: {
        default:
          "border-border bg-(--inline-tip-default-bg)",
        info: "border-transparent bg-(--inline-tip-info-bg)",
        success:
          "border-transparent bg-(--inline-tip-success-bg)",
        warning:
          "border-transparent bg-(--inline-tip-warning-bg)",
        error:
          "border-transparent bg-(--inline-tip-error-bg)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const indicatorVariants = cva("w-1 shrink-0 self-stretch rounded-full", {
  variants: {
    variant: {
      default: "bg-(--inline-tip-default-accent)",
      info: "bg-(--inline-tip-info-accent)",
      success: "bg-(--inline-tip-success-accent)",
      warning: "bg-(--inline-tip-warning-accent)",
      error: "bg-(--inline-tip-error-accent)",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const titleVariants = cva("font-bold", {
  variants: {
    variant: {
      default: "text-(--inline-tip-default-title)",
      info: "text-(--inline-tip-info-title)",
      success: "text-(--inline-tip-success-title)",
      warning: "text-(--inline-tip-warning-title)",
      error: "text-(--inline-tip-error-title)",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const VARIANT_TITLES: Record<NonNullable<InlineTipProps["variant"]>, string> = {
  default: "Pro Tip:",
  info: "Info:",
  success: "Success:",
  warning: "Warning:",
  error: "Error:",
}

interface InlineTipProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof inlineTipVariants> {
  title?: string
}

function InlineTip({
  className,
  variant = "default",
  title,
  children,
  ...props
}: InlineTipProps) {
  const displayTitle = title ?? VARIANT_TITLES[variant!]

  return (
    <div
      data-slot="inline-tip"
      className={cn(inlineTipVariants({ variant, className }))}
      role="status"
      {...props}
    >
      <div className="flex items-center self-stretch py-1">
        <div className={cn(indicatorVariants({ variant }))} />
      </div>
      <p className="min-w-0 flex-1 leading-5 text-(--theme-text-secondary)">
        <span className={cn(titleVariants({ variant }))}>{displayTitle}</span>{" "}
        {children}
      </p>
    </div>
  )
}

export { InlineTip, inlineTipVariants, type InlineTipProps }
