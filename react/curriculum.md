# React 사다리형 학습 커리큘럼

> JavaScript 배경에서 출발해, 컴포넌트 설계·상태 관리·배포까지 한 권으로 올라가는 React 18 학습 자료.

---

## 이 책이 만들어진 이유

이 자료는 React 공식 문서나 두꺼운 기술서와 다르게 **"아는 만큼 읽고, 필요한 만큼만 깊이 들어가도 되는"** 사다리형 구조로 짜여 있다. 처음 HTML·CSS를 다뤄본 비개발자가 Part I부터 읽어도 막히지 않게 만들었고, 동시에 이미 React를 실무에서 다루는 주니어가 Part IV 이후만 발췌해 참고해도 가치가 있게 썼다.

전체 구성은 **설계도(상세 목차) + 인터랙티브 시각화**다. 각 Section은 한 꼭지의 학습 단위이며, 필요한 곳에는 챕터별 HTML 파일(`chapter-04-01-rendering.html` 등)과 같은 **단계별 애니메이션 시각화**가 짝을 이뤄, 글 대신 움직이는 그림으로 개념을 체득할 수 있도록 설계되어 있다. `index.html`은 허브(목차) 페이지로 각 챕터로 진입할 수 있다.

React 18 + Hooks 기반으로 서술한다. Class 컴포넌트 문법은 필요한 곳에서만 언급한다.

---

## 읽기 가이드

### 난이도 범례

| 표기 | 독자 | 설명 |
|:--|:--|:--|
| **★☆☆** | 비개발자 | HTML·CSS를 본 적 있음. JS는 처음 |
| **★★☆** | 코딩 입문 | JavaScript 기초(변수·함수·배열·객체)를 알고 있음 |
| **★★★** | 주니어 | JS + HTTP + Git 실전 경험, React 실무 투입 준비 |

### 독자별 추천 경로

- **처음 개발을 배우는 분** → Part I → Part II → Part III → Part IV (천천히)
- **JS는 알지만 React는 처음** → Part III → Part IV → 필요 시 Part II
- **React 실무 투입 준비 중** → Part IV → Part V → Part VI → Part VII

### Section 양식 (공통)

각 Section은 아래 7개 필드를 갖는다.

- **난이도**: ★☆☆ / ★★☆ / ★★★
- **선수 지식**: 먼저 읽어두면 좋은 이전 Section
- **학습 목표**: "이 Section을 마치면 ...할 수 있다"
- **설명**: 3~5줄 핵심 요약 (비유 중심)
- **핵심 키워드**: 이 Section의 기억해둘 개념 목록
- **시각화 연결**: 관련 챕터 시각화 HTML 또는 향후 구현 예정
- **다음 섹션**: 다음 번호

### 번호 규칙

`Part-Chapter-Section` (예: `IV-1-1` = Part IV, Chapter 1, Section 1). `chapter-04-01-rendering.html` 시각화는 IV-1-1, `chapter-04-03-useeffect.html` 시각화는 IV-1-3에 해당한다. `index.html`은 허브(목차) 페이지다.

---

## 전체 목차

### Part I. 왜 React인가 (★☆☆)
- Chapter I-1. 웹 페이지는 어떻게 만들어지나
- Chapter I-2. JavaScript가 HTML을 움직이는 방법
- Chapter I-3. 직접 DOM을 다루면 생기는 문제
- Chapter I-4. React가 등장한 이유
- Chapter I-5. React로 만든 것들 — 세상에서 쓰이는 곳

### Part II. JS 프레임워크 지도 (★☆☆~★★☆)
- Chapter II-1. 프레임워크 vs 라이브러리
- Chapter II-2. React / Vue / Svelte / Angular 비교
- Chapter II-3. SPA vs MPA — 페이지를 새로 로드하냐 마냐
- Chapter II-4. 번들러 지도 — Vite / Webpack / esbuild
- Chapter II-5. React를 선택하는 기준

### Part III. React 첫 걸음 (★★☆)
- Chapter III-1. 개발 환경 준비 (Node.js + Vite)
- Chapter III-2. 첫 컴포넌트 만들기
- Chapter III-3. JSX — HTML처럼 생긴 JavaScript
- Chapter III-4. Props — 컴포넌트에 값 전달하기
- Chapter III-5. 처음 만나는 에러와 해결법

### Part IV. 컴포넌트·Hooks (★★☆~★★★)
- Chapter IV-1. 렌더링 파이프라인 ← `chapter-04-01-rendering.html` 시각화 연결
- Chapter IV-2. useState — 상태 선언과 업데이트
- Chapter IV-3. useEffect — 사이드 이펙트 다루기
- Chapter IV-4. 커스텀 Hook — 로직 재사용

### Part V. 상태 관리·라우팅·API (★★★)
- Chapter V-1. 전역 상태 관리 — Context API
- Chapter V-2. 외부 상태 라이브러리 — Zustand / Redux Toolkit
- Chapter V-3. React Router — 클라이언트 사이드 라우팅
- Chapter V-4. 서버에서 데이터 가져오기 — fetch / React Query

### Part VI. 실전 프론트엔드 프로젝트 (★★★)
- Chapter VI-1. 프로젝트 설계 — 폴더 구조와 컴포넌트 분해
- Chapter VI-2. 폼(Form)과 유효성 검사 — React Hook Form
- Chapter VI-3. 인증(Auth) 흐름 구현
- Chapter VI-4. 에러 경계와 로딩 상태 처리

### Part VII. 배포 (Vercel / Netlify) (★★★)
- Chapter VII-1. 빌드 결과물 이해하기
- Chapter VII-2. Vercel로 배포하기
- Chapter VII-3. 환경 변수와 API 키 보호
- Chapter VII-4. 성능 최적화 기초

### 부록
- A. 용어집 (30개)
- B. FAQ (10개)
- C. 다음에 공부할 것
- D. 참고 자료 (16개)

---

## Part I. 왜 React인가

> **독자**: HTML·CSS를 다뤄본 적 있는 비개발자. JavaScript는 이름만 들어봤음.

---

### I-1-1. 브라우저가 웹 페이지를 그리는 방법

- **난이도**: ★☆☆
- **선수 지식**: 없음
- **학습 목표**: 이 섹션을 마치면 HTML·CSS·JS가 브라우저에서 어떻게 협력해 화면을 만드는지 설명할 수 있다.
- **설명**: 브라우저는 HTML을 받아 "DOM(Document Object Model)"이라는 나무 모양 자료 구조를 만든다. CSS는 이 나무에 색깔·크기·위치를 입히고, JavaScript는 나무의 가지를 직접 꺾거나 새 가지를 붙이는 역할을 한다. 레스토랑 비유로 보면: HTML=메뉴판 내용, CSS=인테리어, JS=주문이 들어올 때 테이블을 바꾸는 직원이다.
- **핵심 키워드**: DOM, HTML 파싱, CSS 렌더링, JavaScript, 브라우저 렌더링 엔진
- **시각화 연결**: `chapter-01-01-browser-rendering.html` — 브라우저 렌더링 파이프라인 6단계 시각화 (Chapter I-1-1)
- **다음 섹션**: I-1-2

---

### I-1-2. JavaScript가 DOM을 직접 다루면 어떤 일이 생기나

