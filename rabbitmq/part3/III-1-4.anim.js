/* III-1-4 Retry 패턴 (DLX + TTL) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 작업 큐와 지연 큐가 DLX 두 개로 이어진 고리. 메시지는 실패할 때마다 고리를 한 바퀴 돌고, x-death 헤더가 쌓인다.
 * 숫자는 페이지의 코드·STEPS 데이터(board.retry)에서 읽는다. 배달 시각(30초 간격)과 x-death 값은 dead-letter 규칙을
 * 파이썬으로 재현해 계산한 값이다(브로커 없이). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, zone, cross, check, clock, terminal, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  function xchg(cx, cy, name, o) { o = o || {}; const w = o.w || 132, a = w / 2, b = 25, d = 14, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INFO;
    el('path', { d: `M${-a},0 L${-a + d},${-b} L${a - d},${-b} L${a},0 L${a - d},${b} L${-a + d},${b} Z`, fill: o.fill || INFOBG, stroke: col, 'stroke-width': 2.2 }, g);
    tx(0, o.type ? -2 : 5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, class: 'mono' }, g);
    if (o.type) tx(0, 16, o.type, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g);
    return g; }
  function tube(x, cy, w, name, items, o) { o = o || {}; const h = o.h || 44, n = o.slots || 5, sw = (w - 12) / n, gw = o.grow ?? 1, op = o.op ?? 1;
    if (gw <= 0) return () => 0;
    el('rect', { x, y: cy - h / 2, width: w * gw, height: h, rx: 10, fill: SOFT, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    const slotX = (i) => x + w - 6 - sw * (i + 0.5);
    if (gw < 1) return slotX;
    for (let i = 1; i < n; i++) el('line', { x1: x + w - 6 - sw * i, y1: cy - h / 2 + 6, x2: x + w - 6 - sw * i, y2: cy + h / 2 - 6, stroke: GRID, 'stroke-width': 1.2, opacity: op });
    if (name) mono(o.nameX ?? x, o.nameBelow ? cy + h / 2 + 22 : cy - h / 2 - 10, name, { 'font-size': 15, 'font-weight': 700, opacity: op });
    (items || []).forEach((it, i) => { if (!it || i >= n) return; const col = it.col || ACC;
      card(slotX(i), cy, sw - 8, h - 14, { rx: 6, fill: it.fill || PANEL, stroke: col, sw: 2, text: it.t, fs: 13.5, mono: true, color: col, s: it.s ?? 1, op: (it.op ?? 1) * op, dash: it.dash }); });
    return slotX; }
  function node(cx, cy, letter, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('circle', { cx: 0, cy: 0, r: 26, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    tx(0, 7, letter, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: col }, g);
    if (name) tx(0, 46, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: o.nameCol || INK }, g); return g; }
  function tok(cx, cy, s, o) { o = o || {}; const col = o.col || ACC;
    return card(cx, cy, tw(s, 13.5) + 20, 28, { rx: 6, fill: o.fill || PANEL, stroke: col, sw: 2, text: s, fs: 13.5, mono: true, color: col, s: o.s ?? 1, op: o.op ?? 1 }); }
  function at(pts, u) { const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), T = L.reduce((a, b) => a + b, 0);
    let d = clamp(u) * T, i = 0; while (i < L.length - 1 && d > L[i]) { d -= L[i]; i++; } const f = L[i] ? d / L[i] : 0;
    return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; }
  function wire(pts, u, col, o) { o = o || {}; if (u <= 0) return; const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), T = L.reduce((a, b) => a + b, 0);
    let d = clamp(u) * T; const out = [pts[0]]; for (let i = 0; i < L.length; i++) { if (d >= L[i]) { out.push(pts[i + 1]); d -= L[i]; } else { const f = d / L[i]; out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]); break; } }
    const mk = col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)';
    el('polyline', { points: out.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, 'stroke-linejoin': 'round', 'marker-end': u > 0.98 && o.arrow !== false ? mk : null }); }
  // x-death 헤더 카드: rows = [[queue, reason, count]] (맨 위가 가장 최근)
  function xdeath(x, y, w, rows, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: 40 + Math.max(1, rows.length) * 30, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    mono(x + 14, y + 24, o.title || 'headers["x-death"]', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op });
    if (!rows.length) mono(x + 14, y + 56, '(없음 · 처음 배달)', { 'font-size': 14, fill: MUT, opacity: op });
    rows.forEach(([q, r, n, s], i) => { const yy = y + 56 + i * 30, a = (s ?? 1) * op;
      mono(x + 14, yy, `[${i}]`, { 'font-size': 14, fill: MUT, opacity: a }); mono(x + 50, yy, q, { 'font-size': 14, 'font-weight': 700, opacity: a });
      mono(x + w - 70, yy, r, { 'font-size': 14, fill: r === 'expired' ? WARN : BAD, 'text-anchor': 'end', opacity: a });
      mono(x + w - 14, yy, `count ${n}`, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'end', opacity: a }); }); }
  const retryOf = (b) => (b.board && b.board.retry) || '0';

  // ---------- 1. 즉시 재시도의 함정 ----------
  function gateway(ok, s) { card(800, 140, 170, 64, { rx: 10, stroke: ok == null ? GRID : ok ? GOOD : BAD, sw: 2.5, s, fill: ok == null ? PANEL : ok ? GOODBG : BADBG });
    tx(800, 134, 'PaymentGateway', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: s });
    if (ok != null) mono(800, 156, ok ? '200 OK' : '503', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ok ? GOOD : BAD, opacity: s }); }
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k === 4) { // 무엇이 빠졌나
      [['대기 시간', 'requeue=true는 0ms'], ['지수 백오프', '5s → 30s → 5m 같은 단계'], ['재시도 상한', '몇 번에서 멈출지']].forEach(([a, bb], i) => { const y = 90 + i * 86, s = pop(u, 0.2 + i * 0.4);
        card(300, y, 400, 66, { rx: 12, stroke: BAD, sw: 2, s, fill: BADBG }); cross(140, y, 12, s);
        tx(170, y - 4, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.4) }); tx(170, y + 20, bb, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.4) }); });
      wire([[510, 176], [600, 176]], E(u, 1.5, 1.9), ACC);
      card(760, 176, 280, 90, { rx: 14, stroke: ACC, sw: 3, s: pop(u, 1.8), fill: ACCBG });
      tx(760, 170, '실패 메시지를', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(760, 196, '지연 큐로 우회', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { // quorum queue 의 재배달 한도
      tube(40, 120, 300, 'work.queue (quorum)', [{ t: '#42', col: BAD }, { t: '#43', col: OFF }, { t: '#44', col: OFF }], { slots: 4 });
      const n = Math.min(20, Math.floor(lerp(1, 21, E(u, 0.2, 1.6))));
      for (let i = 0; i < 20; i++) el('rect', { x: 400 + (i % 10) * 34, y: 84 + Math.floor(i / 10) * 34, width: 28, height: 28, rx: 4, fill: i < n ? BAD : PANEL, stroke: i < n ? BAD : GRID, 'stroke-width': 1.5, opacity: i < n ? 0.8 : 1 });
      mono(400, 70, `재배달 ${n} / delivery-limit 20`, { 'font-size': 15, 'font-weight': 800, fill: BAD });
      sub(570, 180, 'RabbitMQ 4.0+ 기본값', fade(u, 0.4), { 'font-weight': 700 });
      wire([[570, 196], [570, 236], [300, 236], [300, 270]], E(u, 1.6, 2.0), WARN); wire([[570, 236], [800, 236], [800, 270]], E(u, 1.6, 2.0), MUT);
      card(300, 300, 300, 56, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 1.9), fill: WARNBG, text: 'DLX 있음 → delivery_limit', fs: 15, color: WARN, mono: false });
      card(800, 300, 220, 56, { rx: 10, stroke: MUT, sw: 2, s: pop(u, 2.0), text: 'DLX 없음 → 삭제', fs: 15, color: MUT });
      sub(480, 380, 'classic queue에는 한도가 없어 끝없이 돈다 · 어느 쪽이든 기다림은 0', fade(u, 2.3), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    node(60, 140, 'P', 'Producer');
    const behind = k >= 3 ? OFF : ACC;
    const head = (k === 1 && u > 0.6) ? null : { t: '#42', col: k >= 2 ? BAD : ACC, dash: (k === 1 && u > 0.4) || (k === 2 && u > 0.4 && u < 1.9) ? '4 3' : null };
    tube(110, 140, 360, 'work.queue', [head, { t: '#43', col: behind }, { t: '#44', col: behind }, { t: '#45', col: behind }], { slots: 5, grow: k === 0 ? E(u, 0.2, 0.8) : 1 });
    el('line', { x1: 470, y1: 140, x2: 534, y2: 140, stroke: GRID, 'stroke-width': 2.5 });
    node(560, 140, 'C', 'Consumer', { s: k === 0 ? pop(u, 0.9) : 1, col: k >= 2 ? BAD : INK });
    for (let i = 0; i < 10; i++) el('rect', { x: 524 + (i % 5) * 15, y: 202 + Math.floor(i / 5) * 15, width: 12, height: 12, rx: 2, fill: (k >= 1 && i === 0) ? WARN : PANEL, stroke: (k >= 1 && i === 0) ? WARN : GRID, 'stroke-width': 1.5, opacity: k === 0 ? fade(u, 1.2) : 1 });
    sub(560, 250, 'basicQos(10)', k === 0 ? fade(u, 1.2) : 1, { class: 'mono' });
    el('line', { x1: 586, y1: 140, x2: 715, y2: 140, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': '5 5' });
    gateway(k === 0 ? null : k === 1 ? (u > 1.0 ? true : null) : (u > 0.9 || k > 2 ? false : null), k === 0 ? fade(u, 1.4) : 1);
    mono(800, 60, `retry = ${retryOf(b)}`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: retryOf(b) === '0' ? INK : BAD });
    if (k === 0) { sub(290, 230, '아직 실패도 재시도도 없다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 1) { if (u > 0.2 && u < 0.6) { const [x, y] = at([[440, 140], [534, 140]], E(u, 0.2, 0.6)); tok(x, y - 34, '#42'); }
      fly(586, 108, 715, 108, seg(u, 0.6, 1.0), 'charge()', { fill: INK, mono: true });
      fly(534, 98, 440, 98, seg(u, 1.4, 2.0), 'basicAck', { fill: GOOD, mono: true });
      if (u > 2.0) R.banner(290, 330, '성공하면 ack · 큐에서 지운다', pop(u, 2.0)); return; }
    if (k === 2) { if (u > 0.2 && u < 0.5) { const [x, y] = at([[440, 140], [534, 140]], E(u, 0.2, 0.5)); tok(x, y - 34, '#42', { col: BAD }); }
      fly(586, 108, 715, 108, seg(u, 0.5, 0.9), 'charge()', { fill: INK, mono: true });
      fly(534, 98, 400, 98, seg(u, 1.2, 1.9), 'basicNack(…, true)', { fill: BAD, mono: true });
      pill(290, 230, '대기 0ms · 곧바로 맨 앞으로', BAD, pop(u, 1.9), { fs: 15 }); return; }
    // 3: 스핀 루프
    for (let i = 0; i < 4; i++) dot([[440, 128], [534, 128], [534, 152], [440, 152], [440, 128]], (t * 1.6 + i / 4) % 1, BAD, 6);
    sub(260, 196, '#43 · #44 · #45 차례가 오지 않는다', fade(u, 0.8), { 'font-weight': 700, fill: MUT });
    const cpu = E(u, 0.3, 1.8); el('rect', { x: 120, y: 300, width: 560, height: 30, rx: 6, fill: SOFT }); el('rect', { x: 120, y: 300, width: 560 * cpu, height: 30, rx: 6, fill: BAD, opacity: 0.8 });
    tx(120, 290, 'CPU', { 'font-size': 15, 'font-weight': 700 }); mono(690, 321, Math.round(cpu * 100) + '%', { 'font-size': 16, 'font-weight': 800, fill: BAD });
    sub(800, 220, '장애가 끝날 때까지 계속 503', fade(u, 1.2), { 'font-weight': 700, fill: BAD }); }

  // ---------- 2. 토폴로지: 두 DLX 로 만든 고리 ----------
  const T2 = { wq: [160, 110, 260], rdlx: [620, 110], rd: [470, 300, 280], wdlx: [250, 300] };
  function s2(t, c) { const { k, u } = c;
    xchg(250, 300, 'work.dlx', { type: 'direct', col: WARN, fill: WARNBG, s: k === 0 ? pop(u, 0.3) : 1 });
    xchg(620, 110, 'retry.dlx', { type: 'direct', col: WARN, fill: WARNBG, s: k === 0 ? pop(u, 0.7) : 1 });
    if (k === 0) { sub(250, 350, '만료분이 지나갈 관문', fade(u, 0.8), { 'font-weight': 700 }); sub(620, 160, '실패분이 지나갈 관문', fade(u, 1.1), { 'font-weight': 700 });
      sub(440, 220, '플러그인 없이 표준 기능만 쓴다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    tube(160, 110, 260, 'work.queue', [], { slots: 4, grow: k === 1 ? E(u, 0.2, 0.7) : 1 });
    wire([[420, 110], [554, 110]], k === 1 ? E(u, 0.8, 1.3) : 1, BAD);
    mono(487, 98, 'nack', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 1.1) : 1 });
    sub(290, 160, 'x-dead-letter-exchange = retry.dlx · key retry', k === 1 ? fade(u, 1.4) : 1, { class: 'mono', 'font-weight': 700, fill: BAD });
    if (k === 1) return;
    tube(470, 300, 280, 'retry.delay', [], { slots: 4, grow: k === 2 ? E(u, 0.2, 0.7) : 1 });
    clock(790, 300, 20, k === 2 ? E(u, 0.8, 2.4) : 1, WARN); mono(790, 342, 'TTL 30000ms', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: k === 2 ? fade(u, 0.8) : 1 });
    wire([[470, 300], [316, 300]], k === 2 ? E(u, 1.0, 1.5) : 1, WARN);
    mono(393, 288, 'expired', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 1.3) : 1 });
    sub(470, 372, '만료되면 work.dlx · key work', k === 2 ? fade(u, 1.5) : 1, { class: 'mono', 'font-weight': 700, fill: WARN });
    if (k === 2) { node(880, 220, 'C', '소비자 0', { dash: '4 4', col: OFF, nameCol: MUT, s: pop(u, 1.7) }); cross(880, 220, 16, pop(u, 2.0)); return; }
    // 3: 바인딩 두 줄로 고리를 닫는다
    wire([[620, 135], [620, 276]], k === 3 ? E(u, 0.2, 0.7) : 1, INFO); mono(632, 210, 'retry', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: k === 3 ? fade(u, 0.5) : 1 });
    wire([[250, 275], [250, 134]], k === 3 ? E(u, 0.6, 1.1) : 1, INFO); mono(262, 210, 'work', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: k === 3 ? fade(u, 0.9) : 1 });
    const LOOP = [[300, 110], [554, 110], [620, 135], [620, 276], [610, 300], [316, 300], [250, 275], [250, 134], [300, 110]];
    if (k === 3 ? u > 1.1 : true) dot(LOOP, (t * 0.35) % 1, ACC, 8);
    if (k === 3) { R.banner(440, 210, '실패 → 30초 대기 → 복귀', pop(u, 1.6)); return; }
    // 4: 생산자 진입점
    xchg(75, 40, 'work', { w: 100, type: 'direct', s: pop(u, 0.2) });
    wire([[75, 65], [75, 110], [160, 110]], E(u, 0.5, 1.0), INFO); mono(100, 140, 'work', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.9) });
    sub(780, 40, '생산자는 work 로만 발행한다', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: INK });
    sub(780, 64, '지연 큐에는 소비자를 붙이지 않는다', fade(u, 1.5), { 'font-weight': 700, fill: WARN }); }

  // ---------- 3. 실패 → 지연 큐, x-death count ----------
  function retryBar(n, s) { mono(620, 52, 'retries / MAX_RETRY', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: s });
    for (let i = 0; i < 5; i++) el('rect', { x: 620 + i * 60, y: 64, width: 52, height: 26, rx: 5, fill: i < n ? (n >= 5 ? BAD : WARN) : PANEL, stroke: i < n ? 'none' : GRID, 'stroke-width': 1.5, opacity: s });
    mono(920, 120, `${n} / 5`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', fill: n >= 5 ? BAD : INK, opacity: s }); }
  function s3(t, c) { const { k, u } = c, b = c.beat, n = +retryOf(b);
    retryBar(k === 1 ? 0 : n, 1);
    if (k === 0) { xdeath(40, 40, 400, [], { op: fade(u, 0.2) });
      card(250, 230, 330, 56, { rx: 10, stroke: ACC, sw: 2.5, s: pop(u, 0.8), text: 'get_retry_count(properties)', fs: 15, mono: true, color: ACC });
      wire([[250, 120], [250, 200]], E(u, 0.9, 1.3), ACC); wire([[420, 230], [560, 230]], E(u, 1.4, 1.8), ACC);
      mono(580, 236, 'return 0', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      sub(250, 290, 'deaths[0]["count"] · 없으면 0', fade(u, 1.2), { class: 'mono', 'font-weight': 700 }); return; }
    if (k === 1) { terminal(40, 150, 880, 90, ['[recv] order=b\'{"order_id": 42}\' retry=0/5'], E(u, 0.3, 1.6), { title: 'retry_consumer.py · 로그 예시', fs: 15 });
      sub(480, 290, '장애 분석에서 가장 먼저 찾는 줄', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { // 상한: 배달 6번째(150초)에 격리 — 규칙 재현 결과
      const D = [0, 30, 60, 90, 120, 150];
      el('line', { x1: 80, y1: 250, x2: 880, y2: 250, stroke: MUT, 'stroke-width': 1.8 });
      D.forEach((s, i) => { const x = 80 + i * 160, a = 0.2 + i * 0.28, park = i === 5;
        el('circle', { cx: x, cy: 250, r: 15, fill: park ? BAD : WARN, opacity: fade(u, a) });
        mono(x, 256, String(i), { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL, opacity: fade(u, a) });
        mono(x, 290, `${s}s`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, a) });
        sub(x, 216, park ? 'park + ack' : '실패 → nack', fade(u, a), { 'font-weight': 700, fill: park ? BAD : WARN }); });
      tx(80, 190, '배달마다 읽은 retries', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      card(480, 360, 560, 54, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 2.0), fill: BADBG, text: 'retries 5 ≥ MAX_RETRY → 처리 시도 없이 parking 후 ack', fs: 15, color: BAD });
      sub(480, 318, 'retry.delay TTL 30초 기준 · 게이트웨이가 계속 503일 때', fade(u, 1.8), { 'font-weight': 700 }); return; }
    if (k === 3) { xdeath(40, 40, 440, [['retry.delay', 'expired', 1], ['work.queue', 'rejected', 1]], { op: 1 });
      card(260, 270, 200, 50, { rx: 10, text: 'charge()', fs: 16, mono: true, stroke: GOOD, color: GOOD, sw: 2.5, s: pop(u, 0.3) }); check(380, 270, 11, pop(u, 0.8));
      fly(470, 270, 640, 270, seg(u, 1.0, 1.7), 'basic_ack', { fill: GOOD, mono: true, stay: true });
      sub(620, 330, '1회 재시도 후 성공 · 고리를 빠져나간다', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: GOOD }); return; }
    // 4: 실패 → nack(requeue=False) → retry.delay, x-death 가 쌓인다
    const r1 = u > 0.9, r2 = u > 2.0;
    xdeath(40, 40, 440, r2 ? [['retry.delay', 'expired', 1, pop(u, 2.0)], ['work.queue', 'rejected', 1]] : r1 ? [['work.queue', 'rejected', 1, pop(u, 0.9)]] : [], {});
    tube(560, 250, 200, 'work.queue', [], { slots: 3, h: 40 }); tube(560, 350, 200, 'retry.delay', r1 && !r2 ? [{ t: '#42', col: WARN }] : [], { slots: 3, h: 40 });
    clock(800, 350, 16, r1 ? E(u, 1.0, 2.0) : 0, WARN);
    wire([[660, 272], [660, 328]], E(u, 0.3, 0.8), BAD); mono(672, 304, 'nack(requeue=False)', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.5) });
    wire([[540, 350], [520, 350], [520, 250], [556, 250]], E(u, 1.9, 2.3), WARN); }

  // ---------- 4. 지수 백오프 ----------
  const ST = [['retry.5s', 5, ACC], ['retry.30s', 30, WARN], ['retry.5m', 300, BAD]];
  const SY = [90, 170, 250];
  function stages(u, k, o) { o = o || {}; ST.forEach(([n, s, col], i) => { const y = SY[i], a = k === 0 ? 0.2 + i * 0.4 : -1;
      tube(560, y, 220, n, o.items && o.items[i] ? o.items[i] : [], { slots: 2, h: 40, grow: k === 0 ? E(u, a, a + 0.4) : 1, op: o.dim && o.dim !== i ? 0.4 : 1 });
      el('rect', { x: 800, y: y - 7, width: Math.log10(s) / Math.log10(300) * 130 * (k === 0 ? E(u, a + 0.3, a + 0.8) : 1), height: 14, rx: 4, fill: col, opacity: 0.75 });
      mono(800, y + 32, s >= 60 ? `${s / 60}m (${s}s)` : `${s}s`, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: k === 0 ? fade(u, a + 0.6) : 1 }); }); }
  function s4(t, c) { const { k, u } = c, b = c.beat, cnt = +retryOf(b);
    if (k === 6) { // head-of-line: 한 큐에 메시지별 TTL 을 섞으면
      const X = (s) => 120 + s / 300 * 640;
      tx(40, 50, '한 큐에 메시지별 TTL을 섞으면 (예시: 두 건을 같은 순간에 넣음)', { 'font-size': 15, 'font-weight': 700 });
      tube(120, 100, 300, 'retry (한 큐)', [{ t: '5m', col: BAD }, { t: '5s', col: ACC }], { slots: 3, h: 40 });
      el('line', { x1: X(0), y1: 190, x2: X(300), y2: 190, stroke: MUT, 'stroke-width': 1.8 });
      [0, 300].forEach((s) => mono(X(s), 212, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      el('rect', { x: X(0), y: 150, width: (X(5) - X(0)), height: 14, rx: 3, fill: ACC });
      el('rect', { x: X(5), y: 150, width: (X(300) - X(5)) * E(u, 0.4, 1.6), height: 14, rx: 3, fill: BAD, opacity: 0.35 });
      mono(X(300) + 8, 162, '5s 메시지가 300s 에야 빠진다', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      tx(40, 270, '단계마다 큐를 나누면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      [['retry.5s', '5s', ACC], ['retry.5m', '5m', BAD]].forEach(([n, s, col], i) => tube(120 + i * 330, 330, 260, n, [{ t: s, col }], { slots: 3, h: 40, op: fade(u, 1.9 + i * 0.2) }));
      check(760, 330, 12, pop(u, 2.3)); sub(450, 390, '큐 안의 TTL이 같아 순서대로 빠진다', fade(u, 2.3), { 'font-weight': 700, fill: GOOD, 'font-size': 15 }); return; }
    if (k === 3) { // x-retry-count vs x-death[0].count (규칙 재현 결과)
      const rows = [['1', '0', '0', 'retry.5s'], ['2', '1', '1', 'retry.30s'], ['3', '2', '1', 'retry.5m'], ['4', '3', '1', 'retry.5m']];
      const cx = [70, 220, 420, 640];
      ['시도', 'x-retry-count', 'x-death[0].count', '고른 큐'].forEach((h, i) => mono(cx[i], 60, h, { 'font-size': 14.5, 'font-weight': 800, fill: i === 1 ? ACC : i === 2 ? BAD : MUT }));
      el('line', { x1: 50, y1: 74, x2: 800, y2: 74, stroke: GRID, 'stroke-width': 1.5 });
      rows.forEach((r, i) => { const y = 108 + i * 40, op = fade(u, 0.3 + i * 0.35);
        r.forEach((v, j) => mono(cx[j], y, v, { 'font-size': 15, 'font-weight': j === 1 || j === 2 ? 800 : 500, fill: j === 1 ? ACC : j === 2 ? BAD : INK, opacity: op })); });
      card(480, 330, 820, 76, { rx: 12, stroke: BAD, sw: 2, s: pop(u, 2.0), fill: BADBG });
      tx(90, 324, 'x-death는 큐마다 항목이 따로라 [0].count는 늘 1 · 그걸로 고르면 retry.30s만 돈다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(90, 348, '새 properties로 다시 발행하므로 단계 선택은 x-retry-count로 한다', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    stages(u, k, k === 4 ? { items: [null, null, u > 1.6 ? [{ t: '#42', col: BAD, s: pop(u, 1.6) }] : null] } : k === 1 ? { dim: 1 } : {});
    if (k === 0) { sub(270, 170, 'TTL만 다른 지연 큐 세 개', fade(u, 1.6), { 'font-size': 16, 'font-weight': 700, fill: INK }); sub(270, 196, '(막대는 로그 눈금)', fade(u, 1.7)); return; }
    if (k === 1) { // count → 단계
      for (let i = 0; i < 5; i++) { const y = 70 + i * 50, idx = Math.min(i, 2), hot = i === cnt, a = 0.2 + i * 0.2;
        card(120, y, 120, 36, { rx: 8, stroke: hot ? WARN : GRID, sw: hot ? 2.5 : 1.5, s: pop(u, a), text: `count ${i}`, fs: 14.5, mono: true, color: hot ? WARN : INK });
        wire([[182, y], [552, SY[idx]]], E(u, a + 0.3, a + 0.8), hot ? WARN : OFF, { sw: hot ? 2.6 : 1.4 }); }
      mono(340, 350, 'idx = min(count, 2)', { 'font-size': 16, 'font-weight': 800, fill: INK, opacity: fade(u, 1.6) });
      sub(340, 376, '3번째 이후는 5분을 유지', fade(u, 1.8), { 'font-weight': 700 }); return; }
    if (k === 2) { el('rect', { x: 40, y: 60, width: 440, height: 150, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(56, 86, 'pika.BasicProperties(', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      mono(76, 118, 'delivery_mode=2', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      R.spans(76, 148, [['headers={"x-retry-count": ', {}], [String(cnt + 1), { fill: ACC, 'font-weight': 800 }], ['}', {}]], { 'font-size': 15, opacity: fade(u, 0.9) });
      mono(56, 184, `routing_key = "${ST[Math.min(cnt, 2)][0]}"`, { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
      R.dbIcon(160, 300, '디스크에 저장', { s: pop(u, 1.8) }); sub(340, 300, '몇 분씩 머무는 메시지는', fade(u, 2.0), { 'font-weight': 700 }); sub(340, 322, '재시작에도 살아야 한다', fade(u, 2.1), { 'font-weight': 700 }); return; }
    xchg(300, 170, 'retry.exchange', { w: 160, type: 'direct' });
    if (k === 4) { ST.forEach((s, i) => wire([[380, 170], [556, SY[i]]], 1, i === 2 ? BAD : OFF, { sw: i === 2 ? 2.6 : 1.4 }));
      if (u > 0.4 && u < 1.6) { const [x, y] = at([[120, 170], [220, 170], [380, 170], [660, SY[2]]], E(u, 0.4, 1.6)); tok(x, y, '#42', { col: BAD }); }
      clock(900, 330, 18, E(u, 1.8, 2.6) * 0.3, BAD); sub(800, 360, '5분 동안 잠든다 · 소비자는 관여하지 않는다', fade(u, 1.8), { 'font-weight': 700 }); return; }
    // 5: 세 큐 모두 work.dlx → work.queue
    xchg(380, 360, 'work.dlx', { type: 'direct', col: WARN, fill: WARNBG, s: pop(u, 0.2) });
    tube(40, 360, 220, 'work.queue', [], { slots: 3, h: 40, nameBelow: true });
    ST.forEach(([n, s, col], i) => { wire([[560, SY[i]], [520, SY[i]], [520, 345], [446, 352]], E(u, 0.4 + i * 0.25, 1.0 + i * 0.25), WARN, { dash: '5 4' });
      if (u > 1.2) dot([[560, SY[i]], [520, SY[i]], [520, 345], [446, 352], [314, 360], [260, 360]], (t * 0.5 + i / 3) % 1, col, 6); });
    wire([[314, 360], [262, 360]], E(u, 1.0, 1.3), INFO);
    sub(130, 300, '소비자는 work.queue만 본다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }

  // ---------- 5. parking ----------
  function s5(t, c) { const { k, u } = c, b = c.beat, n = +retryOf(b);
    if (k === 0) { for (let i = 0; i <= 5; i++) { const x = 120 + i * 130, on = i <= n, s = pop(u, 0.2 + i * 0.15);
        card(x, 160, 90, 56, { rx: 10, stroke: i === 5 ? BAD : on ? WARN : GRID, sw: i === n ? 3 : 1.8, s, fill: i === n ? WARNBG : PANEL, text: String(i), fs: 20, mono: true, color: i === 5 ? BAD : INK }); }
      el('line', { x1: 120 + 4.5 * 130, y1: 110, x2: 120 + 4.5 * 130, y2: 220, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: fade(u, 1.2) });
      mono(120 + 4.5 * 130, 100, 'MAX_RETRY = 5', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(120 + n * 130, 220, '지금 count 4', fade(u, 1.5), { 'font-weight': 700, fill: WARN });
      sub(480, 300, '한 번 더 실패하면 순환에서 빼낸다', fade(u, 1.9), { 'font-size': 16, 'font-weight': 700, fill: INK }); return; }
    // 공통: 메시지 헤더 카드 (x-death 는 규칙 재현 값)
    const hist = [['retry.delay', 'expired', 5], ['work.queue', 'rejected', 5]];
    if (k === 1) { xdeath(40, 40, 440, hist, { title: 'headers = dict(properties.headers)' });
      [['x-parked-reason', 'max-retry-exceeded'], ['x-parked-at', '2026-05-20T10:30:00Z']].forEach(([a, v], i) => { const y = 200 + i * 36, op = fade(u, 0.8 + i * 0.4);
        el('rect', { x: 40, y: y - 22, width: 440, height: 32, rx: 6, fill: ACCBG, opacity: op }); mono(54, y, a, { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: op }); mono(466, y, v, { 'font-size': 14, 'text-anchor': 'end', opacity: op }); });
      sub(720, 160, 'x-death 이력은 그대로 두고', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700 }); sub(720, 186, '사유와 시각만 덧붙인다', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: ACC }); return; }
    xchg(480, 110, 'parking.exchange', { w: 190, type: 'direct', s: k === 2 ? pop(u, 0.2) : 1 });
    const parked = (k === 2 && u > 1.6) || k > 2;
    tube(640, 110, 290, 'parking.dlq', parked ? [{ t: '#42', col: BAD, s: k === 2 ? pop(u, 1.6) : 1 }] : [], { slots: 3 });
    el('line', { x1: 575, y1: 110, x2: 640, y2: 110, stroke: INFO, 'stroke-width': 2.5 }); mono(607, 150, 'parking', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
    node(120, 110, 'C', 'Consumer');
    if (k === 2) { if (u > 0.5 && u < 1.6) { const [x, y] = at([[150, 110], [385, 110], [575, 110], [870, 110]], E(u, 0.5, 1.6)); tok(x, y - 36, '#42', { col: BAD }); }
      card(250, 290, 200, 60, { rx: 10, stroke: INK, sw: 2, s: pop(u, 1.8), text: 'body (받은 것)', fs: 15 }); mono(480, 298, '=', { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      card(710, 290, 200, 60, { rx: 10, stroke: INK, sw: 2, s: pop(u, 2.0), text: 'body (보낸 것)', fs: 15 });
      sub(480, 360, '가공하지 않아야 나중에 그대로 재발행할 수 있다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { R.dbIcon(160, 300, 'delivery_mode=2', { s: pop(u, 0.2) });
      xdeath(300, 220, 420, hist, { op: fade(u, 0.6), title: 'x-death (사후 분석의 단서)' });
      mono(930, 380, '14일 = 1209600000ms', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: WARN, opacity: fade(u, 1.6) }); clock(890, 330, 18, E(u, 1.6, 2.6) * 0.2, WARN); return; }
    if (k === 4) { terminal(40, 200, 560, 110, ['[park] order=b\'{"order_id": 42}\' → parking.dlq (분석 대기)', '[alert] parking: 42'], lerp(0, 2, E(u, 0.3, 1.6)), { title: '로그 예시', fs: 14 });
      // 종 → 운영자
      const s = pop(u, 1.6); el('path', { d: 'M700,300 Q700,250 730,250 Q760,250 760,300 Z', fill: WARN, opacity: s }); el('circle', { cx: 730, cy: 306, r: 6, fill: WARN, opacity: s });
      wire([[770, 280], [820, 280]], E(u, 1.8, 2.1), WARN); person(870, 280, '운영자', { s: pop(u, 2.0) }); return; }
    // 5: SOP
    [['parking.dlq depth > 0', '경보'], ['rabbitmqadmin get', 'x-death 분석']].forEach(([a, bb], i) => { const x = 150 + i * 260, s = pop(u, 0.2 + i * 0.4);
      card(x, 260, 220, 64, { rx: 10, stroke: i ? INFO : WARN, sw: 2, s }); mono(x, 254, a, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) });
      tx(x, 278, bb, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) });
      if (i === 0) wire([[262, 260], [286, 260]], E(u, 0.5, 0.8), MUT); });
    [['코드 수정 후 재발행', GOOD], ['영구 보관', WARN], ['폐기', BAD]].forEach(([a, col], i) => { const y = 200 + i * 60, s = pop(u, 1.2 + i * 0.3);
      wire([[522, 260], [640, y]], E(u, 1.0 + i * 0.3, 1.4 + i * 0.3), OFF);
      card(760, y, 220, 46, { rx: 10, stroke: col, sw: 2, s, text: a, fs: 15, color: col }); }); }

  const quiz = [
    { q: '외부 API가 503을 낼 때 basicNack(requeue=true)로 즉시 재시도하면 무엇이 문제인가?',
      o: ['메시지가 DLX로 빠져 사라진다', '기다림 없이 같은 메시지가 곧바로 돌아와 실패를 되풀이한다', '컨슈머 연결이 끊긴다'], a: 1,
      why: 'requeue=true의 대기 시간은 0이다. 장애가 풀릴 때까지 같은 메시지를 두드리며 CPU를 쓰고 뒤의 정상 메시지는 차례가 오지 않는다.' },
    { q: '지연 재시도 고리에서 retry.delay 큐에 소비자를 붙이지 않는 이유는 무엇인가?',
      o: ['소비자가 있으면 TTL이 끝나기 전에 꺼내 가 지연이 사라져서', 'DLX는 소비자가 있는 큐에 걸 수 없어서', '소비자가 있으면 x-death가 붙지 않아서'], a: 0,
      why: '지연은 TTL이 흐르는 동안 메시지가 큐에 머물러야 생긴다. 소비자 0인 TTL 큐가 타이머 역할을 한다.' },
    { q: '실패한 메시지가 work.queue에서 retry.delay로 넘어가려면 컨슈머는 무엇을 보내야 하나?',
      o: ['basic_ack', 'basic_nack(requeue=True)', 'basic_nack(requeue=False)'], a: 2,
      why: 'requeue=False여야 work.queue의 x-dead-letter-exchange가 발동한다. 이때 브로커가 x-death count도 올려 준다.' },
    { q: 'backoff_router.py에서 retry_count가 3이면 메시지는 어느 지연 큐로 가나?',
      o: ['retry.5s', 'retry.5m', 'retry.30s'], a: 1,
      why: 'idx = min(3, 2) = 2라서 BACKOFF_STAGES[2]인 retry.5m을 쓴다. 범위를 넘으면 마지막 단계를 유지한다.' },
    { q: 'MAX_RETRY를 넘은 메시지를 parking.dlq로 보낸 뒤 원래 메시지는 어떻게 끝내야 하나?',
      o: ['아무것도 하지 않는다', 'nack(requeue=False)로 다시 dead letter 한다', 'ack해서 순환을 끝낸다'], a: 2,
      why: '격리 후 ack하지 않으면 메시지가 다시 고리로 들어가 parking이 의미 없어진다.' },
  ];

  const summary = [
    'requeue=True 즉시 재시도는 기다림이 없어 일시 장애 동안 같은 실패만 되풀이한다.',
    'work.queue와 retry.delay를 DLX 두 개로 이으면 실패한 메시지가 30초 쉬었다 돌아온다.',
    'nack 고리에서는 x-death count로, 직접 발행하는 백오프에서는 x-retry-count로 횟수를 센다.',
    '횟수가 MAX_RETRY에 닿으면 원본과 이력을 parking.dlq에 넣고 ack한 뒤 알람을 보낸다.',
  ];
  const review = [
    { q: '지연 큐를 retry.5s, retry.30s, retry.5m으로 나누고 x-death[0].count로 단계를 골랐더니 메시지가 retry.30s만 오간다. 원인은?',
      o: ['x-death 항목이 큐마다 따로 생겨 [0].count가 늘 1이다', 'TTL이 문자열이 아니어서', 'work.dlx 바인딩이 빠져서'], a: 0,
      why: 'count는 같은 큐, 같은 사유로 죽은 횟수다. 새 properties로 다시 발행하니 이전 기록도 남지 않아, 단계는 x-retry-count로 세야 한다.' },
    { q: '결제 장애가 10분 이어졌는데 retry.delay(TTL 30초) 고리에서 MAX_RETRY 5로 운영했다. 결과로 맞는 것은?',
      o: ['10분 동안 30초마다 계속 재시도된다', '처음 실패부터 150초쯤 뒤 parking.dlq로 격리된다', '바로 parking.dlq로 간다'], a: 1,
      why: '30초 대기를 다섯 번 거치면 여섯 번째 배달에서 retries가 5가 되어 격리된다. 장애가 길면 백오프 단계를 늘리거나 상한을 다시 잡는다.' },
    { q: 'quorum queue(RabbitMQ 4.0)에서 requeue=True 재시도를 돌렸더니 일부 주문이 DLX도 없이 사라졌다. 이유는?',
      o: ['TTL이 만료돼서', 'prefetch가 10이라서', '재배달 한도 20을 넘어 버려져서'], a: 2,
      why: '4.0부터 quorum queue는 20번 넘게 재배달된 메시지를 DLX로 보내거나, DLX가 없으면 버린다. 지연 재시도 고리로 바꾸는 편이 안전하다.' },
  ];

  R.page({ title: '지연 재시도 고리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
