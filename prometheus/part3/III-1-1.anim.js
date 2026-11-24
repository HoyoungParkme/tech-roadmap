/* III-1-1 Recording Rule — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: 1.2초·20곳·30초·7천만 샘플·50ms 는 페이지 시나리오 값, 48초/분·24배·3.2초/분·2016배는 그 값으로 계산한 것.
 * 버킷 개수(pod-a·pod-b)와 그래프 곡선은 "예시"다. histogram_quantile 값 0.68s 는 그 예시 버킷을 Prometheus 규칙(선형 보간)으로 계산한 값. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ex = (x, y, op) => tx(x, y, '예시 값', { 'font-size': 13.5, fill: MUT, opacity: op ?? 1 });
  // 작은 Grafana 패널: 제목 띠 + 꺾은선
  function panel(cx, cy, w, h, o) { o = o || {}; const g = card(cx, cy, w, h, { rx: 6, sw: 1.6, stroke: o.stroke || GRID, s: o.s, op: o.op });
    el('line', { x1: -w / 2, y1: -h / 2 + 10, x2: w / 2, y2: -h / 2 + 10, stroke: o.stroke || GRID, 'stroke-width': 1.2 }, g);
    if (o.spin) { el('circle', { cx: 0, cy: 6, r: 8, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '30 20', transform: `rotate(${o.spin} 0 6)` }, g); return g; }
    if (o.nodata) { tx(0, 10, 'No data', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: BAD }, g); return g; }
    const pts = [0.5, 0.35, 0.6, 0.4, 0.55, 0.3, 0.45].map((v, i) => `${-w / 2 + 6 + i * (w - 12) / 6},${-h / 2 + 14 + v * (h - 20)}`).join(' ');
    el('polyline', { points: pts, fill: 'none', stroke: o.line || INFO, 'stroke-width': 2 }, g); return g; }

  // ---------- 1. 문제: 30초마다 같은 무거운 쿼리 ----------
  const Q1 = 'histogram_quantile(0.99, sum by (le, service) (', Q2 = '  rate(http_request_duration_seconds_bucket{service="checkout-api"}';
  function qbox(hi, s) { el('rect', { x: 24, y: 12, width: 912, height: 68, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: s });
    const on = (i) => (hi === i ? { fill: ACC, 'font-weight': 800 } : { fill: INK });
    spans(42, 40, [[Q1, on(1)]], { 'font-size': 14.5, opacity: s });
    spans(42, 66, [[Q2, on(2)], ['[7d]', hi === 2 ? { fill: BAD, 'font-weight': 800 } : on(2)], [')))', on(3)]], { 'font-size': 14.5, opacity: s }); }
  const LES = ['0.05', '0.1', '0.25', '0.5', '1', '+Inf'], PA = [300, 520, 580, 594, 598, 600], PB = [280, 500, 570, 590, 597, 600], PS = PA.map((v, i) => v + PB[i]);
  function s1(t, c) { const { k, u } = c;
    qbox(k === 1 ? 1 : k === 2 ? 2 : k === 3 ? 3 : 0, k === 0 ? fade(u, 0.1, 0.5) : 1);
    if (k === 0 || k === 5) { // 패널 20곳
      for (let r = 0; r < 4; r++) for (let q = 0; q < 5; q++) { const i = r * 5 + q, cx = 72 + q * 66, cy = 128 + r * 50;
        panel(cx, cy, 58, 40, { s: k === 0 ? pop(u, 0.15 + i * 0.03, 0.5) : 1, spin: k === 5 && E(u, 0.3 + i * 0.09, 0.9 + i * 0.09) < 1 ? t * 400 : null, stroke: k === 5 && E(u, 0.3 + i * 0.09, 0.9 + i * 0.09) < 1 ? WARN : GRID }); }
      note(40, 344, '대시보드 4개 × 팀 5곳 = 패널 20곳', k === 0 ? fade(u, 0.8) : 1); }
    if (k === 0) { const f = ((t % 1.5) / 1.5);
      clock(440, 150, 26, f, ACC); mono(440, 200, 'refresh 30s', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700 });
      server(790, 220, 'Prometheus', { lamp: BAD });
      for (let i = 0; i < 20; i++) { const r = Math.floor(i / 5), q = i % 5; dot([[72 + q * 66 + 30, 128 + r * 50], [500, 230], [730, 220]], seg(u, 0.9 + i * 0.05, 1.9 + i * 0.05), ACC, 4.5); }
      note(560, 330, '20곳이 같은 쿼리를 30초마다 다시 보낸다', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 1) { // 버킷을 le 별로 더한다
      [[PA, 'pod-a', 110], [PB, 'pod-b', 240]].forEach(([vals, name, y0], j) => { note(40, y0 + 2, name + ' 누적 버킷', 1, { 'font-size': 14 });
        vals.forEach((v, i) => { const h = 70 * v / 600 * E(u, 0.2 + j * 0.2, 1.0 + j * 0.2); el('rect', { x: 40 + i * 40, y: y0 + 90 - h, width: 30, height: h, rx: 3, fill: INFO, opacity: 0.75 }); }); });
      grow(300, 225, 386, 225, E(u, 1.0, 1.4), ACC); tx(343, 212, 'sum by le', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.1) });
      const gu = E(u, 1.2, 1.9);
      PS.forEach((v, i) => { const x = 420 + i * 82, h = 150 * v / 1200 * gu; el('rect', { x, y: 290 - h, width: 56, height: h, rx: 4, fill: ACC, opacity: 0.8 });
        mono(x + 28, 290 - h - 7, String(v), { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.7) });
        mono(x + 28, 310, LES[i], { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
      const lu = E(u, 2.0, 2.6), mx = 610 + 290 * (4 / 11);
      tx(420, 378, '0.99 × 1200 = 1188번째', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.9) });
      el('line', { x1: 610, y1: 372, x2: lerp(610, 900, lu), y2: 372, stroke: MUT, 'stroke-width': 2 });
      if (lu > 0) { [[610, '0.5', '1184'], [900, '1', '1195']].forEach(([x, le, n]) => { if (lu < 1 && x > 610) return; el('line', { x1: x, y1: 364, x2: x, y2: 380, stroke: MUT, 'stroke-width': 2 });
          mono(x, 400, 'le=' + le, { 'font-size': 13.5, 'text-anchor': x > 610 ? 'end' : 'middle', fill: MUT }); mono(x, 354, n, { 'font-size': 13.5, 'text-anchor': x > 610 ? 'end' : 'middle', fill: MUT }); }); }
      if (lu >= 1) { el('circle', { cx: mx, cy: 372, r: 7, fill: ACC }); mono(mx, 354, 'p99 ≈ 0.68s', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); }
      ex(40, 400, fade(u, 2.2)); return; }
    if (k === 2) { const x0 = 70, x1 = 890, y = 300, sw = E(u, 0.3, 2.3), sx = lerp(x0, x1, sw);
      el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: MUT, 'stroke-width': 2 });
      ['-7d', '-6d', '-5d', '-4d', '-3d', '-2d', '-1d', '지금'].forEach((s, i) => { const x = lerp(x0, x1, i / 7); el('line', { x1: x, y1: y, x2: x, y2: y + 6, stroke: MUT }); mono(x, y + 24, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
      for (let i = 0; i < 168; i++) for (let r = 0; r < 5; r++) { const x = lerp(x0, x1, (i + 0.5) / 168); el('circle', { cx: x, cy: 196 + r * 20, r: 2.2, fill: x < sx ? ACC : OFF, opacity: x < sx ? 0.9 : 0.6 }); }
      el('rect', { x: sx - 2, y: 180, width: 4, height: 128, fill: BAD });
      const n = Math.round(70000000 * sw);
      mono(480, 136, n.toLocaleString('en-US'), { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: sw >= 1 ? BAD : INK });
      sub(480, 160, '이번 호출 한 번이 훑는 샘플 (약 7천만)', 1, { 'font-size': 14.5 });
      note(70, 376, '[7d] 가 들어간 rate 는 호출마다 일주일치를 처음부터 읽는다', fade(u, 2.3), { fill: BAD }); return; }
    if (k === 3) { // 7천만 → 1개
      for (let i = 0; i < 120; i++) { const q = i % 12, r = Math.floor(i / 12); el('circle', { cx: 70 + q * 20, cy: 120 + r * 20, r: 3.2, fill: INFO, opacity: 0.25 + 0.6 * (1 - E(u, 0.4, 1.4) * (q / 12)) }); }
      note(70, 344, '샘플 약 7천만', 1, { 'font-size': 14.5 });
      const fu = E(u, 0.5, 1.4); el('path', { d: 'M330,110 L520,200 L520,240 L330,330 Z', fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fu });
      tx(425, 226, '계산', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fu });
      const ax = R.axes(580, 130, 320, 150, { x: [0, 6], y: [0, 1] });
      R.line(ax, [[0, 0.5], [1, 0.42], [2, 0.6], [3, 0.48], [4, 0.66], [5, 0.52], [6, 0.58]], E(u, 1.2, 2.0), ACC, { sw: 3 });
      note(580, 314, '결과 = 시계열 1개', fade(u, 1.6));
      clock(780, 360, 20, E(u, 1.4, 2.4), BAD); mono(812, 366, '1.2s', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      note(70, 396, '30초 뒤 같은 계산을 처음부터 다시 한다', fade(u, 2.2), { fill: BAD }); cross(40, 391, 8, pop(u, 2.2)); return; }
    if (k === 4) { const items = [['패널 20곳', INK], ['× 2번 / 분', INK], ['= 40 호출 / 분', ACC], ['× 1.2s', INK], ['= 48s / 분', BAD]];
      let x = 60; items.forEach(([s, col], i) => { const w = tw(s, 16) + 30; card(x + w / 2, 150, w, 44, { rx: 22, text: s, fs: 16, fw: 800, color: col, stroke: col === INK ? GRID : col, s: pop(u, 0.2 + i * 0.28), mono: true }); x += w + 14; });
      const bx = 120, bw = 720, f = E(u, 1.6, 2.5) * 48 / 60;
      el('rect', { x: bx, y: 250, width: bw, height: 34, rx: 6, fill: SOFT, stroke: GRID });
      el('rect', { x: bx, y: 250, width: bw * f, height: 34, rx: 6, fill: BAD, opacity: 0.85 });
      [0, 15, 30, 45, 60].forEach((s) => mono(bx + bw * s / 60, 306, s + 's', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
      mono(bx + bw * f - 8, 273, Math.round(f * 60) + 's', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'end', opacity: f > 0.1 ? 1 : 0 });
      note(120, 238, '1분 = 60초 중 이 쿼리가 차지하는 시간', fade(u, 1.5), { 'font-size': 14, fill: MUT });
      banner(480, 360, '코어 하나가 80% 를 이 쿼리에만 쓴다', pop(u, 2.4)); return; }
    // k5: 증상
    const L = [['p99 latency', 1.2], ['error rate', 0.8], ['qps', 0.9]];
    note(450, 110, '쿼리 하나의 비용', 1, { fill: MUT, 'font-size': 14 });
    L.forEach(([n, s], i) => { const y = 130 + i * 40; mono(450, y + 15, n, { 'font-size': 14, 'font-weight': 700 }); R.hbar(570, y, 240, s, 1.2, { col: WARN, text: s + 's', u: E(u, 0.2 + i * 0.2, 0.9 + i * 0.2) }); });
    card(600, 290, 290, 40, { rx: 20, text: '대시보드 첫 로드 5~7초', fs: 15, fw: 800, stroke: BAD, color: BAD, s: pop(u, 1.4) });
    pill(520, 350, '알림 평가도 밀린다', WARN, pop(u, 1.8), { fs: 14 });
    pill(740, 350, 'ad-hoc 쿼리 여유 없음', BAD, pop(u, 2.1), { fs: 14 }); }

  // ---------- 2. Recording Rule 파일을 쌓는다 ----------
  const FL = [[0, 'groups:'], [1, '- name: checkout-api-aggregates'], [1, '  interval: 60s'], [1, '  rules:'], [2, '  - record: job:checkout_api_p99:5m'],
    [3, '    expr: histogram_quantile(0.99, …[7d])'], [5, '    labels: { sli_type: latency }'], [6, '  - record: job:checkout_api_error_rate:5m'], [7, '    expr: sum(rate(5xx)) / sum(rate(전체))']];
  const HL = [[0], [1, 2], [4], [5], [5], [6], [7], [8], [4, 7]];
  function file(k, u) { el('rect', { x: 20, y: 84, width: 450, height: 326, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(36, 108, 'recording-rules.yml', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    FL.forEach(([at, s], i) => { if (at > k) return; const y = 140 + i * 30, hot = HL[k].includes(i);
      if (hot) el('rect', { x: 28, y: y - 20, width: 434, height: 28, rx: 5, fill: ACCBG, opacity: at === k ? fade(u, 0.1) : 1 });
      let str = s; if (i === 5 && k >= 4) str = '    expr: histogram_quantile(0.99, …[5m])';
      const op = at === k ? fade(u, 0.15, 0.5) : 1;
      if (i === 5 && k === 4) { spans(36, y, [['    expr: histogram_quantile(0.99, …', {}], [u < 1.2 ? '[7d]' : '[5m]', { fill: u < 1.2 ? BAD : ACC, 'font-weight': 800 }], [')', {}]], { 'font-size': 14 }); return; }
      mono(36, y, str, { 'font-size': 14, opacity: op, 'font-weight': hot ? 700 : 400 }); }); }
  function s2(t, c) { const { k, u } = c; file(k, u); const X = 705;
    if (k === 0) { zone(500, 100, 430, 250, 'groups', { dash: '6 5', stroke: GRID, fill: 'none', op: fade(u, 0.3) });
      [0, 1].forEach((i) => card(X, 170 + i * 90, 360, 58, { rx: 8, dash: '5 5', stroke: GRID, text: i ? '그룹 …' : '그룹 1', fs: 15, color: MUT, s: pop(u, 0.7 + i * 0.4) }));
      note(500, 390, '최상위 키는 groups 하나, 그 아래에 그룹을 나열한다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 1) { const x0 = 520, x1 = 910, y = 250, sw = E(u, 0.3, 2.4);
      clock(X, 150, 34, sw >= 1 ? 1 : (sw * 5) % 1, ACC); mono(X, 210, 'interval: 60s', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
      el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: MUT, 'stroke-width': 2 });
      for (let m = 0; m <= 5; m++) { const x = lerp(x0, x1, m / 5), on = sw * 5 >= m - 0.02;
        el('circle', { cx: x, cy: y, r: on ? 8 : 5, fill: on ? ACC : OFF }); mono(x, y + 28, m ? m + 'm' : '0', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
      note(500, 330, '1분마다 그룹 안 룰을 위에서부터 차례로 평가', fade(u, 1.2), { 'font-size': 14.5 });
      sub(X, 370, 'interval 을 빼면 global.evaluation_interval 을 따른다', fade(u, 1.8)); return; }
    if (k === 2 || k === 8) { const parts = [['job', '집계 레벨', INFO], ['checkout_api_p99', '메트릭', INK], ['5m', '연산·창', ACC]];
      let x = 510; const y = k === 8 ? 140 : 200;
      parts.forEach(([s, n, col], i) => { const w = tw(s, 20), sc = k === 2 ? pop(u, 0.3 + i * 0.4) : 1;
        mono(x, y, s, { 'font-size': 20, 'font-weight': 800, fill: col, opacity: sc });
        if (i < 2) mono(x + w + 2, y, ':', { 'font-size': 20, 'font-weight': 800, fill: MUT, opacity: sc });
        el('path', { d: `M${x},${y + 12} v8 h${w} v-8`, fill: 'none', stroke: col, 'stroke-width': 2, opacity: sc });
        tx(x + w / 2, y + 40, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: sc });
        x += w + 18; });
      if (k === 2) { note(510, 320, '이 이름이 대시보드가 읽을 새 메트릭이 된다', fade(u, 1.7), { 'font-size': 14.5 }); return; }
      [['job', 'http_requests', 'rate5m'], ['instance', 'node_cpu', 'rate1m'], ['job', 'checkout_api_error_rate', '5m']].forEach(([a, b, d], i) => {
        const y2 = 240 + i * 46, op = fade(u, 0.5 + i * 0.4); spans(510, y2, [[a, { fill: INFO, 'font-weight': 700 }], [':', { fill: MUT }], [b, {}], [':', { fill: MUT }], [d, { fill: ACC, 'font-weight': 700 }]], { 'font-size': 15, opacity: op }); });
      sub(705, 395, '이름만 봐도 무엇을 어떤 창으로 집계했는지 보인다', fade(u, 2)); return; }
    if (k === 3) { fly(705, 110, 250, 290, seg(u, 0.2, 1.2), 'histogram_quantile(0.99, …[7d])', { mono: true });
      clock(600, 220, 30, E(u, 1.2, 2.2), WARN); mono(650, 214, '계산은 여전히 1.2s', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
      clock(600, 310, 30, 1, ACC); mono(650, 304, '하지만 1분에 1번만', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      sub(720, 384, '대시보드가 몇 곳이든 계산 횟수는 그대로', fade(u, 2.2)); return; }
    if (k === 4) { const f = E(u, 0.4, 1.6), w = lerp(400, 4, f);
      el('rect', { x: 510, y: 160, width: 400, height: 36, rx: 6, fill: SOFT, stroke: GRID });
      el('rect', { x: 910 - w, y: 160, width: w, height: 36, rx: 6, fill: f < 1 ? BAD : ACC, opacity: 0.85 });
      mono(510, 150, '[7d] = 10,080분', { 'font-size': 14.5, fill: MUT, opacity: 1 - f });
      mono(910, 222, '[5m]', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.5) });
      mono(510, 276, '10,080 ÷ 5 = 2,016', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.7) });
      note(510, 306, '읽는 구간이 2,016분의 1로 줄어든다', fade(u, 1.9), { 'font-size': 14.5 });
      sub(705, 370, '창이 다르면 다른 값이다. 이름 끝 :5m 이 그 표시', fade(u, 2.3)); return; }
    if (k === 5) { mono(510, 140, 'job:checkout_api_p99:5m', { 'font-size': 16, 'font-weight': 800 });
      mono(510, 168, '{service="checkout-api",', { 'font-size': 15 });
      card(512 + tw(' sli_type="latency"}', 15) / 2, 190, tw(' sli_type="latency"}', 15) + 12, 28, { rx: 6, fill: ACCBG, stroke: ACC, sw: 1.5, text: 'sli_type="latency"}', fs: 15, fw: 800, color: ACC, mono: true, s: pop(u, 0.4) });
      const ax = R.axes(520, 250, 380, 100, { x: [0, 6], y: [0, 1] }); tx(520, 240, 'TSDB 에 쌓이는 새 시계열', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      const n = Math.floor(E(u, 0.9, 2.5) * 7); const V = [0.55, 0.5, 0.62, 0.48, 0.58, 0.52, 0.6];
      for (let i = 0; i < n; i++) el('circle', { cx: ax.X(i), cy: ax.Y(V[i]), r: 5, fill: ACC });
      mono(900, 380, '1분에 점 하나', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.5) }); return; }
    if (k === 6) { el('rect', { x: 500, y: 110, width: 420, height: 200, rx: 10, fill: SOFT });
      tx(516, 134, '그룹 checkout-api-aggregates · 60s', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      card(710, 180, 380, 44, { rx: 8, text: '① job:checkout_api_p99:5m', fs: 14.5, mono: true });
      card(710, 260, 380, 44, { rx: 8, text: '② job:checkout_api_error_rate:5m', fs: 14.5, mono: true, stroke: ACC, s: pop(u, 0.3) });
      grow(710, 204, 710, 236, E(u, 1.0, 1.5), ACC);
      note(500, 350, '같은 평가 시각에 ① 다음 ② 차례로', fade(u, 1.6), { 'font-size': 14.5 });
      mono(920, 390, '룰 2개', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 1.8) }); return; }
    // k7: 5xx / 전체
    const g = E(u, 0.3, 1.2);
    mono(510, 140, 'sum(rate(…{code=~"5.."}[5m]))', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.2) });
    el('rect', { x: 510, y: 152, width: 400 * g, height: 26, rx: 4, fill: SOFT, stroke: GRID });
    el('rect', { x: 510, y: 152, width: 40 * g, height: 26, rx: 4, fill: BAD });
    el('line', { x1: 510, y1: 200, x2: 910, y2: 200, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 1.0) });
    mono(510, 232, 'sum(rate(…[5m]))  전체', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.1) });
    el('rect', { x: 510, y: 244, width: 400 * E(u, 1.1, 1.8), height: 26, rx: 4, fill: INFO, opacity: 0.6 });
    note(510, 320, '분자·분모 모두 rate 로 맞춰야 비율이 된다', fade(u, 1.9), { 'font-size': 14.5 });
    sub(710, 360, '결과는 0~1 사이 에러 비율', fade(u, 2.2)); }

  // ---------- 3. 등록·검사·reload ----------
  function prom(cx, cy, o) { o = o || {}; server(cx, cy, 'Prometheus', { lamp: o.lamp || OFF }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const sw = E(u, 0.3, 2.5), x0 = 330, x1 = 900;
      clock(150, 160, 40, sw >= 1 ? 1 : (sw * 4) % 1, INFO, null); lbl(150, 225, 'scrape 15s', 1, { fill: INFO });
      clock(150, 300, 40, sw, ACC, null); lbl(150, 365, 'evaluation 60s', 1, { fill: ACC });
      [[160, [0, 15, 30, 45, 60], INFO, '메트릭 수집'], [300, [0, 60], ACC, '룰 평가']].forEach(([y, ts, col, name]) => {
        el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 2 }); tx(x0, y - 22, name, { 'font-size': 14, 'font-weight': 700, fill: col });
        ts.forEach((s) => { const x = lerp(x0, x1, s / 60), on = sw * 60 >= s - 0.3; el('circle', { cx: x, cy: y, r: on ? 9 : 5, fill: on ? col : OFF }); mono(x, y + 28, s + 's', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }); });
      el('line', { x1: lerp(x0, x1, sw), y1: 130, x2: lerp(x0, x1, sw), y2: 330, stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }); return; }
    if (k === 1) { prom(700, 210, { lamp: WARN });
      ['recording-rules.yml', 'alert-rules.yml'].forEach((s, i) => { const y = 150 + i * 120; card(220, y, 250, 48, { rx: 8, text: s, fs: 15, mono: true, s: pop(u, 0.2 + i * 0.3) });
        grow(348, y, 636, 200 + i * 20, E(u, 0.8 + i * 0.3, 1.4 + i * 0.3), ACC); });
      mono(560, 110, 'rule_files:', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      pill(700, 320, 'reload 전까지는 반영되지 않는다', WARN, pop(u, 1.9), { fs: 14 }); return; }
    if (k === 2) { server(200, 210, 'checkout-api:8080', { lamp: GOOD }); prom(720, 210, { lamp: WARN });
      mono(200, 120, 'GET /metrics', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.3) });
      grow(640, 180, 280, 180, E(u, 0.3, 0.9), INFO, { dash: '6 5' });
      for (let i = 0; i < 4; i++) dot([[262, 230], [656, 230]], seg(u, 0.9 + i * 0.4, 1.6 + i * 0.4), INFO, 6);
      mono(460, 258, '…_bucket{le="…"}', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) });
      note(300, 340, 'Prometheus 가 15초마다 당겨 간다 (pull)', fade(u, 1.8), { 'font-size': 15 });
      sub(480, 372, '룰이 계산할 원본 메트릭은 여기서 들어온다', fade(u, 2.2)); return; }
    if (k === 3) { terminal(120, 110, 720, 170, ['$ promtool check rules recording-rules.yml', 'Checking recording-rules.yml', '  SUCCESS: 2 rules found'], lerp(0, 3, E(u, 0.2, 2.0)), { title: 'bash' });
      check(480, 340, 18, pop(u, 2.1)); note(510, 346, '문법·라벨·이름을 배포 전에 걸러 낸다', fade(u, 2.1)); return; }
    if (k === 4) { const N = [['PR 머지', 130], ['ConfigMap', 345], ['reloader sidecar', 575], ['Prometheus', 820]];
      N.forEach(([s, x], i) => { if (i === 3) prom(x, 200, { lamp: WARN }); else card(x, 200, 170, 50, { rx: 10, text: s, fs: 15, s: pop(u, 0.2 + i * 0.25) });
        if (i < 3) grow(x + 88, 200, N[i + 1][0] === 'Prometheus' ? x + 170 : N[i + 1][1] - 88, 200, E(u, 0.4 + i * 0.3, 0.8 + i * 0.3), MUT); });
      dot([[130, 200], [345, 200], [575, 200], [762, 200]], seg(u, 0.9, 2.1), ACC, 7);
      pill(560, 330, '디스크의 파일만 바뀌었다. 메모리 속 룰은 아직 옛 것', WARN, pop(u, 2.2), { fs: 14 }); return; }
    if (k === 5) { prom(640, 210, { lamp: u > 1.4 ? GOOD : WARN });
      fly(140, 150, 300, 150, seg(u, 0.2, 1.1), 'POST /-/reload', { mono: true, stay: true }); grow(390, 165, 570, 195, E(u, 1.0, 1.4), ACC);
      mono(200, 260, 'kill -HUP <pid>', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); tx(200, 236, '또는', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      ['checkout-api-aggregates', 'alert-rules.yml 의 그룹'].forEach((s, i) => { const y = 150 + i * 40; check(760, y, 9, pop(u, 1.5 + i * 0.3)); tx(778, y + 5, s, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.5 + i * 0.3) }); });
      note(470, 340, '프로세스는 그대로, 룰만 새것으로', fade(u, 1.9));
      sub(480, 372, 'HTTP reload 는 --web.enable-lifecycle 로 띄웠을 때만 열린다', fade(u, 2.2)); return; }
    terminal(120, 100, 720, 160, ['$ curl -s prometheus:9090/api/v1/rules \\', '    | jq ".data.groups[].name"', '"checkout-api-aggregates"'], lerp(0, 3, E(u, 0.2, 1.8)), { title: 'bash' });
    [['rule_files 등록', 0], ['promtool check', 1], ['reload', 2], ['API 로 확인', 3]].forEach(([s, i]) => { const x = 180 + i * 200; card(x, 330, 170, 40, { rx: 20, text: s, fs: 14.5, stroke: GOOD, color: INK, s: pop(u, 1.9 + i * 0.15) }); }); }

  // ---------- 4. 효과 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { panel(170, 220, 220, 150, { s: 1, line: ACC });
      const g = E(u, 0.3, 1.0); card(600, 150, 560, 46, { rx: 8, text: 'histogram_quantile(0.99, sum by (le, service) (rate(…[7d])))', fs: 13.5, mono: true, color: MUT, op: 1 - 0.6 * g });
      el('line', { x1: 330, y1: 150, x2: lerp(330, 870, g), y2: 150, stroke: BAD, 'stroke-width': 3 });
      card(600, 260, 420, 50, { rx: 8, text: 'job:checkout_api_p99:5m', fs: 17, fw: 800, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.2) });
      grow(484, 260, 286, 230, E(u, 1.6, 2.1), ACC);
      note(330, 360, '패널은 계산하지 않고 저장된 값만 읽는다', fade(u, 2.2)); return; }
    if (k === 1) { const a = tween(1.2, 0.05, u, 1.6);
      tx(120, 168, '이전 쿼리', { 'font-size': 15, 'font-weight': 700 }); R.hbar(250, 152, 560, 1.2, 1.2, { col: BAD, text: '1.2s', h: 26 });
      tx(120, 238, 'record 조회', { 'font-size': 15, 'font-weight': 700 }); R.hbar(250, 222, 560, a, 1.2, { col: GOOD, text: Math.round(a * 1000) + 'ms', h: 26 });
      mono(480, 320, '1.2s ÷ 0.05s = 24배', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.9) });
      sub(480, 352, '평균 50ms · instant query 로 값 하나를 읽는다', fade(u, 2.2)); return; }
    if (k === 2) { const ax = R.axes(360, 150, 240, 120, { x: [0, 6], y: [0, 1] }); tx(360, 140, 'job:checkout_api_p99:5m', { 'font-size': 14.5, 'font-weight': 800, class: 'mono', fill: ACC });
      R.line(ax, [[0, 0.4], [1, 0.45], [2, 0.38], [3, 0.5], [4, 0.44], [5, 0.48], [6, 0.42]], E(u, 0.2, 0.9), ACC, { sw: 3 });
      panel(150, 210, 150, 100, { line: ACC }); lbl(150, 290, 'Grafana 패널');
      card(800, 210, 200, 80, { rx: 10, text: 'alert HighLatency\n> 0.2', fs: 15, mono: true, stroke: WARN, s: pop(u, 0.9) });
      grow(352, 210, 232, 210, E(u, 0.9, 1.3), ACC); grow(608, 210, 696, 210, E(u, 1.2, 1.6), ACC);
      note(300, 360, '대시보드와 알림이 같은 숫자를 본다', fade(u, 1.9)); return; }
    if (k === 3) { const ax = R.axes(110, 110, 760, 210, { x: [0, 14], y: [0, 0.4], yt: [0, 0.2, 0.4], xt: [0, 5, 10], xl: '분', yl: 'p99 (s)' });
      const P = [[0, 0.12], [1, 0.14], [2, 0.13], [3, 0.24], [4, 0.27], [5, 0.25], [6, 0.29], [7, 0.31], [8, 0.3], [9, 0.32], [10, 0.33], [11, 0.31], [12, 0.34], [13, 0.33], [14, 0.32]];
      el('line', { x1: ax.X(0), y1: ax.Y(0.2), x2: ax.X(14), y2: ax.Y(0.2), stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '6 4' });
      const pu = E(u, 0.9, 1.6), fu = E(u, 1.6, 2.2);
      el('rect', { x: ax.X(3), y: 110, width: (ax.X(8) - ax.X(3)) * pu, height: 210, fill: WARN, opacity: 0.15 });
      el('rect', { x: ax.X(8), y: 110, width: (ax.X(14) - ax.X(8)) * fu, height: 210, fill: BAD, opacity: 0.15 });
      R.line(ax, P, E(u, 0.1, 1.0), ACC, { sw: 3 });
      tx(ax.X(5.5), 134, 'pending 5m', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: pu });
      tx(ax.X(11), 134, 'firing', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fu });
      mono(ax.X(14), ax.Y(0.2) + 20, '0.2s', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end' }); ex(110, 400, fade(u, 1.2));
      pill(640, 392, 'summary: p99 > 200ms', WARN, pop(u, 2.2), { fs: 13.5, mono: true }); return; }
    if (k === 4) { const rows = [['이전', 48, BAD, '40호출 × 1.2s'], ['이후', 3.2, GOOD, '1.2s + 40 × 0.05s']];
      tx(120, 110, '1분에 Prometheus 가 쓰는 계산 시간', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      rows.forEach(([n, v, col, f], i) => { const y = 140 + i * 80; tx(120, y + 20, n, { 'font-size': 16, 'font-weight': 800 });
        R.hbar(190, y, 560, v, 48, { col, text: v + 's', h: 28, u: E(u, 0.2 + i * 0.5, 1.0 + i * 0.5) }); mono(190, y + 52, f, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6 + i * 0.5) }); });
      [['무거운 계산 40/분 → 1/분', 260], ['첫 로드 5~7초 → 0.5초', 520], ['CPU 80% → 약 5%', 760]].forEach(([s, x], i) => pill(x, 360, s, GOOD, pop(u, 1.8 + i * 0.2), { fs: 14 })); return; }
    // k5: 이름은 계약
    panel(150, 170, 170, 110, { nodata: u > 1.0 });
    card(480, 130, 320, 40, { rx: 8, text: 'job:checkout_api_p99:5m', fs: 15, mono: true, stroke: u > 1 ? BAD : ACC, color: u > 1 ? BAD : ACC });
    if (u > 0.4) { el('line', { x1: 330, y1: 130, x2: lerp(330, 630, E(u, 0.4, 0.9)), y2: 130, stroke: BAD, 'stroke-width': 3 }); }
    card(480, 182, 320, 40, { rx: 8, text: 'job:checkout_p99_latency:5m', fs: 15, mono: true, s: pop(u, 0.7) });
    note(250, 250, '이름을 바꾸면 그 이름을 쓰던 패널·알림이 비어 버린다', fade(u, 1.2), { fill: BAD, 'font-size': 14.5 });
    ['…:5m', '…:30m'].forEach((s, i) => card(330 + i * 200, 330, 170, 42, { rx: 8, text: s, fs: 15, mono: true, stroke: i ? ACC : GRID, s: pop(u, 1.7 + i * 0.3) }));
    note(640, 336, '창 하나 = record 하나 = 시계열 하나 더', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 5. 룰을 감시하는 룰 ----------
  const META = [['SlowRecordingRule', 2], ['RuleEvaluationFailures', 4], ['ConfigReloadFailed', 5]];
  function metaCard(k, u) { el('rect', { x: 20, y: 90, width: 320, height: 260, rx: 10, fill: SOFT, opacity: k === 1 ? fade(u, 0.2) : 1 });
    mono(36, 116, 'group: prometheus-meta', { 'font-size': 14.5, 'font-weight': 800, opacity: k === 1 ? fade(u, 0.3) : 1 });
    META.forEach(([n, at], i) => { const y = 160 + i * 62, on = k >= at, cur = k === at;
      card(180, y, 290, 46, { rx: 8, dash: on ? null : '5 5', stroke: cur ? ACC : on ? INK : GRID, text: on ? n : '빈 자리', fs: 14, mono: on, color: on ? INK : MUT, s: cur ? pop(u, 0.2) : 1 }); });
    const n = META.filter(([, at]) => k >= at).length; mono(36, 334, '메타 알람 ' + n + '개', { 'font-size': 14.5, 'font-weight': 700, fill: ACC }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const L = [['대시보드 · 알림', 120], ['record 시계열', 210], ['룰 평가', 300]];
      L.forEach(([s, y], i) => card(300, y, 340, 60, { rx: 10, text: s, fs: 16, stroke: E(u, 0.8 + (2 - i) * 0.4, 1.2 + (2 - i) * 0.4) > 0.5 ? BAD : INK, color: INK, s: pop(u, 0.1 + i * 0.15) }));
      [300, 210].forEach((y, i) => grow(300, y - 32, 300, y - 58, E(u, 1.0 + i * 0.4, 1.3 + i * 0.4), BAD));
      server(720, 200, 'Prometheus', { lamp: ACC });
      el('path', { d: 'M780,170 C880,120 880,280 780,230', fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ahb)', opacity: fade(u, 1.6) });
      mono(720, 330, 'prometheus_rule_*', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) });
      sub(720, 356, '자기 메트릭으로 자기를 본다', fade(u, 2.0)); return; }
    metaCard(k, u);
    if (k === 1) { server(650, 210, 'Prometheus', { lamp: ACC }); grow(580, 200, 352, 200, E(u, 0.8, 1.4), ACC);
      note(420, 360, '룰 평가 자체를 감시하는 그룹을 따로 둔다', fade(u, 1.6)); return; }
    if (k === 2 || k === 3) { const ax = R.axes(420, 110, 470, 200, { x: [0, 20], y: [0, 2], yt: [0, 1, 2], xt: [0, 10, 20], xl: '분', yl: '평가 p99 (s)' });
      el('line', { x1: ax.X(0), y1: ax.Y(1), x2: ax.X(20), y2: ax.Y(1), stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '6 4' });
      const P = [[0, 0.4], [2, 0.45], [4, 0.5], [6, 0.8], [8, 1.2], [10, 1.3], [12, 1.25], [14, 1.4], [16, 1.35], [18, 1.5], [20, 1.45]];
      R.line(ax, P, k === 2 ? E(u, 0.2, 1.6) : 1, WARN, { sw: 3 }); ex(830, 100, 1);
      if (k === 2) { mono(ax.X(20), ax.Y(1) + 20, '> 1s', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.6) }); return; }
      const fu = E(u, 0.2, 1.2); el('rect', { x: ax.X(7.5), y: 110, width: (ax.X(17.5) - ax.X(7.5)) * fu, height: 200, fill: WARN, opacity: 0.15 });
      tx(ax.X(12.5), 132, 'for: 10m', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fu });
      pill(500, 392, 'team: observability', INFO, pop(u, 1.4), { fs: 13.5, mono: true }); pill(740, 392, 'runbook 링크', ACC, pop(u, 1.8), { fs: 13.5 }); return; }
    if (k === 4) { const ax = R.axes(420, 120, 470, 170, { x: [0, 10], y: [0, 1], xt: [0, 5, 10], xl: '분' });
      tx(420, 108, 'record 시계열', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      const V = [0.5, 0.55, 0.52, 0.6, null, 0.58, 0.62, 0.6, 0.57, 0.6, 0.55], n = Math.floor(E(u, 0.2, 1.6) * 11);
      for (let i = 0; i < n; i++) { if (V[i] == null) { cross(ax.X(i), ax.Y(0.58), 9, 1); continue; } el('circle', { cx: ax.X(i), cy: ax.Y(V[i]), r: 5, fill: ACC }); }
      if (n > 4) tx(ax.X(4), ax.Y(0.58) - 18, '평가 실패 = 빈 칸', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' });
      mono(420, 360, 'increase(…failures_total[10m]) > 0', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.7) });
      pill(820, 392, 'for: 0m · 즉시', BAD, pop(u, 2.1), { fs: 13.5 }); return; }
    if (k === 5) { const ax = R.axes(420, 140, 470, 150, { x: [0, 10], y: [0, 1], yt: [0, 1], xt: [0, 5, 10], xl: '분' });
      tx(420, 128, 'prometheus_config_last_reload_successful', { 'font-size': 14, 'font-weight': 700, class: 'mono' });
      R.line(ax, [[0, 1], [4, 1], [4, 0], [10, 0]], E(u, 0.2, 1.6), BAD, { sw: 3 });
      tx(ax.X(4) + 8, ax.Y(0) - 12, 'reload 실패', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      note(420, 360, '프로세스는 살아 있고 옛 설정으로 계속 돈다', fade(u, 1.8), { fill: BAD, 'font-size': 14.5 }); return; }
    // k6: CI
    const N = [['PR', 'PR 열기'], ['check', 'promtool check rules'], ['test', 'promtool test rules'], ['merge', '머지']];
    N.forEach(([, s], i) => { const y = 110 + i * 70; card(620, y, 300, 46, { rx: 23, text: s, fs: 15, mono: i === 1 || i === 2, stroke: i === 3 ? GOOD : INK, s: pop(u, 0.2 + i * 0.3) });
      if (i < 3) grow(620, y + 24, 620, y + 46, E(u, 0.5 + i * 0.3, 0.7 + i * 0.3), MUT); });
    fly(250, 180, 410, 180, seg(u, 1.4, 2.0), '깨진 룰', { fill: BAD, stay: true }); if (u > 2.0) cross(410, 150, 12, pop(u, 2.0));
    note(380, 395, '깨진 룰은 머지 전에 멈춘다', fade(u, 2.3), { fill: GOOD }); }

  const quiz = [
    { q: '이 상황에서 Prometheus CPU를 가장 많이 잡아먹는 원인은 무엇인가?',
      o: ['패널 수가 20개라서 그래프 그리기가 무겁다', '같은 [7d] 쿼리를 20곳이 30초마다 처음부터 다시 계산한다', 'scrape_interval이 15초로 짧다'], a: 1,
      why: '1.2초짜리 쿼리를 분당 40번 돌리면 1분에 48초를 쓴다. 계산 결과를 아무도 다시 쓰지 않는 것이 문제다.' },
    { q: 'recording rule이 하는 일은 무엇인가?',
      o: ['쿼리 결과를 브라우저에 캐시한다', 'PromQL 결과를 정해진 주기마다 계산해 새 이름의 시계열로 TSDB에 저장한다', '원본 메트릭을 지워 디스크를 아낀다'], a: 1,
      why: 'record에 적은 이름이 새 메트릭이 되고, interval 60s마다 한 번 계산해 점 하나씩 쌓는다.' },
    { q: 'rule_files에 파일을 등록하고 배포까지 했는데 /api/v1/rules에 그룹이 없다. 빠진 단계는 무엇인가?',
      o: ['reload(SIGHUP 또는 POST /-/reload)', 'scrape_interval 변경', 'Grafana 재시작'], a: 0,
      why: '디스크의 파일이 바뀌어도 Prometheus 메모리의 룰은 reload 전까지 옛것이다. reload는 재시작 없이 새 룰을 올린다.' },
    { q: 'record 이름 job:checkout_api_p99:5m을 나중에 바꾸면 생기는 일은 무엇인가?',
      o: ['옛 이름을 쓰던 패널과 알림이 데이터를 못 찾는다', 'Prometheus가 옛 이름으로 자동 연결해 준다', '아무 변화가 없다'], a: 0,
      why: 'record 이름은 대시보드와 알림이 기대는 계약이다. 바꿀 때는 새 이름을 추가하고 옮긴 뒤 옛것을 지운다.' },
    { q: 'prometheus_config_last_reload_successful이 0 인데 서비스는 멀쩡해 보인다. 무슨 뜻인가?',
      o: ['Prometheus가 꺼져 있다', '마지막 reload가 실패해 옛 설정으로 돌고 있다', '룰이 하나도 없다'], a: 1,
      why: 'reload가 실패해도 프로세스는 기존 설정으로 계속 돈다. 그래서 ConfigReloadFailed 같은 메타 알람이 필요하다.' },
  ];

  const summary = [
    '1.2초짜리 p99 쿼리를 20곳이 30초마다 부르면 1분에 48초를 계산에 쓴다.',
    '원인은 같은 결과를 매번 처음부터 다시 만드는 데 있다.',
    'recording rule은 그 쿼리를 1분에 한 번 계산해 새 이름의 시계열로 저장한다.',
    '대시보드와 알림이 같은 record를 읽고, 룰 평가 자체도 메타 알람으로 지켜본다.',
  ];
  const review = [
    { q: 'record를 만든 뒤에도 대시보드가 여전히 느리다. 먼저 확인할 것은?',
      o: ['패널이 아직 원래 histogram_quantile 쿼리를 쓰고 있는지', 'scrape_interval이 너무 긴지', 'Alertmanager가 켜져 있는지'], a: 0,
      why: 'record는 패널이 그 이름을 읽어야 효과가 난다. 패널 쿼리를 바꾸지 않으면 무거운 계산이 그대로 남는다.' },
    { q: '룰 파일을 고쳐 reload 했는데 새 record가 안 생긴다. 먼저 의심할 것은?',
      o: ['Grafana 캐시', 'reload 실패로 옛 설정이 그대로 돌고 있는 것', 'TSDB 보존 기간'], a: 1,
      why: '설정이 깨져 있으면 reload는 거부되고 기존 룰이 계속 돈다. promtool check와 config_last_reload_successful로 확인한다.' },
    { q: '5분 창과 30분 창 p99를 둘 다 보고 싶다. 알맞은 방법은?',
      o: ['한 record의 창을 상황에 따라 바꾼다', '대시보드에서 다시 원래 쿼리를 쓴다', ':5m, :30m record를 따로 두 개 만든다'], a: 2,
      why: '창이 다르면 다른 값이므로 이름에 창을 적은 record를 따로 둔다. 시계열은 하나 더 늘지만 계산은 여전히 1분에 한 번이다.' },
  ];

  R.page({ title: '사전 집계 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
