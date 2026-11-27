/* II-2-1 rate() vs irate() — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 15초마다 찍힌 counter 점, 재시작 때 0으로 떨어지는 계단, 그 위에 rate(초록·평균 기울기)와 irate(파랑·마지막 두 점).
 * 숫자: 페이지 코드 주석(1000270 → 1000420 → 300, −1000120)과, Prometheus 의 extrapolatedRate·irate·deriv 규칙을
 *       파이썬으로 재현해 예시 시계열에서 낸 값 (rate[5m] 12.1/s, irate 40/s, increase 3631.6, gauge rate 16.7 등).
 *       예시 시계열: 창 [5m] 안 20점 = 1000270, 1000420, 300, 450 … 2700, 3300 (마지막 15초에 +600).
 *       장면 4·6 의 롤링 선은 시드 7 로 만든 20분짜리 예시 counter 에서 15초마다 rate[5m]·irate[5m] 를 계산한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, snippet, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const RATE = GOOD, IRATE = INFO;

  // 창 [5m] 안 20점 (t = -285 … 0초)
  const TS = Array.from({ length: 20 }, (_, i) => -285 + 15 * i);
  const RAW = [1000270, 1000420].concat(Array.from({ length: 17 }, (_, i) => 300 + 150 * i)); RAW.push(RAW[RAW.length - 1] + 600);
  // 리셋 보정한 증가량(첫 점 기준): 0, 150, 450, 600 … 2850, 3450
  const INC = [0]; for (let i = 1; i < RAW.length; i++) INC.push(INC[i - 1] + (RAW[i] >= RAW[i - 1] ? RAW[i] - RAW[i - 1] : RAW[i]));
  // 롤링 비교: 5m ~ 20m, 15초마다 (예시 counter 에서 계산)
  const RR = [9.59, 9.62, 9.75, 9.8, 9.88, 9.77, 9.6, 9.7, 9.75, 9.88, 9.75, 9.9, 9.71, 9.61, 9.64, 9.94, 10.14, 10.13, 10.13, 10.27, 10.36, 10.53, 10.91, 10.84, 10.99, 11.51, 11.13, 11.21, 11.21, 11.39, 11.79, 12.05, 12.04, 12.28, 12.56, 12.99, 13.58, 13.72, 13.54, 13.26, 13.11, 12.73, 12.68, 12.27, 11.69, 11.72, 11.76, 11.25, 10.94, 10.69, 10.72, 10.83, 10.19, 9.48, 9.17, 8.62, 8.39, 8.52, 8.9, 8.83, 8.96];
  const RI = [10.93, 9.87, 11.53, 8.07, 10.93, 11.2, 8.0, 15.13, 11.67, 13.6, 8.13, 7.8, 9.0, 9.67, 11.87, 10.73, 8.67, 7.13, 8.47, 13.67, 11.6, 14.73, 15.27, 9.53, 14.13, 17.93, 7.93, 13.07, 13.67, 11.53, 15.47, 13.8, 9.6, 16.47, 16.0, 16.87, 18.33, 11.07, 10.33, 6.13, 11.87, 8.13, 8.67, 6.2, 7.07, 8.4, 13.87, 3.93, 5.6, 10.73, 14.33, 11.73, 4.33, 2.47, 11.07, 7.8, 6.67, 12.93, 13.33, 10.47, 10.73];

  // 보정된 증가량 그래프 (장면 2·3·5 공통)
  function incPlot(o) { o = o || {};
    const ax = R.axes(90, 60, 560, 280, { x: [-300, 0], y: [0, 3600], xt: [-300, -150, 0], yt: [0, 1200, 2400, 3600], xl: '초 (now = 0)', yl: '리셋 보정한 누적 증가량' });
    const pts = TS.map((t, i) => [t, INC[i]]);
    R.line(ax, pts, o.u ?? 1, MUT, { sw: 2 }); R.scatter(ax, pts.map((p, i) => [p[0], p[1], o.col ? o.col(i) : INK]), { u: o.u ?? 1, r: 4.5 });
    return ax; }
  function slope(ax, i0, i1, col, g, o) { o = o || {}; const x0 = ax.X(TS[i0]), y0 = ax.Y(INC[i0]), x1 = ax.X(TS[i1]), y1 = ax.Y(INC[i1]);
    grow(x0, y0, x1, y1, g, col, { plain: true, sw: o.sw || 3.5 }); if (g > 0.9) { el('circle', { cx: x0, cy: y0, r: 7, fill: col }); el('circle', { cx: x1, cy: y1, r: 7, fill: col }); } }
  function readout(lines, u, x, y0) { lines.forEach(([s, col, big], i) => (/[가-힣]/.test(s) ? tx : mono)(x || 690, (y0 || 110) + i * 38, s, { 'font-size': big ? 19 : 15, 'font-weight': big ? 800 : 600, fill: col || INK, opacity: fade(u, 0.4 + i * 0.4) })); }

  // ---------- 1. counter 와 리셋 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { // 계속 올라가는 계수기
      const v = k === 0 ? Math.round(lerp(1000000, 1000270, E(u, 0.2, 2.0))) : 1000270;
      const digits = String(v).padStart(7, '0').split('');
      digits.forEach((d, i) => card(250 + i * 54, 150, 46, 66, { rx: 6, text: d, mono: true, fs: 30, fw: 800, fill: INK, color: PANEL, stroke: 'none' }));
      mono(445, 80, 'http_requests_total{job="api"}', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle' });
      if (k === 0) { [['한 방향으로만 쌓인다', GOOD], ['재시작하면 0부터', BAD]].forEach(([s, col], i) => pill(250 + i * 330, 260, s, col, pop(u, 1.4 + i * 0.5), { fs: 15 })); }
      if (k === 1) { tx(445, 270, '1,000,270건... 그래서 지금 바쁜가?', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.4) });
        sub(445, 305, '누적값 안에는 지금 속도 정보가 없다', fade(u, 1.2), { 'font-size': 15 }); }
      if (k === 2) { const ax = R.axes(560, 240, 330, 130, { x: [0, 10], y: [0, 10] });
        R.line(ax, [[0, 1], [10, 8.5]], E(u, 0.2, 0.9), MUT); const g = E(u, 1.0, 1.6);
        grow(ax.X(3), ax.Y(3.25), ax.X(8), ax.Y(3.25), g, ACC, { plain: true }); grow(ax.X(8), ax.Y(3.25), ax.X(8), ax.Y(7), g, ACC, { plain: true });
        mono(ax.X(5.5), ax.Y(3.25) + 22, 'Δt', { 'font-size': 15, fill: ACC, 'text-anchor': 'middle', opacity: g }); mono(ax.X(8) + 10, ax.Y(5), 'Δ건', { 'font-size': 15, fill: ACC, opacity: g });
        tx(320, 300, '기울기 = Δ건 ÷ Δt', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
        sub(320, 332, '= 초당 증가율 (req/s)', fade(u, 1.9), { 'font-size': 16, fill: INK }); }
      return; }
    // k3, k4: 재시작
    const ax = R.axes(110, 70, 500, 260, { x: [0, 2], y: [0, 1100000], xt: [0, 1, 2], yt: [0, 500000, 1000000], xl: '스크랩 시점 t', yl: '값' });
    const P = [[0, 1000270], [1, 1000420], [2, 300]];
    const fix = k === 4 ? E(u, 0.4, 1.4) : 0;
    const y2 = lerp(300, 1000720, fix);
    R.line(ax, [[0, 1000270], [1, 1000420]], 1, INK); el('line', { x1: ax.X(1), y1: ax.Y(1000420), x2: ax.X(2), y2: ax.Y(y2), stroke: fix > 0.5 ? GOOD : BAD, 'stroke-width': 2.8, 'stroke-dasharray': fix > 0.5 ? null : '6 4' });
    [[0, 1000270], [1, 1000420], [2, y2]].forEach(([x, y], i) => el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 7, fill: i === 2 ? (fix > 0.5 ? GOOD : BAD) : INK }));
    [['t0', '1000270'], ['t1', '1000420  (+150)'], ['t2', k === 4 && fix > 0.5 ? '300 → 보정 1000720' : '300  (재시작!)']].forEach(([a, b], i) => {
      mono(650, 120 + i * 40, a, { 'font-size': 16, fill: MUT, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.2 + i * 0.3) : 1 });
      mono(690, 120 + i * 40, b, { 'font-size': 16, 'font-weight': 700, fill: i === 2 ? (k === 4 && fix > 0.5 ? GOOD : BAD) : INK, opacity: k === 3 ? fade(u, 0.2 + i * 0.3) : 1 }); });
    if (k === 3) { card(760, 290, 260, 66, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 1.4) });
      mono(760, 284, '300 − 1000420', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(760, 308, '= −1000120', { 'font-size': 19, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      sub(760, 350, '단순 차분이면 음수 → 알림 오작동', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }
    if (k === 4) { card(760, 290, 260, 66, { rx: 10, stroke: GOOD, fill: GOODBG, s: pop(u, 1.4) });
      tx(760, 284, '값이 줄면 직전 값을 더한다', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(760, 308, '300 + 1000420', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      sub(760, 350, 'rate 계열이 리셋을 알아서 메운다', fade(u, 2.0), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); } }

  // ---------- 2. rate ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { mono(480, 70, 'rate(v[5m])', { 'font-size': 26, 'font-weight': 800, fill: RATE, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      [['창 안 첫 점과 끝 점의 차이', '리셋은 직전 값을 더해 메운다'], ['창 끝까지 늘려 잡는다 (외삽)', '점이 창 경계에 못 닿은 몫'], ['창 길이(초)로 나눈다', '[5m]이면 300초']].forEach(([a, b], i) => {
        const y = 150 + i * 80, s = pop(u, 0.5 + i * 0.45); card(480, y, 560, 64, { rx: 12, stroke: RATE, sw: 2, s });
        mono(230, y + 7, String(i + 1), { 'font-size': 22, 'font-weight': 800, fill: RATE, opacity: fade(u, 0.6 + i * 0.45) });
        tx(270, y - 2, a, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.45) }); tx(270, y + 21, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6 + i * 0.45) }); }); return; }
    if (k === 1 || k === 4) { const ax = incPlot({ u: k === 1 ? E(u, 0.1, 0.9) : 1 });
      slope(ax, 0, 19, RATE, k === 1 ? E(u, 1.0, 1.6) : 1);
      if (k === 1) readout([['실제 증가 3450건', INK], ['외삽 ×300/285 = 3631.6', INK], ['÷ 300초', INK], ['rate = 12.1 /초', RATE, true]], u - 0.8);
      if (k === 4) { slope(ax, 18, 19, IRATE, E(u, 0.3, 0.8), { sw: 4 });
        el('circle', { cx: ax.X(0), cy: ax.Y(3450), r: 18, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.9) });
        readout([['마지막 15초: +600건', IRATE], ['= 40 /초로 치솟음', IRATE, true], ['rate[5m]는 그대로', RATE], ['12.1 /초', RATE, true]], u - 0.4);
        sub(780, 372, '평균에 묻혀 몇 분 늦게 반영된다', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }
      return; }
    if (k === 2) { mono(480, 56, 'sum by (job) (rate(http_requests_total[5m]))', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle' });
      const ys = [130, 200, 270], m = E(u, 0.9, 1.9);
      ys.forEach((y, i) => { const yy = lerp(y, 200, m);
        el('path', { d: `M110,${y} C 250,${y - 25} 350,${y + 25} 470,${y}`, fill: 'none', stroke: RATE, 'stroke-width': 2.5, opacity: 1 - m * 0.6 });
        mono(100, y + 5, `instance ${i + 1}`, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.2 + i * 0.2) });
        grow(480, y, 600, yy, E(u, 0.6, 1.2), RATE, { plain: true, op: 0.7 }); });
      el('rect', { x: 600, y: 182, width: 260, height: 36, rx: 18, fill: GOODBG, stroke: RATE, 'stroke-width': 2, opacity: fade(u, 1.5) });
      mono(730, 206, '{job="api"} 한 줄', { 'font-size': 16, 'font-weight': 800, fill: RATE, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(480, 360, 'rate를 먼저 구하고 그다음에 더한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(480, 388, '먼저 더하면 인스턴스 하나의 재시작을 리셋으로 알아보지 못한다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k3: 에러율
    mono(480, 56, 'sum(rate(…{status=~"5.."}[5m])) / sum(rate(…[5m])) * 100', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
    const g = E(u, 0.3, 1.3); el('rect', { x: 180, y: 130, width: 600 * g, height: 56, rx: 8, fill: RATE, opacity: 0.35 });
    el('rect', { x: 180, y: 130, width: 600 * g * 0.05, height: 56, rx: 4, fill: BAD });
    tx(480, 166, '전체 요청 rate', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
    grow(195, 200, 195, 250, E(u, 1.3, 1.7), BAD); tx(210, 260, '5xx rate', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
    tx(480, 320, '두 rate의 비율 = 에러율(%)', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.8) });
    sub(480, 350, '알림 규칙에서 가장 자주 쓰는 모양', fade(u, 2.1), { 'font-size': 15 }); }

  // ---------- 3. irate ----------
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { const PX = (tt) => 90 + ((tt + 300) / 300) * 560;
      if (k === 0) el('rect', { x: PX(-22), y: 60, width: PX(0) - PX(-22) + 14, height: 280, rx: 8, fill: INFOBG, opacity: fade(u, 0.4) * 0.8 });
      const ax = incPlot({ col: (i) => (i >= 18 ? IRATE : INK) });
      if (k === 0) {
        readout([['irate(v[5m])', IRATE, true], ['창이 5분이어도', INK], ['마지막 두 점만 본다', INK], ['(마지막 − 직전) ÷ 15초', MUT]], u); return; }
      slope(ax, 0, 19, RATE, 1 - E(u, 0.3, 0.9)); slope(ax, 18, 19, IRATE, E(u, 0.8, 1.3), { sw: 4 });
      readout([['600건 ÷ 15초', IRATE], ['irate = 40 /초', IRATE, true], ['rate는 12.1 /초', RATE]], u - 0.6); return; }
    if (k === 2) { mono(480, 52, 'irate(process_cpu_seconds_total[1m])', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle' });
      const ax = R.axes(110, 90, 480, 240, { x: [-60, 0], y: [2000, 3400], xt: [-60, -45, -30, -15, 0], yt: [2000, 2700, 3400], xl: '초', yl: '누적 (같은 예시 시계열)' });
      const pts = TS.slice(16).map((tt, i) => [tt, INC[16 + i]]);
      R.line(ax, pts, E(u, 0.1, 0.8), MUT); R.scatter(ax, pts.map((p) => [p[0], p[1], INK]), { u: E(u, 0.1, 0.8), r: 5 });
      grow(ax.X(-45), ax.Y(INC[16]), ax.X(0), ax.Y(INC[19]), E(u, 0.9, 1.4), RATE, { plain: true, sw: 3 });
      grow(ax.X(-15), ax.Y(INC[18]), ax.X(0), ax.Y(INC[19]), E(u, 1.3, 1.8), IRATE, { plain: true, sw: 4 });
      readout([['[1m] 창 = 점 4개', INK], ['rate[1m] = 20 /초', RATE, true], ['irate[1m] = 40 /초', IRATE, true], ['짧은 스파이크를 바로 잡는다', MUT]], u - 0.4, 640, 130); return; }
    if (k === 3) { const ax = R.axes(100, 70, 760, 270, { x: [5, 20], y: [0, 20], xt: [5, 10, 15, 20], yt: [0, 10, 20], xl: '분', yl: 'req/s (예시 counter, 15초마다 계산)' });
      R.line(ax, RI.map((v, i) => [5 + i * 0.25, v]), E(u, 0.2, 2.2), IRATE, { sw: 2.4 });
      tx(860, 64, 'irate[5m]', { 'font-size': 16, 'font-weight': 800, fill: IRATE, 'text-anchor': 'end', opacity: fade(u, 0.3) });
      card(480, 380, 420, 44, { rx: 10, stroke: BAD, text: '톱니처럼 튄다 → 알림 임계값에는 맞지 않는다', fs: 15, color: BAD, s: pop(u, 2.2) }); return; }
    // k4: 결손 — 마지막 4번 수집 실패
    const ax = R.axes(90, 60, 560, 280, { x: [-300, 0], y: [0, 3600], xt: [-300, -150, 0], yt: [0, 1200, 2400, 3600], xl: '초 (now = 0)', yl: '리셋 보정한 누적 증가량' });
    const pts = TS.slice(0, 16).map((tt, i) => [tt, INC[i]]);
    R.line(ax, pts, 1, MUT, { sw: 2 }); R.scatter(ax, pts.map((p, i) => [p[0], p[1], i >= 14 ? IRATE : INK]), { r: 4.5 });
    TS.slice(16).forEach((tt, i) => { el('circle', { cx: ax.X(tt), cy: ax.Y(INC[16 + i]), r: 6, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '3 3', opacity: fade(u, 0.3) }); cross(ax.X(tt), ax.Y(INC[16 + i]) - 22, 6, pop(u, 0.5 + i * 0.15)); });
    grow(ax.X(TS[14]), ax.Y(INC[14]), ax.X(TS[15]), ax.Y(INC[15]), E(u, 1.0, 1.4), IRATE, { plain: true, sw: 4 });
    readout([['마지막 1분 수집 실패', BAD], ['irate는 1분 전 두 점으로', INK], ['irate = 10 /초', IRATE, true], ['range를 넓혀도 같다', MUT]], u - 0.6); }

  // ---------- 4. 언제 무엇을 ----------
  function rollAxes(lab) { return R.axes(100, 70, 760, 260, { x: [5, 20], y: [0, 20], xt: [5, 10, 15, 20], yt: [0, 10, 20], xl: '분', yl: lab || 'req/s (예시 counter, 15초마다 계산)' }); }
  function s4(t, c) { const { k, u } = c, ax = rollAxes();
    const showR = k !== 2, showI = k !== 1;
    const g = k === 0 ? E(u, 0.2, 2.0) : 1;
    if (showI) R.line(ax, RI.map((v, i) => [5 + i * 0.25, v]), g, IRATE, { sw: k === 2 ? 2.6 : 2, op: k === 3 ? 0.8 : 1 });
    if (showR) R.line(ax, RR.map((v, i) => [5 + i * 0.25, v]), g, RATE, { sw: 3.4 });
    if (showR) tx(870, ax.Y(RR[60]) + 26, 'rate[5m]', { 'font-size': 15, 'font-weight': 800, fill: RATE, 'text-anchor': 'end', opacity: fade(u, 0.6) });
    if (showI) tx(870, 64, 'irate[5m]', { 'font-size': 15, 'font-weight': 800, fill: IRATE, 'text-anchor': 'end', opacity: fade(u, 0.6) });
    if (k === 0) card(480, 385, 520, 44, { rx: 10, stroke: INK, text: '같은 데이터 · 지속 상태는 rate, 순간 확인은 irate', fs: 15, s: pop(u, 2.2) });
    if (k === 1) card(480, 385, 520, 44, { rx: 10, stroke: RATE, fill: GOODBG, text: '알림: 5분 동안 이어진 추세를 판정한다', fs: 15, color: RATE, s: pop(u, 0.8) });
    if (k === 2) card(480, 385, 520, 44, { rx: 10, stroke: IRATE, fill: INFOBG, text: '실시간 패널: 방금 튄 값을 바로 보여 준다', fs: 15, color: IRATE, s: pop(u, 0.8) });
    if (k === 3) { el('line', { x1: ax.X(20), y1: 70, x2: ax.X(20), y2: 330, stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
      card(480, 385, 520, 44, { rx: 10, stroke: INK, fill: PANEL, s: pop(u, 0.6) });
      spans(260, 391, [['마지막 시각  ', {}], ['rate 8.96', { fill: RATE, 'font-weight': 800 }], ['  ·  ', {}], ['irate 10.73', { fill: IRATE, 'font-weight': 800 }], ['  → 기본은 rate', {}]], { 'font-size': 15, opacity: fade(u, 0.7) }); } }

  // ---------- 5. range 하한과 increase ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { const y = 190, x0 = 110, x1 = 850, X = (tt) => x0 + ((tt + 120) / 120) * (x1 - x0);
      el('line', { x1: x0, y1: 280, x2: x1 + 10, y2: 280, stroke: MUT, 'stroke-width': 1.8 });
      [-120, -90, -60, -30, 0].forEach((tt) => mono(X(tt), 304, tt === 0 ? 'now' : `${tt}s`, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }));
      const wsec = k === 1 ? 15 : 60, col = k === 1 ? BAD : GOOD;
      const w = k === 0 ? E(u, 0.6, 1.4) : 1;
      if (k !== 1 || true) { const xs = X(-wsec * w) - 8; el('rect', { x: xs, y: y - 46, width: X(0) - xs + 10, height: 92, rx: 8, fill: k === 1 ? BADBG : GOODBG, stroke: col, 'stroke-width': 2, 'stroke-dasharray': '7 5' }); }
      for (let i = 0; i <= 8; i++) { const tt = -120 + i * 15, on = tt > -wsec * w; el('circle', { cx: X(tt), cy: y, r: on ? 8 : 5, fill: on ? col : OFF }); }
      mono(480, 52, k === 0 ? 'scrape_interval = 15s  →  창 ≥ 15s × 4 = [1m]' : `rate(http_requests_total[${k === 1 ? '15s' : '1m'}])`, { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      const n = k === 1 ? 1 : 4;
      card(300, 370, 300, 50, { rx: 10, stroke: col, fill: k === 1 ? BADBG : GOODBG, text: `창 안 점 ${k === 0 ? Math.round(4 * w) : n}개`, fs: 16, color: col, s: pop(u, 1.2) });
      card(660, 370, 300, 50, { rx: 10, stroke: col, text: k === 1 ? '한두 개뿐 → 비거나 튄다' : k === 2 ? 'rate[1m] = 20 /초' : '리셋 보정·외삽이 안정된다', fs: 16, color: col, mono: k === 2, s: pop(u, 1.7) });
      return; }
    if (k === 3) { const ax = incPlot();
      slope(ax, 0, 19, RATE, 1);
      el('line', { x1: ax.X(-300), y1: ax.Y(0), x2: ax.X(-300), y2: ax.Y(3631.6), stroke: WARN, 'stroke-width': 3, opacity: fade(u, 0.6) });
      readout([['increase(v[5m])', WARN, true], ['= rate × 300초', INK], ['= 12.1 × 300', INK], ['= 3631.6건', WARN, true], ['실제 증가 3450에 외삽이 붙은 값', MUT]], u - 0.2, 680, 100); return; }
    // k4: 1시간 총 에러 건수
    mono(480, 52, 'sum(increase(http_requests_total{status=~"5.."}[1h]))', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle' });
    for (let i = 0; i < 12; i++) { const s = pop(u, 0.2 + i * 0.12), h = 30 + ((i * 53) % 70);
      el('rect', { x: 120 + i * 60, y: 300 - h * s, width: 46, height: h * s, rx: 4, fill: BAD, opacity: 0.6 }); }
    el('line', { x1: 110, y1: 300, x2: 850, y2: 300, stroke: MUT, 'stroke-width': 1.8 });
    mono(120, 324, '-1h', { 'font-size': 14, fill: MUT }); mono(850, 324, 'now', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    tx(480, 370, '5분마다의 증가를 다 더한 1시간 총 건수 (모양은 예시)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }

  // ---------- 6. 함정 ----------
  const GV = [500, 520, 480, 530, 470, 510, 490, 540, 500, 520, 470, 530, 490, 510, 480, 540, 500, 520, 490, 530];
  function s6(t, c) { const { k, u } = c;
    if (k <= 1) { const ax = R.axes(100, 70, 480, 250, { x: [-285, 0], y: [400, 600], xt: [-285, 0], yt: [400, 500, 600], xl: '초', yl: 'node_memory_Active_bytes (MB, 예시 gauge)' });
      R.line(ax, GV.map((v, i) => [-285 + 15 * i, v]), k === 0 ? E(u, 0.1, 0.9) : 1, WARN, { sw: 2.4 });
      if (k === 0) { GV.forEach((v, i) => { if (i && v < GV[i - 1]) el('circle', { cx: ax.X(-285 + 15 * i), cy: ax.Y(v), r: 8, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.0 + i * 0.03) }); });
        readout([['내려간 곳 9번', BAD], ['rate는 전부 리셋으로 보고', INK], ['직전 값을 더한다', INK], ['rate = 16.7 MB/초', BAD, true], ['의미 없는 값', MUT]], u - 0.8, 640, 110); return; }
      const reg = E(u, 0.3, 1.0); el('line', { x1: ax.X(-285), y1: ax.Y(506 - 0.0351 * 142.5), x2: lerp(ax.X(-285), ax.X(0), reg), y2: lerp(ax.Y(506 - 0.0351 * 142.5), ax.Y(506 + 0.0351 * 142.5), reg), stroke: INFO, 'stroke-width': 3, 'stroke-dasharray': '8 5' });
      readout([['deriv = 0.035 MB/초', INFO, true], ['점 전체의 회귀 기울기', MUT], ['delta = 31.6 MB', WARN, true], ['처음과 끝의 차이 (외삽 포함)', MUT]], u - 0.4, 640, 120); return; }
    if (k === 2 || k === 3) { const y = 190, x0 = 110, x1 = 850, span = k === 2 ? 120 : 240, step = k === 2 ? 15 : 30, X = (tt) => x0 + ((tt + span) / span) * (x1 - x0);
      el('line', { x1: x0, y1: 280, x2: x1 + 10, y2: 280, stroke: MUT, 'stroke-width': 1.8 });
      const wsec = k === 2 ? 10 : 30, xs = X(-wsec) - 10;
      el('rect', { x: xs, y: y - 46, width: X(0) - xs + 12, height: 92, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: fade(u, 0.4) });
      for (let tt = -span; tt <= 0; tt += step) el('circle', { cx: X(tt), cy: y, r: tt > -wsec ? 8 : 5, fill: tt > -wsec ? BAD : OFF });
      mono(480, 52, k === 2 ? 'rate(http_requests_total[10s])   scrape 15s' : 'rule: rate(…[30s])   scrape 15s → 30s', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle' });
      card(300, 370, 320, 50, { rx: 10, stroke: BAD, fill: BADBG, text: k === 2 ? '창 안 점 0~1개' : '창 안 점 1개', fs: 16, color: BAD, s: pop(u, 1.0) });
      card(670, 370, 340, 50, { rx: 10, stroke: BAD, text: k === 2 ? '결과 시계열이 없다' : '알림이 조용히 죽는다 → [2m]로', fs: 16, color: BAD, s: pop(u, 1.6) }); return; }
    // k4: 같은 임계 12 req/s 를 넘는 횟수
    const ax = rollAxes(); const thr = ax.Y(12);
    R.line(ax, RI.map((v, i) => [5 + i * 0.25, v]), 1, IRATE, { sw: 2, op: 0.85 }); R.line(ax, RR.map((v, i) => [5 + i * 0.25, v]), 1, RATE, { sw: 3.4 });
    el('line', { x1: 100, y1: thr, x2: 860, y2: thr, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '8 5' }); mono(866, thr + 5, '12', { 'font-size': 14, fill: BAD, 'font-weight': 700 });
    let cr = 0; RI.forEach((v, i) => { if (i && RI[i - 1] <= 12 && v > 12) { cr++; const s = pop(u, 0.3 + cr * 0.12); el('circle', { cx: ax.X(5 + i * 0.25), cy: thr, r: 7 * s, fill: IRATE }); } });
    RR.forEach((v, i) => { if (i && RR[i - 1] <= 12 && v > 12) { const s = pop(u, 1.8); el('circle', { cx: ax.X(5 + i * 0.25), cy: thr, r: 10 * s, fill: 'none', stroke: RATE, 'stroke-width': 3 }); } });
    card(480, 385, 560, 44, { rx: 10, stroke: INK, s: pop(u, 2.0) });
    spans(250, 391, [['임계 12 /초를 넘은 횟수  ', {}], ['irate 11번', { fill: IRATE, 'font-weight': 800 }], ['  ·  ', {}], ['rate 1번', { fill: RATE, 'font-weight': 800 }]], { 'font-size': 15, opacity: fade(u, 2.1) }); }

  const quiz = [
    { q: 'counter가 t1 1000420에서 재시작 뒤 t2 300이 됐다. 단순 차분 대신 rate 계열 함수를 써야 하는 이유는 무엇인가?',
      o: ['단순 차분이면 −1000120 같은 음수가 나와서', 'rate가 단순 차분보다 계산이 빨라서', '300이 너무 작은 값이라 버려야 해서'], a: 0,
      why: 'counter는 재시작하면 0부터 다시 쌓인다. rate 계열은 값이 줄면 직전 값을 더해 리셋을 메우므로 음수가 나오지 않는다.' },
    { q: 'rate(v[5m])가 기울기를 구할 때 쓰는 점은 무엇인가?',
      o: ['창 안 마지막 두 점', '창 안 첫 점과 끝 점, 그리고 창 끝까지의 외삽', '창 안 점들의 최댓값과 최솟값'], a: 1,
      why: '예시 창에서는 실제 증가 3450건을 창 끝까지 늘려 3631.6건으로 잡고 300초로 나눠 12.1/초가 나온다.' },
    { q: '마지막 15초에 600건이 몰렸다. irate[5m]가 내는 값은 무엇인가?',
      o: ['12.1/초', '600/초', '40/초'], a: 2,
      why: 'irate는 창 길이와 상관없이 마지막 두 점만 쓴다. 600건 ÷ 15초 = 40/초다.' },
    { q: '5분 동안 이어진 에러율로 알림을 걸 때 고를 함수는 무엇인가?',
      o: ['rate', 'irate', 'delta'], a: 0,
      why: '알림은 지속 상태를 판정해야 하므로 노이즈에 강한 rate가 맞다. irate는 실시간 패널에서 스파이크를 볼 때 쓴다.' },
    { q: '15초마다 수집하는 counter에 increase(v[5m])가 돌려주는 것은 무엇인가?',
      o: ['5분 동안 초당 평균 증가율', '5분 동안 늘어난 총 건수 (rate × 300초)', '마지막 두 점 사이 증가 건수'], a: 1,
      why: 'increase는 rate에 창 길이(초)를 곱한 값이다. 예시에서 12.1 × 300 = 3631.6건이다.' },
    { q: '오르내리는 메모리 gauge의 초당 변화율을 구할 때 알맞은 함수는 무엇인가?',
      o: ['rate', 'deriv', 'irate'], a: 1,
      why: 'rate는 값이 줄 때마다 리셋으로 보고 직전 값을 더해 예시에서 16.7MB/초 같은 엉터리 값을 낸다. gauge에는 deriv나 delta를 쓴다.' },
  ];

  const summary = [
    'counter는 재시작하면 0으로 떨어져 단순 차분이 음수가 된다. rate 계열이 이 리셋을 메운다.',
    'rate는 창 양 끝 차이를 외삽해 초로 나눈 평균이라 완만하고 알림에 맞는다.',
    'irate는 마지막 두 점만 써서 스파이크에 바로 반응하지만 임계값을 자주 넘나든다.',
    '창은 수집 간격의 4배 이상으로 잡고, 총 건수는 increase, gauge 변화율은 deriv로 본다.',
  ];
  const review = [
    { q: 'irate(x[5m]) > 12로 건 알림이 하루에도 여러 번 울렸다 꺼진다. 먼저 바꿀 것은?',
      o: ['rate(x[5m]) > 12로 바꾼다', '창을 [15s]로 줄인다', 'increase로 바꾸고 임계는 그대로 둔다'], a: 0,
      why: 'irate는 마지막 두 점만 봐서 톱니처럼 튄다. 예시에서 같은 임계를 irate는 11번, rate는 1번 넘었다.' },
    { q: '수집 간격을 15초에서 30초로 늘린 뒤 rate(x[30s])를 쓰는 알림이 한 번도 안 울린다. 먼저 의심할 것은?',
      o: ['counter가 재시작해서', '창 안에 점이 1개뿐이라 결과가 비어서', 'rate가 리셋을 과하게 메워서'], a: 1,
      why: '창이 수집 간격과 같으면 점이 하나라 기울기를 낼 수 없다. 창을 [2m]처럼 간격의 4배 이상으로 맞춘다.' },
    { q: '메모리 gauge에 rate를 걸었더니 터무니없이 큰 값이 나온다. 원인과 대안으로 맞는 것은?',
      o: ['외삽이 너무 커서 생긴 일이라 irate로 바꾼다', '창이 짧아서 생긴 일이라 [1h]로 늘린다', '값이 내려간 곳을 리셋으로 보고 더해서 생긴 일이라 deriv를 쓴다'], a: 2,
      why: 'rate는 값이 줄면 counter 재시작으로 보고 직전 값을 더한다. 오르내리는 gauge에는 deriv나 delta가 맞다.' },
  ];

  R.page({ title: 'counter 기울기 재기', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
