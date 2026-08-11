# Rust 인터랙티브 학습 커리큘럼

## 학습 목표
Rust의 소유권 모델과 타입 시스템을 실무에 적용할 수 있을 만큼 익힌다. ownership/borrow/lifetime 기초부터 트레잇, async/await, 안전한 에러 처리, 실전 웹/wasm 까지 5단계로 다룬다.

## Part I. 기초 (ownership · borrow · lifetime · Result)
- I-1-1. 왜 Rust 인가 — GC 없이 메모리 안전, 컴파일러가 동시성 버그까지 잡는다
- I-1-2. ownership — 값에는 단 한 명의 주인 (move / drop / scope)
- I-2-1. borrow & reference — `&T` 와 `&mut T`, 빌림 규칙 한 번에 정리
- I-2-2. lifetime — 참조의 유효 기간을 컴파일러에 알려주는 `'a`

## Part II. 트레잇 (generic · trait · derive · impl)
- II-1-1. generic `<T>` — 함수와 구조체의 재사용
- II-1-2. trait — 동작을 묶는 인터페이스, `impl Trait for Type`
- II-2-1. derive 매크로 — `Debug` / `Clone` / `Copy` / `PartialEq`
- II-2-2. trait object vs static dispatch — `dyn Trait` 과 `impl Trait`

## Part III. 비동기 (async · await · tokio · Future)
- III-1-1. `async fn` 과 `await` — Future 의 lazy 평가
- III-1-2. tokio runtime — `#[tokio::main]`, multi-thread 실행기
- III-2-1. `Future` 트레잇 — poll / Pending / Ready 의 구조
- III-2-2. `select!` / `join!` — 동시성 합성

## Part IV. 안전성 (Option · Result · panic · error)
- IV-1-1. `Option<T>` — null 의 부재를 타입으로 표현
- IV-1-2. `Result<T, E>` 와 `?` 연산자 — 예외 대신 값으로 흐름 표현
- IV-2-1. `panic!` 과 `unwrap` — 언제 허용되고 언제 금지되는가
- IV-2-2. `thiserror` / `anyhow` — 라이브러리 vs 애플리케이션 에러 패턴

## Part V. 실전 (Actix · Axum · wasm · cargo)
- V-1-1. Actix-web 핸들러 — Extractor 와 Responder
- V-1-2. Axum 라우터 — tower 미들웨어와 State 공유
- V-2-1. wasm-bindgen — Rust 함수를 브라우저에서 호출
- V-2-2. cargo 워크스페이스 — 멀티 크레이트 / 릴리스 빌드 / publish 체크리스트

## 색상 매핑
- 도메인 색상: Rust orange (#CE422B)
- 좌 LiveDataPane (Rust 도메인 시뮬레이션) + 우 VSCode CodeViewer (highlight.js + atom-one-dark)
- 3000ms autoplay, 4 controls, 키보드 ←/→
- 코드 lang = `rust`
