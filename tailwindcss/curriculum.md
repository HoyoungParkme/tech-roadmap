# Tailwind CSS 인터랙티브 학습 커리큘럼

## 학습 목표
Tailwind CSS 의 utility-first 사고를 익히고, 5단계로 기초 utility → 디자인 시스템 → 반응형/다크모드 → 커스텀/플러그인 → 실전 운영까지 다룬다. 20 시각화 (Part I~V × 4) — 빌드 도구 없이 CDN 한 줄로 시작해 production purge까지.

## Part I. 기초 (Utility-First)
- I-1-1. utility-first 사고 — 왜 className 폭탄이 더 빠른가
- I-1-2. responsive prefix — sm/md/lg/xl/2xl 모바일 퍼스트
- I-2-1. state variant — hover/focus/active/disabled
- I-2-2. typography utility — font / text / leading / tracking

## Part II. 디자인 시스템 (Design Tokens)
- II-1-1. spacing scale — 4px 베이스 0~96 일관성
- II-1-2. color palette — 50~950 11단계 시스템
- II-2-1. shadow + ring — depth 표현의 두 도구
- II-2-2. border + rounded — radius/style/divide 정리

## Part III. 반응형 + 다크모드 (예정)
- III-1-1. breakpoint 전략 — 모바일 퍼스트 깊이 보기
- III-1-2. dark mode — class vs media 두 전략
- III-2-1. group + group-hover — 부모 hover로 자식 변형
- III-2-2. peer + peer-checked — 형제 상태로 변형

## Part IV. 커스텀 + 플러그인 (예정)
- IV-1-1. tailwind.config.js — content/theme/plugins 기본 골격
- IV-1-2. theme.extend — 디자인 토큰 추가/덮어쓰기
- IV-2-1. plugin API — addUtilities / addComponents
- IV-2-2. preset 공유 — 멀티 프로젝트 디자인 시스템

## Part V. 실전 운영 (예정)
- V-1-1. JIT 모드 + content 스캔 — 자동 purge 원리
- V-1-2. production 빌드 — postcss + autoprefixer + cssnano
- V-2-1. 성능 + 안티패턴 — @apply 남용/dynamic class 함정
- V-2-2. 대안 비교 — Tailwind vs CSS-in-JS / CSS Module / vanilla

## 색상 매핑
- 브랜드 색상: #38B2AC (Tailwind teal) — inline style 위주
- 보조 톤: #234E52 (deep teal 텍스트) / #B2F5EA (연한 mint 배경)
- 좌 LiveDataPane (Tailwind 도메인 시뮬레이션) + 우 VSCode CodeViewer (highlight.js + atom-one-dark, lang="html"/"css")
- 3000ms autoplay, 4 controls + aria-label, 키보드 ←/→
