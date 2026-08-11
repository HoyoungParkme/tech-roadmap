# Svelte 인터랙티브 학습 커리큘럼

## 학습 목표
Svelte는 "컴파일러가 곧 프레임워크"인 UI 도구다. 가상 DOM 없이 빌드 시점에 최소한의 명령형 JS로 변환되며, `.svelte` 단일 파일에 `<script>` + 마크업 + `<style>`을 한 묶음으로 작성한다. 20 시각화로 기초(반응형/스타일) → 컴포넌트 패턴(props/event/slot/context) → 상태/라우터(store + SvelteKit router) → 트랜지션/액션 → SvelteKit 운영 순서로 익힌다.

## Part I. 기초
- I-1-1. Svelte 첫 컴포넌트 — `.svelte` SFC 구조
- I-1-2. 반응형 변수 — `let` state vs Svelte 5 `$state` rune
- I-2-1. 반응형 선언 — `$:` derived vs `$derived` rune
- I-2-2. `<style>` scoped + `class:` 디렉티브

## Part II. 컴포넌트 패턴
- II-1-1. props — `export let` vs `$props` rune
- II-1-2. 이벤트 — `createEventDispatcher` / `on:` / 콜백 props
- II-2-1. slot — default / named / slot props
- II-2-2. context — `setContext` / `getContext`

## Part III. 상태 + 라우터
- III-1-1. writable store — `writable`, `$store` 자동 구독
- III-1-2. readable / derived store — 파생 상태 패턴
- III-2-1. SvelteKit 파일 기반 라우터 — `src/routes`
- III-2-2. load 함수 + 동적 라우트

## Part IV. 트랜지션 + 액션
- IV-1-1. `transition:` `in:` `out:` — fade/fly/slide
- IV-1-2. `use:` action — DOM 명령형 로직 캡슐화
- IV-2-1. animate + custom transition
- IV-2-2. spring / tweened 모션

## Part V. SvelteKit 운영
- V-1-1. SSR / CSR / prerender 선택
- V-1-2. form actions + endpoint
- V-2-1. 배포 — adapter-vercel / node / static
- V-2-2. 실전 체크리스트 — 성능 + 접근성 + 빌드 + 보안 4축 × 12 = 48

## 색상 매핑
- 브랜드 색상: `#FF3E00` (Svelte orange) — inline style 위주
- 보조 톤: orange-700 / amber-100 soft / slate 본문
- 좌 LiveDataPane (Svelte 도메인 시뮬레이션) + 우 VSCode CodeViewer (highlight.js + atom-one-dark)
- 3000ms autoplay, 4 controls + aria-label, 키보드 ←/→
- 코드 lang: `svelte` 미지원 → `html` 또는 `markdown`으로 highlight.js fallback
