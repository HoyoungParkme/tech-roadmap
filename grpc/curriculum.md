# gRPC 인터랙티브 학습 커리큘럼

## 학습 목표
HTTP/JSON REST를 넘어, Protocol Buffers IDL과 HTTP/2 위의 RPC가 어떻게 동작하는지, 그리고 streaming/metadata/error/observability까지 실전 운영 관점에서 다룬다.

## Part I. gRPC 기초 — Protocol Buffers와 RPC
- I-1-1. Protocol Buffers IDL — `.proto` 한 파일이 만드는 계약
- I-1-2. RPC vs REST — "함수 호출처럼" 부르는 모델
- I-2-1. HTTP/2 위에서 — 한 연결, 다중 스트림
- I-2-2. Code Generation — `.proto` → Go/Python 클라이언트·서버 동시 생성

## Part II. Streaming — 4가지 RPC 모드
- II-1-1. Unary RPC — 1 요청 / 1 응답
- II-1-2. Server Streaming — 1 요청 / N 응답
- II-2-1. Client Streaming — N 요청 / 1 응답
- II-2-2. Bidirectional Streaming — N↔N 양방향

## Part III. Metadata + Interceptor (예정)
- III-1-1. Metadata — gRPC 헤더의 정체
- III-1-2. Server Interceptor — middleware의 gRPC 버전
- III-2-1. Client Interceptor — 재시도·로깅·전파
- III-2-2. Auth — JWT/mTLS를 metadata + interceptor로

## Part IV. Error + Deadline + Retry (예정)
- IV-1-1. Status Code — gRPC 표준 14종
- IV-1-2. Deadline — "언제까지" 응답이 와야 하나
- IV-2-1. Retry Policy — service config로 선언
- IV-2-2. Circuit Breaker — 장애 전파 차단

## Part V. 실전 운영 (예정)
- V-1-1. grpc-gateway — gRPC를 REST로도 열기
- V-1-2. Observability — OpenTelemetry + Prometheus
- V-2-1. Load Balancing — pick_first / round_robin / xDS
- V-2-2. 실전 사례 — Netflix·Spotify·Cloudflare의 gRPC

## 색상 매핑
- 메인 컬러: `#2DA6B0` (gRPC 공식 teal-cyan)
- 패턴: fastapi v1 — 좌(LiveDataPane) / 우(VSCode CodeViewer 다중 탭)

## 언어 구성
- Part I+II 코드 탭: `protobuf` (IDL) + `go` (서버) + `python` (클라이언트) 위주, 필요 시 `bash`/`markdown` 보조
