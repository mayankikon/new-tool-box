/**
 * Plays `public/media/audio/card_button.mp3` (add the file locally; path is `/media/audio/card_button.mp3`).
 * Used for radio / segmented clicks in the design playground.
 */
let cardButtonAudio: HTMLAudioElement | null = null;

export function playCardButtonSound(): void {
  if (typeof window === "undefined") return;
  try {
    if (!cardButtonAudio) {
      cardButtonAudio = new Audio("/media/audio/card_button.mp3");
      cardButtonAudio.preload = "auto";
      cardButtonAudio.volume = 0.45;
    }
    cardButtonAudio.currentTime = 0;
    void cardButtonAudio.play().catch(() => {
      /* Missing file, autoplay policy, or decode error — ignore */
    });
  } catch {
    /* ignore */
  }
}
