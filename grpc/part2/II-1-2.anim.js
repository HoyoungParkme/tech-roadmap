/* II-1-2 Server Streaming — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 요청 바이트, HTTP/2 프레임 순서·스트림 id·트레일러는 @grpc/grpc-js 서버에 node http2 로 직접 붙어 확인했고,
 * 첫 건 도착 시각·취소 뒤 서버 동작·반환 타입은 grpcio 1.85(python)로 코드 블록을 재현해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, terminal, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const KW = /^(syntax|package|option|service|rpc|returns|stream|message|string|int32|int64|bool|func|return|if|else|for|range|go|defer|nil|type|struct|import|from|def|with|as|try|except|yield|class|await|async|None|not|in|break)$/;
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
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // HTTP/2 프레임 상자: kind H(요청·응답 머리) D(DATA) T(트레일러) X(취소)
  const FK = { H: [INFO, INFOBG, 'HEADERS'], D: [ACC, ACCBG, 'DATA'], T: [GOOD, GOODBG, 'HEADERS·트레일러'], X: [BAD, BADBG, 'RST_STREAM'] };
  function frame(cx, cy, kind, text, s, w) { const [col, bg] = FK[kind]; w = w || Math.max(120, tw(text, 13.5) + 24);
    card(cx, cy, w, 44, { rx: 6, stroke: col, fill: bg, sw: 2, s: s ?? 1 }); if ((s ?? 1) < 0.5) return;
    tx(cx - w / 2 + 10, cy - 5, FK[kind][2], { 'font-size': 13.5, 'font-weight': 800, fill: col }); mono(cx - w / 2 + 10, cy + 15, text, { 'font-size': 13.5 }); }
  // 책 목록 (옛 패널이 쓰던 데이터)
  const BOOKS = [['Clean Code', 28000], ['Refactoring', 36000], ['DDIA', 42000], ['SICP', 55000], ['The Pragmatic Programmer', 24000], ['Go 언어 프로그래밍', 33000]];
  // 클라이언트 ← 서버 선로. n 개 Item 이 왼쪽으로 흘러와 쌓인다 (n 소수면 마지막 하나가 날아오는 중)
  function lane(n, o) { o = o || {}; const y = o.y ?? 170, L = 150, Rr = 810;
    person(90, y, o.ln || 'Client'); server(870, y, o.rn || 'Server', { s: 0.8, lamp: o.lamp });
    el('line', { x1: L, y1: y, x2: Rr, y2: y, stroke: GRID, 'stroke-width': 2.5 });
    if (o.req != null) fly(Rr - 600, y - 26, Rr - 60, y - 26, o.req, o.reqText || 'ListItems 요청 1개', { mono: true, fill: INK, stay: o.reqStay });
    const whole = Math.floor(n), part = n - whole;
    for (let i = 0; i < whole; i++) { const x = L + 60 + (i % 6) * 70; card(x, y + 28, 60, 28, { rx: 14, text: '#' + (i + 1), mono: true, fs: 13.5, fill: ACC, stroke: 'none', color: PANEL }); }
    if (part > 0) { const x = lerp(Rr - 40, L + 60 + (whole % 6) * 70, E(part, 0, 1)); card(x, y + 28, 60, 28, { rx: 14, text: '#' + (whole + 1), mono: true, fs: 13.5, fill: ACC, stroke: 'none', color: PANEL }); }
    if (o.eof) frame(620, y + 80, 'T', 'grpc-status: 0', o.eof, 190); }

  // ---------- 1. 개요 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) { spans(60, 90, ctok('rpc GetItem (Req) returns (       Resp);'), { 'font-size': 17, opacity: fade(u, 0.2) });
      spans(60, 140, ctok('rpc ListItems(Req) returns ('), { 'font-size': 17, opacity: fade(u, 0.4) });
      const sp = pop(u, 0.9); card(366, 134, 72, 30, { rx: 6, text: 'stream', mono: true, fs: 16, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, s: sp }); spans(408, 140, ctok(' Resp);'), { 'font-size': 17, opacity: fade(u, 0.4) });
      lbl(250, 230, 'Unary', 1, { fill: MUT, opacity: fade(u, 1.2) }); lbl(700, 230, 'Server Streaming', 1, { fill: ACC, opacity: fade(u, 1.2) });
      card(250, 290, 70, 32, { rx: 16, text: 'Resp', mono: true, fs: 14, fill: OFF, stroke: 'none', s: pop(u, 1.4) });
      for (let i = 0; i < 5; i++) card(580 + i * 62, 290, 54, 32, { rx: 16, text: '#' + (i + 1), mono: true, fs: 14, fill: ACC, stroke: 'none', color: PANEL, s: pop(u, 1.6 + i * 0.15) });
      sub(480, 370, '요청은 둘 다 하나. 응답 앞 한 단어가 모드를 바꾼다', fade(u, 2.4), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { code(80, 90, ['syntax = "proto3";', 'package catalog.v1;', 'service Catalog { … }'], E(u, 0.2, 1.0) * 3, { box: 400, hi: (i) => (i === 1 ? ACCBG : null) });
      grow(200, 190, 380, 250, E(u, 1.1, 1.5), ACC);
      spans(260, 280, [[':path  /', {}], ['catalog.v1', { fill: ACC, 'font-weight': 800 }], ['.', {}], ['Catalog', { fill: INFO, 'font-weight': 800 }], ['/ListItems', {}]], { 'font-size': 18, opacity: fade(u, 1.5) });
      sub(480, 330, '요청 HEADERS 에 실제로 실린 경로 (grpc-js 서버에 붙어 확인)', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2 || k === 4) { const n = k === 2 ? 3 * E(u, 0.9, 2.6) : tween(3, 4, u, 1.6);
      lane(n, { req: k === 2 ? seg(u, 0.1, 0.8) : null, reqText: 'ListItems(category="book")' });
      if (k === 2) { mono(480, 300, `요청 1 · 응답 ${Math.min(3, Math.ceil(n))}`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) }); return; }
      card(480, 70, 330, 64, { rx: 10, stroke: ACC, s: pop(u, 0.2) }); spans(330, 64, ctok('message Item { id; name; price }'), { 'font-size': 14.5, opacity: fade(u, 0.3) });
      mono(480, 90, '3 개 필드 · 스트림 한 칸', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
      const xs = [0, 1, 2, 3].map((i) => 210 + i * 70); if (u > 1.8) { el('rect', { x: xs[0] - 34, y: 182, width: xs[3] - xs[0] + 68, height: 34, rx: 8, fill: 'none', stroke: INK, 'stroke-dasharray': '4 4' }); }
      sub(480, 300, 'Item 한 건 = 메시지 하나. 바이트가 아니라 건 단위로 흐른다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 3) { code(60, 80, ['message ListItemsRequest {', '  string category = 1;', '  int32  page_size = 2;', '}'], 4, { box: 360 });
      const H = ['0a', '04', '62', '6f', '6f', '6b', '10', '64'], n = E(u, 0.4, 1.6) * 8;
      H.forEach((h, i) => { const v = clamp(n - i); if (v <= 0) return; const col = i === 0 || i === 6 ? ACC : i === 1 ? WARN : INK;
        card(470 + i * 54, 110, 46, 36, { rx: 5, text: h, mono: true, fs: 14.5, fw: 700, stroke: col === INK ? GRID : col, color: col, op: v }); });
      [['0a = 1×8+2', 470, 0.0], ['"book"', 605, 0.0], ['10 = 2×8+0', 794, 0.0]].forEach(([s, x], i) => mono(x, 160, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: i === 1 ? MUT : ACC, opacity: fade(u, 1.7 + i * 0.2) }));
      mono(848, 186, '64 = 100', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.1) });
      sub(480, 280, 'category="book", page_size=100 → 8바이트', fade(u, 1.8), { fill: INK, 'font-size': 15 });
      sub(480, 320, '요청은 이 8바이트를 한 번 보내고 끝난다. 이후로는 서버가 밀어낸다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 5) { [['대용량 목록', '10만 건을 청크로', 'list'], ['실시간 피드', '생길 때마다 밀어줌', 'feed'], ['진행률', '0% → 100%', 'prog'], ['로그 tail', 'tail -f 처럼', 'log']].forEach(([n, d, kind], i) => {
        const cx = 130 + i * 233, cy = 190, s = pop(u, 0.2 + i * 0.4); card(cx, cy, 200, 200, { rx: 14, stroke: GRID, s }); if (s < 0.5) return;
        tx(cx, cy - 66, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' }); tx(cx, cy + 80, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
        const a = E(u, 0.4 + i * 0.4, 1.6 + i * 0.4);
        if (kind === 'list') for (let j = 0; j < 5; j++) el('rect', { x: cx - 60, y: cy - 40 + j * 20, width: 120 * clamp(a * 5 - j), height: 12, rx: 3, fill: ACC, opacity: 0.8 });
        if (kind === 'feed') for (let j = 0; j < 3; j++) card(cx, cy - 30 + j * 36, 130, 28, { rx: 14, text: '새 글 ' + (j + 1), fs: 13.5, fill: j === 0 ? ACCBG : PANEL, stroke: ACC, op: clamp(a * 3 - j) });
        if (kind === 'prog') { el('rect', { x: cx - 70, y: cy - 8, width: 140, height: 20, rx: 10, fill: SOFT }); el('rect', { x: cx - 70, y: cy - 8, width: 140 * a, height: 20, rx: 10, fill: GOOD }); mono(cx, cy + 40, Math.round(a * 100) + '%', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' }); }
        if (kind === 'log') for (let j = 0; j < 4; j++) mono(cx - 74, cy - 34 + j * 22, '12:00:0' + j + ' GET /', { 'font-size': 13.5, fill: j === Math.floor(a * 4 - 0.01) ? ACC : MUT, opacity: clamp(a * 4 - j) }); });
      return; }
    if (k === 6) { const ax = axes(130, 70, 640, 190, { x: [0, 0.6], y: [0, 3], xt: [0, 0.1, 0.2, 0.3, 0.4, 0.5], xl: '초' });
      const g = E(u, 0.2, 2.0);
      tx(120, ax.Y(2.3) + 5, 'Unary', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: MUT }); tx(120, ax.Y(0.9) + 5, 'Stream', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: ACC });
      el('rect', { x: ax.X(0), y: ax.Y(2.3) - 12, width: ax.X(Math.min(0.5, g * 0.55)) - ax.X(0), height: 24, rx: 5, fill: OFF });
      if (g * 0.55 >= 0.5) { el('circle', { cx: ax.X(0.5), cy: ax.Y(2.3), r: 9, fill: INK }); mono(ax.X(0.5) + 16, ax.Y(2.3) + 5, '5건 한꺼번에 0.50s', { 'font-size': 14 }); }
      for (let i = 1; i <= 5; i++) { const tt = i * 0.1; if (g * 0.55 >= tt) { el('circle', { cx: ax.X(tt), cy: ax.Y(0.9), r: 9, fill: ACC }); mono(ax.X(tt), ax.Y(0.9) + 30, '#' + i, { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC }); } }
      if (g > 0.3) mono(ax.X(0.1), ax.Y(0.9) - 18, '첫 건 0.10s', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      sub(480, 330, '한 건 읽는 데 100ms 인 5건 (python 실측). 메모리도 한 건씩만 든다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    // k7
    lane(tween(4, 6, u, 1.6), { eof: pop(u, 2.0) });
    sub(480, 330, '다음: 서버가 stream.Send() 를 되풀이하는 실제 코드', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 2. Go 서버 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { [['grpc', '서버 본체'], ['codes', 'Canceled 같은 번호'], ['status', '코드로 에러 만들기'], ['pb', 'catalog/v1 생성 코드']].forEach(([n, d], i) => {
        const x = 130 + i * 233, s = pop(u, 0.2 + i * 0.35); card(x, 150, 190, 60, { rx: 10, text: n, mono: true, fs: 16, fw: 800, s, stroke: i === 3 ? ACC : INK, color: i === 3 ? ACC : INK });
        tx(x, 205, d, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5 + i * 0.35) }); });
      stat(480, 300, 'status.Error(codes.Canceled, "client gone")', BAD, pop(u, 1.9)); sub(480, 350, '취소를 번호로 알리려면 codes·status 가 필요하다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { zone(200, 80, 560, 200, 'catalogServer', { fill: ACCBG, color: ACC, stroke: ACC });
      card(480, 150, 400, 44, { rx: 8, text: 'UnimplementedCatalogServer (임베드)', fs: 14.5, stroke: MUT, dash: '5 4', s: pop(u, 0.4) });
      pill(480, 224, 'ListItems(req, stream) error', ACC, pop(u, 1.0), { mono: true, fs: 14.5 });
      sub(480, 340, '구조체 준비는 Unary 와 똑같다. 다른 것은 메서드 모양뿐', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 2) { lbl(240, 70, 'Unary', 1, { fill: MUT }); lbl(720, 70, 'Server Streaming', 1, { fill: ACC });
      el('line', { x1: 480, y1: 50, x2: 480, y2: 360, stroke: GRID, 'stroke-dasharray': '5 6', 'stroke-width': 1.5 });
      card(240, 160, 340, 80, { rx: 12, stroke: GRID, s: pop(u, 0.2) }); mono(240, 152, 'GetItem(ctx, req)', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); mono(240, 178, '(*Item, error)', { 'font-size': 15, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.4) });
      card(720, 160, 340, 80, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.8) }); mono(720, 152, 'ListItems(req, stream)', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); mono(720, 178, 'error', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) });
      card(720, 270, 220, 40, { rx: 8, text: '*Item 자리 없음', fs: 15, stroke: BAD, dash: '4 4', color: BAD, s: pop(u, 1.4) });
      grow(720, 205, 720, 245, E(u, 1.3, 1.6), BAD); pill(720, 340, 'stream.Send(item) 으로 내보낸다', ACC, pop(u, 2.0), { mono: true, fs: 14 }); return; }
    if (k === 3) { zone(60, 60, 320, 300, 'DB (book 10만 건)', {});
      for (let i = 0; i < 9; i++) { const y = 100 + i * 28; el('rect', { x: 80, y, width: 280, height: 22, rx: 4, fill: PANEL, stroke: GRID }); mono(92, y + 16, (i < 6 ? BOOKS[i][0] : '…').slice(0, 22), { 'font-size': 13.5, fill: MUT }); }
      const cur = Math.min(5, Math.floor(E(u, 0.3, 2.3) * 6)); el('rect', { x: 76, y: 98 + cur * 28, width: 288, height: 26, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 3 });
      grow(366, 111 + cur * 28, 520, 150, 1, ACC); card(600, 150, 150, 40, { rx: 20, text: '한 건씩', fs: 15, fill: ACCBG, stroke: ACC, color: ACC });
      card(640, 290, 380, 60, { rx: 10, stroke: BAD, dash: '5 4', s: pop(u, 1.6) }); tx(640, 296, 'items := 전부 메모리에 올리기', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.7) }); if (u > 2.0) cross(845, 290, 11, 1);
      return; }
    if (k === 4) { const ax = 120, sx = 820; person(ax - 40, 180, 'Client', { op: u > 1.4 ? 0.3 : 1 }); server(sx + 40, 180, 'Server', { s: 0.8 });
      ['#1', '#2', '#3', '#4'].forEach((s, i) => { const a = 0.2 + i * 0.4; const gone = i >= 2 && u > 1.4;
        const v = seg(u, a, a + 0.4); if (v <= 0) return; card(i >= 2 ? lerp(sx - 40, 520 + (i - 2) * 70, v) : lerp(sx - 40, 200 + i * 80, v), 150, 56, 28, { rx: 14, text: s, mono: true, fs: 13.5, fill: gone ? OFF : ACC, stroke: 'none', color: PANEL }); });
      if (u > 1.4) { cross(ax + 30, 180, 14, pop(u, 1.4)); tx(ax + 10, 250, '연결 끊음', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); }
      card(600, 280, 380, 50, { rx: 10, stroke: WARN, s: pop(u, 1.7) }); mono(600, 286, 'stream.Context().Err() != nil', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      stat(600, 350, 'return status 1 · Canceled', BAD, pop(u, 2.2)); return; }
    if (k === 5) { lane(E(u, 0.2, 2.6) * 4, { lamp: ACC });
      for (let i = 0; i < 4; i++) { const a = 0.2 + i * 0.6; if (u > a) mono(600, 280 + i * 26, `stream.Send(#${i + 1})  →  DATA`, { 'font-size': 14, fill: ACC, opacity: fade(u, a) }); }
      return; }
    if (k === 6) { lane(4, { eof: pop(u, 0.9) });
      mono(600, 300, 'return nil', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.3) });
      grow(660, 292, 660, 276, E(u, 0.6, 0.9), GOOD);
      sub(480, 360, 'close 호출이 따로 없다. 함수가 끝나면 gRPC 가 grpc-status: 0 을 보낸다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    // k7 기동
    terminal(80, 90, 380, 110, [['$ go run server_stream.go', null], ['listening :50051', null]], E(u, 0.2, 1.0) * 2, { title: 'server' });
    card(700, 145, 330, 90, { rx: 12, stroke: ACC, s: pop(u, 0.9) }); mono(700, 138, 'RegisterCatalogServer', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
    mono(700, 164, '/catalog.v1.Catalog/ListItems', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
    sub(480, 300, '등록과 Serve 는 Unary 때와 한 줄도 다르지 않다', fade(u, 1.8), { fill: INK, 'font-size': 15 }); }

  // ---------- 3. Go 클라이언트 ----------
  function s3(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { [['io', 'io.EOF'], ['errors', 'errors.Is'], ['grpc · insecure', '채널'], ['pb', 'NewCatalogClient']].forEach(([n, d], i) => {
        const x = 130 + i * 233, s = pop(u, 0.2 + i * 0.35); card(x, 160, 200, 60, { rx: 10, text: n, mono: true, fs: 15, fw: 800, s, stroke: i < 2 ? WARN : INK, color: i < 2 ? WARN : INK });
        tx(x, 215, d, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5 + i * 0.35) }); });
      sub(480, 320, '끝 신호 io.EOF 를 가려내려고 io·errors 가 함께 온다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { el('rect', { x: 150, y: 90, width: 660 * E(u, 0.1, 0.8), height: 200, rx: 24, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
      tx(170, 118, 'TCP 연결 하나 (HTTP/2)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.5) });
      person(80, 190, 'Client'); server(880, 190, 'Server', { s: 0.75 });
      [['1', 145], ['3', 195], ['5', 245]].forEach(([id, y], i) => { const a = 0.8 + i * 0.3; grow(190, y, 770, y, E(u, a, a + 0.5), ACC, { plain: true });
        if (u > a) pill(230, y, 'stream ' + id, ACC, pop(u, a), { mono: true, fs: 13.5, fill: PANEL });
        for (let j = 0; j < 3; j++) dot([[770, y], [300, y]], ((t * 0.5 + j / 3 + i * 0.1) % 1) * clamp((u - a - 0.5) * 5), ACC, 5); });
      sub(480, 340, '같은 연결에서 ListItems 세 번 = 스트림 id 1·3·5 (실측)', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 2) { card(300, 190, 300, 120, { rx: 14, stroke: ACC, sw: 2.5, s: pop(u, 0.2) }); mono(300, 160, 'client (stub)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      mono(300, 200, 'ListItems(ctx, req)', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      grow(455, 200, 590, 200, E(u, 0.9, 1.3), ACC); card(720, 200, 230, 60, { rx: 10, text: 'stream 핸들', fs: 16, fw: 800, stroke: ACC, color: ACC, s: pop(u, 1.3) });
      card(720, 290, 230, 44, { rx: 10, text: '값(Item) 아님', fs: 14.5, stroke: BAD, dash: '4 4', color: BAD, s: pop(u, 1.8) });
      pill(140, 330, 'defer conn.Close()', GOOD, pop(u, 2.1), { mono: true, fs: 13.5 }); return; }
    if (k === 3) { const ax = axes(120, 100, 700, 120, { x: [0, 32], y: [0, 1], xt: [0, 10, 20, 30], xl: '초' });
      el('line', { x1: ax.X(30), y1: 80, x2: ax.X(30), y2: 222, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 0.3) });
      mono(ax.X(30), 72, '데드라인 30s', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      const g = E(u, 0.5, 2.3); el('rect', { x: ax.X(0), y: 150, width: (ax.X(26) - ax.X(0)) * g, height: 28, rx: 6, fill: ACCBG, stroke: ACC });
      for (let i = 0; i < 12; i++) { const x = ax.X(1 + i * 2.1); if ((x - ax.X(0)) / (ax.X(26) - ax.X(0)) <= g) el('circle', { cx: x, cy: 164, r: 6, fill: ACC }); }
      tx(ax.X(0) + 4, 140, '스트림 전체 (첫 건부터 마지막 EOF 까지)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      sub(480, 300, '건마다가 아니라 스트림 하나 전체에 걸리는 시한이다', fade(u, 2.0), { fill: INK, 'font-size': 15 });
      sub(480, 330, '그래서 Unary 의 3초보다 넉넉하게 잡는다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 4) { person(90, 200, 'Client'); server(870, 200, 'Server', { s: 0.8 }); el('line', { x1: 150, y1: 200, x2: 810, y2: 200, stroke: GRID, 'stroke-width': 2.5 });
      [[0.2, 'H', ':path /catalog.v1.Catalog/ListItems', 120], [0.9, 'D', '00 00 00 00 08 0a 04 62 6f 6f 6b 10 64', 180]].forEach(([a, kd, s, y], i) => {
        const v = E(u, a, a + 0.7); frame(lerp(330, 600, v), y - 60 + i * 0, kd, s, v > 0 ? 1 : 0, 330); });
      pill(180, 290, 'stream 핸들 받음', ACC, pop(u, 1.8), { fs: 14 }); mono(480, 300, '받은 Item: 0', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(480, 360, '요청 = HEADERS + DATA(8바이트에 5바이트 머리). 아직 응답은 없다', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 5 || k === 6) { const n = k === 5 ? E(u, 0.2, 2.6) * 4 : tween(4, 5, u, 1.0) ; lane(n, { eof: k === 6 ? pop(u, 1.3) : 0 });
      if (k === 5) { const blocked = (n % 1) > 0.02; card(240, 290, 300, 50, { rx: 10, stroke: blocked ? WARN : GOOD, sw: 2 }); mono(240, 296, blocked ? 'Recv() 기다리는 중…' : 'Recv() → Item', { 'font-size': 15, 'text-anchor': 'middle', fill: blocked ? WARN : GOOD, 'font-weight': 700 }); return; }
      card(240, 300, 340, 70, { rx: 10, stroke: GOOD, sw: 2.5, s: pop(u, 1.8) }); mono(240, 294, 'errors.Is(err, io.EOF)', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); mono(240, 318, '→ break (정상 종료)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.0) });
      card(400, 380, 380, 40, { rx: 8, stroke: BAD, dash: '4 4', s: pop(u, 2.3) }); tx(400, 385, 'EOF 를 실패로 찍으면 매번 에러 로그', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.3) }); return; }
    if (k === 7) { lane(6, {}); const shown = E(u, 0.2, 2.4) * 6;
      BOOKS.forEach(([nm, pr], i) => { const v = clamp(shown - i); if (v <= 0) return; const y = 270 + (i % 3) * 30, x = i < 3 ? 60 : 500;
        mono(x, y, `#${i + 1}  ${nm}  (${pr}원)`, { 'font-size': 14, opacity: v }); });
      return; }
    // k8
    terminal(120, 60, 720, 280, BOOKS.map(([nm, pr], i) => `#${i + 1}  ${nm}  (${pr}원)`).concat([['총 6건 수신 완료', 'var(--good)']]), E(u, 0.1, 2.0) * 7, { title: 'client_stream.go', lh: 30, fs: 15 });
    sub(480, 380, '루프를 빠져나왔을 때 스트림은 이미 닫혀 있다', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 4. Python ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { code(120, 110, ['import grpc', 'import catalog_pb2, catalog_pb2_grpc', 'from concurrent import futures', 'from typing import Iterator'], E(u, 0.2, 1.4) * 4, { box: 520, hi: (i) => (i === 3 && u > 1.5 ? ACCBG : null) });
      sub(480, 300, 'Iterator 는 반환 타입에 쓴다. 응답이 여러 개라는 표시다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { card(250, 160, 320, 60, { rx: 10, text: 'catalog_pb2_grpc.CatalogServicer', mono: true, fs: 14, stroke: MUT, s: pop(u, 0.2) });
      grow(250, 250, 250, 194, E(u, 0.6, 1.0), MUT); card(250, 280, 320, 60, { rx: 10, text: 'class CatalogService', mono: true, fs: 15, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.9) });
      tx(560, 165, '생성된 부모', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4) }); tx(560, 285, '내가 채우는 자식 = Go 의 구조체 자리', { 'font-size': 15, opacity: fade(u, 1.2) }); return; }
    if (k === 2) { code(80, 100, ['def ListItems(self, request, context)', '        -> Iterator[catalog_pb2.Item]:'], 2, { box: 560, hi: (i) => (i === 1 && u > 0.8 ? ACCBG : null) });
      lbl(240, 220, 'Go', 1, { fill: MUT }); lbl(700, 220, 'Python', 1, { fill: ACC });
      mono(240, 260, 'stream 인자로 받음', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); mono(700, 260, '반환 타입으로 표현', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.3) });
      grow(350, 255, 590, 255, E(u, 1.5, 1.9), ACC); return; }
    if (k === 3) { const ax = axes(140, 80, 680, 180, { x: [0, 0.8], y: [0, 2], xt: [0, 0.2, 0.4, 0.6, 0.8], xl: '초' }), g = E(u, 0.2, 2.4) * 0.8;
      tx(130, ax.Y(1.5) + 5, '서버', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); tx(130, ax.Y(0.5) + 5, '클라', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      [[0.2, '#1', ACC], [0.4, '#2', ACC]].forEach(([tt, s]) => { if (g >= tt) { el('circle', { cx: ax.X(tt), cy: ax.Y(1.5), r: 8, fill: ACC }); el('circle', { cx: ax.X(tt), cy: ax.Y(0.5), r: 8, fill: ACC }); mono(ax.X(tt), ax.Y(0.5) + 28, s, { 'font-size': 13.5, 'text-anchor': 'middle' }); } });
      if (g >= 0.4) { cross(ax.X(0.4) + 30, ax.Y(0.5), 9, 1); mono(ax.X(0.4) + 46, ax.Y(0.5) + 5, 'cancel()', { 'font-size': 14, fill: BAD, 'font-weight': 700 }); }
      if (g >= 0.6) { mono(ax.X(0.6), ax.Y(1.5) - 16, 'is_active() = False', { 'font-size': 14, fill: BAD, 'font-weight': 800, 'text-anchor': 'middle' }); el('rect', { x: ax.X(0.6) - 6, y: ax.Y(1.5) - 6, width: 12, height: 12, fill: BAD }); }
      sub(480, 330, '2건 보낸 뒤 클라가 끊자 서버는 다음 반복에서 멈췄다 (python 실측)', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 4) { code(60, 80, ['for row in stream_from_db(request.category):', '    yield catalog_pb2.Item(id=…, name=…, price=…)'], 2, { fs: 14.5 });
      for (let i = 0; i < 4; i++) { const a = 0.4 + i * 0.5, v = seg(u, a, a + 0.5); if (v <= 0) continue;
        card(lerp(460, 120 + i * 140, E(v, 0, 1)), 220, 120, 36, { rx: 6, text: 'yield → DATA', fs: 13.5, fill: ACCBG, stroke: ACC, color: ACC }); }
      if (u > 2.5) frame(620, 300, 'T', 'grpc-status: 0', 1, 190);
      sub(250, 310, '제너레이터가 끝나면 EOF', fade(u, 2.5), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 5) { zone(240, 80, 480, 180, 'ThreadPoolExecutor(max_workers=8)', {});
      for (let i = 0; i < 8; i++) { const busy = i < Math.floor(E(u, 0.4, 1.8) * 3); card(290 + i * 54, 170, 44, 70, { rx: 6, stroke: busy ? ACC : GRID, fill: busy ? ACCBG : PANEL, text: busy ? '◀' : '', fs: 14, color: ACC }); }
      pill(480, 300, '[::]:50051', INK, pop(u, 1.6), { mono: true });
      sub(480, 360, '동기 서버에서 스트림 하나는 끝날 때까지 워커 하나를 잡는다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 6) { code(100, 120, ['with grpc.insecure_channel("localhost:50051") as channel:', '    stub = catalog_pb2_grpc.CatalogStub(channel)'], E(u, 0.2, 1.4) * 2, { box: 640 });
      sub(480, 260, '여기까지는 Unary 클라이언트와 한 줄도 다르지 않다', fade(u, 1.8), { fill: INK, 'font-size': 15 }); return; }
    if (k === 7) { spans(80, 100, ctok('stream = stub.ListItems(ListItemsRequest(category="book"))'), { 'font-size': 15, opacity: fade(u, 0.2) });
      card(300, 220, 360, 70, { rx: 10, stroke: ACC, s: pop(u, 0.8) }); mono(300, 214, 'type(stream)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
      mono(300, 240, '_MultiThreadedRendezvous', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      card(720, 220, 220, 50, { rx: 10, text: '완성된 리스트 아님', fs: 15, stroke: BAD, dash: '4 4', color: BAD, s: pop(u, 1.5) });
      sub(480, 330, 'for 로 돌 수 있는 이터러블. 돌 때마다 다음 메시지를 받는다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    // k8
    terminal(100, 60, 760, 250, [['#1  book 1  (1000원)   t=0.10s', null], ['#2  book 2  (2000원)   t=0.20s', null], ['#3  book 3  (3000원)   t=0.30s', null], ['#4  book 4  (4000원)   t=0.40s', null], ['#5  book 5  (5000원)   t=0.50s', null], ['총 5건 수신 완료', 'var(--good)']], E(u, 0.2, 2.4) * 6, { title: 'for item in stream:', lh: 30, fs: 15 });
    sub(480, 360, 'python 실측 출력. EOF 처리 없이 for 문이 알아서 끝났다', fade(u, 2.4), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 5. 정리 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { spans(80, 140, ctok('rpc GetItem (Req) returns (       Item);'), { 'font-size': 18 }); spans(80, 200, [['rpc ListItems(Req) returns (', {}], ['stream', u > 0.6 ? { fill: ACC, 'font-weight': 800, 'text-decoration': 'underline' } : {}], [' Item);', {}]], { 'font-size': 18 });
      sub(480, 290, '요청은 그대로 1개, 응답 앞에만 stream', fade(u, 1.2), { fill: INK, 'font-size': 15 }); return; }
    if (k === 1) { lbl(420, 60, 'Go', 1); lbl(740, 60, 'Python', 1);
      [['서버 송신', 'stream.Send(msg) 반복', 'yield msg'], ['서버 종료', 'return nil', '제너레이터 끝'], ['클라 수신', 'for { stream.Recv() }', 'for item in stream'], ['클라 종료', 'io.EOF → break', 'for 문이 끝남']].forEach(([r, g, p], i) => {
        const y = 110 + i * 66, op = fade(u, 0.2 + i * 0.4); tx(70, y + 5, r, { 'font-size': 15, 'font-weight': 700, opacity: op });
        card(420, y, 270, 46, { rx: 8, text: g, mono: true, fs: 13.5, stroke: GRID, op }); card(740, y, 270, 46, { rx: 8, text: p, mono: true, fs: 13.5, stroke: ACC, op }); }); return; }
    if (k === 2) { lbl(160, 50, 'Client → Server', 1, { fill: INFO }); lbl(700, 50, 'Server → Client', 1, { fill: ACC });
      frame(160, 110, 'H', ':path …/ListItems', pop(u, 0.2), 250); frame(160, 170, 'D', '13 B (5 + 8)', pop(u, 0.4), 250);
      [['H', ':status 200', 0.7], ['D', 'Item #1 · 25 B', 1.0], ['D', 'Item #2 · 27 B', 1.3], ['D', 'Item #3 · 29 B', 1.6], ['T', 'grpc-status: 0  OK', 2.0]].forEach(([kd, s, a], i) => frame(700, 100 + i * 56, kd, s, pop(u, a), 280));
      sub(160, 260, '스트림 id 하나 위에서', fade(u, 2.2), { 'font-size': 14.5 });
      sub(480, 405, 'grpc-js 서버에 예시 책 3권을 넣고 http2 로 받은 순서', fade(u, 2.4), { 'font-size': 13.5 }); return; }
    if (k === 3) { lbl(240, 60, '리스트를 다 만든 뒤 순회', 1, { fill: BAD }); lbl(720, 60, '커서로 한 건씩', 1, { fill: GOOD });
      const g = E(u, 0.2, 2.2); el('rect', { x: 120, y: 280 - 180 * g, width: 240, height: 180 * g, rx: 6, fill: BAD, opacity: 0.8 }); mono(240, 310, '메모리 ∝ N', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      el('rect', { x: 600, y: 256, width: 240, height: 24, rx: 6, fill: GOOD, opacity: 0.85 }); mono(720, 310, '메모리 = 한 건', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
      sub(480, 370, '전송만 바꾸고 생산을 안 바꾸면 이득이 없다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 4) { code(80, 80, ['for row in cursor:', '    if not context.is_active(): return', '    yield item'], 3, { box: 420, hi: (i) => (i === 1 ? GOODBG : null) });
      code(560, 80, ['if not context.is_active(): return', 'for row in cursor:', '    yield item'], 3, { box: 380, hi: (i) => (i === 0 ? BADBG : null) });
      check(280, 200, 12, pop(u, 0.8)); cross(740, 200, 12, pop(u, 1.2));
      sub(280, 240, '매 반복 확인', fade(u, 0.9), { fill: GOOD, 'font-weight': 700, 'font-size': 14.5 }); sub(740, 240, '처음 한 번만 확인', fade(u, 1.3), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 });
      sub(480, 330, '루프 밖 확인은 늦다. 끊긴 클라에 계속 보낸다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 5) { for (let i = 0; i < 6; i++) { const ok = i < 3, s = pop(u, 0.2 + i * 0.15); card(150 + i * 100, 130, 80, 40, { rx: 8, text: '#' + (i + 1), mono: true, fs: 15, fill: ok ? ACCBG : PANEL, stroke: ok ? ACC : GRID, color: ok ? ACC : MUT, s }); }
      if (u > 1.0) { cross(450, 130, 14, pop(u, 1.0)); }
      card(300, 250, 300, 56, { rx: 10, stroke: WARN, s: pop(u, 1.4) }); mono(300, 256, 'page_token = "after:#3"', { 'font-size': 15, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.5) });
      grow(460, 250, 640, 160, E(u, 1.8, 2.2), WARN); pill(700, 250, '#4 부터 다시', WARN, pop(u, 2.2), { mono: true });
      sub(480, 360, '처음부터 다시 받지 않으려면 재개 지점을 응답에 실어 둔다', fade(u, 2.4), { fill: INK, 'font-size': 14.5 }); return; }
    // k6 다음: 방향이 뒤집힌다
    person(130, 200, 'Client'); server(830, 200, 'Server', { s: 0.8 }); el('line', { x1: 180, y1: 200, x2: 770, y2: 200, stroke: GRID, 'stroke-width': 2 });
    const f = E(u, 0.4, 1.8); for (let i = 0; i < 4; i++) card(lerp(300 + i * 70, 640 - i * 70, f), 170, 56, 28, { rx: 14, text: f < 0.5 ? '#' + (i + 1) : 'Req', mono: true, fs: 13.5, fill: f < 0.5 ? ACC : INK, stroke: 'none', color: PANEL });
    if (f > 0.9) card(300, 240, 80, 28, { rx: 14, text: 'Resp', mono: true, fs: 13.5, fill: ACC, stroke: 'none', color: PANEL });
    sub(480, 330, '다음 장 II-2-1: 요청 N · 응답 1 (Client Streaming)', fade(u, 2.0), { fill: INK, 'font-size': 15 }); }

  const quiz = [
    { q: 'Unary rpc를 Server Streaming으로 바꾸려면 .proto에서 무엇을 고치나?',
      o: ['요청 타입 앞에 stream을 붙인다', '응답 타입 앞에 stream을 붙인다', 'service 이름 뒤에 stream을 붙인다'], a: 1,
      why: 'rpc ListItems(Req) returns (stream Item)처럼 응답 앞에만 붙인다. 요청은 여전히 1개다.' },
    { q: 'Go 스트리밍 핸들러에서 스트림을 정상으로 끝내는 방법은 무엇인가?',
      o: ['stream.Close()를 부른다', '빈 Item을 Send한다', '핸들러가 nil을 return한다'], a: 2,
      why: '따로 닫는 호출이 없다. 함수가 nil로 끝나면 gRPC가 grpc-status: 0 트레일러를 보낸다.' },
    { q: '클라이언트의 Recv()가 io.EOF를 돌려주면 어떻게 다뤄야 하나?',
      o: ['서버가 다 보냈다는 뜻이니 break한다', '네트워크 장애이니 재시도한다', '로그에 에러로 남기고 종료 코드 1로 끝낸다'], a: 0,
      why: 'io.EOF는 트레일러가 도착한 정상 종료 신호다. 그 밖의 error만 진짜 실패다.' },
    { q: 'Python 서버에서 context.is_active()를 어디서 확인해야 하나?',
      o: ['핸들러 맨 처음 한 번', 'yield하는 루프 안, 매 반복', '서버를 띄울 때'], a: 1,
      why: '실행해 보니 클라가 2건 뒤 끊자 다음 반복의 is_active()가 False가 되어 멈췄다. 루프 밖에서 한 번만 보면 끊긴 뒤에도 계속 보낸다.' },
    { q: '하나의 서버 스트리밍 호출은 HTTP/2에서 어떤 순서로 응답 프레임이 오나?',
      o: ['DATA만 N개', 'HEADERS 1개, DATA N개, 트레일러 HEADERS', '응답마다 새 TCP 연결'], a: 1,
      why: '실측 순서는 :status 200 HEADERS, Item마다 DATA, 끝에 grpc-status: 0 트레일러였다.' },
  ];
  const summary = [
    '목록이 크거나 끝을 모르면 Unary로 다 모아 보내는 동안 첫 결과가 늦고 메모리가 찬다.',
    'Server Streaming은 응답 앞에 stream을 붙여 요청 하나에 Item을 한 건씩 흘린다.',
    '서버는 Send나 yield를 되풀이하고 nil로 끝내면 grpc-status 0 트레일러가 간다.',
    '클라는 io.EOF까지 받고, 서버는 매 반복 취소를 확인하며 커서로 한 건씩 만든다.',
  ];
  const review = [
    { q: '10만 건 스트리밍으로 바꿨는데 서버 메모리가 그대로다. 먼저 볼 곳은?',
      o: ['서버가 목록을 다 읽어 리스트로 만든 뒤 Send하는지', '클라이언트 데드라인이 30초인지', 'HTTP/2 스트림 id가 홀수인지'], a: 0,
      why: '전송만 스트림이고 생산이 리스트면 메모리는 N만큼 든다. 커서나 제너레이터로 한 건씩 만들어야 한다.' },
    { q: '사용자가 목록 화면을 닫았는데 서버 로그에 Send가 계속 찍힌다. 무엇이 빠졌나?',
      o: ['io.EOF 처리', '루프 안의 취소 확인', '응답 타입 앞의 stream'], a: 1,
      why: '클라가 끊으면 ctx가 취소되지만 핸들러가 보지 않으면 계속 돈다. 매 반복 Context().Err()나 is_active()를 본다.' },
    { q: '목록 스트리밍이 매번 4번째 건 근처에서 끊겨 처음부터 다시 받는다. 어떻게 고치나?',
      o: ['데드라인을 없앤다', 'Unary로 되돌린다', '응답에 재개용 토큰을 실어 그 다음부터 다시 요청한다'], a: 2,
      why: '스트림은 순서는 지키지만 중간 재개는 해 주지 않는다. 마지막으로 받은 지점을 토큰으로 넘겨 이어 받는다.' },
  ];

  R.page({ title: '응답 스트림', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
