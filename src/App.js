import { useState, useEffect } from "react";
import "./App.css";
import { CARD_LANGUAGES, SPEECH_LANG_MAP, isCardLanguage } from "./i18n/languages";
import { TRANSLATIONS } from "./i18n/translations";
import { matchVoiceCommand } from "./i18n/voiceCommands";

const TOGGLE_FEATURE_IDS = ["easy-mode", "voice", "large-text"];
const TOGGLE_FEATURE_ICONS = { "easy-mode": "🖼️", voice: "🎙️", "large-text": "🔠" };

const getCodeFromPath = () => {
  const path = window.location.pathname.replace(/^\/|\/$/g, "");
  return /^\d{6}$/.test(path) ? path : null;
};

const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage || "en";
  const langCode = browserLang.split("-")[0].toLowerCase();
  return isCardLanguage(langCode) ? langCode : "en";
};

export default function App() {
  const [connectedCode, setConnectedCode] = useState(getCodeFromPath());
  const [inputCode, setInputCode] = useState("");
  const [featureState, setFeatureState] = useState({});

  const [selectedLang, setSelectedLang] = useState(() => detectBrowserLanguage());
  const [autoDetected, setAutoDetected] = useState(true);
  const [langOpen, setLangOpen] = useState(false);

  const [listening, setListening] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const onPopState = () => setConnectedCode(getCodeFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS.en;

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 2500);
  };

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
    setToastMsg(null);
  };

  const toggleFeature = (featureId) => {
    setFeatureState((prev) => ({ ...prev, [featureId]: !prev[featureId] }));
    // socket.emit("toggle-feature", { code: connectedCode, featureId, on: !featureState[featureId] });
  };

  // 카드에서 직접 언어 선택
  const handleSelectLang = (lang) => {
    setSelectedLang(lang.id);
    setLangOpen(false);
    setAutoDetected(false);
    // socket.emit("set-language", { code: connectedCode, lang: lang.id });
  };

  // 음성으로 언어 변경 명령이 들어왔을 때 (카드에 있는 5개 언어만 지원)
  const handleVoiceLanguageChange = (langId) => {
    if (!isCardLanguage(langId)) {
      showToast(t.notRecognized);
      return;
    }
    const newT = TRANSLATIONS[langId];
    setSelectedLang(langId);
    setAutoDetected(false);
    const langInfo = CARD_LANGUAGES.find((l) => l.id === langId);
    showToast(newT.languageToast(langInfo.label));
  };

  // 음성 인식 실행
  const handleVoiceClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(t.notSupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LANG_MAP[selectedLang] || "ko-KR";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => {
      const spokenText = e.results[0][0].transcript;
      const match = matchVoiceCommand(spokenText, selectedLang);

      if (!match) {
        showToast(t.notRecognized);
        return;
      }

      if (match.type === "feature") {
        const willBeOn = !featureState[match.id];
        setFeatureState((prev) => ({ ...prev, [match.id]: willBeOn }));
        const name = t.features[match.id].title;
        showToast(willBeOn ? t.featureOnToast(name) : t.featureOffToast(name));
        // socket.emit("toggle-feature", { code: connectedCode, featureId: match.id, on: willBeOn });
      } else if (match.type === "language") {
        handleVoiceLanguageChange(match.id);
        // socket.emit("set-language", { code: connectedCode, lang: match.id });
      }
    };
    recognition.start();
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
  const currentLang = CARD_LANGUAGES.find((l) => l.id === selectedLang);

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
        {/* 언어 선택 카드 (5개 주요 언어) */}
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
              {CARD_LANGUAGES.map((lang) => (
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
          const feature = t.features[id];

          if (id === "voice") {
            return (
              <button
                key={id}
                className={`card ${listening ? "on" : ""}`}
                onClick={handleVoiceClick}
              >
                <div className="card-top">
                  <span className="icon">{TOGGLE_FEATURE_ICONS[id]}</span>
                  <span className={`switch ${listening ? "on" : ""}`}>
                    <span className="switch-knob" />
                  </span>
                </div>
                <span className="title">{feature.title}</span>
                <span className="desc">{listening ? t.listening : feature.desc}</span>
              </button>
            );
          }

          const isOn = !!featureState[id];
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

      {toastMsg && <p className="toast">{toastMsg}</p>}
    </div>
  );
}