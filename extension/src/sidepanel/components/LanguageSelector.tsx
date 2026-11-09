// extension/src/sidepanel/components/LanguageSelector.tsx: Apple-styled frosted dropdown for interaction language
import React from 'react';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../languages';

interface LanguageSelectorProps {
  selectedCode: string;
  onSelectLanguage: (lang: LanguageOption) => void;
  disabled?: boolean;
  label?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedCode,
  onSelectLanguage,
  disabled = false,
  label = 'Language:',
}) => {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-1.5 shrink-0 text-slate-600 font-medium">
        <svg
          className="w-3.5 h-3.5 text-indigo-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-[11px] font-semibold text-slate-700 tracking-tight">{label}</span>
      </div>

      <div className="relative flex-1 max-w-[210px]">
        <select
          id="lang-select"
          value={selectedCode}
          disabled={disabled}
          onChange={(e) => {
            const match = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
            if (match) onSelectLanguage(match);
          }}
          className="w-full appearance-none bg-white/80 hover:bg-white text-slate-800 text-[11px] font-medium border border-slate-200/80 rounded-xl pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeLabel}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
