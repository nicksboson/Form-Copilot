// extension/src/sidepanel/components/ChatView.tsx: Chat interface with voice recording, TTS playback, and option cards

import React, { useState, useRef } from 'react';
import { ConversationReply, ConversationOption } from 'form-copilot-shared';
import { WavRecorder } from '../wav-recorder';
import { UIStrings, getUIStrings } from '../i18n';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  replyData?: ConversationReply;
  timestamp: string;
}

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onSelectOption: (option: ConversationOption, questionId: string | null) => void;
  pendingConfirm?: {
    option: ConversationOption;
    questionId: string;
    questionTitle: string;
  } | null;
  onConfirmFill?: () => void;
  onCancelConfirm?: () => void;
  isSubmittingFill?: boolean;
  activeQuestionTitle?: string | null;
  onNextQuestion?: () => void;
  backendUrl: string;
  isProcessing: boolean;
  voiceNote: string | null;
  uiStrings?: UIStrings;
  selectedLanguageCode?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onSelectOption,
  pendingConfirm,
  onConfirmFill,
  onCancelConfirm,
  isSubmittingFill = false,
  activeQuestionTitle,
  onNextQuestion,
  backendUrl,
  isProcessing,
  voiceNote,
  uiStrings,
  selectedLanguageCode = 'en-IN',
}) => {
  const ui = uiStrings || getUIStrings('en-IN');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [sttPendingReview, setSttPendingReview] = useState<string | null>(null);

  const wavRecorderRef = useRef<WavRecorder | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Handle Voice Input (STT) with genuine 16kHz mono PCM WAV
  const startRecording = async () => {
    setSttError(null);
    try {
      const recorder = new WavRecorder();
      await recorder.start();
      wavRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err: unknown) {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: chrome.runtime.getURL('permission.html') });
      }
    }
  };

  const stopRecording = async () => {
    if (wavRecorderRef.current && isRecording) {
      setIsRecording(false);
      setIsTranscribing(true);
      setSttError(null);

      try {
        const audioBlob = wavRecorderRef.current.stop();
        wavRecorderRef.current = null;

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        formData.append('languageCode', selectedLanguageCode || 'en-IN');

        const res = await fetch(`${backendUrl}/api/stt`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || `STT request failed with status ${res.status}`);
        }

        const data = await res.json();
        if (data.transcript && data.transcript.trim()) {
          setSttPendingReview(data.transcript);
          setInputText(data.transcript);
        } else {
          setSttError('कोई आवाज नहीं पहचानी गई (No speech detected)। कृपया पुनः बोलें।');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setSttError(`ट्रांसक्राइब करने में त्रुटि: ${msg}`);
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  // Handle Speech Output (TTS)
  const speakText = async (textToSpeak: string) => {
    try {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }

      setIsPlayingAudio(true);
      const res = await fetch(`${backendUrl}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language: selectedLanguageCode || 'en-IN',
        }),
      });

      if (!res.ok) throw new Error('TTS synthesis failed');
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.error('TTS playback error:', err);
      setIsPlayingAudio(false);
    }
  };

  const stopAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    const textToSend = inputText.trim();
    setInputText('');
    setSttPendingReview(null);
    await onSendMessage(textToSend);
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-[510px] shadow-sm border border-white/80 overflow-hidden mb-3">
      {voiceNote && (
        <div className="bg-amber-50/90 border-b border-amber-200/70 px-3.5 py-1.5 text-[11px] text-amber-900 font-medium">
          {voiceNote}
        </div>
      )}

      {/* Active Question Bar */}
      {activeQuestionTitle && (
        <div className="bg-gradient-to-r from-indigo-50/80 via-white/60 to-violet-50/80 backdrop-blur-md border-b border-indigo-100/70 px-3.5 py-2 flex justify-between items-center text-[11px]">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-900 shrink-0">{ui.activeQuestionPrefix}</span>
            <span className="text-slate-700 font-medium truncate">{activeQuestionTitle}</span>
          </div>
          {onNextQuestion && (
            <button
              type="button"
              onClick={onNextQuestion}
              className="text-[10px] font-semibold text-indigo-700 hover:text-indigo-900 bg-white/90 hover:bg-white px-2.5 py-1 rounded-lg border border-indigo-200/80 shadow-xs shrink-0 transition-all active:scale-95"
            >
              {ui.nextBtn}
            </button>
          )}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`rounded-2xl p-3 text-xs leading-relaxed transition-all shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-xs max-w-[84%]'
                  : 'glass-panel text-slate-800 border border-slate-200/60 rounded-bl-xs max-w-[88%]'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Assistant TTS Speak / Stop Button */}
              {msg.sender === 'assistant' && (
                <div className="mt-2.5 pt-1.5 border-t border-slate-200/50 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speakText(msg.text)}
                    disabled={isPlayingAudio}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100 px-2.5 py-0.5 rounded-full transition disabled:opacity-40"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                    </svg>
                    <span>{ui.speakBtn}</span>
                  </button>
                  {isPlayingAudio && (
                    <button
                      type="button"
                      onClick={stopAudio}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full transition"
                    >
                      <span>{ui.stopAudioBtn}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Structured Option Cards (At most 3) */}
            {msg.replyData && msg.replyData.options && msg.replyData.options.length > 0 && (
              <div className="mt-2 w-[92%] space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                  {ui.suggestedAnswersTitle}
                </span>
                {msg.replyData.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="w-full text-left p-2.5 rounded-xl border border-indigo-200/80 bg-white/90 hover:bg-white hover:border-indigo-400 shadow-xs transition-all text-xs flex justify-between items-center gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {opt.en}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {opt.hi}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectOption(opt, msg.replyData?.questionId || null)}
                      className="text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg shadow-xs shrink-0 transition-all active:scale-95"
                    >
                      {ui.selectOptionBtn}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Inline Confirmation Card */}
        {pendingConfirm && (
          <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-300/80 rounded-2xl text-xs space-y-2 my-2 shadow-xs">
            <div className="font-bold text-amber-950">
              {ui.confirmTitle(pendingConfirm.questionTitle, pendingConfirm.option.en)}
            </div>
            <div className="text-[11px] text-amber-900/90 font-medium">
              {ui.meaningLabel} {pendingConfirm.option.hi}
            </div>
            <div className="flex gap-2 justify-end pt-1">
              {onCancelConfirm && (
                <button
                  type="button"
                  onClick={onCancelConfirm}
                  disabled={isSubmittingFill}
                  className="px-3 py-1.5 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs transition"
                >
                  {ui.cancelBtn}
                </button>
              )}
              {onConfirmFill && (
                <button
                  type="button"
                  onClick={onConfirmFill}
                  disabled={isSubmittingFill}
                  className="px-3.5 py-1.5 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-50 active:scale-95"
                >
                  {isSubmittingFill ? ui.fillingStatus : ui.confirmFillBtn}
                </button>
              )}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-start">
            <div className="glass-panel text-slate-500 rounded-2xl px-3 py-2 text-xs italic flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>{ui.thinkingStatus}</span>
            </div>
          </div>
        )}
      </div>

      {/* STT Error Notification */}
      {sttError && (
        <div className="bg-rose-50/90 border-t border-rose-200/80 px-3.5 py-1.5 text-[11px] text-rose-800 font-medium flex justify-between items-center">
          <span>{sttError}</span>
          <button
            type="button"
            onClick={() => setSttError(null)}
            className="text-rose-700 font-bold ml-2 hover:text-rose-900 text-sm"
          >
            &times;
          </button>
        </div>
      )}

      {/* Voice Review Notification */}
      {sttPendingReview && (
        <div className="bg-blue-50/90 border-t border-blue-200/80 px-3.5 py-1.5 text-[11px] text-blue-900 font-medium flex justify-between items-center">
          <span>{ui.speechRecognizedNote}</span>
          <button
            type="button"
            onClick={() => setSttPendingReview(null)}
            className="text-blue-700 font-bold ml-2 text-sm"
          >
            &times;
          </button>
        </div>
      )}

      {/* Quick Suggestion Chips */}
      <div className="px-3 py-2 bg-slate-50/80 border-t border-slate-200/50 flex gap-1.5 overflow-x-auto text-[11px] scroll-smooth">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 py-1">
          {ui.chipsLabel}
        </span>
        {ui.chipQuestions.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isProcessing}
            onClick={() => onSendMessage(chip)}
            className="px-2.5 py-1 glass-pill rounded-full text-slate-700 hover:text-indigo-700 hover:border-indigo-300 whitespace-nowrap shrink-0 transition-all active:scale-95 text-[11px] font-medium"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Floating Bottom Input Area */}
      <form onSubmit={handleSend} className="p-2.5 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 flex gap-2 items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={ui.chatPlaceholder}
          disabled={isProcessing || isRecording || isTranscribing}
          className="flex-1 px-3.5 py-2 text-xs border border-slate-200/90 rounded-xl bg-white/95 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
        />

        {/* Mic Button */}
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || isTranscribing}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95 ${
            isRecording
              ? 'bg-rose-500 text-white animate-voice-aura-red shadow-md'
              : isTranscribing
              ? 'bg-amber-100 text-amber-800 animate-pulse'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70'
          }`}
          title={isRecording ? ui.micStopBtn : ui.micBtn}
        >
          {isRecording ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isProcessing || isRecording || isTranscribing}
          className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all flex items-center justify-center shrink-0 active:scale-95"
          title={ui.sendBtn}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
};
