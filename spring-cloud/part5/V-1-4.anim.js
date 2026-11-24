/* V-1-4 Kafka Binder — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 재료: 토픽·파티션(오프셋 칸이 쌓이는 로그), consumer group 인스턴스, 커밋 표시, 재시도 시간축과 DLQ 토픽, 프로듀서 배치·압축.
 * 숫자: 코드(partition-count 4, max-attempts 3, 1000ms ×2, 오프셋 10482, 파티션 8, max.poll.records 1000, linger 20ms)와 STEPS 데이터.
 *       처리량(tps, k/s)은 페이지 데이터의 예시 값이라 그림에도 "예시"로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, zone, server, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const KEYC = { A: INFO, B: WARN, C: GOOD, D: ACC };
  function head(s) { tx(40, 40, s, { 'font-size': 17, 'font-weight': 800 }); }
  function tps(c) { const b = c.beat, p = c.prev || {}, v = tween(p.tps, b.tps, c.u);
    R.spans(940, 40, [['처리량(예시) ', { fill: MUT }], [Math.round(v) + 'k/s', { fill: ACC, 'font-weight': 800 }]], { 'font-size': 14.5, 'text-anchor': 'end' }); }
  function lane(x, y, w, name, n, o) { o = o || {}; const col = o.col || INFO;
    el('rect', { x, y: y - 15, width: w, height: 30, rx: 15, fill: o.fill || INFOBG, stroke: col, 'stroke-width': 2, opacity: o.op ?? 1 });
    for (let i = 0; i < n; i++) { const cc = o.cells ? o.cells[i] : null; el('rect', { x: x + w - 24 - i * 22, y: y - 9, width: 16, height: 18, rx: 3, fill: cc || col, opacity: (o.op ?? 1) * 0.85 }); }
    if (name) mono(x - 10, y + 5, name, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: o.op ?? 1 }); }
  const env = (x, y, s, col, sc) => card(x, y, tw(s, 13.5) + 20, 26, { rx: 5, fill: col || ACC, stroke: 'none', text: s, fs: 13.5, fw: 700, color: PANEL, mono: true, s: sc });

  // ---------- 1. destination = 토픽, group = consumer group ----------
  const FN = [480, 220];
  function s1(t, c) { const { k, u } = c; tps(c);
    head('Kafka Binder 기본 배선');
    // 의존성 두 칸
    const snap = k === 0 ? E(u, 0.3, 1.1) : 1;
    card(lerp(240, 330, snap), 90, 220, 44, { rx: 8, stroke: INK, sw: 2, text: 'spring-cloud-stream', mono: true, fs: 14 });
    card(lerp(720, 560, snap), 90, 220, 44, { rx: 8, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'binder-kafka', mono: true, fs: 14, color: ACC });
    if (k === 0) { card(FN[0], FN[1] + 20, 200, 60, { rx: 12, stroke: OFF, sw: 2, dash: '6 5', text: '함수형 빈', color: MUT, s: pop(u, 1.2) });
      pill(FN[0], 330, '브로커 = Kafka로 확정', ACC, pop(u, 1.5), { fs: 15 });
      sub(480, 390, '애플리케이션 코드는 아직 아무것도 안 바뀌었다', fade(u, 1.9), { 'font-size': 15 }); return; }
    card(FN[0], FN[1] + 20, 200, 60, { rx: 12, stroke: WARN, sw: 2.5, text: 'orderProcessor', mono: true });
    el('circle', { cx: FN[0] - 100, cy: FN[1] + 20, r: 7, fill: WARN }); el('circle', { cx: FN[0] + 100, cy: FN[1] + 20, r: 7, fill: WARN });
    mono(FN[0] - 100, FN[1] + 62, 'in-0', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: k === 1 ? fade(u, 0.6) : 1 });
    mono(FN[0] + 100, FN[1] + 62, 'out-0', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: k === 1 ? fade(u, 1.0) : 1 });
    if (k === 1) { mono(480, 148, 'definition: orderProcessor', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      mono(480, 330, 'orderProcessor-in-0 · orderProcessor-out-0', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(480, 390, '바인딩 이름의 앞부분은 definition에 적은 빈 이름이다', fade(u, 1.6), { 'font-size': 15 }); return; }
    // 입력 토픽 orders + group
    const gi = k === 2 ? E(u, 0.2, 0.8) : 1;
    lane(40, FN[1] + 20, 230 * gi, null, Math.round(3 * gi)); mono(155, FN[1] - 10, 'topic: orders', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: gi });
    grow(272, FN[1] + 20, FN[0] - 108, FN[1] + 20, gi, INFO);
    el('rect', { x: FN[0] - 150, y: FN[1] - 24, width: 300, height: 106, rx: 14, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: k === 2 ? fade(u, 1.0) : 1 });
    mono(FN[0], FN[1] + 102, 'group: order-worker', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 1.1) : 1 });
    if (k === 2) { for (let i = 0; i < 2; i++) dot([[240, FN[1] + 20], [FN[0] - 100, FN[1] + 20]], seg(u, 1.4 + i * 0.4, 2.1 + i * 0.4), INFO, 6); return; }
    const go = k === 3 ? E(u, 0.2, 0.8) : 1;
    grow(FN[0] + 108, FN[1] + 20, 680, FN[1] + 20, go, GOOD);
    lane(690, FN[1] + 20, 230 * go, null, k === 3 ? Math.round(E(u, 1.2, 2.2) * 3) : 3, { col: GOOD, fill: GOODBG });
    mono(805, FN[1] - 10, 'topic: orders-processed', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: go });
    if (k === 3) { for (let i = 0; i < 3; i++) dot([[240, FN[1] + 20], [FN[0] - 100, FN[1] + 20], [FN[0] + 100, FN[1] + 20], [900, FN[1] + 20]], seg(u, 0.6 + i * 0.4, 1.8 + i * 0.4), i % 2 ? GOOD : INFO, 6);
      sub(480, 395, '함수가 return 한 값을 out-0 바인딩이 토픽으로 낸다', fade(u, 1.8), { 'font-size': 15 }); return; }
    // k4: 브로커 3대
    ['kafka-1', 'kafka-2', 'kafka-3'].forEach((n, i) => { const x = 230 + i * 250; server(x, 360, null, { s: 0.45 * pop(u, 0.3 + i * 0.25), lamp: GOOD });
      mono(x + 40, 366, n + ':9092', { 'font-size': 14, opacity: fade(u, 0.5 + i * 0.25) }); });
    pill(480, 150, 'auto-create-topics: true (개발 편의)', WARN, pop(u, 1.3), { fs: 13.5, mono: true }); }

  // ---------- 2. 파티션 ----------
  const PL = { x: 260, w: 380 }, PY = (p, n) => 225 + (p - (n - 1) / 2) * 62;
  const MSG = [['A', 0], ['B', 1], ['A', 0], ['C', 2], ['D', 3], ['B', 1], ['A', 0], ['C', 2]];
  function s2(t, c) { const { k, u } = c; tps(c);
    head('같은 키는 같은 파티션으로');
    const b = c.beat, p = c.prev || {}, n = b.partitions, nPrev = p.partitions || n, sp = k === 1 ? E(u, 0.2, 1.0) : 1;
    // 프로듀서
    card(90, 225, 120, 60, { rx: 10, stroke: INK, sw: 2.2, text: 'producer', mono: true, fs: 14 });
    pill(240, 74, "partition-key: headers['customerId']", ACC, k === 0 ? pop(u, 0.2) : 1, { fs: 13.5, mono: true });
    const lanes = Math.max(n, 1);
    for (let q = 0; q < lanes; q++) { const y = k === 1 ? lerp(PY(0, 1), PY(q, 4), sp) : PY(q, lanes);
      lane(PL.x, y, PL.w, 'P' + q, 0, { op: k === 1 ? (q === 0 ? 1 : sp) : 1 }); }
    // 메시지가 키대로 파티션에 들어감
    const arr = k <= 1 ? MSG : MSG.slice(0, 4);
    arr.forEach(([key, q], i) => { const target = n === 1 ? 0 : q, ty = PY(target, lanes), a = 0.5 + i * 0.22, f = seg(u, a, a + 0.6), xEnd = PL.x + PL.w - 30 - Math.floor(i / (n === 1 ? 1 : 1)) * 0;
      const slot = arr.slice(0, i).filter(([, qq]) => (n === 1 ? 0 : qq) === target).length, x1 = PL.x + PL.w - 22 - slot * 30;
      if (k <= 1 && f > 0 && f < 1) env(lerp(150, x1, f), lerp(225, ty, f), key, KEYC[key]);
      if (k > 1 || f >= 1) env(x1, ty, key, KEYC[key], 1); });
    if (k === 0) { sub(480, 395, '파티션이 1개라 모든 키가 P0 하나에 줄을 선다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1) { tx(PL.x + PL.w / 2, 395, 'partition-count: 4 · 키 → 파티션 배정은 그림을 위한 예시', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    // 컨슈머
    const nc = k === 5 ? 5 : b.consumers, CX = 830;
    for (let i = 0; i < nc; i++) { const y = nc === 1 ? 225 : 225 + (i - (Math.min(nc, 5) - 1) / 2) * 62, idle = i >= n, s = k === 3 && i > 0 ? pop(u, 0.3 + i * 0.2) : k === 5 && i === 4 ? pop(u, 0.4) : 1;
      card(CX, y, 110, 46, { rx: 8, stroke: idle ? OFF : WARN, sw: 2.2, fill: idle ? SOFT : PANEL, text: 'C' + i, mono: true, color: idle ? MUT : WARN, s, dash: idle ? '6 5' : null });
      if (idle) tx(CX, y + 40, '유휴', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); }
    for (let q = 0; q < 4; q++) { const to = nc === 1 ? 0 : q, ty = nc === 1 ? 225 : 225 + (to - (Math.min(nc, 5) - 1) / 2) * 62, f = k === 3 ? E(u, 0.6 + q * 0.15, 1.1 + q * 0.15) : 1;
      if (k === 3) el('line', { x1: PL.x + PL.w + 6, y1: PY(q, 4), x2: CX - 60, y2: 225, stroke: OFF, 'stroke-width': 1.5, opacity: 1 - f });
      grow(PL.x + PL.w + 6, PY(q, 4), lerp(PL.x + PL.w + 6, CX - 58, f), lerp(PY(q, 4), ty, f), f > 0 ? 1 : 0, WARN, { sw: 2 }); }
    if (k === 2) { mono(CX, 300, 'partitioned: true', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      sub(560, 395, '인스턴스가 1개라 파티션 4개를 혼자 다 읽는다', fade(u, 1.2), { 'font-size': 15 }); return; }
    if (k === 3) { sub(560, 395, '같은 그룹 인스턴스 4개에 Kafka가 파티션을 1:1로 나눠 준다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 4) { // 순서: P0 안의 A 들은 순서대로, 파티션 사이는 순서 없음
      grow(PL.x + 40, PY(0, 4) - 30, PL.x + 250, PY(0, 4) - 30, E(u, 0.2, 1.4), GOOD);
      ['A1', 'A2', 'A3'].forEach((s, i) => env(PL.x + 60 + i * 70, PY(0, 4) - 30, s, KEYC.A, pop(u, 0.3 + i * 0.3)));
      tx(PL.x + PL.w / 2, 395, '같은 키는 순서 유지 · 다른 파티션끼리는 전역 순서가 없다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    sub(560, 395, '인스턴스를 파티션보다 많이 띄우면 남는 쪽은 논다', fade(u, 1.4), { 'font-size': 15 }); }

  // ---------- 3. 오프셋과 수동 ack ----------
  const OFF0 = 10479, CW = 74, OX = 120, OY = 120, ox = (o) => OX + (o - OFF0) * CW;
  function log3(done, failed) { mono(OX - 12, OY + 6, 'P2', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'end' });
    for (let o = OFF0; o <= OFF0 + 7; o++) { const st = failed === o ? BAD : o < done ? GOOD : INFO;
      card(ox(o) + CW / 2 - 3, OY, CW - 8, 40, { rx: 5, stroke: st, sw: 2, fill: o < done ? GOODBG : failed === o ? BADBG : INFOBG, text: String(o), fs: 13.5, mono: true, color: st }); } }
  function commitMark(off, op) { const x = ox(off) - 3; el('path', { d: `M${x},${OY + 26} l-8,14 h16 z`, fill: ACC, opacity: op ?? 1 }); el('line', { x1: x, y1: OY - 28, x2: x, y2: OY + 26, stroke: ACC, 'stroke-width': 3, opacity: op ?? 1 });
    mono(x, OY + 60, 'committed ' + off, { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: op ?? 1 }); }
  function s3(t, c) { const { k, u } = c; tps(c);
    head('어디까지 읽었나 · 오프셋 커밋');
    if (k <= 1) { log3(10482); commitMark(10482);
      const sp = k === 0 ? E(u, 0.6, 1.3) : 1;
      card(230 - 20 * sp, 290, 140, 70, { rx: 8, stroke: INK, sw: 2.2, fill: SOFT }); mono(230 - 20 * sp, 296, 'headers', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      card(370 + 20 * sp, 290, 140, 70, { rx: 8, stroke: INK, sw: 2.2 }); mono(370 + 20 * sp, 296, 'payload', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      mono(300, 238, 'Message<String>', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: k === 0 ? fade(u, 0.2) : 1 });
      if (k === 0) { sub(700, 300, '헤더까지 받아야 ack를 꺼낼 수 있다', fade(u, 1.6), { 'font-size': 15 }); return; }
      const f = E(u, 0.4, 1.2);
      if (f > 0.02) card(lerp(210, 700, f), 290, 190, 46, { rx: 23, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'Acknowledgment ack', mono: true, fs: 13.5, color: ACC });
      mono(700, 345, 'KafkaHeaders.ACKNOWLEDGMENT', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      tx(700, 375, '자동 커밋이면 null이다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 2) { const doneNow = u > 1.6 ? 10483 : 10482; log3(doneNow);
el('rect', { x: ox(10482) - 2, y: OY - 26, width: CW - 4, height: 52, rx: 7, fill: 'none', stroke: INK, 'stroke-width': 2.5 });
      const steps = [['① handleOrder()', 0.3], ['② 성공', 0.9], ['③ ack.acknowledge()', 1.4]];
      steps.forEach(([s, a], i) => pill(300 + i * 230, 300, s, i === 2 ? ACC : i === 1 ? GOOD : INK, pop(u, a), { fs: 14, mono: i !== 1 }));
      commitMark(u > 1.6 ? Math.round(lerp(10482, 10483, E(u, 1.6, 2.2)) * 1) : 10482);
      sub(480, 395, '커밋 값은 다음에 읽을 위치다 · 처리 뒤에 커밋하면 유실 대신 중복이 생길 수 있다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { log3(10483, 10483); commitMark(10483);
      el('rect', { x: ox(10483) - 2, y: OY - 26, width: CW - 4, height: 52, rx: 7, fill: 'none', stroke: BAD, 'stroke-width': 2.5 });
      pill(300, 300, 'handleOrder() 예외', BAD, pop(u, 0.3), { fs: 14 }); cross(390, 260, 10, pop(u, 0.5));
      pill(560, 300, 'throw e', BAD, pop(u, 0.9), { fs: 14, mono: true }); grow(610, 300, 700, 300, E(u, 1.1, 1.5), BAD);
      pill(800, 300, '재시도 / DLQ', WARN, pop(u, 1.5), { fs: 14 });
      sub(480, 395, '커밋 표시는 10483에서 움직이지 않는다 · catch에서 삼키면 Binder가 실패를 모른다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 4) { log3(10483); commitMark(10483);
      [['ack-mode', 'MANUAL', 0.3], ['auto-commit-offset', 'false', 0.9]].forEach(([n, v, a], i) => { const y = 290 + i * 54, on = E(u, a + 0.3, a + 0.7);
        mono(320, y + 5, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
        el('rect', { x: 340, y: y - 14, width: 56, height: 28, rx: 14, fill: i === 0 ? (on > 0.5 ? ACC : OFF) : (on > 0.5 ? OFF : ACC) });
        el('circle', { cx: i === 0 ? lerp(354, 382, on) : lerp(382, 354, on), cy: y, r: 11, fill: PANEL });
        mono(414, y + 5, v, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, a + 0.5) }); });
      tx(560, 310, '설정을 안 켜면 ack는 null이고,', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) });
      tx(560, 336, '코드는 조용히 자동 커밋으로 돌아간다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.7) }); return; }
    // k5: earliest 로 되감기
    log3(OFF0 + 8); const back = E(u, 0.3, 1.2); commitMark(Math.round(lerp(10483, OFF0, back)));
    for (let i = 0; i < 4; i++) dot([[ox(OFF0) + 20, OY - 40], [ox(OFF0 + 7) + 50, OY - 40]], seg(u, 1.2 + i * 0.25, 2.4 + i * 0.25), WARN, 6);
    mono(480, 300, 'kafka-consumer-groups --reset-offsets --to-earliest', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
    sub(480, 345, '로그가 보존된 만큼 다시 읽는다 · 소비하면 사라지는 큐에는 없는 일', fade(u, 1.8), { 'font-size': 15 }); }

  // ---------- 4. 재시도와 DLQ ----------
  const CN = [300, 220];
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    head('실패 메시지는 재시도 뒤 DLQ로');
    R.spans(940, 40, [['DLQ에 쌓인 메시지 ', { fill: MUT }], [String(Math.round(tween(p.dlq, b.dlq, u))), { fill: BAD, 'font-weight': 800 }]], { 'font-size': 14.5, 'text-anchor': 'end' });
    // 위: orders 파티션 (밀린 메시지)
    const pile = k === 0 ? Math.round(E(u, 0.4, 2.4) * 6) + 1 : k >= 3 ? 1 : 7;
    lane(140, 100, 360, 'orders P2', pile, { cells: Array.from({ length: pile }, (_, i) => i === 0 && k < 3 ? BAD : null) });
    grow(320, 118, CN[0], CN[1] - 34, 1, MUT);
    card(CN[0], CN[1], 170, 56, { rx: 10, stroke: WARN, sw: 2.5, text: 'orderProcessor', mono: true, fs: 14 });
    if (k === 0) { const X = (s) => 600 + s * 90;
      el('line', { x1: X(0), y1: 240, x2: lerp(X(0), X(3.4), E(u, 0.1, 0.5)), y2: 240, stroke: MUT, 'stroke-width': 2 });
      [[0, 0.4], [1, 1.0], [3, 1.7]].forEach(([s, a], i) => { cross(X(s), 240, 9, pop(u, a)); mono(X(s), 272, s + 's', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, a) });
        tx(X(s), 214, (i + 1) + '번째', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, a) }); });
      [[0, 1, '1초'], [1, 3, '2초']].forEach(([a, bb, s], i) => tx((X(a) + X(bb)) / 2, 300, s, { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.1 + i * 0.6) }));
      tx(520, 160, '재시도하는 동안 뒤 메시지가 밀린다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(480, 395, 'max-attempts 3 · 첫 시도 포함 3번, 대기는 1초에서 2배씩', fade(u, 2.1), { 'font-size': 15 }); return; }
    // DLQ 토픽
    const nmF = k === 2 ? E(u, 0.4, 1.1) : k > 2 ? 1 : 0;
    lane(560, 350, 330, null, b.dlq, { col: BAD, fill: BADBG });
    mono(725, 318, 'error.orders.order-worker', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: 1 - nmF, 'text-decoration': nmF > 0.5 ? 'line-through' : null });
    mono(725, 318, 'orders.DLT', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: nmF });
    el('path', { d: `M${CN[0] + 86},${CN[1] + 10} C520,${CN[1] + 10} 520,350 556,350`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': k === 1 ? null : null, opacity: k === 1 ? fade(u, 0.3) : 1 });
    if (k === 1) { const f = seg(u, 0.8, 1.6); if (f > 0 && f < 1) env(lerp(CN[0] + 90, 590, f), lerp(CN[1], 350, f * f), '실패', BAD);
      pill(CN[0], 330, 'enable-dlq: true', BAD, pop(u, 0.4), { fs: 14, mono: true });
      sub(480, 405, 'kafka 하위 블록에 넣어야 먹는다 · group이 있어야 켤 수 있다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { pill(725, 395, 'DLQ 파티션 1개 · dlq-partitions: 1', BAD, pop(u, 1.3), { fs: 13.5 });
      tx(CN[0], 320, '기본 이름은 error.<destination>.<group>', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); return; }
    if (k === 3) { for (let i = 0; i < 4; i++) dot([[490, 100], [320, 118], [CN[0], CN[1] - 30]], seg(u, 0.4 + i * 0.35, 1.0 + i * 0.35), INFO, 6);
      pill(700, 200, '파티션 정체 해소', GOOD, pop(u, 0.6), { fs: 14 });
      sub(480, 405, 'DLQ로 보낸 메시지는 처리된 것으로 보고 다음으로 넘어간다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 4) { const H = [['x-original-topic', 'orders'], ['x-original-partition', '2'], ['x-original-offset', '10482'], ['x-exception-message', 'NumberFormatException …']];
      el('rect', { x: 560, y: 70, width: 380, height: 40 + H.length * 30, rx: 10, fill: PANEL, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.2) });
      H.forEach(([kk, v], i) => { mono(578, 100 + i * 30, kk, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.3) }); mono(760, 100 + i * 30, v, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.3) }); });
      grow(905, 334, 905, 232, E(u, 0.2, 0.6), BAD, { plain: true }); return; }
    // k5: 고친 뒤 원본 토픽으로 재발행
    pill(380, 330, '코드 수정 후', GOOD, pop(u, 0.3), { fs: 14 });
    el('path', { d: 'M900,335 C960,260 940,110 506,100', fill: 'none', stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.6) });
    const f = seg(u, 0.9, 2.0); dot([[890, 340], [940, 220], [700, 104], [506, 100]], f, GOOD, 8);
    tx(780, 190, 'DLQ 컨슈머가 원본 토픽으로', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }

  // ---------- 5. 운영 튜닝 ----------
  function s5(t, c) { const { k, u } = c; tps(c);
    if (k === 0) { head('파티션 8개 = 인스턴스 4개 × 스레드 2개');
      for (let q = 0; q < 8; q++) lane(120, 86 + q * 38, 300, 'P' + q, 2, { op: fade(u, 0.1 + q * 0.06) });
      for (let i = 0; i < 4; i++) { const y = 105 + i * 76; card(720, y + 19, 230, 68, { rx: 10, stroke: WARN, sw: 2.2, s: pop(u, 0.6 + i * 0.15) });
        mono(716, y + 24, 'instance ' + i, { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.15) });
        for (let j = 0; j < 2; j++) { const q = i * 2 + j, ty = y + 6 + j * 26; card(660, ty, 60, 22, { rx: 11, stroke: WARN, sw: 1.8, text: 't' + j, fs: 13.5, mono: true, color: WARN, s: pop(u, 0.8 + i * 0.15) });
          grow(424, 86 + q * 38, 626, ty, E(u, 1.2 + q * 0.08, 1.6 + q * 0.08), WARN, { sw: 1.5 }); } }
      tx(700, 405, '8 × 2 = 16 스레드였다면 8개가 놀았다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    if (k === 1) { head('poll 한 번에 더 많이 가져온다');
      [['기본 500', 500, OFF, 0.3], ['max.poll.records 1000', 1000, ACC, 1.0]].forEach(([n, v, col, a], i) => { const y = 130 + i * 110, f = E(u, a, a + 0.6);
        mono(60, y - 22, n, { 'font-size': 15, 'font-weight': 700, fill: col === OFF ? MUT : ACC });
        el('rect', { x: 60, y: y - 8, width: 0.6 * v * f, height: 34, rx: 6, fill: col, opacity: 0.85 });
        mono(70 + 0.6 * v * f, y + 15, v + '건/poll', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, a + 0.5) }); });
      pill(480, 370, 'poll 사이 처리 시간이 길어지면 리밸런스가 날 수 있다', WARN, pop(u, 1.9), { fs: 14 }); return; }
    if (k === 2) { head('프로듀서: 모으고 · 압축하고 · 모두 받았는지 확인');
      // linger 20ms 동안 모으기
      el('rect', { x: 60, y: 140, width: 220, height: 90, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      mono(170, 128, 'linger.ms: 20', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' });
      const nIn = Math.round(E(u, 0.1, 0.9) * 6); for (let i = 0; i < nIn; i++) el('rect', { x: 80 + (i % 3) * 64, y: 158 + Math.floor(i / 3) * 34, width: 52, height: 24, rx: 4, fill: INFO, opacity: 0.85 });
      clock(255, 125, 14, E(u, 0.1, 0.9), WARN);
      const sq = E(u, 1.0, 1.4); card(lerp(380, 400, sq), 185, lerp(200, 110, sq), 60, { rx: 8, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'lz4', mono: true, color: ACC, op: fade(u, 0.9) });
      grow(282, 185, 300, 185, fade(u, 0.95), MUT);
      ['leader', 'ISR', 'ISR'].forEach((n, i) => { const y = 110 + i * 90; server(700, y, null, { s: 0.5 * pop(u, 1.3 + i * 0.1) }); mono(760, y + 5, n, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.4) });
        grow(470, 185, 660, y, E(u, 1.5 + i * 0.1, 1.9 + i * 0.1), ACC, { sw: 2 }); check(840, y, 10, pop(u, 2.1 + i * 0.12)); });
      mono(480, 395, 'acks: all · compression.type: lz4', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    if (k === 3) { head('대용량에서도 DLQ는 그대로');
      lane(160, 140, 520, 'click-events', 14);
      for (let i = 0; i < 5; i++) dot([[160, 140], [680, 140], [860, 140]], seg(u, 0.2 + i * 0.35, 1.2 + i * 0.35), INFO, 6);
      const f = seg(u, 1.0, 1.8); if (f > 0 && f < 1) env(lerp(600, 760, f), lerp(140, 300, f), '실패', BAD);
      lane(560, 300, 330, null, u > 1.8 ? 1 : 0, { col: BAD, fill: BADBG }); mono(725, 268, 'click-events.DLT', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      tx(160, 300, '처리량이 늘면 실패 건수도 같이 는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k4: Kafka 로그 vs RabbitMQ 큐
    head('Kafka는 읽어도 남고, RabbitMQ 큐는 읽으면 사라진다');
    const rd = Math.floor(E(u, 0.4, 2.0) * 5);
    tx(240, 110, 'Kafka (로그)', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    for (let i = 0; i < 6; i++) card(90 + i * 60, 170, 50, 44, { rx: 5, stroke: ACC, sw: 2, fill: i < rd ? ACCBG : PANEL, text: String(i), mono: true, color: ACC });
    el('path', { d: `M${90 + rd * 60 - 30},205 v18`, stroke: ACC, 'stroke-width': 3 }); mono(90 + rd * 60 - 30, 245, 'offset', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle' });
    tx(240, 300, '오프셋을 되돌려 다시 읽는다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    tx(720, 110, 'RabbitMQ (큐)', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
    for (let i = 0; i < 6; i++) { if (i < rd) continue; card(570 + (i - rd) * 60, 170, 50, 44, { rx: 5, stroke: WARN, sw: 2, text: String(i), mono: true, color: WARN }); }
    tx(720, 300, '소비한 메시지는 큐에서 지워진다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    el('line', { x1: 480, y1: 90, x2: 480, y2: 330, stroke: GRID, 'stroke-width': 1.5 });
    sub(480, 390, '바뀐 것은 모두 설정이고 orderProcessor 빈은 그대로다', fade(u, 2.3), { 'font-size': 15 }); }

  const quiz = [
    { q: 'Kafka Binder에서 바인딩의 group은 Kafka의 무엇이 되나?',
      o: ['토픽 이름', 'consumer group', '파티션 번호'], a: 1,
      why: 'destination은 토픽, group은 consumer group으로 그대로 옮겨진다. order-worker 그룹이 orders 토픽을 읽는다.' },
    { q: '파티션 4개짜리 토픽을 같은 그룹 인스턴스 5개로 읽으면 어떻게 되나?',
      o: ['다섯 번째 인스턴스는 받을 파티션이 없어 논다', '파티션이 자동으로 5개로 는다', '모든 인스턴스가 메시지를 똑같이 다 받는다'], a: 0,
      why: '한 파티션은 그룹 안에서 한 컨슈머만 읽는다. 병렬도의 상한은 파티션 수 4다.' },
    { q: '수동 ack로 오프셋 10482를 처리했다. acknowledge()가 커밋하는 값은 무엇인가?',
      o: ['10481', '10482', '10483'], a: 2,
      why: '커밋하는 값은 다음에 읽을 위치다. 처리를 끝낸 뒤 커밋하므로 중간에 죽으면 다시 읽어 중복은 생겨도 유실은 없다.' },
    { q: 'max-attempts: 3, back-off-initial-interval: 1000, 배수 2.0이면 첫 실패부터 DLQ로 가기까지 기다리는 시간은 모두 얼마인가?',
      o: ['3초', '2초', '6초'], a: 0,
      why: '첫 시도 포함 3번 처리하므로 대기는 두 번이다. 1초, 2초를 기다려 모두 3초다.' },
    { q: '인스턴스 4개에 concurrency 2를 준 운영 설정에서 놀지 않으려면 파티션은 몇 개가 필요한가?',
      o: ['4개', '8개 이상', '2개'], a: 1,
      why: '컨슈머 스레드가 4 × 2 = 8개라 파티션도 8개는 있어야 스레드마다 하나씩 받는다.' },
  ];

  const summary = [
    'Kafka Binder에서 destination은 토픽이 되고 group은 consumer group이 된다.',
    '같은 키는 같은 파티션에 들어가 순서가 지켜지고, 병렬도는 파티션 수를 넘지 못한다.',
    '처리를 마친 뒤 수동으로 커밋하면 유실 대신 중복이 생기므로 처리를 멱등하게 짠다.',
    '재시도를 다 써도 실패한 메시지는 DLQ로 빼고, 원인 헤더를 보고 고친 뒤 다시 흘린다.',
  ];
  const review = [
    { q: '인스턴스를 4개에서 6개로 늘렸는데 처리량이 그대로다. 토픽 파티션은 4개다. 먼저 할 일은?',
      o: ['concurrency를 2로 올린다', '파티션 수를 늘린다 (키 배정이 바뀌는 점을 감안한다)', 'max-attempts를 줄인다'], a: 1,
      why: '파티션 4개는 그룹 안에서 최대 4개 컨슈머만 일하게 한다. 스레드를 더 늘려도 남는 쪽은 논다.' },
    { q: '주문 처리 중 서버가 죽은 뒤 같은 주문이 두 번 처리됐다. 수동 ack 설정은 맞다. 무엇을 고쳐야 하나?',
      o: ['ack를 처리 전에 부른다', 'auto-commit을 다시 켠다', '핸들러를 멱등하게 만든다'], a: 2,
      why: '처리 뒤에 커밋하면 커밋 직전에 죽은 메시지는 다시 온다. 이 중복은 at-least-once의 대가라 받는 쪽이 감당해야 한다.' },
    { q: '독성 메시지 하나 때문에 한 파티션의 지연이 계속 쌓인다. 설정만으로 풀 방법은?',
      o: ['재시도 횟수를 정하고 enable-dlq를 켠다', 'max-attempts를 크게 늘린다', '파티션을 하나로 합친다'], a: 0,
      why: '재시도 중에는 그 파티션이 멈춘다. 정해진 횟수 뒤 DLQ로 빼면 오프셋이 넘어가 뒤 메시지가 다시 흐른다.' },
  ];

  R.page({ title: 'Kafka 파티션과 오프셋', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
