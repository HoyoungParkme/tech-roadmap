/* III-2-1 Outbox · Event Sourcing — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, cross, check, lock, clock, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  function svc(cx, cy, name, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.01) return;
    card(cx, cy, o.w || 150, o.h || 44, { rx: 9, stroke: o.stroke || INK, fill: o.fill, sw: 2.2, text: name, fs: o.fs || 15, fw: 700, mono: true, color: o.color || o.stroke || INK, s, op: o.op }); }
  function db(cx, cy, name, o) { o = o || {}; const s = o.s ?? 0.6;
    dbIcon(cx, cy, null, { s, stroke: o.stroke, op: o.op });
    if (name) mono(cx, cy + 46 * s + 18, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: o.stroke || INK, opacity: o.op ?? 1 }); }
  // Kafka 토픽: 칸(오프셋)이 n 개 찼다. vals 가 있으면 칸 글자
  function topic(x, y, n, o) { o = o || {}; const N = o.N || 6;
    mono(x, y - 10, o.title || 'Kafka · order.created', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    for (let i = 0; i < N; i++) { const on = i < n, v = o.vals ? o.vals[i] : String(i), dup = o.dup && o.dup(i);
      card(x + 22 + i * 46, y + 18, 40, 34, { rx: 4, stroke: dup ? BAD : on ? WARN : GRID, fill: on ? (dup ? BADBG : WARNBG) : PANEL, sw: 1.6, text: on ? v : '', fs: 13.5, mono: true, color: dup ? BAD : WARN }); } }
  // 표: 머리 칸 + 행. rows: [[값…], {dash, col, fill, op}]
  function table(x, y, cols, widths, rows, o) { o = o || {}; const W = widths.reduce((a, b) => a + b, 0), op0 = o.op ?? 1;
    if (o.title) mono(x, y - 10, o.title, { 'font-size': 14, 'font-weight': 700, fill: o.tcol || INK, opacity: op0 });
    el('rect', { x, y, width: W, height: 30, rx: 6, fill: SOFT, stroke: GRID, opacity: op0 });
    let cx = x; cols.forEach((cn, j) => { mono(cx + 8, y + 20, cn, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op0 * (o.colOp ? o.colOp(j) : 1) }); cx += widths[j]; });
    rows.forEach(([vals, ro], i) => { ro = ro || {}; const yy = y + 34 + i * 34, op = (ro.op ?? 1) * op0; if (op <= 0.01) return;
      el('rect', { x, y: yy, width: W, height: 30, rx: 6, fill: ro.fill || PANEL, stroke: ro.col || GRID, 'stroke-width': ro.dash ? 2 : 1.2, 'stroke-dasharray': ro.dash ? '5 4' : null, opacity: op });
      let xx = x; vals.forEach((v, j) => { mono(xx + 8, yy + 20, v, { 'font-size': 14, fill: (ro.vcol && ro.vcol(j)) || ro.col || INK, 'font-weight': 600, opacity: op, 'text-decoration': ro.strike ? 'line-through' : null }); xx += widths[j]; }); }); }

  // ---------- 1. 이중 쓰기 ----------
  function s1(t, c) { const { k, u } = c, SV = [330, 70], DBP = [130, 270], KX = 440, KY = 250;
    const kill = k === 3 && u > 0.9;
    svc(SV[0], SV[1], 'order-service', { w: 190, stroke: kill ? BAD : INK }); if (kill) cross(SV[0] + 110, SV[1], 13, pop(u, 0.9));
    db(DBP[0], DBP[1], 'order_db', {});
    const rowOn = k === 1 ? fade(u, 0.8) : k === 2 || k === 3 || k === 5 ? 1 : k === 4 ? (u < 1.8 ? fade(u, 0.3) : 1 - E(u, 1.8, 2.3)) : 0;
    if (rowOn > 0.01) card(DBP[0], DBP[1] + 90, 150, 34, { rx: 6, text: 'order 901', fs: 14.5, mono: true, stroke: k === 4 ? WARN : GOOD, fill: k === 4 ? WARNBG : GOODBG, dash: k === 4 ? '5 4' : null, op: rowOn });
    const sent = k === 4 ? (u > 1.0 ? 1 : 0) : 0;
    topic(KX, KY, sent, { vals: ['901'] });
    svc(850, 200, 'payment', { w: 140, stroke: k === 4 && u > 1.6 ? WARN : k === 3 && u > 1.6 ? MUT : INK }); svc(850, 320, 'shipping', { w: 140, stroke: k === 3 && u > 1.6 ? MUT : INK });
    // 두 연결: DB 세션, Kafka producer — 서로 모른다
    const a0 = k === 0 ? E(u, 0.3, 0.9) : 1, a1 = k === 0 ? E(u, 0.9, 1.5) : 1;
    grow(SV[0] - 60, SV[1] + 22, DBP[0] + 20, DBP[1] - 38, a0, GRID, { plain: true }); grow(SV[0] + 40, SV[1] + 22, KX + 100, KY - 26, a1, GRID, { plain: true });
    if (k === 0) { mono(150, 150, 'Session', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) }); mono(430, 150, 'KafkaProducer', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) });
      sub(480, 400, '두 연결은 서로를 모른다 · 공유 트랜잭션 없음', fade(u, 1.8), { 'font-weight': 700, fill: BAD }); return; }
    if (k === 1) { dot([[SV[0] - 60, SV[1] + 22], [DBP[0] + 20, DBP[1] - 38]], seg(u, 0.2, 0.8), GOOD, 7);
      lock(DBP[0] + 100, DBP[1] + 90, true, GOOD, pop(u, 1.2) * 0.8); sub(DBP[0] + 10, 404, 'commit 완료 · 되돌리기 불가', fade(u, 1.5), { fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 2) { fly(SV[0] + 40, SV[1] + 40, lerp(SV[0] + 40, KX + 100, 0.5), lerp(SV[1] + 40, KY - 20, 0.5), seg(u, 0.2, 1.0), 'send order.created', { mono: true, fill: WARN, stay: true });
      if (u > 1.1) { cross(lerp(SV[0] + 40, KX + 100, 0.6), lerp(SV[1] + 40, KY - 20, 0.6), 16, pop(u, 1.1)); mono(600, 150, '브로커 다운 · 네트워크 끊김', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) }); }
      sub(480, 404, 'DB 는 이미 커밋된 뒤다', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { mono(560, 125, 'commit 직후 kill', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) });
      ['?', '?'].forEach((q, i) => mono(940, 205 + i * 120, q, { 'font-size': 22, 'font-weight': 800, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.6) }));
      sub(480, 404, '주문은 있는데 결제·배송은 영원히 모른다', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 4) { dot([[SV[0] + 40, SV[1] + 22], [KX + 22, KY + 18]], seg(u, 0.3, 1.0), WARN, 7);
      dot([[KX + 42, KY + 18], [780, 200]], seg(u, 1.1, 1.6), WARN, 7); if (u > 1.6) pill(850, 150, '결제 처리 ✓', WARN, pop(u, 1.6), { fs: 13.5, fill: PANEL });
      if (u > 1.8) mono(DBP[0] + 90, DBP[1] + 140, 'ROLLBACK', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      sub(560, 404, '존재하지 않는 주문의 결제 · 유령 결제', fade(u, 2.2), { fill: BAD, 'font-weight': 700 }); return; }
    el('rect', { x: 40, y: 190, width: 720, height: 195, rx: 14, fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '8 6', opacity: fade(u, 0.2) });
    mono(52, 182, 'XA (2PC) 로 묶기?', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.2) }); cross(400, 190, 18, pop(u, 0.9));
    sub(480, 404, 'Kafka 는 XA 를 지원하지 않고, 성능·가용성도 감당이 안 된다', fade(u, 1.4), { fill: BAD, 'font-weight': 700 }); }

  // ---------- 2. Outbox 쓰기 ----------
  const OCOLS = ['id', 'aggregate', 'event_type', 'payload', 'published'], OW = [50, 110, 140, 150, 110];
  function s2(t, c) { const { k, u } = c;
    zone(30, 70, 900, 330, 'order_db (같은 DB, 같은 세션)', { fill: SOFT });
    const commit = k >= 4 ? (k === 4 ? u > 1.0 : true) : false;
    if (k >= 1) { const a = k === 1 ? fade(u, 0.2) : 1;
      el('rect', { x: 50, y: 110, width: 860, height: 200, rx: 12, fill: 'none', stroke: commit ? GOOD : ACC, 'stroke-width': 2.4, 'stroke-dasharray': commit ? null : '8 6', opacity: a });
      mono(62, 128, commit ? 'COMMIT · 둘 다 확정' : 'BEGIN · 한 트랜잭션', { 'font-size': 14, 'font-weight': 700, fill: commit ? GOOD : ACC, opacity: a }); }
    const rowSt = (on) => (commit ? { col: GOOD, fill: GOODBG } : { dash: true, col: ACC, fill: PANEL });
    table(70, 170, ['id', 'user', 'amount'], [60, 80, 80], k >= 1 ? [[['901', 'u7', '39000'], Object.assign({ op: k === 1 ? fade(u, 0.6) : 1 }, rowSt())]] : [], { title: 'orders', op: 1 });
    if (k === 1) { mono(180, 290, 'flush() · id 확보', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); return; }
    const oRow = k >= 2 ? [[['1', 'Order', 'OrderCreated', k >= 3 ? '{…}' : '', 'False'], Object.assign({ op: k === 2 ? fade(u, 0.5) : 1 }, rowSt())]] : [];
    table(330, 170, OCOLS, OW, oRow, { title: 'outbox_events', tcol: ACC, colOp: (j) => (k === 0 ? fade(u, 0.3 + j * 0.25) : 1) });
    if (k === 0) { sub(480, 300, '보낼 이벤트를 밖으로 보내지 않고 같은 DB 에 적는다', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      mono(830, 240, 'published', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.6) }); mono(830, 258, '= 발행 여부', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 2) { mono(560, 290, 'db.add(OutboxEvent(…)) · 새 커넥션 아님', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); return; }
    if (k === 3) { const f = ['"order_id": "901"', '"user_id": "u7"', '"amount": 39000'];
      card(640, 345, 300, 92, { rx: 8, stroke: ACC, sw: 1.8, s: pop(u, 0.2) });
      f.forEach((s, i) => mono(500, 324 + i * 22, s, { 'font-size': 14, fill: ACC, 'font-weight': 600, opacity: fade(u, 0.5 + i * 0.4) }));
      grow(640, 245, 640, 296, E(u, 0.2, 0.5), ACC, { plain: true });
      sub(240, 350, '컨슈머는 이 JSON 만 보고 일한다', fade(u, 1.8), { 'font-weight': 700, fill: INK, 'text-anchor': 'start' }); sub(240, 376, '값은 예시', fade(u, 2.0), { 'text-anchor': 'start' }); return; }
    if (k === 4) { svc(860, 42, 'Kafka', { w: 100, stroke: BAD, s: 1 }); cross(860, 42, 14, pop(u, 0.4));
      if (u > 1.0) check(480, 345, 14, pop(u, 1.0));
      sub(480, 385, 'Kafka 가 죽어 있어도 commit 은 성공한다', fade(u, 1.5), { 'font-weight': 700, fill: GOOD }); return; }
    [['주문만 있고 이벤트 없음', 250], ['이벤트만 있고 주문 없음', 710]].forEach(([s, x], i) => { card(x, 355, 360, 46, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 0.2 + i * 0.4), text: s, fs: 15, color: MUT });
      grow(x - 160, 355, x + 160, 355, E(u, 1.0 + i * 0.4, 1.4 + i * 0.4), BAD, { plain: true, sw: 3 }); });
    mono(480, 360, '불가능', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }

  // ---------- 3. Relay ----------
  function outRows(pub, lockA, lockB, o) { o = o || {};
    const rows = [1, 2, 3, 4, 5, 6].map((id, i) => { const p = pub(i); return [[String(id), 'OrderCreated', p ? 'True' : 'False'], { col: p === 'tmp' ? WARN : p ? GOOD : GRID, fill: p === 'tmp' ? WARNBG : p ? GOODBG : PANEL, vcol: (j) => (j === 2 ? (p ? (p === 'tmp' ? WARN : GOOD) : MUT) : INK) }]; });
    table(40, 120, ['id', 'event_type', 'published'], [40, 140, 100], rows, { title: 'outbox_events' });
    [1, 2, 3, 4, 5, 6].forEach((_, i) => { const l = lockA(i) ? 'A' : lockB(i) ? 'B' : null; if (l) { lock(310, 169 + i * 34, true, l === 'A' ? ACC : INFO, 0.6); mono(326, 174 + i * 34, l, { 'font-size': 14, 'font-weight': 800, fill: l === 'A' ? ACC : INFO }); } }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const B = [[560, 150, 'leader'], [760, 100, 'follower'], [760, 240, 'follower']];
      svc(150, 190, 'producer', { w: 150 }); B.forEach(([x, y, n], i) => svc(x, y, 'broker · ' + n, { w: 200, s: pop(u, 0.1 + i * 0.15), fs: 14.5 }));
      dot([[226, 190], [460, 150]], seg(u, 0.3, 0.8), WARN, 7); dot([[660, 150], [660, 100]], seg(u, 0.9, 1.3), WARN, 6); dot([[660, 150], [660, 240]], seg(u, 0.9, 1.3), WARN, 6);
      dot([[460, 160], [226, 200]], seg(u, 1.5, 2.0), GOOD, 7); if (u > 2.0) pill(340, 236, 'ack · 모두 받았을 때', GOOD, pop(u, 2.0), { fs: 13.5, fill: PANEL });
      mono(40, 330, 'acks="all"', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 0.4) });
      mono(40, 360, 'enable_idempotence=True · 재시도 중복을 브로커가 거른다', { 'font-size': 14.5, fill: INK, opacity: fade(u, 1.2) });
      sub(480, 400, '그래도 컨슈머 쪽 중복 제거는 따로 필요하다', fade(u, 2.2), { 'font-weight': 700, fill: WARN }); return; }
    if (k === 1) { svc(200, 110, 'API 프로세스', { w: 180 }); svc(200, 290, 'relay 워커', { w: 180, stroke: ACC });
      el('line', { x1: 200, y1: 134, x2: 200, y2: 266, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); cross(200, 200, 10, pop(u, 0.5));
      const tick = Math.floor(clamp(u / 2.6) * 3); clock(480, 340, 34, (u % 1), ACC, `1초마다 · ${tick}번째 루프`);
      db(700, 200, 'order_db', {}); grow(290, 285, 650, 220, E(u, 0.8, 1.4), ACC, { plain: true });
      sub(520, 120, '발행 책임이 API 요청 경로에서 빠진다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    const pubOf = (i) => { if (k <= 2) return false; if (k === 3) return u > 0.6 + i * 0.25 && i < 3 ? 'tmp' : false; if (k === 4) return i < 3 ? (u > 0.6 ? true : 'tmp') : false; return true; };
    const lockA = (i) => (k === 2 ? u > 0.4 && i < 3 : k === 3 || (k === 4 && u < 0.6)) && i < 3, lockB = (i) => k === 2 && u > 1.2 && i >= 3;
    if (k <= 4) outRows(pubOf, lockA, lockB);
    if (k === 2) { svc(520, 150, '워커 A', { w: 120, stroke: ACC }); svc(520, 290, '워커 B', { w: 120, stroke: INFO, s: pop(u, 0.9) });
      if (u > 1.2) mono(600, 340, 'SKIP LOCKED: 잠긴 행은 건너뛴다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) });
      mono(600, 100, 'published=False · id 순 · LIMIT 100', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) }); return; }
    if (k === 3 || k === 4) { svc(470, 200, 'relay', { w: 110, stroke: ACC });
      const n = k === 3 ? Math.min(3, Math.floor(clamp((u - 0.6) / 0.75) * 3 + (u > 0.6 ? 1 : 0))) : (u > 1.6 ? 4 : 3);
      topic(580, 180, n, { title: 'Kafka · events.order', vals: ['1', '2', '3', '1'], dup: (i) => i === 3 });
      if (k === 3) { for (let i = 0; i < 3; i++) dot([[525, 200], [602 + i * 46, 198]], seg(u, 0.6 + i * 0.25, 0.85 + i * 0.25), WARN, 6);
        sub(720, 270, 'key = 이벤트 id · 아직 커밋 전', fade(u, 1.6), { fill: WARN, 'font-weight': 700 }); return; }
      mono(470, 268, u < 0.6 ? 'flush() → commit' : 'commit ✓', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle' });
      if (u > 1.2) { mono(720, 290, 'flush 뒤 commit 전에 죽으면', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
        mono(720, 312, '다음 루프가 다시 보낸다', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
      if (u > 1.9) banner(700, 370, 'at-least-once', pop(u, 1.9)); return; }
    // k === 5: CDC
    db(120, 190, 'PostgreSQL', {});
    for (let i = 0; i < 8; i++) { const x = 190 + i * 40; el('rect', { x, y: 175, width: 32, height: 28, rx: 4, fill: i < E(u, 0.2, 1.0) * 8 ? INFO : SOFT, opacity: 0.8 }); }
    mono(190, 162, 'WAL', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
    svc(620, 189, 'Debezium', { w: 140, stroke: INFO, s: pop(u, 0.6) }); grow(510, 189, 548, 189, E(u, 0.8, 1.1), INFO);
    svc(840, 189, 'Kafka', { w: 110, s: pop(u, 1.0) }); grow(692, 189, 782, 189, E(u, 1.1, 1.4), INFO);
    const ax = 230; tx(ax - 20, 290, '폴링', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.5) }); tx(ax - 20, 334, 'CDC', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.5) });
    el('rect', { x: ax, y: 276, width: 500 * E(u, 1.5, 2.3), height: 22, rx: 4, fill: OFF }); mono(ax + 510, 293, '약 1초', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 2.2) });
    el('rect', { x: ax, y: 320, width: 50 * E(u, 1.5, 2.3), height: 22, rx: 4, fill: INFO }); mono(ax + 60, 337, '< 100ms', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.2) });
    sub(480, 395, '대신 Kafka Connect + Debezium 운영 부담이 생긴다', fade(u, 2.3), { 'font-weight': 700, fill: WARN }); }

  // ---------- 4. Event Sourcing ----------
  const EV = [['OrderCreated', 'amount=39000', ACC], ['OrderPaid', 'paid_at', GOOD], ['OrderShipped', 'tracking', INFO]];
  function tape(n, u, o) { o = o || {}; mono(60, 50, 'event store · append-only', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    for (let i = 0; i < 5; i++) { const x = 60 + i * 172, on = i < n; el('rect', { x, y: 62, width: 162, height: 56, rx: 8, fill: on ? PANEL : SOFT, stroke: on ? EV[i % 3][2] : GRID, 'stroke-width': on ? 2.2 : 1.2, 'stroke-dasharray': on ? null : '4 4', opacity: on && o.op ? o.op(i) : 1 });
      if (on) { mono(x + 81, 86, EV[i % 3][0], { 'font-size': 14.5, 'font-weight': 700, fill: EV[i % 3][2], 'text-anchor': 'middle', opacity: o.op ? o.op(i) : 1 }); mono(x + 81, 106, 'seq ' + (i + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: o.op ? o.op(i) : 1 }); } } }
  function orderCard(x, y, vals, o) { o = o || {}; card(x + 140, y + 60, 280, 120, { rx: 10, stroke: ACC, sw: 2, s: o.s });
    mono(x + 16, y + 22, 'Order', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: o.s ?? 1 });
    ['id', 'status', 'amount'].forEach((f, i) => { mono(x + 16, y + 50 + i * 26, f, { 'font-size': 14, fill: MUT, opacity: o.s ?? 1 }); mono(x + 110, y + 50 + i * 26, vals[i], { 'font-size': 14.5, 'font-weight': 700, fill: o.hi === i ? ACC : INK, opacity: o.s ?? 1 }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { tape(k === 0 ? 1 : 3, u, { op: (i) => (k === 0 ? fade(u, 0.2) : i ? fade(u, 0.3 + i * 0.4) : 1) });
      if (k === 0) { lock(210, 150, true, ACC, pop(u, 0.6)); mono(236, 156, '@dataclass(frozen=True)', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
        fly(500, 260, 150, 210, seg(u, 1.2, 2.0), 'event.amount = 0', { fill: BAD, mono: true, stay: true }); if (u > 2.0) cross(250, 210, 12, pop(u, 2.0));
        sub(480, 360, '이벤트는 일어난 사실의 기록 · 고치지 않는다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
      sub(480, 220, '상태 컬럼 하나 대신 주문의 일생을 이벤트 타입 3개로 남긴다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { tape(3, u); orderCard(80, 200, ['None', 'None', '0'], { s: pop(u, 0.3) });
      sub(640, 260, '값은 저장하지 않는다', fade(u, 1.0), { 'font-weight': 700, fill: INK }); sub(640, 286, '전부 이벤트에서 계산한다', fade(u, 1.4)); return; }
    if (k === 3) { tape(3, u); const S = [['PENDING', 220, ACC], ['PAID', 480, GOOD], ['SHIPPED', 740, INFO]];
      S.forEach(([n, x, col], i) => { card(x, 300, 160, 56, { rx: 28, text: n, fs: 16, mono: true, stroke: col, color: col, s: pop(u, 0.3 + i * 0.5) });
        grow(x - 60 + 0, 120, x, 270, E(u, 0.2 + i * 0.5, 0.5 + i * 0.5), col, { plain: true, dash: '4 4' });
        if (i < 2) grow(x + 82, 300, S[i + 1][1] - 84, 300, E(u, 0.6 + i * 0.5, 0.9 + i * 0.5), INK); });
      mono(480, 380, 'apply(event): isinstance 로 갈라 status 를 옮긴다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    if (k === 4) { tape(3, u); const p = clamp((u - 0.3) / 2.0) * 3, i = Math.min(2, Math.floor(p));
      if (u > 0.3 && u < 2.4) el('rect', { x: 56 + i * 172, y: 58, width: 170, height: 64, rx: 10, fill: 'none', stroke: INK, 'stroke-width': 3 });
      const st = u < 0.3 ? ['None', 'None', '0'] : i === 0 ? ['o-901', 'PENDING', '39000'] : i === 1 ? ['o-901', 'PAID', '39000'] : ['o-901', 'SHIPPED', '39000'];
      orderCard(80, 200, st, { hi: 1 }); mono(560, 260, `for e in events: order.apply(e)`, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      sub(700, 300, '이벤트가 많아지면 이 반복이 그대로 느려진다', fade(u, 2.0), { 'font-weight': 700, fill: WARN }); return; }
    tape(Math.round(lerp(3, 4, E(u, 0.3, 0.8))), u, { op: (i) => (i === 3 ? fade(u, 0.5) : 1) });
    pill(600, 170, 'repo.append(event)', ACC, pop(u, 0.4), { mono: true, fs: 14, fill: PANEL });
    [['UPDATE', 300], ['DELETE', 480]].forEach(([s, x], i) => { pill(x, 280, s, OFF, pop(u, 1.0 + i * 0.2), { mono: true, color: MUT, fill: PANEL }); cross(x + 64, 280, 12, pop(u, 1.4 + i * 0.2)); });
    sub(480, 360, '쓰기는 INSERT 한 가지 · 모든 변경이 감사 로그로 남는다', fade(u, 1.9), { 'font-weight': 700, fill: INK }); }

  // ---------- 5. Snapshot ----------
  const TX0 = 60, TW = 840, NEV = 9950, sx = (q) => TX0 + (q / NEV) * TW;
  function evTape(o) { o = o || {}; el('rect', { x: TX0, y: 140, width: TW * (o.grow ?? 1), height: 30, rx: 6, fill: SOFT, stroke: GRID });
    const nt = Math.floor(99 * (o.ticks ?? 0)); for (let i = 1; i <= nt; i++) el('line', { x1: sx(i * 100), y1: 140, x2: sx(i * 100), y2: 170, stroke: ACC, 'stroke-width': 1.2, opacity: 0.6 });
    [[0, '0'], [5000, '5,000'], [9900, '9,900']].forEach(([q, s]) => mono(sx(q), 194, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': q ? 'middle' : 'start', opacity: o.grow ?? 1 }));
    mono(TX0, 128, `order o-901 의 이벤트 ${NEV.toLocaleString('en-US')}개`, { 'font-size': 14, 'font-weight': 700, fill: MUT }); }
  function snapCard(x, y, s, col) { card(x, y, 170, 58, { rx: 8, stroke: col || ACC, sw: 2, fill: ACCBG, s, text: 'snapshot\nseq 9900', fs: 14, mono: true, color: col || ACC }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 4) evTape({ grow: k === 0 ? E(u, 0.1, 0.8) : 1, ticks: k === 0 ? E(u, 0.9, 2.2) : 1 });
    if (k === 0) { mono(TX0, 260, 'SNAPSHOT_EVERY = 100', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      sub(480, 330, '촘촘하면 쓰기가 느리고, 성기면 읽기가 느리다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { const q = Math.round(lerp(9897, 9900, E(u, 0.2, 1.0)));
      mono(sx(9900), 100, 'seq ' + q, { 'font-size': 15, 'font-weight': 800, fill: q === 9900 ? ACC : INK, 'text-anchor': 'middle' });
      mono(480, 240, `${q} % 100 == ${q % 100}`, { 'font-size': 16, 'font-weight': 700, fill: q % 100 ? MUT : ACC, 'text-anchor': 'middle' });
      if (u > 1.0) { snapCard(sx(9900) - 60, 300, pop(u, 1.1)); grow(sx(9900), 172, sx(9900) - 60, 270, E(u, 1.0, 1.4), ACC); }
      sub(380, 320, 'state 와 seq 를 함께 저장', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { const sc = sx(9900) + (1 - E(u, 0.2, 1.4)) * 60; el('rect', { x: sc - 4, y: 132, width: 8, height: 46, rx: 3, fill: INK, opacity: fade(u, 0.2) });
      snapCard(sx(9900) - 60, 300, 1, u > 1.4 ? ACC : GRID);
      mono(120, 280, 'from_seq = 0', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) }); sub(200, 310, '스냅샷이 없으면 처음부터 재생', fade(u, 2.0)); return; }
    if (k === 3) { snapCard(sx(9900) - 60, 300, 1); orderCardMini(220, 300, pop(u, 0.9));
      grow(sx(9900) - 148, 300, 320, 300, E(u, 0.5, 0.9), ACC);
      mono(120, 240, `from_seq = ${Math.round(tween(0, 9900, u, 1.4)).toLocaleString('en-US')}`, { 'font-size': 16, 'font-weight': 800, fill: ACC });
      el('rect', { x: TX0, y: 140, width: sx(9900) - TX0, height: 30, rx: 6, fill: OFF, opacity: 0.45 * fade(u, 1.4) });
      mono((TX0 + sx(9900)) / 2, 160, '9,900개 재생 대신 한 번 조회', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 4) { el('rect', { x: TX0, y: 140, width: sx(9900) - TX0, height: 30, rx: 6, fill: OFF, opacity: 0.45 });
      el('rect', { x: sx(9900), y: 140, width: sx(9950) - sx(9900), height: 30, fill: ACC, opacity: 0.85 });
      const n = Math.round(tween(0, 50, u, 1.8)); mono(sx(9925), 110, `+${n}`, { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      mono(480, 270, `load_events_after(9900) → ${n}개 apply`, { 'font-size': 16, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
      sub(480, 310, '재생 대상이 전체에서 스냅샷 이후로 줄어든다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 5) { const max = 1200, W = 620;
      [['스냅샷 없음 · 9,950개 재생', 1200, OFF], ['스냅샷 + 50개 재생', 8, ACC]].forEach(([n, v, col], i) => { const y = 120 + i * 100;
        tx(150, y - 12, n, { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: 150, y, width: Math.max(3, W * v / max * E(u, 0.2 + i * 0.4, 1.2 + i * 0.4)), height: 34, rx: 5, fill: col });
        mono(150 + Math.max(3, W * v / max) + 10, y + 23, v + 'ms', { 'font-size': 16, 'font-weight': 800, fill: col === OFF ? INK : ACC, opacity: fade(u, 1.0 + i * 0.4) }); });
      mono(480, 330, `약 ${Math.round(tween(1, 150, u, 1.4))}배`, { 'font-size': 30, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(480, 372, '페이지의 예시 수치 · 이벤트가 쌓일수록 격차가 커진다', fade(u, 2.0)); return; }
    const L = [['outbox (published, created_at) 인덱스', 'Outbox'], ['relay 워커 다중 실행 + SKIP LOCKED', 'Relay'], ['producer enable_idempotence', 'Relay'], ['컨슈머는 event_id 로 중복 제거', 'Consumer'], ['스키마 진화: upcaster, versioned event', 'ES']];
    L.forEach(([a, b], i) => { const y = 70 + i * 66, s = pop(u, 0.2 + i * 0.35);
      card(480, y, 700, 52, { rx: 10, stroke: GRID, sw: 1.6, s }); check(160, y, 10, s);
      tx(186, y + 6, a, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) }); pill(770, y, b, ACC, s, { fs: 13.5, fill: PANEL }); }); }
  function orderCardMini(x, y, s) { card(x, y, 200, 76, { rx: 10, stroke: GOOD, sw: 2, s, text: 'Order\nseq 9900 까지 반영', fs: 14.5, mono: true, color: GOOD }); }

  const quiz = [
    { q: 'db.commit() 직후 producer.send() 전에 프로세스가 죽으면 어떤 상태가 되나?',
      o: ['주문 row는 있고 결제·배송 서비스는 그 주문을 모른다', '주문과 이벤트가 둘 다 사라진다', 'Kafka가 DB를 보고 이벤트를 다시 만든다'], a: 0,
      why: 'DB와 Kafka는 트랜잭션을 공유하지 않는다. 커밋이 끝난 뒤 발행이 빠지면 불일치가 그대로 확정된다.' },
    { q: 'Outbox 패턴에서 주문과 이벤트가 함께 커밋되는 이유는 무엇인가?',
      o: ['Kafka가 2PC를 지원해서', '같은 DB 세션에 orders와 outbox_events를 함께 쓰기 때문에', 'relay 워커가 1초마다 확인해서'], a: 1,
      why: '같은 DB 안의 두 테이블 INSERT는 단일 트랜잭션이다. 그래서 둘 다 커밋되거나 둘 다 롤백된다.' },
    { q: 'relay가 Kafka로 보낸 뒤 published 변경을 커밋하기 전에 죽으면 어떻게 되나?',
      o: ['이벤트가 영영 사라진다', 'Kafka가 published를 대신 바꿔 준다', '다음 루프가 같은 이벤트를 다시 보내 중복이 생길 수 있다'], a: 2,
      why: '커밋되지 않은 행은 여전히 published=False라 다시 집힌다. 그래서 at-least-once이고 컨슈머가 event_id로 중복을 걸러야 한다.' },
    { q: 'Event Sourcing에서 주문의 현재 status를 얻는 방법은 무엇인가?',
      o: ['빈 Order에 이벤트를 처음부터 순서대로 apply한다', 'orders 테이블의 status 컬럼을 읽는다', '가장 마지막 이벤트 하나만 읽는다'], a: 0,
      why: '현재 상태는 저장하지 않고 이벤트를 재생해 계산한다. OrderCreated → OrderPaid → OrderShipped를 차례로 적용하면 SHIPPED가 된다.' },
    { q: '이벤트 9,950개, 스냅샷 100개마다일 때 load()가 재생하는 이벤트는 몇 개인가?',
      o: ['9,950개', '100개', '50개'], a: 2,
      why: '가장 최근 스냅샷이 seq 9,900이므로 그 뒤 50개만 apply하면 된다.' },
  ];

  const summary = [
    'DB 커밋과 Kafka 발행은 한 트랜잭션이 아니라서 어느 순서든 한쪽만 성공할 수 있다.',
    'Outbox는 이벤트를 같은 DB 테이블에 주문과 함께 적어 원자성을 얻는다.',
    'relay 워커나 CDC가 outbox를 Kafka로 옮기고, 중복이 생길 수 있어 컨슈머가 걸러야 한다.',
    'Event Sourcing은 이벤트만 쌓아 상태를 재생하고, 스냅샷으로 재생 길이를 줄인다.',
  ];
  const review = [
    { q: '결제 서비스가 같은 주문을 두 번 결제했다. outbox relay 로그에는 재시작 기록이 있다. 먼저 의심할 것은?',
      o: ['outbox 행이 주문 없이 저장됐다', 'relay가 발행 후 커밋 전에 죽어 같은 이벤트를 다시 보냈고 컨슈머가 중복을 안 걸렀다', 'Kafka가 이벤트를 잃어버렸다'], a: 1,
      why: 'relay는 at-least-once다. 컨슈머가 event_id로 처리 여부를 확인하지 않으면 재전송이 그대로 두 번 처리된다.' },
    { q: 'Outbox를 넣었더니 Kafka 장애 중에도 주문은 받는데 이벤트가 1초씩 늦게 나간다. 지연을 100ms 안으로 줄이려면?',
      o: ['Debezium CDC로 WAL을 읽어 outbox 변경을 스트리밍한다', 'API에서 바로 producer.send를 다시 부른다', 'relay 배치 크기를 1로 줄인다'], a: 0,
      why: '폴링 주기가 곧 지연이다. CDC는 WAL을 직접 구독해 폴링 없이 옮기지만 Kafka Connect 운영 부담이 생긴다.' },
    { q: 'Event Sourcing으로 만든 주문 조회가 이벤트가 쌓일수록 느려진다. 알맞은 대응은?',
      o: ['이벤트를 UPDATE로 합쳐 개수를 줄인다', '오래된 이벤트를 DELETE한다', '일정 개수마다 상태를 seq와 함께 스냅샷으로 저장한다'], a: 2,
      why: '이벤트는 고치거나 지우지 않는다. 스냅샷부터 출발해 그 뒤 이벤트만 재생하면 조회 비용이 일정하게 유지된다.' },
  ];

  R.page({ title: 'Outbox / Event Sourcing 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
