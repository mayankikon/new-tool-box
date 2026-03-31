"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"
import { ChevronRightIcon, CheckIcon, SearchIcon, PlusIcon } from "lucide-react"

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn("z-50 max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-sm bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95", className )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-pointer items-center gap-1.5 rounded-xs px-1.5 py-1 text-sm whitespace-nowrap outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-xs px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn("w-auto min-w-[96px] rounded-sm bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-pointer items-center gap-1.5 rounded-xs py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon
          />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-pointer items-center gap-1.5 rounded-xs py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon
          />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuItemRow({
  className,
  variant = "default",
  leadIcon,
  avatar,
  label,
  caption,
  badge,
  tailIcon,
  disabled,
  ...props
}: Omit<MenuPrimitive.Item.Props, "children"> & {
  variant?: "default" | "large"
  leadIcon?: React.ReactNode
  avatar?: React.ReactNode
  label: string
  caption?: string
  badge?: React.ReactNode
  tailIcon?: React.ReactNode
  disabled?: boolean
}) {
  const isLarge = variant === "large"

  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item-row"
      data-variant={variant}
      disabled={disabled}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-pointer items-center rounded-xs px-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        isLarge ? "gap-2 px-2 py-1.5" : "gap-1 p-1.5",
        className
      )}
      {...props}
    >
      {leadIcon && !avatar && (
        <span
          data-slot="dropdown-menu-item-lead-icon"
          className={cn(
            "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
            isLarge
              ? "size-9 rounded-full bg-muted [&_svg:not([class*='size-'])]:size-4"
              : "size-5 [&_svg:not([class*='size-'])]:size-4"
          )}
        >
          {leadIcon}
        </span>
      )}
      {avatar && (
        <span
          data-slot="dropdown-menu-item-avatar"
          className="flex shrink-0 items-center"
        >
          {avatar}
        </span>
      )}
      <span
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1",
          isLarge ? "flex-col items-start gap-0.5 px-1" : "px-1"
        )}
      >
        <span className={cn(
          "truncate",
          isLarge ? "text-sm font-medium" : "text-sm"
        )}>
          {label}
        </span>
        {caption && (
          <span className={cn(
            "truncate text-muted-foreground",
            isLarge ? "text-xs" : "text-xs"
          )}>
            {caption}
          </span>
        )}
      </span>
      {badge && (
        <span data-slot="dropdown-menu-item-badge" className="shrink-0">
          {badge}
        </span>
      )}
      {tailIcon && (
        <span
          data-slot="dropdown-menu-item-tail-icon"
          className="flex shrink-0 items-center justify-center size-5 text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          {tailIcon}
        </span>
      )}
    </MenuPrimitive.Item>
  )
}

function DropdownMenuUserbar({
  className,
  avatar,
  name,
  email,
  badge,
  ...props
}: React.ComponentProps<"div"> & {
  avatar?: React.ReactNode
  name: string
  email?: string
  badge?: React.ReactNode
}) {
  return (
    <div
      data-slot="dropdown-menu-userbar"
      className={cn(
        "flex items-center gap-2 px-3 py-1",
        className
      )}
      {...props}
    >
      {avatar && (
        <span className="flex shrink-0 items-center">{avatar}</span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{name}</span>
        {email && (
          <span className="truncate text-xs text-muted-foreground">
            {email}
          </span>
        )}
      </span>
      {badge && (
        <span className="shrink-0">{badge}</span>
      )}
    </div>
  )
}

function DropdownMenuCaption({
  className,
  label,
  description,
  ...props
}: React.ComponentProps<"div"> & {
  label: string
  description?: string
}) {
  return (
    <div
      data-slot="dropdown-menu-caption"
      className={cn(
        "flex flex-col gap-0.5 px-3 py-1",
        className
      )}
      {...props}
    >
      <span className="text-sm text-foreground">{label}</span>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
    </div>
  )
}

function DropdownMenuSearchInput({
  className,
  value,
  onChange,
  placeholder = "Search",
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) {
  return (
    <div
      data-slot="dropdown-menu-search-input"
      className={cn(
        "flex items-center gap-1.5 border-b border-border px-2",
        className
      )}
    >
      <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
      <input
        type="text"
        role="searchbox"
        aria-label={placeholder}
        className="h-9 min-h-[36px] w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
}

function DropdownMenuFooterAction({
  className,
  icon,
  label,
  onClick,
  ...props
}: React.ComponentProps<"button"> & {
  icon?: React.ReactNode
  label: string
}) {
  return (
    <div
      data-slot="dropdown-menu-footer"
      className="border-t border-border"
    >
      <button
        type="button"
        className={cn(
          "flex w-full cursor-pointer items-center justify-center gap-1 px-2.5 py-2 text-sm font-medium text-foreground outline-hidden hover:bg-accent focus-visible:bg-accent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {icon ?? <PlusIcon />}
        <span className="px-0.5">{label}</span>
      </button>
    </div>
  )
}

function DropdownMenuButtonRow({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-button-row"
      className={cn(
        "flex items-center gap-2 px-3 py-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItemRow,
  DropdownMenuUserbar,
  DropdownMenuCaption,
  DropdownMenuSearchInput,
  DropdownMenuFooterAction,
  DropdownMenuButtonRow,
}
