"use client"

import { useRef, useState, useCallback } from "react"
import { CloudUpload } from "lucide-react"

import { cn } from "@/lib/utils"

interface FileUploadAreaProps extends Omit<React.ComponentProps<"div">, "onDrop"> {
  /** Descriptive hint, e.g. "Up to 10 files, 100MB total limit" */
  hint?: string
  /** Accepted MIME types for the hidden input (e.g. "image/*,video/*") */
  accept?: string
  disabled?: boolean
  /** Called with the selected/dropped files */
  onFilesSelected?: (files: File[]) => void
}

function FileUploadArea({
  className,
  hint = "Up to 10 files, 100MB total limit",
  accept,
  disabled = false,
  onFilesSelected,
  ...props
}: FileUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounterRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (fileList: FileList) => {
      if (disabled) return
      onFilesSelected?.(Array.from(fileList))
    },
    [disabled, onFilesSelected],
  )

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current += 1
      if (!disabled && e.dataTransfer.types.includes("Files")) {
        setIsDragOver(true)
      }
    },
    [disabled],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current -= 1
    if (dragCounterRef.current === 0) setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current = 0
      setIsDragOver(false)
      if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files)
        e.target.value = ""
      }
    },
    [handleFiles],
  )

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [disabled],
  )

  return (
    <div
      data-slot="file-upload-area"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-8 transition-colors",
        "border-border bg-card",
        isDragOver && !disabled && "border-primary/50 bg-muted",
        disabled && "pointer-events-none cursor-not-allowed opacity-40",
        className,
      )}
      {...props}
    >
      <CloudUpload
        className={cn(
          "size-10 stroke-[1.25]",
          disabled ? "text-muted-foreground/35" : "text-muted-foreground",
        )}
        aria-hidden
      />

      <div className="flex flex-col items-center gap-1 text-center">
        <p
          className={cn(
            "text-sm font-medium leading-5",
            disabled ? "text-muted-foreground/40" : "text-foreground",
          )}
        >
          Drop your files here, or{" "}
          <span
            className={cn(
              disabled ? "text-muted-foreground/40" : "text-primary",
            )}
          >
            click to browse
          </span>
        </p>
        <p
          className={cn(
            "text-xs leading-4",
            disabled ? "text-muted-foreground/40" : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
    </div>
  )
}

export { FileUploadArea }
export type { FileUploadAreaProps }
