# Observability 인터랙티브 학습 커리큘럼

분산 시스템에서 무엇이 잘못됐는지 빠르게 알아내는 능력 — Logs, Metrics, Traces 3축으로 시스템 내부를 들여다본다.

## 독자 가이드

- **선수 지식**: 백엔드 기초 (HTTP, 서비스), Docker/K8s 기초 권장
- **목표**: SLO 정의 → 메트릭/로그/추적 수집 → 알람·incident 대응까지 한 사이클
- **분량**: 5 Parts × 20 sections, Phase A부터 점진 추가

---

## Part I. 관측 가능성 개론

학습 목표: Observability가 왜 모니터링과 다른가, 3 pillars (Logs/Metrics/Traces)는 어떻게 다른가, SRE의 Golden Signals + SLO 개념을 이해한다.

### Section I-1-1. Observability란 무엇인가
- **난이도**: ★☆☆
- **선수 지식**: 백엔드 기초
- **학습 목표**: 3 pillars (Logs/Metrics/Traces)가 각각 무엇을 답하는지, 왜 셋이 함께 필요한지 안다.
- **핵심 키워드**: [Logs, Metrics, Traces, MTTR, debuggability]
- **시각화 연결**: [Observability란 시각화 보기](part1/I-1-1.html) — 3 pillars / 의사의 진찰 3종 비유 (차트/활력 모니터/환자 경로)
- **다음 섹션**: I-1-2

### Section I-1-2. Observability vs 모니터링
- **난이도**: ★☆☆
- **선수 지식**: I-1-1
- **학습 목표**: 모니터링은 "예측된 것이 작동하는가", Observability는 "모르는 문제를 디버깅 가능한가"의 차이를 안다.
- **핵심 키워드**: [known unknowns, unknown unknowns, exploratory debugging, cardinality]
- **시각화 연결**: [Observability vs 모니터링 시각화 보기](part1/I-1-2.html) — CCTV vs 형사 비유 (예측된 것 vs 미지 디버깅)
- **다음 섹션**: I-2-1

### Section I-2-1. SRE 4 Golden Signals
- **난이도**: ★★☆
- **선수 지식**: I-1-2
- **학습 목표**: Latency / Traffic / Errors / Saturation 4 지표를 이해하고 우선순위를 안다.
- **핵심 키워드**: [latency, traffic, errors, saturation, USE method, RED method]
- **시각화 연결**: [4 Golden Signals 시각화 보기](part1/I-2-1.html) — Latency / Traffic / Errors / Saturation (자동차 계기판 비유)
- **다음 섹션**: I-2-2

### Section I-2-2. SLO / SLI / Error Budget
- **난이도**: ★★★
- **선수 지식**: I-2-1
- **학습 목표**: SLI(측정값) → SLO(목표) → Error Budget(허용 실패) 흐름을 이해한다.
- **핵심 키워드**: [SLI, SLO, SLA, error budget, burn rate]
- **시각화 연결**: [SLO/SLI/Error Budget 시각화 보기](part1/I-2-2.html) — SLI / SLO / Error Budget / Burn Rate (신용카드 한도 비유)
- **다음 섹션**: II-1-1

---

## Part II. 메트릭 (Prometheus 생태계)

학습 목표: 메트릭 수집·쿼리·시각화·알람의 표준 스택을 이해한다.

### Section II-1-1. Prometheus 개론 (pull 모델)
- **난이도**: ★★☆
- **시각화 연결**: [Prometheus 시각화 보기](part2/II-1-1.html) — Push / Pull / Service Discovery / TSDB (우유 배달 비유)
- **다음 섹션**: II-1-2

### Section II-1-2. PromQL 쿼리
- **난이도**: ★★★
- **시각화 연결**: [PromQL 시각화 보기](part2/II-1-2.html) — Selector / Range Vector / Rate / Aggregation (시간 시리즈 SQL 비유)
- **다음 섹션**: II-2-1

### Section II-2-1. Grafana 대시보드
- **난이도**: ★★☆
- **시각화 연결**: [Grafana 시각화 보기](part2/II-2-1.html) — Panel / Variable / Datasource / Provisioning (항공기 조종석 비유)
- **다음 섹션**: II-2-2

### Section II-2-2. Alertmanager 알람 라우팅
- **난이도**: ★★★
- **시각화 연결**: [Alertmanager 시각화 보기](part2/II-2-2.html) — Rule / Routing / Silence / Receiver (119 분류 비유)
- **다음 섹션**: III-1-1

---

## Part III. 로그 (구조화 + 수집 파이프라인)

