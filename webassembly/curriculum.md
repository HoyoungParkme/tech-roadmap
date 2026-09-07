# WebAssembly 학습 커리큘럼

> "한 번 컴파일하고, 어디서든 안전하게 실행한다."
> 브라우저, 서버, 엣지, 임베디드 — 단 하나의 바이너리 포맷.

---

## 학습 목표

1. **WebAssembly가 무엇이고 왜 등장했는가** — 브라우저 JS의 한계, 휴대성, 보안 샌드박스의 필요성을 이해한다.
2. **WASM 모듈의 내부 구조** — 바이너리 포맷, 스택 머신, 선형 메모리, 임포트/익스포트.
3. **다양한 언어에서 WASM으로 컴파일하는 법** — Rust, AssemblyScript, C/C++ (Emscripten), Go.
4. **JS와의 인터롭(interop) 및 바인딩** — wasm-bindgen, JS API, 메모리 공유.
5. **WASI와 엣지 런타임** — 브라우저 밖에서의 WASM, Wasmtime, Cloudflare Workers, Fastly.
6. **실전 적용** — 성능, 보안, 번들 크기, 사용 사례.

---

## Part I — WebAssembly 기초

WASM이 무엇이고, 모듈은 어떤 구조이며, 왜 안전한지를 이해하는 파트.

### Ch.1 WASM 모듈과 포맷

- **I-1-1. WebAssembly가 무엇인가 — wasm 모듈의 정체** (★☆☆)
  - JS의 성능/보안 한계와 WASM의 등장 배경
  - `.wasm` 파일이 무엇인지, 어떻게 브라우저가 로드하는지
- **I-1-2. 바이너리 포맷과 WAT — 사람이 읽는 텍스트 표현** (★★☆)
  - 바이너리 모듈의 섹션 구조 (type, function, memory, export)
  - WAT(WebAssembly Text Format)로 모듈을 직접 작성하는 법
- **I-1-3. 스택 머신 — WASM 실행 모델** (★★☆)
  - 레지스터 머신 vs 스택 머신
  - `local.get`, `i32.add`, `call` — 명령어가 스택을 어떻게 다루는가

### Ch.2 샌드박스

- **I-2-1. 샌드박스와 선형 메모리 — 왜 안전한가** (★★☆)
  - capability-based 보안 모델
  - linear memory, OS 격리, JS와의 신뢰 경계

---

## Part II — 컴파일 (소스 언어 → wasm)

여러 언어를 어떻게 WASM 모듈로 컴파일하는지, 각 언어의 장단점은 무엇인지 다룬다.

### Ch.1 시스템 언어 컴파일

- **II-1-1. Rust → wasm — 가장 일급 시민** (★★☆)
  - `cargo new --lib`, `wasm32-unknown-unknown` 타깃
  - `cdylib`, `#[no_mangle]`, `extern "C"` — 익스포트의 핵심
- **II-1-2. AssemblyScript — TypeScript 문법으로 WASM 작성** (★★☆)
  - TS 친화적 문법, 컴파일러 `asc`
  - JS 개발자에게 가장 진입장벽이 낮은 옵션
- **II-1-3. Emscripten — C/C++ 코드를 wasm으로** (★★★)
  - LLVM 기반 toolchain, `emcc`
  - 기존 C 라이브러리(libsqlite, ffmpeg)를 브라우저에서 돌리는 길

### Ch.2 GC 언어 컴파일

- **II-2-1. Go → wasm — `GOOS=js GOARCH=wasm`** (★★★)
  - Go 런타임이 통째로 wasm에 포함되는 구조
  - 번들 크기 트레이드오프, TinyGo로 줄이는 방법

---

## Part III — JS interop · 바인딩 (예정)

- III-1-1. JS와 WASM이 함수를 주고받는 법 — import/export
- III-1-2. WebAssembly JS API — `WebAssembly.instantiate`
- III-1-3. wasm-bindgen — Rust↔JS 자동 바인딩
- III-1-4. 메모리 공유 — `ArrayBuffer`, `Memory`, 문자열 전달

---

## Part IV — WASI · Edge 런타임 (예정)

- IV-1-1. WASI(WebAssembly System Interface) — 브라우저 밖의 WASM
- IV-1-2. Component Model — 언어 독립 모듈 합성
- IV-1-3. Wasmtime — 표준 WASI 런타임
- IV-1-4. 엣지 런타임 — Cloudflare Workers / Fastly Compute@Edge

---

## Part V — 실전 (예정)

- V-1-1. 성능 — 어디서 WASM이 빠른가, 어디서 안 빠른가
- V-1-2. 보안 — 샌드박스의 한계와 베스트 프랙티스
- V-1-3. 번들 크기 — 다운로드 비용 최적화
- V-1-4. 실전 사용 사례 — Figma, Photoshop Web, ffmpeg.wasm

---

## 학습 흐름

```
Part I (기초)           Part II (컴파일)        Part III (JS interop)
─────────────────       ─────────────────       ─────────────────
무엇/왜              →  어떻게 만드는가      →  JS와 어떻게 연결
바이너리/스택            Rust/AS/C/Go            wasm-bindgen
                                                ↓
                                       Part IV (WASI/엣지)
                                       Part V (실전)
```

---

## 권장 학습 순서

1. **개발자라면**: Part I → Part II(Rust) → Part III → Part V
2. **JS 개발자라면**: Part I → Part II(AssemblyScript) → Part III → Part V
3. **인프라/엣지 관심**: Part I → Part IV → Part V

---

## 참고 자료

- [WebAssembly 공식 사이트](https://webassembly.org/)
- [MDN WebAssembly 가이드](https://developer.mozilla.org/ko/docs/WebAssembly)
- [Rust and WebAssembly 책](https://rustwasm.github.io/docs/book/)
- [Wasmtime 문서](https://docs.wasmtime.dev/)
