/* II-1-2 Query / Mutation / Subscription — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행 시간·응답·오류 문구·WebSocket 프레임은 graphql 16.15, graphql-ws 5.16 로 코드 블록을 실제로 돌려 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, server, browser, dbIcon, zone } = R;
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

  // 시간 막대: 0ms 가 x0, 1ms = sc px. a 부터 b 까지를 u 만큼
  function tbar(x0, sc, y, a, b, u, col, name, o) { o = o || {}; if (u <= 0) return; const x = x0 + a * sc, w = Math.max(3, (b - a) * sc * clamp(u));
    el('rect', { x, y: y - 13, width: w, height: 26, rx: 6, fill: o.fill || col, opacity: o.op ?? 0.9, stroke: o.dash ? col : 'none', 'stroke-dasharray': o.dash, 'stroke-width': 2 });
    if (name && u >= 1) mono(x + 10, y + 5, name, { 'font-size': 14, 'font-weight': 700, fill: o.dash ? col : PANEL }); }
  function taxis(x0, sc, y, max, step) { el('line', { x1: x0, y1: y, x2: x0 + max * sc, y2: y, stroke: MUT, 'stroke-width': 1.6 });
    for (let v = 0; v <= max; v += step) { el('line', { x1: x0 + v * sc, y1: y, x2: x0 + v * sc, y2: y + 5, stroke: MUT }); mono(x0 + v * sc, y + 22, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); } }

  // ---------- 1. Query ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const tc = tcard(40, 70, 560, 'type Query {', ['me: User', 'user(id: ID!): User', 'searchPosts(keyword: String!, first: Int = 10): [Post!]!'], { n: E(u, 0.2, 1.2) * 3, rh: 40 });
      ['내 정보', '사용자 한 명', '글 검색'].forEach((s, i) => { const a = E(u, 1.0 + i * 0.3, 1.4 + i * 0.3); grow(606, tc.row(i), 700, tc.row(i), a, ACC); if (a >= 1) pill(770, tc.row(i), s, ACC, pop(u, 1.3 + i * 0.3), { fs: 14.5 }); });
      note(40, 300, 'Query 에 적힌 필드만 클라이언트가 물어볼 수 있다', fade(u, 2.1));
      sub(480, 350, '세 필드 = 이 서비스의 읽기 입구 세 개', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 1) { lbl(240, 40, 'REST', 1, { fill: MUT }); lbl(720, 40, 'GraphQL', 1, { fill: ACC });
      el('line', { x1: 480, y1: 30, x2: 480, y2: 400, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '5 6' });
      browser(90, 150, 100, 76, '앱'); server(380, 150, 'API');
      [['GET /me', 0.2], ['GET /posts?q=graphql', 1.1]].forEach(([s, a], i) => { const y = 120 + i * 50;
        dot([[145, y], [318, y]], seg(u, a, a + 0.4), INK, 6); dot([[318, y + 14], [145, y + 14]], seg(u, a + 0.45, a + 0.85), ACC, 6);
        if (u > a) { el('line', { x1: 145, y1: y, x2: 318, y2: y, stroke: GRID, 'stroke-width': 2 }); mono(232, y - 8, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK }); } });
      mono(240, 290, `왕복 ${u < 1.1 ? (u < 0.2 ? 0 : 1) : 2}`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      browser(560, 150, 100, 76, '앱'); server(860, 150, '/graphql');
      dot([[615, 135], [798, 135]], seg(u, 0.4, 0.9), INK, 7); dot([[798, 160], [615, 160]], seg(u, 1.0, 1.5), ACC, 7);
      if (u > 0.4) { el('line', { x1: 615, y1: 135, x2: 798, y2: 135, stroke: GRID, 'stroke-width': 2 }); mono(706, 125, 'POST /graphql', { 'font-size': 13.5, 'text-anchor': 'middle' }); }
      code(560, 280, ['{ "me": { "name": … },', '  "trending": [ { "id": …, "title": … } ] }'], E(u, 1.4, 2.2) * 2, { fs: 14 });
      mono(720, 350, '왕복 1', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      sub(720, 380, 'trending: 은 searchPosts 에 붙인 별칭', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 2) { const x0 = 200, sc = 2.6;
      tx(40, 46, 'resolver 에 지연 100ms · 150ms 를 넣고 실행 (graphql-js)', { 'font-size': 14.5, fill: MUT, 'font-weight': 600 });
      taxis(x0, sc, 250, 250, 50);
      tx(180, 112, 'me', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); tx(180, 162, 'trending', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      tbar(x0, sc, 108, 6, 116, E(u, 0.2, 1.4), ACC, '100ms'); tbar(x0, sc, 158, 7, 165, E(u, 0.2, 1.8), ACC, '150ms');
      el('line', { x1: x0 + 165 * sc, y1: 80, x2: x0 + 165 * sc, y2: 250, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 1.8) });
      mono(x0 + 165 * sc, 72, '실측 165ms', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(180, 212, '차례로라면', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      tbar(x0, sc, 208, 0, 250, E(u, 2.0, 2.5), MUT, '합 250ms', { fill: 'none', dash: '5 4' });
      note(40, 330, '두 필드가 동시에 시작한다 — 사이드 이펙트가 없으니 안전하다', fade(u, 2.3)); return; }
    if (k === 3) { tx(60, 50, '쿼리 문서', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      const named = u > 1.0, nm = E(u, 0.6, 1.2);
      code(60, 90, [named ? 'query MyDashboard {' : 'query {', '  me { name avatarUrl }', '  trending: searchPosts(…)', '}'], 4, { fs: 15, lh: 28, hi: (i) => (i === 0 && named ? ACCBG : null) });
      if (!named && nm > 0) mono(60 + tw('query ', 15), 90, 'MyDashboard'.slice(0, Math.round(11 * nm)), { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      zone(520, 40, 400, 230, '모니터링 — operation 별 집계', {});
      const rows = named ? ['MyDashboard', '(익명)', '(익명)'] : ['(익명)', '(익명)', '(익명)'];
      rows.forEach((s, i) => { const y = 100 + i * 52, hot = named && i === 0; card(720, y, 360, 40, { rx: 8, stroke: hot ? ACC : GRID, fill: hot ? ACCBG : PANEL, sw: hot ? 2.5 : 1.5, s: hot ? pop(u, 1.0) : 1 });
        mono(560, y + 5, s, { 'font-size': 15, 'font-weight': 700, fill: hot ? ACC : MUT }); if (!hot) tx(880, y + 5, '어느 화면?', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
      note(60, 330, '이름이 없으면 느린 쿼리가 어느 화면 것인지 가릴 수 없다', fade(u, 1.9)); return; }
    // k4: HTTP 전송과 CDN
    browser(90, 170, 110, 80, '앱'); card(480, 170, 150, 80, { rx: 12, stroke: INFO, sw: 2.5, text: 'CDN', fs: 17, color: INFO }); server(840, 170, 'Apollo Server');
    el('line', { x1: 145, y1: 150, x2: 782, y2: 150, stroke: GRID, 'stroke-width': 2 }); el('line', { x1: 145, y1: 195, x2: 405, y2: 195, stroke: GRID, 'stroke-width': 2 });
    mono(270, 140, 'POST /graphql', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
    dot([[145, 150], [782, 150]], seg(u, 0.2, 1.0), INK, 7);
    sub(640, 138, 'POST 는 그대로 통과', fade(u, 0.9), { 'font-size': 13.5 });
    mono(275, 222, 'GET ?extensions={persistedQuery…}', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.1) });
    for (let i = 0; i < 3; i++) dot([[145, 195], [405, 195]], seg(u, 1.2 + i * 0.35, 1.6 + i * 0.35), INFO, 7);
    pill(480, 250, 'hit — 서버까지 안 간다', GOOD, pop(u, 2.0), { fs: 14 });
    note(60, 330, 'persisted query 해시로 보내면 GET 이 되어 CDN 이 응답을 캐시한다', fade(u, 2.2));
    sub(480, 370, '읽기 전용이라는 성질이 그대로 캐시 가능성이 된다', fade(u, 2.5), { 'font-size': 14.5 }); }

  // ---------- 2. Mutation ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const tc = tcard(40, 60, 620, 'type Mutation {', ['createPost(input: CreatePostInput!): Post!', 'updatePost(id: ID!, input: UpdatePostInput!): Post!', 'deletePost(id: ID!): Boolean!'], { n: E(u, 0.2, 1.2) * 3, rh: 40 });
      [['create', 'Post'], ['update', 'Post'], ['delete', 'Post']].forEach(([v, n], i) => { const s = pop(u, 1.2 + i * 0.3); pill(760, tc.row(i), v, ACC, s, { mono: true, fs: 14 }); if (s > 0.5) mono(810, tc.row(i) + 5, '+ ' + n, { 'font-size': 14, fill: MUT }); });
      note(40, 300, '이름 = 동사 + 명사, 한 필드가 상태 변경 하나', fade(u, 2.1)); return; }
    if (k === 1) { const ic = tcard(40, 60, 330, 'input CreatePostInput {', ['title: String!', 'body: String!', 'tagIds: [ID!]!'], { n: E(u, 0.2, 1.2) * 3 });
      curve(376, 130, 540, 130, E(u, 1.2, 1.8), ACC, 0, -40);
      code(550, 136, ['createPost(input: …): Post!'], fade(u, 1.5) > 0 ? 1 : 0, { fs: 15 });
      code(40, 300, ['variables: { "input": { "title": "…", "body": "…", "tagIds": [] } }'], E(u, 1.8, 2.5), { fs: 14.5 });
      sub(700, 220, '쓰기 인자는 input 타입 하나로', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    const x0 = 200, sc = 2.8, rev = k === 5;
    tx(40, 42, rev ? '같은 두 필드를 순서만 바꿔 실행' : '각 resolver 에 100ms 지연을 넣고 실행 (graphql-js)', { 'font-size': 14.5, fill: rev ? BAD : MUT, 'font-weight': 600 });
    taxis(x0, sc, 186, 240, 40);
    tx(180, 92, rev ? 'publish' : 'draft', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); tx(180, 142, rev ? 'draft' : 'publish', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
    if (!rev) { tbar(x0, sc, 88, 2, 108, k === 2 ? E(u, 0.2, 1.3) : 1, ACC, 'createPost');
      if (k >= 3) tbar(x0, sc, 138, 109, 220, k === 3 ? E(u, 0.2, 1.3) : 1, WARN, 'updatePost');
      if (k === 3) el('line', { x1: x0 + 108 * sc, y1: 70, x2: x0 + 108 * sc, y2: 186, stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }); }
    else { tbar(x0, sc, 88, 0, 6, 1, BAD, null); cross(x0 + 30, 88, 9, pop(u, 0.3)); mono(x0 + 50, 93, '글을 찾을 수 없다: abc', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.4) });
      el('rect', { x: x0 + 8 * sc, y: 125, width: 100 * sc, height: 26, rx: 6, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 0.8) });
      mono(x0 + 8 * sc + 12, 143, 'createPost — 실행 안 됨', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) }); }
    // 서버 상태 (DB)
    dbIcon(110, 300, 'posts', { s: 0.8 });
    const hasRow = !rev && (k > 2 || u > 1.0), pub = k >= 4 || (k === 3 && u > 1.3);
    if (hasRow) { card(330, 300, 250, 44, { rx: 8, stroke: pub ? GOOD : INK, s: k === 2 ? pop(u, 1.0) : 1 }); mono(220, 305, 'abc', { 'font-size': 15, 'font-weight': 800 }); mono(440, 305, pub ? 'PUBLISHED' : 'DRAFT', { 'font-size': 15, 'font-weight': 700, fill: pub ? GOOD : MUT, 'text-anchor': 'end' }); }
    if (rev) { card(330, 300, 250, 44, { rx: 8, stroke: GRID, dash: '5 5' }); tx(330, 305, '(비어 있음)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); }
    if (k === 2) note(500, 290, '먼저 글을 만든다 (DRAFT)', fade(u, 1.4));
    if (k === 3) { note(500, 280, 'create 가 끝난 뒤에야 update 가 시작', fade(u, 1.0)); sub(690, 318, 'id "abc" 는 코드에 적힌 값 — 앞 결과를 넘길 문법은 없다', fade(u, 1.8), { 'font-size': 13.5 }); }
    if (k === 4) { code(500, 262, ['{ "data": {', '  "draft": { "id": "abc" },', '  "publish": { "id": "abc", "status": "PUBLISHED" } } }'], E(u, 0.2, 1.4) * 3, { fs: 14 });
      mono(x0 + 220 * sc, 60, '실측 221ms', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(480, 395, '응답 키 순서도 요청에 적은 순서 그대로', fade(u, 2.0), { 'font-size': 14.5 }); }
    if (rev) { code(500, 270, ['{ "errors": [{ "message": "글을 찾을 수 없다: abc",', '               "path": ["publish"] }],', '  "data": null }'], E(u, 1.2, 2.2) * 3, { fs: 14, hi: (i) => (i === 2 ? BADBG : null) });
      sub(480, 395, 'publish 의 타입이 Post! 라 null 이 data 까지 번졌다', fade(u, 2.3), { 'font-size': 14.5 }); } }

  // ---------- 3. Subscription ----------
  const CX = 130, SX = 830;
  function pipe(label) { el('rect', { x: CX + 60, y: 120, width: SX - CX - 120, height: 64, rx: 32, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
    browser(CX, 150, 110, 84, '클라이언트'); server(SX, 150, '서버');
    if (label) mono(480, 108, label, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
  function frame(u, dir, s, y, col) { const a = dir > 0 ? CX + 70 : SX - 70, b = dir > 0 ? SX - 70 : CX + 70; fly(a, y, b, y, u, s, { mono: true, fill: col || (dir > 0 ? INK : ACC) }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const tc = tcard(40, 60, 470, 'type Subscription {', ['messageAdded(roomId: ID!): Message!', 'postCommented(postId: ID!): Comment!', 'presenceChanged: Presence!'], { n: E(u, 0.2, 1.2) * 3, rh: 40 });
      [0, 1, 2].forEach((i) => { const y = tc.row(i); if (u < 1.3 + i * 0.2) return; el('line', { x1: 520, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '2 6' });
        for (let j = 0; j < 4; j++) { const p = ((t * 0.35 + j / 4 + i * 0.13) % 1); el('circle', { cx: 520 + p * 380, cy: y, r: 6, fill: ACC, opacity: 0.85 }); } });
      note(40, 330, '필드 하나 = 이벤트가 생길 때마다 흘러오는 스트림 하나', fade(u, 2.0)); return; }
    pipe('ws://localhost:4000/graphql · 하위 프로토콜 graphql-transport-ws');
    if (k === 1) { frame(seg(u, 0.3, 1.1), 1, 'connection_init', 152); frame(seg(u, 1.2, 2.0), -1, 'connection_ack', 152);
      if (u > 2.0) pill(480, 152, '연결 열림 — 계속 유지', GOOD, pop(u, 2.0), { fs: 14 });
      note(60, 270, 'HTTP 요청 한 번이 아니라, 열어 둔 연결 하나다', fade(u, 2.2));
      sub(480, 320, '포트·프록시가 WebSocket 업그레이드를 통과시켜야 한다', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 2) { frame(seg(u, 0.2, 0.9), 1, 'subscribe  id:"1"  room:"r1"', 152);
      const msgs = [['next', '안녕', 1.0], ['next', '반가워', 1.6], ['complete', '', 2.2]];
      msgs.forEach(([ty, m, a]) => frame(seg(u, a, a + 0.55), -1, ty + (m ? ' ' + m : ''), 152, ty === 'complete' ? MUT : ACC));
      tx(60, 250, 'next 콜백이 받은 것', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      msgs.slice(0, 2).forEach(([, m, a], i) => { if (u < a + 0.55) return; code(60, 284 + i * 30, [`{ "messageAdded": { "id": "m${i + 1}", "text": "${m}", "sender": { "name": "민지" } } }`], 1, { fs: 14 }); });
      mono(900, 284, u > 2.15 ? 'next ×2' : u > 1.55 ? 'next ×1' : '', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
      sub(480, 395, '응답이 한 번이 아니라 이벤트마다 온다 (예시 데이터)', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 3) { // 서버 안: mutation → publish → PubSub → 구독자
      const A = { x: 230, y: 330 }, Bv = { x: 730, y: 330 };
      server(A.x, 270, '인스턴스 A', { s: 0.75 }); server(Bv.x, 270, '인스턴스 B', { s: 0.75 });
      mono(A.x, 345, 'sendMessage → publish', { 'font-size': 14, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 0.3) });
      mono(Bv.x, 345, 'subscribe + resolve', { 'font-size': 14, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 0.3) });
      // 인메모리: A 의 이벤트가 B 로 못 간다
      const mem = u < 1.4;
      if (mem) { dot([[A.x + 60, 270], [Bv.x - 60, 270]], seg(u, 0.4, 1.0), WARN, 7); if (u > 1.0) cross(480, 270, 12, pop(u, 1.0)); tx(480, 245, '인메모리 PubSub 은 프로세스 안에서만', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 }); }
      else { card(480, 290, 170, 44, { rx: 10, stroke: INFO, sw: 2.5, text: 'Redis PubSub', fs: 15, color: INFO, s: pop(u, 1.4) });
        dot([[A.x + 50, 270], [395, 290], [565, 290], [Bv.x - 50, 270]], seg(u, 1.8, 2.6), INFO, 7); }
      dot([[SX - 60, 168], [CX + 60, 168]], seg(u, 2.5, 2.95), ACC, 6);
      sub(480, 405, '인스턴스가 둘 이상이면 Redis 같은 공유 PubSub 이 필요하다', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k4: WebSocket · SSE · polling 비교 (같은 이벤트 세 번)
    zone(30, 232, 900, 182, '같은 이벤트 세 개가 언제 도착하나', {});
    const x0 = 230, w = 640, evs = [0.18, 0.5, 0.74], lanes = [['WebSocket', '양방향 · 즉시'], ['SSE', '서버 → 클라 · 즉시'], ['polling', '물어볼 때까지 대기']];
    evs.forEach((e) => { el('line', { x1: x0 + e * w, y1: 262, x2: x0 + e * w, y2: 404, stroke: WARN, 'stroke-width': 1.5, 'stroke-dasharray': '3 4', opacity: fade(u, 0.2) }); });
    lanes.forEach(([n, d], i) => { const y = 286 + i * 44; tx(48, y + 2, n, { 'font-size': 15, 'font-weight': 700 }); tx(48, y + 20, d, { 'font-size': 13.5, fill: MUT });
      el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: GRID, 'stroke-width': 2 });
      if (i === 2) for (let p = 0.0; p <= 1.0; p += 0.25) el('circle', { cx: x0 + p * w, cy: y, r: 4, fill: OFF });
      evs.forEach((e, j) => { const arr = i < 2 ? e : Math.ceil(e * 4) / 4, s = pop(u, 0.4 + arr * 1.8); el('circle', { cx: x0 + arr * w, cy: y, r: 8 * s, fill: i === 2 ? WARN : ACC }); }); });
    note(60, 40, '채팅·알림·협업 편집 = WebSocket 구독', fade(u, 1.8), { 'font-size': 14.5 });
    sub(700, 40, '단방향이면 SSE, 늦어도 되면 polling 이 더 가볍다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 4. 세 root 와 도달성 ----------
  const TY = { User: [700, 56], Room: [700, 120], Message: [700, 184], SendMessagePayload: [740, 248], Presence: [700, 312] };
  function s4(t, c) { const { k, u } = c;
    if (k === 5) { tx(60, 46, '인트로스펙션 query', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      code(60, 86, ['{', '  __schema {', '    queryType { name }', '    mutationType { name }', '    subscriptionType { name }', '  }', '}'], E(u, 0.2, 1.2) * 7, { fs: 15, lh: 28 });
      grow(400, 170, 480, 170, E(u, 1.2, 1.5), ACC);
      tx(500, 46, '응답 (graphql-js)', { 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.3) });
      code(500, 86, ['{ "data": { "__schema": {', '  "queryType": { "name": "Query" },', '  "mutationType": { "name": "Mutation" },', '  "subscriptionType":', '    { "name": "Subscription" } } } }'], E(u, 1.4, 2.3) * 5, { fs: 14.5, lh: 28 });
      note(60, 330, '스키마도 query 로 조회할 수 있는 데이터다', fade(u, 2.2));
      sub(480, 375, 'GraphiQL 자동완성과 codegen 이 이 응답으로 스키마를 안다', fade(u, 2.5), { 'font-size': 14.5 }); return; }
    const q = tcard(30, 18, 380, 'type Query {', ['me: User', 'room(id): Room', 'messages(roomId): [Message!]!'], { rh: 26, n: k === 0 ? E(u, 0.2, 0.9) * 3 : 3, col: k === 0 ? ACC : INK });
    const m = k >= 1 ? tcard(30, 146, 380, 'type Mutation {', ['sendMessage(input): SendMessagePayload!', 'deleteMessage(id): Boolean!', 'joinRoom(id): Room!'], { rh: 26, n: k === 1 ? E(u, 0.2, 0.9) * 3 : 3, col: k === 1 ? ACC : INK }) : null;
    const sb = k >= 2 ? tcard(30, 274, 380, 'type Subscription {', ['messageAdded(roomId): Message!', 'presenceChanged(roomId): Presence!'], { rh: 26, n: k === 2 ? E(u, 0.2, 0.9) * 2 : 2, col: k === 2 ? ACC : INK }) : null;
    const lit = {}, E1 = (kk) => (k === kk ? E(u, 1.0, 1.8) : k > kk ? 1 : 0);
    const edge = (y, ty, kk, i) => { const [x2, y2] = TY[ty], a = E1(kk); curve(414, y, x2 - tw(ty, 15) / 2 - 18, y2, a, k === kk ? ACC : GRID, 0, 0, { sw: 2 }); if (a >= 1) lit[ty] = 1; };
    edge(q.row(0), 'User', 0); edge(q.row(1), 'Room', 0); edge(q.row(2), 'Message', 0);
    if (m) { edge(m.row(0), 'SendMessagePayload', 1); edge(m.row(2), 'Room', 1); }
    if (sb) { edge(sb.row(0), 'Message', 2); edge(sb.row(1), 'Presence', 2); }
    Object.entries(TY).forEach(([n, [x, y]]) => pill(x, y, n, lit[n] ? INK : OFF, 1, { mono: true, fs: 15, fill: lit[n] ? PANEL : SOFT }));
    if (k === 0) sub(700, 380, '서비스가 무엇을 보여 주는지 Query 에서 드러난다', fade(u, 2.0), { 'font-size': 14 });
    if (k === 1) sub(700, 380, 'Mutation 목록 = 허용된 상태 변경의 전부', fade(u, 2.0), { 'font-size': 14 });
    if (k === 2) sub(700, 380, '실시간 이벤트도 스키마에 적혀야 발견된다', fade(u, 2.0), { 'font-size': 14 });
    if (k === 3) { mono(780, 61, '{ id name }', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) });
      mono(780, 125, '{ id name members }', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.7) });
      curve(840, 112, 760, 66, E(u, 1.0, 1.6), ACC, 50, 0); sub(700, 380, 'root 는 입구, 데이터의 몸통은 평범한 type', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 4) { mono(790, 189, '{ id text sender … }', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3) });
      const lg = pop(u, 0.8); pill(780, 370, 'type LegacyBadge (예시)', OFF, lg, { mono: true, fs: 14, color: MUT, fill: SOFT });
      if (u > 1.4) cross(905, 370, 9, pop(u, 1.4));
      tx(780, 405, '어느 root 에서도 닿지 않는다 = 죽은 스키마', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.7) }); } }

  // ---------- 5. 명명 규칙과 안티패턴 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { code(60, 80, ['mutation PublishPost($input: PublishPostInput!) {', '  publishPost(input: $input) {', '    post { id status }', '    userErrors { field message }', '  }', '}'], E(u, 0.2, 1.2) * 6, { fs: 15, lh: 30,
        hi: (i) => (u > 1.4 && i === 0 ? ACCBG : u > 1.8 && i === 1 ? ACCBG : u > 2.2 && i === 3 ? GOODBG : null) });
      [['operation 이름', 80, 1.4], ['동사 + 명사', 110, 1.8], ['실패도 데이터로', 170, 2.2]].forEach(([s, y, a]) => { grow(640, y - 5, 700, y - 5, E(u, a, a + 0.3), ACC); if (u > a + 0.3) pill(790, y - 5, s, ACC, pop(u, a + 0.3), { fs: 14 }); });
      sub(480, 330, '이름만 봐도 누가 무엇을 바꾸는지 보인다', fade(u, 2.5), { 'font-size': 14.5 }); return; }
    if (k === 1) { code(60, 100, ['mutation {', '  doStuff(p: "abc") { ok }', '}'], E(u, 0.2, 0.9) * 3, { fs: 17, lh: 34, hi: (i) => (u > 1.0 && i < 2 ? BADBG : null) });
      [['이름 없음 → 추적 불가', 82, 1.0], ['doStuff? 무엇을 바꾸나', 116, 1.5]].forEach(([s, y, a]) => { if (u > a) { cross(470, y, 8, pop(u, a)); tx(492, y + 6, s, { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, a) }); } });
      zone(60, 230, 840, 100, '모니터링', {}); mono(90, 290, '(anonymous) · doStuff · 오류율 ↑', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) });
      sub(480, 370, '이름은 나중에 바꾸기 가장 어려운 것 중 하나', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 2) { const g = E(u, 0.4, 1.4);
      [['getUser', 'user', 110], ['getUsers', 'users(filter, first, after)', 200]].forEach(([a, b, y], i) => { const gg = E(u, 0.4 + i * 0.5, 1.2 + i * 0.5);
        mono(100, y, a, { 'font-size': 20, 'font-weight': 700, fill: gg > 0.5 ? BAD : INK, 'text-decoration': gg > 0.5 ? 'line-through' : null });
        grow(330, y - 6, 420, y - 6, gg, ACC); if (gg >= 1) mono(440, y, b, { 'font-size': 20, 'font-weight': 700, fill: ACC }); });
      note(100, 290, '이미 query 안이니 get 은 군더더기다', fade(u, 1.9));
      sub(480, 340, '목록 필드는 filter · first · after 를 함께 설계한다', fade(u, 2.2), { 'font-size': 14.5 }); return g; }
    if (k === 3) { const w = E(u, 0.6, 1.4);
      card(250, 150, 160, 50, { rx: 10, text: 'Post', fs: 17, mono: true, stroke: INK });
      if (w > 0) { el('rect', { x: 250 - 110 - 40 * w, y: 150 - 40 - 30 * w, width: 220 + 80 * w, height: 80 + 110 * w, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': w < 1 ? '6 5' : null });
        if (w >= 1) { mono(110, 98, 'PublishPostPayload', { 'font-size': 15, 'font-weight': 800, fill: ACC }); card(250, 225, 220, 44, { rx: 8, text: 'userErrors: [UserError!]!', fs: 13.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.4) }); } }
      code(500, 110, ['성공 { "post": { … }, "userErrors": [] }'], E(u, 1.6, 2.1), { fs: 14.5 });
      code(500, 160, ['실패 { "post": null,', '       "userErrors": [{ "field": "title", … }] }'], E(u, 2.0, 2.6) * 2, { fs: 14.5 });
      sub(480, 360, '엔터티를 바로 돌려주면 나중에 에러 자리를 낼 수 없다 (응답은 예시)', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 4) { browser(120, 170, 110, 84, '클라이언트'); server(830, 170, '서버');
      el('line', { x1: 180, y1: 140, x2: 770, y2: 140, stroke: GRID, 'stroke-width': 2 }); el('line', { x1: 180, y1: 200, x2: 770, y2: 200, stroke: GRID, 'stroke-width': 2 });
      fly(250, 140, 680, 140, seg(u, 0.3, 1.1), 'addMessage', { mono: true, fill: INK, stay: true });
      tx(480, 120, '명령 — 해 달라는 요청 (Mutation 이름)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
      fly(680, 200, 270, 200, seg(u, 1.3, 2.1), 'messageAdded', { mono: true, stay: true });
      tx(480, 236, '통지 — 이미 일어난 일 (Subscription 이름)', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.9) });
      note(60, 330, '과거시제: messageAdded · orderShipped · presenceChanged', fade(u, 2.3)); return; }
    [['Query 안에서 DB write', '캐시·persisted query 가 무력화'], ['Mutation 한 요청에 20개 변경', '부분 실패를 추적하기 어렵다'], ['Subscription 으로 전체 동기화', '초기 값은 Query, 변화분만 구독']].forEach(([a, b], i) => {
      const y = 90 + i * 100, s = pop(u, 0.3 + i * 0.5); card(480, y, 760, 76, { rx: 12, stroke: BAD, sw: 2, s }); cross(140, y, 10, s);
      tx(170, y - 6, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.5) }); tx(170, y + 20, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.5) }); });
    banner(480, 395, 'Query = 읽기 · Mutation = 쓰기 · Subscription = 푸시', pop(u, 2.2)); }

  const quiz = [
    { q: '한 query 안의 me와 trending(searchPosts)에 각각 100ms, 150ms가 걸린다. 전체 응답 시간은 대략 얼마인가?',
      o: ['250ms 쯤, 차례로 실행된다', '150ms 쯤, 동시에 시작된다', '100ms 쯤, 빠른 쪽이 끝나면 응답한다'], a: 1,
      why: 'Query의 top-level 필드는 사이드 이펙트가 없어 동시에 돌 수 있다. 실측도 165ms로 긴 쪽에 가깝다.' },
    { q: '한 mutation에 createPost 다음 updatePost를 적었다. 실행 순서는 어떻게 되는가?',
      o: ['createPost가 끝난 뒤에 updatePost가 시작된다', '둘이 동시에 시작한다', '서버가 빠른 쪽부터 실행한다'], a: 0,
      why: 'Mutation의 top-level 필드는 적은 순서대로 하나씩 실행하는 것이 스펙이다. 순서를 바꾸면 결과도 달라진다.' },
    { q: 'Subscription으로 채팅 메시지를 받을 때 서버가 보내는 메시지 종류는 무엇인가?',
      o: ['HTTP 응답 한 번', '이벤트마다 next 프레임, 끝나면 complete', '클라이언트가 묻는 polling 응답'], a: 1,
      why: '열어 둔 WebSocket 연결로 이벤트마다 같은 모양의 next가 오고, 구독이 끝나면 complete가 온다.' },
    { q: '세 root 어디에서도 필드로 닿지 않는 type이 스키마에 있다면 무엇인가?',
      o: ['클라이언트가 조회할 길이 없는 죽은 스키마', '자동으로 Query에 붙는 타입', '인트로스펙션에서만 쓰는 타입'], a: 0,
      why: '모든 데이터는 Query·Mutation·Subscription 중 한 입구에서 시작해 필드를 따라가야 닿는다.' },
    { q: 'Subscription 필드 이름으로 알맞은 것은 무엇인가?',
      o: ['addMessage', 'getMessages', 'messageAdded'], a: 2,
      why: 'Subscription은 이미 일어난 일을 알리는 통지라 과거시제로 짓는다. addMessage는 명령이라 Mutation 이름에 맞다.' },
  ];

  const summary = [
    'Query 필드는 사이드 이펙트가 없어 동시에 실행되고 캐시하기도 쉽다.',
    'Mutation 필드는 적은 순서대로 하나씩 실행되고, 응답도 같은 순서로 온다.',
    'Subscription은 열어 둔 WebSocket으로 이벤트마다 같은 모양의 데이터를 보낸다.',
    '모든 타입은 세 root 중 하나에서 닿아야 하고, 클라이언트는 인트로스펙션으로 이를 찾는다.',
  ];
  const review = [
    { q: '한 mutation에 publish(updatePost)를 createPost보다 먼저 적었더니 data가 null이다. 원인으로 가장 그럴듯한 것은?',
      o: ['적은 순서대로 실행돼 아직 없는 글을 고치려다 실패했다', 'Mutation은 병렬이라 경쟁 조건이 났다', 'operation 이름이 없어 거절됐다'], a: 0,
      why: 'Mutation은 순차 실행이라 publish가 먼저 돌아 실패했고, 반환 타입이 Post!라 null이 data까지 번졌다.' },
    { q: '서버를 두 대로 늘린 뒤 일부 사용자에게만 채팅 메시지가 안 온다. 먼저 의심할 것은?',
      o: ['Query 캐시가 오래됐다', '인메모리 PubSub이라 다른 인스턴스의 구독자에게 이벤트가 안 간다', 'Mutation 이름이 과거시제가 아니다'], a: 1,
      why: '인메모리 PubSub은 한 프로세스 안에서만 이벤트를 나눈다. 인스턴스가 여럿이면 Redis 같은 공유 PubSub이 필요하다.' },
    { q: '대시보드 쿼리를 CDN에 캐시하고 싶다. 알맞은 조합은?',
      o: ['Mutation으로 읽고 POST로 보낸다', 'Subscription으로 바꾼다', '이름 붙인 Query를 persisted query 해시와 GET으로 보낸다'], a: 2,
      why: '읽기 전용인 Query만 캐시할 수 있고, POST는 CDN을 그대로 지나간다. 해시를 담은 GET이면 CDN이 응답을 재사용한다.' },
  ];

  R.page({ title: '세 가지 루트 연산', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
