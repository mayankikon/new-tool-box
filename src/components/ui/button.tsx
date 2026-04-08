"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { buttonVariants } from "./button-variants"

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
