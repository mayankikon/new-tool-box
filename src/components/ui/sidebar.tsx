"use client";

import { useState, useEffect, useRef } from "react";
import {
  BookUser,
  Home,
  LayoutDashboard,
  CreditCard,
  FileText,
  UserCog,
  Settings,
  Bell,
  Megaphone,
  Settings2,
  LogOut,
  PanelLeftClose,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

import { BoundaryIcon } from "@/components/icons/boundary-icon";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { cn } from "@/lib/utils";

/* Sidebar uses design tokens: --sidebar, --sidebar-foreground, --sidebar-accent,
   --sidebar-border, --spacing-*, --radius-sm, --text-sm, --leading-5, theme text/background. */

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 72;

/** Nav row: either a Lucide glyph or a static asset from `public/` (`iconSrc`, e.g. Geofences → `/boundary.svg`). */
export type SidebarNavItemConfig =
  | {
      label: string;
      icon: LucideIcon;
      isActive?: boolean;
      href?: string;
    }
  | {
      label: string;
      iconSrc: string;
      isActive?: boolean;
      href?: string;
    };

export interface SidebarNavSectionConfig {
  title?: string;
  items: SidebarNavItemConfig[];
}

export interface SidebarUserConfig {
  primaryText: string;
  secondaryText: string;
  initials?: string;
  logoSrc?: string;
}

export interface SidebarProductConfig {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface SidebarProps {
  className?: string;
  logo?: React.ReactNode;
  user?: SidebarUserConfig;
  products?: SidebarProductConfig[];
  activeProductId?: string;
  onProductChange?: (productId: string) => void;
  showTopProductSwitcher?: boolean;
  showFooterProductToggle?: boolean;
  mainSections?: SidebarNavSectionConfig[];
  settingsSections?: SidebarNavSectionConfig[];
  onNavItemClick?: (label: string) => void;
  onFold?: () => void;
  onLogOut?: () => void;
  /** Enables collapse/expand behavior. Defaults to false to preserve current behavior. */
  collapsible?: boolean;
  /** Controlled collapsed state. */
  collapsed?: boolean;
  /** Uncontrolled initial collapsed state. */
  defaultCollapsed?: boolean;
  /** Called whenever collapse state toggles. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Expanded width in px. */
  expandedWidth?: number;
  /** Collapsed width in px (icon rail). */
  collapsedWidth?: number;
}

function ToolboxLogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 225 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Toolbox"
    >
      <path d="M82.543 2C81.0239 2 79.7924 3.23036 79.7924 4.74809V15.1298H84.071V6.27481H140.915V15.1298H145.194V4.74809C145.194 3.23036 143.962 2 142.443 2H82.543Z" fill="currentColor"/>
      <path d="M33.0701 33.0888V37.1902H27.1656V68.2595H22.1046V37.1902H16.2001V33.0888H33.0701Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M49.1286 33.0888H55.3704C58.8569 33.0888 60.6001 34.7369 60.6001 38.033V63.3154C60.6001 66.6115 58.8569 68.2595 55.3704 68.2595H49.1286C45.6046 68.2595 43.8426 66.6115 43.8426 63.3154V38.033C43.8426 34.7369 45.6046 33.0888 49.1286 33.0888ZM55.5391 62.5288V38.8195C55.5391 38.1453 55.4267 37.7146 55.2017 37.5273C54.9768 37.3026 54.5269 37.1902 53.8521 37.1902H50.5906C49.9158 37.1902 49.466 37.3026 49.241 37.5273C49.0536 37.7146 48.9599 38.1453 48.9599 38.8195V62.5288C48.9599 63.203 49.0536 63.6525 49.241 63.8772C49.466 64.0645 49.9158 64.1581 50.5906 64.1581H53.8521C54.5269 64.1581 54.9768 64.0645 55.2017 63.8772C55.4267 63.6525 55.5391 63.203 55.5391 62.5288Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M79.0771 33.0888H85.3189C88.8054 33.0888 90.5486 34.7369 90.5486 38.033V63.3154C90.5486 66.6115 88.8054 68.2595 85.3189 68.2595H79.0771C75.5531 68.2595 73.7911 66.6115 73.7911 63.3154V38.033C73.7911 34.7369 75.5531 33.0888 79.0771 33.0888ZM85.4876 62.5288V38.8195C85.4876 38.1453 85.3752 37.7146 85.1502 37.5273C84.9253 37.3026 84.4754 37.1902 83.8006 37.1902H80.5391C79.8643 37.1902 79.4145 37.3026 79.1895 37.5273C79.0021 37.7146 78.9084 38.1453 78.9084 38.8195V62.5288C78.9084 63.203 79.0021 63.6525 79.1895 63.8772C79.4145 64.0645 79.8643 64.1581 80.5391 64.1581H83.8006C84.4754 64.1581 84.9253 64.0645 85.1502 63.8772C85.3752 63.6525 85.4876 63.203 85.4876 62.5288Z" fill="currentColor"/>
      <path d="M109.082 64.1581H117.798V68.2595H104.021V33.0888H109.082V64.1581Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M128.807 33.0888H141.01C144.534 33.0888 146.296 34.7369 146.296 38.033V46.9661C146.296 48.9512 145.546 50.1123 144.046 50.4494C145.546 50.824 146.296 51.9102 146.296 53.7081V63.3154C146.296 66.6115 144.534 68.2595 141.01 68.2595H128.807V33.0888ZM141.179 46.7414V38.7072C141.179 38.033 141.066 37.6022 140.841 37.4149C140.616 37.1902 140.166 37.0778 139.492 37.0778H133.868V48.3707H139.492C140.166 48.3707 140.616 48.277 140.841 48.0898C141.066 47.865 141.179 47.4156 141.179 46.7414ZM141.179 62.6412V53.989C141.179 53.3148 141.066 52.8841 140.841 52.6968C140.616 52.472 140.166 52.3597 139.492 52.3597H133.868V64.2705H139.492C140.166 64.2705 140.616 64.1769 140.841 63.9896C141.066 63.7649 141.179 63.3154 141.179 62.6412Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M164.694 33.0888H170.936C174.422 33.0888 176.166 34.7369 176.166 38.033V63.3154C176.166 66.6115 174.422 68.2595 170.936 68.2595H164.694C161.17 68.2595 159.408 66.6115 159.408 63.3154V38.033C159.408 34.7369 161.17 33.0888 164.694 33.0888ZM171.105 62.5288V38.8195C171.105 38.1453 170.992 37.7146 170.767 37.5273C170.542 37.3026 170.092 37.1902 169.418 37.1902H166.156C165.481 37.1902 165.031 37.3026 164.807 37.5273C164.619 37.7146 164.525 38.1453 164.525 38.8195V62.5288C164.525 63.203 164.619 63.6525 164.807 63.8772C165.031 64.0645 165.481 64.1581 166.156 64.1581H169.418C170.092 64.1581 170.542 64.0645 170.767 63.8772C170.992 63.6525 171.105 63.203 171.105 62.5288Z" fill="currentColor"/>
      <path d="M199.929 50.2809L207.464 68.2595H201.84L197.117 54.8879L192.393 68.2595H186.939L194.361 50.2809L187.445 33.0888H193.068L197.117 45.7301L201.222 33.0888H206.733L199.929 50.2809Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M6.75053 19.0992C5.23145 19.0992 4 20.3296 4 21.8473V79.2519C4 80.7696 5.23143 82 6.75053 82H218.236C219.755 82 220.986 80.7696 220.986 79.2519V21.8473C220.986 20.3296 219.755 19.0992 218.236 19.0992H6.75053ZM8.2786 77.7252V23.3741H216.708V77.7252H8.2786Z" fill="currentColor"/>
    </svg>
  );
}