- **난이도**: ★☆☆
- **선수 지식**: I-1-1
- **학습 목표**: 이 섹션을 마치면 `document.getElementById`로 DOM을 바꾸는 방식의 불편함을 말할 수 있다.
- **설명**: 예전 방식은 JS로 DOM을 직접 조작했다(`document.getElementById('btn').innerText = '완료'`). 기능이 많아질수록 "어디서 무엇을 바꿨는지" 추적하기 어려워진다. 마치 큰 종이 지도에 연필로 계속 덮어 쓰는 것처럼, 오래되면 어디가 최신 상태인지 알 수 없게 된다.
- **핵심 키워드**: 명령형 프로그래밍(Imperative), DOM 직접 조작, 상태 추적 어려움
- **시각화 연결**: `chapter-01-01-dom-manipulation.html` — 여러 스크립트의 DOM 충돌 시뮬레이션 (Chapter I-1-2)
- **다음 섹션**: I-1-3

---

### I-1-3. 선언형 UI — "어떻게"가 아니라 "무엇"을

- **난이도**: ★☆☆
- **선수 지식**: I-1-2
- **학습 목표**: 이 섹션을 마치면 명령형(Imperative)과 선언형(Declarative) UI의 차이를 비유로 설명할 수 있다.
- **설명**: React는 "UI가 어떤 모습이어야 하는지"만 선언하면, React가 실제 DOM 조작을 알아서 처리한다. 요리 비유: 명령형은 "냄비에 물 붓고, 불 켜고, 3분 기다리고..."이고, 선언형은 "라면 한 그릇"이다. 원하는 결과만 말하면 내부 과정은 React가 담당한다.
- **핵심 키워드**: 선언형(Declarative), 명령형(Imperative), React 철학
- **시각화 연결**: `chapter-01-01-declarative-ui.html` — 명령형 vs 선언형 코드 비교 시각화 (Chapter I-1-3)
- **다음 섹션**: I-1-4

---

### I-1-4. React가 등장한 이유 — Facebook의 뉴스피드 문제

- **난이도**: ★☆☆
- **선수 지식**: I-1-3
- **학습 목표**: 이 섹션을 마치면 React가 왜 만들어졌는지 역사적 배경을 이야기할 수 있다.
- **설명**: 2011년 Facebook 뉴스피드는 "좋아요" 숫자, 댓글 수, 알림 배지가 서로 다른 코드로 DOM을 조작하다 보니 화면이 일관성 없이 달라지는 버그가 끊이지 않았다. 이 문제를 해결하기 위해 Jordan Walke가 "상태(state) → UI" 단방향 흐름을 가진 라이브러리를 만들었다. 2013년 오픈소스로 공개됐고, 지금은 웹 프론트엔드 사실상 표준 중 하나가 됐다.
- **핵심 키워드**: React 역사, 단방향 데이터 흐름, 상태(state), Facebook/Meta
- **시각화 연결**: `chapter-01-01-react-origin.html` — Facebook 뉴스피드 문제 → React 탄생 히스토리 시각화 (Chapter I-1-4)
- **다음 섹션**: I-1-5

---

### I-1-5. React로 만든 것들 — 세상에서 쓰이는 곳

- **난이도**: ★☆☆
- **선수 지식**: I-1-4
- **학습 목표**: 이 섹션을 마치면 React가 어떤 제품에 사용되는지 구체적인 예시를 들 수 있다.
- **설명**: React는 Facebook·Instagram·WhatsApp Web(Meta 제품군), Airbnb, Netflix 일부 화면, Notion 등 다양한 서비스에 쓰인다. React Native를 이용하면 같은 코드로 iOS·Android 앱도 만들 수 있다. 배운 지식이 웹과 모바일에 모두 통한다는 점이 큰 강점이다.
- **핵심 키워드**: React Native, Meta, Airbnb, Notion, 크로스플랫폼
- **시각화 연결**: `chapter-01-01-react-showcase.html` — React 제품 쇼케이스 + 크로스플랫폼 다이어그램 (Chapter I-1-5)
- **다음 섹션**: II-1-1

---

## Part II. JS 프레임워크 지도

> **독자**: JavaScript 기초를 알고 있음. React 이외의 선택지가 궁금한 독자.

---

### II-1-1. 프레임워크 vs 라이브러리 — 주도권이 누구에게 있나

- **난이도**: ★☆☆
- **선수 지식**: I-1-4
- **학습 목표**: 이 섹션을 마치면 프레임워크와 라이브러리의 차이를 "제어의 역전" 개념으로 설명할 수 있다.
- **설명**: 라이브러리는 내가 필요할 때 꺼내 쓰는 도구다(망치, 드라이버). 프레임워크는 미리 지어진 집이다 — 내 코드가 프레임워크가 정해준 방식으로 들어가야 한다. React는 "UI 레이어 라이브러리"로 분류한다. 라우팅이나 상태 관리는 직접 선택해 조합해야 한다. Angular는 반대로 이 모든 것을 프레임워크가 포함한다.
- **핵심 키워드**: 라이브러리(Library), 프레임워크(Framework), 제어의 역전(IoC), UI 레이어
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: II-1-2

---

### II-1-2. React / Vue / Svelte / Angular 비교

- **난이도**: ★★☆
- **선수 지식**: II-1-1
- **학습 목표**: 이 섹션을 마치면 4가지 주요 프론트엔드 프레임워크·라이브러리의 차이점을 표로 정리할 수 있다.
- **설명**: React(Virtual DOM, JSX, Meta 관리), Vue(Single File Component, 점진적 채택 쉬움), Svelte(빌드 시 컴파일, Virtual DOM 없음, 번들 크기 작음), Angular(TypeScript 강제, DI 내장, 엔터프라이즈 친화). 국내 스타트업은 React 비중이 높고, 대기업 내부 시스템은 Angular도 많다. 어떤 팀에 합류하느냐에 따라 달라지므로 React를 깊이 익히되 Vue 기초 정도는 알아두면 유용하다.
- **핵심 키워드**: Virtual DOM, JSX, Single File Component, Svelte 컴파일, Angular DI
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: II-1-3

---

### II-1-3. SPA vs MPA — 페이지를 새로 로드하냐 마냐

- **난이도**: ★★☆
- **선수 지식**: II-1-2
- **학습 목표**: 이 섹션을 마치면 SPA와 MPA의 차이를 이해하고, 어떤 상황에서 어떤 방식을 선택할지 말할 수 있다.
- **설명**: 전통 MPA(Multi-Page Application)는 링크를 클릭할 때마다 서버에서 새 HTML을 받아 전체 페이지를 다시 그린다. SPA(Single-Page Application)는 처음에 JS를 한 번 받고, 이후 화면 전환은 JS가 내부에서 처리한다. React 앱은 보통 SPA로 구성된다. 단, 검색 엔진 최적화(SEO)나 초기 로딩 속도가 중요하면 Next.js 같은 서버사이드 렌더링 프레임워크를 고려한다.
- **핵심 키워드**: SPA, MPA, CSR(클라이언트 사이드 렌더링), SSR(서버 사이드 렌더링), SEO, Next.js
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: II-1-4

---

### II-1-4. 번들러 지도 — Vite / Webpack / esbuild

- **난이도**: ★★☆
- **선수 지식**: II-1-3
- **학습 목표**: 이 섹션을 마치면 번들러가 하는 일을 이해하고, Vite를 선택해야 하는 이유를 설명할 수 있다.
- **설명**: 프론트엔드 코드는 수십~수백 개의 JS 파일로 나뉘어 있다. 번들러는 이 파일들을 묶어(bundle) 브라우저가 이해할 수 있는 파일로 변환한다. Webpack은 오랜 표준이지만 설정이 복잡하고 느리다. Vite는 개발 중 esbuild로 빠르게 변환하고, 프로덕션 빌드는 Rollup을 사용해 속도·설정 단순함을 모두 잡았다. React 공식 가이드도 2024년부터 Vite 기반 설정을 권장한다.
- **핵심 키워드**: 번들러(Bundler), Vite, Webpack, esbuild, Rollup, 개발 서버, HMR
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: II-1-5

