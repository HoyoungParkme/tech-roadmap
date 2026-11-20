/* I-2-2 평가지표 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 무대의 주인공: 테스트 1,000명 격자(실제 암 10명), 혼동행렬 4칸, 확률 띠와 임계값 선, ROC 곡선, 회귀 오차 막대 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    zone, cross, check, axes, scatter, line, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 테스트 1,000명: 각자 "암일 확률"을 가진다 (임계값 0.7/0.5/0.3 에서 페이지의 혼동행렬과 같아지도록) ----------
  const N = 1000, COLS = 50, PITCH = 8, CELL = 6.5;
  const CANCER_IDX = [37, 121, 188, 263, 334, 419, 506, 611, 744, 873];
  const CANCER_P = [0.95, 0.9, 0.85, 0.8, 0.75, 0.72, 0.6, 0.55, 0.4, 0.2];   // ≥0.7: 6명 · ≥0.5: 8명 · ≥0.3: 9명
  const PROBA = new Array(N).fill(0), IS_C = new Array(N).fill(false);
  CANCER_IDX.forEach((ix, j) => { IS_C[ix] = true; PROBA[ix] = CANCER_P[j]; });
  const RISKY = [];                                                              // 확률이 높은 정상인 79명 (순위 순)
  for (let i = 0, k = 0; RISKY.length < 79; i++) { const ix = (i * 397 + 13) % N; if (!IS_C[ix] && !RISKY.includes(ix)) RISKY.push(ix); k++; }
  RISKY.forEach((ix, r) => { PROBA[ix] = r < 8 ? 0.93 - r * 0.03 : r < 30 ? 0.689 - (r - 8) * 0.009 : 0.492 - (r - 30) * 0.004; });
  for (let i = 0; i < N; i++) if (!IS_C[i] && !RISKY.includes(i)) PROBA[i] = 0.02 + ((i * 7919) % 97) / 97 * 0.26;
  // 칸 하나의 결과: th 가 null 이면 실제값만, 'dummy' 면 전부 0 예측
  function outcome(i, th) { if (th == null) return IS_C[i] ? 'A' : 'N';
    const pos = th === 'dummy' ? false : PROBA[i] >= th - 1e-9; return IS_C[i] ? (pos ? 'TP' : 'FN') : (pos ? 'FP' : 'TN'); }
  const COL = { TP: GOOD, FN: BAD, FP: WARN, TN: C.INFOBG, A: INK, N: SOFT };
  // 격자: from → to 결과로 왼쪽 열부터 바뀐다 (w 0→1)
  function waffle(x, y, from, to, w, o) { o = o || {}; const show = o.show ?? 1;
    for (let i = 0; i < N; i++) { const c = i % COLS, r = Math.floor(i / COLS); if ((c + r * 0.3) / (COLS + 6) > show) continue;
      const oc = (c / COLS) < w ? outcome(i, to) : outcome(i, from), f = COL[oc], hot = o.hi && o.hi(oc, i);
      el('rect', { x: x + c * PITCH, y: y + r * PITCH, width: CELL, height: CELL, rx: 1.2, fill: f, stroke: oc === 'TN' ? INFO : oc === 'N' ? GRID : 'none', 'stroke-width': 0.6, opacity: o.dim && !hot ? 0.35 : 1 });
      if (hot) el('rect', { x: x + c * PITCH - 2.5, y: y + r * PITCH - 2.5, width: CELL + 5, height: CELL + 5, rx: 2.5, fill: 'none', stroke: INK, 'stroke-width': 1.6 }); } }
  const cellXY = (x, y, i) => [x + (i % COLS) * PITCH + CELL / 2, y + Math.floor(i / COLS) * PITCH + CELL / 2];

  // ---------- 혼동행렬: 행 = 실제(암/정상), 열 = 예측(암/정상) ----------
  const CM = { tp: ['TP', GOOD, C.GOODBG, '암 → 암'], fn: ['FN', BAD, C.BADBG, '암 → 정상'], fp: ['FP', WARN, C.WARNBG, '정상 → 암'], tn: ['TN', INFO, C.INFOBG, '정상 → 정상'] };
  function cm(x, y, m, o) { o = o || {}; const w = o.w || 118, h = o.h || 68, op = o.op ?? 1;
    tx(x + w / 2, y - 10, '예측: 암', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op });
    tx(x + w * 1.5 + 6, y - 10, '예측: 정상', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op });
    tx(x - 10, y + h / 2 + 5, '실제 암', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op });
    tx(x - 10, y + h * 1.5 + 11, '실제 정상', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op });
    [['tp', 0, 0], ['fn', 1, 0], ['fp', 0, 1], ['tn', 1, 1]].forEach(([key, c, r]) => {
      const [nm, col, bg, d] = CM[key], cx = x + c * (w + 6), cy = y + r * (h + 6), v = m[key], hot = o.hi && o.hi.includes(key), dim = o.dim && o.dim.includes(key);
      el('rect', { x: cx, y: cy, width: w, height: h, rx: 8, fill: m.empty ? PANEL : bg, stroke: hot ? INK : col, 'stroke-width': hot ? 3.2 : 1.8, opacity: (dim ? 0.35 : 1) * op });
      tx(cx + 10, cy + 21, nm, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: (dim ? 0.4 : 1) * op });
      if (!o.noDesc) tx(cx + w - 8, cy + 21, d, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, opacity: (dim ? 0.4 : 1) * op });
      mono(cx + w / 2, cy + h - 14, m.empty ? '?' : String(Math.round(v)), { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: m.empty ? OFF : INK, opacity: (dim ? 0.4 : 1) * op }); });
    return { cell: (key) => { const c = key === 'tp' || key === 'fp' ? 0 : 1, r = key === 'tp' || key === 'fn' ? 0 : 1; return [x + c * (w + 6) + w / 2, y + r * (h + 6) + h / 2]; } }; }
  const mtw = (c) => { const a = (c.prev && c.prev.matrix) || c.beat.matrix, b = c.beat.matrix, f = (k) => tween(a[k], b[k], c.u); return { tp: f('tp'), fn: f('fn'), fp: f('fp'), tn: f('tn') }; };
  // 지표 막대 한 줄 (값 %; null 이면 '계산 불가')
  function metric(x, y, name, v, o) { o = o || {}; tx(x, y + 13, name, { 'font-size': 15, 'font-weight': 700, opacity: o.op ?? 1 });
    if (v == null) { mono(x + 90, y + 13, o.none || '—', { 'font-size': 14.5, fill: o.noneCol || MUT, 'font-weight': 700, opacity: o.op ?? 1 }); return; }
    if ((o.op ?? 1) > 0) hbar(x + 90, y, o.w || 210, v, 100, { col: o.col || ACC, text: v.toFixed(1) + '%', h: 17 }); }
  const mv = (c, k) => { const a = c.prev && c.prev.metrics ? c.prev.metrics[k] : null, b = c.beat.metrics[k]; return b == null ? null : a == null ? b * E(c.u, 0.3, 1.5) : tween(a, b, c.u); };

  // 공통 배치: 격자(왼쪽 위) · 혼동행렬(오른쪽 위) · 지표(오른쪽 아래)
  const WX = 40, WY = 66, MX = 640, MY = 64;
  function legend(y, op) { [['TP', GOOD], ['FN', BAD], ['FP', WARN], ['TN', C.INFOBG]].forEach(([s, f], i) => {
      el('rect', { x: WX + i * 92, y: y - 11, width: 13, height: 13, rx: 2, fill: f, stroke: s === 'TN' ? INFO : 'none', opacity: op });
      tx(WX + i * 92 + 20, y, s, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op }); }); }

  // =========================================================
  // 1. 정확도의 함정
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    tx(WX, WY - 14, k === 0 ? '테스트 데이터' : '테스트 1,000명 (실제 암 = 검은 칸)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    if (k === 0) { el('rect', { x: WX, y: WY, width: COLS * PITCH, height: 20 * PITCH, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
      tx(WX + 200, WY + 86, '아직 데이터도 예측도 없다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT });
      ['accuracy_score', 'confusion_matrix', 'roc_curve · auc'].forEach((s, i) => pill(WX + 90 + i * 150, 300, s, ACC, pop(u, 0.3 + i * 0.4), { mono: true, fs: 13.5 }));
      sub(WX + 240, 344, 'from sklearn.metrics import …', fade(u, 1.6), { class: 'mono', 'font-size': 14 });
      cm(MX, MY, { empty: true }, { op: fade(u, 1.8) }); return; }
    // 격자
    const dummyW = k === 2 ? E(u, 0.6, 2.0) : k > 2 ? 1 : 0;
    waffle(WX, WY, null, 'dummy', dummyW, { show: k === 1 ? E(u, 0.9, 2.2) : 1, hi: k === 4 ? (oc) => oc === 'FN' : null, dim: k === 4 && u > 0.6 });
    if (k >= 2) legend(WY + 186, k === 2 ? fade(u, 2.0) : 1);
    if (k === 1) { // 2,000명 → 학습 1,000 / 테스트 1,000
      const s = E(u, 0.2, 0.9), y = 270;
      el('rect', { x: WX + lerp(0, 0, s), y, width: lerp(400, 194, s), height: 30, rx: 6, fill: SOFT, stroke: MUT, 'stroke-width': 1.5 });
      el('rect', { x: WX + lerp(0, 206, s), y, width: lerp(400, 194, s), height: 30, rx: 6, fill: SOFT, stroke: s > 0.5 ? ACC : MUT, 'stroke-width': s > 0.5 ? 2.2 : 1.5, opacity: s > 0.02 ? 1 : 0 });
      for (let i = 0; i < 20; i++) { const half = i % 2, j = Math.floor(i / 2), x = WX + (half ? lerp(0, 206, s) : 0) + 14 + j * lerp(39, 18, s); el('rect', { x, y: y + 9, width: 9, height: 12, rx: 2, fill: INK }); }
      if (s < 0.5) tx(WX + 200, y + 52, '검진 2,000명 · 암 20명 (1%)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
      else { tx(WX + 97, y + 52, '학습 1,000 (암 10)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) });
        tx(WX + 303, y + 52, '테스트 1,000 (암 10)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) }); }
      pill(WX + 200, 362, 'stratify=y → 양쪽 모두 암 1%', ACC, pop(u, 1.4), { mono: true, fs: 13.5 }); }
    if (k === 2) { const x = lerp(WX - 10, WX + COLS * PITCH, E(u, 0.6, 2.0));
      card(WX + 200, 300, 330, 46, { rx: 10, stroke: INK, sw: 2, text: 'DummyClassifier(most_frequent)', fs: 14.5, mono: true, s: pop(u, 0.2) });
      if (u > 0.6 && u < 2.1) el('line', { x1: x, y1: WY - 4, x2: x, y2: WY + 164, stroke: INK, 'stroke-width': 2.5 });
      sub(WX + 200, 350, '모든 사람에게 "0 (정상)"', fade(u, 0.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    // 혼동행렬
    const m = k >= 2 ? mtw(c) : { empty: true };
    const hi = k === 3 ? ['tn'] : k === 4 ? ['fn'] : k === 5 ? ['tn', 'fn'] : [];
    const M = cm(MX, MY, m, { hi, dim: k === 5 ? ['tp', 'fp'] : null });
    // 지표
    if (k >= 3) { metric(MX - 90, 262, '정확도', mv(c, 'acc'), { col: k >= 4 ? OFF : ACC });
      if (k === 3) { mono(MX + 130, 312, '(TP+TN) / 전체', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) });
        mono(MX + 130, 338, '= 990 / 1000', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); } }
    if (k >= 4) { metric(MX - 90, 296, '재현율', 0, { col: BAD }); mono(MX + 268, 309, '0 / 10', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: k === 4 ? fade(u, 0.6) : 1 });
      metric(MX - 90, 330, '정밀도', null, { none: '0 / 0 → 계산 불가', noneCol: BAD, op: k === 4 ? fade(u, 1.4) : 1 }); }
    if (k === 4) { const [cx] = M.cell('fn'); sub(cx, MY + 166, '암 10명 전원 놓침', fade(u, 0.9), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 }); }
    if (k === 5) { // 결과 칸에서 행렬로 흘러가는 점
      CANCER_IDX.slice(0, 5).forEach((ix, j) => { const [ax, ay] = cellXY(WX, WY, ix), [bx, by] = M.cell('fn'); dot([[ax, ay], [bx, by]], seg(u, 0.2 + j * 0.12, 1.2 + j * 0.12), BAD, 5); });
      [3, 222, 555, 808, 950].forEach((ix, j) => { const [ax, ay] = cellXY(WX, WY, ix), [bx, by] = M.cell('tn'); dot([[ax, ay], [bx, by]], seg(u, 0.4 + j * 0.12, 1.4 + j * 0.12), INFO, 5); });
      banner(MX + 120, 384, 'TN 990 이 99% 를 만들었다 — 검출은 0명', pop(u, 1.6)); }
  }

  // =========================================================
  // 2. 혼동행렬 해부 (로지스틱 회귀, 임계값 0.5)
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    tx(WX, WY - 14, k <= 1 ? '테스트 1,000명 — 아직 깡통 결과' : '테스트 1,000명 — 로지스틱 회귀 판정', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const lrW = k === 2 ? E(u, 0.3, 1.8) : k > 2 ? 1 : 0;
    waffle(WX, WY, 'dummy', 0.5, lrW, { dim: k <= 1, hi: k === 3 ? (oc) => oc === 'TP' : k === 4 || k === 6 ? (oc) => oc === 'FN' : null });
    legend(WY + 186, 1);
    const m = mtw(c), hi = k === 3 ? ['tp', 'tn'] : k === 4 || k === 6 ? ['fp', 'fn'] : [];
    cm(MX, MY, m, { hi, op: k <= 1 ? 0.45 : 1, dim: k === 3 ? ['fp', 'fn'] : k === 4 || k === 6 ? ['tp', 'tn'] : null });
    const BX = 40, BY = 280;   // 아래 왼쪽 설명 칸
    if (k === 0) { // 저울: 정상 990 vs 암 10 → balanced 로 암 쪽 무게를 키운다
      const g = E(u, 0.9, 2.2), tilt = lerp(10, 0, g), cx = BX + 230, cy = BY + 34;
      card(cx, BY + 2, 360, 32, { rx: 8, text: 'LogisticRegression(class_weight="balanced")', fs: 13.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      const a = tilt * Math.PI / 180, lx = cx - 120 * Math.cos(a), ly = cy + 30 - 120 * Math.sin(-a), rx = cx + 120 * Math.cos(a), ry = cy + 30 - 120 * Math.sin(a);
      el('path', { d: `M${cx - 14},${cy + 70} L${cx},${cy + 34} L${cx + 14},${cy + 70} Z`, fill: OFF });
      el('line', { x1: lx, y1: ly, x2: rx, y2: ry, stroke: INK, 'stroke-width': 3 });
      for (let i = 0; i < 24; i++) el('circle', { cx: lx - 40 + (i % 8) * 11, cy: ly - 8 - Math.floor(i / 8) * 10, r: 4.2, fill: C.INFOBG, stroke: INFO, 'stroke-width': 1 });
      for (let i = 0; i < 3; i++) el('circle', { cx: rx - 22 + i * 22, cy: ry - 10 - lerp(0, 6, g), r: lerp(4.5, 10, g), fill: INK });
      tx(lx - 50, ly + 28, '정상 990', { 'font-size': 14.5, 'font-weight': 700 }); tx(rx - 30, ry + 28, '암 10', { 'font-size': 14.5, 'font-weight': 700 });
      sub(cx + 0, BY + 126, g < 0.5 ? '그대로면 다수 클래스가 손실을 지배한다' : '암 샘플 한 개의 손실을 크게 잡는다', 1, { 'font-size': 14.5, fill: g < 0.5 ? MUT : ACC, 'font-weight': 700 }); }
    if (k === 1) { // 숨은 임계값 0.5
      const ax = axes(BX + 20, BY + 20, 400, 30, { x: [0, 1], y: [0, 1], xt: [0, 0.5, 1] });
      el('rect', { x: ax.X(0.5), y: BY + 20, width: ax.X(1) - ax.X(0.5), height: 30, fill: C.GOODBG, opacity: fade(u, 1.0) });
      const th = lerp(0.15, 0.5, E(u, 0.2, 1.0)); el('line', { x1: ax.X(th), y1: BY + 6, x2: ax.X(th), y2: BY + 58, stroke: ACC, 'stroke-width': 3 });
      mono(ax.X(th), BY, 'threshold', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 });
      tx(ax.X(0.75), BY + 40, '→ 암(1)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
      tx(ax.X(0.25), BY + 40, '→ 정상(0)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
      pill(BX + 220, BY + 104, 'predict() = (proba ≥ 0.5)', ACC, pop(u, 1.6), { mono: true, fs: 14 }); }
    if (k === 2) { pill(BX + 210, BY + 6, 'cm.ravel() → TN, FP, FN, TP', INK, pop(u, 0.3), { mono: true, fs: 14 });
      [['TN', 960, INFO], ['FP', 30, WARN], ['FN', 2, BAD], ['TP', 8, GOOD]].forEach(([s, v, col], i) => { const x = BX + 30 + i * 105, sc = pop(u, 1.2 + i * 0.2);
        card(x + 40, BY + 70, 92, 54, { rx: 8, stroke: col, sw: 2, s: sc }); tx(x + 40, BY + 62, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col, opacity: fade(u, 1.3 + i * 0.2) });
        mono(x + 40, BY + 86, String(v), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.3 + i * 0.2) }); });
      sub(BX + 220, BY + 126, '순서를 헷갈리면 지표가 통째로 뒤집힌다', fade(u, 2.0), { 'font-size': 14 }); }
    if (k === 3) { // 이름 규칙
      const op1 = fade(u, 0.3), op2 = fade(u, 1.1);
      tx(BX + 40, BY + 30, 'T', { 'font-size': 40, 'font-weight': 800, fill: GOOD, opacity: op1 }); tx(BX + 72, BY + 30, 'P', { 'font-size': 40, 'font-weight': 800, fill: INK, opacity: op1 });
      tx(BX + 130, BY + 8, '앞 단어 True / False', { 'font-size': 15, 'font-weight': 700, opacity: op1 }); tx(BX + 130, BY + 30, '= 그 예측이 맞았나', { 'font-size': 14.5, fill: MUT, opacity: op1 });
      tx(BX + 130, BY + 62, '뒤 단어 Positive / Negative', { 'font-size': 15, 'font-weight': 700, opacity: op2 }); tx(BX + 130, BY + 84, '= 모델이 뭐라고 말했나', { 'font-size': 14.5, fill: MUT, opacity: op2 });
      check(BX + 52, BY + 92, 12, pop(u, 1.8)); tx(BX + 74, BY + 126, 'TP · TN = 정답 두 칸', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); }
    if (k === 4 || k === 6) { // 오류 두 칸의 무게: 개수는 FP 가 많지만 FN 쪽이 무겁다
      const g = k === 4 ? E(u, 1.0, 2.2) : 1, cx = BX + 220, cy = BY + 40, a = lerp(0, -12, g) * Math.PI / 180;
      const lx = cx - 150 * Math.cos(a), ly = cy + 150 * Math.sin(a), rx = cx + 150 * Math.cos(a), ry = cy - 150 * Math.sin(a);
      el('path', { d: `M${cx - 12},${cy + 40} L${cx},${cy + 4} L${cx + 12},${cy + 40} Z`, fill: OFF });
      el('line', { x1: lx, y1: ly, x2: rx, y2: ry, stroke: INK, 'stroke-width': 3 });
      for (let i = 0; i < 30; i++) el('circle', { cx: lx - 50 + (i % 10) * 10, cy: ly - 7 - Math.floor(i / 10) * 9, r: 3.8, fill: WARN, opacity: k === 4 ? fade(u, 0.2 + i * 0.01) : 1 });
      [0, 1].forEach((i) => el('rect', { x: rx - 30 + i * 32, y: ry - 26, width: 26, height: 22, rx: 4, fill: BAD, opacity: k === 4 ? fade(u, 0.6) : 1 }));
      if (k === 4) { tx(lx + 58, ly - 12, 'FP 30 — 재검사로 복구', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.4) });
        tx(rx + 30, ry + 30, 'FN 2 — 치료 시기 상실', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.8) });
        sub(cx, BY + 126, '개수가 아니라 비용으로 센다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      else { tx(lx + 58, ly - 12, '정밀도를 올릴까?', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) });
        tx(rx + 30, ry + 30, '재현율을 올릴까?', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.9) });
        sub(cx, BY + 126, '더 비싼 오류가 답을 정한다 → 다음 Step', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }
    if (k === 5) { // 깡통 vs 로지스틱
      [['깡통', 99.0, 0, OFF], ['로지스틱', 96.8, 8, ACC]].forEach(([nm, acc, hit, col], i) => { const y = BY + 6 + i * 62;
        tx(BX, y + 14, nm, { 'font-size': 15, 'font-weight': 700 });
        hbar(BX + 80, y, 150, acc * E(u, 0.2 + i * 0.3, 1.2 + i * 0.3), 100, { col, text: acc.toFixed(1) + '%', h: 17 });
        for (let j = 0; j < 10; j++) { const on = j < hit && u > 1.4 + j * 0.06; el('circle', { cx: BX + 300 + j * 15, cy: y + 9, r: 5.5, fill: on ? GOOD : PANEL, stroke: on ? GOOD : BAD, 'stroke-width': 1.8 }); }
        mono(BX + 300, y + 38, '암 검출 ' + hit + ' / 10', { 'font-size': 14, fill: hit ? GOOD : BAD, 'font-weight': 700, opacity: fade(u, 1.4) }); });
      sub(BX + 230, BY + 136, '정확도는 떨어졌는데 모델은 좋아졌다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    // 지표
    if (k >= 2) { metric(MX - 90, 262, '정확도', mv(c, 'acc'), { col: OFF }); metric(MX - 90, 296, '정밀도', mv(c, 'precision'), { col: WARN });
      metric(MX - 90, 330, '재현율', mv(c, 'recall'), { col: GOOD }); metric(MX - 90, 364, 'F1', mv(c, 'f1'), { col: ACC, none: k < 5 ? '아직' : '—' }); }
  }

  // =========================================================
  // 3. 정밀도 vs 재현율 · F1 · 리포트 · 도메인
  // =========================================================
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { const m = c.beat.matrix, x = 160, y = 74, w = 118, h = 68;
      cm(x, y, m, { noDesc: false });
      // 정밀도 = 예측 '암' 열, 재현율 = 실제 '암' 행
      const pOp = k === 0 ? fade(u, 0.3) : 1, rOp = k === 0 ? fade(u, 1.2) : 1;
      el('rect', { x: x - 5, y: y - 4, width: w + 10, height: h * 2 + 14, rx: 12, fill: 'none', stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': k === 1 ? null : '7 5', opacity: pOp });
      el('rect', { x: x - 8, y: y - 8, width: w * 2 + 22, height: h + 16, rx: 14, fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': k === 1 ? null : '7 5', opacity: rOp });
      if (k === 1) { tx(x + w / 2, y + 2 * h + 40, '분모 = 암이라 말한 전체', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
        mono(x + w / 2, y + 2 * h + 62, 'TP+FP = 38', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.5) });
        tx(x + 2 * w + 30, y + h / 2 + 5, '분모 = 실제 암 전체', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.1) });
        mono(x + 2 * w + 30, y + h / 2 + 27, 'TP+FN = 10', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) }); }
      const fx = 590;
      tx(fx, 90, '정밀도 (Precision)', { 'font-size': 15.5, 'font-weight': 800, fill: WARN, opacity: pOp });
      mono(fx, 118, 'TP / (TP+FP) = 8 / 38', { 'font-size': 15, opacity: pOp });
      hbar(fx, 132, 220, 21.1 * (k === 0 ? E(u, 0.6, 1.6) : 1), 100, { col: WARN, text: '21.1%', h: 18 });
      tx(fx, 210, '재현율 (Recall)', { 'font-size': 15.5, 'font-weight': 800, fill: GOOD, opacity: rOp });
      mono(fx, 238, 'TP / (TP+FN) = 8 / 10', { 'font-size': 15, opacity: rOp });
      if (rOp > 0.05) hbar(fx, 252, 220, 80 * (k === 0 ? E(u, 1.4, 2.4) : 1), 100, { col: GOOD, text: '80.0%', h: 18 });
      if (k === 0) sub(fx + 120, 312, '분자는 둘 다 TP 8', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 1) banner(480, 388, '"암" 38명 중 30명이 헛방 → 정밀도 21.1%', pop(u, 1.8));
      return; }
    if (k === 2 || k === 3) { // 평균의 선택
      const ax = axes(150, 60, 560, 250, { x: [0, 1], y: [0, 1], yt: [0, 0.5, 1], grid: true });
      const bars = k === 2 ? [['정밀도', 0.01, WARN], ['재현율', 1.0, GOOD], ['산술평균', 0.505, OFF], ['조화평균', 0.02, ACC]]
        : [['정밀도', 0.211, WARN], ['재현율', 0.8, GOOD], ['F1', 0.333, ACC]];
      tx(150, 40, k === 2 ? '전원 "암" 이라 답하는 꼼수 모델' : '우리 모델 (임계값 0.5)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      bars.forEach(([nm, v, col], i) => { const bw = 80, x = 190 + i * 130, g = E(u, 0.3 + i * 0.4, 1.0 + i * 0.4), y = ax.Y(v * g);
        el('rect', { x, y, width: bw, height: Math.max(1, ax.Y(0) - y), rx: 4, fill: col, opacity: nm === '산술평균' ? 0.8 : 1 });
        tx(x + bw / 2, 336, nm, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
        mono(x + bw / 2, y - 8, k === 2 ? v.toFixed(3).replace(/0+$/, '').replace(/\.$/, '.0') : (v * 100).toFixed(1) + '%', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col === OFF ? INK : col, opacity: fade(u, 0.8 + i * 0.4) }); });
      if (k === 2) { pill(800, 150, '산술평균은 속는다', BAD, pop(u, 1.9), { fs: 14 }); pill(800, 196, '조화평균은 벌점', GOOD, pop(u, 2.2), { fs: 14 }); }
      else { mono(810, 140, 'F1 = 2·P·R / (P+R)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
        tx(810, 176, '작은 쪽(정밀도)에', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); tx(810, 198, '끌려 내려간다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); }
      return; }
    if (k >= 4 && k <= 6) { // classification_report
      const x = 130, y = 90, cw = [150, 120, 120, 120, 120], heads = ['', 'precision', 'recall', 'f1-score', 'support'];
      const rows = [['normal', '1.00', '0.97', '0.98', '990'], ['cancer', '0.21', '0.80', '0.33', '10']];
      mono(x, y - 40, 'classification_report(y_te, y_pred)', { 'font-size': 15, fill: MUT, opacity: k === 4 ? fade(u, 0.2) : 1 });
      let cx = x; heads.forEach((h, i) => { mono(cx + (i ? cw[i] - 10 : 0), y, h, { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': i ? 'end' : 'start', opacity: k === 4 ? fade(u, 0.4) : 1 }); cx += cw[i]; });
      el('line', { x1: x, y1: y + 12, x2: x + 630, y2: y + 12, stroke: GRID, 'stroke-width': 2 });
      const order = k === 6 ? [1, 0] : [0, 1];
      rows.forEach((r, ri) => { const pos = order.indexOf(ri), ry = y + 50 + pos * 56, isC = ri === 1, op = k === 4 ? fade(u, 0.8 + ri * 0.5) : 1, dim = k >= 5 && !isC;
        if (k >= 5 && isC) el('rect', { x: x - 14, y: ry - 30, width: 660, height: 46, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: k === 5 ? fade(u, 0.3) : 1 });
        let cx = x; r.forEach((v, i) => { mono(cx + (i ? cw[i] - 10 : 0), ry, v, { 'font-size': 17, 'font-weight': isC && k >= 5 ? 800 : 600, 'text-anchor': i ? 'end' : 'start', fill: dim ? OFF : isC && i > 0 && i < 4 && k >= 5 ? ACC : INK, opacity: op }); cx += cw[i]; });
        if (k === 6) mono(x - 30, ry, pos === 0 ? '①' : '②', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', fill: pos === 0 ? ACC : MUT, opacity: fade(u, 0.9) }); });
      if (k === 5) { tx(x + 330, 280, 'normal 0.98 — support 990 의 다수 클래스라 화려할 뿐', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.9) });
        banner(480, 340, '진짜 성적표: cancer 행 0.21 / 0.80 / 0.33', pop(u, 1.6)); }
      if (k === 6) banner(480, 320, '리포트를 열면 소수 클래스 행부터', pop(u, 1.4));
      return; }
    // k === 7 도메인: 시소
    const cx = 480, cy = 210, g = E(u, 0.2, 1.4), a = Math.sin(t * 1.2) * 0.0 + lerp(0, 1, g);
    el('path', { d: `M${cx - 18},${cy + 54} L${cx},${cy + 10} L${cx + 18},${cy + 54} Z`, fill: OFF });
    el('line', { x1: cx - 260, y1: cy, x2: cx + 260, y2: cy, stroke: INK, 'stroke-width': 4 });
    lbl(cx - 220, cy - 16, '정밀도', 1, { fill: WARN, 'font-size': 17 }); lbl(cx + 220, cy - 16, '재현율', 1, { fill: GOOD, 'font-size': 17 });
    const sp = pop(u, 0.5), ca = pop(u, 1.2);
    card(cx - 220, 90, 250, 72, { rx: 10, stroke: WARN, sw: 2.2, s: sp, text: '스팸필터\nFP(정상 메일 차단)가 비싸다', fs: 14.5 });
    card(cx + 220, 90, 250, 72, { rx: 10, stroke: GOOD, sw: 2.2, s: ca, text: '암 진단\nFN(환자 놓침)이 비싸다', fs: 14.5 });
    grow(cx - 220, 128, cx - 220, cy - 36, E(u, 0.8, 1.3), WARN); grow(cx + 220, 128, cx + 220, cy - 36, E(u, 1.5, 2.0), GOOD);
    mono(cx - 220, cy + 46, '임계값 ↑', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
    mono(cx + 220, cy + 46, '임계값 ↓', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
    banner(cx, 340, '둘 다 100% 는 없다 — 비싼 오류가 자리를 정한다', pop(u, 2.1)); void a;
  }

  // =========================================================
  // 4. 임계값 스윕과 ROC
  // =========================================================
  const SX0 = 70, SX1 = 590, X = (p) => SX0 + p * (SX1 - SX0);
  function strip(th, o) { o = o || {}; const op = o.op ?? 1, yc = 100, yn = 168;
    el('line', { x1: SX0, y1: 212, x2: SX1, y2: 212, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    [0, 0.3, 0.5, 0.7, 1].forEach((v) => { el('line', { x1: X(v), y1: 212, x2: X(v), y2: 217, stroke: MUT, opacity: op }); mono(X(v), 233, String(v), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); });
    tx(SX1, 252, '암일 확률 (proba)', { 'font-size': 14, 'text-anchor': 'end', fill: MUT, 'font-weight': 600, opacity: op });
    tx(SX0 - 8, yc + 5, '암 10', { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700, opacity: op });
    tx(SX0 - 8, yn + 5, '정상', { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700, opacity: op });
    const show = o.show ?? 1;
    el('rect', { x: X(0), y: yn - 22, width: X(0.29) - X(0), height: 44, rx: 6, fill: C.INFOBG, stroke: INFO, 'stroke-width': 1.2, opacity: op * clamp(show * 3) });
    tx((X(0) + X(0.29)) / 2, yn + 5, '정상 911명', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: op * clamp(show * 3) });
    RISKY.forEach((ix, r) => { if (r / 79 > show) return; const p = PROBA[ix], pos = th != null && p >= th - 1e-9;
      el('circle', { cx: X(p), cy: yn - 16 + (r % 5) * 8, r: 3.4, fill: th == null ? OFF : pos ? WARN : C.INFOBG, stroke: th == null ? 'none' : pos ? 'none' : INFO, 'stroke-width': 1, opacity: op }); });
    CANCER_P.forEach((p, j) => { if (j / 10 > show) return; const pos = th != null && p >= th - 1e-9;
      el('circle', { cx: X(p), cy: yc + (j % 2) * 10 - 5, r: 6.5, fill: th == null ? INK : pos ? GOOD : BAD, opacity: op }); });
    if (th != null) { el('line', { x1: X(th), y1: 62, x2: X(th), y2: 214, stroke: ACC, 'stroke-width': 3 });
      el('rect', { x: X(th), y: 62, width: X(1) - X(th), height: 150, fill: ACC, opacity: 0.06 });
      pill(X(th), 50, 'th ' + th.toFixed(2), ACC, 1, { mono: true, fs: 13.5, fill: PANEL }); } }
  function sweepTable(rows, x, y, active) {
    const hd = ['th', 'TP', 'FP', 'FN', '정밀도', '재현율'], cx = [0, 70, 130, 190, 270, 360];
    hd.forEach((h, i) => tx(x + cx[i], y, h, { 'font-size': 14, 'font-weight': 700, fill: MUT }));
    rows.forEach((r, i) => { const yy = y + 28 + i * 26, on = r.active || i === active;
      if (on) el('rect', { x: x - 8, y: yy - 18, width: 440, height: 24, rx: 5, fill: ACCBG });
      [r.th, r.tp, r.fp, r.fn, r.p.toFixed(1) + '%', r.r.toFixed(1) + '%'].forEach((v, j) => mono(x + cx[j], yy, String(v), { 'font-size': 14.5, 'font-weight': on ? 800 : 500, fill: j === 2 ? WARN : j === 3 ? BAD : INK })); }); }
  const ROC_AX = { x: 120, y: 50, w: 330, h: 300 };
  function rocAxes(op) { const a = axes(ROC_AX.x, ROC_AX.y, ROC_AX.w, ROC_AX.h, { x: [0, 1], y: [0, 1], xt: [0, 0.5, 1], yt: [0, 0.5, 1], xl: 'FPR (오진율)', yl: 'TPR (재현율)', grid: true });
    return a; }
  function s4(t, c) { const { k, u } = c, b = c.beat;
    if (k <= 4) { // 확률 띠 + 혼동행렬
      let th = null;
      if (k === 1) th = u < 0.3 ? null : u < 1.0 ? lerp(0.7, 0.5, E(u, 0.3, 1.0)) : lerp(0.5, 0.3, E(u, 1.0, 1.8));
      if (k >= 2) { const prevTh = c.prev && c.prev.threshold != null ? c.prev.threshold : b.threshold; th = lerp(prevTh, b.threshold, E(u, 0.2, 1.2)); }
      if (k === 1 && u >= 1.8) th = lerp(0.3, 0.5, E(u, 1.9, 2.5));
      strip(th, { show: k === 0 ? E(u, 0.3, 2.0) : 1 });
      if (k === 0) { pill(330, 300, 'proba = model.predict_proba(X_te)[:, 1]', ACC, pop(u, 0.4), { mono: true, fs: 14 });
        sub(330, 340, '0/1 이 아니라 0~1 사이의 확률', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
        cm(MX + 20, MY + 20, b.matrix, { op: fade(u, 1.8) * 0.5 }); return; }
      if (k === 1) { [0.7, 0.5, 0.3].forEach((v, i) => pill(200 + i * 130, 300, 'th=' + v.toFixed(2), ACC, pop(u, 0.4 + i * 0.5), { mono: true, fs: 14 }));
        sub(330, 344, '같은 proba 에 선만 옮긴다 — 재학습 없음', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
        cm(MX + 20, MY + 20, b.matrix, { op: 0.5 }); return; }
      cm(MX + 20, MY + 20, mtw(c), { hi: k === 2 ? ['fp', 'fn'] : k === 4 ? ['tp', 'fp'] : ['tp'] });
      sweepTable(b.thresholdTable.rows, 70, 296, -1);
      const p = mv(c, 'precision'), r = mv(c, 'recall');
      metric(MX - 20, 300, '정밀도', p, { col: WARN, w: 170 }); metric(MX - 20, 334, '재현율', r, { col: GOOD, w: 170 });
      const note = { 2: '신중형 — 오진 8명, 대신 암 4명 놓침', 3: 'sklearn 기본값 — Step 2·3 의 숫자', 4: '적극형 — 암 9명 검출, 오진 79명' }[k];
      tx(MX + 120, 392, note, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: k === 4 ? GOOD : k === 2 ? WARN : INK, opacity: fade(u, 1.2) });
      return; }
    // ROC 장면 (k 5..8)
    const a = rocAxes(1), rows = b.thresholdTable.rows, pts3 = rows.map((r) => [r.fp / (r.fp + r.tn), r.tp / (r.tp + r.fn), r.th]);
    if (k === 5) { // 두 축 정의 + 표의 세 점
      const fx = 560;
      tx(fx, 80, 'TPR = TP / (TP+FN)', { 'font-size': 16, 'font-weight': 800, fill: GOOD, class: 'mono', opacity: fade(u, 0.2) });
      tx(fx, 104, '실제 암 중 찾아낸 비율 (= 재현율)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3) });
      tx(fx, 150, 'FPR = FP / (FP+TN)', { 'font-size': 16, 'font-weight': 800, fill: WARN, class: 'mono', opacity: fade(u, 0.8) });
      tx(fx, 174, '정상 중 암이라 오진한 비율', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.9) });
      pts3.forEach(([fx_, ty, th], i) => { const s = pop(u, 1.3 + i * 0.35); if (s <= 0) return; el('circle', { cx: a.X(fx_), cy: a.Y(ty), r: 6 * s, fill: ACC });
        mono(a.X(fx_) + 14, a.Y(ty) + 18 + i * 2, 'th ' + th, { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4 + i * 0.35) }); });
      rows.forEach((r, i) => mono(fx, 230 + i * 30, `th ${r.th}: FPR ${r.fp}/${r.fp + r.tn} · TPR ${r.tp}/10`, { 'font-size': 14, opacity: fade(u, 1.3 + i * 0.35) }));
      tx(fx, 340, '표의 세 줄 = 곡선 위의 세 점', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) });
      return; }
    const roc = b.roc, P = roc.points;
    const gu = k === 6 ? E(u, 0.2, 1.8) : 1;
    // AUC 면적
    if (k >= 6) { const n = Math.max(2, Math.ceil(gu * (P.length - 1)) + 1), ps = P.slice(0, n);
      const d = `M${a.X(0)},${a.Y(0)} ` + ps.map(([x, y]) => `L${a.X(x)},${a.Y(y)}`).join(' ') + ` L${a.X(ps[ps.length - 1][0])},${a.Y(0)} Z`;
      el('path', { d, fill: ACC, opacity: (k === 6 ? fade(u, 1.6) : 1) * 0.14 }); }
    if (k >= 7) { el('line', { x1: a.X(0), y1: a.Y(0), x2: a.X(1), y2: a.Y(1), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: k === 7 ? fade(u, 0.3) : 1 });
      tx(a.X(0.62), a.Y(0.5), 'chance (0.5)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: k === 7 ? fade(u, 0.5) : 1 }); }
    line(a, P, gu, ACC, { sw: 3.2 });
    if (k >= 6) mono(a.X(0.5), a.Y(0.32), 'AUC ' + roc.auc.toFixed(2), { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: k === 6 ? fade(u, 1.8) : 1 });
    const fx = 560;
    if (k === 6) { mono(fx, 90, 'fpr, tpr, _ = roc_curve(y_te, proba)', { 'font-size': 14, opacity: fade(u, 0.2) });
      mono(fx, 118, 'roc_auc = auc(fpr, tpr)', { 'font-size': 14, opacity: fade(u, 0.6) });
      tx(fx, 180, '모든 임계값의 (FPR, TPR) 궤적', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(fx, 206, '왼쪽 위에 붙을수록 좋은 모델', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) });
      banner(fx + 170, 300, '곡선 아래 면적 = AUC 0.95', pop(u, 2.0)); }
    if (k === 7) { // 무작위 양성 1명 vs 음성 1명
      tx(fx, 76, 'AUC 의 뜻', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      tx(fx, 102, '무작위 암 1명이 무작위 정상 1명보다', { 'font-size': 14.5, opacity: fade(u, 0.4) });
      tx(fx, 124, '높은 확률을 받을 확률', { 'font-size': 14.5, opacity: fade(u, 0.4) });
      const y0 = 190, X2 = (p) => fx + 10 + p * 330;
      el('line', { x1: X2(0), y1: y0, x2: X2(1), y2: y0, stroke: MUT, 'stroke-width': 1.8 });
      mono(X2(0), y0 + 22, '0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(X2(1), y0 + 22, '1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      const pairs = [[0.85, 0.12], [0.6, 0.25], [0.4, 0.66]];
      pairs.forEach(([pc, pn], i) => { const s = seg(u, 0.8 + i * 0.5, 1.2 + i * 0.5); if (s <= 0) return;
        el('circle', { cx: X2(pc), cy: y0 - 14 - i * 0, r: 7, fill: BAD, opacity: s }); el('circle', { cx: X2(pn), cy: y0 + 0, r: 7, fill: INFO, opacity: s });
        if (s >= 1 && i === pairs.length - 1) { }
      });
      tx(fx, 252, '이 쌍 비교를 모든 쌍에 대해 하면 AUC', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) });
      pill(fx + 90, 296, '1.0 완벽 · 0.5 동전 던지기', INK, pop(u, 2.2), { fs: 14 });
      tx(fx, 344, '임계값과 무관 → 모델끼리 비교할 때', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.4) }); }
    if (k === 8) { const [mx, my] = roc.marker, s = pop(u, 0.4);
      const sx = a.X(mx), sy = a.Y(my), R5 = 13 * s;
      if (s > 0) el('path', { d: Array.from({ length: 10 }, (_, i) => { const rr = i % 2 ? R5 * 0.45 : R5, an = -Math.PI / 2 + i * Math.PI / 5; return (i ? 'L' : 'M') + (sx + rr * Math.cos(an)) + ',' + (sy + rr * Math.sin(an)); }).join(' ') + 'Z', fill: WARN });
      tx(sx + 18, sy + 26, '★ 지금 th 0.30', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.7) });
      mono(fx, 100, `FPR ${mx.toFixed(2)} · TPR ${my.toFixed(2)}`, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.9) });
      tx(fx, 140, '대각선과 함께 그려야', { 'font-size': 15, opacity: fade(u, 1.2) }); tx(fx, 164, '얼마나 왼쪽 위인지 보인다', { 'font-size': 15, opacity: fade(u, 1.2) });
      banner(fx + 170, 260, '재현율 90% · 오진 79명 · AUC 0.95', pop(u, 1.8)); }
  }

  // =========================================================
  // 5. 실무 지표 선택 + 회귀 지표
  // =========================================================
  function guideRows(rows, k, u, fresh) { const x = 40, y = 70;
    [['문제', 0], ['비싼 오류', 300], ['주 지표', 560]].forEach(([h, dx]) => tx(x + dx, y - 16, h, { 'font-size': 14, 'font-weight': 700, fill: MUT }));
    rows.forEach((r, i) => { const yy = y + 12 + i * 52, isNew = i >= fresh, op = isNew ? fade(u, 0.3 + (i - fresh) * 0.35) : 1;
      el('rect', { x: x - 10, y: yy - 4, width: 900, height: 44, rx: 8, fill: isNew && fresh > 0 ? ACCBG : SOFT, opacity: op });
      tx(x, yy + 23, r.task.replace(/^\S+\s/, ''), { 'font-size': 15, 'font-weight': 700, opacity: op });
      const col = /FN/.test(r.costly) ? BAD : /FP/.test(r.costly) ? WARN : MUT;
      if (r.costly !== '—') pill(x + 300 + tw(r.costly, 13.5) / 2 + 13, yy + 18, r.costly, col, op, { fs: 13.5 }); else tx(x + 300, yy + 23, '—', { fill: MUT, opacity: op });
      tx(x + 560, yy + 23, r.metric, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: op }); }); }
  function houses(o) { o = o || {}; const yt = [310, 250, 480, 120], yp = [300, 260, 400, 125];
    const a = axes(90, 60, 360, 270, { x: [0.5, 4.5], y: [100, 500], yt: [100, 300, 500], yl: '집값 (만$)', grid: true });
    yt.forEach((v, i) => { const x = a.X(i + 1), s = o.show ? seg(o.show, i * 0.2, i * 0.2 + 0.3) : 1; if (s <= 0) return;
      el('line', { x1: x, y1: a.Y(v), x2: x, y2: a.Y(yp[i]), stroke: i === 2 ? BAD : WARN, 'stroke-width': 3, opacity: s });
      el('circle', { cx: x, cy: a.Y(v), r: 7, fill: INK, opacity: s }); el('circle', { cx: x, cy: a.Y(yp[i]), r: 7, fill: PANEL, stroke: ACC, 'stroke-width': 2.5, opacity: s });
      mono(x + 12, (a.Y(v) + a.Y(yp[i])) / 2 + 5, String(Math.abs(v - yp[i])), { 'font-size': 14.5, 'font-weight': 800, fill: i === 2 ? BAD : WARN, opacity: s });
      mono(x, a.Y(100) + 22, '#' + (i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); });
    el('circle', { cx: 112, cy: 384, r: 6, fill: INK }); tx(124, 389, '실제', { 'font-size': 14 }); el('circle', { cx: 182, cy: 384, r: 6, fill: PANEL, stroke: ACC, 'stroke-width': 2.5 }); tx(194, 389, '예측', { 'font-size': 14 });
    return a; }
  function s5(t, c) { const { k, u } = c, b = c.beat;
    if (k <= 1) { guideRows(b.guideTable.rows, k, u, k === 0 ? 0 : 4);
      if (k === 0) banner(480, 390, '지표는 "가장 비싼 오류" 에서 역산한다', pop(u, 1.8));
      else banner(480, 390, '임계값 = 운영 결정 · AUC = 후보 모델 고르기', pop(u, 1.2));
      return; }
    if (k === 2) { tx(240, 80, '분류', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' }); tx(720, 80, '회귀', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      el('line', { x1: 480, y1: 60, x2: 480, y2: 330, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
      pill(240, 160, 'average_precision_score', ACC, pop(u, 0.3), { mono: true, fs: 14 }); sub(240, 200, 'PR-AUC', fade(u, 0.5), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      pill(720, 140, 'mean_absolute_error', ACC, pop(u, 0.8), { mono: true, fs: 14 }); pill(720, 200, 'mean_squared_error', ACC, pop(u, 1.1), { mono: true, fs: 14 });
      sub(720, 244, 'MAE · RMSE', fade(u, 1.3), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      tx(240, 280, '맞다 / 틀리다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); tx(720, 290, '정답에서 얼마나 떨어졌나', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
      return; }
    if (k === 3) { // 같은 모델, 같은 임계값 — ROC 위치 vs PR 위치
      const rows = b.guideTable ? c.steps[0].guideTable : null; void rows;
      const tt = [{ th: '0.70', p: 42.9, r: 60, fp: 8, tn: 982 }, { th: '0.50', p: 21.1, r: 80, fp: 30, tn: 960 }, { th: '0.30', p: 10.2, r: 90, fp: 79, tn: 911 }];
      const A1 = axes(80, 60, 300, 250, { x: [0, 1], y: [0, 1], xt: [0, 1], yt: [0, 1], xl: 'FPR', yl: 'ROC: TPR' });
      const A2 = axes(560, 60, 300, 250, { x: [0, 1], y: [0, 1], xt: [0, 1], yt: [0, 1], xl: '재현율', yl: 'PR: 정밀도' });
      line(A1, tt.map((r) => [r.fp / (r.fp + r.tn), r.r / 100]), E(u, 0.3, 1.0), ACC, { sw: 3 });
      line(A2, tt.map((r) => [r.r / 100, r.p / 100]), E(u, 1.0, 1.7), WARN, { sw: 3 });
      tt.forEach((r, i) => { scatter(A1, [[r.fp / (r.fp + r.tn), r.r / 100, ACC]], { u: seg(u, 0.3 + i * 0.2, 0.6 + i * 0.2) }); scatter(A2, [[r.r / 100, r.p / 100, WARN]], { u: seg(u, 1.0 + i * 0.2, 1.3 + i * 0.2) }); });
      tx(230, 100, '왼쪽 위 — 좋아 보인다', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0), 'text-anchor': 'middle' });
      tx(700, 100, '정밀도 10~43% — 정직하다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8), 'text-anchor': 'middle' });
      banner(480, 392, 'TN 911명이 FPR 분모를 키워 ROC 를 후하게 만든다', pop(u, 2.1));
      return; }
    if (k >= 4 && k <= 6) { houses({ show: k === 4 ? E(u, 0.2, 2.0) : null });
      const fx = 540, errs = [10, 10, 80, 5];
      if (k === 4) { tx(fx, 110, '맞다 / 틀리다가 아니라', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) }); tx(fx, 138, '정답에서 떨어진 거리를 센다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
        mono(fx, 190, '오차 = 10, 10, 80, 5', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) });
        tx(fx, 230, '#3 (480 → 400) 하나만 유독 크다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) }); }
      if (k === 5) { // |오차| 를 이어 붙여 평균
        tx(fx, 76, 'MAE = mean(|y − ŷ|)', { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.2) });
        const sc = 3.4; let x = fx; errs.forEach((e, i) => { const g = E(u, 0.4 + i * 0.25, 0.8 + i * 0.25);
          el('rect', { x, y: 104, width: e * sc * g, height: 26, fill: i === 2 ? BAD : WARN, stroke: PANEL, 'stroke-width': 1.5 }); x += e * sc * g; });
        mono(fx, 156, '합 105 ÷ 4', { 'font-size': 15, opacity: fade(u, 1.6) });
        const mw = 26.25 * sc * E(u, 1.8, 2.4); el('rect', { x: fx, y: 174, width: mw, height: 26, fill: ACC });
        mono(fx + mw + 10, 193, '26.2', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) });
        tx(fx, 250, '"평균 26만$ 틀린다" — 단위 그대로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); }
      if (k === 6) { // 제곱하면 큰 오차가 지배
        tx(fx, 76, 'RMSE = sqrt(mean((y − ŷ)²))', { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.2) });
        const sc = 1.55; let x = fx; errs.forEach((e, i) => { const g = pop(u, 0.4 + i * 0.25), s = e * sc * g;
          el('rect', { x, y: 230 - s, width: s, height: s, fill: i === 2 ? BAD : WARN, opacity: 0.85 }); if (g > 0.5) mono(x + Math.max(s, 14) / 2, 248, String(e * e), { 'font-size': 13.5, 'text-anchor': 'middle', fill: i === 2 ? BAD : MUT, 'font-weight': 700 }); x += Math.max(s, 22) + 8; });
        mono(fx, 290, 'RMSE 40.7  vs  MAE 26.2', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
        tx(fx, 320, '80² = 6400 이 결과를 지배한다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) }); }
      return; }
    if (k === 7) { [['MAE', '26.2', '모든 오차를 공평하게', '이상치에 흔들리면 안 되는 보고용', INFO], ['RMSE', '40.7', '큰 오차에 제곱 벌점', '"가끔 크게 틀리면 안 됨" — 수요 예측 등', BAD]].forEach(([nm, v, a, w, col], i) => {
        const cx = 250 + i * 460, s = pop(u, 0.3 + i * 0.5); card(cx, 190, 400, 220, { rx: 14, stroke: col, sw: 2.5, s });
        tx(cx, 120, nm, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.5) });
        mono(cx, 165, v, { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, opacity: fade(u, 0.5 + i * 0.5) });
        tx(cx, 212, a, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.6 + i * 0.5) });
        tx(cx, 256, w, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.5) }); });
      banner(480, 360, '회귀에서도 어떤 실수가 더 비싼지가 지표를 고른다', pop(u, 1.9)); return; }
    // k === 8 보고 규칙
    const y = 120;
    card(480, y, 640, 64, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 0.2) });
    mono(200, y + 7, '정확도 99%', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) });
    tx(380, y + 6, '(이유 없음)', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.3) });
    if (u > 0.9) { el('line', { x1: 180, y1: y + 1, x2: lerp(180, 760, E(u, 0.9, 1.3)), y2: y + 1, stroke: BAD, 'stroke-width': 3 }); }
    card(480, 230, 640, 84, { rx: 10, stroke: GOOD, sw: 2.5, s: pop(u, 1.3) });
    mono(200, 222, '재현율 90% (th 0.30)', { 'font-size': 19, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
    tx(200, 252, '왜? 암 진단은 놓침(FN)이 가장 비싼 오류이므로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
    [['① 비싼 오류', 0], ['② 지표', 1], ['③ 임계값', 2], ['④ 이유 한 줄', 3]].forEach(([s, i]) => pill(195 + i * 190, 340, s, ACC, pop(u, 2.0 + i * 0.12), { fs: 14 }));
  }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '암 환자가 1%뿐인 테스트 1,000명에 "전부 정상"이라 답하는 깡통 모델의 성적은?',
      o: ['정확도 99%, 재현율 0%', '정확도 1%, 재현율 100%', '정확도 99%, 재현율 99%'], a: 0,
      why: '정상 990명을 맞혀 정확도는 99%지만 암 10명은 한 명도 찾지 못했다. 불균형 데이터에서는 재현율 0%가 진짜 성적이다.' },
    { q: '혼동행렬에서 FN 은 무엇을 뜻하나?',
      o: ['정상인데 암이라 한 오진', '암인데 정상이라 한 놓침', '정상을 정상이라 맞힌 것'], a: 1,
      why: '뒤 단어 Negative 는 모델이 "정상"이라 말했다는 뜻, 앞 단어 False 는 그 말이 틀렸다는 뜻이다. 재검사로 복구되는 FP 와 달리 FN 은 치료 시기를 잃는다.' },
    { q: '스팸필터와 암 진단은 각각 어떤 지표를 우선하나?',
      o: ['둘 다 정확도', '스팸필터는 재현율, 암 진단은 정밀도', '스팸필터는 정밀도, 암 진단은 재현율'], a: 2,
      why: '스팸필터는 정상 메일 차단(FP)이, 암 진단은 놓침(FN)이 가장 비싼 오류다. 비싼 오류가 시소의 어느 쪽에 앉을지 정한다.' },
    { q: '같은 모델에서 임계값을 0.5 에서 0.3 으로 내리면 어떻게 되나?',
      o: ['재현율은 오르고 오진(FP)이 는다', '재현율은 떨어지고 정밀도가 오른다', '모델을 다시 학습해야 결과가 바뀐다'], a: 0,
      why: '재학습 없이 확률에 긋는 선만 바뀐다. th=0.30 에서 암 9명을 찾는 대신 오진이 79명으로 늘고 정밀도는 10.2%로 떨어진다.' },
    { q: '"가끔 크게 틀리면 안 되는" 회귀 문제에 맞는 지표는 무엇인가?',
      o: ['MAE', 'RMSE', '정확도'], a: 1,
      why: 'RMSE 는 오차를 제곱해 큰 오차에 무거운 벌점을 준다. 같은 집값 예측에서 MAE 26.2 가 RMSE 로는 40.7 이 된다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '암 환자가 1%뿐이면 전부 정상이라 답해도 정확도가 99%다. 그 모델은 암 환자를 한 명도 못 찾는다.',
    '혼동행렬로 예측을 네 칸으로 나누면 오진(FP)과 놓침(FN)이 따로 보인다. 두 오류의 비용은 다르다.',
    '정밀도와 재현율은 임계값을 사이에 둔 시소다. 암 진단은 임계값을 0.30으로 내려 재현율 90%를 얻었다.',
    '지표는 가장 비싼 오류에서 거꾸로 고른다. 보고서에는 왜 그 지표인지 한 줄을 함께 적는다.',
  ];
  const review = [
    { q: '양성이 아주 드문 희귀 질환 선별 모델의 ROC-AUC가 높게 나왔다. 함께 확인할 것은?',
      o: ['정확도', 'PR-AUC', 'MAE'], a: 1,
      why: '음성이 압도적으로 많으면 TN이 많아 ROC-AUC가 낙관적으로 나온다. 양성 쪽 성적을 직접 보는 PR-AUC가 이 착시를 드러낸다.' },
    { q: '새 암 진단 모델의 정확도가 깡통 모델의 99%보다 낮은 96.8%다. 그래도 새 모델이 낫다고 볼 근거는?',
      o: ['오진(FP)이 깡통 모델보다 적다', '임계값이 기본값 0.5라서 공정하다', '암 환자 10명 중 8명을 찾았다'], a: 2,
      why: '깡통 모델은 재현율이 0%였다. 불균형 데이터에서는 정확도가 조금 떨어져도 소수 클래스를 찾아내는 쪽이 쓸모 있는 모델이다.' },
    { q: '사기 탐지에서 조사 인력이 하루에 볼 수 있는 경보 수가 정해져 있다. 임계값을 고르는 방법으로 맞는 것은?',
      o: ['재현율을 앞세우되 정밀도 하한을 지키는 선에서 고른다', '라이브러리 기본값 0.5를 그대로 쓴다', '임계값을 0 가까이 내려 재현율을 최대로 올린다'], a: 0,
      why: '놓친 사기가 곧 손실이라 재현율이 중심이지만, 경보가 인력을 넘으면 조사가 멈춘다. 0.5는 라이브러리 기본값일 뿐 도메인이 정한 값이 아니다.' },
  ];

  R.page({ title: '평가지표 시뮬레이션 — 테스트 1,000명', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
