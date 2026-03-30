"use client";

import { cn } from "@/lib/utils";

/** Color swatch: background from cssVar or tailwindClass */
export interface TokenSwatchColorProps {
  type: "color";
  name: string;
  cssVar?: string;
  tailwindClass?: string;
  className?: string;
}

/** Text sample (e.g. "Aa") using a color from cssVar */
export interface TokenSwatchTextProps {
  type: "text";
  name: string;
  cssVar: string;
  sample?: string;
  className?: string;
}

/** Radius swatch: box with tailwindClass for border-radius */
export interface TokenSwatchRadiusProps {
  type: "radius";
  name: string;
  tailwindClass: string;
  className?: string;
}

/** Spacing swatch: box sized by CSS var --spacing-{size} */
export interface TokenSwatchSpacingProps {
  type: "spacing";
  name: string;
  size: string;
  className?: string;
}

/** Stroke swatch: horizontal bar with width value */
export interface TokenSwatchStrokeProps {
  type: "stroke";
  name: string;
  value: string;
  className?: string;
}

export type TokenSwatchProps =
  | TokenSwatchColorProps
  | TokenSwatchTextProps
  | TokenSwatchRadiusProps
  | TokenSwatchSpacingProps
  | TokenSwatchStrokeProps;

export function TokenSwatch(props: TokenSwatchProps) {
  const { name, className } = props;
  const labelClass = "text-xs text-muted-foreground truncate text-center max-w-[100px]";

  if (props.type === "color") {
    const style = props.cssVar ? { backgroundColor: props.cssVar } : undefined;
    return (
      <div className={cn("flex flex-col items-center gap-1", className)}>
        <div
          className={cn(
            "h-10 w-10 rounded-lg border border-border",
            props.tailwindClass
          )}
          style={style}
          title={props.cssVar ?? props.tailwindClass}
        />
        <span className={labelClass}>{name}</span>
      </div>
    );
  }

  if (props.type === "text") {
    const sample = props.sample ?? "Aa";
    return (
      <div className={cn("flex flex-col items-center gap-1", className)}>
        <span
          className="text-xs font-medium"
          style={{ color: props.cssVar }}
        >
          {sample}
        </span>
        <span className={labelClass}>{name}</span>
      </div>
    );
  }

  if (props.type === "radius") {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <div
          className={cn("h-14 w-14 bg-primary", props.tailwindClass)}
          title={props.tailwindClass}
        />
        <span className="text-xs text-muted-foreground">{name}</span>
      </div>
    );
  }

  if (props.type === "spacing") {
    return (
      <div className={cn("flex flex-col items-center gap-2 min-w-[2.5rem]", className)}>
        <div
          className="rounded-sm bg-primary opacity-80 shrink-0"
          style={{
            width: `var(--spacing-${props.size})`,
            height: `var(--spacing-${props.size})`,
            minHeight: props.size === "0" ? 0 : 2,
            minWidth: props.size === "0" ? 0 : 2,
          }}
          title={`--spacing-${props.size}`}
        />
        <span className="text-xs text-muted-foreground">{name}</span>
      </div>
    );
  }

  if (props.type === "stroke") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div
          className="h-6 bg-foreground shrink-0"
          style={{ width: props.value, minWidth: props.value }}
        />
        <span className="text-sm text-muted-foreground">
          {name} ({props.value})
        </span>
      </div>
    );
  }

  return null;
}
