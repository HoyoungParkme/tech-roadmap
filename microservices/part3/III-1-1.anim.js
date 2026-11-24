/* III-1-1 DB-per-Service — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, person, browser, cross, check, lock, clock, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // ---------- 지역 도우미 ----------
  // 서비스 상자: 위에 작은 칸 = 띄운 컨테이너(replica) 수
  function svc(cx, cy, name, o) { o = o || {}; const w = o.w || 124, s = o.s ?? 1;
    if (s <= 0.01) return;
    card(cx, cy, w, 44, { rx: 9, stroke: o.stroke || INK, fill: o.fill, sw: 2.2, text: name, fs: 15, fw: 700, mono: true, color: o.color || o.stroke || INK, s, op: o.op });
    if (o.reps) for (let i = 0; i < o.reps; i++) { const n = o.reps, x = cx - (n * 16 - 4) / 2 + i * 16;
      el('rect', { x, y: cy - 38, width: 12, height: 10, rx: 2, fill: (o.repCol && o.repCol(i)) || ACC, opacity: (o.op ?? 1) * clamp(s) }); } }
  // DB 원통 + 이름 (이름은 원통 밖에 따로 적어 작아지지 않게)
  function db(cx, cy, name, o) { o = o || {}; const s = o.s ?? 0.72; if ((o.op ?? 1) <= 0.01) return;
    dbIcon(cx, cy, null, { s, stroke: o.stroke, fill: o.fill, op: o.op });
    if (name) tx(cx, cy + 46 * s + 18, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: o.stroke || INK, opacity: o.op ?? 1 }); }
  // 표 이름 칸
  const tcard = (cx, cy, name, o) => card(cx, cy, o && o.w || 136, 38, Object.assign({ rx: 6, text: name, fs: 14.5, mono: true, stroke: GRID, sw: 1.8 }, o || {}));
  // 트랜잭션 괄호(점선 상자)
  function txBox(x, y, w, h, label, col, op) { el('rect', { x, y, width: w, height: h, rx: 10, fill: 'none', stroke: col || ACC, 'stroke-width': 2.4, 'stroke-dasharray': '7 5', opacity: op ?? 1 });
    if (label) mono(x + 10, y - 8, label, { 'font-size': 14, 'font-weight': 700, fill: col || ACC, opacity: op ?? 1 }); }

  // ---------- 1. 공유 DB ----------
  const S1 = { svcs: [['user', 130], ['catalog', 300], ['order', 470], ['payment', 640]], y: 62,
    tables: [['users', 230, 232], ['products', 390, 232], ['orders', 550, 232], ['order_lines', 230, 300], ['payments', 390, 300], ['shipments', 550, 300]] };
  function s1(t, c) { const { k, u } = c;
    const down = k === 4 && u > 1.6, dead = k === 4 ? E(u, 1.6, 2.2) : 0;
    zone(140, 180, 500, 160, 'shop_db · PostgreSQL 한 대', { fill: SOFT, stroke: down ? BAD : GRID, sw: down ? 3 : 1.5 });
    S1.tables.forEach(([n, x, y], i) => { const s = k === 0 ? pop(u, 0.2 + i * 0.18) : 1, hot = n === 'products' && k >= 1 && k <= 3;
      tcard(x, y, n, { s, stroke: hot ? (k === 1 ? ACC : BAD) : GRID, color: hot ? (k === 1 ? ACC : BAD) : INK }); });
    // 누가 어느 테이블을 건드리나
    const own = [[0, 0], [2, 2], [3, 4]], prod = [1, 2, 3];
    own.forEach(([si, ti]) => { const [, sx] = S1.svcs[si], [, x, y] = S1.tables[ti]; grow(sx, S1.y + 22, x, y - 19, k === 0 ? E(u, 0.6, 1.2) : 1, GRID, { plain: true, sw: 1.6 }); });
    prod.forEach((si, i) => { const [, sx] = S1.svcs[si], [, x, y] = S1.tables[1]; grow(sx, S1.y + 22, x + (i - 1) * 30, y - 19, k === 0 ? E(u, 1.3 + i * 0.25, 1.9 + i * 0.25) : 1, k === 2 && si === 1 ? BAD : ACC, { plain: true, sw: k === 2 && si === 1 ? 4 : 2.2 }); });
    if (k === 0) sub(390, 372, 'products 를 catalog · order · payment 가 같이 읽고 쓴다', fade(u, 2.0), { fill: ACC, 'font-weight': 700 });
    S1.svcs.forEach(([n, x], i) => { const hit = (k === 1 && i >= 1) || (k === 4 && down);
      svc(x, S1.y, n, { stroke: hit ? (k === 4 ? BAD : WARN) : INK, w: 124 }); });
    card(810, S1.y, 130, 44, { rx: 9, stroke: down ? BAD : GRID, dash: '5 4', text: '외 4개', fs: 14.5, color: down ? BAD : MUT, sw: 2 });
    // 오른쪽 칸: beat 마다 하나
    const RX = 790;
    if (k === 1) { pill(390, 160, 'ALTER TABLE products ADD COLUMN brand', ACC, pop(u, 0.2), { mono: true, fs: 13.5, fill: PANEL });
      for (let i = 0; i < 5; i++) person(700 + (i % 3) * 64, 214 + Math.floor(i / 3) * 78, null, { s: 0.62 * pop(u, 0.9 + i * 0.15), stroke: WARN });
      lbl(RX, 362, '5개 팀 미팅 · 동시 배포', fade(u, 1.8), { fill: WARN }); }
    if (k === 2) { lock(390, 206, true, BAD, pop(u, 0.3) * 0.9);
      mono(310, 160, 'catalog: 무거운 검색 쿼리', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3), 'text-anchor': 'middle' });
      const wait = tween(0, 5, u, 2.0);
      card(RX, 250, 210, 104, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 0.5) });
      tx(RX, 226, '결제 화면 응답', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      mono(RX, 268, wait.toFixed(1) + '초', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) });
      sub(RX, 292, '남의 쿼리가 내 응답 시간', fade(u, 1.8), { fill: BAD }); }
    if (k === 3) { const x0 = RX, y0 = 250;
      card(x0, y0, 180, 70, { rx: 8, stroke: BAD, sw: 2, s: pop(u, 0.2) });
      tx(x0, y0 - 14, 'products.stock', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, class: 'mono', opacity: fade(u, 0.3) });
      const v = u < 1.8 ? 1 : -1;
      mono(x0, y0 + 20, String(v), { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: v < 0 ? BAD : INK, opacity: fade(u, 0.3) });
      fly(300, 120, x0 - 160, y0 - 22, seg(u, 0.6, 1.7), 'catalog −1', { fill: WARN, mono: true });
      fly(470, 120, x0 - 160, y0 + 22, seg(u, 0.75, 1.8), 'order −1', { fill: WARN, mono: true });
      sub(x0, 340, '동시에 UPDATE · 재고 1개는 예시 값', fade(u, 1.9), { fill: BAD }); }
    if (k === 4) { const lines = ['order: SELECT deprecated_field …', 'payment: … deprecated_field', 'catalog: UPDATE … deprecated_field'];
      lines.forEach((s, i) => mono(668, 214 + i * 26, s, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2 + i * 0.2) * (1 - dead * 0.6) }));
      mono(668, 304, `grep: 서비스 ${Math.round(tween(0, 5, u, 1))} · 쿼리 ${Math.round(tween(0, 50, u, 1.2))}`, { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
      if (down) { cross(390, 262, 24, pop(u, 1.6)); lbl(RX, 352, '8개 서비스가 같이 죽는다', fade(u, 1.9), { fill: BAD }); } }
    if (k === 5) { pill(260, 392, 'MSA 의 비용', WARN, pop(u, 0.2), { fill: PANEL }); tx(352, 398, '+', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 0.5) });
      pill(450, 392, '모놀리스의 제약', WARN, pop(u, 0.6), { fill: PANEL });
      banner(760, 392, 'distributed monolith', pop(u, 1.2)); grow(552, 392, 636, 392, E(u, 0.9, 1.3), BAD); } }

  // ---------- 2. DB-per-Service ----------
  const S2 = [['user', 150, 3, 'user-db'], ['catalog', 370, 5, 'catalog-db'], ['order', 590, 4, 'order-db'], ['payment', 810, 3, 'payment-db']];
  function s2(t, c) { const { k, u } = c, SY = 100, DY = 282;
    tx(20, 30, 'deployment: 서비스마다 replica 수가 다르다', { 'font-size': 13.5, fill: MUT, opacity: k === 0 ? fade(u, 0.2) : 1 });
    // DB 가 공유 DB 에서 빠져나와 자기 서비스 밑으로 간다
    const out = (i) => (i === 0 ? (k === 0 ? E(u, 0.4, 1.6) : 1) : k === 0 ? 0 : k === 1 ? E(u, 0.2 + (i - 1) * 0.25, 1.2 + (i - 1) * 0.25) : 1);
    const shared = k === 0 ? 1 : k === 1 ? 1 - E(u, 1.2, 1.8) : 0;
    if (shared > 0.01) db(480, DY, 'shop_db (나머지)', { op: shared, stroke: MUT });
    const crash = k === 4 && u > 1.5;
    S2.forEach(([n, x, reps, dn], i) => { const f = out(i), cx = lerp(480, x, f), redeploy = k === 4 && i === 1 && u > 0.6 && u < 1.5;
      svc(x, SY, n, { reps, stroke: crash && i === 1 ? BAD : INK, repCol: (j) => (redeploy && j <= (u - 0.6) * 6 ? WARN : ACC) });
      if (f > 0.01) { db(cx, DY, f > 0.9 ? dn : null, { op: clamp(f * 3), stroke: crash && i === 1 ? BAD : i === 3 && k >= 1 ? INFO : INK });
        grow(x, SY + 22, x, DY - 36, f > 0.9 ? 1 : 0, GRID, { plain: true }); } });
    if (k >= 1) { const a = k === 1 ? fade(u, 1.6) : 1;
      el('rect', { x: 705, y: 50, width: 210, height: 330, rx: 14, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: a });
      mono(810, 42, '별도 네트워크', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: a });
      pill(810, 190, 'SERIALIZABLE', INFO, k === 1 ? pop(u, 1.8) : 1, { mono: true, fs: 13.5, fill: PANEL }); }
    if (k === 2) { const f = E(u, 0.3, 1.2);
      grow(640, SY + 22, lerp(640, 760, f), lerp(SY + 22, DY - 20, f), 1, BAD, { dash: '6 4', plain: true });
      fly(600, 150, 690, 214, seg(u, 0.3, 1.2), 'SELECT * FROM payments', { fill: BAD, mono: true, stay: true });
      cross(700, 228, 16, pop(u, 1.3));
      sub(590, 396, 'DB 권한 + network policy 로 막는다 · 예외 없음', fade(u, 1.6), { fill: BAD, 'font-weight': 700 }); }
    if (k === 3) { grow(530, SY, 432, SY, E(u, 0.2, 0.7), ACC);
      fly(520, SY - 34, 440, SY - 34, seg(u, 0.4, 1.4), 'GET /products/42', { mono: true, stay: true });
      el('line', { x1: 150, y1: 196, x2: 640, y2: 196, stroke: WARN, 'stroke-width': 3, opacity: fade(u, 1.2) });
      mono(140, 201, '이벤트', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.2) });
      dot([[370, 122], [370, 196], [590, 196], [590, 122]], seg(u, 1.4, 2.6), WARN, 7);
      pill(480, 172, 'ProductChanged', WARN, pop(u, 1.5), { mono: true, fs: 13.5, fill: PANEL }); }
    if (k === 4) { pill(370, 200, 'ALTER TABLE …', WARN, pop(u, 0.2), { mono: true, fs: 13.5, fill: PANEL });
      if (crash) cross(370, DY, 20, pop(u, 1.5));
      [0, 2, 3].forEach((i, j) => check(S2[i][1] + 70, SY, 9, pop(u, 1.8 + j * 0.15)));
      sub(480, 400, '배포 5팀 → 1팀 · 장애 전체 → 한 서비스', fade(u, 2.0), { 'font-weight': 700, fill: GOOD }); }
    if (k === 5) { S2.forEach(([, x], i) => ['백업', '감시', '패치'].forEach((s, j) => card(x - 40 + j * 40, 372, 36, 24, { rx: 5, text: s, fs: 13.5, stroke: WARN, sw: 1.5, color: WARN, s: pop(u, 0.2 + i * 0.15 + j * 0.05) })));
      const f = E(u, 1.4, 2.2);
      el('rect', { x: 300, y: 236, width: 590, height: 104, rx: 12, fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '7 5', opacity: fade(u, 1.2) });
      mono(312, 228, '@Transactional (세 DB 를 한 번에)', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      if (f > 0) cross(595, 288, 22, f); } }

  // ---------- 3. Polyglot ----------
  const CHIPS = ['user → PostgreSQL', 'catalog → PG · ES · Redis', 'session → Redis', 'analytics → ClickHouse'];
  function chips(k) { CHIPS.slice(0, Math.min(k, 4)).forEach((s, i) => pill(118 + i * 236, 30, s, GOOD, 1, { fs: 13.5, fill: PANEL })); }
  function pgTable(x, y, name, cols, rows, o) { o = o || {}; const cw = o.cw || 92, s = o.s ?? 1; if (s <= 0.01) return;
    const g = R.G(x, y, s); el('rect', { x: 0, y: 0, width: cw * cols.length, height: 30 + rows.length * 28, rx: 8, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2 }, g);
    tx(8, -8, name, { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: o.col || INK }, g);
    cols.forEach((cn, j) => tx(10 + j * cw, 20, cn, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, class: 'mono' }, g));
    rows.forEach((r, i) => r.forEach((v, j) => tx(10 + j * cw, 50 + i * 28, v, { 'font-size': 14, class: 'mono' }, g))); }
  function s3(t, c) { const { k, u } = c; chips(k);
    if (k === 0) { svc(140, 220, 'user', { s: pop(u, 0.2) }); grow(206, 220, 300, 220, E(u, 0.5, 0.9), ACC);
      pgTable(320, 120, 'users', ['id', 'role_id'], [['1', '10'], ['2', '20']], { s: pop(u, 0.8) });
      pgTable(620, 120, 'roles', ['id', 'name'], [['10', 'admin'], ['20', 'member']], { s: pop(u, 1.1) });
      grow(450, 170, 616, 170, E(u, 1.5, 2.0), ACC); mono(533, 162, 'FK', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      lbl(560, 300, 'PostgreSQL · ACID · FK · JOIN', fade(u, 1.9)); sub(560, 326, '회원·권한은 일관성이 먼저다', fade(u, 2.1)); return; }
    if (k === 1) { svc(110, 230, 'catalog', { s: pop(u, 0.1) });
      db(330, 140, 'PostgreSQL', { s: 0.62, op: fade(u, 0.2) }); mono(330, 212, '상품 마스터', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      grow(176, 222, 290, 160, E(u, 0.2, 0.6), GRID, { plain: true });
      // CDC: WAL 행이 흘러간다
      el('line', { x1: 380, y1: 140, x2: 620, y2: 140, stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 0.7) });
      mono(500, 128, 'CDC', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      for (let i = 0; i < 4; i++) dot([[384, 140], [618, 140]], seg(u, 0.8 + i * 0.3, 1.6 + i * 0.3), WARN, 5);
      zone(630, 74, 290, 136, 'Elasticsearch · 검색', { stroke: WARN, sw: 1.8, fill: PANEL, op: fade(u, 0.9) });
      [['term', '문서 id'], ['노트북', '42, 77'], ['무선', '42']].forEach(([a, b], i) => { const op = fade(u, 1.0 + i * 0.2);
        mono(650, 124 + i * 26, a, { 'font-size': 14, fill: i ? INK : MUT, 'font-weight': i ? 400 : 700, opacity: op }); mono(790, 124 + i * 26, b, { 'font-size': 14, fill: i ? ACC : MUT, 'font-weight': 700, opacity: op }); });
      R.redisBox(500, 320, { name: 'Redis', sub: 'hot 상품 캐시', s: pop(u, 1.8), w: 150 }); grow(176, 238, 420, 314, E(u, 1.8, 2.2), GRID, { plain: true });
      sub(780, 330, '예시 데이터', fade(u, 2.2)); return; }
    if (k === 2) { svc(140, 220, 'session', { s: pop(u, 0.2) }); grow(206, 220, 300, 220, E(u, 0.4, 0.8), ACC);
      const gone = u > 2.2;
      R.kvTable(320, 150, 380, [['session:abc', '{user: 7}', { ttl: gone ? '만료' : (30 - Math.floor(clamp((u - 0.9) / 1.3) * 30)) + 's', gone, hot: !gone }]], { title: 'Redis', rh: 44 });
      clock(780, 196, 34, clamp((u - 0.9) / 1.3), WARN, 'TTL 30s (예시)');
      lbl(510, 300, 'TTL 로 저절로 지워지고, ms 안에 답한다', fade(u, 1.2)); sub(510, 326, '없어져도 되는 데이터 · 단순 KV', fade(u, 1.6)); return; }
    if (k === 3) { svc(130, 220, 'analytics', { s: pop(u, 0.2) }); grow(196, 220, 280, 220, E(u, 0.4, 0.8), ACC);
      const cols = ['event', 'user', 'ts', 'amount'];
      cols.forEach((n, j) => { const x = 310 + j * 120, hot = j === 3 && u > 1.2;
        mono(x + 45, 92, n, { 'font-size': 14, 'font-weight': 700, fill: hot ? ACC : MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4 + j * 0.1) });
        for (let i = 0; i < 9; i++) el('rect', { x, y: 104 + i * 24, width: 90, height: 18, rx: 3, fill: hot ? ACC : SOFT, opacity: fade(u, 0.5 + j * 0.1 + i * 0.03) * (hot ? 0.75 : 1) }); });
      if (u > 1.2) { const y = lerp(104, 320, seg(u, 1.2, 2.2)); el('line', { x1: 660, y1: y, x2: 760, y2: y, stroke: ACC, 'stroke-width': 3 }); }
      mono(840, 220, 'SUM(amount)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      lbl(530, 360, 'ClickHouse · 컬럼 지향 · 이벤트 100억 건 집계', fade(u, 1.6)); sub(530, 386, '필요한 컬럼 하나만 읽는다', fade(u, 2.0)); return; }
    if (k === 4) { const rows = [['강한 트랜잭션 + JOIN', 'PostgreSQL / MySQL'], ['유연 스키마 · 문서', 'MongoDB'], ['전문 검색', 'Elasticsearch'], ['캐시 · 세션 · 카운터', 'Redis'],
        ['OLAP 집계', 'ClickHouse / BigQuery'], ['KV 무한 확장', 'DynamoDB / Cassandra'], ['그래프', 'Neo4j'], ['시계열', 'InfluxDB / Timescale']];
      tx(180, 78, '접근 패턴', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(560, 78, '후보', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      rows.forEach(([a, b], i) => { const y = 106 + i * 37, f = fade(u, 0.2 + i * 0.22);
        el('rect', { x: 160, y: y - 18, width: 660, height: 32, rx: 6, fill: i % 2 ? PANEL : SOFT, opacity: f });
        tx(180, y + 3, a, { 'font-size': 15, 'font-weight': 600, opacity: f }); grow(440, y - 2, lerp(440, 540, E(u, 0.3 + i * 0.22, 0.6 + i * 0.22)), y - 2, 1, GRID, { plain: true });
        mono(560, y + 3, b, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: f }); }); return; }
    const types = ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'ClickHouse'], jobs = ['학습', '백업', '모니터링'];
    jobs.forEach((j, ji) => tx(470 + ji * 120, 86, j, { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }));
    types.forEach((n, i) => { const y = 120 + i * 50; mono(150, y + 6, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.25) });
      jobs.forEach((j, ji) => card(470 + ji * 120, y, 100, 36, { rx: 6, stroke: WARN, sw: 1.6, fill: WARNBG, s: pop(u, 0.3 + i * 0.25 + ji * 0.06) })); });
    mono(860, 230, `${Math.round(tween(0, 15, u, 1.6))}`, { 'font-size': 36, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
    sub(860, 256, '운영 일감', 1); sub(480, 400, '처음엔 1~2종으로 시작하고, 진짜 필요할 때만 더한다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }

  // ---------- 4. 남의 데이터 읽기 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { svc(170, 90, 'order', {}); svc(600, 90, 'catalog', { stroke: u > 2.2 ? BAD : INK });
      db(170, 222, 'order-db', {}); db(600, 222, 'catalog-db', { stroke: u > 2.2 ? BAD : INK });
      dot([[170, 112], [170, 190], [170, 112]], seg(u, 0.2, 0.9), ACC, 7);
      dot([[232, 90], [538, 90], [600, 112], [600, 190], [600, 112], [538, 90], [232, 90]], seg(u, 0.9, 2.0), WARN, 7);
      mono(385, 78, 'gRPC getProducts()', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.9) });
      // 응답 시간 = 구간의 합
      const x0 = 120, w1 = 220 * E(u, 0.2, 0.9), w2 = 380 * E(u, 0.9, 2.0);
      tx(x0, 324, '주문 상세 응답 시간', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      el('rect', { x: x0, y: 336, width: w1, height: 30, rx: 4, fill: ACC }); if (w1 > 160) tx(x0 + 10, 356, '① order-db 조회', { 'font-size': 14, fill: PANEL, 'font-weight': 700 });
      el('rect', { x: x0 + 222, y: 336, width: w2, height: 30, rx: 4, fill: WARN }); if (w2 > 200) tx(x0 + 232, 356, '② catalog 왕복 (네트워크 + 조회)', { 'font-size': 14, fill: PANEL, 'font-weight': 700 });
      tx(x0 + 610, 356, '= ① + ②', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.0), class: 'mono' });
      if (u > 2.2) { cross(670, 90, 14, pop(u, 2.2)); mono(840, 160, 'catalog 장애', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle' }); mono(840, 182, '→ 상세 못 봄', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle' }); }
      return; }
    // 방법 2·3 의 공통 자리: 왼쪽 order, 오른쪽 catalog, 가운데 Kafka 토픽
    const topic = (n, hot) => { tx(330, 150, 'Kafka · product.changed', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 6; i++) card(350 + i * 46, 176, 40, 32, { rx: 4, stroke: i < n ? WARN : GRID, fill: i < n ? WARNBG : PANEL, sw: 1.6, text: i < n ? String(i) : '', fs: 13.5, mono: true, color: WARN }); };
    if (k <= 3) { svc(150, 80, 'order', {}); svc(790, 80, 'catalog', { stroke: k === 3 && u > 0.6 ? BAD : INK });
      if (k === 3 && u > 0.6) cross(860, 80, 12, pop(u, 0.6));
      zone(40, 230, 300, 172, 'order-db', { fill: SOFT, stroke: GRID, sw: 1.5 }); }
    if (k === 1) { topic(Math.floor(lerp(3, 5, E(u, 0.4, 1.2))));
      dot([[790, 102], [790, 176], [628, 176]], seg(u, 0.2, 1.1), WARN, 7); pill(790, 136, 'ProductChanged', WARN, pop(u, 0.3), { mono: true, fs: 13.5, fill: PANEL });
      dot([[350, 176], [150, 176], [150, 250]], seg(u, 1.3, 2.2), WARN, 7);
      pgTable(66, 270, 'product_view', ['id', 'title', 'price'], [], { cw: 84, s: pop(u, 2.0), col: ACC }); sub(190, 390, 'read-only 사본', fade(u, 2.3), { fill: ACC, 'font-weight': 700 }); return; }
    if (k === 2) { topic(5);
      const fields = ['productId', 'title', 'price', 'description', 'images'];
      fields.forEach((f, i) => { const keep = i < 3, y = 236 + i * 30, mv = keep ? E(u, 1.0 + i * 0.25, 1.8 + i * 0.25) : 0;
        mono(lerp(560, 380, mv), lerp(y, 316, mv), f, { 'font-size': 14, 'font-weight': 700, fill: keep ? ACC : OFF, opacity: keep ? (mv > 0.98 ? 0 : 1) * fade(u, 0.3) : fade(u, 0.3), 'text-decoration': !keep && u > 1.6 ? 'line-through' : null }); });
      tx(540, 220, '이벤트 본문', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2) });
      pgTable(66, 270, 'product_view', ['id', 'title', 'price'], u > 2.0 ? [['42', '키보드', '39000']] : [], { cw: 84, col: ACC });
      mono(300, 392, 'upsert', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 2.0) }); sub(560, 400, '값은 예시', fade(u, 2.2)); return; }
    if (k === 3) { topic(5);
      pgTable(60, 290, 'orders', ['id', 'pid'], [['901', '42']], { cw: 60 }); pgTable(210, 290, 'product_view', ['id', 'title'], [['42', '키보드']], { cw: 60, col: ACC });
      grow(180, 354, 208, 354, E(u, 0.3, 0.7), ACC, { plain: true });
      browser(560, 330, 200, 100, null, { s: pop(u, 1.0) }); mono(560, 340, '주문 #901 · 키보드', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      check(680, 300, 12, pop(u, 1.4)); grow(342, 330, 456, 330, E(u, 1.0, 1.4), ACC);
      clock(850, 300, 28, E(u, 1.6, 2.6), WARN, '수초~수분 지연'); return; }
    if (k === 4) { [['order', 170], ['catalog', 480], ['user', 790]].forEach(([n, x], i) => { svc(x, 70, n, { s: pop(u, 0.1 + i * 0.1) });
        dot([[x, 92], [x, 170], [480, 250]], seg(u, 0.5 + i * 0.2, 1.4 + i * 0.2), WARN, 6); });
      card(480, 270, 230, 54, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'query-service', fs: 15.5, mono: true, color: ACC, s: pop(u, 0.4) });
      pgTable(300, 316, 'order_detail_view', ['주문', '상품', '고객'], u > 1.6 ? [['901', '키보드', '김OO']] : [], { cw: 120, col: ACC, s: pop(u, 1.2) });
      browser(820, 330, 160, 84, '주문 상세 화면', { s: pop(u, 1.8) }); grow(670, 340, 734, 340, E(u, 2.0, 2.4), ACC);
      return; }
    const ax = axes(160, 70, 600, 270, { x: [0, 1], y: [0, 1], xl: '읽기 빈도 →', yl: '허용 지연 ↑' });
    [['방법 1 · API', 0.22, 0.2, INFO], ['방법 2 · 복제본', 0.78, 0.78, GOOD], ['방법 3 · CQRS', 0.6, 0.42, ACC]].forEach(([n, vx, vy, col], i) => { const s = pop(u, 0.3 + i * 0.5);
      el('circle', { cx: ax.X(vx), cy: ax.Y(vy), r: 10 * s, fill: col }); tx(ax.X(vx) + 18, ax.Y(vy) + 5, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.5) }); });
    sub(ax.X(0.22) + 70, ax.Y(0.2) + 26, '드물게 · 즉시성 중요', fade(u, 0.6), { 'text-anchor': 'start' });
    sub(ax.X(0.78) - 60, ax.Y(0.78) + 26, '자주 · 조금 늦어도 OK', fade(u, 1.1));
    sub(ax.X(0.6) + 110, ax.Y(0.42) + 24, '여러 서비스를 합치는 화면', fade(u, 1.6)); }

  // ---------- 5. 분산 트랜잭션 ----------
  const DBS = [['order_db', 170, 'INSERT orders'], ['catalog_db', 480, 'UPDATE stock'], ['payment_db', 790, 'INSERT payments']];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { zone(110, 120, 740, 240, '한 DB · 한 connection', { fill: SOFT });
      txBox(140, 190, 680, 130, '@Transactional placeOrder()', ACC);
      const failed = u > 1.9, rb = E(u, 2.0, 2.5);
      DBS.forEach(([, x, op], i) => { const s = pop(u, 0.3 + i * 0.5), bad = i === 2 && failed;
        card(x, 255, 200, 50, { rx: 8, text: op, fs: 15, mono: true, stroke: bad ? BAD : GOOD, color: bad ? BAD : INK, s, op: 1 - rb * 0.7 }); });
      if (failed) { cross(880, 255, 14, pop(u, 1.9)); banner(480, 392, 'ROLLBACK · 셋 다 없던 일', pop(u, 2.1)); }
      return; }
    DBS.forEach(([n, x]) => db(x, 300, n, {}));
    if (k === 1) { const f = E(u, 0.3, 1.6);
      [0, 1, 2].forEach((i) => { const x = DBS[i][1], w = lerp(680, 210, f);
        el('rect', { x: lerp(140, x - 105, f), y: 120, width: w, height: 110, rx: 10, fill: 'none', stroke: f > 0.6 ? BAD : ACC, 'stroke-width': 2.2, 'stroke-dasharray': '7 5', opacity: i === 0 ? 1 : f });
        card(x, 175, 180, 44, { rx: 8, text: DBS[i][2], fs: 14.5, mono: true, stroke: GRID, s: pop(u, 0.2 + i * 0.2) }); });
      mono(480, 100, f > 0.6 ? '트랜잭션이 셋으로 갈라진다' : '@Transactional', { 'font-size': 15, 'font-weight': 700, fill: f > 0.6 ? BAD : ACC, 'text-anchor': 'middle' });
      return; }
    if (k === 2) { const dead = u > 2.0;
      card(480, 70, 190, 46, { rx: 10, text: 'coordinator', fs: 15, mono: true, stroke: dead ? BAD : INK, color: dead ? BAD : INK });
      DBS.forEach(([, x], i) => { grow(480, 93, x, 260, E(u, 0.2 + i * 0.1, 0.8 + i * 0.1), INK, { sw: 2 });
        lock(x + 52, 262, true, BAD, pop(u, 0.9 + i * 0.1) * 0.85);
        const w = 120 * E(u, 0.9, 2.6); el('rect', { x: x - 60, y: 372, width: w, height: 12, rx: 3, fill: BAD, opacity: 0.75 });
        if (dead) mono(x - 72, 304, '?', { 'font-size': 26, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); });
      mono(480, 150, 'prepare → commit', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5) });
      tx(40, 382, '락', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.9) });
      if (dead) { cross(600, 70, 13, pop(u, 2.0)); mono(760, 70, 'in-doubt', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); }
      return; }
    if (k === 3) { svc(480, 70, 'order-service', { w: 180, stroke: u > 2.2 ? BAD : INK });
      const steps = [['save() ✓', GOOD, 0.2], ['decreaseStock() ✓', GOOD, 0.8], ['charge() ✗', BAD, 1.4]];
      steps.forEach(([s, col, a], i) => { const x = DBS[i][1]; grow(480, 92, x, 255, E(u, a, a + 0.4), col, { sw: 2 }); pill(x, 176, s, col, pop(u, a + 0.3), { mono: true, fs: 13.5, fill: PANEL }); });
      mono(480, 378, 'stock −1', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      if (u > 1.8) { mono(575, 128, 'catch { 어떻게 되돌리지? }', { 'font-size': 14.5, 'font-weight': 700, fill: WARN }); }
      if (u > 2.2) { cross(586, 70, 13, pop(u, 2.2)); sub(480, 406, '프로세스가 죽으면 줄어든 재고가 그대로 남는다', 1, { fill: BAD, 'font-weight': 700 }); }
      return; }
    if (k === 4) { DBS.forEach(([, x], i) => { pill(x, 120, 'T' + (i + 1), GOOD, pop(u, 0.2 + i * 0.25), { fill: PANEL, fs: 15 }); if (i < 2) grow(x + 32, 120, DBS[i + 1][1] - 32, 120, E(u, 0.4 + i * 0.25, 0.7 + i * 0.25), GOOD);
        if (i < 2) { pill(x, 200, 'C' + (i + 1), WARN, pop(u, 1.6 - i * 0.3), { fill: PANEL, fs: 15 }); } });
      cross(790, 150, 11, pop(u, 1.1)); grow(448, 200, 202, 200, E(u, 1.5, 2.2), WARN);
      sub(480, 236, '실패하면 끝난 단계의 취소 작업을 거꾸로 실행한다', fade(u, 2.0), { fill: WARN, 'font-weight': 700 });
      return; }
    card(250, 150, 260, 70, { rx: 12, text: '한 번에 ACID', fs: 18, stroke: OFF, color: MUT, s: pop(u, 0.2) });
    grow(390, 150, 560, 150, E(u, 0.7, 1.1), ACC);
    card(700, 150, 260, 70, { rx: 12, text: '단계별 + 보상', fs: 18, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.0) });
    sub(480, 216, '운영 비용보다 설계 사고방식을 바꾸는 일이 더 크다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }

  const quiz = [
    { q: '서비스 코드를 8개로 나눴지만 DB는 하나를 같이 쓴다. products에 컬럼 하나를 더하면 무슨 일이 생기나?',
      o: ['catalog 서비스만 다시 배포하면 된다', 'products를 쓰는 다른 서비스 코드도 같이 고쳐 동시에 배포해야 한다', 'DB가 알아서 모든 서비스에 맞춰 준다'], a: 1,
      why: 'catalog·order·payment가 같은 테이블을 직접 읽고 쓰기 때문이다. 스키마 변경 하나가 5개 팀의 동시 배포로 번진다.' },
    { q: 'DB-per-Service에서 order가 상품 정보가 필요할 때 허용되는 방법은 무엇인가?',
      o: ['catalog-db에 읽기 전용 계정으로 직접 SELECT한다', '공유 DB를 하나 더 만들어 상품 테이블을 옮긴다', 'catalog의 API를 부르거나 ProductChanged 이벤트를 구독한다'], a: 2,
      why: '다른 서비스 DB에 직접 SQL을 하는 것은 권한과 network policy로 막는다. 공식 통로는 API와 이벤트 두 가지다.' },
    { q: '세션 데이터를 Redis에 두는 이유로 맞는 것은 무엇인가?',
      o: ['TTL로 저절로 만료되고 ms 안에 답하면 되는 데이터라서', '강한 ACID와 FK가 필요해서', '100억 건을 집계해야 해서'], a: 0,
      why: '세션은 없어져도 되는 단순 KV 데이터다. ACID·FK는 PostgreSQL, 대량 집계는 ClickHouse의 몫이다.' },
    { q: 'order DB에 product_view 복제본을 두는 방식의 가장 큰 장점은 무엇인가?',
      o: ['catalog가 죽어도 주문 상세를 볼 수 있다', '항상 최신 값을 보장한다', '이벤트를 처리할 코드가 필요 없다'], a: 0,
      why: '자기 DB 안에서 order와 product_view를 함께 읽으므로 외부 호출이 없다. 대신 수초~수분의 동기화 지연을 감수한다.' },
    { q: '주문·재고·결제 DB가 갈라진 뒤 결제가 실패했다. 실무에서 쓰는 해법은 무엇인가?',
      o: ['2PC로 세 DB를 묶는다', 'catch 블록에서 재고를 되돌린다', '단계마다 보상 트랜잭션을 두는 Saga를 쓴다'], a: 2,
      why: '2PC는 락과 coordinator 장애 때문에 MSA에 맞지 않고, catch는 프로세스가 죽으면 실행조차 안 된다. Saga는 취소 작업을 새로 실행한다.' },
  ];

  const summary = [
    '코드만 나누고 DB를 같이 쓰면 스키마 변경, 성능, 장애가 모든 서비스로 번진다.',
    '서비스마다 전용 DB를 두고 남의 데이터는 API나 이벤트로만 받는다.',
    'DB가 갈라지면 서비스마다 접근 패턴에 맞는 DB를 고를 수 있다.',
    '대가로 한 트랜잭션으로 묶을 수 없어 Saga와 결과적 일관성이 필요해진다.',
  ];
  const review = [
    { q: '주문 상세 화면이 catalog 장애 때마다 같이 깨진다. 주문 화면은 상품명이 몇 분 늦어도 괜찮다. 먼저 바꿀 것은?',
      o: ['catalog 호출 타임아웃만 늘린다', 'ProductChanged를 구독해 order DB에 product_view를 둔다', 'order가 catalog-db에 직접 SELECT한다'], a: 1,
      why: '읽기가 잦고 지연을 견딜 수 있으면 복제본이 맞다. 자기 DB에서 읽으므로 catalog가 죽어도 화면이 산다.' },
    { q: 'catalog의 무거운 검색 쿼리 때문에 결제 화면이 5초씩 걸린다. 구조적으로 맞는 해법은?',
      o: ['서비스별 DB로 나누고 검색은 Elasticsearch로 옮긴다', '결제 서비스 replica 수를 늘린다', '결제 화면에 로딩 표시를 넣는다'], a: 0,
      why: '자원을 공유하면 성능도 공유한다. DB를 나누고 검색을 전용 저장소로 보내면 남의 쿼리가 내 응답 시간이 되지 않는다.' },
    { q: '팀이 DB-per-Service로 옮기자마자 5종의 DB를 들이려 한다. 먼저 따져 볼 것은?',
      o: ['DB 종류가 많을수록 MSA답다', '모든 서비스를 ClickHouse로 통일한다', '학습·백업·모니터링이 종류만큼 늘어나니 1~2종으로 시작한다'], a: 2,
      why: 'Polyglot은 운영 일감도 곱해진다. 접근 패턴이 정말 다를 때만 새 종류를 더한다.' },
  ];

  R.page({ title: 'DB 구조 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
