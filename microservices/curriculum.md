# Microservices 인터랙티브 학습 커리큘럼

## 학습 목표
모놀리스 → 마이크로서비스 전환의 본질, 통신·데이터·운영 패턴을 다룬다.

## Part I. MSA 기초
- I-1-1. 모놀리스 vs 마이크로서비스
- I-1-2. 언제 MSA로 가야 하나 (Conway's Law)
- I-2-1. 서비스 경계 — DDD Bounded Context
- I-2-2. 모듈러 모놀리스 — 중간 단계

## Part II. 서비스 간 통신
- II-1-1. Sync (REST/gRPC) vs Async (메시지)
- II-1-2. API Gateway 패턴
- II-2-1. Service Discovery (Consul/Eureka/k8s DNS)
- II-2-2. Circuit Breaker + Bulkhead (Resilience)

## Part III. 데이터 패턴
- III-1-1. DB-per-Service — 공유 DB는 안티
- III-1-2. Saga 분산 트랜잭션 (Choreography vs Orchestration)
- III-2-1. Outbox + Event Sourcing
- III-2-2. CQRS — 읽기/쓰기 분리

## Part IV. 배포 + 운영
- IV-1-1. Container + Orchestration (k8s)
- IV-1-2. Blue-Green / Canary / Rolling
- IV-2-1. Service Mesh (Istio/Linkerd) — mTLS·traceing·retry
- IV-2-2. Distributed Tracing (OpenTelemetry)

## Part V. 모니터링과 안정성
- V-1-1. SLO/SLI + Error Budget
- V-1-2. 카오스 엔지니어링
- V-2-1. 안티패턴 — Distributed Monolith / Chatty / Synchronous storm
- V-2-2. 실전 체크리스트 — 운영 출항 점검표

## 색상 매핑: deep cyan `#0e7490` / fastapi v1 패턴
