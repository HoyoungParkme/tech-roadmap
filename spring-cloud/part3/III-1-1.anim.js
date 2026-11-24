/* III-1-1 Gateway 기본 — 장면 4개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 클라이언트 · Gateway · 서비스 상자, route 표(id | predicates | filters | uri), 요청 카드가 predicate 를 통과하는 모습,
 * pre/post 두 줄을 오가는 필터 체인. 숫자는 페이지 코드(포트·가중치·order)와 STEPS 의 routes/predicates/filters 만 쓴다.
 * requestId·소요 시간 42ms 는 "예시" 로 표시한다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    browser, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 서비스 상자: 왼쪽 램프 + 이름 + 포트
  function node(cx, cy, name, port, o) { o = o || {}; const w = o.w || 200, h = o.h || 42;
    const g = card(cx, cy, w, h, { rx: 8, stroke: o.stroke || INK, sw: o.sw || 2, fill: o.fill, s: o.s, op: o.op });
    el('circle', { cx: -w / 2 + 16, cy: 0, r: 5, fill: o.lamp || GOOD }, g);
    tx(-w / 2 + 30, 5, name, { 'font-size': 15, 'font-weight': 700, fill: o.color || INK }, g);
    if (port) mono(w / 2 - 12, 5, port, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }, g);
    return g; }
  // 요청 카드: [METHOD] path  (x 는 왼쪽 끝, y 는 가운데)
  function req(x, y, method, path, o) { o = o || {}; const fs = o.fs || 14.5, mw = tw(method, fs) + 18, pw = tw(path, fs) + 20, g = R.G(x, y, o.s, o.op);
    el('rect', { x: 0, y: -16, width: mw + pw, height: 32, rx: 7, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    el('rect', { x: 0, y: -16, width: mw, height: 32, rx: 7, fill: o.mcol || INFO }, g);
    mono(mw / 2, 5, method, { 'font-size': fs, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }, g);
    mono(mw + 10, 5, path, { 'font-size': fs, fill: o.pcol || INK }, g); return mw + pw; }
  // 조건 하나: 램프(✓/✗) + 글자
  function cond(x, y, s, ok, op) { if (op <= 0) return; el('circle', { cx: x, cy: y, r: 11, fill: ok ? GOODBG : BADBG, stroke: ok ? GOOD : BAD, 'stroke-width': 2, opacity: op });
    if (ok) check(x, y, 6, op); else cross(x, y, 5, op);
    mono(x + 20, y + 5, s, { 'font-size': 14, fill: ok ? INK : BAD, opacity: op }); }
  const gateway = (cx, cy, o) => { o = o || {}; const g = card(cx, cy, o.w || 130, o.h || 84, { rx: 12, stroke: ACC, sw: 3, fill: ACCBG, s: o.s, op: o.op });
    tx(0, -6, o.name || 'Gateway', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC }, g);
    mono(0, 18, o.port || ':8080', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC }, g); return g; };

  // ---------- 1. 클라이언트 직결 ----------
  const SV = [['user', ':8081'], ['order', ':8082'], ['catalog', ':8083'], ['payment', ':8084'], ['ship', ':8085']];
  const SY = (i) => 66 + i * 64, SX = 815;
  const CFG = ['USER_API', 'ORDER_API', 'CATALOG_API', 'PAYMENT_API', 'SHIP_API'];
  function phone(cx, cy, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op);
    el('rect', { x: -22, y: -38, width: 44, height: 76, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.5 }, g);
    el('line', { x1: -8, y1: 28, x2: 8, y2: 28, stroke: OFF, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    tx(0, 60, '모바일 앱', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }, g); return g; }
  function s1(t, c) { const { k, u } = c;
    browser(62, 110, 96, 70, '브라우저', {}); phone(62, 270, { stroke: k === 2 ? BAD : INK });
    SV.forEach(([n, p], i) => { const hot = k === 2 && i === 1;
      node(SX, SY(i), n + '-service', p, { w: 230, stroke: hot ? BAD : INK, lamp: hot ? BAD : GOOD }); });
    sub(SX, 392, '서비스 8개 중 5개를 그렸다', 1);
    // 설정 카드: 줄마다 해당 서비스로 선이 자란다
    const cfgOp = k === 0 ? 1 : k === 4 ? 0.25 : 0.55;
    zone(130, 40, 360, 230, 'frontend config', { fill: SOFT, stroke: GRID, op: cfgOp });
    CFG.forEach((name, i) => { const y = 84 + i * 38, at = 0.25 + i * 0.4, show = k === 0 ? fade(u, at, 0.3) : 1, lu = k === 0 ? E(u, at + 0.15, at + 0.6) : 1;
      const bad = k === 2 && i === 1;
      mono(146, y + 5, `${name}: …${SV[i][1]}`, { 'font-size': 14.5, fill: bad ? BAD : INK, opacity: show * cfgOp });
      if (k !== 4) { el('line', { x1: 490, y1: y, x2: lerp(490, SX - 117, lu), y2: lerp(y, SY(i), lu), stroke: bad ? BAD : MUT, 'stroke-width': 1.8, opacity: show * (k === 0 ? 1 : 0.6) }); } });
    if (k === 0) { note(146, 300, '클라이언트가 호스트 5개를 직접 안다', fade(u, 2.3), { fill: BAD }); return; }
    if (k === 1) { SV.forEach((_, i) => { const at = 0.2 + i * 0.3;
        pill(SX - 40, SY(i) - 28, 'CORS', WARN, pop(u, at), { fs: 13.5, fill: PANEL }); pill(SX + 40, SY(i) - 28, 'JWT 검증', BAD, pop(u, at + 0.15), { fs: 13.5, fill: PANEL }); });
      card(310, 330, 330, 64, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.9), text: 'CORS 설정 8벌 · JWT 검증 코드 8벌\n한 줄 고치면 8번 배포', fs: 15, color: BAD });
      return; }
    if (k === 2) { el('rect', { x: 690, y: 30, width: 260, height: 340, rx: 14, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: fade(u, 0.2) });
      tx(940, 24, '인터넷에 그대로 노출', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.3) });
      pill(SX, SY(1) + 30, 'order 를 둘로 쪼개면?', BAD, pop(u, 0.8), { fs: 13.5, fill: PANEL });
      card(310, 330, 330, 64, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.5), text: '공개 엔드포인트 8개 · 인증서 8벌\n모바일 앱은 강제 업데이트', fs: 15, color: BAD });
      cross(98, 248, 10, pop(u, 1.9)); return; }
    if (k === 3) { // 화면 하나에 API 5번 왕복 (100ms × 5)
      const x0 = 160, W = 420, Y0 = 296; tx(x0, Y0 - 12, '화면 1개 = API 5번 왕복', { 'font-size': 14.5, 'font-weight': 700 });
      for (let i = 0; i < 5; i++) { const f = E(u, 0.2 + i * 0.35, 0.5 + i * 0.35); if (f <= 0) continue;
        el('rect', { x: x0 + i * W / 5, y: Y0 + i * 12, width: (W / 5 - 4) * f, height: 10, rx: 3, fill: WARN }); }
      const ms = Math.round(100 * clamp((u - 0.2) / 1.75 * 5, 0, 5));
      mono(x0 + W + 12, Y0 + 42, ms + 'ms', { 'font-size': 20, 'font-weight': 800, fill: BAD });
      mono(x0, Y0 + 82, 'if (ver === 2) …   v1/v2 분기도 클라이언트 몫', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); return; }
    // k4: Gateway 가 앞에 선다
    const gx = 560, gy = 200, s = pop(u, 0.2);
    gateway(gx, gy, { s });
    [[110, 110], [84, 262]].forEach(([x, y], i) => grow(x, y, gx - 66, gy + (i ? 16 : -16), E(u, 0.5, 1.1), ACC, { sw: 2.6 }));
    SV.forEach((_, i) => grow(gx + 66, gy, SX - 117, SY(i), E(u, 0.9 + i * 0.12, 1.4 + i * 0.12), ACC, { sw: 2 }));
    mono(146, 300, 'API: gateway:8080 한 줄', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
    banner(310, 360, '문제 6개의 공통 원인 = 앞단이 없다', pop(u, 1.9)); }

  // ---------- 2. Route 정의 (application.yml) ----------
  const ROUTES = [
    { id: 'user-route', pr: ['Path=/api/users/**'], fl: ['StripPrefix=1'], uri: 'user-service:8081' },
    { id: 'order-route', pr: ['Path=/api/orders/**', 'Method=GET,POST'], fl: ['StripPrefix=1', 'AddRequestHeader'], uri: 'order-service:8082' },
    { id: 'catalog-route', pr: ['Path=/api/products/**'], fl: ['StripPrefix=1', 'AddResponseHeader ↩'], uri: 'catalog-service:8083' },
    { id: 'payment-route', pr: ['Path=/api/payments/**', 'Header=X-Tenant, .+'], fl: ['StripPrefix=1'], uri: 'payment-service:8084' },
  ];
  const RY = (i) => 78 + i * 64, COL = { id: 248, pr: 382, fl: 594, uri: 786 };
  function chip(x, y, s, col, o) { o = o || {}; const w = tw(s, 13.5) + 16;
    el('rect', { x, y: y - 12, width: w * (o.f ?? 1), height: 24, rx: 5, fill: o.fill || PANEL, stroke: col, 'stroke-width': 1.6, opacity: o.op ?? 1 });
    if ((o.f ?? 1) > 0.95) mono(x + 8, y + 5, s, { 'font-size': 13.5, fill: o.color || col, opacity: o.op ?? 1 }); return w; }
  function routeRow(i, f, o) { o = o || {}; const r = ROUTES[i], y = RY(i), op = o.op ?? 1, n = r.pr.length > 1 || r.fl.length > 1 ? 2 : 1;
    el('rect', { x: 236, y: y - 30, width: 712, height: 58, rx: 8, fill: o.hot ? ACCBG : PANEL, stroke: o.hot ? ACC : GRID, 'stroke-width': o.hot ? 2.5 : 1.5, opacity: op * clamp(f * 4) });
    mono(COL.id, y + 5, r.id, { 'font-size': 14.5, 'font-weight': 800, opacity: op * clamp(f * 4 - 0.5) });
    const yy = (j, m) => (m > 1 ? y - 13 + j * 26 : y);
    r.pr.forEach((s, j) => chip(COL.pr, yy(j, r.pr.length), s, INFO, { f: clamp(f * 4 - 1 - j * 0.4), op, fill: o.okPr ? GOODBG : null, color: o.okPr ? GOOD : INFO }));
    r.fl.forEach((s, j) => chip(COL.fl, yy(j, r.fl.length), s, WARN, { f: clamp(f * 4 - 2 - j * 0.4), op }));
    const uf = clamp(f * 4 - 3);
    if (uf > 0) mono(COL.uri, y + 5, '→ ' + r.uri, { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: op * uf }); return n; }
  function counters(c, y) { const b = c.beat, p = c.prev || {};
    [['route', 'routes'], ['predicate', 'predicates'], ['filter', 'filters']].forEach(([name, key], i) => { const v = Math.round(tween(p[key], b[key], c.u));
      tx(40 + i * 0, y + i * 30, name, { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      mono(190, y + i * 30, String(v), { 'font-size': 18, 'font-weight': 800, fill: INK, 'text-anchor': 'end' }); }); }
  function s2(t, c) { const { k, u } = c;
    gateway(110, 120, { s: k === 0 ? pop(u, 0.2) : 1, name: 'api-gateway' });
    sub(110, 190, '외부에 여는 포트는 이것 하나', k === 0 ? fade(u, 0.8) : 1);
    [['id', COL.id], ['predicates (AND)', COL.pr], ['filters', COL.fl], ['uri', COL.uri]].forEach(([s, x]) => tx(x, 36, s, { 'font-size': 14, 'font-weight': 700, fill: MUT }));
    counters(c, 270);
    const nShown = Math.min(k, 4);
    for (let i = 0; i < 4; i++) {
      if (i >= nShown && k < 6) { el('rect', { x: 236, y: RY(i) - 30, width: 712, height: 58, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '6 6', opacity: k === 0 ? fade(u, 0.5 + i * 0.2) : 1 }); continue; }
      const f = i === k - 1 && k <= 4 ? E(u, 0.2, 2.2) : 1;
      const hot = k === 6 && i === 1 && u > 1.0, dim = k === 6 && i !== 1 && u > 1.0;
      routeRow(i, f, { hot, op: dim ? 0.35 : 1, okPr: hot }); }
    if (k === 0) { mono(260, RY(1) + 5, 'routes: [ ]   아직 비어 있다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); return; }
    if (k === 2) note(COL.pr, 352, '조건 2개 = AND · 둘 다 맞아야 매칭', fade(u, 1.9), { fill: INFO });
    if (k === 3) note(COL.fl, 352, '↩ 표시는 응답이 돌아올 때(Post) 붙는다', fade(u, 1.9), { fill: WARN });
    if (k === 4) note(COL.pr, 352, 'X-Tenant 헤더가 없으면 이 route 는 건너뛴다', fade(u, 1.9), { fill: INFO });
    if (k >= 5) { const f = k === 5 ? E(u, 0.2, 1.4) : 1;
      el('rect', { x: 236, y: 336, width: 712 * f, height: 34, rx: 8, fill: WARNBG, stroke: WARN, 'stroke-width': 1.8 });
      if (f > 0.9) mono(250, 358, 'default-filters · AddResponseHeader=X-Powered-By  → 모든 route', { 'font-size': 14, fill: WARN, 'font-weight': 700 }); }
    if (k === 6) { // GET /api/orders/42 가 표를 위에서부터 훑는다
      const scan = E(u, 0.1, 0.9); req(232, 398, 'GET', '/api/orders/42', { s: 1 });
      el('rect', { x: 232, y: RY(0) - 30 + scan * 64, width: 6, height: 58, rx: 3, fill: INFO, opacity: u < 1.0 ? 1 : 0 });
      if (u > 0.45) cross(226, RY(0), 8, 1);
      if (u > 1.0) check(226, RY(1), 9, 1);
      const p1 = u < 1.6 ? '/api/orders/42' : '/orders/42';
      mono(560, 404, u < 1.6 ? '' : '→ ' + p1 + '  + X-Gateway', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); } }

  // ---------- 3. Predicate 종류 (Java DSL) ----------
  const DSL = ['orders-write', 'checkout-canary', 'checkout-stable', 'search-stable', 'search-canary', 'tenant-acme', 'debug-route', 'new-feature'];
  const NOW = [0, 1, 2, 3, 4, 5, 6, 7, 8, 8];   // beat k 에서 등록된 route 수
  function dslList(k, u) { mono(24, 44, 'builder.routes()', { 'font-size': 14.5, 'font-weight': 700 });
    const n = NOW[k];
    DSL.forEach((id, i) => { if (i >= n) return; const isNew = i === n - 1 && k >= 1 && k <= 8, y = 76 + i * 34, s = isNew ? pop(u, 0.15) : 1;
      card(130, y, 200, 28, { rx: 6, s, stroke: isNew ? ACC : GRID, fill: isNew ? ACCBG : PANEL, sw: isNew ? 2.2 : 1.5 });
      mono(40, y + 5, `${i + 1}`, { 'font-size': 13.5, fill: MUT, opacity: s }); mono(60, y + 5, id, { 'font-size': 14, 'font-weight': 700, fill: isNew ? ACC : INK, opacity: s }); });
    if (k >= 8) mono(24, 368, '.build()', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: k === 8 ? fade(u, 2.0) : 1 });
    el('line', { x1: 260, y1: 30, x2: 260, y2: 400, stroke: GRID, 'stroke-width': 1.5 }); }
  // 요청 카드가 조건 상자를 지나 목적지로 간다
  function trial(y, m, path, conds, ok, dest, u, at, o) { o = o || {};
    const w = req(290, y, m, path, { s: pop(u, at), mcol: o.mcol }), ax = 290 + w + 12;
    conds.forEach(([s, good], j) => cond(300, y + 34 + j * 28, s, good, fade(u, at + 0.4 + j * 0.3)));
    const end = at + 0.6 + conds.length * 0.3;
    if (ok) { grow(ax, y, ax + 80, y, E(u, end, end + 0.4), ACC); if (u > end + 0.4) mono(ax + 92, y + 5, dest, { 'font-size': 14.5, 'font-weight': 800, fill: ACC }); }
    else { if (u > end) mono(ax + 10, y + 5, dest || '다음 route 로', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); }
    return ax; }
  function s3(t, c) { const { k, u } = c; dslList(k, u);
    if (k === 0) { card(600, 200, 560, 170, { rx: 12, stroke: GRID, dash: '7 6', fill: PANEL, sw: 2 });
      mono(600, 186, 'RouteLocator routes(RouteLocatorBuilder b)', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      tx(600, 222, '조건을 코드로 계산할 수 있는 자리 · 아직 route 0개', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) }); return; }
    if (k === 1) { trial(70, 'POST', '/api/orders/7', [['path /api/orders/**', true], ['method POST·PUT·DELETE', true]], true, 'order-service:8082', u, 0.2);
      trial(230, 'GET', '/api/orders/7', [['path /api/orders/**', true], ['method POST·PUT·DELETE', false]], false, '다음 route 로', u, 1.1, { mcol: MUT });
      return; }
    if (k === 2) { trial(90, 'GET', '/api/checkout/1', [['path /api/checkout/**', true], ['header X-AB-Group = canary', true]], true, 'checkout-v2:9000', u, 0.2);
      note(290, 260, '카나리 그룹 헤더가 붙은 요청만 신버전을 본다', fade(u, 2.0)); return; }
    if (k === 3) { // 헤더 없는 요청: 2번(canary) ✗ → 3번(stable) ✓
      req(290, 70, 'GET', '/api/checkout/1', { s: pop(u, 0.2) }); sub(560, 75, '(X-AB-Group 없음)', fade(u, 0.3), { 'text-anchor': 'start' });
      cond(300, 130, '2 checkout-canary · header ✗', false, fade(u, 0.6));
      cond(300, 166, '3 checkout-stable · 조건 없음 ✓', true, fade(u, 1.1));
      grow(640, 166, 760, 166, E(u, 1.4, 1.8), ACC); if (u > 1.8) mono(770, 171, 'checkout-v1:8000', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
      card(600, 300, 600, 70, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 2.0), text: '순서가 우선순위 · 조건 없는 route 를 위에 두면\n아래 canary 는 영원히 걸리지 않는다', fs: 14.5, color: INK }); return; }
    if (k === 4 || k === 5) { // Weight: search-group 안에서 90 : 10
      tx(290, 60, 'search-group', { 'font-size': 15, 'font-weight': 700 });
      const W = 560, x0 = 290, f90 = k === 4 ? E(u, 0.3, 1.3) : 1, f10 = k === 5 ? E(u, 0.3, 1.0) : k > 5 ? 1 : 0;
      const tot = k === 4 ? 90 : 100;
      el('rect', { x: x0, y: 76, width: W * (90 / tot) * f90, height: 34, rx: 6, fill: INFO, opacity: 0.85 });
      if (f90 > 0.9) mono(x0 + 12, 99, 'search-stable 90', { 'font-size': 15, 'font-weight': 800, fill: PANEL });
      if (k === 5) { el('rect', { x: x0 + W * 0.9 + 3, y: 76, width: (W * 0.1 - 3) * f10, height: 34, rx: 6, fill: ACC });
        mono(x0 + W, 136, 'search-canary 10', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.0) }); }
      // 요청 100건 격자: 요청마다 무작위로 group 안에서 고른다 (그림은 10건 중 1건꼴로 칠한 예시)
      const n = k === 4 ? 0 : Math.round(lerp(0, 100, E(u, 1.0, 2.4)));
      for (let i = 0; i < 100; i++) { const x = x0 + (i % 20) * 28, y = 170 + Math.floor(i / 20) * 28, can = k === 5 && i % 10 === 7;
        el('rect', { x, y, width: 22, height: 22, rx: 4, fill: i < n ? (can ? ACC : INFO) : SOFT, opacity: i < n ? (can ? 1 : 0.5) : 1 }); }
      if (k === 4) note(x0, 336, '같은 group 이름끼리 가중치로 나눈다 · 합이 100 일 필요는 없다', fade(u, 1.5));
      else sub(x0 + 280, 336, '요청 100건 중 약 10건이 canary (요청마다 무작위, 그림은 예시)', fade(u, 2.2), { 'font-size': 14 });
      return; }
    if (k === 6) { trial(80, 'GET', '/  Host: acme.example.com', [['host acme.example.com', true]], true, 'acme-backend:8090', u, 0.2);
      trial(220, 'GET', '/  Host: other.example.com', [['host acme.example.com', false]], false, '다음 route 로', u, 1.1, { mcol: MUT });
      note(290, 340, 'path 와 상관없이 도메인으로 가른다', fade(u, 2.2)); return; }
    if (k === 7) { const ax = trial(80, 'GET', '/api/search?debug=true', [['query debug = true', true]], true, 'debug-mirror:9999', u, 0.2);
      if (u > 1.4) pill(ax + 170, 122, '+ X-Verbose: 1', WARN, pop(u, 1.4), { mono: true, fs: 13.5, fill: PANEL });
      trial(230, 'GET', '/api/search?q=shoes', [['query debug = true', false]], false, '다음 route 로', u, 1.4, { mcol: MUT }); return; }
    if (k === 8) { // After: 시각 축
      const ax0 = 300, ax1 = 900, y = 200, mk = lerp(ax0, ax1, 0.5);
      el('line', { x1: ax0, y1: y, x2: lerp(ax0, ax1, E(u, 0.1, 0.8)), y2: y, stroke: MUT, 'stroke-width': 2 });
      el('line', { x1: mk, y1: y - 40, x2: mk, y2: y + 40, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 0.6) });
      mono(mk, y - 50, '2026-06-01T00:00+09:00', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      tx(lerp(ax0, mk, 0.5), y + 34, '이전: 매칭 안 됨', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(lerp(mk, ax1, 0.5), y + 34, '이후: recommendations-v2', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      for (let i = 0; i < 8; i++) { const x = ax0 + 30 + i * 74, on = x > mk; if (fade(u, 0.9 + i * 0.12) <= 0) continue;
        el('circle', { cx: x, cy: y, r: 7, fill: on ? ACC : OFF, opacity: fade(u, 0.9 + i * 0.12) }); }
      note(300, 320, '출시 시각에 설정 변경 없이 새 백엔드로 넘어간다', fade(u, 2.2)); return; }
    // k9: predicate 12종
    const P12 = [['Path', 1], ['Method', 1], ['Header', 1], ['Weight', 1], ['Host', 1], ['Query', 1], ['After', 1],
      ['Cookie', 0], ['RemoteAddr', 0], ['XForwardedRemoteAddr', 0], ['Before', 0], ['Between', 0]];
    tx(290, 54, '내장 predicate 12종 · 전부 AND 로 조합', { 'font-size': 16, 'font-weight': 800 });
    P12.forEach(([s, used], i) => { const col = i % 3, row = Math.floor(i / 3), cx = 390 + col * 220, cy = 100 + row * 62, sc = pop(u, 0.2 + i * 0.1);
      card(cx, cy, 200, 44, { rx: 8, s: sc, stroke: used ? ACC : GRID, fill: used ? ACCBG : PANEL, sw: used ? 2.2 : 1.5, text: s, fs: s.length > 12 ? 13.5 : 15, mono: true, color: used ? ACC : INK }); });
    pill(400, 372, '이 장에서 쓴 7종', ACC, pop(u, 1.6), { fs: 14, fill: ACCBG }); pill(620, 372, '아직 안 쓴 5종', MUT, pop(u, 1.8), { fs: 14 }); }

  // ---------- 4. Filter — GlobalFilter ----------
  const L = { cx: 60, gx0: 150, gx1: 780, bx: 880, yq: 140, yr: 260 };
  function lanes(op) {
    el('line', { x1: L.cx + 20, y1: L.yq, x2: L.bx - 52, y2: L.yq, stroke: GRID, 'stroke-width': 2.5, opacity: op });
    el('line', { x1: L.bx - 52, y1: L.yr, x2: L.cx + 20, y2: L.yr, stroke: GRID, 'stroke-width': 2.5, opacity: op });
    tx(L.gx0 + 10, L.yq - 50, '요청 →  Pre', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: op });
    tx(L.gx0 + 10, L.yr + 58, '←  응답  Post', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: op });
    R.person(L.cx, 200, '클라이언트', { op }); R.server(L.bx, 200, 'order-service', { op, lamp: GOOD }); }
  function globalRing(op, f) { el('rect', { x: L.gx0, y: 70, width: (L.gx1 - L.gx0) * (f ?? 1), height: 260, rx: 16, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: op });
    if ((f ?? 1) > 0.95) tx(L.gx1 - 12, 62, 'RequestIdGlobalFilter · order -100', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: op }); }
  function routeFilters(op) { [['StripPrefix=1', 470], ['AddRequestHeader', 640]].forEach(([s, x]) => card(x, L.yq, 150, 34, { rx: 6, text: s, fs: 13.5, mono: true, stroke: WARN, color: WARN, op }));
    card(555, L.yr, 170, 34, { rx: 6, text: 'X-Powered-By ↩', fs: 13.5, mono: true, stroke: WARN, color: WARN, op }); }
  function stopwatch(x, y, ms, on) { clock(x, y, 22, on ? clamp(ms / 60) : 0, ACC); mono(x + 32, y + 6, ms == null ? 'start' : `${Math.round(ms)}ms`, { 'font-size': 16, 'font-weight': 800, fill: ACC }); }
  const RID = 'rid=3f2a…';
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { // 4개 route 를 하나로 감싸는 글로벌 필터
      ROUTES.forEach((r, i) => { const y = 110 + i * 60; card(480, y, 380, 44, { rx: 8, stroke: GRID, s: pop(u, 0.1 + i * 0.1), text: `${r.id}  →  ${r.uri}`, fs: 14, mono: true, fw: 600 }); });
      const f = E(u, 0.8, 1.8); el('rect', { x: 270, y: 72, width: 420 * f, height: 236, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 3 });
      if (f > 0.95) { tx(480, 334, '@Component GlobalFilter · route 설정은 그대로', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); }
      return; }
    if (k === 5) { // getOrder: 낮을수록 먼저
      const x0 = 120, x1 = 860, y = 210; el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: MUT, 'stroke-width': 2 });
      grow(x0, y + 50, x1, y + 50, E(u, 0.3, 1.2), MUT); tx(x0, y + 78, '실행 순서: order 값이 낮을수록 먼저', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
      [[-100, 'RequestId', ACC, 170], [-50, 'JWT 인증 (III-1-2)', INFO, 360], ['1, 2…', '라우트 필터', WARN, 560], [null, '백엔드 호출', INK, 780]].forEach(([v, s, col, x], i) => { const sc = pop(u, 0.4 + i * 0.35);
        el('circle', { cx: x, cy: y, r: 9 * sc, fill: col }); if (sc < 0.5) return;
        mono(x, y - 22, v == null ? '마지막' : String(v), { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle' });
        tx(x, y + 30, s, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col }); });
      return; }
    if (k === 6) { // 자주 쓰는 내장 필터 8종
      const F8 = [['AddRequest/ResponseHeader', '헤더'], ['RewritePath', '경로'], ['StripPrefix/PrefixPath', '경로'], ['SetStatus', '응답'],
        ['CircuitBreaker', '보호'], ['Retry', '보호'], ['RequestRateLimiter', '보호'], ['SaveSession/TokenRelay', 'OAuth2']];
      tx(480, 46, '직접 만들기 전에 내장부터 · 30개 넘게 있다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
      F8.forEach(([s, kind], i) => { const cx = 250 + (i % 2) * 460, cy = 96 + Math.floor(i / 2) * 70, sc = pop(u, 0.2 + i * 0.15), col = kind === '보호' ? BAD : kind === '경로' ? INFO : WARN;
        card(cx, cy, 420, 52, { rx: 8, s: sc, stroke: col, sw: 1.8 });
        mono(cx - 196, cy + 5, s, { 'font-size': 15, 'font-weight': 700, opacity: sc > 0.5 ? 1 : 0 });
        tx(cx + 196, cy + 5, kind, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: sc > 0.5 ? 1 : 0 }); });
      return; }
    if (k === 7) { // 글로벌 vs 라우트별
      const cols = [['인증', 'g'], ['트레이싱', 'g'], ['AddRequestHeader', 'r'], ['AddResponseHeader', 'r']], rows = ROUTES.map((r) => r.id);
      const has = (ri, ci) => ci < 2 || (ci === 2 && ri === 1) || (ci === 3 && ri === 2);
      cols.forEach(([s, kind], ci) => tx(370 + ci * 150, 70, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: kind === 'g' ? ACC : WARN }));
      rows.forEach((id, ri) => { const y = 100 + ri * 56; mono(270, y + 24, id, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end' });
        cols.forEach(([, kind], ci) => { const on = has(ri, ci), f = pop(u, 0.3 + ci * 0.35 + ri * 0.08);
          el('rect', { x: 310 + ci * 150, y: y + 4, width: 120, height: 40, rx: 6, fill: on ? (kind === 'g' ? ACC : WARN) : SOFT, opacity: on ? 0.85 * clamp(f) : 1 }); }); });
      tx(440, 352, '모든 요청에 필요 → 글로벌 필터', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(745, 352, '일부 route 만 → 라우트별', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      return; }
    // k 1~4: 요청 한 건이 글로벌 필터 안팎을 오간다
    lanes(1); globalRing(1, 1); if (k !== 2) routeFilters(k >= 3 ? 1 : 0.35);
    if (k === 1) { req(160, L.yq, 'GET', '/api/orders/42', { s: pop(u, 0.2) });
      stopwatch(300, 210, null, false);
      mono(400, 216, `requestId = ${RID.slice(4)} (예시)`, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); return; }
    if (k === 2) { // 불변 request → mutate() 로 새 요청
      const a = fade(u, 0.2); card(270, 200, 210, 96, { rx: 8, stroke: GRID, op: a, fill: PANEL });
      mono(180, 176, 'GET /api/orders/42', { 'font-size': 14, opacity: a }); mono(180, 200, 'Host: …', { 'font-size': 14, fill: MUT, opacity: a });
      if (u > 0.8) cross(360, 166, 9, pop(u, 0.8)); sub(270, 268, '원본은 불변', fade(u, 0.9));
      grow(380, 200, 440, 200, E(u, 1.2, 1.6), ACC);
      const b = pop(u, 1.6); card(560, 200, 230, 110, { rx: 8, stroke: ACC, sw: 2.5, s: b, fill: ACCBG });
      if (b > 0.5) { mono(458, 170, 'GET /api/orders/42', { 'font-size': 14 }); mono(458, 194, 'Host: …', { 'font-size': 14, fill: MUT }); mono(458, 222, '+ X-Request-Id', { 'font-size': 14.5, 'font-weight': 800, fill: ACC }); }
      return; }
    if (k === 3) { // chain.filter() → 백엔드 → then()
      const route = [[L.cx + 24, L.yq], [L.bx - 52, L.yq], [L.bx - 52, L.yr], [L.cx + 24, L.yr]];
      dot(route, seg(u, 0.2, 2.2), ACC, 8);
      const ms = 42 * E(u, 0.2, 2.2); stopwatch(300, 200, ms, true);
      if (u > 1.2) pill(L.bx - 140, L.yr - 30, 'status 200', GOOD, pop(u, 1.2), { mono: true, fs: 13.5, fill: PANEL });
      sub(340, 236, '소요 시간은 예시 값', fade(u, 2.2)); return; }
    // k4: 한 줄 접근 로그
    stopwatch(300, 200, 42, true);
    terminal(160, 330, 660, 84, ['$ tail gateway.log', [`${RID} path=/api/orders/42 status=200 elapsed=42ms`, null]], k === 4 ? lerp(1, 2, E(u, 0.3, 1.8)) : 2, { title: '예시 로그' }); }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: 'Gateway 없이 클라이언트가 서비스를 직접 부를 때 생기는 문제의 공통 원인은 무엇인가?',
      o: ['서비스 수가 너무 많다', '요청을 한곳에서 받아 처리할 앞단이 없다', '서비스마다 언어가 다르다'], a: 1,
      why: 'CORS·인증 8벌, 노출 8개, 왕복 500ms 모두 요청을 모아 줄 단일 진입점이 없어서 생긴다.' },
    { q: 'order-route에 Path=/api/orders/** 와 Method=GET,POST를 함께 걸었다. DELETE /api/orders/42는 어떻게 되나?',
      o: ['order-route로 간다', 'Gateway가 DELETE를 POST로 바꿔 보낸다', 'Method가 맞지 않아 order-route를 건너뛴다'], a: 2,
      why: 'predicate를 여러 개 쓰면 AND다. 하나라도 맞지 않으면 그 route는 선택되지 않는다.' },
    { q: 'search-stable에 weight 90, search-canary에 weight 10을 주면 무엇이 일어나는가?',
      o: ['요청 약 10%가 search-canary로 간다', '10번째 요청마다 정확히 canary로 간다', '두 route가 같은 요청을 둘 다 받는다'], a: 0,
      why: '같은 group 안에서 가중치 비율로 요청마다 고른다. 90:10이면 약 10%가 canary로 흐른다.' },
    { q: 'RequestIdGlobalFilter에서 응답 시간을 재는 코드는 어디에 있어야 하나?',
      o: ['chain.filter() 호출 앞', 'getOrder() 안', 'chain.filter(...).then(...) 안'], a: 2,
      why: 'chain.filter() 앞은 Pre, then() 안은 응답이 끝난 뒤 실행되는 Post다. 끝난 뒤에 재야 소요 시간이 맞다.' },
  ];

  const summary = [
    '클라이언트가 서비스를 직접 부르면 CORS·인증·노출 관리가 서비스 수만큼 늘어난다.',
    'Gateway는 8080 한 포트로 요청을 받고 route 표에서 첫 매칭을 골라 보낸다.',
    'route는 id, uri, predicates, filters로 이루어지고 predicate 여러 개는 AND로 묶인다.',
    'Weight로 90:10 카나리를, Header·Host·After로 A/B·테넌트·출시 시각 분기를 설정 한 줄로 건다.',
  ];
  const review = [
    { q: 'checkout-stable(조건 없음)을 checkout-canary보다 위에 선언했더니 canary 헤더를 붙여도 신버전으로 가지 않는다. 원인은?',
      o: ['Header predicate가 정규식을 지원하지 않는다', 'StripPrefix가 헤더를 지운다', '위에 있는 조건 없는 route가 먼저 매칭되어 아래 route가 평가되지 않는다'], a: 2,
      why: 'route는 선언 순서대로 평가하고 첫 매칭이 이긴다. 좁은 조건을 위에 둬야 한다.' },
    { q: '모든 route에 X-Request-Id를 붙이고 접근 로그를 남기려 한다. 가장 알맞은 방법은?',
      o: ['GlobalFilter 하나를 @Component로 등록한다', 'route 네 곳에 AddRequestHeader를 하나씩 적는다', '각 서비스 컨트롤러에서 로그를 찍는다'], a: 0,
      why: '모든 요청에 필요한 횡단 관심사는 GlobalFilter로 한 곳에서 처리한다. route 설정은 건드리지 않아도 된다.' },
    { q: 'GET /api/orders/42가 들어왔다. order-route를 지나 order-service에 도착하는 경로는 무엇인가?',
      o: ['/api/orders/42', '/orders/42', '/42'], a: 1,
      why: 'StripPrefix=1이 앞 조각 /api 하나를 떼므로 http://order-service:8082/orders/42로 간다.' },
  ];

  R.page({ title: 'Gateway 라우팅 시뮬레이션', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
