export const FEATURE_TRIGGERS = {
  ko: {
    "easy-mode": ["쉬운화면", "쉬운모드", "그림모드"],
    "large-text": ["큰글자", "글자크게", "폰트크게"],
    "high-contrast": ["고대비", "명암대비", "대비모드"],
    "voice-guide": ["음성안내", "소리안내"],
  },
  en: {
    "easy-mode": ["easymode", "easyscreen"],
    "large-text": ["largetext", "bigtext", "biggerfont"],
    "high-contrast": ["highcontrast", "contrastmode"],
    "voice-guide": ["voiceguide", "audioguide"],
  },
  zh: {
    "easy-mode": ["简易模式", "简易屏幕"],
    "large-text": ["大字体", "字体放大"],
    "high-contrast": ["高对比度", "对比度模式"],
    "voice-guide": ["语音导览", "语音引导"],
  },
  ja: {
    "easy-mode": ["かんたんモード", "かんたん画面"],
    "large-text": ["大きな文字", "文字を大きく"],
    "high-contrast": ["高コントラスト", "コントラストモード"],
    "voice-guide": ["音声ガイド", "音声案内"],
  },
  vi: {
    "easy-mode": ["chếđộdễdùng", "mànhìnhdễdùng"],
    "large-text": ["chữlớn", "phóngtochữ"],
    "high-contrast": ["tươngphảncao", "chếđộtươngphản"],
    "voice-guide": ["hướngdẫngiọngnói", "hướngdẫnâmthanh"],
  },
};

export const LANGUAGE_TRIGGERS = {
  ko: { ko: ["한국어"], en: ["영어"], zh: ["중국어", "중문"], ja: ["일본어", "일어"], vi: ["베트남어"] },
  en: { ko: ["korean"], en: ["english"], zh: ["chinese"], ja: ["japanese"], vi: ["vietnamese"] },
  zh: { ko: ["韩语", "韩国语"], en: ["英语"], zh: ["中文"], ja: ["日语"], vi: ["越南语"] },
  ja: { ko: ["韓国語"], en: ["英語"], zh: ["中国語"], ja: ["日本語"], vi: ["ベトナム語"] },
  vi: { ko: ["tiếnghàn"], en: ["tiếnganh"], zh: ["tiếngtrung"], ja: ["tiếngnhật"], vi: ["tiếngviệt"] },
};

export const matchVoiceCommand = (spokenText) => {
  const cleaned = spokenText.replace(/\s/g, "").toLowerCase();

  for (const langKey of Object.keys(FEATURE_TRIGGERS)) {
    const featureTriggers = FEATURE_TRIGGERS[langKey];
    for (const featureId of Object.keys(featureTriggers)) {
      if (featureTriggers[featureId].some((trigger) => cleaned.includes(trigger.toLowerCase()))) {
        return { type: "feature", id: featureId };
      }
    }
  }

  for (const langKey of Object.keys(LANGUAGE_TRIGGERS)) {
    const langTriggers = LANGUAGE_TRIGGERS[langKey];
    for (const targetLangId of Object.keys(langTriggers)) {
      if (langTriggers[targetLangId].some((trigger) => cleaned.includes(trigger.toLowerCase()))) {
        return { type: "language", id: targetLangId };
      }
    }
  }

  return null;
};