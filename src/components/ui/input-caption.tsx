"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

// ---------------------------------------------------------------------------
// Password strength
// ---------------------------------------------------------------------------

type PasswordStrength = "none" | "low" | "medium" | "high"

const STRENGTH_SEGMENTS = 3

const strengthBarColor: Record<PasswordStrength, string> = {
  none: "bg-muted",
  low: "bg-[#e74341]",
  medium: "bg-[#f27313]",
  high: "bg-primary",
}

function filledSegments(strength: PasswordStrength): number {
  switch (strength) {
    case "low":
      return 1
    case "medium":
      return 2
    case "high":
      return 3
    default:
      return 0
  }
}

// ---------------------------------------------------------------------------
// Password requirement
// ---------------------------------------------------------------------------

interface PasswordRequirement {
  label: string
  met: boolean
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const inputCaptionVariants = cva("flex w-full", {
  variants: {
    variant: {
      default: "items-center gap-0",
      success: "items-center gap-0",
      error: "items-center gap-0",
      checkbox: "items-center gap-2",
      password: "flex-col items-start gap-2.5",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

interface InputCaptionProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof inputCaptionVariants> {
  children?: React.ReactNode

  /** Shown for `default` and `checkbox` variants */
  text?: string

  /** Shown for `success` variant */
  successText?: string

  /** Shown for `error` variant */
  errorText?: string

  /** Password variant: overall strength */
  strength?: PasswordStrength

  /** Password variant: list of requirements with met/unmet state */
  requirements?: PasswordRequirement[]

  /** Checkbox variant: controlled checked state */
  checked?: boolean

  /** Checkbox variant: change handler */
  onCheckedChange?: (checked: boolean) => void
}

function InputCaption({
  className,
  variant = "default",
  text = "Caption text",
  successText = "Success message",
  errorText = "Error message",
  strength = "none",
  requirements = [],
  checked,
  onCheckedChange,
  ...props
}: InputCaptionProps) {
  return (
    <div
      data-slot="input-caption"
      className={cn(inputCaptionVariants({ variant }), className)}
      {...props}
    >
      {variant === "default" && (
        <InputCaptionText>{text}</InputCaptionText>
      )}

      {variant === "success" && (
        <InputCaptionText variant="success">{successText}</InputCaptionText>
      )}

      {variant === "error" && (
        <InputCaptionText variant="error">{errorText}</InputCaptionText>
      )}

      {variant === "checkbox" && (
        <>
          <Checkbox
            checked={checked}
            onCheckedChange={onCheckedChange}
          />
          <InputCaptionText>{text}</InputCaptionText>
        </>
      )}

      {variant === "password" && (
        <>
          <InputCaptionText>Password requirements:</InputCaptionText>
          <PasswordStrengthBar strength={strength} />
          {requirements.map((req) => (
            <PasswordRequirementRow
              key={req.label}
              label={req.label}
              met={req.met}
            />
          ))}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Caption text line
// ---------------------------------------------------------------------------

const captionTextVariants = cva(
  "text-xs font-normal leading-4",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        success: "text-primary",
        error: "text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function InputCaptionText({
  className,
  variant,
  ...props
}: React.ComponentProps<"p"> & VariantProps<typeof captionTextVariants>) {
  return (
    <p
      data-slot="input-caption-text"
      className={cn(captionTextVariants({ variant }), className)}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// Password strength bar (3 segments)
// ---------------------------------------------------------------------------

function PasswordStrengthBar({
  className,
  strength = "none",
  ...props
}: React.ComponentProps<"div"> & { strength?: PasswordStrength }) {
  const filled = filledSegments(strength)
  const barColor = strengthBarColor[strength]
  const emptyColor = "bg-muted"

  return (
    <div
      data-slot="password-strength-bar"
      className={cn("flex w-full items-center gap-1", className)}
      role="meter"
      aria-label="Password strength"
      aria-valuenow={filled}
      aria-valuemin={0}
      aria-valuemax={STRENGTH_SEGMENTS}
      {...props}
    >
      {Array.from({ length: STRENGTH_SEGMENTS }, (_, i) => (
        <div
          key={i}
          data-slot="password-strength-segment"
          data-filled={i < filled || undefined}
          className={cn(
            "h-1 min-h-px min-w-px flex-1 rounded-full transition-colors duration-200",
            i < filled ? barColor : emptyColor
          )}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Password requirement row (icon + label)
// ---------------------------------------------------------------------------

function PasswordRequirementRow({
  className,
  label,
  met,
  ...props
}: React.ComponentProps<"div"> & { label: string; met: boolean }) {
  return (
    <div
      data-slot="password-requirement"
      className={cn("flex w-full items-center gap-1", className)}
      {...props}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        {met ? (
          <CheckIcon className="size-4 text-primary" aria-hidden />
        ) : (
          <XIcon className="size-4 text-muted-foreground" aria-hidden />
        )}
      </span>
      <span
        className={cn(
          "text-xs font-normal leading-4",
          met ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  InputCaption,
  InputCaptionText,
  PasswordStrengthBar,
  PasswordRequirementRow,
  inputCaptionVariants,
  captionTextVariants,
}

export type {
  InputCaptionProps,
  PasswordStrength,
  PasswordRequirement,
}
