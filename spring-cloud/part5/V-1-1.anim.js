/* V-1-1 Micrometer Tracing — 장면 4개 (../../anim/engine.js 규칙을 따른다)
 * 그림 재료: 서비스 4곳의 로그 줄, traceId 리본, 의존성 층(API · bridge · reporter · AOP),
 *           traceparent 헤더 조각, span 막대(폭포수). 숫자는 페이지 코드 주석·STEPS 데이터에서만 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const SVC = [['gateway', INFO], ['order', ACC], ['payment', WARN], ['inventory', GOOD]];
  const LOGS = [   // without-tracing.yaml L3–6
    ['[gateway]  ', '10:00:00.123', 'POST /api/orders  200', 0],
    ['[order]    ', '10:00:00.140', 'create order id=42', 1],
    ['[payment]  ', '10:00:00.310', 'charge failed 502', 2],
    ['[inventory]', '10:00:00.155', 'reserve stock sku=A', 3],
  ];
  const TID = '3a2f…c1';
  function head(s, op) { tx(40, 40, s, { 'font-size': 17, 'font-weight': 800, opacity: op ?? 1 }); }
  function svcRow(y, f) { SVC.forEach(([n, col], i) => { const o = f ? f(i) : {}; pill(150 + i * 220, y, n, o.col || col, o.s ?? 1, { fs: 15, mono: true, op: o.op }); }); }
  function logLine(x, y, L, o) { o = o || {}; const [svc, ts, msg, si] = L, col = SVC[si][1], op = o.op ?? 1;
    R.spans(x, y, [[svc + ' ', { fill: col, 'font-weight': 700 }], [ts + '  ', { fill: MUT }], [msg, { fill: o.red ? BAD : INK }]], { 'font-size': o.fs || 15, opacity: op }); }

  // ---------- 1. 로그만으로는 못 쫓는다 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { head('서비스 4곳이 각자 남긴 로그');
      svcRow(90, (i) => ({ s: pop(u, 0.2 + i * 0.15) }));
      zone(110, 140, 740, 210, null, { fill: SOFT, stroke: GRID, sw: 1.5 });
      mono(130, 166, 'all-services.log', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
      mono(770, 166, 'traceId', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.5) });
      LOGS.forEach((L, i) => { const at = 0.7 + i * 0.35, y = 205 + i * 38, sx = 150 + L[3] * 220;
        dot([[sx, 108], [sx, y - 6]], seg(u, at - 0.35, at), SVC[L[3]][1], 6);
        logLine(130, y, L, { op: fade(u, at, 0.3) });
        lbl(800, y, '?', fade(u, at + 0.2), { fill: BAD, 'font-size': 18 }); });
      sub(480, 390, '형식도 시각도 제각각 · 묶어 줄 ID가 없다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1) { head('동시 요청이 섞이면');
      svcRow(70, () => ({ op: 0.45 }));
      zone(110, 100, 740, 286, null, { fill: SOFT, stroke: GRID, sw: 1.5 });
      const rows = 12, rh = 22, mine = [1, 4, 7, 10], f = E(u, 0.2, 1.1);
      for (let r = 0; r < rows; r++) { const y = 128 + r * rh; if (mine.includes(r)) continue;
        const w = 260 + ((r * 97) % 230), s = clamp(f * 12 - r * 0.6);
        el('rect', { x: 130, y: y - 11, width: w * s, height: 12, rx: 6, fill: OFF, opacity: 0.7 }); }
      LOGS.forEach((L, i) => { const y0 = 205 + i * 38, y1 = 128 + mine[i] * rh; logLine(130, lerp(y0, y1, f) + 2, L, { fs: 14 }); });
      [0, 1, 2, 3].forEach((i) => lbl(820, 128 + mine[i] * rh + 2, '?', fade(u, 1.3 + i * 0.15), { fill: BAD, 'font-size': 17 }));
      pill(480, 400, '동시 요청 100개면 로그 400줄', BAD, pop(u, 1.9), { fs: 15 }); return; }
    if (k === 2) { head('어느 구간이 느렸나 — 시각을 사람이 뺀다');
      const X = (ms) => 140 + (ms - 100) / 230 * 700;
      el('line', { x1: 120, y1: 250, x2: lerp(120, 860, E(u, 0.1, 0.8)), y2: 250, stroke: MUT, 'stroke-width': 2 });
      [100, 150, 200, 250, 300].forEach((v) => mono(X(v), 274, '.' + v, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) }));
      LOGS.map((L) => [L, +L[1].slice(-3)]).sort((a, b) => a[1] - b[1]).forEach(([L, ms], i) => { const at = 0.6 + i * 0.3, x = X(ms), col = SVC[L[3]][1], y = 130 + (i % 2) * 50;
        grow(x, y + 26, x, 244, E(u, at, at + 0.3), col, { plain: true, sw: 2.5 }); el('circle', { cx: x, cy: 250, r: 6 * pop(u, at + 0.2), fill: col });
        mono(x, y, L[0].trim(), { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, at) });
        mono(x, y + 2 + 16, '.' + ms, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, at) }); });
      const a = X(140), b = X(310), f = E(u, 1.8, 2.3);
      el('path', { d: `M${a},300 V312 H${lerp(a, b, f)} V300`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: f > 0 ? 1 : 0 });
      mono((a + b) / 2, 340, '310 − 140 = 170ms', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      sub(480, 380, '전체 250ms 중 170ms가 어디서 샜는지, 구간 정보 없이 뺄셈으로만 안다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 3) { head('payment 502는 누구의 요청이었나');
      const P = { g: [480, 100], o: [300, 210], i: [660, 210], p: [300, 320] };
      [['g', 'gateway', INFO], ['o', 'order', ACC], ['i', 'inventory', GOOD], ['p', 'payment', WARN]].forEach(([key, n, col], j) =>
        card(P[key][0], P[key][1], 150, 48, { rx: 10, stroke: key === 'p' ? BAD : col, sw: 2.5, text: n, mono: true, color: key === 'p' ? BAD : col, s: pop(u, 0.1 + j * 0.12) }));
      pill(300 + 170, 320, 'charge failed 502', BAD, pop(u, 0.7), { fs: 14, mono: true });
      // 위로 거슬러 오르려다 끊기는 선
      const f1 = E(u, 1.0, 1.5), f2 = E(u, 1.5, 2.0);
      el('line', { x1: 300, y1: 296, x2: 300, y2: lerp(296, 262, f1), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
      lbl(320, 272, '?', f1 > 0.9 ? 1 : 0, { fill: BAD, 'font-size': 20 });
      el('line', { x1: 375, y1: 200, x2: lerp(375, 420, f2), y2: lerp(200, 140, f2), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
      lbl(440, 168, '?', f2 > 0.9 ? 1 : 0, { fill: BAD, 'font-size': 20 });
      card(760, 330, 300, 62, { rx: 10, stroke: GRID, sw: 1.5, fill: SOFT, s: pop(u, 2.1), text: '부모-자식 관계가 기록되지 않아\n위로 거슬러 오를 수 없다', fs: 14, fw: 600, color: INK }); return; }
    // k4: context 소실 → traceId 리본
    head('홉마다 context를 손으로 넘기다 잃는다');
    const xs = [150, 370, 590, 810];
    svcRow(120, () => ({}));
    [['userId', 0], ['tenantId', 1]].forEach(([n, j]) => { const f = E(u, 0.3 + j * 0.15, 1.3 + j * 0.15), x = lerp(xs[0], xs[2], f), drop = seg(u, 1.3 + j * 0.15, 1.8 + j * 0.15);
      pill(x, 176 + j * 34 + drop * 40, n, MUT, 1, { fs: 13.5, mono: true, op: 1 - drop * 0.8 }); });
    cross(xs[2] + 70, 196, 10, pop(u, 1.6));
    // 해법: 한 ID 가 네 서비스를 관통한다
    const g = E(u, 1.9, 2.5);
    el('line', { x1: 90, y1: 310, x2: lerp(90, 870, g), y2: 310, stroke: ACC, 'stroke-width': 10, 'stroke-linecap': 'round', opacity: 0.85 });
    xs.forEach((x, i) => el('circle', { cx: x, cy: 310, r: 9 * pop(u, 2.0 + i * 0.1), fill: PANEL, stroke: ACC, 'stroke-width': 3 }));
    mono(480, 290, 'traceId ' + TID, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
    sub(480, 350, '요청 하나에 ID 하나를 붙여 모든 홉이 실어 나른다 · Micrometer Tracing', fade(u, 2.4), { 'font-size': 15 }); }

  // ---------- 2. 의존성 층 ----------
  const LAY = [[90, 'micrometer-tracing', 'Tracer · Span 인터페이스'], [178, 'bridge', ''], [266, 'zipkin-reporter-brave', 'span을 밖으로 보낸다'], [350, 'starter-aop', '@Observed 프록시']];
  function stack(k, u) {
    tx(40, 40, 'build.gradle의 층', { 'font-size': 17, 'font-weight': 800 });
    LAY.forEach(([y, n, d], i) => { if (i > k && !(k === 4)) return; const now = i === k, dropY = now ? lerp(-40, 0, E(u, 0.1, 0.6)) : 0, op = now ? fade(u, 0.1, 0.3) : 1;
      if (i === 1) { // bridge: 두 칸 중 하나
        tx(60, y - 26 + dropY, 'bridge (하나만)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op });
        card(150, y + 6 + dropY, 180, 46, { rx: 8, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'Brave', mono: true, color: ACC, op });
        card(345, y + 6 + dropY, 180, 46, { rx: 8, stroke: OFF, sw: 2, dash: '6 5', text: 'OTel (주석)', mono: true, color: MUT, op });
        return; }
      card(245, y + dropY, 390, i === 0 ? 56 : 50, { rx: 8, stroke: i === 0 ? INK : i === 2 ? INFO : WARN, sw: 2.2, dash: i === 0 ? '7 5' : null, op });
      mono(64, y - 2 + dropY, n, { 'font-size': 15, 'font-weight': 700, opacity: op, fill: i === 2 ? INFO : i === 3 ? WARN : INK });
      tx(64, y + 17 + dropY, d, { 'font-size': 13.5, fill: MUT, opacity: op }); }); }
  function s2(t, c) { const { k, u } = c;
    stack(k, u);
    el('line', { x1: 470, y1: 60, x2: 470, y2: 390, stroke: GRID, 'stroke-width': 1.5 });
    const SX = 700, SY = 130;
    if (k <= 2) {
      card(SX, SY, 220, 70, { rx: 12, stroke: INK, sw: 2.5, text: 'order-service', mono: true });
      grow(500, SY, SX - 112, SY, 1, MUT);
      dot([[500, SY], [SX - 110, SY], [SX + 110, SY], [920, SY]], seg(u, 0.4, 1.6), INK, 7);
      tx(SX, SY - 52, 'HTTP 요청', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      if (k === 0) { card(SX, 250, 260, 70, { rx: 10, stroke: OFF, sw: 2, dash: '6 5', s: pop(u, 1.2), text: '기록된 span 0개\n(구현체가 없다)', fs: 15, color: MUT }); return; }
      const sp = pop(u, k === 1 ? 1.0 : 0);
      el('rect', { x: SX - 90, y: SY + 46, width: 180 * sp, height: 18, rx: 5, fill: ACC });
      mono(SX, SY + 90, 'span 1', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: sp });
      if (k === 1) { sub(SX, 300, 'Brave가 Tracer를 구현해 span이 생긴다', fade(u, 1.4), { 'font-size': 15 });
        sub(SX, 330, '두 bridge를 함께 넣으면 Tracer 빈이 충돌한다', fade(u, 1.9), { 'font-size': 14 }); return; }
      // k2: 내보내는 통로
      grow(SX, SY + 104, SX, 300, E(u, 0.3, 0.9), INFO, { sw: 3 });
      card(SX, 340, 200, 54, { rx: 10, stroke: INFO, sw: 2.5, fill: INFOBG, text: 'Zipkin :9411', mono: true, color: INFO, s: pop(u, 0.8) });
      fly(SX, SY + 104, SX, 330, seg(u, 1.2, 2.2), 'span', { fill: ACC });
      sub(SX + 10, 400, '리포터가 없으면 span은 프로세스 안에서 사라진다', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 3) {
      const r = E(u, 0.5, 1.3);
      card(SX, 200, 220, 64, { rx: 10, stroke: INK, sw: 2.5, text: 'create(req)', mono: true });
      el('rect', { x: SX - 130, y: 140, width: 260, height: 120 * r + 0.1, rx: 14, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: r > 0 ? 1 : 0 });
      tx(SX - 118, 132, '@Observed 프록시', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      pill(SX, 320, 'annotations.enabled=true', WARN, pop(u, 1.7), { fs: 14, mono: true });
      sub(SX, 365, 'Boot 3.2 이상은 이 설정도 켜야 애노테이션이 동작한다', fade(u, 2.0), { 'font-size': 14 }); return; }
    // k4: 요청 1개 = trace 1개 = span 여러 개
    tx(500, 92, '요청 1개 = trace 1개', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
    const N = [['gateway', 'span A', 540, 150, 0.4], ['order', 'span B', 620, 230, 0.9], ['payment', 'span C', 700, 310, 1.4], ['inventory', 'span D', 700, 380, 1.7]];
    const lines = [[0, 1], [1, 2], [1, 3]];
    lines.forEach(([a, b]) => { const A = N[a], B = N[b], f = E(u, B[4] - 0.3, B[4]); el('path', { d: `M${A[2] - 50},${A[3] + 16} V${lerp(A[3] + 16, B[3], f)} H${lerp(A[2] - 50, B[2] - 62, f)}`, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: f > 0 ? 1 : 0 }); });
    N.forEach(([svc, sp, x, y, at]) => { const s = pop(u, at); card(x + 50, y, 230, 34, { rx: 8, stroke: ACC, sw: 2, s });
      mono(x - 54, y + 5, svc, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, at) }); mono(x + 46, y + 5, sp, { 'font-size': 14, fill: INFO, opacity: fade(u, at) });
      mono(x + 112, y + 5, '3a2f', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, at) }); });
    sub(880, 92, 'traceId는 전부 같다', fade(u, 2.1), { 'font-size': 14, fill: ACC, 'font-weight': 700 }); }

  // ---------- 3. traceparent 로 경계를 넘는다 ----------
  const S3X = [160, 480, 800];
  function svc3(n, y, op) { ['gateway', 'order-service', 'payment-service'].forEach((s, i) => { const on = i < n;
      card(S3X[i], y, 190, 54, { rx: 10, stroke: on ? ACC : OFF, sw: 2.5, fill: on ? ACCBG : PANEL, text: s, mono: true, color: on ? ACC : MUT, op }); }); }
  function counters(c) { const b = c.beat, p = c.prev || {}, sv = Math.round(tween(p.services, b.services, c.u)), sp = Math.round(tween(p.spans, b.spans, c.u));
    R.spans(940, 32, [['추적 서비스 ', { fill: MUT }], [String(sv), { fill: ACC, 'font-weight': 800 }], ['  span ', { fill: MUT }], [String(sp), { fill: ACC, 'font-weight': 800 }], ['  전파 ', { fill: MUT }], [b.propagated ? 'ON' : 'OFF', { fill: b.propagated ? GOOD : BAD, 'font-weight': 800 }]], { 'font-size': 14.5, 'text-anchor': 'end' }); }
  function s3(t, c) { const { k, u } = c; counters(c);
    const Y = 100;
    svc3(c.beat.services, Y);
    for (let i = 0; i < 2; i++) el('line', { x1: S3X[i] + 96, y1: Y, x2: S3X[i + 1] - 96, y2: Y, stroke: i < c.beat.services - 1 ? ACC : GRID, 'stroke-width': 2.5 });
    if (k === 0) {
      tx(40, 190, 'probability: 1.0', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      for (let i = 0; i < 10; i++) { const at = 0.3 + i * 0.14; card(260 + i * 50, 184, 38, 38, { rx: 6, stroke: ACC, sw: 2, fill: ACCBG, s: pop(u, at) }); check(260 + i * 50, 184, 9, pop(u, at + 0.1)); }
      mono(790, 190, '10 / 10 기록', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      tx(40, 270, '운영 0.1이면', { 'font-size': 16, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.6) });
      for (let i = 0; i < 10; i++) card(260 + i * 50, 264, 38, 38, { rx: 6, stroke: i === 3 ? ACC : OFF, sw: 2, fill: i === 3 ? ACCBG : PANEL, op: fade(u, 1.7 + i * 0.04) });
      mono(790, 270, '평균 10개 중 1개', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) });
      sub(480, 360, '결정은 trace 단위다. 샘플된 요청은 모든 span이 함께 기록된다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 1) {
      const f = seg(u, 0.4, 1.6);
      fly(S3X[0] + 96, Y - 40, S3X[1] - 96, Y - 40, f, 'traceparent', { fill: INFO, mono: true, stay: true });
      [0, 1].forEach((i) => { const on = i === 0 ? 1 : fade(u, 1.5); pill(S3X[i], Y + 60, 'traceId ' + TID, ACC, 1, { fs: 14, mono: true, op: on }); });
      card(480, 270, 560, 80, { rx: 12, stroke: GRID, sw: 1.5, fill: SOFT, s: pop(u, 1.9) });
      mono(480, 262, 'propagation.type: w3c', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(480, 290, '보내는 쪽과 받는 쪽 포맷이 같아야 이어진다 (레거시 Zipkin은 b3)', fade(u, 2.1), { 'font-size': 14 }); return; }
    [0, 1, 2].forEach((i) => pill(S3X[i], Y + 60, 'traceId ' + TID, ACC, 1, { fs: 14, mono: true }));
    if (k === 2) {
      const Z = [480, 340];
      card(Z[0], Z[1], 230, 60, { rx: 12, stroke: INFO, sw: 2.5, fill: INFOBG, text: 'Zipkin :9411', mono: true, color: INFO, s: pop(u, 0.2) });
      S3X.forEach((x, i) => { grow(x, Y + 84, lerp(x, Z[0], 0.75), Z[1] - 32, E(u, 0.4 + i * 0.15, 0.9 + i * 0.15), INFO, { sw: 2 });
        fly(x, Y + 84, lerp(x, Z[0], 0.75), Z[1] - 34, seg(u, 1.0 + i * 0.3, 1.7 + i * 0.3), 'span', { fill: ACC }); });
      sub(480, 400, '세 서비스가 같은 Zipkin으로 보내야 한 트리로 합쳐진다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 3) {
      const ly = [[250, 'order-service', 'b7d9…02', 'create order id=42', INFO], [310, 'payment-service', 'e4a1…88', 'charge ok', WARN]];
      const f = E(u, 1.3, 1.9), FS = 16, xid = 60 + tw('INFO [payment-service,', FS) + 6;
      ly.forEach(([y, s, sp, msg, col], i) => { const at = 0.3 + i * 0.5, op = fade(u, at);
        mono(xid - 6, y, 'INFO [' + s + ',', { 'font-size': FS, fill: MUT, 'text-anchor': 'end', opacity: op });
        mono(xid, y, TID, { 'font-size': FS, fill: ACC, 'font-weight': 800, opacity: op });
        mono(xid + 92, y, sp, { 'font-size': FS, fill: col, 'font-weight': 800, opacity: op });
        mono(xid + 184, y, '] ' + msg, { 'font-size': FS, opacity: op });
        el('rect', { x: xid - 6, y: y - 19, width: 86, height: 27, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: f });
        el('rect', { x: xid + 86, y: y - 19, width: 86, height: 27, rx: 5, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.9) }); });
      tx(xid + 37, 350, '같은 traceId', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(xid + 129, 380, '다른 spanId', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      mono(60, 210, 'level: "%5p [${spring.application.name:},%X{traceId:-},%X{spanId:-}]"', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.1) }); return; }
    // k4: traceparent 해부 — order → payment 로 나가는 헤더
    fly(S3X[1] + 96, Y - 40, S3X[2] - 96, Y - 40, seg(u, 0.2, 1.0), 'traceparent', { fill: INFO, mono: true, stay: true });
    const parts = [['00', '버전', MUT], [TID, 'traceId (32 hex)', ACC], ['b7d9…02', 'parent spanId', INFO], ['01', 'flags 01 = sampled', GOOD]];
    const sp = E(u, 1.0, 1.6), fs = 22; let x = 480 - (tw('00-' + TID + '-b7d9…02-01', fs) + sp * 3 * 40) / 2;
    parts.forEach(([s, n, col], i) => { const w = tw(s, fs);
      mono(x, 250, s, { 'font-size': fs, 'font-weight': 800, fill: col, opacity: fade(u, 0.9) });
      if (sp > 0.5) { el('line', { x1: x + w / 2, y1: 262, x2: x + w / 2, y2: 284, stroke: col, 'stroke-width': 2, opacity: fade(u, 1.5) });
        tx(x + w / 2, 304 + (i % 2) * 24, n, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, 1.6 + i * 0.12) }); }
      x += w; if (i < 3) { mono(x + sp * 20 - (sp > 0 ? 0 : 0), 250, '-', { 'font-size': fs, fill: MUT, opacity: fade(u, 0.9) }); x += tw('-', fs) + sp * 40; } });
    sub(480, 390, 'payment는 traceId를 그대로 쓰고 자기 spanId를 새로 만든다', fade(u, 2.3), { 'font-size': 15 }); }

  // ---------- 4. @Observed 로 내부 구간까지 ----------
  const WF = { x0: 330, x1: 900, y0: 150, rh: 46 };
  const WX = (ms) => WF.x0 + ms / 120 * (WF.x1 - WF.x0);
  const ROWS = [['POST /api/orders', 'gateway', 0, 120, INFO], ['order.create', 'order', 5, 110, ACC], ['stock.reserve', 'order → inventory', 12, 15, GOOD], ['POST /charge', 'order → payment', 30, 80, WARN]];
  function wfRow(i, f, o) { o = o || {}; const [n, s, st, d, col] = ROWS[i], y = WF.y0 + i * WF.rh;
    mono(40, y + 5, n, { 'font-size': 15, 'font-weight': 700, fill: o.ghost ? OFF : INK, opacity: o.op ?? 1 });
    tx(40, y + 24, s, { 'font-size': 13.5, fill: MUT, opacity: o.ghost ? 0.4 : o.op ?? 1 });
    if (o.ghost) { el('rect', { x: WX(st), y: y - 11, width: WX(st + d) - WX(st), height: 22, rx: 5, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); return; }
    if (f <= 0) return; el('rect', { x: WX(st), y: y - 11, width: (WX(st + d) - WX(st)) * f, height: 22, rx: 5, fill: o.red ? BAD : col, opacity: 0.9 });
    if (f > 0.95) mono(WX(st + d) + 8, y + 5, d + 'ms', { 'font-size': 14, 'font-weight': 700, fill: o.red ? BAD : INK }); }
  function axis4() { el('line', { x1: WF.x0, y1: WF.y0 - 34, x2: WF.x1, y2: WF.y0 - 34, stroke: GRID, 'stroke-width': 1.5 });
    [0, 40, 80, 120].forEach((v) => mono(WX(v), WF.y0 - 42, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' })); }
  function s4(t, c) { const { k, u } = c;
    tx(40, 40, 'Zipkin 트레이스 한 줄씩', { 'font-size': 17, 'font-weight': 800 });
    const b = c.beat, p = c.prev || {}, sp = Math.round(tween(p.spans, b.spans, c.u));
    R.spans(940, 40, [['span ', { fill: MUT }], [String(sp), { fill: ACC, 'font-weight': 800 }]], { 'font-size': 15, 'text-anchor': 'end' });
    axis4();
    if (k === 0) { wfRow(0, 1); wfRow(3, 1); wfRow(1, 0, { ghost: true }); wfRow(2, 0, { ghost: true });
      card(620, 370, 420, 50, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 0.6) });
      mono(620, 375, 'OrderService(ObservationRegistry r)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.7) });
      tx(330, 376, 'HTTP 경계만 잡힌다 · 내부 구간은 비어 있다', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.4) }); return; }
    wfRow(0, 1); wfRow(3, 1, { red: k === 4 });
    wfRow(1, k === 1 ? E(u, 0.4, 1.4) : 1);
    if (k === 1) { pill(WX(60), WF.y0 + WF.rh - 32, '+ @Observed', ACC, pop(u, 1.3), { fs: 13.5, mono: true });
      wfRow(2, 0, { ghost: true });
      sub(600, 390, 'name은 지표 이름, contextualName은 트레이스에 보이는 이름', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { wfRow(2, 0, { ghost: true });
      const ly = 356; card(560, ly, 520, 46, { rx: 8, stroke: GRID, sw: 1.5, fill: SOFT, s: pop(u, 0.4) });
      R.spans(316, ly + 5, [['[' + TID + ',', { fill: ACC, 'font-weight': 700 }], ['order.create', { fill: ACC, 'font-weight': 800 }], ['] creating order for user=…', {}]], { 'font-size': 14.5, opacity: fade(u, 0.6) });
      const f = E(u, 1.2, 1.8); el('path', { d: `M${WX(60)},${WF.y0 + WF.rh + 12} V${lerp(WF.y0 + WF.rh + 12, ly - 24, f)}`, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', fill: 'none', opacity: f > 0 ? 1 : 0 });
      sub(560, 405, '이 로그의 spanId로 Zipkin을 찾으면 바로 이 구간이 나온다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    wfRow(2, k === 3 ? E(u, 0.3, 1.0) : 1);
    if (k === 3) { pill(WX(40) + 30, WF.y0 + 2 * WF.rh, 'tag sku=A', GOOD, pop(u, 1.0), { fs: 13.5, mono: true });
      card(380, 380, 300, 44, { rx: 8, stroke: GOOD, sw: 2, s: pop(u, 1.5), text: 'sku · 값 종류가 적다', fs: 14.5, color: GOOD }); check(250, 380, 9, pop(u, 1.6));
      card(720, 380, 300, 44, { rx: 8, stroke: BAD, sw: 2, s: pop(u, 1.9), text: 'userId · 값이 끝없다', fs: 14.5, color: BAD }); cross(590, 380, 8, pop(u, 2.0)); return; }
    // k4: 병목
    const a = WX(30), bb = WX(110), f = E(u, 0.6, 1.2);
    el('path', { d: `M${a},${WF.y0 + 3 * WF.rh + 20} V${WF.y0 + 3 * WF.rh + 32} H${lerp(a, bb, f)} V${WF.y0 + 3 * WF.rh + 20}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: f > 0 ? 1 : 0 });
    mono((a + bb) / 2, WF.y0 + 3 * WF.rh + 58, '120ms 중 80ms', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    sub(480, 405, '트리 한 화면에서 가장 긴 구간이 바로 보인다', fade(u, 1.8), { 'font-size': 15 }); }

  const quiz = [
    { q: '로그만 있을 때 payment의 502를 상위 요청과 이을 수 없는 이유는 무엇인가?',
      o: ['payment가 로그를 남기지 않아서', '요청을 묶는 ID와 부모-자식 관계가 기록되지 않아서', '로그 시각이 밀리초까지 나오지 않아서'], a: 1,
      why: '네 줄 모두 시각은 있지만 같은 요청이라는 표시가 없다. 동시 요청 100개면 400줄이 섞여 어느 줄이 짝인지 알 수 없다.' },
    { q: 'micrometer-tracing만 넣고 bridge를 넣지 않으면 어떻게 되나?',
      o: ['span이 하나도 기록되지 않는다', 'Brave가 자동으로 골라진다', 'span은 생기지만 Zipkin 으로만 못 보낸다'], a: 0,
      why: 'micrometer-tracing은 Tracer·Span 인터페이스만 준다. Brave나 OTel bridge가 있어야 실제로 span이 만들어진다.' },
    { q: 'order에서 payment로 나가는 traceparent 헤더의 세 번째 조각은 무엇인가?',
      o: ['payment가 새로 만든 spanId', '샘플링 비율', 'order 쪽 span의 id (parent spanId)'], a: 2,
      why: '형식은 버전-traceId-parent spanId-flags다. payment는 traceId를 그대로 쓰고, 이 parent 아래에 자기 spanId를 새로 만든다.' },
    { q: 'stock.reserve 구간에 태그를 붙일 때 피해야 할 키는 무엇인가?',
      o: ['sku', 'userId', 'region'], a: 1,
      why: '태그는 low cardinality 여야 한다. userId처럼 값 종류가 끝없이 늘어나는 키는 저장소를 부풀린다.' },
  ];

  const summary = [
    '서비스마다 따로 남긴 로그는 같은 요청인지, 어느 구간이 느린지 알려 주지 않는다.',
    'micrometer-tracing은 인터페이스만 주고, 실제 span은 Brave나 OTel bridge가 만든다.',
    'traceId는 traceparent 헤더에 실려 홉을 넘고, 홉마다 spanId만 새로 생긴다.',
    '@Observed를 붙이면 내부 메서드도 span이 되어 120ms 중 80ms인 구간이 바로 보인다.',
  ];
  const review = [
    { q: 'gateway와 order 로그에는 traceId가 찍히는데 payment 로그만 traceId가 매번 새로 나온다. 먼저 의심할 것은?',
      o: ['payment 쪽 Zipkin 엔드포인트 주소', '두 서비스의 전파 포맷(w3c, b3)이 서로 다르다', '샘플링 비율이 1.0이다'], a: 1,
      why: '받는 쪽이 헤더 형식을 못 읽으면 이어받지 못하고 새 trace를 시작한다. propagation.type을 양쪽에 같게 맞춘다.' },
    { q: '로그에 traceId는 잘 찍히는데 Zipkin 화면은 비어 있다. 빠졌을 가능성이 가장 큰 것은?',
      o: ['zipkin-reporter-brave 의존성이나 endpoint 설정', 'micrometer-tracing 의존성', 'logging.pattern.level 설정'], a: 0,
      why: 'span을 만드는 일(bridge)과 밖으로 보내는 일(reporter)은 다르다. 로그에 ID가 있다면 수집은 되고 있고, 전송 통로가 빠진 것이다.' },
    { q: '@Observed를 붙였는데 order.create 구간이 트레이스에 나타나지 않는다. 먼저 볼 것은?',
      o: ['traceparent의 flags 값', 'Zipkin 저장소 종류', 'AOP 의존성과 annotations.enabled 설정'], a: 2,
      why: '@Observed는 AOP 프록시로 동작한다. 프록시가 없으면 애노테이션은 아무 일도 하지 않는다.' },
  ];

  R.page({ title: '분산 추적 흐름', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
