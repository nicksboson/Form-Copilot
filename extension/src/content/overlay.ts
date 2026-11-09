// extension/src/content/overlay.ts: In-page Hindi scanning progress overlay

const OVERLAY_ID = 'form-copilot-scan-overlay';

export interface ScanOverlay {
  updateProgress: (percent: number, message?: string) => void;
  remove: () => void;
}

export function createScanOverlay(): ScanOverlay {
  // Remove any pre-existing overlay
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) {
    existing.remove();
  }

  const container = document.createElement('div');
  container.id = OVERLAY_ID;
  container.setAttribute(
    'style',
    `
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 2147483647;
    background: #ffffff;
    color: #202124;
    border: 1px solid #dadce0;
    border-radius: 8px;
    padding: 16px 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: Roboto, Arial, sans-serif;
    font-size: 14px;
    min-width: 260px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `
  );

  const titleRow = document.createElement('div');
  titleRow.setAttribute('style', 'display: flex; align-items: center; justify-content: space-between;');

  const titleText = document.createElement('span');
  titleText.textContent = 'फ़ॉर्म पढ़ा जा रहा है...';
  titleText.setAttribute('style', 'font-weight: 600; color: #1a73e8;');

  const percentText = document.createElement('span');
  percentText.id = `${OVERLAY_ID}-percent`;
  percentText.textContent = '0%';
  percentText.setAttribute('style', 'font-size: 13px; color: #5f6368;');

  titleRow.appendChild(titleText);
  titleRow.appendChild(percentText);

  const progressBarTrack = document.createElement('div');
  progressBarTrack.setAttribute(
    'style',
    'width: 100%; height: 6px; background: #e8eaed; border-radius: 3px; overflow: hidden;'
  );

  const progressBar = document.createElement('div');
  progressBar.id = `${OVERLAY_ID}-bar`;
  progressBar.setAttribute(
    'style',
    'width: 0%; height: 100%; background: #1a73e8; transition: width 0.15s ease;'
  );
  progressBarTrack.appendChild(progressBar);

  const statusText = document.createElement('div');
  statusText.id = `${OVERLAY_ID}-status`;
  statusText.textContent = 'कृपया प्रतीक्षा करें...';
  statusText.setAttribute('style', 'font-size: 12px; color: #70757a;');

  container.appendChild(titleRow);
  container.appendChild(progressBarTrack);
  container.appendChild(statusText);

  document.body.appendChild(container);

  return {
    updateProgress: (percent: number, msg?: string) => {
      const bar = document.getElementById(`${OVERLAY_ID}-bar`);
      const pct = document.getElementById(`${OVERLAY_ID}-percent`);
      const status = document.getElementById(`${OVERLAY_ID}-status`);
      if (bar) bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
      if (pct) pct.textContent = `${Math.round(percent)}%`;
      if (status && msg) status.textContent = msg;
    },
    remove: () => {
      const el = document.getElementById(OVERLAY_ID);
      if (el) {
        el.remove();
      }
    },
  };
}
