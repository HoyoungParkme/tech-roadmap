/* IV-1-2 HTTP/2 + HTTP/3 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 연결·stream 수는 STEPS 의 connections / streams 를 읽는다. HPACK 바이트(0x82, 0xBE)는 RFC 7541 표현 규칙으로 계산한 값. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, browser, cross, check, lock, terminal, tokens } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function conf(x, y, lines, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || 22, rows = lines.map((l) => (typeof l === 'string' ? [l, {}] : l));
    const w = o.w || Math.max(...rows.map(([s]) => tw(s, fs))) + 34, h = rows.length * lh + 16, shown = o.shown ?? rows.length;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    rows.forEach(([s, m], i) => { const v = clamp(shown - i) * (o.op ?? 1); if (v <= 0) return; const yy = y + 8 + i * lh;
      if (m.hl || m.add || m.del) el('rect', { x: x + 4, y: yy + 1, width: w - 8, height: lh - 2, rx: 4, fill: m.add ? GOODBG : m.del ? BADBG : ACCBG, opacity: v });
      spans(x + 14, yy + lh / 2 + fs * 0.36, tokens(s), { 'font-size': fs, opacity: v * (m.dim ? 0.4 : 1), 'text-decoration': m.del ? 'line-through' : null }); });
    return { w, h }; }
  function nginxBox(cx, cy, o) { o = o || {}; card(cx, cy, o.w || 140, o.h || 80, { rx: 12, stroke: GOOD, fill: GOODBG, sw: 2.6, s: o.s, op: o.op });
    tx(cx, cy + 7, 'nginx', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: o.op ?? 1 }); }
  // 오른쪽 위 계기: TCP 연결 수와 동시 stream 수 (앞 beat 값에서 이어서)
  function gauges(c, x, y) { const b = c.beat, p = c.prev || {};
    const cn = tween(p.connections, b.connections, c.u), st = tween(p.streams, b.streams, c.u);
    R.meters(x || 650, y || 24, 290, [{ name: 'TCP/UDP 연결', val: String(Math.round(cn)), hot: cn > 1.5 }, { name: '동시 stream', val: String(Math.round(st)), good: st >= 100 }], { h: 64 }); }

  // ---------- 1. http2 on ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { conf(40, 40, ['server {', '    listen 443 ssl;', '    listen [::]:443 ssl;', ['    http2 on;', { hl: u > 0.8 }], '    server_name api.example.com;', '}'], { shown: E(u, 0.1, 0.9) * 6 });
      browser(560, 260, 120, 90, '브라우저', {}); nginxBox(830, 260, {});
      grow(622, 236, 758, 236, E(u, 1.0, 1.6), ACC); mono(690, 214, 'ALPN: h2, http/1.1', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      grow(758, 284, 622, 284, E(u, 1.7, 2.2), GOOD); mono(690, 312, '→ h2', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) });
      note(40, 260, '1.25.1부터 독립 지시자', fade(u, 1.0), { fill: ACC }); return; }
    if (k === 1) { browser(110, 200, 140, 100, null, {}); nginxBox(720, 120, {}); nginxBox(720, 300, {});
      lock(330, 120, true, GOOD, pop(u, 0.2)); mono(430, 100, 'https://', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.2) });
      grow(184, 170, 646, 120, E(u, 0.3, 1.0), GOOD); pill(520, 160, 'HTTP/2', GOOD, pop(u, 1.0), { mono: true });
      mono(430, 280, 'http://', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.2) });
      grow(184, 230, 646, 300, E(u, 1.3, 1.9), MUT); pill(520, 330, 'HTTP/1.1만', MUT, pop(u, 1.9), { mono: true });
      note(110, 380, '브라우저는 평문 HTTP/2를 쓰지 않는다', fade(u, 2.2), { fill: BAD }); return; }
    if (k === 2) { conf(40, 40, [['listen 443 ssl http2;', { del: 1 }], ['listen [::]:443 ssl http2;', { del: 1 }]], { shown: 2 * E(u, 0.1, 0.7) });
      conf(40, 140, [['listen 443 ssl;', { add: 1 }], ['http2 on;', { add: 1 }]], { shown: 2 * E(u, 1.6, 2.2) });
      terminal(420, 40, 520, 150, ['$ sudo nginx -t', ['nginx: [warn] the "listen ... http2"', 'var(--warn)'], ['directive is deprecated, use the', 'var(--warn)'], ['"http2" directive instead', 'var(--warn)']], E(u, 0.6, 1.5) * 4, { fs: 13.5 });
      note(40, 280, '아직 동작하지만 업그레이드마다 경고가 쌓인다', fade(u, 2.0)); return; }
    if (k === 3) { terminal(40, 40, 520, 120, ['$ curl -I --http2 https://api.example.com', ['HTTP/2 200', 'var(--term)'], 'server: nginx/1.27.x'], E(u, 0.2, 1.2) * 3, {});
      zone(600, 40, 330, 190, 'DevTools · Network', {});
      [['Name', 'Protocol'], ['index.html', 'h2'], ['app.js', 'h2'], ['logo.png', 'h2']].forEach(([a, b], i) => { const y = 94 + i * 34, op = i ? fade(u, 1.2 + i * 0.2) : 1;
        tx(620, y, a, { 'font-size': 14.5, 'font-weight': i ? 500 : 700, fill: i ? INK : MUT, class: i ? 'mono' : null, opacity: op });
        tx(830, y, b, { 'font-size': 14.5, 'font-weight': 800, fill: i ? GOOD : MUT, class: i ? 'mono' : null, opacity: op }); });
      note(480, 320, '설정이 아니라 응답 프로토콜을 눈으로 본다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 4) { gauges(c);
      [['multiplexing', '한 연결에 여러 요청'], ['HPACK', '헤더 압축'], ['우선순위', '중요한 것 먼저'], ['바이너리 프레임', '텍스트 대신 프레임']].forEach(([a, b], i) => {
        const x = 130 + i * 230, y = 230, s0 = pop(u, 0.3 + i * 0.3); card(x, y, 210, 110, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2, s: s0 });
        tx(x, y - 10, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4 + i * 0.3) });
        tx(x, y + 18, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.3) }); });
      note(40, 120, 'http2 on 한 줄로 따라오는 네 가지', fade(u, 0.1)); return; }
    browser(110, 220, 130, 96, '브라우저', {}); nginxBox(470, 220, {}); server(830, 212, 'backend', {});
    grow(180, 220, 396, 220, E(u, 0.2, 0.8), GOOD, { sw: 4 }); pill(288, 186, 'HTTP/2', GOOD, pop(u, 0.6), { mono: true });
    grow(544, 220, 768, 220, E(u, 1.0, 1.6), MUT, { sw: 4, dash: '8 6' }); pill(656, 186, 'HTTP/1.1', MUT, pop(u, 1.5), { mono: true });
    mono(656, 290, 'proxy_http_version', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    sub(656, 314, '1.29.7부터 기본 1.1 (이전 1.0)', fade(u, 1.9));
    note(480, 380, 'http2 on은 앞 구간만 바꾼다', fade(u, 2.3), { 'text-anchor': 'middle', fill: WARN }); }

  // ---------- 2. multiplexing ----------
  const LX = 120, LW = 500;
  function s2(t, c) { const { k, u } = c; gauges(c);
    if (k <= 1) { for (let r = 0; r < 6; r++) { const y = 60 + r * 46; mono(40, y + 18, `TCP${r + 1}`, { 'font-size': 14, 'font-weight': 700, fill: MUT });
        el('line', { x1: LX, y1: y + 13, x2: LX + LW, y2: y + 13, stroke: GRID, 'stroke-width': 2 });
        for (let j = 0; j < 5; j++) { let x = LX + j * 100, w = 86, col = ACC; const slow = k === 1 && r === 0;
          if (slow && j === 1) { w = 290; col = BAD; } if (slow && j > 1) { x = LX + 100 + 300 + (j - 2) * 100; if (j > 2) continue; col = OFF; }
          const v = clamp((k === 0 ? E(u, 0.2, 2.2) : 1) * 5 - j); if (v <= 0) continue;
          el('rect', { x, y: y + 2, width: w * (slow && j === 1 ? E(u, 0.3, 1.6) : v), height: 22, rx: 4, fill: col, opacity: 0.85 }); } }
      if (k === 0) note(LX, 360, '연결 하나는 요청-응답 한 쌍씩만', fade(u, 2.2));
      else { note(LX + 290, 40, '느린 응답 하나', fade(u, 1.0), { fill: BAD, 'text-anchor': 'middle' }); mono(LX + 470, 75, '대기', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
        card(800, 250, 280, 80, { rx: 10, stroke: WARN, fill: WARNBG, sw: 2, s: pop(u, 1.8) });
        mono(800, 244, '100개 ÷ 6연결', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
        mono(800, 270, '= 연결마다 17번 왕복', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.0) }); }
      return; }
    // 한 개의 TCP 파이프
    const py = 200; el('rect', { x: 40, y: py - 36, width: 580, height: 72, rx: 36, fill: SOFT, stroke: INK, 'stroke-width': 2.5 });
    mono(330, py - 50, 'TCP 연결 1개', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
    if (k === 2) { [1, 3, 5].forEach((sid, i) => { for (let j = 0; j < 3; j++) { const f = (u * 0.35 + j / 3 + i * 0.11) % 1; if (u < 0.2 + i * 0.2) continue;
          card(lerp(70, 590, f), py - 18 + i * 18, 44, 16, { rx: 3, fill: [ACC, INFO, WARN][i], stroke: 'none' }); } });
      [['stream 1', 'GET /index.html', ACC], ['stream 3', 'GET /style.css', INFO], ['stream 5', 'GET /app.js', WARN]].forEach(([a, b, col], i) => {
        mono(60, 300 + i * 30, a, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.2) }); mono(170, 300 + i * 30, b, { 'font-size': 14.5, opacity: fade(u, 0.4 + i * 0.2) }); });
      note(660, 330, '클라이언트 stream은 홀수 번호', fade(u, 2.0)); return; }
    if (k === 3 || k === 4) { const n = 26; for (let i = 0; i < n; i++) { const sid = 1 + i * 2, slow = k === 4 && i === 2, f = slow ? 0.05 + 0.2 * E(u, 0.2, 2.6) : (u * (0.3 + (i % 4) * 0.04) + i * 0.137) % 1;
        if (!slow && u < 0.1 + (i % 5) * 0.08) continue; card(lerp(70, 590, f), py - 22 + (i % 4) * 15, 30, 12, { rx: 3, fill: slow ? BAD : [ACC, INFO, WARN, GOOD][i % 4], stroke: 'none' }); }
      if (k === 3) { mono(60, 300, 'stream 1, 3, 5 … 199', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.5) }); note(60, 332, '응답은 도착하는 순서대로 받는다', fade(u, 1.5)); }
      else { note(60, 300, 'stream 5가 느려도', fade(u, 0.6), { fill: BAD }); note(60, 330, '다른 stream은 계속 도착한다', fade(u, 1.2), { fill: GOOD });
        for (let i = 0; i < 8; i++) check(380 + i * 30, 320, 8, pop(u, 1.4 + i * 0.1)); }
      return; }
    for (let i = 0; i < 18; i++) card(80 + i * 29, py - 22 + (i % 4) * 15, 22, 12, { rx: 3, fill: [ACC, INFO, WARN, GOOD][i % 4], stroke: 'none', op: 0.6 });
    if (k === 5) { [['100개 로딩', 8, 1.5, 's'], ['TLS handshake', 6, 1, '번']].forEach(([n, a, b, un], i) => { const y = 290 + i * 60, top = i ? 6 : 8;
        tx(40, y + 14, n, { 'font-size': 15, 'font-weight': 700 });
        R.hbar(200, y - 6, 300, a, top, { col: WARN, text: `HTTP/1.1 ${a}${un}`, h: 18, u: E(u, 0.3 + i * 0.5, 1.0 + i * 0.5) });
        R.hbar(200, y + 16, 300, b, top, { col: GOOD, text: `HTTP/2 ${b}${un}`, h: 18, u: E(u, 0.6 + i * 0.5, 1.3 + i * 0.5) }); });
      sub(700, 400, '페이지의 측정 예시', fade(u, 2.0)); return; }
    const cap = 128, st = tween(c.prev && c.prev.streams, c.beat.streams, u);
    el('rect', { x: 120, y: 290, width: 600, height: 26, rx: 6, fill: SOFT }); el('rect', { x: 120, y: 290, width: 600 * st / 160, height: 26, rx: 6, fill: ACC, opacity: 0.85 });
    el('line', { x1: 120 + 600 * cap / 160, y1: 278, x2: 120 + 600 * cap / 160, y2: 328, stroke: BAD, 'stroke-width': 3 });
    mono(120 + 600 * cap / 160, 350, 'http2_max_concurrent_streams 128', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.4) });
    sub(420, 390, '올릴수록 연결당 메모리가 는다 · 기본값 128', fade(u, 1.8), { 'font-size': 14.5 }); }

  // ---------- 3. HPACK ----------
  const HDR = ['GET /a HTTP/1.1', 'Host: api.example.com', 'User-Agent: Mozilla/5.0 …', 'Accept: */*', 'Cookie: session=abc123def'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { [0, 1].forEach((j) => { const x = 40 + j * 450; zone(x, 40, 420, 190, `요청 ${j + 1}`);
        HDR.forEach((h, i) => { const s = j && i === 0 ? 'GET /b HTTP/1.1' : h, same = i > 0 && j === 1;
          if (same && u > 1.6) el('rect', { x: x + 8, y: 62 + i * 30, width: 404, height: 26, rx: 4, fill: WARNBG });
          mono(x + 16, 80 + i * 30, s, { 'font-size': 14.5, opacity: fade(u, 0.2 + j * 0.7 + i * 0.1) }); }); });
      note(480, 300, '바뀐 것은 경로 한 줄, 나머지는 글자 그대로 다시 실린다', fade(u, 2.0), { 'text-anchor': 'middle', fill: WARN }); return; }
    if (k === 1) { const n = Math.round(E(u, 0.2, 2.0) * 100);
      for (let i = 0; i < n; i++) el('rect', { x: 40 + (i % 25) * 26, y: 60 + Math.floor(i / 25) * 34, width: 22, height: 28, rx: 3, fill: WARN, opacity: 0.75 });
      mono(720, 110, `${n} 요청`, { 'font-size': 20, 'font-weight': 800 });
      mono(720, 150, `헤더 ≈ ${Math.round(n * 0.3)}KB`, { 'font-size': 20, 'font-weight': 800, fill: WARN });
      note(40, 260, '쿠키가 클수록 손해가 커진다', fade(u, 2.2)); return; }
    if (k === 2 || k === 3) { zone(40, 30, 360, 330, k === 2 ? '정적 표 (스펙에 고정)' : '정적 61개 + 동적 표');
      const rows = [['1', ':authority'], ['2', ':method GET'], ['3', ':method POST'], ['7', ':scheme https'], ['8', ':status 200'], ['…', '…'], ['61', 'www-authenticate']];
      rows.forEach(([i, h], r) => { const hot = k === 2 && i === '2'; if (hot && u > 1.0) el('rect', { x: 50, y: 52 + r * 34, width: 340, height: 30, rx: 5, fill: ACCBG });
        mono(70, 72 + r * 34, i, { 'font-size': 14.5, 'font-weight': 800, fill: hot ? ACC : MUT, opacity: k === 2 ? fade(u, 0.1 + r * 0.08) : 0.5 });
        mono(120, 72 + r * 34, h, { 'font-size': 14.5, fill: hot ? ACC : INK, opacity: k === 2 ? fade(u, 0.1 + r * 0.08) : 0.5 }); });
      if (k === 2) { mono(470, 150, ':method: GET', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.8) }); grow(620, 144, 720, 144, E(u, 1.2, 1.7), ACC);
        card(790, 144, 110, 50, { rx: 8, stroke: ACC, fill: ACCBG, sw: 2.5, s: pop(u, 1.7), text: '0x82', fs: 20, mono: true, color: ACC, fw: 800 });
        note(470, 240, '인덱스 2 → 1바이트', fade(u, 2.0), { fill: ACC }); sub(620, 280, '협상 없이 처음부터 쓰는 사전', fade(u, 2.2)); return; }
      el('rect', { x: 50, y: 300, width: 340, height: 32, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.6) });
      mono(70, 321, '62', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) }); mono(120, 321, 'cookie: session=abc…', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.6) });
      note(450, 90, '요청 1: Cookie를 글자로 보내고 표에 등록', fade(u, 0.3)); grow(450, 110, 400, 300, E(u, 0.3, 0.8), ACC);
      note(450, 190, '요청 2부터: 번호만', fade(u, 1.2)); card(800, 184, 110, 50, { rx: 8, stroke: ACC, fill: ACCBG, sw: 2.5, s: pop(u, 1.5), text: '0xBE', fs: 20, mono: true, color: ACC, fw: 800 });
      sub(640, 260, '표에 없는 글자는 Huffman으로 줄인다', fade(u, 2.0), { 'font-size': 14.5 }); sub(640, 290, '동적 표는 연결마다 따로', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4) { [['요청 1', 500, WARN], ['요청 2~N', 30, GOOD]].forEach(([n, v, col], i) => { const y = 120 + i * 80;
        tx(60, y + 16, n, { 'font-size': 16, 'font-weight': 800 }); R.hbar(200, y, 520, v, 500, { col, text: `≈ ${v} B`, h: 26, u: E(u, 0.3 + i * 0.6, 1.2 + i * 0.6) }); });
      note(480, 330, '요청이 많을수록 이득이 커진다 · 90% 넘게 절감', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD }); return; }
    if (k === 5) { conf(40, 40, [['large_client_header_buffers 4 8k;', { add: 1 }], ['http2_max_header_size 32k;', { del: 1 }], ['http2_max_field_size 16k;', { del: 1 }]], { shown: 3 * E(u, 0.2, 1.2) });
      note(500, 70, '1.19.7부터 HTTP/2 헤더 한도도 이 버퍼', fade(u, 0.8), { fill: ACC });
      for (let i = 0; i < 4; i++) { el('rect', { x: 60 + i * 140, y: 230, width: 130, height: 40, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.2) });
        mono(125 + i * 140, 256, '8k', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
      const w = 180 * E(u, 1.6, 2.3); el('rect', { x: 64, y: 290, width: w, height: 22, rx: 4, fill: BAD, opacity: 0.8 });
      note(260, 306, '버퍼 하나보다 큰 쿠키 → 400', fade(u, 2.2), { fill: BAD }); return; }
    [['100요청 합산', 30, 3], ['큰 쿠키 환경', 100, 8]].forEach(([n, a, b], i) => { const y = 110 + i * 110;
      tx(60, y + 26, n, { 'font-size': 16, 'font-weight': 800 });
      R.hbar(240, y, 480, a, 100, { col: WARN, text: `HTTP/1.1 ${a}KB`, h: 22, u: E(u, 0.2 + i * 0.6, 0.9 + i * 0.6) });
      R.hbar(240, y + 32, 480, b, 100, { col: GOOD, text: `HPACK ${b}KB`, h: 22, u: E(u, 0.5 + i * 0.6, 1.2 + i * 0.6) }); });
    sub(480, 380, '페이지의 측정 예시 · 상행이 좁은 모바일에서 체감이 크다', fade(u, 2.0), { 'font-size': 14.5 }); }

  // ---------- 4. HTTP/3 (QUIC) ----------
  function stack(x, rows, op, o) { o = o || {}; rows.forEach(([s, col], i) => { const y = 70 + i * 56, v = o.u != null ? clamp(o.u * rows.length - (rows.length - 1 - i)) : 1;
      card(x, y, 220, 48, { rx: 8, stroke: col || INK, fill: col === ACC ? ACCBG : col === INFO ? INFOBG : PANEL, sw: 2.2, text: s, fs: 15.5, fw: 800, color: col || INK, op: op * v }); }); }
  const H2 = [['HTTP/2', INK], ['TLS 1.2 / 1.3', INK], ['TCP', INK], ['IP', MUT]], H3 = [['HTTP/3', ACC], ['QUIC + TLS 1.3', ACC], ['UDP', INFO], ['IP', MUT]];
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { stack(200, H2, 1, { u: k === 0 ? E(u, 0.2, 1.4) : 1 }); tx(200, 320, 'TCP 443', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
      if (k === 0) { note(200, 360, '그대로 둔다 → UDP가 막히면 여기로', fade(u, 1.8), { 'text-anchor': 'middle', fill: GOOD }); return; }
      stack(620, H3, 1, { u: k === 1 ? E(u, 0.2, 1.4) : 1 }); tx(620, 320, 'UDP 443', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO });
      if (k === 1) { mono(620, 362, 'listen 443 quic reuseport; http3 on;', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) });
        note(410, 210, '같은 443', fade(u, 2.0), { 'text-anchor': 'middle', fill: MUT }); return; }
      el('rect', { x: 500, y: 96, width: 240, height: 60, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: fade(u, 0.3) });
      note(765, 120, 'TLS 1.3이 QUIC 안에', fade(u, 0.4), { fill: ACC });
      mono(775, 170, 'ssl_protocols TLSv1.2;', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.0) }); cross(760, 165, 7, pop(u, 1.2));
      mono(775, 200, 'ssl_protocols TLSv1.3;', { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.6) }); check(760, 195, 8, pop(u, 1.8)); return; }
    if (k === 3) { browser(110, 220, 130, 96, '브라우저', {}); nginxBox(560, 220, {});
      grow(180, 196, 486, 196, E(u, 0.2, 0.8), INK); pill(330, 170, '첫 요청: TCP · h2', INK, pop(u, 0.6), { fs: 13.5 });
      grow(486, 246, 180, 246, E(u, 1.0, 1.6), ACC); mono(333, 278, 'Alt-Svc: h3=":443"; ma=86400', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      card(110, 360, 200, 48, { rx: 8, stroke: ACC, fill: ACCBG, sw: 2, s: pop(u, 2.0), text: '다음엔 h3 · 하루 기억', fs: 14, fw: 700, color: ACC });
      mono(760, 160, 'X-QUIC: $http3', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.2) }); sub(780, 186, 'h3면 "h3", 아니면 빈 값', fade(u, 2.3)); return; }
    if (k === 4) { const wx = 450;
      el('rect', { x: wx - 14, y: 50, width: 28, height: 260, rx: 4, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
      [['TCP 443', 110, true], ['UDP 443', 230, u > 1.2]].forEach(([n, y, open]) => { el('rect', { x: wx - 16, y: y - 16, width: 32, height: 32, rx: 5, fill: open ? GOODBG : BADBG, stroke: open ? GOOD : BAD, 'stroke-width': 2 });
        mono(wx - 30, y + 5, n, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'end', fill: open ? GOOD : BAD }); });
      dot([[120, 230], [wx - 20, 230]], seg(u, 0.2, 0.9), INFO, 7); if (u > 0.9 && u < 1.2) cross(wx - 40, 230, 10, 1);
      dot([[120, 230], [800, 230]], seg(u, 1.4, 2.1), INFO, 7); mono(640, 200, 'ufw allow 443/udp', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
      terminal(520, 290, 420, 100, ['$ curl --http3 -I https://api.example.com', ['HTTP/3 200', 'var(--term)']], E(u, 1.8, 2.5) * 2, { fs: 13.5 });
      note(60, 370, '대부분 방화벽은 TCP 443만 열려 있다', fade(u, 0.5), { fill: WARN }); return; }
    if (k === 5) { [['TCP (HTTP/2)', 100, true], ['QUIC (HTTP/3)', 250, false]].forEach(([n, y, tcp]) => {
        tx(40, y - 40, n, { 'font-size': 16, 'font-weight': 800, fill: tcp ? INK : ACC });
        for (let i = 0; i < 9; i++) { const sid = i % 3, lost = i === 3, x = 60 + i * 72; let col = [ACC, INFO, WARN][sid], op = 1;
          if (lost) { op = u > 0.8 ? 0.25 : 1; } else if (u > 1.0 && (tcp ? i > 3 : sid === 0 && i > 3)) { col = OFF; }
          card(x + 30, y, 60, 34, { rx: 5, fill: col, stroke: 'none', op: op * fade(u, 0.1 + i * 0.05), text: `s${[1, 3, 5][sid]}`, fs: 13.5, mono: true, color: PANEL }); }
        if (u > 0.8) cross(306, y, 12, pop(u, 0.8)); });
      note(720, 106, '잃은 1개 뒤로 전부 대기', fade(u, 1.2), { fill: BAD }); note(720, 256, 's1만 기다린다', fade(u, 1.5), { fill: GOOD });
      sub(480, 360, '0-RTT 재연결은 ssl_early_data on 일 때 · 셀↔Wi-Fi 전환에도 연결 유지', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    [['UDP 차단 환경 (일부 회사망)', BAD], ['미들박스 호환', BAD], ['CPU 사용 약간 증가', WARN]].forEach(([s, col], i) => { const y = 80 + i * 56;
      card(250, y, 400, 44, { rx: 8, stroke: col, fill: col === BAD ? BADBG : WARNBG, sw: 2, s: pop(u, 0.2 + i * 0.25), text: s, fs: 15, fw: 700, color: col }); });
    el('circle', { cx: 720, cy: 170, r: 90, fill: SOFT }); const f = 0.3 * E(u, 1.0, 2.0), a = -Math.PI / 2 + f * 2 * Math.PI;
    if (f > 0) el('path', { d: `M720,170 L720,80 A90,90 0 0 1 ${720 + 90 * Math.cos(a)},${170 + 90 * Math.sin(a)} Z`, fill: ACC, opacity: 0.85 });
    mono(720, 296, `모바일 약 ${Math.round(f * 100)}%`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    note(480, 380, '켜 두고 안 되면 HTTP/2로 떨어진다 · 위험이 낮다', fade(u, 2.2), { 'text-anchor': 'middle', fill: GOOD }); }

  // ---------- 5. dual stack ----------
  const PORTS = [['TCP 80', 100, MUT], ['TCP 443', 210, INK], ['UDP 443', 320, INFO]];
  function s5base(k, u) { browser(100, 210, 130, 100, '브라우저', {});
    card(470, 210, 170, 310, { rx: 14, stroke: GOOD, fill: GOODBG, sw: 2.6 }); tx(470, 76, 'nginx', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: GOOD });
    PORTS.forEach(([n, y, col], i) => { const show = i <= (k === 0 ? 0 : k === 1 ? 1 : 2), now = (k === 0 && i === 0) || (k === 1 && i === 1) || (k === 2 && i === 2);
      if (!show) return; card(470, y, 140, 40, { rx: 20, stroke: col, fill: PANEL, sw: 2.2, s: now ? pop(u, 0.2) : 1, text: n, fs: 15, fw: 800, color: col, mono: true }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 5) s5base(k, u);
    if (k === 0) { grow(168, 160, 398, 100, E(u, 0.4, 1.0), MUT); mono(280, 110, 'http://', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.5) });
      grow(398, 120, 168, 190, E(u, 1.2, 1.8), WARN); mono(640, 106, '→ 301 https://$host$request_uri', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4) });
      note(640, 160, '평문 진입점은 남기지 않는다', fade(u, 2.1)); return; }
    if (k === 1) { grow(168, 210, 398, 210, E(u, 0.4, 1.0), INK, { sw: 3.5 }); pill(280, 180, 'HTTP/2', INK, pop(u, 0.9), { mono: true });
      mono(580, 214, 'listen 443 ssl; http2 on;', { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 1.2) });
      note(580, 260, '모든 클라이언트가 최소 여기까지 온다', fade(u, 1.9), { fill: GOOD }); return; }
    if (k === 2) { grow(168, 250, 398, 320, E(u, 0.4, 1.0), INFO, { sw: 3.5 }); pill(270, 310, 'HTTP/3', INFO, pop(u, 0.9), { mono: true });
      mono(580, 324, 'listen 443 quic reuseport;', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.1) });
      [0, 1, 2, 3].forEach((i) => card(620 + i * 80, 380, 66, 30, { rx: 6, stroke: INFO, fill: INFOBG, sw: 1.6, s: pop(u, 1.6 + i * 0.12), text: `w${i + 1}`, fs: 13.5, mono: true, color: INFO }));
      sub(740, 352, 'reuseport: worker 마다 UDP 소켓', fade(u, 1.6)); return; }
    if (k === 3) { ['fullchain.pem', 'privkey.pem'].forEach((n, i) => { pill(740, 150 + i * 46, n, ACC, pop(u, 0.2 + i * 0.2), { mono: true });
        grow(670, 160 + i * 46, 546, 210 + i * 100, E(u, 0.8 + i * 0.2, 1.3 + i * 0.2), ACC); });
      mono(740, 300, 'ssl_protocols TLSv1.3;', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      sub(740, 330, 'TLS 1.2만 되는 오래된 클라이언트는 못 들어온다', fade(u, 2.0)); return; }
    if (k === 4) { [['Alt-Svc: h3=":443"; ma=86400', ACC], ['Strict-Transport-Security: max-age=31536000', GOOD]].forEach(([s, col], i) => {
        fly(380, 150 + i * 50, 180, 300 + i * 40, seg(u, 0.3 + i * 0.6, 1.2 + i * 0.6), i ? 'HSTS' : 'Alt-Svc', { fill: col, stay: true });
        mono(575, 140 + i * 40, s, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: fade(u, 1.2 + i * 0.6) }); });
      sub(720, 250, 'ma=86400 → 하루 동안 기억', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 5) { server(820, 210, 'backend', {}); grow(556, 210, 756, 210, E(u, 0.4, 1.2), MUT, { dash: '8 6', sw: 3 });
      pill(656, 170, 'HTTP/1.1', MUT, pop(u, 1.0), { mono: true }); mono(656, 290, 'proxy_http_version 1.1;', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      sub(656, 316, '앞단이 h3여도 뒤쪽은 그대로', fade(u, 2.0)); return; }
    // k6: 방문 순서
    const L = [['1번째 방문', 'TCP 443 · HTTP/2', 'Alt-Svc 받음', INK], ['2번째 방문', 'UDP 443 · HTTP/3', 'QUIC 연결', INFO], ['UDP가 막히면', 'TCP 443 · HTTP/2', '자동으로 돌아감', WARN]];
    L.forEach(([a, b, d, col], i) => { const y = 80 + i * 100, s0 = pop(u, 0.2 + i * 0.6);
      card(480, y, 820, 72, { rx: 12, stroke: col, fill: PANEL, sw: 2.2, s: s0 });
      tx(100, y + 6, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.6) });
      mono(330, y + 6, b, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.6) });
      tx(860, y + 6, d, { 'font-size': 15, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 0.5 + i * 0.6) }); }); }

  const quiz = [
    { q: '브라우저가 http:// 평문 접속에서 HTTP/2를 쓰지 않는 이유는 무엇인가?',
      o: ['nginx가 평문 HTTP/2를 지원하지 않아서', '브라우저가 HTTP/2를 TLS 위에서만 협상하기 때문', 'http2 on이 80 포트에서 오류를 내서'], a: 1,
      why: '브라우저는 TLS의 ALPN으로 h2를 고른다. 인증서 없이 평문으로 오면 HTTP/1.1로 남는다.' },
    { q: 'HTTP/1.1에서 리소스 100개를 받을 때 연결 6개가 각각 17번 왕복하는 까닭은 무엇인가?',
      o: ['연결 하나가 요청-응답을 한 쌍씩 차례로만 처리해서', 'HPACK이 꺼져 있어서', 'stream 번호가 홀수만 가능해서'], a: 0,
      why: '병렬도는 연결 수뿐이라 100 ÷ 6을 올림한 17번씩 줄을 선다. HTTP/2는 연결 하나에 stream 100개를 동시에 싣는다.' },
    { q: 'HPACK에서 두 번째 요청부터 Cookie 헤더를 1바이트(0xBE)로 보낼 수 있는 이유는 무엇인가?',
      o: ['Cookie가 정적 표 2번에 들어 있어서', '브라우저가 Cookie를 아예 보내지 않아서', '첫 요청 때 동적 표 62번에 등록해 두었기 때문'], a: 2,
      why: '정적 표는 61개로 끝나고 62번부터 그 연결의 동적 표다. 등록된 뒤에는 번호만 보내면 된다.' },
    { q: 'HTTP/3을 켰는데 ssl_protocols TLSv1.2;만 두었다. 무슨 일이 생기나?',
      o: ['HTTP/3이 동작하지 않고 TCP의 HTTP/2만 쓰인다', 'HTTP/3이 TLS 1.2로 자동 협상된다', 'HTTP/2까지 함께 꺼진다'], a: 0,
      why: 'QUIC은 TLS 1.3을 프로토콜 안에 품고 있다. 1.3을 허용해야 UDP 443 경로가 열린다.' },
    { q: '첫 방문 브라우저가 HTTP/3이 있다는 것을 아는 방법은 무엇인가?',
      o: ['DNS가 UDP 443을 알려 줘서', 'TCP로 받은 응답의 Alt-Svc 헤더를 보고', '서버가 먼저 UDP 패킷을 보내서'], a: 1,
      why: '첫 접속은 TCP 443의 HTTP/2로 온다. 응답의 Alt-Svc: h3=":443"; ma=86400을 기억했다가 다음부터 UDP로 온다.' },
  ];

  const summary = [
    'HTTP/2는 server 블록의 http2 on 한 줄로 켜고, 브라우저는 TLS 위에서만 쓴다.',
    'HTTP/1.1은 연결을 6개까지 늘려 병렬을 냈고, HTTP/2는 연결 하나에 stream을 여럿 싣는다.',
    'HPACK은 정적 표와 연결별 동적 표로 반복되는 헤더를 번호 한 바이트로 줄인다.',
    'HTTP/3은 UDP 443의 QUIC 위에서 돌고, Alt-Svc로 알리며 막히면 HTTP/2로 돌아간다.',
  ];
  const review = [
    { q: 'HTTP/3을 켜고 Alt-Svc도 붙였는데 devtools에 계속 h2만 보인다. 먼저 확인할 것은?',
      o: ['http2_max_concurrent_streams 값', '방화벽에서 UDP 443이 열려 있는지', 'gzip이 켜져 있는지'], a: 1,
      why: '대부분 방화벽은 TCP 443만 연다. UDP 443이 막히면 브라우저는 조용히 HTTP/2로 돌아간다.' },
    { q: '앞단을 HTTP/2로 바꿨는데 느린 API 응답 시간은 그대로다. 왜 그런가?',
      o: ['HPACK이 본문까지 압축하지 않아서', 'stream 번호가 부족해서', 'http2 on은 브라우저와 nginx 구간만 바꾸고 백엔드 처리 시간은 그대로라서'], a: 2,
      why: '뒤쪽 구간은 proxy_http_version이 따로 정한다. 백엔드 자체가 느리면 앞단 프로토콜로는 해결되지 않는다.' },
    { q: '모바일 망에서 패킷 하나가 사라졌을 때 HTTP/3이 HTTP/2보다 덜 막히는 이유는?',
      o: ['QUIC은 stream마다 순서를 따로 맞춰 잃은 stream만 기다리기 때문', 'UDP는 패킷을 잃지 않아서', 'HTTP/3은 헤더를 압축하지 않아서'], a: 0,
      why: 'TCP는 바이트 순서가 하나라 잃은 패킷 뒤의 모든 stream이 멈춘다. QUIC은 그 stream만 기다린다.' },
  ];

  R.page({ title: 'HTTP/2 · HTTP/3 연결 모습', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
