/* V-1-1 인증/인가 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 요청 헤더 → context → ctx.user, resolver 가드, User 행의 email 칸, SDL의 @auth, shield 규칙 트리.
 * 응답 JSON·에러 문구는 graphql 16 + @apollo/server 4 + graphql-shield 7로 페이지 코드를 돌려 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, cross, check, lock, person, dbIcon, spans, tokens } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  // 코드·JSON 상자: lines는 문자열 또는 [문자열, 색]. shown 줄까지 보인다(소수면 마지막 줄을 타이핑)
  function code(x, y, lines, shown, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || fs + 7, n = lines.length;
    const w = o.w || Math.max(...lines.map((l) => tw(Array.isArray(l) ? l[0] : l, fs))) + 28, h = n * lh + 16;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: o.op ?? 1 });
    if (o.title) tx(x + 4, y - 8, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: o.op ?? 1 });
    const sh = shown == null ? n : shown;
    lines.forEach((l, i) => { if (i >= Math.ceil(sh)) return; let [s, col] = Array.isArray(l) ? l : [l, null];
      if (i === Math.ceil(sh) - 1 && sh % 1) s = s.slice(0, Math.round(s.length * (sh % 1)));
      const yy = y + 8 + fs + i * lh;
      if (col) mono(x + 14, yy, s, { 'font-size': fs, fill: col, 'font-weight': 600, opacity: o.op ?? 1 });
      else spans(x + 14, yy, tokens(s), { 'font-size': fs, opacity: o.op ?? 1 }); });
    return { w, h }; }
  const line = (x1, y1, x2, y2, col, o) => { o = o || {}; el('line', { x1, y1, x2, y2, stroke: col || GRID, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); };

  // ---------- 1. context.user ----------
  function reqCard(op) { const g = card(130, 196, 214, 112, { rx: 10, stroke: INK, sw: 2, op });
    mono(-92, -26, 'POST /graphql', { 'font-size': 14.5, 'font-weight': 700 }, g);
    mono(-92, 2, 'Authorization:', { 'font-size': 13.5, fill: MUT }, g);
    mono(-92, 28, 'Bearer eyJhbGci…', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 }, g);
    tx(0, 78, 'HTTP 요청', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT }, g); }
  function ctxFn(hot) { card(440, 196, 196, 64, { rx: 10, stroke: hot ? ACC : INK, sw: hot ? 2.6 : 2, fill: hot ? ACCBG : PANEL, text: 'context({ req })', mono: true, fs: 15 });
    sub(440, 248, '요청마다 한 번 호출', 1); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      card(480, 150, 380, 62, { rx: 10, stroke: INK, sw: 2.2, text: 'new ApolloServer({ typeDefs, resolvers })', mono: true, fs: 15, s: pop(u, 0.2) });
      fly(160, 330, 400, 150, seg(u, 0.6, 1.4), 'typeDefs', { mono: true, fill: INFO });
      fly(160, 330, 560, 150, seg(u, 0.9, 1.7), 'resolvers', { mono: true, fill: INFO });
      pill(760, 260, 'import jwt from "jsonwebtoken"', INFO, pop(u, 1.5), { mono: true, fs: 13.5 });
      lock(360, 300, false, MUT, pop(u, 1.9)); note(392, 306, '아직 인증 없음 · 누가 보냈는지 모른다', fade(u, 1.9), { fill: MUT });
      return; }
    mono(40, 40, 'await startStandaloneServer(server, { context })', { 'font-size': 14, fill: MUT });
    if (k <= 4) { reqCard(1); ctxFn(k === 1); grow(238, 196, 340, 196, 1, MUT); }
    if (k === 1) { for (let i = 0; i < 3; i++) { const a = 0.2 + i * 0.6;
        dot([[24, 196], [238, 196], [340, 196], [538, 196], [640, 120 + i * 66]], seg(u, a, a + 0.9), ACC, 7);
        card(720, 120 + i * 66, 150, 46, { rx: 8, text: `요청 ${i + 1} → ctx`, fs: 14.5, stroke: ACC, color: ACC, s: pop(u, a + 0.8) }); }
      note(560, 360, '반환한 객체가 그 요청의 모든 resolver에게 3번째 인자로 간다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { const y = 320, cut = E(u, 0.9, 1.7);
      grow(130, 254, 130, y - 22, E(u, 0.2, 0.6), MUT);
      mono(145, y - 34, 'req.headers.authorization', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3) });
      mono(150, y, 'Bearer ', { 'font-size': 18, 'font-weight': 700, fill: MUT, opacity: 1 - cut, transform: `translate(0 ${-30 * cut})` });
      mono(150 + 7 * 10.8 * (1 - cut), y, 'eyJhbGci.eyJzdWIi.Sfl4', { 'font-size': 18, 'font-weight': 700, fill: INFO });
      pill(560, y - 6, 'auth.slice(7)', ACC, pop(u, 0.8), { mono: true, fs: 14 });
      pill(790, y - 6, 'token', INFO, pop(u, 1.9), { mono: true, fs: 15 });
      note(560, 380, '헤더가 없으면 token = null로 시작한다 (여기서 던지지 않는다)', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 3) { const parts = [['header', MUT], ['payload', INFO], ['signature', ACC]];
      parts.forEach(([s, col], i) => card(236 + i * 128, 320, 118, 40, { rx: 8, text: s, mono: true, fs: 14, stroke: col, color: col, fill: PANEL, s: pop(u, 0.2 + i * 0.25) }));
      check(600, 320, 12, pop(u, 1.0)); mono(620, 326, 'jwt.verify(token, JWT_SECRET)', { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.0) });
      grow(364, 342, 364, 372, E(u, 1.2, 1.5), INFO); mono(300, 396, '{ "sub": "1" }', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) });
      dbIcon(700, 160, 'db.users', { s: pop(u, 1.6) }); grow(538, 196, 650, 170, E(u, 1.6, 2.0), MUT);
      card(860, 160, 140, 84, { rx: 8, text: 'id: "1"\nname: "Kim"\nrole: "USER"', mono: true, fs: 13.5, stroke: GOOD, color: INK, s: pop(u, 2.1) });
      mono(700, 250, 'findById(payload.sub)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0), 'text-anchor': 'middle' }); return; }
    if (k === 4) { mono(150, 320, 'eyJhbGci.eyJzdWIi.XXXX', { 'font-size': 18, 'font-weight': 700, fill: BAD });
      cross(400, 314, 12, pop(u, 0.4)); mono(424, 320, '만료·위변조 → jwt.verify가 throw', { 'font-size': 14, fill: BAD, opacity: fade(u, 0.5) });
      pill(760, 160, 'catch → user = null', WARN, pop(u, 1.1), { mono: true, fs: 14 }); grow(538, 196, 680, 166, E(u, 0.9, 1.3), WARN);
      person(760, 270, '게스트', { stroke: MUT, s: pop(u, 1.6) });
      note(560, 390, '예외는 삼키고 요청은 계속 간다 (401로 끊을지는 서비스 정책)', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { const rows = ['user', 'db', 'loaders: makeLoaders(db)'];
      [['요청 A', 'Kim'], ['요청 B', 'null']].forEach(([nm, us], j) => { const x = 250 + j * 420, y = 210, sc = pop(u, 0.2 + j * 1.0);
        card(x, y, 330, 170, { rx: 12, stroke: j ? MUT : ACC, sw: 2.2, s: sc });
        tx(x - 150, y - 60, `ctx (${nm})`, { 'font-size': 15, 'font-weight': 800, fill: j ? MUT : ACC, opacity: sc });
        rows.forEach((r, i) => { const op = fade(u, 0.5 + j * 1.0 + i * 0.25); mono(x - 140, y - 20 + i * 36, r === 'user' ? `user: ${us}` : r, { 'font-size': 15, opacity: op }); });
        R.cells(x + 70, y + 44, ['', '', ''], { w: 26, h: 20, gap: 4, style: () => ({ stroke: j ? MUT : ACC, op: fade(u, 1.0 + j * 1.0) }) }); });
      note(480, 380, 'loaders를 요청마다 새로 만들어야 캐시가 사용자끼리 섞이지 않는다', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    // k6 resolver가 ctx.user를 읽는다
    card(150, 200, 200, 120, { rx: 12, stroke: ACC, sw: 2.2, text: 'ctx\nuser · db · loaders', fs: 15 });
    [['Query.me', 'ctx.user'], ['Query.posts', 'ctx.db'], ['Post.author', 'ctx.loaders']].forEach(([n, r], i) => { const y = 110 + i * 90, a = 0.2 + i * 0.3;
      grow(250, 200, 360, y, E(u, a, a + 0.4), ACC); card(450, y, 170, 50, { rx: 8, text: n, mono: true, fs: 15, s: pop(u, a + 0.3) });
      mono(450, y + 42, `(_, _a, ctx) → ${r}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, a + 0.4) }); });
    code(600, 80, ['{ "data": { "me":', '  { "id": "1", "name": "Kim" } } }'], fade(u, 1.3) * 2, { title: 'Kim이 보낸 { me { id name } }' });
    code(600, 230, ['{ "data": { "me": null } }'], fade(u, 1.9), { title: '토큰 없음 → 게스트', tcol: WARN });
    sub(760, 330, '토큰이 틀렸을 때 401로 끊을지 null로 둘지만 정하면 된다', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 2. resolver 가드 ----------
  const GUARD = [['me', 'requireUser'], ['adminStats', 'requireAdmin'], ['createPost', 'requireUser'], ['deletePost', 'requireUser + 소유자']];
  function guardRows(n, hot) { GUARD.slice(0, n).forEach(([f, g], i) => { const y = 92 + i * 64, h = hot === i;
      card(190, y, 300, 48, { rx: 8, stroke: h ? ACC : GRID, sw: h ? 2.6 : 1.6, fill: h ? ACCBG : PANEL });
      mono(54, y + 5, f, { 'font-size': 15, 'font-weight': 700 }); pill(270, y, g, i === 1 ? BAD : WARN, 1, { fs: 13.5, mono: true }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { [['requireUser(ctx)', 'ctx.user가 있나?', 'UNAUTHENTICATED', WARN, 130], ['requireAdmin(ctx)', 'role === "ADMIN"인가?', 'FORBIDDEN', BAD, 290]].forEach(([n, q, code_, col, y], i) => {
        const a = 0.2 + i * 0.9; card(250, y, 280, 80, { rx: 12, stroke: INK, sw: 2.2, s: pop(u, a) });
        mono(250, y - 8, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, a) }); sub(250, y + 20, q, fade(u, a + 0.2), { 'font-size': 14.5, fill: INK });
        grow(390, y, 600, y, E(u, a + 0.4, a + 0.8), col); tx(495, y - 10, '아니면 throw', { 'font-size': 13.5, fill: col, 'text-anchor': 'middle', opacity: fade(u, a + 0.6) });
        pill(720, y, code_, col, pop(u, a + 0.8), { mono: true, fs: 14.5 }); });
      grow(250, 170, 250, 250, E(u, 1.0, 1.3), MUT); sub(320, 214, '먼저 로그인 확인', fade(u, 1.2));
      note(480, 392, 'extensions.code가 있어야 클라이언트가 401과 403을 가른다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k <= 4) { pill(190, 36, k === 4 ? '보낸 사람 3명' : 'ctx.user = Kim (USER, id "1")', INFO, 1, { fs: 14 }); guardRows(k === 1 ? 2 : k === 2 ? 3 : 4, k === 1 ? null : k === 2 ? 2 : 3); }
    if (k === 1) { [[0, GOOD, '{ "me": { "id": "1" } }', 0.3], [1, BAD, 'FORBIDDEN', 1.2]].forEach(([i, col, s, a]) => { const y = 92 + i * 64;
        dot([[360, y], [560, y]], seg(u, a, a + 0.6), col, 7); if (col === GOOD) check(586, y, 11, pop(u, a + 0.6)); else cross(586, y, 11, pop(u, a + 0.6));
        mono(610, y + 5, s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, a + 0.6) }); });
      note(560, 300, 'adminStats는 집계를 계산하기 전에 막힌다', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 2) { code(420, 210, ['{ "title": "hello",', '  "authorId": "9" }'], 2, { title: '클라이언트가 보낸 input' });
      const y2 = 251; el('line', { x1: 448, y1: y2 - 5, x2: 600, y2: y2 - 5, stroke: BAD, 'stroke-width': 2.5, opacity: E(u, 0.6, 1.0) }); cross(630, y2 - 6, 9, pop(u, 0.9));
      grow(560, 300, 640, 340, E(u, 1.2, 1.6), GOOD); code(600, 330, [['authorId: u.id  → "1"', GOOD]], 1, { op: fade(u, 1.5) });
      note(420, 404, '소유자 필드는 입력으로 받지 않고 서버가 ctx.user로 채운다', fade(u, 2.1), { fill: INK }); return; }
    if (k === 3) { const y = 284; dot([[360, y], [470, y]], seg(u, 0.2, 0.6), ACC, 7);
      dbIcon(530, 150, 'db.posts', { s: pop(u, 0.5) }); grow(470, y, 520, 214, E(u, 0.6, 0.9), MUT);
      mono(600, 120, 'findById("10")', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      code(600, 140, ['{ "id": "10",', '  "authorId": "1" }'], fade(u, 1.1) * 2, { title: '' });
      grow(470, 300, 600, 360, E(u, 1.6, 2.0), BAD); pill(700, 370, 'post 없음 → NOT_FOUND', BAD, pop(u, 2.0), { fs: 14 }); return; }
    if (k === 4) { [['Kim', 'USER', 'id "1" = authorId "1"', true], ['Lee', 'USER', 'id "2" ≠ "1", ADMIN 아님', false], ['Adm', 'ADMIN', 'role ADMIN', true]].forEach(([n, r, why, ok], i) => {
        const y = 92 + i * 92, x = 600, a = 0.3 + i * 0.6; person(x - 120 + 120, y + 6, null, { s: 0.6 * pop(u, a), stroke: ok ? GOOD : BAD });
        tx(x + 30, y, `${n} (${r})`, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); tx(x + 30, y + 22, why, { 'font-size': 13.5, fill: MUT, opacity: fade(u, a) });
        pill(x + 270, y + 6, ok ? '삭제 → true' : 'FORBIDDEN', ok ? GOOD : BAD, pop(u, a + 0.4), { fs: 13.5 }); });
      note(480, 400, '역할만 보지 않고 "내 글인가"를 함께 본다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { pill(160, 60, 'HTTP 200', GOOD, pop(u, 0.2), { mono: true, fs: 16 });
      const L = ['{', '  "errors": [{', '    "message": "Forbidden",', '    "path": ["deletePost"],', '    "extensions": { "code": "FORBIDDEN" }', '  }],', '  "data": { "deletePost": null }', '}'];
      code(80, 96, L, E(u, 0.3, 1.8) * L.length, { title: 'Lee가 mutation { deletePost(id: "10") }을 보냈을 때 (실행 결과)', fs: 14.5 });
      pill(760, 196, 'code로 분기', ACC, pop(u, 2.0), { fs: 14 }); pill(760, 290, '막힌 필드만 null', ACC, pop(u, 2.3), { fs: 14 }); return; }
    // k6 한계: 하나 빠뜨리면 구멍
    const F = ['me', 'adminStats', 'createPost', 'deletePost', 'updatePost', 'banUser', 'exportOrders', 'refund'];
    F.forEach((f, i) => { const x = 140 + (i % 4) * 230, y = 140 + Math.floor(i / 4) * 120, miss = f === 'updatePost', a = 0.2 + i * 0.15;
      card(x, y, 200, 70, { rx: 10, stroke: miss ? BAD : GRID, sw: miss ? 3 : 1.6, fill: miss ? BADBG : PANEL, s: pop(u, a) });
      mono(x, y - 6, f, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, a) });
      tx(x, y + 20, miss ? '가드 호출 빠짐' : 'require…(ctx)', { 'font-size': 13.5, fill: miss ? BAD : MUT, 'text-anchor': 'middle', opacity: fade(u, a + 0.1) }); });
    note(480, 340, 'resolver 마다 직접 부르니 하나만 빠져도 누구나 호출한다', fade(u, 1.8), { 'text-anchor': 'middle', fill: BAD });
    sub(480, 372, '정책이 코드 곳곳에 흩어져 한눈에 검토할 수 없다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 3. field-level ----------
  const USERS = [['"1"', 'Kim', 'kim@x.io', '010-…'], ['"2"', 'Lee', 'lee@x.io', '010-…'], ['"9"', 'Adm', 'adm@x.io', '010-…']];
  function utable(o) { const x = 560, y = 70, cw = [60, 70, 120, 96]; o = o || {};
    el('rect', { x: x - 12, y: y - 28, width: 372, height: 162, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    if (o.hi != null) el('rect', { x: x - 6, y: y + 11 + o.hi * 36, width: 360, height: 28, rx: 6, fill: GOODBG, opacity: o.hiop ?? 1 });
    ['id', 'name', 'email', 'phone'].forEach((h, j) => tx(x + cw.slice(0, j).reduce((a, b) => a + b, 0), y - 6, h, { 'font-size': 13.5, 'font-weight': 700, fill: j >= 2 ? ACC : MUT }));
    USERS.forEach((r, i) => { const yy = y + 30 + i * 36; r.forEach((v, j) => { const xx = x + cw.slice(0, j).reduce((a, b) => a + b, 0);
      let s = v, col = INK, op = 1; if (j === 2) { const st = o.email ? o.email(i) : 'hide'; if (st === 'hide') { s = '·····'; col = OFF; } else if (st === 'null') { s = 'null'; col = MUT; } else col = GOOD; op = o.eop ? o.eop(i) : 1; }
      if (j === 3) { const st = o.phone ? o.phone(i) : 'hide'; if (st === 'hide') { s = '·····'; col = OFF; } else if (st === 'null') { s = 'null'; col = MUT; } else col = GOOD; }
      mono(xx, yy, s, { 'font-size': 14.5, fill: col, 'font-weight': j === 1 ? 700 : 500, opacity: op }); }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 3) utable({ email: (i) => (k === 0 ? 'hide' : k === 1 ? (i === 0 ? (u > 1.3 ? 'show' : 'hide') : 'hide') : (i === 0 ? 'show' : 'null')),
      phone: (i) => (k < 3 ? 'hide' : u < 1.0 + i * 0.3 ? 'hide' : i === 0 ? 'show' : 'null'), eop: (i) => (k === 2 && i > 0 ? fade(u, 0.3 + i * 0.3) : 1), hi: k === 1 ? 0 : null, hiop: fade(u, 1.1) });
    if (k === 0) { [['me', 110], ['user(id: "2")', 200], ['Post.author', 290]].forEach(([p, y], i) => { const a = 0.2 + i * 0.35;
        pill(110, y, p, INFO, pop(u, a), { mono: true, fs: 14.5 }); grow(190, y, 330, 200, E(u, a + 0.3, a + 0.8), INFO); });
      card(410, 200, 150, 54, { rx: 10, stroke: ACC, sw: 2.6, fill: ACCBG, text: 'User.email', mono: true, fs: 16, color: ACC, s: pop(u, 1.4) });
      grow(486, 186, 544, 150, E(u, 1.8, 2.2), ACC);
      note(410, 300, '어느 경로로 와도 이 함수를 지난다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k <= 2) { pill(150, 60, 'ctx.user = Kim', INFO, 1, { fs: 14.5 });
      code(40, 110, ['if (ctx.user?.id === parent.id)', '  return parent.email;', 'if (ctx.user?.role === "ADMIN")', '  return parent.email;', 'return null;'], k === 1 ? E(u, 0.2, 1.2) * 5 : 5, { fs: 14 }); }
    if (k === 1) { note(560, 280, 'parent = 지금 그리는 User 행', fade(u, 1.6)); note(560, 306, 'parent.id "1" = ctx.user.id "1" → 값을 준다', fade(u, 2.0), { fill: GOOD }); return; }
    if (k === 2) { code(560, 250, ['[{ "name": "Kim", "email": "kim@x.io" },', ' { "name": "Lee", "email": null },', ' { "name": "Adm", "email": null }]'], E(u, 1.0, 2.2) * 3, { title: '응답 users (실행 결과)', fs: 13.5 });
      note(40, 300, '목록 전체는 실패하지 않고 email 칸만 빈다', fade(u, 2.2)); return; }
    if (k === 3) { code(40, 110, ['phone: (parent, _a, ctx) =>', '  ctx.user?.id === parent.id ||', '  ctx.user?.role === "ADMIN"', '    ? parent.phone : null'], E(u, 0.2, 1.0) * 4, { fs: 14 });
      note(40, 280, '민감 필드마다 같은 조건', fade(u, 1.6)); note(40, 306, '반복되면 헬퍼로 뽑는다', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 4) { [['return null', ['"email": null'], '조용히 숨긴다', 0.2], ['throw GraphQLError', ['"email": null', 'errors: [{ "message": "Forbidden",', '  "path": ["users", 1, "email"] }]'], '거부를 알린다', 1.0]].forEach(([h, L, why, a], i) => {
        const x = 60 + i * 450; pill(x + 90, 70, h, i ? BAD : MUT, pop(u, a), { mono: true, fs: 15 });
        code(x, 110, L, fade(u, a + 0.3) * L.length, { fs: 14 }); note(x, 250, why, fade(u, a + 0.6), { fill: i ? BAD : MUT }); });
      note(480, 330, '존재 자체를 숨겨야 하면 null이 안전하다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { const sw = E(u, 0.9, 1.3);
      code(60, 70, ['type User {', '  id:    ID!', '  name:  String!', sw < 0.5 ? '  email: String      # nullable' : ['  email: String!     # non-null', BAD], '}'], 5, { fs: 14.5, w: 360 });
      if (sw < 0.5) { check(450, 152, 11, pop(u, 0.3)); note(470, 158, 'null을 돌려줄 수 있다', fade(u, 0.3), { fill: GOOD }); }
      else { code(470, 70, [['"Cannot return null for non-nullable', BAD], ['  field User.email."', BAD], '"path": ["users", 1, "email"]'], E(u, 1.3, 1.9) * 3, { fs: 13.5 });
        card(640, 270, 260, 60, { rx: 10, stroke: BAD, sw: 2.6, fill: BADBG, text: '"data": null', mono: true, fs: 18, color: BAD, s: pop(u, 2.0) });
        note(60, 300, 'users가 [User!]!라 null이 맨 위까지 번진다', fade(u, 2.2), { fill: BAD }); } return; }
    // k6 깊은 경로
    const N = [['PostCard', 90, 120], ['post', 250, 120], ['author', 410, 120], ['me', 250, 280], ['email', 600, 200]];
    N.forEach(([n, x, y], i) => card(x, y, 120, 46, { rx: 8, text: n, mono: true, fs: 15, stroke: n === 'email' ? ACC : INK, color: n === 'email' ? ACC : INK, s: pop(u, 0.2 + i * 0.25) }));
    grow(150, 120, 190, 120, E(u, 0.5, 0.8), MUT); grow(310, 120, 350, 120, E(u, 0.8, 1.1), MUT); grow(470, 130, 540, 186, E(u, 1.1, 1.4), MUT); grow(310, 270, 540, 214, E(u, 1.3, 1.6), MUT);
    lock(600, 152, true, ACC, pop(u, 1.6)); dot([[150, 120], [470, 130], [540, 186]], seg(u, 1.7, 2.5), ACC, 6);
    note(700, 206, '같은 User.email resolver', fade(u, 1.8), { fill: ACC });
    note(480, 370, '경로가 몇 단계든 필드에서 막으니 새는 길이 없다', fade(u, 2.2), { 'text-anchor': 'middle' }); }

  // ---------- 4. @auth directive ----------
  const SDL = ['directive @auth(requires: Role!)', '  on FIELD_DEFINITION | OBJECT', 'enum Role { ADMIN USER GUEST }', 'type Query {', '  adminStats: AdminStats @auth(requires: ADMIN)', '  me: User', '}', 'type AdminStats @auth(requires: ADMIN) {', '  activeUsers: Int!', '  revenue:     Int!', '}'];
  function sdl(k, u) { const n = k === 0 ? E(u, 0.2, 1.4) * 3 : k === 1 ? 3 + E(u, 0.2, 1.0) * 4 : k === 2 ? 7 + E(u, 0.2, 1.0) * 4 : 11;
    const L = SDL.map((s, i) => (i < n ? s : '')); code(24, 26, L, Math.min(11, n), { fs: 13.5, lh: 30, w: 420, title: 'typeDefs' });
    const Y = (i) => 26 + 8 + 13.5 + i * 30 - 5;
    if (k >= 1) lock(430, Y(4), true, ACC, k === 1 ? pop(u, 1.2) : 1);
    if (k >= 2) [8, 9].forEach((i, j) => lock(430, Y(i), true, ACC, k === 2 ? pop(u, 1.3 + j * 0.3) : 1));
    if (k >= 2) lock(430, Y(7), true, ACC, k === 2 ? pop(u, 0.9) : 1);
    return Y; }
  const FIELDS = [['Query.adminStats', '필드 @auth', 4], ['Query.me', '없음 → 그대로', 5], ['AdminStats.activeUsers', '타입 @auth', 8], ['AdminStats.revenue', '타입 @auth', 9]];
  function s4(t, c) { const { k, u } = c; const Y = sdl(k, u);
    if (k === 0) { note(500, 120, 'directive 선언만으로는 아무 일도 안 한다', fade(u, 1.6)); note(500, 150, '동작은 아래에서 붙인다', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 1) { note(500, Y(4) + 5, '← 이 필드만 ADMIN', fade(u, 1.4), { fill: ACC }); note(500, Y(5) + 5, '← me는 그대로 열림', fade(u, 1.8), { fill: MUT });
      sub(700, 330, '스키마만 읽어도 권한 정책이 보인다', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { grow(456, Y(7), 456, Y(9), E(u, 0.9, 1.6), ACC, { plain: true }); note(500, Y(8) + 5, '← 타입에 붙이면 안의 필드가 모두 물려받는다', fade(u, 1.8), { fill: ACC }); return; }
    const sx = 500;
    tx(sx, 40, 'mapSchema · OBJECT_FIELD 방문', { 'font-size': 15, 'font-weight': 800, opacity: k === 3 ? fade(u, 0.2) : 1 });
    if (k <= 4) FIELDS.forEach(([f, why, li], i) => { const y = 82 + i * 56, vis = k === 3 ? E(u, 0.3 + i * 0.45, 0.6 + i * 0.45) : 1, picked = k === 4 && li !== 5;
        card(sx + 150, y, 300, 42, { rx: 8, stroke: picked ? ACC : GRID, sw: picked ? 2.6 : 1.6, fill: picked ? ACCBG : PANEL, op: vis });
        mono(sx + 14, y + 5, f, { 'font-size': 14.5, 'font-weight': 700, opacity: vis });
        if (k === 4) tx(sx + 310, y + 5, why, { 'font-size': 13.5, fill: li === 5 ? MUT : ACC, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.3) }); });
    if (k === 3) { const i = Math.min(3, Math.floor(E(u, 0.3, 2.1) * 4)); el('circle', { cx: sx - 10, cy: 82 + i * 56, r: 7, fill: ACC });
      sub(sx + 150, 330, '모든 오브젝트 필드를 한 번씩 훑는다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 4) { note(sx, 330, '필드 directive를 먼저, 없으면 타입 directive', fade(u, 1.6)); note(sx, 358, '감싼 필드 3개 (실행해서 확인)', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 5) { const g = E(u, 0.2, 1.2);
      el('rect', { x: sx + 10, y: 90, width: 400, height: 210, rx: 14, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: g });
      tx(sx + 26, 116, 'fieldConfig.resolve = async (p, a, ctx, info) =>', { 'font-size': 13.5, class: 'mono', fill: ACC, opacity: g });
      ['ctx.user 없음 → UNAUTHENTICATED', 'hasRole 아님 → FORBIDDEN'].forEach((s, i) => mono(sx + 30, 150 + i * 30, s, { 'font-size': 14, fill: i ? BAD : WARN, opacity: fade(u, 0.8 + i * 0.3) }));
      card(sx + 210, 254, 300, 52, { rx: 10, stroke: INK, sw: 2.2, text: 'original(p, a, ctx, info)', mono: true, fs: 15, s: pop(u, 1.5) });
      sub(sx + 210, 334, 'resolver가 없던 필드는 p[info.fieldName]을 원본으로', fade(u, 2.0), { 'font-size': 14 }); return; }
    code(sx, 70, ['{', '  "errors": [{ "message": "Forbidden",', '    "path": ["adminStats"],', '    "extensions": { "code": "FORBIDDEN" } }],', '  "data": { "adminStats": null,', '           "me": { "id": "1" } }', '}'], E(u, 0.3, 1.8) * 7, { fs: 13.5, title: 'USER가 { adminStats { activeUsers } me { id } } (실행 결과)' });
    note(sx, 330, '정책은 스키마 한 곳, resolver의 require는 사라졌다', fade(u, 2.2)); }

  // ---------- 5. graphql-shield ----------
  const RULES = [['isAuthenticated', 'ctx.user'], ['isAdmin', 'ctx.user.role'], ['isSelf', 'parent.id (User 행)'], ['isPostOwner', 'args.id → db.posts']];
  const TREE = [['Query', [['me', 'isAuthenticated'], ['adminStats', 'isAdmin'], ['posts', 'allow']]], ['Mutation', [['createPost', 'isAuthenticated'], ['deletePost', 'or(isAdmin, isPostOwner)']]], ['User', [['email', 'or(isAdmin, isSelf)'], ['phone', 'or(isAdmin, isSelf)']]]];
  function tree(k, u) { let row = 0; const shownT = Math.min(k - 2, 2);
    mono(30, 40, 'shield({', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    TREE.forEach(([tname, leaves], ti) => { if (ti > shownT) return; const y0 = 70 + row * 40, cur = ti === k - 2;
      card(110, y0 + ((leaves.length - 1) * 40) / 2, 110, 40, { rx: 8, text: tname, mono: true, fs: 15, stroke: cur ? ACC : INK, color: cur ? ACC : INK, s: cur && k <= 4 ? pop(u, 0.2) : 1 });
      leaves.forEach(([f, r], li) => { const y = 70 + row * 40, a = 0.4 + li * 0.35, vis = cur && k <= 4 ? fade(u, a) : 1;
        grow(165, y0 + ((leaves.length - 1) * 40) / 2, 230, y, cur && k <= 4 ? E(u, a - 0.2, a) : 1, GRID, { plain: true });
        mono(240, y + 5, f, { 'font-size': 14.5, 'font-weight': 700, opacity: vis });
        pill(470, y, r, r === 'allow' ? GOOD : ACC, cur && k <= 4 ? pop(u, a + 0.2) : 1, { mono: true, fs: 13.5 }); row++; }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { RULES.forEach(([n, r], i) => { const x = 250 + (i % 2) * 460, y = 130 + Math.floor(i / 2) * 140, a = 0.2 + i * 0.4;
        card(x, y, 380, 96, { rx: 12, stroke: ACC, sw: 2.2, s: pop(u, a) }); mono(x, y - 10, `${n} = rule()(…)`, { 'font-size': 15.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, a) });
        tx(x, y + 22, `보는 것 · ${r}`, { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, a + 0.2) }); });
      note(480, 380, '작은 규칙을 만들고 and · or로 조합한다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { [['원래 코드', 'parent.authorId === ctx.user?.id', 'undefined === undefined → true', ['"kim@x.io"', '"lee@x.io"', '"adm@x.io"'], BAD],
        ['고친 코드', '!!ctx.user && parent.id === ctx.user.id', 'false (로그인 안 함)', ['null', 'null', 'null'], GOOD]].forEach(([h, rule_, why, vals, col], i) => {
        const x = 40 + i * 460, a = 0.2 + i * 1.0; tx(x, 50, h, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, a) });
        code(x, 64, [rule_], fade(u, a), { fs: 14 }); mono(x, 140, why, { 'font-size': 14, fill: col, opacity: fade(u, a + 0.3) });
        tx(x, 184, '게스트가 { users { email } }', { 'font-size': 13.5, fill: MUT, opacity: fade(u, a + 0.4) });
        vals.forEach((v, j) => card(x + 80, 222 + j * 44, 160, 36, { rx: 6, text: v, mono: true, fs: 14.5, stroke: col, color: col, fill: i ? PANEL : BADBG, s: pop(u, a + 0.5 + j * 0.15) })); });
      note(480, 400, 'User 필드의 parent는 User 행이라 authorId가 없다 (실행해서 확인)', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    if (k <= 5) tree(k, u);
    if (k === 2) { note(640, 110, '스키마와 같은 모양의 객체에 규칙을 적는다', fade(u, 1.6)); note(640, 140, 'posts는 allow로 게스트에게 연다', fade(u, 2.0), { fill: GOOD }); return; }
    if (k === 3) { note(660, 240, 'Step 2의 if 여러 줄이', fade(u, 1.4), { fill: MUT }); note(660, 266, 'or() 한 줄이 됐다', fade(u, 1.8), { fill: ACC }); return; }
    if (k === 4) { note(660, 330, 'resolver 코드는 손대지 않는다', fade(u, 1.6), { fill: MUT }); return; }
    if (k === 5) { const y = 360; mono(240, y + 5, 'secret', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
      pill(470, y, 'fallbackRule: deny', BAD, pop(u, 0.6), { mono: true, fs: 13.5 });
      code(620, 300, ['"message": "Forbidden",', '"extensions":', '  { "code": "FORBIDDEN" }'], E(u, 1.0, 1.8) * 3, { fs: 13.5, title: '적지 않은 필드 (실행 결과)' });
      sub(760, 410, 'fallbackError를 문자열로 주면 code가 INTERNAL_SERVER_ERROR', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    if (k === 6) { [['context + resolver', '작은 팀'], ['field-level + @auth', '권한이 늘 때'], ['graphql-shield', '정책이 복잡할 때'], ['shield + OPA', '회사 전체 통일']].forEach(([a, b], i) => {
        const x = 60 + i * 215, y = 330 - i * 70, s = pop(u, 0.2 + i * 0.4);
        el('rect', { x, y, width: 200, height: 400 - y - 10, rx: 8, fill: i === 3 ? ACCBG : SOFT, stroke: i === 3 ? ACC : GRID, 'stroke-width': 1.6, opacity: s });
        tx(x + 12, y + 28, a, { 'font-size': 15, 'font-weight': 800, opacity: s, fill: i === 3 ? ACC : INK }); tx(x + 12, y + 52, b, { 'font-size': 13.5, fill: MUT, opacity: s }); });
      note(40, 60, '반복이 아플 때 한 계단씩 올라간다', fade(u, 2.0)); return; }
    // k7 federation
    card(160, 200, 180, 90, { rx: 12, stroke: INK, sw: 2.4, text: 'Router\n인증 (JWT)', fs: 16, s: pop(u, 0.2) });
    [['users subgraph', 'User.email 규칙', 120, true], ['posts subgraph', 'Post 규칙', 290, false]].forEach(([n, r, y, hot], i) => { const a = 0.7 + i * 0.5;
      grow(250, 200, 520, y, E(u, a - 0.3, a), MUT); card(620, y, 210, 80, { rx: 12, stroke: hot ? ACC : INK, sw: 2.2, s: pop(u, a) });
      tx(620, y - 8, n, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, a) });
      tx(620, y + 18, r, { 'font-size': 14, 'text-anchor': 'middle', fill: hot ? ACC : MUT, opacity: fade(u, a) }); });
    note(480, 380, '필드 권한은 그 entity를 가진 subgraph에 둔다', fade(u, 2.0), { 'text-anchor': 'middle' }); }

  const quiz = [
    { q: 'Apollo Server의 context 함수가 돌려준 객체는 어디로 가는가?',
      o: ['서버가 켜질 때 한 번 만들어 모든 요청이 같이 쓴다', '그 요청에서 실행되는 모든 resolver의 세 번째 인자 ctx가 된다', 'Query 타입의 resolver 에게만 전달된다'], a: 1,
      why: 'context는 요청마다 호출되고 반환값이 그 요청의 resolver 전부에 ctx로 간다. 그래서 JWT 검증을 한 번만 하면 된다.' },
    { q: 'createPost에서 authorId를 클라이언트 input이 아니라 ctx.user에서 채우는 이유는 무엇인가?',
      o: ['input에 authorId를 "9"로 넣어 남의 이름으로 쓰는 위조를 막으려고', 'input이 길어지면 요청이 느려져서', 'GraphQL은 input에 ID를 넣을 수 없어서'], a: 0,
      why: '소유자 필드를 입력으로 받으면 누구든 작성자를 바꿔 보낼 수 있다. 가드가 돌려준 user의 id를 서버가 넣는다.' },
    { q: 'User.email을 권한 없을 때 null로 감추려면 스키마는 어때야 하는가?',
      o: ['email: String!으로 non-null 이어야 한다', 'email: String으로 nullable 이어야 한다', '스키마와 상관없이 null을 돌려줄 수 있다'], a: 1,
      why: 'String!에 null을 주면 "Cannot return null for non-nullable field User.email." 에러가 나고, users가 [User!]!라 data 전체가 null이 된다.' },
    { q: '@auth directive를 스키마에 선언만 하고 mapSchema 처리를 빼면 어떻게 되는가?',
      o: ['아무 검사도 일어나지 않는다', 'Apollo Server가 알아서 ADMIN을 검사한다', '스키마 빌드가 실패한다'], a: 0,
      why: 'directive는 표시일 뿐이다. mapSchema로 필드를 훑으며 resolver를 감싸야 실제로 막힌다.' },
    { q: 'shield 규칙 isOwner를 parent.authorId === ctx.user?.id로 써서 User.email에 걸었다. 게스트가 users의 email을 읽으면 어떻게 되는가?',
      o: ['email이 모두 null로 나온다', '모든 email이 그대로 나온다', '요청 전체가 FORBIDDEN으로 실패한다'], a: 1,
      why: 'User 행에는 authorId가 없고 게스트의 ctx.user?.id도 undefined라 undefined === undefined가 true다. 실행해 보면 email 3개가 모두 나온다.' },
  ];
  const summary = [
    '인증은 context 함수에서 JWT를 한 번 검증해 ctx.user에 담고, resolver는 그 값을 읽기만 한다.',
    'resolver마다 가드를 부르는 방식은 쉽지만 하나만 빠뜨려도 그 필드가 누구에게나 열린다.',
    'User.email처럼 민감한 필드는 필드 resolver에서 막아야 어느 경로로 조회해도 같은 규칙이 걸린다.',
    '@auth나 shield로 정책을 한곳에 모으고, 적지 않은 필드는 deny로 닫아 둔다.',
  ];
  const review = [
    { q: 'Post.author를 거쳐 다른 사람의 email이 응답에 보였다는 신고가 왔다. Query.user 에만 권한 검사가 있었다. 먼저 고칠 곳은?',
      o: ['Query.user의 검사를 더 엄격하게', 'User.email 필드 resolver에 본인·ADMIN 검사', '프론트엔드에서 email 칸을 숨기기'], a: 1,
      why: '쿼리 단위 검사는 다른 경로로 들어오면 새어 나간다. 필드 resolver는 어떤 경로든 반드시 지나가므로 거기서 막는다.' },
    { q: 'shield를 적용한 뒤 새 필드 Query.exportOrders를 추가하고 규칙을 깜빡했다. fallbackRule: deny가 있으면 어떻게 되는가?',
      o: ['누구나 호출할 수 있다', 'ADMIN만 호출할 수 있다', 'Forbidden 에러로 막힌다'], a: 2,
      why: '적지 않은 필드는 fallbackRule이 정한다. deny를 기본값으로 두면 새 필드가 실수로 열리지 않는다.' },
    { q: '권한 없는 사용자가 deletePost를 보냈는데 앱이 "알 수 없는 오류"를 띄운다. 응답의 extensions.code가 INTERNAL_SERVER_ERROR 였다. 먼저 의심할 것은?',
      o: ['GraphQLError가 아니라 문자열이나 일반 Error로 거부해 code가 안 붙었다', 'HTTP 상태 코드가 200이라서', 'deletePost가 Boolean이라 null이 될 수 없어서'], a: 0,
      why: 'GraphQL은 거부도 HTTP 200으로 보내고 code로 구분한다. shield의 fallbackError를 문자열로 주면 INTERNAL_SERVER_ERROR로 나가니 GraphQLError에 FORBIDDEN을 붙인다.' },
  ];

  R.page({ title: '인증 · 인가 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
