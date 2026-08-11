# Jaeger 인터랙티브 학습 커리큘럼

분산 추적의 사실상 표준 — CNCF Graduated 프로젝트. 마이크로서비스 한 요청이 어느 서비스 어느 함수에서 얼마나 걸렸는지를 trace/span으로 가시화한다.

## 독자 가이드

- **선수 지식**: 백엔드 기초 (HTTP, 서비스), 마이크로서비스 개념, OpenTelemetry 입문 권장
- **목표**: trace/span 모델 이해 → Jaeger 아키텍처 구축 → 샘플링/스토리지 설계 → 운영까지 한 사이클
- **분량**: 5 Parts × 20 sections, Phase A는 Part I + Part II 8 sections

---

## Part I. 분산 추적 기초

학습 목표: 분산 시스템에서 한 요청이 흩어진 서비스를 어떻게 지나는지 trace/span으로 묶고, Jaeger의 전체 아키텍처와 instrumentation(계측)이 무엇인지 이해한다.

### Section I-1-1. 분산 추적이란 무엇인가
- **난이도**: ★☆☆
- **선수 지식**: 백엔드 기초
- **학습 목표**: 모놀리스 디버깅과 마이크로서비스 디버깅의 차이, 왜 trace가 필요한지 안다.
- **핵심 키워드**: [distributed tracing, microservices, request flow, debugging]
- **시각화 연결**: [분산 추적 시각화 보기](part1/I-1-1.html) — 모놀리스 stack trace vs 마이크로서비스 4-hop 폭포수 (전화 한 통 vs 릴레이 4명 비유)
- **다음 섹션**: I-1-2

### Section I-1-2. Trace와 Span 모델
- **난이도**: ★★☆
- **선수 지식**: I-1-1
- **학습 목표**: trace_id / span_id / parent_span_id / context propagation으로 부모-자식 트리를 만든다.
- **핵심 키워드**: [trace_id, span_id, parent_span_id, context propagation, W3C TraceContext]
- **시각화 연결**: [Trace / Span 시각화 보기](part1/I-1-2.html) — 1 trace = N spans 트리 + W3C traceparent 헤더 전파 (가계도 비유)
- **다음 섹션**: I-2-1

### Section I-2-1. Jaeger 아키텍처 개요
- **난이도**: ★★☆
- **선수 지식**: I-1-2
- **학습 목표**: agent / collector / query / storage / UI 5컴포넌트 + OpenTelemetry Collector의 흐름을 안다.
- **핵심 키워드**: [agent, collector, query, storage, all-in-one, production topology]
- **시각화 연결**: [Jaeger 아키텍처 시각화 보기](part1/I-2-1.html) — App → Agent → Collector → Storage → Query → UI 5단계 흐름 (택배 분류장 비유)
- **다음 섹션**: I-2-2

### Section I-2-2. Instrumentation (계측)
- **난이도**: ★★★
- **선수 지식**: I-2-1
- **학습 목표**: 자동 계측(OpenTelemetry SDK)과 수동 계측(span.start/end)의 차이, attribute/event/baggage 활용을 안다.
- **핵심 키워드**: [auto-instrumentation, manual span, attributes, events, baggage, semantic conventions]
- **시각화 연결**: [Instrumentation 시각화 보기](part1/I-2-2.html) — Auto / Manual / Attributes / Events 4축 (식당 셀프 vs 풀서비스 비유)
- **다음 섹션**: II-1-1

---

## Part II. Agent · Collector · Query

학습 목표: Jaeger의 데이터 경로를 구성하는 핵심 3컴포넌트(agent / collector / query)와 UI 구조를 이해하고, OpenTelemetry Collector로 어떻게 대체·확장되는지 안다.

### Section II-1-1. jaeger-agent (sidecar)
- **난이도**: ★★☆
- **선수 지식**: I-2-1
- **학습 목표**: agent의 역할(UDP 수신 → batch → collector gRPC 전달)과 sidecar/daemonset 배치 패턴을 안다.
- **핵심 키워드**: [jaeger-agent, UDP, sidecar, daemonset, batching, backpressure]
- **시각화 연결**: [jaeger-agent 시각화 보기](part2/II-1-1.html) — UDP 수신 / Batch / gRPC 전달 / Sidecar 배치 (택배 집하소 비유)
- **다음 섹션**: II-1-2

### Section II-1-2. jaeger-collector (수집/검증/저장)
- **난이도**: ★★★
- **선수 지식**: II-1-1
- **학습 목표**: collector의 책임(스팬 수신 → 검증 → 인덱싱 → 스토리지 쓰기)과 Kafka 버퍼링 토폴로지를 안다.
- **핵심 키워드**: [collector, validation, indexing, kafka buffer, ingester, write path]
- **시각화 연결**: [jaeger-collector 시각화 보기](part2/II-1-2.html) — Receive / Validate / Index / Write 4단계 + Kafka 버퍼링 (우체국 분류실 비유)
- **다음 섹션**: II-2-1

### Section II-2-1. jaeger-query + Storage 읽기
- **난이도**: ★★★
- **선수 지식**: II-1-2
- **학습 목표**: query 서비스가 어떻게 trace_id/service/operation/tags로 검색하고 storage에서 trace를 조립하는지 안다.
- **핵심 키워드**: [query service, find traces, get trace, service list, operations list]
- **시각화 연결**: [jaeger-query 시각화 보기](part2/II-2-1.html) — Search / Aggregate / Fetch trace / Reassemble (도서관 사서 비유)
- **다음 섹션**: II-2-2

### Section II-2-2. Jaeger UI 구조
- **난이도**: ★★☆
- **선수 지식**: II-2-1
- **학습 목표**: UI 4탭(Search / Trace timeline / Dependencies / Compare)이 각각 어떤 질문에 답하는지 안다.
- **핵심 키워드**: [search UI, timeline view, dependencies graph, trace compare]
- **시각화 연결**: [Jaeger UI 시각화 보기](part2/II-2-2.html) — Search / Timeline / Dependencies / Compare 4 view (CCTV 모니터 4분할 비유)
- **다음 섹션**: III-1-1

---

## Part III. 샘플링과 스토리지 (예정)

학습 목표: 모든 trace를 저장할 수는 없다 — probabilistic / rate-limiting / adaptive 샘플링 전략과 Cassandra / Elasticsearch / Badger 백엔드 선택을 이해한다.

- III-1-1. Probabilistic vs Rate-Limiting 샘플링 (예정)
- III-1-2. Adaptive / Tail-based 샘플링 (예정)
- III-2-1. Cassandra 스토리지 (예정)
- III-2-2. Elasticsearch 스토리지 + Badger 로컬 (예정)

---

## Part IV. UI · 분석 (예정)

학습 목표: timeline / dependencies / comparison / critical path를 활용해 병목과 에러를 빠르게 찾는다.

- IV-1-1. Timeline 폭포수 읽기 (예정)
- IV-1-2. Dependencies 그래프 (예정)
- IV-2-1. Trace Comparison (예정)
- IV-2-2. Critical Path 분석 (예정)

---

## Part V. 운영 (예정)

학습 목표: HA, sharding, retention, OpenTelemetry 마이그레이션 등 프로덕션 운영 요소를 이해한다.

- V-1-1. HA / Sharding (예정)
- V-1-2. Retention 정책 (예정)
- V-2-1. OpenTelemetry Collector 마이그레이션 (예정)
- V-2-2. 실전 체크리스트 (예정)
