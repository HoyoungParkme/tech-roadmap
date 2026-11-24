/* II-2-1 온톨로지 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, dot, cross, check, fly } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 라벨 색: 온톨로지 전 6종은 제각각, 정의 후에는 사람 계열 ACC · 조직 계열 WARN · 도시 INFO
  const LC = { Person: [ACC, ACCBG], Employee: [ACC, ACCBG], Entity: [INK, SOFT], User: [INFO, INFOBG], Member: [GOOD, GOODBG],
    Company: [WARN, WARNBG], Org: [BAD, BADBG], Firm: [MUT, SOFT], City: [INFO, INFOBG] };
  const NR = 30;
  function gnode(P, name, label, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.02) return;
    const [col, bg] = (o.typed && label === 'Org') ? [WARN, WARNBG] : LC[label] || [INK, SOFT], g = R.G(P.x, P.y, s, o.op);
    if (o.ring) el('circle', { cx: 0, cy: 0, r: NR + 8, fill: 'none', stroke: o.ringCol || ACC, 'stroke-width': 3, opacity: o.ring }, g);
    el('circle', { cx: 0, cy: 0, r: NR, fill: o.dim ? SOFT : bg, stroke: o.dim ? OFF : col, 'stroke-width': o.hi ? 4 : 2.4 }, g);
    if (name) tx(0, 5.5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.dim ? MUT : INK }, g);
    if (o.lab !== false && name) mono(0, NR + 20, ':' + label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: o.dim ? OFF : col }, g);
    return g; }
  const qpt = (P, Q, K, t) => ({ x: (1 - t) * (1 - t) * P.x + 2 * (1 - t) * t * K.x + t * t * Q.x, y: (1 - t) * (1 - t) * P.y + 2 * (1 - t) * t * K.y + t * t * Q.y });
  function gedge(A, B, type, u, o) { o = o || {}; const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const bend = (o.curve || 0) * (o.bend || 60), K = { x: (A.x + B.x) / 2 + nx * bend, y: (A.y + B.y) / 2 + ny * bend };
    const trim = (P, Q, r) => { const d = Math.hypot(Q.x - P.x, Q.y - P.y) || 1; return { x: P.x + (Q.x - P.x) / d * r, y: P.y + (Q.y - P.y) / d * r }; };
    const P = trim(A, K, NR + 3), Q = trim(B, K, NR + 5), M = qpt(P, Q, K, 0.5);
    const route = Array.from({ length: 13 }, (_, i) => { const p = qpt(P, Q, K, i / 12); return [p.x, p.y]; });
    if (u <= 0) return { M, route, P, Q };
    const t = clamp(u), K1 = { x: lerp(P.x, K.x, t), y: lerp(P.y, K.y, t) }, Q1 = qpt(P, Q, K, t), col = o.col || MUT;
    el('path', { d: `M${P.x},${P.y} Q${K1.x},${K1.y} ${Q1.x},${Q1.y}`, fill: 'none', stroke: col, 'stroke-width': o.sw || 2.6, 'stroke-dasharray': o.dash, opacity: o.op ?? 1,
      'marker-end': t > 0.97 ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null });
    const lo = fade(t, 0.55, 0.35) * (o.op ?? 1);
    if (o.label !== false && lo > 0) { const w = tw(type, 13.5) + 14, my = M.y + (o.ldy || 0);
      el('rect', { x: M.x - w / 2, y: my - 12, width: w, height: 24, rx: 5, fill: PANEL, stroke: col === MUT ? GRID : col, 'stroke-width': 1.4, opacity: lo, 'stroke-dasharray': o.dash ? '3 3' : null });
      mono(M.x, my + 5, type, { 'font-size': 13.5, 'font-weight': 700, fill: col === MUT ? INK : col, 'text-anchor': 'middle', opacity: lo }); }
    return { M, route, P, Q }; }

  // 클래스 계층 (왼쪽 판). tree: {name, children}. hi: 강조 클래스, grow: 이번 beat 에 새로 생긴 클래스 → 튀어나옴
  const TP = { Entity: { x: 170, y: 100 }, Person: { x: 66, y: 205 }, Org: { x: 176, y: 205 }, City: { x: 282, y: 205 }, Employee: { x: 66, y: 310 }, Company: { x: 176, y: 310 } };
  const flat = (t, par, out) => { if (!t) return out; out.push([t.name, par]); t.children.forEach((ch) => flat(ch, t.name, out)); return out; };
  function tree(c, o) { o = o || {}; const b = c.beat, u = c.u, cur = flat(b.classTree, null, []), old = new Set(flat(c.prev && c.prev.classTree, null, []).map((x) => x[0])), hi = o.hi || b.highlightClasses || [];
    el('rect', { x: 14, y: 50, width: 322, height: 340, rx: 12, fill: SOFT, opacity: 0.7 });
    tx(28, 74, '클래스 계층 (온톨로지)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    if (!cur.length) { tx(175, 230, '아직 클래스 없음', { 'text-anchor': 'middle', 'font-size': 15, fill: OFF, 'font-weight': 700 }); return; }
    let j = 0; const sc = {};
    cur.forEach(([n]) => { sc[n] = old.has(n) || o.still ? 1 : pop(u, 0.5 + (j++) * 0.4); });
    cur.forEach(([n, par]) => { if (!par) return; const a = TP[n], p = TP[par]; R.grow(a.x, a.y - 18, p.x, p.y + 18, old.has(n) || o.still ? 1 : E(u, 0.5 + 0.4 * (j - 1), 1.2 + 0.4 * j), hi.includes(n) && hi.includes(par) ? ACC : MUT, { sw: 2 }); });
    cur.forEach(([n]) => { const P = TP[n], h = hi.includes(n), col = (LC[n] || [INK])[0];
      card(P.x, P.y, 96, 36, { rx: 8, s: sc[n], stroke: h ? col : GRID, sw: h ? 2.8 : 1.5, fill: h ? (LC[n] || [0, SOFT])[1] : PANEL, text: ':' + n, fs: 14.5, mono: true, color: col }); });
    if (cur.length > 1) sub(175, 372, '아래 → 위: rdfs:subClassOf', fade(u, o.still ? 0 : 1.6), { 'font-size': 13.5 }); }
  // 위 오른쪽 개수
  function counts(c, items) { items.forEach(([name, v, pv, col], i) => { const x = 940 - (items.length - 1 - i) * 132;
    tx(x - 96, 30, name, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); mono(x, 31, String(Math.round(tween(pv, v, c.u))), { 'font-size': 19, 'font-weight': 800, fill: col || INK, 'text-anchor': 'end' }); }); }
  const nLab = (b) => (b ? new Set(b.instances.map((n) => n.label)).size : 0);
  const map = (n, X, Y) => ({ x: X[0] + n.x * X[1], y: Y[0] + n.y * Y[1] });

  // 1. 온톨로지 없음 — 문서마다 다른 라벨
  const DOCS = [['문서 A', '김철수가 Acme에 다닌다'], ['문서 B', '유저 김철수가 Acme를 이용'], ['문서 C', '회원 김철수가 Acme 소속']];
  const TRI = [['p1', 'c1', 'WORKS_AT'], ['u1', 'o1', 'USES'], ['m1', 'f1', 'BELONGS_TO']];
  const S1P = { p1: { x: 560, y: 100 }, c1: { x: 850, y: 100 }, u1: { x: 560, y: 210 }, o1: { x: 850, y: 210 }, m1: { x: 560, y: 320 }, f1: { x: 850, y: 320 } };
  function s1(t, c) { const { k, u } = c, b = c.beat, ids = new Set(b.instances.map((n) => n.id)), old = new Set(((c.prev && c.prev.instances) || []).map((n) => n.id));
    counts(c, [['노드', b.instances.length, c.prev ? c.prev.instances.length : 0], ['라벨 종류', nLab(b), nLab(c.prev), nLab(b) >= 4 ? BAD : INK]]);
    DOCS.forEach(([h, s], i) => { const y = 110 + i * 115, on = k >= i + 1 || k === 0, g = k === 0 ? pop(u, 0.2 + i * 0.2) : 1;
      card(150, y, 250, 66, { rx: 8, s: g, stroke: k === i + 1 ? INK : GRID, sw: k === i + 1 ? 2.4 : 1.4, fill: PANEL });
      if (g > 0.5) { tx(40, y - 10, h, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(40, y + 16, s, { 'font-size': 15, 'font-weight': 700, fill: on ? INK : OFF }); } });
    if (k === 0) { card(400, 225, 96, 44, { rx: 10, fill: INK, stroke: 'none', text: 'LLM', fs: 16, color: PANEL, s: pop(u, 0.8) });
      tx(470, 160, '"엔티티와 관계를 추출해"', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(470, 290, '허용 라벨 목록: 없음', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); cross(455, 285, 7, pop(u, 1.8)); return; }
    TRI.forEach(([a, z, ty], i) => { if (!ids.has(a)) return; const fresh = !old.has(a), na = b.instances.find((n) => n.id === a), nz = b.instances.find((n) => n.id === z);
      if (fresh) { fly(280, 110 + i * 115, 700, S1P[a].y - 40, seg(u, 0.2, 0.9), `(${na.label})-[${ty}]->(${nz.label})`, { mono: true, fill: INK }); }
      const s0 = fresh ? pop(u, 0.9) : 1, s1_ = fresh ? pop(u, 1.1) : 1, eu = fresh ? E(u, 1.3, 2.1) : 1;
      gedge(S1P[a], S1P[z], ty, eu, { col: MUT, op: k === 5 ? 0.1 : 1 });
      const q = k === 4 ? (Math.floor(clamp((u - 0.3) / 0.6, 0, 2.99)) === i ? 1 : 0.3) : 1;
      gnode(S1P[a], na.name, na.label, { s: s0, ring: k === 4 && q === 1 ? 1 : 0, op: k === 4 ? lerp(0.5, 1, q) : k === 5 ? 0.1 : 1 }); gnode(S1P[z], nz.name, nz.label, { s: s1_, op: k === 4 ? 0.5 : k === 5 ? 0.1 : 1 });
      if (k === 4 && u > 0.3 + i * 0.6) mono(470, S1P[a].y - 36, `(:${na.label} {name:"김철수"}) → 1명`, { 'font-size': 13.5, fill: ACC, 'font-weight': 700 }); });
    if (fresh1(c)) tx(700, 404, 'LLM 출력 (예시)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    if (k === 4 && u > 2.2) tx(470, 404, '"김철수 전체"를 한 번에 묻는 쿼리가 없다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
    if (k === 5) { el('rect', { x: 330, y: 50, width: 620, height: 350, rx: 14, fill: PANEL, opacity: 0.9 * fade(u, 0.2) });
      [['검색', '김철수를 한 번에 못 찾음'], ['집계', '1명이 3명으로 셈'], ['추론', 'Person 규칙이 User에 안 닿음']].forEach(([a, z], i) => { const y = 120 + i * 60, s = pop(u, 0.4 + i * 0.35);
        cross(380, y - 5, 10, s); tx(405, y, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.5 + i * 0.35) }); tx(470, y, z, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.5 + i * 0.35) }); });
      banner(640, 340, '빠진 것: 라벨 표준 = 온톨로지', pop(u, 1.8)); } }
  const fresh1 = (c) => c.k >= 1 && c.k <= 3;

  // 2. 클래스 계층
  const MIXP = (n) => map(n, [380, 1.2], [100, 1.15]), T23P = (n) => map(n, [400, 1.25], [90, 1.15]);
  function s2(t, c) { const { k, u } = c, b = c.beat;
    tree(c); counts(c, [['노드', b.instances.length, c.prev ? c.prev.instances.length : b.instances.length], ['라벨 종류', nLab(b), nLab(c.prev || b), nLab(b) <= 2 ? GOOD : BAD]]);
    if (k === 0) { [['@prefix rdfs:', 'W3C 표준 어휘'], ['@prefix :', '우리 도메인']].forEach(([a, z], i) => { const y = 120 + i * 44, s = pop(u, 0.4 + i * 0.5); card(110, y, 150, 32, { rx: 6, s, fill: PANEL, stroke: INK, sw: 1.5, text: a, fs: 14, mono: true }); tx(196, y + 5, z, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6 + i * 0.5) }); }); }
    const typed = b.instances[0].kind === 'typed';
    if (!typed) { b.instances.forEach((n) => gnode(MIXP(n), n.name, n.label, { op: k === 0 ? 1 : 0.85 })); return; }
    // 합치기: 앞 beat 에 같은 이름 노드가 여러 개였으면 그 자리에서 한 점으로 모인다
    const prevI = (c.prev && c.prev.instances) || [], g = E(u, 0.3, 1.4);
    const typedPrev = prevI.length && prevI[0].kind === 'typed';
    if (!typedPrev) prevI.filter((n) => n.label === 'Person' || n.label === 'User' || n.label === 'Member').forEach((n) => { const A = MIXP(n), B = T23P(b.instances[0]); gnode({ x: lerp(A.x, B.x, g), y: lerp(A.y, B.y, g) }, g > 0.05 ? '' : n.name, n.label, { op: 1 - seg(u, 1.2, 1.6) }); });
    b.instances.forEach((n, i) => { const fresh = !prevI.some((p) => p.id === n.id && p.kind === 'typed'), P = T23P(n);
      gnode(P, n.name, n.label, { typed: true, s: fresh ? pop(u, n.name === '김철수' || n.name === 'Acme' ? 1.3 : 1.7) : 1, ring: fresh && (n.name === '김철수' || n.name === 'Acme') ? fade(u, 1.5) * (1 - fade(u, 2.4)) : 0 }); });
    if (k === 5) { const mixAcme = [{ x: 270, y: 220, l: 'Org' }, { x: 450, y: 200, l: 'Firm' }, { x: 90, y: 200, l: 'Company' }];
      mixAcme.forEach((m, i) => { const A = MIXP(m), B = T23P(b.instances[2]); if (g < 1) gnode({ x: lerp(A.x, B.x, g), y: lerp(A.y, B.y, g) }, '', m.l, { op: 1 - seg(u, 1.2, 1.6) }); }); }
    if (k >= 4) tx(650, 404, k === 4 ? 'Person · User · Member 셋이 :Employee 하나로' : 'Company · Org · Firm 셋이 :Company 하나로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); }

  // 3. 관계 규칙 (domain → range)
  function rules(c, rows) { const x = 360, u = c.u;
    rows.forEach(([rel, dom, ran, note, fresh, show], i) => { const y = 64 + i * 34; if (!show) return; const op = fresh ? fade(u, 0.3) : 1;
      mono(x, y, rel, { 'font-size': 14.5, 'font-weight': 800, opacity: op });
      const slot = (xx, v, lab, on) => { el('rect', { x: xx, y: y - 18, width: 104, height: 26, rx: 6, fill: v ? (on ? ACCBG : PANEL) : 'none', stroke: v ? (on ? ACC : GRID) : OFF, 'stroke-width': 1.6, 'stroke-dasharray': v ? null : '4 4', opacity: op });
        mono(xx + 52, y, v || lab, { 'font-size': 13.5, fill: v ? INK : OFF, 'text-anchor': 'middle', 'font-weight': 700, opacity: op }); };
      slot(x + 120, dom[0], 'domain', dom[1]); mono(x + 236, y, '→', { 'font-size': 15, fill: MUT, opacity: op }); slot(x + 258, ran[0], 'range', ran[1]);
      if (note) tx(x + 376, y, note, { 'font-size': 13.5, fill: MUT, opacity: op }); }); }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    const hi = k === 4 ? ['Employee', 'Person', 'Company'] : null;
    tree(c, { still: true, hi }); counts(c, [['엣지', b.edges.length, c.prev ? c.prev.edges.length : 0]]);
    rules(c, [['WORKS_AT', [k >= 1 ? 'Person' : '', k === 1], [k >= 2 ? 'Company' : '', k === 2], k >= 2 ? '' : '', k === 0, true],
      ['EMPLOYS', ['Company'], ['Person'], 'inverse_of WORKS_AT', k === 3, k >= 3], ['LOCATED_IN', ['Company'], ['City'], '', k === 3, k >= 3]]);
    const old = new Set(((c.prev && c.prev.edges) || []).map((e) => e.from + e.to));
    b.edges.forEach((e) => { const A = T23P(b.instances.find((n) => n.id === e.from)), B = T23P(b.instances.find((n) => n.id === e.to)), fresh = !old.has(e.from + e.to);
      const r = gedge(A, B, 'WORKS_AT', fresh ? E(u, 1.4, 2.2) : 1, { col: fresh ? ACC : MUT });
      if (fresh) { check(r.P.x + 4, r.P.y - 26, 9, pop(u, 0.5)); mono(r.P.x + 18, r.P.y - 20, 'domain', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.5) });
        check(r.Q.x - 70, r.Q.y - 26, 9, pop(u, 1.0)); mono(r.Q.x - 56, r.Q.y - 20, 'range', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.0) }); } });
    b.instances.forEach((n) => { const P = T23P(n), isP = n.label === 'Employee';
      gnode(P, n.name, n.label, { typed: true, ring: (k === 1 && isP) || (k === 2 && !isP) ? fade(u, 0.8) : 0 }); });
    if (k === 0) tx(690, 400, '규칙이 없으니 아직 어떤 엣지도 긋지 않는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.8) });
    if (k === 1) tx(690, 400, 'Person과 그 하위(Employee)만 출발할 수 있다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
    if (k === 4) tx(690, 400, ':Employee ⊂ :Person 이라 domain을 통과한다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) }); }

  // 4. 일관성 검증
  const T4P = (n) => map(n, [400, 1.1], [125, 1.0]);
  function s4(t, c) { const { k, u } = c, b = c.beat, I = (id) => T4P(b.instances.find((n) => n.id === id));
    tree(c, { still: k !== 1 }); const nv = b.showViolation ? 1 : 0, pv = c.prev && c.prev.showViolation ? 1 : 0;
    counts(c, [['WORKS_AT', b.edges.length, c.prev ? c.prev.edges.length : b.edges.length], ['위반', nv, pv, nv ? BAD : INK]]);
    const rs = {};
    b.edges.forEach((e) => { const bad = e.ok === false, fresh = bad && k === 1;
      rs[e.from + e.to] = gedge(I(e.from), I(e.to), 'WORKS_AT', fresh ? E(u, 1.3, 2.1) : 1, { col: bad ? BAD : MUT, dash: bad ? '7 5' : null, op: bad && k >= 4 ? 0.5 : 1 }); });
    b.instances.forEach((n) => { const fresh = n.id === 'ct1' && k === 1; gnode(I(n.id), n.name, n.label, { typed: true, s: fresh ? pop(u, 1.0) : 1, ring: k === 2 && n.id === 'c1' ? fade(u, 0.6) : k === 5 && n.id === 'ct1' ? fade(u, 0.6) : 0, ringCol: BAD }); });
    if (k === 0) { ['e1c1', 'e2c2'].forEach((key, i) => dot(rs[key].route, seg(u, 0.3 + i * 0.4, 1.4 + i * 0.4), ACC, 6));
      mono(650, 400, 'MATCH (a)-[r:WORKS_AT]->(b)  · 2건', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k === 1) { fly(650, 70, I('c1').x + 100, I('c1').y - 50, seg(u, 0.2, 1.0), '(:Company Acme)-[WORKS_AT]->(:City Seoul)', { mono: true, fill: BAD });
      tx(650, 400, 'LLM이 잘못 뽑은 triple (예시)', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) }); }
    const bad = rs.c1ct1;
    if (k >= 2 && bad) { cross(bad.P.x + 6, bad.P.y - 24, 9, k === 2 ? pop(u, 0.6) : 1); if (k === 2) mono(bad.M.x, 112, '출발 :Company ≠ Person', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
    if (k === 3) R.terminal(370, 40, 570, 112, [['✗ WORKS_AT domain violation:', 'var(--bad)'], '  [Company] -[WORKS_AT]-> [City]', '  트랜잭션 실패'], 0.4 + seg(u, 0.3, 2.0) * 2.6, { title: 'apoc.util.validate' });
    if (k === 4) { card(850, 80, 160, 44, { rx: 10, s: pop(u, 0.3), stroke: WARN, fill: WARNBG, text: 'LLM 재추출 큐', fs: 14.5, color: WARN });
      fly(bad.M.x, bad.M.y, 850, 122, seg(u, 0.7, 1.6), 'Acme→Seoul', { mono: true, fill: BAD });
      card(560, 400, 200, 34, { rx: 8, s: pop(u, 1.6), stroke: BAD, fill: BADBG, text: '인덱스 적재 거부', fs: 14.5, color: BAD }); }
    if (k === 5 && bad) { cross(bad.Q.x - 6, bad.Q.y - 24, 9, pop(u, 0.6)); mono(bad.M.x, 112, '도착 :City ≠ Company', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(560, 400, 'domain · range 둘 다 위반', { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) }); } }

  // 5. 추론
  const T5P = (n) => map(n, [420, 1.1], [95, 1.0]);
  function s5(t, c) { const { k, u } = c, b = c.beat, I = (id) => T5P(b.instances.find((n) => n.id === id));
    const hiTree = k === 1 ? ['Employee', 'Person', 'Entity'] : null; tree(c, { still: true, hi: hiTree });
    const ninf = b.edges.filter((e) => e.isInferred).length, pinf = c.prev ? c.prev.edges.filter((e) => e.isInferred).length : 0;
    counts(c, [['엣지', b.edges.length, c.prev ? c.prev.edges.length : b.edges.length], ['추론', ninf, pinf, ninf ? GOOD : INK]]);
    if (k === 7) { el('rect', { x: 350, y: 50, width: 600, height: 350, rx: 14, fill: PANEL });
      [['어휘 표준', '라벨 6종 → 2종', ACC], ['검증', '잘못된 WORKS_AT 1건 차단', BAD], ['추론', '엣지 2 → 4, 라벨 자동 부여', GOOD]].forEach(([a, z, col], i) => { const y = 120 + i * 90, s = pop(u, 0.3 + i * 0.5);
        card(650, y, 520, 66, { rx: 12, s, stroke: col, sw: 2.4, fill: PANEL }); tx(420, y + 7, a, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.5) }); tx(560, y + 7, z, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.5) }); });
      return; }
    const old = new Set(((c.prev && c.prev.edges) || []).map((e) => e.type + e.from));
    b.edges.forEach((e) => { const inf = e.isInferred, fresh = inf && !old.has(e.type + e.from);
      gedge(I(e.from), I(e.to), e.type, fresh ? E(u, 0.6, 1.6) : 1, { col: inf ? GOOD : (k === 3 ? ACC : MUT), dash: inf ? '7 5' : null, curve: inf ? 1 : 0, bend: 70, op: k === 6 ? 0.1 : 1 }); });
    if (k === 3) b.edges.forEach((e) => { const A = I(e.to), B = I(e.from); gedge(A, B, '?', 1, { col: OFF, dash: '3 6', curve: 1, bend: 70, label: false }); R.tx((A.x + B.x) / 2, A.y + 46, 'EMPLOYS 없음', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.0) }); });
    b.instances.forEach((n) => { const P = I(n.id), isE = n.label === 'Employee';
      gnode(P, n.name, n.label, { typed: true, ring: (k === 0 && isE) || (k === 2 && isE) ? fade(u, 0.6) : 0, op: k === 6 ? 0.1 : 1 });
      if (isE && b.showInference) n.inferredLabels.forEach((l, i) => { const fresh = k === 1, s = fresh ? pop(u, 0.9 + i * 0.4) : 1; if (s <= 0.02) return; const w = tw(':' + l, 13.5) + 16, gg = R.G(P.x - NR - 14 - w / 2, P.y - 12 + i * 26, s, k === 6 ? 0.1 : 1);
        el('rect', { x: -w / 2, y: -11, width: w, height: 22, rx: 11, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, gg); mono(0, 5, ':' + l, { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle' }, gg); }); });
    if (k === 0) mono(660, 404, 'MATCH (e:Employee) WHERE NOT e:Person', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
    if (k === 2) { const g = E(u, 0.4, 1.2); el('rect', { x: 360, y: 150, width: 200 * g + 1, height: 250, rx: 20, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '7 6' });
      mono(660, 404, 'MATCH (p:Person) → 김철수, 이영희', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k === 5) [['원본 관계', MUT, null], ['추론 관계 {inferred: true}', GOOD, '7 5']].forEach(([s, col, d], i) => { const y = 395 - (1 - i) * 0, x = 380 + i * 200, op = fade(u, 0.4 + i * 0.5);
      el('line', { x1: x, y1: y - 5, x2: x + 40, y2: y - 5, stroke: col, 'stroke-width': 2.6, 'stroke-dasharray': d, opacity: op }); tx(x + 50, y, s, { 'font-size': 14, 'font-weight': 700, fill: col === MUT ? INK : col, opacity: op }); });
    if (k === 6) { const A = { x: 470, y: 120 }, B = { x: 680, y: 120 }, Cc = { x: 890, y: 120 }, s = pop(u, 0.3);
      el('rect', { x: 352, y: 62, width: 596, height: 150, rx: 12, fill: PANEL, stroke: GRID, opacity: fade(u, 0.2) });
      [[A, 'A', ':Person', ACC], [B, 'B', ':Company', WARN], [Cc, 'C', ':City', INFO]].forEach(([P, n, l, col]) => { card(P.x, P.y, 56, 40, { rx: 20, s, stroke: col, fill: PANEL, text: n, fs: 16 }); mono(P.x, P.y + 40, l, { 'font-size': 13.5, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.4) }); });
      R.grow(A.x + 32, A.y, B.x - 32, B.y, E(u, 0.5, 1.0), MUT); mono((A.x + B.x) / 2, A.y - 10, 'WORKS_AT', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 0.7) });
      R.grow(B.x + 32, B.y, Cc.x - 32, Cc.y, E(u, 0.9, 1.4), MUT); mono((B.x + Cc.x) / 2, B.y - 10, 'LOCATED_IN', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 1.1) });
      const g = E(u, 1.5, 2.4); if (g > 0) { const K = { x: 680, y: 30 }, Q1 = qpt({ x: A.x, y: A.y - 22 }, { x: Cc.x, y: Cc.y - 22 }, K, g), K1 = { x: lerp(A.x, K.x, g), y: lerp(A.y - 22, K.y, g) };
        el('path', { d: `M${A.x},${A.y - 22} Q${K1.x},${K1.y} ${Q1.x},${Q1.y}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.6, 'stroke-dasharray': '7 5' }); }
      mono(680, 196, 'A -[WORKS_IN_CITY]-> C  (속성 체인)', { 'font-size': 14.5, fill: GOOD, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); } }

  const quiz = [
    { q: '온톨로지 없이 추출했더니 김철수가 Person, User, Member 세 노드로 생겼다. 그 결과는 무엇인가?',
      o: ['그래프가 더 풍부해져 검색이 쉬워진다', '한 사람이 세 명으로 갈려 검색·집계가 깨진다', 'LLM이 자동으로 셋을 합쳐 준다'], a: 1,
      why: '라벨마다 MATCH하면 김철수가 1명씩 따로 잡힌다. 어느 쿼리도 김철수 전체를 보지 못한다.' },
    { q: 'rdfs:subClassOf로 :Employee ⊂ :Person을 선언하면 무엇이 정해지나?',
      o: ['Employee는 Person의 한 종류다', 'Person은 Employee의 한 종류다', 'Employee와 Person은 같은 클래스다'], a: 0,
      why: '하위 클래스가 상위 클래스 쪽을 가리킨다. Entity 아래 Person, Person 아래 Employee가 놓인다.' },
    { q: 'WORKS_AT의 domain이 Person, range가 Company일 때 허용되는 엣지는 무엇인가?',
      o: ['(:Company)-[:WORKS_AT]->(:City)', '(:Company)-[:WORKS_AT]->(:Employee)', '(:Employee)-[:WORKS_AT]->(:Company)'], a: 2,
      why: 'Employee는 Person의 하위 클래스라 출발 조건을 통과하고, 도착이 Company라 range도 통과한다.' },
    { q: '(Acme)-[:WORKS_AT]->(Seoul)이 들어오면 검증기는 어떻게 하나?',
      o: ['City 노드를 Company로 바꿔 저장한다', '위반으로 막고 재추출 큐로 보낸다', '경고만 남기고 인덱스에 넣는다'], a: 1,
      why: '출발이 Company라 domain, 도착이 City라 range 규칙에 걸린다. 적재를 거부하고 LLM 재추출로 넘긴다.' },
    { q: 'WORKS_AT의 역관계를 EMPLOYS로 선언하면 무엇이 생기나?',
      o: ['회사에서 사람으로 가는 EMPLOYS 엣지가 추론으로 추가된다', '기존 WORKS_AT 엣지가 지워진다', 'Employee 라벨이 Company로 바뀐다'], a: 0,
      why: '김철수→Acme WORKS_AT이 있으니 Acme→김철수 EMPLOYS가 inferred: true로 붙는다. 엣지가 2개에서 4개가 된다.' },
  ];

  const summary = [
    '라벨 표준 없이 추출하면 같은 김철수가 Person, User, Member로 갈라진다.',
    '온톨로지는 클래스 계층을 정해 사람은 Employee, 회사는 Company 한 가지로 묶는다.',
    '관계마다 domain과 range를 두면 Company에서 City로 가는 WORKS_AT 같은 오류를 막는다.',
    '상속과 역관계 규칙으로 Person 라벨과 EMPLOYS 엣지가 저절로 붙는다.',
  ];
  const review = [
    { q: '새 문서를 넣을 때마다 라벨 종류가 늘고, "사람 수" 집계가 실제보다 크게 나온다. 먼저 손볼 곳은?',
      o: ['그래프 DB의 메모리', '추출 프롬프트에 온톨로지의 허용 클래스를 주는 것', '집계 쿼리의 GROUP 기준'], a: 1,
      why: '같은 사람이 문서마다 다른 라벨로 생긴 것이 원인이다. 허용 클래스를 정해 주면 한 클래스로 모인다.' },
    { q: 'MATCH (p:Person)이 Employee 노드를 하나도 찾지 못한다. 무엇이 빠졌나?',
      o: ['Employee에 상위 라벨 Person을 붙이는 추론 단계', 'WORKS_AT의 range 규칙', 'Company 노드의 인덱스'], a: 0,
      why: '계층만 선언하고 라벨을 내려 주지 않으면 Employee 노드에는 :Person이 없다. SET e:Person, e:Entity 단계가 필요하다.' },
    { q: 'LLM이 (:Employee 이영희)-[:WORKS_AT]->(:City Seoul)을 뽑았다. 검증 결과는?',
      o: ['domain 위반만 생긴다', '둘 다 통과한다', 'range 위반만 생긴다'], a: 2,
      why: 'Employee는 Person의 하위라 출발은 통과한다. 도착이 Company가 아니라 City라서 range 규칙에 걸린다.' },
  ];

  R.page({ title: '도메인 온톨로지 — 클래스와 인스턴스', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
