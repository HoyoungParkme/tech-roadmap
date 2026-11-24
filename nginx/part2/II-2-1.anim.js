/* II-2-1 WebSocket 프록시 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * Sec-WebSocket-Accept 는 RFC 6455 규칙(SHA-1(key + GUID) → base64)으로, ip_hash 결과는
 * ngx_http_upstream_ip_hash_module 의 계산(앞 세 옥텟, 89·113·6271)을 파이썬으로 재현해 얻은 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, redisBox, person, browser, cross, check, lock, terminal, snippet, spans, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const nginx = (cx, cy, sub, o) => redisBox(cx, cy, Object.assign({ name: 'Nginx', sub }, o || {}));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ACCEPT = 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=';
  // 시퀀스 화살표: y 높이에서 x1 → x2, 위에 글자
  function msg(x1, x2, y, u, label, col, o) { o = o || {}; grow(x1, y, x2, y, u, col || MUT, { sw: o.sw || 2.4, dash: o.dash });
    if (label && u > 0.3) tx((x1 + x2) / 2, y - 7, label, { 'font-size': o.fs || 13.5, 'text-anchor': 'middle', class: 'mono', 'font-weight': 700, fill: col || INK, opacity: clamp(u * 2 - 0.6) }); }
  function lifeline(x, name, col, y0) { lbl(x, 34, name, 1, { fill: col || INK }); el('line', { x1: x, y1: y0 || 48, x2: x, y2: 404, stroke: col || GRID, 'stroke-width': 2.5, 'stroke-dasharray': '4 5' }); }

  // ---------- 1. 핸드셰이크 ----------
  function s1(t, c) { const { k, u } = c, CX = 110, SX = 880;
    if (k === 4) { const NX = 500;
      lifeline(CX, '브라우저'); lifeline(NX, 'Nginx (설정 빠짐)', WARN); lifeline(SX, '백엔드');
      msg(CX, NX, 90, E(u, 0.2, 0.8), 'GET /ws/chat', INK);
      ['Upgrade: websocket', 'Connection: Upgrade'].forEach((h, i) => mono(CX + 20, 122 + i * 22, h, { 'font-size': 13.5, fill: ACC, opacity: fade(u, 0.5) }));
      msg(NX, SX, 200, E(u, 0.9, 1.5), 'GET /ws/chat', INK);
      ['Upgrade', 'Connection'].forEach((h, i) => { const y = 232 + i * 22, a = E(u, 1.2, 1.6); mono(NX + 20, y, h + ': …', { 'font-size': 13.5, fill: OFF });
        if (a > 0) el('line', { x1: NX + 18, y1: y - 5, x2: NX + 18 + 140 * a, y2: y - 5, stroke: BAD, 'stroke-width': 2.2 }); });
      tx(NX + 190, 244, '홉 단위 헤더라 그냥은 안 넘어간다', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.5) });
      msg(SX, CX, 310, E(u, 1.7, 2.3), '200 OK (101 아님)', BAD);
      if (u > 2.3) { cross(CX + 40, 358, 10, pop(u, 2.3)); tx(CX + 62, 364, 'WebSocket connection failed', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, class: 'mono', opacity: fade(u, 2.3) }); }
      return; }
    const ws = k >= 3; lifeline(CX, '브라우저', ws ? ACC : null); lifeline(SX, '서버', ws ? ACC : null);
    msg(CX, SX, 92, k === 0 ? E(u, 0.2, 1.0) : 1, 'GET /ws/chat HTTP/1.1', INK, { fs: 14.5 });
    const H = [['Upgrade: websocket', 0], ['Connection: Upgrade', 0], ['Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==', 1], ['Sec-WebSocket-Version: 13', 1]];
    H.forEach(([h, kk], i) => { if (kk > k) return; const op = kk === k ? fade(u, (kk ? 0.2 : 0.9) + (i % 2) * 0.3) : k >= 2 ? 0.55 : 1;
      mono(CX + 16, 124 + i * 22, h, { 'font-size': 13.5, fill: i === 2 && k === 1 ? ACC : INK, 'font-weight': i < 2 && k === 0 ? 700 : 400, opacity: op }); });
    if (k === 0) note(CX + 16, 250, '겉보기엔 80/443으로 가는 평범한 HTTP 요청이다', fade(u, 1.8), { 'font-size': 14.5 });
    if (k === 1) { const X = 520;
      [['Key + GUID', 0.8], ['SHA-1', 1.2], ['base64', 1.6]].forEach(([s, a], i) => { pill(X + i * 120, 140, s, INFO, pop(u, a), { fs: 13.5 }); if (i < 2) grow(X + 48 + i * 120, 140, X + 72 + i * 120, 140, E(u, a + 0.2, a + 0.4), MUT); });
      mono(SX - 10, 190, ACCEPT, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      tx(SX - 10, 214, '서버가 계산할 Accept 값', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.1) }); }
    if (k >= 2) { msg(SX, CX, 252, k === 2 ? E(u, 0.2, 1.0) : 1, '101 Switching Protocols', ACC, { fs: 14.5 });
      mono(SX - 10, 280, 'Sec-WebSocket-Accept: ' + ACCEPT, { 'font-size': 13.5, 'text-anchor': 'end', opacity: k === 2 ? fade(u, 0.9) : 0.55 });
      if (k === 2) note(CX + 16, 340, '이 순간부터 이 TCP는 HTTP가 아니다', fade(u, 1.7), { fill: ACC }); }
    if (k === 3) { const F = [['TEXT "hello"', 1], ['TEXT "hi"', -1], ['BINARY (…)', 1], ['CLOSE', 1]];
      F.forEach(([s, d], i) => { const y = 312 + i * 26, a = E(u, 0.2 + i * 0.45, 0.6 + i * 0.45); msg(d > 0 ? CX : SX, d > 0 ? SX : CX, y, a, s, i === 3 ? WARN : ACC, { sw: 2 }); });
      tx(SX - 10, 412, '요청·응답 짝 없이 아무 때나 보낸다', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.2) }); } }

  // ---------- 2. proxy_http_version 1.1 ----------
  function legs(ver, verCol, o) { o = o || {};
    browser(90, 130, 110, 76, '브라우저'); nginx(460, 130, '/ws/'); server(830, 122, '백엔드', {});
    grow(148, 130, 396, 130, 1, GRID, { plain: true, sw: 2.5 }); grow(524, 130, 770, 130, 1, GRID, { plain: true, sw: 2.5 });
    pill(272, 98, 'HTTP/1.1', GOOD, 1, { mono: true, fs: 13.5 }); pill(647, 98, ver, verCol, o.s ?? 1, { mono: true, fs: 13.5 });
    tx(272, 166, '앞 구간', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); tx(647, 166, '뒷 구간 (따로 정한다)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
  function s2(t, c) { const { k, u } = c;
    const v11 = k >= 1 && k !== 2;
    if (k === 1) { const a = E(u, 0.5, 1.2); legs(a > 0.5 ? 'HTTP/1.1' : 'HTTP/1.0', a > 0.5 ? GOOD : WARN, { s: a > 0.5 ? pop(u, 0.85) : 1 }); }
    else legs(k === 2 ? 'HTTP/1.0' : v11 ? 'HTTP/1.1' : 'HTTP/1.0 (1.29.7 전 기본)', v11 ? GOOD : WARN);
    if (k <= 1) { const lines = ['location /ws/ {', '    proxy_pass http://ws_backend;']; if (k === 1) lines.push('    proxy_http_version 1.1;'); lines.push('}');
      snippet(40, 220, lines, { fs: 14.5, w: 420, op: k === 0 ? fade(u, 0.2) : 1 });
      note(520, 260, k === 0 ? '1.29.7 전 버전은 뒷 구간이 1.0이다' : '한 줄로 뒷 구간이 1.1이 된다', fade(u, k === 0 ? 1.0 : 1.4), { 'font-size': 14.5, fill: k === 0 ? WARN : GOOD });
      note(520, 290, k === 0 ? 'WS는 아직 성립하지 않는다' : '1.29.7부터는 기본값이지만 적어 둔다', fade(u, k === 0 ? 1.3 : 1.8), { 'font-size': 14.5, fill: MUT }); return; }
    if (k === 2) { card(647, 250, 300, 90, { rx: 10, stroke: WARN, s: pop(u, 0.2) });
      mono(510, 232, 'GET /ws/chat HTTP/1.0', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(510, 258, 'Upgrade: websocket', { 'font-size': 14, fill: OFF, opacity: fade(u, 0.5) });
      if (u > 0.9) el('line', { x1: 508, y1: 253, x2: 508 + 170 * E(u, 0.9, 1.3), y2: 253, stroke: BAD, 'stroke-width': 2.2 });
      tx(510, 284, 'Upgrade는 1.1 사양, 1.0에선 무시', { 'font-size': 13.5, fill: WARN, opacity: fade(u, 1.2) });
      msg(770, 524, 340, E(u, 1.6, 2.2), '101이 안 온다', BAD);
      note(40, 250, '브라우저가 1.1로 보내도', fade(u, 0.6), { 'font-size': 14.5 }); note(40, 278, '뒷 구간 버전은 별개다', fade(u, 0.8), { 'font-size': 14.5 }); return; }
    if (k === 3) { terminal(40, 200, 880, 206, ['$ curl -i --http1.1 \\', '    -H "Connection: Upgrade" \\', '    -H "Upgrade: websocket" \\', '    -H "Sec-WebSocket-Key: x==" \\', '    -H "Sec-WebSocket-Version: 13" \\', '    http://api.example.com/ws/chat'], 1 + 5 * E(u, 0.1, 2.0), { title: 'curl로 핸드셰이크 흉내', lh: 26 }); return; }
    // k4 결과 읽기
    [['101 Switching Protocols', '정상', GOOD], ['200 / 400 / 502', 'conf를 의심', BAD]].forEach(([a, b, col], i) => { const y = 232 + i * 50, s = pop(u, 0.2 + i * 0.4);
      card(210, y, 340, 40, { rx: 8, stroke: col, text: a, mono: true, fs: 15, color: col, s }); tx(400, y + 5, b, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.4) }); });
    tx(560, 216, '프레임워크마다 WS 경로가 다르다', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.2) });
    [['FastAPI', '/ws/chat'], ['Socket.IO', '/socket.io/'], ['SignalR', '/hubs/…']].forEach(([n, p], i) => { const y = 246 + i * 36, a = fade(u, 1.4 + i * 0.25);
      tx(560, y, n, { 'font-size': 14.5, 'font-weight': 700, opacity: a }); mono(680, y, p, { 'font-size': 14.5, fill: ACC, opacity: a }); }); }

  // ---------- 3. map 과 핵심 두 줄 ----------
  function mapTable(x, y, o) { o = o || {}; const op = o.op ?? 1;
    card(x + 170, y + 60, 340, 120, { rx: 10, stroke: ACC, sw: 2, op });
    mono(x + 14, y + 22, 'map $http_upgrade $connection_upgrade', { 'font-size': 13.5, 'font-weight': 800, fill: ACC, opacity: op });
    [['default', 'upgrade'], ["''", 'close']].forEach(([a, b], i) => { const yy = y + 58 + i * 34, s = o.rows ? o.rows(i) : 1;
      mono(x + 40, yy, a, { 'font-size': 15, opacity: op * s }); grow(x + 130, yy - 5, x + 190, yy - 5, s, MUT); mono(x + 210, yy, b, { 'font-size': 15, 'font-weight': 800, fill: i ? WARN : GOOD, opacity: op * s }); }); }
  function s3(t, c) { const { k, u } = c;
    mapTable(30, 20, { rows: k === 0 ? (i) => E(u, 0.6 + i * 0.5, 1.0 + i * 0.5) : null });
    if (k === 0) { note(30, 200, '요청마다 $http_upgrade를 보고 값을 정한다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 1) { const RQ = [['WS 요청', 'Upgrade: websocket', 'upgrade', GOOD], ['일반 GET', 'Upgrade 없음 (빈 값)', 'close', WARN]];
      RQ.forEach(([n, h, v, col], i) => { const y = 230 + i * 80;
        tx(30, y, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.6) }); mono(30, y + 26, h, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.6) });
        grow(250, y + 8, 330, y + 8, E(u, 0.5 + i * 0.6, 0.9 + i * 0.6), MUT); pill(400, y + 8, 'Connection: ' + v, col, pop(u, 0.9 + i * 0.6), { mono: true, fs: 13.5 }); });
      note(520, 260, '같은 location이 HTTP와 WS를', fade(u, 2.0), { 'font-size': 14.5 }); note(520, 288, '함께 받아도 안전하다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    // k ≥ 2: 오른쪽 conf 트리
    zone(400, 20, 540, 72, null, { fill: PANEL, stroke: GRID, sw: 1.5, op: k === 2 ? fade(u, 0.1) : 1 });
    mono(416, 50, 'upstream ws_backend {', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 2 ? fade(u, 0.1) : 1 }); mono(436, 76, 'server app:8000;', { 'font-size': 13.5, fill: MUT, opacity: k === 2 ? fade(u, 0.3) : 1 });
    zone(400, 104, 540, 300, null, { fill: SOFT, stroke: GRID, sw: 1.5, op: k === 2 ? fade(u, 0.5) : 1 });
    mono(416, 130, 'server { listen 80; api.example.com', { 'font-size': 14, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.5) : 1 });
    if (k === 2) { note(30, 230, '여기까지는 일반 프록시와 같다', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    zone(416, 144, 508, 170, null, { fill: PANEL, stroke: ACC, sw: 1.8 });
    mono(432, 170, 'location /ws/ {', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    mono(452, 196, 'proxy_http_version 1.1;', { 'font-size': 13.5, fill: k === 3 ? INK : MUT, 'font-weight': k === 3 ? 700 : 400, opacity: k === 3 ? fade(u, 0.3) : 1 });
    if (k >= 4) { ['proxy_set_header Upgrade    $http_upgrade;', 'proxy_set_header Connection $connection_upgrade;'].forEach((s, i) => mono(452, 222 + i * 24, s, { 'font-size': 13.5, 'font-weight': k === 4 ? 700 : 400, fill: k === 4 ? ACC : MUT, opacity: k === 4 ? fade(u, 0.2 + i * 0.3) : 1 })); }
    if (k >= 5) mono(452, 270, 'Host · X-Real-IP · read/send 3600s', { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.2) });
    if (k === 3) { note(30, 230, '1.1과 Upgrade 헤더는', fade(u, 1.0), { 'font-size': 14.5 }); note(30, 258, '언제나 세트로 붙인다', fade(u, 1.1), { 'font-size': 14.5 }); return; }
    if (k === 4) { tx(30, 214, '백엔드로 가는 헤더', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      [['WS 요청', ['Upgrade: websocket', 'Connection: upgrade'], GOOD], ['일반 GET', ['(Upgrade 빈 값 → 안 보냄)', 'Connection: close'], WARN]].forEach(([n, hs, col], i) => { const y = 246 + i * 80;
        tx(30, y, n, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.5) });
        hs.forEach((h, j) => mono(40, y + 24 + j * 22, h, { 'font-size': 13.5, fill: j === 1 ? col : (h[0] === '(' ? MUT : col), opacity: fade(u, 0.6 + i * 0.5 + j * 0.15) })); });
      return; }
    // k5 타임아웃 막대: 0 ~ 120초 구간에서 기본 60s 와 3600s
    const x0 = 30, w = 340, X = (s) => x0 + w * s / 120, a = E(u, 0.3, 2.0);
    el('line', { x1: x0, y1: 360, x2: x0 + w, y2: 360, stroke: MUT, 'stroke-width': 1.8 });
    [0, 60, 120].forEach((v) => mono(X(v), 384, v + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    el('circle', { cx: X(0), cy: 300, r: 6, fill: ACC }); tx(x0, 280, '마지막 메시지', { 'font-size': 13.5, fill: MUT });
    el('rect', { x: x0, y: 318, width: Math.min(w * 0.5, w * a), height: 14, rx: 3, fill: BAD, opacity: 0.8 }); if (a > 0.5) { cross(X(60) + 12, 325, 7, pop(u, 1.2)); tx(X(60) + 26, 330, '기본 60s: 끊김', { 'font-size': 13.5, fill: BAD, 'font-weight': 700 }); }
    el('rect', { x: x0, y: 340, width: w * a, height: 10, rx: 3, fill: GOOD });
    tx(x0 + w, 280, '3600s: 계속 연결', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.8) }); }

  // ---------- 4. 정적 "upgrade" ----------
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { card(250, 70, 420, 56, { rx: 12, stroke: ACC, fill: ACCBG, text: 'realtime.example.com', mono: true, fs: 17, color: ACC, s: k === 0 ? pop(u, 0.2) : 1 });
      tx(250, 124, 'WebSocket 전용 서브도메인', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.6) : 1 });
      const conf = ['location / {', '    proxy_http_version 1.1;', '    proxy_set_header Upgrade $http_upgrade;', '    proxy_set_header Connection ' + (k === 0 ? '…' : '"upgrade";'), '}'];
      snippet(40, 160, conf, { fs: 14, w: 430, op: k === 0 ? fade(u, 0.8) : 1 });
      if (k === 0) { note(520, 200, '도메인을 나누면 조건 분기가 필요 없다', fade(u, 1.5), { 'font-size': 14.5 }); note(520, 228, '운영에서 가장 흔한 선택', fade(u, 1.8), { 'font-size': 14.5, fill: MUT }); return; }
      const RQ = [['WS 요청', 'upgrade', GOOD], ['일반 GET', 'upgrade', WARN]];
      tx(520, 180, 'Connection 값', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      RQ.forEach(([n, v, col], i) => { const y = 216 + i * 50; tx(520, y + 5, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.5) });
        pill(740, y, 'Connection: ' + v, col, pop(u, 0.6 + i * 0.5), { mono: true, fs: 13.5 }); });
      if (k === 1) { note(520, 340, '일반 요청에도 upgrade가 붙는다', fade(u, 1.8), { 'font-size': 14.5, fill: WARN }); return; }
      // k2 고르는 기준
      [['이 location은 WS만 온다', '정적 "upgrade"', GOOD], ['HTTP와 WS가 섞인다', 'map 변수', ACC]].forEach(([a, b, col], i) => { const y = 340 + i * 36, s = fade(u, 0.5 + i * 0.6);
        tx(520, y, a, { 'font-size': 14.5, opacity: s }); tx(940, y, b, { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: s }); });
      return; }
    if (k === 3) { tx(40, 50, 'DevTools · Network · WS', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      card(250, 100, 420, 64, { rx: 8, stroke: GRID, s: pop(u, 0.2) });
      [['Name', 'chat'], ['Status', '101'], ['Type', 'websocket']].forEach(([a, b], i) => { tx(64 + i * 140, 90, a, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) }); mono(64 + i * 140, 118, b, { 'font-size': 15, 'font-weight': 800, fill: i === 1 ? GOOD : INK, opacity: fade(u, 0.5) }); });
      ['↑ hello', '↓ hi'].forEach((s, i) => mono(520 + i * 160, 108, s, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9 + i * 0.3) }));
      tx(520, 80, 'Frames 탭', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) });
      terminal(40, 200, 880, 100, ['$ tail -f access.log', '"GET /ws/chat HTTP/1.1" 101'], 1 + E(u, 1.2, 2.0), { title: 'nginx access.log' });
      note(40, 350, '로그에 101이 찍히면 최소한 Nginx까지는 정상이다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    terminal(40, 40, 880, 200, ['$ npm i -g wscat', '$ wscat -c ws://realtime.example.com/', 'Connected (press CTRL+C to quit)', ['> hello', 'var(--panel)'], ['< hi from server', '#4ade80']], 1 + 4 * E(u, 0.2, 2.2), { title: 'wscat (출력은 예시)', lh: 28 });
    note(40, 300, '핸드셰이크 성공과 메시지 왕복은 따로 확인한다', fade(u, 2.3), { 'font-size': 14.5 }); }

  // ---------- 5. 운영 conf ----------
  const TREE = [['map $http_upgrade …', 0], ['upstream: app1 · app2 · ip_hash', 1], ['server: listen 443 ssl · 인증서', 2], ['  location /ws/: 1.1 · Upgrade · Connection', 3], ['  헤더: Host · X-Real-IP · XFF · Proto', 4], ['  read/send 3600s · buffering off', 5], ['백엔드: @app.websocket 에코', 6]];
  function s5(t, c) { const { k, u } = c;
    el('rect', { x: 20, y: 20, width: 400, height: 380, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(36, 46, 'ws-production.conf', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, class: 'mono' });
    TREE.forEach(([s, kk], i) => { if (kk > k) return; const on = kk === k, y = 82 + i * 46;
      if (on) el('rect', { x: 28, y: y - 22, width: 384, height: 34, rx: 7, fill: ACCBG, opacity: fade(u, 0.1) });
      mono(40, y, s, { 'font-size': 13.5, 'font-weight': on ? 800 : 500, fill: on ? ACC : INK, opacity: on ? fade(u, 0.2) : 0.75 }); });
    const X = 460;
    if (k === 0) { tx(X, 70, '운영은 혼용을 전제로 map부터 깐다', { 'font-size': 15, 'font-weight': 700 });
      [['Upgrade: websocket', 'upgrade', GOOD], ['(없음)', 'close', WARN]].forEach(([a, b, col], i) => { const y = 130 + i * 50;
        mono(X, y, a, { 'font-size': 14.5, opacity: fade(u, 0.4 + i * 0.4) }); grow(X + 200, y - 5, X + 260, y - 5, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), MUT); pill(X + 330, y - 5, b, col, pop(u, 0.9 + i * 0.4), { mono: true }); });
      return; }
    if (k === 1) { tx(X, 56, 'ip_hash: IPv4 앞 세 옥텟으로 노드를 고른다', { 'font-size': 15, 'font-weight': 700 });
      [['203.0.113.45', '.45'], ['203.0.113.99', '.99']].forEach(([ip, tail], i) => { const y = 104 + i * 104, a = fade(u, 0.3 + i * 0.7);
        spans(X, y, [['203.0.113', { fill: ACC, 'font-weight': 800 }], [tail, { fill: OFF }]], { 'font-size': 16, opacity: a });
        grow(X + 130, y - 5, X + 180, y - 5, E(u, 0.5 + i * 0.7, 0.8 + i * 0.7), MUT);
        mono(X + 190, y, 'hash 2592', { 'font-size': 15, opacity: fade(u, 0.7 + i * 0.7) });
        mono(X + 190, y + 26, '2592 % 2 = 0', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8 + i * 0.7) });
        pill(X + 400, y - 5, 'app1', ACC, pop(u, 0.9 + i * 0.7), { mono: true }); });
      note(X, 330, '같은 /24는 늘 같은 노드로 간다', fade(u, 2.2), { 'font-size': 14.5 });
      sub(X + 240, 362, '(nginx ip_hash 계산을 재현한 값)', fade(u, 2.3)); return; }
    if (k === 2) { browser(X + 50, 140, 100, 70, null, {}); nginx(X + 240, 140, ':443'); server(X + 410, 132, null, { s: 0.8 });
      grow(X + 102, 140, X + 176, 140, 1, GOOD, { plain: true, sw: 3 }); grow(X + 304, 140, X + 360, 140, 1, GRID, { plain: true, sw: 2.5 });
      lock(X + 139, 112, true, GOOD, pop(u, 0.3)); mono(X + 139, 180, 'wss://', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 800, opacity: fade(u, 0.5) });
      mono(X + 332, 180, 'ws://', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700, opacity: fade(u, 0.8) });
      note(X, 260, 'TLS는 Nginx에서 끝난다', fade(u, 1.2), { 'font-size': 14.5 });
      note(X, 290, 'https 페이지에서 ws://는 브라우저가 막는다', fade(u, 1.7), { 'font-size': 14.5, fill: WARN }); return; }
    if (k === 3) { tx(X, 60, '이 세 줄이 빠지면 나머지는 의미가 없다', { 'font-size': 15, 'font-weight': 700 });
      ['proxy_http_version 1.1;', 'Upgrade $http_upgrade;', 'Connection $connection_upgrade;'].forEach((s, i) => { card(X + 220, 110 + i * 50, 440, 38, { rx: 8, stroke: ACC, text: s, mono: true, fs: 14.5, s: pop(u, 0.3 + i * 0.3) }); });
      pill(X + 220, 290, '101 Switching Protocols', GOOD, pop(u, 1.6), { mono: true }); return; }
    if (k === 4) { tx(X, 60, '첫 요청은 HTTP라 II-1-2의 헤더가 그대로 필요하다', { 'font-size': 14.5, 'font-weight': 700 });
      ['Upgrade', 'Connection', 'Host', 'X-Real-IP', 'X-Forwarded-For', 'X-Forwarded-Proto'].forEach((h, i) => pill(X + 100 + (i % 2) * 230, 110 + Math.floor(i / 2) * 50, h, i < 2 ? ACC : INFO, pop(u, 0.3 + i * 0.2), { mono: true, fs: 13.5 }));
      return; }
    if (k === 5) { tx(X, 56, '연결 하나의 한 시간', { 'font-size': 15, 'font-weight': 700 });
      const x0 = X, w = 450, a = E(u, 0.2, 2.0); el('rect', { x: x0, y: 80, width: w, height: 18, rx: 4, fill: SOFT }); el('rect', { x: x0, y: 80, width: w * a, height: 18, rx: 4, fill: GOOD });
      mono(x0, 120, '0', { 'font-size': 13.5, fill: MUT }); mono(x0 + w, 120, '3600s', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      [0.05, 0.3, 0.32, 0.8].forEach((p) => { if (a > p) el('circle', { cx: x0 + w * p, cy: 89, r: 5, fill: ACC }); });
      note(X, 170, '메시지 없이도 3600초까지 유지', fade(u, 1.0), { 'font-size': 14.5 });
      note(X, 210, '101 뒤 프레임은 터널로 바로 흐른다', fade(u, 1.5), { 'font-size': 14.5, fill: MUT });
      note(X, 236, 'buffering off는 SSE 같은 응답이 섞일 때 대비', fade(u, 1.7), { 'font-size': 14.5, fill: MUT });
      note(X, 276, '메시지 크기 상한은 백엔드가 정한다', fade(u, 2.0), { 'font-size': 14.5, fill: INFO });
      mono(X, 302, 'uvicorn --ws-max-size 16777216 (기본)', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 2.1) }); return; }
    // k6 에코 루프
    snippet(X, 40, ['await ws.accept()', 'while True:', '    msg = await ws.receive_text()', '    await ws.send_text(f"echo: {msg}")'], { fs: 14, op: fade(u, 0.1) });
    fly(X, 220, X + 380, 220, seg(u, 0.4, 1.3), '"hello"', { mono: true });
    fly(X + 380, 270, X, 270, seg(u, 1.4, 2.3), '"echo: hello"', { mono: true, fill: GOOD });
    note(X, 340, 'Nginx 설정이 맞으면 이 코드가 그대로 돈다', fade(u, 2.3), { 'font-size': 14.5 }); }

  const quiz = [
    { q: 'WebSocket 핸드셰이크가 성공했을 때 서버가 돌려주는 상태 코드는 무엇인가?',
      o: ['200 OK', '101 Switching Protocols', '204 No Content'], a: 1,
      why: '101이 와야 그 TCP가 WebSocket으로 바뀐다. 200이면 그냥 HTTP 응답을 받은 것이다.' },
    { q: 'Nginx 1.29.7 전 버전에서 proxy_http_version 1.1을 빼면 WebSocket이 실패하는 까닭은 무엇인가?',
      o: ['뒷 구간이 HTTP/1.0이라 Upgrade 메커니즘이 없어서', '앞 구간이 HTTP/2로 바뀌어서', 'Nginx가 백엔드 포트를 못 찾아서'], a: 0,
      why: 'Upgrade는 HTTP/1.1 사양이다. 1.29.7 전에는 뒷 구간 기본이 1.0이라 백엔드가 101을 보내지 않는다.' },
    { q: 'map 패턴에서 Upgrade 헤더가 없는 일반 GET 요청의 $connection_upgrade 값은 무엇인가?',
      o: ['upgrade', 'keep-alive', 'close'], a: 2,
      why: "$http_upgrade가 빈 문자열이면 '' 줄에 걸려 close가 된다. 그래서 같은 location이 HTTP와 WS를 함께 받아도 된다." },
    { q: 'proxy_set_header Connection "upgrade"; 처럼 값을 고정해도 괜찮은 경우는 무엇인가?',
      o: ['그 location에 WebSocket 요청만 올 때', '일반 HTTP 요청이 더 많을 때', 'HTTP/1.0 백엔드를 쓸 때'], a: 0,
      why: '고정값은 일반 요청에도 Connection: upgrade를 붙인다. WS 전용 경로나 서브도메인일 때만 쓴다.' },
    { q: 'proxy_read_timeout을 그대로(60s) 두면 WebSocket에 어떤 일이 생기는가?',
      o: ['핸드셰이크가 실패한다', '60초 동안 메시지가 없으면 연결이 끊긴다', '메시지가 60초씩 늦게 도착한다'], a: 1,
      why: '백엔드가 60초 동안 아무것도 보내지 않으면 Nginx가 연결을 닫는다. 3600s로 늘리거나 ping을 보낸다.' },
  ];

  const summary = [
    'WebSocket은 Upgrade 헤더가 붙은 HTTP GET으로 시작해 101 응답 뒤 같은 TCP를 양방향으로 쓴다.',
    'Upgrade와 Connection은 홉 단위 헤더라 Nginx가 proxy_set_header로 직접 넘겨야 한다.',
    'map으로 Connection 값을 정하면 같은 location에서 일반 요청은 close, WS는 upgrade가 된다.',
    '유휴 연결은 기본 60초에 끊기니 proxy_read_timeout을 3600s로 늘린다.',
  ];
  const review = [
    { q: '브라우저 콘솔에 WebSocket connection failed가 뜨고 Nginx 로그에는 200이 찍혔다. 먼저 볼 곳은?',
      o: ['Upgrade·Connection을 넘기는 proxy_set_header 두 줄', '백엔드의 메시지 처리 코드', 'gzip 설정'], a: 0,
      why: '101 대신 200이 나왔다는 건 백엔드가 Upgrade 요청을 받지 못했다는 뜻이다. 헤더 두 줄과 HTTP/1.1 설정부터 본다.' },
    { q: '채팅은 잘 되는데 조용한 방은 1분쯤 지나면 연결이 끊긴다. 고칠 것은?',
      o: ['ip_hash를 끈다', 'proxy_http_version을 1.0으로 내린다', 'proxy_read_timeout을 늘리거나 ping을 보낸다'], a: 2,
      why: '기본 60초 동안 데이터가 없으면 Nginx가 끊는다. 3600s로 늘리고 백엔드 ping으로 유휴를 감지한다.' },
    { q: '앱 서버를 두 대로 늘린 뒤 Socket.IO 재접속이 자꾸 다른 서버로 가서 세션이 사라진다. 알맞은 설정은?',
      o: ['proxy_buffering on', 'upstream에 ip_hash', 'Connection "close" 고정'], a: 1,
      why: 'ip_hash는 IPv4 앞 세 옥텟으로 노드를 골라 같은 클라이언트를 같은 서버로 보낸다.' },
  ];

  R.page({ title: 'WebSocket 프록시', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
