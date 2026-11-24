/* II-2-1 Resolver — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 호출 순서·호출 횟수·args·info·오류 문구는 graphql 16.15, dataloader 2.2 로 코드 블록을 실제로 돌려 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, server, dbIcon, zone, terminal, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미: GraphQL·JSON 글자 색칠, 타입 카드 ----------
  const KW = /^(type|input|enum|interface|union|implements|scalar|query|mutation|subscription|on|true|false|null)$/;
  function gtok(s) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b|!)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { fill: INFO, 'font-weight': 700 } : w === '!' ? { fill: BAD, 'font-weight': 800 } : {}]); }); buf = ''; };
    while (i < s.length) { const ch = s[i];
      if (ch === '#' || (ch === '/' && s[i + 1] === '/')) { flush(); out.push([s.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = s.indexOf('"', i + 1), end = e < 0 ? s.length : e + 1; out.push([s.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  // 여러 줄 코드·JSON. n: 보이는 줄 수(소수면 마지막 줄을 타이핑), o.hi(i) 줄 배경색, o.col(i) 줄 글자색, o.op(i) 줄 투명도
  function code(x, y, rows, n, o) { o = o || {}; const fs = o.fs || 14.5, lh = o.lh || fs + 8, N = n == null ? rows.length : n;
    rows.forEach((s, i) => { if (i >= Math.ceil(N - 1e-6)) return; const part = i === Math.ceil(N) - 1 && N % 1 ? s.slice(0, Math.round(s.length * (N % 1))) : s;
      const hc = o.hi && o.hi(i), op = o.op ? o.op(i) : 1;
      if (hc) el('rect', { x: x - 6, y: y + i * lh - fs + 1, width: o.w || tw(s, fs) + 12, height: lh - 2, rx: 4, fill: hc, opacity: op });
      const c = o.col && o.col(i); spans(x, y + i * lh, c ? [[part, { fill: c }]] : gtok(part), { 'font-size': fs, opacity: op }); }); }
  // 타입 카드: 머리 줄 + 필드 줄. o.n 보이는 줄 수, o.s 크기(가운데 기준), rows 는 문자열 또는 [문자열, {bg, c}]
  function tcard(x, y, w, head, rows, o) { o = o || {}; const rh = o.rh || 30, n = o.n ?? rows.length, h = 44 + rh * rows.length, s = o.s ?? 1;
    const at = { h, row: (i) => y + 42 + i * rh + rh / 2, x, y, w };
    if (s <= 0.01) return at;
    const g = el('g', { transform: `translate(${x + w / 2} ${y + h / 2}) scale(${s}) translate(${-w / 2} ${-h / 2})`, opacity: o.op ?? 1 });
    el('rect', { x: 0, y: 0, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.col || INK, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash }, g);
    spans(14, 26, gtok(head), { 'font-size': 15.5, 'font-weight': 700 }, g);
    el('line', { x1: 0, y1: 38, x2: w, y2: 38, stroke: GRID, 'stroke-width': 1.5 }, g);
    rows.forEach((r, i) => { const v = clamp(n - i); if (v <= 0) return; const [t, ro] = Array.isArray(r) ? r : [r, {}], yy = 42 + i * rh;
      if (ro.bg) el('rect', { x: 5, y: yy + 1, width: w - 10, height: rh - 3, rx: 5, fill: ro.bg, opacity: v }, g);
      spans(16, yy + rh / 2 + 5, ro.c ? [[t, { fill: ro.c }]] : gtok(t), { 'font-size': 14.5, opacity: v }, g); });
    return at; }
  // 굽은 선이 자라기 (u 0→1)
  const mk = (col) => (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)');
  function curve(x1, y1, x2, y2, u, col, bx, by, o) { if (u <= 0) return; o = o || {}; const mx = (x1 + x2) / 2 + (bx || 0), my = (y1 + y2) / 2 + (by || 0);
    el('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 1, 'stroke-dasharray': u < 1 ? `${u} 1` : o.dash, opacity: o.op ?? 1, 'marker-end': u > 0.98 ? mk(col) : null }); }
  const qpts = (x1, y1, x2, y2, bx, by) => { const mx = (x1 + x2) / 2 + (bx || 0), my = (y1 + y2) / 2 + (by || 0); return Array.from({ length: 13 }, (_, i) => { const t = i / 12; return [(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2]; }); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. Scalar 5종 ----------
  const SC = [['id: ID', 'ID', '"u_1234"', '직렬화는 String'], ['name: String', 'String', '"박호영"', 'UTF-8 문자열'], ['age: Int', 'Int', '42', '32-bit 정수'],
    ['height: Float', 'Float', '3.14', 'IEEE 754 double'], ['isPremium: Boolean', 'Boolean', 'true', 'true / false']];
  const QRY = ['query {', '  user(id: "1") {', '    id', '    name', '    age', '    height', '    isPremium', '  }', '}'];

  // ---------- 1. 필드마다 함수 하나 — 쿼리 트리 순회 ----------
  const N = { q: [190, 70, 'Query.user'], n: [95, 175, 'User.name'], p: [290, 175, 'User.posts'], t1: [210, 285, 'Post.title'], t2: [370, 285, 'Post.title'] };
  const MAP = [['Query', 'user', '(_p, { id }) => db.users.findById(id)'], ['User', 'name', '(parent) => parent.name'], ['User', 'posts', '(parent) => db.posts.findByUserId(parent.id)'], ['Post', 'title', '(parent) => parent.title']];
  const LOG = ['Query.user', 'db.users.findById(1)', 'User.name', 'User.posts', 'db.posts.findByUserId(1)', 'Post.title(p1)', 'Post.title(p2)'];
  function tree(on, hot) { [['q', 'n'], ['q', 'p'], ['p', 't1'], ['p', 't2']].forEach(([a, b]) => { if (!on[b]) return; el('line', { x1: N[a][0], y1: N[a][1] + 18, x2: N[b][0], y2: N[b][1] - 18, stroke: GRID, 'stroke-width': 2 }); });
    Object.entries(N).forEach(([key, [x, y, s]]) => { if (!on[key]) return; const h = hot && hot[key];
      card(x, y, 140, 36, { rx: 8, text: s, mono: true, fs: 14, stroke: h ? ACC : INK, fill: h ? ACCBG : PANEL, color: h ? ACC : INK, sw: h ? 2.5 : 2, s: on[key] }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { const shown = [1, 3, 4][k], from = [0, 1, 3][k];
      const on = { q: 1, n: shown >= 2 ? (k === 1 ? pop(u, 0.3) : 1) : 0, p: shown >= 3 ? (k === 1 ? pop(u, 0.6) : 1) : 0, t1: shown >= 4 ? (k === 2 ? pop(u, 0.3) : 1) : 0, t2: shown >= 4 ? (k === 2 ? pop(u, 0.5) : 1) : 0 };
      const hot = k === 0 ? { q: 1 } : k === 1 ? { n: 1, p: 1 } : { t1: 1, t2: 1 };
      if (k === 0) on.q = pop(u, 0.2);
      tree(on, hot);
      tx(490, 46, '타입', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(560, 46, '필드', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(630, 46, '함수', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      MAP.forEach(([ty, f, fn], i) => { if (i >= shown) return; const y = 84 + i * 52, a = i >= from ? E(u, 0.5 + (i - from) * 0.4, 1.1 + (i - from) * 0.4) : 1;
        if (i >= from) el('rect', { x: 482, y: y - 22, width: 456, height: 38, rx: 6, fill: ACCBG, opacity: a });
        mono(490, y + 2, ty, { 'font-size': 14.5, 'font-weight': 700, opacity: a }); mono(560, y + 2, f, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: a });
        code(630, y + 2, [fn.length > 34 ? fn.slice(0, 33) + '…' : fn], a > 0 ? 1 : 0, { fs: 13.5, op: () => a }); });
      if (k === 2) banner(480, 385, '스키마의 필드마다 함수 하나 — 없으면 default resolver', pop(u, 2.0));
      else note(490, 330, k === 0 ? 'resolvers = 타입 → 필드 → 함수' : 'User 필드 함수는 Query.user 의 결과를 받는다', fade(u, 1.8));
      return; }
    // k3, k4: 실행 순서
    const n = k === 3 ? E(u, 0.2, 2.2) * 3 : 3 + E(u, 0.2, 2.2) * 4;
    const done = (i) => n > i + 0.5;
    const on = { q: 1, n: 1, p: 1, t1: 1, t2: 1 }, hot = {};
    if (done(0)) hot.q = 1; if (done(2)) hot.n = 1; if (done(3)) hot.p = 1; if (done(5)) hot.t1 = 1; if (done(6)) hot.t2 = 1;
    tree(on, hot);
    terminal(500, 34, 430, 230, LOG.map((s) => (s.startsWith('db') ? ['  ' + s, 'var(--term)'] : ['> ' + s, null])), n, { title: '호출 기록 (graphql-js)', lh: 25, fs: 14 });
    if (k === 3) { fly(N.q[0], N.q[1] + 20, N.n[0], N.n[1] - 20, seg(u, 0.9, 1.6), '{ id: "1", name: "박호영" }', { mono: true, fill: INK });
      if (u > 1.7) mono(N.n[0], N.n[1] + 40, '"박호영"', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
      note(40, 370, '부모 함수가 끝나야 자식 함수가 그 결과를 받아 시작한다', fade(u, 2.2)); return; }
    mono(N.n[0], N.n[1] + 40, '"박호영"', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
    fly(N.p[0], N.p[1] + 20, 290, 240, seg(u, 0.6, 1.2), '[p1, p2]', { mono: true, fill: INK });
    mono(715, 300, 'resolver 5번 · DB 2번', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.2) });
    note(40, 370, 'Post.title 은 원소마다 한 번 — 글이 N개면 N번 (N+1 의 씨앗)', fade(u, 2.3), { fill: WARN }); }

  // ---------- 2. parent ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 4) { tx(240, 46, 'parent = DB row 의 키', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); tx(700, 46, '스키마 User 의 필드', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      const L = ['id', 'name', 'firstName', 'lastName', 'email'], Rr = ['name', 'fullName', 'posts', 'initials'];
      L.forEach((s, i) => card(240, 90 + i * 50, 170, 38, { rx: 8, text: s, mono: true, fs: 14.5, stroke: INK, s: pop(u, 0.2 + i * 0.1) }));
      Rr.forEach((s, i) => card(700, 90 + i * 50, 170, 38, { rx: 8, text: s, mono: true, fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 0.6 + i * 0.1) }));
      const links = [[1, 0, ACC], [2, 1, MUT], [3, 1, MUT], [0, 2, MUT], [1, 3, MUT]];
      links.forEach(([a, b, col], i) => curve(326, 90 + a * 50, 614, 90 + b * 50, E(u, 1.0 + i * 0.15, 1.5 + i * 0.15), col, 0, 0, { sw: 1.8 }));
      note(60, 360, '두 모양이 달라도 된다 — resolver 가 그 사이를 잇는다', fade(u, 2.1));
      mono(60, 395, 'root 의 parent 는 undefined → _ 로 받는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.4) }); return; }
    dbIcon(80, 110, 'users', { s: 0.75 });
    mono(150, 50, 'Query.user(_parent = undefined, { id: "1" })', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 });
    const row = ['{ id: "1",', '  name: "박호영",', '  firstName: "호영", lastName: "박",', '  email: "…" }'];
    const ra = k === 0 ? pop(u, 0.8) : 1;
    card(320, 150, 360, 116, { rx: 10, stroke: INK, s: ra, fill: SOFT });
    if (ra > 0.6) code(160, 118, row, k === 0 ? E(u, 1.0, 1.8) * 4 : 4, { fs: 14.5, lh: 23 });
    if (k === 0) { grow(120, 110, 140, 130, E(u, 0.6, 0.9), MUT); note(560, 150, '이 객체가 다음 단계의 parent', fade(u, 2.0), { fill: ACC }); return; }
    const kids = [['User.name', 'parent.name', '"박호영"', 1], ['User.fullName', '`${firstName} ${lastName}`', null, 1], ['User.posts', 'db.posts.findByUserId(parent.id)', '[post, post]', 2], ['User.initials', 'parent.name?.[0]', '"박"', 3]];
    kids.forEach(([f, ex, val, kk], i) => { if (kk > k) return; const y = [252, 292, 332, 372][i], a = kk === k ? E(u, 0.3 + (i % 2) * 0.4, 1.0 + (i % 2) * 0.4) : 1;
      el('line', { x1: 180, y1: 210, x2: 180, y2: 210 + (y - 5 - 210) * a, stroke: kk === k ? ACC : GRID, 'stroke-width': 2 });
      grow(180, y - 5, 202, y - 5, a >= 1 ? 1 : 0, kk === k ? ACC : MUT, { sw: 2 });
      if (a >= 1) { mono(210, y, f, { 'font-size': 14.5, 'font-weight': 700 }); mono(370, y, ex, { 'font-size': 14, fill: MUT });
        if (val) mono(910, y, '→ ' + val, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'end' }); } });
    if (k === 2) { dbIcon(880, 90, 'posts', { s: 0.6 }); note(560, 150, 'parent 에 없는 건 parent.id 로 다시 조회', fade(u, 1.8), { fill: WARN }); }
    if (k === 3) { pill(780, 140, 'DB 컬럼 아님 · 계산 필드', WARN, pop(u, 1.2), { fs: 14 }); } }

  // ---------- 3. args ----------
  function slots(vals, a) { const keys = ['keyword', 'first', 'orderBy'];
    zone(540, 60, 380, 190, 'args (resolver 의 두 번째 인자)', {});
    keys.forEach((kk, i) => { const y = 112 + i * 44, v = vals && vals[i];
      mono(566, y + 5, kk + ':', { 'font-size': 15, 'font-weight': 700 });
      card(800, y, 190, 34, { rx: 7, stroke: v ? (v[1] || ACC) : GRID, dash: v ? null : '5 5', fill: PANEL, text: v ? v[0] : '', mono: true, fs: 14.5, color: v ? (v[1] || ACC) : MUT, s: v ? v[2] ?? 1 : 1 }); }); }
  function s3(t, c) { const { k, u } = c;
    const sig = ['searchPosts(', '  keyword: String!,', '  first:   Int = 10,', '  orderBy: PostOrder = LATEST', '): [Post!]!'];
    if (k === 0) { code(60, 90, sig, E(u, 0.2, 1.3) * 5, { fs: 15.5, lh: 32, hi: (i) => (i >= 1 && i <= 3 && u > 1.4 ? ACCBG : null) });
      slots(null); note(60, 330, '여기 적은 이름과 타입이 그대로 args 의 모양이 된다', fade(u, 1.8));
      sub(480, 370, '기본값 10, LATEST 도 스키마가 정한다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 1) { tx(60, 66, '쿼리', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      code(60, 102, ['searchPosts(keyword: "graphql") { id }'], E(u, 0.1, 0.7), { fs: 15.5 });
      slots([['"graphql"', ACC, pop(u, 0.9)], ['10', INFO, pop(u, 1.4)], ['"LATEST"', INFO, pop(u, 1.7)]]);
      fly(220, 110, 800, 112, seg(u, 0.6, 1.0), 'keyword', { mono: true });
      pill(800, 280, '파란 값 = GraphQL 이 채운 기본값', INFO, pop(u, 2.1), { fs: 14 });
      sub(270, 200, '실측 args: { keyword: "graphql", first: 10, orderBy: "LATEST" }', fade(u, 2.3), { 'font-size': 13.5 }); return; }
    if (k === 2) { slots([['"graphql"', ACC], ['10', INFO], ['"LATEST"', INFO]]);
      code(60, 90, ['const { keyword, first, orderBy } = args;'], E(u, 0.2, 0.8), { fs: 15 });
      [[112, 'q'], [156, 'limit'], [200, 'order']].forEach(([y, nm], i) => dot([[705, y], [480, 200], [300, 300]], seg(u, 0.8 + i * 0.2, 1.6 + i * 0.2), [ACC, INFO, INFO][i], 6));
      terminal(60, 280, 860, 74, ['  db.posts.search({"q":"graphql","limit":10,"order":"LATEST"})'], E(u, 1.6, 2.3), { title: 'DB 호출 (실행 기록)', fs: 14 });
      note(60, 395, '검증이 끝난 값이라 그대로 넘긴다 — 기본값도 다시 채우지 않는다', fade(u, 2.4)); return; }
    if (k === 3) { code(60, 70, ['Post.excerpt(maxLength: 120)', '(parent, { maxLength = 120 }) =>', '  parent.body.slice(0, maxLength) + "..."'], E(u, 0.2, 1.1) * 3, { fs: 15, lh: 30 });
      const x0 = 60, w = 800, cut = E(u, 1.2, 2.0);
      tx(x0, 196, 'parent.body (예시 200자)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      el('rect', { x: x0, y: 210, width: w, height: 34, rx: 6, fill: SOFT, stroke: GRID });
      el('rect', { x: x0, y: 210, width: w * 0.6 * Math.max(0.02, cut) + (1 - cut) * w * 0.4 * 0, height: 34, rx: 6, fill: ACC, opacity: 0.8 });
      if (cut > 0) { el('line', { x1: x0 + w * 0.6, y1: 200, x2: x0 + w * 0.6, y2: 256, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }); mono(x0 + w * 0.6, 276, '120', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); }
      note(60, 330, '필드 자체도 인자를 받는다 — parent 와 args 를 함께 쓴다', fade(u, 2.1));
      sub(480, 370, '화면마다 다른 길이·형식 요구를 스키마로 표현', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    // k4: 검증 관문
    card(480, 150, 150, 130, { rx: 12, stroke: INK, sw: 2.5, text: '검증\n(validation)', fs: 16 });
    card(830, 150, 150, 70, { rx: 12, stroke: GRID, dash: '5 5', text: 'resolver', fs: 16, mono: true, color: MUT });
    grow(560, 150, 750, 150, 1, GRID, { plain: true, dash: '5 5' });
    [['searchPosts(keyword: 123)', 'String cannot represent a non string value: 123', 0.2], ['searchPosts(keyword: null)', 'Expected value of type "String!", found null.', 1.1]].forEach(([q, m, a], i) => {
      const y = 110 + i * 70; mono(40, y, q, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, a) });
      dot([[300, y - 5], [395, 150]], seg(u, a + 0.1, a + 0.6), BAD, 7); if (u > a + 0.6) cross(390, 150, 12, pop(u, a + 0.6));
      mono(40, 270 + i * 34, m, { 'font-size': 14, fill: BAD, opacity: fade(u, a + 0.7) }); });
    mono(830, 220, 'resolver 호출 0번', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    sub(480, 395, '타입이 틀린 값은 resolver 에 닿기 전에 끊긴다 (graphql-js 오류 문구)', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 4. context ----------
  function ctxBox(x, y, who, rows, s, col) { const h = 40 + rows.length * 26; card(x + 110, y + h / 2, 220, h, { rx: 10, stroke: col || ACC, fill: PANEL, sw: 2.2, s });
    if (s < 0.6) return; mono(x + 14, y + 24, who, { 'font-size': 14.5, 'font-weight': 800, fill: col || ACC });
    rows.forEach((r, i) => mono(x + 24, y + 50 + i * 26, r, { 'font-size': 14 })); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) { server(130, 200, 'ApolloServer :4000');
      if (k === 0) { card(520, 200, 220, 70, { rx: 10, stroke: GRID, dash: '5 5', text: 'context = {}', mono: true, fs: 16, color: MUT, s: pop(u, 0.6) });
        note(360, 330, 'context 를 안 주면 세 번째 인자는 빈 객체', fade(u, 1.6)); return; }
      const ra = k === 1 ? E(u, 0.2, 1.0) : 1;
      [['Bearer tokA', 90], ['Bearer tokB', 310]].forEach(([h, y], i) => { if (k >= 2 && i === 1) return; dot([[960, y], [600, y], [250, 200]], seg(u, 0.2 + i * 0.3, 1.0 + i * 0.3), INFO, 7);
        mono(800, y - 14, 'Authorization: ' + h, { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 0.2 + i * 0.3) : 1 }); });
      if (k === 1) { ctxBox(300, 70, 'ctx (요청 A)', ['user: 사용자 A'], pop(u, 1.2)); ctxBox(300, 260, 'ctx (요청 B)', ['user: 사용자 B'], pop(u, 1.6), INFO);
        note(560, 210, '요청마다 팩토리가 새로 돈다', fade(u, 2.0)); return; }
      const rows = ['user: 사용자 A', 'loaders.user: DataLoader', 'loaders.post: DataLoader', 'db'];
      ctxBox(300, 90, 'ctx (요청 A)', k === 2 ? rows.slice(0, 1 + Math.floor(E(u, 0.3, 1.6) * 3.99)) : rows, 1);
      if (k === 2) { note(560, 360, 'DataLoader 는 반드시 이 안에서 new', fade(u, 1.9), { fill: WARN }); return; }
      card(720, 300, 230, 44, { rx: 8, text: 'Query.me(_p, _a, ctx)', mono: true, fs: 14, stroke: ACC, color: ACC, s: pop(u, 0.3) });
      curve(530, 140, 640, 290, E(u, 0.6, 1.3), ACC, 60, -20);
      mono(720, 360, '→ ctx.user', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      note(40, 395, '인증은 context 에서 한 번, resolver 는 꺼내 쓰기만', fade(u, 2.0)); return; }
    if (k === 4) { // N+1 과 DataLoader
      tx(240, 40, 'DataLoader 없이', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD }); tx(720, 40, 'ctx.loaders.user.load(id)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, class: 'mono' });
      el('line', { x1: 480, y1: 30, x2: 480, y2: 340, stroke: GRID, 'stroke-dasharray': '5 6' });
      const ids = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1], n = E(u, 0.2, 1.6) * 10;
      ids.forEach((id, i) => { const a = clamp(n - i); if (a <= 0) return; const y = 72 + i * 25;
        mono(40, y + 5, `findById(${id})`, { 'font-size': 13.5, fill: BAD, opacity: a }); el('rect', { x: 180, y: y - 8, width: 250 * a, height: 14, rx: 4, fill: BAD, opacity: 0.55 }); });
      mono(240, 345, `DB ${1 + Math.round(n)}번 (posts 1 + 작성자 10)`, { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      // 오른쪽: 한 틱 동안 키를 모았다가 한 번에
      ids.forEach((id, i) => { const a = seg(u, 0.2 + i * 0.08, 0.6 + i * 0.08); const x = 540 + (i % 5) * 70, y = 90 + Math.floor(i / 5) * 40;
        if (a > 0) card(x, y, 56, 30, { rx: 15, text: 'load ' + id, fs: 13.5, mono: true, stroke: ACC, color: ACC, op: u > 1.4 ? 1 - E(u, 1.4, 1.8) * 0.6 : 1 }); });
      el('rect', { x: 505, y: 64, width: 360, height: 86, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.0) });
      tx(870, 162, '같은 틱에 모인 키', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.0) });
      fly(685, 160, 685, 225, seg(u, 1.6, 2.1), 'findByIds([1, 2, 3])', { mono: true, stay: true });
      mono(720, 300, 'DB 2번 (posts 1 + 배치 1)', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      sub(720, 330, '중복 id 도 한 번만 묻는다', fade(u, 2.4), { 'font-size': 14 });
      sub(480, 390, '글 10개·작성자 3명으로 실행한 결과. 배치 함수는 키 순서대로 같은 길이를 돌려줘야 한다', fade(u, 2.5), { 'font-size': 13.5 }); return; }
    // k5: 전역에 두면 샌다
    card(480, 90, 300, 56, { rx: 10, stroke: BAD, sw: 2.5, text: '모듈 전역 DataLoader', fs: 16, color: BAD, s: pop(u, 0.2) });
    [['요청 A', 200, 0.4], ['요청 B', 760, 1.3]].forEach(([n, x, a], i) => { card(x, 260, 150, 50, { rx: 10, text: n, fs: 15, stroke: i ? INFO : INK, color: i ? INFO : INK, s: pop(u, a) });
      dot([[x, 232], [480, 120]], seg(u, a + 0.2, a + 0.7), i ? INFO : INK, 7); });
    mono(200, 320, 'load("1") → batch 실행, 캐시에 저장', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
    mono(760, 320, 'load("1") → batch 없이 A 의 캐시 값', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) });
    banner(480, 385, '요청마다 context 안에서 새로 만든다', pop(u, 2.3)); }

  // ---------- 5. info · async · default resolver ----------
  const SIG = ['parent', 'args', 'context', 'info'];
  function sig(hi, op) { SIG.forEach((s, i) => { const x = 150 + i * 190, h = hi(i); card(x, 60, 170, 46, { rx: 23, text: s, mono: true, fs: 16, stroke: h ? ACC : GRID, color: h ? ACC : MUT, fill: h ? ACCBG : PANEL, sw: h ? 2.5 : 1.5, op }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { SIG.forEach((s, i) => { const x = 150 + i * 190, a = pop(u, 0.2 + i * 0.35); card(x, 150, 170, 50, { rx: 25, text: s, mono: true, fs: 17, stroke: i === 3 ? ACC : INK, color: i === 3 ? ACC : INK, fill: i === 3 ? ACCBG : PANEL, s: a });
        mono(x, 205, String(i + 1) + '번째', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.35) }); });
      note(480, 300, '마지막 자리 info = 지금 실행 중인 필드의 메타데이터', fade(u, 1.9), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { sig((i) => i === 3, 1);
      const rows = [['fieldName', '"posts"'], ['path', '{ prev: { key: "user" }, key: "posts" }'], ['responsePathAsArray', '["user", "posts"]'], ['parentType', 'User'], ['returnType', '[Post!]!']];
      rows.forEach(([a, b], i) => { const y = 136 + i * 42, s = fade(u, 0.3 + i * 0.35); mono(90, y, 'info.' + a, { 'font-size': 15, 'font-weight': 700, opacity: s, fill: i === 2 ? MUT : INK });
        mono(400, y, b, { 'font-size': 15, fill: ACC, opacity: s }); });
      sub(480, 395, 'User.posts 를 실행할 때 실제로 받은 값 (graphql-js)', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 2) { sig((i) => i === 3, 0.4);
      code(60, 140, ['user { name posts { id title } }'], E(u, 0.1, 0.6), { fs: 15.5, hi: () => (u > 0.8 ? ACCBG : null), w: 330 });
      mono(60, 180, "fieldNodes → ['id', 'title']", { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.8) });
      const cols = ['id', 'title', 'body', 'authorId', 'createdAt'];
      tx(500, 128, 'posts 테이블 컬럼 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      cols.forEach((s, i) => { const keep = i < 2, a = E(u, 1.2, 1.9); card(560 + (i % 3) * 120, 160 + Math.floor(i / 3) * 50, 108, 38, { rx: 6, text: s, mono: true, fs: 14, stroke: keep ? ACC : GRID, color: keep ? ACC : (a > 0.5 ? OFF : INK), fill: keep && a > 0.5 ? ACCBG : PANEL }); });
      mono(60, 300, 'SELECT *', { 'font-size': 18, 'font-weight': 800, fill: MUT, 'text-decoration': u > 1.9 ? 'line-through' : null });
      mono(220, 300, '→ SELECT id, title', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      sub(480, 370, 'graphql-fields · prisma-select 같은 도구가 이 일을 대신한다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 3) { code(60, 80, ['posts: async (parent, a, ctx) =>', '  await db.posts.findByUserId(parent.id)'], E(u, 0.1, 0.8) * 2, { fs: 15.5, lh: 30 });
      const done = u > 1.6; clock(200, 230, 40, done ? 1 : E(u, 0.6, 1.6), done ? GOOD : WARN, done ? 'resolved' : 'Promise 대기');
      grow(260, 230, 420, 230, E(u, 1.6, 2.0), GOOD);
      code(450, 210, ['{ "posts": [', '  { "id": "p1", … } ] }'], E(u, 1.8, 2.4) * 2, { fs: 15 });
      note(60, 360, 'Promise 를 돌려주면 GraphQL 이 기다렸다가 그 자리에 넣는다', fade(u, 2.3)); return; }
    if (k === 4) { code(60, 70, ['resolvers.User = {}   // name, age 함수 없음'], E(u, 0.1, 0.6), { fs: 15.5 });
      card(220, 190, 300, 90, { rx: 10, stroke: INK, fill: SOFT, s: pop(u, 0.5) });
      code(90, 175, ['parent = { id: "1",', '  name: "박호영", age: 33 }'], fade(u, 0.7) > 0 ? 2 : 0, { fs: 14.5, lh: 24 });
      [['name', '"박호영"', 160], ['age', '33', 220]].forEach(([f, v, y], i) => { const a = E(u, 1.0 + i * 0.4, 1.6 + i * 0.4); curve(372, 190, 560, y, a, ACC, 0, -20, { dash: '5 4' });
        if (a >= 1) { mono(580, y + 5, 'User.' + f, { 'font-size': 15, 'font-weight': 700 }); mono(720, y + 5, '→ parent.' + f + ' = ' + v, { 'font-size': 14.5, fill: ACC }); } });
      note(60, 330, '필드 이름이 parent 의 키와 같으면 default resolver 가 꺼내 준다', fade(u, 2.2));
      sub(480, 370, '실행 결과: { "name": "박호영", "age": 33 }', fade(u, 2.5), { 'font-size': 14.5 }); return; }
    // k5: 실제로 손으로 쓰는 것
    SIG.forEach((s, i) => { const x = 150 + i * 190, big = i < 3, a = pop(u, 0.2 + i * 0.25);
      card(x, 120, big ? 170 : 130, big ? 70 : 46, { rx: 14, text: s, mono: true, fs: big ? 19 : 15, stroke: big ? ACC : GRID, color: big ? ACC : MUT, fill: big ? ACCBG : PANEL, sw: big ? 2.5 : 1.5, s: a });
      tx(x, 190, ['부모 결과', '쿼리 인자', 'user · loaders · db', '필요할 때만'][i], { 'font-size': 14, 'text-anchor': 'middle', fill: big ? INK : MUT, opacity: fade(u, 0.4 + i * 0.25) }); });
    code(150, 280, ['(parent, args, ctx) => ctx.loaders.x.load(parent.id)'], E(u, 1.3, 2.1), { fs: 16 });
    banner(480, 375, '대부분은 parent + args + context, 아니면 default resolver', pop(u, 2.3)); }

  const quiz = [
    { q: 'query { user(id:"1") { name posts { title } } }에서 User.posts가 글 2개를 돌려주면 Post.title은 몇 번 호출되는가?',
      o: ['1번', '2번', '3번'], a: 1,
      why: 'resolver는 응답 트리의 노드마다 한 번씩 불린다. 실행 기록에도 Post.title(p1), Post.title(p2) 두 줄이 찍힌다.' },
    { q: 'User.name resolver의 첫 번째 인자 parent에는 무엇이 들어 있는가?',
      o: ['Query.user가 돌려준 user 객체', '쿼리에 적힌 인자 { id: "1" }', '요청마다 만든 context'], a: 0,
      why: 'parent는 트리에서 한 칸 위 resolver의 반환값이다. Query.user가 돌려준 DB row가 User 필드들의 parent가 된다.' },
    { q: 'searchPosts(keyword: "graphql")만 보냈을 때 resolver가 받는 args는 무엇인가?',
      o: ['{ keyword: "graphql" }', '{ keyword: "graphql", first: 10, orderBy: "LATEST" }', '{ keyword: "graphql", first: null, orderBy: null }'], a: 1,
      why: '스키마에 적은 기본값은 GraphQL이 resolver 호출 전에 채운다. 실행해 보면 first: 10, orderBy: "LATEST"가 함께 들어온다.' },
    { q: '글 10개의 작성자(id 1~3)를 Post.author에서 ctx.loaders.user.load로 읽으면 DB 호출은 몇 번인가?',
      o: ['11번', '4번', '2번'], a: 2,
      why: '글 목록 1번에 더해, 같은 틱에 모인 키를 DataLoader가 findByIds([1, 2, 3]) 한 번으로 묶는다. 없으면 1 + 10 = 11번이다.' },
    { q: 'User 타입에 name 필드 resolver를 적지 않았는데 응답에 name이 채워졌다. 왜인가?',
      o: ['info가 DB를 다시 조회해서', 'default resolver가 parent.name을 돌려줘서', 'Apollo Client가 캐시에서 채워서'], a: 1,
      why: '필드 이름이 parent의 키와 같으면 default resolver가 parent[필드명]을 그대로 돌려준다.' },
  ];

  const summary = [
    'resolver는 필드마다 함수 하나이고, 응답 트리의 노드마다 한 번씩 불린다.',
    'parent는 한 칸 위 resolver의 반환값이고, args는 검증과 기본값 채우기가 끝난 인자다.',
    'context는 요청마다 새로 만들어 user와 DataLoader를 담는다.',
    'DataLoader는 같은 틱의 키를 모아 글 10개 작성자 조회를 DB 1번으로 줄인다.',
  ];
  const review = [
    { q: '사용자 B의 화면에 사용자 A의 이름이 잠깐 보였다는 신고가 왔다. 먼저 확인할 코드는?',
      o: ['Post.title resolver의 반환값', 'DataLoader나 user를 모듈 전역에 만들어 둔 곳', '스키마의 기본값 first = 10'], a: 1,
      why: '전역 DataLoader는 캐시가 요청을 넘어 남아 B의 load가 A 때 저장한 값을 받는다. context 안에서 요청마다 새로 만들어야 한다.' },
    { q: '목록 화면에서 글 수만큼 DB 쿼리가 찍힌다. resolver 구조로 보면 원인과 해법은?',
      o: ['자식 필드 resolver가 원소마다 불린다, context의 DataLoader로 묶는다', 'args 검증이 느리다, Zod로 다시 검사한다', 'info를 안 써서다, 모든 필드에 info를 넘긴다'], a: 0,
      why: '자식 resolver는 부모 목록의 원소마다 한 번씩 돈다. 그 안의 조회를 DataLoader.load로 바꾸면 같은 틱의 키가 한 번에 묶인다.' },
    { q: 'searchPosts(keyword: 123)을 보냈는데 resolver 안 로그가 하나도 안 찍혔다. 이유는?',
      o: ['resolver가 비동기라 로그가 늦게 찍힌다', 'context 팩토리에서 인증이 실패했다', '타입 검증 단계에서 요청이 끊겨 resolver가 불리지 않았다'], a: 2,
      why: 'String 자리에 123이 오면 실행 전에 "String cannot represent a non string value: 123" 오류로 끝난다.' },
  ];

  R.page({ title: '리졸버 실행 따라가기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
