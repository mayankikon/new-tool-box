"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  addMediaAsset,
  getMediaAssetById,
  listMediaAssets,
  MEDIA_LIBRARY_CHANGED_EVENT,
} from "@/lib/media/media-library-storage";
import { MEDIA_CATEGORY_LABELS } from "@/lib/media/media-library-types";
import type { MediaAsset, MediaCategory, MediaKind } from "@/lib/media/media-library-types";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES: (MediaCategory | "all")[] = [
  "all",
  "brand-assets",
  "vehicle-media",
  "campaign-media",
  "connect-assets",
  "general",
];

export function MediaPickerDialog({
  open,
  onOpenChange,
  title = "Choose From Library",
  kindFilter,
  categoryFilter,
  onSelect,
  multiple = false,
  allowUpload = true,
  uploadCategory = "general",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  kindFilter?: MediaKind;
  categoryFilter?: MediaCategory;
  onSelect: (assets: MediaAsset[]) => void;
  multiple?: boolean;
  allowUpload?: boolean;
  uploadCategory?: MediaCategory;
}) {
  const uploadInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingAssetByIdRef = useRef<Map<string, MediaAsset>>(new Map());
  const [tab, setTab] = useState<(typeof ALL_CATEGORIES)[number]>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [libraryEpoch, setLibraryEpoch] = useState(0);
  const [uploadBusy, setUploadBusy] = useState(false);

  useEffect(() => {
    const bump = () => setLibraryEpoch((n) => n + 1);
    window.addEventListener(MEDIA_LIBRARY_CHANGED_EVENT, bump);
    return () => window.removeEventListener(MEDIA_LIBRARY_CHANGED_EVENT, bump);
  }, []);

  useEffect(() => {
    if (!open) {
      pendingAssetByIdRef.current.clear();
    } else {
      setLibraryEpoch((n) => n + 1);
    }
  }, [open]);

  const assets = useMemo(() => {
    const list = listMediaAssets({
      category: tab === "all" ? undefined : tab,
      kind: kindFilter,
    });
    if (categoryFilter) {
      return list.filter((a) => a.category === categoryFilter);
    }
    return list;
  }, [tab, kindFilter, categoryFilter, open, libraryEpoch]);

  const firstSelectedAsset = useMemo(() => {
    const id = Array.from(selected)[0];
    if (!id) return null;
    return (
      getMediaAssetById(id) ?? pendingAssetByIdRef.current.get(id) ?? null
    );
  }, [selected, libraryEpoch, assets]);

  const uploadAccept = useMemo(() => {
    if (kindFilter === "video") return "video/*";
    if (kindFilter === "image") return "image/*";
    return "image/*,video/*";
  }, [kindFilter]);

  const handleUploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setUploadBusy(true);
      try {
        const newIds: string[] = [];
        for (const file of Array.from(files)) {
          const asset = await addMediaAsset(file, uploadCategory);
          pendingAssetByIdRef.current.set(asset.id, asset);
          const isVideo =
            asset.kind === "video" ||
            (asset.mimeType?.startsWith("video/") ?? false);
          if (kindFilter === "video" && !isVideo) {
            pendingAssetByIdRef.current.delete(asset.id);
            continue;
          }
          if (kindFilter === "image" && isVideo) {
            pendingAssetByIdRef.current.delete(asset.id);
            continue;
          }
          newIds.push(asset.id);
        }
        if (newIds.length === 0) return;
        setTab(uploadCategory);
        setLibraryEpoch((n) => n + 1);
        setSelected((prev) => {
          const next = new Set(prev);
          for (const id of newIds) {
            if (multiple) next.add(id);
            else {
              next.clear();
              next.add(id);
            }
          }
          return next;
        });
      } finally {
        setUploadBusy(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [kindFilter, multiple, uploadCategory],
  );

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (multiple) next.add(id);
      else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  }, [multiple]);

  const handleConfirm = useCallback(() => {
    const chosen = Array.from(selected)
      .map(
        (id) =>
          getMediaAssetById(id) ?? pendingAssetByIdRef.current.get(id),
      )
      .filter((a): a is MediaAsset => {
        if (!a) return false;
        if (categoryFilter && a.category !== categoryFilter) return false;
        return true;
      });
    if (chosen.length > 0) {
      for (const a of chosen) {
        pendingAssetByIdRef.current.delete(a.id);
      }
      onSelect(chosen);
      onOpenChange(false);
      setSelected(new Set());
    }
  }, [selected, categoryFilter, onSelect, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex max-h-[min(90vh,880px)] w-[min(100vw-1.5rem,52rem)] flex-col gap-0 overflow-hidden p-0 sm:!max-w-[52rem]",
          "rounded-md border-x-[length:var(--stroke-sm)] border-border bg-background text-sm",
        )}
      >
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <DialogTitle className="text-left text-base font-medium">
              {title}
            </DialogTitle>
            {allowUpload ? (
              <div className="flex shrink-0 flex-col gap-1.5 sm:items-end">
                <label htmlFor={uploadInputId} className="sr-only">
                  Upload files from your computer
                </label>
                <input
                  id={uploadInputId}
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept={uploadAccept}
                  multiple={multiple}
                  disabled={uploadBusy}
                  onChange={(e) => void handleUploadFiles(e.target.files)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={uploadBusy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-3.5" aria-hidden />
                  Upload From Computer
                </Button>
                <p className="max-w-[260px] text-right text-[11px] leading-snug text-muted-foreground sm:max-w-none">
                  Files are saved to your library and appear in the grid below.
                </p>
              </div>
            ) : null}
          </div>
        </DialogHeader>

        {firstSelectedAsset && !multiple ? (
          <div className="shrink-0 border-b border-border bg-muted/30 px-6 py-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Selected preview
            </p>
            <div className="relative mx-auto flex max-h-[min(40vh,280px)] min-h-[160px] w-full max-w-lg items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/50">
              {firstSelectedAsset.kind === "video" ? (
                <video
                  src={firstSelectedAsset.url}
                  className="max-h-[min(40vh,280px)] w-full object-contain"
                  muted
                  playsInline
                  controls
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={firstSelectedAsset.thumbnailUrl ?? firstSelectedAsset.url}
                  alt=""
                  className="max-h-[min(40vh,280px)] w-full object-contain"
                />
              )}
            </div>
            <p className="mt-2 truncate text-center text-xs text-muted-foreground">
              {firstSelectedAsset.name}
            </p>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-hidden px-6 pb-4 pt-3">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as (typeof ALL_CATEGORIES)[number])}
          >
            <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-1">
              {ALL_CATEGORIES.map((c) => (
                <TabsTrigger
                  key={c}
                  value={c}
                  className="text-xs capitalize"
                >
                  {c === "all" ? "All" : MEDIA_CATEGORY_LABELS[c]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="grid max-h-[min(42vh,360px)] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {assets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => toggle(a.id)}
                className={cn(
                  "relative overflow-hidden rounded-lg border-2 text-left transition-colors",
                  selected.has(a.id)
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:bg-muted/40",
                )}
              >
                <div className="aspect-square min-h-[112px] bg-muted/50">
                  {a.kind === "video" ? (
                    <video
                      src={a.url}
                      className="size-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={a.thumbnailUrl ?? a.url}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <p className="truncate px-1.5 py-1 text-[10px] text-muted-foreground">
                  {a.name}
                </p>
              </button>
            ))}
          </div>
          {assets.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {allowUpload
                ? "No matching assets in this tab. Upload above or pick another category."
                : "No matching assets yet. Add files in Media Library."}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-background px-6 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={selected.size === 0}
          >
            {multiple ? `Add (${selected.size})` : "Use Selected"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