---

### II-1-5. React를 선택하는 기준

- **난이도**: ★★☆
- **선수 지식**: II-1-4
- **학습 목표**: 이 섹션을 마치면 프로젝트 상황에 따라 React가 적합한지 판단할 수 있다.
- **설명**: React가 잘 맞는 상황: 복잡한 UI 상태가 많은 대시보드·SaaS 앱, 팀이 React에 익숙한 경우, React Native 모바일 병행 개발. 신중히 고려할 상황: SEO가 극도로 중요한 블로그(→ Next.js/Astro 고려), 아주 단순한 정적 사이트(→ 바닐라 HTML/CSS로 충분), PHP·Rails 풀스택 앱(→ 해당 생태계 뷰 레이어로 충분).
- **핵심 키워드**: React 적합성, Next.js, Astro, 상황별 선택, 생태계
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: III-1-1

---

## Part III. React 첫 걸음

> **독자**: JavaScript 기초를 알고 있고, React를 처음 설치해보려는 독자.

---

### III-1-1. 개발 환경 준비 — Node.js + Vite

- **난이도**: ★★☆
- **선수 지식**: II-1-4
- **학습 목표**: 이 섹션을 마치면 `npm create vite@latest`로 React 프로젝트를 생성하고 로컬에서 실행할 수 있다.
- **설명**: React 앱을 만들려면 Node.js(JS를 브라우저 바깥에서 실행하는 환경)와 npm(패키지 설치 도구)이 필요하다. `npm create vite@latest my-app -- --template react`를 실행하면 Vite 기반 React 프로젝트 뼈대가 만들어진다. `npm install` 후 `npm run dev`를 실행하면 로컬 브라우저에서 앱이 열린다.
- **핵심 키워드**: Node.js, npm, Vite, `npm run dev`, 로컬 개발 서버
- **시각화 연결**: `chapter-03-01-dev-setup.html` — 가상 터미널 시뮬레이션으로 프로젝트 생성·실행 체험 (Chapter III-1-1)
- **다음 섹션**: III-1-2

---

### III-1-2. 첫 컴포넌트 만들기

- **난이도**: ★★☆
- **선수 지식**: III-1-1
- **학습 목표**: 이 섹션을 마치면 함수형 컴포넌트를 작성하고 화면에 렌더링할 수 있다.
- **설명**: React에서 UI의 기본 단위는 "컴포넌트(Component)"다. 레고 블록과 같다 — 작은 블록을 조합해 큰 구조를 만든다. 함수형 컴포넌트는 JS 함수처럼 생겼고 JSX를 반환한다. 컴포넌트 이름은 반드시 대문자로 시작한다(`function Counter()`). React 16.8 이후 Hooks 덕분에 Class 컴포넌트를 쓸 이유가 거의 없어졌다.
- **핵심 키워드**: 컴포넌트(Component), 함수형 컴포넌트, Hooks, 대문자 규칙
- **시각화 연결**: `chapter-03-01-first-component.html` — 레고 블록 비유 + 함수형 컴포넌트 조합 시각화 (Chapter III-1-2)
- **다음 섹션**: III-1-3

---

### III-1-3. JSX — HTML처럼 생긴 JavaScript

- **난이도**: ★★☆
- **선수 지식**: III-1-2
- **학습 목표**: 이 섹션을 마치면 JSX 문법 규칙(단일 루트 요소, className, 중괄호 표현식)을 지켜 UI를 작성할 수 있다.
- **설명**: JSX는 JavaScript 안에 HTML 태그처럼 생긴 문법을 쓸 수 있게 해주는 확장 문법이다. 빌드 시 `React.createElement()` 호출로 변환된다. 몇 가지 규칙: `class` 대신 `className`, `for` 대신 `htmlFor`, 반드시 하나의 루트 요소로 감싸야 한다(`<>...</>` Fragment 사용 가능), JS 표현식은 `{중괄호}`로 넣는다.
- **핵심 키워드**: JSX, `className`, Fragment(`<>`), `React.createElement`, 표현식 삽입
- **시각화 연결**: `chapter-03-01-jsx.html` — JSX → React.createElement 변환 과정 + 규칙 비교 시각화 (Chapter III-1-3)
- **다음 섹션**: III-1-4

---

### III-1-4. Props — 컴포넌트에 값 전달하기

- **난이도**: ★★☆
- **선수 지식**: III-1-3
- **학습 목표**: 이 섹션을 마치면 Props를 통해 부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하고 활용할 수 있다.
- **설명**: Props(Properties)는 컴포넌트 함수의 인자(매개변수)다. HTML 태그의 `src="..."` 속성처럼, 부모가 자식에게 값을 내려보낸다. Props는 읽기 전용이다 — 자식은 받은 props를 직접 바꿀 수 없다. 이 단방향 데이터 흐름이 React 앱의 상태 추적을 쉽게 만드는 핵심이다.
- **핵심 키워드**: Props, 단방향 데이터 흐름, 읽기 전용, 부모-자식, 구조 분해 할당
- **시각화 연결**: `chapter-03-01-props.html` — 부모→자식 데이터 흐름 + 인터랙티브 Props 편집기 (Chapter III-1-4)
- **다음 섹션**: III-1-5

---

### III-1-5. 처음 만나는 에러와 해결법

- **난이도**: ★★☆
- **선수 지식**: III-1-4
- **학습 목표**: 이 섹션을 마치면 React 개발 중 자주 만나는 에러 메시지를 읽고 원인을 파악할 수 있다.
- **설명**: "Each child in a list should have a unique `key` prop" — 배열 렌더링 시 `key` 속성 누락. "Cannot read properties of undefined" — state나 props가 아직 준비되지 않았을 때 접근. "React Hook 'useState' is called in..." — Hooks 규칙 위반(반복문·조건문 안에서 Hook 호출). 각 에러는 브라우저 콘솔에 원인과 파일 위치를 함께 알려주므로, 메시지를 읽는 습관을 기르는 것이 가장 빠른 디버깅 방법이다.
- **핵심 키워드**: key prop, Hooks 규칙, 콘솔 에러, 조건부 렌더링, 디버깅
- **시각화 연결**: `chapter-03-01-common-errors.html` — 3가지 대표 에러 시뮬레이터 + 디버깅 체크리스트 (Chapter III-1-5)
- **다음 섹션**: III-B-1

---

## Part III-B. React 실전 기초 보강

> **독자**: Part III까지 마쳤고, 실전에서 빠지기 쉬운 기본기를 보강하려는 독자.

---

### III-B-1. 조건부 렌더링 — 보여줄까 말까

- **난이도**: ★★☆
- **선수 지식**: III-1-4
- **학습 목표**: 이 섹션을 마치면 &&, 삼항 연산자, early return 3가지 조건부 렌더링 패턴을 상황에 맞게 선택할 수 있다.
- **설명**: React에서 조건에 따라 UI를 보여주거나 숨기는 방법은 여러 가지다. `{isLoggedIn && <Profile />}`는 true일 때만 렌더링하는 가장 간결한 패턴이다. 삼항 연산자 `{isLoggedIn ? <Profile /> : <LoginButton />}`는 두 가지 UI를 전환한다. early return은 함수 상단에서 조건을 검사해 다른 UI를 반환하는 패턴이다.
- **핵심 키워드**: &&, 삼항 연산자, early return, null 반환, 조건부 렌더링
- **시각화 연결**: `chapter-03b-01-conditional-rendering.html` — 3가지 조건부 렌더링 패턴 인터랙티브 비교 (Chapter III-B-1)
- **다음 섹션**: III-B-2

