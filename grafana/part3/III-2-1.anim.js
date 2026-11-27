/* III-2-1 Multi-dimensional Alert — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 인스턴스 값·알람 수는 페이지 STEPS의 instances · alertCount와 코드 주석의 값을 그린다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, dbIcon, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function tagL(x, y, s, col, o) { o = o || {}; const fs = o.fs || 14, w = tw(s, fs) + 24; card(x + w / 2, y, w, fs + 14, { rx: (fs + 14) / 2, stroke: col || INK, sw: 1.8, text: s, fs, fw: 700, color: o.color || col || INK, fill: o.fill, s: o.s, op: o.op, mono: o.mono }); return w; }
  function bell(cx, cy, s, col, muted) { const g = R.G(cx, cy, s ?? 1); col = col || INK;
    el('path', { d: 'M-13,7 Q-13,-15 0,-15 Q13,-15 13,7 L17,12 H-17 Z', fill: PANEL, stroke: col, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, g);
    el('circle', { cx: 0, cy: 16, r: 3.6, fill: col }, g);
    if (muted) el('line', { x1: -20, y1: -18, x2: 20, y2: 20, stroke: BAD, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g); return g; }
  function env(cx, cy, s, col, o) { o = o || {}; const g = R.G(cx, cy, s ?? 1, o.op); col = col || ACC;
    el('rect', { x: -19, y: -13, width: 38, height: 26, rx: 3, fill: PANEL, stroke: col, 'stroke-width': 2.4 }, g);
    el('path', { d: 'M-19,-13 L0,3 L19,-13', fill: 'none', stroke: col, 'stroke-width': 2.2 }, g); return g; }
  // 왼쪽 규칙 쌓기: rows [[글, 색, 보일 beat]] — 지금 beat의 줄을 강조
  function ruleStack(k, u, rows) { rows.forEach(([s, col, at], i) => { if (k < at) return; const y = 46 + i * 62, hot = k === at;
      card(170, y, 290, 48, { rx: 10, stroke: hot ? (col || ACC) : GRID, sw: hot ? 2.8 : 1.6, fill: hot ? PANEL : PANEL, s: hot ? pop(u, 0.2) : 1 });
      mono(38, y + 5, s, { 'font-size': 14, 'font-weight': hot ? 800 : 600, fill: hot ? INK : MUT }); }); }
  const pctC = (v) => (v > 80 ? BAD : v >= 70 ? WARN : GOOD);

  // ---------- 1. 단일 시리즈 ----------
  function s1(t, c) { const { k, u } = c, RX = 380;
    ruleStack(k, u, [['group: cluster-avg · 1m', ACC, 0], ['rule: cluster-cpu', ACC, 1], ['A: avg(…)  by 없음', INFO, 2], ['C: A gt 80', BAD, 4], ['for: 5m · severity: warning', WARN, 5]]);
    if (k === 0) { clock(640, 190, 46, (t % 1), ACC, 'interval 1m'); sub(640, 300, '1분마다 이 그룹의 규칙을 평가한다', fade(u, 1.0), { 'font-size': 15 }); return; }
    if (k === 1) { pill(640, 150, 'condition: C', INFO, pop(u, 0.6), { mono: true }); sub(640, 200, 'C 노드 결과가 알람 여부를 정한다', fade(u, 1.2), { 'font-size': 15 }); return; }
    if (k === 2) { dbIcon(560, 190, 'Prometheus', { s: pop(u, 0.3) }); grow(610, 190, 700, 190, E(u, 0.8, 1.2), MUT);
      card(780, 190, 150, 50, { rx: 10, text: 'by ( … )', fs: 16, mono: true, stroke: GRID, color: MUT, dash: '6 5', s: pop(u, 1.2) }); cross(780, 190, 20, pop(u, 1.7));
      sub(670, 290, 'by가 없으면 결과는 시계열 하나', fade(u, 2.0), { 'font-size': 15 }); return; }
    // 평균 막대
    const BX = 560, BW = 330, X = (v) => BX + (BW * v) / 100, b = c.beat.instances, avg = 51.7;
    if (k === 3 || k === 4 || k === 5) {
      for (let i = 0; i < 3; i++) { const y = 90 + i * 40; el('path', { d: `M${RX},${y} C${RX + 60},${y} ${RX + 60},200 ${RX + 120},200`, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: k === 3 ? fade(u, 0.2 + i * 0.2) : 1 }); }
      tx(RX - 4, 70, '장비별 CPU', { 'font-size': 13.5, fill: MUT, opacity: k === 3 ? fade(u, 0.2) : 1 });
      card(RX + 150, 200, 60, 40, { rx: 8, text: 'avg', fs: 15, mono: true, s: k === 3 ? pop(u, 0.9) : 1 });
      el('rect', { x: BX, y: 186, width: BW, height: 28, rx: 6, fill: SOFT }); el('rect', { x: BX, y: 186, width: (X(avg) - BX) * (k === 3 ? E(u, 1.2, 2.0) : 1), height: 28, rx: 6, fill: GOOD });
      mono(X(avg) + 10, 207, '51.7%', { 'font-size': 18, 'font-weight': 800, opacity: k === 3 ? fade(u, 1.8) : 1 });
      if (k >= 4) { el('line', { x1: X(80), y1: 170, x2: X(80), y2: 230, stroke: BAD, 'stroke-width': 2.6, 'stroke-dasharray': '6 4', opacity: k === 4 ? fade(u, 0.3) : 1 });
        mono(X(80), 250, '임계 80', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
        if (k === 4) { card(730, 320, 220, 48, { rx: 10, text: 'C = 거짓 (51.7 < 80)', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 1.2) }); } }
      if (k === 5) { pill(730, 320, 'Normal', GOOD, pop(u, 0.6), { fs: 16 }); sub(730, 366, '5분 연속 넘어야 Firing', fade(u, 1.0), { 'font-size': 15 }); }
      return; }
    if (k === 6) { const g = E(u, 0.2, 1.2);
      card(RX + 60, 200, 100 + 40 * g, 60 + 200 * g, { rx: 12, stroke: GRID, sw: 2, dash: '6 5' }); tx(RX + 60, 200 - 30 - 100 * g, 'avg를 열어 보면', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: g });
      [['api-1', 95], ['api-2', 30], ['api-3', 30]].forEach(([n, v], i) => { const y = 120 + i * 80, s = clamp((g - 0.6) * 3 - i * 0.3);
        if (s <= 0) return; mono(RX + 30, y + 6, n, { 'font-size': 15, 'font-weight': 800, opacity: s, 'text-anchor': 'middle' });
        el('rect', { x: BX, y: y - 12, width: BW, height: 24, rx: 6, fill: SOFT, opacity: s }); el('rect', { x: BX, y: y - 12, width: (X(v) - BX) * s, height: 24, rx: 6, fill: pctC(v) });
        mono(X(v) + 8, y + 6, v + '%', { 'font-size': 15, 'font-weight': 800, fill: pctC(v), opacity: s }); });
      el('line', { x1: X(80), y1: 96, x2: X(80), y2: 300, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 4', opacity: fade(u, 1.0) });
      mono(BX, 350, '(95 + 30 + 30) / 3 = 51.7', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) });
      bell(880, 352, pop(u, 2.0), MUT, true); return; }
    // k7: 쓸 곳
    card(520, 150, 300, 110, { rx: 12, stroke: GOOD, sw: 2.4, s: pop(u, 0.3) }); check(400, 130, 11, pop(u, 0.5));
    tx(424, 136, '합산이 의미 있는 지표', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.5) }); tx(424, 166, '비용 합계 같은 값', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) });
    card(520, 300, 300, 110, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 1.0) }); grow(400, 300, 440, 300, E(u, 1.2, 1.5), ACC);
    tx(450, 290, '장비별 상태는', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) }); mono(450, 318, 'by (instance)', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
    sub(800, 230, '대부분은 이쪽', fade(u, 1.8), { 'font-size': 15 }); }

  // ---------- 2. by (instance): 알람 인스턴스 목록 ----------
  const COLS = [{ n: 'labels', x: 360 }, { n: 'A 값', x: 560 }, { n: '상태', x: 680 }, { n: '추가 라벨 · 메시지', x: 780 }];
  function s2(t, c) { const { k, u } = c, ins = c.beat.instances;
    ruleStack(k, u, [['group: per-instance · 1m', ACC, 0], ['title: CPU 높음 (인스턴스별)', ACC, 1], ['A: avg by (instance) (…)', INFO, 2], ['C: A gt 80', BAD, 4], ['labels.host · description', WARN, 5]]);
    if (k <= 2) { if (k === 0) sub(650, 200, '그룹 이름은 목적이 보이게 짓는다', fade(u, 0.8), { 'font-size': 15 });
      if (k === 1) { tx(650, 170, 'alertname = 규칙 제목 그대로', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.6) }); sub(650, 206, '장비 구분은 쿼리 결과의 instance 라벨이 한다', fade(u, 1.2), { 'font-size': 15 }); }
      if (k === 2) { dbIcon(560, 190, 'Prometheus', { s: pop(u, 0.3) }); grow(612, 190, 700, 190, E(u, 0.8, 1.2), ACC); mono(720, 196, 'refId: A', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.2) }); }
      return; }
    // 표 머리
    COLS.forEach((h) => tx(h.x, 40, h.n, { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.2) : 1 }));
    el('line', { x1: 345, y1: 52, x2: 945, y2: 52, stroke: GRID, 'stroke-width': 1.5 });
    ins.forEach((m, i) => { const y = 92 + i * 64, s = k === 3 ? clamp(E(u, 0.3, 1.6) * 3 - i) : 1; if (s <= 0) return; const fire = k >= 4 && m.fires;
      el('rect', { x: 345, y: y - 26, width: 600, height: 52, rx: 8, fill: fire ? BADBG : PANEL, stroke: GRID, 'stroke-width': 1.2, opacity: s });
      mono(360, y + 5, '{instance="' + m.name + '"}', { 'font-size': 13.5, 'font-weight': 700, opacity: s });
      mono(560, y + 6, m.value + '%', { 'font-size': 16, 'font-weight': 800, fill: pctC(m.value), opacity: s });
      if (k >= 4) pill(712, y, m.fires ? 'Firing' : 'Normal', m.fires ? BAD : GOOD, k === 4 ? pop(u, 0.3 + i * 0.3) : 1, { fs: 13.5 });
      if (k >= 5) mono(780, y - (k >= 6 && m.fires ? 4 : -5), 'host=' + m.name, { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: k === 5 ? fade(u, 0.3 + i * 0.3) : 1 });
      if (k >= 6 && m.fires) tx(780, y + 18, '현재 값: ' + m.value + '%', { 'font-size': 13.5, fill: INK, opacity: k === 6 ? fade(u, 0.8) : 1 }); });
    if (k === 3) { mono(660, 300, 'by (instance) → 시계열 3개', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) }); }
    if (k === 4) sub(645, 300, '판정은 시계열마다 따로 · 95 하나만 80을 넘었다', fade(u, 1.6), { 'font-size': 15 });
    if (k === 5) sub(645, 300, 'host 라벨로 정책에서 라우팅할 수 있다', fade(u, 1.6), { 'font-size': 15 });
    if (k === 6) mono(645, 300, '{{ humanize $values.A.Value }}%', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) });
    if (k === 7) { const n = c.beat.alertCount; banner(645, 300, `알람 ${n}개 · Firing 1 · Normal 2`, pop(u, 0.4)); sub(645, 346, '해소도 인스턴스별로 따로 일어난다', fade(u, 1.2), { 'font-size': 15 }); }
    if (k === 8) { const g = E(u, 0.4, 1.5); for (let i = 0; i < 3; i++) env(lerp(420 + i * 90, 600, g), lerp(320, 330, g), 1, BAD, { op: i ? 1 - g * 0.8 : 1 });
      card(760, 330, 220, 46, { rx: 10, text: 'group_by로 한 메시지', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.5) }); sub(645, 380, '부분 장애는 잡히지만 알람 수가 늘어난다', fade(u, 1.8), { 'font-size': 15 }); } }

  // ---------- 3. 다차원 격자 ----------
  const SV = ['api', 'worker', 'batch'], GX = 400, GY = 70, CS = 52;
  const KNOWN = { '0,0': 92, '0,1': 88, '0,2': 45, '1,0': 76, '1,2': 85 };
  function s3(t, c) { const { k, u } = c;
    ruleStack(k, u, [['group: multi-dim · 1m', ACC, 0], ['title: 컨테이너 CPU 높음', ACC, 1], ['A: sum by (service,', INFO, 2], ['   instance, pod) × 100', INFO, 3], ['C: A gt 80', BAD, 4]]);
    if (k <= 2) { if (k === 0) sub(670, 200, '차원을 늘리기 전에 그룹을 따로 둔다', fade(u, 0.8), { 'font-size': 15 });
      if (k === 1) sub(670, 200, '어느 조합인지는 service·pod 라벨이 보여 준다', fade(u, 0.8), { 'font-size': 15 });
      if (k === 2) { mono(670, 170, 'container_cpu_usage_seconds_total', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.3) }); sub(670, 206, '메트릭이 바뀌면 라벨 집합도 바뀐다', fade(u, 1.0), { 'font-size': 15 }); }
      return; }
    if (k === 6) { const n = Math.floor(E(u, 0.2, 2.2) * 504); for (let i = 0; i < n; i++) { const r = Math.floor(i / 28), q = i % 28; el('rect', { x: 360 + q * 20, y: 40 + r * 18, width: 16, height: 14, rx: 2, fill: BAD, opacity: 0.2 + 0.6 * ((i * 53) % 13) / 13 }); }
      banner(640, 380, '5 차원 조합 → 시계열 1000+ · 운영 불가', pop(u, 1.6)); return; }
    if (k === 7) { [['api', 92], ['worker', 85], ['batch', 40]].forEach(([n, v], i) => { const y = 90 + i * 60, w = 300 * v / 100 * E(u, 0.2 + i * 0.2, 1.0 + i * 0.2);
        mono(380, y + 6, n, { 'font-size': 16, 'font-weight': 800 }); el('rect', { x: 470, y: y - 12, width: 300, height: 24, rx: 6, fill: SOFT }); el('rect', { x: 470, y: y - 12, width: w, height: 24, rx: 6, fill: pctC(v) }); mono(480 + w, y + 6, String(v), { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.0 + i * 0.2) }); });
      mono(380, 40, 'by (service) → 시계열 3개', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      card(640, 330, 340, 50, { rx: 10, text: '못 줄이면 group_by: [service]', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.6) }); return; }
    if (k === 8) { mono(380, 40, 'topk(5, avg by (pod) (…))', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      [92, 88, 85, 76, 45].forEach((v, i) => { const y = 74 + i * 34, w = 240 * v / 100 * E(u, 0.2 + i * 0.12, 0.9 + i * 0.12); el('rect', { x: 380, y: y - 11, width: w, height: 22, rx: 5, fill: pctC(v) }); mono(388 + w, y + 6, String(v), { 'font-size': 14, 'font-weight': 700 }); });
      [['1) by (service)로 시작', 0.8], ['2) 부족하면 by (service, instance)', 1.2], ['3) 3차원 이상은 피한다', 1.6]].forEach(([s, a], i) => tx(680, 90 + i * 44, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) })); return; }
    // 격자 3 × 10 (인스턴스 5 × pod 2)
    const fill = k === 3 ? E(u, 0.3, 1.9) : 1;
    SV.forEach((sv, r) => { tx(GX - 12, GY + r * CS + 32, sv, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end' });
      for (let q = 0; q < 10; q++) { const i = r * 10 + q, s = clamp(fill * 30 - i); if (s <= 0) continue; const v = KNOWN[`${r},${q}`], hot = k >= 4 && v > 80;
        el('rect', { x: GX + q * CS, y: GY + r * CS, width: CS - 6, height: CS - 6, rx: 6, fill: hot ? BAD : v != null ? (v > 80 ? WARNBG : SOFT) : SOFT, stroke: v != null ? INK : GRID, 'stroke-width': v != null ? 1.8 : 1, opacity: s });
        if (v != null) mono(GX + q * CS + (CS - 6) / 2, GY + r * CS + 31, String(v), { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? PANEL : INK, opacity: s }); } });
    for (let q = 0; q < 10; q += 2) mono(GX + q * CS + CS - 3, GY - 10, '#' + (q / 2 + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    tx(GX, GY + 3 * CS + 16, '칸 = service × instance(#1~#5) × pod(a·b)', { 'font-size': 13.5, fill: MUT });
    if (k === 3) mono(660, 340, '3 × 5 × 2 = 30 시계열', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) });
    if (k === 4) { mono(660, 330, '80 초과 → Firing 3건', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.8) }); sub(660, 366, '값을 아는 칸 5개 중 92·88·85', fade(u, 1.4), { 'font-size': 14.5 }); }
    if (k === 5) { [['service=api, pod=…', 0.3], ['service=worker, pod=…', 0.7]].forEach(([s, a], i) => tagL(420 + i * 250, 320, s, ACC, { mono: true, fs: 13.5, s: pop(u, a) }));
      sub(660, 370, '라벨을 심어 두면 정책에서 팀별로 나눈다', fade(u, 1.4), { 'font-size': 15 }); } }

  // ---------- 4. Math / Threshold 노드 ----------
  const ND = { A: [150, 110], B: [150, 290], C: [480, 200], D: [800, 200] };
  function nodeBox(id, title, val, col, s, hot) { const [x, y] = ND[id];
    card(x, y, 220, 92, { rx: 12, stroke: hot ? col : GRID, sw: hot ? 3 : 1.8, s });
    if (s < 0.3) return; mono(x - 96, y - 18, id, { 'font-size': 22, 'font-weight': 800, fill: col }); tx(x - 66, y - 20, title, { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (val != null) mono(x, y + 26, val, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 7) { const ax = axes(120, 60, 420, 220, { x: [0, 10], y: [0, 10], xl: '시간 범위', yl: '값' }), pts = [[0, 4], [1, 6], [2, 5], [3, 7], [4, 6], [5, 8], [6, 7], [7, 6], [8, 7], [9, 5], [10, 6]];
      const g = E(u, 1.0, 2.0); line(ax, pts, 1, INFO, { op: 0.3 }); line(ax, pts.map(([x, y]) => [lerp(x, 10, g), lerp(y, 6.1, g)]), 1, INFO);
      el('circle', { cx: ax.X(10), cy: ax.Y(6.1), r: 8 * pop(u, 1.9), fill: ACC });
      grow(560, 170, 650, 170, E(u, 1.6, 2.0), ACC); card(740, 170, 160, 70, { rx: 12, text: '값 1개', fs: 18, fw: 800, stroke: ACC, color: ACC, s: pop(u, 2.0) });
      ['mean', 'last', 'max', 'min', 'sum', 'count'].forEach((r, i) => tagL(600 + (i % 3) * 110, 270 + Math.floor(i / 3) * 40, r, i === 0 ? ACC : MUT, { mono: true, fs: 13.5, s: pop(u, 0.3 + i * 0.12) }));
      sub(330, 350, 'Reduce — 범위를 값 하나로 누른다', fade(u, 0.4), { 'font-size': 15 }); return; }
    if (k === 8) { [['Threshold', '단순 임계', 'C gt 80'], ['Math + Threshold', '비율·연산', '($B / $A) * 100'], ['Classic Condition', 'AND / OR (구식)', 'A avg gt and B …']].forEach(([a, b, d], i) => { const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.4);
        card(x, 200, 280, 150, { rx: 12, stroke: i === 1 ? ACC : GRID, sw: 2.4, s }); tx(x, 170, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: s });
        tx(x, 202, b, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: s }); mono(x, 236, d, { 'text-anchor': 'middle', 'font-size': 13.5, opacity: s }); }); return; }
    if (k === 0) { card(480, 200, 340, 80, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 0.3) }); mono(480, 206, 'group: composite · 1m', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      sub(480, 300, '여러 쿼리를 엮어도 시작은 그룹부터', fade(u, 1.2), { 'font-size': 15 }); return; }
    const b = c.beat.instances, A = 12500, B = 825;
    nodeBox('A', '전체 요청', k >= 2 ? Math.round(k === 2 ? tween(0, A, u) : A).toLocaleString('en-US') : null, INFO, k >= 2 ? (k === 2 ? pop(u, 0.2) : 1) : 0, k === 2);
    nodeBox('B', '5xx 요청', k >= 3 ? Math.round(k === 3 ? tween(0, B, u) : B).toLocaleString('en-US') : null, BAD, k >= 3 ? (k === 3 ? pop(u, 0.2) : 1) : 0, k === 3);
    nodeBox('C', 'math', k >= 4 ? (k === 4 ? tween(0, 6.6, u, 1.4) : 6.6).toFixed(1) : null, ACC, k >= 4 ? (k === 4 ? pop(u, 0.2) : 1) : 0, k === 4);
    nodeBox('D', 'threshold', k >= 5 ? '6.6 > 6' : null, BAD, 1, k === 1 || k === 5);
    if (k === 1) { card(ND.D[0], ND.D[1], 220, 92, { rx: 12, stroke: INFO, sw: 2.6, dash: '7 5', fill: 'none' }); pill(ND.D[0], 110, 'condition: D', INFO, pop(u, 0.4), { mono: true });
      sub(480, 360, '노드를 A → B → C → D로 잇고, 판정은 마지막 D', fade(u, 1.0), { 'font-size': 15 }); }
    if (k >= 4) { grow(260, 110, 370, 190, k === 4 ? E(u, 0.1, 0.5) : 1, INFO); grow(260, 290, 370, 210, k === 4 ? E(u, 0.1, 0.5) : 1, BAD); }
    if (k === 4) { mono(480, 290, '($B / $A) * 100', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(480, 330, '825 / 12,500 × 100 = 6.6', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) }); }
    if (k >= 5) grow(590, 200, 690, 200, k === 5 ? E(u, 0.1, 0.5) : 1, ACC);
    if (k === 5) { pill(ND.D[0], 300, 'Firing', BAD, pop(u, 1.0), { fs: 16 }); mono(ND.D[0], 120, 'evaluator: gt 6', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.5) }); }
    if (k === 6) { card(640, 350, 420, 48, { rx: 10, fill: WARNBG, stroke: WARN, sw: 2, s: pop(u, 0.6) });
      tx(450, 356, 'summary: 에러율 6.6%', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) }); mono(800, 316, '$values.C.Value', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      mono(ND.D[0], 120, 'for: 5m', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 0.3) }); } }

  // ---------- 5. Recording Rule ----------
  const REC = ['job:http_requests:rate5m', 'job:http_errors:rate5m', 'job:http_error_ratio:5m'];
  function s5(t, c) { const { k, u } = c, PX = 30, GXp = 640;
    zone(PX, 20, 560, 380, 'Prometheus · group api.rules · 30s', { fill: SOFT, op: k === 0 ? fade(u, 0.1) : 1 });
    if (k === 0) { clock(310, 200, 46, (t * 2) % 1, INFO, 'interval: 30s'); sub(310, 300, '계산은 Prometheus가 미리 한다', fade(u, 1.0), { 'font-size': 15 }); }
    if (k >= 1) REC.forEach((r, i) => { const at = i + 1; if (k < at) return; const y = 300 + i * 34, hot = k === at;
      el('rect', { x: PX + 16, y: y - 14, width: 528, height: 28, rx: 6, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : GRID, 'stroke-width': 1.5, opacity: hot ? fade(u, 1.4) : 1 });
      mono(PX + 28, y + 5, 'record: ' + r, { 'font-size': 14, 'font-weight': 700, opacity: hot ? fade(u, 1.4) : 1 }); });
    if (k >= 1 && k <= 3) { // 원본 시계열 여러 줄 → 하나로
      const n = k === 3 ? 2 : 6, g = E(u, 0.3, 1.4);
      for (let i = 0; i < n; i++) { const y0 = 80 + i * (k === 3 ? 60 : 24), y1 = 180;
        el('path', { d: `M${PX + 30},${y0} C${PX + 200},${y0} ${PX + 220},${lerp(y0, y1, g)} ${PX + 300},${lerp(y0, y1, g)}`, fill: 'none', stroke: k === 2 ? BAD : INFO, 'stroke-width': 2, opacity: 0.8 }); }
      mono(PX + 30, 66, k === 3 ? 'errors ÷ requests' : k === 2 ? 'rate(…{status=~"5.."}[5m])' : 'rate(http_requests_total[5m])', { 'font-size': 13.5, fill: MUT });
      grow(PX + 310, 180, PX + 380, 180, E(u, 1.2, 1.5), ACC); card(PX + 460, 180, 150, 50, { rx: 10, text: k === 3 ? '비율' : 'sum by (job)', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.4) }); }
    if (k >= 4) { zone(GXp, 20, 300, 380, 'Grafana · api-alerts · 1m', { fill: INFOBG, op: k === 4 ? fade(u, 0.2) : 1 }); }
    if (k === 4) { grow(PX + 560, 368, GXp + 20, 200, E(u, 0.6, 1.4), ACC); sub(GXp + 150, 120, '계산은 Prometheus,', fade(u, 1.2), { 'font-size': 15 }); sub(GXp + 150, 146, '판정은 Grafana', fade(u, 1.5), { 'font-size': 15 }); }
    if (k === 5) { const g = E(u, 0.4, 1.6), long = 'sum(rate(…5..[5m])) / sum(rate(…[5m]))';
      mono(GXp + 16, 90, long.slice(0, Math.round(long.length * (1 - g))), { 'font-size': 13.5, fill: MUT, 'text-decoration': 'line-through' });
      card(GXp + 150, 150, 270, 46, { rx: 8, text: 'expr: job:http_error_ratio:5m', fs: 13.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.4) });
      sub(GXp + 150, 220, '쿼리 한 줄 · 평가가 빠르다', fade(u, 1.8), { 'font-size': 14.5 }); }
    if (k === 6) { const X = (v) => GXp + 20 + (260 * v) / 0.1; el('rect', { x: GXp + 20, y: 140, width: 260, height: 28, rx: 6, fill: PANEL });
      el('rect', { x: GXp + 20, y: 140, width: (X(0.07) - GXp - 20) * E(u, 0.2, 1.2), height: 28, rx: 6, fill: BAD });
      el('line', { x1: X(0.05), y1: 128, x2: X(0.05), y2: 180, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }); mono(X(0.05), 200, '0.05', { 'font-size': 14, 'text-anchor': 'middle' });
      mono(X(0.07), 120, '0.07', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      pill(GXp + 150, 260, 'Firing', BAD, pop(u, 1.5), { fs: 16 }); sub(GXp + 150, 310, '비율(0~1)이라 0.05 = 5%', fade(u, 1.9), { 'font-size': 14.5 }); }
    if (k === 7) { [['대시보드 패널', 110], ['알람 규칙', 210]].forEach(([s, y], i) => { card(GXp + 150, y, 220, 50, { rx: 10, text: s, fs: 15, stroke: ACC, s: pop(u, 0.3 + i * 0.4) }); dot([[PX + 544, 368], [GXp + 40, y]], ((t * 0.7 + i * 0.5) % 1), ACC, 6); });
      ['평가가 빠르다', '두 화면 숫자가 같다', '쿼리가 짧다'].forEach((s, i) => { check(GXp + 30, 290 + i * 32, 8, pop(u, 1.2 + i * 0.3)); tx(GXp + 48, 295 + i * 32, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3 + i * 0.3) }); }); }
    if (k === 8) { tx(GXp + 16, 70, '평가가 느릴 때', { 'font-size': 16, 'font-weight': 800 });
      ['Recording을 안 쓰나', 'interval이 너무 짧나 (10s)', '차원이 너무 많나', '데이터소스가 느린가'].forEach((s, i) => { const y = 120 + i * 60;
        card(GXp + 30, y, 30, 30, { rx: 15, text: String(i + 1), fs: 15, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.3 + i * 0.4) }); tx(GXp + 56, y + 6, s, { 'font-size': 14.5, 'font-weight': 600, opacity: fade(u, 0.4 + i * 0.4) }); }); } }

  const quiz = [
    { q: 'api-1 95%, api-2 30%, api-3 30%일 때 avg(...) gt 80 규칙은 어떻게 되나?',
      o: ['평균 51.7%라 알람이 오지 않는다', 'api-1만 Firing이 된다', '세 대 모두 Firing이 된다'], a: 0,
      why: 'by가 없으면 값이 하나로 뭉개진다. (95+30+30)/3 = 51.7이라 80을 넘지 않아 한 대의 이상을 놓친다.' },
    { q: 'avg by (instance)로 바꾸면 api-1 95, api-2 35, api-3 42에서 알람 인스턴스는 몇 개이고 몇 개가 Firing인가?',
      o: ['1개, 1개 Firing', '3개, 1개 Firing', '3개, 3개 Firing'], a: 1,
      why: '시계열 수만큼 알람 인스턴스가 3개 생기고, 80을 넘은 api-1만 Firing이 된다.' },
    { q: '3 서비스 × 5 인스턴스 × 2 pod로 묶으면 시계열은 몇 개인가?',
      o: ['10개', '15개', '30개'], a: 2,
      why: '차원은 더하기가 아니라 곱하기다. 3 × 5 × 2 = 30이고 알람도 그만큼 생길 수 있다.' },
    { q: 'A = 12,500, B = 825, C = ($B / $A) * 100, D = C gt 6일 때 결과는 무엇인가?',
      o: ['C = 6.6이라 D가 참, Firing', 'C = 0.066이라 D가 거짓', 'C = 15.2라 D가 참'], a: 0,
      why: '825 / 12,500 × 100 = 6.6이다. 6을 넘으므로 threshold 노드 D가 참이 된다.' },
    { q: 'Recording Rule을 쓰면 알람 쿼리가 어떻게 바뀌나?',
      o: ['Grafana가 매번 긴 PromQL을 더 자주 계산한다', '미리 저장된 job:http_error_ratio:5m 한 줄을 읽는다', '알람 평가 주기가 30초로 바뀐다'], a: 1,
      why: 'Prometheus가 30초마다 비율을 새 메트릭으로 저장해 두므로, 알람은 그 이름 한 줄만 읽으면 된다.' },
  ];
  const summary = [
    'by 없이 평균을 내면 한 대가 95%여도 평균 51.7%로 알람이 오지 않는다.',
    'by (instance)를 붙이면 시계열마다 알람 인스턴스가 생겨 넘은 장비만 Firing이 된다.',
    '차원은 곱으로 늘어 3 × 5 × 2로만 잡아도 30개라, 한두 차원에서 시작한다.',
    'Math 노드로 비율을 만들고, 비싼 식은 Recording Rule로 미리 계산해 둔다.',
  ];
  const review = [
    { q: 'by (service, instance, pod, path)로 규칙을 바꿨더니 Slack이 알람으로 넘쳤다. 먼저 할 일은?',
      o: ['for를 0으로 줄인다', '차원을 by (service)로 줄이고, 못 줄이면 group_by로 묶는다', 'threshold를 Math 노드로 바꾼다'], a: 1,
      why: '차원이 곱으로 늘어 알람 수가 폭발한 것이다. 차원을 줄이는 게 먼저고, 그래도 많으면 Notification의 group_by로 한 메시지에 묶는다.' },
    { q: '에러율 알람의 summary에 6.6이 아니라 0.066이 찍혔다. 어디를 의심하나?',
      o: ['Math 식에 * 100이 빠졌다', 'for가 너무 길다', 'by (instance)가 빠졌다'], a: 0,
      why: '($B / $A)는 0~1 비율이다. 퍼센트로 보이려면 * 100을 곱해야 6.6이 된다.' },
    { q: '대시보드의 에러율과 알람 메시지의 에러율이 조금씩 다르게 나온다. 맞추는 방법은?',
      o: ['알람 interval을 10s로 줄인다', '알람에 Reduce 노드를 하나 더 넣는다', '같은 Recording Rule 메트릭을 대시보드와 알람이 함께 읽는다'], a: 2,
      why: '둘이 각자 다른 PromQL로 계산하면 숫자가 어긋난다. 미리 기록한 메트릭 하나를 같이 쓰면 값이 같아진다.' },
  ];

  R.page({ title: '다차원 알람', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
