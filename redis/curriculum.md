# Redis 인터랙티브 학습 커리큘럼

## 학습 목표
인메모리 DB Redis로 캐시, 세션, 큐, 분산 락, pub/sub을 구현한다. 기본 5 자료구조부터 운영(Persistence, Replication, Cluster)까지.

## Part I. 캐시 기초 (Why Redis)
- I-1-1. DB만 쓸 때의 부하 — 같은 쿼리 1000번/초
- I-1-2. 인메모리 캐시란 — RAM 위 키-값 저장소
- I-2-1. Redis vs Memcached vs DragonflyDB
- I-2-2. Redis 설치 + 첫 GET/SET

## Part II. 5 자료구조 (Core Data Types)
- II-1-1. String — 단순 키-값, INCR/DECR
- II-1-2. List — LPUSH/RPOP, 큐 패턴
- II-2-1. Hash — 객체 저장, HGET/HSET
- II-2-2. Set / Sorted Set — 중복 제거 + 랭킹

## Part III. 운영 핵심 (Persistence / Replication)
- III-1-1. TTL — EXPIRE / PERSIST / 만료 정책
- III-1-2. Eviction — LRU/LFU/random 정책
- III-2-1. Persistence — RDB snapshot vs AOF log
- III-2-2. Replication — primary/replica + failover

## Part IV. 분산 패턴
- IV-1-1. 분산 락 — SET NX + 만료 + Redlock
- IV-1-2. Pub/Sub vs Stream
- IV-2-1. Redis Streams — XADD/XREAD + Consumer Group
- IV-2-2. Cluster — 16384 slot + sharding

## Part V. 보안과 운영
- V-1-1. 캐시 함정 — Stampede / Penetration / Avalanche
- V-1-2. ACL + TLS + protected-mode
- V-2-1. 모니터링 — INFO / SLOWLOG / Prometheus exporter
- V-2-2. 실전 체크리스트 — 운영 출항 점검표

## 색상 매핑
- 도메인 색상: neutral
- 좌 LiveDataPane + 우 VSCode CodeViewer + highlight.js atom-one-dark
- 3000ms autoplay, 4 controls, 키보드 ←/→
