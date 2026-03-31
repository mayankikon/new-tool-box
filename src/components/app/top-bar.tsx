"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TopBarBreadcrumbItem {
  label: string;
  href?: string;
  /** Used when `href` is omitted (e.g. client-side navigation). */
  onClick?: () => void;
}

export interface TopBarProps {
  /** Optional breadcrumb trail (e.g. Label ▸ Label ▸ Current). Links when href is set. */
  breadcrumbs?: TopBarBreadcrumbItem[];
  /** Page title; primary heading for the page */
  title?: React.ReactNode;
  /** Optional description or subtitle below the title */
  subtitle?: React.ReactNode;
  /** Right-side content (e.g. primary and secondary action buttons) */
  right?: React.ReactNode;
  className?: string;
}

/**
 * Page top bar (Shift 2.0 Sort UI): title, optional breadcrumbs, and page actions.
 * Sits below `AvatarBar` in the main column. Renders nothing if no title, subtitle, breadcrumbs, or `right` content.
 */
export function TopBar({
  breadcrumbs,
  title,
  subtitle,
  right,
  className,
}: TopBarProps) {
  const hasLeftContent =
    (breadcrumbs != null && breadcrumbs.length > 0) ||
    title != null ||
    subtitle != null;
  const hasMultiLineContent =
    (breadcrumbs != null && breadcrumbs.length > 0) || subtitle != null;
  const hasAnyContent = hasLeftContent || right != null;

  if (!hasAnyContent) {
    return null;
  }

  return (
    <header
      className={cn(
        "flex shrink-0 flex-col px-8",
        hasMultiLineContent ? "min-h-[4.5rem] pt-4 pb-4" : "pt-4 pb-2",
        "gap-1",
        className
      )}
      role="banner"
      aria-label="Top bar"
    >
      {breadcrumbs != null && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-1 text-[12px] text-muted-foreground"
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const label = <span className="truncate">{item.label}</span>;
            const interactive =
              item.onClick != null || (item.href != null && !isLast);
            return (
              <span key={index} className="flex items-center gap-1">
                {interactive && item.href != null ? (
                  <Link
                    href={item.href}
                    className="truncate hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                  >
                    {label}
                  </Link>
                ) : interactive && item.onClick != null ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="truncate text-left hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                  >
                    {label}
                  </button>
                ) : (
                  <span
                    className={
                      isLast ? "font-medium text-foreground" : undefined
                    }
                  >
                    {label}
                  </span>
                )}
                {!isLast && (
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground/70"
                    aria-hidden
                  />
                )}
              </span>
            );
          })}
        </nav>
      )}
      <div className="flex min-w-0 items-center justify-between gap-6">
        <div className="min-w-0 flex-1">
          {title != null && (
            <h1 className="truncate text-[30px] font-medium leading-tight tracking-[-0.6px] text-foreground">
              {title}
            </h1>
          )}
        </div>
        {right != null && (
          <div className="flex shrink-0 items-center gap-2">{right}</div>
        )}
      </div>
      {subtitle != null && (
        <p className="line-clamp-2 text-[14px] font-normal text-muted-foreground">
          {subtitle}
        </p>
      )}
    </header>
  );
}
