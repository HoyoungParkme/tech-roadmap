/* I-2-1 과적합과 일반화 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, axes, line, hbar, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 데이터: 코드(seed 42)를 그대로 돌린 값 ----------
  // 학습 점 = X_train[:12], 시험 점 = X_test[:6]. 곡선 = 각 모델의 실제 예측 (scratchpad 에서 sklearn 으로 계산해 붙임)
  const trueFn = (x) => 2.5 + 1.8 * Math.sin(0.9 * x);
  const TRAIN = [[0.87, 3.75], [1.54, 3.8], [4.2, 1.48], [5.09, 0.68], [5.93, 1.29], [6.05, 1.42], [6.28, 1.38], [6.3, 1.15], [7.4, 3.07], [8.42, 4.49], [8.66, 4.35], [8.71, 4.86]];
  const TEST = [[0.93, 4.38], [2.05, 3.84], [5.67, 0.88], [6.54, 2.13], [6.7, 2.81], [7.71, 3.73]];
  const C_1 = [[0.87, 2.1], [0.96, 2.11], [1.04, 2.12], [1.13, 2.13], [1.22, 2.14], [1.31, 2.15], [1.4, 2.16], [1.48, 2.17], [1.57, 2.18], [1.66, 2.19], [1.75, 2.2], [1.84, 2.21], [1.92, 2.22], [2.01, 2.23], [2.1, 2.24], [2.19, 2.25], [2.28, 2.26], [2.37, 2.27], [2.45, 2.28], [2.54, 2.29], [2.63, 2.3], [2.72, 2.31], [2.81, 2.32], [2.89, 2.33], [2.98, 2.34], [3.07, 2.34], [3.16, 2.35], [3.25, 2.36], [3.33, 2.37], [3.42, 2.38], [3.51, 2.39], [3.6, 2.4], [3.69, 2.41], [3.77, 2.42], [3.86, 2.43], [3.95, 2.44], [4.04, 2.45], [4.13, 2.46], [4.21, 2.47], [4.3, 2.48], [4.39, 2.49], [4.48, 2.5], [4.57, 2.51], [4.66, 2.52], [4.74, 2.53], [4.83, 2.54], [4.92, 2.55], [5.01, 2.56], [5.1, 2.57], [5.18, 2.58], [5.27, 2.59], [5.36, 2.6], [5.45, 2.61], [5.54, 2.61], [5.62, 2.62], [5.71, 2.63], [5.8, 2.64], [5.89, 2.65], [5.98, 2.66], [6.06, 2.67], [6.15, 2.68], [6.24, 2.69], [6.33, 2.7], [6.42, 2.71], [6.51, 2.72], [6.59, 2.73], [6.68, 2.74], [6.77, 2.75], [6.86, 2.76], [6.95, 2.77], [7.03, 2.78], [7.12, 2.79], [7.21, 2.8], [7.3, 2.81], [7.39, 2.82], [7.47, 2.83], [7.56, 2.84], [7.65, 2.85], [7.74, 2.86], [7.83, 2.87], [7.91, 2.88], [8.0, 2.88], [8.09, 2.89], [8.18, 2.9], [8.27, 2.91], [8.36, 2.92], [8.44, 2.93], [8.53, 2.94], [8.62, 2.95], [8.71, 2.96]];
  const C_4 = [[0.87, 3.68], [0.96, 3.77], [1.04, 3.83], [1.13, 3.88], [1.22, 3.91], [1.31, 3.93], [1.4, 3.93], [1.48, 3.92], [1.57, 3.9], [1.66, 3.87], [1.75, 3.82], [1.84, 3.77], [1.92, 3.71], [2.01, 3.64], [2.1, 3.57], [2.19, 3.48], [2.28, 3.4], [2.37, 3.3], [2.45, 3.21], [2.54, 3.11], [2.63, 3.0], [2.72, 2.9], [2.81, 2.79], [2.89, 2.68], [2.98, 2.57], [3.07, 2.46], [3.16, 2.35], [3.25, 2.24], [3.33, 2.14], [3.42, 2.03], [3.51, 1.93], [3.6, 1.83], [3.69, 1.74], [3.77, 1.64], [3.86, 1.56], [3.95, 1.47], [4.04, 1.39], [4.13, 1.32], [4.21, 1.25], [4.3, 1.18], [4.39, 1.12], [4.48, 1.07], [4.57, 1.03], [4.66, 0.99], [4.74, 0.95], [4.83, 0.92], [4.92, 0.9], [5.01, 0.89], [5.1, 0.88], [5.18, 0.88], [5.27, 0.89], [5.36, 0.9], [5.45, 0.93], [5.54, 0.95], [5.62, 0.99], [5.71, 1.03], [5.8, 1.08], [5.89, 1.13], [5.98, 1.19], [6.06, 1.26], [6.15, 1.34], [6.24, 1.42], [6.33, 1.5], [6.42, 1.59], [6.51, 1.69], [6.59, 1.79], [6.68, 1.9], [6.77, 2.01], [6.86, 2.12], [6.95, 2.24], [7.03, 2.36], [7.12, 2.49], [7.21, 2.62], [7.3, 2.75], [7.39, 2.88], [7.47, 3.01], [7.56, 3.15], [7.65, 3.28], [7.74, 3.41], [7.83, 3.55], [7.91, 3.68], [8.0, 3.81], [8.09, 3.94], [8.18, 4.06], [8.27, 4.18], [8.36, 4.29], [8.44, 4.4], [8.53, 4.51], [8.62, 4.61], [8.71, 4.7]];
  const C_8 = [[0.87, 3.75], [0.96, 3.7], [1.04, 3.68], [1.13, 3.68], [1.22, 3.69], [1.31, 3.71], [1.4, 3.74], [1.48, 3.78], [1.57, 3.81], [1.66, 3.84], [1.75, 3.87], [1.84, 3.89], [1.92, 3.9], [2.01, 3.9], [2.1, 3.9], [2.19, 3.88], [2.28, 3.85], [2.37, 3.81], [2.45, 3.75], [2.54, 3.69], [2.63, 3.62], [2.72, 3.53], [2.81, 3.44], [2.89, 3.33], [2.98, 3.22], [3.07, 3.11], [3.16, 2.98], [3.25, 2.85], [3.33, 2.72], [3.42, 2.59], [3.51, 2.45], [3.6, 2.31], [3.69, 2.18], [3.77, 2.04], [3.86, 1.91], [3.95, 1.78], [4.04, 1.66], [4.13, 1.54], [4.21, 1.43], [4.3, 1.33], [4.39, 1.23], [4.48, 1.14], [4.57, 1.06], [4.66, 0.99], [4.74, 0.93], [4.83, 0.88], [4.92, 0.84], [5.01, 0.81], [5.1, 0.79], [5.18, 0.78], [5.27, 0.78], [5.36, 0.8], [5.45, 0.82], [5.54, 0.85], [5.62, 0.89], [5.71, 0.93], [5.8, 0.99], [5.89, 1.06], [5.98, 1.13], [6.06, 1.21], [6.15, 1.3], [6.24, 1.39], [6.33, 1.49], [6.42, 1.6], [6.51, 1.71], [6.59, 1.83], [6.68, 1.94], [6.77, 2.07], [6.86, 2.19], [6.95, 2.32], [7.03, 2.45], [7.12, 2.59], [7.21, 2.72], [7.3, 2.86], [7.39, 2.99], [7.47, 3.13], [7.56, 3.26], [7.65, 3.4], [7.74, 3.53], [7.83, 3.67], [7.91, 3.8], [8.0, 3.92], [8.09, 4.04], [8.18, 4.16], [8.27, 4.27], [8.36, 4.37], [8.44, 4.46], [8.53, 4.54], [8.62, 4.6], [8.71, 4.64]];
  const C_15 = [[0.87, 3.75], [0.96, 3.1], [1.04, 2.72], [1.13, 2.57], [1.22, 2.61], [1.31, 2.8], [1.4, 3.12], [1.48, 3.53], [1.57, 4.0], [1.66, 4.51], [1.75, 5.03], [1.84, 5.55], [1.92, 6.05], [2.01, 6.51], [2.1, 6.93], [2.19, 7.28], [2.28, 7.57], [2.37, 7.79], [2.45, 7.94], [2.54, 8.0], [2.63, 7.99], [2.72, 7.91], [2.81, 7.76], [2.89, 7.54], [2.98, 7.26], [3.07, 6.93], [3.16, 6.55], [3.25, 6.13], [3.33, 5.69], [3.42, 5.22], [3.51, 4.75], [3.6, 4.27], [3.69, 3.79], [3.77, 3.33], [3.86, 2.89], [3.95, 2.47], [4.04, 2.09], [4.13, 1.74], [4.21, 1.43], [4.3, 1.17], [4.39, 0.96], [4.48, 0.78], [4.57, 0.66], [4.66, 0.57], [4.74, 0.53], [4.83, 0.52], [4.92, 0.55], [5.01, 0.6], [5.1, 0.67], [5.18, 0.76], [5.27, 0.86], [5.36, 0.96], [5.45, 1.06], [5.54, 1.15], [5.62, 1.23], [5.71, 1.29], [5.8, 1.34], [5.89, 1.36], [5.98, 1.37], [6.06, 1.35], [6.15, 1.32], [6.24, 1.29], [6.33, 1.24], [6.42, 1.2], [6.51, 1.16], [6.59, 1.15], [6.68, 1.16], [6.77, 1.21], [6.86, 1.3], [6.95, 1.44], [7.03, 1.64], [7.12, 1.89], [7.21, 2.21], [7.3, 2.57], [7.39, 2.98], [7.47, 3.42], [7.56, 3.88], [7.65, 4.33], [7.74, 4.74], [7.83, 5.1], [7.91, 5.36], [8.0, 5.51], [8.09, 5.52], [8.18, 5.39], [8.27, 5.13], [8.36, 4.78], [8.44, 4.4], [8.53, 4.14], [8.62, 4.19], [8.71, 4.84]];
  const C_ridge = [[0.39, 2.73], [0.54, 3.14], [0.68, 3.47], [0.82, 3.74], [0.96, 3.95], [1.1, 4.11], [1.24, 4.21], [1.38, 4.27], [1.53, 4.28], [1.67, 4.26], [1.81, 4.21], [1.95, 4.12], [2.09, 4.02], [2.23, 3.89], [2.37, 3.74], [2.52, 3.58], [2.66, 3.4], [2.8, 3.22], [2.94, 3.03], [3.08, 2.84], [3.22, 2.65], [3.36, 2.46], [3.5, 2.28], [3.65, 2.1], [3.79, 1.93], [3.93, 1.77], [4.07, 1.62], [4.21, 1.49], [4.35, 1.37], [4.49, 1.26], [4.64, 1.18], [4.78, 1.11], [4.92, 1.06], [5.06, 1.02], [5.2, 1.01], [5.34, 1.02], [5.48, 1.04], [5.63, 1.08], [5.77, 1.15], [5.91, 1.23], [6.05, 1.33], [6.19, 1.44], [6.33, 1.58], [6.47, 1.72], [6.62, 1.88], [6.76, 2.06], [6.9, 2.24], [7.04, 2.44], [7.18, 2.64], [7.32, 2.84], [7.46, 3.05], [7.61, 3.26], [7.75, 3.47], [7.89, 3.68], [8.03, 3.87], [8.17, 4.06], [8.31, 4.23], [8.45, 4.39], [8.59, 4.52], [8.74, 4.64]];
  const fnPts = (fn, a = 0.1, b = 9.2, n = 70) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (i / n) * (b - a); return [x, fn(x)]; });
  const CUR = { true: [fnPts(trueFn), MUT, '진짜 규칙'], deg1: [C_1, WARN, 'degree 1'], deg4: [C_4, GOOD, 'degree 4'], deg8: [C_8, WARN, 'degree 8'], deg15: [C_15, BAD, 'degree 15'], ridge: [C_ridge, GOOD, 'degree 4 + Ridge (120건)'] };

  function plot(x, y, w, h, o) { o = o || {}; return axes(x, y, w, h, { x: [0, 9.5], y: [-0.3, 5.3], xt: o.xt || [0, 3, 6, 9], yt: o.yt || [0, 2, 4], xl: o.xl ?? '광고비 x', yl: o.yl ?? '매출 y' }); }
  function pts(ax, o) { o = o || {}; const tr = o.tr ?? 1, te = o.te ?? 1;
    TRAIN.forEach(([x, y], i) => { const s = clamp(tr * 12 - i); if (s > 0) el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 6 * (0.4 + 0.6 * s), fill: o.trCol || ACC, opacity: s }); });
    TEST.forEach(([x, y], i) => { const s = clamp(te * 6 - i); if (s <= 0) return; const c = o.teCol || ACC;
      if (o.hollow) el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 6.5, fill: PANEL, stroke: c, 'stroke-width': 2.5, opacity: s });
      else el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 6 * (0.4 + 0.6 * s), fill: c, opacity: s }); }); }
  // 곡선: 축 상자 밖으로 튀는 부분은 잘라 낸다 (degree 15 는 점 사이에서 8 까지 솟는다)
  let clipN = 0;
  function curve(ax, key, u, o) { o = o || {}; const [p, col] = CUR[key]; if (u <= 0) return;
    const id = 'i21c' + (clipN++), cp = el('clipPath', { id }); el('rect', { x: ax.x, y: ax.y, width: ax.w, height: ax.h }, cp);
    const n = p.length - 1, kf = clamp(u) * n, i = Math.floor(kf), ps = p.slice(0, i + 1).map(([a, b]) => [ax.X(a), ax.Y(b)]);
    if (i < n) { const f = kf - i; ps.push([ax.X(lerp(p[i][0], p[i + 1][0], f)), ax.Y(lerp(p[i][1], p[i + 1][1], f))]); }
    el('polyline', { points: ps.map((q) => q.join(',')).join(' '), fill: 'none', stroke: o.col || col, 'stroke-width': key === 'true' ? 2 : 3.2, 'stroke-dasharray': key === 'true' ? '6 5' : null, 'stroke-linejoin': 'round', opacity: o.op ?? 1, 'clip-path': `url(#${id})` }); }
  // 오차 게이지: train / test 막대 두 개와 gap (값은 앞 beat 에서 이어짐)
  function gauges(x, y, g, pg, u, o) { o = o || {}; const W = o.w || 300, max = 2.5, tr = tween(pg && pg.train, g.train, u), te = tween(pg && pg.test, g.test, u);
    tx(x, y, g.label, { 'font-size': 15, 'font-weight': 800 });
    tx(x, y + 30, 'train', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' }); hbar(x + 60, y + 18, W, tr, max, { h: 18, col: ACC, text: tr.toFixed(2) });
    tx(x, y + 60, o.teName || 'test', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' }); hbar(x + 60, y + 48, W, te, max, { h: 18, col: te - tr > 0.3 ? BAD : te > 0.5 ? WARN : GOOD, text: te.toFixed(2) }); if (te > max) mono(x + 60 + W - 4, y + 62, '≫', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'end' });
    const gap = te - tr; mono(x + 60, y + 92, `gap ${gap.toFixed(2)}`, { 'font-size': 15, 'font-weight': 800, fill: gap > 0.3 ? BAD : GOOD }); }
  const SPL = [['train', INFO], ['valid', ACC], ['test', WARN]];
  // 10칸 막대 (칸 하나 = 10%)
  function splitBar(x, y, parts, u, o) { o = o || {}; const bw = 38; let i = 0;
    parts.forEach(([name, n, col], pi) => { const x0 = x + i * (bw + 4) + pi * 10;
      for (let j = 0; j < n; j++) { const s = o.pop ? pop(u, o.pop + (i + j) * 0.05) : 1; card(x0 + j * (bw + 4) + bw / 2, y, bw, 44, { rx: 6, fill: col, stroke: 'none', s, op: 0.85 }); }
      const mid = x0 + (n * (bw + 4) - 4) / 2; mono(mid, y + 46, name, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle' });
      if (o.pct) mono(mid, y + 66, `${n * 10}%`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      if (o.lab) o.lab(name, mid, pi);
      i += n; }); }

  // =========================================================
  // 1. 데이터를 나누는 이유 — 금고에 넣은 test
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { // 같은 데이터로 공부하고 채점하면
      const sheet = (cx, cy, s, col, lab) => { const g = R.G(cx, cy, s); [0, 1, 2].forEach((i) => el('rect', { x: -40 + i * 5, y: -50 + i * 5, width: 80, height: 100, rx: 6, fill: PANEL, stroke: col, 'stroke-width': 2 }, g));
        [0, 1, 2, 3].forEach((i) => el('line', { x1: -26, y1: -24 + i * 16, x2: 34, y2: -24 + i * 16, stroke: GRID, 'stroke-width': 3 }, g)); tx(5, 76, lab, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g); };
      sheet(180, 180, pop(u, 0.2), INFO, '학습 데이터');
      grow(240, 180, 400, 180, E(u, 0.5, 0.9), MUT); card(470, 180, 120, 56, { rx: 10, text: 'model.fit', mono: true, fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.8) });
      grow(540, 180, 700, 180, E(u, 1.1, 1.5), MUT); sheet(770, 180, pop(u, 1.3), INFO, '같은 데이터로 채점');
      pill(770, 320, '정확도 99%?', BAD, pop(u, 1.8), { fs: 15 }); if (u > 2.1) cross(840, 320, 13, pop(u, 2.1));
      sub(480, 390, '암기를 실력으로 착각한다 → 평가용 데이터는 격리', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { // seed 42: 몇 번 돌려도 같은 분할
      card(150, 200, 120, 120, { rx: 18, stroke: INK, sw: 2.5, s: pop(u, 0.2) });
      [[-28, -28], [28, 28], [0, 0], [-28, 28], [28, -28]].forEach(([a, b]) => el('circle', { cx: 150 + a, cy: 200 + b, r: 8, fill: INK, opacity: fade(u, 0.4) }));
      pill(150, 300, 'seed = 42', ACC, pop(u, 0.6), { mono: true, fs: 15 });
      [0, 1].forEach((r) => { const y = 150 + r * 110, a = 0.9 + r * 0.6; tx(300, y + 5, `${r + 1}번째 실행`, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, a) });
        for (let j = 0; j < 10; j++) { const col = j < 6 ? INFO : j < 8 ? ACC : WARN; card(420 + j * 46, y, 40, 40, { rx: 6, fill: col, stroke: 'none', op: 0.85, s: pop(u, a + j * 0.04) }); } });
      if (u > 2.1) check(900, 205, 16, pop(u, 2.1));
      sub(620, 330, '같은 조각 위에서만 비교가 성립한다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const ax = plot(60, 70, 400, 270);
    if (k === 2) { curve(ax, 'true', E(u, 0.2, 1.0)); pts(ax, { tr: E(u, 1.0, 2.0), te: E(u, 1.4, 2.2) });
      tx(ax.X(9.4), ax.Y(5.0), '진짜 규칙 (모델은 모른다)', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.8) });
      pill(700, 150, 'y = 2.5 + 1.8·sin(0.9x) + 노이즈', INK, pop(u, 0.4), { fs: 14 });
      pill(700, 200, 'rng.normal(0, 0.3)', MUT, pop(u, 0.8), { mono: true, fs: 13.5 });
      mono(700, 260, '200건 생성', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      sub(700, 290, '(그림은 그중 18점)', fade(u, 1.4)); return; }
    // k >= 3: 분할
    const te = k === 3 ? fade(u, 0.6) : 1;
    pts(ax, { trCol: INFO, teCol: te > 0.5 ? WARN : INFO, hollow: te > 0.5 });
    const parts = k === 3 ? [['train+valid', 8, INFO], ['test', 2, WARN]] : [['train', 6, INFO], ['valid', 2, ACC], ['test', 2, WARN]];
    const cnt = { train: 120, valid: 40, test: 40 };
    splitBar(500, 120, parts, u, { pop: k === 3 ? 0.2 : k === 4 ? 0.2 : null, pct: k <= 4, lab: (name, mid, pi) => {
      if (k === 5) mono(mid, 186, String(Math.round(lerp(0, cnt[name], E(u, 0.3 + pi * 0.3, 1.2 + pi * 0.3)))), { 'font-size': 20, 'font-weight': 800, fill: SPL.find((q) => q[0] === name)[1], 'text-anchor': 'middle' });
      if (k === 6) { const role = { train: 'fit() 에만', valid: '선택에 · 여러 번', test: '마지막 한 번' }[name]; tx(mid, 196, role, { 'font-size': 14, 'font-weight': 700, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 0.3 + pi * 0.4) }); } } });
    const lx = 500 + 8 * 42 + 20 + 19; lock(k === 3 ? 500 + 8 * 42 + 10 + 40 : lx + 2, 82, true, WARN, k === 3 ? pop(u, 0.9) : 1);
    if (k === 3) sub(700, 250, '20% 를 먼저 봉인 — 마지막까지 안 연다', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 4) { mono(700, 250, '0.8 × 0.25 = 0.2', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9) }); sub(700, 280, '남은 80% 에서 다시 25% → valid', fade(u, 1.3), { 'font-size': 15, fill: INK }); }
    if (k === 5) { mono(700, 250, 'print(len(...)) → 120 40 40', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 6) { sub(700, 260, 'test 를 보고 모델을 고치면', fade(u, 1.6), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); sub(700, 284, 'test 는 valid 가 된다', fade(u, 1.8), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); } }

  // =========================================================
  // 2. 차수를 올리면 — train 은 내려가고 test 는 튄다
  // =========================================================
  const DEG = [1, 4, 8, 15], YMAX = 2.5;
  function errChart(rows, prows, u, o) { o = o || {}; const ax = axes(560, 90, 340, 230, { x: [0, 4], y: [0, YMAX], yt: [0, 1, 2], yl: 'MSE', xl: '차수', grid: true });
    DEG.forEach((d, i) => mono(ax.X(i + 0.5), ax.Y(0) + 20, String(d), { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }));
    rows.forEach((r, i) => { const fresh = i >= prows.length, g = fresh ? E(u, 0.6, 1.4) : 1, xi = ax.X(i + 0.5), bw = 26;
      [['train', ACC, -1], ['test', r.test - r.train > 0.3 ? BAD : WARN, 1]].forEach(([key, col, sd]) => { const over = r[key] > YMAX, v = Math.min(r[key], YMAX) * g, top = ax.Y(v), x0 = xi + (sd < 0 ? -bw - 2 : 2);
        const dim = o.only && o.only !== key ? 0.25 : 1;
        el('rect', { x: x0, y: top, width: bw, height: ax.Y(0) - top, rx: 3, fill: col, opacity: 0.85 * dim });
        if (over && g > 0.9) { el('rect', { x: x0 - 2, y: ax.Y(YMAX * 0.82), width: bw + 4, height: 7, fill: PANEL }); }
        if (g > 0.6) mono(sd < 0 ? xi - 2 : xi + 2, top - 6, r[key].toFixed(2), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': sd < 0 ? 'end' : 'start', fill: col, opacity: dim }); }); });
    pill(640, 66, '■ train', ACC, 1, { fs: 13.5 }); pill(740, 66, '■ test', WARN, 1, { fs: 13.5 }); return ax; }
  function s2(t, c) { const { k, u } = c, rows = (c.beat.degreeTable && c.beat.degreeTable.rows) || [], prows = (c.prev && c.prev.degreeTable && c.prev.degreeTable.rows) || [];
    const ax = plot(40, 70, 440, 270);
    pts(ax, { teCol: WARN, hollow: true }); curve(ax, 'true', 1);
    const cv = c.beat.chart.curves.filter((q) => q !== 'true'), pcv = c.prev ? c.prev.chart.curves.filter((q) => q !== 'true') : [];
    cv.forEach((key) => curve(ax, key, pcv.includes(key) ? 1 : E(u, 0.2, 1.2)));
    if (cv.length) { const lab = CUR[cv[0]][2]; pill(400, 40, lab, CUR[cv[0]][1], pcv.includes(cv[0]) ? 1 : pop(u, 0.4), { fs: 14 }); }
    pill(150, 370, '● train 12건   ○ test', MUT, 1, { fs: 13.5 });
    if (k <= 1) { // 실험 준비
      if (k === 0) { tx(560, 120, '차수 = 곡선이 구불거릴 수 있는 정도', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
        el('line', { x1: 580, y1: 200, x2: 900, y2: 200, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
        DEG.forEach((d, i) => { const x = 580 + (d - 1) / 14 * 320; mono(x, 232, String(d), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT }); });
        const kx = 580 + 320 * E(u, 0.8, 2.2); el('circle', { cx: kx, cy: 200, r: 11, fill: ACC });
        sub(740, 280, '관찰: train 오차 · test 오차 두 숫자', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      else { ['PolynomialFeatures', 'LinearRegression', 'mean_squared_error'].forEach((s, i) => pill(730, 120 + i * 48, s, INK, pop(u, 0.3 + i * 0.25), { mono: true, fs: 14 }));
        pill(730, 290, 'from split_data import …', ACC, pop(u, 1.4), { mono: true, fs: 14 }); sub(730, 330, '분할은 Step 1 것을 그대로', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      return; }
    errChart(rows, prows, u, { only: k === 6 && u < 1.2 ? 'train' : null });
    const last = rows[rows.length - 1], gp = last ? (last.test - last.train).toFixed(2) : '';
    if (k === 5) pill(730, 380, `학습 점을 전부 관통 · test ${last.test.toFixed(2)}`, BAD, pop(u, 1.6), { fs: 14 });
    if (k === 6) { pill(730, 380, 'train 만 보면 degree 15 가 "최고"', WARN, pop(u, 0.3), { fs: 14 }); if (u > 1.4) { cross(870, 380, 12, pop(u, 1.4)); } }
    if (k === 3) pill(730, 380, `gap ${gp} — 건강하다`, GOOD, pop(u, 1.6), { fs: 14 });
    if (k === 4) pill(730, 380, `gap ${(prows[prows.length - 1].test - prows[prows.length - 1].train).toFixed(2)} → ${gp} — 갈라진다`, WARN, pop(u, 1.6), { fs: 14 });
    if (k === 2) pill(730, 380, '둘 다 나쁨 — 그릇이 작다', WARN, pop(u, 1.6), { fs: 14 }); }

  // =========================================================
  // 3. 진단 — 과소적합인가 과적합인가
  // =========================================================
  function s3(t, c) { const { k, u } = c, gs = c.beat.gauges || [], pgs = (c.prev && c.prev.gauges) || [];
    if (k === 0) { // 복잡도 축의 양쪽 낭떠러지
      const y = 220; el('path', { d: `M80,${y + 120} L140,${y} L820,${y} L880,${y + 120}`, fill: 'none', stroke: INK, 'stroke-width': 3, opacity: fade(u, 0.2) });
      el('rect', { x: 140, y, width: 680, height: 14, fill: SOFT, opacity: fade(u, 0.2) });
      tx(480, y + 50, '모델 복잡도 →', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 });
      card(150, 140, 200, 70, { rx: 12, text: '과소적합\n너무 단순', fs: 15, stroke: WARN, color: WARN, s: pop(u, 0.8) });
      card(810, 140, 200, 70, { rx: 12, text: '과적합\n너무 복잡', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.1) });
      card(480, 140, 180, 54, { rx: 12, text: '적정', fs: 16, stroke: GOOD, color: GOOD, s: pop(u, 1.5) });
      sub(480, 390, '"오차가 크다" 는 같아도 처방은 정반대 — 진단이 먼저', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { splitBar(240, 160, [['train', 6, INFO], ['valid', 2, ACC], ['test', 2, WARN]], u, { pct: true });
      lock(240 + 8 * 42 + 20 + 40, 120, true, WARN, pop(u, 0.4));
      el('rect', { x: 228, y: 128, width: 8 * 42 + 24, height: 108, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: fade(u, 0.8) });
      tx(240, 270, '진단에 쓰는 것 = train + valid', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      tx(240, 300, '진단은 여러 번 반복한다 → test 는 여기서도 봉인', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { card(300, 200, 260, 56, { rx: 10, text: 'diagnose(degree) -> str', mono: true, fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      [['"underfit"', WARN], ['"overfit"', BAD], ['"good"', GOOD]].forEach(([s, col], i) => { grow(430, 200, 600, 110 + i * 90, E(u, 0.6 + i * 0.25, 1.0 + i * 0.25), col); pill(680, 110 + i * 90, s, col, pop(u, 1.0 + i * 0.25), { mono: true, fs: 15 }); });
      sub(300, 330, '"오차가 크다" 대신 상태 이름으로 부른다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 7) { // 학생 비유
      const S = [['공부 안 한 학생', '모의고사도 ✗ · 수능 ✗', '과소적합', WARN], ['기출 답만 외운 학생', '모의고사 ✓ · 수능 ✗', '과적합', BAD], ['원리를 익힌 학생', '모의고사 ✓ · 수능 ✓', '적정', GOOD]];
      S.forEach(([a, b, d, col], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.4); person(x, 150, null, { s, stroke: col });
        tx(x, 230, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); tx(x, 258, b, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: s });
        pill(x, 300, d, col, pop(u, 0.6 + i * 0.4), { fs: 15 }); });
      sub(480, 380, 'degree 1 = 직선 · degree 15 = 암기 · degree 4 = 적정', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // 산점도 + 측정
    const ax = plot(40, 70, 420, 270); pts(ax, { teCol: ACC, hollow: true }); curve(ax, 'true', 1);
    const cv = c.beat.chart.curves.filter((q) => q !== 'true'), pcv = c.prev ? c.prev.chart.curves.filter((q) => q !== 'true') : [];
    cv.forEach((key) => curve(ax, key, pcv.includes(key) ? 1 : E(u, 0.2, 1.2)));
    if (k === 6) curve(ax, 'deg4', E(u, 0.2, 1.2));
    if (k <= 5) gs.forEach((g, i) => gauges(530, 96 + i * 140, Object.assign({}, g, { label: g.label }), pgs[i], u, { w: 280, teName: 'valid' }));
    if (k === 4) { pill(700, 330, `mse_tr ${gs[0].train.toFixed(2)} > 0.5 → "underfit"`, WARN, pop(u, 1.4), { mono: true, fs: 13.5 }); sub(700, 366, '처방: 복잡도 ↑', fade(u, 1.8), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }
    if (k === 5) { pill(700, 380, `gap ${(gs[1].test - gs[1].train).toFixed(2)} > 0.3 → "overfit"`, BAD, pop(u, 1.4), { mono: true, fs: 13.5 }); }
    if (k === 6) { const R3 = [['1', 'underfit', WARN], ['4', 'good', GOOD], ['15', 'overfit', BAD]];
      tx(560, 110, 'for d in [1, 4, 15]:', { 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.2) });
      R3.forEach(([d, s, col], i) => { const y = 160 + i * 60; mono(580, y + 5, `degree ${d}`, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) }); pill(780, y, s, col, pop(u, 0.7 + i * 0.4), { mono: true, fs: 15 }); });
      sub(690, 360, 'degree 4: train 0.03 · valid 0.26 — gap < 0.3', fade(u, 2.0), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); } }

  // =========================================================
  // 4. 편향과 분산 — 평행세계 300개
  // =========================================================
  const bias2 = (t) => 0.85 * Math.exp(-4.2 * t) + 0.015, varr = (t) => 0.03 + 0.9 * Math.pow(t, 3.2), NOISE = 0.09;
  const total = (t) => bias2(t) + varr(t) + NOISE;
  const BEST = (() => { let b = 0, v = 99; for (let i = 0; i <= 60; i++) { const tt = i / 60; if (total(tt) < v) { v = total(tt); b = tt; } } return b; })();
  // 평행세계 하나의 예측 곡선 (그림용 흔들림: 세계 w 마다 다른 위상·높이)
  const world = (w) => (x) => trueFn(x) - 0.05 + (rnd(w) - 0.5) * 0.7 + (rnd(w + 40) - 0.5) * 0.6 * Math.sin(1.3 * x + rnd(w + 80) * 6);
  const rnd = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
  function board(cx, cy, r, hits, title, col, u, a) { [1, 0.66, 0.33].forEach((f, i) => el('circle', { cx, cy, r: r * f, fill: i === 2 ? C.GOODBG : PANEL, stroke: GRID, 'stroke-width': 2 }));
    el('circle', { cx, cy, r: 4, fill: INK });
    hits.forEach(([dx, dy], i) => { const s = pop(u, a + i * 0.08); if (s > 0) el('circle', { cx: cx + dx * r, cy: cy + dy * r, r: 6 * s, fill: col }); });
    tx(cx, cy + r + 28, title, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); }
  function stack(x, y, w, b, v, n, u, o) { o = o || {}; const max = 2.0, tot = b + v + n, sc = tot > max ? max / tot : 1, L = (q) => (w * q * sc) / max;
    const g = o.grow ? E(u, 0.3, 1.3) : 1; let xx = x;
    [[b, WARN, '편향²'], [v, BAD, '분산'], [n, OFF, '노이즈']].forEach(([q, col]) => { const ww = Math.max(1.5, L(q) * g); el('rect', { x: xx, y, width: ww, height: 24, fill: col, opacity: 0.85 }); xx += ww; });
    if (sc < 1 && g > 0.8) { el('rect', { x: x + w * 0.55, y: y - 3, width: 8, height: 30, fill: PANEL, transform: `skewX(-15)` }); }
    if (g > 0.8) mono(xx + 8, y + 18, tot.toFixed(2), { 'font-size': 15, 'font-weight': 800, fill: o.best ? GOOD : tot > max ? BAD : INK }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { // 다트판 두 개 + 식
      const hitsB = [[0.45, -0.35], [0.5, -0.28], [0.4, -0.42], [0.55, -0.4], [0.47, -0.3]], hitsV = [[-0.5, 0.3], [0.6, -0.1], [0.1, 0.62], [-0.3, -0.55], [0.35, 0.4]];
      board(230, 170, 95, hitsB, '편향 큼: 늘 같은 쪽으로 빗나감', WARN, u, 0.4); board(700, 170, 95, hitsV, '분산 큼: 평균은 맞는데 흩어짐', BAD, u, 1.0);
      banner(480, 370, '기대 test 오차 = 편향² + 분산 + 노이즈', pop(u, 1.8)); return; }
    if (k <= 3) { const ax = plot(80, 70, 520, 280, { xl: 'x', yl: '예측' });
      curve(ax, 'true', 1);
      if (k === 1) { for (let i = 0; i < 50; i++) { const x = (9 * i) / 49, s = fade(u, 0.2 + i * 0.03, 0.2); el('line', { x1: ax.X(x), y1: ax.Y(-0.3), x2: ax.X(x), y2: ax.Y(-0.3) - 12, stroke: ACC, 'stroke-width': 2, opacity: s }); }
        pill(780, 140, 'x_eval = linspace(0, 9, 50)', ACC, pop(u, 0.4), { mono: true, fs: 13.5 }); pill(780, 190, 'seed 0', INK, pop(u, 0.9), { mono: true, fs: 14 });
        sub(780, 240, '매번 같은 50곳에서 잰다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      const nShow = k === 2 ? Math.round(lerp(0, 24, E(u, 0.2, 2.2))) : 24;
      for (let w = 0; w < nShow; w++) line(ax, fnPts(world(w), 0.1, 9.2, 40), 1, INFO, { sw: 1.5, op: 0.35 });
      const n = k === 2 ? Math.round(lerp(0, 300, E(u, 0.2, 2.2))) : 300;
      mono(780, 130, `세계 ${n} / 300`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
      sub(780, 160, '세계마다 표본 30개를 새로 뽑아 학습', 1, { 'font-size': 14 });
      sub(780, 182, '(그림의 선은 그중 일부)', 1);
      if (k === 3) { const mean = (x) => { let s = 0; for (let w = 0; w < 24; w++) s += world(w)(x); return s / 24; };
        // 흩어짐 띠
        const band = fnPts((x) => x, 0.1, 9.2, 30).map(([x]) => { let s = 0, m = mean(x); for (let w = 0; w < 24; w++) s += (world(w)(x) - m) ** 2; return [x, m, Math.sqrt(s / 24)]; });
        const op = fade(u, 0.3); el('path', { d: 'M' + band.map(([x, m, sd]) => `${ax.X(x)},${ax.Y(m + sd)}`).join(' L') + ' L' + band.slice().reverse().map(([x, m, sd]) => `${ax.X(x)},${ax.Y(m - sd)}`).join(' L') + ' Z', fill: BAD, opacity: 0.18 * op });
        line(ax, fnPts(mean, 0.1, 9.2, 40), E(u, 0.8, 1.6), INK, { sw: 3.5 });
        pill(780, 230, '평균 예측 − 정답 → 편향²', WARN, pop(u, 1.2), { fs: 14 }); pill(780, 280, '예측이 흩어진 폭 → 분산', BAD, pop(u, 1.6), { fs: 14 });
        sub(780, 330, '굵은 선 = 300개 예측의 평균', fade(u, 1.8), { 'font-size': 14, fill: INK }); }
      return; }
    // k >= 4: U 곡선 + 세 지점 막대
    const ax = axes(70, 70, 400, 280, { x: [0, 1], y: [0, 1.2], yl: '오차', xl: '복잡도 →' });
    const mk = (fn) => fnPts((tt) => Math.min(1.2, fn(tt)), 0, 1, 60);
    const g = k === 4 ? E(u, 0.2, 1.2) : 1;
    el('line', { x1: ax.X(0), y1: ax.Y(NOISE), x2: ax.X(1), y2: ax.Y(NOISE), stroke: MUT, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    line(ax, mk(bias2), g, WARN); line(ax, mk(varr), g, BAD); line(ax, mk(total), g, ACC, { sw: 3.5 });
    tx(ax.X(0.2), ax.Y(0.44), '편향²', { 'font-size': 14, 'font-weight': 800, fill: WARN }); tx(ax.X(0.98), ax.Y(0.75), '분산', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
    tx(ax.X(0.62), ax.Y(0.5), '합계', { 'font-size': 14, 'font-weight': 800, fill: ACC }); tx(ax.X(1), ax.Y(NOISE) - 8, '노이즈 0.09', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    const marks = [[0.02, 'deg 1'], [BEST, 'deg 4'], [0.98, 'deg 15']];
    marks.slice(0, k - 3).forEach(([tt, n], i) => { const now = i === k - 4, s = now ? pop(u, 1.0) : 1, yv = Math.min(1.2, total(tt));
      el('circle', { cx: ax.X(tt), cy: ax.Y(yv), r: 7 * s, fill: i === 1 ? GOOD : INK }); mono(ax.X(tt) + (i === 2 ? -10 : 10), ax.Y(yv) - 10, n, { 'font-size': 14, 'font-weight': 800, 'text-anchor': i === 2 ? 'end' : 'start', opacity: s }); });
    // 오른쪽: 세 지점의 분해 막대
    const rows = c.beat.biasVar.rows, had = c.prev && c.prev.biasVar ? c.prev.biasVar.rows.length : 0;
    tx(70, 404, 'U자는 모양을 보여 주는 개념도 · 실제 값은 오른쪽 막대', { 'font-size': 13.5, fill: MUT });
    tx(530, 90, '편향² + 분산 + 노이즈', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    rows.forEach((r, i) => { const y = 130 + i * 84, fresh = i >= had, op = fresh ? fade(u, 0.3) : 1;
      tx(530, y, r.name, { 'font-size': 15, 'font-weight': 800, opacity: op });
      if (op > 0) stack(530, y + 12, 300, r.bias, r.varr, r.noise, u, { grow: fresh, best: i === 1 });
      mono(530, y + 56, `${r.bias.toFixed(2)} + ${r.varr.toFixed(2)} + ${r.noise.toFixed(2)}`, { 'font-size': 13.5, fill: MUT, opacity: fresh ? fade(u, 1.2) : 1 }); });
    if (k === 6) sub(700, 400, '노이즈 0.09 는 어떤 모델도 못 없앤다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 5. 처방 — 규제와 learning curve, 그리고 금고 열기
  // =========================================================
  // learning curve 측정점 (코드 주석의 세 지점)
  const LC = [[9, 0.03, 0.52], [58, 0.11, 0.13], [96, 0.10, 0.12]];
  function s5(t, c) { const { k, u } = c, g = c.beat.gauges[0], pg = c.prev && c.prev.gauges ? c.prev.gauges[0] : null;
    if (k <= 2) { const ax = plot(40, 70, 420, 270); pts(ax, { teCol: WARN, hollow: true }); curve(ax, 'true', 1);
      if (k < 2) curve(ax, 'deg15', 1); else { curve(ax, 'deg15', 1, { op: 1 - E(u, 0.3, 1.2) }); curve(ax, 'ridge', E(u, 0.8, 1.8)); }
      gauges(530, 96, g, pg, u, { w: 280, teName: k === 2 ? 'valid' : 'test' });
      if (k === 0) { pill(640, 300, '처방 1: Ridge', ACC, pop(u, 0.6), { fs: 15 }); pill(640, 350, '처방 2: learning curve', INFO, pop(u, 1.0), { fs: 15 }); }
      if (k === 1) { pill(640, 300, 'from sklearn.linear_model import Ridge', INK, pop(u, 0.3), { mono: true, fs: 13.5 }); pill(640, 350, 'split_data 재사용', MUT, pop(u, 0.8), { fs: 14 }); }
      if (k === 2) { // 벌점: 가중치가 작아진다 (모양만)
        tx(530, 290, '손실 + α·Σw²  (alpha=0.1)', { 'font-size': 15, 'font-weight': 800, fill: ACC, class: 'mono', opacity: fade(u, 0.3) });
        [0.9, 0.7, 1.0, 0.6, 0.8].forEach((w, i) => { const h = 60 * w * lerp(1, 0.35, E(u, 0.8, 1.8)); el('rect', { x: 540 + i * 34, y: 380 - h, width: 22, height: h, rx: 3, fill: ACC, opacity: 0.8 }); });
        sub(800, 360, '가중치 w 가 눌린다', fade(u, 1.4), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
      return; }
    if (k <= 4) { const ax = axes(70, 70, 420, 280, { x: [0, 100], y: [0, 0.6], xt: [9, 58, 96], yt: [0, 0.2, 0.4], yl: 'MSE', xl: '학습 데이터 n', grid: true });
      const gr = k === 3 ? E(u, 0.4, 2.0) : 1;
      line(ax, LC.map(([n, tr]) => [n, tr]), gr, ACC); line(ax, LC.map(([n, , va]) => [n, va]), gr, WARN);
      LC.forEach(([n, tr, va], i) => { const s = k === 3 ? pop(u, 0.4 + i * 0.6) : 1; el('circle', { cx: ax.X(n), cy: ax.Y(tr), r: 6 * s, fill: ACC }); el('circle', { cx: ax.X(n), cy: ax.Y(va), r: 6 * s, fill: WARN }); });
      tx(ax.X(44), ax.Y(0.035), 'train', { 'font-size': 14, 'font-weight': 800, fill: ACC }); tx(ax.X(14), ax.Y(0.52) + 5, 'valid (cv=5)', { 'font-size': 14, 'font-weight': 800, fill: WARN });
      if (k === 3) { pill(730, 140, 'train_sizes = linspace(0.1, 1.0, 8)', INK, pop(u, 0.2), { mono: true, fs: 13.5 }); sub(730, 180, '8지점 중 코드에 찍힌 3지점', fade(u, 0.8), { 'font-size': 14 });
        sub(730, 230, '돈 쓰기 전에 데이터 추가의 약효를 본다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      if (k === 4) { [[9, 0.03, 0.52, 0.49, BAD], [96, 0.10, 0.12, 0.02, GOOD]].forEach(([n, a, b, gp, col], i) => { const p = E(u, 0.3 + i * 0.8, 0.9 + i * 0.8);
          el('line', { x1: ax.X(n) + 14, y1: ax.Y(a), x2: ax.X(n) + 14, y2: lerp(ax.Y(a), ax.Y(b), p), stroke: col, 'stroke-width': 3 });
          mono(ax.X(n) + (i ? -20 : 22), (ax.Y(a) + ax.Y(b)) / 2, `gap ${gp.toFixed(2)}`, { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': i ? 'end' : 'start', opacity: p }); });
        sub(730, 150, 'gap 이 남아 있으면 → 데이터 추가 약효 있음', fade(u, 1.8), { 'font-size': 14, fill: INK, 'font-weight': 700 });
        sub(730, 176, '높은 곳에서 붙으면 → 모델을 바꾼다', fade(u, 2.1), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
      return; }
    if (k === 5) { // 금고를 한 번 연다
      const op = E(u, 0.2, 0.9); lock(160, 150, op < 0.5, WARN, 1.6);
      tx(160, 210, 'test 40건', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
      fly(200, 150, 470, 150, seg(u, 0.8, 1.5), 'X_test', { fill: WARN, mono: true });
      gauges(530, 96, g, pg, u, { w: 280 });
      if (u > 1.8) { check(880, 296, 16, pop(u, 1.8)); }
      pill(680, 300, '배포를 논할 수 있는 모양', GOOD, pop(u, 1.9), { fs: 15 });
      sub(480, 380, '이 숫자를 보고 또 고치면 test 가 오염된다 — 고칠 거면 valid 로', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // 처방전
    const p = c.beat.prescription, pp = c.prev && c.prev.prescription;
    [['과적합 (gap 큼)', p.overfit, pp && pp.overfit, BAD, 40], ['과소적합 (train 부터 나쁨)', p.underfit, pp && pp.underfit, WARN, 490]].forEach(([h, items, pitems, col, x]) => {
      el('rect', { x, y: 40, width: 430, height: 290, rx: 14, fill: PANEL, stroke: col, 'stroke-width': 2.5 });
      tx(x + 20, 74, h, { 'font-size': 16, 'font-weight': 800, fill: col });
      items.forEach((s, i) => { const fresh = !pitems || i >= pitems.length, a = 0.3 + (pitems ? i - pitems.length : i) * 0.35, op = fresh ? fade(u, a) : 1;
        el('circle', { cx: x + 30, cy: 114 + i * 52, r: 5, fill: col, opacity: op });
        tx(x + 44, 119 + i * 52, s, { 'font-size': 15, 'font-weight': 600, opacity: op }); }); });
    if (k === 7) banner(480, 380, '돈 쓰기 전에 learning curve 부터', pop(u, 1.8));
    else sub(480, 380, '방향이 정반대 — 진단을 건너뛰면 더 나빠질 수 있다', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: 'test 데이터를 보며 모델을 여러 번 고치면 어떻게 되나?',
      o: ['test 가 사실상 valid 가 되어 오염된다', 'test 성적을 더 믿을 수 있게 된다', '문제없다 — test 는 몇 번 봐도 된다'], a: 0,
      why: 'test 는 마지막에 딱 한 번만 보는 수능이다. 보고 고치는 순간 "본 적 없는 데이터"가 아니게 된다.' },
    { q: '차수 15 모델이 train 0.00, test 32.31 을 기록했다. 이 상태는 무엇인가?',
      o: ['과소적합', '과적합 — 노이즈까지 외웠다', '가장 좋은 모델'], a: 1,
      why: '학습 점 12개를 전부 관통했지만 새 데이터에서 무너졌다. train 0.00 은 완벽한 모델이 아니라 완벽한 암기의 증거다.' },
    { q: 'train 오차부터 크게 나온다면 진단과 처방은 무엇인가?',
      o: ['과적합 — 데이터를 더 모은다', '과적합 — 규제를 건다', '과소적합 — 복잡도를 올린다'], a: 2,
      why: '공부용 데이터조차 못 맞히면 그릇이 작은 것이다. 이때 데이터를 더 모으는 것은 돈만 태우는 처방이다.' },
    { q: '다항 회귀의 차수를 올리면 편향²과 분산은 어떻게 움직이나?',
      o: ['편향²은 내려가고 분산은 올라간다', '둘 다 내려간다', '편향²은 올라가고 분산은 내려간다'], a: 0,
      why: '차수 15는 편향² 0.05 로 가장 작지만 분산이 116.70 으로 터진다. 둘의 합이 U자를 그리고 바닥이 최적 복잡도다.' },
    { q: 'learning curve 에서 두 오차 곡선이 이미 높은 곳에서 붙어 수렴했다면 어떻게 해야 하나?',
      o: ['데이터를 더 모은다', '모델을 바꾼다 — 피처·복잡도를 올린다', 'test 를 보고 alpha 를 다시 고른다'], a: 1,
      why: '높은 곳에서 수렴한 것은 과소적합형이라 데이터를 부어도 소용없다. gap 이 남아 있을 때만 데이터 추가가 약효가 있다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '학습에 쓴 데이터로 채점하면 암기를 실력으로 착각한다. 그래서 데이터를 나누고 시험용은 끝에 한 번만 본다.',
    '차수를 올리면 학습 오차는 계속 줄지만 시험 오차는 다시 오른다. 차수 15는 train 0.00, test 32.31이었다.',
    '너무 단순하면 편향이, 너무 복잡하면 분산이 커진다. 둘의 합이 U자를 그리고 그 바닥이 적정 복잡도다.',
    '처방은 진단을 따른다. 차수 4에 Ridge를 걸자 test 0.19, gap 0.09로 과적합이 잡혔다.',
  ];
  const review = [
    { q: '전체 데이터에 스케일링을 먼저 걸고 그다음 학습용과 시험용으로 나눴다. 무엇이 문제인가?',
      o: ['스케일링 때문에 차수를 올릴 수 없다', '시험용 데이터의 정보가 학습 쪽으로 새어 든다', '학습용 데이터가 줄어 과소적합이 된다'], a: 1,
      why: '분할은 실험 맨 앞에서 한 번 하고 전처리는 그 뒤에 한다. 전체에 먼저 걸면 시험용 값이 전처리 기준에 섞여 점수가 부풀 수 있다.' },
    { q: '결정트리의 깊이를 계속 키웠더니 학습 데이터는 거의 다 맞히는데 새 데이터 성적은 떨어진다. 이 챕터의 눈으로 보면?',
      o: ['분산이 커진 과적합이다', '편향이 커진 과소적합이다', '노이즈가 사라진 최적 상태다'], a: 0,
      why: '트리 깊이도 차수처럼 복잡도 손잡이다. 깊어질수록 편향은 줄지만 표본마다 모델이 크게 달라지는 분산이 커진다.' },
    { q: '팀이 오차 0을 목표로 차수와 규제를 끝없이 바꾸고 있다. 이 목표가 틀린 이유는?',
      o: ['규제는 분산을 줄이지 못하기 때문', '시험 오차는 차수 1에서 늘 가장 낮기 때문', '데이터의 노이즈는 어떤 모델로도 없앨 수 없기 때문'], a: 2,
      why: '기대 오차는 편향² + 분산 + 노이즈다. 앞의 둘은 복잡도와 규제로 조절하지만 노이즈는 데이터 자체의 한계라 남는다.' },
  ];

  RA.page({ title: '과적합과 일반화', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
