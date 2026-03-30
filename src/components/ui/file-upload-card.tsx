"use client"

import { X, MoreHorizontal, Loader2, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"

type FileUploadCardState = "uploaded" | "uploading" | "failed"
type FileUploadCardSize = "lg" | "sm"

interface FileUploadCardProps extends React.ComponentProps<"div"> {
  fileName?: string
  fileSize?: string
  thumbnailSrc?: string
  state?: FileUploadCardState
  size?: FileUploadCardSize
  /** Upload progress 0-100, shown in the uploading state */
  progress?: number
  onRemove?: () => void
  onRetry?: () => void
}

function FileUploadCard({
  className,
  fileName = "thumbnail.png",
  fileSize = "1.5 MB",
  thumbnailSrc,
  state = "uploaded",
  size = "lg",
  onRemove,
  onRetry,
  ...props
}: FileUploadCardProps) {
  return (
    <div
      data-slot="file-upload-card"
      data-state={state}
      data-size={size}
      className={cn(
        "relative flex items-center gap-2 overflow-clip rounded-lg border bg-card pl-2 pr-4 py-2 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]",
        "border-border",
        state === "failed" && "border-destructive/30",
        className,
      )}
      {...props}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          "shrink-0 overflow-hidden rounded-[var(--radius-xs)]",
          "border border-border shadow-sm",
          size === "sm" ? "size-6" : "size-10",
        )}
      >
        {thumbnailSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={thumbnailSrc}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
      </div>

      {/* Content: lg shows name + meta row; sm shows name only */}
      {size === "lg" ? (
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium leading-5 text-foreground">
            {fileName}
          </span>
          <div className="flex items-center gap-1 text-xs leading-4">
            <span className="text-muted-foreground">{fileSize}</span>
            <span className="text-muted-foreground/40" aria-hidden>|</span>
            <span
              className={cn(
                state === "uploaded" && "text-primary",
                state === "uploading" && "text-primary",
                state === "failed" && "text-destructive",
              )}
            >
              {state === "uploaded" && "Uploaded"}
              {state === "uploading" && "Uploading\u2026"}
              {state === "failed" && "Error"}
            </span>
          </div>
        </div>
      ) : (
        <span className="min-w-0 flex-1 truncate text-sm font-medium leading-5 text-foreground">
          {fileName}
        </span>
      )}

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {/* State icon for sm size */}
        {size === "sm" && state === "uploading" && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Uploading" />
        )}
        {size === "sm" && state === "failed" && (
          <AlertCircle className="size-4 text-destructive" aria-label="Upload failed" />
        )}

        {/* Menu / retry */}
        {state === "uploaded" && (
          <button
            type="button"
            className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="More options"
          >
            <MoreHorizontal className="size-4" />
          </button>
        )}

        {/* Remove */}
        <button
          type="button"
          onClick={state === "failed" ? onRetry ?? onRemove : onRemove}
          className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={state === "failed" ? "Retry or remove" : "Remove file"}
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Inner shadow overlay matching Figma card treatment */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-1px_0px_0px_rgba(0,0,0,0.1)]" />
    </div>
  )
}

export { FileUploadCard }
export type { FileUploadCardProps, FileUploadCardState, FileUploadCardSize }
