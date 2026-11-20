/* III-2-2 이상 탐지 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 산점도는 페이지의 NORMAL_PTS · OFF_DIAG · EXTREME · IFOREST_SPLITS (0~100, y 아래 방향), 거래 목록은 TX_ROWS 를 쓴다.
 * 숫자는 캡션·코드 주석에 있는 것만 쓴다 (1,000,000 · 998,973 · 1,027 · 0.999 · 12 · 3 · 50 · 500 · -0.71 · -0.58). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, axes, line, hbar, person, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const hsh = (i) => { const s = Math.sin((i + 1) * 91.17) * 43758.5453; return s - Math.floor(s); };
  const D = () => (typeof NORMAL_PTS === 'undefined' ? null : { N: NORMAL_PTS, O: OFF_DIAG, X: EXTREME, SPL: IFOREST_SPLITS, TX: TX_ROWS });
  function xm(x, y, r, col, op) { el('path', { d: `M${x - r},${y - r} L${x + r},${y + r} M${x + r},${y - r} L${x - r},${y + r}`, stroke: col || BAD, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: op ?? 1 }); }
  const right = (x, y, s, o) => tx(x, y, s, Object.assign({ 'font-size': 15 }, o || {}));

  // 산점도 틀: 데이터 0~100 (y 아래 방향) → 무대
  const SX = (v) => 70 + v * 3.9, SY = (v) => 20 + v * 3.55;
  function frame(op) { el('rect', { x: 40, y: 12, width: 440, height: 380, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op ?? 1 });
    el('line', { x1: SX(6), y1: SY(94), x2: SX(98), y2: SY(94), stroke: MUT, 'stroke-width': 1.6 }); el('line', { x1: SX(6), y1: SY(94), x2: SX(6), y2: SY(2), stroke: MUT, 'stroke-width': 1.6 });
    tx(SX(98), SY(94) + 22, '거래 금액 →', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
    tx(SX(6) + 8, SY(2) + 8, '계정 사용 기간', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); }
  function pts(d, o) { o = o || {}; d.N.forEach(([x, y], i) => el('circle', { cx: SX(x), cy: SY(y), r: 6 * (o.s ? o.s(i) : 1), fill: o.ncol ? o.ncol(i) : ACC, opacity: (o.nop ?? 0.85) }));
    if (o.off !== false) el('circle', { cx: SX(d.O[0]), cy: SY(d.O[1]), r: 8 * (o.os ?? 1), fill: WARN, stroke: PANEL, 'stroke-width': 1.5, opacity: o.oop ?? 1 });
    if (o.ext !== false) el('circle', { cx: SX(d.X[0]), cy: SY(d.X[1]), r: 8 * (o.xs ?? 1), fill: BAD, stroke: PANEL, 'stroke-width': 1.5, opacity: o.xop ?? 1 }); }
  // 회전 타원 (데이터 좌표, SVG rotate 각도)
  function ellPts(cx, cy, rx, ry, deg, g) { const a = deg * Math.PI / 180, out = []; for (let i = 0; i <= 60 * (g ?? 1); i++) { const t = i / 60 * 2 * Math.PI, x = rx * Math.cos(t), y = ry * Math.sin(t); out.push([cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)]); } return out; }
  function inside(p, cx, cy, rx, ry, deg) { const a = -deg * Math.PI / 180, dx = p[0] - cx, dy = p[1] - cy, x = dx * Math.cos(a) - dy * Math.sin(a), y = dx * Math.sin(a) + dy * Math.cos(a); return (x / rx) ** 2 + (y / ry) ** 2 <= 1; }
  function ellipse(rx, ry, o) { o = o || {}; const P = ellPts(46, 53, rx, ry, -31, o.g); if (P.length < 2) return;
    el('polyline', { points: P.map(([x, y]) => `${SX(x)},${SY(y)}`).join(' '), fill: o.fill ? o.fill : 'none', 'fill-opacity': o.fo ?? 0.1, stroke: o.col || INFO, 'stroke-width': o.sw || 2.5, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); }

  // ---------- 1. 문제의 특수성 ----------
  function s1(t, c) { const { k, u } = c, d = D(); if (!d) return;
    if (k === 0) { d.TX.forEach((r, i) => { const y = 34 + i * 46, op = fade(u, 0.2 + i * 0.12);
        el('rect', { x: 40, y, width: 420, height: 40, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
        tx(56, y + 26, r.desc, { 'font-size': 15, 'font-weight': 700, opacity: op }); pill(420, y + 20, '라벨 ?', MUT, op, { fs: 13.5 }); });
      mono(700, 150, Math.round(1000000 * E(u, 0.3, 1.8)).toLocaleString('en-US'), { 'font-size': 40, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      lbl(700, 190, '건의 거래 로그', fade(u, 0.5), { 'font-size': 17 });
      mono(700, 270, 'df["is_fraud"].value_counts()', { 'font-size': 15.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(700, 300, '먼저 볼 것: 라벨이 몇 개인가', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1 || k === 5) { // 와플: 1칸 = 1,000건, 1000칸 중 사기는 1칸
      const cols = 50, cs = 8.2, x0 = 40, y0 = 40, fill = k === 1 ? E(u, 0.2, 1.6) * 1000 : 1000;
      for (let i = 0; i < 1000; i++) { if (i >= fill) break; const r = Math.floor(i / cols), cc = i % cols, fraud = i === 999;
        el('rect', { x: x0 + cc * cs, y: y0 + r * cs * 1.0, width: cs - 1.5, height: cs - 1.5, fill: fraud ? BAD : k === 5 && u > 0.6 ? GOOD : ACC, opacity: fraud ? 1 : 0.55 }); }
      const fx = x0 + 49 * cs, fy = y0 + 19 * cs;
      if (k === 1) { el('circle', { cx: fx + 3, cy: fy + 3, r: 16, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.7) });
        tx(x0, 228, '한 칸 = 1,000건', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
        mono(520, 90, '정상', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) }); mono(930, 90, '998,973', { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 0.6) });
        mono(520, 140, '사기', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); mono(930, 140, '1,027', { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.6) });
        card(725, 220, 300, 52, { rx: 12, text: '불균형 비율 0.1%', fs: 19, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 2.0) });
        tx(40, 290, '그 1,027건조차 "과거에 적발된" 수법이다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }
      if (k === 5) { const g = E(u, 0.3, 0.9);
        tx(40, 270, '모델 없이 전부 "정상" 이라고 찍으면', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
        [['RandomForest', '0.999', 0.6], ['전부 "정상"', '0.999', 1.2]].forEach(([a, b, at], i) => { const y = 120 + i * 90; card(720, y, 340, 66, { rx: 12, stroke: i ? WARN : INK, s: pop(u, at) });
          tx(570, y + 7, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, at) }); mono(870, y + 9, b, { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'end', fill: i ? WARN : INK, opacity: fade(u, at + 0.2) }); });
        tx(560, 310, 'accuracy 가 같다 → 아무것도 말해 주지 않는다', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
        tx(40, 300, '사기 1칸만 틀려도 99.9%', { 'font-size': 15, fill: MUT, opacity: g }); }
      return; }
    if (k === 2) { const hd = ['amount', 'hour', 'n_tx_1h', 'account_age', 'is_fraud'], sp = E(u, 1.0, 1.8);
      hd.forEach((h, j) => { const isY = j === 4, x = 60 + j * 160 + (isY ? 60 * sp : 0), op = fade(u, 0.2 + j * 0.12), col = isY ? BAD : ACC;
        card(x + 65, 90, 140, 40, { rx: 6, text: h, fs: 14.5, mono: true, stroke: col, color: col, fill: isY ? BADBG : ACCBG, op });
        for (let r = 0; r < 5; r++) el('rect', { x, y: 118 + r * 34, width: 130, height: 28, rx: 3, fill: PANEL, stroke: GRID, opacity: op }); });
      el('rect', { x: 52, y: 66, width: 640 - 8, height: 300, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 1.8) });
      lbl(370, 396, 'X — 피처 4개', fade(u, 1.9), { fill: ACC }); lbl(805, 396, 'y — 정답', fade(u, 1.9), { fill: BAD });
      el('rect', { x: 732, y: 66, width: 150, height: 300, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 1.8) }); return; }
    if (k === 3) { const bar = (y, w, nm, at) => { const g = E(u, at, at + 0.6); el('rect', { x: 120, y, width: w * g, height: 46, rx: 6, fill: ACC, opacity: 0.6 }); el('rect', { x: 120 + w * g - 4, y, width: 4, height: 46, fill: BAD, opacity: g });
        tx(40, y + 29, nm, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, at) }); };
      bar(100, 640, 'train', 0.3); bar(190, 160, 'test', 0.9);
      mono(780, 130, '80%', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.8) }); mono(300, 220, '20%', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.4) });
      tx(120, 290, '빨간 끝 = 사기 0.1% — stratify=y 로 양쪽에 똑같이', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(120, 326, '층화하지 않으면 test 에 사기가 0건일 수도 있다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { for (let i = 0; i < 5; i++) { const x = 90 + i * 70, s = pop(u, 0.2 + i * 0.12); el('path', { d: `M${x},${170 - 40 * s} L${x - 26 * s},${170} L${x + 26 * s},${170} Z`, fill: GOOD, opacity: 0.75 }); el('rect', { x: x - 4, y: 170, width: 8, height: 18 * s, fill: MUT }); }
      tx(60, 236, 'RandomForestClassifier(class_weight="balanced")', { 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.8) });
      const v = 0.999 * E(u, 1.0, 2.0); mono(720, 170, v.toFixed(3), { 'font-size': 48, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD }); lbl(720, 210, 'acc', 1, { fill: MUT });
      tx(720, 290, '성공처럼 보인다…', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.2) }); return; }
    if (k === 6) { zone(40, 30, 420, 250, '학습 데이터 — 과거에 적발된 수법', { fill: SOFT });
      ['수법 A', '수법 B', '수법 C'].forEach((s, i) => { pill(120 + i * 120, 110, s, BAD, pop(u, 0.2 + i * 0.15), { fs: 15 }); check(120 + i * 120, 160, 10, pop(u, 0.5 + i * 0.15)); });
      tx(60, 230, '모델은 이 셋을 외운다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9) });
      grow(470, 150, 560, 150, E(u, 1.0, 1.3), MUT); tx(470, 130, '다음 달', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      pill(680, 150, '신종 수법 D', WARN, pop(u, 1.3), { fs: 16 }); pill(680, 200, '라벨 0건', BAD, pop(u, 1.6), { fs: 15 }); xm(800, 150, 12, BAD, fade(u, 1.9)); tx(820, 156, '미탐', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
      person(120, 340, null, { s: pop(u, 2.0) }); clock(200, 336, 22, 0.7 * E(u, 2.0, 2.6), WARN); tx(240, 344, '라벨 하나에 조사관이 건당 수십 분', { 'font-size': 15, opacity: fade(u, 2.1) }); return; }
    if (k === 7) { frame(); ellipse(40, 17, { g: E(u, 0.8, 1.6), fill: ACC, col: ACC, fo: 0.1 }); pts(d, { nop: 0.85 * fade(u, 0.2), oop: fade(u, 1.8), xop: fade(u, 1.8) });
      if (u > 1.9) { [d.O, d.X].forEach((p) => el('circle', { cx: SX(p[0]), cy: SY(p[1]), r: 15, fill: 'none', stroke: BAD, 'stroke-width': 2.5 })); }
      tx(520, 80, '오늘 거래 — 라벨이 없다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      tx(520, 150, '99.9% 인 "정상" 의 모양을 배우고', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      tx(520, 186, '거기서 벗어난 것을 이상으로 본다', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      card(705, 280, 370, 56, { rx: 12, text: '사기를 배우지 말고 정상을 배운다', fs: 17, fill: INK, stroke: 'none', color: PANEL, s: pop(u, 2.2) }); } }

  // ---------- 2. 통계 · 단변량의 사각지대 ----------
  const BX = [16, 77], BY = [34, 72];   // 페이지 그림의 축별 정상 범위
  function s2(t, c) { const { k, u } = c, d = D(); if (!d) return;
    if (k === 2) return iqrScene(u);
    frame();
    const drop = k === 0 ? E(u, 0.8, 1.8) : k === 1 ? 1 : 0;
    if (k >= 3 || k === 1) { const g = k === 3 ? E(u, 0.3, 0.9) : 1;
      el('rect', { x: SX(BX[0]), y: SY(94) - 10, width: (SX(BX[1]) - SX(BX[0])) * g, height: 20, fill: INFO, opacity: 0.25 });
      if (k >= 3) el('rect', { x: SX(6) - 10, y: SY(BY[1]) - (SY(BY[1]) - SY(BY[0])) * g, width: 20, height: (SY(BY[1]) - SY(BY[0])) * g, fill: INFO, opacity: 0.25 }); }
    if (k === 6) ellipse(40, 17, { g: E(u, 0.3, 1.2), col: ACC, fill: ACC, fo: 0.08 });
    // 점: k0~1 은 금액 축으로 떨어뜨린다
    const all = d.N.map((p) => [p, ACC]).concat([[d.O, WARN], [d.X, BAD]]);
    all.forEach(([p, col], i) => { const y = lerp(p[1], 94, drop); el('circle', { cx: SX(p[0]), cy: SY(y), r: i >= d.N.length ? 8 : 6, fill: col, opacity: drop > 0 && i < d.N.length ? 0.6 : 0.9, stroke: PANEL, 'stroke-width': 1 }); });
    if (k === 0) { tx(520, 70, 'amount = df["amount"].to_numpy()', { 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.2) });
      tx(520, 130, '금액 한 축만 남기고', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.9) }); tx(520, 162, '다른 변수와의 관계는 버린다', { 'font-size': 16, fill: MUT, opacity: fade(u, 1.4) });
      tx(520, 240, '라벨도 학습도 필요 없는 가장 값싼 방법', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 1) { tx(SX(46), SY(94) - 20, '정상 범위 (|z| ≤ 3)', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.4) });
      el('circle', { cx: SX(d.X[0]), cy: SY(94), r: 15, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.2) });
      tx(520, 70, 'z = (x − μ) / σ', { 'font-size': 20, class: 'mono', 'font-weight': 800, opacity: fade(u, 0.2) });
      tx(520, 120, '평균에서 표준편차 몇 배 떨어졌나', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.5) });
      tx(520, 180, '|z| > 3 → 이상', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      tx(520, 212, '정규분포라면 양 끝 합쳐 약 0.3%', { 'font-size': 15, opacity: fade(u, 1.3) });
      tx(520, 280, '빨간 점처럼 축 자체가 극단이면 잡힌다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }
    if (k === 3) { tx(520, 70, '검사 단위 = 변수 하나', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.2) });
      tx(520, 120, '파란 밴드 = 각 축의 정상 범위', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(520, 160, '두 밴드는 서로를 전혀 모른다', { 'font-size': 15, opacity: fade(u, 1.6) }); }
    if (k === 4 || k === 5) { const g = k === 4 ? E(u, 0.4, 1.2) : 1, [ox, oy] = d.O;
      el('line', { x1: SX(ox), y1: SY(oy), x2: SX(ox), y2: lerp(SY(oy), SY(94), g), stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      el('line', { x1: SX(ox), y1: SY(oy), x2: lerp(SX(ox), SX(6), g), y2: SY(oy), stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      if (g >= 1) { check(SX(ox), SY(94) - 26, 9, k === 4 ? pop(u, 1.2) : 1); check(SX(6) + 22, SY(oy), 9, k === 4 ? pop(u, 1.4) : 1); }
      tx(SX(ox) + 16, SY(oy) - 12, '조합 이상 — 미탐', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: k === 4 ? fade(u, 1.8) : 1 }); }
    if (k === 4) { tx(520, 70, 'row = {"age": 20, "salary": 5억}', { 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.2) });
      [['age = 20', '20대는 흔하다'], ['salary = 5억', '임원급엔 존재한다']].forEach(([a, b], i) => { const y = 130 + i * 50; check(530, y - 6, 9, pop(u, 1.2 + i * 0.2)); tx(552, y, a, { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: fade(u, 1.2 + i * 0.2) }); tx(700, y, b, { 'font-size': 15, fill: MUT, opacity: fade(u, 1.3 + i * 0.2) }); });
      tx(520, 260, '"20세이면서 연봉 5억" — 조합은 명백한 이상', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); }
    if (k === 5) { [['금액 3만원', '흔함'], ['새벽 4시', '존재함'], ['신규 계정', '흔함']].forEach(([a, b], i) => { const y = 70 + i * 54, at = 0.2 + i * 0.35;
        card(640, y, 230, 42, { rx: 21, text: a, fs: 16, stroke: INFO, color: INFO, s: pop(u, at) }); check(780, y, 9, pop(u, at + 0.2)); tx(800, y + 5, b, { 'font-size': 15, fill: MUT, opacity: fade(u, at + 0.2) }); });
      grow(640, 230, 640, 268, E(u, 1.4, 1.7), BAD); card(680, 300, 330, 50, { rx: 12, text: '셋의 조합 = 사기 신호', fs: 17, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.8) });
      tx(520, 370, '단변량 검사는 셋 다 통과시킨다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 6) { el('circle', { cx: SX(d.O[0]), cy: SY(d.O[1]), r: 16, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.3) });
      tx(520, 80, '축마다 따로 → 공간 전체', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.2) });
      tx(520, 130, '정상 무리의 모양(상관 패턴)에서', { 'font-size': 15, opacity: fade(u, 1.0) }); tx(520, 158, '"얼마나 외딴가" 를 잰다', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      tx(520, 220, '주황 점이 이제 바깥에 있다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      ['Isolation Forest', 'One-Class SVM'].forEach((s, i) => pill(600 + i * 190, 300, s, ACC, pop(u, 2.0 + i * 0.2), { fs: 15 })); } }
  // IQR: 치우친 분포에서 z 울타리 vs IQR 울타리 (모식도)
  function iqrScene(u) { const ax = axes(80, 60, 460, 250, { x: [0, 12], y: [0, 1], xl: '금액 (오른쪽으로 긴 꼬리)' });
    const h = [0.55, 0.95, 0.8, 0.55, 0.35, 0.22, 0.14, 0.09, 0.06, 0.04, 0.03, 0.02];
    h.forEach((v, i) => { const g = E(u, 0.2 + i * 0.04, 0.5 + i * 0.04); el('rect', { x: ax.X(i) + 2, y: ax.Y(v * g), width: ax.X(1) - ax.X(0) - 4, height: ax.Y(0) - ax.Y(v * g), fill: ACC, opacity: 0.55 }); });
    el('circle', { cx: ax.X(11.6), cy: ax.Y(0.05), r: 7, fill: BAD, opacity: fade(u, 0.6) }); tx(ax.X(11.6), ax.Y(0.05) - 14, '극단값', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.7) });
    const bx0 = ax.X(1), bx1 = ax.X(4), by = 360; el('rect', { x: bx0, y: by - 14, width: (bx1 - bx0) * E(u, 0.9, 1.3), height: 28, rx: 4, fill: INFO, opacity: 0.3, stroke: INFO, 'stroke-width': 2 });
    tx(bx0, by + 36, 'Q1 ~ Q3', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.2) });
    const fence = (x, col, s, at, y) => { const g = E(u, at, at + 0.4); if (g <= 0) return; el('line', { x1: x, y1: 70, x2: x, y2: lerp(70, 330, g), stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }); tx(x + 6, y, s, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: g }); };
    fence(ax.X(8.5), INFO, '1.5×IQR 울타리', 1.4, 96); fence(ax.X(11.2), WARN, '|z|=3 울타리', 1.9, 130);
    tx(600, 200, 'q1, q3 = percentile(…, [25, 75])', { 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.3) });
    tx(600, 240, '극단값이 μ·σ 를 끌고 가면', { 'font-size': 15, opacity: fade(u, 2.0) }); tx(600, 266, 'z 울타리도 밀려난다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) });
    tx(600, 312, 'IQR 은 사분위수라 덜 흔들린다', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 2.3) });
    sub(330, 410, '모식도 — 치우친 분포에서 두 울타리의 차이', fade(u, 0.3), { 'font-size': 14 }); }

  // ---------- 3. Isolation Forest ----------
  function forest(x, y, n, u, at, o) { o = o || {}; for (let i = 0; i < n; i++) { const r = Math.floor(i / 20), cc = i % 20, s = o.grow ? pop(u, at + i * 0.006, 0.4) : fade(u, at + i * 0.004);
      const cx = x + cc * 20, cy = y + r * 22; if (s <= 0) continue; el('path', { d: `M${cx},${cy - 8 * s} L${cx - 6 * s},${cy + 4} L${cx + 6 * s},${cy + 4} Z`, fill: GOOD, opacity: 0.8 }); el('rect', { x: cx - 1, y: cy + 4, width: 2, height: 4 * s, fill: MUT }); } }
  function splitLines(d, n, u, a0) { d.SPL.slice(0, n).forEach((s, i) => { const g = a0 == null ? 1 : E(u, a0 + i * 0.5, a0 + i * 0.5 + 0.4); if (g <= 0) return;
      if (s.type === 'v') { const y1 = SY(2), y2 = SY(s.yTo || 94); el('line', { x1: SX(s.at), y1, x2: SX(s.at), y2: lerp(y1, y2, g), stroke: INK, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' }); }
      else { const x1 = SX(s.from || 6); el('line', { x1, y1: SY(s.at), x2: lerp(x1, SX(98), g), y2: SY(s.at), stroke: INK, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' }); } }); }
  function chain(x, y, n, col, u, at, label) { for (let i = 0; i < n; i++) { const s = pop(u, at + i * 0.08, 0.3), cx = x + i * 34; if (i) grow(cx - 26, y, cx - 8, y, s, OFF, { plain: true, sw: 2 }); el('circle', { cx, cy: y, r: 9 * s, fill: i === n - 1 ? col : PANEL, stroke: col, 'stroke-width': 2 }); }
    tx(x - 20, y - 22, label, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, at) }); }
  function s3(t, c) { const { k, u } = c, d = D(); if (!d) return;
    if (k === 0) { ['amount', 'hour', 'n_tx_1h', 'account_age', 'is_fraud'].forEach((h, j) => { const isY = j === 4, x = 60 + j * 170, op = isY ? 1 - 0.7 * fade(u, 1.0) : fade(u, 0.2 + j * 0.1);
        card(x + 70, 110, 150, 40, { rx: 6, text: h, fs: 14.5, mono: true, stroke: isY ? BAD : ACC, color: isY ? BAD : ACC, op });
        for (let r = 0; r < 4; r++) el('rect', { x: x + 5, y: 140 + r * 34, width: 130, height: 28, rx: 3, fill: PANEL, stroke: GRID, opacity: op }); });
      xm(820, 180, 30, BAD, fade(u, 1.1)); lbl(370, 320, 'X — 4차원 배열', fade(u, 1.4), { fill: ACC, 'font-size': 17 }); lbl(820, 320, '라벨 y 는 가져오지 않는다', fade(u, 1.6), { fill: BAD });
      sub(480, 370, '여기서부터 정답은 등장하지 않는다', fade(u, 2.1), { 'font-size': 15, fill: INK }); return; }
    if (k === 1 || k === 2) { forest(60, 70, 200, u, k === 1 ? 0.3 : -5, { grow: k === 1 });
      [['n_estimators=200', '무작위 분할 트리 200그루'], ['max_samples=256', '트리당 샘플 — 작을수록 강건'], ['contamination=0.001', '예상 이상 비율 → 임계값']].forEach(([a, b], i) => { const y = 90 + i * 70, op = k === 1 ? fade(u, 0.5 + i * 0.5) : 1;
        mono(520, y, a, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: op }); tx(520, y + 26, b, { 'font-size': 15, fill: MUT, opacity: op }); });
      tx(60, 330, '200그루', { 'font-size': 16, 'font-weight': 800, opacity: k === 1 ? fade(u, 1.8) : 1 });
      if (k === 2) { card(705, 330, 300, 54, { rx: 12, text: 'iso.fit(X)  — y 없음', fs: 16, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.3) });
        dot([[480, 330], [555, 330]], seg(u, 0.6, 1.2), ACC, 7); tx(60, 380, '정답을 준 적이 없다 → 신종 수법도 원리상 대상', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) }); }
      return; }
    frame(); const off = k === 9;
    if (k >= 4 && k <= 6) splitLines(d, 3, u, k === 4 ? 0.3 : null);
    if (k >= 4 && k <= 6 && (k > 4 || u > 1.8)) el('rect', { x: SX(84), y: SY(2), width: SX(98) - SX(84), height: SY(25) - SY(2), fill: BAD, opacity: 0.1 });
    if (off) { [[{ v: 30 }, 0.3], [{ h: 46 }, 0.8], [{ v: 18 }, 1.3]].forEach(([s, a]) => { const g = E(u, a, a + 0.4); if (s.v) el('line', { x1: SX(s.v), y1: SY(2), x2: SX(s.v), y2: lerp(SY(2), SY(94), g), stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' }); else el('line', { x1: SX(6), y1: SY(s.h), x2: lerp(SX(6), SX(98), g), y2: SY(s.h), stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' }); }); }
    pts(d, { nop: k === 8 ? 0.4 : 0.85 });
    if (k === 3) { tx(520, 60, 'predict → +1 / -1', { 'font-size': 17, class: 'mono', 'font-weight': 800, opacity: fade(u, 0.2) });
      [[d.X, '-1', BAD], [d.O, '-1', WARN]].forEach(([p, s, col], i) => pill(SX(p[0]) - (i ? -30 : 34), SY(p[1]) + (i ? -2 : 26), s, col, pop(u, 0.5 + i * 0.2), { mono: true, fs: 14 }));
      tx(520, 140, 'score_samples → 연속 점수', { 'font-size': 17, class: 'mono', 'font-weight': 800, opacity: fade(u, 1.0) });
      const L0 = 530, L1 = 920, ly = 200; el('line', { x1: L0, y1: ly, x2: lerp(L0, L1, E(u, 1.1, 1.6)), y2: ly, stroke: MUT, 'stroke-width': 3 });
      tx(L0, ly + 30, '← 낮을수록 이상', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) }); tx(L1, ly + 30, '정상 →', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.5) });
      [[0.06, BAD], [0.2, WARN]].concat(d.N.map((_, i) => [0.62 + hsh(i) * 0.35, ACC])).forEach(([f, col], i) => el('circle', { cx: lerp(L0, L1, f), cy: ly, r: i < 2 ? 8 : 5, fill: col, opacity: fade(u, 1.6 + i * 0.02) }));
      tx(520, 300, '연속 점수가 있으면 임계값을 나중에 정한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 4) { d.SPL.forEach((s, i) => { const op = fade(u, 0.5 + i * 0.5); mono(520, 90 + i * 44, s.label, { 'font-size': 16, 'font-weight': 700, fill: i === 2 ? BAD : INK, opacity: op }); });
      el('circle', { cx: SX(d.X[0]), cy: SY(d.X[1]), r: 18, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.9) });
      tx(520, 250, '무작위 특징 × 무작위 값으로 이등분', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); tx(520, 278, '혼자 남을 때까지 반복', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 5) { el('circle', { cx: SX(48), cy: SY(54), r: 26, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      chain(540, 110, 3, BAD, u, 0.3, '외딴 이상점 — 3번'); chain(540, 220, 12, ACC, u, 0.9, '클러스터 정상점 — 평균 12번');
      tx(520, 300, '경로가 짧다 = 고립이 쉽다 = 이상', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.2) }); }
    if (k === 6) { tx(520, 60, '트리마다 경로 길이가 다르다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      [['이상점', 3, BAD, 90], ['정상점', 12, ACC, 230]].forEach(([nm, mean, col, y0]) => { for (let i = 0; i < 8; i++) { const v = Math.max(1, mean + (hsh(i + mean * 10) - 0.5) * (mean / 1.6)), w = v * 24 * E(u, 0.2 + i * 0.08, 0.5 + i * 0.08);
          el('rect', { x: 540, y: y0 + i * 13, width: w, height: 9, rx: 2, fill: col, opacity: 0.35 }); }
        const g = E(u, 1.3, 1.9); el('line', { x1: 540 + mean * 24, y1: y0 - 6, x2: 540 + mean * 24, y2: y0 + 110 * g, stroke: col, 'stroke-width': 3 });
        tx(540 + mean * 24 + 8, y0 + 4, `평균 ${mean}`, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: g }); tx(520, y0 - 12, nm, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.2) }); });
      tx(520, 396, '200그루 평균 → 우연이 상쇄된다', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.1) }); }
    if (k === 7) { // 점수 공식
      el('rect', { x: 40, y: 12, width: 440, height: 380, rx: 10, fill: PANEL, opacity: 1 }); const ax = axes(110, 70, 330, 250, { x: [0, 2], y: [0, 1], xt: [0, 1, 2], yt: [0, 0.5, 1], xl: 'E[h(x)] / c(n)', yl: 's' });
      line(ax, Array.from({ length: 41 }, (_, i) => [i / 20, Math.pow(2, -i / 20)]), E(u, 0.4, 1.4), INK);
      el('line', { x1: ax.X(0), y1: ax.Y(0.5), x2: ax.X(2), y2: ax.Y(0.5), stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
      el('circle', { cx: ax.X(0.15), cy: ax.Y(Math.pow(2, -0.15)), r: 8, fill: BAD, opacity: fade(u, 1.5) }); tx(ax.X(0.15) + 14, ax.Y(Math.pow(2, -0.15)) + 5, '짧은 경로 → 1 쪽', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
      el('circle', { cx: ax.X(1.6), cy: ax.Y(Math.pow(2, -1.6)), r: 8, fill: ACC, opacity: fade(u, 1.8) }); tx(ax.X(1.6), ax.Y(Math.pow(2, -1.6)) - 16, '긴 경로 → 0 쪽', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      card(720, 90, 380, 60, { rx: 12, text: 's = 2^( −E[h(x)] / c(n) )', fs: 19, mono: true, stroke: INK, s: pop(u, 0.2) });
      tx(540, 180, 'c(n) = 표본 n 개의 평균 경로 길이 (정규화)', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.8) });
      tx(540, 240, 's ≈ 1 → 확실한 이상', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      tx(540, 272, 's ≪ 0.5 → 정상', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      card(720, 340, 380, 50, { rx: 10, text: 'score_samples = −s  (낮을수록 이상)', fs: 15.5, mono: true, stroke: WARN, color: WARN, s: pop(u, 2.2) }); }
    if (k === 8) { const items = [[d.X, BAD], [d.O, WARN]].concat(d.N.slice(0, 6).map((p) => [p, ACC]));
      tx(520, 52, 'scores.argsort()[:50]', { 'font-size': 17, class: 'mono', 'font-weight': 800, opacity: fade(u, 0.1) });
      items.forEach(([p, col], i) => { const y = 82 + i * 34, a = 0.3 + i * 0.18, q = seg(u, a, a + 0.4); if (q > 0 && q < 1) fly(SX(p[0]), SY(p[1]), 600, y, q, '#' + (i + 1), { fill: col, mono: true });
        if (q >= 1) { el('rect', { x: 530, y: y - 13, width: 380 * (i < 2 ? 1 : 0.9), height: 26, rx: 5, fill: i < 2 ? (i ? WARNBG : BADBG) : SOFT, stroke: col, 'stroke-width': 1.5 }); mono(544, y + 5, `#${i + 1}`, { 'font-size': 14.5, 'font-weight': 800, fill: col }); tx(600, y + 5, i < 2 ? (i ? '조합 이상 (주황 점)' : '극단값 (빨간 점)') : '…', { 'font-size': 14.5, opacity: 0.9 }); } });
      tx(520, 380, '상위 50건 = 오늘의 조사 큐', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.2) }); }
    if (k === 9) { el('circle', { cx: SX(d.O[0]), cy: SY(d.O[1]), r: 18, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.8) });
      tx(520, 70, '주황 점도 몇 번 만에 고립된다', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) });
      tx(520, 100, '조합이 이상한 곳은 데이터가 성기다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) });
      [['거리 · 밀도 계산 없음', '수백만 건에도 빠르다'], ['Step 2 의 사각지대', '조합 이상도 잡는다']].forEach(([a, b], i) => { const y = 180 + i * 90; check(532, y - 6, 10, pop(u, 2.0 + i * 0.2)); tx(556, y, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0 + i * 0.2) }); tx(556, y + 26, b, { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1 + i * 0.2) }); }); } }

  // ---------- 4. One-Class SVM ----------
  function s4(t, c) { const { k, u } = c, d = D(); if (!d) return; frame();
    if (k === 0) { const g = E(u, 0.8, 1.9), sx = (x) => lerp(6 + (x - 6) * 0.25, x, g);
      d.N.concat([d.O, d.X]).forEach((p, i) => el('circle', { cx: SX(sx(p[0])), cy: SY(p[1]), r: i >= d.N.length ? 8 : 6, fill: i === d.N.length ? WARN : i > d.N.length ? BAD : ACC, opacity: 0.85 }));
      tx(520, 70, 'StandardScaler', { 'font-size': 18, class: 'mono', 'font-weight': 800, opacity: fade(u, 0.1) });
      [['금액 (원)', 380, WARN], ['계정 사용 기간 (일)', 60, INFO]].forEach(([nm, w0, col], i) => { const y = 120 + i * 64, w = lerp(w0, 200, g); tx(520, y, nm, { 'font-size': 15, 'font-weight': 700, fill: col }); el('rect', { x: 520, y: y + 10, width: w, height: 18, rx: 4, fill: col, opacity: 0.8 }); });
      tx(520, 290, '거리 기반이라 단위가 큰 변수가', { 'font-size': 15, opacity: fade(u, 1.8) }); tx(520, 316, '경계를 독점하지 않게 — 필수', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0) }); return; }
    const solid = k === 1 ? E(u, 0.6, 1.4) : k === 2 ? E(u, 0.3, 1.6) : 1, dashG = k === 1 ? E(u, 1.4, 2.1) : 1;
    if (k !== 2) ellipse(34, 12, { g: dashG, col: BAD, dash: '6 4', sw: 2 });
    ellipse(40, 17, { g: solid, col: INFO, fill: INFO, fo: 0.08 });
    const outT = d.N.map((p) => !inside(p, 46, 53, 34, 12, -31));
    pts(d, { ncol: (i) => (k === 4 && outT[i] && u > 1.0 ? WARN : ACC) });
    if (k === 4) d.N.forEach((p, i) => { if (outT[i] && u > 1.0) el('circle', { cx: SX(p[0]), cy: SY(p[1]), r: 11, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.0) }); });
    if (k === 1) { tx(520, 60, 'OneClassSVM(kernel="rbf",', { 'font-size': 15.5, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.1) }); tx(520, 84, '            nu=0.01, gamma="scale")', { 'font-size': 15.5, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.1) });
      el('line', { x1: 522, y1: 150, x2: 566, y2: 150, stroke: INFO, 'stroke-width': 3, opacity: fade(u, 0.8) }); tx(580, 156, 'nu = 0.01 — 실선', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8) });
      el('line', { x1: 522, y1: 186, x2: 566, y2: 186, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 1.6) }); tx(580, 192, 'nu = 0.1 — 점선', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      tx(520, 250, 'nu = 경계 밖에 둘 훈련 데이터 비율의 상한', { 'font-size': 15, opacity: fade(u, 1.9) }); tx(520, 280, 'RBF → 구부러진 정상 영역도 곡선으로 감싼다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 2) { tx(520, 70, 'oc.fit(X_scaled)', { 'font-size': 18, class: 'mono', 'font-weight': 800, opacity: fade(u, 0.1) });
      tx(520, 130, '정상 위주 데이터만으로', { 'font-size': 16, opacity: fade(u, 0.6) }); tx(520, 160, '그것을 감싸는 경계 하나', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.2) });
      tx(520, 230, '클래스가 하나뿐 — "정상을 배우자" 그대로', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 3) { const bnd = (p) => { const [cx, cy] = [46, 53], dx = p[0] - cx, dy = p[1] - cy, L = Math.hypot(dx, dy); let lo = 0, hi = 1; for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (inside([cx + dx * m, cy + dy * m], 46, 53, 40, 17, -31)) lo = m; else hi = m; } return [cx + dx * lo, cy + dy * lo]; };
      [[d.O, WARN, 0.4], [d.X, BAD, 0.9]].forEach(([p, col, a]) => { const b = bnd(p); grow(SX(b[0]), SY(b[1]), SX(p[0]), SY(p[1]), E(u, a, a + 0.5), col, { sw: 3 }); });
      tx(520, 70, 'predict → +1 안 / -1 밖', { 'font-size': 16, class: 'mono', 'font-weight': 800, opacity: fade(u, 0.1) });
      tx(520, 110, 'decision_function → 부호 있는 거리', { 'font-size': 16, class: 'mono', 'font-weight': 800, opacity: fade(u, 0.6) });
      tx(520, 170, '경계 안 = 양수 · 밖 = 음수', { 'font-size': 15, opacity: fade(u, 1.3) }); tx(520, 200, '밖으로 깊을수록 확실한 이상', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
      tx(520, 260, '실무에서는 이 연속값을 쓴다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 4) { [['nu = 0.1 (점선)', '바짝 조임 → 탐지↑ 오탐↑', BAD, 0.3], ['nu = 0.01 (실선)', '여유 → 오탐↓ 미탐 위험↑', INFO, 1.4]].forEach(([a, b, col, at], i) => { const y = 80 + i * 110;
        card(720, y, 380, 80, { rx: 12, stroke: col, s: pop(u, at) }); tx(546, y - 8, a, { 'font-size': 16, 'font-weight': 800, fill: col, class: 'mono', opacity: fade(u, at) }); tx(546, y + 22, b, { 'font-size': 15, opacity: fade(u, at + 0.1) }); });
      tx(520, 330, '주황 테 = 점선 밖으로 밀린 정상점 (오탐)', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(520, 370, 'nu 는 "오탐을 얼마나 감수할까" 의 결정', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.2) }); }
    if (k === 5) { el('rect', { x: 500, y: 20, width: 440, height: 380, fill: PANEL });
      [['One-Class SVM', INFO, ['경계가 매끈 · 정밀', '학습 O(n²)급 → 수만 건까지', '커널 · nu · gamma 튜닝, 스케일링 민감']], ['Isolation Forest', GOOD, ['수백만 건도 빠르다', '튜닝 거의 불필요 → 실무 기본값']]].forEach(([nm, col, rows], i) => { const y = 40 + i * 170, at = 0.2 + i * 0.8;
        el('rect', { x: 520, y, width: 410, height: 40 + rows.length * 30, rx: 12, fill: SOFT, stroke: col, 'stroke-width': 2, opacity: fade(u, at) });
        tx(538, y + 28, nm, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, at) }); rows.forEach((s, j) => tx(538, y + 58 + j * 30, '· ' + s, { 'font-size': 15, opacity: fade(u, at + 0.2 + j * 0.15) })); });
      tx(520, 395, '정밀한 소규모 센서·품질 데이터 → OC-SVM', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); } }

  // ---------- 5. 운영 ----------
  // 점수 분포 (모식도): 왼쪽 꼬리가 이상
  const HB = [1, 1, 2, 3, 5, 8, 12, 16, 19, 18, 14, 9, 5, 2];
  function hist(x, y, w, h, u, a, o) { o = o || {}; const n = HB.length, bw = w / n, mx = 19;
    HB.forEach((v, i) => { const vv = o.tail && i < 3 ? v * o.tail : v, g = E(u, a + i * 0.04, a + 0.4 + i * 0.04), hh = (h * Math.min(vv, mx)) / mx * g;
      el('rect', { x: x + i * bw + 1, y: y + h - hh, width: bw - 2, height: hh, fill: o.cut != null && i < o.cut ? (o.cutCol || BAD) : ACC, opacity: 0.6 }); });
    el('line', { x1: x, y1: y + h, x2: x + w, y2: y + h, stroke: MUT, 'stroke-width': 1.6 }); }
  function s5(t, c) { const { k, u } = c, d = D(); if (!d) return;
    if (k === 0) { hist(60, 70, 520, 230, u, 0.2); tx(60, 330, 'score_samples (낮을수록 이상) →', { 'font-size': 15, fill: MUT, 'font-weight': 600 });
      tx(640, 100, 'scores = iso.score_samples(X_today)', { 'font-size': 14.5, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.1) });
      tx(640, 170, '오늘 거래에 점수만 매긴다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) }); tx(640, 200, '아직 아무것도 자르지 않았다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.3) });
      tx(640, 260, '점수 매기기 ≠ 알림 보내기', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0) }); sub(320, 380, '분포 모식도', 1, { 'font-size': 14 }); return; }
    if (k === 1) { [['조용한 날', 0.4, 0.2, '정상을 자른다', WARN], ['사고 난 날', 3, 1.2, '사기를 놓친다', BAD]].forEach(([nm, tail, a, msg, col], i) => { const x = 40 + i * 470;
        lbl(x + 200, 50, nm, fade(u, a), { 'font-size': 17 }); hist(x, 70, 400, 200, u, a, { tail, cut: 2, cutCol: col });
        const cx = x + 400 / 14 * 2; el('line', { x1: cx, y1: 60, x2: cx, y2: 280, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, a + 0.5) });
        tx(cx + 6, 76, '고정 비율 컷', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, a + 0.5) });
        tx(x + 200, 320, msg, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, a + 0.9) }); });
      tx(480, 380, 'contamination = "매일 상위 몇 % 를 무조건 이상 처리"', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    if (k === 2 || k === 3) { const cutX = 60 + 520 / 14 * 2.6;
      hist(60, 70, 520, 230, u, -5, { cut: k === 3 ? 3 : (u > 1.6 ? 3 : null) }); tx(60, 330, 'score_samples (낮을수록 이상) →', { 'font-size': 15, fill: MUT, 'font-weight': 600 });
      if (k === 2) { const x = lerp(560, cutX, E(u, 0.6, 1.6)); el('line', { x1: x, y1: 50, x2: x, y2: 300, stroke: BAD, 'stroke-width': 3 }); tx(x + 8, 62, 'threshold', { 'font-size': 15, 'font-weight': 800, fill: BAD, class: 'mono' });
        card(780, 100, 300, 50, { rx: 10, text: 'DAILY_REVIEW_BUDGET = 50', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.2) });
        mono(640, 190, 'np.sort(scores)[50]', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.0) });
        tx(640, 240, '알림 대상 = 50건', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) }); tx(640, 280, '"누가 몇 건을 볼 수 있나" 에서 역산', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); }
      if (k === 3) { el('line', { x1: cutX, y1: 50, x2: cutX, y2: 300, stroke: BAD, 'stroke-width': 3 });
        tx(640, 60, '조사 큐 (점수 오름차순)', { 'font-size': 16, 'font-weight': 800 });
        [['#1', '-0.71', '빨간 점 — 극단값', BAD], ['#2', '-0.58', '주황 점 — 조합 이상', WARN], ['#3', '…', '', MUT], ['…', '', '', MUT]].forEach(([a, b, cc, col], i) => { const y = 100 + i * 46, at = 0.3 + i * 0.4, q = seg(u, at, at + 0.4);
          if (q > 0 && q < 1) fly(cutX - 30, 200, 650, y, q, a, { fill: col, mono: true });
          if (q >= 1) { el('rect', { x: 640, y: y - 18, width: 290, height: 36, rx: 6, fill: i === 0 ? BADBG : i === 1 ? WARNBG : SOFT, stroke: col, 'stroke-width': 1.5 });
            mono(654, y + 5, a, { 'font-size': 15, 'font-weight': 800, fill: col }); mono(700, y + 5, b, { 'font-size': 15, 'font-weight': 800, fill: col }); tx(770, y + 5, cc, { 'font-size': 14, fill: INK }); } });
        tx(640, 300, '조사관은 위에서부터 검토한다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); }
      return; }
    if (k === 4) { // 알림 피로도
      [[500, 120, BAD, '하루 500건', 0.2], [50, 600, GOOD, '하루 50건', 1.3]].forEach(([n, x, col, nm, a]) => { const shown = Math.round(lerp(0, n, E(u, a, a + 0.8))), per = n === 500 ? 10 : 1;
        for (let i = 0; i < Math.ceil(shown / per); i++) { const r = Math.floor(i / 10), cc = i % 10; el('rect', { x: x + cc * 26, y: 70 + r * 22, width: 22, height: 16, rx: 3, fill: col, opacity: 0.6 }); }
        lbl(x + 130, 52, nm, fade(u, a), { fill: col, 'font-size': 17 }); });
      tx(120, 210, '한 칸 = 10건', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) }); tx(600, 210, '한 칸 = 1건', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
      person(200, 300, null, { s: pop(u, 1.0) }); tx(240, 300, '무시하기 시작 → 진짜 사기가 묻힌다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.1) });
      person(680, 300, null, { s: pop(u, 2.0) }); tx(720, 300, '전건 검토 가능', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) });
      tx(480, 390, '알림을 줄이는 쪽이 실제 탐지율을 올린다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    if (k === 5) { // 라벨 없는 평가 3종
      const cols = [['precision@N', 0.2], ['사후 역검증', 0.9], ['점수 drift 감시', 1.6]];
      cols.forEach(([nm, a], i) => { const x = 40 + i * 300; el('rect', { x, y: 40, width: 280, height: 300, rx: 12, fill: SOFT, opacity: fade(u, a) }); tx(x + 16, 70, nm, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, a) }); });
      ['✓', '✓', '✗', '✓', '✓'].forEach((s, i) => { const y = 106 + i * 36; el('rect', { x: 60, y: y - 16, width: 160, height: 28, rx: 4, fill: PANEL, stroke: GRID, opacity: fade(u, 0.3 + i * 0.08) }); mono(72, y + 4, `상위 ${i + 1}`, { 'font-size': 14, opacity: fade(u, 0.3 + i * 0.08) }); tx(200, y + 5, s, { 'font-size': 17, 'font-weight': 800, fill: s === '✓' ? GOOD : BAD, opacity: fade(u, 0.5 + i * 0.08) }); });
      tx(60, 318, '조사관 확인으로 정밀도 추정', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      for (let i = 0; i < 6; i++) el('rect', { x: 360, y: 96 + i * 34, width: 220, height: 26, rx: 4, fill: i === 1 ? BADBG : PANEL, stroke: i === 1 ? BAD : GRID, opacity: fade(u, 1.0 + i * 0.05) });
      tx(372, 96 + 34 + 18, '나중에 확인된 사기', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) }); tx(360, 318, '점수 상위에 있었나?', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
      const cv = (sh, col, a) => { const P = []; for (let i = 0; i <= 30; i++) { const x = i / 30, y = Math.exp(-((x - 0.5 - sh) ** 2) / 0.02); P.push(`${660 + x * 240},${280 - y * 150}`); } el('polyline', { points: P.join(' '), fill: 'none', stroke: col, 'stroke-width': 3, opacity: fade(u, a) }); };
      cv(0, ACC, 1.7); cv(-0.18, WARN, 2.0); tx(660, 318, '분포가 밀리면 → 재학습', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 6) { // LOF
      zone(40, 30, 520, 360, null, { fill: SOFT });
      for (let i = 0; i < 26; i++) { const a = hsh(i) * 6.283, r = Math.sqrt(hsh(i + 40)) * 30; el('circle', { cx: 170 + Math.cos(a) * r, cy: 200 + Math.sin(a) * r, r: 5, fill: ACC, opacity: 0.85 }); }
      for (let i = 0; i < 14; i++) { const a = hsh(i + 90) * 6.283, r = 30 + Math.sqrt(hsh(i + 130)) * 80; el('circle', { cx: 420 + Math.cos(a) * r, cy: 210 + Math.sin(a) * r * 0.9, r: 5, fill: INFO, opacity: 0.85 }); }
      el('circle', { cx: 252, cy: 200, r: 7, fill: BAD }); tx(262, 180, '이상', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      el('circle', { cx: 252, cy: 200, r: 60 * E(u, 0.3, 0.8), fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4' }); el('circle', { cx: 470, cy: 260, r: 60 * E(u, 0.3, 0.8), fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      tx(60, 370, '전역 기준: 둘 다 이웃 수가 비슷해 보인다', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.9) });
      tx(600, 80, 'LOF (Local Outlier Factor)', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      tx(600, 140, '"주변 이웃 대비" 상대 밀도', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      tx(600, 180, '빽빽한 무리 옆의 외딴 점 → 이상', { 'font-size': 15, opacity: fade(u, 1.6) }); tx(600, 210, '성긴 무리 속의 점 → 정상', { 'font-size': 15, opacity: fade(u, 1.8) });
      tx(600, 280, 'DBSCAN → HDBSCAN 과 같은 구조', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 7) { // 적용처
      const box = (x, nm, a) => { el('rect', { x, y: 40, width: 280, height: 260, rx: 12, fill: SOFT, opacity: fade(u, a) }); tx(x + 16, 70, nm, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, a) }); };
      box(40, '서버 메트릭', 0.2); const P = []; for (let i = 0; i <= 24; i++) { const y = i === 17 ? 120 : 220 + Math.sin(i * 0.9) * 14 + (hsh(i) - 0.5) * 12; P.push(`${60 + i * 10},${y}`); }
      el('polyline', { points: P.join(' '), fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.4) }); el('circle', { cx: 230, cy: 120, r: 12, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.9) }); tx(60, 286, '스파이크 탐지 (observability)', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) });
      box(340, '제조 불량', 0.8); for (let i = 0; i < 20; i++) { const x = 370 + (i % 5) * 48, y = 110 + Math.floor(i / 5) * 40, bad = i === 13; el('rect', { x, y, width: 34, height: 28, rx: 5, fill: bad ? BADBG : PANEL, stroke: bad ? BAD : GRID, 'stroke-width': bad ? 2.5 : 1.5, opacity: fade(u, 0.9 + i * 0.02) }); }
      box(640, '계정 탈취', 1.4); [[700, 150], [720, 175], [745, 160], [710, 200], [880, 120]].forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: 7, fill: i === 4 ? BAD : ACC, opacity: fade(u, 1.5 + i * 0.1) })); tx(660, 286, '로그인 패턴 이상', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      tx(480, 360, '점수 → 임계값 → 알림 큐 — 같은 틀이 그대로 쓰인다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: "사기가 0.1%인 데이터에서 정확도 0.999가 나왔다. 이 숫자를 믿으면 안 되는 이유는 무엇인가?",
      o: ["전부 \"정상\"이라고 찍어도 99.9%가 나오기 때문", "test 점수가 train보다 낮게 나올 것이기 때문", "class_weight를 넣으면 정확도가 부풀기 때문"], a: 0,
      why: "정상 998,973건 대 사기 1,027건이라 사기를 하나도 못 잡아도 정확도는 99.9%다. 불균형 데이터에서 accuracy는 아무것도 말해 주지 않는다." },
    { q: "\"20세인데 연봉 5억\" 같은 이상을 z-score·IQR이 놓치는 이유는 무엇인가?",
      o: ["극단값에 평균과 표준편차가 끌려가서", "변수를 하나씩만 검사해 각 축으로는 정상 범위이기 때문", "데이터가 정규분포를 따르지 않아서"], a: 1,
      why: "나이 20도, 연봉 5억도 각 축의 정상 범위 안이라 둘 다 통과한다. 이상한 것은 조합이라 공간 전체를 보는 다변량 모델이 필요하다." },
    { q: "Isolation Forest가 이상점을 알아보는 기준은 무엇인가?",
      o: ["군집 중심에서 멀리 떨어져 있다", "주변 이웃의 밀도가 낮다", "무작위 분할로 혼자 남기까지의 경로가 짧다"], a: 2,
      why: "밀집 지역의 정상점은 평균 12번을 쪼개야 혼자 남지만 외딴 이상점은 3번이면 끝난다. 거리·밀도 계산 없이 200그루의 평균 경로 길이가 이상 점수가 된다." },
    { q: "One-Class SVM에서 nu를 0.01에서 0.1로 올리면 경계는 어떻게 되나?",
      o: ["바짝 조여져 탐지도 오탐도 늘어난다", "느슨해져 미탐 위험이 커진다", "스케일링 없이도 쓸 수 있게 된다"], a: 0,
      why: "nu는 경계 밖에 둘 훈련 데이터 비율의 상한이다. 0.1이면 경계가 조여 탐지↑·오탐↑, 0.01이면 여유롭지만 미탐 위험이 커진다." },
    { q: "실무에서 이상 알림의 임계값을 정하는 권장 방식은 무엇인가?",
      o: ["contamination=0.01로 매일 상위 1%를 자른다", "연속 점수를 받아 조사팀이 하루에 볼 수 있는 건수(50건)로 역산한다", "predict()가 -1을 준 거래를 모두 알림으로 보낸다"], a: 1,
      why: "contamination은 실제 이상 비율을 모르는 채 비율을 강제한다. 연속 점수에 운영 예산(하루 50건)을 맞춰야 알림 피로 없이 실제로 검토되는 탐지가 늘어난다." },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '사기는 0.1%뿐이라 정확도 0.999도 의미가 없고, 신종 수법은 라벨조차 없다.',
    '그래서 정상을 배운다. 변수를 하나씩 보는 z-score는 조합이 이상한 거래를 놓친다.',
    'Isolation Forest는 무작위로 쪼갰을 때 금방 혼자 남는 점을 이상으로 본다.',
    '알림 임계값은 비율로 정하지 않고, 조사팀이 하루에 볼 수 있는 50건에 맞춘다.',
  ];
  const review = [
    { q: 'One-Class SVM의 경계가 금액 축 하나로만 그어졌다. 먼저 의심할 것은?',
      o: ['nu를 너무 작게 잡았다', '피처를 표준화하지 않았다', 'contamination을 정하지 않았다'], a: 1,
      why: 'OC-SVM은 거리 기반이라 값이 큰 금액이 경계를 독차지한다. Isolation Forest와 달리 스케일링을 빠뜨리면 결과가 통째로 망가진다.' },
    { q: '거래 수백만 건으로 매일 이상 탐지 모델을 다시 학습해야 한다. 세 가지 중 맞는 선택은?',
      o: ['Isolation Forest', 'One-Class SVM', '금액 한 변수의 IQR'], a: 0,
      why: 'OC-SVM은 학습이 O(n²)급이라 수만 건이 한계다. IQR은 조합 이상을 놓치고, Isolation Forest는 거리 계산이 없어 수백만 건도 빠르다.' },
    { q: '라벨이 거의 없는 상태로 이상 탐지를 운영 중이다. 모델이 제 몫을 하는지 확인하는 방법은?',
      o: ['테스트셋 accuracy를 매일 계산한다', 'contamination을 올려 알림을 늘려 본다', '상위 N건의 적중률과 점수 분포 변화를 본다'], a: 2,
      why: '사기가 0.1%라 accuracy는 아무것도 말해 주지 않는다. 조사 결과로 precision@N을 추정하고, 확인된 사기의 순위를 역검증하고, 점수 drift를 감시한다.' },
  ];

  RA.page({ title: '이상 탐지 실험실 — 통계 · Isolation Forest · OC-SVM', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
