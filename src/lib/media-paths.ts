/**
 * Base URL for static assets under `public/media/`.
 */
export const MEDIA_BASE = "/media";

/**
 * Builds a URL under `/media/...`, encoding path segments for spaces and special characters.
 */
export function mediaUrl(relativePath: string): string {
  const trimmed = relativePath.replace(/^\/+/, "");
  if (!trimmed) {
    return MEDIA_BASE;
  }
  const encoded = trimmed
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${MEDIA_BASE}/${encoded}`;
}
