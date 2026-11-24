/* IV-1-1 N+1 + DataLoader — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 쿼리 수(101 → 2), resolver 호출 수(100), batchFn 키, ids 순서 매핑, tick 이 다르면 batch 가 둘로 나뉘는 것,
 * 전역 loader 의 캐시 공유는 graphql-js 16 + dataloader 2.2 로 직접 돌린 결과다.
 * 실행에 쓴 예시 데이터: 글 100개, 작성자 10명(글 i 의 작성자 = i % 10 + 1). 응답 시간·CPU 는 페이지의 예시 수치. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, dbIcon, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 스키마 타입 상자 (왼쪽 위 기준). rows: [[글, {hi, col}]]
  function typeBox(x, y, w, head, rows, o) { o = o || {}; const rh = 24, h = 38 + rows.length * rh, g = R.G(x, y, o.s ?? 1, o.op ?? 1);
    el('rect', { x: 0, y: 0, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    el('line', { x1: 0, y1: 30, x2: w, y2: 30, stroke: GRID, 'stroke-width': 1.5 }, g);
    mono(12, 21, head, { 'font-size': 15, 'font-weight': 700, fill: o.stroke || INK }, g);
    rows.forEach(([s, ro], i) => { ro = ro || {}; if (ro.hi) el('rect', { x: 4, y: 33 + i * rh, width: w - 8, height: rh - 2, rx: 4, fill: ro.hiFill || ACCBG }, g);
      mono(14, 50 + i * rh, s, { 'font-size': 14, fill: ro.col || INK }, g); });
    return { h, ry: (i) => y + 44 + i * rh }; }
  // 글 100개 = 10×10 칸. 열 = 작성자 (예시 데이터에서 글 i 의 작성자는 i % 10 + 1)
  const GX = 360, GY = 92, GS = 23;
  const gpos = (i) => [GX + (i % 10) * GS + 10, GY + Math.floor(i / 10) * GS + 10];
  function grid(f) { for (let i = 0; i < 100; i++) { const st = f(i) || {}; if (st.hide) continue; const [cx, cy] = gpos(i);
      el('rect', { x: cx - 10, y: cy - 10, width: 20, height: 20, rx: 4, fill: st.fill || PANEL, stroke: st.stroke || GRID, 'stroke-width': 1.5, opacity: st.op ?? 1 }); } }
  // 쿼리 계기
  function counter(cx, cy, v, col, label) { card(cx, cy, 150, 70, { rx: 10, stroke: col || GRID, sw: 2 });
    tx(cx - 62, cy - 12, label || 'DB 쿼리', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
    mono(cx - 62, cy + 22, String(Math.round(v)), { 'font-size': 26, 'font-weight': 800, fill: col || INK }); }
  // 작은 표: cols [[이름, 폭]], rows [[칸…]]. o.row(i) → {fill, col, show}, o.cell(i, j) → {col, strike, op}
  function table(x, y, cols, rows, o) { o = o || {}; const rh = 26, W = cols.reduce((a, c) => a + c[1], 0), op = o.op ?? 1;
    if (op <= 0) return { W, H: 0 };
    el('rect', { x, y, width: W, height: rh * (rows.length + 1) + 4, rx: 6, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.5, opacity: op });
    if (o.title) tx(x, y - 9, o.title, { 'font-size': 14, 'font-weight': 700, fill: o.tcol || MUT, opacity: op });
    let cx = x; cols.forEach(([n, w], j) => { const cs = (o.cell && o.cell(-1, j)) || {}; mono(cx + 8, y + 18, n, { 'font-size': 13.5, 'font-weight': 700, fill: cs.col || MUT, opacity: op * (cs.op ?? 1) }); cx += w; });
    rows.forEach((r, i) => { const st = (o.row && o.row(i)) || {}, yy = y + rh * (i + 1) + 2, show = st.show ?? 1; if (show <= 0) return;
      if (st.fill) el('rect', { x: x + 3, y: yy, width: W - 6, height: rh - 2, rx: 4, fill: st.fill, opacity: op * show });
      let cx = x; r.forEach((v, j) => { const cs = (o.cell && o.cell(i, j)) || {};
        mono(cx + 8, yy + 18, String(v), { 'font-size': 13.5, fill: cs.col || st.col || INK, opacity: op * show * (cs.op ?? 1), 'text-decoration': cs.strike ? 'line-through' : null }); cx += cols[j][1]; }); });
    return { W, H: rh * (rows.length + 1) + 4 }; }
  const DB = [850, 196];

  // ---------- 1. 101 쿼리 ----------
  function schema(o) { o = o || {};
    const q = typeBox(30, 40, 290, 'type Query', [['posts(first: 100): [Post!]!', { hi: o.hiQ }]], { s: o.sQ });
    const p = typeBox(30, 150, 290, 'type Post', [['id: ID!'], ['title: String!'], ['author: User!', { hi: o.hiA, hiFill: o.hiA === 'bad' ? BADBG : ACCBG, col: o.hiA === 'bad' ? BAD : INK }]], { s: o.sP });
    const us = typeBox(30, 316, 290, 'type User', [['id: ID!  name: String!']], { s: o.sU });
    return { q, p, us }; }
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) { schema({ sQ: pop(u, 0.2), sP: pop(u, 0.6), sU: pop(u, 1.0) });
      grow(160, 98, 160, 146, E(u, 1.2, 1.7), MUT); grow(250, 271, 250, 312, E(u, 1.6, 2.1), ACC);
      note(338, 285, '← author는 User를 가리키는 필드', fade(u, 1.9), { fill: ACC });
      dbIcon(DB[0], DB[1], 'DB', { stroke: GRID }); counter(DB[0], 72, 0, GRID);
      sub(DB[0], 290, '아직 호출 없음', fade(u, 2.2), { 'font-size': 14 }); return; }
    schema({ hiQ: k === 1, hiA: k >= 2 ? 'bad' : false });
    dbIcon(DB[0], DB[1], 'DB', { stroke: k >= 2 ? BAD : INK });
    const qn = k === 1 ? tween(p.queries, b.queries, u, 1.4) : k === 2 ? lerp(1, 101, E(u, 0.3, 2.4)) : 101;
    counter(DB[0], 72, qn, k >= 2 ? BAD : ACC);
    if (k === 1) { dot([[320, 92], [700, 92], [DB[0] - 46, DB[1] - 20]], seg(u, 0.1, 0.9), ACC, 7);
      pill(560, 50, 'SELECT * FROM posts LIMIT 100', ACC, pop(u, 0.4), { mono: true, fs: 13.5 });
      grid((i) => ({ op: clamp((u - 1.0) * 60 - i * 0.5), stroke: INK }));
      sub(GX + 115, GY + 250, '글 100개 도착', fade(u, 2.2), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const done = Math.floor(E(u, 0.3, 2.4) * 100);
      grid((i) => (i < done ? { fill: BADBG, stroke: BAD } : { stroke: INK }));
      for (let j = 0; j < 6; j++) { const i = Math.min(99, done + j * 2), [x, y] = gpos(i); dot([[x, y], [GX + 250, y], [DB[0] - 46, DB[1]]], ((u * 1.6 + j / 6) % 1), BAD, 4.5); }
      mono(GX, GY - 16, `Post.author() × ${done}`, { 'font-size': 15, 'font-weight': 700, fill: BAD });
      terminal(600, 290, 340, 120, ['SELECT * FROM users WHERE id = 1', 'SELECT * FROM users WHERE id = 2', 'SELECT * FROM users WHERE id = 3', 'SELECT * FROM users WHERE id = 4'], 1 + E(u, 0.4, 2.4) * 3, { fs: 13.5, title: 'DB 로그' }); return; }
    if (k === 3) { // 열 = 작성자: 같은 user 를 10번씩
      const hot = E(u, 0.2, 0.8);
      grid((i) => (i % 10 === 0 ? { fill: hot > 0.5 ? WARNBG : BADBG, stroke: hot > 0.5 ? WARN : BAD, s: 1 } : { fill: BADBG, stroke: BAD, op: 1 - 0.5 * hot }));
      el('rect', { x: GX - 4, y: GY - 4, width: 28, height: 236, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: hot });
      note(GX - 4, GY - 16, 'user1을 10번 SELECT (예: 작성자 10명)', fade(u, 0.6), { fill: WARN, 'font-size': 14.5 });
      const bw = 340 * E(u, 1.0, 2.3); el('rect', { x: 600, y: 320, width: 340, height: 22, rx: 5, fill: SOFT }); el('rect', { x: 600, y: 320, width: bw, height: 22, rx: 5, fill: BAD });
      tx(600, 308, 'author 쿼리 100번 × RTT 1ms', { 'font-size': 14, 'font-weight': 600, fill: MUT });
      mono(940, 366, `${Math.round(100 * E(u, 1.0, 2.3))}ms`, { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); return; }
    // k4: resolver 트리
    grid(() => ({ fill: BADBG, stroke: BAD, op: 0.25 }));
    el('rect', { x: 340, y: 30, width: 600, height: 380, rx: 12, fill: PANEL, opacity: 0.92 });
    const rx = 420, cx = 600, lx = 760; card(rx, 210, 118, 40, { rx: 8, text: 'Query.posts', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.1) });
    const ys = [60, 96, 132, 168, 204, 276, 312, 348];
    ys.forEach((y, i) => { grow(rx + 60, 210, cx - 40, y, E(u, 0.3 + i * 0.06, 0.8 + i * 0.06), GRID, { plain: true });
      card(cx, y, 80, 28, { rx: 6, text: i < 5 ? `Post ${i + 1}` : `Post ${i + 93}`, fs: 13.5, mono: true, s: pop(u, 0.6 + i * 0.06) });
      grow(cx + 40, y, lx - 46, y, E(u, 1.1 + i * 0.06, 1.4 + i * 0.06), BAD);
      card(lx, y, 92, 28, { rx: 14, text: 'author()', fs: 13.5, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.3 + i * 0.06) }); });
    mono(cx, 246, '⋮', { 'font-size': 20, 'text-anchor': 'middle', fill: MUT }); mono(lx, 246, '⋮ ×100', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
    note(370, 396, '필드마다 resolver가 따로 돈다. 엔진은 author()를 글 수만큼 부른다', fade(u, 2.0), { fill: INK }); }

  // ---------- 2. 흔한 시도 ----------
  const POSTS = [['p1', 'post1', 1], ['p2', 'post2', 2], ['p3', 'post3', 1]], USERS = [[1, 'user1'], [2, 'user2']];
  const JOINED = [['post1', 1, 'user1'], ['post2', 2, 'user2'], ['post3', 1, 'user1']];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { table(40, 70, [['id', 50], ['title', 80], ['authorId', 96]], POSTS, { title: 'posts', row: (i) => ({ show: fade(u, 0.2 + i * 0.1) }) });
      table(40, 250, [['id', 50], ['name', 90]], USERS, { title: 'users', row: (i) => ({ show: fade(u, 0.5 + i * 0.1) }) });
      grow(270, 130, 460, 175, E(u, 0.9, 1.4), ACC); grow(190, 280, 460, 205, E(u, 1.0, 1.5), ACC);
      table(470, 140, [['p.title', 90], ['u.id', 60], ['u.name', 90]], JOINED, { title: 'JOIN 결과', tcol: ACC, stroke: ACC, row: (i) => ({ show: fade(u, 1.5 + i * 0.15) }) });
      pill(560, 40, 'findMany({ include: { author: true } })', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      counter(860, 330, 1, GOOD); sub(860, 384, 'SQL 1번 (JOIN)', fade(u, 2.0), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 1) { card(250, 150, 330, 120, { rx: 10, stroke: INK, sw: 2 });
      mono(105, 120, '{ title: "post1",', { 'font-size': 15 }); mono(121, 150, 'author: { name: "user1" }', { 'font-size': 15, fill: ACC, 'font-weight': 700 }); mono(105, 180, '}', { 'font-size': 15 });
      tx(90, 70, 'parent (posts 쿼리에서 이미 받아 온 값)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      pill(250, 300, 'Post.author = (parent) => parent.author', ACC, pop(u, 0.3), { mono: true, fs: 13.5 });
      grow(250, 284, 250, 166, E(u, 0.7, 1.3), ACC);
      dbIcon(DB[0], 180, 'DB', { stroke: GRID }); el('line', { x1: 420, y1: 150, x2: DB[0] - 50, y2: 170, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 6' });
      mono(560, 140, 'findById × 100', { 'font-size': 15, fill: MUT, 'text-decoration': 'line-through', opacity: fade(u, 1.3) }); cross(700, 135, 10, pop(u, 1.5));
      counter(860, 330, 1, GOOD); return; }
    if (k === 2) { card(150, 90, 230, 76, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.1) });
      tx(48, 70, '클라이언트 쿼리', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(58, 100, 'posts { title }', { 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      grow(270, 90, 420, 90, E(u, 0.6, 1.0), INFO);
      pill(600, 90, 'SELECT … FROM posts JOIN users', WARN, pop(u, 0.9), { mono: true, fs: 13.5 });
      const g = E(u, 1.4, 2.0);
      table(330, 180, [['p.title', 90], ['u.id', 60], ['u.name', 90]], JOINED, { cell: (i, j) => (j > 0 ? { col: WARN, op: 1 - 0.55 * g, strike: g > 0.5 && i >= 0 } : {}) });
      el('rect', { x: 416, y: 172, width: 156, height: 124, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: g });
      note(600, 230, '안 물어본 열도 매번 읽는다', g, { fill: WARN }); note(600, 258, '= over-fetching', g, { fill: WARN, 'font-size': 14 });
      note(330, 350, 'info를 분석해 include를 켜고 끄면 resolver마다 분기가 생긴다', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 3) { tx(40, 50, '시도 2 · SQL JOIN', { 'font-size': 15, 'font-weight': 700 });
      const rows = [['post1', 'user1'], ['post2', 'user2'], ['post3', 'user1'], ['post4', 'user1']];
      table(40, 70, [['p.title', 90], ['u.name', 130]], rows, { row: (i) => ({ show: fade(u, 0.2 + i * 0.15), fill: i !== 1 && u > 1.0 ? WARNBG : null }), cell: (i, j) => (j === 1 && i !== 1 && u > 1.0 ? { col: WARN } : {}) });
      note(40, 240, '같은 user가 행마다 다시 실려 온다', fade(u, 1.1), { fill: WARN, 'font-size': 14.5 });
      el('line', { x1: 450, y1: 40, x2: 450, y2: 400, stroke: GRID, 'stroke-width': 1.5 });
      tx(490, 50, '시도 3 · parent에 미리 채우기', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      const B3 = [[580, 130, 'posts'], [820, 130, 'author'], [580, 300, 'comments'], [820, 300, 'tags']];
      B3.forEach(([x, y, n], i) => card(x, y, 120, 44, { rx: 8, text: n, fs: 15, mono: true, s: pop(u, 1.1 + i * 0.1) }));
      const tang = E(u, 1.6, 2.4); [[0, 3], [1, 2], [0, 1], [2, 3], [1, 3]].forEach(([a, b], i) => { const A = B3[a], Bb = B3[b];
        const pth = el('path', { d: `M${A[0]},${A[1]} Q${700 + (i - 2) * 30},${215 + (i % 2 ? -50 : 50)} ${Bb[0]},${Bb[1]}`, fill: 'none', stroke: BAD, 'stroke-width': 2, pathLength: 100, 'stroke-dasharray': `${tang * 100} 100`, opacity: 0.8 }); });
      note(530, 390, 'resolver끼리 서로의 준비를 기다린다', fade(u, 2.3), { fill: BAD, 'font-size': 14.5 }); return; }
    // k4: 모아서 한 번
    for (let i = 0; i < 9; i++) { const y = 56 + i * 36;
      card(100, y, 92, 26, { rx: 13, text: 'author()', fs: 13.5, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.1 + i * 0.05) });
      grow(148, y, 398, 210, E(u, 0.5 + i * 0.04, 0.9 + i * 0.04), GRID, { plain: true });
      dot([[148, y], [398, 210]], seg(u, 0.9 + i * 0.04, 1.5 + i * 0.04), BAD, 5); }
    mono(100, 396, '× 100', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    card(470, 210, 140, 70, { rx: 12, stroke: ACC, sw: 3, fill: ACCBG, s: pop(u, 1.0) }); tx(470, 205, '모아서', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) });
    tx(470, 228, '한 번에', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, opacity: fade(u, 1.1) });
    grow(542, 210, DB[0] - 50, DB[1] + 10, E(u, 1.6, 2.1), ACC); dbIcon(DB[0], DB[1] + 10, 'DB', {});
    mono(700, 194, 'WHERE id IN (…)', { 'font-size': 14.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    note(330, 360, 'resolver는 100번 그대로, DB 왕복만 1번', fade(u, 2.3), { fill: ACC }); }

  // ---------- 3. DataLoader ----------
  const idCells = (x, y, vals, st) => vals.forEach((v, i) => card(x + i * 52 + 22, y, 44, 36, Object.assign({ rx: 6, text: String(v), fs: 15, mono: true, fw: 700 }, st ? st(i, v) : {})));
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) { tx(40, 60, 'batchFn(ids) — DataLoader가 모아 준 키 배열', { 'font-size': 15, 'font-weight': 700 });
      idCells(40, 110, [1, 2, 5, 3], (i) => ({ s: pop(u, 0.3 + i * 0.15), stroke: ACC, color: ACC }));
      grow(250, 110, 330, 110, E(u, 1.0, 1.4), ACC);
      pill(560, 110, 'SELECT * FROM users WHERE id IN (1,2,5,3)', ACC, pop(u, 1.3), { mono: true, fs: 13.5 });
      grow(560, 132, 560, 210, E(u, 1.7, 2.1), ACC); dbIcon(560, 260, null, { s: pop(u, 1.7) });
      note(40, 360, '같은 id를 두 번 load 해도 ids에는 한 번만 들어온다', fade(u, 2.2), { fill: MUT, 'font-size': 14.5 }); return; }
    if (k === 1) { // 실행: load(3), load(1), load(2), load(1) → ids [3,1,2] → DB [1,2,3] → [U3,U1,U2,U1]
      tx(40, 46, 'load 4번', { 'font-size': 14.5, 'font-weight': 700, fill: MUT }); idCells(150, 46, ['3', '1', '2', '1'], (i) => ({ stroke: i === 3 ? OFF : INK, color: i === 3 ? MUT : INK, s: pop(u, 0.1 + i * 0.08) }));
      tx(40, 136, 'ids', { 'font-size': 14.5, 'font-weight': 700, fill: ACC }); idCells(150, 136, [3, 1, 2], (i) => ({ stroke: ACC, color: ACC, s: pop(u, 0.5 + i * 0.1) }));
      tx(40, 226, 'DB 행', { 'font-size': 14.5, 'font-weight': 700, fill: MUT }); idCells(150, 226, ['U1', 'U2', 'U3'], (i) => ({ fs: 14, s: pop(u, 0.9 + i * 0.1) }));
      tx(40, 336, '돌려줄 값', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD }); idCells(150, 336, ['U3', 'U1', 'U2'], (i) => ({ fs: 14, stroke: GOOD, color: GOOD, s: pop(u, 1.7 + i * 0.12) }));
      [[2, 0], [0, 1], [1, 2]].forEach(([from, to], i) => grow(172 + from * 52, 246, 172 + to * 52, 316, E(u, 1.4 + i * 0.12, 1.8 + i * 0.12), GOOD));
      sub(272, 186, 'IN 결과는 DB 마음대로 정렬', fade(u, 1.1), { 'text-anchor': 'start', 'font-size': 14 });
      card(700, 200, 380, 150, { rx: 12, stroke: GRID, sw: 1.5, op: fade(u, 1.9) });
      mono(530, 170, 'byId = Map(id → user)', { 'font-size': 14.5, opacity: fade(u, 2.0) }); mono(530, 200, 'ids.map(id => byId.get(id) ?? null)', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 2.0) });
      note(530, 238, '결과 길이·순서 = ids 길이·순서', fade(u, 2.2), { 'font-size': 14.5, fill: GOOD });
      note(530, 264, '어기면 load가 에러로 끝난다', fade(u, 2.4), { 'font-size': 14, fill: BAD }); return; }
    if (k === 2) { ['요청 A', '요청 B'].forEach((n, i) => { const y = 120 + i * 170, a = fade(u, 0.2 + i * 0.6);
        card(110, y, 110, 46, { rx: 23, text: n, fs: 15, stroke: INFO, color: INFO, op: a });
        grow(166, y, 260, y, E(u, 0.4 + i * 0.6, 0.8 + i * 0.6), INFO);
        card(370, y, 200, 56, { rx: 10, text: 'context({ req })', fs: 15, mono: true, op: fade(u, 0.6 + i * 0.6) });
        grow(470, y, 560, y, E(u, 0.9 + i * 0.6, 1.3 + i * 0.6), ACC);
        card(680, y, 230, 70, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 1.1 + i * 0.6) });
        mono(580, y - 6, 'loaders.user', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2 + i * 0.6) });
        mono(580, y + 20, i ? '캐시 { } (새것)' : '캐시 { }', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2 + i * 0.6) }); });
      note(370, 400, '요청마다 context가 다시 돌고 loader도 새로 생긴다', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    if (k === 3 || k === 5) { // 한 tick 타임라인
      const x0 = 60, x1 = 900, y = 210;
      el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: MUT, 'stroke-width': 2 });
      if (k === 3) { el('rect', { x: x0, y: y - 70, width: 520, height: 70, rx: 8, fill: SOFT });
        tx(x0 + 10, y - 50, 'tick 1 · author resolver 100번 → load() 100번', { 'font-size': 14, 'font-weight': 700, fill: MUT });
        const n = Math.round(100 * E(u, 0.2, 1.4)); for (let i = 0; i < n; i++) el('line', { x1: x0 + 10 + i * 5, y1: y - 30, x2: x0 + 10 + i * 5, y2: y - 4, stroke: BAD, 'stroke-width': 2 });
        mono(x0 + 532, y + 24, '틱 끝', { 'font-size': 14, fill: MUT });
        grow(x0 + 520, y - 4, x0 + 520, y + 64, E(u, 1.5, 1.8), ACC);
        pill(x0 + 520, y + 92, 'batchFn([1,2,…,10])  1번', ACC, pop(u, 1.8), { mono: true, fs: 14 });
        sub(x0 + 520, y + 130, '작성자 10명이라 키 10개 (예시 데이터)', fade(u, 2.1), { 'font-size': 14 });
        counter(830, 90, b.queries === 2 ? lerp(101, 2, E(u, 1.9, 2.6)) : b.queries, ACC); return; }
      // k5: tick 이 둘
      [[0, 'load(1)', '[1]'], [1, 'load(2)', '[2]']].forEach(([i, l, keys]) => { const xs = x0 + 40 + i * 420, a = fade(u, 0.2 + i * 1.0);
        el('rect', { x: xs - 30, y: y - 70, width: 300, height: 70, rx: 8, fill: SOFT, opacity: a });
        tx(xs - 20, y - 46, `tick ${i + 1}`, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: a });
        pill(xs + 60, y - 22, l, INK, pop(u, 0.3 + i * 1.0), { mono: true, fs: 14 });
        grow(xs + 240, y - 4, xs + 240, y + 60, E(u, 0.6 + i * 1.0, 0.9 + i * 1.0), ACC);
        pill(xs + 240, y + 86, 'batchFn(' + keys + ')', ACC, pop(u, 0.9 + i * 1.0), { mono: true, fs: 14 }); });
      card(470, 110, 150, 40, { rx: 8, text: 'setTimeout 0', fs: 14, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.8) });
      note(470, 380, '같은 tick에 들어온 load만 한 batch가 된다 · batchFn 2번', fade(u, 2.3), { 'text-anchor': 'middle', fill: WARN }); return; }
    // k4: 합계 2
    terminal(40, 60, 520, 120, ['SELECT * FROM posts LIMIT 100', ['SELECT * FROM users WHERE id IN (1,2,…,10)', 'var(--newbg)']], 0.3 + E(u, 0.2, 1.4) * 1.7, { fs: 14, title: 'DB 로그 (실행 결과)' });
    const rows = [['DataLoader 전', 101, BAD], ['DataLoader 후', 2, ACC]];
    rows.forEach(([n, v, col], i) => { const y = 250 + i * 70; tx(40, y + 15, n, { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 200, y, width: 600, height: 22, rx: 5, fill: SOFT }); el('rect', { x: 200, y, width: Math.max(4, 600 * v / 101 * E(u, 0.8 + i * 0.3, 1.8 + i * 0.3)), height: 22, rx: 5, fill: col });
      mono(820, y + 17, v + ' 쿼리', { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 1.4 + i * 0.3) }); });
    sub(500, 400, 'author resolver는 두 경우 모두 100번 불렸다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 4. 요청 스코프 ----------
  function cacheBox(x, y, w, title, rows, o) { o = o || {}; card(x + w / 2, y + 40, w, 80, { rx: 10, stroke: o.stroke || GRID, sw: 2, fill: o.fill, op: o.op });
    tx(x + 12, y + 22, title, { 'font-size': 14, 'font-weight': 700, fill: o.stroke || MUT, opacity: o.op ?? 1 });
    rows.forEach(([kk, v, col], i) => mono(x + 12, y + 50 + i * 22, `${kk} → ${v}`, { 'font-size': 14.5, fill: col || INK, opacity: o.op ?? 1 })); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { // 전역 loader: A 가 넣은 값을 B 가 받는다 (실행: 'secret-for-A' 가 B 에게)
      cacheBox(340, 40, 280, 'module-level userLoader 캐시', u > 1.0 ? [['7', '"secret-for-A"', BAD]] : [], { stroke: BAD });
      card(110, 120, 110, 44, { rx: 22, text: '요청 A', fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      grow(166, 120, 336, 86, E(u, 0.4, 0.9), INFO); sub(250, 84, 'load(7)', fade(u, 0.8), { 'font-size': 14, fill: INFO });
      card(110, 300, 110, 44, { rx: 22, text: '요청 B', fs: 15, stroke: WARN, color: WARN, s: pop(u, 1.2) });
      grow(166, 300, 400, 130, E(u, 1.4, 1.8), WARN);
      fly(400, 110, 760, 300, seg(u, 1.9, 2.6), '"secret-for-A"', { fill: BAD, mono: true, stay: true });
      if (u > 2.6) { cross(880, 300, 12, 1); }
      note(560, 370, 'DB가 바뀌어도 B는 A가 본 값을 받는다', fade(u, 2.3), { fill: BAD, 'text-anchor': 'middle' }); return; }
    if (k === 1) { const y = 210;
      card(100, y, 120, 46, { rx: 23, text: 'HTTP 요청', fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      grow(160, y, 250, y, E(u, 0.4, 0.7), INFO);
      card(450, y, 380, 200, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.6) });
      mono(280, 140, 'context: async ({ req }) => {', { 'font-size': 14.5, opacity: fade(u, 0.8) });
      mono(300, 180, 'user = authFromHeaders(req)', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(300, 220, 'loaders = { … }', { 'font-size': 14.5, opacity: fade(u, 1.6) }); mono(280, 260, '}', { 'font-size': 14.5, opacity: fade(u, 0.8) });
      grow(640, y, 730, y, E(u, 1.8, 2.1), ACC); card(820, y, 150, 46, { rx: 10, text: 'resolver 들', fs: 15, s: pop(u, 2.0) });
      note(450, 360, '요청 하나마다 이 함수가 한 번 돈다', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { // 요청마다 새 loader (실행: B 는 'changed')
      cacheBox(300, 50, 300, '요청 A의 loaders.user', u > 0.6 ? [['7', '"secret-for-A"']] : [], { stroke: INFO, op: fade(u, 0.2) });
      cacheBox(300, 240, 300, '요청 B의 loaders.user (새것)', u > 1.6 ? [['7', '"changed"', GOOD]] : [['(비어 있음)', '…', MUT]], { stroke: GOOD, op: fade(u, 1.0) });
      card(130, 90, 110, 44, { rx: 22, text: '요청 A', fs: 15, stroke: INFO, color: INFO }); card(130, 280, 110, 44, { rx: 22, text: '요청 B', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 0.9) });
      dot([[600, 300], [780, 300]], seg(u, 1.2, 1.6), GOOD, 7); dbIcon(830, 290, 'DB', { s: pop(u, 1.0) });
      el('line', { x1: 450, y1: 140, x2: 450, y2: 228, stroke: GRID, 'stroke-width': 3, 'stroke-dasharray': '4 6', opacity: fade(u, 1.8) });
      tx(470, 190, '공유 없음', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) });
      note(300, 396, '요청이 끝나면 캐시도 같이 버려진다', fade(u, 2.3), {}); return; }
    if (k === 3) { // 권한을 batchFn 안에
      card(170, 110, 260, 100, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.2) }); tx(52, 86, 'context', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      mono(60, 124, 'user.id = "u7"', { 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.4) });
      const pth = el('path', { d: 'M300,120 C420,120 420,250 520,250', fill: 'none', stroke: INFO, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 0.8) });
      card(680, 250, 380, 90, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 0.9) });
      mono(505, 240, 'commentsByPost batchFn(postIds)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.1) });
      mono(505, 270, 'findByPostIdsForUser(ids, "u7")', { 'font-size': 14, fill: INK, opacity: fade(u, 1.3) });
      note(505, 340, '클로저로 잡은 user.id가 SQL 조건이 된다', fade(u, 1.8), { 'font-size': 14.5 });
      note(505, 366, '이 요청의 캐시에는 이 사용자가 볼 수 있는 값만 쌓인다', fade(u, 2.2), { 'font-size': 14.5, fill: GOOD }); return; }
    // k4: 트레이스로 N+1 잡기
    tx(40, 70, '트레이스 · DB span', { 'font-size': 15, 'font-weight': 700 });
    [['DataLoader 전', 101, BAD], ['DataLoader 후', 2, ACC]].forEach(([n, v, col], i) => { const y = 130 + i * 140;
      tx(40, y, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.8) });
      const shown = Math.round(v * E(u, 0.3 + i * 0.8, 1.4 + i * 0.8));
      for (let j = 0; j < shown; j++) { const col2 = j === 0 ? INK : col; el('rect', { x: 200 + (j % 51) * 13, y: y - 18 + Math.floor(j / 51) * 22, width: 10, height: 18, rx: 2, fill: col2 }); }
      mono(200, y + (i ? 30 : 52), i ? 'users span 1개 (batchFn 1번)' : 'posts 1 + users 100 = span 101개', { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 1.0 + i * 0.8) }); });
    note(40, 390, 'span이 부모 수만큼 늘어선 모양이 보이면 N+1이다', fade(u, 2.3), {}); }

  // ---------- 5. 결과 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const rows = [['DB 쿼리 수', 101, 2, '', '실행'], ['응답 시간', 500, 5, 'ms', '예시'], ['p95', 800, 12, 'ms', '예시'], ['DB CPU', 30, 3, '%', '예시']];
      tx(560, 36, 'Before', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); el('rect', { x: 530, y: 25, width: 20, height: 12, rx: 2, fill: OFF });
      tx(660, 36, 'After', { 'font-size': 14, fill: ACC, 'font-weight': 700 }); el('rect', { x: 630, y: 25, width: 20, height: 12, rx: 2, fill: ACC });
      rows.forEach(([n, a, b2, unit, tag], i) => { const y = 80 + i * 86, g = E(u, 0.2 + i * 0.3, 1.2 + i * 0.3);
        tx(40, y + 18, n, { 'font-size': 16, 'font-weight': 700 }); tx(40, y + 40, tag, { 'font-size': 13.5, fill: tag === '실행' ? GOOD : MUT, 'font-weight': 700 });
        el('rect', { x: 200, y, width: Math.max(3, 560 * g), height: 20, rx: 4, fill: OFF });
        el('rect', { x: 200, y: y + 26, width: Math.max(3, 560 * b2 / a * g), height: 20, rx: 4, fill: ACC });
        mono(770, y + 16, a + unit, { 'font-size': 14.5, opacity: fade(u, 1.0 + i * 0.3) });
        mono(210 + 560 * b2 / a, y + 42, b2 + unit, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0 + i * 0.3) }); });
      return; }
    if (k === 1) { tx(480, 50, '도입 가이드', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['*ById · *ByUserId 단건 조회', '모두 loader 후보'], ['ctx.loaders.X로 이름 통일', '찾기 쉽게'], ['batchFn은 WHERE id IN (…) 하나', 'SQL 1번'], ['ids 순서대로 돌려준다', 'DataLoader 규약']].forEach(([a, b2], i) => {
        const y = 105 + i * 72, s = pop(u, 0.2 + i * 0.35); card(480, y, 600, 58, { rx: 10, stroke: GOOD, sw: 2, s }); check(208, y, 11, s);
        tx(236, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) }); tx(760, y + 6, b2, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.35) }); });
      return; }
    if (k === 2) { tx(480, 50, '함정 세 가지', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['mutation 뒤 stale 캐시', 'loader.clear(id) · clearAll()', WARN], ['batchFn 안에서 다시 .load', '평범한 SQL·HTTP만', BAD], ['1:N 결과 (글 → 댓글 여러 개)', 'postId 별로 묶어 배열로', INFO]].forEach(([a, b2, col], i) => {
        const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.5); card(x, 210, 280, 190, { rx: 12, stroke: col, sw: 2.5, s });
        tx(x, 150, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.5) });
        tx(x, 250, b2, { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 0.7 + i * 0.5) }); });
      // 그림: clear, 루프, 묶기
      mono(170, 200, 'U7 ✗ → clear(7)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.6) });
      el('path', { d: 'M440,200 a20,14 0 1 1 40,0 a20,14 0 1 1 -40,0', fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.1) }); mono(500, 205, 'load', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.1) });
      mono(790, 200, 'p1 → [c1, c4]', { 'font-size': 14.5, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.6) }); return; }
    if (k === 3) { card(480, 210, 170, 64, { rx: 12, text: 'batchFn', fs: 18, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.2) });
      [[200, 90, 'dataloader (npm)', '사실상 표준'], [760, 90, 'Prisma', '같은 tick의 findUnique 묶음'], [200, 330, '@envelop/dataloader', 'Yoga·Envelop 플러그인'], [760, 330, 'Redis', 'batchFn 안에서 MGET']].forEach(([x, y, a, b2], i) => {
        const s = pop(u, 0.6 + i * 0.3); card(x, y, 250, 64, { rx: 10, stroke: i === 0 ? ACC : GRID, sw: 2, s });
        tx(x, y - 3, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.3) }); tx(x, y + 19, b2, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.7 + i * 0.3) });
        grow(x + (x < 480 ? 125 : -125), y, x < 480 ? 395 : 565, 210 + (y < 210 ? -32 : 32), E(u, 0.9 + i * 0.3, 1.3 + i * 0.3), GRID, { plain: true }); });
      return; }
    tx(480, 130, '같은 tick의 load를 모아 한 번에', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, opacity: fade(u, 0.2, 0.8) });
    tx(480, 175, 'resolver는 그대로 두고 DB 왕복만 줄인다', { 'text-anchor': 'middle', 'font-size': 17, fill: MUT, opacity: fade(u, 0.9) });
    [['101 → 2', '쿼리 수'], ['100번', 'author resolver'], ['요청마다', '새 loader']].forEach(([a, b2], i) => { const s = pop(u, 1.2 + i * 0.25);
      card(250 + i * 230, 260, 200, 70, { rx: 10, stroke: ACC, sw: 2, s }); mono(250 + i * 230, 260, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3 + i * 0.25) });
      tx(250 + i * 230, 284, b2, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3 + i * 0.25) }); });
    pill(480, 370, '다음 · IV-1-2 Federation v2', INFO, pop(u, 2.1), { fs: 14 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: '글 100개와 각 글의 author를 묻는 쿼리를 naive resolver로 실행하면 DB 쿼리는 몇 번 나가는가?',
      o: ['2번', '101번', '100번'], a: 1,
      why: 'Query.posts가 1번, Post.author가 글마다 1번 불려 1 + 100 = 101번이다. 직접 돌려 본 DB 로그도 101줄이었다.' },
    { q: 'include로 author를 미리 JOIN하는 방법이 치르는 대가는 무엇인가?',
      o: ['author를 묻지 않는 쿼리도 매번 JOIN 비용을 낸다', 'author resolver가 여전히 100번 DB를 친다', 'JOIN 결과는 GraphQL 응답으로 바꿀 수 없다'], a: 0,
      why: 'parent.author를 꺼내 쓰니 DB 호출은 사라지지만, 클라이언트가 posts { title }만 물어도 users 열을 읽는다. 이것이 over-fetching이다.' },
    { q: 'DataLoader가 load 호출들을 한 batch로 묶는 기준은 무엇인가?',
      o: ['같은 resolver 이름', '10ms 시간 창', '같은 이벤트 루프 tick'], a: 2,
      why: '한 tick에 들어온 load 100번이 batchFn 1번이 됐다. 사이에 setTimeout을 끼우면 batchFn이 [1], [2]로 두 번 불린다.' },
    { q: 'loader를 모듈 최상단에 하나만 만들어 두면 생기는 문제는 무엇인가?',
      o: ['같은 tick의 load가 묶이지 않는다', '요청 A가 캐시한 값을 요청 B가 받는다', 'context 함수가 요청마다 두 번 돈다'], a: 1,
      why: '전역 loader는 모든 요청이 한 캐시를 쓴다. 실행해 보니 DB 값이 바뀐 뒤에도 B는 A가 읽은 "secret-for-A"를 받았다.' },
    { q: 'DataLoader를 붙인 뒤 달라진 것과 그대로인 것을 바르게 짝지은 것은 무엇인가?',
      o: ['쿼리는 101번에서 2번으로, author resolver는 100번 그대로', 'resolver 호출은 1번으로, 쿼리 수는 그대로', '쿼리와 resolver 모두 1번으로 준다'], a: 0,
      why: 'resolver는 글마다 여전히 불리고 load만 모인다. 그래서 author resolver 100번에 DB 쿼리는 posts 1번과 IN 1번, 합계 2번이다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    'resolver는 필드마다 따로 돌아서, 글 100개에 author를 붙이면 DB 쿼리가 101번 나간다.',
    'JOIN이나 include는 쿼리 수를 줄이지만 author를 묻지 않는 요청에도 JOIN 비용을 낸다.',
    'DataLoader는 같은 tick에 들어온 load를 모아 batchFn을 한 번 부른다. 쿼리는 2번이 된다.',
    'loader는 context에서 요청마다 새로 만든다. 전역으로 두면 다른 사용자의 캐시 값이 샌다.',
  ];
  const review = [
    { q: 'DataLoader를 붙였는데 트레이스에 users 쿼리가 여전히 글 수만큼 찍힌다. 먼저 의심할 것은?',
      o: ['author resolver가 load 대신 findById를 그대로 부른다', 'batchFn이 ids 순서대로 값을 돌려준다', 'context에서 요청마다 loader를 만든다'], a: 0,
      why: 'batch는 load를 거칠 때만 생긴다. 순서 맞추기와 요청마다 새 loader는 올바른 사용법이다.' },
    { q: 'batchFn이 IN 결과를 DB가 준 순서 그대로 돌려줬다. 어떤 일이 생기나?',
      o: ['쿼리가 다시 101번으로 늘어난다', '글에 엉뚱한 작성자가 붙을 수 있다', '캐시가 다른 요청으로 샌다'], a: 1,
      why: 'DataLoader는 결과의 i번째를 ids의 i번째 키 값으로 쓴다. ids [3,1,2]에 DB가 U1, U2, U3 순으로 주면 Map으로 다시 맞춰야 한다.' },
    { q: '사용자마다 볼 수 있는 댓글이 다른 서비스에서 글 목록과 댓글을 함께 준다. 알맞은 loader 설계는?',
      o: ['댓글 loader를 모듈에 하나 두고 캐시를 오래 쓴다', '댓글을 resolver마다 하나씩 findById로 읽는다', '요청마다 user.id를 잡은 댓글 loader를 만든다'], a: 2,
      why: '권한 조건이 batchFn 안에 들어가고 캐시도 그 요청에서만 산다. 전역 loader는 다른 사용자 결과를 섞고, 하나씩 읽으면 N+1로 돌아간다.' },
  ];
  R.page({ title: 'N+1과 DataLoader', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
