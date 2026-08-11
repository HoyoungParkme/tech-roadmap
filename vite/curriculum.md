# Vite 인터랙티브 학습 커리큘럼

## 학습 목표
차세대 프론트엔드 빌드 도구 Vite 로 ESM 기반 dev server, esbuild 사전 번들링, Rollup 프로덕션 빌드, 플러그인 생태계, SSR/SSG/라이브러리 모드, 모노레포 마이그레이션을 마스터한다.

## Part I. Vite 기초 (왜 Vite 인가)
- I-1-1. ESM Native — 브라우저가 모듈을 직접 import (no bundle in dev)
- I-1-2. Dev Server — esbuild 사전 번들 + 200ms cold start
- I-2-1. HMR (Hot Module Replacement) — 모듈 단위 핫 교체
- I-2-2. index.html — entry point 가 HTML 인 이유

## Part II. 프로덕션 빌드
- II-1-1. Rollup 기반 빌드 — tree-shaking + ESM out
- II-1-2. 출력 구조 (dist/) — entry/chunk/asset hash
- II-2-1. Code Splitting — dynamic import + manualChunks
- II-2-2. Asset 처리 — ?url / ?raw / ?inline / public/

## Part III. 플러그인 생태계
- III-1-1. esbuild plugin (사전 번들 단계 — dev only)
- III-1-2. Vite plugin API — Rollup 호환 + Vite 전용 훅
- III-2-1. 공식 플러그인 — @vitejs/plugin-react / vue / legacy
- III-2-2. 커스텀 플러그인 만들기 — virtual module 예제

## Part IV. SSR & 라이브러리 모드
- IV-1-1. SSR — ssrLoadModule + renderToString
- IV-1-2. SSG — vite-ssg / Astro 패턴
- IV-2-1. Library Mode — build.lib + 다중 포맷 (es/cjs/umd)
- IV-2-2. Worker / Wasm — ?worker / ?init

## Part V. 실전 운영
- V-1-1. 성능 최적화 — pre-bundle / cache-dir / split vendor
- V-1-2. 모노레포 (pnpm + Turborepo) 통합
- V-2-1. Webpack → Vite 마이그레이션 체크리스트
- V-2-2. 운영 출항 점검표 — env / base / preview / sourcemap

## 색상 매핑: #646CFF / 좌 LiveDataPane + 우 VSCode CodeViewer + highlight.js atom-one-dark / 3000ms autoplay / 4 controls / 키보드 ←/→
