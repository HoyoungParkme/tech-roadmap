/* I-2-1 Kafka vs RabbitMQ vs SQS vs Pulsar — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 별점은 페이지의 TOOLS(1~5), 강조 도구는 STEPS 의 focus · highlights, 매칭표는 scenarios 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, cross, check, clock, heat } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const T = () => (typeof TOOLS === 'undefined' ? null : TOOLS);
  const IDS = ['kafka', 'rabbitmq', 'sqs', 'pulsar'], SHORT = { kafka: 'Kafka', rabbitmq: 'RabbitMQ', sqs: 'SQS', pulsar: 'Pulsar' };
  const MET = [['throughput', '처리량'], ['latency', '지연'], ['durability', '내구성'], ['ecosystem', '생태계']];
  function curve(d, u, col, o) { o = o || {}; if (u <= 0) return; const p = el('path', { d, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 100, opacity: o.op ?? 1 });
    p.setAttribute('stroke-dasharray', u >= 1 ? (o.dash || 'none') : `${u * 100} 100`); }
  // 별점 막대: 도구 하나의 4지표 (점 5개씩)
  function stars(x, y, id, u, o) { o = o || {}; const t = T(); if (!t) return; const col = o.col || ACC;
    tx(x, y, SHORT[id], { 'font-size': 15, 'font-weight': 800, fill: col });
    MET.forEach(([m, n], i) => { const yy = y + 26 + i * 26, v = t[id][m];
      tx(x, yy + 5, n, { 'font-size': 13.5, fill: MUT });
      for (let j = 0; j < 5; j++) { const on = j < v, s = clamp(u * 8 - i - j * 0.3); el('circle', { cx: x + 70 + j * 18, cy: yy, r: 6 * (on ? Math.max(0.3, s) : 1), fill: on ? col : 'none', stroke: on ? 'none' : GRID, 'stroke-width': 1.5 }); } }); }
  const logCells = (x, y, n, o) => { o = o || {}; const w = o.w || 34, g = 4; for (let i = 0; i < n; i++) { const s = o.s ? o.s(i) : 1; if (s <= 0) continue;
      card(x + i * (w + g) + w / 2, y, w, 30, { rx: 4, stroke: o.col || ACC, fill: o.fill || ACCBG, sw: 1.6, s, text: o.text ? o.text(i) : String(i), fs: 13.5, mono: true, color: o.tcol, op: o.op ? o.op(i) : 1 }); }
    return (i) => x + i * (w + g) + w / 2; };

  // ================= 1. Kafka =================
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { tx(60, 48, 'topic orders', { 'font-size': 16, 'font-weight': 800 });
      [6, 4, 5].forEach((n, p) => { const y = 92 + p * 58; tx(110, y + 5, 'partition ' + p, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' });
        logCells(130, y, n, { s: (i) => pop(u, 0.2 + p * 0.25 + i * 0.12, 0.4) });
        grow(130 + n * 38 + 6, y, 130 + n * 38 + 40, y, seg(u, 1.2 + p * 0.2, 1.6 + p * 0.2), ACC); });
      tx(130, 290, 'append-only: 끝에만 붙고, 각 칸에 offset이 붙는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      card(740, 150, 180, 70, { rx: 10, stroke: INFO, text: 'consumer\n내 위치: p0 = 3', fs: 15, color: INFO, s: pop(u, 1.6) });
      el('path', { d: `M${130 + 3 * 38 + 10},${70} l7,10 l7,-10 z`, fill: INFO, opacity: fade(u, 1.8) });
      grow(650, 130, 290, 62, seg(u, 1.9, 2.5), INFO, { dash: '5 4' });
      tx(560, 360, 'offset은 브로커가 아니라 컨슈머(그룹)가 들고 다닌다 · pull 방식', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 1) { logCells(80, 110, 10, { s: (i) => pop(u, 0.1 + i * 0.05, 0.3) });
      [['그룹 A', 2, INFO], ['그룹 B', 8, WARN]].forEach(([n, at, col], j) => { const x = 80 + at * 38 + 17, s = fade(u, 0.8 + j * 0.4);
        el('path', { d: `M${x - 7},${j ? 145 : 75} l7,${j ? -10 : 10} l7,${j ? 10 : -10} z`, fill: col, opacity: s }); tx(x, j ? 166 : 66, n, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: s }); });
      tx(80, 214, '읽어도 안 사라진다 → 그룹마다 다른 속도로 다시 읽기', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      stars(620, 60, 'kafka', seg(u, 0.4, 2.0));
      tx(80, 280, '파티션을 늘리면 처리량이 늘어난다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
      tx(80, 306, 'replica 3 + acks=all + min.insync.replicas=2', { 'font-size': 14.5, fill: MUT, class: 'mono', opacity: fade(u, 2.0) });
      tx(80, 332, 'Connect · Streams · ksqlDB · Schema Registry', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { const X = logCells(90, 110, 8, {}); tx(90, 70, 'Kafka: 위치 하나를 커밋', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      const cm = Math.round(lerp(0, 5, E(u, 0.3, 1.3))); el('path', { d: `M${X(cm) - 19},${133} l0,14`, stroke: GOOD, 'stroke-width': 3 }); mono(X(cm) - 19, 166, 'commit ' + cm, { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700 });
      tx(560, 70, 'RabbitMQ: 메시지마다 ack / nack', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.8) });
      for (let i = 0; i < 6; i++) { const x = 580 + i * 50, a = 1.0 + i * 0.2; card(x, 110, 40, 30, { rx: 4, stroke: WARN, fill: WARNBG, text: 'm' + i, fs: 13.5, s: pop(u, a, 0.3) });
        if (i === 3) cross(x, 150, 7, pop(u, a + 0.3)); else check(x, 150, 7, pop(u, a + 0.3)); }
      [['복잡한 라우팅 (exchange 없음)', 0.9], ['운영: broker · KRaft · 파티션', 1.4], ['우선순위 · 단건 ack 모델 아님', 1.9]].forEach(([s, a], i) => { const y = 236 + i * 44; cross(110, y - 5, 8, pop(u, a)); tx(130, y, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); });
      stars(620, 230, 'rabbitmq', seg(u, 1.6, 2.6), { col: WARN }); return; }
    if (k === 3) { const ins = ['서비스 로그', 'DB 변경 (CDC)', '클릭 이벤트'], outs = ['실시간 분석', '검색 색인', '다른 서비스'];
      zone(330, 130, 300, 110, 'Kafka', { fill: ACCBG }); logCells(350, 196, 7, { s: (i) => pop(u, 0.2 + i * 0.1, 0.3) });
      ins.forEach((s, i) => { const y = 110 + i * 70; card(140, y, 190, 44, { rx: 10, text: s, fs: 15, s: pop(u, 0.3 + i * 0.2) }); for (let j = 0; j < 3; j++) dot([[236, y], [330, 185]], (t * 0.6 + j / 3 + i * 0.1) % 1, ACC, 4.5); });
      outs.forEach((s, i) => { const y = 110 + i * 70; card(820, y, 190, 44, { rx: 10, text: s, fs: 15, stroke: INFO, s: pop(u, 1.0 + i * 0.2) }); for (let j = 0; j < 3; j++) dot([[630, 185], [724, y]], (t * 0.6 + j / 3 + i * 0.1) % 1, INFO, 4.5); });
      tx(480, 350, '지나가는 데이터를 남겨 두고 여러 번 읽는다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(480, 378, '작업 큐가 아니라 데이터 파이프라인', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    // k4: 코드 한 컷 — group_id 를 바꾸면 처음부터 다시
    const X = logCells(90, 150, 10, {});
    pill(230, 60, 'producer.send("orders", …)', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
    const a = lerp(0, 9, E(u, 0.6, 2.4)); el('path', { d: `M${X(Math.round(a)) - 7},${122} l7,10 l7,-10 z`, fill: INFO }); mono(X(Math.round(a)), 114, 'order-worker → ' + Math.round(a), { 'font-size': 13.5, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle' });
    el('path', { d: `M${X(0) - 7},${178} l7,-10 l7,10 z`, fill: WARN, opacity: fade(u, 1.6) }); mono(X(0) + 10, 200, '새 group_id → 0 (earliest)', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) });
    tx(90, 270, 'msg.offset을 직접 본다 · 같은 토픽을 다른 그룹이 처음부터 다시 읽는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // ================= 2. RabbitMQ =================
  function exch(x, y, s, lab) { el('path', { d: `M${x},${y - 34 * s} L${x + 40 * s},${y} L${x},${y + 34 * s} L${x - 40 * s},${y} Z`, fill: WARNBG, stroke: WARN, 'stroke-width': 2.4 }); if (s > 0.5) tx(x, y + 5, lab, { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN }); }
  function queue(x, y, n, o) { o = o || {}; el('rect', { x, y: y - 22, width: 190, height: 44, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    tx(x + 6, y - 30, o.name || 'queue', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, class: 'mono' });
    for (let i = 0; i < n; i++) { const op = o.op ? o.op(i) : 1; if (op <= 0) continue; el('rect', { x: x + 160 - i * 34, y: y - 14, width: 28, height: 28, rx: 4, fill: o.col ? o.col(i) : WARN, opacity: 0.8 * op }); } }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { server(70, 200, 'producer', { s: 0.75 }); exch(300, 200, pop(u, 0.2), 'exchange');
      grow(120, 200, 256, 200, seg(u, 0.3, 0.8), INK);
      [[130, 'orders.kr'], [270, 'orders.us']].forEach(([y, n], i) => { curve(`M340,200 C390,200 400,${y} 470,${y}`, seg(u, 0.6 + i * 0.2, 1.1 + i * 0.2), WARN); tx(410, y + (i ? 22 : -14), 'binding', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9) });
        queue(480, y, i ? 2 : 3, { name: n, op: (j) => (i === 0 && j === 0 ? 1 - seg(u, 2.0, 2.4) : 1) }); });
      card(820, 130, 110, 44, { rx: 8, text: 'consumer', fs: 14.5, stroke: INFO, s: pop(u, 1.2) });
      fly(670, 130, 765, 130, seg(u, 1.4, 1.9), 'm', { fill: WARN });
      grow(765, 150, 680, 150, seg(u, 1.9, 2.2), GOOD); tx(720, 178, 'ack → 큐에서 삭제', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      tx(480, 360, 'Producer는 큐가 아니라 exchange에 보낸다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); return; }
    if (k === 1) { queue(80, 130, 4, { name: 'tasks', op: (i) => (i === 0 ? 1 - seg(u, 0.6, 1.0) : i === 1 ? 1 - seg(u, 1.2, 1.6) : 1), col: (i) => (i === 3 ? BAD : WARN) });
      check(330, 120, 9, pop(u, 0.8)); tx(346, 126, 'ack → 삭제', { 'font-size': 14.5, opacity: fade(u, 0.8) });
      cross(330, 156, 8, pop(u, 1.4)); tx(346, 162, 'nack → DLQ', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.4) });
      queue(80, 250, 1, { name: 'dead-letter', op: () => fade(u, 1.7), col: () => BAD });
      pill(230, 330, '우선순위 · TTL · DLQ · quorum queue', WARN, pop(u, 2.0), { fs: 14 });
      tx(80, 380, '지연 sub-ms ~ 수 ms', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 2.2) });
      stars(620, 80, 'rabbitmq', seg(u, 0.4, 2.0), { col: WARN }); return; }
    if (k === 2) { const t0 = T(); stars(80, 70, 'kafka', 1); stars(330, 70, 'rabbitmq', 1, { col: WARN });
      el('rect', { x: 78, y: 92, width: 210, height: 22, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.5) }); el('rect', { x: 328, y: 92, width: 210, height: 22, rx: 4, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 0.5) });
      queue(600, 110, 3, { name: 'orders.kr', op: (i) => (i === 0 ? 1 - seg(u, 0.8, 1.2) : 1) }); cross(860, 110, 10, pop(u, 1.5)); tx(700, 160, 'ack 한 메시지는 다시 못 읽는다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      [['보존용이 아니다 (큐는 비우는 것이 정상)', 1.6], ['일반 큐는 리플레이 불가 (Streams는 예외)', 1.9], ['클러스터·HA 설정이 까다롭다', 2.2]].forEach(([s, a], i) => { cross(90, 250 + i * 40, 8, pop(u, a)); tx(110, 255 + i * 40, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); }); return; }
    if (k === 3) { queue(80, 200, 5, { name: 'jobs', col: (i) => [WARN, INFO, ACC][i % 3] });
      ['이메일', 'PDF', '썸네일'].forEach((s, i) => { const y = 110 + i * 90; card(760, y, 150, 50, { rx: 10, text: 'worker ' + (i + 1), fs: 15, stroke: INFO, s: pop(u, 0.2 + i * 0.2) });
        fly(270, 200, 640, y, seg(u, 0.6 + i * 0.5, 1.2 + i * 0.5), s, { fill: [WARN, INFO, ACC][i], stay: true }); });
      tx(480, 380, '흐르는 데이터가 아니라 처리할 일감을 나눠 준다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    // k4: topic exchange 라우팅 규칙
    exch(300, 190, 1, 'orders'); queue(560, 120, 0, { name: 'orders.kr' });
    curve('M340,190 C420,190 440,120 556,120', 1, WARN); mono(445, 112, 'order.kr.*', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' });
    [['order.kr.created', true], ['order.us.created', false]].forEach(([key, ok], i) => { const a = 0.3 + i * 1.1, f = seg(u, a, a + 0.6);
      pill(110, 140 + i * 110, key, ok ? GOOD : BAD, pop(u, a - 0.2), { mono: true, fs: 13.5 });
      if (f > 0 && f < 1) fly(170, 140 + i * 110, 260, 190, f, '●', { fill: ok ? GOOD : BAD });
      if (u > a + 0.6) { if (ok) { fly(340, 190, 716, 120, seg(u, a + 0.6, a + 1.0), key, { fill: GOOD, mono: true, stay: true }); }
        else { cross(300, 260, 9); tx(320, 266, '맞는 binding 없음', { 'font-size': 14, fill: BAD, 'font-weight': 700 }); } } });
    tx(480, 360, '* 는 단어 하나에 맞는다 · delivery_mode=2는 디스크에 남기는 메시지', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.4) }); }

  // ================= 3. SQS =================
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(110, 180, 140, 50, { rx: 10, text: 'producer', fs: 15 }); card(850, 180, 140, 50, { rx: 10, text: 'worker', fs: 15, stroke: INFO });
      zone(300, 130, 360, 100, 'SQS 큐', { fill: SOFT });
      const vis = seg(u, 1.0, 1.4) > 0 && u < 2.4; [0, 1, 2].forEach((i) => { const x = 340 + i * 60; card(x, 190, 44, 34, { rx: 5, text: 'm' + i, fs: 13.5, mono: true, stroke: INFO, fill: INFOBG, s: pop(u, 0.2 + i * 0.15), op: i === 0 && vis ? 0.3 : i === 0 && u >= 2.4 ? 0 : 1 }); });
      pill(240, 110, 'send_message', ACC, pop(u, 0.3), { mono: true, fs: 13.5 }); pill(740, 110, 'receive_message', INFO, pop(u, 0.9), { mono: true, fs: 13.5 });
      if (vis) { clock(340, 270, 18, seg(u, 1.2, 2.3), WARN, null); tx(366, 276, 'visibility timeout (기본 30초) 동안 안 보임', { 'font-size': 14, fill: WARN, 'font-weight': 700 }); }
      pill(740, 260, 'delete_message', GOOD, pop(u, 2.2), { mono: true, fs: 13.5 });
      tx(480, 340, 'delete 하지 않으면 타임아웃 뒤 다시 보인다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.4) });
      tx(480, 380, 'Standard: at-least-once · 순서 보장 없음   /   FIFO: 순서 보장 · 중복 없는 처리', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); return; }
    if (k === 1) { zone(60, 70, 420, 280, 'AWS가 맡는 것', { fill: SOFT });
      [['브로커', 130], ['디스크', 200], ['클러스터 · 복제', 270]].forEach(([s, y], i) => { card(270, y, 260, 46, { rx: 10, text: s, fs: 15, stroke: GRID, color: MUT, s: pop(u, 0.2 + i * 0.2) }); el('line', { x1: 150, y1: y, x2: lerp(150, 390, seg(u, 0.8 + i * 0.2, 1.2 + i * 0.2)), y2: y, stroke: GOOD, 'stroke-width': 2.5 }); });
      card(640, 200, 120, 52, { rx: 10, text: 'SQS', fs: 16, stroke: ACC, color: ACC, s: pop(u, 1.2) });
      ['Lambda', 'SNS', 'EventBridge'].forEach((s, i) => { const y = 120 + i * 80; grow(700, 200, 790, y, seg(u, 1.5 + i * 0.2, 1.9 + i * 0.2), ACC); pill(860, y, s, ACC, pop(u, 1.8 + i * 0.2), { fs: 14 }); });
      tx(480, 395, '운영 부담 0 · 요청 수만큼 낸다 · 알아서 늘어난다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    if (k === 2) { // 보존 기간 자와 FIFO 상한
      const X = (d) => 120 + d * 50; el('line', { x1: X(0), y1: 120, x2: X(14), y2: 120, stroke: MUT, 'stroke-width': 2 });
      [0, 4, 7, 14].forEach((d) => { el('line', { x1: X(d), y1: 114, x2: X(d), y2: 126, stroke: MUT }); mono(X(d), 146, d + '일', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      el('rect', { x: X(0), y: 104, width: (X(14) - X(0)) * E(u, 0.2, 1.0), height: 12, rx: 3, fill: WARN, opacity: 0.7 });
      tx(X(0), 88, '보존: 기본 4일 · 최대 14일', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      tx(X(14) + 20, 125, '그 뒤 리플레이 불가', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(120, 220, 'FIFO 기본 모드', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(120, 252, '300 API/s × 배치 10건 = 3,000 msg/s', { 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.5) });
      tx(120, 280, '고처리량 모드를 켜면 리전별로 더 높다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      [['AWS 밖에서는 못 쓴다', 1.9], ['라우팅이 거의 없다', 2.1]].forEach(([s, a], i) => { cross(130, 330 + i * 38, 8, pop(u, a)); tx(150, 335 + i * 38, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); });
      stars(640, 200, 'sqs', seg(u, 1.4, 2.6), { col: INFO }); return; }
    if (k === 3) { card(120, 200, 120, 50, { rx: 10, text: 'SNS', fs: 16, stroke: WARN, s: pop(u, 0.2) });
      ['메일 큐', '정산 큐', '로그 큐'].forEach((s, i) => { const y = 110 + i * 90; grow(182, 200, 350, y, seg(u, 0.4 + i * 0.15, 0.8 + i * 0.15), WARN);
        card(430, y, 150, 46, { rx: 10, text: s, fs: 15, stroke: ACC, s: pop(u, 0.6 + i * 0.15) }); grow(508, y, 640, y, seg(u, 1.2 + i * 0.2, 1.6 + i * 0.2), ACC);
        card(720, y, 150, 46, { rx: 10, text: 'Lambda', fs: 15, stroke: INFO, color: INFO, s: pop(u, 1.4 + i * 0.2) }); });
      tx(480, 390, 'SNS → SQS 팬아웃, SQS가 Lambda를 바로 깨운다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    // k4: 롱 폴링
    ['queue_url = get_queue_url("orders")', 'send_message(MessageBody=…)', 'receive_message(WaitTimeSeconds=10)', 'delete_message(ReceiptHandle=…)'].forEach((s, i) => mono(80, 90 + i * 34, s, { 'font-size': 15, fill: i === 2 ? WARN : i === 3 ? GOOD : INK, 'font-weight': i >= 2 ? 700 : 400, opacity: fade(u, 0.2 + i * 0.25) }));
    clock(720, 170, 40, E(u, 0.6, 2.0), WARN, '최대 10초 기다림');
    tx(480, 300, '비어 있으면 10초까지 기다렸다가 돌려준다 (빈 응답이 준다)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    tx(480, 330, '브로커 주소·연결·채널 선언이 없다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  // ================= 4. Pulsar =================
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [['tenant', 'public', 90], ['namespace', 'default', 190], ['topic', 'orders', 290]].forEach(([a, b, x], i) => {
        card(190, 70 + i * 56, 170, 42, { rx: 8, text: b, fs: 15, mono: true, stroke: INFO, s: pop(u, 0.2 + i * 0.3) });
        tx(20, 75 + i * 56, a, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2 + i * 0.3) }); if (i) grow(190, 70 + (i - 1) * 56 + 22, 190, 70 + i * 56 - 22, seg(u, 0.3 + i * 0.3, 0.5 + i * 0.3), INFO); });
      zone(330, 60, 580, 120, 'Broker · 상태 없음 (계산)', { fill: SOFT }); [0, 1, 2].forEach((i) => card(440 + i * 170, 130, 130, 50, { rx: 10, text: 'broker ' + (i + 1), fs: 15, s: pop(u, 0.8 + i * 0.15) }));
      zone(330, 220, 580, 140, 'BookKeeper · 데이터 (저장)', { fill: ACCBG }); [0, 1, 2].forEach((i) => { card(440 + i * 170, 300, 130, 64, { rx: 10, stroke: ACC, s: pop(u, 1.4 + i * 0.15) }); for (let j = 0; j < 4; j++) el('rect', { x: 390 + i * 170 + j * 24, y: 290, width: 20, height: 20, rx: 3, fill: ACC, opacity: 0.6 * fade(u, 1.6 + j * 0.1) }); tx(440 + i * 170, 326, 'bookie ' + (i + 1), { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.6) }); });
      for (let i = 0; i < 3; i++) grow(440 + i * 170, 156, 440 + i * 170, 266, seg(u, 2.0, 2.4), MUT, { dash: '4 4' }); return; }
    if (k === 1) { const modes = [['Exclusive', 1], ['Failover', 2], ['Shared', 3], ['Key_Shared', 3]];
      modes.forEach(([n, nc], m) => { const x0 = 30 + m * 232, s = pop(u, 0.2 + m * 0.3); zone(x0, 60, 212, 300, n, { fill: SOFT, op: s });
        for (let i = 0; i < 6; i++) { const key = i % 2, to = m === 0 ? 0 : m === 1 ? 0 : m === 2 ? i % 3 : key ? 2 : 0, f = seg(u, 0.8 + m * 0.3 + i * 0.12, 1.3 + m * 0.3 + i * 0.12);
          const sx = x0 + 30, sy = 110 + i * 28, ex = x0 + 160, ey = 140 + to * 80; const col = m === 3 ? (key ? WARN : INFO) : ACC;
          if (f >= 1) { const nth = Array.from({ length: i }, (_, q) => q).filter((q) => (m < 2 ? 0 : m === 2 ? q % 3 : (q % 2) ? 2 : 0) === to).length; el('circle', { cx: ex - 28 - nth * 13, cy: ey, r: 5, fill: col, opacity: s }); continue; } el('circle', { cx: lerp(sx, ex, f), cy: lerp(sy, ey, f), r: 6, fill: col, opacity: s }); }
        for (let j = 0; j < 3; j++) { const standby = m === 1 && j === 1, none = j >= nc; if (none) continue; card(x0 + 170, 140 + j * 80, 64, 40, { rx: 8, text: standby ? '대기' : 'C' + (j + 1), fs: 14, stroke: standby ? OFF : INFO, color: standby ? MUT : INFO, s }); } });
      tx(480, 395, 'Shared = 큐처럼, Exclusive = 스트림처럼, Key_Shared = 같은 키는 같은 소비자', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    if (k === 2) { stars(60, 70, 'pulsar', seg(u, 0.2, 1.4), { col: INFO });
      zone(360, 60, 560, 150, '클러스터 하나를 팀별로 나눠 쓴다', { fill: SOFT });
      [['team-a/pay', INFO], ['team-b/log', WARN], ['team-c/ml', ACC]].forEach(([s, col], i) => card(460 + i * 170, 140, 150, 50, { rx: 10, text: s, fs: 14.5, mono: true, stroke: col, s: pop(u, 0.6 + i * 0.25) }));
      zone(360, 240, 560, 120, '리전 간 복제 (geo-replication)', { fill: ACCBG }); card(470, 310, 140, 44, { rx: 8, text: '서울', fs: 15, s: pop(u, 1.4) }); card(810, 310, 140, 44, { rx: 8, text: '프랑크푸르트', fs: 15, s: pop(u, 1.6) });
      for (let i = 0; i < 3; i++) dot([[540, 310], [740, 310]], (t * 0.7 + i / 3) % 1, ACC, 5); return; }
    if (k === 3) { tx(80, 70, 'Pulsar가 띄우는 것', { 'font-size': 15, 'font-weight': 800, fill: INFO }); tx(560, 70, 'Kafka 4.x가 띄우는 것', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      ['broker', 'bookie', 'ZooKeeper / etcd'].forEach((s, i) => card(180, 120 + i * 58, 200, 44, { rx: 8, text: s, fs: 15, stroke: INFO, s: pop(u, 0.2 + i * 0.25) }));
      ['broker', 'KRaft 컨트롤러'].forEach((s, i) => card(660, 120 + i * 58, 200, 44, { rx: 8, text: s, fs: 15, stroke: ACC, s: pop(u, 0.9 + i * 0.25) }));
      const t0 = T(); if (t0) { tx(80, 330, '생태계', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
        [['Pulsar', t0.pulsar.ecosystem, INFO], ['Kafka', t0.kafka.ecosystem, ACC]].forEach(([n, v, col], i) => { const y = 316 + i * 34; tx(160, y + 18, n, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: fade(u, 1.6) });
          el('rect', { x: 240, y: y + 4, width: 60 * v * E(u, 1.6, 2.4), height: 20, rx: 4, fill: col }); mono(250 + 60 * v, y + 19, '★' + v, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 2.3) }); }); }
      tx(560, 330, '비-JVM 클라이언트도 덜 여물었다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k4: 주소 해부 + Shared 구독
    const parts = [['persistent://', MUT], ['public', INFO], ['/default', WARN], ['/orders', ACC]]; let x = 120;
    parts.forEach(([s, col], i) => { mono(x, 90, s, { 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + i * 0.3) }); const w = tw(s, 20);
      if (i) tx(x + w / 2, 122, ['', 'tenant', 'namespace', 'topic'][i], { 'font-size': 13.5, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.3) }); x += w; });
    zone(120, 170, 300, 70, 'orders', { fill: SOFT }); for (let i = 0; i < 6; i++) el('rect', { x: 140 + i * 44, y: 200, width: 36, height: 28, rx: 4, fill: ACC, opacity: 0.7 });
    [0, 1, 2].forEach((j) => card(760, 180 + j * 70, 110, 44, { rx: 8, text: 'worker ' + (j + 1), fs: 14.5, stroke: INFO, s: pop(u, 1.0) }));
    for (let i = 0; i < 6; i++) { const f = seg(u, 1.2 + i * 0.2, 1.7 + i * 0.2); if (f > 0 && f < 1) el('circle', { cx: lerp(420, 700, f), cy: lerp(214, 180 + (i % 3) * 70, f), r: 7, fill: ACC }); }
    tx(560, 395, 'subscription_type=Shared → 메시지를 나눠 받는다 · acknowledge로 하나씩 확인', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  // ================= 5. 고르기 =================
  const CX5 = [520, 620, 720, 820];
  function matrix(c, o) { o = o || {}; const t0 = T(); if (!t0) return; const hl = c.beat.highlights || IDS, u = c.u;
    IDS.forEach((id, j) => { const on = hl.includes(id), x = CX5[j]; tx(x, 60, SHORT[id], { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: on ? INK : OFF });
      MET.forEach(([m, n], i) => { const v = t0[id][m], y = 76 + i * 34; el('rect', { x: x - 44, y, width: 88, height: 28, rx: 5, fill: ACC, opacity: (on ? 0.15 + 0.15 * v : 0.06) * (o.op ?? 1) });
        mono(x, y + 19, '★' + v, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? INK : OFF }); }); });
    MET.forEach(([m, n], i) => tx(CX5[0] - 56, 95 + i * 34, n, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' })); }
  function s5(t, c) { const { k, u } = c, sc = c.beat.scenarios || [], ps = (c.prev && c.prev.scenarios) || [];
    if (k === 0) { matrix(c); ['Kafka · 데이터 파이프라인의 척추', 'RabbitMQ · 작업 큐 + 복잡 라우팅', 'SQS · AWS 서버리스 기본값', 'Pulsar · 멀티테넌시 + 멀티리전'].forEach((s, i) => {
        tx(60, 260 + i * 36, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.35) }); }); return; }
    if (k === 4) { // 결정 트리
      const node = (x, y, s, col, a) => card(x, y, tw(s, 14.5) + 30, 40, { rx: 20, text: s, fs: 14.5, stroke: col || INK, color: col || INK, s: pop(u, a) });
      const leaf = (x, y, s, a) => card(x, y, 110, 38, { rx: 8, text: s, fs: 15, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, a) });
      node(480, 50, '스트림 + 재처리 필요?', INK, 0.2);
      grow(400, 70, 240, 120, seg(u, 0.5, 0.8), MUT); grow(560, 70, 680, 120, seg(u, 0.5, 0.8), MUT); sub(300, 92, 'yes', fade(u, 0.7)); sub(640, 92, 'no', fade(u, 0.7));
      node(240, 140, '멀티 리전?', INK, 0.8); node(680, 140, '라우팅 복잡?', INK, 0.8);
      grow(210, 160, 140, 220, seg(u, 1.1, 1.3), MUT); grow(270, 160, 340, 220, seg(u, 1.1, 1.3), MUT); leaf(130, 240, 'Pulsar', 1.3); leaf(350, 240, 'Kafka', 1.3);
      grow(650, 160, 580, 220, seg(u, 1.5, 1.7), MUT); grow(710, 160, 790, 220, seg(u, 1.5, 1.7), MUT); leaf(570, 240, 'RabbitMQ', 1.7); node(800, 240, 'AWS 환경?', INK, 1.7);
      grow(770, 260, 720, 320, seg(u, 2.0, 2.2), MUT); grow(830, 260, 880, 320, seg(u, 2.0, 2.2), MUT); leaf(710, 340, 'SQS', 2.2); leaf(880, 340, 'RabbitMQ', 2.2);
      [[140, 'yes'], [340, 'no'], [580, 'yes'], [790, 'no'], [720, 'yes'], [880, 'no']].forEach(([x, s], i) => sub(x + (i % 2 ? 22 : -22), i < 4 ? 196 : 296, s, fade(u, 1.2 + i * 0.15)));
      return; }
    matrix(c, { op: k === 3 ? 0.6 : 1 });
    if (k === 3) { [['Kafka', '비동기 작업 큐', '라우팅·ack 약함'], ['RabbitMQ', '이벤트 로그 저장소', '보존·재처리 약함'], ['SQS', '고처리량 스트림', '14일 보존 한계'], ['Pulsar', '단일 리전 작은 서비스', '운영 부담 과함']].forEach(([a, b, w], i) => {
        const y = 240 + i * 42, op = fade(u, 0.3 + i * 0.4); tx(60, y, a, { 'font-size': 15, 'font-weight': 800, opacity: op }); tx(160, y, '를 ' + b + ' 로', { 'font-size': 15, opacity: op });
        cross(410, y - 5, 7, op); tx(426, y, w, { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: op }); }); return; }
    sc.forEach((s, i) => { const y = 240 + i * 44, fresh = i >= ps.length, a = fresh ? 0.3 + (i - ps.length) * 0.5 : 0, op = fresh ? fade(u, a) : 1, j = IDS.indexOf(s.pick.toLowerCase());
      card(210, y, 330, 36, { rx: 8, text: s.tag, fs: 14.5, stroke: GRID, op });
      curve(`M376,${y} C${430},${y} ${CX5[j] - 40},${210} ${CX5[j]},${210}`, fresh ? seg(u, a + 0.2, a + 0.8) : 1, ACC, { sw: 2 }); });
    sc.forEach((s, i) => { const j = IDS.indexOf(s.pick.toLowerCase()); el('circle', { cx: CX5[j], cy: 214, r: 6, fill: ACC }); }); }

  const quiz = [
    { q: 'Kafka에서 한 번 읽은 메시지를 다른 컨슈머 그룹이 처음부터 다시 읽을 수 있는 이유는 무엇인가?',
      o: ['로그는 남고 그룹이 offset만 옮기기 때문에', '브로커가 그룹마다 메시지를 복사해 두기 때문에', '읽을 때마다 producer가 다시 보내기 때문에'], a: 0,
      why: '파티션은 append-only 로그이고 위치(offset)는 컨슈머 그룹이 들고 다닌다. 새 group_id에 earliest면 offset 0부터 다시 읽는다.' },
    { q: 'RabbitMQ에서 메시지마다 실패를 따로 처리하기 쉬운 이유는 무엇인가?',
      o: ['offset 하나만 커밋하기 때문에', '단건 ack/nack로 그 메시지만 재시도하거나 DLQ로 보낼 수 있어서', '메시지를 14일 동안 보존해서'], a: 1,
      why: 'RabbitMQ는 메시지 하나하나에 ack나 nack를 보낸다. nack한 메시지만 다시 넣거나 dead-letter 큐로 보낼 수 있다.' },
    { q: 'SQS에서 receive한 메시지를 delete하지 않고 visibility timeout이 지나면 어떻게 되나?',
      o: ['큐에서 영구히 사라진다', '다른 큐로 옮겨진다', '다시 보여서 다른 워커가 받을 수 있다'], a: 2,
      why: 'receive하면 잠시 안 보일 뿐 지워지지 않는다. 처리 뒤 delete를 불러야 사라지고, 아니면 타임아웃 뒤 다시 나타난다.' },
    { q: 'Pulsar에서 broker를 늘리고 줄이기가 쉬운 까닭은 무엇인가?',
      o: ['데이터가 BookKeeper에 있어 broker는 상태가 없기 때문에', 'ZooKeeper가 필요 없기 때문에', '토픽이 하나뿐이기 때문에'], a: 0,
      why: 'Pulsar는 계산(broker)과 저장(BookKeeper)을 떼어 놓았다. broker에 데이터가 없으니 옮길 것 없이 늘렸다 줄일 수 있다.' },
    { q: '이메일·PDF처럼 재시도와 우선순위가 필요한 작업 큐로 가장 알맞은 것은?',
      o: ['Kafka', 'RabbitMQ', 'Pulsar 멀티 리전 구성'], a: 1,
      why: '매칭표에서 작업 큐와 복잡 라우팅은 RabbitMQ 자리다. ack, DLQ, 우선순위가 이 용도에 맞춰져 있다.' },
  ];

  const summary = [
    'Kafka는 파티션마다 append-only 로그를 남기고 그룹이 offset을 들고 다녀 같은 데이터를 여러 번 읽는다.',
    'RabbitMQ는 exchange가 메시지를 큐로 라우팅하고 ack하면 지우므로 일감 배분에 강하고 보존에는 약하다.',
    'SQS는 운영할 것이 없는 관리형 큐로 Lambda와 잘 붙지만 보존은 최대 14일이고 AWS 밖으로 못 나간다.',
    'Pulsar는 broker와 BookKeeper를 나눠 멀티테넌시와 리전 간 복제에 강하지만 띄울 구성 요소가 많다.',
  ];
  const review = [
    { q: '초당 수십만 건의 클릭 로그를 모아 분석팀과 추천팀이 각자 다시 읽어야 한다. 무엇을 고를까?',
      o: ['RabbitMQ 작업 큐', 'Kafka', 'SQS FIFO 큐'], a: 1,
      why: '고처리량에 여러 그룹이 같은 데이터를 다시 읽어야 하므로 영속 로그인 Kafka 자리다. RabbitMQ 일반 큐는 ack하면 지워지고 SQS는 14일이 한계다.' },
    { q: 'Kafka를 작업 큐로 쓰다가 특정 메시지 하나만 다시 처리하고 싶어졌다. 어려운 이유는?',
      o: ['Kafka는 메시지를 디스크에 저장하지 않아서', '파티션 수를 바꿀 수 없어서', '커밋이 메시지 단위가 아니라 위치 하나라서'], a: 2,
      why: 'Kafka는 파티션마다 offset 하나를 커밋한다. 중간 메시지 하나만 실패로 표시하기 어렵고, 단건 ack/nack는 RabbitMQ 쪽 모델이다.' },
    { q: '서울과 프랑크푸르트에 같은 토픽을 두고 팀별로 클러스터를 나눠 쓰려 한다. 먼저 검토할 도구는?',
      o: ['Pulsar', 'SQS Standard 큐', 'RabbitMQ 단일 노드'], a: 0,
      why: '결정 트리에서 스트림이 필요하고 멀티 리전이면 Pulsar다. geo-replication과 tenant/namespace가 기본 기능이다.' },
  ];

  R.page({ title: '메시지 시스템 4종 비교', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