---

### III-B-2. 리스트 렌더링 — 배열을 화면에 그리기

- **난이도**: ★★☆
- **선수 지식**: III-B-1
- **학습 목표**: 이 섹션을 마치면 map()으로 배열을 렌더링하고, key prop의 역할과 올바른 사용법을 설명할 수 있다.
- **설명**: 배열 데이터를 UI로 변환하는 핵심 메서드는 `Array.map()`이다. `{items.map(item => <li key={item.id}>{item.name}</li>)}`처럼 각 요소를 JSX로 변환한다. `key` prop은 React가 어떤 아이템이 추가·삭제·이동됐는지 추적하는 식별자다. 배열 index를 key로 쓰면 순서가 바뀔 때 버그가 생길 수 있으므로 고유 ID를 사용한다.
- **핵심 키워드**: map(), key prop, 고유 ID, filter(), 배열 렌더링
- **시각화 연결**: `chapter-03b-02-list-rendering.html` — map + key 시각화 + Mini Todo App (Chapter III-B-2)
- **다음 섹션**: III-B-3

---

### III-B-3. 이벤트 핸들러 — 클릭, 입력, 폼 제출

- **난이도**: ★★☆
- **선수 지식**: III-B-2
- **학습 목표**: 이 섹션을 마치면 React의 이벤트 시스템(SyntheticEvent)을 이해하고, onClick·onChange·onSubmit 핸들러를 올바르게 작성할 수 있다.
- **설명**: React의 이벤트 핸들러는 HTML과 비슷하지만 camelCase(`onClick`, `onChange`)를 쓴다. 핸들러에는 함수 자체를 전달해야 한다(`onClick={handleClick}` ○, `onClick={handleClick()}` ✕). React는 브라우저 이벤트를 SyntheticEvent로 감싸서 크로스 브라우저 호환성을 보장한다. 폼 제출 시 `e.preventDefault()`로 페이지 새로고침을 방지하는 것이 일반적이다.
- **핵심 키워드**: SyntheticEvent, onClick, onChange, onSubmit, preventDefault, 이벤트 전파
- **시각화 연결**: `chapter-03b-03-event-handler.html` — 이벤트 핸들러 패턴 인터랙티브 데모 (Chapter III-B-3)
- **다음 섹션**: III-B-4

---

### III-B-4. State 고급 — 객체/배열 불변 업데이트

- **난이도**: ★★☆
- **선수 지식**: III-B-3
- **학습 목표**: 이 섹션을 마치면 스프레드 연산자와 map/filter로 객체·배열 state를 불변하게 업데이트할 수 있다.
- **설명**: React의 state는 불변성을 지켜야 한다. 객체 state를 수정할 때 `setState({...prev, name: 'new'})`처럼 스프레드 연산자로 복사 후 변경한다. 배열에 추가는 `[...prev, newItem]`, 삭제는 `prev.filter(item => item.id !== id)`, 수정은 `prev.map(item => item.id === id ? {...item, done: true} : item)` 패턴을 사용한다. 직접 변경(push, splice 등)은 React가 변경을 감지하지 못해 리렌더링이 되지 않는다.
- **핵심 키워드**: 불변성, 스프레드 연산자, map, filter, 깊은 복사, 중첩 객체 업데이트
- **시각화 연결**: `chapter-03b-04-state-advanced.html` — 객체/배열 불변 업데이트 패턴 인터랙티브 체험 (Chapter III-B-4)
- **다음 섹션**: III-B-5

---

### III-B-5. useRef Hook — DOM 참조 + 렌더링 없는 값 저장

- **난이도**: ★★☆
- **선수 지식**: IV-1-2
- **학습 목표**: 이 섹션을 마치면 useRef로 DOM 요소에 접근하고, 렌더링을 유발하지 않는 값을 저장할 수 있다.
- **설명**: useRef는 렌더링을 트리거하지 않는 "기억 상자"다. useState는 값이 바뀌면 화면을 다시 그리지만, useRef는 값을 바꿔도 화면이 변하지 않는다. DOM 요소에 접근하거나(포커스, 스크롤), 렌더링 횟수·이전 값 등 내부 추적용 데이터를 저장할 때 사용한다.
- **핵심 키워드**: useRef, ref.current, DOM 참조, 렌더링 없는 값, 이전 값 패턴
- **시각화 연결**: `chapter-03b-05-useref.html` — useState vs useRef 비교 + DOM 포커스 + 렌더링 카운터 (Chapter III-B-5)
- **다음 섹션**: III-B-6

---

### III-B-6. useReducer — dispatch 흐름과 복잡한 상태 관리

- **난이도**: ★★☆
- **선수 지식**: IV-1-2
- **학습 목표**: 이 섹션을 마치면 useReducer로 복잡한 상태를 관리하고, dispatch-reducer 흐름을 설명할 수 있다.
- **설명**: useReducer는 useState의 대안이다. dispatch(요청서)를 reducer(은행원)에게 보내면, reducer가 규칙대로 state를 업데이트한다. 상태가 객체/배열이고 업데이트 방법이 여러 가지(추가/삭제/토글)일 때 useState보다 깔끔하다. Redux와 같은 원리이므로, useReducer를 익히면 Redux 학습이 수월해진다.
- **핵심 키워드**: useReducer, dispatch, reducer, action, payload, switch-case
- **시각화 연결**: `chapter-03b-06-usereducer.html` — dispatch 흐름 애니메이션 + 미니 Todo 앱 (Chapter III-B-6)
- **다음 섹션**: III-B-7

---

### III-B-7. 순수 컴포넌트와 Strict Mode

- **난이도**: ★★☆
- **선수 지식**: III-1-2
- **학습 목표**: 이 섹션을 마치면 순수 컴포넌트의 원칙을 이해하고, Strict Mode가 왜 2번 렌더링하는지 설명할 수 있다.
- **설명**: 순수 함수는 같은 입력에 항상 같은 출력을 반환하고, 외부 상태를 변경하지 않는다. React 컴포넌트도 이 원칙을 따라야 한다. 렌더링 중에 외부 변수를 변경하거나 API를 호출하면 버그의 원인이 된다. React.StrictMode는 개발 모드에서 컴포넌트를 2번 렌더링하여 불순 로직을 일찍 발견하게 돕는다.
- **핵심 키워드**: 순수 함수, 순수 컴포넌트, 사이드 이펙트, React.StrictMode, 렌더링 규칙
- **시각화 연결**: `chapter-03b-07-pure-component.html` — 순수/불순 비교 + Strict Mode 시뮬레이션 (Chapter III-B-7)
- **다음 섹션**: III-B-8

---

### III-B-8. CSS 스타일링 비교 — 인라인/Modules/Styled/Tailwind

