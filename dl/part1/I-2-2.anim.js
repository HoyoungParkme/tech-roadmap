/* I-2-2 손실 함수와 옵티마이저 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 손실 = 안개 낀 골짜기 지형(등고선), 학습 = 공이 기울기 반대로 내려가는 발자국.
 * 경로·손실 숫자는 페이지 STEPS 의 runs(실제 업데이트 식 계산 결과)와 코드 출력(벤브에서 실행)에서만 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, grow, cross, check, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, WARNBG, INFO, INFOBG, HL } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15.5, 'font-weight': 700, opacity: op }, a || {}));

  // ---------- 공통: 골짜기 지형 f = 0.5(x² + 10y²) ----------
  const WX = 24, WY = 30, SC = 80, LW = 512, LH = 272;          // 세계 [-3.2,3.2]×[-1.7,1.7] → 512×272 (가로세로 같은 축척)
  const PX = (x) => WX + (x + 3.2) * SC, PY = (y) => WY + (1.7 - y) * SC;
  const cl = ([x, y]) => [Math.max(-3.3, Math.min(3.3, x)), Math.max(-1.8, Math.min(1.8, y))];
  const LEV = [0.15, 0.6, 1.5, 3, 5, 8];
  function land(u, o) { o = o || {};
    el('rect', { x: WX, y: WY, width: LW, height: LH, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    const cp = el('clipPath', { id: 'i222c' }); el('rect', { x: WX, y: WY, width: LW, height: LH, rx: 8 }, cp);
    const g = el('g', { 'clip-path': 'url(#i222c)' });
    LEV.forEach((c, i) => { const f = o.grow ? E(u, 0.2 + i * 0.18, 0.7 + i * 0.18) : 1;
      if (f > 0) el('ellipse', { cx: PX(0), cy: PY(0), rx: Math.sqrt(2 * c) * SC, ry: Math.sqrt(0.2 * c) * SC, fill: 'none', stroke: i < 2 ? OFF : GRID, 'stroke-width': 1.6, pathLength: 100, 'stroke-dasharray': `${f * 100} 100` }, g); });
    tx(PX(0), PY(0) + 6, '★', { 'text-anchor': 'middle', 'font-size': 17, fill: ACC, opacity: o.grow ? fade(u, 1.3) : 1 });
    if (o.start !== false) { el('circle', { cx: PX(-2.7), cy: PY(1.3), r: 6, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: o.startOp ?? 1 }); }
    return g; }
  // 경로를 f(0→1) 만큼 그린다 (점 개수 기준)
  const out = ([x, y]) => Math.abs(x) > 3.3 || Math.abs(y) > 1.8;
  function trail(g, pts, f, col, o) { o = o || {}; if (f <= 0 || !pts) return; const cut = pts.findIndex(out), n = (cut > 0 ? cut : pts.length - 1), m = Math.max(1, Math.round(clamp(f) * n));
    if (cut > 0 && m >= n) tx(PX(cl(pts[cut])[0]) + 8, WY + 24, '↑ 발산', { 'font-size': 15, 'font-weight': 700, fill: col }, g);
    const ps = pts.slice(0, m + 1).map(cl).map(([x, y]) => `${PX(x).toFixed(1)},${PY(y).toFixed(1)}`);
    el('polyline', { points: ps.join(' '), fill: 'none', stroke: col, 'stroke-width': o.sw || 2.4, opacity: o.op ?? 0.9, 'stroke-linejoin': 'round' }, g);
    const [lx, ly] = cl(pts[m]); el('circle', { cx: PX(lx), cy: PY(ly), r: 5, fill: col, stroke: PANEL, 'stroke-width': 1.5 }, g); }
  // 로그 손실 곡선판
  function lossBox(x, y, w, h, lo, hi, o) { o = o || {};
    el('rect', { x: x - 44, y: y - 26, width: w + 56, height: h + 52, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.2 });
    tx(x - 34, y - 8, o.title || 'loss (log)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const Y = (v) => y + h - ((clamp(Math.log10(Math.max(v, 1e-30)), lo, hi) - lo) / (hi - lo)) * h;
    el('line', { x1: x, y1: y + h, x2: x + w, y2: y + h, stroke: MUT, 'stroke-width': 1.4 }); el('line', { x1: x, y1: y, x2: x, y2: y + h, stroke: MUT, 'stroke-width': 1.4 });
    (o.ticks || []).forEach((e) => { const yy = y + h - ((e - lo) / (hi - lo)) * h; el('line', { x1: x, y1: yy, x2: x + w, y2: yy, stroke: GRID, 'stroke-dasharray': '3 4' }); mono(x - 6, yy + 5, e === 0 ? '1' : `1e${e}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
    mono(x + w, y + h + 20, o.xl || 'iteration →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    return { curve(ls, f, col, n) { if (f <= 0 || !ls) return; const N = n || ls.length - 1, m = Math.max(1, Math.round(clamp(f) * (ls.length - 1)));
      el('polyline', { points: ls.slice(0, m + 1).map((v, i) => `${(x + (i / N) * w).toFixed(1)},${Y(v).toFixed(1)}`).join(' '), fill: 'none', stroke: col, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }); } }; }
  const runsOf = (b) => (b && b.runs) || [];
  const isNew = (c, r) => !runsOf(c.prev).some((q) => q.name === r.name);

  // ---------- 1. 손실 함수 선택 ----------
  const ZP = 0.0024726, GM = 2 * (ZP - 1) * ZP * (1 - ZP), GC = ZP - 1;   // z=-6 → p, 코드 출력 -0.00492 / -0.9975
  function s1(t, c) { const { k, u } = c;
    const ax = R.axes(70, 46, 380, 280, { x: [0, 1], y: [0, 1], xt: [0, 0.5, 1], yt: [0, 0.5, 1], xl: '예측 확률 p  (정답 y = 1)', yl: '|∂L/∂z|  기울기 크기' });
    if (k >= 3) { el('rect', { x: ax.X(0), y: ax.Y(1), width: ax.X(0.15) - ax.X(0), height: ax.h, fill: 'var(--badbg)', opacity: k === 3 ? fade(u, 0.3) : 1 });
      tx(ax.X(0) + 6, ax.Y(1) + 20, '확신에 찬 오답', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: k === 3 ? fade(u, 0.5) : 1 }); }
    const N = 80, mse = [], ce = [];
    for (let i = 0; i <= N; i++) { const p = 0.0025 + (i / N) * 0.995; mse.push([p, Math.abs(2 * (p - 1) * p * (1 - p))]); ce.push([p, Math.abs(p - 1)]); }
    if (k >= 1) { R.line(ax, mse, k === 1 ? E(u, 0.4, 1.8) : 1, MUT, { dash: '8 5', sw: 3 }); mono(ax.X(0.36), ax.Y(0.30) - 12, 'MSE', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: k === 1 ? fade(u, 1.6) : 1 }); }
    if (k >= 2) { R.line(ax, ce, k === 2 ? E(u, 0.4, 1.8) : 1, ACC, { sw: 3.2 }); mono(ax.X(0.62), ax.Y(0.42), 'CE', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 2 ? fade(u, 1.6) : 1 }); }
    if (k >= 3) { const s = k === 3 ? pop(u, 1.0) : 1;
      el('circle', { cx: ax.X(ZP), cy: ax.Y(Math.abs(GM)), r: 7 * s, fill: MUT, stroke: PANEL, 'stroke-width': 2 });
      el('circle', { cx: ax.X(ZP), cy: ax.Y(Math.abs(GC)), r: 7 * s, fill: ACC, stroke: PANEL, 'stroke-width': 2 }); }
    // 오른쪽
    if (k === 0) { const sx = R.axes(570, 70, 330, 170, { x: [-6, 6], y: [0, 1], xt: [-6, 0, 6], yt: [0, 1], xl: '로짓 z', yl: 'p = sigmoid(z)' });
      const sg = []; for (let i = 0; i <= 60; i++) { const z = -6 + i * 0.2; sg.push([z, 1 / (1 + Math.exp(-z))]); }
      R.line(sx, sg, E(u, 0.3, 1.5), INK, { sw: 3 });
      R.scatter(sx, [[-6, 0.0025, BAD], [6, 0.9975, GOOD]], { u: E(u, 1.5, 2.0), r: 7 });
      mono(570, 300, 'z = −6 → p ≈ 0.0025', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
      mono(570, 326, 'z = +6 → p ≈ 0.9975', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(735, 362, '← 이 p 가 왼쪽 그래프의 가로축', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 1) { card(735, 110, 340, 54, { rx: 10, stroke: MUT, text: 'mean((y − p)²)', fs: 18, mono: true, s: pop(u, 0.2) });
      sub(735, 160, 'mse_loss — 오차 제곱의 평균', fade(u, 0.6), { 'font-size': 15 });
      note(580, 220, '회귀(집값)에는 자연스럽다', fade(u, 1.0));
      note(580, 256, '확률 p 에 붙이면 기울기 모양이', fade(u, 1.6), { fill: MUT });
      note(580, 282, '가운데만 볼록하다 (회색 점선)', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 2) { card(735, 100, 360, 54, { rx: 10, stroke: ACC, text: '−mean(y·log p + (1−y)·log(1−p))', fs: 15, mono: true, color: ACC, s: pop(u, 0.2) });
      sub(735, 150, 'bce_loss — 이진 크로스엔트로피', fade(u, 0.6), { 'font-size': 15 });
      pill(735, 200, 'p = clip(p, 1e-7, 1 − 1e-7)', INK, pop(u, 1.0), { mono: true, fs: 14 }); sub(735, 232, 'log(0) = −∞ 방지', fade(u, 1.2), { 'font-size': 14 });
      note(580, 290, '기울기 = 직선 |p − y|  (청록 실선)', fade(u, 1.9), { fill: ACC }); return; }
    if (k === 3) { // 뉴런 하나: z → σ → p, 정답 y=1
      const s = pop(u, 0.3); el('circle', { cx: 620, cy: 140, r: 32 * s, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); mono(620, 146, 'z', { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', opacity: s });
      mono(620, 200, 'z = −6.0', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      grow(656, 140, 740, 140, E(u, 0.8, 1.2), INK); card(790, 140, 90, 48, { rx: 8, text: 'σ', fs: 20, s: pop(u, 1.0) });
      grow(838, 140, 880, 140, E(u, 1.2, 1.5), INK); mono(890, 132, 'p', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.4) });
      mono(890, 156, '0.0025', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
      card(735, 260, 300, 44, { rx: 8, stroke: GOOD, text: '정답 y = 1', fs: 16, color: GOOD, s: pop(u, 1.8) }); cross(905, 260, 11, pop(u, 2.1));
      sub(735, 316, '가장 크게 틀린 지점 = 붉은 띠', fade(u, 2.3), { 'font-size': 14.5, fill: BAD }); return; }
    if (k === 4) { tx(570, 80, 'MSE + sigmoid', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      R.spans(570, 118, [['∂L/∂z = 2(p−y)·', {}], ['p(1−p)', { fill: BAD, 'font-weight': 700 }]], { 'font-size': 17, opacity: fade(u, 0.4) });
      el('rect', { x: 718, y: 98, width: 70, height: 30, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.9) });
      sub(753, 150, 'p→0 이면 이 항 → 0', fade(u, 1.0), { fill: BAD, 'font-size': 14.5 });
      tx(570, 210, 'CE + sigmoid', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) });
      R.spans(570, 250, [['∂L/∂z = (p−y)', {}], ['  ·p(1−p)/p(1−p)', { fill: MUT }]], { 'font-size': 17, opacity: fade(u, 1.5) });
      const sk = E(u, 1.9, 2.3); if (sk > 0) el('line', { x1: 722, y1: 244, x2: 722 + 146 * sk, y2: 244, stroke: BAD, 'stroke-width': 3 });
      mono(570, 300, '= p − y', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) }); return; }
    if (k === 5) { mono(570, 70, 'p        = 0.0025', { 'font-size': 15, opacity: fade(u, 0.2) });
      tx(570, 120, 'MSE grad', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4) });
      R.hbar(570, 132, 260, Math.abs(GM), 1, { u: E(u, 0.5, 1.1), col: MUT, text: '−0.00492' });
      tx(570, 196, 'BCE grad', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      R.hbar(570, 208, 260, Math.abs(GC), 1, { u: E(u, 1.1, 1.8), col: ACC, text: '−0.9975' });
      card(735, 290, 300, 50, { rx: 10, stroke: BAD, text: '약 200배 차이', fs: 19, color: BAD, s: pop(u, 2.0) });
      sub(735, 338, '0.9975 / 0.00492 ≈ 203', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // k6 정리: 뉴런에 거꾸로 흐르는 기울기 화살
    el('circle', { cx: 650, cy: 120, r: 30, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); mono(650, 126, 'z', { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle' });
    tx(700, 92, '역전파로 z 를 미는 힘', { 'font-size': 14, fill: MUT });
    const a1 = E(u, 0.3, 0.9), a2 = E(u, 0.9, 1.7);
    if (a1 > 0) el('line', { x1: 690, y1: 120, x2: 690 + 4 * a1, y2: 120, stroke: MUT, 'stroke-width': 4 });
    mono(712, 126, 'MSE: −0.0049  (거의 0)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) });
    if (a2 > 0) el('line', { x1: 650, y1: 176, x2: 650 + 230 * a2, y2: 176, stroke: ACC, 'stroke-width': 6, 'marker-end': a2 > 0.97 ? 'url(#ra-ahb)' : null });
    mono(650, 206, 'CE: −0.9975  (틀린 만큼)', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.5) });
    card(740, 268, 360, 46, { rx: 10, stroke: ACC, text: '분류 = CE · 기울기 p − y', fs: 16, color: ACC, s: pop(u, 1.9) });
    sub(740, 318, 'softmax + cross_entropy 도 기울기 p − y', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 2. 경사하강과 학습률 ----------
  const LRC = [WARN, GOOD, BAD], LRN = ['lr=0.02', 'lr=0.09', 'lr=0.21'];
  function s2(t, c) { const { k, u } = c, runs = runsOf(c.beat);
    const g = land(u, { grow: k === 0, startOp: k < 2 ? 0 : k === 2 ? pop(u, 0.3) : 1 });
    if (k === 0) { mono(740, 80, 'f(x, y) = 0.5(x² + 10y²)', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      const pa = R.axes(620, 120, 250, 170, { x: [-1.5, 1.5], y: [0, 6], xt: [-1, 0, 1], yt: [0, 5] });
      const xs = [], ys = []; for (let i = 0; i <= 60; i++) { const v = -1.5 + i * 0.05; xs.push([v, 0.5 * v * v]); if (5 * v * v <= 6.2) ys.push([v, 5 * v * v]); }
      R.line(pa, xs, E(u, 0.8, 1.6), INFO, { sw: 3 }); R.line(pa, ys, E(u, 1.4, 2.2), BAD, { sw: 3 });
      mono(pa.X(1.5), pa.Y(1.1) - 6, 'x 단면', { 'font-size': 14, fill: INFO, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.5) });
      mono(pa.X(1.1) + 30, pa.Y(5.2), 'y 단면', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) });
      sub(745, 345, '곡률 x : y = 1 : 10 → 납작한 타원', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 1) { const P = [[-2.2, 0.9], [-1.4, -0.9], [1.2, 0.8], [2.3, -0.5], [0.3, 1.1], [-2.6, -0.3], [1.8, 0.2], [-0.6, 0.5]];
      P.forEach(([x, y], i) => { const f = E(u, 0.3 + i * 0.12, 0.8 + i * 0.12), gx = -x * 0.09, gy = -10 * y * 0.09;
        grow(PX(x), PY(y), PX(x + gx), PY(y + gy), f, INFO, { sw: 2.4 }); el('circle', { cx: PX(x), cy: PY(y), r: 3.5, fill: INK, opacity: f > 0 ? 1 : 0 }, g); });
      mono(580, 80, '∇L = [x, 10y]', { 'font-size': 19, 'font-weight': 800, opacity: fade(u, 0.3) });
      sub(745, 110, '파란 화살 = −∇L (내려가는 방향)', fade(u, 0.6), { 'font-size': 14.5, fill: INFO });
      tx(580, 170, '출발점 (−2.7, 1.3) 에서', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.3) });
      tx(580, 210, '|gx|', { 'font-size': 15, opacity: fade(u, 1.4) }); R.hbar(630, 196, 220, 2.7, 13, { u: E(u, 1.5, 2.0), col: INFO, text: '2.7' });
      tx(580, 250, '|gy|', { 'font-size': 15, opacity: fade(u, 1.6) }); R.hbar(630, 236, 220, 13, 13, { u: E(u, 1.7, 2.2), col: BAD, text: '13.0' });
      sub(745, 300, '걸음이 y 방향으로 쏠린다', fade(u, 2.3), { 'font-size': 15, fill: BAD }); return; }
    if (k === 2) { tx(PX(-2.7) + 10, PY(1.3) - 12, '출발', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(580, 90, 'w = np.array([-2.7, 1.3])', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) });
      mono(580, 130, 'loss(w₀) = 12.095', { 'font-size': 16, fill: MUT, opacity: fade(u, 0.9) });
      tx(580, 190, 'history', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
      cells(580, 205, ['w₀', '', '', '', ''], { w: 62, h: 40, style: (i) => (i === 0 ? { stroke: INK, s: pop(u, 1.5) } : { stroke: GRID, dash: '4 4', op: fade(u, 1.6) }) });
      sub(745, 300, '세 실험 모두 같은 출발점 · 60걸음', fade(u, 2.1), { 'font-size': 15 }); sub(745, 326, '바뀌는 것은 lr 하나', fade(u, 2.3), { 'font-size': 15, fill: ACC }); return; }
    // k ≥ 3: 경로들
    runs.forEach((r, i) => { const f = k === 3 && i === 0 ? E(u, 0.9, 2.4) : isNew(c, r) ? E(u, 0.4, 2.0) : 1; trail(g, r.pts, f, LRC[i]); });
    const lb = lossBox(630, 236, 290, 110, -5, 4, { ticks: [-4, 0, 4] });
    runs.forEach((r, i) => lb.curve(r.losses, k === 3 && i === 0 ? E(u, 0.9, 2.4) : isNew(c, r) ? E(u, 0.4, 2.0) : 1, LRC[i], 60));
    runs.forEach((r, i) => pill(612 + i * 108, 384, LRN[i], LRC[i], 1, { fs: 13.5, mono: true }));
    if (k === 3) { mono(560, 60, 'w = w − lr · grad(w)', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.2) });
      mono(560, 100, 'w₁ = (−2.7, 1.3) − 0.02·(−2.7, 13)', { 'font-size': 14.5, opacity: fade(u, 0.5) });
      mono(560, 128, '   = (−2.646, 1.04)', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.8) });
      mono(560, 170, '60걸음 뒤 loss 0.322721', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    if (k === 4) { card(745, 80, 360, 46, { rx: 8, stroke: BAD, text: 'if np.abs(w).max() > 1e6: break', fs: 14.5, mono: true, s: pop(u, 0.2) });
      sub(745, 122, '값이 폭주하면 즉시 중단 (NaN 직전)', fade(u, 0.6), { 'font-size': 14.5 });
      mono(560, 172, 'lr=0.09 → 60걸음 뒤 loss 0.000044', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 5) { R.terminal(560, 40, 380, 146, [['$ python gradient_descent.py', null], ['lr=0.02  steps=60  final loss=0.322721', null], ['lr=0.09  steps=60  final loss=0.000044', null], ['lr=0.21  steps=60  final loss=783391.6', null]], 1 + 3 * E(u, 0.6, 2.2), { fs: 13.5, title: 'output' });
      sub(750, 202, '0.21: |y| 가 395 까지 커져도 1e6 미만 → 끝까지 돈다', fade(u, 2.3), { 'font-size': 13.5, fill: BAD }); return; }
    if (k === 6) { tx(560, 62, 'y 축 한 걸음 배율 |1 − 10·lr|', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      [[0.02, 0.8], [0.09, 0.1], [0.21, 1.1]].forEach(([lr, m], i) => { const y = 82 + i * 36; mono(560, y + 15, String(lr), { 'font-size': 14.5, fill: LRC[i], 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.3) });
        R.hbar(610, y, 230, m, 1.2, { u: E(u, 0.5 + i * 0.3, 1.0 + i * 0.3), col: LRC[i], text: m.toFixed(1) }); });
      const x1 = 610 + 230 / 1.2; el('line', { x1, y1: 76, x2: x1, y2: 194, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.6) });
      mono(x1 - 8, 214, '1 = 임계', { 'font-size': 13.5, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 1.7) });
      card(872, 209, 140, 32, { rx: 8, stroke: BAD, text: 'lr < 2/λ = 0.2', fs: 13.5, mono: true, color: BAD, s: pop(u, 2.1) }); return; }
    // k7 실무 탐색: 3배씩 올리는 사다리
    const L = ['3e-4', '1e-3', '3e-3', '1e-2'];
    tx(560, 62, '곡률을 모를 때: 3배씩 올린다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
    L.forEach((s, i) => { const x = 600 + i * 92, y = 170 - i * 26, a = 0.4 + i * 0.4; card(x, y, 76, 32, { rx: 6, text: s, fs: 14.5, mono: true, stroke: i === 3 ? BAD : INK, color: i === 3 ? BAD : INK, s: pop(u, a) });
      if (i) grow(x - 92 + 38, y + 26, x - 38, y + 4, E(u, a - 0.2, a), MUT, { sw: 1.8 }); });
    cross(876, 128, 9, pop(u, 2.0)); sub(780, 212, '발산 직전 값 바로 아래를 쓴다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 3. SGD 와 미니배치 ----------
  const BC = [GOOD, BAD, INFO], BN = ['전체 배치', 'batch=1', 'batch=32'];
  function s3(t, c) { const { k, u } = c, runs = runsOf(c.beat);
    const g = land(u, {});
    const showRun = (i) => (i === 0 ? k >= 1 : true);
    runs.forEach((r, i) => { if (!showRun(i)) return; const f = (k === 1 && i === 0) || (isNew(c, r) && k > 1) ? E(u, 0.4, 2.2) : 1; trail(g, r.pts, f, BC[i], { sw: i === 1 ? 2 : 2.4 }); });
    runs.forEach((r, i) => { if (showRun(i)) pill(96 + i * 150, 384, BN[i], BC[i], 1, { fs: 13.5 }); });
    if (k === 0) { tx(570, 60, '학습 데이터', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      for (let i = 0; i < 240; i++) { const r = Math.floor(i / 20), q = i % 20; el('rect', { x: 572 + q * 17, y: 76 + r * 17, width: 13, height: 13, rx: 2, fill: ACC, opacity: 0.25 + 0.6 * clamp(u * 2.2 - i / 140) }); }
      mono(572, 300, 'N_TOTAL = 50_000', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(572, 334, 'rng = default_rng(42)', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { for (let i = 0; i < 60; i++) { const r = Math.floor(i / 12), q = i % 12; const sx = 590 + q * 22, sy = 70 + r * 22, f = E(u, 0.3 + (i % 12) * 0.04, 1.3 + (i % 12) * 0.04);
        el('circle', { cx: lerp(sx, 720, f), cy: lerp(sy, 250, f), r: 5, fill: ACC, opacity: 1 - 0.7 * f }); }
      card(720, 260, 200, 44, { rx: 8, stroke: GOOD, text: '평균 = true_grad', fs: 15, color: GOOD, s: pop(u, 1.4) });
      mono(720, 312, '[x, 10y]  노이즈 0', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      sub(720, 344, '한 걸음 = forward/backward 5만 번', fade(u, 2.1), { 'font-size': 14.5, fill: BAD }); return; }
    if (k === 2) { const ax = R.axes(600, 70, 300, 200, { x: [-0.5, 5.5], y: [0, 2], yt: [0, 1, 2], yl: 'σ = 1.8 / √batch' });
      [[1, 1.8], [4, 0.9], [16, 0.45], [32, 0.3182], [64, 0.225], [256, 0.1125]].forEach(([b, s], i) => { const f = E(u, 0.3 + i * 0.22, 0.7 + i * 0.22), hi = b === 32;
        el('rect', { x: ax.X(i) - 17, y: ax.Y(s * f), width: 34, height: ax.Y(0) - ax.Y(s * f), rx: 3, fill: hi ? INFO : OFF });
        mono(ax.X(i), ax.Y(0) + 20, String(b), { 'font-size': 13.5, 'text-anchor': 'middle', fill: hi ? INFO : MUT, 'font-weight': hi ? 700 : 400 });
        if (f > 0.9) mono(ax.X(i), ax.Y(s) - 8, s.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'middle', fill: hi ? INFO : INK }); });
      sub(750, 330, 'batch 4배 → 노이즈 ½ · batch=32 → 1/5.7', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 3) { const ox = 700, oy = 210; grow(ox, oy, ox + 160, oy - 60, E(u, 0.3, 0.8), GOOD, { sw: 3.5 });
      const J = [[40, 70], [-50, 30], [80, -40], [-20, -80], [60, 55], [-70, -10]];
      J.forEach(([dx, dy], i) => grow(ox, oy, ox + 160 + dx, oy - 60 + dy, E(u, 0.9 + i * 0.2, 1.2 + i * 0.2), BAD, { sw: 1.8 }));
      tx(580, 80, 'batch=1 의 기울기 = 진짜 + 잡음', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(580, 110, 'σ = 1.8 / √1 = 1.8', { 'font-size': 15, fill: BAD, opacity: fade(u, 0.6) });
      sub(745, 330, '방향이 매 걸음 튄다 · 대신 한 걸음 값은 1/50000', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4) { mono(570, 100, 'w = w − lr · ', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.2) });
      const sw = E(u, 0.9, 1.5); mono(712, 100 - 24 * sw, 'grad(w)', { 'font-size': 17, fill: MUT, opacity: 1 - sw, 'text-decoration': 'line-through' });
      mono(712, 100 + 24 * (1 - sw), 'minibatch_grad(w, bs)', { 'font-size': 17, 'font-weight': 700, fill: ACC, opacity: sw });
      pill(650, 170, 'lr = 0.09 그대로', INK, pop(u, 1.6), { fs: 14.5 }); pill(830, 170, '60걸음', INK, pop(u, 1.8), { fs: 14.5 });
      sub(745, 250, 'SGD = 기울기 자리에 "싼 추정치"', fade(u, 2.1), { 'font-size': 15.5, fill: ACC }); return; }
    if (k === 5) { tx(570, 60, '60걸음 총 계산량 (log)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      [['전체 50000', 3e6, '3,000,000', GOOD], ['batch=1', 60, '60', BAD], ['batch=32', 1920, '1,920', INFO]].forEach(([n, v, s, col], i) => { const y = 80 + i * 40;
        tx(570, y + 15, n, { 'font-size': 14, opacity: fade(u, 0.3 + i * 0.3) }); R.hbar(668, y, 170, Math.log10(v), 6.5, { u: E(u, 0.4 + i * 0.3, 1.0 + i * 0.3), col, text: s }); });
      tx(570, 228, '최종 위치 (코드 출력)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.5) });
      [['[-0.009  0.   ]', GOOD], ['[ 0.614  0.089]', BAD], ['[-0.007  0.003]', INFO]].forEach(([s, col], i) => mono(580, 256 + i * 26, s, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, 1.7 + i * 0.2) }));
      sub(860, 290, 'batch=32 ≈ 전체', fade(u, 2.4), { 'font-size': 14, fill: INFO }); return; }
    // k6 결론
    tx(570, 60, '1 epoch (5만 장) 동안의 걸음 수', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
    tx(570, 100, '전체 배치', { 'font-size': 14 }); el('rect', { x: 680, y: 88, width: 14, height: 16, rx: 2, fill: GOOD, opacity: fade(u, 0.4) }); mono(910, 101, '1', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: GOOD });
    tx(570, 140, 'batch=32', { 'font-size': 14 }); for (let i = 0; i < 40; i++) el('rect', { x: 680 + i * 5.6, y: 128, width: 3.6, height: 16, fill: INFO, opacity: clamp(u * 2 - 0.6 - i / 40) });
    mono(910, 162, '1,562', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: INFO, opacity: fade(u, 1.3) });
    pill(640, 220, '노이즈 1/5.7', INFO, pop(u, 1.5), { fs: 14 }); pill(780, 220, 'GPU 병렬 ≈ 공짜', INFO, pop(u, 1.8), { fs: 14 });
    pill(720, 268, '노이즈 → 안장점 탈출', GOOD, pop(u, 2.1), { fs: 14 }); }

  // ---------- 4. 옵티마이저 경주 ----------
  const OC = [MUT, INFO, WARN, ACC], ON = ['SGD', 'Momentum', 'RMSProp', 'Adam'], OLR = ['0.16', '0.02', '0.10', '0.12'];
  const FIN = [2.80e-12, 1.15e-3, 2.52e-11, 2.12e-3];                  // optimizers.py 실행 출력 (final loss)
  function s4(t, c) { const { k, u } = c, runs = runsOf(c.beat);
    const g = land(u, {}), run = E(u, 0.3, 2.5);
    runs.forEach((r, i) => { const f = k <= 3 ? (isNew(c, r) ? run : 1) : k === 5 ? run : 1; trail(g, r.pts, f, OC[i], { sw: i === 3 ? 3 : 2.3 }); });
    runs.forEach((r, i) => pill([70, 200, 345, 475][i], 384, `${ON[i]} ${OLR[i]}`, OC[i], 1, { fs: 13.5 }));
    const iter = Math.round((k <= 3 || k === 5 ? run : 1) * 80);
    mono(WX + LW - 10, WY + 22, `iter ${iter} / 80`, { 'font-size': 14, 'text-anchor': 'end', fill: MUT, 'font-weight': 700 });
    if (k === 0) { card(745, 90, 340, 50, { rx: 10, stroke: MUT, text: 'w − lr · g', fs: 19, mono: true, s: pop(u, 0.2) });
      pill(745, 150, '상태: 없음', MUT, pop(u, 0.5), { fs: 14.5 });
      note(580, 220, 'y 성분이 10배 → 매 걸음 y 로 과하게 밀림', fade(u, 1.2));
      sub(745, 260, '첫 20걸음 동안 y 부호가 매번 뒤집힌다 (지그재그)', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 1) { card(745, 80, 340, 46, { rx: 10, stroke: INFO, text: 'v = 0.9·v − lr·g ;  w += v', fs: 16, mono: true, color: INFO, s: pop(u, 0.2) });
      const ox = 620, oy = 230; grow(ox, oy, ox + 140, oy - 40, E(u, 0.6, 1.0), MUT, { sw: 3 }); tx(ox + 40, oy - 40, '0.9·v (관성)', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      grow(ox + 140, oy - 40, ox + 200, oy + 10, E(u, 1.1, 1.5), BAD, { sw: 3 }); tx(ox + 186, oy + 34, '−lr·g', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.3) });
      grow(ox, oy, ox + 200, oy + 10, E(u, 1.6, 2.1), INFO, { sw: 4 }); tx(ox + 70, oy + 34, '새 v', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.9) });
      sub(745, 330, '뒤집히는 y 는 상쇄, 꾸준한 x 는 누적', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 2) { card(745, 80, 360, 46, { rx: 10, stroke: WARN, text: 's = 0.9·s + 0.1·g² ; w −= lr·g/√s', fs: 14.5, mono: true, color: WARN, s: pop(u, 0.2) });
      tx(580, 160, '출발점 기울기', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) }); mono(700, 160, 'gx −2.7 · gy 13.0', { 'font-size': 14.5, opacity: fade(u, 0.6) });
      tx(580, 210, '첫 걸음 보폭', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.1) });
      R.hbar(700, 196, 120, 0.316, 0.4, { u: E(u, 1.2, 1.6), col: WARN, text: 'x 0.316' }); R.hbar(700, 226, 120, 0.316, 0.4, { u: E(u, 1.4, 1.8), col: WARN, text: 'y 0.316' });
      sub(745, 300, '기울기로 나눠서 두 축 보폭이 같아진다 → 직진', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 3) { tx(580, 80, 'Adam 이 들고 다니는 상태', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      [['m', '1차 모멘트 = 방향 (Momentum)', INFO], ['s', '2차 모멘트 = 보폭 (RMSProp)', WARN], ['t', '스텝 수 (편향 보정용)', INK]].forEach(([n, d, col], i) => { const y = 120 + i * 52;
        card(608, y, 46, 40, { rx: 8, text: n, fs: 18, mono: true, stroke: col, color: col, s: pop(u, 0.5 + i * 0.4) }); tx(646, y + 6, d, { 'font-size': 14.5, opacity: fade(u, 0.6 + i * 0.4) }); });
      sub(745, 300, 'b1 = 0.9 · b2 = 0.999 · eps = 1e-8', fade(u, 2.1), { 'font-size': 14.5, class: 'mono' }); return; }
    if (k === 4) { tx(570, 62, '0 에서 시작한 m 의 편향:  1 − 0.9ᵗ', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      [0.1, 0.19, 0.271, 0.344, 0.41].forEach((v, i) => { const x = 600 + i * 62, h = 130 * v / 0.45 * E(u, 0.4 + i * 0.15, 0.8 + i * 0.15);
        el('rect', { x, y: 220 - h, width: 40, height: h, rx: 3, fill: INFO, opacity: 0.8 }); mono(x + 20, 240, `t=${i + 1}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); mono(x + 20, 214 - h, v.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.8 + i * 0.15) }); });
      mono(570, 286, 't=1: m = 0.1·g  →  m̂ = m / 0.1 = g', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      mono(570, 316, '첫 걸음 = lr·g/|g| = 0.12 (각 축)', { 'font-size': 14.5, opacity: fade(u, 2.1) }); return; }
    if (k === 5) { tx(580, 70, '조건 통일', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      pill(650, 116, '같은 지형', INK, pop(u, 0.3), { fs: 14.5 }); pill(790, 116, '같은 출발점', INK, pop(u, 0.5), { fs: 14.5 }); pill(700, 162, '80걸음', INK, pop(u, 0.7), { fs: 14.5 });
      ON.forEach((n, i) => mono(590 + (i % 2) * 180, 220 + Math.floor(i / 2) * 30, `${n} lr=${OLR[i]}`, { 'font-size': 14.5, fill: OC[i], 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.2) }));
      sub(745, 300, 'lr 만 각자 맞춰 줬다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 6) { const lb = lossBox(610, 70, 310, 230, -12, 2, { ticks: [-12, -8, -4, 0] }); runs.forEach((r, i) => lb.curve(r.losses, E(u, 0.3, 2.3), OC[i], 80));
      sub(765, 370, '회색 SGD 가 가장 빨리 떨어지고 Momentum·Adam 은 출렁인다', fade(u, 2.3), { 'font-size': 13.5 }); return; }
    if (k === 7) { tx(570, 62, '80걸음 뒤 final loss (낮을수록 좋음)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      const ord = [0, 2, 1, 3], TXT = ['2.80e-12', '1.15e-03', '2.52e-11', '2.12e-03'];
      ord.forEach((i, j) => { const y = 84 + j * 44; tx(570, y + 15, ON[i], { 'font-size': 14.5, fill: OC[i], 'font-weight': 700, opacity: fade(u, 0.4 + j * 0.3) });
        R.hbar(670, y, 170, -Math.log10(FIN[i]), 12, { u: E(u, 0.5 + j * 0.3, 1.1 + j * 0.3), col: OC[i], text: TXT[i] }); });
      sub(745, 282, '막대 = −log10(loss): 길수록 바닥에 가깝다', fade(u, 1.8), { 'font-size': 14 });
      note(570, 326, '이 골짜기에선 lr 을 맞춘 SGD 가 이긴다', fade(u, 2.2), { fill: BAD }); return; }
    // k8 lr 민감도 (추가 beat)
    const LR = ['0.01', '0.03', '0.1', '0.3', '1.0'], SG = ['7.3e-1', '2.8e-2', '1.7e-7', '1.2e+49', '4.0e+153'], AD = ['3.6e+0', '2.8e-1', '4.9e-4', '2.9e-4', '1.3e-3'];
    tx(570, 56, '같은 lr 을 줬을 때 80걸음 뒤 loss', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
    LR.forEach((s, j) => mono(650 + j * 62, 92, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700, opacity: fade(u, 0.3) }));
    [['SGD', SG, MUT], ['Adam', AD, ACC]].forEach(([n, vals, col], r) => { const y = 108 + r * 56; tx(566, y + 27, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + r * 0.6) });
      vals.forEach((v, j) => { const bad = v.includes('+49') || v.includes('+153'), f = pop(u, 0.5 + r * 0.6 + j * 0.12);
        card(650 + j * 62, y + 22, 58, 42, { rx: 6, text: bad ? '발산' : v, fs: bad ? 14 : 13.5, mono: !bad, stroke: bad ? BAD : GRID, color: bad ? BAD : INK, fill: bad ? 'var(--badbg)' : PANEL, s: f, sw: 1.5 }); }); });
    note(570, 258, 'SGD 는 lr 0.3 부터 발산 (1e+49)', fade(u, 1.9), { fill: BAD });
    note(570, 290, 'Adam 은 0.1~1.0 에서 모두 1e-3 안팎', fade(u, 2.1), { fill: ACC });
    sub(745, 330, 'Adam 이 기본값인 이유 = lr 을 덜 탄다', fade(u, 2.4), { 'font-size': 15, fill: ACC }); }

  // ---------- 5. 실무 기본값 ----------
  const lrAt = (s) => (s < 500 ? s / 500 : 0.5 * (1 + Math.cos(Math.PI * (s - 500) / 9500))) * 3e-4;
  function sched(u, k) { const ax = R.axes(80, 60, 520, 250, { x: [0, 10000], y: [0, 3.3e-4], xt: [0, 5000, 10000], xl: 'step', yl: 'lr' });
    [0, 1.5e-4, 3e-4].forEach((v) => { mono(ax.x - 8, ax.Y(v) + 5, v ? v.toExponential(1).replace('e-4', 'e-4') : '0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); el('line', { x1: ax.x, y1: ax.Y(v), x2: ax.x + ax.w, y2: ax.Y(v), stroke: GRID, 'stroke-dasharray': '3 4' }); });
    const band = k === 2 ? E(u, 0.5, 1.2) : 1; el('rect', { x: ax.X(0), y: ax.y, width: (ax.X(500) - ax.X(0)) * band, height: ax.h, fill: HL, opacity: 0.6 });
    mono(ax.X(500) + 6, ax.y + 18, 'WARMUP 500', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.2) : 1 });
    const wu = k === 3 ? E(u, 0.4, 1.4) : k > 3 ? 1 : 0, cu = k === 4 ? E(u, 0.4, 2.2) : k > 4 ? 1 : 0;
    if (wu > 0) R.line(ax, [[0, 0], [500 * wu, 3e-4 * wu]], 1, ACC, { sw: 3.2 });
    if (cu > 0) { const P = []; for (let i = 0; i <= 60; i++) { const s = 500 + (9500 * i) / 60; P.push([s, lrAt(s)]); } R.line(ax, P, cu, ACC, { sw: 3.2 }); }
    return ax; }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const COL = [[110, 8, '784'], [300, 6, '256'], [490, 5, '10']], pos = COL.map(([x, n]) => Array.from({ length: n }, (_, i) => [x, 80 + (i + 0.5) * (250 / n)]));
      pos.slice(0, 2).forEach((L, li) => L.forEach(([x1, y1], i) => pos[li + 1].forEach(([x2, y2], j) => { const f = E(u, 0.4 + li * 0.5, 0.9 + li * 0.5); if (f > 0) el('line', { x1, y1, x2: lerp(x1, x2, f), y2: lerp(y1, y2, f), stroke: GRID, 'stroke-width': 1 }); })));
      pos.forEach((L, li) => { L.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 11 * pop(u, 0.2 + li * 0.5), fill: PANEL, stroke: li === 2 ? ACC : INK, 'stroke-width': 2 })); lbl(COL[li][0], 360, COL[li][2], fade(u, 0.3 + li * 0.5), { class: 'mono' }); });
      sub(205, 62, 'Linear + ReLU', fade(u, 0.8), { 'font-size': 14 }); sub(395, 62, 'Linear', fade(u, 1.3), { 'font-size': 14 });
      grow(520, 205, 610, 205, E(u, 1.6, 2.0), ACC); card(760, 205, 270, 56, { rx: 10, stroke: ACC, text: 'CrossEntropyLoss()', fs: 17, mono: true, color: ACC, s: pop(u, 1.9) });
      sub(760, 262, '분류 → CE (Step 1 의 결론)', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1) { card(480, 70, 560, 48, { rx: 10, stroke: ACC, text: 'AdamW(params, lr=3e-4, weight_decay=0.01)', fs: 16, mono: true, color: ACC, s: pop(u, 0.2) });
      tx(110, 160, 'Adam + L2', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.7) });
      R.spans(110, 196, [['g ← g + λ·w', { fill: BAD }], ['  →  w −= lr·m̂/√ŝ', {}]], { 'font-size': 16, opacity: fade(u, 0.9) });
      sub(320, 226, '감쇠가 √ŝ 로 나뉘어 축마다 세기가 달라진다', fade(u, 1.2), { 'font-size': 14.5, fill: BAD });
      tx(110, 280, 'AdamW', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      R.spans(110, 316, [['w −= lr·m̂/√ŝ', {}], ['  −  lr·λ·w', { fill: ACC, 'font-weight': 700 }]], { 'font-size': 16, opacity: fade(u, 1.8) });
      sub(320, 346, 'weight decay 를 업데이트에서 분리 → Transformer 표준', fade(u, 2.2), { 'font-size': 14.5, fill: ACC });
      pill(800, 280, 'lr = 3e-4 (첫 시도)', ACC, pop(u, 2.3), { fs: 14.5 }); return; }
    if (k >= 2 && k <= 5) { const ax = sched(u, k);
      if (k === 2) { mono(640, 110, 'TOTAL_STEPS = 10_000', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(640, 140, 'WARMUP      = 500', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.8) });
        card(780, 210, 170, 46, { rx: 10, stroke: WARN, text: '500 / 10,000 = 5%', fs: 15, mono: true, color: WARN, s: pop(u, 1.6) }); return; }
      if (k === 3) { mono(640, 110, 'step < 500:', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(640, 138, '  return step / WARMUP', { 'font-size': 15, opacity: fade(u, 0.4) });
        mono(640, 190, 'step 250 → 1.5e-4', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.5) }); mono(640, 216, 'step 500 → 3.0e-4', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) });
        sub(780, 270, 'Adam 의 m·s 가 쌓일 시간을 준다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
      if (k === 4) { mono(640, 110, '0.5·(1 + cos(π·progress))', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
        sub(780, 140, 'progress = 남은 구간 진행률 0 → 1', fade(u, 0.5), { 'font-size': 14 });
        mono(640, 200, 'step 5250 → 1.5e-4', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.6) }); mono(640, 226, 'step 10000 → 0', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 2.0) });
        sub(780, 280, '끝에서 보폭이 줄어 최소점 주변을 덜 튕긴다', fade(u, 2.2), { 'font-size': 14 }); return; }
      const s = 10000 * E(u, 0.4, 2.4), v = lrAt(s); el('circle', { cx: ax.X(s), cy: ax.Y(v), r: 7, fill: INK, stroke: PANEL, 'stroke-width': 2 });
      mono(640, 110, 'LambdaLR(optimizer, lr_lambda)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(640, 160, `step ${Math.round(s).toString().padStart(5)}`, { 'font-size': 15, opacity: fade(u, 0.4) });
      mono(640, 188, `lr = 3e-4 × ${(v / 3e-4).toFixed(2)}`, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) });
      sub(780, 250, '매 스텝 배율(0~1)을 초기 lr 에 곱한다', fade(u, 1.0), { 'font-size': 14 }); return; }
    if (k === 6) { const CH = ['zero_grad', 'loss = criterion(model(xb), yb)', 'backward', 'clip_grad_norm_ 1.0', 'optimizer.step', 'scheduler.step'];
      CH.forEach((s, i) => { const x = 110 + (i % 3) * 300, y = 120 + Math.floor(i / 3) * 120, a = 0.3 + i * 0.35; card(x + 40, y, i === 1 ? 270 : 210, 46, { rx: 10, text: s, fs: i === 1 ? 13.5 : 15, mono: true, stroke: i === 3 ? WARN : INK, color: i === 3 ? WARN : INK, s: pop(u, a) });
        mono(x - 70, y - 30, String(i + 1), { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, a) });
        if (i % 3 !== 2) grow(x + 150, y, x + 190, y, E(u, a + 0.2, a + 0.35), MUT); });
      grow(750, 150, 160, 220, E(u, 1.0, 1.3), MUT, { dash: '4 4' });
      sub(480, 330, 'zero_grad 를 빠뜨리면 기울기가 누적 = lr 을 키운 것과 같다', fade(u, 2.4), { 'font-size': 15, fill: BAD }); return; }
    if (k === 7) { const ax = R.axes(90, 60, 420, 250, { x: [0, 10], y: [0, 10], xl: 'step', yl: 'loss' });
      const P = [[0, 6], [1, 5], [2, 4.4], [3, 4.0], [4, 3.9], [5, 5.0], [6, 7.5], [6.6, 9.8]]; R.line(ax, P, E(u, 0.2, 1.4), BAD, { sw: 3 });
      mono(ax.X(6.8), ax.Y(9.6), 'NaN', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      sub(300, 360, '모양만 그린 예시', fade(u, 0.5), { 'font-size': 13.5 });
      card(740, 120, 340, 46, { rx: 10, stroke: BAD, text: 'if not torch.isfinite(loss): raise', fs: 14.5, mono: true, color: BAD, s: pop(u, 1.4) });
      card(740, 200, 230, 50, { rx: 25, fill: BAD, stroke: 'none', text: '즉시 중단', fs: 17, color: PANEL, s: pop(u, 1.8) });
      mono(740, 270, '처방: lr ÷ 3', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.2) }); return; }
    // k8 진단 로그 + 체크리스트
    mono(60, 60, 'step   100  loss …  lr …  gnorm …', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.2) });
    tx(60, 100, '손실이 안 떨어질 때', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) });
    const CK = [['loss 가 NaN/Inf 로 폭발', 'lr ÷ 3 + gradient clipping(1.0)', BAD], ['loss 가 처음부터 안 떨어짐', 'lr ×3 · 데이터 셔플/라벨 매칭 확인', WARN], ['분류인데 loss 정체', '손실이 CE 인지 확인 (MSE 면 기울기 죽음)', WARN], ['gnorm 이 ~0 에 붙음', '기울기 소실 → 손실/활성함수 재점검', WARN], ['train 좋고 val 나쁨', '과적합 → weight_decay · 증강', INFO]];
    CK.forEach(([q, a, col], i) => { const y = 120 + i * 50, f = fade(u, 0.6 + i * 0.35);
      el('rect', { x: 60, y, width: 840, height: 40, rx: 8, fill: PANEL, stroke: col, 'stroke-width': 1.8, opacity: f });
      tx(76, y + 26, q, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: f }); tx(420, y + 26, '→ ' + a, { 'font-size': 14.5, opacity: f }); }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '정답 y=1인데 p≈0.0025인 "확신에 찬 오답"에서 MSE 기울기는 어떻게 되나?',
      o: ['약 −0.9975로 크게 밀어준다', '약 −0.0049로 거의 0이라 학습이 멈춘다', '정확히 0이 되어 에러가 난다'], a: 1,
      why: 'MSE 기울기에는 sigmoid 미분 p(1−p)가 곱해져 남아 0에 붙는다. 크로스엔트로피는 이 항이 약분돼 p − y = −0.9975로 약 200배 크다.' },
    { q: '가장 가파른 축의 곡률이 10인 골짜기에서, 경사하강이 발산하기 시작하는 lr 경계는?',
      o: ['0.2', '0.02', '1.0'], a: 0,
      why: '임계 lr은 2/λ = 2/10 = 0.2다. 그래서 lr=0.21은 반대편 벽으로 튕기며 발산하고, lr=0.09는 골짜기 바닥에 도달한다.' },
    { q: 'batch=32 미니배치의 기울기 노이즈(표준편차)는 표본 1개와 비교해 어떻게 되나?',
      o: ['1/32로 준다', '약 1/5.7로 준다', '변하지 않는다'], a: 1,
      why: '노이즈는 배치 크기의 제곱근에 반비례(1/√n)하므로 √32 ≈ 5.7배 줄어든다. GPU 병렬 덕에 비용은 거의 1개 수준이라 실무는 미니배치를 쓴다.' },
    { q: '이 장의 실험이 보여 준, Adam이 사실상 기본값인 이유는?',
      o: ['상태를 갖지 않아 가장 가벼워서', '어떤 지형에서든 최종 손실이 가장 낮아서', 'lr을 틀려도 잘 발산하지 않아서'], a: 2,
      why: '골짜기 경주에서는 lr을 맞춘 SGD(2.80e-12)가 Adam(2.12e-03)을 이겼다. 하지만 같은 lr을 주면 SGD는 0.3부터 발산하고 Adam은 0.1~1.0 모두 1e-3 안팎에 머문다.' },
    { q: '이 장이 권하는 Transformer 학습의 첫 설정은?',
      o: ['AdamW(lr=3e-4) + 워밍업 + 코사인 감쇠', 'SGD(lr=0.21) 고정', 'Adam + L2 정규화, lr=0.1'], a: 0,
      why: 'AdamW는 weight decay를 업데이트에서 분리해 Adam+L2의 왜곡을 고쳤다. 워밍업(전체의 5%)은 초기 통계가 불안정한 Adam이 튀는 것을 막고, 코사인 감쇠는 끝에서 보폭을 줄인다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '분류에 MSE를 쓰면 확신에 찬 오답에서 기울기가 죽는다. 크로스엔트로피는 p − y로 밀어 준다.',
    'lr 상한은 가장 가파른 축이 정한다. 곡률이 10이면 lr 0.2를 넘는 순간 발산한다.',
    '미니배치는 기울기 노이즈를 배치 크기의 제곱근만큼 줄이고, GPU 덕에 비용은 거의 그대로다.',
    'Adam은 lr을 틀려도 잘 발산하지 않아 기본값이 됐다. 출발점은 AdamW(lr=3e-4)다.',
  ];
  const review = [
    { q: '학습을 시작하자마자 손실이 NaN으로 폭발했다. 가장 먼저 의심할 것은?',
      o: ['배치 크기가 너무 커서 넘쳤다', 'lr이 가파른 축의 한계를 넘었다', '손실 함수로 크로스엔트로피를 썼다'], a: 1,
      why: 'lr이 2/λ를 넘으면 가파른 축에서 벽 사이를 튕기며 값이 커진다. 손실이 이상하면 모델보다 lr부터 본다.' },
    { q: 'SGD가 골짜기에서 가파른 축으로 지그재그만 하고 앞으로는 굼뜨다. lr을 바꾸지 않고 고칠 방법은?',
      o: ['모멘텀을 붙여 지그재그를 상쇄시킨다', '배치 크기를 1로 줄인다', '손실 함수를 MSE로 바꾼다'], a: 0,
      why: '모멘텀은 이전 걸음의 속도를 이어 가서, 방향이 바뀌는 성분은 서로 지우고 꾸준한 성분은 쌓는다. 배치를 1로 줄이면 노이즈만 커진다.' },
    { q: 'Adam으로 학습하는데 처음 몇 스텝에서만 손실이 크게 튀고 이후엔 안정적이다. 먼저 넣을 것은?',
      o: ['배치 크기를 1로 줄여 다시 돌린다', 'lr을 0.21로 크게 고정한다', '초반 수백 스텝에 lr 워밍업을 건다'], a: 2,
      why: 'Adam은 초기 통계가 불안정해 첫 걸음이 크게 튈 수 있다. 워밍업은 그 구간의 보폭을 작게 눌러 준다.' },
  ];

  RA.page({ title: '손실 지형과 옵티마이저', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
