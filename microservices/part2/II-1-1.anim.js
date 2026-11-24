/* II-1-1 Sync vs Async — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: 지연 50·45·5ms(합 100ms), gRPC p99 8ms, 응답 5ms, timeout 500ms·2s 는 페이지 STEPS·코드 값.
 * Protobuf 9바이트 / JSON 45바이트는 예시 메시지(product_id 42, title "mug", stock_qty 7)를 node 로 직접 인코딩한 값. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, cells, person, browser, cross, check, dbIcon, clock, hbar, G } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  function svc(cx, cy, name, o) { o = o || {}; const w = o.w || 170, h = o.h || 56;
    const g = card(cx, cy, w, h, { rx: 10, stroke: o.stroke || INK, fill: o.fill, sw: o.sw ?? 2.2, s: o.s, op: o.op, dash: o.dash });
    tx(0, o.sub ? -4 : 6, name, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 700, fill: o.color || o.stroke || INK }, g);
    if (o.sub) tx(0, 17, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, class: o.subMono ? 'mono' : null }, g);
    return g; }
  const ln = (x1, y1, x2, y2, col, o) => { o = o || {}; el('line', { x1, y1, x2, y2, stroke: col || GRID, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function pause(x, y, col, s) { const g = G(x, y, s ?? 1); el('rect', { x: -7, y: -9, width: 5, height: 18, rx: 1.5, fill: col || WARN }, g); el('rect', { x: 2, y: -9, width: 5, height: 18, rx: 1.5, fill: col || WARN }, g); return g; }

  // ---------- 1. REST 동기 호출 ----------
  const O = { x: 215, y: 120 }, PR = { x: 590, y: 66 }, IV = { x: 590, y: 186 }, DBP = { x: 865, y: 118 };
  const LX = 130, LW = 690, X1 = (v) => LX + LW * v / 100;
  const SEGS = [[0, 50, 'product 응답 대기 50ms', 1], [50, 95, 'inventory 대기 45ms', 2], [95, 100, '', 3]];
  function s1(t, c) { const { k, u } = c;
    person(55, 128, '사용자', {});
    svc(O.x, O.y, 'order-service', { w: 180, sub: 'OrderService', s: k === 0 ? pop(u, 0.2) : 1 });
    const dim = k === 0 ? 0.35 : 1;
    svc(PR.x, PR.y, 'product-service', { w: 200, sub: '/products/{id}', subMono: true, op: dim, stroke: k === 4 ? BAD : INK });
    svc(IV.x, IV.y, 'inventory-service', { w: 200, sub: '/inv/{id}', subMono: true, op: dim });
    dbIcon(DBP.x, DBP.y, 'order DB', { s: 0.8, op: k >= 3 ? 1 : 0.35 });
    if (k === 0) { grow(84, 120, 122, 120, E(u, 0.6, 1.1), ACC); pill(O.x, 176, 'WebClient', ACC, pop(u, 0.9), { mono: true });
      sub(O.x, 214, 'place(cmd) 진입', fade(u, 1.4), { 'font-size': 14, fill: INK, 'font-weight': 600 }); }
    else if (k < 4) ln(84, 120, 122, 120, ACC);
    // 호출 선: product (k1), inventory (k2), DB 저장 (k3)
    if (k >= 1) { const g1 = k === 1 ? E(u, 0.1, 0.5) : 1; grow(305, 112, 488, 76, g1, k === 4 ? BAD : MUT, { plain: true });
      if (k === 1) { dot([[305, 112], [488, 76]], seg(u, 0.4, 0.9), ACC, 7); dot([[488, 76], [305, 112]], seg(u, 1.6, 2.1), INK, 7); }
      pill(398, 84, 'timeout 1s', INFO, k === 1 ? pop(u, 0.5) : 1, { mono: true, fs: 13.5, fill: PANEL }); }
    if (k >= 2) { const g2 = k === 2 ? E(u, 0.1, 0.5) : 1; grow(305, 128, 488, 180, g2, MUT, { plain: true });
      if (k === 2) { dot([[305, 128], [488, 180]], seg(u, 0.4, 0.9), ACC, 7); dot([[488, 180], [305, 128]], seg(u, 1.5, 2.0), INK, 7); }
      pill(398, 158, 'timeout 없음', BAD, k === 2 ? pop(u, 0.6) : 1, { fs: 13.5, fill: PANEL }); }
    if (k >= 3 && k < 4) { grow(305, 120, 828, 120, E(u, 0.1, 0.6), GOOD, { plain: true }); dot([[305, 120], [828, 120]], seg(u, 0.5, 1.2), GOOD, 7); }
    if (k === 1 || k === 2) pill(O.x, 176, 'block() 대기 중', WARN, 1, { fs: 13.5, fill: PANEL });
    if (k < 4) {   // order 스레드 하나의 시간축
      tx(LX, 248, 'order 스레드 하나의 시간', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
      el('rect', { x: LX, y: 258, width: LW, height: 30, rx: 5, fill: SOFT });
      el('line', { x1: LX, y1: 292, x2: LX + LW, y2: 292, stroke: MUT, 'stroke-width': 1.6 });
      [0, 25, 50, 75, 100].forEach((v) => { el('line', { x1: X1(v), y1: 292, x2: X1(v), y2: 297, stroke: MUT }); mono(X1(v), 314, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      let total = 0;
      SEGS.forEach(([a, b, s, at]) => { if (k < at) return; const g = k === at ? E(u, 0.5, 2.0) : 1, col = at === 3 ? GOOD : WARN;
        el('rect', { x: X1(a), y: 258, width: Math.max(1, (X1(b) - X1(a)) * g), height: 30, rx: 4, fill: at === 3 ? GOODBG : WARNBG, stroke: col, 'stroke-width': 1.8 });
        if (s && g > 0.85) tx((X1(a) + X1(b)) / 2, 278, s, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col });
        if (at === 3) tx(X1(97.5), 248, '저장 5ms', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: g });
        total += (b - a) * g; });
      tx(840, 262, '응답', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
      mono(840, 286, Math.round(total) + 'ms', { 'font-size': 20, 'font-weight': 800, fill: total >= 95 ? WARN : INK });
      if (k === 3) { banner(480, 362, '50 + 45 + 5 = 100ms', pop(u, 1.8)); sub(480, 400, '앞 응답이 와야 다음 줄로 간다', fade(u, 2.2), { 'font-size': 14 }); }
      return; }
    // k4: product 가 멈추면 order 스레드 풀이 줄줄이 막힌다
    cross(PR.x + 118, PR.y - 18, 11, pop(u, 0.2));
    for (let i = 0; i < 6; i++) dot([[84, 120], [122, 120], [305, 112], [488, 76]], ((t * 0.7 + i / 6) % 1), BAD, 5);
    tx(LX, 250, 'order 스레드 풀', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
    const n = Math.floor(lerp(0, 16, E(u, 0.3, 1.8)));
    for (let i = 0; i < 16; i++) el('rect', { x: LX + i * 44, y: 262, width: 36, height: 28, rx: 4, fill: i < n ? BAD : PANEL, stroke: i < n ? 'none' : GRID, 'stroke-width': 1.5, opacity: i < n ? 0.85 : 1 });
    note(480, 322, '모든 스레드가 product 응답을 기다린다', fade(u, 1.9), { 'text-anchor': 'middle', fill: BAD });
    cross(55, 98, 11, pop(u, 2.0)); sub(55, 200, '새 요청 거부', fade(u, 2.0), { fill: BAD, 'font-weight': 700 });
    banner(480, 370, 'product 가 멈추면 order 도 멈춘다 · cascade failure', pop(u, 2.2)); }

  // ---------- 2. gRPC ----------
  const PROTO = ['service ProductService {', '  rpc GetProduct(...)', '  rpc CheckStock(...)', '}'];
  function protoDoc(u, op) { el('rect', { x: 355, y: 30, width: 250, height: 140, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    mono(370, 54, 'product.proto', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: op });
    PROTO.forEach((s, i) => { const f = clamp(u * PROTO.length - i); if (f <= 0) return; mono(370, 84 + i * 24, s.slice(0, Math.ceil(s.length * f)), { 'font-size': 14, opacity: op }); }); }
  const BYTES = [['08', 1], ['2A', 1], ['12', 2], ['03', 2], ['6D', 2], ['75', 2], ['67', 2], ['20', 4], ['07', 4]];
  const FCOL = { 1: ACC, 2: INFO, 4: GOOD };
  function s2(t, c) { const { k, u } = c, late = k >= 3;
    svc(150, 100, 'order-service', { sub: '클라이언트' }); svc(810, 100, 'product-service', { sub: '서버', stroke: k === 4 ? WARN : INK });
    protoDoc(k === 0 ? E(u, 0.2, 1.5) : 1, late ? 0.3 : 1);
    if (!late) { const gl = k === 0 ? E(u, 1.5, 2.2) : 1; grow(235, 100, 355, 100, gl, ACC, { dash: '6 5', plain: true }); grow(725, 100, 605, 100, gl, ACC, { dash: '6 5', plain: true });
      sub(295, 88, '같은 계약', gl); sub(665, 88, '같은 계약', gl); }
    if (k === 1) {
      tx(85, 212, 'message ProductReply · 필드마다 번호', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      cells(85, 220, ['1 product_id', '2 title', '3 price', '4 stock_qty'], { w: 190, h: 36, gap: 10, fs: 14, style: (i) => ({ s: pop(u, 0.2 + i * 0.15), stroke: [ACC, INFO, OFF, GOOD][i] }) });
      tx(85, 282, 'JSON (예시 값)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.9) });
      mono(85, 304, '{"product_id":42,"title":"mug","stock_qty":7}', { 'font-size': 14, opacity: fade(u, 1.0) });
      mono(480, 304, '45 B', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.2) });
      tx(85, 338, 'Protobuf 같은 값', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.4) });
      cells(85, 346, BYTES.map((b) => b[0]), { w: 44, h: 34, gap: 6, fs: 14, style: (i) => ({ stroke: FCOL[BYTES[i][1]], fill: i === 0 || i === 2 || i === 7 ? (BYTES[i][1] === 1 ? ACCBG : BYTES[i][1] === 2 ? INFOBG : GOODBG) : PANEL, s: pop(u, 1.5 + i * 0.08) }) });
      mono(546, 369, '9 B', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) });
      [['08', '필드 1 · product_id', ACC], ['12', '필드 2 · title', INFO], ['20', '필드 4 · stock_qty', GOOD]].forEach(([b, s, col], i) => {
        mono(640, 300 + i * 26, b, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, 1.9 + i * 0.15) }); tx(672, 300 + i * 26, '= ' + s, { 'font-size': 14, opacity: fade(u, 1.9 + i * 0.15) }); });
      tx(640, 380, '키는 이름이 아니라 번호다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.4) }); return; }
    if (k === 2) { const g = E(u, 0.2, 0.8);
      grow(440, 172, 250, 238, g, ACC); sub(245, 200, 'protoc 가 생성', g, { 'font-weight': 700, fill: ACC });
      card(250, 262, 300, 44, { rx: 8, text: 'ProductServiceBlockingStub', fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.8) });
      card(720, 262, 280, 44, { rx: 8, text: '손으로 짠 HTTP 클라이언트', fs: 14, stroke: OFF, color: OFF, dash: '5 4', op: 1 - 0.5 * fade(u, 1.2) });
      el('line', { x1: 590, y1: 262, x2: 590 + 260 * E(u, 1.2, 1.7), y2: 262, stroke: BAD, 'stroke-width': 2.5 });
      R.snippet(100, 318, ['var reply = stub.getProduct(req);   // 로컬 메서드처럼'], { op: fade(u, 1.8) });
      sub(720, 310, 'URL 오타 · 직렬화 실수가 사라진다', fade(u, 2.2), { fill: INK, 'font-size': 14 }); return; }
    // k3, k4: HTTP/2 한 커넥션 위 여러 스트림
    el('rect', { x: 235, y: 182, width: 490, height: 34, rx: 17, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(480, 236, 'HTTP/2 커넥션 1개 · 스트림 여러 개', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const SC = [ACC, INFO, GOOD];
    for (let i = 0; i < 9; i++) { const f = ((t * 0.55 + i / 9) % 1), right = i % 2 === 0, x = right ? lerp(245, 700, f) : lerp(700, 245, f);
      el('rect', { x, y: 191, width: 22, height: 16, rx: 3, fill: SC[i % 3], opacity: k === 4 ? 0.35 : 0.85 }); }
    if (k === 3) { const x0 = 280, W = 480;
      [['REST + JSON', 50, OFF], ['gRPC + Protobuf', 8, ACC]].forEach(([n, v, col], i) => { const y = 280 + i * 42, g = E(u, 0.3 + i * 0.4, 1.3 + i * 0.4);
        tx(x0 - 16, y + 16, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
        el('rect', { x: x0, y, width: Math.max(2, W * v / 50 * g), height: 22, rx: 4, fill: col });
        mono(x0 + W * v / 50 * g + 10, y + 17, 'p99 ' + v + 'ms', { 'font-size': 14.5, 'font-weight': 800, fill: col === OFF ? INK : ACC, opacity: fade(u, 1.0 + i * 0.4) }); });
      note(480, 388, '약 6배 빠르고 처리량 2,000 → 20,000 req/s', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    // k4: 한계
    browser(170, 320, 170, 96, null, {}); cross(170, 326, 16, pop(u, 0.3));
    sub(170, 394, '브라우저 직접 호출 ✕', fade(u, 0.4), { fill: INK, 'font-weight': 700 }); sub(170, 412, 'gRPC-Web 필요', fade(u, 0.5));
    R.terminal(300, 272, 210, 96, ['$ curl product:9090', ['바이너리라 읽을 수 없음', 'var(--term)']], 2, {});
    sub(405, 394, 'curl ✕ → grpcurl 필요', fade(u, 0.9), { fill: INK, 'font-weight': 700 });
    tx(590, 290, '결합도', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
    hbar(590, 302, 250, 70, 100, { col: WARN, text: '70%', u: E(u, 1.3, 2.0) });
    pause(810, 140, WARN, pop(u, 1.6)); sub(810, 166, '응답 기다림', fade(u, 1.7), { fill: WARN, 'font-weight': 700 });
    note(590, 360, '빨라져도 상대를 기다리는 건 그대로', fade(u, 2.1), { fill: WARN }); }

  // ---------- 3. Kafka 비동기 ----------
  const LG = { x: 300, y: 160, w: 46, g: 4, n: 8 }, cellX = (i) => LG.x + i * (LG.w + LG.g) + LG.w / 2;
  function evCount(k, u) { return [0, lerp(0, 3, E(u, 0.4, 2.0)), lerp(3, 5, E(u, 0.3, 1.8)), lerp(5, 7, E(u, 0.3, 1.8)), lerp(7, 8, E(u, 0.3, 1.0))][k]; }
  function logStrip(n, k, u) { tx(LG.x, 148, 'topic  order.placed', { 'font-size': 14, 'font-weight': 800, class: 'mono', fill: ACC });
    for (let i = 0; i < LG.n; i++) { const on = i < Math.floor(n + 1e-6), s = k === 0 ? pop(u, 0.4 + i * 0.12) : 1;
      card(cellX(i), LG.y + 22, LG.w, 44, { rx: 5, fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, sw: 1.8, s, text: on ? 'ev' : '', fs: 13.5, color: ACC });
      mono(cellX(i), LG.y + 62, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); } }
  function ptr(i, col, label, dy) { const x = cellX(Math.max(0, Math.min(7, i))), y = LG.y + 72 + (dy || 0);
    el('path', { d: `M${x},${y} l-8,14 h16 z`, fill: col }); tx(x, y + 32, label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col }); }
  function s3(t, c) { const { k, u } = c, n = evCount(k, u);
    svc(140, 90, 'order-service', { sub: '발행만 한다' });
    svc(840, 90, 'payment-service', { w: 190, sub: 'group payment-svc', subMono: true, op: k >= 2 ? 1 : 0.35 });
    svc(840, 300, 'shipping-service', { w: 190, sub: 'group shipping-svc', subMono: true, op: k >= 3 ? 1 : 0.35 });
    logStrip(n, k, u);
    if (k === 0) { pill(140, 150, 'KafkaTemplate', ACC, pop(u, 0.3), { mono: true });
      ['PaymentClient', 'ShippingClient'].forEach((s, i) => { const y = 230 + i * 56, f = fade(u, 1.0 + i * 0.3);
        card(140, y, 170, 40, { rx: 8, text: s, fs: 14, mono: true, stroke: OFF, color: OFF, dash: '5 4', op: f });
        el('line', { x1: 60, y1: y, x2: 60 + 160 * E(u, 1.5 + i * 0.3, 2.0 + i * 0.3), y2: y, stroke: BAD, 'stroke-width': 2.5 }); });
      sub(140, 352, '상대 서비스 클라이언트가 사라진다', fade(u, 2.2), { fill: INK, 'font-size': 14 }); return; }
    // 발행 화살표
    ln(225, 104, LG.x - 6, 172, GRID);
    if (k === 1) { fly(225, 104, cellX(0), 182, seg(u, 0.2, 0.8), 'send', { mono: true });
      pill(140, 150, '즉시 return orderId', GOOD, pop(u, 0.9), { fs: 13.5, fill: PANEL, mono: false });
      const x0 = 210, W = 420;
      [['Step 1 동기 흐름', 100, OFF], ['발행 후 리턴', 5, ACC]].forEach(([s, v, col], i) => { const y = 290 + i * 40, g = E(u, 1.0 + i * 0.4, 1.8 + i * 0.4);
        tx(x0 - 14, y + 16, s, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.0) });
        el('rect', { x: x0, y, width: Math.max(2, W * v / 100 * g), height: 22, rx: 4, fill: col });
        mono(x0 + W * v / 100 * g + 10, y + 17, v + 'ms', { 'font-size': 14.5, 'font-weight': 800, fill: i ? ACC : INK, opacity: fade(u, 1.3 + i * 0.4) }); });
      return; }
    // 구독: payment 포인터
    const pPay = k === 2 ? lerp(0, 4, E(u, 0.3, 2.2)) : k === 3 ? lerp(4, 6, E(u, 0.3, 2.0)) : 7;
    ln(LG.x + LG.n * (LG.w + LG.g), 172, 745, 100, ACC);
    dot([[cellX(Math.floor(pPay)), 160], [745, 100]], (t * 0.9) % 1, ACC, 6);
    ptr(pPay, ACC, 'payment 오프셋');
    if (k === 2) { pill(840, 148, 'charge()', ACC, pop(u, 0.6), { mono: true }); sub(480, 320, 'order 코드는 그대로', fade(u, 1.6), { fill: INK, 'font-size': 15, 'font-weight': 700 }); return; }
    if (k >= 3) { const pShip = k === 3 ? lerp(0, 3, E(u, 0.4, 2.2)) : 5;
      ln(LG.x + LG.n * (LG.w + LG.g), 186, 745, 300, INFO);
      dot([[cellX(Math.floor(pShip)), 204], [745, 300]], (t * 0.8 + 0.4) % 1, INFO, 6);
      ptr(pShip, INFO, 'shipping 오프셋', 40); }
    if (k === 3) { check(80, 300, 11, pop(u, 1.2)); note(100, 306, '발행 측 코드 변경 0줄', fade(u, 1.3), { fill: GOOD });
      sub(480, 360, '그룹이 다르면 같은 이벤트를 각자 전부 받는다', fade(u, 1.9), { fill: INK, 'font-size': 14.5 }); return; }
    // k4: 대가
    card(150, 340, 230, 78, { rx: 10, stroke: GRID, sw: 1.6 });
    tx(50, 328, '주문 #1 접수됨', { 'font-size': 14.5, 'font-weight': 700 });
    const done = u > 1.9; tx(50, 356, done ? '결제: 완료' : '결제: 처리 중…', { 'font-size': 14.5, 'font-weight': 700, fill: done ? GOOD : WARN });
    tx(36, 296, '결과적 일관성', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    clock(225, 340, 18, E(u, 0.2, 1.9), WARN);
    dot([[cellX(6), 160], [745, 100]], seg(u, 0.4, 1.2), WARN, 7); dot([[cellX(6), 160], [745, 100]], seg(u, 0.9, 1.7), WARN, 7);
    note(480, 330, '같은 이벤트 두 번 → 멱등 처리', fade(u, 1.2), { 'text-anchor': 'middle', fill: WARN });
    note(480, 362, '순서 · 재시도 · Kafka 운영', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); }

  // ---------- 4. 시나리오별 선택 ----------
  const LANES = [['REST', INK, ['클릭 → 즉시 결과', '외부 API · 모바일', 'CRUD 조회·수정']],
    ['gRPC', INFO, ['사내 고빈도 호출', 'p99 가 KPI', '양방향 스트리밍']],
    ['Kafka', ACC, ['한 사건 → 여러 곳', '이메일·SMS·푸시', 'DB → 검색 · CDC']],
    ['RabbitMQ', WARN, ['작업 큐 · worker', 'exchange 라우팅', '짧은 메시지 빨리']]];
  const laneX = (i) => 132 + i * 232;
  const TOL = [['상품 조회', 0.1, 0], ['주문 → 결제', 0.3, 0], ['주문 → 알림', 5, 1], ['가격 → 검색 인덱스', 60, 1], ['주문 → 추천 학습', 400, 1]];
  function s4(t, c) { const { k, u } = c, last = k === 4;
    LANES.forEach(([name, col, items], i) => { if (i > k && !last) { pill(laneX(i), 36, name, OFF, 1, { fs: 15 }); return; }
      const on = i === k, op = last ? 0.55 : on ? 1 : 0.6;
      pill(laneX(i), 36, name, col, on ? pop(u, 0.1) : 1, { fs: 15, op });
      items.forEach((s, j) => card(laneX(i), 90 + j * 50, 212, 40, { rx: 8, text: s, fs: 14, stroke: col, color: INK, sw: on ? 2.2 : 1.5, op, s: on ? pop(u, 0.4 + j * 0.3) : 1 })); });
    if (!last) { if (k === 0) note(480, 290, '사용자가 기다리며 답을 보는 곳', fade(u, 1.6), { 'text-anchor': 'middle' });
      if (k === 1) note(480, 290, '같은 동기라도 사내 고빈도면 gRPC', fade(u, 1.6), { 'text-anchor': 'middle', fill: INFO });
      if (k === 2) note(480, 290, '지금 화면에 그릴 게 아니면 메시지', fade(u, 1.6), { 'text-anchor': 'middle', fill: ACC });
      if (k === 3) note(480, 290, '이벤트 로그는 Kafka, 작업 분배는 RabbitMQ', fade(u, 1.6), { 'text-anchor': 'middle', fill: WARN });
      return; }
    // k4: 결과를 얼마나 늦게 봐도 되나 (로그 눈금)
    const ax0 = 120, ax1 = 860, LX4 = (v) => ax0 + (Math.log10(v) - Math.log10(0.1)) / (Math.log10(400) - Math.log10(0.1)) * (ax1 - ax0), y = 330;
    tx(ax0, 262, '결과가 얼마나 늦어도 되나', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    el('line', { x1: ax0, y1: y, x2: ax0 + (ax1 - ax0) * E(u, 0.1, 0.7), y2: y, stroke: MUT, 'stroke-width': 2 });
    [[0.1, '0.1초'], [5, '5초'], [60, '1분']].forEach(([v, s]) => { el('line', { x1: LX4(v), y1: y - 5, x2: LX4(v), y2: y + 5, stroke: MUT, opacity: fade(u, 0.5) }); mono(LX4(v), y + 24, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); });
    mono(ax1, y + 24, '다음 추천', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
    const split = LX4(1.5); el('line', { x1: split, y1: y - 52, x2: split, y2: y + 40, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.6) });
    tx(split - 10, y + 56, '동기', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.7) });
    tx(split + 10, y + 56, '메시지', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) });
    TOL.forEach(([s, v, m], i) => { const x = LX4(v), sc = pop(u, 0.6 + i * 0.2), up = i % 2 === 0;
      el('circle', { cx: x, cy: y, r: 7 * sc, fill: m ? ACC : INK });
      tx(x, up ? y - 16 : y - 38, s, { 'text-anchor': i === 0 ? 'start' : i === 4 ? 'end' : 'middle', 'font-size': 14, 'font-weight': 700, fill: m ? ACC : INK, opacity: fade(u, 0.7 + i * 0.2) }); }); }

  // ---------- 5. Hybrid ----------
  const HP = { ph: [50, 222], gw: [255, 222], or: [470, 222], pr: [762, 104], pa: [762, 208] };
  const SUBS = ['shipping', 'notification', 'analytics', 'reco-trainer'];
  function phone(cx, cy) { el('rect', { x: cx - 26, y: cy - 44, width: 52, height: 88, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); el('circle', { cx, cy: cy + 34, r: 3.5, fill: OFF }); tx(cx, cy + 66, '모바일', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }); }
  function s5(t, c) { const { k, u } = c;
    el('line', { x1: 160, y1: 62, x2: 160, y2: 408, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
    tx(80, 80, '외부', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT }); tx(240, 80, '내부', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
    phone(...HP.ph);
    svc(HP.gw[0], HP.gw[1], 'API Gateway', { w: 140, s: k === 0 ? pop(u, 0.1) : 1 });
    svc(HP.or[0], HP.or[1], 'order', { w: 140, sub: 'order-service', s: k === 0 ? pop(u, 0.3) : 1 });
    const g0 = k === 0 ? E(u, 0.4, 1.0) : 1;
    grow(78, 222, 183, 222, g0, INK, { plain: true }); grow(327, 222, 398, 222, g0, INFO, { sw: 4, plain: true });
    tx(122, 208, 'REST', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, opacity: g0 }); tx(362, 208, 'gRPC', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: g0 });
    if (k === 0) { dot([[78, 222], [183, 222], [327, 222], [398, 222]], seg(u, 1.0, 2.0), ACC, 7); sub(470, 290, '프로토콜이 바뀌는 곳은 Gateway 한 곳', fade(u, 2.0), { fill: INK, 'font-size': 14.5, 'font-weight': 700 }); }
    if (k >= 1) { svc(HP.pr[0], HP.pr[1], 'product-service', { w: 230, sub: 'timeout 500ms · retry 2', subMono: true, s: k === 1 ? pop(u, 0.2) : 1 });
      const g = k === 1 ? E(u, 0.4, 0.9) : 1; grow(542, 210, 646, 116, g, INFO, { sw: 4, plain: true });
      if (k === 1) { dot([[542, 210], [646, 116]], seg(u, 0.9, 1.3), ACC, 7); dot([[646, 116], [542, 210]], seg(u, 1.3, 1.7), INK, 7);
        mono(600, 72, 'p99 30ms', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); } }
    if (k >= 2) { svc(HP.pa[0], HP.pa[1], 'payment-service', { w: 230, sub: 'timeout 2s · retry 1', subMono: true, s: k === 2 ? pop(u, 0.2) : 1 });
      const g = k === 2 ? E(u, 0.4, 0.9) : 1; grow(542, 222, 646, 208, g, INFO, { sw: 4, plain: true });
      if (k === 2) { fly(542, 236, 646, 236, seg(u, 0.8, 1.3), 'key ord-1', { mono: true }); fly(542, 236, 646, 236, seg(u, 1.5, 2.0), 'key ord-1', { mono: true, fill: WARN });
        mono(900, 260, '예시 키', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
        tx(762, 268, u < 2.0 ? '1번째: 결제 승인' : '2번째: 이미 처리됨', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: u < 2.0 ? INK : GOOD, opacity: fade(u, 1.3) });
        sub(762, 292, '재시도가 이중 결제가 되지 않는다', fade(u, 2.2), { fill: GOOD, 'font-weight': 700 }); } }
    if (k >= 3) { const g = k === 3 ? E(u, 0.2, 0.7) : 1;
      grow(470, 252, 540, 318, g, ACC, { plain: true });
      cells(542, 304, ['ev', 'ev', 'ev'], { w: 36, h: 32, gap: 4, fs: 13.5, style: () => ({ stroke: ACC, fill: ACCBG, color: ACC, s: g }) });
      mono(542, 296, 'order.placed', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: g });
      SUBS.forEach((s, i) => { const y = 282 + i * 38, sc = k === 3 ? pop(u, 0.6 + i * 0.2) : 1;
        card(866, y, 160, 32, { rx: 8, text: s, fs: 14, mono: true, stroke: ACC, color: INK, s: sc });
        ln(664, 320, 785, y, ACC, { sw: 1.6, op: sc });
        if (k === 3) dot([[664, 320], [785, y]], seg(u, 1.0 + i * 0.15, 1.7 + i * 0.15), ACC, 5); });
      if (k === 3) sub(320, 340, '한 번 발행 · 구독자 4개', fade(u, 1.8), { fill: ACC, 'font-weight': 700, 'font-size': 15 }); }
    if (k === 4) { [['timeout 1s', INFO], ['retry 지수 backoff ≤ 3', INFO], ['멱등키 필수', GOOD], ['CB 각 외부 호출', WARN]].forEach(([s, col], i) => {
        pill(225 + i * 185, 34, s, col, pop(u, 0.3 + i * 0.3), { fs: 13.5, fill: PANEL }); });
      sub(320, 340, '도구는 구간마다, 정책은 한 벌', fade(u, 1.8), { fill: INK, 'font-weight': 700, 'font-size': 15 }); } }

  // 장면마다 확인 문제 하나 (답 a 는 0부터)
  const quiz = [
    { q: 'order가 product(50ms)와 inventory(45ms)를 차례로 동기 호출하고 5ms 동안 저장하면, 한 요청의 응답 시간은 얼마인가?',
      o: ['50ms, 가장 느린 호출만큼 걸린다', '100ms, 세 구간을 더한 만큼 걸린다', '5ms, 저장 시간만 걸린다'], a: 1,
      why: 'block()이 앞 응답을 기다린 뒤에야 다음 줄로 가므로 50 + 45 + 5 = 100ms가 된다.' },
    { q: 'REST를 gRPC로 바꿔도 그대로 남는 문제는 무엇인가?',
      o: ['JSON 텍스트를 직렬화하는 비용', '클라이언트 코드를 손으로 짜는 수고', '상대 서비스가 멈추면 같이 기다리는 결합'], a: 2,
      why: 'p99는 50ms에서 8ms로 줄지만 여전히 응답을 기다리는 동기 호출이라 상대의 가용성에 묶인다.' },
    { q: 'shipping-service가 다른 groupId로 order.placed를 구독하기 시작하면 order-service 코드는 어떻게 바뀌는가?',
      o: ['바뀌지 않는다', 'ShippingClient를 새로 넣어야 한다', 'send를 구독자 수만큼 호출해야 한다'], a: 0,
      why: '발행 측은 토픽에 한 번 쓰고 끝난다. 그룹이 다르면 각 그룹이 같은 이벤트를 전부 받아 간다.' },
    { q: '주문 뒤 보내는 이메일 알림에 맞는 통신 방식은 무엇인가?',
      o: ['gRPC 동기 호출', 'REST 동기 호출', '메시지로 발행'], a: 2,
      why: '메일은 5초 늦어도 되고 주문 화면에 결과를 그릴 필요가 없으니 메시지로 보낸다.' },
    { q: '결제 gRPC 호출에 retry 1회를 걸 때 반드시 함께 붙여야 하는 것은 무엇인가?',
      o: ['Kafka 토픽', '멱등키(idempotent key)', '더 긴 timeout'], a: 1,
      why: '재시도는 같은 결제 요청을 두 번 보낼 수 있다. 멱등키가 있어야 두 번째 요청을 이미 처리된 것으로 알아본다.' },
  ];

  const summary = [
    '동기 호출은 앞 응답을 기다린 뒤 다음 줄로 가서 50ms와 45ms 호출이 이어지면 지연도 더해진다.',
    'gRPC는 p99를 50ms에서 8ms로 줄이지만 상대를 기다리는 동기라서 결합은 그대로 남는다.',
    'Kafka에 발행하고 바로 돌아오면 응답이 상대와 무관해지고, 구독자는 groupId만 달리해 붙는다.',
    '즉시 답이 필요한 조회와 결제는 동기로, 알림과 후처리는 메시지로 나누고 timeout과 retry 정책은 한 벌로 맞춘다.',
  ];
  const review = [
    { q: '주문 API의 p99가 product-service 응답 시간을 그대로 따라 오르내린다. 먼저 의심할 것은?',
      o: ['주문 저장 쿼리가 느리다', 'order가 product 응답을 동기로 기다린다', 'Kafka 구독자가 너무 많다'], a: 1,
      why: '동기 호출은 상대 응답 시간이 내 응답 시간에 그대로 더해진다. product가 느려지면 order도 같이 느려진다.' },
    { q: '주문마다 배송, 알림, 분석, 추천 학습 4곳에 알려야 한다. 이것을 모두 동기 호출로 붙이면 생기는 일은?',
      o: ['곳이 하나 늘 때마다 주문 응답 시간도 늘어난다', '알림이 더 빨리 도착한다', '결제 결과를 화면에 보여 줄 수 없다'], a: 0,
      why: '동기 호출은 기다리는 시간이 더해진다. order.placed를 한 번 발행하면 구독자가 몇 곳이든 주문 응답은 그대로다.' },
    { q: '외부 앱은 REST로 받고 내부는 gRPC로 바꾸려 한다. 프로토콜을 갈아타는 지점으로 알맞은 곳은?',
      o: ['서비스마다 따로', '모바일 앱 안', 'API Gateway 한 곳'], a: 2,
      why: '경계를 Gateway 하나로 몰아 두면 내부를 gRPC로 바꿔도 외부 계약인 REST는 건드리지 않는다.' },
  ];

  R.page({ title: '통신 방식 비교', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
