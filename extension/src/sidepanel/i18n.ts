// extension/src/sidepanel/i18n.ts: Centralized UI localization dictionary for all supported languages
export interface UIStrings {
  appName: string;
  appSubtitle: string;
  resetBtn: string;
  diagnosticsBtn: string;
  settingsBtn: string;
  languageLabel: string;
  retryBtn: string;

  // Scan Card
  scanCardTitle: string;
  scanCardDesc: string;
  startScanBtn: string;
  scanningTitle: string;
  scanningDesc: string;

  // Voice Banner
  voiceModeTitle: string;
  voiceModeSubtitle: (langName: string) => string;
  startVoiceBtn: string;
  stopVoiceBtn: string;

  // Question Nav
  formQuestionsTitle: string;
  totalQuestionsCount: (count: number) => string;
  questionPrefix: string;
  requiredAsterisk: string;

  // Chat View
  activeQuestionPrefix: string;
  nextBtn: string;
  speakBtn: string;
  stopAudioBtn: string;
  suggestedAnswersTitle: string;
  selectOptionBtn: string;
  confirmTitle: (questionTitle: string, value: string) => string;
  meaningLabel: string;
  cancelBtn: string;
  confirmFillBtn: string;
  fillingStatus: string;
  thinkingStatus: string;
  speechRecognizedNote: string;
  chatPlaceholder: string;
  micBtn: string;
  micStopBtn: string;
  micProcessingBtn: string;
  sendBtn: string;
  chipsLabel: string;
  chipQuestions: string[];

  // Voice Simulation
  voiceSimHeaderQA: (langName: string) => string;
  voiceSimHeaderFilling: (langName: string) => string;
  exitBtn: string;
  qaPromptTitle: string;
  qaPromptDesc: string;
  startFillingBtn: string;
  questionNumber: (num: number) => string;
  requiredBadge: string;
  agentSpeaking: string;
  speakNowLink: string;
  listeningTitle: string;
  listeningDescQA: string;
  listeningDescFilling: string;
  doneSpeakingBtn: string;
  processingSpeech: string;
  recognizedText: string;
  manualSelfSelectTitle: string;
  manualDoneBtn: string;
  manualDoneHint: string;
  fillingFieldStatus: string;
  allCompletedTitle: string;
  allCompletedDesc: string;
  finishVoiceBtn: string;
  bigDataOptionsTitle: string;
  fillThisOptionBtn: string;
  retryBtnLabel: string;
  skipNextBtnLabel: string;

  // Summary & Fill logs
  summaryTitle: string;
  summaryCardTitle: string;
  summaryPurposeLabel: string;
  summaryTotalPagesLabel: string;
  summaryBranchingLabel: string;
  summaryRequiredQuestionsLabel: (count: number) => string;
  summaryRequiredDocsLabel: string;
  fillLogsTitle: string;
}

