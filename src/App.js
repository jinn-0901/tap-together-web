import { useState, useEffect, useRef } from "react";
import "./App.css";
import { CARD_LANGUAGES, SPEECH_LANG_MAP, isCardLanguage } from "./i18n/languages";
import { matchVoiceCommand } from "./voice/voiceCommands";
import { parseVoiceOrder, NOT_FOUND_MESSAGES } from "./voice/menuVoiceOrder";
import { CATEGORIES, MENU, WHIP_AVAILABLE_IDS, FIXED_ICE_IDS, DEFAULT_OPTIONS, computeUnitPrice, getMenuImageUrl } from "./data/menu";
import { io } from "socket.io-client";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:4000";
const socket = io(SERVER_URL);

const TOGGLE_FEATURE_IDS = ["easy-mode", "voice", "large-text", "high-contrast", "voice-guide"];
const TOGGLE_FEATURE_ICONS = {
  "easy-mode": "🖼️",
  voice: "🎙️",
  "large-text": "🔠",
  "high-contrast": "🌓",
  "voice-guide": "🔊",
};

const STORAGE_KEY = "kiosk-remote-settings";

const ERROR_CODE_KEY_MAP = {
  INVALID_CODE_FORMAT: "errorInvalidFormat",
  CODE_NOT_FOUND: "errorCodeNotFound",
  ALREADY_CONNECTED: "errorAlreadyConnected",
  TOO_MANY_ATTEMPTS: "errorTooManyAttempts",
};

const getCodeFromPath = () => {
  const path = window.location.pathname.replace(/^\/|\/$/g, "");
  return /^\d{6}$/.test(path) ? path : null;
};

const getIsSharedFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("shared") === "1";
};

const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage || "en";
  const langCode = browserLang.split("-")[0].toLowerCase();
  return isCardLanguage(langCode) ? langCode : "en";
};

const loadSavedSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    return null;
  }
};

const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    // 조용히 무시
  }
};

const format = (template, vars) =>
  (template || "").replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ""));

const FALLBACK_LOADING_TEXT = "Loading...";

const buildDefaultFeatureState = (saved) => {
  const base = { "voice-guide": true };
  return saved ? { ...base, ...saved } : base;
};