- **난이도**: ★★☆
- **선수 지식**: III-1-3
- **학습 목표**: 이 섹션을 마치면 React에서 사용하는 4가지 CSS 스타일링 방식의 차이를 이해하고, 프로젝트에 맞는 방식을 선택할 수 있다.
- **설명**: 인라인 스타일은 가장 기본적이지만 hover/미디어 쿼리가 불가하다. CSS Modules는 클래스명을 자동 해시화하여 충돌을 방지한다. Styled Components는 JS 안에서 CSS를 작성하며 props 기반 동적 스타일링이 강점이다. Tailwind CSS는 유틸리티 클래스를 조합하는 방식으로, 2024년 이후 가장 인기 있는 React 스타일링 도구다.
- **핵심 키워드**: 인라인 스타일, CSS Modules, Styled Components, Tailwind CSS, camelCase
- **시각화 연결**: `chapter-03b-08-css-styling.html` — 4가지 스타일링 방식 인터랙티브 비교 (Chapter III-B-8)
- **다음 섹션**: IV-1-1

---

## Part IV. 컴포넌트·Hooks

> **독자**: React 기본 문법을 알고 있고, 내부 동작 원리를 이해하고 싶은 독자.

---

### IV-1-1. 렌더링 파이프라인 — state에서 Real DOM까지

- **난이도**: ★★☆
- **선수 지식**: III-1-5
- **학습 목표**: 이 섹션을 마치면 state 변경이 Virtual DOM 재구성 → Diffing → Real DOM 패치까지 이어지는 5단계 흐름을 설명할 수 있다.
- **설명**: React의 렌더링은 단계별 파이프라인이다. ① 버튼 클릭 같은 이벤트 발생 → ② `setState` 호출로 업데이트 예약(Automatic Batching으로 묶임) → ③ 컴포넌트 함수 재실행으로 새 Virtual DOM 생성(Fiber reconciler 관리) → ④ 이전·새 Virtual DOM을 비교해 변경 지점 계산(Diffing) → ⑤ 변경된 부분만 Real DOM에 반영(패치). 전체 DOM을 새로 그리지 않으므로 성능이 유지된다.
- **핵심 키워드**: Virtual DOM, Diffing, Real DOM 패치, Fiber reconciler, Automatic Batching, 렌더링 파이프라인
- **시각화 연결**: `chapter-04-01-rendering.html` — 5단계 파이프라인 인터랙티브 시각화 (Chapter IV-1-1)
- **다음 섹션**: IV-1-2

---

### IV-1-2. useState — 상태 선언과 업데이트

- **난이도**: ★★☆
- **선수 지식**: IV-1-1
- **학습 목표**: 이 섹션을 마치면 `useState`로 상태를 선언하고, 함수형 업데이트(functional update)를 사용해 안전하게 state를 변경할 수 있다.
- **설명**: `const [count, setCount] = useState(0)`은 "count라는 상자와, 상자를 업데이트하는 함수 setCount"를 만든다. state가 바뀌면 React는 해당 컴포넌트를 다시 렌더링한다. 중요한 점: `setCount(count + 1)`은 현재 렌더링 시점의 `count`를 참조하므로, 연속 업데이트 시 `setCount(prev => prev + 1)` 형태의 함수형 업데이트를 써야 안전하다.
- **핵심 키워드**: useState, state 업데이트, 함수형 업데이트, 재렌더링, 불변성(Immutability)
- **시각화 연결**: `chapter-04-02-usestate.html` — 카운터 데모 + 함수형 업데이트 비교 + 불변성 체험 (Chapter IV-1-2)
- **다음 섹션**: IV-1-3

---

### IV-1-3. useEffect — 사이드 이펙트 다루기

- **난이도**: ★★☆
- **선수 지식**: IV-1-2
- **학습 목표**: 이 섹션을 마치면 `useEffect`의 의존성 배열을 올바르게 설정하고, 클린업 함수로 메모리 누수를 방지할 수 있다.
- **설명**: `useEffect`는 렌더링 결과가 화면에 반영된 후 실행된다. API 호출, 타이머 설정, 외부 라이브러리 연동 같은 "사이드 이펙트"를 처리하는 곳이다. 두 번째 인자 의존성 배열(`[]`)이 핵심: 빈 배열이면 처음 한 번만 실행, 값이 있으면 해당 값이 바뀔 때마다 실행. 반환 함수(클린업)는 컴포넌트가 사라질 때 타이머·구독을 정리하는 역할을 한다.
- **핵심 키워드**: useEffect, 의존성 배열, 클린업 함수, 사이드 이펙트, 마운트/언마운트
- **시각화 연결**: `chapter-04-03-useeffect.html` — 의존성 배열 3가지 모드 생명주기 인터랙티브 시각화 (Chapter IV-1-3)
- **다음 섹션**: IV-1-4

---

### IV-1-4. 커스텀 Hook — 로직 재사용

- **난이도**: ★★★
- **선수 지식**: IV-1-3
- **학습 목표**: 이 섹션을 마치면 반복되는 상태·이펙트 로직을 커스텀 Hook으로 추출하고, 여러 컴포넌트에서 재사용할 수 있다.
- **설명**: 여러 컴포넌트에서 "API 데이터 로딩 → loading/error/data 상태 관리"가 반복된다면, 이 패턴을 `useFetch(url)` 커스텀 Hook으로 추출할 수 있다. 커스텀 Hook은 이름이 반드시 `use`로 시작해야 하고, 내부에서 다른 Hook을 호출할 수 있다. 컴포넌트에서 UI와 로직을 분리해 테스트 가능성을 높이는 핵심 패턴이다.
- **핵심 키워드**: 커스텀 Hook, `use` 접두사, 로직 재사용, 관심사 분리(Separation of Concerns)
- **시각화 연결**: `chapter-04-04-custom-hook.html` — 코드 중복 → Hook 추출 시뮬레이션 + 실무 패턴 갤러리 (Chapter IV-1-4)
- **다음 섹션**: V-1-1

---

## Part V. 상태 관리·라우팅·API

> **독자**: React 컴포넌트를 만들 수 있고, 실제 앱을 구성하는 방법을 배우려는 독자.

---

### V-1-1. 전역 상태 관리가 필요한 이유

- **난이도**: ★★★
- **선수 지식**: IV-1-4
- **학습 목표**: 이 섹션을 마치면 Props Drilling 문제를 이해하고, Context API로 해결하는 시나리오를 설명할 수 있다.
- **설명**: 컴포넌트 계층이 깊어지면 "Props를 부모 → 자식 → 손자 → 증손자"로 계속 내려줘야 하는 Props Drilling 문제가 생긴다. Context API는 중간 컴포넌트를 건너뛰고 필요한 곳에서 직접 값을 꺼낼 수 있는 "전역 저장소 통로"다. 자주 바뀌지 않는 값(테마, 로그인 사용자, 언어 설정)에 적합하다. 빈번한 업데이트에는 Context 대신 외부 상태 라이브러리를 고려한다.
- **핵심 키워드**: Props Drilling, Context API, createContext, useContext, 전역 상태
- **시각화 연결**: `chapter-05-01-context-api.html` — Props Drilling→Context API 해결 시각화 (Chapter V-1-1)
- **다음 섹션**: V-1-2

---

### V-1-2. 외부 상태 라이브러리 — Zustand / Redux Toolkit

- **난이도**: ★★★
- **선수 지식**: V-1-1
- **학습 목표**: 이 섹션을 마치면 Zustand와 Redux Toolkit의 차이를 이해하고, 프로젝트 규모에 따라 어떤 것을 선택할지 판단할 수 있다.
- **설명**: Zustand는 "전역 상태를 가진 커스텀 Hook" 수준으로 사용법이 단순하다. 설치 후 `create()` 한 번으로 스토어를 만들고 컴포넌트에서 `useStore()`로 꺼내 쓴다. Redux Toolkit(RTK)은 Redux의 복잡한 보일러플레이트를 줄인 공식 권장 도구다. 대규모 팀, 타임트래블 디버깅, DevTools 활용이 필요할 때 유리하다. 2~3인 팀 소규모 프로젝트는 Zustand, 5인 이상 복잡한 도메인은 RTK를 고려한다.
- **핵심 키워드**: Zustand, Redux Toolkit(RTK), 스토어(Store), 액션(Action), 슬라이스(Slice), DevTools
- **시각화 연결**: `chapter-05-02-state-libraries.html` — Zustand vs Redux Toolkit 비교 + 선택 가이드 (Chapter V-1-2)
- **다음 섹션**: V-1-3

