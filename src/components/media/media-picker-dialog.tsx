"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUploadArea } from "@/components/ui/file-upload-area";
import {
  addMediaAsset,
  getMediaAssetById,
  listMediaAssets,
  MEDIA_LIBRARY_CHANGED_EVENT,
} from "@/lib/media/media-library-storage";
import type { MediaAsset, MediaCategory, MediaKind } from "@/lib/media/media-library-types";
import { cn } from "@/lib/utils";

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
  const pendingAssetByIdRef = useRef<Map<string, MediaAsset>>(new Map());
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
      kind: kindFilter,
    });
    if (categoryFilter) {
      return list.filter((a) => a.category === categoryFilter);
    }
    return list;
  }, [kindFilter, categoryFilter, open, libraryEpoch]);

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

  const uploadHint = useMemo(() => {
    if (kindFilter === "video") return "Video files only";
    if (kindFilter === "image") return "PNG, JPG, WebP, or other images";
    return "Images or videos";
  }, [kindFilter]);

  const handleUploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      const queue = multiple ? files : files.slice(0, 1);
      setUploadBusy(true);
      try {
        const newIds: string[] = [];
        for (const file of queue) {
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
          <DialogTitle className="text-left text-base font-medium">
            {title}
          </DialogTitle>
          <p className="mt-1 text-left text-xs leading-relaxed text-muted-foreground">
            Upload new files or pick from your library. Everything is stored
            locally in this preview.
          </p>
        </DialogHeader>

        {allowUpload ? (
          <div className="shrink-0 border-b border-border px-6 py-4">
            <FileUploadArea
              hint={uploadHint}
              accept={uploadAccept}
              multiple={multiple}
              disabled={uploadBusy}
              className="py-6"
              onFilesSelected={(fileList) => void handleUploadFiles(fileList)}
            />
          </div>
        ) : null}

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

        <div className="min-h-0 flex-1 overflow-hidden px-6 pb-4 pt-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Library
          </p>
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
                ? "No media in your library yet. Upload above to add files."
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
