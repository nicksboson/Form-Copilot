// extension/src/sidepanel/App.tsx: Main application component managing state, scan flow, chat, and confirmation modal

import React, { useState, useEffect } from 'react';
import {
  MESSAGE_TYPES,
  FormSnapshot,
  FormSummary,
  ConversationReply,
  ConversationOption,
  FillResult,
  Diagnostics,
  Question,
} from 'form-copilot-shared';
import { getBackendUrl } from '../settings';
import { SummaryCard } from './components/SummaryCard';
import { QuestionNav } from './components/QuestionNav';
import { ChatView, ChatMessage } from './components/ChatView';
import { ConfirmModal } from './components/ConfirmModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { SettingsModal } from './components/SettingsModal';
import { VoiceFillingSimulation } from './components/VoiceFillingSimulation';
import { useVoiceSimulation } from './useVoiceSimulation';
import { LanguageSelector } from './components/LanguageSelector';
import { SUPPORTED_LANGUAGES, LanguageOption } from './languages';
import { getUIStrings } from './i18n';

function resolveQuestion(
  snapshot: FormSnapshot | null,
  questionIdOrTitle: string | null
): Question | null {
  if (!snapshot) return null;
  const allQuestions = snapshot.pages.flatMap((p) => p.questions);
  if (allQuestions.length === 0) return null;

  if (questionIdOrTitle) {
    const search = questionIdOrTitle.trim().toLowerCase();

    // 1. Exact match on question ID
    let match = allQuestions.find((q) => q.id.toLowerCase() === search);
    if (match) return match;

    // 2. Exact match on entryKey
    match = allQuestions.find((q) => q.entryKey && q.entryKey.toLowerCase() === search);
    if (match) return match;

    // 3. Exact match on title (ignoring asterisks and extra spaces)
    const cleanSearch = search.replace(/\*/g, '').trim();
    match = allQuestions.find(
      (q) => q.title.toLowerCase().replace(/\*/g, '').trim() === cleanSearch
    );
    if (match) return match;

    // 4. Substring match on title
    match = allQuestions.find((q) => {
      const cleanTitle = q.title.toLowerCase().replace(/\*/g, '').trim();
      return cleanTitle.includes(cleanSearch) || cleanSearch.includes(cleanTitle);
    });
    if (match) return match;
  }

  // 5. Default to the first question
  return allQuestions[0] || null;
}

