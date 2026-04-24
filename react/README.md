# React 인터랙티브 마스터 코스

두꺼운 책 없이, 클릭 한 번으로 React의 핵심 개념을 눈으로 확인하며 익히는 학습 자료다.

---

## 이 자료의 목적

주니어 개발자가 React 코드베이스에 처음 투입됐을 때 가장 먼저 부딪히는 개념들 — 렌더링 파이프라인, state 관리, Virtual DOM Diffing, Hooks 패턴 — 을 **인터랙티브 시각화**로 빠르게 체득하는 것이 목표다.

책을 읽으면 이해하는 데 며칠이 걸리는 내용을, 애니메이션을 보고 직접 조작하면서 수 시간 안에 머릿속에 그림이 그려지도록 설계했다. 이 자료를 전부 익히고 나면 실무 React 코드를 보고 "왜 이렇게 짰는지"가 자연스럽게 보이기 시작한다.

---

## 로컬에서 실행하기 (VSCode Live Server)

빌드 도구가 없다. `npm install` 없이 파일을 브라우저에서 바로 열기만 하면 된다.

### 1단계: Live Server 확장 설치

VSCode를 열고 왼쪽 사이드바의 Extensions 아이콘(또는 `Ctrl+Shift+X`)을 클릭한다.

검색창에 `Live Server`를 입력한다. **Ritwick Dey**가 만든 확장을 설치한다.

> 설치 후 VSCode를 재시작해야 메뉴가 보이는 경우가 있다.

### 2단계: index.html 열기

VSCode에서 이 `react/` 폴더를 연다. 파일 탐색기에서 `index.html`을 찾아 **우클릭** → **Open with Live Server**를 선택한다.

기본 브라우저에서 `http://127.0.0.1:5500/react/index.html` (또는 유사한 주소)로 자동으로 열린다.
허브 페이지에서 원하는 챕터 카드를 클릭하면 해당 시각화로 이동한다.

---

## GitHub Pages에 배포하기

### 방법 A: `react/` 폴더 전체를 새 레포 루트로 (권장)

이 방법이 가장 단순하다. `index.html`이 레포 루트에 위치해야 GitHub Pages가 자동으로 진입점을 인식한다.

```bash
# react/ 폴더 내용을 새 레포에 올리는 예시
cd react/
git init
git add .
git commit -m "feat: Chapter IV-1-1 렌더링 파이프라인 시각화"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

GitHub 레포 → **Settings** → **Pages** → Source를 `main` 브랜치 `/ (root)`로 지정한다.

배포 URL 예시: `https://<user>.github.io/<repo>/`

### 방법 B: 기존 레포의 서브폴더로 올리기

`react/` 폴더를 기존 레포 안에 그대로 push하면 된다. 이 경우 GitHub Pages Source를 `/docs`로 지정하는 기능이 필요하거나, 별도 브랜치(예: `gh-pages`)를 써야 할 수 있다. 구조가 복잡해지므로 방법 A를 권장한다.

> **주의**: CDN이 차단된 기업 내부망에서는 React, Tailwind, Babel 라이브러리가 로드되지 않아 화면이 비어있을 수 있다. 이 경우 로컬 Live Server 방식을 사용한다.

---

## 커리큘럼 개요

전체 목차: [`curriculum.md`](./curriculum.md)

`index.html`은 허브(목차) 페이지다. 챕터 카드를 클릭하면 해당 시각화 페이지로 이동한다.

| Part | 제목 | 대상 난이도 | 시각화 |
|:--|:--|:--|:--|
| I | 왜 React인가 | ★☆☆ (비개발자) | — |
| II | JS 프레임워크 지도 | ★☆☆~★★☆ | — |
| III | React 첫 걸음 | ★★☆ (코딩 입문) | — |
| IV | 컴포넌트·Hooks | ★★☆~★★★ | ✅ IV-1-1 렌더링 파이프라인 (`chapter-04-01-rendering.html`), IV-1-3 useEffect 생명주기 (`chapter-04-03-useeffect.html`) |
| V | 상태 관리·라우팅·API | ★★★ (주니어) | — |
| VI | 실전 프론트엔드 프로젝트 | ★★★ | — |
| VII | 배포 (Vercel / Netlify) | ★★★ | — |
| 부록 | 용어집 / FAQ / 다음 공부 / 참고자료 | 공통 | — |