const enStrings: UIStrings = {
  appName: 'Form Copilot',
  appSubtitle: 'Google Forms Assistant',
  resetBtn: 'Reset',
  diagnosticsBtn: 'Diagnostics',
  settingsBtn: 'Settings',
  languageLabel: 'Language:',
  retryBtn: 'Retry',

  scanCardTitle: 'Start Reading Form',
  scanCardDesc: 'Click below to scan the active Google Form tab and understand it with AI.',
  startScanBtn: 'Start Scan',
  scanningTitle: 'Reading form...',
  scanningDesc: 'Please wait...',

  voiceModeTitle: 'Voice Assistant',
  voiceModeSubtitle: (lang) => `Talk and fill form in ${lang}`,
  startVoiceBtn: 'Start Voice',
  stopVoiceBtn: 'Stop',

  formQuestionsTitle: 'Questions',
  totalQuestionsCount: (count) => `${count} questions`,
  questionPrefix: 'Q',
  requiredAsterisk: '*',

  activeQuestionPrefix: 'Active Question:',
  nextBtn: 'Next ->',
  speakBtn: 'Speak',
  stopAudioBtn: 'Stop',
  suggestedAnswersTitle: 'Suggested Answers:',
  selectOptionBtn: 'Select',
  confirmTitle: (title, val) => `Question: "${title}" will be filled with: "${val}". Proceed?`,
  meaningLabel: 'Meaning / Explanation:',
  cancelBtn: 'Cancel',
  confirmFillBtn: 'Confirm & Fill',
  fillingStatus: 'Filling field...',
  thinkingStatus: 'Thinking...',
  speechRecognizedNote: 'Speech recognized. Review before sending:',
  chatPlaceholder: 'Ask any question or answer...',
  micBtn: 'Mic',
  micStopBtn: 'Stop',
  micProcessingBtn: 'Recognizing...',
  sendBtn: 'Send',
  chipsLabel: 'Quick:',
  chipQuestions: [
    'What is the next question?',
    'Explain this question',
    'What is the purpose of this form?',
    'Which questions are required?',
  ],

  voiceSimHeaderQA: (lang) => `Voice Assistant (${lang})`,
  voiceSimHeaderFilling: (lang) => `Voice Filling (${lang})`,
  exitBtn: 'Exit',
  qaPromptTitle: 'You can ask any question about the form in real-time.',
  qaPromptDesc: 'Say "move to form filling" or click the button below to start filling:',
  startFillingBtn: 'Start Form Filling ->',
  questionNumber: (num) => `Question ${num}:`,
  requiredBadge: '* Required',
  agentSpeaking: 'Agent is speaking...',
  speakNowLink: 'Speak Now',
  listeningTitle: 'Listening... Speak now',
  listeningDescQA: 'Ask any question or say "Move to form filling"',
  listeningDescFilling: 'Speak your answer. Click below when finished:',
  doneSpeakingBtn: 'Done Speaking',
  processingSpeech: 'Processing speech...',
  recognizedText: 'Recognized:',
  manualSelfSelectTitle: 'Self-Selection Required:',
  manualDoneBtn: 'Done -> Next Question',
  manualDoneHint: 'Or say "Done" on the microphone',
  fillingFieldStatus: 'Filling field in form...',
  allCompletedTitle: 'Great job! All form questions completed.',
  allCompletedDesc: 'Please review the form before submitting.',
  finishVoiceBtn: 'Finish Voice Mode',
  bigDataOptionsTitle: '2-3 options prepared. Select your choice (adds to form immediately):',
  fillThisOptionBtn: 'Fill This',
  retryBtnLabel: 'Retry',
  skipNextBtnLabel: 'Skip & Next ->',

  summaryTitle: 'Form Summary',
  summaryCardTitle: 'Form Summary',
  summaryPurposeLabel: 'Form Purpose',
  summaryTotalPagesLabel: 'Total Pages',
  summaryBranchingLabel: 'Branching',
  summaryRequiredQuestionsLabel: (count) => `Required Questions (${count})`,
  summaryRequiredDocsLabel: 'Required Documents',
  fillLogsTitle: 'Fill Logs',
};

