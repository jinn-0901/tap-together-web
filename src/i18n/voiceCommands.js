// 언어별 "기능" 이름 트리거 단어
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

// 켜기/끄기 "방향"을 나타내는 단어 — 기능 이름이랑 같이 말했을 때 on/off를 직접 결정함
export const ACTION_TRIGGERS = {
  ko: {
    on: ["켜줘", "켜라", "켜", "실행해줘", "활성화"],
    off: ["꺼줘", "꺼라", "꺼", "중지해줘", "비활성화", "해제해줘"],
  },
  en: {
    on: ["turn on", "switch on", "enable"],
    off: ["turn off", "switch off", "disable"],
  },
  zh: {
    on: ["打开", "开启", "启用"],
    off: ["关闭", "关掉", "停用"],
  },
  ja: {
    on: ["オンにして", "つけて", "有効にして"],
    off: ["オフにして", "消して", "無効にして"],
  },
  vi: {
    on: ["bật"],
    off: ["tắt"],
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

// 부정 표현 — 이 단어들이 들어있으면 명령을 실행하지 않고 무시함 (의도와 반대로 실행되는 사고 방지)
const NEGATION_WORDS = {
  ko: ["하지마", "하지말고", "말고", "아니", "안돼", "말아", "지마"],
  en: ["don't", "donot", "not", "never"],
  zh: ["不要", "别", "不是"],
  ja: ["しないで", "やめて", "ではなく"],
  vi: ["đừng", "không"],
};

const containsNegation = (cleaned) => {
  for (const langKey of Object.keys(NEGATION_WORDS)) {
    if (NEGATION_WORDS[langKey].some((w) => cleaned.includes(w.replace(/\s/g, "").toLowerCase()))) {
      return true;
    }
  }
  return false;
};

// 문장 안에서 방향(켜기/끄기) 단어를 찾아냄. 없으면 null (→ 토글로 처리)
const detectAction = (cleaned) => {
  for (const langKey of Object.keys(ACTION_TRIGGERS)) {
    const { on = [], off = [] } = ACTION_TRIGGERS[langKey];
    if (on.some((w) => cleaned.includes(w.replace(/\s/g, "").toLowerCase()))) return "on";
    if (off.some((w) => cleaned.includes(w.replace(/\s/g, "").toLowerCase()))) return "off";
  }
  return null;
};

// 말한 문장을 분석해서 기능/언어 명령을 찾아냄
export const matchVoiceCommand = (spokenText) => {
  const cleaned = spokenText.replace(/\s/g, "").toLowerCase();

  // 부정 표현이 섞여 있으면 아예 실행하지 않고 "알아듣지 못함"으로 처리
  if (containsNegation(cleaned)) {
    return null;
  }

  // 1. 기능 이름부터 찾기
  let matchedFeature = null;
  for (const langKey of Object.keys(FEATURE_TRIGGERS)) {
    const featureTriggers = FEATURE_TRIGGERS[langKey];
    for (const featureId of Object.keys(featureTriggers)) {
      if (featureTriggers[featureId].some((trigger) => cleaned.includes(trigger.toLowerCase()))) {
        matchedFeature = featureId;
        break;
      }
    }
    if (matchedFeature) break;
  }

  if (matchedFeature) {
    const action = detectAction(cleaned); // "on" | "off" | null
    return { type: "feature", id: matchedFeature, action: action || "toggle" };
  }

  // 2. 언어 변경 명령 찾기
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