/* I-1-1 Producer·Exchange·Binding·Queue·Consumer — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 이 챕터의 그림 부품 ----------
  // 앱(프로듀서·컨슈머): 이름(고정폭) + 역할
  function app(cx, cy, name, role, o) { o = o || {}; const w = Math.max(128, tw(name, 15) + 30);
    const g = card(cx, cy, w, 58, { rx: 10, stroke: o.col || INK, sw: 2.2, fill: o.fill, s: o.s, op: o.op });
    tx(0, -4, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: o.col || INK }, g);
    tx(0, 17, role, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  // exchange: 육각형 (라우터)
  function exch(cx, cy, name, type, o) { o = o || {}; const w = o.w || 150, h = 66, c = o.col || ACC, g = R.G(cx, cy, o.s, o.op);
    el('path', { d: `M${-w / 2},0 L${-w / 2 + 18},${-h / 2} L${w / 2 - 18},${-h / 2} L${w / 2},0 L${w / 2 - 18},${h / 2} L${-w / 2 + 18},${h / 2} Z`, fill: o.fill || ACCBG, stroke: c, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    tx(0, type ? -4 : 6, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: c, class: 'mono' }, g);
    if (type) tx(0, 18, type, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  // 큐: 가로 관. 메시지는 오른쪽(머리)부터 쌓인다. msgs: [{t, col, op}]
  function queue(x, y, w, name, msgs, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: 42, rx: 21, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2.2, 'stroke-dasharray': o.dash, opacity: op });
    tx(x + 12, y - 10, name, { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: o.col || INK, opacity: op });
    if (o.depth != null) mono(x + w - 8, y - 10, 'depth ' + o.depth, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op });
    (msgs || []).forEach((m, i) => { if (!m) return; msg(x + w - 34 - i * 58, y + 21, m.t, { fill: m.col, op: (m.op ?? 1) * op, s: m.s }); }); }
  // 메시지 봉투
  function msg(cx, cy, t, o) { o = o || {}; const w = Math.max(44, tw(t, 13.5) + 16);
    return card(cx, cy, w, 26, { rx: 6, fill: o.fill || ACC, stroke: 'none', text: t, fs: 13.5, fw: 700, color: o.color || PANEL, mono: true, s: o.s, op: o.op }); }
  // binding: 점선이 자라고 가운데에 routing key
  function bind(x1, y1, x2, y2, key, u, o) { o = o || {}; if (u <= 0) return; const col = o.col || INK;
    el('line', { x1, y1, x2: lerp(x1, x2, u), y2: lerp(y1, y2, u), stroke: col, 'stroke-width': 2.4, 'stroke-dasharray': '7 5' });
    if (key && u > 0.6) pill((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 + (o.dy ?? -18), key, col, pop(u, 0.6, 0.4) * 1, { mono: true, fs: 13.5, fill: PANEL }); }
  const arrowTo = (x1, y1, x2, y2, u, col) => grow(x1, y1, x2, y2, u, col, { sw: 2.4 });

  // ---------- 1. 잘못된 그림과 실제 그림 ----------
  function s1(t, c) { const { k, u } = c, Y = 210;
    const P = [110, Y], X = [340, Y], Qx = 560, Qw = 190, W = [870, Y];
    if (k === 0) {
      banner(480, 60, '흔히 그리는 그림: Producer → Queue', pop(u, 0.2));
      app(...P, 'order-svc', 'Producer'); queue(Qx, Y - 21, Qw, 'orders.q', []); app(...W, 'worker-1', 'Consumer');
      el('line', { x1: Qx + Qw, y1: Y, x2: W[0] - 66, y2: Y, stroke: GRID, 'stroke-width': 2.4 });
      grow(P[0] + 66, Y, Qx - 6, Y, E(u, 0.4, 1.4), BAD, { dash: '8 6', sw: 2.6 });
      sub(360, Y - 18, '직접 push?', fade(u, 0.9), { fill: BAD, 'font-weight': 700 });
      cross(360, Y + 4, 16, pop(u, 1.6));
      sub(360, Y + 52, 'AMQP 0-9-1에는 이 길이 없다', fade(u, 1.9), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 });
      return; }
    // k ≥ 1: 프로듀서 · exchange · 큐 · 컨슈머
    const dflt = k === 2;
    app(...P, 'order-svc', 'Producer'); queue(Qx, Y - 21, Qw, 'orders.q', k === 2 ? [{ t: 'msg', s: pop(u, 2.2) }] : []); app(...W, 'worker-1', 'Consumer');
    el('line', { x1: Qx + Qw, y1: Y, x2: W[0] - 66, y2: Y, stroke: GRID, 'stroke-width': 2.4 });
    exch(...X, dflt ? '""' : 'orders.ex', dflt ? '기본 exchange' : 'direct', { s: k === 1 ? pop(u, 0.9) : 1, col: dflt ? INFO : ACC, fill: dflt ? 'var(--infobg)' : ACCBG });
    arrowTo(P[0] + 66, Y, X[0] - 78, Y, k === 1 ? E(u, 1.1, 1.6) : 1, ACC);
    // publish 인자 쪽지
    if (k === 1 || k === 2) { const x0 = 70, y0 = 40, op = k === 1 ? fade(u, 0.2) : 1;
      el('rect', { x: x0, y: y0, width: 400, height: 96, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      mono(x0 + 14, y0 + 24, 'basic_publish(', { 'font-size': 14.5, opacity: op });
      mono(x0 + 34, y0 + 46, dflt ? 'exchange=""' : 'exchange="orders.ex"', { 'font-size': 14.5, fill: dflt ? INFO : ACC, 'font-weight': 700, opacity: op });
      mono(x0 + 34, y0 + 68, dflt ? 'routing_key="orders.q"' : 'routing_key="orders.new"', { 'font-size': 14.5, fill: dflt ? INFO : ACC, 'font-weight': 700, opacity: op });
      mono(x0 + 14, y0 + 88, ')', { 'font-size': 14.5, opacity: op });
      if (k === 1) { const q = fade(u, 1.4); mono(x0 + 250, y0 + 46, 'queue=?', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: q, 'text-decoration': 'line-through' });
        sub(x0 + 300, y0 + 72, '자리가 없다', q, { fill: BAD, 'font-weight': 700 });
        sub(Qx - 70, Y + 2, '?', fade(u, 2), { 'font-size': 22, 'font-weight': 800, fill: MUT }); } }
    if (k === 1) sub(480, 330, 'Producer가 아는 이름은 exchange와 routing key 두 개뿐이다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 2) { // 모든 큐는 자기 이름으로 기본 exchange 에 묶여 있다
      bind(X[0] + 75, Y, Qx - 4, Y, 'key = 큐 이름', E(u, 0.2, 0.9), { col: INFO, dy: 34 });
      const r = [[P[0] + 66, Y], [X[0], Y], [Qx + Qw - 34, Y]]; dot(r, seg(u, 1.0, 2.2), INFO, 8);
      sub(480, 312, '모든 큐는 자기 이름을 key로 기본 exchange에 자동으로 묶인다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 338, '큐로 바로 간 것처럼 보여도 exchange를 한 번 거친다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 3) { // 다섯 부품 이름표 + 양 끝은 서로 모른다
      bind(X[0] + 75, Y, Qx - 4, Y, 'orders.new', E(u, 0.1, 0.6), { col: INK });
      const tags = [[P[0], '① Producer'], [X[0], '② Exchange'], [(X[0] + Qx) / 2 + 20, '③ Binding'], [Qx + Qw / 2, '④ Queue'], [W[0], '⑤ Consumer']];
      tags.forEach(([x, s], i) => lbl(x, Y + 74, s, fade(u, 0.5 + i * 0.25), { 'font-size': 15 }));
      const a = E(u, 1.8, 2.5); if (a > 0) { el('path', { d: `M${P[0]},${Y - 40} C${P[0]},${Y - 130} ${W[0]},${Y - 130} ${W[0]},${Y - 40}`, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: a });
        cross(490, Y - 112, 11, a); sub(490, Y - 138, '양 끝은 서로의 이름을 모른다', a, { fill: BAD, 'font-weight': 700 }); }
      return; }
    if (k === 1) sub(Qx + Qw / 2, Y + 50, 'binding 아직 없음', fade(u, 1.8)); }

  // ---------- 2. 선언하고 던진다 ----------
  function s2(t, c) { const { k, u } = c, Y = 230, P = [90, Y], X = [380, Y], Qx = 590, Qw = 170, W = [880, Y];
    zone(270, 80, 520, 300, 'RabbitMQ 브로커 · localhost:5672', { fill: SOFT });
    app(...P, 'order-svc', 'Producer');
    // TCP 관 + 채널 한 줄
    const pipe = k === 0 ? E(u, 0.2, 1.2) : 1;
    el('rect', { x: P[0] + 66, y: Y - 14, width: (270 - P[0] - 66) * pipe, height: 28, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    if (pipe > 0.95) el('line', { x1: P[0] + 70, y1: Y, x2: 266, y2: Y, stroke: ACC, 'stroke-width': 3, opacity: k === 0 ? fade(u, 1.3) : 1 });
    sub(210, Y - 24, 'TCP', k === 0 ? fade(u, 0.8) : 1, { 'font-weight': 700, fill: INK });
    sub(210, Y + 34, 'channel 1', k === 0 ? fade(u, 1.4) : 1, { fill: ACC, 'font-weight': 700 });
    if (k === 0) { sub(530, Y, '아직 exchange도 큐도 없다', fade(u, 1.8), { 'font-size': 15 }); return; }
    exch(...X, 'orders.ex', 'direct · durable', { s: k === 1 ? pop(u, 0.2) : 1 });
    if (k === 1) { sub(X[0], Y + 62, '재시작해도 정의가 남는다', fade(u, 1.0)); return; }
    const qw = k === 2 ? Qw * E(u, 0.2, 0.9) : Qw;
    if (qw > 20) queue(Qx, Y - 21, qw, 'orders.q', k === 4 ? [{ t: '1042', s: pop(u, 2.2) }] : [], { depth: k === 2 && u < 0.9 ? null : k === 4 ? (u > 2.2 ? 1 : 0) : 0, op: k === 2 ? fade(u, 0.2) : 1 });
    if (k === 2) { el('line', { x1: X[0] + 76, y1: Y, x2: Qx - 6, y2: Y, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '3 6', opacity: fade(u, 1.1) });
      sub(Qx + Qw / 2, Y + 54, 'binding이 없으면 이 큐로 오지 않는다', fade(u, 1.4), { fill: WARN, 'font-weight': 700 }); return; }
    bind(X[0] + 76, Y, Qx - 4, Y, 'orders.new', k === 3 ? E(u, 0.2, 1.1) : 1);
    app(...W, 'worker-1', 'Consumer', { s: k === 3 ? pop(u, 1.4) : 1 });
    el('line', { x1: Qx + Qw, y1: Y, x2: W[0] - 66, y2: Y, stroke: GRID, 'stroke-width': 2.4, opacity: k === 3 ? fade(u, 1.6) : 1 });
    if (k === 3) { sub(W[0], Y + 50, '대기', fade(u, 1.7)); return; }
    // k4: 메시지 한 건이 exchange 를 거쳐 큐로
    fly(P[0] + 40, Y - 44, X[0], Y - 44, seg(u, 0.1, 0.8), 'orders.new', { mono: true });
    const m = seg(u, 0.9, 2.1);
    if (m > 0 && m < 1) { const route = [[X[0], Y], [Qx - 4, Y], [Qx + Qw - 34, Y]]; dot(route, m, ACC, 9); }
    if (u > 0.8) { const op = fade(u, 0.8); mono(X[0], Y - 90, 'orders.new = orders.new', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: op }); check(X[0] + 118, Y - 95, 8, op); }
    sub(Qx + Qw / 2, Y + 56, 'depth 0 → 1', fade(u, 2.2), { 'font-weight': 700, fill: INK, class: 'mono' }); }

  // ---------- 3. 구독 · ack · nack ----------
  const S3 = [ // k 마다 ready / unacked (페이지의 depth 와 캡션에서)
    { r: 1, ua: 0 }, { r: 1, ua: 0 }, { r: 0, ua: 1 }, { r: 0, ua: 0 }, { r: 1, ua: 0 }, null];
  function s3(t, c) { const { k, u } = c, Qx = 120, Qw = 300, Y = 150, W = [730, 171];
    if (k === 5) { // 세 가지 약속
      const pan = [[170, 'ack가 와야 지운다'], [480, '채널이 닫히면 되돌린다'], [790, 'prefetch만큼만 준다']];
      pan.forEach(([x, s], i) => { const s0 = pop(u, 0.2 + i * 0.6); card(x, 210, 280, 250, { rx: 12, stroke: GRID, sw: 1.5, s: s0 }); lbl(x, 116, s, fade(u, 0.3 + i * 0.6), { 'font-size': 16 }); });
      const a = (i) => fade(u, 0.5 + i * 0.6);
      // 1) ack → 삭제
      msg(130, 190, '1042', { fill: WARN, op: a(0) * (1 - fade(u, 1.0, 0.5)) }); msg(215, 190, 'ack', { fill: GOOD, op: a(0) });
      check(130, 190, 12, pop(u, 1.2)); sub(170, 250, '큐에서 영구 삭제', a(0) * fade(u, 1.2));
      // 2) 컨슈머가 죽음 → 큐로 복귀
      app(540, 175, 'worker-1', '', { op: a(1) }); cross(540, 175, 22, pop(u, 1.3));
      fly(540, 230, 420, 230, seg(u, 1.6, 2.4), '1042', { fill: WARN, stay: true, mono: true });
      sub(480, 290, 'redelivered = true', fade(u, 2.3), { class: 'mono', fill: WARN, 'font-weight': 700 });
      // 3) prefetch 1 → 한 칸
      [0, 1, 2].forEach((i) => msg(760 - i * 50, 160, 'm' + (i + 1), { fill: i === 0 ? WARN : ACC, op: a(2) }));
      el('rect', { x: 735, y: 220, width: 110, height: 40, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: a(2) });
      mono(790, 245, 'prefetch 1', { 'font-size': 14, 'text-anchor': 'middle', opacity: a(2) });
      sub(790, 300, '끝내야 다음 것이 온다', a(2)); return; }
    const st = S3[k], pv = k > 0 ? S3[k - 1] : st;
    queue(Qx, Y, Qw, 'orders.q', []);
    app(...W, 'worker-1', 'Consumer');
    // prefetch 창 (한 칸)
    el('rect', { x: W[0] - 55, y: W[1] + 44, width: 110, height: 40, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: k === 0 ? fade(u, 0.3) : 1 });
    sub(W[0], W[1] + 104, 'prefetch_count = 1', k === 0 ? fade(u, 0.6) : 1, { class: 'mono', fill: INK, 'font-weight': 700 });
    // 구독선
    const sl = k === 1 ? E(u, 0.2, 1.2) : k > 1 ? 1 : 0;
    if (sl > 0) { el('line', { x1: Qx + Qw, y1: Y + 21, x2: lerp(Qx + Qw, W[0] - 66, sl), y2: Y + 21, stroke: INFO, 'stroke-width': 2.4 });
      if (k === 1) sub((Qx + Qw + W[0] - 66) / 2, Y - 6, 'basic_consume · auto_ack=False', fade(u, 1.0), { class: 'mono', fill: INFO, 'font-weight': 700 }); }
    const head = [Qx + Qw - 34, Y + 21], win = [W[0], W[1] + 64];
    if (k <= 1) msg(...head, '1042');
    if (k === 2) { const m = E(u, 0.2, 1.3); msg(lerp(head[0], win[0], m), lerp(head[1], win[1], m), '1042', { fill: m >= 1 ? WARN : ACC });
      sub(win[0], win[1] - 104, '처리 중 · 아직 ack 전', fade(u, 1.4), { fill: WARN, 'font-weight': 700 }); }
    if (k === 3) { const gone = fade(u, 1.2, 0.6); msg(...win, '1042', { fill: WARN, op: 1 - gone }); check(win[0], win[1], 13, pop(u, 1.3));
      fly(W[0] - 70, W[1] - 12, Qx + Qw - 20, Y + 21 - 30, seg(u, 0.2, 1.1), 'ack', { fill: GOOD });
      sub(Qx + Qw / 2, Y + 66, '브로커가 메시지를 지운다', fade(u, 1.3), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 4) { const m = E(u, 0.3, 1.5); msg(lerp(win[0], head[0], m), lerp(win[1], head[1], m), '1042', { fill: m >= 1 ? ACC : BAD });
      fly(W[0] - 70, W[1] - 12, Qx + Qw - 20, Y + 21 - 30, seg(u, 0.1, 0.9), 'nack · requeue', { fill: BAD });
      sub(Qx + Qw - 34, Y + 66, 'redelivered = true', fade(u, 1.6), { class: 'mono', fill: WARN, 'font-weight': 700 }); }
    // 계기판: ready · unacked
    R.meters(150, 318, 660, [
      { name: 'ready (큐에서 기다림)', val: String(Math.round(tween(pv.r, st.r, u))) },
      { name: 'unacked (배달됨, 확인 전)', val: String(Math.round(tween(pv.ua, st.ua, u))), hot: st.ua > 0 },
    ], { h: 64 }); }

  // ---------- 4. 큐와 binding 하나 더 ----------
  function s4(t, c) { const { k, u } = c, P = [96, 225], X = [320, 225], Qx = 520, Qw = 220, Y1 = 115, Y2 = 295, W1 = [872, Y1 + 21], W2 = [872, Y2 + 21];
    app(...P, 'order-svc', 'Producer'); arrowTo(P[0] + 66, P[1], X[0] - 78, X[1], 1, ACC);
    exch(...X, 'orders.ex', 'direct');
    const m1 = k === 3 ? (u > 2.3 ? [{ t: '1043' }] : []) : k === 4 && u > 2.3 ? [{ t: '1043' }] : [];
    const m2 = k === 3 && u > 2.3 ? [{ t: '1043' }] : [];
    queue(Qx, Y1, Qw, 'orders.q', m1);
    bind(X[0] + 66, X[1] - 16, Qx - 4, Y1 + 21, 'orders.new', 1, { dy: -16, dx: -6 });
    app(...W1, 'order-worker', 'Consumer'); el('line', { x1: Qx + Qw, y1: Y1 + 21, x2: W1[0] - 74, y2: W1[1], stroke: GRID, 'stroke-width': 2.4 });
    if (k === 0) { // declare 를 두 번 불러도 같은 exchange
      [0, 1].forEach((i) => fly(160 + i * 10, 60 + i * 34, X[0], X[1] - 30, seg(u, 0.2 + i * 0.5, 1.0 + i * 0.5), 'exchange_declare', { mono: true, fill: INFO }));
      sub(X[0], X[1] + 62, '같은 이름·같은 속성 = 기존 것 그대로', fade(u, 1.6), { fill: GOOD, 'font-weight': 700 });
      sub(X[0], X[1] + 86, '속성이 다르면 406 PRECONDITION_FAILED', fade(u, 2.1), { fill: BAD }); return; }
    const qop = k === 1 ? fade(u, 0.2) : 1;
    queue(Qx, Y2, Qw * (k === 1 ? E(u, 0.2, 0.9) : 1) || 1, 'notify.q', m2, { op: qop });
    if (k === 1) { el('line', { x1: X[0] + 66, y1: X[1] + 16, x2: Qx - 6, y2: Y2 + 21, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '3 6', opacity: fade(u, 1.0) });
      sub(Qx + Qw / 2, Y2 + 66, 'binding 없음 · 아무것도 안 들어온다', fade(u, 1.3), { fill: WARN, 'font-weight': 700 }); return; }
    bind(X[0] + 66, X[1] + 16, Qx - 4, Y2 + 21, 'orders.new', k === 2 ? E(u, 0.2, 1.2) : 1, { dy: 18, dx: -6 });
    if (k === 2) { pill(X[0], X[1] + 74, '매칭 큐 1 → 2', ACC, pop(u, 1.4), { fs: 14 }); return; }
    app(...W2, 'notify-worker', 'Consumer', { s: k === 3 ? pop(u, 2.0) : 1 }); el('line', { x1: Qx + Qw, y1: Y2 + 21, x2: W2[0] - 74, y2: W2[1], stroke: GRID, 'stroke-width': 2.4, opacity: k === 3 ? fade(u, 2.0) : 1 });
    if (k === 3) { fly(P[0] + 20, P[1] - 46, X[0] - 10, X[1] - 46, seg(u, 0.1, 0.8), '{"id":1043}', { mono: true });
      const sp = seg(u, 1.0, 2.2); dot([[X[0], X[1]], [Qx - 4, Y1 + 21], [Qx + Qw - 34, Y1 + 21]], sp, ACC, 8); dot([[X[0], X[1]], [Qx - 4, Y2 + 21], [Qx + Qw - 34, Y2 + 21]], sp, ACC, 8);
      sub(X[0], X[1] + 66, '복사본 두 개', fade(u, 1.1), { fill: ACC, 'font-weight': 700 }); return; }
    // k4: 큐마다 따로 처리 · ack
    const mv = E(u, 0.6, 1.4), h1 = [Qx + Qw - 34, Y1 + 21], h2 = [Qx + Qw - 34, Y2 + 21];
    if (u < 2.3) msg(lerp(h1[0], W1[0], mv), lerp(h1[1], W1[1] + 44, mv), '1043', { fill: mv >= 1 ? WARN : ACC });
    if (u >= 2.3) sub(Qx + Qw / 2, Y1 + 66, 'nack · requeue → orders.q에 다시', 1, { fill: BAD, 'font-weight': 700 });
    msg(lerp(h2[0], W2[0], mv), lerp(h2[1], W2[1] + 44, mv), '1043', { fill: mv >= 1 ? WARN : ACC, op: 1 - fade(u, 1.8, 0.5) });
    check(W2[0], W2[1] + 44, 12, pop(u, 1.9)); sub(W2[0] - 6, W2[1] - 46, 'ack', fade(u, 1.8), { fill: GOOD, 'font-weight': 800, 'font-size': 15 });
    if (u >= 1.6) { cross(W1[0], W1[1] + 44, 11, pop(u, 1.6)); }
    sub(480, 400, '한쪽 nack이 다른 큐의 ack에 영향을 주지 않는다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 5. topology.yaml 로 같은 그림을 ----------
  const YAML = ['exchanges:', '  - orders.ex   direct', 'queues:', '  - orders.q', '  - notify.q', 'bindings:', '  - orders.q   orders.new', '  - notify.q   orders.new'];
  const SHOW = [2, 4, 5, 7, 8, 8];   // k 마다 보이는 줄 수
  const HOT = [1, 3, 4, 6, 7, -1];
  function s5(t, c) { const { k, u } = c;
    const x0 = 24, y0 = 60; el('rect', { x: x0, y: y0, width: 290, height: 240, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(x0 + 14, y0 - 12, 'topology.yaml', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const n = SHOW[k], prevN = k > 0 ? SHOW[k - 1] : 0;
    YAML.slice(0, n).forEach((s, i) => { const hot = i === HOT[k], op = i >= prevN ? fade(u, 0.1 + (i - prevN) * 0.25) : 1;
      if (hot) el('rect', { x: x0 + 6, y: y0 + 14 + i * 27, width: 278, height: 25, rx: 4, fill: ACCBG, opacity: op });
      mono(x0 + 16, y0 + 32 + i * 27, s, { 'font-size': 14.5, fill: hot ? ACC : INK, 'font-weight': hot ? 700 : 400, opacity: op }); });
    // 오른쪽: 파일대로 서는 토폴로지
    const X = [490, 200], Qx = 620, Qw = 150, Y1 = 105, Y2 = 255;
    exch(...X, 'orders.ex', 'durable', { w: 130, s: k === 0 ? pop(u, 0.6) : 1 });
    if (k >= 1) queue(Qx, Y1, Qw, 'orders.q', [], { op: k === 1 ? fade(u, 0.6) : 1 });
    if (k >= 2) queue(Qx, Y2, Qw, 'notify.q', [], { op: k === 2 ? fade(u, 0.6) : 1 });
    if (k >= 3) bind(X[0] + 58, X[1] - 14, Qx - 4, Y1 + 21, null, k === 3 ? E(u, 0.6, 1.4) : 1);
    if (k >= 4) bind(X[0] + 58, X[1] + 14, Qx - 4, Y2 + 21, null, k === 4 ? E(u, 0.6, 1.4) : 1);
    if (k === 2) sub(Qx + Qw / 2, 350, 'bindings가 비어 있어 아직 흐르지 않는다', fade(u, 1.2), { fill: WARN, 'font-weight': 700 });
    if (k === 0) sub(X[0], X[1] + 60, 'durable: 재시작해도 정의가 남는다', fade(u, 1.2));
    if (k === 4) { app(380, 340, 'order-svc', 'Producer', { s: pop(u, 1.6) }); app(880, 126, 'order-worker', '', { s: pop(u, 1.8) }); app(880, 276, 'notify-worker', '', { s: pop(u, 2.0) });
      sub(560, 402, 'dev · stage · prod에 같은 파일을 넣으면 같은 토폴로지', fade(u, 2.2), { 'font-size': 14.5 }); }
    if (k === 5) { const roles = [[490, 270, 'Exchange: 규칙대로 큐를 고른다'], [695, 180, 'Binding: 라우팅 규칙'], [700, 334, 'Queue: ack 전까지 보관']];
      roles.forEach(([x, y, s], i) => pill(x, y, s, i === 1 ? INK : ACC, pop(u, 0.2 + i * 0.4), { fs: 13.5, fill: PANEL }));
      sub(480, 372, 'Producer는 exchange 이름만, Consumer는 큐 이름만 안다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 400, 'exchange 타입을 바꾸면 같은 다섯 부품으로 다른 라우팅이 된다', fade(u, 2.1), { 'font-size': 14.5 }); } }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'pika의 basic_publish가 받는 이름은 무엇인가?',
      o: ['큐 이름 하나', 'exchange 이름과 routing key', '컨슈머 이름과 큐 이름'], a: 1,
      why: 'publish 인자에는 exchange와 routing_key만 있다. 기본 exchange("")를 쓸 때도 큐 이름은 routing key 자리에 들어간다.' },
    { q: 'orders.ex와 orders.q를 선언만 하고 binding을 걸지 않은 채 publish하면 메시지는 어떻게 되는가?',
      o: ['orders.q에 자동으로 들어간다', 'exchange에 쌓여 binding을 기다린다', '어느 큐로도 가지 못하고 버려진다'], a: 2,
      why: 'exchange는 메시지를 저장하지 않는다. 맞는 binding이 없으면 갈 곳이 없어 버려진다(mandatory를 켜지 않은 경우).' },
    { q: 'worker-1이 메시지를 받아 처리 중이고 아직 ack를 보내지 않았다. 이 메시지의 상태는 무엇인가?',
      o: ['ready 0, unacked 1로 브로커가 들고 있다', '큐에서 이미 지워졌다', 'ready 1로 다시 대기 중이다'], a: 0,
      why: '배달된 뒤 ack 전까지는 unacked로 남는다. ack가 오면 지우고, 채널이 닫히거나 nack(requeue)가 오면 큐로 돌아간다.' },
    { q: '알림 서비스가 같은 주문 메시지를 받게 하려면 무엇을 바꾸는가?',
      o: ['Producer가 notify.q에도 한 번 더 publish하게 고친다', 'notify.q를 만들고 같은 key로 binding을 하나 더 건다', 'orders.q를 두 컨슈머가 같이 구독하게 한다'], a: 1,
      why: 'binding이 두 개면 exchange가 메시지를 두 큐에 복사한다. 같은 큐를 두 컨슈머가 구독하면 복사가 아니라 나눠 갖는다.' },
    { q: 'topology.yaml에서 durable: true가 보장하는 것은 무엇인가?',
      o: ['브로커가 재시작해도 exchange·큐 정의가 남는다', '큐 안의 모든 메시지가 디스크에 남는다', '컨슈머가 죽어도 메시지가 사라지지 않는다'], a: 0,
      why: 'durable은 정의의 생존이다. 메시지를 디스크에 남기려면 따로 delivery_mode=2(persistent)로 보내야 한다.' },
  ];

  const summary = [
    'Producer는 큐가 아니라 exchange에 routing key와 함께 메시지를 보낸다.',
    'exchange는 binding 규칙을 보고 큐를 고르고, 맞는 binding이 없으면 버린다.',
    '컨슈머가 ack를 보내야 메시지가 지워지고, 그 전까지는 unacked로 남는다.',
    '새 구독자는 큐와 binding만 더하면 되고 Producer 코드는 그대로다.',
  ];
  const review = [
    { q: 'notify.q를 새로 만들었는데 메시지가 한 건도 쌓이지 않는다. 먼저 의심할 것은?',
      o: ['notify.q에 걸린 binding이나 그 routing key', 'Producer의 publish 인자에 notify.q가 빠진 것', '컨슈머의 prefetch 값'], a: 0,
      why: '큐는 binding이 있어야 라우팅 대상이 된다. Producer는 큐 이름을 넘기지 않으므로 고칠 곳은 binding이다.' },
    { q: 'worker-1이 주문을 처리하다 프로세스가 죽었다. ack는 보내지 않았다. 그 주문 메시지는?',
      o: ['이미 배달됐으므로 사라진다', '채널이 닫히면서 큐로 돌아가 다시 배달된다', 'notify.q로 옮겨진다'], a: 1,
      why: 'ack 전의 메시지는 unacked로 브로커에 남아 있다. 채널이 닫히면 큐로 돌아가고 redelivered=true로 다시 나간다.' },
    { q: 'exchange_declare("orders.ex", "direct")를 여러 서비스가 각자 부른다. 한 서비스만 durable=False로 부르면?',
      o: ['그 서비스용 exchange가 따로 하나 더 생긴다', '조용히 무시되고 기존 것이 쓰인다', '속성이 달라 406 PRECONDITION_FAILED로 거절된다'], a: 2,
      why: 'declare는 같은 이름·같은 속성일 때만 멱등이다. 속성이 다르면 브로커가 거절하고 그 채널을 닫는다.' },
  ];

  R.page({ title: 'Exchange 라우팅 지도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
