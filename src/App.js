import { useState, useEffect } from "react";
import "./App.css";

const LANGUAGES = [
  { id: "ko", label: "한국어", flag: "🇰🇷" },
  { id: "en", label: "English", flag: "🇺🇸" },
  { id: "zh", label: "中文", flag: "🇨🇳" },
  { id: "ja", label: "日本語", flag: "🇯🇵" },
  { id: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
];

// 언어별 화면 텍스트
const TRANSLATIONS = {
  ko: {
    pageTitle: "키오스크 원격 제어",
    connectDesc: "키오스크 화면에 표시된 6자리 코드를 입력해주세요",
    codePlaceholder: "예: 482913",
    connectBtn: "연결",
    headerDesc: "기능을 눌러서 켜고 끄거나, 언어를 선택하세요",
    connectedLabel: "연결됨",
    disconnectBtn: "연결 해제",
    langTitle: "언어 선택",
    langDefaultDesc: "원하는 언어로 화면을 바꿔요",
    selectedSuffix: "선택됨",
    autoDetectedSuffix: "(자동 감지)",
    on: "켜짐",
    off: "꺼짐",
    features: {
      "easy-mode": { title: "쉬운 화면 모드", desc: "그림을 크게 보여주고 안내 그림을 추가해요" },
      voice: { title: "음성 인식", desc: "말로 키오스크를 조작할 수 있어요" },
      "large-text": { title: "큰 글자", desc: "글씨 크기를 크게 키워요" },
    },
  },
  en: {
    pageTitle: "Kiosk Remote Control",
    connectDesc: "Enter the 6-digit code shown on the kiosk screen",
    codePlaceholder: "e.g. 482913",
    connectBtn: "Connect",
    headerDesc: "Tap a feature to turn it on or off, or choose a language",
    connectedLabel: "Connected",
    disconnectBtn: "Disconnect",
    langTitle: "Language",
    langDefaultDesc: "Change the screen to your preferred language",
    selectedSuffix: "selected",
    autoDetectedSuffix: "(auto-detected)",
    on: "On",
    off: "Off",
    features: {
      "easy-mode": { title: "Easy Screen Mode", desc: "Shows larger images and helpful pictures" },
      voice: { title: "Voice Recognition", desc: "Control the kiosk by speaking" },
      "large-text": { title: "Large Text", desc: "Makes the text bigger" },
    },
  },
  zh: {
    pageTitle: "自助终端远程控制",
    connectDesc: "请输入自助终端屏幕上显示的6位数代码",
    codePlaceholder: "例如：482913",
    connectBtn: "连接",
    headerDesc: "点击功能即可开启或关闭，或选择语言",
    connectedLabel: "已连接",
    disconnectBtn: "断开连接",
    langTitle: "语言选择",
    langDefaultDesc: "将屏幕切换为您想要的语言",
    selectedSuffix: "已选择",
    autoDetectedSuffix: "（自动检测）",
    on: "开启",
    off: "关闭",
    features: {
      "easy-mode": { title: "简易屏幕模式", desc: "放大图片并添加引导图示" },
      voice: { title: "语音识别", desc: "可以用语音操作自助终端" },
      "large-text": { title: "大字体", desc: "放大文字大小" },
    },
  },
  ja: {
    pageTitle: "キオスク遠隔操作",
    connectDesc: "キオスク画面に表示された6桁のコードを入力してください",
    codePlaceholder: "例：482913",
    connectBtn: "接続",
    headerDesc: "機能をタップしてオン/オフを切り替えるか、言語を選択してください",
    connectedLabel: "接続済み",
    disconnectBtn: "接続解除",
    langTitle: "言語選択",
    langDefaultDesc: "画面を希望の言語に変更します",
    selectedSuffix: "選択済み",
    autoDetectedSuffix: "（自動検出）",
    on: "オン",
    off: "オフ",
    features: {
      "easy-mode": { title: "かんたん画面モード", desc: "絵を大きく表示し、案内図を追加します" },
      voice: { title: "音声認識", desc: "話しかけてキオスクを操作できます" },
      "large-text": { title: "大きな文字", desc: "文字サイズを大きくします" },
    },
  },
  vi: {
    pageTitle: "Điều khiển từ xa Kiosk",
    connectDesc: "Nhập mã 6 chữ số hiển thị trên màn hình kiosk",
    codePlaceholder: "VD: 482913",
    connectBtn: "Kết nối",
    headerDesc: "Nhấn để bật/tắt tính năng, hoặc chọn ngôn ngữ",
    connectedLabel: "Đã kết nối",
    disconnectBtn: "Ngắt kết nối",
    langTitle: "Chọn ngôn ngữ",
    langDefaultDesc: "Thay đổi màn hình sang ngôn ngữ bạn muốn",
    selectedSuffix: "đã chọn",
    autoDetectedSuffix: "(tự động phát hiện)",
    on: "Bật",
    off: "Tắt",
    features: {
      "easy-mode": { title: "Chế độ màn hình dễ dùng", desc: "Hiển thị hình ảnh lớn hơn và thêm hình minh họa" },
      voice: { title: "Nhận diện giọng nói", desc: "Điều khiển kiosk bằng giọng nói" },
      "large-text": { title: "Chữ lớn", desc: "Phóng to cỡ chữ" },
    },
  },
};

const TOGGLE_FEATURE_IDS = ["easy-mode", "voice", "large-text"];
const TOGGLE_FEATURE_ICONS = {
  "easy-mode": "🖼️",
  voice: "🎙️",
  "large-text": "🔠",
};

// 경로에서 코드 부분만 추출 (예: "/482913" → "482913")
const getCodeFromPath = () => {
  const path = window.location.pathname.replace(/^\/|\/$/g, "");
  return /^\d{6}$/.test(path) ? path : null;
};

// 브라우저 언어 코드(예: "ko-KR", "en-US")를 우리가 쓰는 id로 변환
const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage || "en";
  const langCode = browserLang.split("-")[0].toLowerCase();

  const matched = LANGUAGES.find((l) => l.id === langCode);
  return matched ? matched.id : "en"; // 지원 안 하는 언어면 영어로 기본값
};

