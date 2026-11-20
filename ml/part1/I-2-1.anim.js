/* I-2-1 과적합과 일반화 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, axes, line, hbar, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 페이지의 데이터 (광고비 x → 매출 y) ----------
  const trueFn = (x) => 2.5 + 1.8 * Math.sin(0.9 * x);
  const deg1Fn = (x) => 2.55 - 0.02 * x;
  const deg4Fn = (x) => 2.45 + 1.72 * Math.sin(0.9 * x + 0.04);
  const TRAIN = [[0.4, 3.38], [1.1, 3.70], [1.8, 4.50], [2.6, 3.44], [3.3, 3.11], [4.1, 1.31], [4.9, 1.08], [5.6, 0.60], [6.4, 1.96], [7.2, 2.55], [7.9, 4.06], [8.7, 4.00]];
  const TEST = [[0.8, 3.84], [2.2, 3.95], [3.7, 2.36], [5.2, 0.55], [6.8, 2.46], [8.3, 3.99]];
  const fnPts = (fn, a = 0.1, b = 9.2, n = 70) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (i / n) * (b - a); return [x, fn(x)]; });
  // 과적합 곡선: 학습 점을 전부 지나며 사이에서 출렁 (페이지의 Catmull-Rom 과 같은 식)
  const OVER = (() => { const P = [[-0.2, 1.2], ...TRAIN, [9.4, 1.0]], out = [P[1]], kk = 2.4;
    for (let i = 1; i < P.length - 2; i++) { const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
      const c1 = [p1[0] + (p2[0] - p0[0]) / kk, p1[1] + (p2[1] - p0[1]) / kk], c2 = [p2[0] - (p3[0] - p1[0]) / kk, p2[1] - (p3[1] - p1[1]) / kk];
      for (let j = 1; j <= 10; j++) { const t = j / 10, m = 1 - t; out.push([0, 1].map((d) => m * m * m * p1[d] + 3 * m * m * t * c1[d] + 3 * m * t * t * c2[d] + t * t * t * p2[d])); } }
    return out; })();
  const CUR = { true: [fnPts(trueFn), MUT, '진짜 규칙'], deg1: [fnPts(deg1Fn), WARN, 'degree 1'], deg4: [fnPts(deg4Fn), GOOD, 'degree 4'], deg15: [OVER, BAD, 'degree 15'] };

  function plot(x, y, w, h, o) { o = o || {}; return axes(x, y, w, h, { x: [0, 9.5], y: [-0.3, 5.3], xt: o.xt || [0, 3, 6, 9], yt: o.yt || [0, 2, 4], xl: o.xl ?? '광고비 x', yl: o.yl ?? '매출 y' }); }
  function pts(ax, o) { o = o || {}; const tr = o.tr ?? 1, te = o.te ?? 1;
    TRAIN.forEach(([x, y], i) => { const s = clamp(tr * 12 - i); if (s > 0) el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 6 * (0.4 + 0.6 * s), fill: o.trCol || ACC, opacity: s }); });
    TEST.forEach(([x, y], i) => { const s = clamp(te * 6 - i); if (s <= 0) return; const c = o.teCol || ACC;
      if (o.hollow) el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 6.5, fill: PANEL, stroke: c, 'stroke-width': 2.5, opacity: s });
      else el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 6 * (0.4 + 0.6 * s), fill: c, opacity: s }); }); }
  function curve(ax, key, u, o) { o = o || {}; const [p, col] = CUR[key]; line(ax, p, u, o.col || col, { sw: key === 'true' ? 2 : 3.2, dash: key === 'true' ? '6 5' : null, op: o.op }); }
  // 오차 게이지: train / test 막대 두 개와 gap (값은 앞 beat 에서 이어짐)
  function gauges(x, y, g, pg, u, o) { o = o || {}; const W = o.w || 300, max = 1.8, tr = tween(pg && pg.train, g.train, u), te = tween(pg && pg.test, g.test, u);
    tx(x, y, g.label, { 'font-size': 15, 'font-weight': 800 });
    tx(x, y + 30, 'train', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' }); hbar(x + 60, y + 18, W, tr, max, { h: 18, col: ACC, text: tr.toFixed(2) });
    tx(x, y + 60, o.teName || 'test', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' }); hbar(x + 60, y + 48, W, te, max, { h: 18, col: te - tr > 0.3 ? BAD : te > 0.5 ? WARN : GOOD, text: te.toFixed(2) });
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
  const DEG = [1, 3, 8, 15];
  function errChart(rows, prows, u, o) { o = o || {}; const ax = axes(560, 90, 340, 230, { x: [0, 4], y: [0, 1.8], yt: [0, 0.5, 1, 1.5], yl: 'MSE', xl: '차수', grid: true });
    DEG.forEach((d, i) => mono(ax.X(i + 0.5), ax.Y(0) + 20, String(d), { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }));
    rows.forEach((r, i) => { const fresh = i >= prows.length, g = fresh ? E(u, 0.6, 1.4) : 1, xi = ax.X(i + 0.5), bw = 26;
      [['train', ACC, -1], ['test', r.test - r.train > 0.3 ? BAD : WARN, 1]].forEach(([key, col, sd]) => { const v = r[key] * g, top = ax.Y(v), x0 = xi + (sd < 0 ? -bw - 2 : 2);
        const dim = o.only && o.only !== key ? 0.25 : 1;
        el('rect', { x: x0, y: top, width: bw, height: ax.Y(0) - top, rx: 3, fill: col, opacity: 0.85 * dim });
        if (g > 0.6) mono(sd < 0 ? xi - 2 : xi + 2, top - 6, r[key].toFixed(2), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': sd < 0 ? 'end' : 'start', fill: col, opacity: dim }); }); });
    pill(640, 66, '■ train', ACC, 1, { fs: 13.5 }); pill(740, 66, '■ test', WARN, 1, { fs: 13.5 }); return ax; }
  function s2(t, c) { const { k, u } = c, rows = (c.beat.degreeTable && c.beat.degreeTable.rows) || [], prows = (c.prev && c.prev.degreeTable && c.prev.degreeTable.rows) || [];
    const ax = plot(40, 70, 440, 270);
    pts(ax, { teCol: WARN, hollow: true }); curve(ax, 'true', 1);
    const cv = c.beat.chart.curves.filter((q) => q !== 'true'), pcv = c.prev ? c.prev.chart.curves.filter((q) => q !== 'true') : [];
    cv.forEach((key) => curve(ax, key, pcv.includes(key) ? 1 : E(u, 0.2, 1.2)));
    if (cv.length) { const lab = k === 3 ? 'degree 3' : k === 4 ? 'degree 8' : CUR[cv[0]][2]; pill(400, 40, lab, CUR[cv[0]][1], pcv.includes(cv[0]) ? 1 : pop(u, 0.4), { fs: 14 }); }
    pill(120, 370, '● train   ○ test', MUT, 1, { fs: 13.5 });
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
    if (k === 5) pill(730, 380, '학습 점을 전부 관통 · test 1.62', BAD, pop(u, 1.6), { fs: 14 });
    if (k === 6) { pill(730, 380, 'train 만 보면 degree 15 가 "최고"', WARN, pop(u, 0.3), { fs: 14 }); if (u > 1.4) { cross(870, 380, 12, pop(u, 1.4)); } }
    if (k === 3) pill(730, 380, 'gap 0.03 — 건강하다', GOOD, pop(u, 1.6), { fs: 14 });
    if (k === 4) pill(730, 380, 'gap 0.03 → 0.38 — 갈라진다', WARN, pop(u, 1.6), { fs: 14 });
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
    if (k === 4) { pill(700, 330, 'mse_tr 0.92 > 0.5 → "underfit"', WARN, pop(u, 1.4), { mono: true, fs: 13.5 }); sub(700, 366, '처방: 복잡도 ↑', fade(u, 1.8), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }
    if (k === 5) { pill(700, 380, 'gap 1.61 > 0.3 → "overfit"', BAD, pop(u, 1.4), { mono: true, fs: 13.5 }); }
    if (k === 6) { const R3 = [['1', 'underfit', WARN], ['4', 'good', GOOD], ['15', 'overfit', BAD]];
      tx(560, 110, 'for d in [1, 4, 15]:', { 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.2) });
      R3.forEach(([d, s, col], i) => { const y = 160 + i * 60; mono(580, y + 5, `degree ${d}`, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) }); pill(780, y, s, col, pop(u, 0.7 + i * 0.4), { mono: true, fs: 15 }); });
      sub(690, 360, 'degree 4: train ≈ valid, 둘 다 낮음', fade(u, 2.0), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); } }

  // =========================================================
  // 4. 편향과 분산 — 평행세계 300개
  // =========================================================
  const bias2 = (t) => 0.85 * Math.exp(-4.2 * t) + 0.015, varr = (t) => 0.03 + 0.9 * Math.pow(t, 3.2), NOISE = 0.09;
  const total = (t) => bias2(t) + varr(t) + NOISE;
  const BEST = (() => { let b = 0, v = 99; for (let i = 0; i <= 60; i++) { const tt = i / 60; if (total(tt) < v) { v = total(tt); b = tt; } } return b; })();
  // 평행세계 하나의 예측 곡선 (그림용 흔들림: 세계 w 마다 다른 위상·높이)
  const world = (w) => (x) => deg4Fn(x) + (rnd(w) - 0.5) * 0.7 + (rnd(w + 40) - 0.5) * 0.6 * Math.sin(1.3 * x + rnd(w + 80) * 6);
  const rnd = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
  function board(cx, cy, r, hits, title, col, u, a) { [1, 0.66, 0.33].forEach((f, i) => el('circle', { cx, cy, r: r * f, fill: i === 2 ? C.GOODBG : PANEL, stroke: GRID, 'stroke-width': 2 }));
    el('circle', { cx, cy, r: 4, fill: INK });
    hits.forEach(([dx, dy], i) => { const s = pop(u, a + i * 0.08); if (s > 0) el('circle', { cx: cx + dx * r, cy: cy + dy * r, r: 6 * s, fill: col }); });
    tx(cx, cy + r + 28, title, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); }
  function stack(x, y, w, b, v, n, u, o) { o = o || {}; const max = 1.8, L = (q) => (w * q) / max;
    const g = o.grow ? E(u, 0.3, 1.3) : 1; let xx = x;
    [[b, WARN, '편향²'], [v, BAD, '분산'], [n, OFF, '노이즈']].forEach(([q, col]) => { const ww = Math.max(1.5, L(q) * g); el('rect', { x: xx, y, width: ww, height: 24, fill: col, opacity: 0.85 }); xx += ww; });
    if (g > 0.8) mono(xx + 8, y + 18, (b + v + n).toFixed(2), { 'font-size': 15, 'font-weight': 800, fill: o.best ? GOOD : INK }); }
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
  const LC = [[9, 0.05, 0.71], [58, 0.14, 0.30], [96, 0.18, 0.22]];
  function s5(t, c) { const { k, u } = c, g = c.beat.gauges[0], pg = c.prev && c.prev.gauges ? c.prev.gauges[0] : null;
    if (k <= 2) { const ax = plot(40, 70, 420, 270); pts(ax, { teCol: WARN, hollow: true }); curve(ax, 'true', 1);
      if (k < 2) curve(ax, 'deg15', 1); else { curve(ax, 'deg15', 1, { op: 1 - E(u, 0.3, 1.2) }); curve(ax, 'deg4', E(u, 0.8, 1.8)); }
      gauges(530, 96, g, pg, u, { w: 280, teName: k === 2 ? 'valid' : 'test' });
      if (k === 0) { pill(640, 300, '처방 1: Ridge', ACC, pop(u, 0.6), { fs: 15 }); pill(640, 350, '처방 2: learning curve', INFO, pop(u, 1.0), { fs: 15 }); }
      if (k === 1) { pill(640, 300, 'from sklearn.linear_model import Ridge', INK, pop(u, 0.3), { mono: true, fs: 13.5 }); pill(640, 350, 'split_data 재사용', MUT, pop(u, 0.8), { fs: 14 }); }
      if (k === 2) { // 벌점: 가중치가 작아진다 (모양만)
        tx(530, 290, '손실 + α·Σw²  (alpha=0.1)', { 'font-size': 15, 'font-weight': 800, fill: ACC, class: 'mono', opacity: fade(u, 0.3) });
        [0.9, 0.7, 1.0, 0.6, 0.8].forEach((w, i) => { const h = 60 * w * lerp(1, 0.35, E(u, 0.8, 1.8)); el('rect', { x: 540 + i * 34, y: 380 - h, width: 22, height: h, rx: 3, fill: ACC, opacity: 0.8 }); });
        sub(800, 360, '가중치 w 가 눌린다', fade(u, 1.4), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
      return; }
    if (k <= 4) { const ax = axes(70, 70, 420, 280, { x: [0, 100], y: [0, 0.8], xt: [9, 58, 96], yt: [0, 0.2, 0.4, 0.6], yl: 'MSE', xl: '학습 데이터 n', grid: true });
      const gr = k === 3 ? E(u, 0.4, 2.0) : 1;
      line(ax, LC.map(([n, tr]) => [n, tr]), gr, ACC); line(ax, LC.map(([n, , va]) => [n, va]), gr, WARN);
      LC.forEach(([n, tr, va], i) => { const s = k === 3 ? pop(u, 0.4 + i * 0.6) : 1; el('circle', { cx: ax.X(n), cy: ax.Y(tr), r: 6 * s, fill: ACC }); el('circle', { cx: ax.X(n), cy: ax.Y(va), r: 6 * s, fill: WARN }); });
      tx(ax.X(100), ax.Y(0.11), 'train', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' }); tx(ax.X(100), ax.Y(0.30), 'valid (cv=5)', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'end' });
      if (k === 3) { pill(730, 140, 'train_sizes = linspace(0.1, 1.0, 8)', INK, pop(u, 0.2), { mono: true, fs: 13.5 }); sub(730, 180, '8지점 중 코드에 찍힌 3지점', fade(u, 0.8), { 'font-size': 14 });
        sub(730, 230, '돈 쓰기 전에 데이터 추가의 약효를 본다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      if (k === 4) { [[9, 0.05, 0.71, 0.66, BAD], [96, 0.18, 0.22, 0.04, GOOD]].forEach(([n, a, b, gp, col], i) => { const p = E(u, 0.3 + i * 0.8, 0.9 + i * 0.8);
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

  RA.page({ title: '과적합과 일반화', scenes: [s1, s2, s3, s4, s5] });
})();
