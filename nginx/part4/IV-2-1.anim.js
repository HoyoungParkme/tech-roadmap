/* IV-2-1 proxy_cache — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 캐시 파일 경로는 키 문자열의 md5 를 python hashlib 로 계산했다 (levels=1:2: 끝 1자 / 그 앞 2자).
 * 로그 필드 번호는 실제 $time_local("+0900" 포함)·$request("HTTP/1.1" 포함) 모양으로 공백 분할해 센 값. */
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
  function folder(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), c = o.stroke || INK;
    el('path', { d: 'M-22,-14 H-6 L-1,-9 H22 V15 H-22 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    if (name) tx(0, 34, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  function nginxBox(cx, cy, o) { o = o || {}; card(cx, cy, o.w || Math.max(150, o.sub ? tw(o.sub, 13.5) + 30 : 0), o.h || 80, { rx: 12, stroke: GOOD, fill: GOODBG, sw: 2.6, s: o.s, op: o.op });
    tx(cx, cy + (o.sub ? -4 : 7), 'nginx', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: o.op ?? 1 });
    if (o.sub) mono(cx, cy + 20, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, opacity: o.op ?? 1 }); }
  const K42 = 'httpsGETapi.example.com/api/products/42', H42 = 'f89345ce546175516c74024b2deaf51e';
  const KP2 = 'httpsGETapi.example.com/api/products/42?page=2', HP2 = '6640f3faf267f2ace73f7ef8af31f3c4';
  // md5 문자열: 끝 1자(ACC)와 그 앞 2자(INFO)를 칠한다
  function md5(x, y, h, op, fs) { spans(x, y, [[h.slice(0, 29), {}], [h.slice(29, 31), { fill: INFO, 'font-weight': 800 }], [h.slice(31), { fill: ACC, 'font-weight': 800 }]], { 'font-size': fs || 15, opacity: op }); }

  // ---------- 1. proxy_cache_path ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { conf(40, 40, ['http {', ['    proxy_cache_path /var/cache/nginx/api', { hl: 1 }], ['                     levels=1:2', { hl: u > 1.0 }], '}'], { shown: E(u, 0.1, 0.9) * 4 });
      folder(110, 250, '/var/cache/nginx/api', { s: pop(u, 0.9) });
      for (let i = 0; i < 16; i++) { const x = 280 + i * 40, s0 = pop(u, 1.2 + i * 0.05); folder(x, 250, null, { s: 0.7 * s0 }); mono(x, 284, '0123456789abcdef'[i], { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.3 + i * 0.05) }); }
      grow(150, 250, 256, 250, E(u, 1.1, 1.4), MUT);
      note(280, 340, '1단: 16개 · 각 안에 2단: 256개', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 1 || k === 2) { zone(40, 40, 400, 290, 'RAM — keys_zone=api_cache:64m', { fill: INFOBG, color: INFO });
      zone(520, 40, 400, 290, '디스크 — max_size=2g', { fill: SOFT });
      const n = k === 1 ? Math.round(E(u, 0.2, 1.8) * 40) : 40;
      for (let i = 0; i < n; i++) el('rect', { x: 60 + (i % 10) * 37, y: 80 + Math.floor(i / 10) * 30, width: 30, height: 22, rx: 3, fill: INFO, opacity: 0.6 });
      for (let i = 0; i < n; i++) { const x = 545 + (i % 10) * 37, y = 80 + Math.floor(i / 10) * 44; el('path', { d: `M${x},${y} h22 l6,6 v26 h-28 z`, fill: PANEL, stroke: INK, 'stroke-width': 1.5 }); }
      if (k === 1) { tx(240, 240, '키 + 메타 정보만', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) });
        tx(720, 290, '응답 본문 파일', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
        [['inactive=60m', 'use_temp_path=off']].forEach(([a, b]) => { pill(300, 380, a, WARN, pop(u, 1.8), { mono: true }); pill(640, 380, b, INK, pop(u, 2.1), { mono: true }); }); return; }
      const keys = Math.round(tween(0, 512000, u, 1.4)); mono(240, 260, `64 × 8,000 ≈ ${keys.toLocaleString('en-US')} 키`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
      sub(240, 290, '1m에 약 8천 키 (nginx 문서)', 1, { 'font-size': 14 });
      [['inactive=60m', '60분 아무도 안 읽으면 삭제', WARN], ['proxy_cache_valid', '얼마나 신선하다고 볼지', GOOD]].forEach(([a, b, col], i) => { const y = 360 + i * 30;
        mono(60, y, a, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, 1.2 + i * 0.5) }); tx(270, y, b, { 'font-size': 14.5, opacity: fade(u, 1.3 + i * 0.5) }); });
      return; }
    if (k === 3) { [['tmpfs (RAM)', 230, INFO], ['디스크', 690, INK]].forEach(([n, x, col], i) => { card(x, 150, 260, 140, { rx: 12, stroke: col, fill: i ? SOFT : INFOBG, sw: 2.4, s: pop(u, 0.2 + i * 0.2) });
        tx(x, 110, n, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.3) });
        const alive = i === 1 || u < 1.6; for (let j = 0; j < 8; j++) card(x - 96 + (j % 4) * 64, 150 + Math.floor(j / 4) * 40, 48, 28, { rx: 4, fill: alive ? (i ? PANEL : INFO) : SOFT, stroke: alive ? col : GRID, sw: 1.5, op: alive ? 1 : 0.4 }); });
      mono(230, 260, '더 빠르다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.8) });
      banner(480, 320, '재시작', pop(u, 1.3)); note(230, 380, '캐시가 사라진다', fade(u, 1.8), { 'text-anchor': 'middle', fill: BAD }); note(690, 380, '그대로 남는다', fade(u, 1.9), { 'text-anchor': 'middle', fill: GOOD }); return; }
    // k4: 경로 만들기
    mono(40, 60, '키', { 'font-size': 14, fill: MUT }); mono(90, 60, K42, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
    mono(40, 110, 'md5', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) }); md5(90, 110, H42, fade(u, 0.6));
    grow(90 + 31 * 9 + 4, 120, 140, 180, E(u, 1.0, 1.4), ACC); grow(90 + 29 * 9 + 9, 120, 230, 180, E(u, 1.2, 1.6), INFO);
    folder(140, 200, 'e/', { s: pop(u, 1.4), stroke: ACC }); folder(240, 200, '51/', { s: pop(u, 1.6), stroke: INFO });
    mono(40, 290, '/var/cache/nginx/api/', { 'font-size': 15, opacity: fade(u, 1.8) });
    spans(40, 320, [['e', { fill: ACC, 'font-weight': 800 }], ['/', {}], ['51', { fill: INFO, 'font-weight': 800 }], ['/' + H42, {}]], { 'font-size': 15, opacity: fade(u, 2.0) });
    note(560, 210, '끝 1자 → 1단 · 그 앞 2자 → 2단', fade(u, 1.7), { fill: ACC });
    note(560, 380, '16 × 256 = 4,096 디렉토리', fade(u, 2.3), { fill: MUT }); }

  // ---------- 2. 캐시 키 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { browser(100, 200, 130, 96, '클라이언트', {}); nginxBox(470, 200, { sub: 'proxy_cache api_cache' }); server(830, 192, 'backend', {});
      dot([[170, 200], [395, 200]], seg(u, 0.2, 0.8), ACC, 7); dot([[545, 200], [765, 200]], seg(u, 0.8, 1.3), ACC, 7);
      dot([[765, 215], [545, 215]], seg(u, 1.3, 1.8), GOOD, 7);
      R.dbIcon(470, 340, null, { s: pop(u, 1.8) }); grow(470, 244, 470, 300, E(u, 1.8, 2.2), GOOD); note(530, 345, 'MISS → 저장', fade(u, 2.0), { fill: GOOD });
      note(470, 60, '이 한 줄이 있어야 캐싱이 시작된다', fade(u, 0.6), { 'text-anchor': 'middle', fill: ACC }); return; }
    if (k === 1) { [['$scheme', 'https'], ['$request_method', 'GET'], ['$host', 'api.example.com'], ['$request_uri', '/api/products/42']].forEach(([v, val], i) => {
        const x = 40 + [0, 120, 300, 470][i]; mono(x, 60, v, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.1 + i * 0.15) });
        mono(x, 92, val, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4 + i * 0.2) }); });
      mono(40, 150, '= ' + K42, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.2) }); md5(90, 180, H42, fade(u, 1.4), 14);
      mono(40, 260, '= ' + KP2, { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.7) }); md5(90, 290, HP2, fade(u, 1.9), 14);
      note(560, 360, '쿼리가 다르면 다른 파일', fade(u, 2.2), { fill: WARN }); return; }
    if (k === 2) { const ax = { x: 180, w: 640 }, X = (m) => ax.x + ax.w * m / 10;
      [['200 · 302', 10, GOOD], ['404', 1, WARN], ['500 · 502 · 503', 0, BAD]].forEach(([n, m, col], i) => { const y = 90 + i * 80;
        mono(40, y + 18, n, { 'font-size': 15, 'font-weight': 800, fill: col });
        if (m) { el('rect', { x: ax.x, y, width: (X(m) - ax.x) * E(u, 0.3 + i * 0.4, 1.2 + i * 0.4), height: 26, rx: 5, fill: col, opacity: 0.8 });
          mono(X(m) + 10, y + 18, `${m}m`, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.4) }); }
        else { cross(ax.x + 14, y + 13, 10, pop(u, 1.3)); tx(ax.x + 40, y + 19, '0 → 저장 안 함', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); } });
      note(180, 370, '장애 응답을 담아 두면 백엔드가 살아나도 에러가 나간다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 3) { mono(40, 60, '키 + $cookie_user_id', { 'font-size': 16, 'font-weight': 800, fill: WARN });
      nginxBox(160, 220, {}); const n = Math.round(E(u, 0.3, 2.0) * 24);
      for (let i = 0; i < n; i++) { const x = 340 + (i % 8) * 70, y = 140 + Math.floor(i / 8) * 70; el('path', { d: `M${x},${y} h26 l7,7 v30 h-33 z`, fill: WARNBG, stroke: WARN, 'stroke-width': 1.6 });
        mono(x + 16, y + 56, `u${i + 1}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
      note(340, 380, '같은 글도 사용자 수만큼 → hit rate↓ 디스크↑', fade(u, 2.1), { fill: WARN }); return; }
    if (k === 4) { nginxBox(560, 210, { sub: 'proxy_cache_lock on' }); server(860, 202, null, { s: 0.8 });
      for (let i = 0; i < 5; i++) { const y = 90 + i * 60; R.person(80, y, null, { s: 0.6 }); grow(110, y, 480, 200 + (i - 2) * 8, E(u, 0.2 + i * 0.05, 0.8 + i * 0.05), MUT); }
      dot([[635, 210], [810, 210]], seg(u, 0.9, 1.5), ACC, 8); mono(722, 180, '1개만', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      note(300, 380, '나머지 4개는 결과가 저장될 때까지 기다린다', fade(u, 1.8), { fill: GOOD });
      mono(560, 300, 'min_uses 2 · GET/HEAD만', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); return; }
    terminal(40, 40, 560, 150, ['$ curl -sI https://api.example.com/api/products/42', ['X-Cache-Status: MISS', 'var(--warn)'], '$ curl -sI https://api.example.com/api/products/42', ['X-Cache-Status: HIT', 'var(--term)']], E(u, 0.2, 2.0) * 4, { fs: 13.5 });
    mono(640, 100, '$upstream_cache_status', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
    note(640, 140, '브라우저에서 바로 확인', fade(u, 1.0)); }

  // ---------- 3. 백엔드 헤더 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { server(120, 200, 'FastAPI', {}); nginxBox(480, 200, {}); browser(840, 200, 130, 96, '브라우저', {});
      grow(180, 200, 403, 200, E(u, 0.3, 0.9), ACC); grow(557, 200, 773, 200, E(u, 1.0, 1.5), ACC);
      pill(290, 160, 'Cache-Control', ACC, pop(u, 0.7), { mono: true, fs: 13.5 });
      note(480, 330, '캐시 정책은 데이터를 아는 백엔드가 정한다', fade(u, 1.8), { 'text-anchor': 'middle', fill: ACC }); return; }
    if (k === 1) { mono(40, 60, 'Cache-Control: public, max-age=300, s-maxage=600', { 'font-size': 16, 'font-weight': 800 });
      const X = (s) => 200 + 640 * s / 600;
      [['브라우저', 300, 'max-age=300', INFO], ['nginx · CDN', 600, 's-maxage=600', ACC]].forEach(([n, sec, lab, col], i) => { const y = 140 + i * 80;
        tx(40, y + 18, n, { 'font-size': 15, 'font-weight': 800 }); el('rect', { x: 200, y, width: (X(sec) - 200) * E(u, 0.4 + i * 0.5, 1.3 + i * 0.5), height: 26, rx: 5, fill: col, opacity: 0.8 });
        mono(X(sec), y + 48, lab, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: col, opacity: fade(u, 1.0 + i * 0.5) }); });
      mono(200, 330, '0', { 'font-size': 13.5, fill: MUT }); mono(X(300), 330, '5분', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(X(600), 330, '10분', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      note(40, 390, '공유 캐시에서는 s-maxage가 max-age를 이긴다', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 2) { browser(120, 200, 130, 96, '브라우저', {}); server(820, 200, 'FastAPI', {});
      grow(758, 170, 190, 170, E(u, 0.2, 0.8), ACC); mono(480, 150, 'ETag: "<updated_at 타임스탬프>" · max-age=60', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) });
      grow(190, 220, 758, 220, E(u, 1.1, 1.6), INFO); mono(480, 246, '60초 뒤 If-None-Match', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.2) });
      grow(758, 280, 190, 280, E(u, 1.8, 2.3), GOOD); mono(480, 306, '안 바뀌었으면 304 (본문 없음)', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { mono(40, 56, 'GET /api/me → Cache-Control: private, no-store', { 'font-size': 15.5, 'font-weight': 800 });
      R.person(100, 200, 'A (user 42)', {}); R.person(100, 330, 'B', { s: pop(u, 1.2) }); nginxBox(480, 260, {});
      grow(140, 200, 403, 245, E(u, 0.3, 0.8), INK); R.dbIcon(480, 380, null, { s: 0.6, op: 0.5 }); cross(480, 380, 18, pop(u, 0.9));
      note(540, 390, '저장 안 함', fade(u, 1.0), { fill: GOOD });
      card(760, 170, 300, 96, { rx: 10, stroke: BAD, fill: BADBG, sw: 2, s: pop(u, 1.6) });
      tx(760, 160, '저장했다면', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
      tx(760, 186, 'B가 A의 정보를 받는다', { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { const cols = ['브라우저 저장', '공유 캐시 저장', '쓸 때마다 검증'], rows = [['public', 1, 1, 0], ['private', 1, 0, 0], ['no-cache', 1, 1, 1], ['no-store', 0, 0, 0]];
      cols.forEach((s, j) => tx(420 + j * 170, 60, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT }));
      rows.forEach(([n, ...v], i) => { const y = 110 + i * 62, op = fade(u, 0.2 + i * 0.4); mono(80, y + 6, n, { 'font-size': 17, 'font-weight': 800, opacity: op });
        v.forEach((b, j) => { const x = 420 + j * 170, s0 = pop(u, 0.3 + i * 0.4 + j * 0.08); if (b) check(x, y, 10, s0); else el('line', { x1: x - 8, y1: y, x2: x + 8, y2: y, stroke: OFF, 'stroke-width': 3, opacity: s0 }); }); });
      note(80, 380, 'no-cache는 저장은 하되 매번 확인, no-store는 저장 금지', fade(u, 2.2), { fill: ACC }); return; }
    // k5: 우선순위
    [['X-Accel-Expires', '응답 헤더 (nginx 전용)'], ['Cache-Control · Expires', '응답 헤더'], ['proxy_cache_valid', 'nginx 설정']].forEach(([a, b], i) => {
      const y = 80 + i * 90, w = 640 - i * 120, s0 = pop(u, 0.2 + i * 0.35);
      card(480, y, w, 64, { rx: 10, stroke: i ? (i === 1 ? ACC : MUT) : INFO, fill: i === 1 ? ACCBG : PANEL, sw: 2.2, s: s0 });
      mono(480, y - 2, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 1 ? ACC : INK, opacity: fade(u, 0.3 + i * 0.35) });
      tx(480, y + 20, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3 + i * 0.35) }); });
    mono(80, 90, '1', { 'font-size': 20, 'font-weight': 900, fill: INFO }); mono(80, 180, '2', { 'font-size': 20, 'font-weight': 900, fill: ACC }); mono(80, 270, '3', { 'font-size': 20, 'font-weight': 900, fill: MUT });
    note(480, 380, '헤더가 있으면 설정 값보다 먼저 쓴다', fade(u, 2.0), { 'text-anchor': 'middle' }); }

  // ---------- 4. hit / miss 로그 ----------
  const FIELDS = ['1.2.3.4', '[01/Jun/2026:10:00:01', '+0900]', '"GET', '/api/products', 'HTTP/1.1"', '200', 'cache=MISS', 'ut=0.245', 'rt=0.245'];
  function logLine(x, y, fs, o) { o = o || {}; let cx = x; FIELDS.forEach((f, i) => { const w = tw(f, fs), hot = o.hot === i + 1, v = o.u != null ? clamp(o.u * FIELDS.length - i) : 1;
      if (o.boxes) { el('rect', { x: cx - 3, y: y - fs - 2, width: w + 6, height: fs + 10, rx: 4, fill: hot ? ACCBG : 'none', stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2.2 : 1.2, opacity: v });
        mono(cx + w / 2, y + 26, String(i + 1), { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? ACC : MUT, opacity: v }); }
      mono(cx, y, f, { 'font-size': fs, 'font-weight': hot ? 800 : 500, fill: hot ? ACC : INK, opacity: v }); cx += w + tw(' ', fs) + (o.boxes ? 6 : 0); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { conf(40, 34, ['log_format cache_log', "    '$remote_addr [$time_local] \"$request\" '", "    '$status '", ["    'cache=$upstream_cache_status '", { hl: 1 }], "    'ut=$upstream_response_time '", "    'rt=$request_time';"], { shown: E(u, 0.1, 1.4) * 6 });
      [['ut', '백엔드에 쓴 시간', INFO], ['rt', '요청 전체 시간', INK]].forEach(([a, b, col], i) => { mono(620, 120 + i * 50, a, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 1.6 + i * 0.3) }); tx(660, 120 + i * 50, b, { 'font-size': 15, opacity: fade(u, 1.6 + i * 0.3) }); });
      note(40, 340, '둘을 같이 찍어야 캐시 효과가 숫자로 보인다', fade(u, 2.3), { fill: ACC }); return; }
    if (k === 1) { conf(40, 40, ['access_log /var/log/nginx/cache.log cache_log;'], { shown: E(u, 0.1, 0.6) });
      const g = R.G(140, 230, pop(u, 0.6)); el('path', { d: 'M-40,-55 H20 L40,-35 V55 H-40 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.4 }, g);
      mono(140, 310, 'cache.log', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
      const n = Math.floor(E(u, 0.9, 2.4) * 6); for (let i = 0; i < n; i++) { el('line', { x1: 112, y1: 190 + i * 14, x2: 168, y2: 190 + i * 14, stroke: ACC, 'stroke-width': 3, 'stroke-linecap': 'round' });
        fly(800, 200, 175, 190 + i * 14, seg(u, 0.9 + i * 0.25, 1.15 + i * 0.25), 'GET', { fs: 13.5 }); }
      note(300, 230, '이제부터 모든 요청이 이 모양으로 쌓인다', fade(u, 1.4)); return; }
    if (k === 2) { nginxBox(200, 200, { sub: 'location /api/' }); browser(760, 200, 150, 100, null, {});
      grow(280, 200, 680, 200, E(u, 0.3, 1.0), ACC); mono(480, 180, 'X-Cache-Status: HIT', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) });
      grow(200, 245, 200, 320, E(u, 1.2, 1.6), MUT); mono(200, 350, 'cache.log: cache=HIT', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      note(480, 300, '서버(로그)와 클라이언트(헤더)가 같은 값을 본다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 3) { [['cache=MISS', 'ut=0.245', 0.245, WARN], ['cache=HIT', 'ut=-', 0.001, GOOD]].forEach(([a, b, rt, col], i) => { const y = 80 + i * 130;
        mono(40, y, `"GET /api/products HTTP/1.1" 200 ${a} ${b} rt=${rt}`, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.7) });
        R.hbar(40, y + 22, 600, rt, 0.25, { col, text: `rt ${rt}s`, h: 24, u: E(u, 0.4 + i * 0.7, 1.2 + i * 0.7) }); });
      note(40, 370, 'ut=-는 백엔드에 아예 가지 않았다는 증거', fade(u, 2.2), { fill: GOOD }); return; }
    if (k === 4) { [['MISS', '없음 → 백엔드 후 저장', WARN], ['HIT', '캐시에서 바로', GOOD], ['BYPASS', 'bypass 조건으로 건너뜀', INFO], ['EXPIRED', '만료 → 백엔드', WARN], ['STALE', '만료본으로 장애 대체', BAD], ['UPDATING', '갱신 중이라 옛 것', INFO], ['REVALIDATED', '304로 재검증', GOOD]].forEach(([a, b, col], i) => {
        const x = i < 4 ? 40 : 500, y = 70 + (i % 4) * 78, s0 = pop(u, 0.2 + i * 0.22);
        card(x + 80, y, 160, 40, { rx: 20, stroke: col, fill: PANEL, sw: 2.2, s: s0, text: a, fs: 15, fw: 800, color: col, mono: true });
        tx(x + 175, y + 5, b, { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.22) }); });
      return; }
    logLine(30, 90, 14.5, { boxes: 1, hot: 8, u: E(u, 0.1, 1.2) });
    note(30, 160, '공백으로 자르면 cache= 는 8번째', fade(u, 1.2), { fill: ACC });
    terminal(30, 190, 470, 120, ["$ awk '{print $8}' cache.log | sort | uniq -c", '    650 cache=HIT', '    150 cache=MISS'], E(u, 1.3, 2.0) * 3, { fs: 13.5 });
    const hr = Math.round(tween(0, 81.25, u - 1.8, 0.6)); el('circle', { cx: 720, cy: 260, r: 70, fill: SOFT });
    const f = hr / 100, a = -Math.PI / 2 + f * 2 * Math.PI; if (f > 0) el('path', { d: `M720,260 L720,190 A70,70 0 ${f > 0.5 ? 1 : 0} 1 ${720 + 70 * Math.cos(a)},${260 + 70 * Math.sin(a)} Z`, fill: GOOD, opacity: 0.85 });
    mono(720, 360, `650 / 800 = ${hr}%`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD }); }

  // ---------- 5. purge ----------
  function sizeMeter(c) { const b = c.beat, p = c.prev || {}; const num = (s) => (s ? parseFloat(s) * (/GB/.test(s) ? 1000 : 1) : null);
    const v = tween(num(p.size), num(b.size), c.u); R.meters(700, 24, 240, [{ name: '캐시 크기 (예시)', val: v >= 1000 ? (v / 1000).toFixed(1) + ' GB' : Math.round(v) + ' MB', bar: v / 20 }], { h: 70 }); }
  function s5(t, c) { const { k, u } = c; sizeMeter(c);
    if (k === 0) { conf(40, 40, ['location ~ /purge(/.*) {', ['    allow 127.0.0.1;', { add: 1 }], ['    allow 10.0.0.0/8;', { add: 1 }], ['    deny all;', { del: 1 }], '    proxy_cache_purge api_cache "httpsGET$host$1";', '}'], { shown: E(u, 0.1, 1.0) * 6 });
      [['10.0.3.7', GOOD, 1], ['203.0.113.9', BAD, 0]].forEach(([ip, col, ok], i) => { const y = 280 + i * 60; mono(60, y, ip, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.2 + i * 0.4) });
        grow(200, y - 5, 420, y - 5, E(u, 1.3 + i * 0.4, 1.8 + i * 0.4), col); if (ok) check(445, y - 5, 10, pop(u, 1.9)); else { cross(445, y - 5, 10, pop(u, 2.2)); mono(470, y, '403', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) }); } });
      return; }
    if (k === 1) { mono(40, 60, 'curl -X PURGE … /purge/api/products/42', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.1) });
      mono(40, 110, '키 ' + K42, { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.5) }); md5(70, 140, H42, fade(u, 0.7), 14);
      for (let i = 0; i < 12; i++) { const x = 60 + i * 52, y = 230, hit = i === 4, gone = hit && u > 1.6;
        el('path', { d: `M${x},${y} h26 l7,7 v32 h-33 z`, fill: hit ? (gone ? 'none' : ACCBG) : PANEL, stroke: hit ? (gone ? OFF : ACC) : INK, 'stroke-width': 1.6, 'stroke-dasharray': gone ? '4 4' : null }); }
      mono(240, 300, 'e/51/f893…f51e', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) }); cross(276, 250, 14, pop(u, 1.6));
      note(40, 370, '키가 저장 때와 글자까지 같아야 지워진다', fade(u, 2.1), { fill: ACC }); return; }
    if (k === 2) { mono(40, 60, '$ sudo rm -rf /var/cache/nginx/api/*', { 'font-size': 15, 'font-weight': 800, fill: BAD });
      for (let i = 0; i < 24; i++) { const x = 60 + (i % 12) * 50, y = 110 + Math.floor(i / 12) * 56, gone = u > 0.5 + (i % 12) * 0.06;
        el('path', { d: `M${x},${y} h24 l6,6 v30 h-30 z`, fill: gone ? 'none' : PANEL, stroke: gone ? GRID : INK, 'stroke-width': 1.5, 'stroke-dasharray': gone ? '3 4' : null }); }
      const L = E(u, 1.4, 2.2); el('rect', { x: 60, y: 300, width: 600 * L, height: 30, rx: 6, fill: BAD, opacity: 0.85 });
      tx(60, 290, '백엔드 부하', { 'font-size': 15, 'font-weight': 700 }); note(60, 370, '모든 요청이 MISS · 붐비는 시간이면 장애로 번진다', fade(u, 2.2), { fill: BAD }); return; }
    if (k === 3) { browser(100, 200, 130, 96, null, {}); nginxBox(470, 200, {}); server(830, 192, 'backend', {});
      mono(100, 300, '?nocache=1', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.2) });
      R.dbIcon(470, 340, null, { s: 0.6, op: 0.6 }); el('path', { d: 'M545,190 Q680,120 765,185', fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.6) });
      dot([[170, 200], [395, 200], [545, 190], [765, 185]], seg(u, 0.5, 1.6), INFO, 7);
      mono(650, 120, 'proxy_cache_bypass', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.0) });
      pill(470, 90, 'cache=BYPASS', INFO, pop(u, 1.9), { mono: true }); note(560, 350, '지우지 않고 원본만 본다', fade(u, 2.2)); return; }
    if (k === 4) { browser(100, 200, 130, 96, null, {}); nginxBox(470, 200, {}); server(830, 192, 'backend', { stroke: BAD }); cross(830, 192, 26, pop(u, 0.2));
      dot([[545, 200], [740, 200]], seg(u, 0.4, 0.9), MUT, 7); mono(650, 170, '502 / timeout', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.9) });
      R.dbIcon(470, 330, null, { s: 0.7, stroke: WARN }); grow(470, 290, 470, 245, E(u, 1.1, 1.4), WARN);
      dot([[395, 200], [170, 200]], seg(u, 1.4, 2.0), WARN, 8); pill(280, 160, 'cache=STALE', WARN, pop(u, 1.9), { mono: true });
      note(560, 390, '조금 낡은 응답이 500보다 낫다', fade(u, 2.2), { fill: WARN }); return; }
    [['정적 자산 (이미지·JS)', 'max-age=1y + immutable', GOOD], ['상품 목록', 'max-age=5m + purge', ACC], ['검색 결과', 'max-age=1m', ACC], ['사용자 정보', 'private', WARN], ['결제·주문', 'no-store', BAD]].forEach(([a, b, col], i) => {
      const y = 130 + i * 58, s0 = pop(u, 0.2 + i * 0.25); card(360, y, 620, 46, { rx: 10, stroke: col, fill: PANEL, sw: 2, s: s0 });
      tx(100, y + 6, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.25) }); mono(650, y + 6, b, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.25) }); }); }

  const quiz = [
    { q: 'keys_zone=api_cache:64m의 메모리 zone에 들어가는 것은 무엇인가?',
      o: ['캐시 키와 메타 정보 (약 51만 키)', '응답 본문 전체 2GB', 'TLS 세션'], a: 0,
      why: '본문은 디스크 파일로, zone에는 키가 들어간다. 1m가 약 8천 키라서 64m면 약 512,000 키다.' },
    { q: '같은 /api/products/42에 ?page=2가 붙은 요청은 왜 다른 캐시를 쓰나?',
      o: ['GET이 아니라서', '404라서 1분만 저장해서', '$request_uri가 달라져 키와 md5가 바뀌기 때문'], a: 2,
      why: '키는 $scheme$request_method$host$request_uri를 이어 붙인 문자열이다. 쿼리가 다르면 md5도 달라 e/51/이 아니라 4/3c/에 저장된다.' },
    { q: '로그인 사용자 정보를 돌려주는 /api/me에 private, no-store를 붙이는 이유는 무엇인가?',
      o: ['응답을 더 빨리 주려고', '공유 캐시가 A의 응답을 저장해 B에게 주는 사고를 막으려고', 'ETag를 만들려고'], a: 1,
      why: 'nginx 같은 공유 캐시는 키가 같으면 누구에게나 같은 응답을 준다. 개인 응답은 저장 자체를 막아야 한다.' },
    { q: '로그에서 HIT 줄의 ut가 -로 찍히는 의미는 무엇인가?',
      o: ['백엔드를 아예 호출하지 않았다', '백엔드가 에러를 냈다', '시간 측정이 꺼져 있다'], a: 0,
      why: 'ut는 $upstream_response_time이다. HIT은 캐시 파일로 답했으니 백엔드 시간이 없고 rt도 0.001초로 줄어든다.' },
    { q: 'curl -X PURGE를 보냈는데 캐시가 지워지지 않았다. 가장 먼저 볼 것은?',
      o: ['proxy_cache_lock 설정', 'inactive 시간', 'purge 키가 proxy_cache_key로 만든 저장 키와 글자까지 같은지'], a: 2,
      why: 'purge는 그 키의 md5로 파일을 찾는다. 저장 키에 $request_method가 들어 있으면 purge 키에도 GET이 들어가야 한다.' },
  ];

  const summary = [
    'proxy_cache_path는 RAM에 키를, 디스크에 응답 파일을 두고 levels=1:2로 4,096개 디렉토리에 나눈다.',
    '캐시 키 문자열이 같으면 같은 캐시다. 쿼리나 쿠키를 넣을수록 잘게 쪼개진다.',
    '백엔드의 Cache-Control이 proxy_cache_valid보다 앞서고, 개인 응답은 private로 막는다.',
    '$upstream_cache_status를 로그에 찍어 HIT 비율을 세고, 바뀐 데이터는 키로 purge한다.',
  ];
  const review = [
    { q: '캐시를 켰는데 hit rate가 5%다. 키에 $cookie_session이 들어 있다. 먼저 할 일은?',
      o: ['키에서 사용자별 값을 빼고 공용 응답만 캐시한다', 'max_size를 2g에서 10g로 늘린다', 'proxy_cache_lock을 끈다'], a: 0,
      why: '세션마다 키가 달라 같은 글도 사용자 수만큼 따로 저장된다. 공용 응답은 키에서 사용자 값을 빼야 HIT이 난다.' },
    { q: '백엔드 장애가 끝났는데도 한동안 500 페이지가 계속 나갔다. 의심할 설정은?',
      o: ['levels=1:2', '5xx 응답에도 유효기간을 준 proxy_cache_valid', 'use_temp_path=off'], a: 1,
      why: '에러 응답을 캐시에 담으면 백엔드가 살아나도 TTL 동안 그대로 나간다. 5xx는 0으로 두어 저장하지 않는다.' },
    { q: '상품 가격을 바꾼 직후 사용자에게 옛 가격이 보인다. 트래픽이 많은 시간에 맞는 처리는?',
      o: ['캐시 디렉토리를 rm -rf로 통째로 지운다', 'nginx를 재시작한다', '바뀐 상품 키만 PURGE하고 나머지 캐시는 둔다'], a: 2,
      why: '통째로 지우면 모든 요청이 MISS가 되어 백엔드로 몰린다. 바뀐 키 하나만 지우면 다른 HIT은 그대로 유지된다.' },
  ];

  R.page({ title: 'proxy_cache 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
