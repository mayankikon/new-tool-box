import type { ComponentProps, ReactNode } from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeToneStyles = {
  default:
    "bg-[var(--theme-background-badge-default)] text-[var(--theme-text-secondary)] border-[color:color-mix(in_srgb,var(--theme-stroke-default)_78%,transparent)]",
  gray:
    "bg-[var(--theme-background-badge-gray)] text-[var(--theme-text-secondary)] border-transparent",
  red:
    "bg-[var(--theme-background-badge-red)] text-[#b11e1b] border-transparent dark:text-[#ee6e6c]",
  orange:
    "bg-[var(--theme-background-badge-orange)] text-[#a73b0c] border-transparent dark:text-[#f38f36]",
  amber:
    "bg-[var(--theme-background-badge-amber)] text-[#8a5800] border-transparent dark:text-[#f5bd1e]",
  yellow:
    "bg-[var(--theme-background-badge-yellow)] text-[#816000] border-transparent dark:text-[#f5ca0f]",
  lime:
    "bg-[var(--theme-background-badge-lime)] text-[#587f00] border-transparent dark:text-[#abe435]",
  green:
    "bg-[var(--theme-background-badge-green)] text-[#33803f] border-transparent dark:text-[#66dc7e]",
  emerald:
    "bg-[var(--theme-background-badge-emerald)] text-[#17785f] border-transparent dark:text-[#56d197]",
  teal:
    "bg-[var(--theme-background-badge-teal)] text-[#0f776b] border-transparent dark:text-[#53d2be]",
  cyan:
    "bg-[var(--theme-background-badge-cyan)] text-[#036f91] border-transparent dark:text-[#4ad0ef]",
  sky:
    "bg-[var(--theme-background-badge-sky)] text-[#0f67aa] border-transparent dark:text-[#4db9fa]",
  blue:
    "bg-[var(--theme-background-badge-blue)] text-[#2147dd] border-transparent dark:text-[#65a0fd]",
  indigo:
    "bg-[var(--theme-background-badge-indigo)] text-[#4338ca] border-transparent dark:text-[#7e86fb]",
  violet:
    "bg-[var(--theme-background-badge-violet)] text-[#6d28d9] border-transparent dark:text-[#a185fd]",
  purple:
    "bg-[var(--theme-background-badge-purple)] text-[#7c3aed] border-transparent dark:text-[#b87efe]",
  fuchsia:
    "bg-[var(--theme-background-badge-fuchsia)] text-[#9a15b1] border-transparent dark:text-[#dd72fa]",
  pink:
    "bg-[var(--theme-background-badge-pink)] text-[#b4237b] border-transparent dark:text-[#ea6eb3]",
  rose:
    "bg-[var(--theme-background-badge-rose)] text-[#be123c] border-transparent dark:text-[#f16e81]",
} as const

type BadgeTone = keyof typeof badgeToneStyles

