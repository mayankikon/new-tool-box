"use client";

import {
  type FocusEvent,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const tickerFadeMaskStyle: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
};

interface SuggestedCampaignTickerProps<T> {
  items: readonly T[];
  getItemKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number, copyIndex: number) => ReactNode;
  ariaLabel?: string;
  className?: string;
  speedPxPerSecond?: number;
}

export function SuggestedCampaignTicker<T>({
  items,
  getItemKey,
  renderItem,
  ariaLabel = "Suggested campaigns",
  className,
  speedPxPerSecond = 36,
}: SuggestedCampaignTickerProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const trackX = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const node = measureRef.current;
    if (!node) return;

    const updateWidth = () => {
      setTrackWidth(node.getBoundingClientRect().width);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry?.isIntersecting ?? true);
      },
      { threshold: 0.1 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (trackWidth > 0) {
      const currentX = trackX.get();
      const normalizedX = ((currentX % trackWidth) + trackWidth) % trackWidth;
      trackX.set(-normalizedX);
      return;
    }

    trackX.set(0);
  }, [trackWidth, trackX]);

  const isPaused =
    prefersReducedMotion || !isInView || isHovered || isFocusWithin || trackWidth === 0;

  useAnimationFrame((_, delta) => {
    if (isPaused || trackWidth <= 0) return;

    let next = trackX.get() - speedPxPerSecond * (delta / 1000);
    if (next <= -trackWidth) {
      next += trackWidth;
    }
    trackX.set(next);
  });

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget;
    if (!nextFocused || !event.currentTarget.contains(nextFocused as Node)) {
      setIsFocusWithin(false);
    }
  };

  const trackContent = (
    <>
      <div ref={measureRef} className="flex shrink-0 gap-4">
        {items.map((item, index) => (
          <div key={`${getItemKey(item, index)}-0`} className="shrink-0">
            {renderItem(item, index, 0)}
          </div>
        ))}
      </div>
      <div className="flex shrink-0 gap-4">
        {items.map((item, index) => (
          <div key={`${getItemKey(item, index)}-1`} className="shrink-0">
            {renderItem(item, index, 1)}
          </div>
        ))}
      </div>
    </>
  );

  if (prefersReducedMotion) {
    return (
      <div
        aria-label={ariaLabel}
        className={cn("overflow-x-auto overflow-y-hidden pb-2 scrollbar-thin", className)}
      >
        <div className="flex w-max gap-4">
          {items.map((item, index) => (
            <div key={getItemKey(item, index)} className="shrink-0">
              {renderItem(item, index, 0)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-label={ariaLabel}
      className={cn("relative overflow-hidden pb-2", className)}
      style={tickerFadeMaskStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={handleBlurCapture}
    >
      <motion.div
        style={{ x: trackX }}
        className={cn("flex w-max gap-4", !isPaused && "will-change-transform")}
      >
        {trackContent}
      </motion.div>
    </div>
  );
}
