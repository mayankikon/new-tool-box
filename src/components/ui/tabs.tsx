"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Pill indicator: uses Base UI Indicator with --active-tab-* CSS variables for reliable position and sliding animation. Snappy timing per Emil (under 300ms, ~180ms); custom ease-in-out for moving elements. */
const pillIndicatorClassName = cn(
  "pointer-events-none absolute z-0 rounded-[var(--radius-sm)] border border-primary bg-primary/12",
  "dark:bg-primary/22",
  "left-[var(--active-tab-left)] top-[var(--active-tab-top)] w-[var(--active-tab-width)] h-[var(--active-tab-height)]",
  "transition-all duration-[180ms] ease-[cubic-bezier(0.65,0,0.35,1)]",
  "motion-reduce:transition-none"
)

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "rounded-sm p-[3px] bg-muted",
        line: "gap-1 rounded-none bg-transparent",
        /** Shift 2.0 Sort UI: pill/segment tabs, 8px gap, no list background */
        pill: "gap-2 rounded-none bg-transparent p-0",
        /** Bordered flat filter tabs — wrapping, content-sized, no list background. Derived from templates-page lifecycle filters. */
        filter:
          "gap-2 rounded-none bg-transparent p-0 flex-wrap group-data-horizontal/tabs:h-auto",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  children,
  ...rest
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        tabsListVariants({ variant }),
        variant === "pill" && "relative",
        className
      )}
      {...rest}
    >
      {variant === "pill" && (
        <TabsPrimitive.Indicator
          className={pillIndicatorClassName}
          renderBeforeHydration
        />
      )}
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-0 text-sm font-medium whitespace-nowrap transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=default]/tabs-list:h-[calc(100%-1px)] group-data-[variant=default]/tabs-list:rounded-xs group-data-[variant=default]/tabs-list:px-1.5 group-data-[variant=default]/tabs-list:py-0.5 group-data-[variant=default]/tabs-list:text-foreground/60 group-data-[variant=default]/tabs-list:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm dark:group-data-[variant=default]/tabs-list:text-muted-foreground dark:group-data-[variant=default]/tabs-list:hover:text-foreground",
        "group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-foreground dark:group-data-[variant=default]/tabs-list:data-active:bg-input/30 dark:group-data-[variant=default]/tabs-list:data-active:text-foreground",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:shadow-none group-data-[variant=line]/tabs-list:rounded-none dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "group-data-[variant=line]/tabs-list:h-[calc(100%-1px)] group-data-[variant=line]/tabs-list:px-1.5 group-data-[variant=line]/tabs-list:py-0.5 group-data-[variant=line]/tabs-list:text-foreground/60 group-data-[variant=line]/tabs-list:hover:text-foreground dark:group-data-[variant=line]/tabs-list:text-muted-foreground dark:group-data-[variant=line]/tabs-list:hover:text-foreground",
        "group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:text-foreground dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:text-foreground",
        "group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:bg-foreground group-data-[variant=line]/tabs-list:after:opacity-0 group-data-[variant=line]/tabs-list:after:transition-opacity group-data-[variant=line]/tabs-list:data-active:after:opacity-100 group-data-horizontal/tabs:group-data-[variant=line]/tabs-list:after:inset-x-0 group-data-horizontal/tabs:group-data-[variant=line]/tabs-list:after:bottom-[-5px] group-data-horizontal/tabs:group-data-[variant=line]/tabs-list:after:h-0.5 group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:inset-y-0 group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:-right-1 group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:w-0.5",
        "group-data-[variant=pill]/tabs-list:relative group-data-[variant=pill]/tabs-list:z-10 group-data-[variant=pill]/tabs-list:rounded-[var(--radius-md)] group-data-[variant=pill]/tabs-list:px-2.5 group-data-[variant=pill]/tabs-list:py-1.5 group-data-[variant=pill]/tabs-list:text-muted-foreground group-data-[variant=pill]/tabs-list:hover:text-foreground group-data-[variant=pill]/tabs-list:data-active:text-foreground",
        "group-data-[variant=filter]/tabs-list:h-8 group-data-[variant=filter]/tabs-list:flex-initial group-data-[variant=filter]/tabs-list:rounded-sm group-data-[variant=filter]/tabs-list:border group-data-[variant=filter]/tabs-list:px-3 group-data-[variant=filter]/tabs-list:text-xs group-data-[variant=filter]/tabs-list:border-border group-data-[variant=filter]/tabs-list:bg-background group-data-[variant=filter]/tabs-list:text-muted-foreground group-data-[variant=filter]/tabs-list:hover:border-foreground/15 group-data-[variant=filter]/tabs-list:hover:bg-muted/40 group-data-[variant=filter]/tabs-list:hover:text-foreground group-data-[variant=filter]/tabs-list:focus-visible:ring-3 group-data-[variant=filter]/tabs-list:focus-visible:ring-ring/50",
        "group-data-[variant=filter]/tabs-list:data-active:border-foreground/15 group-data-[variant=filter]/tabs-list:data-active:bg-foreground/6 group-data-[variant=filter]/tabs-list:data-active:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
