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

const flatten = (obj) => Object.values(obj).flat();
const HOT_ALL = flatten(HOT_KEYWORDS);
const ICE_ALL = flatten(ICE_KEYWORDS);
const LARGE_ALL = flatten(LARGE_KEYWORDS);
const PEARL_ALL = flatten(PEARL_KEYWORDS);
const WHIP_ALL = flatten(WHIP_KEYWORDS);
const BUY_ALL = flatten(BUY_ACTION_KEYWORDS);

const includesAny = (cleaned, keywords) =>
  keywords.some((w) => cleaned.includes(w.replace(/\s/g, "").toLowerCase()));

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

  const options = {
    hotIce: includesAny(cleaned, ICE_ALL) ? "ice" : includesAny(cleaned, HOT_ALL) ? "hot" : "hot",
    size: includesAny(cleaned, LARGE_ALL) ? "large" : "regular",
    topping: includesAny(cleaned, PEARL_ALL) ? "pearl" : "none",
    whip: includesAny(cleaned, WHIP_ALL) ? "add" : "none",
  };

  const wantsToBuy = includesAny(cleaned, BUY_ALL);

  return { item, options, wantsToBuy };
};
