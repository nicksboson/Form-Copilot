// extension/src/sidepanel/components/QuestionNav.tsx: Apple-styled question navigator pill strip
import React from 'react';
import { Question } from 'form-copilot-shared';

interface QuestionNavProps {
  questions: Question[];
  activeQuestionId: string | null;
  onSelectQuestion: (question: Question) => void;
  title?: string;
  totalCountText?: string;
  prefix?: string;
}

export const QuestionNav: React.FC<QuestionNavProps> = ({
  questions,
  activeQuestionId,
  onSelectQuestion,
  title = 'Form Questions (click to select):',
  totalCountText,
  prefix = 'Q',
}) => {
  if (questions.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-3 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-800 tracking-tight">
          {title}
        </span>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-full border border-slate-200/50">
          {totalCountText || `${questions.length}`}
        </span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-smooth">
        {questions.map((q, idx) => {
          const isActive = q.id === activeQuestionId;
          return (
            <button
              key={q.id || idx}
              type="button"
              onClick={() => onSelectQuestion(q)}
              className={`px-3 py-1.5 rounded-xl text-[11px] whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 shrink-0 active:scale-95 ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold shadow-sm ring-2 ring-indigo-500/20'
                  : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/70 hover:border-slate-300 shadow-xs'
              }`}
            >
              <span className={isActive ? 'text-indigo-300 font-mono text-[10px]' : 'text-slate-400 font-mono text-[10px]'}>
                {`${prefix}${idx + 1}`}
              </span>
              <span className="max-w-[130px] truncate">{q.title}</span>
              {q.required && (
                <span className={isActive ? 'text-amber-300 font-bold' : 'text-rose-500 font-bold'}>
                  *
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
