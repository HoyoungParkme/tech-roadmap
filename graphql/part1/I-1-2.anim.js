/* I-1-2 정확한 필드만 조회 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 응답 바이트(38 B, 68 B), 리졸버 호출 횟수, AST 모양, TS 에러 문구는 graphql 16 · typescript 로 실제로 돌려 확인한 값이다.
 * 4장면의 200 → 1,200 B 는 페이지가 든 예시 값. */
(function () {
  const R = window.RA, { C, el, tx, spans, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone,
    server, dbIcon, cross, check, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, WARN, WARNBG, INFO, INFOBG } = C;
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function codeLines(x, y, L, n, o) { o = o || {}; const lh = o.lh || 24, fs = o.fs || 14.5;
    L.forEach((ln, i) => { if (i >= n) return; const [s, a] = Array.isArray(ln) ? ln : [ln, {}];
      const part = i === Math.floor(n) && n % 1 ? s.slice(0, Math.round(s.length * (n % 1))) : s;
      mono(x, y + i * lh, part, Object.assign({ 'font-size': fs, fill: INK }, a)); }); }

  // ---------- 1. 쿼리 모양 = 응답 모양 ----------
  const Q1 = ['query {', '  user(id: "1") {', '    name', '  }', '}'];
  const A1 = ['{ "data": {', '  "user": {', '    "name": "박호영"', '  }', '} }'];
  const ROW = (i) => 76 + i * 26;
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    zone(30, 30, 400, 168, '클라이언트가 적은 쿼리', { fill: SOFT }); zone(530, 30, 400, 168, '서버가 돌려준 JSON', { fill: k >= 2 ? ACCBG : SOFT });
    const qn = k === 0 ? lerp(0, 2, E(u, 0.2, 1.4)) : k === 1 ? lerp(2, 5, E(u, 0.2, 1.4)) : 5;
    codeLines(50, ROW(0), Q1.map((s, i) => [s, { fill: i === 2 ? ACC : INK, 'font-weight': i === 2 ? 800 : 500 }]), qn, { lh: 26, fs: 15 });
    if (k === 0) note(560, 120, '중괄호 안이 아직 비어 있다', fade(u, 1.6), { fill: MUT });
    if (k === 1) note(560, 120, '적은 필드: name 하나', fade(u, 1.6), { fill: ACC });
    if (k >= 2) { const g = k === 2 ? u : 3;
      A1.forEach((s, i) => { const a = seg(g, 0.2 + i * 0.25, 0.9 + i * 0.25);
        if (a > 0 && a < 1) dot([[50 + tw(Q1[i], 15) + 6, ROW(i) - 5], [548, ROW(i) - 5]], a, i === 2 ? ACC : MUT, 5);
        if (a >= 1) mono(550, ROW(i), s, { 'font-size': 15, fill: i === 2 ? ACC : INK, 'font-weight': i === 2 ? 800 : 500 }); });
      if (g > 1.8) for (const i of [1, 2]) el('line', { x1: 50 + tw(Q1[i], 15) + 8, y1: ROW(i) - 5, x2: 544, y2: ROW(i) - 5, stroke: ACC, 'stroke-width': 1.3, 'stroke-dasharray': '3 4', opacity: fade(g, 1.8) }); }
    if (k <= 2) [['쿼리에 적은 필드', b.clientFields, p.clientFields], ['응답에 온 필드', b.serverFields, p.serverFields]].forEach(([name, fs, pf], r) => { const y = 270 + r * 56;
      tx(40, y + 5, name, { 'font-size': 15, 'font-weight': 700, fill: MUT });
      if (!fs.length) mono(220, y + 5, '(아직 없음)', { 'font-size': 14, fill: OFF });
      let x = 220; fs.forEach((f) => { const w = tw(f, 14) + 26, isNew = !(pf || []).includes(f);
        card(x + w / 2, y, w, 32, { rx: 16, text: f, fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: isNew ? pop(u, r ? 1.4 : 0.8) : 1 }); x += w + 10; }); });
    if (k === 2) { check(560, 298, 12, pop(u, 2.0)); note(584, 304, '두 목록이 똑같다. 버릴 필드 0개', fade(u, 2.1), { fill: GOOD }); }
    const by = tween(p.bytes, b.bytes, u);
    mono(930, 220, `응답 ${fmt(by)} B`, { 'font-size': 16, 'font-weight': 800, fill: by > 0 ? ACC : MUT, 'text-anchor': 'end' });
    if (k === 3) { // 14,200 B 를 38 B 칸으로 나누면 374칸
      const x0 = 300, y0 = 248, n = Math.round(lerp(0, 374, E(u, 0.2, 1.8)));
      for (let i = 0; i < n; i++) el('rect', { x: x0 + (i % 34) * 12, y: y0 + Math.floor(i / 34) * 12, width: 10, height: 10, rx: 2, fill: OFF });
      tx(40, 268, 'REST GET /users/1', { 'font-size': 15, 'font-weight': 700 }); mono(40, 292, '14,200 B', { 'font-size': 15, fill: MUT });
      tx(40, 352, 'GraphQL', { 'font-size': 15, 'font-weight': 700, fill: ACC }); mono(40, 376, '38 B = 한 칸', { 'font-size': 15, fill: ACC });
      el('rect', { x: 200, y: 352, width: 10, height: 10, rx: 2, fill: ACC, opacity: fade(u, 0.4) });
      mono(900, 330, '약 1/370', { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.9) }); }
    if (k === 4) { const rows = [['REST', '서버', '클라이언트', '서버가 정한 100 필드', BAD], ['GraphQL', '클라이언트', '서버', '클라이언트가 정한 1 필드', ACC]];
      rows.forEach(([name, a, bb, what, col], i) => { const y = 262 + i * 80, s = pop(u, 0.2 + i * 0.7);
        lbl(80, y + 5, name, 1, { fill: col, opacity: fade(u, 0.1 + i * 0.7) });
        card(250, y, 140, 46, { rx: 10, text: a, fs: 15, stroke: col, sw: 2.5, fill: col === ACC ? ACCBG : PANEL, s });
        card(750, y, 140, 46, { rx: 10, text: bb, fs: 15, stroke: GRID, s });
        grow(322, y, 678, y, E(u, 0.5 + i * 0.7, 1.2 + i * 0.7), col);
        tx(500, y - 10, what, { 'font-size': 14.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.9 + i * 0.7) });
        pill(250, y - 36, '모양을 정한다', col, pop(u, 1.2 + i * 0.7), { fs: 13.5 }); }); }
  }

  // ---------- 2. 서버 안: 파싱 → AST → 리졸버 → 응답 ----------
  const AST = [[0, 'Document'], [1, 'OperationDefinition (query)'], [2, 'SelectionSet'], [3, 'Field "user"  id: "1"'], [4, 'SelectionSet'], [5, 'Field "name"'], [5, 'Field "email"']];
  const AY = (i) => 66 + i * 40, AX = (l) => 46 + l * 34;
  const CALLS = [['Query.user', 1], ['User.name', 1], ['User.email', 1], ['User.phone', 0], ['User.address', 0], ['User.locale', 0]];
  function astTree(k, u) {
    AST.forEach(([l, s], i) => { const a = k === 1 ? E(u, 0.15 + i * 0.25, 0.5 + i * 0.25) : 1; if (a <= 0) return;
      if (i > 0) { const pl = AST.slice(0, i).reverse().find((x) => x[0] === l - 1), pi = AST.indexOf(pl), x0 = AX(l - 1) + 10;
        el('path', { d: `M${x0},${AY(pi) + 12} V${lerp(AY(pi) + 12, AY(i), a)} ${a >= 1 ? `H${AX(l) - 6}` : ''}`, fill: 'none', stroke: GRID, 'stroke-width': 2 }); }
      const hot = (i === 3 && k >= 2) || (i >= 5 && k >= 3), w = tw(s, 14) + 22;
      card(AX(l) + w / 2, AY(i), w, 28, { rx: 7, text: s, fs: 14, mono: true, fw: 700, stroke: hot ? ACC : MUT, color: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, sw: hot ? 2.2 : 1.5, op: a }); }); }
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) {
      pill(480, 70, 'query { user(id: "1") { name email } }', ACC, pop(u, 0.2), { mono: true, fs: 15 });
      tx(480, 120, '서버가 받는 것: 쿼리 문자열 한 덩어리 (POST body 의 query)', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      server(480, 250, 'GraphQL 서버', { lamp: ACC, s: pop(u, 0.4) });
      dot([[480, 90], [480, 200]], seg(u, 1.0, 2.0), ACC, 7);
      ['name', 'email'].forEach((f, i) => pill(380 + i * 200, 360, '요구 필드 ' + f, ACC, pop(u, 1.6 + i * 0.3), { mono: true, fs: 14 }));
      return; }
    astTree(k, u);
    if (k === 1) { note(560, 120, '문자열이 트리로 바뀐다', fade(u, 1.4)); note(560, 150, '잎 노드 = 요청 필드 name, email', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 4) { // 응답 조립: 잎의 값이 같은 자리에 끼워진다
      zone(500, 50, 430, 170, 'data', { fill: ACCBG });
      const L = ['{ "data": {', '  "user": {', '    "name": "박호영",', '    "email": "hoyoung@example.com"', '} } }'];
      codeLines(520, 94, L.map((s, i) => [s, { fill: i === 2 || i === 3 ? ACC : INK, 'font-weight': i === 2 || i === 3 ? 700 : 500 }]), lerp(0, 5, E(u, 0.4, 1.8)), { lh: 25, fs: 14.5 });
      [5, 6].forEach((i, j) => dot([[AX(5) + 130, AY(i)], [700, 94 + (2 + j) * 25 - 5]], seg(u, 0.3 + j * 0.3, 1.3 + j * 0.3), ACC, 6));
      const by = tween(p.bytes, b.bytes, u);
      mono(920, 260, `${fmt(by)} B`, { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
      tx(920, 286, 'JSON.stringify 바이트 (UTF-8)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      note(500, 350, '응답의 구조는 쿼리 트리를 그대로 옮긴 것', fade(u, 2.0)); return; }
    if (k === 5) { // DB 까지 좁히기
      const cols = ['id', 'name', 'email', 'phone', 'address', 'locale'];
      tx(500, 70, 'users 테이블에서 읽는 컬럼', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      cols.forEach((s, i) => { const on = s === 'name' || s === 'email', dim = E(u, 1.0, 1.8);
        card(540 + i * 72, 110, 66, 32, { rx: 5, text: s, fs: 13.5, mono: true, stroke: on ? ACC : MUT, color: on ? ACC : INK, fill: on ? ACCBG : PANEL, op: on ? 1 : 1 - 0.6 * dim }); });
      card(700, 200, 400, 40, { rx: 8, text: 'SELECT * FROM users WHERE id=1', fs: 14, mono: true, stroke: OFF, color: OFF, s: pop(u, 0.2) });
      el('line', { x1: 510, y1: 200, x2: 890, y2: 200, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.9) });
      card(700, 262, 400, 40, { rx: 8, text: 'SELECT name, email FROM users WHERE id=1', fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.3) });
      note(500, 330, 'info 로 요청 필드를 읽어 select 에 넘긴다', fade(u, 1.8));
      tx(500, 356, '(graphql-fields 같은 도구, Prisma·Drizzle 의 select)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k 2, 3: 리졸버 호출 횟수 + parent
    tx(560, 58, '리졸버 호출 횟수', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    CALLS.forEach(([name, n], i) => { const y = 88 + i * 30, on = (i === 0 && k >= 2) || (i >= 1 && i <= 2 && k >= 3), skip = i >= 3 && k >= 3;
      const v = i === 0 ? (k === 2 ? (u > 0.6 ? 1 : 0) : 1) : i <= 2 ? (k === 3 ? (u > 1.0 + i * 0.3 ? 1 : 0) : 0) : 0;
      mono(560, y, name, { 'font-size': 14.5, 'font-weight': 700, fill: skip ? OFF : on ? ACC : INK });
      mono(760, y, String(v), { 'font-size': 16, 'font-weight': 800, fill: v ? ACC : skip ? OFF : MUT, 'text-anchor': 'end' });
      if (skip) tx(776, y, '쿼리에 없음', { 'font-size': 13.5, fill: OFF, opacity: fade(u, 1.8) }); });
    // parent 값 (Query.user 의 반환)
    const pa = k === 2 ? E(u, 0.8, 1.6) : 1;
    zone(500, 276, 430, 100, 'parent = Query.user 의 반환값', { fill: SOFT, op: pa });
    mono(518, 322, '{ id: "1", name: "박호영",', { 'font-size': 14, opacity: pa }); mono(518, 346, '  email: "hoyoung@…", phone: …, … }', { 'font-size': 14, opacity: pa });
    if (k === 2) dot([[AX(3) + 200, AY(3)], [500, 320]], seg(u, 0.4, 1.0), ACC, 6);
    if (k === 3) [5, 6].forEach((i, j) => dot([[500, 330], [AX(5) + 120, AY(i)]], seg(u, 0.3 + j * 0.4, 1.1 + j * 0.4), ACC, 6));
    if (k === 3) tx(500, 400, 'name·email 리졸버는 parent 에서 값을 꺼낸다', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
  }

  // ---------- 3. 엔드포인트 하나 ----------
  const URLS = [['GET', '/api/users'], ['GET', '/api/users/:id'], ['POST', '/api/users'], ['PUT', '/api/users/:id'], ['GET', '/api/users/:id/posts'], ['GET', '/api/posts'], ['GET', '/api/posts/:id/comments']];
  const NEED = [1, 4];
  function s3(t, c) { const { k, u } = c;
    const col = k >= 2 ? (k === 2 ? E(u, 0.2, 1.4) : 1) : 0;   // 모여드는 정도
    URLS.forEach(([m, path], i) => { const y0 = 64 + i * 34, s = k === 0 ? pop(u, 0.2 + i * 0.18, 0.5) : 1; if (s <= 0 || col >= 1) return;
      const x = lerp(60, 400, col), y = lerp(y0, 96, col), op = 1 - col, need = NEED.includes(i);
      const g = R.G(x, y, s, op);
      mono(0, 5, m.padEnd(5) + path, { 'font-size': 15, 'font-weight': need ? 800 : 500, fill: need ? ACC : INK }, g);
      if (need && k <= 1) tx(tw(m.padEnd(5) + path, 15) + 12, 5, '← 화면이 쓰는 것', { 'font-size': 13.5, fill: ACC, 'font-weight': 700 }, g); });
    if (k === 0) { mono(880, 120, String(Math.round(lerp(0, 7, E(u, 0.2, 1.4)))), { 'font-size': 44, 'font-weight': 800, 'text-anchor': 'end' }); tx(880, 146, '노출 URL', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); }
    if (k === 1) { const n = Math.round(lerp(0, 60, E(u, 0.2, 1.8)));
      for (let i = 0; i < n; i++) el('rect', { x: 560 + (i % 6) * 58, y: 60 + Math.floor(i / 6) * 22, width: 50, height: 10, rx: 3, fill: OFF, opacity: 0.8 });
      mono(60, 330, 'GET  /api/search?q=…', { 'font-size': 15, opacity: fade(u, 0.3) });
      note(560, 300, '검색·필터·화면 조합마다 또 하나', fade(u, 1.6)); mono(560, 334, '수십 ~ 수백 개', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
      note(560, 372, '인증·로깅·CORS·게이트웨이 설정도 같이 는다', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); }
    if (k >= 2) card(480, 96, 260, 48, { rx: 12, text: 'POST /graphql', fs: 18, mono: true, stroke: ACC, color: ACC, fill: ACCBG, sw: 2.5, s: k === 2 ? pop(u, 1.2) : 1 });
    if (k === 2) { tx(480, 160, 'HTTP 경로 하나 · 메서드 POST · JSON 본문', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      mono(480, 210, '엔드포인트 수십 → 1', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
    if (k >= 3) { const L = ['{', '  "query": "query { user(id:\\"1\\") { name posts { title } } }",', '  "variables": {},', '  "operationName": null', '}'];
      zone(170, 136, 620, 150, 'body — 무엇을 줄지는 여기서 정한다', { fill: SOFT });
      codeLines(190, 180, L.map((s, i) => [s, { fill: i === 1 ? ACC : INK, 'font-weight': i === 1 ? 700 : 500 }]), k === 3 ? lerp(0, 5, E(u, 0.3, 1.8)) : 5, { lh: 23, fs: 14 });
      grow(480, 120, 480, 136, k === 3 ? E(u, 0.1, 0.3) : 1, ACC, { plain: true }); }
    if (k === 4) { [['게이트웨이 1줄', 120], ['인증 미들웨어 1곳', 360], ['로깅·CORS 1곳', 600], ['rate limit = 쿼리 비용', 840]].forEach(([s, x], i) => {
        const a = E(u, 0.3 + i * 0.3, 0.9 + i * 0.3); card(x, 360, 210, 44, { rx: 22, text: s, fs: 14.5, stroke: i === 3 ? WARN : GOOD, color: i === 3 ? WARN : INK, s: pop(u, 0.2 + i * 0.3) });
        el('path', { d: `M${x},338 Q${x},${300} ${lerp(x, 480, 0.5)},${296}`, fill: 'none', stroke: i === 3 ? WARN : GOOD, 'stroke-width': 1.8, 'stroke-dasharray': '4 4', opacity: a }); });
      tx(480, 320, '설정은 한 곳에', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
  }

  // ---------- 4. 한 쿼리에 자원 넷 ----------
  const Q4 = [['query HomeScreen($userId: ID!) {', -1], ['  user(id: $userId) { name profileImageUrl }', 0], ['  posts(first: 5, orderBy: LATEST) {', 1], ['    id title commentCount }', 1],
    ['  recommendations(userId: $userId, limit: 4) {', 2], ['    productId name thumbnail }', 2], ['  unreadCount(userId: $userId)', 3], ['}', -1]];
  const QY = (i) => 64 + i * 25;
  const REG = [[710, 82, 160, 46], [710, 166, 160, 90], [710, 268, 160, 52], [770, 50, 26, 22]];   // 휴대폰 안 영역 (cx, cy, w, h)
  function homePhone(k, u, upto) {
    el('rect', { x: 620, y: 34, width: 180, height: 310, rx: 18, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    tx(710, 366, 'HomeScreen', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
    REG.forEach(([cx, cy, w, h], r) => { const on = r <= upto, a = r === upto && r === k ? E(u, 0.9, 1.6) : on ? 1 : 0;
      el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 6, fill: on ? ACCBG : 'none', stroke: on ? ACC : GRID, 'stroke-width': 1.5, 'stroke-dasharray': on ? null : '4 4', opacity: on ? 0.3 + 0.7 * a : 1 });
      if (!on || a < 0.5) return;
      if (r === 0) { el('circle', { cx: cx - 52, cy, r: 14, fill: ACC }); tx(cx - 30, cy + 5, '박호영', { 'font-size': 14, 'font-weight': 700 }); }
      if (r === 1) for (let j = 0; j < 3; j++) { el('rect', { x: cx - 66, y: cy - 34 + j * 24, width: 96, height: 9, rx: 4, fill: INK, opacity: 0.6 }); mono(cx + 66, cy - 26 + j * 24, '💬', { 'font-size': 13.5, 'text-anchor': 'end' }); }
      if (r === 2) for (let j = 0; j < 4; j++) el('rect', { x: cx - 70 + j * 36, y: cy - 16, width: 30, height: 32, rx: 5, fill: WARN, opacity: 0.6 });
      if (r === 3) { el('circle', { cx, cy, r: 11, fill: BAD }); mono(cx, cy + 5, 'n', { 'font-size': 13.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }); } }); }
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const upto = Math.min(k, 3);
    Q4.forEach(([s, r], i) => { const show = r <= upto, hot = r === k && k <= 3; if (!show && r !== -1) return;
      if (r !== -1 && r === k && k <= 3) { const a = E(u, 0.1, 0.7); if (a <= 0) return; }
      mono(40, QY(i), s, { 'font-size': 14, fill: hot ? ACC : r === -1 ? MUT : INK, 'font-weight': hot ? 800 : 500 }); });
    homePhone(k, u, upto);
    if (k <= 3) { const r = k, line = Q4.findIndex((x) => x[1] === r), [cx, cy, w] = REG[r];
      grow(40 + tw(Q4[line][0], 14) + 8, QY(line) - 5, cx - w / 2 - 4, cy, E(u, 0.5, 1.2), ACC, { sw: 1.8 }); }
    const by = tween(p.bytes, b.bytes, u);
    if (k <= 3) { spans(40, 300, [['HTTP 호출 ', { fill: MUT }], ['1', { 'font-weight': 800, fill: ACC }], ['    응답 ', { fill: MUT }], [fmt(by) + ' B', { 'font-weight': 800, fill: ACC }], ['  (예시)', { fill: MUT }]], { 'font-size': 16 });
      if (k >= 1) note(40, 340, `REST 였다면 여기까지 ${k + 1}번 호출`, fade(u, 1.4), { fill: MUT });
      return; }
    if (k === 4) { // 서버: 루트 필드 넷이 동시에
      const ax = axes(150, 280, 420, 80, { x: [0, 200], y: [0, 1], xt: [0, 50, 100, 150, 200] });
      ['user', 'posts', 'recommendations', 'unreadCount'].forEach((n, i) => { const y = 286 + i * 18, g = E(u, 0.3, 1.3);
        el('rect', { x: ax.X(0), y, width: (ax.X(50) - ax.X(0)) * g, height: 13, rx: 3, fill: ACC });
        el('rect', { x: ax.X(50 * i), y, width: (ax.X(50) - ax.X(0)) * E(u, 1.4 + i * 0.2, 1.8 + i * 0.2), height: 13, rx: 3, fill: 'none', stroke: OFF, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' });
        mono(142, y + 11, n, { 'font-size': 13.5, 'text-anchor': 'end', fill: ACC, 'font-weight': 700 }); });
      tx(570, 270, '실선 = GraphQL 리졸버 (동시에 시작) · 점선 = REST 4번 차례로', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      tx(570, 410, 'ms · graphql-js 측정: 넷 다 같은 시각에 시작', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.0) }); return; }
    // k 5: 결과
    [['HTTP 호출', '4 → 1'], ['기다리는 RTT', '4 → 1']].forEach(([a, v], i) => { const s = pop(u, 0.2 + i * 0.3);
      card(150 + i * 250, 320, 220, 70, { rx: 10, stroke: ACC, sw: 2, s }); tx(150 + i * 250, 308, a, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.3) });
      mono(150 + i * 250, 340, v, { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.3) }); });
    tx(40, 400, '모달이 데이터를 더 원하면 URL 신설 없이 쿼리를 하나 더 보낸다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
  }

  // ---------- 5. 쿼리 = 응답 = 타입 ----------
  const COLS = [['쿼리 (문자열)', ['query Home($id: ID!) {', '  user(id: $id) { name }', '  posts(first: 3) { title }', '}']],
    ['응답 (JSON)', ['{ "data": {', '  "user": { "name": "박호영" },', '  "posts": [{ "title": "…" }]', '} }']],
    ['타입 (codegen 생성)', ['type HomeQuery = {', '  user: { name: string };', '  posts: Array<{ title: string }>;', '};']]];
  function shape(cx, y, a, col) { // root → user → name / posts → [] → title
    const nodes = [[cx, y, '·'], [cx - 60, y + 40, 'user'], [cx + 60, y + 40, 'posts[ ]'], [cx - 60, y + 80, 'name'], [cx + 60, y + 80, 'title']];
    [[0, 1], [0, 2], [1, 3], [2, 4]].forEach(([i, j]) => grow(nodes[i][0], nodes[i][1] + 10, nodes[j][0], nodes[j][1] - 12, a, col, { sw: 2, plain: true }));
    nodes.forEach(([x, yy, s], i) => { if (i === 0) el('circle', { cx: x, cy: yy, r: 7, fill: col, opacity: a }); else card(x, yy, tw(s, 13.5) + 20, 24, { rx: 12, text: s, fs: 13.5, mono: true, stroke: col, color: col, op: a }); }); }
  function s5(t, c) { const { k, u } = c;
    COLS.forEach(([title, L], j) => { if (j > Math.min(k, 2)) return; const x = 30 + j * 310, a = j === k ? E(u, 0.1, 0.5) : 1;
      zone(x, 30, 300, 150, title, { fill: j === k && k <= 2 ? ACCBG : SOFT, op: a });
      codeLines(x + 14, 74, L, j === k ? lerp(0, 4, E(u, 0.3, 1.6)) : 4, { lh: 24, fs: 13.5 }); });
    if (k <= 2) { shape(185 + Math.min(k, 2) * 310, 230, E(u, 1.2, 2.0), ACC);
      for (let j = 0; j < k; j++) shape(185 + j * 310, 230, 1, MUT);
      if (k === 1) note(480, 390, '쿼리에서 적은 계층이 JSON 에 그대로', fade(u, 2.0), { 'text-anchor': 'middle' });
      if (k === 2) note(480, 390, '같은 쿼리에서 타입을 뽑으니 사람이 옮겨 적을 곳이 없다', fade(u, 2.0), { 'text-anchor': 'middle' });
      return; }
    if (k === 3) { const L = [['data.user.name;', 'string', GOOD, null], ['data.user.email;', "TS2339: Property 'email' does not exist on type '{ name: string; }'.", BAD, 'email'],
        ['data.posts[0].commentCount;', "TS2339: Property 'commentCount' does not exist on type '{ title: string; }'.", BAD, 'commentCount']];
      L.forEach(([code, msg, col, bad], i) => { const y = 226 + i * 62, a = fade(u, 0.2 + i * 0.5);
        mono(40, y, code, { 'font-size': 15, 'font-weight': 700, opacity: a });
        if (bad) { const x0 = 40 + tw(code.slice(0, code.indexOf(bad)), 15), w = tw(bad, 15), wv = E(u, 0.5 + i * 0.5, 1.0 + i * 0.5);
          let d = `M${x0},${y + 6}`; for (let q = 0; q < w * wv; q += 6) d += ` l3,3 l3,-3`; el('path', { d, fill: 'none', stroke: BAD, 'stroke-width': 1.6 }); }
        if (!bad) check(330, y - 5, 9, pop(u, 0.4));
        mono(bad ? 40 : 350, bad ? y + 26 : y, bad ? msg : msg, { 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.5) }); });
      tx(920, 410, 'tsc 로 실제로 검사한 출력', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.0) }); return; }
    // k 4: 세 모양이 하나
    [0, 1, 2].forEach((j) => { shape(185 + j * 310, 230, 1, seg(u, 0.2 + j * 0.4, 0.6 + j * 0.4) > 0.5 ? ACC : MUT);
      if (j) mono(30 + j * 310, 280, '=', { 'font-size': 34, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4 + j * 0.4) }); });
    note(495, 390, '쿼리에 안 적은 필드는 응답에도 타입에도 없다', fade(u, 1.8), { 'text-anchor': 'middle', fill: ACC });
  }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'query { user(id: "1") { name } }의 응답에 들어 있는 필드는 무엇인가?',
      o: ['user 아래 name 하나', 'user의 필드 100개 전부', 'name과 id 두 개'], a: 0,
      why: '응답은 쿼리와 같은 모양이다. {"data":{"user":{"name":"박호영"}}} 38 B만 온다.' },
    { q: 'name과 email만 적은 쿼리에서 User.phone 리졸버가 호출되는 횟수는 무엇인가?',
      o: ['1번', 'user 수만큼', '0번'], a: 2,
      why: '실행기는 쿼리 트리에 있는 필드만 따라간다. Query.user 1번, User.name·User.email 각 1번이고 phone은 0번이다.' },
    { q: 'GraphQL 서버가 무엇을 돌려줄지 정하는 곳은 무엇인가?',
      o: ['요청 URL 경로', 'POST body의 query 문자열', 'HTTP 메서드'], a: 1,
      why: '경로는 POST /graphql 하나뿐이다. 어떤 자원과 필드를 줄지는 body의 query가 정한다.' },
    { q: 'HomeScreen 쿼리의 루트 필드 넷이 서버에서 실행되는 방식은 무엇인가?',
      o: ['적힌 순서대로 하나씩', 'user가 끝난 뒤 나머지 셋이 동시에', '넷이 동시에 시작한다'], a: 2,
      why: 'query의 루트 필드는 서로 기다리지 않는다. graphql-js로 재 보니 넷이 같은 시각에 시작했다.' },
    { q: 'Home 쿼리에 email을 적지 않고 data.user.email을 쓰면 문제가 드러나는 때는 언제인가?',
      o: ['tsc 타입 검사에서 TS2339 에러로', '런타임에 undefined가 나올 때', '서버가 400을 돌려줄 때'], a: 0,
      why: 'codegen이 쿼리에서 뽑은 타입에는 email이 없다. tsc가 Property \'email\' does not exist 에러를 낸다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    '쿼리에 적은 필드만 응답에 온다. user의 name 하나면 응답은 38 B다.',
    '서버는 쿼리를 AST로 파싱하고, 적힌 필드의 리졸버만 위에서 아래로 실행한다.',
    '경로는 POST /graphql 하나이고, 무엇을 줄지는 body의 query 문자열이 정한다.',
    '응답이 쿼리와 같은 모양이라 codegen이 타입을 뽑고, 안 적은 필드는 빌드에서 걸린다.',
  ];
  const review = [
    { q: '쿼리에서 email을 지웠더니 응답만이 아니라 서버 일도 줄었다. 맞는 설명은?',
      o: ['User.email 리졸버가 돌지 않고, select를 좁히면 읽는 컬럼도 준다', '응답이 gzip으로 압축돼서', 'HTTP 호출 수가 줄어서'], a: 0,
      why: '쿼리에 없는 필드는 리졸버가 호출되지 않는다. info로 요청 필드를 읽어 SELECT name처럼 좁히면 DB 일도 준다.' },
    { q: '홈 화면에 미읽음 수를 새로 띄워야 한다. GraphQL 서버에서 먼저 할 일은?',
      o: ['/api/unread-count 경로를 새로 연다', '스키마에 unreadCount 필드와 리졸버를 더한다', '클라이언트에 HTTP 호출을 하나 더 만든다'], a: 1,
      why: '스키마가 곧 라우팅이다. 필드 한 줄을 더하면 HomeScreen 쿼리에 한 줄 적어 같은 호출로 받는다.' },
    { q: '응답 타입을 손으로 적던 팀이 필드 이름 오타 버그를 자주 낸다. GraphQL로 옮기며 이 버그를 줄이는 것은?',
      o: ['리졸버를 Promise.all로 바꾸기', '엔드포인트를 하나로 합치기', '쿼리에서 타입을 생성해 tsc가 검사하게 하기'], a: 2,
      why: '쿼리·응답·타입이 같은 모양이라 codegen이 타입을 뽑는다. 쿼리에 없는 필드를 쓰면 빌드 때 TS2339로 막힌다.' },
  ];
  R.page({ title: '쿼리 모양 그대로 오는 응답', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
