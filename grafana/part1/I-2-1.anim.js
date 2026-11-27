/* I-2-1 시각화 종류 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 같은 지연·요청 데이터를 time series → stat → gauge → bar → table → heatmap 으로 바꿔 그린다.
 * 데이터(SERIES·CAT·TBL·HEAT·RPS)는 예전 화면의 예시 데이터다. 그림에 "예시"로 적는다.
 * 표시 문자열은 Grafana valueFormats 를 node 로 옮겨 돌린 값: 0.42 s → "420 ms", 1240 reqps → decimals 0 "1K req/s" · decimals 2 "1.24K req/s". */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 예시 데이터 ----------
  const SERIES = [0.18, 0.22, 0.19, 0.25, 0.31, 0.28, 0.35, 0.42, 0.38, 0.33, 0.29, 0.31];
  const CAT = [['/pay', 0.42], ['/search', 0.35], ['/cart', 0.28], ['/login', 0.19], ['/home', 0.12]];
  const TBL = [['/pay', 320, 0.42, 0.8], ['/search', 910, 0.35, 0.2], ['/cart', 540, 0.28, 0.1], ['/login', 210, 0.19, 0.4], ['/home', 1180, 0.12, 0.0]];
  const HEAT = [[1, 0, 1, 2, 4, 3, 6, 9, 7, 5, 3, 4], [3, 4, 3, 5, 7, 6, 8, 10, 9, 7, 6, 6], [8, 9, 8, 7, 6, 7, 5, 4, 5, 6, 8, 7], [12, 11, 13, 10, 8, 9, 7, 5, 6, 8, 10, 9]];   // 위 = 느린 버킷
  const RPS = [1100, 1180, 1150, 1210, 1260, 1190, 1230, 1240, null];   // 마지막은 빈 값
  const ms = (v) => Math.round(v * 1000) + ' ms';

  // ---------- 공통 부품 ----------
  function gpanel(x, y, w, h, title, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8, opacity: op });
    if (title) tx(x + 12, y + 22, title, { 'font-size': 15, 'font-weight': 700, opacity: op });
    if (o.type) mono(x + w - 12, y + 22, o.type, { 'font-size': 14, fill: o.tcol || MUT, 'text-anchor': 'end', opacity: op, 'font-weight': 700 }); }
  // 시계열 좌표판
  const TS = { x: 90, y: 70, w: 500, h: 260, max: 0.5 };
  const PX = (i, n) => TS.x + (i / (n - 1)) * TS.w, PY = (v) => TS.y + TS.h - (v / TS.max) * TS.h;
  function tsAxes(op, unit) { el('line', { x1: TS.x, y1: TS.y + TS.h, x2: TS.x + TS.w, y2: TS.y + TS.h, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    el('line', { x1: TS.x, y1: TS.y, x2: TS.x, y2: TS.y + TS.h, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    [0.1, 0.2, 0.3, 0.4].forEach((v) => { el('line', { x1: TS.x, y1: PY(v), x2: TS.x + TS.w, y2: PY(v), stroke: GRID, 'stroke-dasharray': '3 4', opacity: op });
      mono(TS.x - 8, PY(v) + 5, unit ? ms(v) : String(v), { 'font-size': 13.5, fill: unit ? ACC : MUT, 'text-anchor': 'end', opacity: op, 'font-weight': unit ? 700 : 400 }); });
    tx(TS.x + TS.w, TS.y + TS.h + 26, '시간 →', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: op }); }
  function tsLine(data, u, o) { o = o || {}; const n = data.length, segs = []; let cur = [];
    data.forEach((v, i) => { if (v == null) { if (cur.length) segs.push(cur); cur = []; } else cur.push([PX(i, n), PY(v), i]); }); if (cur.length) segs.push(cur);
    const lim = u * (n - 1);
    segs.forEach((sg) => { const P = sg.filter((p) => p[2] <= lim).map((p) => [p[0], p[1]]); if (P.length < 1) return;
      const nx = sg.find((p) => p[2] > lim); if (nx && P.length) { const last = sg[sg.indexOf(nx) - 1]; if (last) { const f = lim - last[2]; P.push([lerp(last[0], nx[0], f), lerp(last[1], nx[1], f)]); } }
      if (o.fill) el('polygon', { points: [[P[0][0], TS.y + TS.h], ...P, [P[P.length - 1][0], TS.y + TS.h]].map((p) => p.join(',')).join(' '), fill: ACC, opacity: o.fill });
      if (P.length > 1) el('polyline', { points: P.map((p) => p.join(',')).join(' '), fill: 'none', stroke: o.col || ACC, 'stroke-width': o.sw || 2.5, 'stroke-linejoin': 'round' }); }); }
  function spark(x, y, w, h, data, lo, hi, u, col, o) { o = o || {}; const n = data.length; const P = []; data.forEach((v, i) => { if (v != null && i / (n - 1) <= u) P.push([x + (i / (n - 1)) * w, y + h - ((v - lo) / (hi - lo)) * h]); });
    if (P.length < 2) return; if (o.fill) el('polygon', { points: [[P[0][0], y + h], ...P, [P[P.length - 1][0], y + h]].map((p) => p.join(',')).join(' '), fill: col, opacity: o.fill });
    el('polyline', { points: P.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': o.sw || 2.2, opacity: o.op ?? 1 }); }
  function note(x, y, s, op, a) { tx(x, y, s, Object.assign({ 'font-size': 15.5, 'font-weight': 700, opacity: op }, a || {})); }
  // 반원 게이지
  function gauge(cx, cy, r, v, o) { o = o || {}; const A = (p) => Math.PI * (1 - p / 100), P = (p, rr) => [cx + rr * Math.cos(A(p)), cy - rr * Math.sin(A(p))];
    const arc = (a, b, col, sw, rr, op) => { if (b - a < 0.2) return; const [x1, y1] = P(a, rr), [x2, y2] = P(b, rr); el('path', { d: `M${x1},${y1} A${rr},${rr} 0 0 1 ${x2},${y2}`, fill: 'none', stroke: col, 'stroke-width': sw, opacity: op ?? 1 }); };
    arc(0, 100, SOFT, 22, r);
    if (o.fillTo != null) arc(0, o.fillTo, o.fillCol || GOOD, 22, r);
    if (o.marks) { const m = o.marks; arc(0, Math.min(70, 100 * m), GOOD, 7, r + 20); if (m > 0.7) arc(70, Math.min(90, 100 * m), WARN, 7, r + 20); if (m > 0.9) arc(90, 100 * m, BAD, 7, r + 20); }
    if (o.needle != null) { const [nx, ny] = P(o.needle, r - 30); el('line', { x1: cx, y1: cy, x2: nx, y2: ny, stroke: INK, 'stroke-width': 3.5, 'stroke-linecap': 'round' }); el('circle', { cx, cy, r: 6, fill: INK }); }
    return P; }

  // ========== 1. Time series ==========
  function s1(t, c) { const { k, u } = c, n = SERIES.length;
    sub(TS.x + 40, 50, 'p99 지연 (예시)', 1, { 'font-size': 13.5, 'text-anchor': 'start' });
    if (k === 0) { const g = E(u, 0.2, 1.1); el('line', { x1: TS.x, y1: TS.y + TS.h, x2: TS.x + TS.w * g, y2: TS.y + TS.h, stroke: MUT, 'stroke-width': 2 }); el('line', { x1: TS.x, y1: TS.y + TS.h, x2: TS.x, y2: TS.y + TS.h - TS.h * g, stroke: MUT, 'stroke-width': 2 });
      note(TS.x + TS.w - 60, TS.y + TS.h + 30, 'x = 시간', fade(u, 1.2)); note(TS.x + 10, TS.y + 10, 'y = 값', fade(u, 1.4));
      pill(780, 150, 'type: timeseries', ACC, pop(u, 1.6), { mono: true, fs: 15 }); sub(780, 200, '(시간, 값) 쌍의 기본 선택지', fade(u, 2.0), { 'font-size': 15 }); return; }
    tsAxes(1, k >= 2);
    if (k === 1) { const lu = E(u, 0.3, 2.2); tsLine(SERIES, lu);
      SERIES.forEach((v, i) => { const at = 0.3 + (i / (n - 1)) * 1.9; if (u > at) el('circle', { cx: PX(i, n), cy: PY(v), r: 4.5, fill: ACC }); else if (u > at - 0.4) dot([[PX(i, n), TS.y - 10], [PX(i, n), PY(v)]], (u - at + 0.4) / 0.4, ACC, 4.5); });
      mono(780, 140, 'refId A', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) }); sub(780, 180, '구간마다 p99 하나씩', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(780, 212, '시간 순서대로 줄줄이 온다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    const fillOp = k >= 3 ? (k === 3 ? 0.1 * fade(u, 0.5, 1.0) : 0.1) : 0;
    if (k === 4 || k === 5) {}
    const data = k === 4 ? SERIES.map((v, i) => (i === 5 || i === 6 ? null : v)) : SERIES;
    tsLine(data, 1, { fill: fillOp, sw: k === 3 ? lerp(2.5, 3, fade(u, 0.5)) : 2.5 });
    if (k === 2) { const i = 7, x = PX(i, n), y = PY(SERIES[i]); el('circle', { cx: x, cy: y, r: 6, fill: ACC, opacity: fade(u, 1.0) }); pill(x, y - 28, '420 ms', ACC, pop(u, 1.1), { mono: true, fs: 14 });
      card(780, 140, 230, 60, { rx: 10, text: 'unit "s"\n0.42 → 420 ms', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.3) }); sub(780, 210, '1초 미만은 ms로 바꿔 쓴다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 3) { [['drawStyle', 'line'], ['lineWidth', '2'], ['fillOpacity', '10']].forEach(([a, v], i) => { card(780, 110 + i * 56, 230, 42, { rx: 8, stroke: ACC, s: pop(u, 0.3 + i * 0.35) });
        mono(680, 116 + i * 56, a, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.35) }); mono(880, 116 + i * 56, v, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 0.4 + i * 0.35) }); });
      sub(780, 300, '선 아래 10% 채움이 추세를 살린다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 4) { const xa = PX(4, n), xb = PX(7, n); el('rect', { x: xa + 6, y: TS.y, width: xb - xa - 12, height: TS.h, fill: BADBG, opacity: 0.6 * fade(u, 0.3) });
      sub((xa + xb) / 2, TS.y + 20, '수집 끊김', fade(u, 0.4), { fill: BAD, 'font-weight': 700, 'font-size': 14 });
      const g = E(u, 1.2, 1.8); el('line', { x1: xa, y1: PY(SERIES[4]), x2: lerp(xa, xb, g), y2: lerp(PY(SERIES[4]), PY(SERIES[7]), g), stroke: OFF, 'stroke-width': 2.5, 'stroke-dasharray': '5 5' });
      cross((xa + xb) / 2, (PY(SERIES[4]) + PY(SERIES[7])) / 2, 10, pop(u, 1.9));
      mono(780, 150, 'spanNulls: false', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      sub(780, 190, '빈 구간에서 선이 끊긴다', fade(u, 0.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(780, 236, '켜면 점선처럼 이어져', fade(u, 1.5), { 'font-size': 14.5 }); sub(780, 262, '수집 중단이 가려진다', fade(u, 1.5), { 'font-size': 14.5 }); return; }
    // k5 추세·스파이크·배포 전후
    const dx = (PX(5, n) + PX(6, n)) / 2; el('line', { x1: dx, y1: TS.y, x2: dx, y2: TS.y + TS.h, stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
    pill(dx, TS.y - 8, '배포', INFO, pop(u, 0.4), { fs: 13.5 });
    el('circle', { cx: PX(7, n), cy: PY(0.42), r: 13, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.0) });
    [['언제 튀었나', BAD, 1.0], ['배포 전후 변화', INFO, 1.5], ['여러 시리즈 겹쳐 비교', ACC, 2.0]].forEach(([s0, col, at], i) => note(680, 150 + i * 44, s0, fade(u, at), { fill: col })); }

  // ========== 2. Stat ==========
  function s2(t, c) { const { k, u } = c;
    const P = { x: 60, y: 60, w: 400, h: 280 };
    if (k === 0) { const f = E(u, 0.3, 1.5); gpanel(P.x, P.y, P.w, P.h, '현재 RPS', { type: f > 0.5 ? 'stat' : 'timeseries', tcol: f > 0.5 ? ACC : MUT });
      spark(P.x + 20 + 300 * f, P.y + 60, 360 * (1 - f) + 2, 180 * (1 - f) + 2, RPS, 1000, 1300, 1, ACC, { op: 1 - f });
      mono(P.x + P.w / 2, P.y + 180, '1.24K', { 'font-size': 56, 'font-weight': 800, 'text-anchor': 'middle', opacity: f, fill: INK });
      sub(720, 170, '선이 사라지고 숫자 하나가 남는다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const m = E(u, 0.8, 1.8); sub(260, 50, 'route 별 요청률 (예시 모양)', 1, { 'font-size': 13.5 });
      for (let r = 0; r < 5; r++) { const off = (r - 2) * 36 * (1 - m); spark(70, 120 + off + 20 * m, 380, 120, RPS.map((v, i) => (v == null ? null : v + Math.sin(i + r) * 30)), 900, 1400, 1, [ACC, INFO, WARN, GOOD, BAD][r], { sw: lerp(1.6, 4, m) * (r === 2 ? 1 : 1 - m * 0.9), op: r === 2 ? 1 : 1 - m }); }
      mono(700, 150, 'sum(rate(', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(700, 176, '  http_requests_total[1m]))', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
      sub(700, 230, '전부 더해 초당 요청 수 한 줄', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700, 'text-anchor': 'start' }); sub(700, 262, '결과는 여전히 시계열', fade(u, 2.2), { 'font-size': 14.5, 'text-anchor': 'start' }); return; }
    if (k === 2) { const n = RPS.length, X = (i) => 80 + i * 46, Y = (v) => 300 - ((v - 1000) / 300) * 180;
      el('line', { x1: 70, y1: 310, x2: 470, y2: 310, stroke: MUT, 'stroke-width': 1.6 });
      RPS.forEach((v, i) => { if (v == null) { el('circle', { cx: X(i), cy: 300, r: 7, fill: PANEL, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '3 2' }); mono(X(i), 334, 'null', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'middle' }); return; }
        const hot = i === 7, op = u > 1.0 && !hot ? 1 - 0.7 * E(u, 1.0, 1.5) : 1; el('circle', { cx: X(i), cy: Y(v), r: hot ? 8 : 5.5, fill: hot ? ACC : INK, opacity: op }); });
      grow(X(8), 290, X(7) + 12, Y(1240) + 8, E(u, 0.4, 1.0), ACC);
      mono(700, 120, 'calcs: ["lastNotNull"]', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.2) });
      sub(700, 160, '빈 값을 건너뛴 마지막 값 하나', fade(u, 0.8), { 'font-size': 15 });
      card(700, 250, 220, 80, { rx: 10, text: '1240', fs: 40, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.6) }); return; }
    // k3~: 숫자 패널
    const bgOn = k >= 3 ? (k === 3 ? E(u, 0.3, 0.9) : 1) : 0;
    const txt = k === 4 ? (u < 1.4 ? '1K' : '1.24K') : '1.24K';
    gpanel(P.x, P.y, P.w, P.h, '현재 RPS', { type: 'stat', fill: bgOn > 0.5 ? GOODBG : PANEL, stroke: bgOn > 0.5 ? GOOD : GRID });
    spark(P.x + 6, P.y + 205, P.w - 12, P.h - 211, RPS, 900, 1400, 1, GOOD, { fill: 0.25 * bgOn, op: 0.6 * bgOn });
    mono(P.x + P.w / 2, P.y + 150, txt, { 'font-size': 56, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 4 && u < 1.4 ? BAD : INK }); mono(P.x + P.w / 2, P.y + 185, 'req/s', { 'font-size': 18, 'text-anchor': 'middle', fill: MUT });
    if (k === 3) { mono(560, 140, 'colorMode: background', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) }); mono(560, 180, 'graphMode: area', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
      sub(560, 230, '배경색은 멀리서도, 뒤의 흐름은 가까이서', fade(u, 1.6), { 'font-size': 14.5, 'text-anchor': 'start' }); return; }
    if (k === 4) { [['decimals 0', '1K req/s', BAD], ['decimals 2', '1.24K req/s', GOOD]].forEach(([a, bb, col], i) => { const y = 130 + i * 80; card(700, y, 300, 58, { rx: 10, stroke: col, s: pop(u, 0.3 + i * 1.1) });
        mono(570, y + 6, a, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4 + i * 1.1) }); mono(830, y + 6, bb, { 'font-size': 17, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.4 + i * 1.1) }); });
      sub(700, 300, 'reqps는 1000을 넘으면 K를 붙인다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { const x0 = 520, W = 400, X = (v) => x0 + (v / 2500) * W, y = 160, g = E(u, 0.2, 1.0);
      el('rect', { x: x0, y, width: (X(2000) - x0) * g, height: 22, fill: GOOD, opacity: 0.85 }); el('rect', { x: X(2000), y, width: (X(2500) - X(2000)) * clamp(g * 2 - 1), height: 22, fill: BAD, opacity: 0.85 });
      [0, 1000, 2000, 2500].forEach((v) => mono(X(v), y + 44, String(v), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) }));
      const mx = X(1240); el('line', { x1: mx, y1: y - 14, x2: mx, y2: y + 30, stroke: INK, 'stroke-width': 3, opacity: fade(u, 1.2) }); mono(mx, y - 22, '1240', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      note(x0, 270, '1240 < 2000 → 초록, 배경이 조용하다', fade(u, 1.7), { fill: GOOD }); return; }
    // k6 reduce 규칙
    [['last', '지금', ACC], ['mean', '평균', INFO], ['max', '최고치', BAD]].forEach(([a, bb, col], i) => { const y = 110 + i * 70; pill(600, y, a, col, pop(u, 0.3 + i * 0.5), { mono: true, fs: 16 }); note(660, y + 6, bb, fade(u, 0.4 + i * 0.5)); });
    sub(700, 340, '무엇을 보여 줄지 목적에 맞춰 고른다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ========== 3. Gauge ==========
  function s3(t, c) { const { k, u } = c, CX = 300, CY = 300, RR = 150;
    if (k === 0) { const f = E(u, 0.4, 1.5); mono(CX, 200, '67', { 'font-size': 60, 'font-weight': 800, 'text-anchor': 'middle', opacity: 1 - f });
      if (f > 0) gauge(CX, CY, RR, 67, { fillTo: 67 * f, needle: 67 * f });
      sub(720, 160, 'stat은 값, gauge는 범위 안 위치', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const marks = k >= 2 ? (k === 2 ? E(u, 0.3, 1.5) : 1) : 0, nd = k === 3 ? 67 * E(u, 0.4, 1.4) : 67;
    if (k === 5) { gauge(CX, CY, RR, 0, { needle: 96 });
      mono(CX - RR - 10, CY + 30, '?', { 'font-size': 26, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); mono(CX + RR + 10, CY + 30, '?', { 'font-size': 26, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      mono(CX, CY + 56, '67%', { 'font-size': 34, 'font-weight': 800, 'text-anchor': 'middle' });
      note(560, 150, 'min / max가 없으면', fade(u, 0.4)); note(560, 186, '바늘 위치를 해석할 수 없다', fade(u, 0.9), { fill: BAD }); sub(700, 250, '눈금 없는 계기판', fade(u, 1.6), { 'font-size': 15 }); return; }
    const P = gauge(CX, CY, RR, 67, { fillTo: nd, fillCol: GOOD, needle: nd, marks });
    mono(CX, CY + 56, Math.round(nd) + '%', { 'font-size': 34, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: k === 1 ? fade(u, 1.0) : 1 });
    if (k === 1) { mono(560, 140, 'avg(rate(process_cpu_seconds_total[5m]))', { 'font-size': 14, opacity: fade(u, 0.3) }); mono(560, 166, '  * 100', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7) });
      sub(560, 214, '들어오는 값 67 (unit percent)', fade(u, 1.2), { 'font-size': 15, 'text-anchor': 'start', fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { mono(560, 140, 'showThresholdMarkers: true', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) }); mono(560, 170, 'showThresholdLabels: false', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.7) });
      sub(560, 220, '바깥 띠만 보고도 위험 구간 거리가 읽힌다', fade(u, 1.6), { 'font-size': 14.5, 'text-anchor': 'start' }); return; }
    if (k === 3 || k === 4) { mono(CX - RR, CY + 30, '0', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); mono(CX + RR, CY + 30, '100', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); }
    if (k === 3) { note(560, 150, 'min 0 · max 100 = 눈금', fade(u, 0.3)); sub(560, 196, '67은 3분의 2 지점', fade(u, 1.5), { 'font-size': 15, 'text-anchor': 'start' }); return; }
    // k4: 70·90 경계
    [[70, '70', WARN], [90, '90', BAD]].forEach(([v, s0, col], i) => { const [x, y] = P(v, RR + 42); mono(x, y, s0, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.3) }); });
    note(560, 150, '70부터 노랑, 90부터 빨강', fade(u, 0.5)); note(560, 196, '67은 초록, 노랑 문턱 바로 아래', fade(u, 1.4), { fill: GOOD }); }

  // ========== 4. Bar chart ==========
  const ALPHA = ['/cart', '/home', '/login', '/pay', '/search'];   // 정렬 전 순서(이름순)
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const f = E(u, 0.3, 1.4); tsAxes(1 - f, false); tsLine(SERIES, 1, { col: ACC }); el('rect', { x: TS.x - 60, y: TS.y - 10, width: TS.w + 80, height: TS.h + 50, fill: PANEL, opacity: f });
      CAT.forEach(([n], i) => pill(160 + i * 105, 220, n, INK, pop(u, 1.2 + i * 0.15), { mono: true, fs: 14 }));
      sub(420, 300, '비교 대상이 시간이 아니라 범주', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); pill(800, 120, 'type: barchart', ACC, pop(u, 0.4), { mono: true, fs: 15 }); return; }
    if (k === 1) { const m = E(u, 0.5, 1.6); sub(TS.x + 40, 50, 'route 별 p99 (예시)', 1, { 'font-size': 13.5, 'text-anchor': 'start' }); tsAxes(1, false);
      CAT.forEach(([n, v], i) => { const d = SERIES.map((x) => x * lerp(1, v / 0.31, m)); tsLine(d.map((x) => Math.min(x, 0.48)), 1, { col: [BAD, WARN, ACC, INFO, GOOD][i], sw: 2 }); if (m > 0.9) mono(TS.x + TS.w + 8, PY(Math.min(d[11], 0.48)) + 5, n, { 'font-size': 13.5, fill: [BAD, WARN, ACC, INFO, GOOD][i], 'font-weight': 700 }); });
      mono(780, 360, 'sum by (le, route)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); return; }
    const order = k >= 5 ? CAT.map((x) => x[0]) : ALPHA, so = k === 5 ? E(u, 0.4, 1.6) : 1;
    const rowY = (name) => { const a = ALPHA.indexOf(name), b = CAT.findIndex((x) => x[0] === name); return 90 + 56 * (k === 5 ? lerp(a, b, so) : order.indexOf(name)); };
    if (k === 2) { // 표 형식으로 한 순간
      tx(140, 70, 'format: table · instant: true', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: ACC, opacity: fade(u, 0.2) });
      ALPHA.forEach((n, i) => { const v = CAT.find((x) => x[0] === n)[1], y = 100 + i * 46, s0 = pop(u, 0.5 + i * 0.2); card(300, y + 16, 320, 38, { rx: 6, stroke: GRID, s: s0 });
        mono(160, y + 22, n, { 'font-size': 15, opacity: fade(u, 0.6 + i * 0.2) }); mono(440, y + 22, String(v), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.2) }); });
      sub(720, 200, '라벨마다 한 줄, 지금 한 순간 값', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(720, 232, '시간 흐름은 버린다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    const BX = 200, BW = 420;
    CAT.forEach(([n, v]) => { const y = rowY(n), g = k === 3 ? E(u, 0.3, 1.4) : 1, top = n === '/pay' && k >= 5;
      tx(BX - 14, y + 20, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono', fill: top ? BAD : INK });
      el('rect', { x: BX, y, width: BW * (v / 0.45) * g, height: 30, rx: 4, fill: top ? BAD : ACC, opacity: 0.85 });
      mono(BX + BW * (v / 0.45) * g + 8, y + 21, k >= 4 && !(k === 4 && u < 1.0) ? ms(v) : String(v), { 'font-size': 14.5, 'font-weight': 700, fill: k >= 4 ? ACC : INK, opacity: k === 3 ? fade(u, 1.4) : 1 }); });
    if (k === 3) { mono(780, 150, 'orientation: horizontal', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); mono(780, 180, 'showValue: always', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      sub(780, 230, '긴 이름도 안 잘린다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 4) { card(800, 160, 220, 60, { rx: 10, text: 'unit "s"\n0.42 → 420 ms', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.3) }); sub(800, 230, '길이로 비교, 숫자로 확인', fade(u, 1.5), { 'font-size': 15 }); return; }
    // k5 정렬 + 파이 배제
    sub(800, 110, 'Sort by 내림차순', fade(u, 0.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(800, 140, '가장 느린 /pay가 맨 위', fade(u, 1.6), { 'font-size': 14.5, fill: BAD });
    const pc = [800, 260]; let a0 = -Math.PI / 2; const tot = CAT.reduce((s0, x) => s0 + x[1], 0);
    CAT.forEach(([, v], i) => { const a1 = a0 + (v / tot) * Math.PI * 2, r = 50; el('path', { d: `M${pc[0]},${pc[1]} L${pc[0] + r * Math.cos(a0)},${pc[1] + r * Math.sin(a0)} A${r},${r} 0 0 1 ${pc[0] + r * Math.cos(a1)},${pc[1] + r * Math.sin(a1)} Z`, fill: [BAD, WARN, ACC, INFO, GOOD][i], opacity: 0.5 * fade(u, 1.8), stroke: PANEL }); a0 = a1; });
    cross(pc[0], pc[1], 20, pop(u, 2.1)); sub(800, 340, '각도 비교는 어렵다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ========== 5. Table ==========
  function s5(t, c) { const { k, u } = c;
    const X0 = 60, CW = [150, 120, 110, 110], H = ['route', 'Value', 'p99', 'err%'], H2 = ['Endpoint', 'RPS', 'p99', 'err%'];
    const ncol = k <= 1 ? 2 : 4, ren = k >= 3 ? (k === 3 ? E(u, 0.4, 1.2) : 1) : 0;
    if (k === 5) { [['여러 컬럼을 한 행씩', INK], ['transform으로 합치고 정리', ACC], ['override로 한 컬럼만 강조', BAD]].forEach(([s0, col], i) => { card(480, 110 + i * 90, 520, 66, { rx: 12, stroke: col, sw: 2.2, text: s0, fs: 18, color: col, s: pop(u, 0.3 + i * 0.5) }); });
      sub(480, 390, '숫자 하나로 못 줄이는 데이터: 로그·배포 목록·알림 이력', fade(u, 2.0), { 'font-size': 15 }); return; }
    let x = X0; H.forEach((h, j) => { if (j >= ncol) return; const show = j < 2 ? 1 : k === 2 ? E(u, 0.4 + (j - 2) * 0.4, 1.0 + (j - 2) * 0.4) : 1; const w = CW[j];
      if (show <= 0.02) { x += w; return; }
      el('rect', { x, y: 70, width: w - 3, height: 36, fill: ren > 0.5 && j < 2 ? ACCBG : SOFT, opacity: show });
      mono(x + 10, 94, ren > 0.5 && j < 2 ? H2[j] : h, { 'font-size': 15, 'font-weight': 800, fill: ren > 0.5 && j < 2 ? ACC : INK, opacity: show });
      TBL.forEach((r, i) => { const y = 110 + i * 44, rs = j === 0 && k === 1 ? E(u, 0.3 + i * 0.2, 0.6 + i * 0.2) : show, v = r[j], hot = j === 3 && k >= 4, bad = hot && v > 0.5;
        el('rect', { x, y, width: w - 3, height: 40, fill: hot ? (bad ? BAD : GOOD) : PANEL, opacity: hot ? 0.25 + 0.6 * (k === 4 ? E(u, 0.6 + i * 0.15, 1.0 + i * 0.15) : 1) * (bad ? 1 : 0.4) : rs, stroke: GRID });
        mono(x + 10, y + 26, String(v), { 'font-size': 15, opacity: rs, fill: bad ? PANEL : INK, 'font-weight': bad ? 800 : 400 }); });
      x += w; });
    const RX = 620;
    if (k === 0) { sub(310, 380, '컬럼이 여러 개인 원시 데이터 (예시)', fade(u, 0.4), { 'font-size': 15 }); pill(RX + 150, 140, 'type: table', ACC, pop(u, 0.3), { mono: true, fs: 15 }); sub(RX + 150, 190, '차트로 뭉개면 사라지는 컬럼을 그대로', fade(u, 1.2), { 'font-size': 14.5 }); return; }
    if (k === 1) { mono(RX, 140, 'sum by (route) (rate(', { 'font-size': 14.5, opacity: fade(u, 0.2) }); mono(RX, 164, '  http_requests_total[1m]))', { 'font-size': 14.5, opacity: fade(u, 0.2) });
      mono(RX, 200, 'format table · instant', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.7) }); sub(RX + 150, 250, '엔드포인트마다 한 행', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { pill(RX + 150, 140, '{ "id": "merge" }', ACC, pop(u, 0.2), { mono: true, fs: 14.5 }); sub(RX + 150, 190, '다른 쿼리의 p99 · err%가 옆에 붙는다', fade(u, 1.5), { 'font-size': 14.5 }); return; }
    if (k === 3) { mono(RX, 150, 'route → Endpoint', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) }); mono(RX, 184, 'Value → RPS', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
      sub(RX + 150, 234, 'organize.renameByName', fade(u, 1.4), { class: 'mono', 'font-size': 14 }); return; }
    // k4
    mono(RX, 140, 'overrides: byName "err%"', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(RX, 170, 'cellOptions color-background', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
    sub(RX + 150, 220, '임계값 0.5로 둔 예시', fade(u, 1.2), { 'font-size': 14.5 }); sub(RX + 150, 250, '/pay 0.8이 표 안에서 튄다', fade(u, 1.8), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  // ========== 6. Heatmap + 고르는 법 ==========
  const BKT = ['100 ms', '250 ms', '500 ms', '1 s'];   // 아래 → 위 (예시 버킷 경계)
  function heatGrid(x, y, cs, u, o) { o = o || {}; const rows = HEAT.length;
    HEAT.forEach((row, ri) => row.forEach((v, ci) => { if (ci / 12 > u) return; const a = o.flat ? 0.35 : 0.1 + 0.85 * (v / 13);
      el('rect', { x: x + ci * cs, y: y + ri * cs, width: cs - 3, height: cs - 3, rx: 3, fill: o.flat ? OFF : WARN, opacity: a }); }));
    BKT.slice().reverse().forEach((s0, ri) => mono(x - 8, y + ri * cs + cs / 2 + 4, s0, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }));
    tx(x + 12 * cs, y + rows * cs + 22, '시간 →', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); }
  function s6(t, c) { const { k, u } = c, HX = 120, HY = 80, CS = 40;
    if (k <= 2) { heatGrid(HX, HY, CS, k === 0 ? E(u, 0.3, 1.8) : 1, { flat: k === 1 });
      if (k === 0) { el('rect', { x: HX + 6 * CS - 3, y: HY - 4, width: CS * 4, height: CS * 2 + 4, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 2.0) });
        sub(HX + 8 * CS, HY + 2 * CS + 26, '느린 칸이 진해진다', fade(u, 2.1), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 });
        pill(800, 130, 'type: heatmap', ACC, pop(u, 0.3), { mono: true, fs: 15 }); sub(800, 180, '색 진하기 = 요청 수 (예시)', fade(u, 1.0), { 'font-size': 14.5 }); return; }
      if (k === 1) { BKT.forEach((s0, i) => { const y = HY + (3 - i) * CS; pill(780, y + CS / 2, 'le="' + ['0.1', '0.25', '0.5', '1'][i] + '"', INFO, pop(u, 0.3 + i * 0.25), { mono: true, fs: 13.5 }); grow(730, y + CS / 2, HX + 12 * CS + 6, y + CS / 2, E(u, 0.5 + i * 0.25, 0.9 + i * 0.25), INFO); });
        mono(780, 330, 'format: heatmap', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) }); sub(780, 360, '버킷 하나 = 세로 한 칸', fade(u, 1.9), { 'font-size': 14.5 }); return; }
      // k2 색 스케일
      for (let i = 0; i < 64; i++) if (i / 64 < E(u, 0.3, 1.4)) el('rect', { x: 700 + i * 3.6, y: 130, width: 3.6, height: 24, fill: WARN, opacity: 0.1 + 0.85 * i / 63 });
      mono(700, 180, 'scheme Oranges · steps 64', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) }); mono(700, 214, 'calculate: false', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(810, 250, '이미 버킷이라 다시 나누지 않는다', fade(u, 1.6), { 'font-size': 14.5 }); sub(810, 280, 'y축 unit s', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k3~5 치트시트, k6 실수
    if (k <= 5) { const ROWS = [['(시간, 값) 추세', 'timeseries'], ['지금 값 하나 / 0~max 위치', 'stat / gauge'], ['범주 비교 / 다차원 원시', 'barchart / table']];
      ROWS.forEach(([a, bb], i) => { const y = 80 + i * 110, on = i === k - 3, op = i <= k - 3 ? 1 : 0.25;
        card(250, y + 20, 380, 80, { rx: 12, stroke: on ? ACC : GRID, sw: on ? 2.6 : 1.5, fill: on ? ACCBG : PANEL, op });
        tx(80, y + 14, a, { 'font-size': 16, 'font-weight': 700, opacity: op }); mono(80, y + 42, bb, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: op }); });
      const RX = 700;
      if (k === 3) { el('rect', { x: RX - 20, y: 80, width: 260, height: 150, rx: 8, fill: PANEL, stroke: GRID }); spark(RX, 100, 220, 110, SERIES, 0, 0.5, E(u, 0.3, 1.5), ACC); sub(RX + 110, 260, '시간축이 있으면 이것부터', fade(u, 1.6), { 'font-size': 14.5 }); }
      if (k === 4) { card(RX + 10, 150, 120, 80, { rx: 8, text: '67', fs: 34, mono: true, s: pop(u, 0.3) }); gauge(RX + 170, 190, 50, 67, { fillTo: 67 * E(u, 0.8, 1.6), needle: 67 * E(u, 0.8, 1.6) });
        sub(RX + 90, 260, '둘을 가르는 건 max의 유무', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      if (k === 5) { CAT.slice(0, 4).forEach(([n, v], i) => el('rect', { x: RX - 20, y: 300 + i * 18 - 200, width: 200 * (v / 0.45) * E(u, 0.3 + i * 0.1, 0.9 + i * 0.1), height: 14, rx: 3, fill: ACC, opacity: 0.85 }));
        for (let r = 0; r < 4; r++) el('line', { x1: RX - 20, y1: 210 + r * 14, x2: RX + 200, y2: 210 + r * 14, stroke: INK, 'stroke-width': 1.5, opacity: fade(u, 1.0) });
        { let a0 = -Math.PI / 2; CAT.forEach(([, v], i) => { const a1 = a0 + (v / 1.36) * Math.PI * 2, r = 34, cx = RX + 220, cy = 300; el('path', { d: `M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 0 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z`, fill: [BAD, WARN, ACC, INFO, GOOD][i], opacity: 0.5 * fade(u, 1.2), stroke: PANEL }); a0 = a1; }); }
        cross(RX + 220, 300, 16, pop(u, 1.6)); sub(RX + 110, 340, '파이차트는 4개만 넘어도 각도 비교가 어렵다', fade(u, 1.8), { 'font-size': 14 }); }
      return; }
    // k6 자주 하는 실수
    [['unit 누락', '0.42 ?', '초? 밀리초?'], ['threshold 미설정', '색 없음', '이상을 못 잡는다'], ['축 min/max 방치', '작은 차이 과장', '스케일 왜곡']].forEach(([a, bb, cc], i) => { const x = 170 + i * 310, s0 = pop(u, 0.3 + i * 0.5);
      card(x, 190, 270, 190, { rx: 12, stroke: BAD, sw: 2.2, s: s0 }); lbl(x, 130, a, fade(u, 0.4 + i * 0.5), { 'font-size': 17, fill: BAD });
      mono(x, 190, bb, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.5) }); sub(x, 240, cc, fade(u, 0.6 + i * 0.5), { 'font-size': 14.5 }); }); }

  const quiz = [
    { q: 'p99 지연이 시간에 따라 언제 튀었는지 보려면 가장 먼저 고를 시각화는 무엇인가?',
      o: ['stat', 'timeseries', 'gauge'], a: 1,
      why: '데이터가 (시간, 값) 쌍이고 흐름이 궁금하면 timeseries가 기본이다. stat·gauge는 값 하나만 남긴다.' },
    { q: '시계열 끝이 null일 때 reduce를 lastNotNull로 둔 stat은 무엇을 보여 주는가?',
      o: ['null을 건너뛴 마지막 값', '시계열 평균', '빈 값이라 아무것도 안 보인다'], a: 0,
      why: 'lastNotNull은 빈 값을 건너뛰고 마지막 유효값 하나를 남긴다. 예시에서는 1240이 남는다.' },
    { q: 'gauge에 max를 주지 않으면 생기는 문제는 무엇인가?',
      o: ['값이 퍼센트로 바뀐다', '임계값 색이 사라진다', '바늘이 범위의 어디쯤인지 해석할 수 없다'], a: 2,
      why: 'gauge는 범위 대비 위치를 보여 주는 그림이다. min·max가 눈금이라 없으면 67이 높은지 낮은지 알 수 없다.' },
    { q: '엔드포인트별 지금 p99를 막대로 비교하려 할 때 target에 켜야 하는 것은 무엇인가?',
      o: ['format time_series', 'instant: true와 format: table', 'spanNulls: true'], a: 1,
      why: 'instant로 한 순간 값만 받고 table 형식으로 라벨마다 한 줄을 받아야 범주별 막대 하나씩이 된다.' },
    { q: '표에서 err% 컬럼 하나만 칸 배경색을 입히려면 무엇을 쓰는가?',
      o: ['fieldConfig.overrides의 byName 매처', 'transformations의 merge', 'options.reduceOptions'], a: 0,
      why: 'overrides는 이름으로 고른 컬럼에만 속성을 덮어쓴다. merge는 결과를 합칠 뿐 색을 바꾸지 않는다.' },
    { q: 'heatmap에서 평균 지연은 그대로인데 위쪽 칸이 진해졌다. 무엇을 뜻하는가?',
      o: ['요청이 전체적으로 줄었다', '느린 버킷에 들어간 요청이 늘었다', '데이터 수집이 끊겼다'], a: 1,
      why: '세로 칸은 지연 버킷이고 색은 그 버킷의 요청 수다. 위쪽이 진하면 느린 요청이 많아진 롱테일이다.' },
  ];

  const summary = [
    '시간에 따른 흐름은 timeseries, 지금 값 하나는 stat으로 본다.',
    'min과 max가 분명한 사용률은 gauge로 범위 안 위치를 보여 준다.',
    '범주끼리는 정렬한 막대로, 여러 컬럼은 table로, 분포는 heatmap으로 그린다.',
    'unit과 임계값을 빼먹으면 같은 숫자도 잘못 읽힌다.',
  ];
  const review = [
    { q: 'NOC 벽면에 결제 API의 지금 RPS를 크게 띄우고 2000을 넘으면 빨갛게 하고 싶다. 알맞은 설정은?',
      o: ['timeseries에 fillOpacity 10', 'stat에 colorMode background와 임계값 2000', 'table에 overrides'], a: 1,
      why: 'stat은 값 하나를 크게 보여 주고 colorMode background가 임계값 색으로 배경 전체를 칠한다.' },
    { q: 'RPS stat이 1,240이 아니라 1K req/s로 보인다. 먼저 의심할 것은?',
      o: ['decimals가 0이라 1.24K가 1K로 잘렸다', '쿼리의 rate 구간이 1m이라서', 'graphMode가 area라서'], a: 0,
      why: 'reqps는 1000을 넘으면 K로 줄여 쓰고 decimals를 그 줄인 수에 적용한다. decimals 2면 1.24K req/s가 된다.' },
    { q: '평균 지연 선은 잔잔한데 사용자는 가끔 느리다고 한다. 어떤 패널을 더하면 좋은가?',
      o: ['CPU gauge', 'route 별 파이차트', '지연 버킷 heatmap'], a: 2,
      why: '평균은 소수의 느린 요청을 묻어 버린다. heatmap은 버킷별 요청 수를 색으로 보여 줘 롱테일이 드러난다.' },
  ];

  R.page({ title: 'Grafana 시각화 고르기', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
