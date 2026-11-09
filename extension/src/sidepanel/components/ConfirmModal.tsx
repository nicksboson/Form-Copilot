// extension/src/sidepanel/components/ConfirmModal.tsx: Apple glassmorphic confirmation modal
import React from 'react';
import { ConversationOption } from 'form-copilot-shared';

interface ConfirmModalProps {
  questionTitle: string;
  option: ConversationOption;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  questionTitle,
  option,
  onConfirm,
  onCancel,
  isSubmitting = false,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/35 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-white/80 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2 mb-2 text-slate-900">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold tracking-tight">
            Confirm Field Fill
          </h3>
        </div>

        <div className="bg-white/80 border border-slate-200/60 rounded-xl p-3 my-3 text-xs text-slate-800 space-y-1 shadow-xs">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            Question
          </p>
          <p className="font-semibold text-slate-900 text-xs">
            {questionTitle}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold pt-1">
            Value to fill
          </p>
          <p className="font-bold text-indigo-950 text-xs">
            &quot;{option.en}&quot;
          </p>
          {option.hi && (
            <p className="text-[11px] text-slate-500 font-medium">
              Meaning: {option.hi}
            </p>
          )}
        </div>

        <p className="text-xs text-slate-600 mb-4 font-medium">
          Do you want to write this answer into the form field?
        </p>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? 'Filling...' : 'Confirm & Fill'}
          </button>
        </div>
      </div>
    </div>
  );
};
