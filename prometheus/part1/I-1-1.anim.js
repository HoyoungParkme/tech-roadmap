/* I-1-1 Metric Type 4종 — 장면 4개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, axes, line, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // /metrics 노출 한 줄을 색으로 나눈다: # HELP/TYPE 은 회색, 이름은 진하게, {라벨} 은 파랑, 값은 강조색
  function expoParts(s) {
    if (s.startsWith('#')) { const m = s.match(/^(# (?:HELP|TYPE) )(\S+)(.*)$/);
      return m ? [[m[1], { fill: MUT }], [m[2], { fill: INK, 'font-weight': 700 }], [m[3], { fill: m[1].includes('TYPE') ? WARN : MUT, 'font-weight': m[1].includes('TYPE') ? 700 : 400 }]] : [[s, { fill: MUT }]]; }
    const m = s.match(/^([A-Za-z_:][\w:]*)(\{[^}]*\})?(\s+.*)?$/);
    if (!m) return [[s, { fill: INK }]];
    return [[m[1], { fill: INK, 'font-weight': 700 }], [m[2] || '', { fill: INFO }], [m[3] || '', { fill: ACC, 'font-weight': 700 }]];
  }
  // 노출 텍스트 창: lines 중 shown 줄까지(소수면 마지막 줄을 타이핑), hi(i) 면 바탕 강조
  function expo(x, y, w, lines, shown, o) { o = o || {}; const fs = o.fs || 13.5, lh = o.lh || 24, h = o.h || lines.length * lh + 46;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 21, o.title || 'GET /metrics', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    lines.forEach((s, i) => { const v = clamp(shown - i); if (v <= 0) return; const yy = y + 46 + i * lh;
      if (o.hi && o.hi(i)) el('rect', { x: x + 6, y: yy - lh + 7, width: w - 12, height: lh, rx: 5, fill: ACCBG });
      const part = v >= 1 ? s : s.slice(0, Math.ceil(s.length * v));
      spans(x + 14, yy, expoParts(part), { 'font-size': fs, 'text-decoration': o.strike && o.strike(i) ? 'line-through' : null }); }); }
  // 저장된 시계열 한 줄: 라벨 + 값 (값이 0 에서 차오르는 계수기)
  function series(x, y, w, labels, val, o) { o = o || {}; const h = 36, s = o.s ?? 1;
    if (s <= 0) return; const g = R.G(x, y, 1, o.op ?? 1);
    el('rect', { x: 0, y: 0, width: w * clamp(s), height: h, rx: 7, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.8 }, g);
    if (s < 0.6) return;
    mono(12, 23, labels, { 'font-size': 13.5, fill: INFO }, g);
    mono(w - 12, 24, val, { 'font-size': 15, 'font-weight': 800, fill: o.col || ACC, 'text-anchor': 'end' }, g); }
  const fmt = (v) => Math.round(v).toLocaleString('en-US');

  // ───────── 1. Counter ─────────
  const EXPO_C = ['# HELP http_requests_total Total HTTP requests', '# TYPE http_requests_total counter',
    'http_requests_total{method="GET",status="200"} 1027', 'http_requests_total{method="POST",status="200"} 412', 'http_requests_total{method="POST",status="500"} 3',
    '# TYPE errors_total counter', 'errors_total{kind="db_timeout"} 8', 'errors_total{kind="upstream_5xx"} 21'];
  const ROWS_C = [['http_requests_total', 'method="GET",status="200"', 1027], ['', 'method="POST",status="200"', 412], ['', 'method="POST",status="500"', 3],
    ['errors_total', 'kind="db_timeout"', 8], ['', 'kind="upstream_5xx"', 21]];
  // 단조 증가 계단 (그림용 모양)
  const STAIR = Array.from({ length: 13 }, (_, i) => [i, 4 + i * 6 + (i % 3) * 2]);

  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const ax = axes(70, 60, 470, 270, { x: [0, 12], y: [0, 90], xl: '시간 →', yl: 'http_requests_total' });
      line(ax, STAIR, E(u, 0.2, 2.0), ACC, { sw: 3.2 });
      const f = E(u, 0.2, 2.0), v = 4 + f * 12 * 6.4;
      mono(ax.X(f * 12) + 10, ax.Y(v) - 8, '↑', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: f > 0.05 ? 1 : 0 });
      card(760, 120, 300, 70, { rx: 12, stroke: ACC, sw: 2.2, s: pop(u, 0.6), text: '올라가기만 한다\n재시작하면 0부터', fs: 16 });
      const s2 = pop(u, 1.3); card(760, 230, 300, 64, { rx: 12, stroke: BAD, sw: 2, s: s2 });
      if (s2 > 0.5) { cross(640, 230, 11); tx(668, 236, '감소 API 없음', { 'font-size': 16, 'font-weight': 700, fill: BAD }); }
      tx(760, 320, '용도: 요청 수 · 에러 수', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) });
      return; }
    if (k <= 3) { const upto = k === 1 ? 2 : k === 2 ? 5 : 8, from = k === 1 ? 0 : k === 2 ? 2 : 5;
      expo(20, 24, 470, EXPO_C, from + (upto - from) * E(u, 0.2, 1.6), { hi: (i) => i >= from && i < upto, h: 250 });
      zone(520, 24, 420, 380, '저장되는 시계열 (이름 + 라벨 조합마다 하나)');
      if (k === 1) { pill(730, 120, 'http_requests_total', INK, pop(u, 1.0), { mono: true, fs: 15 });
        pill(730, 170, 'TYPE = counter', WARN, pop(u, 1.5), { mono: true, fs: 14 });
        sub(730, 230, '값 줄은 아직 없다', fade(u, 2.0)); return; }
      const nRows = k === 2 ? 3 : 5;
      ROWS_C.slice(0, nRows).forEach(([nm, lab, v], i) => { const y = 66 + i * 52 + (i >= 3 ? 26 : 0), fresh = (k === 2 && i < 3) || (k === 3 && i >= 3);
        const d = fresh ? 0.6 + (i % 3) * 0.35 : -1, s = fresh ? E(u, d, d + 0.4) : 1;
        if (nm) mono(536, y - 4, nm, { 'font-size': 13.5, 'font-weight': 700, fill: INK, opacity: fresh ? fade(u, d) : 1 });
        series(536, y + 2, 390, lab, fmt(fresh ? v * E(u, d + 0.3, d + 1.3) : v), { s }); });
      if (k === 3) mono(730, 394, '시계열 5개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
      else mono(730, 394, '이름 1개 → 시계열 3개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
      return; }
    if (k === 4) { snippet(30, 70, ['requests_total = Counter(', '    "http_requests_total",', '    "Total HTTP requests",', '    ["method", "status"],', ')'], { op: fade(u, 0.1) });
      grow(400, 140, 540, 140, E(u, 0.8, 1.4), ACC);
      zone(560, 60, 370, 200, '/metrics 출력 목록', { stroke: ACC, op: fade(u, 1.2) });
      pill(745, 120, 'http_requests_total', ACC, pop(u, 1.5), { mono: true, fs: 14 });
      tx(745, 170, '라벨 키: method · status', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(745, 200, '값은 아직 비어 있다', fade(u, 2.1));
      banner(480, 340, '선언하는 순간 등록된다', pop(u, 2.2)); return; }
    // k 5~8: 요청 흐름과 계수기
    if (k === 5 || k === 6) { const Y = 120;
      person(80, Y, '클라이언트', {});
      card(330, Y, 170, 64, { rx: 10, stroke: ACC, sw: 2.2, text: '@middleware\nmetrics()', fs: 14.5, mono: true });
      server(600, Y, 'handler', {});
      el('line', { x1: 110, y1: Y, x2: 245, y2: Y, stroke: GRID, 'stroke-width': 2.5 }); el('line', { x1: 415, y1: Y, x2: 540, y2: Y, stroke: GRID, 'stroke-width': 2.5 });
      if (k === 5) { dot([[110, Y - 10], [245, Y - 10], [415, Y - 10], [540, Y - 10]], seg(u, 0.2, 1.1), INK, 7);
        dot([[540, Y + 12], [415, Y + 12]], seg(u, 1.2, 1.7), ACC, 7);
        pill(330, Y + 70, 'resp.status_code = 200', ACC, pop(u, 1.7), { mono: true, fs: 14 });
        tx(330, Y + 118, '응답을 받은 뒤라 status를 안다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); }
      const rowY = 280; series(250, rowY, 430, 'method="GET",status="200"', fmt(k === 6 && u > 1.5 ? 1028 : 1027), { s: k === 5 ? E(u, 2.0, 2.4) : 1, stroke: k === 6 && u > 1.5 ? ACC : GRID });
      if (k === 6) { pill(330, Y + 70, '.labels(GET, 200).inc()', ACC, 1, { mono: true, fs: 14 });
        fly(330, Y + 90, 640, rowY + 18, seg(u, 0.5, 1.5), '+1', { mono: true });
        if (u > 1.5) mono(700, rowY + 24, '1027 → 1028', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
        const s = pop(u, 2.0); pill(780, 160, '.dec()', BAD, s, { mono: true, fs: 15 }); if (s > 0.5) { cross(842, 160, 10); sub(780, 200, '내리는 API는 없다', 1, { fill: BAD, 'font-weight': 700 }); } }
      return; }
    if (k === 7) { const ax = axes(70, 50, 560, 290, { x: [0, 12], y: [0, 90], xl: '시간 (분) →', yl: '누적값' });
      line(ax, STAIR, 1, OFF, { sw: 3 });
      const w = E(u, 0.3, 1.0); el('rect', { x: ax.X(7), y: 50, width: (ax.X(12) - ax.X(7)) * w, height: 290, fill: ACCBG, opacity: 0.6 });
      mono(ax.X(9.5), 74, '[5m]', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      const y7 = 4 + 7 * 6 + 2, y12 = 4 + 12 * 6;
      grow(ax.X(7), ax.Y(y7), ax.X(12), ax.Y(y7), E(u, 1.0, 1.5), ACC, { plain: true, dash: '5 5' });
      grow(ax.X(12), ax.Y(y7), ax.X(12), ax.Y(y12), E(u, 1.5, 2.0), ACC, { plain: true, sw: 3 });
      line(ax, STAIR.slice(7), E(u, 1.0, 2.0), ACC, { sw: 3.4 });
      tx(800, 130, '누적값 1027', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 0.3) });
      card(800, 210, 250, 76, { rx: 12, stroke: ACC, sw: 2.2, s: pop(u, 1.9), text: '증가량 ÷ 300초\n= 초당 요청 수', fs: 16 });
      mono(800, 290, 'rate(…[5m])', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
    // k 8: 재시작 리셋 보정 (예시 값)
    const V = [1000, 1015, 1030, 5, 20], ax = axes(80, 50, 470, 280, { x: [-0.4, 4.4], y: [0, 1100], yt: [0, 500, 1000], xl: 'scrape 순서 →' });
    const pts = V.map((v, i) => [i, v]), f = E(u, 0.2, 1.4);
    line(ax, pts, f, INK, { sw: 2.6 }); R.scatter(ax, pts.map(([a, b]) => [a, b, INK]), { u: f, r: 5 });
    V.forEach((v, i) => mono(ax.X(i) + (i === 3 ? 12 : 0), ax.Y(v) - 12, String(v), { 'font-size': 14, 'font-weight': 700, 'text-anchor': i === 3 ? 'start' : 'middle', opacity: fade(u, 0.3 + i * 0.25) }));
    tx(ax.X(3) + 12, ax.Y(5) - 34, '재시작', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
    line(ax, [[2, 1030], [3, 1035], [4, 1050]], E(u, 1.4, 2.0), ACC, { sw: 2.6, dash: '6 5' });
    tx(760, 120, '그냥 빼면  20 − 1000 = −980', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 1.0) });
    card(760, 200, 320, 82, { rx: 12, stroke: ACC, sw: 2.2, s: pop(u, 1.7), text: '줄어든 곳 = 리셋\n15 + 15 + 5 + 15 = 50', fs: 16, mono: false });
    sub(760, 272, 'rate()·increase()가 이렇게 잇는다', fade(u, 2.2), { 'font-size': 14.5 });
    sub(760, 300, '(값은 예시)', fade(u, 2.2)); }

  // ───────── 2. Gauge ─────────
  const EXPO_G = ['# TYPE process_resident_memory_bytes gauge', 'process_resident_memory_bytes 134217728',
    '# TYPE db_pool_active gauge', 'db_pool_active{pool="primary"} 12', 'db_pool_active{pool="replica"} 3',
    '# TYPE queue_depth gauge', 'queue_depth{queue="emails"} 47'];
  const WAVE = Array.from({ length: 25 }, (_, i) => [i, 50 + Math.sin(i * 0.7) * 25 + Math.cos(i * 0.4) * 8]);
  function slots(x, y, n, filled, o) { o = o || {}; const w = o.w || 22, gap = 5;
    for (let i = 0; i < n; i++) el('rect', { x: x + i * (w + gap), y, width: w, height: 30, rx: 4, fill: i < filled ? (o.col || INFO) : PANEL, stroke: i < filled ? 'none' : GRID, 'stroke-width': 1.5, opacity: i < filled ? 0.85 : 1 }); }

  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const ax = axes(70, 60, 520, 270, { x: [0, 24], y: [0, 100], xl: '시간 →', yl: '지금 값' });
      line(ax, WAVE, E(u, 0.2, 2.2), INFO, { sw: 3.2 });
      [[4, '↑'], [9, '↓'], [15, '↑'], [20, '↓']].forEach(([i, a], j) => { const p = WAVE[i];
        mono(ax.X(p[0]), ax.Y(p[1]) + (a === '↑' ? -14 : 30), a, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.5 + j * 0.4) }); });
      card(790, 140, 270, 64, { rx: 12, stroke: INFO, sw: 2.2, s: pop(u, 1.2), text: '오르내림 자유\n지금 얼마인가', fs: 16 });
      sub(790, 220, '용도: 메모리 · 커넥션 · 큐 길이', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k <= 3) { const upto = k === 1 ? 2 : k === 2 ? 5 : 7, from = k === 1 ? 0 : k === 2 ? 2 : 5;
      expo(20, 24, 470, EXPO_G, from + (upto - from) * E(u, 0.2, 1.4), { hi: (i) => i >= from && i < upto, h: 216 });
      if (k === 1) { tx(720, 54, '1칸 = 1 MiB', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
        const n = Math.round(128 * E(u, 0.6, 2.2)); for (let i = 0; i < 128; i++) { const cx = 560 + (i % 16) * 20, cy = 70 + Math.floor(i / 16) * 20;
          el('rect', { x: cx, y: cy, width: 16, height: 16, rx: 3, fill: i < n ? INFO : PANEL, stroke: i < n ? 'none' : GRID, opacity: i < n ? 0.8 : 1 }); }
        mono(720, 260, '134217728 B = 128 MiB', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 2.0) });
        sub(720, 290, 'label 없음 → 시계열 1개', fade(u, 2.2)); return; }
      if (k === 2) { [['primary', 12, 90], ['replica', 3, 190]].forEach(([nm, v, y], i) => { const d = 0.6 + i * 0.5, f = E(u, d, d + 0.8);
          mono(530, y - 10, `pool="${nm}"`, { 'font-size': 14, fill: INFO, opacity: fade(u, d) });
          slots(530, y, 14, Math.round(v * f), { w: 20 }); mono(920, y + 21, String(Math.round(v * f)), { 'font-size': 18, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: fade(u, d) }); });
        sub(720, 290, '다음 scrape에는 다른 값일 수 있다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      // k3 큐
      el('rect', { x: 520, y: 70, width: 420, height: 150, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      mono(536, 92, 'queue="emails"', { 'font-size': 14, fill: INFO });
      const n = Math.round(47 * E(u, 0.5, 2.0)); for (let i = 0; i < n; i++) { const cx = 536 + (i % 16) * 24, cy = 108 + Math.floor(i / 16) * 34;
        el('rect', { x: cx, y: cy, width: 19, height: 14, rx: 2, fill: PANEL, stroke: INFO, 'stroke-width': 1.6 }); el('path', { d: `M${cx},${cy} L${cx + 9.5},${cy + 7} L${cx + 19},${cy}`, fill: 'none', stroke: INFO, 'stroke-width': 1.3 }); }
      mono(920, 92, `대기 ${n}건`, { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'end' });
      tx(730, 262, '쌓이면 올라가고, 보내면 내려간다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(730, 290, '내려가는 값이라 Counter로는 못 잰다', fade(u, 2.2)); return; }
    if (k === 4) { snippet(30, 80, ['requests_total = Counter(', '    "http_requests_total", …,', '    ["method", "status"],', ')'], { op: 0.55 });
      snippet(500, 80, ['pool_active = Gauge(', '    "db_pool_active", …,', '    ["pool"],', ')'], { op: fade(u, 0.3) });
      tx(250, 230, '선언 모양이 같다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
      banner(480, 310, '다른 것은 쓸 수 있는 API', pop(u, 1.6)); return; }
    if (k === 5) { const ops = [['.inc()', 13, 0.3], ['.dec()', 12, 1.1], ['.set(12)', 12, 1.9]];
      let v = 12; ops.forEach(([nm, after, at], i) => { const on = u >= at; if (on) v = after;
        pill(170 + i * 230, 80, nm, on ? INFO : OFF, pop(u, at - 0.2), { mono: true, fs: 16 }); });
      mono(200, 160, 'pool="primary"', { 'font-size': 15, fill: INFO });
      slots(200, 175, 16, v, { w: 26 }); mono(700, 198, String(v), { 'font-size': 24, 'font-weight': 800, fill: INFO });
      mono(480, 260, '12 → 13 → 12 → 12', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) });
      card(480, 330, 420, 54, { rx: 12, stroke: ACC, sw: 1.8, s: pop(u, 2.2), text: 'Counter는 .inc()만 있다', fs: 15 }); return; }
    // k6 조회
    const ax = axes(70, 60, 560, 270, { x: [0, 24], y: [0, 100], xl: '시간 →', yl: 'queue_depth' });
    const JAG = WAVE.map(([a, b], i) => [a, b + (i % 2 ? 12 : -12)]);
    line(ax, JAG, E(u, 0.2, 1.2), OFF, { sw: 2.2 });
    line(ax, WAVE, E(u, 1.1, 2.1), INFO, { sw: 3.6 });
    mono(810, 120, 'queue_depth', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4) });
    sub(810, 144, '그대로 읽는다', fade(u, 0.5));
    mono(810, 200, 'avg_over_time(…[5m])', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.3) });
    sub(810, 224, '추세는 평균으로', fade(u, 1.4));
    const s = pop(u, 1.9); pill(810, 290, 'rate()', BAD, s, { mono: true, fs: 15 }); if (s > 0.5) { cross(870, 290, 10); sub(810, 330, '필요 없다', 1, { fill: BAD, 'font-weight': 700 }); } }

  // ───────── 3. Histogram ─────────
  const LE = ['0.05', '0.1', '0.25', '0.5', '1.0', '+Inf'], CUM = [120, 340, 620, 810, 950, 1000];
  const EXPO_H = ['# TYPE http_request_duration_seconds histogram', ...LE.map((l, i) => `…_bucket{le="${l}"} ${CUM[i]}`), '…_sum 180.42', '…_count 1000'];
  // 누적 막대: vals, 0~u 로 차오름, hiIdx 강조
  function bars(x0, base, vals, o) { o = o || {}; const bw = o.bw || 50, gap = o.gap || 18, H = o.H || 220;
    vals.forEach((v, i) => { const g = o.grow ? o.grow(i) : 1, h = H * v / 1000 * g, x = x0 + i * (bw + gap), hi = o.hi && o.hi(i);
      el('rect', { x, y: base - h, width: bw, height: h, rx: 4, fill: hi ? ACC : INFO, opacity: hi ? 0.95 : 0.55 });
      mono(x + bw / 2, base + 22, LE[i], { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
      if (g > 0.3) mono(x + bw / 2, base - h - 8, o.label ? o.label(i, v) : String(Math.round(v * g)), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: hi ? ACC : INK }); });
    tx(x0 - 6, base + 44, 'le =', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); }

  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { expo(20, 24, 450, EXPO_H, k === 0 ? 0 : E(u, 0.2, 2.0) * EXPO_H.length, { hi: (i) => k === 1 && i === 0, h: 270, title: 'GET /metrics (이름 앞부분 …은 생략)' });
      if (k === 1) { pill(705, 70, 'http_request_duration_seconds', INK, pop(u, 0.4), { mono: true, fs: 14 }); }
      [['_bucket × 6', '구간별 누적 개수'], ['_sum', '관측값 총합'], ['_count', '관측 횟수']].forEach(([a, b], i) => { const cx = 560 + i * 140, s = k === 0 ? pop(u, 0.3 + i * 0.4) : 1;
        if (k === 1) grow(705, 88, cx, 150, E(u, 0.8 + i * 0.2, 1.3 + i * 0.2), MUT);
        card(cx, 190, 128, 74, { rx: 10, stroke: i === 0 ? ACC : INFO, sw: 2, s, text: a + '\n' + b, fs: 13.5, mono: false }); });
      if (k === 0) sub(705, 290, '이름 하나가 세 묶음을 만든다', fade(u, 1.8), { 'font-size': 15 });
      return; }
    if (k === 2) { bars(250, 330, CUM, { grow: (i) => E(u, 0.2 + i * 0.25, 0.7 + i * 0.25), hi: (i) => i === 3 });
      tx(660, 72, 'le="0.5" 810', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      tx(660, 98, '= 0.5초 이하가 810번', { 'font-size': 15, opacity: fade(u, 2.0) });
      sub(660, 124, '아래 구간을 다 포함 → 계단처럼 커진다', fade(u, 2.2), { 'text-anchor': 'start' }); return; }
    if (k === 3) { card(220, 150, 220, 80, { rx: 12, stroke: INFO, sw: 2, s: pop(u, 0.2), text: '_sum\n180.42', fs: 18, mono: true });
      tx(380, 160, '÷', { 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 800, opacity: fade(u, 0.7) });
      card(540, 150, 220, 80, { rx: 12, stroke: INFO, sw: 2, s: pop(u, 0.8), text: '_count\n1000', fs: 18, mono: true });
      grow(660, 150, 730, 150, E(u, 1.3, 1.7), ACC);
      card(820, 150, 150, 80, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 1.7), text: '평균\n≈ 0.18초', fs: 18 });
      sub(480, 260, '평균은 바로 나오지만, 꼬리(p95)는 bucket이 있어야 본다', fade(u, 2.2), { 'font-size': 15 }); return; }
    // 수직선 위의 경계 자리
    const XS = [130, 240, 350, 460, 570, 680, 820], VAL = ['0', '0.05', '0.1', '0.25', '0.5', '1.0', '+Inf'];
    if (k === 4) { snippet(130, 40, ['latency = Histogram(', '    "http_request_duration_seconds", …,', '    buckets=(0.05, 0.1, 0.25, 0.5, 1.0),', ')'], { op: fade(u, 0.1) });
      el('line', { x1: 110, y1: 290, x2: 860, y2: 290, stroke: MUT, 'stroke-width': 2 });
      XS.forEach((x, i) => { const at = i === 0 ? 0.2 : i === 6 ? 2.0 : 0.5 + i * 0.22, s = pop(u, at), col = i === 6 ? WARN : INFO;
        if (s <= 0) return; el('line', { x1: x, y1: 290 - 30 * s, x2: x, y2: 290, stroke: col, 'stroke-width': 3 });
        mono(x, 322, VAL[i], { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: i === 0 ? MUT : col }); });
      tx(820, 360, '+Inf는 SDK가 자동으로 붙인다', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.2) });
      sub(380, 385, '경계를 나중에 바꾸면 과거 데이터와 맞지 않는다', fade(u, 2.3)); return; }
    if (k === 5) { const hit = u > 1.3, vals = CUM.map((v, i) => v + (hit && i >= 3 ? 1 : 0));
      bars(120, 340, vals, { hi: (i) => hit && i >= 3, H: 230 });
      const bx = 120 + 3 * 68 + 25; el('circle', { cx: bx, cy: lerp(40, 100, E(u, 0.3, 1.3)), r: 10, fill: WARN, opacity: u < 1.4 ? 1 : 0 });
      mono(bx + 18, lerp(40, 100, E(u, 0.3, 1.3)) + 5, '0.3초', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: u < 1.4 ? fade(u, 0.3) : 0 });
      mono(720, 120, '예: 0.3초 걸린 요청 하나', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) });
      tx(720, 160, 'le ≥ 0.5인 bucket 전부 +1', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      mono(720, 200, '_sum   180.42 → 180.72', { 'font-size': 15, fill: INFO, opacity: fade(u, 1.9) });
      mono(720, 226, '_count 1000 → 1001', { 'font-size': 15, fill: INFO, opacity: fade(u, 2.1) }); return; }
    // k6 p95 = 1.0
    bars(110, 350, CUM, { hi: (i) => i === 4, H: 240 });
    const yR = 350 - 240 * 0.95, xEnd = 110 + 6 * 68;
    grow(90, yR, lerp(90, xEnd, 1), yR, E(u, 0.3, 1.0), BAD, { plain: true, dash: '6 5' });
    mono(96, yR - 12, '950 = 1000 × 0.95', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) });
    const tl = ['950번째는 le="1.0" 구간 안', '0.5 + (1.0−0.5) × (950−810)/(950−810)', '= 1.0초'];
    tl.forEach((s, i) => (i === 1 ? mono : tx)(600, 90 + i * 30, s, { 'font-size': i === 2 ? 20 : 14.5, 'font-weight': i === 1 ? 400 : 800, fill: i === 2 ? ACC : INK, opacity: fade(u, 1.2 + i * 0.4) }));
    pill(740, 200, 'sum by (le)로 instance 합산', INFO, pop(u, 2.2), { fs: 14 }); }

  // ───────── 4. Summary ─────────
  const EXPO_S = ['# TYPE rpc_duration_seconds summary', 'rpc_duration_seconds{quantile="0.5"} 0.012', 'rpc_duration_seconds{quantile="0.9"} 0.041',
    'rpc_duration_seconds{quantile="0.99"} 0.118', 'rpc_duration_seconds_sum 348.5', 'rpc_duration_seconds_count 25431'];
  const QS = [['p50', 0.012], ['p90', 0.041], ['p99', 0.118]];
  function latAxis(y, u0, u) { const X = (v) => 110 + v / 0.13 * 760;
    el('line', { x1: 110, y1: y, x2: 870, y2: y, stroke: MUT, 'stroke-width': 2 });
    [0, 0.05, 0.1].forEach((v) => mono(X(v), y + 24, v + 's', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }));
    return X; }

  function s4(t, c) { const { k, u } = c;
    if (k === 0) { card(200, 140, 260, 120, { rx: 12, stroke: ACC, sw: 2.2, s: pop(u, 0.2) }); lbl(200, 110, '앱 + client SDK', fade(u, 0.3));
      mono(200, 146, 'p50 · p90 · p99', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.7) });
      sub(200, 176, '여기서 계산을 끝낸다', fade(u, 0.9));
      server(760, 140, 'Prometheus', {});
      grow(340, 140, 690, 140, E(u, 1.1, 1.8), ACC); fly(340, 120, 690, 120, seg(u, 1.2, 2.0), 'quantile 값', { mono: false });
      el('line', { x1: 80, y1: 268, x2: 880, y2: 268, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5', opacity: fade(u, 2.0) });
      tx(480, 310, 'Histogram은 bucket 개수만 보내고 Prometheus가 계산한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k <= 3) { expo(20, 24, 470, EXPO_S, k === 1 ? E(u, 0.2, 0.8) : k === 2 ? 1 + 3 * E(u, 0.2, 1.0) : 4 + 2 * E(u, 0.2, 0.8),
        { hi: (i) => (k === 1 && i === 0) || (k === 2 && i >= 1 && i <= 3) || (k === 3 && i >= 4), h: 190 });
      if (k === 1) { card(720, 110, 330, 60, { rx: 10, stroke: GRID, sw: 1.5, s: pop(u, 0.8), text: '_bucket{le=…} 줄', fs: 15, color: OFF });
        if (u > 1.2) cross(905, 110, 11); pill(720, 190, 'quantile="…" 줄이 온다', WARN, pop(u, 1.6), { fs: 15 }); return; }
      const X = latAxis(330);
      QS.forEach(([nm, v], i) => { const d = k === 2 ? 0.8 + i * 0.4 : -1, s = k === 2 ? E(u, d, d + 0.4) : 1; if (s <= 0) return;
        el('line', { x1: X(v), y1: 330, x2: X(v), y2: 330 - 70 * s, stroke: WARN, 'stroke-width': 3 });
        mono(X(v), 250 - (i === 0 ? 0 : 0), `${nm} ${Math.round(v * 1000)}ms`, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: s }); });
      if (k === 3) { const av = 348.5 / 25431; el('circle', { cx: X(av), cy: 330, r: 8 * pop(u, 1.2), fill: INFO });
        mono(X(av) + 4, 372, '평균 ≈ 0.0137s', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4) });
        mono(720, 230, '348.5 ÷ 25431', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8) }); }
      return; }
    if (k === 4) { snippet(30, 50, ['rpc_latency = Summary(', '    "rpc_duration_seconds",', '    "RPC latency",', ')'], { op: fade(u, 0.1) });
      grow(400, 110, 500, 110, E(u, 0.6, 1.0), MUT);
      expo(520, 40, 420, ['rpc_duration_seconds{quantile="0.99"} …', 'rpc_duration_seconds_count 1.0', 'rpc_duration_seconds_sum 0.012'], E(u, 0.8, 1.6) * 3,
        { strike: (i) => i === 0, title: 'Python이 실제로 내는 줄', h: 120 });
      if (u > 1.6) cross(910, 86, 10);
      tx(480, 260, '파이썬 Summary는 _sum과 _count만 낸다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(480, 290, 'quantile 줄은 Go·Java SDK에서 목표 quantile을 지정할 때 나온다', fade(u, 2.1), { 'font-size': 14.5 });
      sub(480, 400, '(오른쪽 값은 prometheus_client 0.26에서 0.012초 하나를 넣은 실제 출력)', fade(u, 2.3)); return; }
    if (k === 5) { snippet(40, 70, ['@rpc_latency.time()', 'def call_rpc(payload):', '    ...'], { op: 1 });
      for (let i = 0; i < 3; i++) { const a = 0.3 + i * 0.6; fly(330, 110, 640, 110 + (i % 2) * 70, seg(u, a, a + 0.6), 'call_rpc()', { mono: true }); }
      card(720, 110, 210, 54, { rx: 10, stroke: INFO, sw: 2, text: '_count  +1', fs: 16, mono: true });
      card(720, 180, 210, 54, { rx: 10, stroke: INFO, sw: 2, text: '_sum  + 걸린 시간', fs: 15 });
      sub(480, 300, 'quantile을 내는 SDK는 최근 구간 관측값으로 다시 계산한다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 6) { // 예시: A 100건 모두 10ms, B 90건 10ms + 10건 500ms
      const X = (ms) => 150 + ms / 520 * 700;
      [['instance A', 100, 0, 100], ['instance B', 90, 10, 210]].forEach(([nm, n10, n500, y], i) => { const s = E(u, 0.2 + i * 0.4, 0.8 + i * 0.4);
        lbl(70, y + 6, nm, s, { 'font-size': 14.5 });
        for (let j = 0; j < Math.round(n10 * s / 10); j++) el('circle', { cx: X(10) + (j % 5) * 7, cy: y - 12 + Math.floor(j / 5) * 12, r: 4, fill: INFO, opacity: 0.8 });
        for (let j = 0; j < Math.round(n500 * s / 10); j++) el('circle', { cx: X(500), cy: y - 12, r: 4, fill: BAD });
        mono(880, y + 6, `p99 ${i ? 500 : 10}ms`, { 'font-size': 15, 'font-weight': 800, fill: i ? BAD : INFO, 'text-anchor': 'end', opacity: fade(u, 0.7 + i * 0.4) }); });
      sub(480, 52, '점 하나 = 요청 10건 (예시)', fade(u, 0.2));
      tx(300, 300, 'avg(p99) = (10 + 500) / 2 = 255ms', { 'font-size': 16, 'font-weight': 700, fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 1.4), 'text-anchor': 'middle' });
      tx(720, 300, '200건 전체의 p99 = 500ms', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9), 'text-anchor': 'middle' });
      sub(480, 350, '이미 계산된 quantile은 평균으로 합칠 수 없다', fade(u, 2.3), { 'font-size': 15 }); return; }
    // k7 비교표
    const rows = [['Counter', '오르기만', 'rate()', '합산 O'], ['Gauge', '오르내림', '그대로', '합산 O'], ['Histogram', 'bucket 누적', 'histogram_quantile', '합산 O'], ['Summary', 'quantile 완성값', '그대로', 'quantile 합산 X']];
    ['타입', '값', '조회', 'instance 합치기'].forEach((h, j) => tx(110 + [0, 170, 360, 600][j], 70, h, { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.1) }));
    rows.forEach((r, i) => { const y = 120 + i * 62, s = E(u, 0.3 + i * 0.35, 0.8 + i * 0.35), last = i === 3;
      el('rect', { x: 90, y: y - 28, width: 780 * s, height: 48, rx: 8, fill: i === 2 ? ACCBG : last ? C.BADBG : SOFT });
      if (s < 0.7) return;
      r.forEach((v, j) => (j === 2 ? mono : tx)(110 + [0, 170, 360, 600][j], y + 2, v, { 'font-size': 15, 'font-weight': j === 0 ? 800 : 600, fill: j === 3 ? (last ? BAD : GOOD) : INK })); });
    tx(480, 390, '새로 만들면 Histogram부터', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: 'Counter인 http_requests_total을 그래프로 볼 때 보통 쓰는 것은 무엇인가?',
      o: ['값을 그대로 그린다', 'rate()로 초당 증가율을 본다', 'avg_over_time()으로 평균을 낸다'], a: 1,
      why: '누적값 1027은 프로세스가 뜬 뒤 전부를 센 것이라 그 자체로는 뜻이 적다. 5분 창의 기울기를 rate()로 본다.' },
    { q: '큐 길이 queue_depth를 Counter가 아니라 Gauge로 만드는 이유는 무엇인가?',
      o: ['값이 내려가기도 하기 때문이다', 'label을 붙일 수 없어서다', '숫자가 커서 Counter에 안 들어가서다'], a: 0,
      why: '메일을 보내면 대기 47건이 줄어든다. Counter에는 dec()가 없으므로 오르내리는 값은 Gauge가 맞다.' },
    { q: 'http_request_duration_seconds_bucket{le="0.5"} 810의 뜻은 무엇인가?',
      o: ['0.25초에서 0.5초 사이 응답이 810번', '0.5초보다 오래 걸린 응답이 810번', '0.5초 이하 응답이 810번'], a: 2,
      why: 'bucket은 누적 개수다. le="0.5"는 그보다 작은 구간까지 모두 포함한 0.5초 이하 개수다.' },
    { q: 'instance 여러 대의 Summary quantile을 avg()로 합치면 안 되는 이유는 무엇인가?',
      o: ['quantile 값은 이미 계산된 결과라 평균이 전체 분포의 quantile이 아니다', 'Summary에는 _count가 없어서다', 'avg()가 label을 지우기 때문이다'], a: 0,
      why: '예시에서 p99 10ms와 500ms를 평균하면 255ms지만 200건 전체의 p99는 500ms다. Histogram은 bucket 개수를 더한 뒤 계산하므로 이 문제가 없다.' },
  ];

  const summary = [
    'Counter는 오르기만 하고 재시작하면 0이 된다. rate()가 리셋을 이어 붙여 기울기를 본다.',
    'Gauge는 메모리나 큐 길이처럼 오르내리는 지금 값이고 그대로 조회한다.',
    'Histogram은 le 경계마다 누적 개수를 내고, 이 데이터에서 p95는 보간으로 1.0초가 나온다.',
    'Summary는 client가 quantile을 계산해 보내서 instance끼리 합칠 수 없다.',
  ];
  const review = [
    { q: '서버 3대의 p95 응답시간을 한 줄로 보고 싶다. 어느 메트릭을 골라야 하나?',
      o: ['Summary의 quantile="0.95"를 avg()로 합친다', 'Histogram bucket을 sum by (le)로 더한 뒤 histogram_quantile을 쓴다', 'Gauge에 서버마다 p95를 set()해 둔다'], a: 1,
      why: 'bucket은 개수라 대수를 더해도 뜻이 유지된다. 완성된 quantile은 평균내면 전체 분포의 p95가 아니다.' },
    { q: '배포 뒤 http_requests_total 그래프가 0 근처로 뚝 떨어졌다. rate() 그래프는 어떻게 보일까?',
      o: ['음수로 크게 떨어진다', '0이 되어 한동안 비어 있다', '떨어진 곳을 재시작으로 보고 증가율이 끊기지 않는다'], a: 2,
      why: 'rate()와 increase()는 값이 줄어든 지점을 리셋으로 보고 앞 값을 더한다. 예시의 1030에서 5로 떨어진 구간도 +5로 센다.' },
    { q: '응답시간 Histogram의 p99가 늘 가장 큰 유한 경계값 1.0초로만 나온다. 먼저 의심할 것은?',
      o: ['bucket 경계가 너무 낮아 느린 요청이 모두 +Inf 구간에 들어간다', 'Counter를 Gauge로 잘못 만들었다', 'scrape 주기가 너무 길다'], a: 0,
      why: '950번째 이후가 +Inf 구간에 있으면 histogram_quantile은 그 앞 경계를 돌려준다. SLO 근처까지 경계를 미리 정해야 한다.' },
  ];

  R.page({ title: 'Metric Type 4종', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
