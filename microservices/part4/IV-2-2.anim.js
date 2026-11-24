/* IV-2-2 분산 추적 — trace · span · traceparent · OTel · 폭포 차트 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, clock, dbIcon, terminal, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const TID = '4bf92f3577b34da6a3ce929d0e0e4736';
  // 폭포 차트: rows [이름, 시작ms, 길이ms, 색, 들여쓰기]. prog 0→1 로 위에서부터 그린다
  function wf(x, y, W, rows, prog, o) { o = o || {}; const T = o.T || 1100, X = (v) => x + W * v / T, rh = o.rh || 38, nw = o.nw || 150;
    [0, 500, 1000].forEach((v) => { el('line', { x1: nw + X(v) - x, y1: y - 8, x2: nw + X(v) - x, y2: y + rows.length * rh, stroke: GRID, 'stroke-dasharray': '3 4' }); mono(nw + X(v) - x, y - 14, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    rows.forEach(([n, s, d, col, ind], i) => { const g = clamp(prog * rows.length - i), yy = y + i * rh; if (g <= 0) return;
      tx(x + (ind || 0) * 14, yy + rh / 2 + 5, n, { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: o.faint ? MUT : INK, opacity: g });
      el('rect', { x: nw + X(s) - x, y: yy + 7, width: Math.max(3, (X(s + d) - X(s)) * g), height: rh - 14, rx: 4, fill: col || ACC, opacity: o.faint ? 0.45 : 0.9 });
      if (g >= 1 && d) mono(nw + X(s + d) - x + 6, yy + rh / 2 + 5, d + 'ms', { 'font-size': 13.5, 'font-weight': 700, fill: col === BAD ? BAD : INK }); }); }
  const ROWS = [['gateway', 0, 40, INFO], ['auth', 40, 60, ACC], ['orders', 100, 250, ACC], ['payments', 350, 600, BAD], ['inventory', 950, 150, ACC]];

  // 1. 추적 없이: 시각만 남은 로그
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { const n = k === 0 ? 2 : 5, rows = ROWS.slice(0, n);
      tx(40, 46, '로그 시각 차이로 어림한 구간 시간', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      if (k === 0) wf(40, 90, 560, rows, E(u, 0.3, 1.6), { faint: true });
      if (k === 1) { wf(40, 90, 560, ROWS, 0.4 + 0.6 * E(u, 0.2, 1.4), { faint: true });
        const s = pop(u, 1.6); mono(40, 320, '합계 1100ms', { 'font-size': 18, 'font-weight': 800, opacity: s > 0.5 ? 1 : 0 });
        tx(40, 352, 'payments 600ms 안에서 무엇이 오래 걸렸나?', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
        mono(150 + 560 * 640 / 1100, 90 + 3 * 38 + 24, '?', { 'font-size': 22, 'font-weight': 800, fill: PANEL, opacity: fade(u, 2.2) }); }
      if (k === 0) terminal(40, 300, 560, 100, ['12:00:00.000 checkout start', '12:00:00.060 auth done'], E(u, 0.4, 2.0) * 2, { title: 'checkout.log' });
      return; }
    if (k === 2) { const files = [['checkout.log', '"checkout start"'], ['auth.log', '"verify(token=abc)"'], ['orders.log', '"INSERT order …"'], ['payments.log', '"POST gateway …"'], ['inventory.log', '"UPDATE stock …"']];
      files.forEach(([f, l], i) => { const x = 110 + (i % 3) * 300 + (i >= 3 ? 150 : 0), y = 110 + Math.floor(i / 3) * 150, s = pop(u, 0.2 + i * 0.25);
        card(x + 70, y, 260, 90, { rx: 10, stroke: GRID, sw: 1.8, s }); mono(x - 50, y - 18, f, { 'font-size': 14, 'font-weight': 800, opacity: s > 0.5 ? 1 : 0 }); mono(x - 50, y + 14, l, { 'font-size': 13.5, fill: MUT, opacity: s > 0.5 ? 1 : 0 }); });
      tx(480, 400, '서로를 가리키는 공통 키가 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); return; }
    // k3: 동시 요청이 섞인 로그
    const cols = [ACC, INFO, WARN, GOOD, BAD], lines = []; for (let i = 0; i < 12; i++) lines.push(i);
    tx(40, 46, '동시 요청 100개가 섞인 로그 (예시)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    lines.forEach((i) => { const y = 80 + i * 26, s = fade(u, 0.1 + i * 0.12), svc = ['auth', 'orders', 'payments', 'inventory'][(i * 3) % 4];
      el('rect', { x: 40, y: y - 14, width: 8, height: 18, rx: 2, fill: cols[(i * 7) % 5], opacity: s }); mono(58, y, `12:00:0${Math.floor(i / 4)}.${String(100 + i * 37).slice(-3)}  ${svc}: …`, { 'font-size': 13.5, opacity: s }); });
    [0, 1, 2].forEach((i) => tx(560 + i * 110, 200, '?', { 'font-size': 60, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6 + i * 0.2) }));
    tx(560, 300, '어느 줄이 어느 checkout 인가', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); tx(560, 330, '"원인 모름, 재현 안 됨"', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.3) }); }

  // 2. Trace 와 Span
  function idCard(x, y, rows, o) { o = o || {}; el('rect', { x, y, width: o.w || 400, height: 34 + rows.length * 30, rx: 10, fill: PANEL, stroke: o.stroke || ACC, 'stroke-width': 2, opacity: o.op ?? 1 });
    if (o.title) tx(x + 14, y + 24, o.title, { 'font-size': 14.5, 'font-weight': 800, opacity: o.op ?? 1 });
    rows.forEach(([k2, v, col, op], i) => { mono(x + 14, y + 56 + i * 30, k2, { 'font-size': 14, fill: MUT, opacity: op ?? 1 }); mono(x + 130, y + 56 + i * 30, v, { 'font-size': 14, 'font-weight': 700, fill: col || INK, opacity: op ?? 1 }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { // 요청 하나 = trace, 그 안의 작업 = span
      const x0 = 100, W = 760, X = (v) => x0 + W * v / 1100;
      el('rect', { x: x0, y: 100, width: W * E(u, 0.2, 0.9), height: 40, rx: 6, fill: INK }); mono(x0 + 14, 126, 'Trace: POST /checkout 한 번', { 'font-size': 14.5, 'font-weight': 700, fill: PANEL, opacity: fade(u, 0.7) });
      ROWS.forEach(([n, s, d], i) => { const g = E(u, 1.0 + i * 0.2, 1.4 + i * 0.2); el('rect', { x: X(s), y: 170, width: Math.max(2, (X(s + d) - X(s)) * g - 3), height: 40, rx: 5, fill: i === 3 ? BAD : ACC, opacity: 0.85 });
        if (d >= 150) mono(X(s) + 8, 196, n, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, opacity: g }); });
      tx(x0, 250, 'Span = 그 안의 작업 하나 (HTTP 호출, DB 쿼리)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { // ID 세 개
      idCard(60, 80, [['trace_id', '4bf92f…4736', ACC], ['span_id', '00f067aa0ba902b0'], ['parent_id', 'None', MUT]], { title: 'checkout (root)', w: 380 });
      idCard(520, 80, [['trace_id', '4bf92f…4736', ACC, fade(u, 0.5)], ['span_id', '새로 생성', WARN, fade(u, 1.0)], ['parent_id', '00f067aa0ba902b0', INFO, fade(u, 1.5)]], { title: 'orders.create', w: 380 });
      grow(440, 136, 520, 136, E(u, 0.3, 0.7), ACC); mono(480, 126, '물려받음', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      el('path', { d: 'M 650,226 C 600,300 330,300 290,166', fill: 'none', stroke: INFO, 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.7), 'marker-end': 'url(#ra-ah)' });
      tx(480, 360, 'trace_id 는 끝까지 같고, span_id 만 매번 새로', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { // 시작·끝 시각 → 막대 → 컬렉터
      const x0 = 120, W = 440, g = E(u, 0.5, 1.5); mono(x0, 110, 'start_at', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.2) }); el('line', { x1: x0, y1: 120, x2: x0, y2: 190, stroke: INK, 'stroke-width': 2 });
      el('rect', { x: x0, y: 140, width: W * g, height: 34, rx: 5, fill: ACC }); mono(x0 + 10, 163, 'orders.create', { 'font-size': 14, 'font-weight': 700, fill: PANEL, opacity: fade(u, 0.8) });
      if (g >= 1) { el('line', { x1: x0 + W, y1: 120, x2: x0 + W, y2: 190, stroke: INK, 'stroke-width': 2 }); mono(x0 + W, 110, 'end()', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); }
      pill(x0 + 90, 230, 'tags: http.status, db.system', INFO, pop(u, 1.2), { mono: true, fs: 13.5 });
      dbIcon(800, 160, '컬렉터', { s: pop(u, 1.6) }); fly(x0 + W, 157, 760, 160, seg(u, 1.8, 2.5), 'export', { mono: true });
      tx(120, 330, 'span 하나 = 폭포 차트 막대 하나', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { // parent_id 로 트리 복원
      const tree = [['checkout (root)', 0], ['auth.verify', 1], ['orders.create', 1], ['db.insert', 2], ['payments.charge', 1], ['http.gateway', 2], ['inventory.reserve', 1]];
      tree.forEach(([n, d], i) => { const x = 120 + d * 60, y = 70 + i * 46, s = fade(u, 0.2 + i * 0.25);
        if (d) { const py = 70 + (d === 2 ? (i - 1) : 0) * 46; el('path', { d: `M${x - 40},${(d === 2 ? py : 70) + 10} V${y - 5} H${x - 8}`, fill: 'none', stroke: GRID, 'stroke-width': 2, opacity: s }); }
        card(x + 110, y - 5, 220, 34, { rx: 8, stroke: d === 2 ? WARN : d ? ACC : INK, sw: 1.8, op: s, text: n, fs: 14, mono: true }); });
      tx(560, 200, 'parent_id 만 따라가면', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); tx(560, 230, '호출 그래프가 그대로 나온다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) });
      tx(560, 270, 'Step 1 에서 못 그린 그림', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.4) }); return; }
    // k4: OTel 데이터 모델
    const rows = [['"traceId"', '"4bf92f…"'], ['"spanId"', '"00f067aa0ba902b7"'], ['"parentId"', '"00f067aa0ba902b0"'], ['"name"', '"POST /orders"'], ['"startTimeUnixNano"', '1700000000000000000'], ['"endTimeUnixNano"', '1700000000250000000'], ['"attributes"', '{ "http.status_code": 200 }']];
    el('rect', { x: 60, y: 50, width: 560, height: 300, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    rows.forEach(([a, b2], i) => { const op = fade(u, 0.2 + i * 0.2), hot = i === 4 || i === 5; if (hot) el('rect', { x: 66, y: 72 + i * 38, width: 548, height: 30, rx: 5, fill: WARNBG, opacity: op });
      mono(80, 93 + i * 38, a, { 'font-size': 14, fill: INFO, opacity: op }); mono(290, 93 + i * 38, b2, { 'font-size': 14, 'font-weight': 700, opacity: op }); });
    mono(790, 260, '차이 250,000,000 ns', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); mono(790, 290, '= 250ms', { 'font-size': 18, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
    tx(790, 120, '표준 스키마', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); tx(790, 148, '어느 언어든 같은 모양', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }

  // 3. W3C traceparent
  const HOPS = [['gateway', '00f067aa0ba902b7'], ['auth', 'bb12345abcdef000'], ['orders', 'cc89abcdef012345'], ['payments', null]];
  const HX = (i) => 110 + i * 245;
  function hdr(x, y, parent, o) { o = o || {}; const parts = [['00', MUT], ['4bf92f…4736', ACC], [parent, WARN], [o.flag || '01', INFO]], fs = 14;
    let cx = x; parts.forEach(([s, col], i) => { mono(cx, y, s, { 'font-size': fs, 'font-weight': 800, fill: col, opacity: o.op ?? 1 }); cx += tw(s, fs) + (i < 3 ? 4 : 0); if (i < 3) { mono(cx, y, '-', { 'font-size': fs, fill: MUT, opacity: o.op ?? 1 }); cx += tw('-', fs) + 4; } }); return cx; }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { // 네 조각
      mono(80, 70, 'traceparent:', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.2) });
      const seg4 = [['00', 'version', MUT, 40], [TID, 'trace-id (32자)', ACC, 300], ['00f067aa0ba902b7', 'parent-id (16자)', WARN, 160], ['01', 'flags', INFO, 40]];
      let x = 80; seg4.forEach(([s, n, col, w], i) => { const ww = tw(s, 14.5) + 18, sc = pop(u, 0.4 + i * 0.35);
        card(x + ww / 2, 130, ww, 40, { rx: 6, stroke: col, sw: 2, text: s, fs: 14.5, mono: true, color: col, s: sc }); tx(x + ww / 2, 180, n, { 'text-anchor': 'middle', 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: sc > 0.5 ? 1 : 0 }); x += ww + 14; });
      card(200, 290, 220, 60, { rx: 10, stroke: INK, sw: 2, text: 'gateway', fs: 15, s: pop(u, 1.8) }); person(50, 290, null, {});
      tx(330, 296, '헤더 없는 첫 요청 → 새 trace 시작', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // 홉 사슬
    const n = k === 1 ? 2 : 4;
    HOPS.slice(0, n).forEach(([h], i) => card(HX(i), 110, 150, 56, { rx: 10, stroke: INK, sw: 2, text: h, fs: 15, s: k === 2 && i >= 2 ? pop(u, 0.2 + (i - 2) * 0.6) : 1 }));
    for (let i = 0; i < n - 1; i++) { const st = k === 1 ? 0.3 : 0.3 + i * 0.6, g = k === 1 || k === 2 ? E(u, st, st + 0.5) : 1;
      grow(HX(i) + 76, 110, HX(i + 1) - 78, 110, g, ACC);
      const y = 200 + (k === 2 || k >= 3 ? i * 40 : 0); if (g > 0.6 && (k <= 2 || k === 4 || k === 3)) { mono(40, y, (i + 1) + ')', { 'font-size': 14, fill: MUT }); hdr(70, y, HOPS[i][1], { op: g, flag: k === 3 && i === 2 ? '01' : '01' }); } }
    if (k === 1) { tx(70, 260, 'auth 는 이 값을 부모로 삼고 자기 span_id 를 만든다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); mono(70, 296, 'auth span_id = bb12345abcdef000', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 2) tx(620, 360, 'trace-id 고정, parent 자리만 이동', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
    if (k === 3) { // flags 01 저장 / 00 버림
      const y = 340; mono(70, y, '…-01', { 'font-size': 16, 'font-weight': 800, fill: INFO }); grow(130, y - 5, 230, y - 5, E(u, 0.3, 0.8), GOOD); dbIcon(290, y - 10, null, { s: 0.55 * pop(u, 0.8), stroke: GOOD }); tx(330, y, 'sampled · 저장', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(520, y, '…-00', { 'font-size': 16, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.2) }); grow(580, y - 5, 680, y - 5, E(u, 1.4, 1.9), BAD); cross(710, y - 5, 10, pop(u, 1.9)); tx(735, y, '저장 안 함', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 4) { const p = seg(u, 0.4, 2.4); for (let i = 0; i < 3; i++) { const f = clamp(p * 3 - i); if (f > 0 && f < 1) fly(HX(i) + 40, 70, HX(i + 1) - 40, 70, f, 'baggage', { fill: GOOD, mono: true }); }
      pill(480, 340, 'baggage: user.id=12345, checkout.experiment=B', GOOD, pop(u, 0.2), { mono: true, fs: 14 });
      tx(480, 390, '메타데이터도 같은 방식으로 따라간다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); } }

  // 4. OpenTelemetry SDK
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { el('rect', { x: 50, y: 50, width: 500, height: 170, rx: 10, fill: INK });
      ['OTEL_SERVICE_NAME=orders', 'OTEL_EXPORTER_OTLP_ENDPOINT=…:4317', 'OTEL_TRACES_SAMPLER=parentbased_traceidratio', 'OTEL_TRACES_SAMPLER_ARG=0.1'].forEach((s, i) => mono(68, 86 + i * 34, s, { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.2 + i * 0.25) }));
      // 감싸는 명령
      const g = E(u, 1.4, 2.0); el('rect', { x: 620 - 40 * g, y: 90 - 30 * g, width: 240 + 80 * g, height: 120 + 60 * g, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: g });
      card(740, 150, 200, 70, { rx: 10, stroke: INK, sw: 2, text: 'uvicorn app.main:app', fs: 13.5, mono: true });
      mono(580, 50, 'opentelemetry-instrument', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: g });
      tx(50, 290, '설정은 코드가 아니라 환경변수', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.2) }); tx(50, 320, '서비스마다 복붙할 코드가 없다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.4) }); return; }
    if (k === 1) { el('rect', { x: 60, y: 60, width: 520, height: 210, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      ['from fastapi import FastAPI', 'from opentelemetry import trace', 'import httpx', 'app = FastAPI()', 'tracer = trace.get_tracer(__name__)'].forEach((s, i) => { const hot = i === 1 || i === 4;
        if (hot) el('rect', { x: 66, y: 76 + i * 36, width: 508, height: 30, rx: 5, fill: GOODBG, opacity: fade(u, 0.5 + i * 0.1) }); mono(80, 97 + i * 36, (hot ? '+ ' : '  ') + s, { 'font-size': 14.5, fill: hot ? GOOD : INK, 'font-weight': hot ? 700 : 400 }); });
      tx(640, 140, '늘어난 줄은 둘', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.2) }); tx(640, 172, 'FastAPI 앱은 그대로', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) }); return; }
    // 요청 하나의 span 막대
    const x0 = 160, W = 640, X = (f) => x0 + W * f;
    const bar = (n, a, b, y, col, g, lab) => { el('rect', { x: X(a), y, width: (X(b) - X(a)) * g, height: 34, rx: 5, fill: col, opacity: 0.9 }); mono(X(a) + 10, y + 23, n, { 'font-size': 14, 'font-weight': 700, fill: PANEL, opacity: g > 0.5 ? 1 : 0 }); if (lab) tx(x0 - 14, y + 23, lab, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: g }); };
    if (k <= 3) { bar('POST /orders', 0, 1, 70, INK, k === 2 ? E(u, 0.2, 0.9) : 1, '자동');
      bar('httpx POST inventory/reserve', 0.08, 0.55, 120, ACC, k === 2 ? E(u, 0.9, 1.6) : 1, '자동');
      if (k === 2) { pill(X(0.55) + 100, 210, 'traceparent 자동 부착', WARN, pop(u, 1.8), { fs: 14 }); grow(X(0.55), 154, X(0.55) + 40, 196, E(u, 1.6, 2.0), WARN);
        tx(x0, 300, '경로 핸들러는 root, httpx 호출은 child', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }
      if (k === 3) { bar('price_calculation', 0.6, 0.92, 170, WARN, E(u, 0.2, 1.0), '수동');
        ['items.count', 'price.total'].forEach((s, i) => pill(X(0.62) + i * 130 + 50, 250, s, WARN, pop(u, 1.2 + i * 0.3), { mono: true, fs: 13.5 }));
        tx(x0, 320, '비즈니스 의미가 있는 구간만 직접 감싼다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); tx(x0, 348, '속성은 나중에 Jaeger 검색 조건이 된다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); }
      return; }
    // k4: 샘플링 10% → 컬렉터 → Jaeger
    tx(60, 60, 'trace 10개 중 1개만 저장 (ARG 0.1)', { 'font-size': 15, 'font-weight': 700 });
    for (let i = 0; i < 10; i++) { const keep = i === 3, y = 90 + i * 30, s = fade(u, 0.1 + i * 0.08); el('rect', { x: 60, y, width: 260, height: 20, rx: 4, fill: keep ? ACC : OFF, opacity: s * (keep ? 1 : 0.6) });
      if (keep) fly(330, y + 10, 560, 200, seg(u, 1.2, 1.9), 'export', { mono: true }); }
    card(620, 200, 140, 60, { rx: 10, stroke: INK, sw: 2, text: 'OTel\nCollector', fs: 14, s: pop(u, 0.9) }); grow(690, 200, 790, 200, E(u, 1.9, 2.3), ACC); dbIcon(850, 200, 'Jaeger', { s: pop(u, 2.1) });
    tx(480, 400, '경로 · HTTP · DB span 은 자동, 저장량은 환경변수로', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) }); }

  // 5. 메트릭 · 로그 · 트레이스, 그리고 폭포 차트
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const ax = axes(110, 60, 560, 250, { x: [0, 10], y: [0, 3], yt: [0, 1, 2, 3], xl: '분', yl: '에러율 %', grid: true });
      el('line', { x1: ax.X(0), y1: ax.Y(1), x2: ax.X(10), y2: ax.Y(1), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4' }); mono(ax.X(10), ax.Y(1) - 8, '알람 1%', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'end' });
      line(ax, [[0, 0.3], [2, 0.4], [4, 0.3], [5, 0.6], [6, 1.4], [7, 2.1], [8, 2.4], [10, 2.2]], E(u, 0.2, 1.6), WARN);
      card(810, 120, 180, 56, { rx: 10, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 1.6), text: '에러율 1% 초과', fs: 14.5, color: BAD });
      tx(810, 220, '어느 요청이?', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 2.1) }); tx(810, 250, '메트릭은 말해 주지 않는다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 1 || k === 2) { const P = [['Metrics', '무엇이 이상한가', 'Prometheus'], ['Logs', '무슨 일이 있었나', 'Loki · ELK'], ['Traces', '어느 경로의 어느 단계', 'Jaeger · Tempo']];
      P.forEach(([a, b2, d], i) => { const x = 170 + i * 310, s = k === 1 ? pop(u, 0.2 + i * 0.35) : 1; card(x, 160, 260, 160, { rx: 12, stroke: i === 2 ? ACC : INK, sw: 2.2, s });
        tx(x, 120, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: i === 2 ? ACC : INK, opacity: s > 0.5 ? 1 : 0 }); tx(x, 160, b2, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 }); mono(x, 196, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s > 0.5 ? 1 : 0 }); });
      if (k === 1) mono(480, 300, 'log: "user 123 paid 1000 KRW"', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      if (k === 2) { const y = 330; pill(480, y, 'trace_id 4bf92f…4736', ACC, pop(u, 0.3), { mono: true, fs: 15 });
        [170, 480, 790].forEach((x, i) => grow(480, y - 16, x, 244, E(u, 0.8 + i * 0.2, 1.3 + i * 0.2), ACC));
        [['알람 → Jaeger 링크', 170], ['로그 줄에 trace_id', 480], ['exemplar 점 클릭', 790]].forEach(([s, x], i) => tx(x, 390, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.6 + i * 0.2) })); }
      return; }
    if (k === 3) { // 폭포 차트에서 범인
      tx(40, 40, 'trace 4bf92f…4736  ·  POST /checkout', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, class: 'mono' });
      const rows = [['POST /checkout', 0, 1100, INK, 0], ['auth', 40, 60, ACC, 1], ['orders', 100, 250, ACC, 1], ['payments', 350, 600, BAD, 1], ['http.gateway', 360, 580, WARN, 2], ['inventory', 950, 150, ACC, 1]];
      wf(40, 80, 600, rows, E(u, 0.2, 1.4), { nw: 190 });
      const hy = 80 + 4 * 38; el('rect', { x: 34, y: hy, width: 900, height: 38, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.6) });
      pill(330, 340, 'http.url = stripe.com', WARN, pop(u, 1.9), { mono: true, fs: 14.5 });
      tx(520, 346, '600ms 중 580ms 가 외부 결제 호출', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.2) });
      tx(520, 376, '같은 trace_id 로 로그를 찾으면 에러 메시지까지', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.4) }); return; }
    // k4: 운영 체크리스트
    tx(480, 40, '운영 기준', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
    ['모든 서비스에 OTel SDK', 'OTLP Collector 한 곳', '샘플링 10% 부터', '에러 trace 100% (tail sampling)', '로그에 trace_id · span_id', '알람에 trace 링크', '보존 Hot 3d · Cold 30d'].forEach((s, i) => {
      const x = i < 4 ? 90 : 530, y = 90 + (i % 4) * 70, s2 = pop(u, 0.2 + i * 0.25); card(x + 170, y, 360, 52, { rx: 10, stroke: GRID, sw: 1.8, s: s2 }); check(x + 24, y, 9, s2);
      tx(x + 46, y + 5, s, { 'font-size': 15, 'font-weight': 700, opacity: s2 > 0.5 ? 1 : 0 }); });
    tx(705, 370, '−90% 저장량, 원인은 1분 안에', { 'text-anchor': 'middle', 'font-size': 15, fill: GOOD, 'font-weight': 800, opacity: fade(u, 2.3) }); }

  const quiz = [
    { q: '로그 시각만으로 구간 시간을 알아도 원인을 못 찾는 이유는 무엇인가?',
      o: ['로그를 한 요청으로 잇는 공통 키가 없어서', '로그 시각이 부정확해서', '로그 파일이 너무 커서'], a: 0,
      why: 'checkout.log와 payments.log가 따로 쌓이고 서로를 가리키는 값이 없다. 동시 요청이 섞이면 어느 줄이 어느 요청인지 모른다.' },
    { q: 'orders.create span이 checkout 아래 자식이라는 것은 어떤 값으로 알 수 있나?',
      o: ['span_id가 같아서', 'parent_id가 checkout의 span_id를 가리켜서', 'name 속성이 같아서'], a: 1,
      why: 'trace_id는 같은 요청끼리 묶고, parent_id가 부모 span을 가리킨다. 이 값을 따라가면 호출 트리가 복원된다.' },
    { q: 'auth가 orders를 부를 때 traceparent에서 바뀌는 부분은 무엇인가?',
      o: ['parent-id 자리가 auth의 span_id로 바뀐다', 'trace-id가 새로 만들어진다', 'version이 01로 바뀐다'], a: 0,
      why: 'trace-id 4bf92f…4736은 끝까지 그대로이고, 부모 자리만 호출하는 쪽의 span_id로 갈린다.' },
    { q: 'OTEL_TRACES_SAMPLER_ARG=0.1이면 trace 저장은 어떻게 되나?',
      o: ['모든 trace를 저장하고 10%만 화면에 보인다', 'trace 10개 중 1개 정도만 저장한다', '요청의 10%만 계측한다'], a: 1,
      why: 'traceidratio 샘플러가 trace_id 기준으로 0.1 비율만 sampled로 표시한다. 저장량과 비용이 그만큼 준다.' },
    { q: '폭포 차트에서 payments 600ms 중 580ms를 차지한 것은 무엇이었나?',
      o: ['orders의 DB insert', 'inventory 재고 갱신', 'stripe.com으로 가는 외부 호출'], a: 2,
      why: 'payments 아래 자식 span의 태그 http.url이 stripe.com을 가리켰다. 느린 원인은 내부 DB가 아니라 외부 의존이었다.' },
  ];

  const summary = [
    'checkout 한 번이 5개 서비스를 지나며 약 1.1초가 걸려도 로그만으로는 어디서 느린지 모른다.',
    '모든 span이 같은 trace_id를 갖고 parent_id로 부모를 가리키면 호출 트리가 다시 그려진다.',
    'traceparent 헤더가 trace-id를 그대로 넘기고 부모 자리만 바꿔 서비스 사이를 잇는다.',
    'OTel SDK가 span을 자동으로 만들고, 폭포 차트에서 payments 안 580ms 외부 호출을 바로 찾았다.',
  ];
  const review = [
    { q: 'Jaeger에서 trace가 서비스마다 끊겨 따로 보인다. 먼저 확인할 것은?',
      o: ['샘플링 비율이 너무 낮은지', '로그 보존 기간', '호출마다 traceparent 헤더가 전파되는지'], a: 2,
      why: '헤더가 전파되지 않으면 받는 쪽이 새 trace를 시작한다. 같은 trace_id가 이어져야 한 화면에 묶인다.' },
    { q: '에러율 알람이 울렸다. 원인 코드까지 가장 빨리 가는 순서는?',
      o: ['로그 전체를 grep한 뒤 대시보드를 본다', '알람의 trace 링크로 폭포 차트를 열고 같은 trace_id로 로그를 찾는다', '서비스를 하나씩 재시작해 본다'], a: 1,
      why: '메트릭은 이상을, 트레이스는 느린 단계를, 로그는 그 단계의 사건을 말한다. trace_id가 셋을 이어 준다.' },
    { q: '샘플링을 10%로 낮췄더니 드문 결제 오류 trace가 남지 않는다. 알맞은 대응은?',
      o: ['Collector에서 에러 trace는 tail sampling으로 모두 남긴다', 'traceparent flags를 모두 00으로 바꾼다', 'baggage에 오류 내용을 싣는다'], a: 0,
      why: '앞단에서 비율로 고르면 오류도 같이 버려진다. 끝난 trace를 보고 고르는 tail sampling으로 에러만 100% 저장한다.' },
  ];

  R.page({ title: 'POST /checkout 한 요청 따라가기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
