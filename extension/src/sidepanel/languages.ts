// extension/src/sidepanel/languages.ts: Multilingual definitions for speech, TTS, STT, and prompting
export interface LanguageOption {
  code: string;
  name: string;
  nativeLabel: string;
  greeting: string;
  fillingPrompt: string;
  manualPrompt: (title: string, typeDesc: string) => string;
  doneConfirmation: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en-IN',
    name: 'English',
    nativeLabel: 'English',
    greeting:
      "Hi! I'm Form Copilot, your form assistant. How may I assist you today? You can ask any question about this form, or say 'move to form filling' whenever you are ready to start filling.",
    fillingPrompt: 'Move to form filling (Start Filling)',
    manualPrompt: (title: string, typeDesc: string) =>
      `Question: "${title}". This is a ${typeDesc} field. Please select or fill it directly in the form yourself, then say 'Done' or click the Done button to move to the next question.`,
    doneConfirmation: 'Great! Moving to the next question.',
  },
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeLabel: 'हिंदी (Hindi)',
    greeting:
      "नमस्ते! मैं Form Copilot हूँ, आपका फ़ॉर्म सहायक। मैं आपकी किस प्रकार सहायता कर सकता हूँ? आप फ़ॉर्म के बारे में कोई भी प्रश्न पूछ सकते हैं, या सीधे फ़ॉर्म भरने के लिए 'फ़ॉर्म भरना शुरू करें' कहें।",
    fillingPrompt: 'फ़ॉर्म भरना शुरू करें (Start Filling)',
    manualPrompt: (title: string, typeDesc: string) =>
      `प्रश्न: "${title}"। यह ${typeDesc} फ़ील्ड है। कृपया इसे फ़ॉर्म में स्वयं चुनें, और अगला सवाल देखने के लिए 'हो गया' (Done) कहें या 'हो गया' बटन दबाएं।`,
    doneConfirmation: 'बहुत बढ़िया! अगले प्रश्न पर चलते हैं।',
  },
  {
    code: 'mr-IN',
    name: 'Marathi',
    nativeLabel: 'मराठी (Marathi)',
    greeting:
      "नमस्कार! मी Form Copilot आहे, तुमचा फॉर्म सहाय्यक. मी तुम्हाला कशी मदत करू शकेन? फॉर्मबद्दल काहीही विचारा किंवा फॉर्म भरण्यासाठी 'फॉर्म भरणे सुरू करा' म्हणा.",
    fillingPrompt: 'फॉर्म भरणे सुरू करा (Start Filling)',
    manualPrompt: (title: string, typeDesc: string) =>
      `प्रश्न: "${title}". हा ${typeDesc} फील्ड आहे. कृपया फॉर्ममध्ये स्वतः निवडा, आणि पुढील प्रश्नासाठी 'झाले' (Done) म्हणा किंवा बटन दाबा.`,
    doneConfirmation: 'खूप छान! पुढील प्रश्नाकडे वळूया.',
  },
  {
    code: 'gu-IN',
    name: 'Gujarati',
    nativeLabel: 'ગુજરાતી (Gujarati)',
    greeting:
      "નમસ્તે! હું Form Copilot છું, તમારો ફોર્મ સહાયક. હું તમને કેવી રીતે મદદ કરી શકું? તમે ફોર્મ વિશે કંઈ પણ પૂછી શકો છો, અથવા 'ફોર્મ ભરવાનું શરૂ કરો' કહી શકો છો.",
    fillingPrompt: 'ફોર્મ ભરવાનું શરૂ કરો (Start Filling)',
    manualPrompt: (title: string, typeDesc: string) =>
      `પ્રશ્ન: "${title}". આ ${typeDesc} ફીલ્ડ છે. કૃપા કરીને ફોર્મમાં જાતે પસંદ કરો, અને આગળ વધવા માટે 'થઈ ગયું' (Done) કહો અથવા બટન દબાવો.`,
    doneConfirmation: 'ખૂબ સરસ! ચાલો આગળના પ્રશ્ન પર જઈએ.',
  },
  {
    code: 'bn-IN',
    name: 'Bengali',
    nativeLabel: 'বাংলা (Bengali)',
    greeting:
      "নমস্কার! আমি Form Copilot, আপনার ফর্ম সহকারী। আমি আপনাকে কীভাবে সাহায্য করতে পারি? ফর্ম সম্পর্কে যেকোনো প্রশ্ন করতে পারেন, বা ফর্ম পূরণের জন্য 'ফর্ম পূরণ শুরু করুন' বলুন।",
    fillingPrompt: 'ফর্ম পূরণ শুরু করুন (Start Filling)',
    manualPrompt: (title: string, typeDesc: string) =>
      `প্রশ্ন: "${title}"। এটি একটি ${typeDesc} ফিল্ড। দয়া করে ফর্মে নিজে নির্বাচন করুন, তারপর 'হয়ে গেছে' (Done) বলুন বা বোতাম টিপুন।`,
    doneConfirmation: 'খুব ভালো! পরবর্তী প্রশ্নে চলে যাচ্ছি।',
  },
  {
    code: 'ta-IN',
    name: 'Tamil',
    nativeLabel: 'தமிழ் (Tamil)',
    greeting:
      "வணக்கம்! நான் Form Copilot, உங்கள் படிவ உதவியாளர். நான் உங்களுக்கு எவ்வாறு உதவ முடியும்? படிவம் பற்றி ஏதேனும் கேள்வி கேட்கலாம் அல்லது 'படிவத்தை நிரப்பத் தொடங்கு' என்று கூறலாம்.",
    fillingPrompt: 'படிவத்தை நிரப்பத் தொடங்கு (Start Filling)',
    manualPrompt: (title: string, typeDesc: string) =>
      `கேள்வி: "${title}". இது ஒரு ${typeDesc} புலம். படிவத்தில் நீங்களே தேர்ந்தெடுக்கவும், பின்னர் அடுத்த கேள்விக்குச் செல்ல 'முடிந்தது' (Done) என்று கூறவும்.`,
    doneConfirmation: 'மிகவும் நன்று! அடுத்த கேள்விக்குச் செல்லலாம்.',
  },
  {
    code: 'te-IN',
    name: 'Telugu',
    nativeLabel: 'తెలుగు (Telugu)',
    greeting:
      "నమస్కారం! నేను Form Copilot, మీ ఫారం సహాయకుడిని. నేను మీకు ఎలా సహాయపడగలను? ఫారం గురించి ఏదైనా ప్రశ్న అడగండి లేదా ఫారం పూరించడానికి 'ఫారమ్ నింపడం ప్రారంభించండి' అని చెప్పండి.",
    fillingPrompt: 'ఫారమ్ నింపడం ప్రారంభించండి (Start Filling)',
    manualPrompt: (title: string, typeDesc: string) =>
      `ప్రశ్న: "${title}". ఇది ${typeDesc} ఫీల్డ్. దయచేసి ఫారంలో మీరే ఎంచుకోండి, ఆపై 'పూర్తయింది' (Done) అని చెప్పండి లేదా బటన్ క్లిక్ చేయండి.`,
    doneConfirmation: 'చాలా మంచిది! తదుపరి ప్రశ్నకు వెళ్దాం.',
  },
  {
    code: 'kn-IN',
    name: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ (Kannada)',
    greeting:
      "ನಮಸ್ಕಾರ! ನಾನು Form Copilot, ನಿಮ್ಮ ಫಾರ್ಮ್ ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ? ಫಾರ್ಮ್ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ ಅಥವಾ 'ಫಾರ್ಮ್ ತುಂಬಲು ಪ್ರಾರಂಭಿಸಿ' ಎಂದು ಹೇಳಿ.",
    fillingPrompt: 'ಫಾರ್ಮ್ ತುಂಬಲು ಪ್ರಾರಂಭಿಸಿ (Start Filling)',
    manualPrompt: (title: string, typeDesc: string) =>
      `ಪ್ರಶ್ನೆ: "${title}". ಇದು ${typeDesc} ಕ್ಷೇತ್ರ. ದಯವಿಟ್ಟು ಫಾರ್ಮ್‌ನಲ್ಲಿ ನೀವೇ ಆಯ್ಕೆಮಾಡಿ, ನಂತರ 'ಮುಗಿಯಿತು' (Done) ಎಂದು ಹೇಳಿ ಅಥವಾ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.`,
    doneConfirmation: 'ಉತ್ತಮ! ಮುಂದಿನ ಪ್ರಶ್ನೆಗೆ ಹೋಗೋಣ.',
  },
];

export function getLanguage(code: string): LanguageOption {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
}
