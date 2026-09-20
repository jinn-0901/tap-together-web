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

// "~말고", "~하지 말고", "~아니고" 처럼 "이건 아니고 이거"라는 뜻의 연결어
// 이 단어들을 기준으로 문장을 나누면, 마지막 조각이 화자가 진짜 원하는 명령일 확률이 높음
const CUT_MARKERS = {
  ko: ["말고", "하지말고", "아니고", "대신", "않고", "않고서"],
  en: ["instead of", "not", "don't", "do not"],
  zh: ["而不是", "别", "不要"],
  ja: ["ではなく", "じゃなくて"],
  vi: ["chứkhông", "khôngphải"],
};

// 문장을 CUT_MARKERS 기준으로 자르고, 마지막 조각만 남김 (진짜 하려는 말)
// 자를 지점이 없으면 원문 그대로 반환
const keepLastClause = (cleaned) => {
  let result = cleaned;
  let cutFound = false;

  for (const langKey of Object.keys(CUT_MARKERS)) {
    for (const marker of CUT_MARKERS[langKey]) {
      const markerCleaned = marker.replace(/\s/g, "").toLowerCase();
      const idx = result.lastIndexOf(markerCleaned); // 여러 번 나오면 제일 마지막 것 기준
      if (idx !== -1) {
        result = result.slice(idx + markerCleaned.length);
        cutFound = true;
      }
    }
  }

  return { text: result, cutFound };
};

// "~하지 마", "~지 마", "~안 돼", "~말아" 처럼 순수하게 "하지 말라"는 뜻으로 끝나는 표현
// 이 표현이 (자르고 남은) 문장에 있으면, 그 문장 자체가 "하지 말라"는 뜻이므로 명령을 실행하면 안 됨
const PURE_NEGATION_SUFFIXES = {
  ko: ["하지마", "지마", "안돼", "말아", "마세요", "말아주세요"],
  en: ["don'tdoit", "donot", "never"],
  zh: ["不要", "别"],
  ja: ["しないで", "やめて"],
  vi: ["đừng"],
};

const endsWithPureNegation = (cleaned) => {
  for (const langKey of Object.keys(PURE_NEGATION_SUFFIXES)) {
    if (PURE_NEGATION_SUFFIXES[langKey].some((suffix) => cleaned.includes(suffix))) {
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
  const original = spokenText.replace(/\s/g, "").toLowerCase();

  // 1. "~말고", "~아니고" 같은 연결어가 있으면, 그 뒤에 나온 마지막 조각만 실제 명령으로 봄
  //    예: "영어로 바꾸지 말고 한국어로 바꿔줘" → "한국어로바꿔줘"만 남김
  const { text: cleaned, cutFound } = keepLastClause(original);

  // 2. 자르고 남은 문장 자체가 "~하지 마" 류로 끝나면, 그 자체가 거부/취소 의미이므로 아무 것도 실행 안 함
  //    예: "한국어로 바꾸지 마" (연결어 없음, 원문 전체가 부정형) → 무시
  //    예: "고대비 켜지 말고 끄지 마" (마지막 조각도 부정형) → 무시
  if (endsWithPureNegation(cleaned)) {
    return null;
  }

  // 3. 연결어로 잘라냈는데 남은 조각이 텅 비어있으면(예: "~말고"로 문장이 끝난 경우) 실행할 게 없음
  if (cutFound && cleaned.length === 0) {
    return null;
  }

  // 4. 기능 이름 찾기
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

  // 5. 언어 변경 명령 찾기
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