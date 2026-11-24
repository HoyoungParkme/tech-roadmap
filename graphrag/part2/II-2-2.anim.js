/* II-2-2 RDF vs Property Graph — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, dot, cross, check, fly } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 왼쪽: RDF Triple 표 ──
  const TX = 24, TW = 440, TY = 84, RH = 30, COL = [TX + 12, TX + 136, TX + 270];
  function panel(x, w, title, on, extra) { el('rect', { x, y: 50, width: w, height: 360, rx: 12, fill: on ? PANEL : SOFT, stroke: on ? INK : GRID, 'stroke-width': on ? 2 : 1.4 });
    tx(x + 14, 72, title, { 'font-size': 14, 'font-weight': 800, fill: on ? INK : MUT }); if (extra) mono(x + w - 14, 72, extra, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 700 }); }
  // rows: [{s, p, o, literal, col, op, s0(등장 0→1), hi}]
  function table(rows, o) { o = o || {}; const y0 = TY;
    ['주어', '술어', '목적어'].forEach((h, i) => tx(COL[i], y0 + 16, h, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }));
    el('line', { x1: TX + 8, y1: y0 + 26, x2: TX + TW - 8, y2: y0 + 26, stroke: GRID, 'stroke-width': 1.4 });
    rows.forEach((r, i) => { const y = y0 + 32 + i * RH, g = r.s0 ?? 1; if (g <= 0.01) return; const op = (r.op ?? 1) * g;
      if (r.hi) el('rect', { x: TX + 6, y, width: TW - 12, height: RH - 4, rx: 6, fill: r.hiCol || ACCBG, opacity: g });
      if (r.lit) el('rect', { x: COL[2] - 6, y: y + 2, width: TX + TW - COL[2], height: RH - 8, rx: 5, fill: GOODBG, opacity: op });
      const dx = (1 - g) * -30;
      [[r.s, INK], [r.p, MUT], [r.o, r.lit ? GOOD : INK]].forEach(([v, col], j) => mono(COL[j] + dx, y + 19, v, { 'font-size': 14, 'font-weight': j === 1 ? 600 : 700, fill: r.col || col, opacity: op })); }); }
  const T3 = [{ s: 'ex:alice', p: 'ex:worksAt', o: 'ex:acme' }, { s: 'ex:acme', p: 'ex:locatedIn', o: 'ex:sf' }, { s: 'ex:alice', p: 'ex:bornYear', o: '"1990"^^xsd:gYear', lit: true }];
  const REIF = [['ex:fact1', 'rdf:type', 'rdf:Statement'], ['ex:fact1', 'rdf:subject', 'ex:alice'], ['ex:fact1', 'rdf:predicate', 'ex:worksAt'], ['ex:fact1', 'rdf:object', 'ex:acme'], ['ex:fact1', 'ex:since', '"2018"^^xsd:gYear']];
  // 이번 beat 의 triples 를 표 행으로 (새 행은 미끄러져 들어온다)
  function rowsOf(c, o) { o = o || {}; const n0 = c.prev ? c.prev.triples.length : 0;
    return c.beat.triples.map((t, i) => Object.assign({ s: t.s, p: t.p, o: t.o, lit: t.literal, s0: i >= n0 ? E(c.u, o.at ?? 0.3, (o.at ?? 0.3) + 0.7) : 1 }, (o.each && o.each(i)) || {})); }

  // ── 오른쪽: 그래프 ──
  const GXL = 486, GW = 460;
  const RP = { alice: { x: 600, y: 180 }, acme: { x: 830, y: 180 }, sf: { x: 830, y: 330 }, lit: { x: 600, y: 330 }, foafP: { x: 830, y: 98 }, foafN: { x: 600, y: 98 } };
  const LC = { Person: [ACC, ACCBG], Company: [WARN, WARNBG], City: [INFO, INFOBG] };
  const NR = 32;
  function uri(P, s, o) { o = o || {}; const sc = o.s ?? 1; if (sc <= 0.02) return; const g = R.G(P.x, P.y, sc, o.op), w = Math.max(96, tw(s, 14) + 26);
    el('ellipse', { cx: 0, cy: 0, rx: w / 2, ry: 22, fill: o.fill || PANEL, stroke: o.col || INK, 'stroke-width': o.hi ? 3.4 : 2, 'stroke-dasharray': o.dash }, g);
    mono(0, 5, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: o.col || INK }, g); }
  function literal(P, s, o) { o = o || {}; const sc = o.s ?? 1; if (sc <= 0.02) return; const g = R.G(P.x, P.y, sc, o.op), w = tw(s, 13.5) + 20;
    el('rect', { x: -w / 2, y: -17, width: w, height: 34, rx: 3, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 }, g);
    mono(0, 5, s, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD }, g); }
  function arc(A, B, s, u, o) { o = o || {}; if (u <= 0) return; const col = o.col || MUT, ra = o.ra ?? 24, rb = o.rb ?? 26;
    const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, P = { x: A.x + dx / L * ra, y: A.y + dy / L * ra }, Q = { x: B.x - dx / L * rb, y: B.y - dy / L * rb }, t = clamp(u);
    el('line', { x1: P.x, y1: P.y, x2: lerp(P.x, Q.x, t), y2: lerp(P.y, Q.y, t), stroke: col, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, 'marker-end': t > 0.97 ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null });
    const lo = fade(t, 0.55, 0.35) * (o.op ?? 1); if (!s || lo <= 0) return; const M = { x: (P.x + Q.x) / 2 + (o.lx || 0), y: (P.y + Q.y) / 2 + (o.ly || 0) }, w = tw(s, 13.5) + 12;
    el('rect', { x: M.x - w / 2, y: M.y - 12, width: w, height: 24, rx: 5, fill: PANEL, stroke: col === MUT ? GRID : col, 'stroke-width': 1.2, opacity: lo });
    mono(M.x, M.y + 5, s, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col === MUT ? INK : col, opacity: lo });
    return { P, Q, M }; }
  function pgnode(n, o) { o = o || {}; const sc = o.s ?? 1; if (sc <= 0.02) return; const P = RP[n.id], [col, bg] = LC[n.label], g = R.G(P.x, P.y, sc, o.op);
    if (o.ring) el('circle', { cx: 0, cy: 0, r: NR + 8, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: o.ring }, g);
    el('circle', { cx: 0, cy: 0, r: NR, fill: bg, stroke: col, 'stroke-width': 2.6 }, g);
    tx(0, 5.5, n.display, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }, g);
    mono(0, NR + 19, ':' + n.label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col }, g);
    const props = Object.entries(n.props || {}); if (props.length) { const s = '{' + props.map(([k, v]) => `${k}: ${v}`).join(', ') + '}', w = tw(s, 13.5) + 14, gg = R.G(0, NR + 42, 1, o.propOp ?? 1, g);
      el('rect', { x: -w / 2, y: -12, width: w, height: 24, rx: 5, fill: o.propHi ? GOODBG : WARNBG, stroke: o.propHi ? GOOD : WARN, 'stroke-width': o.propHi ? 2.4 : 1.2 }, gg);
      mono(0, 5, s, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: o.propHi ? GOOD : WARN }, gg); } }
  function pg(c, o) { o = o || {}; const b = c.beat.pg, p = (c.prev && c.prev.pg) || { nodes: [], edges: [] }, u = c.u, out = {};
    b.edges.forEach((e) => { const fresh = !p.edges.some((z) => z.type === e.type), r = arc(RP[e.from], RP[e.to], ':' + e.type, fresh ? E(u, o.eAt ?? 0.6, (o.eAt ?? 0.6) + 0.9) : 1, { ra: NR + 2, rb: NR + 4, col: (o.ecol && o.ecol(e)) || MUT, op: o.op, lx: e.type === 'LOCATED_IN' ? 52 : 0, ly: e.type === 'WORKS_AT' ? -2 : 0 });
      out[e.type] = r; const pr = Object.entries(e.props || {}); if (pr.length && r) { const s = '{' + pr.map(([k, v]) => `${k}: ${v}`).join(', ') + '}', w = tw(s, 13.5) + 14, op = (fresh ? fade(u, (o.eAt ?? 0.6) + 1.0) : 1) * (o.op ?? 1);
        el('rect', { x: r.M.x - w / 2, y: r.M.y + 16, width: w, height: 24, rx: 5, fill: WARNBG, stroke: WARN, 'stroke-width': o.sinceHi ? 2.6 : 1.2, opacity: op }); mono(r.M.x, r.M.y + 33, s, { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); } });
    b.nodes.forEach((n, i) => { const fresh = !p.nodes.some((z) => z.id === n.id); pgnode(n, Object.assign({ s: fresh ? pop(u, o.nAt ?? 0.4) : 1, op: o.op }, (o.each && o.each(n)) || {})); });
    return out; }

  // 1. RDF 소개
  function s1(t, c) { const { k, u } = c, rdfOn = c.beat.focus !== 'pg';
    panel(TX, TW, 'RDF · Triple', rdfOn, 'triples 0'); panel(GXL, GW, 'Property Graph', !rdfOn, 'nodes 0 · edges 0');
    if (k === 0) { [['주어', 'subject'], ['술어', 'predicate'], ['목적어', 'object']].forEach(([a, z], i) => { const x = 100 + i * 140, s = pop(u, 0.3 + i * 0.4);
        card(x, 190, 124, 74, { rx: 10, s, stroke: [INK, MUT, INK][i], sw: 2, fill: PANEL }); if (s > 0.5) { tx(x, 186, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 }); mono(x, 208, z, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); } });
      mono(448, 196, '.', { 'font-size': 28, 'font-weight': 800, opacity: fade(u, 1.6) }); tx(244, 280, '사실 하나 = 세 칸 한 줄', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    const pre = [['ex:', 'http://example.org/', '우리 데이터의 URI 앞자리'], ['xsd:', 'XMLSchema#', '리터럴 자료형'], ['rdf:', '22-rdf-syntax-ns#', 'W3C 표준 어휘'], ['rdfs:', 'rdf-schema#', 'W3C 표준 어휘']];
    const shown = [0, 2, 4, 4, 4][k], fresh = (i) => (k === 1 && i < 2) || (k === 2 && i >= 2 && i < 4);
    if (k >= 1) pre.slice(0, shown).forEach(([p, full, note], i) => { const y = 108 + i * 64, g = fresh(i) ? E(u, 0.3 + (i % 2) * 0.6, 0.9 + (i % 2) * 0.6) : 1, op = k === 3 ? 0.5 : 1;
      mono(TX + 18, y, '@prefix ' + p, { 'font-size': 15, 'font-weight': 800, fill: i < 2 ? ACC : INFO, opacity: op * (g > 0 ? 1 : 0) });
      if (g > 0) { R.grow(TX + 150, y - 5, TX + 150 + 40 * g, y - 5, g, MUT, { sw: 1.6 }); mono(TX + 200, y, full, { 'font-size': 13.5, fill: MUT, opacity: op * g }); tx(TX + 200, y + 22, note, { 'font-size': 13.5, fill: i < 2 ? ACC : INFO, 'font-weight': 700, opacity: op * g }); } });
    if (k === 1) mono(TX + 18, 380, 'ex:alice = <http://example.org/alice>', { 'font-size': 14, fill: INK, opacity: fade(u, 1.8) });
    if (k === 2) tx(TX + 18, 380, '남이 만든 어휘를 URI로 바로 가져다 쓴다', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.8) });
    if (k === 3) { el('rect', { x: GXL + 40, y: 110, width: GW - 80, height: 250, rx: 14, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 8', opacity: fade(u, 0.3) });
      tx(GXL + GW / 2, 230, '노드 0 · 엣지 0', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.6) }); tx(GXL + GW / 2, 260, 'Step 3부터 같은 사실을 여기에', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.1) }); }
    if (k === 4) { tx(TX + 18, 380, '접두어만 준비된 빈 그래프', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) }); mono(TX + TW - 18, 380, 'triples 0', { 'font-size': 15, fill: MUT, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 0.8) }); } }

  // 2. Triple 로 사실 쓰기 (오른쪽은 RDF 그래프: URI 는 타원, 리터럴은 네모)
  function rdfGraph(c, o) { o = o || {}; const n = c.beat.triples.length, n0 = c.prev ? c.prev.triples.length : 0, u = c.u, at = (i) => (i >= n0 ? E(u, 0.9, 1.7) : 1), op = o.op ?? 1;
    if (n >= 1) { arc(RP.alice, RP.acme, 'ex:worksAt', at(0), { ra: 50, rb: 50, op }); }
    if (n >= 2) arc(RP.acme, RP.sf, 'ex:locatedIn', at(1), { ra: 24, rb: 26, op, lx: 0 });
    if (n >= 3) arc(RP.alice, RP.lit, 'ex:bornYear', at(2), { ra: 24, rb: 20, op });
    if (n >= 1) { uri(RP.alice, 'ex:alice', { s: n0 < 1 ? pop(u, 0.7) : 1, op }); uri(RP.acme, 'ex:acme', { s: n0 < 1 ? pop(u, 0.9) : 1, op, hi: o.acmeHi }); }
    if (n >= 2) uri(RP.sf, 'ex:sf', { s: n0 < 2 ? pop(u, 0.9) : 1, op });
    if (n >= 3) literal(RP.lit, '"1990"^^xsd:gYear', { s: n0 < 3 ? pop(u, 0.9) : 1, op }); }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    panel(TX, TW, 'RDF · Triple 표', true, `triples ${Math.round(tween(c.prev ? c.prev.triples.length : 0, b.triples.length, u))}`); panel(GXL, GW, '같은 triple을 그래프로 보면', true);
    if (k === 0) { [['ex:', ACC, '내 어휘'], ['xsd:', INFO, '자료형'], ['rdf:', INFO, '표준'], ['foaf:', INFO, '외부 어휘 (사람·이름)']].forEach(([p, col, note], i) => { const y = 120 + i * 52, s = i === 3 ? pop(u, 1.2) : pop(u, 0.2 + i * 0.2);
        const pw = tw('@prefix ' + p, 14) + 26; pill(TX + 18 + pw / 2, y, '@prefix ' + p, col, s, { mono: true }); tx(TX + 30 + pw, y + 5, note, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, i === 3 ? 1.4 : 0.3 + i * 0.2) }); });
      tx(GXL + GW / 2, 230, '아직 triple 없음', { 'text-anchor': 'middle', 'font-size': 16, fill: OFF, 'font-weight': 700 }); return; }
    table(rowsOf(c, { each: (i) => ({ hi: (k === 2 && (i === 0 || i === 1)) || (k === 1 && i === 0) || (k === 3 && i === 2), hiCol: k === 3 ? GOODBG : ACCBG }) }));
    if (k === 2) { [[COL[2], TY + 32 + 19], [COL[0], TY + 32 + RH + 19]].forEach(([x, y]) => el('rect', { x: x - 5, y: y - 16, width: 74, height: 22, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 1.2) }));
      tx(TX + 18, 250, '같은 URI ex:acme = 같은 자원', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.5) }); }
    rdfGraph(c, { acmeHi: k === 2 && u > 1.6 });
    if (k === 3) tx(TX + 18, 250, '목적어가 값이면 리터럴 (초록)', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.4) });
    if (k === 4) { arc(RP.alice, RP.foafP, 'rdf:type', E(u, 0.4, 1.2), { col: INFO, ra: 50, rb: 40, dash: '6 4', lx: -20 }); uri(RP.foafP, 'foaf:Person', { s: pop(u, 1.0), col: INFO, fill: INFOBG });
      arc(RP.alice, RP.foafN, 'foaf:name', E(u, 0.8, 1.6), { col: INFO, ra: 22, rb: 18, dash: '6 4' }); literal(RP.foafN, '"Alice"', { s: pop(u, 1.4) });
      [['ex:alice', 'rdf:type', 'foaf:Person'], ['ex:alice', 'foaf:name', '"Alice"']].forEach((r, i) => { const y = TY + 32 + (3 + i) * RH + 19, op = fade(u, 0.6 + i * 0.4); r.forEach((v, j) => mono(COL[j], y, v, { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: op })); });
      tx(TX + 18, 300, '외부 표준 어휘를 변환 없이 그대로', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 5) { const x = GXL + 18, y = 390; card(x + 110, y, 210, 46, { rx: 8, s: pop(u, 0.3), stroke: INFO, fill: INFOBG });
      tx(x + 16, y - 4, '다른 데이터셋', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.4) }); mono(x + 16, y + 16, 'ex:acme …', { 'font-size': 14, fill: INK, 'font-weight': 700, opacity: fade(u, 0.4) });
      R.grow(x + 200, y - 18, RP.acme.x - 30, RP.acme.y + 20, E(u, 0.8, 1.6), INFO, { dash: '5 4' });
      tx(TX + 18, 250, 'URI가 같으면 저절로 이어진다', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
      pill(TX + 90, 300, 'OWL 추론', INFO, pop(u, 1.8), { mono: true }); tx(TX + 160, 305, 'subClassOf 등을 얹을 수 있다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); } }

  // 3. 같은 사실을 Property Graph 로
  function s3(t, c) { const { k, u } = c, b = c.beat, onP = b.focus === 'pg';
    panel(TX, TW, 'RDF · Triple 표', !onP, 'triples 3'); panel(GXL, GW, 'Property Graph', onP, `nodes ${Math.round(tween(c.prev ? c.prev.pg.nodes.length : 0, b.pg.nodes.length, u))} · edges 0`);
    table(rowsOf(c, { each: (i) => ({ hi: i === 2 && k >= 4, hiCol: GOODBG, op: k === 5 && i === 2 ? 1 - 0.6 * seg(u, 1.6, 2.2) : 1 }) }));
    if (k === 0) { const s = '(변수:Label {속성: 값})'; mono(GXL + GW / 2, 200, s, { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      [['노드 하나 = 괄호 하나', INK, 240], ['라벨과 속성을 함께 담는다', WARN, 266]].forEach(([z, col, y], i) => tx(GXL + GW / 2, y, z, { 'text-anchor': 'middle', 'font-size': 15, fill: col, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.5) })); return; }
    pg(c, { op: k === 4 ? 0.45 : 1, each: (n) => ({ propHi: n.id === 'alice' && k === 5 && u > 1.3 }) });
    if (k === 5) { fly(COL[2] + 70, TY + 32 + 2 * RH + 14, RP.alice.x, RP.alice.y + NR + 42, seg(u, 0.4, 1.3), '"1990"', { mono: true, fill: GOOD });
      tx(TX + 18, 250, 'triple 한 줄이 노드 속성 하나로', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(TX + 18, 280, 'RDF 3줄 = PG 노드 3 · 엣지 0 + 속성', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 4) tx(TX + 18, 250, '값 하나가 triple 한 줄을 차지한다', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.8) }); }

  // 4. 엣지와 엣지 속성
  function s4(t, c) { const { k, u } = c, b = c.beat, reif = k >= 3, onP = b.focus === 'pg';
    const nT = reif ? Math.round(tween(3, 8, u)) : 3;
    panel(TX, TW, 'RDF · Triple 표', !onP || reif, `triples ${k === 3 ? nT : reif ? 8 : 3}`); panel(GXL, GW, 'Property Graph', onP, `nodes 3 · edges ${b.pg.edges.length}`);
    const rows = T3.map((r) => Object.assign({}, r));
    if (reif) REIF.forEach(([s, p, o], i) => rows.push({ s, p, o, lit: i === 4, s0: k === 3 ? E(u, 0.4 + i * 0.3, 0.9 + i * 0.3) : 1, col: i < 4 ? BAD : null, op: k === 4 ? 0.45 : 1 }));
    table(rows.map((r, i) => (i < 3 ? Object.assign(r, { hi: k === 4 && i < 2, op: k === 4 && i === 2 ? 0.45 : 1 }) : r)));
    if (k === 0) { mono(GXL + GW / 2, 108, '(a)-[:TYPE {속성}]->(b)', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      tx(GXL + GW / 2, 134, '관계에도 속성을 직접 단다', { 'text-anchor': 'middle', 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.0) }); }
    const r = pg(c, { op: k === 0 ? 0.5 : 1, eAt: 0.5, sinceHi: k === 3, ecol: (e) => (k === 4 ? ACC : MUT), each: (n) => ({ ring: k === 4 && n.id === 'sf' ? fade(u, 1.8) : 0 }) });
    if (k === 3) { tx(TX + 18, 400, '+5 triple', { 'font-size': 15, fill: BAD, 'font-weight': 800, opacity: fade(u, 2.0) }); tx(GXL + 18, 400, 'PG는 {since: 2018} 하나', { 'font-size': 15, fill: WARN, 'font-weight': 800, opacity: fade(u, 2.2) }); }
    if (k === 4 && r.WORKS_AT && r.LOCATED_IN) { const route = [[RP.alice.x, RP.alice.y], [RP.acme.x, RP.acme.y], [RP.sf.x, RP.sf.y]]; dot(route, seg(u, 0.4, 1.8), ACC, 7);
      card(GXL + 110, 380, 190, 36, { rx: 8, s: pop(u, 1.9), stroke: ACC, fill: ACCBG, text: 'city.name = "SF"', fs: 14.5, mono: true, color: ACC });
      mono(GXL + 215, 385, '2홉', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); } }

  // 5. 비교와 선택
  const CMP = [['단위', 'Triple (s, p, o)', '노드 + 엣지'], ['식별', 'URI (글로벌)', '내부 ID (로컬)'], ['엣지 속성', 'reification 필요', '직접 부착'],
    ['쿼리 언어', 'SPARQL', 'Cypher / Gremlin'], ['강점', '표준화 · 추론(OWL) · 호환', '직관적 · 속성 풍부 · 빠른 구현'], ['약점', '엣지 속성이 무겁다', '외부 어휘 호환이 약하다'],
    ['대표 도구', 'Jena · GraphDB · Stardog', 'Neo4j · Memgraph · Neptune'], ['사용처', '시맨틱 웹 · 의료 · 학술', '비즈니스 그래프 · GraphRAG']];
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { panel(TX, TW, 'RDF · SPARQL', k === 0, 'triples 3'); panel(GXL, GW, 'Property Graph · Cypher', k === 1, 'nodes 3 · edges 2');
      table(T3.map((r, i) => Object.assign({}, r, { hi: k === 0 && i < 2 && u > 0.9 + i * 0.5 })));
      if (k === 0) { R.snippet(TX + 10, 216, ['SELECT ?city WHERE {', '  ex:alice ex:worksAt ?c .', '  ?c ex:locatedIn ?city . }'], { fs: 14, op: fade(u, 0.3) });
        mono(TX + 18, 340, '?c = ex:acme', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.1) }); mono(TX + 18, 366, '?city = ex:sf', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) }); }
      pg(c, { op: k === 0 ? 0.45 : 1, ecol: () => (k === 1 ? ACC : MUT) });
      if (k === 1) { dot([[RP.alice.x, RP.alice.y], [RP.acme.x, RP.acme.y], [RP.sf.x, RP.sf.y]], seg(u, 0.5, 1.8), ACC, 7);
        mono(GXL + 16, 108, '(a)-[:WORKS_AT]->(c)-[:LOCATED_IN]->(city)', { 'font-size': 13.5, fill: INK, 'font-weight': 700, opacity: fade(u, 0.3) });
        card(GXL + 110, 396, 170, 28, { rx: 8, s: pop(u, 1.9), stroke: ACC, fill: ACCBG, text: '"SF" · 같은 답', fs: 14, color: ACC }); }
      return; }
    if (k <= 4) { const n = [0, 0, 3, 6, 8][k], n0 = [0, 0, 0, 3, 6][k], x0 = 30, xa = 170, xb = 560, y0 = 66, rh = 40;
      tx(xa, y0, 'RDF', { 'font-size': 16, 'font-weight': 800, fill: INFO }); tx(xb, y0, 'Property Graph', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      el('line', { x1: x0, y1: y0 + 12, x2: 930, y2: y0 + 12, stroke: GRID, 'stroke-width': 1.6 });
      CMP.slice(0, n).forEach(([a, l, r], i) => { const y = y0 + 40 + i * rh, g = i >= n0 ? E(u, 0.3 + (i - n0) * 0.45, 0.9 + (i - n0) * 0.45) : 1, op = i < n0 ? 0.55 : 1;
        if (g <= 0) return; el('rect', { x: x0, y: y - 25, width: 900 * g, height: rh - 4, rx: 6, fill: i >= n0 ? SOFT : 'none', opacity: op });
        tx(x0 + 12, y, a, { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: op * g }); tx(xa, y, l, { 'font-size': 15, 'font-weight': 700, opacity: op * g }); tx(xb, y, r, { 'font-size': 15, 'font-weight': 700, opacity: op * g }); });
      if (k === 3) tx(480, 404, '강점과 약점이 서로 반대다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 2.0) });
      return; }
    // k5: 고르는 기준
    card(480, 90, 470, 54, { rx: 12, s: pop(u, 0.2), stroke: INK, sw: 2.2, text: '외부 표준 어휘 호환·OWL 추론이 꼭 필요한가?', fs: 16 });
    R.grow(400, 118, 250, 210, E(u, 0.7, 1.2), INFO); R.grow(560, 118, 710, 210, E(u, 0.9, 1.4), ACC);
    tx(300, 160, '예', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.0) }); tx(650, 160, '아니오', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
    card(250, 250, 300, 70, { rx: 12, s: pop(u, 1.3), stroke: INFO, fill: INFOBG, sw: 2.4, text: 'RDF\nJena · GraphDB · Stardog', fs: 15 });
    card(710, 250, 320, 70, { rx: 12, s: pop(u, 1.5), stroke: ACC, fill: ACCBG, sw: 2.4, text: 'Property Graph\nGraphRAG 실전의 기본 (Neo4j)', fs: 15 });
    tx(480, 360, 'Amazon Neptune은 두 모델을 다 지원한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: 'RDF에서 모든 사실을 적는 기본 단위는 무엇인가?',
      o: ['노드 하나와 그 속성 묶음', '(주어, 술어, 목적어) 세 칸짜리 Triple', '테이블의 한 행'], a: 1,
      why: 'RDF는 사실 하나를 Triple 한 줄로 쓴다. 각 자원은 ex:alice 같은 URI로 식별한다.' },
    { q: 'ex:alice ex:bornYear "1990"^^xsd:gYear에서 목적어는 어떤 종류인가?',
      o: ['다른 자원을 가리키는 URI', '자료형이 붙은 리터럴 값', '술어를 다시 정의한 클래스'], a: 1,
      why: '따옴표 값에 ^^xsd:gYear 자료형이 붙은 리터럴이다. URI가 목적어면 그래프의 엣지가 된다.' },
    { q: 'RDF의 리터럴 triple ex:alice ex:bornYear "1990"은 Property Graph에서 무엇이 되나?',
      o: ['Alice 노드의 속성 {bornYear: 1990}', '새 노드 1990과 엣지 하나', 'Alice 노드의 두 번째 라벨'], a: 0,
      why: 'PG는 값을 노드 안에 속성으로 담는다. triple 한 줄이 속성 한 줄로 접힌다.' },
    { q: 'WORKS_AT 관계에 since 2018을 붙일 때 RDF reification으로 늘어나는 triple은 몇 개인가?',
      o: ['1개', '3개', '5개'], a: 2,
      why: 'rdf:Statement 선언과 subject·predicate·object 4개에 since 1개가 더해져 5개다. 3개였던 triple이 8개가 된다.' },
    { q: 'GraphRAG 실전에서 Property Graph를 기본으로 고르는 이유는 무엇인가?',
      o: ['OWL 추론을 가장 잘 지원해서', 'URI로 외부 데이터와 자동 연결돼서', '노드·엣지에 속성을 바로 달아 직관적이고 구현이 빨라서'], a: 2,
      why: 'PG는 엣지 속성도 직접 붙고 Cypher가 그림 모양 그대로 읽힌다. 표준 어휘 호환이 꼭 필요하면 RDF를 쓴다.' },
  ];

  const summary = [
    'RDF는 모든 사실을 URI로 된 Triple 한 줄씩 쓴다. 같은 URI끼리는 저절로 이어진다.',
    'Property Graph는 노드와 엣지에 라벨과 속성을 바로 단다. 리터럴 triple은 속성 하나가 된다.',
    '관계에 since 하나를 달 때 RDF는 triple이 3개에서 8개로 늘고 PG는 속성 하나면 된다.',
    'GraphRAG 실전은 Property Graph가 기본이고, 외부 표준 어휘가 필요하면 RDF를 쓴다.',
  ];
  const review = [
    { q: '병원 데이터를 SNOMED-CT 같은 외부 표준 어휘와 엮고 OWL 추론도 써야 한다. 어느 모델이 맞나?',
      o: ['Property Graph', 'RDF', '둘 다 상관없다'], a: 1,
      why: 'URI 기반이라 외부 어휘와 바로 이어지고 OWL 추론을 얹을 수 있다. 의료가 RDF의 대표 사용처다.' },
    { q: 'RDF로 근무 시작 연도를 관계마다 달았더니 triple 수가 크게 불었다. 원인은?',
      o: ['관계 속성마다 reification으로 Statement를 다시 세워서', 'URI가 너무 길어서', '리터럴에 자료형을 붙여서'], a: 0,
      why: 'since 하나를 달려고 관계를 ex:fact1 같은 자원으로 다시 세우면 triple이 5개 늘어난다.' },
    { q: '"Alice가 일하는 회사가 있는 도시"를 두 모델로 물었다. 맞는 설명은?',
      o: ['SPARQL로는 답할 수 없다', 'Cypher는 3홉이 필요하다', 'SPARQL은 triple 패턴 2줄, Cypher는 2홉 경로로 둘 다 SF를 얻는다'], a: 2,
      why: 'worksAt과 locatedIn 두 단계를 잇는 질문이다. 표현은 달라도 답은 SF로 같다.' },
  ];

  R.page({ title: '같은 사실, 두 모델', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
