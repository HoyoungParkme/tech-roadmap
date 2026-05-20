# Elasticsearch 인터랙티브 학습 커리큘럼

## 학습 목표
Elasticsearch로 전문 검색, 로그 분석, 집계, RAG 벡터 검색을 구현한다. Inverted Index부터 ELK Stack, 클러스터 운영까지.

## Part I. 검색 기초 (Why Elasticsearch)
- I-1-1. RDB LIKE 검색의 한계 (100만 행 → 수 초)
- I-1-2. Inverted Index — 단어 → 문서 매핑
- I-2-1. Elasticsearch vs Solr vs OpenSearch
- I-2-2. 설치 + 첫 인덱스 (curl PUT/GET)

## Part II. 핵심 개념
- II-1-1. Index / Document / Mapping
- II-1-2. Analyzer — Tokenizer + Token Filter
- II-2-1. Query DSL — match / term / bool / range
- II-2-2. Aggregation — terms / date_histogram / metrics

## Part III. 인덱싱 운영
- III-1-1. Bulk API — 대량 색인
- III-1-2. Refresh interval — 즉시성 vs 처리량
- III-2-1. Reindex — 매핑 변경 대응
- III-2-2. ILM (Index Lifecycle) — Hot/Warm/Cold/Delete

## Part IV. 분산 운영
- IV-1-1. Cluster — Master/Data/Coordinating Node
- IV-1-2. Shard / Replica — 분산 저장과 복제
- IV-2-1. Snapshot & Restore — 백업 전략
- IV-2-2. kNN Vector Search — RAG 통합

## Part V. 보안과 운영
- V-1-1. Kibana — 시각화 + Stack Monitoring
- V-1-2. Security — TLS / RBAC / API key
- V-2-1. Sizing & Capacity Planning
- V-2-2. 실전 체크리스트 — 운영 출항 점검표

## 색상 매핑
- 도메인 색상: zinc
- 좌 LiveDataPane + 우 VSCode CodeViewer + highlight.js atom-one-dark
- 3000ms autoplay, 4 controls, 키보드 ←/→
