import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"
import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

/* ---------------------------------------------------------------------------
 * InputGroup — vertical stack wrapper (label + container + caption)
 * Provides a group context for disabled and error propagation via data attrs.
 * -------------------------------------------------------------------------*/

interface InputGroupProps extends React.ComponentProps<"div"> {
  disabled?: boolean
}

function InputGroup({
  className,
  disabled,
  ...props
}: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      data-disabled={disabled || undefined}
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * InputLabel — label row with leading text and optional trailing slot
 * -------------------------------------------------------------------------*/

interface InputLabelProps extends React.ComponentProps<"label"> {
  trailing?: React.ReactNode
}

function InputLabel({
  className,
  trailing,
  children,
  ...props
}: InputLabelProps) {
  return (
    <div className="flex items-center justify-between">
      <label
        data-slot="input-label"
        className={cn(
          "text-sm font-medium leading-5 text-foreground select-none group-data-[disabled]:pointer-events-none group-data-[disabled]:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </label>
      {trailing && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {trailing}
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * InputHelperText — lightweight helper / error text below the input.
 * For the full-featured caption (password strength, checkbox, etc.)
 * use InputCaption from "@/components/ui/input-caption".
 * -------------------------------------------------------------------------*/

const inputHelperTextVariants = cva(
  "text-xs leading-4",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        error: "text-destructive",
        success: "text-[var(--theme-text-success)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface InputHelperTextProps
  extends React.ComponentProps<"p">,
    VariantProps<typeof inputHelperTextVariants> {}

function InputHelperText({
  className,
  variant = "default",
  ...props
}: InputHelperTextProps) {
  return (
    <p
      data-slot="input-helper-text"
      className={cn(inputHelperTextVariants({ variant }), className)}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * InputContainer — the bordered shell wrapping the <input> and addons.
 * CVA for `inputStyle` (default | soft) and `size` (sm | lg).
 * -------------------------------------------------------------------------*/

const inputContainerVariants = cva(
  "flex w-full items-center overflow-clip rounded-sm transition-colors has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50 has-[aria-invalid]:border-destructive has-[aria-invalid]:ring-3 has-[aria-invalid]:ring-destructive/20 dark:has-[aria-invalid]:border-destructive/50 dark:has-[aria-invalid]:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      inputStyle: {
        default:
          "border border-input bg-white hover:border-input-hover hover:bg-[var(--theme-background-input-hover)] has-[:disabled]:hover:border-input has-[:disabled]:hover:bg-white dark:bg-sidebar dark:hover:bg-[var(--theme-background-input-hover)] dark:has-[:disabled]:hover:bg-sidebar dark:has-[:disabled]:bg-input/80",
        soft: "border border-transparent bg-white hover:bg-[var(--theme-background-input-hover)] has-[:disabled]:hover:bg-white dark:bg-sidebar dark:hover:bg-[var(--theme-background-input-hover)] dark:has-[:disabled]:hover:bg-sidebar",
      },
      size: {
        sm: "min-h-8",
        lg: "min-h-9",
      },
    },
    defaultVariants: {
      inputStyle: "default",
      size: "sm",
    },
  }
)

interface InputContainerProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof inputContainerVariants> {}

function InputContainer({
  className,
  inputStyle = "default",
  size = "sm",
  ...props
}: InputContainerProps) {
  return (
    <div
      data-slot="input-container"
      className={cn(
        inputContainerVariants({ inputStyle, size, className })
      )}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Input — the actual <input> element, thin and border-free when inside a
 * container. Also works standalone (backward compat with current API).
 * -------------------------------------------------------------------------*/

const inputVariants = cva(
  "w-full min-w-0 bg-transparent text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 py-1",
        lg: "h-9 px-2.5 py-1.5",
      },
      standalone: {
        true: "rounded-sm border border-input bg-white hover:border-input-hover hover:bg-[var(--theme-background-input-hover)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-input/50 disabled:opacity-50 disabled:hover:border-input disabled:hover:bg-white aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-sidebar dark:hover:bg-[var(--theme-background-input-hover)] dark:disabled:bg-input/80 dark:disabled:hover:bg-sidebar dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        false: "border-none focus-visible:ring-0 focus-visible:ring-offset-0",
      },
    },
    defaultVariants: {
      size: "sm",
      standalone: true,
    },
  }
)

interface InputProps
  extends Omit<React.ComponentProps<"input">, "size"> {
  size?: "sm" | "lg"
  standalone?: boolean
}

function Input({
  className,
  type,
  size = "sm",
  standalone = true,
  ...props
}: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size, standalone, className }))}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * InputIcon — convenience wrapper for leading / trailing icons inside
 * InputContainer. Sizes the icon container consistently.
 * -------------------------------------------------------------------------*/

interface InputIconProps extends React.ComponentProps<"div"> {
  position?: "lead" | "tail"
}

function InputIcon({
  className,
  position = "lead",
  children,
  ...props
}: InputIconProps) {
  return (
    <div
      data-slot="input-icon"
      data-position={position}
      className={cn(
        "flex shrink-0 items-center justify-center text-muted-foreground",
        position === "lead" ? "pl-2.5" : "pr-2.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * InputAddon — separated prefix/suffix text with a border divider.
 * Used for the "Add-on" variant (e.g. "https://" | input | ".com").
 * -------------------------------------------------------------------------*/

interface InputAddonProps extends React.ComponentProps<"div"> {
  position?: "lead" | "tail"
}

function InputAddon({
  className,
  position = "lead",
  children,
  ...props
}: InputAddonProps) {
  return (
    <div
      data-slot="input-addon"
      className={cn(
        "flex shrink-0 items-center justify-center px-3 text-sm font-medium text-muted-foreground select-none",
        position === "lead"
          ? "border-r border-input"
          : "border-l border-input",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * InputInlineAddon — inline prefix/suffix text (no border), sits inside
 * the input container flush with the text. For "Inline add-on" variant.
 * -------------------------------------------------------------------------*/

interface InputInlineAddonProps extends React.ComponentProps<"span"> {
  position?: "lead" | "tail"
}

function InputInlineAddon({
  className,
  position = "lead",
  children,
  ...props
}: InputInlineAddonProps) {
  return (
    <span
      data-slot="input-inline-addon"
      className={cn(
        "flex shrink-0 items-center text-sm font-medium text-muted-foreground whitespace-nowrap select-none",
        position === "lead" ? "pl-2.5" : "pr-2.5",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/* ---------------------------------------------------------------------------
 * InputShortcutBadge — keyboard shortcut indicator (e.g. "/" or "Ctrl+K").
 * -------------------------------------------------------------------------*/

function InputShortcutBadge({
  className,
  children,
  ...props
}: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="input-shortcut-badge"
      className={cn(
        "mr-2 flex h-5 shrink-0 items-center justify-center rounded-xs border border-border px-1 text-xs font-medium text-muted-foreground select-none",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}

/* ---------------------------------------------------------------------------
 * InputActionButton — button attached to lead or tail of the input
 * (with a vertical divider). For "Tail button" / "Lead button" variants.
 * -------------------------------------------------------------------------*/

interface InputActionButtonProps
  extends React.ComponentProps<"button"> {
  position?: "lead" | "tail"
}

function InputActionButton({
  className,
  position = "tail",
  children,
  ...props
}: InputActionButtonProps) {
  return (
    <>
      <div
        className={cn(
          "self-stretch w-px bg-input",
          position === "lead" && "order-none",
          position === "tail" && "order-none"
        )}
        aria-hidden
      />
      <button
        type="button"
        data-slot="input-action-button"
        className={cn(
          "flex shrink-0 cursor-pointer items-center justify-center gap-1 px-2.5 py-2 text-sm font-medium text-foreground whitespace-nowrap transition-colors hover:bg-muted select-none disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </button>
    </>
  )
}

/* ---------------------------------------------------------------------------
 * InputQuantityButton — minus/plus clickable areas for quantity inputs.
 * -------------------------------------------------------------------------*/

interface InputQuantityButtonProps
  extends Omit<React.ComponentProps<"button">, "children"> {
  action: "increment" | "decrement"
}

function InputQuantityButton({
  className,
  action,
  ...props
}: InputQuantityButtonProps) {
  return (
    <button
      type="button"
      data-slot="input-quantity-button"
      aria-label={action === "increment" ? "Increase" : "Decrease"}
      className={cn(
        "flex size-9 shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {action === "decrement" ? (
        <Minus className="size-4" />
      ) : (
        <Plus className="size-4" />
      )}
    </button>
  )
}

export {
  Input,
  InputGroup,
  InputLabel,
  InputHelperText,
  InputContainer,
  InputIcon,
  InputAddon,
  InputInlineAddon,
  InputShortcutBadge,
  InputActionButton,
  InputQuantityButton,
  inputContainerVariants,
  inputVariants,
  inputHelperTextVariants,
}