---

### V-1-3. React Router — 클라이언트 사이드 라우팅

- **난이도**: ★★★
- **선수 지식**: V-1-2
- **학습 목표**: 이 섹션을 마치면 React Router v6로 중첩 라우트(Nested Routes)를 구성하고, 프로그래밍 방식으로 페이지를 이동할 수 있다.
- **설명**: SPA에서 URL이 바뀔 때 브라우저의 History API를 이용해 실제 서버 요청 없이 화면을 전환하는 것이 클라이언트 사이드 라우팅이다. React Router v6는 `<BrowserRouter>`, `<Routes>`, `<Route>` 컴포넌트로 URL과 컴포넌트를 매핑한다. 중첩 라우트(`<Outlet>`)를 사용하면 레이아웃(헤더·사이드바)을 공유하면서 내용 부분만 바꾸는 구조를 만들 수 있다.
- **핵심 키워드**: React Router v6, BrowserRouter, Outlet, useNavigate, useParams, 중첩 라우트
- **시각화 연결**: `chapter-05-03-react-router.html` — URL↔컴포넌트 매핑 + 미니 라우터 시뮬레이터 (Chapter V-1-3)
- **다음 섹션**: V-1-4

---

### V-1-4. 서버에서 데이터 가져오기 — fetch / React Query

- **난이도**: ★★★
- **선수 지식**: V-1-3
- **학습 목표**: 이 섹션을 마치면 TanStack Query(React Query)로 서버 데이터를 캐싱·리패치·에러 처리하는 패턴을 구현할 수 있다.
- **설명**: `useEffect` + `fetch`로 API를 호출하면 로딩·에러·캐시 처리를 직접 구현해야 한다. TanStack Query(구 React Query)는 이 반복 패턴을 `useQuery(queryKey, fetchFn)` 한 줄로 해결한다. 같은 queryKey를 가진 요청은 자동으로 캐시되고, 일정 시간 후 백그라운드에서 자동 리패치한다. 서버 상태와 클라이언트 상태를 분리해 관리하는 모던 React 패턴의 핵심이다.
- **핵심 키워드**: TanStack Query, useQuery, useMutation, queryKey, 캐싱, 서버 상태 vs 클라이언트 상태
- **시각화 연결**: `chapter-05-04-data-fetching.html` — fetch vs React Query 캐싱·리패치 시각화 (Chapter V-1-4)
- **다음 섹션**: VI-1-1

---

## Part VI. 실전 프론트엔드 프로젝트

> **독자**: React 핵심 개념을 알고 있고, 실제 서비스 수준의 앱을 만들어보려는 독자.

---

### VI-1-1. 프로젝트 설계 — 폴더 구조와 컴포넌트 분해

- **난이도**: ★★★
- **선수 지식**: V-1-4
- **학습 목표**: 이 섹션을 마치면 기능 중심 폴더 구조를 설계하고, 컴포넌트를 역할(UI / 로직 / 데이터)로 분리할 수 있다.
- **설명**: React 앱 규모가 커지면 폴더 구조가 유지보수성을 결정한다. "type 중심"(components/, hooks/, pages/ 등)은 작은 앱에 맞다. "feature 중심"(features/auth/, features/cart/ 등)은 팀이 크거나 도메인이 복잡할 때 맞다. 컴포넌트는 "순수 UI 컴포넌트(Presentational)"와 "데이터·로직을 다루는 컨테이너 컴포넌트(Container)"로 나누는 패턴이 코드 재사용성을 높인다.
- **핵심 키워드**: feature-based 구조, Presentational/Container 패턴, 폴더 설계, 컴포넌트 분해
- **시각화 연결**: `chapter-06-01-project-structure.html` — type vs feature 폴더 구조 비교 + 컴포넌트 분해 패턴 (Chapter VI-1-1)
- **다음 섹션**: VI-1-2

---

### VI-1-2. 폼과 유효성 검사 — React Hook Form

- **난이도**: ★★★
- **선수 지식**: VI-1-1
- **학습 목표**: 이 섹션을 마치면 React Hook Form으로 폼 상태를 관리하고, Zod와 연동해 타입 안전한 유효성 검사를 구현할 수 있다.
- **설명**: 직접 useState로 폼 필드를 관리하면 필드가 늘어날수록 코드가 폭발적으로 증가한다. React Hook Form은 ref 기반으로 불필요한 리렌더링을 줄이면서 폼 상태를 관리한다. `useForm()` 한 번으로 `register`, `handleSubmit`, `formState.errors`를 꺼내 쓴다. Zod 스키마와 `@hookform/resolvers`를 조합하면 타입 안전 검증까지 한 번에 해결된다.
- **핵심 키워드**: React Hook Form, Zod, useForm, register, handleSubmit, 유효성 검사
- **시각화 연결**: `chapter-06-02-forms.html` — useState 폼 vs React Hook Form + Zod 비교 + 인터랙티브 폼 데모 (Chapter VI-1-2)
- **다음 섹션**: VI-1-3

---

### VI-1-3. 인증(Auth) 흐름 구현

- **난이도**: ★★★
- **선수 지식**: VI-1-2
- **학습 목표**: 이 섹션을 마치면 JWT 기반 로그인 흐름을 React 앱에서 구현하고, 인증이 필요한 라우트를 보호하는 컴포넌트를 만들 수 있다.
- **설명**: 일반적인 흐름: 로그인 API 호출 → 서버가 JWT 반환 → localStorage 또는 httpOnly 쿠키에 저장 → 이후 모든 API 요청 헤더에 `Authorization: Bearer <token>` 포함. React 앱에서는 Context나 Zustand 스토어에 사용자 정보를 저장하고, 보호 라우트는 `<PrivateRoute>` 컴포넌트로 감싸 미인증 사용자를 로그인 페이지로 리다이렉트한다.
- **핵심 키워드**: JWT, localStorage, httpOnly 쿠키, PrivateRoute, Authorization 헤더, 토큰 만료
- **시각화 연결**: `chapter-06-03-auth-flow.html` — JWT 로그인 흐름 + PrivateRoute 시뮬레이션 (Chapter VI-1-3)
- **다음 섹션**: VI-1-4

---

### VI-1-4. 에러 경계와 로딩 상태 처리

- **난이도**: ★★★
- **선수 지식**: VI-1-3
- **학습 목표**: 이 섹션을 마치면 React Error Boundary로 런타임 에러를 잡고, Suspense와 로딩 스켈레톤으로 사용자 경험을 개선할 수 있다.
- **설명**: 에러 경계(Error Boundary)는 하위 컴포넌트에서 발생한 JS 에러를 잡아 대체 UI를 보여주는 Class 컴포넌트다(현재 함수형 Hook 미지원). React 18의 `<Suspense>`는 비동기 데이터 로딩 중 fallback UI를 보여주는 공식 패턴이다. 로딩 스켈레톤(Skeleton)은 "흰 화면" 대신 레이아웃을 미리 그려주어 체감 속도를 높인다.
- **핵심 키워드**: Error Boundary, Suspense, 로딩 스켈레톤, fallback, 런타임 에러 처리
- **시각화 연결**: `chapter-06-04-error-boundary.html` — Error Boundary + Suspense + Skeleton 조합 패턴 (Chapter VI-1-4)
- **다음 섹션**: VII-1-1

