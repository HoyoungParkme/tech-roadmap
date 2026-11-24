/* III-2-2 Auth — token / mTLS — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 위쪽 세 관문(TLS · mTLS · 토큰)의 색은 STEPS 의 gate { tls, mtls, token, result, resultText } 를 읽는다.
 * 핸드셰이크 결과·상태 코드·peer CN 은 openssl 로 만든 인증서와 grpcio 1.85.3 · grpc-js 1.14.7 로 직접 돌린 결과다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells,
    zone, server, person, cross, check, lock, clock, terminal, snippet, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // 세 관문 상태 줄
  const GS = { idle: [MUT, '대기'], attach: [INFO, '첨부'], verify: [ACC, '검증'], pass: [GOOD, '통과'], fail: [BAD, '실패'] };
  function gates(c, y) { const g = c.beat.gate || {}; y = y ?? 26;
    [['TLS', g.tls], ['mTLS', g.mtls], ['토큰', g.token]].forEach(([n, st], i) => { const [col, w] = GS[st] || GS.idle, x = 90 + i * 170;
      el('circle', { cx: x - 50, cy: y, r: 7, fill: col }); tx(x - 36, y + 5, n + ' · ' + w, { 'font-size': 14, 'font-weight': 700, fill: col }); });
    const rc = g.result === 'danger' ? BAD : g.result === 'good' ? GOOD : INFO;
    if (g.resultText) tx(940, y + 5, g.resultText, { 'font-size': 14, 'font-weight': 700, fill: rc, 'text-anchor': 'end' }); }
  // 인증서 카드 (가운데 기준)
  function cert(cx, cy, cn, o) { o = o || {}; const g = card(cx, cy, o.w || 170, o.h || 74, { rx: 8, stroke: o.col || INK, sw: 2, s: o.s, op: o.op, fill: o.fill });
    el('circle', { cx: (o.w || 170) / 2 - 18, cy: (o.h || 74) / 2 - 18, r: 9, fill: o.col || INK, opacity: 0.85 }, g);
    tx(-(o.w || 170) / 2 + 12, -12, o.title || '인증서', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }, g);
    tx(-(o.w || 170) / 2 + 12, 12, 'CN=' + cn, { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: o.col || INK }, g);
    if (o.san) tx(-(o.w || 170) / 2 + 12, 30, o.san, { 'font-size': 13.5, class: 'mono', fill: GOOD }, g); return g; }
  // 서비스 둘과 터널
  const AX = 120, BX = 840, TY = 210;
  function tunnel(u1, o) { o = o || {};
    card(AX, TY, 150, 64, { rx: 10, text: 'order-svc\n(클라이언트)', fs: 14.5, stroke: INK, sw: 2.5 });
    card(BX, TY, 150, 64, { rx: 10, text: 'user-svc\n(서버)', fs: 14.5, stroke: INK, sw: 2.5 });
    if (u1 > 0) { const x2 = lerp(AX + 75, BX - 75, u1);
      el('rect', { x: AX + 75, y: TY - 40, width: x2 - AX - 75, height: 80, rx: 40, fill: o.plain ? 'none' : GOODBG, stroke: o.plain ? BAD : GOOD, 'stroke-width': 3, 'stroke-dasharray': o.plain ? '8 6' : null, opacity: 0.9 });
      if (u1 >= 1) tx(480, TY - 50, o.plain ? '평문 채널 (TLS 없음)' : 'TLS 채널 · 연결할 때 한 번', { 'font-size': 14.5, 'font-weight': 700, fill: o.plain ? BAD : GOOD, 'text-anchor': 'middle' }); } }
  function envelopes(u, o) { o = o || {}; for (let i = 0; i < 3; i++) { const lag = o.stay ? 2 - i : i, p = seg(u, (o.a ?? 0.3) + lag * 0.5, (o.a ?? 0.3) + 1.1 + lag * 0.5); if (p <= 0) continue;
      const y = TY, xx = lerp(AX + 110, o.stay ? 420 + i * 125 : BX - 110, p);
      if (p >= 1 && !o.stay) continue;
      card(xx, y, 76, 40, { rx: 6, text: 'RPC', fs: 14, stroke: INK, fill: PANEL });
      card(xx, y - 30, 84, 22, { rx: 5, fill: o.bad ? BAD : ACC, stroke: 'none', text: o.label || 'Bearer JWT', fs: 13.5, color: PANEL }); } }

  // ---------- 1. 두 층 ----------
  function s1(t, c) { const { k, u } = c; gates(c);
    if (k <= 4) { tunnel(k === 0 ? E(u, 0.2, 1.4) : 1);
      if (k === 0) { cert(BX, TY + 110, 'user-svc', { title: '서버 인증서 (TLS)', s: pop(u, 1.2), w: 200 }); cert(AX, TY + 110, 'order-svc', { title: '클라 인증서 (mTLS)', s: pop(u, 1.7), w: 200, col: ACC });
        sub(480, 380, '누가 연결했는가 = 서비스 신원', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      if (k === 1 || k === 2 || k === 4) envelopes(k === 1 ? u : 3, { stay: true, a: 0.3 });
      if (k === 1) { sub(480, 330, 'RPC 마다 authorization 헤더 · 누가 요청했는가 = 사용자 신원', fade(u, 1.8), { 'font-size': 15 }); return; }
      if (k === 2) { pill(260, 340, '채널: order-svc (서비스)', GOOD, pop(u, 0.4), { fs: 14.5 }); pill(700, 340, 'RPC: JWT sub (사용자)', ACC, pop(u, 0.9), { fs: 14.5 });
        mono(480, 345, '×', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); sub(480, 390, '두 신원이 모두 남는다 · 실무 표준', fade(u, 1.8), { 'font-size': 15 }); return; }
      if (k === 3) { card(480, 340, 440, 50, { rx: 10, text: 'grpc.WithTransportCredentials(…)', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.3) }); grow(480, 314, 480, 254, E(u, 0.8, 1.3), GOOD);
        sub(480, 395, '채널 단위 · 연결 하나에 한 번', fade(u, 1.5), { 'font-size': 14.5 }); return; }
      card(480, 350, 440, 50, { rx: 10, text: 'grpc.WithPerRPCCredentials(…)', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.3) }); grow(560, 324, 600, 236, E(u, 0.8, 1.3), ACC);
      sub(480, 400, '등록해 두면 모든 RPC 에 자동 첨부', fade(u, 1.5), { 'font-size': 14.5 }); return; }
    // k5: 실패 상태 갈래 (실행 확인)
    tx(40, 80, '어디서 실패했나에 따라 클라이언트가 받는 코드 (grpcio 로 해 봄)', { 'font-size': 16, 'font-weight': 800 });
    [['핸드셰이크 실패 (인증서 없음 · 다른 CA)', 'UNAVAILABLE (14)', 'HTTP 503', WARN], ['토큰 없음 · 검증 실패', 'UNAUTHENTICATED (16)', 'HTTP 401', BAD], ['신원은 맞지만 권한 없음', 'PERMISSION_DENIED (7)', 'HTTP 403', BAD]].forEach(([a, b, h, col], i) => {
      const y = 140 + i * 82, s = pop(u, 0.3 + i * 0.5); card(480, y, 880, 64, { rx: 10, stroke: col, sw: 2, s });
      tx(60, y + 6, a, { 'font-size': 15, 'font-weight': 600, opacity: s }); mono(560, y + 6, b, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s }); mono(900, y + 6, h, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: s }); }); }

  // ---------- 2. 인증서와 mTLS ----------
  function s2(t, c) { const { k, u } = c; gates(c);
    const CA = [480, 100], SV = [760, 220], CL = [200, 220];
    const caS = k === 0 ? pop(u, 0.3) : 1;
    cert(CA[0], CA[1], 'my-root-ca', { title: 'CA (ca.key · ca.crt)', w: 230, col: WARN, s: caS });
    if (k === 0) { sub(480, 180, '모든 인증서의 뿌리 · 서버와 클라를 같은 CA 로 서명한다', fade(u, 1.0), { 'font-size': 15 }); return; }
    grow(CA[0] + 60, CA[1] + 38, SV[0] - 40, SV[1] - 40, k === 1 ? E(u, 0.2, 0.8) : 1, WARN, { plain: true });
    cert(SV[0], SV[1], 'user-svc', { title: '서버 인증서', w: 230, h: 84, san: 'SAN DNS:user-svc', s: k === 1 ? pop(u, 0.8) : 1 });
    if (k === 1) { pill(760, 300, 'Go 1.15+ 는 SAN 을 본다', GOOD, pop(u, 1.6), { fs: 14 }); sub(480, 370, 'CN 만 있으면 Go 클라이언트가 거절한다 · grpcio · Node 는 CN 도 받아 준다 (실행 확인)', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k >= 2) { grow(CA[0] - 60, CA[1] + 38, CL[0] + 40, CL[1] - 40, k === 2 ? E(u, 0.2, 0.8) : 1, WARN, { plain: true });
      cert(CL[0], CL[1], 'order-svc', { title: '클라 인증서', w: 230, col: ACC, s: k === 2 ? pop(u, 0.8) : 1 }); }
    if (k === 2) { sub(480, 330, '클라 CN 은 서버 쪽에서 호출 서비스 이름으로 쓴다', fade(u, 1.5), { 'font-size': 15 }); return; }
    if (k === 3) { zone(640, 290, 240, 90, 'ClientCAs 풀', { stroke: WARN, dash: '5 4', color: WARN, op: fade(u, 0.2) }); cert(760, 345, 'my-root-ca', { title: 'ca.crt', w: 150, h: 46, col: WARN, s: pop(u, 0.6) });
      sub(380, 345, '서버는 이 풀로 클라 인증서를 검증한다', fade(u, 1.2), { 'font-size': 15 }); return; }
    if (k === 4 || k === 5) { // 핸드셰이크
      const y0 = 300; el('line', { x1: CL[0], y1: y0, x2: SV[0], y2: y0, stroke: GRID, 'stroke-width': 2 });
      const steps = k === 4 ? [['서버: 인증서 내놔 (RequireAndVerifyClientCert)', SV[0], CL[0], INFO], ['클라: CN=order-svc', CL[0], SV[0], ACC], ['서버: CA 로 검증 ✓', SV[0], SV[0], GOOD]]
        : [['서버: CN=user-svc · SAN DNS:user-svc', SV[0], CL[0], INFO], ['클라: RootCAs 로 서명 확인 ✓', CL[0], CL[0], GOOD], ['클라: ServerName "user-svc" 일치 ✓', CL[0], CL[0], GOOD]];
      steps.forEach(([s, a, b, col], i) => { const p = E(u, 0.3 + i * 0.7, 0.9 + i * 0.7), y = y0 + 4 + i * 34;
        if (a !== b) { grow(a, y, b, y, p, col === ACC ? ACC : MUT); } if (p > 0) tx(480, y - 6, s, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: p }); });
      return; }
    if (k === 6) { card(SV[0], 330, 300, 46, { rx: 8, text: 'grpc.Creds(serverCreds())', fs: 14, mono: true, stroke: INK, s: pop(u, 0.3) });
      card(CL[0], 330, 360, 46, { rx: 8, text: 'WithTransportCredentials(clientCreds())', fs: 13.5, mono: true, stroke: INK, s: pop(u, 0.7) });
      sub(480, 390, '채널을 만들 때만 준다 · 그 뒤 호출은 신경 쓰지 않는다', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    terminal(40, 266, 880, 150, ['>>> 서버는 require_client_auth=True (grpcio 로 해 봄)', ['정상 mTLS             → OK · 서버가 본 CN = order-svc', '#86efac'], ['클라 인증서 없음        → UNAVAILABLE (14) 핸드셰이크 실패', '#fca5a5'], ['다른 CA 의 클라 인증서   → UNAVAILABLE (14) 핸드셰이크 실패', '#fca5a5'], ['ServerName billing-svc → UNAVAILABLE (14) Hostname Verification', '#fca5a5']], lerp(1, 5, E(u, 0.2, 2.2)), { fs: 13.5, lh: 21 }); }

  // ---------- 3. PerRPCCredentials ----------
  function s3(t, c) { const { k, u } = c; gates(c);
    if (k === 0) { card(300, 180, 380, 160, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.2) }); mono(130, 128, 'type jwtCreds struct {', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      [['token', 'string'], ['expires', 'time.Time'], ['refresh', 'func() (…)']].forEach(([a, b], i) => { mono(160, 164 + i * 30, a, { 'font-size': 15, fill: ACC, opacity: fade(u, 0.6 + i * 0.3) }); mono(290, 164 + i * 30, b, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.6 + i * 0.3) }); });
      sub(720, 180, '만료 시각을 같이 들고 있어야', fade(u, 1.6), { 'font-size': 15 }); sub(720, 204, '자동 갱신을 넣을 수 있다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 1 || k === 3) { const ret = k === 3;
      for (let i = 0; i < 3; i++) { const x = 180 + i * 300, s = pop(u, 0.2 + i * 0.5);
        card(x, 120, 150, 44, { rx: 8, text: 'RPC ' + (i + 1), fs: 15, stroke: INK, s }); grow(x, 145, x, 200, E(u, 0.4 + i * 0.5, 0.8 + i * 0.5), ACC);
        card(x, 230, 230, 44, { rx: 8, text: 'GetRequestMetadata()', fs: 13.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.6 + i * 0.5) }); }
      if (ret) { card(480, 330, 520, 48, { rx: 8, text: 'map{"authorization": "Bearer " + c.token}', fs: 14.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.6) }); sub(480, 390, '이 map 이 그대로 metadata 가 된다 · 키는 소문자', fade(u, 2.0), { 'font-size': 14.5 }); }
      else sub(480, 330, '호출 직전마다 gRPC 가 부른다 · 그래서 늘 최신 토큰을 만들 수 있다', fade(u, 1.9), { 'font-size': 15 });
      return; }
    if (k === 2) { const X0 = 100, X1 = 860, Y = 200; el('line', { x1: X0, y1: Y, x2: X1, y2: Y, stroke: MUT, 'stroke-width': 1.8 }); tx(X1, Y + 24, '시간 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      const ex = 640; el('rect', { x: X0, y: Y - 50, width: (ex - X0) * E(u, 0.2, 1.0), height: 36, rx: 6, fill: ACC, opacity: 0.8 }); tx(X0 + 12, Y - 26, '토큰 유효', { 'font-size': 14.5, 'font-weight': 700, fill: PANEL, opacity: fade(u, 0.8) });
      el('rect', { x: ex - 120, y: Y - 56, width: 120, height: 48, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.0) }); mono(ex - 60, Y - 66, '마지막 30초', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(ex, Y + 46, 'expires', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); el('line', { x1: ex, y1: Y - 60, x2: ex, y2: Y + 30, stroke: INK, 'stroke-width': 2 });
      const rx = ex - 60; el('line', { x1: rx, y1: Y + 70, x2: rx, y2: Y - 10, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 1.5) }); mono(rx, Y + 92, 'RPC → refresh()', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) });
      el('rect', { x: rx, y: Y - 50, width: (X1 - rx) * E(u, 1.9, 2.6), height: 36, rx: 6, fill: GOOD, opacity: 0.8 });
      sub(480, 360, '만료 30초 전부터는 새 토큰을 받아 둔다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 4) { tunnel(1, { plain: true }); envelopes(u, { bad: true, label: 'Bearer 평문', a: 0.2, stay: false });
      cross(480, TY, 22, pop(u, 1.4));
      terminal(60, 290, 840, 110, ['>>> grpc-js: credentials.createInsecure().compose(callCreds)', ['Error: Cannot compose insecure credentials', '#fca5a5'], 'RequireTransportSecurity() = true 면 TLS 없는 연결에 토큰을 싣지 않는다'], lerp(1, 3, E(u, 1.2, 2.4)), { fs: 14 }); return; }
    tunnel(1);
    if (k === 5) { card(480, 340, 460, 48, { rx: 8, text: 'WithTransportCredentials(clientCreds())', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.3) }); sub(480, 395, 'Step 2 의 mTLS 를 그대로 · 여기까지가 전송 층', fade(u, 1.2), { 'font-size': 14.5 }); return; }
    envelopes(u, { stay: true, a: 0.2 });
    if (k === 6) { card(480, 340, 460, 48, { rx: 8, text: 'WithPerRPCCredentials(&jwtCreds{…})', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.3) }); sub(480, 395, '두 DialOption 을 함께 · 실무 기본 형태', fade(u, 1.5), { 'font-size': 14.5 }); return; }
    terminal(60, 300, 840, 90, ['>>> grpcio: composite_channel_credentials(mTLS, metadata_call_credentials)', ['OK · 서버가 받은 authorization = Bearer good', '#86efac']], lerp(1, 2, E(u, 1.2, 2.2)), { fs: 14 }); }

  // ---------- 4. 서버 검증 ----------
  const CP = [['(A) peer CN', 'mtls'], ['(B) metadata', 'token'], ['Bearer 형식', 'token'], ['JWT 서명', 'token'], ['(C) handler', 'ok']];
  function checkpoints(c, at, o) { o = o || {}; const g = c.beat.gate || {}, u = c.u;
    el('line', { x1: 60, y1: 150, x2: 900, y2: 150, stroke: GRID, 'stroke-width': 3 });
    CP.forEach(([n], i) => { const x = 130 + i * 175, hot = i === at, failHere = hot && o.fail, passed = i < at || (hot && !o.fail);
      const col = failHere ? BAD : hot ? ACC : passed ? GOOD : i === 4 ? INFO : INK;
      card(x, 150, 150, 56, { rx: 10, text: n, fs: 14.5, stroke: col, color: col, sw: hot ? 3 : 2, fill: hot ? (failHere ? BADBG : ACCBG) : PANEL, op: o.fail && i > at ? 0.35 : 1 }); });
    const end = o.fail ? 130 + at * 175 - 80 : 130 + at * 175 - 80;
    if (at > 0 || o.fail) { const p = E(u, 0.2, 1.2); el('circle', { cx: lerp(40, Math.max(40, end), p), cy: 110, r: 8, fill: ACC }); }
    if (o.fail) { const bx = Math.max(220, 130 + at * 175 + 20); cross(130 + at * 175, 104, 12, pop(u, 1.2)); card(bx, 250, 360, 60, { rx: 10, stroke: BAD, sw: 2.5, s: pop(u, 1.4) });
      mono(bx - 165, 246, 'Unauthenticated (16)', { 'font-size': 15, fill: BAD, 'font-weight': 800, opacity: fade(u, 1.5) });
      tx(bx - 165, 270, '"' + o.fail + '"', { 'font-size': 14, opacity: fade(u, 1.6) }); } }
  function s4(t, c) { const { k, u } = c; gates(c);
    if (k === 0) { CP.forEach(([n], i) => card(130 + i * 175, 150, 150, 56, { rx: 10, text: n, fs: 14.5, stroke: i === 4 ? INFO : INK, color: i === 4 ? INFO : INK, s: pop(u, 0.2 + i * 0.25) }));
      el('line', { x1: 60, y1: 190, x2: 60 + 840 * E(u, 0.2, 1.6), y2: 190, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
      sub(480, 260, 'authInterceptor · 모든 RPC 가 이 순서로 지난다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1) { checkpoints(c, 0, { fail: '클라이언트 인증서 없음' }); sub(480, 360, 'RequireAndVerifyClientCert 면 여기 오기 전에 핸드셰이크가 이미 끊는다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 2) { checkpoints(c, 1, { fail: 'metadata 없음' }); sub(480, 360, 'mTLS 를 통과해도 호출 층은 따로 본다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { checkpoints(c, 2, { fail: 'Bearer 토큰 필요' }); mono(480, 360, 'len(vals) == 0 || !HasPrefix(vals[0], "Bearer ")', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 4) { checkpoints(c, 3, {}); check(655, 104, 11, pop(u, 1.2)); sub(480, 260, '서명이 맞아야 호출자가 비로소 확정된다', fade(u, 1.4), { 'font-size': 15 });
      terminal(60, 300, 840, 100, ['>>> grpcio 로 해 봄 (mTLS 위에서)', ["토큰 없음 → UNAUTHENTICATED (16) · 토큰 맞고 admin 요청 → PERMISSION_DENIED (7)", '#fca5a5']], lerp(1, 2, E(u, 1.6, 2.5)), { fs: 14 }); return; }
    if (k === 5) { checkpoints(c, 4, {}); card(480, 270, 420, 50, { rx: 8, text: 'ctx = WithValue(ctx, userKey, claims.Subject)', fs: 13.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.0) });
      sub(480, 340, '핸들러는 ctx 에서 사용자만 꺼내 쓴다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 6 || k === 7) { // peer → TLSInfo → CN
      const chain = [['peer.FromContext(ctx)', 'p'], ['p.AuthInfo.(credentials.TLSInfo)', 'tlsInfo'], ['State.PeerCertificates[0]', 'x509 인증서'], ['.Subject.CommonName', '"order-svc"']];
      chain.slice(0, k === 6 ? 2 : 4).forEach(([a, b], i) => { const y = 90 + i * 72, s = (k === 6 || i >= 2) ? pop(u, 0.2 + (i % 2) * 0.6) : 1;
        card(330, y, 460, 50, { rx: 8, text: a, fs: 14, mono: true, stroke: i === 3 ? GOOD : INK, color: i === 3 ? GOOD : INK, s }); mono(590, y + 5, '→ ' + b, { 'font-size': 15, fill: i === 3 ? GOOD : MUT, 'font-weight': 700, opacity: s });
        if (i) grow(330, y - 47, 330, y - 26, s, MUT); });
      if (k === 7) sub(480, 400, 'grpcio 에서도 auth_context() 의 x509_common_name 이 order-svc 였다', fade(u, 1.8), { 'font-size': 14.5 });
      else sub(480, 300, 'peer 는 전송 계층 정보 · mTLS 결과가 여기 담긴다', fade(u, 1.6), { 'font-size': 14.5 });
      return; }
    card(480, 120, 480, 120, { rx: 12, stroke: INK, sw: 2.5, s: pop(u, 0.2) }); mono(260, 92, 'grpc.NewServer(', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
    mono(290, 124, 'grpc.Creds(serverCreds()),', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 0.6) }); mono(290, 152, 'grpc.UnaryInterceptor(authInterceptor),', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.0) });
    pill(300, 260, '전송 층: mTLS', GOOD, pop(u, 1.4), { fs: 15 }); pill(660, 260, '호출 층: 토큰 게이트', ACC, pop(u, 1.7), { fs: 15 });
    sub(480, 330, '두 층이 서버에서도 나란히 선다', fade(u, 2.1), { 'font-size': 15 }); }

  // ---------- 5. 한 장 정리 ----------
  function s5(t, c) { const { k, u } = c; gates(c);
    if (k === 0) { const rows = [['', '무엇을 증명', '범위', 'Go API'], ['전송 (mTLS)', '서비스 신원', '채널 1회', 'credentials.NewTLS'], ['호출 (토큰)', '사용자 신원', 'RPC 마다', 'PerRPCCredentials']];
      rows.forEach((r, i) => { const y = 110 + i * 70, a = fade(u, 0.2 + i * 0.5); if (i) el('rect', { x: 40, y: y - 30, width: 880, height: 56, rx: 8, fill: i === 1 ? GOODBG : ACCBG, opacity: a });
        r.forEach((v, j) => tx([60, 260, 470, 640][j], y + 5, v, { 'font-size': i ? 15 : 14, 'font-weight': i && j === 0 ? 800 : i ? 600 : 700, fill: i ? (j === 3 ? INK : INK) : MUT, class: j === 3 && i ? 'mono' : null, opacity: a })); });
      sub(480, 360, '증명하는 대상과 범위가 달라 둘 다 필요하다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1) { const N = [['사용자', 110], ['게이트웨이', 400], ['내부 서비스', 720]];
      person(N[0][1], 210, '사용자', { s: pop(u, 0.2) }); card(N[1][1], 210, 170, 60, { rx: 10, text: '게이트웨이', fs: 15, s: pop(u, 0.5) }); card(N[2][1], 210, 190, 60, { rx: 10, text: '내부 서비스', fs: 15, s: pop(u, 0.8) });
      grow(150, 210, 310, 210, E(u, 0.9, 1.4), ACC); pill(230, 160, 'JWT', ACC, pop(u, 1.3), { fs: 14 });
      grow(490, 210, 620, 210, E(u, 1.4, 1.9), GOOD); pill(555, 140, 'mTLS', GOOD, pop(u, 1.8), { fs: 14 }); pill(555, 175, '+ 전파 토큰', ACC, pop(u, 2.0), { fs: 13.5 });
      sub(480, 320, '내부끼리는 mTLS · 사용자 요청은 JWT · 게이트웨이 뒤는 둘 다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 2) { [['peer.FromContext', 'mTLS CN · 서비스', GOOD], ['metadata.FromIncoming', 'authorization · 사용자', ACC], ['WithValue → handler', '통과', INFO]].forEach(([a, b, col], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.5);
        card(x, 170, 270, 80, { rx: 10, stroke: col, sw: 2.5, s }); mono(x, 166, a, { 'font-size': 14, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: s }); tx(x, 192, b, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: s });
        if (i < 2) grow(x + 140, 170, x + 170, 170, E(u, 0.5 + i * 0.5, 0.8 + i * 0.5), MUT); });
      sub(480, 290, '검증은 인터셉터 한 곳 · 핸들러는 손대지 않는다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 3) { tunnel(1, { plain: true }); envelopes(u, { bad: true, label: 'Bearer eyJ…', a: 0.2, stay: true });
      person(480, 340, '엿보는 쪽', { s: pop(u, 1.4), stroke: BAD }); grow(480, 312, 560, 236, E(u, 1.6, 2.0), BAD);
      sub(480, 405, 'RequireTransportSecurity 가 false 면 토큰이 그대로 보인다', fade(u, 2.0), { 'font-size': 14.5, fill: BAD }); return; }
    if (k === 4) { const X0 = 160, X1 = 860; el('line', { x1: X0, y1: 330, x2: X1, y2: 330, stroke: MUT, 'stroke-width': 1.8 }); mono(X0, 354, '발급일', { 'font-size': 14, 'text-anchor': 'middle' }); mono(X1 - 80, 354, '+365일 (-days 365)', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
      ['user-svc', 'order-svc', 'billing-svc'].forEach((n, i) => { const y = 120 + i * 62, g = E(u, 0.2 + i * 0.2, 1.4 + i * 0.2);
        mono(40, y + 24, n, { 'font-size': 14.5 }); el('rect', { x: X0, y: y + 4, width: (X1 - 80 - X0) * g, height: 30, rx: 6, fill: GOOD, opacity: 0.75 });
        if (u > 1.8) cross(X1 - 60, y + 19, 10, pop(u, 1.8 + i * 0.15)); });
      el('line', { x1: X1 - 80, y1: 100, x2: X1 - 80, y2: 330, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 1.6) });
      sub(480, 400, '같은 날 발급하면 같은 날 동시에 핸드셰이크가 끊긴다 · 자동 갱신 필요', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    [['UNAUTHENTICATED (16)', '신원 실패', '재로그인 · 토큰 갱신', BAD], ['PERMISSION_DENIED (7)', '권한 없음', '다시 보내도 같다', WARN], ['UNAVAILABLE (14)', '핸드셰이크 실패', '인증서 · 연결 점검', INFO]].forEach(([a, b, d, col], i) => {
      const y = 110 + i * 90, s = pop(u, 0.3 + i * 0.5); card(480, y, 880, 70, { rx: 12, stroke: col, sw: 2, s });
      mono(60, y + 6, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s }); tx(400, y + 6, b, { 'font-size': 15, 'font-weight': 600, opacity: s }); tx(620, y + 6, '→ ' + d, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.5 + i * 0.5) }); }); }

  const quiz = [
    { q: 'mTLS 채널과 호출별 JWT가 각각 증명하는 것은 무엇인가?',
      o: ['둘 다 사용자 신원', '채널은 서비스 신원, JWT는 사용자 신원', '채널은 사용자 신원, JWT는 서비스 신원'], a: 1,
      why: 'mTLS는 연결할 때 한 번 양쪽 인증서로 어느 서비스인지 증명하고, JWT는 RPC마다 요청한 사용자를 증명한다.' },
    { q: 'TLS를 mTLS로 바꾸는 서버 설정 한 줄은 무엇인가?',
      o: ['ClientAuth: tls.RequireAndVerifyClientCert', 'ServerName: "user-svc"', 'RootCAs: pool'], a: 0,
      why: 'ClientAuth를 RequireAndVerifyClientCert로 두고 ClientCAs에 CA 풀을 주면 서버가 클라 인증서를 요구하고 검증한다.' },
    { q: 'PerRPCCredentials의 RequireTransportSecurity가 true일 때 TLS 없는 연결에서는 어떻게 되나?',
      o: ['토큰을 평문으로 보낸다', '토큰을 base64로 바꿔 보낸다', '토큰을 싣지 않고 연결 구성을 거절한다'], a: 2,
      why: '평문 채널에 토큰이 실리는 것을 막는다. grpc-js로 해 보면 "Cannot compose insecure credentials" 오류가 난다.' },
    { q: '서버 인터셉터에서 호출한 서비스 이름(order-svc)을 얻는 곳은 어디인가?',
      o: ['peer 정보의 TLS 인증서 CommonName', 'metadata의 authorization', 'info.FullMethod'], a: 0,
      why: 'peer.FromContext로 얻은 TLSInfo의 PeerCertificates[0].Subject.CommonName이 클라 인증서의 CN이다.' },
    { q: '토큰은 유효한데 다른 사용자의 데이터를 요청했다. 서버가 돌려줄 코드는 무엇인가?',
      o: ['UNAUTHENTICATED (16)', 'UNAVAILABLE (14)', 'PERMISSION_DENIED (7)'], a: 2,
      why: '신원은 확인됐지만 권한이 없으니 PermissionDenied다. 클라이언트는 다시 로그인하거나 재시도해도 결과가 같다.' },
  ];

  const summary = [
    'gRPC 인증은 채널의 서비스 신원과 RPC마다의 사용자 신원, 두 층으로 나뉜다.',
    'mTLS는 같은 CA로 서명한 인증서를 양쪽이 내고, 서버는 RequireAndVerifyClientCert로 검증한다.',
    'PerRPCCredentials가 모든 RPC에 Bearer 토큰을 붙이고, TLS 없는 연결에는 싣지 않는다.',
    '서버 인터셉터가 peer CN과 토큰을 함께 보고, 실패는 Unauthenticated와 PermissionDenied로 나눈다.',
  ];
  const review = [
    { q: 'Go 클라이언트가 openssl로 CN=user-svc만 넣어 만든 서버 인증서에 연결하자 핸드셰이크가 실패했다. Python 클라이언트는 같은 인증서로 붙는다. 먼저 고칠 것은?',
      o: ['ServerName을 지운다', 'RequireTransportSecurity를 false로 바꾼다', '서버 인증서에 SAN DNS:user-svc를 넣어 다시 발급한다'], a: 2,
      why: 'Go 1.15부터 이름 확인에 CN을 쓰지 않고 SAN만 본다. grpcio와 Node는 SAN이 없으면 CN도 받아 주어서 차이가 났다.' },
    { q: '배포 1년 뒤 어느 날 모든 내부 서비스 호출이 UNAVAILABLE로 동시에 실패했다. 가장 먼저 의심할 것은?',
      o: ['JWT 서명 키 유출', '같은 날 -days 365로 발급한 인증서의 일괄 만료', '권한 설정 변경'], a: 1,
      why: '핸드셰이크 실패는 UNAVAILABLE로 보인다. 한꺼번에 발급한 인증서는 한꺼번에 끊기므로 자동 갱신 체계가 필요하다.' },
    { q: '클라이언트가 UNAUTHENTICATED를 받으면 토큰을 새로 받아 다시 보내도록 만들었다. PERMISSION_DENIED에도 같은 처리를 넣어야 하나?',
      o: ['넣지 않는다, 권한 문제라 다시 보내도 같다', '넣는다, 토큰을 바꾸면 풀린다', '넣는다, 몇 번 하면 통과된다'], a: 0,
      why: 'PermissionDenied는 신원은 맞고 권한이 없다는 뜻이다. 재로그인이나 재시도로 바뀌지 않으니 사용자에게 권한 부족을 알린다.' },
  ];

  R.page({ title: 'Auth — 전송 층 × 호출 층', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
