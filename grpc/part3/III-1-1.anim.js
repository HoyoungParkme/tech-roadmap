/* III-1-1 Metadata (헤더 송수신) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 프레임 칸의 글은 페이지 STEPS 의 labels.initial / labels.trailing 을 읽는다.
 * 실제 출력(터미널, 거절 문구, 크기 한도)은 grpcio 1.85.3 · @grpc/grpc-js 1.14.7 로 돌려 본 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells,
    zone, server, person, cross, check, lock, clock, terminal, snippet, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // HTTP/2 프레임 한 칸: 위에 종류(HEADERS / DATA), 아래에 내용 줄. x,y = 왼쪽 위
  function frame(x, y, w, type, lines, o) { o = o || {}; const lh = 20, h = 30 + lines.length * lh, col = o.col || (type.startsWith('DATA') ? INFO : ACC);
    const g = R.G(x, y, o.s ?? 1, o.op ?? 1);
    el('rect', { x: 0, y: 0, width: w, height: h, rx: 7, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2, 'stroke-dasharray': o.dash }, g);
    el('rect', { x: 0, y: 0, width: w, height: 24, rx: 7, fill: col, opacity: 0.16 }, g);
    tx(10, 17, type, { 'font-size': 13.5, 'font-weight': 800, fill: col, class: 'mono' }, g);
    lines.forEach((s, i) => { const [t, c] = Array.isArray(s) ? s : [s, INK]; tx(10, 43 + i * lh, t, { 'font-size': 13.5, fill: c, class: 'mono', style: 'white-space:pre' }, g); });
    return h; }
  // 키 → []string 표 (Go metadata.MD 모양). rows: [key, [values], o?]
  function mdTable(x, y, rows, o) { o = o || {}; const rh = 34, kw = o.kw || 170, vw = o.vw || 120;
    rows.forEach(([k, vals, ro], i) => { ro = ro || {}; const yy = y + i * (rh + 4), s = ro.s ?? 1; if (s <= 0) return;
      const hot = ro.hot, col = ro.bad ? BAD : hot ? ACC : INK;
      card(x + kw / 2, yy + rh / 2, kw, rh, { rx: 6, text: k, fs: 13.5, mono: true, stroke: hot ? ACC : GRID, color: col, fill: hot ? ACCBG : PANEL, s, op: ro.op });
      vals.forEach((v, j) => card(x + kw + 10 + j * (vw + 6) + vw / 2, yy + rh / 2, vw, rh, { rx: 6, text: v, fs: 13.5, mono: true, stroke: ro.cross === j ? BAD : GRID, color: ro.cross === j ? BAD : INK, s, op: ro.op ?? 1 })); });
    return y + rows.length * (rh + 4); }

  // ---------- 1. Metadata 란: 프레임 띠 ----------
  const RQ = 66, RS = 168;     // 요청 줄 / 응답 줄 y (위)
  function strip(c, o) { o = o || {}; const L = c.beat.labels || {}, k = c.k, u = c.u, ap = (i) => (o.grow ? pop(u, 0.2 + i * 0.4) : 1);
    tx(24, RQ + 26, '클라 → 서버', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    tx(24, RS + 26, '서버 → 클라', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    el('line', { x1: 140, y1: 150, x2: 940, y2: 150, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5' });
    tx(940, 146, '스트림 1 · 시간 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    frame(140, RQ - 10, 290, 'HEADERS', [[L.initial || '', o.hotI ? ACC : INK]], { s: ap(0) });
    frame(440, RQ - 10, 170, 'DATA', ['GetUserRequest'], { s: ap(1) });
    frame(380, RS - 10, 120, 'HEADERS', ['(응답 헤더)'], { s: ap(2), col: MUT });
    frame(510, RS - 10, 110, 'DATA', ['User'], { s: ap(3) });
    frame(630, RS - 10, 310, 'HEADERS · END_STREAM', [[L.trailing || '', o.hotT ? ACC : INK]], { s: ap(4), col: WARN }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      snippet(40, 40, ['service UserService {', '  rpc GetUser(GetUserRequest)', '      returns (User);', '}', 'message GetUserRequest {', '  string user_id = 1;', '}'], { fs: 15 });
      const g = fade(u, 0.6); card(700, 92, 330, 44, { rx: 8, dash: '6 5', stroke: BAD, text: 'authorization 필드?', fs: 15, mono: true, color: MUT, op: g });
      cross(895, 92, 14, pop(u, 1.1));
      note(540, 160, '.proto 에는 메타데이터 선언이 없다', fade(u, 1.4));
      grow(540, 222, 700, 222, E(u, 1.8, 2.4), ACC); grow(540, 300, 700, 300, E(u, 1.8, 2.4), INFO);
      tx(40, 360, '', {});
      card(460, 222, 150, 40, { rx: 8, text: 'metadata', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.8) });
      card(460, 300, 150, 40, { rx: 8, text: 'message', fs: 15, mono: true, stroke: INFO, color: INFO, s: pop(u, 1.8) });
      card(810, 222, 200, 40, { rx: 8, text: 'HTTP/2 HEADERS', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 2.2) });
      card(810, 300, 200, 40, { rx: 8, text: 'HTTP/2 DATA', fs: 15, mono: true, stroke: INFO, color: INFO, s: pop(u, 2.2) });
      sub(480, 372, '스키마가 아니라 전송 계층에 실린다', fade(u, 2.3), { 'font-size': 15 }); return; }
    strip(c, { grow: k === 1, hotI: k >= 2, hotT: k === 1 || k === 4 || k === 6 });
    const Y = 250;
    if (k === 1) { note(140, Y + 30, '코드에는 GetUser(req) 한 줄이지만', fade(u, 2.2));
      note(140, Y + 60, '요청 앞에 헤더, 응답 끝에 트레일러가 함께 간다', fade(u, 2.4), { fill: ACC }); return; }
    if (k === 2) { card(150, Y + 50, 180, 44, { rx: 8, text: 'Authorization', fs: 15, mono: true, s: pop(u, 0.2) });
      [['Go  metadata.New', 'authorization', GOOD], ['Node  Metadata.set', 'authorization', GOOD], ['Python grpcio', "INTERNAL 'Invalid metadata'", BAD]].forEach(([who, out, col], i) => {
        const y = Y + 4 + i * 46, a = E(u, 0.5 + i * 0.4, 1.0 + i * 0.4); grow(245, Y + 50, 340, y, a, col === BAD ? BAD : MUT);
        tx(352, y + 5, who, { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: a });
        mono(560, y + 5, out, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.9 + i * 0.4) }); });
      sub(480, Y + 160, '키는 소문자로 쓴다 (grpcio 는 대문자 키를 보내기 전에 막는다)', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { tx(140, Y + 6, 'x-request-id', { 'font-size': 15, class: 'mono', 'font-weight': 700 }); mono(300, Y + 6, '"abc-123-def"   ASCII 그대로', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.3) });
      tx(140, Y + 62, 'trace-context-bin', { 'font-size': 15, class: 'mono', 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      cells(320, Y + 40, ['00', '01', 'ff'], { w: 46, h: 40, style: (i) => ({ s: pop(u, 0.8 + i * 0.15) }) });
      grow(470, Y + 60, 540, Y + 60, E(u, 1.4, 1.8), ACC);
      cells(550, Y + 40, ['A', 'A', 'H', '/'], { w: 40, h: 40, style: (i) => ({ stroke: ACC, color: ACC, s: pop(u, 1.8 + i * 0.12) }) });
      sub(640, Y + 104, '-bin 키만 base64 로 실린다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 4) { [['grpc-status', '라이브러리가 결과로 채움'], ['content-type', 'application/grpc'], ['te', 'trailers'], ['user-agent', 'grpc-python/1.85.3 …']].forEach(([key, v], i) => {
        const x = 160 + (i % 2) * 400, y = Y + 14 + Math.floor(i / 2) * 64, s = pop(u, 0.2 + i * 0.3);
        lock(x - 20, y, true, WARN, s); mono(x + 4, y + 5, key, { 'font-size': 15, 'font-weight': 700, opacity: s });
        tx(x + 4, y + 28, v, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.3) }); });
      sub(480, Y + 150, '직접 넣지 않는다', fade(u, 2.2), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 5) { mdTable(140, Y, [['accept-language', ['ko', 'en'], { s: pop(u, 0.2) }]], { vw: 70 });
      grow(470, Y + 17, 540, Y + 17, E(u, 0.7, 1.1), MUT); mono(552, Y + 22, 'md.Get(…) → ["ko", "en"]', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(140, Y + 90, 'dict(invocation_metadata())', { 'font-size': 15, opacity: fade(u, 1.5) });
      mono(552, Y + 90, "{'accept-language': 'en'}", { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(700, Y + 120, 'dict 로 바꾸면 마지막 값만 남는다', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k6: 다섯 용도
    [['① 인증', 'authorization'], ['② 추적', 'x-request-id'], ['③ 테넌트', 'x-tenant-id'], ['④ 클라 정보', 'x-client-version'], ['⑤ 서버 진단', 'x-server-timing']].forEach(([a, b], i) => {
      const x = 140 + i * 162, s = pop(u, 0.2 + i * 0.3), tr = i === 4;
      card(x + 72, Y + 40, 150, 62, { rx: 10, stroke: tr ? WARN : ACC, sw: 2, s });
      tx(x + 72, Y + 34, a, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: s });
      mono(x + 72, Y + 56, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: tr ? WARN : ACC, opacity: s }); });
    sub(480, Y + 112, '앞의 넷은 요청 헤더, ⑤ 는 응답 트레일러에 실린다', fade(u, 2.0), { 'font-size': 14.5 }); }

  // ---------- 2. Go 클라이언트: metadata 보내기 ----------
  const MD4 = [['authorization', ['Bearer eyJhbGc…']], ['x-request-id', ['abc-123-def']], ['x-tenant-id', ['acme-corp']], ['x-client-version', ['1.4.2']]];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { card(240, 120, 360, 60, { rx: 10, stroke: ACC, sw: 2.5, text: 'google.golang.org/grpc/metadata', fs: 15, mono: true, color: ACC, s: pop(u, 0.2) });
      [['New / Pairs', '만들기'], ['Join', '합치기'], ['Get', '읽기']].forEach(([a, b], i) => { pill(110 + i * 130, 196, a, INK, pop(u, 0.7 + i * 0.25), { mono: true }); sub(110 + i * 130, 228, b, fade(u, 0.9 + i * 0.25)); });
      card(720, 120, 280, 60, { rx: 10, stroke: INFO, sw: 2.5, text: 'pb.GetUserRequest{…}', fs: 15, mono: true, color: INFO, s: pop(u, 1.3) });
      grow(240, 260, 240, 320, E(u, 1.8, 2.2), ACC); grow(720, 160, 720, 320, E(u, 1.8, 2.2), INFO);
      pill(240, 345, 'HEADERS 프레임', ACC, pop(u, 2.2), { mono: true }); pill(720, 345, 'DATA 프레임', INFO, pop(u, 2.2), { mono: true });
      sub(480, 400, 'message 와 다른 통로로 간다', fade(u, 2.4), { 'font-size': 15 }); return; }
    if (k >= 6) return s2b(t, c);
    const rows = MD4.map((r, i) => [r[0], r[1], { s: k === 1 ? pop(u, 0.2 + i * 0.3) : 1 }]);
    if (k >= 2) rows.push(['accept-language', ['ko', 'en'], { s: k === 2 ? pop(u, 0.4) : 1, hot: k === 2 }]);
    const inCtx = k >= 3 ? (k === 3 ? E(u, 0.3, 1.4) : 1) : 0;
    tx(40, 50, 'md  metadata.MD', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: MUT });
    mdTable(40, 64, rows, { kw: 170, vw: 150, });
    if (k === 2) { mono(40, 300, 'metadata.Pairs("accept-language","ko",', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) }); mono(40, 322, '              "accept-language","en")', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      mono(40, 356, 'md = metadata.Join(md, md2)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); return; }
    if (k < 3) return;
    // ctx 상자
    const cx = 720, cy = 120;
    card(cx, cy, 300, 120, { rx: 12, stroke: INK, sw: 2.5, s: k === 3 ? pop(u, 0.1) : 1 }); mono(cx - 136, cy - 38, 'ctx', { 'font-size': 15, 'font-weight': 800 });
    clock(cx + 110, cy - 26, 16, 1, WARN); mono(cx + 84, cy + 6, '5s', { 'font-size': 14, 'font-weight': 700, fill: WARN });
    if (inCtx > 0) card(cx - 20, cy + 18, 200, 40, { rx: 8, stroke: ACC, fill: ACCBG, text: 'outgoing md · 값 6개', fs: 14, color: ACC, s: inCtx });
    if (k === 3) { fly(380, 180, cx - 20, cy + 18, seg(u, 0.1, 1.0), 'md', { mono: true }); sub(cx, cy + 92, 'NewOutgoingContext(ctx, md)', fade(u, 1.4), { class: 'mono', 'font-size': 14 }); return; }
    { const h = k === 5, S = 840;
      server(S, 330, 'UserService', { s: 0.8 });
      grow(cx + 150, cy, S - 30, 290, k === 4 ? E(u, 0.2, 0.9) : 1, ACC);
      [['hMD', 'grpc.Header(&hMD)', h ? 'x-server-id: srv-tokyo-7' : '', 280], ['tMD', 'grpc.Trailer(&tMD)', h ? 'x-server-timing: total=14ms' : '', 360]].forEach(([n, call, v, y], i) => {
        card(290, y, 420, 50, { rx: 8, dash: v ? null : '6 5', stroke: v ? GOOD : MUT, s: k === 4 ? pop(u, 0.6 + i * 0.3) : 1 });
        mono(92, y + 5, n, { 'font-size': 15, 'font-weight': 800 }); mono(150, y + 5, v || call, { 'font-size': 14, fill: v ? GOOD : MUT, opacity: h ? fade(u, 0.6 + i * 1.0) : 1 }); });
      if (h) { dot([[S - 40, 310], [510, 280]], seg(u, 0.2, 0.8), GOOD, 7); dot([[S - 40, 350], [510, 360]], seg(u, 1.2, 1.8), GOOD, 7);
        sub(620, 405, '헤더는 응답 시작에, 트레일러는 끝난 뒤에 채워진다 · 14ms 는 예시 값', fade(u, 2.0), { 'font-size': 13.5 }); }
      return; } }
  // k6, k7: PerRPCCredentials 로 매 호출 자동 부착
  function s2b(t, c) { const { k, u } = c, conn = k === 7;
    if (conn) zone(60, 150, 860, 230, 'conn := grpc.NewClient(…, WithPerRPCCredentials(tokenAuth{…}))', { stroke: ACC, fill: 'none', dash: '6 5', color: ACC });
    card(300, 70, 250, 50, { rx: 10, stroke: ACC, fill: ACCBG, text: 'GetRequestMetadata()', fs: 15, mono: true, color: ACC, s: k === 6 ? pop(u, 0.2) : 1 });
    mono(450, 76, '→ {"authorization": "Bearer " + token}', { 'font-size': 14, fill: ACC, opacity: k === 6 ? fade(u, 0.6) : 1 });
    for (let i = 0; i < 3; i++) { const p = seg(u, 0.4 + i * 0.6, 1.2 + i * 0.6), x = lerp(120, 560 + i * 140, p), y = 290;
      if (p <= 0) continue; card(x, y, 110, 40, { rx: 6, text: 'RPC ' + (i + 1), fs: 14.5, stroke: INK });
      grow(300, 96, 300, 250, i === 0 ? E(u, 0.4, 0.8) : 1, ACC, { plain: true, dash: '4 4' });
      if (x > 300) card(x, y - 34, 124, 24, { rx: 5, fill: ACC, stroke: 'none', text: 'authorization', fs: 13.5, mono: true, color: PANEL }); }
    if (conn) { mono(520, 210, 'ctx = NewOutgoingContext(ctx, md)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3) }); el('line', { x1: 516, y1: 205, x2: 516 + 300 * E(u, 0.6, 1.2), y2: 205, stroke: BAD, 'stroke-width': 2.5 });
      sub(480, 360, '그 연결의 모든 RPC 에 토큰이 붙는다 · 매번 싣지 않는다', fade(u, 1.6), { 'font-size': 14.5 }); }
    else sub(480, 380, '호출 직전마다 gRPC 가 이 메서드를 불러 헤더를 만든다', fade(u, 1.6), { 'font-size': 14.5 }); }

  // ---------- 3. Go 서버: 받기 + 응답 헤더 ----------
  const IN = [['authorization', ['Bearer eyJhbGc…']], ['x-request-id', ['abc-123-def']], ['x-tenant-id', ['acme-corp']], ['x-client-version', ['1.4.2']], ['accept-language', ['ko', 'en']]];
  function s3(t, c) { const { k, u } = c;
    tx(40, 34, '들어온 metadata', { 'font-size': 15, 'font-weight': 700, fill: MUT }); tx(560, 34, '나갈 응답 (스트림 1)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    el('line', { x1: 530, y1: 20, x2: 530, y2: 410, stroke: GRID, 'stroke-width': 1.5 });
    if (k === 0) { card(150, 110, 200, 60, { rx: 10, text: 'ctx\n(metadata 가 여기)', fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      card(380, 110, 200, 60, { rx: 10, text: 'req\nuser_id: "u-42"', fs: 14.5, stroke: INFO, color: INFO, s: pop(u, 0.6) });
      clock(150, 250, 30, E(u, 1.0, 2.8) * 0.15, INFO, 'start := time.Now()');
      sub(280, 340, 'req 에는 헤더가 없다', fade(u, 1.6), { 'font-size': 15 }); return; }
    const hot = k === 2 ? 0 : k === 3 ? 1 : -1;
    mdTable(40, 50, IN.map((r, i) => [r[0], r[1], { s: k === 1 ? pop(u, 0.2 + i * 0.2) : 1, hot: i === hot || (k === 3 && i === 2) }]), { kw: 160, vw: k >= 1 ? 150 : 120 });
    if (k === 1) { sub(260, 270, 'md, ok := metadata.FromIncomingContext(ctx)', fade(u, 1.4), { class: 'mono', 'font-size': 13.5 }); }
    if (k === 2) { mono(40, 280, 'md.Get("authorization")', { 'font-size': 14.5, opacity: fade(u, 0.3) }); mono(40, 306, '→ []string  len = 1', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.8) });
      mono(40, 350, 'len = 0 → codes.Unauthenticated (16)', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) });
      check(360, 300, 9, pop(u, 0.9)); return; }
    if (k === 3) { mono(40, 280, 'firstOr(…, genID())  → "abc-123-def"', { 'font-size': 14, opacity: fade(u, 0.3) }); mono(40, 306, 'firstOr(…, "default") → "acme-corp"', { 'font-size': 14, opacity: fade(u, 0.7) });
      sub(260, 350, '없으면 서버가 만들어 로그를 잇는다', fade(u, 1.3), { 'font-size': 14 }); return; }
    // 오른쪽: 응답 프레임 쌓기
    const fx = 560, f1 = k >= 4, f2 = k >= 6, f3 = k >= 7, sent = k >= 8;
    if (f1) { const pend = k === 4 || (k === 5 && false); frame(fx, 52, 360, 'HEADERS', ['x-server-id: srv-tokyo-7', 'x-request-id: abc-123-def'], { s: k === 4 ? pop(u, 0.3) : 1, dash: k <= 4 ? '6 5' : null }); }
    if (k === 5) { // SetHeader vs SendHeader
      tx(40, 290, '헤더를 언제 보내나', { 'font-size': 15, 'font-weight': 700 });
      el('line', { x1: 40, y1: 340, x2: 500, y2: 340, stroke: GRID, 'stroke-width': 1.5 }); el('line', { x1: 40, y1: 390, x2: 500, y2: 390, stroke: GRID, 'stroke-width': 1.5 });
      mono(40, 330, 'SendHeader', { 'font-size': 14, fill: ACC, 'font-weight': 700 }); mono(40, 380, 'SetHeader', { 'font-size': 14, fill: INFO, 'font-weight': 700 });
      const p = E(u, 0.3, 2.4); card(lerp(160, 460, p), 340, 36, 18, { rx: 4, fill: ACC, stroke: 'none' });
      card(lerp(200, 460, clamp((p - 0.6) / 0.4)), 390, 36, 18, { rx: 4, fill: INFO, stroke: 'none' }); card(lerp(240, 500, clamp((p - 0.6) / 0.4)), 390, 36, 18, { rx: 4, fill: INFO, stroke: 'none', op: 0.5 });
      sub(330, 318, '지금 바로', fade(u, 0.5), { 'font-size': 13.5 }); sub(350, 412, '첫 응답 메시지와 함께', fade(u, 1.6), { 'font-size': 13.5 }); return; }
    if (f2) frame(fx, 132, 360, 'DATA', ['User{Id:"u-42", Name:"Alice"}'], { col: INFO, s: k === 6 ? pop(u, 0.3) : 1, dash: sent ? null : '6 5' });
    if (k === 6) sub(260, 300, '헤더 검사가 끝난 뒤에 로직이 돈다', fade(u, 1.0), { 'font-size': 14.5 });
    if (f3) frame(fx, 192, 360, 'HEADERS · END_STREAM', [['grpc-status: 0', sent ? GOOD : MUT], 'x-server-timing: total=…ms', 'x-db-queries: 3'], { col: WARN, s: k === 7 ? pop(u, 0.3) : 1, dash: sent ? null : '6 5' });
    if (k === 7) sub(260, 300, 'SetTrailer 로 걸어 두면 끝에 붙는다', fade(u, 1.0), { 'font-size': 14.5 });
    if (sent) { person(860, 360, '클라이언트', { s: 0.8 }); for (let i = 0; i < 3; i++) dot([[740, 80 + i * 70], [860, 330]], seg(u, 0.2 + i * 0.5, 1.0 + i * 0.5), [ACC, INFO, WARN][i], 7);
      sub(260, 300, 'return 하면 세 프레임이 차례로 나간다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }

  // ---------- 4. Python: 튜플 리스트 ----------
  const TUP = ['("authorization", "Bearer …")', '("x-request-id", "abc-123-def")', '("x-tenant-id", "acme-corp")', '("x-client-version", "1.4.2")'];
  const CLI_OUT = ['$ python metadata_python.py', '[header] x-server-id: srv-tokyo-7', '[header] x-request-id: abc-123-def', '[trailer] x-server-timing: total=0ms', '[trailer] x-db-queries: 3', 'user: Alice'];
  const SRV_SEEN = ['>>> context.invocation_metadata()', "user-agent: grpc-python/1.85.3 …", 'authorization: Bearer eyJhbGc…', 'x-request-id: abc-123-def', 'x-tenant-id: acme-corp', 'x-client-version: 1.4.2', 'accept-language: ko', 'accept-language: en'];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { card(220, 150, 330, 56, { rx: 10, text: 'insecure_channel("localhost:50051")', fs: 14, mono: true, s: pop(u, 0.2) });
      grow(390, 150, 560, 150, E(u, 0.8, 1.3), MUT); card(680, 150, 220, 56, { rx: 10, text: 'UserServiceStub', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.3) });
      sub(480, 270, '여기까지는 metadata 와 상관없는 준비', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k <= 3) { tx(40, 40, 'md = [', { 'font-size': 15, class: 'mono', 'font-weight': 700 });
      const rows = TUP.concat(k >= 2 ? ['("accept-language", "ko")', '("accept-language", "en")'] : []);
      rows.forEach((s, i) => { const nw = i >= 4, sc = k === 1 ? pop(u, 0.2 + i * 0.25) : k === 2 && nw ? pop(u, 0.3 + (i - 4) * 0.3) : 1;
        card(250, 74 + i * 40, 400, 34, { rx: 6, text: s, fs: 14, mono: true, stroke: nw && k === 2 ? ACC : GRID, color: nw && k === 2 ? ACC : INK, s: sc }); });
      tx(40, 74 + rows.length * 40 + 8, ']', { 'font-size': 15, class: 'mono', 'font-weight': 700 });
      if (k === 2) sub(720, 250, 'Pairs · Join 없이 두 번 넣는다', fade(u, 1.2), { 'font-size': 14.5 });
      if (k === 1) sub(720, 160, '맵이 아니라 리스트', fade(u, 1.5), { 'font-size': 15 });
      if (k === 3) { const p = E(u, 0.3, 1.2); card(700, 120, 240, 50, { rx: 10, text: 'GetUser.with_call(…)', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) });
        card(lerp(700, 620, p), lerp(120, 240, p), 150, 44, { rx: 8, text: 'response', fs: 15, mono: true, stroke: INFO, color: INFO, op: p });
        card(lerp(700, 800, p), lerp(120, 240, p), 120, 44, { rx: 8, text: 'call', fs: 15, mono: true, stroke: WARN, color: WARN, op: p });
        sub(710, 300, '헤더·트레일러는 call 에서 읽는다', fade(u, 1.5), { 'font-size': 14 }); }
      return; }
    if (k === 4) { terminal(60, 40, 600, 220, CLI_OUT, lerp(1, CLI_OUT.length, E(u, 0.2, 2.2)), { title: '실제 실행 (grpcio 1.85.3)', fs: 14.5 });
      mono(700, 120, 'call.initial_metadata()', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8) });
      mono(700, 170, 'call.trailing_metadata()', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.5) });
      sub(480, 310, '(key, value) 튜플로 돌아온다 · 로컬이라 total=0ms', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 5) { terminal(40, 30, 560, 230, SRV_SEEN, lerp(1, SRV_SEEN.length, E(u, 0.2, 1.8)), { title: '서버가 받은 목록', fs: 14 });
      mono(40, 300, 'dict(…)["accept-language"]', { 'font-size': 15, opacity: fade(u, 1.8) }); mono(330, 300, "→ 'en'", { 'font-size': 15, fill: BAD, 'font-weight': 800, opacity: fade(u, 2.1) });
      sub(800, 140, 'user-agent 는 라이브러리가', fade(u, 1.0), { 'font-size': 14 }); sub(800, 162, '맨 앞에 넣는다', fade(u, 1.0), { 'font-size': 14 });
      sub(300, 340, 'dict 로 감싸면 같은 키는 마지막만 남는다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 6) { card(240, 100, 340, 54, { rx: 10, text: '"authorization" not in md', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.2) });
      grow(240, 128, 240, 190, E(u, 0.6, 1.0), BAD); card(240, 220, 380, 54, { rx: 10, text: 'context.abort(UNAUTHENTICATED, …)', fs: 14, mono: true, stroke: BAD, s: pop(u, 1.0) });
      terminal(500, 290, 440, 110, ['>>> 토큰 없이 호출', ["StatusCode.UNAUTHENTICATED (16)", '#fca5a5'], "details='authorization 헤더 필요'"], lerp(1, 3, E(u, 1.4, 2.4)), { fs: 14 });
      cross(240, 330, 14, pop(u, 1.6)); sub(240, 372, '핸들러 나머지는 돌지 않는다', fade(u, 1.8), { 'font-size': 14 }); return; }
    // k7, k8: 응답 헤더 · 트레일러
    const now = k === 7;
    el('line', { x1: 60, y1: 300, x2: 900, y2: 300, stroke: GRID, 'stroke-width': 2 }); tx(900, 290, '시간 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    mono(60, 330, 'GetUser 시작', { 'font-size': 13.5, fill: MUT }); mono(780, 330, 'return user', { 'font-size': 13.5, fill: MUT });
    frame(90, 70, 330, 'HEADERS', ['x-server-id: srv-tokyo-7', 'x-request-id: abc-123-def'], { s: now ? pop(u, 0.3) : 1 });
    grow(250, 160, 250, 296, now ? E(u, 0.8, 1.3) : 1, ACC); mono(100, 196, 'send_initial_metadata', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: now ? fade(u, 0.6) : 1 });
    if (now) { sub(480, 390, '부르는 순간 나간다 · 그 뒤에는 헤더를 더 붙일 수 없다', fade(u, 1.6), { 'font-size': 14 }); return; }
    frame(540, 50, 380, 'HEADERS · END_STREAM', [['grpc-status: 0', GOOD], 'x-server-timing: total=0ms', 'x-db-queries: 3'], { col: WARN, s: pop(u, 0.3) });
    grow(800, 160, 800, 296, E(u, 0.9, 1.4), WARN); mono(560, 196, 'set_trailing_metadata', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.6) });
    sub(480, 390, '걸어 두면 return 때 grpc-status 와 함께 나간다', fade(u, 1.6), { 'font-size': 14 }); }

  // ---------- 5. 한 장 정리 ----------
  const SIZE = [[7000, 0], [8000, 4], [10000, 11], [12000, 21], [14000, 35], [16000, 40]];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { frame(60, 60, 390, 'HEADERS (요청)', ['authorization: Bearer …', 'x-request-id: abc-123-def', 'x-tenant-id: acme-corp', 'x-client-version: 1.4.2'].map((s, i) => [s, ACC]), { s: pop(u, 0.2) });
      frame(510, 60, 390, 'HEADERS · END_STREAM (응답 끝)', [['grpc-status: 0', MUT], ['x-server-timing: total=…ms', WARN]], { col: WARN, s: pop(u, 0.9) });
      sub(480, 290, '다섯 용도: 인증 · 추적 · 테넌트 · 클라 정보 · 서버 진단', fade(u, 1.6), { 'font-size': 15, fill: INK }); return; }
    if (k === 1 || k === 2) { const rows = k === 1 ? [['→ 보내기', 'NewOutgoingContext(ctx, md)', 'metadata=[(k, v), …]'], ['← 응답 헤더', 'grpc.Header(&md)', 'call.initial_metadata()'], ['← 트레일러', 'grpc.Trailer(&md)', 'call.trailing_metadata()']]
        : [['↓ 받기', 'FromIncomingContext(ctx)', 'invocation_metadata()'], ['→ 헤더', 'SetHeader / SendHeader', 'send_initial_metadata'], ['→ 트레일러', 'SetTrailer', 'set_trailing_metadata']];
      tx(40, 50, k === 1 ? '클라이언트' : '서버', { 'font-size': 17, 'font-weight': 800 }); tx(220, 90, 'Go', { 'font-size': 15, 'font-weight': 700, fill: MUT }); tx(600, 90, 'Python', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      rows.forEach(([d, g, p], i) => { const y = 140 + i * 74, a = fade(u, 0.3 + i * 0.45);
        el('rect', { x: 30, y: y - 28, width: 900, height: 56, rx: 8, fill: i % 2 ? PANEL : SOFT, opacity: a });
        tx(44, y + 5, d, { 'font-size': 15, 'font-weight': 700, opacity: a }); mono(220, y + 5, g, { 'font-size': 14.5, fill: ACC, opacity: a }); mono(600, y + 5, p, { 'font-size': 14.5, fill: INFO, opacity: fade(u, 0.5 + i * 0.45) }); });
      return; }
    if (k === 3) { tx(40, 50, '함정 ① 예약 키를 직접 넣으면 (grpcio 로 해 봄)', { 'font-size': 16, 'font-weight': 800 });
      [['content-type: text/plain', '서버에 도착하지 않는다 (버려짐)', WARN], ['grpc-status: 5', '호출이 클라이언트 쪽 예외로 끝난다', BAD]].forEach(([a, b, col], i) => { const y = 120 + i * 90, s = pop(u, 0.3 + i * 0.6);
        lock(70, y, true, col, s); mono(100, y + 5, a, { 'font-size': 15, 'font-weight': 700, opacity: s }); tx(480, y + 5, b, { 'font-size': 15, fill: col, 'font-weight': 600, opacity: fade(u, 0.6 + i * 0.6) }); });
      sub(480, 330, '내 키는 x- 로 시작하게 짓는다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { tx(40, 50, '함정 ② 바이트 값은 -bin 키에만', { 'font-size': 16, 'font-weight': 800 });
      terminal(40, 80, 880, 200, ['>>> ("trace-context", b"\\x00\\x01\\xff")   # grpcio', ["StatusCode.INTERNAL  details='Invalid metadata'", '#fca5a5'], ">>> md.set('trace-context', Buffer.from([0,1,255]))   // grpc-js", ["keys that don't end with '-bin' must have String values", '#fca5a5'], '>>> ("trace-context-bin", b"\\x00\\x01\\xff")', ['OK', '#86efac']], lerp(1, 6, E(u, 0.2, 2.3)), { fs: 14.5, title: '실제 실행' });
      return; }
    if (k === 5) { tx(40, 46, '함정 ③ 큰 값 · grpcio 서버가 거절한 비율 (40번씩)', { 'font-size': 16, 'font-weight': 800 });
      SIZE.forEach(([b, n], i) => { const y = 82 + i * 50; mono(150, y + 14, (b / 1000) + 'KB 값', { 'font-size': 14.5, 'text-anchor': 'end' });
        hbar(170, y, 560, n, 40, { h: 22, u: E(u, 0.2 + i * 0.2, 1.0 + i * 0.2), col: n === 40 ? BAD : n ? WARN : GOOD, text: n + ' / 40' }); });
      sub(480, 400, '8KB 를 넘으면 일부, 16KB 를 넘으면 전부 RESOURCE_EXHAUSTED', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    // k6: 다음 챕터
    tx(480, 120, 'metadata 를 매번 손으로 다루면 빠뜨린다', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
    card(480, 220, 520, 70, { rx: 12, stroke: ACC, sw: 2.5, text: 'III-1-2  Server Interceptor', fs: 18, mono: true, color: ACC, s: pop(u, 0.8) });
    sub(480, 300, '모든 RPC 앞에서 authorization · x-request-id 를 한 곳에서 처리한다', fade(u, 1.4), { 'font-size': 15 });
    sub(480, 330, '토큰 · mTLS 는 III-2-2 Auth 에서', fade(u, 1.8), { 'font-size': 14 }); }

  const quiz = [
    { q: 'gRPC metadata가 실제로 실리는 곳은 무엇인가?',
      o: ['.proto의 message 필드', 'HTTP/2 HEADERS 프레임', 'HTTP/2 DATA 프레임 맨 앞'], a: 1,
      why: 'metadata는 스키마가 아니라 전송 계층의 헤더다. 요청 시작과 응답 끝(트레일러)의 HEADERS 프레임에 실린다.' },
    { q: 'Go 클라이언트에서 같은 키(accept-language)를 두 값으로 보내려면 무엇을 쓰나?',
      o: ['metadata.New에 같은 키를 두 번 적는다', 'metadata.Pairs로 만들어 Join으로 합친다', '값을 쉼표로 이어 한 문자열로 넣는다'], a: 1,
      why: 'New는 맵이라 키가 하나뿐이다. Pairs는 같은 키를 여러 번 받을 수 있고, Join으로 기존 md와 합친다.' },
    { q: '서버의 md.Get("authorization")이 []string을 돌려주는 까닭은 무엇인가?',
      o: ['같은 키가 여러 번 올 수 있어서', '토큰을 여러 조각으로 나눠 보내서', '값이 늘 base64라서'], a: 0,
      why: 'HTTP 헤더처럼 metadata도 같은 키를 반복할 수 있다. 그래서 길이를 먼저 보고 첫 값을 꺼낸다.' },
    { q: 'Python 서버에서 dict(context.invocation_metadata())로 accept-language(ko, en)를 읽으면 무엇이 남나?',
      o: ["['ko', 'en']", "'ko'", "'en'"], a: 2,
      why: '튜플 리스트를 dict로 바꾸면 같은 키는 마지막 값이 덮어쓴다. 실제로 돌려 보면 {"accept-language": "en"}이 나온다.' },
    { q: '이미지 썸네일 20KB를 metadata로 보내면 grpcio 서버에서 어떻게 되나?',
      o: ['RESOURCE_EXHAUSTED로 거절된다', '자동으로 DATA 프레임으로 옮겨진다', '앞 8KB만 잘려서 도착한다'], a: 0,
      why: 'grpcio 서버는 메타데이터가 16KB를 넘으면 모든 요청을 RESOURCE_EXHAUSTED로 거절한다. 큰 값은 message 필드로 보낸다.' },
  ];

  const summary = [
    'metadata는 .proto에 없고 HTTP/2 HEADERS 프레임에 실리는 키-값이다.',
    '요청 앞에는 헤더, 응답 끝에는 grpc-status와 함께 트레일러가 간다.',
    'Go는 NewOutgoingContext와 FromIncomingContext, Python은 튜플 리스트로 같은 일을 한다.',
    '키는 소문자, 바이트는 -bin 키에만 넣고, 8KB를 넘는 큰 값은 message로 보낸다.',
  ];
  const review = [
    { q: 'Python 클라이언트가 ("Authorization", "Bearer x")를 보냈더니 호출이 INTERNAL로 끝났다. 먼저 고칠 것은?',
      o: ['서버의 인증 코드', '키를 소문자 authorization으로 바꾸기', '토큰 앞의 Bearer 떼기'], a: 1,
      why: 'grpcio는 대문자 키를 Invalid metadata로 보내기 전에 막는다. Go와 Node는 소문자로 바꿔 주지만 Python은 바꾸지 않는다.' },
    { q: '서버가 처리 시간을 클라이언트에 알려 주려 한다. 응답 메시지가 끝난 뒤 도착해도 괜찮다면 어디에 싣나?',
      o: ['트레일러 (SetTrailer / set_trailing_metadata)', '요청 헤더', '.proto의 응답 message에 새 필드'], a: 0,
      why: '트레일러는 응답 끝에 grpc-status와 함께 나간다. 처리가 다 끝난 뒤에야 아는 값(x-server-timing)을 싣기 좋다.' },
    { q: '추적용 바이너리 컨텍스트를 키 trace-context에 bytes로 넣었더니 거절됐다. 올바른 방법은?',
      o: ['값을 직접 base64로 바꿔 같은 키에 넣는다', 'grpc-trace 같은 grpc- 키를 쓴다', '키를 trace-context-bin으로 바꾼다'], a: 2,
      why: '바이트 값은 -bin으로 끝나는 키에만 들어가고, 라이브러리가 base64로 실어 보낸다. grpc-로 시작하는 키는 예약이다.' },
  ];

  R.page({ title: 'Metadata — HTTP/2 헤더 프레임', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
