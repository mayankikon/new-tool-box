"use client";

import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const linkButtonVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-sm font-medium text-base leading-6 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "text-foreground hover:bg-muted/50 hover:text-foreground",
        muted:
          "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        primary:
          "text-primary hover:bg-primary/10 hover:text-primary",
        disabled:
          "text-muted-foreground/50 cursor-not-allowed",
      },
      underline: { true: "", false: "" },
    },
    defaultVariants: { variant: "default", underline: false },
  }
);

export interface LinkButtonProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color">,
    VariantProps<typeof linkButtonVariants> {
  href?: string;
  leadIcon?: React.ReactNode;
  tailIcon?: React.ReactNode;
  children: React.ReactNode;
  /** When true, renders as button (no href). Use for in-page actions. */
  asButton?: boolean;
}

function LinkButton({
  className,
  variant = "default",
  underline = false,
  href,
  leadIcon,
  tailIcon,
  children,
  asButton = false,
  ...props
}: LinkButtonProps) {
  const isExternal = typeof href === "string" && (href.startsWith("http") || href.startsWith("//"));
  const classes = cn(linkButtonVariants({ variant, underline, className }));

  if (asButton || href == null) {
    return (
      <button
        type="button"
        className={classes}
        disabled={variant === "disabled"}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {leadIcon && <span className="shrink-0" aria-hidden>{leadIcon}</span>}
        <span className={underline ? "underline decoration-current underline-offset-4" : ""}>
          {children}
        </span>
        {tailIcon && <span className="shrink-0" aria-hidden>{tailIcon}</span>}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
      {...props}
    >
      {leadIcon && <span className="shrink-0" aria-hidden>{leadIcon}</span>}
      <span className={underline ? "underline decoration-current underline-offset-4" : ""}>
        {children}
      </span>
      {tailIcon && <span className="shrink-0" aria-hidden>{tailIcon}</span>}
    </Link>
  );
}

export { LinkButton, linkButtonVariants };
