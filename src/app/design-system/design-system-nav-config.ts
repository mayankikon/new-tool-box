/**
 * Design system left nav structure. Must stay in sync with:
 * - docs/design-system-audit.md § 1.5 Left nav structure
 * - Section id attributes in src/app/design-system/page.tsx
 */

export interface NavItem {
  slug: string;
  label: string;
}

export interface DesignSystemNavConfig {
  foundations: NavItem[];
  components: NavItem[];
  patterns: NavItem[];
}

export const designSystemNavConfig: DesignSystemNavConfig = {
  foundations: [
    { slug: "colors", label: "Colors" },
    { slug: "typography", label: "Typography" },
    { slug: "spacing", label: "Spacing" },
    { slug: "radius", label: "Radius" },
    { slug: "shadows-elevations", label: "Shadows & Elevations" },
    { slug: "stroke", label: "Stroke" },
  ],
  components: [
    { slug: "button", label: "Button" },
    { slug: "avatar-bar", label: "Avatar bar" },
    { slug: "top-bar", label: "Top bar" },
    { slug: "breadcrumbs", label: "Breadcrumbs" },
    { slug: "link-button", label: "Link Button" },
    { slug: "filter-button", label: "Filter Button" },
    { slug: "badge", label: "Badge" },
    { slug: "input", label: "Input" },
    { slug: "checkbox", label: "Checkbox" },
    { slug: "radio", label: "Radio" },
    { slug: "toggle-switch", label: "Toggle Switch" },
    {
      slug: "automotive-system-toggle",
      label: "Automotive system toggle",
    },
    { slug: "card", label: "Card" },
    { slug: "tabs", label: "Tabs" },
    { slug: "table", label: "Table" },
    { slug: "tooltip", label: "Tooltip" },
    { slug: "map-view-tooltip", label: "Map view tooltip" },
    { slug: "progress-bar", label: "Progress Bar" },
    { slug: "slider", label: "Slider" },
    { slug: "battery-threshold", label: "Battery threshold" },
    { slug: "campaign-suggestion-card", label: "Campaign Suggestion Card" },
    { slug: "dashboard-widgets", label: "Dashboard Widgets" },
    { slug: "map-markers", label: "Map markers" },
    { slug: "stepper", label: "Stepper" },
    { slug: "paginator", label: "Paginator" },
    { slug: "inline-tips", label: "Inline Tips" },
    { slug: "dropdown-menu", label: "Dropdown Menu" },
    { slug: "alert-dialog", label: "Alert Dialog" },
    { slug: "date-picker", label: "Date Picker" },
    {
      slug: "sort-form-controls-reference",
      label: "Portfolio 3.0 form controls",
    },
  ],
  patterns: [
    { slug: "page-layout-chrome", label: "Page layout & chrome" },
    { slug: "fluid-shell-pilot", label: "Fluid shell pilot" },
    { slug: "ai-textarea", label: "AI TextArea" },
    { slug: "empty-state", label: "Empty State" },
    { slug: "file-upload", label: "File Upload" },
    { slug: "sidebar", label: "Sidebar" },
    { slug: "filters-panel", label: "Filters Panel" },
    { slug: "input-caption", label: "Input Caption" },
    { slug: "vehicle-list-item", label: "Vehicle List Item" },
    { slug: "vehicle-list-panel", label: "Vehicle List Panel" },
    { slug: "vehicle-details-page", label: "Vehicle Details Page" },
    { slug: "table-view", label: "Tables" },
  ],
};
