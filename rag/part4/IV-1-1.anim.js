/* IV-1-1 Dense Retrieval — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 문서 좌표·질문 좌표는 페이지의 학습용 2D 값(x 동물성, y 사물성)이고, 점수는 numpy 로 다시 계산한 값이다.
 * 4·5장면의 sim 점수(0.94, 0.86 …)와 0.99·0.97 은 코드 주석의 예시 값이라 그림에도 "예시"라고 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, cells, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 페이지 데이터 (학습용 2D 좌표) ----------
  const DOCS = [
    { id: 'D1', t: '강아지가 공원에서 뛰논다', n: '강아지', x: 0.88, y: 0.30, v: '[0.88, 0.30, …]', ang: 2.2 },
    { id: 'D2', t: 'A puppy chases the ball', n: 'puppy', x: 0.83, y: 0.40, v: '[0.83, 0.40, …]', ang: 4.7 },
    { id: 'D3', t: '고양이가 창가에 앉아있다', n: '고양이', x: 0.72, y: 0.25, v: '[0.72, 0.25, …]', ang: 1.8 },
    { id: 'D4', t: '자동차 엔진 오일을 교체했다', n: '자동차', x: 0.20, y: 0.85, v: '[0.20, 0.85, …]', ang: 55.8 },
    { id: 'D5', t: '주식 시장이 급락했다', n: '주식', x: 0.15, y: 0.70, v: '[0.15, 0.70, …]', ang: 56.9 },
  ];
  const Q = { t: '강아지가 뛰어다닌다', x: 0.86, y: 0.33 };
  const near = (i) => i < 3;

  // ---------- 자리 ----------
  const CARD = { x: 14, w: 250, h: 46, y: (i) => 70 + i * 54 };
  const SLAB = { x: 280, y: 46, w: 80, h: 264 };
  const PL = { x: 400, y: 60, w: 200, h: 200 };                       // 전체 평면 0~1
  const PX = (v) => PL.x + v * PL.w, PY = (v) => PL.y + PL.h - v * PL.h;
  const IN = { x: 640, y: 40, w: 300, h: 260, x0: 0.66, x1: 0.95, y1: 0.43 };   // 확대 창
  const SC = IN.w / (IN.x1 - IN.x0);
  const IX = (v) => IN.x + (v - IN.x0) * SC, IY = (v) => IN.y + (IN.y1 - v) * SC;
  const at = (d) => (near(DOCS.indexOf(d)) ? [IX(d.x), IY(d.y)] : [PX(d.x), PY(d.y)]);

  function star(cx, cy, r, s, col) { if (s <= 0) return; const p = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = (i % 2 ? r * 0.45 : r) * s; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    el('path', { d: 'M' + p.map((q) => q.join(',')).join(' L') + ' Z', fill: col || C.WARN, stroke: INK, 'stroke-width': 1.2 }); }

  // 평면: 축이 자라고(u), 눈금은 그 뒤에
  function plane(u, o) { o = o || {}; const g = u ?? 1;
    grow(PL.x, PL.y + PL.h, PL.x + PL.w, PL.y + PL.h, E(g, 0, 0.6), MUT, { plain: true, sw: 1.8 });
    grow(PL.x, PL.y + PL.h, PL.x, PL.y, E(g, 0, 0.6), MUT, { plain: true, sw: 1.8 });
    const op = fade(g, 0.5, 0.4);
    [0, 0.5, 1].forEach((v) => { mono(PX(v), PL.y + PL.h + 20, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); if (v) mono(PL.x - 8, PY(v) + 5, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); });
    tx(PL.x + PL.w, PL.y + PL.h + 42, 'x 동물성', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600, opacity: op });
    tx(PL.x, PL.y - 14, 'y 사물성', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: op }); }
  // 확대 창 (평면 위 작은 네모 → 오른쪽 큰 창)
  function inset(op) { if (op <= 0) return;
    const rx0 = PX(IN.x0), rx1 = PX(IN.x1), ry0 = PY(IN.y1), ry1 = PY(IN.y1 - IN.h / SC);
    el('rect', { x: rx0, y: ry0, width: rx1 - rx0, height: ry1 - ry0, fill: 'none', stroke: INFO, 'stroke-width': 1.5, 'stroke-dasharray': '4 3', opacity: op });
    el('line', { x1: rx1, y1: ry0, x2: IN.x, y2: IN.y, stroke: INFO, 'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: op * 0.7 });
    el('line', { x1: rx1, y1: ry1, x2: IN.x, y2: IN.y + IN.h, stroke: INFO, 'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: op * 0.7 });
    el('rect', { x: IN.x, y: IN.y, width: IN.w, height: IN.h, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 1.8, opacity: op });
    tx(IN.x + 12, IN.y + 22, '확대해서 보기', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: op }); }
  // 문서 점 i 를 크기 s 로 (확대 창 + 전체 평면 둘 다)
  const LBL = { D1: [14, 6, 'start'], D2: [14, 6, 'start'], D3: [0, 26, 'middle'], D4: [12, 5, 'start'], D5: [12, 5, 'start'] };
  function docPt(i, s, o) { o = o || {}; if (s <= 0) return; const d = DOCS[i], col = o.col || (near(i) ? ACC : INK);
    el('circle', { cx: PX(d.x), cy: PY(d.y), r: 4.5 * s, fill: col, opacity: o.op ?? 1 });
    const [x, y] = at(d);
    if (near(i)) el('circle', { cx: x, cy: y, r: 8 * s, fill: col, stroke: o.ring ? INK : 'none', 'stroke-width': 2.5, opacity: o.op ?? 1 });
    const [dx, dy, anc] = LBL[d.id]; tx(x + dx, y + dy, d.id, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': anc, opacity: (o.op ?? 1) * clamp(s) }); }
  function qPt(s) { if (s <= 0) return; star(PX(Q.x), PY(Q.y), 8, s); star(IX(Q.x), IY(Q.y), 13, s);
    tx(IX(Q.x) - 18, IY(Q.y) - 10, '★ 질문', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: WARN, opacity: clamp(s) }); }
  function slab(s, o) { o = o || {}; if (s <= 0) return; const g = card(SLAB.x + SLAB.w / 2, SLAB.y + SLAB.h / 2, SLAB.w, SLAB.h, { rx: 12, fill: o.fill || INFOBG, stroke: o.stroke || INFO, sw: 2.5, s });
    ['임베딩', '모델'].forEach((w, k) => tx(0, -12 + k * 22, w, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: o.stroke || INFO }, g));
    tx(SLAB.x + SLAB.w / 2, SLAB.y + SLAB.h + 22, o.sub || '1536차원', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: MUT, opacity: clamp(s) }); }
  // 문서 카드: vec 표시 vs(0→1), 강조 hot
  function docCard(i, o) { o = o || {}; const d = DOCS[i], cy = CARD.y(i), cx = CARD.x + CARD.w / 2 + (o.dx || 0);
    card(cx, cy, CARD.w, CARD.h, { rx: 8, fill: o.hot ? ACCBG : PANEL, stroke: o.hot ? ACC : GRID, sw: o.hot ? 2.5 : 1.5, op: o.op });
    tx(cx - CARD.w / 2 + 12, cy - 4, d.id, { 'font-size': 14.5, 'font-weight': 800, fill: near(i) ? ACC : INK, opacity: o.op ?? 1 });
    tx(cx - CARD.w / 2 + 40, cy - 4, d.t, { 'font-size': 14, 'font-weight': 600, opacity: o.op ?? 1 });
    const vs = o.vs ?? 0;
    if (vs > 0) mono(cx - CARD.w / 2 + 40, cy + 16, d.v, { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: vs * (o.op ?? 1) });
    else mono(cx - CARD.w / 2 + 40, cy + 16, '— (임베딩 전)', { 'font-size': 13.5, fill: OFF, opacity: o.op ?? 1 }); }

  // ---------- 1. 텍스트 → 벡터 ----------
  function s1(t, c) { const { k, u } = c;
    slab(k === 0 ? pop(u, 0.2) : 1);
    plane(k === 0 ? seg(u, 0.6, 2.0) : 1);
    if (k === 0) { pill(PL.x + PL.w / 2, PL.y + PL.h / 2, '아직 점이 없다', MUT, fade(u, 1.6), { fs: 13.5 }); return; }
    DOCS.forEach((d, i) => { const st = 0.2 + i * 0.35;
      const dx = k === 1 ? lerp(-12, 0, E(u, 0.15 + i * 0.3, 0.6 + i * 0.3)) : 0, op1 = k === 1 ? fade(u, 0.15 + i * 0.3, 0.35) : 1;
      const vs = k === 2 ? seg(u, st + 0.55, st + 0.8) : k > 2 ? 1 : 0;
      docCard(i, { dx, vs, hot: k === 3 && i < 2, op: k === 3 && i >= 2 ? 0.45 : op1 }); });
    if (k === 1) return;
    inset(k === 2 ? fade(u, 0.1, 0.4) : 1);
    DOCS.forEach((d, i) => { const st = 0.2 + i * 0.35, [x, y] = at(d), cy = CARD.y(i);
      if (k === 2) { dot([[CARD.x + CARD.w, cy], [SLAB.x + 6, cy], [SLAB.x + SLAB.w - 6, cy]], seg(u, st, st + 0.45), ACC, 6);
        dot([[SLAB.x + SLAB.w - 6, cy], [x, y]], seg(u, st + 0.45, st + 0.9), ACC, 6); }
      const s = k === 2 ? pop(u, st + 0.85, 0.5) : 1;
      docPt(i, s, { op: k === 3 && i >= 2 ? 0.35 : 1, ring: k === 3 && i < 2 }); });
    if (k === 3) { const [ax, ay] = at(DOCS[0]), [bx, by] = at(DOCS[1]), g = E(u, 0.3, 1.2);
      el('line', { x1: ax, y1: ay, x2: lerp(ax, bx, g), y2: lerp(ay, by, g), stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' });
      pill((ax + bx) / 2 + 58, (ay + by) / 2 + 4, '거리 0.11', INK, pop(u, 1.2), { mono: true, fs: 14, fill: PANEL });
      sub(IN.x + IN.w / 2, IN.y + IN.h - 14, '한국어 D1 · 영어 D2', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }
    if (k === 4) { const a = fade(u, 0.2, 0.6);
      el('ellipse', { cx: 562, cy: 196, rx: 40, ry: 30, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: a });
      tx(562, 156, '동물', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: a });
      const b = fade(u, 0.8, 0.6);
      el('ellipse', { cx: 437, cy: 106, rx: 24, ry: 32, fill: 'none', stroke: INK, 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: b });
      tx(474, 140, '자동차·주식', { 'font-size': 14, 'font-weight': 800, fill: INK, opacity: b });
      banner(480, 372, '의미가 비슷하면 가까운 점이 된다', pop(u, 1.5)); } }

  // ---------- 2. 질문도 같은 모델로 ----------
  const QC = { x: 139, y: 230 };
  function qCard(op) { card(QC.x, QC.y, 250, 46, { rx: 23, fill: WARNBG, stroke: WARN, sw: 2.5, op });
    tx(QC.x - 110, QC.y + 6, '★', { 'font-size': 16, fill: WARN, opacity: op }); tx(QC.x - 88, QC.y + 6, Q.t, { 'font-size': 15, 'font-weight': 700, opacity: op }); }
  function corpusPts(op) { DOCS.forEach((d, i) => docPt(i, 1, { op })); }
  function s2(t, c) { const { k, u } = c;
    slab(1);
    plane(1); inset(1); corpusPts(k === 0 ? 1 : 0.75);
    if (k === 0) {
      [['문서 5건', '같은 모델', true], ['질문', '같은 모델', true], ['질문', '다른 모델 B', false]].forEach(([a, b, ok], i) => { const y = 92 + i * 62, s = pop(u, 0.2 + i * 0.4);
        card(139, y, 250, 46, { rx: 10, stroke: ok ? GOOD : BAD, sw: 2, fill: ok ? GOODBG : BADBG, s });
        tx(30, y + 6, a, { 'font-size': 15, 'font-weight': 700, opacity: clamp(s) }); tx(112, y + 6, '→ ' + b, { 'font-size': 14.5, fill: ok ? GOOD : BAD, 'font-weight': 700, opacity: clamp(s) });
        if (ok) check(244, y, 9, s); else cross(244, y, 8, s); });
      const g = E(u, 1.3, 2.2), ox = PL.x, oy = PL.y + PL.h, a = -0.35, L = 190;
      grow(ox, oy, ox + Math.cos(a) * L, oy + Math.sin(a) * L, g, BAD, { dash: '6 4', plain: true });
      grow(ox, oy, ox + Math.cos(a - Math.PI / 2) * 110, oy + Math.sin(a - Math.PI / 2) * 110, g, BAD, { dash: '6 4', plain: true });
      tx(ox + 52, PL.y + PL.h + 64, '모델 B의 좌표축은 어긋나 있다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
      return; }
    qCard(1);
    if (k === 1) { const r1 = [[QC.x + 125, QC.y], [SLAB.x + 6, QC.y - 40], [SLAB.x + SLAB.w - 6, QC.y - 40]], r2 = [[SLAB.x + SLAB.w - 6, QC.y - 40], [IX(Q.x), IY(Q.y)]];
      dot(r1, seg(u, 0.2, 0.9), WARN, 7); dot(r2, seg(u, 0.9, 1.6), WARN, 7); }
    qPt(k === 1 ? pop(u, 1.5) : 1);
    if (k >= 1) { const op = k === 1 ? fade(u, 1.7) : 1;
      mono(24, 286, '[0.86, 0.33, 0.18,', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: op });
      mono(24, 306, ' 0.07, …, 0.42]', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: op });
      tx(24, 330, '숫자 1536개 (예시 값)', { 'font-size': 13.5, fill: MUT, opacity: op }); }
    if (k === 2) { DOCS.forEach((d, i) => { const g = E(u, 0.2 + i * 0.25, 0.9 + i * 0.25);
        if (near(i)) { const [x, y] = at(d); grow(IX(Q.x), IY(Q.y), x, y, g, WARN, { dash: '5 4', plain: true, sw: 2 }); }
        grow(PX(Q.x), PY(Q.y), PX(d.x), PY(d.y), g, WARN, { dash: '4 4', plain: true, sw: 1.6 }); });
      banner(480, 380, '같은 평면이라 모든 문서까지 거리를 잴 수 있다', pop(u, 1.8)); }
    if (k === 3) { const x0 = 400, y0 = 352, n = 40, cw = 9;
      for (let i = 0; i < n; i++) { const keep = i < 2, op = keep ? 1 : lerp(1, 0.15, E(u, 0.8, 1.8));
        el('rect', { x: x0 + i * (cw + 1.5), y: y0, width: cw, height: 20, rx: 2, fill: keep ? WARN : OFF, opacity: op * fade(u, 0.1 + i * 0.012, 0.2) }); }
      mono(x0 + n * (cw + 1.5) + 10, y0 + 16, '… 1536칸', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      tx(x0, y0 + 46, '그림은 앞의 2칸(x, y)만 보여 준다. 원리는 1536칸에서도 같다', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.6) }); } }

  // ---------- 3. 코사인 유사도 → top-k ----------
  const PL3 = { x: 600, y: 50, s: 300 };
  const P3 = (x, y) => [PL3.x + x * PL3.s, PL3.y + PL3.s - y * PL3.s];
  function ray(x, y, u, col, o) { const [ox, oy] = P3(0, 0), L = Math.hypot(x, y), [ex, ey] = P3(x / L * 1.02, y / L * 1.02); grow(ox, oy, ex, ey, u, col, o); }
  function plane3(op) { const [ox, oy] = P3(0, 0);
    el('line', { x1: ox, y1: oy, x2: ox + PL3.s, y2: oy, stroke: MUT, 'stroke-width': 1.8, opacity: op }); el('line', { x1: ox, y1: oy, x2: ox, y2: oy - PL3.s, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    tx(ox + PL3.s, oy + 24, 'x 동물성', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600, opacity: op });
    tx(ox + 8, oy - PL3.s + 4, 'y 사물성', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: op }); }
  function arc(a0, a1, r, col, op, label) { const [ox, oy] = P3(0, 0), p = (a) => [ox + Math.cos(a) * r, oy - Math.sin(a) * r], [x0, y0] = p(a0), [x1, y1] = p(a1);
    el('path', { d: `M${x0},${y0} A${r},${r} 0 0 0 ${x1},${y1}`, fill: 'none', stroke: col, 'stroke-width': 2.5, opacity: op });
    if (label) { const [lx, ly] = p((a0 + a1) / 2); tx(lx + 10, ly + 4, label, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op }); } }
  function s3(t, c) { const { k, u } = c, b = c.beat, sc = b.scores || [];
    plane3(1);
    const aq = Math.atan2(Q.y, Q.x), a4 = Math.atan2(DOCS[3].y, DOCS[3].x);
    // 광선: k0 는 질문과 D4 만, 이후 모두
    DOCS.forEach((d, i) => { const g = k === 0 ? (i === 3 ? E(u, 0.6, 1.3) : 0) : k === 1 ? E(u, 0.2 + i * 0.2, 0.8 + i * 0.2) : 1;
      const out = k === 3 && i >= 3; ray(d.x, d.y, g, out ? OFF : near(i) ? ACC : INK, { plain: true, sw: 2 });
      const [x, y] = P3(d.x, d.y); if (g > 0.95 || k > 0) el('circle', { cx: x, cy: y, r: 5, fill: out ? OFF : near(i) ? ACC : INK }); });
    ray(Q.x, Q.y, k === 0 ? E(u, 0.2, 0.9) : 1, WARN, { plain: true, sw: 3 });
    const [qx, qy] = P3(Q.x, Q.y); star(qx, qy, 10, k === 0 ? pop(u, 0.8) : 1);
    tx(qx + 14, qy - 14, '질문', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: k === 0 ? fade(u, 0.9) : 1 });
    [3, 4].forEach((i) => { const [x, y] = P3(DOCS[i].x, DOCS[i].y); tx(x + 12, y + 5, DOCS[i].id, { 'font-size': 15, 'font-weight': 800, fill: k === 3 ? OFF : INK, opacity: k === 0 && i === 4 ? 0 : 1 }); });
    if (k >= 1) tx(840, 322, 'D1 · D2 · D3', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    if (k === 0) { arc(aq, a4, 92, BAD, fade(u, 1.3), 'θ ≈ 56°');
      card(190, 110, 330, 64, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 0.2) });
      mono(190, 117, 'cos θ = a·b / (|a| |b|)', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      [['같은 방향', '1.0', GOOD], ['직각', '0', MUT], ['정반대', '−1.0', BAD]].forEach(([a, v, col], i) => { const y = 190 + i * 40, op = fade(u, 1.0 + i * 0.3);
        tx(40, y, a, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(170, y, v, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: op }); });
      mono(40, 330, '질문 ↔ D4 : cos 56° = 0.5626', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      return; }
    // 점수 막대: k1 문서 순, k2 부터 점수 순
    const order = sc.map((r, i) => i).sort((a, b2) => sc[b2].s - sc[a].s);
    const rowY = (i) => { const rank = order.indexOf(i), y0 = 78 + i * 54, y1 = 78 + rank * 54; return k === 1 ? y0 : k === 2 ? lerp(y0, y1, E(u, 0.2, 1.2)) : y1; };
    tx(16, 50, '질문과의 코사인 유사도', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(470, 50, '각도 차', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' });
    sc.forEach((r, i) => { const d = DOCS[i], y = rowY(i), top = order.indexOf(i) < (b.k || 0), out = k === 3 && !top;
      const g = k === 1 ? E(u, 0.2 + i * 0.25, 0.9 + i * 0.25) : 1, v = r.s * g;
      if (k >= 2 && top) el('rect', { x: 8, y: y - 20, width: 470, height: 40, rx: 8, fill: ACCBG, opacity: k === 2 ? fade(u, 1.3) : 1 });
      tx(16, y + 5, d.id + ' ' + d.n, { 'font-size': 15, 'font-weight': 700, fill: out ? OFF : INK });
      el('rect', { x: 120, y: y - 9, width: 220, height: 18, rx: 4, fill: SOFT });
      el('rect', { x: 120, y: y - 9, width: Math.max(2, 220 * v), height: 18, rx: 4, fill: out ? OFF : near(i) ? ACC : INK });
      mono(348, y + 5, v.toFixed(4), { 'font-size': 14.5, 'font-weight': 700, fill: out ? OFF : INK });
      mono(470, y + 5, d.ang.toFixed(1) + '°', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: k === 1 ? fade(u, 1.6) : 1 });
      if (out) cross(492, y, 7, pop(u, 0.2 + (i - 3) * 0.3)); });
    if (k >= 2) { const y = 78 + 2 * 54 + 27, g = k === 2 ? E(u, 1.3, 2.0) : 1;
      grow(8, y, 8 + 470 * g, y, 1, BAD, { plain: true, dash: '6 4', sw: 2 });
      pill(520, y, 'k = 3', BAD, k === 2 ? pop(u, 1.8) : 1, { mono: true, fs: 14, fill: PANEL }); }
    if (k === 3) { pill(250, 372, 'similarity_search(query, k=3)', ACC, pop(u, 1.0), { mono: true, fs: 14, fill: PANEL });
      pill(250, 408, 'FAISS · pgvector ANN 인덱스', INFO, pop(u, 1.5), { fs: 13.5, fill: PANEL }); } }

  // ---------- 4. 단어가 달라도 뜻이 같으면 ----------
  function s4(t, c) { const { k, u } = c, ps = c.beat.pairs || [], prev = (c.prev && c.prev.pairs) || [];
    if (k === 0) {
      pill(150, 130, '강아지', ACC, pop(u, 0.2), { fs: 16, fill: PANEL }); pill(150, 270, 'puppy', ACC, pop(u, 0.4), { fs: 16, fill: PANEL });
      grow(200, 130, 330, 190, E(u, 0.6, 1.1), ACC); grow(200, 270, 330, 214, E(u, 0.7, 1.2), ACC);
      card(390, 202, 110, 80, { rx: 12, fill: INFOBG, stroke: INFO, sw: 2.5, text: '임베딩\n모델', fs: 15, fw: 800, color: INFO, s: pop(u, 0.4) });
      const ox = 520, oy = 300, L = 200, a1 = 0.62, a2 = 0.82, g = E(u, 1.2, 1.9);
      grow(ox, oy, ox + Math.cos(a1) * L, oy - Math.sin(a1) * L, g, ACC, { sw: 3 }); grow(ox, oy, ox + Math.cos(a2) * L, oy - Math.sin(a2) * L, g, INK, { sw: 3 });
      if (g >= 1) { el('path', { d: `M${ox + Math.cos(a1) * 70},${oy - Math.sin(a1) * 70} A70,70 0 0 0 ${ox + Math.cos(a2) * 70},${oy - Math.sin(a2) * 70}`, fill: 'none', stroke: WARN, 'stroke-width': 3 });
        tx(ox + 82, oy - 62, 'θ', { 'font-size': 17, 'font-weight': 800, fill: WARN }); }
      tx(ox + Math.cos(a1) * L + 8, oy - Math.sin(a1) * L + 4, '강아지', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      tx(ox + Math.cos(a2) * L - 6, oy - Math.sin(a2) * L - 8, 'puppy', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      card(820, 330, 190, 64, { rx: 10, stroke: WARN, sw: 2.5, fill: WARNBG, text: 'sim = cos θ', fs: 18, fw: 800, mono: true, s: pop(u, 2.1) });
      return; }
    tx(40, 40, '표현 a', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(250, 40, '표현 b', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    tx(450, 40, 'sim(a, b) · 예시 값', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    ps.forEach((p, i) => { const y = 72 + i * 40, isNew = i >= prev.length, s = isNew ? pop(u, 0.2 + (i - prev.length) * 0.3) : 1, low = p.kind === '무관';
      if (s <= 0) return; const op = clamp(s), col = low ? MUT : ACC;
      if (p.b === 'puppy' && k === 1) el('rect', { x: 30, y: y - 18, width: 900, height: 36, rx: 8, fill: WARNBG, opacity: fade(u, 1.8) });
      pill(40 + (tw(p.a, 14) + 26) / 2, y, p.a, low ? MUT : INK, s, { fs: 14, fill: PANEL });
      tx(226, y + 5, '↔', { 'font-size': 16, fill: MUT, 'text-anchor': 'middle', opacity: op });
      pill(250 + (tw(p.b, 14) + 26) / 2, y, p.b, low ? MUT : INK, s, { fs: 14, fill: PANEL });
      const g = isNew ? E(u, 0.3 + (i - prev.length) * 0.3, 1.1 + (i - prev.length) * 0.3) : 1;
      el('rect', { x: 450, y: y - 9, width: 260, height: 18, rx: 4, fill: SOFT, opacity: op });
      el('rect', { x: 450, y: y - 9, width: Math.max(2, 260 * p.s * g), height: 18, rx: 4, fill: col, opacity: op });
      mono(720, y + 5, (p.s * g).toFixed(2), { 'font-size': 15, 'font-weight': 800, fill: low ? MUT : INK, opacity: op });
      pill(850, y, p.kind, low ? MUT : p.kind === '다국어' ? INFO : p.kind === '의역' ? WARN : GOOD, s, { fs: 13.5, fill: PANEL }); });
    if (k === 1) tx(480, 402, '강아지 ↔ puppy: 겹치는 글자 0개, 키워드 검색이면 0점', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.0) });
    if (k === 3) { const y = 72 + 5.5 * 40; grow(450 + 260 * 0.5, 52, 450 + 260 * 0.5, 72 + 7 * 40 + 20, E(u, 1.4, 2.0), MUT, { plain: true, dash: '4 4', sw: 1.5 });
      tx(480, 402, '뜻이 같으면 높게, 다르면 0.2 언저리', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); } }

  // ---------- 5. 한계 — 한 글자 차이 ----------
  const BM = ['"15" 토큰으로 구분', '"BRCA1" 토큰으로 구분', '코드 문자열 그대로'];
  function strCells(x, y, s, other, o) { o = o || {}; const ch = [...s];
    cells(x, y, ch.map((q) => (q === ' ' ? '' : q)), { w: 24, h: 26, gap: 3, fs: 14, style: (i) => { const diff = ch[i] !== [...other][i];
      return diff && o.mark ? { stroke: BAD, fill: BADBG, color: BAD, sw: 2.5, s: o.mark } : { stroke: ch[i] === ' ' ? 'none' : GRID, sw: 1.2, op: o.op }; } }); }
  function s5(t, c) { const { k, u } = c, b = c.beat, cs = b.cases || [], np = (c.prev && c.prev.cases) ? c.prev.cases.length : 0;
    tx(84, 34, '질문 / 회수된 문서', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(470, 34, 'Dense 유사도 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: k >= 1 ? 1 : 0.3 });
    tx(780, 34, 'BM25라면', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: k >= 1 ? 1 : 0.3 });
    cs.forEach((q, i) => { const y = 56 + i * 80, isNew = i >= np && k > 0, a = isNew ? fade(u, 0.15, 0.4) : 1; if (k === 0 && i > 0) return;
      tx(40, y + 18, '질문', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: a }); tx(40, y + 48, '문서', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: a });
      const mk = k === 0 ? pop(u, 1.0) : isNew ? pop(u, 0.6) : 1;
      strCells(84, y, q.q, q.d, { mark: mk, op: a }); strCells(84, y + 30, q.d, q.q, { mark: mk, op: a });
      if (k === 0) { tx(470, y + 34, '글자 1개가 다르면 다른 제품이다', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) }); return; }
      const show = i === 0 && k === 1 ? E(u, 0.4, 1.4) : isNew ? E(u, 0.9, 1.8) : 1;
      if (q.s != null) { el('rect', { x: 470, y: y + 20, width: 200, height: 18, rx: 4, fill: SOFT, opacity: a });
        el('rect', { x: 470, y: y + 20, width: Math.max(2, 200 * q.s * show), height: 18, rx: 4, fill: BAD, opacity: a });
        mono(678, y + 35, (q.s * show).toFixed(2), { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: a }); }
      else tx(470, y + 35, '다른 코드도 높게 잡힘', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: a * show });
      const bs = i === 0 && k === 1 ? pop(u, 1.6) : isNew ? pop(u, 1.9) : 1;
      check(790, y + 29, 8, bs); tx(806, y + 34, BM[i], { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: clamp(bs) }); });
    if (k === 2) [['모델이 못 본 사내 용어 (MAU30)', '엉뚱한 벡터'], ['질문마다 임베딩 API 호출', '100ms+'], ['문서가 바뀌면', '전체 재임베딩']].forEach(([a, v], i) => {
      const x = 170 + i * 310, s = pop(u, 1.2 + i * 0.3); card(x, 330, 290, 62, { rx: 10, stroke: WARN, sw: 2, fill: WARNBG, s });
      tx(x, 324, a, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: clamp(s) }); tx(x, 346, v, { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: clamp(s) }); });
    if (k >= 3) { const steps = [['Dense', 'IV-1-1'], ['+ BM25', 'IV-1-2'], ['Hybrid', 'IV-1-3'], ['Re-ranking', 'IV-2-1']];
      steps.forEach(([a, id], i) => { const x = 140 + i * 225, s = k === 3 ? pop(u, 0.9 + i * 0.35) : 1, hot = k === 4 && i === 2;
        if (i) grow(x - 225 + 78, 320, x - 80, 320, k === 3 ? E(u, 0.7 + i * 0.35, 1.0 + i * 0.35) : 1, ACC);
        card(x, 320, 150, 56, { rx: 28, fill: hot ? ACC : i === 0 ? SOFT : ACCBG, stroke: ACC, sw: 2.2, s });
        tx(x, 316, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? PANEL : INK, opacity: clamp(s) });
        mono(x, 336, id, { 'font-size': 13.5, 'text-anchor': 'middle', fill: hot ? PANEL : MUT, opacity: clamp(s) }); });
      if (k === 4) tx(480, 396, 'Dense만 쓰지 말고 BM25와 함께 쓴다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'Dense Retrieval에서 의미가 비슷한 두 문서는 벡터 공간에서 어떻게 놓이는가?',
      o: ['같은 언어일 때만 가까이 놓인다', '가까운 점으로 놓인다', '글자 수가 비슷할 때 가까이 놓인다'], a: 1,
      why: '임베딩 모델은 의미를 좌표로 옮긴다. 한국어 D1과 영어 D2도 학습용 2D 좌표에서 거리 0.11로 붙어 있다.' },
    { q: '질문을 임베딩할 때 문서와 같은 모델을 써야 하는 이유는 무엇인가?',
      o: ['모델마다 좌표계가 달라 거리를 비교할 수 없어서', '같은 모델을 쓰면 API 요금이 더 싸서', '질문이 문서보다 짧아서'], a: 0,
      why: '모델이 다르면 같은 뜻도 다른 좌표에 놓인다. 같은 모델로 만든 벡터끼리만 거리와 각도가 뜻을 가진다.' },
    { q: '코사인 유사도가 1.0에 가깝다는 것은 무엇을 뜻하는가?',
      o: ['두 벡터의 길이가 같다', '두 문서의 단어가 모두 같다', '두 벡터의 방향이 거의 같다'], a: 2,
      why: '코사인은 각도만 본다. 질문과 D3·D1·D2의 각도 차이가 5도 안쪽이라 0.99 이상이 나왔다.' },
    { q: '키워드 검색으로는 0점인 "강아지"와 "puppy"를 Dense가 이어 줄 수 있는 이유는 무엇인가?',
      o: ['두 단어의 철자가 비슷해서', '임베딩 모델이 학습하며 두 단어를 가까운 벡터로 배워서', '사전에 동의어로 직접 등록해 둬서'], a: 1,
      why: '겹치는 글자는 없지만 임베딩 공간에서는 같은 영역에 놓인다. 코드의 예시 값으로 0.86이 나온다.' },
    { q: 'Dense Retrieval이 특히 약한 질문은 무엇인가?',
      o: ['"ORA-00942"처럼 한 글자 차이로 뜻이 갈리는 코드', '"점심 메뉴 추천해줘" 같은 풀어쓴 질문', '영어 문서를 한국어로 묻는 질문'], a: 0,
      why: 'ORA-00942와 ORA-00904는 벡터가 거의 같은 자리에 놓인다. 토큰을 그대로 맞추는 BM25가 이런 질문에 강하다.' },
  ];

  const summary = [
    'Dense Retrieval은 문서를 임베딩 벡터로 바꿔 의미가 비슷한 문서를 가까운 점으로 놓는다.',
    '질문도 문서와 같은 모델로 임베딩해야 같은 좌표계에서 거리를 잴 수 있다.',
    '코사인 유사도가 높은 순으로 k개를 고른다. 2D 예제에서는 D3, D1, D2가 남았다.',
    '동의어와 다국어는 잘 잡지만 iPhone 15와 14 같은 한 글자 차이는 구분하지 못한다.',
  ];
  const review = [
    { q: '쇼핑몰에 Dense 검색만 붙였더니 "iPhone 15 Pro 케이스" 질문에 iPhone 14 Pro 케이스가 1위로 나온다. 먼저 손볼 곳은?',
      o: ['임베딩 차원을 3072로 늘린다', 'BM25 같은 키워드 검색을 함께 쓴다', 'top-k를 3에서 10으로 늘린다'], a: 1,
      why: '모델명처럼 한 글자로 뜻이 갈리는 질문은 두 벡터가 거의 겹친다. "15" 토큰을 그대로 맞추는 BM25를 더해야 정확한 문서가 올라온다.' },
    { q: '문서는 모델 A로 임베딩해 두고, 비용을 아끼려 질문만 더 싼 모델 B로 바꿨다. 검색이 엉망이 된 이유는?',
      o: ['질문 벡터와 문서 벡터가 서로 다른 좌표계에 놓여서', '모델 B는 코사인 대신 거리만 계산해서', 'FAISS 인덱스가 새 질문을 저장하지 못해서'], a: 0,
      why: '같은 모델로 만든 벡터끼리만 거리가 뜻을 가진다. 모델을 바꾸려면 문서 전체를 다시 임베딩해야 한다.' },
    { q: '"강아지 산책" 질문에 영어 문서 "dog walking tips"가 상위에 나왔다. 이를 가능하게 한 것은?',
      o: ['질문을 영어로 번역하는 전처리', '문서 길이를 맞추는 정규화', '질문과 문서를 같은 의미 공간에 놓는 임베딩'], a: 2,
      why: '임베딩 모델은 언어가 달라도 뜻이 같으면 가까운 벡터를 만든다. 그래서 겹치는 단어가 없어도 코사인 유사도가 높게 나온다.' },
  ];

  R.page({ title: '벡터 공간 위의 의미 검색', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
