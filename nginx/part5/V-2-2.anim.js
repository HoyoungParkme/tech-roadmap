/* V-2-2 운영 체크리스트 4축 × 12 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 왼쪽은 그 축의 12칸 체크판(코드 주석의 ①~⑫ 번호), 오른쪽은 지금 beat 의 설정이 실제로 하는 일. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, dot, zone, cross, check, person, server, dbIcon, browser, lock, clock, terminal, fly } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ln = (x1, y1, x2, y2, col, sw, dash, op) => el('line', { x1, y1, x2, y2, stroke: col || GRID, 'stroke-width': sw || 2, 'stroke-dasharray': dash, opacity: op ?? 1 });
  const NAMES = {
    perf: ['워커 수', '연결 4096', 'FD 한도', 'sendfile', 'nopush', 'keepalive', 'upstream ka', 'gzip · br', 'HTTP/2', 'buffering', '파일 캐시', 'immutable'],
    rel: ['connect', 'read', 'send', 'next_upstream', 'tries 3', 'max_fails', '/health', 'backup', 'reload', '인증서 갱신', '디스크 분리', '코어 덤프'],
    sec: ['TLS 1.2+', 'cipher', '인증서', 'HSTS', 'CSP', 'XFO', 'nosniff', 'Referrer', '버전 숨김', 'limit_req', 'real_ip', 'SIEM 로그'],
    obs: ['JSON 포맷', 'access_log', 'error_log', 'request_id', 'stub_status', 'exporter', 'Grafana', '5xx 알람', 'p95 알람', 'cache 알람', '인증서 만료', 'logrotate'],
  };
  const TITLE = { perf: 'Performance', rel: 'Reliability', sec: 'Security', obs: 'Observability' };
  // beat 마다 체크되는 번호 (STEPS 의 verdict · changes 에 적힌 ①~⑫)
  const HOT = {
    perf: [[1, 2, 3], [4, 5, 6, 11], [8], [7], [9], [10], [10], [12]],
    rel: [[6, 8], [], [1, 2, 3], [4, 5], [3], [7], [9, 10], [11, 12]],
    sec: [[9, 11], [10], [1], [2, 3], [4, 5], [6, 7, 8], [10], [12]],
    obs: [[1], [1], [2, 3], [4], [5], [6], [7, 8, 9, 10], [11, 12]],
  };
  // 왼쪽 체크판: 2열 × 6행
  function board(ax, k, u) { const hot = HOT[ax][k], done = new Set(HOT[ax].slice(0, k).flat());
    zone(14, 20, 300, 384, TITLE[ax] + ' · 12', { stroke: GRID, fill: PANEL });
    NAMES[ax].forEach((n, i) => { const x = 26 + (i % 2) * 144, y = 52 + Math.floor(i / 2) * 58, no = i + 1, isH = hot.includes(no), isD = done.has(no) || (isH && u > 1.6);
      el('rect', { x, y, width: 136, height: 46, rx: 8, fill: isH ? ACCBG : SOFT, stroke: isH ? ACC : 'none', 'stroke-width': 2 });
      el('circle', { cx: x + 18, cy: y + 23, r: 12, fill: isD ? GOOD : PANEL, stroke: isD ? GOOD : GRID, 'stroke-width': 2 });
      if (isD) el('path', { d: `M${x + 12},${y + 23} l4,5 l8,-10`, fill: 'none', stroke: PANEL, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: isH ? fade(u, 1.6) : 1 }); else mono(x + 18, y + 28, String(no), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      tx(x + 36, y + 28, n, { 'font-size': 13.5, 'font-weight': isH ? 800 : 600, fill: isH ? ACC : INK }); }); }
  const RX = 640;   // 오른쪽 그림 가운데

  // ---------- 1. Performance ----------
  function s1(t, c) { const { k, u } = c; board('perf', k, u);
    if (k === 0) { for (let i = 0; i < 4; i++) { const x = 400 + i * 135, s = pop(u, 0.2 + i * 0.15);
        card(x, 80, 100, 40, { rx: 6, text: 'core ' + i, fs: 14, mono: true, stroke: MUT, color: MUT, s }); grow(x, 102, x, 140, E(u, 0.5 + i * 0.15, 0.8 + i * 0.15), MUT);
        card(x, 175, 110, 56, { rx: 8, text: 'worker\n4096 연결', fs: 13.5, stroke: ACC, color: ACC, s: pop(u, 0.8 + i * 0.15) }); }
      mono(RX, 250, '4 × 4096 = 16,384 연결', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      el('rect', { x: 360, y: 290, width: 560, height: 22, rx: 4, fill: SOFT }); el('rect', { x: 360, y: 290, width: 560 * 16384 / 65535 * E(u, 1.6, 2.2), height: 22, rx: 4, fill: ACC });
      mono(920, 336, 'worker_rlimit_nofile 65535', { 'font-size': 14, 'text-anchor': 'end', opacity: fade(u, 1.7) });
      note(360, 395, 'FD 한도가 낮으면 연결 수를 올려도 거기서 막힌다 (코어 4개 예시)', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 1) { dbIcon(400, 130, '디스크', {}); card(640, 130, 170, 56, { text: '커널\n페이지 캐시', fs: 14, stroke: INFO, color: INFO }); card(870, 130, 110, 56, { text: '소켓', fs: 15, stroke: INFO, color: INFO });
      grow(450, 130, 552, 130, E(u, 0.3, 0.7), INFO); grow(728, 130, 812, 130, E(u, 0.7, 1.1), INFO); dot([[450, 130], [812, 130]], seg(u, 0.4, 1.4), INFO, 7);
      card(640, 250, 200, 48, { text: 'nginx 메모리', fs: 14, stroke: GRID, color: MUT, dash: '6 4' }); ln(640, 160, 640, 224, GRID, 2, '5 5'); cross(640, 196, 12, pop(u, 1.2));
      tx(380, 220, 'sendfile · 사용자 공간 복사 없음', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.3) });
      clock(420, 340, 30, 1 - E(u, 1.6, 2.6) * 0.3, WARN); mono(470, 346, 'keepalive_timeout 65', { 'font-size': 14.5, opacity: fade(u, 1.6) });
      sub(760, 346, 'tcp_nopush 는 sendfile 과 짝', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2) { tx(360, 60, '압축 전후 (막대 길이는 비율을 보여 주는 예시)', { 'font-size': 14.5, fill: MUT });
      [['app.js · json · svg', 1, 0.28, GOOD], ['photo.jpg', 1, 0.98, BAD]].forEach(([n, a, b, col], i) => { const y = 120 + i * 120, g = E(u, 0.5 + i * 0.6, 1.2 + i * 0.6);
        tx(360, y - 12, n, { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: 360, y, width: 520, height: 22, rx: 4, fill: OFF });
        el('rect', { x: 360, y: y + 30, width: 520 * lerp(a, b, g), height: 22, rx: 4, fill: col }); });
      note(360, 200, '텍스트는 크게 준다', fade(u, 1.3), { fill: GOOD }); note(360, 320, '이미 압축된 포맷은 CPU 만 쓰고 그대로', fade(u, 1.9), { fill: BAD });
      sub(RX, 390, 'brotli 는 ngx_brotli 모듈을 따로 넣어야 한다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { server(400, 200, 'nginx', {}); server(880, 200, 'app:8000', {});
      for (let i = 0; i < 6; i++) { const y = 140 + i * 24; ln(460, y, 820, y, GOOD, 2, null, fade(u, 0.3 + i * 0.1)); }
      for (let i = 0; i < 6; i++) dot([[460, 140 + i * 24], [820, 140 + i * 24]], ((t * 0.7 + i / 6) % 1) * (u > 0.8 ? 1 : 0), GOOD, 5);
      tx(RX, 110, 'keepalive 32 · 열어 둔 연결을 다시 쓴다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      note(380, 330, 'proxy_http_version 1.1 + Connection "" 이 함께 있어야 산다', fade(u, 1.6), { 'font-size': 14 });
      note(380, 360, '없으면 요청마다 TCP · TLS 핸드셰이크', fade(u, 2.0), { fill: BAD, 'font-size': 14 }); return; }
    if (k === 4) { browser(470, 200, 200, 150, null, {}); server(860, 200, 'nginx :443', {});
      [0, 1, 2, 3].forEach((i) => { const y = 160 + i * 26, col = [ACC, INFO, WARN, GOOD][i]; dot([[570, y], [800, y]], ((t * 0.9 + i * 0.23) % 1) * (u > 0.4 ? 1 : 0), col, 6); });
      el('rect', { x: 570, y: 145, width: 230, height: 110, rx: 12, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      tx(685, 130, 'TCP 연결 하나에 여러 요청', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      pill(470, 320, 'http2 on (TLS 위)', ACC, pop(u, 1.3), { mono: true, fs: 14 }); pill(760, 320, 'listen 443 quic · http3 on', INFO, pop(u, 1.7), { mono: true, fs: 14 });
      note(360, 395, '평문 80 포트의 h2 는 브라우저가 쓰지 않는다', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 5 || k === 6) { const on = k === 5; server(870, 150, 'backend', { lamp: on && u > 1.2 ? GOOD : BAD }); person(380, 160, '느린 휴대폰', {});
      card(630, 150, 180, 70, { text: on ? 'nginx 버퍼' : 'nginx (통과)', fs: 15, stroke: on ? ACC : INFO, color: on ? ACC : INFO });
      if (on) { const f = E(u, 0.3, 1.1); el('rect', { x: 548, y: 175 - 40 * f, width: 164, height: 40 * f, rx: 4, fill: ACC, opacity: 0.35 }); dot([[810, 150], [720, 150]], seg(u, 0.2, 0.8), ACC, 8);
        for (let i = 0; i < 4; i++) dot([[540, 150], [420, 150]], seg(u, 0.9 + i * 0.4, 1.6 + i * 0.4), ACC, 5);
        note(360, 290, '백엔드는 응답을 빨리 넘기고 바로 다음 일로', fade(u, 1.3), { fill: GOOD }); note(360, 320, 'REST 처럼 짧은 응답은 on', fade(u, 1.8), { 'font-size': 14 }); }
      else { for (let i = 0; i < 5; i++) dot([[810, 150], [420, 150]], seg(u, 0.2 + i * 0.45, 0.9 + i * 0.45), INFO, 6);
        mono(630, 230, 'data: {…}  data: {…}  data: {…}', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
        note(360, 290, 'SSE · 스트리밍은 조각이 오는 대로 바로 보낸다', fade(u, 1.3), { fill: INFO }); note(360, 320, '버퍼링을 켜 두면 한참 뒤에 뭉쳐서 도착한다', fade(u, 1.8), { fill: WARN, 'font-size': 14 }); }
      return; }
    // k7: immutable
    card(500, 110, 230, 48, { text: 'app.3f9a1c.js', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.2) });
    pill(780, 110, 'max-age 1년 · immutable', GOOD, pop(u, 0.5), { fs: 13.5 });
    tx(360, 190, '배포로 내용이 바뀌면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
    card(500, 250, 230, 48, { text: 'app.8b2e07.js', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.3) }); grow(500, 136, 500, 222, E(u, 1.1, 1.4), MUT);
    note(640, 256, '이름이 바뀌니 새로 받는다', fade(u, 1.6), { fill: ACC });
    note(360, 350, '해시 붙은 파일은 재검증 요청 없이 영구 캐시', fade(u, 2.1)); }

  // ---------- 2. Reliability ----------
  function s2(t, c) { const { k, u } = c; board('rel', k, u);
    if (k === 0) { const apps = ['app1', 'app2', 'app3']; server(400, 200, 'nginx', { s: 0.8 });
      apps.forEach((a, i) => { const y = 90 + i * 90, dead = i === 1 && u > 1.3; card(700, y, 150, 50, { text: a + ':8000', fs: 14, mono: true, stroke: dead ? BAD : INK, color: dead ? BAD : INK, op: dead ? 0.6 : 1 });
        if (i === 1) [0, 1, 2].forEach((j) => cross(800 + j * 26, y, 8, pop(u, 0.4 + j * 0.3))); });
      card(700, 360, 150, 46, { text: 'backup1', fs: 14, mono: true, stroke: WARN, color: WARN, dash: '6 4' });
      dot([[460, 200], [625, 90]], (t * 0.8) % 1, GOOD, 6); dot([[460, 200], [625, 270]], (t * 0.8 + 0.5) % 1, GOOD, 6);
      tx(940, 212, '10초 안에 3번 실패', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.3) }); tx(940, 234, '10초간 제외', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 1.5) });
      note(330, 410, '메인이 모두 죽어야 backup 이 받는다 · 실패는 실제 요청으로만 안다', fade(u, 2.1), { 'font-size': 14, fill: MUT }); return; }
    if (k === 1) { [['HTTP/1.0 · Connection: close', BAD, 120], ['HTTP/1.1 · Connection ""', GOOD, 290]].forEach(([n, col, y], i) => {
        tx(360, y - 50, n, { 'font-size': 15, 'font-weight': 700, fill: col, class: 'mono', opacity: fade(u, 0.2 + i * 0.8) });
        server(400, y, null, { s: 0.6, op: fade(u, 0.2 + i * 0.8) }); server(880, y, null, { s: 0.6, op: fade(u, 0.2 + i * 0.8) });
        if (i === 0) for (let j = 0; j < 3; j++) { const a = 0.5 + j * 0.5, f = seg(u, a, a + 0.45); if (f > 0 && f < 1) { ln(450, y, lerp(450, 830, f), y, col, 2.5); } if (f >= 1) cross(500 + j * 130, y + 30, 8, 1); }
        else { ln(450, y, 830, y, col, 3, null, fade(u, 1.0)); for (let j = 0; j < 4; j++) dot([[450, y], [830, y]], ((t + j / 4) % 1) * (u > 1.0 ? 1 : 0), col, 6); } });
      note(560, 190, '요청마다 끊고 새로 연다', fade(u, 1.6), { fill: BAD, 'font-size': 14 }); return; }
    if (k === 2) { const X = (s) => 380 + s * 8.5;
      [['proxy_connect_timeout', 5, ACC], ['proxy_read_timeout', 60, INFO], ['proxy_send_timeout', 60, INFO]].forEach(([n, s, col], i) => { const y = 100 + i * 80, g = E(u, 0.3 + i * 0.4, 1.0 + i * 0.4);
        mono(380, y - 12, n, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.4) }); el('rect', { x: 380, y, width: X(s) * g - 380 * g, height: 22, rx: 4, fill: col, opacity: 0.8 });
        mono(X(s) + 8, y + 17, s + 's', { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.4) }); });
      ln(380, 340, 890, 340, MUT, 1.5); [0, 30, 60].forEach((s) => mono(X(s), 362, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      note(380, 400, '연결은 짧게 · 죽은 노드를 빨리 포기해야 다음으로 간다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { server(390, 200, 'nginx', { s: 0.8 });
      card(720, 110, 170, 48, { text: 'app1 → 502', fs: 14.5, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.5) }); card(720, 220, 170, 48, { text: 'app2 → 200', fs: 14.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.2) });
      dot([[450, 200], [630, 110]], seg(u, 0.2, 0.6), INFO, 7); dot([[630, 110], [450, 190], [630, 220]], seg(u, 0.8, 1.4), WARN, 7);
      mono(560, 300, 'proxy_next_upstream_tries 3', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.5) });
      note(360, 350, 'POST 는 이미 보낸 뒤라면 다음 노드로 넘기지 않는다', fade(u, 1.9), { fill: WARN, 'font-size': 14 });
      note(360, 378, '(non_idempotent 를 붙여야 넘긴다)', fade(u, 2.1), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 4) { tx(360, 70, 'location /upload/', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      const lim = 500, X = (m) => 360 + m * 0.9;
      el('rect', { x: 360, y: 120, width: X(450) - 360, height: 30, rx: 4, fill: GOOD, opacity: fade(u, 0.3) }); mono(X(450) + 8, 141, '450MB · 통과', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.5) });
      el('rect', { x: 360, y: 190, width: (X(560) - 360) * E(u, 0.7, 1.3), height: 30, rx: 4, fill: BAD, opacity: 0.8 }); mono(X(560) + 8, 211, '560MB · 413', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) });
      ln(X(lim), 100, X(lim), 240, ACC, 2.5, '6 4'); mono(X(lim), 262, 'client_max_body_size 500m', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle' });
      note(360, 330, 'send · body 타임아웃도 600s 로 따로 연다 (크기는 예시)', fade(u, 1.8), { 'font-size': 14 }); note(360, 360, '타임아웃만 늘리면 413 은 그대로', fade(u, 2.2), { fill: BAD, 'font-size': 14 }); return; }
    if (k === 5) { card(400, 200, 130, 50, { text: 'LB', fs: 16, stroke: INK }); server(640, 200, 'nginx', {}); server(880, 200, 'backend', { op: 0.4 });
      dot([[465, 190], [580, 190]], seg(u, 0.3, 0.9), INFO, 7); dot([[580, 214], [465, 214]], seg(u, 1.0, 1.6), GOOD, 7);
      mono(520, 260, '200 ok', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      ln(700, 200, 820, 200, GRID, 2, '5 5'); cross(760, 200, 10, pop(u, 1.2));
      note(360, 340, 'nginx 가 바로 답한다 · 로그도 남기지 않는다', fade(u, 1.8), { 'font-size': 14 }); note(360, 368, '백엔드 상태까지 보려면 다른 경로가 필요하다', fade(u, 2.1), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 6) { const lines = [['$ sudo nginx -t', 'var(--term)'], ['nginx: configuration file … test is successful', 'var(--term)'], ['$ sudo nginx -s reload', 'var(--term)']];
      terminal(340, 50, 590, 150, lines, E(u, 0.2, 1.4) * 3, { title: 'shell', fs: 14 });
      note(350, 250, '틀린 설정이면 -t 에서 멈추고 reload 는 안 돈다', fade(u, 1.5), { 'font-size': 14 });
      note(350, 278, 'reload 자체도 틀린 설정이면 옛 설정으로 계속 돈다', fade(u, 1.8), { fill: MUT, 'font-size': 14 });
      mono(350, 330, '0 */12 * * * certbot -q renew --deploy-hook …', { 'font-size': 14, fill: ACC, opacity: fade(u, 2.0) }); clock(900, 330, 22, 0.5, INFO); return; }
    [['/', '루트', 0.35, INK], ['/mnt/logs', '로그', 0.7, INFO], ['/mnt/cache', '캐시', 0.55, ACC]].forEach(([m, n, f, col], i) => { const x = 420 + i * 170, s = E(u, 0.2 + i * 0.3, 0.8 + i * 0.3);
      dbIcon(x, 160, m, { stroke: col, s: 0.9 * s + 0.01 }); sub(x, 250, n, fade(u, 0.6 + i * 0.3), { 'font-size': 14.5 }); });
    note(360, 310, '로그 · 캐시가 차도 루트 파티션은 안전하다', fade(u, 1.5), { 'font-size': 14 });
    mono(360, 360, 'worker_rlimit_core 0;', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); note(600, 360, '코어 덤프가 디스크를 채우지 않게', fade(u, 2.0), { fill: MUT, 'font-size': 14 }); }

  // ---------- 3. Security ----------
  function s3(t, c) { const { k, u } = c; board('sec', k, u);
    if (k === 0) { card(520, 90, 280, 44, { text: 'Server: nginx/1.27.x', fs: 14.5, mono: true, stroke: BAD, color: BAD, op: 1 - 0.6 * fade(u, 0.9) }); grow(670, 90, 730, 90, E(u, 0.7, 1.0), MUT);
      card(820, 90, 160, 44, { text: 'Server: nginx', fs: 14.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.0) });
      person(390, 260, '사용자', {}); card(600, 260, 150, 50, { text: 'Cloudflare', fs: 14.5, stroke: INFO, color: INFO }); server(850, 260, 'nginx', { s: 0.7 });
      dot([[420, 260], [525, 260]], seg(u, 1.2, 1.6), INFO, 6); dot([[675, 260], [790, 260]], seg(u, 1.6, 2.0), INFO, 6);
      mono(850, 340, '$remote_addr = 사용자 IP', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.1) });
      sub(600, 300, 'CF-Connecting-IP', fade(u, 1.7), { 'font-size': 14 }); return; }
    if (k === 1) { [['login', '5r/m', '12초에 1개', WARN, 12000], ['api', '30r/s', '33ms 에 1개', GOOD, 33]].forEach(([n, r, d, col, gap], i) => { const y = 110 + i * 140;
        mono(360, y, `zone=${n}  rate=${r}`, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.5) });
        ln(360, y + 40, 900, y + 40, GRID, 1.5); const span = i === 0 ? 60000 : 300; for (let m = 0; m <= span; m += gap) { const x = 360 + (m / span) * 540; if (x > 360 + 540 * E(u, 0.4 + i * 0.5, 1.4 + i * 0.5)) break; el('circle', { cx: x, cy: y + 40, r: 6, fill: col }); }
        mono(900, y + 70, i === 0 ? '60초' : '300ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); sub(470, y + 70, d, fade(u, 1.0 + i * 0.5), { fill: col, 'font-weight': 700 }); });
      note(360, 400, 'IP 별 상태를 10MB 공유 메모리에 둔다', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 2) { ['TLS 1.0', 'TLS 1.1', 'TLS 1.2', 'TLS 1.3'].forEach((n, i) => { const x = 420 + i * 140, ok = i >= 2, s = pop(u, 0.2 + i * 0.2);
        card(x, 160, 120, 60, { text: n, fs: 16, mono: true, stroke: ok ? GOOD : BAD, color: ok ? GOOD : BAD, s, op: ok ? 1 : 1 - 0.5 * fade(u, 1.2) }); if (!ok) cross(x, 160, 18, pop(u, 1.2)); });
      mono(360, 260, 'ssl_protocols TLSv1.2 TLSv1.3;', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      note(360, 320, 'ssllabs A+ 의 첫 조건', fade(u, 1.8), { fill: GOOD }); note(360, 350, '아주 오래된 클라이언트는 접속하지 못한다', fade(u, 2.1), { fill: WARN, 'font-size': 14 }); return; }
    if (k === 3) { ['ECDHE-ECDSA-AES128-GCM-SHA256', 'ECDHE-RSA-AES128-GCM-SHA256', 'ECDHE-ECDSA-CHACHA20-POLY1305', 'ECDHE-RSA-CHACHA20-POLY1305'].forEach((s, i) => mono(360, 80 + i * 30, s, { 'font-size': 14, fill: INFO, opacity: fade(u, 0.2 + i * 0.2) }));
      mono(360, 220, 'ssl_prefer_server_ciphers off;', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.1) }); sub(780, 214, '순서는 클라이언트가 고른다', fade(u, 1.2));
      card(480, 300, 230, 50, { text: 'fullchain.pem', fs: 14.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.5) }); card(760, 300, 230, 50, { text: 'privkey.pem', fs: 14.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.7) }); lock(760, 360, true, GOOD, pop(u, 1.9));
      sub(480, 360, "Let's Encrypt", fade(u, 1.8)); return; }
    if (k <= 5) { const L = k === 4 ? [['Strict-Transport-Security: max-age=31536000; …preload', ACC], ["CSP: default-src 'self'; frame-ancestors 'none'", INFO]] : [['X-Frame-Options: DENY', INK], ['X-Content-Type-Options: nosniff', INK], ['Referrer-Policy: strict-origin-when-cross-origin', ACC]];
      server(400, 200, 'nginx', { s: 0.8 }); browser(860, 290, 130, 110, null, {});
      L.forEach(([s, col], i) => { const y = 90 + i * 40; fly(470, 200, 600, y, seg(u, 0.3 + i * 0.4, 0.9 + i * 0.4), '헤더', { fill: col }); mono(480, y + 5, s, { 'font-size': 13.5, fill: col, opacity: fade(u, 0.9 + i * 0.4) }); });
      note(360, 330, k === 4 ? 'HTTPS 강제 · 자원 출처를 self 로' : 'clickjacking · MIME sniffing · referer 유출', fade(u, 1.9), { 'font-size': 14 });
      note(360, 360, '모두 always 를 붙여 에러 응답에도 싣는다', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 6) { [['= /login', 'burst=5 nodelay', WARN, 6], ['/api/', 'burst=50 nodelay', GOOD, 51]].forEach(([p, o, col, n], i) => { const y = 100 + i * 150;
        mono(360, y, 'location ' + p, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.5) }); mono(360, y + 28, 'limit_req ' + o, { 'font-size': 14.5, fill: col, opacity: fade(u, 0.3 + i * 0.5) });
        const cells = i === 0 ? 10 : 12; for (let j = 0; j < cells; j++) { const ok = i === 0 ? j < n : true, s = pop(u, 0.8 + i * 0.5 + j * 0.05); card(380 + j * 44, y + 70, 36, 32, { rx: 5, text: ok ? '✓' : '429', fs: 13.5, fw: 700, stroke: ok ? GOOD : BAD, color: ok ? GOOD : BAD, s }); } });
      note(360, 400, '로그인 10번 동시에: 1 + burst 5 = 6번만 통과', fade(u, 2.2), { 'font-size': 14 }); return; }
    server(400, 200, 'nginx', { s: 0.8 }); for (let i = 0; i < 5; i++) dot([[460, 200], [700, 200]], ((t * 0.8 + i / 5) % 1) * (u > 0.4 ? 1 : 0), INFO, 5);
    mono(580, 180, 'access.json', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.4) }); dbIcon(800, 200, 'SIEM', { s: pop(u, 0.8) });
    note(360, 330, 'JSON access 로그는 침해 분석의 원재료다', fade(u, 1.6), { 'font-size': 14 }); }

  // ---------- 4. Observability ----------
  function s4(t, c) { const { k, u } = c; board('obs', k, u);
    if (k <= 1) { const F = k === 0 ? ['time', 'remote_addr', 'request', 'status', 'body_bytes', 'request_time'] : ['upstream_response_time', 'upstream_status', 'upstream_addr', 'cache_status', 'request_id', 'host'];
      tx(360, 60, k === 0 ? "log_format json escape=json '{'" : '추적 필드를 붙이고 닫는다', { 'font-size': 15, 'font-weight': 700, class: k === 0 ? 'mono' : null });
      F.forEach((f, i) => { const x = 360 + (i % 2) * 290, y = 110 + Math.floor(i / 2) * 60; card(x + 130, y, 260, 44, { rx: 8, text: '"' + f + '"', fs: 14.5, mono: true, stroke: f === 'request_id' ? ACC : INFO, color: f === 'request_id' ? ACC : INFO, s: pop(u, 0.3 + i * 0.2) }); });
      note(360, 330, k === 0 ? '정규식으로 텍스트 로그를 쪼개던 일이 사라진다' : 'request_id 가 없으면 백엔드 로그와 이을 수 없다', fade(u, 1.9), { 'font-size': 14 }); return; }
    if (k === 2) { server(400, 200, 'nginx', { s: 0.8 });
      dbIcon(800, 120, 'access.json', { stroke: INFO }); dbIcon(800, 290, 'error.log', { stroke: WARN });
      grow(460, 190, 740, 120, E(u, 0.3, 0.8), INFO); grow(460, 210, 740, 290, E(u, 0.7, 1.2), WARN);
      mono(520, 120, 'buffer=32k flush=1s', { 'font-size': 14, fill: INFO, opacity: fade(u, 0.9) }); mono(560, 300, 'warn', { 'font-size': 14, fill: WARN, opacity: fade(u, 1.2) });
      note(360, 395, '디스크 I/O 와 실시간성을 함께 잡는다', fade(u, 1.9), { 'font-size': 14 }); return; }
    if (k === 3) { const id = '7f3c9a…';
      server(400, 120, 'nginx', { s: 0.7 }); server(840, 120, 'app', { s: 0.7 });
      ln(450, 120, 790, 120, MUT, 2.5); fly(460, 100, 780, 100, seg(u, 0.3, 1.1), 'X-Request-ID: ' + id, { mono: true, stay: true });
      card(470, 290, 260, 70, { text: 'nginx access.json\n"request_id":"' + id + '"', fs: 13.5, mono: true, stroke: ACC, color: INK, s: pop(u, 1.2) });
      card(800, 290, 250, 70, { text: 'app log\nrequest_id=' + id, fs: 13.5, mono: true, stroke: ACC, color: INK, s: pop(u, 1.6) });
      ln(600, 290, 675, 290, ACC, 3, '6 4', fade(u, 2.0)); sub(640, 390, 'ID 값은 예시', fade(u, 2.1)); return; }
    if (k === 4) { terminal(340, 70, 590, 160, ['Active connections: 291', 'server accepts handled requests', ' 16630948 16630948 31070465', 'Reading: 6 Writing: 179 Waiting: 106'], E(u, 0.2, 1.5) * 4, { title: '/nginx_status', fs: 14 });
      mono(360, 290, 'allow 10.0.0.0/8;  deny all;  access_log off;', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.6) });
      note(360, 340, '밖에 열면 서버 규모와 트래픽이 드러난다', fade(u, 2.0), { fill: WARN, 'font-size': 14 }); return; }
    if (k === 5) { card(470, 140, 220, 80, { text: 'Active connections: 291\nReading: 6 …', fs: 13.5, mono: true, stroke: GRID });
      card(800, 140, 220, 80, { text: 'nginx_connections_\nactive 291', fs: 13.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 1.0) });
      grow(582, 140, 688, 140, E(u, 0.4, 1.0), INFO); mono(635, 120, 'exporter', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.5) });
      note(360, 270, 'scrape-uri 하나만 주면 텍스트가 시계열 메트릭이 된다', fade(u, 1.5), { 'font-size': 14 }); note(360, 300, '사이드카라 nginx 를 다시 빌드하지 않는다', fade(u, 1.9), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 6) { card(470, 110, 200, 60, { text: 'Grafana 12708', fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      [['5xx 비율 > 1%', WARN], ['p95 > 1s', WARN], ['cache hit < 50%', INFO]].forEach(([n, col], i) => { const y = 210 + i * 56; card(560, y, 300, 44, { rx: 22, text: n, fs: 14.5, stroke: col, color: col, s: pop(u, 0.8 + i * 0.4) }); });
      note(740, 120, '알람은 셋으로 시작한다', fade(u, 2.0), { 'font-size': 14 }); note(740, 146, '늘리기보다 오탐부터 줄인다', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    const days = Math.round(lerp(45, 29, E(u, 0.3, 1.6)));
    clock(450, 150, 60, 1 - days / 90, days <= 30 ? BAD : WARN); mono(450, 250, `만료까지 ${days}일`, { 'font-size': 16, 'font-weight': 800, fill: days <= 30 ? BAD : INK, 'text-anchor': 'middle' });
    if (days <= 30) pill(450, 300, '30일 전 알람', BAD, pop(u, 1.7), { fs: 14 });
    sub(450, 340, 'probe_ssl_earliest_cert_expiry', fade(u, 1.0), { 'font-size': 13.5 });
    ['access.json', 'access.json.1', 'access.json.2.gz'].forEach((f, i) => card(780, 110 + i * 56, 230, 42, { rx: 6, text: f, fs: 14, mono: true, stroke: i ? GRID : INFO, s: pop(u, 1.2 + i * 0.2) }));
    sub(780, 300, 'logrotate daily · compress', fade(u, 1.9), { 'font-size': 14 }); }

  // ---------- 5. 종합 48 ----------
  const AXK = ['perf', 'rel', 'sec', 'obs'];
  function s5(t, c) { const { k, u } = c;
    AXK.forEach((ax, a) => { const x0 = 20 + (a % 2) * 470, y0 = 20 + Math.floor(a / 2) * 165; zone(x0, y0, 450, 150, TITLE[ax], { stroke: Math.floor(k / 2) === a && k < 8 ? ACC : GRID, fill: PANEL });
      for (let i = 0; i < 12; i++) { const idx = a * 12 + i, half = i < 7 ? 0 : 1, beatOf = a * 2 + half, cx = x0 + 40 + (i % 6) * 72, cy = y0 + 60 + Math.floor(i / 6) * 50;
        const on = k === 8 || beatOf < k || (beatOf === k && u > 0.3 + (i - (half ? 7 : 0)) * 0.15), cur = beatOf === k;
        el('circle', { cx, cy, r: 17, fill: on ? (cur ? ACC : GOOD) : SOFT, stroke: cur ? ACC : GRID, 'stroke-width': 2 });
        mono(cx, cy + 5, String(i + 1), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? PANEL : MUT }); } });
    if (k < 8) { const ax = AXK[Math.floor(k / 2)], half = k % 2, names = NAMES[ax].slice(half ? 7 : 0, half ? 12 : 7);
      tx(20, 372, `${TITLE[ax]} ${half ? '8–12' : '1–7'}`, { 'font-size': 15, 'font-weight': 800, fill: ACC });
      tx(200, 372, names.join(' · '), { 'font-size': 14, opacity: fade(u, 0.5) });
      tx(20, 404, ['서버 자원 설정, 코드 배포 없이 바로', '응답 크기와 왕복 횟수를 줄인다', '타임아웃 · 재시도 · 상태 확인', '설정보다 운영 습관, 자동화해야 남는다', 'TLS 와 헤더, 점수가 여기서 갈린다', 'rate limit 과 real_ip 는 짝이다', '수집 경로 전체, 로그 · 메트릭이 먼저', '사람에게 닿는 마지막 구간'][k], { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) }); return; }
    [['ssllabs', 'A+'], ['securityheaders', 'A+'], ['observatory', 'A+'], ['hstspreload', '등록'], ['webpagetest', '성능']].forEach(([n, g], i) => { const x = 110 + i * 185, s = pop(u, 0.6 + i * 0.2);
      card(x, 375, 170, 44, { rx: 22, text: `${n} ${g}`, fs: 14, stroke: GOOD, color: GOOD, s }); }); }

  const quiz = [
    { q: 'worker_connections를 4096으로 올렸는데 동시 연결이 그보다 훨씬 적은 곳에서 막힌다. 먼저 볼 것은?',
      o: ['gzip_types 목록', 'worker_rlimit_nofile (FD 한도)', 'keepalive_timeout'], a: 1,
      why: '연결 하나가 파일 디스크립터 하나를 쓴다. FD 한도가 낮으면 worker_connections를 올려도 그 값에서 막힌다.' },
    { q: 'upstream에 keepalive 32를 넣었는데 백엔드 연결이 여전히 요청마다 새로 생긴다. 빠진 것은?',
      o: ['proxy_http_version 1.1과 Connection "" 헤더', 'max_fails=3', 'proxy_buffering off'], a: 0,
      why: '기본 HTTP/1.0과 Connection: close로 보내면 매번 연결이 끊긴다. 둘을 함께 바꿔야 연결을 다시 쓴다.' },
    { q: 'CDN 뒤의 nginx에서 로그인 rate limit이 엉뚱하게 걸린다. 짝으로 빠진 설정은?',
      o: ['server_tokens off', 'ssl_prefer_server_ciphers off', 'set_real_ip_from과 real_ip_header'], a: 2,
      why: '원래 IP를 복원하지 않으면 모든 요청이 CDN IP 하나로 세어진다. rate limit과 real_ip는 같이 설정한다.' },
    { q: 'nginx 로그와 애플리케이션 로그를 한 요청으로 이으려면 무엇이 필요한가?',
      o: ['stub_status를 켠다', '$request_id를 X-Request-ID 헤더로 넘기고 양쪽 로그에 남긴다', 'error_log를 debug로 둔다'], a: 1,
      why: 'nginx가 만든 요청 ID를 백엔드도 받아 자기 로그에 찍어야 같은 요청을 찾아 이을 수 있다.' },
    { q: '48개 항목이 실제 응답에 반영됐는지 마지막으로 확인하는 방법은?',
      o: ['nginx -t가 통과하는지 본다', '설정 파일 줄 수를 센다', 'ssllabs · securityheaders 같은 외부 채점에서 A+ 를 확인한다'], a: 2,
      why: 'nginx -t는 문법만 본다. 외부 도구가 실제 응답의 TLS와 헤더를 채점해야 반영 여부를 알 수 있다.' },
  ];
  const summary = [
    '운영 점검은 성능, 안정성, 보안, 관측 네 축에 12개씩 모두 48개다.',
    'worker_connections는 FD 한도와, upstream keepalive는 HTTP/1.1 설정과 함께 올린다.',
    '타임아웃과 max_fails로 죽은 노드를 빨리 빼고, 설정은 nginx -t를 거쳐 reload 한다.',
    'rate limit은 real_ip와 짝으로 걸고, 로그에 request_id를 넣어 요청을 끝까지 따라간다.',
  ];
  const review = [
    { q: 'SSE 알림이 몇십 초씩 늦게 뭉쳐서 온다. 점검표에서 먼저 볼 항목은?',
      o: ['그 location의 proxy_buffering이 켜져 있는지', 'gzip_types에 image/png가 있는지', 'worker_processes 값'], a: 0,
      why: '버퍼링이 켜져 있으면 응답을 모았다가 보낸다. 스트리밍 location은 proxy_buffering off로 따로 둔다.' },
    { q: '설정을 고친 뒤 nginx -s reload를 했는데 문법이 틀려 있었다. 서비스는 어떻게 되는가?',
      o: ['바로 내려간다', '옛 설정으로 계속 돌고, 오류는 로그에 남는다', '반쯤 새 설정이 적용된다'], a: 1,
      why: 'master는 새 설정을 검사하다 실패하면 되돌리고 옛 설정으로 계속 일한다. 그래도 -t를 먼저 돌려야 오류를 바로 본다.' },
    { q: '업로드가 413으로 실패해 proxy_send_timeout만 600s로 늘렸는데 그대로다. 무엇을 놓쳤나?',
      o: ['proxy_next_upstream_tries', 'keepalive 32', 'client_max_body_size'], a: 2,
      why: '413은 본문 크기 한도에 걸렸다는 뜻이다. 업로드 location에 client_max_body_size를 따로 올려야 한다.' },
  ];

  R.page({ title: '운영 점검판', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
