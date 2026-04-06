export type DesignSystemGroup = "foundations" | "components" | "patterns";

export function buildDesignSystemItemHref(group: DesignSystemGroup, slug: string): string {
  return `/design-system/${group}/${slug}`;
}

export function isDesignSystemGroup(value: string): value is DesignSystemGroup {
  return value === "foundations" || value === "components" || value === "patterns";
}
