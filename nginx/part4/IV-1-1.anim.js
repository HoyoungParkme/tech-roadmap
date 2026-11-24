/* IV-1-1 TLS (Let's Encrypt) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 날짜·바이트·한도 값은 페이지 코드와 공식 문서(nginx.org, letsencrypt.org)에서 가져왔다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, browser, cross, check, lock, terminal, tokens } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 도우미 ----------
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // nginx 설정 조각: lines 는 문자열 또는 [문자열, {hl, add, del, dim}], o.shown 줄까지 보임(소수면 마지막 줄이 서서히)
  function conf(x, y, lines, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || 22, rows = lines.map((l) => (typeof l === 'string' ? [l, {}] : l));
    const w = o.w || Math.max(...rows.map(([s]) => tw(s, fs))) + 34, h = rows.length * lh + 16, shown = o.shown ?? rows.length;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    rows.forEach(([s, m], i) => { const v = clamp(shown - i) * (o.op ?? 1); if (v <= 0) return; const yy = y + 8 + i * lh;
      if (m.hl || m.add || m.del) el('rect', { x: x + 4, y: yy + 1, width: w - 8, height: lh - 2, rx: 4, fill: m.add ? GOODBG : m.del ? BADBG : ACCBG, opacity: v });
      spans(x + 14, yy + lh / 2 + fs * 0.36, tokens(s), { 'font-size': fs, opacity: v * (m.dim ? 0.4 : 1), 'text-decoration': m.del ? 'line-through' : null }); });
    return { w, h }; }
  function fileIcon(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), c = o.stroke || INK;
    el('path', { d: 'M-17,-22 H8 L17,-13 V22 H-17 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M8,-22 V-13 H17', fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    [-6, 1, 8].forEach((yy) => el('line', { x1: -10, y1: yy, x2: 10, y2: yy, stroke: OFF, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g));
    if (name) tx(0, 42, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: c === INK ? INK : c }, g); return g; }
  function caBox(cx, cy, s, o) { o = o || {}; card(cx, cy, 160, 64, { rx: 10, stroke: o.stroke || INFO, fill: INFOBG, sw: 2.4, s, text: o.text || "Let's Encrypt\nCA", fs: 15, fw: 800, color: o.stroke || INFO }); }
  // 방화벽 벽: 구멍(포트) 목록 [{y, name, open}]
  function wall(x, y0, y1, holes, op) { el('rect', { x: x - 13, y: y0, width: 26, height: y1 - y0, rx: 4, fill: SOFT, stroke: GRID, 'stroke-width': 2, opacity: op });
    for (let yy = y0 + 12; yy < y1; yy += 18) el('line', { x1: x - 13, y1: yy, x2: x + 13, y2: yy, stroke: GRID, 'stroke-width': 1.2, opacity: op });
    holes.forEach((h) => { el('rect', { x: x - 15, y: h.y - 15, width: 30, height: 30, rx: 5, fill: h.open ? GOODBG : BADBG, stroke: h.open ? GOOD : BAD, 'stroke-width': 2, opacity: op });
      mono(x, h.y + 5, h.name, { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: h.open ? GOOD : BAD, opacity: op }); }); }

  // ---------- 1. Let's Encrypt 사전 점검 ----------
  const CHK = ['A 레코드 확인', '80 포트 공개', 'certbot 설치', 'server_name 일치', '발급 한도 확인', 'CA 고르기'];
  function checklist(k, u) { zone(712, 30, 228, 290, '발급 전 점검');
    CHK.forEach((s, i) => { if (i > k) return; const y = 80 + i * 40, now = i === k, s0 = now ? pop(u, 2.0) : 1;
      el('circle', { cx: 738, cy: y - 5, r: 11, fill: now ? ACCBG : GOODBG, stroke: now ? ACC : GOOD, 'stroke-width': 1.8, opacity: now ? fade(u, 1.9) : 1 });
      check(738, y - 5, 6, s0); tx(758, y, s, { 'font-size': 15, 'font-weight': now ? 800 : 500, fill: now ? INK : MUT, opacity: now ? fade(u, 1.9) : 1 }); }); }
  function s1(t, c) { const { k, u } = c;
    checklist(k, u);
    if (k === 0) { terminal(30, 34, 460, 106, ['$ dig +short api.example.com', ['203.0.113.45', 'var(--term)']], 1 + E(u, 0.2, 1.0) * 1, { title: 'DNS 조회' });
      pill(130, 250, 'api.example.com', ACC, pop(u, 1.0), { mono: true });
      grow(232, 250, 432, 250, E(u, 1.3, 2.0), ACC); note(332, 236, 'A 레코드', fade(u, 1.5), { 'text-anchor': 'middle', fill: ACC });
      server(520, 240, null, { s: pop(u, 1.9), lamp: GOOD }); mono(520, 312, '203.0.113.45', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(350, 378, '이 IP가 우리 서버가 아니면 challenge가 닿지 않는다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 1) { caBox(110, 180, pop(u, 0.2));
      wall(340, 70, 300, [{ y: 150, name: '80', open: true }, { y: 230, name: '443', open: true }], fade(u, 0.4));
      server(560, 180, '우리 서버', { s: pop(u, 0.5) });
      const p = E(u, 0.8, 1.8); dot([[192, 165], [340, 150], [500, 160]], p, ACC, 7);
      grow(192, 150, 498, 150, E(u, 0.8, 1.8), ACC); note(345, 118, 'HTTP-01: GET :80', fade(u, 1.0), { 'text-anchor': 'middle', fill: ACC, class: 'mono' });
      card(340, 360, 520, 46, { rx: 23, stroke: INFO, fill: INFOBG, sw: 2, s: pop(u, 2.0), text: '80을 열 수 없으면 DNS-01 (TXT 레코드로 증명)', fs: 15, fw: 700, color: INFO }); return; }
    if (k === 2) { server(520, 230, '우리 서버', {});
      [['certbot', 'ACME 클라이언트 본체'], ['python3-certbot-nginx', 'nginx 플러그인']].forEach(([n, d], i) => { const y = 90 + i * 90, x = 190;
        card(x, y, 290, 58, { rx: 8, stroke: i ? ACC : INK, fill: i ? ACCBG : PANEL, sw: 2.2, s: pop(u, 0.3 + i * 0.5) });
        mono(x - 128, y - 2, n, { 'font-size': 15, 'font-weight': 800, fill: i ? ACC : INK, opacity: fade(u, 0.4 + i * 0.5) });
        tx(x - 128, y + 19, d, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) });
        grow(340, y, 455, 200 + i * 20, E(u, 1.2 + i * 0.3, 1.8 + i * 0.3), MUT); });
      pill(250, 330, 'sudo apt install -y certbot python3-certbot-nginx', INK, pop(u, 1.9), { mono: true, fs: 13.5 });
      note(520, 392, '→ --nginx 옵션을 쓸 수 있다', fade(u, 2.3), { 'text-anchor': 'middle', fill: ACC }); return; }
    if (k === 3) { const a = ['server {', '    listen 80;', ['    server_name api.example.com;', { hl: u > 1.4 }], '}'];
      const b = ['server {', '    listen 80;', '    server_name shop.example.com;', '}'];
      conf(40, 40, a, { shown: 1 + E(u, 0.1, 0.8) * 3 }); conf(40, 205, b, { shown: 1 + E(u, 0.4, 1.1) * 3, op: u > 1.4 ? 0.5 : 1 });
      // 돋보기가 server_name 줄로 내려온다
      const my = lerp(240, 95, E(u, 0.8, 1.5)); el('circle', { cx: 470, cy: my, r: 22, fill: 'none', stroke: ACC, 'stroke-width': 3.5, opacity: fade(u, 0.7) });
      el('line', { x1: 486, y1: my + 16, x2: 506, y2: my + 36, stroke: ACC, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: fade(u, 0.7) });
      mono(530, 100, '-d api.example.com', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      check(395, 92, 10, pop(u, 1.7)); note(400, 268, '대상 아님', fade(u, 1.8), { fill: MUT });
      sub(330, 380, 'certbot은 server_name이 같은 블록을 찾아 고친다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4) { note(40, 56, '등록 도메인당 7일에 50장', fade(u, 0.1));
      const n = Math.round(E(u, 0.3, 1.8) * 50);
      for (let i = 0; i < 50; i++) { const x = 44 + (i % 10) * 34, y = 76 + Math.floor(i / 10) * 30;
        el('rect', { x, y, width: 26, height: 22, rx: 4, fill: i < n ? ACC : PANEL, stroke: i < n ? ACC : GRID, 'stroke-width': 1.5 }); }
      mono(400, 160, `${n} / 50`, { 'font-size': 20, 'font-weight': 800, fill: n >= 50 ? BAD : INK });
      note(40, 262, '같은 이름 묶음은 7일에 5장', fade(u, 1.0));
      for (let i = 0; i < 5; i++) { const s0 = pop(u, 1.2 + i * 0.12); card(64 + i * 50, 300, 40, 32, { rx: 5, stroke: WARN, fill: WARNBG, s: s0 }); }
      zone(450, 230, 240, 120, '--staging', { stroke: INFO, dash: '6 5', fill: INFOBG, color: INFO, op: fade(u, 1.9) });
      tx(570, 290, '리허설용 서버', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.0) });
      sub(570, 316, '운영 한도와 따로 센다', fade(u, 2.1)); return; }
    // k5: CA 고르기
    [['Let\'s Encrypt', '무료 · 90일 · 자동화', ACC], ['ZeroSSL', '무료 · 90일', INK], ['유료 CA (DigiCert 등)', 'EV · 보증 · 1년', MUT]].forEach(([n, d], i) => {
      const y = 62 + i * 66, s0 = pop(u, 0.2 + i * 0.25); card(260, y, 420, 54, { rx: 10, stroke: i === 0 ? ACC : GRID, fill: i === 0 ? ACCBG : PANEL, sw: i === 0 ? 2.6 : 1.6, s: s0 });
      tx(70, y + 6, n, { 'font-size': 16, 'font-weight': 800, fill: i === 0 ? ACC : INK, opacity: fade(u, 0.3 + i * 0.25) });
      tx(450, y + 6, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.25) }); });
    const bw = 560 * E(u, 1.2, 2.0); el('rect', { x: 50, y: 268, width: bw, height: 22, rx: 5, fill: ACC, opacity: 0.85 });
    mono(50, 258, '0일', { 'font-size': 13.5, fill: MUT }); mono(610, 258, '90일', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    el('rect', { x: 50 + 560 * 60 / 90, y: 268, width: 560 * 30 / 90, height: 22, rx: 5, fill: WARN, opacity: 0.7 * fade(u, 2.0) });
    note(330, 330, '짧게 끝나므로 자동 갱신이 필수다', fade(u, 2.2), { 'text-anchor': 'middle', fill: WARN }); }

  // ---------- 2. certbot 발급 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { terminal(40, 40, 760, 150, ['$ sudo certbot --nginx -d api.example.com -d www.example.com', 'Enter email address: admin@example.com', 'Agree to the Terms of Service? (Y)es/(N)o: Y'], E(u, 0.2, 1.6) * 3, { title: 'certbot' });
      ['api.example.com', 'www.example.com'].forEach((d, i) => pill(200 + i * 230, 250, d, ACC, pop(u, 1.7 + i * 0.2), { mono: true }));
      note(660, 256, '→ 인증서 1장에 이름 2개', fade(u, 2.1), { fill: ACC });
      sub(420, 330, '이메일은 계정 연락용 — 만료 감시는 따로 둔다 (Step 4)', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 1) { caBox(120, 210, 1);
      server(760, 210, 'nginx + certbot', { lamp: GOOD });
      fileIcon(760, 80, null, { s: pop(u, 0.2), stroke: ACC }); mono(760, 135, '토큰 파일', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      mono(440, 120, 'GET /.well-known/acme-challenge/xxx', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      grow(205, 190, 695, 190, E(u, 0.6, 1.4), ACC); dot([[205, 190], [695, 190]], E(u, 0.6, 1.4), ACC, 7);
      pill(440, 160, ':80', ACC, pop(u, 0.6), { mono: true, fs: 13.5 });
      grow(695, 232, 205, 232, E(u, 1.5, 2.1), GOOD); dot([[695, 232], [205, 232]], E(u, 1.5, 2.1), GOOD, 7);
      note(440, 262, '200 + 같은 토큰', fade(u, 1.6), { 'text-anchor': 'middle', fill: GOOD });
      check(120, 300, 14, pop(u, 2.2)); note(150, 306, '도메인 소유 확인', fade(u, 2.2), { fill: GOOD }); return; }
    if (k === 2) { mono(40, 54, '/etc/letsencrypt/live/api.example.com/', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      [['fullchain.pem', '내 인증서 + 중간', 1], ['privkey.pem', '비밀키 (외부 금지)', 1], ['cert.pem', '내 인증서만', 0], ['chain.pem', '중간 인증서만', 0]].forEach(([n, d, use], i) => {
        const x = 120 + i * 215; fileIcon(x, 150, n, { s: pop(u, 0.3 + i * 0.3), stroke: use ? ACC : INK });
        sub(x, 224, d, fade(u, 0.5 + i * 0.3), { fill: use ? ACC : MUT });
        if (i === 1) lock(x + 30, 128, true, ACC, pop(u, 0.9)); });
      const bu = E(u, 1.8, 2.4); el('path', { d: `M60,260 V272 H${60 + 310 * bu} V260`, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      note(215, 302, 'nginx에 넣는 것은 이 두 개', fade(u, 2.3), { 'text-anchor': 'middle', fill: ACC });
      card(650, 300, 300, 46, { rx: 23, stroke: WARN, fill: WARNBG, sw: 2, s: pop(u, 2.4), text: '유효기간 90일', fs: 15, fw: 800, color: WARN }); return; }
    if (k === 3) { const L = ['server {', '    server_name api.example.com;', ['+   listen 443 ssl;', { add: 1 }], ['+   ssl_certificate     …/fullchain.pem;', { add: 1 }], ['+   ssl_certificate_key …/privkey.pem;', { add: 1 }], '}',
        ['+ server { listen 80; return 301 https://$host$request_uri; }', { add: 1 }]];
      conf(40, 40, L, { shown: 2 + E(u, 0.2, 1.6) * 5 });
      const s0 = pop(u, 1.9); card(800, 330, 230, 48, { rx: 24, fill: INK, stroke: 'none', s: s0, text: 'nginx -s reload', fs: 15, fw: 800, color: PANEL });
      note(560, 230, 'certbot이 conf를 직접 고친다', fade(u, 1.7), { fill: GOOD }); return; }
    // k4, k5: 세 가지 방식 비교
    const rows = [['--nginx', 'conf 자동 수정', '멈춤 없음', GOOD], ['certonly --webroot', 'conf 그대로', '멈춤 없음', GOOD], ['certonly --standalone', 'conf 그대로', 'nginx 중지', BAD]];
    tx(50, 46, '발급 방식', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(360, 46, 'conf', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(560, 46, 'nginx', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    rows.forEach(([a, b, d, col], i) => { if (i > k - 3) return; const y = 84 + i * 50, now = i === k - 3, op = now ? fade(u, 0.2) : 0.55;
      if (now) el('rect', { x: 36, y: y - 24, width: 680, height: 42, rx: 8, fill: ACCBG, opacity: fade(u, 0.2) });
      mono(50, y + 2, a, { 'font-size': 15, 'font-weight': 800, opacity: op }); tx(360, y + 2, b, { 'font-size': 15, opacity: op }); tx(560, y + 2, d, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op }); });
    if (k === 4) { server(170, 330, null, { lamp: GOOD, s: 0.8 }); note(240, 312, 'nginx 계속 실행', fade(u, 0.6), { fill: GOOD });
      fileIcon(520, 320, null, { s: pop(u, 0.8), stroke: ACC }); mono(520, 382, '/var/www/html/.well-known/…', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9) });
      grow(600, 320, 700, 320, E(u, 1.3, 1.9), ACC); note(710, 326, '토큰만 놓고 나간다', fade(u, 1.8), { fill: ACC }); return; }
    const x0 = 60, x1 = 880, y = 330; el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 3 });
    [['stop nginx', 0.3], ['certbot :80', 0.5], ['start nginx', 0.75]].forEach(([s, f], i) => { const x = lerp(x0, x1, f); el('circle', { cx: x, cy: y, r: 7, fill: i === 1 ? ACC : INK, opacity: fade(u, 0.3 + i * 0.4) });
      mono(x, y - 18, s, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }); });
    const dw = (lerp(x0, x1, 0.75) - lerp(x0, x1, 0.3)) * E(u, 1.0, 2.0); el('rect', { x: lerp(x0, x1, 0.3), y: y + 12, width: dw, height: 14, rx: 4, fill: BAD, opacity: 0.8 });
    note(lerp(x0, x1, 0.525), y + 54, '이 사이는 서비스 중단', fade(u, 2.1), { 'text-anchor': 'middle', fill: BAD }); }

  // ---------- 3. ssl_certificate 적용 ----------
  const P3 = { bx: 100, nx: 480, sx: 840, y: 230 };
  function nginxBox(cx, cy, o) { o = o || {}; card(cx, cy, 150, 84, { rx: 12, stroke: GOOD, fill: GOODBG, sw: 2.6, s: o.s, op: o.op });
    tx(cx, cy + 7, 'nginx', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: o.op ?? 1 }); }
  function s3base(o) { o = o || {}; browser(P3.bx, P3.y, 140, 104, '브라우저', {}); nginxBox(P3.nx, P3.y, {});
    if (!o.noBack) server(P3.sx, P3.y - 8, 'backend', { op: o.backOp ?? 1 }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 4) s3base({ backOp: k === 4 ? 1 : 0.35 });
    if (k === 0) { ['443 ssl', '[::]:443 ssl'].forEach((s, i) => pill(P3.nx - 6, P3.y + 70 + i * 36, s, GOOD, pop(u, 0.2 + i * 0.25), { mono: true, fs: 13.5 }));
      grow(172, P3.y - 20, 402, P3.y - 20, E(u, 0.8, 1.6), ACC); dot([[172, P3.y - 20], [402, P3.y - 20]], E(u, 0.8, 1.6), ACC, 7);
      mono(287, P3.y - 44, 'ClientHello', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9) });
      mono(287, P3.y + 10, 'SNI=api.example.com', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) });
      check(P3.nx + 62, P3.y - 50, 12, pop(u, 1.9)); note(P3.nx + 84, P3.y - 44, 'server_name 일치', fade(u, 2.0), { fill: GOOD });
      sub(480, 400, 'listen에 ssl이 없으면 443이어도 평문으로 답한다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 1) { const cy = 70;
      card(480, cy, 210, 50, { rx: 8, stroke: ACC, fill: ACCBG, sw: 2.2, s: pop(u, 0.2), text: 'api.example.com', fs: 14.5, fw: 800, color: ACC, mono: true });
      card(270, cy, 150, 50, { rx: 8, stroke: ACC, fill: ACCBG, sw: 2.2, s: pop(u, 0.5), text: '중간 인증서', fs: 14.5, fw: 800, color: ACC });
      card(90, cy, 150, 50, { rx: 8, stroke: INK, fill: PANEL, sw: 2, s: pop(u, 0.8), text: '루트', fs: 14.5, fw: 800 });
      grow(374, cy, 346, cy, E(u, 0.6, 0.9), MUT); grow(194, cy, 166, cy, E(u, 0.9, 1.2), MUT);
      const bu = E(u, 1.2, 1.8); el('path', { d: `M590,${cy + 32} V${cy + 42} H${590 - 400 * bu} V${cy + 32}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      mono(390, cy + 62, 'fullchain.pem = 이 두 장', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) });
      sub(90, cy + 62, '브라우저에 내장', fade(u, 1.0));
      lock(P3.nx + 92, P3.y + 2, true, ACC, pop(u, 2.0)); mono(P3.nx, P3.y + 72, 'privkey.pem은 nginx만', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.1) });
      sub(480, 400, 'cert.pem만 주면 중간이 빠져 일부 클라이언트가 검증에 실패한다', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 2) { card(P3.nx, 96, 260, 76, { rx: 10, stroke: INFO, fill: INFOBG, sw: 2, s: pop(u, 0.2) });
      mono(P3.nx, 88, 'shared:SSL:10m', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.3) });
      tx(P3.nx, 112, '≈ 40,000 세션 · 1d 보관', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.4) });
      const bar = (y, n, lab, col, a) => { tx(60, y + 15, lab, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) });
        for (let i = 0; i < n; i++) { const w = 150 * E(u, a + i * 0.3, a + 0.3 + i * 0.3); el('rect', { x: 200 + i * 160, y, width: w, height: 20, rx: 4, fill: col, opacity: 0.8 }); }
        mono(200 + n * 160 + 6, y + 15, `${n} 왕복`, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, a + n * 0.3) }); };
      bar(320, 2, '첫 접속', WARN, 0.6); bar(360, 1, '재접속', GOOD, 1.4);
      sub(760, 400, 'TLS 1.2 기준 · tickets off', fade(u, 2.2)); return; }
    if (k === 3) { caBox(840, 76, pop(u, 0.2), { text: 'CA OCSP\n응답기' });
      el('path', { d: `M${P3.bx + 40},${P3.y - 56} Q${P3.bx + 300},20 760,70`, fill: 'none', stroke: OFF, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      cross(330, 62, 12, pop(u, 0.8)); sub(330, 110, '브라우저가 따로 묻지 않는다', fade(u, 0.9));
      grow(P3.nx + 70, P3.y - 44, 770, 104, E(u, 1.0, 1.5), INFO); fly(P3.nx, P3.y - 50, P3.bx + 60, P3.y - 50, seg(u, 1.6, 2.3), '인증서 + OCSP 응답', { stay: true, fill: INFO });
      card(480, 380, 860, 44, { rx: 22, stroke: WARN, fill: WARNBG, sw: 2, s: pop(u, 2.4), text: "Let's Encrypt 는 2025년 8월 OCSP 를 끝냈다 → LE 인증서엔 stapling 이 무시된다", fs: 14.5, fw: 700, color: WARN }); return; }
    if (k === 4) { const p = E(u, 0.3, 2.2), x = p < 0.5 ? lerp(172, 405, p * 2) : lerp(555, 776, p * 2 - 1);
      el('line', { x1: 172, y1: P3.y + 30, x2: 405, y2: P3.y + 30, stroke: GOOD, 'stroke-width': 4 }); el('line', { x1: 555, y1: P3.y + 30, x2: 776, y2: P3.y + 30, stroke: OFF, 'stroke-width': 4, 'stroke-dasharray': '8 6' });
      lock(288, P3.y + 2, true, GOOD, 1); lock(665, P3.y + 2, false, MUT, pop(u, 1.1));
      note(288, P3.y + 70, 'HTTPS (암호문)', fade(u, 0.3), { 'text-anchor': 'middle', fill: GOOD }); note(665, P3.y + 70, 'HTTP (평문)', fade(u, 1.1), { 'text-anchor': 'middle', fill: MUT });
      if (p > 0 && p < 1) card(x, P3.y + 30, p < 0.5 ? 60 : 110, 26, { rx: 6, fill: p < 0.5 ? GOOD : PANEL, stroke: p < 0.5 ? 'none' : INK, sw: 1.5, text: p < 0.5 ? '▓▓▓' : 'GET /api', fs: 13.5, mono: true, color: p < 0.5 ? PANEL : INK });
      mono(665, 150, 'proxy_pass http://backend;', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      note(P3.nx, 360, '복호화는 여기서 한 번 · 인증서도 여기 한 곳', fade(u, 2.2), { 'text-anchor': 'middle', fill: GOOD }); return; }
    // k5, k6: 80 블록
    browser(P3.bx, 200, 140, 104, '브라우저', {}); nginxBox(420, 200, {});
    pill(420, 270, 'listen 80', INK, k === 5 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5 });
    if (k === 5) { fly(140, 80, 380, 160, seg(u, 0.6, 1.5), 'ACME 갱신 확인', { fill: INFO });
      note(560, 160, '80을 닫으면 갱신 challenge가', fade(u, 1.5)); note(560, 186, '들어올 길이 사라진다', fade(u, 1.6));
      note(560, 236, '→ 리디렉트용으로 열어 둔다', fade(u, 2.1), { fill: GOOD }); return; }
    const REQ = [['/.well-known/acme-challenge/abc', '/.well-known/acme-challenge/', 28, '200 파일', GOOD], ['/login', '/', 1, '301 https://…/login', WARN]];
    REQ.forEach(([path, loc, n, res, col], i) => { const y = 50 + i * 150, a = 0.2 + i * 1.1;
      mono(560, y, 'GET ' + path, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, a) });
      card(690, y + 44, 330, 38, { rx: 8, stroke: col, fill: PANEL, sw: 2, s: pop(u, a + 0.4), text: `location ${loc}`, fs: 13.5, mono: true, color: col });
      mono(905, y + 50, `${n}자`, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: fade(u, a + 0.5) });
      mono(560, y + 100, '→ ' + res, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, a + 0.7) }); });
    note(560, 370, '적힌 순서가 아니라 더 긴 접두어가 이긴다', fade(u, 2.4), { fill: ACC, 'font-size': 14.5 }); }

  // ---------- 4. 자동 갱신 ----------
  const TL = { x0: 80, x1: 880, y: 300 }, DX = (d) => lerp(TL.x0, TL.x1, d / 90);
  function timeline(op, o) { o = o || {}; el('rect', { x: TL.x0, y: TL.y - 12, width: TL.x1 - TL.x0, height: 24, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5, opacity: op });
    el('rect', { x: DX(60), y: TL.y - 12, width: DX(90) - DX(60), height: 24, rx: 6, fill: WARN, opacity: 0.35 * op });
    mono(TL.x0, TL.y + 34, '2/19', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); mono(DX(60), TL.y + 34, '4/20', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', opacity: op });
    mono(TL.x1, TL.y + 34, '5/20', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op });
    if (!o.noLab) tx(DX(75), TL.y - 22, '마지막 30일 = 갱신 구간', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: op }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { terminal(40, 36, 780, 120, ['$ systemctl list-timers | grep certbot', 'Tue 2026-05-19 12:42:00 UTC  ...  certbot.timer  certbot.service'], E(u, 0.2, 1.4) * 2, { title: 'systemd' });
      R.clock(150, 236, 34, 0.5 * E(u, 1.4, 2.4), INFO); note(200, 230, 'certbot.timer', fade(u, 1.4), { class: 'mono' });
      grow(330, 236, 420, 236, E(u, 1.8, 2.2), MUT); note(430, 242, 'certbot.service → certbot renew', fade(u, 2.0), { class: 'mono', 'font-size': 14.5 });
      sub(480, 330, '패키지가 timer를 이미 깔아 둔다 — 먼저 있는지 본다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    timeline(k === 1 ? fade(u, 0.1) : 1, { noLab: k === 1 });
    if (k === 1) { const n = Math.floor(E(u, 0.3, 2.0) * 180);
      for (let i = 0; i <= n; i++) el('line', { x1: DX(i / 2), y1: TL.y - 34, x2: DX(i / 2), y2: TL.y - 24, stroke: INFO, 'stroke-width': 1.2 });
      mono(80, 120, '0 */12 * * *  certbot -q renew', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      mono(80, 150, '    --deploy-hook "systemctl reload nginx"', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      note(80, 210, '하루 두 번 시도 · 성공했을 때만 reload', fade(u, 2.1)); return; }
    if (k === 2) { for (let i = 0; i <= 120; i++) el('line', { x1: DX(i / 2), y1: TL.y - 34, x2: DX(i / 2), y2: TL.y - 24, stroke: OFF, 'stroke-width': 1.2 });
      note(DX(28), 220, 'Cert not yet due — 아무 일 없음', fade(u, 0.3), { 'text-anchor': 'middle', fill: MUT });
      el('line', { x1: DX(60), y1: TL.y - 46, x2: DX(60), y2: TL.y - 12, stroke: GOOD, 'stroke-width': 4, opacity: fade(u, 1.0) });
      check(DX(60), TL.y - 60, 11, pop(u, 1.2)); note(DX(60) + 18, TL.y - 54, '첫 시도에서 갱신', fade(u, 1.3), { fill: GOOD });
      const w = (TL.x1 - DX(60)) * E(u, 1.6, 2.4); el('rect', { x: DX(60), y: TL.y + 50, width: w, height: 20, rx: 5, fill: GOOD, opacity: 0.8 });
      mono(DX(60) + 10, TL.y + 90, '새 인증서 90일 →', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { zone(80, 40, 380, 150, '--dry-run', { fill: INFOBG, stroke: INFO, dash: '6 5', color: INFO });
      card(190, 120, 150, 54, { rx: 10, stroke: INFO, fill: PANEL, sw: 2, text: 'staging CA', fs: 15, fw: 800, color: INFO, s: pop(u, 0.2) });
      server(380, 118, null, { s: 0.6 }); grow(270, 110, 335, 110, E(u, 0.5, 1.0), INFO); grow(335, 130, 270, 130, E(u, 1.0, 1.5), GOOD);
      terminal(500, 40, 440, 150, ['$ sudo certbot renew --dry-run', 'Simulating renewal of an existing', 'certificate for api.example.com', ['Congratulations, all simulated', 'var(--term)'], ['renewals succeeded', 'var(--term)']], E(u, 0.4, 2.0) * 5, { fs: 13.5, lh: 21 });
      note(480, 230, '운영 한도는 그대로 · 실패 지점만 미리 본다', fade(u, 2.3), { 'text-anchor': 'middle', fill: INFO }); return; }
    if (k === 4) { const g = R.G(170, 120, pop(u, 0.2), 1); el('rect', { x: -46, y: -30, width: 92, height: 60, rx: 6, fill: PANEL, stroke: MUT, 'stroke-width': 2.4 }, g);
      el('path', { d: 'M-46,-30 L0,6 L46,-30', fill: 'none', stroke: MUT, 'stroke-width': 2.4 }, g); cross(170, 120, 26, pop(u, 0.7));
      note(240, 106, 'LE 만료 안내 메일', fade(u, 0.4), { fill: MUT }); note(240, 132, '2025-06-04에 끝났다', fade(u, 0.8), { fill: BAD, class: 'mono' });
      const today = 74, left = 90 - today; el('line', { x1: DX(today), y1: TL.y - 14, x2: DX(today), y2: TL.y + 14, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 1.2) });
      tx(DX(today), TL.y - 52, '오늘 (예시)', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.2) });
      card(650, 130, 330, 76, { rx: 10, stroke: WARN, fill: WARNBG, sw: 2, s: pop(u, 1.6) });
      mono(500, 122, 'probe_ssl_earliest_cert_expiry', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(500, 150, `→ 남은 ${Math.round(tween(90, left, u - 1.6, 0.8))}일, 기준 아래면 알림`, { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) }); return; }
    terminal(40, 30, 880, 130, ['$ echo | openssl s_client -connect api.example.com:443 | openssl x509 -noout -dates', 'notBefore=Feb 19 12:00:00 2026 GMT', 'notAfter =May 20 12:00:00 2026 GMT'], E(u, 0.2, 1.4) * 3, { fs: 13.5 });
    const bu = E(u, 1.5, 2.2); el('path', { d: `M${TL.x0},${TL.y + 50} V${TL.y + 60} H${lerp(TL.x0, TL.x1, bu)} V${TL.y + 50}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
    note(480, TL.y + 88, '실제로 서빙되는 인증서 = 90일', fade(u, 2.2), { 'text-anchor': 'middle', fill: ACC }); }

  // ---------- 5. TLS 강화 ----------
  const CIPH = ['ECDHE-ECDSA-AES128-GCM-SHA256', 'ECDHE-RSA-AES128-GCM-SHA256', 'ECDHE-ECDSA-AES256-GCM-SHA384', 'ECDHE-RSA-AES256-GCM-SHA384', 'ECDHE-ECDSA-CHACHA20-POLY1305', 'ECDHE-RSA-CHACHA20-POLY1305', 'DHE-RSA-AES128-GCM-SHA256', 'DHE-RSA-AES256-GCM-SHA384'];
  function versions(u, live) { [['SSL 3.0', 0], ['TLS 1.0', 0], ['TLS 1.1', 0], ['TLS 1.2', 1], ['TLS 1.3', 1]].forEach(([n, ok], i) => { const y = 60 + i * 50, s0 = live ? pop(u, 0.2 + i * 0.12) : 1;
      card(130, y, 150, 38, { rx: 19, stroke: ok ? GOOD : BAD, fill: ok ? GOODBG : BADBG, sw: 2, s: s0, text: n, fs: 15, fw: 800, color: ok ? GOOD : BAD, mono: true });
      if (!ok) el('line', { x1: 60, y1: y, x2: lerp(60, 200, live ? E(u, 0.9 + i * 0.15, 1.2 + i * 0.15) : 1), y2: y, stroke: BAD, 'stroke-width': 3 }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { versions(u, k === 0); }
    if (k === 0) { tx(300, 46, 'Mozilla Intermediate', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.0) });
      CIPH.forEach((s, i) => mono(300, 76 + i * 27, s, { 'font-size': 14, opacity: fade(u, 1.1 + i * 0.12) }));
      note(300, 330, '목록은 직접 짜지 않고 생성기 결과를 붙인다', fade(u, 2.3), { fill: MUT }); return; }
    if (k === 1) { CIPH.forEach((s, i) => mono(300, 76 + i * 27, s, { 'font-size': 14, fill: i >= 6 ? ACC : MUT, 'font-weight': i >= 6 ? 800 : 400 }));
      el('path', { d: 'M560,247 H600 V290', fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, 0.4) });
      fileIcon(600, 318, null, { s: pop(u, 1.4), stroke: ACC }); mono(640, 314, 'dhparam.pem (2048비트)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      const p = E(u, 0.5, 1.4); el('rect', { x: 640, y: 330, width: 200, height: 10, rx: 4, fill: SOFT }); el('rect', { x: 640, y: 330, width: 200 * p, height: 10, rx: 4, fill: ACC });
      sub(740, 362, '생성에 시간이 걸린다 · 배포 전에 만든다', fade(u, 2.0)); return; }
    if (k === 2) { nginxBox(560, 230, {}); pill(400, 110, 'chain.pem', INFO, pop(u, 0.2), { mono: true }); pill(720, 110, 'resolver 1.1.1.1', INFO, pop(u, 0.4), { mono: true });
      grow(420, 132, 520, 186, E(u, 0.6, 1.1), INFO); grow(700, 132, 600, 186, E(u, 0.7, 1.2), INFO);
      note(560, 312, '둘 다 있어야 stapling이 돈다', fade(u, 1.4), { 'text-anchor': 'middle', fill: INFO });
      sub(560, 350, '단 OCSP 주소가 없는 LE 인증서는 경고 후 무시', fade(u, 2.1), { fill: WARN, 'font-size': 14.5 }); return; }
    if (k === 3) { browser(200, 200, 280, 200, '브라우저', {});
      card(200, 210, 230, 70, { rx: 8, stroke: ACC, fill: ACCBG, sw: 2, s: pop(u, 0.3) });
      mono(200, 202, 'api.example.com', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) });
      tx(200, 226, 'HTTPS만 · 365일', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5) });
      mono(560, 120, 'http://api.example.com', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8), 'text-decoration': u > 1.5 ? 'line-through' : null });
      mono(560, 160, '→ https://api.example.com', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      sub(660, 190, '평문 요청을 보내기 전에 브라우저가 바꾼다', fade(u, 1.6));
      ['X-Frame-Options: DENY', 'X-Content-Type-Options: nosniff', 'Referrer-Policy: strict-origin-…'].forEach((s, i) => pill(640, 250 + i * 40, s, INK, pop(u, 1.9 + i * 0.15), { mono: true, fs: 13.5 }));
      mono(200, 370, 'max-age=31536000', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6) }); return; }
    if (k === 4) { terminal(40, 40, 880, 136, ['$ curl -I https://api.example.com', 'HTTP/2 200', ['strict-transport-security: max-age=31536000; includeSubDomains; preload', 'var(--term)']], E(u, 0.2, 1.4) * 3, {});
      card(480, 280, 380, 70, { rx: 12, stroke: INFO, fill: INFOBG, sw: 2, s: pop(u, 1.6), text: 'SSL Labs에서 밖에서 본 등급 확인', fs: 15, fw: 700, color: INFO });
      sub(480, 360, '설정 파일이 아니라 응답을 본다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    const L = [['Let\'s Encrypt 인증서', 1], ['TLS 1.2 · 1.3만', 1], ['Mozilla Intermediate cipher', 1], ['HSTS max-age 1년', 1], ['OCSP stapling (주는 CA라면)', 0]];
    L.forEach(([s, must], i) => { const y = 70 + i * 52; card(290, y, 460, 42, { rx: 8, stroke: must ? GOOD : GRID, fill: must ? GOODBG : PANEL, sw: 2, s: pop(u, 0.2 + i * 0.2) });
      check(90, y, 10, pop(u, 0.4 + i * 0.2)); tx(112, y + 6, s, { 'font-size': 15.5, 'font-weight': 700, fill: must ? INK : MUT, opacity: fade(u, 0.3 + i * 0.2) }); });
    const gr = u < 1.8 ? 'B' : 'A+', col = u < 1.8 ? WARN : GOOD; el('circle', { cx: 760, cy: 190, r: 82, fill: u < 1.8 ? WARNBG : GOODBG, stroke: col, 'stroke-width': 5 });
    tx(760, 214, gr, { 'text-anchor': 'middle', 'font-size': 66, 'font-weight': 900, fill: col, opacity: 0.4 + 0.6 * (u < 1.8 ? 1 : pop(u, 1.8)) });
    note(760, 316, 'SSL Labs 등급', 1, { 'text-anchor': 'middle', fill: MUT }); }

  const quiz = [
    { q: "Let's Encrypt 발급 전에 가장 먼저 확인할 것은 무엇인가?",
      o: ['ssl_ciphers 목록이 최신인지', '도메인 A 레코드가 우리 서버 IP를 가리키는지', 'HSTS max-age가 1년인지'], a: 1,
      why: 'HTTP-01 challenge는 도메인 이름으로 우리 80 포트를 찾아온다. dig로 203.0.113.45가 우리 서버인지부터 본다.' },
    { q: 'certbot certonly --webroot를 고르는 이유는 무엇인가?',
      o: ['nginx를 잠시 멈춰야 해서', '발급 속도가 가장 빨라서', '인증서만 받고 직접 관리하는 conf는 건드리지 않으려고'], a: 2,
      why: '--nginx는 conf에 ssl 지시자와 리디렉트를 끼워 넣는다. --webroot는 토큰 파일만 두고 conf는 그대로 둔다.' },
    { q: 'ssl_certificate에 cert.pem 대신 fullchain.pem을 넣는 이유는 무엇인가?',
      o: ['중간 인증서까지 함께 보내야 클라이언트가 루트까지 이어서 검증하기 때문', '비밀키가 들어 있어서', '파일이 더 작아서'], a: 0,
      why: 'fullchain.pem은 내 인증서와 중간 인증서 묶음이다. 중간이 빠지면 일부 모바일 클라이언트가 검증에 실패한다.' },
    { q: 'certbot renew가 하루 두 번 돌 때 실제로 인증서를 바꾸는 때는 언제인가?',
      o: ['돌 때마다 매번', '만료까지 30일 이내로 남았을 때만', '90일이 지나 만료된 뒤에만'], a: 1,
      why: '남은 기간이 30일보다 길면 Cert not yet due로 끝난다. 2/19 발급분은 4/20부터 갱신 대상이다.' },
    { q: 'HSTS(max-age=31536000)를 받은 브라우저는 무엇을 하는가?',
      o: ['1년 동안 그 도메인에 http로 요청을 보내기 전에 https로 바꾼다', '인증서를 1년 동안 저장해 검증을 건너뛴다', '서버 cipher 목록을 1년 동안 고정한다'], a: 0,
      why: '31,536,000초는 365일이다. 그동안 브라우저는 평문 요청 자체를 보내지 않는다.' },
  ];

  const summary = [
    '발급 전에 A 레코드, 80 포트, server_name을 먼저 맞춰야 challenge가 통과한다.',
    'certbot은 80 포트로 토큰을 확인한 뒤 fullchain.pem과 privkey.pem을 만든다.',
    'nginx가 TLS를 끝내고 백엔드에는 평문으로 넘겨 인증서 관리가 한 곳에 모인다.',
    '인증서는 90일짜리라 하루 두 번 renew를 돌리고 성공하면 reload한다.',
  ];
  const review = [
    { q: '갱신 후에도 브라우저가 옛 만료일을 보여 준다. 먼저 의심할 것은?',
      o: ['DNS A 레코드가 바뀌었다', '--deploy-hook의 nginx reload가 빠졌다', 'HSTS max-age가 짧다'], a: 1,
      why: '파일은 새로 받았어도 nginx가 다시 읽지 않으면 옛 인증서를 계속 서빙한다. openssl s_client로 실제 notAfter를 확인한다.' },
    { q: '보안을 이유로 80 포트를 완전히 닫았더니 석 달 뒤 인증서가 만료됐다. 원인은?',
      o: ['HTTP-01 갱신 challenge가 들어올 길이 사라졌다', 'TLS 1.1을 껐다', 'session_tickets를 껐다'], a: 0,
      why: '갱신 때도 CA가 80 포트의 .well-known 경로를 확인한다. 80은 리디렉트용으로 열어 두고 acme-challenge만 파일로 답한다.' },
    { q: '80 블록에 location /와 location /.well-known/acme-challenge/를 함께 두었다. /.well-known/acme-challenge/abc 요청은 어디로 가나?',
      o: ['먼저 적힌 location으로 간다', 'location /로 가서 301이 난다', '더 긴 접두어인 acme-challenge location이 받아 파일로 답한다'], a: 2,
      why: 'prefix location은 적힌 순서와 상관없이 가장 길게 맞는 것을 고른다. 28자 접두어가 1자짜리 /를 이긴다.' },
  ];

  R.page({ title: 'TLS 적용 과정', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
