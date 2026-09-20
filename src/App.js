import { useState, useEffect, useRef } from "react";
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
  const [liveTranscript, setLiveTranscript] = useState("");
  const [toastMsg, setToastMsg] = useState(null);

  const matchedRef = useRef(false);
  const cancelledRef = useRef(false); // 사용자가 직접 닫기를 눌렀는지 추적
  const recognitionRef = useRef(null); // 지금 실행 중인 recognition 인스턴스

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

  const handleSelectLang = (lang) => {
    setSelectedLang(lang.id);
    setLangOpen(false);
    setAutoDetected(false);
    // socket.emit("set-language", { code: connectedCode, lang: lang.id });
  };

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

  const applyVoiceMatch = (match) => {
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

  const listenWithLangQueue = (langQueue) => {
    if (langQueue.length === 0) {
      setListening(false);
      setLiveTranscript("");
      showToast(t.notRecognized);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setListening(false);
      showToast(t.notSupported);
      return;
    }

    const [currentLangId, ...restQueue] = langQueue;
    matchedRef.current = false;

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LANG_MAP[currentLangId] || "ko-KR";
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setListening(true);
      setLiveTranscript("");
    };

    recognition.onresult = (e) => {
      let combined = "";
      for (let i = 0; i < e.results.length; i++) {
        combined += e.results[i][0].transcript;
      }
      setLiveTranscript(combined);

      const lastResult = e.results[e.results.length - 1];
      if (lastResult.isFinal) {
        const match = matchVoiceCommand(combined);
        if (match) {
          matchedRef.current = true;
          applyVoiceMatch(match);
        }
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;

      // 사용자가 직접 닫기 버튼을 눌렀으면 다음 언어로 재시도하지 않고 그냥 종료
      if (cancelledRef.current) {
        cancelledRef.current = false;
        setListening(false);
        setLiveTranscript("");
        return;
      }

      if (matchedRef.current) {
        setListening(false);
        setLiveTranscript("");
      } else {
        listenWithLangQueue(restQueue);
      }
    };

    recognition.onerror = () => {
      if (!cancelledRef.current) {
        listenWithLangQueue(restQueue);
      }
    };

    recognition.start();
  };

  const handleVoiceClick = () => {
    const otherLangs = CARD_LANGUAGES.map((l) => l.id).filter((id) => id !== selectedLang);
    listenWithLangQueue([selectedLang, ...otherLangs]);
  };

  // 오버레이의 닫기(✕) 버튼: 지금 듣고 있는 걸 바로 중단
  const handleCancelVoice = () => {
    cancelledRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.abort(); // stop()보다 abort()가 즉시 중단됨
    } else {
      setListening(false);
      setLiveTranscript("");
    }
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
        {/* 언어 선택 카드 */}
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

        {/* 음성 인식 카드 */}
        <button
          className={`card voice-card ${listening ? "on" : ""}`}
          onClick={handleVoiceClick}
          disabled={listening}
        >
          <div className="card-top">
            <span className={`icon ${listening ? "pulse" : ""}`}>{TOGGLE_FEATURE_ICONS.voice}</span>
          </div>
          <span className="title">{t.features.voice.title}</span>
          <span className="desc">{listening ? t.listening : t.features.voice.desc}</span>
        </button>

        {/* 나머지 on/off 기능들 */}
        {TOGGLE_FEATURE_IDS.filter((id) => id !== "voice").map((id) => {
          const feature = t.features[id];
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

      {/* 듣고 있는 동안 뜨는 오버레이 */}
      {listening && (
        <div className="voice-overlay">
          <div className="voice-box">
            <button className="voice-close-btn" onClick={handleCancelVoice} aria-label="close">
              ✕
            </button>
            <span className="mic-pulse">🎙️</span>
            <p className="voice-listening-text">{t.listening}</p>
            <p className="voice-transcript">{liveTranscript || "..."}</p>
          </div>
        </div>
      )}

      {toastMsg && <p className="toast">{toastMsg}</p>}
    </div>
  );
}