const badgeDotStyles: Record<BadgeTone, string> = {
  default: "bg-[var(--theme-text-tertiary)]",
  gray: "bg-[var(--theme-text-tertiary)]",
  red: "bg-[#ee6e6c]",
  orange: "bg-[#f38f36]",
  amber: "bg-[#f5bd1e]",
  yellow: "bg-[#f5ca0f]",
  lime: "bg-[#abe435]",
  green: "bg-[#66dc7e]",
  emerald: "bg-[#56d197]",
  teal: "bg-[#53d2be]",
  cyan: "bg-[#4ad0ef]",
  sky: "bg-[#4db9fa]",
  blue: "bg-[#3b82f6]",
  indigo: "bg-[#7e86fb]",
  violet: "bg-[#a185fd]",
  purple: "bg-[#b87efe]",
  fuchsia: "bg-[#dd72fa]",
  pink: "bg-[#ea6eb3]",
  rose: "bg-[#f16e81]",
}

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_[data-slot=badge-leading]>svg]:pointer-events-none [&_[data-slot=badge-leading]>svg]:shrink-0 [&_[data-slot=badge-trailing]>svg]:pointer-events-none [&_[data-slot=badge-trailing]>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_92%,black_8%)] dark:hover:bg-[color-mix(in_srgb,var(--primary)_90%,white_10%)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-[color-mix(in_srgb,var(--secondary)_82%,var(--theme-background-hover)_18%)]",
        soft: "",
        destructive:
          "border-transparent bg-[var(--theme-background-badge-red)] text-[#b11e1b] hover:bg-[color-mix(in_srgb,var(--theme-background-badge-red)_88%,rgba(238,110,108,0.16)_12%)] dark:text-[#ee6e6c]",
        outline:
          "bg-[var(--theme-background-badge-default)] text-[var(--theme-text-secondary)] hover:bg-[color-mix(in_srgb,var(--theme-background-badge-default)_90%,var(--theme-background-hover)_10%)]",
        ghost:
          "border-transparent bg-transparent text-[var(--theme-text-secondary)] hover:bg-muted/70 hover:text-foreground",
        link: "border-transparent bg-transparent px-0 text-primary underline-offset-4 hover:underline",
      },
      shape: {
        default: "rounded-[var(--radius-sm)]",
        pill: "rounded-full",
      },
      size: {
        sm: "min-h-5 px-1.5 py-0.5 text-[11px] leading-4 [&_[data-slot=badge-dot]]:size-1.5 [&_[data-slot=badge-leading]>svg]:size-3 [&_[data-slot=badge-trailing]>svg]:size-3",
        md: "min-h-6 px-2 py-1 text-xs leading-4 [&_[data-slot=badge-dot]]:size-2 [&_[data-slot=badge-leading]>svg]:size-3.5 [&_[data-slot=badge-trailing]>svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "default",
      size: "md",
    },
  }
)

function resolveBadgeToneClass(variant: BadgeVariant, tone: BadgeTone) {
  if (variant !== "soft" && tone === "default") {
    return null
  }

  if (variant === "soft") {
    return badgeToneStyles[tone]
  }

  if (variant === "outline" && tone !== "default") {
    return cn(
      "border-[color:color-mix(in_srgb,currentColor_14%,transparent)]",
      badgeToneStyles[tone].replace(/bg-\[[^\]]+\]\s*/, "").replace(/\sborder-transparent/, "")
    )
  }

  if (variant === "ghost" && tone !== "default") {
    return badgeToneStyles[tone]
      .replace(/bg-\[[^\]]+\]\s*/, "")
      .replace(/\sborder-transparent/, "")
  }

  if (variant === "link" && tone !== "default") {
    return badgeToneStyles[tone]
      .replace(/bg-\[[^\]]+\]\s*/, "")
      .replace(/\sborder-transparent/, "")
  }

  return null
}

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

interface BadgeProps
  extends useRender.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  leadingVisual?: ReactNode
  trailingVisual?: ReactNode
  tone?: BadgeTone
}

function Badge({
  children,
  className,
  leadingVisual,
  tone = "default",
  trailingVisual,
  variant = "default",
  shape,
  size,
  render,
  ...props
}: BadgeProps) {
  const resolvedVariant = (variant ?? "default") as BadgeVariant
  const toneClass = resolveBadgeToneClass(resolvedVariant, tone)

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(
          badgeVariants({ variant: resolvedVariant, shape, size }),
          toneClass,
          className
        ),
        children: (
          <>
            {leadingVisual ? (
              <span
                data-slot="badge-leading"
                className="inline-flex shrink-0 items-center justify-center"
              >
                {leadingVisual}
              </span>
            ) : null}
            {children ? (
              <span data-slot="badge-label" className="inline-flex items-center">
                {children}
              </span>
            ) : null}
            {trailingVisual ? (
              <span
                data-slot="badge-trailing"
                className="inline-flex shrink-0 items-center justify-center"
              >
                {trailingVisual}
              </span>
            ) : null}
          </>
        ),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      shape,
      size,
      tone,
      variant,
    },
  })
}

function BadgeDot({
  className,
  tone = "gray",
  ...props
}: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      aria-hidden="true"
      data-slot="badge-dot"
      className={cn(
        "inline-flex rounded-full",
        badgeDotStyles[tone],
        className
      )}
      {...props}
    />
  )
}

export { Badge, BadgeDot, badgeVariants }
export type { BadgeProps, BadgeTone }
