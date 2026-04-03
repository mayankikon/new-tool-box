"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Trash2, Camera, Video, FolderOpen, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { videoToGifBlob } from "@/lib/campaigns/video-to-gif";
import { MEDIA_CATALOG } from "@/lib/campaigns/media-catalog";
import type { ImageAttachment } from "@/lib/campaigns/types";
import { MediaPickerDialog } from "@/components/media/media-picker-dialog";

interface ImageUploadProps {
  images: ImageAttachment[];
  onImagesChange: (images: ImageAttachment[]) => void;
  maxImages?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [webcamMode, setWebcamMode] = useState<"photo" | "video">("photo");
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [generatingGifIds, setGeneratingGifIds] = useState<Set<string>>(
    () => new Set(),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const imagesRef = useRef(images);
  const isMaxReached = images.length >= maxImages;

  imagesRef.current = images;

  useEffect(() => {
    const current = imagesRef.current;
    return () => {
      current.forEach((img) => {
        if (img.url.startsWith("blob:")) URL.revokeObjectURL(img.url);
        if (img.gifPreviewUrl?.startsWith("blob:"))
          URL.revokeObjectURL(img.gifPreviewUrl);
      });
    };
  }, [images]);

  const processFiles = useCallback(
    (fileList: FileList) => {
      const remaining = maxImages - images.length;
      if (remaining <= 0) return;

      const files = Array.from(fileList);
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      const videoFiles = files.filter((f) => f.type.startsWith("video/"));

      const newImages: ImageAttachment[] = [];
      let taken = 0;

      for (const file of imageFiles) {
        if (taken >= remaining) break;
        newImages.push({
          id: crypto.randomUUID(),
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
          kind: "image",
        });
        taken += 1;
      }
      for (const file of videoFiles) {
        if (taken >= remaining) break;
        const id = crypto.randomUUID();
        newImages.push({
          id,
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
          kind: "video",
        });
        taken += 1;
      }

      if (newImages.length > 0) {
        const nextImages = [...images, ...newImages];
        onImagesChange(nextImages);

        newImages.forEach((att) => {
          if (att.kind !== "video") return;
          setGeneratingGifIds((prev) => new Set(prev).add(att.id));
          videoToGifBlob(att.url)
            .then((blob) => {
              const gifUrl = URL.createObjectURL(blob);
              const current = imagesRef.current;
              const updated = current.map((img) =>
                img.id === att.id
                  ? { ...img, gifPreviewUrl: gifUrl }
                  : img,
              );
              onImagesChange(updated);
            })
            .catch(() => {
              // Leave video without GIF preview; user still has the video
            })
            .finally(() => {
              setGeneratingGifIds((prev) => {
                const next = new Set(prev);
                next.delete(att.id);
                return next;
              });
            });
        });
      }
    },
    [images, maxImages, onImagesChange],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragOver(false);

      if (!isMaxReached && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [isMaxReached, processFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
        e.target.value = "";
      }
    },
    [processFiles],
  );

  const handleRemove = useCallback(
    (id: string) => {
      const target = images.find((img) => img.id === id);
      if (target?.url.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      if (target?.gifPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(target.gifPreviewUrl);
      }
      onImagesChange(images.filter((img) => img.id !== id));
    },
    [images, onImagesChange],
  );

  const handleOpenWebcam = useCallback((mode: "photo" | "video") => {
    setWebcamError(null);
    setStreamActive(false);
    setVideoReady(false);
    setWebcamMode(mode);
    setWebcamOpen(true);
  }, []);

  const handleWebcamStream = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    setVideoReady(!!video);
  }, []);

