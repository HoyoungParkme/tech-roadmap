/* II-1-3 Fanout Exchange — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, zone, cross, check, lock, dot } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ── RabbitMQ 그림 부품 ──
  function exch(cx, cy, name, type, o) { o = o || {}; const w = o.w || 160, h = o.h || 62, c = 18, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: `M${-w / 2 + c},${-h / 2} H${w / 2 - c} L${w / 2},0 L${w / 2 - c},${h / 2} H${-w / 2 + c} L${-w / 2},0 Z`, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }, g);
    tx(0, type ? -4 : 5, name, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 800, class: 'mono' }, g);
    if (type) tx(0, 17, type, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: ACC }, g);
    return g; }
  function queue(x, y, name, n, o) { o = o || {}; const cap = o.cap || 5, cw = 22, gap = 4, w = cap * (cw + gap) + gap, h = 30, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    for (let i = 0; i < cap; i++) { const f = clamp(n - i); if (f <= 0) break;
      el('rect', { x: x + w - (i + 1) * (cw + gap), y: y + 5, width: cw * f, height: h - 10, rx: 3, fill: o.mcol || ACC, opacity: op }); }
    if (name) tx(x, y - 9, name, { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: o.ncol || INK, opacity: op });
    return w; }
  function env(cx, cy, col, label, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -13, y: -9, width: 26, height: 18, rx: 3, fill: col || ACC }, g);
    el('path', { d: 'M-13,-9 L0,2 L13,-9', fill: 'none', stroke: PANEL, 'stroke-width': 1.8 }, g);
    if (label) mono(o.left ? -18 : 18, 5, label, { 'font-size': 13.5, 'font-weight': 700, fill: col || ACC, 'text-anchor': o.left ? 'end' : 'start' }, g); }
  function at(route, u) { const segs = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1])), tot = segs.reduce((a, b) => a + b, 0);
    let d = clamp(u) * tot, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
    const k = segs[i] ? d / segs[i] : 0; return [lerp(route[i][0], route[i + 1][0], k), lerp(route[i][1], route[i + 1][1], k)]; }
  function send(route, u, col, label, o) { if (u <= 0 || u >= 1) return; const [x, y] = at(route, E(u, 0, 1)); env(x, y, col, label, o); }
  const app = (cx, cy, name, o) => card(cx, cy, (o && o.w) || 104, (o && o.h) || 46, Object.assign({ rx: 10, text: name, fs: 15, fw: 700 }, o || {}));
  function conn(x1, x2, y, u1, u2) { if (u1 <= 0) return; const xe = lerp(x1, x2, u1);
    el('rect', { x: x1, y: y - 13, width: xe - x1, height: 26, rx: 13, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    if (u2 > 0) el('line', { x1: x1 + 8, y1: y, x2: lerp(x1 + 8, x2 - 8, u2), y2: y, stroke: ACC, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
    sub((x1 + x2) / 2, y - 22, 'connection', fade(u1 * 3 - 2), { 'font-weight': 700, fill: INK });
    sub((x1 + x2) / 2, y + 32, 'channel', fade(u2 * 3 - 2), { 'font-weight': 700, fill: ACC }); }
  const strip = (s) => String(s).replace(/^[^\w가-힣(]+\s*/u, '');   // 앞의 그림 글자 떼기
  // 바퀴살: exchange 에서 큐로 (키 없는 바인딩)
  function spoke(a, b, u, o) { o = o || {}; if (u <= 0) return; el('line', { x1: a[0], y1: a[1], x2: lerp(a[0], b[0], u), y2: lerp(a[1], b[1], u), stroke: o.col || ACC, 'stroke-width': 2.4, opacity: o.op ?? 1, 'stroke-dasharray': o.dash }); }

  // 공통 자리
  const F = { px: 60, ex: 262, ey: 210, qx: 474, cx: 800 }, QY = [95, 195, 295];
  const EXR = [F.ex + 80, F.ey];
  const qMid = (i) => [F.qx, QY[i] + 15];

  // 1. routing key 를 보지 않는 복제기
  function s1(t, c) { const { k, u } = c, b = c.beat, qs = b.queues;
    zone(170, 30, 560, 364, 'RabbitMQ 브로커');
    app(F.px, F.ey, 'Producer', { w: 96 });
    conn(108, 186, F.ey, k === 0 ? E(u, 0.2, 1.0) : 1, k === 0 ? E(u, 0.9, 1.7) : 1);
    if (k >= 1) exch(F.ex, F.ey, 'events.fanout', 'fanout', { s: k === 1 ? pop(u, 0.2) : 1 });
    const n = k === 2 ? E(u, 1.9, 2.4) : k === 3 ? 1 + E(u, 1.9, 2.4) : 0;
    qs.forEach((q, i) => { const bound = q.bound && (k > 1 || (k === 1 && u > 0.6 + i * 0.25));
      if (q.bound) spoke(EXR, qMid(i), k === 1 ? E(u, 0.6 + i * 0.25, 1.2 + i * 0.25) : 1);
      queue(F.qx, QY[i], q.name, n, { dash: bound ? null : '6 5', col: bound ? INK : MUT });
      app(F.cx, QY[i] + 15, strip(q.consumer), { w: 150, h: 40, fs: 14, stroke: q.delivered && k >= 2 ? GOOD : GRID });
      el('line', { x1: F.qx + 134, y1: QY[i] + 15, x2: F.cx - 75, y2: QY[i] + 15, stroke: GRID, 'stroke-width': 2 }); });
    if (k === 0) sub(F.ex, F.ey + 4, '아직 exchange 없음', fade(u, 1.4), { 'font-size': 15 });
    if (k === 1) sub(F.ex, F.ey + 62, 'routing key 비교 없음', fade(u, 1.4), { fill: ACC, 'font-weight': 700 });
    if (k >= 2) { const lab = k === 2 ? '""' : 'whatever';
      send([[F.px + 40, F.ey - 46], [F.ex - 20, F.ey - 46]], seg(u, 0.15, 0.85), ACC, lab);
      [0, 1, 2].forEach((i) => send([EXR, qMid(i), [F.qx + 120, QY[i] + 15]], seg(u, 1.0, 1.9), GOOD, null));
      if (k === 3) { const du = seg(u, 0.85, 1.6); if (du > 0 && du < 1) mono(F.ex - 2, lerp(F.ey - 42, F.ey + 110, E(du, 0, 1)), 'whatever', { 'font-size': 13.5, fill: OFF, 'text-decoration': 'line-through', opacity: 1 - du }); }
      if (k === 2) { banner(F.ex, 372, '1건 발행 → 바인딩된 큐 3개에 한 벌씩', pop(u, 2.1)); pill(F.ex, 140, 'delivery_mode=2 · persistent', INK, pop(u, 0.4), { fs: 13.5 }); }
      if (k === 3) banner(F.ex, 372, 'key 를 넣어도 읽지 않는다 · 골라 보내기는 Direct·Topic', pop(u, 2.1)); } }

  // 2. 소비자마다 이름 없는 전용 임시 큐
  const GEN = ['amq.gen-Xy1', 'amq.gen-Kp9', 'amq.gen-Zt3'];
  function s2(t, c) { const { k, u } = c, b = c.beat, qs = b.queues;
    zone(170, 30, 560, 364, 'RabbitMQ 브로커');
    exch(F.ex, F.ey, 'events.fanout', 'fanout');
    const cons = ['이메일 발송기', '푸시 알림기', '감사 로거'];
    const nQ = k <= 1 ? 1 : 3;
    for (let i = 0; i < 3; i++) { const y = QY[i] + 15, show = i < nQ || (k === 2 && u > 1.0 + i * 0.3), dead = k === 4 && i === 0 && u > 1.4;
      if (i >= 1 && !(k >= 2)) continue;
      const sc = k === 2 && i >= 1 ? pop(u, 1.0 + i * 0.3) : 1;
      app(F.cx, y, cons[i], { w: 150, h: 40, fs: 14, stroke: dead ? BAD : i === 0 ? INK : GRID, s: sc, color: dead ? BAD : INK });
      if (!show) continue;
      if (k === 0) { queue(F.qx, QY[i], '(아직 없음)', 0, { dash: '6 5', col: MUT, ncol: MUT }); continue; }
      const nameU = k === 1 ? E(u, 0.4, 1.4) : 1, nm = GEN[i].slice(0, Math.round(GEN[i].length * nameU));
      const qop = dead ? 1 - E(u, 1.5, 2.3) : 1;
      if (qop > 0.02) { const bound = k >= 3 || (k === 2 && u > 0.4 + i * 0.3);
        if (k >= 2) spoke(EXR, qMid(i), k === 2 ? E(u, 0.4 + i * 0.3, 1.0 + i * 0.3) : 1, { op: qop });
        queue(F.qx, QY[i], nm, k === 3 && i === 0 ? 1 - E(u, 1.8, 2.3) : 0, { op: qop, col: bound ? INK : MUT, dash: bound ? null : '6 5' });
        lock(F.qx + 152, QY[i] + 15, true, MUT, 0.7 * sc); }
      if (dead) { const f = E(u, 1.5, 2.3); for (let j = 0; j < 6; j++) el('rect', { x: F.qx + 10 + j * 22 + f * (j - 2.5) * 10, y: QY[i] + 8 + f * 40 * ((j % 2) + 0.5), width: 16, height: 12, rx: 2, fill: BAD, opacity: f * (1 - f) * 3 }); }
      el('line', { x1: F.qx + 170, y1: y, x2: F.cx - 75, y2: y, stroke: dead ? BAD : GRID, 'stroke-width': 2, 'stroke-dasharray': dead ? '4 4' : null }); }
    if (k === 0) { const ru = seg(u, 0.4, 1.4); if (ru > 0 && ru < 1) { const [x, y] = at([[F.cx - 70, QY[0] + 15], [F.ex + 70, F.ey - 30]], E(ru, 0, 1)); pill(x, y, 'exchange_declare', INFO, 1, { mono: true, fs: 13.5 }); }
      pill(F.ex, F.ey + 64, '이미 있음 → 통과 (멱등)', GOOD, pop(u, 1.6), { fs: 13.5 }); }
    if (k === 1) { pill(F.qx + 66, QY[0] + 62, 'queue="" → 서버가 이름을 짓는다', INFO, pop(u, 0.3), { fs: 13.5 });
      pill(F.qx + 66, QY[0] + 100, 'exclusive · 이 연결 전용', WARN, pop(u, 1.6), { fs: 13.5 });
      sub(F.qx + 66, QY[0] + 134, '이름은 예시', fade(u, 1.8)); }
    if (k === 2) { const n = u > 1.6 ? 3 : u > 1.3 ? 2 : 1; pill(F.ex, 372, `바인딩된 큐 ${n}개 · routing_key 인자 없음`, ACC, 1, { fs: 13.5 }); }
    if (k === 3) { send([[F.ex + 80, F.ey], qMid(0), [F.qx + 120, QY[0] + 15]], seg(u, 0.1, 0.8), ACC, null);
      send([[F.qx + 120, QY[0] + 15], [F.cx - 70, QY[0] + 15]], seg(u, 0.9, 1.6), WARN, null);
      if (u > 1.6) check(F.cx + 90, QY[0] + 15, 10, pop(u, 1.6));
      pill(F.cx, QY[0] + 58, '처리 후 basic_ack → 큐에서 삭제', GOOD, pop(u, 1.8), { fs: 13.5 }); }
    if (k === 4) { [1, 2].forEach((i) => { for (let j = 0; j < 3; j++) el('circle', { cx: F.cx - 20 + j * 20, cy: QY[i] + 46, r: 4, fill: MUT, opacity: 0.3 + 0.7 * ((Math.floor(t * 3) + j) % 3 === 0) }); });
      cross(F.cx - 120, QY[0] + 15, 10, pop(u, 1.2));
      pill(F.ex, 372, 'exclusive 큐는 연결이 끊기면 자동으로 지워진다', BAD, pop(u, 2.0), { fs: 13.5 }); } }

  // 3. 1건 발행 → 큐마다 한 벌, 소비는 각자 속도
  function s3(t, c) { const { k, u } = c, b = c.beat, qs = b.queues;
    zone(170, 30, 560, 364, 'RabbitMQ 브로커');
    app(F.px, F.ey, 'Producer', { w: 96 });
    exch(F.ex, F.ey, 'events.fanout', 'fanout');
    const speeds = [1.4, 1.9, 2.4];   // ack 시점 (그림용 순서: 빠른 소비자 → 느린 소비자)
    qs.forEach((q, i) => { const y = QY[i] + 15, bound = q.bound && (k > 2 || (k === 2 && u > 0.4 + i * 0.3));
      if (q.bound) spoke(EXR, qMid(i), k === 2 ? E(u, 0.4 + i * 0.3, 1.0 + i * 0.3) : 1);
      let n = 0; if (k === 3) n = E(u, 0.9, 1.3) * (u < speeds[i] ? 1 : 1 - E(u, speeds[i], speeds[i] + 0.3)); if (k === 4 && i !== 0) n = 0; if (k === 4 && i === 0) n = u < 1.0 ? 0 : E(u, 1.4, 1.9);
      queue(F.qx, QY[i], q.name, n, { dash: bound ? null : '6 5', col: bound ? INK : MUT });
      if (k === 1) { const s = pop(u, 0.3 + i * 0.2); pill(F.qx + 67, QY[i] + 48, 'exclusive · auto-delete', INFO, s, { fs: 13.5 }); }
      app(F.cx, y, strip(q.consumer), { w: 150, h: 40, fs: 14, stroke: k === 3 && u > speeds[i] ? GOOD : GRID });
      el('line', { x1: F.qx + 134, y1: y, x2: F.cx - 75, y2: y, stroke: GRID, 'stroke-width': 2 });
      if (k === 3 && u > speeds[i]) check(F.cx + 90, y, 9, pop(u, speeds[i])); });
    if (k === 0) sub(F.ex, F.ey + 62, 'Java: newConnection → createChannel', fade(u, 0.8), { fill: INK, 'font-weight': 700 });
    if (k === 1) pill(F.ex, 372, 'queueDeclare() = 서버가 이름 짓는 임시 큐', INFO, pop(u, 1.2), { fs: 13.5 });
    if (k === 2) { pill((F.ex + F.qx) / 2 + 20, 150, '""', MUT, pop(u, 1.4), { mono: true, fs: 13.5 }); sub((F.ex + F.qx) / 2 + 20, 124, '바인딩 key 는 빈 문자열', fade(u, 1.5)); }
    if (k === 3) { send([[F.px + 40, F.ey - 46], [F.ex - 20, F.ey - 46]], seg(u, 0.1, 0.6), ACC, null);
      [0, 1, 2].forEach((i) => send([EXR, qMid(i), [F.qx + 120, QY[i] + 15]], seg(u, 0.6, 1.1), GOOD, null));
      banner(F.ex, 372, '큐가 따로라 느린 소비자가 다른 큐를 막지 않는다', pop(u, 2.4)); }
    if (k === 4) { // autoAck=false: ack 전까지 메시지는 큐 쪽에 남는다
      const y = QY[0] + 15, crash = u > 1.0;
      if (u < 1.0) env(F.cx - 40, y - 36, WARN, 'unacked', { left: true });
      if (crash) cross(F.cx + 92, y, 10, pop(u, 1.0));
      send([[F.cx - 40, y - 36], [F.qx + 120, y - 36], [F.qx + 120, y]], seg(u, 1.0, 1.6), WARN, null);
      pill(F.cx, QY[0] + 62, '죽어도 메시지는 큐로 돌아가 다시 전달', GOOD, pop(u, 1.9), { fs: 13.5 });
      pill(F.ex, 372, 'basicConsume(queue, autoAck=false, …)', INK, pop(u, 0.3), { mono: true, fs: 13.5 }); } }

  // 4. Fanout 과 Topic(#) 비교
  function s4(t, c) { const { k, u } = c, LY = [120, 296], EX = 300, QX = 610;
    [['events.fanout', 'fanout'], ['events.topic', 'topic']].forEach(([n, ty], i) => { const y = LY[i];
      exch(EX, y, n, ty, { s: k === 0 ? pop(u, 0.2 + i * 0.4) : 1 });
      app(80, y, 'Producer', { w: 96 });
      const bu = i === 0 ? (k === 1 ? E(u, 0.3, 1.2) : k > 1 ? 1 : 0) : (k === 2 ? E(u, 0.3, 1.2) : k > 2 ? 1 : 0);
      spoke([EX + 80, y], [QX, y + 15 - 15], bu, { col: i ? INFO : ACC });
      queue(QX, y - 15, i ? 'q.topic' : 'q.fanout', k >= 3 ? E(u, i ? 2.0 : 1.2, i ? 2.4 : 1.6) : 0, { op: bu > 0.95 ? 1 : bu > 0 ? 0.4 : 0.15, dash: bu > 0.95 ? null : '6 5' }); });
    if (k >= 1) sub(455, LY[0] - 14, 'key 없는 바인딩', k === 1 ? fade(u, 1.2) : 1, { 'font-weight': 700, fill: ACC });
    if (k >= 2) pill(455, LY[1], '#', INFO, k === 2 ? pop(u, 1.1) : 1, { mono: true, fs: 15 });
    if (k === 2) sub(455, LY[1] + 36, '모든 key 를 받지만 패턴은 패턴', fade(u, 1.6));
    if (k >= 3) { // 트라이 탐색: 발행마다 노드를 따라 내려간다
      const nodes = [[EX - 60, 384, 'root'], [EX + 10, 384, '#'], [EX + 80, 384, '→ q.topic']];
      if (k === 3) { send([[130, LY[0] - 44], [EX - 20, LY[0] - 44]], seg(u, 0.1, 0.6), ACC, 'whatever');
        send([[EX + 80, LY[0]], [QX + 100, LY[0]]], seg(u, 0.6, 1.2), GOOD, null);
        send([[130, LY[1] - 44], [EX - 20, LY[1] - 44]], seg(u, 0.1, 0.6), INFO, 'user.signup'); }
      const tu = k === 3 ? seg(u, 0.7, 1.9) : 1;
      nodes.forEach(([x, y, s], j) => { const on = tu * 3 > j; card(x, y, j === 2 ? 96 : 60, 28, { rx: 14, text: s, fs: 13.5, mono: true, stroke: on ? INFO : GRID, color: on ? INFO : MUT, sw: on ? 2.2 : 1.4 }); if (j) el('line', { x1: x - (j === 2 ? 58 : 40) + 10, y1: y, x2: x - (j === 2 ? 48 : 30), y2: y, stroke: on ? INFO : GRID, 'stroke-width': 2 }); });
      sub(EX - 150, 389, '메시지마다', 1, { 'font-weight': 700 });
      if (k === 3) send([[EX + 80, LY[1]], [QX + 100, LY[1]]], seg(u, 1.9, 2.4), GOOD, null);
      if (k === 3) tx(QX + 160, LY[0] + 6, '비교 없이 바로 복제', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 3 ? fade(u, 1.2) : 1 });
      if (k === 3) tx(QX + 160, LY[1] + 6, '# 매칭 후 전달', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: k === 3 ? fade(u, 2.3) : 1 }); }
    if (k === 4) { [['무조건 전원 전달', 'fanout', ACC, 180], ['일부만 거를 여지', 'topic', INFO, 230]].forEach(([a, b2, col, y], i) => { const s = pop(u, 0.3 + i * 0.4);
        card(860, LY[i] + 10, 160, 64, { rx: 10, stroke: col, sw: 2.2, s, fill: PANEL }); tx(860, LY[i] + 4, a, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) });
        mono(860, LY[i] + 28, '→ ' + b2, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.4 + i * 0.4) }); }); } }

  // 5. 캐시 무효화 전파
  function s5(t, c) { const { k, u } = c, b = c.beat, IY = [90, 210, 330], IX = 812, QX5 = 560, EX5 = 360;
    exch(EX5, 210, 'cache.invalidate', 'fanout', { w: 196, s: k === 0 ? pop(u, 0.3) : 1 });
    const deleted = k === 4 ? (i) => u > 1.6 + i * 0.2 : () => false;
    IY.forEach((y, i) => { const s = k === 0 ? pop(u, 0.6 + i * 0.2) : 1;
      card(IX, y, 230, 96, { rx: 10, stroke: i === 0 && (k === 1 || k === 2) ? ACC : INK, sw: 2, s });
      tx(IX - 102, y - 26, `앱 인스턴스 ${i + 1}`, { 'font-size': 15, 'font-weight': 700, opacity: s });
      [['product:{pid}', 0], ['product:…', 1]].forEach(([key, j]) => { const yy = y + 2 + j * 26, gone = j === 0 && deleted(i);
        el('rect', { x: IX - 104, y: yy - 10, width: 208, height: 22, rx: 4, fill: gone ? 'var(--badbg)' : SOFT, opacity: s });
        mono(IX - 96, yy + 6, key, { 'font-size': 13.5, fill: gone ? BAD : INK, 'text-decoration': gone ? 'line-through' : null, opacity: s }); });
      sub(IX + 60, y - 26, 'local_cache', s * 0.9);
      // 인스턴스마다 exclusive 임시 큐
      const qs = k === 3 ? pop(u, 0.3 + i * 0.25) : 1;
      if (qs > 0) { spoke([EX5 + 98, 210], [QX5, y], k === 3 ? E(u, 0.3 + i * 0.25, 0.8 + i * 0.25) : 1);
        queue(QX5, y - 15, null, k === 4 ? (u < 1.6 + i * 0.2 ? E(u, 1.0, 1.4) : 0) : 0, { cap: 3, col: INK });
        el('line', { x1: QX5 + 82, y1: y, x2: IX - 115, y2: y, stroke: GRID, 'stroke-width': 2 });
        lock(QX5 + 41, y - 32, true, MUT, 0.65); } });
    if (k === 0) sub(EX5, 290, 'EXCHANGE = "cache.invalidate.fanout"', fade(u, 1.4), { class: 'mono', fill: INK });
    if (k === 1) { pill(IX - 40, 22, 'publish_invalidation(product_id)', ACC, pop(u, 0.3), { mono: true, fs: 13.5 });
      const cu = E(u, 0.8, 1.8); el('path', { d: `M${IX - 115},${IY[0] - 10} Q${EX5 + 60},${IY[0] - 70} ${EX5},${210 - 34}`, fill: 'none', stroke: INK, 'stroke-width': 2.2, 'stroke-dasharray': `${cu * 600} 600` });
      sub(EX5 + 40, 70, '연결 열고 같은 exchange 를 멱등 선언', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); }
    if (k === 2) { el('path', { d: `M${IX - 115},${IY[0] - 10} Q${EX5 + 60},${IY[0] - 70} ${EX5},${210 - 34}`, fill: 'none', stroke: INK, 'stroke-width': 2.2 });
      const pu = seg(u, 0.3, 1.5); if (pu > 0 && pu < 1) { const q = E(pu, 0, 1), x = (1 - q) * (1 - q) * (IX - 115) + 2 * (1 - q) * q * (EX5 + 60) + q * q * EX5, y = (1 - q) * (1 - q) * (IY[0] - 10) + 2 * (1 - q) * q * (IY[0] - 70) + q * q * (210 - 34); env(x, y, ACC, '{"product_id"}'); }
      pill(EX5, 330, 'routing_key="" · 받는 쪽 목록을 모른다', ACC, pop(u, 1.6), { fs: 13.5 }); }
    if (k === 3) { card(IX, 404, 230, 26, { rx: 8, dash: '5 4', stroke: MUT, sw: 1.5, text: '내려가 있던 인스턴스는 못 받는다', fs: 13.5, color: MUT, s: pop(u, 1.6) });
      sub(QX5 + 41, 400, 'exclusive 임시 큐 3개', fade(u, 1.2), { fill: INK, 'font-weight': 700 }); }
    if (k === 4) { IY.forEach((y, i) => send([[EX5 + 98, 210], [QX5, y], [QX5 + 70, y]], seg(u, 0.2, 1.0), GOOD, null));
      IY.forEach((y, i) => send([[QX5 + 82, y], [IX - 115, y]], seg(u, 1.1 + i * 0.2, 1.6 + i * 0.2), GOOD, null));
      banner(EX5, 372, '인스턴스가 몇 대든 발행 코드는 그대로', pop(u, 2.2)); } }

  const quiz = [
    { q: 'fanout exchange에 routing key "whatever"를 넣어 발행했을 때 일어나는 일은 무엇인가?',
      o: ['key가 없는 큐는 못 받는다', 'key를 읽지 않고 바인딩된 모든 큐에 한 벌씩 넣는다', '잘못된 key라 에러가 난다'], a: 1,
      why: 'fanout은 매칭 규칙이 없다. 넣은 key는 무시되고 바인딩된 큐 3개가 모두 받는다.' },
    { q: 'queue=""와 exclusive=True로 선언한 큐의 특징은 무엇인가?',
      o: ['서버가 이름을 짓고, 선언한 연결이 닫히면 지워진다', '이름이 빈 큐라 default exchange로만 받는다', '재시작해도 남는 영구 큐가 된다'], a: 0,
      why: '이름은 amq.gen-로 시작하게 서버가 짓는다. exclusive 큐는 그 연결 전용이고 연결이 끊기면 사라진다.' },
    { q: 'fanout에 붙은 감사 로거가 느릴 때 이메일 발송기가 받는 영향은 무엇인가?',
      o: ['감사 로거가 ack할 때까지 이메일도 기다린다', '이메일 큐에 메시지가 두 벌 쌓인다', '영향이 없다, 큐가 따로라 각자 속도로 소비한다'], a: 2,
      why: '발행 1건이 큐마다 한 벌씩 들어간다. 소비는 큐별로 따로 돌아서 느린 소비자가 다른 큐를 막지 않는다.' },
    { q: '모든 메시지를 받을 때 topic의 # 바인딩보다 fanout이 나은 이유는 무엇인가?',
      o: ['fanout은 메시지를 압축해서 보낸다', '매칭 단계 없이 바로 복제하고 의도가 코드에 드러난다', 'topic의 #는 일부 메시지를 빠뜨린다'], a: 1,
      why: '결과는 같지만 topic은 메시지마다 패턴을 따라 내려간다. 무조건 전원이면 fanout이 더 단순하다.' },
    { q: '캐시 무효화를 fanout으로 보낼 때 인스턴스를 3대에서 30대로 늘리면 바꿔야 할 것은 무엇인가?',
      o: ['발행 코드는 그대로 두고 새 인스턴스가 자기 임시 큐만 붙인다', '발행 함수에 새 인스턴스 주소를 추가한다', 'exchange를 인스턴스 수만큼 만든다'], a: 0,
      why: '발행자는 누가 듣는지 모른다. 받는 쪽이 늘면 큐와 바인딩만 늘어난다.' },
  ];

  const summary = [
    'Fanout exchange는 routing key를 읽지 않고 바인딩된 모든 큐에 한 벌씩 넣는다.',
    '소비자마다 서버가 이름 짓는 exclusive 큐를 붙이면 연결이 끊길 때 큐도 사라진다.',
    '큐가 따로라서 느린 소비자가 있어도 다른 소비자는 제 속도로 받는다.',
    '전원에게 보내는 것이 목적이면 topic의 # 보다 매칭이 없는 fanout이 단순하다.',
  ];
  const review = [
    { q: '앱 인스턴스가 재시작한 뒤 그 사이에 바뀐 상품이 옛 캐시로 보인다. 먼저 의심할 것은 무엇인가?',
      o: ['fanout이 routing key를 잘못 읽었다', '내려가 있던 동안 exclusive 임시 큐가 없어 무효화를 못 받았다', '다른 인스턴스가 ack를 안 했다'], a: 1,
      why: '임시 큐는 연결과 함께 사라지므로 꺼져 있던 동안의 메시지는 남지 않는다. 재기동할 때 로컬 캐시를 비우고 시작해야 한다.' },
    { q: '주문 이벤트를 이메일·푸시·감사 세 곳이 모두 받아야 하고, 앞으로 받는 곳이 더 늘어난다. 맞는 구성은 무엇인가?',
      o: ['default exchange로 큐 이름마다 따로 세 번 발행한다', 'direct exchange에 큐마다 다른 key로 바인딩한다', 'fanout exchange 하나에 소비자마다 큐를 붙인다'], a: 2,
      why: 'fanout은 1건을 바인딩된 큐 수만큼 복제한다. 받는 곳이 늘어도 발행 코드는 바뀌지 않는다.' },
    { q: '감사 로거만 영구 보관이 필요하다. 감사 로거 큐는 어떻게 선언해야 하는가?',
      o: ['이름을 고정한 durable 큐로 선언해 fanout에 바인딩한다', 'queue=""와 exclusive=True로 선언한다', '큐 없이 exchange만 durable로 둔다'], a: 0,
      why: 'exclusive 임시 큐는 연결이 끊기면 사라진다. 끊긴 사이 메시지도 남겨야 하면 이름 있는 durable 큐가 맞다.' },
  ];

  R.page({ title: 'Fanout 브로드캐스트', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
