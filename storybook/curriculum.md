# Storybook 인터랙티브 학습 커리큘럼

UI 컴포넌트를 앱과 분리해 독립 워크숍에서 만들고 테스트하고 문서화하는 도구 — Storybook.

## 독자 가이드

- **선수 지식**: React/TypeScript 기초, npm/Vite 사용 경험, Jest/Vitest 기초(있으면 좋음)
- **목표**: 컴포넌트 카탈로그 한 채를 짓고 → 자동 문서 + 시각 회귀 테스트 + Chromatic 배포까지 끝까지 흐른다
- **분량**: 5 Parts × 20 sections (Phase A: Part I + Part II 8개로 시작, 이후 Phase B/C로 증축)

---

## Part I. Storybook 기초 (Story / Args / Render / CSF)

학습 목표: "왜 Story가 함수가 아니라 객체인지", "Args가 왜 prop의 단순 별칭이 아닌지"를 안다.

### Section I-1-1. Storybook이 푸는 문제 — UI 워크숍
- **난이도**: ★☆☆
- **선수 지식**: React 컴포넌트 기초
- **학습 목표**: 앱에서 컴포넌트를 분리한 "워크숍"이 왜 필요한지, 페이지 전체를 띄우고 컴포넌트 한 개를 테스트하는 방식의 한계를 안다.
- **핵심 키워드**: [컴포넌트 격리, UI 워크숍, story, 개발 속도]
- **시각화 연결**: [Storybook이 푸� 문제 시각화 보기](part1/I-1-1.html) — "옷가게 진열대 vs 옷장 안" 비유, 4단계로 앱 통합 / 격리 부재 / Story 진열대 / 워크숍 완성
- **다음 섹션**: I-1-2

### Section I-1-2. Story와 CSF (Component Story Format)
- **난이도**: ★☆☆
- **선수 지식**: I-1-1
- **학습 목표**: `.stories.tsx` 파일 한 개에 `meta` + `Story` 객체를 작성하는 CSF 3 포맷을 읽고 쓸 수 있다.
- **핵심 키워드**: [default export meta, named export Story, CSF3, args]
- **시각화 연결**: [Story와 CSF 시각화 보기](part1/I-1-2.html) — `.stories.tsx` 파일 한 개를 4단계로 해부 (component / meta / Story / args)
- **다음 섹션**: I-2-1

### Section I-2-1. Args — Story의 props를 데이터로
- **난이도**: ★★☆
- **선수 지식**: I-1-2
- **학습 목표**: Story의 `args`가 단순 props가 아니라 "데이터로 표현된 상태"이며, Controls/Actions/Docs와 어떻게 연결되는지 안다.
- **핵심 키워드**: [args, argTypes, controls, 데이터 = UI 상태]
- **시각화 연결**: [Args 시각화 보기](part1/I-2-1.html) — Button props → args 객체 → Storybook UI 4단계 흐름
- **다음 섹션**: I-2-2

### Section I-2-2. Render 함수와 Decorator
- **난이도**: ★★☆
- **선수 지식**: I-2-1
- **학습 목표**: `render` 함수로 props 외 컨텍스트(테마, Router 등)를 감싸고, `decorators`로 모든 Story 공통 wrapper를 적용할 수 있다.
- **핵심 키워드**: [render, decorators, ThemeProvider 래핑, story 합성]
- **시각화 연결**: [Render와 Decorator 시각화 보기](part1/I-2-2.html) — 양파 껍질 비유, 4단계로 raw Story → render 래핑 → decorator 추가 → 합성 완성
- **다음 섹션**: II-1-1

---

## Part II. 컴포넌트 카탈로그 (Controls / Actions / Viewport / Backgrounds)

학습 목표: Storybook UI의 4대 패널(Controls, Actions, Viewport, Backgrounds)로 코드 변경 없이 상태/이벤트/환경을 검증한다.

### Section II-1-1. Controls — props를 GUI로 조작
- **난이도**: ★★☆
- **선수 지식**: I-2-1
- **학습 목표**: argTypes로 select/boolean/color/range 컨트롤을 명시해 디자이너/QA가 코드 없이 props 조합을 실험하게 한다.
- **핵심 키워드**: [Controls 패널, argTypes, control type, GUI 실험]
- **시각화 연결**: [Controls 시각화 보기](part2/II-1-1.html) — "리모컨" 비유, 5단계로 props 미정의 → string input → select → boolean toggle → 완성된 리모컨
- **다음 섹션**: II-1-2

