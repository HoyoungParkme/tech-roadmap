# TypeScript 인터랙티브 학습 커리큘럼

## 학습 목표
TypeScript의 타입 시스템을 실무에 적용할 수 있을 만큼 익힌다. 기본 문법부터 고급 타입, React/Node 적용, 설계 패턴, 운영 환경까지 5단계로 다룬다.

## Part I. 기초
- I-1-1. 왜 TypeScript인가 — JS의 한계와 TS가 해결하는 문제
- I-1-2. type vs interface — 언제 어느 것을 쓰는가
- I-2-1. generic — 함수/클래스 재사용
- I-2-2. utility type — Partial / Pick / Omit / Record

## Part II. 고급 타입
- II-1-1. union vs intersection — | vs &
- II-1-2. literal type + as const
- II-2-1. conditional type + infer
- II-2-2. mapped type + key remapping

## Part III. React / Node 적용
- III-1-1. React.FC vs 일반 함수 컴포넌트 props 타입
- III-1-2. useState / useReducer 제네릭 추론
- III-2-1. Express/Fastify 핸들러 타입 + Request 확장
- III-2-2. zod 스키마 → infer 로 타입 자동 생성

## Part IV. 설계 패턴
- IV-1-1. Branded type — id 혼동 방지
- IV-1-2. Discriminated union — 변형 가능한 상태 모델링
- IV-2-1. Result / Either 패턴 — 예외 대신 값
- IV-2-2. DDD value object — readonly + factory

## Part V. 운영
- V-1-1. strict 마이그레이션 — noImplicitAny → strict 단계별
- V-1-2. eslint + @typescript-eslint 핵심 규칙
- V-2-1. tsc --build / project references / 모노레포
- V-2-2. 실전 체크리스트 — type-only import / dts / CI / 출항 점검표

## 색상 매핑
- 도메인 색상: TypeScript blue (#3178C6)
- 좌 LiveDataPane (TS 도메인 시뮬레이션) + 우 VSCode CodeViewer (highlight.js + atom-one-dark)
- 3000ms autoplay, 4 controls, 키보드 ←/→
