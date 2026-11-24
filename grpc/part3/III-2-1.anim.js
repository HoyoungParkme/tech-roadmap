/* III-2-1 Client Interceptor — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 나가는 길(클라 → Auth → Logging → invoker → 서버)의 강조는 STEPS 의 phase · activeStage 를 읽는다.
 * 터미널의 실행 순서·서버 호출 횟수·오류 문구는 grpcio 1.85.3 클라이언트 인터셉터로 직접 돌린 결과다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells,
    zone, server, person, cross, check, lock, clock, terminal, snippet, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // 나가는 길: 다섯 칸 (STEPS 의 activeStage 번호와 같다)
  const ST = [['client', 'stub.GetUser()'], ['Auth', '토큰 주입'], ['Logging', '지연 측정'], ['invoker', '네트워크 전송'], ['Server', 'handler(ctx)']];
  const SX = [95, 285, 455, 625, 850], PY = 120;
  function path(c, o) { o = o || {}; const b = c.beat, act = b.activeStage, ph = b.phase, u = c.u;
    el('line', { x1: SX[0], y1: PY, x2: SX[4], y2: PY, stroke: GRID, 'stroke-width': 3 });
    zone(195, PY - 62, 350, 124, '클라이언트 인터셉터', { fill: 'none', stroke: ACC, dash: '6 5', color: ACC, op: o.zop ?? 1 });
    ST.forEach(([n, d], i) => { const hot = act === i, s = o.appear ? o.appear(i) : 1; if (s <= 0) return;
      if (i === 4) { server(SX[4], PY - 6, null, { s: 0.75 * s, stroke: hot ? ACC : INK }); tx(SX[4], PY + 56, 'Server', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); return; }
      card(SX[i], PY, i === 0 ? 150 : 140, 54, { rx: 10, stroke: hot ? ACC : i === 3 ? INFO : INK, sw: hot ? 3 : 2, fill: hot ? ACCBG : PANEL, s });
      tx(SX[i], PY - 3, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: hot ? ACC : i === 3 ? INFO : INK, class: i === 3 || i === 0 ? 'mono' : null, opacity: s });
      tx(SX[i], PY + 17, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); });
    if (o.noflow) return;
    if (ph === 'request') dot([[SX[0], PY - 40], [SX[4], PY - 40]], seg(u, 0.2, 2.2), ACC, 7);
    if (ph === 'response') dot([[SX[4], PY + 44], [SX[0], PY + 44]], seg(u, 0.2, 2.2), GOOD, 7);
    if (ph === 'request' && u > 2.2) grow(SX[0], PY - 40, SX[4] - 50, PY - 40, 1, ACC);
    if (ph === 'response' && u > 2.2) grow(SX[4] - 50, PY + 44, SX[0] + 70, PY + 44, 1, GOOD); }

  // ---------- 1. 개요 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { path(c, { appear: k === 0 ? (i) => pop(u, 0.2 + i * 0.3) : null });
      if (k === 0) { sub(480, 260, '클라이언트가 내보내는 모든 RPC 가 이 길을 지난다', fade(u, 1.8), { 'font-size': 15 }); return; }
      [['인증 주입', ACC], ['로깅', ACC], ['메트릭', ACC], ['재시도', WARN], ['deadline', WARN]].forEach(([a, col], i) => pill(150 + i * 165, 290, a, col, pop(u, 0.2 + i * 0.3), { fs: 15 }));
      sub(480, 350, '호출마다 반복하던 일을 한 곳으로', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 2 || k === 3) { const after = k === 3;
      for (let i = 0; i < 3; i++) { const x = 40 + i * 300, s = pop(u, 0.2 + i * 0.3);
        zone(x, 40, 270, after ? 90 : 230, '호출 지점 ' + (i + 1), { fill: SOFT, op: s });
        const ls = after ? ['client.GetUser(ctx, req)'] : ['ctx = injectToken(ctx)', 'log.Println("call…")', 'start := time.Now()', 'client.GetUser(ctx, req)', 'log.Println("took…")'];
        ls.forEach((l, j) => { const miss = !after && i === 2 && j === 0;
          mono(x + 16, 84 + j * 34, l, { 'font-size': 14, fill: miss ? BAD : j === (after ? 0 : 3) ? INK : MUT, 'text-decoration': miss ? 'line-through' : null, opacity: s }); });
        if (!after && i === 2) pill(x + 200, 300, '빠뜨림 → 토큰 없음', BAD, pop(u, 1.6), { fs: 13.5 }); }
      if (after) { card(480, 230, 520, 60, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'WithChainUnaryInterceptor(…) 한 번 등록', fs: 15, mono: true, color: ACC, s: pop(u, 1.0) });
        [190, 490, 790].forEach((x, i) => grow(480, 200, x - 15, 132, E(u, 1.5 + i * 0.15, 2.0 + i * 0.15), ACC));
        sub(480, 320, '나머지는 자동으로 붙는다', fade(u, 2.2), { 'font-size': 15 }); }
      return; }
    // k4, k5: 서버와 대칭
    const S = k === 5;
    [['클라이언트', 'UnaryClientInterceptor', 'invoker (실제 전송)', 'WithChainUnaryInterceptor'], ['서버', 'UnaryServerInterceptor', 'handler (실제 처리)', 'ChainUnaryInterceptor']].forEach(([a, b, c2, d], i) => {
      const x = 240 + i * 480, s = k === 4 ? pop(u, 0.2 + i * 0.5) : 1;
      tx(x, 50, a, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: s });
      [b, c2, d].forEach((v, j) => card(x, 100 + j * 52, 360, 42, { rx: 8, text: v, fs: 14, mono: true, stroke: j === 1 ? ACC : GRID, color: j === 1 ? ACC : INK, s: k === 4 ? pop(u, 0.4 + i * 0.5 + j * 0.2) : 1 })); });
    if (!S) { sub(480, 300, '이름만 바뀐 같은 구조', fade(u, 2.0), { 'font-size': 15 }); return; }
    el('line', { x1: 80, y1: 310, x2: 880, y2: 310, stroke: GRID, 'stroke-width': 3 });
    zone(100, 270, 240, 80, '나가는 요청을 감싼다', { fill: 'none', stroke: ACC, dash: '6 5', color: ACC, op: fade(u, 0.3) });
    zone(620, 270, 240, 80, '들어오는 요청을 감싼다', { fill: 'none', stroke: INFO, dash: '6 5', color: INFO, op: fade(u, 0.8) });
    grow(80, 330, 880, 330, E(u, 0.6, 2.4), ACC); }

  // ---------- 2. 시그니처 ----------
  const ARGS = ['ctx', 'method', 'req', 'reply', 'cc', 'invoker', 'opts…'];
  function sig(k, u, hl) { mono(40, 60, 'func(', { 'font-size': 15, 'font-weight': 700 });
    ARGS.forEach((a, i) => { const hot = hl.includes(i); card(110 + i * 118, 100, 108, 44, { rx: 8, text: a, fs: 15, mono: true, stroke: hot ? (i === 5 ? INFO : ACC) : GRID, color: hot ? (i === 5 ? INFO : ACC) : INK, fill: hot ? (i === 5 ? INFOBG : ACCBG) : PANEL, s: k === 0 ? pop(u, 0.2 + i * 0.15) : 1, dash: i === 3 ? '5 4' : null }); });
    mono(40, 150, ') error', { 'font-size': 15, 'font-weight': 700 }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { sig(k, u, k === 0 ? [0, 1, 2, 3, 4] : [5]);
      if (k === 0) { mono(110 + 1 * 118 - 54, 180, '"/user.v1.UserService/GetUser"', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3) });
        sub(110 + 3 * 118, 220, 'reply 는 빈 그릇 · invoker 가 채운다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
      grow(110 + 5 * 118, 124, 110 + 5 * 118, 230, E(u, 0.4, 1.0), INFO);
      card(110 + 5 * 118, 270, 300, 60, { rx: 10, text: '다음 인터셉터\n또는 네트워크 전송', fs: 14.5, stroke: INFO, color: INFO, s: pop(u, 1.0) });
      sub(480, 370, '부르는 순간 안쪽 전부가 실행된다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 2) { card(480, 160, 820, 180, { rx: 14, stroke: INK, sw: 2.5, s: pop(u, 0.2) }); mono(90, 100, 'func LoggingInterceptor(ctx, method, req, reply, cc, invoker, opts…) error {', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.5) });
      ['start := time.Now()', 'err := invoker(ctx, method, req, reply, cc, opts...)', 'return err'].forEach((l, i) => mono(120, 150 + i * 32, l, { 'font-size': 14, fill: i === 1 ? INFO : INK, opacity: fade(u, 0.9 + i * 0.3) }));
      sub(480, 300, '타입만 맞으면 인터셉터가 된다 · 따로 구현할 인터페이스가 없다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    // k3~k7: 시간 위의 세 구간
    const X0 = 100, X1 = 860, Y = 190;
    el('line', { x1: X0, y1: Y + 90, x2: X1 + 20, y2: Y + 90, stroke: MUT, 'stroke-width': 1.8 }); tx(X1 + 20, Y + 110, '시간 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    const segs = [[X0, 300, '요청 가공', ACC], [300, 660, 'invoker = 전송', INFO], [660, X1, '응답 처리', GOOD]];
    segs.forEach(([a, b, n, col], i) => { const on = k === 3 ? i === 0 : k === 4 ? i <= 1 : true, g = k === 4 && i === 1 ? E(u, 0.2, 1.6) : k === 5 && i === 2 ? E(u, 0.2, 1.0) : 1;
      if (!on && !(k === 5 && i === 2)) return; el('rect', { x: a, y: Y, width: (b - a - 6) * g, height: 48, rx: 8, fill: col, opacity: k === 7 || (k === 3 && i === 0) || (k === 4 && i === 1) || (k === 5 && i === 2) ? 0.9 : 0.3 });
      tx(a + 12, Y + 30, n, { 'font-size': 15, 'font-weight': 700, fill: PANEL, opacity: g > 0.5 ? 1 : 0 }); });
    if (k === 3) { mono(X0, Y - 70, 'start := time.Now()', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(X0, Y - 40, 'log.Printf("→ [call] %s", method)', { 'font-size': 14.5, opacity: fade(u, 0.8) });
      sub(480, 360, '여기서 ctx · req 를 고치면 그 상태로 나간다', fade(u, 1.5), { 'font-size': 15 }); return; }
    if (k === 4) { dot([[320, Y - 30], [640, Y - 30]], seg(u, 0.2, 1.6), INFO, 7); card(480, 80, 280, 44, { rx: 8, text: 'reply ← User{Name:"Alice"}', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.8), dash: null });
      sub(480, 360, '빠뜨리면 요청이 아예 나가지 않는다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 5) { grow(X0, Y - 30, X1, Y - 30, E(u, 0.4, 1.3), GOOD); mono(480, Y - 40, 'elapsed := time.Since(start)', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      sub(480, 360, '왕복 지연은 invoker 를 감싸는 자리에서만 정확히 잰다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 6) { card(760, 70, 200, 44, { rx: 8, text: 'return err', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.2) }); check(890, 70, 10, pop(u, 0.4));
      card(500, 70, 220, 44, { rx: 8, text: 'return nil', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.9) }); cross(640, 70, 10, pop(u, 1.1));
      sub(500, 128, '실패를 삼키면 호출부는 영영 모른다', fade(u, 1.4), { 'font-size': 14, fill: BAD });
      sub(480, 360, '로깅 인터셉터는 관찰만 한다', fade(u, 1.8), { 'font-size': 15 }); return; }
    sub(480, 360, 'invoker 앞 · invoker · 뒤, 이 셋이 전부다', fade(u, 0.6), { 'font-size': 16, fill: INK, 'font-weight': 700 }); }

  // ---------- 3. 토큰 자동 주입 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0 || k === 6) { card(480, 80, 360, 56, { rx: 10, text: 'TokenSource\nToken(ctx) (string, error)', fs: 14.5, mono: true, stroke: ACC, color: ACC, s: k === 0 ? pop(u, 0.2) : 1 });
      [['staticToken', '고정 값 반환', 270], ['갱신하는 구현', '만료 확인 · refresh · 캐시', 690]].forEach(([a, b, x], i) => { const hot = k === 6 && i === 0;
        grow(480, 108, x, 186, k === 0 ? E(u, 0.7 + i * 0.3, 1.2 + i * 0.3) : 1, MUT);
        card(x, 220, 300, 64, { rx: 10, text: a + '\n' + b, fs: 14, stroke: hot ? ACC : GRID, color: hot ? ACC : INK, s: k === 0 ? pop(u, 1.1 + i * 0.3) : 1, sw: hot ? 3 : 2 }); });
      if (k === 6) { mono(270, 300, 'return s.value, nil', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5) }); sub(480, 360, '테스트 · 개발 환경에 쓴다', fade(u, 1.0), { 'font-size': 15 }); }
      else sub(480, 330, '토큰을 어디서 얻는지 감춰 두면 갈아 끼우기 쉽다', fade(u, 1.8), { 'font-size': 15 });
      return; }
    if (k === 1 || k === 2) { card(480, 190, 760, 260, { rx: 16, stroke: INK, sw: 2, s: k === 1 ? pop(u, 0.2) : 1 }); mono(120, 84, 'AuthInterceptor(ts TokenSource) grpc.UnaryClientInterceptor', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.4) : 1 });
      card(480, 210, 640, 140, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: k === 1 ? pop(u, 1.0) : 1 }); mono(180, 168, 'return func(ctx, method, req, reply, cc, invoker, opts…) error', { 'font-size': 14, fill: ACC, opacity: k === 1 ? fade(u, 1.2) : 1 });
      pill(260, 230, 'ts 캡처', WARN, k === 1 ? pop(u, 1.6) : 1, { mono: true });
      if (k === 2) { ['ctx', 'method', 'req', 'reply', 'cc', 'invoker', 'opts'].forEach((a, i) => card(360 + i * 72, 230, 66, 34, { rx: 6, text: a, fs: 13.5, mono: true, stroke: i === 5 ? INFO : GRID, s: pop(u, 0.2 + i * 0.12) }));
        sub(480, 360, 'Step 2 와 같은 7인자 · 다른 건 캡처한 ts 뿐', fade(u, 1.6), { 'font-size': 15 }); }
      else sub(480, 360, '설정이 필요한 인터셉터는 클로저를 돌려주는 팩토리로 만든다', fade(u, 2.0), { 'font-size': 14.5 });
      return; }
    if (k === 3) { path(c, { noflow: true }); mono(285, 230, 'token, err := ts.Token(ctx)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      mono(285, 270, 'err != nil → return err', { 'font-size': 14.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.0) });
      cross(625, PY - 50, 13, pop(u, 1.3)); sub(625, 230, '전송하지 않는다', fade(u, 1.5), { 'font-size': 14, fill: BAD });
      sub(480, 340, '토큰이 없으면 서버까지 갈 필요가 없다', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 4 || k === 5) { // ctx → 새 ctx
      card(170, 110, 220, 70, { rx: 10, text: 'ctx (원본)\nmetadata 없음', fs: 14.5, stroke: GRID, s: k === 4 ? pop(u, 0.2) : 1 });
      grow(285, 110, 480, 110, k === 4 ? E(u, 0.5, 1.0) : 1, ACC); mono(382, 92, 'AppendToOutgoingContext', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 0.6) : 1 });
      card(660, 110, 320, 96, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: k === 4 ? pop(u, 1.0) : 1 });
      mono(515, 96, 'ctx (새것)', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: k === 4 ? fade(u, 1.1) : 1 });
      mono(515, 122, 'authorization: Bearer …', { 'font-size': 14, opacity: k === 4 ? fade(u, 1.3) : 1 }); mono(515, 146, 'x-client-version: 1.4.2', { 'font-size': 14, opacity: k === 4 ? fade(u, 1.5) : 1 });
      if (k === 4) { sub(480, 230, '원본은 그대로 두고 헤더가 실린 새 ctx 를 돌려준다', fade(u, 1.9), { 'font-size': 15 }); return; }
      terminal(40, 220, 880, 130, ['>>> grpcio 로 해 봄: 서버가 받은 authorization', ['invoker(새 ctx)        → Bearer my-secret-token', '#86efac'], ['invoker(원본 ctx) 실수  → None', '#fca5a5']], lerp(1, 3, E(u, 0.3, 1.8)), { fs: 14.5 });
      sub(480, 390, '새로 만들어 놓고 원본을 넘기면 헤더가 안 실린다', fade(u, 2.0), { 'font-size': 15, fill: BAD }); return; }
    // k7: 갱신 · 캐시
    const X0 = 100, X1 = 860; el('line', { x1: X0, y1: 220, x2: X1, y2: 220, stroke: MUT, 'stroke-width': 1.8 }); tx(X1, 244, '시간 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    [[X0, 470, '토큰 A'], [470, X1, '토큰 B']].forEach(([a, b, n], i) => { const g = E(u, 0.2 + i * 1.0, 1.0 + i * 1.0); el('rect', { x: a, y: 160, width: (b - a - 8) * g, height: 40, rx: 8, fill: i ? GOOD : ACC, opacity: 0.85 }); tx(a + 12, 186, n, { 'font-size': 15, 'font-weight': 700, fill: PANEL, opacity: g > 0.3 ? 1 : 0 }); });
    pill(470, 110, '만료 전 refresh · 캐시', WARN, pop(u, 1.1), { fs: 14 });
    for (let i = 0; i < 7; i++) { const x = 140 + i * 110; if (fade(u, 0.2 + i * 0.3) > 0) { el('line', { x1: x, y1: 260, x2: x, y2: 210, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.2 + i * 0.3) }); mono(x, 284, 'RPC', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.2 + i * 0.3) }); } }
    sub(480, 350, '모든 RPC 가 늘 유효한 토큰을 들고 나간다', fade(u, 2.2), { 'font-size': 15 }); }

  // ---------- 4. 등록과 체인, 재시도 ----------
  const TR_IN = ['auth 전', 'logging 전', ['retry 1/3 (UNAVAILABLE)', '#fbbf24'], ['retry 2/3 (UNAVAILABLE)', '#fbbf24'], ['3번째 성공', '#86efac'], 'logging 후', 'auth 후', '', ['서버 호출 3번 · 토큰 조회 1번', '#93c5fd'], ['서버가 받은 토큰: tok-1, tok-1, tok-1', '#93c5fd']];
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { mono(40, 50, 'RetryInterceptor(max int)', { 'font-size': 15, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 });
      card(480, 100, 360, 46, { rx: 10, text: 'for attempt := 1; attempt <= max', fs: 14, mono: true, stroke: k >= 1 ? ACC : GRID, color: k >= 1 ? ACC : INK, s: k === 0 ? pop(u, 0.6) : 1 });
      if (k === 0) { sub(480, 200, '최대 횟수를 캡처하는 팩토리 · 안쪽 클로저가 인터셉터', fade(u, 1.2), { 'font-size': 15 }); return; }
      for (let i = 0; i < 3; i++) { const y = 170 + i * 66, a = k === 1 ? E(u, 0.2 + i * 0.6, 0.6 + i * 0.6) : 1, ok = i === 2;
        mono(60, y + 5, '시도 ' + (i + 1), { 'font-size': 14.5, opacity: a }); grow(140, y, 560, y, a, ok ? GOOD : WARN);
        if (a >= 1) pill(680, y, ok ? 'OK → 바로 return' : 'UNAVAILABLE (14)', ok ? GOOD : WARN, 1, { mono: true, fs: 13.5 });
        if (k === 2 && !ok) { el('rect', { x: 140, y: y + 14, width: 100 * (i + 1) * E(u, 0.3, 1.2), height: 14, rx: 3, fill: OFF }); mono(150 + 100 * (i + 1), y + 26, (i + 1) * 100 + 'ms 대기', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) }); } }
      if (k === 2) { card(820, 380, 240, 40, { rx: 8, text: '그 밖의 코드 → 즉시 return', fs: 14, stroke: BAD, color: BAD, s: pop(u, 1.5) });
        sub(320, 392, '일시 오류만 다시 · 간격은 점점 길게', fade(u, 1.8), { 'font-size': 14 }); }
      return; }
    if (k === 4) { card(480, 90, 520, 56, { rx: 10, text: 'grpc.NewClient("localhost:50051", …)', fs: 15, mono: true, s: pop(u, 0.2) });
      ['WithTransportCredentials(insecure…)', 'WithChainUnaryInterceptor(…)'].forEach((a, i) => card(480, 170 + i * 60, 460, 44, { rx: 8, text: a, fs: 14, mono: true, stroke: i ? ACC : GRID, color: i ? ACC : INK, s: pop(u, 0.7 + i * 0.4) }));
      sub(480, 330, '인터셉터는 호출이 아니라 연결에 등록한다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 6) { [['Unary 체인', 'GetUser', ACC, 130], ['Stream 체인 (따로 등록)', 'ListUsers', WARN, 270]].forEach(([a, m, col, y], i) => { const s = fade(u, 0.2 + i * 0.7);
        el('rect', { x: 240, y: y - 30, width: 480, height: 60, rx: 30, fill: 'none', stroke: col, 'stroke-width': 3, opacity: s }); tx(250, y - 40, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: s });
        mono(140, y + 5, m, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: s }); grow(220, y, 760, y, E(u, 0.5 + i * 0.7, 1.4 + i * 0.7), col); });
      sub(480, 370, 'WithChainStreamInterceptor 를 따로 걸어야 스트리밍도 탄다', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k3, k5, k7: 체인 그림 (auth → logging → retry → invoker)
    const NM = ['auth', 'logging', 'retry', 'invoker'], cx = [150, 330, 510, 700];
    NM.forEach((n, i) => card(cx[i], 90, 150, 50, { rx: 10, text: n, fs: 15, mono: true, stroke: i === 3 ? INFO : ACC, color: i === 3 ? INFO : ACC, s: k === 3 ? pop(u, 0.2 + i * 0.25) : 1 }));
    server(870, 90, null, { s: 0.6 });
    if (k === 3) { grow(80, 140, 860, 140, E(u, 1.2, 2.0), ACC); grow(860, 165, 80, 165, E(u, 1.8, 2.6), GOOD);
      sub(480, 210, '요청은 등록 순 · 응답은 역순 · 앞에 적을수록 바깥', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 5) { terminal(40, 150, 600, 260, TR_IN, lerp(1, TR_IN.length, E(u, 0.2, 2.5)), { title: 'grpcio 로 해 봄 (서버가 2번 UNAVAILABLE)', fs: 14, lh: 21 });
      note(670, 200, 'retry 가 안쪽', fade(u, 1.2)); note(670, 228, '→ 토큰은 한 번 받고', fade(u, 1.4)); note(670, 256, '재시도는 같은 토큰', fade(u, 1.6));
      note(670, 320, 'retry 를 auth 바깥에', fade(u, 2.0), { fill: WARN }); note(670, 348, '두면 tok-1, 2, 3', fade(u, 2.2), { fill: WARN }); return; }
    grow(80, 140, 860, 140, E(u, 0.2, 1.2), ACC); grow(860, 165, 80, 165, E(u, 1.2, 2.2), GOOD);
    card(480, 270, 520, 50, { rx: 10, text: 'client.GetUser(ctx, &pb.GetUserRequest{UserId: "u-42"})', fs: 13.5, mono: true, stroke: INK, s: pop(u, 0.2) });
    sub(480, 330, '호출부는 한 줄 · 나머지는 체인이 맡는다', fade(u, 1.8), { 'font-size': 15 }); }

  // ---------- 5. Python + 함정 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 80, 340, 50, { rx: 10, text: 'grpc.UnaryUnaryClientInterceptor', fs: 14.5, mono: true, s: pop(u, 0.2) }); grow(480, 105, 480, 170, E(u, 0.5, 0.9), MUT);
      card(480, 210, 340, 70, { rx: 10, text: 'AuthLoggingInterceptor\n__init__(token)', fs: 14.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.9) });
      sub(480, 300, 'Go 의 팩토리 자리 · 설정은 생성자에서 받는다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 1) { mono(40, 60, 'intercept_unary_unary(self, continuation, call_details, request)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      pill(200, 120, 'continuation = invoker', INFO, pop(u, 0.5), { mono: true });
      tx(40, 190, 'call_details 칸 (실행 확인)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9) });
      ['method', 'timeout', 'metadata', 'credentials', 'wait_for_ready', 'compression'].forEach((f, i) => card(160 + (i % 3) * 250, 230 + Math.floor(i / 3) * 52, 230, 40, { rx: 8, text: f, fs: 14.5, mono: true, stroke: i === 2 ? ACC : GRID, color: i === 2 ? ACC : INK, s: pop(u, 1.0 + i * 0.15) }));
      sub(480, 370, 'namedtuple 이라 _replace 로 새 값을 만든다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 2) { card(200, 110, 300, 80, { rx: 10, text: 'call_details\nmetadata = None', fs: 14.5, mono: true, s: pop(u, 0.2) });
      grow(355, 110, 500, 110, E(u, 0.6, 1.0), ACC); mono(360, 96, '_replace(metadata=…)', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 0.7) });
      card(700, 110, 380, 80, { rx: 10, text: 'new_details\n[("authorization", "Bearer …")]', fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.1) });
      sub(480, 230, '원본은 그대로 · 새 call_details 를 만든다', fade(u, 1.7), { 'font-size': 15 }); return; }
    if (k >= 3 && k <= 5) { const X0 = 100, X1 = 860, Y = 150;
      [[X0, 300, '요청 단계', ACC], [300, 660, 'continuation(new_details, request)', INFO], [660, X1, '응답 단계', GOOD]].forEach(([a, b, n, col], i) => { const show = i <= k - 3; if (!show) return;
        const g = i === k - 3 ? E(u, 0.2, 1.2) : 1; el('rect', { x: a, y: Y, width: (b - a - 6) * g, height: 48, rx: 8, fill: col, opacity: i === k - 3 ? 0.9 : 0.3 });
        tx(a + 10, Y + 30, n, { 'font-size': 14, 'font-weight': 700, fill: PANEL, class: i === 1 ? 'mono' : null, opacity: g > 0.6 ? 1 : 0 }); });
      if (k === 3) { mono(X0, Y - 40, 'start = time.time()', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.4) }); mono(X0, Y - 14, 'logger.info("→ call %s", …)', { 'font-size': 14, opacity: fade(u, 0.8) }); return; }
      if (k === 4) { terminal(100, 240, 760, 100, ['>>> 서버가 받은 authorization', ['Bearer my-secret-token', '#86efac']], lerp(1, 2, E(u, 0.8, 1.8)), { fs: 14.5 });
        sub(480, 370, '원본 call_details 를 넘기면 방금 붙인 헤더가 사라진다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      terminal(100, 240, 760, 120, ['>>> continuation(…) 이 돌려준 것: _UnaryOutcome (result() 로 응답)', '>>> return response 를 빼먹으면 (실행 확인)', ["AttributeError: 'NoneType' object has no attribute 'result'", '#fca5a5']], lerp(1, 3, E(u, 0.4, 2.0)), { fs: 14 });
      return; }
    if (k === 6) { card(200, 140, 260, 60, { rx: 10, text: 'insecure_channel(…)', fs: 14.5, mono: true, s: pop(u, 0.2) });
      card(520, 140, 280, 110, { rx: 14, stroke: ACC, sw: 2.5, s: pop(u, 0.6) }); mono(400, 110, 'intercept_channel(', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.7) });
      card(520, 150, 200, 40, { rx: 8, text: 'channel, *ics)', fs: 14, mono: true, stroke: GRID, s: pop(u, 0.9) });
      grow(660, 140, 760, 140, E(u, 1.2, 1.6), ACC); card(840, 140, 150, 50, { rx: 10, text: 'Stub', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.6) });
      sub(480, 290, 'Go 의 DialOption 자리 · 감싼 채널을 stub 에 넘겨야 적용된다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k7: 세 함정 (실행 확인)
    tx(40, 50, '세 함정을 grpcio 로 해 보면', { 'font-size': 17, 'font-weight': 800 });
    [['① continuation 안 부름', '서버 호출 0번', BAD], ['② 순서: retry 안쪽', '재시도 3번에 같은 토큰', WARN], ['③ 원본 call_details 전달', '서버가 받은 authorization: None', BAD]].forEach(([a, b, col], i) => { const y = 120 + i * 90, s = pop(u, 0.3 + i * 0.5);
      card(480, y, 860, 70, { rx: 12, stroke: col, sw: 2, s }); tx(70, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: s }); mono(460, y + 6, b, { 'font-size': 15, fill: col, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.5) }); }); }

  const quiz = [
    { q: '클라이언트 인터셉터가 감싸는 대상은 무엇인가?',
      o: ['서버의 handler', '실제 전송을 하는 invoker', '.proto에서 만든 메시지 타입'], a: 1,
      why: '클라이언트 인터셉터는 나가는 RPC의 invoker 호출을 감싼다. 서버 쪽 handler에 대응하는 자리다.' },
    { q: 'UnaryClientInterceptor가 error 하나만 돌려주는데 응답은 어디로 오나?',
      o: ['reply 인자에 invoker가 채운다', 'ctx에 실려 온다', 'opts의 마지막 값으로 온다'], a: 0,
      why: 'reply는 out 파라미터다. invoker가 응답 메시지를 채운 뒤에 읽는다.' },
    { q: 'AppendToOutgoingContext로 토큰을 붙인 뒤 invoker에 원래 ctx를 넘기면 어떻게 되나?',
      o: ['토큰이 두 번 실린다', '토큰이 실리지 않은 채 요청이 나간다', '컴파일 오류가 난다'], a: 1,
      why: 'AppendToOutgoingContext는 원본을 고치지 않고 새 ctx를 돌려준다. grpcio로 같은 실수를 해 보면 서버가 받은 authorization이 None이다.' },
    { q: 'WithChainUnaryInterceptor(auth, logging, retry)에서 서버가 두 번 UNAVAILABLE을 주면 토큰은 몇 번 조회되나?',
      o: ['1번', '3번', '0번'], a: 0,
      why: 'retry가 auth 안쪽이라 auth는 한 번만 지나고, 재시도 세 번이 같은 토큰을 다시 쓴다. 재시도마다 새로 받으려면 retry를 바깥에 둔다.' },
    { q: 'Python 인터셉터에서 return response를 빼먹으면 호출부에는 무엇이 보이나?',
      o: ['None이 응답으로 온다', "AttributeError: 'NoneType' object has no attribute 'result'", '빈 User 메시지'], a: 1,
      why: '호출부는 인터셉터가 돌려준 객체에서 result()를 부른다. None을 돌려주면 grpcio에서 이 AttributeError가 난다.' },
  ];

  const summary = [
    '클라이언트 인터셉터는 나가는 RPC의 invoker 호출을 감싸는 미들웨어다.',
    'invoker 앞은 요청 가공, invoker는 전송, 뒤는 응답 처리 구간이다.',
    '토큰은 AppendToOutgoingContext가 돌려준 새 ctx로 invoker를 불러야 실린다.',
    'WithChainUnaryInterceptor는 앞에 적은 것이 바깥이고, 재시도는 일시 오류인 UNAVAILABLE만 한다.',
  ];
  const review = [
    { q: '새 인터셉터를 붙였더니 서버 로그에 요청이 하나도 안 찍힌다. 먼저 볼 곳은?',
      o: ['인터셉터가 invoker(continuation)를 부르는지', '서버의 포트 번호', '토큰 만료 시간'], a: 0,
      why: 'invoker를 부르지 않으면 요청이 나가지 않는다. grpcio로 해 보면 서버 호출 횟수가 0이다.' },
    { q: '재시도할 때마다 새 토큰을 받아야 한다. 체인을 어떻게 고치나?',
      o: ['auth를 두 번 등록한다', 'logging을 맨 앞으로 옮긴다', 'retry를 auth보다 앞(바깥)에 둔다'], a: 2,
      why: 'retry가 바깥이면 매 시도가 auth를 다시 지난다. grpcio로 해 보면 서버가 tok-1, tok-2, tok-3을 차례로 받는다.' },
    { q: '재시도 인터셉터가 INVALID_ARGUMENT에도 세 번씩 다시 보낸다. 무엇이 빠졌나?',
      o: ['백오프 sleep', 'status.Code(err)가 Unavailable인지 보는 조건', 'WithChainStreamInterceptor 등록'], a: 1,
      why: '잘못된 요청은 다시 보내도 같은 결과다. 일시 오류인 Unavailable만 걸러 재시도해야 장애를 키우지 않는다.' },
  ];

  R.page({ title: 'Client Interceptor — 나가는 RPC 감싸기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