function SidebarLogo({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-px">
      {children ?? (
        <ToolboxLogoMark className="h-10 w-auto text-primary" />
      )}
    </div>
  );
}

function SidebarFoldButton({
  collapsible,
  collapsed,
  onToggle,
  className,
}: {
  collapsible: boolean;
  collapsed: boolean;
  onToggle?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={
        collapsible
          ? collapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
          : "Collapse sidebar"
      }
      aria-expanded={collapsible ? !collapsed : undefined}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        className
      )}
    >
      <PanelLeftClose
        className={cn(
          "size-4 transition-transform duration-200 motion-reduce:transition-none",
          collapsed && "rotate-180"
        )}
        aria-hidden
      />
    </button>
  );
}

function SidebarHeader({
  logo,
  collapsed,
  showFoldButton,
  collapsible,
  onToggleCollapse,
}: {
  logo?: React.ReactNode;
  collapsed: boolean;
  showFoldButton: boolean;
  collapsible: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 items-center",
        collapsed ? "justify-center" : "justify-between"
      )}
      style={{
        paddingBottom: "var(--spacing-16)",
        paddingLeft: collapsed ? "var(--spacing-8)" : "var(--spacing-16)",
        paddingRight: collapsed ? "var(--spacing-8)" : "var(--spacing-16)",
        paddingTop: "var(--spacing-24)",
      }}
    >
      <SidebarLogo>
        {logo ?? (
          <ToolboxLogoMark
            className={cn(
              "w-auto text-primary transition-[height] duration-200 motion-reduce:transition-none",
              collapsed ? "h-7" : "h-10"
            )}
          />
        )}
      </SidebarLogo>
      {showFoldButton ? (
        <SidebarFoldButton
          collapsible={collapsible}
          collapsed={collapsed}
          onToggle={onToggleCollapse}
          className={collapsed ? "absolute right-[var(--spacing-8)] top-[var(--spacing-24)]" : undefined}
        />
      ) : null}
    </div>
  );
}

