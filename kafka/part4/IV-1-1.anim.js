/* IV-1-1 Kafka Connect — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 중심: 가운데 Kafka 토픽(파티션마다 오프셋이 붙은 칸). 왼쪽 외부 시스템 → Source → 토픽 → Sink → 오른쪽 외부 시스템.
 * 계산해 맞춘 값: Sink 태스크 4개가 토픽 2개 × 파티션 6개를 기본 range 배정으로 나누면 4·4·2·2개 (python 재현).
 * 디렉터리 날짜, 오프셋 위치 같은 값은 그림용 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, snippet, dbIcon, server, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통: 파티션 로그 ----------
  // 한 줄 = 파티션 하나. n 칸까지 차 있고(소수면 다음 칸이 차오르는 중), 칸 안 숫자는 오프셋
  function plog(x, y, name, n, o) { o = o || {}; const w = o.w || 28, h = o.h || 24, gap = 3, slots = o.slots || Math.ceil(n);
    if (name) mono(x - 8, y + h / 2 + 5, name, { 'font-size': 13.5, 'text-anchor': 'end', fill: o.lc || MUT, 'font-weight': 700 });
    for (let i = 0; i < slots; i++) { const cx = x + i * (w + gap), f = clamp(n - i), col = (o.col && o.col(i)) || o.stroke || ACC;
      el('rect', { x: cx, y, width: w, height: h, rx: 4, fill: 'none', stroke: GRID, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' });
      if (f > 0) { el('rect', { x: cx, y, width: w, height: h, rx: 4, fill: (o.bg && o.bg(i)) || ACCBG, stroke: col, 'stroke-width': 1.6, opacity: f });
        if (o.nums !== false) mono(cx + w / 2, y + h / 2 + 5, String(i + (o.base || 0)), { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, opacity: f }); } } }
  // 토픽: 이름 + 파티션 줄들 (counts[p] = 그 파티션에 쌓인 레코드 수)
  function topic(x, y, title, counts, o) { o = o || {}; const rh = o.rh || 30;
    if (title) mono(x - 30, y - 10, title, { 'font-size': 14.5, 'font-weight': 700, fill: o.tc || INK });
    counts.forEach((n, p) => plog(x, y + p * rh, 'p' + p, n, Object.assign({ slots: o.slots || 6 }, o))); }
  function bucket(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: 'M-46,-34 L46,-34 L36,36 L-36,36 Z', fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    el('ellipse', { cx: 0, cy: -34, rx: 46, ry: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.5 }, g);
    if (name) tx(0, 62, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 }, g); return g; }
  function fileIcon(cx, cy, label, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: 'M-16,-22 L8,-22 L16,-14 L16,22 L-16,22 Z', fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    el('path', { d: 'M8,-22 L8,-14 L16,-14', fill: 'none', stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    if (label) tx(0, 42, label, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 600 }, g); return g; }
  // 커넥터(플러그 모양 판)
  function plug(cx, cy, name, subt, o) { o = o || {}; const g = card(cx, cy, o.w || 150, 56, { rx: 10, stroke: o.stroke || ACC, fill: o.fill || ACCBG, sw: 2.5, s: o.s, op: o.op });
    el('rect', { x: -(o.w || 150) / 2 - 10, y: -9, width: 10, height: 18, rx: 2, fill: o.stroke || ACC }, g);
    el('rect', { x: (o.w || 150) / 2, y: -9, width: 10, height: 18, rx: 2, fill: o.stroke || ACC }, g);
    tx(0, subt ? -3 : 6, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.stroke || ACC }, g);
    if (subt) tx(0, 17, subt, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op }, a || {}));

  // ---------- 1. Kafka Connect 란 ----------
  function s1(t, c) { const { k, u } = c;
    const TX = 410, TY = 150;
    dbIcon(80, 160, 'MySQL', {});
    bucket(880, 160, 'S3 레이크', {});
    const gr = k < 2 ? 0 : k === 2 ? E(u, 0.8, 2.0) : 1;
    topic(TX, TY - 30, 'Kafka 토픽', [3 + 2 * gr, 2 + 2 * gr, 3], { w: 22, h: 22, rh: 28, nums: false });
    if (k === 0) {
      const A = [['연결', 0.3], ['폴링', 0.6], ['오프셋', 0.9], ['재시도', 1.2]], Bc = [['컨슈머', 1.4], ['배치', 1.7], ['파일 롤링', 2.0], ['파티셔닝', 2.3]];
      zone(150, 40, 200, 230, 'MySQL → Kafka 직접 구현', { stroke: WARN, dash: '6 5', fill: 'none', color: WARN, op: fade(u, 0.1) });
      zone(640, 40, 170, 230, 'Kafka → S3 직접 구현', { stroke: WARN, dash: '6 5', fill: 'none', color: WARN, op: fade(u, 1.2) });
      A.forEach(([s, a], i) => pill(250, 86 + i * 44, s, WARN, pop(u, a), { fs: 14 }));
      Bc.forEach(([s, a], i) => pill(725, 86 + i * 44, s, WARN, pop(u, a), { fs: 14 }));
      say(480, 330, '외부 시스템이 하나 늘 때마다 이 코드를 또 짠다', fade(u, 2.3), { 'text-anchor': 'middle', fill: BAD });
      mono(480, 362, '수백 줄 × 시스템 수', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.5) }); return; }
    if (k === 1) {
      ['연결', '폴링', '오프셋', '재시도'].forEach((s, i) => { const f = E(u, 0.2 + i * 0.1, 1.0 + i * 0.1); if (f < 1) pill(lerp(250, 250, f), lerp(86 + i * 44, 160, f), s, WARN, 1 - f * 0.6, { fs: 14 }); });
      plug(250, 160, 'Connector', '플러그인', { s: pop(u, 1.0) });
      snippet(160, 230, ['{ "name": "mysql-orders-source",', '  "connector.class": "…MySqlConnector" }'], { fs: 13.5, op: fade(u, 1.4) });
      card(480, 360, 600, 44, { rx: 22, fill: INK, stroke: 'none', text: 'Connect 프레임워크가 맡는다 · 오프셋 · 재시도 · 스케일링 · 모니터링', fs: 15, color: PANEL, s: pop(u, 2.0) }); return; }
    // k >= 2: 두 방향
    const sIn = k === 2 ? E(u, 0.2, 0.9) : 1, kIn = k === 2 ? E(u, 0.9, 1.6) : 1;
    grow(126, 160, 190, 160, sIn, ACC); plug(255, 160, 'Source', 'Connector', { w: 110, s: k === 2 ? pop(u, 0.3) : 1 }); grow(322, 160, 375, 160, sIn, ACC);
    grow(572, 160, 668, 160, kIn, ACC); plug(735, 160, 'Sink', 'Connector', { w: 110, s: k === 2 ? pop(u, 1.0) : 1 }); grow(800, 160, 828, 160, kIn, ACC);
    if (k === 2) { dot([[126, 160], [190, 160], [320, 160], [400, 130]], seg(u, 0.6, 1.8), ACC, 6); dot([[560, 160], [668, 160], [800, 160], [830, 160]], seg(u, 1.4, 2.6), ACC, 6);
      sub(255, 214, '외부 → Kafka', fade(u, 0.6), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); sub(735, 214, 'Kafka → 외부', fade(u, 1.3), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
      say(480, 300, '가운데는 언제나 Kafka 토픽 하나', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 3) { const T = [['코드 0줄', 'JSON 설정만'], ['200+ 커넥터', '공식·커뮤니티'], ['Worker 분산', '자동 분배·복구'], ['exactly-once', '지원 커넥터'], ['SMT', '가벼운 변환'], ['Schema Registry', 'Avro 연동']];
      T.forEach(([a, b], i) => { const x = 175 + (i % 3) * 305, y = 280 + Math.floor(i / 3) * 74, s = pop(u, 0.2 + i * 0.3);
        card(x, y, 270, 60, { rx: 10, stroke: GOOD, sw: 2, s }); check(x - 112, y, 9, s);
        tx(x - 92, y - 3, a, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); tx(x - 92, y + 18, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); }); return; }
    // k === 4: 쓸 곳과 안 쓸 곳
    const OK = ['DB → Kafka (CDC)', 'Kafka → 레이크 적재', 'Kafka → 검색 엔진'], NO = [['복잡한 비즈니스 변환', 'Streams / Flink'], ['1회성 대량 이관', 'Spark / ETL']];
    OK.forEach((s, i) => { const y = 284 + i * 38, sc = pop(u, 0.2 + i * 0.25); check(80, y - 5, 9, sc); tx(100, y, s, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.25) }); });
    lbl(170, 252, 'Connect 로', fade(u, 0.1), { fill: GOOD, 'font-size': 15 });
    lbl(690, 252, '다른 도구로', fade(u, 1.0), { fill: BAD, 'font-size': 15 });
    NO.forEach(([a, b], i) => { const y = 286 + i * 56, sc = pop(u, 1.1 + i * 0.35); cross(560, y - 5, 8, sc);
      tx(580, y, a, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.35) }); mono(580, y + 22, '→ ' + b, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3 + i * 0.35) }); }); }

  // ---------- 2. Debezium Source ----------
  const BIN = ['INSERT', 'UPDATE', 'INSERT', 'DELETE', 'UPDATE', 'INSERT'];
  function binlog(x, y, upto, cursor) { mono(x, y - 12, 'binlog', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    BIN.forEach((s, i) => { const on = i < upto; card(x + 36 + i * 0, y + 14 + i * 30, 76, 26, { rx: 5, text: s, fs: 13.5, mono: true, stroke: on ? INK : GRID, color: on ? INK : OFF, sw: 1.5 }); });
    if (cursor != null) { const yy = y + 14 + cursor * 30; el('path', { d: `M${x - 6},${yy - 7} L${x + 4},${yy} L${x - 6},${yy + 7} Z`, fill: ACC }); } }
  function s2(t, c) { const { k, u } = c;
    dbIcon(90, 110, 'MySQL', {});
    binlog(42, 210, 6, k >= 2 ? (k === 5 ? Math.min(5, Math.floor(u * 2.2)) : 2) : null);
    const CX = 390, live = k >= 1;
    zone(280, 40, 225, 360, 'Kafka Connect (Worker)', { fill: SOFT });
    card(CX, 110, 180, 52, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.5, text: 'Debezium task-0', fs: 15, color: ACC, s: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) {
      snippet(290, 170, ['"name": "mysql-orders-source"', '"connector.class":', '  "…MySqlConnector"', '"tasks.max": "1"'], { fs: 13.5, w: 205, op: fade(u, 0.7) });
      say(CX, 330, 'binlog 은 한 줄', fade(u, 1.8), { 'text-anchor': 'middle' }); sub(CX, 354, '읽는 태스크도 하나', fade(u, 2.0), { 'font-size': 14.5 }); }
    if (k === 1) { grow(300, 110, 140, 110, E(u, 0.2, 0.9), ACC);
      pill(CX, 180, 'mysql.internal:3306', INK, pop(u, 0.6), { mono: true, fs: 13.5 });
      pill(CX, 222, 'server.id 184054', WARN, pop(u, 1.0), { mono: true, fs: 13.5 });
      sub(CX, 252, '복제 서버처럼 붙는다 · 겹치면 안 된다', fade(u, 1.3), { 'font-size': 13.5 });
      lock(325, 292, true, MUT, pop(u, 1.6)); tx(345, 297, '비밀번호 ← 파일', { 'font-size': 14, 'font-weight': 600, opacity: fade(u, 1.7) }); }
    if (k === 2) { [['shop.orders', true], ['shop.order_items', true], ['그 밖의 테이블', false]].forEach(([n, ok], i) => { const y = 176 + i * 34, s = pop(u, 0.2 + i * 0.25);
        (ok ? check : cross)(300, y - 4, 7, s); mono(316, y + 1, n, { 'font-size': 14, fill: ok ? INK : OFF, opacity: fade(u, 0.3 + i * 0.25) }); });
      const f = E(u, 1.0, 2.0); el('rect', { x: 296, y: 290, width: 190, height: 14, rx: 7, fill: SOFT, stroke: GRID }); el('rect', { x: 296, y: 290, width: 190 * f, height: 14, rx: 7, fill: INFO });
      tx(296, 282, '① initial 스냅샷 (기존 행 전부)', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(296, 330, '② 그다음 binlog 위치부터', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.1) });
      mono(296, 362, 'schema-changes.shop', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.3) }); }
    // 오른쪽: 대상 토픽
    const TX = 640, TY = 80;
    if (k >= 3) { const rows = k === 3 ? Math.min(6, E(u, 0.8, 2.2) * 6) : 6;
      mono(TX - 30, TY - 18, 'shop.shop.orders', { 'font-size': 15, 'font-weight': 700 });
      for (let p = 0; p < Math.floor(rows + 0.001); p++) { const cnt = k === 5 ? (p === 2 ? 2 + E(u, 0.5, 1.0) + E(u, 1.2, 1.7) + E(u, 1.9, 2.4) : [3, 2, 0, 4, 2, 1][p]) : [3, 2, 2, 4, 2, 1][p] * (k >= 4 ? 1 : 0);
        plog(TX, TY + p * 34, 'p' + p, cnt, { slots: 6, w: 30, h: 26, bg: k === 5 && p === 2 ? (i) => (i >= 2 ? WARNBG : ACCBG) : null, col: k === 5 && p === 2 ? (i) => (i >= 2 ? WARN : ACC) : null });
        [0, 1, 2].forEach((r) => el('circle', { cx: TX + 200 + r * 13, cy: TY + p * 34 + 13, r: 4.5, fill: r === 0 ? ACC : OFF })); }
      if (k === 3) { sub(TX + 220, TY + 222, '복제본 3 (rf=3)', fade(u, 2.2), { 'font-size': 13.5 }); } }
    if (k === 3) { pill(CX, 188, 'AvroConverter', INFO, pop(u, 0.3), { mono: true, fs: 13.5 }); card(CX, 262, 180, 52, { rx: 10, stroke: INFO, text: 'Schema Registry\n:8081', fs: 14, color: INFO, s: pop(u, 0.6) });
      grow(CX, 204, CX, 234, E(u, 0.5, 0.8), INFO, { plain: true });
      sub(CX, 330, '키·값 모두 Avro + 스키마 id', fade(u, 1.2), { 'font-size': 13.5 });
      sub(CX, 352, '토픽이 없으면 p=6, rf=3 으로 생성', fade(u, 1.6), { 'font-size': 13.5 }); }
    if (k === 4) { const f = E(u, 0.4, 1.3);
      card(CX, 196, 186, 54, { rx: 8, stroke: MUT, dash: '5 4', text: '{op, before, after}', fs: 14, mono: true, color: MUT, op: 1 - f * 0.7 });
      card(CX, 262, 186, 40, { rx: 8, stroke: ACC, text: '{order_id, …}', fs: 14, mono: true, color: ACC, s: pop(u, 1.0) });
      sub(CX, 296, 'unwrap: after 만 남긴다', fade(u, 1.2), { 'font-size': 13.5 });
      const g = E(u, 1.6, 2.5); fly(CX, 320, 740, 360, g, '깨진 레코드', { fill: BAD, stay: true });
      mono(740, 396, 'shop.dlq (원인은 헤더에)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.3) }); }
    if (k === 5) { pill(CX, 190, 'POST /connectors', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      ['op:"c"', 'op:"u"', 'op:"d"'].forEach((s, i) => { const a = 0.5 + i * 0.7; dot([[CX + 60, 240], [TX - 20, 240], [TX + 80 + i * 31, TY + 2 * 34 + 13]], seg(u, a, a + 0.5), [GOOD, WARN, BAD][i], 7);
        mono(CX - 60, 250 + i * 28, ['INSERT → c', 'UPDATE → u', 'DELETE → d'][i], { 'font-size': 14, fill: [GOOD, WARN, BAD][i], 'font-weight': 700, opacity: fade(u, a) }); });
      sub(TX + 100, TY + 236, '같은 키(order_id)는 같은 파티션', fade(u, 2.3), { 'font-size': 14, fill: INK, 'font-weight': 700 }); } }

  // ---------- 3. Sink ----------
  // 계산: RangeAssignor — 토픽마다 6파티션을 태스크 4개에 [2,2,1,1] 로 → 합치면 4·4·2·2
  const RNG = [0, 0, 1, 1, 2, 3], TCOL = [ACC, INFO, WARN, GOOD];
  function sinkLeft(o) { o = o || {}; const x0 = o.x || 70;
    ['orders', 'order_items'].forEach((n, r) => { mono(x0 - 40, 70 + r * 52, 'shop.shop.' + n, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      for (let p = 0; p < 6; p++) el('rect', { x: x0 + p * 30, y: 78 + r * 52, width: 26, height: 22, rx: 4, fill: PANEL, stroke: TCOL[RNG[p]], 'stroke-width': 2 }); });
    for (let i = 0; i < 4; i++) card(x0 + 12 + i * 52, 190, 46, 32, { rx: 6, text: 't' + i, fs: 14, mono: true, stroke: TCOL[i], color: TCOL[i] });
    sub(x0 + 88, 228, 'S3 Sink 태스크 4', 1, { 'font-size': 13.5 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) {
      [['shop.shop.orders', true], ['shop.shop.order_items', true], ['schema-changes.shop', false], ['shop.dlq', false]].forEach(([n, ok], i) => { const y = 64 + i * 34, s = pop(u, 0.2 + i * 0.2);
        (ok ? check : cross)(640, y - 5, 8, s); mono(660, y, n, { 'font-size': 14.5, fill: ok ? INK : OFF, opacity: fade(u, 0.25 + i * 0.2) }); });
      mono(640, 22, 'topics.regex = shop\\.shop\\..*', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.1) });
      ['orders', 'order_items'].forEach((n, r) => { mono(40, 60 + r * 70, 'shop.shop.' + n, { 'font-size': 14, fill: MUT, 'font-weight': 700 });
        for (let p = 0; p < 6; p++) { const x = 60 + p * 64, y = 70 + r * 70, a = 1.0 + p * 0.12, g = E(u, a, a + 0.5), ti = RNG[p], tx2 = 90 + ti * 130;
          el('rect', { x, y, width: 54, height: 28, rx: 5, fill: PANEL, stroke: g > 0.5 ? TCOL[ti] : INK, 'stroke-width': 2 }); mono(x + 27, y + 19, 'p' + p, { 'font-size': 14, 'text-anchor': 'middle' });
          if (g > 0) el('line', { x1: x + 27, y1: y + 28, x2: lerp(x + 27, tx2, g), y2: lerp(y + 28, 300, g), stroke: TCOL[ti], 'stroke-width': 1.6, opacity: 0.7 }); } });
      [4, 4, 2, 2].forEach((n, i) => { card(90 + i * 130, 318, 104, 40, { rx: 8, text: 'task-' + i, fs: 15, mono: true, stroke: TCOL[i], color: TCOL[i], s: pop(u, 0.6 + i * 0.1) });
        mono(90 + i * 130, 362, n + '개', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: TCOL[i], opacity: fade(u, 1.9) }); });
      sub(780, 260, '파티션 12개를 기본 range 배정으로', fade(u, 2.0), { 'font-size': 14 }); sub(780, 284, '태스크가 넘치면 노는 태스크가 생긴다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k !== 5) { sinkLeft(); grow(300, 150, 360, 150, 1, ACC); }
    if (k === 1) { bucket(520, 160, null, { s: pop(u, 0.2) }); mono(520, 240, 's3://data-lake-prod/shop/', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.5) });
      sub(520, 264, 'ap-northeast-2', fade(u, 0.7), { 'font-size': 13.5 });
      fileIcon(720, 140, 'Parquet', { s: pop(u, 1.0), stroke: ACC }); pill(820, 140, 'snappy 압축', ACC, pop(u, 1.3), { fs: 13.5 });
      mono(720, 230, 's3.part.size = 5242880', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); sub(720, 252, '업로드 조각 5 MiB', fade(u, 1.8), { 'font-size': 13.5 });
      say(620, 330, 'Athena·Spark 가 바로 읽는 컬럼 포맷', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { const T = [['shop/', 0], ['shop.shop.orders/', 1], ['year=2024/', 2], ['month=05/', 3], ['day=06/', 4]];
      T.forEach(([n, d], i) => { const x = 420 + d * 26, y = 60 + i * 44, a = 0.2 + i * 0.3;
        if (i) grow(x - 14, y - 34, x - 14, y - 6, E(u, a - 0.1, a + 0.1), MUT, { plain: true, sw: 1.6 });
        mono(x, y, n, { 'font-size': 15, 'font-weight': 700, fill: i >= 2 ? ACC : INK, opacity: fade(u, a) }); });
      card(760, 110, 250, 64, { rx: 10, stroke: INK, text: 'created_at\n2024-05-06 09:12 (예시)', fs: 14, mono: true, s: pop(u, 1.4) });
      grow(700, 145, 590, 230, E(u, 1.7, 2.3), ACC);
      sub(700, 320, '적재 시각이 아니라 레코드 시각으로 나눈다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      sub(700, 344, 'timezone = Asia/Seoul · 하루 = 86400000 ms', fade(u, 2.4), { 'font-size': 13.5 }); return; }
    if (k === 3) { const n = Math.round(E(u, 0.2, 1.8) * 1000), f = n / 1000;
      el('rect', { x: 400, y: 90, width: 300, height: 26, rx: 6, fill: SOFT, stroke: GRID }); el('rect', { x: 400, y: 90, width: 300 * f, height: 26, rx: 6, fill: ACC, opacity: 0.8 });
      mono(400, 80, 'flush.size', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(700, 80, n + ' / 1000', { 'font-size': 14.5, 'text-anchor': 'end', 'font-weight': 700 });
      clock(780, 103, 24, E(u, 0.2, 1.8) * 0.6, WARN, 'rotate 5분');
      tx(400, 160, '먼저 오는 쪽이 파일을 닫는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      fileIcon(470, 230, 'part 파일', { s: pop(u, 1.9), stroke: ACC });
      pill(620, 230, 'value: Avro 해석', INFO, pop(u, 2.1), { fs: 13.5 });
      fly(400, 300, 760, 300, seg(u, 2.0, 2.6), '해석 실패', { fill: BAD, stay: true }); mono(760, 340, 's3-sink.dlq', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.4) }); return; }
    if (k === 4) { // ES · JDBC: 같은 키가 두 번 오면 덮어쓴다(upsert)
      zone(380, 40, 260, 230, 'Elasticsearch', { fill: 'none', stroke: INFO, color: INFO });
      zone(670, 40, 270, 230, 'JDBC (Postgres)', { fill: 'none', stroke: GOOD, color: GOOD });
      [0, 1].forEach((j) => { const x0 = j ? 690 : 400, col = j ? GOOD : INFO;
        mono(x0, 84, j ? 'order_id │ amount' : '_id │ doc', { 'font-size': 14, fill: MUT });
        const f = E(u, 1.2, 1.9);
        mono(x0, 116, j ? '1001     │ ' + (f > 0.5 ? '15000' : '12000') : '1001 │ ' + (f > 0.5 ? 'v2' : 'v1'), { 'font-size': 14.5, 'font-weight': 700, fill: f > 0.5 ? col : INK, opacity: fade(u, 0.4) });
        if (f > 0 && f < 1) el('rect', { x: x0 - 6, y: 98, width: 220, height: 26, rx: 5, fill: col, opacity: 0.18 * Math.sin(f * Math.PI) });
        sub(x0 + 100, 160, j ? 'auto.create · upsert' : 'write.method = upsert', fade(u, 1.6), { 'font-size': 13.5 });
        sub(x0 + 100, 184, j ? 'pk = record_key' : 'key.ignore = false', fade(u, 1.8), { 'font-size': 13.5 }); });
      fly(320, 300, 520, 116, seg(u, 0.9, 1.4), 'key 1001', { mono: true }); fly(320, 300, 810, 116, seg(u, 0.9, 1.4), 'key 1001', { mono: true });
      say(660, 320, '같은 키가 다시 오면 새 행이 아니라 덮어쓰기', fade(u, 2.1), { 'text-anchor': 'middle' });
      sub(660, 346, '구조는 같다: class · topics · 목적지 · 변환 · 에러', fade(u, 2.4), { 'font-size': 13.5 }); return; }
    // k === 5: 한 토픽 · Sink 셋 · 그룹마다 따로 진도 (위치는 예시)
    mono(60, 60, 'shop.shop.orders · p0', { 'font-size': 15, 'font-weight': 700 }); mono(520, 60, '← 오프셋', { 'font-size': 13.5, fill: MUT });
    plog(60, 74, null, 10, { slots: 12, w: 34, h: 30 });
    const G3 = [['connect-es-orders-sink', 9, INFO], ['connect-jdbc-warehouse-sink', 8, GOOD], ['connect-s3-orders-sink', 6, ACC]];
    G3.forEach(([g, off, col], i) => { const s = pop(u, 0.3 + i * 0.4), f = E(u, 0.3 + i * 0.4, 0.9 + i * 0.4), x = 60 + off * 37 + 17, y = 170 + i * 70;
      el('path', { d: `M${x - 7},${116} L${x},${108} L${x + 7},${116}`, fill: col, opacity: s });
      el('polyline', { points: f > 0.99 ? `${x},116 ${x},${y} 595,${y}` : `${x},116 ${x},${lerp(116, y, f)}`, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-dasharray': '4 3' });
      card(720, y, 250, 34, { rx: 17, text: g, fs: 13.5, mono: true, stroke: col, color: col, s });
    });
    say(480, 390, 'Sink 마다 컨슈머 그룹과 커밋 오프셋이 따로다', fade(u, 1.8), { 'text-anchor': 'middle' }); }

  // ---------- 4. REST API + Worker ----------
  const WX = [170, 480, 790];
  function workers(list, o) { o = o || {};
    list.forEach((w, i) => { const x = WX[i], dead = o.dead === i, s = o.s ? o.s(i) : 1;
      card(x, 270, 270, 210, { rx: 12, stroke: dead ? BAD : INK, sw: 2.2, s, fill: dead ? BADBG : PANEL });
      mono(x - 120, 190, w.id, { 'font-size': 15, 'font-weight': 800, fill: dead ? BAD : INK, opacity: s });
      mono(x + 120, 190, dead ? 'DOWN' : ':8083', { 'font-size': 13.5, 'text-anchor': 'end', fill: dead ? BAD : MUT, opacity: s });
      w.tasks.forEach((tk, j) => { if (o.hide && o.hide(tk)) return; const st = (o.chip && o.chip(tk, i, j)) || {}, y = 222 + j * 38;
        card(x + (st.dx || 0), y + (st.dy || 0), 240, 30, { rx: 6, text: tk, fs: 13.5, mono: true, stroke: st.col || ACC, fill: st.fill || ACCBG, color: st.col || ACC, s: st.s ?? 1, op: st.op ?? 1 }); }); }); }
  function curl(x, y, s, sc, col) { return card(x, y, tw(s, 14) + 30, 34, { rx: 8, fill: INK, stroke: 'none', text: s, fs: 14, mono: true, color: col || PANEL, s: sc }); }
  function s4(t, c) { const { k, u } = c, W = c.beat.workers || [];
    if (k === 0) { workers(W.map((w) => ({ id: w.id, tasks: [] })), {});
      curl(200, 50, 'GET /connector-plugins', pop(u, 0.2)); curl(560, 50, 'POST /connectors', pop(u, 0.6), 'var(--hl)');
      dot([[560, 70], [790, 160]], seg(u, 0.8, 1.4), ACC, 7); dot([[700, 190], [260, 190]], seg(u, 1.5, 2.1), ACC, 6);
      sub(560, 130, '아무 Worker 에 보내도 된다', fade(u, 1.0), { 'font-size': 14, fill: INK, 'font-weight': 700 });
      sub(480, 400, '받은 Worker 가 클러스터에 전달', fade(u, 1.8), { 'font-size': 13.5 });
      card(170, 222, 240, 30, { rx: 6, text: 'mysql-orders-source-0', fs: 13.5, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 2.1) }); return; }
    if (k === 1) { workers(W, { chip: (tk, i, j) => ({ s: pop(u, 0.2 + (i * 3 + j) * 0.15) }) });
      ['GET /connectors', 'GET /connectors/{name}', 'GET /connectors/{name}/status'].forEach((s, i) => curl(160 + i * 300, 50, s, pop(u, 1.4 + i * 0.3)));
      sub(480, 100, '목록 · 설정 · 상태는 다른 주소다', fade(u, 2.3), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { workers(W, { chip: (tk) => (tk === 'mysql-orders-source-0' ? { col: GOOD, fill: GOODBG } : { op: 0.45 }) });
      snippet(360, 24, ['"connector": { "state": "RUNNING" }', '"tasks": [ { "id": 0, "state": "RUNNING",', '            "worker_id": "connect-1:8083" } ]'], { fs: 13.5, op: fade(u, 0.3) });
      say(40, 60, '커넥터 RUNNING ≠', fade(u, 1.4), { fill: BAD }); say(40, 86, '태스크 RUNNING', fade(u, 1.6), { fill: BAD });
      sub(130, 130, '실제로 일하는 건 tasks', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 3) { const p = E(u, 0.4, 1.0);
      workers(W.map((w) => ({ id: w.id, tasks: w.tasks })), { chip: (tk) => (tk === 'mysql-orders-source-0' ? { col: p > 0.5 ? WARN : ACC, fill: p > 0.5 ? WARNBG : ACCBG } : {}) });
      curl(200, 50, 'PUT …/pause', pop(u, 0.2)); curl(420, 50, 'PUT …/resume', pop(u, 1.0)); curl(700, 50, 'PUT …/config', pop(u, 1.6));
      mono(170 + 108, 228, p > 0.5 ? '❚❚' : '', { 'font-size': 14, fill: WARN, 'text-anchor': 'end' });
      sub(700, 100, 'PUT 은 설정 JSON 통째 교체', fade(u, 1.9), { 'font-size': 14, fill: INK, 'font-weight': 700 });
      sub(700, 124, '최신 버전엔 PATCH 도 있다', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    if (k === 4) { const gone = E(u, 1.2, 1.8);
      workers(c.prev.workers, { chip: (tk) => (tk === 'mysql-orders-source-0' ? { col: gone > 0 ? BAD : ACC, fill: gone > 0 ? BADBG : ACCBG, op: 1 - gone } : {}) });
      curl(200, 50, 'POST …/tasks/0/restart', pop(u, 0.2)); curl(560, 50, 'DELETE /connectors/…', pop(u, 1.0), 'var(--hl)');
      if (gone > 0.3) cross(170, 222, 12, pop(u, 1.3));
      el('rect', { x: 360, y: 92, width: 360, height: 58, rx: 10, fill: WARNBG, stroke: WARN, opacity: fade(u, 1.8) });
      tx(380, 116, '설정은 지워지지만 오프셋은 남는다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) });
      mono(380, 140, 'GET …/offsets 로 위치를 남겨 둔다', { 'font-size': 13.5, opacity: fade(u, 2.1) }); return; }
    // k === 5: Worker 하나가 죽으면
    const dead = u > 0.4, mv = E(u, 1.6, 2.4);
    workers(W, { dead: dead ? 2 : -1, hide: (tk) => false,
      chip: (tk, i, j) => (i === 2 ? { dx: lerp(0, j === 0 ? -620 : -310, mv), dy: lerp(0, j === 0 ? 3 * 38 : 1 * 38, mv), col: mv > 0 ? WARN : ACC, fill: mv > 0 ? WARNBG : ACCBG } : {}) });
    if (dead) cross(790, 160, 14, pop(u, 0.4));
    clock(900, 60, 22, E(u, 0.6, 1.5), WARN, null);
    tx(870, 100, '최대 5분 기다림', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 0.8) });
    mono(870, 122, 'scheduled.rebalance.max.delay.ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.0) });
    say(40, 60, '같은 group.id = 한 클러스터', fade(u, 0.2)); sub(220, 88, '남은 Worker 가 태스크를 나눠 받는다 (배치는 예시)', fade(u, 2.2), { 'font-size': 13.5 }); }

  // ---------- 5. SMT ----------
  const ST = ['unwrap', 'mask', 'header', 'rename', 'cast'], SX = (i) => 200 + i * 128;
  function recLines(level) {   // level = 몇 번째 SMT 까지 지났나
    if (level < 1) return [['op: "c", before: null,', INK], ['after: { order_id: 1,', INK], ['  card_number: "4111-1111-1111-1234",', INK], ['  price: "19900", created: … } }', INK]];
    const L = [];
    L.push(['order_id: 1', INK]);
    L.push([level >= 2 ? 'card_number: "****-****-****-****"' : 'card_number: "4111-1111-1111-1234"', level === 2 ? ACC : INK]);
    L.push([level >= 5 ? 'price: 19900.0' : 'price: "19900"', level === 5 ? ACC : INK]);
    L.push([level >= 4 ? 'created_at: …' : 'created: …', level === 4 ? ACC : INK]);
    return L; }
  function s5(t, c) { const { k, u } = c;
    dbIcon(60, 110, null, { s: 0.75 }); mono(60, 170, 'binlog', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
    topic(860, 74, null, [3, 2, 3], { w: 18, h: 20, rh: 26, nums: false, slots: 3 }); lbl(880, 170, '토픽', 1, { 'font-size': 15 });
    el('line', { x1: 104, y1: 110, x2: 800, y2: 110, stroke: GRID, 'stroke-width': 3 });
    const shown = k === 0 ? 0 : 5, level = k <= 1 ? 0 : Math.min(5, k - 1);
    for (let i = 0; i < shown; i++) { const on = i < level, cur = i === level - 1, s = k === 1 ? pop(u, 0.2 + i * 0.25) : 1;
      card(SX(i), 110, 104, 48, { rx: 10, stroke: on ? ACC : MUT, dash: on ? null : '5 4', fill: cur ? ACCBG : PANEL, sw: cur ? 2.8 : 2, text: ST[i], fs: 15, mono: true, color: on ? ACC : MUT, s });
      mono(SX(i), 160, String(i + 1), { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: on ? ACC : MUT, opacity: s }); }
    if (k === 0) { dot([[104, 110], [800, 110]], seg(u, 0.3, 1.6), INK, 7); sub(450, 90, '변환 없음: binlog 모양 그대로 흐른다', fade(u, 0.6), { 'font-size': 14.5 }); }
    if (k === 1) sub(450, 196, 'transforms = "unwrap,mask,header,rename,cast" · 적은 순서 = 적용 순서', fade(u, 1.5), { 'font-size': 14 });
    if (k >= 2 && k <= 6) dot([[104, 110], [SX(level - 1), 110]], seg(u, 0.2, 1.0), ACC, 7);
    if (k <= 6) { const L = recLines(level), prevL = k >= 2 ? recLines(level - 1) : null, sw = k >= 2 ? E(u, 1.0, 1.5) : 1;
      el('rect', { x: 230, y: 214, width: 500, height: 128, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      (sw < 0.5 && prevL ? prevL : L).forEach(([s, col], i) => mono(250, 244 + i * 26, s, { 'font-size': 14.5, fill: sw < 0.5 ? INK : col, 'font-weight': col === ACC ? 700 : 400 }));
      if (k === 4) { card(840, 250, 190, 34, { rx: 17, stroke: INFO, fill: INFOBG, text: 'source=mysql-prod', fs: 13.5, mono: true, color: INFO, s: pop(u, 1.3) });
        sub(840, 290, '헤더 · 본문은 그대로', fade(u, 1.7), { 'font-size': 13.5 }); }
      const note = ['', '', 'Debezium 봉투를 벗겨 after 만', 'card_number · cvc 를 가린다', '어디서 왔는지 헤더에 남긴다', 'created → created_at, updated → updated_at', '문자열 price · amount → float64'][k];
      if (note) say(480, 380, note, fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    // k === 7: 되는 일과 안 되는 일
    el('rect', { x: 0, y: 190, width: 960, height: 230, fill: PANEL });
    lbl(250, 226, 'SMT 로 (1건 → 1건, 상태 없음)', fade(u, 0.2), { fill: GOOD });
    ['필드 추가 · 제거 · 이름 변경', '마스킹 · 타입 변환', '토픽 라우팅'].forEach((s, i) => { const y = 266 + i * 40; check(80, y - 5, 8, pop(u, 0.3 + i * 0.2)); tx(100, y, s, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 0.35 + i * 0.2) }); });
    lbl(720, 226, 'Streams · Flink 로', fade(u, 1.0), { fill: BAD });
    ['여러 메시지 집계 (window)', '두 토픽 조인', '상태가 필요한 일', '외부 API 호출'].forEach((s, i) => { const y = 266 + i * 36; cross(570, y - 5, 7, pop(u, 1.1 + i * 0.2)); tx(590, y, s, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 1.15 + i * 0.2) }); }); }

  // ---------- 확인 문제 ----------
  const quiz = [
    { q: 'Kafka Connect를 쓸 때 개발자가 직접 하지 않아도 되는 일은 무엇인가?',
      o: ['커넥터 설정 JSON을 쓰는 일', '오프셋 관리와 재시도, 태스크 분산', '어느 토픽을 쓸지 정하는 일'], a: 1,
      why: '오프셋·재시도·스케일링은 프레임워크가 맡는다. 사람은 커넥터 클래스와 대상, 토픽 같은 설정만 JSON으로 적는다.' },
    { q: 'Debezium MySQL 커넥터의 tasks.max를 1로 두는 이유는 무엇인가?',
      o: ['binlog는 순서가 하나뿐이라 한 태스크가 차례대로 읽어야 해서', 'Avro 변환이 한 번에 하나만 되어서', '토픽 파티션이 1개뿐이어서'], a: 0,
      why: 'binlog는 한 줄로 이어진 변경 기록이다. 태스크를 늘려도 나눠 읽을 수 없고, 결과 토픽은 파티션 6개로 따로 만든다.' },
    { q: 'S3 Sink의 tasks.max를 4로 두고 파티션 6개짜리 토픽 2개를 구독하면, 기본 range 배정에서 태스크별 파티션 수는 어떻게 되는가?',
      o: ['3·3·3·3', '6·6·0·0', '4·4·2·2'], a: 2,
      why: 'range 배정은 토픽마다 6개를 2·2·1·1로 나누고, 두 토픽 몫을 합치면 4·4·2·2가 된다. 고르게 나누려면 round-robin이나 sticky 배정을 쓴다.' },
    { q: '운영 중 커넥터 상태가 RUNNING인데 데이터가 안 들어온다. 먼저 볼 것은 무엇인가?',
      o: ['GET /connectors 목록', 'GET …/status의 tasks[].state', 'GET /connector-plugins'], a: 1,
      why: '커넥터와 태스크의 state는 따로 나온다. 커넥터가 RUNNING이어도 실제로 일하는 태스크가 FAILED일 수 있다.' },
    { q: '주문마다 지난 1시간 합계를 붙여 보내야 한다. 이 일을 맡길 곳은 어디인가?',
      o: ['Cast SMT', 'InsertHeader SMT', 'Kafka Streams 같은 상태 있는 처리기'], a: 2,
      why: 'SMT는 메시지 한 건을 한 건으로 바꾸는 무상태 변환만 한다. 여러 메시지를 모으는 집계는 Streams나 Flink가 맡는다.' },
  ];

  // ---------- 정리 · 복습 ----------
  const summary = [
    'DB나 S3를 Kafka와 이을 때마다 연결·폴링·오프셋·재시도 코드를 새로 짜게 된다.',
    'Connect는 이 일을 커넥터 플러그인과 JSON 설정 하나로 바꾸고 오프셋은 프레임워크가 챙긴다.',
    'Source는 binlog를 읽어 토픽에 쌓고, Sink는 토픽을 그룹마다 따로 읽어 S3·ES·DB로 옮긴다.',
    '커넥터를 지워도 오프셋은 남고, 한 건짜리 가벼운 변환만 SMT에 맡긴다.',
  ];
  const review = [
    { q: 'S3 Sink 태스크를 8개로 늘렸는데 처리량이 그대로다. 구독하는 토픽은 파티션 6개짜리 하나다. 먼저 의심할 것은?',
      o: ['S3 리전이 멀다', '태스크가 파티션 수보다 많아 2개는 놀고 있다', 'Parquet 압축이 느리다'], a: 1,
      why: '파티션 하나는 그룹 안 태스크 하나만 읽는다. 파티션 6개에 태스크 8개면 2개는 받을 파티션이 없다.' },
    { q: 'Debezium 커넥터를 지우고 같은 이름으로 다시 만들었더니 처음부터 다시 읽지 않았다. 왜 그런가?',
      o: ['binlog가 지워져서', 'snapshot.mode가 initial이 아니어서', 'DELETE는 설정만 지우고 오프셋은 오프셋 토픽에 남아서'], a: 2,
      why: '커넥터 삭제는 태스크를 멈추고 설정을 지운다. 진행 위치는 남아 있어 같은 이름이면 이어 읽고, 처음부터 읽으려면 오프셋을 따로 지워야 한다.' },
    { q: '같은 주문 토픽을 S3·ES·Postgres로 보내는데 ES만 느려졌다. S3 적재는 어떻게 되는가?',
      o: ['그대로 진행된다. Sink마다 컨슈머 그룹과 오프셋이 따로다', 'ES가 따라올 때까지 함께 멈춘다', 'ES 쪽 메시지가 S3로 넘어간다'], a: 0,
      why: 'Sink 커넥터는 connect-<이름> 그룹으로 각자 읽고 각자 오프셋을 커밋한다. 한 Sink가 밀려도 다른 Sink는 기다리지 않는다.' },
  ];

  R.page({ title: 'Kafka Connect 데이터 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
