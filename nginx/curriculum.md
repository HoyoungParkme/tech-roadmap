# Nginx 인터랙티브 학습 커리큘럼

## 학습 목표
Nginx로 정적 파일 서빙, 리버스 프록시, 로드 밸런싱, TLS, 캐싱, 보안 헤더를 운영 수준으로 다룬다.

## Part I. Nginx 기초 (Why Nginx)
- I-1-1. 웹 서버란 — Apache 한계와 Event-driven 모델
- I-1-2. Nginx 설치 + 첫 페이지
- I-2-1. nginx.conf 구조 (events / http / server / location)
- I-2-2. 정적 파일 서빙 (root / index / try_files)

## Part II. 리버스 프록시
- II-1-1. proxy_pass — 백엔드로 요청 전달
- II-1-2. proxy 헤더 (X-Real-IP / X-Forwarded-For / Host)
- II-2-1. WebSocket 프록시 (Upgrade / Connection)
- II-2-2. 타임아웃·버퍼·재시도

## Part III. 로드 밸런싱
- III-1-1. upstream 블록 + round-robin
- III-1-2. 알고리즘 (least_conn / ip_hash / weight)
- III-2-1. health check + passive/active
- III-2-2. sticky session vs stateless

## Part IV. TLS · 캐싱 · 성능
- IV-1-1. TLS — Let's Encrypt + certbot
- IV-1-2. HTTP/2 + HTTP/3 (QUIC)
- IV-2-1. proxy_cache — 응답 캐싱
- IV-2-2. gzip / brotli + 정적 파일 캐시 헤더

## Part V. 보안과 운영
- V-1-1. rate limiting (limit_req)
- V-1-2. 보안 헤더 (HSTS / CSP / X-Frame-Options)
- V-2-1. access_log + 모니터링 (stub_status / Prometheus)
- V-2-2. 실전 체크리스트 — 운영 출항 점검표

## 색상 매핑: green / 좌 LiveDataPane + 우 VSCode CodeViewer + highlight.js atom-one-dark / 3000ms autoplay / 4 controls / 키보드 ←/→
