/* V-2-1 AnalysisTemplate — 자동 검증·롤백 · 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 측정값(1.4% · 180ms · 8.7% · 9.1% · 2.1% · 3.4% · 7.2%)은 페이지가 든 예시 출력이다. 클러스터에서 돌린 값이 아니다.
 * failureLimit 판정: 실패 횟수가 failureLimit 을 "넘으면" Failed (Argo Rollouts analysis 문서).
 * replicas 10, trafficRouting 없음 → setWeight 10/30/50 이면 canary 1/3/5 (argo-rollouts canary.go 규칙 재현).
 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, person, cross, check, clock, terminal, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const KC = { S: INFO, C: ACC, X: BAD };
  function pod(cx, cy, kind, o) { o = o || {}; const z = o.z || 22, s = o.s ?? 1;
    if (!kind) { el('rect', { x: cx - z / 2, y: cy - z / 2, width: z, height: z, rx: 5, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }); return; }
    if (s <= 0) return; const g = R.G(cx, cy, s, o.op); el('rect', { x: -z / 2, y: -z / 2, width: z, height: z, rx: 5, fill: KC[kind] }, g); }
  const BASIC10 = { 0: 0, 10: 1, 30: 3, 50: 5, 100: 10 };
  function split(x, y, w, wc, o) { o = o || {}; const h = 20, cw = w * clamp(wc / 100);
    el('rect', { x, y, width: w, height: h, rx: 6, fill: INFO, opacity: 0.8 });
    if (cw > 0.5) el('rect', { x: x + w - cw, y, width: cw, height: h, rx: 6, fill: o.bad ? BAD : ACC });
    mono(x, y + h + 18, (o.sl || 'stable') + ' ' + Math.round(100 - wc) + '%', { 'font-size': 14, fill: INFO, 'font-weight': 700 });
    mono(x + w, y + h + 18, 'canary ' + Math.round(wc) + '%', { 'font-size': 14, fill: o.bad ? BAD : ACC, 'font-weight': 700, 'text-anchor': 'end' }); }
  // 지표 계기: 이름 · 축 · 기준선 · 값 바늘. m = { name, value, threshold, unit }
  const MAXV = { '%': 10, ms: 600 };
  function gauge(x, y, w, m, v, o) { o = o || {}; const max = MAXV[m.unit], X = (q) => x + w * clamp(q / max), pass = v != null && v <= m.threshold;
    mono(x, y - 10, m.name, { 'font-size': 14.5, 'font-weight': 700 });
    el('rect', { x, y, width: w, height: 14, rx: 7, fill: SOFT });
    el('rect', { x, y, width: X(m.threshold) - x, height: 14, rx: 7, fill: GOODBG });
    el('line', { x1: X(m.threshold), y1: y - 6, x2: X(m.threshold), y2: y + 20, stroke: WARN, 'stroke-width': 2.5 });
    mono(X(m.threshold), y + 36, (m.unit === '%' ? '≤ ' : '≤ ') + m.threshold + m.unit, { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700 });
    if (v == null) { mono(x + w + 12, y + 13, o.none || '값 없음', { 'font-size': 15, 'font-weight': 800, fill: o.noneCol || MUT }); return; }
    const col = pass ? GOOD : BAD;
    el('circle', { cx: X(v), cy: y + 7, r: 9, fill: col, stroke: PANEL, 'stroke-width': 2 });
    mono(x + w + 12, y + 13, (m.unit === '%' ? v.toFixed(1) : Math.round(v)) + m.unit, { 'font-size': 16, 'font-weight': 800, fill: col }); }
  const metricsOf = (c) => c.beat.metrics || [];
  const valOf = (c, i, u) => { const b = metricsOf(c)[i], p = c.prev && (c.prev.metrics || [])[i];
    if (!b || b.value == null) return null; return p && p.value != null ? tween(p.value, b.value, u) : b.value; };
  function ladder(x, y, rows, cur, o) { o = o || {}; const rh = o.rh || 38, w = o.w || 236;
    tx(x, y - 12, 'canary.steps', { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' });
    rows.forEach((r, i) => { const yy = y + i * rh, done = i < cur, on = i === cur, cy = yy + rh / 2 - 2, oc = (o.col && o.col(i)) || ACC;
      if (on) el('rect', { x: x - 6, y: yy, width: w, height: rh - 5, rx: 7, fill: oc === INFO ? INFOBG : oc === BAD ? BADBG : ACCBG, stroke: oc, 'stroke-width': 1.5 });
      mono(x + 22, cy + 5, '- ' + r, { 'font-size': 14.5, fill: on ? oc : done ? MUT : INK, 'font-weight': on ? 700 : 500 });
      if (done) check(x + 8, cy, 6); else el('circle', { cx: x + 8, cy, r: 4.5, fill: on ? oc : GRID }); }); }

  // =========== 1. 사람이 대시보드를 지켜볼 수 없다 ===========
  function monitor(cx, cy, o) { o = o || {}; card(cx, cy, 120, 78, { rx: 8, stroke: o.col || INK, s: o.s });
    if ((o.s ?? 1) > 0.5) { el('polyline', { points: `${cx - 46},${cy + 18} ${cx - 26},${cy + 4} ${cx - 8},${cy + 10} ${cx + 10},${cy - 14} ${cx + 28},${cy - 4} ${cx + 46},${cy - 20}`, fill: 'none', stroke: o.col || ACC, 'stroke-width': 2.5 });
      sub(cx, cy + 58, 'Grafana', 1, { 'font-weight': 700 }); } }
  function s1(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) {
      const ws = [10, 30, 50], X = (i) => 180 + i * 250;
      ws.forEach((w, i) => { const s = k === 0 ? pop(u, 0.2 + i * 0.6) : 1;
        card(X(i), 90, 120, 40, { rx: 20, text: `canary ${w}%`, fs: 15, mono: true, stroke: ACC, color: ACC, s });
        if (i < 2) grow(X(i) + 64, 90, X(i + 1) - 64, 90, k === 0 ? seg(u, 0.5 + i * 0.6, 0.8 + i * 0.6) : 1, GRID);
        if (k === 0) { monitor(X(i), 210, { s: pop(u, 0.4 + i * 0.6) }); person(X(i) - 90, 230, null, { s: pop(u, 0.5 + i * 0.6) });
          pill(X(i), 320, '"OK, 다음"', INK, pop(u, 0.8 + i * 0.6), { fs: 14 }); } });
      if (k === 0) { tx(480, 392, '단계마다 사람이 붙어 있어야 다음으로 간다', { 'font-size': 15.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
      // k1: 새벽에는 아무도 없고, 기준도 사람마다 다르다
      monitor(X(0), 210, {}); el('circle', { cx: X(0) - 90, cy: 225, r: 24, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      mono(X(0) - 90, 230, '02:00', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      const n = Math.round(lerp(0, 14, E(u, 0.3, 2.4)));
      for (let i = 0; i < n; i++) el('circle', { cx: 120 + (i % 7) * 18, cy: 318 + Math.floor(i / 7) * 18, r: 6, fill: BAD });
      tx(110, 372, '흘린 트래픽만큼 피해가 쌓인다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      person(X(1) + 40, 230, 'A', {}); person(X(2) - 40, 230, 'B', {});
      pill(X(1) + 40, 170, '이 정도면 괜찮네', GOOD, pop(u, 0.8), { fs: 14 }); pill(X(2) - 40, 170, '위험한데?', BAD, pop(u, 1.2), { fs: 14 });
      tx(X(1) + 125, 330, '같은 그래프, 다른 판정', { 'font-size': 15.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 2 || k === 3) { const ms = metricsOf(c);
      ms.forEach((m, i) => gauge(120, 120 + i * 100, 420, m, null, { none: k === 2 ? '측정 전' : '측정 대기' }));
      if (k === 2) { tx(330, 340, '성공의 정의를 숫자로 적는다', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 1.2) }); return; }
      // k3: AnalysisRun 이 재고, 비교하고, 갈라진다
      const cx = 790; card(cx, 90, 190, 50, { text: 'AnalysisRun', fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.2) });
      ['측정', '기준과 비교'].forEach((s, i) => { pill(cx, 160 + i * 52, s, INK, pop(u, 0.5 + i * 0.3), { fs: 14 }); });
      grow(cx, 232, cx - 90, 300, seg(u, 1.2, 1.7), GOOD); grow(cx, 232, cx + 90, 300, seg(u, 1.4, 1.9), BAD);
      card(cx - 90, 330, 130, 44, { text: '통과 → promote', fs: 14, stroke: GOOD, color: GOOD, s: pop(u, 1.7) });
      card(cx + 90, 330, 130, 44, { text: '실패 → abort', fs: 14, stroke: BAD, color: BAD, s: pop(u, 1.9) });
      sub(cx, 390, '이 사이에 사람이 없다', fade(u, 2.3), { 'font-weight': 700, fill: INK }); return; }
    // k4: 임상시험
    lbl(270, 56, '임상시험', 1, { 'font-size': 17 }); lbl(700, 56, 'Canary 배포', 1, { 'font-size': 17, fill: ACC });
    for (let i = 0; i < 20; i++) { const on = i < 2, s = pop(u, 0.2 + i * 0.03);
      person(110 + (i % 10) * 34, 120 + Math.floor(i / 10) * 74, null, { s: s * 0.55, stroke: on ? ACC : OFF, fill: on ? ACCBG : PANEL }); }
    [['소수 환자에게 먼저 투여', 'canary 10%'], ['부작용률', 'error-rate'], ['기준과 비교해 확대 · 중단', '승격 · 롤백']].forEach(([a, b], i) => { const y = 270 + i * 46, s = fade(u, 0.9 + i * 0.4);
      tx(110, y, a, { 'font-size': 15, 'font-weight': 700, opacity: s }); grow(400, y - 5, 520, y - 5, seg(u, 1.0 + i * 0.4, 1.4 + i * 0.4), ACC);
      mono(540, y, b, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: s }); });
    pill(700, 140, '사람의 감 대신 합의한 숫자', ACC, pop(u, 2.1), { fs: 14 }); }

  // =========== 2. AnalysisTemplate 정의 ===========
  function tplCard(k, u) { const rows = [['metadata.name', 'success-rate', 0], ['args', 'service-name', 1], ['metrics[0]', 'error-rate', 2], ['metrics[1]', 'p95-latency', 4]];
    el('rect', { x: 30, y: 40, width: 330, height: 46 + rows.filter((r) => k >= r[2]).length * 46, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
    tx(48, 68, 'AnalysisTemplate', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    rows.forEach(([a, b, from], i) => { if (k < from) return; const y = 106 + i * 46, op = k === from ? fade(u, 0.2) : 1, hot = k === from || (from === 2 && (k === 2 || k === 3)) || (from === 4 && k >= 4);
      mono(48, y, a, { 'font-size': 14, fill: MUT, opacity: op }); mono(190, y, b, { 'font-size': 15, 'font-weight': 700, fill: hot ? ACC : INK, opacity: op }); }); }
  function s2(t, c) { const { k, u } = c;
    tplCard(k, u);
    const RX = 410;
    if (k === 0) { ['Rollout web', 'Rollout api', 'Rollout admin'].forEach((s, i) => { const y = 110 + i * 80;
        card(800, y, 170, 46, { text: s, fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.5 + i * 0.3) });
        grow(712, y, 366, 64, seg(u, 0.8 + i * 0.3, 1.4 + i * 0.3), GRID, { dash: '5 4' }); });
      sub(800, 370, '한 규격을 여러 앱이 가져다 쓴다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { [['web', 120], ['api', 230]].forEach(([v, y], i) => { card(800, y, 150, 44, { text: 'Rollout ' + v, fs: 15, stroke: INFO, color: INFO });
        R.fly(720, y, 250, 152, seg(u, 0.5 + i * 0.9, 1.3 + i * 0.9), 'service-name=' + v, { mono: true }); });
      mono(250, 200, '{{args.service-name}}', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
      sub(560, 340, '값만 바꿔 같은 Template을 쓴다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { const x0 = RX + 40, W = 420, X = (s) => x0 + W * s / 120;
      mono(x0, 70, 'interval: 30s · count: 5', { 'font-size': 15, 'font-weight': 700 });
      el('line', { x1: x0, y1: 150, x2: x0 + W * E(u, 0.2, 1.0), y2: 150, stroke: INK, 'stroke-width': 2 });
      [0, 30, 60, 90, 120].forEach((s, i) => { const on = pop(u, 0.5 + i * 0.25); el('circle', { cx: X(s), cy: 150, r: 9 * on, fill: i === 1 || i === 3 ? BAD : GOOD });
        mono(X(s), 182, s + 's', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: on }); });
      tx(x0, 250, 'failureLimit: 2', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: fade(u, 1.8) });
      tx(x0, 280, '5번 중 실패 2번까지는 넘어간다 (위 예: 통과)', { 'font-size': 14.5, opacity: fade(u, 2.0) });
      sub(x0 + 210, 320, '점 색은 그림용 예시', fade(u, 2.0)); return; }
    if (k === 3) { // 0~10% 눈금, 5% 이하가 성공
      const x0 = RX + 40, W = 420, X = (v) => x0 + W * v / 10;
      mono(x0, 70, 'successCondition: result[0] <= 0.05', { 'font-size': 14.5, 'font-weight': 700 });
      el('rect', { x: x0, y: 100, width: W, height: 26, rx: 6, fill: SOFT }); el('rect', { x: x0, y: 100, width: (X(5) - x0) * E(u, 0.3, 1.0), height: 26, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.5 });
      [0, 5, 10].forEach((v) => mono(X(v), 148, v + '%', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
      tx(X(2.5), 118, '성공', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9) });
      mono(x0 + W / 2, 210, '5xx 요청 (2분 rate)', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      el('line', { x1: x0 + 60, y1: 224, x2: x0 + W - 60, y2: 224, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.3) });
      mono(x0 + W / 2, 250, '전체 요청 (2분 rate)', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.4) });
      pill(x0 + W / 2, 310, 'provider: prometheus', INFO, pop(u, 1.9), { mono: true, fs: 14 }); return; }
    if (k === 4) { [['error-rate', '≤ 5%'], ['p95-latency', '≤ 300ms']].forEach(([n, th], i) => { const y = 130 + i * 90;
        card(RX + 170, y, 260, 56, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 0.3 + i * 0.5) });
        mono(RX + 60, y + 5, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.5) }); mono(RX + 285, y + 5, th, { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.4 + i * 0.5) });
        grow(RX + 302, y, RX + 380, 175, seg(u, 1.2, 1.7), GRID, { plain: true }); });
      card(RX + 430, 175, 90, 50, { text: '그리고', fs: 16, stroke: INK, s: pop(u, 1.6) });
      sub(RX + 300, 300, '하나라도 실패하면 AnalysisRun은 Failed', fade(u, 2.1), { 'font-weight': 700, fill: BAD }); return; }
    if (k === 5) { // p95 의 세 구간
      const x0 = RX + 30, W = 450, X = (v) => x0 + W * v / 700;
      mono(x0, 70, 'p95-latency (ms)', { 'font-size': 15, 'font-weight': 700 });
      [[0, 300, GOOD, GOODBG, '통과'], [300, 500, WARN, WARNBG, 'Inconclusive'], [500, 700, BAD, BADBG, 'Failed']].forEach(([a, b, col, bg, n], i) => { const s = fade(u, 0.3 + i * 0.5);
        el('rect', { x: X(a), y: 110, width: X(b) - X(a) - 2, height: 40, rx: 6, fill: bg, stroke: col, 'stroke-width': 1.5, opacity: s });
        tx((X(a) + X(b)) / 2, 136, n, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 800, fill: col, opacity: s }); });
      [0, 300, 500].forEach((v) => mono(X(v), 172, String(v), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
      tx(x0, 230, '사이 값은 Rollout을 멈추고 사람을 기다린다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
      tx(x0, 262, 'failureLimit 기본 0 · 500ms 넘으면 한 번에 Failed', { 'font-size': 14.5, opacity: fade(u, 2.2) }); return; }
    // k6: histogram_quantile
    const x0 = RX + 30, hs = [4, 9, 14, 11, 7, 4, 2, 1], bw = 46;
    mono(x0, 64, 'histogram_quantile(0.95, …) * 1000', { 'font-size': 14.5, 'font-weight': 700 });
    hs.forEach((h, i) => { const hh = h * 12 * E(u, 0.2 + i * 0.08, 0.7 + i * 0.08);
      el('rect', { x: x0 + i * (bw + 4), y: 280 - hh, width: bw, height: hh, rx: 3, fill: i < 6 ? INFO : BAD, opacity: 0.75 }); });
    mono(x0, 304, '응답 시간 구간 (le 버킷) · 그림용 예시 분포', { 'font-size': 13.5, fill: MUT });
    const q = x0 + 6 * (bw + 4) - 2; el('line', { x1: q, y1: 90, x2: q, y2: 284, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 1.4) });
    tx(q + 8, 110, '여기까지 95%', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.5) });
    sub(x0 + 210, 344, '초 단위 결과에 1000을 곱해 ms로 비교한다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }

  // =========== 3. Rollout 에 analysis 끼우기 ===========
  const ST3 = ['setWeight: 10', 'analysis: success-rate', 'setWeight: 30', 'analysis: success-rate', 'setWeight: 50', 'pause: {duration: 2m}', 'setWeight: 100'];
  function s3(t, c) { const { k, u } = c, b = c.beat.canary, p = (c.prev && c.prev.canary) || b;
    let cur = [-1, -1, 0, 1, 2, 3, 3][k]; if (k === 1) cur = Math.floor(clamp(u / 0.33, 0, 7)) - 0;
    ladder(36, 72, ST3, cur, { col: (i) => (i === 1 || i === 3 ? INFO : ACC) });
    if (k === 5) [4, 5, 6].forEach((i, j) => { const y = 72 + i * 38 + 15; el('rect', { x: 30, y: y - 17, width: 236, height: 33, rx: 7, fill: 'none', stroke: WARN, 'stroke-width': 1.8, 'stroke-dasharray': '5 4', opacity: fade(u, 0.3 + j * 0.3) }); });
    const w = tween(p.weight, b.weight, u), nC = BASIC10[b.weight] ?? 0;
    // 파드 10개
    tx(320, 74, 'Rollout web · replicas 10', { 'font-size': 14.5, 'font-weight': 700 });
    for (let i = 0; i < 10; i++) { const isC = i >= 10 - nC; pod(332 + i * 30, 104, isC ? 'C' : 'S', { s: k === 0 ? pop(u, 0.2 + i * 0.06) : 1 }); }
    split(320, 140, 290, w);
    if (k >= 3) { const run = card(800, 92, 250, 48, { rx: 10, text: 'AnalysisRun', fs: 16, stroke: INFO, color: INFO, fill: INFOBG, s: k === 3 ? pop(u, 0.9) : 1 });
      if (k === 3) R.fly(360, 72 + 38 + 15, 800, 92, seg(u, 0.2, 0.9), 'templateName: success-rate', { mono: true });
      if (k === 3) pill(800, 150, 'args: service-name=web', INFO, pop(u, 1.2), { mono: true, fs: 13.5 });
      const ms = metricsOf(c); ms.forEach((m, i) => gauge(330, 250 + i * 82, 420, m, k === 3 ? (u > 1.5 ? valOf(c, i, u - 1.5) : null) : valOf(c, i, u), { none: '수집 중' }));
      sub(930, 400, '측정값은 페이지 예시', 1, { 'text-anchor': 'end' }); }
    if (k === 0) sub(470, 260, '아직 트래픽은 움직이지 않는다', fade(u, 0.9), { 'font-weight': 700, fill: INK });
    if (k === 1) sub(470, 260, '위에서 아래로 하나씩 실행된다', fade(u, 0.6), { 'font-weight': 700, fill: INK });
    if (k === 2) sub(470, 260, '10개 중 1개만 새 버전', fade(u, 0.9), { 'font-weight': 700, fill: ACC });
    if (k === 4) { check(800, 200, 12, pop(u, 0.2)); tx(800, 236, '통과해야 다음 setWeight', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5) }); }
    if (k === 6) { pill(800, 200, 'canary 이미지 acme/web:v2.4.0', ACC, pop(u, 0.3), { mono: true, fs: 13.5 }); el('circle', { cx: 690, cy: 92, r: 6 + 3 * Math.sin(t * 6), fill: INFO }); } }

  // =========== 4. AnalysisRun 판정 ===========
  function s4(t, c) { const { k, u } = c, b = c.beat.canary, p = (c.prev && c.prev.canary) || b;
    if (k === 0) { terminal(60, 50, 520, 150, ['$ kubectl get analysisrun -n web', 'NAME            STATUS       AGE', ['web-6f8-2-1     Successful   2m', '#86efac']], lerp(0, 3, E(u, 0.2, 1.6)), { fs: 14.5 });
      sub(320, 226, '출력은 페이지의 예시', 1);
      card(760, 125, 240, 60, { rx: 10, text: 'AnalysisRun\nweb-6f8-2-1', fs: 15, mono: true, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 1.4) });
      tx(760, 200, '판정 기록이 객체로 남는다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.9) });
      metricsOf(c).forEach((m, i) => gauge(120, 290 + i * 70, 460, m, m.value, {})); return; }
    const ms = metricsOf(c); ms.forEach((m, i) => gauge(90, 80 + i * 86, 400, m, valOf(c, i, u), {}));
    let w = tween(p.weight, b.weight, u); if (k === 4) w = lerp(30, 0, E(u, 0.6, 1.6));
    split(90, 268, 480, w, { bad: k >= 2, sl: k >= 4 ? 'stable v2.3.1' : 'stable' });
    const RX = 760;
    if (k === 1) { banner(RX, 110, 'Successful', pop(u, 0.4)); tx(RX, 170, '두 지표 모두 기준 안', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(RX, 200, '→ setWeight 50으로 자동 진행', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) }); }
    if (k >= 2 && k <= 4) { // 측정 기록: 실패 칸
      tx(RX - 130, 80, '측정 기록 (failureLimit 2)', { 'font-size': 14.5, 'font-weight': 700 });
      const vals = ['8.7%', '9.1%', '> 5%'], n = k === 2 ? (u > 0.6 ? 1 : 0) : k === 3 ? 1 + (u > 0.5 ? 1 : 0) + (u > 1.4 ? 1 : 0) : 3;
      vals.forEach((v, i) => { const y = 120 + i * 50, on = i < n;
        card(RX, y, 260, 40, { rx: 8, stroke: on ? BAD : GRID, fill: on ? BADBG : PANEL, dash: on ? null : '4 3' });
        mono(RX - 116, y + 5, `sample ${i + 1}`, { 'font-size': 14.5, fill: on ? INK : MUT });
        if (on) mono(RX + 116, y + 5, `${v} · 실패 ${i + 1}`, { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); });
      if (k >= 3 && n >= 3) banner(RX, 290, '3회 > 2 → phase Failed', pop(u, k === 3 ? 1.5 : 0)); }
    if (k === 4) { tx(330, 340, 'canary 트래픽을 0%로 되돌린다', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      sub(330, 368, '노출은 최대 30% 구간, 몇 분 안에 끝난다', fade(u, 1.8)); }
    if (k === 5) { // 판정 규칙
      [['successCondition 충족', '실패 ≤ failureLimit', 'Successful', '다음 단계', GOOD, 110], ['failureCondition 충족', '실패 > failureLimit', 'Failed', 'abort · 롤백', BAD, 250]].forEach(([a, b2, ph, act, col, y], i) => { const s = pop(u, 0.3 + i * 0.6);
        card(690, y, 180, 70, { rx: 10, stroke: col, sw: 2, s }); tx(690, y - 6, i ? a + ' 또는' : a + ' 그리고', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.6) });
        mono(690, y + 18, b2, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.6) });
        grow(782, y, 802, y, seg(u, 0.7 + i * 0.6, 1.0 + i * 0.6), col);
        card(875, y, 140, 70, { rx: 10, text: ph + '\n' + act, fs: 15, stroke: col, color: col, s: pop(u, 0.9 + i * 0.6) }); });
      sub(780, 340, '사람의 승인 클릭이 없다', fade(u, 2.1), { 'font-weight': 700, fill: INK }); } }

  // =========== 5. 오탐 · 미탐 함정 ===========
  function s5(t, c) { const { k, u } = c;
    const ms = metricsOf(c);
    if (k === 0 || k === 1) { const x0 = 90;
      mono(x0 + 150, 90, 'sum(rate(5xx[2m]))', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD });
      el('line', { x1: x0, y1: 106, x2: x0 + 300, y2: 106, stroke: INK, 'stroke-width': 2 });
      mono(x0 + 150, 132, k === 0 ? 'sum(rate(requests[2m]))' : 'clamp_min(sum(rate(requests[2m])), 1)', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: k ? GOOD : INK });
      if (k === 0) { mono(x0 + 150, 190, '0 / 0', { 'font-size': 26, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 0.5) });
        mono(x0 + 150, 232, '= NaN', { 'font-size': 22, 'text-anchor': 'middle', 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
        sub(x0 + 150, 260, '트래픽이 없을 때', fade(u, 0.7)); }
      else sub(x0 + 150, 190, '분모가 1 아래로 내려가지 않는다', fade(u, 0.5), { 'font-weight': 700, fill: GOOD }); }
    if (k === 2) { // baseline 3% 근처에서 흔들리는 에러율 (그림용 곡선)
      const ax = axes(80, 60, 360, 200, { x: [0, 10], y: [0, 8], yt: [0, 3, 5, 8], yl: 'error-rate %', xl: '시간' });
      el('line', { x1: 80, y1: ax.Y(5), x2: 440, y2: ax.Y(5), stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' });
      line(ax, [[0, 2.8], [1, 3.3], [2, 2.6], [3, 3.6], [4, 3.1], [5, 2.9], [6, 3.8], [7, 3.0], [8, 3.4], [9, 2.7], [10, 3.2]], E(u, 0.2, 1.6), INFO);
      sub(260, 316, '선은 그림용 예시. 평소 3%와 기준 5% 사이가 좁다', fade(u, 1.6)); }
    if (k === 3) { const ax = axes(80, 60, 360, 200, { x: [0.5, 5.5], y: [0, 8], xt: [1, 2, 3, 4, 5], yt: [0, 5, 8], yl: 'error-rate %', xl: '샘플' });
      el('line', { x1: 80, y1: ax.Y(5), x2: 440, y2: ax.Y(5), stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' });
      el('circle', { cx: ax.X(1), cy: ax.Y(7.2), r: 8 * pop(u, 0.3), fill: BAD }); mono(ax.X(1) + 14, ax.Y(7.2) + 5, '7.2', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) });
      [3.4, 3.1, 3.3, 3.0].forEach((v, i) => el('circle', { cx: ax.X(i + 2), cy: ax.Y(v), r: 7 * pop(u, 1.2 + i * 0.2), fill: GOOD }));
      tx(80, 330, 'count 1이면 7.2% 한 번에 롤백', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.7) });
      tx(80, 358, 'count 5 · failureLimit 2면 스파이크 1번은 넘어간다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) }); }
    if (k === 4) { R.dbIcon(160, 150, 'Prometheus', { stroke: OFF });
      grow(230, 150, 420, 150, 1, BAD, { dash: '6 5', plain: true }); cross(325, 150, 12, pop(u, 0.4));
      card(500, 150, 150, 48, { text: 'AnalysisRun', fs: 15, stroke: BAD, color: BAD });
      tx(160, 260, 'address 오타 · 토큰 만료 · 네트워크 정책', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(160, 290, '연속 에러가 consecutiveErrorLimit(기본 4)을 넘으면 Error', { 'font-size': 14.5, opacity: fade(u, 1.4) }); }
    if (k === 5) { ['PromQL을 Prometheus UI에서 직접 실행', 'baseline을 보고 임계값 정하기', 'count ≥ 5 · failureLimit ≥ 1', 'provider 주소 · 인증을 curl로 확인', '처음엔 롤백 대신 경고만 (dry-run)'].forEach((s, i) => { const y = 74 + i * 52, on = u > 0.3 + i * 0.35;
        card(300, y, 520, 42, { rx: 21, stroke: on ? GOOD : GRID, fill: on ? GOODBG : PANEL });
        if (on) check(64, y, 8, pop(u, 0.3 + i * 0.35)); tx(86, y + 5, s, { 'font-size': 15, 'font-weight': 700, fill: on ? INK : MUT }); }); }
    // 오른쪽: 지금 지표 상태 (페이지 데이터)
    if (k !== 5) ms.forEach((m, i) => gauge(600, 110 + i * 96, 250, m, valOf(c, i, u), { none: k === 4 ? '조회 실패' : 'NaN', noneCol: BAD }));
    if (k !== 5) { const [s, col] = [['실패 (NaN)', BAD], ['통과', GOOD], ['오탐 위험', WARN], ['스파이크 한 번에 실패', BAD], ['Error · 측정 불가', BAD]][k];
      pill(725, 350, 'AnalysisRun 판정 · ' + s, col, pop(u, 1.0), { fs: 14.5 }); }
  }

  const quiz = [
    { q: 'AnalysisTemplate이 해결하는 문제는 무엇인가?',
      o: ['canary 파드를 더 빨리 띄우지 못하는 문제', '단계마다 사람이 대시보드를 보고 판단해야 하는 문제', 'Git 저장소를 폴링하는 주기 문제'], a: 1,
      why: '판단 기준(error-rate 5%, p95 300ms)을 코드로 적어 두면 AnalysisRun이 대신 재고 비교해, 새벽에도 같은 기준으로 승격이나 롤백을 정한다.' },
    { q: 'p95-latency에 successCondition <= 300, failureCondition > 500을 함께 주면 400ms 측정은 어떻게 되는가?',
      o: ['Inconclusive가 되어 Rollout이 멈추고 사람을 기다린다', '통과로 본다', '곧바로 Failed가 된다'], a: 0,
      why: '두 조건을 다 주면 어느 쪽에도 맞지 않는 값은 Inconclusive다. 500ms를 넘을 때만 실패로 센다.' },
    { q: 'Rollout steps에서 analysis 단계를 setWeight 바로 뒤에 두는 이유는 무엇인가?',
      o: ['analysis가 트래픽 비율을 정하기 때문에', 'Template을 만들려면 Rollout이 먼저 있어야 해서', '비율을 올린 뒤 그 트래픽으로 판정하고, 통과해야 다음 setWeight로 가게 하려고'], a: 2,
      why: 'setWeight 10 → analysis → setWeight 30처럼 올리고 확인하는 리듬이 된다. 판정이 통과하지 않으면 다음 단계로 넘어가지 않는다.' },
    { q: 'failureLimit: 2인 error-rate가 8.7%, 9.1%로 두 번 실패했다. AnalysisRun은 지금 어떤 상태인가?',
      o: ['아직 Failed가 아니다. 세 번째 실패가 나와야 Failed다', '이미 Failed이고 롤백 중이다', 'Successful이다'], a: 0,
      why: 'failureLimit은 허용하는 실패 수다. 실패가 2를 넘는 세 번째에 Failed가 되고, 그때 canary 트래픽이 0%로 돌아간다.' },
    { q: '트래픽이 없는 시간에 배포했더니 error-rate가 NaN으로 나와 매번 롤백된다. 알맞은 처방은?',
      o: ['successCondition을 지운다', '분모에 clamp_min을 걸고 count를 늘려 초기 샘플을 흡수한다', 'interval을 1초로 줄인다'], a: 1,
      why: '0/0은 NaN이고 NaN은 조건을 통과하지 못한다. 분모의 하한을 두고 여러 샘플로 판정하면 오탐이 사라진다.' },
  ];

  const summary = [
    '단계마다 사람이 대시보드를 보면 새벽 배포가 막히고 판정 기준이 사람마다 달라진다.',
    'AnalysisTemplate은 error-rate 5%, p95 300ms처럼 성공 조건을 적고 args로 서비스를 받는다.',
    'Rollout steps에 analysis를 끼우면 통과할 때만 다음 setWeight로 간다.',
    'failureLimit 2면 세 번째 실패에서 Failed가 되고 canary 트래픽이 0%로 돌아간다.',
  ];
  const review = [
    { q: '자동 분석을 붙인 뒤 정상 배포가 자주 롤백된다. 평소 error-rate는 3%이고 기준은 5%다. 먼저 손볼 것은?',
      o: ['provider를 Datadog으로 바꾼다', '임계값을 baseline에 맞추거나 stable과 상대 비교한다', 'setWeight를 100으로 올린다'], a: 1,
      why: '평소 값과 기준 사이가 좁으면 작은 흔들림도 실패로 쌓인다. baseline을 근거로 기준을 잡거나 canary를 stable과 비교한다.' },
    { q: 'AnalysisRun이 측정값 없이 Error로 끝났다. 배포 전에 했어야 할 점검은?',
      o: ['Prometheus 주소와 인증을 curl로 확인하기', 'failureLimit을 0으로 낮추기', 'canary 비율을 10%로 올리기'], a: 0,
      why: '주소 오타나 토큰 만료면 질의 자체가 실패해 값이 없다. 연속 에러가 한도를 넘으면 AnalysisRun이 Error가 된다.' },
    { q: 'interval 10s · count 1로 두었더니 GC 스파이크 한 번에 롤백됐다. 다음 중 알맞은 설정은?',
      o: ['count 1 그대로 두고 기준을 0.999로 올린다', 'analysis 단계를 지운다', 'interval 30s · count 5 · failureLimit 2로 여러 번 잰다'], a: 2,
      why: '측정을 나눠 여러 번 하면 스파이크 한두 번은 failureLimit 안에서 흡수된다. 진짜 문제라면 실패가 계속 쌓여 Failed가 된다.' },
  ];

  R.page({ title: 'AnalysisRun 자동 판정', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
