/* III-1-1 Dead Letter Exchange (DLX) — 장면 4개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 왼쪽에서 오른쪽으로 producer → exchange(육각형) → 큐(칸이 있는 관, 오른쪽 끝이 head) → consumer.
 *       죽은 메시지는 아래 줄의 dlx.exchange → dlq.orders 로 내려간다.
 * 숫자는 페이지의 코드·STEPS 데이터(dlqState)에서만 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, zone, cross, check, clock, terminal, kvTable } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  // exchange: 육각형. o.type 은 아래 작은 글씨
  function xchg(cx, cy, name, o) { o = o || {}; const w = o.w || 132, a = w / 2, b = 25, d = 14, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INFO;
    el('path', { d: `M${-a},0 L${-a + d},${-b} L${a - d},${-b} L${a},0 L${a - d},${b} L${-a + d},${b} Z`, fill: o.fill || INFOBG, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    tx(0, o.type ? -2 : 5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, class: 'mono' }, g);
    if (o.type) tx(0, 16, o.type, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g);
    return g; }
  // 큐: 칸이 있는 관. items[0] 이 head(오른쪽 끝). item = { t, col, fill, op, s, dash }
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
    el('circle', { cx: 0, cy: 0, r: 26, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5 }, g);
    tx(0, 7, letter, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: col }, g);
    if (name) tx(0, 46, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 }, g); return g; }
  function tok(cx, cy, s, o) { o = o || {}; const col = o.col || ACC;
    return card(cx, cy, tw(s, 13.5) + 20, 28, { rx: 6, fill: o.fill || PANEL, stroke: col, sw: 2, text: s, fs: 13.5, mono: true, color: col, s: o.s ?? 1, op: o.op ?? 1 }); }
  // 꺾은선 경로의 길이 비율 u 지점
  function at(pts, u) { const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), T = L.reduce((a, b) => a + b, 0);
    let d = clamp(u) * T, i = 0; while (i < L.length - 1 && d > L[i]) { d -= L[i]; i++; } const f = L[i] ? d / L[i] : 0;
    return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; }
  // 경로를 u 만큼 그린다 (끝에 화살표)
  function wire(pts, u, col, o) { o = o || {}; if (u <= 0) return; const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), T = L.reduce((a, b) => a + b, 0);
    let d = clamp(u) * T; const out = [pts[0]]; for (let i = 0; i < L.length; i++) { if (d >= L[i]) { out.push(pts[i + 1]); d -= L[i]; } else { const f = d / L[i]; out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]); break; } }
    const mk = col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)';
    el('polyline', { points: out.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, 'stroke-linejoin': 'round', 'marker-end': u > 0.98 && o.arrow !== false ? mk : null }); }
  const REASON = { rejected: BAD, expired: WARN, maxlen: INFO };
  const short = (id) => '#' + String(id).replace(/^\D+/, '');
  const dlqItems = (b, o) => ((b.dlqState && b.dlqState.messages) || []).map((m) => Object.assign({ t: short(m.id), col: REASON[m.reason] || INK }, o || {}));

  // ---------- 1. 정상 처리: ack 흐름 ----------
  const P1 = { px: 90, xx: 290, qx: 390, qw: 260, cx: 880, y: 140, dx: 290, dy: 320 };
  const DLPATH = [[400, 162], [400, 240], [290, 240], [290, 295]];
  function prefetch(n, used, op) { for (let i = 0; i < n; i++) { const x = 845 + (i % 5) * 15, y = 198 + Math.floor(i / 5) * 15;
      el('rect', { x, y, width: 12, height: 12, rx: 2, fill: i < used ? WARN : PANEL, stroke: i < used ? WARN : GRID, 'stroke-width': 1.5, opacity: op }); }
    sub(882, 247, 'prefetch 10', op, { class: 'mono' }); }
  function s1(t, c) { const { k, u } = c;
    zone(190, 30, 600, 370, 'RabbitMQ 브로커', { fill: PANEL, stroke: GRID, dash: '6 6' });
    // 컨슈머 쪽 연결: 굵은 관 = TCP 연결, 그 안의 가는 선 = 채널
    const cg = k === 0 ? E(u, 0.2, 1.0) : 1;
    el('line', { x1: 790, y1: P1.y, x2: lerp(790, 854, cg), y2: P1.y, stroke: GRID, 'stroke-width': 18, 'stroke-linecap': 'round' });
    if (k > 0 || u > 1.1) el('line', { x1: 790, y1: P1.y, x2: lerp(790, 854, k === 0 ? E(u, 1.1, 1.7) : 1), y2: P1.y, stroke: ACC, 'stroke-width': 3 });
    node(P1.cx, P1.y, 'C', 'Consumer', { s: k === 0 ? pop(u, 0.2) : 1 });
    sub(822, 114, 'TCP 연결', k === 0 ? fade(u, 0.8) : 1, { 'font-weight': 700, fill: INK });
    if (k === 0) { sub(880, 290, '연결 1개 안에', fade(u, 1.8), { 'font-size': 15, fill: INK }); sub(880, 312, '채널 1개', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: ACC });
      sub(490, 220, '아직 exchange도 큐도 없다', fade(u, 1.4), { 'font-size': 15 }); return; }
    // exchange 두 개
    const xs = k === 1 ? pop(u, 0.3) : 1, ds = k === 1 ? pop(u, 0.9) : 1;
    xchg(P1.xx, P1.y, 'orders', { type: 'direct', s: xs });
    xchg(P1.dx, P1.dy, 'dlx.exchange', { type: 'direct', s: ds, col: WARN, fill: WARNBG });
    if (k === 1) { pill(560, 320, '둘 다 type=direct · DLX 전용 타입은 없다', MUT, pop(u, 1.6), { fs: 14 }); return; }
    // 큐 + DLX 인자
    const qg = k === 2 ? E(u, 0.2, 0.9) : 1;
    const ready = k === 3 ? (u < 1.5 ? 0 : u < 1.9 ? 1 : 0) : 0, unacked = k === 3 ? (u >= 1.9 ? 1 : 0) : k === 4 ? (u < 1.8 ? 1 : 0) : 0;
    const items = [];
    if (k === 3 && u >= 1.5 && u < 1.9) items[0] = { t: '#42', col: ACC };
    if ((k === 3 && u >= 1.9) || (k === 4 && u < 1.8)) items[0] = { t: '#42', col: WARN, dash: '4 3', op: k === 4 ? 1 - seg(u, 1.6, 1.8) : 1 };
    tube(P1.qx, P1.y, P1.qw, 'orders.queue', items, { grow: qg });
    wire(DLPATH, k === 2 ? E(u, 1.0, 1.6) : 1, k === 2 ? WARN : OFF, { dash: '6 5' });
    if (k === 2) { const a = pop(u, 1.4); card(575, 225, 330, 58, { rx: 8, stroke: WARN, sw: 2, s: a, fill: WARNBG });
      mono(422, 220, 'x-dead-letter-exchange: dlx.exchange', { 'font-size': 13.5, fill: INK, opacity: fade(u, 1.6) });
      mono(422, 242, 'x-dead-letter-routing-key: orders.dead', { 'font-size': 13.5, fill: INK, opacity: fade(u, 1.9) }); return; }
    // 바인딩, 발행, 배달
    const bg = k === 3 ? E(u, 0.2, 0.6) : 1;
    el('line', { x1: 356, y1: P1.y, x2: lerp(356, 390, bg), y2: P1.y, stroke: INFO, 'stroke-width': 2.5 });
    sub(373, 184, 'order.created', k === 3 ? fade(u, 0.5) : 1, { class: 'mono', fill: INFO, 'font-weight': 700 });
    el('line', { x1: 116, y1: P1.y, x2: 190, y2: P1.y, stroke: GRID, 'stroke-width': 18, 'stroke-linecap': 'round', opacity: k === 3 ? fade(u, 0.4) : 1 });
    node(P1.px, P1.y, 'P', 'Producer', { s: k === 3 ? pop(u, 0.3) : 1 });
    prefetch(10, unacked, k === 3 ? fade(u, 0.6) : 1);
    mono(520, 190, `Ready ${ready} · Unacked ${unacked}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: unacked ? WARN : INK });
    sub(345, 262, k === 4 ? 'DLX 발동 안 함' : 'DLX 경로 대기', 1, { 'font-weight': 700 });
    if (k === 3) { const r1 = [[116, P1.y], [224, P1.y], [356, P1.y], [618, P1.y]];
      if (u > 0.7 && u < 1.5) { const [x, y] = at(r1, E(u, 0.7, 1.5)); tok(x, y - 30, 'order_id=42'); }
      if (u > 1.9 && u < 2.5) { const [x, y] = at([[650, P1.y], [854, P1.y]], E(u, 1.9, 2.5)); tok(x, y - 30, '#42', { col: WARN }); } }
    if (k === 4) { check(P1.cx, 88, 11, pop(u, 0.3)); sub(P1.cx, 66, 'process_payment', fade(u, 0.3), { class: 'mono', fill: GOOD, 'font-weight': 700 });
      fly(854, P1.y - 30, 650, P1.y - 30, seg(u, 0.8, 1.6), 'basic_ack', { fill: GOOD, mono: true });
      if (u > 1.8) R.banner(565, 340, '메시지 #42 영구 삭제 · 정상 경로 끝', pop(u, 1.9)); } }

  // ---------- 2. 처리 실패: nack(requeue=False) ----------
  const HX = 360, HY = 40, HW = 570, HH = 235;
  const ROWS = [['except ValidationError', 170], ['except PaymentError', 205], ['except Exception', 240]];
  function handler(o) { o = o || {};
    el('rect', { x: HX, y: HY, width: HW, height: HH, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(HX + 16, HY + 25, 'handle_order(ch, method, …)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    pill(842, HY + 21, 'delivery_tag=1', INK, o.tag ?? 1, { fs: 13.5, mono: true }); }
  function boxes(st) { [['① 스키마 검증', 520, 140], ['② charge()', 680, 120], ['③ basic_ack', 840, 130]].forEach(([s, x, w], i) => {
      const m = st[i] || {}; card(x, 105, w, 40, { rx: 8, text: s, fs: 14.5, stroke: m.col || GRID, color: m.col || INK, sw: m.col ? 2.5 : 1.5, s: m.s ?? 1, op: m.op ?? 1 }); });
    el('line', { x1: 590, y1: 105, x2: 620, y2: 105, stroke: GRID, 'stroke-width': 2 }); el('line', { x1: 740, y1: 105, x2: 775, y2: 105, stroke: GRID, 'stroke-width': 2 }); }
  function nackPill(s, txt, col) { return pill(800, 205, txt || 'basic_nack(requeue=False)', col || WARN, s, { fs: 13.5, mono: true }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 4) { // 금지 패턴: requeue=True 는 같은 메시지를 바로 되돌린다
      tube(40, 110, 300, 'orders.queue', [{ t: '#42', col: BAD }, { t: '#43', col: OFF }, { t: '#44', col: OFF }, { t: '#45', col: OFF }], { slots: 5 });
      sub(190, 160, '#43 · #44 · #45 차례가 오지 않는다', fade(u, 1.6), { 'font-weight': 700, fill: MUT });
      card(640, 110, 230, 56, { rx: 10, text: 'process(body) 실패', fs: 15, stroke: BAD, color: BAD, sw: 2.5 });
      wire([[340, 98], [525, 98]], E(u, 0.2, 0.7), INK); wire([[525, 124], [340, 124]], E(u, 0.6, 1.1), BAD);
      sub(432, 82, '배달', fade(u, 0.4), { 'font-weight': 700, fill: INK }); sub(432, 146, 'requeue=True', fade(u, 0.9), { class: 'mono', 'font-weight': 700, fill: BAD });
      if (u > 1.1) for (let i = 0; i < 3; i++) dot([[300, 98], [525, 98], [525, 124], [300, 124], [300, 98]], ((t * 0.9 + i / 3) % 1), BAD, 6);
      pill(640, 170, 'redelivered=True', BAD, pop(u, 1.3), { fs: 13.5, mono: true });
      xchg(800, 330, 'dlx.exchange', { type: 'direct', col: OFF, fill: SOFT, op: 0.6 }); cross(800, 330, 16, pop(u, 1.8));
      sub(800, 380, 'DLX로 가지 않는다', fade(u, 1.9), { 'font-weight': 700, fill: BAD, 'font-size': 15 });
      card(300, 320, 400, 64, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 2.1), fill: BADBG });
      tx(120, 316, '고칠 수 없는 메시지가 같은 큐를', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
      tx(120, 338, '계속 돌며 컨슈머를 붙잡는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    const delivered = k >= 1 || u > 0.8, gone = (k === 1 && u > 1.8) || k >= 2 && (k > 2 || u > 1.6);
    tube(40, 100, 300, 'orders.queue', gone ? [] : [{ t: '#42', col: delivered ? WARN : ACC, dash: delivered ? '4 3' : null }], { slots: 5 });
    sub(190, 150, delivered && !gone ? 'unacked · 판정 대기' : gone ? '큐에서 빠짐' : 'ready 1', 1, { 'font-weight': 700, fill: delivered && !gone ? WARN : MUT });
    handler({ tag: k === 0 ? pop(u, 0.9) : 1 });
    tok(400, 105, '#42', { col: k >= 2 ? BAD : WARN, op: k === 0 ? fade(u, 0.8, 0.1) : gone ? 0.25 : 1 });
    if (k === 0 && u < 0.8) { const [x, y] = at([[265, 60], [400, 60], [400, 105]], E(u, 0.2, 0.8)); tok(x, y, '#42', { col: WARN }); }
    const st = k === 0 ? [{ col: u > 1.3 ? ACC : null }, { col: u > 1.9 ? ACC : null }]
      : k === 1 ? [{ col: GOOD }, { col: GOOD }, { col: GOOD, s: pop(u, 0.3) }]
      : k === 2 ? [{ col: BAD }, { op: 0.4 }, { op: 0.4 }] : [{ op: 0.5 }, { op: 0.5 }, { op: 0.5 }];
    boxes(st);
    if (k === 0) { sub(560, 155, 'try:', fade(u, 1.0), { class: 'mono', 'font-weight': 700, fill: ACC, 'font-size': 15 }); return; }
    if (k === 1) { if (u > 0.5 && u < 1.8) { const [x, y] = at([[840, 85], [840, 20], [170, 20], [170, 78]], E(u, 0.5, 1.8)); tok(x, y, 'basic_ack', { col: GOOD }); }
      sub(645, 300, '예외 없이 끝나면 Step 1과 같은 정상 경로', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // 예외 분기들 → 하나의 nack
    ROWS.forEach(([s, y], i) => { const on = k === 2 ? i === 0 : true, a = k === 2 ? (i === 0 ? fade(u, 0.2) : 0.35) : k === 3 ? fade(u, 0.2 + i * 0.4) : 1;
      mono(380, y + 5, s, { 'font-size': 14, 'font-weight': 700, fill: on ? BAD : MUT, opacity: a });
      if (on) wire([[575, y], [683, 205]], k === 2 ? E(u, 0.5, 1.0) : k === 3 ? E(u, 0.4 + i * 0.4, 0.9 + i * 0.4) : 1, BAD); });
    if (k === 2) cross(588, 84, 9, pop(u, 0.3));
    nackPill(k === 2 ? pop(u, 0.9) : 1);
    xchg(800, 345, 'dlx.exchange', { type: 'direct', col: WARN, fill: WARNBG, s: k === 2 ? pop(u, 1.3) : 1 });
    wire([[800, 220], [800, 318]], k === 2 ? E(u, 1.2, 1.7) : 1, WARN);
    if (k === 2 && u > 1.4 && u < 2.3) { const [x, y] = at([[800, 225], [800, 318]], E(u, 1.4, 2.3)); tok(x - 50, y, '#42', { col: BAD }); }
    if (k === 2) { sub(230, 340, '깨진 JSON은 몇 번 다시 넣어도 깨진 채다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    pill(230, 340, '재시도는 III-1-4 (DLX + TTL)', INFO, pop(u, 1.8), { fs: 14.5 }); }

  // ---------- 3. DLX 로 라우팅 ----------
  const TR = [['rejected', 215, 'nack'], ['expired · 60s', 345, 'ttl'], ['maxlen · 10000', 485, 'len']];
  function s3(t, c) { const { k, u } = c, b = c.beat;
    xchg(100, 110, 'orders', { type: 'direct', s: k === 0 ? pop(u, 0.3) : 1 });
    xchg(560, 300, 'dlx.exchange', { type: 'direct', col: WARN, fill: WARNBG, s: k === 0 ? pop(u, 0.8) : 1 });
    if (k === 0) { sub(140, 160, 'durable · auto_delete=false', fade(u, 0.6), { class: 'mono' }); sub(560, 350, 'type도 그냥 direct', fade(u, 1.2), { 'font-weight': 700, fill: WARN });
      sub(330, 220, '정의 파일 한 장이 라우팅 구조 전체를 다시 만든다', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    tube(200, 110, 260, 'orders.queue', [], { grow: k === 1 ? E(u, 0.1, 0.5) : 1 });
    // 죽는 사유 세 가지 → dlx.exchange
    TR.forEach(([s, x, kind], i) => { const a = k === 1 ? 0.5 + i * 0.45 : -1, sc = k === 1 ? pop(u, a) : 1, op = k >= 3 ? 0.45 : 1;
      if (kind === 'nack') cross(x, 190, 9, sc * op);
      if (kind === 'ttl') { if (sc > 0.05) clock(x, 190, 12 * sc, 1, WARN); }
      if (kind === 'len') { el('rect', { x: x - 22, y: 183, width: 44 * sc, height: 14, rx: 3, fill: INFO, opacity: op }); }
      pill(x, 225, s, REASON[s.split(' ')[0]], sc, { fs: 13.5, mono: true, op });
      wire([[x, 242], [520 + i * 12, 280]], k === 1 ? E(u, a + 0.2, a + 0.7) : 1, OFF, { dash: '5 5', op }); });
    // dlq.orders + 7일 TTL
    const dg = k === 2 ? E(u, 0.2, 0.8) : k >= 2 ? 1 : 0;
    const items = k >= 4 ? dlqItems(b).map((it, i) => Object.assign(it, { s: k === 4 ? pop(u, 0.4 + i * 0.35) : 1 })) : [];
    tube(660, 300, 260, 'dlq.orders', items, { grow: dg });
    if (dg >= 1) { mono(920, 268, '7일 = 604800000ms', { 'font-size': 13.5, 'text-anchor': 'end', fill: WARN, opacity: k === 2 ? fade(u, 0.9) : 1 });
      if (k === 2) { clock(880, 220, 18, E(u, 1.0, 2.4), WARN); sub(760, 226, 'DLQ도 평범한 큐', fade(u, 1.5), { 'font-weight': 700, fill: INK }); } }
    if (k < 3) return;
    // 바인딩 두 줄
    el('line', { x1: 166, y1: 110, x2: 200, y2: 110, stroke: INFO, 'stroke-width': 2.5 }); mono(183, 152, 'order.created', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.2) : 1 });
    el('line', { x1: 626, y1: 300, x2: 660, y2: 300, stroke: WARN, 'stroke-width': 2.5 }); mono(643, 342, 'orders.dead', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.5) : 1 });
    if (k === 3) { const P = [[460, 110], [560, 110], [560, 275]], Q = [[626, 300], [880, 300]];
      wire(P, E(u, 0.6, 1.2), WARN, { dash: '6 5' });
      if (u > 0.8 && u < 1.6) { const [x, y] = at(P, E(u, 0.8, 1.6)); tok(x - 90, y, 'rk: order.created', { col: INFO }); }
      if (u >= 1.6 && u < 2.5) { const [x, y] = at(Q, E(u, 1.6, 2.5)); tok(x, y, 'rk: orders.dead', { col: WARN }); }
      sub(330, 380, 'DLX를 지날 때 routing key가 바뀐다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    // 범례
    [['rejected', BAD], ['expired', WARN], ['maxlen', INFO]].forEach(([s, col], i) => { el('rect', { x: 662 + i * 92, y: 362, width: 12, height: 12, rx: 2, fill: col }); mono(680 + i * 92, 373, s, { 'font-size': 13.5, fill: MUT }); });
    if (k === 4) { const m = (b.dlqState.messages || [])[0] || {};
      const rows = [['reason', m.reason], ['count', String(m.count)], ['queue', m.queue], ['time', m.time], ['exchange', 'orders'], ['routing-keys', '[order.created]']];
      el('rect', { x: 600, y: 24, width: 330, height: 200, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.4) });
      mono(616, 48, `x-death  (${m.id})`, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) });
      rows.forEach(([kk, v], i) => { const op = fade(u, 1.5 + i * 0.15), y = 76 + i * 26;
        mono(616, y, kk, { 'font-size': 14, fill: MUT, opacity: op }); mono(740, y, v, { 'font-size': 14, 'font-weight': 700, fill: kk === 'reason' ? BAD : INK, opacity: op }); });
      return; }
    // 5: 알람 임계값
    const n = Math.round(tween(c.prev && c.prev.dlqState ? c.prev.dlqState.messages.length : 0, b.dlqState.messages.length, u));
    mono(790, 400, `messages_ready = ${n}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN });
    [['> 0', 'Slack 경보', WARN], ['> 100', 'PagerDuty', BAD], ['> 1000', '서비스 정지 검토', BAD]].forEach(([th, who, col], i) => {
      const y = 50 + i * 58, s = pop(u, 0.3 + i * 0.35), hot = i === 0;
      card(765, y, 330, 46, { rx: 10, stroke: hot ? col : GRID, sw: hot ? 2.5 : 1.5, s, fill: hot ? WARNBG : PANEL });
      mono(616, y + 5, th, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.35) });
      tx(700, y + 5, who, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.35) }); });
    R.banner(765, 228, '지금 3건 → Slack 단계', pop(u, 1.8)); }

  // ---------- 4. DLQ 재처리 스크립트 ----------
  function top4(c, o) { o = o || {}; const b = c.beat, p = c.prev || b;
    const items = dlqItems(b).map((it, i) => Object.assign(it, (o.mark && o.mark(i)) || {}));
    tube(30, 90, 300, 'dlq.orders', items, { slots: 4 });
    const n = tween(p.dlqState.messages.length, b.dlqState.messages.length, c.u);
    mono(330, 140, `${Math.round(n)}건`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: WARN });
    card(470, 90, 150, 52, { rx: 10, text: 'republish.py', fs: 15, mono: true, stroke: INK, sw: 2.2 });
    xchg(680, 90, 'orders', { type: 'direct' });
    tube(790, 90, 150, 'orders.queue', o.q || [], { slots: 2 });
    el('line', { x1: 746, y1: 90, x2: 790, y2: 90, stroke: INFO, 'stroke-width': 2.5 }); }
  function s4(t, c) { const { k, u } = c, b = c.beat, msgs = b.dlqState.messages;
    if (k === 0) { top4(c);
      const L = ['$ python republish.py --queue dlq.orders \\', '    --target orders --routing-key order.created \\', '    --max 100 --filter rejected --max-retry 3 --dry-run'];
      terminal(30, 180, 610, 140, L, lerp(0, 3, E(u, 0.2, 2.0)), { title: 'bash', fs: 14 });
      [['--queue · --target', '어디서 어디로'], ['--filter · --max-retry', '무엇을, 몇 번까지'], ['--dry-run', '옮기기 전에 보기']].forEach(([a, bb], i) => {
        const y = 200 + i * 56, s = pop(u, 0.9 + i * 0.4); card(800, y, 250, 50, { rx: 8, stroke: GRID, sw: 1.5, s });
        mono(688, y - 4, a, { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0 + i * 0.4) }); tx(688, y + 17, bb, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0 + i * 0.4) }); });
      return; }
    if (k === 1) { top4(c);
      pill(470, 140, 'confirm_delivery()', INFO, pop(u, 0.2), { fs: 13.5, mono: true });
      fly(545, 70, 614, 70, seg(u, 0.5, 1.2), 'publish', { fill: ACC, mono: true });
      fly(614, 112, 545, 112, seg(u, 1.4, 2.1), 'confirm', { fill: INFO, mono: true });
      [[false, '확인 없이 DLQ에서 ack', '브로커가 못 받았으면 메시지는 어디에도 없다'], [true, '브로커가 받았다고 확인한 뒤 ack', '실패하면 DLQ에 그대로 남는다']].forEach(([ok, a, bb], i) => {
        const y = 240 + i * 74, s = pop(u, 1.6 + i * 0.4); card(480, y, 760, 60, { rx: 10, stroke: ok ? GOOD : BAD, sw: 2, s, fill: ok ? GOODBG : BADBG });
        (ok ? check : cross)(130, y, 11, s); tx(160, y - 4, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7 + i * 0.4) });
        tx(160, y + 18, bb, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.7 + i * 0.4) }); }); return; }
    if (k === 2) { top4(c, { mark: (i) => i === 0 ? { dash: '4 3', op: 1 - 0.6 * seg(u, 0.4, 0.8) } : null });
      wire([[330, 90], [395, 90]], E(u, 0.1, 0.4), INK); fly(300, 60, 430, 60, seg(u, 0.4, 1.1), '#42', { fill: BAD, mono: true, stay: true });
      sub(180, 156, 'auto_ack=False · 판정 전까지 큐에 남는다', fade(u, 1.0), { 'font-weight': 700, fill: WARN });
      const m = msgs[0]; if (u > 1.2) kvTable(330, 190, 300, [['reason', m.reason, { hot: true }], ['count', String(m.count)], ['queue', m.queue]], { title: 'properties.headers["x-death"][0]', kw: 130 });
      return; }
    if (k === 3) { top4(c);
      pill(480, 190, 'reason == "rejected"  ·  count < 3', INK, pop(u, 0.2), { fs: 14, mono: true });
      msgs.forEach((m, i) => { const x = 250 + i * 230, y = 300, ok = m.reason === 'rejected' && m.count < 3, s = pop(u, 0.6 + i * 0.4);
        card(x, y, 190, 62, { rx: 10, stroke: REASON[m.reason], sw: 2, s });
        mono(x, y - 6, m.id, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.7 + i * 0.4) });
        mono(x, y + 16, `${m.reason} · count ${m.count}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: REASON[m.reason], opacity: fade(u, 0.7 + i * 0.4) });
        wire([[480, 210], [x, y - 34]], E(u, 0.6 + i * 0.4, 1.0 + i * 0.4), OFF);
        (ok ? check : cross)(x + 78, y - 26, 10, pop(u, 1.4 + i * 0.3));
        sub(x, y + 54, ok ? '재발행 대상' : '사유가 달라 건너뜀', fade(u, 1.5 + i * 0.3), { 'font-weight': 700, fill: ok ? GOOD : MUT }); });
      return; }
    if (k === 4) { top4(c);
      const box = (x, title, seq, ok, a) => { el('rect', { x, y: 170, width: 420, height: 150, rx: 10, fill: ok ? GOODBG : BADBG, stroke: ok ? GOOD : BAD, 'stroke-width': 2, opacity: fade(u, a) });
        tx(x + 16, 196, title, { 'font-size': 15, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: fade(u, a) });
        seq.forEach((s, i) => tok(x + 46 + i * 66, 240, s, { col: ok ? GOOD : BAD, s: pop(u, a + 0.2 + i * 0.18) })); };
      box(40, '바로 nack(requeue=True) 하면', ['#42', '#42', '#42', '#42', '#42'], false, 0.2);
      sub(250, 290, '맨 앞으로 돌아와 같은 것만 다시 꺼낸다', fade(u, 1.2), { 'font-weight': 700, fill: BAD });
      box(500, '끝까지 잡아 두면', ['#42', '#77', '#99'], true, 0.9);
      sub(710, 290, '루프 끝: nack(delivery_tag=0, multiple=True)', fade(u, 1.9), { class: 'mono', 'font-weight': 700, fill: GOOD });
      mono(40, 370, '[dry] would republish: order-42', { 'font-size': 14.5, 'font-weight': 700, fill: INK, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { top4(c, { mark: (i) => i === 0 ? { dash: '4 3' } : null, q: u > 2.2 ? [{ t: '#42', col: ACC, s: pop(u, 2.2) }] : [] });
      const P = [[470, 62], [470, 28], [860, 28], [860, 62]];
      if (u > 0.3 && u < 2.2) { const [x, y] = at(P, E(u, 0.3, 2.2)); tok(x, y, '#42 + x-death', { col: ACC }); }
      pill(680, 150, 'mandatory=True', INK, pop(u, 0.8), { fs: 13.5, mono: true });
      wire([[640, 170], [640, 200], [470, 200], [470, 120]], E(u, 1.2, 1.9), BAD, { dash: '5 5', op: 0.7 });
      sub(560, 222, '경로가 없으면 basic.return으로 알려 준다', fade(u, 1.6), { 'font-weight': 700, fill: BAD });
      card(480, 320, 760, 64, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 2.0), fill: WARNBG });
      tx(120, 314, 'properties=props로 헤더를 그대로 넘긴다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(120, 337, 'RabbitMQ 4.x는 재발행된 x-death를 이어 세지 않는다. 횟수는 별도 헤더로 센다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 6) { top4(c, { q: [{ t: '#42', col: ACC }] });
      fly(614, 112, 545, 112, seg(u, 0.2, 0.9), 'confirm', { fill: INFO, mono: true });
      fly(400, 60, 300, 60, seg(u, 1.0, 1.7), 'basic_ack', { fill: GOOD, mono: true });
      terminal(30, 200, 640, 90, ['[done] moved 1 messages from dlq.orders → orders'], u > 1.8 ? E(u, 1.8, 2.5) : 0, { title: 'bash', fs: 14 });
      [['재발행 성공', 'ack → DLQ에서 빠짐', GOOD], ['재발행 실패', '잡아 둔 뒤 DLQ로 되돌림', WARN]].forEach(([a, bb, col], i) => { const y = 240 + i * 60, s = pop(u, 0.6 + i * 0.3);
        card(810, y, 250, 50, { rx: 10, stroke: col, sw: 2, s }); tx(700, y - 3, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.7 + i * 0.3) }); tx(700, y + 17, bb, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.7 + i * 0.3) }); });
      return; }
    // 7: 작게 시작
    top4(c);
    [['--max 10', 1], ['--max 100', 2], ['--max 1000', 3]].forEach(([s, h], i) => { const x = 120 + i * 150, H = 46 * h * E(u, 0.2 + i * 0.4, 0.8 + i * 0.4);
      el('rect', { x: x - 50, y: 380 - H, width: 100, height: H, rx: 6, fill: ACC, opacity: 0.25 + 0.25 * h });
      mono(x, 400, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) }); });
    tx(70, 200, 'dry-run으로 보고, 조금씩 늘린다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
    ['--filter rejected', '--filter expired', '--filter maxlen'].forEach((s, i) => { const col = REASON[s.split(' ')[1]];
      pill(770, 220 + i * 52, s, col, pop(u, 1.4 + i * 0.3), { fs: 14, mono: true }); });
    sub(770, 380, '사유마다 따로 돌린다', fade(u, 2.3), { 'font-weight': 700, fill: INK, 'font-size': 15 }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'basic_ack를 보내기 전, 컨슈머가 받은 메시지는 큐에서 어떤 상태인가?',
      o: ['이미 큐에서 지워졌다', 'DLX로 넘어가 대기한다', 'unacked 상태로 큐에 남아 있다'], a: 2,
      why: 'auto_ack=False면 ack가 올 때까지 메시지는 unacked로 남는다. ack를 받아야 브로커가 지운다.' },
    { q: '스키마가 깨진 메시지에 basic_nack(requeue=False)를 보내면 무슨 일이 일어나는가?',
      o: ['큐의 x-dead-letter-exchange가 가리키는 dlx.exchange로 넘어간다', '같은 큐 맨 앞으로 돌아와 다시 배달된다', '컨슈머가 다시 시작될 때까지 unacked로 남는다'], a: 0,
      why: 'requeue=False여야 브로커가 메시지를 죽은 것으로 보고 DLX로 보낸다. requeue=True면 같은 큐로 돌아와 또 실패한다.' },
    { q: 'nack된 주문이 dlq.orders로 갈 때 쓰이는 routing key는 무엇인가?',
      o: ['원래 키 order.created', 'x-dead-letter-routing-key에 적은 orders.dead', '큐 이름 orders.queue'], a: 1,
      why: '큐에 x-dead-letter-routing-key가 있으면 원래 키를 그 값으로 바꿔 DLX에 보낸다. 그래서 DLQ 바인딩 키도 orders.dead다.' },
    { q: 'republish.py가 DLQ 메시지를 ack하는 시점은 언제인가?',
      o: ['basic_get으로 꺼낸 직후', 'dry-run 출력을 마친 직후', '원래 exchange로 재발행한 것이 브로커에 확인된 뒤'], a: 2,
      why: 'confirm_delivery를 켠 채널에서 재발행이 확인된 뒤에만 ack한다. 먼저 ack하면 재발행이 실패했을 때 메시지를 잃는다.' },
  ];

  const summary = [
    'DLX는 전용 타입이 아니다. 큐 인자 x-dead-letter-exchange가 평범한 exchange를 가리킬 뿐이다.',
    '고칠 수 없는 실패는 nack(requeue=False)로 넘긴다. requeue=True면 같은 메시지가 큐를 계속 돈다.',
    '죽은 메시지는 x-death에 사유, 횟수, 원래 큐를 달고 orders.dead 키로 dlq.orders에 쌓인다.',
    'DLQ에는 건수 알람을 걸고, 재처리는 dry-run과 publisher confirm을 거친 스크립트로 한다.',
  ];
  const review = [
    { q: '주문 큐에 x-dead-letter-exchange를 걸었는데 nack한 메시지가 dlq.orders에 없다. 먼저 의심할 것은?',
      o: ['컨슈머 prefetch가 10이라서', 'dlx.exchange에서 dlq.orders로 가는 바인딩 키가 orders.dead와 다르다', '메시지를 durable 큐에 넣지 않아서'], a: 1,
      why: 'DLX도 평범한 exchange라 맞는 바인딩이 없으면 메시지를 버린다. DLQ 바인딩 키를 x-dead-letter-routing-key 값에 맞춰야 한다.' },
    { q: '스키마 검증 실패로 nack된 주문을 코드 수정 뒤 되살리려 한다. republish.py에 줄 --filter 값은?',
      o: ['rejected', 'expired', 'maxlen'], a: 0,
      why: 'nack(requeue=False)로 죽은 메시지는 x-death reason이 rejected로 남는다. expired는 TTL 만료, maxlen은 길이 초과 때 붙는다.' },
    { q: 'confirm 없이 재처리 스크립트를 돌렸더니 DLQ에서도 orders.queue에서도 사라진 주문이 생겼다. 원인으로 가장 그럴듯한 것은?',
      o: ['x-death 헤더를 그대로 넘겨서', 'dry-run을 켜고 돌려서', '브로커가 받았는지 확인하지 않고 DLQ에서 ack해서'], a: 2,
      why: '재발행이 브로커에 닿지 못했는데 DLQ에서 ack하면 메시지는 어디에도 남지 않는다. confirm을 받은 뒤 ack해야 한다.' },
  ];

  R.page({ title: 'DLX로 죽은 메시지 격리하기', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
