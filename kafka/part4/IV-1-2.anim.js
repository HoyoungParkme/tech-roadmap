/* IV-1-2 Kafka Streams vs ksqlDB — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 중심: 토픽(오프셋 칸이 쌓이는 로그)과 그 사이를 흐르는 레코드, 그리고 키별 최신 값을 담는 표(KTable·TABLE).
 * 예시 데이터(주문 6건, 고객 변경 5건)는 그림용이다. 집계 결과(KR 2·US 1·JP 1, 합계 57000·30000·8000)와
 * 덮어쓰기 결과(c-1 VIP·c-2 GOLD·c-3 SILVER)는 같은 규칙을 python 으로 돌려 맞췄다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, snippet, server, dbIcon, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 ----------
  // 로그(토픽 한 파티션): 칸마다 오프셋, labels 가 있으면 칸 안에 그 글자
  function log(x, y, name, n, o) { o = o || {}; const w = o.w || 30, h = o.h || 26, gap = 3, slots = o.slots || Math.max(1, Math.ceil(n));
    if (name) mono(x, y - 9, name, { 'font-size': o.nfs || 14.5, 'font-weight': 700, fill: o.nc || INK });
    for (let i = 0; i < slots; i++) { const cx = x + i * (w + gap), f = clamp(n - i), col = (o.col && o.col(i)) || o.stroke || ACC;
      el('rect', { x: cx, y, width: w, height: h, rx: 4, fill: 'none', stroke: GRID, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' });
      if (f > 0) { el('rect', { x: cx, y, width: w, height: h, rx: 4, fill: (o.bg && o.bg(i)) || ACCBG, stroke: col, 'stroke-width': 1.6, opacity: f });
        const s = o.labels ? o.labels[i] : String(i); if (s != null) mono(cx + w / 2, y + h / 2 + 5, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, opacity: f }); } } }
  // 키-값 표 (KTable · TABLE): rows [[key, val, hot]]
  function table(x, y, w, title, head, rows, o) { o = o || {}; const rh = 32;
    el('rect', { x, y, width: w, height: 36 + rh * Math.max(rows.length, o.min || 0), rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    tx(x + 14, y - 10, title, { 'font-size': 14.5, 'font-weight': 700, fill: o.stroke || INK, opacity: o.op ?? 1 });
    head.forEach((h, j) => mono(x + 16 + j * (o.cw || 110), y + 23, h, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: o.op ?? 1 }));
    rows.forEach((r, i) => { const yy = y + 36 + i * rh, hot = r[r.length - 1] === true;
      if (hot) el('rect', { x: x + 6, y: yy + 2, width: w - 12, height: rh - 4, rx: 6, fill: ACCBG });
      r.filter((v) => v !== true && v !== false).forEach((v, j) => mono(x + 16 + j * (o.cw || 110), yy + 21, String(v), { 'font-size': 14.5, 'font-weight': j === 0 ? 700 : 400, fill: hot ? ACC : INK, opacity: o.op ?? 1 })); }); }
  function node(cx, cy, s, sc, col) { const g = R.G(cx, cy, sc ?? 1); el('circle', { cx: 0, cy: 0, r: 24, fill: PANEL, stroke: col || ACC, 'stroke-width': 2.5 }, g);
    tx(0, 44, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: col || ACC }, g); return g; }
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op }, a || {}));

  // 예시 주문 6건 (그림용) — 금액 0 이하는 filter 에서 빠진다
  const ORD = [['o-1', 'KR', 12000], ['o-2', 'US', 30000], ['o-3', 'KR', 0], ['o-4', 'JP', 8000], ['o-5', 'KR', 45000], ['o-6', 'US', -500]];
  const keep = (r) => r[2] > 0;
  const UPD = [['KR', 1], ['US', 1], ['JP', 1], ['KR', 2]];       // count() 가 내보내는 변경 (python 재현)

  // ---------- 1. Streams = 내 앱 안의 라이브러리 ----------
  function app(x, y, w, h, title, o) { o = o || {}; zone(x, y, w, h, title, { fill: SOFT, stroke: o.stroke || INK, sw: 2, color: o.stroke || INK, op: o.op }); }
  function s1(t, c) { const { k, u } = c;
    const AX = 300, AW = 360, srcIn = k >= 2 ? (k === 2 ? E(u, 0.3, 1.0) : 1) : 0, snkIn = k >= 3 ? (k === 3 ? E(u, 0.3, 1.0) : 1) : 0;
    if (k < 5) {
      log(40, 190, 'orders', k >= 4 ? 6 : 4, { slots: 6, w: 28 });
      app(AX, 50, AW, 320, 'OrdersApp (JVM 프로세스)', { op: k === 0 ? fade(u, 0.1) : 1 });
      card(AX + AW / 2, k === 0 ? lerp(30, 100, E(u, 0.3, 1.1)) : 100, 220, 38, { rx: 8, fill: INK, stroke: 'none', text: 'kafka-streams 3.7.0', fs: 14, mono: true, color: PANEL, s: 1 });
      if (k === 0) {
        server(810, 200, null, { s: pop(u, 1.4), stroke: OFF }); cross(810, 200, 22, pop(u, 1.8)); say(810, 290, '띄울 서버가 없다', fade(u, 2.0), { 'text-anchor': 'middle' });
        sub(AX + AW / 2, 160, '의존성 한 줄로 앱 안에 들어온다', fade(u, 1.0), { 'font-size': 14.5 }); }
      if (k === 1) { [['application.id', 'orders-app', ACC], ['bootstrap.servers', 'localhost:9092', INK], ['기본 Serde', 'String / String', INK]].forEach(([a, b], i) => { const y = 160 + i * 42, s = pop(u, 0.2 + i * 0.3);
          card(AX + AW / 2, y, 320, 34, { rx: 8, stroke: i === 0 ? ACC : GRID, sw: i === 0 ? 2.4 : 1.5, s }); mono(AX + 30, y + 5, a, { 'font-size': 14, fill: MUT, opacity: s }); mono(AX + AW - 30, y + 5, b, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: i === 0 ? ACC : INK, opacity: s }); });
        grow(AX + AW + 6, 160, 720, 120, E(u, 1.2, 1.6), ACC); grow(AX + AW + 6, 160, 720, 210, E(u, 1.4, 1.8), ACC);
        mono(730, 125, '컨슈머 그룹 = orders-app', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
        mono(730, 215, '내부 토픽 = orders-app-…', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); }
      if (k >= 2) { node(AX + 80, 220, 'source', pop(srcIn, 0.1)); el('line', { x1: 230, y1: 203, x2: AX + 56, y2: 220, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': k < 4 ? '6 5' : null, opacity: srcIn }); }
      if (k >= 3) { node(AX + AW - 80, 220, 'sink', pop(snkIn, 0.1)); grow(AX + 106, 220, AX + AW - 106, 220, snkIn, ACC);
        log(700, 190, 'orders-clean', k >= 4 ? E(u, 0.8, 2.6) * 4 : 0, { slots: 6, w: 28 }); el('line', { x1: AX + AW - 56, y1: 220, x2: 698, y2: 203, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': k < 4 ? '6 5' : null, opacity: snkIn }); }
      if (k === 2) { mono(AX + 20, 300, 'builder.stream("orders")', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.8) }); say(AX + 20, 336, '아직 선언일 뿐, 아무것도 돌지 않는다', fade(u, 1.6), { fill: MUT }); }
      if (k === 3) { mono(AX + 20, 300, 'orders.to("orders-clean")', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.8) }); say(AX + 20, 336, '출력이 붙어야 토폴로지가 닫힌다', fade(u, 1.6), { fill: MUT }); }
      if (k === 4) { for (let i = 0; i < 4; i++) dot([[200, 203], [AX + 80, 220], [AX + AW - 80, 220], [720 + i * 31, 203]], seg(u, 0.4 + i * 0.45, 1.2 + i * 0.45), ACC, 6);
        pill(AX + AW / 2, 300, 'streams.start()', GOOD, pop(u, 0.2), { mono: true, fs: 14.5 }); sub(AX + AW / 2, 340, '종료 훅에서 close() 해야 리밸런스가 깔끔하다', fade(u, 1.8), { 'font-size': 13.5 }); }
      return; }
    // k === 5: 같은 application.id 로 인스턴스 3개 → 파티션을 나눠 갖는다 (파티션 3개는 예시)
    mono(40, 50, 'orders', { 'font-size': 15, 'font-weight': 700 });
    [0, 1, 2].forEach((p) => { log(80, 76 + p * 110, null, 4, { slots: 5, w: 28 }); mono(72, 76 + p * 110 + 18, 'p' + p, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 700 });
      const x = 470, y = 56 + p * 110, s = pop(u, 0.3 + p * 0.35);
      card(x + 150, y + 33, 300, 80, { rx: 10, fill: SOFT, stroke: INK, sw: 2, s });
      mono(x + 14, y + 26, 'OrdersApp #' + (p + 1), { 'font-size': 14.5, 'font-weight': 700, opacity: s }); mono(x + 14, y + 50, 'application.id = orders-app', { 'font-size': 13.5, fill: MUT, opacity: s });
      dbIcon(x + 262, y + 24, null, { s: 0.36 * s }); mono(x + 262, y + 62, 'RocksDB', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s });
      grow(250, 89 + p * 110, x - 4, y + 33, E(u, 0.9 + p * 0.3, 1.4 + p * 0.3), ACC); });
    say(480, 400, '인스턴스를 늘리면 그대로 수평 확장 (파티션 수가 상한)', fade(u, 2.2), { 'text-anchor': 'middle' }); }

  // ---------- 2. map / filter / groupBy / count ----------
  const COLX = [40, 260, 470], RY = (i) => 92 + i * 40;
  function recCard(x, y, s, o) { o = o || {}; card(x + 92, y, 184, 30, { rx: 6, text: s, fs: 13.5, mono: true, stroke: o.col || INK, color: o.col || INK, fill: o.fill, s: o.s ?? 1, op: o.op ?? 1 }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { [['KStream<K,V>', '흐르는 레코드', ACC], ['KTable<K,V>', '키별 최신 값', INFO], ['Grouped', '묶을 때 Serde', MUT], ['Produced', '쓸 때 Serde', MUT]].forEach(([a, b], i) => { const x = 130 + i * 235, s = pop(u, 0.2 + i * 0.3);
        card(x, 120, 200, 70, { rx: 12, stroke: a.startsWith('K') ? a.startsWith('KS') ? ACC : INFO : GRID, sw: 2.2, s }); mono(x, 116, a, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', fill: b === '흐르는 레코드' ? ACC : b === '키별 최신 값' ? INFO : INK, opacity: s }); sub(x, 140, b, s, { 'font-size': 13.5 }); });
      log(60, 250, null, E(u, 1.2, 2.2) * 6, { slots: 6, w: 44, labels: ['KR', 'US', 'KR', 'JP', 'KR', 'US'] }); sub(190, 300, 'KStream: 같은 키도 모두 남는다', fade(u, 1.4), { 'font-size': 14 });
      table(560, 230, 260, 'KTable', ['key', 'count'], [['KR', 2], ['US', 1], ['JP', 1]].slice(0, Math.round(E(u, 1.6, 2.4) * 3)), { stroke: INFO, min: 3 });
      say(480, 400, '반환 타입이 곧 의미다', fade(u, 2.4), { 'text-anchor': 'middle' }); return; }
    // 머리글
    [['orders (JSON)', 0], ['parsed (Order)', 1], ['valid', 2]].forEach(([s, j]) => { if (j === 0 || k >= j) mono(COLX[j], 66, s, { 'font-size': 14, fill: MUT, 'font-weight': 700 }); });
    const mapF = k === 1 ? E(u, 0.8, 2.2) : 1, filtF = k === 2 ? E(u, 0.5, 1.8) : k > 2 ? 1 : 0;
    ORD.forEach(([id, rg, amt], i) => { const y = RY(i);
      recCard(COLX[0], y, `${id} {"region":"${rg}"…}`, { s: k === 1 ? pop(u, 0.1 + i * 0.1) : 1, op: k >= 3 ? 0.45 : 1 });
      const m = clamp(mapF * 6 - i); if (m > 0) recCard(COLX[1], y, `${id} │ ${rg} ${amt}`, { s: m, col: !keep(ORD[i]) && filtF > 0.3 ? BAD : INK, op: k >= 3 ? 0.45 : 1 });
      if (k >= 2 && !keep(ORD[i])) cross(COLX[1] + 92, y, 12, pop(filtF, 0.2 + i * 0.05));
      if (k >= 2 && keep(ORD[i])) { const f = clamp(filtF * 6 - i); if (f > 0) recCard(COLX[2], y, `${id} │ ${rg} ${amt}`, { s: f, col: k === 2 ? GOOD : INK }); } });
    if (k === 1) { grow(232, 300, 258, 300, 1, ACC); sub(150, 350, 'mapValues: 값만 바뀌고 키(orderId)는 그대로', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700, 'text-anchor': 'start' });
      sub(150, 374, '키가 안 바뀌니 리파티션도 없다', fade(u, 2.4), { 'font-size': 13.5, 'text-anchor': 'start' }); return; }
    if (k === 2) { say(470, 350, 'filter(amount > 0): 2건이 빠진다', fade(u, 2.0)); return; }
    // k >= 3: groupBy(region) → 리파티션 토픽 → count → KTable
    const nUp = k === 3 ? E(u, 0.6, 2.4) * 4 : 4, shown = Math.floor(nUp + 0.001);
    const rows = { KR: 0, US: 0, JP: 0 }, hot = shown > 0 ? UPD[shown - 1][0] : null; UPD.slice(0, shown).forEach(([r, n]) => (rows[r] = n));
    if (k === 3) { card(800, 86, 230, 42, { rx: 21, stroke: WARN, fill: WARNBG, text: '…-repartition 토픽', fs: 13.5, mono: true, color: WARN, s: pop(u, 0.3) });
      sub(800, 146, 'key: orderId → region', fade(u, 0.5), { 'font-size': 13.5, fill: WARN, 'font-weight': 700 }); grow(662, 100, 682, 92, 1, WARN); }
    table(680, k === 3 ? 196 : 66, 260, 'countByRegion (KTable)', ['region', 'count'], ['KR', 'US', 'JP'].map((r) => [r, rows[r], r === hot && k === 3]), { stroke: INFO });
    if (k === 3) { say(480, 370, 'groupBy 로 키를 바꾸면 리파티션 토픽이 자동으로 생긴다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 4) { el('rect', { x: 0, y: 312, width: 960, height: 108, fill: PANEL });
      log(60, 350, 'order-count-by-region', E(u, 0.3, 2.0) * 4, { slots: 4, w: 70, labels: UPD.map(([r, n]) => r + ':' + n), stroke: INFO, bg: () => INFOBG });
      sub(560, 404, 'toStream(): 바뀔 때마다 한 줄씩 (캐시가 중간 값을 합칠 수 있다)', fade(u, 2.1), { 'font-size': 13.5 }); return; }
    // k === 5: 흐름 한 줄
    el('rect', { x: 0, y: 312, width: 960, height: 108, fill: PANEL });
    [['orders', 'KStream<String,String>'], ['parsed', 'KStream<String,Order>'], ['valid', 'KStream<String,Order>'], ['countByRegion', 'KTable<String,Long>']].forEach(([a, b], i) => { const x = 110 + i * 245, s = pop(u, 0.2 + i * 0.3);
      card(x, 350, 210, 52, { rx: 10, stroke: i === 3 ? INFO : ACC, sw: 2, s }); mono(x, 345, a, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); mono(x, 365, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s });
      if (i) grow(x - 140, 350, x - 108, 350, E(u, 0.2 + i * 0.3, 0.5 + i * 0.3), ACC); });
    sub(480, 408, '단계마다 타입이 바뀐다', fade(u, 1.6), { 'font-size': 14 }); }

  // ---------- 3. KStream vs KTable ----------
  const CUST = [['c-1', 'SILVER'], ['c-2', 'GOLD'], ['c-1', 'GOLD'], ['c-3', 'SILVER'], ['c-1', 'VIP']];
  function custTable(n, hotIdx, x, y, o) { const cur = {}; CUST.slice(0, n).forEach(([k, v]) => (cur[k] = v));
    table(x, y, 250, o && o.title != null ? o.title : 'customers (KTable)', ['key', 'tier'], Object.keys(cur).sort().map((k) => [k, cur[k], hotIdx != null && CUST[hotIdx] && CUST[hotIdx][0] === k]), { stroke: INFO, min: 3 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const n = E(u, 0.3, 2.2) * 5;
      log(80, 150, 'orders (KStream) · key = customerId', n, { slots: 6, w: 62, labels: ['c-1', 'c-2', 'c-1', 'c-1', 'c-3'] });
      for (let i = 0; i < 5; i++) mono(80 + i * 65 + 31, 200, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: clamp(n - i) });
      mono(30, 200, 'offset', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3) });
      say(80, 260, 'c-1 이 세 번 와도 세 개의 사건이다', fade(u, 2.0)); sub(250, 290, 'append-only: 덮어쓰지 않고 쌓인다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 1) { const n = E(u, 0.2, 2.4) * 5, sh = Math.floor(n + 0.001);
      log(60, 120, 'customers 토픽', n, { slots: 5, w: 92, labels: CUST.map(([a, b]) => a + ' ' + b) });
      custTable(sh, sh - 1, 600, 190);
      if (sh > 0 && sh <= 5) dot([[60 + (sh - 1) * 95 + 46, 150], [620, 230]], (n % 1) || 0.99, INFO, 6);
      mono(600, 360, 'Materialized.as("customers-store")', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) }); sub(725, 384, 'RocksDB 에 키별 최신 값만', fade(u, 1.2), { 'font-size': 13.5 });
      say(60, 260, '같은 키가 오면 덮어쓴다', fade(u, 1.8), { fill: INFO }); return; }
    if (k === 2) { custTable(5, null, 360, 150, { title: 'customers (KTable)' });
      log(40, 80, 'orders (KStream)', 2, { slots: 2, w: 62, labels: ['c-1', 'c-9'] });
      dot([[71, 106], [71, 200], [380, 200]], seg(u, 0.3, 1.1), ACC, 7);
      el('rect', { x: 366, y: 188, width: 238, height: 28, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.0) });
      fly(620, 202, 820, 202, seg(u, 1.3, 2.0), '{order, VIP}', { mono: true, stay: true });
      mono(720, 160, 'orders-enriched', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      dot([[133, 106], [133, 300]], seg(u, 1.6, 2.2), OFF, 7); cross(133, 320, 10, pop(u, 2.2));
      sub(150, 360, 'c-9 는 고객 정보가 없어 join 결과에서 빠진다 (예시)', fade(u, 2.3), { 'font-size': 14, 'text-anchor': 'start' });
      sub(150, 384, '빠뜨리지 않으려면 leftJoin', fade(u, 2.5), { 'font-size': 13.5, 'text-anchor': 'start' }); return; }
    if (k === 3) { log(330, 70, 'customers 토픽 (하나)', 5, { slots: 5, w: 92, labels: CUST.map(([a, b]) => a + ' ' + b) });
      grow(380, 110, 230, 180, E(u, 0.3, 0.9), ACC); grow(700, 110, 760, 180, E(u, 0.3, 0.9), INFO);
      mono(60, 200, 'builder.stream(…)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
      CUST.forEach(([a, b], i) => mono(60, 232 + i * 26, `${a} → ${b}`, { 'font-size': 14, opacity: fade(u, 0.9 + i * 0.15) }));
      sub(150, 400, '변경 이벤트 5건', fade(u, 1.8), { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      mono(640, 200, 'builder.table(…)', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8) });
      if (u > 1.0) custTable(5, null, 640, 220, { title: '' });
      sub(765, 400, '현재 스냅샷 3행', fade(u, 1.8), { 'font-size': 14, fill: INFO, 'font-weight': 700 }); return; }
    // k === 4: 거래 내역 ↔ 잔액 (예시 금액)
    const TXN = ['+100', '−30', '+50'];
    log(60, 120, '거래 내역 (KStream)', E(u, 0.2, 1.2) * 3, { slots: 3, w: 80, labels: TXN });
    table(560, 96, 250, '잔액 (KTable)', ['계좌', '잔액'], [['A', Math.round(tween(0, 120, u, 1.4))]], { stroke: INFO });
    grow(330, 120, 540, 120, E(u, 1.0, 1.5), ACC); mono(360, 100, 'groupByKey + reduce', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.2) });
    grow(540, 170, 330, 170, E(u, 1.6, 2.1), INFO); mono(380, 194, 'toStream()', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 1.8) });
    say(60, 290, '사건을 하나씩 처리한다 → KStream', fade(u, 2.0), { fill: ACC }); say(60, 324, '지금 상태가 필요하다 → KTable', fade(u, 2.2), { fill: INFO });
    sub(480, 380, '주문·결제·클릭은 흐름, 잔액·재고·등급은 상태', fade(u, 2.4), { 'font-size': 14 }); }

  // ---------- 4. ksqlDB ----------
  function ksql(o) { o = o || {}; zone(300, 40, 360, 330, 'ksqlDB 서버', { fill: WARNBG, stroke: WARN, color: WARN, op: o.op }); }
  const COLS = [['order_id', 'KEY'], ['customer_id', ''], ['region', ''], ['amount', ''], ['created_at', '']];
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { log(40, 120, 'orders 토픽', 5, { slots: 5, w: 40, labels: ['…', '…', '…', '…', '…'], stroke: MUT, bg: () => SOFT });
      sub(140, 176, '바이트일 뿐, 컬럼이 없다', 1, { 'font-size': 13.5 });
      ksql();
      if (k === 0) { mono(320, 90, 'CREATE STREAM orders (', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
        COLS.forEach(([a, b], i) => { const y = 124 + i * 34, s = pop(u, 0.5 + i * 0.25); card(480, y, 300, 28, { rx: 6, stroke: b ? ACC : GRID, sw: 1.6, s });
          mono(346, y + 5, a, { 'font-size': 14, fill: b ? ACC : INK, 'font-weight': 700, opacity: s }); mono(616, y + 5, b || ['VARCHAR', 'VARCHAR', 'DOUBLE', 'BIGINT'][i - 1], { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, opacity: s }); });
        say(480, 320, 'KEY = 메시지 키', fade(u, 2.0), { 'text-anchor': 'middle', fill: ACC }); return; }
      mono(320, 90, ") WITH (", { 'font-size': 14.5, 'font-weight': 700 });
      [["KAFKA_TOPIC = 'orders'", 0.3], ["VALUE_FORMAT = 'JSON'", 0.9]].forEach(([s, a], i) => card(480, 140 + i * 50, 300, 36, { rx: 8, stroke: ACC, text: s, fs: 14, mono: true, color: ACC, s: pop(u, a) }));
      grow(330, 140, 190, 134, E(u, 0.6, 1.2), ACC);
      say(480, 270, '선언과 물리 토픽이 이어진다', fade(u, 1.6), { 'text-anchor': 'middle' });
      pill(810, 200, 'SHOW STREAMS 에 보인다', GOOD, pop(u, 2.0), { fs: 13.5 }); sub(810, 240, 'AVRO 면 Schema Registry 와 연결', fade(u, 2.3), { 'font-size': 13.5 }); return; }
    if (k === 2) { ksql();
      ORD.forEach(([id, rg, amt], i) => { const y = 90 + i * 40, ok = keep(ORD[i]), a = 0.3 + i * 0.25;
        mono(40, y, `${id} ${rg} ${amt}`, { 'font-size': 14, opacity: fade(u, 0.1) });
        if (ok) dot([[190, y - 5], [330, y - 5], [700, y - 5]], seg(u, a, a + 0.8), ACC, 5); else cross(220, y - 5, 8, pop(u, a + 0.2));
        if (ok) mono(720, y, `${id} ${rg} ${amt}`, { 'font-size': 14, fill: ACC, opacity: fade(u, a + 0.7) }); });
      mono(330, 340, 'WHERE amount > 0', { 'font-size': 15, 'font-weight': 700, fill: WARN }); mono(700, 66, 'orders_valid', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      const rot = t * 120; el('path', { d: 'M0,-14 A14,14 0 1 1 -12,7', fill: 'none', stroke: WARN, 'stroke-width': 3, transform: `translate(620 335) rotate(${rot})`, 'marker-end': 'url(#ra-ah)' });
      sub(480, 395, 'EMIT CHANGES: 한 번 조회가 아니라 계속 도는 쿼리', fade(u, 2.2), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { ksql();
      mono(320, 90, 'GROUP BY region', { 'font-size': 15, 'font-weight': 700, fill: WARN });
      const g = E(u, 0.3, 2.0), n = (r, a, b) => Math.round(lerp(a, b, g));
      table(340, 130, 290, 'orders_by_region (TABLE)', ['region', 'count', 'total'], [['KR', n('KR', 0, 2), n('', 0, 57000)], ['US', n('', 0, 1), n('', 0, 30000)], ['JP', n('', 0, 1), n('', 0, 8000)]], { stroke: INFO, cw: 92 });
      mono(40, 150, 'orders_valid', { 'font-size': 14.5, 'font-weight': 700, fill: ACC }); log(40, 166, null, 4, { slots: 4, w: 56, labels: ['KR', 'US', 'JP', 'KR'] });
      grow(270, 180, 336, 200, E(u, 0.2, 0.6), ACC);
      say(700, 200, 'STREAM 이 아니라 TABLE', fade(u, 2.0), { fill: INFO }); sub(800, 228, '집계 = 키별 최신 값', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 4) { table(330, 60, 300, 'orders_by_region', ['region', 'count', 'total'], [['KR', 2, 57000], ['US', 1, 30000], ['JP', 1, 8000]], { stroke: INFO, cw: 96 });
      lbl(160, 250, '푸시 쿼리', fade(u, 0.2), { fill: ACC }); mono(40, 276, '… EMIT CHANGES;', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2) });
      UPD.forEach(([r, n], i) => { const a = 0.5 + i * 0.4; dot([[330, 120 + 10 * i], [200, 300 + i * 26]], seg(u, a, a + 0.35), ACC, 5); mono(60, 306 + i * 26, `| ${r} | ${n} |`, { 'font-size': 14, fill: ACC, opacity: fade(u, a + 0.3) }); });
      lbl(800, 250, '풀 쿼리', fade(u, 1.0), { fill: INFO }); mono(680, 276, "… WHERE region = 'KR';", { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) });
      card(800, 312, 220, 36, { rx: 8, stroke: INFO, text: '| KR | 2 | 57000 |', fs: 14, mono: true, color: INFO, s: pop(u, 1.6) }); sub(800, 350, '지금 값 한 번, 끝', fade(u, 1.9), { 'font-size': 13.5 });
      sub(480, 404, '대시보드는 푸시, 단건 조회는 풀', fade(u, 2.3), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { // LEFT JOIN (예시 행)
      log(40, 90, 'orders (STREAM)', 2, { slots: 2, w: 110, labels: ['o-1 c-1', 'o-2 c-9'] });
      table(40, 180, 230, 'customers (TABLE)', ['customer_id', 'tier'], [['c-1', 'VIP']], { stroke: INFO, cw: 130 });
      card(480, 160, 230, 50, { rx: 25, stroke: WARN, fill: WARNBG, text: 'LEFT JOIN ON customer_id', fs: 13.5, mono: true, color: WARN, s: pop(u, 0.3) });
      table(620, 220, 300, 'orders_enriched (STREAM)', ['order', 'amount', 'tier'], [['o-1', 12000, 'VIP'], ['o-2', 30000, 'null']].slice(0, Math.round(E(u, 0.8, 1.8) * 2)), { stroke: ACC, cw: 92, min: 2 });
      grow(270, 112, 365, 150, E(u, 0.5, 0.9), ACC); grow(595, 172, 640, 196, E(u, 0.7, 1.1), ACC);
      sub(770, 340, '고객이 없는 주문도 남는다 (값은 예시)', fade(u, 2.0), { 'font-size': 14 });
      sub(480, 395, 'Java 의 mergeJson 이 SELECT 컬럼 목록으로 끝난다', fade(u, 2.3), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    // k === 6: 운영 명령 · SQL 은 Streams 토폴로지로 컴파일된다
    snippet(40, 50, ['SHOW QUERIES;', 'TERMINATE CTAS_ORDERS_BY_REGION_0;'], { fs: 14.5, op: fade(u, 0.2) });
    card(220, 250, 260, 70, { rx: 10, stroke: WARN, fill: WARNBG, text: 'SQL\nCREATE TABLE … AS', fs: 14.5, mono: true, color: WARN, s: pop(u, 0.6) });
    grow(356, 250, 470, 250, E(u, 1.0, 1.4), ACC); mono(413, 236, '컴파일', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.1) });
    zone(490, 160, 440, 190, 'Kafka Streams 토폴로지', { fill: SOFT });
    ['source', 'filter', 'groupBy', 'count'].forEach((s, i) => { node(545 + i * 110, 245, s, pop(u, 1.4 + i * 0.2), i === 3 ? INFO : ACC); if (i) grow(545 + (i - 1) * 110 + 24, 245, 545 + i * 110 - 26, 245, E(u, 1.4 + i * 0.2, 1.6 + i * 0.2), ACC); });
    say(480, 395, 'ksqlDB = Kafka Streams 의 SQL 앞단', fade(u, 2.3), { 'text-anchor': 'middle' }); }

  // ---------- 5. 어느 걸 쓸까 ----------
  function engines(u, k) { const s = k === 0 ? 1 : 1;
    zone(60, 40, 360, 180, 'Kafka Streams = 내 앱 (jar)', { fill: ACCBG, stroke: ACC, color: ACC });
    zone(540, 40, 360, 180, 'ksqlDB = 별도 서버', { fill: WARNBG, stroke: WARN, color: WARN });
    [240, 720].forEach((x, i) => { card(x, 160, 260, 44, { rx: 8, fill: INK, stroke: 'none', text: 'Kafka Streams 엔진', fs: 15, color: PANEL, s: k === 0 ? pop(u, 0.6 + i * 0.3) : 1 }); });
    mono(240, 98, 'Java / Kotlin 코드', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700 }); mono(720, 98, 'SQL', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700 }); }
  const ROWS = [['형태', 'JVM 라이브러리', '별도 서버'], ['언어', 'Java / Kotlin', 'SQL'], ['배포', 'jar 빌드 → 내 앱', '서버에 쿼리 등록'], ['자유도', '임의 코드·외부 호출', 'SQL 문법 안'], ['진입 장벽', '백엔드 개발자', 'SQL 하는 누구나'], ['테스트', 'TopologyTestDriver', '서버에 직접 실행'], ['상태', 'RocksDB (앱 안)', 'ksqlDB 서버 관리']];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { engines(u, k); log(260, 300, '같은 클러스터 · 같은 토픽', E(u, 1.2, 2.2) * 8, { slots: 10, w: 40 });
      grow(240, 186, 300, 268, E(u, 1.4, 1.8), ACC); grow(720, 186, 600, 268, E(u, 1.5, 1.9), WARN);
      sub(480, 370, '한 건씩 처리하는 같은 모델 · 같은 시맨틱', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1 || k === 2) { const rows = k === 1 ? ROWS.slice(0, 3) : ROWS.slice(3), base = k === 1 ? 0 : 3;
      lbl(470, 50, 'Kafka Streams', 1, { fill: ACC }); lbl(760, 50, 'ksqlDB', 1, { fill: WARN });
      ROWS.slice(0, base).forEach(([a, b, d], i) => { const y = 84 + i * 40; tx(60, y, a, { 'font-size': 14.5, fill: MUT, 'font-weight': 700 }); tx(470, y, b, { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT }); tx(760, y, d, { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT }); });
      rows.forEach(([a, b, d], i) => { const y = 84 + (base + i) * 40, at = 0.3 + i * 0.4, s = fade(u, at);
        el('rect', { x: 40, y: y - 24, width: 880, height: 34, rx: 6, fill: SOFT, opacity: s });
        tx(60, y, a, { 'font-size': 15, 'font-weight': 700, opacity: s }); tx(470, y, b, { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, 'font-weight': 600, opacity: fade(u, at + 0.15) }); tx(760, y, d, { 'font-size': 15, 'text-anchor': 'middle', fill: WARN, 'font-weight': 600, opacity: fade(u, at + 0.25) }); });
      say(480, 395, k === 1 ? '가장 크게 갈리는 세 줄' : '팀이 감당할 일의 차이', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 3 || k === 4) { const S = k === 3, L = S ? ['복잡한 도메인 로직 · 정책 계산', '외부 REST · DB 호출', 'Spring Boot 한 앱으로', '단위 테스트 · CI 필수', '코드 리뷰 · git 변경관리'] : ['한 시간짜리 프로토타입', '분석가 · 운영자 셀프서비스', '단순 집계 · 필터 · JOIN', '운영 대시보드용 실시간 집계'];
      const col = S ? ACC : WARN; lbl(480, 52, S ? 'Kafka Streams 가 맞는 경우' : 'ksqlDB 가 맞는 경우', 1, { fill: col, 'font-size': 18 });
      L.forEach((s, i) => { const y = 104 + i * 54, sc = pop(u, 0.3 + i * 0.35); card(480, y, 520, 42, { rx: 21, stroke: col, sw: 2, s: sc }); check(250, y, 9, sc); tx(275, y + 6, s, { 'font-size': 15.5, 'font-weight': 600, opacity: fade(u, 0.4 + i * 0.35) }); }); return; }
    if (k === 5) { log(300, 190, 'orders', 8, { slots: 10, w: 34 });
      card(160, 110, 230, 52, { rx: 10, stroke: ACC, fill: ACCBG, text: '핵심 파이프라인\nStreams · 백엔드팀', fs: 14, color: ACC, s: pop(u, 0.3) });
      card(800, 110, 230, 52, { rx: 10, stroke: WARN, fill: WARNBG, text: '임시 집계 · 탐색\nksqlDB · 데이터팀', fs: 14, color: WARN, s: pop(u, 0.6) });
      grow(160, 140, 340, 168, E(u, 0.6, 1.0), ACC); grow(800, 140, 600, 168, E(u, 0.8, 1.2), WARN);
      sub(480, 250, '같은 토픽을 그룹만 달리해 함께 읽는다', fade(u, 1.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      [['ksqlDB 도 서버다: HA · 모니터링 · 버전관리', 1.6], ['SQL 이라 쉽다는 환상', 1.9], ['Streams 는 의존성 충돌을 조심', 2.2]].forEach(([s, a], i) => { cross(250, 296 + i * 34, 7, pop(u, a)); tx(270, 301 + i * 34, s, { 'font-size': 14.5, opacity: fade(u, a) }); }); return; }
    // k === 6
    tx(480, 120, '누가 매일 손에 들고 쓸 도구인가', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, opacity: fade(u, 0.2, 0.6) });
    [['백엔드팀이 끝까지 책임진다', 'Kafka Streams', ACC], ['데이터팀이 셀프서비스한다', 'ksqlDB', WARN]].forEach(([a, b, col], i) => { const y = 210 + i * 80, s = pop(u, 0.9 + i * 0.4);
      card(300, y, 360, 56, { rx: 10, stroke: GRID, text: a, fs: 15.5, s }); grow(486, y, 600, y, E(u, 1.1 + i * 0.4, 1.4 + i * 0.4), col);
      card(720, y, 220, 56, { rx: 10, stroke: col, fill: i ? WARNBG : ACCBG, text: b, fs: 16, color: col, s }); });
    sub(480, 390, '같은 엔진, 다른 포장 · 둘을 함께 쓰는 게 가장 흔하다', fade(u, 2.0), { 'font-size': 14.5 }); }

  // ---------- 확인 문제 ----------
  const quiz = [
    { q: 'Kafka Streams 앱에서 application.id가 맡는 역할은 무엇인가?',
      o: ['Kafka 브로커의 주소', '컨슈머 그룹 이름이자 내부 토픽 이름의 접두사', '출력 토픽의 이름'], a: 1,
      why: 'application.id가 orders-app이면 같은 id를 쓰는 인스턴스끼리 한 그룹으로 파티션을 나누고, 리파티션·changelog 토픽도 orders-app-으로 시작한다.' },
    { q: 'mapValues와 groupBy(region) 중 리파티션 토픽을 만드는 것은 무엇인가?',
      o: ['groupBy(region), 키가 orderId에서 region으로 바뀌어서', 'mapValues, 값이 바뀌어서', '둘 다 만들지 않는다'], a: 0,
      why: '파티션은 키로 정해진다. 키가 region으로 바뀌면 같은 지역을 한 곳에 모으려고 리파티션 토픽을 거친다. mapValues는 키를 건드리지 않는다.' },
    { q: 'customers 토픽에 c-1이 SILVER, GOLD, VIP 순서로 들어왔다. KTable로 읽으면 c-1의 값은 무엇인가?',
      o: ['SILVER', 'VIP', 'SILVER·GOLD·VIP 세 줄'], a: 1,
      why: 'KTable은 같은 키를 덮어써 최신 값만 남긴다. 세 줄을 모두 보는 것은 KStream으로 읽을 때다.' },
    { q: '지역별 주문 수를 대시보드에 실시간으로 띄우려 한다. 알맞은 쿼리는 무엇인가?',
      o: ["SELECT … WHERE region = 'KR'; 풀 쿼리", 'SHOW QUERIES;', 'SELECT * FROM orders_by_region EMIT CHANGES; 푸시 쿼리'], a: 2,
      why: 'EMIT CHANGES는 값이 바뀔 때마다 결과를 밀어준다. 풀 쿼리는 지금 값 한 번을 주고 끝난다.' },
    { q: '주문마다 외부 신용평가 API를 불러 점수를 붙여야 한다. 어느 쪽이 맞는가?',
      o: ['Kafka Streams, 임의 코드와 외부 호출을 쓸 수 있어서', 'ksqlDB, SQL로 빨리 만들 수 있어서', '둘 다 할 수 없다'], a: 0,
      why: 'ksqlDB는 SQL 표현 범위 안에 갇힌다. 외부 호출이 필요한 로직은 내 앱 안에서 도는 Streams가 맡는다.' },
  ];

  // ---------- 정리 · 복습 ----------
  const summary = [
    'Kafka Streams는 서버가 아니라 내 앱에 넣는 라이브러리이고 start() 전까지는 선언일 뿐이다.',
    'mapValues는 키를 두고 값만 바꾸고, groupBy로 키를 바꾸면 리파티션 토픽을 거친다.',
    '같은 토픽도 KStream으로 읽으면 사건의 흐름, KTable로 읽으면 키별 최신 값이다.',
    'ksqlDB는 같은 엔진을 SQL로 쓰는 서버라 빠르지만 SQL 밖의 일은 Streams가 맡는다.',
  ];
  const review = [
    { q: 'Streams 앱을 3대로 늘렸는데 한 대만 일하고 두 대는 논다. 입력 토픽 orders를 보니 파티션이 1개다. 무엇이 원인인가?',
      o: ['application.id가 서로 달라서', '파티션 하나는 그룹 안 인스턴스 하나만 읽어서', 'RocksDB가 한 대에만 있어서'], a: 1,
      why: '같은 application.id는 한 컨슈머 그룹이다. 나눠 가질 파티션이 하나뿐이면 나머지 인스턴스는 받을 일이 없다.' },
    { q: '주문 스트림에 고객 KTable을 join했더니 일부 주문이 결과에서 사라졌다. 먼저 의심할 것은?',
      o: ['그 주문의 customerId가 고객 테이블에 아직 없다', 'filter가 금액 0인 주문을 지웠다', '출력 토픽 파티션이 부족하다'], a: 0,
      why: 'join은 양쪽에 키가 있을 때만 결과를 낸다. 고객 정보가 아직 없는 주문도 남기려면 leftJoin을 쓴다.' },
    { q: 'ksqlDB에서 GROUP BY region으로 집계한 결과를 CREATE STREAM으로 만들려다 막혔다. 어떻게 고쳐야 하는가?',
      o: ['EMIT CHANGES를 지운다', 'VALUE_FORMAT을 AVRO로 바꾼다', 'CREATE TABLE … AS로 만든다'], a: 2,
      why: '집계 결과는 지역마다 최신 값 한 줄인 TABLE이다. Streams의 count()가 KTable을 돌려주는 것과 같은 이유다.' },
  ];

  R.page({ title: 'Kafka Streams · ksqlDB 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
