# 탭투게더 리모컨

키오스크 옆에서 가족이 **폰으로** 주문을 도와주는 리모컨이에요. 키오스크 화면에 나오는 숫자 6개(또는 QR)로 연결해요.

이 프로젝트는 **tap-together-app (키오스크 화면)** 과 둘이 한 쌍이에요. 내 것으로 복사하는 법, 메뉴 바꾸는 법, ChatGPT에게 시키는 법은 **tap-together-app 의 README** 에 자세히 있어요. 여기에는 꼭 필요한 것만 적었어요.

## 이 프로젝트에서 할 일

1. 내 것으로 복사하고 인터넷에 올려요.
   - 오른쪽 위 **Fork** → **Create fork**
   - **Actions** 탭 → 초록 버튼
   - **Settings** → **Pages** → **Source** 를 **GitHub Actions** 로
   - **Actions** 탭 → **Deploy to GitHub Pages** → **Run workflow**
2. 내 리모컨 주소는 `https://내아이디.github.io/tap-together-web/` 예요. 프로젝트 이름을 바꾸면 키오스크의 QR이 이 주소를 못 찾아요.
3. 메뉴를 바꿨다면 **`src/data/menu.js` 를 tap-together-app 과 똑같이** 고쳐요. 사진을 바꿨다면 `public/menu-images` 폴더의 사진도 똑같이 올려요. 둘이 다르면 키오스크와 리모컨 화면이 서로 달라요.

## ChatGPT에게 시키기

ChatGPT에게 말하면 "바꾸는 글"을 만들어 줘요. 그 글을 이 프로젝트의 Actions → Edit menu (ChatGPT helper) → Run workflow 에 붙여넣으면 메뉴가 바뀌어요. tap-together-app 에서도 똑같이 해요. 자세한 방법은 tap-together-app 의 README 2번을 보세요.

## 새 리모컨 버튼

ChatGPT로 리모컨에 새 버튼을 만들 수도 있어요. 만들어진 버튼은 `src/data/customFeatures.js` 에 들어가요. 방법은 tap-together-app 의 `docs/custom-features.md` 를 보세요. 같은 한 줄을 tap-together-app 과 여기 두 곳 모두에 붙여넣어요.
