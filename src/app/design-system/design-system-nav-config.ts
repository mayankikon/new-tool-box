/**
 * Design system left nav structure. Must stay in sync with:
 * - docs/design-system-audit.md § 1.5 Left nav structure (foundations include Maps)
 * - Section id attributes on foundation organisms (e.g. `id="imagery"`)
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
    { slug: "maps", label: "Maps" },
    { slug: "typography", label: "Typography" },
    { slug: "spacing", label: "Spacing and Layout" },
    { slug: "shadows-elevations", label: "Shadows & Elevations" },
    { slug: "imagery", label: "Imagery" },
  ],
  components: [
    { slug: "button", label: "Button" },
    { slug: "avatar-bar", label: "Avatar Bar" },
    { slug: "title-bar", label: "Title Bar" },
    { slug: "breadcrumbs", label: "Breadcrumbs" },
    { slug: "filter-button", label: "Filter Button" },
    { slug: "badge", label: "Badge" },
    { slug: "input", label: "Input" },
    { slug: "checkbox", label: "Checkbox" },
    { slug: "radio", label: "Radio" },
    { slug: "toggle-switch", label: "Toggle Switch" },
    {
      slug: "automotive-system-toggle",
      label: "Automotive System Toggle",
    },
    { slug: "card", label: "Card" },
    { slug: "tabs", label: "Tabs" },
    { slug: "table", label: "Table" },
    { slug: "table-with-tabs", label: "Table With Tabs" },
    { slug: "tooltip", label: "Tooltip" },
    { slug: "map-view-tooltip", label: "Map View Tooltip" },
    { slug: "inventory-vehicle-hover-tooltip", label: "Inventory Vehicle Hover Tooltip" },
    { slug: "progress-bar", label: "Progress Bar" },
    { slug: "slider", label: "Slider" },
    { slug: "battery-threshold", label: "Battery Threshold" },
    { slug: "campaign-suggestion-card", label: "Campaign Suggestion Card" },
    { slug: "dashboard-widgets", label: "Dashboard Widgets" },
    { slug: "map-markers", label: "Map Markers" },
    { slug: "stepper", label: "Stepper" },
    { slug: "paginator", label: "Paginator" },
    { slug: "inline-tips", label: "Inline Tips" },
    { slug: "dropdown-menu", label: "Dropdown Menu" },
    { slug: "modal", label: "Modal" },
    { slug: "date-picker", label: "Date Picker" },
  ],
  patterns: [
    { slug: "page-layout-chrome", label: "Page Layout & Chrome" },
    { slug: "fluid-shell-pilot", label: "Fluid Shell Pilot" },
    { slug: "ai-textarea", label: "AI Textarea" },
    { slug: "empty-state", label: "Empty State" },
    { slug: "file-upload", label: "File Upload" },
    { slug: "sidebar", label: "Sidebar" },
    { slug: "filters-panel", label: "Filters Panel" },
    { slug: "input-caption", label: "Input Caption" },
    { slug: "vehicle-list-item", label: "Vehicle List Item" },
    { slug: "vehicle-list-panel", label: "Vehicle List Panel" },
    { slug: "vehicle-details-page", label: "Vehicle Details Page" },
  ],
};