const hiStrings: UIStrings = {
  appName: 'Form Copilot',
  appSubtitle: '',
  resetBtn: 'रीसेट (Reset)',
  diagnosticsBtn: 'जांच (Diagnostics)',
  settingsBtn: 'सेटिंग्स',
  languageLabel: 'भाषा (Language):',
  retryBtn: 'पुनः प्रयास करें (Retry)',

  scanCardTitle: 'फ़ॉर्म पढ़ना शुरू करें',
  scanCardDesc: 'सक्रिय Google Form टैब को स्कैन करने और AI से समझने के लिए नीचे क्लिक करें।',
  startScanBtn: 'शुरू करें (Start Scan)',
  scanningTitle: 'फ़ॉर्म पढ़ा जा रहा है...',
  scanningDesc: 'कृपया प्रतीक्षा करें...',

  voiceModeTitle: 'वॉइस असिस्टेंट',
  voiceModeSubtitle: (lang) => `${lang} में बात करें और फ़ॉर्म भरें`,
  startVoiceBtn: 'वॉइस शुरू करें (Start Voice)',
  stopVoiceBtn: 'रोकें (Stop)',

  formQuestionsTitle: 'फ़ॉर्म के प्रश्न (क्लिक करके चुनें):',
  totalQuestionsCount: (count) => `कुल ${count} प्रश्न`,
  questionPrefix: 'प्र',
  requiredAsterisk: '*',

  activeQuestionPrefix: 'सक्रिय प्रश्न:',
  nextBtn: 'अगला ->',
  speakBtn: 'बोलकर सुनाएं',
  stopAudioBtn: 'रोकें',
  suggestedAnswersTitle: 'सुझाए गए उत्तर (फ़ील्ड में भरने के लिए चुनें):',
  selectOptionBtn: 'चुनें (Select)',
  confirmTitle: (title, val) => `प्रश्न: "${title}" में यह भरा जाएगा: "${val}"। ठीक है?`,
  meaningLabel: 'अर्थ (Hindi meaning):',
  cancelBtn: 'रद्द करें (Cancel)',
  confirmFillBtn: 'पुष्टि करें (Confirm)',
  fillingStatus: 'भरा जा रहा है...',
  thinkingStatus: 'सोच रहा हूँ...',
  speechRecognizedNote: 'आवाज पहचानी गई। भेजने से पहले जांच लें:',
  chatPlaceholder: 'प्रश्न पूछें या उत्तर दें...',
  micBtn: 'माइक (Mic)',
  micStopBtn: 'रोकें (Stop)',
  micProcessingBtn: 'पहचान रहे हैं...',
  sendBtn: 'भेजें',
  chipsLabel: 'सुझाव:',
  chipQuestions: [
    'अगला सवाल क्या है?',
    'इस प्रश्न का अर्थ समझाएं',
    'फ़ॉर्म का उद्देश्य बताएं',
    'अनिवार्य प्रश्न कौन से हैं?',
  ],

  voiceSimHeaderQA: (lang) => `वॉइस असिस्टेंट (${lang})`,
  voiceSimHeaderFilling: (lang) => `वॉइस फिलिंग (${lang})`,
  exitBtn: 'बंद करें (Exit)',
  qaPromptTitle: 'आप फ़ॉर्म के बारे में कोई भी प्रश्न पूछ सकते हैं।',
  qaPromptDesc: 'फ़ॉर्म भरना शुरू करने के लिए बोलें: "फ़ॉर्म भरना शुरू करें" या नीचे बटन दबाएं:',
  startFillingBtn: 'फ़ॉर्म भरना शुरू करें ->',
  questionNumber: (num) => `प्रश्न ${num}:`,
  requiredBadge: '* अनिवार्य (Required)',
  agentSpeaking: 'एजेंट बोल रहा है...',
  speakNowLink: 'बोलना शुरू करें',
  listeningTitle: 'सुन रहा हूँ... बोलें',
  listeningDescQA: 'कोई भी सवाल पूछें या कहें "फ़ॉर्म भरना शुरू करें"',
  listeningDescFilling: 'अपना उत्तर बोलें। पूरा होने पर नीचे बटन दबाएं:',
  doneSpeakingBtn: 'उत्तर पूरा हुआ (Done Speaking)',
  processingSpeech: 'आवाज समझ रहे हैं...',
  recognizedText: 'पहचाना गया:',
  manualSelfSelectTitle: 'स्वयं चयन करें (Self Selection Required):',
  manualDoneBtn: 'हो गया (Done) -> अगले सवाल पर जाएं',
  manualDoneHint: 'या माइक पर बोलें: "हो गया" (Done)',
  fillingFieldStatus: 'फ़ील्ड में भरा जा रहा है...',
  allCompletedTitle: 'शानदार! फ़ॉर्म के सभी प्रश्न पूरे हो गए हैं।',
  allCompletedDesc: 'कृपया सबमिट करने से पहले फ़ॉर्म की एक बार समीक्षा कर लें।',
  finishVoiceBtn: 'वॉइस मोड पूरा करें (Finish)',
  bigDataOptionsTitle: '2-3 विकल्प तैयार हैं। अपनी पसंद का विकल्प चुनें (तुरंत फॉर्म में भर जाएगा):',
  fillThisOptionBtn: 'यह भरें (Fill This)',
  retryBtnLabel: 'पुनः पूछें (Retry)',
  skipNextBtnLabel: 'यह प्रश्न छोड़ें ->',

  summaryTitle: 'फ़ॉर्म सारांश',
  summaryCardTitle: 'फ़ॉर्म का संक्षिप्त विवरण (Summary)',
  summaryPurposeLabel: 'फ़ॉर्म का उद्देश्य',
  summaryTotalPagesLabel: 'कुल पृष्ठ',
  summaryBranchingLabel: 'शाखा (Branching)',
  summaryRequiredQuestionsLabel: (count) => `अनिवार्य प्रश्न (${count})`,
  summaryRequiredDocsLabel: 'आवश्यक दस्तावेज़',
  fillLogsTitle: 'फ़ील्ड भरने का इतिहास (Fill Logs):',
};

