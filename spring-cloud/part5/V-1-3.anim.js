/* V-1-3 Spring Cloud Stream — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 재료: REST 전선으로 묶인 서비스, Supplier/Function/Consumer 빈의 in-0·out-0 포트, 토픽(칸이 쌓이는 통),
 *           consumer group·파티션·DLT, 바인더 꽂이(Kafka ⇄ RabbitMQ). 숫자는 페이지 코드(partition-count 3, max-attempts 3, 1000ms)에서만. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  function head(s) { tx(40, 40, s, { 'font-size': 17, 'font-weight': 800 }); }
  // 토픽 통: 가로 통 + 쌓인 메시지 칸 n 개
  function topic(x, y, w, name, n, o) { o = o || {}; const col = o.col || INFO, op = o.op ?? 1;
    el('rect', { x, y: y - 18, width: w, height: 36, rx: 18, fill: o.fill || INFOBG, stroke: col, 'stroke-width': 2.2, opacity: op });
    for (let i = 0; i < Math.min(n || 0, Math.floor((w - 24) / 22)); i++) el('rect', { x: x + w - 26 - i * 22, y: y - 9, width: 16, height: 18, rx: 3, fill: col, opacity: 0.75 * op });
    mono(x + w / 2, y - 26, name, { 'font-size': 14.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: op }); }
  // 함수 빈: 가운데 카드 + 왼쪽 in 포트 + 오른쪽 out 포트
  function bean(cx, cy, name, kind, o) { o = o || {}; const w = o.w || 190, s = o.s ?? 1, col = kind === 'Supplier' ? ACC : kind === 'Function' ? WARN : GOOD;
    card(cx, cy, w, 58, { rx: 12, stroke: col, sw: 2.5, fill: PANEL, s });
    mono(cx, cy - 3, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: s });
    tx(cx, cy + 17, kind, { 'font-size': 13.5, fill: col, 'text-anchor': 'middle', 'font-weight': 700, opacity: s });
    if (kind !== 'Supplier') el('circle', { cx: cx - w / 2, cy, r: 7 * s, fill: col });
    if (kind !== 'Consumer') el('circle', { cx: cx + w / 2, cy, r: 7 * s, fill: col }); }
  const env = (x, y, s, col, sc) => card(x, y, tw(s, 13.5) + 22, 26, { rx: 5, fill: col || ACC, stroke: 'none', text: s, fs: 13.5, fw: 700, color: PANEL, mono: true, s: sc });

  // ---------- 1. REST 직결의 결합 ----------
  const O = [190, 210], CS = [['payment', 720, 100], ['shipping', 720, 210], ['notify', 720, 320]];
  function wire(i, f, o) { o = o || {}; const [, x, y] = CS[i]; if (f <= 0) return;
    el('path', { d: `M${O[0] + 100},${O[1]} C${O[0] + 220},${O[1]} ${x - 260},${y} ${lerp(O[0] + 100, x - 80, f)},${y}`, fill: 'none', stroke: o.col || INK, 'stroke-width': 2.5, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); }
  function s1(t, c) { const { k, u } = c;
    head(k === 4 ? '이벤트로 바꿔도 브로커 API를 직접 쓰면 또 묶인다' : 'OrderService가 세 서비스를 직접 부른다');
    const nWire = k === 0 ? 3 : 3;
    if (k < 4) {
      card(O[0], O[1], 200, 92, { rx: 12, stroke: k === 2 ? BAD : INK, sw: 2.5, s: 1 + bump(u, k === 2 ? 0.4 : 9) });
      mono(O[0], O[1] - 18, 'OrderService', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
      ['paymentClient', 'shippingClient', 'notifyClient'].forEach((f, i) => mono(O[0] - 82, O[1] + 4 + i * 17, f, { 'font-size': 13.5, fill: i === 2 && k < 2 ? INK : INK, opacity: k === 0 ? fade(u, 0.2 + i * 0.3) : 1 }));
      CS.forEach(([n, x, y], i) => { const show = k === 0 ? E(u, 0.3 + i * 0.3, 0.9 + i * 0.3) : 1;
        wire(i, i === 2 && k === 2 ? E(u, 0.8, 1.5) : show, { col: i === 2 && k === 2 ? BAD : INK });
        card(x, y, 150, 52, { rx: 10, stroke: k === 1 && i === 0 && u > 1.9 ? BAD : INK, sw: 2.2, text: n, mono: true, s: k === 0 ? pop(u, 0.5 + i * 0.3) : 1 }); });
    }
    if (k === 0) { sub(480, 400, '소비자가 늘 때마다 필드가 하나씩 는다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1) {
      dot([[O[0] + 100, O[1]], [640, 100]], seg(u, 0.2, 0.6), ACC, 7); dot([[640, 100], [O[0] + 100, O[1]]], seg(u, 0.6, 0.9), ACC, 7);
      dot([[O[0] + 100, O[1]], [640, 210]], seg(u, 0.9, 1.2), ACC, 7); dot([[640, 210], [O[0] + 100, O[1]]], seg(u, 1.2, 1.9), WARN, 7);
      const x0 = 120, by = 370; tx(x0, by - 22, '주문 응답 시간', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['save', 0, 0.2, 60, INK], ['pay', 0.2, 0.9, 120, ACC], ['ship (느림)', 0.9, 1.9, 220, WARN]].reduce((x, [n, a, b, w, col]) => { const f = E(u, a, b);
        el('rect', { x, y: by - 13, width: w * f, height: 26, rx: 4, fill: col, opacity: 0.85 }); if (f > 0.6) tx(x + 8, by + 5, n, { 'font-size': 13.5, fill: PANEL, 'font-weight': 700 }); return x + w; }, x0);
      cross(800, 100, 12, pop(u, 2.0)); tx(800, 150, '결제가 죽으면 주문도 실패', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { pill(O[0], O[1] + 80, '수정 → 재배포', BAD, pop(u, 1.2), { fs: 14 });
      sub(480, 400, '새 소비자를 붙이는 유일한 방법이 발행자 코드 수정이다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 3) { [['시간 결합', 470, 128], ['부하 결합', 470, 208], ['코드 결합', O[0], O[1] + 80], ['프로토콜 노출', 470, 300]].forEach(([s, x, y], i) => pill(x, y, s, BAD, pop(u, 0.3 + i * 0.4), { fs: 14, fill: PANEL }));
      sub(480, 400, '네 가지가 한꺼번에 묶여 따로 배포할 수 없다', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k4: 브로커 + Binder
    card(160, 210, 200, 80, { rx: 12, stroke: INK, sw: 2.5 }); mono(160, 196, 'OrderService', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
    const cover = E(u, 1.3, 2.0);
    pill(160, 228, 'KafkaTemplate', BAD, 1, { fs: 13.5, mono: true, op: 1 - cover * 0.85 });
    el('rect', { x: 290, y: 150 - 60 * (1 - cover), width: 80, height: 120, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: cover });
    tx(330, 215 - 60 * (1 - cover), 'Binder', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: cover });
    grow(372, 210, 452, 210, E(u, 0.3, 0.7), MUT);
    card(530, 210, 140, 90, { rx: 12, stroke: INFO, sw: 2.5, fill: INFOBG, text: '브로커', color: INFO, s: pop(u, 0.2) });
    CS.forEach(([n, , y], i) => { grow(602, 210, 760, y, E(u, 0.6 + i * 0.15, 1.0 + i * 0.15), MUT); card(830, y, 130, 48, { rx: 10, stroke: INK, sw: 2, text: n, mono: true, s: pop(u, 0.7 + i * 0.15) }); });
    sub(480, 400, 'Binder가 브로커 세부를 감춘다 · Spring Cloud Stream', fade(u, 2.1), { 'font-size': 15 }); }

  // ---------- 2. Supplier ----------
  const PY = 210;
  function s2(t, c) { const { k, u } = c;
    head('Supplier 빈 하나가 이벤트를 내보낸다');
    const cf = k === 0 ? E(u, 0.2, 0.9) : 1;
    el('rect', { x: 200, y: 92, width: 520 * cf, height: 220, rx: 14, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '7 5' });
    mono(214, 116, '@Configuration OrderSupplier', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, k === 0 ? 0.6 : 0) });
    card(100, PY, 130, 56, { rx: 10, stroke: INK, sw: 2, text: 'Controller', fs: 14.5 });
    if (k === 0) { tx(460, PY + 6, '빈 등록 자리 · 브로커 클래스는 아직 없다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); return; }
    // Sinks 통 (버퍼 칸)
    const sk = k === 1 ? E(u, 0.2, 0.9) : 1;
    el('rect', { x: 250, y: PY - 22, width: 170 * sk, height: 44, rx: 22, fill: SOFT, stroke: INFO, 'stroke-width': 2.2 });
    for (let i = 0; i < 5; i++) el('rect', { x: 268 + i * 28, y: PY - 10, width: 20, height: 20, rx: 3, fill: 'none', stroke: INFO, 'stroke-width': 1.5, opacity: fade(u, k === 1 ? 0.8 + i * 0.1 : 0) });
    mono(335, PY + 44, 'Sinks.many().unicast()', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, k === 1 ? 0.7 : 0) });
    grow(165, PY, 246, PY, k === 1 ? E(u, 1.0, 1.3) : 1, MUT);
    if (k === 1) { tx(335, PY - 40, '백프레셔 버퍼', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      sub(460, 360, '명령형 코드가 리액티브 스트림으로 들어가는 입구', fade(u, 1.6), { 'font-size': 15 }); return; }
    bean(560, PY, 'orderEvents()', 'Supplier', { w: 190, s: k === 2 ? pop(u, 0.2) : 1 });
    grow(424, PY, 462, PY, 1, MUT);
    tx(500, 290, 'Supplier<Flux<OrderEvent>>', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', class: 'mono' });
    // 바인딩 이름: 빈 이름 + -out-0
    const nm = 'orderEvents', suf = '-out-0', nshow = k === 2 ? Math.round(suf.length * E(u, 1.0, 1.8)) : suf.length;
    R.spans(735, 250, [[nm, { fill: ACC, 'font-weight': 700 }], [suf.slice(0, nshow), { fill: WARN, 'font-weight': 800 }]], { 'font-size': 16, opacity: k === 2 ? fade(u, 0.8) : 1 });
    grow(655, PY, 800, PY, k === 2 ? E(u, 1.8, 2.3) : 1, ACC);
    el('circle', { cx: 800, cy: PY, r: 9, fill: PANEL, stroke: ACC, 'stroke-width': 3, opacity: k === 2 ? fade(u, 2.2) : 1 });
    if (k === 2) { sub(460, 370, '빈 이름이 곧 바인딩 이름이 된다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 3) { for (let i = 0; i < 3; i++) { const a = 0.3 + i * 0.45; dot([[165, PY], [420, PY], [655, PY], [800, PY]], seg(u, a, a + 1.0), ACC, 8); }
      env(100, PY - 56, 'emit(event)', INK, pop(u, 0.2));
      pill(460, 370, 'KafkaTemplate', BAD, pop(u, 1.4), { fs: 14, mono: true }); cross(560, 370, 10, pop(u, 1.7));
      tx(620, 375, '어디에도 없다', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k4: 어느 토픽인지는 아직
    card(880, PY, 120, 64, { rx: 10, stroke: OFF, sw: 2, dash: '6 5', s: pop(u, 0.4) });
    mono(880, PY + 6, '?', { 'font-size': 22, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
    grow(810, PY, 818, PY, 1, MUT);
    tx(880, PY + 62, 'destination', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
    sub(560, 370, 'out-0이 닿을 토픽은 코드가 아니라 application.yml이 정한다', fade(u, 1.4), { 'font-size': 15 }); }

  // ---------- 3. Function · Consumer ----------
  const F = [380, 210], SH = [820, 140], RC = [820, 300];
  function s3(t, c) { const { k, u } = c;
    head('Function은 바꿔서 내보내고, Consumer는 받아서 끝낸다');
    if (k === 5) {
      [['Supplier', '() → 메시지', '생산', ACC, false, true], ['Function', '메시지 → 메시지', '변환', WARN, true, true], ['Consumer', '메시지 → void', '소비', GOOD, true, false]].forEach(([n, sig, role, col, inP, outP], i) => {
        const x = 170 + i * 310, y = 190, s = pop(u, 0.3 + i * 0.5);
        card(x, y, 200, 80, { rx: 12, stroke: col, sw: 2.5, s }); tx(x, y - 6, n, { 'font-size': 17, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s });
        tx(x, y + 20, role, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: s });
        if (inP) el('circle', { cx: x - 100, cy: y, r: 8 * s, fill: col }); if (outP) el('circle', { cx: x + 100, cy: y, r: 8 * s, fill: col });
        mono(x, y + 80, sig, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.5) });
        if (i < 2) grow(x + 112, y, x + 198, y, E(u, 0.8 + i * 0.5, 1.1 + i * 0.5), MUT); });
      sub(480, 380, '세 타입만 알면 파이프라인이 조립된다', fade(u, 2.1), { 'font-size': 15 }); return; }
    topic(40, F[1], 200, '[orders]', 3);
    bean(F[0], F[1], 'chargePayment', 'Function', { s: k === 0 ? pop(u, 0.2) : 1 });
    const pIn = k >= 1 ? (k === 1 ? Math.round(E(u, 1.6, 2.0)) : 1) : 0;
    topic(520, F[1], 160, '[payments]', pIn + (k >= 3 ? 1 : 0));
    grow(240, F[1], F[0] - 100, F[1], 1, MUT); grow(F[0] + 100, F[1], 516, F[1], 1, MUT);
    mono(F[0] - 95, F[1] + 52, 'in-0', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.8) : 1 });
    mono(F[0] + 95, F[1] + 52, 'out-0', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 1.1) : 1 });
    if (k === 0) { sub(480, 370, 'Function 하나가 입력·출력 바인딩 두 개를 만든다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 1) { const a = seg(u, 0.2, 0.9), b = seg(u, 1.0, 1.6);
      if (a > 0 && a < 1) env(lerp(200, F[0] - 60, a), F[1] - 62, 'Order 42', INFO);
      if (u >= 0.9 && u < 1.0) env(F[0], F[1] - 52, 'Order 42', INFO);
      if (b > 0 && b < 1) env(lerp(F[0] + 60, 600, b), F[1] - 62, 'PAID 42', WARN);
      mono(F[0], F[1] + 90, 'return new PaymentEvent(...)', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      sub(480, 380, 'return 값이 그대로 payments로 나간다 · send 호출이 없다', fade(u, 1.9), { 'font-size': 15 }); return; }
    // 배송 Consumer
    grow(684, F[1], SH[0] - 100, SH[1], k === 2 ? E(u, 0.6, 1.0) : 1, MUT);
    bean(SH[0], SH[1], 'prepareShipping', 'Consumer', { s: k === 2 ? pop(u, 0.3) : 1 });
    if (k === 2) { cross(SH[0] + 112, SH[1], 9, pop(u, 1.2)); tx(SH[0] + 20, SH[1] + 58, 'out 바인딩 없음', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.3) });
      sub(480, 380, '받아서 외부에 반영하고 끝나는 종단 노드', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 3) { [['PAID', GOOD, '배송 예약', 0.3], ['FAILED', BAD, '건너뜀', 1.3]].forEach(([s, col, r, a], i) => {
        const f = seg(u, a, a + 0.6); if (f > 0 && f < 1) env(lerp(684, SH[0] - 110, f), lerp(F[1], SH[1], f) - 22, s, col);
        if (u > a + 0.6) { pill(SH[0], SH[1] + 72 + i * 36, s + ' → ' + r, col, pop(u, a + 0.6), { fs: 13.5 }); } });
      sub(480, 380, '주문 서비스는 이런 로직이 있는지도 모른다', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k4: 알림 Consumer 추가
    grow(684, F[1], RC[0] - 100, RC[1], E(u, 0.6, 1.0), GOOD);
    bean(RC[0], RC[1], 'sendReceipt', 'Consumer', { s: pop(u, 0.3) });
    card(150, 340, 220, 56, { rx: 10, stroke: INK, sw: 2, text: 'OrderService', mono: true });
    lock(280, 340, true, GOOD, pop(u, 1.2)); tx(150, 392, '발행자 코드 0줄 수정', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); }

  // ---------- 4. bindings 배선 ----------
  const BL = [['orderEvents-out-0', 100, ACC], ['chargePayment-in-0', 160, WARN], ['chargePayment-out-0', 220, WARN], ['prepareShipping-in-0', 290, GOOD], ['sendReceipt-in-0', 350, GOOD]];
  const T4 = { orders: [640, 130], payments: [640, 270], dlt: [640, 385] };
  function bindRow(i, op) { const [n, y, col] = BL[i]; el('circle', { cx: 300, cy: y, r: 6, fill: col, opacity: op }); mono(290, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: op }); }
  function link(i, tp, f, o) { o = o || {}; const [, y] = BL[i], [tx0, ty] = T4[tp]; if (f <= 0) return;
    const x2 = tx0 - 10, yy = ty + (o.dy || 0);
    el('path', { d: `M306,${y} C420,${y} 470,${yy} ${lerp(306, x2, f)},${lerp(y, yy, f)}`, fill: 'none', stroke: o.col || MUT, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }); }
  function s4(t, c) { const { k, u } = c;
    // 위: definition 줄
    const def = 'definition: orderEvents;chargePayment;prepareShipping;sendReceipt', n = k === 0 ? Math.round(def.length * E(u, 0.1, 1.4)) : def.length;
    mono(40, 44, def.slice(0, n), { 'font-size': 15, 'font-weight': 700 });
    const lit = k === 0 ? [11, 23, 37, 53].filter((p) => n >= p + 8).length : 4, beanOf = [0, 1, 1, 2, 3];
    BL.forEach((_, i) => bindRow(i, beanOf[i] < lit ? 1 : 0.15));
    topic(660, T4.orders[1], 260, 'orders', k >= 1 ? 3 : 0, { op: k === 0 ? fade(u, 1.6) : 1 });
    // payments: 파티션 3개
    const pOp = k >= 3 ? 1 : 0.35;
    [0, 1, 2].forEach((p) => { const y = T4.payments[1] - 34 + p * 34; el('rect', { x: 660, y: y - 13, width: 260, height: 26, rx: 13, fill: INFOBG, stroke: INFO, 'stroke-width': 1.8, opacity: k >= 3 ? 1 : p === 1 ? pOp : 0 });
      if (k >= 3) mono(672, y + 5, 'P' + p, { 'font-size': 13.5, fill: INFO, 'font-weight': 700 }); });
    mono(790, T4.payments[1] - 58, 'payments', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: pOp });
    if (k === 0) { sub(480, 405, 'definition에 적힌 빈만 바인딩된다', fade(u, 1.8), { 'font-size': 15 }); return; }
    link(0, 'orders', k === 1 ? E(u, 0.3, 0.9) : 1, { col: ACC });
    if (k === 1) { for (let i = 0; i < 3; i++) dot([[306, 100], [640, 130], [900, 130]], seg(u, 1.0 + i * 0.35, 1.9 + i * 0.35), ACC, 6);
      sub(480, 405, '논리 채널 out-0이 처음으로 실제 토픽 orders에 닿는다', fade(u, 1.4), { 'font-size': 15 }); return; }
    link(1, 'orders', k === 2 ? E(u, 0.3, 0.9) : 1, { col: WARN, dy: 8 });
    if (k === 2) { pill(470, 190, 'group: payment-svc', WARN, pop(u, 0.9), { fs: 13.5, mono: true });
      [0, 1].forEach((j) => { card(40 + j * 50, 160, 44, 30, { rx: 6, stroke: WARN, sw: 2, text: '#' + (j + 1), fs: 13.5, mono: true, s: pop(u, 1.0 + j * 0.1) }); });
      for (let i = 0; i < 4; i++) { const tgt = 40 + (i % 2) * 50; dot([[640, 138], [306, 160], [tgt + 24, 160]], seg(u, 1.2 + i * 0.3, 1.9 + i * 0.3), WARN, 6); }
      sub(480, 405, '같은 그룹 인스턴스끼리는 메시지를 나눠 갖는다', fade(u, 1.8), { 'font-size': 15 }); return; }
    link(2, 'payments', k === 3 ? E(u, 0.2, 0.7) : 1, { col: WARN });
    if (k === 3) { [['42', 0, 0.8], ['77', 2, 1.1], ['42', 0, 1.4], ['13', 1, 1.7]].forEach(([id, p, a]) => { const y = T4.payments[1] - 34 + p * 34, f = seg(u, a, a + 0.6);
        if (f > 0 && f < 1) env(lerp(560, 760, f), lerp(220, y, f), id, INFO); });
      [0, 1, 2].forEach((p) => { const ids = [['42', '42'], ['13'], ['77']][p]; ids.forEach((id, j) => { const show = u > [[1.4, 2.0], [2.3], [1.7]][p][j];
        if (show) env(890 - j * 46, T4.payments[1] - 34 + p * 34, id, INFO); }); });
      tx(480, 405, 'partition-key: payload.orderId · partition-count: 3 · 같은 주문은 같은 파티션 (값은 예시)', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); return; }
    link(3, 'payments', k === 4 ? E(u, 0.2, 0.7) : 1, { col: GOOD, dy: 10 });
    if (k === 4) { pill(470, 330, 'group: shipping-svc', GOOD, pop(u, 0.6), { fs: 13.5, mono: true });
      // 재시도: 첫 시도 0s, 1s 뒤, 다시 2s 뒤 (총 3번)
      const X = (s) => 60 + s * 50; el('line', { x1: X(0), y1: 395, x2: X(3.4), y2: 395, stroke: GRID, 'stroke-width': 2 });
      [[0, '1번째'], [1, '2번째'], [3, '3번째']].forEach(([s, n], i) => { const a = 0.9 + i * 0.4; cross(X(s), 395, 7, pop(u, a)); mono(X(s), 378, s + 's', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, a) }); });
      tx(X(3.4) + 12, 400, 'max-attempts 3 = 첫 시도 포함 3번 · 대기 1초 → 2초', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); return; }
    link(4, 'payments', k === 5 ? E(u, 0.2, 0.7) : 1, { col: GOOD, dy: 22 });
    if (k === 5) { pill(470, 395, 'group: notify-svc', GOOD, pop(u, 0.6), { fs: 13.5, mono: true });
      const f = seg(u, 1.0, 1.8); dot([[640, 280], [306, 290]], f, GOOD, 7); dot([[640, 292], [306, 350]], f, GOOD, 7);
      tx(300, 400, '그룹이 다르면 사본을 따로 받는다 (팬아웃)', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.8) }); return; }
    // k6: DLT
    topic(660, T4.dlt[1], 260, 'payments.shipping-svc.DLT', Math.round(E(u, 1.0, 1.6)), { col: BAD, fill: BADBG });
    const f = seg(u, 0.4, 1.2); if (f > 0 && f < 1) env(lerp(306, 880, f), lerp(290, T4.dlt[1], f), '실패', BAD);
    for (let i = 0; i < 2; i++) dot([[640, 270], [306, 290]], seg(u, 1.4 + i * 0.4, 2.0 + i * 0.4), GOOD, 6);
    tx(306, 395, '재시도까지 실패한 메시지만 빠지고 흐름은 계속된다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); }

  // ---------- 5. 바인더 교체 ----------
  function codeBlock(u, k) { card(480, 96, 460, 70, { rx: 12, stroke: INK, sw: 2.5, s: 1 + (k === 2 ? bump(u, 1.4) : 0) });
    mono(480, 92, 'OrderSupplier · PaymentFunctions', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle' });
    tx(480, 114, 'Supplier / Function / Consumer 빈', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    lock(735, 96, true, GOOD); tx(760, 101, '코드 변경 0줄', { 'font-size': 14, 'font-weight': 700, fill: GOOD }); }
  function cart(cx, cy, name, col, s) { card(cx, cy, 200, 56, { rx: 8, stroke: col, sw: 2.5, fill: PANEL, s }); mono(cx, cy + 5, name, { 'font-size': 15, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: s }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 6) { head('완성된 이벤트 파이프라인');
      const N = [['orderEvents', 90, 200, ACC], ['[orders]', 270, 200, INFO], ['chargePayment', 450, 200, WARN], ['[payments]', 630, 200, INFO], ['prepareShipping', 830, 130, GOOD], ['sendReceipt', 830, 270, GOOD]];
      N.forEach(([n, x, y, col], i) => card(x, y, n.startsWith('[') ? 130 : 160, 50, { rx: n.startsWith('[') ? 25 : 10, stroke: col, sw: 2.2, fill: n.startsWith('[') ? INFOBG : PANEL, text: n, mono: true, fs: 13.5, color: col, s: pop(u, 0.1 + i * 0.2) }));
      [[170, 205], [335, 370], [530, 565]].forEach(([a, b], i) => grow(a, 200, b, 200, E(u, 0.4 + i * 0.2, 0.7 + i * 0.2), MUT));
      grow(695, 190, 748, 140, E(u, 1.2, 1.5), MUT); grow(695, 210, 748, 262, E(u, 1.3, 1.6), MUT);
      for (let i = 0; i < 3; i++) dot([[90, 200], [630, 200], [830, i % 2 ? 270 : 130]], seg(u, 1.0 + i * 0.4, 2.2 + i * 0.4), ACC, 6);
      card(830, 370, 210, 44, { rx: 22, stroke: BAD, sw: 2, fill: BADBG, text: '….DLT', mono: true, color: BAD, s: pop(u, 1.6) });
      el('line', { x1: 830, y1: 160, x2: 940, y2: 160, stroke: 'none' });
      el('path', { d: 'M910,140 C950,200 950,320 900,360', fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.7) });
      tx(480, 320, '서비스끼리 서로를 모른 채 이벤트로 이어진다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    head(k <= 1 ? '운영: Kafka 바인더' : k <= 3 ? '개발: RabbitMQ로 바꿔 끼운다' : '바인더 둘을 한 앱에');
    codeBlock(u, k);
    el('rect', { x: 230, y: 180, width: 500, height: 80, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(244, 200, '바인더 자리 (빌드 의존성)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    grow(480, 132, 480, 176, 1, MUT, { plain: true });
    if (k <= 1) { const s = k === 0 ? E(u, 0.2, 0.9) : 1; cart(480, lerp(330, 228, s), 'binder-kafka', ACC, 1);
      if (k === 0) { sub(480, 380, '브로커 선택은 의존성 한 줄이다', fade(u, 1.4), { 'font-size': 15 }); return; }
      ['kafka-1:9092', 'kafka-2:9092'].forEach((n, i) => { grow(430 + i * 100, 258, 330 + i * 300, 320, E(u, 0.3 + i * 0.2, 0.7 + i * 0.2), ACC); server(330 + i * 300, 340, null, { s: 0.45 * pop(u, 0.6 + i * 0.2) }); mono(330 + i * 300, 392, n, { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.8 + i * 0.2) }); });
      mono(480, 330, 'out-0 → orders', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); return; }
    if (k === 2) { const o = E(u, 0.2, 0.9), i = E(u, 1.0, 1.7);
      cart(lerp(480, 120, o), lerp(228, 330, o), 'binder-kafka', ACC, 1 - o * 0.6);
      cart(lerp(840, 480, i), lerp(330, 228, i), 'binder-rabbit', WARN, 1);
      sub(480, 390, 'starter만 갈아 끼우고 빈은 손대지 않는다', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 3) { cart(480, 228, 'binder-rabbit', WARN, 1);
      const m = E(u, 0.6, 1.4);
      el('rect', { x: 120, y: 285, width: 720, height: 120, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(140, 312, 'kafka:  binder:  brokers: kafka-1:9092,kafka-2:9092', { 'font-size': 14.5, fill: ACC, opacity: 1 - m, 'text-decoration': 'line-through' });
      mono(140, 312, 'rabbit: binder:  nodes: localhost:5672', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: m });
      el('rect', { x: 130, y: 334, width: 520, height: 28, rx: 5, fill: GOODBG, opacity: fade(u, 1.5) });
      mono(140, 353, 'bindings: orderEvents-out-0: { destination: orders }', { 'font-size': 14.5, 'font-weight': 700 });
      tx(820, 390, 'bindings는 그대로', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.8) }); return; }
    // k4, k5: 두 바인더
    cart(355, 228, 'prod-kafka', ACC, k === 4 ? pop(u, 0.2) : 1); cart(605, 228, 'legacy-rabbit', WARN, k === 4 ? pop(u, 0.5) : 1);
    if (k === 4) { mono(480, 320, 'binders: { prod-kafka: kafka, legacy-rabbit: rabbit }', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      sub(480, 370, '이름을 붙이면 한 앱이 두 브로커에 같이 붙는다 · 점진 이관용', fade(u, 1.6), { 'font-size': 15 }); return; }
    const B5 = [['orderEvents-out-0', ACC, 355], ['그 밖의 바인딩', MUT, 605]];
    B5.forEach(([n, col, tx0], i) => { const x = 250 + i * 460, y = 350;
      mono(x, y + 5, n, { 'font-size': 15, 'font-weight': 700, fill: col === MUT ? INK : col, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.5) });
      grow(x, y - 16, tx0, 262, E(u, 0.6 + i * 0.5, 1.1 + i * 0.5), col); });
    pill(250, 395, 'binder: prod-kafka', ACC, pop(u, 1.0), { fs: 13.5, mono: true }); pill(710, 395, 'default-binder', MUT, pop(u, 1.6), { fs: 13.5, mono: true }); }

  const quiz = [
    { q: 'REST 직결 구조에서 알림 기능을 붙이려면 무엇을 해야 했나?',
      o: ['알림 서비스만 새로 배포한다', 'OrderService에 클라이언트 필드와 호출을 더하고 다시 배포한다', '브로커에 큐를 하나 만든다'], a: 1,
      why: '누가 이벤트를 받는지가 발행자 코드에 박혀 있다. 소비자 하나를 더하려면 발행자를 고치고 재배포해야 한다.' },
    { q: 'orderEvents라는 Supplier 빈이 만드는 바인딩 이름은 무엇인가?',
      o: ['orderEvents-in-0', 'orders', 'orderEvents-out-0'], a: 2,
      why: 'Supplier는 출력만 있으니 빈 이름에 -out-0이 붙는다. 실제 토픽 이름은 코드가 아니라 설정이 정한다.' },
    { q: 'Function과 Consumer를 가르는 차이는 무엇인가?',
      o: ['Consumer는 out 바인딩이 없다', 'Function은 입력을 받지 않는다', 'Consumer는 group을 쓸 수 없다'], a: 0,
      why: 'Function<I,O> 은 in-0과 out-0을 함께 만들고 return 값을 내보낸다. Consumer<I> 는 받아서 끝나는 종단 노드다.' },
    { q: 'prepareShipping과 sendReceipt가 같은 payments를 읽는데 둘 다 모든 메시지를 받는 이유는 무엇인가?',
      o: ['partition-count가 3이라서', 'group이 서로 달라서', 'enable-dlq가 켜져 있어서'], a: 1,
      why: '같은 destination 이라도 group이 다르면 그룹마다 사본을 받는다. 같은 group이면 인스턴스끼리 나눠 갖는다.' },
    { q: '개발은 RabbitMQ, 운영은 Kafka로 돌릴 때 바꾸는 것은 무엇인가?',
      o: ['Supplier/Function/Consumer 빈 코드', 'binder starter 의존성과 브로커 접속 설정', 'bindings의 바인딩 이름'], a: 1,
      why: '바인더가 브로커 세부를 감추므로 빈 코드와 bindings는 그대로다. starter와 kafka/rabbit 블록만 갈아 끼운다.' },
  ];

  const summary = [
    '주문 서비스가 결제·배송·알림을 직접 부르면 하나만 느려져도 주문이 같이 느려진다.',
    'Supplier는 값을 내보내고, Function은 바꿔 내보내고, Consumer는 받아서 끝낸다.',
    '빈 이름에 -in-0, -out-0이 붙은 바인딩을 application.yml이 실제 토픽에 잇는다.',
    'group, 파티션, 재시도, DLQ도 설정이라 브로커를 바꿔도 빈 코드는 그대로다.',
  ];
  const review = [
    { q: '결제 서비스를 2대로 늘렸더니 같은 주문이 두 번 결제됐다. 먼저 의심할 것은?',
      o: ['chargePayment-in-0에 group을 주지 않았다', 'partition-count가 너무 작다', 'Supplier 빈 이름이 틀렸다'], a: 0,
      why: 'group이 없으면 익명 구독이라 인스턴스마다 사본을 받는다. 같은 group으로 묶어야 나눠 가진다.' },
    { q: '배송 처리 중 특정 메시지가 계속 실패해 뒤 메시지까지 밀린다. 설정으로 할 일은?',
      o: ['발행자에서 그 주문을 다시 보내게 한다', 'max-attempts를 크게 늘린다', '재시도 횟수를 정하고 enable-dlq로 실패 메시지를 격리한다'], a: 2,
      why: '재시도를 무한히 늘리면 흐름이 더 막힌다. 정해진 횟수 뒤 DLT로 빼면 나머지 메시지는 계속 흐른다.' },
    { q: '정산 서비스가 결제 결과를 받아야 한다. 주문·결제 서비스 코드를 건드리지 않는 방법은?',
      o: ['chargePayment의 return 값에 정산 호출을 넣는다', 'payments를 새 group으로 구독하는 Consumer 빈을 정산 서비스에 만든다', 'OrderService에 settleClient를 추가한다'], a: 1,
      why: '새 group으로 구독하면 기존 배송·알림과 별개로 사본을 받는다. 발행자는 소비자가 늘어난 것을 모른다.' },
  ];

  R.page({ title: '이벤트 파이프라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
