import { GIFEncoder, quantize, applyPalette } from "gifenc";

const GIF_DURATION_MS = 3000;
const GIF_FPS = 10;
const MAX_GIF_WIDTH = 320;

/**
 * Generates a ~3 second animated GIF from a video URL (blob or object URL).
 * Requests permission/decoding; runs in main thread. For long videos, only
 * the first 3 seconds are used.
 */
export async function videoToGifBlob(videoUrl: string): Promise<Blob> {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.playsInline = true;

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("Failed to load video"));
    video.src = videoUrl;
    video.load();
  });

  const durationSec = Math.min(video.duration, GIF_DURATION_MS / 1000);
  const width = Math.min(video.videoWidth, MAX_GIF_WIDTH);
  const height = Math.round(
    (video.videoHeight / video.videoWidth) * width,
  );
  const frameCount = Math.max(2, Math.floor(durationSec * GIF_FPS));
  const delayMs = Math.round((durationSec * 1000) / frameCount);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2d not available");

  const gif = GIFEncoder();

  for (let i = 0; i < frameCount; i++) {
    const t = (i / (frameCount - 1)) * (durationSec - 0.01);
    await seekVideo(video, t);
    ctx.drawImage(video, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, width, height, {
      palette,
      delay: i === 0 ? delayMs : delayMs,
    });
  }

  gif.finish();
  const bytes = gif.bytes();
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return new Blob([copy], { type: "image/gif" });
}

function seekVideo(video: HTMLVideoElement, timeSec: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      reject(new Error("Video seek failed"));
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.currentTime = timeSec;
  });
}
