/* IV-1-4 Federation vs Shovel — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 서울(A)·버지니아(B) 두 리전의 브로커와 그 사이 WAN 을 그린다. 숫자는 페이지 코드의 출력 예·설정값에서만 가져온다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    server, person, cross, check, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // ---------- 두 리전 ----------
  const A = { x: 30, w: 360, cx: 210 }, B = { x: 570, w: 360, cx: 750 }, TOP = 30, H = 270;
  function regions(o) { o = o || {};
    zone(A.x, TOP, A.w, H, 'Region A · 서울', { fill: SOFT });
    zone(B.x, TOP, B.w, H, o.bTitle || 'Region B · 버지니아', { fill: SOFT });
    // WAN: 물결선
    const pts = []; for (let y = TOP; y <= TOP + H; y += 12) pts.push(`${480 + Math.sin(y / 12) * 7},${y}`);
    el('polyline', { points: pts.join(' '), fill: 'none', stroke: OFF, 'stroke-width': 2.5 });
    mono(480, TOP + H + 22, 'WAN', { 'font-size': 14, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle' }); }
  // 큐: 메시지 칸 n 개
  function queue(cx, cy, name, n, o) { o = o || {}; const w = o.w || 170, x0 = cx - w / 2;
    el('rect', { x: x0, y: cy - 17, width: w, height: 34, rx: 8, fill: PANEL, stroke: o.stroke || ACC, 'stroke-width': 2, opacity: o.op ?? 1 });
    for (let i = 0; i < Math.round(n); i++) el('rect', { x: x0 + w - 22 - i * 19, y: cy - 11, width: 14, height: 22, rx: 3, fill: o.col || ACC, opacity: o.op ?? 1 });
    if (name) mono(cx, cy + 36, name, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: o.ncol || INK, opacity: o.op ?? 1 }); }
  // exchange: 마름모
  function exch(cx, cy, name, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const g = R.G(cx, cy, s, o.op);
    el('path', { d: 'M0,-24 L28,0 L0,24 L-28,0 Z', fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2.5 }, g);
    if (name) mono(0, o.above ? -34 : 44, name, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: o.ncol || INK }, g); }
  // 톱니 (worker / 설정 위치)
  function gear(cx, cy, label, col, s) { if ((s ?? 1) <= 0) return; const g = R.G(cx, cy, s ?? 1);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; el('rect', { x: -4, y: -22, width: 8, height: 10, rx: 2, fill: col, transform: `rotate(${a * 180 / Math.PI})` }, g); }
    el('circle', { cx: 0, cy: 0, r: 15, fill: PANEL, stroke: col, 'stroke-width': 4 }, g); el('circle', { cx: 0, cy: 0, r: 5, fill: col }, g);
    if (label) tx(0, 42, label, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col }, g); }
  const flowDots = (route, t, n, col, spd) => { for (let m = 0; m < n; m++) dot(route, ((t * (spd || 0.6) + m / n) % 1), col || ACC, 6); };

  // ---------- 1. 두 개의 독립 브로커 ----------
  function s1(t, c) { const { k, u } = c;
    regions();
    if (k === 0) { server(A.cx, 150, 'mq-a', {}); server(B.cx, 150, 'mq-b', {});
      grow(A.cx + 60, 150, B.cx - 60, 150, E(u, 0.3, 1.2), BAD, { dash: '7 6' });
      mono(480, 128, 'join_cluster', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      cross(480, 150, 16, pop(u, 1.4));
      note(40, 350, '클러스터는 저지연 LAN 전제 · WAN에서는 파티션 한 번에 전체가 흔들린다', fade(u, 1.8), { fill: BAD });
      note(40, 386, '큐는 노드(클러스터) 로컬이라 경계를 넘지 못한다', fade(u, 2.3), { fill: MUT }); return; }
    // A 클러스터: 노드 3, orders.local 12,840
    const aNodes = [100, 210, 320]; aNodes.forEach((x, i) => server(x, 112, null, { s: 0.62, op: k === 1 ? fade(u, 0.2 + i * 0.2) : 1 }));
    mono(A.cx, 168, 'rabbit@mq-a-seoul', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' });
    const cnt = k === 1 ? Math.round(12840 * E(u, 0.6, 2.0)) : 12840;
    queue(A.cx, 222, null, k === 1 ? Math.round(6 * E(u, 0.6, 2.0)) : 6);
    mono(A.cx, 262, `orders.local  ${cnt.toLocaleString('en-US')}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    if (k === 1) { note(40, 350, 'cluster_status · list_queues로 본 서울 쪽', fade(u, 2.0)); return; }
    // B 클러스터: 노드 2, 큐 없음
    [700, 800].forEach((x, i) => server(x, 112, null, { s: 0.62, op: k === 2 ? fade(u, 0.2 + i * 0.2) : 1 }));
    mono(B.cx, 168, 'rabbit@mq-b-virginia', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 0.4) : 1 });
    el('rect', { x: B.cx - 85, y: 205, width: 170, height: 34, rx: 8, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    mono(B.cx, 262, '(비어 있음)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
    if (k === 2) { tx(B.cx, 229, '?', { 'font-size': 24, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      note(40, 350, '클러스터 이름이 다르면 서로의 큐는 존재조차 모른다', fade(u, 1.6), { fill: WARN }); return; }
    if (k === 3) { [['shovel', A.cx - 90, 0], ['federation', A.cx + 70, 1], ['federation', B.cx, 2]].forEach(([n, x, i]) => {
        pill(x, 340, `rabbitmq_${n}`, GOOD, pop(u, 0.3 + i * 0.4), { mono: true, fs: 13.5 }); check(x + tw(`rabbitmq_${n}`, 13.5) / 2 + 26, 340, 9, pop(u, 0.6 + i * 0.4)); });
      note(40, 392, '둘 다 기본 비활성 플러그인 · enable을 빠뜨리면 set_parameter가 실패한다', fade(u, 1.8), { fill: MUT }); return; }
    // k4: 갈림길 둘
    grow(A.cx + 90, 200, B.cx - 90, 200, E(u, 0.3, 1.1), ACC); mono(480, 190, 'Shovel · push →', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
    grow(B.cx - 90, 245, A.cx + 90, 245, E(u, 1.1, 1.9), INFO); mono(480, 236, '← Federation · pull', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
    note(40, 350, '강결합 클러스터링 대신 느슨하게 잇는 두 도구', fade(u, 2.0)); }

  // ---------- 2. Shovel ----------
  const QA = [A.cx, 200], XB = [B.cx, 190], WK = [A.cx + 120, 110];
  function s2(t, c) { const { k, u } = c;
    regions();
    queue(QA[0], QA[1], 'orders.local', 5);
    const destOn = k >= 2 && k !== 3;
    exch(XB[0], XB[1], 'orders.mirror', { s: k === 2 ? pop(u, 0.2) : destOn || k === 3 ? 1 : 0, op: k === 3 ? 0.35 : 1 });
    gear(WK[0], WK[1], 'Shovel worker', ACC, k === 0 ? pop(u, 0.2) : 1);
    const route = [[QA[0] + 85, QA[1]], [WK[0], WK[1] + 30], [XB[0] - 30, XB[1]]];
    if (k === 0) { grow(QA[0] + 85, QA[1] - 10, WK[0] - 20, WK[1] + 26, E(u, 0.6, 1.1), ACC); mono(QA[0] - 40, 150, 'consume', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      grow(WK[0] + 26, WK[1] + 10, XB[0] - 32, XB[1] - 6, E(u, 1.1, 1.8), ACC); mono(560, 135, 'publish', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3), 'text-anchor': 'middle' });
      note(40, 350, '설정도 실행도 source(A)가 주체 · A가 B로 민다', fade(u, 2.0)); return; }
    if (k === 1 || k === 2) { const L = k === 1 ? ['source.uris.1 = amqp://user:pass@mq-a:5672', 'source.queue  = orders.local'] : ['destination.exchange = orders.mirror', 'ack_mode = on-confirm'];
      mono(40, 334, 'rabbitmq.conf', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      L.forEach((s, i) => mono(40, 360 + i * 26, s, { 'font-size': 15, 'font-weight': 700, fill: i === 1 && k === 2 ? GOOD : INK, opacity: fade(u, 0.3 + i * 0.5) }));
      pill(820, 340, '재시작 필요', WARN, pop(u, 1.2), { fs: 14 });
      if (k === 1) { el('rect', { x: QA[0] - 92, y: QA[1] - 24, width: 184, height: 48, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.6) }); return; }
      // on-confirm 한 바퀴: 메시지 → B, confirm ← B, 그 뒤 A 에서 삭제
      dot(route, seg(u, 0.4, 1.4), ACC, 7); dot([[XB[0] - 30, XB[1] + 14], [QA[0] + 85, QA[1] + 14]], seg(u, 1.5, 2.2), GOOD, 6);
      if (u > 1.5) mono(480, 250, 'confirm', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
      if (u > 2.2) { el('rect', { x: QA[0] + 85 - 22, y: QA[1] - 11, width: 14, height: 22, rx: 3, fill: PANEL }); cross(QA[0] + 85 - 15, QA[1], 7, pop(u, 2.2)); }
      return; }
    if (k === 3 || k === 4) { const L = k === 3 ? ['rabbitmqctl set_parameter shovel orders_to_b', '"src-uri": "amqp://user:pass@mq-a:5672"', '"src-queue": "orders.local"']
        : ['"dest-exchange": "orders.mirror"', '"ack-mode": "on-confirm"', '"src-delete-after": "never"'];
      L.forEach((s, i) => mono(40, 340 + i * 26, s, { 'font-size': 15, 'font-weight': 700, fill: i === 0 && k === 3 ? ACC : INK, opacity: fade(u, 0.3 + i * 0.4) }));
      pill(820, 340, '재시작 없이 즉시', GOOD, pop(u, 1.4), { fs: 14 });
      if (k === 4) { flowDots(route, t, 4, ACC); mono(B.cx, 270, '상시 파이프', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
      return; }
    // k5: 상태 확인과 끄기
    const stop = u > 1.6; if (!stop) flowDots(route, t, 4, ACC);
    mono(40, 340, '$ rabbitmqctl shovel_status', { 'font-size': 14, fill: MUT });
    mono(40, 366, 'orders_to_b  dynamic  running', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) });
    mono(40, 398, '$ rabbitmqctl clear_parameter shovel orders_to_b', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
    if (stop) cross(480, 170, 14, pop(u, 1.6));
    pill(820, 366, '마이그레이션에 맞다', ACC, pop(u, 2.0), { fs: 14 }); }

  // ---------- 3. Federation ----------
  const XA = [A.cx - 90, 110], IQ = [A.cx + 60, 230], XFB = [B.cx - 80, 110], QB = [B.cx + 60, 230];
  function s3(t, c) { const { k, u } = c;
    regions({ bTitle: 'Region B · 버지니아 (downstream)' });
    exch(XA[0], XA[1], 'orders (upstream)', { above: true });
    gear(B.cx + 120, 85, '설정 위치', INFO, k === 0 ? pop(u, 0.2) : 1);
    if (k === 0) { grow(B.cx - 40, 110, A.cx + 70, 110, E(u, 0.6, 1.6), INFO); mono(480, 100, 'B가 A로 연결을 연다', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      note(40, 350, 'Shovel과 실행 위치가 정반대 · push → pull', fade(u, 1.8), { fill: WARN }); return; }
    if (k === 1) { const L = [['upstream region-a', INFO], ['uri  amqp://…@mq-a:5672', INK], ['prefetch-count  1000', INK], ['expires 3600000 · message-ttl 600000', INK], ['ack-mode  on-confirm', GOOD]];
      card(B.cx, 190, 330, 160, { rx: 10, stroke: INFO, sw: 2, fill: PANEL, s: pop(u, 0.2) });
      L.forEach(([s, col], i) => mono(B.cx - 150, 136 + i * 27, s, { 'font-size': 14, 'font-weight': i ? 600 : 800, fill: col, opacity: fade(u, 0.3 + i * 0.25) }));
      el('line', { x1: B.cx - 165, y1: 150, x2: XA[0] + 30, y2: 150, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 6' });
      note(40, 350, 'upstream은 어디서 당길지만 정한다 · 아직 링크 없음', fade(u, 1.8), { fill: MUT }); return; }
    // 정책이 걸린 뒤: B 의 federated exchange 와 바인딩된 큐, A 의 내부 upstream 큐
    exch(XFB[0], XFB[1], 'orders (federated)', { s: k === 2 ? pop(u, 0.2) : 1, fill: ACCBG, stroke: ACC, above: true });
    const linkU = k === 2 ? E(u, 0.6, 1.4) : 1;
    queue(IQ[0], IQ[1], '내부 upstream 큐', 2, { w: 110, op: linkU, col: INFO, stroke: INFO, ncol: MUT });
    grow(XA[0] + 20, XA[1] + 18, IQ[0] - 20, IQ[1] - 18, linkU, MUT);
    queue(QB[0], QB[1], 'B의 큐', 2, { w: 110 });
    grow(XFB[0] + 20, XFB[1] + 18, QB[0] - 30, QB[1] - 18, 1, MUT); mono(XFB[0] + 78, XFB[1] + 50, '바인딩', { 'font-size': 13.5, fill: MUT });
    el('line', { x1: XFB[0] - 30, y1: XFB[1], x2: lerp(XFB[0] - 30, IQ[0] + 56, linkU), y2: lerp(XFB[1], IQ[1], linkU), stroke: INFO, 'stroke-width': 3 });
    const route = [[IQ[0] + 56, IQ[1]], [XFB[0] - 30, XFB[1]], [QB[0] - 55, QB[1]]];
    if (k === 2) { if (u > 1.4) flowDots(route, t, 3, ACC);
      mono(40, 340, 'set_policy --apply-to exchanges federate-orders "^orders"', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.1) });
      note(40, 376, '정책이 걸리는 순간 링크가 생긴다 · 받을 바인딩이 있을 때만 흐른다', fade(u, 1.8), { fill: ACC }); return; }
    if (k === 3) { flowDots(route, t, 3, ACC);
      card(260, 345, 300, 52, { rx: 10, stroke: INFO, sw: 2, fill: INFOBG, s: pop(u, 0.3) }); tx(260, 351, 'Region C (다른 upstream)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      grow(XFB[0] - 10, XFB[1] + 30, 410, 336, E(u, 0.8, 1.6), INFO);
      mono(B.cx, 360, 'upstream-set all-regions', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      mono(B.cx, 386, '= region-a + region-c', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); return; }
    if (k === 4) { flowDots(route, t, 3, ACC);
      mono(40, 340, 'federation_status (B에서)', { 'font-size': 14, fill: MUT });
      mono(40, 368, '{exchange, upstream=region-a, status=running}', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.4) });
      note(40, 400, '링크가 조용히 죽어도 A의 발행은 계속된다 · status를 모니터링에 넣는다', fade(u, 1.6), { fill: WARN }); return; }
    // k5: exchange vs queue federation
    flowDots(route, t, 2, ACC, 0.5);
    [['--apply-to exchanges', '발행을 리전으로 팬아웃 복제', ACC], ['--apply-to queues', '한 논리 큐를 리전 소비자가 분담', INFO]].forEach(([a, b, col], i) => {
      mono(40, 340 + i * 36, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.7) }); tx(270, 340 + i * 36, b, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 0.4 + i * 0.7) }); }); }

  // ---------- 4. 차이 (definitions 두 섹션 + 비교표) ----------
  function s4(t, c) { const { k, u } = c, b = c.beat;
    // 왼쪽: definitions.json 의 두 칸
    const secs = [['policies', 40, 60], ['parameters', 40, 235]];
    secs.forEach(([n, x, y]) => { zone(x, y, 300, 150, null, { fill: SOFT }); mono(x + 14, y + 24, `"${n}"`, { 'font-size': 15, 'font-weight': 800, fill: MUT }); });
    const items = [ // [섹션, 이름, 색, 등장 beat]
      [0, 'federate-orders', ACC, 0], [0, 'archive-limits', MUT, 1], [1, 'federation-upstream region-a', ACC, 2], [1, 'shovel orders_to_b', WARN, 3]];
    const used = [0, 0];
    items.forEach(([sx, n, col, at]) => { if (k < at) return; const y = secs[sx][2] + 58 + used[sx]++ * 40, s = k === at ? pop(u, 0.3) : 1;
      pill(190, y, n, col, s, { mono: true, fs: 13.5 }); });
    if (k === 1) { pill(190, 194, 'shovel', WARN, 1, { mono: true, fs: 13.5, op: 0.5 }); cross(250, 194, 9, pop(u, 0.9)); }
    // 오른쪽: 비교표 (beat 의 compare 행)
    const rows = b.compare || [], x0 = 380, y0 = 74, cw = [140, 200, 200];
    ['관점', 'Federation', 'Shovel'].forEach((h, i) => tx(x0 + [0, cw[0], cw[0] + cw[1]][i], y0, h, { 'font-size': 15, 'font-weight': 800, fill: i === 1 ? INFO : i === 2 ? ACC : MUT }));
    el('line', { x1: x0, y1: y0 + 10, x2: x0 + 550, y2: y0 + 10, stroke: GRID, 'stroke-width': 2 });
    const prevN = c.prev && c.prev.compare ? c.prev.compare.length : 0;
    rows.forEach((r, i) => { const y = y0 + 40 + i * 42, isNew = i >= prevN || (c.prev && c.prev.compare[i] && c.prev.compare[i].s !== r.s), op = isNew ? fade(u, 0.4 + (i - Math.min(i, prevN)) * 0.25) : 1;
      tx(x0, y, r.k, { 'font-size': 14.5, 'font-weight': 700, opacity: op });
      tx(x0 + cw[0], y, r.f, { 'font-size': 14.5, fill: INFO, opacity: op }); tx(x0 + cw[0] + cw[1], y, r.s, { 'font-size': 14.5, fill: ACC, opacity: op }); });
    if (k === 4) banner(620, 404, 'Shovel = 밀어내는 파이프 · Federation = 당겨오는 구독', pop(u, 1.8)); }

  // ---------- 5. 시나리오별 선택 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { regions({ bTitle: ['Region B · 분석 리전', 'AWS (이전 대상)', '스탠바이 리전'][k] });
      if (k === 0) { exch(A.cx, 150, 'orders'); exch(B.cx - 60, 150, 'orders (federated)', { fill: ACCBG, stroke: ACC });
        const bound = u < 1.6; if (bound) { queue(B.cx + 60, 230, '분석 큐', 2, { w: 100 }); flowDots([[A.cx + 30, 150], [B.cx - 90, 150], [B.cx + 10, 230]], t, 3, ACC); }
        else { mono(B.cx + 60, 236, '바인딩 없음', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 }); mono(480, 130, '트래픽 0', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); }
        pill(480, 350, '① 상시 복제·분석 → Federation', INFO, pop(u, 0.2), { fs: 15 });
        note(40, 395, '받을 곳이 없으면 당기지 않는다 · WAN 비용에서 크다', fade(u, 1.8), { fill: MUT }); return; }
      if (k === 1) { const left = Math.max(0, 6 - Math.floor(E(u, 0.3, 2.0) * 7)); queue(A.cx, 180, '온프렘 큐', left);
        queue(B.cx, 180, '새 큐', 6 - left);
        if (left > 0) flowDots([[A.cx + 85, 180], [B.cx - 85, 180]], t, 2, ACC, 0.9);
        else { mono(480, 150, 'shovel 자동 종료', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); check(480, 182, 12, 1); }
        pill(480, 350, '② 마이그레이션 → Shovel', ACC, pop(u, 0.2), { fs: 15 });
        mono(40, 395, 'src-delete-after = queue-length', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); return; }
      // k2: DR
      queue(A.cx, 180, '프라이머리', 4); queue(B.cx, 180, '스탠바이', 4);
      flowDots([[A.cx + 85, 170], [B.cx - 85, 170]], t, 2, ACC, 0.6);
      for (let m = 0; m < 2; m++) dot([[B.cx - 85, 194], [A.cx + 85, 194]], ((t * 0.6 + m / 2 + 0.25) % 1), GOOD, 5);
      mono(480, 224, 'confirm', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
      pill(480, 350, '③ DR → Federation 또는 Shovel', WARN, pop(u, 0.2), { fs: 15 });
      mono(40, 395, 'ack-mode = on-confirm을 명시하고 확인한다', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) }); return; }
    if (k === 3) { card(480, 90, 330, 56, { rx: 28, stroke: INK, sw: 2.5, text: '끝이 있는 일인가?', fs: 18, s: pop(u, 0.2) });
      grow(400, 120, 250, 220, E(u, 0.7, 1.2), ACC); grow(560, 120, 710, 220, E(u, 0.7, 1.2), INFO);
      mono(300, 160, '예', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) }); mono(660, 160, '아니오', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.9) });
      [[250, 'Shovel', '일회성 · 명시적', ACC], [710, 'Federation', '상시 · 토폴로지 인식', INFO]].forEach(([x, a, b, col], i) => { const s = pop(u, 1.2 + i * 0.3);
        card(x, 262, 250, 76, { rx: 12, stroke: col, sw: 2.5, s }); tx(x, 256, a, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: col, opacity: fade(u, 1.3 + i * 0.3) });
        tx(x, 282, b, { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.3 + i * 0.3) }); });
      note(40, 380, '한 시스템에서 둘을 용도별로 같이 쓰는 경우가 많다', fade(u, 2.2), { fill: MUT }); return; }
    // k4: 함정 셋
    [['양쪽 플러그인 enable', 'shovel · federation 둘 다 기본 비활성', GOOD], ['무손실이면 on-confirm', '기본값이지만 명시하고 확인한다', WARN], ['설정 위치', 'Federation = downstream(B) · Shovel = source(A)', INFO]].forEach(([a, b, col], i) => {
      const y = 90 + i * 100, s = pop(u, 0.2 + i * 0.5); card(480, y, 760, 76, { rx: 12, stroke: col, sw: 2.5, s });
      tx(130, y - 4, `${i + 1}. ${a}`, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.5) });
      tx(130, y + 22, b, { 'font-size': 15, opacity: fade(u, 0.35 + i * 0.5) }); }); }

  const quiz = [
    { q: '서울과 버지니아 브로커를 이을 때 join_cluster를 쓰지 않는 이유는 무엇인가?',
      o: ['클러스터는 저지연 LAN 전제라 WAN 파티션에 약하다', 'join_cluster는 노드 2대까지만 된다', 'Federation보다 메시지가 느리다'], a: 0,
      why: '클러스터는 강결합이라 리전 사이 링크가 한 번 끊기면 전체가 흔들린다. 그래서 느슨하게 잇는 Shovel·Federation을 쓴다.' },
    { q: 'ack_mode=on-confirm인 Shovel에서 A의 orders.local 메시지가 지워지는 때는 언제인가?',
      o: ['Shovel이 메시지를 꺼낸 즉시', 'B의 소비자가 처리한 뒤', 'B가 confirm을 돌려준 뒤'], a: 2,
      why: 'on-confirm이면 목적지 브로커가 받았다고 확인해야 source에서 ack한다. 그래서 중간에 끊겨도 잃지 않는다.' },
    { q: 'Federation의 upstream과 policy는 어느 브로커에서 설정하나?',
      o: ['upstream인 A', 'downstream인 B', '양쪽 모두 같은 값으로'], a: 1,
      why: 'Federation은 downstream(B)이 upstream(A)에 연결해 당겨 온다. Shovel은 반대로 source(A) 쪽에서 설정한다.' },
    { q: 'definitions를 export했을 때 동적 Shovel은 어느 섹션에 나타나나?',
      o: ['policies', 'parameters', '둘 다'], a: 1,
      why: '동적 Shovel은 parameter 하나에 src와 dest가 다 들어 있다. Federation은 upstream(parameters)과 policy(policies) 두 조각이다.' },
    { q: '온프렘 큐를 AWS로 한 번 옮기고 끝내려 한다. 맞는 설정은?',
      o: ['Federation + upstream-set', 'Shovel + src-delete-after=never', 'Shovel + src-delete-after=queue-length'], a: 2,
      why: '끝이 있는 일에는 Shovel이 맞다. queue-length면 시작 시점의 큐 길이만큼 옮기고 스스로 지워진다.' },
  ];

  const summary = [
    '큐는 클러스터 경계를 넘지 못하고, 리전 사이를 클러스터로 묶으면 파티션에 약하다.',
    'Shovel은 source(A)에서 돌며 큐를 꺼내 B로 밀고, on-confirm이면 B가 확인한 뒤 지운다.',
    'Federation은 B에서 설정하고, B에 받을 곳이 있을 때만 A에서 당겨 온다.',
    '끝이 있는 이전은 Shovel, 상시 복제는 Federation이고, DR은 어느 쪽이든 on-confirm으로 둔다.',
  ];
  const review = [
    { q: 'B에서 federation 정책을 걸었는데 메시지가 전혀 넘어오지 않는다. 먼저 볼 것은?',
      o: ['A 쪽 shovel_status', 'A의 큐 길이 제한 정책', 'B의 federation_status와 federated exchange의 바인딩'], a: 2,
      why: '링크 상태는 downstream(B)에서 본다. 링크가 running이어도 B에 받을 바인딩이 없으면 당겨 오지 않는다.' },
    { q: '마이그레이션용 Shovel을 src-delete-after=never로 켜 두었다. 이전이 끝난 뒤 생기는 일은?',
      o: ['Shovel이 계속 살아 있어 clear_parameter로 직접 꺼야 한다', 'Shovel이 스스로 멈춘다', 'A의 큐가 삭제된다'], a: 0,
      why: 'never는 상시 파이프다. 끝이 있는 작업이면 queue-length로 두어야 다 옮긴 뒤 스스로 지워진다.' },
    { q: '분석 리전 소비자를 수시로 늘리고, 안 쓸 때는 WAN 트래픽을 줄이고 싶다. 고를 도구는?',
      o: ['Shovel', 'Federation', '리전 간 join_cluster'], a: 1,
      why: 'Federation은 downstream에 받을 곳이 있을 때만 당기고 바인딩도 전파한다. Shovel은 수요와 상관없이 계속 민다.' },
  ];

  R.page({ title: '리전 사이 메시지 잇기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