---

## Part VII. 배포 (Vercel / Netlify)

> **독자**: React 앱을 완성했고, 인터넷에 공개하고 싶은 독자.

---

### VII-1-1. 빌드 결과물 이해하기

- **난이도**: ★★★
- **선수 지식**: VI-1-4
- **학습 목표**: 이 섹션을 마치면 `npm run build` 결과물의 구조를 이해하고, 정적 파일 서버로 배포하는 원리를 설명할 수 있다.
- **설명**: `npm run build`를 실행하면 Vite(또는 webpack)가 JS/CSS 파일을 번들링·최소화(Minify)해 `dist/` 폴더를 생성한다. 이 폴더 안에는 `index.html`과 해시가 붙은 JS·CSS 파일이 있다. 이 정적 파일을 CDN이나 정적 호스팅 서버에 올리면 배포가 완료된다. 브라우저가 `index.html`을 받고 JS를 실행해 React 앱을 그리는 CSR(클라이언트 사이드 렌더링) 방식이다.
- **핵심 키워드**: `npm run build`, dist, 번들링, 최소화(Minify), 정적 파일, CSR
- **시각화 연결**: `chapter-07-01-build.html` — 번들링·최소화·dist 구조 + CSR 흐름 시각화 (Chapter VII-1-1)
- **다음 섹션**: VII-1-2

---

### VII-1-2. Vercel로 배포하기

- **난이도**: ★★★
- **선수 지식**: VII-1-1
- **학습 목표**: 이 섹션을 마치면 GitHub 레포를 Vercel에 연결해 push 시 자동 배포되는 CI/CD 파이프라인을 구성할 수 있다.
- **설명**: Vercel은 Vite/React 앱 배포에 최적화된 플랫폼이다. GitHub 레포를 연결하면 `main` 브랜치에 push할 때마다 자동으로 빌드·배포가 실행된다. Pull Request를 열면 Preview URL이 자동 생성되어 팀이 실제 배포 전 확인할 수 있다. 무료 플랜으로 개인 프로젝트·포트폴리오를 운영하기에 충분하다.
- **핵심 키워드**: Vercel, GitHub 연동, 자동 배포, Preview URL, CI/CD, 무료 플랜
- **시각화 연결**: `chapter-07-02-vercel.html` — GitHub→Vercel 자동 배포 흐름 + Preview URL 시뮬레이션 (Chapter VII-1-2)
- **다음 섹션**: VII-1-3

---

### VII-1-3. 환경 변수와 API 키 보호

- **난이도**: ★★★
- **선수 지식**: VII-1-2
- **학습 목표**: 이 섹션을 마치면 Vite의 환경 변수 규칙(`VITE_` 접두사)을 이해하고, API 키를 코드에 노출하지 않고 배포할 수 있다.
- **설명**: `.env` 파일에 `VITE_API_URL=https://api.example.com` 형식으로 환경 변수를 정의하고, 코드에서 `import.meta.env.VITE_API_URL`로 접근한다. `VITE_`가 없는 변수는 브라우저에 노출되지 않는다. 중요: Vite 환경 변수는 빌드 시 번들에 포함되므로 브라우저에서 볼 수 있다. 진짜 비밀(API 시크릿 키, DB 비밀번호)은 절대 프론트엔드에 두면 안 된다 — 백엔드 서버에서만 사용해야 한다.
- **핵심 키워드**: `.env`, `VITE_` 접두사, `import.meta.env`, 환경 변수, 보안 주의사항
- **시각화 연결**: `chapter-07-03-env-variables.html` — .env 파일 관리 + VITE_ 접두사 + 보안 체크리스트 (Chapter VII-1-3)
- **다음 섹션**: VII-1-4

---

### VII-1-4. 성능 최적화 기초

- **난이도**: ★★★
- **선수 지식**: VII-1-3
- **학습 목표**: 이 섹션을 마치면 `React.memo`, `useMemo`, `useCallback`의 적절한 사용 시점을 이해하고, 불필요한 리렌더링을 줄일 수 있다.
- **설명**: React는 state나 props가 바뀌면 해당 컴포넌트와 그 아래 모든 자식을 리렌더링한다. `React.memo`는 props가 바뀌지 않으면 자식 컴포넌트의 리렌더링을 건너뛴다. `useMemo`는 무거운 계산 결과를 캐싱한다. `useCallback`은 함수 참조를 캐싱해 자식에게 새 함수가 전달되지 않도록 한다. 단, 과도한 메모이제이션은 오히려 복잡도만 올린다 — 성능 문제가 실제로 측정됐을 때만 적용한다.
- **핵심 키워드**: React.memo, useMemo, useCallback, 리렌더링 최적화, 메모이제이션, 프로파일링
- **시각화 연결**: `chapter-07-04-performance.html` — React.memo/useMemo/useCallback 동작 원리 + 최적화 가이드 (Chapter VII-1-4)
- **다음 섹션**: 부록 A

---

## 부록

### 부록 A. 용어집

| 용어 | 영문 | 한 줄 설명 |
|:--|:--|:--|
| 컴포넌트 | Component | UI의 기본 단위. 함수처럼 생겼고 JSX를 반환한다 |
| 상태 | State | 컴포넌트가 기억하는 값. 바뀌면 화면이 다시 그려진다 |
| Props | Properties | 부모가 자식에게 전달하는 읽기 전용 값 |
| JSX | JSX | JS 안에 HTML처럼 UI를 쓰는 문법. 빌드 시 createElement()로 변환 |
| Virtual DOM | Virtual DOM | 실제 DOM의 가벼운 복사본. 메모리 안에서 비교·계산한다 |
| 렌더링 | Rendering | state/props를 바탕으로 UI를 화면에 그리는 과정 |
| 리렌더링 | Re-rendering | state·props가 바뀌어 컴포넌트가 다시 실행되는 것 |
| Diffing | Diffing | 이전·새 Virtual DOM을 비교해 변경점을 찾는 알고리즘 |
| Fiber | Fiber | React 16+ 렌더링 엔진. 작업을 작은 단위로 쪼개 중단·재개 가능 |
| Hooks | Hooks | 함수형 컴포넌트에서 상태·생명주기를 쓸 수 있게 하는 함수 |
| useState | useState | 상태를 선언하는 기본 Hook |
| useEffect | useEffect | 사이드 이펙트(API 호출·타이머)를 처리하는 Hook |
| 의존성 배열 | Dependency Array | useEffect가 실행 조건을 감시하는 값 목록 |
| 클린업 | Cleanup | 컴포넌트가 사라질 때 타이머·구독을 정리하는 함수 |
| 커스텀 Hook | Custom Hook | use로 시작하는, 로직을 재사용하는 사용자 정의 Hook |
| 단방향 데이터 흐름 | Unidirectional Data Flow | 부모 → 자식 방향으로만 데이터가 흐르는 React의 원칙 |
| Props Drilling | Props Drilling | 중간 컴포넌트를 거쳐 깊이 props를 전달해야 하는 불편함 |
| Context API | Context API | 계층 구조를 건너뛰어 전역 값을 공유하는 React 내장 기능 |
| 불변성 | Immutability | 기존 값을 직접 바꾸지 않고 새 값을 만드는 원칙 |
| SPA | Single-Page Application | 처음 한 번만 HTML을 받고 이후 JS로 화면을 전환하는 앱 |
| CSR | Client-Side Rendering | 브라우저에서 JS가 DOM을 생성하는 렌더링 방식 |
| SSR | Server-Side Rendering | 서버에서 HTML을 생성해 브라우저에 전달하는 렌더링 방식 |
| Hydration | Hydration | SSR로 받은 HTML에 React가 이벤트를 붙이는 과정 |
| Automatic Batching | Automatic Batching | React 18에서 강화. 여러 setState를 한 번의 렌더링으로 묶음 |
| 에러 경계 | Error Boundary | 하위 컴포넌트 에러를 잡아 대체 UI를 보여주는 컴포넌트 |
| Suspense | Suspense | 비동기 데이터 로딩 중 fallback을 보여주는 React 공식 패턴 |
| 메모이제이션 | Memoization | 계산 결과를 캐싱해 불필요한 재계산을 방지하는 기법 |
| 번들러 | Bundler | 여러 JS 파일을 하나로 묶어 브라우저에 전달하는 도구 |
| HMR | Hot Module Replacement | 코드 변경 시 브라우저 전체 새로고침 없이 변경된 모듈만 갱신 |
| Vite | Vite | esbuild 기반의 빠른 번들러 겸 개발 서버. React 공식 권장 |

