/* I-1-3 Connection 과 Channel — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, cross, check, lock, meters, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  function app(cx, cy, name, o) { o = o || {}; return card(cx, cy, o.w || 130, 62, { rx: 10, text: name, fs: 15, fw: 800, mono: true, stroke: o.col || INK, color: o.col || INK, s: o.s, op: o.op }); }
  // 굵은 TCP 관 (가로)
  function pipe(x1, x2, y, h, o) { o = o || {}; el('rect', { x: x1, y: y - h / 2, width: Math.max(0, (x2 - x1) * (o.u ?? 1)), height: h, rx: Math.min(18, h / 2), fill: o.fill || SOFT, stroke: o.col || INK, 'stroke-width': 2.5, opacity: o.op ?? 1 }); }
  // prefetch 창: n 칸 중 f 칸 차 있음
  function slots(x, y, n, f, o) { o = o || {}; const w = o.w || 26, gap = 4;
    for (let i = 0; i < n; i++) el('rect', { x: x + i * (w + gap), y, width: w, height: 26, rx: 4, fill: i < f ? (o.col || WARN) : PANEL, stroke: i < f ? 'none' : GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 }); }
  function toggle(x, y, name, on, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y: y - 14, width: 52, height: 28, rx: 14, fill: on ? GOOD : OFF, opacity: op }); el('circle', { cx: on ? x + 38 : x + 14, cy: y, r: 10, fill: PANEL, opacity: op });
    mono(x + 66, y + 5, name, { 'font-size': 15, 'font-weight': 700, opacity: op }); }

  // ---------- 1. Connection 은 비싸다 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { app(120, 210, 'App');
      const d = pop(u, 0.2); const g = R.G(430, 210, d); el('path', { d: 'M0,-58 L130,0 L0,58 L-130,0 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.2 }, g);
      tx(0, -4, 'sharedConnection', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono' }, g); tx(0, 18, '.isOpen() ?', { 'text-anchor': 'middle', 'font-size': 14.5, class: 'mono' }, g);
      grow(185, 210, 298, 210, E(u, 0.1, 0.5), INK);
      grow(430, 150, 430, 86, E(u, 0.9, 1.3), GOOD); pill(430, 66, '예 → 있던 것을 그대로 돌려준다', GOOD, pop(u, 1.3), { fs: 14 });
      grow(562, 210, 700, 210, E(u, 1.6, 2.0), MUT); pill(790, 210, '아니오 → 새로 연다', MUT, pop(u, 2.0), { fs: 14 });
      sub(430, 330, '이 세 줄이 없으면 부를 때마다 소켓이 하나씩 는다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1 || k === 2) { tx(480, 46, 'ConnectionFactory', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, class: 'mono' });
      const F = [['setHost', '"localhost"'], ['setPort', '5672'], ['setUsername', '"app"'], ['setPassword', '"••••••"'], ['setVirtualHost', '"/"'], ['setRequestedHeartbeat', '60'], ['setConnectionTimeout', '10_000']];
      F.forEach(([a, b], i) => { if (i >= 5 && k === 1) return; const fresh = k === 1 ? i < 5 : i >= 5, d = fresh ? (k === 1 ? 0.2 + i * 0.3 : 0.3 + (i - 5) * 0.5) : -1;
        const y = 82 + i * 42, hot = k === 2 && i >= 5; card(480, y + 14, 520, 34, { rx: 7, stroke: hot ? ACC : GRID, sw: hot ? 2.2 : 1.5 });
        mono(240, y + 19, a, { 'font-size': 14.5, fill: hot ? ACC : MUT, 'font-weight': hot ? 700 : 400 }); mono(720, y + 19, fresh ? b.slice(0, Math.ceil(b.length * seg(u, d, d + 0.4))) : b, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end' }); });
      if (k === 1) sub(480, 330, '로컬 객체에 값을 넣을 뿐, 소켓은 아직 없다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 2) sub(480, 400, 'heartbeat는 요청값이다. 서버 값과 견줘 둘 다 0이 아니면 작은 쪽을 쓴다', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 3) { // newConnection: 왕복을 센다
      app(110, 70, 'App'); server(850, 74, 'RabbitMQ', { s: 0.8 });
      [[110, 110], [850, 110]].forEach(([x]) => el('line', { x1: x, y1: 112, x2: x, y2: 400, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5' }));
      const legs = [['SYN', 1], ['SYN-ACK', -1], ['ACK + "AMQP 0091"', 1], ['connection.start', -1], ['start-ok', 1], ['tune', -1], ['tune-ok + open', 1], ['open-ok', -1]];
      legs.forEach(([s, d], i) => { const y = 132 + i * 33, g = E(u, 0.15 + i * 0.25, 0.4 + i * 0.25), a = d > 0 ? 118 : 842, b = d > 0 ? 842 : 118, col = i < 2 ? MUT : ACC;
        grow(a, y, lerp(a, b, 1), y + 14, g, col, { sw: 2 }); if (g > 0.3) mono(480, y + 2, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, 'font-weight': 700 }); });
      const op = fade(u, 2.3); sub(480, 412 - 4, 'TCP 1왕복 + AMQP 3왕복 (TLS면 더 늘어난다)', op, { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4: 하나를 오래 쓴다 vs 요청마다 새로
    lbl(240, 60, '프로세스당 1개를 오래', fade(u, 0.1), { fill: GOOD, 'font-size': 16 });
    app(90, 200, 'App', { w: 100 }); server(410, 200, '', { s: 0.7 }); pipe(140, 370, 200, 34, { col: GOOD, u: E(u, 0.2, 0.8) });
    for (let i = 0; i < 6; i++) dot([[150, 200], [360, 200]], ((t * 0.7 + i / 6) % 1), GOOD, 5);
    sub(255, 250, '핸드셰이크는 시작할 때 한 번', fade(u, 0.9));
    lbl(720, 60, '요청마다 newConnection()', fade(u, 1.0), { fill: BAD, 'font-size': 16 });
    for (let i = 0; i < 6; i++) { const y = 110 + i * 34, g = E(u, 1.1 + i * 0.12, 1.5 + i * 0.12); grow(600, y, 600 + 240 * g, y, g, BAD, { plain: true, sw: 2 });
      if (g >= 1) mono(860, y + 5, '+4왕복', { 'font-size': 13.5, fill: BAD, 'font-weight': 700 }); }
    sub(720, 330, '소켓·파일 디스크립터·브로커 메모리가 같이 는다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); cross(720, 370, 12, pop(u, 2.2)); }

  // ---------- 2. 한 소켓 위 여러 채널 ----------
  const LANES = [[150, 'ch 1 · publish · confirm', ACC], [210, 'ch 2 · consume', INFO], [270, 'ch 3 · declare', WARN]];
  function s2(t, c) { const { k, u } = c;
    app(80, 210, 'App', { w: 100 }); server(880, 210, 'RabbitMQ', { s: 0.75 });
    pipe(132, 832, 210, 190, { col: INK, fill: PANEL }); tx(146, 134, 'TCP Connection 1개', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    LANES.forEach(([y, s, col], i) => { if (i > k && k < 3) return; const fresh = k === i, g = fresh ? E(u, 0.2, 1.1) : 1, dead = k === 4 && i === 2;
      el('line', { x1: 150, y1: y + 18, x2: lerp(150, 812, g), y2: y + 18, stroke: dead ? BAD : col, 'stroke-width': 4, opacity: k === 3 ? 0.35 : 1, 'stroke-dasharray': dead ? '8 6' : null });
      tx(160, y + 6, s, { 'font-size': 14.5, 'font-weight': 700, fill: dead ? BAD : col, opacity: (fresh ? fade(u, 0.4) : 1) * (k === 3 ? 0 : 1), class: 'mono' });
      if (fresh && i < 3) { mono(812, y + 6, 'channel.open ⇄ open-ok', { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 1.1) }); } });
    if (k === 2) { const s = 'exchange · queue · bind'; pill(620, 340, s, WARN, pop(u, 1.4), { mono: true, fs: 13.5, fill: PANEL }); }
    if (k === 0) sub(480, 352, '새 TCP 연결 없이 열린 소켓 안에서 한 번 주고받는다', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    if (k === 3) { // frame 마다 채널 번호가 붙어 한 줄로 섞여 간다
      const seq = [1, 2, 1, 3, 2, 1, 3]; const cols = { 1: ACC, 2: INFO, 3: WARN };
      seq.forEach((n, i) => { const x = 180 + ((t * 120 + i * 90) % 630); card(x, 210, 54, 36, { rx: 6, text: 'ch=' + n, fs: 13.5, mono: true, fw: 700, fill: cols[n], stroke: 'none', color: PANEL }); });
      ['publish ch = 1', 'consume ch = 2', 'admin   ch = 3'].forEach((s, i) => mono(160, 344 + i * 22 - 20, s, { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.3) }));
      sub(640, 352, '프레임 머리의 channel 번호로 브로커가 나눈다', fade(u, 1.6), { fill: INK, 'font-weight': 700 }); }
    if (k === 4) { for (let i = 0; i < 4; i++) { dot([[160, 168], [812, 168]], ((t * 0.5 + i / 4) % 1), ACC, 6); dot([[812, 228], [160, 228]], ((t * 0.5 + i / 4) % 1), INFO, 6); }
      cross(500, 288, 13, pop(u, 0.4)); mono(520, 330, '406 PRECONDITION_FAILED', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) });
      sub(480, 360, 'ch 3만 닫히고 ch 1·2는 계속 흐른다', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 400, '다만 Channel은 스레드끼리 나눠 쓰지 않는다 (다음 장면)', fade(u, 1.8), { fill: WARN, 'font-weight': 700 }); } }

  // ---------- 3. 스레드마다 채널, 채널마다 prefetch ----------
  const TH = [['thread-A', 10, 90], ['thread-B', 10, 170], ['thread-C', 1, 250]];
  function s3(t, c) { const { k, u } = c;
    if (k === 4) { // 한 채널을 두 스레드가 같이 쓰면
      app(110, 120, 'thread-A', { w: 140 }); app(110, 280, 'thread-B', { w: 140 });
      card(430, 200, 170, 60, { rx: 10, text: 'shared_ch', fs: 15, mono: true, fw: 800, stroke: BAD, color: BAD });
      grow(182, 130, 342, 190, E(u, 0.1, 0.5), ACC); grow(182, 270, 342, 210, E(u, 0.1, 0.5), INFO);
      const seq = [['M', 'A'], ['M', 'B'], ['H', 'A'], ['B', 'A'], ['H', 'B'], ['B', 'B']];
      seq.forEach(([f, who], i) => { const s = pop(u, 0.5 + i * 0.2); card(560 + i * 50, 200, 44, 40, { rx: 6, text: f + who, fs: 14, mono: true, fw: 800, fill: who === 'A' ? ACC : INFO, stroke: 'none', color: PANEL, s }); });
      sub(685, 240, 'method·header·body 순서가 섞인다', fade(u, 1.7), { fill: BAD, 'font-weight': 700 });
      mono(685, 300, 'UNEXPECTED_FRAME → 연결 종료', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); cross(840, 170, 13, pop(u, 2.0)); return; }
    card(830, 200, 160, 220, { rx: 12, stroke: INK, sw: 2 }); tx(830, 112, 'orders.queue', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono' });
    for (let i = 0; i < 6; i++) el('rect', { x: 770, y: 130 + i * 30, width: 120, height: 22, rx: 4, fill: ACC, opacity: 0.8 });
    TH.forEach(([n, pf, y], i) => { if (i > 0 && k < 3) return; const fresh = k === 3 && i > 0, op = fresh ? fade(u, 0.2 + i * 0.4) : 1;
      app(100, y + 13, n, { w: 130, op }); pill(240, y + 13, 'conn·ch', INK, op, { fs: 13.5, mono: true, fill: PANEL });
      if (k === 0) return;
      let f = pf; if (k === 1 && i === 0) f = 0; if (k === 2 && i === 0) { const a = u < 0.8 ? Math.floor(seg(u, 0, 0.8) * 10) : u < 1.6 ? 10 : u < 2.2 ? 9 : 10; f = a; }
      slots(310, y, pf, f, { op, w: pf === 1 ? 26 : 26, col: i === 2 ? BAD : WARN });
      mono(310 + pf * 30 + 10, y + 19, 'prefetch ' + pf, { 'font-size': 14, 'font-weight': 700, fill: i === 2 ? BAD : INK, opacity: op });
      if (f > 0) grow(745, y + 13, 310 + pf * 30 + 120, y + 13, 1, MUT, { sw: 1.6, op: op * 0.7 }); });
    if (k === 0) sub(300, 330, 'pika BlockingConnection은 스레드끼리 나눠 쓰지 못한다', fade(u, 0.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 1) sub(300, 330, 'basic_qos는 이 채널에만 걸린다. 미확인 최대 10건', fade(u, 0.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 2) { const n = u < 0.8 ? Math.floor(seg(u, 0, 0.8) * 10) : u < 1.6 ? 10 : u < 2.2 ? 9 : 10;
      mono(300, 330, 'in-flight ' + n + ' / 10', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
      if (u > 1.6 && u < 2.2) pill(560, 102, 'ack', GOOD, 1, { fs: 14 });
      sub(300, 362, 'ack 하나에 한 칸이 비고, 그 칸으로 다음 메시지가 온다', fade(u, 1.0)); }
    if (k === 3) sub(300, 330, '무거운 thread-C는 1건씩만 받는다', fade(u, 1.4), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  // ---------- 4. heartbeat 와 자동 복구 ----------
  function s4(t, c) { const { k, u } = c;
    const ax = R.axes(80, 250, 800, 60, { x: [0, 180], y: [0, 1], xt: [0, 30, 60, 90, 120, 150, 180], xl: '초 (끊긴 시각 60초는 예시)' });
    app(80, 90, 'client', { w: 110 }); server(860, 90, '', { s: 0.6 });
    pipe(140, 820, 90, 26, { col: k === 2 ? BAD : INK, fill: k === 2 ? 'var(--badbg)' : PANEL });
    if (k === 2) cross(480, 90, 14, pop(u, 0.2));
    // heartbeat 눈금: 30초마다
    [30, 60, 90, 120, 150, 180].forEach((s, i) => { const miss = k >= 2 && s > 60 && s <= 120, after = k >= 2 && s > 120, op = k === 0 ? fade(u, 0.2 + i * 0.25) : 1;
      if (k >= 2 && after && k === 2) return;
      if (miss) { cross(ax.X(s), 270, 9, k === 2 ? pop(u, s === 90 ? 0.7 : 1.2) : 1); return; }
      el('circle', { cx: ax.X(s), cy: 270, r: 9, fill: k >= 3 && s > 120 ? GOOD : ACC, opacity: op }); });
    if (k === 0) { sub(480, 160, 'timeout 60 → 약 30초마다 heartbeat frame', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 186, '두 번 연속 못 받으면 죽은 연결로 본다', fade(u, 1.8)); return; }
    if (k === 1) { [['automaticRecovery', 0.3], ['topologyRecovery', 0.8], ['interval 5s', 1.3]].forEach(([s, d], i) => toggle(150 + i * 250, 170, s, u > d + 0.3, { op: fade(u, d) })); return; }
    if (k === 2) { const g = E(u, 1.4, 1.8); if (g > 0) { el('line', { x1: ax.X(120), y1: 230, x2: ax.X(120), y2: 320, stroke: BAD, 'stroke-width': 2.5, opacity: g }); mono(ax.X(120) + 8, 236, '감지', { 'font-size': 14, fill: BAD, 'font-weight': 800, opacity: g }); }
      for (let i = 0; i < 6; i++) { const s = 125 + i * 5; if (u > 1.8 + i * 0.12) el('circle', { cx: ax.X(s), cy: 300, r: 4.5, fill: WARN }); }
      sub(ax.X(158), 216, '5초마다 재연결 시도', fade(u, 2.0), { fill: WARN, 'font-weight': 700 });
      mono(480, 170, 'handleRecoveryStarted', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 3) { const ch = ['Connection', 'Channel', 'exchange·queue', 'binding', 'consumer'];
      ch.forEach((s, i) => { const x = 130 + i * 175, s0 = pop(u, 0.2 + i * 0.35); card(x, 170, 150, 44, { rx: 22, text: s, fs: 14, fw: 700, stroke: GOOD, color: GOOD, s: s0 }); if (i) grow(x - 100, 170, x - 77, 170, E(u, 0.2 + i * 0.35, 0.4 + i * 0.35), GOOD); });
      mono(480, 220, 'handleRecovery', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    // k4: 재배달과 중복 걸러내기
    msg2(300, 175, 'ord-42', WARN, fade(u, 0.2)); sub(300, 210, '끊기기 전 unacked', fade(u, 0.3));
    fly(360, 175, 600, 175, seg(u, 0.6, 1.4), 'ord-42 · redelivered', { fill: WARN, stay: true, mono: true });
    card(780, 175, 200, 56, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 1.5) }); mono(780, 172, 'processed: {ord-42}', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    sub(780, 194, '이미 처리함 → 건너뜀', fade(u, 1.9), { fill: GOOD, 'font-weight': 700 }); }
  function msg2(cx, cy, t, col, op) { card(cx, cy, tw(t, 14) + 20, 28, { rx: 6, text: t, fs: 14, mono: true, fw: 700, fill: col, stroke: 'none', color: PANEL, op }); }

  // ---------- 5. 누수를 숫자로 잡는다 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { lbl(480, 52, 'Channel per message', 1, { fill: BAD, 'font-size': 17 });
      const n = 4201 + Math.floor(seg(u, 0.2, 2.4) * 12);
      for (let i = 0; i < 8; i++) { const x = 140 + i * 95, ph = (t * 1.3 + i * 0.37) % 1;
        card(x, 180, 82, 44, { rx: 8, text: 'open', fs: 13.5, mono: true, stroke: ph < 0.5 ? ACC : OFF, color: ph < 0.5 ? ACC : OFF });
        card(x, 240, 82, 44, { rx: 8, text: 'close', fs: 13.5, mono: true, stroke: ph >= 0.5 ? BAD : OFF, color: ph >= 0.5 ? BAD : OFF }); }
      mono(480, 320, 'ch #' + n, { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      sub(480, 352, '메시지마다 channel.open·close 왕복 (번호는 예시)', fade(u, 0.8)); return; }
    if (k === 1 || k === 2) { const L1 = ['$ rabbitmqctl list_connections name user state channels', 'name       user  state    channels', ['app-main   app   running  4213', '#fca5a5']];
      const L2 = ['$ rabbitmqctl list_channels connection number prefetch_count messages_unacknowledged', 'connection  number  prefetch_count  messages_unacknowledged', ['app-main    4213    0               늘어남', '#fca5a5'], ['app-main    4214    0               늘어남', '#fca5a5']];
      const L = k === 1 ? L1 : L2; terminal(40, 60, 880, 210, L, Math.min(L.length, 1 + seg(u, 0.2, 1.4) * (L.length - 1)), { title: 'monitor.sh · 출력은 예시', fs: 14 });
      sub(480, 310, k === 1 ? 'Connection 하나에 채널 4213개면 채널을 닫지 않고 있다' : 'prefetch_count 0 = 한도 없음, unacked가 계속 쌓인다', fade(u, 1.6), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    const b = c.beat, cc = 812, chn = 6104;
    if (k === 3) { meters(160, 110, 640, [{ name: 'connections (예시)', val: String(Math.round(tween(0, cc, u))) }, { name: 'channels (예시)', val: String(Math.round(tween(0, chn, u))) }], { h: 80 });
      sub(480, 250, 'wc -l 로 센 두 숫자가 경보의 입력이다', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { [['connections', cc, 500, 1000], ['channels', chn, 5000, 8000]].forEach(([n, v, th, max], i) => { const y = 110 + i * 120;
        tx(60, y + 16, n, { 'font-size': 16, 'font-weight': 800, class: 'mono' }); R.hbar(220, y, 560, v, max, { h: 26, u: E(u, 0.2 + i * 0.4, 1.2 + i * 0.4), col: BAD, text: String(v) });
        const tx0 = 220 + 560 * th / max; el('line', { x1: tx0, y1: y - 12, x2: tx0, y2: y + 38, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }); mono(tx0, y - 18, '임계 ' + th, { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK });
        pill(500, y + 66, i === 0 ? '[ALERT] Connection 남발 의심' : '[ALERT] Channel per message 의심', BAD, pop(u, 1.4 + i * 0.4), { fs: 14 }); }); return; }
    // k5: 권장 모양
    app(90, 210, 'App', { w: 100 }); server(880, 210, '', { s: 0.7 });
    [[140, '발행용 Connection', [['pool ch 1', ACC], ['pool ch 2', ACC]]], [280, '소비용 Connection', [['ch 3 · prefetch 20', INFO], ['ch 4 · prefetch 20', INFO]]]].forEach(([y, n, chs], i) => {
      const g = E(u, 0.2 + i * 0.5, 0.9 + i * 0.5); pipe(150, 820, y, 92, { u: g, fill: PANEL }); tx(166, y - 30, n, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: g });
      chs.forEach(([s, col], j) => { const yy = y - 8 + j * 30; el('line', { x1: 380, y1: yy, x2: lerp(380, 800, g), y2: yy, stroke: col, 'stroke-width': 4 }); mono(370, yy + 5, s, { 'font-size': 13.5, fill: col, 'text-anchor': 'end', 'font-weight': 700, opacity: g }); }); });
    mono(480, 400, 'channels 6104 → 4', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: 'newConnection() 한 줄이 비싼 이유는 무엇인가?',
      o: ['TCP 연결과 AMQP 핸드셰이크로 여러 번 왕복하기 때문이다', '메시지를 한꺼번에 미리 받아 오기 때문이다', '매번 큐를 새로 선언하기 때문이다'], a: 0,
      why: 'TCP 1왕복에 start·tune·open 협상 3왕복이 더해진다(TLS면 더 늘어난다). 그래서 앱 시작 때 한 번 열어 오래 쓴다.' },
    { q: '선언 전용 ch 3에서 406 PRECONDITION_FAILED가 났다. 닫히는 범위는 무엇인가?',
      o: ['TCP Connection 전체', 'ch 3 하나', '같은 Connection의 모든 consume 채널'], a: 1,
      why: '이런 오류는 그 채널만 닫는다. 용도별로 채널을 나누면 발행 ch 1과 소비 ch 2는 계속 흐른다.' },
    { q: 'pika 워커 스레드 세 개가 메시지를 받게 하려면 어떻게 만드는가?',
      o: ['채널 하나를 만들어 세 스레드가 같이 쓴다', '스레드마다 Connection과 Channel을 따로 만든다', 'prefetch를 0으로 두고 한 스레드가 나눠 준다'], a: 1,
      why: 'pika의 BlockingConnection과 채널은 스레드끼리 나눠 쓰지 못한다. 같이 쓰면 frame 순서가 섞여 연결이 끊긴다.' },
    { q: 'heartbeat를 60초로 협상했다. 대략 언제 죽은 연결로 판단하는가?',
      o: ['heartbeat frame을 한 번 놓친 즉시', '30초마다 오던 frame을 두 번 연속 받지 못했을 때', '5분 동안 아무 메시지도 publish하지 않았을 때'], a: 1,
      why: 'heartbeat frame은 timeout의 절반인 약 30초마다 오가고, 두 번 연속 오지 않으면 끊긴 것으로 본다.' },
    { q: 'list_connections에서 한 Connection의 channels 값이 계속 커진다. 의심할 코드는?',
      o: ['요청마다 채널을 열고 닫지 않는 코드', 'heartbeat 설정 코드', 'exchange 선언 코드'], a: 0,
      why: '채널이 쌓이는 것은 열기만 하고 닫지 않는 누수다. 채널은 스레드마다 하나를 오래 쓰도록 바꾼다.' },
  ];

  const summary = [
    'Connection은 TCP 소켓 하나이고 여는 데 여러 번 왕복하므로 시작할 때 열어 오래 쓴다.',
    '작업은 Connection 안의 Channel에서 하고, frame에 붙은 channel 번호로 구분된다.',
    'Channel은 스레드끼리 나눠 쓰지 않고, prefetch도 채널마다 따로 건다.',
    'heartbeat로 끊김을 알아채고 자동 복구가 다시 붙으면 미확인 메시지는 재배달된다.',
  ];
  const review = [
    { q: '웹 요청마다 newConnection()과 createChannel()을 부르는 서비스에서 트래픽이 늘자 브로커 메모리가 찼다. 먼저 고칠 것은?',
      o: ['prefetch를 크게 올린다', 'Connection은 하나를 오래 쓰고 채널은 스레드마다 재사용한다', 'heartbeat를 0으로 끈다'], a: 1,
      why: '요청마다 소켓과 채널이 새로 생기면 핸드셰이크 비용과 브로커 자원이 함께 는다. 오래 쓰는 소수의 연결과 스레드별 채널로 바꾼다.' },
    { q: '방화벽이 유휴 연결을 끊은 뒤 자동 복구로 다시 붙었다. 결제 컨슈머가 같은 주문을 두 번 처리했다. 왜 그런가?',
      o: ['topologyRecovery가 큐를 두 개 만들었다', 'heartbeat가 메시지를 복사했다', '끊길 때 ack 전이던 메시지가 재배달됐다'], a: 2,
      why: '연결이 끊기면 unacked 메시지는 큐로 돌아가 다시 나간다. 그래서 컨슈머는 message_id로 중복을 걸러 멱등하게 짠다.' },
    { q: '한 채널에서 주문 소비와 대용량 리포트 소비를 같이 하니 주문이 늦다. 어떻게 나누는가?',
      o: ['채널을 나누고 리포트 채널의 prefetch를 1로 둔다', 'Connection을 요청마다 새로 연다', '두 컨슈머 모두 auto_ack로 바꾼다'], a: 0,
      why: 'prefetch는 채널마다 따로 걸 수 있다. 무거운 작업은 따로 떼어 1건씩 받게 하면 주문 채널이 막히지 않는다.' },
  ];

  R.page({ title: '커넥션과 채널', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
