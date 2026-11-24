/* V-1-1 SLO · SLI · Error Budget — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 응답 코드 통·지연 분포(히스토그램)·30일 띠·예산 통·배포 파이프라인·burn rate 직선.
 * 숫자는 페이지 데이터(availability, latencyP95, errorRate, budget, slo, sloP95)와 코드 주석에서 읽는다.
 * 지연 분포 모양은 "예시"다: 중앙 110ms, P95 220ms 가 되게 만든 lognormal 표본 2만 개를 30ms 칸으로 센 값 (python 으로 계산).
 * 시간 환산·burn rate 소진 시간은 python 으로 다시 계산해 맞췄다 (43m12s, 2%/h, 약 2일, 5일, 30일). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, person, cross, check, clock, meters, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  const HIST = [0.1, 7.6, 24.2, 26.4, 19.0, 10.7, 5.8, 3.2, 1.5, 0.7, 0.4, 0.2, 0.1, 0.1];   // 30ms 칸 %, 예시 분포
  const pct = (v, d) => v.toFixed(d ?? 2) + '%';
  function head(x, y, s, op, a) { return tx(x, y, s, Object.assign({ 'font-size': 17, 'font-weight': 800, opacity: op ?? 1 }, a || {})); }
  function histo(x, y, w, h, gu, o) { o = o || {};
    const ax = axes(x, y, w, h, { x: [0, 420], y: [0, 30], xt: [0, 100, 200, 300, 400], yt: [0, 10, 20, 30], xl: '응답 시간 (ms)', yl: '요청 비율 %' });
    if (o.shade) o.shade(ax);
    HIST.forEach((v, i) => { const g = clamp(gu * HIST.length - i), x0 = ax.X(i * 30), x1 = ax.X(i * 30 + 30);
      if (g <= 0) return; el('rect', { x: x0 + 1.5, y: ax.Y(v * g), width: x1 - x0 - 3, height: ax.Y(0) - ax.Y(v * g), rx: 2, fill: o.col ? o.col(i * 30) : OFF }); });
    return ax; }
  function vline(ax, v, u, col, text, ty, o) { o = o || {}; if (u <= 0) return; const x = ax.X(v);
    el('line', { x1: x, y1: ax.Y(0), x2: x, y2: lerp(ax.Y(0), ax.Y(30) - 6, u), stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.dash });
    if (text) mono(x + (o.left ? -6 : 6), ty, text, { 'font-size': 14.5, 'font-weight': 700, fill: col, 'text-anchor': o.left ? 'end' : 'start', opacity: fade(u, 0.6, 0.3) }); }

  // ---------- 1. SLI ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) {
      const C4 = [['가용성', '5xx 아닌 응답 / 전체'], ['지연', 'P50 · P95 · P99 분포'], ['품질', '정확도 · 완전성'], ['신선도', '배치 · 캐시 지연']];
      C4.forEach(([a, d], i) => { const cx = 190 + (i % 2) * 250, cy = 120 + Math.floor(i / 2) * 130, s = pop(u, 0.2 + i * 0.3);
        card(cx, cy, 220, 100, { rx: 12, stroke: GOOD, sw: 2.2, s });
        tx(cx, cy - 8, a, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) });
        tx(cx, cy + 22, d, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      const cu = E(u, 1.6, 2.3);
      card(770, 185 + cu * 40, 200, 96, { rx: 12, stroke: OFF, sw: 2, dash: '6 5', op: 1 - cu * 0.35 });
      tx(770, 178 + cu * 40, 'CPU · RAM', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: MUT });
      tx(770, 206 + cu * 40, '서버 내부 사정', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
      if (u > 1.9) cross(860, 145 + cu * 40, 16, pop(u, 1.9));
      sub(770, 300, '내부 지표 · SLI 아님', fade(u, 2.1), { fill: BAD, 'font-weight': 700, 'font-size': 15 });
      tx(315, 385, '사용자가 체감하는 축만 SLI 후보', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    if (k === 1) {
      const route = [[110, 200], [250, 200]];
      person(80, 200, '사용자', {}); server(320, 200, 'orders', { lamp: GOOD });
      el('line', { x1: 110, y1: 200, x2: 262, y2: 200, stroke: GRID, 'stroke-width': 2.5 });
      for (let i = 0; i < 6; i++) dot(route, (t * 0.9 + i / 6) % 1, GOOD, 5.5);
      dot(route, seg(u, 1.1, 1.7), BAD, 7);
      mono(450, 72, 'sli:orders_availability:ratio_5m', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      const fu = E(u, 0.3, 0.9);
      tx(610, 140, '5xx가 아닌 응답', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fu });
      el('line', { x1: 500, y1: 160, x2: lerp(500, 720, fu), y2: 160, stroke: INK, 'stroke-width': 2.5 });
      tx(610, 190, '전체 응답', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fu });
      const tot = Math.round(2000 * E(u, 0.4, 2.0)), bad = u > 1.7 ? 1 : 0;
      mono(860, 140, (tot - bad).toLocaleString('en-US'), { 'font-size': 20, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end' });
      mono(860, 190, tot.toLocaleString('en-US'), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end' });
      mono(690, 265, '= ' + pct(b.availability), { 'font-size': 32, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(690, 305, '예시: 5분 동안 2,000건 중 5xx 1건', fade(u, 2.1), { 'font-size': 14 });
      sub(690, 335, '5분 창으로 미리 계산해 둔다 (recording rule)', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 2) {
      const ax = histo(80, 70, 470, 260, E(u, 0.2, 1.2), { col: (v) => (v >= 210 && u > 1.9 ? BAD : OFF),
        shade: (ax) => { if (u > 1.9) el('rect', { x: ax.X(220), y: ax.Y(30), width: ax.X(420) - ax.X(220), height: ax.Y(0) - ax.Y(30), fill: BADBG, opacity: fade(u, 1.9) }); } });
      vline(ax, 120, E(u, 1.2, 1.6), MUT, '평균 120ms', 100, { dash: '6 5', left: true });
      vline(ax, b.latencyP95, E(u, 1.5, 1.9), ACC, 'P95 ' + b.latencyP95 + 'ms', 100);
      tx(ax.X(320), 160, '느린 5%', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      mono(610, 110, 'histogram_quantile(0.95, …)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) });
      tx(610, 170, '평균은 느린 5%를 가린다', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(610, 200, '사용자가 겪는 건 꼬리 쪽이다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) });
      sub(745, 300, '예시 분포 · 중앙값 110ms', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) {
      server(120, 200, 'orders', { lamp: GOOD });
      const B3 = [['2xx · 3xx', '정상', GOOD, 0.8], ['4xx', '입력 문제 · 실패로 안 셈', WARN, 0.25], ['5xx', '서버 잘못 · 실패로 셈', BAD, 0.06]];
      B3.forEach(([n, d, col, lv], i) => { const cx = 400 + i * 200, top = 170, h = 120, w = 140, s = pop(u, 0.2 + i * 0.2);
        if (s <= 0) return;
        el('path', { d: `M${cx - w / 2},${top} L${cx - w / 2},${top + h} L${cx + w / 2},${top + h} L${cx + w / 2},${top}`, fill: 'none', stroke: col, 'stroke-width': 3, 'stroke-dasharray': i === 1 ? '7 5' : null, opacity: s });
        const f = E(u, 0.8 + i * 0.3, 2.0) * lv; el('rect', { x: cx - w / 2 + 4, y: top + h - h * f, width: w - 8, height: h * f, fill: col, opacity: 0.3 });
        tx(cx, top - 14, n, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col, opacity: s, class: 'mono' });
        tx(cx, top + h + 26, d, { 'text-anchor': 'middle', 'font-size': 14, fill: col === WARN ? WARN : MUT, 'font-weight': 600, opacity: fade(u, 0.6 + i * 0.2) });
        for (let j = 0; j < (i === 0 ? 4 : 1); j++) dot([[180, 200], [cx, 120], [cx, top + 40]], seg(u, 0.6 + i * 0.35 + j * 0.25, 1.3 + i * 0.35 + j * 0.25), col, 6); });
      mono(600, 385, '에러율 = 5xx / 전체 = ' + pct(b.errorRate), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.1) }); return; }
    // k4: 좋은 SLI 의 네 조건
    const Q4 = [['사용자가 느끼는 것', 'CPU 점유율'], ['자동으로 잴 수 있는 것', '수동 설문'], ['의미 있게 변하는 것', '늘 99.99%'], ['도메인에 맞는 것', '검색이면 적합도']];
    Q4.forEach(([a, x], i) => { const y = 62 + i * 50, s = pop(u, 0.2 + i * 0.25);
      check(84, y - 5, 10, s); tx(108, y, a, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.25 + i * 0.25) });
      tx(560, y, (i < 3 ? '✗ ' : '예: ') + x, { 'font-size': 15, fill: i < 3 ? BAD : MUT, opacity: fade(u, 0.5 + i * 0.25) }); });
    // 늘 99.99% 인 평평한 선
    const fl = E(u, 1.2, 1.8); el('polyline', { points: [0, 1, 2, 3, 4, 5, 6].map((i) => `${740 + i * 26 * fl},${158}`).join(' '), fill: 'none', stroke: OFF, 'stroke-width': 3 });
    meters(80, 270, 800, [
      { name: '가용성 SLI', val: pct(b.availability), good: true },
      { name: 'P95 지연 SLI', val: b.latencyP95 + 'ms', good: true },
      { name: '에러율 SLI', val: pct(b.errorRate), good: true }].map((m, i) => (u > 1.6 + i * 0.25 ? m : Object.assign({}, m, { val: '' }))), { h: 76 });
    sub(480, 380, '세 SLI 확정 · CPU/RAM은 내부 지표로만', fade(u, 2.3), { 'font-size': 15, 'font-weight': 700, fill: INK }); }

  // ---------- 2. SLO ----------
  function yamlCard(rows, o) { o = o || {}; el('rect', { x: 50, y: 50, width: 400, height: 300, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(68, 76, o.title || 'slo_targets.yaml', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    rows.forEach(([key, val, st], i) => { const y = 118 + i * 44; st = st || {};
      mono(70, y, key, { 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: st.op ?? 1 });
      const kx = 70 + R.tw(key, 16) + 12;
      if (val == null) { el('rect', { x: kx, y: y - 22, width: 200, height: 30, rx: 6, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: st.op ?? 1 }); return; }
      if (st.box) el('rect', { x: kx - 6, y: y - 23, width: R.tw(val, 16) + 14, height: 32, rx: 6, fill: ACCBG, opacity: st.box });
      mono(kx, y, val, { 'font-size': 16, 'font-weight': 700, fill: st.col || INK, opacity: st.vop ?? 1 }); }); }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    if (k <= 2) {
      const ind = k === 0 ? null : 'good / total', win = k < 2 ? null : '30d · rolling', tgt = k < 2 ? null : '0.999';
      yamlCard([['kind:', 'SLO', { op: k === 0 ? fade(u, 0.2) : 1 }], ['service:', 'orders', { op: k === 0 ? fade(u, 0.5) : 1 }],
        ['indicator:', ind, { op: k === 0 ? fade(u, 0.8) : 1, box: k === 1 ? fade(u, 1.6) : 0, vop: k === 1 ? fade(u, 1.5) : 1 }],
        ['timeWindow:', win, { op: k === 0 ? fade(u, 1.1) : 1, box: k === 2 ? fade(u, 0.9) : 0, vop: k === 2 ? fade(u, 0.8) : 1 }],
        ['target:', tgt, { op: k === 0 ? fade(u, 1.4) : 1, box: k === 2 ? fade(u, 1.7) : 0, vop: k === 2 ? fade(u, 1.6) : 1, col: ACC }]]); }
    if (k === 0) {
      [['무엇을 잴까', 'Step 1의 SLI'], ['얼마 동안', '창 (window)'], ['얼마나 잘', '목표 숫자']].forEach(([a, d], i) => { const y = 206 + i * 44;
        tx(560, y, a, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.6 + i * 0.25) }); tx(700, y, d, { 'font-size': 15, fill: MUT, opacity: fade(u, 1.7 + i * 0.25) });
        grow(550, y - 6, 480, y - 6, E(u, 1.7 + i * 0.25, 2.1 + i * 0.25), MUT); });
      tx(560, 120, '목표 수치는 아직 비어 있다', { 'font-size': 18, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 1) {
      pill(700, 120, 'goodMetric · 5xx 아닌 응답', GOOD, pop(u, 0.2), { mono: true, fs: 14 });
      pill(700, 170, 'totalMetric · 전체 응답', INK, pop(u, 0.4), { mono: true, fs: 14 });
      fly(620, 145, 400, 206, seg(u, 0.8, 1.5), 'good / total', { mono: true });
      tx(560, 270, 'Step 1의 가용성 식을 그대로 쓴다', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(560, 300, '대시보드와 SLO가 같은 정의를 본다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 2) {
      // 30일 띠: 칸이 하나씩 차고, 끝에서 한 칸 밀린다 (rolling)
      const fill = Math.floor(30 * E(u, 0.2, 1.2)), sh = E(u, 1.3, 1.8);
      tx(500, 82, '롤링 30일', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      for (let i = 0; i < 31; i++) { const x = 500 + (i - sh) * 14; if (x < 494 || x > 920) continue; const on = i < fill || (sh > 0 && i === 30);
        el('rect', { x, y: 94, width: 11, height: 30, rx: 2, fill: on ? (i === 30 ? ACC : INFO) : SOFT, opacity: i === 0 ? 1 - sh : 0.85 }); }
      sub(708, 146, '오늘이 들어오고 31일 전이 빠진다', fade(u, 1.7), { 'font-size': 14 });
      // 가용성 눈금: 99.5 ~ 100
      const X = (v) => 500 + (v - 99.5) / 0.5 * 410, y = 250;
      el('line', { x1: X(99.5), y1: y, x2: X(100), y2: y, stroke: MUT, 'stroke-width': 2 });
      [99.5, 99.75, 100].forEach((v) => { el('line', { x1: X(v), y1: y, x2: X(v), y2: y + 6, stroke: MUT }); mono(X(v), y + 24, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      const tu = E(u, 1.6, 2.1); el('line', { x1: X(b.slo), y1: y + 4, x2: X(b.slo), y2: y - 70 * tu, stroke: WARN, 'stroke-width': 3 });
      mono(X(b.slo) - 6, y - 76, '목표 ' + b.slo + '%', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.9) });
      el('circle', { cx: X(b.availability), cy: y, r: 9 * pop(u, 0.4), fill: ACC });
      mono(X(b.availability), y - 22, '현재 ' + b.availability + '%', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      tx(705, 335, '현재가 목표선 오른쪽에 있으면 통과', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    if (k === 3) {
      yamlCard([['metadata:', 'orders-latency-p95'], ['indicator:', 'latency-p95'], ['target:', '0.95', { col: ACC, box: fade(u, 0.3) }], ['threshold:', '0.300', { col: ACC, box: fade(u, 0.6) }]]);
      tx(70, 330, '95%의 요청이 300ms 안에', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      const ax = histo(540, 80, 360, 220, E(u, 0.2, 1.0), { col: (v) => (v + 30 <= b.sloP95 && u > 1.3 ? GOOD : OFF) });
      vline(ax, b.sloP95, E(u, 1.0, 1.4), WARN, '임계 ' + b.sloP95 + 'ms', 104);
      vline(ax, b.latencyP95, E(u, 1.6, 2.0), ACC, 'P95 ' + b.latencyP95, 136, { left: true });
      tx(720, 395, `P95 ${b.latencyP95}ms < ${b.sloP95}ms · 통과 (예시 분포)`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    // k4: 9 의 개수 → 30일 허용 다운 시간 (로그 눈금)
    const L9 = [['99%', 432, '7시간 12분'], ['99.9%', 43.2, '43분 12초'], ['99.95%', 21.6, '21분 36초'], ['99.99%', 4.32, '4분 19초'], ['99.999%', 0.432, '26초']];
    tx(60, 46, '30일 동안 허용되는 다운 시간 (로그 눈금)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    L9.forEach(([n, m, s], i) => { const y = 78 + i * 54, g = E(u, 0.2 + i * 0.3, 0.8 + i * 0.3), w = 520 * (Math.log10(m) + 0.5) / 3.2, hot = n === '99.9%';
      mono(150, y + 6, n, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: hot ? ACC : INK });
      el('rect', { x: 170, y: y - 12, width: Math.max(2, w * g), height: 26, rx: 4, fill: hot ? ACC : OFF });
      mono(180 + w * g, y + 7, s, { 'font-size': 15.5, 'font-weight': 700, fill: hot ? ACC : INK, opacity: fade(u, 0.6 + i * 0.3) }); });
    const y6 = 78 + 5 * 54; mono(150, y6 + 6, '100%', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: BAD, opacity: fade(u, 1.9) });
    tx(180, y6 + 7, '0초 · 선택지가 아니다', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
    tx(800, 200, '9 하나 늘 때마다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) });
    tx(800, 226, '허용 시간은 1/10', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.2) }); }

  // ---------- 3. Error Budget ----------
  function tank(x, y, w, h, v, o) { o = o || {}; const f = clamp(v / 100), col = v < 0 ? BAD : v <= 30 ? WARN : GOOD;
    el('rect', { x, y, width: w, height: h, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    el('rect', { x: x + w / 2 - 22, y: y - 12, width: 44, height: 12, rx: 3, fill: INK });
    if (f > 0) el('rect', { x: x + 6, y: y + 6 + (h - 12) * (1 - f), width: w - 12, height: (h - 12) * f, rx: 9, fill: col, opacity: 0.75 });
    mono(x + w / 2, y + h / 2 + 10, Math.round(v) + '%', { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'middle', fill: INK });
    tx(x + w / 2, y + h + 28, o.label || '남은 예산', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); }
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) {
      mono(480, 60, '(1 − 0.999) × 30일 = 43분 12초', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.2) });
      const g = E(u, 0.4, 1.2); el('rect', { x: 60, y: 110, width: 840 * g, height: 46, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.5 });
      tx(480, 140, '30일 = 43,200분', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
      const z = E(u, 1.3, 2.0); el('rect', { x: 897, y: 104, width: 4, height: 58, fill: BAD, opacity: fade(u, 1.2) });
      el('path', { d: `M897,162 L${lerp(897, 640, z)},${lerp(162, 230, z)} M901,162 L${lerp(901, 900, z)},${lerp(162, 230, z)}`, stroke: BAD, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', fill: 'none', opacity: z });
      card(770, 290, 260, 120, { rx: 12, stroke: BAD, sw: 2.5, fill: 'var(--badbg)', s: pop(u, 1.8) });
      tx(770, 272, '0.1% = 허용된 실패', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      mono(770, 312, '43분 12초', { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) });
      tx(80, 250, 'SLO를 정하면', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(80, 280, '실패해도 되는 양이 같이 정해진다', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(80, 320, '이번 달 30분 다운 → 13분 12초 남음', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 1) {
      tx(60, 70, '5분 SLI 값 (30일 = 8,640개, 그중 일부만 그림)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      for (let i = 0; i < 72; i++) { const v = 0.5 + 0.5 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)), s = clamp(u * 1.4 * 72 / 1.6 - i * 0.9);
        const x = 60 + i * 11.7; el('rect', { x, y: 170 - 60 * v * s, width: 8, height: 60 * v * s, rx: 1, fill: i === 43 ? WARN : INFO, opacity: 0.7 }); }
      const fz = E(u, 1.4, 2.1); for (let i = 0; i < 9; i++) { const x0 = 70 + i * 100; grow(x0, 180, lerp(x0, 480, 1), 250, fz, OFF, { plain: true, sw: 1.5 }); }
      card(480, 300, 360, 90, { rx: 12, stroke: ACC, sw: 2.5, fill: 'var(--newbg)', s: pop(u, 1.9) });
      mono(480, 290, 'slo:orders_availability:ratio_30d', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) });
      mono(480, 318, 'sum_over_time / count_over_time', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1) });
      sub(480, 372, '막대 높이는 모양만 보인 예시', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    if (k === 2) {
      const bud = tween(p.budget, b.budget, c.u), av = tween(p.availability, b.availability, c.u);
      tank(120, 70, 150, 270, bud);
      mono(360, 100, '(SLI − SLO) / (1 − SLO)', { 'font-size': 18, 'font-weight': 800, fill: INK, opacity: fade(u, 0.2) });
      mono(360, 160, '(99.95 − 99.9) / 0.1 = 50%', { 'font-size': 17, fill: MUT, opacity: fade(u, 0.4), 'text-decoration': u > 1.3 ? 'line-through' : null });
      mono(360, 210, `(${av.toFixed(2)} − 99.9) / 0.1 = ${Math.round(bud)}%`, { 'font-size': 19, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.0) });
      tx(360, 280, '가용성이 0.02%p 내려갔을 뿐인데', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(360, 310, '예산은 50%에서 30%로 줄었다', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      tx(360, 350, '여유는 0.1% 안에서만 생긴다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 3) {
      const cx = 480, cy = 320, r = 200, A = (v) => Math.PI * (1 - (v + 50) / 150);   // −50 → 180°, 100 → 0°
      const arc = (v0, v1, col, op) => { const a0 = A(v0), a1 = A(v1); el('path', { d: `M${cx + r * Math.cos(a0)},${cy - r * Math.sin(a0)} A${r},${r} 0 0 1 ${cx + r * Math.cos(a1)},${cy - r * Math.sin(a1)}`, fill: 'none', stroke: col, 'stroke-width': 34, opacity: op }); };
      arc(-50, 0, BAD, fade(u, 0.2)); arc(0, 30, WARN, fade(u, 0.4)); arc(30, 100, GOOD, fade(u, 0.6));
      [[-50, '−50%'], [0, '0%'], [30, '30%'], [100, '100%']].forEach(([v, s]) => { const a = A(v); mono(cx + (r + 34) * Math.cos(a), cy - (r + 34) * Math.sin(a) + 5, s, { 'font-size': 14, 'text-anchor': v < 0 ? 'end' : v > 50 ? 'start' : 'middle', fill: MUT, opacity: fade(u, 0.7) }); });
      [[-25, '위반', BAD], [15, '보수적', WARN], [65, '여유', GOOD]].forEach(([v, s, col]) => { const a = A(v); tx(cx + (r - 58) * Math.cos(a), cy - (r - 58) * Math.sin(a) + 5, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.9) }); });
      const nv = lerp(100, b.budget, E(u, 1.0, 2.0)), na = A(nv);
      el('line', { x1: cx, y1: cy, x2: cx + (r - 30) * Math.cos(na), y2: cy - (r - 30) * Math.sin(na), stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round' }); el('circle', { cx, cy, r: 10, fill: INK });
      mono(cx, cy + 50, '지금 ' + Math.round(nv) + '%', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.8) }); return; }
    // k4: burn rate — 남은 30% 를 시간당 10% 로 태우면 3시간
    const ax = axes(110, 70, 500, 270, { x: [0, 4], y: [0, 40], xt: [0, 1, 2, 3, 4], yt: [0, 10, 20, 30, 40], xl: '지금부터 시간 (h)', yl: '남은 예산 %', grid: true });
    line(ax, [[0, 30], [1, 20], [2, 10], [3, 0]], E(u, 0.3, 1.6), BAD, { sw: 3.5 });
    line(ax, [[0, 30], [4, 30 - 4 * 100 / 720]], E(u, 1.6, 2.3), GOOD, { dash: '8 6', sw: 2.5 });
    if (u > 1.6) { el('circle', { cx: ax.X(3), cy: ax.Y(0), r: 8 * pop(u, 1.6), fill: BAD }); mono(ax.X(3) + 12, ax.Y(0) - 12, '3시간 뒤 0', { 'font-size': 15, 'font-weight': 800, fill: BAD }); }
    tx(650, 120, '시간당 10% 소진', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) });
    tx(650, 150, '남은 30%는 3시간이면 끝', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.8) });
    tx(650, 210, '평소 속도(1×)면', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) });
    tx(650, 240, '4시간에 0.56%만 준다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) });
    tx(650, 310, '남은 양과 타는 속도를 같이 본다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.3) }); }

  // ---------- 4. 배포 동결 ----------
  const PX = { push: 90, gate: 320, dep: 560, k8s: 790, y: 160 };
  function pipe(c, o) { const { k, u } = c; o = o || {};
    const g = k === 0 ? E(u, 0.2, 1.2) : 1, frozen = o.frozen;
    el('circle', { cx: PX.push, cy: PX.y, r: 22, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); el('circle', { cx: PX.push, cy: PX.y, r: 7, fill: INK });
    tx(PX.push, PX.y + 46, 'push main', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
    grow(PX.push + 24, PX.y, PX.gate - 80, PX.y, clamp(g * 3), MUT);
    grow(PX.gate + 80, PX.y, PX.dep - 80, PX.y, clamp(g * 3 - 1), frozen ? OFF : MUT, { dash: frozen ? '6 6' : null });
    grow(PX.dep + 80, PX.y, PX.k8s - 105, PX.y, clamp(g * 3 - 2), frozen ? OFF : MUT, { dash: frozen ? '6 6' : null });
    card(PX.gate, PX.y, 156, 74, { rx: 10, stroke: o.gateCol || INK, sw: 2.5, s: k === 0 ? pop(u, 0.5) : 1, text: 'slo-gate', mono: true, fs: 17, fw: 800, color: o.gateCol || INK });
    card(PX.dep, PX.y, 156, 74, { rx: 10, stroke: frozen ? OFF : INK, sw: 2.5, s: k === 0 ? pop(u, 0.9) : 1, text: 'deploy', mono: true, fs: 17, fw: 800, color: frozen ? OFF : INK, op: frozen ? 0.8 : 1 });
    zone(PX.k8s - 100, 70, 230, 190, 'production', { stroke: GRID, fill: SOFT, op: k === 0 ? fade(u, 1.2) : 1 });
    for (let i = 0; i < 3; i++) { const y = 112 + i * 46; card(PX.k8s + 15, y + 10, 160, 36, { rx: 8, stroke: INK, sw: 1.8, text: 'orders · ' + (o.ver || 'v1'), mono: true, fs: 14.5, s: k === 0 ? pop(u, 1.3 + i * 0.15) : 1 }); } }
  function s4(t, c) { const { k, u } = c, b = c.beat;
    const frozen = k >= 2, gateCol = k >= 2 ? BAD : k === 1 ? ACC : INK;
    pipe(c, { frozen, gateCol });
    dbIcon(PX.gate, 330, 'Prometheus', { s: 0.75, stroke: k === 1 ? ACC : INK });
    pill(150, 330, '남은 예산 ' + b.budget + '%', BAD, k === 0 ? pop(u, 1.8) : 1, { mono: true, fs: 15 });
    if (k === 0) { tx(480, 52, 'services/orders/** 가 바뀌면 파이프라인이 돈다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) }); return; }
    if (k === 1) { dot([[PX.gate, PX.y + 38], [PX.gate, 290]], seg(u, 0.2, 0.9), ACC, 7);
      mono(PX.gate + 14, 250, 'query: budget_remaining', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.3) });
      fly(PX.gate + 120, 300, PX.gate + 90, PX.y - 70, seg(u, 1.1, 2.0), 'BUDGET = -0.5', { mono: true, fill: BAD, stay: true });
      tx(560, 330, '판단의 입력은 사람 의견이 아니라 메트릭 값', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 2) {
      mono(PX.gate, PX.y - 64, '-0.5 < 0.05', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.2) });
      cross(PX.gate + 70, PX.y - 30, 14, pop(u, 0.7));
      mono(PX.gate, PX.y + 62, 'exit 1', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.9) });
      banner(560, 330, 'DEPLOY FROZEN · 예산 회복까지 production 배포 차단', pop(u, 1.4)); return; }
    if (k === 3) {
      mono(PX.dep, PX.y + 62, 'needs: slo-gate', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.2) });
      cross((PX.dep + PX.k8s) / 2 - 10, PX.y, 13, pop(u, 0.8));
      tx(PX.k8s + 15, 290, 'kubectl은 실행되지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      tx(560, 360, '게이트를 잡 의존성으로 묶어 우회를 막는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    // k4: 예외 경로
    const a = E(u, 0.4, 1.4), pts = []; for (let i = 0; i <= 20; i++) { const s = (i / 20) * a; pts.push([lerp(PX.push, PX.dep, s), PX.y - 30 - Math.sin(Math.PI * s) * 70]); }
    if (a > 0) el('polyline', { points: pts.map((q) => q.join(',')).join(' '), fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
    pill(PX.gate - 10, 42, '[hotfix:security]', GOOD, pop(u, 0.9), { mono: true, fs: 14 });
    pill(PX.gate + 175, 42, 'SRE 승인', GOOD, pop(u, 1.1), { fs: 14 });
    pill(PX.push + 10, 250, '기능 PR', BAD, pop(u, 1.6), { fs: 14 }); cross(PX.gate - 95, 250, 10, pop(u, 1.9));
    tx(560, 360, '보안 패치·장애 복구만 우회, 나머지는 예산 회복 뒤', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // ---------- 5. 다층 burn 알람 ----------
  // 예시 오류율 신호(분): 평소 0.05%, 65~70분 2.5% 스파이크, 120분부터 2.0% 지속
  const sig = (m) => (m >= 65 && m < 70 ? 2.5 : m >= 120 ? 2.0 : 0.05);
  const avg = (a, b2) => { let s = 0; for (let m = a; m < b2; m++) s += sig(m); return s / (b2 - a); };
  function phone(cx, cy, s, title, body, col) { const g = R.G(cx, cy, s);
    el('rect', { x: -130, y: -70, width: 260, height: 140, rx: 16, fill: PANEL, stroke: col, 'stroke-width': 3 }, g);
    tx(-112, -38, title, { 'font-size': 15, 'font-weight': 800, fill: col, class: 'mono' }, g);
    String(body).split('\n').forEach((ln, i) => tx(-112, -6 + i * 24, ln, { 'font-size': 14.5, 'font-weight': 600 }, g)); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) {
      const ax = axes(100, 60, 560, 280, { x: [0, 30], y: [0, 100], xt: [0, 5, 10, 15, 20, 25, 30], yt: [0, 50, 100], xl: '일 (day)', yl: '남은 예산 %', grid: true });
      [[14.4, BAD, '14.4× · 약 2일', [2.4, 12]], [6, WARN, '6× · 5일', [5.4, 30]], [1, GOOD, '1× · 30일', [16, 56]]].forEach(([br, col, s, at], i) => { const d = 30 / br, g = E(u, 0.3 + i * 0.5, 1.0 + i * 0.5);
        line(ax, [[0, 100], [d, 0]], g, col, { sw: 3.2 }); mono(ax.X(at[0]), ax.Y(at[1]), s, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.9 + i * 0.5) }); });
      tx(700, 110, 'burn rate = 평소의 몇 배로', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(700, 136, '예산이 타는가', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      mono(700, 190, '14.4× → 1시간에 2%', { 'font-size': 15, fill: BAD, opacity: fade(u, 2.1) });
      mono(700, 216, '6×    → 6시간에 5%', { 'font-size': 15, fill: WARN, opacity: fade(u, 2.2) }); return; }
    if (k === 1 || k === 2) {
      const ax = axes(90, 60, 560, 240, { x: [0, 180], y: [0, 3], xt: [0, 60, 120, 180], yt: [0, 1, 2, 3], xl: '분 (예시 신호)', yl: '오류율 %' });
      const pts = []; for (let m = 0; m <= 180; m++) pts.push([m, sig(Math.min(m, 179))]);
      line(ax, pts, k === 1 ? E(u, 0.1, 1.0) : 1, INK, { sw: 2.2 });
      el('line', { x1: ax.X(0), y1: ax.Y(1.44), x2: ax.X(180), y2: ax.Y(1.44), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '7 5' });
      mono(ax.X(180) + 8, ax.Y(1.44) + 5, '1.44%', { 'font-size': 14, 'font-weight': 700, fill: BAD });
      const wbox = (a, b2, col, op) => el('rect', { x: ax.X(a), y: ax.Y(3), width: ax.X(b2) - ax.X(a), height: ax.Y(0) - ax.Y(3), fill: col, opacity: op * 0.18, stroke: col, 'stroke-width': 1.5 });
      if (k === 1) {
        const A1 = fade(u, 1.0, 0.3); wbox(10, 70, INFO, A1); wbox(65, 70, WARN, A1);
        const a5 = avg(65, 70), a60 = avg(10, 70);
        mono(700, 110, '70분 시점', { 'font-size': 15, 'font-weight': 800, opacity: A1 });
        mono(700, 140, '5분 평균  ' + a5.toFixed(2) + '%', { 'font-size': 15, fill: WARN, opacity: fade(u, 1.3) });
        mono(700, 166, '1시간 평균 ' + a60.toFixed(2) + '%', { 'font-size': 15, fill: INFO, opacity: fade(u, 1.5) });
        tx(700, 200, '→ 스파이크, 발사 안 함', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7) });
        const B1 = fade(u, 1.9, 0.3); wbox(120, 180, INFO, B1); wbox(175, 180, WARN, B1);
        mono(700, 256, '180분 시점', { 'font-size': 15, 'font-weight': 800, opacity: B1 });
        mono(700, 286, '5분 ' + avg(175, 180).toFixed(2) + '% · 1시간 ' + avg(120, 180).toFixed(2) + '%', { 'font-size': 15, fill: BAD, opacity: fade(u, 2.1) });
        tx(700, 318, '→ 둘 다 넘음, 발사', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.3) });
        return; }
      wbox(120, 180, INFO, 1); wbox(175, 180, WARN, 1);
      clock(760, 110, 32, E(u, 0.2, 1.2), BAD, 'for: 2m');
      phone(760, 290, pop(u, 1.4), 'severity: page', 'OrdersBudgetFastBurn\n예산 14× 속도로 소진 중', BAD);
      tx(370, 390, '사람을 깨우는 알람에는 할 일 문장을 붙인다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 3 || k === 4) {
      const slow = k === 3, thr = slow ? 0.6 : 0.1, lv = slow ? 0.8 : 0.15, X1 = slow ? 6 : 72;
      const ax = axes(90, 70, 520, 230, { x: [0, X1], y: [0, slow ? 1.2 : 0.3], xt: slow ? [0, 2, 4, 6] : [0, 24, 48, 72], yt: slow ? [0, 0.6, 1.2] : [0, 0.1, 0.2, 0.3], xl: slow ? '시간 (예시 신호)' : '시간 · 3일 (예시 신호)', yl: '오류율 %' });
      line(ax, [[0, 0.05 * (slow ? 1 : 0.4)], [X1 * 0.08, lv], [X1, lv]], E(u, 0.2, 1.2), slow ? WARN : INFO, { sw: 2.8 });
      el('line', { x1: ax.X(0), y1: ax.Y(thr), x2: ax.X(X1), y2: ax.Y(thr), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: fade(u, 0.6) });
      mono(ax.X(X1) + 8, ax.Y(thr) + 5, thr + '%', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
      const wa = fade(u, 1.0, 0.4), w1 = slow ? 0.5 : 6, w2 = slow ? 6 : 72;
      el('rect', { x: ax.X(X1 - w2), y: ax.y + 4, width: ax.X(X1) - ax.X(X1 - w2), height: 10, rx: 3, fill: INFO, opacity: wa * 0.7 });
      el('rect', { x: ax.X(X1 - w1), y: ax.y + 16, width: Math.max(6, ax.X(X1) - ax.X(X1 - w1)), height: 10, rx: 3, fill: WARN, opacity: wa });
      if (slow) { tx(660, 110, '작은 누수 0.8% (예시)', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.8) });
        mono(660, 145, '30분 · 6시간 창 > 6 × 0.1%', { 'font-size': 15, opacity: fade(u, 1.2) });
        clock(700, 215, 26, E(u, 1.4, 2.2), WARN, 'for: 15m'); tx(750, 222, '→ page', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) });
        tx(660, 300, '며칠에 걸친 누수를 여기서 잡는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); return; }
      tx(660, 110, '추세 0.15% (예시)', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.8) });
      mono(660, 145, '6시간 · 3일 창 > 1 × 0.1%', { 'font-size': 15, opacity: fade(u, 1.2) });
      card(760, 230, 200, 84, { rx: 6, stroke: INFO, sw: 2.5, dash: '10 4', s: pop(u, 1.6) });
      mono(760, 222, 'severity: ticket', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.7) });
      tx(760, 248, '업무 시간에 처리', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.7) });
      tx(660, 320, '새벽에 사람을 깨우지 않는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k5: 세 층 표
    const cols = [['규칙', 120], ['두 창', 280], ['배수', 410], ['임계 오류율', 545], ['지속', 680], ['통보', 810]];
    const rows = [['Fast', '5m + 1h', '14.4×', '1.44%', '2m', 'page', BAD], ['Slow', '30m + 6h', '6×', '0.6%', '15m', 'page', WARN], ['Ticket', '6h + 3d', '1×', '0.1%', '1h', 'ticket', INFO]];
    cols.forEach(([h, x]) => tx(x, 70, h, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.1) }));
    rows.forEach((r, i) => { const y = 120 + i * 64, s = pop(u, 0.3 + i * 0.4);
      card(480, y, 820, 52, { rx: 10, stroke: r[6], sw: 2, s });
      r.slice(0, 6).forEach((v, j) => mono(cols[j][1], y + 6, v, { 'font-size': 16, 'font-weight': j === 0 || j === 5 ? 800 : 600, 'text-anchor': 'middle', fill: j === 0 || j === 5 ? r[6] : INK, opacity: fade(u, 0.4 + i * 0.4) })); });
    tx(480, 345, '빠른 창만 보면 누수를 놓치고, 느린 창만 보면 사고를 늦게 안다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) });
    tx(480, 378, '두 창이 함께 넘을 때만 울려 단발 스파이크를 거른다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: '다음 중 SLI로 삼기에 맞지 않는 지표는 무엇인가?',
      o: ['5xx가 아닌 응답의 비율', 'orders 파드의 CPU 사용률', '요청의 P95 응답 시간'], a: 1,
      why: 'SLI는 사용자가 체감하는 축만 고른다. CPU 사용률은 서버 내부 사정일 뿐 사용자가 느끼는 품질이 아니다.' },
    { q: 'SLO 99.9%를 30일 창으로 잡았을 때 허용되는 다운 시간은 얼마인가?',
      o: ['약 4분 19초', '43분 12초', '7시간 12분'], a: 1,
      why: '(1 − 0.999) × 43,200분 = 43.2분이다. 9를 하나 더 붙인 99.99%면 4분 19초로 10분의 1이 된다.' },
    { q: 'SLO가 99.9%이고 30일 누적 가용성이 99.93%일 때 남은 Error Budget은 얼마인가?',
      o: ['93%', '70%', '30%'], a: 2,
      why: '(99.93 − 99.9) / (1 − 0.999) = 0.3이다. 30%가 남았고 70%는 이미 썼다.' },
    { q: '남은 예산이 −50%일 때 deploy_gate 파이프라인에서 일어나는 일은 무엇인가?',
      o: ['slo-gate가 exit 1로 실패하고 deploy 잡은 실행되지 않는다', '경고만 남기고 배포는 진행된다', 'deploy 잡이 먼저 돌고 나중에 롤백한다'], a: 0,
      why: '-0.5 < 0.05 조건이 참이라 게이트가 실패한다. deploy 잡은 needs: slo-gate로 묶여 있어 kubectl이 돌지 않는다.' },
    { q: 'Fast burn 알람이 5분 창과 1시간 창을 AND로 묶는 이유는 무엇인가?',
      o: ['알람을 더 자주 울리게 하려고', '순간 스파이크 하나로는 울리지 않게 하려고', 'Prometheus 부하를 줄이려고'], a: 1,
      why: '5분 창만 보면 짧은 스파이크에도 울린다. 1시간 창도 14.4배를 넘을 때만 발사하면 지속되는 사고만 남는다.' },
  ];

  const summary = [
    'SLI는 사용자가 체감하는 지표만 고른다. 가용성, P95 지연, 5xx 에러율이 그렇고 CPU는 아니다.',
    'SLO는 SLI에 창과 목표를 붙인 것이다. 30일 99.9%면 43분 12초까지 실패해도 된다.',
    '남은 예산은 (SLI − SLO) / (1 − SLO)로 잰다. 99.93%면 30%가 남는다.',
    '예산이 5% 밑이면 파이프라인이 배포를 막고, 알람은 14.4×·6×·1× 세 층으로 나눠 건다.',
  ];
  const review = [
    { q: '가용성이 99.95%에서 99.93%로 조금 내려갔는데 대시보드의 예산 게이지는 크게 떨어졌다. 그 까닭은?',
      o: ['게이지가 고장 났다', '예산은 SLO 아래 0.1% 폭 안에서만 계산되므로 작은 변화도 크게 보인다', 'P95 지연이 같이 늘어서다'], a: 1,
      why: '분모가 1 − 0.999 = 0.1%라 0.02%p 하락이 예산 20%p 감소가 된다. 50%였던 예산이 30%가 된다.' },
    { q: '한 팀이 예산이 바닥인데도 급한 기능을 배포하려 한다. 이 챕터의 게이트 설계에서 허용되는 길은?',
      o: ['보안 패치나 장애 복구로 SRE 승인을 받는 것', 'deploy 잡에서 needs 줄을 지우는 것', '게이트 임계를 0%로 낮추는 것'], a: 0,
      why: '예외는 hotfix:security 라벨과 SRE 승인 두 가지뿐이다. 그 외 배포는 예산이 회복된 뒤에만 나간다.' },
    { q: '며칠째 오류율이 0.8% 근처에 머무는데 page 알람이 늦게 울린다. 먼저 살펴볼 규칙은?',
      o: ['5분·1시간 창의 14.4× Fast burn', '30분·6시간 창의 6× Slow burn', '6시간·3일 창의 1× Ticket'], a: 1,
      why: '0.8%는 Fast 임계 1.44%에 못 미치고 Slow 임계 0.6%는 넘는다. 이런 누수는 Slow burn 규칙이 잡아야 한다.' },
  ];

  R.page({ title: 'orders 서비스 SLO 현황', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
