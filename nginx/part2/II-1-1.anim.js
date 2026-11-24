/* II-1-1 proxy_pass — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * URI 변환(①~④)·proxy_redirect default 치환·라운드로빈 순서는 nginx 문서 규칙을 파이썬으로 재현해 계산한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, redisBox, person, browser, cross, check, lock, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const nginx = (cx, cy, sub, o) => redisBox(cx, cy, Object.assign({ name: 'Nginx', sub }, o || {}));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // URI 를 조각(칸)으로: parts [[글자, {stroke, fill, color, s, op}]] → 끝 x
  function uri(x, y, parts, o) { o = o || {}; const fs = o.fs || 15; let cx = x;
    parts.forEach(([s, st]) => { st = st || {}; const w = tw(s, fs) + 18;
      if ((st.s ?? 1) > 0) card(cx + w / 2, y, w, 32, { rx: 6, text: s, fs, mono: true, fw: 700, stroke: st.stroke || GRID, fill: st.fill || PANEL, color: st.color || INK, s: st.s, op: st.op, sw: st.sw || 1.8, dash: st.dash });
      cx += w + 4; }); return cx; }

  // ---------- 1. 백엔드 FastAPI ----------
  const AP = { x: 745, y: 200, w: 300, h: 230 };
  function s1(t, c) { const { k, u } = c;
    el('rect', { x: 330, y: 40, width: 600, height: 340, rx: 14, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(346, 404, '호스트 (서버 한 대)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    const s0 = k === 0 ? pop(u, 0.2) : 1;
    card(AP.x, AP.y, AP.w, AP.h, { rx: 12, stroke: INK, sw: 2, s: s0 });
    tx(AP.x - 132, AP.y - 88, 'app = FastAPI()', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: s0 });
    tx(AP.x + 132, AP.y - 88, 'uvicorn', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s0 });
    el('line', { x1: AP.x - 140, y1: AP.y - 74, x2: AP.x + 140, y2: AP.y - 74, stroke: GRID, 'stroke-width': 1.5, opacity: s0 });
    const rows = [['GET /', 'root()'], ['GET /users/{user_id}', 'get_user()'], ['GET /health', 'health()']];
    const shown = k === 0 ? 0 : k === 1 ? 2 : 3;
    if (k === 0) sub(AP.x, AP.y, '(아직 라우트 없음)', fade(u, 0.9), { 'font-size': 15 });
    rows.slice(0, shown).forEach(([a, b], i) => { const y = AP.y - 46 + i * 38, op = (k === 1 && i < 2) ? fade(u, 0.3 + i * 0.5) : (k === 2 && i === 2) ? fade(u, 0.3) : 1;
      mono(AP.x - 132, y, a, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: op }); mono(AP.x + 132, y, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: op }); });
    if (k === 1) mono(AP.x - 132, AP.y + 76, '/users/42 → user_id = 42 (int)', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.5) });
    // 소켓 127.0.0.1:8000
    if (k >= 2) { const g = k === 2 ? E(u, 1.0, 1.8) : 1;
      el('circle', { cx: AP.x - AP.w / 2, cy: AP.y + 70, r: 9 * g, fill: GOOD });
      if (k < 4) mono(AP.x - AP.w / 2 - 16, AP.y + 98, '127.0.0.1:8000', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: GOOD, opacity: g }); }
    if (k === 3) { person(110, 270, '인터넷 사용자', {});
      const g = E(u, 0.3, 1.3); grow(140, 270, lerp(140, 326, g), 270, 1, BAD, { plain: true });
      if (u > 1.3) cross(330, 270, 14, pop(u, 1.3));
      note(60, 360, '127.0.0.1에 묶으면 호스트 밖에서 :8000에 닿지 않는다', fade(u, 1.6), { 'font-size': 14.5 });
      pill(170, 120, '0.0.0.0:8000이면 인터넷에 열린다', WARN, pop(u, 2.0), { fs: 13.5 }); }
    if (k === 4) { person(110, 200, '사용자', {});
      nginx(440, 200, ':80 / :443', { s: pop(u, 0.2) });
      grow(140, 200, 376, 200, E(u, 0.3, 0.9), ACC); grow(504, 200, AP.x - AP.w / 2 - 12, 200 + 0, E(u, 0.6, 1.1), ACC);
      const jobs = ['TLS', '정적 파일', '로드 밸런싱', 'rate limit', '캐시', 'gzip', '로그'];
      const pos = [[385, 70], [495, 70], [385, 112], [495, 112], [385, 290], [495, 290], [440, 332]];
      jobs.forEach((j, i) => { const [px, py] = pos[i]; pill(px, py, j, ACC, pop(u, 0.9 + i * 0.18), { fs: 13.5 }); });
      sub(AP.x, AP.y + AP.h / 2 + 24, '앱은 비즈니스 로직만', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: INK }); } }

  // ---------- 2. location /api/ + proxy_pass ----------
  const P2 = { cl: 100, ng: 430, be: 800, y: 280 };
  function s2(t, c) { const { k, u } = c, b = c.beat;
    const conf = ['server {', '    listen 80;', '    server_name api.example.com;'];
    if (k >= 1) conf.push('    location /api/ {', '        proxy_pass ' + (k === 4 ? 'http://app:8000/;' : 'http://localhost:8000/;'), '    }');
    conf.push('}');
    snippet(250, 12, conf, { fs: 13.5, w: 400, op: k === 0 ? fade(u, 0.1) : 1 });
    browser(P2.cl, P2.y, 120, 84, '클라이언트');
    el('line', { x1: P2.cl + 62, y1: P2.y, x2: P2.ng - 66, y2: P2.y, stroke: GRID, 'stroke-width': 2.5 });
    el('line', { x1: P2.ng + 66, y1: P2.y, x2: P2.be - 58, y2: P2.y, stroke: GRID, 'stroke-width': 2.5 });
    nginx(P2.ng, P2.y, ':80');
    server(P2.be, P2.y - 8, null, {}); mono(P2.be, P2.y + 64, b.backend.replace('http://', ''), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' });
    if (k === 0) { fly(P2.cl + 40, P2.y - 46, P2.ng - 20, P2.y - 46, seg(u, 0.3, 1.4), 'GET /api/users/42', { mono: true, stay: true });
      if (u > 1.5) { mono(P2.ng, P2.y + 52, 'Host: api.example.com', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) }); check(P2.ng + 112, P2.y + 47, 9, pop(u, 1.9)); }
      sub(P2.be, P2.y + 92, '아직 아무것도 안 온다', fade(u, 2.1)); return; }
    if (k === 1) { const y = 380, a = E(u, 0.9, 1.8);
      uri(250, y - 46, [['/api/', { stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.2) }], ['users/42', { s: pop(u, 0.35) }]]);
      tx(240, y - 40, 'location 일치', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.6) });
      if (a > 0) { uri(250, y, [['/', { stroke: ACC, fill: ACC, color: PANEL, s: a }], ['users/42', { s: a }]]); tx(240, y + 6, '백엔드로', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: a }); }
      mono(P2.be, P2.y - 70, 'GET ' + b.backendPath, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 2) { dot([[P2.cl + 60, P2.y], [P2.ng - 60, P2.y]], seg(u, 0.2, 0.9), INK, 7);
      pill(P2.cl + 100, P2.y - 46, 'GET ' + b.clientPath, INK, pop(u, 0.2), { mono: true, fs: 13.5 });
      dot([[P2.ng + 60, P2.y], [P2.be - 56, P2.y]], seg(u, 1.0, 1.7), ACC, 7);
      pill(P2.be - 30, P2.y - 92, 'GET ' + b.backendPath, ACC, pop(u, 1.6), { mono: true, fs: 13.5 });
      note(250, 395, '/api/는 Nginx에서 사라진다. 백엔드는 /users/42만 안다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { dot([[P2.be - 56, P2.y], [P2.ng + 60, P2.y]], seg(u, 0.2, 0.9), GOOD, 7); dot([[P2.ng - 60, P2.y], [P2.cl + 60, P2.y]], seg(u, 1.0, 1.7), GOOD, 7);
      fly(P2.be - 40, P2.y + 46, P2.cl + 60, P2.y + 46, seg(u, 0.2, 1.8), '{"id": 42, "name": "user-42"}', { mono: true, fill: GOOD, stay: true });
      pill(P2.ng, P2.y - 74, '+ Server: nginx', WARN, pop(u, 1.2), { mono: true, fs: 13.5 });
      note(250, 395, '본문은 그대로, 응답 헤더에 Server 줄이 붙는다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k4 도커
    el('rect', { x: P2.ng - 90, y: P2.y - 60, width: P2.be - P2.ng + 170, height: 150, rx: 14, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: fade(u, 0.2) });
    tx(P2.ng - 76, P2.y + 80, '도커 네트워크', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
    pill(P2.be - 40, P2.y - 96, 'app → 컨테이너 주소 (도커 DNS)', INFO, pop(u, 0.9), { fs: 13.5 });
    note(250, 400, '바뀌는 것은 호스트 이름뿐, location과 경로 규칙은 같다', fade(u, 1.8), { 'font-size': 14.5 }); }

  // ---------- 3. trailing slash ----------
  const CASES = [
    { tag: '①', loc: 'location /api/', pp: 'http://app:8000/', ppHi: '/', out: [['/', 1], ['users/42', 0]], res: '/users/42' },
    { tag: '②', loc: 'location /api/', pp: 'http://app:8000', ppHi: '', out: [['/api/', 0], ['users/42', 0]], res: '/api/users/42' },
    { tag: '③', loc: 'location /api/', pp: 'http://app:8000/v1/', ppHi: '/v1/', out: [['/v1/', 1], ['users/42', 0]], res: '/v1/users/42' },
    { tag: '④', loc: 'location ~ ^/api/(.*)$', pp: 'http://app:8000/$1$is_args$args', ppHi: '/$1$is_args$args', out: [['/', 1], ['users/42', 2]], res: '/users/42' },
  ];
  function caseTable(k, u) { const x = 580, y0 = 66;
    tx(x, y0 - 22, 'proxy_pass', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(940, y0 - 22, '백엔드가 받는 URI', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, 'text-anchor': 'end' });
    CASES.forEach((cs, i) => { if (i > k && k < 4) return; const y = y0 + i * 44, on = i === k, op = i === k ? fade(u, 1.9) : 1;
      if (on) el('rect', { x: x - 8, y: y - 18, width: 368, height: 36, rx: 8, fill: ACCBG, opacity: op });
      mono(x, y + 5, cs.tag + ' ' + (i === 3 ? '.../$1…' : cs.pp.replace('http://', '')), { 'font-size': 14, fill: INK, opacity: op });
      mono(940 - 8, y + 5, cs.res, { 'font-size': 14, 'font-weight': 700, fill: i === 1 ? WARN : ACC, 'text-anchor': 'end', opacity: op }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 3) { const cs = CASES[k];
      tx(40, 52, '요청', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      const hit = k === 1 ? 0 : 1, sx = uri(90, 46, [['/api/', { stroke: hit ? ACC : GRID, fill: hit ? ACCBG : PANEL, color: hit ? ACC : INK }], ['users/42', { stroke: k === 3 ? INFO : GRID, color: k === 3 ? INFO : INK }]]);
      if (k === 3) { el('path', { d: `M${163},78 v8 h${sx - 167} v-8`, fill: 'none', stroke: INFO, 'stroke-width': 2, opacity: fade(u, 0.5) }); mono((163 + sx) / 2, 106, '$1 = users/42', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.6) }); }
      mono(40, 160, cs.loc, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      const base = 'proxy_pass ' + cs.pp.slice(0, cs.pp.length - cs.ppHi.length);
      R.spans(40, 196, [[base, {}], [cs.ppHi, { 'font-weight': 800, fill: ACC }]], { 'font-size': 15, opacity: fade(u, 0.3) });
      if (!cs.ppHi) tx(40 + tw(base, 15) + 10, 196, '← URI 없음 (호스트:포트에서 끝)', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.6) });
      const a = E(u, 0.9, 1.6); grow(160, 216, 160, 252, a, MUT);
      if (a > 0.95) { tx(40, 292, '백엔드', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
        uri(90, 286, cs.out.map(([s, f]) => [s, { stroke: f === 1 ? ACC : f === 2 ? INFO : GRID, fill: f === 1 ? ACC : PANEL, color: f === 1 ? PANEL : f === 2 ? INFO : INK, s: pop(u, 1.0) }])); }
      const why = ['location 일치 부분 /api/를 /로 바꾼다', '요청 URI를 손대지 않고 그대로 붙인다', '/api/ 자리를 /v1/로 바꾼다', '자동 치환 없음. 캡처와 쿼리를 직접 붙인다'][k];
      note(40, 360, why, fade(u, 1.5), { fill: k === 1 ? WARN : INK });
      caseTable(k, u); return; }
    if (k === 4) { tx(40, 52, '백엔드 라우트', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      ['GET /', 'GET /users/{user_id}', 'GET /health'].forEach((r, i) => mono(60, 90 + i * 30, r, { 'font-size': 15, fill: INK }));
      uri(60, 220, [['/api/', { stroke: BAD, fill: BADBG, color: BAD }], ['users/42', { stroke: BAD, color: BAD }]].map(([s, st]) => [s, Object.assign(st, { s: pop(u, 0.3) })]));
      tx(40, 192, 'proxy_pass http://app:8000; 가 넘긴 것', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3) });
      if (u > 1.0) { cross(320, 220, 12, pop(u, 1.0)); mono(345, 226, '404 Not Found', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.1) }); }
      note(40, 300, '맞는 라우트가 없다. Swagger 문서 주소도 같이 어긋난다', fade(u, 1.7), { fill: BAD });
      caseTable(4, u); return; }
    // k5 root_path
    tx(40, 52, 'Nginx가 떼고, 앱은 알고 있다', { 'font-size': 15, 'font-weight': 700 });
    uri(40, 100, [['/api/', { stroke: ACC, fill: ACCBG, color: ACC }], ['docs', {}]]); grow(200, 100, 260, 100, E(u, 0.3, 0.8), ACC);
    uri(270, 100, [['/', { stroke: ACC, fill: ACC, color: PANEL, s: pop(u, 0.8) }], ['docs', { s: pop(u, 0.8) }]]);
    mono(40, 170, 'FastAPI(root_path="/api")', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) });
    browser(220, 290, 360, 120, null, { s: pop(u, 1.3) });
    if (u > 1.5) { tx(60, 274, 'Swagger UI가 부르는 주소', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) }); mono(60, 302, '/api/openapi.json', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); check(370, 296, 10, pop(u, 1.9)); }
    caseTable(4, u); }

  // ---------- 4. upstream ----------
  function s4(t, c) { const { k, u } = c, single = k === 4;
    browser(80, 140, 100, 70, null, {}); nginx(270, 140, 'proxy_pass');
    mono(270, 214, 'http://' + (single ? 'single_backend' : 'backend') + '/', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: k === 0 ? 0.35 : 1 });
    el('rect', { x: 540, y: 34, width: 390, height: 360, rx: 14, fill: SOFT, stroke: ACC, 'stroke-width': 2 });
    mono(556, 60, 'upstream ' + (single ? 'single_backend' : 'backend'), { 'font-size': 15, 'font-weight': 800, fill: ACC });
    const nodes = single ? [[735, 140, '127.0.0.1:8000']] : [[650, 140, 'app1:8000'], [820, 140, 'app2:8000']];
    nodes.forEach(([x, y, n], i) => server(x, y, n, { s: k === 0 ? pop(u, 0.3 + i * 0.3) : single ? pop(u, 0.2) : 1, lamp: GOOD }));
    if (single) { const a = E(u, 1.2, 2.0); card(735, 240, 230, 34, { rx: 8, dash: '6 5', stroke: ACC, text: '+ server app2:8000;', mono: true, fs: 14, color: ACC, op: a });
      tx(735, 276, '확장은 이 한 줄', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: a }); }
    // keepalive 칸
    const nk = single ? 16 : 32, used = k === 2 ? Math.round(lerp(0, 3, E(u, 1.4, 2.4))) : k > 2 && !single ? 3 : 0;
    mono(556, 318, 'keepalive ' + nk, { 'font-size': 14.5, 'font-weight': 700 }); tx(915, 318, 'worker 마다 쉬는 연결 최대 ' + nk + '개', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    for (let i = 0; i < nk; i++) { const r = Math.floor(i / 16), q = i % 16, a = k === 0 ? clamp(u * 20 - 8 - i * 0.3) : 1;
      el('rect', { x: 556 + q * 22, y: 332 + r * 26, width: 18, height: 20, rx: 3, fill: i < used ? GOOD : PANEL, stroke: i < used ? GOOD : GRID, 'stroke-width': 1.5, opacity: a }); }
    if (k === 1) { const seq = [1, 2, 1, 2];   // 가중치 1:1 라운드로빈 (계산값)
      seq.forEach((n, i) => { const a = seg(u, 0.2 + i * 0.5, 0.8 + i * 0.5), [nx] = nodes[n - 1]; dot([[130, 140], [206, 140], [334, 140], [nx - 60, 140]], a, ACC, 7);
        if (u > 0.8 + i * 0.5) pill(110 + i * 92, 300, `${i + 1} → app${n}`, ACC, pop(u, 0.8 + i * 0.5), { mono: true, fs: 13.5 }); });
      tx(70, 260, '기본은 라운드로빈: 번갈아 보낸다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3) });
      note(70, 380, 'proxy_pass 줄은 백엔드가 몇 대든 그대로', fade(u, 2.3), { 'font-size': 14.5 }); }
    if (k === 2) { const rowT = (y, label, shake, col) => { tx(40, y + 5, label, { 'font-size': 13.5, 'font-weight': 700, fill: col });
        for (let i = 0; i < 3; i++) { const x0 = 160 + i * 116, a = seg(u, 0.2 + i * 0.4, 0.6 + i * 0.4);
          if (shake || i === 0) el('rect', { x: x0, y: y - 10, width: 50 * a, height: 20, rx: 3, fill: col, opacity: 0.35 });
          el('rect', { x: x0 + (shake || i === 0 ? 54 : 0), y: y - 10, width: 50 * a, height: 20, rx: 3, fill: ACC }); } };
      rowT(270, '매번 새 연결', true, BAD); rowT(320, '연결 재사용', false, GOOD);
      tx(160, 248, '흐린 칸 = TCP 연결 맺기, 진한 칸 = 요청', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2) });
      note(40, 380, '1.29.7 전에는 1.1과 Connection "" 두 줄을 꼭 적는다', fade(u, 1.9), { 'font-size': 14.5, fill: WARN }); }
    if (k === 3) { [['upstreams/dev.conf', 'server localhost:8000;'], ['upstreams/prod.conf', 'server app1 · app2;']].forEach(([f, s], i) => {
        const y = 270 + i * 64, a = pop(u, 0.3 + i * 0.4); card(240, y, 380, 52, { rx: 8, stroke: GRID, s: a });
        mono(64, y - 4, f, { 'font-size': 14, 'font-weight': 700, opacity: a }); mono(64, y + 17, s, { 'font-size': 13.5, fill: MUT, opacity: a }); });
      pill(735, 262, 'least_conn;', INFO, pop(u, 1.4), { mono: true, fs: 14 });
      tx(735, 292, '알고리즘도 한 줄', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      note(40, 404, 'server 블록은 그대로, upstream만 갈아 끼운다', fade(u, 2.0), { 'font-size': 14.5 }); } }

  // ---------- 5. 실전 conf ----------
  const GROUPS = [['proxy_pass http://backend/;', 1], ['proxy_redirect off;', 2], ['proxy_set_header × 4', 3], ['http 1.1 · Connection ""', 4], ['connect 5s · send/read 60s', 4]];
  function tree(k, u) {
    zone(24, 20, 440, 74, null, { fill: PANEL, stroke: GRID, sw: 1.5 });
    mono(40, 48, 'upstream backend {', { 'font-size': 14.5, 'font-weight': 700, fill: ACC }); mono(60, 76, 'server app:8000; keepalive 32;', { 'font-size': 13.5, fill: MUT });
    zone(24, 106, 440, 300, null, { fill: SOFT, stroke: GRID, sw: 1.5 });
    mono(40, 132, 'server { listen 80; api.example.com', { 'font-size': 14, 'font-weight': 700 });
    if (k >= 1) { zone(40, 146, 408, 178, null, { fill: PANEL, stroke: ACC, sw: 1.8, op: k === 1 ? fade(u, 0.1) : 1 });
      mono(56, 170, 'location /api/ {', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 1 ? fade(u, 0.1) : 1 });
      GROUPS.forEach(([s, kk], i) => { if (kk > k) return; const op = kk === k && (i === 4 || kk !== 4 || i === 3) ? fade(u, 0.2 + (i === 4 ? 0.4 : 0)) : 1;
        mono(76, 198 + i * 25, s, { 'font-size': 13.5, fill: kk === k ? INK : MUT, 'font-weight': kk === k ? 700 : 400, opacity: op }); }); }
    if (k >= 5) { zone(40, 334, 408, 60, null, { fill: PANEL, stroke: INFO, sw: 1.8, op: fade(u, 0.1) });
      mono(56, 358, 'location /health {', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.1) });
      mono(76, 382, 'access_log off; → backend/health', { 'font-size': 13.5, opacity: fade(u, 0.3) }); } }
  function s5(t, c) { const { k, u } = c; tree(k, u); const X = 500;
    if (k === 0) { tx(X, 60, '어떤 conf 든 이 순서로 읽는다', { 'font-size': 15, 'font-weight': 700 });
      ['upstream', 'server', 'location'].forEach((s, i) => { pill(X + 70 + i * 140, 120, s, i === 2 ? OFF : ACC, pop(u, 0.3 + i * 0.4), { mono: true });
        if (i < 2) grow(X + 120 + i * 140, 120, X + 160 + i * 140, 120, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), MUT); });
      sub(X + 210, 170, 'location은 다음 beat에서 채운다', fade(u, 1.8)); return; }
    if (k === 1) { tx(X, 60, '/api/를 떼고 backend 풀로', { 'font-size': 15, 'font-weight': 700 });
      uri(X, 110, [['/api/', { stroke: ACC, fill: ACCBG, color: ACC }], ['users', {}]]); grow(X + 150, 110, X + 200, 110, E(u, 0.5, 1.0), ACC);
      uri(X + 210, 110, [['/', { stroke: ACC, fill: ACC, color: PANEL, s: pop(u, 1.0) }], ['users', { s: pop(u, 1.0) }]]);
      note(X, 190, '이 한 줄로 프록시는 이미 돈다', fade(u, 1.6), { 'font-size': 14.5 });
      note(X, 220, '아래 줄들은 품질을 올리는 옵션', fade(u, 2.0), { 'font-size': 14.5, fill: MUT }); return; }
    if (k === 2) { tx(X, 56, '백엔드 응답 헤더', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      card(X + 210, 92, 420, 40, { rx: 8, text: 'Location: http://backend/login', mono: true, fs: 14.5, stroke: INK, s: pop(u, 0.2) });
      const rows = [['default', '/api/login', GOOD, 'http://backend/를 /api/로 바꿔 준다'], ['off', 'http://backend/login', WARN, '손대지 않고 그대로 넘긴다']];
      rows.forEach(([n, v, col, d], i) => { const y = 170 + i * 82, a = fade(u, 0.7 + i * 0.6);
        mono(X, y, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: a }); mono(X + 80, y, v, { 'font-size': 15, 'font-weight': 700, opacity: a });
        tx(X + 80, y + 26, d, { 'font-size': 13.5, fill: MUT, opacity: a }); });
      note(X, 360, 'off 라면 Host를 $host로 넘겨', fade(u, 2.0), { 'font-size': 14.5, fill: INFO });
      note(X, 386, '백엔드가 바깥 주소로 Location을 만들게 한다', fade(u, 2.1), { 'font-size': 14.5, fill: INFO }); return; }
    if (k === 3) { tx(X, 56, '백엔드 로그의 접속 주소', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      card(X + 200, 100, 400, 44, { rx: 8, stroke: BAD, text: '헤더 없음: 전부 Nginx 주소', fs: 15, color: BAD, op: 1 - 0.6 * E(u, 1.0, 1.6) });
      ['Host', 'X-Real-IP', 'X-Forwarded-For', 'X-Forwarded-Proto'].forEach((h, i) => pill(X + 60 + (i % 2) * 190, 176 + Math.floor(i / 2) * 44, h, ACC, pop(u, 0.4 + i * 0.2), { mono: true, fs: 13.5 }));
      card(X + 200, 300, 400, 44, { rx: 8, stroke: GOOD, text: '헤더 전달: 원래 클라이언트 주소', fs: 15, color: GOOD, s: pop(u, 1.6) });
      sub(X + 200, 350, '자세한 뜻은 II-1-2', fade(u, 2.2)); return; }
    if (k === 4) { tx(X, 56, '느린 백엔드가 worker를 붙잡지 않게', { 'font-size': 15, 'font-weight': 700 });
      const bar = (y, name, v, max, col, a0) => { tx(X, y - 10, name, { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
        el('rect', { x: X, y, width: 420, height: 20, rx: 4, fill: SOFT }); el('rect', { x: X, y, width: 420 * (v / max) * E(u, a0, a0 + 0.8), height: 20, rx: 4, fill: col });
        mono(X + 426 * (v / max) * E(u, a0, a0 + 0.8) + 4, y + 15, v + 's', { 'font-size': 14, 'font-weight': 700, fill: col }); };
      bar(110, 'proxy_connect_timeout (연결 맺기)', 5, 66, WARN, 0.2); bar(180, 'proxy_read_timeout (응답 사이 공백)', 60, 66, ACC, 0.6);
      note(X, 270, '연결은 짧게 끊고, 응답은 처리 시간보다 넉넉하게', fade(u, 1.7), { 'font-size': 14.5 }); return; }
    // k5 /health
    tx(X, 56, 'access.log', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, class: 'mono' });
    const lines = ['GET /api/users 200', 'GET /api/users/42 200', 'POST /api/orders 201'];
    el('rect', { x: X, y: 70, width: 430, height: 120, rx: 8, fill: INK });
    lines.forEach((s, i) => mono(X + 14, 98 + i * 30, s, { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.2 + i * 0.3) }));
    for (let i = 0; i < 6; i++) dot([[X + 10, 260], [X + 420, 260]], ((t * 0.7 + i / 6) % 1), INFO, 6);
    tx(X, 238, '/health 요청 (초당 여러 번)', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
    note(X, 310, 'access_log off: 로그에 남지 않는다', fade(u, 1.2), { 'font-size': 14.5 });
    check(X + 300, 305, 9, pop(u, 1.5)); }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: 'uvicorn을 --host 127.0.0.1로 띄우는 이유는 무엇인가?',
      o: ['응답 속도를 높이려고', '호스트 밖에서 :8000에 직접 닿지 못하게 하려고', 'Nginx가 0.0.0.0을 쓸 수 없어서'], a: 1,
      why: '127.0.0.1은 같은 호스트 안에서만 닿는다. 바깥 요청은 Nginx를 거쳐야만 앱에 도착한다.' },
    { q: 'location /api/에 proxy_pass http://localhost:8000/; 를 두고 /api/users/42를 부르면 백엔드가 받는 경로는 무엇인가?',
      o: ['/api/users/42', '/users/42', '/localhost/users/42'], a: 1,
      why: 'proxy_pass에 /라는 URI가 있어 location과 일치한 /api/ 부분이 /로 바뀐다.' },
    { q: 'location /api/에서 proxy_pass http://app:8000; (끝 슬래시 없음)이면 /api/users/42는 어떻게 넘어가는가?',
      o: ['/users/42로 잘려서', '/api/users/42 그대로', '/api/만 남고 나머지는 버려진다'], a: 1,
      why: 'proxy_pass에 URI가 없으면 요청 URI를 손대지 않고 넘긴다. 백엔드 라우트가 /users/만 알면 404가 난다.' },
    { q: 'upstream에 keepalive 32를 적었을 때 32는 무엇을 뜻하는가?',
      o: ['worker마다 남겨 둘 쉬는 연결의 최대 개수', '백엔드 서버 대수', '초당 보낼 수 있는 요청 수'], a: 0,
      why: 'keepalive는 백엔드와 맺은 연결을 worker마다 최대 32개까지 남겨 두었다가 다음 요청에 다시 쓰게 한다.' },
    { q: 'proxy_redirect off일 때 백엔드가 Location: http://backend/login을 보내면 클라이언트는 무엇을 받는가?',
      o: ['/api/login', 'http://backend/login 그대로', 'Location 헤더가 지워진다'], a: 1,
      why: 'off는 Location을 고치지 않는다. 기본값 default라면 http://backend/가 /api/로 바뀌어 /api/login이 된다.' },
  ];

  const summary = [
    '백엔드는 127.0.0.1:8000에만 묶고, 바깥 요청은 Nginx 하나로 받는다.',
    'proxy_pass에 URI가 있으면 location과 맞은 부분이 그 URI로 바뀌고, 없으면 그대로 간다.',
    '슬래시 한 글자로 백엔드가 /api/users/42를 받아 404가 날 수 있다.',
    'upstream으로 백엔드를 묶으면 대수가 늘어도 server 블록은 그대로 둔다.',
  ];
  const review = [
    { q: 'Nginx 뒤에 붙인 FastAPI에서 /api/users/42가 404를 낸다. 백엔드 라우트는 /users/{user_id}다. 먼저 볼 곳은?',
      o: ['FastAPI의 int 변환', 'proxy_pass 끝의 슬래시', 'Nginx의 listen 포트'], a: 1,
      why: 'proxy_pass에 URI가 없으면 /api/가 살아서 백엔드에 간다. http://app:8000/처럼 /를 붙이면 /users/42로 바뀐다.' },
    { q: '/api/를 떼고 넘기도록 바꿨더니 Swagger 화면만 깨진다. 앱 쪽에서 맞출 것은?',
      o: ['FastAPI(root_path="/api")', 'uvicorn을 0.0.0.0에 묶기', 'location을 정규식으로 바꾸기'], a: 0,
      why: 'Nginx가 /api/를 떼면 앱은 자기가 /api 아래 있다는 걸 모른다. root_path를 주면 Swagger가 /api/openapi.json을 부른다.' },
    { q: '정규식 location에서 proxy_pass http://app:8000/$1; 로 넘겼더니 ?page=2 같은 쿼리가 사라졌다. 고칠 방법은?',
      o: ['끝 슬래시를 빼기', 'keepalive를 늘리기', '$1 뒤에 $is_args$args를 붙이기'], a: 2,
      why: '변수가 든 proxy_pass는 적힌 URI를 그대로 보내므로 쿼리도 직접 붙여야 한다.' },
  ];

  R.page({ title: '리버스 프록시 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
