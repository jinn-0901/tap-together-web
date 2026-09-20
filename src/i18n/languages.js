// 화면에 카드로 선택할 수 있는 언어 (5개)
export const CARD_LANGUAGES = [
  { id: "ko", label: "한국어", flag: "🇰🇷" },
  { id: "en", label: "English", flag: "🇺🇸" },
  { id: "zh", label: "中文", flag: "🇨🇳" },
  { id: "ja", label: "日本語", flag: "🇯🇵" },
  { id: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
];

// 카드 언어 id → 음성 인식 엔진이 쓰는 언어 코드
export const SPEECH_LANG_MAP = {
  ko: "ko-KR",
  en: "en-US",
  zh: "zh-CN",
  ja: "ja-JP",
  vi: "vi-VN",
};

export const isCardLanguage = (id) => CARD_LANGUAGES.some((l) => l.id === id);