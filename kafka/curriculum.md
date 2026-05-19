# Apache Kafka 인터랙티브 학습 커리큘럼

## 학습 목표
이벤트 스트리밍 플랫폼 Kafka로 마이크로서비스 간 비동기 메시징, 로그 수집, 실시간 데이터 파이프라인을 구축한다. Topic/Partition/Consumer Group/Offset 기본부터 운영까지.

## Part I. 메시지 큐 기초 (Why Kafka)
- I-1-1. 동기 vs 비동기 호출 — REST 직접 호출의 한계
- I-1-2. 메시지 큐란 — 생산자/소비자 분리
- I-2-1. Kafka vs RabbitMQ vs SQS vs Pulsar 비교
- I-2-2. Kafka 설치 + 첫 메시지

## Part II. Kafka 핵심 개념
- II-1-1. Topic / Partition / Offset
- II-1-2. Producer — 발행 흐름과 acks
- II-2-1. Consumer Group — 분산 소비
- II-2-2. Replication & Leader/Follower

## Part III. 보장과 운영
- III-1-1. At-most-once / At-least-once / Exactly-once
- III-1-2. Idempotent Producer + Transactions
- III-2-1. Lag 모니터링과 알람
- III-2-2. Rebalance 폭풍과 해결

## Part IV. 생태계와 통합
- IV-1-1. Kafka Connect — Source/Sink 커넥터
- IV-1-2. Kafka Streams vs ksqlDB
- IV-2-1. Schema Registry + Avro/Protobuf
- IV-2-2. Spring/FastAPI 통합 패턴

## Part V. 운영과 보안
- V-1-1. 보존 정책 (retention.ms / size) + 압축 토픽
- V-1-2. 보안 — SASL/TLS/ACL
- V-2-1. Cluster 운영 — broker 추가/제거 + 파티션 재분배
- V-2-2. 실전 체크리스트 — 운영 출항 점검표

## 색상 매핑
- 도메인 색상: yellow
- 좌 LiveDataPane (도메인별 시뮬레이션) + 우 VSCode CodeViewer (highlight.js + atom-one-dark)
- 3000ms autoplay, 4 controls, 키보드 ←/→
