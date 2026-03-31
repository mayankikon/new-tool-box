"use client";

import {
  type CSSProperties,
  type ComponentType,
  type ReactNode,
  type SVGProps,
  useEffect,
  useRef,
  useState,
} from "react";
import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { Text } from "@visx/text";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableHeaderCell } from "@/components/ui/table-header-cell";
import { cn } from "@/lib/utils";
import type {
  InventoryDashboardIcon,
  InventoryDevicesSoldTableColumn,
  InventoryDevicesSoldTableRow,
  InventoryDonutMetric,
  InventoryMetricSlice,
  InventoryPeriodMetric,
  InventoryStatusMetric,
} from "@/lib/inventory/dashboard-data";

export interface InventoryDashboardWidgetSettings {
  typography: {
    labelFamily: string;
    labelSize: number;
    labelWeight: number;
    valueFamily: string;
    valueSize: number;
    valueWeight: number;
    titleFamily: string;
    titleSize: number;
    titleWeight: number;
    captionSize: number;
    captionWeight: number;
    legendLabelSize: number;
    legendLabelWeight: number;
    legendValueSize: number;
    legendValueWeight: number;
    donutCenterLabelSize: number;
    donutCenterLabelWeight: number;
    donutCenterValueSize: number;
    periodCenterLabelSize: number;
    periodCenterLabelWeight: number;
    periodCenterValueSize: number;
  };
  layout: {
    cardRadius: number;
    cardGap: number;
    cardPaddingX: number;
    cardPaddingY: number;
    titleGap: number;
    headerBodyGap: number;
    bodyInsetTop: number;
    bodyInsetBottom: number;
    bodyAlignX: "start" | "center" | "end" | "stretch";
    bodyAlignY: "start" | "center" | "end" | "stretch";
    kpiCardHeight: number;
    statusCardHeight: number;
    donutCardHeight: number;
    devicesCardHeight: number;
    progressBarHeight: number;
    chartSize: number;
    periodChartSize: number;
    ringThickness: number;
    legendGap: number;
    legendRowGap: number;
    legendTopGap: number;
    legendWidth: number;
    donutSideInset: number;
    donutContentOffsetY: number;
    devicesGapX: number;
    devicesGapY: number;
    debugShowBounds: boolean;
    debugShowCenter: boolean;
    debugShowMeasurements: boolean;
  };
}

export interface DashboardKpiMetric {
  label: string;
  value: string;
  icon: InventoryDashboardIcon | ComponentType<{ className?: string }>;
  caption?: string;
  iconClassName?: string;
}

export const defaultWidgetSettings: InventoryDashboardWidgetSettings = {
  typography: {
    labelFamily: "var(--font-body)",
    labelSize: 14,
    labelWeight: 500,
    valueFamily: "var(--font-headline)",
    valueSize: 24,
    valueWeight: 500,
    titleFamily: "var(--font-body)",
    titleSize: 14,
    titleWeight: 500,
    captionSize: 14,
    captionWeight: 400,
    legendLabelSize: 16,
    legendLabelWeight: 400,
    legendValueSize: 16,
    legendValueWeight: 500,
    donutCenterLabelSize: 14,
    donutCenterLabelWeight: 400,
    donutCenterValueSize: 18,
    periodCenterLabelSize: 14,
    periodCenterLabelWeight: 400,
    periodCenterValueSize: 18,
  },
  layout: {
    cardRadius: 6,
    cardGap: 16,
    cardPaddingX: 24,
    cardPaddingY: 24,
    titleGap: 6,
    headerBodyGap: 18,
    bodyInsetTop: 0,
    bodyInsetBottom: 0,
    bodyAlignX: "center",
    bodyAlignY: "center",
    kpiCardHeight: 106,
    statusCardHeight: 198,
    donutCardHeight: 340,
    devicesCardHeight: 760,
    progressBarHeight: 8,
    chartSize: 192,
    periodChartSize: 218,
    ringThickness: 20,
    legendGap: 40,
    legendRowGap: 8,
    legendTopGap: 0,
    legendWidth: 216,
    donutSideInset: 24,
    donutContentOffsetY: 0,
    devicesGapX: 48,
    devicesGapY: 20,
    debugShowBounds: false,
    debugShowCenter: false,
    debugShowMeasurements: false,
  },
};

export const inventoryDashboardShowcaseWidgetSettings: Partial<InventoryDashboardWidgetSettings> =
  {
    typography: {
      labelFamily: "var(--font-body)",
      labelSize: 14,
      labelWeight: 500,
      valueFamily: "var(--font-headline)",
      valueSize: 24,
      valueWeight: 500,
      titleFamily: "var(--font-body)",
      titleSize: 14,
      titleWeight: 500,
      captionSize: 14,
      captionWeight: 400,
      legendLabelSize: 14,
      legendLabelWeight: 400,
      legendValueSize: 14,
      legendValueWeight: 500,
      donutCenterLabelSize: 14,
      donutCenterLabelWeight: 400,
      donutCenterValueSize: 24,
      periodCenterLabelSize: 14,
      periodCenterLabelWeight: 400,
      periodCenterValueSize: 24,
    },
    layout: {
      cardPaddingX: 24,
      cardPaddingY: 24,
      cardRadius: 6,
      titleGap: 6,
      headerBodyGap: 18,
      bodyInsetTop: 0,
      bodyInsetBottom: 0,
      bodyAlignX: "start",
      bodyAlignY: "start",
      kpiCardHeight: 106,
      statusCardHeight: 198,
      donutCardHeight: 298,
      devicesCardHeight: 760,
      progressBarHeight: 8,
      chartSize: 192,
      periodChartSize: 218,
      ringThickness: 20,
      legendGap: 40,
      legendRowGap: 8,
      legendTopGap: 0,
      legendWidth: 216,
      donutSideInset: 36,
      donutContentOffsetY: 8,
      devicesGapX: 48,
      devicesGapY: 16,
      debugShowBounds: false,
      debugShowCenter: false,
      debugShowMeasurements: false,
      cardGap: defaultWidgetSettings.layout.cardGap,
    },
  };

export function mergeInventoryDashboardWidgetSettings(
  settings?: Partial<InventoryDashboardWidgetSettings>
): InventoryDashboardWidgetSettings {
  return {
    typography: {
      ...defaultWidgetSettings.typography,
      ...settings?.typography,
    },
    layout: {
      ...defaultWidgetSettings.layout,
      ...settings?.layout,
    },
  };
}

