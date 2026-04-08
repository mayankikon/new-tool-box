const STORAGE_KEY = "inventory-vehicle-search-recent-v1";
const MAX_ITEMS = 10;

function parseStoredList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

/** Recent inventory search strings (newest first), max 10. */
export function readRecentVehicleSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return parseStoredList(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

/** Promote `query` to the front; dedupes case-insensitively. No-op if empty after trim. */
export function rememberVehicleSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  const existing = readRecentVehicleSearches();
  const withoutDup = existing.filter(
    (q) => q.toLowerCase() !== trimmed.toLowerCase()
  );
  const next = [trimmed, ...withoutDup].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // quota / private mode
  }
}
