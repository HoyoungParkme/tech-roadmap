/* I-1-4 Producer / Consumer + ack — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   장면 3의 분배 순서와 끝나는 시각은 RabbitMQ 규칙(라운드로빈, prefetch 한도)을 재현한 시뮬레이션 값이다. 처리 시간은 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, dbIcon, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  function app(cx, cy, name, o) { o = o || {}; return card(cx, cy, o.w || 110, 54, { rx: 10, text: name, fs: 15, fw: 800, mono: true, stroke: o.col || INK, color: o.col || INK, s: o.s, op: o.op }); }
  function exch(cx, cy, name, o) { o = o || {}; const w = o.w || 130, h = 56, c = o.col || ACC, g = R.G(cx, cy, o.s, o.op);
    el('path', { d: `M${-w / 2},0 L${-w / 2 + 16},${-h / 2} L${w / 2 - 16},${-h / 2} L${w / 2},0 L${w / 2 - 16},${h / 2} L${-w / 2 + 16},${h / 2} Z`, fill: o.fill || ACCBG, stroke: c, 'stroke-width': 2.5 }, g);
    tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: c, class: 'mono' }, g); return g; }
  function msg(cx, cy, t, o) { o = o || {}; const w = Math.max(40, tw(t, 13.5) + 16);
    return card(cx, cy, w, 26, { rx: 6, fill: o.fill || ACC, stroke: 'none', text: t, fs: 13.5, fw: 700, color: PANEL, mono: true, s: o.s, op: o.op }); }
  // 큐: 머리는 오른쪽. msgs 는 머리부터
  function queue(x, y, w, name, msgs, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: 40, rx: 20, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2.2, opacity: op });
    tx(x + 10, y - 9, name, { 'font-size': 14.5, 'font-weight': 800, class: 'mono', fill: o.col || INK, opacity: op });
    if (o.cnt) mono(x + w / 2, y + 60, o.cnt, { 'font-size': 14, fill: INK, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
    (msgs || []).forEach((m, i) => { if (m) msg(x + w - 28 - i * 46, y + 20, m.t || m, { fill: m.col, op: op * (m.op ?? 1), s: m.s }); }); }
  const counts = (r, ua) => `ready ${r} · unacked ${ua}`;

  // ---------- 1. publish → deliver ----------
  function s1(t, c) { const { k, u } = c, Y = 200, P = [80, Y], X = [250, Y], Qx = 440, Qw = 230, W1 = [840, 150];
    zone(170, 70, 520, 290, 'RabbitMQ', { fill: SOFT });
    app(...P, 'Producer'); grow(P[0] + 56, Y, 168, Y, k === 0 ? E(u, 0.2, 0.9) : 1, ACC);
    mono(115, Y + 50, 'localhost:5672', { 'font-size': 13.5, fill: MUT, opacity: k === 0 ? fade(u, 0.8) : 1 });
    if (k === 0) { sub(430, Y, '아직 exchange도 큐도 없다', fade(u, 1.2), { 'font-size': 15 }); return; }
    exch(...X, 'orders', { s: k === 1 ? pop(u, 0.2) : 1 });
    const g = k === 1 ? E(u, 0.6, 1.4) : 1;
    const ready = k === 1 ? [] : k === 2 ? (u > 1.6 ? ['m1'] : []) : k === 3 ? ['m1', { t: 'm2', s: pop(u, 0.3) }, { t: 'm3', s: pop(u, 0.6) }] : u < 0.8 ? ['m1', 'm2', 'm3'] : [];
    const r = k === 2 ? (u > 1.6 ? 1 : 0) : k === 3 ? 3 : k === 4 ? (u < 0.8 ? 3 : 0) : 0, ua = k === 4 && u >= 0.8 ? 3 : 0;
    if (g > 0.05) queue(Qx, Y - 20, Qw * g, 'orders.queue', g > 0.95 ? ready : [], { cnt: g > 0.95 ? counts(r, ua) : null });
    if (k >= 1) { el('line', { x1: X[0] + 66, y1: Y, x2: lerp(X[0] + 66, Qx - 4, g), y2: Y, stroke: INK, 'stroke-width': 2.4, 'stroke-dasharray': '7 5' });
      if (g > 0.9) mono((X[0] + 66 + Qx) / 2, Y - 12, 'order.created', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700 }); }
    if (k === 1) { sub(430, 330, 'exchange · 큐 · binding 세 줄이 길을 만든다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { fly(P[0], Y - 42, X[0], Y - 42, seg(u, 0.2, 0.9), 'order.created', { mono: true });
      dot([[X[0], Y], [Qx - 4, Y], [Qx + Qw - 28, Y]], seg(u, 0.9, 1.6), ACC, 8);
      sub(430, 330, '큐 이름은 publish 어디에도 없다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k3·k4: 컨슈머 C1
    app(...W1, 'C1', { s: k === 3 ? pop(u, 0.9) : 1 });
    if (k === 3) { const op = fade(u, 1.2); el('rect', { x: 720, y: 220, width: 230, height: 76, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      mono(734, 244, 'def on_message(...):', { 'font-size': 14, opacity: op }); mono(750, 266, 'print(order)', { 'font-size': 14, opacity: op });
      mono(750, 288, 'basic_ack', { 'font-size': 14, fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 1.8) }); cross(870, 283, 8, pop(u, 1.9)); return; }
    // k4: prefetch 를 걸지 않아 3건이 한꺼번에 C1 로
    el('line', { x1: Qx + Qw, y1: Y, x2: W1[0] - 56, y2: W1[1] + 10, stroke: INFO, 'stroke-width': 2.4, opacity: fade(u, 0.1) });
    ['m1', 'm2', 'm3'].forEach((m, i) => { const a = E(u, 0.8 + i * 0.25, 1.6 + i * 0.25), from = [Qx + Qw - 28 - i * 46, Y], to = [W1[0] - 46 + i * 46, W1[1] + 52];
      if (u >= 0.8) msg(lerp(from[0], to[0], a), lerp(from[1], to[1], a), m, { fill: a >= 1 ? WARN : ACC }); });
    sub(W1[0], W1[1] + 88, 'unacked 3 · ack 없음', fade(u, 2.0), { fill: WARN, 'font-weight': 700 });
    sub(430, 330, 'prefetch를 걸지 않아 쌓인 3건이 한꺼번에 간다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 2. 언제 지우나: auto-ack vs manual ack ----------
  function s2(t, c) { const { k, u } = c, Qx = 70, Qw = 260, Y = 150, C1 = [600, 170], C2 = [600, 300];
    if (k === 3) { // nack 두 갈래
      app(160, 200, 'C1'); msg(160, 250, 'm2', { fill: WARN });
      tx(300, 120, 'TransientError', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3) }); tx(300, 310, 'PermanentError', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
      grow(220, 185, 560, 120, E(u, 0.4, 1.0), WARN); grow(220, 215, 560, 300, E(u, 1.3, 1.9), BAD);
      mono(390, 140, 'nack(requeue=True)', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.8) }); mono(380, 275, 'nack(requeue=False)', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) });
      queue(580, 100, 300, 'orders.queue', [{ t: 'm2', s: pop(u, 1.0) }, 'm3'], { op: fade(u, 0.6) }); sub(730, 172, '같은 큐로 다시 · 재시도', fade(u, 1.1), { fill: WARN, 'font-weight': 700 });
      exch(660, 300, 'DLX', { col: BAD, fill: 'var(--badbg)', s: pop(u, 1.8), w: 110 }); sub(800, 305, '격리 · 조사', fade(u, 2.1), { fill: BAD, 'font-weight': 700 });
      sub(480, 400, '큐에 DLX가 설정돼 있을 때 그리로 가고, 없으면 버려진다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    const auto = k <= 1;
    lbl(480, 46, auto ? 'auto_ack=True · 배달하는 순간 지운다' : 'auto_ack=False · ack가 와야 지운다', 1, { fill: auto ? BAD : GOOD, 'font-size': 16 });
    app(...C1, 'C1'); if (k === 4) app(...C2, 'C2');
    const head = [Qx + Qw - 28, Y + 20], inbox = [C1[0], C1[1] + 50];
    if (k === 0) { const a = E(u, 0.2, 0.9); queue(Qx, Y, Qw, 'orders.queue', [{ t: 'm1', op: 0 }, 'm2', 'm3'], { cnt: counts(u > 0.9 ? 2 : 3, 0) });
      msg(lerp(head[0], inbox[0], a), lerp(head[1], inbox[1], a), 'm1', { op: 1 - fade(u, 2.0, 0.4), fill: a >= 1 ? BAD : ACC });
      if (u > 0.9) { cross(head[0], head[1], 9, pop(u, 0.9)); sub(head[0], head[1] - 32, '이미 삭제', 1, { fill: BAD, 'font-weight': 700 }); }
      cross(C1[0], C1[1], 22, pop(u, 1.5)); sub(C1[0], C1[1] + 100, 'process_payment 중 crash → m1 유실', fade(u, 1.8), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 1) { const n = Math.min(3, Math.floor(seg(u, 0.2, 2.2) * 4)); queue(Qx, Y, Qw, 'orders.queue', ['m1', 'm2', 'm3'].slice(n), { cnt: counts(3 - n, 0) });
      for (let i = 0; i < n; i++) msg(C1[0] - 46 + i * 46, inbox[1], 'm' + (i + 1), { fill: OFF });
      sub(Qx + Qw / 2, Y + 80, 'ready만 줄고 unacked는 0에 머문다', fade(u, 1.0), { fill: BAD, 'font-weight': 700 });
      sub(Qx + Qw / 2, Y + 106, '브로커가 처리 중인 메시지를 추적하지 않는다', fade(u, 1.6)); return; }
    if (k === 2) { const a = E(u, 0.1, 0.7); const gone = u > 1.8;
      queue(Qx, Y, Qw, 'orders.queue', [{ t: 'm1', col: WARN, op: gone ? 0 : 0.35 }, 'm2', 'm3'], { cnt: counts(2, gone ? 0 : 1) });
      if (!gone) msg(lerp(head[0], inbox[0], a), lerp(head[1], inbox[1], a), 'm1', { fill: WARN });
      mono(inbox[0], inbox[1] + 36, 'delivery_tag = 1', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: fade(u, 0.7) });
      fly(C1[0] - 60, C1[1] - 12, head[0], head[1] - 34, seg(u, 1.1, 1.8), 'basic_ack(1)', { fill: GOOD, mono: true });
      if (gone) { check(head[0], head[1], 11, pop(u, 1.8)); sub(Qx + Qw / 2, Y + 80, '처리가 끝난 뒤에 지운다', 1, { fill: GOOD, 'font-weight': 700 }); } return; }
    // k4: prefetch 1 + manual, C1 이 죽으면 C2 에게
    sub(C1[0] + 110, C1[1] - 40, 'prefetch 1', 1, { class: 'mono' }); sub(C2[0] + 110, C2[1] - 40, 'prefetch 1', 1, { class: 'mono' });
    const back = E(u, 1.0, 1.6), to2 = E(u, 1.8, 2.4);
    queue(Qx, Y, Qw, 'orders.queue', [back >= 1 && to2 <= 0 ? { t: 'm1', col: WARN } : null, 'm2', 'm3'], { cnt: counts(u > 1.6 && u < 1.8 ? 3 : 2, u < 1.0 || u > 2.4 ? 1 : 0) });
    if (back < 1) msg(lerp(inbox[0], head[0], back), lerp(inbox[1], head[1], back), 'm1', { fill: WARN });
    if (u > 0.6) cross(C1[0], C1[1], 22, pop(u, 0.6));
    if (to2 > 0) msg(lerp(head[0], C2[0], to2), lerp(head[1], C2[1] + 50, to2), 'm1', { fill: WARN });
    sub(C2[0], C2[1] + 86, 'redelivered = true', fade(u, 2.3), { class: 'mono', fill: WARN, 'font-weight': 700 }); }

  // ---------- 3. prefetch 와 공정 분배 (시뮬레이션) ----------
  const G0 = { C1: [['m2', 0, 4], ['m4', 4, 5]], C2: [['m3', 0, 1], ['m5', 1, 2]] };   // prefetch 0 (한도 없음)
  const G1 = { C1: [['m2', 0, 4]], C2: [['m3', 0, 1], ['m4', 1, 2], ['m5', 2, 3]] };   // prefetch 1
  function gantt(x, y, w, G, end, title, u, d, col) { const X = (s) => x + 60 + s * (w - 60) / 5;
    tx(x, y - 14, title, { 'font-size': 15, 'font-weight': 800, fill: col });
    ['C1', 'C2'].forEach((cn, r) => { const yy = y + r * 40; mono(x, yy + 20, cn, { 'font-size': 14.5, 'font-weight': 700 });
      el('rect', { x: X(0), y: yy + 2, width: X(5) - X(0), height: 28, rx: 4, fill: SOFT });
      G[cn].forEach(([m, a, b]) => { const g = clamp(seg(u, d, d + 1.4) * 5 - a) / 1; const len = clamp((seg(u, d, d + 1.4) * 5 - a) / (b - a));
        if (len <= 0) return; el('rect', { x: X(a) + 1, y: yy + 3, width: (X(b) - X(a) - 2) * len, height: 26, rx: 4, fill: m === 'm2' ? WARN : col });
        if (len > 0.6) mono((X(a) + X(b)) / 2, yy + 21, m, { 'font-size': 13.5, 'text-anchor': 'middle', fill: PANEL, 'font-weight': 700 }); }); });
    [0, 1, 2, 3, 4, 5].forEach((s) => mono(X(s), y + 98, String(s), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
    const op = fade(u, d + 1.4); el('line', { x1: X(end), y1: y - 6, x2: X(end), y2: y + 80, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: op });
    mono(X(end) + 6, y - 10, '끝 ' + end + '초', { 'font-size': 14, 'font-weight': 800, fill: col, opacity: op }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0 || k === 4) { gantt(80, 70, 800, G0, 5, 'prefetch 없음 · 미리 나눠 준다', k === 0 ? u : 3, 0.4, INFO);
      if (k === 4) gantt(80, 250, 800, G1, 4, 'prefetch 1 · 끝낸 쪽이 가져간다', u, 0.2, GOOD);
      else sub(480, 260, 'C2는 2초에 끝나고 놀고, C1 앞에 m4가 쌓여 있다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 410, '처리 시간은 예시 (m2만 4초, 나머지 1초)', 1, { 'font-size': 13.5 }); return; }
    // k1~k3: 큐와 두 컨슈머의 한 칸짜리 창
    const Q = k === 1 ? ['m4', 'm5'] : k === 2 ? (u < 1.0 ? ['m4', 'm5'] : ['m5']) : [{ t: 'm2', col: WARN, s: pop(u, 1.2) }, 'm5'];
    queue(60, 180, 300, 'orders.queue', Q);
    [['C1', 120], ['C2', 290]].forEach(([n, y], i) => { app(700, y, n); el('rect', { x: 790, y: y - 18, width: 70, height: 36, rx: 6, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      mono(825, y + 40, 'prefetch 1', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
    const box = (i) => [825, i === 0 ? 120 : 290];
    if (k === 1) { const a = E(u, 0.4, 1.2); msg(lerp(410, box(0)[0], a), lerp(170, box(0)[1], a), 'm2', { fill: a >= 1 ? WARN : ACC }); msg(lerp(410, box(1)[0], a), lerp(230, box(1)[1], a), 'm3', { fill: a >= 1 ? WARN : ACC });
      sub(480, 400, 'unacked가 1보다 작은 컨슈머에게만 준다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { msg(...box(0), 'm2', { fill: WARN });
      if (u < 0.8) msg(...box(1), 'm3', { fill: WARN }); fly(760, 270, 380, 180, seg(u, 0.2, 0.9), 'basicAck(m3)', { fill: GOOD, mono: true });
      const a = E(u, 1.0, 1.8); if (u >= 1.0) msg(lerp(330, box(1)[0], a), lerp(200, box(1)[1], a), 'm4', { fill: a >= 1 ? WARN : ACC });
      sub(480, 400, '먼저 끝낸 C2가 다음 m4를 가져간다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k3: C1 이 m2 를 nack(requeue=true)
    msg(...box(1), 'm4', { fill: WARN });
    const a = E(u, 0.3, 1.1); if (a < 1) msg(lerp(box(0)[0], 330, a), lerp(box(0)[1], 200, a), 'm2', { fill: BAD });
    mono(560, 82, 'basicNack(tag, false, true)', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
    sub(210, 262, '큐로 돌아온 m2 · redelivered', fade(u, 1.3), { fill: WARN, 'font-weight': 700 });
    sub(480, 400, 'ack든 nack든 응답하면 C1의 칸이 빈다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 4. publisher confirm ----------
  function s4(t, c) { const { k, u } = c, P = [90, 170], X = [420, 170], Q = [660, 170];
    app(...P, 'Producer', { w: 120 }); exch(...X, 'orders');
    if (k !== 3) { el('line', { x1: X[0] + 66, y1: X[1], x2: Q[0] - 80, y2: Q[1], stroke: INK, 'stroke-width': 2.4, 'stroke-dasharray': '7 5' }); card(Q[0], Q[1], 160, 44, { rx: 22, text: 'orders.queue', fs: 14.5, mono: true, fw: 700, stroke: INK }); }
    if (k === 0) { fly(P[0] + 40, P[1] - 40, X[0] - 60, X[1] - 40, seg(u, 0.2, 1.0), 'basic.publish', { mono: true });
      el('line', { x1: P[0] + 60, y1: P[1], x2: X[0] - 66, y2: X[1], stroke: GRID, 'stroke-width': 2.4 }); cross(250, 170, 13, pop(u, 1.1));
      sub(250, 214, '중간에 끊겼다면?', fade(u, 1.2), { fill: BAD, 'font-weight': 700 });
      tx(P[0], 280, '?', { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.6) });
      sub(480, 340, '기본 발행은 결과를 돌려주지 않아 코드는 다음 줄로 넘어간다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    grow(P[0] + 60, P[1], X[0] - 66, X[1], 1, ACC);
    pill(P[0], 116, 'confirm 모드', GOOD, k === 1 ? pop(u, 0.3) : 1, { fs: 13.5 });
    if (k === 1) { [1, 2, 3].forEach((n, i) => { const s = pop(u, 0.9 + i * 0.3); msg(250 + i * 60, 290, 'tag ' + n, { s, fill: INFO }); });
      sub(310, 330, '채널 안 발행마다 번호가 붙고, 번호로 ack/nack이 온다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { fly(P[0] + 40, P[1] - 40, X[0] - 40, X[1] - 40, seg(u, 0.1, 0.6), 'm5 · persistent · mandatory', { mono: true });
      dot([[X[0], X[1]], [Q[0] - 80, Q[1]], [Q[0], Q[1]]], seg(u, 0.6, 1.1), ACC, 8);
      dbIcon(Q[0] + 170, Q[1] + 10, '디스크', { s: pop(u, 1.0) * 0.6 }); grow(Q[0] + 80, Q[1], Q[0] + 140, Q[1], E(u, 1.1, 1.4), MUT);
      fly(Q[0], Q[1] + 70, P[0] + 30, P[1] + 70, seg(u, 1.5, 2.3), 'basic.ack', { fill: GOOD, mono: true, stay: true });
      mono(P[0], 320, 'return True', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.4) });
      sub(560, 330, 'persistent 메시지는 디스크에 쓴 뒤 confirm이 온다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 3) { fly(P[0] + 40, P[1] - 40, X[0] - 40, X[1] - 40, seg(u, 0.1, 0.6), 'm6 · mandatory', { mono: true });
      sub(X[0] + 150, X[1] + 4, '맞는 binding 없음', fade(u, 0.7), { fill: BAD, 'font-weight': 700 });
      fly(X[0] - 40, X[1] + 60, P[0] + 40, P[1] + 60, seg(u, 0.8, 1.5), '① basic.return', { fill: BAD, mono: true, stay: true });
      fly(X[0] - 40, X[1] + 100, P[0] + 40, P[1] + 100, seg(u, 1.4, 2.0), '② basic.ack', { fill: GOOD, mono: true, stay: true });
      mono(P[0] + 10, 340, 'UnroutableError → return False', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) }); return; }
    // k4: 브로커 nack → 재발행, 그리고 두 구간
    fly(Q[0] - 40, Q[1] + 60, P[0] + 40, P[1] + 60, seg(u, 0.2, 0.9), 'basic.nack', { fill: BAD, mono: true, stay: true });
    mono(P[0] + 10, 290, 'NackError → 잠시 후 재발행', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
    const op = fade(u, 1.5); app(860, 330, 'Consumer', { w: 130, op });
    el('rect', { x: 90, y: 370, width: 470, height: 12, rx: 6, fill: ACC, opacity: op }); el('rect', { x: 570, y: 370, width: 230, height: 12, rx: 6, fill: INFO, opacity: fade(u, 1.9) });
    tx(325, 405, 'publisher confirm: Producer → 브로커', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: op });
    tx(685, 405, 'consumer ack: 브로커 → Consumer', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.9) }); }

  // ---------- 5. DLX 와 멱등 소비 ----------
  function s5(t, c) { const { k, u } = c, E1 = [150, 130], Qx = 320, Qw = 260, D1 = [150, 320], C1 = [770, 150];
    if (k === 5) { // SETNX 로 중복 거르기
      tx(480, 52, '같은 message_id가 두 번 와도', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      [['1번째 배달', '1', '처리', GOOD], ['재배달', '0', '건너뜀', MUT]].forEach(([a, r, d, col], i) => { const y = 140 + i * 120, s = pop(u, 0.2 + i * 0.9);
        msg(150, y, 'ord-42', { s, fill: i ? WARN : ACC }); sub(150, y + 34, a, fade(u, 0.3 + i * 0.9));
        grow(200, y, 330, y, E(u, 0.4 + i * 0.9, 0.8 + i * 0.9), MUT);
        mono(470, y + 5, 'SETNX processed:ord-42', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.9) });
        mono(650, y + 5, '→ ' + r, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.8 + i * 0.9) });
        pill(790, y, d, col, pop(u, 0.9 + i * 0.9), { fs: 14 }); });
      sub(480, 390, 'at-least-once 위에서 결과를 한 번으로 만드는 것은 컨슈머 몫이다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    exch(...E1, 'orders', { w: 120, s: k === 0 ? pop(u, 0.2) : 1 }); exch(...D1, 'dlx.exchange', { w: 160, col: BAD, fill: 'var(--badbg)', s: k === 0 ? pop(u, 0.5) : 1 });
    const r = k === 2 ? (u > 1.4 ? 1 : 0) : 0, ua = k === 3 ? 1 : 0;
    const inQ = k === 2 && u > 1.4 ? [{ t: 'm1' }] : [];
    queue(Qx + 60, E1[1] - 20, Qw, 'orders.queue', inQ, { op: k === 0 ? fade(u, 0.7) : 1, cnt: k >= 2 && k <= 3 ? counts(r, ua) : null });
    queue(Qx + 60, D1[1] - 20, Qw, 'dlq.orders', k === 4 && u > 1.9 ? [{ t: 'm1', col: BAD }] : [], { op: k === 0 ? fade(u, 1.0) : 1, col: BAD });
    if (k === 0) { mono(Qx + 60 + Qw / 2, E1[1] + 46, 'x-dead-letter-exchange = dlx.exchange', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.4) });
      grow(Qx + 190, E1[1] + 56, D1[0] + 60, D1[1] - 30, E(u, 1.8, 2.4), BAD, { dash: '6 5' }); return; }
    // binding 두 줄 (key 같음)
    [[E1, E1[1]], [D1, D1[1]]].forEach(([e, y], i) => { const g = k === 1 ? E(u, 0.2 + i * 0.6, 0.9 + i * 0.6) : 1; el('line', { x1: e[0] + 62 + i * 20, y1: y, x2: lerp(e[0] + 62 + i * 20, Qx + 56, g), y2: y, stroke: i ? BAD : INK, 'stroke-width': 2.4, 'stroke-dasharray': '7 5' });
      if (g > 0.9) mono((e[0] + 62 + i * 20 + Qx + 56) / 2, y - 10, 'order.created', { 'font-size': 13.5, 'text-anchor': 'middle', fill: i ? BAD : INK, 'font-weight': 700 }); });
    if (k === 1) { sub(480, 400, 'dead letter는 원래 routing key를 그대로 달고 간다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { fly(E1[0], 50, E1[0], E1[1] - 34, seg(u, 0.2, 0.8), 'rabbitmqadmin publish', { mono: true, fill: INFO });
      dot([[E1[0], E1[1]], [Qx + 56, E1[1]], [Qx + 60 + Qw - 28, E1[1]]], seg(u, 0.8, 1.4), ACC, 8);
      sub(Qx + 60 + Qw / 2, E1[1] + 82, '{"order_id":42,"amount":19900}', fade(u, 1.5), { class: 'mono' }); return; }
    app(...C1, 'C1');
    if (k === 3) { msg(C1[0], C1[1] + 46, 'm1', { fill: WARN });
      terminal(660, 240, 280, 140, ['$ rabbitmqctl list_queues …', 'orders.queue  0  1', 'dlq.orders    0  0'], Math.min(3, 1 + seg(u, 0.3, 1.3) * 2), { title: '예상 출력 · 예시', fs: 14 });
      sub(Qx + 60 + Qw / 2, E1[1] + 82, 'ready 0이어도 unacked 1이 남아 있다', fade(u, 1.6), { fill: WARN, 'font-weight': 700 }); return; }
    // k4: nack(requeue=false) → dlx → dlq
    const a = seg(u, 0.3, 1.9);
    if (a > 0 && a < 1) dot([[C1[0], C1[1] + 30], [C1[0], D1[1] - 70], [D1[0] + 80, D1[1] - 30], [D1[0], D1[1]], [Qx + 56, D1[1]], [Qx + 60 + Qw - 28, D1[1]]], a, BAD, 9);
    mono(C1[0], C1[1] + 52, 'nack(requeue=False)', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 0.1) });
    const op = fade(u, 2.0); el('rect', { x: 650, y: 250, width: 290, height: 92, rx: 8, fill: SOFT, stroke: BAD, 'stroke-width': 1.5, opacity: op });
    mono(664, 274, 'x-death:', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: op }); mono(680, 296, 'reason = rejected', { 'font-size': 14, opacity: op }); mono(680, 318, 'queue  = orders.queue', { 'font-size': 14, opacity: op });
    sub(480, 400, 'get … ackmode=ack_requeue_true 로 꺼내 봐도 큐에 남는다', fade(u, 2.3), { 'font-size': 14.5 }); }

  const quiz = [
    { q: 'prefetch를 걸지 않은 C1이 구독을 시작했다. 큐에 m1·m2·m3이 있고 콜백은 ack를 보내지 않는다. C1의 unacked는 몇인가?',
      o: ['1', '3', '0'], a: 1,
      why: 'prefetch 한도가 없으면 브로커는 쌓인 메시지를 모두 밀어 준다. ack가 없으니 셋 다 unacked로 남고 ready는 0이 된다.' },
    { q: 'auto_ack=True로 받은 메시지를 처리하다 컨슈머가 죽었다. 그 메시지는 어떻게 되는가?',
      o: ['다른 컨슈머에게 다시 배달된다', 'DLX로 옮겨진다', '배달할 때 이미 지워져 사라진다'], a: 2,
      why: 'auto-ack에서는 배달하는 순간 큐에서 지운다. 브로커가 처리 중인 메시지를 추적하지 않으니 되돌릴 방법이 없다.' },
    { q: 'prefetch 1인 두 컨슈머 중 C2가 m3를 ack했다. 다음 m4는 누구에게 가는가?',
      o: ['C2', 'C1', 'C1과 C2 모두'], a: 0,
      why: 'C1은 아직 m2를 쥐고 있어 unacked가 1이다. 한도가 빈 C2만 받을 수 있어 m4는 C2로 간다.' },
    { q: 'mandatory=True로 보낸 메시지가 어느 큐로도 가지 못했다. 프로듀서에 오는 순서는?',
      o: ['basic.ack만 온다', 'basic.return이 먼저 오고 basic.ack가 뒤에 온다', 'basic.nack이 온다'], a: 1,
      why: '라우팅 실패는 basic.return으로 돌려준 뒤 ack를 보낸다. pika는 이것을 UnroutableError로 알려 준다.' },
    { q: 'orders.queue에 DLX가 설정돼 있다. 컨슈머가 nack(requeue=False)한 메시지는 어디로 가는가?',
      o: ['dlx.exchange를 거쳐 원래 routing key로 dlq.orders에 간다', 'orders.queue 맨 앞으로 돌아간다', '프로듀서에게 basic.return으로 돌아간다'], a: 0,
      why: 'requeue=False로 거절된 메시지는 dead letter가 되어 DLX로 간다. dead-letter routing key를 따로 정하지 않으면 원래 key(order.created)를 쓴다.' },
  ];

  const summary = [
    'auto_ack=True면 배달하는 순간 지워져서 처리 중에 죽으면 메시지가 사라진다.',
    'manual ack에서는 ack가 와야 지우고, 채널이 닫히면 unacked는 큐로 돌아간다.',
    'prefetch 1이면 먼저 끝낸 컨슈머가 다음 메시지를 가져가 느린 쪽에 일이 쌓이지 않는다.',
    'publisher confirm과 consumer ack를 함께 켜면 at-least-once가 되고 중복은 컨슈머가 거른다.',
  ];
  const review = [
    { q: '결제 컨슈머를 재배포했더니 같은 결제가 두 번 나간 기록이 있다. 먼저 의심할 것은?',
      o: ['ack 전에 끊겨 재배달된 메시지를 중복 없이 거르지 못했다', 'publisher confirm이 메시지를 복사했다', 'prefetch가 1이라 메시지가 두 번 배달됐다'], a: 0,
      why: 'manual ack에서는 ack 전에 연결이 끊기면 메시지가 다시 온다. message_id로 처리 여부를 확인해야 결과가 한 번이 된다.' },
    { q: '큐의 ready는 0인데 unacked가 계속 10에 머물고 새 메시지가 처리되지 않는다. 원인으로 가장 그럴듯한 것은?',
      o: ['exchange에 binding이 없다', 'publisher confirm이 꺼져 있다', '콜백의 어떤 분기에서 ack도 nack도 보내지 않는다'], a: 2,
      why: '응답하지 않은 메시지가 prefetch 10칸을 다 차지하면 그 컨슈머에는 더 오지 않는다. 모든 분기에서 ack나 nack을 보내야 한다.' },
    { q: '스키마가 깨진 메시지 하나가 nack(requeue=True)로 계속 돌며 로그를 채운다. 어떻게 바꾸는가?',
      o: ['auto_ack=True로 바꾼다', '영구 오류는 requeue=False로 거절해 DLX 큐로 보내고 따로 조사한다', 'prefetch를 0으로 바꾼다'], a: 1,
      why: '다시 넣어도 성공할 수 없는 메시지는 재시도가 아니라 격리가 맞다. DLX로 보내면 x-death 헤더에 이유가 남아 조사할 수 있다.' },
  ];

  R.page({ title: '배달 확인과 재전달', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
