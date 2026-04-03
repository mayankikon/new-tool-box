import type { MediaAsset, MediaCategory, MediaKind } from "./media-library-types";

const STORAGE_KEY = "sm-media-library-v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function nowIso(): string {
  return new Date().toISOString();
}

function createId(): string {
  return `media-${Math.random().toString(36).slice(2, 12)}`;
}

function inferKind(mime: string, fileName: string): MediaKind {
  const m = mime.trim().toLowerCase();
  if (m.startsWith("video/")) return "video";
  if (m.startsWith("image/")) return "image";
  const ext = (fileName.match(/\.[^/.]+$/)?.[0] ?? "").toLowerCase();
  if (
    [
      ".jpg",
      ".jpeg",
      ".jfif",
      ".png",
      ".gif",
      ".webp",
      ".avif",
      ".heic",
      ".heif",
      ".bmp",
      ".svg",
      ".tif",
      ".tiff",
    ].includes(ext)
  ) {
    return "image";
  }
  if ([".mp4", ".webm", ".mov", ".m4v", ".ogv"].includes(ext)) {
    return "video";
  }
  return "document";
}

function assetMatchesKindFilter(asset: MediaAsset, kind: MediaKind): boolean {
  if (asset.kind === kind) return true;
  const mime = asset.mimeType.trim().toLowerCase();
  const url = asset.url;
  if (kind === "image") {
    if (mime.startsWith("image/")) return true;
    if (url.startsWith("data:image/")) return true;
  }
  if (kind === "video") {
    if (mime.startsWith("video/")) return true;
    if (url.startsWith("data:video/")) return true;
  }
  return false;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function imageDimensionsFromDataUrl(dataUrl: string): Promise<
  { width: number; height: number } | undefined
> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(undefined);
    img.src = dataUrl;
  });
}

export const MEDIA_LIBRARY_CHANGED_EVENT = "sm-media-library-changed";

function loadRaw(): MediaAsset[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is MediaAsset =>
        typeof x === "object" &&
        x != null &&
        typeof (x as MediaAsset).id === "string" &&
        typeof (x as MediaAsset).url === "string",
    );
  } catch {
    return [];
  }
}

function saveRaw(items: MediaAsset[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(MEDIA_LIBRARY_CHANGED_EVENT));
  } catch {
    /* quota */
  }
}

export function listMediaAssets(filters?: {
  category?: MediaCategory;
  kind?: MediaKind;
  search?: string;
}): MediaAsset[] {
  let items = loadRaw();
  if (filters?.category) {
    items = items.filter((a) => a.category === filters.category);
  }
  if (filters?.kind) {
    items = items.filter((a) => assetMatchesKindFilter(a, filters.kind!));
  }
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    items = items.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  return items.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

export async function addMediaAsset(
  file: File,
  category: MediaCategory,
  tags: string[] = [],
): Promise<MediaAsset> {
  const url = await readFileAsDataUrl(file);
  const kind = inferKind(file.type || "", file.name);
  let thumbnailUrl: string | undefined;
  let dimensions: { width: number; height: number } | undefined;

  if (kind === "image") {
    dimensions = await imageDimensionsFromDataUrl(url);
  }

  const asset: MediaAsset = {
    id: createId(),
    name: file.name.replace(/\.[^/.]+$/, "") || "Untitled",
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    kind,
    url,
    thumbnailUrl,
    sizeBytes: file.size,
    dimensions,
    tags,
    category,
    uploadedAt: nowIso(),
  };

  const items = loadRaw();
  items.unshift(asset);
  saveRaw(items);
  return asset;
}

export function removeMediaAsset(id: string): void {
  const items = loadRaw().filter((a) => a.id !== id);
  saveRaw(items);
}

export function updateMediaAsset(
  id: string,
  patch: Partial<Pick<MediaAsset, "name" | "category" | "tags">>,
): MediaAsset | null {
  const items = loadRaw();
  const idx = items.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  items[idx] = { ...items[idx], ...patch };
  saveRaw(items);
  return items[idx];
}

export function getMediaAssetById(id: string): MediaAsset | undefined {
  return loadRaw().find((a) => a.id === id);
}
