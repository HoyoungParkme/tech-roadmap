/* IV-2-2 Local · Global 검색 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그래프: 페이지의 8명·엣지 10개 (Apple 4명/내부 엣지 5, Microsoft 3명/3, Amazon 1명/0). 이웃·홉 수는 networkx로 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, BAD, GOOD, WARN, INFO } = C;

  const N = { Alice: [170, 96, 'apple'], Bob: [90, 196, 'apple'], Carol: [250, 196, 'apple'], Dave: [170, 296, 'apple'],
    Eve: [430, 96, 'msft'], Frank: [370, 196, 'msft'], Grace: [490, 196, 'msft'], Henry: [430, 316, 'amzn'] };
  const EDGES = [['Alice', 'Bob'], ['Alice', 'Carol'], ['Alice', 'Dave'], ['Bob', 'Carol'], ['Carol', 'Dave'], ['Eve', 'Frank'], ['Eve', 'Grace'], ['Frank', 'Grace'], ['Henry', 'Frank'], ['Carol', 'Frank']];
  const CM = { apple: { col: ACC, name: 'Apple팀', box: [44, 48, 252, 296], sum: '4명 · 내부 엣지 5' }, msft: { col: INFO, name: 'Microsoft팀', box: [318, 48, 222, 190], sum: '3명 · 내부 엣지 3' },
    amzn: { col: WARN, name: 'Amazon팀', box: [370, 268, 120, 92], sum: '1명 · 0' } };
  const NB = ['Bob', 'Carol', 'Dave'];
  function graph(o) { o = o || {}; const lit = o.lit || [], dim = o.dim;
    EDGES.forEach(([a, b]) => { const on = o.litEdge && o.litEdge(a, b); const [x1, y1] = N[a], [x2, y2] = N[b];
      el('line', { x1, y1, x2, y2, stroke: on ? ACC : GRID, 'stroke-width': on ? 3.5 : 2, opacity: dim && !on ? 0.5 : 1 }); });
    Object.keys(N).forEach((id) => { const [x, y, cm] = N[id], on = lit.includes(id), col = o.byComm ? CM[cm].col : on ? ACC : MUT;
      el('circle', { cx: x, cy: y, r: 25, fill: on || o.byComm ? (o.byComm ? PANEL : C.ACCBG) : PANEL, stroke: col, 'stroke-width': on ? 3.5 : 2, opacity: dim && !on ? 0.45 : 1 });
      tx(x, y + 5, id, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: on ? ACC : o.byComm ? col : INK, opacity: dim && !on ? 0.5 : 1 }); }); }
  function boxes(op, o) { o = o || {}; Object.keys(CM).forEach((k, i) => { const m = CM[k], [x, y, w, h] = m.box, s = typeof op === 'function' ? op(i) : op; if (s <= 0) return;
      el('rect', { x, y, width: w, height: h, rx: 14, fill: 'none', stroke: m.col, 'stroke-width': 2.5, 'stroke-dasharray': '8 5', opacity: s });
      tx(x + 10, y + h + 20 > 410 ? y - 8 : y + h + 20, m.name + (o.sum ? '  ' + m.sum : ''), { 'font-size': 14, 'font-weight': 800, fill: m.col, opacity: s }); }); }
  const RX = 590;
  function bubble(x, y, s, o) { o = o || {}; const w = tw(s, 15) * 0.92 + 30; card(x + w / 2, y, w, 38, { rx: 19, stroke: o.col || INK, sw: 2, text: s, fs: 15, fw: 700, color: o.col || INK, s: o.s, op: o.op }); return w; }

  // 1. Local: Alice 주변만
  function s1(t, c) { const { k, u } = c;
    graph({ dim: k === 0, lit: k >= 2 ? ['Alice'].concat(k === 5 ? NB : []) : [], litEdge: k === 5 ? (a, b) => (a === 'Alice' && NB.includes(b)) && u > 0.6 : null });
    if (k === 0) { pill(760, 120, 'from neo4j import GraphDatabase', INK, pop(u, 0.3), { mono: true, fs: 14 });
      tx(760, 190, 'Local은 시작 노드 주변만 본다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.9) });
      sub(760, 220, '전체 그래프 스캔 없음', fade(u, 1.3), { 'font-size': 14.5 }); return; }
    bubble(RX, 50, 'Alice의 친구는 누구?', { s: k === 1 ? pop(u, 0.2) : 1 });
    if (k === 1) { grow(700, 72, 700, 124, E(u, 0.8, 1.2), MUT); card(760, 150, 260, 46, { rx: 10, text: 'find_start_entity()', fs: 15, mono: true, stroke: ACC, s: pop(u, 1.1) });
      sub(760, 196, 'NER + 임베딩 매칭으로 이름 하나', fade(u, 1.6), { 'font-size': 14 }); }
    if (k === 2) { fly(RX + 60, 96, 170, 96, seg(u, 0.3, 1.4), 'Alice', { mono: true });
      mono(RX, 150, 'start = "Alice"', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) }); }
    if (k >= 3) { const r = k === 3 ? lerp(0, 118, E(u, 0.3, 1.4)) : 118;
      el('circle', { cx: 170, cy: 96, r, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: k === 5 ? 0.5 : 0.9 });
      if (k === 3) { mono(RX, 140, 'MATCH (n:Person {name: $start})', { 'font-size': 14.5, opacity: fade(u, 0.6) }); mono(RX, 166, '      -[r*1..1]-(m)', { 'font-size': 14.5, fill: ACC, 'font-weight': 800, opacity: fade(u, 1) });
        tx(RX, 214, 'hops = 1이 탐색 반경', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.6) }); } }
    if (k === 4) { NB.forEach((n, i) => { dot([N.Alice, N[n]], seg(u, 0.2 + i * 0.2, 1 + i * 0.2), ACC, 6); dot([N[n], [RX, 150 + i * 36]], seg(u, 1.2 + i * 0.2, 2.2 + i * 0.2), ACC, 5); });
      mono(RX, 140, 's.run(cypher, start=start)', { 'font-size': 14.5, opacity: fade(u, 0.2) });
      mono(RX + 6, 260, '레코드 3건', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) }); }
    if (k === 5) { el('line', { x1: 250, y1: 196, x2: 370, y2: 196, stroke: OFF, 'stroke-width': 3, 'stroke-dasharray': '4 4' });
      tx(310, 228, '2홉', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1) });
      tx(RX, 150, '1홉 이웃', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4) });
      NB.forEach((n, i) => pill(RX + 40 + i * 90, 188, n, ACC, pop(u, 0.6 + i * 0.25), { fs: 15 }));
      sub(760, 250, 'Frank(2홉)는 조회하지 않는다', fade(u, 1.6), { 'font-size': 14.5 }); } }

  // 2. Local 처리: 작은 서브그래프만 LLM 에게
  const LINES = NB.map((n) => `Alice -[KNOWS]-> ${n}`);
  function s2(t, c) { const { k, u } = c;
    graph({ dim: true, lit: ['Alice'].concat(NB), litEdge: (a, b) => a === 'Alice' && NB.includes(b) });
    const listBox = (n, op) => { zone(RX - 10, 30, 360, 150, 'lines', { fill: SOFT, op: op ?? 1 });
      LINES.forEach((s, i) => { const v = clamp(n - i); if (v > 0) mono(RX + 6, 80 + i * 32, s, { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: v }); }); };
    if (k === 0) { listBox(0, fade(u, 0.3)); mono(RX + 6, 90, 'lines = []', { 'font-size': 16, fill: MUT, opacity: fade(u, 0.6) });
      mono(RX, 230, 'build_local_context(subgraph)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1) }); return; }
    if (k === 1) { listBox(E(u, 0.3, 2.3) * 3); NB.forEach((n, i) => fly((N.Alice[0] + N[n][0]) / 2, (N.Alice[1] + N[n][1]) / 2, RX + 90, 80 + i * 32, seg(u, 0.2 + i * 0.6, 0.9 + i * 0.6), 'KNOWS', { mono: true })); return; }
    listBox(3);
    if (k === 2) { el('path', { d: `M${RX + 350},40 h10 V172 h-10`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      mono(RX, 222, 'context = "\\n".join(lines)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) });
      sub(760, 256, 'local_search(hops=1) 결과를 그대로 쓴다', fade(u, 1.1), { 'font-size': 14 }); }
    if (k >= 3) { card(760, 250, 360, 92, { rx: 10, stroke: INK, sw: 2, s: k === 3 ? pop(u, 0.3) : 1 });
      tx(RX + 4, 228, '그래프 컨텍스트: (위 3줄)', { 'font-size': 14.5, opacity: k === 3 ? fade(u, 0.6) : 1 });
      tx(RX + 4, 254, '질문: Alice의 친구는 누구?', { 'font-size': 14.5, opacity: k === 3 ? fade(u, 0.9) : 1 });
      tx(RX + 4, 280, '답변:', { 'font-size': 14.5, opacity: k === 3 ? fade(u, 1.2) : 1 });
      if (k === 3) mono(930, 220, '~200 토큰', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.6) }); }
    if (k === 4) { card(670, 340, 160, 44, { rx: 12, stroke: ACC, fill: C.ACCBG, sw: 2.5, text: 'gpt-4o-mini', fs: 15, s: pop(u, 0.2) });
      grow(750, 340, 790, 340, E(u, 0.9, 1.2), GOOD); tx(800, 334, 'Bob, Carol, Dave', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
      tx(800, 356, '(응답 예시)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) }); }
    if (k === 5) R.meters(RX - 10, 316, 360, [{ name: '입력', val: '~200' }, { name: '시간', val: '~0.8s' }, { name: '비용(어림)', val: '$0.00006', good: true }], { h: 72 }); }

  // 3. Global 질문: 시작 노드가 없다
  const KW = ['전체', '가장', '주요', '핵심', '통합', '비교'];
  function s3(t, c) { const { k, u } = c;
    graph({ byComm: k >= 3 });
    if (k >= 3) boxes(k === 3 ? (i) => E(u, 0.3 + i * 0.3, 0.9 + i * 0.3) : 1, { sum: true });
    if (k === 0) { el('rect', { x: 30, y: 36, width: 530, height: 340, rx: 16, fill: 'none', stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '10 6', opacity: fade(u, 0.3) });
      tx(760, 160, '출발 엔티티가 없다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.6) });
      sub(760, 192, '그래프 전체가 컨텍스트', fade(u, 1), { 'font-size': 15 }); return; }
    const q = '전체 조직에서 가장 협업이 많은 팀은?';
    if (k <= 2) bubble(RX - 10, 50, q, { s: k === 1 ? pop(u, 0.2) : 1, col: INFO });
    if (k === 1) KW.forEach((w, i) => { const hit = q.includes(w), x = RX + 20 + (i % 3) * 110, y = 140 + Math.floor(i / 3) * 50;
      pill(x + 30, y, w, hit ? INFO : GRID, pop(u, 0.5 + i * 0.15), { fs: 15, color: hit ? INFO : MUT }); if (hit) check(x + 74, y, 7, pop(u, 1.6)); });
    if (k === 1) sub(760, 260, 'is_global_query → True', fade(u, 1.9), { 'font-size': 15, fill: INFO, 'font-weight': 700, class: 'mono' });
    if (k === 2) ['"이 책의 핵심 인물 그룹은?"', '"주요 협업 패턴은 무엇인가?"'].forEach((s, i) => { const y = 130 + i * 56;
      tx(RX, y, s, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.5) }); pill(900, y - 5, 'global', INFO, pop(u, 0.6 + i * 0.5), { fs: 13.5, mono: true }); });
    if (k === 2) sub(760, 260, '1홉 이웃으로는 답이 안 나온다', fade(u, 1.6), { 'font-size': 14.5 });
    if (k === 3) { tx(RX, 70, '노드 100만 개는 못 넣는다', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) });
      tx(RX, 104, '→ IV-2-1의 community 요약을 쓴다', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); }
    if (k === 4) { ['fetch_community_summaries()', 'map_reduce_answer()'].forEach((s, i) => { const y = 110 + i * 90;
        card(760, y, 300, 48, { rx: 10, text: s, fs: 14.5, mono: true, stroke: i ? ACC : INK, s: pop(u, 0.3 + i * 0.6) });
        if (i) grow(760, y - 64, 760, y - 26, E(u, 0.6, 0.9), MUT); });
      sub(760, 270, '실제 종합은 다음 단계', fade(u, 1.6), { 'font-size': 14.5 }); } }

  // 4. Global 처리: map-reduce
  const PART = ['Apple 4명 · 5엣지', 'MS 3명 · 3엣지', 'Amazon 1명 · 0'];
  function s4(t, c) { const { k, u } = c, ks = Object.keys(CM);
    graph({ byComm: true, dim: false }); boxes(1);
    const cx = (i) => RX + 50 + i * 125;
    // 요약 카드
    ks.forEach((key, i) => { const m = CM[key], [x, y, w] = m.box, g = k === 0 ? seg(u, 0.2 + i * 0.4, 1 + i * 0.4) : 1;
      if (k === 0 && g < 1) { fly(x + w / 2, y + 20, cx(i), 70, g, m.name, { fill: m.col }); return; }
      card(cx(i), 70, 116, 50, { rx: 8, stroke: m.col, sw: 2, text: m.name + '\n요약', fs: 13.5, color: m.col }); });
    if (k === 1) { card(760, 170, 220, 44, { rx: 10, text: 'client = OpenAI()', fs: 14.5, mono: true, stroke: INK, s: pop(u, 0.3) });
      sub(760, 222, 'summaries · question 입력', fade(u, 0.9), { 'font-size': 14 }); }
    if (k >= 2) ks.forEach((key, i) => { const s = k === 2 ? fade(u, 0.3 + i * 0.4) : 1; grow(cx(i), 98, cx(i), 150, k === 2 ? E(u, 0.3 + i * 0.4, 0.7 + i * 0.4) : 1, CM[key].col);
      mono(cx(i) + 8, 130, '+ 질문', { 'font-size': 13.5, 'text-anchor': 'start', fill: MUT, opacity: s }); });
    if (k === 2) sub(760, 200, '요약 하나마다 프롬프트 하나', fade(u, 1.6), { 'font-size': 14.5 });
    if (k >= 3) { ks.forEach((key, i) => card(cx(i), 182, 118, 50, { rx: 8, fill: C.GOODBG, stroke: GOOD, sw: 1.8, text: PART[i].replace(' · ', '\n'), fs: 13.5, color: INK, s: k === 3 ? pop(u, 0.4 + i * 0.4) : 1 }));
      mono(940, 230, 'LLM 호출 3회', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'end', fill: ACC, opacity: k === 3 ? fade(u, 1.8) : 1 }); }
    if (k >= 4 && k <= 5) { ks.forEach((_, i) => grow(cx(i), 210, 760, 262, k === 4 ? E(u, 0.3, 1.1) : 1, MUT, { plain: true }));
      card(760, 280, 200, 40, { rx: 10, text: 'Reduce', fs: 15, fw: 800, stroke: ACC, color: ACC, s: k === 4 ? pop(u, 1) : 1 });
      if (k === 4) sub(760, 324, '부분 답변을 이어 붙여 한 번 더', fade(u, 1.5), { 'font-size': 14 }); }
    if (k === 5) { grow(760, 302, 760, 330, E(u, 0.2, 0.5), GOOD);
      tx(RX - 6, 356, 'Apple팀(4명, 내부 엣지 5개)이 협업 밀도가 가장 높다', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) });
      sub(760, 384, '최종 답변 (문장은 예시, 숫자는 그래프 그대로)', fade(u, 1.2), { 'font-size': 13.5 });
      mono(940, 30, '총 호출 3 + 1 = 4회', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 1.6) }); }
    if (k === 6) { el('rect', { x: RX - 14, y: 250, width: 370, height: 160, rx: 12, fill: PANEL, stroke: GRID });
      tx(RX, 278, '한 번 답하는 비용 (단가표로 어림)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['Local', 0.00006, '$0.00006', ACC], ['Global', 0.0175, '≈ $0.02', INFO]].forEach(([n, v, s, col], i) => { const y = 304 + i * 40;
        tx(RX, y + 14, n, { 'font-size': 15, 'font-weight': 800, fill: col }); hbar(RX + 70, y, 190, v * E(u, 0.3 + i * 0.4, 1.2 + i * 0.4), 0.0175, { h: 18, col, text: s }); });
      tx(RX, 396, '약 300배 · 대신 그래프 전체를 본다', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.8) }); } }

  // 5. 라우터
  const BX = { q: [80, 210], d1: [300, 210], g1: [300, 72], d2: [560, 210], l: [820, 210], g2: [560, 352] };
  function diamond(x, y, s1, s2, on, sc) { const g = R.G(x, y, sc ?? 1); el('path', { d: 'M0,-52 L92,0 L0,52 L-92,0 Z', fill: on ? C.HL : PANEL, stroke: INK, 'stroke-width': 2.2 }, g);
    tx(0, -4, s1, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800 }, g); tx(0, 16, s2, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); }
  function term(key, s, col, on) { const [x, y] = BX[key]; card(x, y, key === 'g2' ? 190 : 140, 46, { rx: 23, stroke: col, sw: on ? 3.5 : 2, fill: on ? (col === ACC ? C.ACCBG : C.INFOBG) : PANEL, text: s, fs: 15, fw: 800, color: col, mono: true }); }
  const ROUTE = { g1: [BX.q, BX.d1, BX.g1], l: [BX.q, BX.d1, BX.d2, BX.l], g2: [BX.q, BX.d1, BX.d2, BX.g2] };
  function s5(t, c) { const { k, u } = c, b = c.beat;
    const dest = k === 1 ? 'g1' : k === 2 ? 'l' : k === 3 ? 'g2' : null;
    const at = dest ? seg(u, 0.5, 2.2) : 0;
    // 줄기
    [[BX.q, BX.d1, ''], [BX.d1, BX.g1, '예'], [BX.d1, BX.d2, '아니오'], [BX.d2, BX.l, '예'], [BX.d2, BX.g2, '아니오']].forEach(([a, b2, s], i) => {
      const dx = b2[0] - a[0], dy = b2[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, pa = i === 0 ? 36 : 92 * Math.abs(ux) + 52 * Math.abs(uy), pb = 70 * Math.abs(ux) + 26 * Math.abs(uy);
      const pbb = i === 2 ? 92 : i === 4 ? 26 : pb;
      grow(a[0] + ux * pa, a[1] + uy * pa, b2[0] - ux * pbb, b2[1] - uy * pbb, k === 0 ? E(u, 0.2 + i * 0.25, 0.6 + i * 0.25) : 1, MUT);
      if (s) tx((a[0] + b2[0]) / 2 + (uy ? 10 : 0), (a[1] + b2[1]) / 2 + (uy ? 0 : -10), s, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': uy ? 'start' : 'middle' }); });
    el('circle', { cx: BX.q[0], cy: BX.q[1], r: 34, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }); tx(BX.q[0], BX.q[1] + 5, '질문', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
    diamond(...BX.d1, '종합 키워드?', '전체·가장·주요…', dest && at > 0.25 && at < 0.55 && dest === 'g1');
    diamond(...BX.d2, '시작 엔티티?', 'try_extract_entity', false);
    term('g1', 'global', INFO, dest === 'g1' && at >= 1); term('l', 'local', ACC, dest === 'l' && at >= 1); term('g2', 'global (기본)', INFO, dest === 'g2' && at >= 1);
    if (k === 0) { mono(300, 300, 'GLOBAL_KEYWORDS', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, opacity: fade(u, 1.5) });
      mono(300, 322, '6개', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) }); }
    if (dest) { bubble(20, 30 + (dest === 'g1' ? 360 : 0), b.question, { s: pop(u, 0.2), col: dest === 'l' ? ACC : INFO });
      dot(ROUTE[dest], at, dest === 'l' ? ACC : INFO, 8);
      if (at >= 1) { const [x, y] = BX[dest]; check(x + (dest === 'g2' ? 110 : 86), y, 9, pop(u, 2.2)); } }
    if (k >= 4) { const ex = b.routerExamples || [], spot = { local: [BX.l, 0], global: [BX.g1, 0] }; let nL = 0, nG = 0;
      ex.forEach((r, i) => { const isL = r.decision === 'local', base = isL ? BX.l : BX.g1, n = isL ? nL++ : nG++;
        const x = isL ? base[0] - 80 : base[0] + 90, y = isL ? base[1] + 50 + n * 34 : base[1] - 22 + n * 34;
        const fresh = k === 5 ? i >= 2 : true, s = fresh ? pop(u, 0.3 + (i % 2) * 0.4) : 1;
        card(x + (tw(r.q, 13.5) * 0.92 + 20) / 2, y, tw(r.q, 13.5) * 0.92 + 20, 28, { rx: 14, stroke: isL ? ACC : INFO, sw: 1.8, text: r.q, fs: 13.5, color: isL ? ACC : INFO, s }); });
      if (k === 4) mono(560, 410, 'graphrag_qa(driver, question)', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1) }); } }

  const quiz = [
    { q: '"Alice의 친구는 누구?"를 hops=1로 찾을 때 돌아오는 이웃은 누구인가?',
      o: ['Bob, Carol, Dave', 'Bob, Carol, Dave, Frank', '그래프의 8명 전부'], a: 0,
      why: 'Alice와 직접 이어진 노드는 셋뿐이다. Frank는 Carol을 거쳐야 닿는 2홉이라 hops=1이면 조회하지 않는다.' },
    { q: 'Local 질문이 싸고 빠른 이유는 무엇인가?',
      o: ['gpt-4o를 여러 번 부르기 때문', '작은 서브그래프 몇 줄만 컨텍스트로 넣기 때문', 'community 요약을 쓰기 때문'], a: 1,
      why: '"Alice -[KNOWS]-> Bob" 같은 3줄, 약 200토큰이라 작은 모델 한 번이면 된다. 어림 비용은 약 $0.00006이다.' },
    { q: '"전체 조직에서 가장 협업이 많은 팀은?"을 Local로 풀 수 없는 까닭은 무엇인가?',
      o: ['키워드가 너무 많아서', 'Alice 노드가 없어서', '출발할 엔티티가 없고 그래프 전체를 봐야 해서'], a: 2,
      why: '특정 노드 주변이 아니라 전체를 비교해야 답이 나온다. 그래서 미리 만든 community 요약을 쓴다.' },
    { q: 'map-reduce Global 검색에서 community가 3개면 LLM은 몇 번 불리나?',
      o: ['1번', '3번', '4번'], a: 2,
      why: 'Map에서 요약마다 한 번씩 3번, Reduce에서 한 번 더 불러 모두 4번이다. 그래서 Local보다 약 300배 비싸다.' },
    { q: '"요즘 협업 분위기 어때?"는 라우터에서 어디로 가나?',
      o: ['global, 키워드도 엔티티도 없으면 기본값이라서', 'local, 협업이라는 단어가 있어서', '오류를 낸다'], a: 0,
      why: '종합 키워드가 없고 시작 엔티티도 못 뽑으니 마지막 줄의 기본값 global로 간다. 모호할 때는 넓게 보는 쪽이 안전하다.' },
  ];

  const summary = [
    'Local 검색은 질문 속 엔티티에서 출발해 1~2홉 이웃만 가져온다.',
    '서브그래프 몇 줄만 작은 모델에 넣으니 빠르고 싸다.',
    '전체를 비교하는 질문은 community 요약을 map-reduce로 모아 답한다.',
    '라우터는 종합 키워드면 global, 엔티티가 잡히면 local, 모호하면 global로 보낸다.',
  ];
  const review = [
    { q: '"Bob이 속한 팀은?"이 global로 분류되어 비용이 크게 나왔다. 먼저 확인할 것은?',
      o: ['GLOBAL_KEYWORDS에 "팀" 같은 흔한 단어가 들어가 있는지', 'Reduce 프롬프트 길이', 'hops 값'], a: 0,
      why: '라우터는 키워드 검사를 엔티티보다 먼저 한다. 흔한 단어가 키워드에 있으면 엔티티가 있는 질문도 global로 빠진다.' },
    { q: 'Local 답변에 Frank가 빠졌다는 불만이 왔다. Frank는 Carol을 거쳐야 닿는다. 고칠 곳은?',
      o: ['community 요약을 다시 만든다', 'Cypher의 hops를 2로 늘린다', 'gpt-4o로 모델을 바꾼다'], a: 1,
      why: 'Frank는 Alice에서 2홉이다. -[r*1..1]- 패턴으로는 닿지 않으니 반경을 2로 넓혀야 한다.' },
    { q: 'community가 50개로 늘었다. Global 검색에서 가장 크게 늘어나는 것은?',
      o: ['Local 질문의 응답 시간', '서브그래프 크기', 'Map 단계 LLM 호출 수와 비용'], a: 2,
      why: 'Map은 요약마다 한 번씩 부르므로 호출이 N+1, 즉 51번이 된다. Local 검색은 영향을 받지 않는다.' },
  ];

  R.page({ title: 'Local vs Global 검색', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
