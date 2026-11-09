// extension/src/settings/index.ts: Settings management and backend health verification

const STORAGE_KEY_BACKEND_URL = 'form_copilot_backend_url';
export const DEFAULT_BACKEND_URL = 'http://localhost:3001';

export interface BackendHealthResponse {
  status: string;
  timestamp: string;
  service: string;
  configured?: {
    groq: boolean;
    gnani: boolean;
  };
}

export interface HealthCheckResult {
  ok: boolean;
  error?: string;
  configured?: {
    groq: boolean;
    gnani: boolean;
  };
}

export async function getBackendUrl(): Promise<string> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const result = await chrome.storage.local.get([STORAGE_KEY_BACKEND_URL]);
    return result[STORAGE_KEY_BACKEND_URL] || DEFAULT_BACKEND_URL;
  }
  return DEFAULT_BACKEND_URL;
}

export async function setBackendUrl(url: string): Promise<void> {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ [STORAGE_KEY_BACKEND_URL]: cleanUrl });
  }
}

export async function checkBackendHealth(targetUrl?: string): Promise<HealthCheckResult> {
  const base = (targetUrl || (await getBackendUrl())).replace(/\/+$/, '');
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${base}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    const data = (await res.json()) as BackendHealthResponse;
    return {
      ok: true,
      configured: data.configured,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
