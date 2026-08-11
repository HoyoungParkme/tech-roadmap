# OpenSearch 인터랙티브 학습 커리큘럼

## 학습 목표
OpenSearch로 전문 검색, 로그 분석, 시각화, RAG 벡터 검색을 구현한다. Elasticsearch 7.10 fork 이후의 차이점부터 OpenSearch Dashboards, ISM, Cross-Cluster Replication까지.

## 색상
- 도메인 색상: OpenSearch 공식 블루 `#005EB8`
- 좌 LiveDataPane + 우 VSCode CodeViewer + highlight.js atom-one-dark
- 3000ms autoplay, 4 controls, 키보드 ←/→

## Part I. 기초 (Elasticsearch fork 이후)
- I-1-1. Elasticsearch 7.10 → OpenSearch 1.0 fork (Apache 2.0 vs SSPL, 호환성)
- I-1-2. Index / Document / Shard — 분산 저장의 단위
- I-2-1. Query DSL — match / term / bool / range (Lucene 기반 검색)
- I-2-2. REST API — curl PUT/POST/GET/DELETE 흐름

## Part II. Mapping & Analyzer
- II-1-1. Field Type — text vs keyword, numeric, date, geo_point
- II-1-2. Dynamic Mapping vs Explicit Mapping — 자동 추론 함정
- II-2-1. Analyzer — char_filter → tokenizer → token_filter 파이프라인
- II-2-2. Tokenizer — standard / whitespace / ngram / Nori (한국어)

## Part III. Aggregation (다음 작업)
- III-1-1. Metric Aggregation — avg / sum / stats / cardinality
- III-1-2. Bucket Aggregation — terms / date_histogram / range
- III-2-1. Pipeline Aggregation — derivative / moving_avg / cumulative_sum
- III-2-2. Nested Aggregation — 중첩 문서 집계

## Part IV. OpenSearch Dashboards (다음 작업)
- IV-1-1. Discover — 인덱스 패턴 + 필터 + 컬럼 선택
- IV-1-2. Visualize — Bar / Pie / Line / Heatmap
- IV-2-1. Dashboard — 위젯 조합 + 필터 컨트롤
- IV-2-2. Lens — 드래그앤드롭 시각화 빌더

## Part V. 운영 (다음 작업)
- V-1-1. Cluster — Master/Data/Coordinating Node 분리
- V-1-2. Snapshot & Restore — S3 repository 백업
- V-2-1. ISM (Index State Management) — Hot/Warm/Cold/Delete 자동화
- V-2-2. Cross-Cluster Replication — 다중 리전 복제
