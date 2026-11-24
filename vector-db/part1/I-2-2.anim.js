/* I-2-2 벡터 DB 종류와 분류 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 프로세스 RAM 안의 행렬(FAISS) → 디스크 폴더와 메타 열(Chroma) → 테이블에 붙는 vector 열과 JOIN(pgvector)
 *       → 리전 위의 샤드·복제와 namespace 칸(Pinecone) → 규모 × 운영 복잡도 평면(결정 매트릭스).
 *       앞 네 장면의 오른쪽 위 작은 평면은 페이지 데이터(matrix)의 점이 어디로 움직이는지 보여 준다.
 * 숫자: 페이지 STEPS 데이터와 코드. faiss.py 는 faiss-cpu 1.16 으로 그대로 돌려 ntotal 100,000, 결과 모양 (1, 5),
 *       vec.idx 307MB(=100,000×768×4바이트)를 확인했다. SLA 99.9% 의 한 달 허용 중단 약 43분은 30일 기준 계산값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, dbIcon, server, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (s, u, a, d) => s.slice(0, Math.round(s.length * clamp((u - a) / d)));
  const KC = { library: WARN, embedded: GOOD, sql: INFO, managed: ACC };

  // 오른쪽 위 작은 결정 평면: 이 beat 의 matrix 점을 앞 beat 위치에서 이어서
  function miniMatrix(c) { const b = c.beat; if (!b.showMatrix || !b.matrix.length) return;
    const x0 = 760, y0 = 40, w = 170, h = 120, prevM = (c.prev && c.prev.matrix) || [];
    el('rect', { x: x0, y: y0, width: w, height: h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(x0 + w / 2, y0 + h + 18, '규모 →', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); tx(x0 - 6, y0 + 16, '운영↑', { 'text-anchor': 'end', 'font-size': 13.5, fill: MUT });
    b.matrix.forEach((m) => { const p = prevM.find((q) => q.key === m.key), px = tween(p ? p.x : m.x, m.x, c.u), py = tween(p ? p.y : m.y, m.y, c.u);
      const cx = x0 + px / 100 * w, cy = y0 + h - py / 100 * h, r = { sm: 6, md: 8, lg: 11 }[m.size] * (p ? 1 : pop(c.u, 0.3));
      el('circle', { cx, cy, r, fill: KC[m.key] }); }); }

  // ---------- 장면 1. FAISS: 프로세스 RAM 안의 행렬 ----------
  const RAM = { x: 60, y: 70, w: 430, h: 300 };
  function proc(alive) { el('rect', { x: RAM.x - 20, y: RAM.y - 40, width: RAM.w + 40, height: RAM.h + 60, rx: 14, fill: 'none', stroke: alive ? INK : OFF, 'stroke-width': 2, 'stroke-dasharray': alive ? null : '6 5' });
    mono(RAM.x - 4, RAM.y - 14, 'python 프로세스 · RAM', { 'font-size': 14.5, 'font-weight': 700, fill: alive ? INK : OFF }); }
  function matrix(fillU, o) { o = o || {}; const rows = 16, cols = 24, cw = RAM.w / cols, rh = (RAM.h - 30) / rows;
    el('rect', { x: RAM.x, y: RAM.y, width: RAM.w, height: RAM.h - 30, rx: 6, fill: PANEL, stroke: o.dim ? OFF : WARN, 'stroke-width': 2 });
    const n = Math.floor(rows * fillU);
    for (let r = 0; r < n; r++) el('rect', { x: RAM.x + 2, y: RAM.y + 2 + r * rh, width: RAM.w - 4, height: rh - 2, rx: 2, fill: o.dim ? OFF : WARN, opacity: o.dim ? 0.25 : 0.18 + ((r * 7) % 5) * 0.08 });
    if (o.hiRows) o.hiRows.forEach((r) => el('rect', { x: RAM.x + 2, y: RAM.y + 2 + r * rh, width: RAM.w - 4, height: rh - 2, rx: 2, fill: ACC, opacity: 0.8 }));
    mono(RAM.x + RAM.w, RAM.y + RAM.h - 8, '768열', { 'text-anchor': 'end', 'font-size': 14, fill: MUT }); }
  function s1(t, c) { const { k, u } = c; miniMatrix(c); const RX = 560;
    if (k === 0) { proc(true); R.snippet(RAM.x + 20, RAM.y + 20, ['import faiss', 'import numpy as np'], { fs: 16, op: fade(u, 0.2) });
      server(700, 260, '서버 없음', { op: 0.5, s: 0.9 }); cross(700, 230, 30, pop(u, 0.9));
      tx(RX, 120, '라이브러리를 import 한다', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.5) }); tx(RX, 148, '네트워크 호출도 없다', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.8) }); return; }
    proc(k !== 4 || u < 1.4);
    if (k === 1) { matrix(0); mono(RAM.x + 20, RAM.y + 40, 'IndexFlatL2(768)', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3) });
      mono(RX, 120, 'ntotal = 0', { 'font-size': 20, 'font-weight': 800 }); tx(RX, 156, 'L2 거리 · 768차원', { 'font-size': 15, fill: MUT }); return; }
    if (k === 2) { matrix(E(u, 0.2, 1.8)); const n = Math.round(tween(0, 100000, u, 1.6));
      mono(RX, 230, `ntotal = ${n.toLocaleString('en-US')}`, { 'font-size': 20, 'font-weight': 800, fill: WARN }); mono(RX, 266, `RAM ≈ ${Math.round(n * 768 * 4 / 1e6)}MB`, { 'font-size': 17, 'font-weight': 700 });
      tx(RX, 296, '100,000 × 768 × 4바이트', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 3) { matrix(1, { hiRows: u > 1.2 ? [3, 9, 12] : [] });
      el('rect', { x: RAM.x + 40, y: RAM.y + RAM.h + 4, width: 300, height: 22, rx: 4, fill: ACC, opacity: pop(u, 0.2) }); mono(RAM.x + 190, RAM.y + RAM.h + 20, 'query (1 × 768)', { 'text-anchor': 'middle', 'font-size': 14, fill: PANEL, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(RX, 210, 'distances  (1, 5)', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) }); mono(RX, 244, 'ids        (1, 5)', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      tx(RX, 300, '원본 문서 · 메타데이터', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); cross(RX + 190, 294, 9, pop(u, 2.1));
      tx(RX, 326, 'id만 받아 원본은 따로 찾아야 한다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { const dead = u > 1.4; matrix(dead ? 1 : 1, { dim: dead });
      dbIcon(720, 300, 'vec.idx · 307MB', { s: pop(u, 0.2), stroke: WARN }); fly(RAM.x + RAM.w, 200, 690, 300, seg(u, 0.3, 1.1), 'write_index', { mono: true, fill: WARN });
      if (dead) { cross(RAM.x + RAM.w / 2, RAM.y + 120, 40, pop(u, 1.4)); tx(RAM.x + RAM.w / 2, RAM.y + 200, '프로세스가 죽으면 RAM은 비고', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: BAD }); tx(RAM.x + RAM.w / 2, RAM.y + 226, '파일만 남는다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: BAD }); }
      tx(RX, 200, '동기화 · 락은 직접', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { matrix(1); const g = R.G(700, 250, pop(u, 0.2)); el('rect', { x: -70, y: -46, width: 140, height: 92, rx: 8, fill: INK }, g);
      for (let i = -3; i <= 3; i++) { el('line', { x1: i * 18, y1: -56, x2: i * 18, y2: -46, stroke: INK, 'stroke-width': 3 }, g); el('line', { x1: i * 18, y1: 46, x2: i * 18, y2: 56, stroke: INK, 'stroke-width': 3 }, g); }
      tx(0, 6, 'faiss-gpu', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: PANEL, class: 'mono' }, g);
      tx(RX, 360, '10억 벡터까지', { 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.8) }); tx(RX + 160, 360, '메타 필터는 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); return; }
    matrix(1);
    [['ML 파이프라인 안의 임시 인덱스', 0.2], ['오프라인 배치 검색', 0.5], ['연구 · 실험 코드', 0.8]].forEach(([s, a], i) => { const y = 220 + i * 60; card(740, y, 340, 46, { rx: 23, stroke: WARN, sw: 2, text: s, fs: 15.5, s: pop(u, a) }); }); }

  // ---------- 장면 2. Chroma: 디스크 폴더 + 메타 열 ----------
  const DOCS = [['d1', 'tech', 2024, 'FAISS는...'], ['d2', 'law', 2023, 'GDPR은...'], ['d3', 'tech', 2024, 'HNSW는...']];
  function folder(cx, cy, s) { const g = R.G(cx, cy, s); el('path', { d: 'M-60,-36 H-14 L-4,-26 H60 V40 H-60 Z', fill: GOODBG, stroke: GOOD, 'stroke-width': 2.5 }, g);
    mono(0, 62, './chroma_db', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD }, g); ['sqlite3', 'hnsw/'].forEach((f, i) => mono(-44, -2 + i * 22, f, { 'font-size': 13.5, fill: INK }, g)); }
  function dtable(cols, rowsShown, o) { o = o || {}; const x0 = 260, y0 = 120, W = { id: 56, embedding: 136, category: 96, year: 70, document: 124 };
    let x = x0; cols.forEach((cn) => { const w = W[cn], s = o.colS ? o.colS(cn) : 1; el('rect', { x, y: y0, width: (w - 4) * s, height: 32, rx: 5, fill: cn === 'category' || cn === 'year' ? GOOD : INK });
      if (s > 0.6) mono(x + 8, y0 + 22, cn, { 'font-size': 14, 'font-weight': 700, fill: PANEL });
      DOCS.forEach((d, r) => { if (r >= rowsShown) return; const val = { id: d[0], embedding: '[0.1, 0.2, …]', category: d[1], year: d[2], document: d[3] }[cn], pass = o.pass ? o.pass(d) : null;
        el('rect', { x, y: y0 + 38 + r * 40, width: (w - 4) * s, height: 34, rx: 5, fill: pass === true ? GOODBG : PANEL, stroke: pass === false ? OFF : GRID, 'stroke-width': 1.5, opacity: pass === false ? 0.5 : 1 });
        if (s > 0.6) mono(x + 8, y0 + 60 + r * 40, String(val), { 'font-size': 14, fill: pass === false ? OFF : INK }); });
      x += w; }); return x; }
  function s2(t, c) { const { k, u } = c; miniMatrix(c);
    folder(130, 200, k === 0 ? pop(u, 0.3) : 1);
    if (k === 0) { mono(300, 140, 'PersistentClient(path="./chroma_db")', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      tx(300, 200, '경로를 주면 그 폴더에 데이터가 남는다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.9) }); tx(300, 230, 'FAISS와 갈리는 첫 줄', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.3) }); return; }
    mono(280, 90, 'collection "docs" · hnsw:space = cosine', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: k === 1 ? fade(u, 0.2) : 1 });
    if (k === 1) { dtable(['id', 'embedding'], 0, { colS: () => E(u, 0.5, 1.2) }); return; }
    const meta = k >= 3, cols = meta ? ['id', 'embedding', 'category', 'year', 'document'] : ['id', 'embedding'];
    if (k === 2) { dtable(cols, Math.ceil(lerp(0, 3, E(u, 0.2, 1.4)))); tx(280, 320, '아직 규모는 작고 운영은 쉽다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 3) { dtable(cols, 3, { colS: (cn) => cn === 'id' || cn === 'embedding' ? 1 : E(u, 0.3, 1.0) }); tx(280, 300, 'FAISS에는 없던 칸', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) }); return; }
    if (k === 4) { const on = u > 1.0; dtable(cols, 3, { pass: on ? (d) => d[1] === 'tech' && d[2] === 2024 : null });
      R.snippet(280, 270, ['where={"$and": [{"category": "tech"},', '             {"year": 2024}]}'], { fs: 14.5, op: fade(u, 0.2) });
      tx(280, 375, 'd1 · d3만 남는다 (n_results=5여도 2건)', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) }); return; }
    if (k === 5) { dtable(cols, 3); [['파일 영속', 0.2], ['메타데이터 필터', 0.5], ['LangChain 통합', 0.8]].forEach(([s, a], i) => { card(380 + i * 190, 300, 170, 44, { rx: 22, stroke: GOOD, sw: 2, text: s, fs: 15, s: pop(u, a) }); });
      tx(300, 370, '운영은 Easy', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) }); return; }
    // k6: 한계
    dtable(cols, 3, { pass: () => false });
    const sc = (v) => 280 + Math.log10(v / 1e5) / 3 * 560; el('line', { x1: 280, y1: 330, x2: 840, y2: 330, stroke: MUT, 'stroke-width': 2 });
    [[1e5, '10만'], [1e6, '100만'], [1e7, '1천만'], [1e8, '1억']].forEach(([v, s]) => { el('line', { x1: sc(v), y1: 324, x2: sc(v), y2: 336, stroke: MUT, 'stroke-width': 2 }); tx(sc(v), 358, s, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); });
    el('rect', { x: 280, y: 300, width: (sc(1e7) - 280) * E(u, 0.2, 1.0), height: 20, rx: 4, fill: GOOD, opacity: 0.7 });
    el('rect', { x: sc(1e7), y: 300, width: (sc(1e8) - sc(1e7)) * E(u, 1.0, 1.6), height: 20, rx: 4, fill: BAD, opacity: 0.6 });
    tx(sc(1e7) + 10, 290, '성능이 무너진다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
    tx(280, 400, '단일 프로세스라 분산 · HA 없음', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }

  // ---------- 장면 3. pgvector: 테이블에 vector 열 ----------
  const PCOL = [['id', 60], ['user_id', 90], ['category', 100], ['content', 110], ['embedding', 150], ['created_at', 120]];
  function pgTable(x, y, o) { o = o || {}; let xx = x; mono(x, y - 12, 'documents', { 'font-size': 15, 'font-weight': 800, fill: INFO });
    PCOL.forEach(([n, w]) => { const isE = n === 'embedding', s = isE && o.embS != null ? o.embS : 1; if (s <= 0.01) { xx += w; return; }
      el('rect', { x: xx, y, width: (w - 4) * s, height: 30, rx: 5, fill: isE ? INFO : INK });
      if (s > 0.6) mono(xx + 6, y + 20, n, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL });
      for (let r = 0; r < 3; r++) { const keep = o.rowKeep ? o.rowKeep(r) : 1;
        el('rect', { x: xx, y: y + 34 + r * 34, width: (w - 4) * s, height: 30, rx: 5, fill: isE ? INFOBG : PANEL, stroke: GRID, 'stroke-width': 1.3, opacity: keep });
        if (isE && s > 0.6) mono(xx + 6, y + 54 + r * 34, 'vector(768)', { 'font-size': 13.5, fill: INFO, opacity: keep }); }
      xx += w; }); return xx; }
  function s3(t, c) { const { k, u } = c; miniMatrix(c); const TX = 40, TY = 200;
    if (k === 0) { dbIcon(300, 210, 'PostgreSQL', { s: 1.4 }); const p = pop(u, 0.6); card(560, 210, 200, 56, { rx: 12, fill: INFOBG, stroke: INFO, sw: 2.5, text: 'vector 확장', fs: 17, color: INFO, s: p });
      grow(458, 210, 370, 210, E(u, 0.9, 1.4), INFO, { sw: 3 }); mono(480, 330, 'CREATE EXTENSION vector;', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(480, 362, '새 서버 없이 기존 DB가 벡터를 다룬다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { pgTable(TX, TY, { embS: E(u, 0.6, 1.4) }); tx(TX + 360, TY + 150, '기존 열 옆에 한 칸 더', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.5) }); return; }
    if (k === 2) { pgTable(TX, TY); const gx = 440, gy = 120, nodes = [[0, 0], [40, -24], [80, 6], [36, 30], [116, -18]];
      [[0, 1], [1, 2], [0, 3], [3, 2], [2, 4], [1, 4]].forEach(([a, b], i) => grow(gx + nodes[a][0], gy + nodes[a][1], gx + nodes[b][0], gy + nodes[b][1], E(u, 0.3 + i * 0.1, 0.7 + i * 0.1), INFO, { plain: true, sw: 2.2 }));
      nodes.forEach(([dx, dy], i) => el('circle', { cx: gx + dx, cy: gy + dy, r: 6 * pop(u, 0.3 + i * 0.08), fill: PANEL, stroke: INFO, 'stroke-width': 2.2 }));
      grow(gx + 40, gy + 40, 470, TY - 4, E(u, 1.0, 1.4), INFO); mono(580, 116, 'USING hnsw', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.8) });
      mono(40, 380, 'm = 16, ef_construction = 64', { 'font-size': 14.5, opacity: fade(u, 1.0) }); tx(320, 380, '튜닝할 손잡이가 생긴다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) }); return; }
    if (k === 3) { pgTable(TX, TY);
      const ux = 300, uy = 70; ['users', 'id · name · tenant_id'].forEach((s, i) => mono(ux, uy + i * 26, s, { 'font-size': i ? 14 : 15, 'font-weight': i ? 500 : 800, fill: i ? INK : INFO, opacity: fade(u, 0.2) }));
      el('rect', { x: ux - 10, y: uy - 22, width: 220, height: 60, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2, opacity: fade(u, 0.2) });
      grow(TX + 100, TY, ux + 20, uy + 40, E(u, 0.5, 1.1), INFO, { plain: true, sw: 2.5, dash: '6 4' }); mono(ux + 240, uy + 26, 'JOIN users u ON u.id = d.user_id', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) });
      el('rect', { x: 820, y: TY, width: 110, height: 30, rx: 5, fill: ACC, opacity: fade(u, 1.3) }); mono(830, TY + 20, 'distance', { 'font-size': 14, 'font-weight': 700, fill: PANEL, opacity: fade(u, 1.3) });
      [0.12, 0.31, 0.47].forEach((v, r) => { el('rect', { x: 820, y: TY + 34 + r * 34, width: 110, height: 30, rx: 5, fill: ACCBG, opacity: fade(u, 1.5 + r * 0.15) }); mono(830, TY + 54 + r * 34, v.toFixed(2), { 'font-size': 14, fill: ACC, opacity: fade(u, 1.5 + r * 0.15) }); });
      mono(TX, 360, 'd.embedding <=> $1 AS distance', { 'font-size': 15.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) }); tx(TX + 330, 360, '(거리 값은 예시)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { pgTable(TX, TY, { rowKeep: (r) => (r === 1 && u > 1.2 ? 0.25 : 1) });
      [['tenant_id = $2', WARN], ['category = $3', WARN], ["created_at > now() - 30일", WARN]].forEach(([s, col], i) => pill(130 + i * 215, 110, s, col, pop(u, 0.2 + i * 0.25), { mono: true, fs: 14 }));
      mono(TX, 360, 'ORDER BY embedding <=> $1  LIMIT 10', { 'font-size': 15.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      tx(TX + 420, 360, '규모는 ~5천만까지', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 5) { // 트랜잭션: 둘 다 되거나 둘 다 안 되거나
      const bx = 160, by = 120; el('path', { d: `M${bx},${by} h-20 v190 h20`, fill: 'none', stroke: INFO, 'stroke-width': 3, opacity: fade(u, 0.2) });
      mono(bx - 30, by - 14, 'BEGIN;', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.2) }); mono(bx - 30, by + 222, 'COMMIT;', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      card(bx + 200, by + 45, 360, 50, { rx: 8, text: 'INSERT INTO documents (…, embedding)', fs: 14.5, mono: true, s: pop(u, 0.5) });
      card(bx + 200, by + 135, 360, 50, { rx: 8, text: 'UPDATE users SET doc_count + 1', fs: 14.5, mono: true, s: pop(u, 0.9) });
      check(bx + 410, by + 45, 12, pop(u, 1.8)); check(bx + 410, by + 135, 12, pop(u, 1.9));
      tx(660, 180, '둘 다 반영되거나', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.8) }); tx(660, 208, '둘 다 취소된다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) });
      tx(660, 250, '벡터 전용 서버에는 없는 보장', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 6) { pgTable(TX, TY); [['인프라 재사용', 0.2], ['SQL 결합', 0.5], ['ACID', 0.8]].forEach(([s, a], i) => card(170 + i * 230, 120, 200, 46, { rx: 23, stroke: INFO, sw: 2, text: s, fs: 15.5, s: pop(u, a) }));
      tx(TX, 360, '운영 도구를 새로 배우지 않아도 된다', { 'font-size': 15.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.3) }); return; }
    // k7: 한계 — 속도와 샤딩
    tx(80, 110, '같은 검색 시간 (FAISS = 1)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    [['FAISS', 1, WARN], ['pgvector', 3.5, INFO]].forEach(([n, v, col], i) => { tx(80, 150 + i * 44, n, { 'font-size': 15, 'font-weight': 700, fill: col }); hbar(180, 136 + i * 44, 260, v, 5, { h: 20, col, u: E(u, 0.2 + i * 0.3, 0.9 + i * 0.3), text: i ? '2~5배' : '1' }); });
    tx(80, 260, '네트워크 + SQL 파서 비용', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
    dbIcon(640, 170, '5천만 벡터', { s: 1 - E(u, 1.3, 1.8) * 0.3, stroke: INFO, op: 1 - E(u, 1.3, 1.8) });
    [560, 640, 720].forEach((x, i) => dbIcon(x, 300, i === 1 ? 'Citus 샤드' : null, { s: 0.6 * pop(u, 1.6 + i * 0.15), stroke: INFO }));
    tx(640, 386, '넘으면 샤딩이 필요하다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); }

  // ---------- 장면 4. Pinecone: 리전 위의 샤드 · 복제 · namespace ----------
  function cloud(cx, cy, s, label) { const g = R.G(cx, cy, s); el('path', { d: 'M-150,40 Q-190,40 -180,5 Q-185,-40 -130,-38 Q-115,-80 -55,-70 Q-20,-100 30,-75 Q90,-95 120,-45 Q185,-45 175,5 Q185,40 140,40 Z', fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }, g);
    if (label) mono(0, 10, label, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC }, g); }
  function shards(x, y, u0, u, o) { o = o || {}; for (let i = 0; i < 3; i++) { const s = pop(u, u0 + i * 0.2), sx = x + i * 150;
      el('rect', { x: sx, y, width: 120 * s, height: 70, rx: 8, fill: PANEL, stroke: ACC, 'stroke-width': 2 }); if (s > 0.6) mono(sx + 12, y + 26, `shard ${i + 1}`, { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
      if (o.ns) o.ns.forEach(([n, col], j) => { el('rect', { x: sx + 10, y: y + 36 + j * 0, width: 100, height: 24, rx: 4, fill: col, opacity: 0.25 }); });
      const rs = pop(u, u0 + 0.8 + i * 0.2); el('rect', { x: sx + 8, y: y + 84, width: 104 * rs, height: 40, rx: 8, fill: SOFT, stroke: ACC, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' });
      if (rs > 0.6) mono(sx + 18, y + 109, '복제본', { 'font-size': 14, fill: ACC }); } }
  function s4(t, c) { const { k, u } = c; miniMatrix(c);
    if (k === 0) { const g = R.G(240, 200, pop(u, 0.2)); el('circle', { cx: -30, cy: 0, r: 26, fill: 'none', stroke: ACC, 'stroke-width': 6 }, g); el('path', { d: 'M-4,0 H70 M50,0 V18 M64,0 V14', stroke: ACC, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
      mono(240, 270, 'api_key', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) }); grow(330, 200, 450, 200, E(u, 0.8, 1.3), ACC);
      card(560, 200, 200, 56, { rx: 12, stroke: ACC, fill: ACCBG, text: 'pc = Pinecone()', fs: 15, mono: true, color: ACC, s: pop(u, 1.2) });
      tx(480, 330, '설치할 서버도, 열 포트도 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { cloud(380, 210, pop(u, 0.2), 'rag-prod');
      [['dimension = 768', 0.6], ['metric = "cosine"', 0.9]].forEach(([s, a], i) => mono(620, 180 + i * 34, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, a) }));
      tx(620, 270, '선언만 하면 나머지는 서비스가 만든다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); return; }
    if (k === 2) { cloud(300, 120, 0.7, 'aws · us-east-1'); shards(80, 220, 0.4, u);
      tx(620, 260, '자동 샤딩', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); tx(620, 290, '자동 복제', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      tx(620, 330, '대신 쓴 만큼 비용이 붙는다', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // namespace 칸: 한 인덱스 안에서 테넌트별로 갈린다
    const NS = [['tenant-acme', ACC], ['tenant-beta', INFO], ['tenant-gamma', WARN]];
    const nsBox = (hi, o) => { o = o || {}; NS.forEach(([n, col], i) => { const y = 110 + i * 92, on = hi == null || hi === i;
      el('rect', { x: 60, y, width: 560, height: 78, rx: 10, fill: on ? PANEL : SOFT, stroke: col, 'stroke-width': on ? 2.5 : 1.5, opacity: on ? 1 : 0.45 });
      mono(76, y + 24, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: on ? 1 : 0.5 }); }); mono(60, 96, 'index "rag-prod"', { 'font-size': 14.5, 'font-weight': 700, fill: MUT }); };
    if (k === 3) { nsBox(null); [['doc1', 'tech'], ['doc2', 'law']].forEach(([d, cat], i) => { fly(780, 140 + i * 50, 200 + i * 170, 160, seg(u, 0.4 + i * 0.4, 1.1 + i * 0.4), d + ' · ' + cat, { mono: true, stay: true }); });
      mono(660, 330, 'namespace="tenant-acme"', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) }); tx(660, 360, '테넌트별로 데이터가 갈린다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { nsBox(0); card(200, 160, 160, 28, { rx: 14, fill: ACC, stroke: 'none', text: 'doc1 · tech', fs: 13.5, mono: true, color: PANEL }); card(370, 160, 160, 28, { rx: 14, fill: OFF, stroke: 'none', text: 'doc2 · law', fs: 13.5, mono: true, color: PANEL, op: u > 1.2 ? 0.4 : 1 });
      if (u > 1.2) check(530, 160, 10, pop(u, 1.3));
      [['top_k = 10', 0.2], ['namespace', 0.5], ['filter category = tech', 0.8]].forEach(([s, a], i) => pill(790, 210 + i * 46, s, ACC, pop(u, a), { mono: true, fs: 14 }));
      tx(640, 380, '벡터 · 필터 · 테넌트를 한 번에', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); tx(640, 406, '규모는 10억+', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.7) }); return; }
    if (k === 5) { shards(80, 120, -1, 9); const m = Math.round(tween(0, 43, u, 1.4));
      tx(620, 260, 'SLA 99.9%', { 'font-size': 20, 'font-weight': 800, fill: ACC }); mono(620, 296, `한 달 허용 중단 ≈ ${m}분`, { 'font-size': 16, 'font-weight': 700 }); tx(620, 324, '(30일 × 0.1%로 계산)', { 'font-size': 14, fill: MUT });
      tx(80, 320, '샤딩 · 복제 · 멀티테넌시를 통째로 넘긴다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 6) { cloud(300, 170, 0.9, '외부 클라우드');
      const g = E(u, 0.2, 1.8); el('path', { d: `M80,360 Q300,${360 - 160 * g} ${80 + 480 * g},${360 - 150 * g * g}`, fill: 'none', stroke: WARN, 'stroke-width': 3.5 });
      tx(80, 390, '규모', { 'font-size': 14, fill: MUT }); tx(570, 230, '비용', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) });
      tx(660, 150, '쓴 만큼 과금', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.6) }); tx(660, 180, '데이터가 밖에 있다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) }); tx(660, 210, 'vendor lock-in', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) }); return; }
    [['Weaviate', '셀프호스팅 가능 · GraphQL API', INFO], ['Milvus', 'K8s 위에서 가장 큰 규모', GOOD]].forEach(([n, d, col], i) => { const s = pop(u, 0.3 + i * 0.5), cx = 260 + i * 440;
      card(cx, 210, 360, 130, { rx: 14, stroke: col, sw: 2.5, s }); if (s > 0.5) { tx(cx, 196, n, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: col }); tx(cx, 230, d, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT }); } }); }

  // ---------- 장면 5. 결정 매트릭스 ----------
  const MX = { x: 110, y: 50, w: 560, h: 320 };
  const NAME = { library: 'FAISS', embedded: 'Chroma', sql: 'pgvector', managed: 'Pinecone' };
  const P5 = (m) => [MX.x + m.x / 100 * MX.w, MX.y + MX.h - m.y / 100 * MX.h];
  function s5(t, c) { const { k, u } = c, mtx = c.beat.matrix, prev = (c.prev && c.prev.matrix) || [];
    el('rect', { x: MX.x, y: MX.y, width: MX.w, height: MX.h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    el('line', { x1: MX.x + MX.w / 2, y1: MX.y, x2: MX.x + MX.w / 2, y2: MX.y + MX.h, stroke: GRID, 'stroke-dasharray': '5 5' }); el('line', { x1: MX.x, y1: MX.y + MX.h / 2, x2: MX.x + MX.w, y2: MX.y + MX.h / 2, stroke: GRID, 'stroke-dasharray': '5 5' });
    const ax = k === 0 ? E(u, 0.2, 1.0) : 1;
    grow(MX.x, MX.y + MX.h + 14, MX.x + MX.w, MX.y + MX.h + 14, ax, INK, { sw: 2.5 }); grow(MX.x - 14, MX.y + MX.h, MX.x - 14, MX.y, ax, INK, { sw: 2.5 });
    tx(MX.x + MX.w, MX.y + MX.h + 40, '데이터 규모 (벡터 개수)', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, opacity: fade(u, k === 0 ? 0.8 : 0) });
    tx(MX.x - 24, MX.y + 10, '운영', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, opacity: fade(u, k === 0 ? 1.0 : 0) }); tx(MX.x - 24, MX.y + 30, '복잡도', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, opacity: fade(u, k === 0 ? 1.0 : 0) });
    if (k === 7) { const path = ['embedded', 'sql', 'managed'].map((key) => P5(mtx.find((m) => m.key === key)));
      for (let i = 0; i < 2; i++) { const g = E(u, 0.3 + i * 0.7, 0.9 + i * 0.7); grow(path[i][0] + 14, path[i][1] - 8, path[i + 1][0] - 14, path[i + 1][1] + 8, g, ACC, { sw: 4 }); } }
    if (k === 6) { const [a, b] = mtx.map(P5); [a, b].forEach((p, i) => cross(p[0], p[1] - 34, 11, pop(u, 0.8 + i * 0.4))); }
    // 사라지는 점(앞 beat 에 있고 지금 없는 점)
    prev.filter((p) => !mtx.find((m) => m.key === p.key)).forEach((p) => { const [x, y] = P5(p), op = 1 - fade(u, 0.1, 0.5); if (op > 0.02) el('circle', { cx: x, cy: y, r: 10, fill: KC[p.key], opacity: op }); });
    mtx.forEach((m, i) => { const was = prev.find((p) => p.key === m.key), [x, y] = P5(m), s = was ? 1 : pop(u, 0.3 + i * 0.25), r = { sm: 9, md: 12, lg: 15 }[m.size] * s, col = KC[m.key];
      el('circle', { cx: x, cy: y, r, fill: col, opacity: 0.9 }); if (s > 0.5) tx(x + r + 8, y + 5, NAME[m.key], { 'font-size': 15.5, 'font-weight': 800, fill: col }); });
    const RX = 710, note = [null, '표의 운영 칸 · 쓰임새가 좌표', 'PoC · 프로토타입', '이미 PostgreSQL 운영 중', '오프라인 ML · 연구', '글로벌 SaaS RAG', '양 극단만 고르면', '한 칸씩 우상향'][k];
    if (note) tx(RX, 90, note, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
    const lines = [[], ['FAISS 규모 ~10억이지만', '쓰임새가 연구 · 배치라 왼쪽'], ['pip install chromadb', '1천만 벡터까지 충분'], ['EXTENSION 하나 추가', '권한 · 조인을 RAG에도'], ['영속성 필요 없음', 'GPU 가속이 결정적'], ['멀티테넌시 · 99.9% SLA', '비용을 감수할 때'], ['PoC에 Pinecone: 비용 낭비', '프로덕션에 FAISS만: HA 없음'], ['Chroma → pgvector → Pinecone', '한 번에 건너뛰지 않는다']][k];
    lines.forEach((s, i) => tx(RX, 124 + i * 28, s, { 'font-size': 14.5, fill: k === 6 ? BAD : MUT, 'font-weight': k === 6 ? 700 : 500, opacity: fade(u, 0.6 + i * 0.3) })); }

  const quiz = [
    { q: 'FAISS로 index.search를 부르면 돌아오는 것은 무엇인가?',
      o: ['원본 문서와 메타데이터', '거리 배열과 id 배열', 'SQL 결과 행'], a: 1,
      why: 'faiss.py를 그대로 돌리면 distances와 ids가 각각 (1, 5) 모양으로 나온다. 원본 문서는 id로 따로 찾아야 한다.' },
    { q: 'Chroma에서 category가 tech이고 year가 2024인 문서만 찾으려면 where를 어떻게 써야 하나?',
      o: ['{"$and": [{"category": "tech"}, {"year": 2024}]}처럼 $and로 묶는다', '{"category": "tech", "year": 2024}처럼 키 두 개를 나란히 둔다', 'where 대신 벡터 값을 바꿔 넣는다'], a: 0,
      why: 'Chroma의 where는 조건 하나 또는 $and·$or 연산자 하나만 받는다. 조건이 둘이면 $and 리스트로 묶어야 한다.' },
    { q: 'pgvector가 벡터 전용 DB보다 확실히 앞서는 점은 무엇인가?',
      o: ['FAISS보다 검색이 2~5배 빠르다', '5천만 벡터를 넘어도 샤딩이 필요 없다', 'users JOIN·테넌트 조건·트랜잭션을 벡터 검색과 한 SQL로 묶는다'], a: 2,
      why: '같은 SELECT 안에서 JOIN과 WHERE, <=> 거리 정렬을 함께 쓰고 BEGIN…COMMIT으로 정합성도 챙긴다. 속도와 샤딩은 오히려 약점이다.' },
    { q: 'Pinecone에서 upsert와 query에 namespace를 주는 까닭은 무엇인가?',
      o: ['벡터 차원을 테넌트마다 다르게 하려고', '한 인덱스 안에서 테넌트별 데이터를 갈라 서로 섞이지 않게 하려고', '샤드 수를 직접 정하려고'], a: 1,
      why: 'namespace를 tenant-acme로 주면 그 칸 안에서만 쓰고 찾는다. SaaS RAG에서 고객 데이터를 나누는 기본기다.' },
    { q: '사내 서비스에 이미 PostgreSQL을 운영 중이라면 결정 매트릭스에서 무엇을 고르는 게 알맞은가?',
      o: ['pgvector', 'FAISS만', '처음부터 Pinecone'], a: 0,
      why: '기존 PG에 EXTENSION만 더하면 권한·조인·트랜잭션을 RAG에도 그대로 쓴다. 규모가 ~5천만을 넘을 때 다음 칸을 본다.' },
  ];
  const summary = [
    'FAISS는 import만 하면 되는 라이브러리다. 거리와 id만 주고 영속성과 필터는 직접 챙긴다.',
    'Chroma는 로컬 폴더에 남고 메타데이터 필터를 지원하지만 단일 프로세스라 1천만 벡터쯤이 한계다.',
    'pgvector는 기존 PostgreSQL에 vector 열을 더해 JOIN과 트랜잭션을 벡터 검색과 함께 쓴다.',
    '관리형은 샤딩·복제·namespace를 맡기는 대신 비용을 낸다. Chroma에서 시작해 한 칸씩 옮긴다.',
  ];
  const review = [
    { q: 'FAISS로 만든 추천 API가 서버를 재시작할 때마다 빈 결과를 낸다. 먼저 의심할 것은?',
      o: ['인덱스를 RAM에만 두고 write_index로 저장하지 않았다', '거리 척도가 L2라서', 'top-k가 5로 너무 작아서'], a: 0,
      why: 'FAISS는 프로세스 메모리에만 산다. 파일로 저장하고 시작할 때 read_index로 다시 올려야 한다.' },
    { q: '팀이 RAG 프로토타입을 이번 주 안에 띄워야 한다. 데이터는 문서 몇만 건이다. 알맞은 선택은?',
      o: ['Pinecone으로 멀티 리전 클러스터를 먼저 만든다', 'Chroma로 로컬에서 바로 시작한다', 'Citus로 pgvector를 샤딩한다'], a: 1,
      why: 'PoC는 좌하단에서 시작한다. pip 한 줄로 메타 필터까지 쓰고, 규모가 커질 때 다음 칸으로 옮긴다.' },
    { q: '고객사가 수백 곳인 SaaS에서 한 고객의 검색에 다른 고객 문서가 섞여 나왔다. 구성에서 먼저 손볼 곳은?',
      o: ['HNSW의 m 값과 efSearch 설정', '임베딩 모델의 차원 수', '테넌트별 namespace나 tenant_id 조건'], a: 2,
      why: '관리형은 namespace로, pgvector는 WHERE tenant_id 조건으로 테넌트를 나눈다. 인덱스 설정으로는 섞임을 막지 못한다.' },
  ];

  R.page({ title: '벡터 DB 네 갈래', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
