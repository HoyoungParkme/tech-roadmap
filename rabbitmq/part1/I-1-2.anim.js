/* I-1-2 AMQP 0-9-1 프로토콜 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   바이트 수는 pika 1.5 의 frame 직렬화(pika.frame.Method/Header/Body.marshal)로 잰 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // 계층 띠
  function band(y, h, name, hot, o) { o = o || {}; const w = o.w || 640;
    el('rect', { x: 40, y, width: w * (o.u ?? 1), height: h, rx: 10, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2.5 : 1.5 });
    tx(58, y + 24, name, { 'font-size': 15, 'font-weight': 800, fill: hot ? ACC : INK, opacity: o.u == null || o.u > 0.5 ? 1 : 0 }); }
  // 바이트 칸 하나
  function byte(x, y, s, o) { o = o || {}; card(x + 24, y + 22, 48, 44, { rx: 5, text: s, fs: 15, mono: true, fw: 700, stroke: o.col || INK, color: o.color || o.col || INK, fill: o.fill, s: o.s, op: o.op, sw: 2 }); }
  // 위아래 묶음 표시
  function brace(x1, x2, y, s, col, op) { el('path', { d: `M${x1},${y} L${x1},${y + 8} L${x2},${y + 8} L${x2},${y}`, fill: 'none', stroke: col || MUT, 'stroke-width': 1.8, opacity: op ?? 1 });
    tx((x1 + x2) / 2, y + 28, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col || MUT, opacity: op ?? 1 }); }
  // 시퀀스 도식: 클라이언트·브로커 세로선, 한 줄짜리 메시지 화살표
  const CL = 170, SV = 790;
  function lanes(a, b, o) { o = o || {}; [[CL, a], [SV, b]].forEach(([x, s]) => { card(x, 46, 150, 40, { rx: 8, text: s, fs: 15, fw: 800, stroke: INK });
    el('line', { x1: x, y1: 66, x2: x, y2: o.bottom || 400, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5' }); }); }
  function call(y, s, dir, u, o) { o = o || {}; if (u <= 0) return; const a = dir > 0 ? CL : SV, b = dir > 0 ? SV : CL, col = o.col || (dir > 0 ? ACC : INK);
    grow(a + (dir > 0 ? 6 : -6), y, b - (dir > 0 ? 8 : -8), y, u, col, { sw: 2.4, dash: o.dash });
    mono((CL + SV) / 2, y - 8, s, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: col, opacity: fade(u * 2, 0.4, 0.6) });
    if (o.note) tx(dir > 0 ? SV + 14 : CL - 14, y + 5, o.note, { 'font-size': 13.5, fill: MUT, 'text-anchor': dir > 0 ? 'start' : 'end', opacity: fade(u * 2, 0.6, 0.6) }); }

  // ---------- 1. 계층 안의 자리 ----------
  function s1(t, c) { const { k, u } = c;
    band(56, 54, 'Application', k === 3, {}); tx(220, 89, 'pika · aio-pika 코드가 method를 부른다', { 'font-size': 14, fill: MUT });
    band(124, 116, 'AMQP 0-9-1', k === 0 || k === 2 || k === 3);
    band(254, 54, 'TCP', k === 1, { u: k === 1 ? E(u, 0.1, 0.8) : 1 });
    band(322, 44, 'IP', false); tx(120, 349, '네트워크', { 'font-size': 14, fill: MUT });
    // AMQP 띠 안: 버전 → frame 4종 → method class 7종
    mono(220, 148, 'version 0-9-1 · 2008 · stable', { 'font-size': 14.5, fill: k === 0 ? ACC : MUT, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.3) : 1 });
    if (k >= 2) [['method', 1], ['header', 2], ['body', 3], ['heartbeat', 8]].forEach(([n, v], i) => pill(120 + i * 136, 182, `${v} ${n}`, k === 2 ? ACC : INK, k === 2 ? pop(u, 0.2 + i * 0.3) : 1, { mono: true, fs: 13.5, fill: PANEL }));
    if (k >= 3) { let x = 58; ['connection', 'channel', 'exchange', 'queue', 'basic', 'tx', 'confirm'].forEach((n, i) => { const w = tw(n, 13.5) + 26; pill(x + w / 2, 220, n, k === 3 ? INFO : MUT, k === 3 ? pop(u, 0.3 + i * 0.18) : 1, { mono: true, fs: 13.5, fill: PANEL }); x += w + 8; }); }
    if (k === 3) grow(480, 98, 480, 206, E(u, 1.8, 2.4), INFO);
    // TCP 포트
    if (k >= 1) { const op = k === 1 ? fade(u, 0.8) : 1; mono(220, 287, '5672 평문', { 'font-size': 14.5, 'font-weight': 700, opacity: op });
      mono(380, 287, '5671 TLS', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: op }); lock(480, 282, true, GOOD, op);
      if (k === 1) sub(600, 287, '운영은 TLS', fade(u, 1.6), { fill: GOOD, 'font-weight': 700 }); }
    // 오른쪽: 1.0 은 다른 스펙 / 구현체
    if (k === 0) { const op = fade(u, 1.2); card(820, 182, 210, 76, { rx: 10, stroke: BAD, sw: 2, dash: '6 4', op });
      tx(820, 176, 'AMQP 1.0', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: op }); sub(820, 200, '이름만 같은 다른 스펙', op, { fill: BAD });
      grow(686, 182, 712, 182, E(u, 1.4, 1.8), BAD, { plain: true }); cross(700, 182, 9, pop(u, 1.8)); }
    if (k === 4) { sub(820, 92, '같은 스펙을 구현한 브로커', fade(u, 0.2), { 'font-weight': 700, fill: INK, 'font-size': 14.5 });
      ['RabbitMQ', 'Qpid Broker-J', 'LavinMQ'].forEach((n, i) => { const y = 150 + i * 78, s = pop(u, 0.4 + i * 0.35);
        card(820, y, 190, 56, { rx: 10, text: n, fs: 15, fw: 800, stroke: i === 0 ? ACC : INK, color: i === 0 ? ACC : INK, s }); grow(684, y, 722, y, E(u, 0.6 + i * 0.35, 1.0 + i * 0.35), MUT, { plain: true }); });
      sub(820, 392, '브로커를 바꿔도 클라이언트 코드는 그대로', fade(u, 1.8)); } }

  // ---------- 2. frame 한 개의 바이트 ----------
  const BX = 70, BY = 150;   // 첫 바이트 칸 왼쪽 위
  const BW = 54, PX = BX + 7 * BW + 8, PW = 230, EX = PX + PW + 8;
  function s2(t, c) { const { k, u } = c;
    const bytes = ['01', '00', '01', '00', '00', '00', '20'];
    const shown = k === 0 ? 0 : k === 2 ? Math.min(7, Math.floor(seg(u, 0.4, 1.8) * 8)) : 7;
    for (let i = 0; i < 7; i++) { const on = i < shown || k >= 3, col = i === 0 ? ACC : i < 3 ? INFO : WARN;
      byte(BX + i * BW, BY, k === 0 ? (i === 0 ? '?' : '·') : on || k === 1 ? (k === 1 ? ['T', 'C', 'C', 'S', 'S', 'S', 'S'][i] : bytes[i]) : '', { col: k === 0 && i > 0 ? GRID : col, s: k === 2 && i < shown ? pop(u, 0.4 + i * 0.2) : 1 }); }
    // payload · 끝 마커
    card(PX + PW / 2, BY + 22, PW, 44, { rx: 6, text: k >= 2 ? '32 B payload' : 'payload', fs: 15, mono: true, stroke: INK, fill: SOFT, op: k === 2 ? fade(u, 1.8) : 1 });
    byte(EX, BY, 'CE', { col: GOOD, fill: 'var(--goodbg)' });
    if (k === 0) { sub(EX + 24, BY + 70, '끝 마커는 항상 0xCE', fade(u, 0.3), { fill: GOOD, 'font-weight': 700 });
      [['1', 'method'], ['2', 'header'], ['3', 'body'], ['8', 'heartbeat']].forEach(([v, n], i) => { const s = pop(u, 0.6 + i * 0.3);
        card(130 + i * 120, 290, 104, 52, { rx: 8, stroke: ACC, s }); mono(130 + i * 120, 290, v, { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.7 + i * 0.3) });
        tx(130 + i * 120, 308, n, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.7 + i * 0.3) }); });
      grow(BX + 24, BY + 50, 130, 262, E(u, 1.8, 2.4), ACC); sub(BX + 24, BY - 14, 'type 칸에 들어갈 값', fade(u, 1.9), { fill: ACC, 'font-weight': 700 }); return; }
    if (k === 1) { brace(BX, BX + BW - 6, BY + 52, 'type 1B', ACC, fade(u, 0.2)); brace(BX + BW, BX + 3 * BW - 6, BY + 52, 'channel 2B', INFO, fade(u, 0.5));
      brace(BX + 3 * BW, BX + 7 * BW - 6, BY + 52, 'size 4B', WARN, fade(u, 0.8)); brace(PX, PX + PW, BY + 52, 'payload = size 바이트', INK, fade(u, 1.1)); brace(EX, EX + 48, BY + 52, 'end 1B', GOOD, fade(u, 1.4));
      const op = fade(u, 1.8); el('path', { d: `M${BX},${BY - 12} L${BX},${BY - 20} L${BX + 7 * BW - 6},${BY - 20} L${BX + 7 * BW - 6},${BY - 12}`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: op });
      tx(BX + 3.5 * BW, BY - 30, '헤더 7바이트', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: op });
      sub(480, 330, '헤더 7바이트 + 끝 1바이트 = frame마다 8바이트가 덧붙는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { mono(BX, 100, "struct.pack('>BHI', 1, 1, 32)", { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 0.1) });
      sub(BX + 1.5 * BW, BY + 72, 'type=1', fade(u, 0.6), { class: 'mono' }); sub(BX + 2 * BW + 24 - 24, BY + 94, 'channel=1', fade(u, 0.9), { class: 'mono' }); sub(BX + 5 * BW, BY + 72, 'size=0x20=32', fade(u, 1.4), { class: 'mono' });
      sub(480, 300, '정수는 모두 빅엔디안(큰 자리 먼저)', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      mono(480, 336, '7 + 32 + 1 = 40 바이트', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    if (k === 3) { const cur = Math.min(7, seg(u, 0.2, 1.2) * 7), x = BX + cur * BW; el('path', { d: `M${x - 9},${BY - 20} L${x + 9},${BY - 20} L${x},${BY - 6} Z`, fill: INK });
      if (u > 1.2) mono(BX + 5 * BW, BY - 30, 'size = 32', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      const g = E(u, 1.5, 2.3); if (g > 0) { el('rect', { x: PX - 4, y: BY - 4, width: (PW + 8) * g, height: 52, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 3 });
        brace(PX, PX + PW, BY + 52, 'buf[7 : 7+32]', WARN, fade(u, 2.0)); }
      sub(480, 330, '덜 왔으면 size만큼 모일 때까지 기다린다', fade(u, 2.3), { 'font-size': 15 }); return; }
    // k4: 끝 바이트 검사 — 정상 / 깨진 frame
    check(EX + 24, BY - 24, 12, pop(u, 0.3)); sub(EX + 24, BY + 72, '0xCE 확인', fade(u, 0.4), { fill: GOOD, 'font-weight': 700 });
    const y2 = 270, op = fade(u, 0.9);
    for (let i = 0; i < 7; i++) byte(BX + i * BW, y2, bytes[i], { col: GRID, op });
    card(PX + 70, y2 + 22, 140, 44, { rx: 6, text: '30 B만 옴', fs: 14.5, stroke: GRID, fill: SOFT, op });
    byte(PX + 148, y2, '7B', { col: BAD, fill: 'var(--badbg)', op: fade(u, 1.2) }); cross(PX + 172, y2 - 18, 11, pop(u, 1.5));
    tx(PX + 220, y2 + 20, 'FRAME_ERROR', { 'font-size': 16, 'font-weight': 800, fill: BAD, class: 'mono', opacity: fade(u, 1.7) });
    tx(PX + 220, y2 + 44, '브로커가 연결을 닫는다', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) }); }

  // ---------- 3. method 는 class.method ----------
  const MAP = [['connection', 'start tune open close', 1], ['channel', 'open flow close', 1], ['exchange', 'declare delete bind unbind', 1], ['queue', 'declare bind unbind purge delete', 1],
    ['basic', 'qos consume cancel get · publish deliver ack nack reject return', 2], ['tx', 'select commit rollback', 1], ['confirm', 'select', 1]];
  function s3(t, c) { const { k, u } = c;
    if (k === 4) { tx(480, 40, 'class 7개 × method', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      MAP.forEach(([cls, ms, kind], i) => { const y = 74 + i * 44, op = fade(u, 0.2 + i * 0.18);
        card(150, y + 14, 150, 34, { rx: 8, text: cls, fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.1 + i * 0.18) });
        if (kind === 2) { const [a, b] = ms.split(' · '); mono(244, y + 19, a, { 'font-size': 14.5, opacity: op }); mono(504, y + 19, b, { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: op }); }
        else mono(244, y + 19, ms, { 'font-size': 14.5, opacity: op }); });
      sub(480, 400, '주황: 응답(-ok) 없이 흐르는 메시지 method. 나머지 설정 method는 -ok를 기다린다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    lanes('client (pika)', 'broker');
    const rows = k === 0 ? [['exchange.declare', 1], ['exchange.declare-ok', -1], ['queue.declare', 1], ['queue.declare-ok', -1]]
      : k === 1 ? [['queue.bind', 1], ['queue.bind-ok', -1], ['basic.qos  prefetch=1', 1], ['basic.qos-ok', -1]]
      : k === 2 ? [['basic.publish  "hi"', 1]]
      : [['basic.consume', 1], ['basic.consume-ok', -1], ['basic.deliver', -1], ['basic.deliver', -1], ['basic.deliver', -1]];
    rows.forEach(([s, d], i) => call(110 + i * 56, s, d, E(u, 0.2 + i * 0.4, 0.6 + i * 0.4), { col: k === 3 && i >= 2 ? WARN : d < 0 ? INK : ACC }));
    if (k === 0) sub(480, 370, 'pika 함수 한 번 = method 요청 하나 + -ok 응답 하나', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 1) sub(480, 370, '선언·설정은 같은 인자로 다시 불러도 결과가 같다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 2) { const op = fade(u, 1.0); el('rect', { x: CL + 40, y: 150, width: SV - CL - 80, height: 50, rx: 10, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: op });
      tx(480, 181, '-ok 응답 없음 · 도착했는지 모른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: op });
      pill(480, 260, 'confirm.select를 켜면 basic.ack로 알려 준다', GOOD, pop(u, 1.8), { fs: 14 }); }
    if (k === 3) { sub(480, 390, 'consume-ok 뒤에는 브로커가 먼저 민다 (push)', fade(u, 2.2), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); } }

  // ---------- 4. 연결이 열리는 순서 ----------
  const HS = [ // [글, 방향, 처음 보이는 k, 메모]
    ['AMQP 0 0 9 1', 1, 1, 'protocol header 8B'], ['connection.start', -1, 2, 'PLAIN · AMQPLAIN …'], ['connection.start-ok', 1, 2, 'PLAIN guest/guest'],
    ['connection.tune', -1, 3, '2047 · 131072 · 60'], ['connection.tune-ok', 1, 3, '수락 또는 더 작게'], ['connection.open', 1, 4, 'vhost "/"'], ['connection.open-ok', -1, 4, '준비 완료']];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { tx(480, 50, 'ConnectionParameters — 협상에 실어 보낼 값', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      [['host · port', 'localhost : 5672'], ['virtual_host', '"/"'], ['credentials', 'PlainCredentials("guest", …)'], ['heartbeat', '60'], ['blocked_connection_timeout', '300']].forEach(([a, b], i) => {
        const y = 100 + i * 54, s = pop(u, 0.2 + i * 0.3); card(480, y, 600, 44, { rx: 8, stroke: i === 3 ? ACC : GRID, sw: 1.8, s });
        mono(200, y + 5, a, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); mono(760, y + 5, b, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.3) }); });
      sub(480, 395, '아직 소켓도 열지 않았다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 6) { tx(480, 52, '운영 기본값', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['heartbeat', '60초 · 끄지 않는다'], ['frame_max', '131072 그대로'], ['vhost', '환경·팀마다 나눈다'], ['TLS', '5671 · PLAIN은 TLS 위에서만']].forEach(([a, b], i) => {
        const x = 250 + (i % 2) * 460, y = 150 + Math.floor(i / 2) * 130, s = pop(u, 0.2 + i * 0.35);
        card(x, y, 400, 96, { rx: 12, stroke: ACC, sw: 2, s }); mono(x, y - 8, a, { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.35) });
        tx(x, y + 22, b, { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 0.3 + i * 0.35) }); }); return; }
    lanes('client', 'RabbitMQ', { bottom: 410 });
    if (k >= 1) { const op = k === 1 ? fade(u, 0.1) : 1; el('rect', { x: CL - 50, y: 80, width: SV - CL + 100, height: 16, rx: 8, fill: SOFT, opacity: op }); tx(480, 93, 'TCP 3-way handshake', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op }); }
    HS.forEach(([s, d, k0, note], i) => { if (k < k0) return; const y = 128 + i * 40, fresh = k === k0, j = HS.filter((h) => h[2] === k0).indexOf(HS[i]);
      const bad = k === 5 && (i === 2 || i === 5);
      call(y, s, d, fresh ? E(u, 0.3 + j * 0.7, 0.8 + j * 0.7) : 1, { col: bad ? BAD : k === 5 ? OFF : fresh ? (d > 0 ? ACC : INK) : MUT, note: k === 5 ? null : note });
      if (bad) { cross(SV - 30, y, 10, pop(u, i === 2 ? 0.3 : 0.9)); tx(SV + 14, y + 5, i === 2 ? '403 ACCESS_REFUSED' : '530 NOT_ALLOWED', { 'font-size': 14, 'font-weight': 800, fill: BAD, class: 'mono', opacity: fade(u, i === 2 ? 0.4 : 1.0) });
        tx(CL - 14, y + 5, i === 2 ? '계정' : 'vhost 권한', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, i === 2 ? 0.5 : 1.1) }); } });
    if (k === 1) { const hb = ['41', '4D', '51', '50', '00', '00', '09', '01'];
      hb.forEach((h, i) => byte(300 + i * 46, 210, h, { col: i < 4 ? ACC : INK, s: pop(u, 1.0 + i * 0.12) }));
      sub(480, 290, "'A' 'M' 'Q' 'P' 0 0 9 1", fade(u, 2.0), { class: 'mono', 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 316, '버전이 맞지 않으면 브로커가 지원 버전을 돌려주고 끊는다', fade(u, 2.3)); }
    if (k === 4) banner(480, 412 - 20, 'open-ok 뒤에야 channel.open을 할 수 있다', pop(u, 2.0));
    if (k === 5) sub(480, 412 - 18, 'StreamLostError는 연결이 열린 뒤 heartbeat가 끊긴 경우다', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); }

  // ---------- 5. publish 한 번에 흐르는 frame ----------
  function car(x, y, w, kind, size, o) { o = o || {}; const col = kind === 'METHOD' ? ACC : kind === 'HEADER' ? INFO : WARN;
    const g = card(x + w / 2, y, w, 50, { rx: 8, stroke: col, sw: 2.5, fill: o.fill || PANEL, s: o.s, op: o.op });
    tx(0, -4, kind, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col }, g); tx(0, 16, size, { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT }, g); }
  function detail(x, y, w, title, rows, col, op) { el('rect', { x, y, width: w, height: 28 + rows.length * 22, rx: 8, fill: SOFT, stroke: col, 'stroke-width': 1.5, opacity: op });
    tx(x + 12, y + 20, title, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: op });
    rows.forEach((r, i) => mono(x + 12, y + 42 + i * 22, r, { 'font-size': 14, opacity: op })); }
  function s5(t, c) { const { k, u } = c, TY = 300;
    el('line', { x1: 30, y1: TY + 30, x2: 930, y2: TY + 30, stroke: GRID, 'stroke-width': 3 }); sub(900, TY + 52, 'TCP · channel 1', 1, { 'text-anchor': 'end' });
    sub(60, TY + 52, '→ 브로커 쪽', 1, { 'text-anchor': 'start' });
    if (k === 4) { // 큰 본문
      car(40, TY, 120, 'METHOD', '36 B'); car(170, TY, 130, 'HEADER', 'body_size 300000');
      [['131064 B', 0], ['131064 B', 1], ['37872 B', 2]].forEach(([s, i]) => car(310 + i * 205, TY, i === 2 ? 130 : 195, 'BODY', s, { s: pop(u, 0.4 + i * 0.4) }));
      detail(250, 70, 460, 'frame_max = 131072 (협상값)', ['BODY 한 개에 실리는 최대 = 131072 − 8 = 131064', '300000 = 131064 + 131064 + 37872'], WARN, fade(u, 1.6));
      return; }
    const n = k === 0 ? 1 : k === 1 ? 2 : 3, vis = (i) => (i < n - 1 || k > 2 ? 1 : k === n - 1 ? pop(u, 0.2) : 1);
    car(40, TY, 160, 'METHOD', '36 B', { s: vis(0) });
    if (n >= 2) car(212, TY, 230, 'HEADER', '80 B', { s: vis(1) });
    if (n >= 3) car(454, TY, 180, 'BODY', '62 B (본문 54)', { s: vis(2) });
    if (k === 0) detail(40, 70, 380, 'basic.publish (method frame)', ['exchange    = "orders.ex"', 'routing_key = "orders.new"'], ACC, fade(u, 0.8));
    if (k === 1) detail(212, 70, 420, 'content header frame', ['body_size    = 54', 'content_type = "application/json"', 'delivery_mode = 2  (persistent)', 'headers = {"trace_id": "t-xyz"}'], INFO, fade(u, 0.8));
    if (k === 2) { detail(454, 70, 460, 'content body frame', ['{"id": 1042, "amount": 59000,', ' "items": ["A-1", "B-7"]}  = 54 B'], WARN, fade(u, 0.8));
      mono(40, 260, '36 + 80 + 62 = 178 바이트', { 'font-size': 16, 'font-weight': 800, fill: INK, opacity: fade(u, 1.8) }); }
    if (k === 3) { detail(40, 60, 420, 'basic.publish 플래그', ['mandatory = False', 'immediate = False'], ACC, fade(u, 0.3));
      const op = fade(u, 1.0); card(700, 110, 380, 66, { rx: 10, stroke: BAD, sw: 2, op }); tx(700, 104, 'mandatory=False · 맞는 큐 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: op });
      tx(700, 128, '조용히 버려진다', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, opacity: op });
      const op2 = fade(u, 1.8); card(700, 210, 380, 66, { rx: 10, stroke: GOOD, sw: 2, op: op2 }); tx(700, 204, 'mandatory=True · 맞는 큐 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: op2 });
      mono(700, 228, 'basic.return 으로 돌아온다', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, opacity: op2 }); return; }
    if (k === 5) { // method + header 로 라우팅 결정
      const g = E(u, 0.2, 0.9); el('rect', { x: 34, y: TY - 32, width: (420) * g, height: 64, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '7 5' });
      tx(240, TY - 44, '라우팅은 여기까지만 읽고 정한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
      card(800, 150, 190, 52, { rx: 10, text: 'orders.q', fs: 15, mono: true, stroke: INK, s: pop(u, 1.3) }); grow(440, 250, 700, 160, E(u, 1.3, 1.9), ACC);
      sub(800, 200, '본문이 오기 전에 큐가 정해진다', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); } }

  const quiz = [
    { q: 'RabbitMQ가 기본으로 쓰는 프로토콜과 포트의 짝으로 맞는 것은 무엇인가?',
      o: ['AMQP 1.0, 5671 평문', 'AMQP 0-9-1, 5672 평문과 5671 TLS', 'HTTP, 15672'], a: 1,
      why: 'RabbitMQ의 기본 클라이언트 프로토콜은 AMQP 0-9-1이고 TCP 5672(평문)와 5671(TLS)을 쓴다. AMQP 1.0은 이름만 같은 다른 스펙이다.' },
    { q: 'payload가 32바이트인 method frame은 전선 위에서 모두 몇 바이트인가?',
      o: ['32바이트', '39바이트', '40바이트'], a: 2,
      why: '헤더 7바이트(type 1 + channel 2 + size 4)와 끝 마커 0xCE 1바이트가 붙어 7 + 32 + 1 = 40바이트다.' },
    { q: 'basic.publish를 보낸 뒤 브로커가 돌려주는 응답은 무엇인가?',
      o: ['basic.publish-ok', '아무 응답도 없다', 'queue.declare-ok'], a: 1,
      why: 'publish에는 -ok가 없다. 도착 여부를 알고 싶으면 confirm.select로 publisher confirm을 켜서 basic.ack를 받아야 한다.' },
    { q: 'connection.open에서 530 NOT_ALLOWED로 끊겼다. 무엇이 문제인가?',
      o: ['사용자 이름이나 비밀번호', 'protocol header의 버전', '그 사용자의 vhost 권한'], a: 2,
      why: '계정이 틀리면 start-ok 단계에서 403 ACCESS_REFUSED가 난다. open 단계의 530은 vhost가 없거나 권한이 없을 때다.' },
    { q: '본문 300000바이트를 frame_max 131072로 보내면 BODY frame은 몇 개인가?',
      o: ['3개', '2개', '1개'], a: 0,
      why: 'BODY 하나에 131072 − 8 = 131064바이트까지 실린다. 131064 + 131064 + 37872로 세 개가 된다.' },
  ];

  const summary = [
    'RabbitMQ는 TCP 5672 위에서 AMQP 0-9-1 frame을 주고받는다.',
    'frame은 7바이트 헤더와 payload, 끝 마커 0xCE로 되어 있고 끝이 틀리면 연결이 닫힌다.',
    '선언과 설정 method는 -ok를 기다리지만 publish와 deliver는 응답 없이 흐른다.',
    'publish 한 번은 method 36B, header 80B, body 62B처럼 frame 세 개로 나뉘어 간다.',
  ];
  const review = [
    { q: '새 서비스가 브로커에 붙자마자 ProbableAuthenticationError(403)로 끊긴다. 먼저 볼 것은?',
      o: ['vhost 권한 설정', '사용자 이름과 비밀번호', 'frame_max 값'], a: 1,
      why: '403은 handshake의 start-ok 단계, 즉 인증에서 거절됐다는 뜻이다. vhost 권한 문제는 open 단계에서 530으로 나온다.' },
    { q: 'mandatory=False로 publish했는데 메시지가 어디에도 없고 오류도 없다. 가장 그럴듯한 이유는?',
      o: ['body frame이 frame_max를 넘어 잘렸다', 'basic.publish의 -ok가 늦게 왔다', '맞는 binding이 없어 브로커가 조용히 버렸다'], a: 2,
      why: 'publish에는 응답이 없고 mandatory=False면 라우팅 실패도 알려 주지 않는다. mandatory=True면 basic.return으로 돌아온다.' },
    { q: 'headers exchange는 routing key 대신 메시지 헤더로 큐를 고른다. 브로커가 이 판단에 읽어야 하는 frame은?',
      o: ['method frame과 content header frame', 'body frame 전부', 'heartbeat frame'], a: 0,
      why: 'exchange 이름과 routing key는 method frame에, headers 같은 속성은 header frame에 있다. 그래서 본문을 다 받기 전에 라우팅을 정할 수 있다.' },
  ];

  R.page({ title: 'AMQP 0-9-1 바이트 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