---

### 부록 B. FAQ

**Q1. Class 컴포넌트를 꼭 배워야 하나요?**
A. 신규 코드는 함수형 + Hooks로 작성한다. 기존 레거시 코드를 읽어야 할 상황이 있으므로 Class 컴포넌트 문법(lifecycle 메서드 등)을 한 번 훑어두는 정도로 충분하다.

**Q2. Redux를 꼭 써야 하나요?**
A. 아니다. 소규모 프로젝트는 Context API, 중간 규모는 Zustand로 충분하다. Redux Toolkit은 대규모 팀 또는 DevTools·타임트래블 디버깅이 필요할 때 고려한다.

**Q3. TypeScript를 함께 써야 하나요?**
A. 실무에서는 TypeScript 사용이 표준에 가깝다. React + TypeScript 조합은 Props 타입을 명확히 해 런타임 에러를 줄인다. 이 커리큘럼은 JS 기준으로 서술했지만, Part III 이후부터 TypeScript 버전도 병행 학습을 권장한다.

**Q4. Virtual DOM은 항상 빠른가요?**
A. 아니다. 아주 단순한 앱에서는 직접 DOM 조작이 더 빠를 수 있다. Virtual DOM의 장점은 "대규모 UI에서 개발자가 DOM 조작을 신경 쓰지 않아도 합리적인 성능을 유지"하는 데 있다.

**Q5. React 18의 Concurrent Mode는 무엇인가요?**
A. Concurrent Mode(동시 렌더링)는 React 18에서 정식 도입됐다. 렌더링 작업을 중단하고 더 급한 업데이트(사용자 입력)를 먼저 처리할 수 있다. `useTransition`, `useDeferredValue` Hook으로 활용한다.

**Q6. Next.js를 바로 배워도 되나요?**
A. React 기초(컴포넌트·state·props·useEffect)를 먼저 이해한 후 Next.js로 넘어가는 것을 권장한다. Next.js의 SSR/RSC(React Server Components) 개념은 React 렌더링 원리를 알아야 제대로 이해된다.

**Q7. useEffect 의존성 배열에 함수를 넣으면 무한 루프가 생기는 이유는?**
A. 컴포넌트가 렌더링될 때마다 함수가 새로 만들어지기 때문이다. `useCallback`으로 함수를 메모이제이션하거나, 함수를 `useEffect` 내부로 이동시켜 해결한다.

**Q8. key prop은 왜 필요한가요?**
A. 배열을 렌더링할 때 React는 `key`로 어떤 아이템이 추가·삭제·순서 변경됐는지 추적한다. `key`가 없으면 목록 전체를 다시 그릴 수 있다. `index`를 key로 쓰면 순서가 바뀔 때 버그가 생길 수 있다 — 고유한 ID를 사용하는 것이 안전하다.

**Q9. 이 커리큘럼의 시각화 HTML 파일은 왜 빌드 없이 동작하나요?**
A. CDN으로 React 18과 Babel Standalone을 로드하고, `<script type="text/babel">` 블록에서 JSX를 브라우저가 실시간 변환한다. 학습용 시각화에 적합하지만, 프로덕션 앱은 Vite 빌드를 사용해야 한다.

**Q10. React Server Components(RSC)는 무엇인가요?**
A. RSC는 서버에서 실행되어 HTML을 생성하는 컴포넌트다. 클라이언트 JS 번들에 포함되지 않아 초기 로딩 속도와 SEO를 개선한다. Next.js App Router에서 기본 컴포넌트가 RSC다. React 18 이후 실험적 기능에서 정식화됐다.

---

### 부록 C. 다음에 공부할 것

이 커리큘럼을 마친 후 이어서 학습하면 좋은 주제:

1. **Next.js** — React 기반 풀스택 프레임워크. SSR·SSG·RSC·App Router 이해.
2. **TypeScript** — React + TypeScript 조합으로 타입 안전성 강화.
3. **Testing** — React Testing Library + Vitest로 컴포넌트 단위 테스트.
4. **Storybook** — 컴포넌트를 독립 환경에서 개발·문서화.
5. **Tailwind CSS** — 유틸리티 클래스 기반 스타일링. Vite 프로젝트와 궁합이 좋다.
6. **백엔드 연동** — FastAPI(Python) 또는 Spring Boot(Java)와 REST API 통신.
7. **Docker** — React 앱을 컨테이너화해 어디서나 같은 환경으로 실행.

---

### 부록 D. 참고 자료

| # | 출처 | URL |
|:--|:--|:--|
| 1 | React 공식 문서 | https://react.dev/ |
| 2 | React 18 릴리즈 노트 | https://react.dev/blog/2022/03/29/react-v18 |
| 3 | React 공식 한국어 문서 | https://ko.react.dev/ |
| 4 | Vite 공식 문서 | https://vitejs.dev/ |
| 5 | TanStack Query 공식 문서 | https://tanstack.com/query/latest |
| 6 | React Router v6 공식 문서 | https://reactrouter.com/en/main |
| 7 | Zustand GitHub | https://github.com/pmndrs/zustand |
| 8 | Redux Toolkit 공식 문서 | https://redux-toolkit.js.org/ |
| 9 | React Hook Form 공식 문서 | https://react-hook-form.com/ |
| 10 | Zod 공식 문서 | https://zod.dev/ |
| 11 | Vercel 배포 가이드 | https://vercel.com/docs |
| 12 | Netlify 배포 가이드 | https://docs.netlify.com/ |
| 13 | TechEmpower 벤치마크 | https://www.techempower.com/benchmarks/ |
| 14 | React Fiber 아키텍처 해설 | https://github.com/acdlite/react-fiber-architecture |
| 15 | Dan Abramov — A Complete Guide to useEffect | https://overreacted.io/a-complete-guide-to-useeffect/ |
| 16 | Kent C. Dodds — React 관련 블로그 | https://kentcdodds.com/blog |

**[확인 필요]**: 위 URL의 최신 유효성은 2026-04-19 기준 확인. 공식 문서 이외의 블로그 링크는 별도 검증 권장.

---

*2026-04-19 기준. React 18 + Hooks 기반.*
