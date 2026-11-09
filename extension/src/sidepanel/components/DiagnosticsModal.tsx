// extension/src/sidepanel/components/DiagnosticsModal.tsx: Apple glassmorphic diagnostics inspector
import React from 'react';
import { Diagnostics } from 'form-copilot-shared';

interface DiagnosticsModalProps {
  diagnostics: Diagnostics | null;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ diagnostics, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/35 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-white/80 text-xs animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200/50 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Diagnostics
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

        {diagnostics ? (
          <div className="space-y-2.5 text-slate-700">
            <div className="flex justify-between items-center bg-white/70 p-2 rounded-xl border border-slate-200/60">
              <span className="font-semibold text-slate-800">Scan Mode:</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200/60">
                {diagnostics.mode}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white/70 p-2 rounded-xl border border-slate-200/60">
              <span className="font-semibold text-slate-800">Pages Found:</span>
              <span className="font-mono font-bold text-slate-900">{diagnostics.pagesFound}</span>
            </div>

            <div className="flex justify-between items-center bg-white/70 p-2 rounded-xl border border-slate-200/60">
              <span className="font-semibold text-slate-800">Questions Found:</span>
              <span className="font-mono font-bold text-slate-900">{diagnostics.questionsFound}</span>
            </div>

            <div className="bg-white/70 p-2.5 rounded-xl border border-slate-200/60">
              <span className="font-semibold text-slate-800 block mb-1">Warnings:</span>
              {diagnostics.warnings.length > 0 ? (
                <ul className="space-y-1 text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200 text-[11px]">
                  {diagnostics.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-400 text-[11px]">None</span>
              )}
            </div>

            <div className="bg-white/70 p-2.5 rounded-xl border border-slate-200/60">
              <span className="font-semibold text-slate-800 block mb-1">Last Error:</span>
              {diagnostics.lastError ? (
                <p className="text-rose-700 bg-rose-50/80 p-2 rounded-lg border border-rose-200 break-words font-mono text-[10px]">
                  {diagnostics.lastError}
                </p>
              ) : (
                <span className="text-slate-400 text-[11px]">None</span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-slate-500 py-3 text-center">No diagnostic data available</p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
