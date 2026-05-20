# LLMOps 인터랙티브 학습 커리큘럼

## 학습 목표
LLM 서비스를 운영 단계로 안정화. 프롬프트 관리, 평가, 비용 최적화, 보안, 모니터링까지.

## Part I. LLMOps 기초 (Why LLMOps)
- I-1-1. LLM이 운영에 들어가면 생기는 일 (장애·비용·환각)
- I-1-2. MLOps vs LLMOps — 차이점
- I-2-1. LLM 라이프사이클 (프롬프트 → 평가 → 배포 → 모니터링)
- I-2-2. 도구 지도 (LangSmith / Helicone / Langfuse / W&B)

## Part II. 프롬프트 관리
- II-1-1. 프롬프트를 코드처럼 — Git 버전 관리
- II-1-2. Prompt Registry — 중앙 저장소
- II-2-1. A/B 테스트 — 어떤 프롬프트가 더 좋은가
- II-2-2. Prompt Injection 방어

## Part III. 평가 (Evaluation)
- III-1-1. 자동 평가 — BLEU / ROUGE 한계
- III-1-2. LLM-as-Judge — GPT-4가 채점
- III-2-1. RAGAS — RAG 평가 4축
- III-2-2. Eval Set 구축과 회귀 점검

## Part IV. 비용·성능 최적화
- IV-1-1. 토큰 비용 계산 — input/output 가격
- IV-1-2. 캐싱 — 중복 호출 0원
- IV-2-1. 모델 라우팅 — 작은 모델 우선
- IV-2-2. 배치 / 스트리밍 / 압축

## Part V. 운영 안정성
- V-1-1. 모니터링 — Latency / Token / Error / Quality
- V-1-2. 가드레일 — PII 제거 / Toxic 필터
- V-2-1. Fallback — 모델 다운 시 우회
- V-2-2. 실전 체크리스트 — 운영 출항 점검표

## 색상 매핑
- 도메인 색상: gray
- 좌 LiveDataPane + 우 VSCode CodeViewer + highlight.js atom-one-dark
- 3000ms autoplay, 4 controls, 키보드 ←/→
