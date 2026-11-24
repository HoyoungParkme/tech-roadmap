/* II-1-1 Direct Exchange — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ── RabbitMQ 그림 부품 ──
  // exchange: 육각형 판 (이름 + 타입)
  function exch(cx, cy, name, type, o) { o = o || {}; const w = o.w || 150, h = o.h || 66, c = 18, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: `M${-w / 2 + c},${-h / 2} H${w / 2 - c} L${w / 2},0 L${w / 2 - c},${h / 2} H${-w / 2 + c} L${-w / 2},0 Z`, fill: o.fill || ACCBG, stroke: o.stroke || ACC, 'stroke-width': 2.5 }, g);
    tx(0, type ? -4 : 5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono' }, g);
    if (type) tx(0, 18, type, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: o.stroke || ACC }, g);
    return g; }
  // 큐: 왼쪽이 들어오는 쪽, 메시지는 오른쪽(나가는 쪽)부터 쌓인다. n 이 소수면 마지막 칸이 차오른다
  function queue(x, y, name, n, o) { o = o || {}; const cap = o.cap || 6, cw = 22, gap = 4, w = cap * (cw + gap) + gap, h = 30, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    for (let i = 0; i < cap; i++) { const f = clamp(n - i); if (f <= 0) break;
      el('rect', { x: x + w - (i + 1) * (cw + gap), y: y + 5, width: cw * f, height: h - 10, rx: 3, fill: o.mcol || ACC, opacity: op }); }
    if (name) tx(x, y - 9, name, { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: o.ncol || INK, opacity: op });
    return { l: [x, y + h / 2], r: [x + w, y + h / 2], w }; }
  // 메시지 봉투 (라벨은 오른쪽)
  function env(cx, cy, col, label, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -13, y: -9, width: 26, height: 18, rx: 3, fill: col || ACC }, g);
    el('path', { d: 'M-13,-9 L0,2 L13,-9', fill: 'none', stroke: PANEL, 'stroke-width': 1.8 }, g);
    if (label) mono(o.left ? -18 : 18, 5, label, { 'font-size': 13.5, 'font-weight': 700, fill: col || ACC, 'text-anchor': o.left ? 'end' : 'start' }, g);
    return g; }
  function at(route, u) { const segs = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1])), tot = segs.reduce((a, b) => a + b, 0);
    let d = clamp(u) * tot, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
    const k = segs[i] ? d / segs[i] : 0; return [lerp(route[i][0], route[i + 1][0], k), lerp(route[i][1], route[i + 1][1], k)]; }
  // 경로를 따라 봉투가 이동 (u 0→1 동안만 보인다)
  function send(route, u, col, label, o) { if (u <= 0 || u >= 1) return; const [x, y] = at(route, E(u, 0, 1)); env(x, y, col, label, o); }
  // 앱 판
  const app = (cx, cy, name, o) => card(cx, cy, (o && o.w) || 104, 50, Object.assign({ rx: 10, text: name, fs: 15, fw: 700 }, o || {}));
  // 연결(TCP) 관 + 그 안의 채널 한 줄
  function conn(x1, x2, y, u1, u2) { if (u1 <= 0) return; const xe = lerp(x1, x2, u1);
    el('rect', { x: x1, y: y - 13, width: xe - x1, height: 26, rx: 13, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    if (u2 > 0) el('line', { x1: x1 + 8, y1: y, x2: lerp(x1 + 8, x2 - 8, u2), y2: y, stroke: ACC, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
    sub((x1 + x2) / 2, y - 22, 'connection', fade(u1 * 3 - 2), { 'font-weight': 700, fill: INK });
    sub((x1 + x2) / 2, y + 32, 'channel', fade(u2 * 3 - 2), { 'font-weight': 700, fill: ACC }); }
  // 바인딩 선: 시작점 a → 알약(binding key) → 큐 왼쪽 b. u 로 자라난다
  function bindLine(a, px, b, u, key, o) { o = o || {}; if (u <= 0) return; const col = o.col || MUT, pw = tw(key, 13.5) + 26, py = b[1] + (o.dy || 0);
    const u1 = clamp(u / 0.6), u2 = clamp((u - 0.6) / 0.4);
    el('line', { x1: a[0], y1: a[1], x2: lerp(a[0], px - pw / 2, u1), y2: lerp(a[1], py, u1), stroke: col, 'stroke-width': 2.2, opacity: o.op ?? 1, 'stroke-dasharray': o.dash });
    if (u1 >= 1) { pill(px, py, key, o.pcol || col, 1, { mono: true, fs: 13.5, op: o.op, fill: o.fill });
      el('line', { x1: px + pw / 2, y1: py, x2: lerp(px + pw / 2, b[0], u2), y2: b[1], stroke: col, 'stroke-width': 2.2, opacity: o.op ?? 1 }); } }
  const TONE = { match: GOOD, nomatch: OFF, idle: MUT };

  // 공통 자리: 프로듀서 · exchange · 알약 · 큐
  const P = { px: 62, ex: 270, ey: 210, kx: 478, qx: 566 };
  const EXR = [P.ex + 75, P.ey], EXL = [P.ex - 75, P.ey];
  const QY3 = [95, 195, 295];

  // 1. 정확 매칭
  function s1(t, c) { const { k, u } = c, b = c.beat, qs = b.queues;
    zone(176, 30, 770, 364, 'RabbitMQ 브로커');
    app(P.px, P.ey, 'Producer');
    conn(112, 194, P.ey, k === 0 ? E(u, 0.2, 1.1) : 1, k === 0 ? E(u, 1.0, 1.9) : 1);
    if (k === 0) { sub(560, 215, '아직 exchange 도 큐도 없다', fade(u, 1.8), { 'font-size': 15 }); return; }
    const s = k === 1 ? pop(u, 0.2) : 1;
    exch(P.ex, P.ey, 'logs.direct', 'direct', { s });
    if (k === 1) { pill(P.ex, P.ey - 62, 'durable', INK, pop(u, 0.6), { fs: 13.5 }); mono(P.ex, P.ey + 62, 'routing key == binding key', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) }); }
    const decided = k >= 3 || (k === 2 && u > 1.05);
    qs.forEach((q, i) => { const st = decided ? q.state : 'idle', col = st === 'match' ? GOOD : st === 'nomatch' ? OFF : MUT, gu = k === 1 ? E(u, 0.6 + i * 0.3, 1.4 + i * 0.3) : 1;
      const Q = queue(P.qx, QY3[i], q.name, k === 3 ? 1 * (i === 0) : k === 2 && i === 0 ? E(u, 2.0, 2.5) : 0, { op: gu > 0 ? 1 : 0, col: st === 'match' ? GOOD : INK });
      bindLine(EXR, P.kx, Q.l, gu, q.bindingKey, { col, pcol: st === 'match' ? GOOD : st === 'nomatch' ? MUT : INK, op: st === 'nomatch' ? 0.55 : 1 });
      if (decided) { const sc = k === 2 ? pop(u, 1.05 + i * 0.15) : 1; if (st === 'match') check(P.kx + 74, QY3[i] + 15 - 22, 9, sc); else cross(P.kx + 74, QY3[i] + 15 - 22, 7, sc); } });
    if (k === 2) { send([[P.px + 40, P.ey - 40], [P.ex, P.ey - 40]], seg(u, 0.15, 0.95), ACC, b.routingKey);
      send([EXR, [P.kx - 60, QY3[0] + 15], [P.qx + 140, QY3[0] + 15]], seg(u, 1.4, 2.2), ACC, null); }
    if (k === 3) { // 한 글자만 달라도: log.err 는 어느 큐에도 안 맞아 버려진다
      send([[P.px + 40, P.ey - 40], [P.ex, P.ey - 40]], seg(u, 0.15, 0.9), BAD, 'log.err');
      const dropU = seg(u, 1.0, 1.8); if (dropU > 0) { const y = lerp(P.ey + 40, 352, E(dropU, 0, 1)); env(P.ex, y, BAD, dropU < 1 ? 'log.err' : null, { op: 1 - 0.5 * dropU }); }
      el('rect', { x: P.ex - 70, y: 336, width: 140, height: 34, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '5 4', opacity: fade(u, 0.9) });
      sub(P.ex, 390, 'unroutable · 버려짐', fade(u, 1.6), { fill: BAD, 'font-weight': 700 });
      [['로그 레벨 분배', true], ['작업 종류 분배', true], ['와일드카드 → Topic', false]].forEach(([s2, ok], i) => { const y = 120 + i * 50, sc = pop(u, 1.8 + i * 0.2);
        card(855, y, 168, 38, { rx: 19, stroke: ok ? GOOD : WARN, sw: 1.8, s: sc, text: s2, fs: 13.5, color: ok ? INK : WARN }); }); } }

  // 2. 선언 세 가지: exchange → queue → bind
  function s2(t, c) { const { k, u } = c, qs = c.beat.queues;
    zone(176, 30, 594, 364, 'RabbitMQ 브로커');
    app(P.px, P.ey, 'Bindings\n.java', { text: 'Bindings.java', w: 112, fs: 13.5 });
    conn(118, 194, P.ey, k === 0 ? E(u, 0.2, 1.0) : 1, k === 0 ? E(u, 0.9, 1.7) : 1);
    if (k === 0) mono(P.px - 46, 290, 'try ( conn; ch ) { … }', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) });
    // 선언 체크리스트 (아래쪽)
    const done = [k >= 1, k >= 2, k >= 3];
    ['exchangeDeclare', 'queueDeclare ×3', 'queueBind ×3'].forEach((s, i) => { const x = 230 + i * 180, on = done[i], sc = k === i + 1 ? pop(u, 0.2) : 1;
      card(x + 70, 372, 168, 32, { rx: 8, stroke: on ? GOOD : GRID, sw: 1.6, fill: on ? 'var(--goodbg)' : PANEL, text: (on ? '✓ ' : '') + s, fs: 13.5, mono: true, color: on ? INK : MUT, s: on ? sc : 1 }); });
    if (k >= 1) exch(P.ex, P.ey - 20, 'logs.direct', 'direct · durable', { s: k === 1 ? pop(u, 0.3) : 1 });
    if (k === 1) sub(P.ex + 40, P.ey + 76, '붙은 큐 0개 → 지금 발행하면 버려진다', fade(u, 1.2), { fill: BAD, 'font-weight': 700 });
    if (k >= 2) qs.forEach((q, i) => { const sc = k === 2 ? pop(u, 0.2 + i * 0.25) : 1, y = 70 + i * 90, bound = k >= 3;
      const Q = queue(P.qx, y, q.name, 0, { op: sc > 0 ? 1 : 0, dash: bound ? null : '6 5', col: bound ? INK : MUT });
      if (!bound && sc > 0) sub(P.qx + 80, y + 52, '미바인딩', fade(u, 0.6 + i * 0.25));
      if (bound) bindLine([P.ex + 75, P.ey - 20], P.kx, Q.l, k === 3 ? E(u, 0.2 + i * 0.5, 0.9 + i * 0.5) : 1, ['log.error', 'log.warning', 'log.info'][i], { col: ACC, pcol: ACC }); });
    if (k === 4) { // 소비자도 같은 선언을 한다 (멱등)
      app(880, 150, 'Consumer', { w: 110 });
      [[0.2, 'declare'], [1.0, 'declare']].forEach(([a, s], i) => { const ru = seg(u, a, a + 0.7); if (ru > 0 && ru < 1) { const [x, y] = at(i === 0 ? [[P.px + 40, P.ey - 50], [P.ex - 40, P.ey - 60]] : [[830, 150], [P.ex + 60, P.ey - 50]], E(ru, 0, 1)); pill(x, y, s, INFO, 1, { mono: true, fs: 13.5 }); } });
      pill(880, 228, '이미 있음 → 통과', GOOD, pop(u, 1.8), { fs: 13.5 });
      sub(880, 270, '선언 2번, exchange 1개', fade(u, 2.0), { 'font-weight': 700, fill: INK }); } }

  // 3. 멀티캐스트: 한 key 에 큐 여럿 · 한 큐에 key 여럿
  function s3(t, c) { const { k, u } = c, b = c.beat, qs = b.queues, QY = [55, 135, 215, 305];
    zone(176, 20, 770, 384, 'logs.direct 바인딩');
    app(P.px, P.ey, 'Producer');
    exch(P.ex, P.ey, 'logs.direct', 'direct');
    const fire = k === 3 && u > 1.0;
    qs.forEach((q, i) => { const keys = q.bindingKey.startsWith('(') ? [] : q.bindingKey.split(', '), st = fire ? q.state : 'idle';
      const n = k === 3 && st === 'match' ? E(u, 1.9, 2.4) : 0;
      const Q = queue(P.qx, QY[i], q.name, n, { dash: keys.length ? null : '6 5', col: keys.length ? (st === 'match' ? GOOD : INK) : MUT });
      if (!keys.length) sub(P.kx, QY[i] + 20, '(미바인딩)', 1);
      keys.forEach((key, j) => { const isNew = (k === 1 && i <= 1) || (k === 2 && i === 2), gu = isNew ? E(u, 0.2 + j * 0.7 + (i === 1 ? 0.6 : 0), 1.0 + j * 0.7 + (i === 1 ? 0.6 : 0)) : 1;
        const dy = keys.length > 1 ? (j === 0 ? -17 : 17) : 0, col = st === 'match' ? GOOD : st === 'nomatch' ? OFF : key === 'log.error' ? ACC : MUT;
        bindLine(EXR, P.kx, Q.l, gu, key, { dy, col, pcol: col === OFF ? MUT : col, op: st === 'nomatch' ? 0.55 : 1 }); });
      if (k === 2 && i === 2) sub(P.qx + 210, QY[i] + 20, 'OR', fade(u, 1.8), { 'font-size': 16, 'font-weight': 800, fill: ACC }); });
    if (k === 1) { const n = u > 1.5 ? 2 : u > 0.9 ? 1 : 0; if (n) pill(P.ex, 300, `log.error 수신처 ${n}개`, ACC, 1, { fs: 13.5 }); }
    if (k === 3) { send([[P.px + 40, P.ey - 40], [P.ex, P.ey - 40]], seg(u, 0.15, 0.95), ACC, b.routingKey);
      [0, 1, 2].forEach((i) => send([EXR, [P.kx, QY[i] + 15], [P.qx + 140, QY[i] + 15]], seg(u, 1.1, 2.0), GOOD, null));
      banner(P.ex, 372, '1번 발행 → 큐 3개에 한 벌씩', pop(u, 2.1)); } }

  // 4. 로그 레벨 라우팅: 큐마다 다른 소비자
  const LV = [['log.error', BAD, 'on_error → PagerDuty'], ['log.warning', WARN, 'on_warning → Slack'], ['log.info', INFO, 'on_info → S3']];
  function s4(t, c) { const { k, u } = c, b = c.beat, Q4 = { ex: 220, kx: 400, qx: 482 }, QY = [80, 195, 310];
    app(56, 210, 'App', { w: 84 });
    exch(Q4.ex, 210, 'logs.direct', 'direct', { w: 140 });
    // 소비자 채널 + prefetch 칸 20개
    const pf = k === 0 ? E(u, 0.3, 1.8) : 1, chX = 686;
    el('rect', { x: chX - 13, y: 60, width: 26, height: 300, rx: 13, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    for (let i = 0; i < 20; i++) { const on = i < pf * 20; el('rect', { x: chX - 7, y: 66 + i * 14.5, width: 14, height: 10, rx: 2, fill: on ? ACC : PANEL, stroke: GRID, 'stroke-width': 1, opacity: on ? 0.9 : 1 }); }
    mono(chX, 50, 'prefetch 20', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 1.0) : 1 });
    sub(chX, 384, 'channel 1개', 1, { 'font-weight': 700, fill: INK });
    const cur = { 1: 0, 2: 1, 3: 2, 4: 1 }[k];
    LV.forEach(([key, col, cb], i) => { const y = QY[i], on = cur === i, Q = queue(Q4.qx, y, ['error.queue', 'warning.queue', 'info.queue'][i], 0, { cap: 6, col: on ? col : INK });
      bindLine([Q4.ex + 70, 210], Q4.kx, Q.l, 1, key, { col: on ? col : MUT, pcol: on ? col : MUT });
      const live = k === 4 || (k >= 1 && i <= cur);
      card(842, y + 15, 196, 40, { rx: 10, text: cb, fs: 13.5, mono: true, stroke: live ? col : GRID, color: live ? INK : MUT, sw: on ? 2.5 : 1.6, s: k === i + 1 ? pop(u, 1.6) : 1 });
      el('line', { x1: Q4.qx + 160, y1: y + 15, x2: chX - 13, y2: y + 15, stroke: GRID, 'stroke-width': 2 });
      el('line', { x1: chX + 13, y1: y + 15, x2: 744, y2: y + 15, stroke: GRID, 'stroke-width': 2 }); });
    if (k >= 1 && k <= 3) { const i = cur, [key, col] = LV[i], y = QY[i] + 15;
      send([[96, 175], [Q4.ex, 175]], seg(u, 0.15, 0.8), col, key);
      send([[Q4.ex + 70, 210], [Q4.kx, y], [Q4.qx + 150, y], [744, y]], seg(u, 0.9, 1.9), col, null);
      if (i === 2) { const fu = E(u, 1.9, 2.5); el('rect', { x: 756, y: y + 26, width: 172, height: 8, rx: 4, fill: SOFT }); el('rect', { x: 756, y: y + 26, width: 172 * 0.35 * fu, height: 8, rx: 4, fill: INFO }); sub(842, y + 52, '버퍼에 모았다가 S3 로', fade(u, 2.0)); }
      else pill(842, y + 44, i === 0 ? '즉시 호출 · ack' : 'Slack 전송 · ack', col, pop(u, 2.0), { fs: 13.5 }); }
    if (k === 4) { // 세 레벨이 섞여 들어와도 브로커가 갈라 놓는다
      for (let j = 0; j < 9; j++) { const i = j % 3, ph = ((t * 0.45 + j / 9) % 1), y = QY[i] + 15; dot([[Q4.ex + 70, 210], [Q4.kx, y], [Q4.qx + 150, y], [744, y]], ph, LV[i][1], 5); }
      banner(Q4.ex + 10, 370, 'basic_consume × 3 · 라우팅은 브로커 몫', pop(u, 0.4)); } }

  // 5. default exchange "" : 큐 이름 = routing key
  function s5(t, c) { const { k, u } = c;
    if (k >= 3) { // 바인딩 목록 (rabbitmqadmin 출력 예)
      const lines = ['$ rabbitmqadmin list bindings source destination routing_key', 'source        destination    routing_key', ['(default)     task.queue     task.queue     ← 자동', 'var(--good)'], 'logs.direct   error.queue    log.error', 'logs.direct   audit.queue    log.error', 'logs.direct   info.queue     log.info'];
      if (k === 3) { terminal(110, 40, 740, 230, lines, lerp(1, 6, E(u, 0.2, 1.8)), { title: 'inspect.sh · 출력 예', lh: 28, fs: 14 });
        sub(480, 310, '아무도 선언하지 않은 첫 줄이 default exchange 의 자동 바인딩이다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      [['정확 일치', 'routing key == binding key', ACC], ['멀티캐스트', '한 key 여러 큐 · 한 큐 여러 key', ACC], ['default ""', '큐 이름 = routing key', INFO]].forEach(([a, b2, col], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.35);
        card(x, 160, 280, 96, { rx: 12, stroke: col, sw: 2.2, s }); tx(x, 148, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.35) });
        mono(x, 178, b2, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3 + i * 0.35) }); });
      pill(480, 290, '와일드카드는 Direct 에 없다 → Topic (II-1-2)', WARN, pop(u, 1.6), { fs: 14 }); return; }
    zone(176, 30, 770, 364, 'RabbitMQ 브로커');
    app(P.px, 200, 'Producer');
    exch(P.ex, 200, '""', '(AMQP default) direct', { w: 176 });
    const QY = [110, 250], names = ['task.queue', 'other.queue'];
    names.forEach((n, i) => { const isNew = k === 0 && i === 0, s = isNew ? pop(u, 0.2) : 1, hit = k >= 1 && i === 0, miss = k >= 1 && i === 1 && (k > 1 || u > 1.0);
      const cnt = k === 1 && i === 0 ? E(u, 1.9, 2.4) : k === 2 && i === 0 ? 1 : 0;
      const Q = queue(P.qx, QY[i], n, cnt, { op: s > 0 ? 1 : 0, col: hit ? GOOD : INK });
      bindLine([P.ex + 88, 200], P.kx, Q.l, isNew ? E(u, 0.7, 1.6) : 1, n + ' (자동)', { col: hit ? GOOD : INFO, pcol: hit ? GOOD : INFO, op: miss ? 0.5 : 1, dash: '6 4' });
      if (!isNew || u > 1.6) lock(P.kx, QY[i] + 15 - 36, true, MUT, 0.8); });
    if (k === 0) sub(P.ex, 300, '자동 바인딩은 지울 수 없다', fade(u, 1.8), { 'font-weight': 700, fill: INK });
    if (k === 1) { send([[P.px + 40, 160], [P.ex, 160]], seg(u, 0.15, 0.95), ACC, 'task.queue');
      send([[P.ex + 88, 200], [P.kx, QY[0] + 15], [P.qx + 140, QY[0] + 15]], seg(u, 1.1, 1.9), GOOD, null);
      cross(P.kx + 92, QY[1] + 15, 8, pop(u, 1.2)); }
    if (k === 2) { const gu = seg(u, 0.2, 2.4), out = gu < 0.5 ? E(gu * 2, 0, 1) : E((1 - gu) * 2, 0, 1);
      app(870, 300, 'admin get', { w: 120, stroke: INFO, color: INFO });
      if (gu > 0 && gu < 1) env(lerp(P.qx + 140, 840, out), lerp(QY[0] + 15, 260, out), ACC, gu < 0.5 ? null : 'requeue', { left: false });
      pill(870, 356, 'ack_requeue_true', INFO, pop(u, 0.3), { mono: true, fs: 13.5 });
      sub(P.qx + 80, QY[0] + 52, '꺼내 보고 되돌림 → 그대로 1건', fade(u, 2.2), { 'font-weight': 700, fill: INK }); } }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: 'routing key "log.err"로 발행했을 때 binding key가 log.error인 error.queue가 받는 것은 무엇인가?',
      o: ['그 메시지를 받는다, 앞부분이 같으니까', '아무것도 받지 못한다, 글자가 정확히 같아야 한다', '브로커가 가장 비슷한 큐를 골라 넣어 준다'], a: 1,
      why: 'Direct는 문자열 완전 일치만 본다. 한 글자라도 다르면 맞는 큐가 없어 메시지는 버려진다.' },
    { q: '큐를 선언만 하고 queue_bind를 빼먹었을 때 생기는 일은 무엇인가?',
      o: ['exchange가 이름이 비슷한 큐를 찾아 넣어 준다', '선언이 거부되어 에러가 난다', 'logs.direct로 보낸 메시지가 그 큐에 오지 않는다'], a: 2,
      why: '큐는 바인딩이 있어야 라우팅 대상이 된다. 선언 순서는 exchange, queue, bind이다.' },
    { q: 'db.queue를 log.error와 log.critical 두 key로 바인딩했을 때 이 큐가 받는 메시지는 무엇인가?',
      o: ['log.error나 log.critical 중 아무것으로 온 메시지', '두 key를 모두 단 메시지만', 'log.critical 메시지만'], a: 0,
      why: '한 큐에 binding key를 여럿 걸면 OR 조건이 된다. 같은 key에 큐를 여럿 걸면 반대로 복제가 된다.' },
    { q: '레벨마다 큐를 나눈 뒤 Slack 전송이 느려졌다. PagerDuty 알림이 받는 영향은 무엇인가?',
      o: ['같이 느려진다, 같은 exchange를 쓰니까', '영향이 없다, error와 warning은 큐가 따로다', 'Slack이 끝날 때까지 알림이 멈춘다'], a: 1,
      why: '브로커가 key별로 다른 큐에 나눠 넣으므로 소비자도 따로 돈다. 한 경로가 밀려도 다른 큐는 그대로 빠진다.' },
    { q: 'exchange="", routing_key="task.queue"로 발행했을 때 메시지가 가는 곳은 무엇인가?',
      o: ['바인딩된 모든 큐', '아무 데도 가지 않는다', 'task.queue'], a: 2,
      why: '모든 큐는 자기 이름을 key로 default exchange에 자동 바인딩된다. 그래서 큐 이름이 곧 routing key다.' },
  ];

  const summary = [
    'Direct exchange는 routing key와 binding key가 글자까지 같을 때만 큐로 보낸다.',
    '맞는 바인딩이 하나도 없으면 메시지는 에러 없이 버려진다.',
    '같은 key에 큐를 여럿 묶으면 복제되고, 한 큐에 key를 여럿 묶으면 그중 아무거나 받는다.',
    '이름이 빈 default exchange에서는 큐 이름이 곧 routing key다.',
  ];
  const review = [
    { q: 'log.error와 log.critical을 DB팀이 한 곳에서 같이 보려 한다. 가장 간단한 방법은 무엇인가?',
      o: ['DB팀 큐 하나를 log.error와 log.critical 두 key로 바인딩한다', 'exchange를 Topic으로 새로 만든다', '프로듀서가 같은 메시지를 두 번 발행한다'], a: 0,
      why: '한 큐에 key를 여럿 걸면 어느 쪽으로 와도 받는다. 발행 코드도 exchange 타입도 바꿀 필요가 없다.' },
    { q: '프로듀서를 먼저 띄워 발행했더니 메시지가 사라졌다. 먼저 의심할 것은 무엇인가?',
      o: ['prefetch 값이 너무 작았다', '그때 큐나 바인딩이 아직 선언되지 않았다', '메시지 본문이 너무 컸다'], a: 1,
      why: '바인딩이 없으면 메시지는 unroutable로 버려진다. 선언은 멱등이라 소비자 쪽에도 넣어 두면 안전하다.' },
    { q: '바인딩 목록에 아무도 만든 적 없는 (default) → task.queue 줄이 보인다. 이 줄은 무엇인가?',
      o: ['누군가 실수로 만든 바인딩이라 지워야 한다', 'Topic exchange의 # 바인딩이다', '큐를 만들 때 default exchange에 자동으로 생긴 바인딩이다'], a: 2,
      why: '큐는 선언되는 순간 자기 이름으로 default exchange에 묶인다. 이 바인딩은 지울 수 없다.' },
  ];

  R.page({ title: 'Direct 라우팅 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
