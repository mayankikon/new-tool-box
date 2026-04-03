"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  addMediaAsset,
  listMediaAssets,
  MEDIA_LIBRARY_CHANGED_EVENT,
  removeMediaAsset,
  updateMediaAsset,
} from "@/lib/media/media-library-storage";
import {
  MEDIA_CATEGORY_LABELS,
  type MediaAsset,
  type MediaCategory,
} from "@/lib/media/media-library-types";
import { cn } from "@/lib/utils";

const FILTER_TABS: (MediaCategory | "all")[] = [
  "all",
  "brand-assets",
  "vehicle-media",
  "campaign-media",
  "connect-assets",
  "general",
];

export function MediaLibraryPage({
  className,
  topBar,
}: {
  className?: string;
  topBar: React.ReactNode;
}) {
  const [tab, setTab] = useState<(typeof FILTER_TABS)[number]>("all");
  const [search, setSearch] = useState("");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setAssets(
      listMediaAssets({
        category: tab === "all" ? undefined : tab,
        search: search.trim() || undefined,
      }),
    );
  }, [tab, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(MEDIA_LIBRARY_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(MEDIA_LIBRARY_CHANGED_EVENT, onChange);
  }, [refresh]);

  const selected = useMemo(
    () => assets.find((a) => a.id === selectedId) ?? null,
    [assets, selectedId],
  );

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const category: MediaCategory =
        tab === "all" ? "general" : tab;
      for (const file of Array.from(files)) {
        await addMediaAsset(file, category);
      }
      refresh();
    },
    [tab, refresh],
  );

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
        className,
      )}
    >
      <div className="shrink-0 pt-6">{topBar}</div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-8 pb-8 pt-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <Tabs
                value={tab}
                onValueChange={(v) =>
                  setTab(v as (typeof FILTER_TABS)[number])
                }
              >
                <TabsList className="h-auto flex-wrap justify-start">
                  {FILTER_TABS.map((f) => (
                    <TabsTrigger key={f} value={f} className="text-xs capitalize">
                      {f === "all" ? "All" : MEDIA_CATEGORY_LABELS[f]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder="Search name or tags…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-48"
                />
                <Label className="sr-only" htmlFor="media-upload">
                  Upload files
                </Label>
                <Input
                  id="media-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="max-w-[200px] cursor-pointer text-xs"
                  onChange={(e) => void handleUpload(e.target.files)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {assets.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedId(a.id)}
                  className={cn(
                    "overflow-hidden rounded-xl border text-left transition-colors",
                    selectedId === a.id
                      ? "border-primary ring-2 ring-primary/25"
                      : "border-border bg-card hover:bg-muted/40",
                  )}
                >
                  <div className="aspect-square bg-muted/40">
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
                        src={a.url}
                        alt=""
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-0.5 p-2">
                    <p className="truncate text-xs font-medium">{a.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {(a.sizeBytes / 1024).toFixed(0)} KB ·{" "}
                      {MEDIA_CATEGORY_LABELS[a.category]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {assets.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">No media yet</CardTitle>
                  <CardDescription>
                    Upload images or videos to use in campaigns, coupons, and
                    Customization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
                    <ImagePlus className="size-4" />
                    Choose files
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => void handleUpload(e.target.files)}
                    />
                  </label>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="w-full shrink-0 lg:w-80">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-sm">Asset details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selected ? (
                  <>
                    <div className="overflow-hidden rounded-lg border bg-muted/30">
                      {selected.kind === "video" ? (
                        <video
                          src={selected.url}
                          className="max-h-40 w-full object-contain"
                          controls
                        />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={selected.url}
                          alt=""
                          className="max-h-40 w-full object-contain"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={selected.name}
                        onChange={(e) => {
                          updateMediaAsset(selected.id, {
                            name: e.target.value,
                          });
                          refresh();
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Category</Label>
                      <Select
                        value={selected.category}
                        items={MEDIA_CATEGORY_LABELS}
                        onValueChange={(v) => {
                          updateMediaAsset(selected.id, {
                            category: v as MediaCategory,
                          });
                          refresh();
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(MEDIA_CATEGORY_LABELS) as MediaCategory[]).map(
                            (c) => (
                              <SelectItem key={c} value={c}>
                                {MEDIA_CATEGORY_LABELS[c]}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-[10px] text-muted-foreground break-all">
                      {selected.url.slice(0, 80)}
                      …
                    </p>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        removeMediaAsset(selected.id);
                        setSelectedId(null);
                        refresh();
                      }}
                    >
                      <Trash2 className="mr-1.5 size-4" />
                      Delete
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select an asset to edit details.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
