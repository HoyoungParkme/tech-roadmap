/* V-1-1 학습 안정화 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 층을 지날 때마다 활성값 분포(히스토그램)가 "살아 있나·죽었나·폭주하나"를 본다.
 *   히스토그램은 페이지가 쓰던 것과 같은 시드(mulberry32 20260806)로 4층 ReLU MLP(48차원 × 배치 96)를 여기서 실제로 순전파해 그린다.
 *   코드 창 출력(512차원)은 PyTorch 로 돌린 값(seed 0): He 0.828 / 0.840 / 0.794 / 0.768, Xavier 0.586 / 0.420 / 0.281 / 0.192.
 *   train/val 곡선(Step 4)과 숫자 0.03 / 1.38 / 0.55 는 페이지의 예시 시나리오다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  function note(x, y, s, op, a) { return tx(x, y, s, Object.assign({ 'font-size': 16, 'font-weight': 700, opacity: op ?? 1 }, a || {})); }

  // ---------- 실계산: 페이지의 simulateActivations 와 같은 식·시드 ----------
  function mulberry32(seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function randn(rng) { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v); }
  const DIM = 48, BATCH = 96, LAYERS = 4;
  function simulate(init, useBN) { const rng = mulberry32(20260806), scale = { zero: 0, large: 1.2, he: Math.sqrt(2 / DIM) }[init];
    let X = Array.from({ length: BATCH }, () => Array.from({ length: DIM }, () => randn(rng))); const layers = [];
    for (let l = 0; l < LAYERS; l++) { const W = Array.from({ length: DIM }, () => Array.from({ length: DIM }, () => randn(rng) * scale));
      const Z = X.map((row) => { const out = new Array(DIM).fill(0); for (let j = 0; j < DIM; j++) { let s = 0; for (let i = 0; i < DIM; i++) s += row[i] * W[i][j]; out[j] = s; } return out; });
      if (useBN) for (let j = 0; j < DIM; j++) { let m = 0; for (let b = 0; b < BATCH; b++) m += Z[b][j]; m /= BATCH; let v = 0; for (let b = 0; b < BATCH; b++) v += (Z[b][j] - m) ** 2; v /= BATCH; const sd = Math.sqrt(v + 1e-5); for (let b = 0; b < BATCH; b++) Z[b][j] = (Z[b][j] - m) / sd; }
      const A = Z.map((row) => row.map((z) => Math.max(0, z))), bins = new Array(15).fill(0); let sum = 0, n = 0, dead = 0;
      for (const row of A) for (const v of row) { sum += v; n++; if (v < 1e-8) dead++; bins[Math.min(14, Math.floor((v / 3) * 15))]++; }
      const mean = sum / n; let vv = 0; for (const row of A) for (const v of row) vv += (v - mean) ** 2;
      layers.push({ bins, std: Math.sqrt(vv / n), dead: dead / n }); X = A; }
    return layers; }
  let ACT = null; const act = () => ACT || (ACT = { zero: simulate('zero', false), large: simulate('large', false), he: simulate('he', false), bn: simulate('large', true) });
  const fmtS = (s) => (s >= 100 ? Math.round(s).toString() : s.toFixed(2));

  // 히스토그램 하나: 활성값 0~3 을 15칸, 막대 높이 = √개수 (0 칸이 너무 커서). 마지막 칸은 '3 이상' 포함
  function hist(x, y, w, h, L, col, u0, o) { o = o || {}; const m = Math.sqrt(Math.max(...L.bins, 1)), bw = w / 15;
    el('line', { x1: x, y1: y + h, x2: x + w, y2: y + h, stroke: GRID, 'stroke-width': 1.5 });
    L.bins.forEach((b, i) => { const hh = (Math.sqrt(b) / m) * h * clamp(u0); if (b <= 0) return;
      el('rect', { x: x + i * bw + 0.5, y: y + h - hh, width: bw - 1.5, height: hh, fill: i === 14 && o.over ? BAD : col, opacity: 0.85 }); });
    if (o.std !== false) mono(x + w + 8, y + h - 2, 'σ=' + fmtS(L.std), { 'font-size': 14, 'font-weight': 700, fill: o.scol || col, opacity: clamp(u0) }); }
  function column(x, y, title, layers, col, u0, o) { o = o || {}; tx(x, y, title, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: clamp(u0 * 3) });
    layers.forEach((L, i) => { const yy = y + 14 + i * 64, uu = clamp(u0 * 4 - i); mono(x - 6, yy + 40, 'L' + (i + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: uu > 0 ? 1 : 0 }); hist(x, yy, o.w || 150, 44, L, col, uu, o); }); }

  // ---------- 1. 초기화 ----------
  function mlp(x0, y0, u, o) { o = o || {}; const nL = 5, gap = 92, nn = 5;
    for (let l = 0; l < nL; l++) for (let i = 0; i < nn; i++) { const cx = x0 + l * gap, cy = y0 + i * 40;
      if (l > 0) for (let j = 0; j < nn; j++) el('line', { x1: cx - gap, y1: y0 + j * 40, x2: cx, y2: cy, stroke: o.wcol ? o.wcol(l) : GRID, 'stroke-width': 1, opacity: clamp(u * 5 - l) * 0.8 });
      el('circle', { cx, cy, r: 11, fill: o.ncol ? o.ncol(l, i) : PANEL, stroke: l === 0 ? MUT : INK, 'stroke-width': 2, opacity: clamp(u * 5 - l + 0.5) }); }
    ['입력', 'L1', 'L2', 'L3', 'L4'].forEach((s, l) => tx(x0 + l * gap, y0 + 5 * 40 + 6, s, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: clamp(u * 5 - l + 0.5) })); }
  function s1(t, c) { const { k, u } = c, A = act();
    if (k === 0) { const ax = R.axes(90, 70, 380, 250, { x: [0, 40], y: [0, 3], xt: [0, 20, 40], yt: [0, 1, 2, 3], xl: 'epoch', yl: 'loss' });
      R.line(ax, [[0, 2.3], [10, 2.3], [20, 2.3], [30, 2.3], [40, 2.3]], E(u, 0.3, 1.5), BAD, { sw: 3 });
      mono(ax.X(40) - 4, ax.Y(2.3) - 12, '2.30', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      note(560, 120, 'loss 가 2.30 에서 미동 없음', fade(u, 1.2)); mono(560, 170, 'ln 10 = 2.3026', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
      sub(700, 200, '10클래스 무작위 추측의 loss', fade(u, 1.9), { 'font-size': 15 }); pill(700, 270, '1순위 용의자 = 초기화', WARN, pop(u, 2.3), { fs: 15 }); return; }
    if (k === 1) { mlp(120, 90, E(u, 0.2, 1.6)); note(600, 120, 'Linear(512, 512) × 4', fade(u, 1.2), { class: 'mono' }); note(600, 160, '+ ReLU', fade(u, 1.5), { class: 'mono' });
      sub(720, 210, '(그림은 층마다 뉴런 5개만)', fade(u, 1.8), { 'font-size': 14 }); sub(720, 250, '가중치는 아직 PyTorch 기본값', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 2) { mlp(120, 90, 1); const g = E(u, 0.3, 2.0); R.dot([[120, 170], [212, 170], [304, 170], [396, 170], [488, 170]], g, ACC, 9);
      [1, 2, 3, 4].forEach((l) => { const on = g * 4 >= l; mono(120 + l * 92, 74, '×1.5', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: on ? 1 : 0 }); });
      note(600, 140, '층 효과는 곱해진다', fade(u, 0.6)); mono(600, 190, '1.5⁴ = 5.06', { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0) });
      sub(720, 230, '한 층 1.5배면 4층 뒤 5배', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k 3~7: 히스토그램 세 칸 (zero / large / he)
    const cols = [['❌ 전부 0', A.zero, BAD, 3], ['❌ std=1.2', A.large, WARN, 4], ['✅ He √(2/n)', A.he, GOOD, 5]];
    if (k === 6) { // Xavier vs He (PyTorch 512차원 실측)
      column(70, 40, '✅ He √(2/n)', A.he, GOOD, 1, { w: 150 });
      const ax = R.axes(400, 80, 300, 230, { x: [0.5, 4.5], y: [0, 1], xt: [1, 2, 3, 4], yt: [0, 0.5, 1], xl: '층', yl: '활성값 std (PyTorch, 512차원)', grid: true });
      const he = [0.828, 0.840, 0.794, 0.768], xv = [0.586, 0.420, 0.281, 0.192];
      R.line(ax, he.map((v, i) => [i + 1, v]), E(u, 0.3, 1.2), GOOD, { sw: 3 }); R.scatter(ax, he.map((v, i) => [i + 1, v, GOOD]), { u: E(u, 0.3, 1.2), r: 5 });
      R.line(ax, xv.map((v, i) => [i + 1, v]), E(u, 1.0, 1.9), INFO, { sw: 3 }); R.scatter(ax, xv.map((v, i) => [i + 1, v, INFO]), { u: E(u, 1.0, 1.9), r: 5 });
      mono(ax.X(4) + 12, ax.Y(0.768) + 5, 'He 0.768', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
      mono(ax.X(4) + 12, ax.Y(0.192) + 5, 'Xavier 0.192', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.9) });
      note(760, 190, 'ReLU: Var(W) = 2/n', fade(u, 0.3), { fill: GOOD, 'font-size': 15 }); note(760, 218, 'tanh: Var(W) = 1/n', fade(u, 0.9), { fill: INFO, 'font-size': 15 });
      sub(560, 372, 'ReLU 에 Xavier 를 쓰면 층마다 std 가 약 0.7배씩 준다 (seed 0 실측)', fade(u, 2.2), { 'font-size': 14 }); return; }
    cols.forEach(([title, L, col, at], i) => { const x = 90 + i * 300; let u0;
      if (k === 7) u0 = 1; else if (k === at) u0 = E(u, 0.2, 1.6); else if (k > at) u0 = 1; else u0 = 0;
      if (u0 <= 0) { el('rect', { x: x - 30, y: 40, width: 250, height: 280, rx: 10, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 5' }); return; }
      column(x, 40, title, L, col, u0, { over: i === 1 }); });
    const msg = { 3: ['전 층 활성 0 · 죽은 비율 100%', BAD], 4: ['σ 4.90 → 27.8 → 155 → 1036', WARN], 5: ['σ 0.83 → 0.80 → 0.77 → 0.87', GOOD], 7: ['48차원 × 배치 96 실계산 · 막대 = √개수', INK] }[k];
    if (msg) note(480, 352, msg[0], fade(u, 1.6), { 'text-anchor': 'middle', fill: msg[1], class: k === 7 ? null : 'mono', 'font-size': 15.5 });
    if (k === 4) sub(480, 380, '빨간 칸 = 3 이상으로 튄 값 (폭주)', fade(u, 2.0), { 'font-size': 14 });
    if (k === 5) sub(480, 380, 'Var(W) = 2/fan_in · bias = 0 — 분포가 층마다 같은 모양', fade(u, 2.0), { 'font-size': 14 });
    if (k === 3) sub(480, 380, '같은 값·같은 그래디언트 → 대칭이 안 깨진다', fade(u, 2.0), { 'font-size': 14 });
    if (k === 7) sub(480, 380, '코드(512차원, seed 0): He 0.828 / 0.840 / 0.794 / 0.768', fade(u, 2.0), { 'font-size': 14, class: 'mono' }); }

  // ---------- 2. 배치 정규화 ----------
  // 특징맵 판: 깊이 있는 사각 묶음
  function slab(cx, cy, w, h, n, col, label, op) { for (let i = n - 1; i >= 0; i--) el('rect', { x: cx - w / 2 + i * 5, y: cy - h / 2 - i * 5, width: w, height: h, rx: 3, fill: PANEL, stroke: col, 'stroke-width': 1.8, opacity: op });
    if (label) tx(cx + 8, cy + h / 2 + 22, label, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: op }); }
  function bell(cx, cy, w, h, mu, sd, col, op, half) { const pts = []; for (let i = 0; i <= 40; i++) { const x = -3 + i * 6 / 40, v = Math.exp(-((x - mu) ** 2) / (2 * sd * sd)); if (half && x < 0) { pts.push([cx + (x / 3) * w / 2, cy]); continue; } pts.push([cx + (x / 3) * w / 2, cy - v * h]); }
    el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': 2.6, opacity: op }); el('line', { x1: cx - w / 2, y1: cy, x2: cx + w / 2, y2: cy, stroke: GRID, 'stroke-width': 1.2, opacity: op }); }
  function s2(t, c) { const { k, u } = c, A = act();
    if (k === 0 || k === 6) { column(110, 44, 'BN 없음 (std=1.2)', A.large, WARN, k === 0 ? E(u, 0.2, 1.4) : 1, { over: true });
      column(430, 44, 'BN 있음 (같은 std=1.2)', A.bn, GOOD, k === 0 ? E(u, 1.0, 2.2) : 1);
      if (k === 0) { note(700, 120, '같은 나쁜 초기화', fade(u, 0.3)); note(700, 152, 'BN 하나로 달라진다', fade(u, 1.8), { fill: GOOD }); sub(790, 200, 'Conv → BN → ReLU', fade(u, 2.2), { 'font-size': 15, class: 'mono' }); return; }
      mono(830, 80, 'SGD lr', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      mono(830, 120, `${tween(0.01, 0.1, u - 0.4, 1.2).toFixed(2)}`, { 'font-size': 28, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      pill(830, 166, '×10', ACC, pop(u, 1.4), { fs: 15, mono: true });
      sub(830, 214, 'BN 없음: 4층 σ 1036', fade(u, 1.7), { 'font-size': 14, fill: WARN }); sub(830, 240, 'BN 있음: σ 0.58~0.60', fade(u, 1.9), { 'font-size': 14, fill: GOOD });
      sub(830, 276, '(ReLU 뒤, γ=1·β=0)', fade(u, 2.0), { 'font-size': 13.5 }); sub(830, 330, '분포가 안정 → 큰 lr', fade(u, 2.3), { 'font-size': 14.5, fill: ACC }); return; }
    const XS = [150, 380, 610, 840], Y = 190;
    const stages = [['Conv2d', INK], ['BatchNorm2d', ACC], ['ReLU', GOOD]];
    if (k >= 1 && k <= 3) { slab(XS[0], Y, 80, 80, 3, MUT, '입력', 1);
      stages.forEach(([nm, col], i) => { const s = k === 1 ? pop(u, 0.4 + i * 0.5) : 1; card(XS[i + 1], Y, 150, 60, { rx: 10, stroke: col, fill: PANEL, text: nm, fs: 16, mono: true, color: col, s }); if (i < 3) grow(XS[i] + 60, Y, XS[i + 1] - 80, Y, k === 1 ? E(u, 0.3 + i * 0.5, 0.6 + i * 0.5) : 1, MUT); });
      tx(XS[1] + 330 / 2 + 115, 110, 'ConvBlock — 순서가 곧 규약', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 1.8) : 1 }); }
    if (k === 2) { mono(XS[1], Y + 60, 'bias=False', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); cross(XS[1] + 72, Y + 55, 8, pop(u, 0.5));
      el('path', { d: `M${XS[1] + 20},${Y + 76} Q${(XS[1] + XS[2]) / 2},${Y + 130} ${XS[2] - 10},${Y + 76}`, fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': `${E(u, 0.9, 1.6) * 300} 400` });
      mono(XS[2], Y + 140, 'β 가 bias 역할', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(480, 380, 'BN 이 평균을 빼면 conv 의 bias 는 상쇄된다', fade(u, 2.0), { 'font-size': 15 }); }
    if (k === 3) { R.dot([[XS[0], Y], [XS[1], Y], [XS[2], Y], [XS[3], Y]], seg(u, 0.2, 1.4), ACC, 9);
      bell(XS[1], Y + 140, 160, 50, 1.2, 1.4, MUT, fade(u, 0.5)); sub(XS[1], Y + 160, '분포가 흔들린다', fade(u, 0.6), { 'font-size': 14 });
      bell(XS[2], Y + 140, 160, 60, 0, 0.7, ACC, fade(u, 1.0)); sub(XS[2], Y + 160, '평균 0 · 분산 1', fade(u, 1.1), { 'font-size': 14, fill: ACC });
      bell(XS[3], Y + 140, 160, 60, 0, 0.7, GOOD, fade(u, 1.5), true); sub(XS[3], Y + 160, '정규화된 값만 ReLU 로', fade(u, 1.6), { 'font-size': 14, fill: GOOD });
      mono(480, 80, 'self.act(self.bn(self.conv(x)))', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) }); }
    if (k === 4) { // 미니배치 값이 정규화되는 모습
      const vals = [3.1, 4.6, 2.2, 5.4, 3.8, 6.0, 2.9, 4.3], mu = vals.reduce((a, b) => a + b) / vals.length, sd = Math.sqrt(vals.reduce((a, b) => a + (b - mu) ** 2, 0) / vals.length);
      const X0 = 120, W = 720, sx = (v) => X0 + ((v + 3) / 10) * W;
      el('line', { x1: X0, y1: 300, x2: X0 + W, y2: 300, stroke: MUT, 'stroke-width': 1.8 }); [-3, 0, 3, 6].forEach((v) => mono(sx(v), 322, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      const g = E(u, 1.0, 1.8), gb = E(u, 1.9, 2.4);
      vals.forEach((v, i) => { const z = (v - mu) / sd, x = sx(lerp(v, lerp(z, 1.5 * z + 0.5, gb), g)); el('circle', { cx: x, cy: 280 - (i % 2) * 14, r: 8, fill: g > 0.5 ? ACC : MUT, opacity: 0.85 }); });
      el('line', { x1: sx(lerp(mu, 0, g)), y1: 252, x2: sx(lerp(mu, 0, g)), y2: 304, stroke: INK, 'stroke-width': 2.2, 'stroke-dasharray': '4 3', opacity: fade(u, 0.4) });
      const steps = [['① μ, σ² = 미니배치 통계', 0.3], ['② x̂ = (x − μ) / √(σ² + ε)', 1.0], ['③ y = γ·x̂ + β  (학습)', 1.9], ['④ running_mean/var 갱신', 2.3]];
      steps.forEach(([s, at], i) => mono(120 + (i % 2) * 380, 90 + Math.floor(i / 2) * 44, s, { 'font-size': 15.5, 'font-weight': 700, fill: i === 2 ? ACC : INK, opacity: fade(u, at) }));
      sub(480, 214, '점 = 한 채널의 미니배치 값 8개 (예시)', fade(u, 0.3), { 'font-size': 14 });
      sub(480, 372, 'γ·β 덕에 정규화가 손해면 스스로 되돌린다', fade(u, 2.4), { 'font-size': 14.5 }); }
    if (k === 5) { const items = [['입력', '(3, H, W)', MUT, 3], ['ConvBlock(3, 64)', '(64, H, W)', ACC, 4], ['ConvBlock(64, 128)', '(128, H, W)', ACC, 6], ['Pool + Flatten', '(128,)', INK, 1], ['Linear(128, 10)', '(10,)', GOOD, 1]];
      items.forEach(([nm, sh, col, n], i) => { const x = 100 + i * 190, op = fade(u, 0.2 + i * 0.4);
        if (n > 1) slab(x, 200, 70 - n * 2, 90, n, col, null, op); else el('rect', { x: x - 14, y: 140, width: 28, height: i === 4 ? 60 : 120, rx: 4, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: op });
        tx(x, 300, nm, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col === MUT ? INK : col, opacity: op }); mono(x, 324, sh, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: op });
        if (i) grow(x - 150, 200, x - 50, 200, E(u, 0.1 + i * 0.4, 0.4 + i * 0.4), MUT); });
      pill(290, 90, 'BN', ACC, pop(u, 1.4), { fs: 14 }); pill(480, 90, 'BN', ACC, pop(u, 1.6), { fs: 14 });
      sub(480, 372, '블록마다 BN — 층마다 분포를 리셋', fade(u, 2.2), { 'font-size': 15 }); } }

  // ---------- 3. BN 함정과 LN · GN ----------
  // N(샘플) × C(채널) 격자. hi(n, c) → 강조 여부
  function ncGrid(x, y, cs, hi, col, op, lab) { const N = 6, Cn = 8;
    for (let n = 0; n < N; n++) for (let cc = 0; cc < Cn; cc++) { const h = hi(n, cc); el('rect', { x: x + cc * cs, y: y + n * cs, width: cs - 3, height: cs - 3, rx: 3, fill: h ? col : SOFT, stroke: h ? col : GRID, 'stroke-width': 1.2, opacity: op * (h ? 0.85 : 1) }); }
    mono(x + (Cn * cs) / 2, y - 10, 'C (채널·특징) →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op });
    tx(x - 8, y + (N * cs) / 2, 'N', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: op });
    if (lab) tx(x + (Cn * cs) / 2, y + N * cs + 22, lab, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op }); }
  function modeBox(x, y, title, body, col, op, s) { card(x, y, 300, 96, { rx: 10, stroke: col, fill: PANEL, s, op });
    mono(x, y - 18, title, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op });
    body.forEach((b, i) => tx(x, y + 8 + i * 22, b, { 'font-size': 14, 'text-anchor': 'middle', opacity: op })); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(260, 180, 340, 120, { rx: 12, stroke: BAD, fill: BADBG, s: pop(u, 0.3) }); tx(260, 168, '① model.eval() 누락', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.4) }); sub(260, 198, '상태(모드)의 문제라 눈에 안 띈다', fade(u, 0.7), { 'font-size': 14.5 });
      card(700, 180, 340, 120, { rx: 12, stroke: WARN, fill: WARNBG, s: pop(u, 1.0) }); tx(700, 168, '② 작은 배치 (2~4)', { 'font-size': 17, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.1) }); sub(700, 198, '평균·분산 추정이 노이즈', fade(u, 1.4), { 'font-size': 14.5 });
      sub(480, 320, 'BN 사고는 대부분 이 둘 중 하나', fade(u, 2.0), { 'font-size': 15.5 }); return; }
    if (k >= 1 && k <= 4) { const sw = k >= 3 ? E(u, 0.2, 0.7) * (k === 3 ? 1 : 1) : 0, evalOn = k >= 3;
      modeBox(250, 150, 'model.train()', ['지금 미니배치의 μ / σ²', '+ 러닝 통계 이동평균 갱신'], ACC, evalOn ? 0.45 : 1, k === 1 ? pop(u, 0.3) : 1);
      modeBox(710, 150, 'model.eval()', ['모아 둔 running_mean / var', '배치 구성과 무관 — 결정적'], GOOD, k === 1 ? fade(u, 1.0) : evalOn ? 1 : 0.45);
      // 스위치
      el('rect', { x: 440, y: 135, width: 80, height: 34, rx: 17, fill: evalOn ? GOODBG : ACCBG, stroke: evalOn ? GOOD : ACC, 'stroke-width': 2 });
      el('circle', { cx: lerp(457, 503, k === 3 ? sw : evalOn ? 1 : 0), cy: 152, r: 13, fill: evalOn ? GOOD : ACC });
      if (k === 2) { for (let b = 0; b < 5; b++) { const f = seg(u, 0.2 + b * 0.4, 0.6 + b * 0.4); if (f > 0 && f < 1) card(lerp(60, 250, f), 290, 70, 30, { rx: 6, stroke: ACC, text: `batch ${b + 1}`, fs: 13.5, color: ACC }); }
        const ax = R.axes(560, 260, 300, 100, { x: [0, 5], y: [0, 1], xl: '스텝', yl: 'running_mean' }); const pts = []; let m = 0; for (let i = 0; i <= 50; i++) { pts.push([i / 10, m]); m = 0.9 * m + 0.1 * 0.7; }
        R.line(ax, pts, E(u, 0.3, 2.3), ACC, { sw: 2.6 }); sub(710, 400, '이동평균이 쌓인다 (개념도)', fade(u, 2.2), { 'font-size': 13.5 }); }
      if (k === 3) { note(480, 290, '추론 전 eval() 한 줄', fade(u, 0.9), { 'text-anchor': 'middle', fill: GOOD }); sub(480, 324, 'BN 은 러닝 통계로, Dropout 은 꺼진다', fade(u, 1.5), { 'font-size': 15 }); }
      if (k === 4) { card(480, 300, 300, 60, { rx: 10, stroke: INFO, dash: '6 4', s: pop(u, 0.3) }); mono(480, 296, 'torch.no_grad()', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
        sub(480, 318, '그래디언트만 끈다', fade(u, 0.7), { 'font-size': 14 });
        grow(480, 270, 480, 200, E(u, 1.0, 1.4), BAD); cross(480, 230, 12, pop(u, 1.5)); note(560, 240, '모드는 안 바뀐다', fade(u, 1.6), { fill: BAD, 'font-size': 15 });
        sub(480, 380, 'no_grad 만 걸고 안심 = "학습 95%, 서빙 엉망"', fade(u, 2.2), { 'font-size': 15, fill: BAD }); }
      if (k === 1) sub(480, 300, '같은 입력도 모드에 따라 다른 값', fade(u, 2.0), { 'font-size': 15 });
      return; }
    if (k === 5) { // 작은 배치: 평균 추정이 흔들린다
      const ax = R.axes(120, 80, 700, 240, { x: [0, 11], y: [-1.5, 1.5], yt: [-1, 0, 1], xl: '미니배치 번호', yl: '배치 평균 μ (개념도)', grid: true });
      const rng = mulberry32(7); const smallM = [], bigM = [];
      for (let b = 1; b <= 10; b++) { let s = 0; for (let i = 0; i < 2; i++) s += randn(rng); smallM.push([b, s / 2]); let t2 = 0; for (let i = 0; i < 32; i++) t2 += randn(rng); bigM.push([b, t2 / 32]); }
      R.line(ax, smallM, E(u, 0.3, 1.4), BAD, { sw: 2.4 }); R.scatter(ax, smallM.map((p) => [...p, BAD]), { u: E(u, 0.3, 1.4), r: 5 });
      R.line(ax, bigM, E(u, 1.2, 2.2), GOOD, { sw: 2.4 }); R.scatter(ax, bigM.map((p) => [...p, GOOD]), { u: E(u, 1.2, 2.2), r: 5 });
      mono(ax.X(10.3), ax.Y(smallM[9][1]) + 5, 'batch 2', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
      mono(ax.X(10.3), ax.Y(bigM[9][1]) + 5, 'batch 32', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) });
      sub(470, 392, '참 평균은 0 — 배치 2 는 추정 자체가 노이즈 (N(0,1) 표본 실계산)', fade(u, 2.3), { 'font-size': 14 }); return; }
    const BN = (n, cc) => cc === 2, LN = (n, cc) => n === 2, GN = (n, cc) => n === 2 && cc >= 4 && cc < 6;
    if (k === 6 || k === 7) { const cs = 34; ncGrid(110, 90, cs, BN, ACC, 0.5, 'BatchNorm'); ncGrid(500, 90, cs, k === 6 ? LN : GN, k === 6 ? GOOD : INFO, k === 6 ? fade(u, 0.3) : fade(u, 0.3), k === 6 ? 'LayerNorm' : 'GroupNorm');
      const g = E(u, 0.6, 1.4), hy = 90 + 2 * cs;
      if (k === 6) { el('rect', { x: 497, y: hy - 3, width: 8 * cs * g + 3, height: cs + 3, rx: 5, fill: 'none', stroke: INK, 'stroke-width': 2.5 });
        mono(500, 340, 'nn.LayerNorm(512)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); sub(640, 372, '샘플 하나 안의 특징으로 정규화 → 배치 크기 무관', fade(u, 1.9), { 'font-size': 14 }); }
      else { el('rect', { x: 500 + 4 * cs - 3, y: hy - 3, width: 2 * cs * g + 3, height: cs + 3, rx: 5, fill: 'none', stroke: INK, 'stroke-width': 2.5 });
        mono(500, 340, 'GroupNorm(32, 128)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); sub(640, 372, '그룹당 128/32 = 4채널 · 샘플 안에서 정규화', fade(u, 1.9), { 'font-size': 14 }); }
      sub(250, 340, '한 채널을 배치 전체로', 0.6, { 'font-size': 14 }); return; }
    // k 8: 선택 지도
    const cs = 26, G = [[BN, ACC, 'BatchNorm', 'CNN + batch ≥ 16'], [LN, GOOD, 'LayerNorm', 'Transformer · 시퀀스'], [GN, INFO, 'GroupNorm', 'batch 1~4 비전']];
    G.forEach(([f, col, nm, use], i) => { const x = 80 + i * 300, op = fade(u, 0.2 + i * 0.5); ncGrid(x, 90, cs, f, col, op, nm);
      tx(x + 4 * cs, 290, use, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 0.5 + i * 0.5) }); });
    note(480, 350, '아이디어는 같고 평균·분산을 내는 축만 다르다', fade(u, 2.1), { 'text-anchor': 'middle', 'font-size': 15.5 }); }

  // ---------- 4. 드롭아웃 ----------
  const CUR = { ep: [0, 5, 10, 15, 20, 25, 30, 35, 40], nT: [2.3, 1.4, 0.9, 0.55, 0.32, 0.18, 0.09, 0.05, 0.03], nV: [2.3, 1.5, 1.1, 0.95, 0.92, 0.98, 1.10, 1.24, 1.38], dT: [2.3, 1.5, 1.05, 0.78, 0.60, 0.50, 0.43, 0.39, 0.36], dV: [2.3, 1.55, 1.08, 0.85, 0.71, 0.63, 0.58, 0.56, 0.55] };
  function curves(x, y, w, h, u, withDrop, op) { const ax = R.axes(x, y, w, h, { x: [0, 40], y: [0, 2.4], xt: [0, 20, 40], yt: [0, 1, 2], xl: 'epoch', yl: 'loss (예시)' });
    const P = (a) => a.map((v, i) => [CUR.ep[i], v]);
    R.line(ax, P(CUR.nT), u, BAD, { sw: 2.2, op: 0.6 }); R.line(ax, P(CUR.nV), u, BAD, { sw: 2.8, dash: '7 5' });
    mono(ax.X(40) - 4, ax.Y(1.38) - 10, 'val 1.38', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: u > 0.95 ? 1 : 0 });
    mono(ax.X(40) - 4, ax.Y(0.03) - 8, 'train 0.03', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', opacity: u > 0.95 ? 1 : 0 });
    if (withDrop > 0) { R.line(ax, P(CUR.dT), withDrop, GOOD, { sw: 2.2, op: 0.6 }); R.line(ax, P(CUR.dV), withDrop, GOOD, { sw: 2.8, dash: '7 5' });
      mono(ax.X(40) - 4, ax.Y(0.55) - 10, 'val 0.55', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: withDrop > 0.95 ? 1 : 0 }); }
    return ax; }
  function maskOf(step) { const rng = mulberry32(1000 + step); return Array.from({ length: 48 }, () => rng() > 0.4); }
  function neuronGrid(x, y, mask, op, cs, evalMode) { cs = cs || 30; mask.forEach((on, i) => { const cx = x + (i % 8) * cs, cy = y + Math.floor(i / 8) * cs, alive = evalMode || on;
      el('circle', { cx, cy, r: cs * 0.36, fill: alive ? ACC : PANEL, stroke: alive ? ACC : OFF, 'stroke-width': 1.8, opacity: op });
      if (!alive) { el('line', { x1: cx - 5, y1: cy - 5, x2: cx + 5, y2: cy + 5, stroke: OFF, 'stroke-width': 2, opacity: op }); el('line', { x1: cx + 5, y1: cy - 5, x2: cx - 5, y2: cy + 5, stroke: OFF, 'stroke-width': 2, opacity: op }); } }); }
  function netBlocks(u, k, hiHead) { const bb = [['ConvBlock(3,64)', 90], ['ConvBlock(64,128)', 250]];
    zoneRect(40, 90, 330, 140, 'backbone — BN 만', ACC, k === 1 ? fade(u, 0.2) : 1);
    bb.forEach(([nm, x], i) => card(x + 40, 170, 140, 50, { rx: 8, stroke: ACC, text: nm, fs: 13.5, mono: true, color: ACC, s: k === 1 ? pop(u, 0.4 + i * 0.4) : 1 }));
    zoneRect(420, 90, 500, 140, 'head — Dropout(p=0.4)', WARN, k === 1 ? fade(u, 1.4) : 1, hiHead);
    [['Linear(128,256)+ReLU', 520], ['Dropout', 660], ['Linear(256,10)', 800]].forEach(([nm, x], i) => card(x, 170, i === 1 ? 100 : 150, 50, { rx: 8, stroke: i === 1 ? WARN : INK, text: nm, fs: 13.5, mono: true, color: i === 1 ? WARN : INK, s: k === 1 ? pop(u, 1.6 + i * 0.25) : 1 })); }
  function zoneRect(x, y, w, h, title, col, op, hi) { el('rect', { x, y, width: w, height: h, rx: 12, fill: hi ? (col === WARN ? WARNBG : ACCBG) : 'none', stroke: col, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: op }); tx(x + 14, y + 24, title, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { curves(120, 70, 460, 260, E(u, 0.3, 1.8), 0);
      note(640, 120, 'train 0.03 / val 1.38', fade(u, 1.6), { class: 'mono', fill: BAD }); sub(760, 160, 'epoch 20 부터 val 이 역주행', fade(u, 1.9), { 'font-size': 15 });
      pill(760, 220, '암기 = 과적합', BAD, pop(u, 2.2), { fs: 15 }); sub(760, 270, '실선 train · 점선 val', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 1 || k === 3) { netBlocks(u, k, false);
      if (k === 3) { R.dot([[60, 300], [130, 170], [290, 170], [520, 170], [660, 170], [800, 170], [900, 300]], seg(u, 0.3, 2.0), ACC, 8);
        mono(480, 300, 'self.head(self.backbone(x))', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
        sub(480, 340, '구간을 나누면 처방을 구간별로 걸 수 있다', fade(u, 1.6), { 'font-size': 15 }); }
      else sub(480, 300, 'Conv 구간엔 Dropout 을 넣지 않는다 (BN 과 충돌)', fade(u, 2.2), { 'font-size': 15 });
      return; }
    if (k === 2 || k === 5 || k === 7) { const step = k === 2 ? 0 : Math.floor(u / 0.7); const m = maskOf(step), alive = m.filter(Boolean).length;
      if (k !== 5) { neuronGrid(100, 100, m, k === 2 ? fade(u, 0.2) : 1, 34, k === 7 && u > 1.6);
        mono(100, 64, k === 7 && u > 1.6 ? 'eval() — 전원 사용 48/48' : `train() — step #${step + 1} · 생존 ${alive}/48`, { 'font-size': 15, 'font-weight': 700, fill: k === 7 && u > 1.6 ? GOOD : ACC, opacity: k === 2 ? fade(u, 0.6) : 1 }); }
      if (k === 2) { note(480, 150, 'FC head 은닉 뉴런 8×6', fade(u, 0.8)); note(480, 190, 'p=0.4 → 매 스텝 약 40% 차단', fade(u, 1.3), { fill: WARN });
        sub(650, 240, '파라미터가 몰린 head 가 암기의 현장', fade(u, 1.9), { 'font-size': 15 }); sub(650, 280, '꺼진 뉴런은 순전파·역전파 모두 제외', fade(u, 2.2), { 'font-size': 14.5 }); }
      if (k === 5) { [0, 1, 2].forEach((s, i) => { const mm = maskOf(i), op = fade(u, 0.3 + i * 0.6); neuronGrid(80 + i * 300, 110, mm, op, 26);
          mono(80 + i * 300, 80, `step #${i + 1} · 생존 ${mm.filter(Boolean).length}`, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: op }); });
        note(480, 330, '매 스텝 다른 서브네트워크 = 공짜 앙상블', fade(u, 2.0), { 'text-anchor': 'middle' }); sub(480, 366, '어떤 뉴런도 옆 뉴런에 기대지 못한다 (공적응 차단)', fade(u, 2.3), { 'font-size': 15 }); }
      if (k === 7) { curves(480, 80, 400, 250, 1, E(u, 0.3, 1.4), 1);
        sub(680, 392, '빨강 = Dropout 없음 · 초록 = p=0.4 (예시 곡선)', fade(u, 1.4), { 'font-size': 14 }); }
      return; }
    if (k === 4) { // inverted dropout 산수
      const bars = [['입력 x', 1.0, INK], ['train: 살아남은 뉴런 x/(1−p)', 1.67, WARN], ['train 기대값 0.6 × 1.67', 1.0, ACC], ['eval: 그대로', 1.0, GOOD]];
      bars.forEach(([nm, v, col], i) => { const y = 90 + i * 64, op = fade(u, 0.2 + i * 0.55); tx(80, y + 16, nm, { 'font-size': 15, 'font-weight': 700, opacity: op });
        R.hbar(420, y, 360, v * E(u, 0.3 + i * 0.55, 0.9 + i * 0.55), 2, { h: 24, col, text: v.toFixed(2), label: op > 0.5 }); });
      mono(480, 370, '1 / (1 − 0.4) = 1.67', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.3) }); return; }
    if (k === 6) { bell(280, 290, 340, 150, 0, 1.0, WARN, fade(u, 0.3)); bell(280, 290, 340, 170, 0, 0.75, GOOD, fade(u, 0.9));
      tx(280, 330, 'Dropout 이 만든 분산 (train)', { 'font-size': 14.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.4) }); tx(280, 354, 'eval 때 실제 분산', { 'font-size': 14.5, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      note(560, 130, 'BN 러닝 통계가', fade(u, 1.3)); note(560, 162, 'train 쪽 분산을 기억한다', fade(u, 1.6), { fill: WARN });
      note(560, 220, '→ eval 에서만 성능 하락', fade(u, 2.0), { fill: BAD }); pill(700, 290, 'Conv = BN · FC = Dropout', ACC, pop(u, 2.3), { fs: 15 });
      sub(280, 384, '(분포 모양은 개념도)', fade(u, 1.2), { 'font-size': 13.5 }); } }

  // ---------- 5. 진단 플로차트 ----------
  const FLOWS = [['정체', 'loss 2.30 고정', '초기화 · lr · 데이터', BAD], ['과적합', 'val 역주행', 'Dropout → 증강 → wd', WARN], ['폭발', 'NaN / inf', 'lr↓ · 클리핑 · 입력 정규화', BAD], ['서빙만 엉망', 'eval() 누락', 'eval() + no_grad()', INFO]];
  function glyph(i, x, y, op) { const P = { 0: [[0, 0.8], [1, 0.8]], 1: [[0, 0.9], [0.5, 0.4], [1, 0.75]], 2: [[0, 0.7], [0.6, 0.6], [0.8, 0.1], [0.82, -0.1]], 3: [[0, 0.9], [1, 0.2]] }[i];
    el('polyline', { points: P.map(([a, b]) => `${x + a * 60},${y + 34 - b * 34}`).join(' '), fill: 'none', stroke: FLOWS[i][3], 'stroke-width': 2.6, opacity: op, 'stroke-dasharray': i === 1 ? '5 3' : null }); }
  function flowTiles(hi, op) { FLOWS.forEach(([nm, sym, fix, col], i) => { const x = 690, y = 40 + i * 92, on = hi.includes(i);
      el('rect', { x: x - 20, y, width: 290, height: 80, rx: 10, fill: on ? (col === BAD ? BADBG : col === WARN ? WARNBG : INFOBG) : PANEL, stroke: on ? col : GRID, 'stroke-width': on ? 2.5 : 1.5, opacity: op });
      glyph(i, x - 6, y + 22, op); tx(x + 66, y + 28, nm + ' — ' + sym, { 'font-size': 14.5, 'font-weight': 800, fill: on ? col : INK, opacity: op }); tx(x + 66, y + 54, fix, { 'font-size': 13.5, fill: MUT, opacity: op }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const rows = [['초기화', 'He (ReLU) / Xavier (tanh)'], ['정규화', 'CNN → BN · Transformer → LN · 소배치 → GN'], ['과적합', 'Dropout(FC만) + 증강 + weight decay'], ['옵티마이저', 'AdamW(lr 3e-4, wd 0.01) + clip 1.0']];
      tx(60, 70, '표준 레시피 — 아프기 전에 이 조합으로 시작', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      rows.forEach(([a, b], i) => { const y = 110 + i * 60, op = fade(u, 0.5 + i * 0.4); el('rect', { x: 60, y, width: 840, height: 48, rx: 8, fill: SOFT, opacity: op });
        tx(80, y + 30, a, { 'font-size': 15.5, 'font-weight': 800, opacity: op }); tx(220, y + 30, b, { 'font-size': 15, class: 'mono', fill: ACC, opacity: op }); });
      sub(480, 380, '증상이 보이면 오른쪽 진단표대로 하나씩 조정', fade(u, 2.3), { 'font-size': 15 }); return; }
    const hiMap = { 5: [2], 6: [3], 7: [0, 2], 8: [1] };
    flowTiles(hiMap[k] || [], 1);
    const LX = 40;
    if (k === 1) { card(320, 120, 300, 54, { rx: 10, stroke: INK, text: 'model = Classifier(p_drop=0.4)', fs: 15, mono: true, s: pop(u, 0.3) });
      sub(320, 180, 'Step 4 구조 그대로 — backbone(BN) + head(Dropout)', fade(u, 1.0), { 'font-size': 14 });
      ['초기화', '최적화', '진단'].forEach((s, i) => pill(200 + i * 120, 260, s, MUT, pop(u, 1.5 + i * 0.25), { fs: 15 })); sub(320, 310, '남은 세 가지', fade(u, 2.3), { 'font-size': 14.5 }); }
    if (k === 2) { const L = ['Conv2d(3,64)', 'Conv2d(64,128)', 'Linear(128,256)', 'Linear(256,10)'];
      L.forEach((s, i) => { const on = E(u, 0.3 + i * 0.4, 0.6 + i * 0.4), y = 70 + i * 66; card(250, y, 260, 48, { rx: 8, stroke: on > 0.5 ? GOOD : GRID, fill: on > 0.5 ? GOODBG : PANEL, text: s, fs: 14.5, mono: true, color: on > 0.5 ? GOOD : MUT });
        if (on > 0.5) check(410, y, 9, 1); });
      sub(300, 360, 'modules() 를 돌며 Conv·Linear 전부 kaiming · bias 0', fade(u, 2.2), { 'font-size': 14 }); }
    if (k === 3) { mono(LX, 90, 'AdamW(lr=3e-4, weight_decay=0.01)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      const ws = [0.9, -0.7, 0.5, -0.35, 0.8], sh = 1 - 0.25 * E(u, 0.8, 2.0);
      ws.forEach((w, i) => { const x = 120 + i * 90, h = 100 * w * sh; el('rect', { x: x - 20, y: h > 0 ? 250 - h : 250, width: 40, height: Math.abs(h), rx: 4, fill: ACC, opacity: 0.8 * fade(u, 0.4) }); });
      el('line', { x1: 80, y1: 250, x2: 560, y2: 250, stroke: MUT, 'stroke-width': 1.5 }); sub(320, 390, '매 스텝 가중치를 0 쪽으로 조금씩 당긴다 (개념도)', fade(u, 1.5), { 'font-size': 14 });
      sub(320, 130, '과적합 보험을 옵티마이저에 하나 더', fade(u, 0.9), { 'font-size': 15 }); }
    if (k === 4) { const st = ['zero_grad', 'forward', 'backward', 'step'], cx = 320, cy = 220, r = 120;
      mono(cx, 70, 'model.train()  ×40 epoch', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.2) });
      st.forEach((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 2, x = cx + r * 1.1 * Math.cos(a), y = cy + r * 0.85 * Math.sin(a); pill(x, y, s, i === 2 ? BAD : INK, pop(u, 0.4 + i * 0.3), { fs: 14.5, mono: true, fill: PANEL }); });
      const ph = (u * 0.8) % 1, a = -Math.PI / 2 + ph * 2 * Math.PI; if (u > 1.2) el('circle', { cx: cx + r * 1.1 * Math.cos(a), cy: cy + r * 0.85 * Math.sin(a), r: 6, fill: ACC });
      sub(cx, 390, 'backward = 그래디언트가 출력에서 입력 쪽으로', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 5) { const cx = 300, cy = 230, R1 = 90, g = E(u, 0.9, 1.6);
      el('circle', { cx, cy, r: R1, fill: ACCBG, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.2) });
      mono(cx, cy + R1 + 24, 'max_norm = 1.0', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      const L0 = 230, ang = -0.6, L = lerp(L0, R1, g);
      grow(cx, cy, cx + L0 * Math.cos(ang), cy + L0 * Math.sin(ang), E(u, 0.3, 0.7) * (1 - g * 0.999), BAD, { sw: 3, dash: '6 4' });
      grow(cx, cy, cx + L * Math.cos(ang), cy + L * Math.sin(ang), g > 0 ? 1 : 0, ACC, { sw: 3.5 });
      sub(cx + 150, cy - 150, '폭주한 그래디언트', fade(u, 0.5), { 'font-size': 14, fill: BAD });
      sub(cx - 30, 70, '방향은 유지 · 길이만 1.0 으로', fade(u, 1.8), { 'font-size': 14.5 }); }
    if (k === 6) { const sw = E(u, 0.3, 0.8); el('rect', { x: 180, y: 120, width: 90, height: 38, rx: 19, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 }); el('circle', { cx: lerp(199, 251, sw), cy: 139, r: 14, fill: GOOD });
      mono(225, 100, 'model.eval()', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD });
      card(400, 139, 170, 44, { rx: 8, stroke: INFO, text: 'torch.no_grad()', fs: 14.5, mono: true, color: INFO, s: pop(u, 1.0) });
      sub(320, 230, '러닝 통계 · 전 뉴런 사용', fade(u, 1.3), { 'font-size': 15 }); sub(320, 260, '+ 그래디언트 계산 안 함', fade(u, 1.6), { 'font-size': 15 });
      mono(320, 320, 'val_loss = evaluate(model, val_loader)', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
    if (k === 7) { mono(LX, 110, 'if not torch.isfinite(loss):', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(LX + 30, 140, 'raise RuntimeError(...)', { 'font-size': 15, fill: BAD, opacity: fade(u, 0.5) });
      mono(LX, 220, 'if epoch > 5 and loss > 2.0:', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); mono(LX + 30, 250, 'print("loss 정체 → …")', { 'font-size': 15, fill: BAD, opacity: fade(u, 1.3) });
      grow(500, 130, 660, 220, E(u, 0.6, 1.0), BAD); grow(500, 240, 660, 60, E(u, 1.5, 1.9), BAD);
      sub(280, 340, '폭발은 즉시 중단, 정체는 5에폭 뒤 경고', fade(u, 2.1), { 'font-size': 14.5 }); }
    if (k === 8) { mono(LX, 110, 'if val_loss > prev_val and loss < 0.3:', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      ['① Dropout', '② 데이터 증강', '③ weight decay'].forEach((s, i) => pill(140 + i * 160, 200, s, WARN, pop(u, 0.9 + i * 0.4), { fs: 14.5 }));
      [0, 1].forEach((i) => grow(212 + i * 160, 200, 228 + i * 160, 200, E(u, 1.2 + i * 0.4, 1.4 + i * 0.4), MUT));
      note(300, 290, '한 번에 하나만 바꾼다', fade(u, 2.0), { 'text-anchor': 'middle', fill: WARN }); sub(300, 324, '동시에 넣으면 무엇이 효과였는지 모른다', fade(u, 2.3), { 'font-size': 14.5 }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: "가중치를 전부 0으로 초기화하면 어떤 일이 생기나?",
      o: ["활성값이 층마다 배수로 폭주한다", "같은 층 뉴런이 같은 값·같은 그래디언트를 받아 영원히 구분되지 않는다", "He 초기화와 같은 효과를 낸다"], a: 1,
      why: "대칭이 깨지지 않아 전 층 활성값이 0이고 학습이 시작되지 않는다. std=1.2처럼 크게 주면 σ가 4.90 → 1036으로 폭주하고, He(Var=2/n)는 4층째에도 0.8 안팎을 유지한다." },
    { q: "나쁜 초기화(std=1.2)에 BatchNorm을 넣으면 4층째 활성값은 어떻게 되나?",
      o: ["전 층 활성값이 0으로 죽는다", "BN이 없을 때처럼 std 1036까지 폭주한다", "층마다 다시 정규화돼 std 0.58~0.60으로 일정하다"], a: 2,
      why: "BN은 층마다 미니배치 평균·분산으로 정규화하고 γ·β로 표현력을 되살린다. 분포가 안정되니 lr을 10배 올려도 발산하지 않는다." },
    { q: "추론 전에 model.eval()을 빼먹으면 BN에서 무슨 일이 생기나?",
      o: ["러닝 통계 대신 현재 배치 통계로 정규화해 예측이 배치 구성에 따라 출렁인다", "torch.no_grad()를 걸었다면 아무 차이도 없다", "그래디언트가 계산되어 메모리만 더 든다"], a: 0,
      why: "train 모드 BN은 현재 미니배치의 μ/σ²를, eval 모드는 모아 둔 running_mean/var를 쓴다. no_grad는 그래디언트만 끌 뿐 모드를 바꾸지 않는다." },
    { q: "Dropout이 과적합을 줄이는 원리로 맞는 것은?",
      o: ["학습률을 자동으로 낮춰 천천히 배우게 한다", "스텝마다 다른 서브넷을 학습시켜 앙상블 효과를 내고, 뉴런끼리 기대는 공적응을 깬다", "BN 러닝 통계를 더 정확하게 만든다"], a: 1,
      why: "매 스텝 확률 p로 뉴런을 끄므로 어떤 뉴런도 옆 뉴런에 기댈 수 없다. head에 p=0.4를 걸자 val loss가 0.55로 안정됐다." },
    { q: "train loss는 내려가는데 val loss가 다시 오른다면 진단표의 처방은 무엇인가?",
      o: ["lr을 낮추고 gradient clipping을 건다", "초기화·lr·데이터 파이프라인부터 의심한다", "Dropout·증강·weight decay를 한 번에 하나씩 건다"], a: 2,
      why: "train만 좋고 val이 나쁘면 과적합이다. 정체는 초기화·lr·데이터, NaN 폭발은 lr 낮추기와 클리핑이 처방이며, 한 번에 하나씩 바꿔야 무엇이 효과였는지 안다." },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '가중치를 0으로 두면 뉴런이 똑같이 남고, 너무 크게 두면 활성값이 폭주한다. He 초기화는 분산을 지킨다.',
    'BN은 층 입력을 미니배치 평균과 분산으로 정규화한다. 나쁜 초기화에서도 층마다 분포가 되살아난다.',
    '추론 전에 model.eval()을 빼먹으면 BN이 배치 통계를 써서 예측이 배치 구성에 따라 흔들린다.',
    '과적합에는 Dropout을 쓴다. 스텝마다 다른 뉴런을 꺼서 서로 기대지 못하게 한다.',
  ];
  const review = [
    { q: '배치 크기 2로 세그멘테이션 모델을 학습하는데 BN을 넣었더니 오히려 불안정하다. 맞는 대안은?',
      o: ['Dropout 비율을 높인다', 'GroupNorm으로 바꾼다', '가중치를 0으로 초기화한다'], a: 1,
      why: '배치 2~4로는 평균과 분산 추정이 노이즈라 BN이 해가 된다. GroupNorm은 채널을 묶어 정규화해 배치 크기와 상관이 없다.' },
    { q: '10층 CNN의 loss가 처음부터 2.30에서 꿈쩍하지 않는다. 먼저 볼 곳은?',
      o: ['초기화, lr, 데이터 파이프라인', 'Dropout 비율과 데이터 증강', '추론 코드의 model.eval() 호출'], a: 0,
      why: 'loss가 아예 안 떨어지는 건 학습 이전의 문제다. Dropout과 증강은 val만 나쁠 때의 처방이고, eval()은 학습 loss와 관계없다.' },
    { q: 'BN이 들어간 CNN의 모든 층에 Dropout을 넣었더니 성능이 떨어졌다. 가장 맞는 설명은?',
      o: ['Dropout이 초기화 분산을 0으로 만들어서', 'BN이 학습 중 Dropout을 꺼 버려서', 'Dropout이 만든 분산 변화를 BN 러닝 통계가 잘못 배워서'], a: 2,
      why: '학습 때 Dropout으로 흔들린 분포가 BN의 러닝 통계에 섞여, 추론 때 쓰는 통계가 어긋난다. 그래서 현대 CNN은 Dropout을 마지막 FC층에만 두곤 한다.' },
  ];

  RA.page({ title: '학습 안정화 — 층별 활성값 분포 실험실', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
