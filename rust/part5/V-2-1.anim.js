/* V-2-1 wasm-bindgen — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 만델브로트 궤도·반복 횟수는 페이지의 mandelbrot 함수를 그대로 계산한다 ((-0.75, 0.1) → 33, (-0.5, 0) → 1000, rustc 로도 확인).
 * JS/wasm 속도 막대(100 · 22 · 140)는 페이지가 준 예시 값이라 그림에도 "예시"로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, snippet, cross, check, terminal, hbar, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));

  // 페이지 코드와 같은 계산
  function mandel(cx, cy, max) { let x = 0, y = 0, i = 0; while (x * x + y * y <= 4 && i < max) { const xt = x * x - y * y + cx; y = 2 * x * y + cy; x = xt; i++; } return i; }
  function orbit(cx, cy, max) { const pts = [[0, 0]]; let x = 0, y = 0, i = 0; while (x * x + y * y <= 4 && i < max) { const xt = x * x - y * y + cx; y = 2 * x * y + cy; x = xt; i++; pts.push([x, y]); } return pts; }
  // 작은 만델브로트 그림 (칸 크기 cs, 실수 범위 re, 허수 범위 im)
  function fractal(x0, y0, cols, rows, cs, re, im, u) { const max = 40, shown = Math.floor(clamp(u) * cols * rows);
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { if (r * cols + q >= shown) return;
      const cx = re[0] + (re[1] - re[0]) * (q + 0.5) / cols, cy = im[1] - (im[1] - im[0]) * (r + 0.5) / rows, n = mandel(cx, cy, max);
      el('rect', { x: x0 + q * cs, y: y0 + r * cs, width: cs, height: cs, fill: n >= max ? INK : ACC, opacity: n >= max ? 1 : 0.08 + 0.9 * Math.sqrt(n / max) }); } }

  // ---------- 1. wasm 이란 · 만델브로트 ----------
  const PX = (v) => 700 + 90 * v, PY = (v) => 215 - 90 * v;
  function plane(op) { el('line', { x1: 520, y1: 215, x2: 900, y2: 215, stroke: GRID, 'stroke-width': 1.5, opacity: op }); el('line', { x1: 700, y1: 30, x2: 700, y2: 400, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    el('circle', { cx: 700, cy: 215, r: 180, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: op });
    tx(890, 240, '실수', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); tx(712, 46, '허수', { 'font-size': 13.5, fill: MUT, opacity: op });
    tx(842, 74, 'x²+y² = 4', { 'font-size': 13.5, fill: WARN, class: 'mono', opacity: op }); }
  function stateCells(x, y, i, op) { [['x', x], ['y', y], ['i', i]].forEach(([n, v], j) => { const yy = 210 + j * 56;
    mono(60, yy + 6, n, { 'font-size': 17, 'font-weight': 800, opacity: op });
    card(190, yy, 160, 42, { rx: 6, text: typeof v === 'number' && n !== 'i' ? v.toFixed(3) : String(v), fs: 16, mono: true, fw: 700, stroke: n === 'i' ? ACC : GRID, color: n === 'i' ? ACC : INK, op }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { // 두 길: JS 소스 vs .wasm 바이너리
      [['app.js', ['파싱', 'JIT 예열', '기계어'], WARN, 70], ['.wasm', ['검증', '컴파일', '기계어'], ACC, 170]].forEach(([n, st, col, y], i) => {
        card(100, y, 120, 50, { text: n, fs: 16, mono: true, fw: 800, stroke: col, s: pop(u, 0.2 + i * 0.4) });
        st.forEach((s, j) => { const x = 250 + j * 160, a = 0.5 + i * 0.4 + j * 0.25; grow(x - 70, y, x - 40, y, E(u, a, a + 0.2), MUT); card(x + 20, y, 110, 40, { rx: 8, text: s, fs: 14.5, stroke: GRID, s: pop(u, a + 0.1) }); }); });
      mono(100, 214, '00 61 73 6D …', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      // 번들 비교
      const g = E(u, 1.6, 2.4);
      tx(60, 296, 'GC 언어', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); tx(60, 356, 'Rust', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      el('rect', { x: 170, y: 278, width: 300 * g, height: 28, rx: 5, fill: OFF }); el('rect', { x: 170 + 300 * g, y: 278, width: 160 * g, height: 28, rx: 5, fill: ACC, opacity: 0.8 });
      el('rect', { x: 170, y: 338, width: 160 * g, height: 28, rx: 5, fill: ACC, opacity: 0.8 });
      tx(170 + 150 * g, 297, g > 0.9 ? 'GC 런타임' : '', { 'font-size': 13.5, fill: PANEL, 'font-weight': 700, 'text-anchor': 'middle' });
      tx(550, 297, g > 0.9 ? '앱' : '', { 'font-size': 13.5, fill: PANEL, 'font-weight': 700, 'text-anchor': 'middle' });
      tx(250, 357, g > 0.9 ? '앱만' : '', { 'font-size': 13.5, fill: PANEL, 'font-weight': 700, 'text-anchor': 'middle' });
      sub(700, 400, '크기는 개념 비교 · GC 를 싣지 않으니 바이너리가 작다', fade(u, 2.3), { 'font-size': 14 }); return; }
    plane(k === 1 ? fade(u, 0.2) : k === 4 ? 0.25 : 1);
    snippet(24, 30, ['pub fn mandelbrot(cx: f64, cy: f64,', '                  max_iter: u32) -> u32'], { fs: 14 });
    const cx = -0.75, cy = 0.1, pts = orbit(cx, cy, 1000);
    if (k < 4) el('circle', { cx: PX(cx), cy: PY(cy), r: 7, fill: INFO, opacity: k === 1 ? fade(u, 0.8) : 1 });
    const lo = k === 1 ? fade(u, 1.0) : k === 4 ? 0 : 1; tx(508, 134, 'c = (-0.75, 0.1)', { 'font-size': 14, fill: INFO, 'font-weight': 700, 'text-anchor': 'end', class: 'mono', opacity: lo });
    el('line', { x1: 512, y1: 132, x2: PX(cx) - 6, y2: PY(cy) - 4, stroke: INFO, 'stroke-width': 1.4, opacity: lo });
    if (k === 1) { note(40, 190, '픽셀 하나 = 복소평면 위 점 c', fade(u, 1.4)); note(40, 226, '돌려주는 값 = 원 밖으로 나가기까지 반복 수', fade(u, 1.9), { fill: ACC }); return; }
    if (k === 2) { stateCells(0, 0, 0, fade(u, 0.3)); el('circle', { cx: PX(0), cy: PY(0), r: 6, fill: ACC, opacity: fade(u, 0.8) });
      note(40, 380, '스택 변수 셋 · 힙 할당 없음', fade(u, 1.4)); return; }
    // k3: 궤도를 따라 반복
    const n = pts.length - 1, m = k === 3 ? Math.floor(E(u, 0.2, 2.4) * n) : n;
    const vis = pts.slice(0, m + 1).map(([a, b]) => [clamp(PX(a), 520, 940), clamp(PY(b), 20, 410)]);
    if (k === 3 && vis.length > 1) el('polyline', { points: vis.map((p) => p.join(',')).join(' '), fill: 'none', stroke: ACC, 'stroke-width': 1.4, opacity: 0.55 });
    if (k === 3) vis.forEach(([x, y], j) => el('circle', { cx: x, cy: y, r: j === vis.length - 1 ? 6 : 3, fill: j === vis.length - 1 ? ACC : ACC, opacity: j === vis.length - 1 ? 1 : 0.6 }));
    const [lx, ly] = pts[m];
    if (k === 3) { stateCells(lx, ly, m, 1); if (m === n) note(40, 390, `|z| > 2 · ${n}번째에 탈출`, 1, { fill: WARN }); return; }
    // k4: 결과는 숫자 하나
    stateCells(lx, ly, n, 0.35);
    card(260, 120, 300, 46, { rx: 10, text: 'mandelbrot(-0.75, 0.1, 1000) = 33', fs: 14, mono: true, fw: 700, stroke: ACC, s: pop(u, 0.2) });
    fractal(560, 70, 36, 30, 10, [-2.1, 0.6], [-1.12, 1.12], E(u, 0.8, 2.2));
    sub(740, 400, '점마다 반복 수를 색으로 · 검은 칸 = 집합 안', fade(u, 2.2), { 'font-size': 14 });
    banner(260, 410, 'u32 하나 → JS 에서는 number', pop(u, 1.8)); }

  // ---------- 2. #[wasm_bindgen] 다리 ----------
  const BR = [['u32 / f64', 'number', '그대로'], ['String', 'string', '복사'], ['JsValue', 'any', '래핑']];
  function worlds(op) { zone(24, 24, 270, 372, 'JS', { fill: WARNBG, color: WARN, op }); zone(666, 24, 270, 372, 'wasm 선형 메모리', { fill: ACCBG, color: ACC, op });
    zone(310, 24, 340, 372, 'wasm-bindgen 글루', { fill: SOFT, op }); }
  function mem(x, y, vals, hot) { vals.forEach((v, i) => { const cx = x + (i % 6) * 40, cy = y + Math.floor(i / 6) * 40;
    el('rect', { x: cx, y: cy, width: 36, height: 34, rx: 4, fill: v ? PANEL : SOFT, stroke: hot ? ACC : GRID, 'stroke-width': 1.4 });
    if (v) mono(cx + 18, cy + 22, v, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700 }); }); }
  function s2(t, c) { const { k, u } = c; worlds(1);
    if (k === 0) { BR.forEach(([r, j, how], i) => { const y = 100 + i * 90, o = fade(u, 0.3 + i * 0.5);
        mono(800, y + 5, r, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: o }); mono(160, y + 5, j, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: o });
        grow(720, y, 230, y, E(u, 0.4 + i * 0.5, 0.9 + i * 0.5), i === 0 ? GOOD : i === 1 ? WARN : INFO, { sw: 2.5 });
        pill(480, y - 22, how, i === 0 ? GOOD : i === 1 ? WARN : INFO, pop(u, 0.8 + i * 0.5), { fs: 13.5, fill: PANEL }); });
      sub(480, 380, 'wasm 자체는 정수·실수만 안다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 1) { const A = ['41', '6C', '69', '63', '65'];
      mono(160, 90, 'greet("Alice")', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      fly(200, 120, 760, 120, seg(u, 0.2, 0.9), '"Alice"', { mono: true, fill: WARN });
      const fill = Math.floor(E(u, 0.8, 1.3) * 5); mem(690, 100, A.map((v, i) => (i < fill ? v : '')).concat(['', '', '', '', '', '', '']), u > 0.8 && u < 1.5);
      sub(800, 200, 'UTF-8 바이트로 복사', fade(u, 1.0), { 'font-size': 14 });
      mono(800, 250, 'format!(…)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.4) });
      fly(760, 290, 200, 290, seg(u, 1.6, 2.4), '"Hello, Alice! from Rust"', { mono: true, stay: true, fill: ACC });
      sub(480, 380, '문자열은 건널 때마다 복사된다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 2) { snippet(330, 70, ['extern "C" {', '  #[wasm_bindgen(js_namespace', '      = console)]', '  fn log(s: &str);', '}'], { fs: 13.5 });
      card(800, 290, 180, 44, { text: 'log(…)', fs: 15, mono: true, fw: 700, stroke: ACC });
      card(160, 290, 200, 44, { text: 'console.log', fs: 15, mono: true, fw: 700, stroke: WARN, s: pop(u, 0.5) });
      grow(708, 290, 262, 290, E(u, 0.8, 1.6), ACC, { sw: 2.6 });
      sub(160, 330, '몸통은 JS 쪽에 있다', fade(u, 1.6), { 'font-size': 14 }); sub(800, 330, '선언만 한다', fade(u, 1.2), { 'font-size': 14 }); return; }
    // k3: count_up(3) — 반복마다 경계를 넘는다
    mono(800, 80, 'count_up(3)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    for (let i = 0; i < 3; i++) { const a = 0.3 + i * 0.7; dot([[730, 140 + i * 60], [230, 140 + i * 60]], seg(u, a, a + 0.5), ACC, 7);
      pill(480, 140 + i * 60, `"tick ${i}"`, ACC, pop(u, a + 0.1), { mono: true, fs: 13.5, fill: PANEL }); }
    terminal(40, 270, 240, 112, ['tick 0', 'tick 1', 'tick 2'], clamp((u - 0.8) / 0.7, 0, 3), { title: 'console', lh: 20 });
    note(330, 386, '경계 3번 · 문자열 복사 3번', fade(u, 2.3), { fill: WARN }); }

  // ---------- 3. wasm-pack build ----------
  const FILES = [['my_wasm_bg.wasm', '바이너리'], ['my_wasm.js', 'JS 글루'], ['my_wasm.d.ts', 'TS 타입'], ['package.json', 'npm 메타']];
  function tree(u0, hi) { tx(40, 160, 'pkg/', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
    FILES.forEach(([f, d], i) => { const y = 196 + i * 40, o = u0 == null ? 1 : fade(u0, 0.6 + i * 0.35), h = hi && hi(i);
      el('line', { x1: 50, y1: y - 30, x2: 50, y2: y - 5, stroke: GRID, 'stroke-width': 1.5, opacity: o }); el('line', { x1: 50, y1: y - 5, x2: 64, y2: y - 5, stroke: GRID, 'stroke-width': 1.5, opacity: o });
      mono(72, y, f, { 'font-size': 15, 'font-weight': 700, fill: h === 'off' ? OFF : h ? ACC : INK, opacity: o }); tx(260, y, d, { 'font-size': 13.5, fill: MUT, opacity: o }); }); }
  function linear(x, y, s) { for (let i = 0; i < 12; i++) el('rect', { x: x + i * 26, y, width: 22, height: 30, rx: 3, fill: ACCBG, stroke: ACC, 'stroke-width': 1.2, opacity: s * clamp(s * 12 - i) }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { terminal(40, 30, 520, 86, ['$ wasm-pack build --target web', ['  cargo → wasm32 → wasm-bindgen', null]], clamp(u / 0.6, 0, 2), { title: 'terminal' });
      tree(u, null); sub(700, 240, 'npm 패키지 한 벌이 pkg/ 에 생긴다', fade(u, 2.2), { 'font-size': 14 }); return; }
    tree(null, (i) => (k === 1 ? (i === 1 ? true : i === 0 ? 'off' : false) : i <= 1));
    mono(40, 60, 'import init, { greet, mandelbrot } from "./pkg/my_wasm.js";', { 'font-size': 14, 'font-weight': 700 });
    if (k === 1) { sub(500, 214, '← .wasm 은 아직 내려받지 않았다', fade(u, 0.8), { 'font-size': 14, fill: MUT, 'text-anchor': 'start' }); return; }
    // k2 이후: init 으로 인스턴스화
    const pr = k === 2 ? E(u, 0.3, 1.4) : 1;
    mono(560, 120, 'await init();', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    el('rect', { x: 560, y: 140, width: 330, height: 12, rx: 6, fill: SOFT }); el('rect', { x: 560, y: 140, width: 330 * pr, height: 12, rx: 6, fill: ACC });
    tx(560, 178, pr < 1 ? '.wasm 내려받는 중' : 'WebAssembly 인스턴스 준비', { 'font-size': 14, fill: pr < 1 ? MUT : GOOD, 'font-weight': 700 });
    linear(560, 196, k === 2 ? E(u, 1.5, 2.3) : 1); sub(716, 246, '선형 메모리', k === 2 ? fade(u, 2.0) : 1, { 'font-size': 13.5 });
    if (k === 2) return;
    const lines = ['> greet("Alice")', ['"Hello, Alice! from Rust"', '#86efac']].concat(k === 4 ? ['> mandelbrot(-0.5, 0.0, 1000)', ['iterations: 1000', '#86efac']] : []);
    terminal(420, 280, 500, 126, lines, k === 3 ? clamp(u / 0.8, 0, 2) : 2 + clamp(u / 0.8, 0, 2), { title: 'console' });
    if (k === 4) sub(240, 400, '숫자만 오가는 호출은 복사가 없다', fade(u, 1.8), { 'font-size': 14 }); }

  // ---------- 4. 경계 비용 ----------
  function bench(js, wa, u) { tx(40, 330, 'JS', { 'font-size': 14, 'font-weight': 700 }); tx(40, 362, 'wasm', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    const g = E(u, 0.3, 1.6), max = Math.max(js, wa); hbar(100, 318, 300, js * g, max, { col: WARN, text: `${js}` }); hbar(100, 350, 300, wa * g, max, { col: ACC, text: `${wa}` });
    tx(40, 400, '예시 값 · 상대 시간', { 'font-size': 13.5, fill: MUT }); }
  function s4(t, c) { const { k, u } = c, b = c.beat.bench || {}, p = (c.prev && c.prev.bench) || {};
    zone(24, 24, 430, 270, 'JS', { fill: WARNBG, color: WARN }); zone(506, 24, 430, 270, 'wasm 선형 메모리', { fill: ACCBG, color: ACC });
    el('line', { x1: 480, y1: 20, x2: 480, y2: 300, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }); tx(480, 318, '경계', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle' });
    // 캔버스(JS) 와 버퍼(wasm)
    const cv = (x, y, fillU, col) => { for (let r = 0; r < 10; r++) for (let q = 0; q < 10; q++) { const on = (r * 10 + q) / 100 < fillU;
      el('rect', { x: x + q * 19, y: y + r * 19, width: 17, height: 17, rx: 2, fill: on ? col : PANEL, stroke: GRID, 'stroke-width': 1, opacity: on ? 0.75 : 1 }); } };
    if (k === 0) { mono(80, 90, 'await init();', { 'font-size': 16, 'font-weight': 700 }); linear(560, 120, E(u, 0.4, 1.4));
      note(560, 190, '서로 다른 메모리 두 칸', fade(u, 1.4)); mono(240, 250, '경계 넘은 횟수 0', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    cv(140, 60, k === 4 ? E(u, 0.6, 1.8) : 0, INK);
    mono(235, 274, '1000 × 1000 = 1,000,000 픽셀', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 0.5) : 1 });
    if (k === 1) { sub(720, 160, '무거운 일감이 정해졌다', fade(u, 1.0), { 'font-size': 15 }); return; }
    if (k === 2) { for (let i = 0; i < 8; i++) { const ph = (t * 1.6 + i / 8) % 1; dot([[440, 60 + i * 28], [520, 60 + i * 28], [440, 74 + i * 28]], ph, BAD, 5); }
      const n = Math.round(tween(0, 1000000, u, 2.0));
      mono(720, 130, `호출 ${n.toLocaleString('en-US')}번`, { 'font-size': 20, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      sub(720, 170, 'mandel_one(i) 를 픽셀마다', 1, { 'font-size': 14, class: 'mono' });
      bench(b.jsMs, b.wasmMs, u); note(460, 360, '오히려 JS 보다 느리다', fade(u, 1.8), { fill: BAD }); return; }
    // k3·k4: 한 번에 위임
    cv(620, 60, k === 3 ? E(u, 0.9, 2.0) : 1, ACC);
    if (k === 3) { fly(300, 150, 700, 150, seg(u, 0.2, 0.8), 'render_fractal(1000, 1000)', { mono: true, fill: INFO });
      fly(700, 260, 260, 260, seg(u, 2.0, 2.6), 'pixels', { mono: true, fill: ACC });
      mono(720, 274, '경계 1번', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.0) });
      bench(b.jsMs, b.wasmMs, u); return; }
    mono(720, 274, '4,000,000 바이트 (RGBA)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
    fractal(560, 318, 24, 10, 9, [-2.1, 0.6], [-0.6, 0.6], E(u, 0.6, 2.0));
    note(40, 340, 'new Uint8ClampedArray(pixels.buffer)', fade(u, 0.3), { class: 'mono', 'font-size': 14 });
    note(40, 370, '→ ImageData → putImageData', fade(u, 0.8), { class: 'mono', 'font-size': 14 });
    sub(240, 404, '감싸기만 하고 다시 복사하지 않는다', fade(u, 1.6), { 'font-size': 14 }); }

  // ---------- 5. 실무 함정 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { terminal(40, 40, 420, 120, [['RuntimeError: unreachable', '#f87171']], clamp((u - 0.2) / 0.4, 0, 1), { title: 'hook 없음' });
      terminal(500, 40, 420, 120, [['panicked at src/lib.rs:줄:칸:', '#f87171'], '패닉 메시지 원문'], clamp((u - 1.0) / 0.4, 0, 2), { title: 'console_error_panic_hook' });
      snippet(40, 210, ['#[wasm_bindgen(start)]', 'pub fn start() {', '    console_error_panic_hook::set_once();', '}'], { fs: 14, op: fade(u, 1.5) });
      note(560, 260, '모듈을 불러오면 start 가 먼저 돈다', fade(u, 1.9)); sub(560, 290, '패닉 위치와 메시지가 콘솔에 남는다', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    if (k === 1) { // DOM 은 web-sys 를 거친다
      card(150, 210, 180, 60, { text: 'wasm', fs: 18, fw: 800, stroke: ACC, color: ACC });
      const D = [['window', 520, 90], ['document', 520, 190], ['<title>', 520, 290]];
      D.forEach(([n, x, y], i) => { card(x, y, 150, 44, { text: n, fs: 15, mono: true, fw: 700, stroke: WARN, s: pop(u, 0.2 + i * 0.2) }); if (i) grow(x, y - 72, x, y - 24, E(u, 0.9 + i * 0.3, 1.2 + i * 0.3), WARN); });
      grow(240, 210, 440, 290, E(u, 0.3, 0.7), BAD, { dash: '5 5', plain: true }); cross(340, 250, 11, pop(u, 0.7));
      el('path', { d: 'M 240,190 C 320,90 380,90 440,90', fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 0.9) });
      tx(330, 96, 'web_sys::window()', { 'font-size': 14, fill: ACC, class: 'mono', 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      note(640, 200, 'unwrap 두 번을 거쳐야 닿는다', fade(u, 1.8)); sub(640, 230, 'DOM 조작은 JS 에 맡기는 편이 짧다', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    // k2: 번들 줄이기 (크기 숫자 없이 구성만)
    const parts = [['앱 코드', ACC, 220, null], ['패닉 언와인딩', WARN, 150, 'panic = "abort"'], ['안 쓰는 코드', OFF, 170, 'lto = true'], ['속도용 펼침', INFO, 140, 'opt-level = "z"']];
    let x = 40; parts.forEach(([n, col, w, opt], i) => { const gone = i === 0 ? 0 : E(u, 0.4 + i * 0.5, 0.9 + i * 0.5), ww = w * (1 - gone * (i === 3 ? 0.6 : 1));
      el('rect', { x, y: 120, width: Math.max(0, ww - 4), height: 50, rx: 6, fill: col, opacity: 0.8 });
      if (ww > 80) tx(x + ww / 2, 150, n, { 'font-size': 14, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' });
      if (opt) { const y = 240 + (i - 1) * 46; mono(60, y, opt, { 'font-size': 15, 'font-weight': 700, fill: col === OFF ? INK : col, opacity: fade(u, 0.3 + i * 0.5) });
        tx(260, y, `→ ${n} ${i === 3 ? '줄임' : '제거'}`, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6 + i * 0.5) }); }
      x += ww; });
    tx(40, 100, '[profile.release]', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    sub(700, 380, '막대 길이는 개념 그림 · 실제 크기는 빌드해 확인', fade(u, 2.2), { 'font-size': 14 }); }

  const quiz = [
    { q: 'mandelbrot(-0.75, 0.1, 1000)이 돌려주는 값은 무엇을 뜻하는가?',
      o: ['그 점의 밝기(0~255)', '점이 반지름 2 원 밖으로 나가기까지 반복한 횟수(33)', '계산에 걸린 밀리초'], a: 1,
      why: 'x²+y²가 4를 넘거나 max_iter에 닿을 때까지 돈 횟수 i를 돌려준다. 이 점은 33번째에 원 밖으로 나간다.' },
    { q: 'greet("Alice")를 JS에서 부를 때 경계에서 일어나는 일은 무엇인가?',
      o: ['문자열이 wasm 선형 메모리로 복사되고 결과도 다시 복사되어 나온다', 'JS와 wasm이 같은 문자열 객체를 그대로 공유한다', '숫자처럼 비용 없이 건너간다'], a: 0,
      why: 'wasm은 정수·실수만 안다. wasm-bindgen 글루가 "Alice"를 UTF-8 바이트로 복사해 넣고, 만든 String을 다시 JS 문자열로 복사한다.' },
    { q: 'import만 하고 await init()을 빼먹은 채 greet를 부르면 어떻게 되는가?',
      o: ['동기적으로 .wasm을 받아 와서 정상 동작한다', 'greet가 빈 문자열을 돌려준다', 'wasm 인스턴스가 아직 없어 호출이 실패한다'], a: 2,
      why: 'import로 들어온 것은 글루 JS뿐이다. init()이 .wasm을 내려받아 인스턴스를 만든 뒤에야 함수를 부를 수 있다.' },
    { q: '100만 픽셀을 그릴 때 wasm에 일을 맡기는 바른 모양은 무엇인가?',
      o: ['픽셀마다 mandel_one(i)를 불러 결과를 받는다', 'render_fractal(1000, 1000)을 한 번 불러 버퍼를 통째로 받는다', '픽셀 좌표를 문자열로 바꿔 넘긴다'], a: 1,
      why: '호출 100만 번은 경계 비용이 계산 이득을 삼킨다. 폭·높이만 넘기고 루프는 wasm 안에서 돌려 경계를 한 번만 넘는다.' },
    { q: 'wasm에서 문서 제목을 바꾸려면 어떻게 해야 하는가?',
      o: ['web_sys::window()에서 document()를 거쳐 set_title을 부른다', 'wasm 메모리에 DOM이 있으니 직접 쓴다', 'panic="abort"를 켠다'], a: 0,
      why: 'wasm은 DOM을 직접 만지지 못한다. web-sys가 JS API를 감싼 바인딩을 주고, 그것도 unwrap을 거쳐야 해서 DOM 일은 보통 JS에 맡긴다.' },
  ];

  const summary = [
    'wasm은 브라우저가 바로 실행하는 바이너리고, Rust는 GC를 싣지 않아 결과물이 작다.',
    '#[wasm_bindgen]이 경계를 잇는다. 숫자는 그대로 건너고 문자열은 복사된다.',
    'wasm-pack build로 pkg/를 만들고, 쓰기 전에 await init()으로 인스턴스를 띄운다.',
    '경계는 드물게 넘는다. 무거운 루프는 한 번에 넘기고 큰 버퍼로 받는다.',
  ];
  const review = [
    { q: 'wasm으로 옮긴 함수를 픽셀마다 불렀더니 순수 JS보다 느려졌다. 먼저 바꿀 것은?',
      o: ['루프를 wasm 안으로 옮겨 한 번만 호출한다', 'opt-level을 "z"로 바꾼다', 'console_error_panic_hook을 켠다'], a: 0,
      why: '호출마다 경계를 넘는 비용이 쌓였다. 폭·높이만 넘기고 버퍼를 통째로 받으면 경계는 한 번이다.' },
    { q: '배포한 wasm 앱에서 콘솔에 RuntimeError: unreachable 한 줄만 보인다. 무엇부터 해야 하나?',
      o: ['web-sys로 DOM 접근을 바꾼다', 'start 함수에서 console_error_panic_hook::set_once()를 건다', 'Uint8ClampedArray를 Uint8Array로 바꾼다'], a: 1,
      why: 'hook이 없으면 패닉이 unreachable로만 보인다. hook을 걸면 패닉 위치와 메시지가 console.error로 나온다.' },
    { q: 'count_up(n)처럼 반복마다 log를 부르는 함수가 느리다. 이유로 알맞은 것은?',
      o: ['u32 인자가 문자열로 바뀌어서', '.wasm 파일을 매번 다시 받아서', '반복마다 경계를 넘고 문자열도 매번 복사해서'], a: 2,
      why: 'log는 JS 함수라 부를 때마다 wasm에서 JS로 건너가고, format!으로 만든 문자열도 매번 복사된다.' },
  ];

  R.page({ title: 'Rust → wasm → 브라우저', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
