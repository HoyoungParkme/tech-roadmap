/* I-2-1 nginx.conf 구조 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, check, cross, lock } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const N = (v) => Math.round(v).toLocaleString('en-US');

  // 블록 트리: main ⊃ events, http ⊃ server ⊃ location. on = 지금 장면의 블록
  function tree(x, y, w, h, on, o) { o = o || {}; const op = o.op ?? 1, hi = (n) => (n === on ? ACC : GRID), fw = (n) => (n === on ? 3 : 1.8);
    const box = (bx, by, bw, bh, n) => { el('rect', { x: bx, y: by, width: bw, height: bh, rx: 8, fill: n === on ? ACCBG : 'none', stroke: hi(n), 'stroke-width': fw(n), opacity: op });
      mono(bx + 10, by + 19, n, { 'font-size': 14, 'font-weight': 800, fill: n === on ? ACC : MUT, opacity: op }); };
    box(x, y, w, h, 'main');
    box(x + 14, y + 30, w - 28, 34, 'events');
    box(x + 14, y + 74, w - 28, h - 88, 'http');
    box(x + 28, y + 104, w - 56, h - 132, 'server');
    box(x + 42, y + 134, w - 84, h - 176, 'location'); }

  // 1. main: worker 를 누가 몇 개, FD·PID, error_log 상속, load_module, 권한 분리
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { tree(690, 40, 240, 250, 'main', { op: fade(u, 0.2) });
      mono(40, 70, 'user www-data;', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(40, 100, 'worker_processes auto;', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.6) });
      card(300, 160, 180, 42, { text: 'master', fs: 15, stroke: INK, s: pop(u, 0.9) });
      for (let i = 0; i < 8; i++) { const x = 90 + i * 60, s = pop(u, 1.2 + i * 0.1); grow(300, 181, x, 248, E(u, 1.1 + i * 0.1, 1.4 + i * 0.1), MUT, { plain: true });
        card(x, 268, 52, 38, { text: 'w', fs: 14, stroke: ACC, color: ACC, fill: ACCBG, s }); }
      tx(40, 330, '코어 8개면 worker 8개 (예시) · 모두 www-data로 돈다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { for (let i = 0; i < 4; i++) { const y = 70 + i * 52, f = E(u, 0.2 + i * 0.12, 1.2 + i * 0.12);
        card(90, y, 90, 38, { text: 'worker', fs: 14, stroke: ACC, color: ACC, fill: ACCBG });
        el('rect', { x: 150, y: y - 9, width: 300, height: 18, rx: 4, fill: SOFT }); el('rect', { x: 150, y: y - 9, width: 300 * f, height: 18, rx: 4, fill: ACC, opacity: 0.8 }); }
      mono(150, 300, 'worker_rlimit_nofile 65535;', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.9) });
      tx(150, 326, 'worker 하나가 열 수 있는 FD 최대 65,535개', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      // PID 파일
      const s = pop(u, 1.5); el('path', { d: 'M640,90 h120 l30,30 v130 h-150 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.5, opacity: s });
      mono(715, 150, '/run/nginx.pid', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); tx(715, 186, 'master의 PID', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(715, 300, 'nginx -s reload가 이 번호로', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); tx(715, 322, 'master를 찾아 신호를 보낸다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    if (k === 2) { tree(420, 80, 480, 300, 'main');
      mono(40, 70, 'error_log … warn;', { 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.2) });
      const spots = [[620, 112], [620, 168], [620, 198], [620, 228]], names = ['events', 'http', 'server', 'location'];
      spots.forEach(([x, y], i) => { const a = 0.6 + i * 0.35; dot([[250, 64], [x, y]], seg(u, a, a + 0.5), WARN, 7);
        if (u > a + 0.5) pill(x + 160, y, 'warn 상속', WARN, pop(u, a + 0.5), { fs: 13.5, fill: PANEL }); });
      tx(40, 140, '아래 블록이 전부 물려받는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(40, 170, '안쪽에서 다시 적으면 거기서만 바뀐다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { tree(420, 80, 480, 300, 'main');
      ['brotli_filter.so', 'brotli_static.so'].forEach((s, i) => { const y = 70 + i * 44, a = 0.3 + i * 0.4; fly(60, y, 260, y, seg(u, a, a + 0.6), s, { mono: true, stay: true, fill: INFO }); });
      mono(40, 170, 'load_module modules/…so;', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(40, 196, 'main 맨 위, events·http보다 앞', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      lock(560, 240, u < 1.6, ACC, pop(u, 1.4)); mono(590, 246, 'brotli on;', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) });
      tx(40, 300, 'http 안에 load_module을 쓰면 문법 오류', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); return; }
    // k4: master root, worker www-data
    card(260, 120, 220, 56, { text: 'master · root', fs: 16, fw: 800, stroke: BAD, color: BAD, s: pop(u, 0.2) });
    [':80', ':443'].forEach((p, i) => { const x = 140 + i * 240; el('circle', { cx: x, cy: 40, r: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.5) }); mono(x + 22, 46, p, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.5) });
      grow(x, 56, 240 + i * 40, 92, E(u, 0.6, 1.0), INK, { plain: true }); });
    tx(420, 126, '1024 아래 포트를 열려면 root', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) });
    for (let i = 0; i < 4; i++) { const x = 120 + i * 140, s = pop(u, 1.2 + i * 0.12); grow(260, 148, x, 248, E(u, 1.1 + i * 0.1, 1.4 + i * 0.1), MUT, { plain: true });
      card(x, 272, 120, 46, { text: 'worker\nwww-data', fs: 13.5, stroke: ACC, color: ACC, fill: ACCBG, s }); }
    tx(40, 360, '요청을 직접 만지는 worker가 root가 아니어야 뚫려도 서버 전체로 번지지 않는다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // 2. events: epoll, worker 당 4096, accept, OS 별, 프록시는 FD 2배
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { tree(690, 40, 240, 250, 'events', { op: fade(u, 0.2) });
      mono(40, 80, 'events {', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(70, 112, 'use epoll;', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.6) }); mono(40, 144, '}', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.3) });
      for (let i = 0; i < 30; i++) { const x = 70 + (i % 10) * 44, y = 200 + Math.floor(i / 10) * 40, hot = [4, 13, 27].includes(i) && u > 1.3;
        el('rect', { x, y, width: 34, height: 28, rx: 5, fill: hot ? ACC : SOFT, stroke: hot ? ACC : GRID, opacity: fade(u, 0.8 + i * 0.01) }); }
      tx(70, 340, '연결 30개 중 준비된 3개만 돌려받는다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      tx(70, 368, 'Linux에서는 적지 않아도 epoll이 자동 선택된다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { mono(40, 60, 'worker_connections 4096;', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      const n = Math.round(lerp(0, 256, E(u, 0.4, 1.8)));
      for (let i = 0; i < 256; i++) { const x = 40 + (i % 32) * 18, y = 90 + Math.floor(i / 32) * 18; el('rect', { x, y, width: 14, height: 14, rx: 3, fill: i < n ? ACC : 'none', stroke: i < n ? 'none' : GRID }); }
      mono(640, 140, N(n * 16), { 'font-size': 30, 'font-weight': 800, fill: ACC }); tx(640, 170, '/ 4,096 연결 (칸 하나 = 16)', { 'font-size': 14, fill: MUT });
      tx(40, 280, 'worker 하나가 동시에 들 수 있는 연결(= FD) 수', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      mono(40, 320, '8 worker × 4,096 = 32,768 (8코어 예시)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { tx(40, 50, '새 연결 5개가 한꺼번에 도착', { 'font-size': 15, 'font-weight': 700 });
      [['multi_accept off', 120, false], ['multi_accept on', 240, true]].forEach(([lab, y, on]) => { mono(40, y - 30, lab, { 'font-size': 15, 'font-weight': 800, fill: on ? ACC : MUT });
        card(560, y, 110, 48, { text: 'worker', fs: 14, stroke: on ? ACC : MUT, color: on ? ACC : MUT, fill: on ? ACCBG : PANEL });
        for (let i = 0; i < 5; i++) { const a = on ? 0.4 : 0.4 + i * 0.42, g = E(u, a, a + 0.4); if (g >= 1) continue;
          el('circle', { cx: lerp(80 + i * 34, 500, g), cy: y, r: 9, fill: on ? ACC : INK }); }
        const got = on ? (u > 0.8 ? 5 : 0) : clamp(Math.floor((u - 0.4) / 0.42 + 0.05), 0, 5); mono(640, y + 6, '받음 ' + got, { 'font-size': 15, 'font-weight': 700, fill: on ? ACC : MUT }); });
      tx(40, 310, '깨어난 김에 대기열을 비운다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      mono(40, 350, 'accept_mutex off;  # 1.11.3부터 기본값', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      lock(450, 344, false, MUT, pop(u, 2.1)); return; }
    if (k === 3) { [['Linux 2.6+', 'epoll', ACC], ['FreeBSD · macOS', 'kqueue', INFO], ['오래된 시스템', 'select / poll', MUT]].forEach(([os, m, col], i) => { const y = 90 + i * 100;
        card(180, y, 220, 56, { text: os, fs: 16, stroke: INK, s: pop(u, 0.2 + i * 0.45) }); grow(292, y, 520, y, E(u, 0.5 + i * 0.45, 0.9 + i * 0.45), col);
        card(640, y, 220, 56, { text: m, fs: 17, mono: true, stroke: col, color: col, s: pop(u, 0.9 + i * 0.45) }); });
      tx(480, 390, 'use는 웬만하면 적지 않는다. OS에 맞는 최선을 고른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k4: 리버스 프록시는 사용자 하나에 FD 둘
    R.person(110, 150, '사용자', {}); card(480, 150, 140, 56, { text: 'nginx', fs: 17, fw: 800, stroke: ACC, color: ACC, fill: ACCBG }); R.server(830, 150, 'upstream', { s: 0.8 });
    grow(140, 150, 405, 150, E(u, 0.2, 0.8), INK, { plain: true }); grow(555, 150, 780, 150, E(u, 0.7, 1.3), INK, { plain: true });
    pill(270, 118, 'FD 1', INK, pop(u, 0.6), { mono: true }); pill(670, 118, 'FD 2', INK, pop(u, 1.1), { mono: true });
    const n = tween(32768, 16384, u - 1.0, 1.0);
    mono(480, 290, '32,768 FD ÷ 2 =', { 'text-anchor': 'end', 'font-size': 18, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.3) });
    mono(496, 290, N(u < 1.3 ? 32768 : n) + ' 명', { 'font-size': 26, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.3) });
    tx(480, 350, 'worker_rlimit_nofile이 worker_connections보다 넉넉한지 확인', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // 3. http: MIME 조회, 로그 한 줄, sendfile, gzip, upstream, include
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { tree(690, 40, 240, 250, 'http', { op: fade(u, 0.2) });
      const rows = [['text/html', 'html htm'], ['text/css', 'css'], ['application/javascript', 'js'], ['image/png', 'png']];
      tx(40, 50, '/etc/nginx/mime.types', { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' });
      rows.forEach(([ty, ex], i) => { const y = 70 + i * 36, hot = i === 1 && u > 1.0; el('rect', { x: 40, y, width: 420, height: 30, rx: 5, fill: hot ? ACCBG : SOFT, stroke: hot ? ACC : 'none', opacity: fade(u, 0.2 + i * 0.1) });
        mono(52, y + 21, ty, { 'font-size': 14.5, 'font-weight': hot ? 800 : 500, fill: hot ? ACC : INK, opacity: fade(u, 0.2 + i * 0.1) }); mono(448, y + 21, ex, { 'font-size': 14.5, 'text-anchor': 'end', fill: hot ? ACC : MUT, opacity: fade(u, 0.2 + i * 0.1) }); });
      fly(40, 250, 300, 250, seg(u, 0.4, 1.0), '/app.css', { mono: true, stay: true });
      mono(370, 255, '→ text/css', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) });
      fly(40, 310, 300, 310, seg(u, 1.4, 2.0), '/data.xyz', { mono: true, stay: true, fill: WARN });
      mono(370, 315, '→ application/octet-stream', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.1) });
      tx(370, 340, '표에 없으면 default_type', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { const rows = [[['203.0.113.7', '$remote_addr'], ['-', '$remote_user'], ['[19/May/2026:11:30:00 +0900]', '$time_local'], ['"GET /index.html HTTP/1.1"', '$request']],
        [['200', '$status'], ['615', '$body_bytes_sent'], ['"-"', '$http_referer'], ['"curl/8.5.0"', '$http_user_agent']]];
      tx(40, 50, 'log_format main → access_log … main;  한 줄이 이렇게 찍힌다 (예시)', { 'font-size': 14.5, 'font-weight': 700 });
      tx(40, 78, '공백으로 나뉜 칸마다 변수 하나 (한 줄을 두 줄로 접어 보임)', { 'font-size': 13.5, fill: MUT });
      let fi = 0; const fs = 14.5;
      rows.forEach((row, ri) => { const y = 160 + ri * 110; let x = 40;
        el('rect', { x: 28, y: y - 24, width: 904, height: 36, rx: 6, fill: SOFT });
        row.forEach(([v, name]) => { const w = tw(v, fs), lw = tw(name, 13.5), slot = Math.max(w, lw) + 28, a = 0.3 + fi * 0.25, op = fade(u, a), col = [ACC, INFO, WARN][fi % 3];
          mono(x, y, v, { 'font-size': fs, 'font-weight': 700, fill: col, opacity: Math.max(0.35, op) });
          el('path', { d: `M${x},${y + 8} v6 h${w} v-6`, fill: 'none', stroke: col, 'stroke-width': 1.5, opacity: op });
          mono(x, y + 34, name, { 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: op }); x += slot; fi++; }); });
      tx(40, 380, 'log_format은 http에서만 정의, access_log는 server·location에서 바꿀 수 있다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 2) { const lanes = [['read + write', 90, ['디스크', '커널', 'nginx', '커널', '소켓']], ['sendfile on', 220, ['디스크', '커널', '소켓']]];
      lanes.forEach(([n, y, st], li) => { mono(40, y - 34, n, { 'font-size': 15, 'font-weight': 800, fill: li ? ACC : MUT });
        const xs = st.map((_, i) => 80 + (i * 640) / (st.length - 1));
        st.forEach((s, i) => card(xs[i], y, s === 'nginx' ? 96 : 84, 40, { text: s, fs: 14, stroke: s === 'nginx' ? WARN : li ? ACC : MUT, color: s === 'nginx' ? WARN : INK, sw: 2 }));
        dot(xs.map((x) => [x, y]), seg(u, 0.3 + li * 0.2, 1.6 + li * 0.2), li ? ACC : MUT, 8); });
      tx(80, 290, '파일 내용이 nginx를 거치지 않고 커널 안에서 바로 나간다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.7) });
      mono(80, 340, 'Server: nginx/1.27.3', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0), 'text-decoration': u > 2.3 ? 'line-through' : null });
      mono(380, 340, '→ Server: nginx', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) });
      mono(600, 340, '(server_tokens off)', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { const rows = [['text/html', true, '기본 포함'], ['text/css', true, 'gzip_types'], ['application/javascript', true, 'gzip_types'], ['application/json', true, 'gzip_types'], ['image/png', false, '그대로']];
      mono(40, 46, 'gzip on;  gzip_types text/plain text/css application/javascript application/json;', { 'font-size': 13.5, 'font-weight': 700 });
      rows.forEach(([ty, z, why], i) => { const y = 76 + i * 56, sh = z ? E(u, 0.6 + i * 0.25, 1.2 + i * 0.25) : 0, w = 360 * (1 - 0.6 * sh);
        mono(40, y + 22, ty, { 'font-size': 14.5, 'font-weight': 700 });
        el('rect', { x: 260, y: y + 4, width: w, height: 26, rx: 5, fill: z ? ACC : OFF, opacity: 0.85 });
        tx(260 + w + 12, y + 22, why, { 'font-size': 14, fill: z ? ACC : MUT, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.25) }); });
      tx(40, 380, 'gzip on만 켜면 text/html만 줄어든다. 막대 길이는 그림일 뿐 실제 비율 아님', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { zone(40, 40, 420, 330, 'http', { stroke: ACC, fill: 'none', color: ACC });
      zone(70, 80, 360, 150, 'upstream backend', { fill: ACCBG, color: ACC, op: fade(u, 0.2) });
      [['app1:8000', 130], ['app2:8000', 190]].forEach(([s, y], i) => { mono(100, y + 5, 'server ' + s + ';', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.3) }); R.server(760, 100 + i * 150, s, { s: 0.7 * pop(u, 0.6 + i * 0.3) }); });
      zone(70, 260, 360, 90, 'server', { fill: SOFT, op: fade(u, 1.0) }); mono(100, 320, 'proxy_pass http://backend;', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      grow(430, 300, 700, 120, E(u, 1.4, 1.9), ACC); grow(430, 310, 700, 260, E(u, 1.6, 2.1), ACC);
      tx(470, 395, 'upstream은 http 바로 아래에서만 선언한다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.2), 'text-anchor': 'middle' }); return; }
    zone(420, 40, 500, 340, 'http { … }', { stroke: ACC, fill: 'none', color: ACC });
    mono(440, 92, 'include /etc/nginx/conf.d/*.conf;', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
    ['api.example.com.conf', 'files.example.com.conf', 'default.conf'].forEach((f, i) => { const y = 140 + i * 66, g = E(u, 0.4 + i * 0.4, 1.0 + i * 0.4);
      card(lerp(190, 670, g), y, 250, 46, { rx: 8, text: f, fs: 14, mono: true, stroke: g >= 1 ? ACC : INK, color: g >= 1 ? ACC : INK, fill: g >= 1 ? ACCBG : PANEL }); });
    tx(40, 60, 'conf.d/', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    tx(670, 360, '가상 호스트마다 파일 하나', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }

  // 4. server: listen 포트와 Host 헤더로 server 블록 하나를 고른다
  const SV = [{ y: 70, name: 'listen 80 default_server', sn: 'server_name _', act: 'return 444' }, { y: 200, name: 'listen 443 ssl', sn: 'api.example.com', act: 'location /v1/ · /health' }, { y: 330, name: 'listen 80', sn: 'www.example.com example.com', act: 'return 301 https://…' }];
  function servers(hot, op) { SV.forEach((s, i) => { const on = i === hot; card(720, s.y, 400, 100, { rx: 10, stroke: on ? ACC : GRID, sw: on ? 3 : 1.8, fill: on ? ACCBG : PANEL, op: op ?? 1 });
    mono(536, s.y - 22, s.name, { 'font-size': 14, 'font-weight': 700, fill: on ? ACC : MUT }); mono(536, s.y + 6, s.sn, { 'font-size': 15, 'font-weight': 800, fill: on ? INK : MUT });
    mono(536, s.y + 34, s.act, { 'font-size': 13.5, fill: on ? ACC : MUT }); }); }
  function req(y, host, port, u, a, to) { const g = E(u, a, a + 0.8); card(170, y, 260, 56, { rx: 10, stroke: INK, sw: 2 });
    mono(54, y - 5, 'Host: ' + host, { 'font-size': 14, 'font-weight': 700 }); mono(54, y + 17, '포트 ' + port, { 'font-size': 13.5, fill: MUT });
    if (to != null) { grow(302, y, 512, SV[to].y, g, ACC); } }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { servers(u > 1.0 ? 0 : -1); req(70, '203.0.113.7', 80, u, 0.3, 0);
      tx(54, 170, '어떤 이름에도 안 맞는 요청', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      cross(300, 260, 18, pop(u, 1.6)); tx(54, 268, '444: 응답 없이 연결을 끊는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      tx(54, 300, 'IP로 두드리는 스캐너를 여기서 막는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { servers(u > 1.0 ? 1 : -1); req(200, 'api.example.com', 443, u, 0.3, 1);
      ['fullchain.pem', 'privkey.pem'].forEach((f, i) => { lock(80 + i * 170, 320, true, ACC, pop(u, 1.4 + i * 0.3)); mono(104 + i * 170, 326, f, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.5 + i * 0.3) }); });
      tx(54, 380, '인증서 도메인 = server_name 이어야 경고가 없다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { zone(40, 40, 880, 340, 'server · api.example.com', { fill: ACCBG, color: ACC });
      card(300, 130, 300, 56, { text: 'location /v1/', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) }); R.server(760, 130, 'backend', { s: 0.7 });
      fly(130, 130, 700, 130, seg(u, 0.5, 1.4), 'GET /v1/users', { mono: true });
      card(300, 280, 300, 56, { text: 'location /health', fs: 16, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.2) });
      fly(130, 280, 440, 280, seg(u, 1.4, 1.9), 'GET /health', { mono: true, fill: GOOD });
      fly(440, 330, 130, 330, seg(u, 2.0, 2.5), '200 "ok"', { mono: true, fill: GOOD, stay: true });
      tx(520, 290, '백엔드까지 안 가고 nginx가 바로 답한다', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { servers(u > 1.0 ? 2 : -1); req(330, 'example.com', 80, u, 0.3, 2);
      mono(54, 120, 'GET /a?b=1', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(54, 190, '301 Location:', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4) });
      mono(54, 216, 'https://example.com/a?b=1', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) });
      tx(54, 250, '$request_uri가 경로·쿼리를 그대로 옮긴다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k4: 고르는 순서 (체)
    const stg = ['listen 포트가 맞는 server만', '① 정확한 이름', '② *.example.com (앞 와일드카드)', '③ mail.* (뒤 와일드카드)', '④ 정규식 ~^api\\d+', '⑤ default_server / 첫 server'];
    stg.forEach((s, i) => { const y = 50 + i * 58; card(300, y, 400, 44, { rx: 8, text: s, fs: 14.5, stroke: i === 0 ? INFO : GRID, color: i === 0 ? INFO : INK, sw: 1.8, s: pop(u, 0.1 + i * 0.08) }); });
    const path = (stop) => [...Array(stop + 1)].map((_, i) => [520, 50 + i * 58]);
    dot([[520, 20]].concat(path(1)), seg(u, 0.7, 1.4), ACC, 8); if (u > 1.4) { pill(700, 108, 'example.com:80 → ①에서 멈춤', ACC, pop(u, 1.4), { fs: 13.5 }); }
    dot([[560, 20]].concat(path(5).map(([x, y]) => [560, y])), seg(u, 1.5, 2.4), WARN, 8); if (u > 2.4) pill(720, 340, '203.0.113.7:80 → ⑤', WARN, pop(u, 2.4), { fs: 13.5 }); }

  // 5. location: 고르는 엔진 (= → 가장 긴 prefix → ^~ 면 끝 → 정규식 순서대로 → 기억한 prefix)
  const LOC = [['=', '/favicon.ico', 'log 끔'], ['^~', '/static/', 'expires 1y'], ['~*', '\\.(jpg|jpeg|png|gif|webp)$', 'expires 30d'], ['', '/api/', 'proxy_pass'], ['', '/api/internal/', 'deny all'], ['', '/', 'try_files … /index.html']];
  function pick(uri) { const ex = LOC.findIndex(([m, p]) => m === '=' && uri === p); if (ex >= 0) return { ex, best: -1, rx: -1, win: ex };
    let best = -1; LOC.forEach(([m, p], i) => { if ((m === '' || m === '^~') && uri.startsWith(p) && (best < 0 || p.length > LOC[best][1].length)) best = i; });
    if (best >= 0 && LOC[best][0] === '^~') return { ex: -1, best, rx: -2, win: best };
    const rx = LOC.findIndex(([m, p]) => (m === '~' || m === '~*') && new RegExp(p, m === '~*' ? 'i' : '').test(uri));
    return { ex: -1, best, rx, win: rx >= 0 ? rx : best }; }
  function engine(uri, u, note) { const r = pick(uri), y0 = 92, rh = 46;
    pill(240, 40, 'GET ' + uri, INK, pop(u, 0.1), { mono: true, fs: 15 });
    LOC.forEach(([m, p, act], i) => { const y = y0 + i * rh, isPre = m === '' || m === '^~', isRx = m === '~' || m === '~*';
      let st = 'idle';
      if (u > 0.4 && m === '=') st = r.ex === i ? 'win' : 'no';
      if (u > 0.9 && isPre && r.ex < 0) st = i === r.best ? 'keep' : uri.startsWith(p) ? 'cand' : 'no';
      if (u > 1.5 && isRx && r.ex < 0) st = r.rx === -2 ? 'skip' : r.rx === i ? 'win' : 'no';
      if (u > 2.0 && i === r.win) st = 'win';
      const col = { idle: GRID, no: GRID, cand: INFO, keep: WARN, skip: OFF, win: ACC }[st];
      el('rect', { x: 30, y: y - 18, width: 450, height: 38, rx: 7, fill: st === 'win' ? ACCBG : st === 'keep' ? 'var(--warnbg)' : PANEL, stroke: col, 'stroke-width': st === 'idle' || st === 'no' ? 1.5 : 2.6, opacity: st === 'no' || st === 'skip' ? 0.55 : 1 });
      mono(44, y + 6, m || '·', { 'font-size': 15, 'font-weight': 800, fill: m ? INFO : MUT }); mono(84, y + 6, p, { 'font-size': 14.5, 'font-weight': 700, fill: st === 'no' || st === 'skip' ? MUT : INK, 'text-decoration': st === 'skip' ? 'line-through' : null });
      mono(470, y + 6, act, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT }); });
    const steps = [[0.4, r.ex >= 0 ? '① = 일치 → 여기서 끝' : '① = 일치 없음'], [0.9, r.ex >= 0 ? '' : '② 가장 긴 prefix 기억: ' + LOC[r.best][1]], [1.5, r.ex >= 0 ? '' : r.rx === -2 ? '③ ^~ 라서 정규식은 안 본다' : r.rx >= 0 ? '③ 정규식이 맞음 → 정규식이 이긴다' : '③ 맞는 정규식 없음 → 기억한 prefix'], [2.0, '결과: ' + (LOC[r.win][0] ? LOC[r.win][0] + ' ' : '') + LOC[r.win][1]]];
    steps.forEach(([a, s], i) => { if (s) tx(520, 110 + i * 46, s, { 'font-size': i === 3 ? 16 : 14.5, 'font-weight': i === 3 ? 800 : 700, fill: i === 3 ? ACC : INK, opacity: fade(u, a) }); });
    if (note) tx(520, 330, note[0], { 'font-size': 14.5, 'font-weight': 700, fill: note[1] || MUT, opacity: fade(u, 2.3) }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tree(690, 40, 240, 250, 'location', { op: fade(u, 0.2) });
      mono(40, 70, 'server { root /var/www/html; … }', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
      fly(60, 160, 300, 160, seg(u, 0.6, 1.2), 'GET /about', { mono: true, stay: true });
      mono(60, 240, '/var/www/html', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) }); mono(60 + tw('/var/www/html', 20), 240, '/about', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.6) });
      tx(60, 290, '안쪽 location 들이 이 root를 물려받는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    const cases = [null, ['/favicon.ico', ['= 는 글자까지 같을 때만, 맞으면 바로 끝']], ['/static/logo.PNG', ['.PNG 라도 이미지 정규식까지 가지 않는다', WARN]], ['/img/cat.JPG', ['~* 는 대소문자를 가리지 않는다']], ['/api/internal/keys', ['선언 순서가 아니라 길이로 이긴다']], ['/api/internal/x.png', ['deny all이 건너뛰어졌다. ^~ 로 막는다', BAD]], ['/about', ['가장 짧은 /는 늘 마지막 그물']], ['/api/v1/users', ['프록시로 넘어간다', ACC]]];
    engine(cases[k][0], u, cases[k][1]); }

  const quiz = [
    { q: 'nginx가 80번 포트를 열 수 있는데도 요청을 처리하는 worker는 www-data로 도는 까닭은 무엇인가?',
      o: ['포트는 root인 master가 열고, worker는 권한을 내려 뚫려도 피해를 줄이려고', 'www-data가 root보다 빨라서', 'worker는 포트를 쓰지 않아서'], a: 0,
      why: '1024 아래 포트를 여는 일만 root가 필요하다. master가 열어 두고 worker는 user 지시자의 계정으로 내려간다.' },
    { q: 'worker 8개, worker_connections 4096인 리버스 프록시가 동시에 받을 수 있는 사용자는 대략 몇 명인가?',
      o: ['32,768명', '16,384명', '4,096명'], a: 1,
      why: '전체 FD는 8 × 4096 = 32,768이지만 사용자 하나에 클라이언트 쪽과 upstream 쪽 연결이 둘 필요해서 절반인 16,384명이다.' },
    { q: 'gzip on만 켜고 gzip_types를 적지 않으면 어떤 응답이 압축되는가?',
      o: ['text/html만', '모든 텍스트 응답', '이미지까지 전부'], a: 0,
      why: 'gzip_types의 기본값은 text/html 하나다. css·js·json은 gzip_types에 적어야 줄어든다.' },
    { q: 'Host 헤더가 IP 주소 203.0.113.7인 요청이 80번 포트로 오면 어느 server가 받는가?',
      o: ['server_name이 example.com인 server', '80번 포트의 default_server', '443번 포트의 server'], a: 1,
      why: '먼저 포트가 맞는 server 들만 남기고 이름을 본다. 맞는 이름이 없으면 그 포트의 default_server(없으면 첫 server)가 받는다.' },
    { q: 'location ^~ /static/과 location ~* \\.png$ 가 있을 때 GET /static/logo.PNG는 어디로 가는가?',
      o: ['~* \\.png$ (정규식이 항상 이긴다)', '둘 다 아니고 location /', '^~ /static/'], a: 2,
      why: '가장 긴 prefix가 ^~ 면 정규식 검사를 건너뛴다. 그래서 .PNG 라도 /static/이 받는다.' },
  ];

  const summary = [
    'nginx.conf는 main 안에 events와 http가 있고 http 안에 server, 그 안에 location이 있다.',
    '바깥 블록에 적은 값은 안쪽이 물려받고, 안쪽에서 다시 적으면 거기서만 바뀐다.',
    '요청은 listen 포트로 server를 거르고, Host 헤더를 server_name과 맞춰 하나를 고른다.',
    'location은 = 일치, 가장 긴 prefix, ^~ 여부, 정규식 순서를 거쳐 하나가 정해진다.',
  ];
  const review = [
    { q: 'location /api/internal/ { deny all; }을 넣었는데 /api/internal/report.png가 그대로 열린다. 먼저 고칠 것은?',
      o: ['deny를 location /로 옮긴다', 'location ^~ /api/internal/로 바꾼다', 'worker_connections를 늘린다'], a: 1,
      why: '가장 긴 prefix를 기억한 뒤 정규식을 보는데, 이미지 정규식이 맞아 이겼다. ^~ 를 붙이면 정규식 검사를 건너뛴다.' },
    { q: 'http 블록에 error_log … warn을 두고 한 server 에만 error_log … debug를 적었다. 다른 server 들의 로그 수준은?',
      o: ['모두 debug가 된다', '로그가 꺼진다', '그대로 warn이다'], a: 2,
      why: '안쪽에서 다시 적은 값은 그 블록 안에서만 바깥 값을 덮는다. 나머지 server는 http의 warn을 물려받는다.' },
    { q: 'api.example.com 용 server를 새로 만들었는데 브라우저로 열면 다른 사이트가 뜬다. 먼저 확인할 것은?',
      o: ['그 server의 listen 포트가 요청 포트와 같은지와 server_name 철자', 'gzip_types 설정', 'mime.types include 여부'], a: 0,
      why: 'server는 포트로 먼저 걸러지고 Host 헤더와 server_name이 맞아야 선택된다. 둘 중 하나가 어긋나면 default_server나 첫 server가 받는다.' },
  ];

  R.page({ title: '설정 블록 트리와 요청 길 찾기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
