/* III-1-1 군집화 (K-means · 엘보우/실루엣 · 함정 · 계층 군집) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 중심점(×)이 점 덩어리 한가운데로 끌려가는 "자석". 데이터는 이 페이지가 쓰던 고객 24명(0~100 정규화 좌표),
 * 엘보우·실루엣 표, 함정 시연 점, 덴드로그램 병합 높이를 그대로 옮겼다. inertia 는 그 점들로 페이지와 같은 계산을 돌린 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, card, mono, sub, lbl, pill, grow, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 페이지 데이터 ----------
  const POINTS = [[10, 12], [18, 20], [14, 25], [22, 10], [8, 18], [20, 28], [16, 8], [25, 18], [70, 20], [80, 28], [75, 12], [85, 20],
    [68, 30], [78, 35], [88, 30], [72, 25], [40, 70], [50, 78], [45, 85], [55, 72], [38, 80], [48, 65], [58, 82], [42, 90]];
  const INIT = [[30, 50], [50, 30], [60, 60]];
  const ELBOW = [[1, 26400, null], [2, 11800, 0.55], [3, 2300, 0.74], [4, 1900, 0.58], [5, 1600, 0.49], [6, 1400, 0.43], [7, 1250, 0.39]];
  const ELONG = [[8, 30, 0, 0], [20, 32, 0, 0], [33, 29, 0, 0], [46, 31, 0, 1], [60, 30, 0, 1], [74, 32, 0, 1], [88, 30, 0, 1],
    [8, 68, 1, 0], [20, 70, 1, 0], [33, 67, 1, 0], [46, 69, 1, 1], [60, 68, 1, 1], [74, 70, 1, 1], [88, 68, 1, 1]];
  const DONUT = [[50, 10, 0, 0], [78, 22, 0, 1], [90, 50, 0, 1], [78, 78, 0, 1], [50, 90, 0, 0], [22, 78, 0, 0], [10, 50, 0, 0], [22, 22, 0, 0],
    [46, 48, 1, 0], [54, 52, 1, 1], [50, 44, 1, 0], [52, 56, 1, 1]];
  const LEAVES = [['A1', 8], ['A2', 20], ['A3', 32], ['C1', 44], ['C2', 56], ['B1', 68], ['B2', 80], ['B3', 92]];
  // 병합: [왼쪽, 오른쪽, 높이] — 잎 번호 또는 앞선 병합 이름
  const MERGES = [['B1', 'B2', 7, 'b12'], ['A1', 'A2', 8, 'a12'], ['C1', 'C2', 10, 'C'], ['b12', 'B3', 12, 'B'], ['a12', 'A3', 14, 'A'], ['A', 'C', 35, 'AC'], ['AC', 'B', 55, 'ALL']];
  const CC = [INFO, WARN, ACC], CBG = [INFOBG, WARNBG, ACCBG];
  const d2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
  // 페이지의 runKMeans 와 같은 계산
  function runKMeans(init, n) { const snaps = []; let cs = init.map((q) => q.slice());
    for (let t = 0; t < n; t++) { const as = POINTS.map((p) => { let b = 0; for (let j = 1; j < cs.length; j++) if (d2(p, cs[j]) < d2(p, cs[b])) b = j; return b; });
      snaps.push({ cs: cs.map((q) => q.slice()), as, inertia: Math.round(POINTS.reduce((s, p, i) => s + d2(p, cs[as[i]]), 0)) });
      cs = cs.map((q, j) => { const m = POINTS.filter((_, i) => as[i] === j); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : q; }); }
    return snaps; }
  const SN = runKMeans(INIT, 4), FIN = SN[SN.length - 1];
  const BAD3 = runKMeans([[12, 15], [22, 22], [65, 50]], 4);   // 한 덩어리에 중심 2개가 몰린 초기값

  // ---------- 그리기 도구 ----------
  function plot(o) { o = o || {}; return R.axes(o.x ?? 60, o.y ?? 40, o.w ?? 320, o.h ?? 320, Object.assign({ x: [0, 100], y: [0, 100], xt: o.w && o.w < 300 ? [] : [0, 50, 100], yt: o.w && o.w < 300 ? [] : [0, 50, 100], xl: o.w && o.w < 300 ? null : '월 구매액', yl: o.w && o.w < 300 ? null : '월 방문빈도' }, o.ax || {})); }
  function pts(ax, P, f) { P.forEach((p, i) => { const o = f ? f(p, i) : {}, s = o.s ?? 1; if (s <= 0.02) return;
      el('circle', { cx: ax.X(p[0]), cy: ax.Y(p[1]), r: (o.r || 6.5) * s, fill: o.col || OFF, opacity: o.op ?? 1, stroke: o.stroke || 'none', 'stroke-width': 2 }); }); }
  function xmark(ax, q, col, s, lab) { if (s <= 0.02) return; const x = ax.X(q[0]), y = ax.Y(q[1]), r = 11 * s;
    el('path', { d: `M${x - r},${y - r} L${x + r},${y + r} M${x + r},${y - r} L${x - r},${y + r}`, stroke: PANEL, 'stroke-width': 8, 'stroke-linecap': 'round' });
    el('path', { d: `M${x - r},${y - r} L${x + r},${y + r} M${x + r},${y - r} L${x - r},${y + r}`, stroke: col, 'stroke-width': 4.5, 'stroke-linecap': 'round' });
    if (lab) mono(x + 14, y - 10, lab, { 'font-size': 14, 'font-weight': 800, fill: col }); }
  function note(x, y, s, op, a) { return tx(x, y, s, Object.assign({ 'font-size': 16, 'font-weight': 700, opacity: op }, a || {})); }
  function table(x, y, cols, rows, o) { o = o || {}; const rh = o.rh || 34;
    cols.forEach(([h, dx, col]) => mono(x + dx, y, h, { 'font-size': 14, 'font-weight': 700, fill: col || MUT }));
    el('line', { x1: x, y1: y + 10, x2: x + (o.w || 360), y2: y + 10, stroke: GRID, 'stroke-width': 1.5 });
    rows.forEach((r, i) => r.forEach((s, j) => { if (s == null) return; const [txt, a] = Array.isArray(s) ? s : [s, {}]; mono(x + cols[j][1], y + 12 + (i + 1) * rh - 8, txt, Object.assign({ 'font-size': 15, opacity: o.op ? o.op(i) : 1 }, a)); })); }

  // ---------- 1. 비지도의 문제 설정 ----------
  const HEAD = [['12000.0', '3.1'], ['310000.0', '2.4'], ['145000.0', '18.7']], HEADPT = [0, 11, 18];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { lbl(220, 60, '지도 학습', fade(u, 0.2), { 'font-size': 18 }); lbl(700, 60, '비지도 학습', fade(u, 0.9), { 'font-size': 18, fill: ACC });
      const rows = [['…', '…', '스팸'], ['…', '…', '정상'], ['…', '…', '스팸']];
      table(90, 110, [['X: 특성1', 0], ['특성2', 120], ['y: 정답', 220, INFO]], rows.map((r) => [r[0], r[1], [r[2], { fill: INFO, 'font-weight': 700 }]]), { w: 290, op: (i) => fade(u, 0.3 + i * 0.15) });
      table(570, 110, [['X: 특성1', 0], ['특성2', 120], ['y', 220, OFF]], rows.map((r) => [r[0], r[1], ['?', { fill: OFF }]]), { w: 290, op: (i) => fade(u, 1.0 + i * 0.15) });
      cross(810, 160, 14, pop(u, 1.7));
      note(480, 300, '정답 라벨이 없다 → 채점표 없이 집단을 찾는다', fade(u, 2.0), { 'text-anchor': 'middle' });
      sub(480, 336, '발상: 가까운 점 = 비슷한 고객 (거리 = 유사도)', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 1) { [['numpy', INK], ['pandas', INK], ['StandardScaler', ACC]].forEach(([s, col], i) => pill(200 + i * 200, 110, s, col, pop(u, 0.3 + i * 0.4), { mono: true, fs: 16 }));
      [['월 구매액', '수만 ~ 수십만 원', 600, WARN], ['월 방문수', '한두 자리', 26, INFO]].forEach(([a, b, w, col], i) => { const y = 210 + i * 70, g = E(u, 1.4 + i * 0.3, 2.0 + i * 0.3);
        tx(80, y + 16, a, { 'font-size': 15, 'font-weight': 700, opacity: g }); el('rect', { x: 200, y, width: w * g, height: 24, rx: 4, fill: col, opacity: 0.8 }); tx(210 + w * g, y + 18, b, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: g }); });
      sub(480, 380, '거리 기반이라 스케일러가 처음부터 등장한다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 2 || k === 3) { mono(60, 80, 'df = pd.read_csv("customers.csv")', { 'font-size': 16, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.2) : 1 });
      const cols = [['', 0], ['monthly_spend', 40], ['monthly_visits', 230]]; if (k === 3) cols.push(['segment', 430, OFF]);
      table(80, 140, cols, HEAD.map((r, i) => [String(i), r[0], r[1], k === 3 ? ['?', { fill: OFF, 'font-weight': 800 }] : null]), { w: k === 3 ? 540 : 400, rh: 40, op: (i) => (k === 2 ? fade(u, 0.6 + i * 0.3) : 1) });
      if (k === 2) { note(560, 190, 'df.head(3)', fade(u, 0.5), { class: 'mono', fill: ACC }); note(80, 320, '컬럼은 구매액과 방문수 두 개뿐', fade(u, 1.9)); return; }
      el('rect', { x: 500, y: 112, width: 120, height: 150, rx: 8, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.4) });
      note(80, 320, '이 고객이 어느 그룹인지 아무도 모른다', fade(u, 1.0));
      pill(760, 220, '정확도 · AUC', MUT, pop(u, 1.6), { fs: 15 }); cross(760, 220, 18, pop(u, 1.9));
      sub(760, 270, '평가 방법부터 새로 정한다', fade(u, 2.2), { 'font-size': 15 }); return; }
    const ax = plot();
    if (k === 4) { pts(ax, POINTS, (p, i) => ({ s: HEADPT.includes(i) ? 0 : pop(u, 1.6 + i * 0.03) }));
      HEAD.forEach((r, i) => { const y = 120 + i * 50, g = E(u, 0.5 + i * 0.3, 1.2 + i * 0.3), p = POINTS[HEADPT[i]];
        mono(470, y, `[${r[0]}, ${r[1]}]`, { 'font-size': 15, opacity: 1 - 0.5 * g });
        if (g > 0) el('circle', { cx: lerp(460, ax.X(p[0]), g), cy: lerp(y - 5, ax.Y(p[1]), g), r: 7.5, fill: INK }); });
      mono(470, 80, 'X = df[[spend, visits]]', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      note(470, 300, '고객 한 명 = 평면 위의 점 하나', fade(u, 2.0)); return; }
    if (k === 5) { pts(ax, POINTS);
      const pair = (a, b, col, at) => { const g = E(u, at, at + 0.5); const p = POINTS[a], q = POINTS[b]; el('line', { x1: ax.X(p[0]), y1: ax.Y(p[1]), x2: ax.X(lerp(p[0], q[0], g)), y2: ax.Y(lerp(p[1], q[1], g)), stroke: col, 'stroke-width': 3 }); pts(ax, [p, q], () => ({ col })); };
      pair(1, 2, GOOD, 0.4); pair(1, 9, BAD, 1.2);
      R.snippet(450, 70, ['def euclidean(a, b):', '    return sqrt(((a - b) ** 2).sum())'], { op: fade(u, 0.2) });
      note(450, 200, '짧은 선 = 행동이 비슷한 고객', fade(u, 0.9), { fill: GOOD });
      note(450, 240, '긴 선 = 다른 고객', fade(u, 1.7), { fill: BAD });
      sub(640, 300, '"비슷하다" 를 거리로 못박는다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 6) { pts(ax, POINTS, () => ({ op: 0.5 }));
      mono(450, 80, '거리² = (Δ구매액)² + (Δ방문수)²', { 'font-size': 16, 'font-weight': 700 });
      const g = E(u, 0.4, 1.2), s = E(u, 1.6, 2.3);
      tx(450, 130, '스케일링 전', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
      el('rect', { x: 450, y: 145, width: 440 * g, height: 26, rx: 4, fill: WARN, opacity: 0.85 }); el('rect', { x: 450 + 440 * g, y: 145, width: 3, height: 26, fill: INFO });
      tx(450, 198, '구매액 항이 거의 전부', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: g });
      tx(450, 250, 'X_scaled (평균 0 · 분산 1)', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5), class: 'mono' });
      el('rect', { x: 450, y: 265, width: 230 * s, height: 26, rx: 4, fill: WARN, opacity: 0.85 }); el('rect', { x: 450 + 230 * s, y: 265, width: 200 * s, height: 26, rx: 4, fill: INFO, opacity: 0.85 });
      tx(450, 318, '두 축이 함께 거리에 들어간다', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: s }); } }

  // ---------- 2. K-means 반복 ----------
  function s2(t, c) { const { k, u } = c, ax = plot();
    if (k === 0) { pts(ax, POINTS, (p, i) => ({ s: pop(u, 0.2 + i * 0.02) }));
      const cx = 660, cy = 210, r = 90, g = E(u, 0.8, 2.0);
      el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3 });
      el('path', { d: `M${cx + r},${cy} A${r},${r} 0 0 1 ${cx + r * Math.cos(Math.PI * 2 * g)},${cy + r * Math.sin(Math.PI * 2 * g)}`, fill: 'none', stroke: ACC, 'stroke-width': 4, opacity: g > 0.01 ? 1 : 0 });
      card(cx, cy - r, 150, 44, { rx: 22, text: '① 할당', fs: 16, stroke: ACC, color: ACC, s: pop(u, 0.5) });
      card(cx, cy + r, 150, 44, { rx: 22, text: '② 중심 재계산', fs: 16, stroke: ACC, color: ACC, s: pop(u, 0.9) });
      mono(cx, cy + 6, '반복', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) });
      sub(cx, 380, 'from sklearn.cluster import KMeans', fade(u, 2.0), { 'font-size': 14.5, class: 'mono' }); return; }
    const S0 = SN[0], S1 = SN[1], S2 = SN[2];
    if (k === 1) { pts(ax, POINTS); S0.cs.forEach((q, j) => xmark(ax, q, CC[j], pop(u, 0.3 + j * 0.3), `c${j}`));
      ['n_clusters=3', 'init="k-means++"', 'n_init=10', 'max_iter=300'].forEach((s, i) => mono(460, 110 + i * 42, s, { 'font-size': 16, 'font-weight': 700, fill: i === 0 ? ACC : INK, opacity: fade(u, 0.4 + i * 0.35) }));
      sub(640, 320, '그림은 일부러 엉뚱한 초기 중심에서 출발한다', fade(u, 2.0), { 'font-size': 14.5 });
      sub(640, 350, 'K=3 의 근거는 Step 3 에서', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 2) { pts(ax, POINTS, (p, i) => ({ col: u > 2.1 ? CC[FIN.as[i]] : OFF }));
      const mv = [0, 1, 2].map((it) => SN[it].cs.reduce((s, q, j) => s + Math.sqrt(d2(q, SN[it + 1].cs[j])), 0));
      [0, 1].forEach((it) => SN[it].cs.forEach((q, j) => { const nq = SN[it + 1].cs[j], g = E(u, 0.3 + it * 0.5, 0.7 + it * 0.5); el('line', { x1: ax.X(q[0]), y1: ax.Y(q[1]), x2: ax.X(lerp(q[0], nq[0], g)), y2: ax.Y(lerp(q[1], nq[1], g)), stroke: CC[j], 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }); }));
      FIN.cs.forEach((q, j) => xmark(ax, q, CC[j], fade(u, 1.2)));
      tx(460, 110, '반복마다 중심 이동량', { 'font-size': 15, 'font-weight': 700 });
      mv.forEach((m, i) => { const g = E(u, 0.4 + i * 0.4, 0.8 + i * 0.4); el('rect', { x: 460, y: 130 + i * 40, width: Math.max(3, 3.2 * m * g), height: 24, rx: 4, fill: i === 2 ? GOOD : ACC, opacity: 0.8 }); mono(450, 148 + i * 40, `${i + 1}`, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); });
      mono(470, 278, '이동 < tol(1e-4) → 멈춤', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      mono(470, 330, 'labels = kmeans.fit_predict(X_scaled)', { 'font-size': 14.5, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { POINTS.forEach((p, i) => { const j = S0.as[i], q = S0.cs[j], g = E(u, 0.3 + i * 0.05, 0.6 + i * 0.05); if (g > 0) el('line', { x1: ax.X(p[0]), y1: ax.Y(p[1]), x2: ax.X(lerp(p[0], q[0], g)), y2: ax.Y(lerp(p[1], q[1], g)), stroke: CC[j], 'stroke-width': 1.4, opacity: 0.6 }); });
      pts(ax, POINTS, (p, i) => ({ col: u > 0.6 + i * 0.05 ? CC[S0.as[i]] : OFF })); S0.cs.forEach((q, j) => xmark(ax, q, CC[j], 1));
      const ids = [0, 8, 16, 11], m = ids.map((i) => S0.cs.map((q) => Math.round(Math.sqrt(d2(POINTS[i], q)))));
      mono(470, 74, 'dists (n × K)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) });
      R.heat(560, 110, m, 56, { max: 90, col: MUT, rows: ids.map((i) => `점${i}`), cols: ['c0', 'c1', 'c2'], hi: (r, cc) => u > 1.6 && m[r][cc] === Math.min(...m[r]) });
      mono(470, 370, 'assign = dists.argmin(axis=1)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { const g1 = E(u, 0.3, 1.2), g2 = E(u, 1.5, 2.3), cs = S0.cs.map((q, j) => { const a = S1.cs[j], b = S2.cs[j]; return g2 > 0 ? [lerp(a[0], b[0], g2), lerp(a[1], b[1], g2)] : [lerp(q[0], a[0], g1), lerp(q[1], a[1], g1)]; });
      const as = g2 > 0.5 ? S2.as : S1.as;
      pts(ax, POINTS, (p, i) => ({ col: CC[(g1 > 0.5 ? as : S0.as)[i]] }));
      S0.cs.forEach((q, j) => { el('line', { x1: ax.X(q[0]), y1: ax.Y(q[1]), x2: ax.X(cs[j][0]), y2: ax.Y(cs[j][1]), stroke: CC[j], 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: 0.7 }); xmark(ax, cs[j], CC[j], 1); });
      mono(460, 110, '중심 ← 소속 점들의 평균', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      mono(460, 150, 'X[assign == k].mean(axis=0)', { 'font-size': 15, opacity: fade(u, 0.6) });
      note(460, 230, '평균 = 거리 제곱합이 가장 작은 위치', fade(u, 1.3));
      sub(640, 290, '중심이 덩어리 한가운데로 끌려간다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 5 || k === 6) { pts(ax, POINTS, (p, i) => ({ col: CC[FIN.as[i]] })); FIN.cs.forEach((q, j) => xmark(ax, q, CC[j], 1));
      if (k === 5) { const ch = R.axes(520, 70, 360, 230, { x: [0, 3], y: [0, 22000], xt: [0, 1, 2, 3], yt: [0, 10000, 20000], xl: '반복', yl: 'inertia (그림 좌표)' });
        R.line(ch, SN.map((s, i) => [i, s.inertia]), E(u, 0.3, 1.8), ACC, { sw: 3 }); R.scatter(ch, SN.map((s, i) => [i, s.inertia, ACC]), { u: E(u, 0.3, 1.8), r: 5 });
        SN.slice(0, 3).forEach((s, i) => mono(ch.X(i) + 10, ch.Y(s.inertia) - 10, String(s.inertia), { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5 + i * 0.5) }));
        note(520, 380, '할당·재계산 모두 inertia 를 늘리지 않는다 → 반드시 멈춘다', fade(u, 2.1), { 'font-size': 15 }); return; }
      [['kmeans.inertia_', `${FIN.inertia}  (그림 좌표)`], ['kmeans.cluster_centers_', FIN.cs.map((q) => `(${Math.round(q[0])},${Math.round(q[1])})`).join(' ')], ['kmeans.n_iter_', '3번째 반복에서 할당 불변']].forEach(([a, b], i) => {
        mono(450, 110 + i * 80, a, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3 + i * 0.5) }); mono(450, 140 + i * 80, b, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5 + i * 0.5) }); });
      sub(640, 380, '수렴은 보장, 최적은 보장 안 됨 → Step 4', fade(u, 2.2), { 'font-size': 15 }); } }

  // ---------- 3. 엘보우와 실루엣 ----------
  function elbowAx() { return R.axes(80, 60, 360, 270, { x: [0.6, 7.4], y: [0, 28000], xt: [1, 2, 3, 4, 5, 6, 7], yt: [0, 10000, 20000], xl: 'K', yl: 'inertia', grid: true }); }
  function silAx() { return R.axes(560, 60, 340, 270, { x: [0.4, 7.6], y: [0, 0.8], xt: [1, 2, 3, 4, 5, 6, 7], yt: [0, 0.4, 0.8], xl: 'K', yl: 'silhouette', grid: true }); }
  function silBars(ax, u, a, hi) { ELBOW.forEach(([kk, , s], i) => { if (s == null) { mono(ax.X(kk), ax.Y(0) - 10, '—', { 'font-size': 15, 'text-anchor': 'middle', fill: OFF }); return; } const g = a == null ? 1 : E(u, a + i * 0.15, a + 0.4 + i * 0.15);
      el('rect', { x: ax.X(kk) - 16, y: ax.Y(s * g), width: 32, height: ax.Y(0) - ax.Y(s * g), rx: 3, fill: hi && kk === 3 ? ACC : OFF, opacity: 0.85 });
      if (hi) mono(ax.X(kk), ax.Y(s) - 8, s.toFixed(2), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: kk === 3 ? ACC : MUT, opacity: g }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { const ea = elbowAx(), sa = silAx(); lbl(260, 30, '엘보우', fade(u, 0.2), { fill: INFO }); lbl(730, 30, '실루엣', fade(u, 0.5), { fill: ACC });
      if (k === 0) { mono(260, 200, 'km.inertia_', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.8) }); mono(730, 200, 'silhouette_score', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
        sub(480, 404, '라벨이 없으니 "응집과 분리" 를 잰다', fade(u, 2.0), { 'font-size': 15 }); }
      else { for (let kk = 1; kk <= 7; kk++) { el('circle', { cx: ea.X(kk), cy: ea.Y(0), r: 6, fill: INFO, opacity: pop(u, 0.3 + kk * 0.15) }); el('circle', { cx: sa.X(kk), cy: sa.Y(0), r: 6, fill: ACC, opacity: pop(u, 0.3 + kk * 0.15) }); }
        mono(260, 200, 'inertias = []', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); mono(730, 200, 'silhouettes = []', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        sub(480, 404, 'k_range = range(1, 8)', fade(u, 2.1), { 'font-size': 15, class: 'mono' }); } return; }
    if (k === 2) { const ea = elbowAx(), sa = silAx(), cur = Math.min(7, Math.floor(clamp((u - 0.3) / 0.3, 0, 7)) + 1);
      ELBOW.forEach(([kk, v, s]) => { const on = u > 0.3 + (kk - 1) * 0.3; if (!on) return; el('circle', { cx: ea.X(kk), cy: ea.Y(v), r: 6, fill: INFO });
        if (s != null) el('rect', { x: sa.X(kk) - 16, y: sa.Y(s), width: 32, height: sa.Y(0) - sa.Y(s), rx: 3, fill: OFF });
        else mono(575, 402, 'K=1: 실루엣 정의 안 됨', { 'font-size': 13.5, fill: BAD, 'font-weight': 700 }); });
      pill(480, 400, `K = ${cur} 학습 중`, ACC, 1, { mono: true, fs: 15 }); return; }
    const ea = elbowAx();
    const lu = k === 3 ? E(u, 0.3, 1.8) : 1; R.line(ea, ELBOW.map(([kk, v]) => [kk, v]), lu, INFO, { sw: 3 }); R.scatter(ea, ELBOW.map(([kk, v]) => [kk, v, INFO]), { u: lu, r: 5 });
    if (k === 3) { note(560, 140, 'K 를 늘리면 inertia 는 언제나 준다', fade(u, 1.4)); note(560, 190, '→ 최소값이 아니라 "꺾임" 을 본다', fade(u, 2.0), { fill: INFO }); return; }
    if (k >= 4) { const hs = k === 4 ? pop(u, 1.5) : 1; el('circle', { cx: ea.X(3), cy: ea.Y(2300), r: 18 * hs, fill: 'none', stroke: BAD, 'stroke-width': 3 });
      if (k === 4) { [[1, 26400], [2, 11800], [3, 2300]].forEach(([kk, v], i) => mono(ea.X(kk) + 14, ea.Y(v) + (i === 2 ? -18 : 4), String(v), { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3 + i * 0.4) }));
        note(560, 140, 'K=3 까지 급감, 그 뒤로는 찔끔', fade(u, 1.6)); note(560, 190, '엘보우 후보 K = 3', fade(u, 2.0), { fill: BAD }); return; } }
    if (k === 5) { const ax2 = plot({ x: 560, y: 60, w: 280, h: 280 }), me = 17, near = [1, 5, 7, 2], far = [16, 19, 21];
      pts(ax2, POINTS, (p, i) => ({ col: CC[FIN.as[i]], r: 5, op: 0.8 }));
      near.forEach((j, i) => { const g = E(u, 0.3 + i * 0.1, 0.7 + i * 0.1); el('line', { x1: ax2.X(POINTS[me - 17 + 3][0]), y1: ax2.Y(POINTS[3][1]), x2: ax2.X(lerp(POINTS[3][0], POINTS[j][0], g)), y2: ax2.Y(lerp(POINTS[3][1], POINTS[j][1], g)), stroke: INFO, 'stroke-width': 2 }); });
      far.forEach((j, i) => { const g = E(u, 1.0 + i * 0.1, 1.4 + i * 0.1); el('line', { x1: ax2.X(POINTS[3][0]), y1: ax2.Y(POINTS[3][1]), x2: ax2.X(lerp(POINTS[3][0], POINTS[j][0], g)), y2: ax2.Y(lerp(POINTS[3][1], POINTS[j][1], g)), stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4' }); });
      el('circle', { cx: ax2.X(POINTS[3][0]), cy: ax2.Y(POINTS[3][1]), r: 9, fill: INK });
      mono(ax2.X(30), ax2.Y(10) + 4, 'a', { 'font-size': 18, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.7) }); mono(ax2.X(36), ax2.Y(48), 'b', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      card(700, 392, 250, 40, { rx: 8, text: '(b − a) / max(a, b)', fs: 17, mono: true, stroke: INK, s: pop(u, 1.9) }); return; }
    const sa = silAx(); silBars(sa, u, k === 6 ? 0.3 : null, true);
    if (k === 6) { note(560, 386, 'K=3 → 0.74 최고점', fade(u, 1.8), { fill: ACC }); return; }
    // k7: 비즈니스 심판
    el('rect', { x: 0, y: 340, width: 960, height: 80, fill: PANEL });
    ['캠페인 1', '캠페인 2', '캠페인 3'].forEach((s, i) => card(330 + i * 150, 375, 130, 40, { rx: 8, text: s, fs: 15, stroke: CC[i], color: CC[i], s: pop(u, 0.8 + i * 0.25) }));
    tx(60, 382, '운영 가능한 수?', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
    pill(840, 375, 'K = 3 확정', GOOD, pop(u, 1.9), { fs: 16 }); }

  // ---------- 4. K-means 의 함정 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const T = [['① 초기값', 160], ['② 구형 가정', 480], ['③ 스케일', 800]];
      T.forEach(([nm, x], i) => { const s = pop(u, 0.3 + i * 0.5); card(x, 200, 260, 260, { rx: 14, stroke: GRID, s }); if (s < 0.9) return; lbl(x, 100, nm, 1, { 'font-size': 18 });
        const ax = R.axes(x - 100, 120, 200, 160, { x: [0, 100], y: [0, 100] });
        if (i === 0) { pts(ax, POINTS, (p, j) => ({ r: 4, col: CC[BAD3[3].as[j]] })); BAD3[3].cs.forEach((q, j) => xmark(ax, q, CC[j], 0.6)); }
        if (i === 1) pts(ax, ELONG, (p) => ({ r: 4, col: p[3] ? WARN : INFO }));
        if (i === 2) { el('rect', { x: x - 100, y: 200, width: 190, height: 22, rx: 4, fill: WARN }); el('rect', { x: x + 90, y: 200, width: 3, height: 22, fill: INFO }); } });
      sub(480, 390, '셋 다 에러 없이 그럴듯한 결과를 낸다', fade(u, 2.0), { 'font-size': 15.5, fill: BAD }); return; }
    if (k <= 3) { const ax = plot();
      if (k === 1) { const S = BAD3[3]; pts(ax, POINTS, (p, i) => ({ col: CC[S.as[i]] })); S.cs.forEach((q, j) => xmark(ax, q, CC[j], pop(u, 0.3 + j * 0.2)));
        mono(450, 100, 'init="random", n_init=1', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
        note(450, 160, '한 덩어리에 중심 2개가 몰렸다', fade(u, 1.0));
        note(450, 200, '위의 두 덩어리는 하나로 뭉개졌다', fade(u, 1.5), { fill: BAD });
        sub(640, 270, '지역 최적에 갇혀 더 움직이지 않는다', fade(u, 2.0), { 'font-size': 15 }); return; }
      if (k === 2) { const sw = E(u, 1.2, 1.8), S = sw > 0.5 ? FIN : BAD3[3]; pts(ax, POINTS, (p, i) => ({ col: CC[S.as[i]] })); S.cs.forEach((q, j) => xmark(ax, q, CC[j], 1));
        for (let r = 0; r < 10; r++) card(470 + r * 44, 100, 36, 36, { rx: 6, text: String(r + 1), fs: 14, mono: true, stroke: r === 3 ? GOOD : GRID, color: r === 3 ? GOOD : MUT, s: pop(u, 0.2 + r * 0.08) });
        sub(680, 144, 'n_init=10 — 10벌 돌려 inertia 가 가장 작은 것', fade(u, 0.9), { 'font-size': 14.5 });
        tx(470, 210, 'bad', { 'font-size': 15, 'font-weight': 700, fill: BAD }); R.hbar(520, 196, 300, 4100.5, 4500, { u: E(u, 1.0, 1.5), col: BAD, text: '4100.5' });
        tx(470, 260, 'good', { 'font-size': 15, 'font-weight': 700, fill: GOOD }); R.hbar(520, 246, 300, 2300.1, 4500, { u: E(u, 1.4, 1.9), col: GOOD, text: '2300.1' });
        note(470, 330, 'k-means++ + n_init=10 이 기본값', fade(u, 2.2)); return; }
      // k3: k-means++ 원리 — 이미 뽑힌 중심에서 먼 점일수록 크게 (뽑힐 확률 ∝ D²)
      const picks = [3, 13, 18], np = u < 1.0 ? 1 : u < 1.9 ? 2 : 3, ch = picks.slice(0, np).map((i) => POINTS[i]);
      const D = POINTS.map((p) => Math.min(...ch.map((q) => d2(p, q)))), mx = Math.max(...D) || 1;
      pts(ax, POINTS, (p, i) => ({ r: 3 + 9 * Math.sqrt(D[i] / mx), col: OFF, op: 0.75 }));
      ch.forEach((q, j) => xmark(ax, q, CC[j], pop(u, [0.2, 1.0, 1.9][j]), `${j + 1}번째`));
      note(450, 110, '점 크기 = 다음 중심으로 뽑힐 확률 (∝ D²)', fade(u, 0.4));
      sub(640, 150, 'D = 이미 뽑힌 중심까지의 거리', fade(u, 0.7), { 'font-size': 15 });
      note(450, 240, '먼 덩어리일수록 다음 중심이 되기 쉽다', fade(u, 1.4), { fill: ACC });
      sub(640, 290, '→ 중심들이 서로 흩어져 시작한다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 4 || k === 5) { const D = k === 4 ? ELONG : DONUT, nm = k === 4 ? ['사람 눈: 띠 2개', 'K-means: 세로로 자름'] : ['K-means: 반달 2개', 'DBSCAN: 도넛 + 중심'];
      [0, 1].forEach((side) => { const x = 60 + side * 470, ax = plot({ x, y: 70, w: 280, h: 280 }), useTrue = k === 4 ? side === 0 : side === 1, at = side ? 0.9 : 0.3;
        lbl(x + 140, 52, nm[side], fade(u, at), { fill: side === (k === 4 ? 1 : 0) ? BAD : GOOD });
        if (k === 5 && side === 1) D.forEach((p) => { if (p[2] === 1) el('circle', { cx: ax.X(p[0]), cy: ax.Y(p[1]), r: 26 * E(u, 1.2, 1.8), fill: 'none', stroke: ACC, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }); });
        pts(ax, D, (p, i) => ({ col: u > at + 0.3 ? (useTrue ? [INFO, WARN][p[2]] : [INFO, WARN][p[3]]) : OFF, s: pop(u, at + i * 0.02) }));
        if (k === 4 && side === 1) { const g = E(u, 1.4, 1.9); el('line', { x1: ax.X(40), y1: ax.Y(0), x2: ax.X(40), y2: ax.Y(100 * g), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }); }
        if (k === 5 && side === 0) { const g = E(u, 0.8, 1.3); el('line', { x1: ax.X(50 + 10 * 0), y1: ax.Y(0), x2: ax.X(50), y2: ax.Y(100 * g), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }); } });
      if (k === 4) note(480, 404, '중심 주변의 둥근 덩어리만 찾는다', fade(u, 2.1), { 'text-anchor': 'middle' });
      else note(480, 404, 'DBSCAN(eps, min_samples): 밀도로 이어진 점을 한 집단으로', fade(u, 2.1), { 'text-anchor': 'middle', fill: GOOD }); return; }
    if (k === 6) { mono(80, 90, '거리² = (구매액 차)² + (방문수 차)²', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 0.2) });
      const g = E(u, 0.6, 1.6); el('rect', { x: 80, y: 140, width: 760 * g, height: 50, rx: 6, fill: WARN, opacity: 0.85 }); el('rect', { x: 80 + 760 * g, y: 140, width: 3, height: 50, fill: INFO });
      tx(80, 222, '(구매액 차)² — 단위 수십만의 제곱', { 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      tx(80, 252, '(방문수 차)² — 한 자리의 제곱 → 막대 끝의 실선 한 줄', { 'font-size': 15.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) });
      note(80, 330, 'raw_labels = KMeans(3).fit_predict(X)  → 방문빈도는 무시된다', fade(u, 2.1), { fill: BAD, class: 'mono', 'font-size': 15 }); return; }
    if (k === 7) { [0, 1].forEach((side) => { const x = 60 + side * 470, ax = plot({ x, y: 70, w: 280, h: 280 }), at = side ? 1.2 : 0.3;
        lbl(x + 140, 52, side ? 'X_scaled → 두 축이 함께' : 'X 그대로 → 구매액순 3등분', fade(u, at), { fill: side ? GOOD : BAD });
        if (!side) [33, 66].forEach((v) => { const g = E(u, 0.5, 1.0); el('line', { x1: ax.X(v), y1: ax.Y(0), x2: ax.X(v), y2: ax.Y(100 * g), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); });
        pts(ax, POINTS, (p, i) => ({ col: u > at + 0.4 ? (side ? CC[FIN.as[i]] : CC[p[0] < 33 ? 0 : p[0] < 66 ? 2 : 1]) : OFF })); });
      note(480, 404, '결과가 "한 축 기준 등분" 처럼 보이면 스케일링부터 의심한다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    // k8 체크리스트
    [['init="k-means++" + n_init ≥ 10', '초기값'], ['둥근 덩어리 모양인가? 아니면 DBSCAN·GMM', '구형 가정'], ['StandardScaler 를 태웠는가', '스케일']].forEach(([a, b], i) => { const y = 100 + i * 80, at = 0.3 + i * 0.5;
      check(90, y, 13, pop(u, at)); tx(120, y + 6, a, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, at) }); sub(800, y + 6, b, fade(u, at), { 'font-size': 15 }); });
    ['K-means', 'KNN', 'DBSCAN'].forEach((s, i) => pill(300 + i * 180, 360, s, ACC, pop(u, 1.9 + i * 0.15), { mono: true, fs: 16 }));
    sub(480, 404, '거리 기반이면 스케일링은 전처리 기본값', fade(u, 2.3), { 'font-size': 15 }); }

  // ---------- 5. 계층 군집과 덴드로그램 ----------
  const LX = (v) => 90 + v * 4.6, HY = (h) => 350 - h * 4.9;
  const DCOL = { A1: INFO, A2: INFO, A3: INFO, a12: INFO, A: INFO, C1: ACC, C2: ACC, C: ACC, B1: WARN, B2: WARN, B3: WARN, b12: WARN, B: WARN };
  function dendro(u, o) { o = o || {}; const pos = {}; LEAVES.forEach(([n, x]) => { pos[n] = [LX(x), 0]; });
    LEAVES.forEach(([n, x]) => { el('circle', { cx: LX(x), cy: HY(0), r: 6, fill: o.color ? o.color(n) : INK }); mono(LX(x), HY(0) + 24, n, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' }); });
    MERGES.forEach(([a, b, h, nm], i) => { const g = o.at ? E(u, o.at + i * o.step, o.at + i * o.step + 0.3) : 1, pa = pos[a], pb = pos[b]; pos[nm] = [(pa[0] + pb[0]) / 2, h]; if (g <= 0) return;
      const col = o.color ? o.color(nm) : MUT, top = HY(lerp(Math.max(pa[1], pb[1]), h, g));
      el('polyline', { points: `${pa[0]},${HY(pa[1])} ${pa[0]},${Math.min(HY(pa[1]), top)} ${pb[0]},${Math.min(HY(pb[1]), top)} ${pb[0]},${HY(pb[1])}`, fill: 'none', stroke: col, 'stroke-width': 2.6 }); });
    return pos; }
  function groupsAt(h) { const parent = {}; LEAVES.forEach(([n]) => { parent[n] = n; }); const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const alias = {}; MERGES.forEach(([a, b, hh, nm]) => { const ra = find(alias[a] || a), rb = find(alias[b] || b); if (hh <= h) { parent[rb] = ra; } alias[nm] = ra; });
    const roots = {}; LEAVES.forEach(([n]) => { const r = find(n); roots[r] = roots[r] ?? Object.keys(roots).length; }); return { of: (n) => roots[find(alias[n] || n)], n: Object.keys(roots).length }; }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { LEAVES.forEach(([n, x], i) => { el('circle', { cx: LX(x), cy: HY(0), r: 6 * pop(u, 0.2 + i * 0.08), fill: INK }); mono(LX(x), HY(0) + 24, n, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.08) }); });
      [['linkage', '병합 이력 Z', 120], ['dendrogram', '나무 그림', 220], ['fcluster', '높이로 자르기', 320]].forEach(([a, b, y], i) => { const s = pop(u, 1.0 + i * 0.4);
        card(740, y - 40, 230, 52, { rx: 10, stroke: ACC, s }); mono(640, y - 44, a, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0 + i * 0.4) }); tx(640, y - 22, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.1 + i * 0.4) });
        if (i < 2) grow(740, y - 12, 740, y + 34, E(u, 1.2 + i * 0.4, 1.4 + i * 0.4), ACC); });
      note(90, 120, '점 하나 = 클러스터 하나에서 시작', fade(u, 1.0)); sub(270, 160, 'K 를 미리 정하지 않는다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 1) { dendro(u, { at: 0.3, step: 0.3, color: (n) => DCOL[n] || MUT });
      mono(640, 70, 'Z = linkage(X_scaled, "ward")', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      MERGES.forEach(([a, b, h], i) => mono(660, 110 + i * 36, `${a} + ${b}  @ ${h}`, { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.3), fill: i >= 5 ? MUT : INK }));
      sub(780, 380, 'ward: inertia 증가가 최소인 쌍부터', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 2) { const P1 = [[640, 150], [660, 200], [690, 170]], P2 = [[830, 130], [860, 180], [880, 150]];
      const rows = [['single', '최단점', [P1[2], P2[0]], 0.3], ['complete', '최장점', [P1[1], P2[2]], 1.0]];
      P1.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 7, fill: INFO })); P2.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 7, fill: WARN }));
      rows.forEach(([nm, kr, [p, q], at], i) => { const g = E(u, at, at + 0.4); el('line', { x1: p[0], y1: p[1], x2: lerp(p[0], q[0], g), y2: lerp(p[1], q[1], g), stroke: i ? BAD : GOOD, 'stroke-width': 3 }); mono(620, 270 + i * 36, `${nm} — ${kr}`, { 'font-size': 15, 'font-weight': 700, fill: i ? BAD : GOOD, opacity: g }); });
      P1.forEach((p) => P2.forEach((q) => el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: MUT, 'stroke-width': 1, opacity: 0.6 * fade(u, 1.7) })));
      mono(620, 342, 'average — 모든 쌍의 평균', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.7) });
      dendro(u, {}); sub(780, 392, '연결법이 바뀌면 병합 순서도 바뀐다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k ≥ 3: 높이 축 + 자르기
    if (k <= 5) [0, 25, 50].forEach((h) => { el('line', { x1: 70, y1: HY(h), x2: 76, y2: HY(h), stroke: MUT }); mono(64, HY(h) + 5, String(h), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
    if (k <= 5) tx(30, 50, '병합 거리', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    if (k === 3) { dendro(u, { at: 0.2, step: 0.15 }); const g = E(u, 1.5, 2.2); el('line', { x1: 70, y1: HY(25), x2: lerp(70, 540, g), y2: HY(25), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '8 5' });
      mono(560, HY(25) + 5, 'y = 25', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) });
      note(620, 120, '세로 길이 = 병합 거리', fade(u, 1.0)); sub(760, 160, '긴 세로줄 = 뚜렷하게 갈린 묶음', fade(u, 1.3), { 'font-size': 15 }); return; }
    if (k === 4) { const h = u < 1.5 ? 25 : lerp(25, 11, E(u, 1.5, 2.1)), G = groupsAt(h), pal = [INFO, ACC, WARN, GOOD, BAD];
      dendro(u, { color: (n) => { const m = MERGES.find((x) => x[3] === n); return m && m[2] > h ? MUT : pal[G.of(n) % 5]; } });
      el('line', { x1: 70, y1: HY(h), x2: 540, y2: HY(h), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '8 5' });
      mono(620, 140, `fcluster(Z, t=${Math.round(h)})`, { 'font-size': 17, 'font-weight': 700 });
      mono(620, 200, `→ ${G.n}개`, { 'font-size': 32, 'font-weight': 800, fill: BAD });
      note(620, 280, '같은 Z 에서 높이만 바꾼다', fade(u, 2.2)); sub(760, 316, '재학습 없음', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 5) { dendro(u, {}); const ax = R.axes(620, 80, 280, 220, { x: [0, 10], y: [0, 100], xl: '데이터 수 n', yl: '계산량' });
      const P1 = [], P2 = []; for (let i = 0; i <= 20; i++) { const n = i / 2; P1.push([n, n * 3]); P2.push([n, n * n]); }
      R.line(ax, P1, E(u, 0.3, 1.3), ACC, { sw: 3 }); R.line(ax, P2, E(u, 0.8, 1.8), BAD, { sw: 3 });
      mono(ax.X(10) + 4, ax.Y(30) + 20, 'K-means O(n·K·iter)', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.3) });
      mono(ax.X(6.6), ax.Y(96), '계층 O(n²)~O(n³)', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.8) });
      sub(760, 400, '탐색은 계층, 운영은 K-means', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 6 || k === 7) { const sz = [0, 1, 2].map((j) => FIN.as.filter((a) => a === j).length), NM = ['저가·저빈도', '고가·저빈도', '중가·고빈도'];
      if (k === 6) { mono(80, 70, 'df.groupby("segment").agg(...)', { 'font-size': 15, 'font-weight': 700, fill: ACC });
        table(80, 120, [['segment', 0], ['구매액', 140], ['방문', 260], ['인원', 360]], [0, 1, 2].map((j) => [[`seg ${j + 1}`, { fill: CC[j], 'font-weight': 700 }], String(Math.round(FIN.cs[j][0])), String(Math.round(FIN.cs[j][1])), String(sz[j])]), { w: 430, rh: 46, op: (i) => fade(u, 0.4 + i * 0.4) });
        sub(300, 300, '구매액·방문 = 그림 좌표(0~100) 의 세그먼트 평균', fade(u, 1.6), { 'font-size': 14.5 });
        [0, 1, 2].forEach((j) => tx(620, 166 + j * 46, NM[j], { 'font-size': 16, 'font-weight': 700, fill: CC[j], opacity: fade(u, 1.9 + j * 0.15) }));
        sub(480, 390, '번호에는 의미가 없다 — 프로파일을 봐야 이름이 붙는다', fade(u, 2.3), { 'font-size': 15 }); return; }
      const ACT = [[1, '고가·저빈도', 'VIP 리텐션 쿠폰'], [2, '중가·고빈도', '객단가 업셀 번들'], [0, '저가·저빈도', '휴면 방지 리마인드']];
      ACT.forEach(([j, a, b], i) => { const y = 110 + i * 100, at = 0.3 + i * 0.6;
        card(220, y, 280, 66, { rx: 12, stroke: CC[j], s: pop(u, at) }); tx(220, y - 4, a, { 'font-size': 17, 'font-weight': 800, fill: CC[j], 'text-anchor': 'middle', opacity: fade(u, at) }); sub(220, y + 20, `${sz[j]}명`, fade(u, at));
        grow(370, y, 520, y, E(u, at + 0.2, at + 0.5), CC[j] === ACC ? ACC : MUT);
        card(700, y, 300, 56, { rx: 28, fill: CBG[j], stroke: CC[j], text: b, fs: 17, color: CC[j], s: pop(u, at + 0.4) }); });
      sub(480, 404, '샘플로 구조 탐색 → 전체 고객엔 K-means → 세그먼트별 캠페인', fade(u, 2.3), { 'font-size': 15 }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '정답 라벨이 없는 고객 데이터에서 "비슷한 고객"을 기계가 찾게 하려면 무엇을 정의해야 하나?',
      o: ['그룹별 정답 라벨', '점과 점 사이의 거리', '정확도·AUC 같은 채점 기준'], a: 1,
      why: '고객을 (구매액, 방문수) 좌표의 점으로 찍으면 "비슷하다"는 "가깝다"가 된다. 거리를 유클리드 거리로 못박아야 기계도 덩어리를 찾을 수 있다.' },
    { q: 'K-means 의 "할당 → 중심 재계산" 반복이 반드시 멈추는 이유는?',
      o: ['두 단계 모두 inertia 를 늘리지 않아서', '반복 상한 300 에서 강제로 끊어서', '전역 최적을 찾을 때까지 돌기 때문에'], a: 0,
      why: '점은 더 가까운 중심으로만 옮기고, 중심은 제곱합을 최소화하는 평균으로 옮긴다. inertia 가 단조 감소하므로 수렴은 보장되지만 전역 최적은 보장되지 않는다.' },
    { q: '엘보우 방법에서 inertia 의 최솟값이 아니라 "꺾이는 지점"을 보는 이유는?',
      o: ['K 가 클수록 inertia 가 커져서', '꺾이는 지점에서 inertia 가 0 이 되어서', 'K 를 늘리면 inertia 는 언제나 줄어들어서'], a: 2,
      why: '최솟값만 찾으면 K 를 최대로 고르게 된다. 26400 → 11800 → 2300 으로 급감하다 K=3 이후 찔끔 주는 꺾임이 후보이고, 실루엣 최고점(0.74)도 K=3 이다.' },
    { q: '도넛처럼 둥글지 않은 모양의 데이터를 K-means 가 엉뚱하게 자를 때 처방은?',
      o: ['K 를 더 늘린다', 'DBSCAN 같은 밀도 기반 알고리즘으로 바꾼다', 'n_init 을 늘려 여러 벌 돌린다'], a: 1,
      why: 'K-means 는 중심 주변의 둥근 덩어리만 찾는 구형 가정을 한다. 모양이 문제면 K 를 아무리 만져도 해결되지 않고, DBSCAN 은 도넛과 중심 덩어리를 정확히 나눈다.' },
    { q: '계층 군집에서 클러스터 수를 3개에서 5개로 바꾸려면 어떻게 하나?',
      o: ['덴드로그램을 자르는 높이만 낮춘다', 'K=5 로 처음부터 다시 학습한다', '연결법을 single 로 바꾼다'], a: 0,
      why: '병합의 전체 역사가 덴드로그램에 남아 있어 같은 Z 에서 t=25 면 3개, t=11 이면 5개가 된다. 재학습이 필요 없다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '라벨이 없으면 고객을 좌표 위 점으로 찍고, 가까운 점끼리 비슷한 고객으로 본다.',
    'K-means는 가까운 중심에 배정하고 중심을 평균으로 옮기기를 반복하다 멈춘다.',
    'K는 엘보우와 실루엣으로 고른다. 계층 군집은 덴드로그램을 자르는 높이로 K를 바꾼다.',
    '스케일링을 빼거나 초기 중심이 나쁘면 에러 없이 틀린 세그먼트가 나온다.',
  ];
  const review = [
    { q: '구매액(수십만 원)과 방문수(한 자릿수)로 K-means를 돌렸더니 군집이 구매액 구간별로만 나뉘었다. 먼저 의심할 것은?',
      o: ['StandardScaler로 스케일을 맞추지 않았다', 'K를 너무 작게 잡았다', '반복이 모자라 수렴하지 않았다'], a: 0,
      why: '단위가 큰 축이 거리를 거의 다 차지하면 방문수는 무시된다. 결과가 한 축 기준 등분처럼 보이면 스케일링부터 확인한다.' },
    { q: '같은 코드를 seed만 바꿔 돌렸더니 세그먼트가 매번 달라진다. 가장 맞는 대응은?',
      o: ['K를 하나 더 늘려 본다', '초기화를 random으로 바꾼다', 'k-means++ 초기화로 여러 번 돌린다'], a: 2,
      why: 'K-means는 수렴은 보장하지만 전역 최적은 보장하지 않아서 초기 중심에 따라 지역 최적에 갇힌다. k-means++로 시작하고 n_init만큼 돌려 inertia가 가장 작은 결과를 쓴다.' },
    { q: '고객 수백만 명을 나눠야 하는데 몇 그룹인지 감이 없다. 세 가지 중 가장 맞는 순서는?',
      o: ['전체 고객에 계층 군집을 바로 돌린다', '표본으로 덴드로그램을 보고 K를 정한 뒤 전체에 K-means를 쓴다', 'K를 늘려 가며 inertia가 가장 작은 K를 쓴다'], a: 1,
      why: '계층 군집은 O(n²) 이상이라 수백만 명에는 무겁다. inertia는 K를 늘리면 늘 줄어서 최솟값으로는 K를 고를 수 없다.' },
  ];

  R.page({ title: '고객 군집화 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
