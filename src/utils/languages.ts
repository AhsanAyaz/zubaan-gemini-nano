export type ZubaanLanguage = {
  name: string;
  code: string;
  llmModelId: string;
};

// Create an array of popular human languages with their names, ISO 639-1 codes, and LLM model IDs
export const LANGUAGES: ZubaanLanguage[] = [
  { name: "English", code: "en", llmModelId: "facebook/mms-tts-eng" },
  { name: "Swedish", code: "sv", llmModelId: "facebook/mms-tts-swe" },
  { name: "Spanish", code: "es", llmModelId: "facebook/mms-tts-spa" },
  { name: "Mandarin Chinese", code: "zh", llmModelId: "facebook/mms-tts-cmn" },
  { name: "Hindi", code: "hi", llmModelId: "facebook/mms-tts-hin" },
  { name: "French", code: "fr", llmModelId: "facebook/mms-tts-fra" },
  { name: "Arabic", code: "ar", llmModelId: "facebook/mms-tts-ara" },
  { name: "Bengali", code: "bn", llmModelId: "facebook/mms-tts-ben" },
  { name: "Portuguese", code: "pt", llmModelId: "facebook/mms-tts-por" },
  { name: "Russian", code: "ru", llmModelId: "facebook/mms-tts-rus" },
  { name: "Japanese", code: "ja", llmModelId: "facebook/mms-tts-jpn" },
  { name: "German", code: "de", llmModelId: "facebook/mms-tts-deu" },
  { name: "Korean", code: "ko", llmModelId: "facebook/mms-tts-kor" },
  { name: "Italian", code: "it", llmModelId: "facebook/mms-tts-ita" },
  { name: "Turkish", code: "tr", llmModelId: "facebook/mms-tts-tur" },
  { name: "Dutch", code: "nl", llmModelId: "facebook/mms-tts-nld" },
  { name: "Tamil", code: "ta", llmModelId: "facebook/mms-tts-tam" },
  { name: "Malayalam", code: "ml", llmModelId: "facebook/mms-tts-mal" },
  { name: "Telugu", code: "te", llmModelId: "facebook/mms-tts-tel" },
  { name: "Urdu", code: "ur", llmModelId: "facebook/mms-tts-urd" },
];
