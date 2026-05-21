# Vue 인터랙티브 학습 커리큘럼

## 학습 목표
Vue 3 Composition API로 컴포넌트 기반 SPA를 만들고, Pinia 상태 관리와 Vue Router로 라우팅, Vite/Nuxt로 빌드/배포까지 한 흐름을 익힌다. 20 시각화로 Composition API → 컴포넌트 패턴 → 상태/라우팅 → 렌더링/성능 → 운영을 순차적으로 학습.

## Part I. 기초 (Composition API)
- I-1-1. Vue 3 첫 컴포넌트 — Options vs Composition
- I-1-2. ref vs reactive — 언제 어느 것을 쓰나
- I-2-1. computed — 의존성 추적과 캐싱
- I-2-2. watch / watchEffect — 부수 효과의 두 얼굴

## Part II. 컴포넌트 패턴
- II-1-1. props + defineProps + 타입 안전성
- II-1-2. emit + defineEmits — 자식 → 부모 통신
- II-2-1. slot — default / named / scoped
- II-2-2. provide / inject — 의존성 주입

## Part III. 상태 + 라우팅
- III-1-1. Pinia store — defineStore 패턴
- III-1-2. Pinia getters + actions
- III-2-1. Vue Router 4 — route 정의 + RouterLink
- III-2-2. Navigation Guard + meta + Lazy Loading

## Part IV. 렌더링 + 성능
- IV-1-1. lifecycle hook — onMounted / onUpdated / onUnmounted
- IV-1-2. v-if vs v-show + v-for key
- IV-2-1. Teleport — 모달/툴팁의 DOM 탈출
- IV-2-2. Suspense — async setup 다루기

## Part V. 운영
- V-1-1. Vite — 빠른 dev + HMR
- V-1-2. Nuxt 3 — SSR / SSG / 파일 기반 라우팅
- V-2-1. 빌드 + 배포 (CSR vs SSR 선택)
- V-2-2. 실전 체크리스트 — 성능 + 접근성 + 빌드 + 보안 4축 × 12 = 48

## 색상 매핑
- 브랜드 색상: #4FC08D (Vue green) — inline style 위주
- 보조 클래스: emerald-700 / green-700 톤
- 좌 LiveDataPane (Vue 도메인 시뮬레이션) + 우 VSCode CodeViewer (highlight.js + atom-one-dark)
- 3000ms autoplay, 4 controls + aria-label, 키보드 ←/→