export const App: React.FC = () => {
  const [snapshot, setSnapshot] = useState<FormSnapshot | null>(null);
  const [summary, setSummary] = useState<FormSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fillLogs, setFillLogs] = useState<FillResult[]>([]);
  const [backendUrl, setBackendUrlState] = useState<string>('http://localhost:3001');
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]);
  const ui = getUIStrings(selectedLanguage.code);

  // Realtime Voice Simulation Hook
  const {
    isVoiceMode,
    voiceModeType,
    voiceSimStatus,
    voiceSimMessage,
    voiceSimTranscript,
    voiceSimOptions,
    voiceSimQuestionIndex,
    startVoiceSimulation,
    stopVoiceSimulation,
    triggerStartFormFilling,
    startVoiceListening,
    handleDoneSpeaking,
    handleVoiceSelectOption,
    handleManualDone,
    handleSkipQuestion,
    handleRetryQuestion,
  } = useVoiceSimulation({
    snapshot,
    backendUrl,
    selectedLanguage,
    messages,
    setMessages,
    setActiveQuestionId,
    setFillLogs,
  });

  // Modals state
  const [pendingConfirm, setPendingConfirm] = useState<{
    option: ConversationOption;
    questionId: string;
    entryKey?: string;
    questionTitle: string;
  } | null>(null);
  const [isSubmittingFill, setIsSubmittingFill] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState<Diagnostics | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Load initial backend URL and snapshot
  useEffect(() => {
    getBackendUrl().then((url) => setBackendUrlState(url));

    chrome.runtime.sendMessage({ type: MESSAGE_TYPES.GET_SNAPSHOT }, (res) => {
      if (res && res.snapshot) {
        setSnapshot(res.snapshot);
        setSummary(res.summary || null);
      }
    });

    // Listen for page updates during PARTIAL scan mode
    const listener = (msg: { type: string; snapshot?: FormSnapshot }) => {
      if (msg.type === MESSAGE_TYPES.SCAN_COMPLETE && msg.snapshot) {
        setSnapshot(msg.snapshot);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const handleStartScan = async () => {
    setIsScanning(true);
    setErrorMessage(null);

    chrome.runtime.sendMessage(
      {
        type: MESSAGE_TYPES.START_SCAN,
        languageName: selectedLanguage.name,
        languageCode: selectedLanguage.code,
      },
      (response) => {
        setIsScanning(false);
        if (!response || !response.success) {
          setErrorMessage(response?.error || 'Failed to scan form. Please retry.');
          return;
        }
        setSnapshot(response.snapshot);
        setSummary(response.summary);

        const firstQ = response.snapshot.pages[0]?.questions[0];
        if (firstQ) {
          setActiveQuestionId(firstQ.id);
        }
        const initialPrompt =
          selectedLanguage.code === 'en-IN'
            ? firstQ
              ? `Hello! I have scanned your form. We can begin directly with question 1:\n\nQuestion 1: "${firstQ.title}"\n\nClick the Mic button below or start Voice Mode to speak your answer. I will fill it directly in the form.`
              : 'Hello! I have scanned this form. You can ask any question or start filling.'
            : firstQ
            ? `नमस्ते! मैंने आपका फ़ॉर्म पढ़ लिया है। हम सीधे पहले सवाल से शुरू कर सकते हैं:\n\nप्रश्न 1: "${firstQ.title}"\n\nनीचे माइक (Mic) दबाकर अपना उत्तर बोलें। मैं आपके एक क्लिक पर इसे सीधे फ़ॉर्म में भर दूँगा।`
            : 'नमस्ते! मैंने यह फ़ॉर्म पढ़ लिया है। आप किसी भी प्रश्न के बारे में पूछ सकते हैं।';

        setMessages([
          {
            id: 'welcome',
            sender: 'assistant',
            text: initialPrompt,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    );
  };

  const handleLanguageChange = async (lang: LanguageOption) => {
    setSelectedLanguage(lang);
    if (snapshot) {
      try {
        const res = await fetch(`${backendUrl}/api/llm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'summary',
            snapshot,
            languageName: lang.name,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) setSummary(json.data);
        }
      } catch (err) {
        console.warn('Failed to update summary in selected language:', err);
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!snapshot) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessingChat(true);

    const history = messages.slice(-6).map((m) => ({
      role: m.sender,
      text: m.text,
    }));

    try {
      const res = await fetch(`${backendUrl}/api/llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'conversation',
          snapshot,
          question: text,
          contextQuestionId: activeQuestionId,
          languageName: selectedLanguage.name,
          languageCode: selectedLanguage.code,
          history,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `LLM request failed with status ${res.status}`);
      }

      const json = await res.json();
      const replyData: ConversationReply = json.data;

      if (replyData.questionId) {
        const matched = resolveQuestion(snapshot, replyData.questionId);
        if (matched) {
          setActiveQuestionId(matched.id);
        }
      }

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: replyData.explanationHi,
        replyData,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: `त्रुटि: ${msg}। कृपया पुनः प्रयास करें।`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsProcessingChat(false);
    }
  };

  const handleSelectOption = (option: ConversationOption, questionId: string | null) => {
    const matchedQ = resolveQuestion(snapshot, questionId);
    if (!matchedQ) return;

    setActiveQuestionId(matchedQ.id);
    setPendingConfirm({
      option,
      questionId: matchedQ.id,
      entryKey: matchedQ.entryKey,
      questionTitle: matchedQ.title,
    });
  };

  const handleSelectQuestion = (q: Question) => {
    setActiveQuestionId(q.id);
    const isEnglish = selectedLanguage.code === 'en-IN';
    const text = isEnglish
      ? `You selected: "${q.title}" ${q.required ? '(Required question)' : ''}\nClick Mic below to speak your answer or ask any question about this field.`
      : `आपने प्रश्न चुना: "${q.title}" ${q.required ? '(अनिवार्य प्रश्न)' : ''}\nनीचे माइक दबाकर उत्तर बोलें या इस प्रश्न के बारे में कुछ भी पूछें।`;

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'assistant',
        text,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (!snapshot) return;
    const allQuestions = snapshot.pages.flatMap((p) => p.questions);
    const currentIdx = allQuestions.findIndex((q) => q.id === activeQuestionId);
    if (currentIdx >= 0 && currentIdx + 1 < allQuestions.length) {
      handleSelectQuestion(allQuestions[currentIdx + 1]);
    }
  };

  const handleConfirmFill = () => {
    if (!pendingConfirm) return;
    setIsSubmittingFill(true);
    const toFill = pendingConfirm;
    const isEnglish = selectedLanguage.code === 'en-IN';

    chrome.runtime.sendMessage(
      {
        type: MESSAGE_TYPES.FILL_REQUEST,
        questionId: toFill.questionId,
        entryKey: toFill.entryKey,
        questionTitle: toFill.questionTitle,
        answer: toFill.option.en,
      },
      (response) => {
        setIsSubmittingFill(false);
        setPendingConfirm(null);

        const result: FillResult = response?.result || {
          questionId: toFill.questionId,
          success: false,
          status: 'error',
          message: 'No response received from content script',
        };

        setFillLogs((prev) => [result, ...prev]);

        // Find next question to guide the user automatically
        let nextQuestionText = '';
        if (result.success && snapshot) {
          const allQuestions = snapshot.pages.flatMap((p) => p.questions);
          const currentIdx = allQuestions.findIndex((q) => q.id === toFill.questionId);
          if (currentIdx >= 0 && currentIdx + 1 < allQuestions.length) {
            const nextQ = allQuestions[currentIdx + 1];
            setActiveQuestionId(nextQ.id);
            nextQuestionText = isEnglish
              ? `\n\nNext question: "${nextQ.title}"\nSpeak your answer, and I will fill it in the form.`
              : `\n\nअगला प्रश्न: "${nextQ.title}"\nबोलकर बताएं, मैं इसे भी फ़ॉर्म में भर दूँगा।`;
          } else if (currentIdx >= 0 && currentIdx + 1 === allQuestions.length) {
            nextQuestionText = isEnglish
              ? '\n\nGreat job! You have completed all questions in the form.'
              : '\n\nशानदार! आपने फ़ॉर्म के सभी प्रश्न पूरे कर लिए हैं।';
          }
        }

        const feedback = result.success
          ? isEnglish
            ? `Field filled: "${toFill.option.en}"${nextQuestionText}`
            : `फ़ील्ड भरा गया: "${toFill.option.en}"${nextQuestionText}`
          : result.status === 'already_filled'
          ? isEnglish
            ? `This field is already filled (value: "${result.readValue || ''}")`
            : `यह फ़ील्ड पहले से भरा हुआ है (मान: "${result.readValue || ''}")`
          : result.status === 'manual_required'
          ? isEnglish
            ? 'This field must be filled manually'
            : 'यह फ़ील्ड आपको खुद भरना होगा'
          : isEnglish
          ? `Could not fill field: ${result.message}`
          : `फ़ील्ड नहीं भरा जा सका: ${result.message}`;

        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            sender: 'assistant',
            text: feedback,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    );
  };

  const handleReset = () => {
    stopVoiceSimulation();
    chrome.runtime.sendMessage({ type: MESSAGE_TYPES.RESET_STATE }, () => {
      setSnapshot(null);
      setSummary(null);
      setMessages([]);
      setFillLogs([]);
      setActiveQuestionId(null);
      setErrorMessage(null);
    });
  };

  const handleOpenDiagnostics = () => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPES.GET_DIAGNOSTICS }, (res) => {
      setDiagnosticsData(res?.diagnostics || null);
      setShowDiagnostics(true);
    });
  };

  return (
    <div className="p-3.5 max-w-md mx-auto space-y-3 font-sans">
      {/* Apple-styled Glass Header */}
      <header className="glass-panel rounded-2xl px-3.5 py-2.5 flex items-center justify-between border border-white/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-xs ring-1 ring-white/30 shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">{ui.appName}</h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/70 rounded-lg shadow-2xs transition-all active:scale-95"
            title="Reset form snapshot and assistant"
          >
            {ui.resetBtn}
          </button>
        </div>
      </header>

      {/* Language Selection Bar (Always accessible at top) */}
      <div className="glass-panel rounded-2xl p-2.5 border border-white/80 shadow-xs">
        <LanguageSelector
          selectedCode={selectedLanguage.code}
          onSelectLanguage={handleLanguageChange}
          disabled={isVoiceMode}
          label={ui.languageLabel}
        />
      </div>

      {/* Error Banner with Retry */}
      {errorMessage && (
        <div className="p-3 bg-rose-50/90 border border-rose-200 rounded-2xl text-xs text-rose-900 flex justify-between items-center shadow-xs">
          <span className="font-medium">{errorMessage}</span>
          <button
            type="button"
            onClick={handleStartScan}
            className="ml-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-[11px] shrink-0 shadow-xs active:scale-95 transition-all"
          >
            {ui.retryBtn}
          </button>
        </div>
      )}

      {/* Start Button */}
      {!snapshot && !isScanning && (
        <div className="glass-panel rounded-2xl p-8 text-center shadow-sm border border-white/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 border border-indigo-200/60 flex items-center justify-center text-indigo-600 mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">
              {ui.scanCardTitle}
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
              {ui.scanCardDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartScan}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            {ui.startScanBtn}
          </button>
        </div>
      )}

      {/* Scanning State */}
      {isScanning && (
        <div className="glass-panel rounded-2xl p-8 text-center shadow-sm border border-white/80">
          <div className="inline-block w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-bold text-slate-900 tracking-tight">{ui.scanningTitle}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{ui.scanningDesc}</p>
        </div>
      )}

      {/* Active Form Copilot Workspace */}
      {snapshot && (
        <div className="space-y-3">
          {/* Voice Filling Action Banner */}
          <div className="glass-card-hero rounded-2xl p-3.5 shadow-lg border border-white/20 text-white flex items-center justify-between">
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span className="tracking-tight">{ui.voiceModeTitle}</span>
                {isVoiceMode ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 text-[10px] font-bold border border-rose-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping inline-block" />
                    LIVE
                  </span>
                ) : (
                  <span className="inline-block px-1.5 py-0.5 rounded-full bg-white/15 text-white/90 text-[10px] font-semibold">
                    AI Guided
                  </span>
                )}
              </div>
              <div className="text-[11px] text-indigo-100 font-medium mt-0.5">
                {ui.voiceModeSubtitle(selectedLanguage.name)}
              </div>
            </div>
            <button
              type="button"
              onClick={isVoiceMode ? stopVoiceSimulation : startVoiceSimulation}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 active:scale-95 ${
                isVoiceMode
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-white text-indigo-950 hover:bg-slate-50 hover:shadow-lg'
              }`}
            >
              {isVoiceMode ? ui.stopVoiceBtn : ui.startVoiceBtn}
            </button>
          </div>

          {/* Realtime Multilingual Voice Simulation Panel */}
          {isVoiceMode && (
            <VoiceFillingSimulation
              isActive={isVoiceMode}
              mode={voiceModeType}
              languageName={selectedLanguage.name}
              onStop={stopVoiceSimulation}
              questions={snapshot.pages.flatMap((p) => p.questions)}
              currentQuestionIndex={voiceSimQuestionIndex}
              status={voiceSimStatus}
              statusMessage={voiceSimMessage}
              transcript={voiceSimTranscript}
              pendingOptions={voiceSimOptions}
              onSelectOption={handleVoiceSelectOption}
              onDoneSpeaking={handleDoneSpeaking}
              onSkipQuestion={handleSkipQuestion}
              onRetryQuestion={handleRetryQuestion}
              onStartFormFilling={triggerStartFormFilling}
              onManualDone={handleManualDone}
              onStartListeningManually={startVoiceListening}
              uiStrings={ui}
            />
          )}

          {summary && !isVoiceMode && <SummaryCard summary={summary} uiStrings={ui} />}

          <QuestionNav
            questions={snapshot.pages.flatMap((p) => p.questions)}
            activeQuestionId={activeQuestionId}
            onSelectQuestion={handleSelectQuestion}
            title={ui.formQuestionsTitle}
            totalCountText={ui.totalQuestionsCount(snapshot.pages.flatMap((p) => p.questions).length)}
            prefix={ui.questionPrefix}
          />

          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            onSelectOption={handleSelectOption}
            pendingConfirm={pendingConfirm}
            onConfirmFill={handleConfirmFill}
            onCancelConfirm={() => setPendingConfirm(null)}
            isSubmittingFill={isSubmittingFill}
            activeQuestionTitle={
              snapshot.pages
                .flatMap((p) => p.questions)
                .find((q) => q.id === activeQuestionId)?.title || null
            }
            onNextQuestion={handleNextQuestion}
            backendUrl={backendUrl}
            isProcessing={isProcessingChat}
            voiceNote={null}
            uiStrings={ui}
            selectedLanguageCode={selectedLanguage.code}
          />

          {/* Fill Log Card */}
          {fillLogs.length > 0 && (
            <div className="glass-panel rounded-2xl p-3.5 text-xs border border-white/80 shadow-xs">
              <div className="flex items-center gap-1.5 mb-2.5">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  {ui.fillLogsTitle}
                </span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {fillLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex justify-between items-center text-[11px] font-medium transition-all shadow-2xs ${
                      log.success
                        ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
                        : 'bg-amber-50/80 border-amber-200/80 text-amber-900'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-slate-500 bg-white/70 px-1.5 py-0.5 rounded border border-slate-200/60">
                      {log.questionId}
                    </span>
                    <span className="truncate max-w-[200px]">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {pendingConfirm && (
        <ConfirmModal
          questionTitle={pendingConfirm.questionTitle}
          option={pendingConfirm.option}
          onConfirm={handleConfirmFill}
          onCancel={() => setPendingConfirm(null)}
          isSubmitting={isSubmittingFill}
        />
      )}

      {showDiagnostics && (
        <DiagnosticsModal
          diagnostics={diagnosticsData}
          onClose={() => setShowDiagnostics(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          currentUrl={backendUrl}
          onClose={() => setShowSettings(false)}
          onSaved={(newUrl) => setBackendUrlState(newUrl)}
        />
      )}
    </div>
  );
};

export default App;
