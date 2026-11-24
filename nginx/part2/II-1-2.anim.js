/* II-1-2 proxy 헤더 (X-Forwarded-For) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * ProxyHeadersMiddleware 결과(127.0.0.1 → 203.0.113.45, http → https, 신뢰 밖 peer 는 보정 안 됨)는
 * uvicorn 0.54 로 미들웨어를 직접 돌려 확인한 값이다. 172.18.0.5 는 도커 peer 의 예시 주소. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, redisBox, person, browser, cross, check, lock, kvTable, terminal, snippet, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const nginx = (cx, cy, sub, o) => redisBox(cx, cy, Object.assign({ name: 'Nginx', sub }, o || {}));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const IP = '203.0.113.45';
  // 헤더 표: data.headers 를 그대로. hot = 이번 beat 에 바뀐 줄
  function hdrTable(x, y, w, b, hot, o) { o = o || {}; const rows = Object.entries(b.headers).map(([k, v]) => {
      const none = /^\(없음\)/.test(v), bad = /위조/.test(v); return [k, v, { hot: hot === k, gone: none, ttl: none ? '빠짐' : bad ? '위조' : null, ttlCol: bad ? BAD : MUT }]; });
    kvTable(x, y, w, rows, { title: o.title || '백엔드가 받는 헤더', kw: o.kw || w * 0.42, rh: o.rh || 32 }); }

  // ---------- 1. 백엔드가 client IP 를 모른다 ----------
  function pipes(u0) {
    grow(120, 120, 366, 120, u0, INK, { plain: true, sw: 3 }); grow(494, 120, 760, 120, clamp(u0 * 1.4 - 0.4), INK, { plain: true, sw: 3 });
    tx(243, 104, 'TCP ①', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 });
    tx(627, 104, 'TCP ②', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 }); }
  function s1(t, c) { const { k, u } = c, b = c.beat;
    person(80, 120, null, {}); mono(80, 176, IP, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700 });
    nginx(430, 120, '127.0.0.1'); server(830, 112, 'FastAPI', {});
    pipes(k === 0 ? E(u, 0.2, 1.0) : 1);
    mono(243, 146, 'peer ' + IP, { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, opacity: k === 0 ? fade(u, 0.9) : 1 });
    mono(627, 146, 'peer 127.0.0.1', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: k === 0 ? fade(u, 1.2) : 1 });
    if (k === 0) { mono(470, 260, 'request.client.host', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.5) });
      grow(484, 254, 540, 254, E(u, 1.7, 2.1), MUT); card(640, 254, 180, 44, { rx: 8, text: b.backendSeesIp, mono: true, fs: 17, stroke: BAD, color: BAD, s: pop(u, 2.0) });
      sub(480, 330, '"누가 접속했나"가 아니라 "누가 이 TCP를 열었나"', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { const n = 3 * E(u, 0.3, 2.2), cols = [ACC, INFO, WARN];
      cols.forEach((col, i) => { el('circle', { cx: 60 + i * 34, cy: 250, r: 11, fill: col, opacity: fade(u, 0.2 + i * 0.6) }); });
      tx(40, 290, '서로 다른 사용자 세 명', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3) });
      terminal(300, 210, 620, 170, ['$ uvicorn app.main:app', '로그인 시도: 127.0.0.1', '로그인 시도: 127.0.0.1', '로그인 시도: 127.0.0.1'], 1 + n, { title: 'backend log' }); return; }
    if (k === 2) { const F = ['접근 로그·감사', 'GeoIP 차단', 'per-IP rate limit', '부정 사용 탐지', 'A/B 분기'];
      F.forEach((f, i) => { const x = 110 + i * 185, s = pop(u, 0.2 + i * 0.25); card(x, 270, 170, 60, { rx: 10, text: f, fs: 14.5, stroke: GRID, s });
        if (u > 1.0 + i * 0.2) cross(x + 70, 244, 9, pop(u, 1.0 + i * 0.2)); });
      note(110 - 85, 350, '모두 "IP 하나"를 입력으로 쓰는데, 그 IP가 전부 127.0.0.1이다', fade(u, 2.0), { fill: BAD }); return; }
    // k3 해결 방향
    const a = E(u, 0.4, 1.6); card(lerp(500, 690, a), 58, 230, 32, { rx: 16, dash: '6 5', stroke: ACC, fill: ACCBG, text: 'X-Real-IP: ' + IP, mono: true, fs: 13.5, color: ACC, op: fade(u, 0.3) });
    pill(430, 230, '① Nginx가 헤더에 싣는다', ACC, pop(u, 1.2), { fs: 14 }); pill(800, 230, '② 백엔드가 헤더를 읽는다', ACC, pop(u, 1.7), { fs: 14 });
    note(250, 330, '고칠 곳은 두 군데다. 다음 장면부터 하나씩', fade(u, 2.2)); }

  // ---------- 2. X-Real-IP / X-Forwarded-For / Host ----------
  const VARS = [
    ['proxy_pass만', '기본 Host = $proxy_host', 'backend', '백엔드는 upstream 이름을 도메인으로 안다'],
    ['$host', '요청 Host 헤더 (포트 제외)', 'api.example.com', '가상호스트 분기가 다시 맞는다'],
    ['$remote_addr', 'Nginx가 본 TCP ① 의 peer', IP, 'Nginx가 첫 프록시면 곧 진짜 클라이언트'],
    ['$proxy_add_x_forwarded_for', '들어온 XFF 뒤에 ", $remote_addr"', '', ''],
    ['$scheme · $server_port', 'Nginx가 받은 방식과 포트', 'https · 443', 'TLS는 Nginx에서 끝나 뒷구간은 http'],
  ];
  const HOT = ['Host', 'Host', 'X-Real-IP', 'X-Forwarded-For', 'X-Forwarded-Proto', null];
  function s2(t, c) { const { k, u } = c, b = c.beat;
    person(60, 90, null, { s: 0.85 }); nginx(330, 90, ':443'); server(830, 82, null, { s: 0.9 });
    grow(96, 90, 266, 90, 1, GRID, { plain: true, sw: 2.5 }); grow(394, 90, 774, 90, 1, GRID, { plain: true, sw: 2.5 });
    if (k === 4) { lock(180, 66, true, GOOD, pop(u, 0.3)); mono(180, 124, 'https', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(584, 124, 'http (평문)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700, opacity: fade(u, 0.5) }); }
    const seen = b.backendSeesIp; pill(570, 34, '백엔드가 보는 IP: ' + seen, /^127/.test(seen) ? BAD : GOOD, k === 2 ? pop(u, 1.4) : 1, { mono: true, fs: 13.5 });
    if (k < 5) dot([[394, 90], [774, 90]], seg(u, 0.3, 1.2), ACC, 7);
    hdrTable(30, 170, 520, b, HOT[k]);
    const X = 580;
    if (k < 5 && k !== 3) { const [v, d, val, why] = VARS[k];
      mono(X, 200, v, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      tx(X, 228, d, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) });
      grow(X + 10, 248, X + 10, 284, E(u, 0.8, 1.2), MUT);
      card(X + 150, 310, 300, 44, { rx: 8, text: val, mono: true, fs: 16, stroke: k === 0 ? WARN : ACC, color: k === 0 ? WARN : INK, s: pop(u, 1.2) });
      note(X, 372, why, fade(u, 1.8), { 'font-size': 14.5, fill: k === 0 ? WARN : INK }); return; }
    if (k === 3) { mono(X, 196, '$proxy_add_x_forwarded_for', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      tx(X, 230, '들어온 XFF 없음', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.3) });
      spans(X, 256, [['"', {}], [IP, { fill: ACC, 'font-weight': 700 }], ['"', {}]], { 'font-size': 14.5, opacity: fade(u, 0.5) });
      tx(X, 300, 'CDN을 거쳐 들어옴', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.0) });
      const a = E(u, 1.3, 2.2), tail = ', 198.51.100.10';
      spans(X, 326, [['"' + IP, {}], [tail.slice(0, Math.round(tail.length * a)), { fill: ACC, 'font-weight': 700 }], [a >= 1 ? '"' : '', {}]], { 'font-size': 14.5, opacity: fade(u, 1.1) });
      note(X, 372, '맨 앞이 원래 클라이언트, 뒤로 갈수록 가까운 프록시', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k5 백엔드에서 읽기
    ['x-real-ip', 'x-forwarded-for', 'x-forwarded-proto'].forEach((h, i) => { const y = 206 + i * 62, a = fade(u, 0.3 + i * 0.4);
      mono(X, y, `headers.get("${h}")`, { 'font-size': 14.5, opacity: a });
      mono(X + 20, y + 26, '→ ' + b.headers[h.replace(/(^|-)(\w)/g, (m, p, q) => p + q.toUpperCase()).replace('Ip', 'IP')], { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6 + i * 0.4) }); });
    note(X, 400, '헤더 이름은 대소문자를 가리지 않는다', fade(u, 2.0), { 'font-size': 14 }); }

  // ---------- 3. 스니펫과 상속 ----------
  const SNIP = ['Host               $host', 'X-Real-IP          $remote_addr', 'X-Forwarded-For    $proxy_add_x_…', 'X-Forwarded-Proto  $scheme', 'X-Forwarded-Host   $host', 'X-Forwarded-Port   $server_port'];
  function snipCard(op, typed) { card(210, 130, 360, 220, { rx: 10, stroke: ACC, sw: 2, op });
    mono(44, 42, 'snippets/proxy-headers.conf', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: op });
    SNIP.forEach((s, i) => { if (typed != null && i >= typed) return; mono(44, 76 + i * 28, s, { 'font-size': 13.5, opacity: op * (typed != null ? clamp(typed - i) : 1) }); }); }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    if (k <= 2) { snipCard(1, k === 0 ? 6 * E(u, 0.2, 2.2) : null);
      zone(420, 20, 520, 380, null, { fill: SOFT, stroke: GRID, sw: 1.5 }); mono(436, 46, 'server {', { 'font-size': 14.5, 'font-weight': 700 });
      const loc = (y, name, inc, sh, hot) => { zone(440, y, 480, 140, null, { fill: PANEL, stroke: hot ? ACC : GRID, sw: 1.8, op: sh });
        mono(456, y + 26, `location ${name} {`, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: sh });
        inc.forEach((s, i) => mono(472, y + 54 + i * 24, s, { 'font-size': 13.5, opacity: sh }));
        return y; };
      if (k >= 1) { const y = loc(64, '/api/', ['include snippets/proxy-headers.conf;'], k === 1 ? fade(u, 0.1) : 1, k === 1);
        for (let i = 0; i < 6; i++) { const sc = k === 1 ? pop(u, 0.5 + i * 0.25) : 1;
          if (sc > 0) card(480 + (i % 3) * 140 + 56, y + 92 + Math.floor(i / 3) * 26, 132, 22, { rx: 11, text: SNIP[i].split(' ')[0], fs: 13.5, fw: 700, fill: ACCBG, stroke: 'none', color: ACC, s: sc }); } }
      if (k >= 2) { const y = loc(224, '/ws/', ['include snippets/proxy-headers.conf;', 'include snippets/proxy-ws.conf;'], fade(u, 0.1), true);
        pill(810, y + 112, '+ Upgrade · Connection', INFO, pop(u, 1.0), { fs: 13.5 });
        note(40, 290, '헤더 정의는 여전히 파일 하나', fade(u, 1.6), { 'font-size': 14.5 }); }
      if (k === 0) note(40, 290, 'location 마다 복붙하던 여섯 줄', fade(u, 2.3), { 'font-size': 14.5 });
      return; }
    if (k === 3) { zone(30, 20, 460, 380, null, { fill: SOFT, stroke: GRID, sw: 1.5 });
      mono(46, 46, 'server {', { 'font-size': 14.5, 'font-weight': 700 });
      ['Host', 'X-Real-IP', 'X-Forwarded-For', 'X-Forwarded-Proto'].forEach((h, i) => { const y = 78 + i * 26, gone = E(u, 1.2 + i * 0.12, 1.5 + i * 0.12);
        mono(66, y, 'proxy_set_header ' + h, { 'font-size': 13.5, fill: gone > 0.5 ? OFF : INK });
        if (gone > 0) el('line', { x1: 64, y1: y - 5, x2: 64 + 340 * gone, y2: y - 5, stroke: BAD, 'stroke-width': 2.2 }); });
      zone(50, 196, 420, 120, null, { fill: PANEL, stroke: BAD, sw: 2, op: pop(u, 0.3) });
      mono(66, 222, 'location /x/ {', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
      mono(86, 250, 'proxy_set_header X-Custom 1;', { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(86, 290, '한 줄이라도 있으면 바깥 정의는 상속 안 됨', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) });
      hdrTable(520, 40, 410, b, null, { title: '/x/에서 백엔드가 받는 헤더' });
      note(520, 260, '해법: 상속에 기대지 말고', fade(u, 2.0), { 'font-size': 14.5, fill: GOOD }); note(520, 286, 'location 마다 include 한다', fade(u, 2.1), { 'font-size': 14.5, fill: GOOD }); return; }
    // k4 Accept-Encoding ""
    browser(90, 170, 120, 90, '브라우저'); nginx(430, 170, 'gzip on'); server(800, 162, '백엔드', {});
    grow(152, 170, 366, 170, 1, GRID, { plain: true, sw: 2.5 }); grow(494, 170, 740, 170, 1, GRID, { plain: true, sw: 2.5 });
    pill(260, 126, 'Accept-Encoding: gzip', INK, 1, { mono: true, fs: 13.5 });
    const a = E(u, 0.4, 1.0); card(620, 126, 220, 30, { rx: 15, text: 'Accept-Encoding', mono: true, fs: 13.5, stroke: GRID, op: 1 - a * 0.6 });
    if (a > 0) el('line', { x1: 514, y1: 126, x2: 514 + 212 * a, y2: 126, stroke: BAD, 'stroke-width': 2.5 });
    mono(620, 260, 'proxy_set_header Accept-Encoding "";', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
    fly(740, 210, 494, 210, seg(u, 1.2, 1.9), '원본 응답', { fill: INK, stay: true });
    fly(366, 210, 152, 210, seg(u, 1.9, 2.5), 'gzip 압축', { fill: ACC, stay: true });
    note(90, 350, '빈 값을 넣은 헤더는 백엔드로 가지 않는다. 압축은 Nginx가 맡는다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 4. trust proxy 체인 ----------
  const CF = ['173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
    '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22'];
  function s4(t, c) { const { k, u } = c, b = c.beat, lb = k === 4, spoof = k === 5;
    person(54, 90, null, { s: 0.85, stroke: spoof ? BAD : INK }); mono(54, 146, spoof ? '공격자' : IP, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: spoof ? BAD : INK });
    card(250, 90, 170, 56, { rx: 28, stroke: INFO, fill: INFOBG, text: lb ? '사내 LB' : spoof ? '(직접 접속)' : 'Cloudflare', fs: 15, color: INFO, op: spoof ? 0.35 : 1 });
    mono(250, 136, lb ? '10.0.1.20' : spoof ? '' : '104.16.x.x', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO });
    nginx(510, 90, 'realip'); server(830, 82, null, { s: 0.85 });
    grow(86, 90, 164, 90, 1, GRID, { plain: true, sw: 2.5 }); grow(336, 90, 446, 90, 1, GRID, { plain: true, sw: 2.5 }); grow(574, 90, 774, 90, 1, GRID, { plain: true, sw: 2.5 });
    // 신뢰 목록
    tx(30, 196, 'set_real_ip_from (믿는 대역)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (k <= 3) { const n = k === 0 ? 3 : 15, shown = k === 1 ? 3 + 12 * E(u, 0.2, 1.8) : n;
      for (let i = 0; i < shown; i++) { const x = 30 + (i % 3) * 146, y = 212 + Math.floor(i / 3) * 34, hit = CF[i] === '104.16.0.0/13';
        card(x + 68, y + 13, 140, 28, { rx: 6, text: CF[i], mono: true, fs: 13.5, fw: hit ? 800 : 500, stroke: hit && k >= 1 ? ACC : GRID, color: hit && k >= 1 ? ACC : INK, s: k === 1 && i >= 3 ? clamp(shown - i) : 1 }); }
      if (k === 1) mono(30, 400, Math.round(shown) + ' / 15 대역', { 'font-size': 15, 'font-weight': 800, fill: ACC }); }
    else { const r = lb ? '10.0.0.0/8' : '0.0.0.0/0'; card(110, 228, 160, 34, { rx: 6, text: r, mono: true, fs: 15, fw: 800, stroke: lb ? GOOD : BAD, color: lb ? GOOD : BAD, s: pop(u, 0.2) });
      if (spoof) tx(30, 280, '아무 주소나 믿는다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.5) }); }
    // $remote_addr 상자
    const X = 520; tx(X, 196, '$remote_addr', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC });
    const swapped = k >= 2, cur = k <= 1 ? '104.16.x.x' : lb ? IP : spoof ? '198.51.100.99' : IP;
    if (k === 2) { const a = E(u, 0.6, 1.6); card(X + 200, 236, 340, 40, { rx: 8, stroke: GRID, text: '104.16.x.x', mono: true, fs: 16, op: 1 - a });
      card(X + 200, 236, 340, 40, { rx: 8, stroke: GOOD, text: IP, mono: true, fs: 16, color: GOOD, op: a });
      fly(250, 156, X + 200, 236, seg(u, 0.2, 0.9), 'CF-Connecting-IP: ' + IP, { mono: true, fill: INFO });
      tx(X, 300, 'real_ip_header CF-Connecting-IP', { 'font-size': 14, class: 'mono', 'font-weight': 700, opacity: fade(u, 1.5) }); }
    else card(X + 200, 236, 340, 40, { rx: 8, stroke: swapped ? (spoof ? BAD : GOOD) : WARN, text: cur, mono: true, fs: 16, color: swapped ? (spoof ? BAD : GOOD) : WARN });
    if (k <= 1) tx(X, 300, k === 0 ? 'peer가 믿는 대역에 들면 헤더를 볼 자격이 생긴다' : '대역이 바뀌면 이 목록도 갱신한다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
    if (k === 3 || spoof) { ['access_log', 'X-Real-IP', 'limit_req 키'].forEach((n, i) => { const x = X + 70 + i * 140, a = pop(u, 0.4 + i * 0.3);
        grow(X + 200, 258, x, 318, E(u, 0.2 + i * 0.3, 0.6 + i * 0.3), spoof ? BAD : ACC);
        card(x, 340, 130, 36, { rx: 8, text: n, fs: 14, stroke: spoof ? BAD : GOOD, color: spoof ? BAD : INK, s: a }); });
      note(X, 404, spoof ? '위조 주소로 rate limit·차단을 빠져나간다' : '$remote_addr 하나가 바뀌니 셋이 같이 바뀐다', fade(u, 1.8), { 'font-size': 14.5, fill: spoof ? BAD : INK }); }
    if (lb) { tx(X, 300, 'XFF: 203.0.113.45, 10.0.1.20', { 'font-size': 14, class: 'mono', opacity: fade(u, 0.5) });
      tx(X, 330, '뒤에서부터: 10.0.1.20은 믿는 대역 → 건너뛰고', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      tx(X, 356, '믿지 않는 첫 주소 203.0.113.45를 쓴다', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.5) }); }
    if (spoof) fly(86, 60, 446, 60, seg(u, 0.2, 1.0), 'XFF: 198.51.100.99', { mono: true, fill: BAD }); }

  // ---------- 5. FastAPI ProxyHeadersMiddleware ----------
  function gate(o) { o = o || {}; const x = 470; el('rect', { x: x - 16, y: 40, width: 32, height: 330, rx: 8, fill: o.on ? ACCBG : SOFT, stroke: o.on ? ACC : GRID, 'stroke-width': 2 });
    tx(x, 30, o.title || 'ProxyHeadersMiddleware', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); }
  function scopeCard(x, y, rows, op, title) { card(x + 160, y + 20 + rows.length * 15, 320, 50 + rows.length * 30, { rx: 10, stroke: GRID, op });
    tx(x + 14, y + 20, title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op });
    rows.forEach(([k, v, col], i) => { mono(x + 14, y + 52 + i * 30, k, { 'font-size': 14, opacity: op }); mono(x + 306, y + 52 + i * 30, v, { 'font-size': 14, 'font-weight': 700, fill: col || INK, 'text-anchor': 'end', opacity: op }); }); }
  function s5(t, c) { const { k, u } = c, b = c.beat;
    const inRows = [['client (peer)', '127.0.0.1'], ['scheme', 'http'], ['x-forwarded-for', IP], ['x-forwarded-proto', 'https']];
    scopeCard(30, 50, inRows, 1, '들어온 요청 (보정 전)');
    gate({ on: k >= 0, title: k === 0 ? 'uvicorn --proxy-headers' : 'ProxyHeadersMiddleware' });
    const fix = k >= 2 ? 1 : 0, a = k === 2 ? E(u, 0.5, 1.6) : fix;
    const outRows = [['request.client.host', a > 0.5 ? IP : '127.0.0.1', a > 0.5 ? GOOD : BAD], ['request.url.scheme', a > 0.5 ? 'https' : 'http', a > 0.5 ? GOOD : BAD]];
    if (k >= 3) outRows.push(['headers["x-real-ip"]', IP, INK]);
    if (k >= 1) scopeCard(520, 50, outRows, k === 1 ? fade(u, 0.3) : 1, '핸들러가 보는 값');
    if (k === 2) for (let i = 0; i < 3; i++) dot([[190, 120 + i * 30], [454, 120 + i * 30], [486, 120], [640, 102 + 15]], seg(u, 0.2 + i * 0.2, 1.2 + i * 0.2), ACC, 6);
    if (k === 0) { tx(30, 260, 'forwarded-allow-ips (기본 127.0.0.1)에 든 peer만 믿는다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4) });
      [['peer 127.0.0.1', '믿음: XFF로 보정', GOOD], ['peer 172.18.0.5 (도커 예시)', '안 믿음: 보정 없음', BAD]].forEach(([p, r, col], i) => { const y = 300 + i * 40, op = fade(u, 0.9 + i * 0.5);
        mono(30, y, p, { 'font-size': 14, opacity: op }); tx(300, y, r, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: op }); });
      sub(720, 220, '실행 옵션만으로 켜진다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1) { mono(520, 260, 'trusted_hosts="*"', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.6) });
      tx(520, 290, '개발용. 운영은 Nginx가 있는 대역으로 좁힌다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) }); return; }
    if (k === 2) { note(520, 260, '핸들러 코드는 그대로, 값만 바뀌어 도착한다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 3) { note(520, 290, '원본 헤더도 같이 돌려주면 설정 실수가 바로 보인다', fade(u, 0.8), { 'font-size': 14 }); return; }
    const resp = ['$ curl https://api.example.com/whoami', '{', `  "client_ip": "${IP}",`, '  "scheme": "https",', '  "host": "api.example.com",', '  "headers": { x_real_ip · x_forwarded_* }', '}'];
    if (k === 4) { terminal(30, 220, 900, 190, resp, 1 + 6 * E(u, 0.2, 2.2), { title: 'whoami', lh: 21 }); return; }
    // k5 세 값 확인
    [['x_real_ip', IP], ['x_forwarded_for', IP], ['x_forwarded_proto', 'https']].forEach(([n, v], i) => { const y = 270 + i * 44, s = pop(u, 0.3 + i * 0.4);
      card(250, y, 440, 36, { rx: 8, stroke: GOOD, s }); mono(44, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); mono(456, y + 5, v, { 'font-size': 14.5, fill: GOOD, 'text-anchor': 'end', opacity: s });
      check(490, y, 9, pop(u, 0.6 + i * 0.4)); });
    note(540, 360, '셋이 다 차 있으면', fade(u, 1.8), { 'font-size': 14.5 }); note(540, 386, 'Nginx 쪽 설정도 맞다', fade(u, 1.9), { 'font-size': 14.5 }); }

  const quiz = [
    { q: 'Nginx 뒤의 FastAPI에서 request.client.host가 127.0.0.1만 나오는 까닭은 무엇인가?',
      o: ['FastAPI가 IP를 숨겨서', '백엔드에 TCP를 연 쪽이 Nginx라서', '브라우저가 IP를 안 보내서'], a: 1,
      why: 'Nginx가 받은 요청을 새 TCP로 백엔드에 보내므로 백엔드가 보는 peer는 늘 Nginx(127.0.0.1)다.' },
    { q: '프록시를 한 번만 거칠 때 X-Real-IP에 넣는 $remote_addr의 값은 무엇인가?',
      o: ['Nginx 자신의 주소', 'Nginx가 직접 본 클라이언트 주소 203.0.113.45', 'Host 헤더의 도메인'], a: 1,
      why: '$remote_addr는 Nginx와 TCP를 맺은 상대 주소다. Nginx가 첫 프록시면 그게 진짜 클라이언트다.' },
    { q: 'server 블록에 헤더 4줄을 두고, 안쪽 location에서 proxy_set_header를 한 줄 썼다. 그 location에서 바깥 4줄은 어떻게 되는가?',
      o: ['전부 상속되지 않는다', '그대로 합쳐진다', '같은 이름만 덮어쓴다'], a: 0,
      why: 'proxy_set_header는 현재 블록에 하나도 없을 때만 바깥 것을 물려받는다. 그래서 location마다 include한다.' },
    { q: 'set_real_ip_from 0.0.0.0/0으로 열어 두면 무엇이 문제인가?',
      o: ['Cloudflare 요청이 막힌다', '누구나 XFF를 위조해 $remote_addr를 바꿀 수 있다', 'access_log가 꺼진다'], a: 1,
      why: '모든 peer를 믿으면 공격자가 보낸 198.51.100.99 같은 위조 주소가 그대로 실제 IP로 쓰인다.' },
    { q: 'uvicorn을 도커 안에서 돌릴 때 forwarded-allow-ips를 기본값(127.0.0.1)으로 두면 어떻게 되는가?',
      o: ['Nginx 컨테이너 주소를 믿지 않아 client.host가 보정되지 않는다', '모든 헤더를 믿는다', 'https 요청을 거부한다'], a: 0,
      why: '미들웨어는 믿는 peer에서 온 X-Forwarded-*만 쓴다. 도커의 Nginx 주소가 목록에 없으면 값이 그대로 남는다.' },
  ];

  const summary = [
    '프록시 뒤 백엔드는 TCP 상대만 보므로 client IP가 늘 Nginx 주소로 나온다.',
    'Nginx가 Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto를 실어 보내야 원래 정보가 남는다.',
    'proxy_set_header는 안쪽에 한 줄만 있어도 바깥 정의를 잃으니 include로 묶어 쓴다.',
    'CDN 뒤에서는 믿을 대역만 set_real_ip_from에 적고, 백엔드도 믿을 프록시를 좁힌다.',
  ];
  const review = [
    { q: 'Cloudflare 뒤 Nginx의 rate limit이 모든 사용자를 한 사람처럼 막는다. 먼저 확인할 것은?',
      o: ['real_ip_header와 set_real_ip_from 설정', 'proxy_read_timeout 값', 'gzip 압축 수준'], a: 0,
      why: 'realip 설정이 없으면 $remote_addr가 Cloudflare 주소로 남아 limit_req 키가 몇 개 안 된다. 치환하면 실제 IP별로 나뉜다.' },
    { q: 'location /upload/ 에만 proxy_set_header X-Upload 1; 을 넣었더니 그 경로에서만 로그 IP가 127.0.0.1로 돌아갔다. 왜인가?',
      o: ['uvicorn이 업로드 요청을 따로 처리해서', '그 location에서 server 레벨 헤더 상속이 끊겨서', 'X-Upload 헤더 이름이 잘못돼서'], a: 1,
      why: '한 줄이라도 정의하면 바깥 proxy_set_header가 모두 사라져 X-Real-IP도 빠진다. 스니펫을 include해 다시 넣는다.' },
    { q: 'TLS를 Nginx에서 끝냈더니 백엔드가 만든 리디렉트 주소가 http://로 나온다. 빠진 것은?',
      o: ['X-Real-IP 헤더', 'X-Forwarded-Proto 헤더와 백엔드의 보정', 'set_real_ip_from 대역'], a: 1,
      why: '뒷구간은 http라 백엔드는 https인 줄 모른다. Proto 헤더를 넘기고 ProxyHeadersMiddleware가 scheme을 고쳐야 한다.' },
  ];

  R.page({ title: '원본 클라이언트 정보 전달', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
