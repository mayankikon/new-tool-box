/**
 * Static catalog of media (videos/images) available for attachment in the campaign wizard.
 * Paths are public URLs (e.g. under public/).
 */

export interface MediaCatalogEntry {
  id: string;
  name: string;
  path: string;
  type: string;
  kind: "image" | "video";
}

export const MEDIA_CATALOG: MediaCatalogEntry[] = [
  {
    id: "intro",
    name: "Intro",
    path: "/videos/intro.mp4",
    type: "video/mp4",
    kind: "video",
  },
];