const mrStrings: UIStrings = {
  ...hiStrings,
  appName: 'Form Copilot',
  appSubtitle: 'Google Forms सहाय्यक',
  resetBtn: 'रीसेट (Reset)',
  diagnosticsBtn: 'तपासणी (Diagnostics)',
  settingsBtn: 'सेटिंग्ज',
  languageLabel: 'भाषा (Language):',
  retryBtn: 'पुन्हा प्रयत्न करा (Retry)',

  scanCardTitle: 'फॉर्म वाचणे सुरू करा',
  scanCardDesc: 'सक्रिय Google Form स्कॅन करण्यासाठी आणि AI सह समजून घेण्यासाठी खाली क्लिक करा.',
  startScanBtn: 'सुरू करा (Start Scan)',
  scanningTitle: 'फॉर्म वाचत आहे...',
  scanningDesc: 'कृपया प्रतीक्षा करा...',

  formQuestionsTitle: 'फॉर्ममधील प्रश्न (निवडण्यासाठी क्लिक करा):',
  totalQuestionsCount: (count) => `एकूण ${count} प्रश्न`,
  questionPrefix: 'प्र',
  activeQuestionPrefix: 'सक्रिय प्रश्न:',
  nextBtn: 'पुढील ->',
  speakBtn: 'ऐका',
  stopAudioBtn: 'थांबवा',
  suggestedAnswersTitle: 'सुचवलेली उत्तरे:',
  selectOptionBtn: 'निवडा',
  cancelBtn: 'रद्द करा',
  confirmFillBtn: 'नक्की करा (Confirm)',
  fillingStatus: 'भरत आहे...',
  thinkingStatus: 'विचार करत आहे...',
  chatPlaceholder: 'प्रश्न विचारा किंवा उत्तर द्या...',
  micBtn: 'माइक',
  micStopBtn: 'थांबवा',
  sendBtn: 'पाठवा',
  chipsLabel: 'सूचना:',
  chipQuestions: [
    'पुढील प्रश्न कोणता आहे?',
    'या प्रश्नाचा अर्थ स्पष्ट करा',
    'या फॉर्मचा उद्देश काय आहे?',
    'आवश्यक प्रश्न कोणते आहेत?',
  ],

  startFillingBtn: 'फॉर्म भरणे सुरू करा ->',
  questionNumber: (num) => `प्रश्न ${num}:`,
  requiredBadge: '* आवश्यक (Required)',
  agentSpeaking: 'एजंट बोलत आहे...',
  listeningTitle: 'ऐकत आहे... बोला',
  doneSpeakingBtn: 'उत्तर पूर्ण झाले (Done)',
  manualDoneBtn: 'झाले (Done) -> पुढील प्रश्न',
  allCompletedTitle: 'छान! फॉर्मचे सर्व प्रश्न पूर्ण झाले आहेत.',
  bigDataOptionsTitle: 'पर्याय तयार आहेत. फॉर्ममध्ये भरण्यासाठी निवडा:',
  fillThisOptionBtn: 'हे भरा',
  retryBtnLabel: 'पुन्हा विचारा',
  skipNextBtnLabel: 'हा प्रश्न सोडा ->',
};

