/* V-2-1 로그 · 메트릭 · 알람 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 로그 값은 코드의 출력 예시, stub_status 숫자는 코드의 curl 결과(nginx 문서의 예와 같다)를 쓴다.
 * 알람 장면의 트래픽·지연 분포는 설명용 예시 값이며 그림에 "예시"로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, person, server, dbIcon, terminal, meters, fly } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ln = (x1, y1, x2, y2, col, sw, dash, op) => el('line', { x1, y1, x2, y2, stroke: col || GRID, 'stroke-width': sw || 2, 'stroke-dasharray': dash, opacity: op ?? 1 });
  const fmt = (v) => Math.round(v).toLocaleString('en-US');

  // ---------- 1. log_format json ----------
  const F = [['time', '$time_iso8601', '"2026-05-19T13:00:01+00:00"'], ['remote_addr', '$remote_addr', '"1.2.3.4"'], ['request', '$request', '"GET /api/users HTTP/1.1"'], ['status', '$status', '200'], ['body_bytes', '$body_bytes_sent', '1234'],
    ['request_time', '$request_time', '0.025'], ['upstream_response_time', '$upstream_response_time', '"0.020"'], ['cache_status', '$upstream_cache_status', '"MISS"'], ['request_id', '$request_id', '"abc…"'], ['host', '$host', '"api.example.com"']];
  // JSON 한 줄을 세로로 펼친 카드: 0..n 필드, hot 은 새로 붙는 필드
  function jsonCard(x, y, n, hot, u, close) { const rows = F.slice(0, n), h = 46 + rows.length * 27 + (close ? 22 : 0);
    el('rect', { x, y, width: 500, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); mono(x + 14, y + 26, '{', { 'font-size': 15, 'font-weight': 700 });
    rows.forEach(([k, v, val], i) => { const isH = hot.includes(i), a = isH ? 0.3 + hot.indexOf(i) * 0.3 : 0, op = isH ? fade(u, a) : 1;
      if (isH) el('rect', { x: x + 8, y: y + 32 + i * 27, width: 484, height: 25, rx: 4, fill: ACCBG, opacity: op });
      mono(x + 30, y + 50 + i * 27, `"${k}":`, { 'font-size': 14, fill: INFO, opacity: op }); mono(x + 260, y + 50 + i * 27, val, { 'font-size': 14, 'font-weight': 700, opacity: isH ? fade(u, a + 0.3) : 1 }); });
    if (close) mono(x + 14, y + h - 12, '}', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { const n = [5, 7, 10][k], hot = [[0, 1, 2, 3, 4], [5, 6], [8, 9]][k];
      tx(60, 46, ["log_format json escape=json '{' … — 변수 하나가 필드 하나", '어디서 느려졌는지 나누는 시간 필드', '요청 ID 와 호스트로 포맷을 닫는다'][k], { 'font-size': 16, 'font-weight': 700 });
      jsonCard(40, 66, n, hot, u, k === 2);
      if (k === 0) hot.forEach((i, j) => { mono(580, 120 + j * 44, F[i][1], { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.2 + j * 0.3) }); grow(575, 115 + j * 44, 545, 95 + i * 27 + 22, E(u, 0.3 + j * 0.3, 0.6 + j * 0.3), MUT); });
      if (k === 1) { const X = (s) => 600 + s * 12000, y = 150, g = E(u, 0.9, 1.9);
        tx(600, 120, '한 요청에 걸린 시간 (출력 예시)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) });
        el('rect', { x: X(0), y, width: (X(0.025) - X(0)) * g, height: 26, rx: 4, fill: OFF }); mono(X(0.025) + 8, y + 18, '0.025s', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.8) });
        el('rect', { x: X(0.0025), y: y + 40, width: (X(0.0225) - X(0.0025)) * g, height: 26, rx: 4, fill: INFO }); mono(X(0.0225) + 8, y + 58, '0.020s', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) });
        sub(700, y + 100, 'request_time · 전체', fade(u, 1.9)); sub(700, y + 124, 'upstream_response_time · 백엔드', fade(u, 2.0), { fill: INFO });
        note(600, 330, '차이 0.005s = nginx 와 네트워크 몫', fade(u, 2.3), { fill: ACC }); }
      if (k === 2) { note(580, 200, '$request_id 는 요청마다', fade(u, 1.2)); note(580, 226, 'nginx 가 새로 만든다', fade(u, 1.3)); note(580, 262, '백엔드에 넘기면 분산 추적의 열쇠', fade(u, 2.0), { fill: ACC }); }
      return; }
    if (k === 3) { mono(60, 52, 'access_log /var/log/nginx/access.json json;', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      server(120, 220, 'nginx', {}); zone(320, 90, 600, 290, 'access.json', { stroke: GRID, fill: PANEL });
      const L = ['{"time":"…:01","status":200,"request":"GET /api/users …"}', '{"time":"…:01","status":200,"request":"GET /api/posts …"}', '{"time":"…:02","status":404,"request":"GET /favicon.ico …"}', '{"time":"…:02","status":200,"request":"POST /api/login …"}', '{"time":"…:03","status":502,"request":"GET /api/report …"}'];
      L.forEach((s, i) => { const a = 0.3 + i * 0.4, f = seg(u, a, a + 0.4); if (f <= 0) return; mono(lerp(190, 336, f), lerp(220, 132 + i * 46, f), s, { 'font-size': 13.5, fill: s.includes('50') ? BAD : INK, opacity: f }); });
      note(320, 405, '한 줄이 한 요청, 그대로 ELK · Loki 가 읽는다', fade(u, 2.3), { fill: MUT }); return; }
    if (k === 4) { tx(60, 50, '요청 쪽 변수', { 'font-size': 17, 'font-weight': 700 });
      [['$remote_addr', '클라이언트 IP (real_ip 적용 뒤)'], ['$request', '메서드 + URI + 프로토콜'], ['$status', '응답 코드'], ['$request_time', '첫 바이트를 읽은 뒤 끝까지 전체'], ['$upstream_response_time', '그중 백엔드가 쓴 시간']].forEach(([v, d], i) => {
        const y = 100 + i * 58, s = pop(u, 0.2 + i * 0.3); card(230, y, 340, 44, { rx: 8, text: v, fs: 15, mono: true, stroke: ACC, color: ACC, s }); tx(430, y + 6, d, { 'font-size': 15, opacity: fade(u, 0.4 + i * 0.3) }); });
      note(60, 405, 'CDN 뒤라면 set_real_ip_from 을 켜야 진짜 IP 가 찍힌다', fade(u, 2.2), { fill: WARN }); return; }
    if (k === 5) { server(120, 200, 'nginx', {});
      ['10.0.0.11:8000', '10.0.0.12:8000', '10.0.0.13:8000'].forEach((a, i) => { const y = 100 + i * 100, hot = i === 1; card(480, y, 190, 44, { text: a, fs: 14, mono: true, stroke: hot ? ACC : GRID, color: hot ? ACC : MUT, s: pop(u, 0.2 + i * 0.15) }); });
      dot([[180, 200], [380, 200]], seg(u, 0.6, 1.2), ACC, 7);
      mono(650, 110, '"upstream_addr": "10.0.0.12:8000"', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.1) });
      [['HIT', GOOD], ['MISS', WARN], ['EXPIRED', MUT]].forEach(([s, col], i) => pill(660 + i * 90, 200, s, col, pop(u, 1.4 + i * 0.15), { mono: true, fs: 13.5 }));
      sub(750, 236, '$upstream_cache_status', fade(u, 1.4));
      mono(600, 310, 'X-Forwarded-For: 1.2.3.4, 10.0.0.5', { 'font-size': 14, opacity: fade(u, 2.0) }); sub(740, 336, '프록시를 거쳐 온 길', fade(u, 2.1));
      sub(300, 400, 'IP 주소는 설명용 예시', fade(u, 2.3)); return; }
    // k6: escape=json
    const UA = 'Mozilla "test"';
    tx(60, 60, 'User-Agent 에 따옴표가 들어오면', { 'font-size': 17, 'font-weight': 700 }); mono(380, 60, UA, { 'font-size': 16, fill: WARN, 'font-weight': 700 });
    const a = fade(u, 0.4), b = fade(u, 1.3);
    card(480, 160, 820, 70, { stroke: BAD, op: a }); mono(90, 166, '"user_agent":"Mozilla "test""', { 'font-size': 16, fill: BAD, opacity: a }); cross(840, 160, 16, pop(u, 0.9)); sub(480, 214, 'escape 없음 · 파서가 멈춘다', a, { fill: BAD, 'font-weight': 700 });
    card(480, 300, 820, 70, { stroke: GOOD, op: b }); mono(90, 306, '"user_agent":"Mozilla \\"test\\""', { 'font-size': 16, fill: GOOD, opacity: b }); check(840, 300, 16, pop(u, 1.8)); sub(480, 354, 'escape=json · 따옴표 · 역슬래시 · 줄바꿈을 자동 처리', b, { fill: GOOD, 'font-weight': 700 }); }

  // ---------- 2. access_log · error_log ----------
  function disk(cx, cy, name, o) { return dbIcon(cx, cy, name, o); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { mono(60, 52, 'access_log /var/log/nginx/access.json json buffer=32k flush=1s;', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      server(120, 220, 'nginx', {}); for (let i = 0; i < 8; i++) dot([[180, 220], [420, 220]], ((t * 0.9 + i / 8) % 1) * (u > 0.3 ? 1 : 0), INFO, 5);
      zone(430, 150, 200, 140, '버퍼 32k', { stroke: ACC, fill: ACCBG }); const f = (t * 0.5) % 1; el('rect', { x: 450, y: 270 - 100 * f, width: 160, height: 100 * f, rx: 4, fill: ACC, opacity: 0.5 });
      grow(640, 220, 760, 220, fade(u, 1.0), MUT); disk(820, 220, 'access.json', {});
      note(430, 350, '모아서 한 번에 쓴다', fade(u, 1.6), { fill: ACC }); return; }
    if (k === 1) { tx(60, 50, '디스크 쓰기 횟수 · 3초 동안', { 'font-size': 17, 'font-weight': 700 });
      const X = (s) => 220 + s * 220;
      [['버퍼 없음', 120], ['buffer + flush=1s', 250]].forEach(([n, y], r) => { tx(40, y + 5, n, { 'font-size': 15, 'font-weight': 700, fill: r ? GOOD : BAD }); ln(220, y, 880, y, GRID, 1.5); });
      const g = E(u, 0.2, 2.4) * 3;
      for (let i = 0; i < 30; i++) { const s = i / 10; if (s > g) break; ln(X(s), 100, X(s), 140, BAD, 2); }
      for (let i = 0; i < 30; i++) { const s = i / 10; if (s > g) break; el('circle', { cx: X(s), cy: 250, r: 3, fill: INFO }); }
      [1, 2, 3].forEach((s) => { if (s <= g + 0.01) { ln(X(s), 225, X(s), 275, GOOD, 4); mono(X(s), 300, 'write', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle' }); } });
      [0, 1, 2, 3].forEach((s) => mono(X(s), 345, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      note(220, 395, '요청마다 write 하던 것을 32k 가 차거나 1초가 지날 때 한 번', fade(u, 2.3)); return; }
    if (k === 2) { mono(60, 52, 'error_log /var/log/nginx/error.log warn;', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      const L = ['emerg', 'alert', 'crit', 'error', 'warn', 'notice', 'info', 'debug'];
      L.forEach((s, i) => { const y = 90 + i * 38, keep = i <= 4, s2 = pop(u, 0.2 + i * 0.12);
        card(260, y, 200, 32, { rx: 6, text: s, fs: 15, mono: true, stroke: keep ? (i === 4 ? ACC : INK) : GRID, color: keep ? INK : MUT, s: s2, op: keep ? 1 : 1 - 0.6 * fade(u, 1.5) });
        if (!keep) ln(170, y, 350, y, MUT, 2, null, fade(u, 1.5)); });
      ln(120, 90 + 4.5 * 38, 420, 90 + 4.5 * 38, BAD, 2.5, '6 5', fade(u, 1.2)); tx(440, 90 + 4.5 * 38 + 5, '여기까지만 남긴다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      note(520, 150, 'access 와 다른 파일에 둔다', fade(u, 1.8)); note(520, 330, 'info 이하는 운영에서 소음', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 3) { card(250, 80, 360, 50, { text: 'http · access_log access.json', fs: 14.5, mono: true, s: pop(u, 0.2) });
      card(250, 220, 360, 50, { text: 'server api · access_log api.json', fs: 14.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.6) });
      ln(250, 105, 250, 195, MUT, 2, null, fade(u, 0.5));
      disk(720, 100, 'access.json', { op: 1 - 0.6 * fade(u, 1.4) }); disk(720, 260, 'api.json', { stroke: ACC });
      dot([[430, 220], [670, 260]], seg(u, 1.0, 1.8), ACC, 7); ln(430, 210, 670, 110, BAD, 2, '6 5', fade(u, 1.4)); cross(550, 160, 12, pop(u, 1.6));
      note(60, 380, 'server 안에 적으면 http 의 설정은 이 server 에서 쓰지 않는다', fade(u, 2.1)); return; }
    if (k === 4) { const L = [['GET /api/users 200', 0], ['GET /health 200', 1], ['GET /assets/app.js 200', 1], ['GET /health 200', 1], ['POST /api/login 401', 0], ['GET /assets/logo.png 200', 1], ['GET /health 200', 1]];
      L.forEach(([s, noise], i) => { const y = 80 + i * 40, gone = noise && u > 1.2; mono(80, y, s, { 'font-size': 14.5, fill: gone ? MUT : INK, opacity: gone ? 1 - 0.7 * fade(u, 1.2) : fade(u, 0.1 + i * 0.1) }); if (noise) ln(76, y - 5, 76 + 280 * E(u, 1.0 + i * 0.05, 1.5 + i * 0.05), y - 5, BAD, 2.5); });
      mono(560, 120, 'location /health  { access_log off; }', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.8) }); mono(560, 150, 'location /assets/ { access_log off; }', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.9) });
      tx(560, 230, '로그 양', { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: 560, y: 245, width: 300, height: 24, rx: 4, fill: SOFT }); el('rect', { x: 560, y: 245, width: 300 * (1 - 0.7 * E(u, 1.3, 2.2)), height: 24, rx: 4, fill: INFO });
      note(560, 320, '정적 자산 로그를 끄면', fade(u, 2.2), { fill: WARN }); note(560, 346, '캐시 hit 분석도 같이 사라진다', fade(u, 2.3), { fill: WARN }); return; }
    if (k === 5) { mono(60, 52, 'daily · rotate 14 · compress · delaycompress', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      const day = Math.floor(E(u, 0.2, 2.4) * 5);
      const files = ['access.json', 'access.json.1', 'access.json.2.gz', 'access.json.3.gz', '…', 'access.json.14.gz'];
      files.forEach((f, i) => { const y = 100 + i * 46, sh = Math.min(i, day + 1) ; card(260, y, 300, 38, { rx: 6, text: f, fs: 14.5, mono: true, stroke: i === 0 ? ACC : i === 1 ? INFO : GRID, color: i >= 2 ? MUT : INK, op: i <= day + 1 || i >= 4 ? 1 : 0.25 }); });
      mono(620, 110, '하루마다 이름이 한 칸씩 밀린다', { 'font-size': 14.5, opacity: fade(u, 0.5) }); mono(620, 210, '.1 은 다음 날 압축 (delaycompress)', { 'font-size': 14.5, opacity: fade(u, 1.0) });
      mono(620, 340, '15번째는 지운다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(620, 160, `day ${day + 1}`, { 'font-size': 18, 'font-weight': 800, fill: ACC }); return; }
    if (k === 6) { server(120, 200, 'nginx', {});
      const ren = u > 0.6, re = u > 1.6;
      card(560, 120, 300, 50, { text: ren ? 'access.json.1 (옛 파일)' : 'access.json', fs: 14.5, mono: true, stroke: re ? GRID : BAD, color: re ? MUT : INK });
      if (ren) card(560, 280, 300, 50, { text: 'access.json (새 파일)', fs: 14.5, mono: true, stroke: re ? GOOD : GRID, color: re ? GOOD : MUT, s: pop(u, 0.6) });
      ln(180, 190, 408, re ? 270 : 130, re ? GOOD : BAD, 3); dot([[180, 190], [408, re ? 270 : 130]], (t * 1.2) % 1, re ? GOOD : BAD, 6);
      pill(300, 330, 'kill -USR1 $(cat nginx.pid)', ACC, pop(u, 1.3), { mono: true, fs: 13.5 });
      note(600, 380, re ? '로그 파일을 다시 열어 새 파일에 쓴다' : '이름만 바뀐 옛 파일에 계속 쓴다', 1, { 'text-anchor': 'middle', fill: re ? GOOD : BAD }); return; }
    server(120, 200, 'nginx', {}); card(480, 200, 200, 70, { text: 'fluent-bit\n:5140', fs: 15, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.3) });
    for (let i = 0; i < 5; i++) dot([[180, 200], [380, 200]], ((t * 0.8 + i / 5) % 1) * (u > 0.5 ? 1 : 0), INFO, 5);
    grow(580, 200, 720, 200, E(u, 1.0, 1.4), INFO); dbIcon(800, 200, '중앙 저장소', { s: pop(u, 1.3) });
    disk(120, 340, '', { s: 0.6, op: 0.5 }); cross(120, 340, 22, pop(u, 1.8)); note(170, 346, '로컬 디스크와 로테이션 부담이 사라진다', fade(u, 1.9), { fill: MUT }); }

  // ---------- 3. stub_status ----------
  const OUT = ['$ curl localhost/nginx_status', 'Active connections: 291', 'server accepts handled requests', ' 16630948 16630948 31070465', 'Reading: 6 Writing: 179 Waiting: 106'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { zone(60, 50, 480, 300, 'server  listen 80;  server_name localhost;', { stroke: GRID, fill: PANEL });
      card(300, 170, 380, 50, { text: 'location = /nginx_status', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.4) });
      mono(110, 250, 'stub_status;', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      [['/nginx_status', true], ['/nginx_status/x', false]].forEach(([p, ok], i) => { const y = 140 + i * 110; mono(620, y, p, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.4) }); if (ok) check(880, y - 5, 12, pop(u, 1.5)); else cross(880, y - 5, 10, pop(u, 1.9)); });
      sub(750, 175, '= 는 딱 이 경로만', fade(u, 1.6), { fill: ACC, 'font-weight': 700 }); return; }
    if (k === 1) { const rules = [['allow 127.0.0.1;', GOOD], ['allow 10.0.0.0/8;', GOOD], ['deny all;', BAD], ['access_log off;', MUT]];
      rules.forEach(([s, col], i) => mono(80, 100 + i * 40, s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.1 + i * 0.15) }));
      [['127.0.0.1', 0, true], ['10.1.2.3', 1, true], ['203.0.113.9', 2, false]].forEach(([ip, hit, ok], i) => { const y = 120 + i * 90, a = 0.8 + i * 0.5;
        mono(520, y, ip, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); grow(510, y - 5, 300, 95 + hit * 40, E(u, a + 0.1, a + 0.4), ok ? GOOD : BAD);
        if (ok) check(700, y - 5, 12, pop(u, a + 0.4)); else cross(700, y - 5, 10, pop(u, a + 0.4)); });
      note(80, 380, '위에서부터 처음 맞는 규칙이 이긴다. deny all 은 맨 끝', fade(u, 2.3)); return; }
    if (k === 2) { terminal(80, 70, 800, 220, OUT, E(u, 0.2, 2.0) * 5, { title: 'terminal', fs: 16, lh: 30 });
      note(80, 340, '숫자 7개가 전부다. 파싱할 게 거의 없다', fade(u, 2.2)); return; }
    if (k === 3) { tx(60, 50, 'Active connections 291 =', { 'font-size': 17, 'font-weight': 700 });
      const parts = [['Reading', 6, INFO], ['Writing', 179, ACC], ['Waiting', 106, WARN]], W = 800 / 291; let x = 80;
      parts.forEach(([n, v, col], i) => { const w = v * W * E(u, 0.2 + i * 0.4, 0.8 + i * 0.4); el('rect', { x, y: 80, width: w, height: 48, fill: col, opacity: 0.8 });
        const lx = i === 0 ? 80 : x + v * W / 2; mono(lx, 156 + (i === 0 ? 24 : 0), `${n} ${v}`, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': i === 0 ? 'start' : 'middle', opacity: fade(u, 0.6 + i * 0.4) }); x += v * W; });
      [['Reading', '요청 헤더를 읽는 중'], ['Writing', '응답을 쓰는 중'], ['Waiting', 'keep-alive 로 쉬는 연결']].forEach(([a, b], i) => note(80, 230 + i * 28, `${a} · ${b}`, fade(u, 1.5 + i * 0.15), { 'font-size': 14.5 }));
      mono(560, 240, 'accepts  16630948', { 'font-size': 15, opacity: fade(u, 1.9) }); mono(560, 268, 'handled  16630948', { 'font-size': 15, opacity: fade(u, 1.9) });
      note(560, 306, '둘이 같으면 연결 제한에 안 걸렸다', fade(u, 2.2), { fill: GOOD }); note(80, 380, 'keep-alive 때문에 연결 수와 요청 수는 다르다', fade(u, 2.4), { fill: MUT }); return; }
    if (k === 4) { const v = lerp(31070465, 31071200, E(u, 0.6, 1.8));
      tx(80, 80, 'requests (누적 카운터)', { 'font-size': 16, 'font-weight': 700 });
      mono(80, 140, '0초    31,070,465', { 'font-size': 22, 'font-weight': 700 }); mono(80, 190, '1초 뒤 ' + fmt(v).padStart(10, ' '), { 'font-size': 22, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      ln(80, 214, 470, 214, INK, 2, null, fade(u, 1.8));
      mono(80, 260, '차이      735  = 735 RPS', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) });
      const ax = R.axes(560, 90, 340, 200, { x: [0, 10], y: [0, 10], xl: '시간', yl: '' });
      R.line(ax, [[0, 1], [2, 2.6], [4, 4.1], [6, 5.8], [8, 7.6], [10, 9.3]], E(u, 0.2, 1.6), INFO); R.line(ax, [[0, 4], [10, 4]], E(u, 1.4, 2.4), GOOD, { dash: '6 4' });
      tx(910, 115, '누적', { 'font-size': 14, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 1.2) }); tx(910, 205, '변화율', { 'font-size': 14, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 2.2) });
      note(560, 360, 'Prometheus rate() 가 하는 일', fade(u, 2.3), { fill: MUT }); return; }
    if (k === 5) { card(130, 200, 180, 60, { text: 'stub_status', fs: 15, mono: true, stroke: ACC, color: ACC });
      [['shell 한 줄 · 1초마다', 90, INK], ['exporter', 200, INFO], ['Grafana', 310, GOOD]].forEach(([n, y, col], i) => { grow(222, 200, 440, y, E(u, 0.3 + i * 0.4, 0.7 + i * 0.4), col); card(560, y, 220, 50, { text: n, fs: 15, stroke: col, color: col, s: pop(u, 0.6 + i * 0.4) }); });
      grow(560, 225, 560, 284, E(u, 1.6, 2.0), MUT);
      note(700, 206, 'Prometheus 를 거쳐', fade(u, 1.8), { fill: MUT }); note(60, 395, 'stub_status 는 수집 소스일 뿐, 저장과 그림은 다른 도구가 맡는다', fade(u, 2.2), { fill: MUT }); return; }
    [['OSS stub_status', ['연결 · 요청 숫자 7개'], 250, INK], ['Nginx Plus API', ['zone 별 통계', 'upstream 노드별 상태', '캐시 상태'], 700, ACC]].forEach(([n, L, x, col], i) => {
      card(x, 190, 360, 220, { stroke: col, s: pop(u, 0.2 + i * 0.6) }); lbl(x, 110, n, fade(u, 0.3 + i * 0.6), { fill: col });
      L.forEach((s, j) => tx(x - 140, 160 + j * 36, '· ' + s, { 'font-size': 15, opacity: fade(u, 0.5 + i * 0.6 + j * 0.15) })); });
    note(60, 360, 'OSS 에서 노드별 통계가 필요하면 vts 모듈', fade(u, 2.2), { fill: MUT }); }

  // ---------- 4. exporter ----------
  const BOX = [['nginx', ':80', 120], ['nginx-exporter', ':9113', 360], ['prometheus', ':9090', 600], ['grafana', ':3000', 840]];
  function stack(n, k, u) { BOX.slice(0, n).forEach(([a, p, x], i) => { const hot = i === n - 1 && k === n - 1; card(x, 200, 190, 80, { rx: 10, text: a + '\n' + p, fs: 15, mono: true, stroke: hot ? ACC : INK, color: hot ? ACC : INK, s: hot ? pop(u, 0.2) : 1 }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) { stack(k + 1, k, u);
      if (k === 0) { card(120, 340, 190, 44, { text: './conf  (ro)', fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.6) }); grow(120, 318, 120, 244, E(u, 0.9, 1.3), INFO); R.lock(220, 340, true, INFO, pop(u, 1.2));
        note(300, 345, '컨테이너가 설정을 고치는 일은 없어야 한다', fade(u, 1.6), { fill: MUT }); }
      if (k >= 1) { grow(265, 185, 216, 185, k === 1 ? E(u, 0.5, 0.9) : 1, ACC); mono(240, 146, 'GET /nginx_status', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 0.6) : 1 }); }
      if (k === 1) { terminal(250, 280, 460, 120, ['nginx_connections_active 291', 'nginx_http_requests_total 31070465'], E(u, 1.0, 2.0) * 2, { title: ':9113/metrics', fs: 14 }); }
      if (k >= 2) { grow(505, 185, 456, 185, k === 2 ? E(u, 0.5, 0.9) : 1, INFO); mono(480, 146, 'pull', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 2 ? fade(u, 0.6) : 1 }); }
      if (k === 2) { dbIcon(600, 340, '시계열 저장', { s: pop(u, 1.0) }); note(60, 400, 'exporter 가 보내는 게 아니라 Prometheus 가 가져간다', fade(u, 1.8)); }
      if (k === 3) { grow(745, 185, 696, 185, E(u, 0.5, 0.9), GOOD); mono(720, 146, 'query', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.6) });
        note(560, 330, 'GF_SECURITY_ADMIN_PASSWORD=admin 은 데모용', fade(u, 1.6), { fill: WARN }); note(560, 358, '실제로는 시크릿으로 넣는다', fade(u, 1.9), { fill: MUT }); }
      return; }
    if (k === 4) { tx(60, 60, 'scrape_interval: 15s · targets: nginx-exporter:9113', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      const X = (s) => 100 + s * 12;
      ln(100, 220, 820, 220, MUT, 1.8); [0, 15, 30, 45, 60].forEach((s, i) => { mono(X(s), 250, s + 's', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); const p = pop(u, 0.3 + i * 0.4); el('circle', { cx: X(s), cy: 220, r: 10 * p, fill: INFO }); if (p > 0.5) grow(X(s), 205, X(s), 140, 1, INFO); });
      note(100, 320, '1분에 4번 가져간다', fade(u, 2.2), { fill: INFO }); note(100, 350, '간격을 줄이면 저장량이 그만큼 는다', fade(u, 2.4), { fill: MUT }); return; }
    if (k === 5) { const p = (v) => Math.round(v * E(u, 0.2, 1.4));
      meters(60, 100, 840, [{ name: 'nginx_connections_active', val: String(p(291)) }, { name: '…_reading', val: String(p(6)) }, { name: '…_writing', val: String(p(179)) }, { name: '…_waiting', val: String(p(106)) }], { h: 90 });
      card(240, 300, 300, 50, { text: 'nginx_up  1', fs: 17, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.4) });
      note(420, 306, '0 이 되면 알람 1순위', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 6) { const ax = R.axes(100, 80, 360, 240, { x: [0, 60], y: [0, 10], xt: [0, 30, 60], xl: '초', yl: 'nginx_http_requests_total' });
      R.line(ax, [[0, 0.5], [20, 3.3], [40, 6.2], [60, 9]], E(u, 0.2, 1.4), INFO);
      const bx = R.axes(560, 80, 340, 240, { x: [0, 60], y: [0, 1000], xt: [0, 30, 60], yt: [0, 500, 1000], xl: '초', yl: 'rate(…[1m])' });
      R.line(bx, [[0, 735], [60, 735]], E(u, 1.2, 2.2), GOOD); mono(bx.X(30), bx.Y(735) - 12, '735', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      note(100, 400, 'rate() 없이 그리면 우상향 직선만 보인다 (값은 stub_status 예시)', fade(u, 2.3), { fill: MUT }); return; }
    [['nginx-module-vts', 'vhost · upstream 별 메트릭', '재컴파일 필요', 250, INFO], ['Nginx Plus', 'API 모듈 + Plus exporter', '유료', 700, ACC]].forEach(([n, d, w, x, col], i) => {
      card(x, 200, 360, 160, { stroke: col, s: pop(u, 0.3 + i * 0.5) }); lbl(x, 165, n, fade(u, 0.4 + i * 0.5), { fill: col }); tx(x, 205, d, { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.5) }); sub(x, 240, w, fade(u, 0.7 + i * 0.5), { 'font-size': 14.5 }); });
    note(480, 360, '기본 exporter 로 부족할 때만 간다', fade(u, 2.0), { 'text-anchor': 'middle', fill: MUT }); }

  // ---------- 5. 알람 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { mono(60, 60, 'groups: - name: nginx   interval: 30s', { 'font-size': 16, 'font-weight': 700 });
      const X = (s) => 100 + s * 6; ln(100, 220, 820, 220, MUT, 1.8);
      for (let s = 0; s <= 120; s += 30) { mono(X(s), 250, s + 's', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); const p = pop(u, 0.3 + s / 60); card(X(s), 180, 60, 32, { rx: 6, text: '평가', fs: 13.5, stroke: ACC, color: ACC, s: p }); }
      note(100, 320, 'interval = 규칙을 얼마나 자주 평가하나', fade(u, 2.0)); note(100, 350, 'for = 조건이 얼마나 오래 이어져야 울리나', fade(u, 2.3), { fill: WARN }); return; }
    if (k === 1) { const ax = R.axes(100, 90, 760, 160, { x: [0, 8], y: [0, 1], xt: [0, 2, 4, 6, 8], yt: [0, 1], xl: '분', yl: 'nginx_up' });
      const P = [[0, 1], [1, 1], [1, 0], [1.5, 0], [1.5, 1], [4, 1], [4, 0], [8, 0]]; R.line(ax, P, E(u, 0.2, 1.8), INFO);
      el('rect', { x: ax.X(1), y: ax.Y(1), width: ax.X(1.5) - ax.X(1), height: 160, fill: WARN, opacity: 0.15 * fade(u, 0.8) }); sub(ax.X(1.25), 290, '30초 재기동 · 안 울림', fade(u, 1.0), { fill: WARN, 'font-weight': 700 });
      el('rect', { x: ax.X(4), y: ax.Y(1), width: ax.X(6) - ax.X(4), height: 160, fill: WARN, opacity: 0.2 * fade(u, 1.6) }); sub(ax.X(5), 290, 'pending 2분', fade(u, 1.7), { fill: WARN, 'font-weight': 700 });
      pill(ax.X(7), 70, 'critical · NginxDown', BAD, pop(u, 2.2), { fs: 14 }); grow(ax.X(6), 90, ax.X(6), 240, fade(u, 2.1), BAD);
      return; }
    if (k === 2) { tx(60, 50, '5xx 를 건수로 볼까, 비율로 볼까 (예시 값)', { 'font-size': 17, 'font-weight': 700 });
      [['낮 · 요청 100,000', '5xx 500', 0.5, 'count > 100 이면 울림', '비율 0.5% · 안 울림'], ['밤 · 요청 1,000', '5xx 50', 5, 'count > 100 이면 놓침', '비율 5% · 울림']].forEach(([a, b, pct, cnt, rt], i) => {
        const y = 120 + i * 130; tx(60, y, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.6) }); mono(60, y + 28, b, { 'font-size': 15, fill: BAD, opacity: fade(u, 0.3 + i * 0.6) });
        el('rect', { x: 300, y: y - 16, width: 400, height: 26, rx: 4, fill: SOFT }); el('rect', { x: 300, y: y - 16, width: 400 * pct / 6 * E(u, 0.4 + i * 0.6, 1.0 + i * 0.6), height: 26, rx: 4, fill: pct > 1 ? BAD : GOOD });
        ln(300 + 400 / 6, y - 26, 300 + 400 / 6, y + 20, BAD, 2.5); if (i === 0) mono(300 + 400 / 6, y - 32, '1%', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 });
        mono(300, y + 40, cnt, { 'font-size': 14, fill: i ? BAD : WARN, opacity: fade(u, 1.4 + i * 0.3) }); mono(560, y + 40, rt, { 'font-size': 14, fill: i ? BAD : GOOD, 'font-weight': 700, opacity: fade(u, 1.6 + i * 0.3) }); });
      note(60, 405, '비율은 트래픽 크기와 상관없이 같은 뜻을 가진다', fade(u, 2.3), { fill: MUT }); return; }
    if (k === 3) { const ax = R.axes(100, 80, 640, 230, { x: [0, 2], y: [0, 10], xt: [0, 0.5, 1, 1.5, 2], xl: '응답 시간 (초)', yl: '요청 수' });
      const H = [9, 8, 6, 4, 2.8, 1.8, 1.2, 0.9, 0.7, 0.6, 0.5, 0.45, 0.4, 0.35, 0.3, 0.3];
      H.forEach((h, i) => { const s = clamp(E(u, 0.2, 1.4) * 16 - i); el('rect', { x: ax.X(i * 0.125) + 2, y: ax.Y(h * s), width: ax.X(0.125) - ax.X(0) - 4, height: ax.Y(0) - ax.Y(h * s), fill: i >= 9 ? BAD : INFO, opacity: 0.7 }); });
      const mark = (v, s, col, a) => { ln(ax.X(v), 80, ax.X(v), 310, col, 2.5, '6 4', fade(u, a)); mono(ax.X(v), 72, s, { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, a) }); };
      mark(0.42, '평균', GOOD, 1.5); mark(1.15, 'p95', BAD, 1.9); mark(1, '', WARN, 1.9);
      note(770, 160, '평균은 괜찮아 보여도', fade(u, 1.6)); note(770, 188, '느린 5% 가 1초를 넘는다', fade(u, 2.0), { fill: BAD }); sub(840, 300, '분포는 예시', fade(u, 2.2)); return; }
    if (k === 4) { tx(60, 60, 'nginx_connections_active > 5000', { 'font-size': 17, 'font-weight': 700, class: 'mono' });
      const v = 5600 * E(u, 0.3, 1.8); el('rect', { x: 100, y: 150, width: 700, height: 40, rx: 6, fill: SOFT }); el('rect', { x: 100, y: 150, width: 700 * v / 8000, height: 40, rx: 6, fill: v > 5000 ? BAD : INFO });
      ln(100 + 700 * 5000 / 8000, 130, 100 + 700 * 5000 / 8000, 210, BAD, 2.5); mono(100 + 700 * 5000 / 8000, 232, '5000', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 });
      mono(100, 120, fmt(v), { 'font-size': 18, 'font-weight': 800, fill: v > 5000 ? BAD : INFO });
      note(100, 300, '게이지라 rate() 없이 그대로 비교한다', fade(u, 1.8)); note(100, 330, '한계는 worker_processes × worker_connections', fade(u, 2.1), { fill: MUT });
      sub(700, 120, '값은 예시', fade(u, 0.5)); return; }
    if (k === 5) { const ax = R.axes(100, 80, 720, 220, { x: [0, 30], y: [0, 100], xt: [0, 10, 20, 30], yt: [0, 50, 100], xl: '분', yl: 'cache hit %', grid: true });
      R.line(ax, [[0, 78], [8, 76], [12, 60], [14, 46], [20, 42], [26, 40], [30, 41]], E(u, 0.2, 1.6), INFO);
      ln(ax.X(0), ax.Y(50), ax.X(30), ax.Y(50), WARN, 2, '6 4', fade(u, 0.4));
      el('rect', { x: ax.X(14), y: ax.Y(100), width: ax.X(24) - ax.X(14), height: 220, fill: WARN, opacity: 0.15 * fade(u, 1.6) }); sub(ax.X(19), 70, 'for: 10m', fade(u, 1.7), { fill: WARN, 'font-weight': 700 });
      pill(ax.X(27), 140, 'info', INFO, pop(u, 2.1), { mono: true });
      note(100, 395, '히트율이 떨어지면 원본 부하가 곧바로 오른다 (곡선은 예시)', fade(u, 2.2), { fill: MUT }); return; }
    card(150, 180, 200, 70, { text: 'dashboard\n12708', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) }); grow(255, 180, 330, 180, E(u, 0.5, 0.8), ACC);
    const P = [['RPS', 'line'], ['활성 연결', 'bar'], ['Reading · Writing', 'bar'], ['Waiting', 'line'], ['accepted · handled', 'line'], ['nginx_up', 'stat']];
    P.forEach(([n, kind], i) => { const x = 350 + (i % 3) * 190, y = 90 + Math.floor(i / 3) * 150, s = pop(u, 0.8 + i * 0.2);
      card(x + 85, y + 60, 176, 130, { rx: 8, stroke: GRID, s }); if (s < 0.6) return; tx(x + 10, y + 20, n, { 'font-size': 14, 'font-weight': 700 });
      if (kind === 'line') el('polyline', { points: `${x + 14},${y + 100} ${x + 50},${y + 80} ${x + 90},${y + 88} ${x + 130},${y + 60} ${x + 160},${y + 66}`, fill: 'none', stroke: INFO, 'stroke-width': 2.5 });
      else if (kind === 'bar') [30, 50, 40, 60].forEach((h, j) => el('rect', { x: x + 20 + j * 34, y: y + 110 - h, width: 22, height: h, fill: ACC, opacity: 0.7 }));
      else mono(x + 85, y + 90, '1', { 'font-size': 34, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); });
    note(60, 400, '임포트 한 번이면 패널이 생긴다', fade(u, 2.2), { fill: MUT }); }

  const quiz = [
    { q: '로그에서 request_time이 0.025, upstream_response_time이 0.020이다. 0.005 초는 어디서 쓰였나?',
      o: ['nginx 자신과 네트워크', '백엔드 애플리케이션', 'DB 쿼리'], a: 0,
      why: 'request_time은 전체 시간이고 upstream_response_time은 그중 백엔드 몫이다. 둘의 차이가 nginx와 네트워크가 쓴 시간이다.' },
    { q: 'logrotate가 파일을 돌렸는데 postrotate의 kill -USR1이 빠졌다. 무슨 일이 생기는가?',
      o: ['nginx가 멈춘다', 'nginx가 옛 파일에 계속 써서 새 파일은 비어 있다', '로그가 자동으로 새 파일에 쌓인다'], a: 1,
      why: 'nginx는 열어 둔 파일 핸들에 계속 쓴다. USR1을 받아야 로그 파일을 다시 연다.' },
    { q: 'stub_status에서 accepts와 handled가 벌어지기 시작했다. 무엇을 뜻하는가?',
      o: ['캐시가 꽉 찼다', 'keep-alive 연결이 늘었다', 'worker_connections 같은 자원 한도에 걸렸다'], a: 2,
      why: 'handled는 보통 accepts와 같다. 자원 한도에 걸려 받은 연결을 처리하지 못하면 그만큼 차이가 생긴다.' },
    { q: 'Prometheus와 nginx-exporter 사이에서 데이터는 어떻게 움직이는가?',
      o: ['Prometheus가 15초마다 exporter의 :9113을 가져간다', 'exporter가 Prometheus로 밀어 넣는다', 'nginx가 Prometheus로 직접 보낸다'], a: 0,
      why: 'Prometheus는 pull 방식이다. scrape_interval 15s마다 타깃을 찾아가 메트릭을 긁는다.' },
    { q: 'NginxDown 규칙에 for: 2m을 두는 까닭은 무엇인가?',
      o: ['평가 간격을 2분으로 늘리려고', '재기동 같은 짧은 끊김에는 울리지 않게 하려고', '2분 뒤 알람을 자동으로 끄려고'], a: 1,
      why: 'for는 조건이 이어져야 하는 시간이다. 30초 재기동처럼 잠깐 0이 되는 값으로는 firing이 되지 않는다.' },
  ];
  const summary = [
    'JSON 로그는 변수 하나가 필드 하나라서 escape=json만 켜면 분석 도구가 그대로 읽는다.',
    'request_time에서 upstream_response_time을 빼면 nginx와 네트워크가 쓴 시간이 나온다.',
    'stub_status는 숫자 7개를 주고 exporter가 이를 :9113 메트릭으로 바꾼다.',
    '알람은 5xx 비율과 p95처럼 트래픽 크기와 상관없는 값으로 잡고 for로 순간 값을 거른다.',
  ];
  const review = [
    { q: 'Grafana의 RPS 패널이 계속 오르기만 하는 직선이다. 무엇이 빠졌나?',
      o: ['scrape_interval을 더 줄여야 한다', '누적 카운터를 rate()로 감싸지 않았다', 'stub_status의 allow 규칙이 틀렸다'], a: 1,
      why: 'nginx_http_requests_total은 누적값이다. 두 시점의 차이를 시간으로 나눈 rate()를 그려야 초당 요청이 된다.' },
    { q: '백엔드 로그와 nginx 로그를 한 요청 단위로 이어 보고 싶다. 무엇을 해야 하는가?',
      o: ['access_log를 buffer 없이 쓴다', 'error_log 레벨을 debug로 내린다', '$request_id를 로그에 넣고 X-Request-ID 헤더로 백엔드에 넘긴다'], a: 2,
      why: 'nginx가 요청마다 만든 ID를 양쪽 로그에 같이 남겨야 이어 붙일 수 있다.' },
    { q: '5xx 알람을 "5분간 5xx 100건 초과"로 걸었더니 낮마다 울리고 밤 장애는 놓쳤다. 어떻게 바꾸는가?',
      o: ['건수 기준을 1,000건으로 올린다', '5xx 수를 전체 요청 수로 나눈 비율로 바꾼다', 'for를 없앤다'], a: 1,
      why: '건수는 트래픽이 많을 때 부풀고 적을 때 묻힌다. 비율은 트래픽 크기와 상관없이 같은 기준으로 판단한다.' },
  ];

  R.page({ title: '로그에서 알람까지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