function SidebarUserBar({
  user,
  collapsed,
}: {
  user: SidebarUserConfig;
  collapsed: boolean;
}) {
  const initials = user.initials ?? user.primaryText.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "w-full",
        collapsed ? "px-[var(--spacing-8)]" : "px-[var(--spacing-16)]"
      )}
      style={{ paddingTop: 0, paddingBottom: "var(--spacing-8)" }}
    >
      <button
        type="button"
        title={collapsed ? user.primaryText : undefined}
        className={cn(
          "flex h-[52px] w-full cursor-pointer items-center gap-[var(--spacing-8)] rounded-[var(--radius-sm)] border border-border p-[var(--spacing-8)] transition-colors hover:bg-muted",
          collapsed && "justify-center"
        )}
        style={{ minHeight: 52, backgroundColor: "var(--theme-background-account-selector)" }}
      >
        <div
          className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-muted text-muted-foreground"
          style={{ fontSize: "var(--text-sm)" }}
          aria-hidden
        >
          {user.logoSrc ? (
            <img
              src={user.logoSrc}
              alt=""
              className="size-full object-contain"
            />
          ) : (
            initials
          )}
        </div>
        {!collapsed ? (
          <>
            <div className="min-w-0 flex-1 text-left">
              <p
                className="truncate font-medium leading-[var(--leading-5)]"
                style={{
                  color: "var(--theme-text-primary)",
                  fontSize: "var(--text-xs)",
                }}
              >
                {user.primaryText}
              </p>
              <p
                className="truncate font-normal"
                style={{
                  color: "var(--theme-text-secondary)",
                  fontSize: "var(--text-xs)",
                }}
              >
                {user.secondaryText}
              </p>
            </div>
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </>
        ) : null}
      </button>
    </div>
  );
}

