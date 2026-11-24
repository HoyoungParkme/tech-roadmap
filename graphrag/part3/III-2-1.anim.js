/* III-2-1 Cypher 고급 쿼리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그래프는 페이지의 NODES · EDGES, 결과 표는 STEPS의 resultHeader · resultRows를 읽는다.
 * 홉 수·결과 행(OPTIONAL 5행, WITH 2행, 집계 2그룹, UNION ALL 3행)은 networkx로 같은 질의를 돌려 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, cross, check, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const D = () => (typeof NODES === 'undefined' ? null : { N: NODES, E: EDGES });
  const PX = (cx) => 60 + (cx - 110) * (520 / 600), PY = (cy) => (cy < 150 ? 120 : 300), RN = 28;
  const P = (n) => ({ x: PX(n.cx), y: PY(n.cy) });
  function arrow(x1, y1, x2, y2, u, col, o) { if (u <= 0) return; o = o || {}; const x = lerp(x1, x2, clamp(u)), y = lerp(y1, y2, clamp(u));
    el('line', { x1, y1, x2: x, y2: y, stroke: col, 'stroke-width': o.sw || 2.4, opacity: o.op ?? 1, 'stroke-dasharray': o.dash, 'stroke-linecap': 'round' });
    if (u > 0.9) { const a = Math.atan2(y2 - y1, x2 - x1), s = 10; el('path', { d: `M${x},${y} L${x - s * Math.cos(a - 0.45)},${y - s * Math.sin(a - 0.45)} L${x - s * Math.cos(a + 0.45)},${y - s * Math.sin(a + 0.45)} Z`, fill: col, opacity: o.op ?? 1 }); } }
  // st: { [edgeId]: { u, col, op, sw } }, ns: { [nodeId]: { ring, ringCol, op } }
  function graph(st, ns, o) { const d = D(); if (!d) return; o = o || {}; const byId = Object.fromEntries(d.N.map((n) => [n.id, n]));
    el('rect', { x: 16, y: 40, width: 594, height: 330, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    d.E.forEach((e) => { const a = P(byId[e.from]), b = P(byId[e.to]), dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const x1 = a.x + ux * (RN + 2), y1 = a.y + uy * (RN + 2), x2 = b.x - ux * (RN + 5), y2 = b.y - uy * (RN + 5), s = st[e.id] || {}, base = o.faint && !s.u ? 0.25 : 0.55;
      arrow(x1, y1, x2, y2, 1, GRID, { op: base * (o.compOp && e.type === 'WORKS_AT' ? o.compOp : 1), sw: 2 });
      if (s.u > 0) arrow(x1, y1, x2, y2, s.u, s.col || ACC, { op: s.op ?? 1, sw: s.sw || 3.2 });
      const lit = s.u > 0.6, op = lit ? 1 : base * (o.compOp && e.type === 'WORKS_AT' ? o.compOp : 1) * 1.4;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ang = Math.atan2(dy, dx) * 180 / Math.PI;
      if (e.type === 'KNOWS') mono(mx, my - 9, 'KNOWS', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: lit ? (s.col || ACC) : MUT, opacity: Math.min(1, op) });
      else { const a2 = ang > 90 ? ang - 180 : ang; mono(0, 0, 'WORKS_AT', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: lit ? (s.col || ACC) : MUT, opacity: Math.min(1, op), transform: `translate(${mx + 6 * Math.sign(dx || 1)} ${my}) rotate(${a2}) translate(0 -6)` }); } });
    d.N.forEach((n) => { const p = P(n), s = ns[n.id] || {}, comp = n.kind === 'Company', col = comp ? INFO : ACC, op = s.op ?? (comp && o.compOp != null ? o.compOp : 1);
      if (s.ring) el(comp ? 'rect' : 'circle', comp ? { x: p.x - RN - 12, y: p.y - RN, width: 2 * RN + 24, height: 2 * RN, rx: 12, fill: 'none', stroke: s.ringCol || WARN, 'stroke-width': 3, opacity: s.ring * op } : { cx: p.x, cy: p.y, r: RN + 7, fill: 'none', stroke: s.ringCol || WARN, 'stroke-width': 3, opacity: s.ring * op });
      if (comp) el('rect', { x: p.x - RN - 6, y: p.y - RN + 6, width: 2 * RN + 12, height: 2 * RN - 12, rx: 9, fill: INFOBG, stroke: col, 'stroke-width': 2.5, opacity: op });
      else el('circle', { cx: p.x, cy: p.y, r: RN, fill: ACCBG, stroke: col, 'stroke-width': 2.5, opacity: op });
      tx(p.x, p.y + 5, n.label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, opacity: op });
      tx(p.x, comp ? p.y + RN + 8 : p.y - RN - 10, ':' + n.kind, { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT, opacity: op });
      if (s.cross) cross(p.x + 26, p.y - 26, 9, s.cross); }); }
  // 결과 표 (오른쪽)
  function table(c, o) { o = o || {}; const b = c.beat, hd = o.hd || b.resultHeader, rows = o.rows || b.resultRows || [], pr = o.prevRows || (c.prev && c.prev.resultRows) || [];
    const x0 = 626, W = 314, w = Math.floor((W - 3 * (hd.length - 1)) / hd.length), y0 = o.y ?? 70;
    tx(x0, y0 - 10, o.title || (rows.length ? `결과 ${rows.length} row${rows.length > 1 ? 's' : ''}` : '결과 없음'), { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    cells(x0, y0, hd, { w, h: 30, gap: 3, fs: 13.5, style: () => ({ fill: SOFT, stroke: GRID }) });
    rows.forEach((r, i) => { const fresh = !pr[i] || JSON.stringify(pr[i]) !== JSON.stringify(r), s = fresh ? pop(c.u, (o.at ?? 0.8) + i * 0.25) : 1, hot = o.hot && o.hot(r, i);
      cells(x0, y0 + 33 * (i + 1), r.map((v) => (String(v).length > 12 ? String(v).replace(/["\s]/g, '') : String(v))), { w, h: 30, gap: 3, fs: 13.5, style: () => ({ stroke: hot ? WARN : fresh ? ACC : INK, fill: hot ? WARNBG : fresh ? ACCBG : PANEL, s }) }); }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const code = (s, op, y) => R.spans(20, y ?? 26, R.tokens(s), { 'font-size': 14.5, 'font-weight': 800, opacity: op ?? 1 });

  // ---------- 1. 다중 hop ----------
  const HOP = { bob: 1, carol: 2, dave: 3, eve: 4 }, HOPE = { k1: 1, k2: 2, k3: 3, k4: 4 };
  function s1(t, c) { const { k, u } = c;
    code('MATCH p = (a:Person {name:"Alice"})-[:KNOWS*1..3]->(friend)', k === 0 ? fade(u, 0.2) : 1);
    const wave = k === 2 ? E(u, 0.2, 2.2) * 3 : k > 2 ? 3 : 0, st = {}, ns = { alice: { ring: k >= 1 ? (k === 1 ? fade(u, 0.3) : 1) : 0, ringCol: INK } };
    Object.entries(HOPE).forEach(([id, h]) => { if (h <= 3 && wave > h - 1) st[id] = { u: clamp(wave - (h - 1)), col: ACC, op: 0.35 + 0.22 * h }; });
    Object.entries(HOP).forEach(([id, h]) => { if (h <= 3 && wave >= h) ns[id] = { ring: 1, ringCol: ACC }; });
    graph(st, ns, { compOp: 0.25 });
    if (wave > 0) Object.entries(HOP).forEach(([id, h]) => { const n = NODES.find((x) => x.id === id), p = P(n), on = h <= 3 ? clamp(wave - (h - 1)) : clamp(wave - 2.6);
      mono(h <= 3 ? p.x : p.x + 26, p.y + 52, h <= 3 ? h + '홉' : '4홉 · 범위 밖', { 'font-size': 14, 'font-weight': 800, 'text-anchor': h <= 3 ? 'middle' : 'end', fill: h <= 3 ? ACC : BAD, opacity: on * (h <= 3 ? 0.55 + 0.15 * h : 1) }); });
    if (k === 0) { // 범위 자
      const x0 = 640, y = 150; tx(x0, 110, '*1..3 = 1번 ~ 3번 환승', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) });
      for (let h = 1; h <= 4; h++) { const s = pop(u, 0.5 + h * 0.3), inR = h <= 3;
        card(x0 + 35 + (h - 1) * 74, y + 20, 66, 40, { rx: 8, text: h + '홉', fs: 15, mono: true, stroke: inR ? ACC : OFF, fill: inR ? ACCBG : PANEL, color: inR ? ACC : MUT, s });
        if (!inR) cross(x0 + 35 + 3 * 74, y + 20, 12, s); }
      note(x0, 240, 'SQL이면 self-JOIN 3번', fade(u, 1.9), { fill: MUT }); return; }
    if (k === 1) { pill(P(NODES[0]).x, 210, 'a = Alice', INK, pop(u, 0.5), { mono: true, fill: PANEL });
      note(640, 120, '경로 변수 p가 여기서 시작한다', fade(u, 1.0)); mono(640, 160, 'p = (Alice)', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) }); return; }
    if (k === 2) { const n = Math.min(3, Math.floor(wave)); mono(640, 120, `friend ${n}명`, { 'font-size': 22, 'font-weight': 800, fill: ACC });
      note(640, 160, '색이 진할수록 먼 친구', fade(u, 1.2), { fill: MUT }); return; }
    table(c, { at: 0.5 }); note(626, 230, 'length(p) = 경로에 든 관계 수', fade(u, 1.6), { 'font-size': 14.5 });
  }

  // ---------- 2. OPTIONAL MATCH ----------
  const W4 = ['w1', 'w2', 'w3', 'w4'];
  function s2(t, c) { const { k, u } = c;
    const st = {}, ns = {};
    if (k === 1 || k >= 3) W4.forEach((id, i) => { st[id] = { u: k === 4 ? 1 : E(u, 0.2 + i * 0.2, 0.8 + i * 0.2), col: ACC }; });
    if (k === 1) ['alice', 'bob', 'carol', 'dave'].forEach((id) => { ns[id] = { ring: fade(u, 1.0), ringCol: ACC }; });
    if (k === 1) ns.eve = { op: 1 - 0.7 * E(u, 1.2, 1.8), cross: pop(u, 1.4) };
    if (k >= 2) ['alice', 'bob', 'carol', 'dave', 'eve'].forEach((id) => { ns[id] = { ring: k === 2 ? fade(u, 0.3) : 1, ringCol: id === 'eve' && k >= 3 ? WARN : ACC }; });
    graph(st, ns, {});
    const eve = P(NODES.find((n) => n.id === 'eve'));
    if (k >= 3) { const g = k === 3 ? E(u, 1.2, 1.9) : 1; arrow(eve.x, eve.y + RN + 4, eve.x, lerp(eve.y + RN + 4, 264, g), 1, WARN, { dash: '5 5', sw: 2.4 });
      el('circle', { cx: eve.x, cy: 300, r: RN, fill: 'none', stroke: WARN, 'stroke-width': 2.4, 'stroke-dasharray': '5 5', opacity: g }); mono(eve.x, 305, 'NULL', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: g }); }
    if (k === 0) { code('OPTIONAL MATCH  ≈  LEFT JOIN', fade(u, 0.2));
      card(780, 140, 290, 60, { rx: 10, text: 'MATCH\n못 맞추면 행을 버린다', fs: 14.5, stroke: BAD, s: pop(u, 0.5) });
      card(780, 240, 290, 60, { rx: 10, text: 'OPTIONAL MATCH\n못 맞추면 NULL로 남긴다', fs: 14.5, stroke: GOOD, s: pop(u, 1.1) }); return; }
    code(k === 1 ? 'MATCH (p:Person)-[:WORKS_AT]->(c:Company)' : k === 2 ? 'MATCH (p:Person)' : 'MATCH (p:Person) OPTIONAL MATCH (p)-[:WORKS_AT]->(c)');
    if (k === 1) { table(c, { at: 1.0 }); note(626, 250, 'Eve는 직장이 없어 행째 사라졌다', fade(u, 1.8), { fill: BAD, 'font-size': 14.5 }); }
    if (k === 2) { table(c, { hd: ['person'], rows: ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'].map((x) => [x]), title: 'p 후보 5명', at: 0.5 }); }
    if (k === 3) { note(626, 110, '회사는 있으면 붙인다', fade(u, 0.4)); note(626, 145, 'Eve의 c는 NULL', fade(u, 1.8), { fill: WARN }); }
    if (k === 4) table(c, { at: 0.3, hot: (r) => r[1] === 'NULL', prevRows: [] });
  }

  // ---------- 3. WITH 파이프라인 ----------
  function stages(k, u) { const S = [['① MATCH … Acme', 1], ['WITH p · WHERE age >= 25', 2], ['② MATCH (p)-[:KNOWS]->(friend)', 3]];
    S.forEach(([s, kk], i) => { const y = 90 + i * 84, on = k === kk, done = k > kk, op = k === 0 ? fade(u, 0.3 + i * 0.4) : 1;
      card(782, y, 300, 48, { rx: 10, stroke: on ? ACC : done ? INK : GRID, fill: on ? ACCBG : PANEL, sw: on ? 2.5 : 1.5, op });
      mono(642, y + 5, s, { 'font-size': 14, 'font-weight': 700, fill: on ? ACC : INK, opacity: op });
      if (i < 2) arrow(782, y + 26, 782, y + 56, 1, MUT, { op }); }); }
  function s3(t, c) { const { k, u } = c;
    const st = {}, ns = {}, light = { col: INFO }, dark = { col: ACC };
    if (k === 1 || k === 4) { st.w1 = Object.assign({ u: k === 1 ? E(u, 0.2, 0.9) : 1 }, light); st.w2 = Object.assign({ u: k === 1 ? E(u, 0.4, 1.1) : 1 }, light); ns.acme = { ring: 1, ringCol: INFO }; }
    if (k >= 1) { ns.alice = { ring: 1, ringCol: INFO }; ns.bob = { ring: 1, ringCol: INFO }; }
    if (k >= 3) { st.k1 = Object.assign({ u: k === 3 ? E(u, 0.3, 1.1) : 1 }, dark); st.k2 = Object.assign({ u: k === 3 ? E(u, 0.6, 1.4) : 1 }, dark); ns.carol = { ring: k === 3 ? fade(u, 1.4) : 1, ringCol: ACC }; }
    graph(st, ns, { compOp: k === 2 || k === 3 ? 0.3 : 1 });
    code(['MATCH … WITH p … MATCH …', 'MATCH (p:Person)-[:WORKS_AT]->(c:Company {name:"Acme"})', 'WITH p  WHERE p.age >= 25', 'MATCH (p)-[:KNOWS]->(friend:Person)', 'RETURN p.name AS acme_emp, friend.name AS friend'][k]);
    if (k < 4) stages(k, u);
    if (k === 1) [['p', INFO], ['c', INFO]].forEach(([v, col], i) => pill(660 + i * 60, 360, v, col, pop(u, 1.2 + i * 0.2), { mono: true, fill: PANEL, fs: 15 }));
    if (k === 2) { pill(660, 360, 'p', INFO, 1, { mono: true, fill: PANEL, fs: 15 }); const dropY = 360 + 30 * E(u, 0.3, 1.0);
      pill(720, dropY, 'c', OFF, 1, { mono: true, fill: PANEL, fs: 15, op: 1 - 0.6 * E(u, 0.3, 1.0) }); cross(720, dropY, 12, pop(u, 0.6));
      [['alice', 30], ['bob', 28]].forEach(([id, a], i) => { const p = P(NODES.find((n) => n.id === id)); mono(p.x, p.y + 56, `age ${a}`, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2 + i * 0.3) }); check(p.x + 40, p.y + 52, 8, pop(u, 1.4 + i * 0.3)); }); }
    if (k === 3) note(30, 400, 'Alice→Bob, Bob→Carol 두 쌍', fade(u, 1.6));
    if (k === 4) { table(c, { at: 0.4 }); [[INFO, '옅은 색 = 1단계 (WORKS_AT)'], [ACC, '진한 색 = 2단계 (KNOWS)']].forEach(([col, s], i) => {
        el('rect', { x: 626, y: 196 + i * 30, width: 22, height: 6, rx: 3, fill: col, opacity: fade(u, 1.2 + i * 0.3) }); tx(656, 203 + i * 30, s, { 'font-size': 14, opacity: fade(u, 1.2 + i * 0.3) }); }); }
  }

  // ---------- 4. 집계 ----------
  const RAW = [['Alice', 'Acme'], ['Bob', 'Acme'], ['Carol', 'Globex'], ['Dave', 'Globex']];
  function s4(t, c) { const { k, u } = c;
    const st = {}, ns = {};
    if (k >= 1) W4.forEach((id, i) => { st[id] = { u: k === 1 ? E(u, 0.2 + i * 0.2, 0.8 + i * 0.2) : 1, col: k >= 2 && i >= 2 ? INFO : ACC }; });
    if (k >= 2) { ns.acme = { ring: k === 2 ? fade(u, 0.4) : 1, ringCol: ACC }; ns.globex = { ring: k === 2 ? fade(u, 0.4) : 1, ringCol: INFO }; }
    graph(st, ns, {});
    code(['RETURN 집계가 아닌 컬럼 = 그룹 키', 'MATCH (p:Person)-[:WORKS_AT]->(c:Company)', 'RETURN c.name AS company, …', '       count(p) AS emp_count, …', '       collect(p.name) AS emp_names'][k]);
    if (k === 0) { tx(626, 90, '집계 함수', { 'font-size': 15, 'font-weight': 800 });
      ['count', 'sum', 'avg', 'collect', 'min', 'max'].forEach((f, i) => pill(670 + (i % 3) * 96, 130 + Math.floor(i / 3) * 50, f + '()', i === 0 || i === 3 ? ACC : INFO, pop(u, 0.3 + i * 0.15), { mono: true, fill: PANEL }));
      note(626, 260, 'GROUP BY 절은 없다', fade(u, 1.6), { fill: BAD }); note(626, 290, '나머지 컬럼이 알아서 그룹 키', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 1) { table(c, { hd: ['p.name', 'c.name'], rows: RAW, title: '매칭 4 rows', at: 0.9, prevRows: [] }); return; }
    // k ≥ 2: 4행이 2그룹으로 접힌다
    if (k === 2) { const m = E(u, 0.3, 1.5); RAW.forEach(([p0, co], i) => { const gi = co === 'Acme' ? 0 : 1, y = lerp(103 + i * 33, 103 + gi * 33, m), op = 1 - (i % 2) * m;
        cells(626, y, [p0, co], { w: 155, h: 30, gap: 3, fs: 13.5, style: () => ({ stroke: gi ? INFO : ACC, op }) }); });
      cells(626, 70, ['p.name', 'c.name'], { w: 155, h: 30, gap: 3, fs: 13.5, style: () => ({ fill: SOFT, stroke: GRID }) });
      note(626, 250, '4 rows → 2 그룹', fade(u, 1.6), { fill: WARN }); return; }
    table(c, { at: k === 4 ? 1.9 : 0.5 });
    if (k === 4) [['alice', 'bob', 0], ['carol', 'dave', 1]].forEach(([a, b, r], i) => [a, b].forEach((id, j) => { const p = P(NODES.find((n) => n.id === id));
      fly(p.x, p.y + 46, 880, 118 + r * 33, seg(u, 0.2 + i * 0.5 + j * 0.25, 0.8 + i * 0.5 + j * 0.25), NODES.find((n) => n.id === id).label, { mono: true, fill: r ? INFO : ACC }); }));
    if (k === 3) note(626, 200, '각 그룹에 든 행 수를 센다', fade(u, 1.4), { 'font-size': 14.5 });
    if (k === 4) note(626, 200, '세는 대신 값을 리스트로 모은다', fade(u, 2.0), { 'font-size': 14.5 });
  }

  // ---------- 5. UNION ----------
  function s5(t, c) { const { k, u } = c;
    const st = {}, ns = {};
    if (k >= 1) { st.k1 = { u: k === 1 ? E(u, 0.3, 1.1) : 1, col: ACC }; ns.alice = { ring: 1, ringCol: INK }; ns.bob = { ring: k === 1 ? fade(u, 1.1) : 1, ringCol: ACC }; }
    if (k >= 3) { st.w1 = { u: k === 3 ? E(u, 0.3, 1.0) : 1, col: INFO }; st.w2 = { u: k === 3 ? E(u, 0.5, 1.2) : 1, col: INFO }; ns.acme = { ring: 1, ringCol: INFO }; ns.alice = { ring: 1, ringCol: INFO }; }
    graph(st, ns, {});
    code(['① RETURN x.name AS name, … AS source', 'MATCH (a {name:"Alice"})-[:KNOWS]->(x)', 'RETURN x.name AS name, "friend_of_alice" AS source', 'UNION ALL  MATCH (x)-[:WORKS_AT]->(:Company {name:"Acme"})', 'RETURN x.name AS name, "works_at_acme" AS source'][k]);
    if (k === 0) { [['쿼리 ①', 90], ['쿼리 ②', 200]].forEach(([l, y], i) => { tx(626, y - 10, l, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3 + i * 0.5) });
        cells(626, y, ['name', 'source'], { w: 155, h: 30, gap: 3, fs: 13.5, style: () => ({ fill: SOFT, stroke: GRID, s: pop(u, 0.4 + i * 0.5) }) }); });
      [0, 1].forEach((j) => grow(703 + j * 158, 122, 703 + j * 158, 196, E(u, 1.3, 1.8), GOOD, { plain: true, dash: '4 4' }));
      note(626, 290, '컬럼 수와 별칭이 같아야 붙는다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 1) { note(626, 100, 'KNOWS 한 홉 → Bob', fade(u, 1.2)); return; }
    const rows = c.beat.resultRows;
    table(c, { at: 0.5, hot: k === 4 ? (r) => r[0] === 'Bob' : null });
    if (k === 2) note(626, 170, '고정 문자열도 컬럼이 된다', fade(u, 1.2), { 'font-size': 14.5 });
    if (k === 4) { el('line', { x1: 620, y1: 134, x2: 944, y2: 134, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.3) });
      mono(944, 225 + 6, 'UNION ALL', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 0.3) });
      note(626, 262, 'Bob은 두 번 나온다', fade(u, 1.4), { fill: WARN, 'font-size': 14.5 }); note(626, 292, 'source가 달라 UNION이어도 3행', fade(u, 1.9), { 'font-size': 14.5 }); }
    void rows;
  }

  const quiz = [
    { q: 'Alice에서 KNOWS를 *1..3으로 따라갈 때 Eve가 결과에 없는 이유는 무엇인가?',
      o: ['Eve는 직장이 없어서', 'Eve까지 가려면 KNOWS를 4번 타야 해서', 'Eve의 나이가 조건에 맞지 않아서'], a: 1,
      why: 'Alice→Bob→Carol→Dave→Eve로 Eve는 4홉이다. *1..3은 1~3홉만 허용하므로 Bob, Carol, Dave 세 명만 남는다.' },
    { q: 'MATCH (p:Person) OPTIONAL MATCH (p)-[:WORKS_AT]->(c)에서 직장이 없는 Eve의 행은 어떻게 되는가?',
      o: ['c가 NULL인 채로 결과에 남는다', '결과에서 빠진다', '오류가 나서 쿼리가 멈춘다'], a: 0,
      why: 'OPTIONAL MATCH는 LEFT JOIN과 같아 못 맞춰도 행을 지키고 c만 NULL로 둔다. 그래서 5행이 나온다.' },
    { q: 'WITH p 다음 절에서 회사 변수 c를 쓸 수 없는 이유는 무엇인가?',
      o: ['WITH 뒤에는 MATCH를 쓸 수 없어서', 'c가 NULL이라서', 'WITH에 적지 않은 변수는 거기서 버려져서'], a: 2,
      why: 'WITH는 적힌 변수만 다음 절로 넘긴다. p만 적었으니 c는 앞 절에서 끝난다.' },
    { q: 'RETURN c.name, count(p)에서 회사별로 묶이는 이유는 무엇인가?',
      o: ['집계가 아닌 컬럼 c.name이 그룹 키가 되어서', 'GROUP BY c.name을 생략하면 기본값이라서', 'count가 회사 노드만 세서'], a: 0,
      why: 'Cypher에는 GROUP BY 절이 없다. 집계 함수 옆의 다른 컬럼이 그대로 그룹 키가 되어 4행이 2그룹으로 접힌다.' },
    { q: 'Alice의 친구와 Acme 직원을 UNION ALL로 합친 결과가 3행인 이유는 무엇인가?',
      o: ['UNION ALL이 중복 행을 하나로 합쳐서', '1행과 2행을 그대로 이어 붙이고 Bob이 양쪽에서 나와서', 'Acme 직원이 3명이라서'], a: 1,
      why: '쿼리 ①은 Bob 1행, 쿼리 ②는 Alice와 Bob 2행이다. 위아래로 붙이면 3행이고 Bob은 source가 달라 두 번 나온다.' },
  ];

  const summary = [
    '*1..3은 관계를 1번에서 3번까지 타서 Alice에서 Bob, Carol, Dave를 한 번에 찾는다.',
    'OPTIONAL MATCH는 못 맞춘 행도 NULL로 남겨서 직장 없는 Eve까지 5행이 나온다.',
    'WITH는 적힌 변수만 다음 절로 넘겨 한 쿼리를 단계별 파이프라인으로 만든다.',
    'Cypher에는 GROUP BY가 없고, 집계 옆 컬럼이 그룹 키가 되며 UNION은 같은 컬럼끼리 붙인다.',
  ];
  const review = [
    { q: '직원 목록에 회사명을 붙였더니 무직자가 통째로 빠졌다. 어떻게 고치나?',
      o: ['WITH p를 추가해 c를 버린다', '회사 패턴을 OPTIONAL MATCH로 바꾼다', '*1..3을 붙여 범위를 넓힌다'], a: 1,
      why: '일반 MATCH는 관계가 없는 사람을 버린다. OPTIONAL MATCH로 바꾸면 그 사람은 남고 회사만 NULL이 된다.' },
    { q: 'Acme 직원의 친구 수를 세고 싶다. 직원을 먼저 추리고 그 결과로 다시 탐색하려면 어느 조합을 쓰나?',
      o: ['UNION ALL로 두 쿼리를 이어 붙인다', 'OPTIONAL MATCH 두 번을 연달아 쓴다', 'MATCH 후 WITH p로 넘기고 KNOWS를 MATCH해 count로 센다'], a: 2,
      why: 'WITH가 앞 절의 결과를 다음 절의 출발점으로 넘긴다. 그다음 MATCH 결과를 count로 묶으면 된다.' },
    { q: '키워드 검색 결과와 임베딩 검색 결과를 UNION으로 합쳤는데 같은 문서가 두 번 나온다. 먼저 확인할 것은?',
      o: ['출처를 적는 source 같은 컬럼 값이 달라 다른 행이 된 것은 아닌가', 'UNION 대신 OPTIONAL MATCH를 써야 하지 않나', '*1..3 범위가 너무 넓지 않나'], a: 0,
      why: 'UNION은 모든 컬럼이 같은 행만 지운다. source처럼 출처를 적은 컬럼이 다르면 같은 이름이라도 둘 다 남는다.' },
  ];

  R.page({ title: '그래프 위에서 켜지는 Cypher 패턴', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
