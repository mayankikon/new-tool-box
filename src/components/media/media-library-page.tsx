"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUploadArea } from "@/components/ui/file-upload-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input, InputContainer, InputIcon } from "@/components/ui/input";
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

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      const category: MediaCategory = tab === "all" ? "general" : tab;
      for (const file of files) {
        await addMediaAsset(file, category);
      }
      refresh();
    },
    [tab, refresh],
  );

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden pt-6",
        className,
      )}
    >
      {topBar}

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden px-8 pb-8 pt-6">
        <Tabs
          value={tab}
          onValueChange={(v) =>
            setTab(v as (typeof FILTER_TABS)[number])
          }
        >
          <TabsList variant="filter">
            {FILTER_TABS.map((f) => (
              <TabsTrigger key={f} value={f}>
                {f === "all" ? "All" : MEDIA_CATEGORY_LABELS[f]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-6 rounded-md border border-border bg-card p-6 shadow-sm">
            <FileUploadArea
              accept="image/*,video/*"
              hint="Drop images or videos here, up to 10 files at a time"
              onFilesSelected={(files) => void handleFilesSelected(files)}
            />

            <InputContainer className="w-full max-w-sm" size="sm">
              <InputIcon position="lead">
                <Search className="size-4" aria-hidden />
              </InputIcon>
              <Input
                standalone={false}
                aria-label="Search name or tags"
                placeholder="Search name or tags…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputContainer>

            {assets.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {assets.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedId(a.id)}
                    className={cn(
                      "overflow-hidden rounded-md border text-left transition-colors",
                      selectedId === a.id
                        ? "border-primary ring-2 ring-primary/25"
                        : "border-border bg-background hover:bg-muted/20",
                    )}
                  >
                    <div className="aspect-square bg-background">
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
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  No media yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload images or videos to use in campaigns, coupons, and
                  Customization.
                </p>
              </div>
            )}
          </div>

          <div className="w-full shrink-0 lg:w-80">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-sm">Asset details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selected ? (
                  <>
                    <div className="overflow-hidden rounded-lg border bg-background">
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