### Section II-1-2. Actions — 이벤트 핸들러를 로그로
- **난이도**: ★★☆
- **선수 지식**: II-1-1
- **학습 목표**: `argTypes: { onClick: { action: 'clicked' } }`로 이벤트 호출을 Actions 패널에 기록하고, 모의 핸들러(`fn()`)로 호출 인자를 검증한다.
- **핵심 키워드**: [Actions 패널, action arg, fn(), 이벤트 로그]
- **시각화 연결**: [Actions 시각화 보기](part2/II-1-2.html) — "블랙박스 녹화" 비유, 4단계로 미연결 → action 선언 → 클릭 발생 → 로그 누적
- **다음 섹션**: II-2-1

### Section II-2-1. Viewport — 반응형 화면 크기
- **난이도**: ★★☆
- **선수 지식**: II-1-1
- **학습 목표**: Viewport addon으로 mobile/tablet/desktop을 한 패널에서 전환해 미디어쿼리/레이아웃 깨짐을 빠르게 잡는다.
- **핵심 키워드**: [Viewport, MINIMAL_VIEWPORTS, parameters.viewport, 반응형 QA]
- **시각화 연결**: [Viewport 시각화 보기](part2/II-2-1.html) — "옷걸이 옷장" 비유, 4단계로 desktop 한 사이즈 → mobile 추가 → tablet 추가 → 비교 매트릭스
- **다음 섹션**: II-2-2

### Section II-2-2. Backgrounds — 라이트/다크/브랜드 컬러
- **난이도**: ★★☆
- **선수 지식**: II-2-1
- **학습 목표**: Backgrounds addon으로 light/dark/brand 컬러 배경을 토글하며 contrast / hover 가독성 문제를 노출한다.
- **핵심 키워드**: [Backgrounds, parameters.backgrounds, dark mode, contrast QA]
- **시각화 연결**: [Backgrounds 시각화 보기](part2/II-2-2.html) — "스튜디오 배경지" 비유, 4단계로 흰배경 → 다크 추가 → 브랜드 추가 → 토글 패널 완성
- **다음 섹션**: III-1-1 (Phase B 예정)

---

## Part III. 인터랙션 / 접근성 / 시각 회귀 테스트 (Phase B 예정)

학습 목표: Play function으로 사용자 흐름을 코드로 적고, a11y addon으로 위반 항목을 잡고, Chromatic으로 스냅샷 회귀를 막는다.

- Section III-1-1. Play function — user 인터랙션 자동 실행
- Section III-1-2. Interactions addon — 실패 시 단계별 리플레이
- Section III-2-1. Accessibility addon — WCAG 위반 자동 탐지
- Section III-2-2. Visual regression — Chromatic 스냅샷 diff

---

## Part IV. 자동 문서화 (Autodocs / MDX / JSDoc) (Phase B 예정)

학습 목표: 코드에서 prop 타입과 JSDoc을 추출해 컴포넌트 문서를 자동 생성한다.

- Section IV-1-1. Autodocs — `tags: ['autodocs']` 한 줄로 문서 페이지
- Section IV-1-2. MDX 사용법 — story + 자유 글을 한 페이지에
- Section IV-2-1. JSDoc / TypeScript prop description 추출
- Section IV-2-2. Doc Block 컴포넌트 (`<Canvas>`, `<Controls>`)

---

## Part V. CI/배포 (Chromatic / Build / 공유) (Phase C 예정)

학습 목표: Storybook을 정적 사이트로 빌드해 팀 공용 URL로 배포하고, PR마다 시각 회귀를 검증한다.

- Section V-1-1. `storybook build` 정적 산출물
- Section V-1-2. Chromatic — 무료 호스팅 + 시각 회귀
- Section V-2-1. GitHub Pages / Vercel / Netlify 배포
- Section V-2-2. CI 통합 (GitHub Actions 워크플로)

---

## Phase A 범위 (현재 스프린트)

| Section | 파일 | 상태 |
|:--|:--|:--|
| I-1-1 | part1/I-1-1.html | ready |
| I-1-2 | part1/I-1-2.html | ready |
| I-2-1 | part1/I-2-1.html | ready |
| I-2-2 | part1/I-2-2.html | ready |
| II-1-1 | part2/II-1-1.html | ready |
| II-1-2 | part2/II-1-2.html | ready |
| II-2-1 | part2/II-2-1.html | ready |
| II-2-2 | part2/II-2-2.html | ready |
| III/IV/V | (예정) | planned |

진행률: 8/20 (40%)
