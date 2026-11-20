/* I-1-2 활성화 함수 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, dot, cells, zone,
    cross, check, axes, hbar, heat } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 데이터: activations.py v1 을 seed 42 로 그대로 돌린 값 (소수 둘째 자리) ----------
  const W1 = [[0.3, -1.04, 0.75], [0.94, -1.95, -1.3], [0.13, -0.32, -0.02], [-0.85, 0.88, 0.78]];
  const W2 = [[0.07, 1.13, 0.47, -0.86], [0.37, -0.96, 0.88, -0.05], [-0.18, -0.68, 1.22, -0.15], [-0.43, -0.35, 0.53, 0.37]];
  const W3 = [[0.41, 0.43, 2.14, -0.41], [-0.51, -0.81, 0.62, 1.13]];
  const X = [-0.11, -0.84, -0.82], A1 = [0.22, 2.61, 0.26, -1.28], A2 = [4.18, -2.12, -1.29, -1.34];
  const DEEP = [-1.41, -2.72], FOLD = [[-0.09, 0.81, 0.9], [-1.49, 2.74, 0.71]], BENT = [1.72, -2.14];
  // vanishing.py: np.random.seed(42) 후 uniform(0.01, 0.25, 10) — 곱 2.21e-10
  const REAL = [0.1, 0.24, 0.19, 0.15, 0.05, 0.05, 0.02, 0.22, 0.15, 0.18];

  // ---------- 함수 ----------
  const sg = (x) => 1 / (1 + Math.exp(-x));
  const F = {
    sigmoid: sg, dsig: (x) => sg(x) * (1 - sg(x)),
    relu: (x) => Math.max(0, x), drelu: (x) => (x > 0 ? 1 : 0),
    leaky: (x) => (x > 0 ? x : 0.1 * x), elu: (x) => (x > 0 ? x : Math.exp(x) - 1),
    gelu: (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))),
    lin: (x) => 0.8 * (1.5 * (0.5 * x)), bent: (x) => 0.8 * Math.max(0, 1.5 * (0.5 * x + 1)) - 1,
  };
  let cid = 0;
  // 함수 곡선을 u 만큼 (축 상자 밖은 잘라 냄)
  function fcurve(ax, f, u, col, o) { o = o || {}; if (u <= 0) return; const a = o.a ?? -6, b = o.b ?? 6, n = 140, m = Math.round(n * clamp(u));
    const id = 'dl12c' + (cid++), cp = el('clipPath', { id }); el('rect', { x: ax.x, y: ax.y - 4, width: ax.w, height: ax.h + 8 }, cp);
    const ps = []; for (let i = 0; i <= m; i++) { const x = a + (i / n) * (b - a); ps.push(`${ax.X(x)},${ax.Y(f(x))}`); }
    el('polyline', { points: ps.join(' '), fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 3.2, 'stroke-dasharray': o.dash, 'stroke-linejoin': 'round', opacity: o.op ?? 1, 'clip-path': `url(#${id})` }); }
  const fmtM = (v) => (v >= 0.001 ? v.toFixed(3) : v.toExponential(1));
  // 세로 벡터 칸
  function vcol(x, y, vals, o) { o = o || {}; const h = o.h || 40, w = o.w || 70;
    if (o.title) tx(x + w / 2, y - 12, o.title, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: o.tcol || INK, opacity: o.op ?? 1 });
    vals.forEach((v, i) => { const st = o.style ? o.style(i, v) : {}; card(x + w / 2, y + i * (h + 6) + h / 2, w, h, { rx: 6, text: typeof v === 'number' ? v.toFixed(2) : v, fs: 15, mono: true, stroke: st.stroke || o.col || INK, color: st.color, fill: st.fill, op: o.op ?? 1, s: o.s ? o.s(i) : 1 }); }); }
  const mtitle = (x, y, s, op, col) => tx(x, y, s, { 'font-size': 15, 'font-weight': 800, opacity: op, fill: col || INK });
  const fmt2 = (v) => v.toFixed(2);

  // =========================================================
  // 1. 왜 비선형인가 — 행렬곱 연쇄는 하나로 접힌다
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const M = [[W1, 'W1  (4, 3)', 50, 'x 3 → 4'], [W2, 'W2  (4, 4)', 290, '4 → 4'], [W3, 'W3  (2, 4)', 600, '4 → 2']];
      M.forEach(([m, nm, x, d], i) => { const a = 0.2 + i * 0.5; if (u < a) return; mtitle(x, 92, nm, fade(u, a)); heat(x, 110, m, 54, { fmt: fmt2, max: 2.2, fs: 14 }); sub(x + m[0].length * 27, 110 + m.length * 54 + 22, d, fade(u, a + 0.2)); });
      grow(220, 200, 280, 200, E(u, 0.7, 1.0), MUT); grow(515, 200, 590, 200, E(u, 1.2, 1.5), MUT);
      pill(800, 330, '활성화 함수 — 없음', BAD, pop(u, 1.8), { fs: 15 }); if (u > 2.1) cross(895, 330, 11, pop(u, 2.1));
      sub(400, 395, 'rng = default_rng(42) 로 뽑은 실제 값', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 1) { const C4 = [[X, 'x', 60, 0.2], [A1, 'W1 @ x', 290, 0.7], [A2, 'W2 @ ·', 520, 1.2], [DEEP, 'deep_out', 760, 1.7]];
      C4.forEach(([v, nm, x, a], i) => { if (u < a) return; vcol(x, 110, v, { title: nm, op: fade(u, a), col: i === 3 ? ACC : INK, tcol: i === 3 ? ACC : INK });
        if (i) { grow(C4[i - 1][2] + 82, 190, x - 14, 190, E(u, a - 0.3, a), MUT); dot([[C4[i - 1][2] + 82, 190], [x - 14, 190]], seg(u, a - 0.3, a), ACC, 6); } });
      ['W1', 'W2', 'W3'].forEach((s, i) => mono(lerp(C4[i][2] + 82, C4[i + 1][2] - 14, 0.5), 175, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, C4[i + 1][3] - 0.3) }));
      sub(480, 380, '층 사이에는 행렬곱뿐 — 구부릴 계기가 없다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const g = E(u, 0.3, 1.1);
      if (g < 0.97) [['W3', 0], ['W2', 1], ['W1', 2]].forEach(([s, i]) => card(lerp(110 + i * 120, 400, g), 150, 90, 54, { rx: 8, text: s, fs: 18, mono: true, op: 1 - g }));
      mtitle(330, 92, 'W_folded = W3 @ W2 @ W1   (2, 3)', fade(u, 1.0), ACC);
      if (u > 1.0) heat(330, 110, FOLD, 60, { fmt: fmt2, max: 2.8, fs: 14.5 });
      vcol(560, 110, X, { title: 'x', op: fade(u, 1.5), w: 64 }); grow(640, 160, 720, 160, E(u, 1.7, 2.0), MUT);
      vcol(740, 110, DEEP, { title: 'shallow_out', op: fade(u, 2.0), col: ACC, tcol: ACC });
      sub(480, 380, '세 층이 행렬 하나로 — 결합법칙으로 순서만 바꿨다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { vcol(80, 110, DEEP, { title: 'deep_out (3층)', col: ACC, tcol: ACC }); vcol(300, 110, DEEP, { title: 'shallow_out (1층)', col: ACC, tcol: ACC, op: fade(u, 0.2) });
      tx(232, 160, '=', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      card(225, 260, 300, 50, { rx: 12, text: 'np.allclose → True', fs: 17, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.8) });
      const ax = axes(560, 90, 330, 220, { x: [-6, 6], y: [-3, 3], xt: [-4, 0, 4], yt: [-2, 0, 2], xl: 'x', yl: '출력' });
      fcurve(ax, F.lin, E(u, 1.0, 1.8), MUT); tx(ax.X(5.5), ax.Y(2.6), '3층 = 1층 = 직선', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      mono(480, 395, 'W₁₀₀ ⋯ W₂ W₁ x = W x   — 100층이어도 1층', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.1) }); return; }
    const ax = k === 4 ? axes(640, 90, 270, 220, { x: [-6, 6], y: [-3, 3], xt: [-4, 0, 4], yt: [-2, 0, 2], xl: 'x' }) : axes(90, 70, 480, 270, { x: [-6, 6], y: [-3, 3], xt: [-4, -2, 0, 2, 4], yt: [-2, 0, 2], xl: 'x', yl: '층을 쌓은 결과 함수', grid: true });
    fcurve(ax, F.lin, 1, OFF, { sw: 2.6 });
    if (k === 4) { vcol(40, 110, A2, { title: 'W2 @ W1 @ x', w: 76 });
      card(170, 190, 70, 44, { rx: 8, text: 'relu', fs: 16, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.3) });
      vcol(250, 110, A2.map((v, i) => (u > 0.8 + i * 0.15 ? Math.max(0, v) : v)), { title: 'relu(·)', w: 76, op: fade(u, 0.5), style: (i, v) => (v === 0 ? { stroke: OFF, color: OFF } : { stroke: ACC, color: ACC }) });
      grow(335, 190, 400, 190, E(u, 1.4, 1.7), MUT); mono(368, 178, 'W3', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) });
      vcol(410, 110, BENT, { title: 'bent_out', w: 76, op: fade(u, 1.7), col: ACC, tcol: ACC });
      vcol(520, 110, DEEP, { title: 'Wx', w: 76, op: fade(u, 1.8), col: MUT, tcol: MUT }); tx(503, 160, '≠', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) });
      pill(470, 300, 'allclose → False', GOOD, pop(u, 2.0), { mono: true, fs: 15 });
      fcurve(ax, F.bent, E(u, 1.6, 2.6), ACC); tx(ax.X(-5.6), ax.Y(-2.6), '꺾인 곡선', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) });
      sub(470, 390, 'ReLU 하나가 접힘을 깬다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    fcurve(ax, F.bent, E(u, 0.2, 1.2), ACC);
    tx(ax.X(-5.8), ax.Y(2.5), '회색: 선형만 3층 — 직선', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
    tx(ax.X(1.2), ax.Y(-1.5), 'ReLU 1개 — 꺾임', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
    card(770, 140, 300, 60, { rx: 12, text: '활성화 = 직선을\n구부리는 힘', fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.3) });
    card(770, 240, 300, 50, { rx: 12, text: '깊이는 비선형이 있을 때만 의미', fs: 15, s: pop(u, 1.7) });
    pill(770, 320, '다음 질문: 어떤 비선형?', WARN, pop(u, 2.2), { fs: 15 }); }

  // =========================================================
  // 2. sigmoid — 확률의 매력, 포화의 저주
  // =========================================================
  function sigAx(x, y, w, h) { return axes(x, y, w, h, { x: [-6, 6], y: [-0.2, 1.2], xt: [-6, -4, -2, 0, 2, 4, 6], yt: [0, 0.25, 0.5, 1], grid: true, xl: 'x' }); }
  function s2(t, c) { const { k, u } = c; const big = k < 5, ax = big ? sigAx(70, 50, 500, 290) : sigAx(60, 60, 360, 250);
    if (k >= 3) { const op = k === 3 ? fade(u, 0.2, 0.6) : 1; [[-6, -4], [4, 6]].forEach(([a, b]) => { el('rect', { x: ax.X(a), y: ax.y, width: ax.X(b) - ax.X(a), height: ax.h, fill: C.WARNBG, opacity: op }); tx((ax.X(a) + ax.X(b)) / 2, ax.y + 20, '포화', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: op }); }); }
    fcurve(ax, F.sigmoid, k === 0 ? E(u, 0.2, 1.4) : 1, INFO);
    if (k >= 1) fcurve(ax, F.dsig, k === 1 ? E(u, 0.3, 1.5) : 1, BAD, { dash: '7 5', sw: 2.6 });
    if (k === 0) { el('rect', { x: ax.x, y: ax.Y(1), width: ax.w, height: ax.Y(0) - ax.Y(1), fill: C.INFOBG, opacity: 0.5 * fade(u, 1.2) });
      pill(760, 110, 'σ(x) = 1 / (1 + e⁻ˣ)', INFO, pop(u, 0.4), { fs: 16 });
      card(760, 200, 280, 60, { rx: 12, text: '출력 범위 (0, 1)\n→ 확률처럼 읽힌다', fs: 15, stroke: INFO, color: INFO, s: pop(u, 1.4) });
      sub(760, 290, '뉴런의 "발화 확률"', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { tx(ax.X(1.2), ax.Y(0.3), 'σ′(x)', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
      pill(760, 110, 's = sigmoid(x)', INK, pop(u, 0.3), { mono: true, fs: 15 }); pill(760, 165, 'return s * (1 - s)', BAD, pop(u, 0.8), { mono: true, fs: 15 });
      sub(760, 240, '순전파의 σ 값을 그대로 재활용', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(760, 270, '→ 역전파가 싸다', fade(u, 1.8), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 2) { for (let i = 0; i <= 12; i++) { const x = -6 + i, g = F.dsig(x), a = 0.2 + i * 0.12; if (u < a) continue; const s = E(u, a, a + 0.3);
        el('rect', { x: ax.X(x) - 7, y: ax.Y(g * s), width: 14, height: ax.Y(0) - ax.Y(g * s), fill: BAD, opacity: 0.75 }); }
      mono(610, 90, 'x = linspace(-6, 6, 13)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      [[-6, 0.0025], [-2, 0.105], [0, 0.25], [2, 0.105], [6, 0.0025]].forEach(([x, g], i) => { const y = 135 + i * 36, a = 0.6 + i * 0.3;
        mono(610, y + 5, `x=${x >= 0 ? '+' : ''}${x.toFixed(1)}`, { 'font-size': 14.5, fill: MUT, opacity: fade(u, a) });
        hbar(700, y - 9, 140, g, 0.25, { h: 18, col: BAD, u: E(u, a, a + 0.4), text: g.toFixed(4) }); });
      return; }
    if (k === 3) { [-6, 6].forEach((x) => { el('circle', { cx: ax.X(x), cy: ax.Y(F.dsig(x)), r: 7, fill: BAD, opacity: fade(u, 0.6) }); });
      mono(ax.X(-5.6), ax.Y(0.12), '0.0025', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
      mono(ax.X(5.6), ax.Y(0.12), '0.0025', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.8) });
      card(760, 130, 300, 60, { rx: 12, text: '|x| 가 크면 곡선이 눕는다\n= 기울기 ≈ 0', fs: 15, stroke: WARN, color: WARN, s: pop(u, 1.0) });
      sub(760, 230, '입력이 바뀌어도 출력이 안 바뀜', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(760, 260, '→ 학습 신호가 통과 못 한다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 4) { const s = pop(u, 0.3); el('circle', { cx: ax.X(0), cy: ax.Y(0.25), r: 9 * s, fill: BAD }); el('line', { x1: ax.x, y1: ax.Y(0.25), x2: ax.X(0) - 10, y2: ax.Y(0.25), stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '4 4', opacity: fade(u, 0.6) });
      mono(ax.X(0.5), ax.Y(0.25) - 14, 'max σ′ = 0.25', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) });
      mono(760, 140, '0.25', { 'font-size': 48, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.0) });
      sub(760, 185, '가장 좋은 자리(x=0)에서도', fade(u, 1.3), { 'font-size': 15, fill: INK });
      sub(760, 240, '층 하나 지날 때마다 최소 4배 감쇠', fade(u, 1.8), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    // k5 성적표
    tx(ax.X(0.3), ax.Y(0.22) - 14, '0.25', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, class: 'mono' });
    const pros = ['확률로 해석 (0~1)', '전 구간 미분 가능', 'σ(1−σ) 재활용'], cons = ['|x|>4 포화 → 기울기≈0', '미분 최대 0.25', '출력이 0 중심 아님', 'exp 연산 비용'];
    tx(470, 82, '👍 매력', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.2) }); tx(710, 82, '👎 저주', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
    pros.forEach((s, i) => card(560, 120 + i * 52, 210, 42, { rx: 8, text: s, fs: 14, stroke: GOOD, color: GOOD, fill: C.GOODBG, s: pop(u, 0.3 + i * 0.2) }));
    cons.forEach((s, i) => card(805, 120 + i * 52, 230, 42, { rx: 8, text: s, fs: 14, stroke: BAD, color: BAD, fill: C.BADBG, s: pop(u, 1.1 + i * 0.2) }));
    sub(690, 375, '층을 쌓으면 이 단점이 곱셈으로 증폭된다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 3. 기울기 소실 — 층마다 × 0.25
  // =========================================================
  const LX = (l) => 80 + (l - 1) * 86;   // layer l 의 가로 위치
  function chain(o) { o = o || {}; for (let l = 1; l <= 10; l++) { const x = LX(l), dim = o.dim ? o.dim(l) : 0;
      [0, 1, 2].forEach((j) => el('circle', { cx: x, cy: 70 + j * 22, r: 8, fill: dim ? SOFT : l === 10 ? ACC : ACCBG, stroke: dim ? OFF : INK, 'stroke-width': 1.6 }));
      if (l < 10) el('line', { x1: x + 12, y1: 92, x2: LX(l + 1) - 12, y2: 92, stroke: OFF, 'stroke-width': 1.6 });
      mono(x, 140, l === 10 ? 'L10' : `L${l}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: l === 10 ? ACC : MUT }); }
    tx(LX(1), 40, '입력', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); tx(LX(10), 40, '출력', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); }
  // 신호 막대 (선형 눈금! 1.0 = 180px)
  function bars(n, u0, u, o) { o = o || {}; const base = 360, H = 180, f = o.f || ((l) => Math.pow(0.25, 10 - l));
    el('line', { x1: 40, y1: base, x2: 920, y2: base, stroke: MUT, 'stroke-width': 1.5 });
    for (let i = 0; i < n; i++) { const l = 10 - i, a = u0 + i * (o.step ?? 0.22); if (u < a) break; const v = f(l), g = E(u, a, a + 0.25), h = Math.max(1.5, H * v * g);
      el('rect', { x: LX(l) - 22, y: base - h, width: 44, height: h, rx: 3, fill: o.col ? o.col(l) : v < 0.01 ? BAD : ACC, opacity: 0.85 });
      mono(LX(l), base - h - 8, fmtM(v), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: v < 0.01 ? BAD : INK, opacity: fade(u, a + 0.1) }); } }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { chain(); bars(k === 0 ? 2 : 1, 0.6, u);
      if (k === 0) { pill(480, 210, 'BEST_SIGMOID_GRAD = 0.25', BAD, pop(u, 0.2), { mono: true, fs: 15 }); sub(480, 248, '모든 뉴런이 x=0 (σ′ 최대) 에 있다고 가정 — 최상의 경우', fade(u, 0.9), { 'font-size': 15, fill: INK }); }
      if (k === 1) { const s = pop(u, 0.3); el('circle', { cx: LX(10), cy: 92, r: 22 * s, fill: 'none', stroke: BAD, 'stroke-width': 3 }); pill(LX(10) - 60, 205, 'signal = 1.0', BAD, pop(u, 0.6), { mono: true, fs: 15 });
        sub(400, 220, '역전파는 출력층의 오차 신호에서 출발한다', fade(u, 1.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      return; }
    if (k === 2) { chain(); const p = clamp((u - 0.2) / 2.2) * 5; // L10 → L5
      const at = 10 - p;
      el('circle', { cx: LX(at), cy: 92, r: 6 + 12 * Math.pow(0.25, p / 1.4), fill: BAD, opacity: 0.85 });
      grow(LX(10), 170, LX(Math.max(5, at)), 170, clamp(p / 5) > 0 ? 1 : 0, BAD);
      for (let i = 1; i <= Math.floor(p); i++) mono(lerp(LX(11 - i), LX(10 - i), 0.5), 162, '×0.25', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD });
      bars(1 + Math.floor(p), 0, 9, {}); mono(480, 220, 'signal *= 0.25', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.1) }); return; }
    if (k === 3 || k === 6) { chain({ dim: k === 6 ? (l) => (l <= 4 ? fade(u, 0.3) : 0) : null }); bars(10, k === 3 ? 0.1 : 0, k === 3 ? u : 9, { step: 0.18 });
      if (k === 3) { grow(LX(2), 232, LX(1) + 6, 335, E(u, 2.0, 2.4), BAD);
        pill(LX(3), 215, 'layer 1 = 0.000003815', BAD, pop(u, 2.1), { mono: true, fs: 15 }); return; }
      zone(30, 160, 360, 70, null, { fill: C.BADBG, op: fade(u, 0.4) }); tx(50, 190, '앞층: 초기값 그대로 멈춤', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.5) }); tx(50, 215, 'train loss 조차 안 떨어진다', { 'font-size': 14.5, fill: INK, opacity: fade(u, 0.8) });
      card(590, 205, 380, 60, { rx: 12, text: '원인 = 0.25 를 열 번 곱한 것\n해법 후보: 미분이 1 인 활성화', fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.5) }); return; }
    if (k === 4) { chain(); bars(10, 0, 9, { step: 0 });
      mono(480, 215, '0.25¹⁰ = 9.5e-07', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.3) });
      sub(480, 250, '"최상의 경우" 라는 조건을 달고도 백만분의 1', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5: 현실 — 층마다 0.01~0.25 (seed 42 로 뽑은 실제 값)
    chain(); tx(40, 178, '층별 σ′ (0.01~0.25 에서 뽑음)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    REAL.forEach((v, i) => { const l = 10 - i, a = 0.2 + i * 0.15; mono(LX(l), 205, v.toFixed(2), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: v < 0.1 ? BAD : WARN, opacity: fade(u, a) }); });
    el('line', { x1: 40, y1: 230, x2: 920, y2: 230, stroke: GRID, 'stroke-width': 1.5 });
    mono(480, 290, 'np.prod(...) = 2.21e-10', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) });
    sub(480, 325, '0.25 는 상한이지 평균이 아니다 — 최상(9.5e-07)보다 수천 배 더 작다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    sub(480, 395, '(np.random.seed(42) 로 돌린 값)', fade(u, 2.3), { 'font-size': 13.5 }); }

  // =========================================================
  // 4. ReLU 가족 — 기울기 1
  // =========================================================
  function reluAx(x, y, w, h) { return axes(x, y, w, h, { x: [-4, 4], y: [-1.5, 3.5], xt: [-4, -2, 0, 2, 4], yt: [-1, 0, 1, 2, 3], grid: true, xl: 'x' }); }
  function decayRows(x0, y0, u, o) { o = o || {}; const rows = [['sigmoid × 0.25', BAD, 0.25], ['ReLU × 1', ACC, 1]];
    rows.forEach(([nm, col, f], r) => { if (r && !o.both) return; const y = y0 + r * 150, a = r ? 0.6 : 0.1; tx(x0, y - 10, nm, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, a) });
      for (let l = 10; l >= 1; l--) { const v = Math.pow(f, 10 - l), h = Math.max(1.5, 80 * v), xx = x0 + (l - 1) * 46, g = E(u, a + (10 - l) * 0.08, a + (10 - l) * 0.08 + 0.3);
        el('rect', { x: xx, y: y + 95 - h * g, width: 34, height: h * g, rx: 3, fill: col, opacity: 0.85 }); } });
    mono(x0 + 9 * 46 + 17, y0 + 150 + 118, 'L10 (출력)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(x0 + 17, y0 + 150 + 118, 'L1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
  // 결정적 의사난수 (그림용 예시 배치)
  const cellV = (r, c) => { let h = (r * 97 + c * 31 + 7) * 2654435761 % 4294967296; h = (h ^ (h >>> 13)) * 1274126177 % 4294967296; return ((h >>> 0) % 1000) / 1000; };
  const hash = (r, c) => Math.abs(Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1;
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) { const ax = reluAx(70, 60, 470, 290);
      fcurve(ax, F.relu, k === 0 ? E(u, 0.2, 1.3) : 1, ACC, { a: -4, b: 4 });
      if (k >= 1) fcurve(ax, F.drelu, k === 1 ? E(u, 0.3, 1.4) : 1, BAD, { a: -4, b: 4, dash: '7 5', sw: 2.6 });
      if (k >= 2) fcurve(ax, F.leaky, k === 2 ? E(u, 0.3, 1.3) : 1, GOOD, { a: -4, b: 4, sw: 2.6 });
      if (k === 3) fcurve(ax, F.elu, E(u, 0.3, 1.3), WARN, { a: -4, b: 4, sw: 2.6 });
      if (k === 0) { pill(760, 110, 'np.maximum(0.0, x)', ACC, pop(u, 0.4), { mono: true, fs: 16 }); card(760, 190, 220, 50, { rx: 12, text: 'exp 연산', fs: 15, stroke: OFF, color: OFF, s: pop(u, 1.0) }); if (u > 1.3) cross(870, 168, 11, pop(u, 1.3));
        sub(760, 270, '음수 → 0, 양수 → 그대로', fade(u, 1.7), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(760, 300, '부호 비교 하나로 끝', fade(u, 2.0), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
      if (k === 1) { tx(ax.X(2.2), ax.Y(1) - 12, 'ReLU′ = 1', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
        mono(760, 120, '1 × 1 × ⋯ × 1 = 1', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
        mono(760, 190, '층당 감쇠', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
        mono(760, 225, `${tween(0.25, 1, seg(u, 1.4, 2.4) * 3).toFixed(2)}`, { 'font-size': 32, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.4) });
        sub(760, 260, '0.25 → 1 : 천장이 사라졌다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      if (k === 2) { tx(ax.X(-3.9), ax.Y(-0.6), 'Leaky', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
        pill(760, 110, 'np.where(x > 0, x, a * x)', GOOD, pop(u, 0.4), { mono: true, fs: 15 });
        sub(760, 180, '음수 쪽 기울기 0 → a', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
        sub(760, 210, '밀려난 뉴런도 되살아날 수 있다', fade(u, 1.5), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
        sub(760, 270, '(코드 기본 a = 0.01 · 그림은 0.1 로 과장)', fade(u, 2.0), { 'font-size': 13.5 }); return; }
      el('line', { x1: ax.x, y1: ax.Y(-1), x2: ax.x + ax.w, y2: ax.Y(-1), stroke: WARN, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: fade(u, 1.0) });
      tx(ax.X(-3.9), ax.Y(-1) + 22, 'ELU → −a', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
      pill(760, 110, 'a * (np.exp(x) - 1)', WARN, pop(u, 0.4), { mono: true, fs: 15 });
      sub(760, 180, '음수에서 −a 로 부드럽게 수렴', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(760, 210, '출력 평균을 0 근처로', fade(u, 1.5), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
      sub(760, 280, '셋 다 양수 구간은 같다 — 음수 처리만 다르다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 4) { decayRows(60, 70, u, { both: true });
      mono(720, 120, 'sigmoid 10층', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); mono(720, 150, '9.5e-07  소멸', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) });
      mono(720, 240, 'ReLU 10층', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); mono(720, 270, '1.0  생존', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      sub(480, 400, '(ReLU 는 양수 경로 기준 — 꺼진 뉴런을 지나는 경로는 0)', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    // k5, k6: 활성화 히트맵
    const rows = k === 5 ? 3 : 4, cs = 52, x0 = 80, y0 = 90, DEAD = [2, 7, 10];
    const vals = []; for (let r = 0; r < rows; r++) for (let cc = 0; cc < 12; cc++) vals.push(cellV(r, cc));
    const thr = [...vals].sort((a, b) => a - b)[Math.floor(vals.length / 2)];
    let on = 0; const colAlive = Array(12).fill(false);
    for (let r = 0; r < rows; r++) for (let cc = 0; cc < 12; cc++) { const i = r * 12 + cc, v = vals[i], alive = k === 5 ? v >= thr : !DEAD.includes(cc) && v >= 0.4; if (alive) { on++; colAlive[cc] = true; }
      const s = k === 5 ? fade(u, 0.2 + i * 0.03, 0.2) : 1; el('rect', { x: x0 + cc * cs, y: y0 + r * cs, width: cs - 4, height: cs - 4, rx: 5, fill: alive ? ACC : SOFT, stroke: alive ? 'none' : OFF, opacity: (alive ? 0.35 + 0.65 * v : 1) * s }); }
    tx(x0, y0 - 16, k === 5 ? 'ReLU 통과 후 은닉 뉴런 12개 (행 = 입력)' : '배치 4개 × 뉴런 12개', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    if (k === 5) { mono(x0, y0 + rows * cs + 40, `켜진 칸 ${on} / ${rows * 12}`, { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      sub(560, y0 + rows * cs + 90, '회색 = 이번 입력에서 꺼진 뉴런 (죽은 게 아니다) · 코드 실행 결과는 ~50%', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    const dead = colAlive.map((a) => !a), nd = dead.filter(Boolean).length;
    dead.forEach((d, cc) => { if (!d) return; el('rect', { x: x0 + cc * cs - 3, y: y0 - 4, width: cs + 2, height: rows * cs + 4, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 0.6) }); cross(x0 + cc * cs + cs / 2 - 2, y0 + rows * cs + 22, 9, pop(u, 0.8)); });
    mono(x0, y0 + rows * cs + 70, `배치 내내 0 인 뉴런 ${nd} / 12`, { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
    sub(560, y0 + rows * cs + 105, '이 비율이 수십 % 면 → 학습률 ↓ 또는 Leaky/ELU 로 교체 (그림은 예시)', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 5. 현대 지도 — 은닉층과 출력층
  // =========================================================
  function block(cx, cy, w, h, s, col, sc) { card(cx, cy, w, h, { rx: 8, text: s, fs: 14, mono: true, stroke: col || INK, color: col || INK, fill: col === ACC ? ACCBG : PANEL, s: sc }); }
  function mini(cx, cy, f, col, a, b, sc) { const g = R.G(cx, cy, sc ?? 1); el('rect', { x: -26, y: -20, width: 52, height: 40, rx: 6, fill: PANEL, stroke: col, 'stroke-width': 2 }, g);
    const ps = []; for (let i = 0; i <= 30; i++) { const x = a + (i / 30) * (b - a); ps.push(`${-20 + i * 40 / 30},${8 - f(x) * 10}`); } el('polyline', { points: ps.join(' '), fill: 'none', stroke: col, 'stroke-width': 2.5 }, g); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const L = [['Linear(64, 128)', 0.2], ['ReLU', 0.5], ['Linear(128, 128)', 0.8], ['ReLU', 1.1], ['Linear(128, 1)', 1.4]];
      L.forEach(([s, a], i) => { const x = 110 + i * 180, relu = s === 'ReLU'; if (relu) { mini(x, 170, F.relu, ACC, -2, 2, pop(u, a)); tx(x, 215, 'ReLU', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, a) }); }
        else block(x, 170, 160, 54, s, INK, pop(u, a)); if (i) grow(x - 180 + (L[i - 1][0] === 'ReLU' ? 30 : 82), 170, x - (relu ? 30 : 82), 170, E(u, a - 0.1, a + 0.1), MUT); });
      card(830, 290, 220, 56, { rx: 12, text: '출력 활성화 없음\n= linear (회귀)', fs: 14.5, stroke: WARN, color: WARN, s: pop(u, 1.8) }); grow(830, 200, 830, 258, E(u, 1.7, 1.9), WARN);
      sub(330, 300, '은닉층 기본값 = ReLU', fade(u, 1.0), { 'font-size': 16, fill: INK, 'font-weight': 800 }); return; }
    if (k <= 2) { const ax = reluAx(70, 60, 440, 290);
      fcurve(ax, F.relu, 1, OFF, { a: -4, b: 4, sw: 2.4 }); tx(ax.X(2.4), ax.Y(3.1), 'ReLU', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      if (k === 1) { fcurve(ax, F.gelu, E(u, 0.3, 1.4), ACC); tx(ax.X(-3.8), ax.Y(0.4), 'GELU', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
        el('circle', { cx: ax.X(-0.75), cy: ax.Y(-0.17), r: 34, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.5) });
        block(730, 110, 220, 46, 'Linear(768, 3072)', INK, pop(u, 0.5)); block(730, 175, 220, 46, 'GELU', ACC, pop(u, 0.8)); block(730, 240, 220, 46, 'Linear(3072, 768)', INK, pop(u, 1.1));
        sub(730, 300, 'BERT · GPT 의 FFN 블록', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(730, 330, '0 근처가 완만 — 미세한 성능 이득', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      fcurve(ax, F.leaky, E(u, 0.3, 1.4), GOOD); tx(ax.X(-3.8), ax.Y(-0.7), 'LeakyReLU', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
      pill(730, 120, 'nn.LeakyReLU(negative_slope=0.01)', GOOD, pop(u, 0.4), { mono: true, fs: 14 });
      sub(730, 190, '"출력이 항상 0" 인 뉴런이 많이 보이면', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(730, 220, '그때 교체한다 — 증상 → 처방 순서', fade(u, 1.5), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
      sub(730, 280, '(그림의 음수 기울기는 0.1 로 과장)', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    if (k === 3) { const ax = axes(520, 70, 380, 260, { x: [-6, 6], y: [-0.1, 1.1], xt: [-4, 0, 4], yt: [0, 0.5, 1], grid: true, xl: 'logit' });
      fcurve(ax, F.sigmoid, E(u, 0.6, 1.6), INFO);
      block(120, 200, 190, 54, 'Linear(128, 1)', INK, pop(u, 0.2)); grow(220, 200, 290, 200, E(u, 0.4, 0.6), MUT); block(370, 200, 140, 54, 'sigmoid', INFO, pop(u, 0.6));
      const lg = 2.0 * E(u, 1.4, 2.2); el('circle', { cx: ax.X(lg), cy: ax.Y(F.sigmoid(lg)), r: 8, fill: INFO, opacity: fade(u, 1.4) });
      sub(300, 290, '확률 1개 (0~1) — 스팸일 확률', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(300, 325, '은닉층에선 퇴출, 출력층에선 현역', fade(u, 2.1), { 'font-size': 15, fill: INFO, 'font-weight': 700 }); return; }
    if (k === 4) { // 예시 logit 10개 → softmax (합 1)
      const lg = [1.2, -0.4, 0.3, 2.1, -1.0, 0.0, 0.8, -0.6, 1.5, -0.2], ex = lg.map(Math.exp), Z = ex.reduce((a, b) => a + b, 0), p = ex.map((v) => v / Z);
      tx(60, 70, 'logits (예시)', { 'font-size': 15, 'font-weight': 800, fill: MUT }); tx(520, 70, 'softmax → 확률', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      lg.forEach((v, i) => { const x = 60 + i * 38, h = v * 45 * E(u, 0.1, 0.6); el('rect', { x, y: h > 0 ? 220 - h : 220, width: 28, height: Math.abs(h), rx: 3, fill: v >= 0 ? MUT : OFF }); });
      el('line', { x1: 52, y1: 220, x2: 440, y2: 220, stroke: MUT, 'stroke-width': 1.5 });
      grow(450, 200, 505, 200, E(u, 0.7, 0.9), ACC);
      p.forEach((v, i) => { const x = 520 + i * 38, h = v * 400 * E(u, 1.0, 1.6); el('rect', { x, y: 300 - h, width: 28, height: h, rx: 3, fill: ACC, opacity: 0.85 }); });
      el('line', { x1: 512, y1: 300, x2: 900, y2: 300, stroke: MUT, 'stroke-width': 1.5 });
      mono(700, 340, 'dist.sum(dim=-1) → tensor([1., 1., 1., 1.])', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) });
      sub(250, 290, '클래스 10개의 점수', fade(u, 0.6), { 'font-size': 14.5 }); sub(480, 395, '다중 분류 → 합이 1 인 확률 분포', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { const row = (y, parts, ok, a) => { parts.forEach(([s, col], i) => { block(130 + i * 230, y, 190, 50, s, col, pop(u, a + i * 0.2)); if (i) grow(130 + (i - 1) * 230 + 96, y, 130 + i * 230 - 96, y, E(u, a + i * 0.2 - 0.1, a + i * 0.2), MUT); });
        if (u > a + 0.9) (ok ? check : cross)(130 + parts.length * 230 - 80, y, 14, pop(u, a + 0.9)); };
      row(130, [['모델 → logit', INK], ['softmax', BAD], ['CrossEntropyLoss', INK]], false, 0.2);
      tx(130 + 2 * 230, 175, '(내부에서 또 softmax)', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      row(270, [['모델 → logit', INK], ['CrossEntropyLoss', ACC]], true, 1.2);
      sub(480, 380, '손실 함수가 이미 하는 일을 모델에서 또 하지 않는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k6: 지도 + 다음 장
    zone(40, 40, 420, 300, '은닉층 — 기본값', { op: 1 }); zone(500, 40, 420, 300, '출력층 — 문제 유형이 결정', { op: 1, fill: C.INFOBG });
    [['MLP / CNN', 'ReLU', F.relu, ACC, -2, 2], ['dying ReLU 관찰', 'Leaky / ELU', F.leaky, GOOD, -2, 2], ['Transformer', 'GELU', F.gelu, ACC, -2, 2]].forEach(([w, p, f, col, a, b], i) => { const y = 100 + i * 80, s = pop(u, 0.2 + i * 0.2);
      mini(100, y, f, col, a, b, s); tx(145, y - 2, p, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s }); tx(145, y + 20, w, { 'font-size': 14, fill: MUT, opacity: s }); });
    [['회귀', 'linear', (x) => x / 2, WARN, -2, 2], ['이진 분류', 'sigmoid', (x) => sg(x * 2) * 2 - 1, INFO, -2, 2], ['다중 분류', 'softmax', (x) => sg(x * 2) * 2 - 1, ACC, -2, 2]].forEach(([w, p, f, col, a, b], i) => { const y = 100 + i * 80, s = pop(u, 0.9 + i * 0.2);
      mini(560, y, f, col, a, b, s); tx(605, y - 2, p, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s }); tx(605, y + 20, w, { 'font-size': 14, fill: MUT, opacity: s }); });
    grow(880, 380, 80, 380, E(u, 1.6, 2.4), BAD); tx(480, 370, '다음 장: 이 미분들이 뒤로 흐르는 길 — 역전파', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '활성화 함수 없이 행렬곱 3층을 쌓으면 어떻게 되나?',
      o: ['W3·W2·W1 행렬 하나로 접혀 1층 선형 모델과 같아진다', '층 수만큼 표현력이 커진다', '층마다 곡선이 한 번씩 꺾인다'], a: 0,
      why: '행렬곱은 결합법칙이 성립해 3층 결과와 미리 곱한 1층 결과가 수치까지 일치한다(True). 100층이어도 직선 하나다.' },
    { q: 'sigmoid 미분 σ′ = σ(1−σ) 의 최댓값은 얼마이고 어디서 나오나?',
      o: ['x=0 에서 1.0', 'x=0 에서 0.25', 'x=±6 에서 0.25'], a: 1,
      why: 'σ′ 는 x=0 에서 0.25가 최대이고, x=±6 에서는 0.0025로 바닥에 붙는다(포화). 가장 좋은 자리에서도 신호가 4분의 1로 준다.' },
    { q: '모든 뉴런이 x=0에 있는 최상의 경우에도, sigmoid 10층을 거슬러 간 기울기는 얼마나 되나?',
      o: ['약 백만분의 1 (0.25¹⁰ ≈ 9.5e-07)', '약 0.25 — 층 수와 무관하다', '약 2.5 — 층마다 더해진다'], a: 0,
      why: '역전파는 층마다 활성화 미분을 곱한다(연쇄 법칙). 0.25를 열 번 곱하면 9.5e-07이고, 포화 뉴런이 섞이면 2.21e-10까지 떨어진다.' },
    { q: 'ReLU가 기울기 소실을 해소하는 이유는?',
      o: ['출력이 0~1 확률로 눌리기 때문', '양수 구간 미분이 정확히 1이라 곱해도 줄지 않기 때문', '음수 입력도 그대로 통과시키기 때문'], a: 1,
      why: '1을 몇 번 곱해도 1이라, 10층 역전파에서 sigmoid는 9.5e-07로 소멸하지만 ReLU 양수 경로는 1.0 그대로다. 대가는 음수 쪽 기울기 0에서 오는 dying ReLU다.' },
    { q: '다음 중 출력층 활성화 선택이 맞는 것은?',
      o: ['회귀 — sigmoid', '다중 분류 — ReLU', '이진 분류 — sigmoid'], a: 2,
      why: '출력층은 문제 유형이 정한다: 회귀는 linear, 이진 분류는 sigmoid, 다중 분류는 softmax. 출력층은 한 번뿐이라 sigmoid의 포화가 곱해지지 않는다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '활성화 함수가 없으면 행렬곱이 하나로 접혀서, 백 층을 쌓아도 직선 하나와 같다.',
    'sigmoid는 미분이 최대 0.25라, 10층을 거슬러 가면 기울기가 백만분의 1로 준다.',
    'ReLU는 양수 구간 미분이 1이라 기울기가 줄지 않는다. 음수 쪽에서 죽는 뉴런은 Leaky ReLU로 막는다.',
    '은닉층은 ReLU로 시작하고, 출력층 함수는 회귀인지 분류인지에 따라 정한다.',
  ];
  const review = [
    { q: '10층 sigmoid 망을 학습했더니 출력 근처 층만 바뀌고 입력 근처 층은 초기값 그대로다. 먼저 바꿀 것은?',
      o: ['출력층을 softmax로 바꾼다', '은닉층 활성화를 ReLU로 바꾼다', '층을 20개로 늘린다'], a: 1,
      why: '층마다 sigmoid 미분이 곱해지며 앞층으로 갈 기울기가 사라진 것이다. ReLU는 양수 구간 미분이 1이라 신호가 줄지 않고, 층을 늘리면 더 나빠진다.' },
    { q: 'ReLU 망을 학습하는데 일부 뉴런이 어떤 입력에서도 늘 0만 낸다. 가장 맞는 대응은?',
      o: ['Leaky ReLU로 바꾼다', 'sigmoid로 다시 되돌린다', '활성화 함수를 빼고 선형으로 쌓는다'], a: 0,
      why: '큰 음수 쪽으로 밀린 ReLU 뉴런은 기울기가 0이라 다시 살아나지 못한다. 음수 쪽에 작은 기울기를 남기면 회복할 길이 생기고, 선형으로 쌓으면 층이 하나로 접힌다.' },
    { q: '집값을 예측하는 회귀 모델의 출력층에 sigmoid를 붙였다. 생기는 문제는?',
      o: ['기울기가 10층 분량만큼 소실된다', '출력이 음수로만 나온다', '예측값이 0~1 사이에 갇힌다'], a: 2,
      why: 'sigmoid는 출력을 0~1로 누른다. 회귀는 값 범위를 막으면 안 되므로 출력층에 linear를 쓴다.' },
  ];

  RA.page({ title: '활성화 함수 — 직선을 구부리는 힘', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
