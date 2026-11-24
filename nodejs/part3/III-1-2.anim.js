/* III-1-2 HTTP 서버 — http 모듈 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 1 서버 생성과 요청 콜백 · 2 req/res 해부 · 3 손수 라우팅 · 4 본문 청크와 쿼리 · 5 왜 Express 인가
 * 실측값(node v24): GET / → 200 text/html, GET /api/users → [{"id":1,"name":"kim"}], 그 외 → 404,
 *   첫 write 뒤 setHeader → ERR_HTTP_HEADERS_SENT, res.end(객체) → TypeError ERR_INVALID_ARG_TYPE, req.headers["User-Agent"] → undefined,
 *   url.parse → DEP0169 폐기 경고, POST {"name":"kim","age":30} → 201, "{bad" → 400. Express 4: app.listen 이 http.createServer 1회 호출. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, cells, lock, server, browser } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  const typed = (s, g) => s.slice(0, Math.round(s.length * clamp(g)));

  // ---------- 1. 서버 생성과 요청 콜백 ----------
  const SV = { x: 500, y: 140 }, PORT = { x: 300, y: 140 }, BR = { x: 110, y: 140 };
  function port(open, s) { const g = R.G(PORT.x, PORT.y, s ?? 1);
    el('rect', { x: -26, y: -40, width: 52, height: 80, rx: 8, fill: open ? GOODBG : SOFT, stroke: open ? GOOD : GRID, 'stroke-width': 2 }, g);
    lock(PORT.x, PORT.y - 4, !open, open ? GOOD : MUT); mono(0, 64, ':3000', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: open ? GOOD : MUT }, g); }
  function handler(x, y, s, o) { o = o || {}; const g = card(x, y, 250, 54, { rx: 10, stroke: o.hot ? ACC : INFO, fill: o.hot ? ACCBG : INFOBG, dash: o.dash ? '6 5' : null, s, sw: o.hot ? 3 : 2 });
    mono(0, -4, '(req, res) => { … }', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: o.hot ? ACC : INFO }, g);
    tx(0, 17, o.sub || '요청 처리기', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, g); }
  function s1(t, c) { const { k, u } = c;
    browser(BR.x, BR.y, 130, 96, '브라우저', { op: k >= 3 ? 1 : 0.35 });
    port(k >= 3 && !(k === 3 && u < 0.8), 1);
    card(SV.x, 46, 170, 40, { rx: 8, text: 'http 모듈 (내장)', fs: 14.5, stroke: ACC, color: ACC, fill: ACCBG, s: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) { note(400, 230, '도구만 손에 쥐었다 — 서버도, 열린 포트도 없다', fade(u, 1.2), { fill: MUT }); note(400, 262, 'npm install 없이 require 로 바로 쓴다', fade(u, 1.8), { fill: MUT, 'font-size': 14 }); return; }
    server(SV.x, SV.y + 10, 'server', { s: k === 1 ? pop(u, 0.2) : 1, lamp: k >= 3 ? GOOD : OFF });
    grow(SV.x, SV.y + 82, SV.x, 236, k === 1 ? E(u, 0.6, 0.9) : 1, MUT, { plain: true });
    const hot = k === 4 ? Math.floor(t * 3) % 2 === 0 && u < 2.6 : false;
    handler(SV.x, 266, k === 1 ? pop(u, 0.8) : 1, { dash: k === 1, hot, sub: k === 1 ? '등록만 — 아직 실행 안 됨' : '요청마다 실행' });
    if (k === 1) { note(40, 360, '포트가 닫혀 있어 아무도 이 함수를 부르지 못한다', fade(u, 1.6), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 2) { const g = R.G(780, 70, pop(u, 0.2)); el('rect', { x: -130, y: 0, width: 260, height: 170, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 }, g);
      tx(-114, 24, 'res — 응답', { 'font-size': 14, 'font-weight': 700, fill: MUT }, g);
      mono(-114, 56, 'statusCode 200', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5) }, g);
      mono(-114, 84, 'Content-Type: text/plain', { 'font-size': 14, fill: INK, opacity: fade(u, 0.9) }, g);
      mono(-114, 120, typed('"Hello from pure Node!"', E(u, 1.2, 2.0)), { 'font-size': 14, fill: ACC, 'font-weight': 700 }, g);
      el('rect', { x: -130, y: 136, width: 260, height: 34, rx: 0, fill: INK, opacity: fade(u, 2.1) }, g);
      tx(0, 158, 'res.end() — 응답 종료', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: PANEL, opacity: fade(u, 2.1) }, g);
      grow(SV.x + 130, 266, 646, 200, E(u, 0.1, 0.4), MUT, { dash: '4 4' }); return; }
    if (k === 3) { R.terminal(560, 300, 380, 96, ['$ node server.js', ['listening on http://localhost:3000', 'var(--term)']], 1 + E(u, 1.0, 2.0), { title: 'terminal' });
      note(230, 250, 'listen 이 포트를 열었다', fade(u, 0.9), { fill: GOOD }); return; }
    // k === 4: 요청 A·B·C
    ['A', 'B', 'C'].forEach((n, i) => { const a = 0.15 + i * 0.8;
      dot([[BR.x + 66, BR.y - 10], [PORT.x, PORT.y - 10], [SV.x - 60, SV.y]], seg(u, a, a + 0.35), INFO, 7);
      dot([[SV.x - 60, SV.y + 30], [PORT.x, PORT.y + 20], [BR.x + 66, BR.y + 20]], seg(u, a + 0.4, a + 0.75), GOOD, 6);
      pill(80 + i * 80, 250, '요청 ' + n, INFO, pop(u, a), { fs: 13.5 }); });
    const n = (u > 0.5) + (u > 1.3) + (u > 2.1);
    mono(SV.x + 150, 340, `콜백 실행 ${n}회`, { 'font-size': 18, 'font-weight': 800, fill: ACC });
    sub(SV.x + 150, 366, '요청 1건 = 콜백 1회'); }

  // ---------- 2. req 와 res 해부 ----------
  const REQ = ['GET /hello?name=kim HTTP/1.1', 'Host: localhost:3000', 'User-Agent: curl/8', 'Accept: */*'];
  function reqPanel(hiLine, span) { zone(28, 40, 410, 200, 'req — 들어온 요청 (읽기)', { fill: SOFT });
    REQ.forEach((s, i) => { const y = 92 + i * 34;
      if (hiLine === i && span) el('rect', { x: 43 + span[0] * 8.55, y: y - 18, width: (span[1] - span[0]) * 8.55 + 4, height: 26, rx: 5, fill: INFOBG, stroke: INFO, 'stroke-width': 1.8 });
      mono(46, y, s, { 'font-size': 14.5, fill: INK }); }); }
  function resPanel(o) { zone(500, 40, 430, 200, 'res — 돌려줄 응답 (쓰기)', { fill: SOFT });
    const hd = [['HTTP/1.1 200 OK', o.st], ['Content-Type: text/plain; charset=utf-8', o.ct]];
    hd.forEach(([s, a], i) => { if (a > 0) mono(516, 92 + i * 30, s, { 'font-size': 14, 'font-weight': 700, fill: o.sent ? MUT : GOOD, opacity: a }); });
    el('line', { x1: 512, y1: 146, x2: 918, y2: 146, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    if (o.body) mono(516, 180, o.body, { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
    if (o.sent) { lock(900, 98, true, MUT, 0.9); tx(880, 132, '전송됨', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
    if (o.end) { el('rect', { x: 500, y: 206, width: 430, height: 34, fill: INK, opacity: o.end }); tx(715, 228, 'res.end() — 응답 완료', { 'font-size': 14.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', opacity: o.end }); } }
  function spinner(cx, cy, t, done) { if (done) { el('circle', { cx, cy, r: 18, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 }); check(cx, cy, 9, 1); return; }
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * 4; el('circle', { cx: cx + Math.cos(a) * 15, cy: cy + Math.sin(a) * 15, r: 3.2, fill: MUT, opacity: (i + 1) / 8 }); } }
  function s2(t, c) { const { k, u } = c;
    const span = k === 0 ? [0, 3] : k === 1 ? [4, 19] : null;
    reqPanel(k === 0 ? 0 : k === 1 ? 0 : k === 2 ? 2 : -1, k === 2 ? [0, 10] : span);
    const out = (y, code, val, a, col) => { mono(40, y, code, { 'font-size': 15, 'font-weight': 700, opacity: a }); grow(296, y - 5, 336, y - 5, a, col || INFO); mono(346, y, val, { 'font-size': 15, 'font-weight': 700, fill: col || INFO, opacity: a }); };
    if (k <= 2) { const rows = [['req.method', '"GET"'], ['req.url', '"/hello?name=kim"'], ['req.headers["user-agent"]', '"curl/8"']];
      rows.slice(0, k + 1).forEach(([a, b], i) => out(290 + i * 40, a, b, i === k ? E(u, 0.4, 1.0) : 1));
      if (k === 1) note(60, 400, '호스트는 빠지고 경로 + 쿼리만 온다', fade(u, 1.4), { fill: MUT, 'font-size': 14 });
      if (k === 2) { mono(560, 300, 'User-Agent', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }); grow(670, 295, 720, 295, E(u, 0.5, 0.9), ACC); mono(732, 300, 'user-agent', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
        mono(560, 352, 'req.headers["User-Agent"]', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.5) }); mono(800, 376, '→ undefined', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
        note(560, 408, '키가 전부 소문자로 정규화된다', fade(u, 2.1), { fill: MUT, 'font-size': 14 }); }
      resPanel({ st: 0, ct: 0 }); tx(715, 190, '아직 비어 있음', { 'font-size': 14, fill: OFF, 'text-anchor': 'middle' }); return; }
    if (k === 3) { resPanel({ st: fade(u, 0.4), ct: fade(u, 1.0) });
      el('rect', { x: 504, y: 70, width: 422, height: 70, rx: 8, fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.5) });
      note(500, 280, '헤더는 본문보다 먼저 — 아직 서버 안에 있다', fade(u, 1.6), { fill: GOOD });
      tx(500, 314, 'statusCode · setHeader 는 이때만 바꿀 수 있다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); spinner(200, 330, t, false); sub(200, 372, '브라우저: 기다리는 중'); return; }
    if (k === 4) { const w = E(u, 0.3, 1.1);
      resPanel({ st: 1, ct: 1, sent: w > 0.5, body: '"첫 조각 "' + (u > 1.4 ? ' + "둘째 조각"' : '') });
      fly(560, 180, 200, 300, seg(u, 0.5, 1.3), '헤더 + 첫 조각', { fill: GOOD });
      card(715, 300, 400, 44, { rx: 10, text: 'setHeader(…) → ERR_HTTP_HEADERS_SENT', fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.8) });
      note(500, 356, '첫 write 와 함께 헤더가 나갔다', fade(u, 2.0), { fill: BAD, 'font-size': 14 });
      spinner(200, 330, t, false); sub(200, 372, '조각은 받았지만 아직 로딩 중'); return; }
    resPanel({ st: 1, ct: 1, sent: true, body: '"첫 조각 " + "둘째 조각"', end: E(u, 0.3, 0.8) });
    spinner(200, 330, t, u > 1.0); sub(200, 372, u > 1.0 ? '응답 완료 — 로딩이 멈춘다' : '…', 1, { 'font-weight': 700, fill: u > 1.0 ? GOOD : MUT });
    note(500, 300, 'end 를 빼먹으면 브라우저는 계속 기다린다', fade(u, 1.5), { fill: WARN });
    note(500, 332, 'end 뒤에는 write·end 를 더 부를 수 없다', fade(u, 2.0), { fill: MUT, 'font-size': 14 }); }

  // ---------- 3. 손수 라우팅 ----------
  const DX = 330, DY = [140, 222, 304];
  function diamond(cx, cy, label, s, col) { const g = R.G(cx, cy, s);
    el('path', { d: 'M0,-22 L30,0 L0,22 L-30,0 Z', fill: PANEL, stroke: col || INK, 'stroke-width': 2.2 }, g); tx(0, 5, 'if', { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', fill: col || INK }, g);
    mono(-46, 5, label, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: col || INK }, g); }
  function chain(n, k, u) { // n 개의 분기를 그린다
    const L = [['GET /', 'text/html · <h1>home</h1>', '200'], ['GET /api/users', 'application/json', '200'], ['POST /api/users', '생성', '201']];
    el('line', { x1: DX, y1: 100, x2: DX, y2: n >= 1 ? 352 : 120, stroke: GRID, 'stroke-width': 2.5 });
    for (let i = 0; i < n; i++) { const fresh = (i === 0 && k === 1) || (i === 1 && k === 2) || (i === 2 && k === 5), s = fresh ? pop(u, 0.2) : 1, y = DY[i];
      diamond(DX, y, L[i][0], s, i === 2 ? MUT : INK);
      grow(DX + 32, y, 520, y, fresh ? E(u, 0.4, 0.8) : 1, i === 2 ? MUT : GOOD, { dash: i === 2 ? '5 5' : null });
      card(660, y, 276, 44, { rx: 10, text: `${L[i][2]} · ${L[i][1]}`, fs: 13.5, mono: true, stroke: i === 2 ? MUT : GOOD, color: i === 2 ? MUT : GOOD, dash: i === 2 ? '5 5' : null, s: fresh ? pop(u, 0.7) : 1 });
      el('rect', { x: 808, y: y - 10, width: 8, height: 20, fill: INK, opacity: i === 2 ? 0 : s }); tx(826, y + 5, 'return', { 'font-size': 13.5, class: 'mono', fill: MUT, opacity: i === 2 ? 0 : s }); } }
  function reqChip(x, y, s, a) { pill(x, y, s, INFO, a ?? 1, { mono: true, fs: 14, fill: PANEL }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { reqChip(160, 80, 'GET /api/users', pop(u, 0.2));
      fly(160, 80, 120, 170, seg(u, 0.9, 1.6), 'method = "GET"', { mono: true, fill: INFO }); fly(160, 80, 330, 170, seg(u, 1.1, 1.8), 'url = "/api/users"', { mono: true, fill: INFO });
      if (u > 1.8) { pill(120, 170, 'method = "GET"', INFO, 1, { mono: true, fs: 13.5 }); pill(330, 170, 'url = "/api/users"', INFO, 1, { mono: true, fs: 13.5 }); }
      note(60, 260, '분기가 하나도 없다 — 이대로면 어떤 요청도 응답을 못 받는다', fade(u, 2.0), { fill: WARN }); return; }
    const n = k === 5 ? 3 : Math.min(k, 2);
    chain(n, k, u);
    card(DX, 352, 140, 40, { rx: 8, text: '404 Not Found', fs: 14, mono: true, stroke: BAD, color: BAD, op: k >= 4 ? 1 : 0.25, s: k === 4 ? pop(u, 0.2) : 1 });
    if (k === 1) { reqChip(DX, 60, 'GET /', pop(u, 0.1)); dot([[DX, 76], [DX, DY[0]], [520, DY[0]]], seg(u, 1.0, 2.0), INFO, 7);
      note(40, 404, 'return 을 빼면 아래 분기까지 내려가 응답을 두 번 쓴다', fade(u, 2.1), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 2) { reqChip(DX, 60, 'GET /api/users', 1); const g = R.G(640, 300, pop(u, 0.9));
      el('rect', { x: -115, y: -34, width: 230, height: 68, rx: 10, fill: INFOBG, stroke: INFO, 'stroke-width': 2 }, g);
      mono(0, -6, '[{ id: 1, name: "kim" }]', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO }, g); tx(0, 18, 'JS 배열 — 아직 문자열이 아니다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, g); return; }
    if (k === 3) { reqChip(DX, 60, 'GET /api/users', 1); dot([[DX, 76], [DX, DY[1]], [520, DY[1]]], seg(u, 0.1, 0.9), INFO, 7);
      mono(520, 296, 'JSON.stringify(users)', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) });
      mono(520, 324, "'[{\"id\":1,\"name\":\"kim\"}]'", { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 1.1) });
      mono(520, 366, 'res.end(users)', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      mono(660, 366, '→ TypeError', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); sub(740, 392, 'res.end 는 문자열·Buffer 만 받는다', fade(u, 2.1)); return; }
    if (k === 4) { reqChip(DX, 60, 'GET /nope', 1); dot([[DX, 76], [DX, 340]], seg(u, 0.3, 1.6), BAD, 7);
      [0, 1].forEach((i) => cross(DX + 50, DY[i] - 20, 6, fade(u, 0.6 + i * 0.4)));
      note(500, 360, '위 if 를 모두 지나쳤다 = 맞는 라우트가 없다', fade(u, 1.8), { fill: BAD, 'font-size': 14.5 }); return; }
    note(40, 404, '라우트가 늘 때마다 if 사슬이 그대로 길어진다', fade(u, 1.2), { fill: WARN });
    mono(860, 60, `if × ${n}`, { 'font-size': 18, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 0.8) }); }

  // ---------- 4. 본문 청크 수집 · 쿼리 파싱 ----------
  const CH = ['{"na', 'me":"', 'kim",', '"age"', ':30}'];
  function lanes4() { zone(24, 30, 912, 120, 'URL — 요청과 함께 바로 온다', { fill: SOFT }); zone(24, 166, 912, 236, '본문 — 청크로 나뉘어 나중에 온다', { fill: SOFT }); }
  function s4(t, c) { const { k, u } = c;
    lanes4();
    mono(48, 84, '/search?q=node&page=2', { 'font-size': 16, 'font-weight': 700 });
    if (k === 0) { card(420, 80, 150, 40, { rx: 8, text: 'url.parse()', fs: 14.5, mono: true, stroke: OFF, color: OFF, s: pop(u, 0.2) });
      el('line', { x1: 345, y1: 80, x2: 495, y2: 80, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 0.8) }); tx(420, 124, 'DEP0169 폐기 경고', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      card(680, 80, 230, 40, { rx: 8, text: 'new URL(req.url, 기준)', fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.4) });
      tx(680, 124, '전역 URL — require 없음', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      note(48, 230, '본문은 아직 아무것도 오지 않았다', fade(u, 2.0), { fill: MUT, 'font-size': 14 }); return; }
    // 쿼리 파싱 결과
    const qa = k === 1 ? E(u, 0.3, 1.2) : 1;
    grow(270, 78, 330, 78, qa, ACC);
    cells(344, 60, ['q', 'node', 'page', '"2"'], { w: 66, h: 36, gap: 6, style: (i) => ({ stroke: i % 2 ? ACC : INK, color: i === 3 ? WARN : null, s: k === 1 ? pop(u, 0.5 + i * 0.15) : 1 }) });
    mono(640, 84, "{ q: 'node', page: '2' }", { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 1 ? fade(u, 1.4) : 1 });
    if (k === 1) { note(640, 124, '값은 모두 문자열 — page 도 "2"', fade(u, 1.9), { fill: WARN, 'font-size': 14 }); note(48, 230, '쿼리는 바로 얻지만 본문은 시간이 걸린다', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    // 본문: 선 위로 청크가 흘러 그릇에 쌓인다
    el('line', { x1: 60, y1: 232, x2: 520, y2: 232, stroke: GRID, 'stroke-width': 3 }); tx(60, 214, 'req (읽기 스트림)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    const got = k === 2 ? 0 : k === 3 ? Math.min(4, Math.floor(E(u, 0.1, 2.2) * 4 + 0.001)) : 5;
    const g2 = R.G(560, 196); el('rect', { x: 0, y: 0, width: 350, height: 72, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 }, g2);
    mono(14, 24, 'let body =', { 'font-size': 14, fill: MUT }, g2); mono(14, 54, '"' + CH.slice(0, got).join('') + '"', { 'font-size': 15, 'font-weight': 700, fill: k === 3 ? WARN : ACC }, g2);
    if (k === 2) { fly(60, 232, 520, 232, seg(u, 0.8, 2.2), CH[0], { mono: true }); note(560, 300, '그릇을 먼저 만들어 둔다', fade(u, 0.5), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 3) { for (let i = 0; i < 4; i++) fly(60, 232, 540, 232, seg(u, 0.1 + i * 0.52, 0.6 + i * 0.52), CH[i], { mono: true });
      mono(560, 300, `data 이벤트 × ${got}`, { 'font-size': 16, 'font-weight': 800, fill: ACC });
      note(560, 336, '여기서 parse 하면 잘린 JSON 이다', fade(u, 1.6), { fill: BAD, 'font-size': 14.5 });
      sub(290, 270, '(조각 경계는 예시)', 1); return; }
    if (k === 4) { fly(60, 232, 540, 232, seg(u, 0.1, 0.6), CH[4], { mono: true });
      card(470, 300, 70, 32, { rx: 16, text: 'end', fs: 14, mono: true, stroke: INFO, color: PANEL, fill: INFO, s: pop(u, 0.7) });
      grow(735, 270, 735, 312, E(u, 1.0, 1.3), ACC);
      card(735, 340, 290, 44, { rx: 10, text: "JSON.parse → { name: 'kim', age: 30 }", fs: 13.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.4) });
      sub(470, 340, 'end 는 딱 한 번', fade(u, 1.0)); return; }
    // k === 5: 201 / 400
    [['{"name":"kim","age":30}', '201', '{"created":{"name":"kim","age":30}}', GOOD], ['{bad', '400', 'invalid json', BAD]].forEach(([b, code, resp, col], i) => { const y = 312 + i * 50, a = fade(u, 0.3 + i * 0.7);
      mono(48, y, b, { 'font-size': 14, fill: INK, opacity: a }); grow(300, y - 5, 340, y - 5, E(u, 0.4 + i * 0.7, 0.7 + i * 0.7), col);
      card(380, y - 5, 64, 32, { rx: 16, text: code, fs: 15, mono: true, stroke: col, color: col, s: pop(u, 0.6 + i * 0.7) });
      mono(426, y, resp, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 0.8 + i * 0.7) }); }); }

  // ---------- 5. 왜 Express 인가 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { tx(40, 52, '순수 http — 핸들러마다 손으로', { 'font-size': 17, 'font-weight': 800 });
      const H = ['GET /users', 'GET /posts', 'POST /users'];
      H.forEach((h, i) => { const y = 96 + i * 92, s = k === 0 ? pop(u, 0.2 + i * 0.4) : 1;
        card(150, y + 20, 200, 44, { rx: 8, text: `if (url === "${h.split(' ')[1]}")`, fs: 13.5, mono: true, stroke: WARN, color: WARN, s });
        if (k === 1) ['setHeader', 'stringify', 'statusCode'].forEach((b, j) => card(340 + j * 130, y + 20, 116, 40, { rx: 8, text: b, fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.2 + i * 0.3 + j * 0.1) })); });
      card(150, 386, 200, 36, { rx: 8, text: '그 외 → 404 수동', fs: 13.5, stroke: BAD, color: BAD, op: k === 1 ? fade(u, 1.4) : 0 });
      if (k === 0) note(320, 220, '경로가 늘수록 조건식과 return 도 는다', fade(u, 1.6), { fill: WARN });
      if (k === 1) note(420, 386, '같은 코드를 핸들러 수만큼 복사한다', fade(u, 1.8), { fill: BAD }); return; }
    // 층 그림: 아래 http, 위 Express
    const base = card(260, 360, 440, 52, { rx: 10, stroke: ACC, fill: ACCBG });
    mono(0, 6, 'http.createServer (Node 내장)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC }, base);
    const top = k === 2 ? E(u, 0.3, 1.2) : 1;
    const ex = card(260, lerp(200, 294, top), 440, 62, { rx: 10, stroke: INK, sw: 2.5, op: top });
    tx(0, -6, 'Express', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' }, ex); tx(0, 16, '라우터 · 미들웨어 · res.json', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, ex);
    if (k === 2) { note(40, 70, 'const app = express()', fade(u, 0.2), { class: 'mono', fill: INK });
      note(40, 104, 'app 은 (req, res) 를 받는 함수 — 곧 요청 처리기다', fade(u, 1.3), { fill: ACC, 'font-size': 14.5 });
      note(40, 136, '얇은 층이 하나 얹혔을 뿐, 밑은 같은 http', fade(u, 1.9), { fill: MUT, 'font-size': 14.5 }); return; }
    if (k === 3) { // 미들웨어 통로
      const xs = [540, 700, 860]; card(xs[0], 110, 120, 44, { rx: 8, text: '요청', fs: 14.5, stroke: INFO, color: INFO });
      card(xs[1], 110, 140, 52, { rx: 10, text: 'express.json()', fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.2) });
      card(xs[2], 110, 110, 44, { rx: 8, text: '핸들러', fs: 14.5, stroke: GOOD, color: GOOD });
      grow(600, 110, 628, 110, 1, MUT); grow(772, 110, 803, 110, 1, MUT);
      CH.forEach((ch, i) => dot([[480, 110], [630, 110]], seg(u, 0.3 + i * 0.12, 0.8 + i * 0.12), WARN, 5));
      fly(770, 150, 780, 190, seg(u, 1.2, 1.9), "req.body = { name: 'kim', … }", { mono: true, fill: GOOD });
      if (u > 1.9) pill(780, 190, "req.body = { name: 'kim', … }", GOOD, 1, { mono: true, fs: 13.5, fill: PANEL });
      note(40, 60, 'Step 4 의 data · end 수집이 한 줄로', fade(u, 2.1), { fill: GOOD }); return; }
    if (k === 4) { zone(500, 40, 430, 216, 'app 의 라우트 표', { fill: SOFT });
      [['GET', '/users', 'res.json([…])'], ['POST', '/users', 'res.status(201).json(…)']].forEach(([m, p, h], i) => { const y = 96 + i * 50, a = fade(u, 0.3 + i * 0.4);
        mono(520, y, m, { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: a }); mono(580, y, p, { 'font-size': 15, 'font-weight': 700, opacity: a }); mono(670, y, h, { 'font-size': 13.5, fill: ACC, opacity: a }); });
      mono(520, 210, 'Content-Type: application/json;', { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.5) }); mono(520, 232, '              charset=utf-8', { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.5) });
      note(40, 70, 'if 사슬 대신 선언 · res.json 이 헤더와 직렬화', fade(u, 1.8), { fill: ACC, 'font-size': 14.5 });
      note(40, 104, '맞는 라우트가 없으면 Express 가 404', fade(u, 2.2), { fill: MUT, 'font-size': 14.5 }); return; }
    // k === 5
    mono(40, 70, 'app.listen(3000)', { 'font-size': 16, 'font-weight': 700 }); grow(120, 86, 200, 258, E(u, 0.3, 1.0), ACC);
    zone(540, 40, 390, 230, '이 장에서 본 함정 4가지', { fill: BADBG });
    ['res.end 누락 — 무한 로딩', 'Content-Type 누락', '본문 스트림 실수', '동기 블로킹 — 서버 전체 지연'].forEach((s, i) => tx(560, 100 + i * 42, s, { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0 + i * 0.3) }));
    note(220, 70, '내부에서 http.createServer 를 부른다', fade(u, 0.9), { fill: ACC, 'font-size': 14.5 }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'http.createServer에 넘긴 콜백은 언제 실행되는가?',
      o: ['요청이 하나 올 때마다 한 번씩', '서버가 뜰 때 딱 한 번', 'listen을 부를 때 한 번'], a: 0,
      why: '콜백은 요청 처리기로 등록만 된다. listen으로 포트가 열린 뒤 요청 A·B·C가 오면 같은 콜백이 세 번 불린다.' },
    { q: '첫 res.write 다음에 res.setHeader를 부르면 어떻게 되는가?',
      o: ['헤더가 정상적으로 바뀐다', '다음 요청에 그 헤더가 붙는다', 'ERR_HTTP_HEADERS_SENT 에러가 난다'], a: 2,
      why: '첫 write와 함께 상태코드와 헤더가 이미 전송됐다. 헤더는 본문을 쓰기 전에 정해야 한다.' },
    { q: 'JSON 배열을 응답할 때 res.end(users)처럼 객체를 그대로 넘기면 어떻게 되는가?',
      o: ['Node가 알아서 JSON으로 바꿔 보낸다', '빈 응답이 나간다', 'TypeError가 난다 — res.end는 문자열·Buffer만 받는다'], a: 2,
      why: '실행해 보면 ERR_INVALID_ARG_TYPE이 난다. JSON.stringify로 문자열을 만들고 Content-Type을 application/json으로 단다.' },
    { q: 'req.on("data") 안에서 바로 JSON.parse를 하면 안 되는 이유는 무엇인가?',
      o: ['data는 본문 조각마다 불려 아직 JSON이 잘려 있을 수 있어서', 'data 이벤트는 GET에서만 불려서', 'JSON.parse는 비동기 함수라서'], a: 0,
      why: '본문은 청크로 나뉘어 온다. 모든 조각이 모인 end에서 parse해야 하고, 그마저도 try/catch로 감싸 잘못된 입력은 400으로 돌려준다.' },
    { q: 'Express와 http 모듈의 관계로 맞는 것은 무엇인가?',
      o: ['Express는 http 모듈을 대체하는 별도 서버다', 'Express 앱은 http.createServer에 넘기는 요청 처리기 위에 얹힌 층이다', 'Express를 쓰면 req·res가 사라진다'], a: 1,
      why: 'app.listen은 내부에서 http.createServer를 한 번 부른다. 라우터와 미들웨어가 그 위에 얹혀 있을 뿐 req·res 원리는 같다.' },
  ];
  const summary = [
    'createServer에 넘긴 콜백은 요청이 올 때마다 다시 실행된다.',
    'req에서 method, url, headers를 읽고, res에는 헤더를 먼저 정한 뒤 본문을 쓴다.',
    'res.end를 부르지 않으면 브라우저는 응답이 끝나지 않은 줄 알고 계속 기다린다.',
    '본문은 data 조각을 모아 end에서 parse하고, 실패하면 400으로 답한다.',
  ];
  const review = [
    { q: '새로 만든 라우트에 접속하니 브라우저가 계속 로딩만 한다. 서버 로그에는 에러가 없다. 먼저 볼 곳은?',
      o: ['그 분기에서 res.end를 부르는지', 'listen 포트 번호', 'req.headers의 대소문자'], a: 0,
      why: '응답을 끝내지 않으면 에러 없이 브라우저만 기다린다. 매칭 안 된 요청이 404 분기 없이 빠져도 같은 증상이 난다.' },
    { q: 'POST로 JSON을 보냈는데 서버가 가끔 죽는다. 스택을 보니 JSON.parse에서 터졌다. 고칠 방향은?',
      o: ['data 이벤트마다 parse한다', 'end에서 parse하되 try/catch로 감싸 실패하면 400을 돌려준다', '본문을 query로 옮긴다'], a: 1,
      why: '잘못된 본문 하나가 예외를 던지면 프로세스가 죽는다. 다 모인 뒤 parse하고 예외는 400 응답으로 바꾼다.' },
    { q: 'res.statusCode = 404를 나중에 정했는데 클라이언트는 200을 받았다. 무엇을 의심하나?',
      o: ['Content-Type이 빠졌다', '라우트 if 순서가 틀렸다', '그 전에 res.write로 이미 헤더가 나갔다'], a: 2,
      why: '첫 write와 함께 상태코드와 헤더가 전송된다. 그 뒤에 바꾼 값은 반영되지 않으므로 본문을 쓰기 전에 정해야 한다.' },
  ];

  R.page({ title: 'http 서버 — 요청과 응답', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
