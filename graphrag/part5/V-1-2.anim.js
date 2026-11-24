/* V-1-2 LangChain GraphRAG 통합 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   영화 그래프는 예시 데이터다. (Scorsese)-[:DIRECTED]->(m)<-[:ACTED_IN]-(DiCaprio) 매칭은 networkx 3.7 로 같은 그래프를 만들어
   직접 세어 영화 3편 · 엣지 6개를 확인했다. 유사도 점수·LLM 답변은 페이지의 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, check, cross, hbar, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const exam = (x, y, op) => pill(x, y, '예시', WARN, 1, { fs: 13.5, op: op ?? 1 });

  // ---------- 그래프 도우미 ----------
  const TYPE = { Person: [ACC, ACCBG], Movie: [INFO, INFOBG], Chunk: [WARN, WARNBG] };
  function gnode(x, y, name, o) { o = o || {}; const [col, bg] = TYPE[o.t || 'Person'], s = o.s ?? 1; if (s <= 0.02) return;
    const r = o.r || 16, g = G(x, y, s, o.op);
    if (o.hot) el('circle', { cx: 0, cy: 0, r: r + 7, fill: 'none', stroke: col, 'stroke-width': 2, opacity: 0.6 }, g);
    if (o.t === 'Chunk') el('rect', { x: -r, y: -r * 0.75, width: r * 2, height: r * 1.5, rx: 4, fill: bg, stroke: col, 'stroke-width': 2 }, g);
    else el('circle', { cx: 0, cy: 0, r, fill: bg, stroke: col, 'stroke-width': 2.2 }, g);
    if (name) tx(o.nx || 0, o.ny ?? r + 17, name, { 'text-anchor': o.anchor || 'middle', 'font-size': o.fs || 14, 'font-weight': 700, fill: o.color || INK }, g); }
  function gedge(a, b, u, o) { o = o || {}; if (u <= 0) return; const r = o.r || 17, d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
    const sx = a[0] + ux * r, sy = a[1] + uy * r, ex = b[0] - ux * (r + 2), ey = b[1] - uy * (r + 2);
    if (o.arrow) grow(sx, sy, ex, ey, u, o.col || MUT, { sw: o.sw || 2, dash: o.dash, op: o.op });
    else el('line', { x1: sx, y1: sy, x2: lerp(sx, ex, clamp(u)), y2: lerp(sy, ey, clamp(u)), stroke: o.col || GRID, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    if (o.rel && u > 0.6) { const mx = (sx + ex) / 2 + (o.lx || 0), my = (sy + ey) / 2 + (o.ly || 0), w = tw(o.rel, 13.5) + 8, op = seg(u, 0.6, 1) * (o.op ?? 1);
      el('rect', { x: mx - w / 2, y: my - 10, width: w, height: 20, rx: 4, fill: PANEL, opacity: op }); mono(mx, my + 5, o.rel, { 'font-size': 13.5, 'text-anchor': 'middle', fill: o.col || MUT, 'font-weight': 700, opacity: op }); } }

  // 예시 영화 그래프
  const P = { sco: [110, 120, 'Scorsese', 'Person'], dic: [110, 330, 'DiCaprio', 'Person'], dn: [330, 380, 'De Niro', 'Person'], cam: [330, 70, 'Cameron', 'Person'],
    dep: [280, 170, 'The Departed', 'Movie'], shu: [280, 225, 'Shutter Island', 'Movie'], wol: [280, 280, 'Wolf of Wall St.', 'Movie'], goo: [470, 330, 'Goodfellas', 'Movie'], tit: [470, 120, 'Titanic', 'Movie'] };
  const RELS = [['sco', 'dep', 'DIRECTED'], ['sco', 'shu', 'DIRECTED'], ['sco', 'wol', 'DIRECTED'], ['sco', 'goo', 'DIRECTED'], ['cam', 'tit', 'DIRECTED'],
    ['dic', 'dep', 'ACTED_IN'], ['dic', 'shu', 'ACTED_IN'], ['dic', 'wol', 'ACTED_IN'], ['dic', 'tit', 'ACTED_IN'], ['dn', 'goo', 'ACTED_IN']];
  const MATCH = ['dep', 'shu', 'wol'];
  function movies(o) { o = o || {}; const at = (k) => [P[k][0] + (o.dx || 0), P[k][1]];
    RELS.forEach(([a, b, r], i) => { const hot = o.path && (a === 'sco' || a === 'dic') && MATCH.includes(b);
      gedge(at(a), at(b), o.path && hot ? clamp(o.path * 6 - (a === 'sco' ? MATCH.indexOf(b) : 3 + MATCH.indexOf(b))) : 1,
        { arrow: true, col: hot ? ACC : o.relCol || GRID, sw: hot ? 3 : 2, op: o.path && !hot ? 0.35 : o.relOp ?? 1, dash: o.dashRel ? '5 5' : null }); });
    Object.keys(P).forEach((k) => { const [, , nm, t] = P[k], [x, y] = at(k), on = o.path && (k === 'sco' || k === 'dic' || MATCH.includes(k));
      gnode(x, y, nm, { t, hot: on && o.path > 0.9, op: o.path && !on ? 0.35 : o.op ?? 1, nx: t === 'Movie' ? 24 : 0, ny: t === 'Movie' ? 5 : 33, anchor: t === 'Movie' ? 'start' : 'middle', r: t === 'Movie' ? 13 : 16 }); }); }

  // ---------- 1. 벡터 검색만: 임베딩 공간에서 가까운 청크 3개 ----------
  const CH = [['c-101', 0.89, 470, 165], ['c-204', 0.84, 520, 245], ['c-318', 0.81, 395, 255], ['c-077', 0, 620, 110], ['c-412', 0, 640, 320], ['c-150', 0, 330, 120], ['c-260', 0, 600, 205]];
  const QP = [455, 225];
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { // 그래프 쪽: 기존 Neo4j + Chunk 노드
      movies({ dx: 0, relOp: k === 0 ? 0.4 : 1, op: k === 0 ? 0.5 : 1 });
      if (k === 0) { card(760, 120, 260, 56, { rx: 10, stroke: INFO, sw: 2.2, fill: INFOBG, text: 'OpenAIEmbeddings', fs: 15, mono: true, s: pop(u, 0.3) });
        sub(760, 168, 'text-embedding-3-small', fade(u, 0.7), { 'font-size': 14 });
        tx(760, 260, '관계는 아직 쓰지 않는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); return; }
      R.dbIcon(760, 110, 'bolt://localhost:7687', { s: k === 1 ? pop(u, 0.2) : 1 });
      pill(760, 230, 'vector index: movie_chunks', ACC, k === 1 ? pop(u, 1.0) : 1, { mono: true, fs: 13.5 });
      if (k === 1) tx(760, 290, '이미 있는 그래프에 얹는다 · 한 번만', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5) });
      if (k === 2) { [['c-101', 600, 330], ['c-204', 680, 330], ['c-318', 760, 330]].forEach(([nm, x, y], i) => { gnode(x, y, nm, { t: 'Chunk', s: pop(u, 0.2 + i * 0.2), r: 18 });
          grow(x, y - 30, x, y - 58, seg(u, 0.8 + i * 0.2, 1.2 + i * 0.2), WARN); });
        mono(680, 252, '.text → .embedding', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
        tx(860, 336, ':Chunk', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.6) }); }
      return; }
    // 임베딩 공간 (2D 그림, 거리는 점수 순서만 맞춘 예시)
    el('rect', { x: 290, y: 70, width: 380, height: 300, rx: 12, fill: SOFT });
    tx(304, 92, '임베딩 공간 (그림)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    CH.forEach(([id, sc, x, y], i) => gnode(x, y, id, { t: 'Chunk', r: 12, fs: 13.5, s: k === 3 ? pop(u, 0.2 + i * 0.1) : 1, ny: 26 }));
    if (k >= 4) { gnode(QP[0], QP[1], null, { s: k === 4 ? pop(u, 0.2) : 1, r: 10 }); tx(QP[0] - 14, QP[1] + 5, 'Q', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: 1 }); }
    if (k === 3) { el('circle', { cx: QP[0], cy: QP[1] + 10, r: 85 * E(u, 0.8, 1.6), fill: 'none', stroke: ACC, 'stroke-dasharray': '6 5', 'stroke-width': 2 });
      mono(780, 200, 'k = 3', { 'font-size': 24, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(780, 236, '가장 가까운 청크 3개', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) }); }
    const got = k - 3; // k4:1, k5:2, k6:3
    CH.slice(0, 3).forEach(([id, sc, x, y], i) => { if (i >= got) return; const now = i === got - 1, g = now ? E(u, 0.4, 1.2) : 1;
      el('line', { x1: QP[0], y1: QP[1], x2: lerp(QP[0], x, g), y2: lerp(QP[1], y, g), stroke: ACC, 'stroke-width': 2.5 });
      const yy = 110 + i * 56; mono(700, yy, id, { 'font-size': 15, 'font-weight': 700, opacity: now ? fade(u, 1.0) : 1 });
      hbar(770, yy - 14, 110, sc, 1, { u: now ? E(u, 1.0, 1.8) : 1, text: sc.toFixed(2), col: ACC }); });
    if (k === 4) card(480, 400, 360, 30, { rx: 6, stroke: 'none', fill: PANEL, text: '"마틴 스콜세지 영화 줄거리는?"', fs: 14.5, s: fade(u, 0.3) });
    if (k === 5) tx(790, 300, 'chunk_id · 본문 60자 순서대로', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
    if (k === 6) { tx(790, 300, '관계 정보는 한 줄도 안 쓰였다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); cross(790, 340, 12, pop(u, 1.8)); }
    if (k >= 4) exam(870, 400, k === 4 ? fade(u, 1.6) : 1); }

  // ---------- 2. 한계: 유사한 글은 오지만 경로는 밟지 않는다 ----------
  function s2(t, c) { const { k, u } = c;
    // 왼쪽: 가져온 청크
    const chunks = [['c-101', '스콜세지 영화는 폭력과 구원을…'], ['c-204', '굿펠라스(1990)는 갱스터 회고록…']];
    chunks.forEach(([id, txt], i) => { const y = 100 + i * 70, s = k === 0 && i ? fade(u, 0.6) : 1; if (k === 0 && i) return;
      el('rect', { x: 30, y: y - 26, width: 330, height: 52, rx: 8, fill: WARNBG, stroke: WARN, 'stroke-width': 1.6, opacity: s });
      mono(44, y - 5, id, { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: s }); tx(44, y + 16, txt, { 'font-size': 14, opacity: s }); });
    // 체인
    const chainOp = k === 0 ? fade(u, 0.8) : 1;
    card(200, 250, 300, 50, { rx: 10, stroke: INK, sw: 2, text: 'RetrievalQA · gpt-4o-mini', fs: 15, op: chainOp });
    if (k >= 1) pill(200, 296, 'return_source_documents', ACC, k === 1 ? pop(u, 0.4) : 1, { mono: true, fs: 13.5 });
    if (k >= 2) card(200, 368, 340, 46, { rx: 8, stroke: ACC, sw: 2, text: '디카프리오와 함께 만든 영화는 몇 편?', fs: 14.5, s: k === 2 ? pop(u, 0.2) : 1 });
    if (k === 2) tx(200, 412, '개수를 세는 질문', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1) });
    // 오른쪽: 그래프 경로(밟지 않음)
    if (k >= 3 && k <= 4) { const col = k === 4 ? BAD : MUT, gp = k === 4 ? E(u, 0.2, 1.4) : 1;
      gnode(540, 120, 'Scorsese', {}); gnode(540, 320, 'DiCaprio', {});
      [160, 220, 280].forEach((y, i) => { gnode(760, y, '?', { t: 'Movie', r: 14, nx: 24, ny: 5, anchor: 'start', fs: 15, color: col });
        gedge([540, 120], [760, y], clamp(gp * 3 - i), { arrow: true, col, dash: '6 5', rel: i === 0 ? 'DIRECTED' : null, ly: -16, lx: -20 });
        gedge([540, 320], [760, y], clamp(gp * 3 - i), { arrow: true, col, dash: '6 5', rel: i === 2 ? 'ACTED_IN' : null, ly: 16, lx: -20 }); });
      if (k === 3) { el('rect', { x: 470, y: 372, width: 440, height: 34, rx: 6, fill: BADBG, opacity: fade(u, 0.3) });
        tx(690, 394, '"일부에 등장합니다…" · 편수 없음', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) }); exam(880, 70, fade(u, 0.8)); }
      if (k === 4) tx(690, 394, '이 경로를 밟지 않는다 · 유사도만 본다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) }); }
    if (k === 5) { ['① 관계 traversal 없음', '② 인용 근거 부족', '③ 집계 질문 약함'].forEach((s0, i) => pill(690, 110 + i * 56, s0, BAD, pop(u, 0.2 + i * 0.3), { fs: 15 }));
      banner(690, 330, '결론: 벡터 + 그래프 둘 다 필요', pop(u, 1.4)); } }

  // ---------- 3. GraphCypherQAChain: 자연어 → Cypher → 경로 ----------
  const CY = ['MATCH (d:Person {name:"Martin Scorsese"})', '      -[:DIRECTED]->(m:Movie)', '      <-[:ACTED_IN]-(a:Person {name:"Leonardo DiCaprio"})', 'RETURN m.title'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { [['Neo4jGraph', INFO], ['GraphCypherQAChain', ACC]].forEach(([s0, col], i) => card(300 + i * 360, 160, 280, 60, { rx: 10, stroke: col, sw: 2.5, text: s0, fs: 17, mono: true, color: col, s: pop(u, 0.2 + i * 0.4) }));
      grow(442, 160, 518, 160, seg(u, 0.9, 1.4), ACC);
      tx(480, 290, '벡터 청크 대신 Cypher 로 그래프를 직접 읽는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    if (k === 1 || k === 2) { // 스키마
      tx(60, 90, 'refresh_schema() 가 모은 스키마', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      gnode(180, 220, ':Person', { r: 36, s: k === 1 ? pop(u, 0.2) : 1, ny: 6, fs: 15, color: ACC }); gnode(560, 220, ':Movie', { t: 'Movie', r: 36, s: k === 1 ? pop(u, 0.5) : 1, ny: 6, fs: 15, color: INFO });
      const g1 = k === 1 ? seg(u, 0.8, 1.4) : 1, g2 = k === 1 ? seg(u, 1.2, 1.8) : 1;
      el('path', { d: 'M215,200 Q370,140 522,200', fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: g1, 'marker-end': 'url(#ra-ahb)' }); mono(370, 158, 'DIRECTED', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: g1 });
      el('path', { d: 'M215,240 Q370,300 522,240', fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: g2, 'marker-end': 'url(#ra-ahb)' }); mono(370, 296, 'ACTED_IN', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: g2 });
      mono(180, 290, '{name}', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: g1 }); mono(560, 290, '{title, released}', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: g2 });
      if (k === 2) ['verbose=True', 'return_intermediate_steps=True', 'allow_dangerous_requests=True'].forEach((s0, i) => pill(800, 140 + i * 56, s0, i === 2 ? WARN : INK, pop(u, 0.2 + i * 0.35), { mono: true, fs: 13.5 }));
      if (k === 2) tx(800, 330, 'LLM 이 만든 쿼리를 그대로 실행한다', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, opacity: fade(u, 1.5) });
      return; }
    if (k === 3) { card(220, 160, 340, 56, { rx: 10, stroke: ACC, sw: 2, text: '스콜세지가 디카프리오와 함께 만든 영화는?', fs: 14.5, s: pop(u, 0.2) });
      card(480, 280, 150, 56, { rx: 10, stroke: INK, sw: 2, text: 'LLM 통역', fs: 15, s: pop(u, 0.7) }); grow(300, 192, 430, 252, seg(u, 0.6, 1.1), MUT);
      el('rect', { x: 600, y: 120, width: 320, height: 110, rx: 8, fill: INK, opacity: fade(u, 1.3) }); mono(620, 160, 'MATCH … RETURN', { 'font-size': 16, fill: PANEL, opacity: fade(u, 1.5) });
      grow(560, 260, 640, 236, seg(u, 1.1, 1.5), MUT); tx(760, 290, '사용자는 Cypher 를 몰라도 된다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) }); return; }
    // k4~6: Cypher 와 경로
    const cyShow = k === 4 ? E(u, 0.2, 1.6) * CY.length : CY.length;
    el('rect', { x: 540, y: 70, width: 400, height: 128, rx: 8, fill: INK });
    CY.forEach((l, i) => { const part = i < Math.floor(cyShow) ? l : i === Math.floor(cyShow) ? l.slice(0, Math.round(l.length * (cyShow % 1))) : ''; mono(552, 98 + i * 26, part.replace('Leonardo DiCaprio', 'L. DiCaprio'), { 'font-size': 13.5, fill: 'var(--term)' }); });
    movies({ dx: 0, path: k === 4 ? 0 : k === 5 ? E(u, 0.2, 1.8) : 1 });
    if (k === 4) { el('circle', { cx: P.sco[0], cy: P.sco[1], r: 26 * pop(u, 1.4), fill: 'none', stroke: ACC, 'stroke-width': 3 }); }
    if (k >= 5) { R.meters(560, 230, 360, [{ name: 'row (영화)', val: '3' }, { name: '매칭된 엣지', val: '6' }]);
      sub(740, 330, '예시 그래프를 networkx 로 세어 확인', k === 5 ? fade(u, 1.8) : 1, { 'font-size': 13.5 }); }
    if (k === 6) { check(580, 370, 10, pop(u, 0.3)); tx(600, 376, '관계·집계는 정확', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.4) });
      cross(760, 370, 9, pop(u, 0.8)); tx(780, 376, '줄거리 본문은 없음', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) }); } }

  // ---------- 4. HybridChain: 두 자리에 두 컨텍스트 ----------
  function slot(x, y, w, h, name, col, fill, op) { el('rect', { x, y, width: w, height: h, rx: 8, fill: fill || PANEL, stroke: col, 'stroke-width': 2, 'stroke-dasharray': fill ? null : '6 5', opacity: op });
    mono(x + 12, y + 22, name, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: op }); }
  function s4(t, c) { const { k, u } = c;
    // 가운데: 프롬프트 템플릿
    const TX = 330, op = k === 0 ? 0 : k === 1 ? fade(u, 0.2) : 1;
    if (k === 0) { card(480, 170, 260, 64, { rx: 10, stroke: INK, sw: 2.5, text: '합성용 LLM · gpt-4o-mini', fs: 15, s: pop(u, 0.3) });
      [['vector_store', 230], ['cypher_chain', 730]].forEach(([s0, x], i) => pill(x, 290, s0, i ? ACC : WARN, pop(u, 0.8 + i * 0.3), { mono: true, fs: 14 }));
      tx(480, 360, '검색기 둘은 앞 단계 것을 그대로 쓴다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) }); return; }
    el('rect', { x: TX - 20, y: 60, width: 340, height: 330, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: op });
    mono(TX, 84, 'PROMPT', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op });
    const filledV = k >= 3, filledG = k >= 4;
    slot(TX, 96, 300, 86, '{vector_chunks}', WARN, filledV ? WARNBG : null, k === 1 ? fade(u, 0.5) : 1);
    slot(TX, 196, 300, 86, '{graph_facts}', ACC, filledG ? ACCBG : null, k === 1 ? fade(u, 1.0) : 1);
    if (k >= 2) slot(TX, 296, 300, 50, '{question}', INK, k >= 5 ? SOFT : null, k === 2 ? fade(u, 0.3) : 1);
    if (k >= 2) mono(TX, 372, 'Answer:', { 'font-size': 14, fill: MUT, opacity: k === 2 ? fade(u, 0.8) : 1 });
    if (filledV) { ['c-101 후기 작품은 디카프리오와…', 'c-318 디파티드(2006)는 보스턴…'].forEach((s0, i) => tx(TX + 12, 148 + i * 22, s0, { 'font-size': 13.5, opacity: k === 3 ? fade(u, 1.2 + i * 0.2) : 1 }));
      if (k === 3) { fly(90, 140, TX + 150, 140, seg(u, 0.3, 1.2), 'similarity_search(k=3)', { fill: WARN, mono: true }); } }
    if (filledG) { ['디파티드 · 셔터 아일랜드', '울프 오브 월스트리트'].forEach((s0, i) => tx(TX + 12, 248 + i * 22, s0, { 'font-size': 14, opacity: k === 4 ? fade(u, 1.2 + i * 0.2) : 1 }));
      if (k === 4) fly(870, 240, TX + 150, 240, seg(u, 0.3, 1.2), 'cypher_chain.invoke', { fill: ACC, mono: true }); }
    // 오른쪽: 인용 노드 (k>=4)
    if (k >= 4) { const s = k === 4 ? fade(u, 1.4) : 1; [['p-1 Scorsese', ACC], ['p-2 DiCaprio', ACC], ['m-1·m-2·m-3', INFO]].forEach(([s0, col], i) => card(800, 120 + i * 40, 180, 30, { rx: 15, stroke: col, sw: 1.6, text: s0, fs: 13.5, color: col, mono: true, op: s }));
      tx(800, 250, 'intermediate_steps', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s }); }
    if (k >= 3) { [['c-101', 0.89], ['c-318', 0.81]].forEach(([id, sc], i) => { const s = k === 3 ? fade(u, 1.3) : 1; card(150, 120 + i * 40, 150, 30, { rx: 15, stroke: WARN, sw: 1.6, text: `${id} · ${sc}`, fs: 13.5, mono: true, color: WARN, op: s }); }); }
    if (k === 5) { grow(TX + 320, 225, 770, 330, seg(u, 0.5, 1.2), INK); card(840, 350, 160, 50, { rx: 10, stroke: INK, sw: 2.5, text: '메시지 1개', fs: 15, s: pop(u, 1.2) });
      tx(150, 300, '두 컨텍스트 → 한 메시지', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 6) { el('rect', { x: 680, y: 300, width: 260, height: 100, rx: 8, fill: INK, opacity: fade(u, 0.2) });
      ['{', '  "answer": …,', '  "vec_docs": [2],', '  "cited": [...] }'].forEach((l, i) => mono(694, 322 + i * 21, l, { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.3 + i * 0.2) }));
      tx(150, 300, '답과 근거를 같이 돌려준다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); } }

  // ---------- 5. 출력: 답 + 인용 그래프 ----------
  const NODES5 = [['p-1', 'Person', 'Scorsese', 640, 120], ['p-2', 'Person', 'DiCaprio', 640, 330], ['m-1', 'Movie', 'The Departed', 800, 160], ['m-2', 'Movie', 'Shutter Island', 800, 225], ['m-3', 'Movie', 'Wolf of Wall St.', 800, 290]];
  function s5(t, c) { const { k, u } = c;
    // 왼쪽: 스키마 카드
    const models = [['CitedNode', ['id', 'label', 'name'], ACC], ['CitedEdge', ['src', 'dst', 'type'], INFO], ['HybridResponse', ['answer', 'vector_chunks', 'cited_nodes', 'cited_edges'], INK]];
    models.forEach(([nm, fields, col], i) => { if (i > k) return; const y = 70 + [0, 98, 196][i], h = 34 + fields.length * 0 + 52, now = i === k, s = now ? pop(u, 0.2) : 1;
      const w = 270; el('rect', { x: 30, y, width: w, height: i === 2 ? 124 : 82, rx: 8, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: s });
      mono(44, y + 22, 'class ' + nm, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: s });
      fields.forEach((f, j) => { const filled = i === 2 && (j === 0 ? k >= 4 : j === 1 ? k >= 5 : k >= 6);
        const fx = i === 2 ? 44 : 44 + j * 80, fy = i === 2 ? y + 46 + j * 20 : y + 54;
        mono(fx, fy, f + (filled ? ' ✓' : ''), { 'font-size': 14, fill: filled ? GOOD : INK, 'font-weight': filled ? 700 : 400, opacity: now ? fade(u, 0.4 + j * 0.2) : 1 }); }); });
    if (k <= 1) { if (k === 1) { gnode(400, 200, 'src', { s: pop(u, 0.6) }); gnode(520, 200, 'dst', { t: 'Movie', s: pop(u, 0.8) }); gedge([400, 200], [520, 200], seg(u, 1.0, 1.6), { arrow: true, col: INFO, rel: 'type', ly: -18 }); }
      if (k === 0) tx(480, 380, '프런트가 그대로 그릴 수 있는 세 필드', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1) }); return; }
    if (k === 2) { tx(600, 330, '답 하나에 근거 세 묶음이 붙는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1) }); return; }
    // k3~: row → 노드·엣지
    if (k === 3) { el('rect', { x: 330, y: 80, width: 200, height: 92, rx: 8, fill: INK }); ['context rows', '{m.title: …} × 3'].forEach((l, i) => mono(344, 110 + i * 26, l, { 'font-size': 14, fill: 'var(--term)' })); grow(535, 126, 600, 150, seg(u, 0.3, 0.8), MUT);
      mono(430, 200, 'intermediate_steps[1]', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4) }); }
    const at = (id) => { const n = NODES5.find((x) => x[0] === id); return [n[3], n[4]]; };
    const ge = k === 3 ? seg(u, 1.0, 2.2) : 1;
    ['m-1', 'm-2', 'm-3'].forEach((m, i) => { gedge(at('p-1'), at(m), clamp(ge * 6 - i), { arrow: true, col: ACC }); gedge(at('p-2'), at(m), clamp(ge * 6 - 3 - i), { arrow: true, col: INFO }); });
    NODES5.forEach(([id, t, nm, x, y], i) => gnode(x, y, nm, { t, r: t === 'Movie' ? 13 : 16, s: k === 3 ? pop(u, 0.5 + i * 0.12) : 1, nx: t === 'Movie' ? 20 : 0, ny: t === 'Movie' ? 5 : -24, anchor: t === 'Movie' ? 'start' : 'middle', fs: 13.5 }));
    if (k === 3) { mono(700, 400, '노드 5 · 엣지 6', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2) }); }
    if (k >= 4) { const s = k === 4 ? fade(u, 0.3) : 1; el('rect', { x: 330, y: 340, width: 600, height: 56, rx: 8, fill: GOODBG, opacity: s });
      tx(346, 364, '이 그래프에서 함께 만든 영화는 디파티드, 셔터 아일랜드,', { 'font-size': 14, opacity: s }); tx(346, 386, '더 울프 오브 월스트리트 3편이다.', { 'font-size': 14, opacity: s }); exam(890, 368, s); }
    if (k >= 5) [['c-101', 0.89], ['c-318', 0.81]].forEach(([id, sc], i) => card(420, 100 + i * 40, 160, 30, { rx: 15, stroke: WARN, sw: 1.6, text: `${id} · ${sc}`, fs: 13.5, color: WARN, mono: true, s: k === 5 ? pop(u, 0.3 + i * 0.3) : 1 }));
    if (k >= 6) mono(420, 200, 'cited 5 · 6', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: k === 6 ? fade(u, 0.4) : 1 });
    if (k === 7) { banner(480, 255, '"이 답 어디서 왔어?" 에 바로 답한다', pop(u, 0.4)); } }

  const quiz = [
    { q: 'Neo4jVector retriever(k=3)가 질문에 돌려주는 것은 무엇인가?',
      o: ['질문과 임베딩이 가장 가까운 청크 3개', '질문과 관계로 이어진 노드 3개', 'Cypher 쿼리 결과 3행'], a: 0,
      why: 'Chunk.text를 임베딩해 둔 vector index에서 KNN으로 c-101(0.89)·c-204(0.84)·c-318(0.81)을 가져온다. 그래프 관계는 쓰지 않는다.' },
    { q: '"디카프리오와 함께 만든 영화는 몇 편?" 에 벡터 RAG가 답을 흐린 까닭은 무엇인가?',
      o: ['gpt-4o-mini가 작은 모델이라서', 'k=3이 너무 커서', '비슷한 글만 가져오고 DIRECTED·ACTED_IN 경로를 밟지 않아서'], a: 2,
      why: '개수를 세려면 감독과 배우를 영화로 잇는 경로를 따라가야 한다. 유사도 검색은 그 경로를 모른다.' },
    { q: 'GraphCypherQAChain이 Cypher를 쓰기 위해 LLM에 보여 주는 것은 무엇인가?',
      o: ['refresh_schema로 모은 라벨·관계·속성 스키마', '그래프의 모든 노드 데이터', '벡터 청크 상위 3개'], a: 0,
      why: 'LLM은 :Person, :Movie, DIRECTED, ACTED_IN 같은 스키마를 보고 MATCH 패턴을 만든다. 실행은 체인이 Neo4j에서 한다.' },
    { q: 'HybridChain 프롬프트에 자리가 두 개 있는 까닭은 무엇인가?',
      o: ['질문을 두 번 넣으려고', '벡터 청크(설명·줄거리)와 그래프 사실(관계·집계)을 나눠 담으려고', '두 LLM에 따로 보내려고'], a: 1,
      why: '{vector_chunks}에는 similarity_search 결과, {graph_facts}에는 cypher_chain 결과가 들어간다. 둘을 한 메시지로 합쳐 LLM 하나에 보낸다.' },
    { q: 'GraphCypherQAChain의 intermediate_steps에서 실행 결과 row는 어디에 있는가?',
      o: ['intermediate_steps[0]["query"]', 'intermediate_steps[1]["context"]', 'result["answer"]'], a: 1,
      why: '0번에는 생성된 Cypher(query), 1번에는 실행 결과(context)가 담긴다. 그 row를 노드 5개·엣지 6개로 쪼갠다.' },
  ];

  const summary = [
    '벡터 검색은 질문과 비슷한 청크를 잘 찾지만 관계를 따라가는 질문에는 답을 흐린다.',
    '편수를 세거나 두 사람을 잇는 질문은 DIRECTED와 ACTED_IN 경로를 밟아야 풀린다.',
    'GraphCypherQAChain은 스키마를 본 LLM이 Cypher를 쓰고 체인이 실행해 정확한 row를 받는다.',
    '두 결과를 한 프롬프트에 합치고 쓴 청크와 노드·엣지를 응답에 같이 담으면 출처를 검증할 수 있다.',
  ];
  const review = [
    { q: '사용자가 "이 감독 영화의 분위기는?" 과 "이 감독과 이 배우의 공동 작품 수는?" 을 섞어 묻는다. 맞는 구성은?',
      o: ['벡터 retriever만', 'Cypher 체인만', '벡터 청크와 Cypher 결과를 한 프롬프트에 합친다'], a: 2,
      why: '분위기는 본문 텍스트에, 작품 수는 그래프 경로에 있다. 두 컨텍스트를 각 자리에 넣어 합치는 것이 HybridChain이다.' },
    { q: 'Cypher 체인이 0행을 돌려줬다. 먼저 의심할 것은?',
      o: ['Cypher의 라벨·이름 표기가 데이터와 다르다', '벡터 인덱스의 k가 너무 작다', '임베딩 모델 버전이 오래됐다'], a: 0,
      why: 'Cypher는 라벨·관계·속성 값이 정확히 맞아야 매칭된다. verbose 로그에 찍힌 쿼리부터 확인한다.' },
    { q: '운영 중 "이 답 어디서 왔어?" 라는 문의가 왔다. 응답에 미리 담아 둘 것은?',
      o: ['답변 문자열만', '사용한 청크 id·점수와 인용 노드·엣지', 'LLM 모델 이름'], a: 1,
      why: 'HybridResponse처럼 vector_chunks와 cited_nodes·cited_edges를 같이 돌려주면 근거를 바로 보여 줄 수 있다.' },
  ];

  R.page({ title: '벡터 + 그래프 결합', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