function DashboardSvgIcon({
  className,
  children,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

function DashboardMetricIcon({
  icon,
  size,
  className,
}: {
  icon: InventoryDashboardIcon;
  size: number;
  className?: string;
}) {
  const sharedProps = {
    className: cn("shrink-0 text-[var(--theme-text-primary)]", className),
    style: { width: size, height: size } satisfies CSSProperties,
  };

  switch (icon) {
    case "battery-warning":
      return (
        <DashboardSvgIcon {...sharedProps}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.5 5.83341H2.49998L2.49998 16.6667H17.5V5.83341ZM2.49998 4.16675C1.57951 4.16675 0.833313 4.91294 0.833313 5.83341V16.6667C0.833313 17.5872 1.5795 18.3334 2.49998 18.3334H17.5C18.4205 18.3334 19.1666 17.5872 19.1666 16.6667V5.83341C19.1666 4.91294 18.4205 4.16675 17.5 4.16675H2.49998Z"
            fill="currentColor"
          />
          <path
            d="M11.6666 2.50008C11.6666 2.03984 12.0397 1.66675 12.5 1.66675H15C15.4602 1.66675 15.8333 2.03984 15.8333 2.50008C15.8333 2.96032 15.4602 3.33341 15 3.33341H12.5C12.0397 3.33341 11.6666 2.96032 11.6666 2.50008Z"
            fill="currentColor"
          />
          <path
            d="M4.16665 2.50008C4.16665 2.03984 4.53974 1.66675 4.99998 1.66675H7.49998C7.96022 1.66675 8.33331 2.03984 8.33331 2.50008C8.33331 2.96032 7.96022 3.33341 7.49998 3.33341H4.99998C4.53974 3.33341 4.16665 2.96032 4.16665 2.50008Z"
            fill="currentColor"
          />
          <rect x="3.33331" y="12.5" width="13.3333" height="3.33333" fill="#E50C0C" />
        </DashboardSvgIcon>
      );
    case "radio-off":
      return (
        <DashboardSvgIcon {...sharedProps}>
          <path
            d="M3.40261 2.75153C3.05877 2.37984 3.08136 1.79979 3.45305 1.45596C3.82474 1.11212 4.40479 1.13471 4.74862 1.5064L5.62743 2.45641C7.03204 1.93468 8.51959 1.6669 10.0205 1.6669C11.6776 1.6669 13.3185 1.99334 14.8494 2.6276C16.3803 3.26185 17.7713 4.19148 18.943 5.3634C19.0948 5.52057 19.1787 5.73107 19.1768 5.94957C19.1749 6.16807 19.0873 6.37708 18.9328 6.53158C18.7783 6.68609 18.5693 6.77373 18.3508 6.77563C18.1323 6.77753 17.9218 6.69353 17.7646 6.54173C16.7477 5.52463 15.5404 4.7178 14.2117 4.16734C12.8829 3.61687 11.4587 3.33355 10.0205 3.33355C8.95059 3.33355 7.88853 3.49032 6.86773 3.7972L8.84317 5.93269C9.23248 5.87946 9.6258 5.85257 10.0205 5.85257C11.1617 5.85257 12.2918 6.0774 13.3462 6.51422C14.4006 6.95104 15.3586 7.59129 16.1655 8.3984C16.3217 8.55477 16.4095 8.7668 16.4094 8.98786C16.4093 9.20892 16.3214 9.4209 16.165 9.57715C16.0087 9.73341 15.7966 9.82115 15.5756 9.82107C15.3545 9.82099 15.1425 9.7331 14.9863 9.57673C14.3342 8.92448 13.5601 8.40708 12.708 8.05407C11.9473 7.73891 11.1379 7.5603 10.3167 7.52562L15.2312 12.8383C15.575 13.21 15.5525 13.79 15.1808 14.1339C14.8091 14.4777 14.229 14.4551 13.8852 14.0834L3.40261 2.75153Z"
            fill="currentColor"
          />
          <path
            d="M8.9811 15.5556C8.84375 15.7612 8.77044 16.0028 8.77044 16.2501C8.77044 16.5816 8.90213 16.8995 9.13655 17.1339C9.37097 17.3684 9.68892 17.5001 10.0204 17.5001C10.2677 17.5001 10.5093 17.4268 10.7149 17.2894C10.9205 17.152 11.0807 16.9568 11.1753 16.7284C11.2699 16.5 11.2946 16.2487 11.2464 16.0062C11.1982 15.7637 11.0791 15.541 10.9043 15.3662C10.7295 15.1914 10.5068 15.0723 10.2643 15.0241C10.0218 14.9759 9.77049 15.0006 9.54208 15.0952C9.31367 15.1898 9.11845 15.35 8.9811 15.5556Z"
            fill="currentColor"
          />
          <path
            d="M3.80873 5.03247C3.87834 5.10772 3.86411 5.2273 3.77988 5.28572C3.24344 5.65774 2.74006 6.07787 2.27629 6.54173C2.19942 6.62133 2.10746 6.68481 2.00579 6.72849C1.90412 6.77216 1.79477 6.79515 1.68412 6.79611C1.57347 6.79707 1.46374 6.77599 1.36133 6.73409C1.25891 6.69218 1.16587 6.63031 1.08762 6.55206C1.00938 6.47382 0.947502 6.38078 0.905602 6.27836C0.863701 6.17595 0.842615 6.06622 0.843578 5.95557C0.84454 5.84492 0.867529 5.73557 0.911203 5.6339C0.954876 5.53223 1.01836 5.44027 1.09795 5.3634C1.58838 4.87285 2.11724 4.42475 2.67871 4.023C2.74642 3.97455 2.83946 3.98467 2.896 4.04579L3.80873 5.03247Z"
            fill="currentColor"
          />
          <path
            d="M5.74593 7.12662C5.69294 7.06934 5.60722 7.05634 5.54037 7.09657C4.93587 7.46033 4.37653 7.89719 3.87545 8.3984C3.7192 8.55477 3.63146 8.7668 3.63153 8.98786C3.63161 9.20892 3.7195 9.4209 3.87587 9.57715C4.03224 9.73341 4.24427 9.82115 4.46533 9.82107C4.68639 9.82099 4.89836 9.7331 5.05462 9.57673C5.52182 9.10939 6.05171 8.71127 6.62802 8.39325C6.72469 8.33991 6.74783 8.2097 6.67286 8.12865L5.74593 7.12662Z"
            fill="currentColor"
          />
          <path
            d="M9.84383 11.5565C9.89276 11.6094 9.856 11.6966 9.78414 11.7019C9.05491 11.7565 8.36419 12.0622 7.83212 12.5709C7.75496 12.6487 7.66321 12.7106 7.56211 12.7529C7.46101 12.7952 7.35255 12.8172 7.24295 12.8176V12.8151C7.07809 12.8152 6.91689 12.7664 6.77976 12.6749C6.64262 12.5834 6.53571 12.4533 6.47255 12.301C6.40939 12.1487 6.39281 11.9811 6.42493 11.8194C6.45704 11.6577 6.53639 11.5092 6.65295 11.3926C7.09513 10.9503 7.62012 10.5994 8.19792 10.36C8.29793 10.3186 8.39918 10.2806 8.50149 10.2462C8.56244 10.2257 8.62947 10.2438 8.67314 10.291L9.84383 11.5565Z"
            fill="currentColor"
          />
        </DashboardSvgIcon>
      );
    case "signal-warning":
      return (
        <DashboardSvgIcon {...sharedProps}>
          <path
            d="M5.03064 5.55585C5.33758 5.21291 5.30839 4.68608 4.96545 4.37914C4.62252 4.0722 4.09569 4.10139 3.78875 4.44433C2.46969 5.9181 1.66663 7.8663 1.66663 10.0001C1.66663 12.1339 2.46969 14.0821 3.78875 15.5559C4.09569 15.8988 4.62252 15.928 4.96545 15.621C5.30839 15.3141 5.33758 14.7873 5.03064 14.4443C3.9745 13.2643 3.33329 11.7081 3.33329 10.0001C3.33329 8.2921 3.9745 6.73586 5.03064 5.55585Z"
            fill="currentColor"
          />
          <path
            d="M16.2112 4.44433C15.9042 4.10139 15.3774 4.07221 15.0345 4.37914C14.6915 4.68608 14.6623 5.21291 14.9693 5.55585C16.0254 6.73586 16.6666 8.2921 16.6666 10.0001C16.6666 11.7081 16.0254 13.2643 14.9693 14.4443C14.6623 14.7873 14.6915 15.3141 15.0345 15.621C15.3774 15.928 15.9042 15.8988 16.2112 15.5559C17.5302 14.0821 18.3333 12.1339 18.3333 10.0001C18.3333 7.8663 17.5302 5.9181 16.2112 4.44433Z"
            fill="currentColor"
          />
          <path
            d="M7.1668 6.83378C7.53479 7.11019 7.60903 7.63258 7.33263 8.00057C6.91423 8.5576 6.66663 9.24872 6.66663 10.0001C6.66663 10.7514 6.91423 11.4426 7.33263 11.9996C7.60903 12.3676 7.53479 12.89 7.1668 13.1664C6.79881 13.4428 6.27642 13.3686 6.00002 13.0006C5.37227 12.1648 4.99996 11.1247 4.99996 10.0001C4.99996 8.87544 5.37227 7.83534 6.00002 6.9996C6.27642 6.63161 6.79881 6.55737 7.1668 6.83378Z"
            fill="currentColor"
          />
          <path
            d="M12.8331 6.83378C13.2011 6.55737 13.7235 6.63161 13.9999 6.9996C14.6277 7.83534 15 8.87544 15 10.0001C15 11.1247 14.6277 12.1648 13.9999 13.0006C13.7235 13.3686 13.2011 13.4428 12.8331 13.1664C12.4651 12.89 12.3909 12.3676 12.6673 11.9996C13.0857 11.4426 13.3333 10.7514 13.3333 10.0001C13.3333 9.24872 13.0857 8.5576 12.6673 8.00057C12.3909 7.63258 12.4651 7.11019 12.8331 6.83378Z"
            fill="currentColor"
          />
          <path
            d="M11.6666 10.0001C11.6666 10.9206 10.9204 11.6668 9.99996 11.6668C9.07948 11.6668 8.33329 10.9206 8.33329 10.0001C8.33329 9.07961 9.07948 8.33342 9.99996 8.33342C10.9204 8.33342 11.6666 9.07961 11.6666 10.0001Z"
            fill="currentColor"
          />
        </DashboardSvgIcon>
      );
    case "pending-registration":
      return (
        <DashboardSvgIcon {...sharedProps}>
          <g clipPath="url(#pending-registration-clip)">
            <path
              d="M11.25 12.5H7.49996C4.2783 12.5 1.66663 15.1117 1.66663 18.3333"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="8.74996" cy="6.25008" r="3.58333" stroke="currentColor" strokeWidth="2" />
            <path
              d="M17.5065 12.5H14.1602C13.7036 12.5 13.3334 12.8702 13.3334 13.3268C13.3334 13.5446 13.4192 13.7535 13.5723 13.9083L14.1764 14.519C14.5617 14.9086 14.5617 15.5358 14.1764 15.9254L13.6224 16.4856C13.4372 16.6728 13.3334 16.9255 13.3334 17.1888V17.3333C13.3334 17.8856 13.7811 18.3333 14.3334 18.3333H17.3334C17.8857 18.3333 18.3334 17.8856 18.3334 17.3333V17.1888C18.3334 16.9255 18.2295 16.6728 18.0444 16.4856L17.4904 15.9254C17.105 15.5358 17.105 14.9086 17.4904 14.519L18.0944 13.9083C18.2475 13.7535 18.3334 13.5446 18.3334 13.3268C18.3334 12.8702 17.9632 12.5 17.5065 12.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
          <defs>
            <clipPath id="pending-registration-clip">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </DashboardSvgIcon>
      );
    case "gps-device":
      return (
        <DashboardSvgIcon {...sharedProps}>
          <path
            d="M7.49998 6.66667C7.49998 6.20643 7.87308 5.83333 8.33331 5.83333H11.6666C12.1269 5.83333 12.5 6.20643 12.5 6.66667V10C12.5 10.4602 12.1269 10.8333 11.6666 10.8333H8.33331C7.87308 10.8333 7.49998 10.4602 7.49998 10V6.66667Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.6666 0H12.5V1.66667H13.3333V0H14.1666V1.66667C14.6269 1.66667 15 2.03976 15 2.5C15.9205 2.5 16.6666 3.24619 16.6666 4.16667V18.3333C16.6666 19.2538 15.9205 20 15 20H4.99998C4.07951 20 3.33331 19.2538 3.33331 18.3333V4.16667C3.33331 3.24619 4.07951 2.5 4.99998 2.5H10.8333C10.8333 2.03976 11.2064 1.66667 11.6666 1.66667V0ZM15 4.16667H4.99998V5.83333C5.46022 5.83333 5.83331 6.20643 5.83331 6.66667V8.33333C5.83331 8.79357 5.46022 9.16667 4.99998 9.16667V13.3333C5.46022 13.3333 5.83331 13.7064 5.83331 14.1667V15.8333C5.83331 16.2936 5.46022 16.6667 4.99998 16.6667V18.3333H15V16.6667C14.5397 16.6667 14.1666 16.2936 14.1666 15.8333V14.1667C14.1666 13.7064 14.5397 13.3333 15 13.3333V9.16667C14.5397 9.16667 14.1666 8.79357 14.1666 8.33333V6.66667C14.1666 6.20643 14.5397 5.83333 15 5.83333V4.16667Z"
            fill="currentColor"
          />
        </DashboardSvgIcon>
      );
    case "key-device":
      return (
        <DashboardSvgIcon {...sharedProps}>
          <g clipPath="url(#key-device-clip)">
            <path
              d="M12.2777 8.08382C12.8607 8.66685 13.806 8.66685 14.389 8.08382C14.9721 7.50078 14.9721 6.5555 14.389 5.97247C13.806 5.38944 12.8607 5.38944 12.2777 5.97247C11.6947 6.5555 11.6947 7.50078 12.2777 8.08382Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.63852 3.33329C11.6791 1.29267 14.9876 1.29267 17.0282 3.33329C19.0688 5.3739 19.0688 8.68239 17.0282 10.723C15.8917 11.8596 14.3614 12.3626 12.8784 12.2337L10.9581 14.1539C10.8181 14.2939 10.6282 14.3726 10.4303 14.3726L9.0654 14.3726L9.0654 15.7374C9.0654 16.1497 8.73119 16.4839 8.31892 16.4839L6.95405 16.4839L6.95405 17.8488C6.95405 18.2611 6.61984 18.5953 6.20758 18.5953L2.51272 18.5953C2.10045 18.5953 1.76625 18.2611 1.76625 17.8488L1.76625 14.1539C1.76625 13.956 1.84489 13.7661 1.98488 13.6261L8.12782 7.48317C7.99895 6.00008 8.50195 4.46985 9.63852 3.33329ZM15.9726 4.38896C14.515 2.93138 12.1518 2.93138 10.6942 4.38896C9.81156 5.27159 9.46277 6.48589 9.65002 7.63312C9.68871 7.87017 9.61097 8.11136 9.44113 8.2812L3.25919 14.4631L3.25919 17.1023L5.4611 17.1023L5.4611 15.7375C5.4611 15.3252 5.79531 14.991 6.20758 14.991L7.57245 14.991L7.57245 13.6261C7.57245 13.2138 7.90666 12.8796 8.31892 12.8796L10.1211 12.8796L12.0803 10.9204C12.2502 10.7505 12.4913 10.6728 12.7284 10.7115C13.8756 10.8987 15.0899 10.55 15.9726 9.66733C17.4301 8.20975 17.4301 5.84654 15.9726 4.38896Z"
              fill="currentColor"
            />
          </g>
          <defs>
            <clipPath id="key-device-clip">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </DashboardSvgIcon>
      );
    case "vehicle-inventory":
      return (
        <DashboardSvgIcon {...sharedProps}>
          <path
            d="M15.8334 16.6668H4.16669V17.5002C4.16669 17.9604 3.79359 18.3335 3.33335 18.3335H2.50002C2.03979 18.3335 1.66669 17.9604 1.66669 17.5002V9.16683L3.73377 4.34363C3.9964 3.73082 4.59897 3.3335 5.26568 3.3335H14.7344C15.4011 3.3335 16.0036 3.73082 16.2663 4.34363L18.3334 9.16683V17.5002C18.3334 17.9604 17.9603 18.3335 17.5 18.3335H16.6667C16.2064 18.3335 15.8334 17.9604 15.8334 17.5002V16.6668ZM16.6667 10.8335H3.33335V15.0002H16.6667V10.8335ZM3.47997 9.16683H16.5201L14.7344 5.00016H5.26568L3.47997 9.16683ZM5.41669 14.1668C4.72633 14.1668 4.16669 13.6072 4.16669 12.9168C4.16669 12.2265 4.72633 11.6668 5.41669 11.6668C6.10705 11.6668 6.66669 12.2265 6.66669 12.9168C6.66669 13.6072 6.10705 14.1668 5.41669 14.1668ZM14.5834 14.1668C13.893 14.1668 13.3334 13.6072 13.3334 12.9168C13.3334 12.2265 13.893 11.6668 14.5834 11.6668C15.2737 11.6668 15.8334 12.2265 15.8334 12.9168C15.8334 13.6072 15.2737 14.1668 14.5834 14.1668Z"
            fill="currentColor"
          />
        </DashboardSvgIcon>
      );
    case "lot-utilization":
      return (
        <DashboardSvgIcon {...sharedProps}>
          <path
            d="M6.70789 1.8251C7.23427 1.72097 7.77786 1.6665 8.33333 1.6665C8.88881 1.6665 9.43239 1.72097 9.95877 1.8251C10.4103 1.91442 10.7039 2.35283 10.6145 2.80432C10.5252 3.2558 10.0868 3.5494 9.63532 3.46008C9.2149 3.37691 8.77964 3.33317 8.33333 3.33317C7.88703 3.33317 7.45177 3.37691 7.03134 3.46008C6.57986 3.5494 6.14145 3.2558 6.05213 2.80432C5.96281 2.35283 6.25641 1.91442 6.70789 1.8251Z"
            fill="currentColor"
          />
          <path
            d="M11.808 3.2995C12.064 2.91705 12.5816 2.81458 12.9641 3.07062C13.8725 3.67878 14.6544 4.46072 15.2625 5.36912C15.5186 5.75156 15.4161 6.26915 15.0337 6.52519C14.6512 6.78123 14.1336 6.67876 13.8776 6.29632C13.3906 5.56895 12.7642 4.94253 12.0369 4.45557C11.6544 4.19953 11.5519 3.68194 11.808 3.2995Z"
            fill="currentColor"
          />
          <path
            d="M4.85869 3.2995C5.11473 3.68194 5.01226 4.19953 4.62982 4.45557C3.90245 4.94253 3.27603 5.56895 2.78907 6.29632C2.53303 6.67876 2.01544 6.78123 1.63299 6.52519C1.25055 6.26915 1.14808 5.75156 1.40412 5.36912C2.01228 4.46072 2.79421 3.67878 3.70262 3.07062C4.08506 2.81458 4.60265 2.91705 4.85869 3.2995Z"
            fill="currentColor"
          />
          <path
            d="M1.13781 7.71863C1.5893 7.80795 1.8829 8.24636 1.79358 8.69785C1.71041 9.11827 1.66667 9.55353 1.66667 9.99984C1.66667 10.4461 1.71041 10.8814 1.79358 11.3018C1.8829 11.7533 1.5893 12.1917 1.13781 12.281C0.686326 12.3704 0.247917 12.0768 0.158599 11.6253C0.0544653 11.0989 0 10.5553 0 9.99984C0 9.44436 0.0544653 8.90078 0.158599 8.3744C0.247917 7.92291 0.686326 7.62931 1.13781 7.71863Z"
            fill="currentColor"
          />
          <path
            d="M15.0337 13.4745C15.4161 13.7305 15.5186 14.2481 15.2625 14.6306C14.6544 15.539 13.8725 16.3209 12.9641 16.9291C12.5816 17.1851 12.064 17.0826 11.808 16.7002C11.5519 16.3177 11.6544 15.8001 12.0369 15.5441C12.7642 15.0571 13.3906 14.4307 13.8776 13.7034C14.1336 13.3209 14.6512 13.2184 15.0337 13.4745Z"
            fill="currentColor"
          />
          <path
            d="M1.63299 13.4745C2.01544 13.2184 2.53303 13.3209 2.78907 13.7034C3.27603 14.4307 3.90245 15.0571 4.62982 15.5441C5.01226 15.8001 5.11473 16.3177 4.85869 16.7002C4.60265 17.0826 4.08506 17.1851 3.70262 16.9291C2.79421 16.3209 2.01228 15.539 1.40412 14.6306C1.14808 14.2481 1.25055 13.7305 1.63299 13.4745Z"
            fill="currentColor"
          />
          <path
            d="M6.05213 17.1954C6.14145 16.7439 6.57985 16.4503 7.03134 16.5396C7.45177 16.6228 7.88703 16.6665 8.33333 16.6665C8.77964 16.6665 9.2149 16.6228 9.63532 16.5396C10.0868 16.4503 10.5252 16.7439 10.6145 17.1954C10.7039 17.6468 10.4103 18.0853 9.95877 18.1746C9.43239 18.2787 8.88881 18.3332 8.33333 18.3332C7.77786 18.3332 7.23427 18.2787 6.70789 18.1746C6.25641 18.0853 5.96281 17.6468 6.05213 17.1954Z"
            fill="currentColor"
          />
          <path
            d="M8.33333 9.99984C8.33333 9.5396 8.70643 9.1665 9.16667 9.1665H17.1548L16.0774 8.08909C15.752 7.76366 15.752 7.23602 16.0774 6.91058C16.4028 6.58514 16.9305 6.58514 17.2559 6.91058L19.1667 8.82133C19.8175 9.4722 19.8175 10.5275 19.1667 11.1783L17.2559 13.0891C16.9305 13.4145 16.4028 13.4145 16.0774 13.0891C15.752 12.7637 15.752 12.236 16.0774 11.9106L17.1548 10.8332H9.16667C8.70643 10.8332 8.33333 10.4601 8.33333 9.99984Z"
            fill="currentColor"
          />
        </DashboardSvgIcon>
      );
    case "devices-sold":
      return (
        <DashboardSvgIcon {...sharedProps}>
          <path
            d="M10.0041 18.3356C5.40168 18.3356 1.67072 14.6047 1.67072 10.0022C1.67072 5.3999 5.40168 1.66895 10.0041 1.66895C14.6064 1.66895 18.3374 5.3999 18.3374 10.0022C18.3374 14.6047 14.6064 18.3356 10.0041 18.3356ZM10.0041 16.6689C13.686 16.6689 16.6707 13.6842 16.6707 10.0022C16.6707 6.32038 13.686 3.33561 10.0041 3.33561C6.32215 3.33561 3.33738 6.32038 3.33738 10.0022C3.33738 13.6842 6.32215 16.6689 10.0041 16.6689ZM7.08738 11.6689H11.6707C11.9008 11.6689 12.0874 11.4824 12.0874 11.2522C12.0874 11.0222 11.9008 10.8356 11.6707 10.8356H8.3374C7.18679 10.8356 6.25405 9.9029 6.25405 8.75224C6.25405 7.60168 7.18679 6.66895 8.3374 6.66895H9.17073V5.00228H10.8374V6.66895H12.9207V8.33557H8.3374C8.10727 8.33557 7.92072 8.52215 7.92072 8.75224C7.92072 8.9824 8.10727 9.1689 8.3374 9.1689H11.6707C12.8213 9.1689 13.7541 10.1017 13.7541 11.2522C13.7541 12.4029 12.8213 13.3356 11.6707 13.3356H10.8374V15.0022H9.17073V13.3356H7.08738V11.6689Z"
            fill="currentColor"
          />
        </DashboardSvgIcon>
      );
    default:
      return null;
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatTableValue(value: number | string | null) {
  if (value == null) return "";
  if (typeof value === "number") return formatNumber(value);
  return value;
}

function segmentTotal(segments: InventoryMetricSlice[]) {
  return segments
    .filter((segment) => segment.label !== "Total")
    .reduce((sum, segment) => sum + segment.value, 0);
}

function getCardStyle(settings: InventoryDashboardWidgetSettings): CSSProperties {
  return {
    borderRadius: settings.layout.cardRadius,
  };
}

function getAlignItems(value: InventoryDashboardWidgetSettings["layout"]["bodyAlignX"]) {
  switch (value) {
    case "start":
      return "flex-start";
    case "end":
      return "flex-end";
    case "stretch":
      return "stretch";
    default:
      return "center";
  }
}

function getJustifyContent(value: InventoryDashboardWidgetSettings["layout"]["bodyAlignY"]) {
  switch (value) {
    case "start":
      return "flex-start";
    case "end":
      return "flex-end";
    case "stretch":
      return "space-between";
    default:
      return "center";
  }
}

function getTextAlign(
  value: InventoryDashboardWidgetSettings["layout"]["bodyAlignX"]
): CSSProperties["textAlign"] {
  switch (value) {
    case "start":
      return "left";
    case "end":
      return "right";
    default:
      return "center";
  }
}

type WidgetMeasurements = {
  outerHeight: number;
  outerWidth: number;
  innerHeight: number;
  innerWidth: number;
  headerHeight: number;
  bodyHeight: number;
  contentHeight: number;
  contentWidth: number;
  topFreeSpace: number;
  bottomFreeSpace: number;
  leftFreeSpace: number;
  rightFreeSpace: number;
};

function roundMeasurement(value: number) {
  return Math.round(value * 10) / 10;
}

function measureWidgetRegions(
  outerEl: HTMLDivElement,
  innerEl: HTMLDivElement,
  headerEl: HTMLDivElement,
  bodyEl: HTMLDivElement,
  bodyContentEl: HTMLDivElement
): WidgetMeasurements {
  const outerRect = outerEl.getBoundingClientRect();
  const innerRect = innerEl.getBoundingClientRect();
  const headerRect = headerEl.getBoundingClientRect();
  const bodyRect = bodyEl.getBoundingClientRect();
  const contentRect = bodyContentEl.getBoundingClientRect();

  return {
    outerHeight: roundMeasurement(outerRect.height),
    outerWidth: roundMeasurement(outerRect.width),
    innerHeight: roundMeasurement(innerRect.height),
    innerWidth: roundMeasurement(innerRect.width),
    headerHeight: roundMeasurement(headerRect.height),
    bodyHeight: roundMeasurement(bodyRect.height),
    contentHeight: roundMeasurement(contentRect.height),
    contentWidth: roundMeasurement(contentRect.width),
    topFreeSpace: roundMeasurement(Math.max(contentRect.top - bodyRect.top, 0)),
    bottomFreeSpace: roundMeasurement(Math.max(bodyRect.bottom - contentRect.bottom, 0)),
    leftFreeSpace: roundMeasurement(Math.max(contentRect.left - bodyRect.left, 0)),
    rightFreeSpace: roundMeasurement(Math.max(bodyRect.right - contentRect.right, 0)),
  };
}

function WidgetDebugOverlay({
  measurements,
  settings,
}: {
  measurements: WidgetMeasurements | null;
  settings: InventoryDashboardWidgetSettings;
}) {
  if (
    !settings.layout.debugShowBounds &&
    !settings.layout.debugShowCenter &&
    !settings.layout.debugShowMeasurements
  ) {
    return null;
  }

  const verticalDelta = measurements
    ? roundMeasurement(Math.abs(measurements.topFreeSpace - measurements.bottomFreeSpace))
    : 0;
  const horizontalDelta = measurements
    ? roundMeasurement(Math.abs(measurements.leftFreeSpace - measurements.rightFreeSpace))
    : 0;
  const hasImbalance = verticalDelta > 0.5 || horizontalDelta > 0.5;

  return (
    <>
      {settings.layout.debugShowBounds ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] border border-dashed border-[rgba(14,165,233,0.9)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute border border-dashed border-[rgba(34,197,94,0.95)]"
            style={{
              top: settings.layout.cardPaddingY,
              right: settings.layout.cardPaddingX,
              bottom: settings.layout.cardPaddingY,
              left: settings.layout.cardPaddingX,
            }}
          />
          {measurements ? (
            <div
              aria-hidden
              className="pointer-events-none absolute border border-dashed border-[rgba(249,115,22,0.95)]"
              style={{
                top:
                  settings.layout.cardPaddingY +
                  measurements.headerHeight +
                  settings.layout.headerBodyGap,
                right: settings.layout.cardPaddingX,
                bottom: settings.layout.cardPaddingY,
                left: settings.layout.cardPaddingX,
              }}
            />
          ) : null}
        </>
      ) : null}
      {settings.layout.debugShowCenter ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[rgba(168,85,247,0.55)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[rgba(168,85,247,0.55)]"
          />
        </>
      ) : null}
      {settings.layout.debugShowMeasurements && measurements ? (
        <div
          className={cn(
            "pointer-events-none absolute right-2 top-2 z-10 rounded-md border px-2 py-1.5 text-[10px] leading-4 shadow-sm",
            hasImbalance
              ? "border-amber-400 bg-amber-50 text-amber-950"
              : "border-emerald-300 bg-emerald-50 text-emerald-950"
          )}
        >
          <div>{`outer ${measurements.outerWidth} x ${measurements.outerHeight}`}</div>
          <div>{`inner ${measurements.innerWidth} x ${measurements.innerHeight}`}</div>
          <div>{`header ${measurements.headerHeight}`}</div>
          <div>{`body ${measurements.bodyHeight}`}</div>
          <div>{`content ${measurements.contentWidth} x ${measurements.contentHeight}`}</div>
          <div>{`top ${measurements.topFreeSpace} / bottom ${measurements.bottomFreeSpace}`}</div>
          <div>{`left ${measurements.leftFreeSpace} / right ${measurements.rightFreeSpace}`}</div>
          <div>{`delta v ${verticalDelta} / h ${horizontalDelta}`}</div>
        </div>
      ) : null}
    </>
  );
}

function renderKpiIcon(
  icon: DashboardKpiMetric["icon"],
  iconClassName?: string
) {
  if (typeof icon === "string") {
    return <DashboardMetricIcon icon={icon} size={20} className={iconClassName} />;
  }

  const Icon = icon;
  return <Icon className={cn("size-5 shrink-0", iconClassName)} />;
}

interface InventoryKpiCardProps {
  metric: DashboardKpiMetric;
  settings?: Partial<InventoryDashboardWidgetSettings>;
  /** Merged onto the outer Card (e.g. `bg-white dark:bg-sidebar` to match file-cabinet table fill). */
  className?: string;
}

export function WidgetHeader({
  icon,
  title,
  settings,
}: {
  icon: InventoryDashboardIcon | DashboardKpiMetric["icon"];
  title: string;
  settings: InventoryDashboardWidgetSettings;
}) {
  const renderedIcon =
    typeof icon === "string" ? (
      <DashboardMetricIcon icon={icon} size={20} />
    ) : (
      renderKpiIcon(icon)
    );

  return (
    <div
      className="flex items-center text-[var(--theme-text-secondary)]"
      style={{
        gap: settings.layout.titleGap,
        fontFamily: settings.typography.titleFamily,
        fontSize: settings.typography.titleSize,
        fontWeight: settings.typography.titleWeight,
        lineHeight: `${Math.round(settings.typography.titleSize * 1.4)}px`,
      }}
    >
      {renderedIcon}
      <span>{title}</span>
    </div>
  );
}

function KpiHeader({
  icon,
  label,
  iconClassName,
  settings,
}: {
  icon: DashboardKpiMetric["icon"];
  label: string;
  iconClassName?: string;
  settings: InventoryDashboardWidgetSettings;
}) {
  return (
    <div
      className="flex items-center text-[var(--theme-text-secondary)]"
      style={{
        gap: settings.layout.titleGap,
        fontFamily: settings.typography.labelFamily,
        fontSize: settings.typography.labelSize,
        fontWeight: settings.typography.labelWeight,
        lineHeight: `${Math.round(settings.typography.labelSize * 1.4)}px`,
      }}
    >
      {renderKpiIcon(icon, iconClassName)}
      <span>{label}</span>
    </div>
  );
}

export function WidgetShell({
  minHeight,
  settings,
  header,
  body,
  bodyClassName,
  className,
}: {
  minHeight: number;
  settings: InventoryDashboardWidgetSettings;
  header: ReactNode;
  body: ReactNode;
  bodyClassName?: string;
  className?: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyContentRef = useRef<HTMLDivElement>(null);
  const [measurements, setMeasurements] = useState<WidgetMeasurements | null>(null);

  useEffect(() => {
    const outerEl = outerRef.current;
    const innerEl = innerRef.current;
    const headerEl = headerRef.current;
    const bodyEl = bodyRef.current;
    const bodyContentEl = bodyContentRef.current;

    if (!outerEl || !innerEl || !headerEl || !bodyEl || !bodyContentEl) {
      return;
    }

    const update = () => {
      setMeasurements(
        measureWidgetRegions(outerEl, innerEl, headerEl, bodyEl, bodyContentEl)
      );
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(outerEl);
    observer.observe(innerEl);
    observer.observe(headerEl);
    observer.observe(bodyEl);
    observer.observe(bodyContentEl);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <Card
      ref={outerRef}
      className={cn(
        "relative gap-0 overflow-hidden rounded-[4px] border border-border bg-card py-0 shadow-none",
        className,
      )}
      style={{
        ...getCardStyle(settings),
        minHeight,
      }}
    >
      <div
        ref={innerRef}
        className="relative flex h-full min-h-full flex-1 flex-col"
        style={{
          paddingTop: settings.layout.cardPaddingY,
          paddingRight: settings.layout.cardPaddingX,
          paddingBottom: settings.layout.cardPaddingY,
          paddingLeft: settings.layout.cardPaddingX,
        }}
      >
        <div ref={headerRef} className="shrink-0">
          {header}
        </div>
        <div
          ref={bodyRef}
          className={cn("relative flex-1 overflow-hidden", bodyClassName)}
          style={{
            paddingTop: settings.layout.headerBodyGap + settings.layout.bodyInsetTop,
            paddingBottom: settings.layout.bodyInsetBottom,
            alignItems: getAlignItems(settings.layout.bodyAlignX),
            justifyContent: getJustifyContent(settings.layout.bodyAlignY),
          }}
        >
          <div ref={bodyContentRef} className="w-full min-w-0 max-w-full">
            {body}
          </div>
        </div>
      </div>
      <WidgetDebugOverlay measurements={measurements} settings={settings} />
    </Card>
  );
}

function InventoryKpiCard({ metric, settings, className }: InventoryKpiCardProps) {
  const dial = mergeInventoryDashboardWidgetSettings(settings);

  return (
    <WidgetShell
      className={className}
      minHeight={dial.layout.kpiCardHeight}
      settings={dial}
      header={
        <KpiHeader
          icon={metric.icon}
          label={metric.label}
          iconClassName={metric.iconClassName}
          settings={dial}
        />
      }
      body={
        <div
          className="flex w-full flex-col"
          style={{
            alignItems:
              dial.layout.bodyAlignX === "stretch"
                ? "stretch"
                : getAlignItems(dial.layout.bodyAlignX),
          }}
        >
          <div
            className="w-full text-foreground"
            style={{
              fontFamily: dial.typography.valueFamily,
              fontSize: dial.typography.valueSize,
              fontWeight: dial.typography.valueWeight,
              lineHeight: `${Math.round(dial.typography.valueSize * 1.07)}px`,
              letterSpacing: "var(--tracking-tighter)",
              textAlign: getTextAlign(dial.layout.bodyAlignX),
            }}
          >
            {metric.value}
          </div>
          {metric.caption ? (
            <div
              className="mt-1 w-full text-[var(--theme-text-tertiary)]"
              style={{
                fontFamily: dial.typography.labelFamily,
                fontSize: dial.typography.captionSize,
                fontWeight: dial.typography.captionWeight,
                lineHeight: `${Math.round(dial.typography.captionSize * 1.33)}px`,
                textAlign: getTextAlign(dial.layout.bodyAlignX),
              }}
            >
              {metric.caption}
            </div>
          ) : null}
        </div>
      }
    />
  );
}

interface InventoryStatusCardProps {
  metric: InventoryStatusMetric;
  settings?: Partial<InventoryDashboardWidgetSettings>;
  className?: string;
}

function InventoryStatusCard({ metric, settings, className }: InventoryStatusCardProps) {
  const dial = mergeInventoryDashboardWidgetSettings(settings);
  const total = segmentTotal(metric.segments);

  return (
    <WidgetShell
      className={className}
      minHeight={dial.layout.statusCardHeight}
      settings={dial}
      header={<WidgetHeader icon={metric.icon} title={metric.title} settings={dial} />}
      body={
        <div className="w-full max-w-full">
          <div
            className="mt-2 text-left text-foreground"
            style={{
              fontFamily: dial.typography.valueFamily,
              fontSize: dial.typography.valueSize,
              fontWeight: dial.typography.valueWeight,
              lineHeight: `${Math.round(dial.typography.valueSize * 1.07)}px`,
              letterSpacing: "var(--tracking-tighter)",
            }}
          >
            {metric.valueLabel}
          </div>
          <div
            className="mt-1.5 text-left text-[var(--theme-text-tertiary)]"
            style={{
              fontFamily: dial.typography.labelFamily,
              fontSize: dial.typography.captionSize,
              fontWeight: dial.typography.captionWeight,
              lineHeight: `${Math.round(dial.typography.captionSize * 1.33)}px`,
            }}
          >
            {metric.subtitle}
          </div>
          <div
            className="mt-5 flex w-full overflow-hidden rounded-full bg-[rgba(39,39,42,0.08)]"
            style={{ height: dial.layout.progressBarHeight }}
            aria-hidden
          >
            {metric.segments
              .filter((segment) => segment.label !== "Total")
              .map((segment) => (
                <div
                  key={segment.label}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${(segment.value / Math.max(total, 1)) * 100}%`,
                    backgroundColor: segment.color,
                  }}
                />
              ))}
          </div>
          <div className="mt-6 grid w-full grid-cols-3 gap-x-4 gap-y-2">
            {metric.segments.map((segment, index) => {
              const isTotal = segment.label === "Total";
              return (
                <div
                  key={segment.label}
                  className={cn(
                    "flex min-w-0 items-center gap-2",
                    index === 0 && "justify-start text-left",
                    index === 1 && "justify-center text-center",
                    index === 2 && "justify-end text-right"
                  )}
                  style={{
                    fontFamily: dial.typography.labelFamily,
                    fontSize: dial.typography.labelSize,
                    fontWeight: dial.typography.captionWeight,
                    lineHeight: `${Math.round(dial.typography.labelSize * 1.4)}px`,
                  }}
                >
                  {!isTotal ? (
                    <span
                      className="size-2 rounded-[2px]"
                      style={{ backgroundColor: segment.color }}
                      aria-hidden
                    />
                  ) : (
                    <span className="size-2" aria-hidden />
                  )}
                  <span className="text-[var(--theme-text-secondary)]">{segment.label}</span>
                  <span className="font-medium text-foreground">{formatNumber(segment.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      }
    />
  );
}

function InventoryDonutChart({
  slices,
  centerLabel,
  centerValue,
  size,
  ringThickness,
  settings,
  centerLabelSize,
  centerValueSize,
  centerLabelWeight,
}: {
  slices: InventoryMetricSlice[];
  centerLabel: string;
  centerValue: string;
  size: number;
  ringThickness: number;
  settings: InventoryDashboardWidgetSettings;
  centerLabelSize: number;
  centerValueSize: number;
  centerLabelWeight: number;
}) {
  const radius = size / 2;
  const innerRadius = Math.max(radius - ringThickness, 24);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={centerLabel}>
      <Group top={radius} left={radius}>
        <Pie
          data={slices}
          pieValue={(slice) => slice.value}
          outerRadius={radius}
          innerRadius={innerRadius}
          cornerRadius={3}
          padAngle={0.01}
        >
          {(pie) =>
            pie.arcs.map((arc) => (
              <g key={arc.data.label}>
                <path d={pie.path(arc) ?? undefined} fill={arc.data.color} />
              </g>
            ))
          }
        </Pie>
        <Text
          textAnchor="middle"
          verticalAnchor="end"
          y={-2}
          fill="var(--theme-text-tertiary)"
          style={{
            fontFamily: settings.typography.labelFamily,
            fontSize: centerLabelSize,
            fontWeight: centerLabelWeight,
          }}
        >
          {centerLabel}
        </Text>
        <Text
          textAnchor="middle"
          verticalAnchor="start"
          y={8}
          fill="var(--theme-text-primary)"
          style={{
            fontFamily: settings.typography.valueFamily,
            fontSize: centerValueSize,
            fontWeight: settings.typography.valueWeight,
          }}
        >
          {centerValue}
        </Text>
      </Group>
    </svg>
  );
}

function InventoryLegend({
  slices,
  settings,
}: {
  slices: InventoryMetricSlice[];
  settings: InventoryDashboardWidgetSettings;
}) {
  return (
    <div
      className="flex flex-col"
      style={{
        width: settings.layout.legendWidth,
        minWidth: settings.layout.legendWidth,
        gap: settings.layout.legendRowGap,
        marginTop: settings.layout.legendTopGap,
      }}
    >
      {slices.map((slice) => (
        <div
          key={slice.label}
          className="flex items-center gap-[6px] px-1 py-[2px]"
          style={{
            lineHeight: `${Math.round(
              Math.max(settings.typography.legendLabelSize, settings.typography.legendValueSize) * 1.5
            )}px`,
          }}
        >
          <span
            className="size-2 rounded-[2px]"
            style={{ backgroundColor: slice.color }}
            aria-hidden
          />
          <span
            className="flex-1 text-foreground"
            style={{
              fontFamily: settings.typography.labelFamily,
              fontSize: settings.typography.legendLabelSize,
              fontWeight: settings.typography.legendLabelWeight,
            }}
          >
            {slice.label}
          </span>
          <span
            className="text-foreground"
            style={{
              fontFamily: settings.typography.valueFamily,
              fontSize: settings.typography.legendValueSize,
              fontWeight: settings.typography.legendValueWeight,
            }}
          >
            {formatNumber(slice.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface InventoryDonutCardProps {
  metric: InventoryDonutMetric;
  settings?: Partial<InventoryDashboardWidgetSettings>;
  className?: string;
}

function InventoryDonutCard({ metric, settings, className }: InventoryDonutCardProps) {
  const dial = mergeInventoryDashboardWidgetSettings(settings);

  return (
    <WidgetShell
      className={className}
      minHeight={dial.layout.donutCardHeight}
      settings={dial}
      header={<WidgetHeader icon={metric.icon} title={metric.title} settings={dial} />}
      bodyClassName="overflow-visible"
      body={
        <div
          className="flex w-full flex-col items-start xl:flex-row xl:items-center xl:justify-between"
          style={{
            gap: dial.layout.legendGap,
            marginTop: dial.layout.donutContentOffsetY,
            paddingLeft: dial.layout.donutSideInset,
            paddingRight: dial.layout.donutSideInset,
          }}
        >
          <div className="flex w-full justify-start xl:w-auto">
            <InventoryDonutChart
              slices={metric.slices}
              centerLabel={metric.centerLabel}
              centerValue={metric.centerValue}
              size={dial.layout.chartSize}
              ringThickness={dial.layout.ringThickness}
              settings={dial}
              centerLabelSize={dial.typography.donutCenterLabelSize}
              centerValueSize={dial.typography.donutCenterValueSize}
              centerLabelWeight={dial.typography.donutCenterLabelWeight}
            />
          </div>
          <div className="flex w-full justify-start xl:w-auto xl:justify-end">
            <InventoryLegend slices={metric.slices} settings={dial} />
          </div>
        </div>
      }
    />
  );
}

function InventoryPeriodDonut({
  period,
  settings,
}: {
  period: InventoryPeriodMetric;
  settings: InventoryDashboardWidgetSettings;
}) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: settings.layout.chartSize,
        height: settings.layout.chartSize,
      }}
    >
      <InventoryDonutChart
        slices={period.slices}
        centerLabel={period.label}
        centerValue={period.total}
        size={settings.layout.chartSize}
        ringThickness={settings.layout.ringThickness}
        settings={settings}
        centerLabelSize={settings.typography.periodCenterLabelSize}
        centerValueSize={settings.typography.periodCenterValueSize}
        centerLabelWeight={settings.typography.periodCenterLabelWeight}
      />
    </div>
  );
}

function InventoryDevicesSoldTable({
  columns,
  rows,
  labelColumnWidth,
  periodColumnWidth,
}: {
  columns: InventoryDevicesSoldTableColumn[];
  rows: InventoryDevicesSoldTableRow[];
  labelColumnWidth: number;
  periodColumnWidth: number;
}) {
  return (
    <div className="w-full">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow size="compact" className="border-b border-[var(--theme-stroke-subtle,var(--theme-stroke-default))] hover:bg-transparent">
            <TableHead className="p-0" style={{ width: labelColumnWidth }}>
              <TableHeaderCell variant="empty" className="w-full" />
            </TableHead>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className="border-l border-[var(--theme-stroke-subtle,var(--theme-stroke-default))] p-0"
                style={{ width: periodColumnWidth }}
              >
                <TableHeaderCell
                  variant="label"
                  label={column.label}
                  className="w-full justify-start rounded-none px-0 text-left"
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isSummary = row.kind !== "breakdown";

            return (
              <TableRow
                key={row.label}
                size="default"
                className="border-b border-[var(--theme-stroke-subtle,var(--theme-stroke-default))] bg-transparent last:border-b-0"
              >
                <TableCell className="p-0">
                  <div className="flex min-h-12 items-center gap-3 pr-3">
                    {row.color ? (
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: row.color }}
                        aria-hidden
                      />
                    ) : (
                      <span className="size-3 shrink-0" aria-hidden />
                    )}
                    <span
                      className={cn(
                        "text-sm leading-5 text-[var(--theme-text-primary,var(--foreground))]",
                        isSummary ? "font-medium" : "font-normal"
                      )}
                    >
                      {row.label}
                    </span>
                  </div>
                </TableCell>
                {row.values.map((value, index) => (
                  <TableCell
                    key={`${row.label}-${columns[index]?.key ?? index}`}
                    className="border-l border-[var(--theme-stroke-subtle,var(--theme-stroke-default))] p-0"
                  >
                    <div
                      className={cn(
                        "flex min-h-12 items-center justify-start text-left text-sm leading-5 tabular-nums",
                        value == null
                          ? "text-[var(--theme-text-tertiary,var(--muted-foreground))]"
                          : "text-[var(--theme-text-primary,var(--foreground))]",
                        isSummary ? "font-medium" : "font-normal"
                      )}
                    >
                      {formatTableValue(value)}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

interface InventoryDevicesSoldProps {
  title: string;
  icon: InventoryDashboardIcon;
  periods: InventoryPeriodMetric[];
  tableColumns: InventoryDevicesSoldTableColumn[];
  tableRows: InventoryDevicesSoldTableRow[];
  settings?: Partial<InventoryDashboardWidgetSettings>;
  className?: string;
}

function InventoryDevicesSold({
  title,
  icon,
  periods,
  tableColumns,
  tableRows,
  settings,
  className,
}: InventoryDevicesSoldProps) {
  const dial = mergeInventoryDashboardWidgetSettings(settings);
  const periodColumnWidth = Math.max(dial.layout.chartSize + 40, 180);
  const labelColumnWidth = 220;

  return (
    <WidgetShell
      className={className}
      minHeight={dial.layout.devicesCardHeight}
      settings={dial}
      header={<WidgetHeader icon={icon} title={title} settings={dial} />}
      body={
        <div
          className="flex w-full flex-col"
          style={{
            gap: dial.layout.cardGap,
            marginLeft: -dial.layout.cardPaddingX,
            marginRight: -dial.layout.cardPaddingX,
            marginBottom: -dial.layout.cardPaddingY,
          }}
        >
          <div
            className="grid w-full items-start"
            style={{
              gridTemplateColumns: `${labelColumnWidth}px repeat(${periods.length}, minmax(${periodColumnWidth}px, 1fr))`,
              rowGap: dial.layout.devicesGapY,
            }}
          >
            <div aria-hidden />
            {periods.map((period) => (
              <div key={period.label} className="flex justify-center">
                <InventoryPeriodDonut period={period} settings={dial} />
              </div>
            ))}
          </div>
          <InventoryDevicesSoldTable
            columns={tableColumns}
            rows={tableRows}
            labelColumnWidth={labelColumnWidth}
            periodColumnWidth={periodColumnWidth}
          />
        </div>
      }
    />
  );
}

export {
  InventoryDevicesSold,
  InventoryDonutCard,
  InventoryKpiCard,
  InventoryStatusCard,
};