export default function App() {
  const [connectedCode, setConnectedCode] = useState(getCodeFromPath());
  const [inputCode, setInputCode] = useState("");
  const [featureState, setFeatureState] = useState({});

  const [selectedLang, setSelectedLang] = useState(() => detectBrowserLanguage());
  const [autoDetected, setAutoDetected] = useState(true);
  const [langOpen, setLangOpen] = useState(false);

  // 브라우저 뒤로가기/앞으로가기 대응
  useEffect(() => {
    const onPopState = () => setConnectedCode(getCodeFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS.en;

  // 언어가 바뀔 때마다 브라우저 탭 제목(html의 <title>)도 같이 갱신
  useEffect(() => {
    document.title = t.pageTitle;
    console.log("탭 제목 갱신 시도:", t.pageTitle);
  }, [t.pageTitle]);

  const handleCodeChange = (e) => {
    const onlyDigits = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setInputCode(onlyDigits);
  };

  const handleConnect = () => {
    if (inputCode.length !== 6) return;
    window.history.pushState({}, "", `/${inputCode}`);
    setConnectedCode(inputCode);
  };

  const handleDisconnect = () => {
    window.history.pushState({}, "", "/");
    setConnectedCode(null);
    setInputCode("");
    setFeatureState({});
    setLangOpen(false);
  };

  const toggleFeature = (featureId) => {
    setFeatureState((prev) => ({ ...prev, [featureId]: !prev[featureId] }));
    // socket.emit("toggle-feature", { code: connectedCode, featureId, on: !featureState[featureId] });
  };

  const handleSelectLang = (lang) => {
    setSelectedLang(lang.id);
    setLangOpen(false);
    setAutoDetected(false);
    // socket.emit("set-language", { code: connectedCode, lang: lang.id });
  };

  // ── 코드 없음: 입력 화면 ──
  if (!connectedCode) {
    return (
      <div className="page center">
        <div className="connect-card">
          <h1>{t.pageTitle}</h1>
          <p>{t.connectDesc}</p>

          <div className="connect-box">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder={t.codePlaceholder}
              value={inputCode}
              onChange={handleCodeChange}
              autoFocus
            />
            <button className="connect-btn" onClick={handleConnect} disabled={inputCode.length !== 6}>
              {t.connectBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 코드 있음: 기능 버튼 화면 ──
  const currentLang = LANGUAGES.find((l) => l.id === selectedLang);

  return (
    <div className="page">
      <header className="header">
        <h1>{t.pageTitle}</h1>
        <p>{t.headerDesc}</p>
        <span className="status on">🟢 {t.connectedLabel} · {connectedCode}</span>
        <button className="disconnect-btn" onClick={handleDisconnect}>
          {t.disconnectBtn}
        </button>
      </header>

      <main className="grid">
        {/* 언어 선택 카드 (드롭다운) */}
        <div className={`card lang-card ${langOpen ? "expanded" : ""}`}>
          <button className="lang-header" onClick={() => setLangOpen((prev) => !prev)}>
            <div className="card-top">
              <span className="icon">🌐</span>
              <span className={`chevron ${langOpen ? "up" : ""}`}>⌄</span>
            </div>
            <span className="title">{t.langTitle}</span>
            <span className="desc">
              {currentLang
                ? `${currentLang.flag} ${currentLang.label} ${t.selectedSuffix}${
                    autoDetected && !langOpen ? ` ${t.autoDetectedSuffix}` : ""
                  }`
                : t.langDefaultDesc}
            </span>
          </button>

          {langOpen && (
            <div className="lang-options">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  className={`lang-option ${selectedLang === lang.id ? "selected" : ""}`}
                  onClick={() => handleSelectLang(lang)}
                >
                  <span className="lang-flag">{lang.flag}</span>
                  <span className="lang-label">{lang.label}</span>
                  {selectedLang === lang.id && <span className="lang-check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 나머지 on/off 기능들 */}
        {TOGGLE_FEATURE_IDS.map((id) => {
          const isOn = !!featureState[id];
          const feature = t.features[id];
          return (
            <button
              key={id}
              className={`card ${isOn ? "on" : ""}`}
              onClick={() => toggleFeature(id)}
            >
              <div className="card-top">
                <span className="icon">{TOGGLE_FEATURE_ICONS[id]}</span>
                <span className={`switch ${isOn ? "on" : ""}`}>
                  <span className="switch-knob" />
                </span>
              </div>
              <span className="title">{feature.title}</span>
              <span className="desc">{feature.desc}</span>
              <span className={`state-label ${isOn ? "on" : "off"}`}>{isOn ? t.on : t.off}</span>
            </button>
          );
        })}
      </main>
    </div>
  );
}