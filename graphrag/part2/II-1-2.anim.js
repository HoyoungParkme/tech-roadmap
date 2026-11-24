/* II-1-2 속성과 라벨 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const LC = { Person: [ACC, ACCBG], Company: [WARN, WARNBG], Engineer: [INFO, INFOBG], Designer: [GOOD, GOODBG] };
  const NR = 30;
  const POS = { alice: { x: 150, y: 125 }, bob: { x: 150, y: 280 }, apple: { x: 440, y: 205 } };
  const GX = { x: 600, w: 340 };   // 오른쪽 속성 카드 자리

  // 노드: 원 + 이름, 아래로 라벨 꼬리표를 쌓는다. o.newLab = 이번 beat 에 새로 붙은 라벨 이름 → 그 라벨만 튀어나옴
  function gnode(n, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.02) return; const P = POS[n.id] || o.at, labs = n.labels || [];
    const [col, bg] = LC[labs[0]] || [OFF, SOFT], g = R.G(P.x, P.y, s, o.op);
    if (o.ring) el('circle', { cx: 0, cy: 0, r: NR + 8, fill: 'none', stroke: o.ringCol || ACC, 'stroke-width': 3, opacity: o.ring }, g);
    el('circle', { cx: 0, cy: 0, r: NR, fill: o.dim ? SOFT : bg, stroke: o.dim ? OFF : col, 'stroke-width': o.idx ? 5 : 2.4, 'stroke-dasharray': labs.length ? null : '5 5' }, g);
    tx(0, 5.5, n.name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.dim ? MUT : INK }, g);
    labs.forEach((l, i) => { const c2 = (LC[l] || [MUT])[0], sc = o.newLab && o.newLab.includes(l) ? o.labS ?? 1 : 1; if (sc <= 0.02) return;
      const w = tw(':' + l, 13.5) + 14, gg = R.G(0, NR + 18 + i * 24, sc, null, g);
      el('rect', { x: -w / 2, y: -11, width: w, height: 22, rx: 11, fill: PANEL, stroke: c2, 'stroke-width': 1.5 }, gg);
      mono(0, 5, ':' + l, { 'font-size': 13.5, 'font-weight': 700, fill: c2, 'text-anchor': 'middle' }, gg); });
    if (o.idx) { const gg = R.G(NR - 2, -NR + 2, o.idx, null, g); el('rect', { x: -2, y: -12, width: 34, height: 22, rx: 6, fill: INFO }, gg); mono(15, 4, 'idx', { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }, gg); }
    return g; }
  const qpt = (P, Q, K, t) => ({ x: (1 - t) * (1 - t) * P.x + 2 * (1 - t) * t * K.x + t * t * Q.x, y: (1 - t) * (1 - t) * P.y + 2 * (1 - t) * t * K.y + t * t * Q.y });
  function gedge(A, B, type, u, o) { o = o || {}; const K = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    const trim = (P, Q, r) => { const d = Math.hypot(Q.x - P.x, Q.y - P.y) || 1; return { x: P.x + (Q.x - P.x) / d * r, y: P.y + (Q.y - P.y) / d * r }; };
    const P = trim(A, B, NR + 3), Q = trim(B, A, NR + 5), M = qpt(P, Q, K, 0.5), route = [[P.x, P.y], [Q.x, Q.y]];
    if (u <= 0) return { M, route }; const t = clamp(u), col = o.col || MUT, Q1 = { x: lerp(P.x, Q.x, t), y: lerp(P.y, Q.y, t) };
    el('line', { x1: P.x, y1: P.y, x2: Q1.x, y2: Q1.y, stroke: col, 'stroke-width': o.sw || 2.6, opacity: o.op ?? 1, 'marker-end': t > 0.97 ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null });
    const lo = fade(t, 0.55, 0.35) * (o.op ?? 1), w = tw(type, 13.5) + 14;
    if (lo > 0) { el('rect', { x: M.x - w / 2, y: M.y - 12, width: w, height: 24, rx: 5, fill: PANEL, stroke: col === MUT ? GRID : col, 'stroke-width': 1.4, opacity: lo });
      mono(M.x, M.y + 5, type, { 'font-size': 13.5, 'font-weight': 700, fill: col === MUT ? INK : col, 'text-anchor': 'middle', opacity: lo }); }
    return { M, route }; }
  // 위: 개수 띠 (노드 · 라벨 · 인덱스)
  function counts(c, ix, pix) { const b = c.beat, p = c.prev || b;
    const nl = (x) => new Set(x.nodes.flatMap((n) => n.labels)).size;
    const items = [['노드', b.nodes.length, p.nodes.length], ['라벨', nl(b), nl(p)], ['인덱스', ix || 0, pix ?? ix ?? 0]];
    items.forEach(([name, v, pv], i) => { const x = 40 + i * 150, cur = Math.round(tween(pv, v, c.u)), ch = v !== pv;
      tx(x, 32, name, { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(x + tw(name, 14) + 10, 33, String(cur), { 'font-size': 20, 'font-weight': 800, fill: ch ? ACC : INK }); }); }
  // 오른쪽 속성 카드: 노드면 라벨 + 속성, 엣지면 타입 + 속성. 새 줄은 칸이 채워지듯 나타난다
  function inspector(c, o) { o = o || {}; const b = c.beat, sel = o.sel || b.selected, x = GX.x, w = GX.w, y = 66, u = c.u;
    el('rect', { x, y, width: w, height: 300, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
    tx(x + 16, y + 26, '속성 카드', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    if (!sel) { tx(x + w / 2, y + 160, '선택 없음', { 'text-anchor': 'middle', 'font-size': 15, fill: OFF, 'font-weight': 700 }); return; }
    const isE = sel.kind === 'edge', it = (isE ? b.edges : b.nodes).find((z) => z.id === sel.id); if (!it) return;
    const ps = c.prev && c.prev.selected, prevIt = ps && ps.kind === sel.kind && ps.id === sel.id ? (isE ? c.prev.edges : c.prev.nodes).find((z) => z.id === sel.id) : null;
    const swap = !prevIt ? fade(u, 0.2, 0.4) : 1;
    mono(x + w - 16, y + 26, isE ? '관계 ' + it.id : '노드 ' + it.id, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: swap });
    if (isE) pill(x + 16 + (tw(':' + it.type, 14) + 26) / 2, y + 58, ':' + it.type, ACC, swap, { mono: true });
    else (it.labels || []).forEach((l, i) => { const before = prevIt && prevIt.labels.includes(l); pill(x + 16 + i * 120 + (tw(':' + l, 14) + 26) / 2, y + 58, ':' + l, (LC[l] || [MUT])[0], before ? 1 : pop(u, 0.4 + i * 0.2), { mono: true }); });
    if (!isE && !(it.labels || []).length) tx(x + 16, y + 63, '라벨 없음', { 'font-size': 14, fill: BAD, 'font-weight': 700 });
    el('line', { x1: x + 14, y1: y + 86, x2: x + w - 14, y2: y + 86, stroke: GRID, 'stroke-width': 1.2, opacity: swap });
    const keys = Object.keys(it.props || {});
    if (!keys.length) tx(x + 16, y + 118, '속성 없음 (0개)', { 'font-size': 15, fill: OFF, 'font-weight': 700, opacity: swap });
    keys.forEach((kk, i) => { const yy = y + 100 + i * 40, isNew = !(prevIt && prevIt.props && kk in prevIt.props), g = isNew ? E(u, 0.6 + i * 0.35, 1.1 + i * 0.35) : 1;
      el('rect', { x: x + 14, y: yy, width: (w - 28) * g, height: 32, rx: 6, fill: isNew ? WARNBG : SOFT });
      mono(x + 26, yy + 21, kk, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: g });
      mono(x + 140, yy + 21, String(it.props[kk]), { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: g }); });
    if (o.hiKey) { const i = keys.indexOf(o.hiKey); if (i >= 0) el('rect', { x: x + 12, y: y + 98 + i * 40, width: w - 24, height: 36, rx: 7, fill: 'none', stroke: o.hiCol || ACC, 'stroke-width': 2.5, opacity: o.hiOp ?? 1 }); } }
  // 아래 쿼리 칩
  function qchip(s, u, a, col) { const n = Math.round(s.length * seg(u, a, a + 0.8)); if (n <= 0) return;
    const w = tw(s, 14.5) + 28; el('rect', { x: 30, y: 380, width: w, height: 32, rx: 8, fill: INK }); mono(44, 401, s.slice(0, n), { 'font-size': 14.5, fill: col || PANEL }); }
  function nodesOf(c, o) { o = o || {}; const prev = new Set(((c.prev && c.prev.nodes) || []).map((n) => n.id));
    c.beat.nodes.forEach((n, i) => { const pn = c.prev && c.prev.nodes.find((z) => z.id === n.id), newLab = pn ? n.labels.filter((l) => !pn.labels.includes(l)) : [];
      const ix = c.beat.showIndexBadge && n.indexed ? (c.prev && c.prev.showIndexBadge && pn && pn.indexed ? 1 : pop(c.u, o.idxAt ?? 0.8)) : 0;
      gnode(n, Object.assign({ s: prev.has(n.id) ? 1 : pop(c.u, (o.at ?? 0.4) + i * 0.15), newLab, labS: pop(c.u, o.labAt ?? 0.9), idx: ix }, o.each ? o.each(n) : {})); }); }
  function edgesOf(c, o) { o = o || {}; const old = new Set(((c.prev && c.prev.edges) || []).map((e) => e.id)), out = {};
    c.beat.edges.forEach((e) => { out[e.id] = gedge(POS[e.from], POS[e.to], e.type, old.has(e.id) ? 1 : E(c.u, o.at ?? 0.6, (o.at ?? 0.6) + 1), o.each ? o.each(e) : {}); }); return out; }

  // 1. 라벨
  function s1(t, c) { const { k, u } = c; counts(c);
    if (k === 0) { const x = 90, y = 120;   // RDB 표 이름 ↔ 라벨
      el('rect', { x, y, width: 220, height: 130, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.6, opacity: fade(u, 0.2) });
      el('rect', { x, y, width: 220, height: 34, rx: 8, fill: SOFT, opacity: fade(u, 0.2) }); mono(x + 14, y + 23, 'person 테이블', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      [0, 1, 2].forEach((i) => el('line', { x1: x, y1: y + 64 + i * 30, x2: x + 220, y2: y + 64 + i * 30, stroke: GRID, opacity: fade(u, 0.4) }));
      R.grow(330, 185, 420, 185, E(u, 0.8, 1.4), ACC); pill(500, 185, ':Person', ACC, pop(u, 1.3), { mono: true, fs: 16 });
      sub(500, 232, '라벨 = 노드의 분류', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      inspector(c); return; }
    const hiPerson = k === 4 ? fade(u, 0.9) : 0, hiComp = k === 4 ? fade(u, 1.8) : 0;
    // Person 무리를 감싸는 점선 고리
    const has2 = c.beat.nodes.filter((n) => n.labels.includes('Person')).length >= 2;
    if (has2) { const g = k === 2 ? E(u, 1.2, 2.0) : 1; el('rect', { x: 92, y: 80, width: 116, height: 270 * g, rx: 50, fill: hiPerson ? ACCBG : 'none', stroke: ACC, 'stroke-width': hiPerson ? 3 : 2, 'stroke-dasharray': '7 6', opacity: 0.9 });
      if (g >= 1) tx(150, 370, 'Person 그룹', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700 }); }
    nodesOf(c, { at: 0.4, each: (n) => ({ ring: k === 4 && (n.labels.includes('Person') ? hiPerson : hiComp) }) });
    if (k === 4) { if (u < 1.6) qchip('MATCH (p:Person) RETURN p   → Alice, Bob', u, 0.3); else qchip('MATCH (c:Company) RETURN c  → Apple', u, 1.6); }
    if (k === 5) { const X = { id: 'x', name: 'x', labels: [] }; gnode(X, { at: { x: 400, y: 320 }, s: pop(u, 0.3) });
      qchip('MATCH (p:Person)', u, 0.6); const g = seg(u, 1.2, 2.2);
      if (g > 0) el('line', { x1: lerp(60, 520, g), y1: 70, x2: lerp(60, 520, g), y2: 370, stroke: ACC, 'stroke-width': 3, opacity: 0.5 });
      if (u > 2.2) { cross(442, 286, 9, 1); tx(400, 376, '어떤 라벨 조회에도 안 걸린다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) }); } }
    inspector(c); }

  // 2. 노드 속성
  function s2(t, c) { const { k, u } = c; counts(c); nodesOf(c, { each: (n) => ({ ring: k === 4 && n.id !== 'apple' ? fade(u, 1.6) : 0, ringCol: n.id === 'alice' ? GOOD : BAD, dim: k === 4 && n.id === 'bob' && u > 2 }) });
    if (k >= 1 && k <= 3) { const sel = c.beat.selected, P = POS[sel.id]; el('circle', { cx: P.x, cy: P.y, r: NR + 6, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '3 4' });
      R.grow(P.x + NR + 10, P.y, GX.x - 8, 190, E(u, 0.2, 0.6), GRID, { plain: true }); }
    if (k === 2) { tx(260, 360, 'age 30 vs 28 · 같은 라벨, 다른 값', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 3) { tx(300, 360, 'Company는 key 구성이 다르다: founded', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 4) { qchip('MATCH (p:Person) WHERE p.age > 29 RETURN p.name', u, 0.2);
      if (u > 1.6) { check(POS.alice.x + 52, POS.alice.y - 4, 10, pop(u, 1.6)); mono(POS.alice.x + 70, POS.alice.y + 2, 'age 30', { 'font-size': 14, fill: GOOD, 'font-weight': 700 });
        cross(POS.bob.x + 52, POS.bob.y - 4, 9, pop(u, 1.9)); mono(POS.bob.x + 70, POS.bob.y + 2, 'age 28', { 'font-size': 14, fill: BAD, 'font-weight': 700 }); } }
    if (k === 5) { const x = GX.x, y = 66, w = GX.w; el('rect', { x, y, width: w, height: 300, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
      tx(x + 16, y + 26, '속성 값으로 쓸 수 있는 것', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      const rows = [['string', '"Apple"', true], ['number', '1976', true], ['boolean', 'true', true], ['list', '["Tech", "Hardware"]', true], ['객체 중첩', '{ceo: {…}}', false]];
      rows.forEach(([ty, v, ok], i) => { const yy = y + 62 + i * 44, s = pop(u, 0.3 + i * 0.3);
        if (s <= 0.02) return; (ok ? check : cross)(x + 28, yy - 5, 8, s); tx(x + 46, yy, ty, { 'font-size': 15, 'font-weight': 700, fill: ok ? INK : BAD, opacity: fade(u, 0.3 + i * 0.3) });
        mono(x + 140, yy, v, { 'font-size': 14.5, fill: ok ? WARN : BAD, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3), 'text-decoration': ok ? null : 'line-through' }); });
      tx(x + 46, y + 286, '중첩은 노드를 나눠 엣지로 잇는다', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    inspector(c, k === 4 ? { sel: { kind: 'node', id: 'bob' }, hiKey: 'age', hiCol: BAD, hiOp: fade(u, 1.9) } : {}); }

  // 3. 엣지 속성
  function s3(t, c) { const { k, u } = c; counts(c);
    const filt = k === 4, res = k === 5;
    const rt = edgesOf(c, { at: 0.6, each: (e) => ({ col: (filt || res) ? (e.id === 'e2' ? ACC : OFF) : (c.beat.selected && c.beat.selected.id === e.id ? ACC : MUT), op: res && e.id === 'e1' ? 0.4 : 1 }) });
    nodesOf(c, { each: (n) => ({ dim: res && n.id === 'alice' }) });
    if (k === 1) { [['alice', 'a'], ['apple', 'c']].forEach(([id, v], i) => card(POS[id].x - 34, POS[id].y - 34, 26, 24, { rx: 6, fill: INK, stroke: 'none', text: v, fs: 14, color: PANEL, mono: true, s: pop(u, 0.6 + i * 0.3) })); }
    if (k === 0) tx(300, 360, '관계는 아직 0개', { 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.6) });
    if (filt) { qchip('WHERE r.since >= 2021', u, 0.2); dot(rt.e1.route, seg(u, 0.8, 1.6), OFF, 6); dot(rt.e2.route, seg(u, 0.8, 1.6), ACC, 6);
      if (u > 1.6) { cross(rt.e1.M.x, rt.e1.M.y - 26, 9, pop(u, 1.6)); mono(rt.e1.M.x + 16, rt.e1.M.y - 20, '2020', { 'font-size': 14, fill: BAD, 'font-weight': 700 });
        check(rt.e2.M.x, rt.e2.M.y + 28, 9, pop(u, 1.9)); mono(rt.e2.M.x + 16, rt.e2.M.y + 34, '2022', { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); } }
    if (res) { const x = GX.x, y = 66, w = GX.w; el('rect', { x, y, width: w, height: 300, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
      tx(x + 16, y + 26, 'RDB라면 JOIN 테이블', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      const cols = ['person', 'company', 'since', 'role'], cw = [74, 84, 64, 100];
      let cx = x + 14; cols.forEach((h, i) => { mono(cx + 4, y + 56, h, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); cx += cw[i]; });
      [['Alice', 'Apple', '2020', 'engineer'], ['Bob', 'Apple', '2022', 'designer']].forEach((r, j) => { let xx = x + 14; const yy = y + 88 + j * 32, op = fade(u, 0.3 + j * 0.3) * (j === 0 ? 0.5 : 1);
        r.forEach((v, i) => { mono(xx + 4, yy, v, { 'font-size': 14, fill: i >= 2 ? WARN : INK, 'font-weight': 700, opacity: op }); xx += cw[i]; }); });
      R.grow(x + w / 2, y + 140, x + w / 2, y + 190, E(u, 1.0, 1.4), ACC);
      tx(x + w / 2, y + 216, 'since · role 칸이 엣지 속성으로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      mono(x + w / 2, y + 244, '-[:WORKS_AT {since, role}]->', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) });
      qchip('Bob | "designer" | Apple', u, 0.4, PANEL); return; }
    inspector(c); }

  // 4. 다중 라벨
  function s4(t, c) { const { k, u } = c; counts(c);
    nodesOf(c, { labAt: 1.0, each: (n) => ({ ring: k >= 3 && n.labels.includes('Engineer') ? fade(u, 1.0) : 0, ringCol: INFO }) });
    if (k === 2) { const s = 'SET p:Engineer'; qchip('MATCH (p:Person {name: "Alice"}) ' + s, u, 0.2);
      if (u > 1.0) R.fly(300, 396, POS.alice.x, POS.alice.y + NR + 42, seg(u, 1.0, 1.9), ':Engineer', { mono: true, fill: INFO });
      if (u > 1.9) tx(POS.alice.x + 60, POS.alice.y + NR + 48, '기존 노드에 라벨 추가', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.9) }); }
    if (k === 4 && u > 1.8) { const g = E(u, 1.8, 2.6); R.fly(POS.alice.x, POS.alice.y + NR + 42, POS.alice.x + 130, POS.alice.y + NR + 80, g, ':Engineer', { mono: true, fill: OFF, stay: true });
      mono(POS.alice.x + 130, POS.alice.y + NR + 110, 'REMOVE p:Engineer', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }
    if (k >= 3) { const x = GX.x, w = GX.w; el('rect', { x, y: 66, width: w, height: 300, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
      tx(x + 16, 92, '라벨은 겹치는 분류', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      const cx = x + w / 2, op = fade(u, 0.2), hiP = k === 3 ? fade(u, 1.6) : 0, hiE = k === 3 ? fade(u, 0.6) : fade(u, 0.5);
      el('ellipse', { cx, cy: 230, rx: 150, ry: 115, fill: hiP ? ACCBG : 'none', stroke: ACC, 'stroke-width': 2.4, opacity: op }); mono(cx, 136, ':Person', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
      el('circle', { cx: cx - 62, cy: 240, r: 58, fill: hiE ? INFOBG : 'none', stroke: INFO, 'stroke-width': 2.4, opacity: op }); mono(cx - 62, 200, ':Engineer', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
      el('circle', { cx: cx + 66, cy: 240, r: 54, fill: 'none', stroke: GOOD, 'stroke-width': 2.4, opacity: op }); mono(cx + 66, 200, ':Designer', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
      tx(cx - 62, 252, 'Alice', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: k === 4 && u > 2.2 ? 0.35 : op }); tx(cx + 66, 252, 'Bob', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: op });
      if (k === 3) { if (u < 1.4) qchip('(e:Engineer) → Alice', u, 0.4); else qchip('(p:Person)   → Alice, Bob', u, 1.4); }
      if (k === 4) qchip('(p:Person:Engineer) → Alice', u, 0.3);
      return; }
    inspector(c, { sel: { kind: 'node', id: k === 1 ? 'bob' : 'alice' } }); }

  // 5. 인덱스
  function s5(t, c) { const { k, u } = c, b = c.beat;
    counts(c, [0, 1, 2, 3, 4, 4, 4][k], [0, 0, 1, 2, 3, 4, 4][k]); nodesOf(c, { idxAt: 0.9 });
    const x = GX.x, w = GX.w;
    if (k === 0) { el('rect', { x, y: 66, width: w, height: 300, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
      tx(x + 16, 92, ':Person 100만 개 (점 하나 = 많은 노드)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      const cols = 16, rows = 9, sc = seg(u, 0.5, 2.6) * cols * rows;
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const i = r * cols + q; el('circle', { cx: x + 28 + q * 19.5, cy: 122 + r * 22, r: 4.5, fill: i < sc ? BAD : OFF, opacity: i < sc ? 0.8 : 0.6 }); }
      mono(x + w / 2, 340, 'NodeByLabelScan · O(N)', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      qchip('MATCH (p:Person {name: "Alice"}) RETURN p', u, 0.2); return; }
    if (k <= 4) { const cards = [['person_name', ':Person(name)', [['"Alice"', 'alice'], ['"Bob"', 'bob']]], ['company_name', ':Company(name)', [['"Apple"', 'apple']]], ['person_name_age', ':Person(name, age)', [['("Alice", 30)', 'alice'], ['("Bob", 28)', 'bob']]], ['person_id_unique', ':Person(id) UNIQUE', []]];
      let y = 64; cards.slice(0, k).forEach(([nm, on, keys], i) => { const fresh = i === k - 1, s = fresh ? pop(u, 0.3) : 1, h = 30 + (nm === 'person_id_unique' ? 2 : Math.max(1, keys.length)) * 24;
        const g = R.G(0, 0, 1, fresh ? fade(u, 0.3) : 1); el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: fresh ? INFO : GRID, 'stroke-width': fresh ? 2.4 : 1.4 }, g);
        mono(x + 12, y + 20, nm, { 'font-size': 14, 'font-weight': 800, fill: INFO }, g); mono(x + w - 12, y + 20, on, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }, g);
        keys.forEach(([kv, id], j) => { const yy = y + 44 + j * 24; mono(x + 24, yy, kv, { 'font-size': 14, fill: INK, 'font-weight': 700 }, g);
          if (fresh) R.grow(x + 18, yy - 5, POS[id].x + NR + 8, POS[id].y, E(u, 0.9 + j * 0.25, 1.6 + j * 0.25), INFO, { plain: true, sw: 1.4, dash: '4 4' }); });
        if (nm === 'person_id_unique') { mono(x + 24, y + 44, 'CREATE (:Person {id: v})', { 'font-size': 13.5, fill: INK }, g); check(x + w - 24, y + 40, 8, pop(u, 0.9));
          mono(x + 24, y + 68, '같은 id로 한 번 더', { 'font-size': 13.5, fill: BAD }, g); cross(x + w - 24, y + 64, 8, pop(u, 1.5)); }
        y += h + 8; });
      if (k === 4) tx(x + w, 400, '중복은 거부, 인덱스는 저절로 생긴다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.9) });
      return; }
    if (k === 5) { el('rect', { x, y: 66, width: w, height: 300, rx: 12, fill: INK });
      mono(x + 16, 94, 'SHOW INDEXES', { 'font-size': 14.5, fill: PANEL, 'font-weight': 700 });
      [['name', 'type'], ['person_name', 'RANGE'], ['company_name', 'RANGE'], ['person_name_age', 'RANGE'], ['person_id_unique', 'RANGE']].forEach(([a, bb], i) => { const op = i ? fade(u, 0.3 + i * 0.3) : 1;
        mono(x + 16, 128 + i * 30, a, { 'font-size': 14, fill: i ? PANEL : OFF, opacity: op }); mono(x + w - 16, 128 + i * 30, bb, { 'font-size': 14, fill: i ? PANEL : OFF, 'text-anchor': 'end', opacity: op }); });
      tx(x + 16, 300, '+ 기본 LOOKUP 인덱스 2개', { 'font-size': 14, fill: OFF, opacity: fade(u, 1.9) }); tx(x + 16, 324, '(라벨용 · 관계 타입용)', { 'font-size': 13.5, fill: OFF, opacity: fade(u, 2.1) });
      return; }
    // k 6: 실행 계획 비교
    el('rect', { x, y: 66, width: w, height: 300, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
    tx(x + 16, 92, '같은 쿼리, 다른 실행 계획', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    [['인덱스 전', 'NodeByLabelScan', '1,000,000개 확인', BAD, 1], ['인덱스 후', 'NodeIndexSeek', '약 20단계 (log₂ 10⁶)', GOOD, 20 / 1e6]].forEach(([h, op, n, col, f], i) => { const y = 130 + i * 110, g = E(u, 0.4 + i * 0.8, 1.4 + i * 0.8);
      tx(x + 16, y, h, { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(x + 16, y + 26, op, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.8) });
      el('rect', { x: x + 16, y: y + 40, width: w - 32, height: 14, rx: 4, fill: SOFT }); el('rect', { x: x + 16, y: y + 40, width: Math.max(4, (w - 32) * f * g), height: 14, rx: 4, fill: col });
      mono(x + 16, y + 74, n, { 'font-size': 14, fill: INK, 'font-weight': 700, opacity: g }); });
    qchip('MATCH (p:Person {name: "Alice"}) RETURN p', u, 0.1); }

  const quiz = [
    { q: '라벨이 없는 노드 CREATE (x)를 만들면 어떤 문제가 생기나?',
      o: ['저장 자체가 거부된다', '(p:Person) 같은 라벨 조회에 걸리지 않는다', '속성을 붙일 수 없게 된다'], a: 1,
      why: '라벨 없는 노드도 만들 수는 있다. 하지만 라벨로 묶는 조회 어디에도 잡히지 않아 사실상 잃어버린 데이터가 된다.' },
    { q: 'MATCH (p:Person) WHERE p.age > 29 RETURN p.name의 결과는 무엇인가?',
      o: ['"Alice"', '"Alice", "Bob"', '"Bob"'], a: 0,
      why: 'Alice는 age 30, Bob은 28이다. 조건을 만족하는 것은 Alice뿐이다.' },
    { q: 'since와 role 같은 정보를 엣지 속성으로 두는 이유는 무엇인가?',
      o: ['노드 수를 줄이려고', '사람이 아니라 "이 근무 관계"에 딸린 값이라서', '엣지 속성이 노드 속성보다 빨라서'], a: 1,
      why: 'Alice의 since 2020은 Alice 자체가 아니라 Apple에서 일하는 관계의 값이다. RDB라면 JOIN 테이블 칸에 들어갈 정보다.' },
    { q: 'Alice가 :Person:Engineer일 때 Alice를 찾지 못하는 패턴은 무엇인가?',
      o: ['(p:Person)', '(e:Engineer)', '(d:Designer)'], a: 2,
      why: '다중 라벨은 각 라벨로 모두 잡힌다. Designer는 Bob의 라벨이라 Alice는 걸리지 않는다.' },
    { q: 'CREATE INDEX person_name을 건 뒤 같은 MATCH 쿼리에서 달라지는 것은 무엇인가?',
      o: ['쿼리 문장을 새로 써야 한다', '결과로 나오는 노드가 달라진다', '실행 계획이 NodeIndexSeek로 바뀐다'], a: 2,
      why: '쿼리와 결과는 그대로다. 플래너가 라벨 전체를 훑는 대신 인덱스에서 바로 찾는다.' },
  ];

  const summary = [
    '라벨은 노드의 분류다. 라벨이 없으면 어떤 라벨 조회에도 잡히지 않는다.',
    '속성은 key-value 값이고 검색과 필터의 기준이 된다. 객체 중첩은 안 된다.',
    'since나 role처럼 관계에 딸린 값은 엣지 속성으로 둔다.',
    '한 노드에 라벨을 여럿 달 수 있고, 자주 찾는 속성에는 인덱스를 건다.',
  ];
  const review = [
    { q: '노드가 100만 개로 늘자 이름으로 사람을 찾는 쿼리가 느려졌다. 먼저 할 일은?',
      o: [':Person(name)에 인덱스를 건다', 'Person 라벨을 지운다', 'name을 엣지 속성으로 옮긴다'], a: 0,
      why: '인덱스가 없으면 Person 노드를 전부 훑는다. 인덱스를 걸면 계획이 NodeIndexSeek로 바뀐다.' },
    { q: '"2021년 이후 합류한 사람"을 찾으려 했는데 since가 Person 노드에 들어 있다. 무엇이 문제인가?',
      o: ['인덱스가 없어서', '회사가 둘이면 어느 회사 기준인지 알 수 없어서', 'since가 숫자라서'], a: 1,
      why: 'since는 사람이 아니라 근무 관계의 값이다. 엣지에 두어야 r.since >= 2021처럼 관계마다 거를 수 있다.' },
    { q: 'Alice에게서 REMOVE p:Engineer를 실행했다. (p:Person)과 (e:Engineer) 조회 결과는?',
      o: ['둘 다 Alice를 찾지 못한다', '(e:Engineer)는 Alice를 찾고 (p:Person)은 못 찾는다', '(p:Person)은 Alice를 찾고 (e:Engineer)는 못 찾는다'], a: 2,
      why: 'REMOVE는 Engineer 라벨 하나만 뗀다. Person 라벨은 남아 있다.' },
  ];

  R.page({ title: '그래프 — 라벨과 속성', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