  useEffect(() => {
    if (!webcamOpen || !videoReady) return;
    const video = videoRef.current;
    if (!video) return;

    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((s) => {
        stream = s;
        streamRef.current = s;
        video.srcObject = s;
        video.play().catch(() => {});
        setStreamActive(true);
      })
      .catch((err) => {
        setWebcamError(
          err?.message || "Camera access denied. Allow camera to take a photo.",
        );
      });

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStreamActive(false);
    };
  }, [webcamOpen, videoReady]);

  const handleCapturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || images.length >= maxImages) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `webcam-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const url = URL.createObjectURL(blob);
        const newImage: ImageAttachment = {
          id: crypto.randomUUID(),
          name: file.name,
          url,
          size: blob.size,
          type: blob.type,
          kind: "image",
        };
        onImagesChange([...images, newImage]);
        setWebcamOpen(false);
      },
      "image/jpeg",
      0.9,
    );
  }, [images, maxImages, onImagesChange]);

  const handleCloseWebcam = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setWebcamOpen(false);
    setWebcamError(null);
    setStreamActive(false);
    setVideoReady(false);
    setIsRecording(false);
  }, []);

  const handleStartRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || isRecording || images.length >= maxImages) return;

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 });
    recorderRef.current = recorder;
    recordedChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const name = `webcam-${Date.now()}.webm`;
      const videoAttachment: ImageAttachment = {
        id: crypto.randomUUID(),
        name,
        url,
        size: blob.size,
        type: blob.type,
        kind: "video",
      };
      const nextImages = [...images, videoAttachment];
      onImagesChange(nextImages);
      setGeneratingGifIds((prev) => new Set(prev).add(videoAttachment.id));
      videoToGifBlob(url)
        .then((gifBlob) => {
          const gifUrl = URL.createObjectURL(gifBlob);
          const current = imagesRef.current;
          const updated = current.map((img) =>
            img.id === videoAttachment.id
              ? { ...img, gifPreviewUrl: gifUrl }
              : img,
          );
          onImagesChange(updated);
        })
        .catch(() => {})
        .finally(() => {
          setGeneratingGifIds((prev) => {
            const next = new Set(prev);
            next.delete(videoAttachment.id);
            return next;
          });
        });
      handleCloseWebcam();
    };

    recorder.start(100);
    setIsRecording(true);
  }, [images, isRecording, maxImages, onImagesChange, handleCloseWebcam]);

  const handleStopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const handleSelectFromMediaLibrary = useCallback(
    (assets: import("@/lib/media/media-library-types").MediaAsset[]) => {
      const remaining = maxImages - images.length;
      if (remaining <= 0) return;
      const slice = assets.slice(0, remaining);
      const newImages: ImageAttachment[] = slice.map((a) => ({
        id: crypto.randomUUID(),
        name: a.name,
        url: a.url,
        size: a.sizeBytes,
        type: a.mimeType,
        kind: a.kind === "video" ? "video" : "image",
      }));
      const next = [...images, ...newImages];
      onImagesChange(next);
      setMediaLibraryOpen(false);
      newImages.forEach((att, i) => {
        if (att.kind === "video") {
          setGeneratingGifIds((prev) => new Set(prev).add(att.id));
          videoToGifBlob(slice[i].url)
            .then((gifBlob) => {
              const gifUrl = URL.createObjectURL(gifBlob);
              const current = imagesRef.current;
              const updated = current.map((img) =>
                img.id === att.id ? { ...img, gifPreviewUrl: gifUrl } : img,
              );
              onImagesChange(updated);
            })
            .catch(() => {})
            .finally(() => {
              setGeneratingGifIds((prev) => {
                const n = new Set(prev);
                n.delete(att.id);
                return n;
              });
            });
        }
      });
    },
    [images, maxImages, onImagesChange],
  );

  const handleSelectFromCatalog = useCallback(
    (entry: (typeof MEDIA_CATALOG)[number]) => {
      if (images.length >= maxImages) return;
      const id = crypto.randomUUID();
      const newAttachment: ImageAttachment = {
        id,
        name: entry.name,
        url: entry.path,
        size: 0,
        type: entry.type,
        kind: entry.kind,
      };
      const nextImages = [...images, newAttachment];
      onImagesChange(nextImages);
      setCatalogOpen(false);

      if (entry.kind === "video") {
        setGeneratingGifIds((prev) => new Set(prev).add(id));
        videoToGifBlob(entry.path)
          .then((gifBlob) => {
            const gifUrl = URL.createObjectURL(gifBlob);
            const current = imagesRef.current;
            const updated = current.map((img) =>
              img.id === id ? { ...img, gifPreviewUrl: gifUrl } : img,
            );
            onImagesChange(updated);
          })
          .catch(() => {})
          .finally(() => {
            setGeneratingGifIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          });
      }
    },
    [images, maxImages, onImagesChange],
  );

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed p-6 transition-colors",
          isDragOver && !isMaxReached
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30",
          isMaxReached && "opacity-50",
        )}
      >
        <Upload className="size-6 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">
            Drag & drop images or video here
          </p>
          <p className="text-xs text-muted-foreground">
            or Take photo · Take video · Browse media
          </p>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isMaxReached}
            onClick={() => handleOpenWebcam("photo")}
            aria-label="Take photo from camera"
          >
            <Camera className="size-3.5" />
            Take Photo
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isMaxReached}
            onClick={() => handleOpenWebcam("video")}
            aria-label="Record video from camera"
          >
            <Video className="size-3.5" />
            Take Video
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isMaxReached}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Browse media files"
          >
            <FolderOpen className="size-3.5" />
            Browse Media
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isMaxReached}
            onClick={() => setCatalogOpen(true)}
            aria-label="Select from catalog"
          >
            <Library className="size-3.5" />
            Select from catalog
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isMaxReached}
            onClick={() => setMediaLibraryOpen(true)}
            aria-label="Browse media library"
          >
            <Library className="size-3.5" />
            Media library
          </Button>
        </div>
      </div>

      <MediaPickerDialog
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        title="Choose From Media Library"
        multiple
        uploadCategory="campaign-media"
        onSelect={handleSelectFromMediaLibrary}
      />

      {/* Catalog modal */}
      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Select from catalog</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Choose a video or image to attach to your message.
          </p>
          <div className="grid gap-3 py-2">
            {MEDIA_CATALOG.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleSelectFromCatalog(entry)}
                className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                  {entry.kind === "video" ? (
                    <video
                      src={entry.path}
                      className="size-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={entry.path}
                      alt={entry.name}
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.kind === "video" ? "Video" : "Image"} · Catalog
                  </p>
                </div>
              </button>
            ))}
          </div>
          {MEDIA_CATALOG.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No catalog items available.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Webcam dialog: photo or video mode */}
      <Dialog open={webcamOpen} onOpenChange={(open) => !open && handleCloseWebcam()}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>
              {webcamMode === "photo" ? "Take a photo" : "Record a video"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {webcamMode === "photo"
              ? "Allow camera access, then click Capture photo to add the image."
              : "Allow camera access, then start recording. Stop when done; a 3s GIF preview will be generated."}
          </p>
          {webcamError ? (
            <p className="text-sm text-destructive">{webcamError}</p>
          ) : null}
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
            <video
              ref={handleWebcamStream}
              autoPlay
              playsInline
              muted
              className="size-full object-cover"
            />
            {isRecording && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="rounded bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground">
                  Recording…
                </span>
              </div>
            )}
          </div>
          <DialogFooter showCloseButton>
            <Button variant="outline" onClick={handleCloseWebcam}>
              Cancel
            </Button>
            {isRecording ? (
              <Button onClick={handleStopRecording} variant="destructive">
                Stop & save video
              </Button>
            ) : webcamMode === "photo" ? (
              <Button
                onClick={handleCapturePhoto}
                disabled={!streamActive || images.length >= maxImages}
              >
                Capture photo
              </Button>
            ) : (
              <Button
                onClick={handleStartRecording}
                disabled={!streamActive || images.length >= maxImages}
              >
                Start recording
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media count */}
      <p className="text-xs text-muted-foreground">
        {images.length} of {maxImages} items
      </p>

      {/* Thumbnails grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((item) => {
            const isVideo = item.kind === "video";
            const isGenerating = generatingGifIds.has(item.id);
            const previewSrc = isVideo && item.gifPreviewUrl
              ? item.gifPreviewUrl
              : item.url;
            const showVideo = isVideo && !item.gifPreviewUrl && !isGenerating;

            return (
              <div key={item.id} className="group/thumb w-20 space-y-1">
                <div className="relative size-20 overflow-hidden rounded-sm bg-muted">
                  {showVideo ? (
                    <video
                      src={item.url}
                      className="size-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      loop={false}
                    />
                  ) : (
                    <>
                      {isGenerating ? (
                        <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                          GIF…
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={previewSrc}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                      )}
                    </>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover/thumb:opacity-100">
                    <Button
                      variant="destructive"
                      size="icon-xs"
                      onClick={() => handleRemove(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
                <p className="truncate text-[10px] font-medium">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {item.size > 0
                    ? formatFileSize(item.size)
                    : "Catalog"}
                  {isVideo && " · video"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
