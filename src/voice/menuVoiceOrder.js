export const KIOSK_SPEECH_LANG_MAP = { ko: "ko-KR", en: "en-US", zh: "zh-CN", ja: "ja-JP", vi: "vi-VN" };

const HOT_KEYWORDS = {
  ko: ["따뜻하게", "따뜻한걸로", "뜨겁게", "핫으로", "핫"],
  en: ["hot"],
  zh: ["热的", "热"],
  ja: ["ホットで", "ホット", "温かく"],
  vi: ["nóng"],
};

const ICE_KEYWORDS = {
  ko: ["차갑게", "차가운걸로", "시원하게", "아이스로", "아이스"],
  en: ["ice", "iced", "cold"],
  zh: ["冰的", "冰"],
  ja: ["アイスで", "アイス", "冷たく"],
  vi: ["đá", "lạnh"],
};

const LARGE_KEYWORDS = {
  ko: ["라지로", "라지", "크게", "큰사이즈로", "큰걸로"],
  en: ["large"],
  zh: ["大杯", "大的"],
  ja: ["ラージで", "ラージ", "大きいサイズ"],
  vi: ["lớn"],
};

const PEARL_KEYWORDS = {
  ko: ["펄추가", "펄넣어", "펄"],
  en: ["pearl"],
  zh: ["珍珠"],
  ja: ["パール追加", "パール"],
  vi: ["trân châu"],
};

const WHIP_KEYWORDS = {
  ko: ["휘핑추가", "휘핑크림", "휘핑넣어", "휘핑"],
  en: ["whip", "whippedcream"],
  zh: ["鲜奶油"],
  ja: ["ホイップ追加", "ホイップ"],
  vi: ["kemtươi"],
};

const BUY_ACTION_KEYWORDS = {
  ko: ["사줘", "사주세요", "구매해줘", "구매할게", "구매할래", "주문해줘", "주문할게", "담아줘", "줘"],
  en: ["buyit", "buythis", "orderit", "getme", "iwant", "givemethat"],
  zh: ["买", "购买", "帮我买", "下单"],
  ja: ["買って", "注文して", "お願いします"],
  vi: ["muagiúp", "muacho", "đặtgiúp"],
};

// "이건 빼줘", "~없이", "~말고" 등 방금 말한 옵션을 취소/거부하는 뜻의 표현.
// 옵션 키워드 바로 뒤에 이 중 하나가 붙어서 나오면(예: "휘핑빼고") 그 옵션은 "원함"이 아니라
// "명시적으로 거부함"으로 처리함 — 훼이크(부정 표현)에 낚이지 않기 위한 최소한의 일반 규칙.
const NEGATION_KEYWORDS = {
  ko: ["빼고", "빼줘", "빼주세요", "빼", "말고", "안넣고", "안넣어줘", "없이", "없게", "제외하고", "넣지말고", "넣지마"],
  en: ["without", "no", "not", "remove", "skip", "dontwant"],
  zh: ["不要", "去掉", "不加", "别加", "无"],
  ja: ["抜いて", "なしで", "入れないで", "いらない", "除いて"],
  vi: ["khôngcần", "bỏ", "không", "loạibỏ"],
};

const flatten = (obj) => Object.values(obj).flat();
const cleanWord = (w) => w.replace(/\s/g, "").toLowerCase();

const HOT_ALL = flatten(HOT_KEYWORDS).map(cleanWord);
const ICE_ALL = flatten(ICE_KEYWORDS).map(cleanWord);
const LARGE_ALL = flatten(LARGE_KEYWORDS).map(cleanWord);
const PEARL_ALL = flatten(PEARL_KEYWORDS).map(cleanWord);
const WHIP_ALL = flatten(WHIP_KEYWORDS).map(cleanWord);
const BUY_ALL = flatten(BUY_ACTION_KEYWORDS).map(cleanWord);
const NEGATION_ALL = flatten(NEGATION_KEYWORDS).map(cleanWord);

// 문장 안에서 keywords 중 하나가 있는지 찾고, 있다면 그 바로 뒤에 부정 표현이
// 붙어있는지 확인해서 세 가지 상태로 돌려줌:
//   true  → 언급됐고, 부정되지 않음 (원함)
//   false → 언급됐지만, 바로 뒤에 부정 표현이 붙음 (명시적으로 거부함)
//   null  → 아예 언급 안 됨
const NEGATION_WINDOW = 10; // 옵션 단어 바로 뒤 몇 글자 안에서만 부정 표현을 찾음 (문장 전체를 뒤지지 않음)

const resolveMention = (cleaned, keywords) => {
  for (const kw of keywords) {
    const idx = cleaned.indexOf(kw);
    if (idx === -1) continue;
    // "휘핑을 빼주세요"처럼 조사("을/를")가 하나 끼는 경우까지 잡히도록 startsWith가 아닌
    // includes로 확인 (그래도 문장 전체가 아니라 바로 뒤 몇 글자 안으로 범위를 좁혀서 확인함)
    const after = cleaned.slice(idx + kw.length, idx + kw.length + NEGATION_WINDOW);
    const negated = NEGATION_ALL.some((neg) => after.includes(neg));
    return negated ? false : true;
  }
  return null;
};

const includesAny = (cleaned, keywords) => keywords.some((w) => cleaned.includes(w));

export const NOT_FOUND_MESSAGES = {
  ko: "메뉴를 찾지 못했어요",
  en: "Menu not found",
  zh: "未找到菜单",
  ja: "メニューが見つかりません",
  vi: "Không tìm thấy menu",
};

export const findMenuByVoice = (spokenText, t) => {
  const cleaned = spokenText.replace(/\s/g, "").toLowerCase();
  const ids = Object.keys(t.menu).sort((a, b) => t.menu[b].length - t.menu[a].length);
  const matchedId = ids.find((id) => cleaned.includes(t.menu[id].replace(/\s/g, "").toLowerCase()));
  return matchedId ? { id: matchedId } : null;
};

export const parseVoiceOrder = (spokenText, t) => {
  const cleaned = spokenText.replace(/\s/g, "").toLowerCase();
  const item = findMenuByVoice(spokenText, t);
  if (!item) return null;

  const hotMention = resolveMention(cleaned, HOT_ALL);
  const iceMention = resolveMention(cleaned, ICE_ALL);
  const largeMention = resolveMention(cleaned, LARGE_ALL);
  const pearlMention = resolveMention(cleaned, PEARL_ALL);
  const whipMention = resolveMention(cleaned, WHIP_ALL);

  // hotIce는 기본값이 "hot"이라, 상대(아이스)가 명시적으로 거부됐을 때도 hot으로 확정해줌
  let hotIce = "hot";
  if (iceMention === true) hotIce = "ice";
  else if (hotMention === true) hotIce = "hot";
  else if (hotMention === false) hotIce = "ice"; // "핫말고" → 아이스
  else if (iceMention === false) hotIce = "hot"; // "아이스빼고" → 핫

  const options = {
    hotIce,
    size: largeMention === true ? "large" : "regular",
    topping: pearlMention === true ? "pearl" : "none",
    whip: whipMention === true ? "add" : "none",
  };

  const wantsToBuy = includesAny(cleaned, BUY_ALL);

  return { item, options, wantsToBuy };
};
