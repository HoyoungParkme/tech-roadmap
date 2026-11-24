/* IV-2-2 pgvector 실전 쿼리 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, snippet, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  const KC = { pk: WARN, fk: INFO, vec: ACC, txt: MUT };
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
      if (c.w > 30) mono(cx + 8, y + 20, c.n, { 'font-size': 13.5, 'font-weight': 700, fill: KC[c.k] || MUT, opacity: cs.op ?? 1 }, g);
      if (j) el('line', { x1: cx, y1: y + 5, x2: cx, y2: y + H - 5, stroke: GRID, 'stroke-width': 1 }, g);
      cx += c.w; });
    rows.forEach((r, i) => { const yy = y + hh + i * rh, rs = (o.rowSt && o.rowSt(i)) || {}, rop = rs.op ?? 1;
      el('line', { x1: x + 4, y1: yy, x2: x + W - 4, y2: yy, stroke: GRID, 'stroke-width': 1 }, g);
      if (rs.hi) el('rect', { x: x + 3, y: yy + 3, width: W - 6, height: rh - 6, rx: 5, fill: rs.hiFill || ACCBG, opacity: rop }, g);
      r.forEach((v, j) => { if (v == null || cols[j].w <= 30) return; const cs = (o.cell && o.cell(i, j)) || {};
        mono(xs[j] + 8, yy + rh / 2 + 5, String(v), { 'font-size': 14, fill: cs.color || (rs.gone ? OFF : INK), 'font-weight': cs.bold ? 700 : null,
          opacity: (cs.op ?? 1) * rop, 'text-decoration': rs.gone ? 'line-through' : null }, g); }); });
    return { xs, W, H, x, y, rh, rowY: (i) => y + hh + i * rh + rh / 2, colR: (j) => xs[j] + cols[j].w };
  }
  function star(x, y, s, col) { if (s <= 0) return; const p = []; for (let i = 0; i < 10; i++) { const r = (i % 2 ? 6 : 14) * s, a = -Math.PI / 2 + i * Math.PI / 5; p.push([x + r * Math.cos(a), y + r * Math.sin(a)].join(',')); }
    el('polygon', { points: p.join(' '), fill: col || BAD, stroke: PANEL, 'stroke-width': 1.5 }); }

  // 페이지 데이터 그대로 (거리는 예시)
  const ROWS = [[7, 'AI 에이전트 설계 패턴', 'tech', 2024, 0.06], [12, 'LLM 기반 챗봇 구축', 'tech', 2024, 0.09], [23, '벡터 검색 엔진 비교', 'tech', 2023, 0.13], [31, '딥러닝 모델 최적화', 'tech', 2024, 0.18],
    [45, '취미로 배우는 도예', 'life', 2024, 0.22], [58, '데이터엔지니어 인터뷰', 'tech', 2022, 0.27], [64, '반도체 시장 동향', 'news', 2024, 0.31], [71, '주말 캠핑 가이드', 'life', 2023, 0.34], [82, '자연어 처리 입문', 'tech', 2024, 0.40]];
  const CC = { tech: ACC, life: WARN, news: INFO };
  const ANG = [-40, 200, 70, 140, -100, 20, 250, -10, 60];
  const QP = [250, 215], SC = 430;
  const ptOf = (i) => [QP[0] + Math.cos((ANG[i] * Math.PI) / 180) * ROWS[i][4] * SC, QP[1] + Math.sin((ANG[i] * Math.PI) / 180) * ROWS[i][4] * SC];
  function plane(o) { o = o || {}; zone(30, 30, 450, 370, '임베딩 공간 (거리는 예시)', { fill: 'var(--soft)' });
    ROWS.forEach((r, i) => { const [x, y] = ptOf(i), op = o.op ? o.op(i) : 1; if (o.line) o.line(i, x, y);
      el('circle', { cx: x, cy: y, r: 8, fill: CC[r[2]], opacity: op, stroke: o.ring && o.ring(i) ? INK : 'none', 'stroke-width': 3 });
      mono(x + 12, y - 8, String(r[0]), { 'font-size': 13.5, 'font-weight': 700, fill: CC[r[2]], opacity: op }); });
    star(QP[0], QP[1], 1, BAD); mono(QP[0] - 14, QP[1] + 26, '$1', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
    [['tech', ACC], ['life', WARN], ['news', INFO]].forEach(([n, col], i) => { el('circle', { cx: 52 + i * 80, cy: 384, r: 6, fill: col }); tx(64 + i * 80, 389, n, { 'font-size': 13.5, fill: MUT }); }); }

  // 1. 단순 벡터 검색
  function s1(t, c) { const { k, u } = c;
    plane({ line: (i, x, y) => { if (k === 1) grow(QP[0], QP[1], x, y, E(u, 0.2 + i * 0.12, 0.7 + i * 0.12), MUT, { plain: true, sw: 1.4, dash: '4 4' }); },
      op: (i) => (k >= 3 && i >= 5 ? 0.25 : 1), ring: (i) => k === 4 && i === 4 });
    if (k === 3 || k === 4) el('circle', { cx: QP[0], cy: QP[1], r: (0.22 * SC + 12) * (k === 3 ? E(u, 0.2, 0.9) : 1), fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '7 6' });
    if (k === 0) { [['<->', 'L2 거리', true], ['<=>', '코사인', false], ['<#>', '음의 내적', false]].forEach(([op, n, on], i) => {
        const s0 = pop(u, 0.4 + i * 0.25); card(600 + i * 115, 130, 100, 70, { rx: 10, stroke: on ? ACC : GRID, sw: on ? 2.5 : 1.5, s: s0 });
        mono(600 + i * 115, 130, op, { 'font-size': 20, 'font-weight': 800, fill: on ? ACC : MUT, 'text-anchor': 'middle', opacity: clamp(s0) }); tx(600 + i * 115, 154, n, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: clamp(s0) }); });
      tx(715, 230, '$1 = 사용자 질문을 임베딩한 벡터', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      sub(715, 258, '셋 중 하나를 고른다 · 여기서는 <->', fade(u, 1.8)); return; }
    if (k === 1) { snippet(510, 70, ['SELECT id, title,', '  embedding <-> $1 AS distance', 'FROM documents'], { fs: 14.5 });
      tx(700, 230, '9행 전부 거리를 계산한다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    const order = ROWS.map((r, i) => i).sort((a, b) => ROWS[a][4] - ROWS[b][4]);
    tbl(505, 50, k === 2 ? 'ORDER BY distance' : 'LIMIT 5', [{ n: '#', w: 32, k: 'txt' }, { n: 'id', w: 40, k: 'pk' }, { n: 'title', w: 196, k: 'txt' }, { n: 'cat', w: 58, k: 'txt' }, { n: 'dist', w: 60, k: 'vec' }],
      order.map((i, r) => [r + 1, ROWS[i][0], ROWS[i][1], ROWS[i][2], ROWS[i][4].toFixed(2)]), { rh: 30,
        rowSt: (r) => ({ op: k === 2 ? E(u, 0.2 + r * 0.18, 0.5 + r * 0.18) : r >= 5 ? (k === 3 ? 1 - 0.6 * E(u, 0.8, 1.4) : 0.4) : 1, gone: k >= 3 && r >= 5 && (k > 3 || u > 1.0), hi: k === 4 && r === 4, hiFill: C.WARNBG }),
        cell: (r, j) => (j === 3 ? { color: CC[ROWS[order[r]][2]], bold: true } : j === 4 ? { color: ACC, bold: true } : {}) });
    if (k === 3) { el('line', { x1: 505, y1: 80 + 5 * 30, x2: 891, y2: 80 + 5 * 30, stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.6) }); mono(900, 80 + 5 * 30 + 5, '✂', { 'font-size': 18, fill: ACC, opacity: fade(u, 0.6) });
      sub(700, 400, '6위 아래 4행은 반환되지 않는다', fade(u, 1.6)); }
    if (k === 4) tx(700, 400, '5위에 무관한 "도예"가 끼었다', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); }

  // 2. 메타데이터 WHERE
  function s2(t, c) { const { k, u } = c;
    const pass1 = (r) => r[2] === 'tech', pass2 = (r) => pass1(r) && r[3] >= 2024;
    const gone = (i) => (k >= 1 && !pass1(ROWS[i]) && (k > 1 || u > 0.9)) || (k >= 2 && !pass2(ROWS[i]) && (k > 2 || u > 0.9));
    if (k <= 2) {
      tbl(30, 50, 'documents', [{ n: 'id', w: 42, k: 'pk' }, { n: 'title', w: 200, k: 'txt' }, { n: 'category', w: 92, k: 'txt' }, { n: 'created_at', w: 108, k: 'txt' }, { n: 'distance', w: 84, k: 'vec' }],
        ROWS.map((r) => [r[0], r[1], r[2], r[3], r[4].toFixed(2)]), { rh: 34,
          colSt: (j) => ({ hi: (k === 0 && (j === 2 || j === 3)) || (k === 1 && j === 2) || (k === 2 && j === 3) }),
          rowSt: (i) => ({ gone: gone(i) }), cell: (i, j) => (j === 2 ? { color: CC[ROWS[i][2]], bold: true } : {}) });
      const n = k === 0 ? 9 : k === 1 ? (u > 0.9 ? 6 : 9) : u > 0.9 ? 4 : 6;
      [['전체', 9], ["category = 'tech'", 6], ["created_at > '2024-01-01'\nAND is_published", 4]].forEach(([lab, v], i) => { if (i > k) return;
        const y = 90 + i * 100, w = 260 * (v / 9) * (i === k ? E(u, 0.3, 1.0) : 1); el('rect', { x: 600 + (260 - w) / 2, y, width: w, height: 34, rx: 6, fill: i === 0 ? OFF : ACC, opacity: 0.8 });
        mono(730, y + 23, `${v}행`, { 'font-size': 16, 'font-weight': 800, fill: i === 0 ? INK : PANEL, 'text-anchor': 'middle', opacity: i === k ? fade(u, 1.0) : 1 });
        String(lab).split('\n').forEach((s, j) => mono(730, y + 54 + j * 18, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' })); });
      return; }
    const kept = ROWS.filter(pass2);
    if (k === 3) { tbl(120, 70, 'WHERE 통과 4행 → ORDER BY distance', [{ n: '#', w: 36, k: 'txt' }, { n: 'id', w: 46, k: 'pk' }, { n: 'title', w: 220, k: 'txt' }, { n: 'category', w: 92, k: 'txt' }, { n: 'distance', w: 90, k: 'vec' }],
        kept.map((r, i) => [i + 1, r[0], r[1], r[2], r[4].toFixed(2)]), { rh: 38, rowSt: (i) => ({ op: E(u, 0.3 + i * 0.35, 0.7 + i * 0.35) }), cell: (i, j) => (j === 4 ? { color: ACC, bold: true } : j === 3 ? { color: ACC } : {}) });
      tx(120, 290, 'LIMIT 5 지만 통과가 4행이라 4행이 나온다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(370, 320, '도예 · 캠핑 · 뉴스 · 2022 인터뷰 · 2023 글이 빠졌다', fade(u, 2.2)); return; }
    // k4: 한 쿼리 한 DB
    snippet(40, 70, ['SELECT id, title, category, created_at,', '       embedding <-> $1 AS distance', 'FROM documents', "WHERE category = 'tech'", "  AND created_at > '2024-01-01'", '  AND is_published = true', 'ORDER BY embedding <-> $1', 'LIMIT 5;'], { fs: 14.5 });
    el('rect', { x: 36, y: 150, width: 380, height: 66, rx: 6, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
    el('rect', { x: 36, y: 219, width: 380, height: 47, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.7) });
    tx(440, 188, '메타데이터 조건', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.4) }); tx(440, 248, '의미 정렬', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
    dbIcon(760, 170, 'PostgreSQL 하나', { s: pop(u, 1.2), stroke: ACC });
    cross(700, 300, 9, pop(u, 1.8)); tx(718, 306, '메타 DB ↔ 벡터 DB 동기화 불필요', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }

  // 3. B-tree + HNSW 결합
  function s3(t, c) { const { k, u } = c;
    if (k === 0 || k === 1 || k === 3) { // 왼쪽: B-tree, 오른쪽: HNSW 정렬
      const bt = k === 0 ? pop(u, 0.2) : 1;
      card(230, 70, 210, 44, { rx: 8, text: 'idx_docs_category', fs: 14, mono: true, stroke: INFO, color: INFO, s: bt });
      sub(230, 104, 'B-tree (category, created_at)', bt);
      [['life', 100], ['news', 230], ['tech', 360]].forEach(([n, x], i) => { const g = k === 0 ? E(u, 0.5 + i * 0.2, 0.9 + i * 0.2) : 1;
        grow(230, 116, x, 150, g, MUT, { plain: true }); card(x, 170, 90, 38, { rx: 8, text: n, fs: 14.5, mono: true, stroke: n === 'tech' ? ACC : GRID, color: CC[n], s: g }); });
      const tech = ROWS.filter((r) => r[2] === 'tech' && (k < 3 || r[3] >= 2024));
      tech.forEach((r, i) => { const g = k === 0 ? E(u, 1.3 + i * 0.12, 1.6 + i * 0.12) : 1, y = 214 + i * 30;
        grow(360, 190, 410, y + 12, g, ACC, { plain: true, sw: 1.2 }); mono(418, y + 17, `${r[0]}  ${r[3]}`, { 'font-size': 14, fill: INK, opacity: g }); });
      mono(60, 400, k < 3 ? 'category 후보 6행' : 'created_at 까지 → 4행', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 2.0) : 1 });
      if (k >= 1) { const hs = k === 1 ? pop(u, 0.2) : 1;
        card(720, 70, 260, 44, { rx: 8, text: 'idx_docs_embedding', fs: 14, mono: true, stroke: ACC, color: ACC, s: hs });
        sub(720, 104, 'HNSW (embedding vector_l2_ops)', hs);
        const sorted = tech.slice().sort((a, b) => a[4] - b[4]);
        sorted.forEach((r, i) => { const y = 140 + i * 38, g = k === 1 ? E(u, 0.8 + i * 0.2, 1.2 + i * 0.2) : 1;
          card(720, y + 14, 260, 32, { rx: 6, stroke: ACC, sw: 1.5, op: g }); mono(606, y + 19, `${i + 1}`, { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: g });
          mono(630, y + 19, `id=${r[0]}`, { 'font-size': 14, opacity: g }); mono(830, y + 19, r[4].toFixed(2), { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: g }); });
        if (k === 1) tx(720, 400, '후보를 거리순으로 세우는 일은 HNSW 가 맡는다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
        if (k === 3) { grow(500, 300, 580, 300, E(u, 0.3, 0.9), ACC); tx(720, 400, '같은 SQL · B-tree 로 좁히고 HNSW 로 정렬', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.4) }); } }
      return; }
    if (k === 2) { // iterative scan: 필터 통과 행이 LIMIT 를 채울 때까지 넓힌다
      plane({ op: (i) => (ROWS[i][2] === 'tech' && ROWS[i][3] >= 2024 ? 1 : 0.3) });
      const steps = [0.1, 0.2, 0.41], st = Math.min(2, Math.floor(E(u, 0.2, 2.2) * 3)), r = steps[st] * SC + 10;
      el('circle', { cx: QP[0], cy: QP[1], r, fill: ACC, opacity: 0.08, stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '7 6' });
      const got = ROWS.filter((row, i) => row[2] === 'tech' && row[3] >= 2024 && row[4] <= steps[st] + 0.001).length;
      mono(520, 90, 'SET hnsw.iterative_scan = strict_order;', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      mono(520, 116, 'SET hnsw.ef_search = 100;  -- 기본 40', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) });
      tx(520, 180, `탐색 ${st + 1}회째 · 필터 통과 ${got}행`, { 'font-size': 17, 'font-weight': 800 });
      ['범위 안 후보를 뽑고', 'WHERE 로 거른 뒤', '모자라면 더 넓게 본다'].forEach((s, i) => tx(540, 230 + i * 30, `${i + 1}. ${s}`, { 'font-size': 15, opacity: fade(u, 0.5 + i * 0.4) }));
      sub(700, 360, '0.8.0 부터 · 끄면 필터 뒤 행이 LIMIT 보다 적을 수 있다', fade(u, 2.0)); return; }
    // k4: pre-filter vs post-filter
    [['pre-filter (필터가 좁을 때)', INFO, ['B-tree 로 후보 8.5k', '그 안에서 거리 정렬', 'LIMIT 5']], ['post-filter (필터가 넓을 때)', ACC, ['HNSW top-50', 'WHERE 로 후처리', '모자라면 iterative scan']]].forEach(([n, col, st], r) => {
      const y = 90 + r * 150; tx(40, y - 20, n, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + r * 0.7) });
      st.forEach((s, i) => { const s0 = pop(u, 0.4 + r * 0.7 + i * 0.2), x = 150 + i * 290; card(x, y + 30, 240, 52, { rx: 10, text: s, fs: 15, stroke: col, s: s0 });
        if (i) grow(x - 170, y + 30, x - 122, y + 30, E(u, 0.5 + r * 0.7 + i * 0.2, 0.8 + r * 0.7 + i * 0.2), col); }); });
    const lg = E(u, 2.0, 2.6); if (lg > 0) el('path', { d: `M${730},${272} C ${730},${330} ${440},${330} ${440},${280}`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: lg });
    sub(590, 350, 'ef 를 넓혀 다시', lg, { fill: ACC, 'font-weight': 700 }); }

  // 4. 벡터 검색 + JOIN
  const PROD = [['p7', 'Mac mini M4', 'tech', 0.05], ['p12', 'iPad Pro 13"', 'tech', 0.11], ['p23', '게이밍 키보드', 'tech', 0.18], ['p31', '의자 (사무용)', 'home', 0.41]];
  const REV = [['p7', 4.8, 124], ['p12', 4.6, 87], ['p23', 4.2, 41]];
  function s4(t, c) { const { k, u } = c;
    el('rect', { x: 20, y: 34, width: 430, height: 230, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: k === 0 ? fade(u, 0.2) : 0.6 });
    mono(34, 56, 'WITH similar_products AS (…)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 0.2) : 1 });
    const P = tbl(36, 90, 'products', [{ n: 'id', w: 54, k: 'pk' }, { n: 'name', w: 160, k: 'txt' }, { n: 'category', w: 90, k: 'txt' }, { n: 'distance', w: 96, k: 'vec' }],
      PROD.map((p) => [p[0], p[1], p[2], p[3].toFixed(2)]), { rh: 34, op: k === 0 ? fade(u, 0.4) : 1,
        rowSt: (i) => ({ gone: k >= 1 && i === 3 && (k > 1 || u > 0.9), hi: k >= 1 && i < 3 && (k > 1 || u > 1.3) }),
        cell: (i, j) => (j === 3 ? { color: ACC, bold: true, op: k === 0 ? fade(u, 1.0 + i * 0.2) : 1 } : j === 2 ? { color: PROD[i][2] === 'tech' ? ACC : WARN } : {}) });
    if (k === 0) { sub(235, 290, '벡터 검색만 먼저 떼어 낸다', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK }); sub(720, 160, '읽기 쉽고, 뒤의 JOIN 은 후처리가 된다', fade(u, 2.0)); return; }
    if (k === 1) { pill(700, 120, "WHERE category = 'tech'", ACC, pop(u, 0.4), { mono: true, fs: 14 }); pill(700, 170, 'ORDER BY distance LIMIT 20', ACC, pop(u, 0.9), { mono: true, fs: 14 });
      sub(700, 220, '넉넉히 20개 · 뒤에서 걸러질 몫까지', fade(u, 1.6)); sub(235, 290, 'home 인 의자는 여기서 빠진다', fade(u, 1.2), { fill: WARN, 'font-weight': 700 }); return; }
    const RV = tbl(560, 90, 'reviews 집계', [{ n: 'product_id', w: 110, k: 'fk' }, { n: 'AVG(rating)', w: 120, k: 'txt' }, { n: 'COUNT(id)', w: 110, k: 'txt' }],
      REV.map((r) => [r[0], '★ ' + r[1].toFixed(1), r[2]]), { rh: 34, op: k === 2 ? fade(u, 0.3) : 1, rowSt: (i) => ({ op: k === 2 ? E(u, 0.5 + i * 0.3, 0.9 + i * 0.3) : 1 }),
        cell: (i, j) => (j === 1 ? { color: WARN, bold: true } : j === 2 && k >= 3 ? { color: GOOD, bold: true } : {}) });
    if (k === 2) { sub(730, 250, 'CTE 에 남은 세 상품의 리뷰만 집계한다', fade(u, 1.6)); return; }
    REV.forEach((r, i) => { const g = k === 3 ? E(u, 0.2 + i * 0.25, 0.7 + i * 0.25) : 1; grow(P.colR(3), P.rowY(i), 560, RV.rowY(i), g, INFO, { plain: true, sw: 2 }); });
    if (k === 3) { mono(560, 280, 'LEFT JOIN reviews USING (product_id)', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
      mono(560, 310, 'HAVING COUNT(r.id) >= 10', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
      REV.forEach((r, i) => check(915, RV.rowY(i), 8, pop(u, 1.5 + i * 0.2)));
      sub(700, 350, '41 · 87 · 124 개 모두 통과', fade(u, 2.0)); return; }
    // k4: 최종
    tbl(160, 300, 'ORDER BY sp.distance LIMIT 5', [{ n: 'id', w: 54, k: 'pk' }, { n: 'name', w: 160, k: 'txt' }, { n: 'distance', w: 90, k: 'vec' }, { n: '★', w: 60, k: 'txt' }, { n: 'n', w: 60, k: 'txt' }],
      REV.map((r, i) => [r[0], PROD[i][1], PROD[i][3].toFixed(2), r[1].toFixed(1), r[2]]), { rh: 26, rowSt: (i) => ({ op: E(u, 0.3 + i * 0.3, 0.7 + i * 0.3) }), cell: (i, j) => (j === 2 ? { color: ACC, bold: true } : j === 3 ? { color: WARN, bold: true } : {}) });
    sub(780, 360, 'GROUP BY 가 흐트러뜨린 순서를', fade(u, 1.6)); sub(780, 384, '거리로 되돌리고 바깥에서 자른다', fade(u, 1.8)); }

  // 5. 하이브리드 — 의미 점수 + 키워드 점수
  const HY = [[7, 0.81, 0.94], [12, 0.74, 0.91], [23, 0.45, 0.87], [31, 0.62, 0.82], [82, 0.71, 0.60], [58, 0.33, 0]];
  const fin = (h) => 0.7 * h[2] + 0.3 * h[1];
  const titleOf = (id) => ROWS.find((r) => r[0] === id)[1];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(170, 80, 280, 46, { rx: 8, text: "'AI 에이전트 설계 패턴 …'", fs: 14, stroke: INK, s: pop(u, 0.2) });
      grow(170, 104, 170, 140, E(u, 0.5, 0.8), MUT); mono(190, 128, "to_tsvector('simple', …)", { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) });
      ['ai', '에이전트', '설계', '패턴'].forEach((w, i) => pill(70 + i * 70 + (i ? 10 * i : 0), 170, w, WARN, pop(u, 0.9 + i * 0.15), { mono: true, fs: 14 }));
      tx(520, 70, 'GIN 역색인 (낱말 → 문서)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      [['ai', '7, 12, 82'], ['에이전트', '7, 58'], ['챗봇', '12'], ['벡터', '23']].forEach(([w, ids], i) => { const y = 100 + i * 46, s0 = pop(u, 1.4 + i * 0.2);
        card(580, y, 110, 36, { rx: 6, text: w, fs: 14, mono: true, stroke: WARN, color: WARN, s: s0 }); grow(640, y, 690, y, clamp(s0), MUT); mono(700, y + 5, ids, { 'font-size': 14, opacity: clamp(s0) }); });
      sub(480, 330, '키워드 점수의 준비 작업 · 그림의 색인 내용은 예시', fade(u, 2.2)); return; }
    const showV = k >= 2, showF = k >= 3, rowsN = k >= 4 ? 6 : 5;
    let order = HY.slice(0, rowsN).map((h, i) => i);
    if (k === 1) order.sort((a, b) => HY[b][1] - HY[a][1]); else if (k >= 2 && k <= 4) order.sort((a, b) => HY[b][2] - HY[a][2]);
    const fOrder = HY.map((h, i) => i).sort((a, b) => fin(HY[b]) - fin(HY[a]));
    const pk = c.prev && c.prev.beat ? null : null;
    tx(40, 50, ['', 'bm25 CTE — ts_rank_cd 순', 'vec CTE — 1 − 코사인 거리 순', 'final = 0.7·vec + 0.3·bm25', '두 CTE 를 LEFT JOIN (한쪽만 맞아도)', 'ORDER BY final_score DESC LIMIT 5'][k], { 'font-size': 15, 'font-weight': 800 });
    [['bm25', WARN, 380], ['vec', ACC, 560], ['final', INK, 740]].forEach(([n, col, x], j) => { if ((j === 1 && !showV) || (j === 2 && !showF)) return; mono(x, 82, n, { 'font-size': 14, 'font-weight': 700, fill: col }); });
    HY.slice(0, rowsN).forEach((h, i) => {
      const rk = k === 5 ? fOrder.indexOf(i) : order.indexOf(i), y = 100 + rk * 48, cut = k === 5 && rk >= 5;
      const op = cut ? 1 - 0.6 * E(u, 1.4, 2.0) : k === 4 && i === 5 ? fade(u, 0.4) : 1;
      mono(40, y + 18, `id=${h[0]}`, { 'font-size': 14, 'font-weight': 700, opacity: op, 'text-decoration': cut && u > 1.6 ? 'line-through' : null });
      tx(110, y + 18, titleOf(h[0]), { 'font-size': 13.5, fill: MUT, opacity: op });
      const gb = k === 1 ? E(u, 0.3 + rk * 0.15, 1.0 + rk * 0.15) : 1;
      el('rect', { x: 380, y: y + 4, width: 140 * h[1] * gb, height: 20, rx: 3, fill: WARN, opacity: 0.8 * op }); mono(384 + 140 * h[1] * gb, y + 19, h[1].toFixed(2), { 'font-size': 13.5, fill: WARN, opacity: gb * op });
      if (showV) { const gv = k === 2 ? E(u, 0.3 + rk * 0.15, 1.0 + rk * 0.15) : 1; el('rect', { x: 560, y: y + 4, width: Math.max(2, 140 * h[2] * gv), height: 20, rx: 3, fill: ACC, opacity: 0.8 * op });
        mono(564 + 140 * h[2] * gv, y + 19, h[2] === 0 ? '0 (없음)' : h[2].toFixed(2), { 'font-size': 13.5, fill: ACC, opacity: gv * op }); }
      if (showF) { const gf = k === 3 ? E(u, 0.3 + rk * 0.15, 1.0 + rk * 0.15) : 1, a = 0.7 * h[2] * 160 * gf, b = 0.3 * h[1] * 160 * gf;
        el('rect', { x: 740, y: y + 4, width: Math.max(1, a), height: 20, fill: ACC, opacity: op }); el('rect', { x: 740 + a, y: y + 4, width: b, height: 20, fill: WARN, opacity: op });
        mono(746 + a + b, y + 19, fin(h).toFixed(2), { 'font-size': 14, 'font-weight': 800, opacity: gf * op }); } });
    if (k === 2) sub(480, 400, '두 점수가 아직 따로 논다 · 점수는 예시', fade(u, 2.0));
    if (k === 3) sub(480, 400, 'COALESCE 로 빈 점수는 0 · 아직 vec 순서 그대로', fade(u, 2.0));
    if (k === 4) sub(480, 400, 'id=58 은 키워드에만 걸려 합류했다 (vec 0)', fade(u, 1.2), { fill: WARN, 'font-weight': 700 });
    if (k === 5) { sub(480, 400, 'id=31(0.76)이 id=23(0.74)을 앞질렀고, id=58(0.10)은 잘렸다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); } }

  const quiz = [
    { q: '필터 없이 ORDER BY embedding <-> $1 LIMIT 5만 쓰면 생길 수 있는 문제는 무엇인가?',
      o: ['거리가 계산되지 않는다', '주제와 무관한 문서도 거리만 가까우면 결과에 섞인다', '항상 5행보다 적게 나온다'], a: 1,
      why: '9행 예시에서 5위에 "취미로 배우는 도예"가 들어왔다. 카테고리·기간 같은 조건이 없으면 잡음이 낀다.' },
    { q: "WHERE category = 'tech' AND created_at > '2024-01-01'을 붙이면 ORDER BY <-> 는 어떤 행에 적용되는가?",
      o: ['WHERE를 통과한 행에만', '전체 9행에 먼저 적용하고 나중에 거른다', 'category 컬럼에만'], a: 0,
      why: '9행이 6행, 다시 4행으로 줄고 그 4행만 거리순으로 정렬된다. LIMIT 5여도 통과가 4행이라 4행이 나온다.' },
    { q: 'hnsw.iterative_scan을 켜면 무엇이 달라지는가?',
      o: ['B-tree 인덱스가 필요 없어진다', 'HNSW가 정확한 전수 검색으로 바뀐다', '필터를 통과한 행이 LIMIT을 채울 때까지 탐색을 넓힌다'], a: 2,
      why: 'HNSW가 뽑은 후보가 WHERE에서 많이 걸러지면 결과가 모자랄 수 있다. 0.8.0부터 iterative scan이 범위를 넓혀 그 틈을 메운다.' },
    { q: '벡터 검색 CTE에서 LIMIT 20처럼 넉넉히 뽑는 이유는 무엇인가?',
      o: ['인덱스가 20개 단위로만 동작해서', '뒤의 HAVING 같은 조건에서 일부가 빠져도 최종 5개를 채우려고', 'JOIN이 20행 이상에서만 동작해서'], a: 1,
      why: 'JOIN·GROUP BY·HAVING은 벡터 검색 뒤의 후처리다. 후보가 빠듯하면 HAVING에서 탈락한 만큼 결과가 줄어든다.' },
    { q: 'final_score = 0.7·vec + 0.3·bm25로 다시 정렬했을 때 id=31이 id=23을 앞지른 이유는 무엇인가?',
      o: ['vec 점수가 더 높아서', 'id 숫자가 더 커서', 'vec은 조금 낮지만 키워드 점수가 0.62로 0.45보다 높아서'], a: 2,
      why: 'id=31은 0.7·0.82 + 0.3·0.62 = 0.76, id=23은 0.7·0.87 + 0.3·0.45 = 0.74다. 키워드 적합도가 순위를 바꿨다.' },
  ];
  const summary = [
    '필터 없는 거리 정렬은 무관한 문서까지 상위에 올린다.',
    'WHERE로 후보를 줄인 뒤 그 행만 거리순으로 세우면 의미와 업무 조건이 함께 맞는다.',
    'B-tree는 메타 조건을, HNSW는 거리 정렬을 맡고 iterative scan이 그 사이를 메운다.',
    '키워드 점수를 0.3만 섞어도 의미 점수만 볼 때와 순위가 달라진다.',
  ];
  const review = [
    { q: "HNSW 인덱스가 있는데 WHERE category = 'news' 검색 결과가 LIMIT 10보다 적게 나온다. news는 전체의 1%다. 먼저 의심할 것은?",
      o: ['HNSW 후보 대부분이 필터에서 걸러졌다. iterative scan이나 B-tree 선필터를 쓴다', 'news 문서의 임베딩이 모두 NULL이다', 'LIMIT 문법이 틀렸다'], a: 0,
      why: 'HNSW는 거리순 후보를 ef_search만큼 뽑고 필터는 그 뒤에 걸린다. 필터가 좁으면 iterative scan으로 더 보거나 B-tree로 먼저 좁힌다.' },
    { q: 'vector_cosine_ops로 HNSW를 만들고 쿼리는 ORDER BY embedding <-> $1을 쓴다. EXPLAIN에 Seq Scan이 나온다. 원인은?',
      o: ['B-tree 인덱스와 충돌해서', '연산자 <->와 ops class(코사인)가 맞지 않아서', 'ef_search가 기본값이라서'], a: 1,
      why: '인덱스는 만들 때 고른 거리의 연산자에만 걸린다. <-> 를 쓰려면 vector_l2_ops, 코사인이면 쿼리를 <=> 로 바꾼다.' },
    { q: '"AI 에이전트" 같은 고유 낱말을 검색했더니 벡터 점수만으로는 그 낱말이 든 문서가 밀린다. 가장 알맞은 처방은?',
      o: ['LIMIT을 크게 늘린다', '임베딩 차원을 줄인다', 'ts_rank_cd 키워드 점수를 가중 합산해 하이브리드로 정렬한다'], a: 2,
      why: '의미 점수는 비슷한 뜻을, 키워드 점수는 정확한 낱말을 잡는다. 둘을 0.7·0.3처럼 섞으면 낱말이 맞는 문서가 올라온다.' },
  ];

  R.page({ title: 'pgvector 실전 쿼리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
