/* IV-1-1 pgvector란 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, server, cross, check, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 지역 도우미 ----------
  const KC = { pk: WARN, fk: INFO, vec: ACC, txt: MUT };
  // DB 표 한 장. cols [{n, w, k}], rows [[…]]. o.rowSt(i) → {op, hi, gone, hiFill}, o.colSt(j) → {hi, op}, o.cell(i, j) → {color, op, bold}
  function tbl(x, y, name, cols, rows, o) {
    o = o || {}; const rh = o.rh || 32, hh = 30, W = cols.reduce((a, c) => a + c.w, 0), H = hh + rh * rows.length;
    const g = el('g', { opacity: o.op ?? 1 });
    if (name) tx(x, y - 10, name, { 'font-size': 15, 'font-weight': 700, fill: o.nameCol || INK }, g);
    if (o.badge) mono(x + W, y - 10, o.badge, { 'font-size': 13.5, 'font-weight': 700, fill: o.badgeCol || MUT, 'text-anchor': 'end' }, g);
    el('rect', { x, y, width: W, height: H, rx: 8, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.stroke ? 2.2 : 1.5 }, g);
    el('rect', { x: x + 1, y: y + 1, width: W - 2, height: hh - 1, rx: 7, fill: SOFT }, g);
    const xs = []; let cx = x;
    cols.forEach((c, j) => { const cs = (o.colSt && o.colSt(j)) || {}; xs.push(cx);
      if (cs.hi) el('rect', { x: cx + 2, y: y + 2, width: Math.max(0, c.w - 4), height: H - 4, rx: 5, fill: cs.fill || ACCBG }, g);
      if (c.w > 30) mono(cx + 9, y + 20, c.n, { 'font-size': 13.5, 'font-weight': 700, fill: KC[c.k] || MUT, opacity: cs.op ?? 1 }, g);
      if (j) el('line', { x1: cx, y1: y + 5, x2: cx, y2: y + H - 5, stroke: GRID, 'stroke-width': 1 }, g);
      cx += c.w; });
    rows.forEach((r, i) => { const yy = y + hh + i * rh, rs = (o.rowSt && o.rowSt(i)) || {}, rop = rs.op ?? 1;
      el('line', { x1: x + 4, y1: yy, x2: x + W - 4, y2: yy, stroke: GRID, 'stroke-width': 1 }, g);
      if (rs.hi) el('rect', { x: x + 3, y: yy + 3, width: W - 6, height: rh - 6, rx: 5, fill: rs.hiFill || ACCBG, opacity: rop }, g);
      r.forEach((v, j) => { if (v == null || cols[j].w <= 30) return; const cs = (o.cell && o.cell(i, j)) || {};
        mono(xs[j] + 9, yy + rh / 2 + 5, String(v), { 'font-size': 14, fill: cs.color || (rs.gone ? OFF : INK), 'font-weight': cs.bold ? 700 : null,
          opacity: (cs.op ?? 1) * rop, 'text-decoration': rs.gone ? 'line-through' : null }, g); }); });
    return { xs, W, H, x, y, rh, rowY: (i) => y + hh + i * rh + rh / 2, colR: (j) => xs[j] + cols[j].w };
  }
  // 2D 평면 위 점 하나 + 이름
  function pt(x, y, col, s, name, o) { o = o || {}; if (s <= 0) return;
    el('circle', { cx: x, cy: y, r: (o.r || 8) * s, fill: o.hollow ? PANEL : col, stroke: col, 'stroke-width': 2.2, opacity: o.op ?? 1 });
    if (name) tx(x + (o.dx ?? 13), y + (o.dy ?? 5), name, { 'font-size': 13.5, 'font-weight': 600, fill: o.tcol || INK, opacity: (o.op ?? 1) * clamp(s), 'text-anchor': o.anchor }); }
  function star(x, y, s, col) { if (s <= 0) return; const p = []; for (let i = 0; i < 10; i++) { const r = (i % 2 ? 6 : 14) * s, a = -Math.PI / 2 + i * Math.PI / 5; p.push([x + r * Math.cos(a), y + r * Math.sin(a)].join(',')); }
    el('polygon', { points: p.join(' '), fill: col || BAD, stroke: PANEL, 'stroke-width': 1.5 }); }

  const CAT = [[10, 'AI'], [20, 'Data']];
  const DOC = [[1, 'AI 기초 가이드', '인공지능 개론...', 10], [2, '딥러닝 입문', '신경망 기본...', 10], [3, '데이터 분석 기초', 'pandas 사용법...', 20]];

  // 1. 평범한 PostgreSQL — 두 표와 FK, JOIN
  function s1(t, c) { const { k, u } = c;
    const catT = tbl(720, 70, 'categories', [{ n: 'id', w: 60, k: 'pk' }, { n: 'name', w: 100, k: 'txt' }], CAT, {
      rowSt: (i) => ({ op: k === 0 ? E(u, 0.5 + i * 0.4, 0.9 + i * 0.4) : 1 }), op: k === 0 ? fade(u, 0.2) : 1, badge: 'PK' });
    if (k === 0) { sub(800, 230, '분류 이름을 담는 표 하나', fade(u, 1.4)); return; }
    const fkW = k === 1 ? 0 : k === 2 ? 130 * E(u, 0.2, 1.0) : 130;
    const docT = tbl(40, 70, 'documents', [{ n: 'id', w: 50, k: 'pk' }, { n: 'title', w: 180, k: 'txt' }, { n: 'content', w: 170, k: 'txt' }, { n: 'category_id', w: fkW, k: 'fk' }],
      DOC, { op: k === 1 ? fade(u, 0.2) : 1, rowSt: (i) => ({ op: k === 1 ? E(u, 0.5 + i * 0.35, 0.9 + i * 0.35) : 1, }),
        colSt: (j) => ({ hi: k === 3 && (j === 0 || j === 1) }), cell: (i, j) => (j === 3 ? { op: k === 2 ? fade(u, 0.9 + i * 0.2) : 1, color: INFO, bold: true } : {}) });
    if (k === 1) { el('rect', { x: 446, y: 72, width: 60, height: 122, rx: 6, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.4) });
      tx(476, 222, '분류 칸 없음', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); return; }
    // FK 선: documents.category_id → categories.id
    DOC.forEach((d, i) => { const ci = CAT.findIndex((r) => r[0] === d[3]), y1 = docT.rowY(i), y2 = catT.rowY(ci);
      const g = k === 2 ? E(u, 1.2 + i * 0.25, 2.0 + i * 0.25) : 1;
      if (g > 0) el('path', { d: `M${docT.colR(3)},${y1} C${docT.colR(3) + 70},${y1} ${720 - 70},${y2} ${lerp(docT.colR(3), 720, g)},${lerp(y1, y2, g)}`, fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: 0.8 });
      if (k === 4) dot([[docT.colR(3), y1], [650, (y1 + y2) / 2], [720, y2]], (t * 0.7 + i * 0.3) % 1, INFO, 5); });
    if (k === 2) pill(640, 240, 'REFERENCES categories(id)', INFO, pop(u, 1.6), { mono: true, fs: 13.5 });
    if (k >= 3) { // 결과 표
      const showCat = k === 4, res = DOC.map((d) => [d[0], d[1], showCat ? CAT.find((r) => r[0] === d[3])[1] : '?']);
      tbl(220, 270, 'SELECT 결과', [{ n: 'd.id', w: 70, k: 'pk' }, { n: 'd.title', w: 190, k: 'txt' }, { n: 'category', w: 120, k: 'txt' }], res, {
        op: k === 3 ? fade(u, 0.3) : 1, rh: 30,
        rowSt: (i) => ({ op: k === 3 ? E(u, 0.8 + i * 0.3, 1.2 + i * 0.3) : 1, gone: k === 4 && DOC[i][3] !== 10 && u > 1.6, hi: k === 4 && DOC[i][3] === 10 && u > 1.6, hiFill: C.GOODBG }),
        cell: (i, j) => (j === 2 ? (showCat ? { color: ACC, bold: true, op: fade(u, 0.4 + i * 0.25) } : { color: OFF }) : {}) });
      if (k === 3) sub(410, 405, '카테고리 이름은 아직 다른 표에 있다', fade(u, 1.8));
      if (k === 4) { pill(810, 300, "WHERE c.name = 'AI'", ACC, pop(u, 1.4), { mono: true, fs: 13.5 });
        cross(700, 365, 9, pop(u, 2.0)); tx(718, 371, "'AI와 비슷한 글'은 못 찾는다", { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); } } }

  // 2. CREATE EXTENSION — 기존 DB 에 방 하나
  function shelf(x, y, title, chips, extra, o) { o = o || {};
    tx(x, y - 22, title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    let cx = x; chips.forEach((s) => { const w = tw(s, 14) + 22; card(cx + w / 2, y, w, 30, { rx: 6, text: s, fs: 14, mono: true, stroke: GRID, sw: 1.5 }); cx += w + 8; });
    (extra || []).forEach(([s, sc]) => { const w = tw(s, 14) + 22; if (sc > 0) card(cx + w / 2, y, w, 30, { rx: 6, text: s, fs: 14, mono: true, stroke: ACC, fill: ACCBG, color: ACC, sw: 2, s: sc }); cx += w + 8; });
    if (o.slot) { el('rect', { x: cx, y: y - 15, width: 90, height: 30, rx: 6, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: o.slot });
      cross(cx + 45, y, 7, o.slot); } }
  function s2(t, c) { const { k, u } = c;
    zone(30, 40, 500, 350, 'PostgreSQL 16 (기존 서버)', { stroke: INK, fill: 'var(--panel)', sw: 2, color: INK });
    ['documents', 'categories'].forEach((n, i) => { card(130 + i * 190, 100, 160, 44, { rx: 8, text: n, fs: 14.5, mono: true, stroke: INFO, sw: 1.8 }); });
    sub(225, 145, '표 · 행 · 권한 · FK 그대로', 1);
    const on = k >= 1, gs = k === 1 ? (i) => pop(u, 1.2 + i * 0.25) : () => 1;
    shelf(56, 215, '타입', ['INT', 'TEXT', 'SERIAL'], on ? [['vector(N)', gs(0)]] : null, { slot: on ? 0 : 1 });
    shelf(56, 305, '연산자', ['=', '<', 'LIKE'], on ? [['<->', gs(1)], ['<#>', gs(2)], ['<=>', gs(3)]] : null, { slot: on ? 0 : 1 });
    if (k === 0) { tx(780, 180, 'vector 타입 없음', { 'font-size': 20, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      tx(780, 212, '거리 연산자도 없음', { 'font-size': 16, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); return; }
    if (k === 1) { const w = 200 * E(u, 0.1, 0.9);
      el('rect', { x: 530, y: 150, width: w, height: 190, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 });
      if (w > 150) { tx(630, 200, 'pgvector', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); sub(630, 226, '증축한 방 한 칸'); }
      mono(745, 372, 'CREATE EXTENSION vector;', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(820, 260, '서버를 새로 띄우지 않는다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    pill(455, 40, '+ pgvector', ACC, 1, { fs: 13.5 });
    if (k === 2 || k === 3) { const L = ["=# SELECT extname, extversion", "   FROM pg_extension", "   WHERE extname = 'vector';"];
      const out = k === 3 ? [' extname | extversion', '---------+-----------', [' vector  | 0.7.4', 'var(--term)']] : [];
      terminal(560, 50, 380, 250, L.concat(out), k === 2 ? 3 * E(u, 0.2, 1.8) : 3 + 3 * E(u, 0.2, 1.4), { title: 'psql', fs: 14 });
      if (k === 2) sub(750, 330, '우리 표가 아니라 DB 의 설치 목록을 본다', fade(u, 2.0));
      if (k === 3) { pill(750, 335, 'hnsw 인덱스: 0.5.0 부터', GOOD, pop(u, 1.8), { fs: 14 }); } return; }
    if (k === 4) { const L = ['$ docker run -d --name pgvec \\', '    -e POSTGRES_PASSWORD=secret \\', '    -p 5432:5432 \\', '    pgvector/pgvector:pg16'];
      terminal(560, 50, 380, 190, L, 4 * E(u, 0.2, 1.4), { title: 'shell', fs: 14 });
      server(690, 320, 'pgvec 컨테이너', { s: pop(u, 1.6), lamp: GOOD });
      pill(850, 300, ':5432', INFO, pop(u, 2.0), { mono: true }); sub(850, 335, '확장이 이미 들어 있다', fade(u, 2.2)); return; }
    // k5: 그대로 / 늘어난 것
    [['그대로', ['표 · 행 데이터', '사용자 · 권한', '백업 · 포트 5432'], GOOD], ['늘어난 것', ['vector(N) 타입', '<-> <#> <=>'], ACC]].forEach(([h, items, col], i) => {
      const x0 = 570 + i * 190; tx(x0, 80, h, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + i * 0.6) });
      items.forEach((s, j) => { const s0 = pop(u, 0.4 + i * 0.6 + j * 0.2); if (i === 0) check(x0 + 8, 116 + j * 44, 8, s0); else tx(x0 + 2, 122 + j * 44, '+', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: clamp(s0) });
        tx(x0 + 24, 121 + j * 44, s, { 'font-size': 14.5, 'font-weight': 600, opacity: clamp(s0), class: i ? 'mono' : null }); }); });
    sub(750, 300, '기존 집은 그대로, 기능만 늘었다', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: INK }); }

  // 3. vector(1536) 컬럼 — 같은 표에 칸 하나
  const EMB = ['[0.12, 0.45, 0.31, …]', '[0.18, 0.42, 0.28, …]', '[0.55, 0.11, 0.62, …]'];
  const BARS = [0.12, 0.45, 0.31, -0.08, 0.22, -0.35, 0.05, 0.4, -0.18, 0.27, -0.03, 0.33, -0.25, 0.14, 0.09, -0.4, 0.2, -0.12, 0.36, -0.06, 0.18, -0.3, 0.1, 0.25];
  function s3(t, c) { const { k, u } = c;
    const filled = (i) => (k >= 3 ? (k === 3 && i > 0 ? E(u, 0.3 + i * 0.5, 0.8 + i * 0.5) : 1) : k === 2 && i === 0 ? E(u, 1.3, 1.8) : 0);
    const embW = k === 0 ? 300 * E(u, 0.2, 1.0) : 300;
    const T = tbl(40, 220, 'documents', [{ n: 'id', w: 46, k: 'pk' }, { n: 'title', w: 170, k: 'txt' }, { n: 'category_id', w: 124, k: 'fk' }, { n: 'embedding vector(1536)', w: embW, k: 'vec' }],
      DOC.map((d, i) => [d[0], d[1], d[3], filled(i) > 0.5 ? EMB[i] : 'NULL']), {
        colSt: (j) => ({ hi: j === 3 && (k === 0 || k === 4) }),
        cell: (i, j) => (j === 3 ? (filled(i) > 0.5 ? { color: ACC, bold: true, op: filled(i) } : { color: OFF }) : {}),
        badge: k === 5 ? 'ivfflat (embedding) ✓' : 'B-tree (id)', badgeCol: k === 5 ? ACC : MUT });
    if (k === 0) { sub(560, 380, '새 표 없이 컬럼 하나만 늘었다 · 값은 아직 NULL', fade(u, 1.2), { 'font-weight': 700, fill: INK }); return; }
    // 위쪽: 텍스트 → 임베딩 모델 → 1536개 실수
    const top = k === 1 ? 1 : 0.35;
    const g1 = k === 1 ? pop(u, 0.2) : 1; card(110, 80, 160, 46, { rx: 8, text: "'AI 기초 가이드'", fs: 14, stroke: INK, s: g1, op: top });
    if (k === 1) grow(192, 80, 248, 80, E(u, 0.5, 0.9), MUT); else el('line', { x1: 192, y1: 80, x2: 246, y2: 80, stroke: MUT, 'stroke-width': 2, opacity: top });
    card(340, 80, 180, 46, { rx: 8, text: 'embedding API', fs: 14.5, stroke: INFO, color: INFO, s: k === 1 ? pop(u, 0.8) : 1, op: top });
    const nb = k === 1 ? Math.round(24 * E(u, 1.1, 2.2)) : 24;
    for (let i = 0; i < nb; i++) { const v = BARS[i], h = Math.abs(v) * 70; el('rect', { x: 460 + i * 15, y: v > 0 ? 80 - h : 80, width: 11, height: h, rx: 2, fill: v > 0 ? ACC : INFO, opacity: top }); }
    el('line', { x1: 455, y1: 80, x2: 820, y2: 80, stroke: GRID, 'stroke-width': 1.2, opacity: top });
    mono(830, 86, '… +1500', { 'font-size': 14, fill: MUT, opacity: top * (k === 1 ? fade(u, 2.2) : 1) });
    if (k === 1) { mono(460, 150, 'float 1536개 = 한 문서의 좌표', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { fly(640, 80, T.xs[3] + 120, T.rowY(0), seg(u, 0.2, 1.2), '1536 floats', { mono: true });
      mono(560, 150, "UPDATE … SET embedding = '[…]'::vector", { 'font-size': 14, fill: INK, 'font-weight': 700, opacity: fade(u, 0.2) });
      pill(820, 200, '길이 1536 ✓', GOOD, pop(u, 1.6), { mono: true, fs: 13.5 });
      sub(820, 400, '길이가 다르면 여기서 거절', fade(u, 2.0)); return; }
    if (k === 3) { sub(560, 400, 'WHERE id = 2, 3 도 같은 UPDATE', fade(u, 1.6)); return; }
    if (k === 4) { const y0 = T.rowY(0), y2 = T.rowY(2), x = T.xs[3] + 270;
      star(x + 70, 150, pop(u, 0.2), BAD); mono(x + 90, 155, 'q', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.2) });
      [0, 1, 2].forEach((i) => { const g = E(u, 0.6 + i * 0.4, 1.0 + i * 0.4); grow(x + 70, 165, x + 20, T.rowY(i), g, BAD, { plain: true, sw: 1.8 }); });
      tx(870, 400, '3행이면 3번 비교로 끝', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      sub(560, 160, '인덱스는 수천 행을 넘어설 때 이야기', fade(u, 2.2)); return; }
    // k5: 인덱스
    pill(500, 140, 'USING ivfflat (embedding vector_l2_ops)', ACC, pop(u, 0.3), { mono: true, fs: 14 });
    sub(500, 176, 'lists = 100', fade(u, 0.9), { 'font-weight': 700 });
    tx(560, 400, '일반 컬럼과 벡터 컬럼이 한 행에 산다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }

  // 4. 검색 — 평면 위 거리, ORDER BY, LIMIT
  const Q = [265, 230], SC = 200;
  const PTS = [['AI 기초 가이드', 'AI', 0.12, 0.2, -0.98], ['딥러닝 입문', 'AI', 0.21, -0.95, 0.3], ['ML 실전 가이드', 'AI', 0.34, 0.95, 0.3],
    ['데이터 분석 기초', 'Data', 0.58, -0.75, -0.66], ['웹 개발 튜토리얼', 'Web', 0.89, 0.98, -0.2, 'L']];
  const EXTRA = [[62, 382], [470, 378], [480, 70]];
  const CCOL = { AI: ACC, Data: INFO, Web: WARN };
  function plane4(t, c, op) { const { k, u } = c;
    zone(30, 30, 470, 375, '임베딩 공간 (2차원으로 줄여 그림, 거리는 예시)', { fill: 'var(--soft)' });
    EXTRA.forEach(([x, y]) => pt(x, y, OFF, 1, null, { r: 7, op: k >= 2 ? (k === 2 ? 1 - 0.75 * E(u, 1.0, 1.8) : 0.25) : 1 }));
    PTS.forEach(([n, cat, d, dx, dy, side], i) => { const x = Q[0] + dx * d * SC, y = Q[1] + dy * d * SC, L = dx < 0 || side === 'L';
      if (k === 0) grow(Q[0], Q[1], x, y, E(u, 0.4 + i * 0.25, 1.0 + i * 0.25), MUT, { plain: true, sw: 1.6, dash: '4 4' });
      pt(x, y, CCOL[cat], 1, n, { dx: L ? -13 : 13, anchor: L ? 'end' : null, dy: dy < 0 ? -6 : 18 });
      if (k <= 2) mono(x + (L ? -13 : 13), y + (dy < 0 ? 12 : 34), d.toFixed(2), { 'font-size': 13.5, 'font-weight': 700, fill: CCOL[cat], 'text-anchor': L ? 'end' : null, opacity: k === 0 ? fade(u, 1.0 + i * 0.25) : 1 }); });
    star(Q[0], Q[1], 1, BAD); mono(Q[0] + 14, Q[1] + 24, '$1', { 'font-size': 15, 'font-weight': 800, fill: BAD });
    if (k === 2) { const r = (0.89 * SC + 14) * E(u, 0.2, 1.0); el('circle', { cx: Q[0], cy: Q[1], r, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '7 6' }); } }
  function s4(t, c) { const { k, u } = c;
    plane4(t, c);
    if (k === 0) { snippet(530, 60, ['SELECT id, title,', '  embedding <-> $1 AS dist', 'FROM documents'], { fs: 14.5 });
      tx(540, 200, 'dist 는 그냥 계산된 컬럼이다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(700, 232, '질의 벡터와 각 행의 거리', fade(u, 2.0)); return; }
    if (k === 1 || k === 2) { const rows = PTS.map((p, i) => [i + 1, p[0], p[1], p[2].toFixed(2)]);
      tbl(530, 60, k === 1 ? 'ORDER BY dist' : 'LIMIT 5', [{ n: '#', w: 36, k: 'txt' }, { n: 'title', w: 186, k: 'txt' }, { n: 'cat', w: 70, k: 'txt' }, { n: 'dist', w: 70, k: 'vec' }],
        rows.concat([['6', '(그 밖의 행)', '', '> 0.89']]), { rh: 34,
          rowSt: (i) => ({ op: k === 1 ? E(u, 0.3 + i * 0.3, 0.7 + i * 0.3) : i === 5 ? 1 - 0.7 * E(u, 1.0, 1.6) : 1, gone: k === 2 && i === 5 && u > 1.2,
            hi: k === 2 && i < 3 && u > 1.6, hiFill: C.GOODBG }),
          cell: (i, j) => (j === 2 && i < 5 ? { color: CCOL[PTS[i][1]], bold: true } : j === 3 ? { color: ACC, bold: true } : {}) });
      if (k === 2) tx(712, 350, '0.12 · 0.21 · 0.34 가 비슷한 문서', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      return; }
    if (k === 3) { // 연산자 세 개: 같은 두 화살표를 세 가지로 잰다
      const O = [545, 360];
      [['<->', 'L2 거리', '끝점 사이 직선', '무난한 기본값'], ['<#>', '음의 내적', '한쪽을 다른 쪽에 투영', '정규화 벡터면 가장 빠름'], ['<=>', '코사인 거리', '사이 각도만', 'OpenAI 임베딩 권장']].forEach(([op, n, how, use], i) => {
        const y = 80 + i * 110, s = pop(u, 0.3 + i * 0.55), ox = 560, oy = y + 40;
        el('line', { x1: ox, y1: oy, x2: ox + 80, y2: oy - 50, stroke: INK, 'stroke-width': 2.2, opacity: clamp(s) }); el('line', { x1: ox, y1: oy, x2: ox + 100, y2: oy - 20, stroke: INK, 'stroke-width': 2.2, opacity: clamp(s) });
        if (i === 0) el('line', { x1: ox + 80, y1: oy - 50, x2: ox + 100, y2: oy - 20, stroke: ACC, 'stroke-width': 3.5, opacity: clamp(s) });
        if (i === 1) { el('line', { x1: ox, y1: oy, x2: ox + 86.5, y2: oy - 17.3, stroke: ACC, 'stroke-width': 4, opacity: clamp(s) }); el('line', { x1: ox + 80, y1: oy - 50, x2: ox + 86.5, y2: oy - 17.3, stroke: ACC, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', opacity: clamp(s) }); }
        if (i === 2) el('path', { d: `M${ox + 34},${oy - 21} A40,40 0 0 1 ${ox + 39},${oy - 8}`, fill: 'none', stroke: ACC, 'stroke-width': 4, opacity: clamp(s) });
        mono(700, y + 12, op, { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: clamp(s) });
        tx(760, y + 10, n, { 'font-size': 15, 'font-weight': 700, opacity: clamp(s) }); tx(760, y + 32, how, { 'font-size': 13.5, fill: MUT, opacity: clamp(s) });
        tx(700, y + 56, use, { 'font-size': 13.5, 'font-weight': 600, fill: INFO, opacity: clamp(s) }); });
      return; }
    // k4: SQL 은 그대로, 연산자 하나만 새로
    const L = ['SELECT id, title, embedding <-> $1', 'FROM documents', 'ORDER BY embedding <-> $1', 'LIMIT 5;'];
    snippet(520, 70, L, { fs: 14.5 });
    ['SELECT', 'FROM', 'ORDER BY', 'LIMIT'].forEach((s, i) => { const s0 = pop(u, 0.3 + i * 0.2); check(540 + i * 100, 210, 8, s0); mono(552 + i * 100, 216, s, { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: clamp(s0) }); });
    pill(700, 260, '새로 배운 것: <->  하나', ACC, pop(u, 1.2), { fs: 15 });
    pill(700, 320, 'ivfflat (embedding) ✓', ACC, pop(u, 1.8), { mono: true, fs: 14 });
    sub(700, 352, '인덱스가 붙으면 수백만 행도 ms 단위', fade(u, 2.1), { 'font-weight': 700, fill: INK }); }

  // 5. 한 DB 안에서 JOIN + WHERE + 벡터 정렬 + 트랜잭션
  const DOC5 = [[1, 'AI 기초 가이드', 10, '[0.12, …]'], [2, '딥러닝 입문', 10, '[0.18, …]'], [3, '데이터 분석 기초', 20, '[0.55, …]'], [4, 'ML 실전 가이드', 10, '[0.31, …]']];
  const RES5 = [['AI 기초 가이드', 'AI', '0.12'], ['딥러닝 입문', 'AI', '0.21'], ['ML 실전 가이드', 'AI', '0.34']];
  function s5(t, c) { const { k, u } = c;
    if (k <= 3) {
      const docT = tbl(30, 60, 'documents d', [{ n: 'id', w: 40, k: 'pk' }, { n: 'title', w: 170, k: 'txt' }, { n: 'category_id', w: 120, k: 'fk' }, { n: 'embedding', w: 120, k: 'vec' }], DOC5, {
        rh: 30, colSt: (j) => ({ hi: k === 0 && j === 1 }), rowSt: (i) => ({ gone: k >= 2 && DOC5[i][2] !== 10 && (k > 2 || u > 1.0), hi: k >= 2 && DOC5[i][2] === 10 && (k > 2 || u > 1.0) }) });
      const catT = tbl(660, 60, 'categories c', [{ n: 'id', w: 60, k: 'pk' }, { n: 'name', w: 100, k: 'txt' }], CAT, { rh: 30, colSt: (j) => ({ hi: k === 0 && j === 1 }) });
      if (k >= 1) DOC5.forEach((d, i) => { const ci = CAT.findIndex((r) => r[0] === d[2]), y1 = docT.rowY(i), y2 = catT.rowY(ci), x1 = docT.colR(3);
        const g = k === 1 ? E(u, 0.3 + i * 0.25, 1.0 + i * 0.25) : 1, op = k >= 2 && d[2] !== 10 ? 0.15 : 0.8;
        if (g > 0) el('path', { d: `M${x1},${y1} C${x1 + 90},${y1} ${660 - 90},${y2} ${lerp(x1, 660, g)},${lerp(y1, y2, g)}`, fill: 'none', stroke: INFO, 'stroke-width': 2, opacity: op }); });
      if (k === 0) { [['d.title', 115, INK], ['c.name', 300, INK], ['embedding <-> $1 AS dist', 560, ACC]].forEach(([s, x, col], i) => pill(x, 260, s, col, pop(u, 0.4 + i * 0.4), { mono: true, fs: 14 }));
        grow(115, 214, 115, 244, E(u, 0.4, 0.8), MUT); grow(740, 154, 340, 244, E(u, 0.8, 1.3), MUT); grow(420, 214, 520, 244, E(u, 1.2, 1.6), ACC);
        sub(480, 320, '두 표의 컬럼과 거리 식이 한 SELECT 목록에', fade(u, 1.9), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
      if (k === 1) { pill(560, 260, 'JOIN categories c ON c.id = d.category_id', INFO, pop(u, 1.2), { mono: true, fs: 14 }); sub(560, 296, 'Step 1 의 그 JOIN 그대로', fade(u, 1.8)); return; }
      if (k === 2) { pill(480, 270, "WHERE c.name = 'AI' AND d.embedding IS NOT NULL", ACC, pop(u, 0.3), { mono: true, fs: 14 });
        pill(480, 320, '후보 4행 → 3행', GOOD, pop(u, 1.4), { fs: 14 }); sub(480, 356, '거리 계산은 아직 하지 않았다', fade(u, 1.9)); return; }
      // k3: 남은 후보에만 거리
      tbl(300, 260, 'ORDER BY dist LIMIT 5', [{ n: 'title', w: 180, k: 'txt' }, { n: 'category', w: 100, k: 'txt' }, { n: 'dist', w: 80, k: 'vec' }], RES5, {
        rh: 30, rowSt: (i) => ({ op: E(u, 0.4 + i * 0.4, 0.8 + i * 0.4) }), cell: (i, j) => (j === 2 ? { color: ACC, bold: true } : j === 1 ? { color: ACC } : {}) });
      sub(810, 330, '필터 + 의미 검색이', fade(u, 1.9), { 'font-weight': 700, fill: INK }); sub(810, 352, '한 쿼리 안에서', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { // 트랜잭션
      el('rect', { x: 60, y: 60, width: 480, height: 300, rx: 14, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '8 6', opacity: fade(u, 0.2) });
      mono(80, 90, 'BEGIN;', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      card(300, 155, 400, 56, { rx: 10, text: "INSERT categories (30, 'NLP')", fs: 14.5, mono: true, stroke: INFO, s: pop(u, 0.5) });
      card(300, 245, 460, 56, { rx: 10, text: "INSERT documents ('Transformer 입문', 30, $1::vector)", fs: 13.5, mono: true, stroke: ACC, s: pop(u, 0.9) });
      mono(80, 340, 'COMMIT;', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      dbIcon(760, 200, 'PostgreSQL', { s: 1 });
      if (u > 1.5) { fly(500, 155, 740, 185, seg(u, 1.6, 2.3), 'NLP', {}); fly(500, 245, 760, 215, seg(u, 1.7, 2.4), 'vector', {}); }
      tx(760, 330, '둘 다 성공하거나 둘 다 롤백', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 5) { // 둘로 쪼개면
      dbIcon(230, 180, 'PostgreSQL', { s: pop(u, 0.2) }); sub(230, 270, 'categories · 메타데이터', fade(u, 0.4));
      dbIcon(730, 180, '별도 벡터 DB', { s: pop(u, 0.5), stroke: ACC }); sub(730, 270, 'embedding', fade(u, 0.7));
      grow(300, 160, 660, 160, E(u, 0.9, 1.6), WARN, { dash: '7 6' }); grow(660, 200, 300, 200, E(u, 1.1, 1.8), WARN, { dash: '7 6' });
      tx(480, 140, '동기화 코드', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      cross(480, 320, 12, pop(u, 2.0)); tx(480, 362, '두 DB 사이 JOIN 은 한 쿼리로 안 된다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    // k6: 하나로
    dbIcon(250, 190, 'PostgreSQL + pgvector', { s: pop(u, 0.2), stroke: ACC });
    ['JOIN', 'ACID 트랜잭션', '백업 · 권한 · 모니터링'].forEach((s, i) => { const s0 = pop(u, 0.6 + i * 0.3); check(470, 110 + i * 56, 10, s0); tx(494, 117 + i * 56, s, { 'font-size': 16, 'font-weight': 700, opacity: clamp(s0) }); });
    tx(462, 292, '+', { 'font-size': 24, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) }); tx(494, 292, '벡터 검색 하나', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) }); }

  const quiz = [
    { q: 'pgvector를 붙이기 전, documents와 categories를 잇는 고리는 무엇인가?',
      o: ['두 표에 같은 title 컬럼이 있어서', 'documents.category_id가 categories(id)를 참조하는 FK', '같은 데이터베이스 파일에 들어 있어서'], a: 1,
      why: 'category_id INT REFERENCES categories(id) 한 줄이 두 표를 잇고, JOIN은 이 고리를 조건으로 쓴다.' },
    { q: 'CREATE EXTENSION vector를 실행하면 무엇이 바뀌는가?',
      o: ['새 DB 서버가 하나 더 뜬다', '기존 표가 벡터 형식으로 옮겨진다', 'vector 타입과 <-> <#> <=> 연산자가 생긴다'], a: 2,
      why: '서버도 데이터도 그대로이고, 같은 PostgreSQL에 타입 하나와 거리 연산자 세 개가 늘어난다.' },
    { q: '임베딩을 담으려고 documents에 한 일은 무엇인가?',
      o: ['ALTER TABLE로 embedding vector(1536) 컬럼을 하나 더했다', '임베딩 전용 새 DB를 만들었다', 'title 컬럼을 vector로 바꿨다'], a: 0,
      why: '같은 표에 컬럼 하나만 늘어나서 title·category_id와 벡터가 한 행에 함께 산다.' },
    { q: 'ORDER BY embedding <-> $1 LIMIT 5가 돌려주는 것은 무엇인가?',
      o: ['id가 가장 작은 5행', '질의 벡터와 거리가 가장 가까운 5행', '최근에 넣은 5행'], a: 1,
      why: '<-> 로 계산한 거리를 늘 쓰던 ORDER BY로 정렬하고 LIMIT으로 자른다. 새 쿼리 언어는 없다.' },
    { q: '벡터를 별도 벡터 DB에 두지 않고 pgvector에 두면 얻는 것은 무엇인가?',
      o: ['한 쿼리에서 JOIN·WHERE·벡터 정렬을 함께 쓰고 한 트랜잭션으로 쓴다', '거리 계산이 필요 없어진다', '인덱스 없이도 언제나 가장 빠르다'], a: 0,
      why: '분류 INSERT와 벡터 INSERT가 같은 BEGIN·COMMIT 안에 들어가고, 두 시스템을 맞추는 동기화 코드가 필요 없다.' },
  ];

  const summary = [
    '평범한 PostgreSQL은 FK와 JOIN은 잘하지만 비슷한 뜻의 글을 찾지는 못한다.',
    'CREATE EXTENSION vector 한 줄로 vector 타입과 거리 연산자 세 개가 생긴다.',
    '기존 표에 vector(1536) 컬럼 하나를 더하면 메타데이터와 벡터가 한 행에 함께 산다.',
    'ORDER BY embedding <-> $1 LIMIT 5에 JOIN과 WHERE를 그대로 붙여 한 쿼리로 끝낸다.',
  ];
  const review = [
    { q: '벡터는 Pinecone에, 분류는 PostgreSQL에 두었더니 분류별 검색마다 두 번 조회하고 결과를 코드로 합친다. 먼저 검토할 것은?',
      o: ['벡터 DB 서버를 한 대 더 늘린다', 'pgvector로 벡터를 같은 PostgreSQL에 두고 JOIN과 WHERE를 한 쿼리에 쓴다', '분류 이름을 벡터 안에 숫자로 섞어 넣는다'], a: 1,
      why: '같은 DB에 있으면 JOIN·WHERE·ORDER BY <-> 가 한 쿼리가 되고 두 시스템을 맞추는 동기화 코드도 사라진다.' },
    { q: '문서 3행짜리 표에 ivfflat 인덱스를 먼저 걸려고 한다. 가장 알맞은 판단은?',
      o: ['인덱스가 없으면 검색이 안 되므로 꼭 먼저 건다', '행이 몇 개뿐이면 전수 비교로 충분하니 행이 늘어난 뒤에 건다', 'B-tree 인덱스로 대신한다'], a: 1,
      why: '3행이면 거리 계산 3번으로 끝난다. ANN 인덱스는 행이 수천 개를 넘어설 때 효과가 난다.' },
    { q: 'documents에 새 글과 새 분류를 함께 넣다가 두 번째 INSERT가 실패했다. pgvector를 쓰는 구성에서 결과는?',
      o: ['같은 BEGIN·COMMIT 안이면 첫 INSERT도 롤백된다', '분류만 남고 글은 사라진다', '벡터 컬럼만 따로 커밋된다'], a: 0,
      why: '벡터 쓰기도 일반 INSERT와 같은 트랜잭션에 묶여 둘 다 성공하거나 둘 다 없던 일이 된다.' },
  ];

  R.page({ title: 'pgvector — PostgreSQL에 벡터 한 칸', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
