/* III-1-3 Route Predicate & Filter — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: Route 카드의 4칸(id·uri·predicates·filters), 요청 카드가 predicate 램프를 지나는 AND 판정,
 * 경로 문자열이 StripPrefix·RewritePath 를 지나며 바뀌는 모습, pre → 프록시 → post 양파 껍질.
 * 판정·필터 목록은 STEPS 의 request / predicates / filters / target 을 그대로 읽는다.
 * 경로 변환 결과(/orders/42, /v2/users/7, RewritePath 불일치)는 파이썬 정규식으로 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, server, cross, check, clock, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function req(x, y, method, path, o) { o = o || {}; const fs = o.fs || 14.5, mw = tw(method, fs) + 16, pw = tw(path, fs) + 18, g = R.G(x, y, o.s, o.op);
    el('rect', { x: 0, y: -16, width: mw + pw, height: 32, rx: 7, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    el('rect', { x: 0, y: -16, width: mw, height: 32, rx: 7, fill: o.mcol || INFO }, g);
    mono(mw / 2, 5, method, { 'font-size': fs, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }, g);
    mono(mw + 9, 5, path, { 'font-size': fs, fill: o.pcol || INK }, g); return mw + pw; }
  function lampRow(x, y, ok, s, op) { el('circle', { cx: x, cy: y, r: 11, fill: ok ? GOODBG : BADBG, stroke: ok ? GOOD : BAD, 'stroke-width': 2, opacity: op });
    if (ok) check(x, y, 6, op); else cross(x, y, 5, op);
    mono(x + 22, y + 5, s, { 'font-size': 14.5, fill: ok ? INK : BAD, opacity: op }); }
  // 경로 문자열 상자
  function pathBox(cx, cy, s, o) { o = o || {}; card(cx, cy, tw(s, 15) + 28, 36, { rx: 8, text: s, fs: 15, mono: true, stroke: o.col || INK, color: o.col || INK, fill: o.fill, s: o.s, op: o.op }); }
  // 필터 관문 (가로)
  function gate(cx, cy, s, col, o) { o = o || {}; card(cx, cy, o.w || tw(s, 14) + 26, 44, { rx: 8, text: s, fs: o.fs || 14, mono: true, stroke: col || WARN, color: col || WARN, fill: o.fill || PANEL, s: o.s, op: o.op, sw: 2.2 }); }

  // ---------- 1. Route 의 4요소 ----------
  const RC = { x: 330, y: 50, w: 330, rh: 58 };
  function slot(i, key, val, f, o) { o = o || {}; const y = RC.y + i * (RC.rh + 10);
    el('rect', { x: RC.x, y, width: RC.w, height: RC.rh, rx: 8, fill: f > 0 ? (o.fill || PANEL) : 'none', stroke: f > 0 ? (o.col || INK) : GRID, 'stroke-width': f > 0 ? 2.2 : 1.5, 'stroke-dasharray': f > 0 ? null : '6 5' });
    tx(RC.x + 14, y + 22, `${i + 1}) ${key}`, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (val) mono(RC.x + 14, y + 46, f >= 1 ? val : val.slice(0, Math.round(val.length * f)), { 'font-size': 15, 'font-weight': 700, fill: o.col || INK }); }
  function s1(t, c) { const { k, u } = c;
    const f = (i) => (k > i ? 1 : k === i ? E(u, 0.2, 1.2) : 0);
    slot(0, 'id', 'order-route', f(0));
    slot(1, 'uri', 'http://order-service:8082', f(1), { col: ACC });
    slot(2, 'predicates (AND)', k >= 2 ? 'Path=/api/orders/**' : '', f(2), { col: INFO });
    slot(3, 'filters', k >= 3 ? 'StripPrefix=1' : '', f(3), { col: WARN });
    server(860, 175, 'order-service:8082', { lamp: GOOD });
    if (k === 0) { mono(40, 380, 'log · routeId=order-route', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) });
      note(40, 340, 'id 는 이름표 · 라우팅 판정에는 쓰이지 않는다', fade(u, 1.8)); }
    if (k >= 1) grow(RC.x + RC.w, RC.y + 97, 800, 175, k === 1 ? E(u, 0.8, 1.4) : 1, ACC, { op: k === 1 ? 1 : 0.6 });
    if (k === 1) { mono(700, 330, 'lb://ORDER-SERVICE', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      sub(800, 356, '고정 주소 대신 서비스 이름 · 디스커버리로 고른다', fade(u, 1.8), { 'font-size': 14 }); }
    // 요청 카드
    if (k >= 2) { const into = k === 2 ? E(u, 0.3, 1.2) : 1, y = 175, x = lerp(20, 30, into);
      req(x, k === 2 ? lerp(330, 210, into) : 210, 'GET', k >= 3 && (k > 3 || u > 1.6) ? '/orders/42' : '/api/orders/42', { s: 1, pcol: k >= 3 ? ACC : INK });
      if (k === 2 && u > 1.3) { check(RC.x - 20, RC.y + 2 * 68 + 29, 10, pop(u, 1.3)); note(40, 300, '이 순간부터 이 Route 가 선택된다', fade(u, 1.6), { fill: GOOD }); } }
    if (k === 3) { // /api 를 떼어낸다
      mono(40, 300, '/api/orders/42', { 'font-size': 17, 'font-weight': 700 });
      el('line', { x1: 38, y1: 294, x2: 38 + tw('/api', 17) * E(u, 0.4, 1.0), y2: 294, stroke: BAD, 'stroke-width': 3 });
      grow(40, 320, 40, 350, E(u, 1.0, 1.3), MUT); mono(40, 380, '/orders/42', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      sub(240, 380, '매칭 뒤 pre 단계에서', fade(u, 1.8), { 'text-anchor': 'start' }); }
    if (k === 4) { dot([[200, 210], [RC.x, RC.y + 165], [RC.x + RC.w, RC.y + 230], [800, 175]], seg(u, 0.2, 1.6), ACC, 8);
      const s = 'http://order-service:8082/orders/42', n = Math.round(s.length * E(u, 1.4, 2.4));
      mono(330, 345, s.slice(0, n), { 'font-size': 16, 'font-weight': 800, fill: ACC });
      sub(480, 380, '요청 → Path 매칭 → Route 선택 → StripPrefix → 프록시', fade(u, 2.2), { 'font-size': 14.5 }); } }

  // ---------- 2. Predicate — AND 판정 (STEPS 의 predicates 를 그대로) ----------
  function s2(t, c) { const { k, u } = c, b = c.beat, prev = (c.prev && c.prev.predicates) || [];
    req(30, 60, b.request.method, b.request.path, { pcol: k === 4 && u > 0.3 ? ACC : INK });
    mono(40, 110, 'X-Tenant: acme', { 'font-size': 14, fill: MUT }); mono(40, 134, 'Host: api.example.com', { 'font-size': 14, fill: MUT });
    tx(40, 160, '헤더 값은 예시', { 'font-size': 13.5, fill: MUT });
    tx(400, 44, 'predicates · 줄마다 AND', { 'font-size': 15, 'font-weight': 700 });
    const P = b.predicates.filter((p) => p.label !== '(미선언)');
    if (!P.length) { el('rect', { x: 390, y: 64, width: 520, height: 44, rx: 8, fill: 'none', stroke: GRID, 'stroke-dasharray': '6 5', 'stroke-width': 1.5 });
      mono(410, 92, '- (조건 0개)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3) });
      note(400, 300, '판정할 조건이 아직 없다', fade(u, 1.0), { fill: MUT }); return; }
    const pc = prev.filter((q) => q.label !== '(미선언)').length, RH = P.length > 4 ? 36 : 42;
    P.forEach((p, i) => { const isNew = !prev.some((q) => q.label === p.label), changed = prev.some((q) => q.label === p.label && q.match !== p.match);
      const at = isNew ? 0.3 + (i - pc) * 0.35 : changed ? 0.6 : 0;
      const op = isNew || changed ? fade(u, Math.max(0.2, at)) : 1, y = 80 + i * RH;
      el('rect', { x: 390, y: y - 18, width: 520, height: 36, rx: 7, fill: p.match ? GOODBG : BADBG, opacity: 0.6 * op });
      lampRow(412, y, p.match, `${p.label}=${p.cond}`, op); });
    // AND 게이트 결과
    const all = P.every((p) => p.match), y = 80 + P.length * RH + 14, at = 0.4 + P.length * 0.3;
    grow(650, y - 10, 650, y + 20, E(u, at, at + 0.3), all ? GOOD : BAD);
    card(650, y + 46, 300, 44, { rx: 22, s: pop(u, at + 0.3), stroke: all ? GOOD : BAD, fill: all ? GOODBG : BADBG, text: all ? `매칭 · ${b.target}` : '매칭 실패 · 다음 Route 로', fs: 15, mono: false, color: all ? GOOD : BAD });
    if (k === 3) { note(40, 330, '하나만 false 여도', fade(u, 1.8), { fill: BAD }); note(40, 356, '나머지 3개는 소용없다', fade(u, 2.0), { fill: BAD }); }
    if (k === 4) { note(40, 330, '?source=mobile 을 붙이고', fade(u, 0.5), { fill: ACC }); note(40, 356, '6개 모두 참', fade(u, 2.0), { fill: GOOD }); } }

  // ---------- 3. Filter — 경로·헤더·제한·재시도 ----------
  function s3(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { // StripPrefix=2 다음 RewritePath 는 맞지 않는다
      pathBox(120, 90, '/api/v1/orders/42', { s: pop(u, 0.1) });
      grow(222, 90, 300, 90, E(u, 0.3, 0.6), MUT); gate(400, 90, 'StripPrefix=2', WARN, { s: pop(u, 0.4) });
      grow(492, 90, 560, 90, E(u, 0.8, 1.1), MUT); pathBox(650, 90, '/orders/42', { col: ACC, s: pop(u, 1.0) });
      grow(650, 112, 650, 160, E(u, 1.3, 1.6), MUT);
      gate(560, 190, 'RewritePath  /api/v1/orders/(?<seg>.*)', WARN, { s: pop(u, 1.5) });
      if (u > 1.9) { cross(750, 190, 10, pop(u, 1.9)); mono(560, 240, '"/orders/42" 에는 /api/v1/ 이 없다 · 그대로 통과', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 }); }
      card(480, 330, 620, 70, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 2.2), text: '둘 중 하나만 쓴다 · RewritePath 만 쓰면 /api/v1/orders/42 → /orders/42\nyaml 에서는 ${seg} 를 $\\{seg} 로 적는다', fs: 14.5 }); return; }
    // 요청 줄(위)·응답 줄(아래)
    const Y1 = 120, Y2 = 280;
    person(50, 200, '클라이언트', {}); server(880, 200, 'order-service', { lamp: k === 3 ? BAD : GOOD });
    el('line', { x1: 80, y1: Y1, x2: 822, y2: Y1, stroke: GRID, 'stroke-width': 2.5 }); el('line', { x1: 822, y1: Y2, x2: 80, y2: Y2, stroke: GRID, 'stroke-width': 2.5 });
    tx(110, Y1 - 34, 'pre · 요청 →', { 'font-size': 14, 'font-weight': 700, fill: INFO }); tx(110, Y2 + 44, '← 응답 · post', { 'font-size': 14, 'font-weight': 700, fill: WARN });
    const pre = b.filters.filter((f) => f.phase === 'pre'), post = b.filters.filter((f) => f.phase === 'post'), pn = (c.prev && c.prev.filters ? c.prev.filters.length : 0);
    const short = (s) => s.replace('RequestRateLimiter', 'RateLimiter').replace(' (default)', '*');
    if (k === 2) for (let i = 0; i < 6; i++) dot([[80, Y1 + 22], [520, Y1 + 22]], ((t * 0.8 + i / 6) % 1), INFO, 5);
    pre.forEach((f, i) => { const x = 200 + i * 138, isNew = b.filters.indexOf(f) >= pn; gate(x, Y1, short(f.name), INFO, { w: 134, fs: 13.5, s: isNew ? pop(u, 0.3 + i * 0.1) : 1, fill: isNew ? INFOBG : PANEL }); });
    post.forEach((f, i) => { const x = 700 - i * 170, isNew = b.filters.indexOf(f) >= pn; gate(x, Y2, short(f.name), WARN, { w: 160, s: isNew ? pop(u, 0.5 + i * 0.2) : 1, fill: isNew ? WARNBG : PANEL }); });
    if (k === 1) { dot([[80, Y1], [822, Y1]], seg(u, 0.8, 1.8), INFO, 7); dot([[822, Y2], [80, Y2]], seg(u, 1.6, 2.6), WARN, 7);
      if (u > 1.4) pill(560, Y1 + 40, '+ X-Gateway: spring-cloud', INFO, 1, { mono: true, fs: 13.5, fill: PANEL });
      if (u > 2.2) pill(560, Y2 - 40, '+ X-Cache: MISS', WARN, 1, { mono: true, fs: 13.5, fill: PANEL }); return; }
    if (k === 2) {
      card(585, 196, 230, 64, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 0.8), text: '초당 10 · 순간 20\n넘치면 429', fs: 14.5, color: BAD });
      return; }
    if (k === 3) { // 502 → 재시도 2회
      [0, 1, 2].forEach((i) => { const a = 0.2 + i * 0.75; dot([[700, Y1], [822, Y1], [700, Y1 + 30]], seg(u, a, a + 0.6), i < 2 ? BAD : GOOD, 7);
        if (u > a + 0.6) pill(720, 166 + i * 34, i < 2 ? `502 → 재시도 ${i + 1}` : '재시도 끝', i < 2 ? BAD : MUT, 1, { fs: 13.5, fill: PANEL }); });
      note(300, 200, 'retries: 2 · statuses: BAD_GATEWAY', fade(u, 0.4), { class: 'mono' });
      note(300, 228, '기본 methods 는 GET · POST 에 걸면 중복 처리', fade(u, 1.2), { fill: BAD }); return; }
    // k4: 체인 전체
    tx(480, 210, `pre ${pre.length}개 → 프록시 → post ${post.length}개`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
    sub(480, 238, '* 는 default-filters · 모든 Route 에 붙는다', fade(u, 1.2), { 'font-size': 14.5 });
    dot([[80, Y1], [822, Y1], [822, Y2], [80, Y2]], seg(u, 1.0, 2.6), ACC, 7); }

  // ---------- 4. 실행 순서 — 양파 껍질 ----------
  const O = { x: 480, y: 205 };
  function ring(rx, ry, col, label, op, f) { const pth = el('ellipse', { cx: O.x, cy: O.y, rx, ry, fill: 'none', stroke: col, 'stroke-width': 3, opacity: op, pathLength: 100, 'stroke-dasharray': f < 1 ? `${f * 100} 100` : null });
    if (label && f >= 1) tx(O.x, O.y - ry - 8, label, { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op }); return pth; }
  function s4(t, c) { const { k, u } = c;
    card(O.x, O.y, 130, 56, { rx: 10, text: '백엔드', fs: 15, stroke: INK, fill: SOFT });
    ring(330, 175, ACC, 'LoggingGlobalFilter · order -100', 1, k === 0 ? E(u, 0.3, 1.4) : 1);
    if (k >= 4) ring(200, 112, WARN, 'route 필터', 1, E(u, 0.2, 1.0));
    tx(150, 395, 'pre', { 'font-size': 16, 'font-weight': 800, fill: INFO }); tx(780, 395, 'post', { 'font-size': 16, 'font-weight': 800, fill: WARN });
    el('line', { x1: O.x, y1: 22, x2: O.x, y2: 400, stroke: MUT, 'stroke-width': 1.5, 'stroke-dasharray': '4 5', opacity: k >= 2 ? 1 : 0.3 });
    if (k >= 2) mono(O.x + 8, 398, 'chain.filter()', { 'font-size': 14, fill: MUT });
    if (k === 0) { note(40, 60, 'yaml 에 적지 않아도', fade(u, 1.5)); note(40, 86, '모든 Route 에 붙는다', fade(u, 1.7)); return; }
    const left = [[60, O.y], [O.x - 65, O.y]], right = [[O.x + 65, O.y], [900, O.y]];
    if (k === 1) { dot(left, seg(u, 0.3, 1.4), INFO, 8);
      if (u > 0.8) { clock(200, 120, 18, 0.02, ACC); mono(226, 126, 'start', { 'font-size': 15, 'font-weight': 800, fill: ACC }); }
      if (u > 1.2) pill(250, 300, '+ X-Request-Id', ACC, pop(u, 1.2), { mono: true, fs: 14, fill: PANEL }); return; }
    if (k === 2) { dot(left, seg(u, 0.2, 1.4), INFO, 8);
      if (u > 1.4) { el('rect', { x: O.x - 65, y: O.y - 28, width: 130, height: 56, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 4, opacity: fade(u, 1.4) }); }
      note(20, 50, '여기까지 pre', fade(u, 1.6)); note(20, 76, '이 호출 뒤가 post', fade(u, 1.8)); return; }
    if (k === 3) { dot(right, seg(u, 0.2, 1.4), WARN, 8);
      const ms = Math.round(lerp(0, 1, E(u, 0.2, 1.4)) * 100); clock(760, 120, 18, ms / 100, ACC);
      mono(786, 126, 'ms = now − start', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      note(20, 50, '응답이 돌아온 뒤라', fade(u, 1.8)); note(20, 76, '실제 소요 시간이 나온다', fade(u, 2.0)); return; }
    // k4: 1 RequestId(pre) → 2 StripPrefix(pre) → 3 프록시 → 4 AddResponseHeader(post) → 5 로깅(post)
    const P = [[O.x - 330, '① RequestId', INFO], [O.x - 200, '② StripPrefix', INFO], [O.x, '③ 프록시', INK], [O.x + 200, '④ AddResponseHeader', WARN], [O.x + 330, '⑤ 응답시간 로깅', WARN]];
    P.forEach(([x, s, col], i) => { const at = 1.0 + i * 0.3; el('circle', { cx: x, cy: O.y, r: 9, fill: col, opacity: fade(u, at) });
      if (i !== 2) mono(x + (i < 2 ? 14 : -14), O.y - 14, s.slice(0, 1), { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': i < 2 ? 'start' : 'end', opacity: fade(u, at) });
    });
    tx(O.x, 414, P.map((p) => p[1]).join('  →  '), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    dot([[60, O.y], [900, O.y]], seg(u, 1.0, 2.6), ACC, 7); }

  // ---------- 5. yaml vs Java DSL ----------
  function s5(t, c) { const { k, u } = c;
    mono(30, 40, 'builder.routes()', { 'font-size': 14.5, 'font-weight': 700 });
    ['user-route', 'orders-write', 'tenant-acme'].forEach((id, i) => { const n = c.beat.routes; if (i >= n) return; const isNew = i === n - 1 && k >= 1 && k <= 3, y = 76 + i * 40;
      card(130, y, 200, 30, { rx: 6, s: isNew ? pop(u, 0.15) : 1, stroke: isNew ? ACC : GRID, fill: isNew ? ACCBG : PANEL, text: id, fs: 14, mono: true, color: isNew ? ACC : INK }); });
    if (c.beat.routes === 0) mono(40, 80, '(Route 0개)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3) });
    el('line', { x1: 252, y1: 24, x2: 252, y2: 400, stroke: GRID, 'stroke-width': 1.5 });
    if (k === 0) { card(600, 200, 560, 150, { rx: 12, stroke: GRID, dash: '7 6', sw: 2 });
      mono(600, 190, '@Bean RouteLocator routes(RouteLocatorBuilder builder)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      tx(600, 222, '조건 분기·반복으로 Route 를 만들 수 있는 자리', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); return; }
    if (k === 1) { // /api/users/7 → /users/7 → /v2/users/7
      const xs = [350, 520, 690];
      pathBox(360, 80, '/api/users/7', { s: pop(u, 0.1) });
      gate(360, 160, 'stripPrefix(1)', INFO, { s: pop(u, 0.4) }); grow(360, 100, 360, 136, E(u, 0.4, 0.7), MUT);
      pathBox(360, 240, '/users/7', { s: pop(u, 0.8) }); grow(360, 184, 360, 220, E(u, 0.7, 0.9), MUT);
      grow(430, 240, 500, 240, E(u, 1.0, 1.3), MUT); gate(640, 240, 'rewritePath /users/(.*)', INFO, { s: pop(u, 1.2) });
      grow(640, 264, 640, 300, E(u, 1.5, 1.7), MUT); pathBox(640, 324, '/v2/users/7', { col: ACC, s: pop(u, 1.7) });
      grow(712, 324, 780, 324, E(u, 1.9, 2.1), ACC); mono(790, 330, 'user-service:8081', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
      pill(800, 80, 'post · X-Powered-By', WARN, pop(u, 2.3), { mono: true, fs: 13.5, fill: PANEL }); return; }
    if (k === 2) { const L = [['.path("/api/orders/**")', true], ['.and().method("POST","PUT")', true], ['.and().header("X-Tenant",".+")', true]];
      req(290, 60, 'POST', '/api/orders/42', { s: pop(u, 0.1) });
      L.forEach(([s, ok], i) => { const y = 130 + i * 56; card(470, y, 360, 40, { rx: 20, stroke: INFO, s: pop(u, 0.3 + i * 0.4), text: s, fs: 14, mono: true, color: INFO });
        if (u > 0.6 + i * 0.4) check(680, y, 9, pop(u, 0.6 + i * 0.4));
        if (i < 2) grow(470, y + 20, 470, y + 36, E(u, 0.5 + i * 0.4, 0.7 + i * 0.4), INFO, { plain: true }); });
      grow(700, 186, 780, 186, E(u, 1.8, 2.1), ACC); mono(790, 192, 'order-service:8082', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
      sub(470, 330, 'yaml 의 predicate 나열 = DSL 의 .and() 체인', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 3) { req(290, 90, 'GET', '/  Host: acme.example.com', { s: pop(u, 0.1) });
      grow(560, 90, 640, 90, E(u, 0.6, 1.0), ACC); mono(650, 96, 'acme-backend:8090', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      req(290, 200, 'GET', '/  Host: other.example.com', { s: pop(u, 1.0), mcol: MUT }); cross(580, 200, 9, pop(u, 1.5));
      sub(480, 300, '도메인으로 가른다 · 이 Route 엔 필터가 없다 (Host 값은 예시 포함)', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    // k4: yaml ↔ DSL 대응
    const Y = [['- id: user-route', '.route("user-route", r -> r'], ['  - Path=/api/users/**', '.path("/api/users/**")'], ['  - StripPrefix=1', '.stripPrefix(1)'],
      ['  - RewritePath=…, /v2/users/$\\{s}', '.rewritePath(…, "/v2/users/${s}")'], ['  uri: http://user-service:8081', '.uri("http://user-service:8081")']];
    tx(290, 50, 'application.yml', { 'font-size': 14.5, 'font-weight': 800, fill: MUT }); tx(640, 50, 'Java DSL', { 'font-size': 14.5, 'font-weight': 800, fill: MUT });
    Y.forEach(([a, b], i) => { const y = 90 + i * 56, at = 0.2 + i * 0.35;
      mono(280, y, a, { 'font-size': 13.5, opacity: fade(u, at) }); mono(630, y, b, { 'font-size': 13.5, fill: ACC, opacity: fade(u, at + 0.15) });
      grow(568, y - 5, 622, y - 5, E(u, at + 0.2, at + 0.45), MUT, { plain: true }); });
    tx(600, 395, '표현만 다르고 결과는 같다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: 'Route의 4요소 중 "이 요청을 받을지" 를 판정하는 것은 무엇인가?',
      o: ['id', 'predicates', 'filters'], a: 1,
      why: 'predicate는 boolean 조건이다. 모두 참일 때 그 Route가 선택되고, filter는 선택된 뒤에야 돈다.' },
    { q: 'Path·Method·Header는 맞고 Query=source, mobile만 맞지 않는다. 결과는?',
      o: ['3/4가 맞으니 매칭된다', 'Query 조건만 무시하고 프록시한다', '이 Route를 건너뛰고 다음 Route를 평가한다'], a: 2,
      why: 'predicate는 AND로 묶인다. 하나라도 false면 이 Route는 매칭 실패다.' },
    { q: 'StripPrefix=2 뒤에 RewritePath=/api/v1/orders/(?<seg>.*), … 를 두면 RewritePath는 무엇을 하나?',
      o: ['이미 잘린 경로라 정규식이 맞지 않아 아무것도 바꾸지 않는다', '/orders/42를 /orders/orders/42로 바꾼다', 'StripPrefix를 되돌린다'], a: 0,
      why: '필터는 선언 순서대로 돈다. StripPrefix가 /api/v1을 뗀 /orders/42에는 /api/v1/orders/ 가 없어서 치환이 일어나지 않는다.' },
    { q: '필터 A(order -100)와 B가 있을 때 post 단계의 실행 순서는?',
      o: ['A 다음 B', 'B 다음 A', '둘이 동시에'], a: 1,
      why: 'pre는 A → B로 들어가고, post는 역순인 B → A로 나온다. 바깥 껍질 A가 마지막에 응답을 본다.' },
    { q: '같은 Route를 Java DSL로 쓰는 편이 나은 경우는?',
      o: ['운영자가 설정 파일만 고쳐 바꾸고 싶을 때', 'Route가 하나뿐일 때', '조건 분기나 반복으로 Route를 만들어야 할 때'], a: 2,
      why: 'yaml은 정적·선언형이고 DSL은 코드라 분기·반복·메서드 추출이 된다. 대신 바꾸려면 다시 배포해야 한다.' },
  ];

  const summary = [
    'Route는 id, uri, predicates, filters 네 가지로 이루어진다.',
    'predicate는 받을지를 정하는 조건이고 여러 개면 AND라서 하나만 틀려도 다음 Route로 넘어간다.',
    'filter는 선언 순서대로 돌아 StripPrefix가 먼저 자르면 뒤의 RewritePath 정규식은 맞지 않을 수 있다.',
    'pre는 바깥부터 안으로, post는 안에서 바깥으로 돌아서 응답 시간은 post에서 잰다.',
  ];
  const review = [
    { q: 'yaml에 RewritePath=/users/(?<s>.*), /v2/users/${s}라고 적었더니 기동할 때 오류가 난다. 먼저 의심할 것은?',
      o: ['정규식의 named group 문법', 'StripPrefix가 빠졌다', 'yaml에서는 $ 를 $\\ 로 적어야 하는데 ${s}가 설정 값으로 해석됐다'], a: 2,
      why: 'Spring이 ${s}를 설정 값 자리로 읽으려 한다. 공식 문서대로 $\\{s}로 적는다. Java DSL 문자열에서는 ${s} 그대로 쓴다.' },
    { q: 'GlobalFilter의 접근 로그에 찍힌 소요 시간이 늘 0ms에 가깝다. 가장 그럴듯한 원인은?',
      o: ['elapsed 계산을 chain.filter() 앞에서 하고 있다', 'getOrder가 -100이다', 'StripPrefix를 두 번 썼다'], a: 0,
      why: 'chain.filter() 앞은 pre라서 백엔드 응답 전에 시간을 잰다. then() 안의 post에서 재야 실제 소요 시간이 나온다.' },
    { q: '/api/orders/** 에 POST만 받는 orders-write와 조건 없는 orders-read가 있다. GET /api/orders/42는 어디로 가나?',
      o: ['orders-write', 'orders-read', '어느 Route에도 맞지 않아 404'], a: 1,
      why: 'GET은 orders-write의 Method 조건에서 false라 건너뛰고, 다음 Route인 orders-read가 매칭된다.' },
  ];

  R.page({ title: 'Route 매칭 · 필터 체인 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
