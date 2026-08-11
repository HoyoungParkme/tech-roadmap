# OpenTelemetry 인터랙티브 학습 커리큘럼

벤더 락인 없는 관측 표준 — **Trace / Metric / Log** 세 신호를 하나의 SDK·하나의 프로토콜(OTLP)로 묶어 어떤 백엔드(Jaeger·Tempo·Prometheus·Datadog…)에도 꽂을 수 있게 한다.

## 독자 가이드

- **선수 지식**: Observability 기초 (Logs / Metrics / Traces 개념), Python 또는 JS 한 가지, Docker/K8s 기초 권장
- **목표**: OTel 표준 이해 → SDK로 앱 계측 → Collector pipeline 구성 → exporter로 백엔드 연결 → 실전 운영
- **분량**: 5 Parts × 4 sections = 20 sections, Phase A부터 점진 추가
- **컬러**: `#4F62AD` (OTel 보라-블루) 단일 톤

---

## Part I. OpenTelemetry 기초 — Trace / Span / Context / 3 Signals

학습 목표: OTel의 데이터 모델 4 축(Trace, Span, Context, 3 Signals)을 그림으로 이해한다. 코드보다 "왜 이렇게 생겼나"를 먼저 잡는다.

### Section I-1-1. Trace란 무엇인가
- **난이도**: ★☆☆
- **선수 지식**: 백엔드 기초 (HTTP, 마이크로서비스 개념)
- **학습 목표**: 한 요청이 여러 서비스를 거치는 흐름을 하나의 ID(`traceId`)로 묶는 이유를 안다. 모놀리스 로그와 분산 trace의 차이를 안다.
- **핵심 키워드**: [traceId, distributed request, end-to-end latency, root span]
- **시각화 연결**: [Trace 시각화 보기](part1/I-1-1.html) — 모놀리스 vs MSA / traceId / 3-서비스 흐름 / Gantt 차트 (지하철 환승 기록 비유)
- **다음 섹션**: I-1-2

### Section I-1-2. Span의 구조와 부모-자식 트리
- **난이도**: ★★☆
- **선수 지식**: I-1-1
- **학습 목표**: Span = 작업 단위. spanId·parentSpanId·attributes·status·events 5요소와 부모-자식 트리 구조를 안다.
- **핵심 키워드**: [span, parentSpanId, attributes, status, events, SpanKind]
- **시각화 연결**: [Span 구조 시각화 보기](part1/I-1-2.html) — 5요소 / 트리 / SpanKind 4종 / Gantt (러시아 인형 / 폴더 트리 비유)
- **다음 섹션**: I-1-3

### Section I-1-3. Context 전파 (Propagation)
- **난이도**: ★★★
- **선수 지식**: I-1-2
- **학습 목표**: 서비스 경계를 넘을 때 `traceparent` HTTP 헤더(W3C)로 trace 컨텍스트를 전달한다. 헤더가 끊기면 trace가 끊긴다.
- **핵심 키워드**: [W3C Trace Context, traceparent, inject/extract, baggage, propagator]
- **시각화 연결**: [Context 전파 시각화 보기](part1/I-1-3.html) — traceparent / inject·extract / 끊김 vs 이어짐 (택배 송장 비유)
- **다음 섹션**: I-1-4

### Section I-1-4. 3 Signals — Trace · Metric · Log 통합
- **난이도**: ★★☆
- **선수 지식**: I-1-3
- **학습 목표**: 세 신호가 서로 다른 질문에 답한다(언제·어디서·왜). traceId로 셋을 묶어 디버깅 사이클을 만든다.
- **핵심 키워드**: [trace, metric, log, exemplar, traceId 상관관계, OTel Logs Bridge]
- **시각화 연결**: [3 Signals 시각화 보기](part1/I-1-4.html) — 3 신호 비교 / traceId 연결 / exemplar (의사 진찰 3종 비유)
- **다음 섹션**: II-1-1

---

## Part II. SDK & Instrumentation — 앱을 어떻게 계측하는가

학습 목표: Auto vs Manual 계측의 트레이드오프, SDK 내부 파이프라인(Provider/Processor/Exporter), 언어별 차이, 서비스 정체성을 표시하는 Resource attribute를 익힌다.

