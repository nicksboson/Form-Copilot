// extension/src/sidepanel/useVoiceSimulation.ts: Multilingual voice simulation with conversational Q&A and guided form filling
import { useState, useRef } from 'react';
import {
  FormSnapshot,
  Question,
  ConversationReply,
  ConversationOption,
  FillResult,
  MESSAGE_TYPES,
} from 'form-copilot-shared';
import { WavRecorder } from './wav-recorder';
import { VoiceSimulationStatus } from './components/VoiceFillingSimulation';
import { ChatMessage } from './components/ChatView';
import { LanguageOption } from './languages';

interface UseVoiceSimulationParams {
  snapshot: FormSnapshot | null;
  backendUrl: string;
  selectedLanguage: LanguageOption;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setActiveQuestionId: (id: string | null) => void;
  setFillLogs: React.Dispatch<React.SetStateAction<FillResult[]>>;
}

export function useVoiceSimulation({
  snapshot,
  backendUrl,
  selectedLanguage,
  messages,
  setMessages,
  setActiveQuestionId,
  setFillLogs,
}: UseVoiceSimulationParams) {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceModeType, setVoiceModeType] = useState<'greeting_qa' | 'form_filling'>('greeting_qa');
  const [voiceSimStatus, setVoiceSimStatus] = useState<VoiceSimulationStatus>('idle');
  const [voiceSimMessage, setVoiceSimMessage] = useState<string>('');
  const [voiceSimTranscript, setVoiceSimTranscript] = useState<string | null>(null);
  const [voiceSimOptions, setVoiceSimOptions] = useState<ConversationOption[]>([]);
  const [voiceSimQuestionIndex, setVoiceSimQuestionIndex] = useState<number>(0);

  const voiceRecorderRef = useRef<WavRecorder | null>(null);
  const voiceAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Play TTS speech via backend Gnani Timbre v2.5 in selected language
  const playVoiceSpeech = async (text: string): Promise<void> => {
    if (voiceAudioPlayerRef.current) {
      voiceAudioPlayerRef.current.pause();
      voiceAudioPlayerRef.current = null;
    }

    return new Promise(async (resolve) => {
      try {
        const res = await fetch(`${backendUrl}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            language: selectedLanguage.code,
          }),
        });

        if (!res.ok) throw new Error('TTS failed');

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        voiceAudioPlayerRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };

        audio.onerror = () => {
          URL.revokeObjectURL(url);
          resolve();
        };

        await audio.play();
      } catch {
        setTimeout(resolve, 1500);
      }
    });
  };

  // Start microphone recording with WavRecorder (16kHz mono PCM WAV)
  const startVoiceListening = async () => {
    setVoiceSimStatus('listening');
    setVoiceSimMessage(
      selectedLanguage.code === 'en-IN'
        ? 'Listening... Speak your query or answer'
        : 'सुन रहा हूँ... अपना प्रश्न या उत्तर बोलें'
    );

    try {
      const recorder = new WavRecorder();
      await recorder.start();
      voiceRecorderRef.current = recorder;
    } catch {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: chrome.runtime.getURL('permission.html') });
      }
      setVoiceSimMessage('माइक अनुमति की आवश्यकता है। कृपया अनुमति दें।');
    }
  };

  // Execute field fill in the Google Form via background -> content script
  const executeVoiceFill = async (targetQ: Question, answerValue: string) => {
    setVoiceSimStatus('filling');
    setVoiceSimMessage(`फ़ील्ड भरा जा रहा है: "${answerValue}"`);

    chrome.runtime.sendMessage(
      {
        type: MESSAGE_TYPES.FILL_REQUEST,
        questionId: targetQ.id,
        entryKey: targetQ.entryKey,
        questionTitle: targetQ.title,
        answer: answerValue,
      },
      async (response) => {
        const result: FillResult = response?.result || {
          questionId: targetQ.id,
          success: false,
          status: 'error',
          message: 'No response received from content script',
        };

        setFillLogs((prev) => [result, ...prev]);

        const questions = snapshot ? snapshot.pages.flatMap((p) => p.questions) : [];
        const nextIdx = voiceSimQuestionIndex + 1;

        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              id: String(Date.now()),
              sender: 'assistant',
              text: `फ़ील्ड भरा गया: "${answerValue}"`,
              timestamp: new Date().toISOString(),
            },
          ]);
          await playVoiceSpeech(
            selectedLanguage.code === 'en-IN' ? 'Field filled successfully.' : 'उत्तर भर दिया गया है।'
          );
          askQuestionStep(nextIdx, questions);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: String(Date.now()),
              sender: 'assistant',
              text: `फ़ील्ड नहीं भरा जा सका: ${result.message}`,
              timestamp: new Date().toISOString(),
            },
          ]);
          await playVoiceSpeech(
            selectedLanguage.code === 'en-IN'
              ? 'Could not fill field automatically. Moving to next question.'
              : 'फ़ील्ड नहीं भरा जा सका। अगला प्रश्न देखते हैं।'
          );
          askQuestionStep(nextIdx, questions);
        }
      }
    );
  };

  // Step through questions sequentially in form filling mode
  const askQuestionStep = async (index: number, qList?: Question[]) => {
    const questions = qList || (snapshot ? snapshot.pages.flatMap((p) => p.questions) : []);
    if (index >= questions.length) {
      setVoiceSimStatus('completed');
      const finishText =
        selectedLanguage.code === 'en-IN'
          ? 'Great job! All questions in the form have been completed. Please review before submitting.'
          : 'शानदार! फ़ॉर्म के सभी प्रश्न पूरे हो गए हैं। कृपया सबमिट करने से पहले एक बार जाँच कर लें।';
      setVoiceSimMessage(finishText);
      await playVoiceSpeech(finishText);
      return;
    }

    const currentQ = questions[index];
    setVoiceSimQuestionIndex(index);
    setActiveQuestionId(currentQ.id);
    setVoiceSimOptions([]);
    setVoiceSimTranscript(null);

    // Check for special fields: DOB/Date, File Upload, Checkbox, Radio
    const isSpecialField =
      currentQ.type === 'date' ||
      currentQ.type === 'file_upload' ||
      currentQ.type === 'checkboxes' ||
      currentQ.type === 'radio' ||
      /dob|birth|upload|resume|file|gender|choice/i.test(currentQ.title);

    if (isSpecialField) {
      setVoiceSimStatus('speaking');
      let typeDesc = 'विकल्प (Choice)';
      if (currentQ.type === 'date' || /dob|birth/i.test(currentQ.title)) {
        typeDesc = selectedLanguage.code === 'en-IN' ? 'Date of Birth / Date' : 'जन्मतिथि (Date of Birth)';
      } else if (currentQ.type === 'file_upload' || /upload|resume/i.test(currentQ.title)) {
        typeDesc = selectedLanguage.code === 'en-IN' ? 'File Upload' : 'फ़ाइल अपलोड (File Upload)';
      } else if (currentQ.type === 'checkboxes') {
        typeDesc = selectedLanguage.code === 'en-IN' ? 'Checkbox' : 'चेकबॉक्स (Checkbox)';
      } else if (currentQ.type === 'radio') {
        typeDesc = selectedLanguage.code === 'en-IN' ? 'Multiple Choice' : 'बहुविकल्पीय (Multiple Choice)';
      }

      const manualPromptText = selectedLanguage.manualPrompt(currentQ.title, typeDesc);
      setVoiceSimMessage(manualPromptText);

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'assistant',
          text: manualPromptText,
          timestamp: new Date().toISOString(),
        },
      ]);

      await playVoiceSpeech(manualPromptText);
      setVoiceSimStatus('manual_pending');
      startVoiceListening();
      return;
    }

    // Normal short text or paragraph field
    setVoiceSimStatus('speaking');
    const spokenPrompt =
      selectedLanguage.code === 'en-IN'
        ? `Question ${index + 1}: "${currentQ.title}". Please speak your answer.`
        : `प्रश्न ${index + 1}: "${currentQ.title}"। कृपया अपना उत्तर बोलकर बताएं।`;

    setVoiceSimMessage(spokenPrompt);
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'assistant',
        text: spokenPrompt,
        timestamp: new Date().toISOString(),
      },
    ]);

    await playVoiceSpeech(spokenPrompt);
    startVoiceListening();
  };

  // Start voice simulation: First greeting & Q&A mode
  const startVoiceSimulation = async () => {
    if (!snapshot) return;
    setIsVoiceMode(true);
    setVoiceModeType('greeting_qa');
    setVoiceSimStatus('speaking');
    setVoiceSimTranscript(null);
    setVoiceSimOptions([]);

    const greetingText = selectedLanguage.greeting;
    setVoiceSimMessage(greetingText);

    setMessages((prev) => [
      ...prev,
      {
        id: 'voice_greeting',
        sender: 'assistant',
        text: greetingText,
        timestamp: new Date().toISOString(),
      },
    ]);

    await playVoiceSpeech(greetingText);
    startVoiceListening();
  };

  // Transition from greeting Q&A to step-by-step form filling
  const triggerStartFormFilling = async () => {
    if (!snapshot) return;
    const questions = snapshot.pages.flatMap((p) => p.questions);
    if (questions.length === 0) return;

    setVoiceModeType('form_filling');
    const introText =
      selectedLanguage.code === 'en-IN'
        ? "Starting form filling now! Let's begin with question 1."
        : 'ठीक है! फ़ॉर्म भरना शुरू करते हैं। चलिए पहले प्रश्न से शुरुआत करते हैं।';

    setVoiceSimMessage(introText);
    await playVoiceSpeech(introText);
    askQuestionStep(0, questions);
  };

  // Stop voice simulation
  const stopVoiceSimulation = () => {
    if (voiceAudioPlayerRef.current) {
      voiceAudioPlayerRef.current.pause();
      voiceAudioPlayerRef.current = null;
    }
    if (voiceRecorderRef.current) {
      try {
        voiceRecorderRef.current.stop();
      } catch {}
      voiceRecorderRef.current = null;
    }
    setIsVoiceMode(false);
    setVoiceSimStatus('idle');
  };

  // User finished speaking answer or question
  const handleDoneSpeaking = async () => {
    if (!voiceRecorderRef.current) return;
    setVoiceSimStatus('processing');
    setVoiceSimMessage('आवाज समझ रहे हैं...');

    let transcript = '';
    try {
      const audioBlob = voiceRecorderRef.current.stop();
      voiceRecorderRef.current = null;

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('languageCode', selectedLanguage.code);

      const sttRes = await fetch(`${backendUrl}/api/stt`, {
        method: 'POST',
        body: formData,
      });

      if (!sttRes.ok) throw new Error('STT failed');
      const sttData = await sttRes.json();
      transcript = (sttData.transcript || '').trim();
    } catch (err) {
      console.error('STT error in voice sim:', err);
    }

    if (!transcript) {
      const noSpeechText =
        selectedLanguage.code === 'en-IN'
          ? 'No speech detected. Please speak again.'
          : 'माफ़ कीजिए, कोई आवाज नहीं पहचानी गई। कृपया पुनः बोलें।';
      setVoiceSimMessage(noSpeechText);
      await playVoiceSpeech(noSpeechText);
      startVoiceListening();
      return;
    }

    setVoiceSimTranscript(transcript);

    // Add user message to chat
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: transcript,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const transcriptLower = transcript.toLowerCase();

    // Check if in manual_pending state and user said "Done" / "हो गया"
    if (voiceSimStatus === 'manual_pending') {
      const isDoneSpoken =
        transcriptLower.includes('done') ||
        transcriptLower.includes('ho gaya') ||
        transcriptLower.includes('ho gya') ||
        transcriptLower.includes('हो गया') ||
        transcriptLower.includes('कर दिया') ||
        transcriptLower.includes('completed') ||
        transcriptLower.includes('next') ||
        transcriptLower.includes('झाले') ||
        transcriptLower.includes('થઈ ગયું') ||
        transcriptLower.includes('முடிந்தது') ||
        transcriptLower.includes('పూర్తయింది') ||
        transcriptLower.includes('ಮುಗಿಯಿತು');

      if (isDoneSpoken) {
        await handleManualDone();
        return;
      }
    }

    // Check if in greeting_qa mode and user commanded to start filling
    if (voiceModeType === 'greeting_qa') {
      const isStartFillingCommand =
        transcriptLower.includes('fill') ||
        transcriptLower.includes('start') ||
        transcriptLower.includes('form भर') ||
        transcriptLower.includes('भरना') ||
        transcriptLower.includes('begin') ||
        transcriptLower.includes('move to') ||
        transcriptLower.includes('शुरू');

      if (isStartFillingCommand) {
        await triggerStartFormFilling();
        return;
      }
    }

    // Otherwise, handle as real-time Q&A or field answer via LLM
    try {
      const questions = snapshot ? snapshot.pages.flatMap((p) => p.questions) : [];
      const currentQ = questions[voiceSimQuestionIndex];

      const history = messages.slice(-6).map((m) => ({
        role: m.sender,
        text: m.text,
      }));

      const llmRes = await fetch(`${backendUrl}/api/llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'conversation',
          snapshot,
          question: transcript,
          contextQuestionId: currentQ?.id,
          languageName: selectedLanguage.name,
          languageCode: selectedLanguage.code,
          history,
        }),
      });

      if (!llmRes.ok) throw new Error('LLM failed');
      const { data: replyData } = (await llmRes.json()) as { data: ConversationReply };

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: replyData.explanationHi,
        replyData,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // If in greeting_qa mode: answer question conversationally, stay in greeting_qa mode
      if (voiceModeType === 'greeting_qa') {
        setVoiceSimMessage(replyData.explanationHi);
        await playVoiceSpeech(replyData.explanationHi);
        startVoiceListening();
        return;
      }

      // If in form_filling mode: process field options
      const targetQ = currentQ;
      if (!targetQ) return;

      if (replyData.options && replyData.options.length > 1) {
        // Big data: 2-3 options
        setVoiceSimStatus('options_pending');
        setVoiceSimOptions(replyData.options);
        const optPrompt =
          selectedLanguage.code === 'en-IN'
            ? 'I have prepared 2-3 options. Please select your preferred option on screen to fill it in the form.'
            : 'इसके लिए 2-3 विकल्प तैयार हैं। स्क्रीन पर अपनी पसंद का विकल्प चुनें, वह तुरंत फॉर्म में भर जाएगा।';
        setVoiceSimMessage(optPrompt);
        await playVoiceSpeech(optPrompt);
      } else if (replyData.options && replyData.options.length === 1) {
        // Single direct answer: fill at the same time!
        await executeVoiceFill(targetQ, replyData.options[0].en);
      } else {
        setVoiceSimMessage(replyData.explanationHi);
        await playVoiceSpeech(replyData.explanationHi);
        startVoiceListening();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setVoiceSimMessage(`त्रुटि: ${msg}`);
    }
  };

  // When user clicks an option card in big data
  const handleVoiceSelectOption = async (option: ConversationOption) => {
    const questions = snapshot ? snapshot.pages.flatMap((p) => p.questions) : [];
    const currentQ = questions[voiceSimQuestionIndex];
    if (!currentQ) return;

    await executeVoiceFill(currentQ, option.en);
  };

  // Manual Done: when user finished selecting date, upload, checkbox, or radio
  const handleManualDone = async () => {
    setVoiceSimStatus('speaking');
    const doneAck = selectedLanguage.doneConfirmation;
    setVoiceSimMessage(doneAck);
    await playVoiceSpeech(doneAck);

    const questions = snapshot ? snapshot.pages.flatMap((p) => p.questions) : [];
    askQuestionStep(voiceSimQuestionIndex + 1, questions);
  };

  const handleSkipQuestion = () => {
    if (voiceAudioPlayerRef.current) {
      voiceAudioPlayerRef.current.pause();
    }
    if (voiceRecorderRef.current) {
      try {
        voiceRecorderRef.current.stop();
      } catch {}
      voiceRecorderRef.current = null;
    }
    const questions = snapshot ? snapshot.pages.flatMap((p) => p.questions) : [];
    askQuestionStep(voiceSimQuestionIndex + 1, questions);
  };

  const handleRetryQuestion = () => {
    if (voiceAudioPlayerRef.current) {
      voiceAudioPlayerRef.current.pause();
    }
    if (voiceRecorderRef.current) {
      try {
        voiceRecorderRef.current.stop();
      } catch {}
      voiceRecorderRef.current = null;
    }
    const questions = snapshot ? snapshot.pages.flatMap((p) => p.questions) : [];
    askQuestionStep(voiceSimQuestionIndex, questions);
  };

  return {
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
  };
}
