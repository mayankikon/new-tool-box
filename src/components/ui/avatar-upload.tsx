"use client"

import { useRef, useCallback } from "react"
import { Trash2, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AvatarUploadProps extends React.ComponentProps<"div"> {
  /** URL of the currently uploaded avatar image */
  src?: string | null
  /** Alt text for the avatar image */
  alt?: string
  /** Accepted MIME types (default: "image/*") */
  accept?: string
  /** Hint text shown to the right (e.g. "JPG, GIF or PNG. 1MB Max.") */
  hint?: string
  /** Force the "uploaded" visual state (grey fill + delete button) even without a src URL */
  hasImage?: boolean
  /** Called when a file is selected for upload */
  onFileSelected?: (file: File) => void
  /** Called when the remove/delete button is clicked */
  onRemove?: () => void
}

function AvatarUpload({
  className,
  src,
  alt = "Avatar",
  accept = "image/*",
  hint = "JPG, GIF or PNG. 1MB Max.",
  hasImage,
  onFileSelected,
  onRemove,
  ...props
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hasAvatar = Boolean(src) || Boolean(hasImage)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelected?.(file)
        e.target.value = ""
      }
    },
    [onFileSelected],
  )

  const handleUploadClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <div
      data-slot="avatar-upload"
      className={cn("flex items-center gap-4", className)}
      {...props}
    >
      {/* Avatar preview */}
      <div
        className={cn(
          "relative size-10 shrink-0 overflow-hidden rounded-sm border border-border",
          hasAvatar ? "bg-muted" : "bg-muted/60",
        )}
      >
        {src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={alt}
            className="size-full object-cover"
          />
        ) : hasAvatar ? (
          <div className="size-full bg-muted" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/40">
            <User className="size-5" aria-hidden />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleUploadClick}
        >
          Upload
        </Button>
        {hasAvatar && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label="Remove avatar"
            className="text-muted-foreground"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {/* Hint */}
      <span className="text-xs leading-4 text-muted-foreground whitespace-nowrap">
        {hint}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

export { AvatarUpload }
export type { AvatarUploadProps }
