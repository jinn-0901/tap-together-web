# AGENTS.md — tap-together-web (가족 리모컨)

이 파일은 Codex 같은 코딩 에이전트가 이 레포에서 일할 때 따를 규칙이에요. 요청하는 사람은 코드를 거의 모르는 고등학생이라고 가정하고, 한국어로 쉽게 설명해 주세요.

## 프로젝트 개요
- 고령자 접근성 카페 키오스크의 가족 리모컨. React(Create React App, react-scripts 5), Socket.IO 클라이언트.
- 세 부분: 이 레포(가족 리모컨) / `tap-together-app`(키오스크 화면) / `tap-together-server`(공유 서버, 이 레포 밖).
- 리모컨은 접속 코드를 주소의 `?code=<6자리>`로 받아 키오스크 방에 들어가고(공유 링크는 `&shared=1&st=<토큰>` 추가), 언어/접근성 토글(직접 연결자만), 메뉴 주문, 음성 주문을 서버를 통해 키오스크로 보냄.
- 번역(`/translations/web`)과 메뉴 사진(`/menu-images/<id>.jpg`)은 서버가 제공함. 이 레포에서는 바꿀 수 없음.

## 배포
- `main`에 푸시하면 `.github/workflows/deploy-pages.yml`이 GitHub Pages로 배포함. 주소는 `https://<아이디>.github.io/tap-together-web/`.
- `PUBLIC_URL`은 워크플로가 `/<레포이름>`으로 주입함. 하위 경로 배포이므로 절대 경로(`/foo`)로 자원을 불러오지 말 것.
- 서버 주소는 `.env`의 `REACT_APP_SERVER_URL`. 레포 변수 `REACT_APP_SERVER_URL`이 있으면 그게 우선.
- 접속 코드는 경로가 아니라 `?code=` 쿼리로 다룸(GitHub Pages는 `/123456` 같은 경로 새로고침이 404). `getCodeFromUrl`, `buildPageUrl`을 유지할 것.
- `package-lock.json`이 `package.json`과 어긋나 있어 CI는 `npm ci`가 아니라 `npm install`을 사용함.

## 메뉴 관련 요청 (가장 흔함)
- 메뉴 이름·가격·이모지·분류는 **`src/data/menu.js`만** 수정함.
  - `MENU`: `{ id, price, category, icon }`. `id`는 절대 바꾸지 않음. `category`는 `coffee | latte | tea | ade`.
  - `MENU_NAMES`: id별 `{ ko, en, zh, ja, vi }`. 이름을 바꾸면 5개 언어를 모두 자연스럽게 채움(없는 언어는 ko로 대체되지만 채우는 게 원칙).
  - `applyMenuNames`는 서버 번역 위에 `MENU_NAMES`를 덮어쓰는 함수(리모컨의 음성 주문 인식도 이 이름을 씀). 구조는 바꾸지 않음.
- 새 메뉴: `MENU`와 `MENU_NAMES`에 같은 id로 추가. 필요하면 `WHIP_AVAILABLE_IDS`, `FIXED_ICE_IDS`에도 추가. 사진이 없으면 이모지로 자동 대체되는 게 정상.
- 이름만 바꾸면(id 동일) 쉬운 화면의 사진은 기존 메뉴 사진 그대로임을 사용자에게 알림.
- **`tap-together-app`의 `src/data/menu.js`도 똑같이 바꿔야 함.** 이 환경에 그 레포가 없으면 사용자에게 "키오스크(tap-together-app) 레포에도 같은 변경을 해야 해요"라고 알리고, 붙여넣을 수 있게 변경된 파일 전체를 제공.

## 하지 말 것
- `.github/workflows`, `package.json`, `package-lock.json`, `.env`는 요청이 명확하지 않으면 수정하지 않음.
- 소켓 이벤트 이름, 서버와 주고받는 데이터 구조는 바꾸지 않음(서버·키오스크와 맞물려 있음).
- 비밀번호·토큰이 보이면 사용자에게 알리고 커밋하지 않음.

## 작업 방식
- 변경은 작게. 가능하면 `npm install && npm run build`로 빌드가 되는지 확인(`CI=false`).
- PR 제목과 설명은 한국어로, 무엇을 왜 바꿨는지 두세 줄로.
