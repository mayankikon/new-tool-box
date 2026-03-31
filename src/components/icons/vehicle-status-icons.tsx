import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Vector icons for the vehicle list panel status row (location, key paired, battery).
 * Source: dealership Icons set; use these in place of Lucide for consistent branding.
 */

const ICON_SIZE = 16;
const viewBox = "0 0 24 24";

type StatusIconVariant = "active" | "inactive";

interface StatusIconProps {
  variant?: StatusIconVariant;
  className?: string;
}

const statusIconBase = "size-4 shrink-0";
/** Default stroke/fill for rims via currentColor; override with e.g. `text-foreground` where needed. */
const statusIconThemeColor = "text-[var(--theme-icon-secondary)]";

function LocationIconSvg({ className, variant: _unusedVariant }: StatusIconProps) {
  void _unusedVariant;
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        statusIconBase,
        "text-[var(--theme-icon-secondary)]",
        className,
      )}
      aria-hidden
    >
      <path
        d="M2.74414 7.918C2.68448 8.28657 2.65332 8.66008 2.65332 9.03519C2.61796 11.3382 3.26228 13.6004 4.50586 15.5391C5.74949 17.4777 7.53752 19.0075 9.64551 19.9356C10.7879 19.4335 11.8342 18.7518 12.7529 17.9268L14.1475 19.3213C12.9557 20.4213 11.5768 21.3137 10.0645 21.9453C9.93306 22.0048 9.78972 22.0353 9.64551 22.0352C9.50234 22.0357 9.35996 22.0053 9.22949 21.9463C6.67321 20.8788 4.49181 19.0741 2.96484 16.7627C1.43789 14.4513 0.634162 11.737 0.655273 8.96683C0.657781 8.038 0.804553 7.12461 1.08203 6.25589L2.74414 7.918ZM9.66992 3.15757e-05C12.0543 0.00650358 14.339 0.959946 16.0205 2.65042C16.853 3.48744 17.513 4.48043 17.9619 5.5723C18.4107 6.66417 18.6398 7.83417 18.6367 9.01468C18.6475 11.545 17.9671 14.025 16.6797 16.1934L18.5078 18.0215L17.0938 19.4356L0 2.34183L1.41406 0.927766L3.20508 2.71878C3.2383 2.68461 3.27183 2.6499 3.30566 2.61624C4.99622 0.934912 7.28563 -0.00628359 9.66992 3.15757e-05ZM9.64551 2.043C8.72754 2.043 7.81785 2.22403 6.96973 2.57523C6.12157 2.92655 5.35037 3.44175 4.70117 4.09085C4.68061 4.11142 4.65992 4.13251 4.63965 4.15335L6.75488 6.26859C6.95522 6.05932 7.17952 5.8716 7.42285 5.70902C8.08057 5.26965 8.85453 5.03519 9.64551 5.03519C10.7061 5.0354 11.7237 5.45711 12.4736 6.20706C13.2235 6.95716 13.6455 7.97454 13.6455 9.03519C13.6455 9.8262 13.4101 10.6001 12.9707 11.2578C12.8082 11.501 12.6183 11.7227 12.4092 11.9229L15.2441 14.7578C16.1753 13.0237 16.6576 11.078 16.6367 9.09964V9.03519C16.6367 8.11705 16.4558 7.20767 16.1045 6.35941C15.7532 5.51124 15.238 4.74005 14.5889 4.09085C13.9398 3.44188 13.1692 2.92656 12.3213 2.57523C11.4732 2.22395 10.5634 2.04311 9.64551 2.043ZM10.4102 7.18753C10.0449 7.03628 9.64265 6.99622 9.25488 7.07327C8.86701 7.15043 8.51015 7.34152 8.23047 7.62113C8.20999 7.64161 8.18943 7.66233 8.16992 7.68363L10.9932 10.5069C11.0147 10.4873 11.0389 10.4699 11.0596 10.4493C11.4344 10.0742 11.6455 9.56542 11.6455 9.03519C11.6455 8.63971 11.5273 8.25271 11.3076 7.92386C11.0879 7.5952 10.7754 7.33888 10.4102 7.18753Z"
        fill="currentColor"
      />
    </svg>
  );
}

