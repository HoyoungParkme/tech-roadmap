/* V-1-2 Management API / rabbitmqctl — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 큐 값(orders.queue ready 1240 · unacked 12 · consumers 4, dlq.orders 37, reports.queue 500 …)은 페이지의 설명용 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, browser, cross, check, lock, terminal, hbar, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const num = (v) => Math.round(v).toLocaleString('en-US');
  const METH = { GET: INFO, PUT: GOOD, DELETE: BAD };
  // 큐 그림: 원통 안에 ready(회색) 와 unacked(주황) 칸. n 은 그릴 칸 수
  function queue(x, y, w, name, ready, unacked, o) { o = o || {};
    el('rect', { x, y: y - 22, width: w, height: 44, rx: 22, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.5, opacity: o.op ?? 1 });
    for (let i = 0; i < ready; i++) el('rect', { x: x + w - 30 - unacked * 20 - (i + 1) * 17, y: y - 10, width: 13, height: 20, rx: 3, fill: OFF, opacity: o.op ?? 1 });
    for (let i = 0; i < unacked; i++) el('rect', { x: x + w - 26 - i * 20 - 16, y: y - 10, width: 15, height: 20, rx: 3, fill: ACC, opacity: o.op ?? 1 });
    if (name) mono(x + 4, y - 32, name, { 'font-size': 15, 'font-weight': 800, opacity: o.op ?? 1, fill: o.stroke || INK }); }
  function exch(cx, cy, o) { o = o || {}; const r = o.r || 26, pts = [0, 1, 2, 3, 4, 5].map((i) => [cx + r * Math.cos(Math.PI / 3 * i), cy + r * Math.sin(Math.PI / 3 * i)]);
    el('polygon', { points: pts.map((p) => p.join(',')).join(' '), fill: PANEL, stroke: INK, 'stroke-width': 2.5, opacity: o.op ?? 1 }); }
  function nodeBox(cx, cy, name, o) { o = o || {}; server(cx, cy, null, { s: o.s || 0.8, lamp: o.lamp || ACC, op: o.op, stroke: o.stroke }); if (name) lbl(cx, cy + 56 * (o.s || 0.8) + 10, name, o.op); }
  function method(cx, cy, m, sc) { pill(cx, cy, m, METH[m], sc, { fs: 14, mono: true, fill: PANEL }); }

  // ---------- 1. Management 플러그인 ----------
  function s1(t, c) { const { k, u } = c;
    nodeBox(150, 190, 'rabbit-1');
    // 포트 두 개
    el('line', { x1: 196, y1: 150, x2: 300, y2: 150, stroke: INK, 'stroke-width': 3 }); card(372, 150, 140, 36, { rx: 8, text: ':5672 AMQP', fs: 14.5, mono: true });
    const open = k >= 2 || (k === 1 && u > 1.4);
    el('line', { x1: 196, y1: 230, x2: 300, y2: 230, stroke: open ? ACC : OFF, 'stroke-width': 3, 'stroke-dasharray': open ? null : '6 6' });
    card(372, 230, 140, 36, { rx: 8, text: ':15672', fs: 15, mono: true, stroke: open ? ACC : OFF, color: open ? ACC : MUT, dash: open ? null : '6 5', fill: open ? ACCBG : PANEL });
    if (!open) lock(372 + 84, 230, true, MUT, 0.6);
    if (k === 0) { sub(372, 190, '메시지 송수신 전용', 1);
      browser(640, 120, 170, 96, '웹 UI · 사람', { op: 0.4 + 0.6 * fade(u, 0.4), stroke: OFF }); card(640, 300, 200, 70, { rx: 10, text: 'curl /api/...\n스크립트', fs: 14.5, stroke: OFF, color: MUT, op: fade(u, 0.8) });
      [[570, 140], [540, 290]].forEach(([x, y], i) => el('line', { x1: 444, y1: 230, x2: x, y2: y, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 6', opacity: fade(u, 0.5 + i * 0.4) }));
      pill(850, 210, 'Basic Auth', WARN, pop(u, 1.6), { fs: 14 }); sub(850, 244, '사용자:비밀번호로 인증', fade(u, 1.9)); return; }
    if (k === 1) { terminal(520, 40, 420, 110, ['$ rabbitmq-plugins enable rabbitmq_management', '$ rabbitmq-plugins list -e', ['[E*] rabbitmq_management', '#4ade80']], lerp(0, 3, E(u, 0.2, 1.3)));
      if (open) { const g = E(u, 1.5, 2.1); grow(444, 230, 560, 200, g, ACC); grow(444, 230, 560, 300, g, ACC);
        card(680, 200, 230, 46, { rx: 10, text: '웹 UI (사람)', fs: 15, stroke: ACC, s: pop(u, 1.8) }); card(680, 300, 230, 46, { rx: 10, text: 'HTTP API /api/…', fs: 15, mono: true, stroke: ACC, s: pop(u, 1.9) });
        note(570, 370, '하나를 켜면 둘 다 열리고 같은 데이터를 본다', fade(u, 2.2), { 'font-size': 14.5 }); } return; }
    if (k === 2) { grow(444, 230, 560, 230, E(u, 0.1, 0.5), ACC); method(500, 196, 'GET', pop(u, 0.2)); mono(560, 200, '/api/overview', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      card(740, 285, 360, 106, { rx: 8, fill: SOFT, stroke: GRID, s: pop(u, 0.8) });
      ['{ "rabbitmq_version": "…",', '  "message_stats": { … },', '  "queue_totals": { … } }'].forEach((s, i) => mono(574, 262 + i * 24, s, { 'font-size': 14, opacity: fade(u, 0.9 + i * 0.2) }));
      person(620, 372, null, { s: 0.5, op: fade(u, 1.6) }); mono(650, 378, 'guest@원격', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.6) });
      cross(780, 372, 10, pop(u, 1.9)); tx(800, 378, '로그인 거부', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(740, 412, 'guest 는 localhost 에서만 통한다', fade(u, 2.2)); return; }
    if (k === 3) { grow(444, 230, 520, 230, E(u, 0.1, 0.4), ACC); method(500, 80, 'GET', pop(u, 0.2));
      mono(540, 84, '/api/health/checks/virtual-hosts', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3) });
      card(620, 170, 160, 58, { rx: 10, text: '200 OK', fs: 18, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.7) }); sub(620, 216, 'vhost 모두 실행 중', fade(u, 0.9));
      card(820, 170, 160, 58, { rx: 10, text: '503', fs: 18, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.1) }); sub(820, 216, '하나라도 멈춤', fade(u, 1.3));
      const g = fade(u, 1.6); mono(540, 300, '/api/aliveness-test', { 'font-size': 15, fill: MUT, opacity: g, 'text-decoration': 'line-through' });
      pill(840, 296, 'deprecated · 4.1 부터 no-op', WARN, pop(u, 1.8), { fs: 13.5 }); sub(700, 340, '옛 자료의 aliveness-test 는 이제 쓰지 않는다', fade(u, 2.1)); return; }
    // k4: 세 자리에서 쓴다
    [['배포 파이프라인', '준비 상태 확인', 70], ['로드밸런서', '/api/health/checks', 190], ['모니터링 에이전트', '/api/overview 폴링', 310]].forEach(([a, b, y], i) => {
      const sc = pop(u, 0.2 + i * 0.45); card(760, y, 280, 62, { rx: 10, stroke: ACC, s: sc });
      tx(640, y - 4, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.45) }); mono(640, y + 20, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.45) });
      grow(612, y, 448, 230, E(u, 0.5 + i * 0.45, 0.9 + i * 0.45), ACC); dot([[612, y], [448, 230]], seg(u, 1.0 + i * 0.4, 1.8 + i * 0.4), ACC, 5); }); }

  // ---------- 2. HTTP API REST ----------
  const QS = [['orders.queue', 1240, 12, 4], ['payments.queue', 0, 0, 2], ['dlq.orders', 37, 0, 0]];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { [['GET', '조회', 'monitoring 태그면 된다'], ['PUT', '생성', 'management 이상'], ['DELETE', '삭제', 'management 이상']].forEach(([m, a, b], i) => {
        const y = 70 + i * 56; method(110, y, m, pop(u, 0.2 + i * 0.3)); tx(180, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); tx(240, y + 6, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      const segs = [['/api/queues/', INK], ['%2F', ACC], ['/', INK], ['tmp.check', INFO]], x0 = 120, fs = 22; let x = x0;
      const fu = fade(u, 1.3); segs.forEach(([s, col]) => { mono(x, 300, s, { 'font-size': fs, 'font-weight': 800, fill: col, opacity: fu }); x += tw(s, fs); });
      const xv = x0 + tw('/api/queues/', fs), xn = xv + tw('%2F/', fs);
      grow(xv + 20, 340, xv + 20, 318, E(u, 1.7, 2.0), ACC); tx(xv + 20, 362, 'vhost "/" 는 %2F', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      grow(xn + 50, 340, xn + 50, 318, E(u, 1.9, 2.2), INFO); tx(xn + 50, 362, '큐 이름', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 1) { method(90, 50, 'GET', 1); mono(140, 55, '$BASE/queues  →  JSON 배열', { 'font-size': 15, 'font-weight': 700 });
      ['name', 'ready', 'unacked', 'consumers'].forEach((s, j) => tx([380, 560, 680, 800][j], 100, s, { 'font-size': 14, fill: MUT, 'text-anchor': j ? 'middle' : 'start', class: 'mono' }));
      QS.forEach(([n, r, un, cs], i) => { const y = 150 + i * 80, a = 0.3 + i * 0.5;
        queue(80, y, 260, null, Math.round(Math.min(10, r ? 2 + Math.log10(r + 1) * 2.4 : 0) * E(u, a, a + 0.6)), Math.min(3, un ? 3 : 0), { op: fade(u, a) });
        mono(380, y + 6, n, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, a) });
        [r, un, cs].forEach((v, j) => mono([560, 680, 800][j], y + 6, num(v), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: j === 0 && v > 0 ? WARN : j === 2 && v === 0 ? BAD : INK, opacity: fade(u, a + 0.3) })); });
      sub(80, 408, '칸 수는 개수를 줄여 그린 것', 1, { 'text-anchor': 'start' }); return; }
    if (k === 2) { // 연결 하나 안에 채널 여러 개, exchange → 큐 바인딩
      card(110, 200, 130, 220, { rx: 12, stroke: INK, text: '앱', fs: 18 }); nodeBox(800, 200, 'broker', { s: 0.7 });
      el('rect', { x: 175, y: 160, width: 570, height: 80, rx: 40, fill: SOFT, stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.2) });
      tx(460, 150, 'connection (TCP 하나)', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      for (let i = 0; i < 3; i++) { const y = 180 + i * 20; grow(190, y, 730, y, E(u, 0.4 + i * 0.25, 1.1 + i * 0.25), ACC, { plain: true, sw: 3 }); dot([[190, y], [730, y]], ((t * 0.5 + i / 3) % 1), ACC, 4); }
      tx(460, 262, 'channel 여러 개가 연결 하나를 나눠 쓴다', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      [['connections', '11'], ['channels', '19'], ['bindings', '7']].forEach(([a, b], i) => { const x = 210 + i * 220, sc = fade(u, 1.5 + i * 0.25);
        mono(x, 340, a, { 'font-size': 15, fill: MUT, opacity: sc }); mono(x, 372, b, { 'font-size': 26, 'font-weight': 800, opacity: sc }); });
      sub(480, 410, '연결·채널이 계속 늘면 누수, 메시지가 사라지면 bindings 부터', fade(u, 2.2)); return; }
    if (k === 3) { method(90, 60, 'PUT', 1); mono(140, 65, '$BASE/queues/%2F/tmp.check', { 'font-size': 15, 'font-weight': 700 });
      card(250, 180, 360, 80, { rx: 8, fill: SOFT, stroke: GRID, s: pop(u, 0.3) });
      mono(90, 172, "-d '{\"durable\":true,", { 'font-size': 14.5, opacity: fade(u, 0.4) }); mono(90, 196, "     \"auto_delete\":false}'", { 'font-size': 14.5, opacity: fade(u, 0.5) });
      grow(440, 180, 560, 180, E(u, 0.8, 1.2), GOOD);
      const s = pop(u, 1.2); queue(590, 180, 300, 'tmp.check', 0, 0, { op: clamp(s), stroke: GOOD }); pill(740, 240, 'durable: true', GOOD, pop(u, 1.6), { mono: true, fs: 13.5 });
      note(90, 320, '본문은 작은따옴표로 감싸야 셸이 JSON 을 그대로 넘긴다', fade(u, 2.0), { 'font-size': 14.5 }); note(90, 350, '만들고 지우는 호출은 management 태그와 vhost 권한이 필요하다', fade(u, 2.3), { 'font-size': 14.5, fill: WARN }); return; }
    if (k === 4) { method(90, 60, 'DELETE', 1); mono(165, 65, '$BASE/queues/%2F/tmp.check', { 'font-size': 15, 'font-weight': 700 });
      const g = E(u, 0.4, 1.2); queue(500, 120, 300, 'tmp.check', 0, 0, { op: 1 - g * 0.7, stroke: BAD }); if (g > 0) cross(650, 120, 16, pop(u, 0.6));
      method(90, 230, 'DELETE', pop(u, 1.1)); mono(165, 235, '$BASE/connections/some-conn-name', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.1) });
      const cut = E(u, 1.5, 1.9); el('line', { x1: 160, y1: 320, x2: 470 - 60 * cut, y2: 320, stroke: INFO, 'stroke-width': 6 }); el('line', { x1: 530 + 60 * cut, y1: 320, x2: 840, y2: 320, stroke: INFO, 'stroke-width': 6 });
      card(120, 320, 80, 44, { rx: 8, text: '앱', fs: 15 }); nodeBox(870, 320, null, { s: 0.55 }); if (cut > 0) cross(500, 320, 12, cut);
      note(300, 395, '되돌릴 수 없다 · 이름을 먼저 확인', fade(u, 2.1), { fill: BAD }); return; }
    // k5: 응답 줄이기
    lbl(220, 60, 'GET /api/queues', 1, { class: 'mono' }); lbl(720, 60, '?columns=name,messages_ready', 1, { class: 'mono' });
    for (let i = 0; i < 14; i++) { const s = clamp(E(u, 0.2, 1.2) * 14 - i); el('rect', { x: 110, y: 82 + i * 20, width: 220, height: 14, rx: 3, fill: OFF, opacity: s }); }
    sub(220, 380, '큐마다 필드 수십 개', fade(u, 0.8));
    for (let i = 0; i < 3; i++) { const s = clamp(E(u, 1.2, 1.8) * 3 - i); el('rect', { x: 610, y: 82 + i * 20, width: 220, height: 14, rx: 3, fill: ACC, opacity: s }); }
    grow(360, 200, 580, 140, E(u, 1.0, 1.4), ACC); sub(720, 170, '서버가 필드를 줄여 보낸다', fade(u, 1.6));
    terminal(560, 220, 340, 140, ["$ curl … | jq '.[].name'", '"orders.queue"', '"payments.queue"', '"dlq.orders"'], lerp(0, 4, E(u, 1.8, 2.6)), { fs: 13.5 }); }

  // ---------- 3. JSON 응답 읽기 ----------
  function jsonCard(x, y, lines, hi, u) { card(x + 150, y + lines.length * 12 + 10, 300, lines.length * 24 + 24, { rx: 8, fill: SOFT, stroke: GRID });
    lines.forEach((s, i) => { const on = hi.includes(i); if (on) el('rect', { x: x + 6, y: y + 12 + i * 24, width: 288, height: 22, rx: 4, fill: ACCBG, opacity: fade(u, 0.2 + i * 0.1) });
      mono(x + 14, y + 28 + i * 24, s, { 'font-size': 14, 'font-weight': on ? 800 : 500, fill: on ? INK : MUT }); }); }
  const J = ['"name": "orders.queue"', '"vhost": "/"', '"durable": true', '"state": "running"', '"messages": 1252', '"messages_ready": 1240', '"messages_unacknowledged": 12', '"consumers": 4', '"consumer_utilisation": 0.87', 'publish_details.rate: 42.0', 'ack_details.rate: 40.5', 'deliver_get_details.rate: 40.6'];
  function s3(t, c) { const { k, u } = c;
    const hi = [[0, 1, 2, 3], [4, 5, 6], [7, 8], [9, 10, 11], [5, 6, 7, 9, 10]][k];
    jsonCard(20, 40, J, hi, u);
    if (k === 0) { const sc = pop(u, 0.6); queue(400, 180, 360, 'orders.queue', 8, 2, { op: clamp(sc) });
      pill(470, 250, 'vhost /', INK, pop(u, 1.0), { mono: true, fs: 13.5 }); pill(600, 250, 'durable', GOOD, pop(u, 1.3), { fs: 13.5 }); pill(720, 250, 'running', GOOD, pop(u, 1.6), { fs: 13.5 });
      note(400, 320, '대상부터 확정한다 · 큐 자체는 정상', fade(u, 2.0)); return; }
    if (k === 1) { queue(380, 150, 520, 'orders.queue', 20, 3, {});
      sub(560, 200, 'ready (대기)', 1, { fill: INK, 'font-weight': 700 }); sub(840, 200, 'unacked', 1, { fill: ACC, 'font-weight': 700 });
      const a = tween(0, 1240, u, 1.2), b = tween(0, 12, u, 1.2);
      mono(380, 270, 'messages = ready + unacked', { 'font-size': 15, fill: MUT }); mono(380, 310, `${num(a + b)} = ${num(a)} + ${num(b)}`, { 'font-size': 24, 'font-weight': 800 });
      note(380, 360, 'ready 1240 은 아직 아무도 가져가지 않았다', fade(u, 1.8), { fill: WARN }); note(380, 388, 'unacked 12 는 전달됐지만 ack 전', fade(u, 2.1), { fill: ACC }); return; }
    if (k === 2) { queue(380, 110, 300, 'orders.queue', 10, 3, {}); for (let i = 0; i < 4; i++) person(730 + (i % 2) * 70, 80 + Math.floor(i / 2) * 70, null, { s: 0.6 * pop(u, 0.2 + i * 0.15) });
      mono(380, 240, 'consumers 4', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.7) });
      tx(380, 290, 'consumer_utilisation', { 'font-size': 15, fill: MUT, class: 'mono' }); const v = tween(0, 0.87, u, 1.2);
      hbar(380, 304, 380, v, 1, { col: WARN, text: v.toFixed(2), h: 22 }); note(380, 370, '1 에 가까울수록 쉴 틈이 없다 · 0 이면 즉시 경보', fade(u, 1.9)); return; }
    if (k === 3) { queue(470, 150, 300, null, 10, 2, {});
      for (let i = 0; i < 6; i++) dot([[360, 150], [470, 150]], ((t * 0.84 + i / 6) % 1), ACC, 5);
      for (let i = 0; i < 5; i++) dot([[770, 150], [880, 150]], ((t * 0.81 + i / 5) % 1), INFO, 5);
      mono(360, 110, 'publish 42.0/s', { 'font-size': 15, 'font-weight': 800, fill: ACC }); mono(770, 110, 'ack 40.5/s', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      const d = tween(0, 1.5, u, 1.4); mono(400, 260, `42.0 − 40.5 = ${d.toFixed(1)}/s`, { 'font-size': 22, 'font-weight': 800, fill: WARN });
      note(400, 300, '초당 1.5건씩 ready 가 늘어난다 (1분이면 90건)', fade(u, 1.7)); note(400, 330, 'deliver 40.6 과 ack 40.5 는 거의 같다 · 처리는 정상', fade(u, 2.1), { fill: MUT, 'font-size': 14 }); return; }
    // k4: 판단표 → 컨슈머 +1
    [['ready ↑', '못 따라온다 → 스케일아웃', WARN, true], ['unacked ↑', 'hang · prefetch 과다', MUT, false], ['consumers 0', '소비자 없음 → 경보', MUT, false]].forEach(([a, b, col, on], i) => {
      const y = 80 + i * 60; card(620, y, 560, 48, { rx: 10, stroke: on ? WARN : GRID, sw: on ? 2.5 : 1.5, s: pop(u, 0.2 + i * 0.25) });
      mono(370, y + 6, a, { 'font-size': 15, 'font-weight': 800, fill: on ? WARN : INK, opacity: fade(u, 0.3 + i * 0.25) }); tx(510, y + 6, b, { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.25) }); });
    for (let i = 0; i < 5; i++) { const sc = i < 4 ? 1 : pop(u, 1.6); person(400 + i * 80, 330, null, { s: 0.65 * sc, stroke: i === 4 ? GOOD : INK }); }
    pill(720, 392, '컨슈머 +1', GOOD, pop(u, 1.9), { fs: 15 }); }

  // ---------- 4. rabbitmqctl ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { nodeBox(480, 200, 'rabbit-1');
      person(110, 120, '원격 노트북', { s: 0.8 }); grow(150, 125, 420, 180, E(u, 0.2, 0.9), INFO); pill(280, 120, 'HTTP :15672', INFO, pop(u, 0.6), { mono: true, fs: 13.5 });
      card(860, 200, 150, 60, { rx: 10, text: '같은 호스트', fs: 15, stroke: ACC, s: pop(u, 1.0) }); grow(785, 200, 540, 200, E(u, 1.1, 1.7), ACC);
      pill(660, 160, 'rabbitmqctl', ACC, pop(u, 1.3), { mono: true, fs: 14 }); el('circle', { cx: 660, cy: 240, r: 15, fill: WARNBG, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.6) });
      tx(684, 246, 'Erlang 쿠키', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      zone(140, 300, 330, 100, '두 길 다 되는 것', { fill: SOFT, op: fade(u, 1.8) }); tx(160, 360, 'list_queues · 연결 조회', { 'font-size': 15, opacity: fade(u, 1.9) });
      zone(500, 300, 330, 100, 'ctl 쪽이 자연스러운 것', { fill: ACCBG, op: fade(u, 2.0), color: ACC }); tx(520, 360, 'status · purge · policy · 사용자', { 'font-size': 15, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { const pos = [[260, 110], [160, 280], [360, 280]];
      pos.forEach(([x, y], i) => { nodeBox(x, y, 'rabbit-' + (i + 1), { s: 0.6, op: fade(u, 0.2 + i * 0.25) }); });
      [[230, 168, 175, 250], [205, 285, 315, 285], [345, 250, 290, 168]].forEach(([a, b, c2, d], i) => grow(a, b, c2, d, E(u, 0.8 + i * 0.2, 1.2 + i * 0.2), MUT, { plain: true }));
      terminal(500, 50, 430, 300, ['$ rabbitmqctl cluster_status', ['  3 nodes · all running', '#4ade80'], '$ rabbitmqctl list_queues name messages consumers', '  orders.queue    1252  4', '  payments.queue     0  2', '  dlq.orders        37  0'], lerp(0, 6, E(u, 0.4, 2.3)), { fs: 13.5 });
      note(500, 390, '무엇을 바꾸기 전에 list 로 대상을 눈으로 본다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 2) { const cut = E(u, 0.4, 0.9);
      card(90, 110, 80, 44, { rx: 8, text: '앱', fs: 15 }); el('line', { x1: 130, y1: 110, x2: 330 - 40 * cut, y2: 110, stroke: INFO, 'stroke-width': 6 }); el('line', { x1: 370 + 40 * cut, y1: 110, x2: 520, y2: 110, stroke: INFO, 'stroke-width': 6 }); if (cut > 0) cross(350, 110, 12, cut);
      mono(560, 116, 'close_connection "…" "ops shutdown"', { 'font-size': 14.5, 'font-weight': 700 });
      const pu = E(u, 1.2, 2.0); queue(90, 280, 420, 'tmp.check', Math.round(16 * (1 - pu)), 0, {});
      for (let i = 0; i < 6; i++) { const f = seg(u, 1.2 + i * 0.1, 1.9 + i * 0.1); if (f > 0 && f < 1) el('rect', { x: 200 + i * 40, y: 300 + f * 90, width: 13, height: 20, rx: 3, fill: BAD, opacity: 1 - f }); }
      mono(560, 286, 'purge_queue tmp.check', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.1) });
      card(740, 370, 260, 50, { rx: 10, text: '둘 다 복구가 없다', fs: 16, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 2.1) }); return; }
    if (k === 3) { mono(80, 70, 'set_policy orders-guard', { 'font-size': 16, 'font-weight': 800 }); pill(410, 66, '"^orders"', ACC, pop(u, 0.2), { mono: true, fs: 15 });
      [['orders.queue', true], ['payments.queue', false], ['dlq.orders', false]].forEach(([n, ok], i) => { const y = 150 + i * 80, a = 0.5 + i * 0.4;
        queue(80, y, 300, null, 4, 0, { op: fade(u, a - 0.3), stroke: ok ? ACC : INK }); mono(400, y + 6, n, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, a) });
        (ok ? check : cross)(590, y, 11, pop(u, a + 0.2)); });
      card(780, 150, 260, 76, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 1.8) }); mono(670, 144, 'message-ttl 60000', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.9) }); mono(670, 170, 'max-length 10000', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.9) });
      grow(650, 150, 620, 150, E(u, 1.9, 2.2), ACC); sub(780, 210, 'priority 10 · 높은 정책이 이긴다', fade(u, 2.2));
      sub(480, 400, 'dlq.orders 는 orders 로 시작하지 않아 빠진다', fade(u, 2.4)); return; }
    if (k === 4) { [['app_user', 'management', ['.*', '.*', '.*'], ACC, 0.2], ['monitor', 'monitoring', null, INFO, 1.0]].forEach(([n, tag, perm, col, a], i) => {
        const x = 250 + i * 460, sc = pop(u, a); card(x, 190, 400, 230, { rx: 12, stroke: col, sw: 2.5, s: sc }); person(x - 140, 130, null, { s: 0.8 * sc, stroke: col });
        mono(x - 100, 126, n, { 'font-size': 18, 'font-weight': 800, opacity: fade(u, a + 0.1) }); pill(x + 120, 126, 'tag: ' + tag, col, pop(u, a + 0.3), { fs: 13.5 });
        if (perm) { ['configure', 'write', 'read'].forEach((s, j) => { mono(x - 160, 200 + j * 34, s, { 'font-size': 14.5, fill: MUT, opacity: fade(u, a + 0.5 + j * 0.15) }); mono(x + 10, 200 + j * 34, `"${perm[j]}"`, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, a + 0.5 + j * 0.15) }); });
          sub(x, 296, 'vhost "/" 의 모든 리소스 (넓다)', fade(u, 1.2), { fill: WARN }); }
        else { tx(x - 160, 210, '조회 전용 계정', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, a + 0.5) }); tx(x - 160, 240, '대시보드 · 알람용', { 'font-size': 15, fill: MUT, opacity: fade(u, a + 0.6) }); } });
      note(80, 380, 'add_user → set_user_tags → set_permissions 순서', fade(u, 2.0)); return; }
    // k5: 어떤 도구를 쓸까
    const tools = [['HTTP API', '원격 · 자동화 · 조회', INFO], ['rabbitmqctl', '노드 관리 · 파괴적 작업', ACC], ['rabbitmqadmin', '대량 조회를 표로', GOOD]];
    tools.forEach(([n, d, col], i) => { const x = 170 + i * 310; card(x, 300, 260, 90, { rx: 12, stroke: col, sw: 2.5, s: pop(u, 0.1 + i * 0.15) });
      mono(x, 296, n, { 'font-size': 17, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); tx(x, 322, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); });
    [['CI 에서 큐 적체 확인', 0], ['문제 연결 끊기', 1], ['큐 100개 훑어보기', 2]].forEach(([s, ti], i) => { const a = 0.6 + i * 0.6;
      fly([480, 790, 170][i], 80, 170 + ti * 310, 230, seg(u, a, a + 0.6), s, { stay: true, fill: tools[ti][2] }); }); }

  // ---------- 5. 운영 자동화 ----------
  const EX = [['0', 'OK', '모든 큐 정상', GOOD], ['1', 'WARN', 'dlq 적체', WARN], ['2', 'CRIT', '소비자 없는 적체', BAD]];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { EX.forEach(([n, a, b, col], i) => { const y = 100 + i * 90, sc = pop(u, 0.2 + i * 0.35);
        card(320, y, 380, 66, { rx: 12, stroke: col, sw: 2.5, s: sc }); mono(150, y + 10, 'exit ' + n, { 'font-size': 22, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.35) });
        tx(275, y + 8, a + ' · ' + b, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) }); });
      card(760, 190, 220, 90, { rx: 12, text: 'CI / 모니터링\n숫자만 읽는다', fs: 15, stroke: INFO, color: INFO, s: pop(u, 1.5) });
      for (let i = 0; i < 3; i++) dot([[510, 100 + i * 90], [650, 190]], seg(u, 1.6 + i * 0.2, 2.2 + i * 0.2), [GOOD, WARN, BAD][i], 6); return; }
    if (k === 1) { terminal(70, 50, 560, 220, ['$ rabbitmqadmin list queues name messages consumers', '+---------------+----------+-----------+', '| name          | messages | consumers |', '| orders.queue  | 1252     | 4         |', '| dlq.orders    | 37       | 0         |', '| reports.queue | 500      | 0         |'], lerp(0, 6, E(u, 0.2, 2.0)), { fs: 13.5 });
      note(70, 320, '사람이 훑기 좋은 표 · 속은 같은 /api 호출', fade(u, 2.0)); note(70, 350, '판단은 아직 사람 몫이다', fade(u, 2.3), { fill: MUT }); return; }
    if (k === 2) { method(90, 70, 'GET', 1); mono(140, 75, '$BASE/queues/%2F/dlq.orders', { 'font-size': 15, 'font-weight': 700 });
      queue(80, 170, 380, 'dlq.orders', 10, 0, { stroke: WARN }); grow(480, 170, 580, 170, E(u, 0.4, 0.8), MUT);
      pill(650, 170, "jq '.messages_ready'", INFO, pop(u, 0.7), { mono: true, fs: 13.5 });
      card(660, 290, 260, 70, { rx: 10, stroke: WARN, s: pop(u, 1.3) }); mono(560, 298, 'dlq_ready = ' + Math.round(tween(0, 37, u - 1.2, 0.8)), { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.3) });
      note(80, 300, '0 보다 크면 경고 후보', fade(u, 2.0), { fill: WARN }); return; }
    if (k === 3) { // jq select 깔때기
      const QQ = [['orders.queue', 'consumers 4', false], ['payments.queue', 'ready 0', false], ['dlq.orders', 'dlq.* 제외', false], ['reports.queue', 'c 0 · r 500', true]];
      el('path', { d: 'M420,70 L620,70 L560,250 L480,250 Z', fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: fade(u, 0.1) });
      tx(520, 110, 'select(', { 'font-size': 14, 'text-anchor': 'middle', class: 'mono', fill: INFO }); tx(520, 132, 'c==0 and r>0', { 'font-size': 14, 'text-anchor': 'middle', class: 'mono', fill: INFO }); tx(520, 154, ')', { 'font-size': 14, 'text-anchor': 'middle', class: 'mono', fill: INFO });
      QQ.forEach(([n, why, ok], i) => { const y = 80 + i * 60, a = 0.3 + i * 0.45; mono(60, y + 5, n, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, a) });
        fly(250, y, 430, 110, seg(u, a + 0.1, a + 0.4), n.split('.')[0], { mono: true, fill: ok ? BAD : MUT });
        if (!ok && u > a + 0.4) { cross(720, y, 9, pop(u, a + 0.4)); tx(740, y + 5, why, { 'font-size': 14, fill: MUT, opacity: fade(u, a + 0.4) }); } });
      if (u > 2.2) grow(520, 252, 520, 300, E(u, 2.2, 2.5), BAD);
      card(520, 340, 300, 50, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 2.3) }); mono(520, 346, 'bad = ["reports.queue"]', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    if (k === 4) { // if / elif / else 분기 — bad 가 비어 있지 않아 첫 갈래
      const rows = [['if [ "$bad" != "[]" ]', 'exit 2 · CRIT', BAD, true], ['elif [ "$dlq_ready" -gt 0 ]', 'exit 1 · WARN', WARN, false], ['else', 'exit 0 · OK', GOOD, false]];
      rows.forEach(([cond, res, col, taken], i) => { const y = 90 + i * 100, a = 0.2 + i * 0.35;
        card(260, y, 400, 54, { rx: 10, stroke: taken ? col : GRID, sw: taken ? 3 : 1.5, s: pop(u, a) }); mono(80, y + 6, cond, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) });
        grow(462, y, 600, y, taken ? E(u, 1.2, 1.7) : 0, col); card(720, y, 200, 54, { rx: 10, text: res, fs: 16, mono: true, stroke: col, color: taken ? PANEL : col, fill: taken ? col : PANEL, op: taken ? fade(u, 1.6) : 0.35 }); });
      note(80, 400, 'CRIT 이 먼저라 dlq 경고(37건)는 이번엔 가려진다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    // k5: cron 으로 돌린다
    for (let i = 0; i < 4; i++) { const x = 130 + i * 160, s = pop(u, 0.2 + i * 0.3); R.clock(x, 110, 24, 1, INFO); tx(x, 160, ['5분', '10분', '15분', '20분'][i], { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: s }); mono(x, 196, i < 2 ? 'exit 2' : 'exit 1', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: i < 2 ? BAD : WARN, opacity: fade(u, 0.4 + i * 0.3) }); }
    sub(450, 228, '주기는 예시 · reports.queue 를 고친 뒤에는 dlq 경고만 남는다', fade(u, 1.5));
    card(240, 330, 330, 80, { rx: 12, stroke: INFO, s: pop(u, 1.7) }); tx(240, 324, 'monitor 계정 · 조회만', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.8) }); mono(240, 350, 'ops_check.sh', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
    card(700, 330, 330, 80, { rx: 12, stroke: ACC, s: pop(u, 2.0) }); tx(700, 324, '변경은 rabbitmqctl 로 따로', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.1) }); mono(700, 350, 'policy · user', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1) }); }

  const quiz = [
    { q: 'rabbitmq_management 플러그인을 켜면 15672 포트에 열리는 것은 무엇인가?',
      o: ['웹 UI와 HTTP API가 함께 열린다', '웹 UI만 열리고 HTTP API는 따로 켠다', 'AMQP 리스너가 하나 더 열린다'], a: 0,
      why: '플러그인 하나가 웹 UI와 /api/... 를 함께 제공한다. 둘은 같은 데이터를 보며 인증은 Basic Auth다.' },
    { q: 'HTTP API에서 기본 vhost "/"에 tmp.check 큐를 만드는 요청은 무엇인가?',
      o: ['POST /api/queues/tmp.check', 'PUT /api/queues/%2F/tmp.check', 'GET /api/queues/%2F/tmp.check?create=1'], a: 1,
      why: '생성은 PUT, vhost "/"는 URL 안에서 %2F로 쓴다. 지울 때는 같은 주소에 DELETE를 보낸다.' },
    { q: 'orders.queue에서 publish rate 42.0, ack rate 40.5라면 ready는 어떻게 되는가?',
      o: ['그대로 유지된다', '초당 1.5건씩 줄어든다', '초당 1.5건씩 늘어난다'], a: 2,
      why: '들어오는 속도가 처리 속도보다 1.5/s 빠르니 그만큼 대기 메시지가 쌓인다. 이어지면 컨슈머를 늘린다.' },
    { q: 'set_policy orders-guard "^orders" 가 적용되는 큐는 무엇인가?',
      o: ['orders.queue', 'dlq.orders', 'orders가 들어간 모든 큐'], a: 0,
      why: '^orders는 이름이 orders로 시작하는 큐만 고른다. dlq.orders는 dlq로 시작해서 빠진다.' },
    { q: 'ops_check.sh가 exit 2를 돌려줬다. 무엇을 뜻하는가?',
      o: ['모든 큐가 정상이다', '소비자 없이 메시지가 쌓인 큐가 있다', 'dlq에만 메시지가 남아 있다'], a: 1,
      why: '스크립트는 bad가 비어 있지 않으면 먼저 exit 2를 낸다. 이번에는 reports.queue가 consumers 0, ready 500이었다.' },
  ];

  const summary = [
    'Management 플러그인을 켜면 15672 포트에 웹 UI와 HTTP API가 같이 열린다.',
    'HTTP API는 조회 GET, 생성 PUT, 삭제 DELETE를 쓰고 vhost "/"는 %2F로 적는다.',
    '큐 응답은 ready, unacked, consumers와 publish·ack rate를 함께 봐야 원인이 보인다.',
    '노드 작업과 정책·사용자는 rabbitmqctl로, 주기 점검은 종료코드를 내는 스크립트로 한다.',
  ];
  const review = [
    { q: 'LB 헬스체크를 /api/aliveness-test/%2F로 걸었더니 RabbitMQ 4.1 업그레이드 뒤 장애를 못 잡는다. 무엇으로 바꿀까?',
      o: ['/api/overview 응답 시간', 'AMQP 5672 포트 TCP 연결', '/api/health/checks/... 엔드포인트'], a: 2,
      why: 'aliveness-test는 deprecated이고 4.1.0부터 아무 일도 하지 않는다. health checks는 실패하면 503을 돌려준다.' },
    { q: 'dlq.orders에는 컨슈머가 원래 없다. consumers==0 and ready>0 필터만 쓰면 생기는 일은?',
      o: ['dlq.orders도 CRIT 대상이 되어 경보가 늘 울린다', 'reports.queue를 놓친다', 'jq가 오류를 낸다'], a: 0,
      why: 'dlq.orders는 consumers 0, ready 37이라 조건에 걸린다. DLQ는 따로 검사하고 이 필터에서는 이름으로 뺀다.' },
    { q: 'orders.queue의 ready가 계속 오르고 utilisation은 0.87이다. 맞는 조치는?',
      o: ['purge_queue로 비운다', '컨슈머를 하나 늘리고 rate 격차를 다시 본다', 'close_connection으로 생산자를 끊는다'], a: 1,
      why: 'publish가 ack보다 빨라 쌓이는 중이다. purge나 강제 종료는 되돌릴 수 없으니 소비를 늘리는 쪽이 먼저다.' },
  ];

  R.page({ title: 'Management API · rabbitmqctl', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
