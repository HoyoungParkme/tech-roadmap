/* III-1-2 Server Interceptor — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 양파 고리는 페이지 STEPS 의 pipeline { stages, reachIn, phase, focus } 를 읽는다.
 * 터미널의 실행 순서·상태 코드는 grpcio 1.85.3 서버에 인터셉터를 걸어 직접 돌린 결과다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells,
    zone, server, person, cross, check, lock, clock, terminal, snippet, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // 양파: stages 를 바깥→안 고리로. o.cx,o.cy 가운데, o.W,o.H 가장 바깥 크기
  function onion(stages, o) { o = o || {}; const n = stages.length, cx = o.cx ?? 650, cy = o.cy ?? 215, W = o.W ?? 560, H = o.H ?? 340;
    const dw = (W - 150) / (n - 1), dh = (H - 90) / (n - 1), rings = [];
    stages.forEach((name, i) => { const w = W - i * dw, h = H - i * dh, hand = i === n - 1, s = o.appear ? o.appear(i) : 1; if (s <= 0) return;
      const dead = o.dead != null && i > o.dead, hot = o.focus === i, blk = o.block === i;
      const stroke = blk ? BAD : hot ? ACC : hand ? INFO : GRID;
      el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 16, fill: hand ? INFOBG : i % 2 ? PANEL : SOFT, stroke, 'stroke-width': hot || blk ? 3 : 1.8, opacity: (dead ? 0.35 : 1) * s });
      tx(hand ? cx : cx - w / 2 + 12, hand ? cy + 6 : cy - h / 2 + 21, name, { 'font-size': hand ? 16 : 14.5, 'font-weight': 700, 'text-anchor': hand ? 'middle' : 'start', fill: blk ? BAD : hot ? ACC : hand ? INFO : INK, opacity: (dead ? 0.4 : 1) * s });
      rings.push({ x0: cx - w / 2, x1: cx + w / 2, w, h }); });
    return { cx, cy, dw, edge: (i) => cx - (W - i * dw) / 2, redge: (i) => cx + (W - i * dw) / 2 }; }
  // 요청 점이 depth 고리까지 들어갔다가(back 이면) 오른쪽으로 나온다
  function travel(on, depth, u, o) { o = o || {}; const y = on.cy + (o.dy ?? 34), inX = on.edge(depth) + (o.toCenter ? on.cx - on.edge(depth) : 18);
    const pIn = seg(u, o.a ?? 0.2, o.b ?? 1.2);
    if (pIn > 0) el('line', { x1: on.edge(0) - 40, y1: y, x2: lerp(on.edge(0) - 40, inX, pIn), y2: y, stroke: o.block ? BAD : ACC, 'stroke-width': 3, 'stroke-dasharray': '7 5' });
    if (pIn > 0 && pIn < 1) el('circle', { cx: lerp(on.edge(0) - 40, inX, pIn), cy: y, r: 7, fill: ACC });
    if (o.block && pIn >= 1) cross(inX + 4, y, 11, 1);
    if (o.back) { const pOut = seg(u, (o.b ?? 1.2) + 0.1, (o.b ?? 1.2) + 1.1);
      const xe = Math.min(945, on.redge(0) + 30);
      if (pOut > 0) el('line', { x1: inX, y1: y + 18, x2: lerp(inX, xe, pOut), y2: y + 18, stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': '7 5' });
      if (pOut > 0 && pOut < 1) el('circle', { cx: lerp(inX, xe, pOut), cy: y + 18, r: 7, fill: GOOD }); } }
  const P = (c) => c.beat.pipeline || { stages: ['Logging', 'Auth', 'Metrics', 'Handler'], reachIn: 0, phase: 'both', focus: -1 };

  // ---------- 1. 양파 미들웨어 ----------
  function s1(t, c) { const { k, u } = c, p = P(c), n = p.stages.length;
    const on = onion(p.stages, { cx: 650, focus: p.focus, appear: k === 0 ? (i) => pop(u, 0.9 + i * 0.25) : null });
    if (k === 0) { [['Express', 'app.use(mw)'], ['Django', 'MIDDLEWARE = […]'], ['gRPC', 'ChainUnaryInterceptor(…)']].forEach(([a, b], i) => { const y = 120 + i * 70, s = pop(u, 0.2 + i * 0.2);
        tx(30, y, a, { 'font-size': 15, 'font-weight': 700, opacity: s }); mono(30, y + 24, b, { 'font-size': 14, fill: i === 2 ? ACC : MUT, opacity: s }); });
      sub(170, 360, '핸들러 앞뒤에 공통 코드를 끼운다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 1) { [['로깅', 0], ['인증', 1], ['메트릭', 2], ['복구', 0], ['검증', 1]].forEach(([a, r], i) => { const s = pop(u, 0.2 + i * 0.3);
        pill(90, 80 + i * 56, a, i === 3 ? WARN : ACC, s, { fs: 15 }); });
      note(30, 380, '핸들러는 비즈니스 로직만 남는다', fade(u, 2.0)); return; }
    if (k === 2 || k === 3) { travel(on, k === 2 ? p.reachIn : n - 1, u, { back: k === 3, toCenter: k === 3 && false });
      note(30, 110, '요청', fade(u, 0.2), { fill: ACC, 'font-size': 16 });
      p.stages.slice(0, k === 2 ? p.reachIn + 1 : n).forEach((s, i) => mono(30, 140 + i * 28, (i + 1) + '. ' + s, { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.25) }));
      if (k === 3) { note(30, 290, '응답은 역순', fade(u, 1.4), { fill: GOOD, 'font-size': 16 }); mono(30, 318, p.stages.slice(0, n - 1).reverse().join(' ← '), { 'font-size': 13.5, opacity: fade(u, 1.6) }); }
      return; }
    if (k === 4) { [['Unary', 'func(ctx, req, info, handler)'], ['Stream', 'func(srv, ss, info, handler)']].forEach(([a, b], i) => { const y = 120 + i * 120, s = pop(u, 0.2 + i * 0.5);
        card(170, y, 300, 76, { rx: 10, stroke: i ? WARN : ACC, sw: 2, s }); tx(40, y - 8, a, { 'font-size': 16, 'font-weight': 800, fill: i ? WARN : ACC, opacity: s }); mono(40, y + 20, b, { 'font-size': 13.5, opacity: s }); });
      sub(170, 380, '체인도 따로 등록한다', fade(u, 1.6), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); return; }
    // k5: 두 인자
    pill(180, 120, 'info.FullMethod', ACC, pop(u, 0.2), { mono: true }); mono(40, 160, '"/user.v1.UserService/GetUser"', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
    pill(180, 230, 'handler(ctx, req)', INFO, pop(u, 0.9), { mono: true }); sub(180, 266, '다음 고리를 부른다', fade(u, 1.1), { 'font-size': 14 });
    grow(310, 230, on.edge(n - 1) + 10, on.cy, E(u, 1.2, 1.8), INFO);
    pill(180, 330, '(resp, err) 반환', GOOD, pop(u, 1.8), { mono: true }); }

  // ---------- 2. Unary 구현: 시간 위의 감싸기 ----------
  const X0 = 120, X1 = 860, TY = 150;
  function bars(c, o) { o = o || {}; const { k, u } = c;
    el('line', { x1: X0 - 20, y1: TY + 150, x2: X1 + 30, y2: TY + 150, stroke: MUT, 'stroke-width': 1.8 }); tx(X1 + 30, TY + 172, '시간 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    const outer = o.outer ?? 1, inner = o.inner ?? 1;
    if (outer > 0) { el('rect', { x: X0, y: TY - 30, width: (X1 - X0) * outer, height: 44, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2 }); tx(X0 + 12, TY - 2, o.name || 'LoggingInterceptor', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: ACC }); }
    if (inner > 0) { el('rect', { x: X0 + 160, y: TY + 30, width: (X1 - X0 - 320) * inner, height: 44, rx: 8, fill: o.boom ? BADBG : INFOBG, stroke: o.boom ? BAD : INFO, 'stroke-width': 2 });
      tx(X0 + 172, TY + 58, 'handler(ctx, req) · 안쪽 전부', { 'font-size': 15, 'font-weight': 700, fill: o.boom ? BAD : INFO, opacity: clamp(inner * 3) }); }
    if (o.zones) { const a = o.zones; el('rect', { x: X0, y: TY + 90, width: 160, height: 30, rx: 6, fill: SOFT, opacity: a }); el('rect', { x: X1 - 160, y: TY + 90, width: 160, height: 30, rx: 6, fill: SOFT, opacity: a });
      tx(X0 + 80, TY + 110, '요청 처리', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: a }); tx(X1 - 80, TY + 110, '응답 처리', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: a }); } }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 130, 700, 120, { rx: 14, stroke: INK, sw: 2.5, s: pop(u, 0.1) }); mono(150, 92, 'func LoggingInterceptor(', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      ['ctx', 'req', 'info', 'handler'].forEach((a, i) => card(220 + i * 150, 140, 130, 44, { rx: 8, text: a, fs: 15, mono: true, stroke: i >= 2 ? ACC : GRID, color: i >= 2 ? ACC : INK, s: pop(u, 0.5 + i * 0.25) }));
      mono(150, 230, ') (any, error)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(480, 310, '세 인터셉터가 모두 이 모양이라 체인으로 엮인다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 1 || k === 2) { bars(c, { name: 'RecoveryInterceptor', boom: true });
      const bx = 640, by = TY + 52, b = pop(u, 0.4); for (let i = 0; i < 10; i++) { const a = i * 0.63; el('line', { x1: bx, y1: by, x2: bx + Math.cos(a) * 30 * b, y2: by + Math.sin(a) * 30 * b, stroke: BAD, 'stroke-width': 3 }); }
      mono(bx + 40, by + 52, 'panic!', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.5) });
      if (k === 1) { grow(bx, by - 30, bx, TY + 18, E(u, 1.0, 1.6), BAD); mono(bx + 14, TY - 40, 'defer recover() 가 잡는다', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) });
        sub(480, 380, 'recover 가 없으면 Go 서버 프로세스가 통째로 내려간다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      pill(760, 60, 'codes.Internal (13) · "internal error"', BAD, pop(u, 0.3), { mono: true, fs: 13.5 });
      terminal(120, 312, 720, 100, ['>>> grpcio 핸들러가 예외를 던지면 (recover 없음)', ["UNKNOWN (2) 'Exception calling application: boom' · 서버는 계속 돈다", '#fca5a5']], lerp(1, 2, E(u, 1.0, 2.0)), { fs: 14 }); return; }
    if (k === 3) { bars(c, { name: 'MetricsInterceptor' });
      tx(120, 50, 'rpc_requests{method, code}', { 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.2) });
      card(620, 44, 70, 34, { rx: 6, text: '+1', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.8) });
      tx(120, 380, 'rpc_latency', { 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 1.0) });
      [3, 6, 9, 5, 2].forEach((h, i) => el('rect', { x: 260 + i * 34, y: 392 - h * 5 * E(u, 1.2 + i * 0.1, 2.0), width: 28, height: h * 5 * E(u, 1.2 + i * 0.1, 2.0), fill: INFO, opacity: 0.8 }));
      sub(640, 386, 'status.Code(err) 로 결과 코드를 라벨에', fade(u, 1.8), { 'font-size': 14 }); return; }
    // k4~k7: 로깅 인터셉터의 요청 전 / handler / 응답 후
    bars(c, { inner: k === 4 ? 0 : k === 5 ? E(u, 0.3, 1.6) : 1, outer: 1, zones: k >= 6 ? 1 : 0 });
    el('line', { x1: X0, y1: TY - 50, x2: X0, y2: TY + 150, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '4 4' });
    mono(X0 + 6, TY - 56, 'start := time.Now()', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
    if (k === 4) { terminal(120, 300, 720, 80, ['→ /user.v1.UserService/GetUser 시작'], lerp(0.3, 1, E(u, 0.3, 1.5)), { fs: 14.5 }); return; }
    if (k === 5) { sub(480, 330, '이 한 줄 안에서 안쪽 체인과 핸들러가 전부 돈다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 6) { el('line', { x1: X1, y1: TY - 50, x2: X1, y2: TY + 150, stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '4 4' });
      grow(X0, TY - 40, X1, TY - 40, E(u, 0.3, 1.2), GOOD); mono(480, TY - 46, 'dur = time.Since(start)', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      terminal(120, 312, 720, 100, ['→ /user.v1.UserService/GetUser 시작', '← /user.v1.UserService/GetUser 종료 code=OK dur=…'], lerp(1, 2, E(u, 1.0, 2.2)), { fs: 14.5 }); return; }
    grow(X1 + 10, TY + 40, X1 + 10, TY - 10, 1, GOOD); mono(X1 - 10, TY - 46, 'return resp, err', { 'font-size': 15, fill: GOOD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.3) });
    sub(480, 340, '받은 값을 그대로 돌려준다 · 관찰만 하고 흐름은 바꾸지 않는다', fade(u, 1.0), { 'font-size': 15 }); }

  // ---------- 3. 인증 인터셉터 ----------
  function s3(t, c) { const { k, u } = c, p = P(c), n = p.stages.length, blk = p.phase === 'block';
    const on = onion(p.stages, { cx: 660, W: 540, H: 330, focus: p.focus, block: blk ? p.reachIn : null, dead: blk ? p.reachIn : null });
    if (k === 0) { tx(30, 60, 'ctx 값 (키 → 값)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      [['"user"  (pkg a)', 'User{…}'], ['"user"  (pkg b)', 'tenant']].forEach(([a, b], i) => { const s = pop(u, 0.2 + i * 0.4); mono(30, 104 + i * 40, a, { 'font-size': 14.5, opacity: s }); mono(230, 104 + i * 40, b, { 'font-size': 14.5, fill: i ? BAD : INK, opacity: s }); });
      cross(330, 120, 10, pop(u, 1.0)); sub(170, 182, '문자열 키는 서로 덮어쓴다', fade(u, 1.1), { fill: BAD, 'font-size': 14 });
      mono(30, 250, 'type ctxKey string', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) }); mono(30, 278, 'const userKey ctxKey = "user"', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.8) });
      sub(170, 320, '전용 타입이면 다른 패키지와 겹치지 않는다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 1 || k === 2) { tx(30, 70, 'publicMethods', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      ['/auth.v1.AuthService/Login', '/grpc.health.v1.Health/Check'].forEach((m, i) => { mono(30, 108 + i * 32, m, { 'font-size': 13.5, opacity: k === 1 ? fade(u, 0.3 + i * 0.4) : 1 }); check(330, 103 + i * 32, 8, k === 1 ? pop(u, 0.5 + i * 0.4) : 1); });
      if (k === 1) { sub(170, 230, '로그인 자체는 토큰이 없다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
      travel(on, n - 1, u, { back: true }); pill(170, 250, 'Login → 검사 없이 통과', GOOD, pop(u, 0.4), { fs: 14 }); return; }
    if (k === 3 || k === 4) { // context 사슬
      [['ctx', 'metadata …', 0], ['newCtx', 'userKey → *User', 1]].forEach(([a, b, i]) => { const y = 110 + i * 110, s = k === 3 ? pop(u, 0.2 + i * 0.6) : 1;
        card(170, y, 260, 64, { rx: 10, stroke: i ? ACC : GRID, sw: 2, s }); mono(60, y - 6, a, { 'font-size': 15, 'font-weight': 800, opacity: s }); mono(60, y + 18, b, { 'font-size': 14, fill: i ? ACC : MUT, opacity: s }); });
      grow(170, 188, 170, 145, k === 3 ? E(u, 1.0, 1.4) : 1, MUT); sub(240, 172, '부모', k === 3 ? fade(u, 1.3) : 1, { 'font-size': 13.5 });
      if (k === 3) { sub(170, 300, 'WithValue 는 새 ctx 를 만든다 · handler(newCtx, req)', fade(u, 1.6), { 'font-size': 14 }); travel(on, n - 1, u, { a: 1.4, b: 2.4 }); return; }
      mono(30, 320, 'u, ok := UserFromContext(ctx)', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.4) }); mono(30, 348, '→ (*User, true)', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 1.0) });
      grow(on.cx - 30, on.cy, 300, 220, E(u, 0.3, 1.0), INFO); return; }
    // k5~k7: 차단
    const why = ['metadata 없음', 'authorization 헤더 필요', '토큰 검증 실패'][k - 5];
    travel(on, p.reachIn, u, { block: true, b: 1.0 });
    card(180, 150, 300, 70, { rx: 10, stroke: BAD, sw: 2.5, s: pop(u, 1.1) }); mono(50, 144, 'Unauthenticated (16)', { 'font-size': 15, fill: BAD, 'font-weight': 800, opacity: fade(u, 1.2) }); tx(50, 170, '"' + why + '"', { 'font-size': 14.5, opacity: fade(u, 1.3) });
    if (k === 6) mono(30, 270, 'len(md.Get("authorization")) == 0', { 'font-size': 14, opacity: fade(u, 0.4) });
    if (k === 7) mono(30, 270, 'verifyToken(TrimPrefix(…, "Bearer "))', { 'font-size': 14, opacity: fade(u, 0.4) });
    sub(180, 330, 'handler 를 부르지 않는다 · 안쪽은 돌지 않는다', fade(u, 1.8), { 'font-size': 14 }); }

  // ---------- 4. 체인 등록과 실행 순서 ----------
  const TRACE = ['Recovery 요청 전', 'Logging 요청 전', 'Auth 요청 전', ['Handler 실행', '#93c5fd'], ['Auth 응답 후', '#86efac'], ['Logging 응답 후', '#86efac'], ['Recovery 응답 후', '#86efac']];
  function s4(t, c) { const { k, u } = c, p = P(c), n = p.stages.length, blk = p.phase === 'block';
    if (k === 6) { tx(40, 60, '옛 API 를 두 번 주면 (grpc-go server.go)', { 'font-size': 16, 'font-weight': 800 });
      mono(40, 110, 'grpc.NewServer(', { 'font-size': 15, opacity: fade(u, 0.2) }); mono(70, 140, 'grpc.UnaryInterceptor(a),', { 'font-size': 15, opacity: fade(u, 0.4) }); mono(70, 170, 'grpc.UnaryInterceptor(b),', { 'font-size': 15, fill: BAD, opacity: fade(u, 0.7) }); mono(40, 200, ')', { 'font-size': 15, opacity: fade(u, 0.7) });
      terminal(40, 230, 880, 76, [['panic: The unary server interceptor was already set and may not be reset.', '#fca5a5']], lerp(0.2, 1, E(u, 1.0, 2.0)), { fs: 14 });
      mono(40, 350, 'grpc.ChainUnaryInterceptor(a, b, c)', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.2) }); sub(620, 345, '여러 개는 체인으로', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    const on = onion(p.stages, { cx: 660, W: 540, H: 360, focus: p.focus, block: blk ? p.reachIn : null, dead: blk ? p.reachIn : null, appear: k === 1 ? (i) => pop(u, 0.3 + i * 0.3) : null });
    tx(30, 40, 'ChainUnaryInterceptor(', { 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: k === 0 ? fade(u, 0.3) : 1 });
    p.stages.slice(0, n - 1).forEach((s, i) => { const show = k === 0 ? 0 : k === 1 ? pop(u, 0.3 + i * 0.3) : 1;
      mono(50, 72 + i * 30, (i + 1) + '. ' + s + 'Interceptor,', { 'font-size': 14.5, fill: i === p.focus ? ACC : INK, opacity: show }); });
    tx(30, 72 + (n - 1) * 30, ')', { 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: k === 0 ? fade(u, 0.3) : 1 });
    if (k === 0) { sub(200, 260, '옵션 하나로 모든 Unary RPC 에 붙는다', fade(u, 0.9), { 'font-size': 14.5 }); return; }
    if (k === 1) { travel(on, p.reachIn, u, { a: 1.4, b: 2.4 }); sub(200, 260, '위에 적을수록 바깥 고리', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { zone(20, 230, 340, 170, 'ChainStreamInterceptor(…)  별도', { stroke: WARN, dash: '6 5', color: WARN, op: fade(u, 0.3) });
      card(190, 300, 230, 46, { rx: 10, text: 'StreamLogging', fs: 15, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.6) });
      grow(40, 360, 340, 360, E(u, 1.0, 2.0), WARN); sub(190, 386, 'ListUsers(stream) 는 이쪽만 탄다', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 3) { travel(on, n - 1, u, {}); sub(200, 260, 'Serve 뒤 모든 RPC 가 이 길로', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    if (k === 4) { travel(on, n - 1, u, { back: true, b: 1.0 });
      terminal(20, 210, 320, 200, TRACE, lerp(1, TRACE.length, E(u, 0.3, 2.4)), { title: 'grpcio 실행 순서', fs: 14, lh: 21 }); return; }
    if (k === 5) { travel(on, p.reachIn, u, { block: true, b: 1.0 }); pill(190, 260, 'Auth 차단 → Metrics · Handler 안 돎', BAD, pop(u, 1.2), { fs: 13.5 });
      sub(190, 300, 'Recovery 는 안쪽 전부를 덮는다', fade(u, 1.8), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); return; }
    // k7
    grow(on.cx - 40, on.cy + 10, 330, 300, E(u, 0.3, 1.0), INFO); mono(30, 320, 'user, _ := UserFromContext(ctx)', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.8) });
    sub(190, 360, '핸들러에는 토큰 파싱 코드가 없다', fade(u, 1.4), { 'font-size': 14.5 }); }

  // ---------- 5. Python + 함정 ----------
  function s5(t, c) { const { k, u } = c, p = P(c);
    if (k === 0) { card(480, 80, 300, 50, { rx: 10, text: 'grpc.ServerInterceptor', fs: 15, mono: true, stroke: INK, s: pop(u, 0.2) });
      [['LoggingInterceptor', 250], ['AuthInterceptor', 710]].forEach(([a, x], i) => { grow(480, 106, x, 186, E(u, 0.6 + i * 0.3, 1.1 + i * 0.3), MUT);
        card(x, 210, 260, 48, { rx: 10, text: a, fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.0 + i * 0.3) }); });
      mono(480, 310, 'def intercept_service(self, continuation, handler_call_details)', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      sub(480, 350, 'Go 는 함수, Python 은 클래스 · 메서드 하나만 구현한다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 1) { tx(40, 50, 'continuation 은 핸들러를 돌려줄 뿐이다 (실행 확인)', { 'font-size': 16, 'font-weight': 800 });
      el('line', { x1: 60, y1: 300, x2: 900, y2: 300, stroke: MUT, 'stroke-width': 1.8 });
      const a = E(u, 0.3, 1.0); el('rect', { x: 60, y: 120, width: 180 * a, height: 44, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2 }); tx(70, 148, 'intercept_service', { 'font-size': 14, class: 'mono', fill: ACC, opacity: a });
      mono(70, 196, 'dur=0.0ms 기록', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) });
      const b = E(u, 1.2, 2.4); el('rect', { x: 260, y: 220, width: 600 * b, height: 44, rx: 8, fill: INFOBG, stroke: INFO, 'stroke-width': 2 }); tx(272, 248, '핸들러 실행 50ms', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: b });
      sub(480, 350, '실행 시간을 재려면 돌려받은 핸들러 함수를 감싼다', fade(u, 2.3), { 'font-size': 15, fill: INK }); return; }
    if (k === 2 || k === 3) { mono(40, 70, 'md = dict(handler_call_details.invocation_metadata or [])', { 'font-size': 14, opacity: k === 2 ? fade(u, 0.2) : 1 });
      card(260, 140, 420, 50, { rx: 10, text: '"authorization" not in md', fs: 15, mono: true, stroke: BAD, color: BAD, s: k === 2 ? pop(u, 0.8) : 1 });
      if (k === 2) { sub(260, 220, '(key, value) 쌍 목록을 dict 로', fade(u, 1.4), { 'font-size': 14.5 }); return; }
      grow(260, 166, 260, 230, E(u, 0.2, 0.6), BAD); card(260, 260, 460, 50, { rx: 10, text: 'return unary_unary_rpc_method_handler(deny)', fs: 13.5, mono: true, stroke: BAD, s: pop(u, 0.6) });
      cross(560, 140, 10, pop(u, 0.9)); mono(580, 146, 'continuation(…) 안 부름', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) });
      terminal(500, 296, 440, 116, ['>>> 토큰 없이 GetUser', ["UNAUTHENTICATED (16) 'authorization 헤더 필요'", '#fca5a5'], '핸들러 실행 횟수: 0'], lerp(1, 3, E(u, 1.2, 2.4)), { fs: 13.5 }); return; }
    if (k === 4) { mono(40, 60, 'interceptors=[LoggingInterceptor(), AuthInterceptor()]', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.2) });
      onion(['Logging', 'Auth', 'Handler'], { cx: 480, cy: 250, W: 500, H: 250, focus: 0, appear: (i) => pop(u, 0.6 + i * 0.3) });
      sub(480, 405, '앞에 적은 것이 바깥 · Go 체인과 같은 규칙', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 5) { [['Unary 체인', ACC, 'GetUser', 110], ['Stream 체인', WARN, 'ListUsers', 250]].forEach(([a, col, m, y], i) => { const s = fade(u, 0.2 + i * 0.6);
        el('rect', { x: 260, y: y - 30, width: 420, height: 60, rx: 30, fill: 'none', stroke: col, 'stroke-width': 3, opacity: s }); tx(270, y - 40, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: s });
        grow(200, y, 740, y, E(u, 0.5 + i * 0.6, 1.5 + i * 0.6), col); mono(130, y + 5, m, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: s }); });
      sub(480, 340, 'Go: unary 만 등록하면 ListUsers 는 아무 인터셉터도 안 탄다', fade(u, 1.8), { 'font-size': 14.5, fill: BAD });
      sub(480, 370, 'Python ServerInterceptor 는 한 클래스가 둘 다 받는다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 6) { [['Recovery 가 바깥', ['Recovery', 'Logging', 'Handler'], 1, GOOD, '잡힘'], ['Recovery 가 안쪽', ['Logging', 'Recovery', 'Handler'], 0, BAD, '놓침']].forEach(([a, st, at, col, r], i) => {
        const cx = 250 + i * 460, s = fade(u, 0.2 + i * 0.8); if (s <= 0) return;
        onion(st, { cx, cy: 220, W: 380, H: 240, focus: st.indexOf('Recovery') });
        tx(cx, 70, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s });
        mono(cx - 120, 300, 'Logging 에서 panic', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 0.8 + i * 0.8) });
        pill(cx, 370, r, col, pop(u, 1.2 + i * 0.8), { fs: 15 }); }); return; }
    // k7: 무거운 I/O
    for (let i = 0; i < 5; i++) { const y = 90 + i * 56, g = E(u, 0.8, 1.8);
      mono(40, y + 26, 'RPC ' + (i + 1), { 'font-size': 14.5 });
      el('rect', { x: 120, y: y + 8, width: 80 + i * 30, height: 28, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5 });
      el('rect', { x: 120 + 80 + i * 30, y: y + 8, width: 260 * g, height: 28, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5 }); }
    tx(560, 140, '인터셉터 안 동기 I/O', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) });
    sub(480, 400, '모든 RPC 가 지나는 길목이라 모두 그만큼 늘어난다 · 캐시 · 비동기로', fade(u, 2.0), { 'font-size': 14.5 }); }

  const quiz = [
    { q: 'ChainUnaryInterceptor(Logging, Auth, Metrics)로 등록했을 때 응답이 빠져나오는 순서는 무엇인가?',
      o: ['Logging → Auth → Metrics', 'Metrics → Auth → Logging', '등록 순서와 상관없이 무작위'], a: 1,
      why: '요청은 바깥(Logging)부터 안으로 들어가고, 응답은 들어온 길을 거꾸로 나온다. 바깥이 가장 먼저 시작해 가장 늦게 끝난다.' },
    { q: 'Unary 인터셉터에서 handler(ctx, req) 호출 뒤에 적은 코드는 언제 실행되나?',
      o: ['요청이 핸들러에 닿기 전', '안쪽 체인과 핸들러가 모두 끝난 뒤', '서버가 시작될 때 한 번'], a: 1,
      why: 'handler() 한 줄 안에서 안쪽 전부가 돈다. 그 뒤의 줄은 응답 처리 구간이라 상태 코드와 지연을 여기서 남긴다.' },
    { q: '인증 인터셉터가 토큰 검증에 실패했을 때 해야 하는 일은 무엇인가?',
      o: ['handler를 부르지 않고 Unauthenticated를 돌려준다', 'handler를 부른 뒤 응답을 지운다', '로그만 남기고 handler를 부른다'], a: 0,
      why: 'return nil, status.Error(codes.Unauthenticated, …)로 끝내면 안쪽 체인과 핸들러가 아예 돌지 않는다. grpcio로 돌려 봐도 핸들러 실행 횟수는 0이다.' },
    { q: 'grpc-go 서버에 grpc.UnaryInterceptor(a)와 grpc.UnaryInterceptor(b)를 함께 주면 어떻게 되나?',
      o: ['b가 a를 덮어쓴다', 'a와 b가 체인으로 이어진다', 'NewServer가 "already set" panic으로 멈춘다'], a: 2,
      why: 'grpc-go 소스에서 UnaryInterceptor는 이미 값이 있으면 panic한다. 여러 개는 ChainUnaryInterceptor로 등록한다.' },
    { q: 'Python LoggingInterceptor가 continuation(details) 앞뒤로 시간을 쟀더니 늘 0.0ms가 나온다. 까닭은 무엇인가?',
      o: ['continuation이 핸들러를 돌려줄 뿐 실행하지 않아서', '타이머 해상도가 낮아서', '핸들러가 비동기라서'], a: 0,
      why: 'Python의 continuation은 RpcMethodHandler를 고를 뿐이다. 실행은 그 뒤에 일어나므로, 시간을 재려면 돌려받은 핸들러 함수를 감싸야 한다.' },
  ];

  const summary = [
    '인터셉터는 모든 RPC의 핸들러 앞뒤에 끼우는 공통 코드다.',
    'Go에서는 handler(ctx, req) 앞이 요청 처리, 뒤가 응답 처리 구간이다.',
    '인증이 실패하면 handler를 부르지 않고 Unauthenticated로 끝내 안쪽을 막는다.',
    '등록 순서가 바깥에서 안쪽 순서이고, Recovery는 가장 바깥, 스트림 체인은 따로 건다.',
  ];
  const review = [
    { q: '스트리밍 RPC ListUsers 호출이 인증 없이 통과하고 로그도 안 남는다. Go 서버에서 먼저 확인할 것은?',
      o: ['ChainStreamInterceptor를 등록했는지', '토큰 만료 시간', 'Recovery 인터셉터의 위치'], a: 0,
      why: 'Go에서 Unary 체인과 Stream 체인은 따로다. ChainUnaryInterceptor만 걸면 스트리밍 RPC는 어느 인터셉터도 지나지 않는다.' },
    { q: 'Logging 인터셉터 안에서 panic이 났는데 서버가 죽었다. 체인은 Logging, Recovery, Auth 순이다. 고칠 방법은?',
      o: ['Auth를 맨 앞으로 옮긴다', 'Recovery를 맨 앞(가장 바깥)으로 옮긴다', 'Logging을 지운다'], a: 1,
      why: 'Recovery는 자기보다 안쪽에서 난 panic만 잡는다. 가장 바깥에 두어야 모든 인터셉터와 핸들러를 덮는다.' },
    { q: '핸들러에서 UserFromContext(ctx)가 ok=false를 돌려준다. Auth 인터셉터에서 가장 먼저 의심할 실수는?',
      o: ['publicMethods에 GetUser가 빠졌다', 'Metrics 인터셉터가 너무 느리다', 'newCtx 대신 원래 ctx를 handler에 넘겼다'], a: 2,
      why: 'context는 바뀌지 않는 값이다. WithValue가 만든 newCtx를 넘겨야 핸들러가 user를 꺼낼 수 있다.' },
  ];

  R.page({ title: 'Server Interceptor — 양파 체인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
