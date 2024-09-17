import { LANGUAGES, ZubaanLanguage } from "./languages";

const STORAGE_KEYS = {
  zbn_src_lang: "Zubaan Source Language",
  zbn_target_lang: "Zubaan Target Language",
};

export const getSavedLanguages = () => {
  const srcLangFromStorage = localStorage.getItem(STORAGE_KEYS.zbn_src_lang);
  const targetLangFromStorage = localStorage.getItem(
    STORAGE_KEYS.zbn_target_lang,
  );
  const sourceLanguage = srcLangFromStorage
    ? (JSON.parse(srcLangFromStorage) as ZubaanLanguage)
    : LANGUAGES[0];
  const targetLanguage = targetLangFromStorage
    ? (JSON.parse(targetLangFromStorage) as ZubaanLanguage)
    : LANGUAGES[1];
  return {
    sourceLanguage,
    targetLanguage,
  };
};

export const saveSrcLanguage = (srcLang: ZubaanLanguage) => {
  localStorage.setItem(STORAGE_KEYS.zbn_src_lang, JSON.stringify(srcLang));
};

export const saveTargetLanguage = (targetLang: ZubaanLanguage) => {
  localStorage.setItem(
    STORAGE_KEYS.zbn_target_lang,
    JSON.stringify(targetLang),
  );
};
