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
    on: [
      "켜줘", "켜라", "켜", "켜죠", "켜봐", "켜주세요", "켜줄래", "켜줄래요",
      "실행해줘", "실행해", "실행해주세요",
      "활성화", "활성화해줘", "활성화해", "활성화시켜줘",
      "적용해줘", "적용해", "적용해주세요",
      "사용할래", "사용할게", "사용해줘", "사용해",
      "써줘", "써볼래", "이용할게",
      "온해줘", "온시켜줘",
    ],
    off: [
      "꺼줘", "꺼라", "꺼", "꺼죠", "꺼봐", "꺼주세요", "꺼줄래", "꺼줄래요",
      "중지해줘", "중지해", "중지해주세요",
      "비활성화", "비활성화해줘", "비활성화해", "비활성화시켜줘",
      "해제해줘", "해제해", "해제해주세요",
      "그만사용", "그만써", "안쓸래", "안쓸게",
      "종료해줘", "종료해",
      "오프해줘", "오프시켜줘",
    ],
  },
  en: {
    on: [
      "turn on", "turnon", "switch on", "switchon", "enable", "enabled",
      "activate", "activateit", "start", "startit",
      "use it", "useit", "please turn on", "canyouturnon",
      "i want it on", "makeiton", "setitto on",
    ],
    off: [
      "turn off", "turnoff", "switch off", "switchoff", "disable", "disabled",
      "deactivate", "deactivateit", "stop", "stopit",
      "no more", "nomore", "please turn off", "canyouturnoff",
      "i want it off", "makeitoff", "setitto off",
    ],
  },
  zh: {
    on: [
      "打开", "开启", "启用", "开一下", "开个",
      "打开一下", "帮我打开", "麻烦打开", "请打开",
      "启动", "启动一下",
    ],
    off: [
      "关闭", "关掉", "停用", "关一下", "关个",
      "关闭一下", "帮我关闭", "麻烦关闭", "请关闭",
      "停止", "停止一下",
    ],
  },
  ja: {
    on: [
      "オンにして", "つけて", "有効にして", "オンして",
      "起動して", "起動させて", "使いたい", "使います",
      "お願いオン", "つけてください",
    ],
    off: [
      "オフにして", "消して", "無効にして", "オフして",
      "停止して", "止めて", "使わない", "使いません",
      "お願いオフ", "消してください",
    ],
  },
  vi: {
    on: [
      "bật", "bậtlên", "bậtnó", "bậtgiúp", "làmơnbật",
      "kíchhoạt", "mởlên", "mởgiúp",
    ],
    off: [
      "tắt", "tắtđi", "tắtnó", "tắtgiúp", "làmơntắt",
      "vôhiệuhóa", "đóng", "đónggiúp",
    ],
  },
};

// 언어별로 "이 언어로 바꿔줘"라고 말했을 때 인식할 단어들 (5개 카드 언어끼리만 전환 가능)
export const LANGUAGE_TRIGGERS = {
  ko: {
    ko: ["한국어", "한글", "국어"],
    en: ["영어", "잉글리시"],
    zh: ["중국어", "중문", "차이니즈"],
    ja: ["일본어", "일어", "재패니즈"],
    vi: ["베트남어", "베트남말"],
  },
  en: {
    ko: ["korean"],
    en: ["english"],
    zh: ["chinese", "mandarin"],
    ja: ["japanese"],
    vi: ["vietnamese"],
  },
  zh: {
    ko: ["韩语", "韩国语", "韩文"],
    en: ["英语", "英文"],
    zh: ["中文", "汉语", "普通话"],
    ja: ["日语", "日文"],
    vi: ["越南语", "越南文"],
  },
  ja: {
    ko: ["韓国語", "ハングル"],
    en: ["英語"],
    zh: ["中国語", "中国語"],
    ja: ["日本語"],
    vi: ["ベトナム語"],
  },
  vi: {
    ko: ["tiếnghàn", "tiếnghànquốc"],
    en: ["tiếnganh"],
    zh: ["tiếngtrung", "tiếngtrungquốc"],
    ja: ["tiếngnhật"],
    vi: ["tiếngviệt"],
  },
};

