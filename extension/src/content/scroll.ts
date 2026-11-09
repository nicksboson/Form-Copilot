// extension/src/content/scroll.ts: Smooth scrolling through Google Form in 80% viewport steps with height stability check

const MAX_SCROLL_ROUNDS = 200;
const STEP_RATIO = 0.8;
const SETTLE_DELAY_MS = 80;

export async function smoothScrollScan(
  onProgress?: (progressPercent: number) => void
): Promise<void> {
  const initialScrollY = window.scrollY;
  const viewportHeight = window.innerHeight || 800;
  const step = Math.max(200, Math.floor(viewportHeight * STEP_RATIO));

  let stableHeightCount = 0;
  let lastHeight = document.documentElement.scrollHeight;
  let rounds = 0;

  try {
    // Scroll top to bottom in steps
    while (rounds < MAX_SCROLL_ROUNDS) {
      const currentScrollY = window.scrollY;
      const currentHeight = document.documentElement.scrollHeight;
      const maxScroll = Math.max(0, currentHeight - viewportHeight);

      if (currentScrollY >= maxScroll - 10) {
        // Reached bottom, check if height is stable
        if (currentHeight === lastHeight) {
          stableHeightCount++;
          if (stableHeightCount >= 3) {
            break; // Height stable for 3 checks, completed bottom
          }
        } else {
          stableHeightCount = 0;
          lastHeight = currentHeight;
        }
      } else {
        stableHeightCount = 0;
        lastHeight = currentHeight;
      }

      window.scrollBy({ top: step, behavior: 'instant' });
      rounds++;

      const progress = maxScroll > 0 ? Math.min(100, Math.round((window.scrollY / maxScroll) * 100)) : 100;
      if (onProgress) {
        onProgress(progress);
      }

      await new Promise((resolve) => setTimeout(resolve, SETTLE_DELAY_MS));
    }
  } finally {
    // Restore original scroll position
    window.scrollTo({ top: initialScrollY, behavior: 'instant' });
  }
}
