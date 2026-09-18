import { useState, useEffect } from "react";
import "./App.css";

const LANGUAGES = [
  { id: "ko", label: "한국어", flag: "🇰🇷" },
  { id: "en", label: "English", flag: "🇺🇸" },
  { id: "zh", label: "中文", flag: "🇨🇳" },
  { id: "ja", label: "日本語", flag: "🇯🇵" },
  { id: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
];

const TOGGLE_FEATURES = [
  { id: "easy-mode", title: "쉬운 화면 모드", desc: "그림을 크게 보여주고 안내 그림을 추가해요", icon: "🖼️" },
  { id: "voice", title: "음성 인식", desc: "말로 키오스크를 조작할 수 있어요", icon: "🎙️" },
  { id: "large-text", title: "큰 글자", desc: "글씨 크기를 크게 키워요", icon: "🔠" },
];

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
  const [selectedLang, setSelectedLang] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  // 브라우저 뒤로가기/앞으로가기 대응
  useEffect(() => {
    const onPopState = () => setConnectedCode(getCodeFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // 처음 렌더링될 때 딱 한 번만 브라우저 언어 자동 감지
  useEffect(() => {
    const detected = detectBrowserLanguage();
    setSelectedLang(detected);
    setAutoDetected(true);
    // socket.emit("set-language", { code: connectedCode, lang: detected });
  }, []);

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

  const toggleFeature = (feature) => {
    setFeatureState((prev) => ({ ...prev, [feature.id]: !prev[feature.id] }));
    // socket.emit("toggle-feature", { code: connectedCode, featureId: feature.id, on: !featureState[feature.id] });
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
          <h1>키오스크 원격 제어</h1>
          <p>키오스크 화면에 표시된 6자리 코드를 입력해주세요</p>

          <div className="connect-box">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="예: 482913"
              value={inputCode}
              onChange={handleCodeChange}
              autoFocus
            />
            <button className="connect-btn" onClick={handleConnect} disabled={inputCode.length !== 6}>
              연결
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
        <h1>키오스크 원격 제어</h1>
        <p>기능을 눌러서 켜고 끄거나, 언어를 선택하세요</p>
        <span className="status on">🟢 연결됨 · {connectedCode}</span>
        <button className="disconnect-btn" onClick={handleDisconnect}>
          연결 해제
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
            <span className="title">언어 선택</span>
            <span className="desc">
              {currentLang
                ? `${currentLang.flag} ${currentLang.label} 선택됨${autoDetected && !langOpen ? " (자동 감지)" : ""}`
                : "원하는 언어로 화면을 바꿔요"}
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
        {TOGGLE_FEATURES.map((f) => {
          const isOn = !!featureState[f.id];
          return (
            <button
              key={f.id}
              className={`card ${isOn ? "on" : ""}`}
              onClick={() => toggleFeature(f)}
            >
              <div className="card-top">
                <span className="icon">{f.icon}</span>
                <span className={`switch ${isOn ? "on" : ""}`}>
                  <span className="switch-knob" />
                </span>
              </div>
              <span className="title">{f.title}</span>
              <span className="desc">{f.desc}</span>
              <span className={`state-label ${isOn ? "on" : "off"}`}>{isOn ? "켜짐" : "꺼짐"}</span>
            </button>
          );
        })}
      </main>
    </div>
  );
}