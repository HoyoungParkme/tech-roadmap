/* V-1-2 Federation — 계층 수집 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, INFO, INFOBG } = C;

  // 페이지 데이터(CHILDREN): DC 별 상세 시계열 수(예시 규모)와 상위로 올리는 집계 수
  const DC = [{ id: 'dc-a', region: 'APAC', detail: 512000, x: 170 }, { id: 'dc-b', region: 'EU', detail: 498000, x: 480 }, { id: 'dc-c', region: 'US', detail: 530000, x: 790 }];
  const TOTAL = 1540000, FED = 18, GY = 62, DY = 292;
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  const typed = (x, y, s, frac, a) => { const n = Math.round(s.length * clamp(frac)); if (n > 0) mono(x, y, s.slice(0, n), a); };

  function dcBox(d, o) { o = o || {}; const g = G(d.x, DY, o.s, o.op);
    el('rect', { x: -104, y: -38, width: 208, height: 76, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2.5 }, g);
    tx(-90, -12, `${d.id}-prometheus`, { 'font-size': 15, 'font-weight': 800, class: 'mono' }, g); tx(90, -12, d.region, { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'end' }, g);
    if (o.cnt != null) mono(-90, 22, fmt(o.cnt) + ' 시계열', { 'font-size': 14, fill: MUT }, g); return g; }
  function pods(d, op, hot) { for (let i = 0; i < 8; i++) { const x = d.x - 84 + i * 24; el('line', { x1: x, y1: DY + 38, x2: x, y2: 372, stroke: GRID, 'stroke-width': 1.5, opacity: op }); el('circle', { cx: x, cy: 380, r: 7, fill: hot ? BAD : OFF, opacity: op }); } }
  function globalBox(o) { o = o || {}; const g = G(480, GY, o.s, o.op), w = o.w || 250;
    el('rect', { x: -w / 2, y: -34, width: w, height: 68, rx: 10, fill: o.fill || ACCBG, stroke: o.stroke || ACC, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    tx(0, -6, o.name || 'global Prometheus', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: o.stroke || ACC }, g);
    if (o.sub) mono(0, 18, o.sub, { 'font-size': 13.5, 'text-anchor': 'middle', fill: o.subCol || INK, 'font-weight': 700 }, g); return g; }

  // ── 1. 단일 Prometheus 의 벽
  function s1(t, c) { const { k, u } = c;
    DC.forEach((d, i) => { const cnt = k === 0 ? lerp(0, d.detail, E(u, 0.3 + i * 0.2, 1.6 + i * 0.2)) : d.detail; dcBox(d, { s: k === 0 ? pop(u, 0.1 + i * 0.2) : 1, cnt }); pods(d, k === 0 ? fade(u, 0.8) : 1, k === 1); });
    sub(480, 412, 'DC마다 상세 지표를 로컬에서 수집 (규모는 예시)', k === 0 ? fade(u, 1.8) : 0.9);
    if (k === 0) { globalBox({ dash: '7 5', fill: PANEL, stroke: MUT, name: '글로벌 뷰 없음', s: pop(u, 1.6) }); return; }
    if (k === 1) { const g = E(u, 0.2, 1.2); globalBox({ fill: BADBG, stroke: BAD, name: '한 서버가 직접 긁으면', sub: fmt(lerp(0, TOTAL, E(u, 0.6, 2.0))) + ' 시계열', subCol: BAD });
      DC.forEach((d) => { for (let i = 0; i < 8; i += 2) { const x = d.x - 84 + i * 24; el('line', { x1: 480, y1: GY + 34, x2: lerp(480, x, g), y2: lerp(GY + 34, 372, g), stroke: BAD, 'stroke-width': 1.2, opacity: 0.55 }); } });
      el('rect', { x: 640, y: GY - 10, width: 160, height: 18, rx: 4, fill: SOFT }); el('rect', { x: 640, y: GY - 10, width: 160 * E(u, 0.6, 2.0), height: 18, rx: 4, fill: BAD });
      tx(640, GY - 18, '메모리', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); if (u > 2.1) mono(812, GY + 4, 'OOM', { 'font-size': 16, 'font-weight': 800, fill: BAD }); return; }
    if (k === 2) { globalBox({ name: '글로벌 대시보드', sub: '요약 몇 개면 충분', s: 1 });
      ['DC별 초당 요청수', 'DC별 에러율', 'DC별 p95 지연'].forEach((s, i) => pill(150 + i * 330, 164, s, ACC, pop(u, 0.3 + i * 0.3), { fs: 14 }));
      DC.forEach((d) => { const y = 232; el('line', { x1: d.x, y1: DY - 38, x2: d.x, y2: y, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 5', opacity: fade(u, 1.4) }); cross(d.x, y - 6, 9, pop(u, 1.5)); });
      sub(480, 214, 'per-pod 상세는 올리지 않는다', fade(u, 1.8), { 'font-weight': 700, fill: INK, x: 560, 'text-anchor': 'start' }); return; }
    // k3: /federate 로 당긴다, k4: 아직 job 이 없다
    globalBox({ sub: k === 4 ? 'role="global"' : null, s: 1 });
    DC.forEach((d, i) => { const g = k === 3 ? E(u, 0.2 + i * 0.2, 1.0 + i * 0.2) : 1, a = [480 + (i - 1) * 70, GY + 34], b = [d.x, DY - 38];
      el('line', { x1: a[0], y1: a[1], x2: lerp(a[0], b[0], g), y2: lerp(a[1], b[1], g), stroke: k === 4 ? OFF : ACC, 'stroke-width': 2.4, 'stroke-dasharray': k === 4 ? '5 6' : null });
      if (k === 3 && u > 1.2) dot([b, a], ((t * 0.6 + i * 0.3) % 1), ACC, 5.5);
      mono(lerp(a[0], b[0], 0.55) + (i === 1 ? 10 : 0), lerp(a[1], b[1], 0.55), '/federate', { 'font-size': 13.5, fill: k === 4 ? MUT : ACC, 'font-weight': 700, 'text-anchor': i === 0 ? 'end' : 'start', opacity: k === 3 ? fade(u, 1.0 + i * 0.2) : 1 }); });
    if (k === 4) { pill(760, GY, 'federate job 없음', MUT, pop(u, 0.8), { fs: 13.5 }); } }

  // ── 2. /federate 엔드포인트 — 평범한 스크랩
  function s2(t, c) { const { k, u } = c;
    DC.forEach((d) => dcBox(d, { cnt: d.detail }));
    globalBox({ name: 'job: "federate"', s: k === 0 ? pop(u, 0.2) : 1 });
    if (k === 0) { // 15초 vs 30초 눈금
      [['하위 15s', 15, INFO, 150], ['상위 30s', 30, ACC, 194]].forEach(([n, step, col, y], j) => { tx(250, y + 5, n, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'end' });
        el('line', { x1: 270, y1: y, x2: 690, y2: y, stroke: GRID, 'stroke-width': 1.5 });
        for (let s = 0; s <= 120; s += step) { const x = 270 + s * 3.5; el('circle', { cx: x, cy: y, r: 6, fill: col, opacity: fade(u, 0.5 + j * 0.6 + s / 200) }); } });
      sub(480, 236, '상위는 하위보다 느슨하게 당긴다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    // 내려가는 경로 3개
    const lines = DC.map((d, i) => [[480 + (i - 1) * 70, GY + 34], [d.x, DY - 38]]);
    const showAll = k >= 3, gAll = k === 3 ? E(u, 0.2, 1.0) : 1;
    lines.forEach(([a, b], i) => { if (!showAll && i !== 0) return; const g = showAll ? gAll : 1;
      el('line', { x1: a[0], y1: a[1], x2: lerp(a[0], b[0], g), y2: lerp(a[1], b[1], g), stroke: ACC, 'stroke-width': 2.4 }); });
    if (k === 1) { const sw = E(u, 0.8, 1.6); mono(160, 160, '/metrics', { 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: 1 - sw * 0.5, 'text-decoration': sw > 0.5 ? 'line-through' : null });
      mono(160, 190, '/federate', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: sw }); tx(160, 136, 'metrics_path', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      pill(720, GY, 'honor_labels: true (Step 4)', MUT, pop(u, 1.8), { mono: true, fs: 13.5 }); }
    if (k === 2) { const a = lines[0][0], b = lines[0][1];
      fly(a[0], a[1] + 10, b[0] + 40, b[1] - 20, seg(u, 0.2, 1.1), 'GET /federate?match[]=up', { mono: true, stay: u < 1.4 });
      fly(b[0] + 40, b[1] - 40, a[0] - 20, a[1] + 20, seg(u, 1.3, 2.1), 'up{…} 1', { mono: true, fill: INFO });
      card(760, 172, 260, 74, { rx: 10, stroke: BAD, sw: 2, dash: '5 4', s: pop(u, 1.8) }); tx(760, 166, 'match[] 없으면', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      mono(760, 190, '200 OK · 빈 응답', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, opacity: fade(u, 2.1) }); }
    if (k === 3) { DC.forEach((d, i) => mono(d.x, DY + 58, d.id + '-prometheus:9090', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.2) }));
      lines.forEach(([a, b], i) => { if (u > 1.0) dot([b, a], ((t * 0.55 + i * 0.33) % 1), ACC, 6); });
      sub(480, 412, '하위도 HTTP로 지표를 내놓는 평범한 타깃이다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }
    if (k === 4) { lines.forEach(([a, b], i) => dot([b, a], ((t * 0.55 + i * 0.33) % 1), ACC, 5));
      card(480, 164, 470, 110, { rx: 10, stroke: GRID, sw: 1.5, fill: PANEL });
      DC.forEach((d, i) => typed(262, 142 + i * 26, `up{job="api", …, tier="dc"}  ← ${d.id}`, seg(u, 0.3 + i * 0.4, 1.1 + i * 0.4), { 'font-size': 14, fill: INK }));
      pill(480, 238, 'tier="dc" = 상위가 붙인 출처 라벨', GOOD, pop(u, 1.9), { fs: 13.5 }); } }

  // ── 3. match[] — 집계된 소수만
  const RAW = ['pod-1', 'pod-2', 'pod-3', 'pod-4', 'pod-5', 'pod-6', 'pod-7', 'pod-8'];
  function s3(t, c) { const { k, u } = c;
    zone(24, 28, 450, 382, 'dc-a 하위 Prometheus', { fill: INFOBG, color: INFO }); zone(560, 28, 376, 382, 'global Prometheus', { fill: ACCBG, color: ACC });
    const flood = k === 3 ? E(u, 0.6, 2.0) : 0;
    RAW.forEach((p, i) => { const y = 72 + i * 28, x = 40 + flood * 540 * ((i % 3) + 1) / 3;
      mono(Math.min(x, 600), y, `http_requests_total{pod="${p}"}`, { 'font-size': 13.5, fill: k === 3 ? BAD : INK, opacity: k === 0 ? fade(u, 0.1 + i * 0.05) : (k === 3 ? 1 : 0.75) }); });
    // recording rule: 원시 8줄 → 집계 1줄
    const AY = 330, ag = k === 0 ? E(u, 0.8, 1.8) : 1;
    if (k !== 3) { const bh = lerp(62, 272, ag); el('path', { d: `M312,62 H324 V${bh}` + (ag > 0.95 ? ' H200' : ''), fill: 'none', stroke: INFO, 'stroke-width': 2.2 });
      if (ag > 0.95) { grow(200, 272, 200, AY - 18, k === 0 ? E(u, 1.8, 2.2) : 1, INFO, {}); mono(214, 300, 'sum by (job) (rate(…[5m]))', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 }); } }
    const aggTxt = 'job:http_requests:rate5m{job="api"}', extra = [['up', 360], ['node_memory_MemAvailable_bytes', 386]];
    const pass = k === 1 ? E(u, 0.9, 1.9) : k >= 2 ? 1 : 0;
    if (ag > 0.95 && k !== 3) mono(lerp(40, 580, pass), lerp(AY, 92, pass), aggTxt, { 'font-size': 14, 'font-weight': 800, fill: ACC });
    if (k !== 3) extra.forEach(([s, y], i) => { const pu = k === 2 ? E(u, 0.6 + i * 0.4, 1.4 + i * 0.4) : k > 2 ? 1 : 0;
      mono(lerp(40, 580, pu), lerp(y, 124 + i * 30, pu), s, { 'font-size': 14, 'font-weight': 700, fill: pu > 0 ? ACC : MUT, opacity: k < 2 ? 0.5 : 1 }); });
    // 체: match[] 정규식
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1, bad = k === 3; el('line', { x1: 517, y1: 40, x2: 517, y2: 400, stroke: bad ? BAD : ACC, 'stroke-width': 3, 'stroke-dasharray': '10 6', opacity: s });
      const lab = bad ? 'match[] = {__name__=~".+"}' : k >= 2 ? 'match[] = job:.* ∪ up ∪ node_memory…' : 'match[] = {__name__=~"job:.*"}';
      pill(lerp(520, 748, 1), 380, lab, bad ? BAD : ACC, s, { mono: true, fs: 13.5 }); }
    // 상위 시계열 수
    if (k >= 2) { const v = k === 3 ? lerp(FED, TOTAL, E(u, 0.8, 2.2)) : FED, hot = k === 3;
      mono(748, 250, fmt(v), { 'font-size': 30, 'font-weight': 800, fill: hot ? BAD : ACC, 'text-anchor': 'middle' }); sub(748, 276, hot ? '상위 시계열 (DC 3곳 전부 복제)' : '상위 시계열 (DC 3곳 × 6, 예시)', 1, { fill: hot ? BAD : MUT, 'font-weight': 700 });
      if (hot && u > 2.2) pill(748, 318, 'OOM', BAD, pop(u, 2.2), { fs: 15 }); }
    if (k === 4) { mono(250, 400 - 14, '512,000은 여기 남는다', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); } }

  // ── 4. honor_labels — 라벨 충돌
  const ROWS = ['job', 'instance', 'exported_job', 'exported_instance', 'region', 'tier'];
  const COLF = { job: ['"federate"', WARN], instance: ['"dc-a-prometheus:9090"', WARN], exported_job: ['"api"', MUT], exported_instance: ['"pod-7"', MUT], region: ['"apac"', GOOD], tier: ['"dc"', GOOD] };
  const COLT = { job: ['"api"', GOOD], instance: ['"pod-7"', GOOD], exported_job: ['없음', MUT], exported_instance: ['없음', MUT], region: ['"apac"', GOOD], tier: ['"dc"', GOOD] };
  function s4(t, c) { const { k, u } = c, x0 = 60, xf = 270, xt = 620, y0 = 64, rh = 36;
    // 하위가 내놓는 원본 시계열
    el('rect', { x: 100, y: 352, width: 760, height: 44, rx: 10, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: k === 0 ? fade(u, 0.1) : 1 });
    tx(116, 379, 'dc-a', { 'font-size': 14, 'font-weight': 800, fill: INFO });
    typed(170, 380, 'job:http_requests:rate5m{job="api", instance="pod-7"}  42.1', k === 0 ? seg(u, 0.2, 1.4) : 1, { 'font-size': 14.5, 'font-weight': 700, fill: INK });
    if (k === 0) { grow(480, 350, 480, 300, E(u, 1.6, 2.2), ACC, {}); sub(492, 324, '/federate로 올라간다', fade(u, 2.0), { 'text-anchor': 'start', 'font-weight': 700, fill: ACC }); return; }
    // 표 머리
    tx(x0, y0, '라벨', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(xf, y0, 'honor_labels: false (기본)', { 'font-size': 15, 'font-weight': 800, fill: WARN });
    if (k >= 2) tx(xt, y0, 'honor_labels: true', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: k === 2 ? fade(u, 0.2) : 1 });
    el('line', { x1: x0, y1: y0 + 10, x2: 900, y2: y0 + 10, stroke: GRID, 'stroke-width': 1.5 });
    ROWS.forEach((r, i) => { const y = y0 + 38 + i * rh, late = i >= 4;
      if (late && k < 4) return; const rowOp = late && k === 4 ? fade(u, 0.6 + (i - 4) * 0.4) : 1;
      mono(x0, y, r, { 'font-size': 14, 'font-weight': 700, fill: late ? GOOD : INK, opacity: rowOp });
      const [vf, cf] = COLF[r], [vt, ct] = COLT[r];
      const of = k === 1 ? fade(u, 0.4 + i * 0.3) : rowOp; mono(xf, y, vf, { 'font-size': 14, fill: cf, 'font-weight': 700, opacity: of });
      if (k >= 2) { const ot = k === 2 ? fade(u, 0.5 + i * 0.3) : rowOp; mono(xt, y, vt, { 'font-size': 14, fill: ct, 'font-weight': 700, opacity: ot }); } });
    if (k === 1) { grow(500, y0 + 32, 500, y0 + 38 + 2 * rh - 10, E(u, 1.4, 2.0), MUT, {}); sub(510, y0 + 38 + rh * 1.5, '원래 값은 exported_로 밀려난다', fade(u, 1.9), { 'text-anchor': 'start', fill: WARN, 'font-weight': 700 }); }
    if (k === 2) { check(xt - 20, y0 + 33, 8, pop(u, 1.0)); check(xt - 20, y0 + 33 + rh, 8, pop(u, 1.2)); }
    if (k === 3) { card(760, 300, 250, 46, { rx: 8, stroke: GOOD, sw: 2, s: pop(u, 0.2) }); typed(650, 306, 'honor_labels: true', seg(u, 0.4, 1.2), { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      sub(380, 306, '빠뜨려도 에러는 없다. 라벨만 조용히 바뀐다', fade(u, 1.5), { fill: BAD, 'font-weight': 700 }); }
    if (k === 4) sub(380, 306, 'region·tier는 하위에 없던 이름이라 충돌 없이 붙는다', fade(u, 1.5), { fill: GOOD, 'font-weight': 700 }); }

  // ── 5. 스케일 전략과 한계
  function node(x, y, s, col, sc) { card(x, y, tw(s, 14) + 26, 36, { rx: 8, text: s, fs: 14, mono: true, stroke: col || INK, s: sc }); }
  function tree(rx, ry, kids, col, u0, on, u) { node(rx, ry, 'global', ACC, on ? pop(u, u0) : 1);
    kids.forEach(([x, s], i) => { const g = on ? E(u, u0 + 0.3 + i * 0.2, u0 + 0.9 + i * 0.2) : 1; el('line', { x1: rx, y1: ry + 18, x2: lerp(rx, x, g), y2: lerp(ry + 18, 152, g), stroke: col, 'stroke-width': 2 }); if (g > 0.9) node(x, 170, s, col); }); }
  function s5(t, c) { const { k, u } = c;
    tree(230, 62, [[90, 'APAC'], [230, 'EU'], [370, 'US']], INFO, 0.2, k === 0, u); tx(230, 222, '① 지역별로 쪼갠다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: k === 0 ? fade(u, 1.4) : 1 });
    if (k >= 1) { tree(720, 62, [[610, 'app-prometheus'], [835, 'infra-prometheus']], WARN, 0.2, k === 1, u); tx(720, 222, '② 지표 종류별로 쪼갠다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: k === 1 ? fade(u, 1.4) : 1 }); }
    if (k === 2) { pill(300, 282, 'http_requests_total{pod="pod-7"}', INK, pop(u, 0.3), { mono: true, fs: 14 }); grow(470, 282, 560, 282, E(u, 0.8, 1.3), MUT, {});
      card(680, 282, 220, 44, { rx: 8, text: 'global: 결과 없음', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.3) }); sub(480, 330, '원본은 하위에만 있다. 상위에는 집계 소수뿐', fade(u, 1.8), { 'font-weight': 700, fill: INK }); }
    if (k === 3) { const x0 = 160, w = 640, X = (s) => x0 + (s / 90) * w;
      [['하위 샘플 15s', 15, INFO, 280], ['상위가 당김 30s', 30, ACC, 330]].forEach(([n, st, col, y], j) => { tx(x0 - 14, y + 5, n, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'end' });
        el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: GRID, 'stroke-width': 1.5 }); for (let s = 0; s <= 90; s += st) el('circle', { cx: X(s), cy: y, r: 6, fill: col, opacity: fade(u, 0.3 + j * 0.5 + s / 150) }); });
      const g = E(u, 1.4, 2.0); el('path', { d: `M${X(30)},356 V366 H${X(30) + (X(60) - X(30)) * g} V356`, fill: 'none', stroke: BAD, 'stroke-width': 2.2 });
      if (g > 0.9) mono((X(30) + X(60)) / 2, 388, '최대 30s 늦다', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); }
    if (k === 4) { ['Thanos', 'Cortex', 'Mimir'].forEach((s, i) => card(300 + i * 180, 296, 150, 52, { rx: 10, text: s, fs: 16, fw: 800, stroke: ACC, s: pop(u, 0.3 + i * 0.25) }));
      sub(480, 352, '장기 저장 · 전역 원본 쿼리가 필요할 때 (V-2-2)', fade(u, 1.3), { 'font-weight': 700, fill: INK });
      sub(480, 392, 'Federation은 요약을 모으는 데까지', fade(u, 1.8), { fill: MUT }); } }

  const quiz = [
    { q: 'DC 세 곳의 모든 타깃을 글로벌 서버 한 대가 직접 긁으면 어떻게 되는가?',
      o: ['시계열이 150만 개를 넘어 버티지 못한다', '하위 서버들이 데이터를 잃는다', '스크랩 간격이 저절로 늘어난다'], a: 0,
      why: 'DC마다 약 50만 시계열이라 합치면 1,540,000개다. 그래서 하위가 상세를 맡고 상위는 요약만 당긴다.' },
    { q: '상위 Prometheus가 하위에서 데이터를 가져오는 방식은 무엇인가?',
      o: ['하위가 상위로 push 한다', '하위의 /federate를 평범한 타깃처럼 스크랩한다', '두 서버가 같은 디스크를 공유한다'], a: 1,
      why: 'Federation은 특별한 프로토콜이 아니다. metrics_path를 /federate로 바꾼 스크랩이며 match[]가 하나는 있어야 한다.' },
    { q: 'match[]에 {__name__=~".+"}를 넣으면 어떻게 되는가?',
      o: ['job: 접두 지표만 골라 온다', '응답이 비어 아무것도 안 온다', '하위 전체가 올라와 글로벌이 다시 폭발한다'], a: 2,
      why: '모든 이름에 맞으므로 18개면 될 상위가 1,540,000개를 복제하게 된다. match[]에는 recording rule 결과처럼 집계된 지표만 넣는다.' },
    { q: 'honor_labels를 기본값(false)으로 두면 하위의 job="api"는 어떻게 되는가?',
      o: ['그대로 job="api"로 남는다', 'exported_job="api"로 밀려나고 job은 federate가 된다', '시계열이 통째로 버려진다'], a: 1,
      why: '충돌하면 상위 쪽 값이 이기고 원래 값은 exported_ 접두 라벨로 옮겨진다. Federation에서는 honor_labels: true로 원본을 지킨다.' },
    { q: '상위 Prometheus에서 pod-7의 원시 요청 수를 찾을 수 없는 까닭은 무엇인가?',
      o: ['상위에는 집계된 소수 지표만 올렸기 때문에', '스크랩 간격이 30s라서', 'honor_labels가 true라서'], a: 0,
      why: 'Federation은 복제가 아니라 선별이다. 원본은 하위에만 있고, 전역 원본 쿼리가 필요하면 Thanos·Cortex·Mimir를 검토한다.' },
  ];

  const summary = [
    'DC마다 약 50만 시계열을 한 서버가 다 긁으면 150만 개가 넘어 버티지 못한다.',
    'Federation은 상위가 하위의 /federate를 스크랩하는 계층 수집이고, match[]가 하나는 있어야 한다.',
    '하위의 recording rule이 미리 줄인 job: 지표만 match[]로 가져와 상위는 18개처럼 소수만 가진다.',
    'honor_labels: true로 하위의 job·instance를 지킨다. 상위는 스크랩 간격만큼 늦고 원본은 하위에만 있다.',
  ];
  const review = [
    { q: '글로벌 대시보드의 job 필터가 모두 "federate" 로만 보인다. 먼저 고칠 곳은?',
      o: ['match[]에 up을 추가한다', 'federate job에 honor_labels: true를 넣는다', '하위의 scrape_interval을 줄인다'], a: 1,
      why: '기본값이면 충돌한 job이 상위 값 federate로 바뀌고 원래 값은 exported_job으로 밀려난다. 에러가 없어서 대시보드에서야 드러난다.' },
    { q: '글로벌 서버 메모리가 갑자기 치솟았다. 최근 match[]를 {__name__=~".+"}로 바꿨다고 한다. 알맞은 조치는?',
      o: ['글로벌 서버 메모리를 늘린다', 'scrape_interval을 15s로 줄인다', 'recording rule 결과(job:.*)만 고르도록 되돌린다'], a: 2,
      why: '전체를 고르면 하위 시계열을 통째로 복제한다. 하위가 먼저 집계하고 상위는 그 결과만 가져와야 계층을 나눈 의미가 있다.' },
    { q: '장애 분석 중 상위에서 20초 전 값이 아직 안 보인다고 한다. federate job의 간격은 30s다. 가장 알맞은 설명은?',
      o: ['상위는 하위를 30s마다 당기므로 그만큼 늦을 수 있다', 'honor_labels 때문에 값이 지워졌다', 'match[]가 합집합이라 느리다'], a: 0,
      why: '상위는 하위의 최신 값을 스크랩 간격마다 가져올 뿐이다. 자세한 실시간 분석은 하위 Prometheus에서 한다.' },
  ];

  R.page({ title: 'Federation — 계층 수집', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
