/* I-2-1 DDD · Bounded Context — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 같은 "상품"이 Context 마다 다른 레코드가 되고, Context 사이는 ID 와 이벤트로만 이어진다. 아래 계기판은 STEPS 의 contextCount · sharedFields · coherence.
 * 숫자: 페이지 코드의 필드 수(7·5·5, 합치면 14 — node 로 셈), 데이터 값만. 응집도(%)는 페이지가 든 어림값이라 "어림"으로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, person, cross, check, lock, meters } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));

  function gauges(c) { const b = c.beat, p = c.prev || {};
    const cc = tween(p.contextCount, b.contextCount, c.u), sf = tween(p.sharedFields, b.sharedFields, c.u), co = tween(p.coherence, b.coherence, c.u);
    meters(150, 344, 660, [
      { name: 'Context 수', val: Math.round(cc) + '개', bar: cc / 15 * 100, hot: b.contextCount >= 12 },
      { name: '공유 필드', val: Math.round(sf) + '개', bar: sf / 8 * 100, hot: b.sharedFields >= 5 },
      { name: '응집도 (어림)', val: Math.round(co) + '%', bar: co, hot: co < 50, good: co >= 85 },
    ], { h: 64 }); }
  // 레코드 카드: 머리 + 필드 줄. shown 개수만큼 보임, hi(i) 강조
  function record(cx, y, head, fields, shown, o) { o = o || {}; const w = o.w || 250, h = 40 + fields.length * 25, col = o.col || INK;
    el('rect', { x: cx - w / 2, y, width: w, height: h, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2.2, opacity: o.op ?? 1 });
    el('rect', { x: cx - w / 2, y, width: w, height: 32, rx: 10, fill: o.headFill || SOFT, opacity: o.op ?? 1 });
    mono(cx - w / 2 + 12, y + 22, head, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: o.op ?? 1 });
    fields.forEach((f, i) => { const s = clamp(shown - i); if (s <= 0) return; const yy = y + 54 + i * 25, hi = o.hi && o.hi(i);
      if (hi) el('rect', { x: cx - w / 2 + 6, y: yy - 17, width: w - 12, height: 23, rx: 4, fill: hi === 'bad' ? BADBG : ACCBG, opacity: s });
      mono(cx - w / 2 + 16, yy, f, { 'font-size': 14, opacity: s * (o.op ?? 1), fill: hi === 'bad' ? BAD : hi ? ACC : INK }); });
    return h; }

  // ---------- 1. 같은 이름, 다른 의미 ----------
  const CAT = ['ProductId id', 'String title', 'String description', 'List imageUrls', 'CategoryPath category', 'List<Spec> specs', 'SeoMetadata seo'];
  const ORD = ['ProductId id', 'Money price', 'int stockQty', 'Weight weight', 'boolean isOrderable'];
  const SHP = ['ParcelId id', 'Weight weight', 'Dimensions size', 'WarehouseAddress origin', 'HazardClass hazard'];
  const RX = [170, 480, 790];
  function s1(t, c) { const { k, u } = c;
    const sh = (i) => (i < k ? 9 : i === k ? E(u, 0.3, 1.8) * 8 : k === 3 ? 9 : -1);
    const items = [['catalog.Product', CAT, ACC], ['order.Product', ORD, INFO], ['shipping.Parcel', SHP, WARN]];
    items.forEach(([h, f, col], i) => { const n = sh(i); if (n < 0) return;
      record(RX[i], 30, h, f, n, { col, op: i === k || k === 3 ? 1 : 0.85, hi: k === 3 ? (j) => (j === 0 ? true : false) : null }); });
    if (k === 0) note(RX[1] + 40, 120, '가격도 재고도 여기엔 없다', fade(u, 2.0), { fill: MUT });
    if (k === 1) { pill(RX[1], 230, '같은 이름 · 다른 클래스', INFO, pop(u, 2.0), { fs: 14 }); }
    if (k === 2) { const f = E(u, 0.2, 0.7); mono(RX[2], 268, 'Product', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, 'text-decoration': 'line-through', opacity: 1 - 0.5 * f });
      grow(RX[2] + 42, 263, RX[2] + 70, 263, f, WARN); mono(RX[2] + 80, 268, '택배', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: f }); }
    if (k === 3) { const f = E(u, 0.2, 0.9);
      el('path', { d: `M${RX[0] + 125},84 C${RX[0] + 170},84 ${RX[1] - 170},84 ${RX[1] - 125},84`, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': `${f * 200} 300` });
      if (f >= 1) pill(RX[1], 222, 'ProductId 로만 잇는다', ACC, 1, { fs: 13.5, fill: PANEL });
      const g = E(u, 1.2, 1.8); card(480, 300, 560, 50, { rx: 10, stroke: BAD, fill: BADBG, s: g });
      tx(480, 306, 'ProductMaster 하나로 합치면 필드 14개 · 각 팀은 5~7개만 쓴다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: g });
      cross(214, 300, 10, pop(u, 2.0)); }
    gauges(c); }

  // ---------- 2. 도메인 이벤트 ----------
  const EV = ['OrderId orderId', 'UserId userId', 'Money totalAmount', 'List lines', 'Instant occurredAt'];
  function envelope(cx, cy, s, o) { o = o || {}; const g = R.G(cx, cy, s);
    el('rect', { x: -62, y: -36, width: 124, height: 72, rx: 6, fill: o.fill || ACCBG, stroke: ACC, 'stroke-width': 2.4 }, g);
    el('path', { d: 'M-62,-36 L0,4 L62,-36', fill: 'none', stroke: ACC, 'stroke-width': 2 }, g);
    tx(0, 26, 'OrderPlaced', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, class: 'mono' }, g); }
  const SUB = [['payment', 120], ['shipping', 210], ['notification', 300]];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { record(330, 40, 'record OrderPlaced', EV, E(u, 0.2, 1.6) * 6, { col: ACC, w: 300 });
      pill(700, 110, '과거형 = 일어난 사실', ACC, pop(u, 1.4), { fs: 15 });
      tx(700, 170, '"결제하라" 가 아니라', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
      tx(700, 196, '"주문이 접수됐다"', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      el('circle', { cx: 700, cy: 260, r: 22, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: fade(u, 2.2) }); el('path', { d: 'M700,246 V260 L710,268', fill: 'none', stroke: MUT, 'stroke-width': 2.4, opacity: fade(u, 2.2) });
      tx(732, 266, 'occurredAt', { 'font-size': 14, class: 'mono', fill: MUT, opacity: fade(u, 2.3) });
      gauges(c); return; }
    // 공통 무대: order Context(왼쪽) · 버스(가운데) · 구독자(오른쪽)
    zone(30, 40, 300, 280, 'order Context', { fill: INFOBG, color: INFO });
    card(180, 100, 230, 50, { rx: 8, text: 'PlaceOrderService', fs: 15, mono: true, stroke: INFO });
    dbIcon(270, 236, null, { s: 0.6, stroke: INFO }); tx(270, 300, 'orders', { 'font-size': 14, class: 'mono', fill: MUT, 'text-anchor': 'middle' });
    el('line', { x1: 480, y1: 50, x2: 480, y2: 320, stroke: GRID, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: k >= 3 ? 1 : 0.4 });
    tx(480, 40, 'publisher', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, class: 'mono' });
    if (k === 1) { [['orderRepo', true], ['publisher', true], ['PaymentService', false], ['ShippingService', false]].forEach(([s, ok], i) => { const y = 150 + i * 34, a = 0.3 + i * 0.35;
        mono(70, y + 5, s, { 'font-size': 14.5, 'font-weight': 700, fill: ok ? INK : OFF, opacity: fade(u, a), 'text-decoration': ok ? null : 'line-through' });
        if (ok) check(56, y, 7, pop(u, a)); else cross(56, y, 6, pop(u, a)); });
      note(640, 180, '다른 Context 타입이 없다', fade(u, 1.9), { fill: ACC, 'text-anchor': 'middle' }); gauges(c); return; }
    if (k === 2) { el('rect', { x: 50, y: 70, width: 260, height: 220, rx: 10, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.2) });
      mono(60, 300 + 12, '@Transactional', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.2) });
      pill(180, 160, 'Order.create(cmd)', INFO, pop(u, 0.5), { mono: true, fs: 13.5 });
      dot([[180, 176], [180, 236], [240, 236]], seg(u, 1.0, 1.8), INFO, 7); pill(150, 236, 'save', INFO, pop(u, 1.6), { fs: 13.5 });
      note(640, 180, '저장이 먼저, 사실은 그다음', fade(u, 2.0), { fill: INFO, 'text-anchor': 'middle' }); gauges(c); return; }
    // k ≥ 3: 발행
    const p = k === 3 ? E(u, 0.3, 1.4) : 1; envelope(lerp(180, 480, p), lerp(100, 180, p), k === 3 ? 0.6 + 0.4 * p : 1);
    if (k === 3) { note(640, 300, 'publish 한 번이면 발행 코드는 끝', fade(u, 1.6), { 'text-anchor': 'middle', fill: ACC }); gauges(c); return; }
    const subs = k === 4 ? SUB.slice(0, 1) : SUB;
    subs.forEach(([n, y], i) => { const a = k === 4 ? 0.2 : 0.2 + i * 0.4, s = k === 5 && i === 0 ? 1 : pop(u, a);
      card(800, y, 190, 56, { rx: 10, text: n, fs: 15, mono: true, stroke: GOOD, s });
      // 의존 방향: 구독자 → 계약
      grow(704, y, 548, lerp(y, 180, 0.5), k === 5 && i === 0 ? 1 : E(u, a + 0.3, a + 0.8), GOOD, { dash: '6 4' });
      const f = k === 5 && i === 0 ? 1 : seg(u, a + 0.8, a + 1.6); if (f > 0 && f < 1) fly(530, 180, 700, y, f, 'OrderPlaced', { mono: true }); });
    if (k === 4) { mono(800, 170, 'charge(userId, total)', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.9) });
      note(640, 300, '구독하는 쪽이 계약에 의존한다', fade(u, 2.2), { 'text-anchor': 'middle', fill: GOOD }); }
    if (k === 5) { el('line', { x1: 300, y1: 100, x2: 700, y2: 120, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 5', opacity: fade(u, 1.4) }); cross(500, 110, 9, pop(u, 1.6));
      note(700, 40, 'order 와 payment 는 서로 모른다', fade(u, 1.9), { 'text-anchor': 'middle', fill: ACC }); }
    gauges(c); }

  // ---------- 3. Aggregate Root ----------
  function orderAgg(o) { o = o || {}; const x = 260, y = 50, w = 360, h = 250;
    el('rect', { x, y, width: w, height: h, rx: 14, fill: ACCBG, stroke: ACC, 'stroke-width': 3, opacity: o.op ?? 1 });
    mono(x + 16, y + 26, 'Order (root)', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    const st = o.status || 'DRAFT'; pill(x + w - 70, y + 22, st, st === 'PLACED' ? GOOD : WARN, 1, { mono: true, fs: 13.5, fill: PANEL });
    mono(x + 16, y + 58, 'id · userId', { 'font-size': 14, fill: MUT });
    mono(x + 16, y + 236, 'totalAmount', { 'font-size': 14.5, 'font-weight': 700, fill: o.totHot ? ACC : INK });
    el('rect', { x: x + 16, y: y + 72, width: w - 32, height: 140, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 28, y + 92, 'lines (내부 entity)', { 'font-size': 13.5, fill: MUT });
    const n = o.lines ?? 2; for (let i = 0; i < Math.ceil(n); i++) { const f = clamp(n - i), yy = y + 104 + i * 34;
      el('rect', { x: x + 28 + (1 - f) * 200, y: yy, width: w - 56, height: 28, rx: 5, fill: SOFT, stroke: INK, 'stroke-width': 1.5, opacity: f });
      mono(x + 40 + (1 - f) * 200, yy + 19, `OrderLine ${i + 1} · pid · qty · price`, { 'font-size': 13.5, opacity: f }); }
    return { x, y, w, h }; }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { orderAgg({ lines: E(u, 0.5, 1.6) * 2 }); note(780, 150, '같이 변하는 묶음', fade(u, 1.8), { 'text-anchor': 'middle', fill: ACC }); sub(780, 176, '= 한 트랜잭션 단위', fade(u, 2.1), { 'font-size': 14.5 }); gauges(c); return; }
    if (k === 1) { orderAgg({ lines: 2 });
      person(80, 180, '다른 코드', {});
      grow(110, 170, 290, 170, E(u, 0.2, 0.8), BAD); if (u > 0.8) cross(270, 170, 10, pop(u, 0.8));
      mono(150, 150, 'lines.add(…)', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 0.3) });
      el('rect', { x: 250, y: 286, width: 24, height: 30, rx: 3, fill: ACC, opacity: fade(u, 1.2) });
      grow(110, 290, 246, 300, E(u, 1.3, 1.9), ACC); mono(60, 280, 'addLine()', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      pill(780, 150, 'DRAFT 일 때만 허용', WARN, pop(u, 2.0), { fs: 14 });
      sub(780, 186, '입구가 하나면 규칙도 한 곳', fade(u, 2.2), { 'font-size': 14.5 }); gauges(c); return; }
    if (k === 2) { orderAgg({ lines: 2 + E(u, 0.3, 1.1), totHot: u > 1.3 });
      const p = E(u, 1.3, 1.9); if (p > 0) mono(lerp(560, 400, p), 286, '+ subtotal', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: 1 - 0.6 * E(u, 2.2, 2.6) });
      note(780, 140, '① line 만들기', fade(u, 0.4), { 'text-anchor': 'middle' }); note(780, 172, '② 목록에 넣기', fade(u, 0.9), { 'text-anchor': 'middle' }); note(780, 204, '③ 합계 갱신', fade(u, 1.4), { 'text-anchor': 'middle', fill: ACC });
      sub(780, 240, '셋 중 하나만 반영되는 상태가 없다', fade(u, 2.0), { 'font-size': 14 }); gauges(c); return; }
    if (k === 3) { const f = E(u, 0.6, 1.2); orderAgg({ lines: 3, status: f > 0.5 ? 'PLACED' : 'DRAFT' });
      mono(780, 110, 'place()', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.2) });
      grow(700, 120, 620, 80, E(u, 0.3, 0.7), ACC);
      card(780, 230, 160, 70, { rx: 10, stroke: BAD, s: pop(u, 1.5) }); tx(780, 226, '빈 주문', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      mono(780, 250, 'lines = []', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); cross(860, 205, 9, pop(u, 1.9)); gauges(c); return; }
    if (k === 4) { orderAgg({ lines: 3, status: 'PLACED' });
      card(740, 120, 190, 44, { rx: 8, text: 'OrderRepository', fs: 14, mono: true, stroke: GOOD, s: pop(u, 0.2) });
      grow(620, 120, 644, 120, E(u, 0.4, 0.7), GOOD); dbIcon(880, 200, null, { s: 0.55, stroke: GOOD }); grow(835, 132, 862, 172, E(u, 0.6, 0.9), GOOD);
      for (let i = 0; i < 3; i++) dot([[620, 120], [835, 132], [870, 175]], seg(u, 1.0 + i * 0.2, 1.8 + i * 0.2), ACC, 5);
      card(740, 260, 210, 44, { rx: 8, text: 'OrderLineRepository', fs: 14, mono: true, stroke: OFF, color: OFF, s: pop(u, 1.4) }); cross(740, 260, 14, pop(u, 1.8));
      sub(740, 166, 'line 도 root 와 같이 저장', fade(u, 1.2), { 'font-size': 13.5 }); gauges(c); return; }
    // k5: 큰 Aggregate 는 락이 부딪힌다 · 다른 Aggregate 는 ID 로
    card(230, 150, 300, 200, { rx: 14, stroke: BAD, fill: BADBG });
    mono(230, 90, 'Order + line 100개 + history', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD });
    for (let i = 0; i < 40; i++) el('rect', { x: 100 + (i % 10) * 26, y: 110 + Math.floor(i / 10) * 18, width: 22, height: 12, rx: 2, fill: BAD, opacity: 0.35 });
    lock(230, 210, true, BAD, pop(u, 0.4));
    const a = E(u, 0.5, 1.2); dot([[40, 210], [200, 210]], a < 1 ? a : 0.999, INFO, 9); dot([[420, 210], [260, 210]], a < 1 ? a * 0.7 : 0.7, WARN, 9);
    if (u > 1.2) tx(230, 270, 'TX 둘이 같은 락을 기다린다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD });
    mono(560, 110, 'order.user   = User', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3), 'text-decoration': 'line-through' });
    mono(560, 150, 'order.userId = UserId', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.7) });
    note(560, 210, '함께 변해야 하면 이벤트로 나눈다', fade(u, 2.1), { fill: ACC });
    sub(700, 246, '(eventual consistency)', fade(u, 2.3), { 'font-size': 14 });
    gauges(c); }

  // ---------- 4. Context Map ----------
  function ctx(cx, cy, name, o) { o = o || {}; return card(cx, cy, o.w || 130, 50, { rx: 25, text: name, fs: 15, mono: true, stroke: o.col || INK, fill: o.fill || PANEL, color: o.col || INK, s: o.s, op: o.op, dash: o.dash }); }
  function rel(x1, y1, x2, y2, f, lab, col, o) { o = o || {}; grow(x1, y1, x2, y2, f, col || MUT, { dash: o.dash });
    if (f >= 1 && lab) pill((x1 + x2) / 2, (y1 + y2) / 2 - (o.up ?? 18), lab, col || MUT, 1, { fs: 13.5, fill: PANEL }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { tx(240, 46, '협상할 수 있다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
      ctx(110, 160, 'user', { s: pop(u, 0.2) }); ctx(370, 160, 'order', { s: pop(u, 0.3) });
      rel(176, 160, 304, 160, E(u, 0.5, 1.0), 'Customer / Supplier', GOOD);
      mono(110, 210, '상류', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); mono(370, 210, '하류', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      pill(370, 250, '"이 필드 추가해 주세요"', GOOD, pop(u, 1.0), { fs: 13.5 });
      tx(720, 46, '그냥 따른다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.3) });
      ctx(600, 160, '결제 PG', { s: pop(u, 1.3) }); ctx(850, 160, '사내 결제', { s: pop(u, 1.4) });
      rel(666, 160, 784, 160, E(u, 1.5, 1.9), 'Conformist', WARN);
      pill(850, 250, 'PG 모델 그대로', WARN, pop(u, 2.1), { fs: 13.5 });
      gauges(c); return; }
    if (k === 1) { // ACL: 지저분한 외부 모델이 변환 계층을 지나 깨끗해진다
      zone(30, 50, 200, 260, '레거시 ERP', { fill: WARNBG, color: WARN });
      zone(560, 50, 200, 260, '우리 도메인', { fill: ACCBG, color: ACC });
      el('rect', { x: 370, y: 60, width: 30, height: 240, rx: 6, fill: INK, opacity: pop(u, 0.2) }); tx(385, 330, 'ACL', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      for (let i = 0; i < 3; i++) { const p = seg(u, 0.4 + i * 0.4, 1.6 + i * 0.4); if (p <= 0) continue; const y = 120 + i * 60, x = lerp(140, 660, p);
        if (x < 385) el('path', { d: `M${x - 20},${y - 12} l14,-6 l18,10 l-4,16 l-22,4 z`, fill: WARN, opacity: 0.85 });
        else el('rect', { x: x - 16, y: y - 14, width: 32, height: 28, rx: 6, fill: ACC }); }
      mono(130, 290, 'CUST_NM_01', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.5) }); mono(660, 290, 'Customer', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      card(870, 120, 150, 70, { rx: 10, stroke: INFO, s: pop(u, 1.8) }); tx(870, 116, 'OHS', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.9) });
      tx(870, 140, '잘 정의된 공개 API', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) });
      grow(762, 150, 800, 140, E(u, 1.9, 2.2), INFO);
      gauges(c); return; }
    if (k === 2) { // Published Language vs Shared Kernel
      ctx(100, 120, 'order', { s: pop(u, 0.2) }); ctx(380, 120, 'payment', { s: pop(u, 0.2) });
      card(240, 120, 120, 64, { rx: 6, stroke: INFO, s: pop(u, 0.6) }); mono(240, 116, 'OrderPlaced', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.7) });
      mono(240, 136, '.avsc', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.7) });
      tx(240, 200, 'Published Language', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.9) }); sub(240, 224, '스키마만 계약으로', fade(u, 1.0));
      const g = fade(u, 1.3, 0.5); el('circle', { cx: 640, cy: 150, r: 95, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: g * 0.9 }); el('circle', { cx: 790, cy: 150, r: 95, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: g * 0.8 });
      mono(600, 156, 'A', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: g }); mono(830, 156, 'B', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: g });
      mono(715, 140, 'Money', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.7) }); mono(715, 166, 'Address', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.8) });
      tx(715, 272, 'Shared Kernel · 바꾸면 양쪽이 흔들린다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.0) });
      gauges(c); return; }
    if (k === 3) { ctx(260, 150, 'HR', { s: pop(u, 0.2), w: 120 }); ctx(700, 150, 'search', { s: pop(u, 0.3), w: 140 });
      const f = E(u, 0.5, 1.3); el('line', { x1: 322, y1: 150, x2: lerp(322, 628, f), y2: 150, stroke: OFF, 'stroke-width': 2.5, 'stroke-dasharray': '6 6' });
      if (f >= 1) cross(480, 150, 13, pop(u, 1.3));
      tx(480, 230, 'Separate Ways · 잇지 않는 것도 설계다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.7) });
      gauges(c); return; }
    // k4 · k5: 쇼핑몰 지도
    const P = { user: [110, 90], order: [420, 90], payment: [720, 90], acl: [720, 220], pg: [880, 300], catalog: [180, 260], search: [440, 260] };
    const s = (a) => (k === 4 ? pop(u, a) : 1), f = (a) => (k === 4 ? E(u, a, a + 0.4) : 1);
    ctx(...P.user, 'user', { s: s(0.1) }); ctx(...P.order, 'order', { s: s(0.2) }); ctx(...P.payment, 'payment', { s: s(0.3) }); ctx(...P.catalog, 'catalog', { s: s(0.4) });
    rel(176, 90, 354, 90, f(0.5), 'Customer / Supplier', GOOD);
    rel(486, 90, 654, 90, f(0.9), 'Published Language', INFO);
    card(...P.acl, 110, 44, { rx: 6, text: 'PG ACL', fs: 14.5, mono: true, fill: INK, color: PANEL, stroke: 'none', s: s(1.2) });
    grow(720, 116, 720, 196, f(1.3), MUT); grow(775, 236, 840, 286, f(1.6), MUT); tx(P.pg[0], P.pg[1] + 30, '외부 PG', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 1.8) : 1 });
    el('path', { d: `M110,116 V260 H112`, fill: 'none', stroke: GRID, 'stroke-width': 2, opacity: k === 4 ? fade(u, 2.0) : 1 });
    if (k === 5) { ctx(...P.search, 'search', { s: pop(u, 0.2), col: WARN });
      rel(374, 260, 246, 260, E(u, 0.5, 1.0), 'Conformist', WARN, { up: -26 });
      sub(440, 316, '변환 계층 없이 catalog 모델을 그대로 쓴다', fade(u, 1.6), { 'font-size': 14.5 }); }
    gauges(c); }

  // ---------- 5. 잘못된 경계 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const names = ['web-service', 'service-layer', 'repo-service', 'db-service'];
      names.forEach((s, i) => { const x = 120 + i * 240; card(x, 120, 180, 50, { rx: 8, text: s, fs: 13.5, mono: true, stroke: BAD, s: pop(u, 0.1 + i * 0.15) });
        if (i) { grow(x - 150, 120, x - 92, 120, E(u, 0.6 + i * 0.1, 0.9 + i * 0.1), BAD); } });
      const p = E(u, 0.9, 2.2); dot([[0, 170], [120, 170], [360, 170], [600, 170], [840, 170]], p > 0 && p < 1 ? p : 0, BAD, 8);
      mono(480, 230, `네트워크 hop ${Math.min(4, Math.ceil(p * 4))} / 4`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.9) });
      names.forEach((_, i) => { const x = 120 + i * 240; el('path', { d: `M${x - 10},${80} l14,-14 l6,6 l-14,14 z`, fill: WARN, opacity: pop(u, 2.0 + i * 0.1) }); });
      tx(480, 286, '기능 하나 추가 = 4개 서비스 모두 수정', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.2) });
      gauges(c); return; }
    if (k === 1) { const ES = ['user', 'product', 'order', 'order-line', 'address', 'coupon', 'cart', 'cart-item'];
      ES.forEach((s, i) => { const a = i / 8 * Math.PI * 2 - Math.PI / 2, x = 480 + Math.cos(a) * 330, y = 170 + Math.sin(a) * 120;
        card(x, y, 124, 38, { rx: 6, text: s, fs: 13.5, mono: true, stroke: BAD, s: pop(u, 0.1 + i * 0.08) });
        const g = E(u, 0.9 + i * 0.1, 1.3 + i * 0.1); el('line', { x1: 480, y1: 170, x2: lerp(480, x, g * 0.8), y2: lerp(170, y, g * 0.8), stroke: BAD, 'stroke-width': 1.8, opacity: 0.7 }); });
      card(480, 170, 120, 44, { rx: 8, text: '주문 1건', fs: 15, stroke: INK });
      mono(60, 50, `호출 ${Math.round(E(u, 0.9, 2.1) * 8)}번`, { 'font-size': 18, 'font-weight': 800, fill: BAD });
      gauges(c); return; }
    if (k === 2) { const n = Math.round(E(u, 0.1, 1.6) * 100);
      for (let i = 0; i < n; i++) el('rect', { x: 120 + (i % 20) * 24, y: 50 + Math.floor(i / 20) * 24, width: 20, height: 20, rx: 3, fill: BADBG, stroke: BAD, 'stroke-width': 1.2 });
      mono(360, 196, 'create-user, update-user, get-user …', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) });
      mono(780, 80, `서비스 ${n}개`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      mono(780, 130, `모니터링 ${n}`, { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); mono(780, 160, `배포 파이프라인 ${n}`, { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
      tx(480, 260, '비즈니스 가치는 그대로', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.2) });
      gauges(c); return; }
    const CAP = ['catalog', 'cart-and-order', 'payment', 'fulfillment', 'identity', 'recommendation'];
    const cx = (i) => 170 + (i % 3) * 310, cy = (i) => 80 + Math.floor(i / 3) * 110;
    if (k === 3) { const f = E(u, 0.2, 1.3);
      for (let i = 0; i < 15; i++) { const tgt = Math.min(5, Math.floor(i / 2.5)), x0 = 100 + (i % 5) * 180, y0 = 50 + Math.floor(i / 5) * 60;
        if (f < 1) el('rect', { x: lerp(x0, cx(tgt) - 20, f), y: lerp(y0, cy(tgt) - 12, f), width: 40, height: 24, rx: 4, fill: BADBG, stroke: BAD, 'stroke-width': 1.2, opacity: 1 - f * 0.8 }); }
      CAP.forEach((s, i) => card(cx(i), cy(i), 240, 64, { rx: 10, text: s, fs: 15, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 1.2 + i * 0.12) }));
      note(480, 290, '장바구니부터 주문까지 한 서비스', fade(u, 2.1), { 'text-anchor': 'middle', fill: GOOD }); gauges(c); return; }
    if (k === 4) { CAP.forEach((s, i) => card(cx(i), cy(i), 240, 64, { rx: 10, text: s, fs: 15, mono: true, stroke: i === 1 || i === 2 ? GOOD : GRID, fill: i === 1 || i === 2 ? GOODBG : PANEL, color: i === 1 || i === 2 ? INK : MUT }));
      person(40, 80, null, { s: 0.8 }); dot([[64, 80], [cx(1) - 120, 80]], seg(u, 0.2, 0.9), GOOD, 8); grow(cx(1) + 120, 80, cx(2) - 120, 80, E(u, 0.9, 1.3), GOOD);
      [3, 4, 5].forEach((j, n) => { el('line', { x1: cx(1), y1: 112, x2: lerp(cx(1), cx(j), E(u, 1.3 + n * 0.15, 1.7 + n * 0.15)), y2: lerp(112, cy(j) - 32, E(u, 1.3 + n * 0.15, 1.7 + n * 0.15)), stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); });
      mono(480, 300, '요청당 서비스 8개 → 1~2개', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.9) });
      tx(880, 300, '나머지는 이벤트', { 'font-size': 14, 'text-anchor': 'end', fill: INFO, 'font-weight': 700, opacity: fade(u, 1.8) });
      gauges(c); return; }
    // k5: 한 줄 테스트
    card(260, 160, 360, 120, { rx: 12, stroke: GOOD, fill: GOODBG, s: pop(u, 0.2) }); check(120, 160, 13, pop(u, 0.5));
    tx(150, 150, '"결제를 처리한다"', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.4) }); tx(150, 180, 'payment', { 'font-size': 14.5, class: 'mono', fill: MUT, opacity: fade(u, 0.5) });
    card(700, 160, 360, 120, { rx: 12, stroke: BAD, fill: BADBG, s: pop(u, 1.0) }); cross(560, 160, 12, pop(u, 1.3));
    tx(590, 150, '"User 테이블의', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.2) }); tx(590, 178, ' update 만 한다"', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.3) });
    tx(480, 286, '서비스 하나를 비즈니스 가치 한 줄로 말할 수 있나?', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
    gauges(c); }

  const quiz = [
    { q: '주문 Context의 Product에 들어 있어야 할 필드는 무엇인가?',
      o: ['title, description, seo', 'price, stockQty, isOrderable', 'size, origin, hazard'], a: 1,
      why: '각 Context의 모델은 그 Context의 관심사만 담는다. 주문에는 가격·재고·주문 가능 여부가 필요하다.' },
    { q: 'OrderPlaced를 발행하는 PlaceOrderService가 주입받는 것은 무엇인가?',
      o: ['PaymentService와 ShippingService', 'OrderRepository와 EventPublisher', '모든 구독자의 목록'], a: 1,
      why: '발행자는 저장소와 publisher만 안다. 구독자가 늘어도 발행 코드는 바뀌지 않는다.' },
    { q: 'Order 밖의 코드가 OrderLine을 추가하려면 어떻게 해야 하나?',
      o: ['root인 Order의 addLine()을 부른다', 'OrderLineRepository에 바로 저장한다', 'lines 목록에 직접 add한다'], a: 0,
      why: '입구가 root 하나여야 DRAFT 검사와 합계 갱신을 한 곳에서 지킬 수 있다.' },
    { q: '외부 레거시 ERP와 붙을 때 우리 모델을 지키는 관계는 무엇인가?',
      o: ['Conformist', 'Shared Kernel', 'Anti-Corruption Layer'], a: 2,
      why: 'ACL은 외부 모델을 우리 모델로 바꿔 주는 변환 계층이다. 생략하면 그쪽 모델이 도메인까지 밀고 들어온다.' },
    { q: '테이블마다 서비스를 만들면 주문 한 번에 서비스를 몇 개 호출하게 되나?',
      o: ['1~2개', '4개', '8개'], a: 2,
      why: 'cart-item-service까지 만든 엔티티 분할에서는 주문 한 번이 8개 서비스를 부른다. 능력 단위로 자르면 1~2개다.' },
  ];

  const summary = [
    '같은 상품도 카탈로그, 주문, 배송에서 다른 모델이 되고 ID로만 이어진다.',
    'Context 사이는 OrderPlaced 같은 과거형 이벤트로 잇고 발행자는 구독자를 모른다.',
    'Aggregate는 root 하나로만 바꾸고, 다른 Aggregate는 ID로 참조한다.',
    '테이블이나 함수 단위로 자르면 주문 한 번에 서비스 8개를 부른다.',
  ];
  const review = [
    { q: '상품 정보를 한 ProductMaster 클래스로 합쳤더니 필드가 14개가 되고 세 팀이 매번 같이 고친다. 처방은?',
      o: ['Context마다 필요한 필드만 가진 모델로 나누고 ID로 잇는다', '필드를 더 추가해 모든 요구를 한 번에 담는다', 'ProductMaster를 Shared Kernel로 지정한다'], a: 0,
      why: '한 팀이 쓰는 필드는 5~7개뿐이다. Context별 모델로 나누면 한 팀의 변경이 다른 팀을 흔들지 않는다.' },
    { q: '주문 확정 때 쿠폰 사용 처리까지 Order Aggregate 안에서 한 트랜잭션으로 묶으려 한다. 더 나은 방법은?',
      o: ['Order에 Coupon 객체를 필드로 넣는다', 'OrderLineRepository를 따로 만든다', 'OrderPlaced 이벤트를 받아 쿠폰 쪽이 따로 처리한다'], a: 2,
      why: '한 트랜잭션은 한 Aggregate다. 여러 Aggregate가 함께 바뀌어야 하면 이벤트로 나눠 결과적 일관성으로 맞춘다.' },
    { q: '서비스를 나눴는데 기능 하나를 추가할 때마다 web, service, repo 서비스를 모두 고친다. 무엇이 잘못됐나?',
      o: ['이벤트 스키마 버전 관리', '경계를 기술 계층으로 그었다', '서비스 수가 너무 적다'], a: 1,
      why: '계층은 한 서비스 안의 구조다. 계층을 네트워크로 나누면 한 요청이 4 hop이 되고 변경도 4곳에 퍼진다.' },
  ];

  R.page({ title: 'Bounded Context 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
