/* II-1-1 노드와 엣지 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 그래프 도구: 라벨마다 색, 노드는 원 + 이름 + :라벨, 엣지는 자라는 곡선 + 타입 이름 ──
  const LC = { Person: [ACC, ACCBG], Company: [WARN, WARNBG], City: [INFO, INFOBG] };
  const NR = 30;
  function gnode(x, y, name, label, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.02) return;
    const [col, bg] = LC[label] || [INK, SOFT], g = R.G(x, y, s, o.op);
    if (o.ring) el('circle', { cx: 0, cy: 0, r: NR + 8, fill: 'none', stroke: o.ringCol || ACC, 'stroke-width': 3, opacity: o.ring }, g);
    el('circle', { cx: 0, cy: 0, r: NR, fill: o.dim ? SOFT : bg, stroke: o.dim ? OFF : col, 'stroke-width': o.hi ? 4 : 2.4, 'stroke-dasharray': o.dash }, g);
    tx(0, 5.5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.dim ? MUT : INK }, g);
    if (label && o.lab !== false) tx(0, NR + 20, ':' + label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: o.dim ? OFF : col }, g);
    return g; }
  const qpt = (P, Q, K, t) => ({ x: (1 - t) * (1 - t) * P.x + 2 * (1 - t) * t * K.x + t * t * Q.x, y: (1 - t) * (1 - t) * P.y + 2 * (1 - t) * t * K.y + t * t * Q.y });
  // A→B 엣지. u 0→1 만큼 자란다. o: { dir, curve(±1), bend, col, sw, dash, op, label(false 면 숨김), props }
  function gedge(A, B, type, u, o) { o = o || {}; const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const bend = (o.curve || 0) * (o.bend || 90), K = { x: (A.x + B.x) / 2 + nx * bend, y: (A.y + B.y) / 2 + ny * bend };
    const trim = (P, Q, r) => { const d = Math.hypot(Q.x - P.x, Q.y - P.y) || 1; return { x: P.x + (Q.x - P.x) / d * r, y: P.y + (Q.y - P.y) / d * r }; };
    const P = trim(A, K, NR + 3), Q = trim(B, K, NR + (o.dir ? 5 : 3)), M = qpt(P, Q, K, 0.5);
    const route = Array.from({ length: 13 }, (_, i) => { const p = qpt(P, Q, K, i / 12); return [p.x, p.y]; });
    if (u <= 0) return { M, route };
    const t = clamp(u), K1 = { x: lerp(P.x, K.x, t), y: lerp(P.y, K.y, t) }, Q1 = qpt(P, Q, K, t), col = o.col || MUT;
    const mk = o.dir && t > 0.97 ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null;
    el('path', { d: `M${P.x},${P.y} Q${K1.x},${K1.y} ${Q1.x},${Q1.y}`, fill: 'none', stroke: col, 'stroke-width': o.sw || 2.6, 'stroke-dasharray': o.dash, 'marker-end': mk, opacity: o.op ?? 1 });
    const lo = fade(t, 0.55, 0.35) * (o.op ?? 1);
    if (o.label !== false && lo > 0) { const w = tw(type, 13.5) + 14;
      el('rect', { x: M.x - w / 2, y: M.y - 12, width: w, height: 24, rx: 5, fill: PANEL, stroke: col === MUT ? GRID : col, 'stroke-width': 1.4, opacity: lo });
      mono(M.x, M.y + 5, type, { 'font-size': 13.5, 'font-weight': 700, fill: col === MUT ? INK : col, 'text-anchor': 'middle', opacity: lo }); }
    if (o.props && lo > 0) { const w = tw(o.props, 13.5) + 14, py = M.y + (o.propsDy ?? 28);
      el('rect', { x: M.x - w / 2 + (o.propsDx || 0), y: py - 12, width: w, height: 24, rx: 5, fill: WARNBG, stroke: WARN, 'stroke-width': 1.2, opacity: o.propsOp ?? lo });
      mono(M.x + (o.propsDx || 0), py + 5, o.props, { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: o.propsOp ?? lo }); }
    return { M, route }; }
  // 맨 위 Cypher 입력줄: a 초부터 타이핑
  function qbar(s, a, u, o) { o = o || {}; el('rect', { x: 30, y: 12, width: 900, height: 40, rx: 8, fill: INK });
    mono(46, 38, 'neo4j$', { 'font-size': 14, fill: OFF });
    const n = a == null ? s.length : Math.round(s.length * seg(u, a, a + (o.d || 0.9)));
    mono(112, 38, s.slice(0, n), { 'font-size': 15, fill: PANEL }); }
  // 오른쪽 아래 개수 표시 (앞 beat 값에서 이어서)
  function counter(c, x, y) { const b = c.beat, p = c.prev || b;
    const n = Math.round(tween(p.nodes.length, b.nodes.length, c.u)), m = Math.round(tween(p.edges.length, b.edges.length, c.u));
    mono(x, y, `nodes ${n} · edges ${m}`, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 700 }); }
  // 변수 표시(a, b, c): 노드 왼쪽 위에 붙는 작은 꼬리표
  function vtag(P, name, s) { if (s <= 0.02) return; card(P.x - 34, P.y - 34, 26, 24, { rx: 6, fill: INK, stroke: 'none', text: name, fs: 14, color: PANEL, mono: true, s }); }

  // 장면 1~4 공통 자리
  const P3 = { Alice: { x: 220, y: 215 }, Acme: { x: 700, y: 215 }, Bob: { x: 460, y: 330 } };
  const LAB = { Alice: 'Person', Bob: 'Person', Acme: 'Company' };
  function nodesOf(c, POS, o) { o = o || {}; const prev = new Set(((c.prev && c.prev.nodes) || []).map((n) => n.id)), hi = (c.beat.highlight && c.beat.highlight.nodes) || [];
    c.beat.nodes.forEach((n, i) => { const isNew = !prev.has(n.id), P = POS[n.id];
      gnode(P.x, P.y, n.name, n.label, { s: isNew ? pop(c.u, (o.at ?? 0.5) + i * 0.15) : 1, hi: hi.includes(n.id), dim: o.dim && o.dim(n.id) }); }); }

  // 1. 노드
  function s1(t, c) { const { k, u } = c;
    const lines = [null, 'CREATE (a:Person  {name: "Alice", age: 30});', 'CREATE (b:Person  {name: "Bob",   age: 27});', 'CREATE (c:Company {name: "Acme",  founded: 2010});', null, 'MATCH (n) RETURN n;'];
    if (k === 0) { qbar('', null, u);
      el('rect', { x: 120, y: 90, width: 720, height: 290, rx: 14, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 8' });
      const s = pop(u, 0.4); el('circle', { cx: 480, cy: 210, r: 42 * s, fill: 'none', stroke: OFF, 'stroke-width': 2.5, 'stroke-dasharray': '5 6' });
      lbl(480, 290, '사물 하나 = 노드 하나', fade(u, 0.9)); sub(480, 318, '사람 · 회사 · 도시', fade(u, 1.4), { 'font-size': 14 });
      counter(c, 930, 404); return; }
    if (k === 4) { qbar('// ( ) 노드   :라벨   { } 속성', null, u);
      nodesOf(c, P3, { dim: (id) => id !== 'Alice' });
      const parts = [['(', INK], ['a', MUT], [':Person', ACC], [' ', INK], ['{name: "Alice", age: 30}', WARN], [')', INK]], fs = 22, x0 = 480 - tw('(a:Person {name: "Alice", age: 30})', fs) / 2;
      let x = x0; const at = {}; parts.forEach(([s, col]) => { at[s] = [x, x + tw(s, fs)]; mono(x, 104, s, { 'font-size': fs, 'font-weight': 700, fill: col }); x += tw(s, fs); });
      const mark = (a, b, y, text, col, d) => { const g = E(u, d, d + 0.5); if (g <= 0) return; el('line', { x1: a, y1: y, x2: lerp(a, b, g), y2: y, stroke: col, 'stroke-width': 3 }); tx((a + b) / 2, y + 22, text, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, d + 0.3) }); };
      mark(at['('][0], at['('][1] + 2, 116, '노드', INK, 0.3); mark(at[')'][0] - 2, at[')'][1], 116, '', INK, 0.3);
      mark(at[':Person'][0], at[':Person'][1], 116, '라벨 = 분류', ACC, 0.9); mark(at['{name: "Alice", age: 30}'][0], at['{name: "Alice", age: 30}'][1], 116, '속성 = 세부 값', WARN, 1.5);
      counter(c, 930, 404); return; }
    qbar(lines[k], k === 5 ? 0.15 : 0.15, u);
    nodesOf(c, P3, { at: 1.1 });
    if (k >= 1 && k <= 3) { const id = ['Alice', 'Bob', 'Acme'][k - 1], P = P3[id], props = [['name: "Alice"', 'age: 30'], ['name: "Bob"', 'age: 27'], ['name: "Acme"', 'founded: 2010']][k - 1];
      props.forEach((s, i) => { const g = fade(u, 1.5 + i * 0.3); mono(P.x + 46, P.y - 8 + i * 22, s, { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: g }); }); }
    if (k === 3) sub(700, 300, '라벨이 다르면 다른 종류, 다른 색', fade(u, 2.0), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 });
    if (k === 5) { ['Alice', 'Bob', 'Acme'].forEach((id, i) => { const g = seg(u, 0.9 + i * 0.35, 1.4 + i * 0.35); if (g > 0 && g < 1) el('circle', { cx: P3[id].x, cy: P3[id].y, r: NR + 4 + g * 18, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: 1 - g }); if (g >= 1) check(P3[id].x + 28, P3[id].y - 28, 9, 1); });
      tx(120, 396, '관계(엣지) 0개: 아직 셋은 따로 떠 있다', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.1) }); }
    counter(c, 930, 404); }

  // 2. 엣지
  function s2(t, c) { const { k, u } = c, A = P3.Alice, Cc = P3.Acme;
    const code = ['// (from)-[:TYPE]->(to)', 'MATCH (a:Person {name: "Alice"})', 'MATCH (c:Company {name: "Acme"})', 'CREATE (a)-[:WORKS_AT {since: 2020}]->(c);', '// -[:WORKS_AT]-> 타입+방향 · {since: 2020} 엣지 속성', 'MATCH (a:Person {name: "Alice"})-[:WORKS_AT]->(c) RETURN c.name;'];
    qbar(code[k], 0.15, u);
    const has = c.beat.edges.length > 0, wasE = c.prev && c.prev.edges.length > 0;
    const eu = has ? (wasE ? 1 : E(u, 0.9, 1.9)) : 0;
    if (k === 0) { el('line', { x1: A.x + 40, y1: A.y, x2: Cc.x - 40, y2: Cc.y, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 8', opacity: fade(u, 0.6) });
      tx(460, 200, '?', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: OFF, opacity: fade(u, 0.9) });
      sub(460, 150, '노드만 있으면 외딴 섬', fade(u, 1.3), { 'font-size': 15, 'font-weight': 700 }); }
    const e = gedge(A, Cc, 'WORKS_AT', eu, { dir: true, col: k >= 3 ? ACC : MUT, props: '{since: 2020}', propsOp: k === 3 ? fade(u, 1.9) : 1 });
    nodesOf(c, P3, { dim: (id) => id === 'Bob' });
    vtag(A, 'a', k === 1 ? pop(u, 0.9) : k >= 1 && k <= 3 ? 1 : 0); vtag(Cc, 'c', k === 2 ? pop(u, 0.9) : k === 3 ? 1 : 0);
    if (k === 1) sub(A.x, A.y + 80, 'MATCH = 찾기 (새로 만들지 않음)', fade(u, 1.4), { 'font-size': 14, fill: INK, 'font-weight': 700 });
    if (k === 4) { const bx = 460, by = 120, s = pop(u, 0.3);
      card(bx, by, 380, 58, { rx: 10, stroke: ACC, sw: 2, s, fill: PANEL });
      R.spans(bx - 170, by + 6, [['-[', { fill: MUT }], [':WORKS_AT', { fill: ACC, 'font-weight': 700 }], [' {since: 2020}', { fill: WARN, 'font-weight': 700 }], [']->', { fill: MUT }]], { 'font-size': 17, opacity: fade(u, 0.5) });
      sub(bx - 60, by + 52, '타입 + 방향', fade(u, 1.1), { fill: ACC, 'font-weight': 700, 'font-size': 14 }); sub(bx + 100, by + 52, '관계의 속성', fade(u, 1.6), { fill: WARN, 'font-weight': 700, 'font-size': 14 }); }
    if (k === 5) { dot(e.route, seg(u, 0.8, 1.8), ACC, 7);
      const s = pop(u, 1.9); card(Cc.x, Cc.y + 110, 170, 36, { rx: 8, s, stroke: ACC, fill: ACCBG, text: 'c.name = "Acme"', fs: 14.5, mono: true, color: ACC }); }
    counter(c, 930, 404); }

  // 3. 방향성
  function s3(t, c) { const { k, u } = c, A = P3.Alice, B = P3.Bob, Cc = P3.Acme;
    const code = ['// 의미가 일방인가, 쌍방인가?', 'CREATE (a)-[:WORKS_AT]->(c);   // Alice → Acme', 'MATCH (a:Person {name: "Alice"}), (b:Person {name: "Bob"})', 'CREATE (a)-[:LIVES_WITH]->(b);  // 저장은 한 방향', 'MATCH (a)-[:LIVES_WITH]-(b) WHERE a.name = "Alice"', 'RETURN b.name;   // "Bob"'];
    qbar(code[k], 0.15, u);
    const lw = c.beat.edges.find((e) => e.type === 'LIVES_WITH'), lwPrev = c.prev && c.prev.edges.find((e) => e.type === 'LIVES_WITH');
    gedge(A, Cc, 'WORKS_AT', 1, { dir: true, col: k === 1 ? ACC : MUT, op: k >= 2 && k <= 4 ? 0.45 : 1 });
    const le = gedge(A, B, 'LIVES_WITH', lw ? (lwPrev ? 1 : E(u, 0.8, 1.8)) : 0, { col: k >= 3 ? ACC : MUT });
    nodesOf(c, P3, { dim: (id) => (k >= 2 && k <= 4 && id === 'Acme') || (k === 1 && id === 'Bob') });
    if (k === 0 || k === 1) { const rows = [['Alice가 Acme에서 일한다', true], ['Acme가 Alice에서 일한다', false]];
      rows.forEach(([s, ok], i) => { const y = 112 + i * 34, g = fade(u, k === 0 ? 0.6 + i * 0.6 : 0); tx(600, y, s, { 'font-size': 15, 'font-weight': 700, fill: ok ? INK : MUT, opacity: g }); if (g > 0.5) (ok ? check : cross)(580, y - 5, 8, 1); }); }
    if (k === 1) { const g = E(u, 0.8, 1.6); el('path', { d: `M${Cc.x - 40},${Cc.y + 26} Q460 ${300 - 40 * g} ${A.x + 40},${A.y + 26}`, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: 0.8 * g });
      cross(560, 262, 10, pop(u, 1.6)); sub(600, 290, '뒤집으면 뜻이 달라진다', fade(u, 1.9), { fill: BAD, 'font-weight': 700, 'font-size': 14 }); }
    vtag(A, 'a', k === 2 ? pop(u, 0.9) : k === 3 ? 1 : 0); vtag(B, 'b', k === 2 ? pop(u, 1.1) : k === 3 ? 1 : 0);
    if (k === 3) { mono(le.M.x - 150, le.M.y + 52, '저장: a → b', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); tx(le.M.x - 150, le.M.y + 74, '그림: 화살표 없이', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 4) { dot(le.route, seg(u, 0.6, 1.6), ACC, 7); dot(le.route.slice().reverse(), seg(u, 1.4, 2.4), INFO, 7);
      sub(le.M.x - 130, le.M.y + 56, '-[:LIVES_WITH]- 양쪽에서 걸린다', fade(u, 1.2), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
    if (k === 5) { card(B.x + 150, B.y, 150, 36, { rx: 8, s: pop(u, 0.4), stroke: ACC, fill: ACCBG, text: 'b.name = "Bob"', fs: 14.5, mono: true, color: ACC });
      const lg = [['→', '뒤집으면 뜻이 바뀜: 화살표'], ['—', '뒤집어도 같음: 선']];
      lg.forEach(([m, s], i) => { const y = 100 + i * 30, g = fade(u, 1.2 + i * 0.4); mono(560, y, m, { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: g }); tx(592, y, s, { 'font-size': 15, 'font-weight': 700, opacity: g }); }); }
    counter(c, 930, 404); }

  // 4. 다중 엣지
  const P4 = { Alice: { x: 250, y: 255 }, Bob: { x: 710, y: 255 }, Acme: { x: 480, y: 105 } };
  function s4(t, c) { const { k, u } = c, A = P4.Alice, B = P4.Bob;
    const code = ['// 같은 두 노드 사이, 다른 타입의 관계 OK', 'MATCH (a:Person {name: "Alice"}), (b:Person {name: "Bob"})', 'CREATE (a)-[:FRIEND    {since: 2015}]->(b),', '       (a)-[:CO_WORKER {team: "data"}]->(b);', 'MATCH (a {name: "Alice"})-[r]->(b {name: "Bob"}) RETURN type(r);', '// "친구로서"와 "동료로서"는 맥락이 다르다'];
    qbar(code[k], 0.15, u);
    gedge(A, P4.Acme, 'WORKS_AT', 1, { dir: true, op: 0.35, label: k === 0 });
    const has = (ty) => c.beat.edges.some((e) => e.type === ty), had = (ty) => c.prev && c.prev.edges.some((e) => e.type === ty);
    const fu = has('FRIEND') ? (had('FRIEND') ? 1 : E(u, 0.8, 1.8)) : 0, cu = has('CO_WORKER') ? (had('CO_WORKER') ? 1 : E(u, 0.8, 1.8)) : 0;
    const hiR = k >= 4;
    const fe = gedge(A, B, 'FRIEND', fu, { curve: -1, bend: 100, col: k === 2 || hiR ? ACC : MUT, props: '{since: 2015}', propsDx: 150, propsDy: 0 });
    const ce = gedge(A, B, 'CO_WORKER', cu, { curve: 1, bend: 100, col: k === 3 || hiR ? ACC : MUT, props: '{team: "data"}', propsDx: 0, propsDy: 32 });
    nodesOf(c, P4, { dim: (id) => id === 'Acme' });
    if (k === 0) { el('line', { x1: A.x + 40, y1: A.y, x2: B.x - 40, y2: B.y, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 8', opacity: fade(u, 0.5) });
      sub(480, 290, '이 사이에 관계를 몇 개 둘 수 있을까?', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    vtag(A, 'a', k === 1 ? pop(u, 0.9) : k >= 2 && k <= 3 ? 1 : 0); vtag(B, 'b', k === 1 ? pop(u, 1.1) : k >= 2 && k <= 3 ? 1 : 0);
    if (k === 4) { dot(fe.route, seg(u, 0.4, 1.3), ACC, 6); dot(ce.route, seg(u, 0.6, 1.5), ACC, 6);
      [['type(r)', true], ['FRIEND', false], ['CO_WORKER', false]].forEach(([s, h], i) => { const g = fade(u, 1.5 + i * 0.3); mono(800, 330 + i * 24, s, { 'font-size': 14.5, 'font-weight': h ? 800 : 600, fill: h ? MUT : ACC, opacity: g }); });
      el('line', { x1: 796, y1: 336, x2: 920, y2: 336, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.5) }); }
    if (k === 5) { const s = pop(u, 0.6); card(480, 392, 640, 40, { rx: 10, s, stroke: BAD, sw: 1.8, fill: PANEL });
      mono(180, 398, '(a)-[:KNOWS]->(b)', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.8), 'text-decoration': 'line-through' });
      tx(420, 398, '하나로 합치면 친구인지 동료인지 구분이 사라진다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) }); }
    counter(c, 930, 412); }

  // 5. 작은 KG
  const P5 = { Acme: { x: 140, y: 230 }, Alice: { x: 400, y: 125 }, Bob: { x: 400, y: 325 }, Carol: { x: 670, y: 85 }, Beta: { x: 880, y: 85 }, Seoul: { x: 680, y: 300 } };
  const CURV = { FRIEND: -1, CO_WORKER: 1 };
  function s5(t, c) { const { k, u } = c, b = c.beat, pv = c.prev;
    const key = (e) => e.from + '-' + e.type + '-' + e.to, old = new Set(((pv && pv.edges) || []).map(key));
    const q = k === 6, path = (e) => q && ((e.type === 'WORKS_AT' && e.to === 'Acme') || e.type === 'LIVES_IN');
    let j = 0; const routes = {};
    b.edges.forEach((e) => { const isNew = !old.has(key(e)), u0 = isNew ? E(u, 0.5 + j * 0.35, 1.3 + j * 0.35) : 1; if (isNew) j++;
      const r = gedge(P5[e.from], P5[e.to], e.type, u0, { dir: e.directed, curve: CURV[e.type] || 0, bend: 70, col: path(e) ? ACC : MUT, op: q && !path(e) ? 0.35 : 1 }); routes[key(e)] = r.route; });
    const prev = new Set(((pv && pv.nodes) || []).map((n) => n.id)); let i = 0;
    b.nodes.forEach((n) => { const isNew = !prev.has(n.id), s = isNew ? pop(u, 0.4 + (i++) * 0.3) : 1;
      gnode(P5[n.id].x, P5[n.id].y, n.name, n.label, { s, dim: q && (n.id === 'Carol' || n.id === 'Beta'), ring: q && (n.id === 'Alice' || n.id === 'Bob') ? fade(u, 2.0) : 0 }); });
    if (k === 0) { el('rect', { x: 60, y: 40, width: 700, height: 340, rx: 14, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 8' });
      tx(410, 200, 'CREATE 한 문장으로', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) });
      tx(410, 232, '사람 3 · 회사 2 · 도시 1 · 관계 7', { 'text-anchor': 'middle', 'font-size': 16, fill: MUT, opacity: fade(u, 0.8) }); }
    if (q) { b.edges.filter(path).forEach((e, n) => dot(routes[key(e)], seg(u, 0.4 + n * 0.25, 1.4 + n * 0.25), ACC, 6));
      const s = pop(u, 2.1); card(150, 372, 230, 40, { rx: 10, s, stroke: ACC, fill: ACCBG, text: 'p.name → "Alice", "Bob"', fs: 14.5, mono: true, color: ACC }); }
    // 오른쪽 아래: 라벨·타입 개수
    const cnt = (arr, f) => arr.reduce((m, x) => (m[f(x)] = (m[f(x)] || 0) + 1, m), {});
    const ln = cnt(b.nodes, (n) => n.label), lp = cnt((pv && pv.nodes) || [], (n) => n.label), en = cnt(b.edges, (e) => e.type), ep = cnt((pv && pv.edges) || [], (e) => e.type);
    const x0 = 780, rows = [['Person', ln, lp, ACC], ['Company', ln, lp, WARN], ['City', ln, lp, INFO], ['WORKS_AT', en, ep, INK], ['LIVES_IN', en, ep, INK], ['FRIEND', en, ep, INK], ['CO_WORKER', en, ep, INK]];
    tx(x0, 176, '개수', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    rows.forEach(([name, cur, prv, col], r) => { const y = 200 + r * 27 + (r >= 3 ? 8 : 0), v = tween(prv[name] || 0, cur[name] || 0, u);
      mono(x0, y, (r < 3 ? ':' : '') + name, { 'font-size': 13.5, fill: col, 'font-weight': 700 }); el('rect', { x: x0 + 104, y: y - 11, width: 14 * v, height: 13, rx: 3, fill: col, opacity: 0.7 }); mono(x0 + 108 + 14 * 3, y, String(Math.round(v)), { 'font-size': 13.5, fill: INK, 'font-weight': 700 }); });
    mono(950, 412, `노드 ${Math.round(tween(pv ? pv.nodes.length : 0, b.nodes.length, u))} · 엣지 ${Math.round(tween(pv ? pv.edges.length : 0, b.edges.length, u))}`, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700, fill: INK }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'CREATE (c:Company {name: "Acme"})에서 Company는 무엇인가?',
      o: ['노드에 담긴 속성 값', '노드의 종류를 나누는 라벨', '노드를 가리키는 변수 이름'], a: 1,
      why: '콜론 뒤에 오는 것이 라벨이다. c는 변수, {name: "Acme"}는 속성이다.' },
    { q: 'MATCH (a:Person {name: "Alice"}) 줄이 하는 일은 무엇인가?',
      o: ['이미 있는 Alice를 찾아 변수 a에 담는다', 'Alice 노드를 하나 새로 만든다', 'Alice와 Acme 사이에 엣지를 만든다'], a: 0,
      why: 'MATCH는 조회다. 양 끝 노드를 a와 c로 잡아 둔 뒤 CREATE가 그 사이에 WORKS_AT 엣지를 만든다.' },
    { q: '저장 방향과 상관없이 Alice와 Bob의 LIVES_WITH를 찾는 패턴은 무엇인가?',
      o: ['(a)-[:LIVES_WITH]->(b)', '(a)<-[:LIVES_WITH]-(b)', '(a)-[:LIVES_WITH]-(b)'], a: 2,
      why: '화살표를 빼고 -[:R]- 로 쓰면 어느 방향으로 저장됐든 매칭된다. 결과로 Bob이 나온다.' },
    { q: 'Alice와 Bob이 친구이면서 직장 동료일 때 알맞은 표현은 무엇인가?',
      o: ['FRIEND 엣지와 CO_WORKER 엣지를 따로 둔다', 'KNOWS 엣지 하나로 합친다', '더 중요한 관계 하나만 남긴다'], a: 0,
      why: '같은 두 노드 사이에도 타입이 다른 엣지를 여러 개 둘 수 있다. -[r]->로 물으면 두 타입이 함께 나온다.' },
    { q: '작은 KG에서 Acme에서 일하고 Seoul에 사는 사람을 찾으면 결과는 무엇인가?',
      o: ['Carol', 'Alice와 Bob', 'Alice, Bob, Carol'], a: 1,
      why: 'WORKS_AT→Acme와 LIVES_IN→Seoul 두 조건을 모두 가진 사람은 Alice와 Bob이다. Carol은 Beta에서 일한다.' },
  ];

  const summary = [
    '노드는 사물 하나다. 라벨로 종류를 나누고 속성으로 세부 값을 단다.',
    '엣지는 두 노드를 잇는 관계다. 타입과 방향이 있고 since 같은 속성도 담는다.',
    '저장은 늘 한 방향이지만, 화살표 없이 매칭하면 방향과 상관없이 찾는다.',
    '노드 6개와 엣지 7개로 만든 작은 KG에서도 두 조건을 이어 Alice와 Bob을 찾는다.',
  ];
  const review = [
    { q: 'WORKS_AT을 (Acme)->(Alice) 방향으로 저장했더니 "Alice가 어디서 일하나" 조회가 빈 결과다. 먼저 의심할 것은?',
      o: ['엣지 방향이 뜻과 반대로 저장됐다', 'Acme 노드에 라벨이 빠졌다', 'MATCH 대신 CREATE를 써야 한다'], a: 0,
      why: 'WORKS_AT은 사람에서 회사로 흐르는 비대칭 관계다. (a)-[:WORKS_AT]->(c) 패턴은 거꾸로 저장된 엣지를 잡지 못한다.' },
    { q: '작은 KG에서 FRIEND와 CO_WORKER를 KNOWS 하나로 합쳤다. 무엇을 잃나?',
      o: ['Alice 노드를 찾는 능력', '두 사람이 친구인지 동료인지의 구분', 'Seoul 거주자 조회 결과'], a: 1,
      why: '타입이 곧 관계의 의미다. 하나로 합치면 노드와 연결은 남아도 맥락이 사라진다.' },
    { q: '"Acme 직원 중 Seoul 거주자" 조회에 Carol이 나오지 않는 이유는?',
      o: ['Carol에게 :Person 라벨이 없다', 'Carol의 엣지에는 방향이 없다', 'Carol은 Beta 소속이고 Seoul과 이어져 있지 않다'], a: 2,
      why: 'Carol의 엣지는 WORKS_AT→Beta 하나뿐이다. 두 패턴 중 어느 것도 만족하지 못한다.' },
  ];

  R.page({ title: 'Knowledge Graph 캔버스', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