export default function App() {
  const urlCode = getCodeFromPath();
  const urlIsShared = getIsSharedFromUrl();

  const [translationsData, setTranslationsData] = useState(null);

  const [connectedCode, setConnectedCode] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [inputCode, setInputCode] = useState("");
  const [connecting, setConnecting] = useState(!!urlCode);
  const [connectError, setConnectError] = useState(null);

  const [remoteCart, setRemoteCart] = useState([]);
  const [shareCopied, setShareCopied] = useState(false);
  const [showDineTypeChoice, setShowDineTypeChoice] = useState(false);

  const savedSettings = useRef(loadSavedSettings()).current;

  const [featureState, setFeatureState] = useState(buildDefaultFeatureState(savedSettings?.featureState));
  const [selectedLang, setSelectedLang] = useState(
    savedSettings?.selectedLang || detectBrowserLanguage()
  );
  const [autoDetected, setAutoDetected] = useState(!savedSettings?.selectedLang);
  const [langOpen, setLangOpen] = useState(false);

  const [listening, setListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [toastMsg, setToastMsg] = useState(null);

  const [volume, setVolume] = useState(savedSettings?.volume ?? 0.8);

  const [orderCategory, setOrderCategory] = useState("coffee");
  const [orderOptionsFor, setOrderOptionsFor] = useState(null);
  const [orderDraftOptions, setOrderDraftOptions] = useState(DEFAULT_OPTIONS);

  const matchedRef = useRef(false);
  const cancelledRef = useRef(false);
  const recognitionRef = useRef(null);
  const lastErrorRef = useRef(null);
  const voiceGuideRef = useRef(true);
  const volumeRef = useRef(savedSettings?.volume ?? 0.8);
  const pendingCodeRef = useRef(null);
  const connectedCodeRef = useRef(null);
  const selectedLangRef = useRef(selectedLang);
  const tRef = useRef(null);

  useEffect(() => {
    fetch(`${SERVER_URL}/translations/web`)
      .then((res) => res.json())
      .then((data) => setTranslationsData(data))
      .catch(() => setTranslationsData(null));
  }, []);

  useEffect(() => {
    connectedCodeRef.current = connectedCode;
  }, [connectedCode]);

  useEffect(() => {
    selectedLangRef.current = selectedLang;
  }, [selectedLang]);

  useEffect(() => {
    const onPopState = () => {
      const code = getCodeFromPath();
      if (!code) {
        setConnectedCode(null);
        setConnecting(false);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (connectedCodeRef.current) {
        socket.emit("leave-room", connectedCodeRef.current);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const onJoined = ({ code, role }) => {
      if (pendingCodeRef.current !== code) return;
      setConnectedCode(code);
      setMyRole(role);
      setConnecting(false);
      setConnectError(null);
      window.history.pushState({}, "", role === "shared" ? `/${code}?shared=1` : `/${code}`);
      socket.emit("set-language", { code, lang: selectedLangRef.current });
    };

    const onJoinError = (errorCode) => {
      setConnecting(false);
      const key = ERROR_CODE_KEY_MAP[errorCode];
      const currentT = tRef.current;
      setConnectError(key && currentT ? currentT[key] : errorCode);
      setConnectedCode(null);
      window.history.pushState({}, "", "/");
    };

    const onKioskLeft = () => {
      setConnectedCode(null);
      setMyRole(null);
      setConnecting(false);
      setInputCode("");
      setRemoteCart([]);
      window.history.pushState({}, "", "/");
    };

    const onKioskCodeChanged = ({ code }) => {
      setConnectedCode(code);
      window.history.pushState({}, "", `/${code}`);
    };

    const onKioskActivity = ({ message, langId }) => {
      speak(message, langId);
    };

    const onCartStateUpdated = ({ cart }) => {
      setRemoteCart(cart);
    };

    socket.on("joined", onJoined);
    socket.on("join-error", onJoinError);
    socket.on("kiosk-left", onKioskLeft);
    socket.on("kiosk-code-changed", onKioskCodeChanged);
    socket.on("kiosk-activity", onKioskActivity);
    socket.on("cart-state-updated", onCartStateUpdated);

    return () => {
      socket.off("joined", onJoined);
      socket.off("join-error", onJoinError);
      socket.off("kiosk-left", onKioskLeft);
      socket.off("kiosk-code-changed", onKioskCodeChanged);
      socket.off("kiosk-activity", onKioskActivity);
      socket.off("cart-state-updated", onCartStateUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (urlCode) {
      pendingCodeRef.current = urlCode;
      socket.emit("join-room", urlCode, urlIsShared);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCode]);

  const t = translationsData ? translationsData[selectedLang] || translationsData.en : null;

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    voiceGuideRef.current = !!featureState["voice-guide"];
  }, [featureState]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    saveSettings({ featureState, selectedLang, volume });
  }, [featureState, selectedLang, volume]);

  const speak = (text, langId) => {
    if (!voiceGuideRef.current) return;
    if (!window.speechSynthesis) return;

    // 클릭(사용자 제스처) 직후 바로 재생해야 함 — setTimeout 등으로 지연시키면
    // 일부 모바일 브라우저(특히 iOS Safari)가 사용자 제스처로 인정하지 않아서
    // 조용히 재생을 막아버림. cancel()은 동기 호출이라 바로 이어서 speak해도 안전함.
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

  const showToastVisualOnly = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleCodeChange = (e) => {
    const onlyDigits = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setInputCode(onlyDigits);
    setConnectError(null);
  };

  const handleConnect = () => {
    if (inputCode.length !== 6) return;
    setConnecting(true);
    setConnectError(null);
    pendingCodeRef.current = inputCode;
    socket.emit("join-room", inputCode, false);
  };

  const handleDisconnect = () => {
    if (connectedCode) {
      socket.emit("leave-room", connectedCode);
    }
    window.history.pushState({}, "", "/");
    setConnectedCode(null);
    setMyRole(null);
    setInputCode("");
    setConnecting(false);
    setConnectError(null);
    setLangOpen(false);
    setToastMsg(null);
    setRemoteCart([]);
    pendingCodeRef.current = null;
  };

  const handleShare = async () => {
    if (!connectedCode) return;
    const shareUrl = `${window.location.origin}/${connectedCode}?shared=1`;

    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl, title: t.pageTitle });
      } catch (err) {
        // 취소 등은 조용히 무시
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      showToast(shareUrl);
    }
  };

  const toggleFeature = (featureId) => {
    const willBeOn = !featureState[featureId];
    setFeatureState((prev) => ({ ...prev, [featureId]: willBeOn }));
    const name = t.features[featureId].title;
    showToast(willBeOn ? format(t.featureOnToast, { name }) : format(t.featureOffToast, { name }));
    socket.emit("toggle-feature", { code: connectedCode, featureId, on: willBeOn });
  };

  const handleSelectLang = (lang) => {
    const newT = translationsData[lang.id];
    setSelectedLang(lang.id);
    setLangOpen(false);
    setAutoDetected(false);
    showToast(format(newT.languageToast, { name: lang.label }), lang.id);
    socket.emit("set-language", { code: connectedCode, lang: lang.id });
  };

  const handleVoiceLanguageChange = (langId) => {
    if (!isCardLanguage(langId)) {
      showToast(t.notRecognized);
      return;
    }
    const newT = translationsData[langId];
    setSelectedLang(langId);
    setAutoDetected(false);
    const langInfo = CARD_LANGUAGES.find((l) => l.id === langId);
    showToast(format(newT.languageToast, { name: langInfo.label }), langId);
    socket.emit("set-language", { code: connectedCode, lang: langId });
  };

  const applyVoiceMatch = (match) => {
    if (match.type === "feature") {
      let willBeOn;
      if (match.action === "on") willBeOn = true;
      else if (match.action === "off") willBeOn = false;
      else willBeOn = !featureState[match.id];

      setFeatureState((prev) => ({ ...prev, [match.id]: willBeOn }));
      const name = t.features[match.id].title;
      showToast(willBeOn ? format(t.featureOnToast, { name }) : format(t.featureOffToast, { name }));
      socket.emit("toggle-feature", { code: connectedCode, featureId: match.id, on: willBeOn });
    } else if (match.type === "language") {
      handleVoiceLanguageChange(match.id);
    }
  };

  const tryHandleMenuOrder = (spokenText) => {
    if (!t || !t.menu || !connectedCode) return false;

    const parsed = parseVoiceOrder(spokenText, t);
    if (!parsed) return false;

    const { item, options, wantsToBuy } = parsed;
    socket.emit("remote-voice-order", {
      code: connectedCode,
      itemId: item.id,
      options,
      wantsToBuy,
    });
    showToastVisualOnly(`${t.menu[item.id]} ${wantsToBuy ? "🛒" : ""}`);
    return true;
  };

  const handleVoiceClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(t.notSupported);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    matchedRef.current = false;
    lastErrorRef.current = null;
    cancelledRef.current = false;

    const recognition = new SpeechRecognition();

    const browserLangCode = (navigator.language || "en").split("-")[0].toLowerCase();
    const speechLangId = isCardLanguage(browserLangCode) ? browserLangCode : "en";
    recognition.lang = SPEECH_LANG_MAP[speechLangId] || "en-US";

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
          return;
        }

        if (tryHandleMenuOrder(combined)) {
          matchedRef.current = true;
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

      if (
        lastErrorRef.current === "not-allowed" ||
        lastErrorRef.current === "audio-capture" ||
        lastErrorRef.current === "service-not-allowed"
      ) {
        showToast(t.notSupported);
      } else {
        showToast(NOT_FOUND_MESSAGES[selectedLang] || t.notRecognized);
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

  const openOrderOptions = (item) => {
    setOrderOptionsFor(item);
    setOrderDraftOptions(DEFAULT_OPTIONS);
    speak(t.menu[item.id]);
  };

  const closeOrderOptions = () => setOrderOptionsFor(null);

  const confirmOrder = () => {
    if (!orderOptionsFor || !connectedCode) return;
    socket.emit("remote-menu-order", {
      code: connectedCode,
      itemId: orderOptionsFor.id,
      options: orderDraftOptions,
    });
    showToastVisualOnly(`${t.menu[orderOptionsFor.id]} ${t.addToCartBtn}`);
    closeOrderOptions();
  };

  const changeRemoteQty = (cartId, delta) => {
    if (!connectedCode) return;
    socket.emit("remote-change-qty", { code: connectedCode, cartId, delta });
  };

  const removeRemoteItem = (cartId) => {
    if (!connectedCode) return;
    socket.emit("remote-remove-item", { code: connectedCode, cartId });
  };

  const clearRemoteCart = () => {
    if (!connectedCode) return;
    socket.emit("remote-clear-cart", connectedCode);
  };

  const handleRemoteCheckout = () => {
    if (!connectedCode) return;
    setShowDineTypeChoice(true);
  };

  const confirmRemoteCheckout = (dineType) => {
    socket.emit("remote-checkout-request", { code: connectedCode, dineType });
    setShowDineTypeChoice(false);
    showToastVisualOnly(t.remoteCheckoutToast);
  };

  const isLargeText = !!featureState["large-text"];
  const isHighContrast = !!featureState["high-contrast"];
  const pageClass = `page ${isLargeText ? "large" : ""} ${isHighContrast ? "high-contrast" : ""}`.trim();

  if (!t) {
    return (
      <div className={`${pageClass} center`}>
        <div className="connect-card">
          <p>{FALLBACK_LOADING_TEXT}</p>
        </div>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className={`${pageClass} center`}>
        <div className="connect-card">
          <h1>{t.pageTitle}</h1>
          <p>{t.connectingLabel}</p>
        </div>
      </div>
    );
  }

  if (!connectedCode) {
    return (
      <div className={`${pageClass} center`}>
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

          {connectError && <p className="connect-error">{connectError}</p>}
        </div>
      </div>
    );
  }

  const currentLang = CARD_LANGUAGES.find((l) => l.id === selectedLang);
  const isVoiceGuideOn = !!featureState["voice-guide"];
  const isEasyMode = !!featureState["easy-mode"];
  const filteredOrderMenu = MENU.filter((item) => item.category === orderCategory);
  const isOrderWhipAvailable = orderOptionsFor ? WHIP_AVAILABLE_IDS.includes(orderOptionsFor.id) : false;
  const isOrderHotIceAvailable = orderOptionsFor ? !FIXED_ICE_IDS.includes(orderOptionsFor.id) : false;
  const hasMenuData = !!t.menu;
  const remoteTotalCount = remoteCart.reduce((s, c) => s + c.qty, 0);
  const remoteTotalPrice = remoteCart.reduce((s, c) => s + c.unitPrice * c.qty, 0);

  return (
    <div className={pageClass}>
      <header className="header">
        <h1>{t.pageTitle}</h1>
        <p>{t.headerDesc}</p>
        <span className="status on">🟢 {t.connectedLabel} · {connectedCode}</span>
        {myRole === "shared" && <span className="status shared-badge">{t.sharedParticipantBadge}</span>}
        <button className="disconnect-btn" onClick={handleDisconnect}>
          {t.disconnectBtn}
        </button>
        {myRole === "direct" && (
          <button className="share-btn" onClick={handleShare}>
            {shareCopied ? "✅" : "🔗"}
          </button>
        )}
      </header>

      {hasMenuData && (
        <section className="order-section">
          <h2 className="order-section-title">🍽️ {t.orderSectionTitle}</h2>
          <div className="order-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`order-tab ${orderCategory === cat ? "active" : ""}`}
                onClick={() => setOrderCategory(cat)}
              >
                {t.categories[cat]}
              </button>
            ))}
          </div>
          <div className="order-menu-grid">
            {filteredOrderMenu.map((item) => (
              <button
                key={item.id}
                className={`order-menu-item ${isEasyMode ? "easy" : ""}`}
                onClick={() => openOrderOptions(item)}
              >
                {isEasyMode ? (
                  <span className="order-menu-photo-wrap">
                    <img
                      className="order-menu-photo"
                      src={getMenuImageUrl(SERVER_URL, item.id)}
                      alt={t.menu[item.id]}
                      onError={(e) => {
                        e.target.parentElement.style.display = "none";
                        e.target.parentElement.nextSibling.style.display = "block";
                      }}
                    />
                  </span>
                ) : null}
                <span className="order-menu-icon" style={isEasyMode ? { display: "none" } : undefined}>
                  {item.icon}
                </span>
                <span className="order-menu-name">{t.menu[item.id]}</span>
                <span className="order-menu-price">{item.price.toLocaleString()}원~</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {hasMenuData && (
        <section className="remote-cart-panel">
          <div className="cart-header">
            <h2>{t.cartTitle} <span className="cart-badge">{remoteTotalCount}</span></h2>
            {remoteCart.length > 0 && (
              <button className="clear-btn" onClick={clearRemoteCart}>{t.clearBtn}</button>
            )}
          </div>

          {remoteCart.length === 0 ? (
            <p className="cart-empty">{t.cartEmpty}</p>
          ) : (
            <>
              <div className="cart-list">
                {remoteCart.map((c) => {
                  const menuItem = MENU.find((m) => m.id === c.id);
                  const parts = [];
                  if (!FIXED_ICE_IDS.includes(c.id)) parts.push(c.options.hotIce === "hot" ? t.hotOption : t.iceOption);
                  if (c.options.size === "large") parts.push(t.sizeLarge.replace(/\s*\(.*\)/, ""));
                  if (c.options.whip === "add") parts.push(t.whipAdd.replace(/\s*\(.*\)/, ""));
                  if (c.options.topping === "pearl") parts.push(t.toppingPearl.replace(/\s*\(.*\)/, ""));
                  const summary = parts.join(" · ");

                  return (
                    <div key={c.cartId} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-icon">{menuItem?.icon}</span>
                        <div>
                          <p className="cart-item-name">{t.menu[c.id]}</p>
                          {summary && <p className="cart-item-options">{summary}</p>}
                          <p className="cart-item-price">{c.unitPrice.toLocaleString()}원</p>
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <div className="qty-controls">
                          <button onClick={() => changeRemoteQty(c.cartId, -1)}>-</button>
                          <span>{c.qty}</span>
                          <button onClick={() => changeRemoteQty(c.cartId, 1)}>+</button>
                        </div>
                        <button className="remove-btn" onClick={() => removeRemoteItem(c.cartId)}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-footer">
                <div className="total-row">
                  <span>{format(t.totalCountLabel, { n: remoteTotalCount })}</span>
                  <span className="total-price">{remoteTotalPrice.toLocaleString()}원</span>
                </div>
                <button className="checkout-btn" onClick={handleRemoteCheckout}>{t.checkoutBtn}</button>
              </div>
            </>
          )}
        </section>
      )}

      <main className="grid">
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

      {orderOptionsFor && (
        <div className="payment-overlay" onClick={closeOrderOptions}>
          <div className="options-box" onClick={(e) => e.stopPropagation()}>
            <button className="options-close-btn" onClick={closeOrderOptions} aria-label={t.closeBtn}>✕</button>
            <div className="options-header">
              <span className="options-icon">{orderOptionsFor.icon}</span>
              <h3>{t.menu[orderOptionsFor.id]}</h3>
            </div>

            {isOrderHotIceAvailable && (
              <div className="options-group">
                <p className="options-group-label">{t.hotIceLabel}</p>
                <div className="options-choice-row">
                  <button
                    className={`option-choice ${orderDraftOptions.hotIce === "hot" ? "selected" : ""}`}
                    onClick={() => setOrderDraftOptions((prev) => ({ ...prev, hotIce: "hot" }))}
                  >
                    {t.hotOption}
                  </button>
                  <button
                    className={`option-choice ${orderDraftOptions.hotIce === "ice" ? "selected" : ""}`}
                    onClick={() => setOrderDraftOptions((prev) => ({ ...prev, hotIce: "ice" }))}
                  >
                    {t.iceOption}
                  </button>
                </div>
              </div>
            )}

            <div className="options-group">
              <p className="options-group-label">{t.sizeLabel}</p>
              <div className="options-choice-row">
                <button
                  className={`option-choice ${orderDraftOptions.size === "regular" ? "selected" : ""}`}
                  onClick={() => setOrderDraftOptions((prev) => ({ ...prev, size: "regular" }))}
                >
                  {t.sizeRegular}
                </button>
                <button
                  className={`option-choice ${orderDraftOptions.size === "large" ? "selected" : ""}`}
                  onClick={() => setOrderDraftOptions((prev) => ({ ...prev, size: "large" }))}
                >
                  {t.sizeLarge}
                </button>
              </div>
            </div>

            <div className="options-group">
              <p className="options-group-label">{t.toppingLabel}</p>
              <div className="options-choice-row">
                <button
                  className={`option-choice ${orderDraftOptions.topping === "none" ? "selected" : ""}`}
                  onClick={() => setOrderDraftOptions((prev) => ({ ...prev, topping: "none" }))}
                >
                  {t.toppingNone}
                </button>
                <button
                  className={`option-choice ${orderDraftOptions.topping === "pearl" ? "selected" : ""}`}
                  onClick={() => setOrderDraftOptions((prev) => ({ ...prev, topping: "pearl" }))}
                >
                  {t.toppingPearl}
                </button>
              </div>
            </div>

            {isOrderWhipAvailable && (
              <div className="options-group">
                <p className="options-group-label">{t.whipLabel}</p>
                <div className="options-choice-row">
                  <button
                    className={`option-choice ${orderDraftOptions.whip === "none" ? "selected" : ""}`}
                    onClick={() => setOrderDraftOptions((prev) => ({ ...prev, whip: "none" }))}
                  >
                    {t.whipNone}
                  </button>
                  <button
                    className={`option-choice ${orderDraftOptions.whip === "add" ? "selected" : ""}`}
                    onClick={() => setOrderDraftOptions((prev) => ({ ...prev, whip: "add" }))}
                  >
                    {t.whipAdd}
                  </button>
                </div>
              </div>
            )}

            <div className="options-price-row">
              <span>{computeUnitPrice(orderOptionsFor, orderDraftOptions).toLocaleString()}원</span>
            </div>

            <button className="checkout-btn" onClick={confirmOrder}>{t.addToCartBtn}</button>
          </div>
        </div>
      )}

      {showDineTypeChoice && (
        <div className="payment-overlay" onClick={() => setShowDineTypeChoice(false)}>
          <div className="dine-type-box" onClick={(e) => e.stopPropagation()}>
            <h3>{t.dineTypeTitle}</h3>
            <div className="dine-type-choices">
              <button className="dine-type-btn" onClick={() => confirmRemoteCheckout("dine-in")}>
                🍽️ {t.dineIn}
              </button>
              <button className="dine-type-btn" onClick={() => confirmRemoteCheckout("takeout")}>
                🥤 {t.takeout}
              </button>
            </div>
          </div>
        </div>
      )}

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
