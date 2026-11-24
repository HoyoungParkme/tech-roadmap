/* I-1-2 Scrape — Prometheus 가 /metrics 를 당겨 가는 방식, 장면 4개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, axes, line, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  function expoParts(s) {
    if (s.startsWith('#')) { const m = s.match(/^(# (?:HELP|TYPE) )(\S+)(.*)$/);
      return m ? [[m[1], { fill: MUT }], [m[2], { fill: INK, 'font-weight': 700 }], [m[3], { fill: m[1].includes('TYPE') ? WARN : MUT, 'font-weight': m[1].includes('TYPE') ? 700 : 400 }]] : [[s, { fill: MUT }]]; }
    if (/^(HTTP|Content-Type)/.test(s)) return [[s, { fill: INFO, 'font-weight': 700 }]];
    const m = s.match(/^([A-Za-z_:][\w:]*)(\{[^}]*\})?(\s+.*)?$/);
    if (!m) return [[s, { fill: INK }]];
    return [[m[1], { fill: INK, 'font-weight': 700 }], [m[2] || '', { fill: INFO }], [m[3] || '', { fill: ACC, 'font-weight': 700 }]];
  }
  function expo(x, y, w, lines, shown, o) { o = o || {}; const fs = o.fs || 13.5, lh = o.lh || 24, h = o.h || lines.length * lh + 46;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 21, o.title || 'GET /metrics', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    lines.forEach((s, i) => { const v = clamp(shown - i); if (v <= 0) return; const yy = y + 46 + i * lh;
      if (o.hi && o.hi(i)) el('rect', { x: x + 6, y: yy - lh + 7, width: w - 12, height: lh, rx: 5, fill: ACCBG });
      spans(x + 14, yy, expoParts(v >= 1 ? s : s.slice(0, Math.ceil(s.length * v))), { 'font-size': fs }); }); }
  // 시간축 위 scrape 눈금: x0~x1 이 0~T 초, every 초마다, u 만큼 차례로
  function lane(x0, x1, y, T, every, f, col, name) { const X = (s) => x0 + (x1 - x0) * s / T;
    el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 2 });
    if (name) mono(x0 - 12, y + 5, name, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: col });
    const n = Math.floor(T / every); for (let i = 0; i <= n; i++) { const s = clamp(f * (n + 1) - i); if (s <= 0) continue;
      el('circle', { cx: X(i * every), cy: y, r: 7 * s, fill: col }); }
    return X; }
  function ticks(x0, x1, y, T, vals) { const X = (s) => x0 + (x1 - x0) * s / T; vals.forEach((v) => mono(X(v), y, v + 's', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT })); }

  // ───────── 1. scrape_interval ─────────
  function s1(t, c) { const { k, u } = c;
    if (k <= 3) { server(100, 110, 'Prometheus', { lamp: ACC });
      if (k === 0) { [['scrape_interval', '15s'], ['scrape_timeout', '10s'], ['evaluation_interval', '15s']].forEach(([a, b], i) => {
          const s = pop(u, 0.2 + i * 0.35); card(330 + i * 220, 90, 200, 58, { rx: 10, stroke: i === 0 ? ACC : GRID, sw: 2, s, text: a + '\n' + b, fs: 14, mono: true }); });
        sub(550, 150, 'global — 안 적으면 1m · 10s · 1m', fade(u, 1.4), { 'font-size': 14.5 }); }
      if (k >= 2) { server(820, 110, 'api:9090', { lamp: GOOD, s: k === 2 ? pop(u, 0.2) : 1 });
        el('line', { x1: 160, y1: 110, x2: 760, y2: 110, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': '6 6' });
        if (k === 2) { dot([[160, 100], [760, 100]], seg(u, 0.6, 1.4), ACC, 7); fly(300, 80, 620, 80, seg(u, 0.6, 1.4), 'GET /metrics', { mono: true });
          dot([[760, 122], [160, 122]], seg(u, 1.5, 2.3), INK, 7);
          tx(460, 160, 'Prometheus가 당겨 간다 (pull)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); } }
      if (k === 3) { server(620, 190, 'batch:9090', { lamp: GOOD, s: pop(u, 0.2) }); el('line', { x1: 160, y1: 130, x2: 560, y2: 190, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6' }); }
      // 시간축: 0~60초
      const x0 = 210, x1 = 880, T = 60;
      ticks(x0, x1, 400, T, [0, 15, 30, 45, 60]);
      lane(x0, x1, 260 + (k === 3 ? 40 : 0), T, 15, k === 0 ? E(u, 1.0, 2.4) : 1, k === 0 ? ACC : OFF, '기본 15s');
      if (k >= 1) lane(x0, x1, 310 + (k === 3 ? 30 : 0), T, 10, k === 1 ? E(u, 0.3, 1.8) : 1, ACC, 'api 10s');
      if (k === 1) tx(545, 230, 'job 안에 다시 쓰면 그 job만 덮어쓴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      if (k === 3) lane(x0, x1, 370, T, 60, E(u, 0.4, 1.4), WARN, 'batch 60s');
      return; }
    if (k === 4) { // 로그 눈금 위 권장 구간
      const X = (s) => 120 + Math.log10(s / 5) / Math.log10(600 / 5) * 720;
      el('line', { x1: 120, y1: 280, x2: 840, y2: 280, stroke: MUT, 'stroke-width': 2 });
      [[5, '5s'], [10, '10s'], [15, '15s'], [30, '30s'], [60, '1m'], [300, '5m'], [600, '10m']].forEach(([v, s]) => { el('line', { x1: X(v), y1: 274, x2: X(v), y2: 286, stroke: MUT });
        mono(X(v), 308, s, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); });
      [[10, 15, '핵심 API · K8s', ACC], [30, 60, 'DB stats · GC', INFO], [60, 300, '외부 probe', WARN]].forEach(([a, b, nm, col], i) => {
        const s = E(u, 0.3 + i * 0.5, 0.9 + i * 0.5), y = 200 - i * 56;
        el('rect', { x: X(a), y, width: (X(b) - X(a)) * s, height: 30, rx: 6, fill: col, opacity: 0.85 });
        tx(X(a), y - 8, nm, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.5) }); });
      sub(480, 360, '자주 봐야 하는 것일수록 짧게', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k5 저장량
    lbl(480, 46, '1분 동안 시계열 하나에 쌓이는 점', fade(u, 0.1));
    [['15s', 15, 4, 5760, ACC], ['60s', 60, 1, 1440, WARN]].forEach(([nm, iv, n, day, col], i) => { const y = 120 + i * 110, f = E(u, 0.3 + i * 0.5, 1.1 + i * 0.5);
      mono(150, y + 5, nm, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'end' });
      el('line', { x1: 180, y1: y, x2: 540, y2: y, stroke: GRID, 'stroke-width': 2 });
      for (let j = 0; j < n; j++) if (f * n > j) el('circle', { cx: 180 + (j + 1) * 360 / 4, cy: y, r: 8, fill: col });
      el('rect', { x: 600, y: y - 14, width: 300 * day / 5760 * E(u, 1.3 + i * 0.3, 2.0 + i * 0.3), height: 28, rx: 5, fill: col, opacity: 0.85 });
      mono(600, y + 40, `하루 ${day.toLocaleString('en-US')}개`, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.6 + i * 0.3) }); });
    tx(480, 380, '주기 4배 → 점 1/4 · 해상도와 저장량의 맞교환', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); }

  // ───────── 2. scrape_timeout ─────────
  function cycle(T, marks) { const x0 = 120, x1 = 860, X = (s) => x0 + (x1 - x0) * s / T;
    el('line', { x1: x0, y1: 250, x2: x1, y2: 250, stroke: MUT, 'stroke-width': 2 }); marks.forEach((v) => { el('line', { x1: X(v), y1: 244, x2: X(v), y2: 256, stroke: MUT });
      mono(X(v), 278, 't=' + v + 's', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); });
    return X; }
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { const X = cycle(15, [0, 10, 15]);
      el('rect', { x: X(0), y: 200, width: (X(10) - X(0)) * (k === 0 ? E(u, 0.4, 1.4) : 1), height: 40, rx: 6, fill: WARN, opacity: 0.2 });
      mono(X(5), 225, 'scrape_timeout 10s', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: k === 0 ? fade(u, 1.2) : 1 });
      el('circle', { cx: X(0), cy: 250, r: 9, fill: ACC }); el('circle', { cx: X(15), cy: 250, r: 9 * (k === 0 ? pop(u, 1.8) : 1), fill: ACC });
      mono(X(0), 320, 'GET 시작', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, opacity: k === 0 ? fade(u, 0.2) : 1 });
      mono(X(15), 320, '다음 scrape', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, opacity: k === 0 ? fade(u, 1.9) : 1 });
      if (k === 1) { const p = E(u, 0.2, 1.6) * 12; el('rect', { x: X(0), y: 160, width: X(Math.min(p, 10)) - X(0), height: 22, rx: 5, fill: INFO, opacity: 0.7 });
        mono(X(0), 150, '응답 기다리는 중…', { 'font-size': 14, fill: INFO });
        if (u > 1.4) { cross(X(10), 171, 13); expo(560, 30, 300, ['http_requests_total{…} 1027', 'process_resident_memory…'], 2, { title: '받다 만 응답', h: 96 });
          el('line', { x1: 575, y1: 70, x2: 845, y2: 115, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.6) });
          pill(330, 360, 'up = 0', BAD, pop(u, 1.9), { mono: true, fs: 16 }); tx(600, 366, '이 cycle 전체를 버린다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) }); } }
      return; }
    if (k === 2) { const X = (s) => 160 + s * 30;
      [['interval 15s', 15, GRID, 110], ['timeout 10s', 10, WARN, 160]].forEach(([nm, v, col, y], i) => {
        el('rect', { x: X(0), y, width: (X(v) - X(0)) * E(u, 0.2 + i * 0.4, 0.8 + i * 0.4), height: 30, rx: 6, fill: col, opacity: 0.6 });
        mono(X(v) + 12, y + 21, nm, { 'font-size': 15, 'font-weight': 700, fill: i ? WARN : INK, opacity: fade(u, 0.5 + i * 0.4) }); });
      check(900, 140, 14, pop(u, 1.1));
      el('rect', { x: X(0), y: 250, width: (X(20) - X(0)) * E(u, 1.5, 2.1), height: 30, rx: 6, fill: BAD, opacity: 0.5 });
      el('line', { x1: X(15), y1: 100, x2: X(15), y2: 300, stroke: MUT, 'stroke-dasharray': '4 4', 'stroke-width': 1.5 });
      mono(X(20) + 12, 271, 'timeout 20s', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      cross(905, 265, 13, pop(u, 2.1)); tx(480, 350, '넘으면 설정 오류 · 같아도 되지만 여유 있게 작게', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k <= 4) { const X = cycle(60, [0, 15, 30, 45, 60]);
      el('rect', { x: X(0), y: 200, width: (X(45) - X(0)) * (k === 3 ? E(u, 0.4, 1.5) : 1), height: 40, rx: 6, fill: WARN, opacity: 0.2 });
      mono(X(22.5), 225, 'timeout 45s', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN });
      el('circle', { cx: X(0), cy: 250, r: 9, fill: ACC }); el('circle', { cx: X(60), cy: 250, r: 9, fill: ACC });
      mono(480, 120, 'slow-cron-exporter · interval 60s', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.2) : 1 });
      if (k === 4) { server(480, 340, 'cron:9090', { s: pop(u, 0.2), lamp: WARN }); el('rect', { x: X(0), y: 170, width: (X(45) - X(0)) * E(u, 0.6, 2.4), height: 18, rx: 5, fill: INFO, opacity: 0.6 });
        mono(X(0), 160, '45초까지 기다려 준다', { 'font-size': 14, fill: INFO, opacity: fade(u, 0.6) }); }
      else sub(480, 330, '느린 대상은 interval과 timeout을 함께 늘린다', fade(u, 1.7), { 'font-size': 15 });
      return; }
    if (k === 5) { const xs = [0, 1, 2, 3, 4, 5].map((i) => 200 + i * 120), ok = [1, 1, 1, 0, 1, 1];
      lbl(480, 40, 'cron:9090 의 scrape 6번 (4번째 실패)', fade(u, 0.1));
      [['대상 시계열', 100], ['up', 190], ['scrape_duration_seconds', 280]].forEach(([nm, y], r) => {
        mono(180, y + 5, nm, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: r === 0 ? INK : INFO });
        xs.forEach((x, i) => { const s = clamp(E(u, 0.2 + r * 0.5, 1.0 + r * 0.5) * 6 - i); if (s <= 0) return;
          if (r === 0) { if (ok[i]) el('circle', { cx: x, cy: y, r: 8 * s, fill: INK }); else { el('rect', { x: x - 40, y: y - 18, width: 80, height: 36, rx: 6, fill: C.BADBG, opacity: s }); mono(x, y + 5, '없음', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700 }); } }
          else if (r === 1) mono(x, y + 6, String(ok[i]), { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ok[i] ? GOOD : BAD, opacity: s });
          else el('circle', { cx: x, cy: y, r: 7 * s, fill: ok[i] ? INFO : WARN }); }); });
      tx(560, 360, '실패해도 up=0과 걸린 시간은 남고, 대상 시계열에만 구멍이 생긴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k6 임박한 실패: 예시 소요시간
    const ax = axes(110, 60, 520, 280, { x: [0, 6], y: [0, 10], yt: [0, 7, 10], yl: 'scrape_duration_seconds (예시)', xl: 'scrape →' });
    el('line', { x1: ax.X(0), y1: ax.Y(10), x2: ax.X(6), y2: ax.Y(10), stroke: BAD, 'stroke-width': 2 });
    grow(ax.X(0), ax.Y(7), ax.X(6), ax.Y(7), E(u, 0.2, 0.8), WARN, { plain: true, dash: '7 5', sw: 2.5 });
    [2, 3, 4.5, 6, 7.5].forEach((v, i) => { const s = E(u, 0.6 + i * 0.3, 1.0 + i * 0.3), x = ax.X(i + 0.6);
      el('rect', { x: x - 24, y: ax.Y(v * s), width: 48, height: ax.Y(0) - ax.Y(v * s), rx: 4, fill: v > 7 ? WARN : INFO, opacity: 0.8 }); });
    mono(660, ax.Y(10) + 5, 'timeout 10s', { 'font-size': 15, 'font-weight': 700, fill: BAD });
    mono(660, ax.Y(7) + 5, '0.7 × 10s = 7s', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) });
    card(790, 290, 250, 62, { rx: 12, stroke: WARN, sw: 2.2, s: pop(u, 2.1), text: '여기서 알람\n실패 전에 미리 안다', fs: 15 }); }

  // ───────── 3. expose 포맷 ─────────
  const BODY = ['HTTP/1.1 200 OK', 'Content-Type: text/plain; version=0.0.4', '# HELP http_requests_total Total HTTP requests', '# TYPE http_requests_total counter',
    'http_requests_total{method="GET",status="200"} 1027', 'http_requests_total{method="POST",status="200"} 412', 'http_requests_total{method="POST",status="500"} 3',
    '# TYPE process_resident_memory_bytes gauge', 'process_resident_memory_bytes 1.34217728e+08'];
  function store(rows, f, o) { o = o || {}; zone(530, 24, 410, 372, o.title || 'Prometheus 저장소 — 시계열 키');
    rows.forEach((r, i) => { const s = typeof f === 'function' ? f(i) : f; if (s <= 0) return; const y = 54 + i * 62;
      el('rect', { x: 544, y, width: 382 * clamp(s), height: 52, rx: 7, fill: r.hot ? ACCBG : PANEL, stroke: r.hot ? ACC : GRID, 'stroke-width': 1.6 });
      if (s < 0.6) return; spans(556, y + 21, r.a, { 'font-size': 13.5 }); spans(556, y + 42, r.b, { 'font-size': 13.5 }); }); }
  const JI = [', job="api", instance="api:9090"', { fill: GOOD, 'font-weight': 700 }];
  function s3(t, c) { const { k, u } = c;
    const show = [2, 4, 7, 9, 9, 9, 9, 9][k], from = [0, 2, 4, 7, 9, 9, 9, 9][k];
    if (k <= 4) expo(16, 24, 500, BODY, from + (show - from) * E(u, 0.2, 1.4), { hi: (i) => i >= from && i < show, h: 270, title: 'api:9090 의 응답 본문' });
    if (k === 0) { server(735, 160, 'Prometheus', { lamp: ACC }); dot([[520, 60], [675, 140]], seg(u, 1.0, 1.8), ACC, 7);
      tx(735, 270, '특별한 프로토콜 없이 텍스트 한 덩어리', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { card(735, 140, 330, 84, { rx: 12, stroke: WARN, sw: 2, s: pop(u, 1.2), text: '메타데이터\n이름 http_requests_total · counter', fs: 14.5 });
      sub(735, 210, '값 줄을 읽기 전 설명과 타입', fade(u, 1.8)); return; }
    const ROWS = [
      { a: [['http_requests_total', { 'font-weight': 700 }], ['{method="GET",status="200"', { fill: INFO }]], b: [JI, ['} 1027', { fill: ACC, 'font-weight': 700 }]] },
      { a: [['http_requests_total', { 'font-weight': 700 }], ['{method="POST",status="200"', { fill: INFO }]], b: [JI, ['} 412', { fill: ACC, 'font-weight': 700 }]] },
      { a: [['http_requests_total', { 'font-weight': 700 }], ['{method="POST",status="500"', { fill: INFO }]], b: [JI, ['} 3', { fill: ACC, 'font-weight': 700 }]] },
      { a: [['process_resident_memory_bytes', { 'font-weight': 700 }]], b: [['{job="api", instance="api:9090"} ', { fill: GOOD, 'font-weight': 700 }], ['134217728', { fill: ACC, 'font-weight': 700 }]] },
    ];
    if (k === 2) { store(ROWS.slice(0, 3), (i) => E(u, 0.5 + i * 0.35, 0.9 + i * 0.35));
      sub(735, 300, '줄마다 시계열 하나 · job과 instance는 Prometheus가 붙인다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 3) { store(ROWS, (i) => (i < 3 ? 1 : E(u, 0.8, 1.3)));
      mono(735, 340, '1.34217728e+08 = 134217728', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      sub(735, 366, '지수 표기도 같은 값으로 읽는다', fade(u, 1.9)); return; }
    if (k === 4) { store(ROWS.concat([{ hot: true, a: [['up', { 'font-weight': 700 }]], b: [['{job="api", instance="api:9090"} ', { fill: GOOD, 'font-weight': 700 }], ['1', { fill: ACC, 'font-weight': 700 }]] }]), (i) => (i < 4 ? 1 : E(u, 1.3, 1.8)));
      tx(266, 330, '응답 어디에도 up 줄은 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) });
      pill(266, 370, 'GET 성공 → Prometheus가 up=1 기록', ACC, pop(u, 1.0), { fs: 14 }); return; }
    if (k === 5) { [['# HELP <이름> <설명>', MUT], ['# TYPE <이름> counter|gauge|histogram|summary', WARN], ['<이름>{라벨="값",…} <숫자> [타임스탬프]', ACC]].forEach(([s, col], i) => {
        const y = 100 + i * 90, sc = pop(u, 0.3 + i * 0.5); card(480, y, 760, 60, { rx: 10, stroke: col, sw: 2, s: sc }); if (sc > 0.6) mono(480, y + 6, s, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: col === MUT ? INK : col }); });
      sub(480, 390, '이 세 모양만 지키면 어떤 언어로 출력해도 된다 · 타임스탬프는 선택', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 6) { // 라벨 순서 무관 → 한 시계열 / user_id 를 넣으면 폭발
      mono(40, 70, 'x{method="GET",status="200"}', { 'font-size': 15, fill: INFO, opacity: fade(u, 0.2) });
      mono(40, 110, 'x{status="200",method="GET"}', { 'font-size': 15, fill: INFO, opacity: fade(u, 0.4) });
      grow(330, 66, 420, 86, E(u, 0.6, 1.0), MUT); grow(330, 106, 420, 90, E(u, 0.6, 1.0), MUT);
      card(500, 88, 140, 44, { rx: 8, stroke: ACC, sw: 2, s: pop(u, 1.0), text: '시계열 1개', fs: 15 });
      tx(40, 190, '+ user_id 라벨 (사용자 1만 명, 예시)', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      const f = E(u, 1.4, 2.5); for (let i = 0; i < 360; i++) { if (i / 360 > f) break; el('rect', { x: 40 + (i % 60) * 14.5, y: 210 + Math.floor(i / 60) * 14.5, width: 11, height: 11, rx: 2, fill: BAD, opacity: 0.75 }); }
      mono(480, 330 + 40, '3 × 10,000 = 30,000 시계열', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) }); return; }
    // k7 OpenMetrics
    [['text/plain; version=0.0.4', 'Prometheus 텍스트 포맷', INFO], ['application/openmetrics-text; version=1.0.0', 'OpenMetrics 표준', ACC]].forEach(([ct, nm, col], i) => {
      const y = 90 + i * 110, s = pop(u, 0.3 + i * 0.7); card(480, y, 760, 76, { rx: 12, stroke: col, sw: 2, s });
      if (s > 0.6) { mono(480, y - 6, 'Content-Type: ' + ct, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col }); sub(480, y + 20, nm, 1, { 'font-size': 14.5 }); } });
    tx(480, 340, '본문 생김새는 거의 같고 머리만 다르다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) }); }

  // ───────── 4. up 메트릭 ─────────
  const TG = [['api-1:9090', 1], ['api-2:9090', 1], ['api-3:9090', 0]];
  function upTable(x, y, o) { o = o || {}; TG.forEach(([n, v], i) => { const yy = y + i * 50, s = o.f ? o.f(i) : 1; if (s <= 0) return;
      const dim = o.keep && !o.keep(v), op = dim ? 0.25 : 1;
      el('rect', { x, y: yy, width: 380, height: 40, rx: 7, fill: !dim && o.keep ? C.BADBG : PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op * s });
      mono(x + 12, yy + 26, `up{instance="${n}"}`, { 'font-size': 14, fill: INFO, opacity: op * s });
      mono(x + 366, yy + 27, String(v), { 'font-size': 18, 'font-weight': 800, fill: v ? GOOD : BAD, 'text-anchor': 'end', opacity: op * s }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { server(90, 160, 'Prometheus', { lamp: ACC, s: 0.8 });
      TG.forEach(([n, v], i) => { const y = 70 + i * 100; server(860, y, null, { s: 0.55, lamp: v ? GOOD : BAD }); mono(860, y + 46, n, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
        if (k === 0) { dot([[140, 160], [800, y]], seg(u, 0.2 + i * 0.25, 0.9 + i * 0.25), ACC, 6); if (!v && u > 1.1) cross(790, y, 11); } });
      upTable(270, 100, { f: k === 0 ? (i) => E(u, 1.2 + i * 0.25, 1.5 + i * 0.25) : null, keep: k === 1 ? (v) => v === 0 : null });
      if (k === 0) sub(460, 280, 'DNS · 연결 · timeout · 4xx · 5xx 모두 0', fade(u, 2.0), { 'font-size': 14.5 });
      if (k === 1) pill(460, 290, 'up == 0  →  api-3 만 남는다', BAD, pop(u, 0.8), { mono: true, fs: 15 });
      if (k === 2) { mono(460, 300, 'avg by (job) (up) = (1 + 1 + 0) / 3', { 'text-anchor': 'middle', 'font-size': 15, fill: INK, opacity: fade(u, 0.4) });
        mono(460, 336, '≈ 0.67', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
        sub(460, 370, '살아 있는 비율 · 3대 중 1대 다운', fade(u, 1.7), { 'font-size': 14.5 }); }
      return; }
    if (k === 3) { // for: 5m — 예시 타임라인 (분)
      const X = (m) => 120 + m * 50, f = E(u, 0.2, 2.2);
      lbl(480, 40, 'api-3 의 up (예시, 1칸 = 1분)', fade(u, 0.1));
      const UP = [1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1];
      UP.forEach((v, m) => { if (m / UP.length > f) return; el('rect', { x: X(m), y: v ? 90 : 130, width: 46, height: 30, rx: 4, fill: v ? GOOD : BAD, opacity: 0.75 }); });
      mono(110, 110, '1', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); mono(110, 150, '0', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      // 상태
      const st = (m) => (m === 2 ? 'P' : m >= 6 && m < 11 ? 'P' : m >= 11 && m < 14 ? 'F' : '');
      UP.forEach((_, m) => { if (m / UP.length > f) return; const s = st(m); if (!s) return;
        el('rect', { x: X(m), y: 200, width: 46, height: 30, rx: 4, fill: s === 'F' ? BAD : WARN, opacity: s === 'F' ? 0.9 : 0.45 }); });
      mono(110, 221, '알람', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      tx(X(2) + 23, 262, '재배포 1분', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      tx(X(8.5), 262, 'pending 5분', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      tx(X(12.5), 262, 'firing', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      tx(480, 340, 'for: 5m → 5분 내내 0일 때만 알람', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { ['up', 'scrape_duration_seconds', 'scrape_samples_scraped', 'scrape_samples_post_metric_relabeling', 'scrape_series_added'].forEach((n, i) => {
        const y = 60 + i * 60, s = E(u, 0.2 + i * 0.3, 0.6 + i * 0.3); el('rect', { x: 200, y, width: 560 * s, height: 44, rx: 8, fill: i ? INFOBG() : ACCBG });
        if (s > 0.6) mono(220, y + 28, n + '{job, instance}', { 'font-size': 15, 'font-weight': 700, fill: i ? INFO : ACC }); });
      sub(480, 385, 'scrape 한 번마다 Prometheus가 직접 남기는 다섯 줄', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 5) { const ax = axes(160, 60, 600, 260, { x: [0, 4], y: [0, 1], yl: 'scrape_duration_seconds (예시)' });
      [['api-1', 0.2], ['api-2', 0.25], ['api-3', 0.8], ['db-1', 0.35]].forEach(([n, v], i) => { const s = E(u, 0.2 + i * 0.25, 0.8 + i * 0.25), x = ax.X(i + 0.5), hot = v > 0.5;
        el('rect', { x: x - 34, y: ax.Y(v * s), width: 68, height: ax.Y(0) - ax.Y(v * s), rx: 5, fill: hot ? WARN : INFO, opacity: 0.8 });
        mono(x, ax.Y(0) + 22, n, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); });
      grow(ax.X(0), ax.Y(0.5), ax.X(4), ax.Y(0.5), E(u, 1.2, 1.8), BAD, { plain: true, dash: '6 5' });
      mono(ax.X(4) + 10, ax.Y(0.5) + 5, '> 0.5', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      sub(480, 395, '느려지는 대상은 곧 timeout으로 넘어간다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 6) { const ax = axes(110, 70, 480, 250, { x: [0, 12], y: [0, 10], xl: '시간 →', yl: 'sum_over_time(scrape_series_added[1h]) (예시)' });
      const P = [[0, 1], [2, 1.2], [4, 0.9], [6, 1.1], [7, 1.3], [8, 8.5], [9, 9.2], [10, 9], [12, 9.4]];
      line(ax, P, E(u, 0.2, 1.6), BAD, { sw: 3 });
      [['job="api" 폭증', BAD], ['job="db"', INK], ['job="node"', INK]].forEach(([s, col], i) => { const y = 130 + i * 50; card(790, y, 250, 40, { rx: 8, stroke: i ? GRID : BAD, sw: 1.8, s: pop(u, 1.4 + i * 0.25) }); mono(680, y + 5, `${i + 1}. ${s}`, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 1.5 + i * 0.25) }); });
      mono(790, 90, 'topk(10, …)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) });
      sub(480, 395, '새 시계열이 갑자기 많이 생기면 카디널리티 사고다', fade(u, 2.1), { 'font-size': 15 }); return; }
    // k7 알람 흐름
    snippet(30, 60, ['- alert: InstanceDown', '  expr: up == 0', '  for: 5m', '  labels: { severity: critical }'], { op: fade(u, 0.1) });
    server(480, 260, 'Prometheus 평가', { s: pop(u, 0.5), lamp: BAD });
    grow(420, 160, 470, 200, E(u, 0.6, 1.0), MUT);
    card(760, 260, 190, 64, { rx: 12, stroke: WARN, sw: 2.2, s: pop(u, 1.2), text: 'Alertmanager', fs: 16 });
    dot([[545, 260], [665, 260]], seg(u, 1.2, 1.8), BAD, 8); grow(545, 260, 662, 260, E(u, 1.2, 1.8), BAD);
    card(760, 120, 190, 54, { rx: 12, stroke: BAD, sw: 2, s: pop(u, 2.0), text: '알림 (severity: critical)', fs: 14 });
    grow(760, 225, 760, 150, E(u, 1.9, 2.3), BAD); }
  function INFOBG() { return C.INFOBG; }

  const quiz = [
    { q: 'global에 scrape_interval: 15s를 두고 api job에만 10s를 적었다. 주기를 적지 않은 새 job의 주기는 무엇인가?',
      o: ['10s', '15s', 'Prometheus 기본값 1m'], a: 1,
      why: 'job 안에 따로 적은 값만 전역값을 덮어쓴다. 아무것도 적지 않은 job은 global의 15s를 따르고, global마저 비면 1m이다.' },
    { q: 'scrape_timeout 10s 안에 응답이 끝나지 않으면 무슨 일이 생기는가?',
      o: ['받은 부분까지만 저장한다', '그 cycle은 실패로 보고 up=0을 기록한다', '다음 scrape까지 계속 기다린다'], a: 1,
      why: 'timeout을 넘긴 scrape는 받다 만 데이터를 버리고 실패가 된다. up=0과 걸린 시간은 남고 대상 시계열에는 구멍이 생긴다.' },
    { q: '/metrics 응답 본문에 up 줄이 없는데도 up 시계열이 생기는 이유는 무엇인가?',
      o: ['Prometheus가 scrape 결과를 보고 직접 기록하기 때문이다', 'client SDK가 몰래 넣기 때문이다', 'TYPE gauge 줄이 있으면 자동으로 생기기 때문이다'], a: 0,
      why: 'up은 대상이 내보내는 값이 아니라 Prometheus가 GET 성공이면 1, 실패면 0으로 남기는 시계열이다.' },
    { q: '재배포로 1분 동안 up=0이었는데 InstanceDown 알람이 오지 않았다. 이유는 무엇인가?',
      o: ['up은 1분 단위로만 기록돼서', 'Alertmanager가 꺼져 있어서', 'for: 5m이라 5분 내내 0이어야 발화하기 때문이다'], a: 2,
      why: 'for 조건이 채워지기 전에는 pending에 머문다. 1분짜리 깜빡임은 그 안에 회복되어 firing까지 가지 않는다.' },
  ];

  const summary = [
    'Prometheus가 정해진 주기마다 대상의 /metrics를 GET으로 당겨 간다. 전역 기본값은 1m이다.',
    'timeout을 넘긴 scrape는 버려지고 up=0이 남는다. timeout은 interval을 넘을 수 없다.',
    '응답은 이름{라벨} 값 꼴의 텍스트이고, 이름과 라벨 조합마다 시계열이 하나씩 생긴다.',
    'up과 scrape_duration_seconds는 Prometheus가 직접 기록해서 수집 자체를 감시할 수 있다.',
  ];
  const review = [
    { q: '그래프에 30초 간격으로 구멍이 났는데 up은 같은 시각에 0이다. 먼저 의심할 것은?',
      o: ['대상의 응답이 scrape_timeout을 넘겨 그 cycle이 버려졌다', '라벨 순서가 바뀌어 다른 시계열이 됐다', 'Counter가 재시작해 0이 됐다'], a: 0,
      why: '실패한 scrape는 받은 줄을 저장하지 않고 up=0만 남긴다. scrape_duration_seconds가 timeout에 가까워졌는지 함께 본다.' },
    { q: '개발자가 요청 라벨에 user_id를 넣은 뒤 Prometheus 메모리가 급히 늘었다. 이를 빨리 잡아 줄 쿼리는?',
      o: ['avg by (job) (up)', 'topk(10, sum_over_time(scrape_series_added[1h]))', 'scrape_duration_seconds > 0.5'], a: 1,
      why: '라벨 값이 늘면 시계열이 그만큼 새로 생긴다. scrape마다 새로 생긴 시계열 수를 한 시간 합해 큰 대상을 찾는다.' },
    { q: '하루 점 개수를 줄이려고 batch job의 주기를 15s에서 60s로 바꿨다. 시계열 하나당 하루 점은?',
      o: ['5760개 그대로', '2880개', '1440개'], a: 2,
      why: '86400초를 60초로 나누면 1440이다. 주기를 4배로 늘리면 점도 4분의 1로 준다.' },
  ];

  R.page({ title: 'Scrape — 당겨 가는 수집', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
