"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* ---------------------------------------------------------------------------
 * AiTextArea — root container
 * Owns the outer chrome (border, bg, shadow, radius) and layout (label + body + caption).
 * Children are composed freely inside — typically AiTextAreaInput, AiTextAreaToolbar, etc.
 * -------------------------------------------------------------------------*/

const aiTextAreaContainerVariants = cva(
  "flex flex-col overflow-hidden rounded-[var(--radius-Card-md,12px)] w-full transition-colors",
  {
    variants: {
      variant: {
        default:
          "border border-border bg-white hover:border-input-hover focus-within:border-ring-input focus-within:ring-3 focus-within:ring-ring-input/50 dark:bg-sidebar",
        shadow:
          "relative border border-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:border-input-hover focus-within:border-ring-input focus-within:ring-3 focus-within:ring-ring-input/50 dark:bg-sidebar dark:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)]",
        soft: "bg-muted/60 focus-within:ring-3 focus-within:ring-ring-input/50 dark:bg-muted/40",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

interface AiTextAreaProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof aiTextAreaContainerVariants> {
  label?: string
  caption?: string
}

function AiTextArea({
  className,
  variant,
  label,
  caption,
  children,
  ...props
}: AiTextAreaProps) {
  return (
    <div data-slot="ai-textarea" className={cn("flex flex-col gap-2 w-full", className)} {...props}>
      {label && (
        <div data-slot="ai-textarea-label" className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
          </div>
          <div className="flex items-center gap-1 h-5 w-[78px]" />
        </div>
      )}
      <div
        data-slot="ai-textarea-container"
        className={cn(aiTextAreaContainerVariants({ variant }))}
      >
        {children}
        {variant === "shadow" && (
          <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-1px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[inset_0px_-1px_0px_0px_rgba(255,255,255,0.06)]" />
        )}
      </div>
      {caption && (
        <p data-slot="ai-textarea-caption" className="text-xs leading-4 text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * AiTextAreaInput — the actual <textarea> element
 * Borderless and ringless; the parent container owns visual chrome.
 * Auto-grows via field-sizing-content.
 * Figma: pt=10px, px=12px, pb varies (6px gap to toolbar, or 12px if standalone).
 * -------------------------------------------------------------------------*/

interface AiTextAreaInputProps extends React.ComponentProps<"textarea"> {}

function AiTextAreaInput({ className, ...props }: AiTextAreaInputProps) {
  return (
    <textarea
      data-slot="ai-textarea-input"
      className={cn(
        "flex w-full resize-none field-sizing-content min-h-[40px] bg-transparent px-3 pt-2.5 pb-0 text-sm leading-5 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * AiTextAreaToolbar — horizontal bar for chips, buttons, formatting actions
 * Figma: multiline variants use pb=12px, px=12px; variant 6 uses p=8px with border-t.
 * -------------------------------------------------------------------------*/

interface AiTextAreaToolbarProps extends React.ComponentProps<"div"> {
  separator?: boolean
}

function AiTextAreaToolbar({ className, separator, children, ...props }: AiTextAreaToolbarProps) {
  return (
    <div
      data-slot="ai-textarea-toolbar"
      className={cn(
        "flex items-center justify-between",
        separator ? "border-t border-border p-2" : "px-3 pb-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * AiTextAreaToolbarGroup — groups icons/chips within a toolbar
 * Figma: 4px gap between items.
 * -------------------------------------------------------------------------*/

function AiTextAreaToolbarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-textarea-toolbar-group"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * AiTextAreaToolbarSeparator — vertical divider between toolbar groups
 * Figma: 8px wide with centered 1px line, full height of parent.
 * -------------------------------------------------------------------------*/

function AiTextAreaToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-textarea-toolbar-separator"
      className={cn("mx-0.5 h-4 w-px shrink-0 bg-border", className)}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * AiTextAreaChip — pill-shaped action chip (icon + optional label)
 * Figma: bg/state/soft rgba(39,39,42,0.06), rounded-full, min-h/w 28px.
 * With label: px=8px py=4px gap=4px, font sm/Medium text/muted.
 * Icon-only: no padding, just centered 16px icon in 28px container.
 * -------------------------------------------------------------------------*/

const aiTextAreaChipVariants = cva(
  "inline-flex shrink-0 items-center justify-center overflow-hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      shape: {
        pill: "rounded-full",
        rounded: "rounded-xs",
      },
      size: {
        sm: "min-h-6 min-w-6",
        default: "min-h-7 min-w-7",
      },
    },
    defaultVariants: { shape: "pill", size: "default" },
  }
)

interface AiTextAreaChipProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof aiTextAreaChipVariants> {}

function AiTextAreaChip({
  className,
  shape,
  size,
  children,
  ...props
}: AiTextAreaChipProps) {
  const childArray = React.Children.toArray(children)
  const hasLabel = childArray.some(
    (child) => typeof child === "string" || (React.isValidElement(child) && child.type === "span")
  )
  return (
    <button
      type="button"
      data-slot="ai-textarea-chip"
      className={cn(
        "bg-muted/60 dark:bg-muted/50",
        aiTextAreaChipVariants({ shape, size }),
        hasLabel ? "gap-1 px-2 py-1" : "p-0",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* ---------------------------------------------------------------------------
 * AiTextAreaActionButton — ghost icon button (attach, mic, etc.)
 * Figma: bg/state/soft for toolbar chips, bg/state/ghost for v6 formatting.
 * 28px default, 24px sm. Rounded-full for toolbar, rounded-sm (6px) for v6.
 * -------------------------------------------------------------------------*/

const aiTextAreaActionButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center overflow-hidden transition-colors cursor-pointer outline-none text-muted-foreground hover:text-foreground select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        sm: "size-7 rounded-sm",
        default: "size-7 rounded-full",
      },
    },
    defaultVariants: { size: "default" },
  }
)

interface AiTextAreaActionButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof aiTextAreaActionButtonVariants> {}

function AiTextAreaActionButton({
  className,
  size,
  ...props
}: AiTextAreaActionButtonProps) {
  return (
    <button
      type="button"
      data-slot="ai-textarea-action-button"
      className={cn(aiTextAreaActionButtonVariants({ size, className }))}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * AiTextAreaSubmit — primary branded submit/send button
 * Primary submit: bg-primary (dark #1AB994), shadow 0px 1px 2px rgba(0,0,0,0.05), inner highlight.
 * Icon shape: 28px circle. Pill: h=28px px=8px py=4px rounded-xs (4px).
 * Pill-sm: px=6px py=4px text-xs rounded-xs.
 * -------------------------------------------------------------------------*/

const aiTextAreaSubmitVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-primary text-primary-foreground shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors hover:bg-primary/90 cursor-pointer outline-none disabled:pointer-events-none disabled:opacity-50 select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 dark:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.35)]",
  {
    variants: {
      shape: {
        icon: "size-7 rounded-full p-0",
        pill: "h-7 gap-1 rounded-xs px-2 py-1 text-sm font-medium",
        "pill-sm": "h-6 gap-1 rounded-xs px-1.5 py-1 text-xs font-medium",
      },
    },
    defaultVariants: { shape: "icon" },
  }
)

interface AiTextAreaSubmitProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof aiTextAreaSubmitVariants> {}

function AiTextAreaSubmit({
  className,
  shape,
  children,
  ...props
}: AiTextAreaSubmitProps) {
  return (
    <button
      type="submit"
      data-slot="ai-textarea-submit"
      className={cn(aiTextAreaSubmitVariants({ shape, className }))}
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-1px_0px_0px_rgba(0,0,0,0.08)]" />
    </button>
  )
}

/* ---------------------------------------------------------------------------
 * AiTextAreaSecondaryButton — outlined secondary button (e.g. "Comment")
 * Figma: bg/state/secondary white, border-darker rgba(39,39,42,0.15),
 * px=8px py=4px, rounded-xs (4px), shadow + inner highlight overlay.
 * -------------------------------------------------------------------------*/

function AiTextAreaSecondaryButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="ai-textarea-secondary-button"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center gap-1 rounded-xs border border-border bg-background px-2 py-1 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted cursor-pointer outline-none select-none dark:shadow-black/25",
        className
      )}
      {...props}
    >
      {typeof props.children === "string" ? (
        <span className="px-0.5">{props.children}</span>
      ) : (
        props.children
      )}
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-1px_0px_0px_rgba(0,0,0,0.08)]" />
    </button>
  )
}

export {
  AiTextArea,
  AiTextAreaInput,
  AiTextAreaToolbar,
  AiTextAreaToolbarGroup,
  AiTextAreaToolbarSeparator,
  AiTextAreaChip,
  AiTextAreaActionButton,
  AiTextAreaSubmit,
  AiTextAreaSecondaryButton,
  aiTextAreaContainerVariants,
  aiTextAreaChipVariants,
  aiTextAreaActionButtonVariants,
  aiTextAreaSubmitVariants,
}
