import { useState, useEffect, useRef } from "react";
import "./App.css";
import { CARD_LANGUAGES, SPEECH_LANG_MAP, isCardLanguage } from "./i18n/languages";
import { TRANSLATIONS } from "./i18n/translations";
import { matchVoiceCommand } from "./i18n/voiceCommands";

const TOGGLE_FEATURE_IDS = ["easy-mode", "voice", "large-text", "high-contrast", "voice-guide"];
const TOGGLE_FEATURE_ICONS = {
  "easy-mode": "🖼️",
  voice: "🎙️",
  "large-text": "🔠",
  "high-contrast": "🌓",
  "voice-guide": "🔊",
};

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

  const [volume, setVolume] = useState(0.8);

  const matchedRef = useRef(false);
  const cancelledRef = useRef(false);
  const recognitionRef = useRef(null);
  const lastErrorRef = useRef(null);
  const voiceGuideRef = useRef(false);
  const volumeRef = useRef(0.8);

  useEffect(() => {
    const onPopState = () => setConnectedCode(getCodeFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // 탭이 백그라운드로 가면 듣기 중단 (브라우저가 백그라운드 탭 마이크를 끊어버려서 방치하면 오작동함)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && recognitionRef.current) {
        cancelledRef.current = true;
        recognitionRef.current.abort();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS.en;

  useEffect(() => {
    voiceGuideRef.current = !!featureState["voice-guide"];
  }, [featureState]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // 음성 안내가 켜져 있으면 브라우저 TTS로 읽어줌. langId를 넘기면 그 언어 발음으로 읽음
  const speak = (text, langId) => {
    if (!voiceGuideRef.current) return;
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG_MAP[langId || selectedLang] || "ko-KR";
    utterance.volume = volumeRef.current;
    window.speechSynthesis.speak(utterance);
  };

  const showToast = (message, langId) => {
    setToastMsg(message);
    speak(message, langId);
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
    const willBeOn = !featureState[featureId];
    setFeatureState((prev) => ({ ...prev, [featureId]: willBeOn }));
    const name = t.features[featureId].title;
    showToast(willBeOn ? t.featureOnToast(name) : t.featureOffToast(name));
    // socket.emit("toggle-feature", { code: connectedCode, featureId, on: willBeOn });
  };

  // 카드로 직접 언어 선택 — 음성 안내도 같이 읽어줌 (새 언어 발음으로)
  const handleSelectLang = (lang) => {
    const newT = TRANSLATIONS[lang.id];
    setSelectedLang(lang.id);
    setLangOpen(false);
    setAutoDetected(false);
    showToast(newT.languageToast(lang.label), lang.id);
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
    showToast(newT.languageToast(langInfo.label), langId);
    // socket.emit("set-language", { code: connectedCode, lang: langId });
  };

  const applyVoiceMatch = (match) => {
    if (match.type === "feature") {
      let willBeOn;
      if (match.action === "on") willBeOn = true;
      else if (match.action === "off") willBeOn = false;
      else willBeOn = !featureState[match.id]; // 방향 단어가 없었으면 토글

      setFeatureState((prev) => ({ ...prev, [match.id]: willBeOn }));
      const name = t.features[match.id].title;
      showToast(willBeOn ? t.featureOnToast(name) : t.featureOffToast(name));
      // socket.emit("toggle-feature", { code: connectedCode, featureId: match.id, on: willBeOn });
    } else if (match.type === "language") {
      handleVoiceLanguageChange(match.id);
    }
  };

  // 감지된(현재 선택된) 언어 하나로만 듣기 — 더 이상 여러 언어를 순서대로 재시도하지 않음
  const handleVoiceClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(t.notSupported);
      return;
    }

    matchedRef.current = false;
    lastErrorRef.current = null;
    cancelledRef.current = false;

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LANG_MAP[selectedLang] || "ko-KR";
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

    recognition.onerror = (e) => {
      lastErrorRef.current = e.error;
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setLiveTranscript("");

      if (cancelledRef.current) {
        cancelledRef.current = false;
        lastErrorRef.current = null;
        return;
      }

      if (matchedRef.current) {
        lastErrorRef.current = null;
        return;
      }

      // 마이크 권한/하드웨어 문제는 별도 안내, 그 외는 "알아듣지 못함"
      if (
        lastErrorRef.current === "not-allowed" ||
        lastErrorRef.current === "audio-capture" ||
        lastErrorRef.current === "service-not-allowed"
      ) {
        showToast(t.notSupported);
      } else {
        showToast(t.notRecognized);
      }
      lastErrorRef.current = null;
    };

    recognition.start();
  };

  const handleCancelVoice = () => {
    cancelledRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.abort();
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
  const isVoiceGuideOn = !!featureState["voice-guide"];

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

        {/* 음성 안내 카드 (켜지면 음량 슬라이더가 같이 나타남) */}
        <div className={`card ${isVoiceGuideOn ? "on" : ""}`}>
          <button className="voice-guide-toggle" onClick={() => toggleFeature("voice-guide")}>
            <div className="card-top">
              <span className="icon">{TOGGLE_FEATURE_ICONS["voice-guide"]}</span>
              <span className={`switch ${isVoiceGuideOn ? "on" : ""}`}>
                <span className="switch-knob" />
              </span>
            </div>
            <span className="title">{t.features["voice-guide"].title}</span>
            <span className="desc">{t.features["voice-guide"].desc}</span>
            <span className={`state-label ${isVoiceGuideOn ? "on" : "off"}`}>
              {isVoiceGuideOn ? t.on : t.off}
            </span>
          </button>

          {isVoiceGuideOn && (
            <div className="volume-row" onClick={(e) => e.stopPropagation()}>
              <span className="volume-icon">🔉</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label={t.volumeLabel}
              />
              <span className="volume-value">{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>

        {/* 나머지 on/off 기능들 (쉬운 화면, 큰 글자, 고대비) */}
        {TOGGLE_FEATURE_IDS.filter((id) => id !== "voice" && id !== "voice-guide").map((id) => {
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