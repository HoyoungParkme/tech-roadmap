/* III-2-1 Vector Store ANN 검색 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 점 24개와 쿼리는 페이지의 POINTS · QUERY, 크기별 시간은 BENCH(예시 규모 값)를 읽는다.
 * 거리·정답·후보 셀 결과는 numpy 로 다시 계산해 맞췄다: 정답 [8,7,6], 후보 셀 [5,6,8,10,17] → ANN [8,6,10]. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, check, cross, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const D = () => (typeof POINTS === 'undefined' ? null : { P: POINTS, Q: QUERY, B: BENCH });
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const X = (p) => 40 + p * 4.2, Y = (p) => 36 + p * 3.6;
  const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  const CELL = { x0: 10, x1: 52, y0: 36, y1: 64 };   // 쿼리가 든 후보 셀 (안의 점: 5, 6, 8, 10, 17)
  const inCell = (p) => p.x >= CELL.x0 && p.x <= CELL.x1 && p.y >= CELL.y0 && p.y <= CELL.y1;
  function star(x, y, r, col, s) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; pts.push(`${x + Math.cos(a) * rr * (s ?? 1)},${y + Math.sin(a) * rr * (s ?? 1)}`); }
    el('polygon', { points: pts.join(' '), fill: col || ACC, stroke: PANEL, 'stroke-width': 1.5 }); }
  // 점 공간. st(p) → { col, r, ring, op }
  function space(d, st, o) { o = o || {};
    zone(30, 26, 440, 384, o.title || '저장된 벡터 24개 (2D 그림)', { fill: SOFT });
    if (o.grid) { const g = o.grid; [[X(52), Y(0), X(52), Y(100)], [X(0), Y(36), X(100), Y(36)], [X(0), Y(64), X(100), Y(64)], [X(76), Y(0), X(76), Y(100)], [X(26), Y(0), X(26), Y(36)]].forEach(([a, b, c2, d2]) => {
        el('line', { x1: a, y1: b, x2: lerp(a, c2, g), y2: lerp(b, d2, g), stroke: MUT, 'stroke-width': 1.5, 'stroke-dasharray': '5 5', opacity: 0.6 }); }); }
    if (o.cell) el('rect', { x: X(CELL.x0), y: Y(CELL.y0), width: (CELL.x1 - CELL.x0) * 4.2, height: (CELL.y1 - CELL.y0) * 3.6, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: o.cell });
    d.P.forEach((p) => { const s = st(p) || {}; if (s.op === 0) return; const x = X(p.x), y = Y(p.y);
      if (s.ring) el('circle', { cx: x, cy: y, r: 13, fill: 'none', stroke: s.ring, 'stroke-width': 3 });
      el('circle', { cx: x, cy: y, r: s.r || 6, fill: s.col || OFF, opacity: s.op ?? 1 });
      if (s.id) mono(x + 9, y - 8, String(p.id), { 'font-size': 13.5, 'font-weight': 700, fill: s.col === OFF ? MUT : s.col || MUT }); });
    star(X(d.Q.x), Y(d.Q.y), 13, ACC, o.qs); }
  const sorted = (d, pts) => pts.map((p) => ({ ...p, d: dist(p, d.Q) })).sort((a, b) => a.d - b.d);

  // ---------- 1. Brute Force ----------
  function s1(t, c) { const { k, u } = c, d = D(); if (!d) return;
    const top = sorted(d, d.P).slice(0, 3).map((p) => p.id);
    const nScan = k === 0 ? Math.floor(E(u, 0.3, 2.3) * 8.99) : k === 1 ? 8 + Math.floor(E(u, 0.1, 1.0) * 16.99) : 24;
    const order = d.P.map((p) => p.id), scanned = new Set(order.slice(0, Math.min(24, nScan)));
    space(d, (p) => ({ col: k >= 2 && top.includes(p.id) ? GOOD : scanned.has(p.id) ? WARN : OFF, id: k >= 2 ? top.includes(p.id) : false, ring: k >= 2 && top.includes(p.id) ? GOOD : null, r: k >= 2 && top.includes(p.id) ? 8 : 6 }), { qs: k === 0 ? pop(u, 0.1) : 1 });
    if (k <= 1 && nScan > 0 && nScan <= 24) { const p = d.P[Math.min(23, nScan - 1)]; el('line', { x1: X(d.Q.x), y1: Y(d.Q.y), x2: X(p.x), y2: Y(p.y), stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 3' }); }
    // 오른쪽: 거리 표
    tx(500, 52, k === 0 ? '하나씩 거리 계산' : '거리순 정렬', { 'font-size': 16, 'font-weight': 800 });
    mono(930, 52, `검사 ${Math.min(24, nScan)} / 24`, { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'end' });
    const rows = k === 0 ? d.P.slice(0, Math.min(8, nScan)).map((p) => ({ ...p, d: dist(p, d.Q) })) : sorted(d, d.P).slice(0, 8);
    rows.forEach((p, i) => { const y = 80 + i * 30, hot = k >= 2 && i < 3;
      if (hot) el('rect', { x: 496, y: y - 4, width: 250, height: 28, rx: 5, fill: GOODBG });
      mono(510, y + 15, 'id ' + String(p.id).padStart(2, ' '), { 'font-size': 14.5, 'font-weight': hot ? 800 : 600, fill: hot ? GOOD : INK });
      mono(730, y + 15, 'd = ' + p.d.toFixed(2), { 'font-size': 14.5, 'text-anchor': 'end', fill: hot ? GOOD : INK, opacity: k === 1 ? fade(u, 1.1) : 1 }); });
    if (k === 1) sub(620, 336, '… 24개 전부 계산한 뒤 정렬', fade(u, 1.3));
    if (k === 2) { pill(840, 120, 'top-3 = [8, 7, 6]', GOOD, pop(u, 0.4), { mono: true, fs: 14 }); note(500, 350, '1M × 1536차원이면 약 500ms (예시)', fade(u, 1.2)); note(500, 378, '정답은 언제나 정확하다', fade(u, 1.6), { fill: GOOD }); }
    if (k === 3) { card(848, 220, 180, 120, { rx: 12, stroke: BAD, sw: 2.2, s: pop(u, 0.2) });
      tx(770, 196, 'QPS 100 이면', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 0.3) });
      mono(770, 230, '100 × 500ms', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.6) }); mono(770, 262, '= 초당 50초', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      note(500, 350, '계산량이 데이터 수 n에 그대로 비례 (O(n))', fade(u, 1.5)); note(500, 378, '작은 데이터(< 10K)에만 쓴다', fade(u, 1.9), { fill: BAD }); } }

  // ---------- 2. ANN ----------
  function s2(t, c) { const { k, u } = c, d = D(); if (!d) return;
    const probe = d.P.filter(inCell), ann = sorted(d, probe).slice(0, 3).map((p) => p.id), truth = sorted(d, d.P).slice(0, 3).map((p) => p.id);
    const missed = truth.find((id) => !ann.includes(id));
    space(d, (p) => { const inC = inCell(p);
      if (k === 0) return { col: OFF };
      const res = k >= 2 && ann.includes(p.id), miss = k >= 3 && p.id === missed;
      return { col: miss ? BAD : res ? GOOD : inC ? ACC : OFF, op: inC || miss ? 1 : 0.55, id: inC || miss, ring: miss ? BAD : res ? GOOD : null, r: res || miss ? 8 : 6 }; },
    { grid: k === 0 ? E(u, 0.2, 1.4) : 1, cell: k === 0 ? fade(u, 1.4) : 1, title: '인덱스가 공간을 셀로 나눴다' });
    if (k >= 2 && k <= 3) probe.forEach((p, i) => grow(X(d.Q.x), Y(d.Q.y), X(p.x), Y(p.y), k === 2 ? E(u, 0.2 + i * 0.15, 0.6 + i * 0.15) : 1, ACC, { plain: true, sw: 1.5, dash: '3 3' }));
    if (k === 0) { tx(500, 70, 'Chroma.from_documents(…)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      note(500, 120, '저장할 때 공간을 미리 나눠 둔다', fade(u, 0.6)); note(500, 150, '쿼리가 든 셀 = 후보 셀', fade(u, 1.6), { fill: ACC }); return; }
    if (k === 1) { tx(500, 70, 'similarity_search(…, k=3)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      mono(500, 130, '후보 ' + probe.length + '개', { 'font-size': 24, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) }); mono(640, 130, `[${probe.map((p) => p.id).join(', ')}]`, { 'font-size': 15, opacity: fade(u, 0.8) });
      note(500, 180, '나머지 ' + (24 - probe.length) + '개는 거리도 재지 않는다', fade(u, 1.4), { fill: MUT }); return; }
    if (k === 2) { tx(500, 70, '후보만 거리 계산', { 'font-size': 16, 'font-weight': 800 });
      mono(500, 120, `검사 ${probe.length} / 24`, { 'font-size': 22, 'font-weight': 800, fill: ACC });
      pill(620, 180, `ANN top-3 = [${ann.join(', ')}]`, GOOD, pop(u, 1.4), { mono: true, fs: 14 });
      note(500, 250, '1M 규모 예시: 500ms → 1.2ms', fade(u, 1.8)); return; }
    if (k === 3) { tx(500, 70, '셀 바로 밖의 진짜 정답', { 'font-size': 16, 'font-weight': 800 });
      mono(500, 112, `정답  [${truth.join(', ')}]`, { 'font-size': 16, 'font-weight': 700 }); mono(500, 142, `ANN   [${ann.join(', ')}]`, { 'font-size': 16, 'font-weight': 700, fill: ACC });
      note(500, 192, missed + '번(d = 10.00)은 셀 밖이라 놓쳤다', fade(u, 0.6), { fill: BAD });
      mono(500, 250, 'recall@3 = 2/3 = 67%', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) }); return; }
    tx(500, 70, '그래도 ANN을 쓰는 이유', { 'font-size': 16, 'font-weight': 800 });
    [['이 그림 (셀 1개만)', 0.67, BAD], ['실전 (좋은 인덱스)', 0.97, GOOD]].forEach(([n, v, col], i) => { const y = 110 + i * 70;
      tx(500, y, n, { 'font-size': 14.5, 'font-weight': 700 }); hbar(500, y + 12, 300, v, 1, { col, h: 22, text: i ? '95~99%' : '67%', u: E(u, 0.3 + i * 0.5, 1.1 + i * 0.5) }); });
    note(500, 290, '속도는 수백~수만 배', fade(u, 1.8), { fill: GOOD }); note(500, 320, '셀을 여러 개 보면 놓침이 준다', fade(u, 2.1), { fill: MUT }); }

  // ---------- 3. Trade-off ----------
  const LX = (ms) => 200 + (Math.log10(ms) + 1) * 110;   // 0.1ms → 200, 100000ms → 860
  function s3(t, c) { const { k, u } = c, d = D(); if (!d) return;
    if (k <= 1) { tx(40, 46, '벡터 수별 검색 시간 (로그 눈금, 예시 규모 값)', { 'font-size': 16, 'font-weight': 800 });
      [0.1, 1, 10, 100, 1000, 10000, 100000].forEach((v) => { el('line', { x1: LX(v), y1: 70, x2: LX(v), y2: 360, stroke: GRID, 'stroke-dasharray': '3 4' }); mono(LX(v), 380, v >= 1000 ? v / 1000 + 's' : v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      d.B.forEach((b, i) => { const y = 84 + i * 72, g1 = k === 0 ? E(u, 0.2 + i * 0.35, 1.0 + i * 0.35) : 1;
        tx(185, y + 26, b.size, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', class: 'mono' });
        el('rect', { x: 200, y, width: Math.max(2, (LX(b.bf) - 200) * g1), height: 20, rx: 3, fill: b.bf >= 50000 ? BAD : WARN });
        el('rect', { x: 200, y: y + 24, width: Math.max(2, (LX(b.ann) - 200) * g1), height: 20, rx: 3, fill: ACC });
        mono(LX(b.bf) * g1 + 200 * (1 - g1) + 8, y + 15, b.bf + 'ms', { 'font-size': 13.5, 'font-weight': 700, opacity: g1 >= 1 ? 1 : 0 });
        pill(LX(b.ann) + 60, y + 34, '×' + b.ratio.replace('x', ''), ACC, k === 0 ? pop(u, 1.2 + i * 0.35) : 1, { fs: 13.5, mono: true }); });
      tx(780, 46, '■ BF', { 'font-size': 14, 'font-weight': 700, fill: WARN }); tx(840, 46, '■ ANN', { 'font-size': 14, 'font-weight': 700, fill: ACC });
      if (k === 1) { el('rect', { x: 36, y: 74, width: 900, height: 66, rx: 8, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
        tx(930, 98, '10K 미만: BF도 OK', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.4) });
        el('rect', { x: 36, y: 216, width: 900, height: 138, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.0) });
        tx(930, 345, '1M 이상: ANN 필수 · 1억에서 50초는 서비스 불가', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.2) }); }
      return; }
    if (k === 2) { const rows = [['', 'Brute Force', 'ANN'], ['정확도(recall)', '100%', '95~99%'], ['시간 복잡도', 'O(n)', 'O(log n) ~ O(1)'], ['인덱스 빌드', '불필요', '필요 (수~수십초)'], ['메모리', '원본만', '원본 + 인덱스'], ['적합', '< 10K 벡터', '100K+ 프로덕션']];
      rows.forEach((r, i) => { const y = 70 + i * 54, op = fade(u, 0.1 + i * 0.3); if (i) el('line', { x1: 60, y1: y - 34, x2: 900, y2: y - 34, stroke: GRID, opacity: op });
        r.forEach((s, j) => tx([70, 380, 640][j], y, s, { 'font-size': i ? 16 : 15, 'font-weight': i === 0 || j === 0 ? 800 : 600, fill: i === 0 ? (j === 1 ? WARN : j === 2 ? ACC : MUT) : j === 0 ? MUT : INK, opacity: op, class: i === 2 && j ? 'mono' : null })); });
      return; }
    // k3: 저울
    const tilt = E(u, 0.3, 1.5) * 0.12, cx = 480, cy = 200;
    el('path', { d: `M${cx - 30},330 L${cx},${cy} L${cx + 30},330 Z`, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    const lx = cx - 230 * Math.cos(tilt), ly = cy - 230 * Math.sin(-tilt), rx = cx + 230 * Math.cos(tilt), ry = cy + 230 * Math.sin(-tilt);
    el('line', { x1: lx, y1: ly, x2: rx, y2: ry, stroke: INK, 'stroke-width': 4 });
    card(lx, ly + 50, 220, 70, { rx: 10, stroke: WARN, text: '정확도\n1~5% 양보', fs: 16 }); card(rx, ry + 50, 220, 70, { rx: 10, stroke: ACC, fill: ACCBG, text: '속도\n1000배 이상', fs: 16 });
    banner(480, 380, '양보한 양은 recall@k로 잰다', pop(u, 1.6)); }

  // ---------- 4. recall@k ----------
  function slots(x, y, ids, st, u0) { ids.forEach((id, i) => { const s = st(id, i); card(x + i * 74, y, 64, 48, { rx: 8, text: id == null ? '' : String(id), fs: 18, mono: true, stroke: s.col || GRID, fill: s.fill || PANEL, color: s.col || INK, sw: 2.5, s: s.s ?? 1 }); }); }
  function s4(t, c) { const { k, u } = c, d = D(); if (!d) return; const b = c.beat.dataState || {}, truth = b.truth || [], pred = b.predicted || [];
    if (k <= 1) { mono(60, 60, 'recall@k = |예측 ∩ 정답| / k', { 'font-size': 18, 'font-weight': 800 });
      tx(60, 140, '정답 (brute force)', { 'font-size': 15, 'font-weight': 700 }); slots(320, 132, truth, () => ({ col: INK }));
      tx(60, 240, '예측 (ANN)', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      slots(320, 232, k === 0 ? [null, null, null] : pred, (id, i) => { if (id == null) return { col: GRID, fill: SOFT };
        const hit = truth.includes(id); return { col: hit ? GOOD : WARN, fill: hit ? GOODBG : WARNBG, s: pop(u, 0.2 + i * 0.3) }; });
      if (k === 0) { note(60, 340, '정답 3개만 준비된 상태', fade(u, 1.0), { fill: MUT }); return; }
      truth.forEach((id, i) => { const j = pred.indexOf(id), x0 = 320 + i * 74;
        if (j >= 0) grow(x0, 158, 320 + j * 74, 206, E(u, 1.2, 1.7), GOOD, { plain: true, sw: 2.5 });
        else { el('rect', { x: x0 - 36, y: 104, width: 72, height: 56, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.5) }); tx(x0, 98, 'miss', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); } });
      pred.forEach((id, j) => { if (!truth.includes(id)) tx(320 + j * 74, 282, '오답', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); });
      const r = tween(0, b.recall, u, 1.0);
      card(760, 190, 260, 110, { rx: 14, stroke: BAD, sw: 2.5, s: pop(u, 1.7) }); tx(650, 170, 'recall@3', { 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.8) });
      mono(650, 212, '2 / 3 = ' + Math.round(r * 100) + '%', { 'font-size': 24, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { const xs = [100, 300, 520, 740], names = ['평가 쿼리\n1000개', '정답 미리 계산\n(brute force)', 'ANN 검색\nk = 10', '쿼리마다 recall\n→ 평균'];
      names.forEach((n, i) => { card(xs[i], 150, 170, 80, { rx: 12, stroke: i === 2 ? ACC : INK, fill: i === 2 ? ACCBG : PANEL, text: n, fs: 14.5, s: pop(u, 0.2 + i * 0.35) });
        if (i) grow(xs[i - 1] + 88, 150, xs[i] - 88, 150, E(u, 0.4 + i * 0.35, 0.7 + i * 0.35), MUT); });
      for (let i = 0; i < 12; i++) dot([[xs[0], 200], [xs[0], 260], [xs[3], 260], [xs[3], 200]], ((t * 0.4 + i / 12) % 1) * (u > 1.6 ? 1 : 0), ACC, 5);
      mono(600, 330, 'np.mean(recalls)', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8), 'text-anchor': 'middle' });
      note(150, 380, '한 쿼리가 아니라 많은 쿼리의 평균으로 판단한다', fade(u, 2.1)); return; }
    // k3: 다이얼 (개념도)
    const ax = R.axes(110, 70, 380, 270, { x: [0, 1], y: [0, 1], xl: '보는 후보 수 (efSearch · nprobe)', yl: '개념도' });
    const g = E(u, 0.2, 1.6), rc = Array.from({ length: 21 }, (_, i) => [i / 20, 1 - 0.6 * Math.exp(-i / 4)]), sp = Array.from({ length: 21 }, (_, i) => [i / 20, 0.95 - 0.8 * (i / 20)]);
    R.line(ax, rc, g, GOOD); R.line(ax, sp, g, WARN);
    el('line', { x1: ax.X(0), y1: ax.Y(0.95), x2: ax.X(1), y2: ax.Y(0.95), stroke: BAD, 'stroke-width': 1.5, 'stroke-dasharray': '6 4', opacity: fade(u, 1.4) });
    tx(ax.X(1) + 8, ax.Y(0.95) + 5, '목표 0.95', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
    tx(ax.X(1) + 8, ax.Y(1) - 8, 'recall', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); tx(ax.X(1) + 8, ax.Y(0.15) + 5, '속도', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
    note(620, 150, '평균 recall < 0.95 이면', fade(u, 1.8)); note(620, 178, 'efSearch · nprobe를 키운다', fade(u, 2.0), { fill: GOOD }); note(620, 220, '대신 느려진다', fade(u, 2.2), { fill: WARN }); }

  // ---------- 5. 알고리즘 예고 ----------
  function hnswMini(x, y, u0, path) { const L = [[[0.1, 0.5], [0.5, 0.3], [0.9, 0.5]], [[0.1, 0.5], [0.3, 0.2], [0.5, 0.3], [0.65, 0.6], [0.9, 0.5]], [[0.05, 0.5], [0.2, 0.2], [0.3, 0.7], [0.45, 0.35], [0.55, 0.75], [0.65, 0.4], [0.75, 0.65], [0.9, 0.5]]];
    L.forEach((nodes, li) => { const yy = y + li * 90, op = clamp(u0 * 3 - li);
      el('path', { d: `M${x},${yy + 10} L${x + 380},${yy + 10} L${x + 420},${yy + 60} L${x + 40},${yy + 60} Z`, fill: SOFT, stroke: GRID, opacity: op });
      tx(x - 10, yy + 42, 'L' + (2 - li), { 'font-size': 14, 'font-weight': 800, fill: MUT, 'text-anchor': 'end', opacity: op });
      const pos = nodes.map(([a, b]) => [x + 20 + a * 380 + b * 20, yy + 14 + b * 42]);
      pos.forEach((p, i) => { if (i) el('line', { x1: pos[i - 1][0], y1: pos[i - 1][1], x2: p[0], y2: p[1], stroke: MUT, 'stroke-width': 1.5, opacity: op }); });
      pos.forEach(([px, py]) => el('circle', { cx: px, cy: py, r: 6, fill: INFO, opacity: op })); });
    if (path > 0) { const pts = [[x + 20 + 0.5 * 380 + 6, y + 14 + 0.3 * 42], [x + 20 + 0.65 * 380 + 12, y + 90 + 14 + 0.6 * 42], [x + 20 + 0.75 * 380 + 13, y + 180 + 14 + 0.65 * 42]];
      for (let i = 1; i < 3; i++) grow(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], clamp(path * 2 - (i - 1)), ACC, { sw: 3 }); } }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { hnswMini(80, 60, E(u, 0.1, 1.2), E(u, 1.3, 2.3)); tx(600, 90, 'HNSW', { 'font-size': 22, 'font-weight': 800, fill: INFO });
      note(600, 130, '그래프를 층층이 쌓는다', fade(u, 0.5)); note(600, 160, '위층에서 크게, 아래층에서 세밀하게', fade(u, 1.3)); note(600, 200, 'O(log n) · Chroma/Qdrant 기본', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 1) { zone(40, 50, 440, 340, null, { fill: SOFT });
      const cs = [[140, 130], [340, 110], [120, 300], [300, 280], [420, 230]], q = [270, 220], g = E(u, 0.2, 1.0);
      cs.forEach(([x, y], i) => { const near = i === 3 || i === 1; for (let j = 0; j < 5; j++) { const a = j * 1.3 + i, r = 22 + (j % 2) * 16; el('circle', { cx: x + Math.cos(a) * r, cy: y + Math.sin(a) * r, r: 5, fill: near && u > 1.4 ? ACC : OFF, opacity: g }); }
        el('path', { d: `M${x},${y - 10} L${x + 10},${y} L${x},${y + 10} L${x - 10},${y} Z`, fill: PANEL, stroke: INK, 'stroke-width': 2.5, opacity: g });
        if (near) el('circle', { cx: x, cy: y, r: 52, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 1.2) }); });
      star(q[0], q[1], 12, ACC); tx(600, 90, 'IVF', { 'font-size': 22, 'font-weight': 800, fill: INFO });
      note(600, 130, 'k-means로 공간을 셀로 나눈다', fade(u, 0.5)); note(600, 160, '가까운 nprobe개 셀만 본다', fade(u, 1.3)); note(600, 200, '중심점만 더 저장 → 가볍다', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 2) { tx(40, 70, '1536차원 float32 = 6,144B', { 'font-size': 16, 'font-weight': 800 });
      const n = 24, w = 880 / n, sp = E(u, 0.4, 1.2);
      for (let i = 0; i < n; i++) { el('rect', { x: 40 + i * w + sp * 3, y: 90, width: w - 2 - sp * 3, height: 34, rx: 3, fill: INFO, opacity: 0.75 });
        const cu = E(u, 1.2 + i * 0.03, 1.5 + i * 0.03); if (cu > 0) { el('rect', { x: 40 + i * w + 4, y: 170, width: w - 8, height: 30, rx: 3, fill: ACC, opacity: cu }); grow(40 + i * w + w / 2, 128, 40 + i * w + w / 2, 166, cu, MUT, { plain: true, sw: 1 }); } }
      sub(480, 228, '8차원씩 192조각 (그림은 일부만)', fade(u, 0.9)); tx(40, 266, '조각마다 1바이트 코드 → 192B', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
      mono(40, 316, '6,144B / 192B = 32배 절약', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 2.2) }); note(40, 356, '대신 압축 손실로 정확도가 HNSW · IVF보다 낮다', fade(u, 2.4), { fill: WARN }); return; }
    if (k === 3) { tx(40, 60, '규모별 조합 (recall 목표)', { 'font-size': 17, 'font-weight': 800 });
      [['< 100K', 'HNSW (Chroma 기본)', '99%+'], ['100K ~ 10M', 'HNSW (튜닝)', '95~98%'], ['10M ~ 1B', 'IVF + PQ', '90~95%'], ['1B+', 'DiskANN · ScaNN', '85~92%']].forEach(([a, b, r], i) => {
        const x = 60 + i * 210, y = 300 - i * 60, s = pop(u, 0.2 + i * 0.35);
        el('rect', { x, y, width: 200, height: 392 - y, rx: 8, fill: [INFOBG, INFOBG, ACCBG, WARNBG][i], stroke: [INFO, INFO, ACC, WARN][i], 'stroke-width': 2, opacity: s });
        mono(x + 12, y + 26, a, { 'font-size': 15, 'font-weight': 800, opacity: s }); tx(x + 12, y + 52, b, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); mono(x + 12, y + 78, r, { 'font-size': 15, fill: MUT, opacity: s }); });
      note(60, 414, '데이터가 커질수록 recall 목표를 조금씩 낮춰 잡는다', fade(u, 1.9)); return; }
    hnswMini(80, 60, 1, E(u, 0.2, 1.2)); pill(720, 200, '다음: III-2-2 인덱싱 전략', ACC, pop(u, 1.2), { fs: 15 });
    note(560, 260, 'HNSW 층 구조 · IVF · PQ를', fade(u, 1.6)); note(560, 288, '직접 그려 가며 본다', fade(u, 1.8)); }

  const quiz = [
    { q: 'Brute Force 검색이 100% 정확한 대신 치르는 대가는 무엇인가?',
      o: ['정답 중 일부를 놓친다', '저장된 벡터 수만큼 거리 계산을 해야 해 데이터가 크면 느리다', '인덱스를 따로 만들어야 한다'], a: 1,
      why: '24개면 24번, 100만 개면 100만 번 거리를 잰다. 예시로 1M에서 단일 쿼리 500ms라 QPS 100이면 감당하기 어렵다.' },
    { q: '그림의 ANN 검색이 진짜 2위인 7번을 놓친 이유는 무엇인가?',
      o: ['7번이 쿼리와 가장 멀어서', '7번이 쿼리가 든 후보 셀 바로 밖에 있어서', 'k가 1이어서'], a: 1,
      why: 'ANN은 후보 셀 안의 5개만 비교한다. 7번(d = 10.00)은 셀 경계 밖이라 계산조차 되지 않아 recall@3이 2/3이 됐다.' },
    { q: '예시 벤치마크에서 벡터가 1,000개일 때 BF와 ANN의 차이가 1.7배로 작은 까닭은 무엇인가?',
      o: ['데이터가 작으면 전부 비교해도 금방 끝나서', 'ANN 인덱스가 1K에서는 꺼져서', '1K에서는 recall이 0이 돼서'], a: 0,
      why: 'BF는 n에 비례하므로 n이 작으면 0.5ms로도 충분하다. 차이는 1M에서 416배, 1억에서 25,000배로 벌어진다.' },
    { q: '정답이 [8, 7, 6]이고 ANN 결과가 [8, 6, 10]일 때 recall@3은 얼마인가?',
      o: ['1/3 ≈ 33%', '3/3 = 100%', '2/3 ≈ 67%'], a: 2,
      why: '겹치는 것은 8과 6, 두 개다. 순서는 따지지 않으므로 2 / 3 ≈ 0.67이다.' },
    { q: '1536차원 벡터를 PQ로 8차원씩 192조각, 조각마다 1바이트 코드로 바꾸면 메모리는 어떻게 되나?',
      o: ['6,144B에서 192B로 32배 줄어든다', '그대로다', '두 배로 는다'], a: 0,
      why: 'float32 1536칸은 6,144바이트다. 192바이트 코드로 바꾸면 32배 작아지지만 압축 손실로 정확도가 일부 떨어진다.' },
  ];

  const summary = [
    'Brute Force는 모든 벡터와 거리를 재서 정확하지만 데이터가 크면 너무 느리다.',
    'ANN은 미리 나눈 후보 셀만 비교해 빠르지만 셀 밖의 정답을 놓칠 수 있다.',
    '예시 규모 값으로 1M 벡터에서 500ms가 1.2ms가 되어 416배 빨라진다.',
    '놓친 정도는 recall@k로 재고, 평균 0.95 아래면 efSearch나 nprobe를 키운다.',
  ];
  const review = [
    { q: '사내 문서 5,000개로 RAG를 만든다. 검색 방식을 고른다면?',
      o: ['Brute Force로 충분하다', '1B 규모용 DiskANN이 필요하다', 'PQ 압축이 반드시 필요하다'], a: 0,
      why: '10K 미만은 전부 비교해도 빠르고 정확도 100%를 지킨다. ANN의 이득은 수십만 개 이상에서 커진다.' },
    { q: 'HNSW 인덱스로 바꿨더니 빨라졌지만 정답 문서가 가끔 빠진다. 평가 쿼리 1000개로 잰 평균 recall@10이 0.90이다. 먼저 할 일은?',
      o: ['k를 3으로 줄여 평가를 쉽게 한다', 'efSearch를 키워 후보를 더 본다', '인덱스를 버리고 Brute Force로 되돌린다'], a: 1,
      why: '목표 0.95에 못 미치면 후보를 더 보게 해 recall을 올린다. 속도는 조금 느려지지만 놓침이 준다.' },
    { q: '벡터 1억 개를 단일 서버 메모리에 올려야 한다. 어느 조합을 먼저 검토하나?',
      o: ['Brute Force', 'HNSW 기본값', 'IVF + PQ'], a: 2,
      why: '1억 개에서 BF는 예시로 50초가 걸린다. IVF로 볼 범위를 좁히고 PQ로 벡터를 압축하면 메모리와 시간을 함께 줄인다.' },
  ];

  R.page({ title: 'ANN 검색', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
