/* IV-2-2 gzip / brotli + 캐시 헤더 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 압축 전후 크기는 STEPS 의 before / after / ratio 를 읽는다.
 * ETag 값은 nginx 규칙("%x(mtime)-%x(size)")으로 Last-Modified·Content-Length 에서 python 으로 계산했다. */
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
  // 아래쪽 크기 막대: 이 beat 의 before → after (KB 숫자만 뽑아 앞 beat 에서 이어서)
  const kb = (s) => { const m = String(s || '').match(/[\d.]+/); return m ? +m[0] : 0; };
  function sizeBar(c, y) { const b = c.beat, p = c.prev || {}; const a = kb(b.before), z = tween(p.after != null ? kb(p.after) : null, kb(b.after), c.u);
    y = y || 370; tx(40, y + 15, '응답 크기', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    el('rect', { x: 140, y, width: 600, height: 20, rx: 5, fill: SOFT }); el('rect', { x: 140, y, width: 600 * z / Math.max(a, 1), height: 20, rx: 5, fill: z < a ? GOOD : WARN, opacity: 0.85 });
    mono(750, y + 15, `${a} KB → ${Math.round(z)} KB`, { 'font-size': 14.5, 'font-weight': 800, fill: z < a ? GOOD : INK }); }
  function file(cx, cy, name, col, s, op) { const g = R.G(cx, cy, s ?? 1, op ?? 1); el('path', { d: 'M-15,-19 H7 L15,-11 V19 H-15 Z', fill: PANEL, stroke: col || INK, 'stroke-width': 2 }, g);
    if (name) mono(0, 38, name, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col || INK }, g); }

  // ---------- 1. gzip ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) sizeBar(c);
    if (k === 0) { conf(40, 30, ['http {', ['    gzip on;', { hl: 1 }], '    gzip_vary on;', '    gzip_proxied any;', '    gzip_comp_level 6;', '    gzip_min_length 1024;', '}'], { shown: E(u, 0.1, 1.2) * 7 });
      browser(520, 130, 120, 86, null, {}); nginxBox(860, 130, {});
      grow(582, 110, 788, 110, E(u, 1.0, 1.5), ACC); mono(685, 96, 'Accept-Encoding: gzip', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      grow(788, 160, 582, 160, E(u, 1.6, 2.1), GOOD); mono(685, 190, 'Vary: Accept-Encoding', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.7) });
      note(560, 280, '1KB 미만은 압축하지 않는다 (기본 레벨 1 → 6)', fade(u, 2.2), { fill: MUT, 'font-size': 14.5 }); return; }
    if (k === 1 || k === 2) { const T = [['text/html', 1, '항상'], ['text/css', 1], ['application/javascript', 1], ['application/json', 1], ['image/svg+xml', k === 2], ['application/wasm', k === 2], ['image/jpeg', 0]];
      el('path', { d: 'M520,60 L620,60 L590,330 L550,330 Z', fill: SOFT, stroke: GRID, 'stroke-width': 2 }); mono(570, 48, 'gzip_types', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle' });
      T.forEach(([n, ok, tag], i) => { const y = 74 + i * 40, a = 0.2 + i * 0.22, col = ok ? GOOD : n === 'image/jpeg' ? MUT : OFF;
        mono(500, y, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: col, opacity: fade(u, a) });
        if (ok) { grow(630, y - 5, 720, y - 5, E(u, a + 0.3, a + 0.6), GOOD); mono(730, y, tag ? '압축 (기본 포함)' : '압축', { 'font-size': 14, fill: GOOD, opacity: fade(u, a + 0.5) }); }
        else { cross(650, y - 5, 7, pop(u, a + 0.4)); mono(670, y, n === 'image/jpeg' ? '건너뜀' : '목록에 없음', { 'font-size': 14, fill: MUT, opacity: fade(u, a + 0.5) }); } });
      return; }
    if (k === 3) { [['photo.jpg', 'JPEG'], ['clip.mp4', 'MP4'], ['font.woff2', 'woff2']].forEach(([n, f], i) => { const y = 90 + i * 90;
        file(80, y, null, MUT, pop(u, 0.2 + i * 0.2)); mono(120, y + 5, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.2) });
        el('rect', { x: 300, y: y - 10, width: 300, height: 20, rx: 4, fill: MUT, opacity: 0.6 });
        el('rect', { x: 300, y: y + 14, width: 300 * (1 + 0.01 * E(u, 1.0 + i * 0.2, 1.6 + i * 0.2)), height: 10, rx: 3, fill: WARN, opacity: fade(u, 1.0 + i * 0.2) });
        mono(620, y + 5, '다시 gzip → 거의 그대로', { 'font-size': 14, fill: WARN, opacity: fade(u, 1.2 + i * 0.2) }); });
      R.meters(660, 300, 260, [{ name: 'CPU 낭비', val: '↑', hot: true, bar: 100 * E(u, 1.6, 2.4) }], { h: 70 });
      note(40, 380, '이미 압축된 포맷은 목록에서 뺀다', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 4) { terminal(30, 30, 900, 190, ['$ curl -s -D - -o /dev/null -H "Accept-Encoding: gzip" https://example.com/app.js', ['Content-Encoding: gzip', 'var(--term)'], ['Vary: Accept-Encoding', 'var(--term)'], '$ curl -s -H "Accept-Encoding: gzip" -o /dev/null -w "%{size_download}\\n" …/app.js', ['28453', 'var(--term)']], E(u, 0.2, 1.8) * 5, { fs: 13.5 });
      sizeBar(c, 280); sub(480, 340, '즉석 압축 응답에는 Content-Length가 없다 · 받은 바이트로 잰다 (예시 값)', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    [['JSON', 80, 90], ['HTML · CSS · JS', 70, 80], ['SVG', 60, 70]].forEach(([n, lo, hi], i) => { const y = 90 + i * 80, X = (v) => 260 + 6 * v;
      tx(40, y + 16, n, { 'font-size': 16, 'font-weight': 800 }); el('rect', { x: 260, y, width: 600, height: 24, rx: 5, fill: SOFT });
      el('rect', { x: X(lo), y, width: (X(hi) - X(lo)) * E(u, 0.3 + i * 0.4, 1.0 + i * 0.4), height: 24, rx: 5, fill: GOOD, opacity: 0.85 });
      mono(X(hi) + 10, y + 18, `${lo}~${hi}% 절감`, { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9 + i * 0.4) }); });
    note(40, 360, '반복 문자열이 많을수록 잘 준다 · API 응답이 가장 큰 수혜자', fade(u, 2.2), { fill: ACC }); }

  // ---------- 2. brotli ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { zone(40, 30, 560, 330, 'nginx.conf (main 컨텍스트)', {});
      conf(60, 64, [['load_module modules/ngx_http_brotli_filter_module.so;', { add: 1 }], ['load_module modules/ngx_http_brotli_static_module.so;', { add: 1 }]], { shown: E(u, 0.2, 1.0) * 2 });
      zone(60, 170, 520, 170, 'http { … }', { fill: PANEL, stroke: GRID });
      sub(320, 260, 'brotli 지시자들은 여기 안에', fade(u, 1.3), { 'font-size': 14.5 });
      note(640, 100, '기본 내장이 아니다', fade(u, 1.4), { fill: WARN }); note(640, 130, '파일 맨 위, http 밖에서 올린다', fade(u, 1.8)); return; }
    if (k === 1) { browser(100, 120, 120, 86, null, {}); browser(100, 290, 120, 86, null, {}); nginxBox(500, 205, {});
      mono(230, 92, 'Accept-Encoding: gzip, br', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.2) }); grow(162, 120, 428, 190, E(u, 0.3, 0.9), ACC);
      mono(230, 330, 'Accept-Encoding: gzip', { 'font-size': 14, fill: INFO, opacity: fade(u, 0.9) }); grow(162, 290, 428, 220, E(u, 1.0, 1.6), INFO);
      pill(720, 130, 'br', ACC, pop(u, 1.4), { mono: true }); pill(720, 280, 'gzip · 25 KB', INFO, pop(u, 1.9), { mono: true });
      grow(572, 190, 680, 140, E(u, 1.2, 1.5), ACC); grow(572, 220, 660, 270, E(u, 1.7, 2.0), INFO);
      sizeBar(c); return; }
    if (k === 2) { conf(40, 30, [['brotli on;', { add: 1 }], ['brotli_static on;', { add: 1 }], ['brotli_comp_level 6;', { add: 1 }], ['brotli_min_length 1024;', { add: 1 }]], { shown: E(u, 0.1, 1.0) * 4 });
      file(420, 90, 'app.js', INK, pop(u, 0.4)); file(520, 90, 'app.js.br', ACC, pop(u, 0.7));
      grow(520, 140, 520, 210, E(u, 1.0, 1.4), ACC); nginxBox(520, 250, { w: 120, h: 66 }); note(600, 220, '미리 만든 .br을 그대로', fade(u, 1.3), { fill: ACC });
      sizeBar(c); return; }
    if (k === 3 || k === 4) { const G = ['text/plain', 'text/css', 'application/javascript', 'application/json', 'image/svg+xml'];
      const B = ['text/plain', 'text/css', 'text/xml', 'application/javascript', 'application/json', 'application/xml', 'image/svg+xml', 'font/ttf', 'font/otf'];
      zone(40, 30, 380, 330, 'gzip_types', {}); zone(480, 30, 440, 330, 'brotli_types (따로 적는다)', { fill: ACCBG, color: ACC });
      G.forEach((s, i) => mono(60, 76 + i * 30, s, { 'font-size': 14.5 }));
      const n = k === 3 ? Math.round(E(u, 0.2, 1.8) * 6) : 6 + Math.round(E(u, 0.2, 1.2) * 3);
      B.slice(0, n).forEach((s, i) => mono(500, 76 + i * 30, s, { 'font-size': 14.5, fill: i >= 6 ? ACC : INK, 'font-weight': i >= 6 ? 800 : 400 }));
      if (k === 3) note(500, 340, '빠진 타입은 brotli가 건너뛴다', fade(u, 2.0), { fill: WARN });
      else note(500, 340, 'svg·폰트도 텍스트라 잘 준다', fade(u, 1.6), { fill: GOOD }); return; }
    if (k === 5) { [['원본', 89, INK], ['gzip 6', 32, INFO], ['brotli 6', 28, ACC], ['brotli 11', 26, ACC]].forEach(([n, v, col], i) => { const y = 70 + i * 66;
        tx(40, y + 18, n, { 'font-size': 16, 'font-weight': 800, fill: col }); R.hbar(180, y, 600, v, 89, { col, text: `${v} KB`, h: 26, u: E(u, 0.2 + i * 0.3, 0.9 + i * 0.3) }); });
      note(180, 360, 'jQuery.min.js · gzip 6보다 12%(level 6), 19%(level 11) 더 작다', fade(u, 2.0), { fill: ACC, 'font-size': 14.5 });
      sub(180, 390, '페이지의 측정값', fade(u, 2.2), { 'text-anchor': 'start' }); return; }
    [['정적 자산', '빌드 때 .br 생성 → brotli_static', GOOD, '요청마다 CPU 0'], ['동적 응답', 'brotli on · level 4~6', ACC, '11은 CPU가 급증']].forEach(([a, b, col, d], i) => { const y = 110 + i * 130, s0 = pop(u, 0.2 + i * 0.6);
      card(480, y, 860, 96, { rx: 12, stroke: col, fill: PANEL, sw: 2.2, s: s0 });
      tx(80, y - 8, a, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.6) }); mono(80, y + 24, b, { 'font-size': 15, opacity: fade(u, 0.4 + i * 0.6) });
      tx(880, y + 8, d, { 'font-size': 15, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 0.5 + i * 0.6) }); });
    note(480, 380, 'br을 못 받는 클라이언트는 gzip으로', fade(u, 2.0), { 'text-anchor': 'middle', fill: INFO }); }

  // ---------- 3. Cache-Control ----------
  // 시간 축(로그): 0 · 1일 · 30일 · 1년
  const TX = (sec) => (sec <= 0 ? 260 : 260 + 640 * Math.log10(1 + sec) / Math.log10(1 + 31536000));
  const RES = [['js · css · woff2 · svg', 31536000, 'max-age=31536000, immutable', GOOD], ['jpg · png · webp', 2592000, 'max-age=2592000', INFO], ['*.html', 0, 'max-age=0, must-revalidate', WARN], ['/api/', null, '백엔드가 보낸 값 그대로', MUT]];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { conf(40, 40, ['server {', '    listen 443 ssl http2;', '    server_name example.com;', '    root /var/www/html;', '}'], { shown: E(u, 0.1, 1.0) * 5 });
      [['app.a3f9.js', INK], ['style.77ab.css', INK], ['logo.png', INFO], ['index.html', WARN], ['/api/…', MUT]].forEach(([n, col], i) => file(470 + i * 112, 120, n, col, pop(u, 1.0 + i * 0.15)));
      note(480, 300, '자원 성격마다 location을 나눠 정책을 붙인다', fade(u, 2.0), { 'text-anchor': 'middle', fill: ACC }); return; }
    if (k <= 4) [['0', 0], ['1일', 86400], ['30일', 2592000], ['1년', 31536000]].forEach(([s, v]) => { el('line', { x1: TX(v), y1: 52, x2: TX(v), y2: 330, stroke: GRID, 'stroke-dasharray': '4 4' }); mono(TX(v), 44, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
    if (k <= 4) RES.forEach(([n, sec, h, col], i) => { if (i > k - 1) return; const y = 80 + i * 66, now = i === k - 1, g = now ? E(u, 0.3, 1.3) : 1;
      tx(40, y + 16, n, { 'font-size': 15, 'font-weight': 800, fill: col, class: 'mono' });
      if (sec != null) { el('rect', { x: 260, y, width: Math.max(4, (TX(sec) - 260) * g), height: 22, rx: 5, fill: col, opacity: 0.8 }); }
      else { el('rect', { x: 260, y, width: 640 * g, height: 22, rx: 5, fill: 'none', stroke: MUT, 'stroke-dasharray': '6 5', 'stroke-width': 2 }); }
      mono(sec === 31536000 ? TX(sec) - 8 : sec == null ? 268 : 278, y + 42, h, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': sec === 31536000 ? 'end' : 'start', opacity: now ? fade(u, 1.0) : 0.8 }); });
    if (k === 1) note(260, 380, '해시 파일명이 아니면 배포해도 옛 파일을 1년 쓴다', fade(u, 2.0), { fill: WARN });
    if (k === 2) note(260, 380, '이름이 같은 채 교체될 수 있어 immutable은 뺀다', fade(u, 2.0), { fill: INFO });
    if (k === 3) note(260, 380, 'HTML은 새 자산 링크를 담으니 매번 확인시킨다', fade(u, 2.0), { fill: WARN });
    if (k === 4) note(260, 380, '신선도를 아는 백엔드에게 맡긴다 · nginx가 덮어쓰지 않는다', fade(u, 2.0), { fill: MUT });
    if (k === 5) { [['immutable', '만료 전: 요청 자체를 안 보낸다', GOOD], ['must-revalidate', '만료 후: 반드시 서버에 확인 (304)', WARN], ['no-cache', '저장은 하되 매번 확인', INFO], ['no-store', '저장 금지', BAD]].forEach(([a, b, col], i) => {
        const y = 100 + i * 64, s0 = pop(u, 0.2 + i * 0.3); card(480, y, 820, 50, { rx: 10, stroke: col, fill: PANEL, sw: 2, s: s0 });
        mono(90, y + 6, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.3) }); tx(360, y + 6, b, { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.3) }); }); return; }
    if (k === 6) { [['1년', 365, 31536000], ['30일', 30, 2592000], ['1일', 1, 86400]].forEach(([a, d, s], i) => { const y = 120 + i * 80;
        card(480, y, 760, 60, { rx: 10, stroke: ACC, fill: PANEL, sw: 2, s: pop(u, 0.2 + i * 0.3) });
        tx(140, y + 7, a, { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) });
        mono(300, y + 7, `${d} × 86,400`, { 'font-size': 16, fill: MUT, opacity: fade(u, 0.5 + i * 0.3) });
        mono(830, y + 7, `= ${Math.round(tween(0, s, u - 0.6 - i * 0.3, 0.8)).toLocaleString('en-US')} 초`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 0.6 + i * 0.3) }); }); }
  }

  // ---------- 4. ETag ----------
  const SQ = { b: 160, s: 800, y0: 60 };
  function lanes() { browser(SQ.b, 30, 110, 40, null, { s: 0.9 }); nginxBox(SQ.s, 30, { w: 110, h: 40 });
    el('line', { x1: SQ.b, y1: 56, x2: SQ.b, y2: 410, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); el('line', { x1: SQ.s, y1: 56, x2: SQ.s, y2: 410, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); }
  function msg(i, right, s, col, u, a) { const y = 90 + i * 62, x1 = right ? SQ.b : SQ.s, x2 = right ? SQ.s : SQ.b;
    grow(x1 + (right ? 6 : -6), y, x2 + (right ? -6 : 6), y, a == null ? 1 : E(u, a, a + 0.5), col);
    mono(480, y - 9, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: a == null ? 1 : fade(u, a + 0.2) }); }
  const MS = [[1, 'GET /app.js', INK], [0, '200 · ETag "66bb7232-15c92" · max-age=86400', GOOD], [1, 'If-None-Match: "66bb7232-15c92"', INFO], [0, '304 Not Modified · 본문 0', GOOD], [0, '200 · ETag "678e1090-1654a" (새 파일)', WARN]];
  function s4(t, c) { const { k, u } = c;
    if (k <= 4) { lanes(); MS.forEach(([r, s, col], i) => { if (i > k || (k === 4 && i === 3)) return; const now = i === k; msg(k === 4 && i === 4 ? 3 : i, r, s, col, u, now ? 0.3 : null); });
      if (k === 1) { el('rect', { x: 260, y: 170, width: 440 * E(u, 1.0, 1.8), height: 18, rx: 4, fill: GOOD, opacity: 0.8 }); mono(480, 210, '본문 89,234 B 전송', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.6) }); }
      if (k === 2) { R.clock(SQ.b - 80, 214, 22, E(u, 0.1, 0.6), INFO); mono(SQ.b - 80, 262, '24h 뒤', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.4) }); }
      if (k === 3) { el('rect', { x: 260, y: 300, width: 440, height: 18, rx: 4, fill: 'none', stroke: OFF, 'stroke-dasharray': '6 5', 'stroke-width': 2, opacity: fade(u, 0.8) });
        mono(480, 340, '본문 89KB 아낌 · 왕복 1번은 남는다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.2) }); }
      if (k === 4) { file(SQ.s + 70, 230, null, WARN, pop(u, 0.1)); mono(SQ.s + 70, 290, '수정됨', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.2) });
        mono(480, 340, '바뀌었을 때만 본문이 다시 온다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.4) }); }
      return; }
    if (k === 5) { mono(480, 80, 'ETag: "66bb7232-15c92"', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle' });
      const a = E(u, 0.4, 0.9); el('path', { d: `M298,96 V112 H${298 + 112 * a} V96`, fill: 'none', stroke: INFO, 'stroke-width': 2.5 }); el('path', { d: 'M440,96 V112 H517 V96', fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.9) });
      mono(354, 160, '0x66bb7232', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.7) });
      tx(354, 186, '= mtime', { 'font-size': 15, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.8) });
      mono(354, 214, '2024-08-13 14:48:18 UTC', { 'font-size': 14.5, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.1) });
      mono(560, 160, '0x15c92', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      tx(560, 186, '= 크기', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.3) });
      mono(560, 214, '89,234 B', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      note(480, 300, '정적 파일이면 nginx가 이 둘로 자동으로 만든다', fade(u, 1.9), { 'text-anchor': 'middle' });
      sub(480, 330, '백엔드 응답은 직접 만들어야 한다 (예: 내용 sha256 앞 16자)', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    [['app.a3f9.js', GOOD, '이번 배포'], ['app.c71e.js', ACC, '다음 배포']].forEach(([n, col, d], i) => { const x = 260 + i * 420;
      file(x, 130, null, col, pop(u, 0.3 + i * 0.8)); mono(x, 196, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.4 + i * 0.8) });
      sub(x, 222, d, fade(u, 0.5 + i * 0.8)); });
    grow(320, 130, 620, 130, E(u, 1.0, 1.5), MUT); note(470, 112, '내용이 바뀌면 URL이 바뀐다', fade(u, 1.2), { 'text-anchor': 'middle', 'font-size': 14.5 });
    note(480, 320, '옛 URL은 다시 물을 일이 없다 → 304 왕복도 사라진다', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD }); }

  // ---------- 5. immutable ----------
  const FILES = ['index.html', 'index-a3f9.js', 'vendor-c2d4.js', 'styles-77ab.css', 'logo-99cc.png'];
  function revisit(u, mode, a) { // mode 0: 전부 조건부 요청, 1: index.html 만
    tx(40, 70, '재방문 때 나가는 요청', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    FILES.forEach((f, i) => { const y = 110 + i * 44, sent = i === 0 || mode === 0, v = fade(u, a + i * 0.12);
      mono(40, y + 5, f, { 'font-size': 14.5, 'font-weight': 700, opacity: v, fill: sent ? INK : GOOD });
      if (sent) { grow(220, y, 420, y, E(u, a + i * 0.12, a + 0.4 + i * 0.12), INFO); mono(430, y + 5, i === 0 ? '200/304' : '304', { 'font-size': 14, fill: INFO, opacity: v }); }
      else mono(220, y + 5, '캐시에서 바로 (요청 0)', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: v }); });
    const n = mode === 0 ? 5 : 1; mono(40, 360, `요청 ${n}개`, { 'font-size': 20, 'font-weight': 800, fill: n > 1 ? WARN : GOOD, opacity: fade(u, a + 0.8) }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { revisit(u, 0, 0.2); note(560, 200, '캐시 정책이 없으면', fade(u, 1.4)); note(560, 228, '매 방문마다 조건부 요청이 나간다', fade(u, 1.6), { fill: WARN }); return; }
    if (k === 1) { zone(40, 30, 420, 260, '/var/www/html/assets/', {});
      FILES.slice(1).forEach((f, i) => { const [base, h] = f.split('-'); spans(70, 90 + i * 46, [[base + '-', {}], [h.split('.')[0], { fill: ACC, 'font-weight': 800 }], ['.' + h.split('.')[1], {}]], { 'font-size': 16, opacity: fade(u, 0.2 + i * 0.2) }); });
      note(520, 120, '빌드 도구가 이름에 내용 해시를 넣는다', fade(u, 1.2), { fill: ACC }); note(520, 160, '내용이 바뀌면 이름도 바뀐다', fade(u, 1.7)); return; }
    if (k === 2) { conf(520, 40, [['location ^~ /assets/ {', { hl: 1 }], '    expires 1y;', ['    add_header Cache-Control "public,', { hl: 1 }], ['        max-age=31536000, immutable" always;', { hl: 1 }], '}'], { shown: E(u, 0.1, 0.9) * 5, fs: 13.5 });
      revisit(u, 1, 1.0); note(520, 230, '^~로 잡히면 정규식 location은 보지 않는다', fade(u, 2.0), { fill: ACC, 'font-size': 14.5 }); return; }
    if (k === 3) { file(140, 120, 'app.js', INK, 1); file(260, 120, 'app.js.br', ACC, pop(u, 0.3)); file(380, 120, 'app.js.gz', INFO, pop(u, 0.5));
      nginxBox(260, 270, {}); grow(260, 170, 260, 228, E(u, 0.8, 1.2), ACC);
      conf(520, 60, ['brotli_static on;', 'gzip_static on;', 'access_log off;'], { shown: E(u, 0.6, 1.6) * 3 });
      note(520, 200, '압축을 빌드 시점으로 옮긴다', fade(u, 1.8), { fill: GOOD }); note(520, 230, '요청마다 드는 압축 CPU 0', fade(u, 2.1), { fill: GOOD }); return; }
    if (k === 4) { revisit(u, 1, 0.1); conf(520, 60, [['location = /index.html {', { hl: 1 }], '    expires 0;', '    add_header Cache-Control', '        "public, max-age=0, must-revalidate" always;', '}'], { shown: E(u, 0.3, 1.2) * 5, fs: 13.5 });
      note(520, 220, 'index.html만 신선하면', fade(u, 1.6)); note(520, 248, '그 안 해시 링크로 새 자산을 받아 간다', fade(u, 1.9), { fill: ACC }); return; }
    if (k === 5) { mono(40, 60, 'GET /products/42', { 'font-size': 17, 'font-weight': 800 }); mono(40, 90, 'try_files $uri $uri/ /index.html;', { 'font-size': 15, fill: ACC, opacity: fade(u, 0.2) });
      [['$uri', '/products/42 파일', 0], ['$uri/', '/products/42/ 디렉토리', 0], ['/index.html', '마지막 대안 → 내부 이동', 1]].forEach(([a, b, ok], i) => { const y = 150 + i * 70, at = 0.5 + i * 0.5;
        card(200, y, 300, 50, { rx: 10, stroke: ok ? GOOD : GRID, fill: ok ? GOODBG : PANEL, sw: 2, s: pop(u, at), text: a, fs: 15, mono: true, fw: 800, color: ok ? GOOD : INK });
        tx(380, y + 6, b, { 'font-size': 15, opacity: fade(u, at + 0.1) }); if (ok) check(720, y, 11, pop(u, at + 0.4)); else cross(720, y, 9, pop(u, at + 0.3)); });
      note(40, 395, '클라이언트 라우터가 /products/42를 그린다 · 새로고침 404 없음', fade(u, 2.3), { fill: GOOD, 'font-size': 14.5 }); return; }
    if (k === 6) { conf(40, 40, ['// vite.config.js', 'build: { rollupOptions: { output: {', ['  entryFileNames: "assets/[name]-[hash].js"', { hl: 1 }], '}}}'], { shown: E(u, 0.1, 1.0) * 4 });
      card(250, 280, 300, 70, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.2, s: pop(u, 1.2), text: '빌드: [hash] 파일명', fs: 16, fw: 800, color: ACC });
      card(700, 280, 300, 70, { rx: 12, stroke: GOOD, fill: GOODBG, sw: 2.2, s: pop(u, 1.5), text: 'nginx: 1년 + immutable', fs: 16, fw: 800, color: GOOD });
      el('line', { x1: 400, y1: 280, x2: 550, y2: 280, stroke: INK, 'stroke-width': 3, opacity: fade(u, 1.8) }); note(475, 380, '둘 중 하나만 있으면 캐시 사고', fade(u, 2.1), { 'text-anchor': 'middle', fill: BAD }); return; }
    [['압축 (gzip · brotli)', '바이트 70~85% ↓', GOOD], ['HTTP/2 multiplexing', '연결 1개', INFO], ['immutable', '재방문 요청 0개', ACC], ['CDN', '사용자 가까이', MUT]].forEach(([a, b, col], i) => { const y = 70 + i * 74, s0 = pop(u, 0.2 + i * 0.35);
      card(480, y, 820, 58, { rx: 12, stroke: col, fill: PANEL, sw: 2.2, s: s0 });
      tx(100, y + 6, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.35) }); tx(860, y + 6, b, { 'font-size': 16, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.35) }); });
    note(480, 380, '크기 · 연결 · 요청 수 · 거리를 하나씩 줄인다', fade(u, 2.0), { 'text-anchor': 'middle' }); }

  const quiz = [
    { q: 'gzip on만 켜고 gzip_types를 적지 않으면 무엇이 압축되는가?',
      o: ['text/html만', '모든 텍스트 응답', '아무것도 압축되지 않는다'], a: 0,
      why: 'gzip_types 기본값은 text/html이다. CSS·JS·JSON은 목록에 적어야 100 KB가 25 KB처럼 줄어든다.' },
    { q: 'brotli를 켰는데 JSON 응답만 계속 gzip으로 나간다. 원인은 무엇인가?',
      o: ['load_module을 http 안에 적어서', 'brotli_types에 application/json을 빠뜨려서', '브라우저가 br을 몰라서 생긴 일이라 고칠 수 없다'], a: 1,
      why: 'brotli_types는 gzip_types와 별개의 목록이다. 빠진 타입은 brotli가 건너뛰고 gzip이 대신 압축한다.' },
    { q: 'index.html에 max-age=0, must-revalidate를 주는 이유는 무엇인가?',
      o: ['HTML은 압축이 안 돼서', 'HTML 파일이 커서', 'HTML에는 해시가 없고 새 자산 링크를 담고 있어서'], a: 2,
      why: 'HTML을 오래 캐시하면 새 배포의 해시 파일 링크가 반영되지 않는다. 매번 확인시켜 새 링크를 따라가게 한다.' },
    { q: '304 Not Modified 응답이 아껴 주는 것은 무엇인가?',
      o: ['본문 전송 (89,234 B)', '요청 왕복 자체', 'TLS handshake'], a: 0,
      why: 'If-None-Match로 확인하는 왕복은 그대로 남고 본문만 빠진다. 왕복까지 없애려면 해시 파일명과 immutable을 쓴다.' },
    { q: 'location ^~ /assets/에 1년 + immutable을 준 뒤 재방문하면 무엇이 달라지나?',
      o: ['assets 파일도 304를 받으러 간다', 'index.html까지 요청이 사라진다', 'assets 파일은 요청 없이 캐시에서 쓰고 index.html만 확인한다'], a: 2,
      why: 'immutable이면 만료 전에는 조건부 요청도 보내지 않는다. 해시가 없는 index.html만 매번 확인해 요청이 5개에서 1개로 준다.' },
  ];

  const summary = [
    'gzip은 켜는 것만으로 부족하고 gzip_types에 텍스트 타입을 적어야 100 KB가 25 KB로 준다.',
    'brotli는 모듈을 따로 올리고 brotli_types를 따로 적으며, 못 받는 클라이언트에는 gzip이 간다.',
    'Cache-Control은 해시 자산 1년, 이미지 30일, HTML 0초처럼 자원마다 다르게 준다.',
    'ETag는 304로 본문만 아끼고, 해시 파일명과 immutable은 재방문 요청 자체를 없앤다.',
  ];
  const review = [
    { q: '배포 후 일부 사용자 화면이 옛 JS로 깨진다. app.js(해시 없음)에 max-age=1y가 걸려 있다. 먼저 고칠 것은?',
      o: ['gzip_comp_level을 9로 올린다', '빌드에서 파일명에 [hash]를 넣고 index.html은 매번 확인시킨다', 'ETag를 끈다'], a: 1,
      why: '1년 캐시는 이름이 바뀌어야 새 파일을 받는다. 해시 파일명과 신선한 index.html이 짝을 이뤄야 한다.' },
    { q: '이미지와 mp4까지 gzip_types에 넣었더니 CPU만 오르고 크기는 그대로다. 왜 그런가?',
      o: ['이미 압축된 포맷이라 다시 압축해도 거의 줄지 않는다', 'gzip_vary가 꺼져 있다', 'HTTP/2라서 압축이 무시된다'], a: 0,
      why: 'JPEG·MP4·woff2는 이미 압축돼 있다. 텍스트 타입만 목록에 두고 나머지는 뺀다.' },
    { q: '서버 3대에 정적 파일을 각각 다른 시각에 복사했더니 304가 잘 안 나온다. 원인은?',
      o: ['brotli_static이 켜져 있어서', 'Cache-Control이 public이라서', 'nginx ETag는 mtime으로 만들어져 서버마다 값이 달라서'], a: 2,
      why: 'nginx ETag는 수정 시각과 크기를 16진수로 이은 값이다. 복사 시각이 다르면 같은 파일도 서버마다 ETag가 달라 재검증이 200으로 끝난다.' },
  ];

  R.page({ title: '압축과 캐시 헤더', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
