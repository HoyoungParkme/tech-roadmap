/* I-2-2 정적 파일 서빙 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, check, cross, lock, browser } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const FS = 18;
  // 고정폭 글자 조각 (가운데 기준 아님, 왼쪽 x)
  function chip(x, y, s, col, o) { o = o || {}; const w = tw(s, FS) + 20;
    el('rect', { x, y: y - 24, width: w, height: 36, rx: 7, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, opacity: o.op ?? 1 });
    mono(x + 10, y, s, { 'font-size': FS, 'font-weight': 800, fill: col, opacity: o.op ?? 1, 'text-decoration': o.strike ? 'line-through' : null }); return w; }
  const W = (s) => tw(s, FS) + 20;

  // 1. root vs alias: 디스크 경로를 이어붙이느냐, 갈아끼우느냐
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { const isAlias = k === 1;
      mono(40, 50, isAlias ? 'location /img/ { alias /data/photos/; }' : 'location /img/ { root /var/www; }', { 'font-size': 17, 'font-weight': 700 });
      mono(40, 100, 'GET', { 'font-size': 16, fill: MUT });
      const base = isAlias ? '/data/photos/' : '/var/www', y = 250, g = E(u, 0.5, 1.4);
      tx(40, 200, '디스크 경로', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.3) });
      chip(40, y, base, ACC, { fill: ACCBG, op: fade(u, 0.3) });
      if (!isAlias) { chip(lerp(90, 40 + W(base), g), lerp(106, y, g), '/img/', INFO); chip(lerp(90 + W('/img/'), 40 + W(base) + W('/img/'), g), lerp(106, y, g), 'cat.jpg', INK); }
      else { const d = E(u, 0.4, 1.1); chip(90, lerp(106, 170, d), '/img/', INFO, { strike: d > 0.5, op: 1 - E(u, 1.0, 1.5) });
        chip(lerp(90 + W('/img/'), 40 + W(base), g), lerp(106, y, g), 'cat.jpg', INK); }
      const res = isAlias ? '/data/photos/cat.jpg' : '/var/www/img/cat.jpg';
      mono(40, 330, '= ' + res, { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) });
      tx(40, 370, isAlias ? 'location 부분(/img/)을 잘라내고 alias로 갈아끼운다' : 'root 뒤에 요청 URI 전체를 그대로 붙인다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      // 오른쪽 디렉토리 그림
      const tree = isAlias ? ['/data/', '  photos/', '    cat.jpg'] : ['/var/www/', '  img/', '    cat.jpg'];
      tree.forEach((s, i) => mono(700, 210 + i * 32, s, { 'font-size': 16, 'font-weight': i === 2 ? 800 : 500, fill: i === 2 && u > 1.7 ? ACC : INK, opacity: fade(u, 0.3 + i * 0.2) })); return; }
    if (k === 2) { [['root', ['root', ACC], ['요청 URI 전체', INFO], '/var/www/img/cat.jpg'], ['alias', ['alias', ACC], ['URI − location', INFO], '/data/photos/cat.jpg']].forEach(([n, a, b, r], i) => { const y = 110 + i * 130, op = fade(u, 0.3 + i * 0.6);
        mono(40, y, n, { 'font-size': 20, 'font-weight': 800, opacity: op });
        card(250, y - 6, 150, 44, { text: a[0], fs: 16, stroke: a[1], color: a[1], fill: ACCBG, op }); tx(340, y + 1, '+', { 'font-size': 22, 'font-weight': 800, opacity: op });
        card(470, y - 6, 190, 44, { text: b[0], fs: 15, stroke: b[1], color: b[1], op }); mono(250 - 75, y + 46, '예: ' + r, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6 + i * 0.6) }); });
      tx(40, 380, '이어붙이느냐, 갈아끼우느냐', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { mono(40, 50, 'location /img/ { alias /data/photos; }   # 끝 / 없음', { 'font-size': 16, 'font-weight': 700, fill: BAD });
      const g = E(u, 0.4, 1.2), base = '/data/photos', y = 170;
      chip(40, y, base, ACC, { fill: ACCBG }); chip(lerp(340, 40 + W(base) - 18, g), y, 'cat.jpg', INK);
      mono(40, 260, '= /data/photoscat.jpg', { 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      cross(380, 252, 14, pop(u, 1.7)); mono(410, 260, '404', { 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      tx(40, 330, 'location이 /로 끝나면 alias도 /로 끝낸다. 한 글자 차이다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k4: 고르는 기준 + 정규식 location 의 alias
    card(240, 80, 340, 54, { text: 'URL 구조 = 디스크 구조?', fs: 17, stroke: INK, s: pop(u, 0.2) });
    grow(170, 108, 120, 180, E(u, 0.5, 0.9), ACC); grow(310, 108, 360, 180, E(u, 0.5, 0.9), WARN);
    card(110, 205, 160, 48, { text: '예 → root', fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.9) });
    card(380, 205, 170, 48, { text: '아니오 → alias', fs: 16, stroke: WARN, color: WARN, s: pop(u, 1.0) });
    tx(540, 60, '정규식 location이면 (nginx 문서 예)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.3) });
    mono(540, 92, 'location ~ ^/users/(.+\\.png)$ {', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.4) });
    mono(560, 118, 'alias /data/w3/images/$1;', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) }); mono(540, 144, '}', { 'font-size': 14, opacity: fade(u, 1.4) });
    mono(540, 200, 'GET /users/me.png', { 'font-size': 14.5, opacity: fade(u, 1.8) }); mono(540, 228, '→ /data/w3/images/me.png', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
    tx(540, 262, '캡처 $1로 파일 경로 전체를 적는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) });
    tx(40, 350, '고민되면 root부터. alias는 경로가 정말 다를 때만', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.3) }); }

  // 2. index: 디렉토리 요청 → 후보 파일을 왼쪽부터
  const CAND = ['index.html', 'index.htm', 'default.html'];
  function probes(x, y, res, u, a) { CAND.forEach((s, i) => { const at = a + i * 0.35, st = res[i];
      if (st == null) { card(x + i * 160, y, 146, 40, { text: s, fs: 14, mono: true, stroke: GRID, color: MUT, sw: 1.5 }); return; }
      card(x + i * 160, y, 146, 40, { text: s, fs: 14, mono: true, stroke: st ? GOOD : BAD, color: st ? GOOD : BAD, sw: 2.2, fill: st ? 'var(--goodbg)' : PANEL, op: 0.4 + 0.6 * fade(u, at) });
      (st ? check : cross)(x + i * 160 + 60, y - 30, 9, pop(u, at)); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { mono(40, 50, 'index index.html index.htm default.html;', { 'font-size': 17, 'font-weight': 700 });
      CAND.forEach((s, i) => { card(150 + i * 230, 150, 200, 52, { text: s, fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.3 + i * 0.35) }); mono(70 + i * 230, 120, String(i + 1), { 'font-size': 16, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.3 + i * 0.35) });
        if (i < 2) grow(252 + i * 230, 150, 276 + i * 230, 150, E(u, 0.6 + i * 0.35, 0.9 + i * 0.35), MUT); });
      tx(40, 260, '/로 끝나는 요청이 오면 왼쪽부터 차례로 찾는다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(40, 290, '처음 있는 파일이 응답된다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { pill(160, 50, 'GET /about/', INK, pop(u, 0.1), { mono: true, fs: 15 });
      probes(120, 140, [true], u, 0.4);
      mono(40, 230, '/var/www/html/about/index.html', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      ['/var/www/html/', '  about/', '    index.html ✓', '  docs/'].forEach((s, i) => mono(640, 120 + i * 30, s, { 'font-size': 15, fill: i === 2 ? GOOD : INK, 'font-weight': i === 2 ? 800 : 500, opacity: fade(u, 0.2 + i * 0.1) }));
      tx(40, 300, '하나도 없으면 autoindex가 켜져 있을 때만 목록, 아니면 403', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { mono(40, 44, 'try_files $uri $uri/ /index.html;   → 그다음 index', { 'font-size': 15, 'font-weight': 700 });
      const lane = (y, title, steps, a, end, col) => { tx(40, y - 50, title, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, a) });
        steps.forEach(([s, ok], i) => { const x = 40 + i * 150, at = a + 0.2 + i * 0.3; card(x + 66, y, 132, 38, { text: s, fs: 13.5, mono: true, stroke: ok ? GOOD : BAD, color: ok ? GOOD : BAD, sw: 2, op: fade(u, at) });
          (ok ? check : cross)(x + 120, y - 26, 8, pop(u, at)); });
        mono(40 + steps.length * 150 + 10, y + 6, end, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, a + 0.3 + steps.length * 0.3) }); };
      lane(130, 'A. /about/ 디렉토리가 없을 때', [['$uri', false], ['$uri/', false], ['/index.html', true]], 0.2, '→ SPA 화면', GOOD);
      lane(270, 'B. /blog/ 디렉토리는 있고 index 파일이 없을 때', [['$uri', false], ['$uri/', true], ['index 3개', false]], 1.1, '→ 403', BAD);
      tx(40, 370, '$uri/가 "있다"로 걸리면 /index.html까지 가지 않는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.4) }); return; }
    if (k === 3) { pill(170, 50, 'GET /dashboard/settings', INK, pop(u, 0.1), { mono: true, fs: 15 });
      fly(170, 90, 170, 200, seg(u, 0.4, 1.1), '/index.html', { mono: true, stay: true });
      browser(650, 200, 460, 260, null, { s: pop(u, 1.2) });
      mono(440, 110, 'localhost/dashboard/settings', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
      tx(440, 170, 'index.html의 JS가', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); tx(440, 196, '주소를 보고 설정 화면을 그린다', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      tx(40, 300, '서버에는 없는 경로라도', { 'font-size': 15, opacity: fade(u, 2.0) }); tx(40, 326, 'index.html로 떨어져야 SPA가 산다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k4: 안쪽이 바깥을 덮는다
    const box = (x, y, w, h, n, v, col, a) => { el('rect', { x, y, width: w, height: h, rx: 10, fill: 'none', stroke: col, 'stroke-width': 2.2, opacity: fade(u, a) }); mono(x + 14, y + 24, n, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, a) }); mono(x + w - 14, y + 24, v, { 'font-size': 14, 'text-anchor': 'end', fill: col, opacity: fade(u, a) }); };
    box(40, 40, 560, 330, 'http', 'index index.html;', MUT, 0.2); box(70, 90, 500, 260, 'server', '(그대로 물려받음)', MUT, 0.5); box(100, 140, 440, 180, 'location /docs/', 'index readme.html; (예시)', ACC, 0.8);
    pill(320, 250, 'GET /docs/ → readme.html', ACC, pop(u, 1.4), { mono: true, fs: 14 });
    tx(630, 150, '안쪽에 같은 지시자가 있으면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); tx(630, 176, '그 값이 이긴다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
    tx(630, 230, '설정이 안 먹으면', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); tx(630, 254, '안쪽 블록부터 본다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); }

  // 3. try_files: 인자를 왼쪽부터 디스크에서 찾고, 마지막 인자만 무조건 실행
  function tryRow(req, args, res, u, o) { o = o || {}; pill(40 + tw('GET ' + req, 15) / 2 + 13, 50, 'GET ' + req, INK, pop(u, 0.1), { mono: true, fs: 15 });
    mono(40, 110, 'try_files', { 'font-size': 16, 'font-weight': 800, fill: MUT });
    let x = 140; const xs = args.map((a) => { const w = tw(a, 15) + 28, cx = x + w / 2; x += w + 22; return [cx, w]; });
    args.forEach((a, i) => { const [cx, w] = xs[i], last = i === args.length - 1, at = 0.4 + i * 0.45, st = res[i];
      card(cx, 104, w, 40, { text: a, fs: 15, mono: true, stroke: last ? ACC : INK, color: last ? ACC : INK, fill: last ? ACCBG : PANEL, sw: 2 });
      if (st === 'skip') return;
      dot([[cx, 128], [cx, 190]], seg(u, at, at + 0.3), st === 'yes' ? GOOD : st === 'fb' ? ACC : INK, 6);
      if (st === 'no') cross(cx, 210, 10, pop(u, at + 0.3)); else if (st === 'yes') check(cx, 210, 11, pop(u, at + 0.3)); else pill(cx, 214, '무조건', ACC, pop(u, at + 0.3), { fs: 13.5 });
      if (o.paths && o.paths[i]) mono(cx, 250, o.paths[i], { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, at + 0.3) }); });
    return xs; }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { mono(40, 60, 'try_files 파일1 파일2 … 마지막인자;', { 'font-size': 18, 'font-weight': 700 });
      [['파일1', 0], ['파일2', 1], ['…', 2], ['마지막 인자', 3]].forEach(([s, i]) => { const x = 130 + i * 200, last = i === 3; card(x, 160, last ? 180 : 140, 48, { text: s, fs: 16, stroke: last ? ACC : INK, color: last ? ACC : INK, fill: last ? ACCBG : PANEL, s: pop(u, 0.2 + i * 0.25) });
        if (!last) tx(x, 210, '디스크에서 찾기', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.25) }); });
      [['=404 같은 코드', '바로 그 코드로 끝'], ['/index.html 같은 URI', '내부 재요청'], ['@backend', 'named location으로']].forEach(([a, b], i) => { const y = 270 + i * 34; mono(540, y, a, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3 + i * 0.3) }); tx(760, y, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3 + i * 0.3) }); });
      tx(40, 300, '마지막 인자는 찾지 않는다.', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.1) }); tx(40, 326, '앞이 다 없을 때 실행된다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.1) }); return; }
    if (k === 1) { tryRow('/products/123', ['$uri', '$uri/', '/index.html'], ['no', 'no', 'fb'], u, { paths: ['파일?', '폴더?', ''] });
      tx(40, 320, '두 번 헛치고 /index.html로 내부 재요청 → React Router가 처리', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { tryRow('/products/123', ['$uri', '$uri/', '@backend'], ['no', 'no', 'fb'], u);
      R.server(820, 120, 'app:8000', { s: 0.7 * pop(u, 1.5) }); grow(560, 104, 760, 110, E(u, 1.6, 2.0), ACC);
      tx(40, 300, '파일이 있으면 nginx가 바로 준다 (예: /logo.png ✓)', { 'font-size': 15, opacity: fade(u, 2.0) });
      tx(40, 330, '없을 때만 앱이 일한다. @ location은 밖에서 직접 못 부른다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { mono(40, 300, 'location /static/ { try_files $uri =404; }', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      tryRow('/static/missing.js', ['$uri', '=404'], ['no', 'fb'], u);
      R.server(820, 120, 'app', { s: 0.7, op: 0.4 }); cross(820, 120, 22, pop(u, 1.6)); tx(820, 210, '백엔드 안 부름', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(40, 345, '여기에 SPA 폴백을 걸면 없는 .js에 index.html이 돌아가 디버깅이 꼬인다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    tryRow('/blog/hello?page=2', ['$uri', '$uri/', '/index.php?$args'], ['no', 'no', 'fb'], u);
    mono(40, 300, '$args = page=2', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.8) });
    mono(300, 300, '→ /index.php?page=2', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
    tx(40, 345, '?$args를 빼면 페이지 번호·검색어가 사라진다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); }

  // 4. MIME: 확장자 → Content-Type, 틀리면 깨지는 모습
  const MT = [['text/html', 'html htm shtml'], ['text/css', 'css'], ['application/javascript', 'js'], ['application/json', 'json'], ['image/png', 'png'], ['application/wasm', 'wasm']];
  function table(x, y, hot, extra, u, a) { mono(x, y - 14, 'mime.types', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    MT.concat(extra || []).forEach(([ty, ex], i) => { const yy = y + i * 32, on = ty === hot, isX = i >= MT.length, op = isX ? fade(u, a + (i - MT.length) * 0.3) : 1;
      el('rect', { x, y: yy, width: 400, height: 28, rx: 5, fill: on ? ACCBG : isX ? 'var(--warnbg)' : SOFT, stroke: on ? ACC : 'none', opacity: op });
      mono(x + 10, yy + 19, ty, { 'font-size': 14, 'font-weight': on ? 800 : 500, fill: on ? ACC : INK, opacity: op }); mono(x + 390, yy + 19, ex, { 'font-size': 14, 'text-anchor': 'end', fill: on ? ACC : MUT, opacity: op }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { mono(40, 60, 'include /etc/nginx/mime.types;', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) }); mono(40, 90, 'default_type application/octet-stream;', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) });
      const n = Math.round(lerp(0, MT.length, E(u, 0.8, 1.8)));
      mono(520, 46, 'mime.types', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      MT.slice(0, n).forEach(([ty, ex], i) => { const yy = 60 + i * 32; el('rect', { x: 520, y: yy, width: 400, height: 28, rx: 5, fill: SOFT }); mono(530, yy + 19, ty, { 'font-size': 14 }); mono(910, yy + 19, ex, { 'font-size': 14, 'text-anchor': 'end', fill: MUT }); });
      tx(40, 300, '표에 없는 확장자는 octet-stream (그냥 바이트)', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(40, 330, 'include를 빼먹으면 전부 octet-stream이 된다', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    if (k === 1) { table(520, 60, u > 0.9 ? 'text/css' : null, null, u);
      fly(60, 60, 300, 60, seg(u, 0.2, 0.8), '/style.css', { mono: true, stay: true });
      mono(40, 160, 'Content-Type: text/css', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      browser(240, 280, 380, 130, null, { s: pop(u, 1.6) });
      el('rect', { x: 80, y: 260, width: 140, height: 40, rx: 8, fill: ACC, opacity: fade(u, 2.0) }); tx(150, 286, '스타일 적용', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: PANEL, opacity: fade(u, 2.0) });
      tx(260, 286, '브라우저는 이 헤더만 믿는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { mono(40, 50, 'Content-Type: text/plain', { 'font-size': 18, 'font-weight': 800, fill: BAD });
      [['.css', 'CSS를 무시, 맨 화면'], ['.js (module)', 'import 차단 (엄격 검사)'], ['.wasm', 'instantiateStreaming 실패']].forEach(([a, b], i) => { const y = 120 + i * 80, s = pop(u, 0.4 + i * 0.5);
        card(150, y, 200, 54, { text: a, fs: 17, mono: true, stroke: BAD, color: BAD, s }); grow(255, y, 330, y, E(u, 0.6 + i * 0.5, 0.9 + i * 0.5), BAD); cross(360, y, 12, s);
        tx(390, y + 6, b, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.5) }); });
      tx(40, 380, '"CSS가 안 먹어요"는 응답 헤더의 Content-Type부터 본다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { table(520, 50, null, [['text/vtt', 'vtt'], ['application/manifest+json', 'webmanifest']], u, 0.8);
      mono(40, 60, 'types {', { 'font-size': 16, 'font-weight': 700 }); mono(60, 90, 'text/vtt vtt;', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3) });
      mono(60, 120, 'application/manifest+json webmanifest;', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.5) }); mono(40, 150, '}', { 'font-size': 16, 'font-weight': 700 });
      tx(40, 230, '같은 http 블록 안이면 표에 더해진다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(40, 262, 'location 안의 types는 바깥 표를 통째로 대신한다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) }); return; }
    mono(40, 60, 'charset utf-8;', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
    mono(40, 120, 'Content-Type: text/html', { 'font-size': 18, 'font-weight': 700 }); mono(40 + tw('Content-Type: text/html', 18), 120, '; charset=utf-8', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
    card(160, 210, 220, 60, { text: '안녕', fs: 24, stroke: GOOD, color: GOOD, s: pop(u, 1.0) }); tx(160, 262, 'charset 있음', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
    card(440, 210, 220, 60, { text: 'ì•ˆë…•', fs: 22, stroke: BAD, color: BAD, s: pop(u, 1.3) }); tx(440, 262, '잘못 짐작했을 때 (cp1252)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) });
    mono(40, 330, 'X-Content-Type-Options: nosniff', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.8) });
    tx(40, 362, '브라우저가 내용을 보고 타입을 짐작하지 못하게 막는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); }

  // 5. autoindex: 디렉토리 목록이 자동으로 생긴다, 그래서 가둬서 켠다
  const LIST = [['../', '', ''], ['doc1.pdf', '15-Dec-2024 10:23', '1M'], ['doc2.pdf', '15-Dec-2024 11:01', '850K'], ['presentation/', '03-Jan-2025 14:55', '-']];
  function listing(cx, cy, u, a, o) { o = o || {}; browser(cx, cy, 520, 250, null, { s: pop(u, a) });
    tx(cx - 240, cy - 72, 'Index of /files/', { 'font-size': 22, 'font-weight': 800, opacity: fade(u, a + 0.3) });
    LIST.forEach(([n, d, s], i) => { const y = cy - 34 + i * 30, op = fade(u, a + 0.5 + i * 0.2);
      mono(cx - 240, y, n, { 'font-size': 15, fill: o.hiName ? (i ? BAD : INFO) : INFO, 'font-weight': 700, opacity: op }); mono(cx + 40, y, d, { 'font-size': 14, fill: MUT, opacity: op }); mono(cx + 240, y, s, { 'font-size': 14, 'text-anchor': 'end', opacity: op }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(200, 70, 300, 50, { text: 'files.example.com', fs: 17, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.2) });
      ['/srv/shared/', '  files/', '    doc1.pdf', '    doc2.pdf', '    presentation/'].forEach((s, i) => mono(80, 150 + i * 30, s, { 'font-size': 16, 'font-weight': i < 2 ? 800 : 500, opacity: fade(u, 0.6 + i * 0.2) }));
      R.server(760, 110, 'api · www', { s: 0.75, op: 0.5 }); tx(760, 210, '운영 호스트와 분리', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      el('line', { x1: 560, y1: 40, x2: 560, y2: 380, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 1.4) });
      tx(80, 340, '리스팅은 별도 호스트에 가둬서 켠다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { listing(330, 220, u, 0.2);
      [['autoindex on;', ACC], ['autoindex_exact_size off;', INK], ['autoindex_localtime on;', INK]].forEach(([s, col], i) => mono(620, 140 + i * 40, s, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.4 + i * 0.3) }));
      tx(620, 280, 'exact_size off → 1M, 850K처럼', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); tx(620, 306, 'localtime on → 서버 시각 (기본 UTC)', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { mono(40, 50, 'location / { index index.html; try_files $uri $uri/ =404; }', { 'font-size': 15, 'font-weight': 700 });
      [['GET /files/', '목록', GOOD], ['GET /private/', '404', BAD]].forEach(([r, res, col], i) => { const y = 140 + i * 110, a = 0.3 + i * 0.7;
        pill(130, y, r, INK, pop(u, a), { mono: true, fs: 15 }); grow(230, y, 430, y, E(u, a + 0.2, a + 0.6), col); card(520, y, 160, 50, { text: res, fs: 18, mono: true, stroke: col, color: col, s: pop(u, a + 0.6) }); });
      tx(40, 370, 'autoindex는 상속된다. 켠 뒤에는 나머지 경로에서 꺼졌는지 본다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { listing(330, 210, u, 0.1, { hiName: u > 1.6 });
      tx(620, 180, '파일 이름도 정보다', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
      tx(620, 210, '프로젝트명·고객사명이 드러나는', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); tx(620, 234, '파일은 목록에 두지 않는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { mono(40, 50, 'autoindex_format json;', { 'font-size': 16, 'font-weight': 800 });
      ['[', '  { "name":"doc1.pdf", "type":"file",', '    "mtime":"…", "size":1234567 },', '  …', ']'].forEach((s, i) => mono(40, 100 + i * 28, s, { 'font-size': 15, fill: INFO, opacity: fade(u, 0.3 + i * 0.15) }));
      tx(40, 270, 'API처럼 쓰기 좋지만 크롤러도 통째로 긁기 쉽다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) });
      zone(560, 90, 360, 230, 'root /에 autoindex on이면', { fill: 'var(--badbg)', color: BAD, op: fade(u, 1.4) });
      ['.git/', '.env', 'nginx.conf.bak'].forEach((s, i) => { mono(600, 160 + i * 44, s, { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6 + i * 0.25) }); }); return; }
    mono(40, 50, 'auth_basic "Restricted";  auth_basic_user_file /etc/nginx/.htpasswd;', { 'font-size': 14, 'font-weight': 700 });
    [['로그인 없이', '401', BAD, 0.3], ['아이디·비밀번호와 함께', '목록', GOOD, 1.2]].forEach(([w, res, col, a], i) => { const y = 140 + i * 120;
      R.person(80, y, null, { s: pop(u, a) }); tx(120, y + 6, w, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) });
      grow(330, y, 560, y, E(u, a + 0.2, a + 0.6), col); lock(450, y - 22, i === 0, col, pop(u, a + 0.3));
      card(660, y, 160, 50, { text: res, fs: 18, mono: true, stroke: col, color: col, s: pop(u, a + 0.6) }); });
    tx(40, 390, '리스팅을 켤 때의 최소 조건: 의도한 폴더만, 인증 뒤에', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: 'location /img/ { alias /data/photos/; }에서 GET /img/cat.jpg가 찾는 파일은 무엇인가?',
      o: ['/data/photos/img/cat.jpg', '/data/photos/cat.jpg', '/img/data/photos/cat.jpg'], a: 1,
      why: 'alias는 location 부분 /img/를 잘라내고 그 자리에 alias 값을 넣는다. root 였다면 /img/가 살아 있었다.' },
    { q: 'try_files $uri $uri/ /index.html; 에서 /blog/ 폴더는 있는데 그 안에 index 파일이 없으면 응답은 무엇인가?',
      o: ['/index.html', '200 빈 페이지', '403'], a: 2,
      why: '$uri/가 폴더가 있다고 걸려 try_files가 거기서 멈춘다. 이어 index가 후보를 못 찾고 autoindex도 꺼져 있어 403이다.' },
    { q: 'try_files $uri =404; 를 둔 /static/에서 없는 파일을 요청하면 백엔드는 어떻게 되는가?',
      o: ['한 번 호출된다', '호출되지 않는다', 'index.html을 대신 돌려준다'], a: 1,
      why: '마지막 인자가 =404라서 nginx가 바로 404로 끝낸다. 백엔드까지 가지 않는다.' },
    { q: 'location /download/ 안에 types { }를 빈 채로 적으면 그 안의 응답 Content-Type은 어떻게 되는가?',
      o: ['표가 비어 모두 default_type으로 나간다', 'http의 mime.types를 그대로 쓴다', '설정 오류로 nginx가 뜨지 않는다'], a: 0,
      why: '안쪽 블록에 적은 types는 바깥 표를 통째로 대신한다. 빈 표면 모든 확장자가 default_type으로 떨어진다.' },
    { q: 'autoindex를 켤 때 가장 먼저 지켜야 할 것은 무엇인가?',
      o: ['의도한 폴더에만 켜고 인증 뒤에 둔다', 'autoindex_format을 json으로 바꾼다', 'autoindex_localtime을 켠다'], a: 0,
      why: '목록이 열리면 파일 이름이 다 드러난다. 공유 폴더에만 켜고 auth_basic 같은 인증을 함께 건다.' },
  ];

  const summary = [
    'root는 root 뒤에 요청 URI 전체를 붙이고, alias는 location 부분을 alias로 바꾼다.',
    'alias를 쓸 때 location이 /로 끝나면 alias도 /로 끝내야 404를 피한다.',
    'try_files가 index보다 먼저 돈다. 폴더만 있고 index가 없으면 403이 난다.',
    'Content-Type은 mime.types가 정하고, autoindex는 의도한 폴더에만 인증과 함께 켠다.',
  ];
  const review = [
    { q: 'React 앱을 배포했더니 /settings를 새로고침하면 404가 난다. 첫 화면은 잘 뜬다. 먼저 넣을 설정은?',
      o: ['try_files $uri $uri/ /index.html;', 'autoindex on;', 'default_type text/html;'], a: 0,
      why: '/settings는 서버에 없는 경로라 404다. try_files의 마지막 인자로 /index.html을 주면 앱의 라우터가 화면을 그린다.' },
    { q: '새로 올린 .mjs 모듈이 브라우저에서 "MIME type" 오류로 막힌다. 먼저 의심할 것은?',
      o: ['root 경로가 틀렸다', 'mime.types에 mjs가 없어 octet-stream으로 나간다', 'gzip이 꺼져 있다'], a: 1,
      why: '모듈 스크립트는 JavaScript 타입이 아니면 차단된다. 표에 없는 확장자는 default_type으로 나가므로 types에 mjs를 더한다.' },
    { q: 'location /files/ { alias /srv/shared; }로 바꾼 뒤 모든 파일이 404다. 경로 하나를 찍어 보면 /srv/shareddoc1.pdf다. 고칠 곳은?',
      o: ['location을 /files로 바꾼다', 'root와 alias를 함께 적는다', 'alias 끝에 /를 붙인다'], a: 2,
      why: 'location이 /로 끝나는데 alias에 /가 없어 경로가 붙어 버렸다. alias /srv/shared/; 로 맞춘다.' },
  ];

  R.page({ title: '요청 URI가 디스크 파일이 되기까지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
