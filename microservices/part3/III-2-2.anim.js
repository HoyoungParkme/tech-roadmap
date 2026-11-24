/* III-2-2 CQRS — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, browser, cross, check, lock, clock, meters, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function svc(cx, cy, name, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.01) return;
    card(cx, cy, o.w || 150, o.h || 44, { rx: 9, stroke: o.stroke || INK, fill: o.fill, sw: 2.2, text: name, fs: o.fs || 15, fw: 700, mono: true, color: o.color || o.stroke || INK, s, op: o.op }); }
  function db(cx, cy, name, o) { o = o || {}; const s = o.s ?? 0.6;
    dbIcon(cx, cy, null, { s, stroke: o.stroke, op: o.op });
    if (name) mono(cx, cy + 46 * s + 18, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: o.stroke || INK, opacity: o.op ?? 1 }); }
  const tcard = (cx, cy, name, o) => card(cx, cy, (o && o.w) || 150, 40, Object.assign({ rx: 6, text: name, fs: 14.5, mono: true, stroke: GRID, sw: 1.8 }, o || {}));
  // 커넥션 풀 칸
  function pool(x, y, n, per, col, u0) { for (let i = 0; i < n; i++) { const r = Math.floor(i / per), cI = i % per;
    el('rect', { x: x + cI * 18, y: y + r * 18, width: 14, height: 14, rx: 3, fill: col, opacity: clamp(u0 * n - i) }); } }

  // ---------- 1. 한 모델로 읽기·쓰기 ----------
  const T1 = { orders: [390, 100], order_items: [570, 100], users: [390, 180], products: [570, 180] };
  function gauges(c) { const b = c.beat, p = c.prev || {};
    const w = tween(p.writeQps, b.writeQps, c.u), r = tween(p.readQps, b.readQps, c.u), l = tween(p.readLatency, b.readLatency, c.u);
    meters(150, 318, 660, [{ name: '쓰기 QPS', val: Math.round(w).toLocaleString('en-US') }, { name: '읽기 QPS', val: Math.round(r).toLocaleString('en-US'), bar: r / 120 },
      { name: '읽기 P95', val: Math.round(l) + 'ms', hot: l >= 300, bar: l / 10 }]); }
  function s1(t, c) { const { k, u } = c;
    const hot = k >= 3;
    zone(300, 36, 360, 194, 'orders DB (정규화 모델 하나)', { fill: SOFT, stroke: hot ? BAD : GRID, sw: hot ? 2.5 : 1.5 });
    Object.entries(T1).forEach(([n, [x, y]]) => tcard(x, y, n, { stroke: hot && (k !== 4 || n === 'order_items') ? BAD : GRID }));
    svc(140, 140, 'create()', { w: 140, stroke: GOOD });
    [['① 목록', 80], ['② 대시보드', 150], ['③ 매출 집계', 220]].forEach(([n, y], i) => svc(840, y, n, { w: 150, s: k === 0 ? 0 : i === 0 ? (k === 1 ? pop(u, 0.2) : 1) : i === 1 ? (k < 2 ? 0 : k === 2 ? pop(u, 0.2) : 1) : (k < 4 ? 0 : k === 4 ? pop(u, 0.2) : 1) }));
    // 쓰기 흐름
    const wStall = k === 3 || k === 4 || k === 5;
    for (let i = 0; i < 3; i++) dot([[210, 140], [314, 100], [490, 100]], wStall ? Math.min(((t * 0.6 + i / 3) % 1), 0.45) : ((t * 0.6 + i / 3) % 1), GOOD, 5);
    if (k === 0) { el('rect', { x: 312, y: 76, width: 336, height: 48, rx: 8, fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.6) });
      mono(140, 190, 'order + items · 한 TX', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.8) }); }
    if (k === 1) { grow(765, 80, 466, 100, E(u, 0.4, 1.0), ACC); mono(480, 262, 'WHERE user_id = ? (인덱스)', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.0) }); }
    if (k === 2 || k === 3) { const f = k === 2 ? E(u, 0.4, 1.6) : 1;
      [[[465, 100], [495, 100]], [[390, 120], [390, 160]], [[570, 120], [570, 160]]].forEach(([a, b], i) => grow(a[0], a[1], lerp(a[0], b[0], f), lerp(a[1], b[1], f), 1, k === 3 ? BAD : WARN, { plain: true, sw: 3 }));
      grow(765, 150, 662, 150, k === 2 ? E(u, 0.2, 0.5) : 1, k === 3 ? BAD : WARN);
      if (k === 2) mono(480, 270, '4-way JOIN', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      if (k === 3) mono(140, 240, '쓰기 대기', { 'font-size': 14.5, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.0) }); }
    if (k === 4) { const y = lerp(80, 120, (t * 1.2) % 1); el('line', { x1: 497, y1: y, x2: 643, y2: y, stroke: BAD, 'stroke-width': 3 });
      grow(765, 220, 662, 120, E(u, 0.2, 0.6), BAD); mono(480, 270, 'GROUP BY · 전체 스캔', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); }
    if (k === 5) {
      ['idx', 'idx', 'idx'].forEach((s, i) => pill(258 - i * 0, 260 - i * 28, s + (i + 1), WARN, pop(u, 0.2 + i * 0.25), { mono: true, fs: 13.5, fill: PANEL }));
      mono(140, 240, '인덱스 ↑ 쓰기 ↓', { 'font-size': 14.5, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(840, 280, '뷰 → 트리거 비용', { 'font-size': 14.5, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.4) }); }
    gauges(c); }

  // ---------- 2. Command / Query 코드 분리 ----------
  function s2(t, c) { const { k, u } = c, LX = 230, RX = 730;
    db(480, 320, 'orders DB (아직 하나)', {});
    const split = k === 0 ? 0 : k === 1 ? E(u, 0.4, 1.6) : 1;
    if (split < 0.02) svc(480, 90, 'OrderService', { w: 220 });
    else { svc(lerp(480, LX, split), 90, 'CreateOrderHandler', { w: 230, stroke: GOOD, op: 1 }); svc(lerp(480, RX, split), 90, 'OrderQueries', { w: 230, stroke: INFO }); }
    if (k === 0) { card(LX, 200, 260, 96, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 0.3) });
      mono(LX - 115, 172, 'CreateOrderCommand', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.5) });
      ['user_id: str', 'items:   list'].forEach((s, i) => mono(LX - 105, 202 + i * 24, s, { 'font-size': 14, opacity: fade(u, 0.8 + i * 0.3) }));
      sub(700, 200, '무엇을 시키는지만 담는다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { if (split > 0.9) { grow(LX, 112, 430, 285, 1, GOOD, { plain: true }); grow(RX, 112, 530, 285, 1, INFO, { plain: true }); }
      sub(480, 200, '핸들러 하나 = 유스케이스 하나', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    grow(LX, 112, 430, 285, 1, GRID, { plain: true }); grow(RX, 112, 530, 285, 1, GRID, { plain: true });
    if (k === 2) { const st = [['add(order)', 0.2], ['flush() → id', 0.6], ['add(items)', 1.0], ['commit()', 1.4]];
      st.forEach(([s, a], i) => pill(LX, 150 + i * 36, s, GOOD, pop(u, a), { mono: true, fs: 13.5, fill: PANEL }));
      dot([[LX + 60, 260], [440, 300]], seg(u, 1.6, 2.2), GOOD, 7); sub(RX, 200, '쓰기는 여전히 ORM', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { const ent = ['id', 'user_id', 'status', 'created_at', 'items', '…'], dto = ['order_id', 'created_at', 'user_name', 'total'];
      card(LX + 20, 230, 200, 170, { rx: 10, stroke: GRID, sw: 1.6, s: pop(u, 0.2) }); mono(LX - 70, 162, 'Order 엔티티', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.3) });
      ent.forEach((f, i) => mono(LX - 60, 188 + i * 22, f, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) }));
      card(RX, 230, 220, 130, { rx: 10, stroke: INFO, sw: 2, fill: INFOBG, s: pop(u, 0.9) }); mono(RX - 95, 182, 'OrderListItem', { 'font-size': 14.5, fill: INFO, 'font-weight': 800, opacity: fade(u, 1.0) });
      dto.forEach((f, i) => mono(RX - 85, 210 + i * 24, f, { 'font-size': 14, opacity: fade(u, 1.1 + i * 0.2) }));
      sub(480, 400, '화면에 필요한 4개 필드만 · frozen', fade(u, 2.0), { 'font-weight': 700, fill: INFO }); return; }
    if (k === 4) { const n = 6, col = E(u, 1.2, 1.8);
      for (let i = 0; i < n; i++) { const y = 150 + i * 18, x2 = lerp(RX - 30 + i * 8, 530, 1); el('line', { x1: RX - 60 + i * 12, y1: 112, x2: 520 + i * 6, y2: 285, stroke: WARN, 'stroke-width': 1.6, opacity: (1 - col) * fade(u, 0.2 + i * 0.08) }); }
      mono(RX + 40, 170, '1 + N 쿼리', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: (1 - col) * fade(u, 0.4) });
      if (col > 0) { grow(RX, 112, 530, 285, col, INFO, { sw: 4 }); mono(RX + 30, 190, 'raw SQL 한 번', { 'font-size': 14.5, fill: INFO, 'font-weight': 800, opacity: col }); }
      sub(RX, 400, 'JOIN 과 집계를 직접 쓰고 실행 계획을 통제한다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    const N = 12; for (let i = 0; i < N; i++) { const keep = i < 6, y = 140 + i * 13, x = 620;
      el('rect', { x, y, width: 220, height: 9, rx: 2, fill: keep ? INFO : OFF, opacity: fade(u, 0.2 + i * 0.03) * (keep ? 1 : 1 - E(u, 1.0, 1.6) * 0.7) }); }
    el('line', { x1: 610, y1: 216, x2: 850, y2: 216, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.0) });
    mono(860, 221, 'LIMIT 100', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) });
    pill(RX - 160, 170, 'GROUP BY → total', INFO, pop(u, 0.4), { mono: true, fs: 13.5, fill: PANEL });
    pill(RX - 150, 240, 'list[OrderListItem]', INFO, pop(u, 1.7), { mono: true, fs: 13.5, fill: PANEL }); }

  // ---------- 3. Replica + Materialized View ----------
  function s3(t, c) { const { k, u } = c, PX = 190, QX = 620, DY = 250;
    db(PX, DY, 'primary', {}); db(QX, DY, 'replica', { stroke: INFO });
    el('line', { x1: PX + 40, y1: DY, x2: QX - 40, y2: DY, stroke: GRID, 'stroke-width': 3 }); mono((PX + QX) / 2, DY - 10, 'WAL 복제', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    for (let i = 0; i < 3; i++) dot([[PX + 40, DY], [QX - 40, DY]], (t * 0.5 + i / 3) % 1, INFO, 4);
    mono(PX - 80, 70, 'write_engine · pool 10', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: k === 0 ? fade(u, 0.2) : 1 });
    pool(PX - 80, 84, 10, 10, GOOD, k === 0 ? E(u, 0.4, 1.4) : 1);
    if (k >= 1) { mono(QX - 90, 50, 'read_engine · pool 40', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: k === 1 ? fade(u, 0.2) : 1 });
      pool(QX - 90, 64, 40, 10, INFO, k === 1 ? E(u, 0.3, 1.6) : 1);
      if (k === 1) { mono(480, 380, '읽기 QPS 12,000 ÷ 쓰기 1,500 = 8배', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; } }
    if (k === 0) { sub(PX, 140, '쓰기는 양보다 정합성', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    // MV: primary 에서 만들고 갱신, WAL 로 replica 에 그대로 온다
    const cols = ['order_id', 'created_at', 'user_name', 'total'], mvA = k === 2 ? E(u, 0.2, 0.8) : 1;
    el('rect', { x: QX + 70, y: 170, width: 240 * mvA, height: 150, rx: 8, fill: PANEL, stroke: INFO, 'stroke-width': 2 });
    mono(QX + 70, 162, 'mv_order_summary_7d', { 'font-size': 14, fill: INFO, 'font-weight': 800, opacity: mvA });
    cols.forEach((cn, i) => mono(QX + 96, 196 + i * 28, cn, { 'font-size': 14, opacity: k === 2 ? fade(u, 0.6 + i * 0.25) : 1, fill: INK }));
    if (k === 2) { sub(480, 395, 'SELECT 절이 곧 읽기 모델 · 7일치 요약을 미리 구워 둔다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { ['orders', 'order_items', 'users'].forEach((n, i) => { const y = 340 + i * 0; tcard(170 + i * 170, 380, n, { w: 140, s: 1, op: 1 - E(u, 1.2, 1.8) * 0.5 });
        grow(170 + i * 170, 360, QX + 180, 322, E(u, 0.3 + i * 0.2, 1.1 + i * 0.2), WARN, { plain: true }); });
      pill(QX + 210, 118, 'UNIQUE(order_id)', ACC, pop(u, 1.4), { mono: true, fs: 13.5, fill: PANEL });
      pill(QX + 210, 86, 'INDEX(created_at DESC)', ACC, pop(u, 1.8), { mono: true, fs: 13.5, fill: PANEL }); return; }
    if (k === 4) { clock(PX - 50, 150, 26, (t % 3) / 3, WARN, null); mono(PX - 14, 156, 'REFRESH … CONCURRENTLY · 1분마다', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.3) });
      for (let i = 0; i < 4; i++) dot([[930, 340], [QX + 340, 300]], (t * 0.7 + i / 4) % 1, INFO, 5);
      sub(QX + 200, 350, '갱신 중에도 조회는 막히지 않는다', fade(u, 1.0), { 'font-weight': 700, fill: INFO });
      sub(480, 400, '갱신 주기 = 데이터 신선도 · 최대 1분 늦다', fade(u, 1.8), { 'font-weight': 700, fill: WARN }); return; }
    const bars = [['읽기 P95', 850, 30, 'ms', 1000], ['primary CPU', 70, 25, '%', 100]];
    bars.forEach(([n, a, b, un, mx], i) => { const y = 350 + i * 34, v = tween(a, b, u, 1.4), W = 360;
      tx(150, y + 14, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end' });
      el('rect', { x: 160, y, width: W, height: 20, rx: 4, fill: SOFT }); el('rect', { x: 160, y, width: W * v / mx, height: 20, rx: 4, fill: v > a * 0.6 ? BAD : GOOD });
      mono(530, y + 15, Math.round(v) + un, { 'font-size': 15, 'font-weight': 800, fill: v > a * 0.6 ? BAD : GOOD }); });
    for (let i = 0; i < 3; i++) dot([[930, 330], [QX + 340, 290]], (t * 0.7 + i / 3) % 1, GOOD, 5); }

  // ---------- 4. Eventual Consistency ----------
  function timeline(u, o) { o = o || {}; const Y0 = 160;
    const ax = axes(110, Y0, 760, 0.0001, { x: [0, 400], y: [0, 1], xt: [0, 50, 100, 200, 300, 350, 400] });
    tx(905, Y0 + 20, 'ms', { 'font-size': 13.5, fill: MUT });
    const ev = [[0, 'POST /orders → 200', GOOD, 40], [50, 'GET → []', BAD, 72], [350, 'GET → [901]', GOOD, 104]];
    ev.forEach(([ms, s, col, ly], i) => { const a = o.all ? 1 : fade(u, 0.3 + i * 0.6), x = ax.X(ms);
      el('line', { x1: x, y1: Y0, x2: x, y2: ly + 6, stroke: col, 'stroke-width': 2.5, opacity: a }); el('circle', { cx: x, cy: Y0, r: 6, fill: col, opacity: a });
      mono(x + (i === 2 ? -8 : 8), ly, s, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': i === 2 ? 'end' : 'start', opacity: a }); });
    return ax; }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { const ax = timeline(u, { all: k === 1 });
      if (k === 0) { browser(300, 290, 220, 110, '방금 주문한 사용자', { s: pop(u, 0.3) }); mono(300, 300, u < 1.2 ? '' : u < 2.0 ? '주문 내역: 없음' : '주문 #901', { 'font-size': 15, 'font-weight': 700, fill: u < 2.0 ? BAD : GOOD, 'text-anchor': 'middle' });
        sub(680, 290, '버그가 아니라 구조적 특성', fade(u, 2.1), { 'font-weight': 700, fill: INK }); return; }
      el('rect', { x: ax.X(100), y: 122, width: ax.X(400) - ax.X(100), height: 30, fill: WARN, opacity: 0.25 * fade(u, 0.3) });
      mono(ax.X(100) + 8, 142, 'replica WAL 지연 100~500ms', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.4) });
      db(220, 300, 'primary', {}); db(520, 300, 'replica', { stroke: INFO }); grow(262, 300, 478, 300, E(u, 0.6, 1.6), WARN);
      clock(780, 290, 36, E(u, 1.2, 2.6), WARN, 'MV 60초마다'); return; }
    if (k === 2 || k === 3) { svc(130, 200, 'GET /my-orders', { w: 180 });
      card(370, 200, 170, 60, { rx: 10, stroke: ACC, sw: 2, text: 'recent_write?', fs: 15, mono: true, color: ACC, s: k === 2 ? pop(u, 0.2) : 1 });
      grow(220, 200, 282, 200, k === 2 ? E(u, 0.3, 0.6) : 1, INK);
      db(700, 110, 'write_engine (primary)', {}); db(700, 300, 'read_engine (replica)', { stroke: INFO });
      const yes = k === 3; grow(456, 190, 650, 120, k === 2 ? E(u, 0.8, 1.3) : 1, yes ? ACC : GRID); grow(456, 210, 650, 290, k === 2 ? E(u, 1.2, 1.7) : 1, yes ? GRID : INFO);
      mono(560, 140, 'True', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.1) : 1 }); mono(560, 272, 'False', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.5) : 1 });
      if (k === 2) { sub(370, 270, '최근 5초 안에 쓴 사용자만 True', fade(u, 1.9), { 'font-weight': 700, fill: ACC }); return; }
      dot([[220, 200], [370, 200], [650, 120]], seg(u, 0.2, 1.0), ACC, 7);
      const lag = tween(350, 0, u, 1.0), lat = tween(30, 120, u, 1.0);
      mono(860, 230, `복제 지연 ${Math.round(lag)}ms`, { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      mono(860, 258, `읽기 ${Math.round(lat)}ms`, { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      sub(480, 400, '일관성을 사는 값이 응답 시간 · 본인 데이터라 범위가 작다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { browser(300, 230, 300, 230, '프론트', {});
      const items = [['#901', 'PENDING', ACC], ['#880', 'SHIPPED', INK], ['#871', 'PAID', INK]];
      const ins = E(u, 1.0, 1.6);
      items.forEach(([id, st, col], i) => { const y = 168 + (i === 0 ? 0 : i * 44 + 0) + (i > 0 ? (1 - ins) * -44 : 0), op = i === 0 ? ins : 1;
        card(300, y, 260, 36, { rx: 6, stroke: col === ACC ? ACC : GRID, fill: col === ACC ? ACCBG : PANEL, sw: 1.6, op }); mono(190, y + 5, id, { 'font-size': 14, 'font-weight': 700, opacity: op, fill: col }); mono(400, y + 5, st, { 'font-size': 14, opacity: op, fill: col, 'text-anchor': 'end' }); });
      svc(760, 120, 'POST /orders', { w: 180 }); fly(760, 150, 330, 170, seg(u, 0.2, 1.0), '{id: 901, status: PENDING, …}', { mono: true });
      sub(760, 260, '응답에 새 객체를 통째로', fade(u, 0.4), { 'font-weight': 700, fill: INK }); sub(760, 286, '목록 재조회 없이 바로 끼워 넣는다', fade(u, 1.6)); return; }
    browser(230, 120, 280, 110, '방금 한 일 (내 주문)', { s: pop(u, 0.2) }); browser(230, 320, 280, 100, '통계 대시보드', { s: pop(u, 0.6) });
    db(700, 120, 'primary', {}); db(700, 320, 'replica + mv', { stroke: INFO });
    grow(374, 120, 650, 120, E(u, 0.4, 0.9), ACC); grow(374, 320, 650, 320, E(u, 0.8, 1.3), INFO);
    banner(480, 222, '90% 의 화면은 수백 ms 지연이 문제 되지 않는다', pop(u, 1.6)); }

  // ---------- 5. 함정과 단계별 도입 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { const good = k === 0, items = good ? ['읽기 QPS ≥ 쓰기의 10배', '같은 데이터를 여러 모양으로', '쓰기는 정규화, 읽기는 비정규화', '새 화면이 스키마를 흔들지 않게'] : ['단순 CRUD (관리자, 사내 도구)', '강한 일관성 필수 (잔액·재고)', '운영 인력이 부족한 초기 팀', '단일 DB 로 충분한 작은 트래픽'];
      lbl(480, 50, good ? 'CQRS 를 고려할 신호' : 'CQRS 를 하지 말 신호', fade(u, 0.1), { fill: good ? GOOD : BAD });
      items.forEach((s, i) => { const x = 250 + (i % 2) * 460, y = 130 + Math.floor(i / 2) * 110, sc = pop(u, 0.3 + i * 0.35);
        card(x, y, 420, 84, { rx: 12, stroke: good ? GOOD : BAD, sw: 2, fill: good ? GOODBG : BADBG, s: sc });
        (good ? check : cross)(x - 180, y, 12, sc); tx(x - 155, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.35) }); });
      sub(480, 380, good ? '요구가 정말 갈라졌는지 숫자로 먼저 확인한다' : '잔액·재고에 쓰면 성능 대신 사고를 얻는다', fade(u, 2.0), { 'font-weight': 700, fill: good ? GOOD : BAD }); return; }
    if (k === 2 || k === 3) { const S = [['1', 'Command/Query 핸들러 분리', '낮음', GOOD], ['2', 'Read Replica + 라우팅', '중간', GOOD], ['3', 'Materialized View', '중간', GOOD], ['4', '별도 read store (ES/Redis)', '높음', WARN], ['5', 'Outbox + 이벤트 동기화', '매우 높음', BAD]];
      const hs = [40, 70, 100, 170, 260];
      S.forEach(([n, d, cost, col], i) => { const show = i < 3 || k === 3, a = (k === 2 && i < 3) ? E(u, 0.2 + i * 0.35, 0.8 + i * 0.35) : (k === 3 && i >= 3) ? E(u, 0.2 + (i - 3) * 0.5, 0.9 + (i - 3) * 0.5) : 1;
        if (!show) return; const x = 70 + i * 172, h = hs[i] * a;
        el('rect', { x, y: 370 - h, width: 150, height: h, rx: 6, fill: col, opacity: 0.8 });
        mono(x + 75, 362 - h - 50, '단계 ' + n, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: a });
        tx(x + 75, 362 - h - 28, cost, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: a });
        tx(x + 75, 392, d.length > 14 ? d.slice(0, 14) + '…' : d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: a }); });
      if (k === 2) mono(480, 50, '여기까지: 응답 30ms · 대부분의 팀은 3단계에서 멈춘다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      else mono(480, 50, '검색·랭킹이 진짜 필요할 때만 4단계로', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 4) { db(200, 170, 'write DB', {}); card(560, 170, 200, 70, { rx: 10, stroke: INFO, sw: 2, text: 'read store', fs: 16, mono: true, color: INFO });
      const w = Math.round(tween(1000, 1003, u, 2.0)), r = u < 1.0 ? Math.round(tween(1000, 1003, u, 0.8)) : 1001;
      mono(200, 270, `주문 ${w.toLocaleString('en-US')}건`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
      mono(560, 240, `주문 ${r.toLocaleString('en-US')}건`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: u > 1.2 ? BAD : INFO });
      grow(250, 170, 458, 170, 1, GRID); if (u > 1.0) cross(354, 170, 12, pop(u, 1.0));
      mono(800, 170, '알람 없음', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(480, 316, '동기화가 깨진 것을 아무도 모른 채 틀린 값을 보여 준다 · 건수는 예시', fade(u, 1.8), { 'font-weight': 700, fill: BAD });
      [['유행 따라 도입', 230], ['지연을 UI 에서 설명 안 함', 480], ['write 까지 ES 로 바꾸다 멈춤', 750]].forEach(([s, x], i) => pill(x, 380, s, WARN, pop(u, 2.0 + i * 0.15), { fs: 13.5, fill: PANEL })); return; }
    // k === 5: 다음 장 — 서비스를 컨테이너로
    zone(80, 120, 800, 220, 'k8s 노드 (IV-1-1 에서)', { fill: SOFT, stroke: GRID, sw: 1.5, op: fade(u, 0.2) });
    [['command', 2, GOOD], ['query', 4, INFO], ['relay', 1, WARN]].forEach(([n, cnt, col], i) => { const x0 = 140 + i * 250;
      mono(x0, 180, n + '-service', { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.3) });
      for (let j = 0; j < cnt; j++) card(x0 + 24 + j * 52, 240, 44, 44, { rx: 6, stroke: col, sw: 2, fill: PANEL, s: pop(u, 0.6 + i * 0.3 + j * 0.12) }); });
    sub(480, 380, '읽기 쪽만 따로 늘릴 수 있다 · 컨테이너 수는 예시', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }

  const quiz = [
    { q: '주문 테이블 하나로 쓰기와 관리자 대시보드를 모두 처리할 때 생기는 일은 무엇인가?',
      o: ['4-way JOIN과 GROUP BY가 같은 DB 자원을 써서 쓰기까지 느려진다', '쓰기가 빨라지고 읽기만 느려진다', '인덱스를 추가하면 둘 다 빨라진다'], a: 0,
      why: '읽기 P95가 850ms까지 오르는 동안 같은 DB의 쓰기 트랜잭션도 기다린다. 인덱스를 더하면 이번엔 쓰기가 느려진다.' },
    { q: 'CQRS의 첫 단계로 같은 DB 위에서 할 수 있는 일은 무엇인가?',
      o: ['Kafka와 Elasticsearch를 먼저 들인다', 'Command 핸들러와 Query 핸들러를 코드에서 나눈다', '쓰기 모델을 이벤트 소싱으로 바꾼다'], a: 1,
      why: 'CQRS는 책임 분리부터다. 쓰기는 ORM으로, 읽기는 화면 모양의 DTO와 raw SQL로 각자 최적을 쓴다.' },
    { q: 'mv_order_summary_7d를 둔 뒤 읽기가 850ms에서 30ms로 줄어든 이유는 무엇인가?',
      o: ['replica의 CPU가 더 빨라서', 'write_engine 풀을 10으로 줄여서', '무거운 JOIN·GROUP BY를 뷰 갱신 때 한 번만 하고 조회는 정렬·LIMIT만 해서'], a: 2,
      why: '집계를 미리 구워 둔 역정규화 테이블을 읽기만 하므로 요청마다 JOIN이 사라진다. 대신 갱신 주기만큼 늦은 데이터를 본다.' },
    { q: '주문 직후 50ms에 목록을 조회하니 빈 배열이 왔다. 본인 화면에서만 고치는 패턴은 무엇인가?',
      o: ['최근에 쓴 사용자만 write_engine으로 읽는 RYOW', '모든 조회를 primary로 보낸다', 'MV 갱신 주기를 1초로 줄인다'], a: 0,
      why: '최근 5초 안에 쓴 사용자만 primary로 보내면 복제 지연은 0ms가 되고, primary 부하는 거의 늘지 않는다.' },
    { q: '다음 중 CQRS를 적용하지 않는 편이 나은 곳은 어디인가?',
      o: ['읽기가 쓰기의 10배 이상이고 화면 모양이 다양한 주문 조회', '즉시 반영돼야 하는 계좌 잔액', '검색·집계·시계열을 함께 보여 주는 대시보드'], a: 1,
      why: '잔액처럼 강한 일관성이 필수인 곳에 지연을 들이면 성능이 아니라 사고를 얻는다.' },
  ];

  const summary = [
    '한 정규화 모델로 쓰기와 무거운 조회를 함께 하면 읽기 P95가 850ms까지 오르고 쓰기도 느려진다.',
    'Command와 Query 핸들러를 나누는 것만으로도 읽기를 raw SQL과 DTO로 다듬을 수 있다.',
    '읽기를 replica와 Materialized View로 옮기면 850ms가 30ms가 되지만 그만큼 늦은 데이터를 본다.',
    '1~3단계로 충분한 팀이 많고, 잔액처럼 즉시 반영이 필요한 곳에는 쓰지 않는다.',
  ];
  const review = [
    { q: 'MV를 도입한 뒤 관리자들이 방금 들어온 주문이 대시보드에 1분 가까이 안 보인다고 한다. 먼저 확인할 것은?',
      o: ['primary가 다운됐는지', 'REFRESH 주기가 1분이라 그만큼 늦는 것이 설계상 정상인지', 'read_engine 풀이 40개라 모자란지'], a: 1,
      why: 'MV는 갱신 주기가 곧 신선도다. 이 지연을 받아들일 수 없는 화면이면 primary 직읽기나 다른 경로를 써야 한다.' },
    { q: '사용자가 주문 후 내 주문 목록에서 새 주문이 안 보인다는 문의가 늘었다. 서버를 거의 안 고치고 체감을 바꾸는 방법은?',
      o: ['생성 응답에 새 주문을 통째로 돌려주고 프론트가 목록에 바로 끼워 넣는다', 'replica를 모두 없앤다', 'Kafka를 추가해 이벤트로 알린다'], a: 0,
      why: 'Optimistic UI는 가장 싼 대응이다. 재조회 없이 응답 객체를 목록에 넣으니 복제 지연이 화면에 드러나지 않는다.' },
    { q: '사내 관리 도구 하나에 replica, MV, Elasticsearch, Outbox를 한꺼번에 넣으려 한다. 알맞은 판단은?',
      o: ['한 번에 다 넣어야 나중에 덜 고친다', 'Outbox만 먼저 넣는다', '단순 CRUD에 작은 트래픽이니 단일 DB에서 핸들러 분리 정도로 멈춘다'], a: 2,
      why: '단순 CRUD와 작은 트래픽은 CQRS를 하지 말 신호다. 4~5단계는 운영 비용이 크게 뛴다.' },
  ];

  R.page({ title: 'CQRS 트래픽 모형', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
