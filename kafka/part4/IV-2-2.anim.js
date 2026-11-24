/* IV-2-2 Spring Kafka · FastAPI aiokafka · Outbox · 멱등 Consumer — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 중심: order-events 토픽(파티션 3개, 칸마다 오프셋)과 컨슈머 그룹의 커밋 오프셋 화살표.
 * 파티션 번호는 Java 기본 파티셔너와 같은 murmur2(key) & 0x7fffffff % 3 을 python 으로 재현해 계산했다:
 *   order-1001 → p0, order-1002 → p0 (0x4fbd7c1c), order-1003 → p1 (0x27a16188), order-1004 → p0,
 *   order-2002 → p2 (0x3002bf1c), order-2003 → p0, order-9001 → p0.
 * offset 42·43·88 같은 위치 값은 페이지의 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, snippet, server, dbIcon, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op }, a || {}));

  // 파티션 한 줄: base 오프셋부터 n 칸, labels 로 칸 글자. o.mark = 커밋 오프셋 위치(칸 번호, 소수 가능)
  function part(x, y, name, n, o) { o = o || {}; const w = o.w || 46, h = o.h || 30, gap = 3, slots = o.slots || 6;
    mono(x - 8, y + h / 2 + 5, name, { 'font-size': 14, 'text-anchor': 'end', fill: o.hot ? ACC : MUT, 'font-weight': 700 });
    for (let i = 0; i < slots; i++) { const cx = x + i * (w + gap), f = clamp(n - i), col = (o.col && o.col(i)) || ACC;
      el('rect', { x: cx, y, width: w, height: h, rx: 4, fill: 'none', stroke: GRID, 'stroke-dasharray': '3 3' });
      if (f > 0) { el('rect', { x: cx, y, width: w, height: h, rx: 4, fill: (o.bg && o.bg(i)) || ACCBG, stroke: col, 'stroke-width': 1.6, opacity: f });
        mono(cx + w / 2, y + h / 2 + 5, o.labels ? (o.labels[i] ?? '') : String((o.base || 0) + i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, opacity: f }); } }
    if (o.mark != null) { const mx = x + o.mark * (w + gap) - 1.5; el('line', { x1: mx, y1: y - 8, x2: mx, y2: y + h + 8, stroke: o.markCol || INFO, 'stroke-width': 3 });
      el('path', { d: `M${mx - 6},${y + h + 16} L${mx},${y + h + 8} L${mx + 6},${y + h + 16} Z`, fill: o.markCol || INFO }); } }
  function topic3(x, y, counts, o) { o = o || {}; mono(x - 30, y - 12, o.name || 'order-events', { 'font-size': 14.5, 'font-weight': 700 });
    counts.forEach((n, p) => part(x, y + p * 44, 'p' + p, n, Object.assign({ slots: o.slots || 5, w: o.w || 46 }, (o.per && o.per(p)) || {}))); }
  function app(cx, cy, w, h, title, o) { o = o || {}; card(cx, cy, w, h, { rx: 12, stroke: o.stroke || INK, fill: o.fill || SOFT, sw: 2.2, s: o.s, op: o.op });
    tx(cx - w / 2 + 14, cy - h / 2 + 22, title, { 'font-size': 14.5, 'font-weight': 800, fill: o.stroke || INK, opacity: o.op ?? 1 }); }
  function chip(cx, cy, s, col, sc, o) { o = o || {}; return card(cx, cy, o.w || tw(s, 13.5) + 24, 30, { rx: 6, text: s, fs: 13.5, mono: true, stroke: col || INK, color: col || INK, fill: o.fill || PANEL, s: sc ?? 1, op: o.op }); }

  // ---------- 1. @KafkaListener ----------
  function s1(t, c) { const { k, u } = c;
    const TX = 110, TY = 110;
    topic3(TX, TY, [4, 3, 3], { per: (p) => (p === 0 ? { base: 40, labels: ['40', '41', '42', '43'], hot: k >= 2, mark: k >= 3 ? (k === 3 ? lerp(2, 3, E(u, 1.4, 2.0)) : 3) : k >= 1 ? 2 : null } : { base: 0 }) });
    if (k >= 1) sub(TX + 120, TY + 150, '│ = 커밋 오프셋 (다음에 읽을 위치)', fade(u, k === 1 ? 1.6 : 0), { 'font-size': 13.5 });
    app(720, 200, 400, 300, 'Spring Boot 앱', {});
    card(720, 110, 260, 40, { rx: 8, stroke: INK, text: '@Component OrderEventListener', fs: 13.5, mono: true, s: k === 0 ? pop(u, 0.3) : 1 });
    chip(720, 160, 'orderService 주입', MUT, k === 0 ? pop(u, 0.8) : 1);
    if (k === 0) { el('line', { x1: 380, y1: 150, x2: 515, y2: 150, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6' }); cross(448, 150, 10, pop(u, 1.4));
      say(720, 300, '빈일 뿐, 아직 아무것도 읽지 않는다', fade(u, 1.6), { 'text-anchor': 'middle', fill: MUT }); return; }
    const cont = k === 1 ? pop(u, 0.3) : 1;
    card(720, 226, 330, 48, { rx: 10, stroke: ACC, fill: ACCBG, text: 'KafkaListenerContainer · group=order-processor', fs: 13.5, color: ACC, s: cont });
    if (k === 1) { [0, 1, 2].forEach((p) => grow(TX + 250, TY + 15 + p * 44, 553, 226, E(u, 0.8 + p * 0.2, 1.3 + p * 0.2), ACC));
      sub(720, 280, '인스턴스 하나면 p0 · p1 · p2 를 모두 받는다', fade(u, 1.6), { 'font-size': 14, fill: INK, 'font-weight': 700 });
      sub(720, 306, 'polling 루프는 Spring 이 돈다', fade(u, 1.9), { 'font-size': 13.5 }); return; }
    if (k === 2) { dot([[TX + 2 * 49 + 23, TY + 15], [553, 226]], seg(u, 0.2, 0.9), ACC, 7);
      [['key', 'order-1001'], ['partition', '0'], ['offset', '42']].forEach(([a, b], i) => { mono(580, 282 + i * 24, a, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9 + i * 0.2) }); mono(700, 282 + i * 24, b, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9 + i * 0.2) }); });
      chip(820, 306, 'Acknowledgment ack', INFO, pop(u, 1.7));
      sub(TX + 120, 280, 'murmur2("order-1001") % 3 = 0', fade(u, 2.0), { 'font-size': 13.5, fill: ACC }); return; }
    if (k === 3) { check(600, 296, 10, pop(u, 0.4)); mono(620, 301, 'handleOrder(event)', { 'font-size': 14.5, opacity: fade(u, 0.4) });
      chip(720, 338, 'ack.acknowledge()', GOOD, pop(u, 1.0));
      sub(TX + 120, 290, '커밋 42 → 43', fade(u, 1.9), { 'font-size': 14.5, fill: INFO, 'font-weight': 700 }); return; }
    // k === 4: 예외 → ack 없음 → 같은 레코드를 다시
    const n = Math.min(3, Math.floor(u * 1.3));
    dot([[TX + 3 * 49 + 23, TY + 15], [553, 226]], (u * 1.3) % 1, BAD, 7);
    cross(600, 296, 10, pop(u, 0.5)); mono(620, 301, 'order-1002 처리 실패', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 0.5) });
    chip(720, 338, 'ack 호출 안 됨', BAD, pop(u, 0.9));
    mono(880, 380, '시도 ' + (n + 1), { 'font-size': 14.5, 'text-anchor': 'end', fill: BAD, 'font-weight': 700 });
    sub(TX + 120, 290, '커밋은 43 에 머문다', fade(u, 1.2), { 'font-size': 14.5, fill: INFO, 'font-weight': 700 });
    sub(TX + 120, 316, '에러 핸들러가 43 으로 되감아 다시 준다', fade(u, 1.6), { 'font-size': 13.5 });
    sub(TX + 120, 342, '횟수를 넘기면 DLQ 로 (정책은 직접 정한다)', fade(u, 2.0), { 'font-size': 13.5 }); }

  // ---------- 2. KafkaTemplate ----------
  function s2(t, c) { const { k, u } = c;
    const TX = 560, TY = 100;
    app(160, 180, 260, 260, 'OrderProducer', {});
    chip(160, 100, 'KafkaTemplate<String,OrderEvent>', ACC, k === 0 ? pop(u, 0.3) : 1, { w: 236 });
    chip(160, 140, 'TOPIC = "order-events"', MUT, k === 0 ? pop(u, 0.7) : 1, { w: 236 });
    const p0 = k >= 2 ? (k === 2 ? 3 + E(u, 0.6, 1.1) : 4) : 3;
    topic3(TX, TY, [p0, 2, 2], { per: (p) => (p === 0 ? { base: 85, labels: ['85', '86', '87', '88'], col: (i) => (i === 3 ? GOOD : ACC) } : {}) });
    if (k === 0) { say(160, 240, '싱글턴 빈 하나', fade(u, 1.2), { 'text-anchor': 'middle' }); sub(160, 266, '스레드 세이프 · 그대로 주입', fade(u, 1.4), { 'font-size': 13.5 }); return; }
    if (k === 1) { chip(160, 200, 'send(TOPIC, "order-1002", e)', INK, pop(u, 0.2), { w: 236 });
      card(450, 300, 280, 74, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 0.6) });
      mono(450, 292, 'murmur2("order-1002")', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      mono(450, 316, '& 0x7fffffff = 0x4fbd7c1c', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
      mono(450, 362, '% 3 = 0  → p0', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
      grow(520, 262, TX - 30, TY + 15, E(u, 1.5, 2.0), ACC);
      chip(160, 250, 'CompletableFuture 즉시 반환', INFO, pop(u, 1.8), { w: 236 });
      sub(780, 260, '같은 key 는 언제나 같은 파티션', fade(u, 2.2), { 'font-size': 14, fill: INK, 'font-weight': 700 }); sub(780, 284, '순서 보장은 그 파티션 안에서만', fade(u, 2.4), { 'font-size': 13.5 }); return; }
    if (k === 2) { dot([[290, 200], [TX + 3 * 49 + 23, TY + 15]], seg(u, 0.2, 0.8), ACC, 7);
      dot([[TX + 3 * 49 + 23, TY + 15], [290, 230]], seg(u, 1.2, 1.8), GOOD, 7);
      chip(160, 230, 'partition=0 offset=88', GOOD, pop(u, 1.8), { w: 236 });
      sub(780, 260, 'whenComplete(result, ex) 의 result', fade(u, 1.0), { 'font-size': 14 }); sub(780, 284, '→ RecordMetadata (offset 은 예시)', fade(u, 1.3), { 'font-size': 13.5 }); return; }
    if (k === 3) { chip(160, 200, 'send(TOPIC, "order-1003", e)', INK, 1, { w: 236 });
      dot([[290, 200], [TX + 2 * 49 + 23, TY + 59]], seg(u, 0.2, 0.8), WARN, 7); cross(TX + 2 * 49 + 23, TY + 59, 10, pop(u, 0.9));
      mono(TX + 80, TY + 150, 'order-1003 → p1 이었을 자리', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9) });
      chip(160, 250, 'ex != null', BAD, pop(u, 1.1), { w: 236 });
      fly(160, 290, 160, 370, seg(u, 1.5, 2.1), 'DLQ · retry 큐', { fill: BAD, stay: true });
      sub(700, 330, '콜백에서 예외를 삼키면 메시지가 조용히 사라진다', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    // k === 4: 트랜잭션
    zone(300, 250, 600, 140, 'executeInTransaction', { fill: 'none', stroke: INFO, dash: '6 5', color: INFO });
    chip(430, 300, 'send order-1004', ACC, pop(u, 0.2)); grow(510, 300, TX + 4 * 49, TY + 15, E(u, 0.4, 0.9), ACC);
    const cm = E(u, 1.2, 1.6); chip(640, 300, cm > 0.5 ? 'commit ✓' : 'commit 대기', cm > 0.5 ? GOOD : MUT, 1);
    sub(600, 350, '커밋 전까지 read_committed 컨슈머에겐 안 보인다', fade(u, 1.0), { 'font-size': 13.5 });
    dbIcon(160, 362, null, { s: 0.5 }); cross(160, 362, 14, pop(u, 1.8));
    sub(160, 412, 'DB 는 이 트랜잭션 밖', fade(u, 1.9), { 'font-size': 13.5, fill: BAD, 'font-weight': 700 }); }

  // ---------- 3. FastAPI + aiokafka ----------
  function loop(cx, cy, r, blocked, t) { el('circle', { cx, cy, r, fill: 'none', stroke: blocked ? BAD : ACC, 'stroke-width': 3, 'stroke-dasharray': '10 6', transform: blocked ? null : `rotate(${(t * 90) % 360} ${cx} ${cy})` });
    mono(cx, cy + 5, blocked ? '멈춤' : 'event loop', { 'font-size': 13.5, 'text-anchor': 'middle', fill: blocked ? BAD : ACC, 'font-weight': 700 }); }
  function s3(t, c) { const { k, u } = c;
    const TX = 330, TY = 100;
    app(130, 160, 200, 120, 'Spring', {});
    app(830, 200, 230, 300, 'FastAPI', { stroke: k >= 2 ? ACC : INK });
    topic3(TX, TY, [3, 3, 2], { slots: 5, w: 40 });
    if (k >= 4) part(TX, 300, '', k === 4 ? E(u, 0.8, 1.3) : 1, { slots: 5, w: 40, labels: ['1004'] });
    if (k >= 4) mono(TX - 30, 290, 'notifications', { 'font-size': 14.5, 'font-weight': 700 });
    if (k === 0) { loop(720 + 110, 170, 40, false, t); mono(830, 250, 'AIOKafkaConsumer', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) }); mono(830, 272, 'AIOKafkaProducer', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      loop(130, 330, 40, u > 1.2, t); mono(130, 400, 'kafka-python (동기)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.0) });
      say(250, 300, '동기 호출 하나가 루프 전체를 세운다', fade(u, 1.6), { fill: BAD }); return; }
    if (k === 1) { [['group_id', 'fastapi-order-consumer'], ['auto_offset_reset', 'earliest'], ['enable_auto_commit', 'True']].forEach(([a, b], i) => { mono(730, 120 + i * 50, a, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2 + i * 0.3) }); mono(730, 140 + i * 50, b, { 'font-size': 14, 'font-weight': 700, fill: i === 2 ? WARN : ACC, opacity: fade(u, 0.3 + i * 0.3) }); });
      sub(830, 300, '자동 커밋: 처리 전에 커밋되면', fade(u, 1.5), { 'font-size': 13.5, fill: WARN }); sub(830, 322, '죽었을 때 그 메시지는 잃는다', fade(u, 1.7), { 'font-size': 13.5, fill: WARN });
      sub(480, 280, 'Spring 의 order-processor 와 그룹이 다르다', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 }); sub(480, 304, '그룹마다 모든 메시지를 각자 받는다', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    if (k === 2) { loop(830, 170, 40, false, t);
      ['producer.start()', 'consumer.start()', 'create_task(_consume_loop)'].forEach((s, i) => chip(830, 236 + i * 38, s, i === 2 ? ACC : INK, pop(u, 0.3 + i * 0.4), { w: 210 }));
      [0, 1, 2].forEach((p) => grow(TX + 200, TY + 15 + p * 44, 715, 200, E(u, 1.4, 1.9), ACC));
      sub(500, 270, 'lifespan 이 yield 하면 HTTP 를 받기 시작한다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 3) { dot([[TX + 2 * 43 + 20, TY + 15], [715, 170]], seg(u, 0.2, 0.9), ACC, 7);
      card(830, 160, 200, 34, { rx: 6, text: 'order-1004 · 33000', fs: 13.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.9) });
      card(830, 230, 200, 40, { rx: 8, text: 'OrderEvent.model_validate', fs: 13.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 1.3) });
      check(830, 280, 11, pop(u, 1.8)); sub(830, 320, '모양이 틀리면 여기서 걸린다', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    if (k === 4) { dot([[715, 230], [TX + 20, 315]], seg(u, 0.2, 0.9), ACC, 7);
      chip(830, 230, 'send_and_wait', ACC, pop(u, 0.2), { w: 180 }); sub(830, 266, '브로커 응답까지 기다린다', fade(u, 0.5), { 'font-size': 13.5 });
      dot([[TX + 20, 315], [230, 180]], seg(u, 1.4, 2.0), INFO, 7); sub(130, 250, 'notifications 수신', fade(u, 2.0), { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
      sub(560, 380, '흐름이 양방향이 됐다 (key = order_id)', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k === 5: POST /orders → order-events
    card(830, 120, 190, 36, { rx: 8, fill: INK, stroke: 'none', text: 'POST /orders', fs: 14, mono: true, color: PANEL, s: pop(u, 0.2) });
    chip(830, 170, 'state["producer"]', MUT, pop(u, 0.5), { w: 180 });
    dot([[715, 170], [TX + 3 * 43 + 20, TY + 15]], seg(u, 0.8, 1.4), ACC, 7);
    dot([[TX, TY + 15], [230, 160]], seg(u, 1.6, 2.2), ACC, 7);
    sub(560, 260, 'order-9001 → p0 (murmur2 % 3)', fade(u, 1.3), { 'font-size': 14, fill: ACC, 'font-weight': 700 });
    sub(560, 284, 'Spring 이 FastAPI 가 만든 주문도 받는다', fade(u, 2.0), { 'font-size': 13.5 }); }

  // ---------- 4. Outbox ----------
  function dbBox(o) { o = o || {}; zone(30, 40, 380, 360, 'PostgreSQL (한 트랜잭션)', { fill: SOFT }); }
  function outRows(rows, x, y, o) { o = o || {};
    mono(x, y, 'outbox', { 'font-size': 14.5, 'font-weight': 700 });
    ['id', 'aggregate_id', 'published_at'].forEach((h, j) => mono(x + [0, 50, 200][j], y + 26, h, { 'font-size': 13.5, fill: MUT }));
    rows.forEach((r, i) => { const yy = y + 40 + i * 34, op = r.op ?? 1;
      el('rect', { x: x - 8, y: yy, width: 350, height: 28, rx: 5, fill: r.hot ? ACCBG : PANEL, stroke: r.dash ? MUT : GRID, 'stroke-dasharray': r.dash ? '4 3' : null, opacity: op });
      mono(x, yy + 19, '#' + r.id, { 'font-size': 14, opacity: op }); mono(x + 50, yy + 19, r.agg, { 'font-size': 14, 'font-weight': 700, opacity: op });
      mono(x + 200, yy + 19, r.pub || 'NULL', { 'font-size': 14, fill: r.pub ? GOOD : WARN, 'font-weight': 700, opacity: op }); }); }
  function s4(t, c) { const { k, u } = c;
    dbBox();
    const TX = 650, TY = 250;
    topic3(TX, TY, [3, 2, k >= 4 ? 2 + (k === 4 ? E(u, 1.0, 1.4) : 1) : 2], { slots: 5, w: 46, per: (p) => (p === 2 ? { col: (i) => (i === 2 ? GOOD : ACC) } : {}) });
    const relay = k >= 3; card(560, 110, 180, 56, { rx: 10, stroke: relay ? ACC : OFF, fill: relay ? ACCBG : PANEL, text: 'Outbox Relay', fs: 15, color: relay ? ACC : OFF, s: k === 3 ? pop(u, 0.2) : 1 });
    if (k === 0) { outRows([], 60, 90); ['id', 'aggregate_id', 'topic', 'payload', 'published_at'].forEach((s, i) => chip(150 + (i % 2) * 140, 160 + Math.floor(i / 2) * 44, s, i === 4 ? WARN : INK, pop(u, 0.3 + i * 0.25)));
      say(60, 330, 'published_at IS NULL = 아직 못 보낸 메시지', fade(u, 1.8), { fill: WARN }); return; }
    const ordersRow = (dash, op) => { mono(60, 260, 'orders', { 'font-size': 14.5, 'font-weight': 700 }); el('rect', { x: 52, y: 270, width: 350, height: 28, rx: 5, fill: PANEL, stroke: dash ? MUT : GRID, 'stroke-dasharray': dash ? '4 3' : null, opacity: op });
      mono(60, 289, 'order-2002 │ 18000', { 'font-size': 14, opacity: op }); };
    if (k === 1) { outRows([], 60, 90); ordersRow(true, pop(u, 0.4));
      sub(220, 330, '아직 커밋 전: 밖에서는 안 보인다', fade(u, 1.0), { 'font-size': 14 });
      sub(220, 356, '여기서 죽으면 롤백: 주문도 발행도 없다', fade(u, 1.6), { 'font-size': 13.5, fill: INK, 'font-weight': 700 }); return; }
    const cm = k === 2 ? E(u, 1.4, 1.8) > 0.5 : true;
    const rows = [{ id: 2, agg: 'order-2002', dash: !cm, op: k === 2 ? pop(u, 0.4) : 1, hot: k >= 3 && k <= 4 }, { id: 3, agg: 'order-2003', dash: !cm, op: k === 2 ? pop(u, 0.7) : 1, hot: k === 3 }];
    if (k === 5) rows[0].pub = u > 0.6 ? 'utcnow()' : null;
    outRows(rows, 60, 90); ordersRow(!cm, 1);
    if (k === 2) { chip(220, 360, cm ? 'COMMIT ✓ 둘 다 함께' : 'session.add(OutboxRow)', cm ? GOOD : INK, 1, { w: 220 }); return; }
    if (k === 3) { grow(470, 120, 410, 140, E(u, 0.3, 0.7), ACC); snippet(470, 160, ['WHERE published_at IS NULL', 'ORDER BY id LIMIT 100'], { fs: 13.5, op: fade(u, 0.6) });
      sub(560, 400, 'id 순서대로 읽어야 발행 순서가 지켜진다', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 4) { dot([[560, 138], [TX + 2 * 49 + 23, TY + 2 * 44 + 15]], seg(u, 0.3, 1.0), ACC, 7);
      chip(560, 190, 'key = order-2002', ACC, pop(u, 0.2)); sub(800, 210, 'murmur2 % 3 = p2 · send_and_wait', fade(u, 1.2), { 'font-size': 13.5, fill: ACC, 'font-weight': 700 }); return; }
    // k === 5
    grow(470, 120, 410, 140, E(u, 0.2, 0.6), GOOD); check(420, 146, 9, pop(u, 0.7));
    sub(560, 196, '#3 은 다음 루프에서', fade(u, 1.0), { 'font-size': 13.5 });
    sub(680, 216, '발행 뒤 커밋 전에 죽으면 다시 보낸다', fade(u, 1.6), { 'font-size': 13.5, fill: WARN, 'font-weight': 700 });
    say(480, 410, '발행 보장 = DB 커밋, 대신 at-least-once', fade(u, 2.1), { 'text-anchor': 'middle' }); }

  // ---------- 5. 멱등 Consumer ----------
  function s5(t, c) { const { k, u } = c;
    const TX = 90, TY = 90;
    part(TX, TY, 'p0', 2, { slots: 4, w: 120, labels: ['e-A1 (다시)', 'e-B2'], col: (i) => (i === 0 ? WARN : ACC), bg: (i) => (i === 0 ? WARNBG : ACCBG),
      mark: k >= 5 ? (k === 5 ? lerp(0, 2, E(u, 0.6, 1.2)) : 2) : 0, markCol: INFO });
    mono(TX + 260, TY - 14, 'order-events', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' });
    // DB: processed_events + accounts
    zone(480, 40, 450, 300, 'DB 트랜잭션', { fill: SOFT, stroke: k === 3 ? WARN : 'none', dash: '6 5' });
    mono(500, 92, 'processed_events (event_id PK)', { 'font-size': 14, 'font-weight': 700 });
    const B2 = k >= 2 ? (k === 2 ? E(u, 1.4, 1.8) : 1) : 0;
    [['e-A1', 1, null], ['e-B2', B2, k <= 3 ? 'dash' : null]].forEach(([id, op, d], i) => { if (op <= 0) return; el('rect', { x: 500, y: 104 + i * 34, width: 200, height: 28, rx: 5, fill: PANEL, stroke: d ? MUT : GRID, 'stroke-dasharray': d ? '4 3' : null, opacity: op });
      mono(512, 123 + i * 34, id, { 'font-size': 14, 'font-weight': 700, opacity: op }); });
    if (k === 0) { say(500, 220, '이미 처리한 event_id 가 남는다', fade(u, 0.8)); sub(640, 248, 'DB 가 UNIQUE 로 중복을 막아 준다', fade(u, 1.2), { 'font-size': 14 });
      sub(250, 200, '"조회 후 없으면 처리" 는 동시에 오면 둘 다 통과', fade(u, 1.8), { 'font-size': 13.5, fill: WARN }); return; }
    if (k === 1) { ['headers["event_id"]', 'payload["event_id"]'].forEach((s, i) => chip(220, 180 + i * 44, s, i ? MUT : ACC, pop(u, 0.3 + i * 0.5), { w: 200 }));
      sub(220, 290, '헤더에 없으면 본문에서', fade(u, 1.3), { 'font-size': 13.5 }); say(60, 340, 'event_id 가 멱등의 기준', fade(u, 1.8)); return; }
    if (k === 2) { dot([[TX + 60, TY + 30], [500, 118]], seg(u, 0.2, 0.8), WARN, 7); cross(720, 118, 10, pop(u, 0.9));
      mono(740, 123, 'IntegrityError → SKIP', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.0) });
      dot([[TX + 183, TY + 30], [500, 152]], seg(u, 1.0, 1.5), ACC, 7); check(720, 152, 9, pop(u, 1.7));
      mono(740, 157, 'INSERT 성공 → 처리', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k >= 3: 잔액 차감 · 커밋 순서
    mono(500, 214, 'accounts', { 'font-size': 14, 'font-weight': 700 });
    el('rect', { x: 500, y: 226, width: 300, height: 30, rx: 5, fill: PANEL, stroke: k === 3 ? MUT : GRID, 'stroke-dasharray': k === 3 ? '4 3' : null });
    mono(512, 246, 'balance -= 18000', { 'font-size': 14.5, 'font-weight': 700, fill: k === 3 ? INK : GOOD, opacity: k === 3 ? fade(u, 0.5) : 1 });
    if (k === 3) { sub(705, 300, '기록과 처리가 한 트랜잭션: 반쪽 상태가 없다', fade(u, 1.2), { 'font-size': 13.5 }); return; }
    const steps = [['③ session.commit()', GOOD], ['④ consumer.commit()', INFO]];
    steps.forEach(([s, col], i) => { const on = k === 4 ? i === 0 : true; chip(250, 200 + i * 50, s, on ? col : OFF, on ? (k === 4 && i === 0 ? pop(u, 0.3) : k === 5 && i === 1 ? pop(u, 0.3) : 1) : 1, { w: 210 }); });
    if (k === 4) { sub(705, 300, 'DB 확정 · offset 은 아직 그대로', fade(u, 0.8), { 'font-size': 14, fill: INK, 'font-weight': 700 });
      sub(250, 330, '여기서 죽으면 다시 받지만 UNIQUE 가 SKIP', fade(u, 1.6), { 'font-size': 13.5 }); return; }
    sub(250, 330, '실패하면 seek 로 그 offset 에 되감는다', fade(u, 1.4), { 'font-size': 13.5, fill: INK, 'font-weight': 700 });
    sub(250, 354, 'enable_auto_commit=False 여야 이 순서가 지켜진다', fade(u, 1.8), { 'font-size': 13.5 });
    say(480, 405, 'at-least-once + 멱등 = 결과는 한 번', fade(u, 2.2), { 'text-anchor': 'middle' }); }

  // ---------- 확인 문제 ----------
  const quiz = [
    { q: '@KafkaListener 메서드에서 handleOrder()가 예외를 던지면 offset은 어떻게 되는가?',
      o: ['ack.acknowledge()가 불리지 않아 커밋 위치가 그대로이고 같은 레코드를 다시 받는다', '자동으로 다음 offset이 커밋된다', '파티션이 영구히 멈춘다'], a: 0,
      why: '수동 커밋이라 ack가 불려야 42에서 43으로 넘어간다. 예외가 나면 커밋은 43에 머물고 에러 핸들러가 그 위치로 되감아 다시 준다.' },
    { q: 'KafkaTemplate으로 key="order-1002"를 파티션 3개짜리 토픽에 보내면 어느 파티션으로 가는가?',
      o: ['매번 돌아가며 다른 파티션', 'murmur2 해시를 3으로 나눈 나머지인 p0', '브로커가 비어 있는 파티션을 고른다'], a: 1,
      why: '기본 파티셔너는 murmur2(key) & 0x7fffffff % 3을 쓴다. order-1002는 0x4fbd7c1c라 나머지가 0이고, 같은 key는 언제나 p0으로 간다.' },
    { q: 'FastAPI 안에서 kafka-python 대신 aiokafka를 쓰는 이유는 무엇인가?',
      o: ['kafka-python은 Avro를 못 써서', 'aiokafka만 컨슈머 그룹을 지원해서', '동기 클라이언트가 이벤트 루프를 막아 다른 요청까지 멈추기 때문에'], a: 2,
      why: 'async 함수 안의 동기 호출은 그동안 이벤트 루프를 세운다. aiokafka는 await으로 기다리는 동안 다른 작업이 돌게 한다.' },
    { q: 'Outbox 패턴에서 orders와 outbox를 한 트랜잭션에 넣는 이유는 무엇인가?',
      o: ['Kafka 발행 속도를 높이려고', '주문 저장과 발행 예약이 함께 커밋되거나 함께 롤백되게 하려고', '토픽 파티션 수를 줄이려고'], a: 1,
      why: 'DB와 Kafka는 한 트랜잭션으로 묶이지 않는다. outbox 행을 같은 DB 트랜잭션에 넣으면 커밋된 주문만 Relay가 발행한다.' },
    { q: '멱등 Consumer에서 DB 커밋과 offset 커밋의 순서로 맞는 것은 무엇인가?',
      o: ['DB 커밋 뒤에 offset 커밋', 'offset 커밋 뒤에 DB 커밋', '순서는 상관없다'], a: 0,
      why: 'offset을 먼저 커밋하고 죽으면 처리하지 않은 메시지를 건너뛴다. DB를 먼저 커밋하면 다시 받아도 event_id UNIQUE가 걸러 낸다.' },
  ];

  // ---------- 정리 · 복습 ----------
  const summary = [
    'Spring은 @KafkaListener와 KafkaTemplate으로, FastAPI는 aiokafka로 같은 토픽을 다룬다.',
    '같은 key는 murmur2 해시로 늘 같은 파티션에 가고 순서는 그 파티션 안에서만 지켜진다.',
    'DB 저장과 발행은 Outbox 행을 같은 트랜잭션에 넣고 Relay가 보내는 식으로 묶는다.',
    '그래도 메시지는 두 번 올 수 있어 event_id UNIQUE로 거르고 DB 다음에 offset을 커밋한다.',
  ];
  const review = [
    { q: '결제 서비스가 같은 주문을 두 번 차감했다. 로그를 보니 Relay가 발행 직후 죽었다가 다시 떴다. 먼저 고칠 곳은?',
      o: ['Relay를 더 빠른 서버로 옮긴다', 'Consumer에 event_id UNIQUE 기록을 두고 같은 트랜잭션에서 처리한다', 'acks를 0으로 낮춘다'], a: 1,
      why: 'Outbox Relay는 발행 뒤 published_at을 커밋하기 전에 죽으면 다시 보낸다. at-least-once는 피할 수 없으니 받는 쪽이 멱등이어야 한다.' },
    { q: 'aiokafka Consumer에서 처리 실패 시 continue만 하고 넘어갔더니 실패한 메시지가 다시 오지 않았다. 왜 그런가?',
      o: ['다음 메시지를 커밋할 때 실패한 offset까지 함께 지나가서', 'Kafka가 실패 메시지를 지워서', 'event_id가 같아서'], a: 0,
      why: '컨슈머의 읽는 위치는 이미 앞으로 갔고, 다음 성공 뒤 commit()이 그 위치를 커밋한다. 다시 읽으려면 seek로 그 offset에 되감아야 한다.' },
    { q: '주문 상태 변경 이벤트의 순서가 뒤섞여 도착한다. 프로듀서는 key 없이 보내고 있었다. 먼저 바꿀 것은?',
      o: ['파티션 수를 늘린다', 'Consumer를 하나 더 띄운다', '주문 id를 key로 보내 같은 주문이 같은 파티션에 들어가게 한다'], a: 2,
      why: 'Kafka는 파티션 안에서만 순서를 지킨다. key가 같으면 같은 파티션으로 가므로 같은 주문의 이벤트는 들어온 순서대로 읽힌다.' },
  ];

  R.page({ title: 'Spring · FastAPI · Outbox 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
