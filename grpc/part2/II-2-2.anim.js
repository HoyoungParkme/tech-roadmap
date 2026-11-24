/* II-2-2 Bidirectional Streaming — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 주고받는 순서와 시각, CloseSend 뒤 서버 송신, 끝 상태 코드, 상대가 안 읽을 때 쓰기가 멈추는 지점은
 * grpcio 1.85 grpc.aio(python)로 chat.proto 와 Go 서버·클라이언트 동작을 재현해 돌린 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, clock, terminal, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const KW = /^(syntax|package|option|service|rpc|returns|stream|message|string|int64|func|return|if|for|range|go|defer|nil|var|type|struct|make|chan|close|break|import)$/;
  function ctok(s) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { fill: INFO, 'font-weight': 700 } : {}]); }); buf = ''; };
    while (i < s.length) { const ch = s[i];
      if ((ch === '/' && s[i + 1] === '/') || ch === '#') { flush(); out.push([s.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = s.indexOf('"', i + 1), end = e < 0 ? s.length : e + 1; out.push([s.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  function code(x, y, rows, n, o) { o = o || {}; const fs = o.fs || 14.5, lh = o.lh || fs + 9, N = n == null ? rows.length : n;
    if (o.box) el('rect', { x: x - 14, y: y - fs - 10, width: o.box, height: rows.length * lh + 16, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    rows.forEach((s, i) => { if (i >= Math.ceil(N - 1e-6)) return; const part = i === Math.ceil(N) - 1 && N % 1 ? s.slice(0, Math.round(s.length * (N % 1))) : s;
      const hc = o.hi && o.hi(i); if (hc) el('rect', { x: x - 6, y: y + i * lh - fs + 1, width: tw(s, fs) + 12, height: lh - 3, rx: 4, fill: hc });
      spans(x, y + i * lh, ctok(part), { 'font-size': fs }); }); }
  const stat = (cx, cy, s, col, sc) => pill(cx, cy, s, col, sc, { mono: true, fs: 14 });
  const clean = (s) => s.replace(/[\u{1F300}-\u{1FAFF}☀-➿]️?/gu, '').replace(/\s+\(/, ' (').trim();

  // 전이중 선로: 위 = C→S, 아래 = S→C. msgs 는 페이지 데이터의 messages (from/kind/text) 를 차례로 흘려 보낸다
  const D = { L: 160, R: 800, up: 130, dn: 230 };
  function duplex(u, msgs, o) { o = o || {}; person(80, 180, 'Client'); server(880, 180, 'Server', { s: 0.8, lamp: o.lamp });
    const lane = (y, closed, col, label) => { el('line', { x1: D.L, y1: y, x2: D.R, y2: y, stroke: closed ? OFF : col, 'stroke-width': 3, 'stroke-dasharray': closed ? '6 6' : null, opacity: closed ? 1 : 0.55 });
      tx(closed ? D.L : D.L, y - 30, label + (closed ? '  닫힘' : ''), { 'font-size': 13.5, 'font-weight': 700, fill: closed ? MUT : col }); };
    lane(D.up, o.upClosed, ACC, 'C → S'); lane(D.dn, o.dnClosed, INK, 'S → C');
    let offU = 0, offD = 0;
    (msgs || []).forEach((m, i) => { const a = (o.t0 ?? 0.2) + i * (o.gap ?? 0.55), up = m.kind === 'up', txt = clean(m.text), w = tw(txt, 13.5) + 24;
      const x1 = up ? D.R - 20 - offU - w / 2 : D.L + 20 + offD + w / 2; if (up) offU += w + 8; else offD += w + 8;
      const v = seg(u, a, a + 0.7); if (v <= 0) return; const y = up ? D.up : D.dn, x0 = up ? D.L + w / 2 : D.R - w / 2;
      card(lerp(x0, x1, E(v, 0, 1)), y, w, 28, { rx: 14, text: txt, fs: 13.5, fw: 700, fill: up ? ACC : INK, stroke: 'none', color: PANEL }); }); }

  // ---------- 1. 네 패턴 속 전이중 ----------
  function s1(t, c) { const { k, u } = c, ms = c.beat.messages || [];
    const RPC = ['rpc GetRoom(RoomReq) returns (Room);', 'rpc Watch(RoomReq) returns (stream Event);', 'rpc Upload(stream Chunk) returns (UploadResult);', 'rpc Chat(stream Msg) returns (stream Msg);'];
    if (k <= 3) { spans(60, 52, ctok(RPC[k]), { 'font-size': 16, opacity: fade(u, 0.1) });
      mono(900, 52, ['1 : 1', '1 : N', 'N : 1', 'N : N'][k], { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: k === 3 ? ACC : MUT, opacity: fade(u, 0.3) });
      duplex(u, ms, { gap: k === 3 ? 0.35 : 0.6 });
      sub(480, 350, ['stream 이 없으면 한 번씩 오가고 끝', '응답 쪽만 stream: 서버가 계속 흘린다', '요청 쪽만 stream: 많이 보내고 하나 받는다', '양쪽 stream: 두 선로가 동시에 바쁘다'][k], fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 4) { person(80, 180, 'Client'); server(880, 180, 'Server', { s: 0.8 });
      el('line', { x1: D.L, y1: D.up, x2: D.R, y2: D.up, stroke: ACC, 'stroke-width': 3, opacity: 0.55 }); el('line', { x1: D.L, y1: D.dn, x2: D.R, y2: D.dn, stroke: INK, 'stroke-width': 3, opacity: 0.55 });
      [0.2, 0.7, 1.2].forEach((a, i) => { const v = seg(u, a, a + 0.8); if (v > 0) card(lerp(D.L + 20, D.R - 60 - i * 70, E(v, 0, 1)), D.up, 44, 28, { rx: 14, text: 'c' + (i + 1), mono: true, fs: 13.5, fill: ACC, stroke: 'none', color: PANEL }); });
      [0.5, 1.4, 1.6].forEach((a, i) => { const v = seg(u, a, a + 0.8); if (v > 0) card(lerp(D.R - 20, D.L + 60 + i * 70, E(v, 0, 1)), D.dn, 44, 28, { rx: 14, text: 's' + (i + 1), mono: true, fs: 13.5, fill: INK, stroke: 'none', color: PANEL }); });
      mono(480, 300, 'c1 → c2 → c3 순서는 지킨다 · s1 → s2 → s3 도 지킨다', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      mono(480, 335, 'c2 와 s1 중 무엇이 먼저인지는 정해져 있지 않다', { 'font-size': 15, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    if (k === 5) { [['실시간 채팅', '서로 계속 말한다'], ['협업 편집', '내 편집 → 모두에게'], ['멀티 게임', '입력 ↔ 상태'], ['이벤트 동기', '구독 + 발행 한 연결']].forEach(([n, d], i) => {
        const cx = 130 + i * 233, s = pop(u, 0.2 + i * 0.4); card(cx, 180, 200, 170, { rx: 14, stroke: GRID, s }); if (s < 0.5) return;
        tx(cx, 130, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' }); tx(cx, 250, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
        grow(cx - 60, 175, cx + 60, 175, E(u, 0.5 + i * 0.4, 0.9 + i * 0.4), ACC); grow(cx + 60, 205, cx - 60, 205, E(u, 0.7 + i * 0.4, 1.1 + i * 0.4), INK); });
      sub(480, 340, '요청-응답 한 번으로 안 끝나는 대화가 전이중의 자리', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    // k6 Msg
    card(300, 180, 360, 160, { rx: 12, stroke: ACC, s: pop(u, 0.2) }); spans(140, 130, ctok('message Msg {'), { 'font-size': 15, opacity: fade(u, 0.3) });
    ['string user = 1;', 'string text = 2;', 'int64  sent_at = 3;'].forEach((s, i) => spans(160, 165 + i * 30, ctok(s), { 'font-size': 15, opacity: fade(u, 0.5 + i * 0.25) }));
    grow(490, 160, 640, 120, E(u, 1.3, 1.7), ACC); grow(490, 200, 640, 250, E(u, 1.4, 1.8), INK);
    pill(740, 120, 'C → S 도 Msg', ACC, pop(u, 1.7)); pill(740, 250, 'S → C 도 Msg', INK, pop(u, 1.8));
    sub(480, 340, '두 방향이 같은 타입 하나를 쓴다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 2. chat.proto ----------
  function s2(t, c) { const { k, u } = c, ms = c.beat.messages || [];
    if (k === 0) { code(60, 70, ['syntax = "proto3";', 'package chat.v1;', 'option go_package = "example.com/chat/v1;chatv1";'], E(u, 0.2, 1.2) * 3, { box: 520 });
      person(80, 280, 'Client'); server(880, 280, 'Server', { s: 0.8 }); [250, 310].forEach((y) => el('line', { x1: D.L, y1: y, x2: D.R, y2: y, stroke: OFF, 'stroke-width': 3, 'stroke-dasharray': '6 6' }));
      sub(480, 390, '아직 rpc 가 없다. 두 선로 모두 닫혀 있다', fade(u, 1.6), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { spans(120, 50, [['rpc Chat(', {}], ['stream', { fill: ACC, 'font-weight': 800 }], [' Msg) returns (', {}], ['stream', { fill: ACC, 'font-weight': 800 }], [' Msg);', {}]], { 'font-size': 17, opacity: fade(u, 0.1) });
      person(80, 180, 'Client'); server(880, 180, 'Server', { s: 0.8 });
      grow(D.L, D.up, D.R, D.up, E(u, 0.4, 1.2), ACC, { sw: 3 }); grow(D.R, D.dn, D.L, D.dn, E(u, 0.8, 1.6), INK, { sw: 3 });
      sub(480, 300, 'HTTP/2 스트림 하나 위에 보내는 길 둘', fade(u, 1.8), { fill: INK, 'font-size': 15 }); return; }
    if (k === 2) { [['room', 1, '"room-1"'], ['user', 2, '"alice"'], ['text', 3, '"hi"'], ['sent_at', 4, 'epoch ms']].forEach(([n, f, v], i) => {
        const y = 80 + i * 44, op = fade(u, 0.2 + i * 0.25); mono(70, y, `${n} = ${f}`, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(250, y, v, { 'font-size': 15, fill: ACC, opacity: op }); });
      zone(520, 60, 400, 260, 'room-1', { stroke: ACC, fill: ACCBG, color: ACC });
      person(600, 160, 'alice', { s: 0.9 }); person(860, 130, 'bob', { s: 0.9 }); person(860, 250, 'carol', { s: 0.9 });
      server(720, 220, null, { s: 0.55 }); grow(630, 170, 680, 205, E(u, 1.0, 1.3), ACC);
      grow(760, 205, 830, 145, E(u, 1.5, 1.9), INK); grow(760, 230, 830, 250, E(u, 1.6, 2.0), INK);
      sub(480, 380, 'room 값으로 같은 방 사람을 찾아 되돌린다 (fan-out)', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 3) { duplex(u, ms, { upClosed: u > 1.4, gap: 0.6 });
      if (u > 1.4) cross(480, D.up, 13, pop(u, 1.4));
      sub(480, 340, 'CloseSend 는 위 선로만 닫는다. 실행해 보니 그 뒤에도 서버가 보낸 공지가 도착했다', fade(u, 2.2), { fill: INK, 'font-size': 14 }); return; }
    if (k === 4) { duplex(u, ms, { upClosed: true, dnClosed: u > 1.6, gap: 0.6 });
      card(560, 320, 300, 44, { rx: 6, stroke: GOOD, fill: GOODBG, text: '트레일러  grpc-status: 0', fs: 14, mono: true, color: GOOD, s: pop(u, 1.7) });
      sub(220, 320, '서버 return = S → C 닫힘', fade(u, 1.9), { fill: INK, 'font-size': 14.5 }); return; }
    // k5
    duplex(u, ms, { upClosed: u > 1.2, dnClosed: u > 1.8 });
    check(480, 320, 14, pop(u, 2.0)); sub(480, 370, '보낼 게 없는 쪽이 각자 닫아야 깔끔하게 끝난다', fade(u, 2.1), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 3. Go 서버 ----------
  // 서버 안쪽: 메인 goroutine(Recv) · out 채널 · goroutine A(Send)
  function inside(u, o) { o = o || {}; zone(330, 40, 600, 330, 'Chat(stream) 핸들러 안', { stroke: GRID });
    tx(350, 100, 'main · Recv 루프', { 'font-size': 14.5, 'font-weight': 700, fill: ACC }); el('line', { x1: 350, y1: 132, x2: 900, y2: 132, stroke: ACC, 'stroke-width': 2, opacity: 0.4 });
    tx(350, 300, 'goroutine A · Send', { 'font-size': 14.5, 'font-weight': 700, fill: INK, opacity: o.noA ? 0.3 : 1 }); el('line', { x1: 350, y1: 312, x2: 900, y2: 312, stroke: INK, 'stroke-width': 2, opacity: o.noA ? 0.15 : 0.4 });
    const n = o.q ?? 0; for (let i = 0; i < 16; i++) el('rect', { x: 500 + i * 22, y: 190, width: 18, height: 26, rx: 3, fill: i < n ? ACC : PANEL, stroke: o.closed ? OFF : GRID, 'stroke-width': 1.5 });
    mono(500, 182, o.closed ? 'out (닫힘)' : 'out  chan *pb.Msg, 16', { 'font-size': 13.5, fill: o.closed ? MUT : INK });
    person(90, 200, 'Client'); el('line', { x1: 140, y1: 132, x2: 330, y2: 132, stroke: ACC, 'stroke-width': 2.5, opacity: 0.5 }); el('line', { x1: 330, y1: 312, x2: 140, y2: 312, stroke: INK, 'stroke-width': 2.5, opacity: 0.5 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 150, 420, 110, { rx: 12, stroke: ACC, s: pop(u, 0.2) }); mono(480, 140, 'type chatServer struct', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      mono(480, 170, 'UnimplementedChatServiceServer', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6) });
      sub(480, 290, '구현체만 있다. 스트림은 클라가 Chat 을 부를 때 하나씩 생긴다', fade(u, 1.4), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { inside(u, { q: 0, noA: true }); el('rect', { x: 500, y: 190, width: 16 * 22 * E(u, 0.3, 1.2), height: 26, fill: 'none', stroke: ACC, 'stroke-width': 2.5, rx: 4 });
      pill(700, 250, 'sync.WaitGroup', INFO, pop(u, 1.4), { mono: true, fs: 13.5 }); return; }
    if (k === 2) { inside(u, { q: 0 }); grow(350, 270, 900, 270, E(u, 0.3, 1.2), INK, { dash: '5 5' }); mono(620, 262, 'for msg := range out', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      sub(630, 350, 'Send 를 부르는 곳은 이 goroutine 하나뿐', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 3) { inside(u, { q: u < 0.8 ? 1 : 0 }); const v = seg(u, 0.8, 1.8); if (v > 0) fly(511, 230, 150, 312, v, 'echo #1', { fill: INK, stay: true });
      mono(620, 262, 'stream.Send(msg)', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.6) });
      sub(630, 350, 'Send 가 실패하면 스트림이 끊긴 것. 이 goroutine 을 끝낸다', fade(u, 2.0), { fill: INK, 'font-size': 14 }); return; }
    if (k === 4) { inside(u, {}); [0.2, 0.9].forEach((a, i) => { const v = seg(u, a, a + 0.6); if (v > 0) fly(150, 132, 360, 132, v, 'msg #' + (i + 1), { fill: ACC }); });
      if (u > 1.6) fly(150, 132, 420, 132, seg(u, 1.6, 2.2), 'EOF', { fill: WARN, stay: true });
      sub(630, 160, 'io.EOF = 클라가 CloseSend 했다 (C → S 만 끝)', fade(u, 2.2), { fill: WARN, 'font-size': 14, 'font-weight': 700 }); return; }
    if (k === 5) { inside(u, {}); terminal(560, 222, 340, 64, [['[room-1] alice: hello', null]], E(u, 0.4, 1.0), { title: 'log.Printf', lh: 20 });
      sub(630, 352, 'EOF 가 아닌 오류면 break. 아래 정리 코드는 그래도 돈다', fade(u, 1.6), { fill: INK, 'font-size': 14 }); return; }
    if (k === 6) { const q = u < 0.9 ? 0 : u < 1.6 ? 1 : 0; inside(u, { q });
      fly(150, 132, 470, 132, seg(u, 0.1, 0.8), 'hello', { fill: ACC }); if (u > 0.8 && u < 1.6) grow(500, 145, 511, 186, 1, ACC);
      if (u > 1.6) fly(511, 230, 150, 312, seg(u, 1.6, 2.4), 'echo: hello', { fill: INK, stay: true });
      mono(620, 150, 'out <- &pb.Msg{Text: "echo: " + in.Text}', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); return; }
    // k7
    inside(u, { closed: u > 0.4 }); [['close(out)', 0.3], ['wg.Wait()', 0.9], ['return nil', 1.5]].forEach(([s, a], i) => pill(420 + i * 180, 260, s, i === 2 ? GOOD : INK, pop(u, a), { mono: true, fs: 14 }));
    if (u > 1.8) { cross(240, 312, 12, pop(u, 1.8)); mono(240, 345, 'S → C 닫힘 · grpc-status 0', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700 }); } }

  // ---------- 4. Go 클라이언트 (python 으로 재현한 시간표) ----------
  const TL = [[0.00, 'up', 'hello'], [0.00, 'dn', 'echo: hello'], [0.30, 'up', 'how are you'], [0.30, 'dn', 'echo: how are you'], [0.62, 'up', 'bye'], [0.62, 'dn', 'echo: bye'], [0.93, 'close', 'CloseSend'], [1.14, 'dn', '서버 마지막 공지'], [1.14, 'eof', 'EOF · OK']];
  function timeline(upto, u, o) { o = o || {}; const ax = axes(150, 70, 700, 200, { x: [0, 1.2], y: [0, 2], xt: [0, 0.3, 0.6, 0.9, 1.2], xl: '초' });
    tx(140, ax.Y(1.5) + 5, '▶ 보냄', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: ACC }); tx(140, ax.Y(0.5) + 5, '◀ 받음', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end' });
    TL.slice(0, upto).forEach(([s, kd, txt], i) => { const fresh = i >= (o.from ?? 0), op = fresh ? fade(u, 0.2 + (i - (o.from ?? 0)) * 0.35) : 1; if (op <= 0) return;
      const y = kd === 'up' || kd === 'close' ? ax.Y(1.5) : ax.Y(0.5), x = ax.X(s), col = kd === 'up' ? ACC : kd === 'dn' ? INK : kd === 'close' ? WARN : GOOD;
      el('circle', { cx: x, cy: y, r: 7, fill: col, opacity: op }); const dy = kd === 'up' || kd === 'close' || kd === 'eof' ? -16 : 24;
      tx(x + 4, y + dy, txt, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: op, transform: `rotate(-18 ${x + 4} ${y + dy})` }); });
    return ax; }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { person(90, 180, 'Client'); card(330, 180, 200, 70, { rx: 10, text: 'ClientConn', mono: true, fs: 15, fw: 800, s: pop(u, 0.2) });
      card(560, 180, 200, 70, { rx: 10, text: 'ChatServiceClient', mono: true, fs: 14, stroke: ACC, color: ACC, s: pop(u, 0.7) }); server(860, 180, 'Server', { s: 0.8 });
      sub(480, 300, '연결과 stub 만 있다. 스트림(Chat 호출)은 아직 없다', fade(u, 1.4), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { person(80, 180, 'Client'); server(880, 180, 'Server', { s: 0.8 });
      grow(D.L, D.up, D.R, D.up, E(u, 0.4, 1.1), ACC, { sw: 3 }); grow(D.R, D.dn, D.L, D.dn, E(u, 0.4, 1.1), INK, { sw: 3 });
      pill(480, 60, 'stream, err := client.Chat(ctx)', ACC, pop(u, 0.2), { mono: true, fs: 14 }); clock(480, 320, 30, E(u, 1.2, 2.4) * 0.05, WARN, 'ctx 1분 = 스트림 수명'); return; }
    if (k === 2 || k === 3 || k === 4) { person(80, 180, 'Client'); server(880, 180, 'Server', { s: 0.8 });
      el('line', { x1: D.L, y1: D.up, x2: D.R, y2: D.up, stroke: ACC, 'stroke-width': 3, opacity: 0.5 }); el('line', { x1: D.L, y1: D.dn, x2: D.R, y2: D.dn, stroke: k === 3 && u > 1.0 ? OFF : INK, 'stroke-width': 3, opacity: 0.5, 'stroke-dasharray': k === 3 && u > 1.0 ? '6 6' : null });
      zone(170, 270, 330, 110, 'Recv goroutine', { stroke: INK });
      if (k === 2) { mono(190, 330, 'for { in, err := stream.Recv() … }', { 'font-size': 13.5, opacity: fade(u, 0.4) }); mono(190, 356, 'done := make(chan struct{})', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) }); return; }
      if (k === 3) { fly(D.R - 20, D.dn, D.L + 80, D.dn, seg(u, 0.2, 1.0), 'EOF', { fill: WARN, stay: true }); mono(190, 330, 'err == io.EOF', { 'font-size': 14.5, opacity: fade(u, 1.0) }); pill(400, 330, 'close(done)', GOOD, pop(u, 1.4), { mono: true, fs: 13.5 });
        sub(700, 330, '서버가 S → C 를 닫았다 = 대화 끝', fade(u, 1.8), { fill: INK, 'font-size': 14 }); return; }
      fly(D.R - 20, D.dn, D.L + 120, D.dn, seg(u, 0.2, 1.0), 'echo: hello', { fill: INK, stay: true }); terminal(560, 280, 360, 60, [['◀ server: echo: hello', null]], E(u, 1.0, 1.4), { lh: 20 });
      mono(190, 330, 'err != nil → close(done)', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.6) }); mono(190, 356, '어느 길로 끝나도 done 을 닫는다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { timeline(2, u); sub(480, 370, 'main 은 Send, 다른 goroutine 은 Recv. 보내자마자 echo 가 돌아온다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 6) { timeline(6, u, { from: 2 }); sub(480, 370, '300ms 간격은 데모용 Sleep. 전이중과는 관계없다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 7) { const ax = timeline(8, u, { from: 6 }); el('line', { x1: ax.X(0.93), y1: ax.Y(2), x2: ax.X(0.93), y2: ax.Y(0), stroke: WARN, 'stroke-dasharray': '5 4', 'stroke-width': 2, opacity: fade(u, 0.3) });
      sub(480, 370, 'CloseSend(0.93s) 뒤에도 서버가 보낸 공지를 1.14s 에 받았다', fade(u, 1.6), { fill: INK, 'font-size': 14.5 }); return; }
    timeline(9, u, { from: 8 }); terminal(560, 300, 340, 60, [['대화 종료', null]], E(u, 1.2, 1.6), { lh: 20 });
    sub(300, 335, '<-done 으로 EOF 까지 받고 끝낸다', fade(u, 1.4), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 5. 정리 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['Unary', 'Req → Resp'], ['Server', 'Req → stream'], ['Client', 'stream → Resp'], ['Bidi', 'stream ↔ stream']].forEach(([n, r], i) => { const hot = i === 3, s = pop(u, 0.2 + i * 0.3);
        card(130 + i * 233, 170, 210, 100, { rx: 12, stroke: hot ? ACC : GRID, sw: hot ? 2.8 : 1.5, fill: hot ? ACCBG : PANEL, s }); tx(130 + i * 233, 158, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? ACC : INK, opacity: s });
        mono(130 + i * 233, 190, r, { 'font-size': 14.5, 'text-anchor': 'middle', fill: hot ? ACC : MUT, opacity: s }); });
      sub(480, 300, 'stream 이 어느 쪽에 붙었는지만 보면 모양이 정해진다', fade(u, 1.6), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { [['goroutine 1', 'for { stream.Recv() }', ACC, 120], ['goroutine 2', 'for { stream.Send() }', INK, 230]].forEach(([n, s, col, y], i) => {
        tx(80, y + 5, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.4) }); el('rect', { x: 220, y: y - 16, width: 640 * E(u, 0.3 + i * 0.4, 1.8 + i * 0.3), height: 32, rx: 6, fill: col, opacity: 0.8 });
        mono(236, y + 6, s, { 'font-size': 14.5, fill: PANEL, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.4) }); });
      sub(480, 330, '받기와 보내기를 다른 goroutine 에서 동시에: 안전하다', fade(u, 2.0), { fill: GOOD, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 2) { duplex(u, [], { upClosed: u > 0.6, dnClosed: u > 1.4 });
      pill(300, 300, '클라 CloseSend()', ACC, pop(u, 0.5), { mono: true, fs: 14 }); pill(640, 300, '서버 return', INK, pop(u, 1.3), { mono: true, fs: 14 });
      card(480, 370, 320, 40, { rx: 6, stroke: GOOD, fill: GOODBG, text: '둘 다 닫힘 → status 도착', fs: 14, color: GOOD, s: pop(u, 1.9) }); return; }
    if (k === 3) { tx(80, 80, 'Send 를 두 곳에서', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.2) });
      ['goroutine X', 'goroutine Y'].forEach((n, i) => { card(150, 140 + i * 70, 150, 44, { rx: 8, text: n, fs: 14, stroke: BAD, s: pop(u, 0.3 + i * 0.2) }); grow(228, 140 + i * 70, 360, 175, E(u, 0.6, 1.0), BAD); });
      pill(420, 175, 'Send', BAD, pop(u, 0.9), { mono: true }); cross(420, 175, 18, pop(u, 1.2));
      tx(560, 80, '채널로 모아 한 곳에서', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
      ['소스 A', '소스 B'].forEach((n, i) => { card(620, 140 + i * 70, 110, 44, { rx: 8, text: n, fs: 14, stroke: GOOD, s: pop(u, 1.5 + i * 0.15) }); grow(676, 140 + i * 70, 740, 175, E(u, 1.7, 2.0), GOOD); });
      card(780, 175, 70, 40, { rx: 6, text: 'out', mono: true, fs: 14, stroke: GOOD, s: pop(u, 1.9) }); pill(890, 175, 'Send', GOOD, pop(u, 2.1), { mono: true });
      sub(480, 330, 'Send 끼리, Recv 끼리 동시에 부르는 것은 금지', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 4) { duplex(u, [{ kind: 'dn', text: '남은 Msg 1' }, { kind: 'dn', text: '남은 Msg 2' }], { upClosed: true, t0: 0.3 });
      if (u > 1.6) { el('rect', { x: 170, y: 270, width: 300, height: 50, rx: 8, fill: BADBG, stroke: BAD }); tx(320, 300, 'Recv 안 하고 나감 → 누수', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 }); }
      card(700, 295, 300, 50, { rx: 8, stroke: GOOD, text: 'EOF 까지 Recv', fs: 15, color: GOOD, s: pop(u, 2.1) }); return; }
    if (k === 5) { person(80, 180, '안 읽는 클라'); server(880, 180, 'Server', { s: 0.8 });
      zone(220, 110, 520, 120, '받는 쪽 버퍼 · 흐름 제어 창', {}); const n = Math.round(tween(0, 63, u, 1.8));
      el('rect', { x: 240, y: 160, width: 480 * (n / 63), height: 40, rx: 6, fill: n >= 63 ? WARN : ACC, opacity: 0.8 });
      mono(480, 260, `64KB 쓰기 ${n}번 성공`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: n >= 63 ? WARN : INK });
      if (n >= 63) stat(480, 310, '64번째 write 가 멈춤 (약 4MB)', WARN, pop(u, 2.0));
      sub(480, 370, 'grpc.aio 서버로 실측. 상대가 안 읽으면 결국 Send 가 막힌다', fade(u, 2.3), { fill: INK, 'font-size': 14 }); return; }
    // k6
    [['채팅', '메시지'], ['협업 편집', '편집 이벤트'], ['게임', '입력 · 상태'], ['동기화', '구독 · 발행']].forEach(([n, d], i) => { const cx = 130 + i * 233, s = pop(u, 0.2 + i * 0.3);
      card(cx, 170, 200, 110, { rx: 12, stroke: ACC, s }); tx(cx, 160, n, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); tx(cx, 188, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
    sub(480, 300, '오래 열어 두고 양쪽이 계속 말하는 곳', fade(u, 1.6), { fill: INK, 'font-size': 15 }); }

  const quiz = [
    { q: 'Bidirectional Streaming에서 두 방향 사이 메시지 순서는 어떠한가?',
      o: ['보낸 시각 순서로 섞여 정확히 지켜진다', '각 방향 안에서만 지켜지고 두 방향 사이는 정해져 있지 않다', '서버 → 클라 방향만 지켜진다'], a: 1,
      why: 'C → S와 S → C는 따로 흐르는 스트림이다. 각자 안에서는 FIFO지만 서로 사이의 순서는 보장되지 않는다.' },
    { q: '클라이언트가 CloseSend()를 부르면 어떻게 되나?',
      o: ['C → S만 닫히고 서버는 계속 보낼 수 있다', '두 방향이 모두 즉시 닫힌다', '서버 핸들러가 바로 종료된다'], a: 0,
      why: '실행해 보니 CloseSend 뒤 서버 Recv는 EOF를 받았고, 그 뒤 서버가 보낸 공지도 클라에 도착했다.' },
    { q: 'Go 서버에서 Recv 루프와 Send를 다른 goroutine에 두는 이유는 무엇인가?',
      o: ['Send끼리 동시에 부르려고', 'Recv가 더 빨라지게 하려고', '받기와 보내기가 서로 기다리지 않고 동시에 흐르게 하려고'], a: 2,
      why: 'Recv와 Send는 다른 goroutine에서 동시에 불러도 안전하다. 보낼 것은 out 채널로 모아 Send 하나가 내보낸다.' },
    { q: '클라이언트가 CloseSend 뒤 <-done을 기다리는 이유는 무엇인가?',
      o: ['서버가 C → S를 다시 열기 때문에', '서버가 보낸 남은 메시지와 EOF를 끝까지 받기 위해', 'ctx 타임아웃을 늘리기 위해'], a: 1,
      why: 'S → C는 아직 살아 있다. 서버가 return해 EOF가 올 때까지 Recv해야 남은 응답을 잃지 않는다.' },
    { q: '두 goroutine이 같은 stream에 동시에 Send하면 무엇이 문제인가?',
      o: ['데이터 레이스가 난다', '서버가 EOF를 받는다', '아무 문제 없다'], a: 0,
      why: '같은 방향 호출끼리는 동시에 하면 안 된다. 보낼 소스를 채널 하나로 모아 Send를 한 곳에서만 부른다.' },
  ];
  const summary = [
    '채팅처럼 양쪽이 아무 때나 말해야 하면 요청-응답 한 번으로는 풀리지 않는다.',
    'rpc Chat(stream Msg) returns (stream Msg)로 한 스트림 위에 보내는 길 둘을 연다.',
    'Recv 루프와 Send를 다른 goroutine에 두고, Send는 채널로 모아 한 곳에서만 부른다.',
    'CloseSend는 C에서 S 방향만 닫고 서버 return이 나머지를 닫으니, 클라는 EOF까지 받는다.',
  ];
  const review = [
    { q: '채팅 서버에서 가끔 메시지가 깨져 도착한다. 알림 goroutine과 echo goroutine이 각자 stream.Send를 부른다. 먼저 고칠 것은?',
      o: ['두 소스를 채널 하나로 모아 Send를 한 goroutine에서만 부른다', 'Recv 루프를 두 개로 늘린다', 'CloseSend를 더 일찍 부른다'], a: 0,
      why: 'Send끼리 동시 호출은 금지다. 서버 코드처럼 out 채널에 넣고 goroutine 하나가 꺼내 보내야 한다.' },
    { q: '클라가 CloseSend 직후 함수를 빠져나오자 서버의 마지막 응답이 사라지고 고루틴이 남았다. 무엇이 빠졌나?',
      o: ['서버의 wg.Wait()', '서버 쪽 방향의 EOF까지 Recv로 받는 일', 'ctx 타임아웃 1분'], a: 1,
      why: 'CloseSend는 한 방향만 닫는다. 서버가 return해 EOF가 올 때까지 받아야 남은 메시지도 받고 자원도 풀린다.' },
    { q: '느린 모바일 클라이언트가 붙자 서버의 Send가 멈춰 그 방의 다른 사람들도 늦어졌다. 원인은?',
      o: ['두 방향 사이 순서가 보장되지 않아서', 'CloseSend를 부르지 않아서', '상대가 읽지 않아 흐름 제어 창이 차서 Send가 막혀서'], a: 2,
      why: '상대가 안 읽으면 쓰기가 멈춘다. 실측에서는 64KB 63번 뒤 막혔다. 느린 소비자를 위해 버퍼와 타임아웃을 따로 둔다.' },
  ];

  R.page({ title: '전이중 스트림', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
