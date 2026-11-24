/* III-2-2 인덱스와 쿼리 최적화 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 플랜·시간·db hits는 페이지 STEPS의 plan · queryTime · queryHits를 읽는다.
 * 1,001 ms · 5 ms · hits 값은 페이지의 예시 출력이다 (Neo4j를 돌려 잰 값이 아니다). 200배 = 1,000/5, 2,000,000 = 1,000,000 + 1,000,000은 계산으로 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, meters, dbIcon, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const TONE = { red: [BAD, BADBG], amber: [WARN, WARNBG], slate: [INK, PANEL], emerald: [GOOD, GOODBG], sky: [INFO, INFOBG], violet: [ACC, ACCBG] };
  const n0 = (v) => Math.round(v).toLocaleString('en-US');
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- :Person 노드 밭 ----------
  const COLS = 24, ROWS = 9, FX = 40, FY = 92, GAP = 21, ALICE = 6 * COLS + 17;
  function field(o) { o = o || {}; const read = o.read ?? 0, found = o.found ?? 0;
    tx(FX - 6, 66, ':Person 노드 1,000,000개 (줄여 그림)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    for (let i = 0; i < COLS * ROWS; i++) { const x = FX + (i % COLS) * GAP, y = FY + Math.floor(i / COLS) * GAP, seen = i < read * COLS * ROWS, isA = i === ALICE;
      el('circle', { cx: x, cy: y, r: isA && found ? 8 : 5.5, fill: isA && found ? ACC : seen ? BAD : OFF, opacity: (o.op ?? 1) * (isA && found ? 1 : seen ? 0.55 : 0.6) }); }
    if (found) { const x = FX + (ALICE % COLS) * GAP, y = FY + Math.floor(ALICE / COLS) * GAP; el('circle', { cx: x, cy: y, r: 15, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: found });
      pill(x, y - 30, 'Alice', ACC, found, { fill: PANEL, fs: 14 }); }
    if (read > 0 && read < 1) { const i = Math.floor(read * COLS * ROWS), x = FX + (i % COLS) * GAP, y = FY + Math.floor(i / COLS) * GAP;
      el('rect', { x: x - 10, y: y - 10, width: 20, height: 20, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2.5 }); } }
  // ---------- 쿼리 플랜 (오른쪽, 위가 마지막 단계) ----------
  function plan(ops, o) { o = o || {}; const x = o.x ?? 762, y0 = o.y ?? 84, w = o.w ?? 340, at = o.at ?? (() => 1);
    const top = ops.slice().reverse();
    tx(x - w / 2, y0 - 22, o.title || '쿼리 플랜 (위가 마지막 단계)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    top.forEach((p, i) => { const s = at(p, i), [col, bg] = TONE[p.tone] || TONE.slate, y = y0 + i * 66 + 22; if (s <= 0) return;
      card(x, y, w, 46, { rx: 8, stroke: col, fill: bg, sw: 2, s });
      mono(x - w / 2 + 14, y - 2, '+' + p.op, { 'font-size': 15, 'font-weight': 800, fill: col === INK ? INK : col, opacity: clamp(s) });
      tx(x - w / 2 + 14, y + 16, p.detail.replace(/ ?[⚠✓]$/, ''), { 'font-size': 13.5, fill: MUT, opacity: clamp(s) });
      if (i < top.length - 1) el('line', { x1: x, y1: y + 23, x2: x, y2: y + 43, stroke: MUT, 'stroke-width': 2, opacity: clamp(s) }); }); }
  function gauges(c, o) { o = o || {}; const b = c.beat, p = c.prev || {};
    const tm = b.queryTime == null ? null : tween(p.queryTime, b.queryTime, c.u), ht = b.queryHits == null ? null : tween(p.queryHits, b.queryHits, c.u);
    meters(o.x ?? 592, o.y ?? 336, o.w ?? 340, [
      { name: '실행 시간 (예시)', val: tm == null ? '—' : n0(tm) + ' ms', hot: tm >= 500, good: tm != null && tm < 20 },
      { name: 'db hits', val: ht == null ? '—' : n0(ht), hot: ht >= 100000, good: ht != null && ht < 10 },
    ], { h: 66 }); }
  function query(x, y, prefix, op) { R.spans(x, y, R.tokens((prefix ? prefix + ' ' : '') + 'MATCH (p:Person {name: "Alice"}) RETURN p'), { 'font-size': 14.5, 'font-weight': 800, opacity: op ?? 1 }); }

  // ---------- 1. 인덱스 없는 풀스캔 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    query(20, 28, null, k === 0 ? fade(u, 0.2) : 1);
    if (k === 0) { field({});
      // 색인 없는 전화번호부
      const bx = 690, by = 200; el('rect', { x: bx - 90, y: by - 110, width: 180, height: 220, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.5) });
      for (let i = 0; i < 8; i++) el('line', { x1: bx - 70, y1: by - 80 + i * 24, x2: bx + 70, y2: by - 80 + i * 24, stroke: GRID, 'stroke-width': 2, opacity: fade(u, 0.7 + i * 0.05) });
      ['ㄱ', 'ㄴ', 'ㅇ'].forEach((s, i) => { const y = by - 80 + i * 60; card(bx + 104, y, 30, 34, { rx: 4, text: s, fs: 15, stroke: OFF, color: OFF, dash: '4 3', op: fade(u, 1.2) }); cross(bx + 104, y, 9, pop(u, 1.5 + i * 0.15)); });
      tx(bx, by + 140, '색인 없는 전화번호부', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(bx, by + 164, '첫 장부터 한 장씩 넘긴다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
    const read = k === 1 ? E(u, 0.2, 2.5) : 1;
    field({ read, found: k >= 2 ? (k === 2 ? pop(u, 0.5) : 1) : 0 });
    plan(b.plan, { at: (p, i) => (k === 1 ? pop(u, i === 0 ? 1.0 : 0.3) : k === 2 && p.op === 'ProduceResults' ? pop(u, 0.9) : 1) });
    if (k === 1) { meters(592, 336, 340, [{ name: '읽은 노드', val: n0(1000000 * read), hot: read > 0.5 }, { name: '노드마다 비교', val: 'name?', hot: false }], { h: 66 }); }
    else if (k === 2) { meters(592, 336, 340, [{ name: '읽은 노드', val: '1,000,000', hot: true }, { name: '결과', val: '1 row', good: true }], { h: 66 }); }
    else { gauges(c);
      // 데이터가 10배면 시간도 10배
      tx(36, 318, '노드 수에 비례 (예시)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      [['100만', 1001, '1,001 ms'], ['1000만', 10000, '약 10초']].forEach(([n, v, s], i) => { const y = 334 + i * 34;
        tx(36, y + 15, n, { 'font-size': 14, 'font-weight': 700 }); R.hbar(100, y, 360, v, 10000, { col: BAD, text: s, u: E(u, 0.3 + i * 0.5, 1.3 + i * 0.5) }); }); }
  }

  // ---------- 2. EXPLAIN ----------
  function s2(t, c) { const { k, u } = c, b = c.beat;
    const ex = k === 0 ? E(u, 0.2, 0.9) : 1;
    mono(20, 28, 'EXPLAIN', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.95) : 1 }); query(lerp(20, 100, ex), 28);
    field({ op: 0.6 });
    dbIcon(290, 340, null, { s: 0.7, stroke: OFF });
    tx(350, 336, 'DB는 건드리지 않는다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: k === 0 ? fade(u, 1.2) : 1 });
    tx(350, 360, '실행 X · 시간·hits 없음', { 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 1.5) : 1 });
    plan(b.plan, { at: (p) => { const was = c.prev && c.prev.plan && c.prev.plan.some((q) => q.op === p.op); return was ? 1 : pop(u, 0.4); } });
    if (k === 4) { const y = 84 + 2 * 66 + 22; el('rect', { x: 588, y: y - 27, width: 348, height: 54, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 3)) });
      pill(762, y + 50, '⚠ NodeByLabelScan = 인덱스 미사용', BAD, pop(u, 0.5), { fill: PANEL, fs: 14 }); }
    if (k === 0) note(600, 120, '쿼리 앞에 한 단어만 붙인다', fade(u, 1.0));
  }

  // ---------- 3. 인덱스 생성 ----------
  const TR = { root: [290, 112], kids: [[130, 196, 'A – G'], [290, 196, 'H – O'], [450, 196, 'P – Z']], leaf: [130, 280] };
  function tree(u0, o) { o = o || {}; const op = o.op ?? 1;
    const s0 = clamp(u0 * 3);
    card(TR.root[0], TR.root[1], 110, 38, { rx: 6, text: 'H  |  P', fs: 15, mono: true, stroke: INK, s: s0, op });
    TR.kids.forEach(([x, y, l], i) => { const s = clamp(u0 * 3 - 0.6 - i * 0.2); if (s <= 0) return;
      el('line', { x1: TR.root[0], y1: TR.root[1] + 19, x2: x, y2: y - 19, stroke: o.path && i === 0 ? GOOD : MUT, 'stroke-width': o.path && i === 0 ? 3 : 2, opacity: op * s });
      card(x, y, 110, 38, { rx: 6, text: l, fs: 15, mono: true, stroke: o.path && i === 0 ? GOOD : INK, s, op }); });
    const sl = clamp(u0 * 3 - 1.8); if (sl > 0) { el('line', { x1: TR.leaf[0], y1: 215, x2: TR.leaf[0], y2: 262, stroke: o.path ? GOOD : MUT, 'stroke-width': o.path ? 3 : 2, opacity: op * sl });
      card(TR.leaf[0], TR.leaf[1], 150, 38, { rx: 6, text: '"Alice" → 노드', fs: 14.5, mono: true, stroke: o.path ? GOOD : INK, fill: o.path ? GOODBG : PANEL, s: sl, op });
      [290, 450].forEach((x) => { el('line', { x1: x, y1: 215, x2: x, y2: 262, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '3 4', opacity: op * sl }); mono(x, 286, '…', { 'font-size': 16, 'text-anchor': 'middle', fill: MUT, opacity: op * sl }); }); } }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    query(20, 28);
    tx(30, 66, 'person_name_idx  (:Person · name)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, class: 'mono', opacity: k === 0 ? 0.4 : 1 });
    if (k === 0) { tree(1, { op: 0.25 }); note(40, 360, 'B-Tree 색인: 찾는 비용이 O(log n)', fade(u, 0.6), { fill: GOOD });
      plan(c.beat.plan, { title: '지금 플랜: 풀스캔' }); return; }
    tree(k === 1 ? E(u, 0.2, 2.2) : 1, { path: k === 4 });
    if (k === 1) { const pr = E(u, 0.2, 2.4); tx(40, 334, 'POPULATING', { 'font-size': 14, 'font-weight': 800, fill: WARN, class: 'mono' });
      el('rect', { x: 150, y: 322, width: 300, height: 14, rx: 7, fill: SOFT }); el('rect', { x: 150, y: 322, width: 300 * pr, height: 14, rx: 7, fill: WARN }); }
    if (k === 4) dot([TR.root, [TR.kids[0][0], TR.kids[0][1]], TR.leaf], seg(u, 0.2, 1.4), GOOD, 8);
    if (k === 1 || k === 2) { // SHOW INDEXES
      const on = k === 2 ? E(u, 0.4, 1.0) : 0, y = 110;
      tx(590, y - 30, k === 1 ? 'CREATE INDEX person_name_idx' : 'SHOW INDEXES', { 'font-size': 14.5, 'font-weight': 800, class: 'mono' });
      const sc = k === 1 ? pop(u, 0.5) : 1;
      cells(584, y - 10, ['name'], { w: 150, h: 30, fs: 13.5, style: () => ({ fill: SOFT, stroke: GRID }) }); cells(737, y - 10, ['state', 'type'], { w: 100, h: 30, gap: 3, fs: 13.5, style: () => ({ fill: SOFT, stroke: GRID }) });
      cells(584, y + 23, ['person_name_idx'], { w: 150, h: 32, fs: 13.5, style: () => ({ stroke: INK, s: sc }) });
      cells(737, y + 23, [on > 0.5 ? 'ONLINE' : 'POPULATING', 'RANGE'], { w: 100, h: 32, gap: 3, fs: 13.5, style: (i) => ({ stroke: i === 0 ? (on > 0.5 ? GOOD : WARN) : INK, color: i === 0 ? (on > 0.5 ? GOOD : WARN) : INK, s: sc }) });
      if (k === 2) note(590, 220, 'ONLINE이 되어야 쿼리가 쓴다', fade(u, 1.2), { 'font-size': 14.5 }); }
    if (k >= 3) { if (k === 3) { // 사라지는 두 단계
        [['NodeByLabelScan', BAD, BADBG], ['Filter', WARN, WARNBG]].forEach(([op, col, bg], i) => { const g = 1 - E(u, 0.3 + i * 0.2, 1.0 + i * 0.2);
          if (g > 0) { card(762 + 60 * (1 - g), 172 + i * 66, 340, 46, { rx: 8, stroke: col, fill: bg, op: g }); mono(606 + 60 * (1 - g), 176 + i * 66, '+' + op, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: g }); } }); }
      plan(b.plan, { title: '같은 쿼리, 새 플랜', at: (p) => (k === 3 && p.op === 'NodeIndexSeek' ? pop(u, 1.3) : 1) });
      if (k === 3) mono(762, 330, '쿼리는 그대로', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) }); }
    if (k === 4) gauges(c);
  }

  // ---------- 4. PROFILE ----------
  const BEFORE = [['+ProduceResults', 1, 0], ['+Filter', 1, 1000000], ['+NodeByLabelScan', 1000000, 1000000]], AFTER = [['+ProduceResults', 1, 0], ['+NodeIndexSeek', 1, 1]];
  const lg = (v) => (v <= 0 ? 0 : Math.max(0.03, Math.log10(v + 1) / 6.2));
  function ptable(rows, y0, u0, o) { o = o || {};
    tx(24, y0 - 12, o.title, { 'font-size': 14, 'font-weight': 800, fill: o.col });
    mono(330, y0 - 12, 'Rows', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); mono(360, y0 - 12, 'DB Hits (막대 = 로그 눈금)', { 'font-size': 13.5, fill: MUT });
    rows.forEach(([op, r, h], i) => { const y = y0 + i * 36, f = o.blank ? 0 : clamp(u0 * rows.length - i);
      el('rect', { x: 18, y: y, width: 924, height: 30, rx: 5, fill: i % 2 ? PANEL : SOFT });
      mono(30, y + 20, op, { 'font-size': 14.5, 'font-weight': 700 });
      mono(330, y + 20, o.blank ? '…' : n0(r * f + (f >= 1 ? 0 : 0)), { 'font-size': 14.5, 'text-anchor': 'end', opacity: o.blank ? 0.5 : f > 0 ? 1 : 0 });
      if (!o.blank && f > 0) { el('rect', { x: 360, y: y + 8, width: 420 * lg(h) * f, height: 14, rx: 4, fill: o.col }); mono(372 + 420 * lg(h) * f, y + 20, n0(h * f), { 'font-size': 14, 'font-weight': 700, fill: o.col }); }
      if (o.blank) mono(360, y + 20, '…', { 'font-size': 14.5, opacity: 0.5 }); }); }
  function s4(t, c) { const { k, u } = c;
    mono(20, 28, 'PROFILE', { 'font-size': 14.5, 'font-weight': 800, fill: WARN }); query(100, 28);
    if (k === 0) { [['EXPLAIN', '실행하지 않는다', '플랜 모양만', GOOD], ['PROFILE', '실제로 실행한다', 'operator 별 rows · db hits', WARN]].forEach(([a, b, d, col], i) => {
        const x = 260 + i * 440, s = pop(u, 0.3 + i * 0.6); card(x, 200, 380, 160, { rx: 14, stroke: col, sw: 2.5, s });
        mono(x, 160, a, { 'font-size': 22, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.6) });
        tx(x, 206, b, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.6) });
        tx(x, 236, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.6) }); });
      note(310, 340, '운영 DB 에서는 비용이 든다는 점을 기억한다', fade(u, 1.9), { fill: WARN }); return; }
    if (k === 5) { // 전/후 비교 카드
      [['실행 시간 (예시)', '1,001 ms', '5 ms', '200배 빠름'], ['db hits', '2,000,000', '1', ''], ['읽은 노드', '1,000,000', '1', '']].forEach(([n, a, b, d], i) => {
        const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.3); card(x, 210, 280, 190, { rx: 14, stroke: GOOD, sw: 2, s });
        tx(x, 140, n, { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: s });
        mono(x, 190, a, { 'font-size': 20, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', 'text-decoration': 'line-through', opacity: fade(u, 0.4 + i * 0.3) });
        mono(x, 240, b, { 'font-size': 30, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.8 + i * 0.3) });
        if (d) tx(x, 280, d, { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); });
      note(250, 360, '측정으로 확인한 인덱스 효과', fade(u, 1.8)); return; }
    ptable(BEFORE, 82, k === 2 ? E(u, 0.2, 1.8) : 1, { title: '인덱스 전 (Step 1)', col: BAD, blank: k === 1 });
    if (k >= 3) { const op = k === 3 ? fade(u, 0.3) : 1; mono(942, 210, `total 1,001 ms · ${n0(k === 3 ? tween(0, 2000000, u) : 2000000)} hits`, { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: op }); }
    if (k >= 4) { ptable(AFTER, 272, k === 4 ? E(u, 0.3, 1.6) : 1, { title: '인덱스 후 (Step 3)', col: GOOD });
      mono(942, 362, 'total 5 ms · 1 hit', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      tx(24, 362, 'operator 3개 → 2개, Filter가 없다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.9) }); }
    if (k === 1) note(24, 260, '측정을 다시 시작한다: rows · db hits를 채울 차례', fade(u, 0.6), { fill: MUT });
  }

  // ---------- 5. 인덱스 종류 ----------
  const SLOT = [[240, 120], [710, 120], [240, 306], [710, 306]];
  function kindCard(i, kd, s, body) { const [x, y] = SLOT[i], [col, bg] = TONE[kd.tone] || TONE.slate;
    card(x, y, 450, 168, { rx: 12, stroke: col, fill: PANEL, sw: 2.2, s }); if (s < 0.6) return;
    mono(x - 210, y - 56, kd.kind, { 'font-size': 17, 'font-weight': 800, fill: col }); tx(x - 90, y - 56, kd.use, { 'font-size': 14.5, 'font-weight': 700 });
    mono(x - 210, y + 70, kd.example, { 'font-size': 13.5, fill: MUT }); body(x, y, col, bg); }
  function s5(t, c) { const { k, u } = c, kinds = c.beat.indexKinds || [];
    if (k === 0) { card(480, 64, 420, 46, { rx: 10, stroke: GOOD, fill: GOODBG, s: pop(u, 0.2) }); mono(480, 70, '지금: RANGE  (:Person · name)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.3) });
      [['p.age > 18 ?', 0], ['CONTAINS ?', 1], ['반경 1km ?', 2], ['name AND age ?', 3]].forEach(([q, i]) => { const [x, y] = SLOT[i], yy = i < 2 ? y + 50 : y;
        el('rect', { x: x - 200, y: yy - 50, width: 400, height: 100, rx: 12, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 0.6 + i * 0.25) });
        mono(x, yy + 6, q, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8 + i * 0.25) }); });
      return; }
    kinds.forEach((kd, i) => { const s = i === k - 1 ? pop(u, 0.2) : 1, live = i === k - 1, lu = live ? u : 3;
      kindCard(i, kd, s, (x, y, col, bg) => {
        if (i === 0) { const X = (a) => x - 190 + (a / 60) * 380; el('line', { x1: X(0), y1: y + 14, x2: X(60), y2: y + 14, stroke: MUT, 'stroke-width': 2 });
          [0, 18, 30, 60].forEach((a) => { el('line', { x1: X(a), y1: y + 8, x2: X(a), y2: y + 20, stroke: MUT }); mono(X(a), y + 40, String(a), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
          el('rect', { x: X(18), y: y + 6, width: (X(60) - X(18)) * E(lu, 0.4, 1.4), height: 16, rx: 4, fill: col, opacity: 0.35 }); el('circle', { cx: X(30), cy: y + 14, r: 7, fill: col, opacity: fade(lu, 0.4) });
          mono(X(30), y - 8, '= 30', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fade(lu, 0.5) }); mono(X(45), y - 8, '> 18', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fade(lu, 1.2) }); }
        if (i === 1) { 'Alice'.split('').forEach((ch, j) => { const pre = j < 2, sw = E(lu, 0.3 + j * 0.15, 0.6 + j * 0.15);
            card(x - 170 + j * 46, y + 10, 40, 40, { rx: 6, text: ch, fs: 17, mono: true, stroke: pre ? col : GRID, fill: pre && sw > 0.5 ? bg : PANEL }); });
          tx(x + 130, y + 2, 'STARTS WITH "Al"', { 'font-size': 13.5, 'font-weight': 700, fill: col, class: 'mono', 'text-anchor': 'middle', opacity: fade(lu, 0.9) });
          tx(x + 130, y + 24, 'CONTAINS도 가능', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(lu, 1.3) }); }
        if (i === 2) { const pts = [[-150, -10], [-80, 22], [-30, -24], [0, 26], [60, -6], [130, 30], [170, -18]], cx = x - 40, cy = y + 8, rr = 50 * E(lu, 0.3, 1.2);
          el('circle', { cx, cy, r: rr, fill: col, opacity: 0.15 }); el('circle', { cx, cy, r: rr, fill: 'none', stroke: col, 'stroke-width': 2 });
          pts.forEach(([dx, dy]) => { const inside = Math.hypot(x + dx - cx, y + dy - cy) <= 50; el('circle', { cx: x + dx, cy: y + dy, r: 6, fill: inside && rr > 45 ? col : OFF }); });
          mono(cx, cy + 5, '$here', { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle' }); mono(x + 150, y + 48, '< 1000 m', { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(lu, 1.2) }); }
        if (i === 3) { [['Alice', 30], ['Alice', 41], ['Bob', 30]].forEach(([n, a], j) => { const hit = j === 0 && lu > 1.2;
            cells(x - 190, y - 38 + j * 30, [n, String(a)], { w: 90, h: 26, gap: 3, fs: 13.5, style: () => ({ stroke: hit ? col : GRID, fill: hit ? bg : PANEL, s: pop(lu, 0.3 + j * 0.2) }) }); });
          tx(x + 80, y - 10, '(name, age)를 한 키로', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(lu, 0.8) });
          tx(x + 80, y + 16, 'AND로 둘 다 걸 때', { 'font-size': 14, fill: col, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(lu, 1.2) }); }
      }); });
    if (k >= 1) { const q = c.beat.queryTime; mono(944, 412, `${c.beat.plan[0].op} · 예시 ${q} ms`, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT }); }
  }

  const quiz = [
    { q: '인덱스가 없을 때 MATCH (p:Person {name:"Alice"})가 느린 이유는 무엇인가?',
      o: ['Alice 노드에 관계가 너무 많아서', ':Person 노드를 모두 읽으며 name을 하나씩 비교해서', 'RETURN p가 노드 전체를 돌려줘서'], a: 1,
      why: '시작 노드를 찾을 색인이 없으니 NodeByLabelScan으로 1,000,000개를 다 읽고 Filter로 비교한다. 노드가 10배면 시간도 10배다.' },
    { q: 'EXPLAIN 결과에서 인덱스를 쓰지 않는다는 신호는 무엇인가?',
      o: ['맨 아래의 NodeByLabelScan', '맨 위의 ProduceResults', '중간의 Filter가 없는 것'], a: 0,
      why: '플랜의 맨 아래가 실제 출발점이다. 거기에 라벨 전체 스캔이 있으면 시작 노드를 색인 없이 찾고 있다는 뜻이다.' },
    { q: 'CREATE INDEX 뒤 같은 쿼리를 다시 EXPLAIN 하면 무엇이 바뀌는가?',
      o: ['쿼리에 USING INDEX를 적어야 플랜이 바뀐다', 'ProduceResults가 사라진다', 'NodeByLabelScan과 Filter 대신 NodeIndexSeek이 쓰인다'], a: 2,
      why: '쿼리는 한 글자도 안 바꿨다. 인덱스가 ONLINE이 되면 플래너가 스스로 NodeIndexSeek을 고르고 Filter가 필요 없어진다.' },
    { q: '인덱스 전 PROFILE의 total db hits가 2,000,000인 이유는 무엇인가?',
      o: ['NodeByLabelScan과 Filter가 각각 1,000,000 hits를 써서', '쿼리를 두 번 실행해서', 'ProduceResults가 1,000,000 hits를 써서'], a: 0,
      why: '라벨 스캔이 노드를 읽는 데 1,000,000, Filter가 name 속성을 읽는 데 1,000,000을 쓴다. ProduceResults는 0이다.' },
    { q: 'WHERE p.name CONTAINS "lic" 처럼 가운데 글자로 찾는 쿼리에 맞는 인덱스는 무엇인가?',
      o: ['RANGE', 'POINT', 'TEXT'], a: 2,
      why: 'RANGE는 등호·범위와 STARTS WITH까지만 돕는다. CONTAINS 같은 부분일치는 TEXT 인덱스를 따로 만든다.' },
  ];

  const summary = [
    '인덱스가 없으면 :Person 1,000,000개를 다 읽고 name을 하나씩 비교한다.',
    'EXPLAIN은 실행하지 않고 플랜만 보여 주고, 맨 아래 NodeByLabelScan이 풀스캔 신호다.',
    'CREATE INDEX 뒤 같은 쿼리가 NodeIndexSeek을 타고, 예시에서 1,001 ms가 5 ms로 줄었다.',
    'PROFILE로 operator별 hits를 재고, 쿼리 모양에 따라 RANGE·TEXT·POINT·COMPOSITE를 고른다.',
  ];
  const review = [
    { q: 'name 인덱스를 만들었는데도 EXPLAIN에 NodeByLabelScan이 그대로 보인다. 먼저 확인할 것은?',
      o: ['RETURN 절에 별칭을 붙였는지', 'SHOW INDEXES에서 상태가 아직 POPULATING인지', 'Read Replica 수가 충분한지'], a: 1,
      why: '인덱스는 ONLINE이 되어야 플래너가 쓴다. 대용량이면 채워지는 동안 풀스캔 플랜이 계속 나온다.' },
    { q: 'WHERE p.name = $n AND p.age = $a가 자주 느리다. 어떤 인덱스가 가장 맞나?',
      o: ['(name, age) COMPOSITE 인덱스', 'name에 TEXT 인덱스', 'location에 POINT 인덱스'], a: 0,
      why: '두 속성을 AND로 같이 거는 쿼리는 한 키로 묶은 COMPOSITE가 맞다. 단독 조건에는 일부만 쓰인다.' },
    { q: '느린 쿼리를 고치려 운영 DB에서 원인을 찾는다. 순서로 알맞은 것은?',
      o: ['인덱스를 모든 속성에 먼저 만들고 PROFILE로 본다', 'PROFILE부터 바로 돌리고 EXPLAIN은 생략한다', 'EXPLAIN으로 플랜을 보고, 고친 뒤 PROFILE로 효과를 잰다'], a: 2,
      why: 'EXPLAIN은 실행하지 않아 운영에서도 안전하다. 인덱스를 고친 뒤 PROFILE로 hits와 시간이 실제로 줄었는지 확인한다.' },
  ];

  R.page({ title: '풀스캔에서 인덱스 탐색으로', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
