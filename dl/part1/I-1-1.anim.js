/* I-1-1 퍼셉트론에서 MLP 까지 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, dot, cells, zone,
    cross, check, axes, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 공통 부품 ----------
  const PTS = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const AND = [0, 0, 0, 1], OR = [0, 1, 1, 1], XOR = [0, 1, 1, 0];
  let cid = 0;
  function clipOf(ax) { const id = 'dl11c' + (cid++), cp = el('clipPath', { id }); el('rect', { x: ax.x, y: ax.y, width: ax.w, height: ax.h }, cp); return `url(#${id})`; }
  // 2D 입력 평면 (-0.35 ~ 1.35)
  function plane(x, y, s, o) { o = o || {};
    el('rect', { x, y, width: s, height: s, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    const ax = axes(x, y, s, s, { x: [-0.35, 1.35], y: [-0.35, 1.35], xt: [0, 1], yt: [0, 1], xl: o.xl ?? 'x₁', yl: o.yl ?? 'x₂' });
    [0, 1].forEach((v) => { el('line', { x1: ax.X(v), y1: y, x2: ax.X(v), y2: y + s, stroke: GRID, 'stroke-dasharray': '3 4' }); el('line', { x1: x, y1: ax.Y(v), x2: x + s, y2: ax.Y(v), stroke: GRID, 'stroke-dasharray': '3 4' }); });
    return ax; }
  // a·x₁ + b·x₂ + c = 0 직선 (u 만큼 자람)
  function lineABC(ax, a, b, c, u, col, o) { o = o || {}; if (u <= 0) return; const n2 = a * a + b * b, p0 = [-c * a / n2, -c * b / n2], d = [-b / Math.sqrt(n2), a / Math.sqrt(n2)];
    const A = [p0[0] - 3 * d[0], p0[1] - 3 * d[1]], B = [p0[0] + 3 * d[0], p0[1] + 3 * d[1]], cp = clipOf(ax);
    el('line', { x1: ax.X(A[0]), y1: ax.Y(A[1]), x2: ax.X(lerp(A[0], B[0], u)), y2: ax.Y(lerp(A[1], B[1], u)), stroke: col || ACC, 'stroke-width': o.sw || 3.2, 'stroke-dasharray': o.dash, 'clip-path': cp, opacity: o.op ?? 1 }); }
  // a·x₁ + b·x₂ + c > 0 쪽 칠하기
  function half(ax, a, b, c, col, op) { if (op <= 0) return; const n = Math.sqrt(a * a + b * b), p0 = [-c * a / (n * n), -c * b / (n * n)], d = [-b / n, a / n], m = [a / n, b / n];
    const P = [[p0[0] - 4 * d[0], p0[1] - 4 * d[1]], [p0[0] + 4 * d[0], p0[1] + 4 * d[1]]], Q = [[P[1][0] + 4 * m[0], P[1][1] + 4 * m[1]], [P[0][0] + 4 * m[0], P[0][1] + 4 * m[1]]];
    el('polygon', { points: [...P, ...Q].map(([u, v]) => `${ax.X(u)},${ax.Y(v)}`).join(' '), fill: col || ACCBG, opacity: op, 'clip-path': clipOf(ax) }); }
  // 두 직선 사이 띠 (x₁+x₂ 가 0.5~1.5)
  function band(ax, op, col) { if (op <= 0) return; const q = [[-3, 3.5], [3.5, -3], [4.5, -3], [-3, 4.5]];
    el('polygon', { points: q.map(([u, v]) => `${ax.X(u)},${ax.Y(v)}`).join(' '), fill: col || WARN, opacity: 0.22 * op, 'clip-path': clipOf(ax) }); }
  // 네 점: lab[i] 1 이면 채운 원, 0 이면 빈 원
  function pts4(ax, lab, o) { o = o || {};
    PTS.forEach(([a, b], i) => { const s = o.s ? o.s(i) : 1; if (s <= 0) return; const v = lab ? lab[i] : null, X = o.at ? o.at(i)[0] : ax.X(a), Y = o.at ? o.at(i)[1] : ax.Y(b);
      if (o.ring && o.ring(i)) el('circle', { cx: X, cy: Y, r: 22, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' });
      const g = R.G(X, Y, s); el('circle', { cx: 0, cy: 0, r: 15, fill: v === 1 ? ACC : PANEL, stroke: v === 1 ? ACC : INK, 'stroke-width': 2.2 }, g);
      if (v != null) mono(0, 5, String(v), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: v === 1 ? PANEL : INK }, g); }); }
  // 신경망: layers=[2,2,1], x0~x1 사이, cy 중심. o.name(li,ni) 노드 글자, o.show(li) 0→1
  function net(x0, x1, cy, layers, o) { o = o || {}; const L = layers.length, gap = o.gap || 62, r = o.r || 17;
    const pos = layers.map((n, li) => Array.from({ length: n }, (_, ni) => [L > 1 ? x0 + (li * (x1 - x0)) / (L - 1) : x0, cy + (ni - (n - 1) / 2) * gap]));
    layers.slice(0, -1).forEach((n, li) => { const s = o.show ? o.show(li + 1) : 1; pos[li].forEach((p) => pos[li + 1].forEach((q) => { if (s > 0) el('line', { x1: p[0], y1: p[1], x2: lerp(p[0], q[0], s), y2: lerp(p[1], q[1], s), stroke: o.edge || OFF, 'stroke-width': 1.8 }); })); });
    pos.forEach((col, li) => { const sv = o.show ? clamp(o.show(li) * 1.4) : 1; if (sv <= 0) return;
      col.forEach(([x, y], ni) => { const g = R.G(x, y, sv); const fill = li === 0 ? PANEL : li === L - 1 ? ACC : ACCBG;
        el('circle', { cx: 0, cy: 0, r, fill: o.fill ? o.fill(li, ni) || fill : fill, stroke: li === L - 1 ? ACC : INK, 'stroke-width': 2.2 }, g);
        const nm = o.name && o.name(li, ni); if (nm) tx(0, 5, nm, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: li === L - 1 ? PANEL : INK }, g); }); });
    return pos; }
  const outCells = (x, y, vals, want, op, o) => cells(x, y, vals, { w: o && o.w || 46, h: 40, mono: true, style: (i, v) => ({ fill: v === 1 ? ACC : PANEL, color: v === 1 ? PANEL : INK, stroke: want && want[i] !== v ? BAD : v === 1 ? ACC : INK, sw: want && want[i] !== v ? 3 : 2, op, s: o && o.s ? o.s(i) : 1 }) });
  // 눈송이 (AI 겨울)
  function flake(cx, cy, r, s) { const g = R.G(cx, cy, s); for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; el('line', { x1: -r * Math.cos(a), y1: -r * Math.sin(a), x2: r * Math.cos(a), y2: r * Math.sin(a), stroke: INFO, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g); }
    el('circle', { cx: 0, cy: 0, r: r * 0.25, fill: PANEL, stroke: INFO, 'stroke-width': 2.5 }, g); }

  // =========================================================
  // 1. 퍼셉트론 — 뉴런 하나 = 직선 하나
  // =========================================================
  function neuron(o) { o = o || {}; const sh = o.sh || (() => 1);
    const IN = [[120, 140], [120, 290]], S = [380, 215], ST = [540, 215], OUT = [700, 215];
    IN.forEach(([x, y], i) => { grow(x + 20, y, S[0] - 34, S[1] + (i ? 16 : -16), sh(1), MUT, { plain: true });
      card(x, y, 52, 52, { rx: 26, text: i ? 'x₂' : 'x₁', fs: 17, s: sh(0) }); });
    if (sh(1) > 0.6) { tx(250, 160, 'w₁', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(sh(1), 0.6) }); tx(250, 284, 'w₂', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(sh(1), 0.6) }); }
    card(S[0], S[1], 64, 64, { rx: 32, text: 'Σ', fs: 24, stroke: INK, s: sh(2) > 0 ? 1 : 0 });
    if (sh(3) > 0) { grow(S[0], 90, S[0], S[1] - 36, sh(3), WARN); pill(S[0], 76, '+ b', WARN, 1, { fs: 15, mono: true }); }
    if (sh(4) > 0) { grow(S[0] + 34, S[1], ST[0] - 40, ST[1], sh(4), MUT); const g = R.G(ST[0], ST[1], 1);
      el('rect', { x: -38, y: -32, width: 76, height: 64, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }, g);
      el('polyline', { points: '-26,16 0,16 0,-16 26,-16', fill: 'none', stroke: ACC, 'stroke-width': 3 }, g);
      mono(ST[0], ST[1] + 54, 'step', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); }
    if (sh(5) > 0) { grow(ST[0] + 40, ST[1], OUT[0] - 30, OUT[1], sh(5), ACC); card(OUT[0], OUT[1], 56, 56, { rx: 28, text: '0/1', fs: 16, mono: true, stroke: ACC, color: ACC }); }
    return { IN, S, ST, OUT }; }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const ax = axes(90, 70, 380, 250, { x: [-3, 3], y: [-0.25, 1.3], xt: [-2, 0, 2], yt: [0, 1], xl: 'z', yl: 'step(z)', grid: true });
      R.line(ax, [[-3, 0], [0, 0]], E(u, 0.2, 0.9), ACC, { sw: 4 });
      if (u > 0.9) el('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(0), y2: ax.Y(lerp(0, 1, E(u, 0.9, 1.2))), stroke: ACC, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
      R.line(ax, [[0, 1], [3, 1]], E(u, 1.2, 1.9), ACC, { sw: 4 });
      if (u > 0.9) el('circle', { cx: ax.X(0), cy: ax.Y(0), r: 6, fill: ACC });
      if (u > 1.2) el('circle', { cx: ax.X(0), cy: ax.Y(1), r: 6, fill: PANEL, stroke: ACC, 'stroke-width': 2.5 });
      pill(720, 120, 'return (z > 0).astype(int)', INK, pop(u, 0.3), { mono: true, fs: 15 });
      card(720, 210, 260, 50, { rx: 12, text: 'z ≤ 0  →  0  침묵', fs: 16, stroke: INK, s: pop(u, 0.9) });
      card(720, 280, 260, 50, { rx: 12, text: 'z > 0  →  1  발화', fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.5) });
      sub(720, 350, '출력은 딱 두 값 — 0 또는 1', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { neuron({ sh: (i) => [E(u, 0.2, 0.6), E(u, 0.5, 1.1), u > 0.9 ? 1 : 0, E(u, 1.2, 1.6), E(u, 1.5, 1.9), E(u, 1.8, 2.2)][i] });
      pill(120, 370, 'x: (n, 2)', INFO, pop(u, 0.4), { mono: true, fs: 14 });
      pill(250, 370, 'w: (2,)', ACC, pop(u, 1.0), { mono: true, fs: 14 }); pill(380, 370, 'b: 스칼라', WARN, pop(u, 1.4), { fs: 14 });
      card(800, 340, 220, 70, { rx: 12, text: '파라미터 3개\nw₁ · w₂ · b', fs: 15, stroke: ACC, color: ACC, s: pop(u, 2.2) }); return; }
    if (k === 2) { neuronSmall(u);
      const ax = plane(600, 70, 250); lineABC(ax, 1, 1, -1.5, E(u, 1.2, 2.0), ACC);
      tx(725, 52, 'w·x + b = 0 인 점들', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      sub(725, 410, '가중합이 0 이 되는 자리 = 평면 위 직선', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const ax = plane(80, 60, 280);
    if (k === 3) { pts4(ax, null, { s: (i) => pop(u, 0.3 + i * 0.35) });
      PTS.forEach(([a, b], i) => mono(ax.X(a) + (a ? -20 : 20), ax.Y(b) + (b ? -24 : 34), `(${a},${b})`, { 'font-size': 14, 'text-anchor': a ? 'end' : 'start', fill: MUT, opacity: fade(u, 0.4 + i * 0.35) }));
      mono(500, 110, 'X = np.array([', { 'font-size': 15, opacity: fade(u, 0.2) });
      PTS.forEach(([a, b], i) => mono(530, 140 + i * 28, `[${a}, ${b}],`, { 'font-size': 15, fill: ACC, opacity: fade(u, 0.3 + i * 0.35), 'font-weight': 700 }));
      mono(500, 140 + 4 * 28, '])', { 'font-size': 15, opacity: fade(u, 0.2) });
      pill(720, 180, 'shape (4, 2)', INFO, pop(u, 1.9), { mono: true, fs: 15 });
      sub(660, 330, '2비트 입력 전부 = 평면 위 네 점', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4 || k === 6) { const g = k === 4 ? E(u, 0.3, 1.2) : 1;
      half(ax, 1, 1, -1.5, ACCBG, k === 4 ? fade(u, 1.2, 0.5) : 1); lineABC(ax, 1, 1, -1.5, g, ACC);
      pts4(ax, k === 4 ? (u > 1.4 ? AND : null) : AND);
      tx(ax.X(1.3), ax.Y(-0.27), 'x₁+x₂ = 1.5', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: ACC, opacity: fade(u, k === 4 ? 1.0 : 0) });
      if (k === 4) { pill(640, 90, 'w = (1, 1)   b = −1.5', ACC, pop(u, 0.2), { mono: true, fs: 15 });
        tx(500, 160, 'z = x₁+x₂−1.5', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.8), class: 'mono' });
        cells(500, 175, ['−1.5', '−0.5', '−0.5', '0.5'], { w: 70, h: 40, style: (i) => ({ op: fade(u, 0.9 + i * 0.15), stroke: i === 3 ? ACC : INK }) });
        tx(500, 252, 'step(z)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.5), class: 'mono' });
        outCells(500, 265, AND, null, fade(u, 1.6), { w: 70 });
        if (u > 2.0) check(810, 285, 14, pop(u, 2.0));
        sub(650, 360, '(1,1) 만 직선 위쪽 → 발화', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      // k6: 정리
      tx(ax.X(1.05), ax.Y(1.25), '1 쪽', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      tx(ax.X(-0.25), ax.Y(-0.2), '0 쪽', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.3) });
      card(660, 110, 360, 56, { rx: 12, text: '퍼셉트론 = 직선 하나로 평면 두 쪽', fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.3) });
      card(660, 185, 360, 50, { rx: 12, text: '학습 = 그 직선을 옳은 자리로 밀기', fs: 15, s: pop(u, 0.8) });
      pill(660, 255, '표현력 = 직선 1개', INFO, pop(u, 1.3), { fs: 15 });
      card(660, 335, 360, 54, { rx: 12, text: '직선으로 못 가르는 문제는?', fs: 16, stroke: BAD, color: BAD, dash: '6 4', s: pop(u, 1.9) }); return; }
    // k5: 편향만 바꿔 OR
    const b = k === 5 ? lerp(-1.5, -0.5, E(u, 0.4, 1.5)) : -0.5;
    half(ax, 1, 1, b, ACCBG, 1); lineABC(ax, 1, 1, -1.5, 1, OFF, { dash: '6 5', sw: 2 }); lineABC(ax, 1, 1, b, 1, ACC);
    const lab = PTS.map(([p, q]) => (p + q + b > 0 ? 1 : 0)); pts4(ax, lab);
    if (u > 0.5 && u < 1.6) grow(ax.X(0.9), ax.Y(0.9), ax.X(0.45), ax.Y(0.45), E(u, 0.5, 1.4), ACC);
    pill(660, 90, 'w = (1, 1)  그대로', MUT, 1, { mono: true, fs: 15 });
    mono(660, 160, `b = ${b.toFixed(2).replace('-', '−')}`, { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    sub(660, 190, '−1.5 → −0.5 : 직선이 평행이동', fade(u, 0.6), { 'font-size': 15, fill: INK });
    tx(500, 245, 'step(z)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.5), class: 'mono' });
    outCells(500, 258, OR, null, fade(u, 1.6), { w: 70 }); if (u > 2.0) check(810, 278, 14, pop(u, 2.0));
    sub(660, 350, 'OR — (0,0) 만 아래쪽에 남는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
  // k2 용 작은 뉴런 (왼쪽 절반)
  function neuronSmall(u) { const IN = [[70, 140], [70, 280]], S = [260, 210], ST = [400, 210];
    IN.forEach(([x, y], i) => { el('line', { x1: x + 22, y1: y, x2: S[0] - 30, y2: S[1] + (i ? 14 : -14), stroke: MUT, 'stroke-width': 2 }); card(x, y, 46, 46, { rx: 23, text: i ? 'x₂' : 'x₁', fs: 16 }); });
    tx(150, 160, 'w₁', { 'font-size': 16, 'font-weight': 800, fill: ACC }); tx(150, 280, 'w₂', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    card(S[0], S[1], 58, 58, { rx: 29, text: 'Σ', fs: 22 }); el('line', { x1: S[0], y1: 120, x2: S[0], y2: S[1] - 32, stroke: WARN, 'stroke-width': 2.2 }); pill(S[0], 108, '+ b', WARN, 1, { fs: 14, mono: true });
    const hot = E(u, 0.3, 0.9); dot([[92, 140], [S[0], S[1]], [ST[0], ST[1]]], seg(u, 0.2, 1.0), ACC, 7); dot([[92, 280], [S[0], S[1]], [ST[0], ST[1]]], seg(u, 0.2, 1.0), ACC, 7);
    el('line', { x1: S[0] + 30, y1: S[1], x2: ST[0] - 34, y2: ST[1], stroke: MUT, 'stroke-width': 2 });
    const g = R.G(ST[0], ST[1], 1); el('rect', { x: -34, y: -28, width: 68, height: 56, rx: 10, fill: hot > 0.5 ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 2.5 }, g);
    el('polyline', { points: '-22,14 0,14 0,-14 22,-14', fill: 'none', stroke: ACC, 'stroke-width': 3 }, g);
    pill(240, 380, 'step(x @ w + b)', ACC, pop(u, 0.5), { mono: true, fs: 16 }); }

  // =========================================================
  // 2. XOR 위기 — 어떤 직선도 못 나눈다
  // =========================================================
  // 회전·이동하는 직선: 각도 θ, 중심에서의 거리 d → 직선 cosθ·x + sinθ·y + c = 0
  const sweep = (s) => { const th = s * Math.PI * 2.6 + 0.35, d = 0.32 * Math.sin(s * 9.1); const a = Math.cos(th), b = Math.sin(th); return [a, b, -(a * 0.5 + b * 0.5) + d]; };
  const errs = ([a, b, c]) => { const side = PTS.map(([p, q]) => (a * p + b * q + c > 0 ? 1 : 0)), e1 = side.filter((v, i) => v !== XOR[i]).length; return Math.min(e1, 4 - e1); };
  function s2(t, c) { const { k, u } = c; const ax = plane(70, 60, 280);
    if (k === 0) { const sw = u > 0.6; pts4(ax, sw ? XOR : AND, { s: (i) => (i === 1 || i === 2 || i === 3) && sw ? pop(u, 0.6 + i * 0.15) : 1 });
      if (u > 1.4) { [[0, 1, 1, 0, ACC], [0, 0, 1, 1, INK]].forEach(([a, b, p, q, col], j) => { const g = E(u, 1.4 + j * 0.3, 1.9 + j * 0.3); el('line', { x1: ax.X(a), y1: ax.Y(b), x2: ax.X(lerp(a, p, g)), y2: ax.Y(lerp(b, q, g)), stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: 0.7 }); }); }
      mono(460, 120, 'y_xor =', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) }); outCells(560, 96, XOR, null, fade(u, 0.5));
      mono(460, 175, 'y_and =', { 'font-size': 15, fill: OFF, opacity: fade(u, 0.3) }); cells(560, 156, AND, { w: 46, h: 30, fs: 14, style: () => ({ stroke: OFF, color: OFF, sw: 1.5 }) });
      sub(640, 260, '입력·모델 그대로 — 정답만 바뀌었다', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(640, 300, '같은 클래스가 대각선으로 엇갈린다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 1) { pts4(ax, XOR);
      ['w₁', 'w₂', 'b'].forEach((nm, j) => { const y = 120 + j * 70, g = E(u, 0.3 + j * 0.35, 1.2 + j * 0.35);
        tx(460, y + 5, nm, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + j * 0.35) });
        el('line', { x1: 500, y1: y, x2: 500 + 360 * g, y2: y, stroke: MUT, 'stroke-width': 2 });
        for (let i = 0; i < 81; i++) { if (i / 80 > g) break; el('line', { x1: 500 + i * 4.5, y1: y - (i % 10 === 0 ? 9 : 5), x2: 500 + i * 4.5, y2: y + (i % 10 === 0 ? 9 : 5), stroke: i % 40 === 0 ? INK : MUT, 'stroke-width': i % 40 === 0 ? 2 : 1 }); }
        if (g > 0.95) { mono(500, y + 28, '−2.0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(860, y + 28, '2.0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(905, y + 5, '81칸', { 'font-size': 14, 'font-weight': 700, fill: INK, 'text-anchor': 'middle' }); } });
      mono(680, 350, '81 × 81 × 81 = 531,441', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) });
      pill(680, 392, 'found = 0', INK, pop(u, 2.2), { mono: true, fs: 15 }); return; }
    if (k === 2 || k === 3) { const s = k === 2 ? clamp(u / 2.9) : 0.62, L = k === 2 ? sweep(s) : [1, 1, -0.5], e = errs(L);
      const side = PTS.map(([p, q]) => (L[0] * p + L[1] * q + L[2] > 0 ? 1 : 0)), flip = side.filter((v, i) => v !== XOR[i]).length > 2, pred = side.map((v) => (flip ? 1 - v : v));
      half(ax, flip ? -L[0] : L[0], flip ? -L[1] : L[1], flip ? -L[2] : L[2], ACCBG, 0.9); lineABC(ax, L[0], L[1], L[2], 1, BAD, { dash: k === 2 ? '8 5' : null });
      pts4(ax, XOR, { ring: (i) => pred[i] !== XOR[i] });
      if (k === 2) { mono(470, 100, 'for w1 … for w2 … for b …', { 'font-size': 15, opacity: fade(u, 0.1) });
        mono(470, 170, '시험한 직선', { 'font-size': 15, fill: MUT });
        mono(890, 170, Math.round(531441 * E(u, 0.2, 2.8)).toLocaleString('en-US'), { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'end' });
        mono(470, 225, '이 직선의 오분류', { 'font-size': 15, fill: MUT }); mono(890, 225, `${e}개`, { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
        sub(680, 300, '돌리고 밀어도 오분류 0 이 안 나온다', fade(u, 1.6), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
      // k3: array_equal
      mono(470, 110, 'pred  =', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); outCells(560, 88, pred, XOR, fade(u, 0.3));
      mono(470, 170, 'y_xor =', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) }); outCells(560, 148, XOR, null, fade(u, 0.7));
      [0, 1, 2, 3].forEach((i) => { const ok = pred[i] === XOR[i], x = 583 + i * 52; if (u > 1.0 + i * 0.25) (ok ? check : cross)(x, 225, 11, pop(u, 1.0 + i * 0.25)); });
      card(680, 290, 330, 50, { rx: 12, text: 'np.array_equal → False', fs: 16, mono: true, stroke: BAD, color: BAD, s: pop(u, 2.0) });
      sub(680, 345, '세 점 맞아도 실패 — 네 점 전부여야 found += 1', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 4) { pts4(ax, XOR); mono(470, 130, '조합 수', { 'font-size': 16, fill: MUT }); mono(890, 130, '531,441', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'end' });
      el('line', { x1: 470, y1: 150, x2: 890, y2: 150, stroke: GRID, 'stroke-width': 1.5 });
      mono(470, 210, 'found', { 'font-size': 18, 'font-weight': 700 }); mono(890, 225, '0', { 'font-size': 64, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.5) });
      card(680, 300, 380, 52, { rx: 12, text: '못 찾은 게 아니라 존재하지 않는다', fs: 16, stroke: BAD, color: BAD, s: pop(u, 1.4) });
      pill(680, 370, 'XOR 를 푸는 직선 — 없음', MUT, pop(u, 2.0), { fs: 14 }); return; }
    if (k === 5) { const g1 = E(u, 0.2, 0.9), g2 = E(u, 0.8, 1.5);
      el('line', { x1: ax.X(0), y1: ax.Y(1), x2: ax.X(lerp(0, 1, g1)), y2: ax.Y(lerp(1, 0, g1)), stroke: ACC, 'stroke-width': 4 });
      el('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(lerp(0, 1, g2)), y2: ax.Y(lerp(0, 1, g2)), stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '8 6' });
      pts4(ax, XOR);
      if (u > 1.5) { const s = pop(u, 1.5); el('circle', { cx: ax.X(0.5), cy: ax.Y(0.5), r: 10 * s, fill: WARN }); el('circle', { cx: ax.X(0.5), cy: ax.Y(0.5), r: 20 * s, fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); }
      mono(ax.X(0.5) + 26, ax.Y(0.5) + 34, '(0.5, 0.5)', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      const T = [['1 쪽에 (0,1)·(1,0) → 둘 사이 선분도 1 쪽', ACC, 0.4], ['0 쪽에 (0,0)·(1,1) → 둘 사이 선분도 0 쪽', INK, 1.0], ['두 선분이 (0.5, 0.5) 에서 만난다', WARN, 1.7], ['한 점이 양쪽에 동시에 → 모순', BAD, 2.2]];
      T.forEach(([s, col, a], i) => tx(450, 120 + i * 50, s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, a) }));
      sub(680, 360, '직선의 한쪽(반평면)은 두 점 사이 선분을 통째로 포함한다', fade(u, 2.4), { 'font-size': 14 }); return; }
    // k6: 실패의 성격 + AI 겨울
    for (let i = 0; i < 6; i++) { const L = sweep(0.1 + i * 0.15); lineABC(ax, L[0], L[1], L[2], 1, BAD, { dash: '6 5', sw: 1.6, op: 0.35 }); }
    pts4(ax, XOR);
    card(560, 100, 200, 60, { rx: 12, text: '학습 알고리즘\n의 실패', fs: 15, stroke: OFF, color: OFF, s: pop(u, 0.2) }); if (u > 0.6) cross(655, 74, 12, pop(u, 0.6));
    card(800, 100, 220, 60, { rx: 12, text: '모델 표현력\n의 한계', fs: 15, stroke: BAD, color: BAD, fill: R.C.BADBG, s: pop(u, 0.9) }); if (u > 1.2) check(905, 76, 12, pop(u, 1.2));
    const ty = 250; el('line', { x1: 460, y1: ty, x2: 460 + 440 * E(u, 1.3, 2.0), y2: ty, stroke: MUT, 'stroke-width': 2.5 });
    [[480, '1958', '퍼셉트론', 1.4], [680, '1969', '「Perceptrons」', 1.7]].forEach(([x, y, s, a]) => { el('circle', { cx: x, cy: ty, r: 7, fill: INK, opacity: fade(u, a) }); mono(x, ty - 18, y, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, a) }); tx(x, ty + 30, s, { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, a) }); });
    flake(860, ty, 22, pop(u, 2.0)); tx(860, ty + 48, '첫 AI 겨울', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
    sub(680, 360, '도구를 더 열심히 쓰는 게 아니라 도구를 바꿔야 한다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 3. 층을 쌓으면 — 직선 2개를 조합
  // =========================================================
  const H = [[0, 1], [1, 1], [1, 1], [1, 0]];
  const hName = (li, ni) => (li === 0 ? ['x₁', 'x₂'][ni] : li === 1 ? ['h₁', 'h₂'][ni] : 'y');
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const ax = plane(70, 60, 280); const L = sweep(clamp(u / 2.9) * 0.6); lineABC(ax, L[0], L[1], L[2], 1, BAD, { dash: '8 5' }); pts4(ax, XOR);
      net(520, 720, 200, [2, 1], { name: hName, show: (li) => E(u, 0.2 + li * 0.4, 0.8 + li * 0.4) });
      if (u > 1.2) cross(800, 200, 18, pop(u, 1.2));
      pill(640, 330, 'step(z) — 뉴런 자체는 그대로', INK, pop(u, 1.6), { fs: 15 });
      sub(640, 380, '뉴런 하나 = 직선 하나 → 배치를 바꾼다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { net(200, 700, 210, [2, 2, 1], { name: hName, gap: 110, r: 26, show: (li) => li === 1 ? E(u, 0.4, 1.2) : li === 2 ? E(u, 1.0, 1.6) : 1, fill: (li, ni) => li === 1 ? (ni ? R.C.INFOBG : R.C.GOODBG) : null });
      tx(530, 162, 'OR 직선', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) }); tx(530, 272, 'NAND 직선', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4) });
      ['입력층', '은닉층', '출력층'].forEach((s, i) => sub(200 + i * 250, 360, s, i === 1 ? fade(u, 0.6) : i === 2 ? fade(u, 1.2) : 1, { 'font-size': 15, 'font-weight': 700, fill: MUT }));
      sub(450, 400, '은닉 뉴런 하나 = 직선 하나 → 직선 두 개를 동시에', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const ax = plane(60, 60, 260, { xl: 'x₁', yl: 'x₂' });
    const twoLines = (g1, g2) => { lineABC(ax, 1, 1, -0.5, g1, GOOD); lineABC(ax, 1, 1, -1.5, g2, INFO); };
    if (k === 2) { twoLines(E(u, 1.0, 1.7), E(u, 1.5, 2.2)); pts4(ax, XOR);
      tx(60, 405, '— h₁: x₁+x₂=0.5', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) });
      tx(230, 405, '— h₂: x₁+x₂=1.5', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.2) });
      tx(500, 95, 'W1  (2×2)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      if (u > 0.2) R.heat(530, 130, [[1, -1], [1, -1]], 66, { cols: ['h₁', 'h₂'], rows: ['x₁', 'x₂'], fmt: (v) => v.toFixed(1), max: 1.2 });
      tx(720, 95, 'b1', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.6) });
      if (u > 0.6) R.heat(730, 130, [[-0.5, 1.5]], 70, { cols: ['h₁', 'h₂'], fmt: (v) => v.toFixed(1), max: 1.6 });
      el('rect', { x: 528, y: 128, width: 66, height: 134, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 1.0) });
      el('rect', { x: 594, y: 128, width: 66, height: 134, rx: 6, fill: 'none', stroke: INFO, 'stroke-width': 3, opacity: fade(u, 1.5) });
      sub(660, 320, '열 하나 = 뉴런 하나 = 직선 하나', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k3~: 오른쪽에 (h₁, h₂) 평면
    const hx = k <= 5 ? plane(620, 60, 260, { xl: 'h₁', yl: 'h₂' }) : null;
    if (k <= 5) { twoLines(1, 1); pts4(ax, XOR); }
    const fl = k === 3 ? E(u, 0.6, 1.9) : 1;
    const at = (i) => { const [a, b] = PTS[i], [p, q] = H[i], off = (i === 1 ? -1 : i === 2 ? 1 : 0) * 13; return [lerp(ax.X(a), hx.X(p), fl) + off, lerp(ax.Y(b), hx.Y(q), fl) + off]; };
    if (k === 3 || k === 4) { if (k === 3) mono(470, 50, 'H = step(X @ W1 + b1)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.2) });
      if (k === 3) grow(345, 200, 600, 200, E(u, 0.3, 0.8), ACC);
      pts4(hx, XOR, { at, s: () => (k === 3 ? (u > 0.6 ? 1 : 0) : 1) });
      if (k === 3) sub(470, 400, '좌표계 (x₁, x₂) → (h₁, h₂)', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 4) { el('circle', { cx: hx.X(1), cy: hx.Y(1), r: 38, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.3) });
        pill(hx.X(1) - 30, hx.Y(1) - 56, '(0,1)·(1,0) → (1,1)', ACC, pop(u, 0.5), { fs: 14 });
        mono(hx.X(0) + 22, hx.Y(1) + 34, '← (0,0)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
        mono(hx.X(1) - 22, hx.Y(0) - 22, '(1,1) →', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.4) });
        sub(470, 400, '새 좌표에서는 두 클래스가 직선 하나로 갈린다', fade(u, 2.0), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); }
      return; }
    if (k === 5) { half(hx, 1, 1, -1.5, ACCBG, fade(u, 1.0)); lineABC(hx, 1, 1, -1.5, E(u, 0.4, 1.3), ACC); pts4(hx, XOR, { at });
      pill(470, 40, 'W2 = (1, 1)   b2 = −1.5   → AND', ACC, pop(u, 0.2), { mono: true, fs: 15 });
      tx(hx.X(1.3), hx.Y(-0.27), 'h₁+h₂ = 1.5', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.3) });
      sub(470, 400, '출력 뉴런 = h₁ 도 1, h₂ 도 1 일 때만 발화', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k6, k7: 원래 평면에 띠
    band(ax, k === 6 ? fade(u, 0.3, 0.8) : 1); twoLines(1, 1); pts4(ax, XOR);
    if (k === 6) {
      mono(440, 120, 'y = step(H @ W2 + b2)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      outCells(470, 150, XOR, null, fade(u, 0.6), { w: 56 });
      [0, 1, 2, 3].forEach((i) => { if (u > 1.0 + i * 0.2) check(498 + i * 62, 225, 11, pop(u, 1.0 + i * 0.2)); });
      pill(560, 290, '== XOR  ✓', GOOD, pop(u, 1.8), { fs: 16 });
      sub(560, 360, '두 직선 사이 띠 안에 정확히 (0,1)·(1,0)', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const parts = [['XOR', INK], [' = ', MUT], ['AND', ACC], ['(', MUT], ['OR', GOOD], ['(x), ', MUT], ['NAND', INFO], ['(x))', MUT]];
    R.spans(420, 130, parts.map(([s, col]) => [s, { fill: col, 'font-weight': 800 }]), { 'font-size': 22, opacity: fade(u, 0.2) });
    net(450, 800, 240, [2, 2, 1], { name: hName, gap: 70, r: 20, show: (li) => E(u, 0.5 + li * 0.25, 1.0 + li * 0.25), fill: (li, ni) => li === 1 ? (ni ? R.C.INFOBG : R.C.GOODBG) : null });
    sub(625, 360, '층 = 앞 층의 단순한 표현을 조합한 것', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    sub(625, 392, '직선 + 직선 → 구부러진 결정 경계', fade(u, 2.1), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }

  // =========================================================
  // 4. MLP 일반형 · 유니버설 근사 · 깊게 vs 넓게
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const pos = net(150, 650, 200, [3, 4, 2], { gap: 62, show: (li) => E(u, 0.2 + li * 0.4, 0.7 + li * 0.4) });
      [['x', '(n, 3)', 150, INFO, 0.3], ['W1, b1', '(3, 4)', 400, ACC, 0.8], ['W2, b2', '(4, 2)', 650, ACC, 1.2]].forEach(([a, b, x, col, d]) => { pill(x === 150 ? x : x - 125, 360, `${a}  ${b}`, col, pop(u, d), { mono: true, fs: 14 }); });
      mono(470, 50, 'layers = [(W1, b1), (W2, b2)]', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      card(830, 200, 180, 70, { rx: 12, text: '2층 고정 구조', fs: 15, stroke: OFF, color: OFF, dash: '6 4', s: pop(u, 1.8) }); if (u > 2.1) cross(915, 168, 12, pop(u, 2.1));
      void pos; return; }
    if (k === 1) { const L = [3, 4, 4, 2], pos = net(120, 620, 200, L, { gap: 58 });
      for (let li = 0; li < 3; li++) { const a = 0.2 + li * 0.75, g = seg(u, a, a + 0.7); pos[li].forEach((p, i) => pos[li + 1].forEach((q, j) => { if ((i + j) % 2 === 0) dot([p, q], g, ACC, 5); }));
        tx(lerp(pos[li][0][0], pos[li + 1][0][0], 0.5), 70, `층 ${li + 1}`, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: u > a ? ACC : OFF }); }
      const ax = axes(720, 110, 190, 150, { x: [-2, 2], y: [-0.3, 2], xt: [0], yt: [0], xl: 'z', yl: 'ReLU(z)' });
      R.line(ax, [[-2, 0], [0, 0], [2, 2]], E(u, 0.3, 1.2), ACC, { sw: 3.5 });
      pill(810, 330, 'h = ReLU(h @ W + b)', INK, pop(u, 1.3), { mono: true, fs: 14 });
      sub(400, 390, '선형 변환 + 비선형 — 층 수만큼 반복', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { // 유니버설 근사: 계단 n개로 곡선을 근사 (예시 함수)
      const f = (x) => 0.5 + 0.3 * Math.sin(2 * Math.PI * x) + 0.12 * Math.sin(6 * Math.PI * x);
      const ax = axes(80, 80, 460, 260, { x: [0, 1], y: [0, 1.05], xl: 'x', yl: 'f(x)' });
      R.line(ax, Array.from({ length: 81 }, (_, i) => [i / 80, f(i / 80)]), E(u, 0.1, 0.7), MUT, { dash: '6 5', sw: 2.4 });
      const N = u < 1.0 ? 4 : u < 1.7 ? 8 : 24, pp = [];
      for (let i = 0; i < N; i++) { const a = i / N, b = (i + 1) / N, v = f((a + b) / 2); pp.push([a, v], [b, v]); }
      if (u > 0.6) R.line(ax, pp, 1, ACC, { sw: 3 });
      mono(780, 140, `은닉 뉴런 ${N}개`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      sub(780, 175, '(계단 조각 하나 ≈ 뉴런 한 쌍, 예시 함수)', fade(u, 0.7), { 'font-size': 13.5 });
      pill(780, 240, 'Cybenko · Hornik 1989', INK, pop(u, 1.3), { fs: 15 });
      sub(780, 300, '은닉층 1개 + 뉴런 충분히', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(780, 326, '→ 어떤 연속 함수든 근사', fade(u, 2.0), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 3) { mono(80, 80, 'count_params([8, 256, 1])', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 0.1) });
      const rows = [['8 × 256 + 256', '2,304', 0.5], ['256 × 1 + 1', '257', 1.0]];
      rows.forEach(([a, b, d], i) => { mono(120, 150 + i * 50, a, { 'font-size': 18, opacity: fade(u, d) }); mono(520, 150 + i * 50, '= ' + b, { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, d + 0.3) }); });
      el('line', { x1: 120, y1: 230, x2: 520 * 1, y2: 230, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.6) });
      mono(520, 270, '2,561', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'end', fill: BAD, opacity: fade(u, 1.8) });
      tx(120, 330, '층마다 가중치 a×b + 편향 b', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) });
      net(700, 880, 210, [3, 7, 1], { gap: 34, r: 11, show: (li) => E(u, 0.3 + li * 0.3, 0.8 + li * 0.3) });
      sub(790, 360, '얕고 넓게 (그림은 축소)', fade(u, 1.0), { 'font-size': 14 }); return; }
    if (k === 4) { const W = 520;
      tx(80, 110, '얕고 넓게  [8, 256, 1]', { 'font-size': 16, 'font-weight': 800 }); hbar(80, 125, W, 2561, 2561, { h: 26, col: BAD, u: E(u, 0.3, 1.2), text: '2,561' });
      tx(80, 210, '깊고 좁게  [8, 8, 8, 8, 1]', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.8) }); hbar(80, 225, W, 225, 2561, { h: 26, col: GOOD, u: E(u, 0.9, 1.6), text: '225' });
      mono(80, 300, '(8×8+8)×3 + (8×1+1) = 216 + 9', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
      mono(800, 200, '≈ 11배', { 'font-size': 36, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.9) });
      sub(470, 380, '같은 일에 쓸 수 있다면 — 비용이 11배 차이 (예시 구조)', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5: 부품의 재사용
    zone(40, 50, 420, 300, '얕은 망 — 경우마다 뉴런 하나씩 암기', { op: fade(u, 0.2) });
    zone(500, 50, 420, 300, '깊은 망 — 앞 층 부품을 재조합', { op: fade(u, 0.8), fill: R.C.GOODBG });
    net(90, 400, 210, [4, 12, 1], { gap: 20, r: 7, show: (li) => E(u, 0.3 + li * 0.25, 0.7 + li * 0.25), fill: (li) => li === 1 ? R.C.BADBG : null });
    net(550, 870, 210, [4, 4, 4, 4, 1], { gap: 44, r: 11, show: (li) => E(u, 0.9 + li * 0.2, 1.3 + li * 0.2), fill: (li) => li > 0 && li < 4 ? R.C.GOODBG : null });
    pill(250, 380, '뉴런 수 지수적 증가', BAD, pop(u, 1.4), { fs: 14 }); pill(710, 380, '뉴런 수 선형 증가', GOOD, pop(u, 2.0), { fs: 14 }); }

  // =========================================================
  // 5. 경계 시각화 · 특징의 계층
  // =========================================================
  const xorNet = (p, q) => { const h1 = p + q - 0.5 > 0 ? 1 : 0, h2 = -p - q + 1.5 > 0 ? 1 : 0; return h1 + h2 - 1.5 > 0 ? 1 : 0; };
  function s5(t, c) { const { k, u } = c; if (k >= 3) return s5b(t, c);
    if (k === 0) { const pos = net(140, 560, 210, [2, 2, 1], { name: hName, gap: 140, r: 28, fill: (li, ni) => li === 1 ? (ni ? R.C.INFOBG : R.C.GOODBG) : null });
      const W = [['1', '−1'], ['1', '−1']]; [0, 1].forEach((i) => [0, 1].forEach((j) => { const p = pos[0][i], q = pos[1][j], m = [lerp(p[0], q[0], 0.3), lerp(p[1], q[1], 0.3)];
        pill(m[0], m[1] + (i === j ? -2 : (j ? 14 : -14)), W[i][j], ACC, pop(u, 0.3 + (i * 2 + j) * 0.2), { mono: true, fs: 14, fill: PANEL }); }));
      pill(pos[1][0][0], pos[1][0][1] - 50, 'b = −0.5', WARN, pop(u, 1.2), { mono: true, fs: 14 }); pill(pos[1][1][0], pos[1][1][1] + 50, 'b = 1.5', WARN, pop(u, 1.3), { mono: true, fs: 14 });
      pill(460, 140, '1', ACC, pop(u, 1.5), { mono: true, fs: 14, fill: PANEL }); pill(460, 280, '1', ACC, pop(u, 1.5), { mono: true, fs: 14, fill: PANEL }); pill(560, 160, 'b = −1.5', WARN, pop(u, 1.6), { mono: true, fs: 14 });
      card(780, 210, 230, 90, { rx: 14, text: '전부 사람이\n손으로 정한 값', fs: 16, stroke: WARN, color: WARN, s: pop(u, 2.0) });
      pill(780, 300, 'mlp_xor(x)', INK, pop(u, 2.2), { mono: true, fs: 15 }); return; }
    const ax = plane(70, 50, 290);
    if (k === 1 || k === 2) { const N = 28, g = k === 1 ? E(u, 0.2, 2.4) : 1;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { if ((i * N + j) / (N * N) > g) continue; const p = -0.35 + (i + 0.5) * 1.7 / N, q = -0.35 + (j + 0.5) * 1.7 / N, z = xorNet(p, q);
        if (k === 1) el('circle', { cx: ax.X(p), cy: ax.Y(q), r: 3, fill: z ? ACC : OFF, opacity: 0.8 });
        else el('rect', { x: ax.X(p) - 5.3, y: ax.Y(q) - 5.3, width: 10.6, height: 10.6, fill: z ? ACC : SOFT, opacity: z ? 0.28 * fade(u, 0.2, 0.8) + 0.05 : 0.5 }); }
      if (k === 1) { mono(470, 110, 'meshgrid 200 × 200', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 0.2) });
        mono(470, 160, Math.round(40000 * g).toLocaleString('en-US') + ' 점', { 'font-size': 30, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
        sub(640, 210, '(그림은 28 × 28 로 줄여 찍음)', fade(u, 0.6), { 'font-size': 14 });
        pill(640, 270, 'zz = mlp_xor(grid)', INK, pop(u, 1.2), { mono: true, fs: 15 });
        sub(640, 340, '네 점이 아니라 평면 전체를 물어본다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      lineABC(ax, 1, 1, -0.5, E(u, 0.6, 1.2), GOOD, { sw: 2 }); lineABC(ax, 1, 1, -1.5, E(u, 0.6, 1.2), INFO, { sw: 2 });
      pts4(ax, XOR, { s: (i) => pop(u, 1.0 + i * 0.15) });
      pill(640, 120, 'plt.contourf(xx, yy, zz)', INK, pop(u, 0.2), { mono: true, fs: 15 }); pill(640, 175, 'plt.scatter(X[:,0], X[:,1])', INK, pop(u, 0.9), { mono: true, fs: 15 });
      sub(640, 260, '띠 = 출력 1 인 영역', fade(u, 1.6), { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      sub(640, 300, '그 안에 정확히 (0,1)·(1,0) 두 점', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(640, 340, '직선 하나로는 못 만드는 모양', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); } }
  function s5b(t, c) { const { k, u } = c;
    if (k === 3) { const S = 210, xs = [40, 360, 680];
      ['단층 — 직선', '2층 — 띠', '깊은 층 — 다각형·곡면'].forEach((nm, i) => { const a = 0.2 + i * 0.6, op = fade(u, a);
        el('rect', { x: xs[i], y: 70, width: S, height: S, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
        tx(xs[i] + S / 2, 55, nm, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: op });
        const ax = { x: xs[i], y: 70, w: S, h: S, X: (v) => xs[i] + (v + 0.35) / 1.7 * S, Y: (v) => 70 + S - (v + 0.35) / 1.7 * S };
        if (op <= 0) return;
        if (i === 0) { half(ax, 1, 1, -1.5, ACCBG, op); lineABC(ax, 1, 1, -1.5, E(u, a, a + 0.5), ACC); }
        if (i === 1) { band(ax, op, ACC); lineABC(ax, 1, 1, -0.5, E(u, a, a + 0.5), GOOD); lineABC(ax, 1, 1, -1.5, E(u, a, a + 0.5), INFO); }
        if (i === 2) { const P = Array.from({ length: 40 }, (_, j) => { const th = j / 40 * Math.PI * 2, r = 0.42 + 0.12 * Math.sin(3 * th) + 0.06 * Math.cos(5 * th); return [0.5 + r * Math.cos(th), 0.5 + r * Math.sin(th)]; });
          el('polygon', { points: P.slice(0, Math.max(3, Math.round(40 * E(u, a, a + 0.8)))).map(([p, q]) => `${ax.X(p)},${ax.Y(q)}`).join(' '), fill: ACCBG, stroke: ACC, 'stroke-width': 3 }); }
        pts4(ax, i === 0 ? AND : XOR, { s: () => op }); });
      grow(260, 175, 350, 175, E(u, 0.6, 0.9), MUT); grow(580, 175, 670, 175, E(u, 1.2, 1.5), MUT);
      sub(480, 330, '(셋째 그림은 깊은 망이 만들 수 있는 경계 모양의 예시)', fade(u, 1.8), { 'font-size': 14 });
      sub(480, 375, '깊이 = 경계의 자유도', fade(u, 2.2), { 'font-size': 16, fill: INK, 'font-weight': 800 }); return; }
    // k4, k5: 특징 계층 사다리 — 엣지 → 부품 → 개념
    const lv = [{ y: 330, nm: '저수준 · 엣지', col: INFO }, { y: 210, nm: '중수준 · 부품', col: GOOD }, { y: 90, nm: '고수준 · 개념', col: ACC }];
    const show = (i) => (i === 0 ? 1 : i === 1 ? (k === 4 ? fade(u, 0.5) : 1) : (k === 5 ? fade(u, 0.3) : 0));
    lv.forEach((L, i) => { const op = show(i); if (op <= 0) return; tx(40, L.y + 6, L.nm, { 'font-size': 15, 'font-weight': 800, fill: L.col, opacity: op });
      for (let j = 0; j < 4; j++) { const x = 210 + j * 80, y = L.y - 32, g = R.G(x, y, 1, op); el('rect', { x: 0, y: 0, width: 64, height: 64, rx: 6, fill: SOFT, stroke: L.col, 'stroke-width': 2 }, g);
        if (i === 0) { const a = j * Math.PI / 4; el('line', { x1: 32 - 22 * Math.cos(a), y1: 32 - 22 * Math.sin(a), x2: 32 + 22 * Math.cos(a), y2: 32 + 22 * Math.sin(a), stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round' }, g); }
        if (i === 1) { if (j === 0) el('circle', { cx: 32, cy: 32, r: 14, fill: 'none', stroke: INK, 'stroke-width': 4 }, g);
          if (j === 1) el('path', { d: 'M14,46 L32,16 L50,46', fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
          if (j === 2) el('path', { d: 'M14,24 Q32,50 50,24', fill: 'none', stroke: INK, 'stroke-width': 4 }, g);
          if (j === 3) el('path', { d: 'M14,18 L50,18 L50,46', fill: 'none', stroke: INK, 'stroke-width': 4 }, g); }
        if (i === 2 && j === 0) { el('circle', { cx: 32, cy: 32, r: 24, fill: 'none', stroke: INK, 'stroke-width': 3 }, g); el('circle', { cx: 23, cy: 27, r: 3.5, fill: INK }, g); el('circle', { cx: 41, cy: 27, r: 3.5, fill: INK }, g); el('path', { d: 'M21,40 Q32,50 43,40', fill: 'none', stroke: INK, 'stroke-width': 3 }, g); }
        if (i === 2 && j === 1) { el('rect', { x: 8, y: 26, width: 48, height: 18, rx: 6, fill: 'none', stroke: INK, 'stroke-width': 3 }, g); el('circle', { cx: 20, cy: 46, r: 6, fill: INK }, g); el('circle', { cx: 44, cy: 46, r: 6, fill: INK }, g); }
        if (i === 2 && j > 1) g.setAttribute('opacity', 0); }
      if (i > 0) grow(370, L.y + 82, 370, L.y + 40, op, L.col); });
    tx(550, 336, '= XOR 의 은닉 뉴런처럼 직선 긋기', { 'font-size': 14.5, fill: MUT, opacity: fade(u, k === 4 ? 0.2 : 0) });
    if (k === 4) { tx(550, 216, '앞 층 엣지를 조합한 형태', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
      sub(700, 395, '"직선의 조합" → "특징의 조합" · 아무도 설계하지 않았다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    tx(400, 96, '얼굴 · 자동차', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
    card(760, 120, 290, 56, { rx: 12, text: '손으로 가중치 설계', fs: 15, stroke: OFF, color: OFF, s: pop(u, 0.9) }); if (u > 1.2) cross(900, 94, 12, pop(u, 1.2));
    // 다음 장 예고: 오차 신호가 거꾸로 흐른다
    grow(890, 360, 890, 200, E(u, 1.4, 2.0), BAD); tx(880, 395, '오차 → 역전파', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.6) });
    pill(700, 230, '다음: 활성화 함수 · 역전파', ACC, pop(u, 1.8), { fs: 15 });
    sub(700, 290, '데이터가 가중치를 스스로 찾게 한다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '퍼셉트론의 식 w·x + b = 0 은 2D 평면에서 무엇을 뜻하나?',
      o: ['평면을 두 쪽으로 나누는 직선', '네 점을 모두 지나는 곡선', '입력을 0~1로 누르는 곡선'], a: 0,
      why: '가중합이 0이 되는 점들의 집합이 직선이고, 퍼셉트론은 그 직선으로 평면을 가르는 분류기다. AND는 w=(1,1), b=−1.5인 직선 하나로 재현된다.' },
    { q: 'w1, w2, b 를 −2~2 격자로 531,441개 조합 전부 돌려도 XOR 해가 0개인 이유는?',
      o: ['격자가 너무 성겨서 해를 놓쳤기 때문', '직선 하나로는 대각선으로 엇갈린 두 클래스를 나눌 수 없기 때문', '학습률이 너무 커서 발산했기 때문'], a: 1,
      why: '못 찾은 게 아니라 해집합 자체가 비어 있다. (0,1)과 (1,0)을 한쪽에 두면 (0,0)이나 (1,1)이 반드시 딸려 들어온다 — 모델 표현력의 한계다.' },
    { q: '은닉 뉴런 2개짜리 망은 XOR를 어떻게 푸나?',
      o: ['계단 함수를 부드러운 곡선으로 바꿔서', '입력에 세 번째 좌표를 추가해서', 'OR 직선과 NAND 직선을 긋고 출력 뉴런이 AND로 조합해서'], a: 2,
      why: '은닉층이 (0,1)과 (1,0)을 같은 새 좌표 (1,1)로 모으고, 출력 뉴런이 두 직선 사이의 띠만 고른다. 층 = 표현의 조합이다.' },
    { q: '유니버설 근사 정리가 있는데도 실무가 넓게가 아니라 깊게 쌓는 이유는?',
      o: ['얕은 망은 이론상 연속 함수를 근사할 수 없어서', '같은 표현력을 훨씬 적은 뉴런·파라미터로 얻어서', '깊은 망은 가중치를 학습할 필요가 없어서'], a: 1,
      why: '8비트 패리티 예시에서 얕고 넓은 [8, 256, 1]은 2,561개, 깊고 좁은 [8, 8, 8, 8, 1]은 225개다. 깊은 망은 앞 층이 만든 부품을 계속 재조합한다.' },
    { q: '이 장의 XOR 망 가중치 W1, b1, W2, b2 는 어떻게 정해졌나?',
      o: ['역전파로 학습했다', '전수 탐색으로 찾았다', '사람이 손으로 설계했다'], a: 2,
      why: '전부 손으로 놓은 값이다. 실전 모델의 가중치는 수백만~수천억 개라, 데이터가 스스로 가중치를 찾게 하는 방법(활성화 함수·역전파)이 다음 장부터의 주제다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '퍼셉트론은 w·x + b = 0 이라는 직선 하나로 평면을 두 쪽으로 나눈다.',
    'XOR는 두 클래스가 대각선으로 엇갈려 있어서 어떤 직선으로도 나눌 수 없다.',
    '은닉 뉴런 둘이 OR 직선과 NAND 직선을 긋고, 출력 뉴런이 AND로 묶으면 XOR가 풀린다.',
    '깊게 쌓으면 앞 층의 부품을 재사용해, 8비트 패리티를 2,561개 대신 225개 파라미터로 푼다.',
  ];
  const review = [
    { q: '퍼셉트론 하나로 XOR를 학습시키는데, 몇 시간을 돌려도 정확도가 오르지 않는다. 맞는 처방은?',
      o: ['학습률을 바꿔 가며 더 오래 돌린다', '입력값을 0~1 사이로 정규화한다', '은닉층을 넣어 직선 여러 개를 조합하게 한다'], a: 2,
      why: 'XOR는 직선 하나로는 해가 아예 없는 문제라 오래 학습해도 찾을 답이 없다. 모델 구조를 바꿔 직선을 조합하게 해야 풀린다.' },
    { q: 'XOR 망에서 은닉 뉴런이 직선을 하나씩 긋던 역할을, 얼굴 인식 심층망에서는 어디가 맡나?',
      o: ['앞쪽 층의 엣지와 명암 감지', '중간 층의 눈과 코 감지', '마지막 층의 얼굴 판정'], a: 0,
      why: '앞쪽 층이 엣지 같은 단순한 경계를 잡고, 뒤 층이 그것을 부품과 개념으로 조합한다. 직선의 조합이 특징의 조합으로 커진 셈이다.' },
    { q: 'XOR를 푼 2층 망에서 은닉 뉴런 하나만 떼어 보면 무엇인가?',
      o: ['혼자서 곡선 경계를 만드는 뉴런', '직선 하나를 긋는 평범한 퍼셉트론', '입력을 그대로 다음 층에 넘기는 통로'], a: 1,
      why: 'h₁과 h₂는 각각 직선 하나를 긋는 퍼셉트론일 뿐이다. 구부러진 경계는 출력 뉴런이 두 직선의 결과를 조합할 때 생긴다.' },
  ];

  RA.page({ title: '퍼셉트론에서 MLP 까지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
