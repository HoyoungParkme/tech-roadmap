/* IV-1-2 Pub/Sub vs Stream — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    redisBox, person, browser, server, cross, check, clock, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;
  const line = (x1, y1, x2, y2, col, o) => { o = o || {}; el('line', { x1, y1, x2, y2, stroke: col || GRID, 'stroke-width': o.sw || 2.5, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); };
  const T = (x, y, s, a) => tx(x, y, s, Object.assign({ 'font-size': 15 }, a || {}));
  const fmt = (v) => Math.round(v).toLocaleString('en-US');

  // ───────── 1. SUBSCRIBE / PUBLISH ─────────
  const A = { x: 90, y: 170 }, CH = { x: 380, y: 180, w: 230 }, SUBS = [['Bob', 700, 70], ['Carol', 700, 170], ['Dave', 700, 270]];
  function chBase(c, o) { o = o || {};
    const v = c.beat.viz, chLeft = CH.x - CH.w / 2, chRight = CH.x + CH.w / 2;
    person(A.x, A.y, 'Alice', {});
    line(A.x + 30, A.y + 4, chLeft, CH.y, GRID, { op: o.lineOp ?? 1 });
    redisBox(CH.x, 92, { w: 170, h: 48, s: o.redisS });
    line(CH.x, 116, CH.x, CH.y - 22, GRID, { sw: 2 });
    card(CH.x, CH.y, CH.w, 44, { rx: 22, stroke: ACC, sw: 2.2, fill: ACCBG, text: o.ch || v.channel, mono: true, fs: 15, fw: 700, color: ACC, dash: o.dash, op: o.chOp ?? 1 });
    if (o.count != null) sub(CH.x, CH.y + 44, '구독자 ' + o.count, 1, { 'font-weight': 700, fill: INK, class: 'mono' });
    return { chLeft, chRight }; }
  function subs(n, u0, on) { SUBS.slice(0, n).forEach(([nm, x, y], i) => { const s = u0 == null ? 1 : pop(on, u0 + i * 0.4);
      grow(CH.x + CH.w / 2, CH.y, x - 34, y, u0 == null ? 1 : E(on, u0 + i * 0.4, u0 + 0.4 + i * 0.4), ACC, { plain: true, sw: 2 });
      person(x, y, nm, { s }); }); }

  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const ap = pop(u, 0.2);
      person(A.x, A.y, 'Alice', {}); redisBox(CH.x, 92, { w: 170, h: 48, s: ap });
      grow(A.x + 30, A.y - 6, CH.x - 88, 100, E(u, 0.6, 1.3), ACC);
      pill(CH.x, 260, 'redis.Redis(decode_responses=True)', ACC, pop(u, 1.0), { mono: true, fs: 13.5 });
      spans(CH.x - 140, 318, [["b'hi'", { fill: MUT }], ['  →  ', { fill: MUT }], ["'hi'", { fill: ACC, 'font-weight': 700 }]], { opacity: fade(u, 1.6) });
      sub(CH.x + 70, 318, 'bytes 대신 str', fade(u, 1.8), { 'text-anchor': 'start' });
      card(CH.x, CH.y, CH.w, 44, { rx: 22, stroke: GRID, sw: 2, dash: '6 5', text: 'chat:room:1', mono: true, fs: 15, color: OFF, op: fade(u, 2.0) });
      return; }
    if (k === 1) { chBase(c, { count: 0 });
      snippet(560, 30, ['pubsub = r.pubsub()', 'pubsub.subscribe("chat:room:1")', 'for msg in pubsub.listen():', '    if msg["type"] == "message":'], { fs: 14, op: fade(u, 0.2) });
      fly(CH.x + 115, CH.y, 690, 220, seg(u, 0.7, 1.4), 'type: subscribe', { stay: true, fill: MUT, mono: true });
      if (u > 1.4) { cross(810, 220, 9, pop(u, 1.4)); T(830, 225, '건너뜀', { fill: MUT, opacity: fade(u, 1.5) }); }
      fly(CH.x + 115, CH.y, 690, 280, seg(u, 1.5, 2.2), 'type: message', { stay: true, mono: true });
      if (u > 2.2) { check(810, 280, 9, pop(u, 2.2)); T(830, 285, 'print', { fill: ACC, class: 'mono', opacity: fade(u, 2.3) }); }
      sub(700, 340, 'listen() 은 구독 확인도 메시지로 준다', fade(u, 2.4));
      return; }
    if (k === 2) { chBase(c, { count: 0 });
      card(810, 190, 210, 230, { rx: 12, stroke: INK, sw: 2 }); T(720, 100, '구독하는 프로그램', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      card(760, 140, 80, 34, { rx: 8, text: 'r', mono: true, fs: 15, fw: 700, stroke: INK });
      card(780, 250, 120, 34, { rx: 8, text: 'pubsub', mono: true, fs: 15, fw: 700, stroke: ACC, color: ACC });
      grow(720, 140, CH.x + 86, 96, E(u, 0.2, 0.7), INK, { plain: true, sw: 2 });
      grow(720, 250, CH.x + 115, CH.y + 6, E(u, 0.4, 0.9), ACC, { plain: true, sw: 2 });
      sub(885, 145, '명령용', fade(u, 0.6)); sub(780, 290, '구독용 연결', fade(u, 0.8), { fill: ACC, 'font-weight': 700 });
      fly(720, 250, 560, 220, seg(u, 1.0, 1.6), 'GET k', { stay: u < 2.0, fill: BAD, mono: true });
      if (u > 1.6) cross(560, 220, 10, pop(u, 1.6));
      mono(40, 392, "ERR Can't execute 'get' … only (P|S)SUBSCRIBE / … / PING / QUIT / RESET", { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.7) });
      fly(720, 140, 560, 120, seg(u, 2.0, 2.5), 'GET k', { stay: true, fill: INK, mono: true });
      if (u > 2.5) check(560, 154, 9, pop(u, 2.5));
      return; }
    const cnt = k === 3 ? Math.round(lerp(0, 3, E(u, 0.3, 1.5))) : 3;
    const { chRight } = chBase(c, { count: k === 7 ? null : cnt });
    if (k === 3) { subs(3, 0.3, u); return; }
    subs(3);
    if (k === 4) { fly(A.x + 30, A.y - 10, CH.x - 60, CH.y, seg(u, 0.2, 0.9), 'Hello everyone!', { mono: true });
      SUBS.forEach(([nm, x, y], i) => { fly(chRight, CH.y, x - 30, y, seg(u, 1.0 + i * 0.12, 1.7 + i * 0.12), 'Hello everyone!', { mono: true });
        if (u > 1.7 + i * 0.12) pill(845, y, 'Hello everyone!', ACC, pop(u, 1.7 + i * 0.12), { mono: true, fs: 13.5 }); });
      mono(A.x - 30, 300, 'publish → 3', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) });
      sub(A.x + 30, 322, '(받은 구독자 수)', fade(u, 2.3));
      return; }
    if (k === 5 || k === 6) {
      if (k === 5) { [['chat:room:1', 280], ['chat:room:42', 480]].forEach(([s, x], i) => {
          pill(x, 262, s, INK, pop(u, 0.9 + i * 0.3), { mono: true, fs: 13.5 }); grow(x, 246, x + (CH.x - x) * 0.4, CH.y + 24, E(u, 1.1 + i * 0.3, 1.5 + i * 0.3), ACC); });
        bumpCh(u); sub(CH.x, 300, '방이 몇 개든 패턴 하나로', fade(u, 1.7));
        pill(CH.x, 340, '__keyevent@0__:*', INFO, pop(u, 2.0), { mono: true, fs: 13.5 });
        sub(CH.x, 378, 'keyspace 이벤트 채널', fade(u, 2.2)); return; }
      // k6: notify-keyspace-events
      pill(CH.x, 262, '__keyevent@0__:*', INFO, 1, { mono: true, fs: 13.5 });
      terminal(20, 288, 440, 128, ['> CONFIG GET notify-keyspace-events', '"" (꺼짐: 아무것도 안 옴)', '> CONFIG SET notify-keyspace-events Ex', 'OK'], lerp(0, 4, E(u, 0.2, 1.3)), { fs: 13.5, lh: 20 });
      card(730, 368, 380, 72, { rx: 10, stroke: GRID, sw: 1.5, fill: PANEL });
      const gone = u > 1.9;
      mono(560, 374, 'session:abc', { 'font-size': 15, 'font-weight': 700, fill: gone ? OFF : INK, 'text-decoration': gone ? 'line-through' : null });
      clock(700, 368, 16, E(u, 1.0, 1.9), WARN);
      T(735, 374, gone ? 'expired 발행' : 'TTL 흐르는 중', { 'font-size': 14.5, fill: gone ? INFO : MUT, 'font-weight': 700 });
      fly(700, 368, 540, 262, seg(u, 2.0, 2.6), 'expired', { mono: true, fill: INFO, stay: true });
      return; }
    // k7: PUBSUB NUMSUB
    terminal(20, 290, 380, 120, ['> PUBSUB NUMSUB chat:room:1', '1) "chat:room:1"', '2) (integer) 3'], lerp(0, 3, E(u, 0.2, 1.2)), { fs: 14 });
    sub(CH.x, CH.y + 44, '구독자 3', 1, { 'font-weight': 700, fill: ACC, class: 'mono', opacity: fade(u, 1.1) });
    [['실시간 채팅', 520], ['캐시 무효화', 660], ['시스템 알림', 800]].forEach(([s, x], i) => pill(x, 385, s, GOOD, pop(u, 1.5 + i * 0.25), { fs: 14 }));
  }
  const spans = R.spans;
  function bumpCh(u) { const b = R.bump(u, 0.3); if (b) el('rect', { x: CH.x - CH.w / 2 - 4, y: CH.y - 26, width: CH.w + 8, height: 52, rx: 26, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: Math.abs(b) * 6 }); }

  // ───────── 2. Fire-and-forget ─────────
  function lossBase(o) { o = o || {};
    person(80, 200, '발행자', {});
    redisBox(330, 150, { w: 150, h: 48 });
    card(330, 220, 190, 40, { rx: 20, stroke: ACC, fill: ACCBG, text: o.ch || 'order:new', mono: true, fs: 14.5, fw: 700, color: ACC });
    line(110, 205, 235, 220, GRID); }
  function s2(t, c) { const { k, u } = c, f = c.beat.viz.flow;
    if (k === 0) { lossBase();
      [['Bob', 120], ['Carol', 300]].forEach(([nm, y]) => { line(425, 220, 640, y, GRID); person(680, y, nm, {}); });
      fly(110, 190, 270, 220, seg(u, 0.2, 0.8), 'msg1', { mono: true });
      fly(425, 220, 640, 120, seg(u, 0.9, 1.5), 'msg1', { mono: true }); fly(425, 220, 640, 300, seg(u, 0.9, 1.5), 'msg1', { mono: true });
      if (u > 1.5) { check(735, 105, 9, pop(u, 1.5)); check(735, 285, 9, pop(u, 1.6)); }
      card(330, 345, 220, 70, { rx: 10, stroke: OFF, sw: 2, dash: '6 5', fill: PANEL, op: fade(u, 1.7) });
      T(330, 340, '저장소', { 'text-anchor': 'middle', fill: MUT, 'font-weight': 700, opacity: fade(u, 1.7) });
      mono(330, 365, '보관 0건', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(820, 210, '전달은 이 순간뿐', fade(u, 2.2), { 'font-weight': 700, fill: INK });
      return; }
    if (k === 1) { // 타임라인 t0 ~ t4
      const xs = [210, 370, 530, 690, 850], ys = { pub: 110, Bob: 210, Carol: 300 }, ph = lerp(150, 900, E(u, 0.2, 2.5));
      T(40, ys.pub + 5, 'PUBLISH', { 'font-weight': 700, class: 'mono' }); T(40, ys.Bob + 5, 'Bob', { 'font-weight': 700 }); T(40, ys.Carol + 5, 'Carol', { 'font-weight': 700 });
      f.forEach((e, i) => { mono(xs[i], 380, e.time, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); line(xs[i], 80, xs[i], 360, GRID, { sw: 1, dash: '3 5' }); });
      // 연결 상태 선
      const segLine = (y, a, b, col, dash) => { const e = Math.min(b, ph); if (e > a) line(a, y, e, y, col, { sw: 5, dash }); };
      segLine(ys.Carol, 150, 900, GOOD);
      segLine(ys.Bob, 150, xs[1], GOOD); segLine(ys.Bob, xs[1], xs[3], BAD, '4 8'); segLine(ys.Bob, xs[3], 900, GOOD);
      const at = (x) => ph >= x;
      if (at(xs[0])) { pill(xs[0], ys.pub, 'msg1', ACC, 1, { mono: true, fs: 13.5 }); check(xs[0], ys.Bob - 26, 8); check(xs[0], ys.Carol - 26, 8); }
      if (at(xs[1])) pill(xs[1], ys.Bob + 32, 'disconnect', BAD, 1, { mono: true, fs: 13.5 });
      if (at(xs[2])) { pill(xs[2], ys.pub, 'msg2', ACC, 1, { mono: true, fs: 13.5 }); check(xs[2], ys.Carol - 26, 8); cross(xs[2], ys.Bob - 22, 8); }
      if (at(xs[3])) pill(xs[3], ys.Bob + 32, 'reconnect', GOOD, 1, { mono: true, fs: 13.5 });
      if (at(xs[4])) { pill(xs[4], ys.Bob - 30, 'msg2 없음', BAD, 1, { fs: 13.5 }); }
      el('line', { x1: ph, y1: 80, x2: ph, y2: 360, stroke: INK, 'stroke-width': 1.5, opacity: ph < 895 ? 0.5 : 0 });
      return; }
    if (k === 2) { lossBase();
      terminal(20, 290, 420, 110, ['> PUBLISH order:new "id=42"', '(integer) 0'], lerp(0, 2, E(u, 0.2, 1.0)), { fs: 14 });
      line(425, 220, 640, 220, GRID, { dash: '5 6' }); card(700, 220, 110, 50, { rx: 10, stroke: OFF, dash: '5 5', text: '구독자 0', fs: 14, color: MUT });
      const fall = E(u, 1.1, 2.0);
      if (u > 1.0) card(lerp(330, 560, fall), lerp(220, 330, fall), 70, 28, { rx: 14, fill: OFF, stroke: 'none', text: 'msg3', mono: true, fs: 13.5, color: PANEL, op: 1 - seg(u, 1.8, 2.2) });
      el('path', { d: 'M560,140 A70,46 0 1 1 690,150', fill: 'none', stroke: OFF, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 2.0) });
      cross(625, 100, 11, pop(u, 2.1)); T(660, 92, '재시도 없음', { fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) });
      return; }
    if (k === 3) { // slow consumer — output buffer
      redisBox(170, 210, { w: 150, h: 52 });
      const yB = 120, yC = 300, lim = 9, fill = Math.floor(lerp(0, 11, E(u, 0.3, 1.9))), cut = fill > lim;
      T(300, yB - 32, 'Bob 의 output buffer', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 11; i++) el('rect', { x: 300 + i * 34, y: yB - 18, width: 30, height: 36, rx: 4, fill: i < fill ? (i >= lim ? BAD : WARN) : PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: i < fill ? 0.85 : 1 });
      el('line', { x1: 300 + lim * 34 - 2, y1: yB - 30, x2: 300 + lim * 34 - 2, y2: yB + 30, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '4 4' });
      mono(300 + lim * 34 - 6, yB + 48, 'client-output-buffer-limit', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end' });
      line(245, 200, 300, yB, cut ? BAD : GRID, { dash: cut ? '4 6' : null });
      line(680, yB, 760, yB, cut ? BAD : GRID, { dash: cut ? '4 6' : null });
      person(820, yB, 'Bob (느림)', { stroke: cut ? BAD : INK });
      if (cut) { cross(720, yB, 12, pop(u, 1.8)); T(640, yB + 78, '강제 disconnect', { fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
      T(300, yC - 32, 'Carol 의 output buffer', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 11; i++) el('rect', { x: 300 + i * 34, y: yC - 18, width: 30, height: 36, rx: 4, fill: i < (Math.floor(t * 3) % 2) ? ACC : PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: 0.85 });
      line(245, 220, 300, yC, GRID); line(680, yC, 760, yC, GRID); person(820, yC, 'Carol', {});
      return; }
    if (k === 4) { // cluster 전파
      const pos = [[180, 120], [320, 120], [460, 120], [180, 260], [320, 260], [460, 260]];
      const ph = u < 1.0 ? 0 : u < 1.8 ? 1 : 2, n = ph === 0 ? 3 : 6;
      pos.slice(0, n).forEach(([x, y], i) => { const lit = ph < 2 || i === 0 || i === 3, sh = ph === 1 && i >= 3 ? pop(u, 1.0 + (i - 3) * 0.15) : 1;
        card(x, y, 100, 64, { rx: 10, stroke: lit ? ACC : GRID, sw: 2.2, fill: lit ? ACCBG : PANEL, s: sh });
        mono(x, y + 6, 'node' + (i + 1), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: lit ? ACC : OFF, opacity: sh });
        if (i > 0 && lit) { const st = ph === 0 ? 0.3 : ph === 1 ? 1.1 : 1.9; dot([pos[0], [x, y]], seg(u, st + i * 0.05, st + 0.5 + i * 0.05), ACC, 6); } });
      const cur = f[ph];
      card(760, 190, 300, 120, { rx: 12, stroke: ph === 1 ? WARN : ph === 2 ? GOOD : GRID, sw: 2 });
      mono(760, 168, cur.action, { 'text-anchor': 'middle', 'font-size': ph === 2 ? 13.5 : 15, 'font-weight': 700 });
      mono(760, 205, '받는 노드 ' + cur.subscribers, { 'text-anchor': 'middle', 'font-size': 15, fill: ph === 1 ? WARN : ph === 2 ? GOOD : INK });
      sub(760, 232, ph === 2 ? 'SPUBLISH · Redis 7+' : '모든 노드로 퍼진다', 1);
      sub(320, 350, ph === 2 ? 'shard 안의 노드만 받는다' : '노드가 늘수록 전파량도 는다', 1, { 'font-weight': 700, fill: INK });
      return; }
    // k5, k6: 쓸 곳 / 쓰면 안 되는 곳
    const ok = k === 5;
    T(480, 46, ok ? 'Pub/Sub 이 잘 맞는 곳 — 놓쳐도 괜찮다' : 'Pub/Sub 을 쓰면 안 되는 곳 — 놓치면 안 된다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
    f.forEach((e, i) => { const y = 110 + i * 92, s = pop(u, 0.2 + i * 0.35), x0 = ok ? 110 : 80;
      card(ok ? 330 : 300, y, 440, 74, { rx: 12, stroke: ok ? GOOD : BAD, sw: 2, s });
      (ok ? check : cross)(x0 + 20, y, 11, s);
      T(x0 + 50, y + 6, e.action, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) });
      if (ok) { const n = Math.min(e.subscribers, 12);
        for (let j = 0; j < n; j++) { const a = -0.9 + (1.8 * j) / Math.max(1, n - 1); dot([[640, y], [640 + Math.cos(a) * 70, y + Math.sin(a) * 30]], ((t * 0.7 + j * 0.13) % 1), ACC, 3.5); }
        mono(830, y + 5, '구독자 ' + e.subscribers, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.35) }); } });
    if (!ok) { grow(540, 202, 660, 202, E(u, 1.4, 1.9), ACC);
      const sa = pop(u, 1.9); redisBox(780, 160, { w: 190, h: 48, name: 'Redis Stream', s: sa });
      [0, 1, 2, 3].forEach((i) => el('rect', { x: 694 + i * 44, y: 210, width: 40, height: 34, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 1.8, opacity: fade(u, 2.0 + i * 0.1) }));
      sub(780, 270, '저장 · ack · 재처리', fade(u, 2.3), { 'font-weight': 700, fill: ACC }); }
  }

  // ───────── 3. Stream ─────────
  const EW = 186, EX = (i) => 150 + i * (EW + 10) + EW / 2, EY = 150;
  function entry(cx, cy, e, o) { o = o || {}; const g = card(cx, cy, EW, 64, { rx: 8, stroke: o.stroke || ACC, sw: 2, fill: o.fill || PANEL, s: o.s, op: o.op });
    mono(0, -6, e.id, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: o.gone ? OFF : ACC }, g);
    mono(0, 17, e.data.replace(/[{}]/g, ''), { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.gone ? OFF : INK, 'text-decoration': o.gone ? 'line-through' : null }, g); return g; }
  function tape(n) { mono(40, EY + 5, 'orders', { 'font-size': 16, 'font-weight': 800 }); sub(70, EY + 26, 'Stream 키', 1);
    el('rect', { x: 140, y: EY - 42, width: 800, height: 84, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': n ? null : '6 5' }); }
  const xlenTag = (v, op) => { mono(930, 70, 'XLEN ' + v, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op ?? 1 }); };
  function s3(t, c) { const { k, u } = c, es = c.beat.viz.entries, pes = (c.prev && c.prev.viz.entries) || [];
    tape(es.length);
    if (k === 0) { T(540, EY + 5, '비어 있다 — 첫 XADD 때 키가 생긴다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
      terminal(40, 260, 420, 110, ['> XLEN orders', '(integer) 0'], lerp(0, 2, E(u, 0.8, 1.6)), { fs: 14 });
      pill(700, 300, 'r = redis.Redis(...)', INK, pop(u, 1.8), { mono: true, fs: 13.5 }); return; }
    if (k === 1) { const sl = E(u, 0.3, 1.1); entry(lerp(820, EX(0), sl), EY, es[0], { op: fade(u, 0.3, 0.3) });
      xlenTag(u < 1.1 ? 0 : 1, 1);
      mono(EX(0) - 50, 270, '1715000000', { 'font-size': 18, 'font-weight': 800, fill: INK, opacity: fade(u, 1.3), 'text-anchor': 'middle' });
      mono(EX(0) + 40, 270, '-', { 'font-size': 18, fill: MUT, opacity: fade(u, 1.3), 'text-anchor': 'middle' });
      mono(EX(0) + 62, 270, '0', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3), 'text-anchor': 'middle' });
      grow(EX(0), 186, EX(0), 246, E(u, 1.2, 1.5));
      sub(EX(0) - 50, 300, '밀리초 시각', fade(u, 1.7)); sub(EX(0) + 62, 300, '시퀀스', fade(u, 1.9), { fill: ACC });
      T(460, 280, '이 ID 가 곧 순서이자 커서다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { entry(EX(0), EY, es[0]);
      es.slice(1).forEach((e, i) => entry(lerp(840, EX(i + 1), E(u, 0.2 + i * 0.35, 0.8 + i * 0.35)), EY, e, { op: fade(u, 0.2 + i * 0.35, 0.2) }));
      xlenTag(Math.round(lerp(1, 4, E(u, 0.2, 1.6))));
      el('line', { x1: 140, y1: 90, x2: 140, y2: 230, stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '6 5', opacity: fade(u, 1.7) });
      mono(150, 260, 'maxlen=1000', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
      const gh = E(u, 2.0, 2.7); card(lerp(100, 60, gh), lerp(232, 330, gh), 90, 40, { rx: 8, stroke: OFF, dash: '5 5', text: '오래된 것', fs: 13.5, color: MUT, op: (1 - gh * 0.6) * fade(u, 1.9) });
      sub(430, 300, '1000 개를 넘으면 오래된 것부터 잘린다', fade(u, 2.1)); return; }
    es.forEach((e, i) => { if (k === 5 && i >= 0) return; entry(EX(i), EY, e); });
    if (k === 3) { const cur = lerp(EX(0) - EW / 2 - 6, EX(3) + EW / 2 + 6, E(u, 0.4, 2.0));
      el('path', { d: `M${cur - 9},${EY + 54} L${cur + 9},${EY + 54} L${cur},${EY + 42} Z`, fill: INFO });
      mono(EX(0) - EW / 2, EY + 78, '"0" 부터', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(EX(3) + EW / 2 - 4, 92, '"$" = 이후 새것만', { 'text-anchor': 'end', 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.1) });
      card(480, 340, 230, 74, { rx: 12, stroke: INFO, sw: 2, s: pop(u, 0.2) });
      T(480, 334, '소비자 (XREAD)', { 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(480, 358, Math.min(4, Math.floor(lerp(0, 4.99, E(u, 0.4, 2.0)))) + ' 건 읽음', { 'text-anchor': 'middle', 'font-size': 14.5, fill: INFO, opacity: fade(u, 0.5) });
      [0, 1, 2, 3].forEach((i) => dot([[EX(i), EY + 32], [480, 304]], seg(u, 0.5 + i * 0.4, 1.0 + i * 0.4), INFO, 6));
      return; }
    if (k === 4) { xlenTag(4, fade(u, 0.2));
      const br = (x1, x2, y, s1, s2, col, a) => { el('path', { d: `M${x1},${y - 10} V${y} H${x2} V${y - 10}`, fill: 'none', stroke: col, 'stroke-width': 2.5, opacity: a });
        mono(x1, y + 22, s1, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: a }); mono(x2, y + 22, s2, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: a, 'text-anchor': 'end' }); };
      br(EX(0) - EW / 2, lerp(EX(0) - EW / 2, EX(3) + EW / 2, E(u, 0.5, 1.2)), 210, '"-"', u > 1.2 ? '"+"' : '', INFO, fade(u, 0.5));
      br(EX(0) - EW / 2, lerp(EX(0) - EW / 2, EX(2) + EW / 2, E(u, 1.5, 2.1)), 290, '1715000000', u > 2.1 ? '1715000200' : '', WARN, fade(u, 1.5));
      sub(EX(1), 360, 'ID 앞부분이 시각이라 시간 구간 조회가 된다', fade(u, 2.2), { 'font-weight': 700, fill: INK });
      return; }
    if (k === 5) { const all = pes, sh = E(u, 1.0, 1.8);
      all.forEach((e, i) => { if (i === 0) { const fa = E(u, 0.5, 1.2); entry(EX(0), EY + fa * 110, e, { gone: u > 0.4, stroke: BAD, op: 1 - fa }); if (u > 0.3) cross(EX(0), EY - 50, 10, pop(u, 0.3)); return; }
        entry(lerp(EX(i), EX(i - 1), sh), EY, e); });
      xlenTag(u < 1.2 ? 4 : 3);
      terminal(40, 290, 470, 110, ['> XDEL orders 1715000000-0', '(integer) 1'], lerp(0, 2, E(u, 0.2, 0.9)), { fs: 14 });
      sub(730, 340, '보통은 maxlen 으로 자동 정리', fade(u, 2.0)); return; }
    // k6: Pub/Sub 휘발 vs Stream 저장
    xlenTag(3);
    T(40, 262, 'Pub/Sub', { 'font-weight': 800, fill: MUT }); const ev = fade(u, 0.3) * (1 - seg(u, 1.0, 1.6));
    card(lerp(190, 420, E(u, 0.3, 1.0)), 258, 80, 28, { rx: 14, fill: OFF, stroke: 'none', text: 'msg', fs: 13.5, color: PANEL, mono: true, op: ev });
    sub(470, 264, '지나가면 끝', fade(u, 1.2), { 'text-anchor': 'start' });
    T(40, 352, 'Stream', { 'font-weight': 800, fill: ACC });
    [['C1', 0], ['C2', 1], ['C3', 2]].forEach(([nm, i], j) => { const x = EX(i) - 40, s = pop(u, 1.4 + j * 0.25);
      card(x, 352, 60, 34, { rx: 8, text: nm, fs: 14, mono: true, stroke: INFO, color: INFO, s }); grow(x, 334, x, EY + 36, E(u, 1.5 + j * 0.25, 1.9 + j * 0.25), INFO); });
    pill(800, 352, '다음: Consumer Group', ACC, pop(u, 2.3), { fs: 14 });
  }

  // ───────── 4. 채팅 ─────────
  const CP = { ax: 80, s1: 250, rx: 480, s2: 700, bx: 880, by: 90, cy: 220, chy: 100, hy: 200 };
  function rooms(c) { const r = c.beat.viz.rooms, p = (c.prev && c.prev.viz.rooms) || r;
    r.forEach((rm, i) => { const x = 170 + i * 310, m = tween(p[i].members, rm.members, c.u), n = tween(p[i].messages, rm.messages, c.u), hot = p[i].members !== rm.members || p[i].messages !== rm.messages;
      card(x, 370, 280, 52, { rx: 10, stroke: hot ? ACC : GRID, sw: hot ? 2.2 : 1.5 });
      mono(x - 126, 376, '# ' + rm.name, { 'font-size': 15, 'font-weight': 700 });
      mono(x + 126, 365, fmt(m) + '명', { 'font-size': 14, 'text-anchor': 'end', fill: MUT });
      mono(x + 126, 386, fmt(n) + '건', { 'font-size': 14, 'text-anchor': 'end', fill: hot ? ACC : INK, 'font-weight': 700 }); }); }
  function chatBase(o) { o = o || {};
    browser(CP.ax, 150, 110, 76, null, {}); T(CP.ax, 214, 'Alice', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
    server(CP.s1, 150, null, { s: 0.7, lamp: ACC }); T(CP.s1, 210, 'FastAPI', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
    if (o.s2 !== false) { server(CP.s2, 150, null, { s: 0.7, lamp: ACC }); T(CP.s2, 210, 'FastAPI', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }); }
    el('rect', { x: 370, y: 30, width: 220, height: 220, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: o.rOp ?? 1 });
    T(384, 52, 'Redis', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: o.rOp ?? 1 });
    card(CP.rx, CP.chy, 190, 36, { rx: 18, text: 'chat:general', mono: true, fs: 14, fw: 700, stroke: ACC, color: ACC, op: o.rOp ?? 1 });
    mono(CP.rx, 168, 'chat:history:general', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: o.rOp ?? 1 });
    for (let i = 0; i < 5; i++) el('rect', { x: 392 + i * 36, y: 180, width: 32, height: 30, rx: 4, fill: i < (o.hist ?? 4) ? PANEL : 'none', stroke: i < (o.hist ?? 4) ? ACC : GRID, 'stroke-width': 1.6, 'stroke-dasharray': i < (o.hist ?? 4) ? null : '4 4', opacity: o.rOp ?? 1 });
    line(CP.ax + 56, 150, CP.s1 - 40, 150, GRID); line(CP.s1 + 40, 140, 385, CP.chy, GRID);
    if (o.s2 !== false) line(575, CP.chy, CP.s2 - 40, 140, GRID); }
  function users(o) { o = o || {}; [['Bob', CP.by, o.bob], ['Carol', CP.cy, o.carol]].forEach(([nm, y, st]) => { st = st || {};
      if (st.link !== false) line(CP.s2 + 40, 150, CP.bx - 56, y, st.col || GRID, { dash: st.dash });
      browser(CP.bx, y, 110, 70, null, { stroke: st.col, op: st.op }); T(CP.bx, y + 54, nm, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: st.col || INK }); }); }
  const msgPath = (to) => [[CP.ax + 50, 150], [CP.s1 - 40, 150], [CP.s1 + 40, 140], [385, CP.chy], [575, CP.chy], [CP.s2 - 40, 140], [CP.s2 + 40, 150], [CP.bx - 56, to]];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const a = pop(u, 0.2), b = pop(u, 0.7);
      server(CP.s1, 150, null, { s: 0.7 * a, lamp: ACC }); T(CP.s1, 210, 'app = FastAPI()', { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.4) });
      redisBox(CP.rx, 140, { w: 180, h: 56, sub: 'redis.Redis(...)', s: b }); grow(CP.s1 + 40, 140, CP.rx - 92, 140, E(u, 1.0, 1.6), ACC);
      sub(720, 140, '방에는 아직 아무도 없다', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      rooms(c); return; }
    const hist = k <= 1 ? 4 : 5;
    chatBase({ hist });
    if (k === 1) { users();
      [CP.by, CP.cy].forEach((y, i) => dot(msgPath(y), seg(u, 0.3, 2.2), ACC, 7));
      pill(CP.rx, 270, 'PUBLISH chat:general {...}', ACC, pop(u, 0.9), { mono: true, fs: 13.5 });
      rooms(c); return; }
    if (k === 2) { users();
      dot(msgPath(CP.by).slice(0, 4), seg(u, 0.2, 1.0), ACC, 7);
      const g = E(u, 1.0, 1.7); el('rect', { x: 392 + 4 * 36, y: 180, width: 32, height: 30, rx: 4, fill: ACC, opacity: g * 0.9 });
      if (u > 1.0) dot([[CP.rx, CP.chy + 18], [392 + 4 * 36 + 16, 186]], seg(u, 1.0, 1.6), INFO, 6);
      pill(CP.rx, 270, 'XADD chat:history:general * ...', INFO, pop(u, 1.4), { mono: true, fs: 13.5 });
      sub(CP.rx, 304, '실시간은 Pub/Sub, 기록은 Stream', fade(u, 2.0), { 'font-weight': 700, fill: INK });
      rooms(c); return; }
    if (k === 3) { users({ bob: { link: false }, carol: {} });
      grow(CP.bx - 56, CP.by, CP.s2 + 40, 150, E(u, 0.3, 1.0), INFO);
      pill(CP.bx, 30, 'ws /ws/general', INFO, pop(u, 0.4), { mono: true, fs: 13.5 });
      pill(CP.s2, 262, 'accept()', INFO, pop(u, 1.1), { mono: true, fs: 13.5 });
      el('path', { d: `M${CP.s2 - 30},120 Q640,40 585,${CP.chy - 8}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '200', 'stroke-dashoffset': 200 * (1 - E(u, 1.5, 2.2)) });
      pill(CP.s2 - 10, 300, 'pubsub.subscribe(...)', ACC, pop(u, 1.9), { mono: true, fs: 13.5 });
      rooms(c); return; }
    if (k === 4) { const closed = u > 1.9; users({ bob: closed ? { col: OFF, dash: '5 6' } : {} });
      dot(msgPath(CP.by).slice(4), seg(u, 0.2, 1.3), ACC, 7);
      pill(CP.s2, 262, 'send_text(msg)', ACC, pop(u, 0.7), { mono: true, fs: 13.5 });
      if (u > 1.9) pill(CP.s2, 300, 'finally: unsubscribe()', WARN, pop(u, 1.9), { mono: true, fs: 13.5 });
      rooms(c); return; }
    if (k === 5) { users();
      dot(msgPath(CP.by), seg(u, 0.2, 1.6), ACC, 7); dot(msgPath(CP.cy), seg(u, 0.2, 1.6), ACC, 7);
      ['publish', 'listen', 'send'].forEach((s, i) => pill([CP.s1, CP.rx, CP.s2][i], 270, s, ACC, pop(u, 0.4 + i * 0.4), { mono: true, fs: 13.5 }));
      mono(CP.bx, 302, '1 ms 이내', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) });
      rooms(c); return; }
    // k6: Carol 이 끊겼다가 history 로 메운다
    const back = u > 1.6;
    users({ carol: back ? { col: GOOD } : { col: BAD, dash: '4 7' } });
    if (!back) { dot(msgPath(CP.cy).slice(0, 7), seg(u, 0.2, 1.1), ACC, 7); if (u > 1.1) cross(CP.s2 + 70, 185, 10, pop(u, 1.1)); }
    if (u > 1.6) { el('path', { d: `M${CP.rx + 70},196 Q760,320 ${CP.bx - 50},${CP.cy + 30}`, fill: 'none', stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '360', 'stroke-dashoffset': 360 * (1 - E(u, 1.6, 2.3)) });
      pill(CP.rx, 270, 'XREVRANGE ... COUNT 50', INFO, pop(u, 1.7), { mono: true, fs: 13.5 }); }
    sub(CP.bx, 302, back ? '최근 50개로 채움' : '끊긴 동안은 못 받음', 1, { 'font-weight': 700, fill: back ? INFO : BAD });
    rooms(c); }

  // ───────── 5. 이벤트 로그 ─────────
  const TX = (i) => 250 + i * 80, TY = 120, GY = [220, 290, 360];
  function evBase(c, o) { o = o || {}; const v = c.beat.viz;
    mono(230, TY + 6, 'events', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end' });
    for (let i = 0; i < 5; i++) { const on = i < (o.n ?? 5); el('rect', { x: TX(i), y: TY - 24, width: 72, height: 48, rx: 6, fill: on ? PANEL : 'none', stroke: on ? ACC : GRID, 'stroke-width': 2, 'stroke-dasharray': on ? null : '5 5', opacity: on ? (o.op ? o.op(i) : 1) : 1 });
      if (on) mono(TX(i) + 36, TY + 5, 'e' + (i + 1), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: o.op ? o.op(i) : 1 }); }
    v.producers.forEach((p, i) => { const y = 60 + i * 60, s = o.prodPop && i === 1 ? o.prodPop : 1; card(820, y, 170, 40, { rx: 8, text: p, mono: true, fs: 13.5, fw: 700, stroke: INFO, color: INFO, s });
      line(734, y, 660, TY, GRID, { sw: 2 }); }); }
  function groups(c, o) { o = o || {}; const v = c.beat.viz, pv = (c.prev && c.prev.viz.consumerGroups) || [];
    v.consumerGroups.forEach((g, i) => { const y = GY[i], p = pv.find((q) => q.name === g.name) || { lag: g.lag, consumers: 0 }, s = o.pop ? pop(c.u, 0.2 + i * 0.3) : 1;
      const lag = tween(p.lag, g.lag, c.u, 1.4), pos = 5 - lag, cx = TX(0) + pos * 80 - 4;
      mono(40, y + 5, g.name, { 'font-size': 15, 'font-weight': 700, opacity: s });
      el('line', { x1: TX(0), y1: y, x2: TX(4) + 72, y2: y, stroke: GRID, 'stroke-width': 2, opacity: s });
      el('line', { x1: cx, y1: y - 10, x2: cx, y2: TY + 26, stroke: INFO, 'stroke-width': 1.5, 'stroke-dasharray': '3 4', opacity: 0.6 * s });
      el('path', { d: `M${cx - 8},${y + 2} L${cx + 8},${y + 2} L${cx},${y - 10} Z`, fill: INFO, opacity: s });
      mono(TX(4) + 92, y + 5, 'lag ' + Math.round(lag), { 'font-size': 15, 'font-weight': 700, fill: g.lag === 0 ? GOOD : g.lag < 5 ? WARN : INK, opacity: s });
      const nc = o.cons ? Math.round(tween(p.consumers, g.consumers, c.u)) : g.consumers;
      for (let j = 0; j < nc; j++) { el('circle', { cx: 830 + j * 30, cy: y, r: 11, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 }); }
      if (nc) mono(830 + nc * 30, y + 5, '×' + nc, { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { evBase(c, { n: 0 }); sub(560, TY + 66, '아직 이벤트도, 소비자도 없다', fade(u, 0.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { evBase(c, { op: (i) => fade(u, 0.5 + i * 0.3), prodPop: pop(u, 0.2) });
      for (let i = 0; i < 5; i++) dot([[734, 60 + (i % 2) * 60], [TX(i) + 36, TY]], seg(u, 0.3 + i * 0.3, 0.6 + i * 0.3), INFO, 6);
      pill(560, 210, 'XADD events MAXLEN 100000 * ...', ACC, pop(u, 1.9), { mono: true, fs: 13.5 });
      sub(560, 250, '10만 건만 유지 · 생산자는 소비자를 모른다', fade(u, 2.2)); return; }
    if (k <= 5) { evBase(c);
      groups(c, { pop: k === 2, cons: k === 3 });
      if (k === 2) mono(TX(0) - 4, 410, 'XGROUP CREATE events <group> 0', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.2) });
      if (k === 3) mono(TX(0) - 4, 410, 'XREADGROUP GROUP analytics c1 ...', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.2) });
      if (k === 4) { mono(TX(0) - 4, 410, '">" count=10 block=5000', { 'font-size': 14, fill: INFO, opacity: fade(u, 0.3) });
        [0, 2].forEach((gi) => [0, 1].forEach((j) => { const y = GY[gi]; card(TX(j) + 36, y + 22, 52, 22, { rx: 6, text: 'PEL', fs: 13.5, stroke: WARN, color: WARN, s: pop(u, 1.4 + j * 0.15) }); })); }
      if (k === 5) { [0, 2].forEach((gi) => { const y = GY[gi]; for (let j = 0; j < 5; j++) if (u > 0.4 + j * 0.2) check(TX(j) + 36, y + 20, 7, pop(u, 0.4 + j * 0.2)); });
        pill(760, 402, 'XACK events analytics <id>', GOOD, pop(u, 1.6), { mono: true, fs: 13.5 });
        sub(TX(2) + 40, GY[1] + 28, 'notifications 는 아직 lag 3', fade(u, 2.0), { fill: WARN, 'font-weight': 700 }); }
      return; }
    if (k === 6) { T(480, 46, 'Pub/Sub 이 못 주던 네 가지', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['재처리', '24시간 전 이벤트도 다시 읽는다'], ['그룹별 독립 소비', '분석 · 알림 · 감사가 따로 진도'], ['자동 분담', '같은 그룹 안 consumer 끼리'], ['PEL 재시도', 'XACK 안 한 것은 남는다']].forEach(([a, b], i) => {
        const x = i % 2 ? 700 : 260, y = 130 + Math.floor(i / 2) * 130, s = pop(u, 0.3 + i * 0.35);
        card(x, y, 380, 96, { rx: 12, stroke: ACC, sw: 2, s });
        T(x - 166, y - 8, a, { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4 + i * 0.35) });
        T(x - 166, y + 22, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.35) }); });
      return; }
    // k7: 시나리오 매트릭스
    const col = (x, title, items, cc, d) => { card(x, 70, 360, 50, { rx: 12, fill: cc === ACC ? ACCBG : SOFT, stroke: cc, sw: 2, text: title, fs: 18, fw: 800, color: cc, s: pop(u, d) });
      items.forEach((s, i) => { const y = 150 + i * 70; card(x, y, 360, 54, { rx: 10, stroke: GRID, sw: 1.5, text: s, fs: 16, fw: 600, s: pop(u, d + 0.3 + i * 0.25) }); }); };
    col(250, 'Pub/Sub · 놓쳐도 됨', ['채팅', '실시간 대시보드 갱신', '캐시 무효화 신호'], INFO, 0.2);
    col(710, 'Stream · 놓치면 안 됨', ['주문 이벤트 처리', '작업 큐 (이메일 전송)', '이벤트 소싱'], ACC, 0.9);
    sub(480, 400, '다음: IV-2-1 Stream + Consumer Group 깊이', fade(u, 2.2), { 'font-weight': 700, fill: INK });
  }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: 'PUBLISH 한 번으로 메시지를 받는 대상은 누구인가?',
      o: ['그 순간 채널을 구독하고 있는 모든 클라이언트', '구독자 중 한 명(라운드로빈)', '나중에 구독할 클라이언트까지 포함한 전부'], a: 0,
      why: 'Pub/Sub 은 1:N 방송이다. 지금 듣고 있는 Bob · Carol · Dave 셋 모두에게 같은 메시지가 가고, 어디에도 저장되지 않는다.' },
    { q: '구독자 Bob 이 잠깐 끊긴 사이 발행된 msg2 는 어떻게 되나?',
      o: ['Bob 이 재접속하면 다시 받는다', 'Bob 몫은 사라지고 다시 받을 방법이 없다', 'PUBLISH 가 자동으로 재시도한다'], a: 1,
      why: 'Pub/Sub 은 발행 순간의 구독자에게만 전달하고 저장하지 않는다. PUBLISH 반환값으로 수신자 수는 알 수 있지만 재시도 장치는 없다.' },
    { q: 'Pub/Sub 과 비교한 Redis Stream 의 결정적 차이는?',
      o: ['메시지가 더 빨리 전달된다', '별도 서버를 설치해야 쓸 수 있다', '메시지가 저장돼, 늦게 붙어도 과거 메시지를 읽을 수 있다'], a: 2,
      why: 'XADD 한 항목은 Stream 키 안에 남고 XREAD "0" 으로 처음부터 읽을 수 있다. 그래서 재처리가 된다.' },
    { q: '채팅 예제에서 잠깐 끊겼다 돌아온 Carol 은 놓친 메시지를 어떻게 채우나?',
      o: ['Pub/Sub 이 쌓아 둔 메시지를 다시 받는다', '재접속 때 chat:history Stream 에서 최근 50개를 가져온다', '다른 사용자에게 다시 보내 달라고 한다'], a: 1,
      why: '실시간 전달은 Pub/Sub 이, 기록은 같은 메시지를 XADD 해 둔 Stream 이 맡는다. 끊긴 동안의 실시간 메시지는 못 받지만 히스토리로 메운다.' },
    { q: 'events 스트림에 analytics · notifications · audit 세 consumer group 을 만들면 이벤트는 어떻게 소비되나?',
      o: ['세 그룹이 같은 이벤트를 각자 독립적으로 읽는다', '세 그룹이 이벤트를 하나씩 나눠 가져간다', '먼저 읽은 그룹이 가져가면 다른 그룹은 못 본다'], a: 0,
      why: '그룹마다 따로 읽기 위치와 lag 을 가진다. id="0" 으로 만든 세 그룹은 모두 처음부터 같은 이벤트를 읽고, 그룹 안에서는 consumer 끼리 분담한다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'PUBLISH는 그 순간 구독 중인 클라이언트에게만 가고 어디에도 저장되지 않는다.',
    '구독자가 끊기거나 느리면 메시지를 잃는다. 반환값 0을 받아도 다시 보낼 장치가 없다.',
    'Stream은 XADD로 쌓아 두므로 늦게 붙어도 과거를 읽는다. maxlen으로 길이를 제한한다.',
    '잃어도 되는 알림과 캐시 무효화는 Pub/Sub, 주문 이벤트와 작업 큐는 Stream에 맡긴다.',
  ];
  const review = [
    { q: '주문 완료 이벤트를 Pub/Sub으로 보냈더니 배포 때마다 일부 주문의 후처리가 빠진다. 가장 맞는 대처는?',
      o: ['PUBLISH 반환값이 0이면 같은 메시지를 다시 보낸다', '주문 이벤트를 Stream에 넣고 consumer group으로 읽는다', 'psubscribe 패턴 구독으로 바꿔 더 넓게 받는다'], a: 1,
      why: '구독자가 끊긴 사이 발행된 메시지는 저장되지 않아 사라진다. Stream은 쌓아 두고 ack 전까지 PEL에 남겨 재시도까지 된다.' },
    { q: '대시보드 구독자 하나가 메시지를 못 따라가더니 어느 순간 연결이 끊겼다. 원인은?',
      o: ['output buffer가 한도를 넘어 Redis가 끊었다', 'Stream의 maxlen에 걸려 오래된 메시지가 잘렸다', 'XACK를 빼먹어 PEL이 가득 차 버렸다'], a: 0,
      why: 'Pub/Sub은 못 따라오는 구독자 몫을 출력 버퍼에 쌓다가 한도를 넘으면 연결을 끊는다. maxlen과 XACK는 Stream 쪽 이야기다.' },
    { q: '세 가지 중 Pub/Sub이 가장 잘 맞는 것은?',
      o: ['결제 완료 이벤트 처리', '나중에 다시 봐야 하는 감사 로그', '여러 서버에 보내는 캐시 무효화 신호'], a: 2,
      why: '캐시 무효화는 놓쳐도 다음에 다시 오는 신호라 손실을 견딘다. 결제는 손실이 안 되고 감사 로그는 히스토리가 필요해 Stream이 맞다.' },
  ];

  R.page({ title: 'Pub/Sub 과 Stream 의 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
