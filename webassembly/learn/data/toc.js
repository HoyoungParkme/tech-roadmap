/**
 * toc.js
 * 경로: webassembly/learn/data/toc.js
 * 목적: WebAssembly 학습 전체 5 Part 목차(TOC) 데이터
 * 주요 기능: 사이드바 렌더링, 네비게이션, 구현 상태 관리
 */
window.WasmLearn = window.WasmLearn || {};

window.WasmLearn.TOC = [
  {
    part: 'I', title: 'WebAssembly 기초',
    chapters: [
      { chapter: '1', title: 'WASM 모듈과 포맷', sections: [
        { id: 'I-1-1', title: 'WebAssembly가 무엇인가 — wasm 모듈의 정체', implemented: true },
        { id: 'I-1-2', title: '바이너리 포맷과 WAT — 사람이 읽는 텍스트 표현', implemented: true },
        { id: 'I-1-3', title: '스택 머신 — WASM 실행 모델', implemented: true },
      ]},
      { chapter: '2', title: '샌드박스', sections: [
        { id: 'I-2-1', title: '샌드박스와 선형 메모리 — 왜 안전한가', implemented: true },
      ]},
    ]
  },
  {
    part: 'II', title: '컴파일 (소스 언어 → wasm)',
    chapters: [
      { chapter: '1', title: '시스템 언어 컴파일', sections: [
        { id: 'II-1-1', title: 'Rust → wasm — 가장 일급 시민', implemented: true },
        { id: 'II-1-2', title: 'AssemblyScript — TypeScript 문법으로 WASM 작성', implemented: true },
        { id: 'II-1-3', title: 'Emscripten — C/C++ 코드를 wasm으로', implemented: true },
      ]},
      { chapter: '2', title: 'GC 언어 컴파일', sections: [
        { id: 'II-2-1', title: 'Go → wasm — GOOS=js GOARCH=wasm', implemented: true },
      ]},
    ]
  },
  {
    part: 'III', title: 'JS interop · 바인딩',
    chapters: [
      { chapter: '1', title: 'JS API와 바인딩', sections: [
        { id: 'III-1-1', title: 'JS와 WASM이 함수를 주고받는 법 — import/export', implemented: false },
        { id: 'III-1-2', title: 'WebAssembly JS API — WebAssembly.instantiate', implemented: false },
        { id: 'III-1-3', title: 'wasm-bindgen — Rust↔JS 자동 바인딩', implemented: false },
        { id: 'III-1-4', title: '메모리 공유 — ArrayBuffer, Memory, 문자열 전달', implemented: false },
      ]},
    ]
  },
  {
    part: 'IV', title: 'WASI · Edge 런타임',
    chapters: [
      { chapter: '1', title: 'WASI와 엣지', sections: [
        { id: 'IV-1-1', title: 'WASI — 브라우저 밖의 WASM', implemented: false },
        { id: 'IV-1-2', title: 'Component Model — 언어 독립 모듈 합성', implemented: false },
        { id: 'IV-1-3', title: 'Wasmtime — 표준 WASI 런타임', implemented: false },
        { id: 'IV-1-4', title: '엣지 런타임 — Cloudflare / Fastly', implemented: false },
      ]},
    ]
  },
  {
    part: 'V', title: '실전',
    chapters: [
      { chapter: '1', title: '성능·보안·번들·사용 사례', sections: [
        { id: 'V-1-1', title: '성능 — 어디서 WASM이 빠른가', implemented: false },
        { id: 'V-1-2', title: '보안 — 샌드박스의 한계와 베스트 프랙티스', implemented: false },
        { id: 'V-1-3', title: '번들 크기 — 다운로드 비용 최적화', implemented: false },
        { id: 'V-1-4', title: '실전 사용 사례 — Figma, Photoshop Web, ffmpeg.wasm', implemented: false },
      ]},
    ]
  },
];

window.WasmLearn.APPENDIX = [];