학습 목표: 로그를 검색·집계 가능한 자산으로 만드는 방법을 이해한다.

### Section III-1-1. 구조화 로그 (JSON)
- **난이도**: ★★☆
- **시각화 연결**: [구조화 로그 시각화 보기](part3/III-1-1.html) — Plain / JSON / Context / Levels (일기장 vs DB 비유)
- **다음 섹션**: III-1-2

### Section III-1-2. ELK vs Loki 비교
- **난이도**: ★★★
- **시각화 연결**: [ELK vs Loki 시각화 보기](part3/III-1-2.html) — ELK / Loki / 비용 / 선택 (도서관 vs 공책 비유)
- **다음 섹션**: III-2-1

### Section III-2-1. 로그 수집 파이프라인 (Fluent Bit / Vector)
- **난이도**: ★★★
- **시각화 연결**: [로그 수집 시각화 보기](part3/III-2-1.html) — Source / Parser / Filter / Sink (택배 집하장 비유)
- **다음 섹션**: III-2-2

### Section III-2-2. 로그 검색·집계 (LogQL / KQL)
- **난이도**: ★★★
- **시각화 연결**: [로그 검색·집계 시각화 보기](part3/III-2-2.html) — Selector / Filter / Metric / Aggregation (도서관 검색대 비유)
- **다음 섹션**: IV-1-1

---

## Part IV. 분산 추적 (OpenTelemetry)

학습 목표: 마이크로서비스 환경에서 요청 흐름을 추적하고 병목을 찾는 방법을 이해한다.

### Section IV-1-1. Trace / Span 개론
- **난이도**: ★★☆
- **시각화 연결**: [Trace/Span 시각화 보기](part4/IV-1-1.html) — Trace / Span / Propagation / Tree (지하철 환승 기록 비유)
- **다음 섹션**: IV-1-2

### Section IV-1-2. OpenTelemetry 표준
- **난이도**: ★★★
- **시각화 연결**: [OpenTelemetry 시각화 보기](part4/IV-1-2.html) — Spec / SDK / Collector / Vendor 무관 (공용 콘센트 비유)
- **다음 섹션**: IV-2-1

### Section IV-2-1. Jaeger / Tempo
- **난이도**: ★★★
- **시각화 연결**: [Jaeger vs Tempo 시각화 보기](part4/IV-2-1.html) — Jaeger / Tempo / 비용 / 선택 (여행 경로 시각화 비유)
- **다음 섹션**: IV-2-2

### Section IV-2-2. 분산 시스템 디버깅 흐름
- **난이도**: ★★★
- **시각화 연결**: [분산 디버깅 시각화 보기](part4/IV-2-2.html) — Alert / Isolate / Logs / Root (병원 내원 기록 역추적 비유)
- **다음 섹션**: V-1-1

---

## Part V. 실전 운영 (SRE 워크플로우)

학습 목표: SLO 정의부터 incident 대응까지 실전 SRE 사이클을 안다.

### Section V-1-1. SLO 정책 + Burn Rate 알람
- **난이도**: ★★★
- **시각화 연결**: [Burn Rate 시각화 보기](part5/V-1-1.html) — SLO Recap / Burn Rate / Multi-Window / Alert (가스 게이지 + 비상 알림 비유)
- **다음 섹션**: V-1-2

### Section V-1-2. Incident Response (감지→해결→포스트모템)
- **난이도**: ★★☆
- **시각화 연결**: [Incident Response 시각화 보기](part5/V-1-2.html) — Detect / Mitigate / Resolve / Postmortem (응급실 트리아지 비유)
- **다음 섹션**: V-2-1

### Section V-2-1. OnCall + Runbook
- **난이도**: ★★☆
- **시각화 연결**: [OnCall + Runbook 시각화 보기](part5/V-2-1.html) — Rotation / Runbook / Response / Healthy (당직 의사 + 매뉴얼 비유)
- **다음 섹션**: V-2-2

### Section V-2-2. 실전 체크리스트
- **난이도**: ★★☆
- **시각화 연결**: [실전 체크리스트 시각화 보기](part5/V-2-2.html) — Metrics / Logs / Traces / SRE 4축 (관제 센터 점검표 비유)
- **다음 섹션**: 없음 (커리큘럼 마지막 섹션, Observability 100% 완성 🎉)

---

## 참고 자료

- "Site Reliability Engineering" (Google SRE Book)
- "The Practice of Cloud System Administration"
- Prometheus / Grafana / OpenTelemetry / Jaeger 공식 문서
- Charity Majors "Observability Engineering"
