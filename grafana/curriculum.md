# Grafana 인터랙티브 학습 커리큘럼

운영 데이터를 한 화면에 모아 "지금 무엇이 문제인가"를 즉시 보여주는 시각화·알림 플랫폼 — Grafana 11+ 기준.

## 독자 가이드

- **선수 지식**: 백엔드/SRE 기초 (HTTP, 시계열 데이터), Prometheus·SQL 맛보기
- **목표**: 패널 1개에서 시작해 → multi-data source dashboard → 알람 + provisioning + RBAC까지
- **분량**: 5 Parts × 20 sections — Phase A로 Part I·II (8 sections) 우선 공개

---

## Part I. 기초 — Dashboard / Panel / Visualization / Data Source

학습 목표: Grafana의 4가지 기본 구성요소를 이해하고 "한 보드는 어떻게 만들어지는가" 를 안다.

### Section I-1-1. Dashboard란 무엇인가
- **난이도**: ★☆☆
- **선수 지식**: 없음
- **학습 목표**: dashboard = panel의 집합 + 공통 시간 범위 + 변수, 폴더/태그로 조직되는 구조.
- **핵심 키워드**: [dashboard, folder, tag, time range, refresh, share]
- **시각화 연결**: [Dashboard 시각화 보기](part1/I-1-1.html) — 빈 보드 → panel 추가 → 4-panel 보드 (계기판 4종 비유)
- **다음 섹션**: I-1-2

### Section I-1-2. Panel 개념 (한 칸의 시각화 단위)
- **난이도**: ★☆☆
- **선수 지식**: I-1-1
- **학습 목표**: 패널 = query + transform + visualization + field config 4단 파이프라인.
- **핵심 키워드**: [panel, query, transform, visualization, fieldConfig, threshold]
- **시각화 연결**: [Panel 시각화 보기](part1/I-1-2.html) — query → transform → viz → threshold 4단계 흐름
- **다음 섹션**: I-2-1

### Section I-2-1. Visualization Type — 6가지 기본 차트
- **난이도**: ★★☆
- **선수 지식**: I-1-2
- **학습 목표**: timeseries / stat / gauge / table / bar gauge / heatmap 6가지를 언제 쓰는지 결정.
- **핵심 키워드**: [timeseries, stat, gauge, table, bar gauge, heatmap, choice]
- **시각화 연결**: [Visualization Type 시각화 보기](part1/I-2-1.html) — 같은 데이터를 6가지 차트로 (의도별 선택)
- **다음 섹션**: I-2-2

### Section I-2-2. Data Source 추상화
- **난이도**: ★★☆
- **선수 지식**: I-2-1
- **학습 목표**: Grafana = "쿼리 어댑터 + 시각화" 엔진. data source plugin이 DB별 차이를 흡수한다.
- **핵심 키워드**: [data source, plugin, query editor, mixed datasource]
- **시각화 연결**: [Data Source 시각화 보기](part1/I-2-2.html) — Prometheus / Loki / Postgres → Grafana 어댑터
- **다음 섹션**: II-1-1

---

## Part II. Data Source & Variable — Prometheus / Loki / SQL / Templating

학습 목표: 실제 운영에서 가장 많이 쓰는 3가지 data source와 variable을 활용한 dashboard templating.

### Section II-1-1. Prometheus Data Source (metrics)
- **난이도**: ★★☆
- **선수 지식**: I-2-2
- **학습 목표**: PromQL을 panel query로 작성하고 instant vs range, legend format, threshold step 설정.
- **핵심 키워드**: [Prometheus, PromQL, range vector, legend, instant query]
- **시각화 연결**: [Prometheus 시각화 보기](part2/II-1-1.html) — PromQL → panel → legend → threshold 4단계
- **다음 섹션**: II-1-2

### Section II-1-2. Loki Data Source (logs)
- **난이도**: ★★☆
- **선수 지식**: II-1-1
- **학습 목표**: LogQL로 로그를 검색·집계하고 metric panel 옆에 log panel을 배치, derivedFields로 trace 연결.
- **핵심 키워드**: [Loki, LogQL, log panel, derived fields, log+metric]
- **시각화 연결**: [Loki 시각화 보기](part2/II-1-2.html) — 로그 검색 → 집계 → trace 점프 (logs + metrics 한 화면)
- **다음 섹션**: II-2-1

### Section II-2-1. SQL Data Source (Postgres / MySQL)
- **난이도**: ★★☆
- **선수 지식**: II-1-2
- **학습 목표**: 비즈니스 metric을 SQL로 추출 → time series + table panel, $__timeFilter()로 시간 범위 연동.
- **핵심 키워드**: [Postgres, MySQL, $__timeFilter, time series macro, table panel]
- **시각화 연결**: [SQL Data Source 시각화 보기](part2/II-2-1.html) — SELECT → time series → table → join (비즈니스 KPI)
- **다음 섹션**: II-2-2

### Section II-2-2. Variable & Template — 보드 재사용
- **난이도**: ★★★
- **선수 지식**: II-2-1
- **학습 목표**: $env, $service 변수로 같은 보드를 prod/staging × 여러 서비스에 재사용, repeat panel/row 활용.
- **핵심 키워드**: [variable, label_values, query variable, interval, repeat panel]
- **시각화 연결**: [Variable & Template 시각화 보기](part2/II-2-2.html) — 변수 정의 → 드롭다운 → panel 자동 재사용
- **다음 섹션**: III-1-1 (Part III 알람으로)

---

## Part III. Alerting (예정 — Phase B)

- III-1-1. Alert Rule (multi-dimensional)
- III-1-2. Notification Policy & Routing
- III-2-1. Contact Point (Slack / PagerDuty / Email)
- III-2-2. Silence & Mute Timing

## Part IV. Provisioning & Plugin (예정 — Phase C)

- IV-1-1. Dashboard as JSON
- IV-1-2. Datasource provisioning YAML
- IV-2-1. Plugin 설치와 관리
- IV-2-2. Dashboard provisioning + git workflow

## Part V. 실전 운영 (예정 — Phase D)

- V-1-1. Organization & Team
- V-1-2. Permission (folder/dashboard 단위)
- V-2-1. RBAC (Enterprise)
- V-2-2. SSO (OAuth / SAML / LDAP)

---

## 다음 단계

1. Part I·II 8 sections 우선 학습 (이 페이지에서 제공)
2. Phase B: Alerting (4 sections)
3. Phase C: Provisioning & Plugin (4 sections)
4. Phase D: 실전 운영 (4 sections)
