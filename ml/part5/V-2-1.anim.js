/* V-2-1 모델 해석 — SHAP·피처 중요도 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 페이지 데이터 (예전 왼쪽 패널의 CUSTOMER · BEESWARM 그대로) ----------
  // 고객 #7: base 0.22 + 0.31 + 0.18 + 0.09 − 0.07 − 0.02 = 0.71 → 거절
  const BASE = 0.22, FINAL = 0.71, THR = 0.5;
  const FEATS = [
    { key: 'delinq_count', label: '연체 이력', short: '연체', value: '2회', shap: 0.31 },
    { key: 'debt_ratio', label: '부채비율', short: '부채', value: '62%', shap: 0.18 },
    { key: 'recent_inquiries', label: '최근 신용조회', short: '조회', value: '5회', shap: 0.09 },
    { key: 'annual_income', label: '연봉', short: '연봉', value: '5,200만원', shap: -0.07 },
    { key: 'years_employed', label: '근속연수', short: '근속', value: '6년', shap: -0.02 },
  ];
  // beeswarm 표본 (x: SHAP값, v: 피처값 높낮이 0~1). 세로 순서 = 평균 |SHAP| 순
  const BEES = [
    { label: '연체 이력', dots: [[-.05, .1], [-.04, .15], [-.03, .2], [-.02, .1], [.08, .6], [.14, .7], [.22, .8], [.28, .9], [.31, .95], [.36, 1]] },
    { label: '부채비율', dots: [[-.12, .05], [-.08, .15], [-.05, .25], [-.02, .35], [.03, .55], [.07, .6], [.12, .75], [.16, .85], [.18, .9], [.24, 1]] },
    { label: '연봉', dots: [[-.16, 1], [-.11, .9], [-.07, .8], [-.05, .7], [-.02, .55], [.01, .4], [.05, .3], [.08, .2], [.11, .1], [.13, .05]] },
    { label: '최근 신용조회', dots: [[-.04, .1], [-.03, .2], [-.01, .3], [.01, .45], [.03, .55], [.05, .65], [.07, .75], [.09, .85], [.11, .95], [.12, 1]] },
    { label: '근속연수', dots: [[-.06, 1], [-.05, .85], [-.03, .7], [-.02, .6], [-.01, .5], [0, .45], [.01, .35], [.02, .25], [.03, .15], [.04, .05]] },
  ];
  const sgn = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2);
  const dirCol = (v) => (v >= 0 ? BAD : INFO);

  // ---------- 공통 ----------
  const rect = (x, y, w, h, a) => el('rect', Object.assign({ x, y, width: Math.max(0, w), height: h, rx: 4 }, a || {}));
  // 피처값 높낮이 색 점: 파랑(낮음) → 빨강(높음)을 두 겹 투명도로 섞는다
  function vdot(cx, cy, r, v, op, ring) { op = op ?? 1;
    el('circle', { cx, cy, r, fill: PANEL, opacity: op });
    el('circle', { cx, cy, r, fill: INFO, opacity: op * (1 - v) });
    el('circle', { cx, cy, r, fill: BAD, opacity: op * v });
    if (ring) el('circle', { cx, cy, r: r + 3, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: op }); }
  // 작은 트리 아이콘
  function tree(cx, cy, s, col, op) { const g = R.G(cx, cy, s, op);
    el('line', { x1: 0, y1: -9, x2: -8, y2: 3, stroke: col, 'stroke-width': 2 }, g); el('line', { x1: 0, y1: -9, x2: 8, y2: 3, stroke: col, 'stroke-width': 2 }, g);
    [[0, -9], [-8, 3], [8, 3]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 3.6, fill: col }, g)); }
  // 블랙박스 모델 상자 (트리 숲)
  function modelBox(cx, cy, w, h, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 12, fill: INK, opacity: op });
    for (let i = 0; i < 18; i++) { const c = i % 6, r = Math.floor(i / 6); tree(cx - w / 2 + 26 + c * ((w - 52) / 5), cy - h / 2 + 30 + r * 22, 0.8, OFF, op * 0.55); }
    tx(cx, cy + h / 2 - 16, o.name || 'loan_model · XGBoost', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: PANEL, opacity: op }); }

  // =========================================================
  // 1. 설명이 필요한 순간 — 데이터 → 분할 → 트리 300개 → 0.91 → 답 못하는 질문
  // =========================================================
  const COLS = ['연봉', '부채비율', '연체 이력', '근속연수', '신용조회', 'default'];
  const TX = 40, TY = 92, CW = 66, RH1 = 22, NR = 10;
  function table1(c, u) { const k = c.k;
    const yGap = k >= 2 ? 30 * E(k === 2 ? u : 3, 0.3, 1.1) : 0, yShift = k >= 1 ? 16 * E(k === 1 ? u : 3, 0.3, 0.9) : 0;
    const op = k === 5 ? 1 - E(u, 0.1, 0.6) : 1; if (op <= 0) return;
    const colX = (j) => TX + j * CW + (j === 5 ? yShift : 0);
    COLS.forEach((h, j) => { const isY = j === 5, hl = k >= 1, col = !hl ? INK : isY ? WARN : ACC;
      if (hl) rect(colX(j) + 2, TY - 24, CW - 4, 26, { fill: isY ? C.WARNBG : ACCBG, opacity: op * fade(k === 1 ? u : 3, 0.3) });
      tx(colX(j) + CW / 2, TY - 6, h, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col, class: isY ? 'mono' : null, opacity: op }); });
    for (let i = 0; i < NR; i++) { const a = k === 0 ? fade(u, 0.5 + i * 0.12, 0.25) : 1, isTest = i >= 8;
      const y = TY + 6 + i * RH1 + (isTest ? yGap : 0);
      COLS.forEach((_, j) => { const filled = k === 0 ? E(u, 0.5 + i * 0.12 + j * 0.03, 0.8 + i * 0.12 + j * 0.03) : 1;
        rect(colX(j) + 4, y + 4, (CW - 8) * filled, RH1 - 8, { rx: 3, fill: j === 5 ? C.WARNBG : SOFT, stroke: GRID, 'stroke-width': 1, opacity: op * a }); }); }
    if (k >= 1) { const a = op * fade(k === 1 ? u : 3, 0.9);
      el('path', { d: `M${TX + 4},${TY + 6 + NR * RH1 + yGap + 10} v8 H${TX + 5 * CW - 4} v-8`, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: a });
      lbl(TX + 2.5 * CW, TY + NR * RH1 + yGap + 46, 'X · 피처 5개', a, { fill: ACC });
      lbl(colX(5) + CW / 2, TY + NR * RH1 + yGap + 46, 'y (1=부도)', a, { fill: WARN }); }
    if (k >= 2) { const a = op * fade(k === 2 ? u : 3, 1.0);
      tx(TX + 6 * CW + yShift + 14, TY + 6 + 4 * RH1 + 4, 'X_train · 80%', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: a });
      tx(TX + 6 * CW + yShift + 14, TY + 6 + 9 * RH1 + yGap + 4, 'X_test · 20%', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: a }); }
    return { trainY: TY + 6 + 4 * RH1, testY: TY + 6 + 9 * RH1 + yGap, right: TX + 6 * CW + yShift }; }
  function s1(t, c) { const { k, u } = c;
    const tb = table1(c, u);
    if (k === 0) { card(780, 200, 230, 64, { rx: 10, stroke: INK, text: 'loan_applications.csv', fs: 15, mono: true, s: pop(u, 0.1) });
      for (let i = 0; i < 4; i++) dot([[665, 200], [TX + 6 * CW + 20, 140 + i * 30]], seg(u, 0.5 + i * 0.35, 1.1 + i * 0.35), ACC, 5);
      tx(780, 268, 'df = pd.read_csv(...)', { 'text-anchor': 'middle', 'font-size': 15, class: 'mono', fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 1) { tx(720, 170, '무엇으로 맞히나: X', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      tx(720, 210, '무엇을 맞히나: y = default', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      sub(720, 250, '연봉·부채비율·연체 이력·근속연수·신용조회', fade(u, 2.0), { 'font-size': 14 }); }
    if (k === 2) { const a = fade(u, 1.4);
      [['학습 80%', 170, 300], ['평가 20%', 250, 75]].forEach(([s, y, w], i) => { tx(640, y - 10, s, { 'font-size': 15, 'font-weight': 700, opacity: a, fill: i ? INFO : INK });
        rect(640, y, w * E(u, 1.4 + i * 0.2, 2.0 + i * 0.2), 20, { fill: SOFT, stroke: GRID });
        rect(640, y, w * 0.2 * E(u, 1.4 + i * 0.2, 2.0 + i * 0.2), 20, { fill: WARN, opacity: 0.85 }); });
      tx(640, 310, 'stratify=y → 두 쪽의 부도(주황) 비율이 같다', { 'font-size': 15, 'font-weight': 600, fill: WARN, opacity: fade(u, 2.2) }); }
    if (k >= 3) { const mop = k === 3 ? fade(u, 1.7, 0.5) : 1;
      if (k === 3) { for (let i = 0; i < 30; i++) { const cc = i % 10, rr = Math.floor(i / 10); tree(600 + cc * 32, 130 + rr * 40, 1, ACC, (1 - mop) * pop(u, 0.4 + i * 0.035)); }
        for (let i = 0; i < 3; i++) dot([[tb.right, tb.trainY], [600, 170]], seg(u, 0.2 + i * 0.25, 0.8 + i * 0.25), ACC, 5);
        tx(744, 270, '… 트리 300개 · max_depth=5', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, fill: MUT, opacity: (1 - mop) * fade(u, 1.0) }); }
      if (k <= 4) modelBox(744, 170, 300, 150, { op: mop });
      if (k === 3) tx(744, 290, '규칙을 손으로 따라 읽을 수 없다 → 블랙박스', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 4) { for (let i = 0; i < 3; i++) dot([[tb.right, tb.testY], [594, 200]], seg(u, 0.2 + i * 0.2, 0.8 + i * 0.2), INFO, 5);
      const acc = 0.91 * E(u, 0.9, 1.9);
      tx(600, 288, 'accuracy', { 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.9) });
      rect(600, 300, 288, 20, { fill: SOFT }); rect(600, 300, 288 * acc, 20, { fill: GOOD });
      mono(888, 288, acc.toFixed(2), { 'font-size': 20, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.9) });
      pill(744, 365, '배포 완료', GOOD, pop(u, 2.1), { fs: 15 }); }
    if (k === 5) { modelBox(744, 150, 300, 150, {});
      card(744, 270, 220, 44, { rx: 22, stroke: GOOD, text: 'accuracy 0.91', fs: 16, mono: true, color: GOOD });
      cross(870, 270, 12, pop(u, 2.2));
      const Q = [['고객센터', '고객 #7 은 왜 거절인가요?'], ['감독기관', '거절 사유를 서면으로 제시하라'], ['팀 리드', '엉뚱한 걸 보고 맞히는 건 아닌가?']];
      Q.forEach(([who, q], i) => { const y = 100 + i * 96, a = pop(u, 0.5 + i * 0.45);
        person(70, y, null, { s: 0.8 * a });
        tx(70, y + 44, who, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.45) });
        card(300, y + 4, 340, 48, { rx: 12, stroke: i === 2 ? WARN : INK, text: q, fs: 15, fw: 600, s: a }); });
      tx(744, 340, '정확도는 "무엇을 보고 맞혔는지" 말하지 않는다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); } }

  // =========================================================
  // 2. 내장 중요도 vs 순열 중요도 — 막대 두 묶음
  // =========================================================
  const CH = [{ x: 24, title: '(a) feature_importances_ · gain', sub: '학습 중 분기 기여 — 학습 관점', col: MUT },
    { x: 494, title: '(b) permutation · AUC 하락', sub: '섞었을 때 성능 하락 — 예측 관점', col: INFO }];
  const CHW = 442, CHY = 40, CHH = 300;
  function chart(i, rows, u0, o) { o = o || {}; const ch = CH[i], op = o.op ?? 1, x = ch.x;
    el('rect', { x, y: CHY, width: CHW, height: CHH, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.8, opacity: op });
    tx(x + 16, CHY + 26, ch.title, { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: op });
    tx(x + 16, CHY + 48, ch.sub, { 'font-size': 13.5, fill: MUT, opacity: op });
    const max = Math.max(0.0001, ...rows.map((r) => r.v));
    rows.forEach((r, j) => { const y = CHY + 76 + j * 42, g = u0 == null ? 1 : E(u0, 0.2 + j * 0.3, 0.7 + j * 0.3), hi = o.hi && o.hi(r, j);
      if (hi) rect(x + 8, y - 6, CHW - 16, 34, { rx: 6, fill: hi === 'warn' ? C.WARNBG : ACCBG, opacity: op });
      tx(x + 126, y + 15, r.label, { 'font-size': 15, 'font-weight': 600, 'text-anchor': 'end', opacity: op * (u0 == null ? 1 : fade(u0, 0.2 + j * 0.3)) });
      rect(x + 136, y + 2, 200 * (r.v / max) * g, 18, { fill: ch.col, opacity: op });
      if (g > 0.05) mono(x + 142 + 200 * (r.v / max) * g, y + 16, r.v.toFixed(2), { 'font-size': 14, 'font-weight': 700, fill: ch.col === MUT ? INK : INFO, opacity: op }); }); }
  function emptyRows(i, op) { const x = CH[i].x; for (let j = 0; j < 5; j++) rect(x + 136, CHY + 78 + j * 42, 200, 18, { fill: SOFT, opacity: op }); }
  function s2(t, c) { const { k, u } = c, b = c.beat.importance, pb = c.prev ? c.prev.importance : { builtin: [], permutation: [] };
    const dimAll = k === 6 ? 1 - 0.45 * E(u, 0.2, 0.8) : 1;
    if (b.builtin.length) chart(0, b.builtin, pb.builtin.length ? null : u, { op: dimAll, hi: k === 2 ? (r) => (r.label === '부채비율' && u > 0.3 ? 'acc' : r.label === '연봉' && u > 1.2 ? 'warn' : null) : null });
    else { chart(0, [], null, { op: fade(u, 0.1) }); emptyRows(0, fade(u, 0.3)); }
    if (b.permutation.length) chart(1, b.permutation, pb.permutation.length ? null : u, { op: dimAll });
    else { chart(1, [], null, { op: fade(u, k === 0 ? 0.6 : 0) }); if (k !== 3 && k !== 4) emptyRows(1, fade(u, k === 0 ? 0.8 : 0)); }
    if (k === 0) { pill(CH[0].x + CHW / 2, 372, '모델 안에 이미 있다 (공짜)', MUT, pop(u, 1.3), { fs: 14.5 });
      pill(CH[1].x + CHW / 2, 372, 'import permutation_importance', INFO, pop(u, 1.8), { fs: 14.5, mono: true }); }
    if (k === 2) { pill(CH[0].x + 410, CHY + 87, '1위', ACC, pop(u, 0.5), { fs: 14 });
      const y = CHY + 76 + 2 * 42; tx(CH[0].x + CHW / 2, 372, '연봉 0.19 — 올렸나? 내렸나?', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.3) });
      tx(CH[1].x + CHW / 2, 372, '부호(+/−)가 어디에도 없다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 3) { ['① 분기 기여 ≠ 예측 기여', '② 부호(+/−)가 없다', '③ 고유값 많은 피처 과대평가'].forEach((s, i) => {
      card(CH[1].x + CHW / 2, CHY + 104 + i * 64, 360, 48, { rx: 10, stroke: i === 2 ? MUT : WARN, fill: i === 2 ? SOFT : C.WARNBG, text: s, fs: 16, fw: 700, color: i === 2 ? INK : WARN, s: pop(u, 0.4 + i * 0.6) }); }); }
    if (k === 4) { const x0 = CH[1].x + 40, y0 = CHY + 78;
      tx(x0, y0 - 6, 'X_test 의 한 열', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      const perm = [3, 0, 5, 1, 4, 2], sh = E(u, 0.6, 1.4);
      for (let i = 0; i < 6; i++) { const y = lerp(y0 + 6 + i * 34, y0 + 6 + perm[i] * 34, sh);
        rect(x0, y, 120, 28, { rx: 5, fill: i % 2 ? INFO : C.INFOBG, stroke: INFO, opacity: 0.85 }); }
      tx(x0 + 60, y0 + 230, '연체 이력 섞기', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
      grow(x0 + 140, y0 + 100, x0 + 220, y0 + 100, E(u, 1.4, 1.8), INFO);
      card(x0 + 300, y0 + 100, 130, 64, { rx: 10, stroke: INFO, text: 'AUC ↓\n얼마나?', fs: 16, color: INFO, s: pop(u, 1.8) });
      tx(x0 + 300, y0 + 180, 'n_repeats=10 평균', { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 5) { pill(CH[0].x + 410, CHY + 87, '1위', MUT, 1, { fs: 14 }); pill(CH[1].x + 410, CHY + 87, '1위', INFO, pop(u, 2.0), { fs: 14 });
      tx(480, 376, '같은 모델, 1위가 다르다: 부채비율 ≠ 연체 이력', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.2) }); }
    if (k === 6) { banner(CH[0].x + 380, CHY + 34, '전역 평균', pop(u, 0.5)); banner(CH[1].x + 380, CHY + 34, '전역 평균', pop(u, 0.7));
      person(330, 380, null, { s: 0.7 * pop(u, 1.3) });
      tx(370, 386, '고객 #7 한 명은 왜?  →  필요: 1인 단위 + 부호', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) }); } }

  // =========================================================
  // 3. SHAP 원리 — 설명기 · 고객 1명 · 0.22 → 0.71 · 순서 평균 · 기여 몫 · 가법성
  // =========================================================
  const PX = (p) => 90 + p * 780;           // 확률 축 0 → 1
  function pAxis(y, op, bare) { el('line', { x1: PX(0), y1: y, x2: PX(1), y2: y, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    [0, 0.25, 0.5, 0.75, 1].forEach((v) => { el('line', { x1: PX(v), y1: y, x2: PX(v), y2: y + 6, stroke: MUT, opacity: op }); if (!bare || v === 0 || v === 1) mono(PX(v), y + 24, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); });
    tx(PX(1), y + 46, 'P(부도)', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600, opacity: op }); }
  function marker(p, y, label, col, op, up) { el('line', { x1: PX(p), y1: y - 34, x2: PX(p), y2: y, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: op });
    el('circle', { cx: PX(p), cy: y, r: 7, fill: col, opacity: op });
    mono(PX(p), y - 42, label, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { modelBox(480, 180, 300, 150, {});
      const g = E(u, 0.4, 1.4), x0 = 300, y0 = 75, w = 360, h = 210, per = 2 * (w + h);
      el('rect', { x: x0, y: y0, width: w, height: h, rx: 18, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': `${per * g} ${per}` });
      mono(480, 62, 'shap.TreeExplainer(model, …)', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(480, 320, '모델을 감싸기만 한다 — 다시 학습하지 않는다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.7) });
      pill(270, 370, 'TreeExplainer · 트리 전용 · 정확 · 빠름', GOOD, pop(u, 2.1), { fs: 14 });
      pill(700, 370, 'KernelExplainer · 모델 불문 · 느림', WARN, pop(u, 2.3), { fs: 14 }); }
    if (k === 1 || k === 2) { const sel = k === 2 ? E(u, 0.3, 1.0) : 0;
      // X_test 행들 (왼쪽) → 설명기 → shap_values 행렬 (오른쪽)
      tx(60, 66, 'X_test', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      for (let i = 0; i < 10; i++) { const a = k === 1 ? fade(u, 0.1 + i * 0.05) : 1, is7 = i === 7;
        rect(60, 78 + i * 24, 190, 18, { rx: 4, fill: is7 && sel > 0 ? ACCBG : SOFT, stroke: is7 && sel > 0 ? ACC : GRID, 'stroke-width': is7 && sel > 0 ? 2.2 : 1, opacity: a }); }
      mono(260, 78 + 7 * 24 + 14, '#7', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: sel });
      el('rect', { x: 345, y: 120, width: 150, height: 110, rx: 14, fill: INK });
      el('rect', { x: 339, y: 114, width: 162, height: 122, rx: 16, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      tx(420, 170, 'Tree', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: PANEL }); tx(420, 192, 'Explainer', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: PANEL });
      if (k === 1) for (let i = 0; i < 4; i++) dot([[255, 120 + i * 50], [345, 175], [500, 175], [600, 120 + i * 50]], seg(u, 0.3 + i * 0.25, 1.3 + i * 0.25), ACC, 5);
      // 행렬: 행 = 표본, 열 = 피처, 빨강 = +, 파랑 = −
      const mx = 610, my = 78, cw = 56;
      ['연체', '부채', '연봉', '조회', '근속'].forEach((s, j) => tx(mx + j * cw + cw / 2, my - 10, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT }));
      for (let i = 0; i < 10; i++) BEES.forEach((f, j) => { const v = f.dots[(i * 3 + j * 7) % 10][0], a = k === 1 ? fade(u, 1.0 + i * 0.1, 0.3) : 1;
        rect(mx + j * cw + 2, my + i * 24, cw - 4, 18, { rx: 3, fill: v >= 0 ? BAD : INFO, opacity: a * (0.15 + 0.85 * Math.min(1, Math.abs(v) / 0.3)) }); });
      mono(mx + 140, my + 262, 'shap_values · 테스트셋 전체', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 2.0) : 1 });
      if (k === 2) { const y = lerp(78 + 7 * 24, 330, sel);
        if (sel > 0.95) { mono(60, 322, 'customer = X_test.iloc[[7]]', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
          FEATS.forEach((f, i) => { const order = [0, 1, 2, 3, 4][i], x = 60 + [0, 140, 270, 410, 580][order];
            card(x + [126, 116, 126, 156, 106][i] / 2, 362, [126, 116, 126, 156, 106][i], 34, { rx: 8, stroke: ACC, text: `${f.short === '조회' ? '신용조회' : f.short === '연체' ? '연체 이력' : f.label} ${f.value}`, fs: 14, fw: 600, s: pop(u, 1.1 + i * 0.15) }); });
          tx(930, 368, '→ "이 한 명이 왜"', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 2.0) }); }
        else rect(60, y, 190, 18, { rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2 }); } }
    if (k === 3) { const y = 250; pAxis(y, fade(u, 0.1));
      marker(BASE, y, 'base 0.22', MUT, fade(u, 0.5)); tx(PX(BASE), y + 70, '아무 정보 없을 때의 평균', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      marker(FINAL, y, 'f(x) 0.71', BAD, fade(u, 1.1));
      const g = E(u, 1.6, 2.3);
      el('path', { d: `M${PX(BASE)},${y - 70} v-10 H${lerp(PX(BASE), PX(FINAL), g)} v10`, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      mono((PX(BASE) + PX(FINAL)) / 2, y - 92, '설명할 간격 0.49', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      mono(60, 60, '고객 #7', { 'font-size': 16, 'font-weight': 800, fill: ACC }); }
    if (k === 4) { // 순서를 바꾸면 한계 기여가 달라진다 → 모든 순서 평균
      const orders = [[0, 1, 2, 3, 4], [1, 2, 3, 4, 0]], lens = [150, 70];
      orders.forEach((ord, r) => { const y = 92 + r * 120, a = fade(u, 0.2 + r * 0.9);
        tx(40, y - 18, r === 0 ? '순서 ① 연체 이력이 맨 먼저' : '순서 ② 연체 이력이 맨 나중', { 'font-size': 15, 'font-weight': 700, opacity: a });
        ord.forEach((fi, j) => { const f = FEATS[fi], on = fi === 0;
          card(80 + j * 92, y + 22, 82, 34, { rx: 8, stroke: on ? BAD : GRID, fill: on ? C.BADBG : PANEL, text: f.short, fs: 15, fw: 700, color: on ? BAD : MUT, s: pop(u, 0.3 + r * 0.9 + j * 0.08) }); });
        const bx = 560, g = E(u, 0.7 + r * 0.9, 1.2 + r * 0.9);
        tx(bx, y - 18, '연체 이력 합류 전후 예측 차이', { 'font-size': 14, fill: MUT, opacity: a });
        rect(bx, y + 12, lens[r] * g, 22, { fill: BAD, opacity: 0.85 }); });
      const ay = 330; el('line', { x1: 40, y1: ay - 34, x2: 920, y2: ay - 34, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 2.0) });
      mono(40, ay, 'φ(연체 이력) = 120가지(5!) 순서의 평균 기여', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) });
      tx(40, ay + 34, '한 순서만 보면 먼저 들어간 피처가 몫을 독차지한다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.4) }); }
    if (k >= 5) { const y = 230; pAxis(y, 1, true);
      marker(BASE, y, 'base 0.22', MUT, 1);
      // force plot: 빨강은 오른쪽으로 밀고, 파랑은 왼쪽으로 당긴다 (한 줄에 이어 붙임)
      let cum = BASE; const order = [0, 1, 2, 3, 4], chipX = [150, 320, 490, 650, 810];
      order.forEach((fi, j) => { const f = FEATS[fi], from = cum, to = cum + f.shap; cum = to;
        const g = k === 5 ? E(u, 0.3 + j * 0.35, 0.65 + j * 0.35) : 1, lane = f.shap >= 0 ? y - 26 : y - 12, x1 = PX(from), x2 = lerp(PX(from), PX(to), g);
        if (g > 0) el('rect', { x: Math.min(x1, x2), y: lane - 8, width: Math.abs(x2 - x1), height: 14, rx: 3, fill: dirCol(f.shap), opacity: 0.88 });
        const a = k === 5 ? fade(u, 0.3 + j * 0.35) : 1, cx = chipX[j];
        el('line', { x1: (PX(from) + PX(to)) / 2, y1: lane + 8, x2: cx, y2: 300, stroke: dirCol(f.shap), 'stroke-width': 1.5, 'stroke-dasharray': '3 3', opacity: a });
        card(cx, 318, 150, 34, { rx: 8, stroke: dirCol(f.shap), text: `${f.short === '조회' ? '신용조회' : f.label} ${sgn(f.shap)}`, fs: 14.5, fw: 700, color: dirCol(f.shap), op: a }); });
      const pNow = k === 5 ? FEATS.reduce((s, f, j) => s + f.shap * E(u, 0.3 + j * 0.35, 0.65 + j * 0.35), BASE) : FINAL;
      el('circle', { cx: PX(pNow), cy: y, r: 8, fill: INK });
      if (k === 5) mono(PX(pNow), y - 52, pNow.toFixed(2), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
      if (k === 5) tx(480, 390, '빨강 = 부도 확률을 밀어 올림 · 파랑 = 끌어내림', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
      if (k === 6) { marker(FINAL, y, 'f(x) 0.71', BAD, fade(u, 0.2));
        const g = E(u, 0.5, 1.2); el('path', { d: `M${PX(BASE)},${y - 92} v-8 H${lerp(PX(BASE), PX(FINAL), g)} v8`, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
        mono((PX(BASE) + PX(FINAL)) / 2, y - 110, '기여 합 0.49 = 간격 0.49', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
        R.spans(480 - tw('0.22 + 0.31 + 0.18 + 0.09 − 0.07 − 0.02 = 0.71 ✓', 16) / 2, 384, [['0.22', { fill: MUT }], [' + 0.31 + 0.18 + 0.09', { fill: BAD }], [' − 0.07 − 0.02', { fill: INFO }], [' = 0.71 ✓', { fill: GOOD }]], { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) }); } } }

  // =========================================================
  // 4. waterfall(한 명) → beeswarm(전체)
  // =========================================================
  const WX = (p) => 300 + (p - 0.1) * 800;      // 0.1 → 300, 0.8 → 860
  const WROW = (i) => 96 + i * 46;                  // i = 0(맨 위, 연체) … 4(근속)
  function waterfall(u, k, op) { op = op ?? 1;
    // 아래(근속)부터 쌓아 올린다: 0.22 → 0.20 → 0.13 → 0.22 → 0.40 → 0.71
    const cums = []; let cum = BASE; for (let i = 4; i >= 0; i--) { cums[i] = [cum, cum + FEATS[i].shap]; cum += FEATS[i].shap; }
    const ay = 340; el('line', { x1: WX(0.1), y1: ay, x2: WX(0.8), y2: ay, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].forEach((v) => { el('line', { x1: WX(v), y1: ay, x2: WX(v), y2: ay + 5, stroke: MUT, opacity: op }); mono(WX(v), ay + 21, v.toFixed(1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); });
    el('line', { x1: WX(BASE), y1: WROW(4) + 24, x2: WX(BASE), y2: ay, stroke: MUT, 'stroke-dasharray': '4 4', opacity: op });
    mono(WX(BASE), ay + 44, 'E[f(X)] = 0.22', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: op });
    for (let i = 4; i >= 0; i--) { const f = FEATS[i], [a, b] = cums[i], g = k === 0 ? E(u, 0.3 + (4 - i) * 0.32, 0.6 + (4 - i) * 0.32) : 1, y = WROW(i);
      tx(282, y + 6, `${f.label} = ${f.value}`, { 'font-size': 14.5, 'font-weight': 600, 'text-anchor': 'end', opacity: op * (k === 0 ? fade(u, 0.2 + (4 - i) * 0.32) : 1) });
      if (g <= 0) continue; const x1 = WX(a), x2 = lerp(WX(a), WX(b), g), dir = Math.sign(b - a), lo = Math.min(x1, x2), hi = Math.max(x1, x2), tip = Math.min(8, hi - lo);
      el('path', { d: dir > 0 ? `M${lo},${y - 11} H${hi - tip} L${hi},${y} L${hi - tip},${y + 11} H${lo} Z` : `M${hi},${y - 11} H${lo + tip} L${lo},${y} L${lo + tip},${y + 11} H${hi} Z`, fill: dirCol(f.shap), opacity: op * 0.9 });
      mono(Math.max(WX(a), WX(b)) + 8, y + 5, sgn(f.shap), { 'font-size': 14.5, 'font-weight': 800, fill: dirCol(f.shap), opacity: op * g });
      if (i > 0) el('line', { x1: WX(b), y1: y - 12, x2: WX(b), y2: WROW(i - 1) + 12, stroke: GRID, 'stroke-dasharray': '3 3', opacity: op * g }); }
    const top = k === 0 ? fade(u, 1.95) : 1;
    el('line', { x1: WX(FINAL), y1: WROW(0) - 12, x2: WX(FINAL), y2: 60, stroke: INK, 'stroke-width': 2, opacity: op * top });
    mono(WX(FINAL), 50, 'f(x) = 0.71', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: op * top }); }
  const BX = (s) => 250 + ((s + 0.2) / 0.6) * 640, BROW = (i) => 104 + i * 44;
  function beeswarm(u, k, op) {
    const ay = 330; el('line', { x1: BX(-0.2), y1: ay, x2: BX(0.4), y2: ay, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    el('line', { x1: BX(0), y1: 78, x2: BX(0), y2: ay, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    [-0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4].forEach((v) => mono(BX(v), ay + 20, (v > 0 ? '+' : '') + v.toFixed(1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }));
    tx(BX(-0.2), ay + 44, '← 확률 내림 (승인)', { 'font-size': 14, fill: INFO, 'font-weight': 600, opacity: op });
    tx(BX(0.4), ay + 44, '확률 올림 (거절) →', { 'font-size': 14, fill: BAD, 'font-weight': 600, 'text-anchor': 'end', opacity: op });
    BEES.forEach((f, i) => { const y = BROW(i), a = k === 3 ? fade(u, 0.5 + i * 0.12) : 1, cust = FEATS.find((x) => x.label === f.label);
      tx(232, y + 5, f.label, { 'font-size': 15, 'font-weight': 600, 'text-anchor': 'end', opacity: op * a });
      el('line', { x1: BX(-0.2), y1: y, x2: BX(0.4), y2: y, stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '2 5', opacity: op * a });
      f.dots.forEach(([x, v], j) => { const s = k === 3 ? E(u, 1.1 + j * 0.08 + i * 0.05, 1.6 + j * 0.08 + i * 0.05) : 1; if (s <= 0) return;
        vdot(lerp(BX(cust.shap), BX(x), s), y + ((j % 3) - 1) * 8, 6, v, op * s); });
      if (k === 3) { const ring = fade(u, 0.6 + i * 0.12) * (1 - fade(u, 2.2)); el('circle', { cx: BX(cust.shap), cy: y, r: 9, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: ring }); } }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) waterfall(u, k, 1);
    if (k === 0) tx(40, 50, 'waterfall · 고객 #7', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.1) });
    if (k === 1) { const fl = E(u, 0.2, 0.5) * (1 - E(u, 0.6, 1.0));
      el('rect', { x: 30, y: 30, width: 900, height: 340, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: Math.max(fl, fade(u, 0.2) * 0.6), 'stroke-dasharray': '8 6' });
      fly(470, 200, 640, 398, seg(u, 0.8, 1.7), 'waterfall_customer7.png', { stay: true, mono: true });
      tx(758, 403, '→ 심사 기록에 첨부', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
      tx(40, 50, 'waterfall · 고객 #7', { 'font-size': 16, 'font-weight': 800, fill: ACC }); }
    if (k === 2) { const g = E(u, 0.3, 0.9);
      el('line', { x1: WX(THR), y1: 340, x2: WX(THR), y2: lerp(340, 60, g), stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 5' });
      tx(WX(THR) - 8, 74, '임계 0.5', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.9) });
      pill(590, 42, '0.71 > 0.5 → 거절', BAD, pop(u, 1.3), { fs: 14.5 });
      el('rect', { x: 36, y: WROW(0) - 18, width: 890, height: 36, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.9) });
      tx(40, 50, '최대 거절 요인 = 연체 이력', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) }); }
    if (k >= 3) { if (k === 3) waterfall(u, 2, 1 - E(u, 0.1, 0.5));
      const a = k === 3 ? fade(u, 0.5) : 1; beeswarm(u, k, a);
      tx(40, 50, k === 3 ? 'beeswarm · 1명 → 테스트셋 전체' : 'beeswarm · 테스트셋 전체', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: a });
      // 범례: 피처값 낮음(파랑) → 높음(빨강)
      [0, 0.25, 0.5, 0.75, 1].forEach((v, i) => vdot(700 + i * 18, 44, 6, v, a));
      tx(690, 49, '피처값 낮음', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'end', 'font-weight': 600, opacity: a });
      tx(800, 49, '높음', { 'font-size': 13.5, fill: BAD, 'font-weight': 600, opacity: a }); }
    if (k === 4) { const a1 = fade(u, 0.3), a2 = fade(u, 1.0), a3 = fade(u, 1.7);
      grow(30, 96, 30, 290, E(u, 0.3, 0.8), ACC); tx(40, 80, '① 세로 = 평균 |SHAP| 순 (중요도)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: a1 });
      el('path', { d: `M${BX(-0.05)},${BROW(0) - 18} v-6 H${BX(0.36)} v6`, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: a2 });
      tx((BX(-0.05) + BX(0.36)) / 2, BROW(0) - 30, '② 가로 퍼짐 = 영향력', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: a2 });
      el('rect', { x: BX(-0.2) - 6, y: BROW(2) - 16, width: BX(0.4) - BX(-0.2) + 12, height: 32, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: a3 });
      tx(BX(-0.2), 400, '③ 연봉: 빨간 점(고연봉)이 왼쪽 → 값이 클수록 부도 확률 ↓', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 5) { const y = BROW(2);
      check(BX(0.4) + 24, y, 10, pop(u, 0.4)); tx(BX(0.4) - 4, y - 14, '상식과 일치', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.5) });
      card(480, 396, 760, 40, { rx: 10, stroke: WARN, fill: C.WARNBG, text: '반대 방향이 보이면? → 데이터 누수·잘못된 피처를 의심 (Step 5)', fs: 15.5, fw: 700, color: WARN, s: pop(u, 1.4) }); } }

  // =========================================================
  // 5. 사유 자동 생성 · 누수 게이트 · 한계
  // =========================================================
  const TPL = [['delinq_count', '최근 연체 이력이 심사 기준을 초과했습니다'], ['debt_ratio', '소득 대비 부채 비율이 높습니다'], ['recent_inquiries', '최근 3개월 신용조회가 잦습니다'],
    ['annual_income', '소득 수준이 기준에 미달합니다'], ['years_employed', '근속 기간이 짧습니다']];
  const FX = 765, SLOT = (i) => 196 + i * 60;
  function fnBox(u, appear) { const g = R.G(FX, 110, appear ?? 1);
    el('rect', { x: -165, y: -42, width: 330, height: 84, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }, g);
    mono(0, -10, 'top_rejection_reasons(', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }, g);
    mono(0, 16, 'explainer, customer, k=3)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }, g); }
  function slot(i, r, o) { o = o || {}; const y = SLOT(i), op = o.op ?? 1;
    el('rect', { x: FX - 165, y: y - 26, width: 330, height: 52, rx: 10, fill: r ? PANEL : SOFT, stroke: r ? GOOD : GRID, 'stroke-width': r ? 2.2 : 1.5, 'stroke-dasharray': r ? null : '5 4', opacity: op });
    if (!r) { mono(FX, y + 5, o.schema || '', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: op }); return; }
    el('circle', { cx: FX - 145, cy: y, r: 11, fill: GOOD, opacity: op }); mono(FX - 145, y + 5, String(r.rank), { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: op });
    tx(FX - 126, y - 4, r.text, { 'font-size': 13.5, 'font-weight': 700, opacity: op });
    tx(FX - 126, y + 17, r.label, { 'font-size': 13.5, fill: MUT, opacity: op });
    mono(FX + 155, y + 17, r.shap, { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: op }); }
  function contribs(u, k, op) { // 왼쪽: 고객 #7 의 부호 있는 기여
    const zx = 250; el('line', { x1: zx, y1: 64, x2: zx, y2: 300, stroke: MUT, 'stroke-width': 1.5, opacity: op });
    mono(40, 52, 'contrib = sv.values[0]', { 'font-size': 14.5, 'font-weight': 700, opacity: op });
    FEATS.forEach((f, i) => { const y = 84 + i * 46, neg = f.shap < 0, gone = neg && k >= 3 ? E(k === 3 ? u : 3, 0.8, 1.3) : 0, a = op * (1 - 0.65 * gone);
      tx(zx - 14 - (neg ? f.shap * -560 : 0), y + 5, f.label, { 'font-size': 14.5, 'font-weight': 600, 'text-anchor': 'end', opacity: a });
      const w = Math.abs(f.shap) * 560; rect(neg ? zx - w : zx, y - 10, w, 20, { fill: dirCol(f.shap), opacity: a * 0.9 });
      mono(neg ? zx + 8 : zx + w + 8, y + 5, sgn(f.shap), { 'font-size': 14, 'font-weight': 800, fill: dirCol(f.shap), opacity: a });
      if (neg && gone > 0) { el('line', { x1: 40, y1: y, x2: 430, y2: y, stroke: OFF, 'stroke-width': 2, opacity: op * gone }); } });
    if (k === 3) tx(40, 330, 'contrib > 0 만 남긴다 — 승인 방향(파랑)은 제외', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) }); }
  function s5(t, c) { const { k, u } = c, rs = c.beat.reasons || [], prs = c.prev ? c.prev.reasons || [] : [];
    if (k <= 2) { const op = k === 0 ? 1 : 0.45;
      mono(40, 56, 'REASON_TEMPLATES', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.1) : op });
      TPL.forEach(([f, s], i) => { const y = 92 + i * 50, a = (k === 0 ? fade(u, 0.3 + i * 0.3) : 1) * op;
        rect(36, y - 20, 540, 40, { rx: 8, fill: i % 2 ? PANEL : SOFT, stroke: GRID, opacity: a });
        mono(50, y + 5, f, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: a });
        tx(220, y + 5, s, { 'font-size': 14.5, opacity: a }); });
      if (k === 0) { pill(FX, 140, '피처명 → 사람 말', ACC, pop(u, 1.9), { fs: 15 }); tx(FX, 200, '문구는 심사 부서가 한곳에서 관리', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); } }
    if (k >= 1 && k <= 4) fnBox(u, k === 1 ? pop(u, 0.2) : 1);
    if (k === 1) { fly(560, 40, FX - 60, 70, seg(u, 0.8, 1.4), 'explainer', { mono: true, stay: false });
      fly(560, 360, FX + 40, 150, seg(u, 1.1, 1.7), 'customer (1행)', { mono: true, stay: false });
      [0, 1, 2].forEach((i) => slot(i, null, { op: fade(u, 1.8 + i * 0.15) }));
      tx(FX, SLOT(2) + 54, '기본 k=3 · 규제 서식대로', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 2) { [0, 1, 2].forEach((i) => slot(i, null, { schema: '{feature, shap, reason}', op: fade(u, 0.3 + i * 0.3) }));
      grow(FX + 190, SLOT(0) - 20, FX + 190, SLOT(2) + 20, E(u, 1.4, 2.0), GOOD);
      tx(FX - 190, SLOT(2) + 54, 'Returns: 기여 내림차순 목록', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) }); }
    if (k === 3 || k === 4) { contribs(u, k === 4 ? 5 : k, 1);
      [0, 1, 2].forEach((i) => { const r = rs[i], isNew = r && !prs[i];
        if (r) { if (isNew) fly(430, 84 + i * 46, FX, SLOT(i), seg(u, (k === 3 ? 1.6 : 0.4 + i * 0.5), (k === 3 ? 2.1 : 0.9 + i * 0.5)), r.label, { fill: BAD });
          slot(i, r, { op: isNew ? fade(u, k === 3 ? 2.1 : 0.9 + i * 0.5) : 1 }); }
        if (!r || (isNew && u < (k === 3 ? 2.1 : 0.9 + i * 0.5))) slot(i, null, { schema: '{feature, shap, reason}', op: 0.6 }); }); }
    if (k === 5) { const out = ['[{"feature": "delinq_count", "shap": 0.31},', ' {"feature": "debt_ratio",   "shap": 0.18},', ' {"feature": "recent_inquiries", "shap": 0.09}]'];
      el('rect', { x: 30, y: 70, width: 540, height: 130, rx: 10, fill: INK });
      out.forEach((s, i) => mono(46, 108 + i * 32, s.slice(0, Math.round(s.length * E(u, 0.2 + i * 0.35, 0.6 + i * 0.35))), { 'font-size': 14, fill: 'var(--term)' }));
      mono(46, 56, 'print(top_rejection_reasons(...))', { 'font-size': 14.5, 'font-weight': 700 });
      const dy = 1 - E(u, 1.2, 1.8);
      el('rect', { x: FX - 180, y: 112 + dy * 20, width: 360, height: 240, rx: 12, fill: C.GOODBG, stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 1.2) });
      tx(FX - 160, 140 + dy * 20, '거절 사유서 · 고객 #7', { 'font-size': 15.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
      rs.forEach((r, i) => slot(i, r, { op: fade(u, 1.5 + i * 0.15) }));
      tx(300, 260, '0.31 / 0.18 / 0.09', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, class: 'mono', fill: BAD, opacity: fade(u, 2.0) });
      tx(300, 296, '규제 서식 3항목이 그대로 채워진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); }
    if (k === 6) { // 누수 게이트: 전역 SHAP 1위가 심사 후에야 채워지는 값이면 배포 차단
      mono(30, 52, 'shap_values.abs.mean(0) 순위', { 'font-size': 14.5, 'font-weight': 700 });
      const rows = [['approval_flag', 1, BAD], ['연체 이력', 0.38, MUT], ['부채비율', 0.27, MUT], ['연봉', 0.2, MUT]];
      rows.forEach(([n, v, col], i) => { const y = 82 + i * 40, g = E(u, 0.2 + i * 0.15, 0.7 + i * 0.15);
        tx(170, y + 14, n, { 'font-size': 14.5, 'font-weight': 700, fill: i === 0 ? BAD : INK, 'text-anchor': 'end', class: i === 0 ? 'mono' : null });
        rect(182, y, 360 * v * g, 20, { fill: col, opacity: 0.85 }); });
      tx(182, 72 + 4 * 40 + 6, '↑ 심사 결과 이후에나 채워지는 값이 1위', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) });
      card(290, 296, 520, 44, { rx: 10, stroke: BAD, fill: C.BADBG, text: 'assert top1 not in FUTURE_ONLY_FIELDS', fs: 15, mono: true, color: BAD, s: pop(u, 1.1) });
      pill(290, 360, '누수! 배포 차단', BAD, pop(u, 1.5), { fs: 15.5 });
      const L = c.beat.limits || [], LC = { '주의': WARN, '중요': BAD, '원칙': ACC };
      tx(610, 52, '한계와 운용 원칙', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.6) });
      L.forEach((l, i) => { const y = 100 + i * 78, a = pop(u, 1.7 + i * 0.2), col = LC[l.level] || INK, parts = l.desc.split(/ — | \/ /);
        card(782, y, 344, 70, { rx: 10, stroke: col, s: a });
        tx(624, y - 12, l.name, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.7 + i * 0.2) });
        mono(940, y - 12, l.level, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: fade(u, 1.7 + i * 0.2) });
        parts.slice(0, 2).forEach((s, j) => tx(624, y + 8 + j * 19, s, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8 + i * 0.2) })); }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: "홀드아웃 정확도 91%인 대출 심사 모델이 답하지 못하는 질문은 무엇인가?",
      o: ["test에서 얼마나 맞히는가?", "이 고객은 무엇 때문에 거절됐는가?", "평가 데이터를 어떻게 나눴는가?"], a: 1,
      why: "정확도는 얼마나 맞히는지만 말할 뿐 무엇을 보고 판단했는지는 말하지 않는다. 고객센터·감독기관·팀 리드의 질문이 모두 이 \"왜\"를 묻는다." },
    { q: "내장 중요도(feature_importances_)를 거절 사유로 쓸 수 없는 이유는 무엇인가?",
      o: ["방향(부호)이 없어 확률을 올렸는지 내렸는지 알 수 없어서", "계산이 너무 느려서", "테스트셋으로만 계산돼서"], a: 0,
      why: "\"연봉 0.19, 중요하다\"까지만 말한다. 게다가 학습 중 분기 기여(gain) 관점이라 순열 중요도와는 1위부터 다르다." },
    { q: "고객 #7의 base value가 0.22, 예측이 0.71일 때 SHAP값에 대해 항상 성립하는 것은 무엇인가?",
      o: ["모든 피처의 SHAP값이 양수다", "가장 큰 SHAP값이 0.71이다", "모든 피처의 SHAP값을 더하면 0.49(= 0.71 − 0.22)다"], a: 2,
      why: "가법성 덕분에 base 0.22 + 기여 합 = 0.71이 정확히 맞는다. 연봉 −0.07처럼 음수 기여도 함께 더해진다." },
    { q: "beeswarm의 한 피처 행에서 빨간 점이 오른쪽에 몰려 있다면 무슨 뜻인가?",
      o: ["그 피처의 전역 중요도가 가장 낮다", "그 피처값이 높을수록 부도 확률을 올린다", "그 피처에 결측값이 많다"], a: 1,
      why: "점 색은 피처값의 높낮이(빨강 = 높음), 가로 위치는 SHAP값이다. 연봉은 반대로 빨간 점이 왼쪽에 있어 높을수록 확률을 내린다." },
    { q: "거절 사유 top-3를 만들 때 SHAP값에서 무엇을 고르나?",
      o: ["양(+)의 기여만 남겨 큰 순서로 3개", "부호와 상관없이 절대값이 큰 순서로 3개", "내장 중요도 상위 3개"], a: 0,
      why: "거절 사유서에는 확률을 미는 힘만 쓴다. 고객 #7은 연체 이력 0.31, 부채비율 0.18, 신용조회 0.09가 나온다." },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '정확도 91%는 이 고객이 왜 거절됐는지 말해 주지 않는다.',
    '내장 중요도는 방향이 없고, 순열 중요도와 1위부터 다르다.',
    'SHAP은 예측을 피처별 몫으로 나눈다. base 0.22에 기여를 더하면 정확히 0.71이 된다.',
    'waterfall로 한 명의 사유를, beeswarm으로 전체 방향을 읽고 거절 사유 3개를 자동으로 뽑는다.',
  ];
  const review = [
    { q: '배포 전 beeswarm을 그렸더니 1위 피처가 심사가 끝난 뒤에야 알 수 있는 값이다. 어떻게 하나?',
      o: ['누수로 보고 배포를 막는다', '가장 중요한 피처이니 그대로 둔다', '내장 중요도로 다시 확인하고 배포한다'], a: 0,
      why: 'SHAP 1위가 심사 시점에 없는 값이면 점수가 미래 정보에서 나온 것이다. 배포 전 게이트에서 막아야 실전에서 무너지지 않는다.' },
    { q: '고객이 연봉이 높은데 왜 거절됐냐고 묻는다. 답하려면 무엇을 봐야 하나?',
      o: ['내장 중요도에서 연봉의 순위', '그 고객 waterfall의 피처별 기여', 'beeswarm에서 연봉 행의 점 색'], a: 1,
      why: '연봉은 -0.07로 승인 쪽으로 당겼지만 연체 이력 +0.31 같은 미는 힘이 더 커서 0.5를 넘었다. 한 명의 사유는 waterfall이 보여 주고, 나머지 둘은 전체 이야기다.' },
    { q: 'SHAP 결과만 보고 고객에게 부채비율을 낮추면 승인된다고 안내하려 한다. 무엇이 문제인가?',
      o: ['SHAP값에는 부호가 없어서', 'SHAP은 모델 기여를 나눌 뿐 인과는 아니라서', 'base value가 고객마다 바뀌어서'], a: 1,
      why: 'SHAP은 이 모델이 예측을 어떻게 만들었는지 나눠 보여 줄 뿐, 값을 바꾸면 현실이 어떻게 될지는 말하지 않는다. 서로 얽힌 피처가 있으면 해석은 더 흔들린다.' },
  ];

  RA.page({ title: '대출 심사 모델 — 해석 보드', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