function KeyIconSvg({ variant = "inactive", className }: StatusIconProps) {
  const clipPathId = React.useId().replace(/:/g, "");

  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(statusIconBase, statusIconThemeColor, className)}
      aria-hidden
    >
      <g clipPath={`url(#${clipPathId})`}>
        <path d="M12.6137 7.53719C13.3134 8.23683 14.4477 8.23683 15.1474 7.53719C15.847 6.83755 15.847 5.70321 15.1474 5.00357C14.4477 4.30393 13.3134 4.30393 12.6137 5.00357C11.9141 5.70321 11.9141 6.83755 12.6137 7.53719Z" fill="currentColor" />
        <path fillRule="evenodd" clipRule="evenodd" d="M18.3144 1.83655C15.8656 -0.612184 11.8955 -0.612184 9.44672 1.83655C8.08285 3.20043 7.47925 5.0367 7.63389 6.81641L7.14518 7.30512L1.65698 1.81693L0.242769 3.23114L16.2214 19.2098L17.6356 17.7955L12.8458 13.0058L13.3345 12.517C15.1142 12.6717 16.9505 12.0681 18.3144 10.7042C20.7631 8.25547 20.7631 4.28529 18.3144 1.83655ZM11.579 11.7389L12.3769 10.9411C12.5807 10.7373 12.8701 10.644 13.1546 10.6904C14.5313 10.9151 15.9884 10.4966 17.0476 9.4374C18.7967 7.6883 18.7967 4.85246 17.0476 3.10336C15.2985 1.35426 12.4626 1.35426 10.7135 3.10336C9.65437 4.16252 9.23583 5.61968 9.46053 6.99636C9.50696 7.28082 9.41367 7.57025 9.20986 7.77405L8.41199 8.57193L11.579 11.7389Z" fill="currentColor" />
        <path d="M8.83298 14.6513L7.53566 13.3539C7.20296 13.4847 6.96745 13.8088 6.96745 14.1879V15.8258H5.3296C4.83488 15.8258 4.43383 16.2268 4.43383 16.7216V18.3594H1.79154V15.1924L5.58282 11.4011L4.31601 10.1343L0.262365 14.1879C0.0943755 14.3559 0 14.5838 0 14.8213V19.2552C0 19.7499 0.40105 20.1509 0.895769 20.1509H5.3296C5.82432 20.1509 6.22537 19.7499 6.22537 19.2552V17.6173H7.86321C8.35793 17.6173 8.75898 17.2163 8.75898 16.7215V15.5224C8.75898 15.2305 8.78374 14.939 8.83298 14.6513Z" fill="currentColor" />
      </g>
      <defs>
        <clipPath id={clipPathId}>
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function BatteryIconSvg({ variant = "inactive", className }: StatusIconProps) {
  const isActive = variant === "active";
  const innerColor = isActive ? "#00B397" : "#E50C0C";

  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(statusIconBase, statusIconThemeColor, className)}
      aria-hidden
    >
      {isActive ? (
        <>
          <path
            d="M14 3C14 2.44772 14.4477 2 15 2H18C18.5523 2 19 2.44772 19 3C19 3.55228 18.5523 4 18 4H15C14.4477 4 14 3.55228 14 3Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 5C1.89543 5 1 5.89543 1 7V20C1 21.1046 1.89543 22 3 22H21C22.1046 22 23 21.1046 23 20V7C23 5.89543 22.1046 5 21 5H3ZM21 7H3L3 20H21V7Z"
            fill="currentColor"
          />
          <path
            d="M6 2C5.44772 2 5 2.44772 5 3C5 3.55228 5.44772 4 6 4H9C9.55228 4 10 3.55228 10 3C10 2.44772 9.55228 2 9 2H6Z"
            fill="currentColor"
          />
          <rect x="4" y="8" width="16" height="11" fill={innerColor} />
        </>
      ) : (
        <>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21 7H3L3 20H21V7ZM3 5C1.89543 5 1 5.89543 1 7V20C1 21.1046 1.89543 22 3 22H21C22.1046 22 23 21.1046 23 20V7C23 5.89543 22.1046 5 21 5H3Z"
            fill="currentColor"
          />
          <path
            d="M14 3C14 2.44772 14.4477 2 15 2H18C18.5523 2 19 2.44772 19 3C19 3.55228 18.5523 4 18 4H15C14.4477 4 14 3.55228 14 3Z"
            fill="currentColor"
          />
          <path
            d="M5 3C5 2.44772 5.44772 2 6 2H9C9.55228 2 10 2.44772 10 3C10 3.55228 9.55228 4 9 4H6C5.44772 4 5 3.55228 5 3Z"
            fill="currentColor"
          />
          <rect x="4" y="15" width="16" height="4" fill={innerColor} />
        </>
      )}
    </svg>
  );
}

export { LocationIconSvg, KeyIconSvg, BatteryIconSvg };
export type { StatusIconProps, StatusIconVariant };
