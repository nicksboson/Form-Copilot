// extension/src/sidepanel/components/SummaryCard.tsx: Apple glassmorphic form summary overview
import React from 'react';
import { FormSummary } from 'form-copilot-shared';
import { UIStrings, getUIStrings } from '../i18n';

interface SummaryCardProps {
  summary: FormSummary;
  uiStrings?: UIStrings;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, uiStrings }) => {
  const ui = uiStrings || getUIStrings('en-IN');

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-sm mb-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-slate-200/50">
        <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          {ui.summaryCardTitle}
        </h2>
      </div>

      <div className="space-y-3 text-xs text-slate-700">
        {/* Purpose */}
        <div className="bg-white/60 rounded-xl p-3 border border-slate-200/50">
          <span className="font-semibold text-slate-800 block text-[10px] uppercase tracking-wider text-indigo-700 mb-1">
            {ui.summaryPurposeLabel}
          </span>
          <p className="text-slate-800 leading-relaxed font-medium">{summary.purpose}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/60 rounded-xl p-2.5 border border-slate-200/50">
            <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wider">
              {ui.summaryTotalPagesLabel}
            </span>
            <p className="mt-0.5 text-base font-bold text-slate-900 font-mono">{summary.pageCount}</p>
          </div>

          <div className="bg-white/60 rounded-xl p-2.5 border border-slate-200/50">
            <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wider">
              {ui.summaryBranchingLabel}
            </span>
            <p className="mt-0.5 text-xs font-medium text-slate-800 truncate">
              {summary.branching || 'None'}
            </p>
          </div>
        </div>

        {/* Required Questions */}
        {summary.requiredQuestions && summary.requiredQuestions.length > 0 && (
          <div className="bg-white/60 rounded-xl p-3 border border-slate-200/50">
            <span className="font-semibold text-slate-800 block text-[10px] uppercase tracking-wider text-indigo-700 mb-1.5">
              {ui.summaryRequiredQuestionsLabel(summary.requiredQuestions.length)}
            </span>
            <ul className="space-y-1 text-slate-700">
              {summary.requiredQuestions.map((q, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Required Documents */}
        {summary.requiredDocuments && summary.requiredDocuments.length > 0 && (
          <div className="bg-white/60 rounded-xl p-3 border border-slate-200/50">
            <span className="font-semibold text-slate-800 block text-[10px] uppercase tracking-wider text-indigo-700 mb-1.5">
              {ui.summaryRequiredDocsLabel}
            </span>
            <ul className="space-y-1 text-slate-700">
              {summary.requiredDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Overview Banner */}
        {summary.overviewHi && (
          <div className="bg-gradient-to-r from-indigo-50/80 to-violet-50/80 border border-indigo-100 rounded-xl p-3 text-[11px] text-indigo-950 font-medium leading-relaxed">
            {summary.overviewHi}
          </div>
        )}
      </div>
    </div>
  );
};
