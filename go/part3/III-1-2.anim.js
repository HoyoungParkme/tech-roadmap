/* III-1-2 gin 프레임워크 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: gin.Engine 의 라우트 트리, 라우트마다 붙는 핸들러 체인(배열 칸), c.Next() 호출 스택, 바인딩 검증표, 응답 분기.
 * 값은 페이지 코드(main.go, routes.go, middleware.go, binding.go, response.go)에서만 읽는다. 요청 값 중 코드에 없는 것은 "예시"라고 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, pill, grow, fly, dot, zone, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const KW = /^(func|package|import|return|if|else|switch|case|default|go|defer|type|struct|var|nil|make|chan)$/;
  function goTok(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '"' || ch === '`') { flush(); const e = line.indexOf(ch, i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  const code = (x, y, s, o) => { o = o || {}; return R.spans(x, y, goTok(s), { 'font-size': o.fs || 15, opacity: o.op ?? 1, 'text-anchor': o.anchor }); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 14.5, fill: MUT, opacity: op ?? 1 }, a || {}));
  const COL = { Logger: INFO, Recovery: GOOD, Auth: WARN };
  // 핸들러 체인: 이름 배열을 칸으로. o.n 개까지 보임(소수면 마지막 칸이 튀어나옴), o.on 번째 칸 강조, o.off 번째부터 흐림
  function chain(x, y, names, o) { o = o || {}; const w = o.w || 92, h = o.h || 34, gap = 6, n = o.n ?? names.length;
    names.forEach((s, i) => { const f = clamp(n - i); if (f <= 0) return; const cx = x + i * (w + gap) + w / 2, col = COL[s] || ACC, dim = o.off != null && i >= o.off;
      card(cx, y, w, h, { rx: 6, stroke: dim ? OFF : col, sw: o.on === i ? 3 : 2, fill: o.on === i ? (col === ACC ? ACCBG : SOFT) : PANEL, s: R.spring(f), text: s, fs: 14, mono: true, color: dim ? OFF : col, op: dim ? 0.6 : 1 });
      if (dim && o.cross) cross(cx, y, 9, 1); });
    return (i) => x + i * (w + gap) + w / 2; }

  // ---------- 1. gin.Default() ----------
  function engineCard(k, u) { zone(30, 36, 330, 170, 'r := gin.Default()   ·   *gin.Engine', { fill: PANEL, stroke: ACC, sw: 2.4, color: ACC });
    tx(48, 92, '미들웨어', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    chain(130, 86, ['Logger', 'Recovery'], { n: k === 0 ? 2 * E(u, 0.4, 1.6) : 2 });
    tx(48, 150, '라우트', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    mono(130, 152, k === 0 ? '0개' : '1개  GET /ping', { 'font-size': 15, 'font-weight': 700, fill: k === 0 ? MUT : INK, opacity: k === 1 ? fade(u, 1.0) : 1 });
    if (k === 0) note(48, 186, 'gin.New() 라면 미들웨어 칸이 비어 있다', fade(u, 1.8)); }
  function tree(k, u, o) { o = o || {}; const rx = 470, ry = 82, cx = 660;
    el('circle', { cx: rx, cy: ry, r: 22, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); mono(rx, ry + 5, '/', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
    tx(rx, ry - 34, '라우트 트리', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const g = k === 1 ? E(u, 0.2, 0.9) : k > 1 ? 1 : 0; if (g <= 0) return;
    grow(rx + 22, ry, cx - 62, ry, g, ACC, { plain: true });
    if (g > 0.95) { card(cx, ry, 120, 40, { rx: 20, stroke: ACC, sw: 2.4, fill: ACCBG, text: 'GET /ping', mono: true, fs: 14.5, color: ACC, s: k === 1 ? pop(u, 0.9) : 1 });
      tx(cx + 74, ry + 5, '이 경로의 체인', { 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: k === 1 ? fade(u, 1.3) : 1 });
      return chain(470, 150, ['Logger', 'Recovery', 'func(c)'], { n: k === 1 ? 3 * E(u, 1.2, 2.2) : 3, on: o.on, w: 100 }); } }
  function s1(t, c) { const { k, u } = c;
    engineCard(k, u);
    const at = k === 4 ? Math.min(2, Math.floor(seg(u, 0.4, 1.9) * 3)) : null;
    const X = tree(k, u, { on: k === 2 ? 2 : k === 4 && u > 0.4 && u < 1.9 ? at : null });
    if (k === 2) { zone(30, 230, 330, 150, '핸들러 안', { fill: SOFT });
      code(48, 288, 'c.JSON(http.StatusOK,', { fs: 15 }); code(66, 314, 'gin.H{"message": "pong"})', { fs: 15 });
      note(48, 356, 'gin.H 의 바탕 타입은 map[string]any', fade(u, 1.8));
      zone(420, 230, 510, 150, 'c 가 w 에 쓰는 것', { fill: PANEL, stroke: GRID, sw: 1.5 });
      [['상태', '200 OK'], ['헤더', 'Content-Type: application/json; charset=utf-8'], ['본문', '{"message":"pong"}']].forEach(([a, b], i) => { const y = 284 + i * 32, op = fade(u, 0.4 + i * 0.45);
        tx(438, y, a, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op }); mono(486, y, b, { 'font-size': 14, 'font-weight': i === 1 ? 400 : 700, fill: i === 2 ? GOOD : INK, opacity: op }); });
      return; }
    if (k === 3) { card(480, 280, 580, 54, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.2) }); code(210, 287, 'r.Run(":8080")', { fs: 16, op: fade(u, 0.3) });
      grow(350, 280, 400, 280, E(u, 0.6, 1.0), MUT); code(410, 287, '안에서 http.ListenAndServe 호출', { fs: 15, op: fade(u, 0.9) });
      el('rect', { x: 200, y: 342, width: 6, height: 22, rx: 2, fill: WARN, opacity: fade(u, 1.5) }); el('rect', { x: 212, y: 342, width: 6, height: 22, rx: 2, fill: WARN, opacity: fade(u, 1.5) });
      tx(230, 359, '여기서 블록 · 아래 줄은 서버가 끝나야 실행된다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
      return; }
    if (k === 4) { const lines = ['$ curl http://localhost:8080/ping', ['{"message":"pong"}', 'var(--good)'], ['[GIN] … | 200 | 1.2ms | GET "/ping"', 'var(--warn)']];
      terminal(30, 236, 480, 150, lines, u < 0.3 ? 1 : u < 2.0 ? 1 : u < 2.4 ? 2 : 3, { title: '터미널 · 로그 값은 예시' });
      if (X) dot([[X(0), 150], [X(1), 150], [X(2), 150]], seg(u, 0.4, 1.9), ACC, 8);
      if (u > 2.4) note(540, 330, 'Logger 가 상태·소요 시간을 남긴다', fade(u, 2.4), { fill: INK, 'font-weight': 700 }); } }

  // ---------- 2. RouterGroup ----------
  const ROOT = [56, 210], GV = [220, 110], GA = [220, 316];
  function groupTree(k, u) { el('circle', { cx: ROOT[0], cy: ROOT[1], r: 22, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); mono(ROOT[0], ROOT[1] + 5, '/', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
    const gv = k === 0 ? E(u, 0.2, 0.7) : 1; grow(ROOT[0] + 18, ROOT[1] - 12, GV[0] - 66, GV[1] + 8, gv, ACC, { plain: true });
    if (gv > 0.9) card(GV[0], GV[1], 128, 40, { rx: 20, stroke: ACC, sw: 2.4, fill: ACCBG, text: '/api/v1', mono: true, fs: 15, color: ACC, s: k === 0 ? pop(u, 0.6) : 1 });
    const V = [['GET', '/api/v1/users'], ['GET', '/api/v1/users/:id'], ['POST', '/api/v1/users']];
    V.forEach(([m, p], i) => { const y = 54 + i * 56, f = k === 0 ? E(u, 0.9 + i * 0.35, 1.3 + i * 0.35) : 1; grow(GV[0] + 64, GV[1], 330, y, f, MUT, { plain: true });
      if (f > 0.9) { mono(340, y + 5, m, { 'font-size': 14, 'font-weight': 700, fill: m === 'POST' ? WARN : INFO }); mono(392, y + 5, p, { 'font-size': 15 }); } });
    if (k === 0) return;
    const ga = k === 1 ? E(u, 0.2, 0.7) : 1; grow(ROOT[0] + 18, ROOT[1] + 12, GA[0] - 66, GA[1] - 8, ga, WARN, { plain: true });
    if (ga > 0.9) card(GA[0], GA[1], 128, 40, { rx: 20, stroke: WARN, sw: 2.4, fill: WARNBG, text: '/admin', mono: true, fs: 15, color: WARN, s: k === 1 ? pop(u, 0.6) : 1 }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { groupTree(k, u);
      if (k === 0) { note(392, 222, 'prefix 는 한 곳에만 쓴다', fade(u, 2.2), { fill: INK, 'font-weight': 700 }); return; }
      // admin 그룹의 체인
      tx(150, 380, 'admin 그룹 체인', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle' });
      chain(250, 372, ['Logger', 'Recovery', 'Auth'], { n: k === 1 ? 2 + E(u, 1.0, 1.6) : 3, w: 96 });
      if (k === 1) { fly(560, 420, 250 + 2 * 102 + 48, 372, seg(u, 0.7, 1.2), 'admin.Use(Auth)', { fill: WARN, mono: true });
        note(600, 378, 'Use 이후 등록하는 라우트가 물려받는다', fade(u, 1.7), { fill: INK, 'font-weight': 700 }); return; }
      const A = [['GET', '/admin/stats'], ['POST', '/admin/ban']];
      A.forEach(([m, p], i) => { const y = 270 + i * 64, f = E(u, 0.2 + i * 0.3, 0.6 + i * 0.3); grow(GA[0] + 64, GA[1], 330, y, f, MUT, { plain: true });
        if (f > 0.9) { mono(340, y + 5, m, { 'font-size': 14, 'font-weight': 700, fill: m === 'POST' ? WARN : INFO }); mono(392, y + 5, p, { 'font-size': 15 }); } });
      const X = chain(560, 270, ['Logger', 'Recovery', 'Auth', 'getStats'], { n: 4 * E(u, 0.6, 1.4), w: 86, on: u > 1.9 ? 2 : null });
      dot([[X(0), 270], [X(1), 270], [X(2), 270]], seg(u, 1.3, 1.9), BAD, 7);
      if (u > 1.9) { cross(X(3), 270, 10, pop(u, 1.9)); card(X(2), 318, 150, 36, { rx: 18, fill: BADBG, stroke: BAD, sw: 2, text: '토큰 없음 → 401', fs: 14, color: BAD, s: pop(u, 2.0) }); }
      return; }
    if (k === 3) { tx(40, 60, '들어온 요청 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const req = 'GET /api/v1/users/7?verbose=true', x0 = 40;
      R.spans(x0, 100, [['GET /api/v1/users/', {}], ['7', { fill: ACC, 'font-weight': 800 }], ['?verbose=', {}], ['true', { fill: INFO, 'font-weight': 800 }]], { 'font-size': 18 });
      R.spans(x0, 134, [['X-Token: ', {}], ['abc', { fill: WARN, 'font-weight': 800 }]], { 'font-size': 18 });
      void req;
      const outs = [['c.Param("id")', '"7"', ACC, 'routes.go 의 :id 자리', [x0 + tw('GET /api/v1/users/', 18) + 5, 106]], ['c.Query("verbose")', '"true"', INFO, '쿼리 스트링', [x0 + tw('GET /api/v1/users/7?verbose=', 18) + 18, 106]], ['c.GetHeader("X-Token")', '"abc"', WARN, '헤더', [x0 + tw('X-Token: ', 18) + 16, 140]]];
      [outs[2], outs[0], outs[1]].forEach(([fn, v, col, d, from], i) => { const cx = 170 + i * 310, y = 230, at = 0.4 + i * 0.5;
        grow(from[0], from[1] + 4, cx, y - 26, E(u, at, at + 0.4), col);
        card(cx, y, 280, 46, { rx: 8, stroke: col, sw: 2, s: pop(u, at + 0.3) }); code(cx, y + 6, fn, { fs: 14.5, op: fade(u, at + 0.3), anchor: 'middle' });
        card(cx, y + 66, 100, 42, { rx: 8, stroke: col, sw: 2.4, fill: PANEL, text: v, mono: true, fs: 15, color: col, s: pop(u, at + 0.6) });
        note(cx, y + 120, d, fade(u, at + 0.7), { 'text-anchor': 'middle' }); });
      return; }
    // k === 4: 중첩 그룹
    code(40, 70, 'api := r.Group("/api")', { fs: 16, op: fade(u, 0.1) }); code(40, 104, 'v1 := api.Group("/v1")', { fs: 16, op: fade(u, 0.5) }); code(40, 138, 'v1.GET("/orders", listOrders)', { fs: 16, op: fade(u, 0.9) });
    const parts = [['/api', 520, 72, ACC], ['/v1', 520, 106, INFO], ['/orders', 520, 140, WARN]];
    let x = 280; const f = E(u, 1.2, 2.0);
    parts.forEach(([s, ax, ay, col], i) => { const w = tw(s, 18) + 22, cx = x + w / 2; card(lerp(ax + 40, cx, f), lerp(ay, 260, f), w, 40, { rx: 8, stroke: col, sw: 2.4, fill: PANEL, text: s, mono: true, fs: 18, color: col, op: fade(u, 0.2 + i * 0.4) }); x += w - 2; });
    if (u > 2.0) { card(480, 340, 330, 48, { rx: 24, stroke: GOOD, sw: 2.4, fill: GOODBG, text: 'GET /api/v1/orders', mono: true, fs: 17, color: GOOD, s: pop(u, 2.0) });
      note(670, 345, 'prefix 와 미들웨어가 함께 이어진다', fade(u, 2.3), { fill: INK, 'font-weight': 700 }); } }

  // ---------- 3. c.Next() 호출 스택 ----------
  const HS = ['Logger', 'Auth', 'getProfile'];
  function handlersRow(idx, o) { o = o || {}; tx(40, 58, 'c.handlers', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const X = chain(150, 52, HS, { w: 124, on: idx >= 0 && idx < 3 ? idx : null, off: o.off, cross: o.cross });
    tx(560, 58, 'c.index', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    mono(630, 58, String(o.idxText ?? idx), { 'font-size': 18, 'font-weight': 800, fill: o.idxCol || ACC });
    if (idx >= 0 && idx < 3) el('path', { d: `M${X(idx) - 8},86 L${X(idx) + 8},86 L${X(idx)},76 Z`, fill: ACC }); return X; }
  function frame(depth, y, h, title, lines, op, col) { const x = 40 + depth * 46, w = 880 - depth * 92;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: depth === 0 ? SOFT : PANEL, stroke: col || GRID, 'stroke-width': 2, opacity: op ?? 1 });
    tx(x + 14, y + 22, title, { 'font-size': 14, 'font-weight': 700, fill: col || INK, opacity: op ?? 1 });
    (lines || []).forEach(([s, o2], i) => code(x + 200, y + 22 + i * 26, s, { fs: 14.5, op: (op ?? 1) * (o2 ?? 1) })); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { const idx = k === 0 ? 0 : k === 1 ? (u < 0.9 ? 0 : u < 1.6 ? 1 : 2) : 2;
      handlersRow(k === 2 ? -1 : idx, { idxText: k === 2 ? 3 : idx });
      const post = k === 2 ? fade(u, 1.0) : 0;
      frame(0, 110, k === 2 ? 290 : 280, 'LoggerMiddleware', [['start := time.Now()'], ['c.Next()', k >= 1 ? 1 : 0.4], ['latency := time.Since(start)', post], ['log.Printf(… c.Writer.Status(), latency)', post]], 1, INFO);
      if (k === 0) clock(860, 140, 18, E(u, 0.4, 1.2) * 0.25, INFO, 'start');
      if (k >= 1) { const a = k === 1 ? fade(u, 0.9) : 1 - fade(u, 0.3), b = k === 1 ? fade(u, 1.6) : 1 - fade(u, 0.1);
        frame(1, 196, 120, 'AuthMiddleware', [['token 검사 …'], ['c.Next()']], a, WARN);
        frame(2, 256, 50, 'getProfile', [['c.JSON(200, …)']], b, ACC);
        if (k === 1) note(470, 360, 'c.Next() 한 줄 안에서 나머지 체인이 모두 돈다', fade(u, 2.0), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 }); }
      if (k === 2) { card(560, 340, 600, 46, { rx: 10, stroke: INFO, sw: 2, fill: INFOBG, s: pop(u, 1.4) });
        mono(276, 346, 'GET /profile 200 12ms', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) }); note(510, 346, '← 돌아와서 확정값을 찍는다 (시간은 예시)', fade(u, 1.8), { fill: INK }); }
      return; }
    if (k === 3) { handlersRow(1, {});
      zone(40, 110, 360, 150, '요청 헤더', { fill: PANEL, stroke: GRID, sw: 1.5 });
      mono(58, 160, 'Host: api.example.com', { 'font-size': 14.5, fill: MUT }); mono(58, 196, 'Authorization: (없음)', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.4) });
      mono(58, 232, 'Accept: */*', { 'font-size': 14.5, fill: MUT });
      grow(400, 190, 520, 190, E(u, 0.8, 1.3), WARN);
      card(690, 190, 320, 56, { rx: 10, stroke: WARN, sw: 2.4, s: pop(u, 1.2) }); code(546, 196, 'token := c.GetHeader(…)', { fs: 15, op: fade(u, 1.3) });
      card(690, 268, 120, 42, { rx: 8, stroke: WARN, sw: 2, text: 'token = ""', mono: true, fs: 15, color: WARN, s: pop(u, 1.8) });
      note(480, 360, '여기까지는 아무것도 막지 않는다 · 읽기만 한다', fade(u, 2.2), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { const ab = u > 0.9; handlersRow(ab ? -1 : 1, { idxText: ab ? 63 : 1, idxCol: ab ? BAD : ACC, off: ab ? 2 : null, cross: ab });
      if (ab) note(670, 62, '= abortIndex', fade(u, 0.9), { fill: BAD, 'font-weight': 700 });
      frame(0, 110, 250, 'LoggerMiddleware', [['c.Next()']], 1, INFO);
      frame(1, 150, 140, 'AuthMiddleware', [['c.AbortWithStatusJSON(401, …)'], ['return']], 1, BAD);
      code(240, 328, 'latency · log', { fs: 14.5, op: fade(u, 2.0) }); note(380, 328, '← 바깥 Logger 는 그래도 이 줄을 실행한다', fade(u, 2.0), { fill: INFO, 'font-weight': 700 });
      card(700, 395, 400, 40, { rx: 20, fill: BADBG, stroke: BAD, sw: 2, text: '401 {"error":"token required"}', mono: true, fs: 15, color: BAD, s: pop(u, 1.2) });
      return; }
    // k === 5: c.Set → c.GetInt
    handlersRow(2, {});
    zone(330, 120, 300, 160, 'c.Keys  (gin.Context 안의 map)', { fill: PANEL, stroke: ACC, sw: 2.4, color: ACC });
    const f = E(u, 0.6, 1.3);
    if (f > 0) { el('rect', { x: 342, y: 160, width: 276 * f, height: 40, rx: 6, fill: ACCBG }); mono(356, 186, '"userID"', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: f }); mono(480, 186, '→ 토큰에서 꺼낸 id', { 'font-size': 14, opacity: f }); }
    card(170, 180, 230, 56, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.1) }); code(68, 186, 'c.Set("userID", …)', { fs: 14.5 }); tx(70, 228, 'Auth 가 넣는다', { 'font-size': 13.5, fill: WARN, 'font-weight': 700 });
    grow(286, 180, 340, 180, E(u, 0.3, 0.7), WARN);
    card(800, 180, 240, 56, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 1.4) }); code(694, 186, 'c.GetInt("userID")', { fs: 14.5, op: fade(u, 1.4) }); tx(694, 228, 'getProfile 이 꺼낸다', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.5) });
    grow(620, 180, 678, 180, E(u, 1.5, 1.9), ACC);
    note(480, 340, '키는 문자열이라 오타를 컴파일러가 못 잡는다 · 상수로 빼 둔다', fade(u, 2.2), { 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 }); }

  // ---------- 4. ShouldBindJSON ----------
  const F = [['Name', 'string', ['required', 'min=2', 'max=50']], ['Email', 'string', ['required', 'email']], ['Age', 'int', ['gte=0', 'lte=150']]];
  function reqStruct(vals, marks, k, u) { zone(300, 60, 630, 230, 'type CreateUserReq struct', { fill: PANEL, stroke: INK, sw: 2 });
    F.forEach(([n, ty, rules], i) => { const y = 120 + i * 60, mk = marks && marks[i];
      if (mk) el('rect', { x: 310, y: y - 26, width: 610, height: 50, rx: 8, fill: mk === 'ok' ? GOODBG : BADBG });
      mono(320, y + 5, n, { 'font-size': 15, 'font-weight': 700 }); mono(390, y + 5, ty, { 'font-size': 14, fill: MUT });
      let x = 460; rules.forEach((r, j) => { const w = tw(r, 13.5) + 20, s = k === 0 ? pop(u, 0.4 + i * 0.35 + j * 0.12) : 1, bad = mk === 'bad' && ((i === 0 && r === 'min=2') || (i === 1 && r === 'email') || (i === 2 && r === 'gte=0'));
        card(x + w / 2, y, w, 28, { rx: 14, stroke: bad ? BAD : INFO, sw: bad ? 2.6 : 1.6, text: r, fs: 13.5, mono: true, color: bad ? BAD : INFO, s }); x += w + 6; });
      if (vals) mono(760, y + 5, vals[i], { 'font-size': 15, 'font-weight': 700, fill: mk === 'bad' ? BAD : mk === 'ok' ? GOOD : MUT });
      if (mk === 'ok') check(900, y, 9, 1); if (mk === 'bad') cross(900, y, 8, 1); });
    if (vals) tx(760, 92, 'req 의 값', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); }
  function bodyCard(lines, col, op) { zone(30, 60, 240, 230, '요청 바디 (JSON)', { fill: SOFT, op });
    lines.forEach((s, i) => mono(48, 112 + i * 34, s, { 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: op ?? 1 })); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { reqStruct(null, null, 0, u); note(300, 330, 'json 태그는 이름 매핑, binding 태그는 검증 규칙', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const f = E(u, 1.2, 2.0);
      reqStruct(f > 0.5 ? ['…', '…', '…'] : ['""', '""', '0'], null, 1, u);
      card(150, 330, 240, 52, { rx: 10, stroke: ACC, sw: 2.4, fill: ACCBG, s: pop(u, 0.2) }); code(42, 336, 'var req CreateUserReq', { fs: 14.5 });
      note(300, 336, '← 제로값 struct', fade(u, 0.5));
      card(650, 340, 330, 52, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.8) }); code(500, 346, 'c.ShouldBindJSON(&req)', { fs: 15, op: fade(u, 0.8) });
      grow(650, 312, 650, 300, f, ACC); note(830, 346, '포인터로 넘긴다', fade(u, 1.2));
      bodyCard(['{', '  "name": …,', '  "email": …,', '  "age": …', '}'], MUT, fade(u, 1.4)); return; }
    if (k === 2) { const chk = u > 1.2;
      bodyCard(['{', '  "name": "a",', '  "email": "x",', '  "age": -1', '}'], BAD);
      reqStruct(['"a"', '"x"', '-1'], chk ? { 0: 'bad', 1: 'bad', 2: 'bad' } : null, 2, u);
      for (let i = 0; i < 3; i++) fly(220, 146 + i * 34, 780, 120 + i * 60, seg(u, 0.2 + i * 0.2, 0.9 + i * 0.2), ['"a"', '"x"', '-1'][i], { mono: true, fill: BAD });
      card(480, 350, 520, 50, { rx: 25, fill: BADBG, stroke: BAD, sw: 2.4, text: 'err != nil  →  c.JSON(400, …)  →  return', mono: true, fs: 15, color: BAD, s: pop(u, 1.8) });
      return; }
    if (k === 3) { bodyCard(['{', '  "name": "Alice",', '  "email": "a@x.com",', '  "age": 30', '}'], GOOD);
      reqStruct(['"Alice"', '"a@x.com"', '30'], u > 1.0 ? { 0: 'ok', 1: 'ok', 2: 'ok' } : null, 3, u);
      note(30, 316, '요청 값은 예시', 1);
      card(560, 350, 560, 50, { rx: 25, fill: GOODBG, stroke: GOOD, sw: 2.4, s: pop(u, 1.6) }); code(298, 356, 'userService.Create(req.Name, req.Email, req.Age)', { fs: 14.5, op: fade(u, 1.7) });
      return; }
    if (k === 4) { reqStruct(['"Alice"', '"a@x.com"', '30'], { 0: 'ok', 1: 'ok', 2: 'ok' }, 4, u);
      fly(560, 300, 160, 340, seg(u, 0.3, 1.0), 'user', { mono: true, fill: GOOD });
      card(480, 355, 600, 50, { rx: 25, fill: PANEL, stroke: GOOD, sw: 2.4, s: pop(u, 1.0) });
      code(200, 361, 'c.JSON(http.StatusCreated, user)', { fs: 15, op: fade(u, 1.1) }); mono(560, 361, '→ 201 Created', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      bodyCard(['생성 API 는', '200 이 아니라', '201 을 준다'], INK, fade(u, 1.8)); return; }
    // k === 5: 다른 입력원 + 실패 메시지 모양
    const src = [['쿼리 ?page=2', 'c.ShouldBindQuery(&q)'], ['경로 /users/:id', 'c.ShouldBindUri(&path)'], ['폼 name=…', 'c.ShouldBindWith(&req, binding.Form)']];
    src.forEach(([a, b], i) => { const y = 80 + i * 62, at = 0.2 + i * 0.4; card(150, y, 220, 44, { rx: 8, stroke: INFO, sw: 2, text: a, mono: true, fs: 14, color: INFO, s: pop(u, at) });
      grow(262, y, 320, y, E(u, at + 0.2, at + 0.5), INFO); code(330, y + 5, b, { fs: 14.5, op: fade(u, at + 0.4) }); });
    tx(40, 300, '규칙을 어기면 err.Error() 에 필드마다 한 줄씩 나온다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
    terminal(40, 316, 880, 90, ['Key: \'CreateUserReq.Email\' Error:Field validation for \'Email\' failed on the \'email\' tag'], u > 1.7 ? 1 : 0, { fs: 13.5 }); }

  // ---------- 5. 응답 분기 ----------
  function branches(on, u) { card(140, 210, 220, 56, { rx: 10, stroke: INK, sw: 2 }); code(46, 205, 'user, err :=', { fs: 14 }); code(46, 226, 'FindByID(id)', { fs: 14.5 });
    const B = [['err == ErrNotFound', '404', '{"error":"user not found"}', WARN, 90], ['err != nil', '500', '{"error": err.Error()}', BAD, 210], ['정상', '200', 'UserResp{ID, Name, Email}', GOOD, 330]];
    B.forEach(([cond, st, body, col, y], i) => { const hot = on === i, f = hot ? E(u, 0.3, 0.9) : 0;
      el('path', { d: `M250,210 C300,210 300,${y} 350,${y}`, fill: 'none', stroke: hot ? col : GRID, 'stroke-width': hot ? 3 : 2 });
      if (hot) dot([[250, 210], [300, (210 + y) / 2], [350, y]], seg(u, 0.2, 0.8), col, 7);
      card(450, y, 200, 46, { rx: 8, stroke: hot ? col : GRID, sw: hot ? 2.4 : 1.5, text: cond, mono: true, fs: 14, color: hot ? col : MUT });
      card(600, y, 70, 46, { rx: 8, fill: hot ? col : SOFT, stroke: 'none', text: st, mono: true, fs: 18, color: hot ? PANEL : MUT });
      mono(650, y + 5, body, { 'font-size': 14, fill: hot ? col : MUT, opacity: hot ? 0.3 + 0.7 * f : 0.6, 'font-weight': hot ? 700 : 400 }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { zone(40, 60, 330, 280, 'user  (내부 모델)', { fill: SOFT });
      [['ID', 1], ['Name', 1], ['Email', 1], ['비밀번호 해시 …', 0], ['내부 메모 …', 0]].forEach(([n, keep], i) => { const y = 110 + i * 46;
        card(205, y, 290, 36, { rx: 6, stroke: keep ? INK : OFF, sw: 1.8, dash: keep ? null : '5 4', text: n, mono: true, fs: 14.5, color: keep ? INK : MUT });
        if (keep) fly(350, y, 640, 128 + i * 46, seg(u, 0.6 + i * 0.3, 1.2 + i * 0.3), n, { mono: true });
        else if (u > 1.6) cross(372, y, 8, pop(u, 1.6)); });
      zone(520, 60, 400, 200, 'type UserResp struct  (응답 계약)', { fill: PANEL, stroke: ACC, sw: 2.4, color: ACC });
      [['ID', 'int', 'id'], ['Name', 'string', 'name'], ['Email', 'string', 'email']].forEach(([n, ty, j], i) => { const y = 128 + i * 46, op = fade(u, 1.2 + i * 0.3);
        mono(540, y, n, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(620, y, ty, { 'font-size': 14, fill: MUT, opacity: op }); mono(710, y, `json:"${j}"`, { 'font-size': 14, fill: ACC, opacity: op }); });
      note(520, 300, '나가는 필드가 타입에 적혀 있다', fade(u, 2.2), { fill: INK, 'font-weight': 700 }); return; }
    if (k <= 3) { branches(k - 1, u);
      if (k === 2) note(450, 400, '이 블록을 지나면 err == nil 이 확정된다', fade(u, 1.4), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 });
      if (k === 1) note(450, 400, '에러 종류마다 상태 코드를 나눈다', fade(u, 1.4), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 });
      if (k === 3) note(450, 400, 'id · name · email 세 키만 나간다', fade(u, 1.4), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 });
      return; }
    if (k === 4) { card(220, 150, 360, 130, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.1) });
      code(60, 120, 'c.JSON(http.StatusOK, gin.H{', { fs: 15 }); code(84, 150, '"status": "ok",', { fs: 15 }); code(84, 180, '"uptime": uptime(),', { fs: 15 }); mono(60, 206, '})', { 'font-size': 15 });
      grow(410, 150, 500, 150, E(u, 0.6, 1.0), ACC);
      card(720, 150, 400, 52, { rx: 10, stroke: GOOD, sw: 2.4, s: pop(u, 1.0) }); mono(540, 156, '{"status":"ok","uptime":…}', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.1) });
      note(520, 214, 'map 은 키 이름 순으로 정렬되어 나간다', fade(u, 1.5));
      card(480, 330, 800, 64, { rx: 12, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 1.9) });
      tx(480, 326, '타입 없이 즉석으로 만든다 · 헬스체크처럼 계약이 없는 응답에 쓴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      tx(480, 350, '외부에 공개되는 API 는 struct 로 계약을 고정한다', { 'text-anchor': 'middle', 'font-size': 14, fill: INK, opacity: fade(u, 2.1) }); return; }
    // k === 5: 에러 헬퍼 하나로
    ['createUser', 'getUser', 'banUser'].forEach((n, i) => { const y = 100 + i * 80; card(130, y, 180, 46, { rx: 8, stroke: INK, sw: 2, text: n, mono: true, fs: 15, s: pop(u, 0.1 + i * 0.15) });
      grow(222, y, 360, 180, E(u, 0.5 + i * 0.15, 0.9 + i * 0.15), WARN); });
    card(500, 180, 260, 70, { rx: 12, stroke: WARN, sw: 2.6, fill: WARNBG, s: pop(u, 0.9) }); code(388, 175, 'badRequest(c, msg)', { fs: 15, op: fade(u, 1.0) }); mono(388, 200, 'AbortWithStatusJSON(400,…)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) });
    grow(632, 180, 690, 180, E(u, 1.2, 1.5), WARN);
    card(810, 180, 230, 46, { rx: 23, stroke: BAD, sw: 2, fill: BADBG, text: '{"error": msg}', mono: true, fs: 15, color: BAD, s: pop(u, 1.4) });
    note(500, 250, '응답 모양이 한 곳에서 정해진다', fade(u, 1.6), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 });
    card(480, 360, 620, 50, { rx: 25, stroke: INFO, sw: 2, fill: INFOBG, s: pop(u, 2.0) });
    tx(480, 365, 'c.Errors 에 쌓아 두고 로깅은 Logger 미들웨어 한 곳에서', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.1) }); }

  const quiz = [
    { q: 'gin.Default()와 gin.New()의 차이는 무엇인가?',
      o: ['Default는 Logger와 Recovery 미들웨어를 미리 붙인다', 'Default만 r.GET 같은 라우팅을 쓸 수 있다', 'New는 r.Run 없이도 8080을 연다'], a: 0,
      why: 'gin.New()는 미들웨어가 빈 Engine이고, gin.Default()는 같은 Engine에 Logger와 Recovery를 붙여 준다.' },
    { q: 'admin.Use(AuthMiddleware())보다 먼저 admin.GET("/x", h)를 등록하면 /admin/x 요청은 어떻게 되나?',
      o: ['Auth를 거친 뒤 h에 도달한다', 'Auth 없이 바로 h에 도달한다', '등록하는 순간 panic이 난다'], a: 1,
      why: '라우트는 등록 시점의 그룹 체인을 복사해 간다. Use 이전에 등록한 라우트에는 Auth가 없다.' },
    { q: 'Auth가 AbortWithStatusJSON(401)을 부르고 return했다. 바깥 Logger의 c.Next() 다음 줄은 어떻게 되나?',
      o: ['실행되지 않는다', '실행되어 상태 401을 기록한다', 'Auth를 한 번 더 호출한다'], a: 1,
      why: 'Abort는 c.index를 63으로 옮겨 뒤 핸들러만 막는다. 이미 c.Next()를 부른 Logger는 돌아와서 남은 줄을 마저 돈다.' },
    { q: '{"name":"a","email":"x","age":-1}을 ShouldBindJSON(&req)로 받으면 무슨 일이 일어나나?',
      o: ['gin이 400을 쓰고 핸들러는 계속 진행한다', 'Age만 0으로 바뀌고 통과한다', 'err가 돌아오고 핸들러가 400을 쓴 뒤 return한다'], a: 2,
      why: 'min=2, email, gte=0 규칙이 모두 어긋나 err가 생긴다. ShouldBind 계열은 응답을 쓰지 않으므로 400과 return은 핸들러가 맡는다.' },
    { q: '외부 공개 API 응답을 gin.H 대신 UserResp struct로 쓰는 까닭은 무엇인가?',
      o: ['어떤 필드가 나가는지 타입으로 고정되기 때문', 'gin.H는 JSON으로 바꿀 수 없기 때문', 'struct 응답만 상태 코드를 붙일 수 있기 때문'], a: 0,
      why: 'UserResp에 적힌 id, name, email만 나간다. 내부 모델의 다른 필드가 실수로 새어 나가지 않는다.' },
  ];

  const summary = [
    'gin.Default()는 Logger와 Recovery가 붙은 Engine을 만들고, r.Run은 안에서 ListenAndServe를 부른다.',
    'Group은 경로 앞부분과 미들웨어를 묶는다. Use 뒤에 등록한 라우트만 그 미들웨어를 거친다.',
    '미들웨어는 c.Next()로 나머지 체인을 부르고 돌아온다. Abort는 뒤 핸들러만 막는다.',
    'ShouldBindJSON은 binding 태그로 검증하고 err만 준다. 400 응답과 return은 핸들러가 쓴다.',
  ];
  const review = [
    { q: '/admin/stats가 토큰 없이도 200을 돌려준다. 먼저 의심할 것은?',
      o: ['c.JSON에 http.StatusOK를 넣은 것', '라우트를 admin.Use(Auth)보다 먼저 등록한 것', 'ShouldBindJSON을 부르지 않은 것'], a: 1,
      why: '그룹 미들웨어는 Use 이후에 등록한 라우트에만 붙는다. 순서가 바뀌면 Auth 체인을 거치지 않는다.' },
    { q: '직접 만든 Logger가 늘 status 200, latency 0에 가깝게 찍는다. 원인으로 가장 그럴듯한 것은?',
      o: ['c.Next()를 부르기 전에 상태와 시간을 기록한다', 'gin.H로 응답을 만든다', 'RouterGroup을 중첩했다'], a: 0,
      why: '상태 코드와 소요 시간은 c.Next()가 돌아온 뒤에야 확정된다. 그 전에 찍으면 기본값만 보인다.' },
    { q: '검증에 실패한 요청인데도 userService.Create가 불렸다. 빠진 것은?',
      o: ['json 태그', 'binding 태그의 required', '400을 쓴 뒤의 return'], a: 2,
      why: 'c.JSON(400, …)은 응답만 쓰고 함수를 끝내지 않는다. return이 없으면 아래 비즈니스 로직까지 내려간다.' },
  ];

  R.page({ title: 'gin · Engine과 체인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
