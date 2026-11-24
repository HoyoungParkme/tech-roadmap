/* IV-1-2 관계 추출 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, BAD, GOOD, WARN, INFO } = C;

  const TC = { Person: ACC, Company: INFO, City: WARN }, TBG = { Person: C.ACCBG, Company: C.INFOBG, City: C.WARNBG };
  const N = { alice: ['Alice', 'Person', 440, 100], bob: ['Bob', 'Person', 440, 262], acme: ['Acme', 'Company', 650, 100],
    globex: ['Globex', 'Company', 650, 262], seoul: ['서울', 'City', 860, 100], busan: ['부산', 'City', 860, 262] };
  const ID = { Alice: 'alice', Bob: 'bob', Acme: 'acme', Globex: 'globex', 서울: 'seoul', 부산: 'busan' };
  const SENT = ['Alice는 Acme에서 일한다.', 'Acme는 서울에 있다.', 'Bob은 Globex 소속이다.', 'Globex 본사는 부산이다.', '그녀는 서울에 산다.', '서울이 Alice에서 일한다(?)'];
  const CONF = [0.94, 0.97, 0.91, 0.89];
  const RN = 31;

  function nodeAt(id, o) { o = o || {}; const [name, type, x, y] = N[id], s = o.s ?? 1; if (s <= 0) return;
    const g = R.G(x, y, s, o.op);
    el('circle', { cx: 0, cy: 0, r: RN, fill: TBG[type], stroke: o.ring || TC[type], 'stroke-width': o.ring ? 4 : 2.5, 'stroke-dasharray': o.dash }, g);
    tx(0, 6, name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: TC[type] }, g);
    R.mono(0, RN + 19, ':' + type, { 'text-anchor': 'middle', 'font-size': 13.5, fill: TC[type] }, g); }
  function nodes(o) { Object.keys(N).forEach((id) => nodeAt(id, (o && o[id]) || {})); }
  // 엣지 기하: 곧은 선 또는 곡선 (from, to, bend)
  function geo(a, b) { const [, , x1, y1] = N[a], [, , x2, y2] = N[b];
    if (a === 'alice' && b === 'seoul') return { d: `M${x1 + 14},${y1 - 28} Q650,-28 ${x2 - 14},${y2 - 28}`, lx: 650, ly: 36 };
    if (a === 'seoul' && b === 'alice') return { d: `M${x1 - 22},${y1 + 22} Q650,262 ${x2 + 22},${y2 + 22}`, lx: 650, ly: 184 };
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    return { d: `M${x1 + ux * (RN + 2)},${y1 + uy * (RN + 2)} L${x2 - ux * (RN + 6)},${y2 - uy * (RN + 6)}`, lx: (x1 + x2) / 2, ly: (y1 + y2) / 2 - 12 }; }
  const KCOL = { ok: INK, coref: WARN, invalid: BAD, ghost: OFF, hot: ACC };
  function edge(a, b, label, kind, g, o) { o = o || {}; if (g <= 0) return; const G0 = geo(a, b), col = KCOL[kind] || INK;
    el('path', { d: G0.d, fill: 'none', stroke: col, 'stroke-width': kind === 'ghost' ? 2 : 3, pathLength: 1, 'stroke-dasharray': kind === 'invalid' || kind === 'ghost' ? (g < 1 ? `${g} 1` : '0.03 0.02') : `${g} 1`,
      'marker-end': g >= 0.98 && kind !== 'ghost' ? (kind === 'invalid' ? 'url(#ra-ahr)' : kind === 'hot' ? 'url(#ra-ahb)' : 'url(#ra-ah)') : null, opacity: o.op ?? 1 });
    if (label && g > 0.6) { const w = tw(label, 13.5) + 12, op = clamp((g - 0.6) / 0.4) * (o.op ?? 1);
      el('rect', { x: G0.lx - w / 2, y: G0.ly - 13, width: w, height: 20, rx: 4, fill: PANEL, opacity: op });
      mono(G0.lx, G0.ly + 2, label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: op });
      if (o.conf) mono(G0.lx, G0.ly + 24, o.conf, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op }); } }
  // 왼쪽: 원문 문장 6줄 + triple 목록
  function source(hi, o) { o = o || {}; zone(12, 14, 318, 198, '원문', { fill: SOFT });
    SENT.forEach((s, i) => { const on = hi === i, y = 58 + i * 26;
      if (on) el('rect', { x: 20, y: y - 18, width: 302, height: 25, rx: 5, fill: C.HL, opacity: 0.8 });
      mono(28, y, `[${i + 1}]`, { 'font-size': 13.5, fill: MUT });
      tx(62, y, o.text && o.text[i] ? o.text[i] : s, { 'font-size': 14.5, 'font-weight': on ? 700 : 500, fill: i === 5 ? BAD : INK, opacity: o.dim && !on ? 0.55 : 1 }); }); }
  const SCOL = { pending: MUT, ok: GOOD, coref: WARN, invalid: BAD };
  function triples(list, o) { o = o || {}; zone(12, 226, 318, 186, `추출된 triple  ${list.length}`, { fill: PANEL, stroke: GRID, sw: 1.5 });
    if (!list.length) { sub(171, 320, o.empty || '(아직 없음)', 1, { 'font-size': 14 }); return; }
    list.forEach((t, i) => { const y = 268 + i * 24, s = o.appear ? o.appear(i) : 1; if (s <= 0) return;
      mono(24, y, `(${t.s}, ${t.p}, ${t.o})`, { 'font-size': 13.5, 'font-weight': 700, fill: SCOL[t.status] || INK, opacity: s });
      if (t.status === 'ok') check(312, y - 5, 6, s); else if (t.status === 'invalid') cross(312, y - 5, 6, s);
      else mono(318, y, t.status === 'coref' ? 'coref' : '…', { 'font-size': 13.5, fill: SCOL[t.status], 'text-anchor': 'end', opacity: s }); }); }
  function drawEdges(list, skip) { (list || []).forEach((e) => { if (skip && skip(e)) return; edge(e.from, e.to, e.label, e.kind, 1); }); }
  function counter(n, x) { mono(x || 948, 404, '엣지 ' + n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: n ? ACC : MUT }); }

  // 1. 노드만 있다
  function s1(t, c) { const { k, u } = c, b = c.beat;
    source(b.sentenceHi); triples([], { empty: '관계 정보 없음' });
    if (k === 0) { const s = pop(u, 0.3); card(650, 180, 300, 170, { rx: 12, stroke: INK, s });
      R.mono(530, 130, 'nodes.json', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.5) });
      R.mono(530, 170, '"nodes": [ 6개 ]', { 'font-size': 15, opacity: fade(u, 0.8) });
      R.mono(530, 204, '"edges": []', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.1) });
      sub(650, 300, '"Alice가 일하는 도시는?" 답할 길이 없다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    Object.keys(N).forEach((id, i) => { const [, , x, y] = N[id], g = k === 1 ? E(u, 0.2 + i * 0.2, 0.8 + i * 0.2) : 1;
      if (k === 1 && g < 1) { if (g > 0) el('circle', { cx: lerp(650, x, g), cy: lerp(180, y, g), r: 8, fill: TC[N[id][1]] }); return; }
      nodeAt(id, { s: k === 1 ? pop(u, 0.8 + i * 0.2) : 1 }); });
    if (k === 1) mono(948, 404, 'Person 2 · Company 2 · City 2', { 'font-size': 14, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 1.8) });
    if (k === 2) { [['alice', 'acme'], ['acme', 'seoul'], ['bob', 'globex'], ['globex', 'busan']].forEach(([a, b2], i) => { edge(a, b2, null, 'ghost', E(u, 0.3 + i * 0.25, 0.8 + i * 0.25));
        const G0 = geo(a, b2); tx(G0.lx, G0.ly + 18, '?', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1 + i * 0.25) }); });
      counter(0); R.mono(380, 404, '"edges": []', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 3) { const qs = ['Alice는 어디서 일하나?', 'Acme는 어느 도시에 있나?', 'Alice가 일하는 도시는? (2홉)'];
      qs.forEach((q, i) => { const y = 350 + i * 26, s = fade(u, 0.3 + i * 0.5); tx(380, y, q, { 'font-size': 15, 'font-weight': 700, opacity: s }); cross(372 + tw(q, 15) * 0.9 + 26, y - 5, 7, pop(u, 0.5 + i * 0.5)); });
      edge('alice', 'acme', null, 'ghost', E(u, 1.4, 1.9)); edge('acme', 'seoul', null, 'ghost', E(u, 1.8, 2.3)); }
    if (k === 4) { banner(650, 370, 'LLM에게 (주어, 관계, 목적어) triple을 뽑게 한다', pop(u, 0.4)); } }

  // 2. LLM 프롬프트로 관계 추출
  const ALLOWED = ['WORKS_AT', 'LOCATED_IN', 'LIVES_IN', 'KNOWS'];
  function s2(t, c) { const { k, u } = c, b = c.beat;
    source(b.sentenceHi); triples(b.triples, { appear: k === 3 ? (i) => fade(u, 1.4 + i * 0.4) : k === 4 ? (i) => (i < 2 ? 1 : fade(u, 0.8 + (i - 2) * 0.4)) : null, empty: '(LLM 호출 전)' });
    nodes(); if (k < 4) counter(0);
    const Y = 360;
    if (k === 0) { [['화이트리스트', '허용한 라벨만'], ['few-shot 2개', '출력 형식 고정']].forEach(([a, s], i) => {
        card(500 + i * 280, Y, 250, 64, { rx: 10, stroke: ACC, sw: 2, text: a + '\n' + s, fs: 15, s: pop(u, 0.3 + i * 0.5) }); }); }
    if (k === 1) { tx(372, Y - 22, 'ALLOWED', { 'font-size': 14, 'font-weight': 800, fill: MUT });
      ALLOWED.forEach((a, i) => pill(436 + i * 140, Y + 8, a, ACC, pop(u, 0.3 + i * 0.3), { mono: true, fs: 14 })); }
    if (k === 2) { R.mono(372, Y - 14, '"철수는 카카오에서 일한다."', { 'font-size': 14, opacity: fade(u, 0.2) });
      R.mono(372, Y + 10, '→ ["철수", "WORKS_AT", "카카오"]', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
      R.mono(372, Y + 34, '→ ["카카오", "LOCATED_IN", "판교"]', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1) });
      const g = E(u, 1.2, 2.2); R.hbar(760, Y - 4, 140, lerp(80, 92, g), 100, { h: 16, text: Math.round(lerp(80, 92, g)) + '%' });
      sub(830, Y + 34, '형식 정확도 (예시 수치)', fade(u, 1.2)); }
    if (k >= 3) { const L = [650, Y]; card(L[0], L[1], 150, 56, { rx: 12, stroke: ACC, fill: C.ACCBG, sw: 2.5, text: 'gpt-4o-mini', fs: 15, s: k === 3 ? pop(u, 0.2) : 1 });
      if (k === 3) { [0, 1].forEach((i) => dot([[322, 58 + i * 26], [560, 58 + i * 26], [L[0] - 75, L[1]]], seg(u, 0.4 + i * 0.3, 1.4 + i * 0.3), ACC, 6));
        R.mono(L[0] + 90, L[1] + 5, 'json_object', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) }); }
      if (k === 4) { // 화이트리스트 깔때기
        el('path', { d: `M760,${Y - 26} L900,${Y - 26} L855,${Y + 2} L855,${Y + 22} L805,${Y + 22} L805,${Y + 2} Z`, fill: C.GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.3) });
        R.mono(830, Y - 8, 'ALLOWED', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 800, opacity: fade(u, 0.4) });
        for (let i = 0; i < 4; i++) dot([[L[0] + 75, L[1]], [830, Y - 10], [830, Y + 30]], seg(u, 0.5 + i * 0.25, 1.3 + i * 0.25), ACC, 5);
        R.mono(948, 404, '통과 4 · 엣지 0', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 1.8) }); } } }

  // 3. triple을 그래프에 적재 (MERGE)
  const TRI = [['alice', 'acme', 'WORKS_AT'], ['acme', 'seoul', 'LOCATED_IN'], ['bob', 'globex', 'WORKS_AT'], ['globex', 'busan', 'LOCATED_IN']];
  function s3(t, c) { const { k, u } = c, b = c.beat;
    source(b.sentenceHi); triples(b.triples);
    if (k === 2) el('path', { d: 'M440,100 L650,100 L860,100', fill: 'none', stroke: C.HL, 'stroke-width': 22, 'stroke-linecap': 'round', opacity: 0.8 * fade(u, 1.8) });
    nodes();
    const done = b.edges.length, prevN = c.prev && c.prev.title === b.title ? c.prev.edges.length : 0;
    TRI.forEach(([a, b2, l], i) => { if (i >= done) return; const fresh = i === done - 1 && done > prevN;
      edge(a, b2, l, fresh && u < 2.4 ? 'hot' : 'ok', fresh ? E(u, 0.9, 1.8) : 1, { conf: k >= 5 || fresh ? 'conf ' + CONF[i] : null });
      if (fresh) fly(170, 268 + i * 24, (N[a][2] + N[b2][2]) / 2, N[a][3] - 12, seg(u, 0.1, 0.9), l, { mono: true }); });
    if (k === 0) { // 같은 triple 두 번 → 엣지 하나
      R.mono(372, 350, 'MERGE (s)-[r]->(o)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      fly(380, 390, 600, 390, seg(u, 0.4, 1.2), '(Alice, WORKS_AT, Acme)', { mono: true, stay: true });
      const g2 = seg(u, 1.4, 2.2); fly(380, 390, lerp(560, 520, g2), 390, g2, '같은 triple 또 들어옴', { fill: BAD });
      if (u > 2.2) { cross(780, 390, 8, pop(u, 2.2)); tx(800, 395, '엣지는 하나만', { 'font-size': 14.5, 'font-weight': 700, fill: BAD }); } }
    if (k === 2) { tx(650, 340, 'Alice → Acme → 서울  2홉 경로가 생겼다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 2) }); }
    if (k === 5) snippet(372, 330, ['UNWIND $triples AS t', 'MERGE (s {id: t.subject.id})-[r:RELATION]->(o)', 'SET r.confidence = t.confidence'], { fs: 13.5, op: fade(u, 0.3) });
    counter(done); }

  // 4. coreference: 그녀 → Alice
  function s4(t, c) { const { k, u } = c, b = c.beat;
    const sub4 = k >= 3 ? ['', '', '', '', k === 3 && u < 1.2 ? '그녀는 서울에 산다.' : 'Alice는 서울에 산다.'] : null;
    source(b.sentenceHi, { text: sub4, dim: true }); triples(b.triples, { appear: (i) => (i === 4 && k === 2 ? fade(u, 0.5) : 1) });
    nodes({ alice: k >= 1 && k <= 3 ? { ring: WARN, dash: '6 4' } : {} });
    drawEdges(b.edges, (e) => e.kind === 'coref');
    if (k === 0) { card(650, 360, 300, 58, { rx: 12, stroke: WARN, sw: 2.5, text: 'spaCy  +  fastcoref', fs: 16, s: pop(u, 0.3) });
      tx(330, 166, '←', { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: fade(u, 1) }); }
    if (k >= 1 && k <= 2) { const g = k === 1 ? E(u, 0.3, 1.5) : 1;
      el('path', { d: `M100,160 C300,190 330,140 ${lerp(100, 408, g)},${lerp(160, 108, g)}`, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
      pill(520, 190, '그녀 ≡ Alice', WARN, k === 1 ? pop(u, 1.4) : 1, { fs: 14.5 }); }
    if (k === 2) { el('path', { d: 'M760,170 Q800,130 828,116', fill: 'none', stroke: OFF, 'stroke-width': 2.5, 'stroke-dasharray': '5 5', opacity: fade(u, 0.8) });
      tx(752, 188, '?', { 'font-size': 26, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
      tx(650, 370, '주어가 "그녀"라 어느 노드인지 모른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) }); }
    if (k === 3) { const g = E(u, 0.6, 1.4);
      tx(470, 360, '그녀는', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: 1 - g * 0.6, 'text-decoration': 'line-through' });
      grow(540, 354, 600, 354, g, WARN); tx(612, 360, 'Alice는 서울에 산다.', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: g });
      sub(650, 396, 'resolved_text로 원문을 바꾼다', fade(u, 1.6)); }
    if (k === 4) { edge('alice', 'seoul', 'LIVES_IN', 'coref', E(u, 0.3, 1.5));
      tx(650, 370, '재추출 → (Alice)-[:LIVES_IN]->(서울)', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) }); }
    else if (k > 4) edge('alice', 'seoul', 'LIVES_IN', 'coref', 1);
    counter(k === 4 ? Math.round(lerp(4, 5, E(u, 1, 1.6))) : 4); }

  // 5. 온톨로지 검증
  const RULES = [['WORKS_AT', 'Person', 'Company'], ['LOCATED_IN', 'Company', 'City'], ['LIVES_IN', 'Person', 'City'], ['KNOWS', 'Person', 'Person']];
  function s5(t, c) { const { k, u } = c, b = c.beat;
    source(b.sentenceHi); triples(b.triples, { appear: (i) => (i === 5 && k === 1 ? fade(u, 0.4) : 1) });
    nodes({ seoul: k === 2 || k === 3 ? { ring: BAD } : {}, alice: k === 2 || k === 3 ? { ring: BAD } : {} });
    b.edges.forEach((e) => { if (e.kind === 'invalid') return;
      const kind = e.label === 'LIVES_IN' ? (k < 3 ? 'coref' : 'ok') : 'ok'; edge(e.from, e.to, e.label, kind, 1); });
    const Y = 352;
    if (k === 0) RULES.forEach(([l, d, r2], i) => { const x = 372 + (i % 2) * 290, y = Y - 12 + Math.floor(i / 2) * 30;
      R.spans(x, y, [[d, { fill: TC[d], 'font-weight': 700 }], [' -' + l + '-> ', { fill: INK }], [r2, { fill: TC[r2], 'font-weight': 700 }]], { 'font-size': 14, opacity: fade(u, 0.3 + i * 0.3) }); });
    if (k === 1) { R.mono(372, Y, 'ONTOLOGY.get("WORKS_AT")', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      R.mono(372, Y + 28, '→ domain Person · range Company', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.1) }); check(712, Y + 22, 8, pop(u, 1.4)); }
    const inv = b.edges.find((e) => e.kind === 'invalid');
    if (inv && k >= 2 && k <= 3) edge('seoul', 'alice', 'WORKS_AT', 'invalid', k === 2 ? E(u, 0.3, 1.3) : 1);
    if (k === 2) { R.mono(372, Y, 's_label = City', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) });
      R.mono(372, Y + 28, 'o_label = Person', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) }); }
    if (k === 3) { cross(650, 210, 14, pop(u, 0.4));
      R.spans(372, Y, [['WORKS_AT domain = ', {}], ['Person', { fill: ACC, 'font-weight': 800 }], ['  주어 = ', {}], ['City', { fill: BAD, 'font-weight': 800 }]], { 'font-size': 15, opacity: fade(u, 0.6) });
      R.mono(372, Y + 28, '→ invalid   ·   LIVES_IN: Person→City → ok', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) }); }
    if (k === 4) { const g = E(u, 0.2, 1.2); edge('seoul', 'alice', 'WORKS_AT', 'invalid', 1, { op: 1 - g });
      fly(650, 184, 800, 370, seg(u, 0.4, 1.4), '(서울, WORKS_AT, Alice)', { fill: BAD, mono: true });
      card(800, 370, 230, 50, { rx: 8, stroke: BAD, sw: 2, text: 'reject.log', fs: 15, color: BAD, s: pop(u, 1.3) });
      tx(372, 376, '통과한 5개만 MERGE', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) }); }
    if (k < 4) counter(5); }

  const quiz = [
    { q: '노드 6개만 있고 edges가 빈 그래프로 답할 수 없는 질문은 무엇인가?',
      o: ['노드가 몇 개인가?', 'Alice가 일하는 회사가 있는 도시는 어디인가?', 'Bob이라는 노드가 있는가?'], a: 1,
      why: 'Alice → Acme → 서울로 이어지는 2홉 경로가 있어야 답할 수 있다. 엣지가 0개라 소속·소재지·멀티홉 질문이 모두 막힌다.' },
    { q: '관계 추출 프롬프트에서 ALLOWED 목록이 하는 일은 무엇인가?',
      o: ['허용한 라벨 밖의 triple을 버린다', 'LLM 호출 비용을 줄인다', '대명사를 엔티티로 바꾼다'], a: 0,
      why: 'LLM이 라벨을 자유롭게 지어내지 못하게 WORKS_AT·LOCATED_IN·LIVES_IN·KNOWS만 남긴다. few-shot 예시는 출력 형식을 고정한다.' },
    { q: 'triple을 적재할 때 CREATE 대신 MERGE를 쓰는 까닭은 무엇인가?',
      o: ['엣지에 confidence를 저장하려고', '노드 라벨을 바꾸려고', '같은 (s, p, o)가 다시 들어와도 엣지를 하나만 두려고'], a: 2,
      why: 'MERGE는 이미 있으면 그대로 쓰고 없을 때만 만든다. 같은 문장을 다시 처리해도 엣지가 두 번 생기지 않는다.' },
    { q: '"그녀는 서울에 산다."에서 LIVES_IN 엣지를 얻으려면 무엇이 먼저 필요한가?',
      o: ['온톨로지 검증', '"그녀"를 Alice로 바꾸는 coreference 해결', 'confidence 임계값 낮추기'], a: 1,
      why: '주어가 대명사면 어느 노드인지 정할 수 없다. 치환한 뒤 다시 추출해야 (Alice)-[:LIVES_IN]->(서울)이 들어와 엣지가 4개에서 5개가 된다.' },
    { q: '(서울)-[:WORKS_AT]->(Alice)가 거부된 이유는 무엇인가?',
      o: ['WORKS_AT의 domain은 Person인데 주어가 City라서', 'WORKS_AT이 온톨로지에 없어서', 'Alice 노드가 없어서'], a: 0,
      why: 'WORKS_AT 규칙은 Person → Company만 허용한다. 주어 타입이 City라 invalid로 판정되고 reject.log로 간다.' },
  ];

  const summary = [
    '엔티티만 있고 엣지가 없으면 소속이나 멀티홉 질문에 답할 수 없다.',
    'LLM에 라벨 화이트리스트와 few-shot을 주고 문장마다 triple을 뽑는다.',
    'MERGE로 중복 없이 엣지를 넣으면 Alice에서 Acme를 거쳐 서울까지 이어진다.',
    '대명사는 coref로 바꿔 다시 뽑고, 타입이 안 맞는 관계는 온톨로지로 거른다.',
  ];
  const review = [
    { q: '대명사가 많은 소설에 관계 추출을 돌렸더니 주인공 노드의 엣지가 유난히 적다. 먼저 의심할 것은?',
      o: ['coref 없이 한 번만 추출해 대명사 문장의 관계를 놓쳤다', 'MERGE가 엣지를 지웠다', '온톨로지가 너무 넓다'], a: 0,
      why: '"그녀는 서울에 산다"처럼 대명사가 주어인 문장은 주어를 확정하지 못한다. 치환 후 재추출하는 2-pass가 필요하다.' },
    { q: '그래프에 (서울)-[:WORKS_AT]->(Alice) 같은 엣지가 섞여 들어왔다. 막는 방법으로 맞는 것은?',
      o: ['few-shot 예시를 지운다', '적재 전에 domain·range 규칙으로 검증한다', 'confidence를 저장하지 않는다'], a: 1,
      why: '라벨이 허용 목록에 있어도 주어·목적어 타입이 틀릴 수 있다. 온톨로지 규칙으로 판정해 통과한 것만 MERGE한다.' },
    { q: 'Step 4에서 다시 뽑은 (Alice, LIVES_IN, 서울)이 ALLOWED에 LIVES_IN이 없는 상태였다면 어떻게 되나?',
      o: ['그대로 그래프에 들어간다', '온톨로지 검증에서만 걸러진다', '화이트리스트 필터에서 버려져 엣지가 생기지 않는다'], a: 2,
      why: 'extract_triples는 t[1]이 ALLOWED에 있는 것만 돌려준다. 재추출로 찾은 관계도 라벨 목록에 있어야 살아남는다.' },
  ];

  R.page({ title: '관계 그래프 빌더', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