> 세부 Chapter·Section 번호와 학습 목표는 [`curriculum.md`](./curriculum.md)를 참고하라. 모든 Section이 **난이도 / 선수 지식 / 학습 목표 / 설명 / 핵심 키워드 / 시각화 연결 / 다음 섹션** 7필드를 갖추고 있다.

---

## 새 챕터 추가 방법

### 파일 구조

```
react/
├── index.html                        # 허브(목차) 페이지 — 챕터 링크 모음
├── chapter-04-01-rendering.html      # IV-1-1 렌더링 파이프라인 시각화
├── chapter-04-03-useeffect.html      # IV-1-3 useEffect 생명주기 시각화
└── curriculum.md
```

### 새 챕터 파일 추가

1. **`index.html`의 CHAPTERS 배열에 항목을 추가한다.**

2. **챕터 HTML 파일을 생성한다.**

파일명 규칙: `chapter-[파트번호2자리]-[챕터번호2자리]-[영문키워드].html`

기존 챕터 파일을 복사하여 내용을 수정하는 것이 가장 빠르다.

### JSX 수정 시 주의점

이 파일은 빌드 과정이 없다. JSX는 `<script type="text/babel">` 블록 안에 인라인으로 작성한다.

```html
<script type="text/babel">
  const { useState, useEffect, useRef } = React;

  function App() {
    return <div>Hello React</div>;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
```

아래 규칙을 반드시 지킨다.

- `import` / `export` 문 사용 금지 — CDN UMD 방식은 전역 변수로 접근한다
- React 훅은 `const { useState, useEffect } = React;` 패턴으로 꺼내 쓴다
- 외부 파일 분리 금지 — 모든 JS/JSX는 해당 HTML 파일 안에 유지한다

---

## 트러블슈팅

### Live Server로 열었는데 화면이 흰색이다

1. 브라우저 개발자 도구(`F12`)를 열고 **Console** 탭을 확인한다.
2. `Failed to load resource` 에러가 보인다면 React, Tailwind, Babel CDN 중 하나가 로드 실패한 것이다. 인터넷 연결과 기업망 CDN 차단 여부를 확인한다.
3. 에러가 없는데 흰 화면이라면 `index.html` 파일 경로가 올바른지 확인한다 (폴더가 아닌 파일을 열어야 한다).

### "Open with Live Server" 메뉴가 보이지 않는다

Live Server 확장 설치 후 VSCode를 완전히 종료했다가 다시 시작한다. 그래도 안 보인다면 Extensions 탭에서 Live Server가 **활성화(Enabled)** 상태인지 확인한다.

### GitHub Pages에 올렸는데 빈 화면이다

`index.html`이 레포 루트(최상위 폴더)에 있는지 확인한다. Pages Source 설정이 올바른 브랜치와 `/ (root)` 경로를 가리키는지 재확인한다. 변경 후 배포 반영까지 1~2분 걸릴 수 있다.

---

## 기술 스택

별도 설치 없이 CDN으로 모든 라이브러리를 로드한다.

| 분류 | 기술 | 역할 |
|:--|:--|:--|
| UI 라이브러리 | React 18 (UMD CDN) | 컴포넌트 기반 UI + 시각화 런타임 |
| JSX 변환 | Babel Standalone | 브라우저에서 JSX를 직접 변환 |
| 스타일 | Tailwind CSS Play CDN | 유틸리티 클래스 스타일링 |
| 호스팅 | GitHub Pages | 정적 파일 서빙 |
| 로컬 실행 | VSCode Live Server | 파일 변경 시 브라우저 자동 새로고침 |
| 빌드 도구 | 없음 | npm/node 설치 불필요 |
