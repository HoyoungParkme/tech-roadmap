/* IV-1-1 Express 시작 — 라우팅의 기본. 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 응답 값(헤더·본문·404 문구·"Cannot set headers…"·id="me")은 express 5.3.0 / 4.22.3 + node 24 로 직접 돌려 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const MC = { GET: GOOD, POST: INFO, PUT: WARN, PATCH: ACC, DELETE: BAD };
  const mcol = (m) => MC[m] || INK;
  // 메서드 배지 (왼쪽 기준). 돌려주는 값 = 배지 폭
  function badge(x, y, m, o) { o = o || {}; const w = tw(m, 13.5) + 16;
    card(x + w / 2, y, w, 24, { rx: 5, text: m, fs: 13.5, fw: 800, mono: true, stroke: mcol(m), color: mcol(m), fill: PANEL, sw: 1.8, s: o.s, op: o.op }); return w; }
  // 요청 알약: 메서드 + 경로
  function reqTok(cx, cy, m, path, s, op) { const t = `${m} ${path}`; card(cx, cy, tw(t, 14) + 26, 30, { rx: 15, text: t, fs: 14, fw: 700, mono: true, stroke: mcol(m), color: mcol(m), fill: PANEL, sw: 2, s, op }); }
  // 응답 봉투: 상태줄 + 헤더/본문 줄. o.n 줄까지 보임(소수면 마지막 줄 서서히)
  function envelope(x, y, w, status, rows, o) { o = o || {}; const op = o.op ?? 1, n = o.n ?? rows.length, h = 40 + rows.length * 24;
    const col = status >= 500 ? BAD : status >= 400 ? WARN : GOOD;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: op });
    el('rect', { x, y, width: w, height: 32, rx: 10, fill: status >= 400 ? WARNBG : GOODBG, opacity: op });
    mono(x + 14, y + 22, `HTTP ${status}${o.reason ? ' ' + o.reason : ''}`, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op });
    rows.forEach((r, i) => { const a = clamp(n - i); if (a <= 0) return; const [s, cl] = Array.isArray(r) ? r : [r, INK];
      mono(x + 14, y + 56 + i * 24, s, { 'font-size': 14, fill: cl, opacity: op * a }); }); }

  // ---------- 1. http 위의 라우팅 계층 ----------
  const L = { x: 40, w: 400 };
  function slab(y, h, name, role, col, o) { o = o || {}; const g = R.G(0, o.dy || 0, 1, o.op ?? 1);
    el('rect', { x: L.x, y, width: L.w, height: h, rx: 10, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2 }, g);
    tx(L.x + 16, y + 24, name, { 'font-size': 16, 'font-weight': 800, fill: col }, g);
    tx(L.x + 16, y + h - 12, role, { 'font-size': 13.5, fill: MUT }, g); }
  function routeTable(x, y, rows, o) { o = o || {}; const w = 400;
    zone(x, y, w, 46 + Math.max(1, rows.length) * 36, null, { fill: SOFT });
    tx(x + 14, y + 24, '라우팅 표', { 'font-size': 15, 'font-weight': 800 });
    mono(x + w - 14, y + 24, `${o.count ?? rows.length}개`, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
    if (!rows.length) sub(x + w / 2, y + 64, '등록된 라우트 없음', 1, { 'font-size': 14 });
    rows.forEach(([m, p, h, ro], i) => { ro = ro || {}; const yy = y + 62 + i * 36, a = ro.a ?? 1; if (a <= 0) return;
      if (ro.hot) el('rect', { x: x + 6, y: yy - 15, width: w - 12, height: 30, rx: 6, fill: ACCBG, opacity: ro.hot });
      const bw = badge(x + 14, yy, m, { op: a }); mono(x + 24 + bw, yy + 5, p, { 'font-size': 15, 'font-weight': 700, opacity: a });
      mono(x + 110 + bw, yy + 5, '→ ' + h, { 'font-size': 14, fill: MUT, opacity: a }); }); }
  function s1(t, c) { const { k, u } = c;
    // 아래 두 층은 처음부터, Express 층은 k1 에 위에서 내려앉는다
    slab(330, 64, 'OS 네트워크 (TCP)', '포트로 들어온 바이트를 넘긴다', MUT, { op: k === 0 ? fade(u, 0.1) : 1 });
    slab(254, 64, 'Node http 모듈', '바이트 → req / res 객체', GOOD, { op: k === 0 ? fade(u, 0.4) : 1 });
    const ex = k === 0 ? 0 : k === 1 ? E(u, 0.3, 1.2) : 1;
    if (k === 0) { card(240, 120, 150, 70, { rx: 10, text: 'express\nnode_modules', fs: 14, dash: '6 5', stroke: ACC, color: ACC, s: pop(u, 0.9) });
      mono(240, 214, 'require("express")', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      sub(240, 40, '요청을 받아 줄 층은 아직 http 하나뿐', fade(u, 2.0), { 'font-size': 14.5 }); }
    if (k >= 1) slab(178, 64, 'Express 라우팅', k === 1 ? 'app = express() · 라우트 0개' : '(메서드, 경로) → 핸들러', ACC, { dy: lerp(-70, 0, ex), op: ex, fill: ACCBG });
    if (k >= 1) routeTable(500, 40, k >= 2 ? [['GET', '/', 'handler', { a: k === 2 ? E(u, 0.4, 1.2) : 1, hot: k === 3 ? fade(u, 0.9) * (1 - fade(u, 2.4)) : 0 }]] : [],
      { count: k === 2 ? Math.round(E(u, 0.4, 1.2)) : k >= 2 ? 1 : 0 });
    if (k === 2) sub(700, 172, '등록은 선언일 뿐, 실행은 요청이 온 뒤', fade(u, 1.6), { 'font-size': 14.5, fill: INK });
    if (k === 3) { // 요청이 아래에서 위로 올라가 라우트를 찾고, 응답이 나간다
      dot([[240, 410], [240, 210], [500, 102], [520, 102]], seg(u, 0.1, 1.0), GOOD, 7);
      if (u > 0.1 && u < 1.0) reqTok(330, 410, 'GET', '/', 1, 1 - fade(u, 0.7));
      envelope(500, 170, 400, 200, [['Content-Type: text/html; charset=utf-8', MUT], ['Content-Length: 14', MUT], ['Hello Express!', INK]], { reason: 'OK', op: fade(u, 1.0), n: lerp(0, 3, E(u, 1.2, 2.4)) });
      sub(700, 300, 'res.send 가 상태·헤더·본문을 한 번에 채운다', fade(u, 2.2), { 'font-size': 14.5 }); }
    if (k === 4) { // 포트가 열리고 요청이 계속 흘러든다
      card(L.x + L.w - 60, 362, 88, 30, { rx: 15, text: ':3000', fs: 15, fw: 800, mono: true, stroke: ACC, color: PANEL, fill: ACC, s: pop(u, 0.2) });
      for (let i = 0; i < 4; i++) dot([[L.x + L.w - 60, 412], [L.x + L.w - 60, 200]], ((t * 0.7 + i / 4) % 1), ACC, 5);
      R.terminal(500, 180, 400, 132, ['$ node app.js', ['http://localhost:3000 에서 실행 중', 'var(--term)']], lerp(0, 2, E(u, 0.4, 1.6)), { title: 'app.js' });
      mono(500, 350, 'app.listen(3000)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      mono(500, 376, '= http.createServer(app).listen(3000)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); } }

  // ---------- 2. 메서드 × 경로 표 ----------
  const MS = ['GET', 'POST', 'PUT', 'DELETE'], PS = ['/users', '/users/:id'];
  const GX = 300, GW = 140, GY = 70, GH = 62;
  function grid(cellOf) {
    MS.forEach((m, j) => card(GX + j * GW + GW / 2, GY - 22, tw(m, 14) + 18, 26, { rx: 5, text: m, fs: 14, fw: 800, mono: true, stroke: mcol(m), color: mcol(m) }));
    PS.forEach((p, i) => mono(GX - 16, GY + 14 + i * GH + GH / 2, p, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }));
    PS.forEach((p, i) => MS.forEach((m, j) => { const x = GX + j * GW + 6, y = GY + 14 + i * GH + 4, st = cellOf(m, p);
      el('rect', { x, y, width: GW - 12, height: GH - 8, rx: 8, fill: st ? (st.dash ? PANEL : mcol(m)) : SOFT, 'fill-opacity': st && !st.dash ? 0.16 * (st.a ?? 1) : 1, stroke: st ? mcol(m) : GRID, 'stroke-width': st ? 2 : 1.2, 'stroke-dasharray': st && st.dash ? '5 4' : null, opacity: st ? 0.35 + 0.65 * (st.a ?? 1) : 1 });
      if (st && st.t) tx(x + (GW - 12) / 2, y + (GH - 8) / 2 + 5, st.t, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: st.dash ? MUT : INK, opacity: st.a ?? 1 }); })); }
  // 아래 줄: 요청 → 응답 한 쌍
  function exchange(m, path, body, status, out, u, o) { o = o || {}; const y = 300;
    reqTok(150, y, m, path, pop(u, 0.2));
    if (body) mono(150, y + 36, body, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    grow(240, y, 440, y, E(u, 0.6, 1.3), MUT);
    if (o.gate) { el('rect', { x: 320, y: y - 34, width: 14, height: 68, rx: 4, fill: ACC, opacity: fade(u, 0.2) }); mono(327, y + 54, 'express.json()', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.2) }); }
    const col = status >= 400 ? WARN : GOOD;
    card(500, y, 92, 34, { rx: 8, text: String(status), fs: 18, fw: 800, mono: true, stroke: col, color: col, s: pop(u, 1.3) });
    mono(560, y + 6, out, { 'font-size': 14.5, 'font-weight': 700, fill: o.outCol || INK, opacity: fade(u, 1.6) });
    if (o.note) tx(560, y + 36, o.note, { 'font-size': 14, fill: o.noteCol || MUT, opacity: fade(u, 2.0), 'font-weight': 600 }); }
  function s2(t, c) { const { k, u } = c, A = (kk) => (k === kk ? E(u, 0.2, 0.9) : k > kk ? 1 : 0);
    const reg = { 'GET /users': 1, 'POST /users': 2, 'DELETE /users/:id': 4 };
    grid((m, p) => { const at = reg[`${m} ${p}`];
      if (at != null && k >= at) return { a: A(at), t: { GET: '목록 조회', POST: '생성', DELETE: '삭제 · 204' }[m] };
      if (k === 5 && p === '/users/:id' && (m === 'GET' || m === 'PUT')) return { dash: true, a: E(u, 0.2, 0.9), t: m === 'GET' ? '단건 조회' : '전체 수정' };
      return null; });
    if (k === 0) exchange('GET', '/users', null, 404, '<pre>Cannot GET /users</pre>', u, { note: '라우트가 없으면 Express 기본 404 HTML', noteCol: WARN });
    if (k === 1) exchange('GET', '/users', null, 200, '[{"id":1,"name":"Ann"}]', u, { note: 'res.json → application/json' });
    if (k === 2) exchange('POST', '/users', '{"name":"Bob"}', 201, '{"id":2}', u, { outCol: BAD, note: 'req.body 가 undefined → name 이 빠졌다', noteCol: BAD });
    if (k === 3) exchange('POST', '/users', '{"name":"Bob"}', 201, '{"id":2,"name":"Bob"}', u, { gate: true, note: 'express.json() 이 본문을 req.body 로', noteCol: ACC });
    if (k === 4) exchange('DELETE', '/users/1', null, 204, '(본문 없음)', u, { note: 'Content-Type 헤더도 붙지 않는다' });
    if (k === 5) { banner(480, 300, '메서드 = 행동,  경로 = 대상', pop(u, 1.0)); sub(480, 350, '점선 두 칸은 코드에 아직 없는 자리 (:id 조회·수정)', fade(u, 1.6), { 'font-size': 14.5 }); } }

  // ---------- 3. params · query · body ----------
  function urlBar(m, path, q, o) { o = o || {}; const x = 40, y = 30;
    el('rect', { x, y, width: 880, height: 44, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    const parts = [[m + ' ', { fill: mcol(m), 'font-weight': 800 }], [path.base, {}], [path.var || '', { fill: ACC, 'font-weight': 800 }], [q ? '?' : '', { fill: MUT }], [q || '', { fill: INFO, 'font-weight': 800 }]];
    R.spans(x + 18, y + 29, parts, { 'font-size': 20 });
    if (o.body) mono(x + 862, y + 29, o.body, { 'font-size': 16, fill: WARN, 'font-weight': 700, 'text-anchor': 'end' }); }
  function routeList(rows, scan) { const x = 40, y = 110;
    tx(x, y, '라우터가 위에서부터 훑는다', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    rows.forEach(([m, p, ok], i) => { const yy = y + 34 + i * 40, seen = scan > i, cur = Math.floor(scan) === i;
      el('rect', { x, y: yy - 16, width: 330, height: 32, rx: 7, fill: seen && ok ? GOODBG : cur ? SOFT : PANEL, stroke: seen && ok ? GOOD : GRID, 'stroke-width': seen && ok ? 2.2 : 1.2 });
      const bw = badge(x + 10, yy, m); mono(x + 20 + bw, yy + 5, p, { 'font-size': 15, 'font-weight': 700, fill: seen && !ok ? OFF : INK });
      if (seen) (ok ? check : cross)(x + 306, yy, 8); }); }
  function reqObj(vals, o) { o = o || {}; const x = 520, y = 110, w = 400;
    zone(x, y, w, 148, 'req', { fill: SOFT });
    [['req.params', vals.params, ACC], ['req.query', vals.query, INFO], ['req.body', vals.body, WARN]].forEach(([n, v, col], i) => { const yy = y + 52 + i * 34;
      mono(x + 18, yy, n, { 'font-size': 15, 'font-weight': 800, fill: col });
      if (v != null) mono(x + 140, yy, v, { 'font-size': 15, 'font-weight': 700, opacity: o.op ? o.op(i) : 1 }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1 || k === 5) urlBar('GET', { base: '/users/', var: '42' }, 'fields=name');
    if (k === 2 || k === 3) urlBar('GET', { base: '/users/', var: k === 2 && u < 0.6 ? '42' : '999' }, 'fields=name');
    if (k === 4) urlBar('POST', { base: '/users' }, null, { body: '{"name":"Ann"}' });
    const rows = k === 4 ? [['GET', '/users/:id', false], ['POST', '/users', true]] : [['POST', '/users', false], ['GET', '/users', false], ['GET', '/users/:id', true]];
    routeList(rows, k === 0 ? lerp(0, 3, E(u, 0.4, 2.0)) : k === 4 ? lerp(0, 2, E(u, 0.4, 1.4)) : 3);
    if (k === 0) { reqObj({}); sub(720, 300, '메서드와 경로가 모두 맞는 첫 라우트에서 멈춘다', fade(u, 2.1), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1) { fly(300, 96, 680, 162, seg(u, 0.3, 1.2), '"42"', { mono: true, fill: ACC });
      fly(470, 96, 680, 196, seg(u, 0.9, 1.8), '"name"', { mono: true, fill: INFO });
      reqObj({ params: u > 1.2 ? '{ id: "42" }' : null, query: u > 1.8 ? '{ fields: "name" }' : null, body: 'undefined' });
      sub(720, 300, 'typeof req.params.id === "string"', fade(u, 2.2), { 'font-size': 15, fill: ACC, class: 'mono', 'font-weight': 700 }); return; }
    if (k === 2) { reqObj({ params: u < 0.6 ? '{ id: "42" }' : '{ id: "999" }', query: '{ fields: "name" }', body: 'undefined' });
      card(720, 320, 340, 46, { rx: 10, text: 'findUser("999")  →  undefined', fs: 15, mono: true, stroke: WARN, color: WARN, s: pop(u, 1.0) });
      sub(720, 372, '경로가 맞았다고 자원이 있는 것은 아니다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 3) { envelope(520, 110, 400, 404, [['{"error":"not found"}', INK]], { reason: 'Not Found', n: lerp(0, 1, E(u, 0.3, 0.9)) });
      const g = fade(u, 1.1); el('rect', { x: 520, y: 232, width: 400, height: 92, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: g });
      mono(540, 260, 'return 이 없다면 → res.json(user)', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: g });
      mono(540, 286, 'Error: Cannot set headers', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.6) });
      mono(540, 308, '  after they are sent to the client', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.6) });
      sub(720, 360, '요청 하나에 응답은 한 번', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { reqObj({ params: '{}', query: '{}', body: u > 1.5 ? '{ name: "Ann" }' : null });
      fly(860, 96, 680, 230, seg(u, 0.7, 1.5), '{"name":"Ann"}', { mono: true, fill: WARN });
      envelope(520, 290, 400, 201, [['{"id":9,"name":"Ann"}', INK]], { reason: 'Created', op: fade(u, 2.0) }); return; }
    // k5: 세 입구 → 핸들러 → 200
    reqObj({ params: '{ id: "42" }', query: '{ fields: "name" }', body: '(GET 이라 없음)' }, { op: (i) => (i === 2 ? 0.5 : 1) });
    grow(720, 262, 720, 290, E(u, 0.2, 0.8), ACC);
    envelope(520, 296, 400, 200, [['res.json(user)  ·  application/json', INK]], { reason: 'OK', op: fade(u, 1.0) }); }

  // ---------- 4. 등록 순서 = 우선순위 ----------
  function column(x, title, good, cards, req, o) { o = o || {}; const w = 400, cx = x + w / 2;
    zone(x, 20, w, 380, null, { fill: good ? GOODBG : BADBG, op: 0.55 });
    tx(cx, 48, title, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: good ? GOOD : BAD });
    cards.forEach(([p, st, a], i) => { if (a <= 0) return; const y = 128 + i * 66, dead = st === 'dead', hit = st === 'hit';
      card(cx, y, 300, 46, { rx: 10, stroke: hit ? ACC : dead ? OFF : GRID, sw: hit ? 2.6 : 1.6, fill: PANEL, dash: dead ? '6 5' : null, op: a });
      mono(x + 66, y + 6, String(i + 1), { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: a });
      badge(x + 86, y, 'GET', { op: dead ? 0.4 * a : a }); mono(x + 140, y + 6, p, { 'font-size': 16, 'font-weight': 700, fill: dead ? OFF : INK, opacity: a, 'text-decoration': dead ? 'line-through' : null });
      if (dead) tx(cx, y + 40, '도달 못 함 (죽은 라우트)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: a }); });
    if (req) { const [path, stop, u] = req, y = lerp(76, 128 + stop * 66 - 34, E(u, 0.2, 1.0)); reqTok(cx, y, 'GET', path, 1, 1 - fade(u, 1.3) * 0.6); }
    if (o.out) { const [st, body, col, u] = o.out; envelope(x + 40, 268, 320, st, [[body, col]], { op: fade(u, 1.2) }); } }
  function s4(t, c) { const { k, u } = c, A = (kk) => (k === kk ? fade(u, 0.1) : 1);
    if (k === 4) { // 좁은 → 넓은
      tx(480, 56, '받아들이는 값의 폭', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      [['/users/me', 'me 하나', 0.06, GOOD], ['/users/count', 'count 하나', 0.06, GOOD], ['/users/:id', '/users/ 뒤의 아무 값', 1, WARN]].forEach(([p, d, f, col], i) => { const y = 110 + i * 70, g = E(u, 0.2 + i * 0.3, 1.0 + i * 0.3);
        mono(250, y + 6, p, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end' });
        el('rect', { x: 270, y: y - 14, width: Math.max(16, 560 * f * g), height: 28, rx: 6, fill: col, opacity: 0.8 });
        tx(280 + Math.max(16, 560 * f), y + 6, f < 1 ? d : '', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0 + i * 0.3) });
        if (f === 1) tx(290, y + 6, d, { 'font-size': 14, fill: PANEL, 'font-weight': 700, opacity: fade(u, 1.6) }); });
      banner(480, 350, '좁은(고정) 경로를 위에, :param 경로를 아래에', pop(u, 1.8)); return; }
    const bad = [['/users/:id', 'hit', A(0)], ['/users/me', k >= 1 ? 'dead' : '', k >= 1 ? A(1) : 0]];
    column(40, '나쁜 순서 · 넓은 경로 먼저', false, bad, k === 0 ? ['/users/me', 0, u] : null,
      { out: k === 0 ? [200, '{"id":"me"}', WARN, u] : [200, '{"id":"me"}', WARN, 3] });
    if (k === 0) pill(240, 210, 'req.params.id = "me"', WARN, pop(u, 1.4), { mono: true, fs: 14 });
    if (k >= 1) sub(240, 380, '에러 없이 200, 내용만 틀린다', k === 1 ? fade(u, 1.4) : 1, { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
    if (k < 2) { column(520, '좋은 순서 · 구체적 경로 먼저', true, [], null); return; }
    const good = [['/users/me', k === 2 ? 'hit' : '', A(2)], ['/users/:id', k === 3 ? 'hit' : '', k >= 3 ? A(3) : 0]];
    column(520, '좋은 순서 · 구체적 경로 먼저', true, good, k === 2 ? ['/users/me', 0, u] : ['/users/7', 1, u],
      { out: k === 2 ? [200, 'currentUser', GOOD, u] : [200, '{"id":"7"}', GOOD, u] });
    if (k === 3) sub(720, 380, '/users/me 는 여전히 1번에서 멈춘다', fade(u, 1.8), { 'font-size': 14.5 }); }

  // ---------- 5. Router 분리 · 마운트 · static ----------
  function fileCard(x, y, w, h, name, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    el('rect', { x, y, width: w, height: 30, rx: 10, fill: SOFT, opacity: o.op ?? 1 });
    mono(x + 14, y + 21, name, { 'font-size': 14.5, 'font-weight': 800, opacity: o.op ?? 1 }); }
  function s5(t, c) { const { k, u } = c;
    const mount = k >= 3 ? (k === 3 ? E(u, 0.3, 1.2) : 1) : 0;
    // 왼쪽 users.js (라우터) · 오른쪽 app.js. 라우터 안 경로에 접두어 "/users" 가 자라 붙는다
    fileCard(40, 60, 330, 170, 'users.js', { stroke: k >= 3 ? ACC : INK });
    mono(54, 116, 'router = express.Router()', { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
    if (k === 0) sub(205, 176, '라우트 0개', fade(u, 0.6), { 'font-size': 14.5 });
    [['GET', '/', 1], ['GET', '/:id', 2]].forEach(([m, p, at], i) => { if (k < at) return; const a = k === at ? E(u, 0.2, 0.9) : 1, yy = 150 + i * 34;
      const bw = badge(54, yy, m, { op: a }), pre = '/users'.slice(0, Math.round(6 * mount));
      R.spans(64 + bw, yy + 5, [[pre, { fill: ACC, 'font-weight': 800 }], [p === '/' && mount >= 1 ? '' : p, {}]], { 'font-size': 15, 'font-weight': 700, opacity: a }); });
    if (k >= 2) { const a = k === 2 ? fade(u, 1.0) : 1;
      fileCard(520, 60, 400, 110, 'app.js', { op: a });
      mono(534, 116, k >= 3 ? 'app.use("/users", usersRouter)' : 'const usersRouter = require("./users")', { 'font-size': 14.5, 'font-weight': 700, fill: k >= 3 ? ACC : INK, opacity: a });
      if (k === 4) mono(534, 146, 'app.use(express.static("public"))', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.2) }); }
    if (k === 2) { mono(54, 262, 'module.exports = router', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.6) });
      grow(372, 145, 516, 115, E(u, 1.0, 1.8), INFO); }
    if (k >= 3) grow(372, 145, 516, 115, k === 3 ? E(u, 0.1, 0.6) : 1, ACC);
    if (k === 3) { reqTok(720, 220, 'GET', '/users', pop(u, 1.4));
      R.spans(560, 278, [['req.baseUrl  ', { fill: MUT }], ['"/users"', { fill: ACC, 'font-weight': 800 }]], { 'font-size': 15, opacity: fade(u, 1.8) });
      R.spans(560, 308, [['req.url      ', { fill: MUT }], ['"/"', { fill: INK, 'font-weight': 800 }]], { 'font-size': 15, opacity: fade(u, 2.0) });
      sub(720, 356, '접두어는 app.use 한 줄에서만 정한다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 4) { // public 폴더를 그대로 서빙
      zone(520, 196, 400, 150, 'public/', { fill: SOFT, op: fade(u, 0.3) });
      ['index.html', 'style.css', 'logo.png'].forEach((f, i) => card(590 + i * 130, 270, 110, 50, { rx: 8, text: f, fs: 13.5, mono: true, stroke: i === 1 ? GOOD : GRID, s: pop(u, 0.4 + i * 0.2) }));
      sub(720, 330, '파일 이름은 예시', fade(u, 0.8), { 'font-size': 13.5 });
      reqTok(720, 386, 'GET', '/style.css', pop(u, 1.3));
      dot([[720, 296], [720, 370]], seg(u, 1.6, 2.4), GOOD, 6);
      card(205, 300, 100, 32, { rx: 16, text: ':3000', fs: 15, fw: 800, mono: true, stroke: ACC, color: PANEL, fill: ACC, s: pop(u, 2.0) });
      sub(205, 340, 'app.listen(3000)', fade(u, 2.2), { 'font-size': 14, class: 'mono' }); } }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: 'app.get("/", handler)를 적은 순간 일어나는 일은 무엇인가?',
      o: ['handler가 한 번 실행되어 결과를 기억해 둔다', '라우팅 표에 "GET / → handler"가 적히고, 실행은 요청이 온 뒤다', '3000번 포트가 열린다'], a: 1,
      why: '라우트 등록은 선언이다. 포트는 listen(3000)이 열고, handler는 GET / 요청이 들어올 때마다 불린다.' },
    { q: 'express.json() 없이 POST /users에 {"name":"Bob"}을 보내면 { id: 2, ...req.body }의 결과는 무엇인가?',
      o: ['{"id":2,"name":"Bob"}', 'TypeError로 500 응답', '{"id":2}'], a: 2,
      why: '본문 파서가 없으면 req.body는 undefined이고, undefined를 펼치면 아무것도 더해지지 않는다. 그래서 name이 조용히 빠진 { id: 2 }가 된다.' },
    { q: 'GET /users/42?fields=name 요청에서 req.params.id의 값은 무엇인가?',
      o: ['숫자 42', '문자열 "42"', '문자열 "name"'], a: 1,
      why: '경로 변수와 쿼리는 늘 문자열로 들어온다. 숫자로 쓰려면 Number(id)처럼 직접 바꿔야 한다.' },
    { q: '/users/:id를 /users/me보다 먼저 등록했다. GET /users/me의 응답은 무엇인가?',
      o: ['{"id":"me"}', 'currentUser', '404 Not Found'], a: 0,
      why: '라우터는 등록 순서대로 훑다가 처음 맞는 라우트에서 멈춘다. :id가 "me"를 받아 버려 /users/me 핸들러는 실행되지 않는다.' },
    { q: 'app.use("/users", usersRouter)로 붙인 라우터 안의 router.get("/:id")가 받는 실제 경로는 무엇인가?',
      o: ['/:id', '/users/:id', '/users/users/:id'], a: 1,
      why: '마운트할 때 준 접두어 "/users"가 라우터 안 경로 앞에 붙는다. 접두어를 바꿀 때는 app.use 한 줄만 고치면 된다.' },
  ];

  const summary = [
    'Express는 Node http 위에 (메서드, 경로) → 핸들러 표를 얹은 계층이다.',
    '같은 /users라도 GET은 조회, POST는 생성이다. 본문을 읽으려면 express.json()이 먼저 있어야 한다.',
    '입력은 req.params, req.query, req.body로 나뉘고 응답은 요청마다 한 번만 보낸다.',
    '라우트는 등록 순서대로 맞춰 보므로 /users/me 같은 고정 경로를 /users/:id보다 위에 둔다.',
  ];
  const review = [
    { q: 'GET /users/me가 200으로 {"id":"me"}를 돌려준다. 먼저 확인할 것은?',
      o: ['/users/:id가 /users/me보다 위에 등록됐는지', 'express.json()을 켰는지', 'listen 포트가 맞는지'], a: 0,
      why: '에러 없이 엉뚱한 핸들러가 도는 것은 순서 문제의 전형이다. :id가 "me"를 먼저 받아 버렸다.' },
    { q: '사용자가 없을 때 404를 보냈는데 로그에 "Cannot set headers after they are sent"가 찍힌다. 고칠 곳은?',
      o: ['404를 500으로 바꾼다', 'res.status(404).json(...) 앞에 return을 붙인다', 'req.params.id를 Number로 바꾼다'], a: 1,
      why: 'return이 없으면 아래 res.json(user)까지 실행되어 응답을 두 번 보내려 한다. 응답을 보낸 분기는 거기서 함수를 끝내야 한다.' },
    { q: 'users 라우터의 공통 경로를 /users에서 /members로 바꿔야 한다. 고칠 곳은?',
      o: ['users.js의 모든 router.get 경로', '정적 파일 폴더 이름', 'app.use("/users", usersRouter)의 첫 인자'], a: 2,
      why: '라우터 안에서는 "/"와 "/:id"만 쓰고, 접두어는 마운트하는 한 줄이 정한다.' },
  ];

  R.page({ title: 'Express 요청 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
