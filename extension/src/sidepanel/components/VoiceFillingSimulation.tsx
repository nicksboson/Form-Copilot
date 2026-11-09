// extension/src/sidepanel/components/VoiceFillingSimulation.tsx: Multilingual realtime voice-guided form filling simulation
import React from 'react';
import { Question, ConversationOption } from 'form-copilot-shared';
import { UIStrings, getUIStrings } from '../i18n';

export type VoiceSimulationStatus =
  | 'idle'
  | 'speaking'
  | 'listening'
  | 'processing'
  | 'options_pending'
  | 'manual_pending'
  | 'filling'
  | 'completed';

interface VoiceFillingSimulationProps {
  isActive: boolean;
  mode: 'greeting_qa' | 'form_filling';
  languageName: string;
  onStop: () => void;
  questions: Question[];
  currentQuestionIndex: number;
  status: VoiceSimulationStatus;
  statusMessage: string;
  transcript: string | null;
  pendingOptions: ConversationOption[];
  onSelectOption: (option: ConversationOption) => void;
  onDoneSpeaking: () => void;
  onSkipQuestion: () => void;
  onRetryQuestion: () => void;
  onStartFormFilling: () => void;
  onManualDone: () => void;
  onStartListeningManually?: () => void;
  uiStrings?: UIStrings;
}

export const VoiceFillingSimulation: React.FC<VoiceFillingSimulationProps> = ({
  isActive,
  mode,
  languageName,
  onStop,
  questions,
  currentQuestionIndex,
  status,
  statusMessage,
  transcript,
  pendingOptions,
  onSelectOption,
  onDoneSpeaking,
  onSkipQuestion,
  onRetryQuestion,
  onStartFormFilling,
  onManualDone,
  onStartListeningManually,
  uiStrings,
}) => {
  if (!isActive) return null;

  const ui = uiStrings || getUIStrings('en-IN');
  const currentQ = questions[currentQuestionIndex] || null;
  const totalQuestions = questions.length;
  const progressPercent =
    totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-md border border-indigo-200/70 space-y-3.5 mb-3">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-indigo-100/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider">
            {mode === 'greeting_qa'
              ? ui.voiceSimHeaderQA(languageName)
              : ui.voiceSimHeaderFilling(languageName)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'form_filling' && (
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full font-mono">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          )}
          <button
            type="button"
            onClick={onStop}
            className="text-[11px] font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-0.5 rounded-lg border border-slate-200/80 transition-all active:scale-95"
          >
            {ui.exitBtn}
          </button>
        </div>
      </div>

      {/* Progress Bar (Visible in form_filling mode) */}
      {mode === 'form_filling' && (
        <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-600 h-1.5 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Greeting Q&A Mode Prompt & Transition Button */}
      {mode === 'greeting_qa' && (
        <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-indigo-100 text-center space-y-2.5 shadow-xs">
          <div className="text-xs font-bold text-slate-900 leading-snug">
            {ui.qaPromptTitle}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {ui.qaPromptDesc}
          </p>
          <button
            type="button"
            onClick={onStartFormFilling}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            {ui.startFillingBtn}
          </button>
        </div>
      )}

      {/* Current Question Display (Form Filling Mode) */}
      {mode === 'form_filling' && currentQ && status !== 'completed' && (
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-xl border border-indigo-100/80 shadow-xs">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-indigo-900">
              {ui.questionNumber(currentQuestionIndex + 1)}
            </span>
            {currentQ.required && (
              <span className="text-rose-600 font-semibold text-[10px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
                {ui.requiredBadge}
              </span>
            )}
          </div>
          <div className="text-xs font-bold text-slate-900 leading-snug">{currentQ.title}</div>
        </div>
      )}

      {/* State Indicators and Prompts */}
      <div className="p-4 rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-2.5 shadow-xs">
        {status === 'speaking' && (
          <>
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full animate-bounce" />
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-3 bg-violet-400 rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
            <div className="text-xs font-bold text-slate-900">
              {ui.agentSpeaking}
            </div>
            <p className="text-[11px] text-slate-600 font-medium max-h-24 overflow-y-auto leading-relaxed">
              {statusMessage}
            </p>
            {onStartListeningManually && (
              <button
                type="button"
                onClick={onStartListeningManually}
                className="mt-1 text-[11px] text-indigo-700 font-semibold hover:text-indigo-900 underline"
              >
                {ui.speakNowLink}
              </button>
            )}
          </>
        )}

        {status === 'listening' && (
          <>
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white animate-voice-aura-red flex items-center justify-center shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="text-xs font-bold text-rose-700">
              {ui.listeningTitle}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {mode === 'greeting_qa'
                ? ui.listeningDescQA
                : ui.listeningDescFilling}
            </p>
            <button
              type="button"
              onClick={onDoneSpeaking}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              {ui.doneSpeakingBtn}
            </button>
          </>
        )}

        {status === 'processing' && (
          <>
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs font-semibold text-slate-800">
              {ui.processingSpeech}
            </div>
            {transcript && (
              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200/60 max-w-full truncate">
                {ui.recognizedText} &quot;{transcript}&quot;
              </p>
            )}
          </>
        )}

        {status === 'manual_pending' && (
          <div className="space-y-2.5 py-1 w-full">
            <div className="bg-amber-50/90 border border-amber-200/80 p-3 rounded-xl text-left">
              <div className="text-xs font-bold text-amber-950 mb-1">
                {ui.manualSelfSelectTitle}
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                {statusMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={onManualDone}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              {ui.manualDoneBtn}
            </button>
            <p className="text-[10px] text-slate-500">
              {ui.manualDoneHint}
            </p>
          </div>
        )}

        {status === 'filling' && (
          <>
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs font-bold text-emerald-800">
              {ui.fillingFieldStatus}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">{statusMessage}</p>
          </>
        )}

        {status === 'completed' && (
          <div className="py-3 text-center space-y-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-xs font-bold text-emerald-800">
              {ui.allCompletedTitle}
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              {ui.allCompletedDesc}
            </p>
            <button
              type="button"
              onClick={onStop}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              {ui.finishVoiceBtn}
            </button>
          </div>
        )}
      </div>

      {/* Big Data Options Selector */}
      {status === 'options_pending' && pendingOptions.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold text-slate-900 tracking-tight">
            {ui.bigDataOptionsTitle}
          </div>
          <div className="space-y-2">
            {pendingOptions.map((opt, idx) => (
              <div
                key={idx}
                className="bg-white/90 p-3 rounded-xl border border-indigo-200/80 hover:border-indigo-400 hover:bg-white transition-all shadow-xs text-left"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mb-1">
                      {`Option ${idx + 1}`}
                    </span>
                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      {opt.en}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 font-medium leading-relaxed">
                      {opt.hi}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectOption(opt)}
                    className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold transition-all shadow-xs active:scale-95"
                  >
                    {ui.fillThisOptionBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions Bar (Form Filling Mode) */}
      {mode === 'form_filling' && status !== 'completed' && (
        <div className="flex justify-between items-center pt-1 text-[11px]">
          <button
            type="button"
            onClick={onRetryQuestion}
            className="text-slate-500 hover:text-indigo-700 font-medium transition"
          >
            {ui.retryBtnLabel}
          </button>
          <button
            type="button"
            onClick={onSkipQuestion}
            className="text-slate-500 hover:text-indigo-700 font-medium transition"
          >
            {ui.skipNextBtnLabel}
          </button>
        </div>
      )}
    </div>
  );
};
