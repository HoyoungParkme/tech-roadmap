/* II-1-4 Consul — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 주인공: Consul Agent(:8500)와 카탈로그, 능동 헬스체크(Agent → /actuator/health 찌르기)와 passing/critical, KV 트리(config/…), Eureka 와의 방향 차이.
 * 숫자는 STEPS 의 registered·healthy·kvKeys 와 코드 블록 값(8500, 10s, 3s, 1m, 50·80·200)만 쓴다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  // Consul 노드 (육각형)
  function hex(cx, cy, r, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.02) return; const pts = [];
    for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; pts.push(`${cx + Math.cos(a) * r * s},${cy + Math.sin(a) * r * s}`); }
    el('polygon', { points: pts.join(' '), fill: o.fill || ACCBG, stroke: o.stroke || ACC, 'stroke-width': o.sw || 2.5, opacity: o.op ?? 1 });
    if (o.text) { const rows = o.text.split('\n'); rows.forEach((t, i) => tx(cx, cy + (i - (rows.length - 1) / 2) * 19 + 5, t, { 'font-size': o.fs || 15, 'font-weight': 800, fill: o.color || ACC, 'text-anchor': 'middle', opacity: s > 0.6 ? o.op ?? 1 : 0 })); } }
  function agent(x, y, o) { hex(x, y, 58, Object.assign({ text: 'Consul\nAgent' }, o || {})); mono(x, y + 80, ':8500', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: (o && o.op) ?? 1 }); }
  const stCol = (s) => (s === 'passing' ? GOOD : s === 'warning' ? WARN : BAD);
  function svc(cx, cy, name, status, o) { o = o || {}; const col = status ? stCol(status) : INK;
    const g = card(cx, cy, o.w || 190, 56, { rx: 9, stroke: col, sw: 2.2, fill: status === 'critical' ? BADBG : PANEL, s: o.s, op: o.op });
    tx(-(o.w || 190) / 2 + 14, -4, name, { 'font-size': 14.5, 'font-weight': 700, fill: INK }, g);
    if (status) mono(-(o.w || 190) / 2 + 14, 18, status, { 'font-size': 13.5, 'font-weight': 700, fill: col }, g);
    if (o.sub) mono(-(o.w || 190) / 2 + 14, 18, o.sub, { 'font-size': 13.5, fill: MUT }, g); return g; }

  // ---------- 1. Consul 이 주는 것 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { hex(480, 200, 70, { text: 'Consul', s: pop(u, 0.1), fs: 18 });
      ['user-service', 'order-service', 'catalog-service'].forEach((n, i) => { const y = 100 + i * 100; svc(140, y, n, null, { s: pop(u, 0.3 + i * 0.2) });
        dot([[236, y], [412, 200]], seg(u, 0.6 + i * 0.2, 1.1 + i * 0.2), ACC, 6); });
      fly(840, 120, 560, 180, seg(u, 1.5, 2.0), 'user-service 어디?', { fill: INFO });
      sub(760, 300, '등록하고, 이름으로 찾는다. 여기까지는 Eureka와 같다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 1) { el('line', { x1: 480, y1: 40, x2: 480, y2: 380, stroke: GRID, 'stroke-width': 2 });
      tx(240, 56, 'Eureka', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' }); tx(720, 56, 'Consul', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      server(120, 180, '인스턴스', {}); card(360, 180, 120, 60, { rx: 10, text: '레지스트리', fs: 14.5 });
      for (let q = 0; q < 2; q++) dot([[180, 180], [298, 180]], (t * 0.7 + q * 0.5) % 1, INK, 6);
      tx(240, 270, '인스턴스가 보낸다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      agent(600, 170, { s: 1 }); server(840, 170, '인스턴스', { lamp: GOOD });
      for (let q = 0; q < 2; q++) dot([[660, 170], [780, 170]], (t * 0.7 + q * 0.5) % 1, ACC, 6);
      tx(720, 290, 'Consul이 찔러본다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC });
      ['HTTP', 'TCP', 'gRPC', 'TTL', 'Script'].forEach((s, i) => pill(560 + i * 74, 340, s, ACC, pop(u, 0.8 + i * 0.2), { fs: 13.5, fill: PANEL })); return; }
    if (k === 2) { hex(150, 200, 64, { text: 'KV', fs: 20 });
      const rows = ['config/', '  application/', '    logging.level.root = INFO', '  order-service/', '    order.max-items = 50'];
      rows.forEach((s, i) => mono(300, 100 + i * 40, s, { 'font-size': 16, 'font-weight': i % 2 ? 700 : 400, fill: s.includes('=') ? ACC : INK, opacity: fade(u, 0.3 + i * 0.3) }));
      card(780, 200, 170, 60, { rx: 10, text: 'Config Server', fs: 15, color: MUT, stroke: MUT, s: pop(u, 1.6) }); cross(780, 200, 22, pop(u, 2.0));
      sub(780, 260, '별도 서버 없이 설정 중앙화', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 3) { [[250, 'DC 1'], [710, 'DC 2']].forEach(([x, n], d) => { el('ellipse', { cx: x, cy: 200, rx: 170, ry: 120, fill: SOFT, stroke: GRID, 'stroke-width': 2, opacity: fade(u, 0.1 + d * 0.3) });
        tx(x, 110, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2 + d * 0.3) });
        [-50, 0, 50].forEach((dx, i) => hex(x + dx, 170 + (i === 1 ? -14 : 14), 22, { s: pop(u, 0.3 + d * 0.3 + i * 0.1) }));
        svc(x, 260, 'user-service', null, { w: 150, s: pop(u, 0.6 + d * 0.3) }); });
      grow(420, 200, 540, 200, E(u, 1.0, 1.5), ACC, { sw: 3 }); mono(480, 186, 'WAN', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      cross(250, 260, 14, pop(u, 1.7)); dot([[300, 230], [480, 200], [660, 230]], seg(u, 1.9, 2.6), INFO, 7);
      sub(480, 370, 'DC 1이 죽으면 DC 2로 넘긴다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k4: Server(Raft) + Agent
    tx(60, 50, 'Consul Server × 3 (Raft 합의)', { 'font-size': 15, 'font-weight': 700 });
    [220, 340, 460].forEach((x, i) => { hex(x, 110, 34, { s: pop(u, 0.2 + i * 0.15), fill: i === 1 ? ACC : ACCBG, color: PANEL, text: i === 1 ? '리더' : '' }); });
    grow(254, 110, 306, 110, fade(u, 0.7), ACC, { plain: true }); grow(374, 110, 426, 110, fade(u, 0.7), ACC, { plain: true });
    [140, 340, 540].forEach((x, i) => { hex(x, 250, 26, { s: pop(u, 0.9 + i * 0.12), text: '' }); mono(x, 300, 'agent', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      card(x, 352, 110, 38, { rx: 8, text: 'Spring 앱', fs: 13.5, s: pop(u, 1.2 + i * 0.12) }); grow(x, 224, 340, 146, fade(u, 1.1), GRID, { plain: true }); });
    card(780, 140, 170, 44, { rx: 8, text: 'Eureka', fs: 15, color: MUT, stroke: MUT, op: 1 - 0.5 * E(u, 1.6, 2.2) });
    card(780, 200, 170, 44, { rx: 8, text: 'Config Server', fs: 15, color: MUT, stroke: MUT, op: 1 - 0.5 * E(u, 1.6, 2.2) });
    hex(780, 300, 50, { text: 'Consul', s: pop(u, 2.0) }); }

  // ---------- 2. 의존성 + 등록 ----------
  const AG = { x: 440, y: 200 }, CT = { x: 640, y: 50, w: 290 };
  const SVC3 = ['user-service', 'order-service', 'catalog-service'];
  function catalog(n, o) { o = o || {}; el('rect', { x: CT.x, y: CT.y, width: CT.w, height: 46 + Math.max(1, n) * 60, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2 });
    tx(CT.x + 14, CT.y + 26, '카탈로그 (서비스 목록)', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    for (let i = 0; i < n; i++) { const a = o.appear ? o.appear(i) : 1, y = CT.y + 50 + i * 60; if (a <= 0) continue;
      el('rect', { x: CT.x + 8, y, width: (CT.w - 16) * a, height: 52, rx: 6, fill: SOFT });
      mono(CT.x + 20, y + 22, SVC3[i], { 'font-size': 14.5, 'font-weight': 700, opacity: a });
      if (i === 1 && o.tags) mono(CT.x + 20, y + 43, 'version=v2  zone=seoul', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: o.tags }); } }
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) { card(480, 200, 520, 150, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5 }); tx(240, 150, 'build.gradle', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      ['spring-cloud-starter-consul-discovery', 'spring-cloud-starter-consul-config'].forEach((s, i) => fly(480, 24, 480, 192 + i * 40, seg(u, 0.3 + i * 0.5, 1.1 + i * 0.5), s, { mono: true, stay: true }));
      sub(480, 330, '등록 코드는 직접 쓰지 않는다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    agent(AG.x, AG.y, { s: k === 1 ? 1 : 1, op: k === 1 ? 0.4 : 1 });
    if (k === 1) { svc(140, 200, 'order-service', null, { sub: 'spring.application.name', s: pop(u, 0.2) });
      fly(140, 200, 640, 120, seg(u, 0.8, 1.6), 'order-service', { mono: true, stay: true });
      sub(640, 170, '이 이름이 곧 Consul 서비스 이름', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    const n = Math.round(tween(p.registered, b.registered, u, 1.0));
    SVC3.forEach((s, i) => svc(140, 100 + i * 100, s, null, { w: 180, s: k === 2 ? pop(u, 0.1 + i * 0.15) : 1 }));
    if (k === 2) SVC3.forEach((s, i) => dot([[232, 100 + i * 100], [AG.x - 50, AG.y]], seg(u, 0.4 + i * 0.25, 0.9 + i * 0.25), ACC, 6));
    grow(AG.x + 58, AG.y, CT.x, AG.y, 1, ACC, { plain: true });
    if (k <= 3) { catalog(3, { appear: k === 2 ? (i) => E(u, 0.9 + i * 0.25, 1.4 + i * 0.25) : null, tags: k === 3 ? fade(u, 0.6) : 0 });
      mono(CT.x + CT.w / 2, CT.y + 290, `등록 ${n}개`, { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      if (k === 2) mono(AG.x, 330, 'register: true', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      if (k === 3) sub(AG.x, 340, '태그는 버전·존 라우팅의 근거', fade(u, 1.3), { 'font-size': 14.5 }); return; }
    if (k === 4) { card(780, 200, 230, 70, { rx: 10, text: 'RestTemplate', fs: 16, mono: true, s: pop(u, 0.2) });
      pill(780, 140, '@Bean @LoadBalanced', ACC, pop(u, 0.7), { mono: true, fs: 14, fill: PANEL });
      sub(780, 270, '이 빈만 서비스 이름을 해석한다', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    if (k === 5) { mono(560, 70, 'http://user-service/users/42', { 'font-size': 16, 'font-weight': 700 });
      fly(232, 100, AG.x - 50, AG.y - 20, seg(u, 0.2, 0.8), 'user-service?', { fill: INFO });
      ['10.0.1.7:8081', '10.0.1.8:8081'].forEach((s, i) => { card(780, 170 + i * 70, 180, 50, { rx: 8, text: s, fs: 14, mono: true, stroke: i === 1 && u > 1.8 ? ACC : GRID, sw: i === 1 && u > 1.8 ? 3 : 1.6, s: pop(u, 1.0 + i * 0.2) }); });
      mono(780, 330, 'LoadBalancer가 하나 고름 (예시)', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    // k6: 카탈로그 응답
    terminal(560, 60, 380, 200, ['$ curl :8500/v1/catalog/services', ['{"consul":[],', '#86efac'], ['"order-service":["version=v2","zone=seoul"],', '#86efac'], ['…}', '#86efac']], 0.5 + E(u, 0.2, 1.8) * 3.5, { title: 'bash', fs: 13.5, lh: 24 });
    mono(750, 300, `등록 ${b.registered}개`, { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }

  // ---------- 3. 능동 헬스체크 ----------
  const AG3 = { x: 130, y: 200 }, IN = [100, 200, 300];
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const st = (i) => { if (k === 4 && i === 1) return u > 1.2 ? 'critical' : 'passing'; if (k === 5 && i === 1) return u > 1.6 ? 'passing' : 'critical'; return 'passing'; };
    if (k === 3) { const L = [['2xx', 'passing', '조회에 포함'], ['429', 'warning', '설정에 따라 포함'], ['그 밖', 'critical', '조회에서 제외']];
      L.forEach(([code, s, act], i) => { const y = 110 + i * 90, a = pop(u, 0.2 + i * 0.4);
        card(200, y, 140, 56, { rx: 28, text: code, fs: 18, mono: true, stroke: stCol(s), color: stCol(s), s: a });
        grow(276, y, 380, y, fade(u, 0.4 + i * 0.4), stCol(s)); pill(470, y, s, stCol(s), a, { mono: true, fs: 15, fill: PANEL });
        tx(580, y + 6, act, { 'font-size': 16, 'font-weight': 700, fill: stCol(s), opacity: fade(u, 0.6 + i * 0.4) }); });
      sub(480, 390, 'HTTP 체크 응답 코드가 상태를 정한다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 1) { const x0 = 120, W = 720, X = (s) => x0 + (s / 120) * W;
      el('line', { x1: x0, y1: 300, x2: x0 + W, y2: 300, stroke: MUT, 'stroke-width': 1.8 });
      [0, 30, 60, 90, 120].forEach((s) => { mono(X(s), 322, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); el('circle', { cx: X(s), cy: 300, r: 5, fill: INFO, opacity: fade(u, 1.4) }); });
      el('rect', { x: X(0), y: 240, width: (X(60) - X(0)) * E(u, 0.3, 1.2), height: 30, rx: 4, fill: BAD, opacity: 0.85 });
      tx(X(30), 261, 'critical 1분', { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      mono(X(60) + 14, 230, '이 뒤 첫 정리 때 등록 해제', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      tx(X(0), 360, '파란 점 = 30초마다 도는 정리 작업', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.6) });
      mono(480, 90, 'health-check-critical-timeout: 1m', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle' });
      sub(480, 130, '잠깐 흔들린 인스턴스는 격리만, 오래 죽은 것은 등록을 지운다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 2) { svc(700, 120, 'order-service #1', 'passing', {});
      terminal(470, 180, 460, 170, ['$ curl …/actuator/health', ['{"status":"UP",', '#86efac'], [' "components":{"db":…,"consul":…}}', '#86efac']], 0.5 + E(u, 0.2, 1.6) * 2.5, { title: 'show-details: always', fs: 13.5, lh: 24 });
      agent(AG3.x, AG3.y, {}); dot([[AG3.x + 58, AG3.y], [600, 120]], (t * 0.6) % 1, ACC, 6);
      sub(250, 360, '찔러볼 대상은 앱이 열어 준다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    agent(AG3.x, AG3.y, {});
    IN.forEach((y, i) => { const s = st(i); svc(760, y, `order-service #${i + 1}`, s, { w: 210 });
      const probe = (t * 0.5 + i * 0.2) % 1; if (!(k === 6)) dot([[AG3.x + 58, AG3.y], [652, y]], probe, ACC, 5); });
    const hl = Math.round(tween(p.healthy, b.healthy, u));
    if (k <= 5) mono(AG3.x, 360, `헬스 통과 ${hl} / ${b.registered}`, { 'font-size': 16, 'font-weight': 800, fill: hl < b.registered ? BAD : GOOD, 'text-anchor': 'middle' });
    if (k === 0) { mono(320, 70, 'path: /actuator/health', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(320, 98, 'interval: 10s', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      mono(320, 126, 'timeout: 3s', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      clock(420, 310, 26, (t % 3) / 3, ACC, '10초마다'); return; }
    if (k === 4) { pill(560, 200, '503 DOWN', BAD, pop(u, 0.3), { mono: true, fs: 14, fill: PANEL }); tx(560, 240, 'DB 커넥션 끊김', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      clock(420, 300, 20, E(u, 0.4, 1.2), BAD, '다음 체크'); return; }
    if (k === 5) { svc(400, 330, 'user-service', null, { w: 160 });
      [0, 2].forEach((j, q) => { for (let r = 0; r < 2; r++) dot([[480, 330], [652, IN[j]]], (t * 0.6 + q * 0.3 + r * 0.5) % 1, INFO, 5); });
      if (u > 1.6) dot([[480, 330], [652, IN[1]]], (t * 0.6) % 1, INFO, 5);
      pill(560, 200, u > 1.6 ? '200 → passing' : '제외 중', u > 1.6 ? GOOD : BAD, 1, { mono: true, fs: 14, fill: PANEL }); return; }
    // k6
    terminal(260, 40, 330, 110, ['$ GET /v1/health/service/', '  order-service?passing=true'], 0.3 + E(u, 0.2, 1.0) * 1.7, { title: 'HTTP', fs: 13.5 });
    IN.forEach((y, i) => fly(652, y, 420, 200 + i * 40, seg(u, 1.2 + i * 0.2, 1.7 + i * 0.2), `#${i + 1} passing`, { mono: true, stay: true, fill: GOOD }));
    sub(430, 380, '디스커버리는 passing만 묻는다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 4. KV 로 설정 ----------
  const KV = [['config/application/', 'logging.level.root', 'INFO'], ['config/application/', 'feature.new-checkout', 'false'],
    ['config/order-service/', 'order.max-items', '50'], ['config/order-service/', 'order.currency', 'KRW'], ['config/order-service,prod/', 'order.max-items', '200']];
  function kvRows(n, o) { o = o || {}; for (let i = 0; i < n; i++) { const [path, key, val] = KV[i], y = 70 + i * 50, a = o.appear ? o.appear(i) : 1; if (a <= 0) continue;
      const hot = o.hot === i, col = path.includes(',prod') ? WARN : path.includes('order') ? ACC : INK;
      el('rect', { x: 30, y: y - 20, width: 520 * a, height: 38, rx: 6, fill: hot ? WARNBG : SOFT });
      mono(42, y + 5, path, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: a }); mono(42 + R.tw(path, 14), y + 5, key, { 'font-size': 14, opacity: a });
      mono(540, y + 5, o.val && o.val(i) != null ? o.val(i) : val, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: hot ? WARN : INK, opacity: a }); } }
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const n = [2, 4, 5, 5, 5, 5, 5, 5][k], prevN = [0, 2, 4, 5, 5, 5, 5, 5][k];
    const cnt = Math.round(tween(p.kvKeys, b.kvKeys, u));
    if (k <= 3) { kvRows(n, { appear: (i) => (i >= prevN ? E(u, 0.2 + (i - prevN) * 0.4, 0.8 + (i - prevN) * 0.4) : 1), hot: k === 3 ? 3 : null });
      hex(760, 150, 60, { text: 'KV', fs: 20 }); mono(760, 250, `키 ${cnt}개`, { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      if (k === 0) sub(760, 300, '모든 서비스가 읽는 공통 영역', fade(u, 1.4), { 'font-size': 14.5 });
      if (k === 1) { grow(560, 180, 610, 180, fade(u, 1.2), ACC); sub(760, 300, '겹치면 서비스 전용 경로가 이긴다', fade(u, 1.5), { 'font-size': 14.5 }); }
      if (k === 2) sub(760, 300, 'prod 프로파일일 때만 200', fade(u, 1.2), { 'font-size': 14.5, fill: WARN });
      if (k === 3) { terminal(30, 320, 620, 80, ['$ curl -X PUT :8500/v1/kv/config/order-service/order.currency -d KRW'], 0.2 + E(u, 0.2, 1.2), { fs: 13.5 });
        sub(760, 300, '같은 키를 덮어써서 개수는 그대로', fade(u, 1.4), { 'font-size': 14.5 }); }
      return; }
    // k4~: 오른쪽 앱
    kvRows(5, { hot: k === 7 ? 2 : null, val: (i) => (k === 7 && i === 2 && u > 0.8 ? '80' : null) });
    card(790, 200, 260, 220, { rx: 10, stroke: INK, sw: 2 }); tx(790, 116, 'order-service', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
    if (k === 4) { mono(675, 150, 'import: "consul:…:8500"', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
      [2, 3, 0].forEach((i, q) => fly(540, 70 + i * 50, 790, 200 + q * 36, seg(u, 0.4 + q * 0.4, 1.0 + q * 0.4), KV[i][1], { mono: true, stay: true }));
      sub(480, 380, 'Config Server 호출 없이 KV를 프로퍼티로 올린다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 5) { const L = ['config/order-service,prod/', 'config/order-service/', 'config/application,prod/', 'config/application/'];
      L.forEach((s, i) => mono(680, 160 + i * 34, `${i + 1}  ${s}`, { 'font-size': 13.5, 'font-weight': 700, fill: i === 0 ? WARN : i === 1 ? ACC : INK, opacity: fade(u, 0.3 + i * 0.3) }));
      sub(790, 330, '위가 강함 · 키 하나 = 프로퍼티 하나', fade(u, 1.8), { 'font-size': 14 }); return; }
    mono(680, 160, '@Value("${order.max-items}")', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
    const v = k === 7 ? (u > 1.8 ? '80' : '50') : '50';
    mono(790, 220, `maxItems = ${v}`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 7 && u > 1.8 ? GOOD : INK });
    if (k === 6) { fly(540, 170, 790, 210, seg(u, 0.3, 1.1), '50', { mono: true }); sub(790, 280, '(prod 프로파일이 아닐 때)', fade(u, 1.3), { 'font-size': 14 }); return; }
    // k7: Config Watch
    el('circle', { cx: 790, cy: 268, r: 12 + 5 * Math.sin(t * 5), fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.9) });
    tx(790, 318, 'Config Watch 감지', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    pill(790, 360, 'RefreshEvent → 빈 재생성', GOOD, pop(u, 1.5), { fs: 13.5, fill: PANEL });
    terminal(30, 330, 520, 70, ['$ consul kv put config/order-service/order.max-items 80'], 0.2 + E(u, 0.1, 0.8), { fs: 13.5 }); }

  // ---------- 5. 무엇을 고를까 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { const E1 = ['자바·Spring만 쓴다', '디스커버리만 필요', '운영을 단순하게', '가용성(AP) 우선'], C1 = ['자바 외 언어도 섞임', '능동 헬스체크', 'KV 설정 중앙화', '여러 데이터센터', '서비스 메시 확장'];
      tx(230, 56, 'Eureka를 고를 때', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      E1.forEach((s, i) => { const y = 100 + i * 56, a = k === 0 ? pop(u, 0.3 + i * 0.35) : 1; card(230, y, 340, 44, { rx: 8, stroke: k === 0 ? INK : GRID, s: a }); check(84, y, 9, a); tx(104, y + 6, s, { 'font-size': 15, 'font-weight': 600, opacity: a > 0.5 ? (k === 0 ? 1 : 0.55) : 0 }); });
      tx(720, 56, 'Consul을 고를 때', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: k === 1 ? fade(u, 0.1) : 0.4 });
      if (k === 1) C1.forEach((s, i) => { const y = 100 + i * 56, a = pop(u, 0.3 + i * 0.3); card(720, y, 340, 44, { rx: 8, stroke: ACC, s: a }); check(574, y, 9, a); tx(594, y + 6, s, { 'font-size': 15, 'font-weight': 600, opacity: a > 0.5 ? 1 : 0 }); });
      else sub(720, 200, '기능이 적다 = 운영 비용이 낮다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 2) { card(480, 170, 300, 150, { rx: 12, stroke: INK, sw: 2.2 }); tx(480, 130, '같은 앱 코드', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
      mono(480, 170, '@LoadBalanced', { 'font-size': 15, fill: ACC, 'text-anchor': 'middle' }); mono(480, 200, 'DiscoveryClient', { 'font-size': 15, fill: ACC, 'text-anchor': 'middle' });
      const sw = E(u, 0.6, 1.6); card(480, 300 + 0 * sw, 330, 44, { rx: 8, stroke: sw < 0.5 ? MUT : ACC, sw: 2.5, text: sw < 0.5 ? 'netflix-eureka-client' : 'consul-discovery', fs: 14.5, mono: true, color: sw < 0.5 ? MUT : ACC, s: 1 + 0.08 * Math.sin(sw * Math.PI) });
      tx(480, 372, 'starter만 바꾼다. 호출 코드는 그대로', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 3) { const L = [['소규모 · 자바 단일 스택', 'Eureka로 충분', INK], ['멀티 언어 · 설정 중앙화', 'Consul로 통합', ACC], ['이미 Kubernetes', 'Service + ConfigMap', INFO]];
      L.forEach(([a, b2, col], i) => { const y = 110 + i * 90, s = pop(u, 0.2 + i * 0.5); card(250, y, 340, 60, { rx: 10, stroke: GRID, s, text: a, fs: 15 });
        grow(425, y, 560, y, E(u, 0.5 + i * 0.5, 0.9 + i * 0.5), col); card(700, y, 260, 60, { rx: 10, stroke: col, sw: 2.5, s: pop(u, 0.7 + i * 0.5), text: b2, fs: 15, color: col }); });
      return; }
    // k4: 인터페이스
    card(480, 90, 280, 60, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'DiscoveryClient', fs: 17, mono: true, color: ACC });
    tx(480, 136, '«interface»', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    [['EurekaDiscoveryClient', 280], ['ConsulDiscoveryClient', 680]].forEach(([n, x], i) => { card(x, 250, 280, 56, { rx: 10, text: n, fs: 14.5, mono: true, s: pop(u, 0.4 + i * 0.4) });
      grow(x, 220, 480 + (i ? 40 : -40), 124, E(u, 0.8 + i * 0.4, 1.3 + i * 0.4), MUT, { dash: '6 5' }); });
    banner(480, 360, '인터페이스로 짜면 구현 교체는 설정 변경 수준', pop(u, 2.0)); }

  const quiz = [
    { q: 'Eureka와 Consul의 헬스 확인 방식 차이로 맞는 것은 무엇인가?',
      o: ['둘 다 인스턴스가 하트비트를 보낸다', 'Eureka는 인스턴스가 보내고, Consul은 Consul이 직접 찔러본다', 'Consul은 헬스 확인을 하지 않는다'], a: 1,
      why: 'Eureka는 renew를 받는 수동 방식이다. Consul은 /actuator/health 같은 엔드포인트를 주기적으로 호출하는 능동 방식이다.' },
    { q: 'spring-cloud-starter-consul-discovery를 넣은 order-service는 Consul에 어떤 이름으로 등록되는가?',
      o: ['spring.application.name 값인 order-service', '인스턴스 IP', 'Consul이 붙인 임의 이름'], a: 0,
      why: 'spring.application.name이 곧 Consul 서비스 이름이다. 다른 서비스는 이 이름으로 인스턴스 목록을 찾는다.' },
    { q: 'order-service #2의 /actuator/health가 503을 돌려주면 다음 체크 뒤 어떻게 되는가?',
      o: ['warning이 되어 계속 조회된다', 'critical이 되어 passing 조회 결과에서 빠진다', '즉시 등록이 지워진다'], a: 1,
      why: '2xx가 아니고 429도 아니면 critical이다. 등록 해제는 critical이 1분 넘게 이어질 때 따로 일어난다.' },
    { q: 'KV에 config/order-service/order.max-items=50과 config/order-service,prod/order.max-items=200이 있다. prod로 뜬 order-service는 어느 값을 쓰는가?',
      o: ['50', '200', '둘 중 먼저 넣은 값'], a: 1,
      why: '프로파일이 붙은 경로가 더 구체적이라 위에 온다. prod가 아닐 때만 50을 쓴다.' },
    { q: '팀이 이미 Kubernetes를 쓰고 있다. 디스커버리 도구 선택에서 먼저 따져 볼 것은?',
      o: ['Consul을 꼭 새로 깔아야 한다', 'Service와 ConfigMap으로 둘 다 없이 갈 수 있는지', 'Eureka를 반드시 함께 깐다'], a: 1,
      why: '플랫폼이 디스커버리와 설정을 이미 주는 경우가 많다. 겹치는 인프라를 또 들이지 않는 것이 먼저다.' },
  ];

  const summary = [
    'Consul은 디스커버리, 능동 헬스체크, KV, 멀티 DC를 한 도구로 준다.',
    'starter를 넣으면 spring.application.name으로 Agent(:8500)에 스스로 등록된다.',
    'Consul은 10초마다 /actuator/health를 찔러 보고, critical이 된 인스턴스는 조회에서 뺀다.',
    'KV는 config/{이름},{프로파일}/ 경로로 설정을 주고, Config Watch가 바뀐 값을 자동으로 반영한다.',
  ];
  const review = [
    { q: 'DB가 끊긴 인스턴스로 요청이 계속 간다. Consul을 쓰는데 /actuator/health가 늘 200을 준다. 먼저 의심할 것은?',
      o: ['health 응답에 DB 상태가 반영되지 않는다', 'Consul 포트가 8500이 아니다', 'KV 키 개수가 부족하다'], a: 0,
      why: 'Consul은 응답 코드만 보고 상태를 정한다. DB가 죽어도 200이면 passing으로 남아 계속 조회된다.' },
    { q: 'KV에서 order.max-items를 80으로 바꿨는데 maxItems 필드가 50 그대로다. 가장 먼저 볼 곳은?',
      o: ['그 필드를 가진 빈에 @RefreshScope가 있는지', 'Consul Server가 3대인지', '태그에 version=v2가 있는지'], a: 0,
      why: 'Config Watch가 refresh 이벤트를 내도, @Value 필드는 @RefreshScope 빈 안에 있어야 다시 주입된다.' },
    { q: 'Eureka에서 Consul로 옮기려 한다. 호출 코드를 거의 건드리지 않으려면 평소 어떻게 짜 두어야 하는가?',
      o: ['Eureka 전용 클래스를 직접 쓴다', '@LoadBalanced와 DiscoveryClient 같은 Spring Cloud 추상화로 짠다', 'IP를 설정 파일에 적어 둔다'], a: 1,
      why: '추상화가 같아서 starter만 바꾸면 된다. 구현체에 묶이면 옮길 때 호출 코드까지 고쳐야 한다.' },
  ];

  R.page({ title: 'Consul 레지스트리 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
