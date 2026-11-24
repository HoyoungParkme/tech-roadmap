/* III-1-2 Cypher 기본 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 그래프는 페이지 STEPS의 nodes · edges · resultRows를 그대로 읽어 그린다 (앞 beat와 비교해 생기고 사라지는 것을 움직인다).
 * 결과 행 수·생성/삭제 개수는 networkx로 같은 연산을 흉내 내 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 그래프 (오른쪽) ----------
  const PX = (x) => 600 + (x - 160) * 0.75, PY = (y) => 40 + y * 0.78, RN = 30;
  function arrow(x1, y1, x2, y2, u, col, o) { if (u <= 0) return; o = o || {}; const x = lerp(x1, x2, clamp(u)), y = lerp(y1, y2, clamp(u));
    el('line', { x1, y1, x2: x, y2: y, stroke: col, 'stroke-width': o.sw || 2.6, opacity: o.op ?? 1, 'stroke-dasharray': o.dash, 'stroke-linecap': 'round' });
    if (u > 0.9) { const a = Math.atan2(y2 - y1, x2 - x1), s = 11; el('path', { d: `M${x},${y} L${x - s * Math.cos(a - 0.45)},${y - s * Math.sin(a - 0.45)} L${x - s * Math.cos(a + 0.45)},${y - s * Math.sin(a + 0.45)} Z`, fill: col, opacity: o.op ?? 1 }); } }
  function nodeShape(x, y, n, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.01) return; const comp = n.label === 'Company', col = comp ? INFO : ACC, bg = comp ? INFOBG : ACCBG, g = R.G(x, y, s, o.op ?? 1);
    if (o.ring > 0) el(comp ? 'rect' : 'circle', comp ? { x: -RN - 8, y: -RN + 2, width: 2 * RN + 16, height: 2 * RN - 4, rx: 14, fill: 'none', stroke: o.ringCol || WARN, 'stroke-width': 3, opacity: o.ring } : { cx: 0, cy: 0, r: RN + 8, fill: 'none', stroke: o.ringCol || WARN, 'stroke-width': 3, opacity: o.ring }, g);
    if (comp) el('rect', { x: -RN, y: -RN + 8, width: 2 * RN, height: 2 * RN - 16, rx: 9, fill: bg, stroke: col, 'stroke-width': 2.5 }, g);
    else el('circle', { cx: 0, cy: 0, r: RN, fill: bg, stroke: col, 'stroke-width': 2.5 }, g);
    tx(0, 5, n.props.name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800 }, g);
    tx(0, comp ? RN + 6 : RN + 18, ':' + n.label, { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT }, g); }
  function propTag(x, y, rows, op, hot) { if (!rows.length || op <= 0) return; const w = Math.max(...rows.map((r) => tw(r, 13.5))) + 18, h = rows.length * 19 + 8, x1 = x - RN - 12;
    el('rect', { x: x1 - w, y: y - h / 2, width: w, height: h, rx: 6, fill: hot ? WARNBG : SOFT, stroke: hot ? WARN : GRID, 'stroke-width': hot ? 2 : 1.2, opacity: op });
    rows.forEach((r, i) => mono(x1 - w + 9, y - h / 2 + 18 + i * 19, r, { 'font-size': 13.5, opacity: op, 'font-weight': hot ? 700 : 500 })); }
  const pos = (n) => ({ x: PX(n.x), y: PY(n.y) });
  function edgeGeo(a, b) { const A = pos(a), B = pos(b), d = Math.hypot(B.x - A.x, B.y - A.y), ux = (B.x - A.x) / d, uy = (B.y - A.y) / d;
    return { x1: A.x + ux * (RN + 3), y1: A.y + uy * (RN + 3), x2: B.x - ux * (RN + 6), y2: B.y - uy * (RN + 6) }; }
  // c.beat의 그래프를 그린다. o.ring(id) 덮어쓰기, o.noProps
  function graph(c, o) { o = o || {}; const b = c.beat, p = c.prev || { nodes: [], edges: [] }, u = c.u;
    const prevN = Object.fromEntries((p.nodes || []).map((n) => [n.id, n])), curN = Object.fromEntries(b.nodes.map((n) => [n.id, n]));
    el('rect', { x: 446, y: 22, width: 500, height: 330, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(462, 46, 'graph', { 'font-size': 13.5, class: 'mono', fill: MUT, 'font-weight': 700 });
    if (!b.nodes.length && !(p.nodes || []).length) { el('rect', { x: 500, y: 90, width: 390, height: 200, rx: 10, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
      sub(695, 196, '빈 그래프', 1, { 'font-size': 15 }); return; }
    // 사라지는 관계
    (p.edges || []).forEach((e) => { if (b.edges.some((x) => x.from === e.from && x.to === e.to)) return; const g = edgeGeo(prevN[e.from], prevN[e.to]), k = 1 - E(u, o.edgeGone || 0.3, (o.edgeGone || 0.3) + 0.7);
      if (k > 0) arrow(g.x1, g.y1, lerp(g.x1, g.x2, k), lerp(g.y1, g.y2, k), 1, BAD, { op: 0.9 }); });
    b.edges.forEach((e) => { const A = curN[e.from], B = curN[e.to]; if (!A || !B) return; const g = edgeGeo(A, B), had = (p.edges || []).some((x) => x.from === e.from && x.to === e.to);
      const gu = had ? 1 : E(u, o.edgeAt ?? 0.4, (o.edgeAt ?? 0.4) + 1.0), col = e.glow ? ACC : MUT, op = e.dim ? 0.25 : 1;
      arrow(g.x1, g.y1, g.x2, g.y2, gu, col, { op, sw: e.glow ? 3 : 2.4 });
      if (gu > 0.8) { const t0 = 0.42, mx = lerp(g.x1, g.x2, t0), my = lerp(g.y1, g.y2, t0), lop = op * clamp((gu - 0.8) * 5);
        el('rect', { x: mx - 42, y: my - 20, width: 84, height: 38, rx: 6, fill: PANEL, opacity: lop * 0.92 });
        mono(mx, my - 4, e.type, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: e.glow ? ACC : INK, opacity: lop });
        if (e.props) mono(mx, my + 13, 'since ' + e.props.since, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: lop }); } });
    // 사라지는 노드
    (p.nodes || []).forEach((n) => { if (curN[n.id]) return; const k = 1 - E(u, o.nodeGone || 1.0, (o.nodeGone || 1.0) + 0.7); const P = pos(n);
      if (k > 0) { nodeShape(P.x, P.y, n, { s: 0.6 + 0.4 * k, op: k, ring: 1, ringCol: BAD }); } });
    b.nodes.forEach((n) => { const P = pos(n), was = prevN[n.id], s = was ? 1 : pop(u, o.nodeAt ?? 0.4), op = n.dim ? (was && !was.dim ? 1 - 0.7 * E(u, 0.3, 0.9) : 0.3) : (was && was.dim ? 0.3 + 0.7 * E(u, 0.3, 0.9) : 1);
      const ringV = o.ring ? o.ring(n) : n.glow ? (was && was.glow ? 1 : fade(u, 0.5)) : 0;
      nodeShape(P.x, P.y, n, { s, op, ring: ringV, ringCol: o.ringCol });
      if (!o.noProps && n.label === 'Person') { const rows = Object.entries(n.props).filter(([k0]) => k0 !== 'name').map(([k0, v]) => {
          const pv = was && was.props[k0]; if (k0 === 'age' && typeof pv === 'number' && pv !== v) return 'age: ' + Math.round(tween(pv, v, u));
          return k0 + ': ' + v; });
        const pop0 = was ? 1 : fade(u, (o.nodeAt ?? 0.4) + 0.5), newKeys = was ? rows.length !== Object.keys(was.props).length - 1 : false;
        propTag(P.x, P.y, rows, op * pop0, n.isUpdated || newKeys); } }); }
  // 결과 표 (왼쪽 아래)
  function table(c, y0, o) { o = o || {}; const b = c.beat; if (!b.resultCols) return; const cols = b.resultCols, rows = b.resultRows || [], pr = (c.prev && c.prev.resultRows) || [];
    const w = Math.min(150, Math.floor(410 / cols.length)), x0 = 20;
    tx(x0, y0 - 8, `RETURN 결과 · ${rows.length} row${rows.length > 1 ? 's' : ''}`, { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    cells(x0, y0, cols, { w, h: 30, gap: 3, fs: 13.5, style: () => ({ fill: SOFT, stroke: GRID }) });
    rows.forEach((r, i) => { const fresh = i >= pr.length || JSON.stringify(pr[i]) !== JSON.stringify(r), s = fresh ? pop(c.u, (o.at ?? 0.9) + i * 0.3) : 1;
      cells(x0, y0 + 33 * (i + 1), cols.map((k0) => String(r[k0])), { w, h: 30, gap: 3, fs: 13.5, style: () => ({ stroke: fresh ? ACC : INK, fill: fresh ? ACCBG : PANEL, s }) }); }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function codeLines(lines, cur, u, y0) { lines.forEach((s, i) => { const on = cur.includes(i), op = on ? fade(u, 0.1) : 0.42;
      if (on) el('rect', { x: 14, y: y0 + i * 32 - 20, width: 420, height: 28, rx: 5, fill: ACCBG, opacity: op });
      R.spans(22, y0 + i * 32, R.tokens(s), { 'font-size': 13.5, opacity: Math.max(op, 0.42), 'font-weight': on ? 700 : 500 }); }); }
  const nodeOf = (c, id) => c.beat.nodes.find((n) => n.id === id);

  // ---------- 1. CREATE ----------
  const CREATE = ['CREATE (a:Person {name:"Alice", age:30}),', '       (b:Person {name:"Bob", age:22}),', '       (c:Company {name:"Acme"}),', '       (a)-[:WORKS_AT {since:2018}]->(c),', '       (b)-[:WORKS_AT {since:2021}]->(c);'];
  function s1(t, c) { const { k, u } = c;
    graph(c, { nodeAt: 0.9, edgeAt: 0.8 });
    if (k === 0) { const parts = [['(a:Person {name:"Alice"})', [['a', '변수'], [':Person', '라벨'], ['{…}', '속성']], ACC, 90], ['-[:WORKS_AT {since:2018}]->', [[':WORKS_AT', '관계 타입'], ['->', '방향']], INFO, 220]];
      parts.forEach(([s, marks, col, y], i) => { const op = fade(u, 0.2 + i * 0.8);
        mono(24, y, s, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: op });
        marks.forEach(([m, l], j) => { const at = s.indexOf(m === '{…}' ? '{' : m), w = (m === '{…}' ? s.indexOf('}') - at + 1 : m.length) * 9.6, x = 24 + at * 9.6, op2 = fade(u, 0.5 + i * 0.8 + j * 0.25);
          el('path', { d: `M${x},${y + 10} v7 h${w} v-7`, fill: 'none', stroke: col, 'stroke-width': 1.8, opacity: op2 });
          tx(x + w / 2, y + 36 + (j % 2) * 20, l, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col, opacity: op2 }); }); });
      note(24, 330, '괄호 ( )는 노드, 대괄호 [ ]는 관계', fade(u, 2.0)); return; }
    tx(16, 46, 'create.cypher', { 'font-size': 13.5, class: 'mono', fill: MUT, 'font-weight': 700 });
    const cur = [[0], [1], [2], [3, 4], [0, 1, 2, 3, 4]][k - 1];
    codeLines(CREATE, cur, u, 84);
    const tgt = { 1: 'a', 2: 'b', 3: 'c' }[k];
    if (tgt) { const n = nodeOf(c, tgt), P = pos(n); fly(380, 84 + (k - 1) * 32 - 6, P.x, P.y, seg(u, 0.2, 0.9), '(' + tgt + ')', { mono: true }); }
    if (k === 4) { fly(380, 186, 740, 150, seg(u, 0.2, 0.8), 'a→c', { mono: true }); fly(380, 218, 740, 230, seg(u, 0.4, 1.0), 'b→c', { mono: true }); }
    if (k === 5) { [['노드', 3, ACC], ['관계', 2, INFO]].forEach(([l, v, col], i) => { const x = 110 + i * 200;
        card(x, 300, 170, 70, { rx: 12, stroke: col, fill: PANEL, s: pop(u, 0.3 + i * 0.3) });
        mono(x - 50, 314, String(Math.round(v * E(u, 0.4 + i * 0.3, 1.4 + i * 0.3))), { 'font-size': 32, 'font-weight': 800, fill: col });
        tx(x + 2, 308, l + ' 생성', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) }); });
      sub(220, 372, 'CREATE 한 번, 쉼표로 이어 쓴 패턴 5개', fade(u, 1.6), { 'font-size': 14.5 }); }
  }

  // ---------- 2. MATCH … RETURN ----------
  function s2(t, c) { const { k, u } = c;
    graph(c, {});
    if (k === 0) { const m = E(u, 0.4, 1.4);
      mono(24, 110, 'CREATE', { 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: 1 - 0.6 * m, 'text-decoration': m > 0.3 ? 'line-through' : null });
      mono(24, 160, 'MATCH', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: m });
      mono(120, 135, '(p:Person)', { 'font-size': 22, 'font-weight': 800 });
      note(24, 230, '패턴은 그대로, 키워드만 바꾸면 조회', fade(u, 1.8)); return; }
    R.spans(22, 70, R.tokens('MATCH (p:Person)'), { 'font-size': 17, 'font-weight': 800 });
    R.spans(22, 102, R.tokens(k >= 3 ? 'RETURN p' : 'RETURN p.name, p.age'), { 'font-size': 17, 'font-weight': 800, opacity: k >= 2 ? (k === 2 || k === 3 ? fade(u, 0.1) : 1) : 0.3 });
    if (k === 1) { const scan = E(u, 0.2, 2.0) * 3; // 노드를 차례로 대 본다
      [['a', true], ['b', true], ['c', false]].forEach(([id, ok], i) => { const n = nodeOf(c, id), P = pos(n), on = clamp(scan - i);
        if (on <= 0) return; if (ok) { pill(160 + 0, 150 + i * 44, 'p = ' + n.props.name, ACC, pop(u, 0.4 + i * 0.6), { fill: PANEL, mono: true, fs: 14 }); }
        else { cross(P.x + 44, P.y - 30, 9, on); tx(24, 150 + i * 44 + 5, 'Acme는 :Company — 패턴 밖', { 'font-size': 14.5, fill: MUT, opacity: on }); } });
      return; }
    if (k === 2) { table(c, 170, { at: 0.8 }); ['a', 'b'].forEach((id, i) => { const P = pos(nodeOf(c, id)); fly(P.x - 60, P.y, 110, 220 + i * 33, seg(u, 0.2 + i * 0.3, 0.9 + i * 0.3), nodeOf(c, id).props.name, { mono: true }); }); return; }
    if (k === 3) { table(c, 170);
      const P = pos(nodeOf(c, 'a')); el('rect', { x: 24, y: 290, width: 300, height: 56, rx: 8, fill: SOFT, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.5) });
      mono(36, 314, 'p = (:Person {name:"Alice",', { 'font-size': 14, opacity: fade(u, 0.6) }); mono(36, 336, '               age:30})', { 'font-size': 14, opacity: fade(u, 0.6) });
      grow(P.x - 40, P.y + 20, 324, 316, E(u, 0.8, 1.4), ACC); note(24, 384, 'RETURN p는 노드 전체를 돌려준다', fade(u, 1.6)); }
  }

  // ---------- 3. WHERE ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { graph(c, {});
      tx(24, 60, 'SQL에서 쓰던 조건식 그대로', { 'font-size': 15, 'font-weight': 800 });
      [['=', '<>', '>', '<', '>='], ['AND', 'OR', 'NOT'], ['IN [ … ]', 'STARTS WITH', 'IS NULL']].forEach((row, i) => { let x = 24;
        row.forEach((s, j) => { const w = tw(s, 14) + 26; pill(x + w / 2, 110 + i * 56, s, INFO, pop(u, 0.3 + i * 0.4 + j * 0.1), { mono: true, fill: PANEL }); x += w + 10; }); });
      return; }
    graph(c, { ring: (n) => (k === 2 && n.id === 'a' ? 1 : k === 2 && n.id === 'b' ? 0 : n.glow ? 1 : 0) });
    R.spans(22, 70, R.tokens('MATCH (p:Person)'), { 'font-size': 17, 'font-weight': 800 });
    R.spans(22, 102, R.tokens('WHERE p.age > 25'), { 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: k >= 2 ? 1 : 0.3 });
    const cand = [['Alice', 30], ['Bob', 22]];
    cand.forEach(([nm, age], i) => { const y = 160 + i * 52, out = k >= 2 && age <= 25, drop = k === 2 && out ? E(u, 1.0, 1.8) : out ? 1 : 0;
      card(110, y + drop * 14, 170, 40, { rx: 20, stroke: out ? OFF : ACC, fill: PANEL, s: k === 1 ? pop(u, 0.4 + i * 0.3) : 1, op: 1 - drop * 0.6 });
      mono(56, y + 5 + drop * 14, `${nm}  age ${age}`, { 'font-size': 14.5, 'font-weight': 700, fill: out ? MUT : INK, opacity: (k === 1 ? fade(u, 0.5 + i * 0.3) : 1) * (1 - drop * 0.5) });
      if (k >= 2) { const r0 = k === 2 ? pop(u, 0.6 + i * 0.4) : 1; (out ? cross : check)(220, y, 10, r0);
        mono(240, y + 5, `${age} > 25`, { 'font-size': 14.5, 'font-weight': 700, fill: out ? BAD : GOOD, opacity: r0 }); } });
    if (k >= 2) { const n = k === 2 ? Math.round(tween(2, 1, u, 1.6)) : 1; mono(24, 290, `후보 ${n}명`, { 'font-size': 18, 'font-weight': 800, fill: WARN }); }
    if (k === 3) table(c, 330, { at: 0.5 });
  }

  // ---------- 4. 패턴 매칭 ----------
  function s4(t, c) { const { k, u } = c;
    graph(c, {});
    if (k === 0) { mono(24, 80, '(a)-[:R]->(b)', { 'font-size': 26, 'font-weight': 800, fill: INK, opacity: fade(u, 0.2) });
      const y = 170, s = E(u, 0.8, 1.8);
      el('circle', { cx: 70, cy: y, r: 26, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: s }); mono(70, y + 5, 'a', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, opacity: s });
      arrow(98, y, 300, y, s, INK, {}); mono(198, y - 12, ':R', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: s });
      el('circle', { cx: 330, cy: y, r: 26, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: s }); mono(330, y + 5, 'b', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, opacity: s });
      note(24, 250, '글자로 그린 그림이 곧 탐색 명령이다', fade(u, 2.0)); return; }
    R.spans(22, 64, R.tokens('MATCH (p:Person)-[r:WORKS_AT]->(c:Company)'), { 'font-size': 14.5, 'font-weight': 800 });
    R.spans(22, 92, R.tokens('RETURN p.name, r.since, c.name'), { 'font-size': 14.5, 'font-weight': 800, opacity: k >= 2 ? 1 : 0.35 });
    const A = nodeOf(c, 'a'), B = nodeOf(c, 'b'), Co = nodeOf(c, 'c'), ga = edgeGeo(A, Co), gb = edgeGeo(B, Co);
    if (k === 1) { dot([[ga.x1, ga.y1], [ga.x2, ga.y2]], seg(u, 0.2, 1.1), WARN, 8); dot([[gb.x1, gb.y1], [gb.x2, gb.y2]], seg(u, 0.9, 1.8), WARN, 8);
      [['p', pos(A).x, pos(A).y - 46, ACC], ['r', lerp(ga.x1, ga.x2, 0.7), lerp(ga.y1, ga.y2, 0.7) - 30, WARN], ['c', pos(Co).x + 46, pos(Co).y - 34, INFO]].forEach(([v, x, y, col], i) => pill(x, y, v, col, pop(u, 1.2 + i * 0.3), { mono: true, fill: PANEL, fs: 15 }));
      note(24, 160, '세 칸이 한꺼번에 묶인다', fade(u, 1.8)); note(24, 190, 'p = 사람, r = 관계, c = 회사', fade(u, 2.1), { fill: MUT }); return; }
    table(c, 150, { at: 1.4 });
    const who = k === 2 ? A : k === 3 ? B : null, g = k === 2 ? ga : gb;
    if (who) { const P = pos(who); fly(P.x, P.y - 46, 80, 216 + (k - 2) * 33, seg(u, 0.2, 0.9), who.props.name, { mono: true });
      fly(lerp(g.x1, g.x2, 0.42), lerp(g.y1, g.y2, 0.42), 220, 216 + (k - 2) * 33, seg(u, 0.4, 1.1), String((k === 2 ? 2018 : 2021)), { mono: true, fill: WARN });
      fly(pos(Co).x, pos(Co).y, 360, 216 + (k - 2) * 33, seg(u, 0.6, 1.3), 'Acme', { mono: true, fill: INFO }); }
    note(24, 330, k === 2 ? 'JOIN 없이 노드·관계·노드가 한 행' : '같은 모양의 조합마다 한 행씩', fade(u, 1.9));
  }

  // ---------- 5. MERGE ----------
  function s5(t, c) { const { k, u } = c;
    graph(c, { nodeAt: 0.9, edgeAt: 0.5 });
    if (k === 0) { card(90, 150, 130, 48, { rx: 10, text: 'MERGE', fs: 18, mono: true, stroke: ACC, s: pop(u, 0.2) });
      arrow(158, 140, 260, 96, E(u, 0.6, 1.1), GOOD); arrow(158, 160, 260, 210, E(u, 0.9, 1.4), INFO);
      tx(270, 92, '있으면 → MATCH', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.1) }); tx(270, 116, '기존 노드를 잡는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      tx(270, 214, '없으면 → CREATE', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4) }); tx(270, 238, '새로 만든다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
      note(24, 320, '몇 번 돌려도 중복 노드가 생기지 않는다', fade(u, 2.0)); return; }
    const L = ['MERGE (c:Company {name:"Acme"})', 'MERGE (p:Person {name:"Carol"})', '  ON CREATE SET p.age = 28, p.created_at = …', 'MERGE (p)-[r:WORKS_AT]->(c)', '  ON CREATE SET r.since = 2024'];
    const cur = [[0], [1], [2], [3, 4], []][k - 1];
    if (k < 5) codeLines(L.map((s) => s.length > 44 ? s.slice(0, 44) : s), cur, u, 66);
    if (k === 1) { const P = pos(nodeOf(c, 'c')); el('circle', { cx: P.x, cy: P.y, r: 46 + 10 * Math.sin(u * 6), fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 0.4) });
      check(P.x + 54, P.y - 44, 11, pop(u, 1.2)); note(24, 270, '찾았다 → 새로 만들지 않고 c로 잡는다', fade(u, 1.4), { fill: GOOD }); }
    if (k === 2) { ['a', 'b'].forEach((id, i) => { const P = pos(nodeOf(c, id)); el('circle', { cx: P.x, cy: P.y, r: 40, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: clamp(fade(u, 0.1 + i * 0.3) - fade(u, 0.5 + i * 0.3)) }); });
      note(24, 270, 'name:"Carol" 인 Person 없음 → 생성', fade(u, 0.9), { fill: INFO }); }
    if (k === 3) { note(24, 270, 'ON CREATE SET만 실행됐다', fade(u, 0.8), { fill: WARN }); mono(24, 298, 'ON MATCH SET p.last_seen  (이번엔 건너뜀)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2), 'text-decoration': 'line-through' }); }
    if (k === 4) note(24, 270, '관계도 없었으니 새로 생긴다', fade(u, 1.2), { fill: INFO });
    if (k === 5) { R.spans(22, 70, R.tokens('RETURN p.name, "true (신규)" AS created'), { 'font-size': 14.5, 'font-weight': 800 }); table(c, 130, { at: 0.4 });
      note(24, 260, '이번 실행: Acme는 매칭, Carol은 생성', fade(u, 1.2)); }
  }

  // ---------- 6. SET / DELETE ----------
  function s6(t, c) { const { k, u } = c;
    graph(c, { edgeGone: 0.3, nodeGone: 1.1, ring: (n) => (k === 3 && n.id === 'b' ? fade(u, 0.4) : n.glow ? 1 : 0), ringCol: k === 3 ? BAD : undefined });
    const L = k <= 2 ? ['MATCH (p:Person {name:"Alice"})', 'SET p.age = 31', 'RETURN p.name, p.age'] : ['MATCH (p:Person {name:"Bob"})', 'DETACH DELETE p'];
    const cur = [[0], [1], [2], [0], [1]][k];
    codeLines(L, cur, u, 66);
    if (k === 1) { mono(24, 200, 'age', { 'font-size': 18, 'font-weight': 800 }); mono(90, 200, String(Math.round(tween(30, 31, u))), { 'font-size': 26, 'font-weight': 800, fill: WARN });
      note(24, 240, '노드는 그대로, 속성 값만 덮어쓴다', fade(u, 1.4)); }
    if (k === 2) table(c, 190, { at: 0.5 });
    if (k === 3) { const P = pos(nodeOf(c, 'b'));
      el('rect', { x: 20, y: 160, width: 410, height: 82, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.0) });
      mono(34, 186, 'DELETE p  만 쓰면', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.1) });
      mono(34, 212, 'Cannot delete node,', { 'font-size': 14, opacity: fade(u, 1.3) }); mono(34, 232, 'has connected relationships', { 'font-size': 14, opacity: fade(u, 1.3) });
      pill(225, 278, 'Bob에게 관계 1개가 붙어 있다', BAD, pop(u, 0.6), { fill: PANEL, fs: 13.5 }); }
    if (k === 4) { [['관계 삭제', 1, 0.4], ['노드 삭제', 1, 1.2]].forEach(([l, v, a], i) => { const x = 110 + i * 200;
        card(x, 200, 170, 60, { rx: 12, stroke: BAD, fill: PANEL, s: pop(u, a) }); mono(x - 60, 212, String(v), { 'font-size': 28, 'font-weight': 800, fill: BAD, opacity: fade(u, a + 0.2) });
        tx(x - 30, 207, l, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a + 0.2) }); });
      note(24, 280, '관계를 먼저 지우고 노드를 지운다', fade(u, 1.8)); }
  }

  const quiz = [
    { q: 'CREATE (a:Person {name:"Alice", age:30})에서 Person은 무엇인가?',
      o: ['변수 이름', '노드의 라벨(카테고리)', '속성 키'], a: 1,
      why: '콜론 뒤가 라벨이다. a는 이 쿼리 안에서만 쓰는 변수이고, name과 age는 중괄호 안의 속성이다.' },
    { q: 'MATCH (p:Person) RETURN p.name, p.age를 실행하면 Acme 노드는 어떻게 되는가?',
      o: ['라벨이 :Company라 결과에 들어오지 않는다', 'name만 채워진 행으로 결과에 들어온다', '패턴에 안 맞아 그래프에서 지워진다'], a: 0,
      why: 'MATCH는 패턴에 맞는 노드만 고른다. Acme는 그대로 그래프에 남고 결과에만 빠진다.' },
    { q: 'WHERE p.age > 25를 걸었을 때 Bob(22)이 빠지는 시점은 언제인가?',
      o: ['MATCH가 후보를 고르기 전', 'MATCH로 후보 2명을 잡은 다음', 'RETURN이 표를 만든 다음'], a: 1,
      why: 'MATCH가 :Person 두 명을 후보로 잡고, WHERE가 그중 조건을 못 넘는 Bob을 걸러 1명만 남긴다.' },
    { q: 'MATCH (p:Person)-[r:WORKS_AT]->(c:Company) RETURN p.name, r.since, c.name의 결과가 2행인 이유는 무엇인가?',
      o: ['회사가 Acme 하나라서', ':Person 노드가 2개라서', '패턴에 맞는 (사람, 관계, 회사) 조합이 2개라서'], a: 2,
      why: '행은 패턴이 맞은 조합마다 하나씩 나온다. Alice-2018-Acme와 Bob-2021-Acme 두 조합이다.' },
    { q: 'MERGE (p:Person {name:"Carol"}) ON CREATE SET p.age = 28에서 age가 채워지는 경우는 언제인가?',
      o: ['Carol이 없어서 새로 만들어질 때만', 'Carol이 이미 있을 때만', '실행할 때마다 항상'], a: 0,
      why: 'ON CREATE SET은 생성 쪽으로 갔을 때만 돈다. 이미 있으면 ON MATCH SET 쪽이 실행된다.' },
    { q: '관계가 붙어 있는 Bob 노드를 지울 때 DETACH DELETE를 쓰는 이유는 무엇인가?',
      o: ['노드를 지우지 않고 숨겨 두려고', '연결된 관계를 먼저 지워 오류 없이 노드를 지우려고', '삭제를 나중에 되돌릴 수 있게 하려고'], a: 1,
      why: '관계가 남은 노드에 DELETE만 쓰면 오류가 난다. DETACH가 WORKS_AT 관계 1개를 먼저 지운다.' },
  ];

  const summary = [
    'Cypher는 둥근 괄호로 노드, 대괄호와 화살표로 관계를 그린다.',
    'CREATE 한 번으로 노드 3개와 관계 2개를 만들고, 같은 패턴에 MATCH를 쓰면 조회가 된다.',
    'WHERE로 후보를 거르고, 관계까지 넣은 패턴은 맞는 조합마다 한 행을 돌려준다.',
    'MERGE는 있으면 잡고 없으면 만들며, 관계가 붙은 노드는 DETACH DELETE로 지운다.',
  ];
  const review = [
    { q: '적재 스크립트를 두 번 돌렸더니 Acme 회사 노드가 두 개가 됐다. 먼저 바꿀 것은?',
      o: ['CREATE를 MERGE로 바꾸고 name에 unique 제약을 건다', 'DETACH DELETE로 매번 그래프를 비운다', 'WHERE p.age > 25 조건을 추가한다'], a: 0,
      why: 'CREATE는 실행할 때마다 새 노드를 만든다. MERGE는 같은 키가 있으면 기존 노드를 잡는다.' },
    { q: 'MATCH (p:Person) RETURN p.name 결과에 회사 이름이 안 나와 회사까지 함께 보고 싶다. 어떻게 고치나?',
      o: ['RETURN p로 바꾼다', 'WHERE c.name IS NOT NULL을 붙인다', '패턴을 (p:Person)-[:WORKS_AT]->(c:Company)로 늘리고 c.name을 돌려받는다'], a: 2,
      why: '회사는 관계 건너편 노드라 패턴에 관계와 회사를 넣어야 변수 c가 생긴다. RETURN p는 사람 노드의 속성만 준다.' },
    { q: 'Alice의 나이를 31로 고치려고 CREATE (p:Person {name:"Alice", age:31})를 실행했다. 그래프는 어떻게 되나?',
      o: ['기존 Alice의 age가 31로 바뀐다', 'Alice 노드가 하나 더 생긴다', '오류가 나고 아무것도 바뀌지 않는다'], a: 1,
      why: 'CREATE는 언제나 새로 만든다. 기존 노드를 고치려면 MATCH로 잡은 뒤 SET p.age = 31을 쓴다.' },
  ];

  R.page({ title: 'Cypher 패턴과 그래프', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
