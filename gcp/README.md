# GCP 인터랙티브 마스터 코스

두꺼운 책 없이, 클릭 한 번으로 GCP(Google Cloud Platform)의 핵심 개념을 눈으로 확인하며 익히는 학습 자료다.

---

## 이 자료의 목적

주니어 개발자가 처음 GCP를 접했을 때 가장 먼저 부딪히는 개념들 — Cloud Run 요청 흐름, Load Balancer의 역할, Cloud SQL Private IP 연결, Cloud Logging — 을 **인터랙티브 시각화**로 빠르게 체득하는 것이 목표다.

"클라우드를 써야 한다"는 말을 들었을 때 무엇부터 시작해야 할지 막막한 분을 위해, Part I에서는 내 집 서버와 호텔 비유로 클라우드의 필요성을 설명한다. Part VII까지 마치면 실무 수준의 Cloud Run 서비스를 배포·운영할 수 있다.

---

## 로컬에서 실행하기 (VSCode Live Server)

빌드 도구가 없다. `npm install` 없이 파일을 브라우저에서 바로 열기만 하면 된다.

### 1단계: Live Server 확장 설치

VSCode를 열고 왼쪽 사이드바의 Extensions 아이콘(또는 `Ctrl+Shift+X`)을 클릭한다.

검색창에 `Live Server`를 입력한다. **Ritwick Dey**가 만든 확장을 설치한다.

> 설치 후 VSCode를 재시작해야 메뉴가 보이는 경우가 있다.

### 2단계: index.html 열기

VSCode에서 이 `gcp/` 폴더를 연다. 파일 탐색기에서 `index.html`을 찾아 **우클릭** → **Open with Live Server**를 선택한다.

기본 브라우저에서 `http://127.0.0.1:5500/gcp/index.html` (또는 유사한 주소)로 자동으로 열린다.

---

## GitHub Pages에 배포하기

### 방법 A: `gcp/` 폴더 전체를 새 레포 루트로 (권장)

이 방법이 가장 단순하다. `index.html`이 레포 루트에 위치해야 GitHub Pages가 자동으로 진입점을 인식한다.

```bash
# gcp/ 폴더 내용을 새 레포에 올리는 예시
cd gcp/
git init
git add .
git commit -m "feat: Cloud Run 요청 흐름 시각화"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

GitHub 레포 → **Settings** → **Pages** → Source를 `main` 브랜치 `/ (root)`로 지정한다.

배포 URL 예시: `https://<user>.github.io/<repo>/`

### 방법 B: 기존 레포의 서브폴더로 올리기

`gcp/` 폴더를 기존 레포 안에 그대로 push하면 된다. 이 경우 GitHub Pages Source를 `/docs`로 지정하는 기능이 필요하거나, 별도 브랜치(예: `gh-pages`)를 써야 할 수 있다. 구조가 복잡해지므로 방법 A를 권장한다.

> **주의**: CDN이 차단된 기업 내부망에서는 React, Tailwind, Babel 라이브러리가 로드되지 않아 화면이 비어있을 수 있다. 이 경우 로컬 Live Server 방식을 사용한다.

---

## 커리큘럼 개요

전체 목차: [`curriculum.md`](./curriculum.md)

현재 루트 `index.html`은 **Chapter IV-1-1 (Cloud Run 요청 흐름)** 시각화다. 클라이언트 HTTPS 요청이 Google Load Balancer에서 SSL을 종료한 뒤 Cloud Run 인스턴스로 전달되고, Cloud SQL에서 데이터를 조회해 응답을 반환하고, Cloud Logging에 기록되는 6단계 흐름을 단계별 애니메이션으로 보여준다.

| Part | 제목 | 대상 난이도 | 시각화 |
|:--|:--|:--|:--|
| I | 왜 클라우드인가 | ★☆☆ (비개발자) | — |
| II | 클라우드 비교 (AWS/Azure/GCP) | ★☆☆~★★☆ | — |
| III | GCP 계정 · gcloud CLI | ★★☆ (코딩 입문) | — |
| IV | Compute · Storage · DB | ★★☆~★★★ | ✅ (`index.html` = IV-1-1 Cloud Run 요청 흐름) |
| V | 네트워킹 · IAM | ★★★ (주니어) | — |
| VI | 실전 배포 프로젝트 | ★★★ | — |
| VII | Cloud Run 배포 · 운영 | ★★★ | — |
| 부록 | 용어집 / FAQ / 다음 공부 / 참고자료 | 공통 | — |

> 세부 Chapter·Section 번호와 학습 목표는 [`curriculum.md`](./curriculum.md)를 참고하라. 모든 Section이 **난이도 / 선수 지식 / 학습 목표 / 설명 / 핵심 키워드 / 시각화 연결 / 다음 섹션** 7필드를 갖추고 있다.

---

## 새 챕터 추가 방법

### 파일 구조 방향

현재는 챕터가 1개뿐이라 `index.html` 단일 파일로 운영한다. **챕터 IV-1-2 이상이 추가되면** 아래 구조로 전환한다.

```
gcp/
├── index.html              # 허브(목차) 페이지 — 챕터 링크 모음
├── chapter-04-01-cloudrun.html
├── chapter-04-02-storage.html
└── curriculum.md
```

그 전까지는 현재 `index.html`에 직접 수정하면 된다.

### JSX 수정 시 주의점

이 파일은 빌드 과정이 없다. JSX는 `<script type="text/babel">` 블록 안에 인라인으로 작성한다.

```html
<script type="text/babel">
  // 여기에 React 컴포넌트 작성
  const { useState, useEffect, useRef } = React;

  function App() {
    return <div>Hello</div>;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
```

아래 규칙을 반드시 지킨다.

- `import` / `export` 문 사용 금지 — CDN UMD 방식은 전역 변수로 접근한다
- React 훅은 `const { useState, useEffect } = React;` 패턴으로 꺼내 쓴다
- 외부 파일 분리 금지 — 모든 JS/JSX는 해당 HTML 파일 안에 유지한다

### STEPS / CLI_CODE 교체 방법

새 챕터를 추가할 때는 `PYTHON_CODE`(실제로는 CLI 코드 배열)와 `STEPS` 배열, 헤더 텍스트만 교체하면 된다.

```javascript
// CLI_CODE 배열 예시 (새 챕터용)
const PYTHON_CODE = [
  "# 새 챕터 CLI 예시",
  "gcloud <명령어> ...",
  // ...
];

// STEPS 배열 — 각 스텝의 상태와 설명 정의
const STEPS = [
  {
    codeLine: 0,          // 하이라이트할 코드 줄 인덱스
    title: "STEP 1 — ...",
    desc: "설명 텍스트",
    // 상태 필드들...
  },
  // ...
];
```

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
| UI 라이브러리 | React 18 (UMD CDN) | 컴포넌트 기반 UI |
| JSX 변환 | Babel Standalone | 브라우저에서 JSX를 직접 변환 |
| 스타일 | Tailwind CSS Play CDN | 유틸리티 클래스 스타일링 |
| 호스팅 | GitHub Pages | 정적 파일 서빙 |
| 로컬 실행 | VSCode Live Server | 파일 변경 시 브라우저 자동 새로고침 |
| 빌드 도구 | 없음 | npm/node 설치 불필요 |
