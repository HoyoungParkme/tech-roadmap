/* IV-1-2 pgvector 데이터 모델 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, terminal, snippet, axes, cells } = R;
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
  // N 칸짜리 띠: 한 칸 = 32차원. 길이는 차원 수에 비례 (3072 → 880px)
  function ribbon(x, y, n, u, col, o) { o = o || {}; const w = (880 * n) / 3072, k = Math.max(1, Math.round(n / 32)), cw = w / k, show = Math.round(k * clamp(u ?? 1));
    for (let i = 0; i < show; i++) el('rect', { x: x + i * cw, y, width: Math.max(1, cw - 1.5), height: o.h || 22, fill: col || ACC, opacity: 0.35 + 0.5 * ((i * 37) % 11) / 10 });
    el('rect', { x, y, width: w, height: o.h || 22, fill: 'none', stroke: col || ACC, 'stroke-width': 1.5, rx: 2, opacity: clamp((u ?? 1) * 3) });
    return w; }
  function arrowV(x1, y1, x2, y2, col, u, sw) { grow(x1, y1, x2, y2, u ?? 1, col, { sw: sw || 3 }); }

  // 1. vector(N) — N 은 컬럼에 박힌다
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { banner(250, 90, 'CREATE EXTENSION vector;', pop(u, 0.2));
      pill(250, 150, '새 타입  vector(N)', ACC, pop(u, 0.9), { fs: 15 });
      el('rect', { x: 520, y: 70, width: 380, height: 130, rx: 10, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 1.4) });
      tx(710, 142, 'items 표는 아직 없다', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); return; }
    const embW = k === 1 ? 0 : k === 2 ? 270 * E(u, 0.2, 0.9) : 270, N = k === 3 ? 384 : 1536;
    const T = tbl(40, 60, 'items', [{ n: 'id serial', w: 110, k: 'pk' }, { n: 'name text', w: 140, k: 'txt' }, { n: `embedding vector(${N})`, w: embW, k: 'vec' }],
      [[1, "'AI 문서'", k >= 2 ? `[${N}개 float]` : null]], { op: k === 1 ? fade(u, 0.2) : 1, colSt: (j) => ({ hi: j === 2 && (k === 2 || k === 3 || k === 5) }),
        cell: (i, j) => (j === 2 ? { color: ACC, bold: true, op: k === 2 ? fade(u, 0.9) : 1 } : {}), stroke: k === 5 ? WARN : null });
    if (k === 1) { sub(250, 160, '늘 쓰던 SERIAL 과 TEXT', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { grow(440, 124, 440, 196, E(u, 1.0, 1.3), ACC);
      ribbon(40, 210, 1536, E(u, 1.3, 2.5)); mono(40, 260, '1536칸 (한 칸 그림 = 32차원)', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) });
      sub(700, 320, '이 컬럼의 모든 행이 1536 길이를 지킨다', fade(u, 2.3), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { // 모델별 N
      [['all-MiniLM-L6-v2', 384], ['nomic-embed-text-v1.5', 768], ['text-embedding-3-small', 1536], ['text-embedding-3-large', 3072]].forEach(([m, n], i) => {
        const y = 170 + i * 58, hi = n === 384; tx(40, y - 8, m, { 'font-size': 14, 'font-weight': 700, fill: hi ? ACC : INK, opacity: fade(u, 0.2 + i * 0.3) });
        mono(40 + tw(m, 14) + 16, y - 8, `vector(${n})`, { 'font-size': 14, 'font-weight': 700, fill: hi ? ACC : INFO, opacity: fade(u, 0.8 + i * 0.3) });
        ribbon(40, y, n, E(u, 0.3 + i * 0.3, 1.0 + i * 0.3), hi ? ACC : INFO, { h: 16 }); });
      return; }
    if (k === 4) { terminal(40, 170, 560, 200, ['=# SELECT column_name, udt_name,', '          character_maximum_length', '   FROM information_schema.columns ...', ' column_name | udt_name | char_max_len', ' embedding   | vector   |'], 5 * E(u, 0.2, 1.8), { title: 'psql', fs: 14 });
      card(780, 230, 260, 70, { rx: 10, text: 'pg_attribute.atttypmod\n= 1536', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.9) });
      sub(780, 290, '차원 N 은 여기 숨어 있다', fade(u, 2.2)); return; }
    // k5: N 은 못 바꾼다
    cross(600, 76, 12, pop(u, 0.3));
    snippet(40, 190, ['ALTER TABLE items DROP COLUMN embedding;', 'ALTER TABLE items ADD COLUMN embedding vector(384);', '-- 모든 행의 임베딩을 다시 만든다'], { fs: 14.5, op: fade(u, 0.6) });
    tx(520, 330, '모델 선택 = 스키마 결정', { 'font-size': 20, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    sub(520, 362, 'vector 로 N 을 생략할 수는 있지만 차원 검증을 잃는다', fade(u, 2.0)); }

  // 2. 입력 — 텍스트 캐스트 / 드라이버 자동 변환
  function slots(x, y, vals, n, o) { o = o || {}; for (let i = 0; i < n; i++) { const v = vals[i], has = v != null && (o.u ?? 1) * n > i;
      card(x + i * 72 + 32, y, 64, 40, { rx: 6, text: has ? v.toFixed(2) : '', fs: 15, mono: true, fw: 700, stroke: has ? (o.col || ACC) : (o.bad ? BAD : OFF), dash: has ? null : '4 4', color: o.col || ACC, fill: has ? ACCBG : PANEL }); } }
  const ROWS2 = [[42, "'cat photo'", '[0.10, 0.85, 0.42]'], [43, "'dog photo'", '[0.20, 0.75, 0.55]']];
  function s2(t, c) { const { k, u } = c;
    const nRows = k === 0 ? (u > 1.8 ? 1 : 0) : k === 1 ? (u > 1.8 ? 2 : 1) : k === 5 ? 2 : 2;
    const dbCol = k >= 3 ? 520 : 520;
    tbl(dbCol, 60, 'items  (embedding vector(3))', [{ n: 'id', w: 54, k: 'pk' }, { n: 'name', w: 130, k: 'txt' }, { n: 'embedding', w: 200, k: 'vec' }],
      ROWS2.slice(0, nRows), { rowSt: (i) => ({ hi: (k === 0 && i === 0) || (k === 1 && i === 1), op: (k === 0 && i === 0) || (k === 1 && i === 1) ? fade(u, 1.8) : 1 }), cell: (i, j) => (j === 2 ? { color: ACC, bold: true } : {}) });
    if (k <= 2) { const lit = ["'[0.10, 0.85, 0.42]'", "'[0.20, 0.75, 0.55]'", "'[0.1, 0.2]'"][k], vals = [[0.1, 0.85, 0.42], [0.2, 0.75, 0.55], [0.1, 0.2]][k];
      card(220, 90, tw(lit, 15) + 30, 42, { rx: 8, text: lit, fs: 15, mono: true, stroke: MUT, color: INK, s: pop(u, 0.2) });
      sub(220, 132, '그냥 텍스트', fade(u, 0.4));
      const cast = k === 0 ? '::vector(3)' : '컬럼 타입이 자동 캐스트';
      pill(220, 175, cast, k === 0 ? ACC : INFO, pop(u, 0.7), { mono: k === 0, fs: 14 });
      grow(220, 192, 220, 222, E(u, 1.0, 1.3), k === 2 ? BAD : ACC);
      slots(112, 250, vals, 3, { u: E(u, 1.2, 1.8), bad: k === 2, col: k === 2 ? BAD : ACC });
      if (k === 2) { el('rect', { x: 40, y: 300, width: 400, height: 40, rx: 8, fill: C.BADBG, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.9) });
        mono(52, 326, 'ERROR: expected 3 dimensions, not 2', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
        cross(720, 210, 12, pop(u, 2.1)); tx(745, 216, "'bad' 행은 생기지 않는다", { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) }); }
      else { const h = (v) => v * 60; vals.forEach((v, i) => el('rect', { x: 132 + i * 72, y: 360 - h(v) * E(u, 1.8, 2.4), width: 24, height: h(v) * E(u, 1.8, 2.4), rx: 3, fill: ACC, opacity: 0.7 }));
        sub(220, 390, '세 칸 모두 찼다 → 행 저장', fade(u, 2.2), { fill: GOOD, 'font-weight': 700 }); }
      return; }
    // k3~5: 파이썬 쪽
    zone(30, 200, 380, 200, 'Python (psycopg)', { stroke: INFO, fill: 'var(--panel)', color: INFO });
    const ad = k === 3 ? pop(u, 0.4) : 1;
    card(465, 300, 100, 120, { rx: 10, text: '어댑터\nvector\n↔\nndarray', fs: 14, stroke: ACC, color: ACC, fill: ACCBG, s: ad });
    mono(50, 250, 'register_vector(conn)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 3 ? fade(u, 0.2) : 1 });
    if (k === 3) { sub(220, 290, '이 한 줄이 어댑터를 단다', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(220, 320, '문자열을 손으로 조립하지 않는다', fade(u, 1.6)); return; }
    mono(50, 290, 'vec = np.array([...], dtype=float32)', { 'font-size': 13.5, opacity: k === 4 ? fade(u, 0.2) : 1 });
    if (k === 4) { cells(60, 315, ['0.10', '0.85', '0.42'], { w: 70, h: 40, style: () => ({ stroke: INFO, color: INFO }) , s: 1 });
      sub(350, 340, 'float32 × 3', fade(u, 1.0), { fill: INFO, 'font-weight': 700 }); sub(220, 385, '문자열로 바꾸는 코드는 어디에도 없다', fade(u, 1.6)); return; }
    cells(60, 315, ['0.10', '0.85', '0.42'], { w: 70, h: 40, style: () => ({ stroke: INFO, color: INFO }) });
    fly(320, 335, 700, 150, seg(u, 0.3, 1.3), "%s ← ndarray", { mono: true });
    fly(700, 170, 330, 260, seg(u, 1.5, 2.5), 'ndarray', { mono: true, fill: INFO, stay: true });
    sub(720, 330, 'INSERT: 어댑터가 직렬화해 보낸다', fade(u, 0.9)); sub(720, 356, 'SELECT: 다시 ndarray 로 돌려준다', fade(u, 2.0)); }

  // 3. 거리 연산자 세 개 — 같은 두 벡터를 세 가지로 잰다
  const A = [1, 2], Bv = [4, 6];
  function plane3(c, o) { o = o || {}; return axes(70, 40, 330, 330, { x: [0, 7], y: [0, 7], xt: [0, 1, 2, 3, 4, 5, 6, 7], yt: [0, 2, 4, 6], grid: true }); }
  const KNN = [[3.2, 4.1], [4.6, 5.2], [2.1, 5.8], [5.5, 3.6], [1.4, 3.2], [3.8, 6.4], [6.2, 5.9], [2.8, 2.4], [5.1, 1.6], [0.9, 6.3], [6.5, 2.9], [4.2, 3.0], [1.8, 1.2], [3.3, 0.8], [6.1, 0.9], [0.6, 4.6]];
  function s3(t, c) { const { k, u } = c;
    const ax = plane3(c);
    if (k <= 2 || k === 7) {
      const ga = k === 0 ? pop(u, 0.2) : 1;
      if (k >= 1) { el('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(A[0]), y2: ax.Y(A[1]), stroke: INK, 'stroke-width': 3, 'marker-end': 'url(#ra-ah)' });
        el('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(Bv[0]), y2: ax.Y(Bv[1]), stroke: INK, 'stroke-width': 3, 'marker-end': 'url(#ra-ah)' }); }
      el('circle', { cx: ax.X(1), cy: ax.Y(2), r: 7 * ga, fill: ACC }); el('circle', { cx: ax.X(4), cy: ax.Y(6), r: 7 * ga, fill: INFO });
      mono(ax.X(1) - 12, ax.Y(2) - 12, 'a=[1,2]', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end' });
      mono(ax.X(4) + 12, ax.Y(6) + 5, 'b=[4,6]', { 'font-size': 14, 'font-weight': 700, fill: INFO });
      const rows = [['<->', 'L2 거리', '√(3²+4²)', '5.000'], ['<=>', '코사인 거리', '1 − cos 7.1°', '0.008'], ['<#>', '음의 내적', '−(1·4 + 2·6)', '−16']];
      rows.forEach(([op, n, f, v], i) => { if (i > Math.min(k, 2) || (k === 7 && i !== 1)) return; const y = 80 + i * 90, on = i === k || k === 7, s0 = i === k ? pop(u, 1.0) : 1;
        card(700, y, 400, 74, { rx: 10, stroke: on ? ACC : GRID, sw: on ? 2.2 : 1.5, s: s0 });
        mono(520, y + 7, op, { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: clamp(s0) });
        tx(590, y - 6, n, { 'font-size': 15, 'font-weight': 700, opacity: clamp(s0) }); mono(590, y + 18, f, { 'font-size': 14, fill: MUT, opacity: clamp(s0) });
        mono(880, y + 8, v, { 'font-size': 20, 'font-weight': 800, fill: on ? ACC : INK, 'text-anchor': 'end', opacity: clamp(s0) }); });
      if (k === 0) { const g = E(u, 0.5, 1.0); el('line', { x1: ax.X(1), y1: ax.Y(2), x2: ax.X(1 + 3 * g), y2: ax.Y(2), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
        const g2 = E(u, 0.9, 1.4); if (g2 > 0) el('line', { x1: ax.X(4), y1: ax.Y(2), x2: ax.X(4), y2: ax.Y(2 + 4 * g2), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
        mono(ax.X(2.5), ax.Y(2) + 20, '3', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); mono(ax.X(4) + 10, ax.Y(4), '4', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) });
        grow(ax.X(1), ax.Y(2), ax.X(4), ax.Y(6), E(u, 1.4, 2.0), ACC, { sw: 4, plain: true }); mono(ax.X(2.2), ax.Y(4.4), '5', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); }
      if (k === 1) { const r = 120 * E(u, 0.4, 1.2), a1 = Math.atan2(2, 1), a2 = Math.atan2(6, 4), O = [ax.X(0), ax.Y(0)];
        if (r > 0) el('path', { d: `M${O[0] + r * Math.cos(a2)},${O[1] - r * Math.sin(a2)} A${r},${r} 0 0 0 ${O[0] + r * Math.cos(a1)},${O[1] - r * Math.sin(a1)}`, fill: 'none', stroke: ACC, 'stroke-width': 5 });
        mono(O[0] + 165, O[1] - 160, 'θ ≈ 7.1°', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) }); sub(235, 405, '길이는 보지 않고 방향만 본다', fade(u, 1.8)); }
      if (k === 2) { const p = 16 / 52, px = 4 * p, py = 6 * p, g = E(u, 0.4, 1.2);
        el('line', { x1: ax.X(1), y1: ax.Y(2), x2: ax.X(lerp(1, px, g)), y2: ax.Y(lerp(2, py, g)), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
        el('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(px), y2: ax.Y(py), stroke: ACC, 'stroke-width': 6, opacity: fade(u, 1.2) });
        sub(235, 405, 'a·b = 16 → 부호를 뒤집어 −16 (작을수록 가깝다)', fade(u, 1.6)); }
      if (k === 7) { // 유사도 = 1 − 거리
        const x0 = 470, w = 440, X = (v) => x0 + (v / 2) * w; el('line', { x1: x0, y1: 340, x2: x0 + w, y2: 340, stroke: MUT, 'stroke-width': 2 });
        [0, 1, 2].forEach((v) => mono(X(v), 364, String(v), { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' })); tx(x0, 320, '코사인 거리 (0 ~ 2)', { 'font-size': 13.5, fill: MUT });
        el('circle', { cx: X(0.0077), cy: 340, r: 8, fill: ACC });
        pill(700, 260, 'cos_similarity = 1 − 0.008 = 0.992', GOOD, pop(u, 0.8), { mono: true, fs: 14 }); }
      return; }
    // k3~6: KNN 과 인덱스 짝
    const q = [3.6, 4.4], ds = KNN.map((p, i) => [Math.hypot(p[0] - q[0], p[1] - q[1]), i]).sort((a, b) => a[0] - b[0]), top = new Set(ds.slice(0, 10).map((d) => d[1]));
    KNN.forEach((p, i) => { const on = k === 3 && top.has(i) && u > 1.2; el('circle', { cx: ax.X(p[0]), cy: ax.Y(p[1]), r: 6, fill: on ? ACC : OFF }); });
    const sq = k === 3 ? pop(u, 0.2) : 1; el('rect', { x: ax.X(q[0]) - 9 * sq, y: ax.Y(q[1]) - 9 * sq, width: 18 * sq, height: 18 * sq, fill: BAD, transform: `rotate(45 ${ax.X(q[0])} ${ax.Y(q[1])})` });
    mono(ax.X(q[0]) + 14, ax.Y(q[1]) - 10, 'q', { 'font-size': 15, 'font-weight': 800, fill: BAD });
    if (k === 3) { const r10 = ds[9][0] + 0.2, rr = (330 / 7) * r10 * E(u, 0.6, 1.4); el('circle', { cx: ax.X(q[0]), cy: ax.Y(q[1]), r: rr, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      snippet(480, 80, ['SELECT id, name', 'FROM items', 'ORDER BY embedding <=> q', 'LIMIT 10;'], { fs: 15 });
      tx(480, 270, 'ORDER BY 거리 + LIMIT = KNN', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) }); sub(640, 300, '새 문법이 없다', fade(u, 2.0)); return; }
    // 인덱스 ops class ↔ 연산자
    const IDX = [['idx_items_l2', 'vector_l2_ops', '<->'], ['idx_items_cos', 'vector_cosine_ops', '<=>'], ['idx_items_ip', 'vector_ip_ops', '<#>']];
    IDX.forEach(([n, ops, op], i) => { if (i > k - 4) return; const y = 80 + i * 80, s0 = i === k - 4 ? pop(u, 0.3) : 1;
      card(600, y, 250, 58, { rx: 10, stroke: INFO, s: s0 }); mono(490, y - 5, n, { 'font-size': 14, 'font-weight': 700, opacity: clamp(s0) }); mono(490, y + 17, ops, { 'font-size': 13.5, fill: INFO, opacity: clamp(s0) });
      el('line', { x1: 725, y1: y, x2: 790, y2: y, stroke: INFO, 'stroke-width': 2.5, opacity: clamp(s0) });
      card(830, y, 76, 44, { rx: 8, text: op, fs: 18, mono: true, fw: 800, stroke: ACC, color: ACC, s: s0 }); });
    if (k === 4) { mono(480, 340, 'ORDER BY embedding <=> q', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); cross(760, 334, 9, pop(u, 1.4));
      tx(780, 340, '전수 비교', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) }); sub(680, 372, 'L2 인덱스는 <=> 쿼리에 안 걸린다', fade(u, 1.8)); }
    if (k === 5) { mono(480, 340, 'ORDER BY embedding <=> q', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); check(765, 334, 9, pop(u, 1.4));
      tx(780, 340, '인덱스 사용', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) }); sub(680, 372, '텍스트 임베딩은 보통 이 짝', fade(u, 1.8)); }
    if (k === 6) { tx(680, 340, '쿼리 연산자 ≠ ops class → 인덱스는 없는 셈', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); } }

  // 4. 함수 — dims · norm · avg · sum · 함수형 거리
  const GA = [[1.2, 4.8], [1.8, 5.6], [0.8, 5.4], [1.6, 4.4]], GB = [[4.6, 1.4], [5.4, 2.0], [5.0, 0.8], [5.8, 1.4]];
  const mean = (P) => [P.reduce((a, p) => a + p[0], 0) / P.length, P.reduce((a, p) => a + p[1], 0) / P.length];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { mono(60, 80, "vector_dims('[1,2,3]'::vector)", { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      cells(60, 110, ['1', '2', '3'], { w: 60, h: 44 }); [0, 1, 2].forEach((i) => mono(90 + i * 66, 182, String(i + 1), { 'font-size': 15, fill: ACC, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.3) }));
      pill(330, 132, '→ 3', ACC, pop(u, 1.6), { mono: true, fs: 16 });
      tx(520, 80, '모든 행이 같은 길이인가?', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      [0, 1, 2, 3].forEach((i) => ribbon(520, 100 + i * 34, 1536, E(u, 0.9 + i * 0.15, 1.4 + i * 0.15), INFO, { h: 18 }));
      mono(520, 260, 'count(DISTINCT vector_dims) = 1', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); sub(660, 290, '1 이면 OK, 2 이상이면 데이터 오류', fade(u, 2.2)); return; }
    const ax = axes(70, 40, 330, 330, { x: [0, 7], y: [0, 7], xt: [0, 1, 2, 3, 4, 5, 6, 7], yt: [0, 2, 4, 6], grid: true });
    if (k === 1) { const g = E(u, 0.2, 1.0); grow(ax.X(0), ax.Y(0), ax.X(3), ax.Y(4), g, ACC, { sw: 4 });
      el('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(3), y2: ax.Y(0), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.0) });
      el('line', { x1: ax.X(3), y1: ax.Y(0), x2: ax.X(3), y2: ax.Y(4), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.2) });
      mono(ax.X(1.5), ax.Y(0) - 8, '3', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) }); mono(ax.X(3) + 8, ax.Y(2), '4', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      mono(ax.X(1.2), ax.Y(2.6), '5', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      mono(480, 100, "vector_norm('[3,4]') → 5.0", { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      mono(480, 140, '√(3² + 4²) = √25 = 5', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
      tx(480, 220, 'norm ≈ 1 이면 정규화된 벡터', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      sub(640, 250, '1 에서 멀면 정규화가 안 된 신호', fade(u, 2.1)); return; }
    if (k === 2 || k === 3) { const cA = mean(GA), cB = mean(GB);
      GA.forEach((p) => el('circle', { cx: ax.X(p[0]), cy: ax.Y(p[1]), r: 7, fill: ACC })); GB.forEach((p) => el('circle', { cx: ax.X(p[0]), cy: ax.Y(p[1]), r: 7, fill: INFO }));
      tx(ax.X(0.4), ax.Y(6.5), "category = 'cat'", { 'font-size': 13.5, fill: ACC, 'font-weight': 700 }); tx(ax.X(3.9), ax.Y(3.0), "category = 'dog'", { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
      [[cA, ACC], [cB, INFO]].forEach(([m, col], i) => { const s0 = k === 2 ? pop(u, 0.8 + i * 0.4) : 1, x = ax.X(m[0]), y = ax.Y(m[1]);
        if (k === 2) (i ? GB : GA).forEach((p) => grow(ax.X(p[0]), ax.Y(p[1]), x, y, E(u, 0.3, 0.8), col, { plain: true, sw: 1.2 }));
        el('path', { d: `M${x - 10 * s0},${y} L${x + 10 * s0},${y} M${x},${y - 10 * s0} L${x},${y + 10 * s0}`, stroke: INK, 'stroke-width': 4 }); });
      mono(480, 80, 'SELECT category, avg(embedding)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(480, 106, 'FROM items GROUP BY category;', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(480, 150, `cat 중심 [${cA[0].toFixed(2)}, ${cA[1].toFixed(2)}]`, { 'font-size': 14.5, fill: ACC, opacity: k === 2 ? fade(u, 1.2) : 1 });
      mono(480, 176, `dog 중심 [${cB[0].toFixed(2)}, ${cB[1].toFixed(2)}]`, { 'font-size': 14.5, fill: INFO, opacity: k === 2 ? fade(u, 1.6) : 1 });
      sub(640, 210, '점 위치는 예시 · 중심은 원소별 평균', k === 2 ? fade(u, 2.0) : 1);
      if (k === 3) { // centroid 에 가까운 대표 + sum
        const best = GA.map((p) => Math.hypot(p[0] - cA[0], p[1] - cA[1])).reduce((b, d, i, arr) => (d < arr[b] ? i : b), 0);
        el('circle', { cx: ax.X(GA[best][0]), cy: ax.Y(GA[best][1]), r: 14 * pop(u, 0.4), fill: 'none', stroke: GOOD, 'stroke-width': 3 });
        tx(480, 256, '중심에 가장 가까운 점 = 대표 문서', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) });
        mono(480, 310, 'sum: [0.10, 0.85, 0.42]', { 'font-size': 14.5, opacity: fade(u, 1.2) }); mono(480, 334, '   + [0.20, 0.75, 0.55]', { 'font-size': 14.5, opacity: fade(u, 1.4) });
        mono(480, 362, '   = [0.30, 1.60, 0.97]', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); }
      return; }
    // k4, k5: 함수형 거리
    el('circle', { cx: ax.X(1), cy: ax.Y(2), r: 7, fill: ACC }); el('circle', { cx: ax.X(4), cy: ax.Y(6), r: 7, fill: INFO });
    el('line', { x1: ax.X(1), y1: ax.Y(2), x2: ax.X(4), y2: ax.Y(6), stroke: ACC, 'stroke-width': 3 });
    mono(ax.X(1) - 10, ax.Y(2) - 10, 'a', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' }); mono(ax.X(4) + 10, ax.Y(6) + 5, 'b', { 'font-size': 15, 'font-weight': 800, fill: INFO });
    const pairs = [['l2_distance(a,b)', '5.0', 'a <-> b', '5.0'], ['inner_product(a,b)', '16.0', 'a <#> b', '−16']];
    pairs.forEach(([f, fv, op, ov], i) => { if (i > k - 4) return; const y = 90 + i * 110, s0 = i === k - 4 ? pop(u, 0.3) : 1;
      card(560, y, 210, 60, { rx: 10, stroke: INFO, s: s0 }); mono(470, y - 4, f, { 'font-size': 14, 'font-weight': 700, opacity: clamp(s0) }); mono(470, y + 19, '→ ' + fv, { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: clamp(s0) });
      tx(685, y + 8, i ? '≠' : '=', { 'font-size': 26, 'font-weight': 800, fill: i ? WARN : GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      card(800, y, 190, 60, { rx: 10, stroke: ACC, s: s0 }); mono(720, y - 4, op, { 'font-size': 14.5, 'font-weight': 700, opacity: clamp(s0) }); mono(720, y + 19, '→ ' + ov, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: clamp(s0) }); });
    if (k === 4) sub(680, 180, '값은 같다', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: GOOD });
    if (k === 5) { sub(680, 290, '부호가 반대다', fade(u, 1.0), { 'font-size': 15, 'font-weight': 700, fill: WARN });
      cross(480, 352, 9, pop(u, 1.5)); tx(500, 358, '함수형은 인덱스를 못 탄다 → KNN 은 연산자로', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); } }

  // 5. 제약 — 차원 상한, 행 크기, TOAST
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const x0 = 60, w = 840, X = (v) => x0 + (v / 16000) * w;
      el('rect', { x: x0, y: 150, width: w * E(u, 0.2, 1.0), height: 40, rx: 6, fill: SOFT, stroke: GRID });
      el('rect', { x: x0, y: 150, width: (X(2000) - x0) * E(u, 0.8, 1.4), height: 40, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
      [0, 2000, 4000, 8000, 16000].forEach((v) => mono(X(v), 215, v.toLocaleString('en-US'), { 'font-size': 14, fill: MUT, 'text-anchor': v === 16000 ? 'end' : 'middle', opacity: fade(u, 0.6) }));
      tx(x0 + 6, 138, '인덱스 가능 ≤ 2,000', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      tx(x0 + w, 138, '저장 최대 16,000', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.8) });
      [[384, GOOD], [1536, GOOD], [3072, WARN]].forEach(([n, col], i) => { const s0 = pop(u, 1.4 + i * 0.25); el('line', { x1: X(n), y1: 145, x2: X(n), y2: 250 + i * 34, stroke: col, 'stroke-width': 2.5, opacity: clamp(s0) });
        mono(X(n) + 6, 262 + i * 34, String(n), { 'font-size': 15, 'font-weight': 800, fill: col, opacity: clamp(s0) }); });
      tx(X(3072) + 60, 362, '3072 는 저장만 · vector 인덱스는 불가', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) });
      sub(X(3072) + 196, 390, '(halfvec 은 4,000 차원까지 인덱스)', fade(u, 2.3)); return; }
    if (k === 1) { cells(80, 90, ['0.12', '0.45', '0.31', '…'], { w: 80, h: 44 });
      const g = E(u, 0.4, 1.2); for (let b = 0; b < 4; b++) card(120 - 30 + b * 20 + 10, 190 + 30 * g, 18, 26, { rx: 3, text: '', stroke: ACC, fill: ACCBG, op: g });
      grow(120, 136, 120, 170, E(u, 0.3, 0.6), ACC); mono(200, 225, 'float32 = 4 B', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      card(620, 120, 140, 48, { rx: 8, text: '헤더 ~8 B', fs: 15, stroke: MUT, s: pop(u, 1.4) });
      tx(480, 320, '1행 ≈ 4·N + 8 바이트', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    const X0 = 220, PX = 600 / 12296, bar = (y, n, lbl0, v, col, g, o) => { o = o || {};
      tx(X0 - 14, y + 18, lbl0, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      el('rect', { x: X0, y, width: Math.max(2, v * PX * g), height: 28, rx: 4, fill: col, opacity: 0.85 });
      mono(X0 + v * PX * g + 10, y + 19, o.text || (v / 1000).toFixed(1) + ' KB', { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: g }); };
    if (k === 2 || k === 3) {
      const pageX = X0 + 8192 * PX, toastX = X0 + 2032 * PX;
      el('line', { x1: pageX, y1: 70, x2: pageX, y2: 290, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); mono(pageX, 62, '8 KB 페이지', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700 });
      bar(110, 384, 'vector(384)', 1544, INFO, 1); bar(170, 1536, 'vector(1536)', 6152, ACC, k === 2 ? E(u, 0.3, 1.2) : 1); bar(230, 3072, 'vector(3072)', 12296, WARN, k === 2 ? E(u, 0.8, 1.8) : 1);
      if (k === 2) { sub(480, 340, '6,152 B ≈ 6.1 KB · 12,296 B ≈ 12.3 KB', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); sub(480, 368, '행 수만큼 그대로 곱해진다', fade(u, 2.3)); return; }
      const tg = E(u, 0.3, 1.0); el('line', { x1: toastX, y1: 70, x2: toastX, y2: 290, stroke: BAD, 'stroke-width': 2.5, opacity: tg }); mono(toastX, 305, 'TOAST 임계 ~2 KB', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: tg });
      zone(560, 320, 360, 80, 'TOAST 테이블 (따로 저장)', { stroke: BAD, fill: 'var(--panel)', color: BAD, op: fade(u, 1.2) });
      fly(X0 + 150, 184, 740, 370, seg(u, 1.3, 2.2), 'embedding', { mono: true, stay: true });
      sub(300, 370, '읽을 때마다 IO 가 한 번 더 붙는다', fade(u, 2.2), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 4) { tx(60, 70, '1536 차원 한 행을 줄이는 법', { 'font-size': 16, 'font-weight': 800 });
      bar(100, 0, 'vector(1536)', 6152, OFF, 1);
      bar(160, 0, '차원 축소 → 512', 2056, ACC, E(u, 0.3, 1.0));
      bar(220, 0, 'halfvec(1536)', 3080, INFO, E(u, 0.8, 1.5));
      bar(280, 0, 'bit(1536)', 200, GOOD, E(u, 1.3, 2.0), { text: '0.2 KB (1비트)' });
      sub(480, 370, '셋 다 정확도를 조금 내주고 크기를 크게 줄인다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    // k5: 임베딩 전용 표 분리
    tbl(40, 100, 'items', [{ n: 'id', w: 50, k: 'pk' }, { n: 'name', w: 150, k: 'txt' }, { n: 'price', w: 90, k: 'txt' }], [[1, "'AI 문서'", '12000'], [2, "'cat photo'", '0']], { op: fade(u, 0.2) });
    tbl(520, 100, 'item_embeddings', [{ n: 'item_id', w: 100, k: 'fk' }, { n: 'embedding', w: 250, k: 'vec' }], [[1, '[1536개 float]'], [2, '[1536개 float]']],
      { op: fade(u, 0.7), cell: (i, j) => (j === 1 ? { color: ACC, bold: true } : {}) });
    grow(520, 145, 335, 145, E(u, 1.0, 1.5), INFO); grow(520, 177, 335, 177, E(u, 1.1, 1.6), INFO);
    sub(185, 250, '본문 조회는 TOAST 를 건드리지 않는다', fade(u, 1.8), { 'font-weight': 700, fill: GOOD }); sub(695, 250, '벡터 검색만 이 표를 읽는다', fade(u, 2.0)); }

  const quiz = [
    { q: 'embedding vector(1536) 컬럼에 대한 설명으로 맞는 것은 무엇인가?',
      o: ['행마다 길이가 달라도 된다', '모든 행이 1536개 float를 담아야 하고, 모델을 바꾸면 컬럼을 다시 만든다', '1536은 최대 길이라 더 짧은 벡터도 들어간다'], a: 1,
      why: 'N은 컬럼에 고정된다. MiniLM으로 바꾸면 vector(384)가 필요해 ALTER TABLE로 컬럼을 다시 만들어야 한다.' },
    { q: "vector(3) 컬럼에 '[0.1, 0.2]'를 INSERT하면 어떻게 되는가?",
      o: ['ERROR가 나고 행이 생기지 않는다', '빈 칸을 0으로 채워 저장한다', '경고만 내고 2차원으로 저장한다'], a: 0,
      why: 'expected 3 dimensions, not 2 에러로 거절된다. 경고가 아니라서 행 자체가 생기지 않는다.' },
    { q: '[1,2]와 [4,6]에 대해 <=> 결과가 0에 가까운 이유는 무엇인가?',
      o: ['두 점 사이 직선 거리가 짧아서', '두 벡터의 내적이 0이어서', '두 화살표의 방향이 거의 같아서'], a: 2,
      why: '코사인 거리는 길이를 무시하고 각도만 본다. 두 벡터 사이 각은 약 7.1°라 거리는 0.008이다. 직선 거리는 5다.' },
    { q: 'KNN 쿼리에 l2_distance(a, b) 대신 a <-> b를 써야 하는 이유는 무엇인가?',
      o: ['l2_distance는 결과 값이 달라서', '함수형 표기는 인덱스를 타지 못해서', 'l2_distance는 3차원까지만 지원해서'], a: 1,
      why: '두 표기는 같은 5.0을 돌려주지만, 인덱스는 연산자에만 걸린다.' },
    { q: 'vector(1536) 한 행이 TOAST로 빠지는 이유는 무엇인가?',
      o: ['약 6.1 KB라서 TOAST 임계 약 2 KB를 넘기 때문', 'HNSW 인덱스가 걸린 컬럼은 늘 따로 저장되어서', '1536이 2,000 차원 제한을 넘기 때문'], a: 0,
      why: '4·1536 + 8 = 6,152바이트다. 약 2 KB를 넘는 행은 큰 값이 별도 저장소로 빠져 읽을 때 IO가 더 든다.' },
  ];
  const summary = [
    'vector(N)의 N은 컬럼에 고정되고 다른 길이의 INSERT는 에러로 거절된다.',
    "값은 '[…]' 텍스트를 캐스트하거나 register_vector 뒤 ndarray를 그대로 넘겨 넣는다.",
    '<->는 직선 거리, <=>는 각도, <#>는 음의 내적이고 인덱스 ops class와 짝이 맞아야 한다.',
    '1536차원 한 행은 약 6.1 KB라 TOAST로 빠지고, 축소·halfvec·양자화로 줄인다.',
  ];
  const review = [
    { q: '임베딩 모델을 text-embedding-3-small에서 all-MiniLM-L6-v2로 바꿨더니 INSERT가 전부 실패한다. 먼저 할 일은?',
      o: ['INSERT 문의 ::vector 캐스트를 지운다', '컬럼을 vector(384)로 다시 만들고 기존 행의 임베딩도 새 모델로 다시 만든다', 'vector_norm으로 길이를 맞춘다'], a: 1,
      why: '1536 컬럼에 384 길이 벡터는 들어가지 않는다. 다른 모델의 벡터는 서로 비교할 수도 없어 기존 행도 다시 만들어야 한다.' },
    { q: 'vector_l2_ops로 HNSW 인덱스를 만들었는데 ORDER BY embedding <=> q 쿼리가 느리다. 원인은?',
      o: ['연산자와 ops class가 맞지 않아 인덱스를 타지 않는다', 'LIMIT이 너무 작다', 'HNSW는 원래 코사인을 지원하지 않는다'], a: 0,
      why: 'L2 인덱스는 <-> 쿼리에만 걸린다. 코사인 쿼리를 쓰려면 vector_cosine_ops 인덱스를 따로 만든다.' },
    { q: '3072차원 임베딩을 저장하고 인덱스까지 걸고 싶다. 가장 알맞은 방법은?',
      o: ['vector(3072) 그대로 HNSW를 건다', 'TOAST를 끈다', 'halfvec으로 바꾸거나 차원을 줄여 인덱스 한도 안에 넣는다'], a: 2,
      why: 'vector 인덱스는 2,000차원까지다. halfvec은 4,000차원까지 인덱스가 되고 크기도 절반이다.' },
  ];

  R.page({ title: 'pgvector 데이터 모델', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