// "~말고", "~아니고" 등 "이건 아니고 이거"라는 뜻의 연결어
const CUT_MARKERS = {
  ko: [
    "말고", "하지말고", "아니고", "대신",
    "않고", "않고서", "안하고", "안 하고",
    "말구", "말라구", "말라고",
    "가아니라", "이아니라", "게아니라", "게아니고",
    "거말고", "거아니고", "말구서",
    "가말고", "이말고",
  ],
  en: [
    "insteadof", "instead", "not",
    "don't", "donot", "doesn't", "doesnot",
    "ratherthan", "butnot", "asopposedto",
    "nott", "butinstead",
  ],
  zh: [
    "而不是", "别", "不要", "不是",
    "不用", "无需", "不需要",
    "而非", "并非",
  ],
  ja: [
    "ではなく", "じゃなくて", "ではなくて",
    "じゃなく", "ではない",
    "でなく", "じゃない",
  ],
  vi: [
    "chứkhông", "khôngphải", "màkhông",
    "khôngcần", "thayvì",
    "chứđừng", "màđừng",
  ],
};

const keepLastClause = (cleaned) => {
  let result = cleaned;
  let cutFound = false;

  for (const langKey of Object.keys(CUT_MARKERS)) {
    for (const marker of CUT_MARKERS[langKey]) {
      const markerCleaned = marker.replace(/\s/g, "").toLowerCase();
      const idx = result.lastIndexOf(markerCleaned);
      if (idx !== -1) {
        result = result.slice(idx + markerCleaned.length);
        cutFound = true;
      }
    }
  }

  return { text: result, cutFound };
};

// "~하지 마", "~됐어", "~필요없어" 처럼 순수하게 거부/취소의 뜻으로 끝나는 표현
const PURE_NEGATION_SUFFIXES = {
  ko: [
    "하지마", "하지마세요", "하지말아줘", "하지말아주세요", "하지말아라", "하지마십시오",
    "지마", "지마세요", "지말아줘", "지말아주세요",
    "안돼", "안돼요", "안되", "안됨", "안된다",
    "말아", "말아줘", "말아주세요",
    "노노", "안할래", "안할게", "안할거야",
    "취소", "취소해줘", "취소해", "취소할게",
    "됐어", "됐어요", "됐다", "필요없어", "필요없어요",
    "그만해", "그만둬", "냅둬", "놔둬",
    "됐고", "안해도돼", "안해도됨",
    "원치않아", "원하지않아", "싫어", "싫어요",
  ],
  en: [
    "don'tdoit", "donotdoit", "donot", "never",
    "stopit", "cancel", "nope", "no",
    "nothanks", "nah", "skip", "skipit",
    "forgetit", "leaveit", "notinterested",
    "idontwantthat", "cancelthat", "neveremind",
    "noneedto", "noneed",
  ],
  zh: [
    "不要", "别", "不用", "取消",
    "不行", "不可以", "别这样",
    "算了", "不用了", "免了", "不必",
    "省了", "不需要了", "不用管",
  ],
  ja: [
    "しないで", "やめて", "だめ", "だめです",
    "キャンセル", "いらない", "けっこうです",
    "結構です", "いいです", "無理",
    "遠慮します", "やめとく", "やめとくわ",
    "やめときます",
  ],
  vi: [
    "đừng", "đừnglàm", "khônglàm",
    "hủy", "thôi", "khôngcần",
    "khôngmuốn", "bỏqua", "thôikhỏi",
    "khôngcầnđâu", "thôiđi",
  ],
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

  const { text: cleaned, cutFound } = keepLastClause(original);

  if (endsWithPureNegation(cleaned)) {
    return null;
  }

  if (cutFound && cleaned.length === 0) {
    return null;
  }

  const excludedLangIds = new Set();
  if (cutFound) {
    const beforePart = original.slice(0, original.length - cleaned.length);
    for (const langKey of Object.keys(LANGUAGE_TRIGGERS)) {
      const langTriggers = LANGUAGE_TRIGGERS[langKey];
      for (const targetLangId of Object.keys(langTriggers)) {
        if (langTriggers[targetLangId].some((trigger) => beforePart.includes(trigger.toLowerCase()))) {
          excludedLangIds.add(targetLangId);
        }
      }
    }
  }

  // 기능 이름 찾기
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
    const action = detectAction(cleaned);
    return { type: "feature", id: matchedFeature, action: action || "toggle" };
  }

  // 언어 변경 명령 찾기 — 블랙리스트에 있는 언어는 건너뜀
  for (const langKey of Object.keys(LANGUAGE_TRIGGERS)) {
    const langTriggers = LANGUAGE_TRIGGERS[langKey];
    for (const targetLangId of Object.keys(langTriggers)) {
      if (excludedLangIds.has(targetLangId)) continue;
      if (langTriggers[targetLangId].some((trigger) => cleaned.includes(trigger.toLowerCase()))) {
        return { type: "language", id: targetLangId };
      }
    }
  }

  return null;
};