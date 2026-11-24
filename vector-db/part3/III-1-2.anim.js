/* III-1-2 Chroma 핵심 기능 · 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 컬렉션마다 따로 있는 작은 벡터 공간(HNSW) · 문서 표에 붙는 메타데이터 칸 · where 로 흐려지는 후보와 질의 점에서 뻗는 거리 ·
 *       RAM 에서 디스크로 내려가는 파일 · update/upsert/delete 로 바뀌는 행과 점.
 * 숫자는 chromadb 1.5.9 를 실제로 돌린 값이다.
 *   질의 "벡터 검색 입문" 제곱 L2 거리: b3 0.327, b1 0.855, b2 1.220 (where year=2024 → [b3, b1])
 *   PersistentClient 파일 크기: chroma.sqlite3 196,608 B · data_level0.bin 167,600 · header.bin 100 · length.bin 400 · link_lists.bin 0
 *   update → upsert(b4) → delete(b3) → delete(where year<2023): count 3 → 4 → 3 → 3 (b1, b2, b4)
 *   점의 방향은 그림용이고, 장면 3 에서 질의 점까지의 길이만 실제 거리에 비례한다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, dbIcon, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const COLS = [
    { name: 'products', col: INFO, keys: ['brand', 'year'], rows: [['p1', '무선 이어폰 노이즈캔슬링', 'Sony', 2024], ['p2', '4K 모니터 27인치 IPS', 'LG', 2023], ['p3', '기계식 키보드 적축', 'Logitech', 2024]] },
    { name: 'blogs', col: ACC, keys: ['author', 'year'], rows: [['b1', 'RAG 입문 가이드', 'alice', 2024], ['b2', 'Vector DB 비교 후기', 'bob', 2023], ['b3', '임베딩 모델 선택법', 'alice', 2024]] },
    { name: 'users', col: WARN, keys: ['team', 'joined'], rows: [['u1', 'alice — ML engineer', 'AI', 2022], ['u2', 'bob — backend dev', 'API', 2021], ['u3', 'carol — data scientist', 'AI', 2023]] },
  ];
  const DIST = { b3: 0.327, b1: 0.855, b2: 1.220 };

  // ---------- 1. 서랍 3개 = 인덱스 3개 ----------
  const MINI = [[[-60, 18], [0, -14], [58, 12]], [[-50, -10], [10, 20], [62, -16]], [[-62, -6], [-6, 16], [52, -14]]];
  function drawer(i, cx, s, o) { o = o || {}; if (s <= 0.02) return; const c = COLS[i], g = R.G(cx, 250, s, o.op ?? 1);
    el('rect', { x: -140, y: -125, width: 280, height: 250, rx: 12, fill: PANEL, stroke: c.col, 'stroke-width': 2.4 }, g);
    tx(-124, -98, c.name, { 'font-size': 17, 'font-weight': 800, fill: c.col, class: 'mono' }, g);
    tx(124, -98, '3건', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' }, g);
    el('rect', { x: -124, y: -84, width: 248, height: 84, rx: 8, fill: SOFT }, g);
    const P = MINI[i].map(([x, y]) => [x, y - 42]);
    P.forEach((p, j) => { const q = P[(j + 1) % 3]; el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: MUT, 'stroke-width': 1.4, 'stroke-dasharray': '3 3' }, g); });
    P.forEach((p) => el('circle', { cx: p[0], cy: p[1], r: 7, fill: c.col }, g));
    tx(120, -8, 'HNSW 1개', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }, g);
    c.rows.forEach(([id, d], j) => { const y = 26 + j * 32; mono(-124, y, id, { 'font-size': 14.5, 'font-weight': 800, fill: c.col }, g); tx(-92, y, d, { 'font-size': 14, fill: INK }, g); }); }
  function s1(t, c) { const { k, u } = c, X = [170, 480, 790];
    card(480, 46, 150, 46, { rx: 10, stroke: INK, fill: SOFT, text: 'client', fs: 17, mono: true, s: k === 0 ? pop(u, 0.2) : 1 });
    if (k === 0) { X.forEach((x, i) => card(x, 250, 280, 250, { rx: 12, stroke: GRID, dash: '7 6', s: pop(u, 0.6 + i * 0.2) }));
      sub(480, 250, 'Collection 0개', fade(u, 1.4), { 'font-size': 16, 'font-weight': 700 }); sub(480, 110, 'chromadb.Client() · 인메모리', fade(u, 0.8)); return; }
    X.forEach((x, i) => { if (i + 1 > k && k < 4) return; const on = k === i + 1, s = on ? pop(u, 0.3) : 1;
      if (on) grow(480, 70, x, 120, E(u, 0.1, 0.5), COLS[i].col); else el('line', { x1: 480, y1: 70, x2: x, y2: 124, stroke: GRID, 'stroke-width': 1.6 });
      drawer(i, x, s); });
    if (k === 4) { card(480, 398, 760, 34, { rx: 8, fill: INK, stroke: 'none', s: pop(u, 0.3) });
      mono(480, 403, '[Collection(name=products), Collection(name=blogs), Collection(name=users)]', { 'font-size': 14, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      sub(480, 106, '질의는 한 서랍의 인덱스 안에서만 돈다', fade(u, 1.4), { 'font-weight': 700, fill: INK }); } }

  // ---------- 2. 메타데이터 칸 ----------
  function table(ci, x, y, o) { const c = COLS[ci], W = [52, 214, 96, 74], rh = 32; o = o || {};
    mono(x, y - 12, c.name, { 'font-size': 15, 'font-weight': 800, fill: c.col, opacity: o.op ?? 1 });
    const hd = ['id', 'document', c.keys[0], c.keys[1]]; let cx = x;
    hd.forEach((h, j) => { el('rect', { x: cx, y, width: W[j] - 3, height: rh, rx: 4, fill: j >= 2 ? WARNBG : SOFT, opacity: o.op ?? 1 }); tx(cx + 8, y + 21, h, { 'font-size': 13.5, 'font-weight': 700, fill: j >= 2 ? WARN : MUT, opacity: o.op ?? 1 }); cx += W[j]; });
    c.rows.forEach((r, i) => { const yy = y + rh + 4 + i * rh, m = o.meta ? o.meta(i) : 0, hl = o.hl ? o.hl(i) : 0; let xx = x;
      if (hl > 0) el('rect', { x: x - 4, y: yy - 2, width: 440, height: rh - 2, rx: 5, fill: ACCBG, opacity: hl });
      mono(xx + 8, yy + 20, r[0], { 'font-size': 14, 'font-weight': 700, fill: c.col, opacity: o.op ?? 1 }); xx += W[0];
      tx(xx + 8, yy + 20, r[1], { 'font-size': 14, opacity: o.op ?? 1 }); xx += W[1];
      [r[2], r[3]].forEach((v, j) => { if (m > 0.02) pill(xx + W[2 + j] / 2 - 2, yy + 14, String(v), WARN, m, { fs: 13.5, mono: true }); else mono(xx + 10, yy + 20, '—', { 'font-size': 14, fill: OFF, opacity: o.op ?? 1 }); xx += W[2 + j]; }); }); }
  function s2(t, c) { const { k, u } = c;
    table(1, 40, 60, { meta: (i) => (k < 2 ? 0 : k === 2 ? pop(u, 0.4 + i * 0.4) : 1), hl: (i) => (k === 1 ? fade(u, 0.3 + i * 0.5) * (1 - fade(u, 0.8 + i * 0.5)) : 0) });
    if (k >= 3) table(0, 40, 250, { meta: (i) => (k === 3 ? pop(u, 0.5 + i * 0.35) : 1) });
    const RX = 540;
    if (k === 0) { card(RX + 195, 120, 380, 120, { rx: 10, stroke: GRID, fill: SOFT, s: pop(u, 0.3) });
      mono(RX + 18, 92, 'blogs.add(..., metadatas=[...],', { 'font-size': 14, opacity: fade(u, 0.5) }); mono(RX + 18, 116, '          ids=["b1","b2","b3"])', { 'font-size': 14, opacity: fade(u, 0.5) });
      mono(RX + 18, 152, '→ metadatas: [None, None, None]', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) });
      tx(RX + 195, 220, '이미 있는 id로 다시 add 하면', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      tx(RX + 195, 246, '에러 없이 조용히 무시된다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) });
      sub(RX + 195, 290, '태그는 처음 add 할 때 함께 준다', fade(u, 2.3)); return; }
    if (k === 1) { ['documents[i]', 'metadatas[i]', 'ids[i]'].forEach((s, j) => { mono(RX + 30, 110 + j * 46, s, { 'font-size': 16, 'font-weight': 800, fill: [ACC, WARN, INFO][j], opacity: fade(u, 0.3 + j * 0.3) }); });
      el('path', { d: `M${RX + 170},104 C${RX + 220},104 ${RX + 220},150 ${RX + 170},150 M${RX + 170},150 C${RX + 220},150 ${RX + 220},196 ${RX + 170},196`, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: fade(u, 1.2) });
      tx(RX + 240, 156, '같은 i끼리 한 문서', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); sub(RX + 190, 260, '순서가 어긋나도 알려 주지 않는다', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 2) { tx(RX + 20, 120, '{"author": "alice", "year": 2024}', { 'font-size': 14.5, class: 'mono', opacity: fade(u, 0.3) });
      sub(RX + 190, 170, '문서마다 dict 하나 = 태그 묶음', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { sub(RX + 190, 330, '컬렉션마다 키가 달라도 된다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    // k4: 규칙
    [['"year": 2024', '숫자', 1], ['"team": "AI"', '문자열', 1], ['"tags": ["a", "b"]', '리스트 (1.x)', 1], ['"a": {"b": 1}', 'dict', 0]].forEach(([s, w, ok], j) => { const y = 260 + j * 38, sc = pop(u, 0.3 + j * 0.35);
      card(RX + 195, y, 380, 32, { rx: 6, stroke: ok ? GOOD : BAD, fill: ok ? GOODBG : BADBG, sw: 1.6, s: sc });
      mono(RX + 18, y + 5, s, { 'font-size': 14, opacity: fade(u, 0.4 + j * 0.35) }); tx(RX + 370, y + 5, w, { 'font-size': 14, 'font-weight': 700, fill: ok ? GOOD : BAD, 'text-anchor': 'end', opacity: fade(u, 0.4 + j * 0.35) }); });
    mono(RX + 195, 420 - 8, 'ValueError: … got {\'b\': 1} which is a dict', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) }); }

  // ---------- 3. where 필터 ----------
  const SP = { x: 190, y: 26, w: 400, h: 380, qx: 250, qy: 300 }, SC3 = 210;
  const ANG = { b3: -80, b1: -12, b2: -48 };
  const at3 = (id) => { const r = DIST[id] * SC3, a = (ANG[id] * Math.PI) / 180; return [SP.qx + r * Math.cos(a), SP.qy + r * Math.sin(a)]; };
  function s3(t, c) { const { k, u } = c;
    // 다른 서랍은 처음부터 밖
    ['products', 'users'].forEach((n, i) => { const y = 120 + i * 150; card(90, y, 150, 90, { rx: 10, stroke: GRID, dash: '6 5', text: n + '\n3건', fs: 15, mono: true, color: OFF });
      if (k === 0) cross(90, y, 16, pop(u, 0.4 + i * 0.3)); });
    el('rect', { x: SP.x, y: SP.y, width: SP.w, height: SP.h, rx: 12, fill: SOFT, stroke: ACC, 'stroke-width': 2 });
    tx(SP.x + 14, SP.y + 22, 'blogs의 벡터 공간', { 'font-size': 14, 'font-weight': 800, fill: ACC });
    const q = k === 0 ? pop(u, 0.9) : 1;
    COLS[1].rows.forEach(([id, d, , yr]) => { const [x, y] = at3(id), out = id === 'b2' && k >= 1, fo = id === 'b2' ? (k === 1 ? E(u, 0.6, 1.2) : k > 1 ? 1 : 0) : 0;
      el('circle', { cx: x, cy: y, r: 9, fill: out ? OFF : ACC, opacity: 1 - 0.4 * fo });
      mono(x + 14, y - 4, id, { 'font-size': 15, 'font-weight': 800, fill: out ? OFF : ACC }); tx(x + 14, y + 15, d, { 'font-size': 13.5, fill: out ? OFF : MUT });
      if (k >= 1) pill(x + 14 + 22, y - 34, 'year ' + yr, yr === 2024 ? GOOD : BAD, id === 'b2' && k === 1 ? pop(u, 0.3) : k === 1 ? pop(u, 0.2) : 1, { fs: 13.5, mono: true }); });
    if (q > 0.02) { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = (i % 2 ? 6 : 14) * q; p.push([SP.qx + rr * Math.cos(a), SP.qy + rr * Math.sin(a)]); }
      el('polygon', { points: p.map((z) => z.join(',')).join(' '), fill: WARN }); mono(SP.qx - 18, SP.qy + 30, '"벡터 검색 입문"', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: q }); }
    const RX = 620;
    if (k === 0) { mono(RX, 100, 'blogs.query(', { 'font-size': 15, opacity: fade(u, 0.3) }); mono(RX, 126, '  query_texts=["벡터 검색 입문"])', { 'font-size': 15, opacity: fade(u, 0.5) });
      tx(RX, 200, '후보', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); mono(RX + 60, 204, '3건', { 'font-size': 26, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      sub(RX + 150, 250, 'products · users는 처음부터 밖', fade(u, 1.8)); return; }
    if (k === 1) { mono(RX, 100, 'where={"year": 2024}', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.2) });
      tx(RX, 200, '후보', { 'font-size': 15, 'font-weight': 700 }); mono(RX + 60, 204, String(u > 1.2 ? 2 : 3) + '건', { 'font-size': 26, 'font-weight': 800, fill: ACC });
      sub(RX + 150, 250, 'b2 (2023) 탈락', fade(u, 1.3), { fill: BAD, 'font-weight': 700 }); return; }
    // 거리 선: 남은 후보에게만
    ['b3', 'b1'].forEach((id, i) => { const [x, y] = at3(id), f = k === 2 ? E(u, 0.3 + i * 0.6, 0.9 + i * 0.6) : 1;
      if (f > 0) el('line', { x1: SP.qx, y1: SP.qy, x2: lerp(SP.qx, x, f), y2: lerp(SP.qy, y, f), stroke: i === 0 ? GOOD : ACC, 'stroke-width': 2.6 });
      if (f >= 1) card((SP.qx + x) / 2 + (i ? 0 : -34), (SP.qy + y) / 2, 56, 26, { rx: 6, fill: PANEL, stroke: i === 0 ? GOOD : GRID, sw: 1.4, text: DIST[id].toFixed(2), fs: 13.5, mono: true, color: i === 0 ? GOOD : INK }); });
    if (k === 2) { tx(RX, 120, '남은 2건 안에서만 거리를 잰다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(RX, 170, 'b3  0.33', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) }); mono(RX, 204, 'b1  0.85', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      sub(RX + 150, 250, 'b2는 거리를 잴 대상도 아니다', fade(u, 2.1)); return; }
    if (k === 3) { el('rect', { x: RX - 10, y: 70, width: 330, height: 120, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(RX + 6, 104, 'ids', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3) }); mono(RX + 110, 104, '[["b3", "b1"]]', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.5) });
      mono(RX + 6, 140, 'documents', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) }); tx(RX + 110, 140, '임베딩 모델 선택법,', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.2) }); tx(RX + 110, 166, 'RAG 입문 가이드', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.4) });
      sub(RX + 155, 230, '가까운 b3가 먼저 온다', fade(u, 1.9), { 'font-weight': 700, fill: INK }); return; }
    // k4: 9 → 3 → 2
    [['전체 (3 컬렉션)', 9, OFF], ['blogs만', 3, ACC], ['where year=2024', 2, GOOD]].forEach(([n, v, col], i) => { const y = 90 + i * 70;
      tx(RX, y, n, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.4) });
      R.hbar(RX, y + 12, 220, v, 9, { col, text: v + '건', u: E(u, 0.3 + i * 0.4, 0.9 + i * 0.4), h: 20 }); });
    sub(RX + 140, 330, '좁힌 뒤에 거리를 잰다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); }

  // ---------- 4. PersistentClient ----------
  const FILES = [['./db/', '', 0], ['chroma.sqlite3', '196,608 B', 1], ['<uuid>/', '', 1], ['data_level0.bin', '167,600 B', 2], ['header.bin', '100 B', 2], ['length.bin', '400 B', 2], ['link_lists.bin', '0 B', 2]];
  function tree(x, y, n, o) { o = o || {}; FILES.forEach(([f, sz, lv], i) => { const op = clamp(n - i); if (op <= 0.02) return; const yy = y + i * 30, xx = x + lv * 26;
      if (lv) el('path', { d: `M${xx - 16},${yy - 22} V${yy - 5} H${xx - 4}`, fill: 'none', stroke: GRID, 'stroke-width': 1.6, opacity: op });
      mono(xx, yy, f, { 'font-size': 14.5, 'font-weight': lv < 2 ? 800 : 400, fill: f === 'chroma.sqlite3' ? INFO : lv === 2 || f === '<uuid>/' ? ACC : INK, opacity: op });
      if (sz) mono(x + 330, yy, sz, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }); }
  function ram(x, y, alive, n, o) { o = o || {};
    el('rect', { x, y, width: 330, height: 250, rx: 14, fill: 'none', stroke: alive ? INK : OFF, 'stroke-width': 2, 'stroke-dasharray': '8 6' });
    tx(x + 16, y + 24, o.title || 'python 프로세스 (RAM)', { 'font-size': 14.5, 'font-weight': 700, fill: alive ? MUT : OFF });
    mono(x + 16, y + 56, o.client ?? 'PersistentClient(path="./db")', { 'font-size': 14, 'font-weight': 700, fill: alive ? ACC : OFF });
    COLS[0].rows.forEach(([id, d], i) => { const op = clamp(n - i); if (op <= 0.02) return; card(x + 165, y + 100 + i * 44, 290, 36, { rx: 6, stroke: alive ? INFO : OFF, sw: 1.5, fill: PANEL });
      mono(x + 34, y + 105 + i * 44, id, { 'font-size': 14, 'font-weight': 800, fill: alive ? INFO : OFF, opacity: op }); tx(x + 64, y + 105 + i * 44, d.split(' ').slice(0, 2).join(' ') + ' …', { 'font-size': 14, fill: alive ? INK : OFF, opacity: op }); }); }
  function s4(t, c) { const { k, u } = c, DX = 560;
    if (k === 0) { ram(40, 60, true, 0, { client: '' });
      const sw = E(u, 0.4, 1.2); mono(56, 116, 'Client()', { 'font-size': 14, 'font-weight': 700, fill: OFF, opacity: 1 - sw, 'text-decoration': 'line-through' });
      mono(56, 144, 'PersistentClient(path="./db")', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: sw });
      tree(DX, 110, pop(u, 1.4)); sub(DX + 165, 170, '빈 폴더가 생겼다', fade(u, 1.8)); return; }
    if (k === 1) { ram(40, 60, true, E(u, 0.2, 1.4) * 3); tree(DX, 110, 1);
      mono(205, 360, 'products.add(...)  ← 인메모리 때와 같은 줄', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); return; }
    if (k === 2) { ram(40, 60, true, 3); for (let i = 0; i < 6; i++) dot([[370, 160 + (i % 3) * 30], [DX - 10, 130 + i * 28]], ((u * 0.8 + i / 6) % 1) * (u < 2.4 ? 1 : 0), ACC, 5);
      tree(DX, 110, 1 + E(u, 0.2, 2.0) * 6); sub(DX + 165, 340, 'flush를 부르지 않아도 기록된다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { const dead = E(u, 0.1, 0.6), back = E(u, 1.0, 2.0);
      if (back <= 0) { ram(40, 60, false, 3 * (1 - dead) + 0.001, { title: '이전 프로세스 (종료)' }); if (dead > 0.5) cross(205, 185, 26, pop(u, 0.4)); }
      if (back > 0) { ram(40, 60, true, back * 3, { title: '새 프로세스 (같은 path)' }); for (let i = 0; i < 3; i++) dot([[DX - 10, 150 + i * 40], [390, 180 + i * 44]], clamp(back * 1.5 - i * 0.2), INFO, 6); }
      tree(DX, 110, 7); mono(DX, 360, 'products.count()  →  3', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    // k4: 무엇이 어디에
    ram(40, 60, true, 3); tree(DX, 110, 7);
    el('rect', { x: DX - 10, y: 122, width: 360, height: 28, rx: 6, fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: fade(u, 0.3) });
    el('rect', { x: DX + 16, y: 154, width: 334, height: 146, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 1.0) });
    tx(DX, 336, 'sqlite3 = 문서 · 메타데이터 · 컬렉션 정보', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
    tx(DX, 364, '<uuid>/ = 컬렉션 하나의 HNSW 그래프', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) });
    sub(DX + 170, 402, 'parquet 파일은 만들어지지 않는다 (1.5.9 실행)', fade(u, 2.0)); }

  // ---------- 5. update / upsert / delete ----------
  const PT5 = { b1: [640, 110], b2: [880, 300], b2n: [800, 220], b3: [700, 170], b4: [620, 300] };
  function s5(t, c) { const { k, u } = c;
    const cnt = k === 0 || k === 1 ? 3 : k === 2 ? (u > 1.4 ? 4 : 3) : k === 3 ? (u > 1.2 ? 3 : 4) : 3;
    card(800, 380, 220, 50, { rx: 10, stroke: ACC, sw: 2.2 }); mono(720, 386, 'blogs.count()', { 'font-size': 14.5 }); mono(892, 388, String(cnt), { 'font-size': 24, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
    // 공간
    el('rect', { x: 560, y: 26, width: 380, height: 320, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(574, 48, 'blogs의 점 (위치는 그림용)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    const mv = k === 0 ? 0 : k === 1 ? E(u, 0.4, 1.6) : 1, b2 = [lerp(PT5.b2[0], PT5.b2n[0], mv), lerp(PT5.b2[1], PT5.b2n[1], mv)];
    const pts = [['b1', PT5.b1, 1], ['b2', b2, 1], ['b3', PT5.b3, k < 3 ? 1 : k === 3 ? 1 - E(u, 0.6, 1.2) : 0], ['b4', PT5.b4, k < 2 ? 0 : k === 2 ? pop(u, 1.2) : 1]];
    if (k === 1) el('line', { x1: PT5.b2[0], y1: PT5.b2[1], x2: b2[0], y2: b2[1], stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    pts.forEach(([id, [x, y], s]) => { if (s <= 0.02) return; el('circle', { cx: x, cy: y, r: 9 * s, fill: id === 'b2' && k <= 1 ? WARN : ACC }); mono(x + 14, y + 5, id, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: s }); });
    // 행 표
    const ROWS = [['b1', 'RAG 입문 가이드', 2024], ['b2', k === 0 ? null : 'Vector DB 심층 비교 (2025 ver.)', 2025], ['b3', '임베딩 모델 선택법', 2024], ['b4', 'Chroma 0.5 릴리즈 정리', 2025]];
    tx(40, 50, 'blogs', { 'font-size': 16, 'font-weight': 800, fill: ACC, class: 'mono' });
    ROWS.forEach(([id, d, yr], i) => { const y = 74 + i * 58;
      let s = 1; if (id === 'b4') s = k < 2 ? 0 : k === 2 ? pop(u, 0.4) : 1; if (s <= 0.02) return;
      const gone = id === 'b3' && k >= 3, gf = id === 'b3' ? (k === 3 ? E(u, 0.4, 1.0) : k > 3 ? 1 : 0) : 0;
      card(280, y + 20, 490, 48, { rx: 8, stroke: gone ? OFF : id === 'b2' && k <= 1 ? WARN : id === 'b4' && k === 2 ? GOOD : GRID, sw: 1.8, s, fill: gone ? SOFT : PANEL });
      mono(50, y + 26, id, { 'font-size': 15, 'font-weight': 800, fill: gone ? OFF : ACC, opacity: s });
      if (id === 'b2' && k === 0) { const sw = E(u, 0.4, 1.4); tx(90, y + 26, 'Vector DB 비교 후기', { 'font-size': 14.5, fill: OFF, opacity: 1 - sw, 'text-decoration': 'line-through' });
        tx(90, y + 26, 'Vector DB 심층 비교 (2025 ver.)', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: sw }); pill(470, y + 20, String(sw > 0.5 ? 2025 : 2023), WARN, 1, { fs: 13.5, mono: true }); }
      else { tx(90, y + 26, d, { 'font-size': 14.5, fill: gone ? OFF : INK, opacity: s, 'text-decoration': gone ? 'line-through' : null }); pill(470, y + 20, String(yr), gone ? OFF : MUT, s, { fs: 13.5, mono: true }); }
      if (gone) el('line', { x1: 40, y1: y + 20, x2: lerp(40, 520, gf), y2: y + 20, stroke: BAD, 'stroke-width': 2.6 });
      if (k === 4 && !gone) { const at = 0.4 + i * 0.4; check(540, y + 20, 9, pop(u, at)); } });
    if (k === 0) mono(40, 330, 'blogs.update(ids=["b2"], documents=[…], metadatas=[…])', { 'font-size': 14, opacity: fade(u, 0.2) });
    if (k === 1) { mono(40, 330, '텍스트가 바뀌면 벡터도 다시 계산', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.4) }); sub(280, 366, '인덱스 전체를 다시 만들지 않는다', fade(u, 1.8)); }
    if (k === 2) mono(40, 330, 'blogs.upsert(ids=["b4"], …)  # 없던 id → add', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.2) });
    if (k === 3) mono(40, 330, 'blogs.delete(ids=["b3"])', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.2) });
    if (k === 4) { mono(40, 330, 'blogs.delete(where={"year": {"$lt": 2023}})', { 'font-size': 14, fill: BAD, opacity: fade(u, 0.2) });
      sub(280, 366, '2023년보다 이른 글이 없어 아무것도 안 지워진다', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      mono(280, 400, 'ids → [b1, b2, b4]', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.2) }); } }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'products · blogs · users를 각각 Collection으로 나누면 blogs.query()는 무엇을 검색하는가?',
      o: ['세 컬렉션의 9건 전부', 'blogs의 3건만', 'blogs와 같은 client의 첫 컬렉션'], a: 1,
      why: '컬렉션마다 HNSW 인덱스가 따로 있다. query를 부른 컬렉션의 인덱스만 돌기 때문에 다른 서랍의 상품·사용자가 섞이지 않는다.' },
    { q: '이미 b1~b3가 있는 blogs에 같은 ids로 metadatas를 넣어 add를 다시 부르면 어떻게 되는가?',
      o: ['메타데이터가 덮어써진다', '중복 id 에러가 난다', '에러 없이 무시되어 메타데이터가 None으로 남는다'], a: 2,
      why: '실행해 보면 metadatas가 [None, None, None] 그대로다. 태그는 처음 add 할 때 주거나, 나중에는 update로 바꾼다.' },
    { q: 'where={"year": 2024}를 붙여 "벡터 검색 입문"을 질의했다. ids가 [["b3", "b1"]] 순서인 이유는 무엇인가?',
      o: ['b3가 질의와 거리 0.33으로 더 가까워서', 'id를 내림차순으로 정렬해서', 'b3가 나중에 추가돼서'], a: 0,
      why: '필터로 b1·b3만 남긴 뒤 그 안에서 거리를 잰다. b3는 0.33, b1은 0.85라 b3가 먼저 온다.' },
    { q: 'PersistentClient(path="./db")로 add 한 뒤 폴더를 보면 무엇이 생기는가?',
      o: ['chroma.sqlite3와 컬렉션별 <uuid>/ HNSW 파일', 'parquet 파일 하나', '아무것도 없다. flush를 불러야 한다'], a: 0,
      why: 'add가 끝나면 문서·메타데이터는 chroma.sqlite3에, 벡터 그래프는 <uuid>/data_level0.bin 같은 파일에 바로 기록된다.' },
    { q: 'b2 update → b4 upsert → b3 delete → where year<2023 delete를 차례로 하면 blogs.count()는 얼마인가?',
      o: ['2', '3', '4'], a: 1,
      why: 'upsert의 b4는 없던 id라 새로 들어가 4건, b3를 지워 3건이 된다. 2023년보다 이른 글은 없어 마지막 삭제는 아무것도 지우지 않는다.' },
  ];

  const summary = [
    '컬렉션마다 인덱스가 따로 있어서 query는 부른 컬렉션 안에서만 돈다.',
    '메타데이터는 documents, ids와 같은 순서의 dict로 넣고, 같은 id로 다시 add하면 무시된다.',
    'where 필터는 후보를 먼저 줄이고 남은 문서끼리만 거리를 재서, blogs 3건이 2건이 되었다.',
    'PersistentClient는 add 즉시 sqlite3와 HNSW 파일에 쓰고, 수정과 삭제는 재빌드 없이 반영된다.',
  ];
  const review = [
    { q: '상품 검색 결과에 블로그 글이 섞여 나온다. 먼저 확인할 것은 무엇인가?',
      o: ['상품과 블로그를 한 컬렉션에 넣었는지', 'n_results가 너무 작은지', 'PersistentClient를 썼는지'], a: 0,
      why: '컬렉션을 나누면 인덱스가 갈라져 섞일 수 없다. 한 컬렉션에 넣었다면 컬렉션을 나누거나 where로 종류를 거른다.' },
    { q: '2024년 글만 찾으려고 where를 붙였는데 결과가 비었다. 메타데이터는 처음 add 이후 같은 id로 add를 다시 불러 넣었다. 원인은 무엇인가?',
      o: ['where 문법이 MongoDB와 달라서', '디스크에 아직 저장되지 않아서', '두 번째 add가 무시되어 year 태그가 없어서'], a: 2,
      why: '같은 id로 다시 add 하면 에러 없이 무시된다. 문서에 year가 없으니 where 조건에 걸리는 후보가 0건이다.' },
    { q: '서버를 재시작해도 blogs를 유지하면서, 글 하나만 고치고 싶다. 알맞은 조합은 무엇인가?',
      o: ['Client()로 열고 delete 후 add', 'PersistentClient(path)로 열고 update(ids=[...])', 'PersistentClient(path)로 열고 컬렉션을 지운 뒤 다시 만든다'], a: 1,
      why: 'PersistentClient는 디스크에서 다시 불러오고, update는 그 문서의 텍스트와 벡터만 바꾼다. 인덱스 전체를 다시 만들 필요가 없다.' },
  ];

  R.page({ title: 'Chroma 서랍 — 컬렉션 · 메타데이터 · 영속 · CRUD', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
