/* I-1-2 RAG vs GraphRAG 비교 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 청크 점수(0.92 · 0.81 …)와 정확도 표(90% · 40% …)는 페이지가 든 예시 값이다(bge-m3 를 실제로 돌린 값이 아니다).
 * hop 수(본사 1 hop, 시장 2 hop)는 networkx 로 같은 그래프를 만들어 확인했다. LLM 응답 문장은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, axes, line, scatter, hbar, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 그래프 부품 ----------
  const NW = (n) => tw(n.label, 15) + 30;
  function gnode(n, o) { o = o || {}; const s = o.s ?? 1, op = o.op ?? 1; if (s <= 0) return; const w = NW(n), hot = o.hot, pend = o.pending;
    card(n.x, n.y, w, 36, { rx: 18, text: n.label, fs: 15, fw: 800, stroke: pend ? MUT : hot ? ACC : INK, fill: pend ? SOFT : hot ? ACCBG : PANEL, color: pend ? MUT : hot ? ACC : INK, sw: hot ? 2.6 : 2, dash: pend ? '5 5' : null, s, op });
    if (n.type) mono(n.x, n.y - 26, n.type, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op * clamp(s) }); }
  function clip(a, b) { const w = NW(a) / 2 + 3, h = 21, dx = b.x - a.x, dy = b.y - a.y, t = Math.min(dx ? w / Math.abs(dx) : 1e9, dy ? h / Math.abs(dy) : 1e9); return [a.x + dx * t, a.y + dy * t]; }
  function gedge(a, b, rel, u, o) { o = o || {}; if (u <= 0) return; const [x1, y1] = clip(a, b), [x2, y2] = clip(b, a), col = o.col || MUT, op = o.op ?? 1;
    grow(x1, y1, x2, y2, u, col, { sw: o.sw || 2.4, dash: o.dash, op });
    if (rel) { const lo = clamp((u - 0.75) / 0.25) * op, mx = (x1 + x2) / 2 + (o.lx || 0), my = (y1 + y2) / 2 + (o.ly || 0), w = tw(rel, 13.5) + 12;
      el('rect', { x: mx - w / 2, y: my - 11, width: w, height: 21, rx: 4, fill: PANEL, opacity: lo });
      mono(mx, my + 5, rel, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: col === MUT ? INK : col, opacity: lo }); } }
  function answer(cx, cy, w, text, ok, s, h) { if (s <= 0) return; card(cx, cy, w, h || 42, { rx: 10, stroke: ok ? GOOD : BAD, fill: ok ? GOODBG : BADBG, sw: 2, s, text, fs: 14.5, fw: 700 }); }
  const typeOut = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));

  // ---------- 왼쪽 RAG 칸: 청크와 점수 ----------
  function ragLane(c, o) { o = o || {}; const rs = c.beat.ragState, prs = c.prev && c.prev.ragState, u = c.u;
    zone(20, 50, 450, 340, '벡터 RAG (점수는 예시)', { fill: SOFT });
    if (!rs) return;
    rs.chunks.forEach((ch, i) => { const y = 96 + i * 62, p = prs && prs.chunks.find((x) => x.id === ch.id), sc = o.scored ? (o.grow ? tween(p && o.keep ? p.score : 0, ch.score, u) : ch.score) : 0;
      const low = o.lowId === ch.id, sink = o.sink && ch.id === o.sink ? o.sinkF : 0, yy = y + sink * 150;
      tx(40, yy, ch.text, { 'font-size': 14.5, 'font-weight': ch.picked && o.scored ? 800 : 600, fill: low ? WARN : sink > 0.5 ? MUT : INK });
      if (o.scored) { hbar(40, yy + 10, 330, sc, 1, { h: 14, col: low ? WARN : ch.picked ? ACC : OFF, text: sc.toFixed(2) });
        if (ch.picked) check(445, yy + 2, 9, o.grow ? pop(u, 1.3) : 1); } }); }

  // ---------- 1. 1-hop 질문 ----------
  const G1 = { co: { x: 570, y: 170, label: '주식회사 X', type: ':Company' }, seoul: { x: 860, y: 170, label: '서울', type: ':City' } };
  function s1(t, c) { const { k, u } = c, b = c.beat, gs = b.graphState;
    pill(480, 24, b.question, ACC, k === 0 ? pop(u, 0.2) : 1, { fs: 15, fill: ACCBG });
    mono(820, 24, '1 hop', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.8) : 1 });
    ragLane(c, { scored: k >= 2, grow: k === 2 });
    zone(490, 50, 450, 340, 'GraphRAG', { fill: SOFT });
    if (k === 0) { pill(140, 120, 'SentenceTransformer', INK, pop(u, 0.5), { fs: 14, mono: true }); pill(330, 120, 'numpy', INK, pop(u, 0.8), { fs: 14, mono: true });
      sub(245, 180, '질문도 청크도 아직 없다', fade(u, 1.4), { 'font-size': 15 });
      sub(715, 180, '저장된 그래프에서 출발할 노드를 찾는다', fade(u, 1.4), { 'font-size': 15 }); return; }
    if (k === 1) { cells(70, 300, Array(8).fill(''), { w: 34, h: 28, gap: 4, style: (i) => ({ fill: INFOBG, stroke: INFO, s: pop(u, 0.4 + i * 0.08) }) });
      mono(390, 320, 'q_vec', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.2) }); }
    gnode(G1.co, { hot: true, s: k === 1 ? pop(u, 0.5) : 1 });
    if (k >= 2) { gedge(G1.co, G1.seoul, 'HEADQUARTERED_IN', k === 2 ? E(u, 0.4, 1.3) : 1, { col: ACC, ly: -26 });
      if (k === 2) dot([[G1.co.x, G1.co.y], [G1.seoul.x, G1.seoul.y]], seg(u, 0.4, 1.3), ACC, 7);
      gnode(G1.seoul, { hot: true, s: k === 2 ? pop(u, 1.3) : 1 }); }
    if (k >= 3) { card(245, 345, 400, 38, { rx: 8, stroke: INFO, fill: PANEL, sw: 1.6, text: 'context = c1 한 줄', fs: 14.5, s: k === 3 ? pop(u, 0.3) : 1 });
      if (k === 3) dot([[245, 96], [245, 326]], seg(u, 0.2, 0.9), INFO, 6);
      answer(715, 300, 300, '서울입니다.', true, k === 3 ? pop(u, 0.9) : 1); mono(715, 340, '예시 응답', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
    if (k === 4) { answer(245, 280, 300, '서울입니다.', true, pop(u, 0.3)); check(410, 280, 10, pop(u, 0.6)); check(880, 300, 10, pop(u, 0.6));
      banner(480, 404, '1 hop: 청크 하나에 답이 있으면 둘 다 맞힌다', pop(u, 1.2)); } }

  // ---------- 2. 2-hop 질문, RAG 의 함정 ----------
  const G2 = { co: { x: 570, y: 140, label: '주식회사 X', type: ':Company' }, seoul: { x: 830, y: 140, label: '서울', type: ':City' }, mayor: { x: 830, y: 290, label: '?', type: ':Person' } };
  function s2(t, c) { const { k, u } = c, b = c.beat;
    pill(400, 24, b.question, ACC, k === 0 ? pop(u, 0.2) : 1, { fs: 15, fill: ACCBG });
    mono(720, 29, '회사 → 도시 → 사람 (2 hop)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.9) : 1 });
    const sinkF = k === 4 ? E(u, 0.3, 1.4) : k > 4 ? 1 : 0;
    ragLane(c, { scored: k >= 1, grow: k === 1, lowId: k >= 2 && k <= 3 ? 'c4' : null, sink: 'c4', sinkF });
    zone(490, 50, 450, 340, 'GraphRAG', { fill: SOFT });
    gnode(G2.co, { hot: true });
    if (k >= 1) { gedge(G2.co, G2.seoul, 'HEADQUARTERED_IN', k === 1 ? E(u, 0.4, 1.3) : 1, { col: ACC, ly: -26 }); gnode(G2.seoul, { hot: true, s: k === 1 ? pop(u, 1.3) : 1 }); }
    if (k >= 2) { gedge(G2.seoul, G2.mayor, 'HAS_MAYOR ?', k === 2 ? E(u, 0.6, 1.4) : 1, { dash: '5 5', lx: 0 }); gnode(G2.mayor, { pending: true, s: k === 2 ? pop(u, 1.4) : 1 });
      sub(660, 300, '다음 hop 대기', k === 2 ? fade(u, 1.8) : 1, { 'font-size': 14 }); }
    if (k === 2) { mono(445, 236, '꼴찌', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.0) }); return; }
    if (k === 3) { // 질문 안에 "서울"이 없다
      el('rect', { x: 278, y: 11, width: 244, height: 28, rx: 14, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 0.2) });
      pill(400, 62, '"서울" 없음', WARN, pop(u, 0.6), { fs: 13.5, fill: WARNBG });
      tx(245, 330, '질문에 "서울"이 없어 시장 청크와 닿지 않는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
      tx(245, 356, '1 hop 답을 알아야 2 hop 청크를 찾는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: INK, opacity: fade(u, 1.9) }); return; }
    if (k >= 4) { // 운영에서는 다른 청크에 밀려 top-3 밖으로
      const rise = k === 4 ? E(u, 0.5, 1.6) : 1, y = lerp(380, 220, rise);
      el('rect', { x: 40, y: y - 12, width: 250, height: 14, rx: 4, fill: OFF, opacity: rise });
      el('rect', { x: 40, y: y + 4, width: 200, height: 12, rx: 4, fill: OFF, opacity: 0.6 * rise });
      el('line', { x1: 34, y1: 268, x2: 456, y2: 268, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: k === 4 ? fade(u, 1.4) : 1 });
      mono(452, 262, 'top-3 경계', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: k === 4 ? fade(u, 1.5) : 1 });
      if (k === 4) { tx(300, 226, '다른 청크 (예시)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.7) }); return; } }
    if (k < 5) return;
    // 컨텍스트 부족 → 정보 없음
    answer(245, 310, 410, '"정보가 없습니다."', false, pop(u, 1.0)); mono(245, 345, '예시 응답 · 컨텍스트에 시장 정보 없음', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.3) });
    sub(715, 360, 'traverse 진행 중', fade(u, 0.5), { 'font-size': 14 }); }

  // ---------- 3. Cypher 로 노드를 따라간다 ----------
  const G3 = { co: { x: 170, y: 220, label: '주식회사 X', type: ':Company' }, seoul: { x: 480, y: 220, label: '서울', type: ':City' }, mayor: { x: 790, y: 220, label: '김OO', type: ':Person' } };
  const CY = ['MATCH (c:Company {name: "주식회사 X"})', '      -[:HEADQUARTERED_IN]->(city:City)', '      -[:HAS_MAYOR]->(mayor:Person)', 'RETURN c.name, city.name, mayor.name, mayor.term'];
  function s3(t, c) { const { k, u } = c;
    const lineOn = [0, 1, 2, 3, 3, 3][k], sn = R.snippet(40, 14, CY, { fs: 14.5 });
    el('rect', { x: 40, y: 30 + lineOn * 22.5, width: 5, height: 18, rx: 2, fill: ACC });
    pill(800, 40, k >= 2 ? 'hop 2' : k >= 1 ? 'hop 1' : 'hop 0', ACC, 1, { fs: 16, mono: true });
    const y0 = k >= 3 ? 190 : 220, g = (n) => ({ ...n, y: y0 });
    gnode(g(G3.co), { hot: true, s: k === 0 ? pop(u, 0.3) : 1 });
    if (k >= 1) { gedge(g(G3.co), g(G3.seoul), 'HEADQUARTERED_IN', k === 1 ? E(u, 0.3, 1.3) : 1, { col: ACC, ly: -26 });
      if (k === 1) dot([[G3.co.x, y0], [G3.seoul.x, y0]], seg(u, 0.3, 1.3), ACC, 8);
      gnode(g(G3.seoul), { hot: true, s: k === 1 ? pop(u, 1.3) : 1 }); }
    if (k >= 2) { gedge(g(G3.seoul), g(G3.mayor), 'HAS_MAYOR', k === 2 ? E(u, 0.3, 1.3) : 1, { col: ACC, ly: -26 });
      if (k === 2) dot([[G3.seoul.x, y0], [G3.mayor.x, y0]], seg(u, 0.3, 1.3), ACC, 8);
      const done = k > 2 || u > 1.4; gnode(g({ ...G3.mayor, label: done ? '김OO' : '?' }), { hot: done, pending: !done, s: k === 2 && done ? pop(u, 1.4) : 1 });
      mono(G3.mayor.x, y0 + 40, 'term: 2024', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, opacity: k === 2 ? fade(u, 1.8) : 1 }); }
    else { gnode(g({ ...G3.mayor, label: '?' }), { pending: true, op: 0.6 }); }
    if (k === 0) { sub(480, 330, 'traverse 는 이 노드에서 출발한다', fade(u, 1.0), { 'font-size': 15, fill: INK }); return; }
    if (k <= 2) return;
    if (k <= 4) { // RETURN 표
      const cols = ['company', 'city', 'mayor', 'term'], vals = ['주식회사 X', '서울', '김OO', '2024'], src = [G3.co.x, G3.seoul.x, G3.mayor.x, G3.mayor.x], x0 = 210, cw = 150;
      cols.forEach((h, i) => { const cx = x0 + i * cw + cw / 2, f = k === 3 ? E(u, 0.3 + i * 0.25, 1.1 + i * 0.25) : 1;
        if (k === 3 && f < 1) fly(src[i], y0 + 20, cx, 300, f, h, { mono: true, fill: INFO });
        if (f >= 1) card(cx, 300, cw - 6, 34, { rx: 4, text: h, fs: 14.5, mono: true, fill: INFOBG, stroke: INFO, sw: 1.5 });
        if (k === 4) card(cx, 340, cw - 6, 34, { rx: 4, text: vals[i], fs: 15, fw: 700, stroke: GRID, s: pop(u, 0.3 + i * 0.2) }); });
      if (k === 4) pill(880, 340, '1 row', GOOD, pop(u, 1.3), { fs: 15, mono: true });
      return; }
    // 경로를 그대로 LLM 컨텍스트로
    card(380, 300, 520, 38, { rx: 8, stroke: ACC, fill: PANEL, sw: 1.8, s: pop(u, 0.2), text: '주식회사 X --본사--> 서울 --시장--> 김OO', fs: 14.5, mono: true });
    grow(645, 300, 715, 300, E(u, 0.7, 1.0), ACC); card(770, 300, 100, 44, { rx: 10, text: 'LLM', fs: 16, fw: 800, s: pop(u, 0.9) });
    answer(380, 366, 300, '김OO 시장입니다.', true, pop(u, 1.4)); mono(560, 370, '예시 응답', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) });
    pill(840, 380, 'RAG 쪽은 실패로 굳음', BAD, pop(u, 1.9), { fs: 13.5 }); }

  // ---------- 4. 같은 질문, 다른 답 ----------
  const P4 = [{ x: 555, y: 140, label: '주식회사 X' }, { x: 720, y: 140, label: '서울' }, { x: 880, y: 140, label: '김OO' }];
  function s4(t, c) { const { k, u } = c, b = c.beat, rs = b.ragState, gs = b.graphState;
    pill(480, 24, b.question, ACC, 1, { fs: 15, fill: ACCBG });
    zone(20, 50, 450, 340, '벡터 RAG', { fill: SOFT }); zone(490, 50, 450, 340, 'GraphRAG', { fill: SOFT });
    rs.chunks.forEach((ch, i) => card(245, 106 + i * 54, 400, 36, { rx: 6, text: ch.text, fs: 14.5, stroke: INFO, fill: PANEL, sw: 1.5, s: k === 0 ? pop(u, 0.2 + i * 0.3) : 1 }));
    cross(245, 133, 9, k === 0 ? pop(u, 1.0) : 1);
    P4.forEach((n, i) => gnode(n, { hot: true, s: k === 0 ? pop(u, 0.3 + i * 0.3) : 1 }));
    gedge(P4[0], P4[1], '본사', k === 0 ? E(u, 0.6, 1.1) : 1, { col: ACC, ly: -24 }); gedge(P4[1], P4[2], '시장', k === 0 ? E(u, 0.9, 1.4) : 1, { col: ACC, ly: -24 });
    if (k >= 1) { const a = rs.answer; answer(245, 250, 420, k === 1 ? typeOut(a, E(u, 0.2, 1.6)) : a, false, 1); mono(245, 284, '예시 응답', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
    if (k >= 2) { ['시장 청크는 점수가 낮아 밀려나기 쉽다', '질문에 매개 엔티티(서울)가 없다', 'hop이 늘수록 실패가 잦아진다 (3 hop 예시 ~80%)'].forEach((s, i) =>
      tx(40, 318 + i * 24, '· ' + s, { 'font-size': 14, fill: i === 2 ? BAD : INK, 'font-weight': i === 2 ? 700 : 500, opacity: k === 2 ? fade(u, 0.3 + i * 0.4) : 1 })); }
    if (k >= 3) { const a = gs.answer.replace('이고, ', '이고,\n'); answer(715, 250, 420, k === 3 ? typeOut(a, E(u, 0.2, 1.8)) : a, true, 1, 62); mono(715, 298, '예시 응답', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
    if (k === 4) { // 출처: 노드 → 관계 → 노드
      const marks = [[555, '노드'], [637, '관계'], [720, '노드'], [800, '관계'], [880, '노드']];
      marks.forEach(([x, s], i) => { const p = pop(u, 0.3 + i * 0.2); el('line', { x1: x, y1: 219, x2: x, y2: lerp(219, 166, E(u, 0.3 + i * 0.2, 0.8 + i * 0.2)), stroke: ACC, 'stroke-width': 1.6, 'stroke-dasharray': '3 4' });
        card(x, 90, 50, 26, { rx: 13, text: s, fs: 13.5, fw: 700, stroke: ACC, color: ACC, s: p }); });
      tx(715, 345, '어느 노드를 어떤 관계로 지났는지 남는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      tx(715, 372, 'RAG 쪽 출처는 청크 ID까지', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); } }

  // ---------- 5. 비용 · 속도 · 정확도 ----------
  const row = (b, name) => (b.compareTable || []).find((r) => r.metric === name);
  function s5(t, c) { const { k, u } = c, b = c.beat;
    const ax = axes(80, 70, 330, 250, { x: [0.6, 3.4], y: [0, 100], xt: [1, 2, 3], yt: [0, 20, 40, 60, 80, 100], grid: true, xl: 'hop 수', yl: '정확도 % (예시)' });
    if (k === 5) el('rect', { x: ax.X(0.65), y: 70, width: ax.X(1.35) - ax.X(0.65), height: 250, fill: GOOD, opacity: 0.12 * fade(u, 0.2) });
    if (k === 6) el('rect', { x: ax.X(2.65), y: 70, width: ax.X(3.35) - ax.X(2.65), height: 250, fill: ACC, opacity: 0.14 * fade(u, 0.2) });
    const acc = (h) => { const r = row(b, h + '-hop 정확도'); return r ? [parseFloat(r.rag), parseFloat(r.graph)] : null; };
    const pts = [1, 2, 3].map((h) => [h, acc(h)]).filter((p) => p[1]);
    const gU = k === 3 ? E(u, 0.3, 1.6) : 1;
    if (pts.length) { const drawn = k === 3 ? pts.filter((p, i) => i === 0 || gU >= i / 2) : pts;
      line(ax, pts.map(([h, v]) => [h, v[0]]), k === 3 ? clamp(gU) : 1, INFO); line(ax, pts.map(([h, v]) => [h, v[1]]), k === 3 ? clamp(gU) : 1, ACC);
      drawn.forEach(([h, v]) => { const s = k === 2 ? pop(u, 0.4) : 1;
        scatter(ax, [[h, v[0], INFO], [h, v[1], ACC]], { r: 6 * s });
        mono(ax.X(h) + 10, ax.Y(v[0]) + 18, v[0] + '%', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: clamp(s) });
        mono(ax.X(h) + 10, ax.Y(v[1]) - 9, v[1] + '%', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: clamp(s) }); }); }
    tx(90, 400, '■ RAG', { 'font-size': 14, 'font-weight': 700, fill: INFO }); tx(170, 400, '■ GraphRAG', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    // 오른쪽
    if (k <= 4) { const names = [['인덱싱 비용', 1], ['쿼리 응답속도', 1], ['환각(hallucination)', 4], ['인용/출처', 4]];
      tx(500, 54, '지표', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(690, 54, 'RAG', { 'font-size': 14, fill: INFO, 'font-weight': 700 }); tx(815, 54, 'GraphRAG', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      el('line', { x1: 495, y1: 64, x2: 945, y2: 64, stroke: GRID, 'stroke-width': 1.5 });
      names.forEach(([nm, at], i) => { const r = row(b, nm); if (!r) return; const y = 96 + i * 66, s = k === at ? fade(u, 0.3 + (i % 2) * 0.4) : 1;
        tx(500, y, nm.replace('(hallucination)', ''), { 'font-size': 15, 'font-weight': 700, opacity: s });
        tx(690, y, r.rag, { 'font-size': 14, fill: r.raglabel === 'good' ? INK : WARN, class: 'mono', opacity: s });
        tx(815, y, r.graph.replace(' (LLM 추출)', '').replace(' (경로 명시)', '').replace('경로(node→rel→node)', '노드·관계 경로'), { 'font-size': 14, fill: r.glabel === 'good' ? INK : WARN, class: 'mono', opacity: s });
        if (nm === '쿼리 응답속도') { hbar(690, y + 12, 90, 50, 200, { h: 10, col: INFO, label: false, u: k === 1 ? E(u, 0.8, 1.6) : 1 }); hbar(815, y + 12, 90, 200, 200, { h: 10, col: ACC, label: false, u: k === 1 ? E(u, 0.8, 1.6) : 1 }); } });
      if (k === 0) sub(720, 200, '아직 헤더만 있는 표', fade(u, 0.6), { 'font-size': 15 });
      if (k === 3) tx(720, 380, '3 hop 에서 20% 대 78%', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      return; }
    if (k === 5 || k === 6) { const rag = k === 5, items = rag ? ['단순 FAQ · 매뉴얼 검색', '청크 하나에 답이 있는 질문이 대부분', '비용에 민감 · 데이터가 작다'] : ['엔티티 관계가 풍부한 사내 데이터', '"A의 B의 C는?" 같은 질문이 잦다', '출처 · 추론 사슬 추적이 필요 (감사·규제)'];
      tx(720, 70, rag ? '언제 RAG 인가' : '언제 GraphRAG 인가', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: rag ? GOOD : ACC });
      items.forEach((s, i) => { const y = 130 + i * 70, p = pop(u, 0.3 + i * 0.3); card(720, y, 420, 52, { rx: 10, stroke: rag ? GOOD : ACC, sw: 1.8, s: p }); check(535, y, 9, p);
        tx(555, y + 5, s, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 0.4 + i * 0.3) }); });
      return; }
    // hybrid
    card(600, 110, 190, 50, { rx: 10, text: '벡터 top-k', fs: 15, stroke: INFO, s: pop(u, 0.2) }); card(840, 110, 190, 50, { rx: 10, text: '그래프 경로', fs: 15, stroke: ACC, s: pop(u, 0.4) });
    grow(600, 137, 700, 205, E(u, 0.6, 1.1), INFO); grow(840, 137, 740, 205, E(u, 0.6, 1.1), ACC);
    card(720, 230, 200, 48, { rx: 10, text: 'union → LLM', fs: 16, fw: 800, stroke: INK, s: pop(u, 1.1) });
    tx(720, 300, '둘 다 보여 주고 LLM이 고르게 한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
    tx(720, 326, '현실적인 기본값', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: '"회사 본사 어디?" 같은 1-hop 질문에서 RAG와 GraphRAG의 결과는 어떠한가?',
      o: ['GraphRAG만 맞힌다', '둘 다 "서울입니다"로 맞힌다', 'RAG만 맞힌다'], a: 1,
      why: '답이 "주식회사 X의 본사는 서울에 있다" 청크 하나에 통째로 들어 있어 두 방식의 차이가 드러나지 않는다.' },
    { q: '"본사 도시의 시장은?"에서 벡터 검색이 시장 청크를 잘 찾지 못하는 근본 까닭은 무엇인가?',
      o: ['시장 청크의 글자 수가 너무 짧아서', '질문에 매개 엔티티 "서울"이 없어 그 청크와 닮지 않아서', '임베딩 모델이 숫자 연도를 읽지 못해서'], a: 1,
      why: '시장 청크는 예시 점수 0.22로 꼴찌다. 1 hop의 답인 "서울"을 알아야 닮은 청크가 되는데, 벡터 검색은 한 번으로 끝난다.' },
    { q: 'Cypher 쿼리 한 번으로 2-hop 답을 얻을 수 있는 까닭은 무엇인가?',
      o: ['HEADQUARTERED_IN, HAS_MAYOR 관계가 데이터에 명시돼 있어 그대로 따라가면 되어서', '모든 청크를 LLM에 한꺼번에 넣어서', '질문을 두 번 임베딩해서'], a: 0,
      why: '회사에서 HEADQUARTERED_IN으로 서울, HAS_MAYOR로 김OO까지 건너가면 결과가 1 row로 나온다.' },
    { q: 'GraphRAG 답에만 있는 장점으로 알맞은 것은 무엇인가?',
      o: ['응답 속도가 RAG보다 빠르다', '인덱싱 비용이 들지 않는다', '어느 노드를 어떤 관계로 지나 답했는지 출처가 남는다'], a: 2,
      why: '경로 자체가 근거라서 노드와 관계 단위로 추적된다. RAG의 출처는 청크 ID에 그친다.' },
    { q: '예시 표에서 hop 수가 늘 때 두 방식의 정확도는 어떻게 되는가?',
      o: ['RAG는 90%에서 20%로 떨어지고 GraphRAG는 92%에서 78%로 버틴다', '둘 다 비슷하게 떨어진다', 'GraphRAG가 더 크게 떨어진다'], a: 0,
      why: '1 hop은 90% 대 92%로 비슷하지만 3 hop에서는 20% 대 78%로 벌어진다. 대신 GraphRAG는 질의가 약 4배 느리다.' },
  ];

  const summary = [
    '청크 하나에 답이 있는 1-hop 질문은 RAG와 GraphRAG가 똑같이 맞힌다.',
    '2-hop 질문은 매개 엔티티가 질문에 없어서 벡터 검색이 두 번째 근거를 놓친다.',
    '그래프는 명시된 관계를 따라 Cypher 한 번에 2 hop을 건너고 경로를 출처로 남긴다.',
    '대신 질의가 약 4배 느리고 인덱싱이 비싸서, 보통은 두 결과를 합치는 hybrid로 쓴다.',
  ];
  const review = [
    { q: '사내 챗봇이 "우리 팀장의 상사가 맡은 프로젝트는?" 질문에 자주 "정보가 없다"고 한다. 먼저 의심할 것은?',
      o: ['답이 여러 hop에 걸쳐 있는데 검색을 한 번만 한다', 'LLM의 temperature가 너무 낮다', '청크가 너무 많이 겹쳐 있다'], a: 0,
      why: '팀장, 상사, 프로젝트로 이어지는 3 hop 질문이다. 중간 엔티티를 모르는 채로 한 번 검색하면 뒤쪽 근거를 놓친다.' },
    { q: '질문 로그를 보니 90%가 "환불 규정은?" 같은 단일 문서 질문이다. 알맞은 선택은?',
      o: ['GraphRAG로 전면 교체한다', 'RAG를 유지한다', '모든 질문에 Cypher를 먼저 돌린다'], a: 1,
      why: '1 hop 질문에서는 예시 정확도가 90% 대 92%로 비슷하다. 비용과 속도까지 보면 RAG로 충분하다.' },
    { q: '감사팀이 "이 답의 근거가 어느 관계에서 왔는지"를 요구한다. 어느 쪽이 맞나?',
      o: ['RAG, 청크 ID가 남아서', '어느 쪽도 출처를 남기지 못한다', 'GraphRAG, 노드와 관계 경로가 남아서'], a: 2,
      why: 'GraphRAG는 지나온 노드와 관계를 그대로 근거로 넘긴다. 감사·규제처럼 추론 사슬이 필요한 곳에 맞다.' },
  ];

  R.page({ title: '같은 질문, 두 가지 검색', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