### Section II-1-1. Auto vs Manual Instrumentation
- **난이도**: ★★☆
- **선수 지식**: I-1-4
- **학습 목표**: 자동 계측(라이브러리 monkey-patch)으로 80%를 커버하고 비즈니스 로직만 수동으로 보강하는 전략을 안다.
- **핵심 키워드**: [auto-instrument, manual span, monkey-patch, zero-code, hybrid]
- **시각화 연결**: [Auto vs Manual 시각화 보기](part2/II-1-1.html) — 자동(80%) + 수동(20%) / 커버리지 / 예시 (자율주행 vs 수동운전 비유)
- **다음 섹션**: II-1-2

### Section II-1-2. SDK 구조 — Provider / Processor / Exporter
- **난이도**: ★★★
- **선수 지식**: II-1-1
- **학습 목표**: TracerProvider → SpanProcessor → SpanExporter 3단 파이프라인을 이해한다. Batch vs Simple processor, OTLP exporter 차이를 안다.
- **핵심 키워드**: [TracerProvider, SpanProcessor, BatchSpanProcessor, SpanExporter, OTLPExporter]
- **시각화 연결**: [SDK 구조 시각화 보기](part2/II-1-2.html) — Provider / Processor / Exporter / 배치 (수도 파이프라인 비유)
- **다음 섹션**: II-1-3

### Section II-1-3. 언어별 라이브러리 — Python / JavaScript / Java
- **난이도**: ★★☆
- **선수 지식**: II-1-2
- **학습 목표**: 같은 OTel API가 언어마다 어떻게 설치·실행되는지, 자동 계측 패키지 이름이 어떻게 다른지 익힌다.
- **핵심 키워드**: [opentelemetry-instrument, NodeSDK, javaagent, Distro, contrib]
- **시각화 연결**: [언어별 SDK 시각화 보기](part2/II-1-3.html) — Python / JS / Java 비교표 / 설치·실행 (만국 공용 어댑터 비유)
- **다음 섹션**: II-1-4

### Section II-1-4. Resource Attribute — 서비스 정체성
- **난이도**: ★★☆
- **선수 지식**: II-1-3
- **학습 목표**: `service.name`·`service.version`·`deployment.environment`·`host.name` 같은 Resource attribute가 모든 span/metric/log에 자동으로 붙어 필터의 기반이 된다.
- **핵심 키워드**: [Resource, service.name, semantic conventions, OTEL_RESOURCE_ATTRIBUTES, detector]
- **시각화 연결**: [Resource Attribute 시각화 보기](part2/II-1-4.html) — service.name / version / env / host (서비스 명찰 비유)
- **다음 섹션**: III-1-1

---

## Part III. Collector & Processor (예정)

학습 목표: 앱과 백엔드 사이 중앙 허브. receiver → processor → exporter pipeline, batch / memory_limiter / tail_sampling 등을 이해한다.

- III-1-1. Collector 개론 (gateway vs agent)
- III-1-2. Receiver — OTLP / Prometheus / Fluent
- III-1-3. Processor — batch / filter / transform / tail_sampling
- III-1-4. Pipeline 구성과 fan-out

---

## Part IV. Exporter & Backend (예정)

학습 목표: 가공된 텔레메트리를 어디로 보내고 어떻게 시각화하는지 배운다.

- IV-1-1. OTLP — gRPC / HTTP 전송
- IV-1-2. Jaeger — Trace 백엔드
- IV-1-3. Prometheus — Metric 스크레이프 / Remote Write
- IV-1-4. Loki — Log 백엔드 (Grafana 스택)

---

## Part V. 실전 운영 (예정)

학습 목표: 분산 추적을 통한 병목 분석, 샘플링 전략, 운영 체크리스트, 다른 도구와의 통합 패턴.

- V-1-1. 분산 추적 디버깅 워크플로우
- V-1-2. 샘플링 전략 (head vs tail)
- V-1-3. 운영 체크리스트 (overhead / cardinality / cost)
- V-1-4. 통합 패턴 — k8s / Service Mesh / FastAPI / Spring Boot

---

## 참고 자료

- OpenTelemetry 공식 문서 (https://opentelemetry.io/docs/)
- "Mastering Distributed Tracing" — Yuri Shkuro
- CNCF OpenTelemetry Specification (https://github.com/open-telemetry/opentelemetry-specification)
- W3C Trace Context (https://www.w3.org/TR/trace-context/)
