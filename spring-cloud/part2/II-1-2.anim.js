/* II-1-2 Spring Cloud Bus + refresh — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 주인공: order-service 인스턴스 6개(옛 설정/새 설정), curl 호출 줄, 브로커(springCloudBus) fan-out, @RefreshScope 프록시와 안쪽 객체, webhook → /monitor.
 * 숫자는 STEPS 의 instances·refreshed·calls 와 코드에 적힌 값(3000 → 5000, IP, 6+4+3)만 쓴다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, lock, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  // 인스턴스 6칸 (3 × 2)
  const GX = [610, 730, 850], GY = [150, 250];
  const pos = (i) => ({ x: GX[i % 3], y: GY[Math.floor(i / 3)] });
  function box(i, state, o) { o = o || {}; const p = o.p || pos(i), nw = state === 'new', st = nw ? { stroke: GOOD, fill: GOODBG } : state === 'warn' ? { stroke: WARN, fill: WARNBG } : state === 'off' ? { stroke: GRID, fill: PANEL } : { stroke: BAD, fill: BADBG };
    const g = card(p.x, p.y, o.w || 104, o.h || 64, { rx: 9, stroke: st.stroke, fill: st.fill, sw: 2.2, s: o.s, op: o.op, dash: o.dash });
    tx(0, -8, o.name || `order-${i + 1}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: state === 'off' ? MUT : INK }, g);
    mono(0, 16, o.val != null ? o.val : nw ? '새 설정' : state === 'off' ? '무시' : '옛 설정', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: st.stroke }, g); return g; }
  function counters(c, x, y) { const b = c.beat, p = c.prev || {};
    mono(x, y, `호출 ${Math.round(tween(p.calls, b.calls, c.u))}번`, { 'font-size': 17, 'font-weight': 800, fill: b.mode === 'bus' ? ACC : BAD });
    mono(x + 150, y, `갱신 ${Math.round(tween(p.refreshed, b.refreshed, c.u))} / ${b.instances}`, { 'font-size': 17, 'font-weight': 800, fill: b.refreshed === b.instances ? GOOD : INK }); }
  const IPS = ['10.0.1.11', '10.0.1.12', '10.0.1.13', '10.0.1.14', '10.0.1.15', '10.0.1.16'];
  const OP = { x: 80, y: 190 };

  // ---------- 1. refresh 를 인스턴스마다 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k === 6) { const rows = [['order', 6], ['user', 4], ['catalog', 3]];
      rows.forEach(([n, m], r) => { tx(60, 110 + r * 90, n + '-service', { 'font-size': 15, 'font-weight': 700 });
        for (let i = 0; i < m; i++) { const idx = rows.slice(0, r).reduce((a, x) => a + x[1], 0) + i; box(i, 'old', { p: { x: 250 + i * 92, y: 104 + r * 90 }, w: 80, h: 56, name: `${n[0]}-${i + 1}`, s: pop(u, 0.1 + idx * 0.08) }); } });
      mono(860, 200, '6 + 4 + 3', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      mono(860, 232, '= 13번', { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      banner(480, 385, '필요한 것: 트리거 1번 = 전체 전파', pop(u, 2.2)); return; }
    person(OP.x, OP.y, '운영자', {});
    const state = (i) => { if (k === 0 || k === 3) return 'old'; if (k === 1) return i === 0 && u > 1.1 ? 'new' : 'old';
      if (k === 2) return u > 0.4 + i * 0.32 + 0.3 ? 'new' : i === 0 ? 'new' : 'old';
      if (k === 4) return i === 5 ? 'warn' : 'new'; if (k === 5) return i < 3 ? 'new' : 'old'; return 'old'; };
    for (let i = 0; i < 6; i++) box(i, state(i), { s: k === 0 ? pop(u, 0.2 + i * 0.12) : k === 4 && i === 5 ? pop(u, 0.4) : 1, val: k === 4 && i === 5 ? '신규·옛 설정' : undefined, dash: k === 4 && i === 5 ? '5 4' : null });
    if (k === 0) { card(260, 190, 160, 190, { rx: 8, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 1.0) });
      IPS.forEach((ip, i) => mono(196, 122 + i * 27, ip, { 'font-size': 14, opacity: fade(u, 1.2 + i * 0.12) }));
      sub(260, 310, '알아야 할 IP 6개', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1 || k === 2) { const n = k === 1 ? 1 : 6, lines = IPS.slice(0, n).map((ip) => `$ curl -X POST ${ip}:8082/…/refresh`);
      if (k === 1) lines.push(['["order.timeout"]', '#86efac']);
      terminal(20, 270, 440, 140, lines, k === 1 ? 0.3 + E(u, 0.2, 1.8) * lines.length : 1 + E(u, 0.1, 2.2) * 5, { title: 'bash', fs: 13.5, lh: 20 });
      for (let i = 0; i < n; i++) { const a = k === 1 ? 0.4 : 0.4 + i * 0.32, p = pos(i); if (k === 2 && i === 0) continue; dot([[OP.x + 30, OP.y], [p.x - 54, p.y]], seg(u, a, a + 0.3), INK, 6); }
      counters(c, 200, 70); return; }
    if (k === 3) { el('rect', { x: 400, y: 70, width: 26, height: 260, rx: 4, fill: OFF, opacity: E(u, 0.2, 0.6) });
      tx(413, 356, '로드밸런서', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      for (let i = 0; i < 3; i++) { const a = 0.6 + i * 0.4; dot([[OP.x + 30, OP.y], [395, 150 + i * 50]], seg(u, a, a + 0.3), INK, 6); cross(380, 150 + i * 50, 9, pop(u, a + 0.3)); }
      note(140, 380, '개별 인스턴스를 지목할 수 없다', fade(u, 1.9), { fill: BAD }); counters(c, 200, 50); return; }
    if (k === 4) { mono(GX[2], 310, 'curl 도는 사이 뜸', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); counters(c, 200, 70); return; }
    // k5: 부분 실패
    clock(pos(3).x - 70, pos(3).y - 40, 16, E(u, 0.3, 1.4), BAD); mono(pos(3).x - 70, pos(3).y + 1, 'timeout', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    banner(730, 340, '3개 새 설정 · 3개 옛 설정 = 드리프트', pop(u, 1.8)); counters(c, 200, 70); }

  // ---------- 2. Bus 도입 ----------
  const BK = { x: 380, y: 200 };
  function broker(s, label) { card(BK.x, BK.y, 150, 76, { rx: 12, fill: INK, stroke: 'none', s });
    tx(BK.x, BK.y - 6, label || 'RabbitMQ', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: s > 0.5 ? 1 : 0 });
    mono(BK.x, BK.y + 18, 'springCloudBus', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'middle', opacity: s > 0.5 ? 1 : 0 }); }
  // 브로커 → 기둥(x=540) → 위·아래 레일 → 각 인스턴스
  const TR = 540, RAIL = [100, 300];
  const route = (i) => { const p = pos(i), r = RAIL[Math.floor(i / 3)], top = i < 3; return [[BK.x + 76, BK.y], [TR, BK.y], [TR, r], [p.x, r], [p.x, p.y + (top ? -32 : 32)]]; };
  function bindings(u0, op) { if (u0 <= 0) return; const o = { opacity: (op ?? 0.7) * clamp(u0 * 1.5), stroke: ACC, 'stroke-width': 2, fill: 'none' };
    el('line', Object.assign({ x1: BK.x + 76, y1: BK.y, x2: TR, y2: BK.y }, o)); el('line', Object.assign({ x1: TR, y1: RAIL[0], x2: TR, y2: RAIL[1] }, o));
    RAIL.forEach((r) => el('line', Object.assign({ x1: TR, y1: r, x2: TR + (GX[2] - TR) * clamp(u0), y2: r }, o)));
    for (let i = 0; i < 6; i++) { const p = pos(i), r = RAIL[Math.floor(i / 3)], ok = (p.x - TR) / (GX[2] - TR) <= u0 + 0.01; if (ok) el('line', Object.assign({ x1: p.x, y1: r, x2: p.x, y2: p.y + (i < 3 ? -32 : 32) }, o)); } }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    const state = (i) => (k === 4 ? (u > 1.5 + i * 0.08 ? 'new' : 'old') : k === 5 ? 'new' : 'old');
    if (k === 5) { tx(240, 70, 'POST /actuator/refresh', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono' });
      tx(720, 70, 'POST /actuator/busrefresh', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', fill: ACC });
      for (let i = 0; i < 6; i++) { const x = (i % 3) * 110, y = Math.floor(i / 3) * 90;
        box(i, i === 0 ? 'new' : 'old', { p: { x: 130 + x, y: 150 + y }, w: 96, s: pop(u, 0.2 + i * 0.05) });
        box(i, 'new', { p: { x: 610 + x, y: 150 + y }, w: 96, s: pop(u, 0.8 + i * 0.08) }); }
      mono(240, 350, '이 인스턴스만', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.4) });
      mono(720, 350, 'Bus를 타고 전원', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) }); return; }
    for (let i = 0; i < 6; i++) box(i, state(i), { dash: k === 0 ? '5 4' : null });
    if (k === 0) { [['spring.cloud.bus.enabled', 0.3], ['bus.trace.enabled', 0.9]].forEach(([n, a], i) => { const y = 140 + i * 70, on = u > a + 0.4;
        mono(40, y + 5, n, { 'font-size': 15, 'font-weight': 700 }); card(380, y, 64, 32, { rx: 16, fill: on ? ACC : OFF, stroke: 'none' });
        el('circle', { cx: lerp(364, 396, E(u, a, a + 0.4)), cy: y, r: 12, fill: PANEL }); });
      sub(240, 320, '브로커 좌표가 없어 아직 서로 모른다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    broker(k === 1 ? pop(u, 0.2) : 1);
    bindings(k === 1 ? E(u, 0.7, 1.6) : 1);
    if (k === 1) { pill(BK.x, BK.y - 72, 'rabbitmq:5672', ACC, pop(u, 0.4), { mono: true, fs: 14, fill: PANEL });
      pill(BK.x, BK.y + 92, 'import: configserver:8888', INFO, pop(u, 1.4), { mono: true, fs: 13.5, fill: PANEL });
      sub(BK.x, 360, '부팅하면 6개가 모두 같은 익스체인지에 묶인다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 2) { ['busrefresh', 'busenv'].forEach((e, i) => { const y = 320 + i * 40, open = u > 0.5 + i * 0.5;
        lock(80, y, !open, open ? ACC : MUT, 1); mono(104, y + 6, '/actuator/' + e, { 'font-size': 15, 'font-weight': 700, fill: open ? ACC : MUT }); });
      sub(BK.x + 20, 82, 'exposure에 넣어야 열린다', fade(u, 1.5), { 'font-size': 14.5 }); return; }
    if (k === 3) { const kafka = u > 1.4; card(BK.x, 330, 300, 40, { rx: 8, stroke: kafka ? INFO : ACC, sw: 2.5, fill: PANEL, text: kafka ? 'spring-cloud-starter-bus-kafka' : 'spring-cloud-starter-bus-amqp', fs: 13.5, mono: true, color: kafka ? INFO : ACC, s: 1 + 0.06 * Math.sin(seg(u, 1.2, 1.6) * Math.PI) });
      sub(BK.x, 380, '브로커는 starter로 고르고, 앱 코드는 그대로', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // k4: 전파 5단계
    person(70, 200, null, {}); pill(150, 120, 'POST /busrefresh', ACC, pop(u, 0.1), { mono: true, fs: 13.5, fill: PANEL });
    dot([[100, 200], [pos(2).x - 52, 120], [pos(2).x - 52, pos(2).y]], seg(u, 0.2, 0.7), INK, 6);
    fly(pos(2).x - 40, pos(2).y + 20, BK.x, BK.y, seg(u, 0.7, 1.1), 'RefreshRemoteApplicationEvent', { mono: true });
    for (let i = 0; i < 6; i++) dot(route(i), seg(u, 1.1, 1.5 + i * 0.08), ACC, 6);
    counters(c, 520, 370); }

  // ---------- 3. Git 변경 → 이벤트 전파 ----------
  const CS3 = { x: 120, y: 120 };
  function s3(t, c) { const { k, u } = c;
    const vOf = (i) => (k === 0 || k === 1 ? '3000' : k === 2 ? (u > 1.2 + i * 0.12 ? '5000' : '3000') : '5000');
    server(CS3.x, CS3.y, 'Config Server', { lamp: ACC });
    mono(CS3.x, CS3.y + 92, k === 0 ? (u > 1.2 ? 'order.timeout = 5000' : 'order.timeout = 3000') : 'order.timeout = 5000', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
    if (k === 3) { for (let i = 0; i < 6; i++) box(i, 'new', { val: '5000', p: { x: 470 + (i % 3) * 112, y: 110 + Math.floor(i / 3) * 80 }, w: 100, h: 60 });
      for (let i = 0; i < 4; i++) box(i, 'off', { name: `user-${i + 1}`, p: { x: 470 + i * 112, y: 320 }, w: 100, h: 60 });
      pill(300, 300, 'busrefresh/order-service:**', ACC, pop(u, 0.2), { mono: true, fs: 13.5, fill: PANEL });
      tx(900, 100, 'order-service', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.9) });
      tx(470 - 50, 372, 'user-service는 그대로', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) });
      for (let i = 0; i < 6; i++) dot([[300, 280], [470 + (i % 3) * 112, 110 + Math.floor(i / 3) * 80]], seg(u, 0.6 + i * 0.06, 1.2 + i * 0.06), ACC, 5);
      return; }
    if (k === 5) { const L = ['{', '  "type": "RefreshRemoteApplicationEvent",', '  "originService": "order-service:1",', '  "destinationService": "order-service:**"', '}'];
      card(560, 220, 540, 200, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5 });
      L.forEach((s, i) => mono(310, 150 + i * 30, s.slice(0, Math.round(s.length * E(u, 0.2 + i * 0.3, 0.6 + i * 0.3))), { 'font-size': 15, fill: i === 2 ? INFO : i === 3 ? ACC : INK, 'font-weight': i >= 2 ? 700 : 400 }));
      sub(560, 360, '보낸 곳과 받을 곳이 이벤트 안에 들어 있다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    for (let i = 0; i < 6; i++) box(i, vOf(i) === '5000' ? 'new' : 'old', { val: vOf(i) });
    if (k === 0) { tx(40, 300, 'order-service.yml', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: MUT });
      mono(40, 330, `order.timeout: ${u > 1.0 ? '5000' : '3000'}`, { 'font-size': 16, 'font-weight': 800, fill: u > 1.0 ? ACC : INK });
      el('circle', { cx: 290, cy: 324, r: 9, fill: ACC, opacity: fade(u, 0.9) }); mono(305, 330, 'git push', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.0) });
      sub(730, 330, '떠 있는 인스턴스는 부팅 때 읽은 3000을 쥐고 있다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 1) { person(250, 330, null, {}); dot([[280, 330], [pos(3).x - 52, pos(3).y]], seg(u, 0.2, 0.8), INK, 6);
      fly(pos(3).x - 52, pos(3).y + 30, 420, 300, seg(u, 0.9, 1.5), '204 No Content', { mono: true, fill: INFO, stay: true });
      sub(730, 340, '응답은 바로 온다. 값은 아직 3000', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { card(380, 330, 130, 50, { rx: 10, fill: INK, stroke: 'none', text: 'Bus', fs: 15, color: PANEL });
      for (let i = 0; i < 6; i++) { const p = pos(i), a = 0.2 + i * 0.08; dot([[440, 330], [p.x, p.y + 32]], seg(u, a, a + 0.4), ACC, 5);
        dot([[p.x - 52, p.y], [CS3.x + 56, CS3.y]], seg(u, a + 0.45, a + 0.8), INFO, 5); }
      counters(c, 40, 400); return; }
    // k4: env 확인
    for (let i = 0; i < 6; i++) check(pos(i).x + 40, pos(i).y - 22, 9, pop(u, 0.3 + i * 0.15));
    mono(40, 330, 'GET /actuator/env/order.timeout', { 'font-size': 14.5, fill: MUT });
    mono(40, 360, '→ { "value": "5000" }', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) });
    sub(730, 340, '전파는 비동기다. 인스턴스마다 찍어 본다', fade(u, 1.6), { 'font-size': 14.5 }); }

  // ---------- 4. @RefreshScope 프록시 ----------
  const PX = { x: 560, y: 200 };
  function proxyBox(op) { el('rect', { x: PX.x - 150, y: PX.y - 92, width: 300, height: 184, rx: 16, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '8 6', opacity: op });
    tx(PX.x - 136, PX.y - 66, '프록시 (주입되는 것)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: op }); }
  function target(val, o) { o = o || {}; const g = card(PX.x, PX.y + 14, 230, 92, { rx: 10, stroke: o.col || INK, sw: 2.2, s: o.s, op: o.op, fill: o.fill });
    tx(0, -14, 'OrderProperties', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }, g);
    mono(0, 16, 'timeout = ' + val, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: o.vcol || INK }, g); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { target('3000', { col: INK });
      ['@RefreshScope', '@ConfigurationProperties'].forEach((s, i) => fly(PX.x - 100 + i * 200, 30, PX.x - 90 + i * 180, 100, seg(u, 0.3 + i * 0.4, 1.0 + i * 0.4), s, { mono: true, stay: true }));
      sub(PX.x, 310, '여섯 인스턴스 모두 아직 옛 값 3000', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    proxyBox(k === 1 ? E(u, 0.2, 0.9) : 1);
    if (k === 4) { // dispose → 다음 호출 때 재생성
      target('3000', { op: 1 - E(u, 0.4, 0.9), s: 1 - 0.4 * E(u, 0.4, 0.9), col: OFF });
      pill(PX.x, 40, 'busrefresh 도착 → 안쪽 객체 폐기', BAD, pop(u, 0.2), { fs: 14, fill: PANEL });
      card(160, 200, 180, 60, { rx: 10, text: 'OrderService', fs: 15 });
      fly(250, 200, PX.x - 150, PX.y, seg(u, 1.1, 1.6), 'placeOrder()', { mono: true, fill: INFO });
      if (u > 1.6) target('5000', { s: pop(u, 1.6), col: GOOD, vcol: GOOD, fill: GOODBG });
      el('line', { x1: 160, y1: 360, x2: 800, y2: 360, stroke: GRID, 'stroke-width': 2 });
      el('circle', { cx: 300, cy: 360, r: 7, fill: BAD, opacity: fade(u, 0.3) }); tx(300, 390, 'refresh 순간', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.3) });
      el('circle', { cx: 620, cy: 360, r: 7, fill: GOOD, opacity: fade(u, 1.6) }); tx(620, 390, '다음 호출 순간 = 재생성', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.6) });
      return; }
    if (k === 5) { target('5000', { col: GOOD, vcol: GOOD, fill: GOODBG });
      const bar = (y, name, w0, f, col, lab) => { tx(60, y + 5, name, { 'font-size': 14, 'font-weight': 700 }); el('rect', { x: 160, y: y - 10, width: 200, height: 20, rx: 4, fill: SOFT });
        el('rect', { x: 160, y: y - 10, width: 200 * clamp(w0 + (1 - w0) * f), height: 20, rx: 4, fill: col }); mono(370, y + 5, lab, { 'font-size': 14, 'font-weight': 700, fill: col }); };
      bar(330, '진행 중 요청', 0.4, E(u, 0.2, 1.6), MUT, '옛 객체 3000으로 끝');
      bar(372, '새 요청', 0, E(u, 1.0, 2.2), GOOD, '새 객체 5000');
      note(PX.x + 170, 90, '재시작 없음', fade(u, 2.2), { fill: GOOD }); return; }
    target('3000', { s: k === 1 ? pop(u, 0.6) : 1 });
    if (k === 1) { tx(PX.x, PX.y + 76, '실제 객체', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      sub(PX.x, 340, '프록시가 있어야 안쪽 객체만 갈아끼울 수 있다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 2) { fly(140, 90, PX.x, PX.y + 30, seg(u, 0.2, 1.0), 'order.timeout=3000', { mono: true });
      mono(PX.x + 170, PX.y - 10, 'getTimeout()', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 1.2) });
      mono(PX.x + 170, PX.y + 20, 'setTimeout()', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 1.5) });
      sub(PX.x, 340, 'setter가 있어야 다시 바인딩할 수 있다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // k3: OrderService 는 프록시를 쥔다
    card(160, 200, 180, 70, { rx: 10, text: 'OrderService\nprops', fs: 15, s: pop(u, 0.2) });
    grow(252, 200, PX.x - 154, PX.y - 40, E(u, 0.6, 1.2), ACC, { sw: 3 });
    tx(160, 290, '쥔 것은 프록시 참조', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    sub(480, 360, '값을 필드에 복사해 두는 빈만 따로 @RefreshScope가 필요하다', fade(u, 1.8), { 'font-size': 14.5 }); }

  // ---------- 5. webhook → /monitor ----------
  const MS = { x: 470, y: 200 };
  function s5(t, c) { const { k, u } = c;
    if (k === 5) { const P = [[70, 200, 'git push'], [220, 200, 'GitHub'], [380, 200, 'POST /monitor'], [560, 200, 'order-service.yml'], [560, 280, 'order-service:**']];
      el('circle', { cx: 70, cy: 200, r: 12, fill: ACC, opacity: fade(u, 0.1) }); tx(70, 236, 'git push', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
      card(220, 200, 110, 48, { rx: 8, text: 'GitHub', fs: 15, s: pop(u, 0.2) }); grow(84, 200, 163, 200, E(u, 0.2, 0.5), MUT);
      server(400, 200, 'Config Server', { lamp: ACC, s: 0.8 }); grow(277, 200, 352, 200, E(u, 0.5, 0.8), INFO);
      pill(400, 120, '/monitor', INFO, pop(u, 0.6), { mono: true, fs: 14, fill: PANEL });
      fly(450, 200, 620, 110, seg(u, 0.9, 1.3), 'order-service.yml', { mono: true, stay: true, fill: INFO });
      mono(620, 150, '→ order-service:**', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      card(620, 230, 110, 40, { rx: 8, fill: INK, stroke: 'none', text: 'Bus', fs: 15, color: PANEL, s: pop(u, 1.4) });
      for (let i = 0; i < 6; i++) { const y = 70 + i * 52, on = u > 1.9 + i * 0.05; dot([[676, 230], [790, y]], seg(u, 1.5, 1.9 + i * 0.05), ACC, 5);
        box(i, on ? 'new' : 'old', { p: { x: 860, y }, w: 120, h: 44 }); }
      banner(380, 380, '커밋만으로 전 인스턴스 반영 · 사람 개입 0', pop(u, 2.3)); return; }
    server(MS.x, MS.y, 'Config Server', { lamp: ACC });
    if (k === 0) { ['spring-cloud-config-monitor', 'starter-bus-amqp'].forEach((s, i) => fly(MS.x, 30 + i * 0, MS.x - 10 + (i ? 120 : -120), 90 + i * 0, seg(u, 0.3 + i * 0.5, 1.0 + i * 0.5), s, { mono: true, stay: true }));
      person(110, 300, '아직 curl은 사람이', { s: pop(u, 1.4) }); return; }
    // 레포 (k1~)
    tx(60, 70, 'config-repo', { 'font-size': 15, 'font-weight': 700 });
    for (let i = 0; i < 4; i++) el('circle', { cx: 80 + i * 50, cy: 100, r: 7, fill: PANEL, stroke: INK, 'stroke-width': 3 });
    el('line', { x1: 87, y1: 100, x2: 223, y2: 100, stroke: INK, 'stroke-width': 3 });
    grow(240, 110, MS.x - 62, MS.y - 20, k === 1 ? E(u, 0.4, 1.2) : 1, MUT, { dash: k === 1 ? null : '4 4' });
    if (k === 1) { mono(60, 150, 'git.uri: …/acme/config-repo', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      sub(MS.x, 330, '서빙은 하지만, 커밋이 들어온 줄은 모른다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 2) { const key = (x, y, s) => { const g = R.G(x, y, s); el('circle', { cx: -10, cy: 0, r: 9, fill: 'none', stroke: WARN, 'stroke-width': 3 }, g); el('line', { x1: -1, y1: 0, x2: 20, y2: 0, stroke: WARN, 'stroke-width': 3 }, g); el('line', { x1: 14, y1: 0, x2: 14, y2: 8, stroke: WARN, 'stroke-width': 3 }, g); };
      card(150, 300, 140, 48, { rx: 8, text: 'GitHub', fs: 15 }); key(150, 250, pop(u, 0.3)); key(MS.x + 90, MS.y - 60, pop(u, 0.6));
      mono(MS.x + 70, 300, 'webhook-secret', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.9) });
      sub(MS.x + 120, 340, '같은 비밀값을 양쪽에. 없으면 거절', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    if (k === 3) { card(MS.x + 270, 130, 190, 46, { rx: 8, stroke: GRID, text: '/actuator/busrefresh', fs: 13.5, mono: true, color: MUT });
      card(MS.x + 270, 260, 190, 46, { rx: 8, stroke: INFO, sw: 2.5, text: '/monitor', fs: 15, mono: true, color: INFO, s: pop(u, 0.3) });
      card(150, 260, 140, 48, { rx: 8, text: 'GitHub', fs: 15 });
      dot([[220, 260], [MS.x + 175, 260]], seg(u, 0.8, 1.5), INFO, 7);
      mono(MS.x + 270, 320, '/actuator/monitor 아님', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      return; }
    // k4: webhook 등록
    card(220, 290, 340, 130, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 0.2) });
    [['Payload URL', ':8888/monitor'], ['Content type', 'application/json'], ['Events', 'push']].forEach(([a, v], i) => { const y = 256 + i * 32, op = fade(u, 0.5 + i * 0.3);
      tx(70, y + 5, a, { 'font-size': 14, fill: MUT, opacity: op }); mono(190, y + 5, v, { 'font-size': 14, 'font-weight': 700, opacity: op }); });
    grow(390, 280, MS.x - 62, MS.y + 20, E(u, 1.3, 1.9), INFO);
    person(820, 300, '수동 curl', { op: 1 - 0.6 * E(u, 1.6, 2.2) }); cross(820, 290, 16, pop(u, 2.0)); }

  const quiz = [
    { q: 'order-service 6대에 /actuator/refresh를 쓰면 생기는 일로 맞는 것은 무엇인가?',
      o: ['한 번 호출하면 6대가 모두 갱신된다', '호출한 인스턴스 하나만 갱신돼 6번을 따로 불러야 한다', 'Config Server가 알아서 6대에 알려 준다'], a: 1,
      why: 'refresh는 그 인스턴스만 다시 읽는다. 6대면 IP 6개로 6번 호출해야 하고, 그 사이 실패나 신규 기동이 드리프트를 만든다.' },
    { q: 'Spring Cloud Bus를 붙이고 아무 인스턴스 하나에 POST /actuator/busrefresh를 보내면 무엇이 일어나는가?',
      o: ['그 인스턴스만 갱신된다', '이벤트 1건이 브로커로 나가 구독 중인 인스턴스 전부가 refresh를 돈다', 'Config Server가 재시작된다'], a: 1,
      why: '인스턴스들이 springCloudBus에 묶여 있어 이벤트 1건을 브로커가 6대에 나눠 준다. 호출 1번으로 6개가 바뀐다.' },
    { q: 'busrefresh/order-service:**로 보내면 user-service 인스턴스는 어떻게 되는가?',
      o: ['함께 갱신된다', '이벤트를 받지만 대상이 아니라 무시한다', '에러를 낸다'], a: 1,
      why: '서비스 ID를 콜론으로 끊어 맞춰 보고, 자기 ID가 패턴에 맞을 때만 처리한다. order-service:**는 order 인스턴스 전부다.' },
    { q: 'busrefresh가 도착한 직후 @RefreshScope 빈 OrderProperties는 언제 새 값 5000으로 만들어지는가?',
      o: ['이벤트를 받는 즉시', '다음에 그 빈의 메서드가 불릴 때', '서비스를 재시작할 때'], a: 1,
      why: '프록시 안의 객체만 폐기해 두고, 다음 접근 때 새로 만든다. 진행 중이던 요청은 옛 객체로 끝까지 처리된다.' },
    { q: 'GitHub webhook의 Payload URL로 알맞은 주소는 무엇인가?',
      o: ['http://config-server:8888/actuator/monitor', 'http://config-server:8888/monitor', 'http://order-service:8082/actuator/busrefresh'], a: 1,
      why: '/monitor는 config-monitor 라이브러리와 Bus가 있을 때 Config Server에 열리는 일반 엔드포인트다. actuator 경로가 아니다.' },
  ];

  const summary = [
    '/actuator/refresh는 그 인스턴스 하나만 바꿔서, 6대면 6번 불러야 하고 실패하면 설정이 갈린다.',
    'Bus를 붙이면 인스턴스들이 springCloudBus에 묶이고 busrefresh 1번이 이벤트 1건으로 전원에 퍼진다.',
    '@RefreshScope 빈은 프록시 안의 객체만 버렸다가 다음 호출 때 새 값으로 다시 만든다.',
    'Config Server에 monitor를 넣고 webhook을 /monitor로 걸면 git push만으로 갱신이 퍼진다.',
  ];
  const review = [
    { q: 'busrefresh가 204를 돌려줬는데 인스턴스 하나가 아직 3000을 쓴다. 먼저 할 일은?',
      o: ['그 인스턴스의 /actuator/env로 실제 값을 확인한다', 'busrefresh를 열 번 더 보낸다', 'Config Server를 재배포한다'], a: 0,
      why: '204는 이벤트를 실었다는 뜻일 뿐이다. 전파는 비동기라 인스턴스마다 env를 찍어 보면 어디서 멈췄는지 보인다.' },
    { q: 'order.timeout을 바꾸고 busrefresh까지 했는데, 생성자에서 timeout을 int 필드로 복사해 둔 빈만 옛 값을 쓴다. 이유는?',
      o: ['브로커가 그 빈에 이벤트를 안 보냈다', '그 빈은 @RefreshScope가 없어 다시 만들어지지 않았다', 'Config Server가 5000을 서빙하지 않는다'], a: 1,
      why: '프록시를 쥔 빈은 호출 때마다 새 객체를 보지만, 값을 복사해 둔 빈은 다시 만들어져야 바뀐다.' },
    { q: 'webhook을 걸었는데 push해도 아무 인스턴스도 갱신되지 않는다. 최신판 Config Server에서 먼저 볼 곳은?',
      o: ['/monitor가 webhook 비밀값 없이 요청을 거절하고 있는지', 'RefreshScope 프록시의 크기', '인스턴스의 server.port'], a: 0,
      why: '최신 문서 기준으로 비밀값이 하나도 없으면 /monitor는 모든 webhook을 거절한다. 주소가 /monitor인지도 함께 본다.' },
  ];

  R.page({ title: '브로드캐스트 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
