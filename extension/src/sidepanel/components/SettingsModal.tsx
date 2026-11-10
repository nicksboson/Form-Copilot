// extension/src/sidepanel/components/SettingsModal.tsx: Apple glassmorphic settings modal with backend & API test
import React, { useState } from 'react';
import { setBackendUrl, checkBackendHealth, HealthCheckResult } from '../../settings';

interface SettingsModalProps {
  currentUrl: string;
  onClose: () => void;
  onSaved: (newUrl: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ currentUrl, onClose, onSaved }) => {
  const [url, setUrl] = useState(currentUrl);
  const [isChecking, setIsChecking] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await setBackendUrl(url);
    onSaved(url);
    onClose();
  };

  const handleTestConnection = async () => {
    setIsChecking(true);
    setHealthResult(null);
    try {
      const result = await checkBackendHealth(url);
      setHealthResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setHealthResult({ ok: false, error: message });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/35 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-white/80 text-xs animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200/50 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Settings & API Status
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm transition"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div className="bg-white/70 p-3 rounded-xl border border-slate-200/60 space-y-2">
            <label className="font-semibold text-slate-800 block text-xs">
              Backend Server URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://form-copilot.onrender.com"
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-mono text-[11px] bg-white"
                required
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isChecking}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg font-medium text-[11px] border border-slate-200 transition whitespace-nowrap disabled:opacity-50"
              >
                {isChecking ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              API keys are secured in backend/.env to prevent frontend leaks.
            </p>
          </div>

          {healthResult && (
            <div
              className={`p-3 rounded-xl border space-y-1.5 animate-in fade-in duration-150 ${
                healthResult.ok
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span>Backend Connection</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    healthResult.ok
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {healthResult.ok ? 'Online' : 'Offline'}
                </span>
              </div>

              {healthResult.ok && healthResult.configured ? (
                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Groq LLM API:</span>
                    <span
                      className={`font-semibold ${
                        healthResult.configured.groq ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {healthResult.configured.groq ? 'Configured' : 'Missing in .env'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Gnani Voice API:</span>
                    <span
                      className={`font-semibold ${
                        healthResult.configured.gnani ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {healthResult.configured.gnani ? 'Configured' : 'Missing in .env'}
                    </span>
                  </div>
                </div>
              ) : healthResult.error ? (
                <p className="text-[10px] font-mono text-rose-700 break-words pt-1">
                  {healthResult.error}
                </p>
              ) : null}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold shadow-xs transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition active:scale-95"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
