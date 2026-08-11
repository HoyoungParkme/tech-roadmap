# Go 인터랙티브 학습 커리큘럼

## 학습 목표
Go 의 작은 문법과 강력한 동시성/표준 라이브러리를 실무에 적용한다. 구조체/인터페이스 같은 핵심 기초부터 goroutine·channel·net/http·gin·gRPC·운영까지 5단계로 다룬다.

## Part I. 기초 — Go 의 작은 문법
- I-1-1. 왜 Go 인가 — 빠른 빌드 / 정적 바이너리 / 동시성 / 단순함
- I-1-2. struct + 메서드 — 클래스 없이 데이터+행동
- I-2-1. interface — 암묵적 구현 (duck typing 컴파일 타임)
- I-2-2. error 처리 — `if err != nil` 패턴 + slice / map 기본

## Part II. 동시성 — goroutine 의 세계
- II-1-1. goroutine — 가벼운 스레드, `go` 한 줄
- II-1-2. channel — goroutine 간 안전한 통신
- II-2-1. select — 여러 채널 동시에 기다리기
- II-2-2. sync.Mutex / WaitGroup / Once — 공유 상태 보호

## Part III. HTTP / Web — net/http 와 gin
- III-1-1. net/http 표준 라이브러리 — 5줄 서버
- III-1-2. gin 프레임워크 — 라우팅 + JSON + 에러
- III-2-1. 미들웨어 패턴 — 로깅·인증·CORS
- III-2-2. JSON 직렬화 — struct tag + encoding/json

## Part IV. 패키지 & 도구
- IV-1-1. go mod — 모듈 / 버전 / vendor
- IV-1-2. go test — `_test.go` + table-driven test
- IV-2-1. go test -bench — 벤치마크 작성
- IV-2-2. pprof — CPU / 메모리 프로파일

## Part V. 실전 — MSA / gRPC / 운영
- V-1-1. MSA 구조 — 작은 서비스 분리
- V-1-2. gRPC — protobuf + 양방향 스트리밍
- V-2-1. 운영 — 로깅 / 메트릭 / 헬스체크
- V-2-2. 통합 테스트 — testcontainers + CI

## 색상 매핑
- 도메인 색상: Go cyan (#00ADD8)
- 좌 LiveDataPane (Go 시뮬레이션) + 우 CodeViewer (highlight.js + atom-one-dark)
- 3000ms autoplay, 4 controls, 키보드 ←/→
