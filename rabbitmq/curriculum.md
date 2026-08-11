# RabbitMQ 인터랙티브 학습 커리큘럼

## 학습 목표
AMQP 0-9-1 기반 메시지 브로커 RabbitMQ로 비동기 메시징, 라우팅, 신뢰성 있는 작업 큐를 구축한다. Exchange/Queue/Binding 기본부터 cluster·운영까지.

## Part I. RabbitMQ 기초 (AMQP 핵심)
- I-1-1. Exchange / Queue / Binding — 메시지가 흐르는 길
- I-1-2. AMQP 0-9-1 프로토콜 — frame, method, class
- I-2-1. Connection / Channel — TCP 1개, 채널 N개
- I-2-2. Producer / Consumer — publish + ack 흐름

## Part II. Exchange Type 4종
- II-1-1. Direct Exchange — routing key 정확히 매칭
- II-1-2. Topic Exchange — wildcard (*, #) 라우팅
- II-2-1. Fanout Exchange — 브로드캐스트
- II-2-2. Headers Exchange — header 매칭

## Part III. DLX · TTL · 재시도 패턴
- III-1-1. Dead Letter Exchange (DLX) — 실패 메시지 격리
- III-1-2. Message TTL — 메시지 만료
- III-2-1. Queue TTL + Length Limit — 큐 수명/크기 제한
- III-2-2. Retry 패턴 — DLX + TTL 조합 지연 재시도

## Part IV. Cluster · Mirror · Stream
- IV-1-1. Classic Cluster — 노드 결합과 메타데이터 공유
- IV-1-2. Quorum Queue — Raft 기반 복제 큐
- IV-2-1. Streams — append-only log (Kafka 스타일)
- IV-2-2. Federation vs Shovel — 멀티 클러스터 연동

## Part V. 운영 · 보안 · 사이징
- V-1-1. Monitoring — Prometheus / Grafana / alarm
- V-1-2. Management API + rabbitmqctl — 운영 명령어
- V-2-1. Security — TLS / SASL / vhost / permission
- V-2-2. Sizing — 메모리/디스크 watermark + flow control

## 색상 매핑
- 도메인 색상: orange (#FF6600 — RabbitMQ 공식)
- 좌 LiveDataPane (도메인별 시뮬레이션) + 우 VSCode CodeViewer (highlight.js + atom-one-dark)
- 3000ms autoplay, 4 controls, 키보드 ←/→