function SidebarProductSwitcher({
  products,
  activeProductId,
  onProductChange,
  collapsed,
}: {
  products: SidebarProductConfig[];
  activeProductId: string;
  onProductChange?: (productId: string) => void;
  collapsed: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const activeProduct =
    products.find((p) => p.id === activeProductId) ?? products[0];
  const ActiveIcon = activeProduct.icon;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        paddingLeft: collapsed ? "var(--spacing-8)" : "var(--spacing-16)",
        paddingRight: collapsed ? "var(--spacing-8)" : "var(--spacing-16)",
        paddingBottom: "var(--spacing-4)",
      }}
    >
      <button
        type="button"
        title={collapsed ? activeProduct.label : undefined}
        onClick={() => {
          if (collapsed) return;
          setIsOpen(!isOpen);
        }}
        className={cn(
          "flex h-9 w-full items-center gap-[var(--spacing-6)] rounded-[var(--radius-sm)] px-[var(--spacing-6)] transition-colors hover:bg-muted",
          collapsed && "justify-center px-0"
        )}
      >
        <span
          className="flex size-5 shrink-0 items-center justify-center"
          style={{ color: "var(--theme-text-primary)" }}
        >
          <ActiveIcon className="size-[18px]" aria-hidden />
        </span>
        {!collapsed ? (
          <>
            <span
              className="min-w-0 flex-1 truncate text-left font-semibold"
              style={{
                fontSize: "var(--text-sm)",
                lineHeight: "var(--leading-5)",
                color: "var(--theme-text-primary)",
              }}
            >
              {activeProduct.label}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              aria-hidden
            />
          </>
        ) : null}
      </button>
      {isOpen && !collapsed && (
        <div className="absolute left-[var(--spacing-16)] right-[var(--spacing-16)] top-full z-50 mt-1 overflow-hidden rounded-[var(--radius-sm)] border border-border bg-card shadow-lg">
          {products.map((product) => {
            const Icon = product.icon;
            const isActive = product.id === activeProductId;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  onProductChange?.(product.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-[var(--spacing-6)] px-[var(--spacing-8)] py-[var(--spacing-6)] transition-colors",
                  isActive ? "bg-muted" : "hover:bg-muted/50"
                )}
              >
                <span
                  className="flex size-5 shrink-0 items-center justify-center"
                  style={{
                    color: isActive
                      ? "var(--theme-text-primary)"
                      : "var(--theme-text-secondary)",
                  }}
                >
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <span
                  className="min-w-0 flex-1 truncate text-left font-medium"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: isActive
                      ? "var(--theme-text-primary)"
                      : "var(--theme-text-secondary)",
                  }}
                >
                  {product.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SidebarNavStaticIcon({ src }: { src: string }) {
  if (src === "/boundary.svg") {
    return <BoundaryIcon className="size-[18px]" />;
  }
  return (
    <img
      src={src}
      alt=""
      className="size-[18px] shrink-0 object-contain opacity-90"
      aria-hidden
    />
  );
}

function SidebarNavPrimaryIcon({ item }: { item: SidebarNavItemConfig }) {
  if ("iconSrc" in item) {
    return <SidebarNavStaticIcon src={item.iconSrc} />;
  }
  const Icon = item.icon;
  return <Icon className="size-[18px]" aria-hidden />;
}

function SidebarNavItem({
  item,
  onClick,
  collapsed,
}: {
  item: SidebarNavItemConfig;
  onClick?: () => void;
  collapsed: boolean;
}) {
  const isActive = item.isActive ?? false;
  const content = (
    <>
      <span className="flex size-5 shrink-0 items-center justify-center">
        <SidebarNavPrimaryIcon item={item} />
      </span>
      {!collapsed ? (
        <span
          className="min-w-0 truncate font-medium"
          style={{
            fontSize: "var(--text-sm)",
            lineHeight: "var(--leading-5)",
          }}
        >
          {item.label}
        </span>
      ) : null}
    </>
  );

  const baseClasses =
    "flex w-full items-center gap-[var(--spacing-6)] rounded-[var(--radius-sm)] p-[var(--spacing-8)] h-9 transition-colors";
  /** Active row: sidebar accent surface + matching foreground (dark text in light mode, light text in dark). */
  const activeClasses =
    "bg-sidebar-accent font-medium text-sidebar-accent-foreground";
  const inactiveClasses =
    "bg-transparent text-[color:var(--theme-text-secondary)] hover:bg-[color:var(--sidebar-nav-item-hover-bg)] hover:text-foreground";

  if (item.href) {
    return (
      <a
        href={item.href}
        className={cn(
          baseClasses,
          collapsed && "justify-center gap-0 px-0",
          isActive ? activeClasses : inactiveClasses
        )}
        title={collapsed ? item.label : undefined}
        aria-current={isActive ? "page" : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        baseClasses,
        collapsed && "justify-center gap-0 px-0",
        isActive ? activeClasses : inactiveClasses
      )}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? "page" : undefined}
    >
      {content}
    </button>
  );
}

function SidebarNavSection({
  section,
  onItemClick,
  collapsed,
  paddingTop: paddingTopOverride,
  paddingBottom: paddingBottomOverride,
}: {
  section: SidebarNavSectionConfig;
  onItemClick?: (label: string) => void;
  collapsed: boolean;
  paddingTop?: string;
  paddingBottom?: string;
}) {
  return (
    <div
      className="flex w-full flex-col gap-[2px]"
      style={{
        paddingLeft: collapsed ? "var(--spacing-8)" : "var(--spacing-16)",
        paddingRight: collapsed ? "var(--spacing-8)" : "var(--spacing-16)",
        paddingTop: paddingTopOverride ?? "var(--spacing-16)",
        paddingBottom: paddingBottomOverride ?? "var(--spacing-16)",
      }}
    >
      {section.title && !collapsed && (
        <div
          className="px-[var(--spacing-8)] py-[var(--spacing-4)] font-medium"
          style={{
            fontSize: "var(--text-xs)",
            lineHeight: "var(--leading-5)",
            color: "var(--theme-text-secondary)",
          }}
        >
          {section.title}
        </div>
      )}
      <div className="flex flex-col gap-[2px]">
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.label}
            item={item}
            collapsed={collapsed}
            onClick={() => onItemClick?.(item.label)}
          />
        ))}
      </div>
    </div>
  );
}

