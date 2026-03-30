"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  PageItem – individual page indicator (number or dot)              */
/* ------------------------------------------------------------------ */

const pageItemVariants = cva(
  "shrink-0 select-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "flex items-center justify-center rounded-sm text-sm font-medium min-h-8 min-w-8 w-8",
        dot: "rounded-full size-2.5",
      },
      state: {
        default: "",
        hover: "",
        active: "",
      },
    },
    compoundVariants: [
      // Default (number) states
      {
        variant: "default",
        state: "default",
        className: "text-muted-foreground/30",
      },
      {
        variant: "default",
        state: "hover",
        className: "bg-muted text-muted-foreground cursor-pointer",
      },
      {
        variant: "default",
        state: "active",
        className:
          "border border-primary bg-primary/12 text-primary cursor-pointer dark:bg-primary/18",
      },
      // Dot states
      {
        variant: "dot",
        state: "default",
        className: "bg-foreground/6",
      },
      {
        variant: "dot",
        state: "hover",
        className: "bg-foreground/8 cursor-pointer",
      },
      {
        variant: "dot",
        state: "active",
        className:
          "border-2 border-primary bg-primary/12 cursor-pointer dark:bg-primary/18",
      },
    ],
    defaultVariants: {
      variant: "default",
      state: "default",
    },
  }
)

interface PageItemProps
  extends Omit<React.ComponentProps<"button">, "children">,
    VariantProps<typeof pageItemVariants> {
  label?: string
}

function PageItem({
  className,
  variant = "default",
  state = "default",
  label,
  ...props
}: PageItemProps) {
  const isInteractive = state === "active" || props.onClick !== undefined
  const Element = isInteractive ? "button" : "span"

  if (variant === "dot") {
    return (
      <Element
        data-slot="page-item"
        data-state={state}
        className={cn(pageItemVariants({ variant, state }), className)}
        {...(isInteractive ? (props as React.ComponentProps<"button">) : {})}
      />
    )
  }

  return (
    <Element
      data-slot="page-item"
      data-state={state}
      className={cn(pageItemVariants({ variant, state }), className)}
      {...(isInteractive ? (props as React.ComponentProps<"button">) : {})}
    >
      {label}
    </Element>
  )
}

/* ------------------------------------------------------------------ */
/*  Nav button – prev / next chevron                                   */
/* ------------------------------------------------------------------ */

const navButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-sm min-h-8 min-w-8 transition-colors",
  {
    variants: {
      disabled: {
        true: "bg-foreground/8 text-foreground/30 cursor-default",
        false: "bg-foreground/6 text-muted-foreground hover:bg-foreground/10 cursor-pointer",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
)

interface NavButtonProps extends React.ComponentProps<"button"> {
  direction: "prev" | "next"
}

function NavButton({
  className,
  direction,
  disabled,
  ...props
}: NavButtonProps) {
  return (
    <button
      data-slot="paginator-nav"
      disabled={disabled}
      className={cn(navButtonVariants({ disabled: !!disabled }), className)}
      {...props}
    >
      {direction === "prev" ? (
        <ChevronLeft className="size-5" />
      ) : (
        <ChevronRight className="size-5" />
      )}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Paginator – composed component (Simple / Numbered / Dots)          */
/* ------------------------------------------------------------------ */

type PaginatorVariant = "simple" | "inline" | "numbered" | "dots"

interface PaginatorProps extends React.ComponentProps<"nav"> {
  variant?: PaginatorVariant
  currentPage: number
  totalPages: number
  /** Used by `simple` and `inline` – total item count */
  totalItems?: number
  /** Used by `simple` and `inline` – items per page */
  pageSize?: number
  onPageChange?: (page: number) => void
  /** Max visible page numbers for numbered variant (excluding ellipsis and last page) */
  maxVisiblePages?: number
}

function buildPageRange(
  currentPage: number,
  totalPages: number,
  maxVisible: number
): (number | "ellipsis")[] {
  if (totalPages <= maxVisible + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | "ellipsis")[] = []
  const half = Math.floor(maxVisible / 2)

  let start = Math.max(2, currentPage - half)
  let end = Math.min(totalPages - 1, currentPage + half)

  if (currentPage <= half + 1) {
    end = maxVisible
  }
  if (currentPage >= totalPages - half) {
    start = totalPages - maxVisible + 1
  }

  pages.push(1)

  if (start > 2) {
    pages.push("ellipsis")
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis")
  }

  pages.push(totalPages)
  return pages
}

function Paginator({
  className,
  variant = "simple",
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  maxVisiblePages = 4,
  ...props
}: PaginatorProps) {
  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPages

  const handlePrev = () => {
    if (!isFirstPage) onPageChange?.(currentPage - 1)
  }
  const handleNext = () => {
    if (!isLastPage) onPageChange?.(currentPage + 1)
  }

  if (variant === "inline") {
    const total = totalItems ?? 0
    const size = pageSize ?? 0
    const itemEnd =
      total === 0 ? 0 : Math.min(currentPage * size, total)
    const itemStart = total === 0 ? 0 : (currentPage - 1) * size + 1
    const hasRange = totalItems != null && pageSize != null

    /**
     * Icon-only prev/next: **square 1:1** hit targets (`size-9` / 36×36) so ghost hover matches width and height.
     * `-mr-1` pulls the block toward the card’s right edge.
     */
    const inlineIconNavBtnClass =
      "text-primary enabled:hover:bg-sidebar-accent enabled:hover:text-primary " +
      "disabled:text-muted-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground"

    return (
      <nav
        data-slot="paginator"
        aria-label="Pagination"
        className={cn(
          "-mr-1 flex min-h-9 items-center gap-2",
          className,
        )}
        {...props}
      >
        <div className="flex min-h-0 min-w-0 shrink items-center justify-center">
          {hasRange ? (
            <span className="whitespace-nowrap text-xs font-medium tabular-nums text-muted-foreground">
              {itemStart}–{itemEnd} of {total} results
            </span>
          ) : (
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isFirstPage}
            onClick={handlePrev}
            aria-label="Previous page"
            className={cn(
              "aspect-square !size-9 shrink-0 !gap-0 !rounded-sm !p-0",
              inlineIconNavBtnClass,
            )}
          >
            <ChevronLeft className="size-5 shrink-0" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLastPage}
            onClick={handleNext}
            aria-label="Next page"
            className={cn(
              "aspect-square !size-9 shrink-0 !gap-0 !rounded-sm !p-0",
              inlineIconNavBtnClass,
            )}
          >
            <ChevronRight className="size-5 shrink-0" aria-hidden />
          </Button>
        </div>
      </nav>
    )
  }

  if (variant === "simple") {
    const itemEnd = Math.min((currentPage) * (pageSize ?? 0), totalItems ?? 0)
    const itemStart = totalItems ? (currentPage - 1) * (pageSize ?? 0) + 1 : 0
    const displayedCount = totalItems != null && pageSize != null
    return (
      <nav
        data-slot="paginator"
        aria-label="Pagination"
        className={cn("flex items-center justify-between", className)}
        {...props}
      >
        {displayedCount ? (
          <span className="text-sm text-muted-foreground">
            {itemStart}–{itemEnd} of {totalItems} results
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
        )}
        <div className="flex items-center gap-1">
          <button
            disabled={isFirstPage}
            onClick={handlePrev}
            className={cn(
              "inline-flex items-center justify-center rounded-sm px-2.5 py-1.5 text-sm font-medium transition-colors",
              isFirstPage
                ? "bg-foreground/8 text-foreground/30 cursor-default"
                : "bg-foreground/6 text-muted-foreground hover:bg-foreground/10 cursor-pointer"
            )}
          >
            Prev
          </button>
          <button
            disabled={isLastPage}
            onClick={handleNext}
            className={cn(
              "inline-flex items-center justify-center rounded-sm px-2.5 py-1.5 text-sm font-medium transition-colors",
              isLastPage
                ? "bg-foreground/8 text-foreground/30 cursor-default"
                : "bg-foreground/6 text-muted-foreground hover:bg-foreground/10 cursor-pointer"
            )}
          >
            Next
          </button>
        </div>
      </nav>
    )
  }

  if (variant === "numbered") {
    const pages = buildPageRange(currentPage, totalPages, maxVisiblePages)
    return (
      <nav
        data-slot="paginator"
        aria-label="Pagination"
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <NavButton
          direction="prev"
          disabled={isFirstPage}
          onClick={handlePrev}
          aria-label="Previous page"
        />
        <div className="flex items-center gap-1">
          {pages.map((page, idx) =>
            page === "ellipsis" ? (
              <PageItem
                key={`ellipsis-${idx}`}
                variant="default"
                state="default"
                label="…"
              />
            ) : (
              <PageItem
                key={page}
                variant="default"
                state={page === currentPage ? "active" : "default"}
                label={String(page)}
                onClick={() => onPageChange?.(page)}
              />
            )
          )}
        </div>
        <NavButton
          direction="next"
          disabled={isLastPage}
          onClick={handleNext}
          aria-label="Next page"
        />
      </nav>
    )
  }

  // Dots variant
  return (
    <nav
      data-slot="paginator"
      aria-label="Pagination"
      className={cn("flex items-center gap-3", className)}
      {...props}
    >
      <NavButton
        direction="prev"
        disabled={isFirstPage}
        onClick={handlePrev}
        aria-label="Previous page"
      />
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PageItem
            key={page}
            variant="dot"
            state={page === currentPage ? "active" : "default"}
            onClick={() => onPageChange?.(page)}
            aria-label={`Page ${page}`}
          />
        ))}
      </div>
      <NavButton
        direction="next"
        disabled={isLastPage}
        onClick={handleNext}
        aria-label="Next page"
      />
    </nav>
  )
}

export { Paginator, PageItem, NavButton, pageItemVariants, navButtonVariants }
export type { PaginatorProps, PageItemProps, NavButtonProps, PaginatorVariant }
