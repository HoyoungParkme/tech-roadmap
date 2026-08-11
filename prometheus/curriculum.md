# Prometheus 인터랙티브 학습 커리큘럼

CNCF graduated 모니터링 시스템 — pull 기반 시계열 수집과 PromQL로 시스템 메트릭을 표준화한다.

## 독자 가이드

- **선수 지식**: 백엔드 기초 (HTTP, 서비스), 컨테이너/K8s 기초 권장
- **목표**: metric type → PromQL → alerting → exporter → HA 운영까지 한 사이클
- **분량**: 5 Parts × 4 sections = 20 시각화, Phase A는 Part I+II (8 시각화) 우선

색상 톤: Prometheus brand orange (`#E6522C`) 계열, Tailwind `orange-700 → orange-300` 5단 그라데이션.

---

## Part I. 기초 (메트릭 모델 + 수집)

학습 목표: Prometheus 4가지 metric type을 구분하고, scrape / target / job 개념으로 수집 구조를 이해한다.

### Section I-1-1. Metric Type 4종 (Counter / Gauge / Histogram / Summary)
- **난이도**: ★★☆
- **선수 지식**: HTTP 기초
- **학습 목표**: Counter(단조 증가) / Gauge(증감) / Histogram(분포 bucket) / Summary(client quantile)의 차이를 안다.
- **핵심 키워드**: [counter, gauge, histogram, summary, bucket, le, quantile]
- **시각화 연결**: [Metric Type 시각화 보기](part1/I-1-1.html) — 4 type을 "계량기 종류" 비유로 보여준다 (전기/온도/시간분포/응답 분포)
- **다음 섹션**: I-1-2

### Section I-1-2. Scrape — Prometheus가 가지러 온다
- **난이도**: ★★☆
- **선수 지식**: I-1-1
- **학습 목표**: scrape_interval / scrape_timeout / /metrics expose 포맷을 안다. up 메트릭 의미를 안다.
- **핵심 키워드**: [scrape_interval, scrape_timeout, /metrics, expose format, up]
- **시각화 연결**: [Scrape 시각화 보기](part1/I-1-2.html) — 우유 배달부가 정해진 시간에 /metrics 통을 가져가는 비유
- **다음 섹션**: I-2-1

### Section I-2-1. Target — 무엇을 가져갈지
- **난이도**: ★★☆
- **선수 지식**: I-1-2
- **학습 목표**: target = 한 endpoint(`host:port/metrics`). instance label과 health 상태 의미를 안다.
- **핵심 키워드**: [target, instance, endpoint, health, up=0/1]
- **시각화 연결**: [Target 시각화 보기](part1/I-2-1.html) — 배달 주소 카드(target) + 건강 상태(up=0/1) 라이프사이클
- **다음 섹션**: I-2-2

### Section I-2-2. Job — 같은 종류의 묶음
- **난이도**: ★★☆
- **선수 지식**: I-2-1
- **학습 목표**: job = 같은 종류의 target 그룹. `job_name` label로 묶이고, 한 job 안에 여러 instance가 들어간다.
- **핵심 키워드**: [job, job_name, instance, labels, relabel]
- **시각화 연결**: [Job 시각화 보기](part1/I-2-2.html) — "api job 3 instances + db job 2 instances" 묶음 비유
- **다음 섹션**: II-1-1

---

## Part II. PromQL (쿼리 언어)

학습 목표: 시계열 SQL인 PromQL의 핵심 표현 — instant vs range / aggregation / rate vs irate / quantile을 안다.

### Section II-1-1. Instant Vector vs Range Vector
- **난이도**: ★★★
- **선수 지식**: I-2-2
- **학습 목표**: instant vector(한 시점)와 range vector(`[5m]` 구간)의 차이, 함수가 어느 vector를 받는지를 안다.
- **핵심 키워드**: [instant vector, range vector, selector, [duration], offset]
- **시각화 연결**: [Instant vs Range 시각화 보기](part2/II-1-1.html) — 카메라 한 컷 vs 동영상 클립 비유
- **다음 섹션**: II-1-2

### Section II-1-2. Aggregation — sum / avg / by / without
- **난이도**: ★★★
- **선수 지식**: II-1-1
- **학습 목표**: `sum by (status)` 같은 그룹 집계로 차원(label)을 줄이는 방법을 안다.
- **핵심 키워드**: [sum, avg, max, min, count, by, without, topk]
- **시각화 연결**: [Aggregation 시각화 보기](part2/II-1-2.html) — 1000개 시계열 → label drop으로 묶기 비유 (피벗 테이블)
- **다음 섹션**: II-2-1

### Section II-2-1. rate() vs irate() — counter를 비율로
- **난이도**: ★★★
- **선수 지식**: II-1-2
- **학습 목표**: counter는 그 자체로 의미 없고 `rate()`/`irate()`로 초당 증가율을 본다. 둘의 차이를 안다.
- **핵심 키워드**: [rate, irate, counter, per-second, range vector, increase]
- **시각화 연결**: [rate vs irate 시각화 보기](part2/II-2-1.html) — 자동차 누적거리(counter) → 속도(rate)/순간속도(irate) 비유
- **다음 섹션**: II-2-2

### Section II-2-2. histogram_quantile — p95 응답시간 구하기
- **난이도**: ★★★
- **선수 지식**: II-2-1
- **학습 목표**: histogram bucket(`_bucket{le="..."}`)에서 `histogram_quantile(0.95, ...)`로 p95를 추정한다.
- **핵심 키워드**: [histogram, _bucket, le, histogram_quantile, p95, p99]
- **시각화 연결**: [histogram_quantile 시각화 보기](part2/II-2-2.html) — bucket 막대 → 누적 분포 → p95 선 비유
- **다음 섹션**: III-1-1

---

## Part III. Recording Rule + Alerting (예정)

학습 목표: 미리 계산해두는 recording rule과 임계치 알람의 alerting rule, Alertmanager 라우팅/그룹핑을 이해한다.

### Section III-1-1. Recording Rule — 미리 계산해서 저장 (예정)
### Section III-1-2. Alerting Rule — for / labels / annotations (예정)
### Section III-2-1. Alertmanager — 라우팅 트리 (예정)
### Section III-2-2. Grouping / Silence / Inhibit (예정)

---

## Part IV. Exporter + Service Discovery (예정)

학습 목표: 자체 expose가 없는 시스템도 exporter로 메트릭화하고, 동적 환경에서는 SD로 자동 등록한다.

### Section IV-1-1. node_exporter — 머신 메트릭 (예정)
### Section IV-1-2. blackbox_exporter — 외부 probe (예정)
### Section IV-2-1. file SD — 파일 기반 동적 타깃 (예정)
### Section IV-2-2. Kubernetes SD — 쿠버네티스 자동 등록 (예정)

---

## Part V. 운영 (HA / 장기 보관) (예정)

학습 목표: 단일 Prometheus의 한계를 인지하고 HA / federation / remote_write / Thanos vs Cortex 선택을 이해한다.

### Section V-1-1. HA — 같은 설정 2대 (예정)
### Section V-1-2. Federation — 계층 수집 (예정)
### Section V-2-1. remote_write — 외부 장기 저장 (예정)
### Section V-2-2. Thanos vs Cortex vs Mimir (예정)

---

## 참고 자료

- Prometheus 공식 문서 (https://prometheus.io/docs)
- "Prometheus: Up & Running" (Brian Brazil)
- Google SRE Book — SLO/Alerting 챕터
- Robust Perception 블로그 (Brian Brazil)