function SidebarFooter({
  onLogOut,
  collapsed,
}: {
  onLogOut?: () => void;
  collapsed: boolean;
}) {
  return (
    <div
      className="flex w-full shrink-0 items-center gap-[var(--spacing-8)]"
      style={{
        paddingLeft: "var(--spacing-16)",
        paddingRight: "var(--spacing-16)",
        paddingTop: "var(--spacing-8)",
        paddingBottom: "var(--spacing-8)",
      }}
    >
      <button
        type="button"
        onClick={onLogOut}
        title={collapsed ? "Log out" : undefined}
        className={cn(
          "flex flex-1 items-center gap-[var(--spacing-6)] rounded-[var(--radius-sm)] p-[var(--spacing-6)] transition-colors hover:bg-muted",
          collapsed && "justify-center"
        )}
        style={{
          fontSize: "var(--text-sm)",
          lineHeight: "var(--leading-5)",
          color: "var(--theme-text-primary)",
        }}
      >
        <span className="flex size-5 shrink-0 items-center justify-center">
          <LogOut className="size-[18px]" aria-hidden />
        </span>
        {!collapsed ? <span className="font-medium">Log out</span> : null}
      </button>
    </div>
  );
}

function SidebarProductFooterToggle({
  products,
  activeProductId,
  onProductChange,
}: {
  products: SidebarProductConfig[];
  activeProductId: string;
  onProductChange?: (productId: string) => void;
}) {
  if (products.length !== 2) return null;
  const [left, right] = products;
  const LeftIcon = left.icon;
  const RightIcon = right.icon;

  return (
    <div
      className="flex w-full justify-center"
      style={{
        paddingTop: "var(--spacing-8)",
        paddingBottom: "var(--spacing-4)",
      }}
    >
      <ToggleSwitch
        aria-label="Active app module"
        size="default"
        className={cn(
          "inline-flex h-12 rounded-[12px] bg-[#D7D7D7] p-1",
          "[&_[role=radio]]:h-10 [&_[role=radio]]:min-w-10 [&_[role=radio]]:px-0",
          "[&_[role=radio]]:text-[#6E6E6E] [&_[role=radio][data-active]]:text-[#2E2E2E]"
        )}
        value={activeProductId}
        onValueChange={(value) => onProductChange?.(value)}
        options={[
          {
            value: left.id,
            label: left.label,
            icon: <LeftIcon className="size-[18px]" aria-hidden />,
          },
          {
            value: right.id,
            label: right.label,
            icon: <RightIcon className="size-[18px]" aria-hidden />,
          },
        ]}
      />
    </div>
  );
}

