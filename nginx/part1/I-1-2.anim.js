/* I-1-2 설치 + 첫 페이지 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, check, cross, lock, terminal, browser } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const CMD = '$ docker run -d --name web -p 80:80 nginx:1.27-alpine';

  // 호스트 상자 안의 컨테이너 web (nginx master + worker)
  function hostBox(o) { o = o || {};
    zone(30, 180, 900, 220, '호스트 (내 컴퓨터)', { fill: SOFT });
    el('circle', { cx: 30, cy: 300, r: 15, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); mono(30, 338, ':80', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
    const s = o.s ?? 1; if (s <= 0) return;
    card(660, 300, 440, 170, { rx: 12, stroke: ACC, sw: 2.5, fill: PANEL, s });
    if (s < 1) return;
    tx(456, 236, '컨테이너 web · nginx:1.27-alpine', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    mono(456, 300, ':80', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    if (o.procs) { card(640, 280, 150, 36, { text: 'master', fs: 14, stroke: INK, s: o.procs[0] }); card(790, 280, 110, 36, { text: 'worker', fs: 14, stroke: ACC, color: ACC, fill: ACCBG, s: o.procs[1] }); mono(790, 320, 'pid 30', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: o.procs[1] }); } }

  // 1. docker run 한 줄
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { terminal(30, 20, 900, 130, [CMD, ['Unable to find image locally · Pulling …', 'var(--term)']], u < 0.3 ? 0 : Math.min(2, lerp(0.01, 2, E(u, 0.3, 1.4))), { title: 'bash', fs: 14.5 });
      const g = E(u, 1.3, 2.0); el('rect', { x: 46, y: 118, width: 400, height: 10, rx: 4, fill: 'var(--off)', opacity: 0.4 }); el('rect', { x: 46, y: 118, width: 400 * g, height: 10, rx: 4, fill: ACC });
      mono(456, 128, g >= 1 ? '받기 완료' : '이미지 받는 중', { 'font-size': 13.5, fill: 'var(--term)' });
      hostBox({ s: pop(u, 2.0) }); return; }
    if (k === 1) { const parts = [['-d', '백그라운드로', INFO], ['--name web', '이름은 web', INK], ['-p 80:80', '호스트 80 → 컨테이너 80', ACC], ['nginx:1.27-alpine', '이미지 (약 22MB, 예시)', WARN]];
      let x = 60; parts.forEach(([s, d, col], i) => { const w = tw(s, 16) + 30, a = 0.2 + i * 0.35, dy = lerp(0, 16, E(u, a, a + 0.4));
        card(x + w / 2, 56 + dy, w, 38, { rx: 8, text: s, fs: 16, mono: true, stroke: col, color: col, sw: 2 });
        tx(x + w / 2, 110 + dy, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: fade(u, a + 0.2) }); x += w + 50; });
      hostBox({});
      grow(46, 300, 440, 300, E(u, 1.6, 2.3), ACC, { sw: 3 });
      tx(240, 288, '왼쪽 = 호스트, 오른쪽 = 컨테이너', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { terminal(30, 20, 900, 70, ['$ docker ps'], 1, { title: 'bash', fs: 14.5 });
      const cols = [['CONTAINER ID', '7a3f9e1c', 130], ['IMAGE', 'nginx:1.27-alpine', 190], ['COMMAND', '"/docker-entrypoint…"', 210], ['STATUS', 'Up 5 seconds', 150], ['PORTS', '0.0.0.0:80->80/tcp', 190]];
      let x = 40; cols.forEach(([h, v, w], i) => { const hot = i >= 3, f = fade(u, 0.3 + i * 0.25);
        el('rect', { x, y: 120, width: w - 6, height: 36, rx: 6, fill: SOFT, opacity: f }); tx(x + 10, 144, h, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: f });
        el('rect', { x, y: 162, width: w - 6, height: 44, rx: 6, fill: hot ? (i === 3 ? 'var(--goodbg)' : ACCBG) : PANEL, stroke: hot ? (i === 3 ? GOOD : ACC) : GRID, 'stroke-width': hot ? 2.5 : 1.5, opacity: f });
        mono(x + 10, 189, v, { 'font-size': 13.5, 'font-weight': hot ? 800 : 500, fill: hot ? (i === 3 ? GOOD : ACC) : INK, opacity: f }); x += w; });
      tx(40, 260, 'STATUS가 Up이면 떠 있다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      tx(40, 292, 'PORTS 칸이 비어 있으면 -p를 빠뜨린 것: 떠 있어도 접속은 안 된다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) }); return; }
    const L = ['$ docker logs -f web', '/docker-entrypoint.sh: Looking for shell scripts…', ['nginx: using the "epoll" event method', '#7dd3c0'], 'start worker processes', ['start worker process 30', '#7dd3c0']];
    terminal(30, 20, 900, 150, L, lerp(1, 5, E(u, 0.2, 1.6)), { title: 'bash', fs: 14 });
    hostBox({ procs: [pop(u, 1.0), pop(u, 1.7)] }); }

  // 2. curl -i: 요청 하나가 가고, 상태줄·헤더·본문이 돌아온다
  const HDR = [['Server', 'nginx/1.27.3'], ['Content-Type', 'text/html'], ['Content-Length', '615'], ['Last-Modified', 'Tue, 13 Aug 2024 14:48:18 GMT'], ['ETag', '"66bb7232-267"'], ['Connection', 'keep-alive'], ['Accept-Ranges', 'bytes']];
  function ends() { R.person(70, 200, 'curl', {}); card(880, 200, 120, 64, { text: 'nginx', fs: 17, fw: 800, stroke: ACC, color: ACC, fill: ACCBG }); }
  function s2(t, c) { const { k, u } = c;
    ends();
    if (k === 0) { el('line', { x1: 110, y1: 200, x2: 815, y2: 200, stroke: GRID, 'stroke-width': 2 });
      fly(130, 200, 700, 200, seg(u, 0.4, 1.6), 'GET / HTTP/1.1', { mono: true, stay: true });
      mono(250, 120, '$ curl -i http://localhost/', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(250, 280, 'Host: localhost', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) });
      tx(250, 320, '-i: 응답 헤더와 본문을 함께 출력', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { fly(800, 200, 300, 120, seg(u, 0.2, 1.0), 'HTTP/1.1 200 OK', { mono: true, fill: GOOD, stay: true });
      mono(250, 200, 'Server: nginx/1.27.3', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      mono(250, 236, 'Content-Type: text/html', { 'font-size': 16, opacity: fade(u, 1.5) });
      tx(250, 300, '받은 쪽이 nginx라는 표시, 버전까지 보인다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { [HDR[2], HDR[3], HDR[5], HDR[6], HDR[4]].forEach(([h, v], i) => { const y = 70 + i * 34, op = fade(u, 0.2 + i * 0.2);
        mono(180, y, h + ':', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: op }); mono(340, y, v, { 'font-size': 15, 'font-weight': 700, opacity: op }); });
      // ETag = 수정 시각(16진) - 크기(16진)
      const ex = 340 + tw('"', 15), w1 = tw('66bb7232', 15), w2 = tw('267', 15), x2 = ex + w1 + tw('-', 15), y = 214;
      el('path', { d: `M${ex},${y} v8 h${w1} v-8`, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.4) });
      el('path', { d: `M${x2},${y} v8 h${w2} v-8`, fill: 'none', stroke: INFO, 'stroke-width': 2, opacity: fade(u, 1.8) });
      tx(ex, y + 32, '수정 시각 (16진수)', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
      tx(x2 + 30, y + 58, '0x267 = 615 바이트', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.9) });
      el('line', { x1: x2 + w2 / 2, y1: y + 8, x2: x2 + 40, y2: y + 42, stroke: INFO, 'stroke-width': 1.5, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { browser(470, 215, 560, 270, null, { s: pop(u, 0.2) });
      tx(210, 140, 'Welcome to nginx!', { 'font-size': 26, 'font-weight': 800, opacity: fade(u, 0.7) });
      tx(210, 190, 'If you see this page, the nginx web server is', { 'font-size': 15, opacity: fade(u, 1.1) });
      tx(210, 214, 'successfully installed and working.', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.3) });
      tx(210, 238, 'Further configuration is required.', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) });
      mono(470, 380, '/usr/share/nginx/html/index.html · 615 bytes', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    [['Server', '어떤 서버인가'], ['Content-Length', '본문 몇 바이트'], ['ETag', '바뀌었나 (캐시 키)'], ['Last-Modified', '파일 수정 시각'], ['Connection', 'TCP 연결 재사용']].forEach(([h, m], i) => {
      const y = 70 + i * 54, s = pop(u, 0.2 + i * 0.35); check(195, y - 5, 10, s);
      mono(220, y, h, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.35) }); tx(450, y, m, { 'font-size': 15, fill: MUT, 'font-weight': 600, opacity: fade(u, 0.3 + i * 0.35) }); }); }

  // 3. webroot 와 마운트: 호스트 폴더가 컨테이너 폴더 위를 가린다
  function fileRow(x, y, name, o) { o = o || {}; el('rect', { x, y: y - 16, width: 18, height: 22, rx: 3, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 28, y, name, { 'font-size': 15, 'font-weight': 700, fill: o.col || INK, opacity: o.op ?? 1, 'text-decoration': o.strike ? 'line-through' : null }); }
  function folder(x, y, w, h, title, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.col || INK, 'stroke-width': 2.5, opacity: o.op ?? 1 });
    el('path', { d: `M${x + 10},${y} v-12 h80 l10,12`, fill: o.fill || PANEL, stroke: o.col || INK, 'stroke-width': 2.5, opacity: o.op ?? 1 });
    mono(x + 14, y + 26, title, { 'font-size': 14.5, 'font-weight': 700, fill: o.col || MUT, opacity: o.op ?? 1 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 4) { folder(480, 110, 400, 150, '/usr/share/nginx/html', { col: ACC }); fileRow(510, 180, 'index.html', { col: ACC }); lock(840, 140, true, ACC, 1);
      card(150, 185, 160, 60, { text: 'nginx (컨테이너)', fs: 15, stroke: INK });
      grow(232, 185, 470, 185, E(u, 0.3, 1.0), BAD); cross(360, 185, 14, pop(u, 1.0));
      mono(480, 310, 'Read-only file system', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) });
      tx(480, 350, '정적 서빙은 읽기만 하면 된다. 컨테이너가 호스트 파일을 못 바꾼다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    tx(60, 46, '호스트', { 'font-size': 15, 'font-weight': 800 }); tx(500, 46, '컨테이너 web', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    // 컨테이너 webroot
    const cov = k === 2 ? E(u, 0.4, 1.6) : k >= 3 ? 1 : 0;
    if (cov < 1) { folder(500, 90, 400, 150, '/usr/share/nginx/html', { col: MUT, op: 1 - E(cov, 0.75, 1) });
      fileRow(530, 160, 'index.html', { op: k === 0 ? fade(u, 0.4) : 1 - E(cov, 0.85, 1) }); fileRow(530, 200, '50x.html', { op: k === 0 ? fade(u, 0.7) : 1 - E(cov, 0.85, 1) }); }
    if (k >= 2) mono(500, 262, '/usr/share/nginx/html 자리 · 원본 두 파일은 아래에 가려짐', { 'font-size': 13.5, fill: MUT, opacity: k === 2 ? fade(u, 1.5) : 1 });
    if (k === 0) { tx(500, 290, '기본 webroot: 파일 두 개뿐', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(500, 318, '50x.html = 백엔드 오류 때 보여 줄 기본 에러 페이지', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) }); }
    if (k === 1) { folder(60, 90, 330, 150, './public', { col: INK, op: fade(u, 0.2) });
      fileRow(90, 160, 'index.html', { op: fade(u, 0.7) });
      mono(90, 200, '<h1>Hello Nginx</h1>', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) }); }
    if (k >= 2) { el('rect', { x: 60, y: 90, width: 330, height: 150, rx: 10, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      mono(74, 116, './public', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: k === 2 ? E(u, 1.0, 1.3) : 1 }); }
    if (k === 1) {
      if (k === 1) tx(60, 300, '호스트에서 바로 고치는 배포 대상 폴더', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) }); }
    if (k >= 2) { // 호스트 폴더 그림자가 컨테이너 폴더 위로 미끄러져 덮는다
      const x = lerp(60, 500, cov);
      el('rect', { x, y: 90, width: 400, height: 150, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: 0.92 });
      mono(x + 14, 116, '-v ./public:…/html:ro', { 'font-size': 14, 'font-weight': 700, fill: ACC });
      fileRow(x + 30, 170, 'index.html', { col: ACC }); lock(x + 370, 120, true, ACC, cov);
      if (k === 2) { tx(500, 310, '덮어쓰기가 아니라 가리기: 원본은 이미지 안에 그대로 있다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); } }
    if (k === 3) { mono(60, 300, '$ curl http://localhost/', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      fly(500, 300, 360, 340, seg(u, 0.6, 1.4), '<h1>Hello Nginx</h1>', { mono: true, stay: true });
      tx(560, 345, 'Welcome 대신 새 파일이 나온다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      tx(560, 372, '컨테이너를 다시 만들 필요 없음', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); } }

  // 4. conf 들여다보기: nginx.conf 블록 안에 conf.d/default.conf 가 끼워진다
  function blk(x, y, w, h, name, col, op) { el('rect', { x, y, width: w, height: h, rx: 8, fill: 'none', stroke: col, 'stroke-width': 2, opacity: op }); mono(x + 12, y + 20, name, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: op }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 5) { zone(30, 40, 400, 330, '저장소 (호스트)', { fill: SOFT }); zone(530, 40, 400, 330, '컨테이너 web', { fill: SOFT, color: ACC });
      fileRow(560, 110, 'conf.d/default.conf', { col: ACC }); fly(700, 70, 150, 70, seg(u, 0.2, 1.0), 'docker cp', { mono: true, stay: true });
      fileRow(60, 160, 'nginx/conf.d/default.conf', { op: fade(u, 1.0) }); fileRow(60, 230, 'public/index.html', { op: fade(u, 1.0) });
      [[160, '/etc/nginx/conf.d'], [230, '/usr/share/nginx/html']].forEach(([y, d], i) => { grow(330, y - 6, 555, y - 6, E(u, 1.3 + i * 0.3, 1.8 + i * 0.3), ACC);
        mono(560, y, d, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.7 + i * 0.3) }); mono(440, y - 14, ':ro', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.7 + i * 0.3) }); });
      tx(480, 330, 'conf는 코드처럼 저장소에서. 컨테이너 안에서 고치면 다시 만들 때 사라진다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // nginx.conf (왼쪽)
    const open = k === 0 ? E(u, 0.3, 1.2) : 1, H = 360 * open;
    el('rect', { x: 30, y: 30, width: 450, height: H, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    mono(46, 54, '/etc/nginx/nginx.conf', { 'font-size': 14.5, 'font-weight': 800 });
    if (k === 0) { tx(60, 120, '모든 설정의 출발점', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) }); mono(60, 160, '$ docker exec -it web cat /etc/nginx/nginx.conf', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) }); return; }
    const o1 = k === 1 ? fade(u, 0.2) : 1;
    mono(50, 86, 'user  nginx;', { 'font-size': 14, opacity: o1 }); mono(50, 108, 'worker_processes  auto;', { 'font-size': 14, opacity: k === 1 ? fade(u, 0.5) : 1 });
    blk(50, 120, 410, 40, 'events', INFO, k === 1 ? fade(u, 0.9) : 1); mono(140, 146, 'worker_connections 1024;', { 'font-size': 14, 'font-weight': 700, fill: k === 1 ? WARN : INK, opacity: k === 1 ? fade(u, 1.2) : 1 });
    if (k === 1) { tx(60, 210, '기본값 1024는 작다. 트래픽이 크면 여기부터 올린다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); return; }
    blk(50, 172, 410, 200, 'http', ACC, k === 2 ? fade(u, 0.2) : 1);
    ['include mime.types;', 'default_type application/octet-stream;', 'sendfile on;', 'keepalive_timeout 65;'].forEach((s, i) => mono(66, 218 + i * 24, s, { 'font-size': 13.5, opacity: k === 2 ? fade(u, 0.4 + i * 0.15) : 1 }));
    el('rect', { x: 60, y: 320, width: 390, height: 34, rx: 6, fill: ACCBG, opacity: k === 2 ? fade(u, 1.0) : 1 });
    mono(70, 342, 'include /etc/nginx/conf.d/*.conf;', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: k === 2 ? fade(u, 1.0) : 1 });
    // default.conf (오른쪽) — include 줄로 끌려 들어온다
    const pull = k === 2 ? E(u, 1.4, 2.2) : 1;
    grow(450, 337, 540, 337 - 40 * pull, pull, ACC);
    const fx = 540, fy = 60;
    el('rect', { x: fx, y: fy, width: 390, height: 320, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2.5, opacity: pull });
    mono(fx + 16, fy + 26, 'conf.d/default.conf', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: pull });
    if (k === 2) { tx(fx + 16, fy + 70, 'http 블록 안에 자동으로 들어간다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    blk(fx + 16, fy + 44, 358, 260, 'server', INK, 1);
    mono(fx + 32, fy + 92, 'listen       80;', { 'font-size': 14, 'font-weight': k === 3 ? 800 : 500, opacity: k === 3 ? fade(u, 0.3) : 1 });
    mono(fx + 32, fy + 116, 'server_name  localhost;', { 'font-size': 14, 'font-weight': k === 3 ? 800 : 500, opacity: k === 3 ? fade(u, 0.7) : 1 });
    if (k === 3) { tx(fx + 32, fy + 180, 'server 블록 하나 = 가상 호스트 하나', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) }); tx(fx + 32, fy + 206, '도메인이 늘면 블록이 는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); return; }
    blk(fx + 30, fy + 132, 330, 96, 'location /', ACC, fade(u, 0.2));
    mono(fx + 44, fy + 178, 'root  /usr/share/nginx/html;', { 'font-size': 13.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
    mono(fx + 44, fy + 202, 'index index.html;', { 'font-size': 13.5, opacity: fade(u, 0.8) });
    mono(fx + 32, fy + 260, 'error_page 500 502 503 504 /50x.html;', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.5) });
    tx(fx + 32, fy + 288, '장면 3의 마운트가 먹히는 이유 = 이 root', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) }); }

  // 5. reload vs restart: worker 교대와 응답 공백
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { terminal(60, 50, 840, 170, ['$ docker exec web nginx -t', ['nginx: the configuration file /etc/nginx/nginx.conf syntax is ok', '#7dd3c0'], ['nginx: configuration file /etc/nginx/nginx.conf test is successful', '#7dd3c0']], lerp(1, 3, E(u, 0.3, 1.4)), { title: 'bash', fs: 13.5 });
      check(110, 290, 16, pop(u, 1.5)); tx(140, 297, '두 줄이 다 나와야 다음 단계로 간다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(140, 330, '-t는 설정만 검사하고 서버는 건드리지 않는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k <= 2) { card(480, 70, 220, 48, { text: 'master', fs: 17, fw: 800, stroke: k === 1 && u > 1.2 ? ACC : INK, sw: k === 1 && u > 1.2 ? 3.5 : 2.5 });
      if (k === 1) { mono(60, 70, '$ nginx -s reload', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) }); fly(230, 70, 370, 70, seg(u, 0.5, 1.2), 'SIGHUP', { mono: true });
        tx(480, 140, '새 conf 검사 → 틀리면 옛 conf로 계속 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
        tx(480, 168, '프로세스를 죽이는 명령이 아니라 신호다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); }
      // worker 2개 (옛 conf)
      const oldGone = k === 2 ? E(u, 1.7, 2.4) : 0;
      [300, 660].forEach((x, i) => { if (oldGone >= 1) return; const left = k === 2 ? Math.round(lerp(4, 0, E(u, 0.6 + i * 0.2, 1.7))) : 4;
        card(x - (k === 2 ? 70 : 0), 230, 120, 46, { text: '옛 worker', fs: 14, stroke: MUT, color: MUT, op: 1 - oldGone });
        for (let j = 0; j < left; j++) el('circle', { cx: x - (k === 2 ? 70 : 0) - 36 + j * 24, cy: 278, r: 6, fill: INK, opacity: 1 - oldGone }); });
      if (k === 2) { [300, 660].forEach((x, i) => { const s = pop(u, 0.3 + i * 0.15); card(x + 70, 230, 120, 46, { text: '새 worker', fs: 14, stroke: ACC, color: ACC, fill: ACCBG, s });
          for (let j = 0; j < 3; j++) dot([[x + 70, 380], [x + 70, 256]], ((t * 0.9 + j / 3) % 1) * (u > 0.8 ? 1 : 0), ACC, 5); });
        tx(480, 150, '새 연결은 새 worker로, 옛 worker는 하던 요청만 마치고 퇴장', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
        el('rect', { x: 180, y: 360, width: 600, height: 16, rx: 5, fill: GOOD, opacity: fade(u, 1.8) });
        tx(480, 400, '응답 가능: 한순간도 끊기지 않는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.9) }); }
      return; }
    if (k === 3) { mono(60, 60, '$ sudo systemctl restart nginx', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(60, 92, '$ docker restart web', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5) });
      const down = E(u, 1.0, 1.8);
      [['master', 480, 170], ['worker', 330, 270], ['worker', 630, 270]].forEach(([n, x, y], i) => { card(x, y, 130, 46, { text: n, fs: 15, stroke: INK, op: 1 - down * 0.7 }); cross(x, y, 16, pop(u, 1.0 + i * 0.15)); });
      tx(480, 360, '전부 내렸다가 다시 올린다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) }); return; }
    if (k === 4) { const x0 = 100, W = 760, y = 150, g0 = 0.38, g1 = 0.58, f = E(u, 0.2, 1.6);
      tx(x0, y - 24, '응답 가능 시간', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      el('rect', { x: x0, y, width: W * Math.min(f, g0), height: 30, rx: 4, fill: GOOD });
      if (f > g0) el('rect', { x: x0 + W * g0, y, width: W * (Math.min(f, g1) - g0), height: 30, fill: BAD });
      if (f > g1) el('rect', { x: x0 + W * g1, y, width: W * (f - g1), height: 30, rx: 4, fill: GOOD });
      mono(x0 + W * (g0 + g1) / 2, y + 60, '예: 50ms~1s', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      [0.42, 0.48, 0.54].forEach((p, i) => { const s = pop(u, 1.6 + i * 0.15); dot([[x0 + W * p, 300], [x0 + W * p, y + 34]], seg(u, 1.2 + i * 0.15, 1.6 + i * 0.15), INK, 6); cross(x0 + W * p, y + 92, 9, s); });
      tx(480, 330, '그 틈에 온 새 연결은 거절, TERM이면 처리 중 요청도 끊긴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(480, 360, '초당 수천 요청이면 1초가 수천 건의 실패다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); return; }
    [['conf 변경', INK], ['nginx -t', INFO], ['nginx -s reload', ACC]].forEach(([s, col], i) => { const x = 180 + i * 300; card(x, 80, 220, 52, { text: s, fs: 16, mono: true, stroke: col, color: col, sw: 2.5, s: pop(u, 0.2 + i * 0.3) });
      if (i < 2) grow(x + 112, 80, x + 186, 80, E(u, 0.5 + i * 0.3, 0.8 + i * 0.3), MUT); });
    tx(80, 170, '바꿨는데 안 먹을 때', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.0) });
    ['nginx -t를 통과했나', '컨테이너 안을 고쳤나, 호스트를 고쳤나', 'include 경로가 맞나', '파일 끝이 .conf 인가 (.conf.bak은 안 읽힌다)'].forEach((s, i) => { const y = 206 + i * 44;
      check(96, y - 5, 9, pop(u, 1.2 + i * 0.25)); tx(120, y, s, { 'font-size': 15, opacity: fade(u, 1.25 + i * 0.25) }); }); }

  const quiz = [
    { q: 'docker run의 -p 8080:80에서 8080은 무엇인가?',
      o: ['컨테이너 안 nginx가 듣는 포트', '호스트에서 접속할 포트', 'worker 프로세스 수'], a: 1,
      why: '-p는 호스트:컨테이너 순서다. 왼쪽이 호스트, 오른쪽이 컨테이너 안 nginx가 듣는 80이다.' },
    { q: '응답 헤더 ETag: "66bb7232-267" 에서 267이 뜻하는 것은 무엇인가?',
      o: ['파일 크기 615바이트를 16진수로 쓴 값', '응답 상태 코드', 'nginx 버전'], a: 0,
      why: 'nginx의 ETag는 수정 시각과 파일 크기를 16진수로 이어 붙인다. 0x267 = 615로 Content-Length와 같다.' },
    { q: '-v ./public:/usr/share/nginx/html:ro로 띄운 뒤 이미지 안의 원래 index.html은 어떻게 되는가?',
      o: ['그대로 남아 있지만 마운트에 가려 보이지 않는다', '호스트 파일로 덮어써져 사라진다', '50x.html로 이름이 바뀐다'], a: 0,
      why: '마운트는 그 경로 위에 호스트 폴더를 겹쳐 올린다. 원본은 이미지 안에 그대로 있고, 마운트를 빼면 다시 보인다.' },
    { q: 'conf.d/default.conf가 http 블록 안의 설정이 되는 이유는 무엇인가?',
      o: ['파일 이름이 default라서', 'docker가 자동으로 합쳐서', 'nginx.conf의 http 블록 안에 include /etc/nginx/conf.d/*.conf 줄이 있어서'], a: 2,
      why: 'include는 그 자리에 파일 내용을 끼워 넣는다. http 블록 안에 include가 있으므로 default.conf의 server는 http의 자식이 된다.' },
    { q: 'nginx -s reload 직후, 이미 응답을 받던 연결은 어떻게 되는가?',
      o: ['즉시 끊기고 새 worker로 다시 붙는다', '옛 worker가 끝까지 처리하고 나서 물러난다', 'master가 이어받아 처리한다'], a: 1,
      why: '옛 worker는 listen 소켓만 닫고 처리 중인 요청을 마친 뒤 나간다. 그래서 reload는 다운타임이 0이다.' },
  ];

  const summary = [
    'docker run -d --name web -p 80:80 nginx:1.27-alpine 한 줄로 nginx가 뜬다.',
    'curl -i로 200 OK와 Server 헤더를 보면 설치 확인이 끝난다.',
    '콘텐츠는 /usr/share/nginx/html, 설정은 conf.d/default.conf를 호스트에서 ro로 마운트한다.',
    'conf를 바꾸면 nginx -t 다음 reload를 쓴다. 옛 worker가 하던 일을 마쳐 끊김이 없다.',
  ];
  const review = [
    { q: 'default.conf를 고치고 reload 했는데 응답이 그대로다. nginx -t는 통과했다. 먼저 의심할 것은?',
      o: ['컨테이너가 아니라 호스트의 다른 파일을 고쳤거나, 마운트가 그 파일을 가리지 않는다', 'reload는 원래 conf를 다시 읽지 않는다', 'worker_connections가 너무 작다'], a: 0,
      why: 'reload는 master가 conf를 다시 읽는다. 바뀐 게 없다면 nginx가 읽는 경로의 파일이 실제로 바뀌었는지부터 본다.' },
    { q: 'docker ps에 STATUS는 Up 인데 브라우저로 localhost에 접속이 안 된다. PORTS 칸이 비어 있다. 원인은?',
      o: ['nginx가 아직 worker를 안 띄웠다', 'docker run에서 -p를 빠뜨렸다', 'index.html이 없다'], a: 1,
      why: 'PORTS 칸이 비면 호스트 포트가 컨테이너에 연결되지 않은 것이다. 컨테이너는 떠 있어도 밖에서는 닿지 않는다.' },
    { q: '초당 수천 요청을 받는 서버에서 conf 한 줄을 바꿨다. 무엇으로 적용하는가?',
      o: ['systemctl restart nginx', 'docker restart web', 'nginx -t 후 nginx -s reload'], a: 2,
      why: 'restart는 다시 뜰 때까지 새 연결을 거절한다. reload는 새 worker로 교대해 끊김이 없다.' },
  ];

  R.page({ title: '컨테이너로 띄운 nginx', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
