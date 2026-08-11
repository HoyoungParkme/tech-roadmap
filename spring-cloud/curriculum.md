# Spring Cloud 인터랙티브 학습 커리큘럼

## 학습 목표
Spring Boot 기반 MSA 운영의 표준 도구 묶음인 Spring Cloud 2024(YYYY.0.x / Spring Boot 3.x) 생태계를 단계별로 익힌다.
Config / Discovery / Gateway / LoadBalancer / Resilience4j / Micrometer Tracing / Stream + Kafka 까지 실무 패턴을 정리한다.

## Part I. Spring Cloud 기초 — 왜 필요한가
- I-1-1. MSA — Spring Boot 만으로는 부족한 영역
- I-1-2. 왜 Spring Cloud 인가 — 표준 묶음의 가치
- I-1-3. Spring Cloud 생태계 한눈에 보기
- I-1-4. Spring Cloud 2024 — Boot 3.x · BOM · 모듈 정리

## Part II. Config & Discovery — 설정과 서비스 위치
- II-1-1. Config Server — 중앙 집중식 설정 관리 (Git backend)
- II-1-2. Spring Cloud Bus + refresh — 설정 변경 일괄 반영
- II-1-3. Eureka — Netflix OSS 서비스 디스커버리
- II-1-4. Consul — HashiCorp 디스커버리 + KV Store

## Part III. Gateway & LoadBalancer — 진입점과 분산 (예정)
- III-1-1. Spring Cloud Gateway 기본 구조
- III-1-2. Route Predicate — path/host/header 매칭
- III-1-3. Filter — RewritePath / AddRequestHeader / CircuitBreaker
- III-1-4. Spring Cloud LoadBalancer — Ribbon 의 후계자

## Part IV. Circuit Breaker & Bus — 장애 격리 (예정)
- IV-1-1. Resilience4j 개요 — Hystrix 후계자
- IV-1-2. CircuitBreaker 패턴 — Closed/Open/Half-Open
- IV-1-3. Retry — 지수 백오프와 max attempts
- IV-1-4. Bulkhead — 스레드풀 격리

## Part V. Sleuth · Zipkin · Stream — 관측과 비동기 (예정)
- V-1-1. Micrometer Tracing — Sleuth 후계자, OTel 호환
- V-1-2. Zipkin — 분산 trace 시각화
- V-1-3. Spring Cloud Stream — 메시지 추상화
- V-1-4. Kafka Binder — 실전 producer/consumer

## 색상 매핑
- 도메인 색상: forest green `#4A8C2A` (Spring Cloud)
- 코드 언어: `java` + `yaml`
- 패턴: fastapi v1 — 좌(LiveDataPane) + 우(VSCode CodeViewer · highlight.js)
- 시각화 분량: 700~900 라인/파일
- 컨트롤: ←/→ 키, 자동재생 3초/단계, 처음·이전·재생·다음