const defaultMainSections: SidebarNavSectionConfig[] = [
  {
    items: [
      { label: "Home", icon: Home },
      { label: "Dashboard", icon: LayoutDashboard },
      { label: "Customers", icon: BookUser },
      { label: "Billing", icon: CreditCard, isActive: true },
      { label: "Reports", icon: FileText },
      { label: "Staff", icon: UserCog },
    ],
  },
];

const defaultSettingsSections: SidebarNavSectionConfig[] = [
  {
    title: "Settings",
    items: [
      { label: "General", icon: Settings },
      { label: "Alerts", icon: Bell },
      { label: "Marketing", icon: Megaphone },
      { label: "Configurations", icon: Settings2 },
    ],
  },
];

const defaultUser: SidebarUserConfig = {
  primaryText: "BMW ACME Dealership",
  secondaryText: "Automobile Group",
  logoSrc: "/account-logo-placeholder.png",
};

export function Sidebar({
  className,
  logo,
  user = defaultUser,
  products,
  activeProductId,
  onProductChange,
  showTopProductSwitcher = true,
  showFooterProductToggle = true,
  mainSections = defaultMainSections,
  settingsSections = defaultSettingsSections,
  onNavItemClick,
  onFold,
  onLogOut,
  collapsible = false,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  expandedWidth = SIDEBAR_WIDTH,
  collapsedWidth = SIDEBAR_COLLAPSED_WIDTH,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = collapsed ?? internalCollapsed;
  const showFoldButton = true;

  function handleToggleCollapse() {
    if (!collapsible) {
      onFold?.();
      return;
    }
    const next = !isCollapsed;
    if (collapsed == null) {
      setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
    onFold?.();
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-sidebar isolate",
        "transition-[width] duration-300 ease-out motion-reduce:transition-none",
        className
      )}
      style={{ width: isCollapsed ? collapsedWidth : expandedWidth }}
      aria-label="Main navigation"
    >
      <SidebarHeader
        logo={logo}
        collapsed={isCollapsed}
        showFoldButton={showFoldButton}
        collapsible={collapsible}
        onToggleCollapse={handleToggleCollapse}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <SidebarUserBar user={user} collapsed={isCollapsed} />
        {showTopProductSwitcher && products && activeProductId && (
          <SidebarProductSwitcher
            products={products}
            activeProductId={activeProductId}
            onProductChange={onProductChange}
            collapsed={isCollapsed}
          />
        )}
        {mainSections.map((section, index) => (
          <SidebarNavSection
            key={section.title ?? `main-${index}`}
            section={section}
            collapsed={isCollapsed}
            onItemClick={onNavItemClick}
            paddingTop={index === 0 ? "var(--spacing-8)" : undefined}
            paddingBottom={
              index === mainSections.length - 1
                ? "var(--spacing-8)"
                : undefined
            }
          />
        ))}
        {settingsSections.map((section, index) => (
          <SidebarNavSection
            key={section.title ?? `settings-${index}`}
            section={section}
            collapsed={isCollapsed}
            onItemClick={onNavItemClick}
            paddingTop={index === 0 ? "var(--spacing-8)" : undefined}
          />
        ))}
      </div>
      {showFooterProductToggle && products && activeProductId && !isCollapsed ? (
        <SidebarProductFooterToggle
          products={products}
          activeProductId={activeProductId}
          onProductChange={onProductChange}
        />
      ) : null}
      <SidebarFooter onLogOut={onLogOut} collapsed={isCollapsed} />
    </aside>
  );
}
