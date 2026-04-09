"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";

import {
  Input,
  InputContainer,
  InputIcon,
} from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  readRecentVehicleSearches,
  rememberVehicleSearch,
} from "@/lib/inventory/recent-vehicle-search-storage";

export interface InventoryVehicleSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Called after the user commits a search (Enter) or picks a recent item. */
  onAfterCommit?: () => void;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
  placeholder?: string;
}

export function InventoryVehicleSearchField({
  value,
  onChange,
  onAfterCommit,
  className,
  inputClassName,
  "aria-label": ariaLabel = "Search vehicles",
  placeholder = "Search vehicles",
}: InventoryVehicleSearchFieldProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [recents, setRecents] = React.useState<string[]>([]);
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);

  const refreshRecents = React.useCallback(() => {
    setRecents(readRecentVehicleSearches());
  }, []);

  React.useEffect(() => {
    refreshRecents();
  }, [refreshRecents]);

  const filteredRecents = React.useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return recents;
    return recents.filter((item) => item.toLowerCase().includes(q));
  }, [recents, value]);

  const canShowPanel = filteredRecents.length > 0;
  const popoverOpen = panelOpen && canShowPanel;

  const updateAnchorRect = React.useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    setAnchorRect(el.getBoundingClientRect());
  }, []);

  React.useLayoutEffect(() => {
    if (!popoverOpen) return;
    updateAnchorRect();
    const handler = () => updateAnchorRect();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [popoverOpen, updateAnchorRect]);

  React.useEffect(() => {
    if (panelOpen && !canShowPanel) {
      setPanelOpen(false);
    }
  }, [canShowPanel, panelOpen]);

  React.useEffect(() => {
    if (!popoverOpen) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setPanelOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [popoverOpen]);

  const handleFocus = () => {
    const list = readRecentVehicleSearches();
    setRecents(list);
    const q = value.trim().toLowerCase();
    const filtered = !q
      ? list
      : list.filter((item) => item.toLowerCase().includes(q));
    if (filtered.length > 0) {
      updateAnchorRect();
      setPanelOpen(true);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const next = event.relatedTarget;
    if (next && listRef.current?.contains(next)) return;
    window.setTimeout(() => {
      const active = document.activeElement;
      if (listRef.current?.contains(active)) return;
      setPanelOpen(false);
    }, 120);
  };

  const handleClear = () => {
    onChange("");
  };

  const commitSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    rememberVehicleSearch(trimmed);
    refreshRecents();
    onAfterCommit?.();
  };

  const handlePick = (query: string) => {
    onChange(query);
    commitSearch(query);
    setPanelOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const trimmed = value.trim();
      if (trimmed) {
        commitSearch(trimmed);
        setPanelOpen(false);
      }
    }
    if (event.key === "Escape") {
      setPanelOpen(false);
    }
  };

  const dropdown =
    popoverOpen && anchorRect && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={listRef}
            id="inventory-vehicle-search-recent"
            role="listbox"
            aria-label="Recent searches"
            className={cn(
              "fixed z-[200] flex max-h-[min(320px,50vh)] flex-col overflow-y-auto rounded-sm border border-border/45 bg-popover p-1 text-sm text-popover-foreground shadow-md",
              "motion-reduce:transition-none"
            )}
            style={{
              top: anchorRect.bottom + 2,
              left: anchorRect.left,
              width: anchorRect.width,
            }}
          >
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Recent searches
            </p>
            <ul className="flex flex-col gap-0.5">
              {filteredRecents.map((item) => (
                <li key={item} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="w-full rounded-sm px-2 py-2 text-left text-sm text-foreground hover:bg-muted/80"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handlePick(item);
                    }}
                  >
                    <span className="line-clamp-2 break-words">{item}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div ref={wrapperRef} className={cn("w-full max-w-sm", className)}>
        <InputContainer
          size="lg"
          className={cn(
            "w-full",
            inputClassName,
            // Stay solid white while focused/typing; default InputContainer hover tint reads as non-white.
            "has-[:focus-within]:bg-white has-[:focus-within]:hover:bg-white",
            "dark:has-[:focus-within]:bg-white dark:has-[:focus-within]:hover:bg-white",
          )}
        >
          <InputIcon position="lead">
            <Search className="size-4" />
          </InputIcon>
          <Input
            standalone={false}
            size="lg"
            aria-label={ariaLabel}
            placeholder={placeholder}
            aria-controls={
              popoverOpen ? "inventory-vehicle-search-recent" : undefined
            }
            aria-expanded={popoverOpen}
            aria-autocomplete="list"
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          {value.length > 0 ? (
            <InputIcon position="tail" className="pr-1.5">
              <button
                type="button"
                aria-label="Clear search"
                className="flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  handleClear();
                }}
              >
                <X className="size-4" aria-hidden />
              </button>
            </InputIcon>
          ) : null}
        </InputContainer>
      </div>
      {dropdown}
    </>
  );
}
