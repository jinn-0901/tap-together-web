import "./App.css";
import { useState } from "react";

const LANGUAGES = ["한국어", "English", "中文", "日本語"];

export default function App() {
  const [langIndex] = useState(0);
  const [code, setCode] = useState("");

  const handleCodeChange = (e) => {
    const onlyDigits = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(onlyDigits);
  };

  return (
    <div className="kiosk">
      <div className="kiosk-card">
        <h1>무인 키오스크 원격 제어</h1>
        <p className="lang-badge">현재 언어: {LANGUAGES[langIndex]}</p>

        <div className="connect-box">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="키오스크 코드 입력 (6자리)"
            value={code}
            onChange={handleCodeChange}
          />
          <button className="connect-btn">연결</button>
        </div>

        <div className="menu">
          <button>🔠 큰글자</button>
          <button>🌐 언어 선택</button>
          <button>🎙️ 음성 인식</button>
          <button>🖼️ 쉬운 화면 모드</button>
        </div>
      </div>
    </div>
  );
}