# 탭투게더 리모컨 (웹)

키오스크 옆에서 가족이 폰으로 주문을 돕는 리모컨 화면이에요. 키오스크가 보여주는 6자리 코드(또는 QR)로 연결해요.

이 레포는 **tap-together-app(키오스크 화면)과 한 쌍**이에요. 포크하는 방법, 배포하는 방법, 메뉴를 바꾸는 방법, ChatGPT로 바꾸는 방법은 모두 앱 레포의 README에 자세히 있어요. 여기에는 이 레포에서 꼭 필요한 것만 적어요.

## 이 레포에서 할 일

1. 포크하고 Pages를 켜요. (Fork → Actions 켜기 → Settings → Pages → Source를 **GitHub Actions**로 → Actions 탭에서 **Deploy to GitHub Pages** 실행)
2. 내 리모컨 주소는 `https://내아이디.github.io/tap-together-web/` 이에요. 레포 이름을 바꾸면 키오스크의 QR이 이 주소를 못 찾아요.
3. 메뉴를 바꿨다면 **`src/data/menu.js`를 앱 레포와 똑같이** 고쳐요. 이름, 가격, 이모지가 앱과 다르면 키오스크와 리모컨 화면이 서로 달라요.

## 접속 주소 규칙

리모컨은 접속 코드를 주소의 `?code=` 로 받아요. 예: `…/tap-together-web/?code=123456`. 키오스크의 QR이 이 주소를 만들어 줘요. 가족 초대 링크는 리모컨의 **공유** 버튼으로 만들어요.

## ChatGPT로 고치기

앱 레포의 `CHATGPT_PROMPT.md`를 ChatGPT에 먼저 붙여넣고, 이 레포의 `src/data/menu.js` 내용을 붙여넣어 시키면 돼요. 이 레포의 `AGENTS.md`는 Codex가 읽는 프로젝트 규칙이에요.
