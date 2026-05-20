# MongoDB 인터랙티브 학습 커리큘럼

## 학습 목표
NoSQL 문서 DB MongoDB로 유연한 스키마, 임베디드/참조 모델링, 인덱싱, 집계 파이프라인, replica/sharding을 다룬다.

## Part I. NoSQL 기초 (Why MongoDB)
- I-1-1. RDB 한계 — 스키마 변경 비용, JOIN 부담
- I-1-2. Document Model — JSON-like BSON
- I-2-1. MongoDB vs DynamoDB vs Couchbase vs Firestore
- I-2-2. 설치 + mongosh 첫 명령

## Part II. 데이터 모델링
- II-1-1. Collection / Document / _id
- II-1-2. Embedded vs Referenced — 언제 어느 쪽
- II-2-1. 스키마 진화 — versioning
- II-2-2. Schema Validation ($jsonSchema)

## Part III. CRUD + 쿼리
- III-1-1. insertOne / insertMany / Bulk
- III-1-2. find — 연산자 ($eq/$gt/$in/$regex)
- III-2-1. update — $set/$inc/$push/$pull, upsert
- III-2-2. delete + soft delete 패턴

## Part IV. 인덱스 + 집계
- IV-1-1. Index 종류 (single/compound/multi-key/text/2dsphere)
- IV-1-2. explain() + Index 선택
- IV-2-1. Aggregation Pipeline ($match/$group/$lookup/$project)
- IV-2-2. Atlas Search / Vector Search

## Part V. 운영과 보안
- V-1-1. Replica Set — primary/secondary + 자동 failover
- V-1-2. Sharding — shard key + chunk balancing
- V-2-1. 보안 (RBAC / TLS / encryption-at-rest) + 백업
- V-2-2. 실전 체크리스트 — 운영 출항 점검표

## 색상 매핑: MongoDB Leaf green (#13aa52) / fastapi v1 패턴
