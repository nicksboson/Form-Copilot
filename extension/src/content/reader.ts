// extension/src/content/reader.ts: Coordinator for form scanning, overlay display, scroll, and snapshot validation

import { FormSnapshot, FormSnapshotSchema } from 'form-copilot-shared';
import { extractEmbeddedScriptData, parseEmbeddedFormSnapshot } from './embedded';
import { scanDomPartialSnapshot, observePageChanges } from './dom-scan';
import { smoothScrollScan } from './scroll';
import { createScanOverlay, ScanOverlay } from './overlay';

let pageChangeCleanup: (() => void) | null = null;

export async function readGoogleForm(
  onPageUpdate?: (snapshot: FormSnapshot) => void
): Promise<FormSnapshot> {
  let overlay: ScanOverlay | null = null;

  try {
    overlay = createScanOverlay();
    overlay.updateProgress(5, 'फ़ॉर्म की जांच की जा रही है...');

    // 1. Scroll top to bottom in 80% viewport steps to trigger lazy-loaded questions
    await smoothScrollScan((progress) => {
      if (overlay) {
        overlay.updateProgress(10 + Math.floor(progress * 0.7), 'फ़ॉर्म पढ़ा जा रहा है...');
      }
    });

    if (overlay) {
      overlay.updateProgress(85, 'प्रश्नों का विश्लेषण किया जा रहा है...');
    }

    let snapshot: FormSnapshot | null = null;

    // 2. Try FULL mode via embedded script FB_PUBLIC_LOAD_DATA_
    try {
      const rawData = extractEmbeddedScriptData(document);
      if (rawData) {
        snapshot = parseEmbeddedFormSnapshot(rawData);
      }
    } catch (embeddedErr) {
      console.warn('Embedded data parse failed, falling back to PARTIAL mode:', embeddedErr);
    }

    // 3. Fallback to PARTIAL mode if FULL mode failed or returned no questions
    if (!snapshot || snapshot.pages.every((p) => p.questions.length === 0)) {
      snapshot = scanDomPartialSnapshot();

      // Setup mutation observer for user navigating between pages
      if (pageChangeCleanup) {
        pageChangeCleanup();
      }
      pageChangeCleanup = observePageChanges((newPage) => {
        if (!snapshot) return;
        // Merge or replace page in snapshot without duplicates
        const existingIdx = snapshot.pages.findIndex((p) => p.index === newPage.index);
        let updatedPages = [...snapshot.pages];
        if (existingIdx >= 0) {
          updatedPages[existingIdx] = newPage;
        } else {
          updatedPages.push(newPage);
          updatedPages.sort((a, b) => a.index - b.index);
        }
        const updatedSnapshot: FormSnapshot = {
          ...snapshot,
          pages: updatedPages,
          scannedAt: new Date().toISOString(),
        };
        snapshot = updatedSnapshot;
        if (onPageUpdate) {
          onPageUpdate(updatedSnapshot);
        }
      });
    }

    // 4. Validate snapshot against Zod schema
    const validated = FormSnapshotSchema.parse(snapshot);

    if (overlay) {
      overlay.updateProgress(100, 'पूर्ण हुआ!');
    }

    return validated;
  } finally {
    // Hard rule: Always remove overlay in finally
    if (overlay) {
      overlay.remove();
    }
  }
}

export function cleanupReader(): void {
  if (pageChangeCleanup) {
    pageChangeCleanup();
    pageChangeCleanup = null;
  }
}
