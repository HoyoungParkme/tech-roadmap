/* I-1-1 MSA에서 Spring Boot의 한계 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 계기판 숫자는 STEPS 의 services · configFiles · unknownAddrs 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, cross, check, kvTable, meters, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 아래 계기판: 서비스 수 · yml 파일 수 · 주소 모르는 호출 (앞 beat 값에서 이어서)
  function gauges(c, y) { const b = c.beat, p = c.prev || {};
    const s = tween(p.services, b.services, c.u), f = tween(p.configFiles, b.configFiles, c.u), a = tween(p.unknownAddrs, b.unknownAddrs, c.u);
    meters(150, y || 330, 660, [
      { name: '서비스 수', val: Math.round(s) + '개', good: b.services === 1 },
      { name: 'yml 파일 수', val: Math.round(f) + '개', bar: f / 12 * 100, hot: f >= 8 },
      { name: '주소 모르는 호출', val: Math.round(a) + '건', hot: a >= 1, good: b.unknownAddrs === 0 },
    ], { h: 64 }); }
  // 서비스 상자 (이름 + 아래 작은 글)
  function svc(cx, cy, name, o) { o = o || {}; const w = o.w || 130, h = o.h || 46;
    card(cx, cy, w, h, { rx: 9, stroke: o.stroke || INK, fill: o.fill || PANEL, sw: o.sw || 2, s: o.s, op: o.op, dash: o.dash });
    if ((o.s ?? 1) > 0.05) tx(cx, cy + (o.note ? -3 : 5), name, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 700, class: o.mono === false ? null : 'mono', fill: o.color || INK, opacity: o.op ?? 1 });
    if (o.note && (o.s ?? 1) > 0.05) tx(cx, cy + 15, o.note, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.noteCol || MUT, opacity: o.op ?? 1 }); }
  // yml 파일 아이콘
  function yml(cx, cy, o) { o = o || {}; const w = o.w || 46, h = o.h || 56, f = 12, x = cx - w / 2, y = cy - h / 2, op = o.op ?? 1;
    el('path', { d: `M${x},${y} H${x + w - f} L${x + w},${y + f} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    el('path', { d: `M${x + w - f},${y} V${y + f} H${x + w}`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 1.5, opacity: op });
    if (o.label !== false) mono(cx, cy + 6, o.label || 'yml', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: o.stroke || INK, opacity: op }); }

  // ---------- 1. Boot 한 대 ----------
  function s1(t, c) { const { k, u } = c;
    const box = k === 0 ? pop(u, 0.2) : 1, inOp = k === 0 ? fade(u, 0.8) : 1;
    card(320, 160, 560, 250, { rx: 14, stroke: ACC, sw: 2.5, fill: ACCBG, s: box });
    tx(60, 58, 'shop.jar · 프로세스 1개 (JVM)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: inOp });
    pill(510, 35, 'localhost:8080', ACC, k === 0 ? pop(u, 1.0) : 1, { mono: true, fs: 13.5, fill: PANEL });
    svc(160, 160, 'OrderService', { w: 170, op: inOp });
    svc(460, 108, 'ProductService', { w: 180, op: inOp });
    svc(460, 178, 'PaymentService', { w: 180, op: inOp });
    svc(460, 248, 'OrderRepository', { w: 180, op: inOp, color: MUT });
    if (k === 0) sub(160, 205, '진입점 @SpringBootApplication', fade(u, 1.4), { 'font-size': 13.5 });
    // 1) 같은 힙의 객체 참조
    if (k >= 1) { const g = k === 1 ? E(u, 0.2, 1.1) : 1;
      grow(245, 150, 368, 112, g, ACC); grow(245, 168, 368, 178, g, ACC);
      if (k === 1) { sub(300, 98, '객체 참조', fade(u, 1.0), { fill: ACC, 'font-weight': 700 }); sub(160, 205, '주소를 물을 일이 없다', fade(u, 1.5), { 'font-weight': 700, fill: INK }); } }
    // 2) 한 트랜잭션
    if (k >= 2) { const g = k === 2 ? fade(u, 0.2) : 1;
      el('rect', { x: 360, y: 80, width: 200, height: 196, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: g });
      grow(245, 175, 368, 245, k === 2 ? E(u, 0.2, 0.8) : 1, ACC);
      tx(460, 296, '@Transactional', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: WARN, 'text-anchor': 'middle', opacity: g });
      dbIcon(730, 150, 'DB 1개', { s: 0.9, op: k === 2 ? fade(u, 0.4) : 1 });
      if (k === 2) { [['reserve', 108], ['charge', 178], ['save', 248]].forEach(([s, y], i) => { const a = 0.5 + i * 0.45;
          dot([[555, y], [680, 150]], seg(u, a, a + 0.5), ACC, 6); });
        pill(730, 250, 'COMMIT 1번 (전부 또는 0)', GOOD, pop(u, 1.9), { fs: 13.5, fill: PANEL }); } }
    // 3) 설정 파일 하나
    if (k >= 3) { const g = k === 3 ? pop(u, 0.2) : 1;
      yml(870, 150, { op: clamp(g) });
      if (k === 3) { ['DB 접속', 'API key', 'feature flag'].forEach((s, i) => pill(870, 205 + i * 32, s, INK, pop(u, 0.6 + i * 0.35), { fs: 13.5, fill: PANEL }));
        sub(870, 105, 'application.yml', fade(u, 0.4), { 'font-weight': 700, fill: INK }); }
      else sub(870, 200, 'yml 1개', 1, { 'font-weight': 700 }); }
    // 4) 배포·추적
    if (k === 4) { terminal(620, 214, 320, 96, ['$ java -jar shop.jar', '$ grep "order 42" app.log', ['  로그 한 곳에서 끝', 'var(--term)']], lerp(0, 3, E(u, 0.2, 1.8)), { fs: 13.5 });
      banner(320, 304, 'Boot 만으로 충분하다', pop(u, 2.0)); }
    gauges(c); }

  // ---------- 2. 네 서비스로 쪼갬 ----------
  const SP = { order: [120, 165], product: [390, 78], payment: [390, 248], user: [600, 165] };
  function s2(t, c) { const { k, u } = c, b = c.beat;
    const sp = k === 0 ? E(u, 0.2, 1.3) : 1;
    Object.entries(SP).forEach(([n, [x, y]]) => { const cx = lerp(330, x, sp), cy = lerp(165, y, sp);
      svc(cx, cy, sp > 0.55 ? n : '', { w: 120, stroke: n === 'order' ? ACC : INK, });
      if (sp > 0.95) dbIcon(n === 'order' ? cx : cx + 92, n === 'order' ? cy + 58 : cy, null, { s: 0.38, op: k === 0 ? fade(u, 1.4) : 1, stroke: MUT }); });
    // HTTP 선
    const L1 = [[182, 152], [328, 90]], L2 = [[182, 178], [328, 236]];
    const lg = k === 0 ? E(u, 1.3, 2.0) : 1;
    grow(L1[0][0], L1[0][1], L1[1][0], L1[1][1], lg, b.unknownAddrs >= 1 ? BAD : MUT, { plain: true }); grow(L2[0][0], L2[0][1], L2[1][0], L2[1][1], lg, b.unknownAddrs >= 2 ? BAD : MUT, { plain: true });
    if (k === 0) { sub(250, 70, 'RestClient (HTTP)', fade(u, 1.6), { 'font-weight': 700, fill: INK });
      tx(90, 290, '@Transactional', { 'font-size': 14, class: 'mono', 'font-weight': 700, fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 1.9) });
      sub(170, 312, '다른 DB는 못 덮는다', fade(u, 2.1), { fill: BAD, 'font-weight': 700 }); }
    if (k >= 1) { pill(205, 108, 'http://???:8081', BAD, k === 1 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5, fill: PANEL });
      if (k === 1) dot(L1, seg(u, 0.6, 1.6) * 0.92, BAD, 6);
      lbl(390, 46, '?', k === 1 ? fade(u, 1.5) : 1, { 'font-size': 22, fill: BAD }); }
    if (k >= 2) { pill(205, 222, 'http://???:8082', BAD, k === 2 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5, fill: PANEL });
      if (k === 2) { dot(L2, seg(u, 0.6, 1.6) * 0.92, BAD, 6); sub(390, 295, '실패하면 재시도? 끊기?', fade(u, 1.4), { fill: WARN, 'font-weight': 700 }); } }
    if (k === 3) { check(470, 228, 10, pop(u, 0.3)); sub(390, 295, '결제는 성공', fade(u, 0.3), { fill: GOOD, 'font-weight': 700 });
      cross(120, 223, 9, pop(u, 0.9)); sub(120, 262, 'order 저장 실패', fade(u, 0.9), { fill: BAD, 'font-weight': 700 });
      const g = E(u, 1.4, 2.3); if (g > 0) el('path', { d: 'M178,250 Q260,330 330,266', fill: 'none', stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: g });
      sub(300, 312, '보상(refund)은 직접 짜야 한다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); }
    if (k === 4) { [['주소 → Discovery', ACC], ['설정 → Config', ACC], ['장애 → CircuitBreaker', BAD], ['추적 → Tracing', INFO], ['비동기 → Stream', WARN]].forEach(([s, col], i) =>
        pill(830, 40 + i * 52, s, col, pop(u, 0.2 + i * 0.3), { fs: 14, fill: PANEL }));
      sub(830, 300, '코드를 쪼갠 대가', fade(u, 1.9), { 'font-weight': 700, fill: INK }); }
    gauges(c); }

  // ---------- 3. yml 12개 ----------
  const ROWS = ['user', 'product', 'order', 'payment'], ENVS = ['dev', 'stg', 'prod'];
  const cellXY = (i) => { const r = Math.floor(i / 3), q = i % 3; return [178 + q * 72, 82 + r * 56]; };
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const shown = k === 0 ? lerp(0, 3, E(u, 0.2, 1.4)) : tween(p.configFiles, b.configFiles, u);
    ENVS.forEach((e, q) => mono(178 + q * 72, 44, e, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 }));
    const gather = k === 4 ? E(u, 0.3, 1.3) : 0;
    ROWS.forEach((r, i) => mono(132, 88 + i * 56, r, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700, fill: i * 3 < shown ? INK : OFF, opacity: 1 - gather * 0.7 }));
    for (let i = 0; i < 12; i++) { const s = clamp(shown - i); const [x, y] = cellXY(i);
      if (s <= 0) { el('rect', { x: x - 23, y: y - 28, width: 46, height: 56, rx: 4, fill: 'none', stroke: GRID, 'stroke-dasharray': '4 4', opacity: 1 - gather }); continue; }
      const hot = k === 3 && u > 1.0 && seg(u, 1.0 + i * 0.08, 1.2 + i * 0.08) > 0;
      yml(lerp(x, 720, gather), lerp(y, 92, gather), { op: s * (1 - gather * 0.85), stroke: hot ? WARN : INK, fill: hot ? WARNBG : PANEL, label: gather > 0 ? false : ENVS[i % 3] === 'prod' ? 'prod' : 'yml' }); }
    // 큰 숫자
    mono(250, 330, 'yml ' + Math.round(shown) + '개', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: shown >= 8 ? BAD : INK, opacity: k === 4 ? 1 - gather : 1 });
    sub(250, 356, '서비스 4 × 환경 3', k === 4 ? 1 - gather : 1);
    // 오른쪽: 이 beat 의 파일 내용
    if (k === 0) { const s = fade(u, 1.4); grow(305, 82, 470, 82, E(u, 1.3, 1.7), MUT);
      snippet(480, 52, ['# user-service/application-prod.yml', 'url: jdbc:postgresql://prod-db-user:5432/user', 'username: user_prod', 'password: ${USER_DB_PASSWORD}'], { fs: 13.5, op: s }); }
    if (k === 1) { snippet(480, 268, ['redis:', '  host: prod-redis.svc', '  password: ${REDIS_PASSWORD}'], { fs: 14, op: fade(u, 0.2) });
      [0, 1, 2, 3].forEach((r) => { const [x, y] = cellXY(r * 3 + 2), real = r === 0;
        pill(x + 68, y, 'REDIS', BAD, pop(u, 0.6 + r * 0.3), { fs: 13.5, fill: real ? BADBG : PANEL, mono: true });
        if (!real) sub(x + 150, y + 5, '복사될 자리', fade(u, 0.8 + r * 0.3), { fill: BAD }); }); }
    if (k === 2) { snippet(480, 52, ['# product-service/application-prod.yml', 'password: ${PRODUCT_DB_PASSWORD}', 'elasticsearch:', '  uris: http://prod-es-1:9200,...'], { fs: 13.5, op: fade(u, 0.3) });
      sub(640, 190, '구조는 같고 값만 다른 파일이 3개 더', fade(u, 1.4), { 'font-weight': 700, fill: INK, 'font-size': 14 }); }
    if (k === 3) { card(700, 80, 230, 52, { rx: 10, stroke: WARN, sw: 2.5, text: 'DB 비밀번호 회전 1회', fs: 15, s: pop(u, 0.2) });
      for (let i = 0; i < 12; i++) { const [x, y] = cellXY(i), a = 0.9 + i * 0.08; dot([[600, 98], [x + 20, y]], seg(u, a, a + 0.5), WARN, 5); }
      [['PR', 12], ['빌드·배포', 12]].forEach(([n, v], i) => { card(620 + i * 170, 190, 150, 64, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.9 + i * 0.2) });
        tx(620 + i * 170, 182, n, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0 + i * 0.2) });
        mono(620 + i * 170, 210, v + '번', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0 + i * 0.2) }); });
      sub(705, 252, '값 하나 바꾸는 데 배포가 필요하다', fade(u, 2.2), { fill: BAD, 'font-weight': 700 }); }
    if (k === 4) { card(720, 92, 220, 56, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'config-repo (git)\n12개를 한 곳에', fs: 14, s: pop(u, 1.2) });
      card(720, 190, 220, 50, { rx: 10, stroke: ACC, sw: 2.5, text: 'Config Server', fs: 15, s: pop(u, 1.5) }); grow(720, 120, 720, 163, E(u, 1.5, 1.8), ACC);
      ROWS.forEach((r, i) => { const x = 570 + i * 100; card(x, 300, 90, 36, { rx: 8, text: r, fs: 13.5, mono: true, s: pop(u, 1.7 + i * 0.1) });
        dot([[720, 216], [x, 282]], seg(u, 1.9 + i * 0.1, 2.5 + i * 0.1), ACC, 5); });
      pill(720, 360, 'POST /actuator/refresh', ACC, pop(u, 2.3), { mono: true, fs: 13.5, fill: PANEL });
      mono(250, 300, '변경 지점 12곳 → 1곳', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) }); } }

  // ---------- 4. 위치 발견 + 장애 격리 ----------
  const OR = [100, 205], INST = ['10.0.1.42:8081', '10.0.1.43:8081', '10.0.1.44:8081'], IY = [52, 104, 156];
  function s4(t, c) { const { k, u } = c;
    const top = k >= 3 ? 0.35 : 1;
    svc(OR[0], OR[1], 'order', { w: 110, stroke: ACC });
    tx(820, 26, 'product-service · 3대', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: top });
    INST.forEach((ip, i) => { const hot = k === 2 && Math.floor(seg(u, 0.5, 2.6) * 6) % 3 === i && u > 0.5 && u < 2.6;
      card(820, IY[i], 190, 38, { rx: 8, text: ip, mono: true, fs: 14, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, op: top }); });
    // 0) IP 하드코딩
    if (k === 0) { grow(155, 195, 725, IY[0], E(u, 0.2, 1.0), BAD);
      pill(390, 150, 'PRODUCT_URL = "http://10.0.1.42:8081"', BAD, pop(u, 0.6), { mono: true, fs: 13.5, fill: PANEL });
      card(820, 208, 190, 38, { rx: 8, text: '10.0.1.45:8081', mono: true, fs: 14, stroke: BAD, dash: '5 4', s: pop(u, 1.4) });
      sub(820, 246, '새로 떴다 → 코드 수정 + 재배포', fade(u, 1.7), { fill: BAD, 'font-weight': 700 }); }
    // 1) 레지스트리 등록 + 하트비트
    if (k >= 1) { const rows = INST.map((ip, i) => ['product-service', ip, { op: k === 1 ? fade(u, 0.7 + i * 0.4) : 1, hot: k === 2 && Math.floor(seg(u, 0.5, 2.6) * 6) % 3 === i && u > 0.5 && u < 2.6 }]);
      kvTable(250, 24, 340, rows, { title: 'Eureka 레지스트리', kw: 175, rh: 32 });
      if (top < 1) el('rect', { x: 246, y: 20, width: 348, height: 140, fill: PANEL, opacity: 0.6 });
      if (k === 1) { INST.forEach((ip, i) => fly(725, IY[i], 560, 70 + i * 32, seg(u, 0.2 + i * 0.4, 0.9 + i * 0.4), 'REGISTER', { mono: true }));
        INST.forEach((_, i) => { const a = 1.9 + i * 0.12; dot([[725, IY[i]], [592, 70 + i * 32]], seg(u, a, a + 0.4), GOOD, 4.5); });
        sub(420, 186, '하트비트 30초마다 · 90초 끊기면 빠진다 (기본값)', fade(u, 1.9), { 'font-weight': 700, fill: GOOD }); } }
    // 2) 이름으로 부르고, 목록을 차례로 고른다
    if (k === 2) { grow(155, 192, 248, 110, E(u, 0.1, 0.4), ACC, { plain: true });
      pill(175, 128, 'http://product-service', ACC, pop(u, 0.1), { mono: true, fs: 13.5, fill: PANEL });
      for (let j = 0; j < 6; j++) { const i = j % 3, a = 0.5 + j * 0.35; dot([[155, 200], [600, 180], [725, IY[i]]], seg(u, a, a + 0.5), ACC, 6); }
      sub(420, 186, 'LoadBalancer가 목록을 차례로 고른다 (RoundRobin 기본)', fade(u, 0.6), { 'font-weight': 700, fill: ACC }); }
    // 3·4) payment 장애와 차단기
    if (k >= 3) { const py = 330;
      svc(820, py, 'payment', { w: 150, stroke: BAD, note: '다운', noteCol: BAD });
      grow(155, 218, 360, py, 1, MUT, { plain: true });
      const open = k === 4 ? E(u, 0.2, 0.7) : 0;
      // 차단기 스위치: 닫힘 = 선이 이어짐, 열림 = 위로 들림
      el('circle', { cx: 360, cy: py, r: 5, fill: INK }); el('circle', { cx: 430, cy: py, r: 5, fill: INK });
      const ang = -35 * open * Math.PI / 180; el('line', { x1: 360, y1: py, x2: 360 + 70 * Math.cos(ang), y2: py + 70 * Math.sin(ang), stroke: open > 0.5 ? BAD : INK, 'stroke-width': 4, 'stroke-linecap': 'round' });
      grow(430, py, 743, py, 1, open > 0.5 ? OFF : MUT, { plain: true, dash: open > 0.5 ? '5 5' : null });
      if (k === 3) { for (let i = 0; i < 6; i++) { const a = 0.15 + i * 0.12; dot([[155, 218], [360, py], [743, py]], seg(u, a, a + 0.9) * 0.97, BAD, 5); }
        const q = Math.floor(lerp(0, 6, E(u, 0.4, 1.2))); for (let i = 0; i < q; i++) el('circle', { cx: 60 + i * 14, cy: 250, r: 5, fill: BAD });
        if (q) sub(100, 272, '30초 timeout 대기', 1, { fill: BAD, 'font-weight': 700 });
        [['@CircuitBreaker', 395, 372], ['@Retry', 560, 372], ['@Bulkhead', 690, 372]].forEach(([s, x, y], i) => pill(x, y, s, WARN, pop(u, 1.4 + i * 0.3), { mono: true, fs: 13.5, fill: PANEL })); }
      if (k === 4) { mono(395, py - 40, 'OPEN', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
        dot([[155, 218], [360, py], [470, 392]], seg(u, 0.8, 1.6), WARN, 6);
        R.cells(480, 376, ['', '', '', ''], { w: 34, h: 30, gap: 4, style: (i) => i < Math.round(lerp(0, 2, E(u, 1.4, 1.7))) ? { fill: WARNBG, stroke: WARN } : { stroke: GRID } });
        tx(640, 397, 'paymentQueue', { 'font-size': 13.5, class: 'mono', fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) });
        fly(360, py - 10, 150, 262, seg(u, 1.8, 2.6), 'Payment.pending()', { mono: true, fill: GOOD, stay: true }); } } }

  // ---------- 5. 다섯 빈자리 ----------
  const AREA = [
    { n: '① 설정', col: ACC }, { n: '② 디스커버리', col: ACC }, { n: '③ 진입점·LB', col: ACC }, { n: '④ 장애 격리', col: BAD }, { n: '⑤ 추적·메시징', col: INFO } ];
  function s5(t, c) { const { k, u } = c, last = k === 5, mop = last ? 0.12 + 0.88 * (1 - E(u, 0.2, 0.8)) : 1;
    const on = (i) => (k > i || last ? 1 : k === i ? 1 : 0), cur = (i) => k === i && !last;
    const sc = (i) => (k === i && !last ? pop(u, 0.2) : 1);
    const S = [['user', 360], ['product', 500], ['order', 640], ['payment', 800]], Y = 200;
    // 바탕: 손님 → 서비스 넷
    R.person(56, Y, null, { op: mop }); S.forEach(([n, x]) => card(x, Y, 118, 44, { rx: 9, text: n, mono: true, fs: 14, op: mop }));
    // ① Config Server + git, 버스 방송
    if (on(0)) { const o = mop * (cur(0) ? 1 : 0.85);
      card(610, 66, 150, 40, { rx: 9, text: 'Config Server', fs: 14, stroke: ACC, fill: ACCBG, s: sc(0), op: o }); card(790, 66, 90, 40, { rx: 9, text: 'git', mono: true, fs: 14, s: sc(0), op: o });
      if (cur(0)) { grow(745, 66, 688, 66, E(u, 0.5, 0.8), ACC); S.forEach(([, x], i) => dot([[610, 86], [x, Y - 22]], seg(u, 0.9 + i * 0.15, 1.5 + i * 0.15), ACC, 5));
        sub(610, 112, 'bus로 전 서비스에 방송', fade(u, 1.5), { fill: ACC, 'font-weight': 700 }); } }
    // ② Eureka
    if (on(1)) { const o = mop * (cur(1) ? 1 : 0.85); card(380, 66, 130, 40, { rx: 9, text: 'Eureka', fs: 14, stroke: ACC, fill: ACCBG, s: sc(1), op: o });
      if (cur(1)) { S.forEach(([, x], i) => grow(x, Y - 22, 380 + (i - 1.5) * 20, 86, E(u, 0.4 + i * 0.2, 0.8 + i * 0.2), ACC, { plain: true }));
        sub(380, 32, '이름 → IP', fade(u, 1.4), { fill: ACC, 'font-weight': 700 }); } }
    // ③ Gateway
    if (on(2)) { const o = mop * (cur(2) ? 1 : 0.85); card(185, Y, 120, 52, { rx: 10, text: 'Gateway', fs: 15, stroke: ACC, fill: ACCBG, s: sc(2), op: o });
      if (cur(2)) { dot([[80, Y], [125, Y]], seg(u, 0.5, 0.9), ACC, 6);
        ['인증', 'rate-limit', 'CORS'].forEach((s, i) => pill(110 + i * 95, Y - 62, s, ACC, pop(u, 0.9 + i * 0.25), { fs: 13.5, fill: PANEL }));
        dot([[245, Y], [300, Y]], seg(u, 1.8, 2.3), ACC, 6); } }
    // ④ 차단기 (order → payment)
    if (on(3)) { const o = mop * (cur(3) ? 1 : 0.85); el('line', { x1: 699, y1: Y, x2: 741, y2: Y, stroke: BAD, 'stroke-width': 3, opacity: o });
      el('rect', { x: 708, y: Y - 13, width: 24, height: 26, rx: 4, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: o * sc(3) });
      if (cur(3)) ['CircuitBreaker', 'Retry', 'Bulkhead', 'TimeLimiter'].forEach((s, i) => pill(430 + i * 140, 262, s, BAD, pop(u, 0.4 + i * 0.3), { fs: 13.5, fill: PANEL, mono: true })); }
    // ⑤ traceId 한 줄 + Kafka
    if (on(4)) { const o = mop * (cur(4) ? 1 : 0.85), g = cur(4) ? E(u, 0.3, 1.6) : 1, x0 = 185, x1 = lerp(185, 800, g);
      el('line', { x1: x0, y1: 318, x2: x1, y2: 318, stroke: INFO, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: o });
      [185, 360, 500, 640, 800].forEach((x) => { if (x <= x1 + 1) el('circle', { cx: x, cy: 318, r: 6, fill: INFO, opacity: o }); });
      mono(185, 346, 'traceId 하나로 전 구간', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: o * (cur(4) ? fade(u, 1.2) : 1) });
      R.cells(480, 362, ['e1', 'e2', 'e3'], { w: 40, h: 30, gap: 4, fs: 13.5, style: () => ({ stroke: WARN, op: o * (cur(4) ? fade(u, 1.6) : 1) }) });
      mono(620, 382, 'Kafka · Stream', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: o * (cur(4) ? fade(u, 1.7) : 1) }); }
    if (cur(0) || cur(1) || cur(2) || cur(3) || cur(4)) { const a = AREA[k]; pill(870, 380, a.n, a.col, pop(u, 0.1), { fs: 14, fill: PANEL }); }
    // 마지막: 얻는 것 · 잃는 것
    if (last) { banner(480, 42, '다섯 빈자리의 표준 답 = Spring Cloud', pop(u, 0.4));
      [['얻는 것', GOOD, ['표준 묶음 하나', '어노테이션·설정으로 대체', '팀 간 운영 일관성']], ['잃는 것', BAD, ['배울 것이 늘어난다', '의존성이 많아진다', '버전 짝 맞추기']]].forEach(([h, col, items], j) => {
        const cx = 270 + j * 420, s = pop(u, 0.8 + j * 0.4);
        card(cx, 230, 360, 220, { rx: 12, stroke: col, sw: 2.5, s });
        tx(cx, 152, h, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.9 + j * 0.4) });
        items.forEach((s2, i) => { const op = fade(u, 1.1 + j * 0.4 + i * 0.2);
          (j === 0 ? check : cross)(cx - 140, 194 + i * 46, 8, op); tx(cx - 118, 200 + i * 46, s2, { 'font-size': 15.5, 'font-weight': 600, opacity: op }); }); }); } }

  const quiz = [
    { q: 'Spring Boot 한 대로 만든 쇼핑몰에서 OrderService가 ProductService를 부를 때 필요한 것은 무엇인가?',
      o: ['product의 IP와 포트', '같은 힙 안의 객체 참조 하나', 'Eureka 레지스트리 조회'], a: 1,
      why: '한 JVM 안에서는 스프링이 주입한 객체를 메서드로 부른다. "어디 있나"라는 질문 자체가 생기지 않는다.' },
    { q: '네 서비스로 쪼갠 뒤 결제는 됐는데 주문 저장이 실패했다. 무엇이 문제가 되는가?',
      o: ['@Transactional이 자동으로 결제까지 되돌린다', 'RestClient가 알아서 재시도해 해결한다', 'payment DB는 order 트랜잭션 밖이라 보상(refund)을 직접 짜야 한다'], a: 2,
      why: '프로세스와 DB가 나뉘면 트랜잭션 경계도 나뉜다. 다른 서비스의 결제를 되돌리는 코드는 직접 만들어야 한다.' },
    { q: '4개 서비스 × 3개 환경일 때 DB 비밀번호를 한 번 바꾸면 무슨 일이 생기는가?',
      o: ['yml 12개를 고치고 12번 배포한다', 'yml 1개만 고치면 된다', 'yml 4개를 고치고 재시작 없이 반영된다'], a: 0,
      why: '설정이 코드 repo 안의 파일로 흩어져 있으면 값 변경이 곧 배포다. 12개 파일, 12번 배포가 따라온다.' },
    { q: 'order가 "http://product-service"로 부를 때 실제 인스턴스를 고르는 것은 무엇인가?',
      o: ['order 코드에 박아 둔 PRODUCT_URL', 'Eureka 목록을 보고 고르는 LoadBalancer', 'payment 서비스'], a: 1,
      why: '각 인스턴스가 Eureka에 자기 주소를 올리고, @LoadBalanced 클라이언트가 그 목록에서 하나를 고른다. 인스턴스가 늘어도 코드는 그대로다.' },
    { q: '다음 중 Spring Cloud가 메우는 다섯 빈자리에 들지 않는 것은 무엇인가?',
      o: ['설정 관리', '분산 추적·메시징', '한 JVM 안의 @Transactional 처리'], a: 2,
      why: '한 JVM 안의 트랜잭션은 Spring Boot가 이미 해 준다. 다섯 빈자리는 설정, 디스커버리, 진입점·LB, 장애 격리, 추적·메시징이다.' },
  ];

  const summary = [
    '서비스가 하나면 Boot만으로 충분하다. 호출은 객체 참조이고 트랜잭션도 하나다.',
    '서비스를 넷으로 쪼개면 호출이 HTTP가 되고 주소, 실패, 보상 문제가 생긴다.',
    '서비스 4개에 환경 3개면 yml이 12개가 되고, 비밀번호 한 번 바꾸는 데 배포가 12번 든다.',
    'Spring Cloud는 설정, 디스커버리, 진입점, 장애 격리, 추적의 다섯 빈자리를 메우는 묶음이다.',
  ];
  const review = [
    { q: 'product-service를 3대에서 5대로 늘렸더니 order 코드를 고쳐 다시 배포해야 했다. 먼저 의심할 것은?',
      o: ['주소를 상수로 박아 두고 부르고 있다', 'Config Server가 꺼져 있다', '트랜잭션이 너무 길다'], a: 0,
      why: 'IP를 코드에 박으면 인스턴스가 바뀔 때마다 배포가 따라온다. 레지스트리에 등록하고 이름으로 부르면 코드는 그대로다.' },
    { q: 'payment가 다운되자 order의 다른 기능까지 멈췄다. 가장 알맞은 처방은?',
      o: ['yml을 Config Server로 옮긴다', 'charge 호출에 차단기와 fallback을 건다', 'order 서비스를 한 대 더 띄운다'], a: 1,
      why: 'timeout을 기다리는 요청이 커넥션을 다 잡아 전파된 것이다. 회로가 열리면 fallback이 pending을 돌려줘 주문 흐름이 산다.' },
    { q: '8명 팀이 서비스 하나를 운영한다. Spring Cloud부터 넣자는 제안에 가장 알맞은 답은?',
      o: ['다섯 영역을 모두 지금 넣는다', 'Eureka만 먼저 넣는다', '서비스가 나뉘어 빈자리가 생길 때 넣는다'], a: 2,
      why: '서비스가 1개면 주소, 설정 동기화, 장애 전파 문제가 없다. 쓸 이유가 생기기 전에 넣으면 의존성과 학습 부담만 는다.' },
  ];

  R.page({ title: '운영 부담 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
