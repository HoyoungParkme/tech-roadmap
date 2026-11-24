/* III-1-2 Saga (Choreography vs Orchestration) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, person, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  function svc(cx, cy, name, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.01) return;
    card(cx, cy, o.w || 150, o.h || 44, { rx: 9, stroke: o.stroke || INK, fill: o.fill, sw: 2.2, text: name, fs: o.fs || 15, fw: 700, mono: true, color: o.color || o.stroke || INK, s, op: o.op }); }
  function db(cx, cy, name, o) { o = o || {}; const s = o.s ?? 0.6;
    dbIcon(cx, cy, null, { s, stroke: o.stroke, op: o.op });
    if (name) mono(cx, cy + 46 * s + 18, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: o.stroke || INK, opacity: o.op ?? 1 }); }

  // ---------- 1. 2PC: 시간축 위의 락 ----------
  const L2 = { x0: 170, cy: 70, lanes: [['order_db', 160], ['stock_db', 240], ['pay_db', 320]] };
  function lanes(dead) {
    mono(20, L2.cy + 5, 'coordinator', { 'font-size': 14.5, 'font-weight': 700, fill: dead ? BAD : INK });
    el('line', { x1: L2.x0, y1: L2.cy, x2: 920, y2: L2.cy, stroke: GRID, 'stroke-width': 2 });
    L2.lanes.forEach(([n, y]) => { mono(20, y + 5, n, { 'font-size': 14.5, 'font-weight': 700 }); el('line', { x1: L2.x0, y1: y, x2: 920, y2: y, stroke: GRID, 'stroke-width': 2 }); });
    tx(920, 395, '시간 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
  function round(x, u, a, label, col) { L2.lanes.forEach(([, y], i) => grow(x, L2.cy + 4, x + 18, y - 8, E(u, a + i * 0.12, a + 0.5 + i * 0.12), col || INK, { sw: 2 }));
    mono(x - 6, L2.cy - 14, label, { 'font-size': 14, 'font-weight': 700, fill: col || INK, opacity: fade(u, a) }); }
  function lockBar(y, x1, x2, col, op) { if (x2 <= x1) return; el('rect', { x: x1, y: y - 9, width: x2 - x1, height: 18, rx: 4, fill: col || BAD, opacity: op ?? 0.7 }); }
  function s1(t, c) { const { k, u } = c; const dead = k === 3 && u > 1.0;
    if (k === 5) { card(250, 120, 240, 70, { rx: 12, text: '2PC\n다 같이 ACID', fs: 16, stroke: OFF, color: MUT, s: pop(u, 0.2) }); cross(370, 90, 16, pop(u, 0.6));
      grow(390, 120, 540, 120, E(u, 0.8, 1.2), ACC);
      ['T1', 'T2', 'T3'].forEach((s, i) => { pill(600 + i * 110, 100, s, GOOD, pop(u, 1.0 + i * 0.2), { fill: PANEL, fs: 15 }); pill(600 + i * 110, 160, 'C' + (i + 1), WARN, pop(u, 1.4 + i * 0.2), { fill: PANEL, fs: 15 }); });
      lbl(710, 220, 'Saga · 로컬 트랜잭션 + 보상', fade(u, 1.8), { fill: ACC });
      sub(480, 300, 'A(원자성)는 포기하고, 결과적 일관성을 만든다', fade(u, 2.1), { 'font-weight': 700, fill: INK }); return; }
    lanes(dead);
    if (k === 0) { round(200, u, 0.2, 'prepare');
      L2.lanes.forEach(([, y], i) => { pill(262, y - 26, 'OK', GOOD, pop(u, 0.9 + i * 0.12), { fs: 13.5, fill: PANEL }); lockBar(y, 240, lerp(240, 520, E(u, 1.1, 2.6))); lock(232, y, true, BAD, pop(u, 1.0 + i * 0.1) * 0.7); });
      sub(560, 392, 'OK 를 보낸 순간부터 row lock · 아직 commit 전', fade(u, 1.6), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 1) { round(200, 3, 0, 'prepare'); round(500, u, 0.3, 'commit', ACC);
      L2.lanes.forEach(([, y]) => { lockBar(y, 240, lerp(520, 540, E(u, 0.6, 1.2))); if (u > 1.2) check(560, y, 9, pop(u, 1.2)); });
      el('path', { d: 'M200,108 L200,98 L520,98 L520,108', fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.6) });
      mono(360, 90, '왕복 2라운드', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(720, 392, '이론상 분산 환경에서도 ACID (XA)', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { round(200, 3, 0, 'prepare'); round(760, 3, 0, 'commit', ACC);
      L2.lanes.forEach(([, y]) => lockBar(y, 240, lerp(540, 780, E(u, 0.2, 1.0))));
      // 다른 사용자의 트랜잭션이 같은 row 에서 기다린다
      const wx = lerp(180, 380, E(u, 0.6, 1.2)); el('circle', { cx: wx, cy: 240 - 24, r: 8, fill: WARN }); if (u > 1.2) mono(400, 222, '다른 사용자 대기', { 'font-size': 14, fill: WARN, 'font-weight': 700 });
      const a = tween(99.9, 99.5, u, 1.2); mono(170, 380, '가용성 0.999 × 5개 DB =', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      mono(430, 380, a.toFixed(1) + '%', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) }); return; }
    if (k === 3) { round(200, 3, 0, 'prepare');
      if (dead) cross(L2.x0 + 140, L2.cy, 14, pop(u, 1.0));
      L2.lanes.forEach(([, y]) => { lockBar(y, 240, lerp(520, 900, E(u, 0.4, 2.0))); if (u > 1.8) mono(910, y + 6, '?', { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); });
      if (dead) mono(470, 110, '락을 쥔 채 무한 대기 · in-doubt', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) });
      person(560, 380, null, { s: 0.6 * pop(u, 2.0), stroke: WARN }); mono(600, 390, '사람이 commit? rollback? 결정', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k === 4: 메시지 수
    round(200, u, 0.1, 'prepare'); round(500, u, 0.9, 'commit', ACC);
    const n = Math.round(clamp((u - 0.1) / 1.6) * 6);
    mono(700, 120, `왕복 ${n}번`, { 'font-size': 26, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.2) });
    mono(700, 148, '= 2 라운드 × DB 3개', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) });
    sub(480, 392, '리전을 건너면 한 hop 이 길어지고, 그 hop 이 2 × N 번이다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); }

  // ---------- 2. Saga: T 와 C 짝 ----------
  const TX = [170, 370, 570, 770], TN = ['order 생성', '재고 차감', '결제 청구', '배송 준비'], CN = ['order 취소', '재고 복구', '결제 환불', '배송 취소'];
  function track(k, u, o) { o = o || {};
    TX.forEach((x, i) => { const s = k === 0 ? pop(u, 0.2 + i * 0.3) : 1, failT = o.fail && i === 2, lit = o.lit && o.lit(i);
      card(x, 70, 150, 50, { rx: 10, text: 'T' + (i + 1) + ' ' + TN[i], fs: 14.5, stroke: failT ? BAD : lit === 'T' ? GOOD : INK, color: failT ? BAD : INK, s });
      card(x, 170, 150, 50, { rx: 10, text: 'C' + (i + 1) + ' ' + CN[i], fs: 14.5, stroke: lit === 'C' ? WARN : GRID, color: lit === 'C' ? WARN : MUT, fill: lit === 'C' ? WARNBG : PANEL, s: k === 0 ? pop(u, 0.5 + i * 0.3) : 1 });
      el('line', { x1: x, y1: 96, x2: x, y2: 144, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: k === 0 ? fade(u, 0.6 + i * 0.3) : 1 }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { track(k, u, k === 1 ? { fail: u > 1.2, lit: (i) => (i < 2 && u > 0.3 + i * 0.4 ? (u > 1.6 + (1 - i) * 0.5 ? 'C' : 'T') : null) } : {});
      if (k === 0) { lbl(480, 270, '단계를 정할 때 되돌리는 방법도 같이 정한다', fade(u, 1.8)); return; }
      dot([[95, 40], [645, 40]], seg(u, 0.2, 1.2), GOOD, 7);
      if (u > 1.2) cross(645, 70, 14, pop(u, 1.2));
      dot([[545, 205], [95, 205]], seg(u, 1.5, 2.6), WARN, 7);
      mono(320, 236, '역순 C2 → C1', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      return; }
    track(2, 3, { lit: (i) => (k === 2 && i === 0 ? 'T' : k === 3 && i === 0 ? 'C' : k === 4 && i === 1 ? 'C' : null) });
    if (k === 2 || k === 3) { const X = 300;
      el('rect', { x: X - 20, y: 236, width: 520, height: 150, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '7 5', opacity: k === 2 ? fade(u, 0.2) : 1 });
      mono(X - 10, 230, '@Transactional · order_db 안에서만', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 2 ? fade(u, 0.2) : 1 });
      db(200, 310, 'order_db', {});
      tx(X + 10, 268, 'orders', { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' });
      const row = (y, a, b, o) => { el('rect', { x: X, y, width: 480, height: 34, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || GRID, opacity: o.op ?? 1 });
        mono(X + 14, y + 23, a, { 'font-size': 14.5, opacity: o.op ?? 1 }); mono(X + 160, y + 23, b, { 'font-size': 14.5, 'font-weight': 700, fill: o.col || INK, opacity: o.op ?? 1, 'text-decoration': o.strike ? 'line-through' : null }); };
      if (k === 2) row(282, 'id 901', 'status = CREATED', { op: fade(u, 0.7), fill: GOODBG, stroke: GOOD, col: GOOD });
      else { const ch = u > 1.0; row(282, 'id 901', 'status = CREATED', { strike: ch, col: ch ? OFF : INK });
        row(326, 'id 901', 'status = CANCELLED', { op: fade(u, 1.0), fill: WARNBG, stroke: WARN, col: WARN });
        mono(X + 10, 408, 'DELETE 가 아니라 order.cancel() · 이력이 남는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
      return; }
    if (k === 4) { const first = E(u, 0.2, 1.0), second = E(u, 1.4, 2.2);
      fly(80, 290, 330, 290, first, 'restoreStock(saga-7)', { fill: WARN, mono: true });
      fly(80, 350, 330, 350, second, 'restoreStock(saga-7)', { fill: WARN, mono: true });
      card(480, 320, 190, 110, { rx: 10, stroke: GRID, sw: 1.6 }); mono(400, 284, 'compensationLog', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      if (u > 1.0) mono(410, 316, 'saga-7', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      if (u > 2.2) { cross(600, 350, 12, pop(u, 2.2)); mono(480, 404, '두 번째는 이미 처리됨 · skip', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' }); }
      const st = u < 1.0 ? 8 : 10; card(800, 290, 140, 70, { rx: 10, stroke: ACC, sw: 2 }); tx(800, 274, '재고', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      mono(800, 306, String(st), { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: ACC });
      sub(800, 350, '+2 는 한 번만 (예시 값)', fade(u, 1.0)); return; }
    const P = [['각 단계 = 로컬 ACID', '한 DB 트랜잭션이라 락이 짧다'], ['보상은 멱등', '같은 보상이 두 번 와도 같은 결과'], ['보상은 업무 동작', '취소·환불, 물리적 undo 가 아님'], ['진행 상태를 기록', '어디까지 왔는지 알아야 보상한다']];
    P.forEach(([a, b], i) => { const x = 250 + (i % 2) * 440, y = 270 + Math.floor(i / 2) * 76, s = pop(u, 0.2 + i * 0.3);
      card(x, y, 400, 64, { rx: 10, stroke: ACC, sw: 2, s }); mono(x - 182, y - 4, String(i + 1), { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + i * 0.3) });
      tx(x - 160, y - 4, a, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); tx(x - 160, y + 18, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); }); }

  // ---------- 3. Choreography: 이벤트 버스 ----------
  const BUS = 210;
  function bus(evs) { el('rect', { x: 40, y: BUS - 16, width: 880, height: 32, rx: 16, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(54, BUS + 5, 'Kafka', { 'font-size': 14, 'font-weight': 800, fill: MUT }); }
  function onBus(x0, x1, u, name, col) { const f = E(u, 0, 1); if (u <= 0) return; pill(lerp(x0, x1, f), BUS, name, col, 1, { mono: true, fs: 13.5, fill: PANEL }); }
  function s3(t, c) { const { k, u } = c; bus();
    const ord = [190, 80], inv = [480, 80], pay = [790, 80], comp = [480, 340];
    svc(ord[0], ord[1], 'order', { w: 130 }); svc(inv[0], inv[1], 'inventory', { w: 150, stroke: k === 2 || k === 3 ? (k === 3 ? BAD : GOOD) : INK }); svc(pay[0], pay[1], 'payment', { w: 140, stroke: k === 4 ? GOOD : INK });
    if (k === 5) svc(comp[0], comp[1], 'InventoryCompensator', { w: 250, stroke: WARN, s: pop(u, 0.2) });
    if (k === 0) { db(70, 330, 'order_db', {}); grow(190, 102, 100, 296, E(u, 0.3, 0.9), ACC);
      card(260, 330, 170, 40, { rx: 6, stroke: GOOD, fill: GOODBG, text: 'order 901 저장', fs: 14.5, s: pop(u, 1.0) });
      sub(480, 395, '여기까지가 order-service 의 로컬 트랜잭션', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { dot([[190, 102], [190, BUS]], seg(u, 0.2, 0.6), ACC, 7); onBus(190, 420, seg(u, 0.6, 1.6), 'OrderCreated', ACC);
      ['?', '?', '?'].forEach((q, i) => mono(560 + i * 120, 300, q, { 'font-size': 26, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.6 + i * 0.15) }));
      sub(680, 340, '누가 받는지 모른다 · 직접 호출 없음', fade(u, 1.9), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2 || k === 3) { pill(420, BUS, 'OrderCreated', ACC, 1, { mono: true, fs: 13.5, fill: PANEL });
      dot([[440, BUS - 14], [480, 102]], seg(u, 0.2, 0.7), ACC, 7);
      const ok = k === 2, name = ok ? 'StockReserved' : 'StockReservationFailed', col = ok ? GOOD : BAD;
      pill(480, 140, ok ? 'reserve() ✓' : 'OutOfStock ✗', col, pop(u, 0.8), { mono: true, fs: 13.5, fill: PANEL });
      dot([[480, 160], [560, BUS - 14]], seg(u, 1.1, 1.5), col, 7); onBus(560, ok ? 700 : 680, seg(u, 1.5, 2.3), name, col);
      if (!ok) sub(480, 300, '실패도 이벤트로 남겨야 누군가 보상을 시작한다', fade(u, 2.2), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 4) { pill(700, BUS, 'StockReserved', GOOD, 1, { mono: true, fs: 13.5, fill: PANEL });
      dot([[740, BUS - 14], [790, 102]], seg(u, 0.2, 0.7), GOOD, 7);
      grow(760, BUS + 18, 660, 300, E(u, 1.0, 1.5), GOOD); grow(820, BUS + 18, 860, 300, E(u, 1.0, 1.5), BAD);
      pill(620, 320, 'PaymentCompleted', GOOD, pop(u, 1.4), { mono: true, fs: 13.5, fill: PANEL }); pill(840, 320, 'PaymentFailed', BAD, pop(u, 1.6), { mono: true, fs: 13.5, fill: PANEL });
      sub(300, 330, '분기는 try/catch 안에만 있다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    pill(820, BUS, 'PaymentFailed', BAD, 1, { mono: true, fs: 13.5, fill: PANEL });
    dot([[820, BUS + 14], [820, 280], [600, 340]], seg(u, 0.3, 1.0), BAD, 7);
    pill(480, 392, 'restoreStock() → StockRestored', WARN, pop(u, 1.1), { mono: true, fs: 13.5, fill: PANEL });
    dot([[780, BUS + 14], [260, 102]], seg(u, 1.4, 2.2), BAD, 6); sub(170, 140, 'order 도 구독 → cancel', fade(u, 1.8), { fill: BAD, 'font-weight': 700 });
    sub(170, 320, '흐름이 4개 클래스에 흩어져 있다', fade(u, 2.3), { 'font-weight': 700, fill: INK }); }

  // ---------- 4. Orchestration: 보상 스택 ----------
  const ACT = [['inv', 'reserve', 'restore', 100], ['pay', 'charge', 'refund', 210], ['ship', 'prepare', 'cancel', 320]];
  function stack(items, x, o) { o = o || {};
    el('path', { d: `M${x - 100},150 L${x - 100},380 L${x + 100},380 L${x + 100},150`, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: o.op ?? 1 });
    mono(x, 140, 'saga 보상 목록', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 });
    items.forEach(([s, sc, col], i) => card(x, 352 - i * 50, 184, 40, { rx: 6, text: s, fs: 14, mono: true, stroke: col || WARN, fill: WARNBG, color: col || WARN, s: sc })); }
  function s4(t, c) { const { k, u } = c, OX = 170, AX = 490, SX = 800;
    svc(OX, 210, 'OrderSagaWorkflow', { w: 230, stroke: ACC, fill: ACCBG, s: k === 0 ? pop(u, 0.2) : 1 });
    if (k === 0) { mono(OX, 252, '@WorkflowMethod placeOrder()', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      lbl(560, 140, '이 흐름 전체에 이름이 붙는다', fade(u, 1.3)); sub(560, 166, '단계 순서가 한 파일에 모인다', fade(u, 1.7)); return; }
    ACT.forEach(([n, a, , y], i) => { const s = k === 1 ? pop(u, 0.3 + i * 0.3) : 1;
      grow(OX + 115, 210, AX - 70, y, k === 1 ? E(u, 0.2 + i * 0.3, 0.6 + i * 0.3) : 1, GRID, { plain: true });
      svc(AX, y, n + 'Activities', { w: 160, s, fs: 14.5 }); });
    if (k === 1) { pill(AX, 380, '재시도 · 타임아웃은 Temporal 이 맡는다', INFO, pop(u, 1.5), { fs: 13.5, fill: PANEL }); return; }
    const reg = k === 2 ? 0 : k === 3 ? 1 : k === 4 ? 3 : 2;
    const items = [];
    for (let i = 0; i < reg; i++) { const [n, , cmp] = ACT[i]; let sc = 1;
      if (k === 3 && i === 0) sc = pop(u, 1.2); if (k === 4 && i >= 1) sc = pop(u, i === 1 ? 0.9 : 2.0);
      let col = WARN; if (k === 5) { const at = i === 1 ? 1.2 : 2.0; if (u > at) col = GOOD; }
      items.push([`${n}.${cmp}()`, sc, col]); }
    stack(items, SX, { op: k === 2 ? fade(u, 0.2) : 1 });
    if (k === 2) { sub(SX, 260, '비어 있음', fade(u, 0.6)); mono(OX, 252, 'new Saga(...)', { 'font-size': 14.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) }); return; }
    const call = (i, a, ok) => { const y = ACT[i][3]; dot([[OX + 115, 210], [AX - 80, y]], seg(u, a, a + 0.5), ok ? GOOD : BAD, 7);
      if (u > a + 0.5) (ok ? check : cross)(AX + 96, y, 10, pop(u, a + 0.5)); };
    if (k === 3) { call(0, 0.2, true); return; }
    if (k === 4) { call(1, 0.2, true); call(2, 1.3, true); return; }
    // k === 5: 다른 실행 — 배송 준비가 실패
    pill(OX, 120, '다른 실행: ship.prepare 실패', BAD, pop(u, 0.1), { fs: 13.5, fill: PANEL });
    call(2, 0.2, false);
    dot([[SX - 100, 302], [AX + 80, 210]], seg(u, 1.2, 1.8), WARN, 7); dot([[SX - 100, 352], [AX + 80, 100]], seg(u, 2.0, 2.6), WARN, 7);
    mono(SX, 104, 'compensate(): 위에서부터', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }

  // ---------- 5. 어느 쪽을 고를까 ----------
  function checklist(x, y, items, u, col, a) { items.forEach((s, i) => { const yy = y + i * 40, op = fade(u, a + i * 0.25);
    check(x, yy - 5, 9, pop(u, a + i * 0.25)); tx(x + 22, yy, s, { 'font-size': 15, 'font-weight': 600, opacity: op, fill: col || INK }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { lbl(240, 60, 'Choreography 가 맞을 때', fade(u, 0.1), { fill: GOOD });
      checklist(70, 110, ['단계 ≤ 3개, 흐름 단순', '서비스 결합 최소화 우선', '이미 Kafka 기반', '도구 추가 부담 없음'], u, INK, 0.2);
      ['A', 'B', 'C'].forEach((s, i) => { card(560 + i * 130, 200, 70, 46, { rx: 23, text: s, fs: 16, stroke: GOOD, s: pop(u, 1.3 + i * 0.2) }); if (i < 2) grow(597 + i * 130, 200, 653 + i * 130, 200, E(u, 1.5 + i * 0.2, 1.8 + i * 0.2), GOOD); });
      sub(690, 250, '이벤트 세 번이면 끝나는 흐름', fade(u, 2.1)); return; }
    if (k === 1) { svc(170, 210, 'user-service', { w: 170 }); pill(330, 210, 'UserCreated', ACC, pop(u, 0.2), { mono: true, fs: 13.5, fill: PANEL });
      [['notification', '환영 메일', 90], ['analytics', '통계', 210], ['recommendation', '초기 추천', 330]].forEach(([n, j, y], i) => {
        dot([[400, 210], [600, y]], seg(u, 0.6, 1.4), ACC, 6); svc(700, y, n, { w: 190, s: pop(u, 0.5 + i * 0.1), fs: 14.5 }); sub(860, y + 5, j, fade(u, 1.4), { 'text-anchor': 'start' }); });
      sub(330, 330, '깊이 1 · 넓게 퍼지기만 한다', fade(u, 1.9), { 'font-weight': 700, fill: GOOD }); return; }
    if (k === 2) { lbl(240, 60, 'Orchestration 이 맞을 때', fade(u, 0.1), { fill: ACC });
      checklist(70, 110, ['단계 5개 이상, 분기 많음', '흐름 자체가 핵심 자산', '시각화 · 감사 필요', '수 시간~일 걸리는 흐름'], u, INK, 0.2);
      el('rect', { x: 540, y: 190, width: 360 * E(u, 1.2, 2.4), height: 20, rx: 5, fill: ACC, opacity: 0.8 });
      mono(540, 180, '워크플로우 상태가 영속 저장된다', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
      clock(720, 290, 36, E(u, 1.2, 2.6), ACC, '수 시간~일'); return; }
    if (k === 3) { const fail = u > 1.6;
      svc(150, 210, 'bookTrip()', { w: 150, stroke: ACC });
      [['flight.book', 100, '필수', GOOD], ['hotel.book', 210, 'if hotelRequired', GOOD], ['car.book', 320, 'if carRequired', fail ? BAD : GOOD]].forEach(([n, y, cond, col], i) => {
        grow(226, 210, 420, y, E(u, 0.2 + i * 0.3, 0.6 + i * 0.3), GRID, { plain: true }); svc(520, y, n, { w: 180, stroke: col, s: pop(u, 0.3 + i * 0.3), fs: 14.5 });
        mono(625, y + 5, cond, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.3) }); });
      if (fail) { cross(436, 320, 11, pop(u, 1.6));
        dot([[430, 300], [430, 210]], seg(u, 1.8, 2.2), WARN, 7); dot([[430, 200], [430, 100]], seg(u, 2.2, 2.6), WARN, 7);
        mono(300, 400, '예약된 것만 골라 거꾸로 보상', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.9) }); }
      return; }
    if (k === 4) { const msgs = ['OrderCreated', 'StockReserved', 'PaymentFailed', 'StockRestored'];
      msgs.forEach((m, i) => { const x = 130 + i * 230, s = pop(u, 0.2 + i * 0.2);
        card(x, 100, 200, 60, { rx: 10, stroke: GRID, s }); mono(x, 94, m, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.2) });
        mono(x, 118, 'sagaId=saga-7', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.1) }); });
      clock(200, 280, 40, E(u, 1.4, 2.4), WARN, '타임아웃');
      person(480, 280, null, { s: 0.85 * pop(u, 1.8), stroke: BAD }); mono(480, 345, '보상 실패 → admin 알림', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      card(760, 280, 230, 70, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 2.0), text: 'A → B → A …\n순환 의존 금지', fs: 14.5, color: BAD }); return; }
    tx(480, 50, '흐름 복잡도 →', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 });
    grow(150, 66, 810, 66, E(u, 0.1, 0.6), MUT);
    [['Spring + Kafka', '단순 · Choreography', 220, 140, GOOD], ['Temporal', '복잡 · 가장 인기', 740, 140, ACC], ['AWS Step Functions', '매니지드', 480, 260, INFO], ['Camunda', 'BPMN · 엔터프라이즈', 480, 360, INFO]].forEach(([n, d, x, y, col], i) => {
      card(x, y, 250, 64, { rx: 10, stroke: col, sw: 2.2, s: pop(u, 0.4 + i * 0.35) }); mono(x, y - 4, n, { 'font-size': 15.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.35) });
      tx(x, y + 18, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.35) }); }); }

  const quiz = [
    { q: '2PC에서 참여 DB가 prepare에 OK를 보낸 순간부터 생기는 일은 무엇인가?',
      o: ['곧바로 commit이 끝나 락이 풀린다', 'commit 지시가 올 때까지 row lock을 쥐고 기다린다', 'coordinator 없이도 스스로 결정한다'], a: 1,
      why: 'prepare 응답 뒤로는 commit 전까지 락을 잡는다. 그래서 coordinator가 죽으면 락을 쥔 채 in-doubt로 남는다.' },
    { q: 'T1 → T2 → T3 순서로 가다 T3(결제)이 실패했다. Saga가 실행하는 보상은 무엇인가?',
      o: ['C3 → C2 → C1', 'C1 → C2', 'C2 → C1'], a: 2,
      why: '끝난 단계는 T1, T2뿐이고 보상은 진행의 역순이다. 실패한 T3는 되돌릴 것이 없다.' },
    { q: 'Choreography에서 재고가 모자라면 inventory-service는 무엇을 해야 하나?',
      o: ['StockReservationFailed 이벤트를 발행한다', '예외를 로그에만 남기고 조용히 끝낸다', 'order-service를 직접 호출해 주문을 지운다'], a: 0,
      why: '실패도 이벤트다. 실패 이벤트가 없으면 아무도 보상을 시작할 수 없다.' },
    { q: 'Temporal 워크플로우에서 결제까지 성공하고 배송 준비가 실패했다. compensate()가 실행하는 것은?',
      o: ['ship.cancel → pay.refund → inv.restore', 'pay.refund → inv.restore', 'inv.restore → pay.refund'], a: 1,
      why: '보상은 실행에 성공한 뒤에 등록되므로 ship.cancel은 아직 없다. 등록된 두 개가 나중 것부터 실행된다.' },
    { q: '회원가입 뒤 알림·통계·추천이 각자 붙는 흐름에 맞는 방식은 무엇인가?',
      o: ['Choreography, 단계 1개에 fan-out뿐이라서', 'Orchestration, 분기가 많아서', '2PC, 셋이 동시에 성공해야 해서'], a: 0,
      why: '깊이가 얕고 넓게 퍼지기만 하는 흐름은 이벤트 구독만으로 충분하다. 조정자를 둘 이유가 없다.' },
  ];

  const summary = [
    '2PC는 commit까지 모든 DB가 락을 쥐고, coordinator가 죽으면 in-doubt로 멈춘다.',
    'Saga는 단계마다 로컬 트랜잭션을 돌리고 실패하면 끝난 단계를 역순으로 보상한다.',
    '보상은 취소나 환불 같은 업무 동작이고, 두 번 와도 같은 결과여야 한다.',
    '단계 3개 이하의 단순한 흐름은 이벤트 체인으로, 분기가 많고 긴 흐름은 조정자로 짠다.',
  ];
  const review = [
    { q: '결제 실패 보상 메시지가 재전송되어 재고가 두 번 늘었다. 먼저 고칠 곳은?',
      o: ['2PC로 바꿔 재전송을 없앤다', 'restoreStock이 sagaId로 처리 여부를 확인하게 한다', 'Kafka 파티션 수를 늘린다'], a: 1,
      why: '메시지는 다시 올 수 있으니 보상이 멱등해야 한다. compensationLog에 sagaId가 있으면 건너뛰면 된다.' },
    { q: '이벤트 구독자로 짠 예약 흐름에 호텔·렌트카 조건 분기가 늘자 아무도 전체 흐름을 설명하지 못한다. 알맞은 다음 걸음은?',
      o: ['구독자를 더 잘게 나눈다', '모든 서비스를 한 DB로 합친다', '흐름을 워크플로우 정의 한 곳으로 모으는 Orchestration으로 옮긴다'], a: 2,
      why: '분기가 많은 흐름은 코드 한 곳에 있어야 읽힌다. 조정자가 보상 목록까지 들고 있어 추적도 쉬워진다.' },
    { q: '보상 트랜잭션 자체가 계속 실패해 주문이 중간 상태로 남았다. 미리 마련했어야 할 것은?',
      o: ['수동 개입 경로와 admin 알림', 'coordinator를 하나 더 두는 2PC', '이벤트 이름을 더 자세히 짓기'], a: 0,
      why: '자동 보상도 실패할 수 있다. 타임아웃과 함께 사람이 개입할 경로가 없으면 운영에서 사고가 난다.' },
  ];

  R.page({ title: 'Saga 흐름 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
