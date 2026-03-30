"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none active:scale-[0.98] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] active:bg-[var(--primary-hover)]",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground active:bg-muted active:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 dark:active:bg-input/50",
        secondary:
          "border border-[#DADADB] bg-white text-foreground hover:border-[#CACACB] hover:bg-zinc-50 active:border-[#CACACB] active:bg-zinc-100 aria-expanded:border-[#CACACB] aria-expanded:bg-zinc-50 aria-expanded:text-foreground dark:border-border dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-[var(--theme-background-button-secondary-hover)] dark:active:bg-[var(--theme-background-button-secondary-hover)] dark:aria-expanded:bg-[var(--theme-background-button-secondary-hover)]",
        dashed:
          "border border-dashed border-border bg-background hover:bg-muted hover:text-foreground hover:border-border active:bg-muted active:text-foreground dark:border-input dark:bg-transparent dark:hover:bg-input/30 dark:active:bg-input/50",
        soft:
          "bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/20 focus-visible:border-primary/40 focus-visible:ring-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 dark:active:bg-primary/30",
        ghost:
          "hover:bg-muted hover:text-foreground active:bg-muted active:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 dark:active:bg-muted/50",
        muted:
          "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted active:text-foreground dark:hover:bg-muted/50 dark:active:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 active:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:active:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline active:underline",
      },
      size: {
        "2xs":
          "h-6 gap-1 rounded-[min(var(--radius-xs),6px)] px-2 text-xs in-data-[slot=button-group]:rounded-sm has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        xs: "h-7 gap-1 rounded-[min(var(--radius-xs),6px)] px-2 text-xs in-data-[slot=button-group]:rounded-sm has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-[min(var(--radius-xs),8px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-sm has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        default:
          "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        md: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        /** Shift 2.0 top nav: 36px height, 8px vertical / 12px horizontal padding, 14px medium text, 16px icon, 6px gap */
        header:
          "h-9 min-h-[36px] gap-1.5 py-2 px-3 text-sm font-medium has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-10 gap-1.5 px-3 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        xl: "h-12 gap-2 px-4 text-base has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-9 in-data-[slot=button-group]:rounded-sm",
        "icon-2xs":
          "size-6 rounded-[min(var(--radius-xs),6px)] in-data-[slot=button-group]:rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-xs":
          "size-7 rounded-[min(var(--radius-xs),6px)] in-data-[slot=button-group]:rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-xs),8px)] in-data-[slot=button-group]:rounded-sm [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 in-data-[slot=button-group]:rounded-sm [&_svg:not([class*='size-'])]:size-4",
        "icon-xl": "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends Omit<ButtonPrimitive.Props, "children">,
    VariantProps<typeof buttonVariants> {
  /** Leading icon slot; rendered with data-icon=inline-start for padding. */
  leadingIcon?: ReactNode
  /** Trailing icon slot; rendered with data-icon=inline-end for padding. */
  trailingIcon?: ReactNode
  /** Optional badge (e.g. count or "NEW"); rendered after label when children present. */
  badge?: ReactNode
  /** When true, shows spinner and disables interaction; hides leading/trailing icons. */
  loading?: boolean
  children?: ReactNode
}

function Button({
  className,
  variant = "default",
  size = "default",
  leadingIcon,
  trailingIcon,
  badge,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <ButtonPrimitive
      data-slot="button"
      aria-busy={loading || undefined}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin shrink-0" aria-hidden />
      ) : (
        <>
          {leadingIcon ? (
            <span data-icon="inline-start" className="contents">
              {leadingIcon}
            </span>
          ) : null}
          {children != null && children !== "" ? (
            <>
              {children}
              {badge ?? null}
            </>
          ) : null}
          {trailingIcon ? (
            <span data-icon="inline-end" className="contents">
              {trailingIcon}
            </span>
          ) : null}
        </>
      )}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
