/* I-1-3 Spring Cloud 생태계 한눈에 보기 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: STEPS 의 catCount · stageCount · starterCount. 모듈 버전은 spring-cloud-dependencies 2023.0.3 BOM 에서 확인한 값.
 * 서킷 브레이커 창(10건 · 50%)은 Resilience4j COUNT_BASED 규칙으로 따로 흉내 내 본 결과(10번째 호출에서 5/10 = 50% → OPEN). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, cells, kvTable } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 작은 그림 (카테고리마다 다른 모양) ----------
  const G = {
    config(x, y, o) { [0, 1, 2].forEach((i) => { const fx = x - 40 + i * 30, fy = y - 8 + i * 4;
        el('path', { d: `M${fx},${fy} h20 l8,8 v26 h-28 Z`, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: o }); });
      [-1, 0, 1].forEach((d) => el('line', { x1: x + 40, y1: y + 10, x2: x + 62, y2: y + 10 + d * 14, stroke: ACC, 'stroke-width': 2, opacity: o })); },
    discovery(x, y, o) { [0, 1, 2].forEach((i) => { el('rect', { x: x - 60, y: y - 14 + i * 16, width: 120, height: 13, rx: 3, fill: i === 1 ? ACCBG : SOFT, stroke: GRID, opacity: o });
        el('circle', { cx: x + 48, cy: y - 7.5 + i * 16, r: 3.5, fill: GOOD, opacity: o }); }); },
    gateway(x, y, o) { [-24, -8, 8, 24].forEach((d) => el('line', { x1: x - 60, y1: y + 10 + d, x2: x - 14, y2: y + 10, stroke: MUT, 'stroke-width': 2, opacity: o }));
      el('rect', { x: x - 14, y: y - 8, width: 28, height: 36, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: o });
      el('line', { x1: x + 14, y1: y + 10, x2: x + 60, y2: y + 10, stroke: ACC, 'stroke-width': 3, opacity: o }); },
    resilience(x, y, o) { el('circle', { cx: x - 40, cy: y + 10, r: 5, fill: INK, opacity: o }); el('circle', { cx: x + 30, cy: y + 10, r: 5, fill: INK, opacity: o });
      el('line', { x1: x - 40, y1: y + 10, x2: x + 18, y2: y - 22, stroke: BAD, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: o });
      el('line', { x1: x - 70, y1: y + 10, x2: x - 45, y2: y + 10, stroke: MUT, 'stroke-width': 2, opacity: o }); el('line', { x1: x + 35, y1: y + 10, x2: x + 66, y2: y + 10, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: o }); },
    observ(x, y, o) { [[0, 110], [16, 70], [34, 40]].forEach(([dx, w], i) => el('rect', { x: x - 60 + dx, y: y - 14 + i * 14, width: w, height: 10, rx: 3, fill: INFO, opacity: o * (0.9 - i * 0.2) })); },
    messaging(x, y, o) { [0, 1, 2, 3].forEach((i) => el('rect', { x: x - 50 + i * 26, y: y - 4, width: 22, height: 26, rx: 3, fill: i < 3 ? WARNBG : PANEL, stroke: WARN, 'stroke-width': 1.8, opacity: o })); },
    feign(x, y, o) { mono(x - 66, y + 4, 'I', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: o }); el('line', { x1: x - 52, y1: y, x2: x - 6, y2: y, stroke: ACC, 'stroke-width': 2, opacity: o });
      mono(x - 2, y + 5, 'GET /…', { 'font-size': 14, 'font-weight': 700, fill: INK, opacity: o }); },
  };
  const CAT = [
    ['config', 'Config', 'Config Server / Bus'], ['discovery', 'Discovery', 'Eureka / Consul'], ['gateway', 'Gateway', 'Gateway / LoadBalancer'], ['resilience', 'Resilience', 'Resilience4j'],
    ['observ', 'Observability', 'Micrometer / Zipkin'], ['messaging', 'Messaging', 'Stream / Kafka Binder'], ['feign', 'OpenFeign', '선언적 HTTP 클라이언트'],
  ];
  const tilePos = (i) => (i < 4 ? [140 + i * 228, 112] : [254 + (i - 4) * 228, 290]);

  // ---------- 1. 7칸 지도 ----------
  function s1(t, c) { const { k, u } = c;
    CAT.forEach(([key, name, mod], i) => { const [x, y] = tilePos(i), on = i <= k, now = i === k && k < 6;
      if (!on) { el('rect', { x: x - 104, y: y - 74, width: 208, height: 148, rx: 12, fill: 'none', stroke: GRID, 'stroke-dasharray': '6 5' }); mono(x, y + 6, '?', { 'font-size': 22, fill: OFF, 'text-anchor': 'middle' }); return; }
      const f = now ? E(u, 0.1, 0.7) : 1;
      el('rect', { x: x - 104, y: y - 74, width: 208, height: 148 * f, rx: 12, fill: now ? ACCBG : PANEL, stroke: now ? ACC : INK, 'stroke-width': now ? 2.5 : 1.8 });
      const o = now ? fade(u, 0.6) : 1;
      tx(x, y - 44, name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: now ? ACC : INK, opacity: o });
      tx(x, y - 22, mod, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: o });
      G[key](x, y + 22, now ? fade(u, 1.0) : 1); });
    mono(890, 290, Math.round(tween(c.prev && c.prev.catCount, c.beat.catCount, u)) + ' / 7', { 'font-size': 24, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    if (k === 6) banner(480, 398, '다 쓰는 게 목표가 아니다 · 지금 겪는 문제의 칸부터', pop(u, 1.4)); }

  // ---------- 2. 요청 하나가 지나는 길 ----------
  const N = { client: 55, gw: 185, svc: 390, cb: 585, user: 830 }, Y = 196;
  function span(i, x0, x1, name, op, col) { const y = 318 + i * 26;
    el('rect', { x: x0, y, width: Math.max(2, x1 - x0), height: 18, rx: 4, fill: col || INFO, opacity: 0.85 * op });
    tx(x0 - 8, y + 14, name, { 'text-anchor': 'end', 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: op }); }
  function s2(t, c) { const { k, u } = c;
    R.person(N.client, Y, '클라이언트', {});
    card(N.gw, Y, 120, 54, { rx: 10, text: 'Gateway', fs: 15, stroke: ACC, fill: ACCBG });
    card(N.svc, Y, 170, 70, { rx: 10, stroke: k >= 2 ? ACC : INK, sw: 2.2 }); mono(N.svc, Y - 12, 'order-service', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
    card(N.user, Y, 150, 54, { rx: 10, text: 'user-service', mono: true, fs: 14, op: k >= 3 ? 1 : 0.45 });
    grow(N.client + 30, Y, N.gw - 62, Y, k === 0 ? E(u, 0.2, 0.6) : 1, ACC); grow(N.gw + 62, Y, N.svc - 87, Y, k === 0 ? E(u, 1.0, 1.4) : 1, ACC);
    if (k === 0) { dot([[N.client + 30, Y], [N.gw - 62, Y]], seg(u, 0.2, 0.7), ACC, 6); dot([[N.gw + 62, Y], [N.svc - 87, Y]], seg(u, 1.0, 1.5), ACC, 6);
      ['인증', '라우팅'].forEach((s, i) => pill(N.gw - 30 + i * 70, Y - 52, s, ACC, pop(u, 0.7 + i * 0.25), { fs: 13.5, fill: PANEL })); }
    // Discovery: 이름 → 주소
    if (k >= 1) { const o = k === 1 ? 1 : 0.6;
      kvTable(500, 22, 250, [['user-service', '10.0.3.7:8080', { hot: k === 1 && u > 1.2, op: o }]], { title: 'Discovery (예시 주소)', kw: 130, rh: 32 });
      if (k === 1) { pill(N.svc, Y + 16, 'name = "user-service"', ACC, pop(u, 0.2), { mono: true, fs: 13.5, fill: PANEL });
        dot([[N.svc + 60, Y - 30], [520, 70]], seg(u, 0.6, 1.2), ACC, 6); dot([[700, 70], [N.svc + 80, Y - 30]], seg(u, 1.5, 2.2), INK, 6); }
      else if (k === 2) mono(N.svc, Y + 20, '→ 10.0.3.7', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); }
    // Config: 값이 밖에서 들어온다
    if (k >= 2) { card(N.svc - 230 + 230, 60, 150, 44, { rx: 9, text: 'Config Server', fs: 14, stroke: ACC, op: k === 2 ? fade(u, 0.1) : 0.6 });
      if (k === 2) { fly(N.svc, 84, N.svc, Y - 34, seg(u, 0.6, 1.6), 'order.max-items = 20', { mono: true }); sub(N.svc, Y + 52, 'maxItems = 20 (재배포 없이 바꾸는 값)', fade(u, 1.7), { 'font-weight': 700, fill: ACC }); } }
    // OpenFeign: 메서드 호출이 HTTP 로
    if (k >= 3) { const line = k === 3 ? E(u, 1.0, 1.8) : 1;
      grow(N.svc + 87, Y, lerp(N.svc + 87, N.user - 77, line), Y, 1, ACC, { plain: line < 1 });
      if (k === 3) { const m = E(u, 0.4, 1.0);
        if (m < 1) mono(N.svc, Y + 20, 'userClient.findById(7)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: INK, opacity: 1 - m });
        fly(N.svc + 40, Y + 20, N.user - 30, Y - 40, seg(u, 1.0, 2.1), 'GET /users/7', { mono: true, stay: true });
        sub(N.svc, Y + 56, '인터페이스 한 줄 = HTTP 요청 한 번', fade(u, 1.5), { 'font-weight': 700, fill: INK }); } }
    // CircuitBreaker + 추적
    if (k === 4) { el('rect', { x: N.cb - 36, y: Y - 26, width: 72, height: 52, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 2.2, opacity: pop(u, 0.2) });
      mono(N.cb, Y + 5, 'CB', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4) });
      dot([[N.client + 30, Y], [N.gw, Y], [N.svc, Y], [N.cb, Y], [N.user - 77, Y]], seg(u, 0.6, 1.8), INFO, 7); }
    // 아래: 같은 traceId 로 묶이는 구간들
    const sp = [[0, 'gateway', N.gw - 60, 900], [1, 'order', N.svc - 85, 880], [3, 'user', N.user - 75, 860]];
    const showSp = (i) => (i === 0 ? true : i === 1 ? k >= 2 : k >= 3);
    sp.forEach(([, n, x0, x1], i) => { if (!showSp(i)) return; const fresh = (i === 0 && k === 0) || (i === 1 && k === 2) || (i === 2 && k === 3);
      span(i, x0, fresh ? lerp(x0, x1, E(u, 0.8, 2.0)) : x1, n, 1); });
    tx(30, 306, 'traceId 하나 아래의 구간(span)', { 'font-size': 13.5, 'font-weight': 700, fill: INFO });
    if (k === 4) { mono(480, 410, 'traceId 같음 · spanId 구간마다 다름', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.8) }); } }

  // ---------- 3. starter 이름 규칙 + BOM ----------
  const DEP = [
    ['spring-cloud-starter-', 'gateway', '4.1.5'], ['spring-cloud-starter-', 'config', '4.1.3'], ['spring-cloud-starter-', 'openfeign', '4.1.3'],
    ['spring-cloud-starter-', 'netflix-eureka-client', '4.1.3'], ['spring-cloud-starter-', 'circuitbreaker-reactor-resilience4j', '3.1.2'], ['spring-cloud-starter-', 'stream-kafka', '4.1.3'],
    ['io.micrometer:', 'micrometer-tracing-bridge-brave', 'Boot BOM'] ];
  function s3(t, c) { const { k, u } = c;
    // 위: Boot → 짝 → BOM
    card(120, 64, 190, 64, { rx: 10, stroke: INK, sw: 2.2, s: k === 0 ? pop(u, 0.2) : 1 });
    mono(120, 58, 'Boot 3.3.2', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.4) : 1 });
    mono(120, 80, 'dep-mgmt 1.1.6', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: k === 0 ? fade(u, 0.7) : 1 });
    if (k === 0) sub(120, 118, '먼저 정한다', fade(u, 1.2), { 'font-weight': 700, fill: INK });
    if (k >= 1) { const g = k === 1 ? E(u, 0.2, 0.8) : 1; grow(218, 64, lerp(218, 352, g), 64, 1, MUT, { plain: g < 1 });
      card(470, 64, 230, 48, { rx: 9, text: '3.3.x  ↔  2023.0.x', mono: true, fs: 15, stroke: WARN, s: k === 1 ? pop(u, 0.6) : 1 });
      grow(588, 64, lerp(588, 650, k === 1 ? E(u, 1.0, 1.3) : 1), 64, 1, MUT, { plain: k === 1 && u < 1.3 });
      card(800, 64, 290, 64, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: k === 1 ? pop(u, 1.3) : 1 });
      mono(800, 58, 'spring-cloud-dependencies', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 1 ? fade(u, 1.5) : 1 });
      mono(800, 80, '2023.0.3 (BOM)', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 1.6) : 1 });
      if (k === 1) sub(800, 118, '모듈 버전은 이제 적지 않는다', fade(u, 2.0), { 'font-weight': 700, fill: ACC }); }
    // 아래: 의존성 표
    const n = k < 2 ? 0 : k === 2 ? 3 : k === 3 ? 6 : 7;
    if (n) { tx(40, 160, 'implementation', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, class: 'mono' }); tx(740, 160, '버전 (누가 채우나)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); }
    DEP.slice(0, n).forEach(([pre, fn, v], i) => { const y = 186 + i * 30, fresh = (k === 2 && i < 3) || (k === 3 && i >= 3 && i < 6) || (k === 4 && i === 6);
      const a = fresh ? 0.2 + (i % 3) * 0.35 : 0, op = fresh ? fade(u, a) : 1, bridge = i === 6;
      R.spans(40, y, [[pre, { fill: bridge ? WARN : MUT }], [fn, { fill: bridge ? WARN : ACC, 'font-weight': 700 }]], { 'font-size': 13.5, opacity: op });
      const vo = fresh ? fade(u, a + 0.9) : 1;
      if (fresh) dot(bridge ? [[120, 96], [745, y - 5]] : [[800, 96], [745, y - 5]], seg(u, a + 0.4, a + 0.9), bridge ? INK : ACC, 5);
      mono(750, y, v, { 'font-size': 14, 'font-weight': 800, fill: bridge ? INK : ACC, opacity: vo }); });
    if (k === 4) sub(480, 412, '관측 bridge는 starter가 아니라서 버전을 Boot 쪽 BOM이 정한다', fade(u, 1.6), { 'font-weight': 700, fill: WARN, 'font-size': 14 }); }

  // ---------- 4. 문제 신호 → 설정 몇 줄 ----------
  const YML = ['application.name', 'config.import', 'cloud.stream', 'eureka.client', 'resilience4j', 'management.tracing'];
  const SEQ = 'OOFOFFOFOF';   // 흉내 낸 호출 결과 (O 성공, F 실패)
  function s4(t, c) { const { k, u } = c, SX = 560, SY = 196;
    tx(30, 44, 'application.yml', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: MUT });
    YML.forEach((s, i) => { const on = i === k, done = i < k;
      card(140, 80 + i * 52, 220, 38, { rx: 8, text: s, mono: true, fs: 13.5, stroke: on ? ACC : done ? INK : GRID, fill: on ? ACCBG : PANEL, color: on || done ? INK : OFF, sw: on ? 2.5 : 1.5 }); });
    card(SX, SY, 180, 60, { rx: 10, stroke: ACC, sw: 2.5 });
    mono(SX, SY + 6, k === 0 ? 'order-service'.slice(0, Math.round(13 * E(u, 0.2, 1.0))) : 'order-service', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
    if (k === 0) { [['Discovery 등록 이름', 400, 90], ['추적 화면의 서비스 이름', 720, 90]].forEach(([s, x, y], i) => { grow(SX + (i ? 40 : -40), SY - 32, x, y + 16, E(u, 1.0 + i * 0.3, 1.5 + i * 0.3), ACC); pill(x, y, s, ACC, pop(u, 1.4 + i * 0.3), { fs: 13.5, fill: PANEL }); }); }
    // 붙은 모듈은 둘레에 남는다
    if (k >= 1) { const o = k === 1 ? 1 : 0.55; card(SX, 60, 170, 42, { rx: 9, text: 'Config Server', fs: 14, stroke: ACC, dash: '6 4', op: o * (k === 1 ? fade(u, 0.2) : 1) });
      if (k === 1) { grow(SX, 82, SX, SY - 32, E(u, 0.6, 1.2), ACC); pill(SX + 150, 128, 'optional:', WARN, pop(u, 1.4), { mono: true, fs: 13.5, fill: PANEL }); sub(SX + 150, 160, '서버가 없어도 뜬다', fade(u, 1.7), { fill: WARN, 'font-weight': 700 }); } }
    if (k >= 2) { const o = k === 2 ? 1 : 0.55, x0 = 760;
      cells(x0, SY - 15, ['', '', '', ''], { w: 34, h: 30, gap: 4, style: (i) => ({ stroke: WARN, fill: i < (k === 2 ? Math.round(lerp(0, 4, E(u, 0.8, 2.2))) : 4) ? WARNBG : PANEL, op: o }) });
      mono(x0 + 74, SY - 26, 'order.created', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: o });
      if (k === 2) { mono(x0 + 74, SY + 38, 'kafka:9092', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
        pill(SX, SY + 58, 'orderCreated-out-0', WARN, pop(u, 0.3), { mono: true, fs: 13.5, fill: PANEL });
        for (let i = 0; i < 4; i++) dot([[SX + 90, SY], [x0, SY]], seg(u, 0.6 + i * 0.35, 1.0 + i * 0.35), WARN, 5); } }
    if (k >= 3) { const o = k === 3 ? 1 : 0.55;
      kvTable(770, 40, 170, [['ORDER-SERVICE', '', { op: k === 3 ? fade(u, 1.3) : 1, hot: k === 3 }]], { title: 'Eureka', kw: 150, rh: 32 });
      if (o < 1) el('rect', { x: 766, y: 36, width: 178, height: 70, fill: PANEL, opacity: 0.45 });
      if (k === 3) { fly(SX + 60, SY - 30, 855, 86, seg(u, 0.4, 1.3), 'REGISTER', { mono: true }); sub(855, 128, 'defaultZone 한 줄로 등록', fade(u, 1.6), { 'font-weight': 700, fill: ACC }); } }
    // 서킷 브레이커: 최근 10건 중 실패 5건 → OPEN
    if (k === 4) { const n = Math.min(10, Math.floor(lerp(0, 10.99, E(u, 0.2, 2.0)))), x0 = 330, y0 = 316;
      tx(x0, 304, '슬라이딩 창 10건', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      for (let i = 0; i < 10; i++) { const r = SEQ[i], on = i < n;
        card(x0 + 17 + i * 38, y0 + 18, 34, 34, { rx: 5, text: on ? (r === 'O' ? '✓' : '✕') : '', fs: 15, stroke: on ? (r === 'O' ? GOOD : BAD) : GRID, fill: on && r === 'F' ? BADBG : PANEL, color: r === 'O' ? GOOD : BAD }); }
      const fails = [...SEQ.slice(0, n)].filter((x) => x === 'F').length, open = n >= 10;
      mono(x0, 386, `실패 ${fails} / ${n}` + (n < 10 ? '  (10건 전엔 계산 안 함)' : '  = 50%'), { 'font-size': 14.5, 'font-weight': 800, fill: open ? BAD : INK });
      if (open) pill(820, 334, 'OPEN · 호출 차단', BAD, pop(u, 2.05), { fs: 14, fill: BADBG });
      else pill(820, 334, 'CLOSED', GOOD, 1, { fs: 14, fill: PANEL }); }
    // 추적 샘플링 1.0
    if (k === 5) { const x0 = 330, y0 = 330;
      card(860, 330, 120, 48, { rx: 9, text: 'Zipkin\n:9411', fs: 13.5, stroke: INFO, s: pop(u, 0.2) });
      for (let i = 0; i < 10; i++) { const a = 0.3 + i * 0.16; dot([[SX, SY + 32], [x0 + i * 40, y0], [800, 330]], seg(u, a, a + 0.9), INFO, 5); }
      mono(x0, 400, 'probability 1.0 → 10건 모두 추적', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      sub(800, 400, 'Boot 기본값은 0.1', fade(u, 2.0), { 'font-weight': 700, fill: MUT }); } }

  // ---------- 5. 도입 순서 ----------
  const PH = [['Config', '설정을 밖으로'], ['Eureka + Gateway', '골격'], ['OpenFeign', '호출 정리'], ['Resilience4j', '장애 가두기'], ['Tracing', '눈을 뜬다'], ['Stream · Kafka', '필요할 때만']];
  const PX = (i) => 40 + i * 148, PT = (i) => 330 - i * 50;
  function s5(t, c) { const { k, u } = c;
    PH.forEach(([m, w], i) => { if (i > k) return; const now = i === k, h = now ? E(u, 0.1, 0.8) : 1, top = PT(i), bot = 392, last = i === 5;
      el('rect', { x: PX(i), y: lerp(bot, top, h), width: 140, height: (bot - top) * h, rx: 6, fill: now ? ACCBG : SOFT, stroke: now ? ACC : last ? MUT : INK, 'stroke-width': now ? 2.5 : 1.6, 'stroke-dasharray': last ? '6 4' : null });
      const o = now ? fade(u, 0.7) : 1;
      tx(PX(i) + 10, top + 22, 'phase ' + (i + 1), { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: o });
      tx(PX(i) + 8, top + 44, m, { 'font-size': 14, 'font-weight': 800, fill: now ? ACC : INK, opacity: o });
      if (bot - top > 80) tx(PX(i) + 10, top + 66, w, { 'font-size': 13.5, fill: MUT, opacity: o }); });
    const arc = (i, j, s, col, g) => { const x1 = PX(i) + 70, y1 = PT(i) - 6, x2 = PX(j) + 70, y2 = PT(j) - 6, mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 50;
      if (g > 0) { const pth = el('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': g < 1 ? `${g * 300} 300` : '6 4', 'marker-end': g >= 1 ? 'url(#ra-ah)' : null }); }
      tx(mx, my + 14, s, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: g >= 1 ? 1 : 0 }); };
    if (k === 0) sub(110, 230, '없으면 뒤 단계 전부 재배포', fade(u, 1.2), { 'font-weight': 700, fill: INK });
    if (k >= 1) arc(1, 0, '', MUT, 0);
    if (k === 1) sub(258, 190, '이름 호출 + 단일 진입점 한 묶음', fade(u, 1.2), { 'font-weight': 700, fill: ACC });
    if (k >= 3) arc(3, 2, '감쌀 호출 지점', WARN, k === 3 ? E(u, 0.9, 1.7) : 1);
    if (k >= 4) arc(4, 3, '임계값의 근거', INFO, k === 4 ? E(u, 0.9, 1.7) : 1);
    if (k === 5) banner(300, 60, '신호가 온 phase만, 순서대로', pop(u, 1.2)); }

  const quiz = [
    { q: '"order-service 어디 있어?"라는 문제는 7개 카테고리 중 어느 칸에 속하는가?',
      o: ['Config', 'Discovery', 'Messaging'], a: 1,
      why: 'Discovery는 이름으로 인스턴스 주소를 찾는 칸이다. Eureka와 Consul이 대표다.' },
    { q: '@FeignClient(name = "user-service")의 "user-service"를 실제 주소로 바꾸는 것은 무엇인가?',
      o: ['Gateway', 'Config Server', 'Discovery'], a: 2,
      why: '코드에는 이름만 남고 Discovery가 인스턴스 주소로 풀어 준다. 그래서 IP를 하드코딩하지 않는다.' },
    { q: 'build.gradle에서 spring-cloud-starter-openfeign에 버전을 적지 않아도 되는 이유는 무엇인가?',
      o: ['spring-cloud-dependencies 2023.0.3 BOM이 버전을 채워 주기 때문이다', 'starter에는 버전이 없기 때문이다', '가장 최신 버전이 자동으로 받아지기 때문이다'], a: 0,
      why: 'dependencyManagement로 BOM을 import하면 openfeign은 4.1.3으로 정해진다. BOM은 Boot 3.3.x와 짝인 2023.0.x에서 고른다.' },
    { q: 'sliding-window-size 10, failure-rate-threshold 50일 때 회로가 처음 열리는 때는 언제인가?',
      o: ['첫 실패가 난 바로 그때', '최근 10건 중 실패가 5건 이상이 된 때', '실패가 연속 10번 난 때'], a: 1,
      why: '창이 10건 차야 실패율을 계산하고, 그 비율이 50% 이상이면 OPEN이 된다. 흉내 낸 순서에서는 10번째 호출에서 5/10이 되어 열렸다.' },
    { q: '도입 로드맵에서 Resilience4j를 OpenFeign 다음에 두는 이유는 무엇인가?',
      o: ['호출이 인터페이스로 정리돼야 감쌀 지점이 한곳에 모이기 때문이다', 'Resilience4j가 OpenFeign보다 무겁기 때문이다', '두 모듈은 함께 쓸 수 없기 때문이다'], a: 0,
      why: '호출 코드가 흩어져 있으면 CircuitBreaker로 감쌀 대상도 흩어진다. 정리된 호출 지점에 격리를 건다.' },
  ];

  const summary = [
    'Spring Cloud는 프레임워크 하나가 아니라 7개 카테고리로 나뉜 모듈 모음이다.',
    '요청은 Gateway, Discovery, 서비스, OpenFeign, CircuitBreaker를 지나고 traceId로 묶인다.',
    'starter는 spring-cloud-starter-{기능}이고 버전은 Boot 3.3.x와 짝인 BOM 2023.0.3이 채운다.',
    'Config부터 Messaging까지 순서대로, 문제 신호가 온 모듈만 얹는다.',
  ];
  const review = [
    { q: '서비스 하나가 느려지자 전체 응답이 늦어졌는데 어디서 늦는지 모른다. 먼저 얹을 카테고리는?',
      o: ['Messaging', 'OpenFeign', 'Observability'], a: 2,
      why: 'traceId로 전 구간을 이어 봐야 느린 구간이 보인다. 추적이 있어야 Resilience 임계값도 근거 있게 정한다.' },
    { q: 'Boot 3.3.2 프로젝트에서 BOM을 2024.0.0으로 올렸더니 기동이 깨졌다. 먼저 의심할 것은?',
      o: ['starter 이름 규칙이 바뀌었다', 'BOM이 Boot 3.3.x의 짝인 2023.0.x가 아니다', 'Kafka 브로커 주소가 틀렸다'], a: 1,
      why: 'BOM은 Boot 버전에 맞춰 고른다. Boot 3.3.x의 짝은 2023.0.x다.' },
    { q: '개발 서버에서 management.tracing.sampling.probability를 1.0으로 뒀다. 운영에 그대로 올리면 생길 일은?',
      o: ['모든 요청의 span을 Zipkin으로 보내 부담이 커진다', '추적이 꺼진다', 'Eureka 등록이 실패한다'], a: 0,
      why: '1.0은 요청을 전부 추적한다는 뜻이다. 운영에서는 확률을 낮춰 보낼 양을 줄인다.' },
  ];

  R.page({ title: 'MSA 요청 흐름 · 모듈 지도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
