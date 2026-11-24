/* V-1-2 OpenTelemetry 관측 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   traceparent·span id 는 python grpcio 1.85 + opentelemetry-instrumentation-grpc 로 클라·서버를 계측해 실제로 찍힌 값이다.
   span 길이(ms)와 RED 수치(1.2k rps, 0.4%, 18ms, 92ms)는 페이지의 예시값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  const TP = { trace: '21262e898e8faff220d6ae1ac5d628ec', parent: 'e2ae9318545759aa', child: 'f44e502d97496a57', flags: '03' };
  const COL = { gateway: INFO, order: ACC, payment: GOOD, inventory: WARN, collector: MUT, 'SDK (app)': INFO, tempo: INFO, jaeger: INFO, prometheus: BAD };
  const colOf = (s) => (s.status === 'err' ? BAD : COL[s.svc] || MUT);

  // 폭포 그림: spans[{svc,name,offset,dur,status,depth,prop,stream}] 0~100ms
  function waterfall(x, y, w, spans, u, o) { o = o || {}; const rh = o.rh || 40, lw = o.lw || 120, bw = w - lw - 60, X = (v) => x + lw + (v / 100) * bw;
    el('line', { x1: X(0), y1: y - 8, x2: X(0), y2: y + spans.length * rh, stroke: GRID, 'stroke-width': 1.5 });
    [0, 50, 100].forEach((v) => mono(X(v), y + spans.length * rh + 18, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 }));
    spans.forEach((s, i) => { const yy = y + i * rh, g = o.grow === false ? 1 : E(u, (o.t0 ?? 0.2) + i * 0.3, (o.t0 ?? 0.2) + 0.5 + i * 0.3), col = colOf(s);
      tx(x + (s.depth || 0) * 12, yy + rh / 2 + 5, s.svc, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, (o.t0 ?? 0.2) + i * 0.3) });
      const bx = X(s.offset), bwid = Math.max(4, (s.dur / 100) * bw * g);
      el('rect', { x: bx, y: yy + 6, width: bwid, height: rh - 12, rx: 5, fill: col, opacity: s.stream ? 0.55 : 0.85, stroke: s.status === 'err' ? BAD : 'none', 'stroke-width': 2.5 });
      if (g > 0.95) { const name = s.name + (s.stream ? ' ⇄' : ''), inside = tw(name, 13.5) + 12 < bwid;
        mono(inside ? bx + 6 : bx + bwid + 6, yy + rh / 2 + 5, name, { 'font-size': 13.5, fill: inside ? PANEL : col, 'font-weight': 700 });
        mono(x + w, yy + rh / 2 + 5, s.dur + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
      if (s.prop && g > 0.5) { mono(bx, yy + 3, 'traceparent ▸', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) }); } });
    return X; }
  // 서비스 체인
  const NODES = { client: [70, 210], gateway: [250, 210], order: [450, 210], payment: [680, 120], inventory: [680, 300] };
  const EDGES = [['client', 'gateway'], ['gateway', 'order'], ['order', 'payment'], ['order', 'inventory']];
  function chain(u, o) { o = o || {};
    EDGES.forEach(([a, b], i) => { const [x1, y1] = NODES[a], [x2, y2] = NODES[b]; grow(x1 + 60, y1, x2 - 62, y2, o.grow === false ? 1 : seg(u, 0.3 + i * 0.3, 0.6 + i * 0.3), MUT); });
    Object.entries(NODES).forEach(([n, [x, y]], i) => card(x, y, 120, 46, { rx: 10, text: n, fs: 15, stroke: COL[n] || INK, color: COL[n] || INK, sw: 2.2, s: o.grow === false ? 1 : pop(u, 0.1 + i * 0.3) })); }

  // ───────── 1. 왜 관측인가
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { chain(u); pill(450, 370, '요청 하나 = 4홉', INK, pop(u, 1.6), { fs: 15 }); return; }
    if (k === 1) { chain(u, { grow: false });
      const logs = [['gateway', 190, 300, 'POST /order 100ms'], ['order', 450, 300, 'Create ok'], ['payment', 680, 40, 'Charge ok'], ['inventory', 820, 370, 'Reserve ok']];
      logs.forEach(([n, x, y, s], i) => { const a = pop(u, 0.2 + i * 0.3); card(x, y, 236, 40, { rx: 6, fill: SOFT, stroke: GRID, sw: 1.2, s: a }); mono(x - 108, y + 5, '10:02:01 ' + s, { 'font-size': 13.5, opacity: fade(u, 0.3 + i * 0.3) }); });
      tx(170, 380, '로그 예시: 서로 잇는 열쇠가 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { mono(60, 60, 'trace_id 7f3a…c21', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.1) });
      waterfall(60, 90, 840, b.spans, u, { rh: 56 }); sub(480, 400, '막대 길이는 페이지의 예시값', fade(u, 2.0)); return; }
    if (k === 3) { waterfall(60, 50, 840, b.spans, u, { grow: false, rh: 34 });
      const m = b.metrics; [['Rate', m.rate], ['Errors', m.errors], ['Duration', 'p50 · p99']].forEach(([n, v], i) => { const x = 160 + i * 250, a = pop(u, 0.3 + i * 0.3);
        card(x, 270, 220, 64, { rx: 10, stroke: ACC, s: a }); tx(x - 96, 260, n, { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.3) });
        mono(x - 96, 288, v, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4 + i * 0.3) }); });
      mono(60, 370, 'log  level=info msg="charge ok" trace_id=7f3a…c21', { 'font-size': 14, opacity: fade(u, 1.6) });
      el('rect', { x: 322, y: 352, width: 152, height: 26, rx: 5, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.9) });
      sub(720, 404, '로그는 trace_id 로 trace 와 이어진다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 4) { chain(u, { grow: false });
      Object.entries(NODES).forEach(([n, [x, y]], i) => { if (n !== 'client') el('circle', { cx: x, cy: y, r: 40, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.2 + i * 0.1) }); });
      EDGES.forEach(([a, bb], i) => { const [x1, y1] = NODES[a], [x2, y2] = NODES[bb]; fly(x1 + 40, y1 - 30, x2 - 40, y2 - 30, seg(u, 0.6 + i * 0.4, 1.3 + i * 0.4), 'traceparent', { fill: WARN, mono: true }); });
      pill(450, 380, 'StatsHandler 한 줄 = 자동 span', ACC, pop(u, 2.2)); return; }
    [['Traces', '0', '여정 (span 나무)'], ['Metrics', '1', '집계 (RED)'], ['Logs', '2', '이벤트']].forEach(([n, v, d], i) => { const x = 180 + i * 300, a = pop(u, 0.2 + i * 0.4);
      card(x, 190, 250, 150, { rx: 14, stroke: ACC, s: a }); mono(x, 160, n, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3 + i * 0.4) });
      mono(x, 200, '= ' + v, { 'font-size': 17, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); tx(x, 235, d, { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); });
    mono(480, 330, 'type Signal int   (iota)', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) });
    sub(480, 380, '다음 Step 에서 클라이언트에 실제로 붙인다', fade(u, 2.0), { 'font-size': 14.5 }); }

  // ───────── 2. 클라이언트 계측
  const LAYERS = [['otelgrpc', '계측 (StatsHandler)'], ['sdktrace', 'SDK · TracerProvider'], ['otlptracegrpc', 'exporter']];
  function app(u, on, a0) { zone(30, 50, 420, 300, 'order-gateway (앱)', { fill: SOFT });
    LAYERS.forEach(([p, d], i) => { const y = 110 + i * 80, hot = on === i;
      card(240, y, 380, 60, { rx: 10, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, sw: hot ? 2.5 : 1.8, s: a0 == null ? 1 : pop(u, a0 + i * 0.3) });
      mono(70, y + 5, p, { 'font-size': 15, 'font-weight': 700, fill: hot ? ACC : INK, opacity: a0 == null ? 1 : fade(u, a0 + 0.1 + i * 0.3) });
      tx(410, y + 5, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: a0 == null ? 1 : fade(u, a0 + 0.1 + i * 0.3) }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { app(u, -1, 0.2); sub(240, 390, '계측 · SDK · exporter 세 조각', fade(u, 1.4), { 'font-size': 15 }); return; }
    if (k === 1 || k === 2) { app(u, k === 1 ? 2 : 1);
      card(760, 270, 200, 70, { rx: 12, stroke: ACC, fill: ACCBG, text: 'Collector\n:4317', fs: 15, color: ACC, s: k === 1 ? pop(u, 0.3) : 1 });
      grow(430, 270, 656, 270, k === 1 ? seg(u, 0.6, 1.2) : 1, ACC);
      if (k === 1) { ['Jaeger', 'Tempo'].forEach((n, i) => card(700 + i * 130, 110, 110, 44, { rx: 8, text: n, fs: 14, stroke: GRID, color: MUT, dash: '5 4', s: pop(u, 1.4 + i * 0.2) }));
        tx(765, 175, '앱은 이 이름을 모른다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
      // k2: 배치 전송 + service.name
      const n = Math.min(8, Math.floor(lerp(0, 8, E(u, 0.2, 1.4))));
      for (let i = 0; i < 8; i++) el('rect', { x: 500 + (i % 4) * 26, y: 90 + Math.floor(i / 4) * 26, width: 20, height: 20, rx: 4, fill: i < n ? ACC : 'none', stroke: GRID, 'stroke-width': 1.4 });
      tx(552, 160, 'span 모으기', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      if (u > 1.5) fly(552, 110, 760, 250, seg(u, 1.5, 2.2), 'span × 8', { mono: true });
      pill(240, 385, 'service.name = "order-gateway"', ACC, pop(u, 1.9), { mono: true, fs: 14 }); return; }
    if (k === 3) { // 10% 샘플링: 실제로 1만 개 trace_id 를 넣어 본 결과
      tx(60, 70, 'TraceIDRatioBased(0.1)', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      const shown = lerp(0, 100, E(u, 0.2, 1.5));
      for (let i = 0; i < 100; i++) { if (i >= shown) break; const keep = [3, 14, 27, 31, 48, 52, 66, 79, 85, 97].includes(i);
        el('rect', { x: 60 + (i % 20) * 22, y: 90 + Math.floor(i / 20) * 22, width: 17, height: 17, rx: 3, fill: keep ? ACC : SOFT, stroke: keep ? ACC : GRID }); }
      mono(60, 230, 'trace_id 10,000개 → 샘플 1,032개', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      sub(60, 254, '(파이썬 SDK 로 돌린 결과, 약 10%)', fade(u, 1.6), { 'text-anchor': 'start', 'font-size': 13.5 });
      // ParentBased
      tx(620, 80, 'ParentBased', { 'font-size': 16, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.7) });
      [['gateway', 690, 130], ['order', 620, 220], ['payment', 760, 220]].forEach(([n, x, y], i) => card(x, y, 120, 44, { rx: 8, text: n, fs: 14, stroke: ACC, fill: ACCBG, s: pop(u, 1.8 + i * 0.2) }));
      grow(675, 153, 635, 196, seg(u, 2.0, 2.3), ACC); grow(705, 153, 745, 196, seg(u, 2.0, 2.3), ACC);
      sub(690, 280, '부모가 샘플되면 자식도 따라간다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 4) { tx(480, 80, 'traceparent (W3C)', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      const parts = [['00', '버전', INK], [TP.trace, 'trace-id 32자', ACC], [TP.parent, '부모 span-id 16자', WARN], [TP.flags, 'flags', MUT]];
      let x = 92; parts.forEach(([s, d, col], i) => { const w = tw(s, 15) + 16, a = fade(u, 0.3 + i * 0.4);
        el('rect', { x, y: 130, width: w, height: 38, rx: 6, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: a });
        mono(x + w / 2, 155, s, { 'font-size': 15, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: a });
        tx(x + w / 2, 196 + (i % 2) * 22, d, { 'font-size': 14, 'text-anchor': 'middle', fill: col, opacity: a });
        if (i < 3) mono(x + w + 6, 155, '-', { 'font-size': 15, opacity: a }); x += w + 18; });
      sub(480, 280, '파이썬 grpcio 에 계측을 걸고 서버 metadata 에서 꺼낸 실제 값', fade(u, 2.0), { 'font-size': 14 });
      pill(480, 330, 'propagation.TraceContext{} 를 등록해야 실린다', ACC, pop(u, 2.2)); return; }
    if (k === 5) { card(120, 200, 150, 60, { rx: 10, text: 'client stub', fs: 15 }); el('line', { x1: 196, y1: 200, x2: 560, y2: 200, stroke: GRID, 'stroke-width': 10, 'stroke-linecap': 'round' });
      el('circle', { cx: 380, cy: 200, r: 34, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.2) }); mono(380, 150, 'StatsHandler', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.3) });
      server(640, 200, 'order:50051', {});
      ['Create', 'Get', 'Watch'].forEach((m, i) => { const a = 0.4 + i * 0.6; dot([[200, 200], [560, 200]], seg(u, a, a + 0.6), ACC, 7);
        const g = E(u, a + 0.3, a + 0.6); el('rect', { x: 300, y: 270 + i * 40, width: 4 + 260 * g, height: 26, rx: 4, fill: ACC, opacity: 0.8 });
        if (g > 0.5) mono(310, 288 + i * 40, 'span ' + m, { 'font-size': 13.5, fill: PANEL, 'font-weight': 700 }); });
      sub(780, 320, '커넥션에 한 번 등록하면 모든 RPC', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k6: 호출 하나의 일생
    waterfall(60, 60, 840, c.beat.spans, u, { rh: 50 });
    card(700, 290, 420, 110, { rx: 10, fill: SOFT, stroke: GRID, s: pop(u, 1.2) });
    [':path /order.v1.OrderService/Create', 'traceparent: 00-2126…28ec-e2ae…59aa-03'].forEach((s, i) => mono(500, 280 + i * 26, s, { 'font-size': 13.5, fill: i ? WARN : INK, 'font-weight': i ? 700 : 400, opacity: fade(u, 1.4 + i * 0.3) }));
    tx(500, 252, 'outgoing metadata', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.3) });
    sub(260, 340, 'span 시작 → 주입 → 응답 → 종료·시간 기록', fade(u, 2.0), { 'font-size': 14 }); }

  // ───────── 3. 서버 계측
  function s3(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { [['attribute', '속성 붙이기'], ['codes', 'Ok / Error 상태'], ['trace', 'SpanFromContext']].forEach(([p, d], i) => { const x = 180 + i * 300, a = pop(u, 0.2 + i * 0.4);
        card(x, 190, 240, 110, { rx: 12, stroke: ACC, s: a }); mono(x, 180, p, { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3 + i * 0.4) });
        tx(x, 212, d, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.4) }); });
      sub(480, 320, '자동 span 을 손볼 때 쓰는 세 패키지', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1) { const row = (y, who, id, par, a, col) => { tx(60, y + 6, who, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: a });
        el('rect', { x: 200, y: y - 16, width: 480 * a, height: 34, rx: 5, fill: col, opacity: 0.8 });
        mono(700, y - 2, 'span ' + id, { 'font-size': 14, opacity: a }); mono(700, y + 18, 'parent ' + par, { 'font-size': 14, fill: par === '-' ? MUT : WARN, 'font-weight': 700, opacity: a }); };
      mono(60, 70, 'trace ' + TP.trace, { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.1) });
      row(130, 'CLIENT', TP.parent, '-', E(u, 0.2, 0.8), INFO);
      fly(440, 160, 440, 240, seg(u, 0.9, 1.6), 'traceparent …-e2ae9318545759aa-03', { fill: WARN, mono: true });
      row(270, 'SERVER', TP.child, TP.parent, E(u, 1.6, 2.2), ACC);
      sub(480, 360, '서버 span 의 parent 가 클라이언트 span id 와 같다 (파이썬 실행 값)', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 2) { zone(80, 110, 360, 200, 'ctx', { fill: SOFT, stroke: GRID, sw: 2 });
      mono(110, 170, 'deadline', { 'font-size': 14, fill: MUT }); mono(110, 200, 'metadata', { 'font-size': 14, fill: MUT });
      const out = E(u, 0.9, 1.8); card(lerp(300, 700, out), 240, 200, 50, { rx: 8, stroke: ACC, fill: ACCBG, text: 'span (서버)', fs: 15, color: ACC });
      mono(700, 150, 'trace.SpanFromContext(ctx)', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4) });
      sub(700, 300, 'otelgrpc 가 이미 만든 것을 꺼낸다', fade(u, 1.9), { 'font-size': 14 }); return; }
    if (k === 3) { const rows = [['rpc.system', 'grpc', 0], ['rpc.service', 'order.v1.OrderService', 0], ['rpc.method', 'Create', 0], ['rpc.grpc.status_code', '0', 0], ['order.item', 'book', 1], ['user.tier', 'premium', 1]];
      tx(80, 64, '서버 span 속성', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      rows.forEach(([kk, v, dom], i) => { const y = 80 + i * 46, a = fade(u, dom ? 1.4 + (i - 4) * 0.4 : 0.2 + i * 0.2);
        el('rect', { x: 80, y, width: 560, height: 38, rx: 6, fill: dom ? ACCBG : PANEL, stroke: dom ? ACC : GRID, 'stroke-width': 1.5, opacity: a });
        mono(96, y + 25, kk, { 'font-size': 15, fill: dom ? ACC : INK, 'font-weight': 700, opacity: a }); mono(620, y + 25, v, { 'font-size': 15, 'text-anchor': 'end', opacity: a }); });
      pill(800, 140, '자동 (otelgrpc)', MUT, pop(u, 0.6)); pill(800, 290, '직접 (도메인 값)', ACC, pop(u, 1.6));
      sub(480, 400, 'Jaeger 에서 order.item=book 으로 거를 수 있다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 4) { waterfall(60, 50, 840, b.spans, u, { grow: false, rh: 40 });
      card(480, 300, 600, 110, { rx: 10, stroke: BAD, fill: C.BADBG, s: pop(u, 0.6) });
      [['span.RecordError(err)', '→ event "exception"'], ['span.SetStatus(codes.Error, …)', '→ 빨간 span · 에러율'], ['rpc.grpc.status_code', '→ 3 (INVALID_ARGUMENT)']].forEach(([a, d], i) => {
        mono(200, 278 + i * 26, a, { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.4) }); mono(520, 278 + i * 26, d, { 'font-size': 14, opacity: fade(u, 1.0 + i * 0.4) }); });
      return; }
    // k5: 같은 ctx 로 하위 호출
    const X = waterfall(60, 50, 840, b.spans, u, { grow: false, rh: 46 });
    [2, 3].forEach((i, j) => { const s = b.spans[i]; el('path', { d: `M${X(b.spans[1].offset) + 10},${50 + 46 + 34} V${50 + i * 46 + 23} H${X(s.offset) - 2}`, fill: 'none', stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': 300, 'stroke-dashoffset': 300 * (1 - E(u, 0.4 + j * 0.5, 1.0 + j * 0.5)) }); });
    mono(480, 290, 's.payment.Charge(ctx, …)   s.inventory.Reserve(ctx, …)', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    sub(480, 330, 'ctx 를 그대로 넘겨야 trace 가 이어진다', fade(u, 1.9), { 'font-size': 15 });
    cross(250, 380, 9, pop(u, 2.2)); mono(270, 386, 'context.Background() 로 새로 만들면 trace 가 끊긴다', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.2) }); }

  // ───────── 4. 스트리밍 + RED
  const HIST = [[5, 18], [10, 34], [25, 58], [50, 22], [100, 9], [250, 3]];   // 버킷 상한(ms), 개수: 모양만 보이는 예시
  function hist(x, y, u, hi) { const max = 58; HIST.forEach(([le, n], i) => { const h = 150 * (n / max) * E(u, 0.2 + i * 0.12, 0.6 + i * 0.12), bx = x + i * 56;
      el('rect', { x: bx, y: y - h, width: 44, height: h, rx: 4, fill: hi === i ? WARN : ACC, opacity: 0.8 }); mono(bx + 22, y + 20, '≤' + le, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
    el('line', { x1: x - 6, y1: y, x2: x + 6 * 56, y2: y, stroke: MUT, 'stroke-width': 1.5 }); }
  function redTiles(m, u, a0, y) { [['Rate', m.rate], ['Errors', m.errors], ['p50', m.p50], ['p99', m.p99]].forEach(([n, v], i) => { const x = 150 + i * 220, a = fade(u, a0 + i * 0.2);
      card(x, y, 190, 66, { rx: 10, stroke: n === 'Errors' ? BAD : ACC, op: a }); tx(x - 80, y - 12, n, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: a });
      mono(x - 80, y + 18, v, { 'font-size': v.length > 12 ? 14 : 19, 'font-weight': 800, fill: n === 'Errors' ? BAD : ACC, opacity: a }); }); }
  function s4(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { card(150, 210, 200, 90, { rx: 12, text: 'order 서비스\nSDK', fs: 15 });
      card(780, 210, 180, 90, { rx: 12, stroke: ACC, fill: ACCBG, text: 'Collector\n:4317', fs: 15, color: ACC });
      [['traces', 180, INFO], ['metrics', 240, ACC]].forEach(([n, y, col], i) => { grow(250, y, 686, y, seg(u, 0.3 + i * 0.6, 0.9 + i * 0.6), col);
        mono(420, y - 10, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.5 + i * 0.6) }); for (let j = 0; j < 3; j++) dot([[250, y], [686, y]], (t * 0.5 + j / 3) % 1, col, 5); });
      sub(480, 340, '같은 Collector 로 보내야 나중에 서로 잇는다', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 1) { card(220, 210, 260, 120, { rx: 12, stroke: ACC, s: pop(u, 0.2) }); mono(110, 190, 'MeterProvider', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      mono(110, 222, 'PeriodicReader', { 'font-size': 15, opacity: fade(u, 0.5) });
      clock(560, 200, 46, E(u, 0.6, 2.4), ACC, '주기마다 (기본 60초)');
      [0, 1, 2].forEach((i) => fly(620, 200, 860, 200, seg(u, 1.0 + i * 0.5, 1.5 + i * 0.5), 'export', { mono: true }));
      mono(480, 340, 'otel.SetMeterProvider(mp)', { 'font-size': 16, 'text-anchor': 'middle', fill: INK, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(480, 370, '부르기 전에는 otelgrpc 메트릭이 아무 데도 안 간다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2) { tx(60, 60, 'rpc.server.duration (ms) 히스토그램', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      hist(80, 250, u, -1); sub(250, 300, '막대 높이는 모양만 나타낸 것', fade(u, 1.0), { 'font-size': 13.5 });
      [['개수 합 → Rate', 110], ['분위 → p50 · p99', 200], ['status_code 속성 → Errors', 290]].forEach(([s, y], i) => { grow(440, 170, 560, y, seg(u, 1.0 + i * 0.4, 1.4 + i * 0.4), ACC);
        card(740, y, 340, 50, { rx: 10, text: s, fs: 15, stroke: ACC, s: pop(u, 1.3 + i * 0.4) }); });
      return; }
    if (k === 3 || k === 4) { waterfall(60, 60, 840, b.spans, u, { grow: k === 3, rh: 46 });
      const X0 = 60 + 120, bw = 840 - 120 - 60;
      for (let i = 0; i < 8; i++) { const vx = X0 + (8 + i * 11) / 100 * bw, a = fade(u, 0.8 + i * 0.15), bad = k === 4 && i === 6;
        el('path', { d: `M${vx},104 l6,8 l-6,8 l-6,-8 z`, fill: bad ? BAD : WARN, opacity: a }); }
      mono(480, 230, k === 3 ? '◆ = message 이벤트 (WithMessageEvents)' : '◆ 빨간 것 = Send 실패 → 에러로 집계', { 'font-size': 14.5, 'text-anchor': 'middle', fill: k === 3 ? WARN : BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
      if (k === 4) redTiles(b.metrics, u, 2.0, 330); else sub(480, 330, '스트림 전체가 span 하나, 메시지는 그 안의 점', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 5) { const Q = ['sum(rate(rpc_server_duration_milliseconds_count[1m]))', 'count{rpc_grpc_status_code!="0"} 비율', 'histogram_quantile(0.99, …bucket[5m])'];
      Q.forEach((q, i) => { mono(60, 70 + i * 40, ['Rate    ', 'Errors  ', 'p99     '][i] + q, { 'font-size': 14, opacity: fade(u, 0.2 + i * 0.4) }); });
      redTiles(b.metrics, u, 1.4, 260); sub(480, 360, 'RED 수치는 예시값', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    // k6: exemplar
    hist(60, 260, u, 4); mono(60, 60, 'p99 버킷 ≤100ms', { 'font-size': 15, 'font-weight': 700, fill: WARN });
    const ex = [60 + 4 * 56 + 22, 260 - 150 * 9 / 58 - 16];
    el('circle', { cx: ex[0], cy: ex[1], r: 8, fill: WARN, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.9) });
    mono(ex[0] + 14, ex[1] - 12, 'exemplar trace_id', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.0) });
    el('path', { d: `M${ex[0]},${ex[1]} C${ex[0] + 150},${ex[1]} 480,190 560,190`, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': 400, 'stroke-dashoffset': 400 * (1 - E(u, 1.2, 1.8)), 'marker-end': u > 1.8 ? 'url(#ra-ah)' : null });
    waterfall(470, 160, 470, b.spans.slice(0, 3), u, { t0: 1.8, rh: 36, lw: 90 });
    tx(480, 400, 'RED 는 어디가 아픈가, trace 는 왜 아픈가', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); }

  // ───────── 5. Collector
  const COLS = [['receivers', 150], ['processors', 480], ['exporters', 810]];
  function frame(on) { COLS.forEach(([n, x], i) => { zone(x - 140, 50, 280, 340, null, { fill: i === on ? ACCBG : SOFT });
    mono(x, 80, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: i === on ? ACC : MUT }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 4) frame([0, 1, 1, 2, -1][k]);
    const recv = (a) => { card(150, 150, 220, 50, { rx: 8, text: 'otlp grpc :4317', mono: true, fs: 14.5, stroke: ACC, s: a }); card(150, 220, 220, 50, { rx: 8, text: 'otlp http :4318', mono: true, fs: 14.5, s: a }); };
    const proc = (a) => { card(480, 150, 220, 50, { rx: 8, text: 'memory_limiter', mono: true, fs: 14.5, s: a }); card(480, 220, 220, 50, { rx: 8, text: 'tail_sampling', mono: true, fs: 14.5, s: a }); card(480, 290, 220, 50, { rx: 8, text: 'batch', mono: true, fs: 14.5, s: a }); };
    const expo = (a) => { card(810, 150, 220, 50, { rx: 8, text: 'otlp/tempo', mono: true, fs: 14.5, stroke: INFO, s: a }); card(810, 290, 220, 50, { rx: 8, text: 'prometheus :8889', mono: true, fs: 14.5, stroke: BAD, s: a }); };
    if (k === 0) { recv(pop(u, 0.3)); for (let i = 0; i < 4; i++) dot([[-10, 150], [40, 150]], seg(u, 0.8 + i * 0.3, 1.2 + i * 0.3), ACC, 6);
      sub(150, 300, '앱 exporter 가 겨냥하는 주소', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 1) { recv(1); card(480, 150, 220, 50, { rx: 8, text: 'memory_limiter', mono: true, fs: 14.5, s: pop(u, 0.2) });
      const f = E(u, 0.4, 1.8) * 0.8; el('rect', { x: 380, y: 186, width: 200, height: 12, rx: 6, fill: PANEL, stroke: GRID }); el('rect', { x: 380, y: 186, width: 200 * f, height: 12, rx: 6, fill: f > 0.7 ? WARN : ACC });
      mono(480, 220, 'limit_mib 512', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      card(480, 290, 220, 50, { rx: 8, text: 'batch  timeout 5s', mono: true, fs: 14.5, s: pop(u, 1.3) });
      for (let i = 0; i < 6; i++) el('rect', { x: 400 + i * 28, y: 330, width: 20, height: 20, rx: 4, fill: i < lerp(0, 6, E(u, 1.5, 2.4)) ? ACC : 'none', stroke: GRID });
      return; }
    if (k === 2) { recv(1); proc(1);
      const tr = [['ok', 120], ['ok', 80], ['ERROR', 40], ['ok', 610], ['ok', 95], ['ok', 210]];
      tr.forEach(([st, ms], i) => { const keep = st === 'ERROR' || ms > 500, a = fade(u, 0.3 + i * 0.15), gone = u > 1.8 && !keep;
        const cx = 360 + i * 47 + 20; card(cx, 365, 44, 40, { rx: 6, text: st === 'ERROR' ? '✕' : ms + '', fs: 13.5, mono: true, stroke: keep ? (st === 'ERROR' ? BAD : WARN) : GRID, color: keep ? (st === 'ERROR' ? BAD : WARN) : MUT, op: gone ? 0.2 : a }); });
      el('rect', { x: 368, y: 196, width: 224, height: 48, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.0) });
      sub(480, 412, '에러이거나 500ms 넘는 trace 만 남김 (예시)', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    if (k === 3) { recv(1); proc(1); expo(pop(u, 0.3)); mono(810, 200, 'traces → Tempo', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.8) });
      mono(810, 340, 'metrics → Prometheus', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.1) });
      sub(810, 250, '앱 코드는 이 설정을 모른다', fade(u, 1.8), { 'font-size': 13.5 }); return; }
    if (k === 4) { recv(1); proc(1); expo(1);
      const lane = (pts, col, a) => el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': 4, 'stroke-linejoin': 'round', opacity: 0.75, 'stroke-dasharray': 1400, 'stroke-dashoffset': 1400 * (1 - a) });
      lane([[260, 140], [370, 140], [370, 210], [370, 280], [590, 280], [590, 140], [700, 140]], INFO, E(u, 0.2, 1.3));
      lane([[260, 160], [360, 160], [360, 300], [590, 300], [700, 300]], ACC, E(u, 1.2, 2.2));
      mono(480, 410, 'traces: memory_limiter → tail_sampling → batch   metrics: memory_limiter → batch', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      return; }
    if (k === 5) { tx(60, 80, '저장되는 trace 양', { 'font-size': 16, 'font-weight': 700 });
      [['전량 저장', 1, BAD], ['앞단 10% 샘플', 0.1, WARN], ['+ tail: 에러·느린 것만', 0.03, GOOD]].forEach(([n, v, col], i) => { const y = 130 + i * 80, g = E(u, 0.3 + i * 0.5, 0.9 + i * 0.5);
        tx(60, y + 20, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.5) }); el('rect', { x: 320, y, width: Math.max(4, 560 * v * g), height: 30, rx: 5, fill: col, opacity: 0.85 }); });
      sub(600, 390, '세 번째 막대 길이는 모양만 나타낸 것', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    // k6: resource 가 있어야 서비스 맵
    [['order-gateway', 150, 200, 1], ['order', 400, 200, 1], ['payment', 650, 120, 1], ['unknown_service:…', 650, 290, 0]].forEach(([n, x, y, ok], i) => {
      card(x, y, 210, 54, { rx: 27, text: n, mono: true, fs: 14.5, stroke: ok ? ACC : BAD, color: ok ? INK : BAD, dash: ok ? null : '6 5', s: pop(u, 0.2 + i * 0.35) }); });
    grow(256, 200, 292, 200, seg(u, 0.5, 0.8), MUT); grow(506, 190, 544, 135, seg(u, 0.9, 1.2), MUT); grow(506, 210, 544, 280, seg(u, 1.3, 1.6), MUT);
    mono(860, 300, 'service.name 없음', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7), 'text-anchor': 'middle' });
    pill(480, 385, 'service.name · deployment.environment 를 채운다', ACC, pop(u, 2.1)); }

  const quiz = [
    { q: '로그만으로 "어느 홉이 느린가"를 찾기 어려운 까닭은 무엇인가?',
      o: ['로그가 너무 커서 저장이 안 되어서', '서비스마다 따로 쌓인 로그를 요청 하나로 잇는 열쇠가 없어서', 'gRPC는 로그를 남기지 못해서'], a: 1,
      why: '로그는 gateway·order·payment·inventory에 흩어진다. trace_id로 묶인 span이 있어야 요청 하나의 여정이 한 줄로 보인다.' },
    { q: '클라이언트에서 traceparent가 metadata에 실리게 하는 두 가지는 무엇인가?',
      o: ['WithStatsHandler(otelgrpc.NewClientHandler())와 TraceContext 전파기 등록', 'WithBatcher와 service.name', 'TraceIDRatioBased(0.1)와 OTLP exporter'], a: 0,
      why: 'StatsHandler가 RPC마다 span을 만들고, 등록된 W3C 전파기가 그 span을 00-trace-id-span-id-flags 모양의 traceparent로 써 넣는다.' },
    { q: '서버 span이 클라이언트 span의 자식이 되었는지 확인하는 방법은 무엇인가?',
      o: ['두 span의 이름이 같은지 본다', '두 span의 길이가 비슷한지 본다', '같은 trace_id이고 서버 span의 parent가 클라이언트 span id 인지 본다'], a: 2,
      why: '파이썬으로 돌려 보니 서버 span의 parent가 e2ae9318545759aa로 클라이언트 span id와 같았다. trace_id도 둘이 같다.' },
    { q: 'RED의 Rate·Errors·Duration은 무엇에서 계산하는가?',
      o: ['rpc.server.duration 히스토그램과 status_code 속성', '애플리케이션이 직접 세는 카운터 세 개', 'trace의 span 개수'], a: 0,
      why: '히스토그램 개수로 Rate, 분위로 p50·p99, status_code가 0이 아닌 것의 비율로 Errors를 구한다.' },
    { q: 'tail_sampling이 앞단 비율 샘플링과 다른 점은 무엇인가?',
      o: ['trace를 하나도 버리지 않는다', 'trace가 끝난 뒤 결과를 보고 에러나 느린 것만 남긴다', '앱 코드 안에서 돈다'], a: 1,
      why: '앞단 10% 샘플링은 시작할 때 무작위로 고른다. tail_sampling은 ERROR 상태이거나 500ms를 넘긴 trace를 골라 남긴다.' },
  ];

  const summary = [
    '요청 하나가 여러 gRPC 서비스를 거치면 로그만으로는 느린 홉을 찾지 못한다.',
    'StatsHandler를 클라·서버에 달면 RPC마다 span이 생기고 traceparent로 같은 trace에 묶인다.',
    '도메인 값은 SpanFromContext로 붙이고, 에러는 RecordError와 SetStatus로 span에 남긴다.',
    '앱은 OTLP로 Collector에만 보내고, 샘플링과 Tempo·Prometheus 같은 저장처는 Collector가 정한다.',
  ];
  const review = [
    { q: 'Jaeger에서 gateway와 order의 span이 서로 다른 trace로 따로 보인다. 먼저 의심할 것은?',
      o: ['Collector의 batch timeout이 너무 길다', 'TraceContext 전파기를 등록하지 않았거나 하위 호출에 ctx를 넘기지 않았다', 'service.name이 서로 다르다'], a: 1,
      why: 'traceparent가 metadata로 넘어가야 서버 span이 같은 trace의 자식이 된다. 전파기가 없거나 새 context로 부르면 trace가 끊긴다.' },
    { q: 'p99 지연이 갑자기 올랐다. 원인 요청을 가장 빨리 찾는 길은?',
      o: ['모든 서비스 로그를 시간순으로 훑는다', '샘플링 비율을 100%로 올리고 기다린다', 'p99 버킷의 exemplar에 담긴 trace_id로 그 요청의 trace를 연다'], a: 2,
      why: 'RED는 어디가 아픈지를, trace는 왜 아픈지를 알려 준다. exemplar가 둘을 이어 느린 막대에서 실제 trace로 바로 넘어가게 한다.' },
    { q: 'trace 저장 비용이 너무 크다. 에러 난 요청은 놓치지 않으면서 줄이려면?',
      o: ['Collector에 tail_sampling으로 ERROR와 느린 trace를 남기는 정책을 건다', '서버 StatsHandler를 뺀다', 'TraceIDRatioBased를 0.001 로만 낮춘다'], a: 0,
      why: '비율만 낮추면 에러 trace도 같이 버려진다. tail_sampling은 trace가 끝난 뒤 상태와 지연을 보고 고른다.' },
  ];

  R.page({ title: 'gRPC 관측 (OpenTelemetry)', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