const guStrings: UIStrings = {
  ...hiStrings,
  appName: 'Form Copilot',
  appSubtitle: 'Google Forms સહાયક',
  resetBtn: 'રીસેટ (Reset)',
  diagnosticsBtn: 'તપાસ (Diagnostics)',
  settingsBtn: 'સેટિંગ્સ',
  languageLabel: 'ભાષા (Language):',
  retryBtn: 'ફરી પ્રયાસ કરો (Retry)',

  scanCardTitle: 'ફોર્મ વાંચવાનું શરૂ કરો',
  scanCardDesc: 'સક્રિય Google Form સ્કેન કરવા અને AI સાથે સમજવા માટે નીચે ક્લિક કરો.',
  startScanBtn: 'શરૂ કરો (Start Scan)',
  scanningTitle: 'ફોર્મ વંચાઈ રહ્યું છે...',
  scanningDesc: 'કૃપા કરીને રાહ જુઓ...',

  formQuestionsTitle: 'ફોર્મના પ્રશ્નો (પસંદ કરવા ક્લિક કરો):',
  totalQuestionsCount: (count) => `કુલ ${count} પ્રશ્નો`,
  questionPrefix: 'પ્ર',
  activeQuestionPrefix: 'સક્રિય પ્રશ્ન:',
  nextBtn: 'આગળ ->',
  speakBtn: 'સાંભળો',
  stopAudioBtn: 'રોકો',
  suggestedAnswersTitle: 'સૂચવેલા જવાબો:',
  selectOptionBtn: 'પસંદ કરો',
  cancelBtn: 'રદ કરો',
  confirmFillBtn: 'ખાતરી કરો (Confirm)',
  chatPlaceholder: 'પ્રશ્ન પૂછો અથવા જવાબ આપો...',
  micBtn: 'માઇક',
  micStopBtn: 'રોકો',
  sendBtn: 'મોકલો',
  chipsLabel: 'સૂચનો:',
  chipQuestions: [
    'આગળનો પ્રશ્ન કયો છે?',
    'આ પ્રશ્ન સમજાવો',
    'આ ફોર્મનો હેતુ શું છે?',
    'કયા પ્રશ્નો ફરજિયાત છે?',
  ],

  startFillingBtn: 'ફોર્મ ભરવાનું શરૂ કરો ->',
  questionNumber: (num) => `પ્રશ્ન ${num}:`,
  requiredBadge: '* ફરજિયાત (Required)',
  agentSpeaking: 'એજન્ટ બોલી રહ્યો છે...',
  listeningTitle: 'સાંભળી રહ્યો છું... બોલો',
  doneSpeakingBtn: 'જવાબ પૂરો થયો (Done)',
  manualDoneBtn: 'થઈ ગયું (Done) -> આગળનો પ્રશ્ન',
  allCompletedTitle: 'સરસ! ફોર્મના બધા પ્રશ્નો પૂર્ણ થયા છે.',
  bigDataOptionsTitle: 'વિકલ્પો તૈયાર છે. પસંદ કરો:',
  fillThisOptionBtn: 'આ ભરો',
  retryBtnLabel: 'ફરી પૂછો',
  skipNextBtnLabel: 'આ પ્રશ્ન છોડો ->',
};

export function getUIStrings(langCode: string): UIStrings {
  if (langCode === 'hi-IN') return hiStrings;
  if (langCode === 'mr-IN') return mrStrings;
  if (langCode === 'gu-IN') return guStrings;
  // Default to English for en-IN, bn-IN, ta-IN, te-IN, kn-IN, etc.
  return enStrings;
}
