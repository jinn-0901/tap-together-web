// 언어별 "기능 켜줘/꺼줘" 트리거 단어
export const FEATURE_TRIGGERS = {
  ko: {
    "easy-mode": ["쉬운화면", "쉬운모드", "그림모드"],
    "large-text": ["큰글자", "글자크게", "폰트크게"],
  },
  en: {
    "easy-mode": ["easymode", "easyscreen"],
    "large-text": ["largetext", "bigtext", "biggerfont"],
  },
  zh: {
    "easy-mode": ["简易模式", "简易屏幕"],
    "large-text": ["大字体", "字体放大"],
  },
  ja: {
    "easy-mode": ["かんたんモード", "かんたん画面"],
    "large-text": ["大きな文字", "文字を大きく"],
  },
  vi: {
    "easy-mode": ["chếđộdễdùng", "mànhìnhdễdùng"],
    "large-text": ["chữlớn", "phóngtochữ"],
  },
};

// 언어별로 "이 언어로 바꿔줘"라고 말했을 때 인식할 단어들 (5개 카드 언어끼리만 전환 가능)
export const LANGUAGE_TRIGGERS = {
  ko: { ko: ["한국어"], en: ["영어"], zh: ["중국어", "중문"], ja: ["일본어", "일어"], vi: ["베트남어"] },
  en: { ko: ["korean"], en: ["english"], zh: ["chinese"], ja: ["japanese"], vi: ["vietnamese"] },
  zh: { ko: ["韩语", "韩国语"], en: ["英语"], zh: ["中文"], ja: ["日语"], vi: ["越南语"] },
  ja: { ko: ["韓国語"], en: ["英語"], zh: ["中国語"], ja: ["日本語"], vi: ["ベトナム語"] },
  vi: { ko: ["tiếnghàn"], en: ["tiếnganh"], zh: ["tiếngtrung"], ja: ["tiếngnhật"], vi: ["tiếngviệt"] },
};

// 말한 문장을 분석해서 기능/언어 명령을 찾아냄
// 못 찾으면 null 반환 (App.js에서 "알아듣지 못했어요"로 예외 처리)
export const matchVoiceCommand = (spokenText, currentLangKey) => {
  const cleaned = spokenText.replace(/\s/g, "").toLowerCase();

  const featureTriggers = FEATURE_TRIGGERS[currentLangKey] || FEATURE_TRIGGERS.en;
  for (const featureId of Object.keys(featureTriggers)) {
    if (featureTriggers[featureId].some((trigger) => cleaned.includes(trigger.toLowerCase()))) {
      return { type: "feature", id: featureId };
    }
  }

  const langTriggers = LANGUAGE_TRIGGERS[currentLangKey] || LANGUAGE_TRIGGERS.en;
  for (const langId of Object.keys(langTriggers)) {
    if (langTriggers[langId].some((trigger) => cleaned.includes(trigger.toLowerCase()))) {
      return { type: "language", id: langId };
    }
  }

  return null;
};