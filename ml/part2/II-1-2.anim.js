/* II-1-2 결정트리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 무대의 주인공: 소득×나이 산점도(승인 ● · 거절 ✕), 축에 수직인 분할선과 색칠된 영역, 자라나는 트리, 불순도 곡선과 공 무더기 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, dot,
    zone, cross, check, axes, line, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 페이지 코드의 데이터 그대로 (x: 연소득 천만원, y: 나이, 1 승인 / 0 거절) ----------
  const PTS = [[7, 45, 1], [8, 30, 1], [6, 50, 1], [9, 55, 1], [5, 42, 1], [2.5, 58, 1], [2, 25, 0], [4, 52, 0], [1, 35, 0], [3, 30, 0], [2, 48, 0], [6, 23, 0]];
  const NOISE = [[7.5, 47, 0], [2.2, 33, 1]], NEW = [[7.4, 46.5, 1], [2.25, 33.5, 0]];
  const gini = (a, r) => { const n = a + r; if (!n) return 0; const p = a / n; return 1 - p * p - (1 - p) * (1 - p); };
  const ent = (p) => [p, 1 - p].filter((v) => v > 0).reduce((s, v) => s - v * Math.log2(v), 0);
  const giniP = (p) => 1 - p * p - (1 - p) * (1 - p);
  const f3 = (v) => v.toFixed(3), f2 = (v) => v.toFixed(2);

  // ---------- 산점도 ----------
  function plot(o) { o = o || {}; return axes(o.x ?? 74, o.y ?? 40, o.w ?? 380, o.h ?? 300, { x: [0, 10], y: [20, 65], xt: [0, 2, 4, 6, 8, 10], yt: [20, 40, 60], xl: '연소득 (천만원)', yl: '나이' }); }
  function mark(a, x, y, lab, s, o) { o = o || {}; const cx = a.X(x), cy = a.Y(y), r = 7 * (s ?? 1); if (r <= 0.2) return;
    if (lab) el('circle', { cx, cy, r, fill: o.dim ? PANEL : GOOD, stroke: GOOD, 'stroke-width': 2, opacity: o.op ?? 1 });
    else el('path', { d: `M${cx - r},${cy - r} L${cx + r},${cy + r} M${cx + r},${cy - r} L${cx - r},${cy + r}`, stroke: BAD, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: o.op ?? 1 });
    if (o.ring) el('circle', { cx, cy, r: 14, fill: 'none', stroke: o.ringCol || WARN, 'stroke-width': 2, 'stroke-dasharray': '4 3' }); }
  function points(a, u, o) { o = o || {}; PTS.forEach(([x, y, l], i) => mark(a, x, y, l, u == null ? 1 : pop(u, 0.1 + i * 0.08), { op: o.op && o.op(i, x, y, l) })); }
  function noise(a, s, o) { o = o || {}; NOISE.forEach(([x, y, l], i) => mark(a, x, y, l, s, { ring: true, ringCol: o.col || WARN })); }
  function diamond(a, x, y, s, col) { const cx = a.X(x), cy = a.Y(y), r = 9 * s; if (r <= 0.2) return; el('path', { d: `M${cx},${cy - r} L${cx + r},${cy} L${cx},${cy + r} L${cx - r},${cy} Z`, fill: PANEL, stroke: col || INFO, 'stroke-width': 2.6 }); }
  // 분할선: v(세로, 소득) / h(가로, 나이). x0~x1 또는 y0~y1 범위, g 0→1 로 자람
  function vsplit(a, at, g, col, o) { o = o || {}; const y0 = o.y0 ?? 20, y1 = o.y1 ?? 65; if (g <= 0) return; el('line', { x1: a.X(at), y1: a.Y(y0), x2: a.X(at), y2: a.Y(lerp(y0, y1, g)), stroke: col, 'stroke-width': o.sw || 3, 'stroke-dasharray': o.dash }); }
  function hsplit(a, at, g, col, o) { o = o || {}; const x0 = o.x0 ?? 0, x1 = o.x1 ?? 10; if (g <= 0) return; el('line', { x1: a.X(x0), y1: a.Y(at), x2: a.X(lerp(x0, x1, g)), y2: a.Y(at), stroke: col, 'stroke-width': o.sw || 3, 'stroke-dasharray': o.dash }); }
  function region(a, x0, x1, y0, y1, lab, op) { el('rect', { x: a.X(x0), y: a.Y(y1), width: a.X(x1) - a.X(x0), height: a.Y(y0) - a.Y(y1), fill: lab ? GOOD : BAD, opacity: 0.1 * (op ?? 1) }); }
  // 깊이 2 트리 (노이즈 없는 12건)
  const CLEAN = [[0, 4.5, 20, 55, 0], [0, 4.5, 55, 65, 1], [4.5, 10, 20, 26.5, 0], [4.5, 10, 26.5, 65, 1]];
  function cleanTree(a, op, o) { o = o || {}; CLEAN.forEach(([x0, x1, y0, y1, l]) => region(a, x0, x1, y0, y1, l, op));
    vsplit(a, 4.5, 1, ACC, { sw: 2.6 }); hsplit(a, 55, 1, INFO, { x1: 4.5, sw: 2.4 }); hsplit(a, 26.5, 1, INFO, { x0: 4.5, sw: 2.4 }); }
  // 공 무더기 (승인 a 개 · 거절 r 개)
  function bin(cx, cy, a, r, o) { o = o || {}; const n = a + r, cols = o.cols || 4, d = o.d || 18, rows = Math.ceil(n / cols);
    el('path', { d: `M${cx - cols * d / 2 - 8},${cy - rows * d - 8} L${cx - cols * d / 2 - 8},${cy + 6} L${cx + cols * d / 2 + 8},${cy + 6} L${cx + cols * d / 2 + 8},${cy - rows * d - 8}`, fill: 'none', stroke: o.stroke || MUT, 'stroke-width': 2, opacity: o.op ?? 1 });
    for (let i = 0; i < n; i++) { const c = i % cols, rr = Math.floor(i / cols), s = o.s ? o.s(i) : 1; if (s <= 0) continue;
      el('circle', { cx: cx - cols * d / 2 + d / 2 + c * d, cy: cy - d / 2 - rr * d, r: 7 * s, fill: i < a ? GOOD : BAD, opacity: o.op ?? 1 }); }
    if (o.label) tx(cx, cy + 28, o.label, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: o.op ?? 1 }); }
  // 트리 노드
  function node(cx, cy, text, subT, col, s, o) { o = o || {}; const w = o.w || Math.max(tw(text, 14.5), tw(subT || '', 13.5)) + 26, h = subT ? 48 : 34;
    const g = card(cx, cy, w, h, { rx: 8, stroke: col || INK, sw: o.hot ? 3 : 2, fill: o.fill, s });
    if (s > 0.3) { tx(cx, cy + (subT ? -4 : 5), text, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: col || INK, opacity: clamp((s - 0.3) / 0.5) });
      if (subT) tx(cx, cy + 16, subT, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: clamp((s - 0.3) / 0.5) }); }
    return g; }
  const edge = (x1, y1, x2, y2, g, label, col) => { grow(x1, y1, x2, y2, g, col || MUT, { plain: true, sw: 2 }); if (label && g > 0.9) tx((x1 + x2) / 2 + (x2 < x1 ? -8 : 8), (y1 + y2) / 2, label, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, 'text-anchor': x2 < x1 ? 'end' : 'start' }); };

  // =========================================================
  // 1. 스무고개 — 첫 질문 후보
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    const a = plot();
    if (k >= 2) { const gA = k === 2 ? E(u, 0.2, 1.0) : 1; vsplit(a, 4.5, gA, k === 3 ? OFF : ACC, { dash: k >= 3 ? '7 5' : null });
      if (k === 2 || k === 4) { pill(a.X(4.5), a.Y(66.5), '소득 ≥ 4.5 ?', ACC, k === 2 ? pop(u, 0.8) : 1, { fs: 13.5 }); } }
    if (k >= 3) { hsplit(a, 40, k === 3 ? E(u, 0.2, 1.0) : 1, INFO, { dash: k === 4 ? '7 5' : null }); pill(a.X(9.3), a.Y(40) - 16, '나이 ≥ 40 ?', INFO, k === 3 ? pop(u, 0.8) : 1, { fs: 13.5 }); }
    if (k === 1) { const at = lerp(1, 8.6, E(u, 0.3, 2.2)); vsplit(a, at, 1, MUT, { sw: 2.4, dash: '6 5' });
      tx(a.X(at) - 8, a.Y(63), '아니오', { 'font-size': 14, 'text-anchor': 'end', fill: MUT, 'font-weight': 700 }); tx(a.X(at) + 8, a.Y(63), '예', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); }
    points(a, k === 0 ? u : null, { op: k === 1 ? null : null });
    const RX = 700;
    // 오른쪽: 트리
    node(RX, 70, '전체 12명', '승인 6 · 거절 6', INK, k === 0 ? pop(u, 1.4) : 1);
    if (k === 0) { el('circle', { cx: 560, cy: 160, r: 7, fill: GOOD }); tx(574, 165, '승인', { 'font-size': 14.5 }); mark({ X: () => 640, Y: () => 160 }, 0, 0, 0, 1); tx(654, 165, '거절', { 'font-size': 14.5 });
      tx(560, 210, '이 12점이 트리가 볼 세상의 전부', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { pill(RX, 160, 'split(X, y, feature, threshold)', ACC, pop(u, 0.3), { mono: true, fs: 14 });
      tx(RX, 210, '질문 하나 = 축에 수직인 선 하나', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(RX, 238, '→ (아니오 그룹, 예 그룹)', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); return; }
    // 후보 결과 막대: [승인, 거절]
    const rows = [['A  소득 ≥ 4.5', [[5, 1], [1, 5]], ACC, 2], ['B  나이 ≥ 40', [[5, 2], [1, 4]], INFO, 3]];
    rows.forEach(([nm, gs, col, kk], ri) => { if (k < kk) return; const y = 140 + ri * 110, op = k === kk ? fade(u, 1.0) : 1;
      tx(560, y, nm, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op });
      gs.forEach(([ap, rj], j) => { const yy = y + 16 + j * 34; tx(560, yy + 15, j ? '아니오' : '예', { 'font-size': 14, fill: MUT, opacity: op });
        for (let i = 0; i < ap + rj; i++) el('rect', { x: 620 + i * 22, y: yy, width: 18, height: 20, rx: 3, fill: i < ap ? GOOD : BAD, opacity: op * (k === kk ? clamp(u * 3 - 1.5 - i * 0.1) : 1) });
        mono(620 + 7 * 22 + 8, yy + 15, `승${ap}·거${rj}`, { 'font-size': 14, opacity: op }); }); });
    if (k === 4) { banner(RX, 386, '"더 좋다"를 재는 자: 불순도 — 루트 H 1.00 · G 0.50', pop(u, 1.0)); }
  }

  // =========================================================
  // 2. 불순도 — 엔트로피와 지니
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    const ax = axes(560, 60, 330, 220, { x: [0, 1], y: [0, 1], xt: [0, 0.5, 1], yt: [0, 0.5, 1], xl: '승인 비율 p', grid: true });
    const ps = Array.from({ length: 51 }, (_, i) => i / 50);
    const hOn = k >= 0, gOn = k >= 2;
    if (hOn) { line(ax, ps.map((p) => [p, ent(p)]), k === 0 ? E(u, 0.3, 1.6) : 1, ACC, { sw: 3 }); tx(ax.X(0.5), ax.Y(1) - 10, '엔트로피 H', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 1.4) : 1 }); }
    if (gOn) { line(ax, ps.map((p) => [p, giniP(p)]), k === 2 ? E(u, 0.3, 1.6) : 1, WARN, { sw: 3 }); tx(ax.X(0.5), ax.Y(0.5) + 22, '지니 G', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: k === 2 ? fade(u, 1.4) : 1 }); }
    // 왼쪽: 공 무더기
    if (k <= 3) { bin(200, 230, 6, 6, { label: '루트: 승인 6 · 거절 6' });
      if (k === 0) { mono(60, 70, 'H = −Σ p·log₂p', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
        tx(60, 100, '하나 뽑아 라벨을 맞히는 데 필요한 정보량', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) });
        const s = pop(u, 1.8); if (s > 0) { el('circle', { cx: ax.X(0.5), cy: ax.Y(1), r: 7 * s, fill: ACC }); el('circle', { cx: ax.X(1), cy: ax.Y(0), r: 7 * s, fill: ACC }); }
        mono(ax.X(0.5) + 12, ax.Y(1) + 26, '1 bit', { 'font-size': 14, fill: ACC, 'font-weight': 800, opacity: fade(u, 2.0) }); }
      if (k === 1) { mono(60, 70, 'np.bincount(y) / len(y)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
        mono(60, 98, '→ p = [0.5, 0.5]', { 'font-size': 15, fill: ACC, 'font-weight': 800, opacity: fade(u, 0.7) });
        mono(60, 290, '순수 [12, 0] → p = [1.0, 0.0]', { 'font-size': 14.5, opacity: fade(u, 1.2) });
        mono(60, 318, 'p[p > 0] → [1.0]', { 'font-size': 14.5, fill: ACC, 'font-weight': 800, opacity: fade(u, 1.7) });
        tx(60, 352, 'log(0) 을 피하는 한 줄', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); }
      if (k === 2) { mono(60, 70, 'G = 1 − Σ p²', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
        tx(60, 100, '무작위로 둘 뽑았을 때 라벨이 다를 확률', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) });
        // 두 공을 뽑아 비교
        const s1 = seg(u, 0.8, 1.4), s2 = seg(u, 1.2, 1.8);
        if (s1 > 0) el('circle', { cx: lerp(173, 120, s1), cy: lerp(221, 330, s1), r: 8, fill: GOOD });
        if (s2 > 0) el('circle', { cx: lerp(227, 160, s2), cy: lerp(167, 330, s2), r: 8, fill: BAD });
        tx(190, 336, '≠ → 다르다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) }); }
      if (k === 3) { mono(60, 70, 'return 1.0 - (p ** 2).sum()', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
        tx(60, 100, '앞부분은 entropy 와 같고 마지막 줄만 다르다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) });
        tx(60, 316, 'log 가 없어 빠르다 → sklearn 기본값', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) }); }
      return; }
    // k4~7: 세 무더기와 곡선 위 점
    const samples = [[6, 6, 0.5, '반반 6:6'], [9, 3, 0.75, '기울어진 9:3'], [12, 0, 1, '순수 12:0']];
    samples.forEach(([ap, rj, p, nm], i) => { const s = k === 4 ? fade(u, 0.3 + i * 0.4) : 1, hot = k - 5 === i;
      bin(90 + i * 150, 250, ap, rj, { cols: 3, d: 15, op: s, label: nm, stroke: hot ? INK : MUT });
      if (k >= 5 + i) { const g = k === 5 + i ? pop(u, 0.3) : 1; if (g > 0) { el('circle', { cx: ax.X(p), cy: ax.Y(ent(p)), r: 7 * g, fill: ACC }); el('circle', { cx: ax.X(p), cy: ax.Y(giniP(p)), r: 7 * g, fill: WARN }); } } });
    if (k >= 5) { const [ap, rj, p, nm] = samples[k - 5];
      el('line', { x1: ax.X(p), y1: ax.Y(0), x2: ax.X(p), y2: ax.Y(1), stroke: INK, 'stroke-width': 1.4, 'stroke-dasharray': '4 4', opacity: fade(u, 0.3) });
      mono(560, 356, `${nm}:  H ${f3(ent(p))}   G ${f3(giniP(p))}`, { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.6) });
      const note = ['두 지표 모두 최대 — 가장 나쁜 상태', '기울수록 함께 작아진다', '둘 다 0 — 분할의 목표'][k - 5];
      tx(560, 386, note, { 'font-size': 15, fill: k === 7 ? GOOD : MUT, 'font-weight': 700, opacity: fade(u, 1.1) }); }
    else tx(60, 70, '같은 12개, 섞인 정도만 다르다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
  }

  // =========================================================
  // 3. 정보 이득 — greedy 분할
  // =========================================================
  // 소득 후보 임계값(관측값 사이 중간점)마다 지니 이득 — 페이지 데이터로 계산
  const incs = [...new Set(PTS.map((p) => p[0]))].sort((x, y) => x - y), mids = incs.slice(1).map((v, i) => (v + incs[i]) / 2);
  const gainAt = (t) => { const L = PTS.filter((p) => p[0] <= t), Rr = PTS.filter((p) => p[0] > t), cnt = (s) => [s.filter((p) => p[2]).length, s.filter((p) => !p[2]).length];
    const [la, lr] = cnt(L), [ra, rr] = cnt(Rr); return 0.5 - (L.length * gini(la, lr) + Rr.length * gini(ra, rr)) / 12; };
  function s3(t, c) { const { k, u } = c;
    const a = plot();
    if (k <= 3) { vsplit(a, 4.5, 1, OFF, { dash: '6 5', sw: 2 }); hsplit(a, 40, 1, OFF, { dash: '6 5', sw: 2 }); }
    if (k === 3) { // 전수 조사: 선이 중간점을 훑는다 + 이득 막대
      const n = mids.length, idx = Math.min(n - 1, Math.floor(E(u, 0.2, 2.2) * n)); const tcur = mids[idx];
      vsplit(a, tcur, 1, ACC, { sw: 2.6 });
      const BX = (v) => 570 + v * 34, BY0 = 390;
      el('line', { x1: BX(0), y1: BY0, x2: BX(10), y2: BY0, stroke: MUT, 'stroke-width': 1.6 });
      [0, 5, 10].forEach((v) => mono(BX(v), BY0 + 18, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      mids.forEach((m, i) => { if (i > idx) return; const g = gainAt(m), h = g * 420;
        el('rect', { x: BX(m) - 7, y: BY0 - h, width: 14, height: Math.max(1, h), rx: 2, fill: Math.abs(m - 4.5) < 1e-9 ? ACC : OFF }); });
      tx(570, BY0 - 0.222 * 420 - 14, '소득 후보 임계값별 이득', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); }
    if (k >= 4) { vsplit(a, 4.5, k === 4 ? E(u, 0.2, 0.9) : 1, ACC); }
    if (k >= 5) { hsplit(a, 55, k === 5 ? E(u, 0.4, 1.2) : 1, INFO, { x1: 4.5 }); hsplit(a, 26.5, k === 5 ? E(u, 1.0, 1.8) : 1, INFO, { x0: 4.5 }); }
    if (k >= 6) CLEAN.forEach(([x0, x1, y0, y1, l]) => region(a, x0, x1, y0, y1, l, k === 6 ? fade(u, 0.2) : 1));
    points(a, null);
    if (k === 7) { el('line', { x1: a.X(1), y1: a.Y(62), x2: a.X(9.5), y2: a.Y(22), stroke: MUT, 'stroke-width': 2.4, 'stroke-dasharray': '8 6', opacity: fade(u, 0.3) });
      cross(a.X(5.25), a.Y(42), 12, pop(u, 0.9)); }
    const RX = 700;
    if (k <= 2) { // 정보 이득 정의 + 가중 평균
      bin(RX, 140, 6, 6, { cols: 4, d: 16, label: '부모 G 0.50' });
      const g = k === 0 ? E(u, 0.6, 1.4) : 1;
      grow(RX - 30, 175, RX - 110, 215, g, MUT); grow(RX + 30, 175, RX + 110, 215, g, MUT);
      if (g > 0.9) { bin(RX - 120, 300, 1, 5, { cols: 3, d: 16, label: '아니오 6명' }); bin(RX + 120, 300, 5, 1, { cols: 3, d: 16, label: '예 6명' }); }
      if (k === 0) mono(RX, 380, 'IG = 부모 − 자식 가중 평균', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.6) });
      if (k === 1) { mono(RX, 380, '6/12·0.278 + 6/12·0.278 = 0.278', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 0.4) });
        mono(RX, 406, '0.500 − 0.278 = 0.222', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) }); }
      if (k === 2) { card(RX, 390, 300, 36, { rx: 8, text: 'best = (None, None, -1.0)', mono: true, fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 0.4) }); }
      return; }
    if (k === 3) { mono(560, 80, 'for f in 특징 2개:', { 'font-size': 15, opacity: fade(u, 0.1) }); mono(580, 106, 'for t in 중간점들:', { 'font-size': 15, opacity: fade(u, 0.3) });
      mono(600, 132, 'if gain > best: 갱신', { 'font-size': 15, opacity: fade(u, 0.5) });
      tx(560, 190, '후보 = 인접 관측값의 중간점 → 유한', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      tx(560, 220, '최댓값: 소득 4.5 에서 0.222', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.3) }); return; }
    if (k === 4) { [['A  소득 ≥ 4.5', 0.222, ACC], ['B  나이 ≥ 40', 0.129, INFO]].forEach(([n, v, col], i) => { const y = 120 + i * 70;
        tx(560, y, n, { 'font-size': 15, 'font-weight': 800, fill: col }); hbar(560, y + 14, 260, v * E(u, 0.3 + i * 0.3, 1.2 + i * 0.3), 0.25, { col, text: f3(v), h: 20 }); });
      pill(700, 300, '루트 질문 = 소득 ≥ 4.5', ACC, pop(u, 1.6), { fs: 15 }); return; }
    // k5~7: 트리
    const show = (kk, a0) => (k > kk ? 1 : k === kk ? pop(u, a0) : 0);
    node(RX, 60, '소득 ≥ 4.5?', 'G 0.50 → 이득 0.222', ACC, 1);
    edge(RX - 30, 84, RX - 120, 130, k === 5 ? E(u, 0.3, 0.6) : 1, '아니오'); edge(RX + 30, 84, RX + 120, 130, k === 5 ? E(u, 0.9, 1.2) : 1, '예');
    node(RX - 125, 156, '나이 ≥ 55?', '승1·거5 G 0.278', INFO, show(5, 0.5));
    node(RX + 125, 156, '나이 ≥ 26.5?', '승5·거1 G 0.278', INFO, show(5, 1.1));
    if (k >= 6) { [[-185, '거절', 5, BAD], [-75, '승인', 1, GOOD], [75, '거절', 1, BAD], [185, '승인', 5, GOOD]].forEach(([dx, nm, n, col], i) => {
        const px = RX + (dx < 0 ? -125 : 125); edge(px + (dx < 0 ? (dx + 125) * 0.3 : (dx - 125) * 0.3), 180, RX + dx, 236, k === 6 ? E(u, 0.2 + i * 0.15, 0.5 + i * 0.15) : 1, null);
        node(RX + dx, 260, nm, n + '명 · G 0', col, show(6, 0.5 + i * 0.15), { w: 96 }); }); }
    if (k === 6) banner(RX, 340, '깊이 2 에서 네 잎 모두 순수 → train 100%', pop(u, 1.6));
    if (k === 7) { tx(RX, 330, '질문은 늘 "한 축 ≤ 값"', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      tx(RX, 358, '→ 경계는 계단, 대각선은 직접 못 긋는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.1) }); }
  }

  // =========================================================
  // 4. 과적합 — 깊이 무제한 vs 가지치기
  // =========================================================
  // 깊이 무제한 트리(노이즈 14건)의 잎 영역 — sklearn export_text(deep) 결과 그대로
  const DEEP = [[0, 2.1, 20, 65, 0], [2.1, 10, 20, 26.5, 0], [2.1, 2.75, 26.5, 65, 1], [2.75, 4.5, 26.5, 65, 0], [4.5, 10, 26.5, 46, 1], [4.5, 10, 46, 48.5, 0], [4.5, 10, 48.5, 65, 1]];
  const STUMP = [[0, 4.5, 20, 65, 0], [4.5, 10, 20, 65, 1]];
  function s4(t, c) { const { k, u } = c;
    const a = plot();
    let regs = CLEAN, op = 1;
    if (k >= 2 && k <= 3) regs = DEEP; if (k >= 5) regs = STUMP;
    if (k === 2) op = fade(u, 0.3, 1.0);
    if (k === 5) op = fade(u, 0.3, 1.0);
    if (k === 4) op = 0.5;
    regs.forEach(([x0, x1, y0, y1, l]) => region(a, x0, x1, y0, y1, l, op));
    if (regs === CLEAN) { vsplit(a, 4.5, 1, OFF, { sw: 2 }); hsplit(a, 55, 1, OFF, { x1: 4.5, sw: 2 }); hsplit(a, 26.5, 1, OFF, { x0: 4.5, sw: 2 }); }
    if (regs === DEEP) { const g = k === 2 ? E(u, 0.2, 1.4) : 1; vsplit(a, 2.1, g, ACC, { sw: 2 }); hsplit(a, 26.5, g, ACC, { x0: 2.1, sw: 2 });
      [4.5, 2.75].forEach((x, i) => vsplit(a, x, k === 2 ? E(u, 0.5 + i * 0.2, 1.4 + i * 0.2) : 1, ACC, { y0: 26.5, sw: 2 }));
      [46, 48.5].forEach((y, i) => hsplit(a, y, k === 2 ? E(u, 0.9 + i * 0.2, 1.8 + i * 0.2) : 1, ACC, { x0: 4.5, sw: 2 }));
      if (k === 3) [[2.1, 2.75, 26.5, 65], [4.5, 10, 46, 48.5]].forEach(([x0, x1, y0, y1]) => el('rect', { x: a.X(x0) - 2, y: a.Y(y1) - 2, width: a.X(x1) - a.X(x0) + 4, height: a.Y(y0) - a.Y(y1) + 4, fill: 'none', stroke: BAD, 'stroke-width': 2.6, 'stroke-dasharray': '6 4', opacity: fade(u, 0.3) })); }
    if (regs === STUMP) vsplit(a, 4.5, k === 5 ? E(u, 0.2, 1.0) : 1, ACC);
    points(a, null);
    noise(a, k === 0 ? pop(u, 0.4) : 1, { col: WARN });
    if (k >= 1) NEW.forEach(([x, y], i) => diamond(a, x, y, k === 1 ? pop(u, 0.5 + i * 0.4) : 1, INFO));
    const RX = 560;
    if (k === 0) { tx(RX, 90, '노이즈 2건이 섞인다', { 'font-size': 17, 'font-weight': 800 });
      tx(RX, 124, '✕ (7.5, 47) — 입력 실수로 거절', { 'font-size': 15, opacity: fade(u, 0.6) }); tx(RX, 152, '● (2.2, 33) — 보증인 덕에 예외 승인', { 'font-size': 15, opacity: fade(u, 1.0) });
      tx(RX, 200, '둘 다 기존 경계의 반대편에 있다', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(RX, 250, '학습 데이터 12 → 14건', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { tx(RX, 90, '채점은 학습에 없던 데이터로', { 'font-size': 17, 'font-weight': 800 });
      diamond({ X: () => RX + 10, Y: () => 130 }, 0, 0, 1, INFO); tx(RX + 28, 136, '새 신청자 2명 (노이즈 바로 옆)', { 'font-size': 15, opacity: fade(u, 0.6) });
      mono(RX, 180, '(7.4, 46.5) → 원래 패턴: 승인', { 'font-size': 14.5, opacity: fade(u, 1.0) }); mono(RX, 208, '(2.25, 33.5) → 원래 패턴: 거절', { 'font-size': 14.5, opacity: fade(u, 1.3) });
      tx(RX, 260, 'train 점수만 보면 어떤 모델이든 좋아 보인다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) }); return; }
    // 점수판
    function board(y, nm, train, newOk, col, s) { tx(RX, y, nm, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s });
      tx(RX, y + 30, 'train', { 'font-size': 14, fill: MUT, opacity: s }); hbar(RX + 60, y + 16, 200, train * s, 100, { col, text: Math.round(train) + '%', h: 18 });
      tx(RX, y + 62, '새 신청자', { 'font-size': 14, fill: MUT, opacity: s });
      [0, 1].forEach((i) => { const ok = i < newOk, x = RX + 90 + i * 34, yy = y + 56; if (s <= 0) return; if (ok) check(x, yy, 10, s); else cross(x, yy, 9, s); });
      mono(RX + 170, y + 62, newOk + ' / 2', { 'font-size': 15, 'font-weight': 800, fill: newOk ? GOOD : BAD, opacity: s }); }
    if (k === 2 || k === 3) { board(90, '깊이 무제한 · 깊이 5 · 잎 7개', 100, 0, BAD, k === 2 ? fade(u, 1.4) : 1);
      if (k === 3) { tx(RX, 230, '노이즈 한 점만 담는 좁은 띠', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4) });
        tx(RX, 258, '샘플 1개짜리 잎 = 그 사람 전용 규칙', { 'font-size': 15, opacity: fade(u, 0.9) });
        tx(RX, 286, '새 신청자는 노이즈의 라벨을 물려받는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); }
      return; }
    if (k === 4) { [['max_depth', '2', '질문은 최대 2번'], ['min_samples_leaf', '4', '잎 하나에 최소 4명']].forEach(([n, v, d], i) => { const y = 100 + i * 100, s = pop(u, 0.3 + i * 0.5);
        card(RX + 170, y, 340, 70, { rx: 10, stroke: ACC, sw: 2, s }); mono(RX + 16, y - 6, n + ' = ' + v, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4 + i * 0.5) });
        tx(RX + 16, y + 20, d, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.5) }); });
      tx(RX, 300, '1~2명짜리 예외 잎이 원천 봉쇄된다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 5) { board(90, '가지치기 후 · 소득 4.5 질문 하나', 71, 2, GOOD, fade(u, 1.0));
      tx(RX, 230, 'train 은 0.71 로 내려갔다', { 'font-size': 15, opacity: fade(u, 1.6) }); tx(RX, 258, '노이즈 2건은 일부러 틀린다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 6) { board(70, '깊이 무제한', 100, 0, BAD, 1); board(190, '가지치기', 71, 2, GOOD, fade(u, 0.3));
      banner(RX + 170, 330, '완벽한 train 점수는 경고 신호', pop(u, 1.4)); return; }
    // k7 실무 시작값
    tx(RX, 80, '실무 시작값', { 'font-size': 17, 'font-weight': 800 });
    const bx = RX + 20, bw = 320;
    [['max_depth', 1, 12, 3, 8, ['1', '3', '8', '12']], ['min_samples_leaf (%)', 0, 10, 1, 5, ['0', '1', '5', '10']]].forEach(([n, lo, hi, a0, a1, ticks], i) => { const y = 140 + i * 110, X = (v) => bx + (v - lo) / (hi - lo) * bw, g = E(u, 0.4 + i * 0.5, 1.2 + i * 0.5);
      tx(RX, y - 16, n, { 'font-size': 15, 'font-weight': 700 });
      el('line', { x1: X(lo), y1: y, x2: X(hi), y2: y, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
      el('line', { x1: X(a0), y1: y, x2: X(lerp(a0, a1, g)), y2: y, stroke: ACC, 'stroke-width': 8, 'stroke-linecap': 'round' });
      ticks.forEach((s) => mono(X(+s), y + 26, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' })); });
    tx(RX, 360, '여기서 시작해 교차 검증으로 좁힌다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
  }

  // =========================================================
  // 5. 해석 가능성과 한계
  // =========================================================
  const RULES = [['①', '소득 < 4.5 · 나이 > 55', '승인', GOOD, 1.5, 61], ['②', '소득 < 4.5 · 나이 ≤ 55', '거절', BAD, 2.2, 38], ['③', '소득 > 4.5 · 나이 > 26.5', '승인', GOOD, 7.3, 50], ['④', '소득 > 4.5 · 나이 ≤ 26.5', '거절', BAD, 8.5, 23]];
  function bigTree(RX, o) { o = o || {}; const hot = o.hot || [];
    node(RX, 60, '소득 ≥ 4.5?', o.sub0 || 'G 0.50', ACC, o.s ?? 1, { hot: hot.includes('root') });
    edge(RX - 30, 84, RX - 120, 128, o.g ?? 1, '아니오', hot.includes('l') ? BAD : MUT); edge(RX + 30, 84, RX + 120, 128, o.g ?? 1, '예');
    node(RX - 125, 152, '나이 ≥ 55?', o.subL || 'G 0.278', INFO, o.s ?? 1, { hot: hot.includes('l') });
    node(RX + 125, 152, '나이 ≥ 26.5?', o.subR || 'G 0.278', INFO, o.s ?? 1);
    [[-185, '거절', '②', BAD, 'l2'], [-70, '승인', '①', GOOD, 'l1'], [70, '거절', '④', BAD, 'r2'], [185, '승인', '③', GOOD, 'r1']].forEach(([dx, nm, rn, col, id]) => {
      const px = RX + (dx < 0 ? -125 : 125); edge(px + (dx < 0 ? (dx + 125) * 0.3 : (dx - 125) * 0.3), 176, RX + dx, 230, o.g ?? 1, null, hot.includes(id) ? BAD : MUT);
      node(RX + dx, 252, nm, o.rules ? '규칙 ' + rn : null, col, o.s ?? 1, { w: 92, hot: hot.includes(id) }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const a = plot(); cleanTree(a, 1); points(a, null);
      ['plot_tree', 'export_text'].forEach((s, i) => pill(700, 110 + i * 56, s, ACC, pop(u, 0.3 + i * 0.4), { mono: true, fs: 15 }));
      mono(560, 250, 'FEATURES = ["income", "age"]', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
      tx(560, 290, '트리를 사람 말로 옮길 준비', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { el('rect', { x: 210, y: 20, width: 540, height: 290, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.1) });
      bigTree(480, { s: E(u, 0.2, 1.2), g: E(u, 0.6, 1.6) });
      pill(480, 350, 'plt.savefig("loan_tree.png")', ACC, pop(u, 1.8), { mono: true, fs: 14 });
      tx(480, 394, '그림 그대로 회의 자료가 된다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 2 || k === 3) { const a = plot(); cleanTree(a, 1); points(a, null, { op: k === 3 ? (i) => (i === 10 ? 1 : 0.35) : null });
      RULES.forEach(([n, , , col, x, y], i) => mono(a.X(x), a.Y(y) + 6, n, { 'font-size': 18, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 0.3 + i * 0.3) : 1 }));
      if (k === 2) RULES.forEach(([n, cond, out, col], i) => { const y = 90 + i * 52, op = fade(u, 0.4 + i * 0.3);
        mono(500, y, n, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: op }); tx(530, y, cond, { 'font-size': 15, opacity: op });
        tx(800, y, '→ ' + out, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op }); });
      if (k === 2) tx(500, 320, '잎 하나 = 규칙 하나 — 심사 기준서가 공짜', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      if (k === 3) { el('circle', { cx: a.X(2), cy: a.Y(48), r: 15, fill: 'none', stroke: INK, 'stroke-width': 2.5 });
        card(700, 110, 360, 56, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.3), text: '"왜 거절됐나요?"  (소득 2, 나이 48)', fs: 15 });
        grow(700, 140, 700, 186, E(u, 0.8, 1.2), MUT);
        card(700, 222, 400, 64, { rx: 10, stroke: BAD, sw: 2.5, s: pop(u, 1.3), text: '규칙 ② — 소득 4.5천만 미만이고\n55세 이하 구간입니다', fs: 15 });
        tx(700, 300, '확률 벡터가 아니라 문장으로 답한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); }
      return; }
    if (k === 4) { bigTree(250, { sub0: '중요도 0.44', subL: '중요도 0.28', subR: '중요도 0.28', rules: true });
      [['income', 0.44, ACC], ['age', 0.56, INFO]].forEach(([n, v, col], i) => { const y = 120 + i * 80;
        mono(560, y, n, { 'font-size': 16, 'font-weight': 800, fill: col }); hbar(660, y - 15, 200, v * E(u, 0.3 + i * 0.4, 1.3 + i * 0.4), 1, { col, text: f2(v), h: 22 }); });
      mono(560, 290, 'age = 0.28 + 0.28', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      tx(560, 320, '두 노드에서 쓰인 몫이 합산된다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) });
      tx(560, 350, '중요도 ≠ 인과관계', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { // 2건만 더해도 루트가 바뀐다
      const a1 = plot({ x: 60, w: 330, h: 280 });
      CLEAN.forEach(([x0, x1, y0, y1, l]) => region(a1, x0, x1, y0, y1, l, 1 - E(u, 1.0, 1.8)));
      vsplit(a1, 4.5, 1 - E(u, 1.0, 1.8), ACC);
      vsplit(a1, 2.1, E(u, 1.2, 2.0), BAD, { sw: 3.4 });
      points(a1, null); noise(a1, pop(u, 0.4), { col: WARN });
      pill(a1.X(4.5), a1.Y(67), '루트: 소득 4.5', ACC, 1 - E(u, 1.0, 1.4), { fs: 13.5 });
      if (u > 1.4) pill(a1.X(2.1) + 50, a1.Y(67), '루트: 소득 2.1', BAD, pop(u, 1.4), { fs: 13.5 });
      tx(560, 100, '데이터 2건만 더했는데', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.5) });
      tx(560, 130, '루트 질문이 소득 4.5 → 2.1 로 바뀐다', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(560, 180, 'greedy 라 아래 질문까지 연쇄로 바뀐다', { 'font-size': 15, opacity: fade(u, 2.0) });
      tx(560, 230, '해석력 ↔ 안정성', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.3) }); return; }
    // k6 여러 그루의 투표
    const votes = [1, 1, 0, 1, 1, 0, 1];
    votes.forEach((v, i) => { const cx = 120 + i * 120, cy = 150, s = pop(u, 0.2 + i * 0.12);
      if (s <= 0) return;
      el('path', { d: `M${cx},${cy - 50 * s} L${cx - 40 * s},${cy + 20 * s} L${cx + 40 * s},${cy + 20 * s} Z`, fill: v ? C.GOODBG : C.BADBG, stroke: v ? GOOD : BAD, 'stroke-width': 2 });
      el('rect', { x: cx - 5, y: cy + 20 * s, width: 10, height: 22 * s, fill: OFF });
      if (u > 1.2) { const y = lerp(cy + 50, 300, E(u, 1.2 + i * 0.06, 1.8 + i * 0.06)); el('circle', { cx: lerp(cx, 480 + (v ? -40 : 40), E(u, 1.2 + i * 0.06, 1.8 + i * 0.06)), cy: y, r: 7, fill: v ? GOOD : BAD }); } });
    tx(480, 350, '그루마다 판정 → 다수결로 최종 답', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) });
    tx(480, 384, '한 그루의 예민함을 여러 그루의 투표로 — 다음 장: RandomForest · Boosting', { 'text-anchor': 'middle', 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.3) });
  }

  R.page({ title: '결정트리 시뮬레이션 — 소득 × 나이', scenes: [s1, s2, s3, s4, s5] });
})();
