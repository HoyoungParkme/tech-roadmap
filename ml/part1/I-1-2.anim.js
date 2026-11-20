/* I-1-2 학습 패러다임 지도 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, axes, line, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  // 패러다임 색: 지도 INFO · 비지도 WARN · 강화 ACC
  const PC = { sup: INFO, unsup: WARN, rl: ACC };
  const rnd = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
  const gauss = (i) => (rnd(i) + rnd(i + 101) + rnd(i + 202) - 1.5) / 1.5;

  // 맨 위 지도 띠: 세 칸 중 지금 칸이 진하게
  function mapStrip(active, ps, u, k0) { const names = [['sup', '지도학습'], ['unsup', '비지도학습'], ['rl', '강화학습']];
    names.forEach(([key, n], i) => { const x = 170 + i * 310, on = key === active, p = ps.find((q) => q.key === key), filled = p && p.signal !== '?';
      el('rect', { x: x - 140, y: 10, width: 280, height: 34, rx: 17, fill: on ? PANEL : SOFT, stroke: on ? PC[key] : GRID, 'stroke-width': on ? 2.5 : 1.5 });
      tx(x - 124, 32, n, { 'font-size': 15, 'font-weight': 800, fill: on ? PC[key] : filled ? INK : MUT });
      if (filled) tx(x + 128, 32, p.signal.length > 14 ? p.signal.slice(0, 13) + '…' : p.signal, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: on && k0 ? fade(u, 0.6) : 1 }); }); }
  function pills(x, y, list, u, a, col) { list.forEach((s, i) => pill(x, y + i * 42, s, col || INK, pop(u, a + i * 0.25), { mono: true, fs: 13.5 })); }

  // =========================================================
  // 1. 지도학습 — X 옆에 정답 y
  // =========================================================
  function table(u, k, o) { o = o || {}; const x0 = 40, y0 = 104, cw = 26, rh = 34, Y = ['1', '1', '0', '…'];
    tx(x0, 82, 'X  (특성 8개)', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(x0 + 8 * cw + 18, 82, 'y', { 'font-size': 15, 'font-weight': 800, fill: INFO });
    for (let r = 0; r < 4; r++) { const op = o.enter ? fade(u, 0.2 + r * 0.15) : 1;
      for (let c = 0; c < 8; c++) el('rect', { x: x0 + c * cw, y: y0 + r * rh, width: cw - 3, height: rh - 4, rx: 3, fill: r === 3 ? 'none' : rnd(r * 8 + c) > 0.5 ? ACCBG : SOFT, stroke: r === 3 ? 'none' : GRID, opacity: op });
      if (r === 3) mono(x0 + 4 * cw, y0 + r * rh + 18, '⋮', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: op });
      card(x0 + 8 * cw + 24, y0 + r * rh + 15, 34, rh - 4, { rx: 5, text: Y[r], mono: true, fs: 15, stroke: r === 3 ? 'none' : INFO, fill: r === 3 ? 'none' : PANEL, color: INFO, op: o.yIn != null ? o.yIn : op }); }
    if (o.pair) { const p = o.pair; el('rect', { x: x0 - 6, y: y0 - 6, width: 8 * cw + 70, height: 3 * rh + 6, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: p });
      tx(x0 + 8 * cw + 70, y0 + 54, '쌍', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: p }); }
    mono(x0, y0 + 4 * rh + 14, 'n_samples=1000', { 'font-size': 13.5, fill: MUT }); }
  const CLS = Array.from({ length: 36 }, (_, i) => { const c = i % 2; return [clamp((c ? 0.68 : 0.32) + gauss(i) * 0.38, 0.04, 0.96), clamp((c ? 0.66 : 0.34) + gauss(i + 50) * 0.38, 0.04, 0.96), c]; });
  const REG = Array.from({ length: 16 }, (_, i) => { const x = 0.06 + i * 0.058; return [x, clamp(0.18 + 0.62 * x + gauss(i + 300) * 0.09, 0.03, 0.97)]; });
  function s1(t, c) { const { k, u } = c, ps = c.beat.paradigms;
    mapStrip('sup', ps, u, k === 1);
    if (k === 0) { table(u, k, { enter: true, yIn: 0 }); pills(640, 110, ['LogisticRegression', 'train_test_split', 'accuracy_score'], u, 0.4, INFO);
      sub(640, 260, '카드는 열렸지만 아직 비어 있다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k <= 2) { table(u, k, { yIn: k === 1 ? fade(u, 0.4) : 1, pair: k === 1 ? fade(u, 1.0) : 0 });
      if (k === 1) { pill(640, 130, '학습 신호 = 정답 라벨 (X, y)', INFO, pop(u, 1.4), { fs: 15 }); sub(640, 176, 'y = [1, 1, 0, …] ← 이탈 여부', fade(u, 1.8), { 'font-size': 15, fill: INK, class: 'mono' }); }
      if (k === 2) { const x0 = 440, w = 440, y = 140, sp = E(u, 0.3, 1.1);
        tx(x0, y - 16, '1,000건', { 'font-size': 15, 'font-weight': 800 });
        el('rect', { x: x0, y, width: w * 0.8 - sp * 6, height: 40, rx: 6, fill: INFO, opacity: 0.8 });
        el('rect', { x: x0 + w * 0.8 + sp * 6, y, width: w * 0.2 - sp * 6, height: 40, rx: 6, fill: WARN, opacity: 0.85 });
        mono(x0 + w * 0.4, y + 26, '학습 800', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' });
        mono(x0 + w * 0.9 + 3, y + 64, '평가 200', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        mono(x0 + w * 0.9 + 3, y + 84, 'test_size=0.2', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        sub(x0 + w / 2, 290, '라벨이 있으니 평가 200건을 채점할 수 있다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      return; }
    if (k === 3 || k === 4) { table(u, k, {});
      const ax = axes(470, 84, 400, 250, { x: [0, 1], y: [0, 1], xl: '특성 1', yl: k === 3 ? '특성 2' : '정답 = 가격 (연속 숫자)' });
      if (k === 3) { R.scatter(ax, CLS.map(([x, y, cl]) => [x, y, cl ? BAD : INFO]), { u: E(u, 0.2, 1.0), r: 6 });
        const g = E(u, 1.0, 1.8); el('line', { x1: ax.X(0.12), y1: ax.Y(0.92), x2: ax.X(lerp(0.12, 0.9, g)), y2: ax.Y(lerp(0.92, 0.14, g)), stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '7 5' });
        pill(ax.X(0.82), ax.Y(0.96), '● 이탈(1)', BAD, pop(u, 0.4), { fs: 13.5 }); pill(ax.X(0.2), ax.Y(0.06), '● 유지(0)', INFO, pop(u, 0.4), { fs: 13.5 });
        pill(255, 330 + 46, 'clf.fit → predict → accuracy', INFO, pop(u, 2.0), { mono: true, fs: 13.5 }); }
      else { R.scatter(ax, REG.map(([x, y]) => [x, y, INFO]), { u: E(u, 0.2, 0.9) });
        const g = E(u, 0.9, 1.5); line(ax, [[0, 0.18], [1, 0.8]], g, ACC, { sw: 3 });
        if (u > 1.5) REG.forEach(([x, y], i) => { const yh = 0.18 + 0.62 * x; el('line', { x1: ax.X(x), y1: ax.Y(y), x2: ax.X(x), y2: ax.Y(yh), stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.5 + i * 0.03) }); });
        pill(ax.X(0.3), ax.Y(0.94), '지표: MAE / RMSE', GOOD, pop(u, 1.8), { fs: 14 });
        pill(255, 376, 'accuracy', BAD, pop(u, 2.0), { mono: true, fs: 13.5 }); if (u > 2.2) cross(255, 376, 12, pop(u, 2.2));
        sub(ax.X(0.72), ax.Y(0.08), '빨간 선 = 오차', fade(u, 1.7), { fill: BAD, 'font-weight': 700 }); }
      return; }
    // k5: 알고리즘 네 가지 — 각자 모양으로
    const algos = [['로지스틱 회귀', '빠른 베이스라인 · 계수 해석'], ['결정 트리', '규칙이 보임 · 과적합 주의'], ['SVM', '고차원 소규모에 강함'], ['XGBoost', '정형 데이터 기본기']];
    algos.forEach(([n, d], i) => { const cx = 130 + i * 233, cy = 200, s = pop(u, 0.2 + i * 0.3), g = R.G(cx, cy, s);
      el('rect', { x: -105, y: -110, width: 210, height: 220, rx: 12, fill: PANEL, stroke: INFO, 'stroke-width': 2 }, g);
      tx(0, -80, n, { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' }, g);
      if (i === 0) { let d0 = ''; for (let j = 0; j <= 20; j++) { const x = -70 + j * 7, y = 30 - 60 / (1 + Math.exp(-(x / 14))); d0 += (j ? 'L' : 'M') + x + ',' + y; } el('path', { d: d0, fill: 'none', stroke: ACC, 'stroke-width': 3 }, g); }
      if (i === 1) { [[0, -45, -40, 0], [0, -45, 40, 0], [-40, 0, -60, 40], [-40, 0, -20, 40]].forEach(([a, b, c2, d2]) => el('line', { x1: a, y1: b, x2: c2, y2: d2, stroke: INK, 'stroke-width': 2.5 }, g)); [[0, -45], [-40, 0], [40, 0], [-60, 40], [-20, 40]].forEach(([a, b]) => el('circle', { cx: a, cy: b, r: 7, fill: ACC }, g)); }
      if (i === 2) { el('line', { x1: -60, y1: 40, x2: 60, y2: -50, stroke: INK, 'stroke-width': 3 }, g); [-1, 1].forEach((sd) => el('line', { x1: -60 + sd * 14, y1: 40 + sd * 18, x2: 60 + sd * 14, y2: -50 + sd * 18, stroke: MUT, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, g));
        [[-50, -30, INFO], [-30, -45, INFO], [-55, -5, INFO], [45, 20, BAD], [30, 40, BAD], [55, 0, BAD]].forEach(([a, b, cc]) => el('circle', { cx: a, cy: b, r: 6, fill: cc }, g)); }
      if (i === 3) { [0, 1, 2].forEach((j) => { const ox = -50 + j * 50, oy = 10 - j * 8; el('line', { x1: ox, y1: oy - 30, x2: ox - 18, y2: oy + 10, stroke: INK, 'stroke-width': 2 }, g); el('line', { x1: ox, y1: oy - 30, x2: ox + 18, y2: oy + 10, stroke: INK, 'stroke-width': 2 }, g); el('circle', { cx: ox, cy: oy - 30, r: 6, fill: ACC }, g); });
        mono(0, 50, '+ + …', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT }, g); }
      tx(0, 92, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }, g); });
    sub(480, 380, '정답이 카테고리면 분류, 숫자면 회귀 — 그다음에 알고리즘을 고른다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 2. 비지도학습 — X 만 있다
  // =========================================================
  const CEN = [[0.24, 0.72], [0.72, 0.76], [0.28, 0.26], [0.76, 0.3]], CC = [INFO, WARN, ACC, GOOD];
  const BL = Array.from({ length: 72 }, (_, i) => { const c = i % 4; return [clamp(CEN[c][0] + gauss(i + 500) * 0.12, 0.03, 0.97), clamp(CEN[c][1] + gauss(i + 900) * 0.12, 0.03, 0.97), c]; });
  const NOISE = [[0.5, 0.52], [0.06, 0.48], [0.93, 0.54], [0.52, 0.06]];
  const nearest = (x, y) => CEN.reduce((b, q, i) => (Math.hypot(q[0] - x, q[1] - y) < Math.hypot(CEN[b][0] - x, CEN[b][1] - y) ? i : b), 0);
  function s2(t, c) { const { k, u } = c, ps = c.beat.paradigms;
    mapStrip('unsup', ps, u, k === 1);
    if (k === 0) { pills(200, 110, ['KMeans', 'DBSCAN', 'PCA', 'silhouette_score'], u, 0.3, WARN);
      card(640, 190, 240, 120, { rx: 12, stroke: WARN, sw: 2, dash: '6 5', text: '비지도학습 카드\n(아직 비어 있다)', fs: 15, color: WARN, s: pop(u, 0.6) });
      sub(640, 300, '지도학습 카드는 옆으로 접힌다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const ax = axes(470, 70, 420, 290, { x: [0, 1], y: [0, 1] });
    const showNoise = k >= 3;
    BL.forEach(([x, y, cl], i) => { let col = OFF;
      if (k === 2) col = u > 0.8 + nearest(x, y) * 0.15 ? CC[nearest(x, y)] : OFF;
      if (k >= 3) col = CC[nearest(x, y)];
      const s = k === 1 ? clamp((E(u, 0.2, 1.2) * 72 - i)) : 1; if (s <= 0) return;
      el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 5.5, fill: col, opacity: 0.85 * s }); });
    if (showNoise) NOISE.forEach(([x, y], i) => { const on = k === 3 ? fade(u, 0.8 + i * 0.2) : 1;
      el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 5.5, fill: k === 3 ? lerpCol(on) : BAD });
      el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 12, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: on });
      if (i === 0) mono(ax.X(x) + 16, ax.Y(y) + 5, '-1', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: on }); });
    if (k === 1) { card(220, 130, 300, 46, { rx: 10, text: 'X, _ = make_blobs(600, …)', mono: true, fs: 14, s: pop(u, 0.2) });
      if (u > 1.0) cross(145, 130, 12, pop(u, 1.0));
      tx(80, 200, '정답 y 를 _ 로 버린다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(80, 230, '남은 단서 = 데이터의 모양·거리·밀도', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      mono(80, 290, '600건 · 10차원', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 2) { CEN.forEach(([x, y], i) => { const s = pop(u, 0.3 + i * 0.12); el('path', { d: `M${ax.X(x) - 9 * s},${ax.Y(y) - 9 * s} L${ax.X(x) + 9 * s},${ax.Y(y) + 9 * s} M${ax.X(x) + 9 * s},${ax.Y(y) - 9 * s} L${ax.X(x) - 9 * s},${ax.Y(y) + 9 * s}`, stroke: INK, 'stroke-width': 4 }); });
      pill(220, 120, 'n_clusters = 4  ← 사람이 정함', INK, pop(u, 0.2), { fs: 14 });
      tx(80, 186, 'fit_predict → 묶음 번호 0~3', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(80, 214, '"정답" 이 아니라 사람이 해석할 번호', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      pill(220, 270, 'silhouette_score — 내부 지표', WARN, pop(u, 2.0), { fs: 14 }); }
    if (k === 3) { pill(220, 120, 'DBSCAN — k 를 안 정한다', INK, pop(u, 0.2), { fs: 14 });
      tx(80, 186, '밀도로 묶고, 못 붙는 점 → -1', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(80, 214, 'labels_ == -1 → 이상치', { 'font-size': 14, fill: BAD, class: 'mono', opacity: fade(u, 1.4) });
      tx(80, 270, 'K-means: 동그란 덩어리 가정', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      tx(80, 296, 'DBSCAN: 임의 모양 + 이상치', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 4) { // 10개의 축이 2개로 눌린다
      const cx = 200, cy = 220, rr = 90, p = E(u, 0.6, 1.8);
      for (let i = 0; i < 10; i++) { const a0 = (i / 10) * Math.PI, a1 = i < 5 ? 0 : Math.PI / 2, a = lerp(a0, a1, p);
        el('line', { x1: cx - rr * Math.cos(a), y1: cy - rr * Math.sin(a), x2: cx + rr * Math.cos(a), y2: cy + rr * Math.sin(a), stroke: i < 5 ? WARN : INFO, 'stroke-width': 2.5, opacity: 0.8 }); }
      mono(cx, 104, p < 0.5 ? '10차원' : '2차원', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      pill(cx, 344, 'PCA(n_components=2)', INK, pop(u, 0.2), { mono: true, fs: 13.5 });
      sub(cx, 380, '잃은 정보는 explained_variance_ratio_ 로 확인', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); }
    if (k === 5) { pill(220, 120, 'accuracy', BAD, 1, { mono: true, fs: 14 }); cross(220, 120, 14, pop(u, 0.3));
      tx(80, 176, '채점할 정답이 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      pill(220, 226, 'silhouette (내부 지표)', WARN, pop(u, 0.9), { fs: 14 });
      person(140, 300, null, { s: pop(u, 1.4) }); tx(178, 300, '이 세그먼트가', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.6) }); tx(178, 322, '사업적으로 말이 되나?', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.6) });
      ['군집', '차원축소', '이상탐지'].forEach((s, i) => pill(560 + i * 120, 390, s, WARN, pop(u, 2.0 + i * 0.15), { fs: 14 })); } }
  function lerpCol(on) { return on > 0.5 ? BAD : OFF; }

  // =========================================================
  // 3. 강화학습 — 격자 세계와 Q 표
  // =========================================================
  const GX = 205, GW = 110, GY = 120, QY = 248, QH = 48;
  const cx = (s) => GX + GW / 2 + s * GW;
  // 수렴값: Q(s,→) = -1 + 0.9·V(s+1), 목표에서 +10. 코드의 gamma 0.9 에서 바로 계산된다
  const QSTAR = [[3.12, 4.58], [3.12, 6.2], [4.58, 8], [6.2, 10], [0, 0]];
  function grid(o) { o = o || {};
    for (let s = 0; s < 5; s++) { const goal = s === 4, sc = o.enter ? pop(o.u, 0.2 + s * 0.12) : 1;
      card(cx(s), GY, GW - 8, 56, { rx: 8, stroke: goal ? GOOD : INK, fill: goal ? C.GOODBG : PANEL, s: sc });
      mono(cx(s), GY - 38, String(s), { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: sc }); }
    tx(cx(4) + 46, GY + 6, '목표 +10', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: o.enter ? fade(o.u, 1.0) : 1 });
    tx(GX - 14, GY + 5, '상태', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' }); }
  function agent(x, s) { el('circle', { cx: x, cy: GY, r: 16 * (s ?? 1), fill: ACC }); el('circle', { cx: x - 5, cy: GY - 4, r: 2.5, fill: PANEL }); el('circle', { cx: x + 5, cy: GY - 4, r: 2.5, fill: PANEL }); }
  function qtable(vals, o) { o = o || {};
    ['Q(s, ←)', 'Q(s, →)'].forEach((n, a) => { mono(GX - 14, QY + a * QH + 29, n, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: MUT, opacity: o.op ?? 1 });
      for (let s = 0; s < 5; s++) { const v = vals[s][a], hi = o.hi && o.hi(s, a), best = o.best && s < 4 && v === Math.max(...vals[s]) && v !== 0;
        card(cx(s), QY + a * QH + 24, GW - 8, QH - 6, { rx: 6, text: Number.isInteger(v) ? String(v) : v.toFixed(2), mono: true, fs: 15, stroke: hi ? ACC : best ? GOOD : GRID, sw: hi || best ? 2.5 : 1.5, fill: best ? C.GOODBG : hi ? ACCBG : PANEL, s: o.s ? o.s(s, a) : 1, op: o.op }); } }); }
  const zeros = () => [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
  function s3(t, c) { const { k, u } = c, ps = c.beat.paradigms;
    mapStrip('rl', ps, u, k === 1);
    if (k === 0) { grid({ enter: true, u }); agent(cx(0), pop(u, 1.2));
      pill(cx(0) - 30, GY + 70, '← 왼쪽', INK, pop(u, 1.5), { fs: 13.5 }); pill(cx(0) + 40, GY + 70, '오른쪽 →', INK, pop(u, 1.7), { fs: 13.5 });
      banner(480, 300, '상태 5개 · 행동 2개 · 데이터셋 없음 — 환경이 있다', pop(u, 2.0)); return; }
    grid();
    if (k === 6) { agent(cx(3)); // 실제 사례
      const rows = [['알파고', '바둑판', '착수', '승패 (지연 보상 극단)'], ['로봇', '센서값', '모터 토크', '넘어지지 않기'], ['RLHF', '대화', '다음 토큰', '사람 선호 점수']];
      ['', '상태', '행동', '보상'].forEach((h, j) => tx([70, 250, 430, 610][j], 214, h, { 'font-size': 14, 'font-weight': 700, fill: MUT }));
      rows.forEach((r, i) => { const y = 252 + i * 50, op = fade(u, 0.3 + i * 0.4), dx = -20 * (1 - E(u, 0.3 + i * 0.4, 0.7 + i * 0.4));
        r.forEach((s, j) => tx([70, 250, 430, 610][j] + dx, y, s, { 'font-size': 15, 'font-weight': j === 0 ? 800 : 600, fill: j === 0 ? ACC : j === 3 ? GOOD : INK, opacity: op })); });
      sub(480, 404, '세 자리에 무엇을 넣느냐만 다르다 · DQN · PPO', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    let vals = zeros();
    if (k === 1) { qtable(vals, { s: (s, a) => pop(u, 0.3 + s * 0.1 + a * 0.05) }); agent(cx(0));
      sub(840, QY + 52, '처음엔 전부 0', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(840, QY + 76, '아는 게 없다', fade(u, 1.6)); return; }
    if (k === 2) { qtable(vals); // ε-greedy: 20% 탐험, 80% 활용
      const px = 860, py = 120, r = 42; el('circle', { cx: px, cy: py, r, fill: ACC, opacity: 0.85 });
      const a = -Math.PI / 2 + 0.2 * 2 * Math.PI; el('path', { d: `M${px},${py} L${px},${py - r} A${r},${r} 0 0 1 ${px + r * Math.cos(a)},${py + r * Math.sin(a)} Z`, fill: WARN });
      tx(px, py + r + 20, '탐험 20%', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      tx(px, py + r + 40, '활용 80%', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      const spin = (t * 3) % (2 * Math.PI); el('line', { x1: px, y1: py, x2: px + (r - 6) * Math.cos(spin - Math.PI / 2), y2: py + (r - 6) * Math.sin(spin - Math.PI / 2), stroke: INK, 'stroke-width': 3 });
      const path = [0, 1, 0, 1, 2, 1], f = clamp(u / 2.6) * (path.length - 1), i = Math.floor(f); agent(lerp(cx(path[i]), cx(path[Math.min(i + 1, path.length - 1)]), E(f - i, 0, 1)));
      sub(480, 400, 'Q 가 전부 0 이라 지금은 사실상 무작위로 움직인다', fade(u, 1.2), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { qtable(vals); const p = E(u, 0.3, 1.0); agent(lerp(cx(0), cx(1), p));
      grow(cx(0) + 20, GY - 46, cx(1) - 20, GY - 46, E(u, 0.2, 0.6), ACC);
      if (u > 1.0) { const f = E(u, 1.0, 1.8); tx(cx(1) + 34, GY - 26 - 14 * f, '-1', { 'font-size': 20, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', class: 'mono' }); }
      pill(800, 210, 'nxt = 1 · reward = -1', INK, pop(u, 1.6), { mono: true, fs: 14 });
      sub(480, 400, '정답 대신 "방금 행동의 점수" 한 숫자만 돌아온다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { const p = E(u, 0.2, 0.8); agent(lerp(cx(3), cx(4) - 32, p));
      if (u > 0.8) { const f = E(u, 0.8, 1.5); tx(cx(4) + 34, GY - 26 - 14 * f, '+10', { 'font-size': 20, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', class: 'mono' }); }
      vals = zeros(); const nv = lerp(0, 1, E(u, 1.6, 2.2)); vals[3][1] = Math.round(nv * 100) / 100;
      qtable(vals, { hi: (s, a) => s === 3 && a === 1 });
      mono(480, 214, 'Q[3,→] ← 0 + 0.1 × (10 + 0.9 × max Q[4] − 0) = 1.0', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.1) });
      sub(480, 400, '보상이 목표 앞 칸부터 거꾸로 번져 온다 (지연 보상)', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    // k === 5: 수렴값과 정책
    const g = E(u, 0.2, 1.4); vals = [0, 1, 2, 3, 4].map((s) => [0, 1].map((a) => (s === 3 && a === 1 ? lerp(1, QSTAR[s][a], g) : lerp(0, QSTAR[s][a], g))).map((v) => (u > 1.4 ? v : Math.round(v * 100) / 100)));
    if (u > 1.4) vals = QSTAR;
    qtable(vals, { best: u > 1.4 });
    mono(480, 214, '수렴값 (γ = 0.9, 이동 −1, 목표 +10)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3) });
    for (let s = 0; s < 4; s++) tx(cx(s), GY + 58 + 4, '→', { 'font-size': 22, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.5 + s * 0.15) });
    const run = (t * 0.6) % 1; if (u > 2.0) agent(lerp(cx(0), cx(4), run));
    sub(480, 400, '정책 π = 각 칸에서 Q 가 큰 행동 → "계속 오른쪽" (아무도 안 가르쳤다)', fade(u, 1.9), { 'font-weight': 700, fill: INK }); }

  // =========================================================
  // 4. 문제 → 패러다임 고르기
  // =========================================================
  const CASES = [['이탈 예측', 1, 0, 0, 'sup'], ['고객 세그먼트', 0, 0, 0, 'unsup'], ['추천 순서 최적화', 0, 1, 1, 'rl'], ['월별 수요량 예측', 1, 0, 0, 'sup'], ['사기 탐지(라벨 희소)', 0, 0, 0, 'unsup']];
  const N = { q1: [700, 92], rl: [880, 200], q2: [600, 210], sup: [500, 320], unsup: [720, 320] };
  function tree(u, k) { const g = k === 2 ? (a) => E(u, a, a + 0.4) : () => 1;
    const node = (p, s, col, w, a) => card(p[0], p[1], w, 40, { rx: col ? 20 : 8, text: s, fs: 14, stroke: col || INK, color: col || INK, fill: col ? PANEL : SOFT, s: k === 2 ? pop(u, a) : 1, fw: 800 });
    grow(N.q1[0] + 40, N.q1[1] + 20, N.rl[0] - 10, N.rl[1] - 22, g(0.5), ACC); tx(N.rl[0] - 10, N.q1[1] + 40, 'YES', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: g(0.6) });
    grow(N.q1[0] - 40, N.q1[1] + 20, N.q2[0] + 10, N.q2[1] - 22, g(0.9), MUT); tx(N.q2[0] - 20, N.q1[1] + 54, 'NO', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: g(1.0) });
    grow(N.q2[0] - 30, N.q2[1] + 20, N.sup[0] + 10, N.sup[1] - 22, g(1.3), INFO); tx(N.sup[0] - 18, N.q2[1] + 50, 'YES', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: g(1.4) });
    grow(N.q2[0] + 30, N.q2[1] + 20, N.unsup[0] - 10, N.unsup[1] - 22, g(1.7), WARN); tx(N.unsup[0] - 14, N.q2[1] + 50, 'NO', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: g(1.8) });
    node(N.q1, '순차 결정 and 보상?', null, 200, 0.2); node(N.q2, '라벨 있나?', null, 130, 0.8);
    node(N.rl, '강화', ACC, 96, 0.6); node(N.sup, '지도', INFO, 96, 1.4); node(N.unsup, '비지도', WARN, 96, 1.8); }
  const CY = (i) => 152 + i * 46, TF = [244, 304, 364];
  function cases(u, k) { tx(30, 116, '문제', { 'font-size': 14, 'font-weight': 700, fill: MUT }); ['라벨?', '순차?', '보상?'].forEach((h, j) => tx(TF[j], 116, h, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }));
    CASES.forEach(([n, ...f], i) => { const op = k === 3 ? fade(u, 0.2 + i * 0.25) : 1, col = k >= 5 ? PC[f[3]] : INK;
      tx(30, CY(i) + 5, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op });
      f.slice(0, 3).forEach((v, j) => card(TF[j], CY(i), 44, 30, { rx: 6, text: v ? 'T' : 'F', mono: true, fs: 14, stroke: v ? GOOD : GRID, color: v ? GOOD : MUT, op })); }); }
  function s4(t, c) { const { k, u } = c;
    mono(30, 50, 'choose_paradigm(has_label, sequential_decision, has_reward)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 0.2) : 1 });
    if (k <= 1) { const qs = [['has_label', '과거 데이터에서 정답을 만들 수 있나'], ['sequential_decision', '행동이 다음 상황을 바꾸나'], ['has_reward', '행동 결과를 점수로 매길 수 있나']];
      qs.forEach(([n, d], i) => { const y = 120 + i * 90; pill(30 + (tw(n, 14) + 26) / 2, y, n + ' ?', INK, k === 0 ? pop(u, 0.6 + i * 0.3) : 1, { mono: true, fs: 14 });
        if (k === 1) tx(30, y + 38, d, { 'font-size': 15, 'font-weight': 600, fill: INK, opacity: fade(u, 0.3 + i * 0.5) }); });
      if (k === 0) ['지도', '비지도', '강화'].forEach((s, i) => pill(640 + i * 110, 200, s, [INFO, WARN, ACC][i], pop(u, 1.6 + i * 0.15), { fs: 15 }));
      if (k === 0) sub(750, 250, '세 칸 모두 후보', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 1) banner(480 + 160, 380, '라벨은 "있다" 가 아니라 "만들 수 있다"', pop(u, 1.8));
      return; }
    tree(u, k);
    if (k === 2) { sub(700, 400, '강화 조건을 먼저 거르고, 그다음 라벨 유무', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    cases(u, k);
    if (k >= 4) { // 한 줄씩 나무를 타고 내려간다
      const leafList = { sup: [], unsup: [], rl: [] };
      CASES.forEach(([n, , , , key], i) => { const a = 0.2 + i * 0.45, route = key === 'rl' ? [[400, CY(i)], N.q1, N.rl] : [[400, CY(i)], N.q1, N.q2, N[key]];
        if (k === 4) dot(route, seg(u, a, a + 0.6), PC[key], 7);
        if (k > 4 || u > a + 0.6) leafList[key].push(n); });
      Object.entries(leafList).forEach(([key, ns]) => ns.forEach((n, j) => { const p = N[key]; tx(p[0], p[1] + 40 + j * 20, n.replace('(라벨 희소)', ''), { 'font-size': 13.5, 'font-weight': 700, fill: PC[key], 'text-anchor': 'middle' }); }));
      if (k === 5) pill(850, 310, '라벨 희소 ≈ 라벨 없음', WARN, pop(u, 1.0), { fs: 13.5 });
      if (k === 6) { // 흔한 실수
        el('path', { d: `M${N.sup[0] + 48},${N.sup[1] - 6} Q${(N.sup[0] + N.unsup[0]) / 2},${N.sup[1] - 46} ${N.unsup[0] - 48},${N.unsup[1] - 6}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
        cross((N.sup[0] + N.unsup[0]) / 2, N.sup[1] - 28, 10, pop(u, 0.6));
        el('path', { d: `M${N.sup[0] + 20},${N.sup[1] - 20} Q${N.sup[0] + 140},${N.rl[1] - 50} ${N.rl[0] - 48},${N.rl[1]}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 1.0) });
        cross(N.sup[0] + 150, N.rl[1] - 26, 10, pop(u, 1.3));
        check(N.sup[0] - 70, N.sup[1], 12, pop(u, 1.8));
        sub(480, 404, '✗ 라벨 만들 수 있는데 비지도 · ✗ 단발 예측에 강화 · ✓ 애매하면 지도 베이스라인', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
    } }

  // =========================================================
  // 5. 경계 지대 — 자기지도, 준지도, LLM 파이프라인
  // =========================================================
  const TOK = ['머신러닝', '은', '데이터', '로', '배운다'];
  const tokW = (s) => tw(s, 15) + 26;
  function tokens(x, y, list, o) { o = o || {}; let xx = x; list.forEach((s, i) => { const w = tokW(s); card(xx + w / 2, y, w, 34, { rx: 7, text: s, fs: 15, stroke: o.col ? o.col(i) : INK, color: o.col ? o.col(i) : INK, s: o.s ? o.s(i) : 1, fill: o.fill ? o.fill(i) : PANEL }); xx += w + 8; }); return xx; }
  const SEMI = Array.from({ length: 44 }, (_, i) => { const c = i % 2; return [clamp((c ? 0.72 : 0.28) + gauss(i + 1200) * 0.5, 0.04, 0.96), clamp((c ? 0.62 : 0.38) + gauss(i + 1400) * 0.5, 0.04, 0.96), c, Math.abs((c ? 0.7 : 0.3) - 0.5) + 0]; });
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { mono(40, 56, 'text = "머신러닝 은 데이터 로 배운다"', { 'font-size': 15, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 });
      tokens(40, 104, TOK, { s: (i) => (k === 0 ? pop(u, 0.8 + i * 0.15) : 1) });
      pill(820, 104, '사람이 붙인 라벨 0개', MUT, k === 0 ? pop(u, 1.8) : 1, { fs: 14 });
      if (k >= 1) for (let i = 1; i < 5; i++) { const y = 168 + (i - 1) * 50, a = 0.2 + (i - 1) * 0.45, op = k === 1 ? fade(u, a) : 1, sc = k === 1 ? (j) => (j < i ? pop(u, a) : 1) : null;
        mono(30, y + 5, `${i}`, { 'font-size': 14, fill: MUT, opacity: op });
        const xe = tokens(56, y, TOK.slice(0, i), { s: sc ? (j) => pop(u, a + j * 0.05) : null, col: () => INK });
        grow(xe + 6, y, xe + 50, y, k === 1 ? E(u, a + 0.2, a + 0.4) : 1, ACC);
        tokens(xe + 60, y, [TOK[i]], { col: () => ACC, fill: () => ACCBG, s: () => (k === 1 ? pop(u, a + 0.3) : 1) });
        if (i === 1) tx(xe + 60, y - 24, '정답', { 'font-size': 13.5, 'font-weight': 800, fill: ACC, opacity: op }); }
      if (k === 1) sub(760, 400, '문장 1개 → (문맥, 다음 단어) 학습 쌍 4개', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 2) { card(800, 250, 230, 110, { rx: 12, stroke: INFO, sw: 2.5, text: '자기지도\n라벨을 데이터가 만든다\n라벨링 비용 0원', fs: 15, color: INFO, s: pop(u, 0.3) });
        sub(800, 340, '그래서 인터넷 전체가 학습 데이터', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 });
        sub(800, 366, 'GPT 사전학습 = 다음 단어 맞히기', fade(u, 1.8), { 'font-size': 14 }); }
      return; }
    if (k === 3) { // 준지도: 소량 라벨 + 대량 미라벨, 확신 95% 이상만 승격
      const ax = axes(80, 70, 470, 300, { x: [0, 1], y: [0, 1] }), bx = 0.5;
      el('line', { x1: ax.X(0.62), y1: ax.Y(0.98), x2: ax.X(0.38), y2: ax.Y(0.02), stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.6) });
      SEMI.forEach(([x, y, cl], i) => { const lab = i < 6, far = Math.abs((x - bx) + (y - 0.5) * 0.25) > 0.24, promote = !lab && far;
        const col = lab ? (cl ? BAD : INFO) : promote && u > 1.4 + (i % 8) * 0.08 ? (cl ? BAD : INFO) : OFF;
        el('circle', { cx: ax.X(x), cy: ax.Y(y), r: lab ? 8 : 5.5, fill: col, opacity: lab ? 1 : 0.85 });
        if (lab) el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 12, fill: 'none', stroke: INK, 'stroke-width': 2 });
        if (promote && u > 1.4 + (i % 8) * 0.08) el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 9, fill: 'none', stroke: GOOD, 'stroke-width': 1.8, opacity: 0.8 }); });
      pill(760, 110, '◎ 라벨 소량 (6)', INK, pop(u, 0.3), { fs: 14 }); pill(760, 156, '● 미라벨 대량', MUT, pop(u, 0.5), { fs: 14 });
      pill(760, 220, 'proba.max() > 0.95 → 승격', GOOD, pop(u, 1.2), { mono: true, fs: 13.5 });
      sub(760, 262, '경계에서 먼 점만 라벨로 편입 → 다시 학습', fade(u, 1.8), { fill: INK, 'font-weight': 700 });
      sub(760, 330, '기준을 낮추면 틀린 라벨이 섞인다', fade(u, 2.2), { fill: BAD, 'font-weight': 700 }); return; }
    if (k <= 5) { // LLM 파이프라인
      const st = [['1. 사전학습', '자기지도', '다음 토큰 예측', '라벨 = 데이터 자신', INFO], ['2. SFT', '지도', '모범 답변으로 파인튜닝', '사람이 쓴 정답', INFO], ['3. RLHF', '강화', '선호 점수로 정책 갱신', '보상 = 사람 선호', ACC]];
      st.forEach(([n, p, d, sig, col], i) => { const x = 170 + i * 310, a = k === 4 ? 0.2 + i * 0.5 : -1, s = k === 4 ? pop(u, a) : 1, g = R.G(x, 170, s);
        el('rect', { x: -130, y: -70, width: 260, height: 140, rx: 14, fill: PANEL, stroke: col, 'stroke-width': 2.5 }, g);
        tx(0, -36, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' }, g);
        card(0, 2, 110, 32, { rx: 16, text: p, fs: 15, stroke: col, color: col, p: g });
        tx(0, 46, d, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }, g);
        if (i < 2) grow(x + 134, 170, x + 176, 170, k === 4 ? E(u, a + 0.3, a + 0.5) : 1, MUT);
        if (k === 5) { const b = 0.3 + i * 0.5; grow(x, 250, x, 296, E(u, b, b + 0.3), col); pill(x, 318, sig, col, pop(u, b + 0.3), { fs: 14 }); } });
      if (k === 5) sub(480, 390, '같은 모델이 단계마다 다른 신호로 배운다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      else sub(480, 330, '패러다임은 칸막이가 아니라 갈아 끼우는 부품', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      return; }
    // k === 6: 완성된 지도
    const P = [['지도', '라벨 있음 · 분류/회귀', 190, 150, INFO], ['비지도', '라벨 없음 · 군집/축소/이상탐지', 480, 290, WARN], ['강화', '순차결정 + 보상', 770, 150, ACC]];
    P.forEach(([n, d, x, y, col], i) => { const s = pop(u, 0.2 + i * 0.2); el('ellipse', { cx: x, cy: y, rx: 140 * s, ry: 64 * s, fill: PANEL, stroke: col, 'stroke-width': 2.5 });
      tx(x, y - 6, n, { 'font-size': 17, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s }); tx(x, y + 18, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
    grow(250, 210, 380, 260, E(u, 1.0, 1.4), MUT, { plain: true }); pill(268, 262, '준지도', INK, pop(u, 1.2), { fs: 14 });
    pill(190, 60, '자기지도 → 지도 문제로 변환', INFO, pop(u, 1.5), { fs: 14 });
    el('path', { d: 'M190,214 Q480,40 770,214', fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 1.8) });
    pill(480, 100, 'LLM = 자기지도 → 지도 → 강화', ACC, pop(u, 2.0), { fs: 14 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '집값처럼 정답이 연속된 숫자인 지도학습 문제는 무엇이라 부르나?',
      o: ['분류', '군집', '회귀'], a: 2,
      why: '정답이 카테고리면 분류, 연속 숫자면 회귀다. 정답의 형태가 지표까지 정하므로 회귀에 accuracy 를 쓰면 안 된다.' },
    { q: 'K-means 의 fit_predict 가 돌려주는 라벨은 무엇인가?',
      o: ['사람이 해석해야 하는 묶음 번호', '데이터에 원래 붙어 있던 정답', '이상치를 뜻하는 -1'], a: 0,
      why: '비지도학습에는 정답이 없어 알고리즘이 라벨을 스스로 만들어 붙인다. 0번 군집이 무엇인지는 사람이 해석해야 한다.' },
    { q: '강화학습의 보상은 지도학습의 라벨과 무엇이 다른가?',
      o: ['정답 행동을 직접 알려 준다', '방금 행동이 좋았는지만 알려 준다', '학습 전에 데이터셋으로 한꺼번에 주어진다'], a: 1,
      why: '라벨은 정답이 무엇인지 알려 주지만 보상은 행동의 결과 점수(목표 +10, 이동 -1)만 준다. 정보량이 적고 늦게 오기도 한다.' },
    { q: '"노출 → 클릭 → 다음 노출"이 이어지는 추천 순서 최적화는 어느 패러다임인가?',
      o: ['강화학습', '지도학습(분류)', '비지도학습(군집)'], a: 0,
      why: '행동이 다음 상황을 바꾸는 순차 결정이고 클릭이라는 보상이 있다. 판단 순서상 강화학습 조건을 먼저 걸러낸다.' },
    { q: 'GPT 사전학습에서 라벨(다음 단어)은 누가 만드나?',
      o: ['라벨링 작업자가 직접 단다', '사용자가 선호 점수로 매긴다', '텍스트 자체 — 바로 다음 단어가 정답이다'], a: 2,
      why: '자기지도학습은 데이터가 스스로 라벨을 공급한다. 라벨링 비용이 0원이라 인터넷 전체를 학습 데이터로 쓸 수 있었다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '먼저 정답 라벨을 만들 수 있는지 묻는다. 있으면 지도학습이고, 범주면 분류, 숫자면 회귀다.',
    '라벨이 없으면 비지도학습이다. 군집, 차원축소, 이상탐지로 데이터 속 구조를 찾는다.',
    '행동이 다음 상황을 바꾸고 보상이 있으면 강화학습이다. 보상이 늦게 오는 점이 가장 어렵다.',
    '현대 LLM은 자기지도 사전학습, 지도 파인튜닝, RLHF를 한 파이프라인에 이어 붙인다.',
  ];
  const review = [
    { q: '고객을 K-means로 묶어 이탈 대책을 세우려는데 군집이 무엇인지 해석이 안 된다. 로그에는 과거 이탈 여부가 남아 있다. 더 맞는 방법은?',
      o: ['군집 수 K를 바꿔 가며 다시 돌린다', '이탈 여부를 라벨로 삼아 분류 모델을 학습한다', '이탈을 보상으로 두고 강화학습을 한다'], a: 1,
      why: '라벨을 만들 수 있는 문제를 비지도로 돌리면 해석하기 어려운 묶음만 남는다. 라벨이 없다고 단정하기 전에 로그에서 뽑을 수 있는지부터 본다.' },
    { q: '카드 사기 라벨이 거의 없다. 출발점으로 가장 현실적인 것은?',
      o: ['순차 결정 문제로 보고 강화학습을 쓴다', '몇 안 되는 라벨로 분류기를 바로 학습한다', '비지도 이상탐지로 튀는 거래를 찾는다'], a: 2,
      why: '라벨이 희소하면 라벨이 없는 것에 가깝다. 이때는 데이터 속에서 튀는 점을 찾는 이상탐지가 출발점이 된다.' },
    { q: '라벨은 조금, 미라벨 데이터는 많아서 확신 높은 예측을 라벨로 승격시키며 학습한다. 승격 기준을 크게 낮췄더니 성능이 떨어졌다. 이유는?',
      o: ['틀린 예측이 라벨로 섞여 들어갔다', '미라벨 데이터가 줄어 학습량이 모자랐다', '비지도학습으로 바뀌어 정답이 사라졌다'], a: 0,
      why: '준지도학습은 예측을 라벨로 다시 쓰므로 승격 기준이 곧 라벨 품질이다. 기준을 낮추면 틀린 라벨이 늘고 모델이 그 오류를 배운다.' },
  ];

  RA.page({ title: '학습 패러다임 지도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
