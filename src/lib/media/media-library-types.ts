export type MediaKind = "image" | "video" | "logo" | "document";

export type MediaCategory =
  | "brand-assets"
  | "vehicle-media"
  | "campaign-media"
  | "connect-assets"
  | "general";

export interface MediaAsset {
  id: string;
  name: string;
  filename: string;
  mimeType: string;
  kind: MediaKind;
  url: string;
  thumbnailUrl?: string;
  sizeBytes: number;
  dimensions?: { width: number; height: number };
  durationMs?: number;
  tags: string[];
  category: MediaCategory;
  uploadedAt: string;
}

export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  "brand-assets": "Brand assets",
  "vehicle-media": "Vehicle media",
  "campaign-media": "Campaign media",
  "connect-assets": "Customization assets",
  general: "General",
};
