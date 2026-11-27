/* II-1-1 Instant vs Range Vector — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 15초마다 찍히는 샘플 점이 놓인 시간축. instant 는 now 세로선 하나가 점 하나를, range 는 [5m] 창이 점 20개를 잡는다.
 * 숫자: 페이지 코드 주석(1027·412·3, 1002@t-4m45s … 1027@now, scrape 15s)과
 *       Prometheus 규칙(왼쪽 열린 창, 외삽)을 파이썬으로 재현한 값(rate[5m]=0.088/s, increase=26.3, rate[1m]=0.067/s). 큐 길이는 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, cross, check, snippet, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통: 시간축 (t 초, now = 0) ----------
  const TL = { x0: 110, x1: 850, t0: -330 };
  const X = (t) => TL.x0 + ((t - TL.t0) / -TL.t0) * (TL.x1 - TL.x0);
  const TS = Array.from({ length: 22 }, (_, i) => -315 + 15 * i);        // 스크랩 시각 -315s … 0s
  // 상태 200 GET 시계열: 창 안 20개 = 1002, 1009, 1010 … 1027 (코드 주석 값과 맞춘 예시 배열)
  const V200 = [1000, 1001, 1002, 1009].concat(Array.from({ length: 18 }, (_, i) => 1010 + i));
  function timeAxis(y, u, o) { o = o || {};
    grow(TL.x0 - 10, y, TL.x1 + 14, y, u, MUT, { plain: true, sw: 1.8 });
    [-300, -240, -180, -120, -60, 0].forEach((t, i) => { const op = o.ticks === false ? 0 : fade(u * 3, 0.3 + i * 0.3);
      el('line', { x1: X(t), y1: y, x2: X(t), y2: y + 6, stroke: MUT, opacity: op });
      mono(X(t), y + 24, t === 0 ? 'now' : `${t / 60}m`, { 'font-size': 14, fill: t === 0 ? INK : MUT, 'text-anchor': 'middle', 'font-weight': t === 0 ? 700 : 400, opacity: op }); }); }
  function row(y, n, o) { o = o || {};   // 점 n 개 (왼쪽부터), sel(i) → 강조
    el('line', { x1: TL.x0, y1: y, x2: TL.x1, y2: y, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    TS.slice(0, n).forEach((t, i) => { const on = o.sel && o.sel(i);
      el('circle', { cx: X(t), cy: y, r: on ? 8 : 5, fill: on ? (o.col || ACC) : OFF, stroke: on ? PANEL : 'none', 'stroke-width': 2, opacity: o.op ?? 1 }); }); }
  function nowLine(y0, y1, u, col) { const yy = lerp(y0, y1, u); if (u <= 0) return;
    el('line', { x1: X(0), y1: y0, x2: X(0), y2: yy, stroke: col || ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }); }

  // ---------- 1. Instant vector ----------
  const SER = [['{method="GET",  status="200"}', 1027], ['{method="POST", status="200"}', 412], ['{method="POST", status="500"}', 3]];
  const RY = [118, 188, 258];
  function s1(t, c) { const { k, u } = c;
    pill(480, 40, 'http_requests_total', INK, k === 0 ? 0 : k === 1 ? pop(u, 0.2) : 1, { mono: true, fs: 15 });
    if (k === 3 || k === 4) { mono(661, 46, '{status="500"}', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 3 ? fade(u, 0.2) : 1 }); }
    timeAxis(300, k === 0 ? E(u, 0.2, 1.0) : 1);
    const nRow = k === 0 ? 1 : k === 1 ? 1 : 3;
    for (let r = 0; r < nRow; r++) { const y = RY[r], dropped = (k >= 3) && r < 2, op = dropped ? (k === 3 ? lerp(1, 0.22, E(u, 0.6, 1.4)) : 0.22) : 1;
      const showN = k === 0 ? Math.floor(lerp(0, 22, E(u, 0.3, 1.8))) : 22;
      const appear = k === 2 && r > 0 ? fade(u, 0.2 + r * 0.45) : 1;
      if (appear <= 0) continue;
      mono(TL.x0, y - 18, 'http_requests_total' + SER[r][0], { 'font-size': 14, fill: dropped ? OFF : MUT, opacity: Math.min(op, appear), 'text-decoration': dropped ? 'line-through' : null });
      row(y, showN, { op: Math.min(op, appear), sel: (i) => k >= 1 && i === 21 });
      if (k >= 1) { const vop = k === 1 ? fade(u, 1.2) : k === 2 && r > 0 ? fade(u, 0.5 + r * 0.45) : 1;
        card(900, y, 82, 34, { rx: 8, stroke: dropped ? OFF : ACC, fill: dropped ? PANEL : ACCBG, text: String(SER[r][1]), mono: true, fs: 16, fw: 800, color: dropped ? OFF : ACC, op: Math.min(op, vop) }); } }
    nowLine(70, 312, k === 0 ? E(u, 1.8, 2.5) : 1);
    if (k === 0) pill(X(0) - 80, 82, '기준 시각 = now', ACC, pop(u, 2.2), { fs: 14 });
    if (k === 1) { el('rect', { x: TL.x0 - 6, y: RY[0] - 12, width: X(-15) - TL.x0 + 18, height: 24, rx: 6, fill: SOFT, opacity: fade(u, 1.6) * 0.9 });
      tx((TL.x0 + X(-15)) / 2, RY[0] + 6, '과거 샘플은 안 잡힌다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.7) }); }
    if (k === 2) { el('path', { d: `M945,${RY[0] - 18} h6 v${RY[2] - RY[0] + 36} h-6`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.8) });
      tx(480, 360, '시계열 3개 × 값 1개 = 값 3개', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.0) }); }
    if (k === 3) { tx(480, 362, '매칭 시계열', { 'font-size': 16, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.3) });
      mono(500, 362, `${u < 1.4 ? 3 : 1}개`, { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
      sub(640, 362, '형태는 그대로 시계열마다 1점', fade(u, 1.8), { 'font-size': 15 }); }
    if (k === 4) { [['숫자 패널', '3'], ['알림 비교식', '3 > 0  참'], ['시간축 그래프', '점 하나씩']].forEach(([a, b], i) => { const cx = 230 + i * 250, s = pop(u, 0.3 + i * 0.35);
        card(cx, 368, 220, 56, { rx: 10, stroke: INFO, sw: 2, s });
        tx(cx, 360, a, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 0.4 + i * 0.35) });
        mono(cx, 384, b, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.4 + i * 0.35) }); });
      pill(250, 40, '결과 타입 = instant vector', INFO, pop(u, 1.5), { fs: 14 }); } }

  // ---------- 2. Range vector ----------
  function windowBand(y0, y1, t0, t1, op, col) { el('rect', { x: X(t0), y: y0, width: X(t1) - X(t0), height: y1 - y0, rx: 8, fill: col === WARN ? WARNBG : ACCBG, stroke: col || ACC, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: op }); }
  function s2(t, c) { const { k, u } = c, y = 170;
    if (k <= 2) { spans(330, 52, [['http_requests_total', {}], ['[5m]', { fill: ACC, 'font-weight': 800 }]], { 'font-size': 20, opacity: k === 0 ? fade(u, 0.2) : 1 });
      if (k === 0) sub(480, 84, '대괄호 안 = 되돌아볼 창의 길이 (lookback)', fade(u, 0.9), { 'font-size': 15 }); }
    const w = k === 0 ? 0 : k === 1 ? E(u, 0.3, 1.8) : 1;
    if (k <= 2 && w > 0) { windowBand(y - 44, y + 44, lerp(0, -300, w) - 6, 6, 1);
      if (w > 0.95) { mono(X(-300), y - 54, 't-5m', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle' }); mono(X(0), y - 54, 'now', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle' }); } }
    if (k <= 2) { timeAxis(250, 1);
      const nOn = k === 2 ? Math.floor(lerp(0, 20, E(u, 0.2, 1.6))) : 0;
      row(y, 22, { sel: (i) => (k === 1 && i >= 2 && X(TS[i]) >= X(lerp(0, -300, w))) || (k === 2 && i >= 22 - nOn) });
      if (k === 1) sub(X(-150), y + 70, '한 점 → 창 안 구간 전체', fade(u, 1.8), { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      if (k === 2) { mono(860, 312, `샘플 ${nOn} / 20`, { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
        const arr = ['1002 @t-4m45s', '1009 @t-4m30s', '…', '1027 @now'];
        arr.forEach((s, i) => { const at = 1.6 + i * 0.25; card(190 + i * 170, 372, s === '…' ? 60 : 150, 38, { rx: 6, text: s, mono: true, fs: 14, fw: 700, stroke: s === '…' ? 'none' : ACC, fill: s === '…' ? 'none' : PANEL, s: pop(u, at) }); });
        sub(140, 318, '(시각, 값) 쌍의 배열', fade(u, 1.5), { 'text-anchor': 'start', 'font-size': 15, 'font-weight': 700, fill: INK }); }
      return; }
    if (k === 3) { tx(480, 50, '15초마다 수집할 때 창에 담기는 샘플 수', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['[30s]', 2], ['[5m]', 20], ['[1h]', 240]].forEach(([w2, n], i) => { const yy = 120 + i * 90, g = E(u, 0.3 + i * 0.4, 1.3 + i * 0.4);
        mono(150, yy + 14, w2, { 'font-size': 20, 'font-weight': 800, fill: i === 1 ? ACC : INK, 'text-anchor': 'end' });
        R.hbar(180, yy, 560, n * g, 240, { h: 22, col: i === 1 ? ACC : INFO, text: `${Math.round(n * g)}개`, label: g > 0.02 }); });
      sub(480, 390, '창이 넓을수록 배열이 길고, 요약 결과가 더 완만해진다', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k4: 그래프 한 점에 값 20개는 못 찍는다
    R.axes(160, 80, 420, 250, { x: [0, 10], y: [1000, 1030], yt: [1000, 1015, 1030], xl: '시간', yl: '값' });
    const gx = 160 + 420 * 0.85;
    V200.slice(2).forEach((v, i) => { const s = clamp((E(u, 0.2, 1.4) * 20) - i); if (s <= 0) return;
      el('circle', { cx: gx, cy: 80 + 250 - ((v - 1000) / 30) * 250, r: 5 * s, fill: ACC, opacity: 0.75 }); });
    mono(gx, 70, '값 20개?', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    cross(gx, 205, 26, pop(u, 1.6));
    card(780, 160, 260, 70, { rx: 10, stroke: BAD, fill: BADBG, text: 'range vector는\n그래프에 바로 못 그린다', fs: 15, s: pop(u, 1.8) });
    card(780, 270, 260, 52, { rx: 10, stroke: GOOD, text: '함수로 요약 → 1점', fs: 15, color: GOOD, s: pop(u, 2.2) }); }

  // ---------- 3. rate() 계산 ----------
  // 창 [5m] 안 샘플 20개, 외삽 규칙: 첫 점이 창 시작에서 15s 안이면 창 끝까지 늘린다 → 25 × 300/285 = 26.3
  function counterPlot(o) { o = o || {};
    const ax = R.axes(110, 60, 560, 270, { x: [-300, 0], y: [1000, 1030], xt: [-300, -150, 0], yt: [1000, 1010, 1020, 1030], xl: '초 (now = 0)', yl: 'http_requests_total' });
    const pts = TS.slice(2).map((tt, i) => [tt, V200[i + 2]]);
    R.line(ax, pts, o.u ?? 1, MUT, { sw: 2 }); R.scatter(ax, pts.map((p) => [p[0], p[1], INK]), { u: o.u ?? 1, r: 4 });
    return { ax, pts }; }
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { const { ax } = counterPlot({ u: k === 0 ? E(u, 0.2, 1.4) : 1 });
      const A = [ax.X(-285), ax.Y(1002)], Bp = [ax.X(0), ax.Y(1027)];
      if (k === 0) { card(Bp[0] + 30, Bp[1] + 40, 120, 34, { rx: 8, text: '지금 1027', mono: true, fs: 15, stroke: INK, s: pop(u, 1.4) });
        tx(840, 140, '1027 한 점으로는', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
        tx(840, 166, '초당 몇 건인지 모른다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
        const g = E(u, 2.0, 2.6); grow(A[0], A[1], Bp[0], A[1], g, MUT, { plain: true, dash: '4 4' }); grow(Bp[0], A[1], Bp[0], Bp[1], g, MUT, { plain: true, dash: '4 4' });
        sub(840, 226, '두 점의 차이 ÷ 시간 = 기울기', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
      // 기울기 선: 첫 점 → 끝 점, 그리고 창 시작(-300)까지 외삽
      const g = k === 1 ? E(u, 0.2, 0.9) : 1;
      grow(A[0], A[1], Bp[0], Bp[1], g, ACC, { plain: true, sw: 3 });
      const ex = k === 1 ? E(u, 0.9, 1.4) : 1, slope = (1027 - 1002) / 285, y300 = ax.Y(1002 - slope * 15);
      if (ex > 0) el('line', { x1: A[0], y1: A[1], x2: lerp(A[0], ax.X(-300), ex), y2: lerp(A[1], y300, ex), stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '5 4' });
      el('circle', { cx: A[0], cy: A[1], r: 7, fill: ACC }); el('circle', { cx: Bp[0], cy: Bp[1], r: 7, fill: ACC });
      const lines = k === 1 ? ['증가 1027 − 1002 = 25', '창 끝까지 외삽 25 × 300/285', '= 26.3건 ÷ 300초', 'rate = 0.088 /초'] : ['increase = 26.3건', '초로 나누지 않는다', '외삽 때문에 정수가 아니다'];
      lines.forEach((s, i) => { const at = k === 1 ? 1.0 + i * 0.4 : 0.3 + i * 0.4, last = i === lines.length - 1 && k === 1;
        (/[가-힣]/.test(s) ? tx : mono)(700, 110 + i * 40, s, { 'font-size': last || (k === 2 && i === 0) ? 18 : 15, 'font-weight': last || (k === 2 && i === 0) ? 800 : 600, fill: last || (k === 2 && i === 0) ? ACC : INK, opacity: fade(u, at) }); });
      if (k === 1) card(800, 330, 230, 50, { rx: 10, stroke: INFO, fill: INFOBG, text: '출력 = instant vector 1점', fs: 15, color: INFO, s: pop(u, 2.4) });
      if (k === 2) card(800, 300, 230, 50, { rx: 10, stroke: WARN, text: '"5분 동안 몇 건"', fs: 16, color: WARN, s: pop(u, 1.6) });
      return; }
    if (k === 3) { // gauge: 오르내리는 큐 길이 (예시 값)
      const Q = [4, 6, 5, 9, 12, 8, 7, 5, 6, 10, 14, 9, 7, 6, 5, 8, 11, 9, 6, 5];
      const ax = R.axes(110, 70, 560, 260, { x: [-285, 0], y: [0, 16], xt: [-285, 0], yt: [0, 8, 16], xl: '초', yl: 'queue_depth (gauge, 예시)' });
      const pts = Q.map((q, i) => [-285 + 15 * i, q]);
      R.line(ax, pts, E(u, 0.1, 1.0), WARN, { sw: 2.4 });
      const av = E(u, 1.0, 1.6); if (av > 0) el('line', { x1: ax.X(-285), y1: ax.Y(7.6), x2: lerp(ax.X(-285), ax.X(0), av), y2: ax.Y(7.6), stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' });
      el('circle', { cx: ax.X(-135), cy: ax.Y(14), r: 8, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.8) });
      mono(720, 140, 'avg_over_time = 7.6', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.3) });
      mono(720, 180, 'max_over_time = 14', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
      tx(720, 240, 'gauge는 오르내리므로', { 'font-size': 15, opacity: fade(u, 2.2) });
      tx(720, 264, '기울기 대신 평균·최댓값', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    // k4: [ ] 안은 range → 함수 → instant
    [['range vector', '[5m] 안 샘플 배열', WARN, 170], ['함수', 'rate · increase · *_over_time', ACC, 480], ['instant vector', '시계열마다 1점', INFO, 790]].forEach(([a, b, col, cx], i) => {
      const s = pop(u, 0.2 + i * 0.6); card(cx, 190, 240, 92, { rx: 12, stroke: col, sw: 2.5, s });
      tx(cx, 182, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.6) });
      tx(cx, 210, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.6) });
      if (i < 2) grow(cx + 124, 190, cx + 186, 190, E(u, 0.5 + i * 0.6, 0.9 + i * 0.6), MUT); });
    dot([[294, 190], [356, 190], [604, 190], [666, 190]], seg(u, 1.6, 2.4), ACC, 7);
    tx(480, 320, '대괄호 안은 언제나 range, range는 함수의 입력으로만', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // ---------- 4. offset & step ----------
  const OL = { x0: 90, x1: 870, t0: -75 * 60 };     // 분 단위 긴 축
  const XO = (t) => OL.x0 + ((t - OL.t0) / -OL.t0) * (OL.x1 - OL.x0);
  function longAxis(y) { el('line', { x1: OL.x0, y1: y, x2: OL.x1 + 10, y2: y, stroke: MUT, 'stroke-width': 1.8 });
    [-75, -60, -45, -30, -15, 0].forEach((m) => { el('line', { x1: XO(m * 60), y1: y, x2: XO(m * 60), y2: y + 6, stroke: MUT });
      mono(XO(m * 60), y + 24, m === 0 ? 'now' : `${m}m`, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); });
    for (let i = 0; i <= 75; i += 1) el('circle', { cx: XO(-i * 60), cy: y - 40, r: 2.4, fill: OFF }); }
  function band(tEnd, wsec, col, label, op) { const x0 = XO(tEnd - wsec), x1 = XO(tEnd);
    el('rect', { x: x0, y: 120, width: Math.max(4, x1 - x0), height: 120, rx: 6, fill: col === INFO ? INFOBG : ACCBG, stroke: col || ACC, 'stroke-width': 2, opacity: op });
    el('line', { x1, y1: 104, x2: x1, y2: 254, stroke: col || ACC, 'stroke-width': 2.5, opacity: op });
    if (label) mono(x1, 96, label, { 'font-size': 14, 'font-weight': 700, fill: col || ACC, 'text-anchor': x1 > 800 ? 'end' : 'middle', opacity: op }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { longAxis(290);
      if (k === 0) { const sh = E(u, 0.8, 1.9), tEnd = lerp(0, -300, sh);
        band(tEnd, 300, ACC, sh < 0.5 ? '기준 = now' : '기준 = now-5m', 1);
        mono(480, 50, 'rate(http_requests_total[5m] offset 5m)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
        sub(480, 352, '기준 시각만 과거로 옮긴다. 창 길이 5분은 그대로', fade(u, 2.0), { 'font-size': 15 }); return; }
      band(0, 300, ACC, '지금', fade(u, 0.2)); band(-3600, 300, INFO, '1시간 전', fade(u, 0.7));
      const g = E(u, 1.0, 1.8); el('path', { d: `M${XO(-3750)},250 Q${(XO(-3750) + XO(-150)) / 2},${lerp(250, 330, g)} ${lerp(XO(-3750), XO(-150), g)},250`, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      spans(150, 50, [['rate(…[5m])', { fill: ACC, 'font-weight': 700 }], ['  ÷  ', {}], ['rate(…[5m] offset 1h)', { fill: INFO, 'font-weight': 700 }]], { 'font-size': 17, opacity: fade(u, 1.4) });
      sub(480, 370, '비율이 1에서 크게 벗어나면 트래픽 급변 신호', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    // k2~k4: 그래프의 점 찍기 (query_range)
    const big = k === 4;
    const span = big ? 40 * 60 : 10 * 60, stp = big ? 600 : 15, ax0 = 110, ax1 = 850, gy = 250;
    const GX = (tt) => ax0 + ((tt + span) / span) * (ax1 - ax0);
    el('line', { x1: ax0, y1: gy, x2: ax1 + 10, y2: gy, stroke: MUT, 'stroke-width': 1.8 });
    (big ? [-40, -30, -20, -10, 0] : [-10, -8, -6, -4, -2, 0]).forEach((m) => mono(GX(m * 60), gy + 24, m === 0 ? 'now' : `${m}m`, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }));
    const nPts = Math.round(span / stp) + 1, shown = k === 2 ? Math.floor(lerp(0, nPts, E(u, 0.3, 2.2))) : nPts;
    const yv = (i) => gy - 70 - Math.sin(i * 0.35) * 30 - i * (big ? 6 : 1.2);
    for (let i = 0; i < shown; i++) el('circle', { cx: GX(-span + i * stp), cy: yv(i), r: big ? 7 : 4.5, fill: k === 3 && i === 32 ? ACC : INFO });
    if (k === 2) { mono(480, 50, '/api/v1/query_range?…&step=15s', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      const xi = GX(-span + Math.max(0, shown - 1) * stp); if (shown > 0) el('line', { x1: xi, y1: 90, x2: xi, y2: gy, stroke: INFO, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
      mono(860, 330, `점 ${shown} / ${nPts}`, { 'font-size': 17, 'font-weight': 800, fill: INFO, 'text-anchor': 'end' });
      sub(300, 330, '점마다 instant 쿼리를 한 번씩', fade(u, 1.0), { 'font-size': 15 }); }
    if (k === 3) { const xe = GX(-span + 32 * stp), xs = GX(-span + 32 * stp - 300), g = E(u, 0.3, 1.4);
      el('rect', { x: lerp(xe, xs, g), y: 110, width: xe - lerp(xe, xs, g), height: 145, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: 0.85 });
      mono((xs + xe) / 2, 100, '[5m] 창', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(480, 330, '창 = 점 하나를 계산할 때 되돌아보는 길이', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) });
      sub(480, 358, 'step(점 간격 15초)과는 따로 정한다', fade(u, 1.9), { 'font-size': 15 }); }
    if (big) { for (let i = 0; i < nPts; i++) { const xe = GX(-span + i * stp), xs = GX(-span + i * stp - 300), op = fade(u, 0.3 + i * 0.25);
        el('rect', { x: xs, y: 110, width: xe - xs, height: 145, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5, opacity: op * 0.9 });
        if (i < nPts - 1) { const ns = GX(-span + (i + 1) * stp - 300); el('rect', { x: xe + 2, y: 110, width: ns - xe - 4, height: 145, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: fade(u, 1.6) }); } }
      for (let i = 0; i < nPts; i++) el('circle', { cx: GX(-span + i * stp), cy: yv(i), r: 7, fill: INFO });
      mono(480, 50, 'step 10m  >  창 [5m]', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      tx(480, 330, '빨간 칸의 샘플은 어느 점도 보지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      sub(480, 358, '짧은 스파이크가 그래프에서 빠지고 선이 튄다', fade(u, 2.2), { 'font-size': 15 }); } }

  // ---------- 5. 실무 함정 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { R.browser(480, 200, 760, 250, null, { s: pop(u, 0.1) });
      mono(130, 130, 'http_requests_total[5m]', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.4) });
      const er = fade(u, 1.0); el('rect', { x: 120, y: 160, width: 720, height: 76, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, opacity: er });
      mono(136, 190, 'invalid expression type "range vector"', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: er });
      mono(136, 216, 'for range query, must be Scalar or instant Vector', { 'font-size': 15, fill: BAD, opacity: er });
      mono(130, 290, 'rate(http_requests_total[5m])', { 'font-size': 17, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) });
      check(470, 284, 12, pop(u, 2.1));
      sub(480, 372, '그래프(range query)는 instant vector만 받는다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1 || k === 2) { timeAxis(300, 1); const y = 190, wsec = k === 1 ? 15 : 60;
      row(y, 22, { sel: (i) => TS[i] > -wsec, col: k === 1 ? BAD : GOOD });
      const g = E(u, 0.2, 1.0); windowBand(y - 40, y + 40, -wsec * g - 4, 6, 1, k === 1 ? WARN : ACC);
      mono(480, 52, `rate(http_requests_total[${k === 1 ? '15s' : '1m'}])`, { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      mono(480, 82, 'scrape_interval = 15s', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      if (k === 1) { card(300, 370, 300, 52, { rx: 10, stroke: BAD, fill: BADBG, text: '창 안 샘플 1개', fs: 16, color: BAD, s: pop(u, 1.2) });
        card(660, 370, 300, 52, { rx: 10, stroke: BAD, text: '기울기 없음 → 빈 결과', fs: 16, color: BAD, s: pop(u, 1.8) }); }
      else { el('line', { x1: X(-45), y1: y + 8, x2: X(0), y2: y - 8, stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 1.0) });
        card(300, 370, 300, 52, { rx: 10, stroke: GOOD, fill: GOODBG, text: '창 안 샘플 4개', fs: 16, color: GOOD, s: pop(u, 1.2) });
        card(660, 370, 300, 52, { rx: 10, stroke: GOOD, text: 'rate[1m] = 0.067 /초', fs: 16, color: GOOD, mono: true, s: pop(u, 1.8) }); }
      return; }
    if (k === 3) { tx(480, 52, '레이블 셀렉터 세 줄, 결과 시계열 수', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['{status="500"}', '정확 일치', '1개', INK], ['{status=~"5.."}', '정규식 · 5xx 전체', '1개', INFO], ['{staus="500"}', '오타 · 에러 없음', '0개', BAD]].forEach(([s, d, n, col], i) => {
        const y = 120 + i * 80, s0 = pop(u, 0.3 + i * 0.5);
        card(480, y, 720, 60, { rx: 10, stroke: i === 2 ? BAD : GRID, sw: i === 2 ? 2.5 : 1.5, fill: i === 2 ? BADBG : PANEL, s: s0 });
        mono(150, y + 6, 'http_requests_total' + s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.5) });
        tx(690, y + 6, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.4 + i * 0.5) });
        mono(810, y + 7, n, { 'font-size': 20, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.5) }); });
      tx(480, 380, '레이블 이름을 틀려도 PromQL은 조용히 빈 결과만 돌려준다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) }); return; }
    tx(480, 70, '세 가지만 지키면 된다', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, opacity: fade(u, 0.1) });
    [['range는 언제나 함수의 입력으로', 'rate(x[5m])처럼 감싼다'], ['창은 스크레이프 간격의 4배 이상', '15s 간격이면 [1m] 이상'], ['레이블은 이름까지 정확히', '= 정확 일치, =~ 정규식']].forEach(([a, b], i) => {
      const y = 140 + i * 82, s = pop(u, 0.3 + i * 0.45); card(480, y, 600, 66, { rx: 12, stroke: GOOD, sw: 2, s }); check(222, y, 12, s);
      tx(254, y - 4, a, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.45) });
      mono(254, y + 20, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.45) }); }); }

  const quiz = [
    { q: '15초마다 수집되는 http_requests_total을 메트릭명만 써서 조회하면 시계열마다 몇 개의 값이 나오는가?',
      o: ['지난 5분 동안의 20개', 'now 시점의 1개', '수집이 시작된 뒤 모든 값'], a: 1,
      why: '범위 표기가 없으면 instant vector다. 시계열 3개면 1027·412·3처럼 시계열마다 now 값 하나씩, 모두 3개가 나온다.' },
    { q: '15초 간격으로 수집할 때 http_requests_total[5m]에는 시계열마다 대략 몇 개의 샘플이 담기는가?',
      o: ['1개', '5개', '약 20개'], a: 2,
      why: '5분은 300초이고 15초마다 하나씩 쌓이므로 300 ÷ 15 = 20개의 (시각, 값) 쌍이 배열로 담긴다.' },
    { q: 'rate(http_requests_total[5m])가 돌려주는 결과의 형태는 무엇인가?',
      o: ['시계열마다 초당 증가율 1점인 instant vector', '창 안 샘플을 그대로 담은 range vector', '모든 시계열을 더한 숫자 하나'], a: 0,
      why: 'rate는 range vector를 받아 기울기를 재고 시계열마다 한 점을 낸다. 그래서 다시 그래프에 그릴 수 있다.' },
    { q: '그래프의 step과 range의 [5m] 창이 정하는 것은 각각 무엇인가?',
      o: ['step은 창 길이, [5m]는 점 간격', 'step은 점을 찍는 간격, [5m]는 한 점을 계산할 때 되돌아보는 길이', '둘 다 offset처럼 기준 시각을 옮긴다'], a: 1,
      why: 'step은 query_range가 점을 찍는 간격이고 [5m]는 점 하나마다 몇 분을 되돌아볼지다. step이 창보다 크면 사이 샘플이 빠진다.' },
    { q: '스크레이프 간격이 15초인데 rate(x[15s])가 자주 빈 결과를 낸다. 이유는 무엇인가?',
      o: ['창 안에 샘플이 1개뿐이라 기울기를 낼 수 없어서', 'rate는 15초 단위를 지원하지 않아서', '레이블 셀렉터가 빠져서'], a: 0,
      why: '기울기를 내려면 창 안에 점이 두 개 이상 있어야 한다. [1m]으로 넓히면 점 4개가 들어온다.' },
  ];

  const summary = [
    '메트릭명만 쓰면 시계열마다 now 값 하나가 나오는 instant vector가 된다.',
    '[5m]을 붙이면 창 안 샘플 배열이 되고, 15초 수집이면 20개쯤 담긴다.',
    'range vector는 그래프에 바로 못 그리고 rate 같은 함수로 한 점씩 요약한다.',
    'offset은 기준 시각을, step은 점 간격을, [5m]은 되돌아볼 길이를 정한다.',
  ];
  const review = [
    { q: 'Grafana 그래프 패널에 http_requests_total[5m]을 넣었더니 invalid expression type 오류가 났다. 먼저 고칠 것은?',
      o: ['스크레이프 간격을 5분으로 늘린다', 'rate(http_requests_total[5m])처럼 함수로 감싼다', '레이블 셀렉터에 status를 더한다'], a: 1,
      why: '그래프는 시각마다 한 점이 필요한데 range vector는 샘플 배열이다. 함수로 감싸 instant vector로 바꾸면 그려진다.' },
    { q: '수집 간격을 15초에서 30초로 바꾼 뒤 rate(x[30s]) 패널이 비었다. 가장 알맞은 조치는?',
      o: ['창을 [2m]처럼 간격의 4배 이상으로 넓힌다', 'offset 30s를 붙인다', 'step을 30초로 줄인다'], a: 0,
      why: '30초 간격에 [30s] 창이면 점이 하나뿐이라 기울기를 못 낸다. 창을 넓혀야 점이 여러 개 들어온다.' },
    { q: 'rate(x[5m]) 그래프의 step을 10분으로 키웠더니 짧은 스파이크가 사라졌다. 이유로 맞는 것은?',
      o: ['offset이 자동으로 붙어서', 'rate가 스파이크를 리셋으로 보고 지워서', '점 사이 5분 구간의 샘플을 어느 점도 보지 않아서'], a: 2,
      why: '점마다 되돌아보는 길이는 5분인데 점은 10분마다 찍힌다. 그 사이 샘플은 계산에 들어가지 않는다.' },
  ];

  R.page({ title: '시간축 위의 샘플 선택', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
