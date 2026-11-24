/* I-1-2 Panel 개념 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 패널 한 개를 query·시각화·옵션 세 겹으로 풀고, SQL 결과 → 시계열, 임계값 색, transform 표, 보드 위 조작을 그린다.
 * 주문 행·성공/전체 수는 설명용 예시 데이터다(그림에 "예시"로 적는다).
 * 표시 문자열은 Grafana valueFormats 를 node 로 옮겨 돌린 값: 0.042 percentunit decimals 2 → "4.20%", 0.98667 → "0.987". */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, dot, fly, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  const SER = [0.12, 0.14, 0.13, 0.17, 0.19, 0.21, 0.18, 0.16, 0.20, 0.22, 0.19, 0.17, 0.18];   // 예시 p99(초)
  function gpanel(x, y, w, h, title, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8, 'stroke-dasharray': o.dash, opacity: op });
    if (title) tx(x + 10, y + 21, title, { 'font-size': o.fs || 14.5, 'font-weight': 700, opacity: op });
    if (o.type) mono(x + w - 10, y + 21, o.type, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }
  function spark(x, y, w, h, data, max, u, col, o) { o = o || {}; if (u <= 0) return; const n = data.length - 1, k = clamp(u) * n, i = Math.floor(k);
    const P = data.slice(0, i + 1).map((v, j) => [x + (j / n) * w, y + h - (v / max) * h]);
    if (i < n) { const f = k - i; P.push([x + ((i + f) / n) * w, y + h - (lerp(data[i], data[i + 1], f) / max) * h]); }
    el('polyline', { points: P.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.5, 'stroke-linejoin': 'round', opacity: o.op ?? 1 }); }
  // 작은 표: cols 머리글, rows 값. o.hide(j) 열 접기 0→1, o.col(j) 열 색
  function table(x, y, cols, rows, o) { o = o || {}; const cw = o.cw || 86, rh = o.rh || 30, op = o.op ?? 1;
    let xx = x; cols.forEach((h, j) => { const sh = o.hide ? 1 - o.hide(j) : 1; if (sh <= 0.02) return; const w = cw * sh, col = (o.col && o.col(j)) || INK;
      el('rect', { x: xx, y, width: w - 2, height: rh, fill: o.head && o.head(j) ? ACCBG : SOFT, opacity: op });
      if (sh > 0.6) mono(xx + 8, y + 20, h, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: op });
      rows.forEach((r, i) => { const v = r[j]; el('rect', { x: xx, y: y + rh * (i + 1), width: w - 2, height: rh, fill: PANEL, stroke: GRID, 'stroke-width': 1, opacity: op });
        if (sh > 0.6 && v != null) mono(xx + 8, y + rh * (i + 1) + 20, String(v), { 'font-size': 14, fill: col, opacity: op * (o.cellOp ? o.cellOp(i, j) : 1) }); });
      xx += w; }); return xx; }

  // ========== 1. Panel 해부 ==========
  function s1(t, c) { const { k, u } = c;
    // 가운데 패널
    const PX = 300, PY = 60, PW = 360, PH = 210;
    const split = k === 3 ? E(u, 0.3, 1.2) : k >= 4 ? 1 : 0;
    gpanel(PX, PY, PW, PH, 'p99 Latency', { type: k >= 1 ? 'timeseries' : null, stroke: k === 0 ? ACC : GRID, op: k === 0 ? fade(u, 0.2) : 1 });
    if (k === 0) { pill(PX + PW - 30, PY - 2, 'id 1', ACC, pop(u, 0.6), { mono: true, fs: 13.5 }); sub(480, 320, 'id 는 보드 안 번호, title 은 사람이 읽는 이름', fade(u, 1.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const gx = PX + 20, gy = PY + 40, gw = PW - 40, gh = PH - 70;
    el('line', { x1: gx, y1: gy + gh, x2: gx + gw, y2: gy + gh, stroke: GRID, 'stroke-width': 1.4 });
    spark(gx, gy, gw, gh, SER, 0.3, k === 1 ? E(u, 0.4, 1.5) : 1, ACC);
    if (k === 1) { // 미니 보드: 24칸 중 12칸
      const bx = 700, by = 90, cw = 10; for (let i = 0; i < 24; i++) el('rect', { x: bx + i * cw, y: by, width: cw - 1.5, height: 50, fill: i < 12 * E(u, 1.0, 1.8) ? ACC : SOFT, opacity: 0.85 });
      mono(bx + 120, by + 76, 'gridPos w 12 / 24', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(480, 320, 'type 을 바꾸면 같은 데이터가 다른 그림이 된다', fade(u, 2.0), { 'font-size': 15 }); return; }
    // 데이터소스
    R.dbIcon(120, 170, 'Prometheus', { s: k === 2 ? pop(u, 0.3) : 1 });
    if (k === 2) { grow(168, 165, PX - 6, 165, E(u, 0.8, 1.4), ACC); mono(230, 150, 'uid prom-default', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      sub(480, 320, '패널마다 다른 소스를 가리킬 수 있다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    el('line', { x1: 168, y1: 165, x2: PX - 6, y2: 165, stroke: ACC, 'stroke-width': 2 });
    // 세 겹: query / 시각화 / 옵션
    const L = [['① query', 'targets[ refId A ]', INFO], ['② 시각화', 'type timeseries', ACC], ['③ 옵션', 'unit s · decimals 2 · legend', WARN]];
    L.forEach(([a, bb, col], i) => { const show = i === 0 ? (k >= 3 ? 1 : 0) : i === 1 ? (k >= 3 ? 1 : 0) : (k >= 4 ? 1 : 0); if (!show) return;
      const s0 = i === 2 && k === 4 ? E(u, 0.3, 1.0) : i < 2 && k === 3 ? E(u, 0.3 + i * 0.4, 1.0 + i * 0.4) : 1, sp = i === 2 && k === 4 ? 1 : split;
      const y = lerp(PY + PH / 2, 300 + i * 0, sp), x = lerp(PX + PW / 2, 200 + i * 280, sp);
      card(x, y + 30, 250, 62, { rx: 10, stroke: col, sw: 2.4, fill: PANEL, s: Math.max(0.3, s0), op: s0 });
      tx(x - 110, y + 24, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s0 }); mono(x - 110, y + 48, bb, { 'font-size': 13.5, opacity: s0 }); });
    if (k === 3) { fly(PX + 40, PY + 60, 160, 82, seg(u, 1.2, 2.2), 'histogram_quantile(0.99, …)', { mono: true, fill: INFO });
      sub(480, 405, 'targets 가 데이터를 가져오는 부분', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 4) { [['unit', 's'], ['decimals', '2'], ['legend', 'on']].forEach(([a, v], i) => pill(PX + 60 + i * 120, PY + PH + 0, `${a} ${v}`, WARN, pop(u, 0.9 + i * 0.3), { mono: true, fs: 13.5 }));
      sub(480, 405, '옵션은 보이는 방식만 바꾼다. 데이터는 그대로', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 5) { [200, 480, 760].forEach((x, i) => grow(x, 300, lerp(x, PX + PW / 2, 0.55), PY + PH + 4, E(u, 0.2 + i * 0.2, 0.9 + i * 0.2), ACC));
      const d = E(u, 1.4, 2.2); if (d > 0) { gpanel(PX + 30 + 200 * d, PY + 30 + 60 * d, PW * 0.6, PH * 0.6, 'p99 Latency (복제)', { stroke: ACC, op: d, fs: 13.5 });
        ['query', 'type', '옵션'].forEach((s0, i) => pill(PX + 90 + 200 * d + i * 70, PY + 120 + 60 * d, s0, ACC, d, { fs: 13.5 })); }
      sub(480, 400, '복제하면 세 부분이 통째로 따라온다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // ========== 2. Query editor (SQL → 시계열) ==========
  const ROWS = [['08:57:03', 'paid'], ['10:00:12', 'paid'], ['10:00:41', 'paid'], ['10:00:58', 'failed'], ['10:01:07', 'paid'], ['10:01:30', 'paid'], ['10:01:52', 'paid'], ['10:02:15', 'paid'], ['10:02:44', 'failed']];   // 예시
  const BK = ['10:00', '10:01', '10:02'], PAID = [2, 3, 1], FAIL = [1, 0, 1];
  function s2(t, c) { const { k, u } = c;
    // 왼쪽: orders 원본 행
    const TX = 30, TY = 50; tx(TX, TY - 12, 'orders (예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    ROWS.forEach(([ts, st], i) => { const y = TY + i * 34, old = i === 0, out = (k >= 3 && old) || (k >= 2 && st === 'failed' && k < 6);
      const op = old && k === 3 ? 1 - 0.75 * E(u, 1.0, 1.6) : out ? 0.25 : 1;
      el('rect', { x: TX, y, width: 210, height: 30, rx: 4, fill: PANEL, stroke: GRID, opacity: op });
      mono(TX + 10, y + 20, ts, { 'font-size': 14, opacity: op }); mono(TX + 200, y + 20, st, { 'font-size': 13.5, 'text-anchor': 'end', fill: st === 'paid' ? GOOD : BAD, opacity: op });
      if (old && k >= 3) el('line', { x1: TX + 4, y1: y + 15, x2: lerp(TX + 4, TX + 206, k === 3 ? E(u, 1.0, 1.6) : 1), y2: y + 15, stroke: BAD, 'stroke-width': 2 }); });
    // 버킷 → 그래프
    const AX = 560, AY = 110, AW = 340, AH = 190, X = (i) => AX + 40 + i * 130, Y = (v) => AY + AH - (v / 4) * AH;
    el('line', { x1: AX, y1: AY + AH, x2: AX + AW, y2: AY + AH, stroke: MUT, 'stroke-width': 1.6 });
    BK.forEach((b, i) => mono(X(i), AY + AH + 22, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: k === 0 ? OFF : MUT }));
    if (k === 0) { // 결과 프레임 머리글
      card(730, 60, 260, 40, { rx: 6, stroke: ACC, s: pop(u, 0.3) }); mono(620, 66, 'time', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) }); mono(720, 66, '|  orders', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(620, 150, 'AS ts', { 'font-size': 16, fill: BAD, opacity: fade(u, 1.2) }); cross(700, 145, 10, pop(u, 1.5)); sub(780, 150, 'x축을 못 찾는다', fade(u, 1.6), { fill: BAD, 'font-weight': 700 });
      mono(620, 200, 'AS time', { 'font-size': 16, fill: GOOD, opacity: fade(u, 1.8) }); check(710, 195, 10, pop(u, 2.0)); sub(790, 200, 'x축 = 시간', fade(u, 2.1), { fill: GOOD, 'font-weight': 700 }); return; }
    mono(560, 60, "date_trunc('minute', created_at) AS time", { 'font-size': 14, fill: k === 1 ? ACC : MUT, opacity: k === 1 ? fade(u, 0.2) : 1 });
    // k1: 행이 분 버킷으로 날아간다
    if (k === 1) { ROWS.slice(1).forEach(([ts], i) => { const bi = BK.indexOf(ts.slice(0, 5)), f = E(u, 0.5 + i * 0.12, 1.3 + i * 0.12);
        const x = lerp(TX + 220, X(bi), f), y = lerp(TY + (i + 1) * 34 + 15, AY + AH - 12 - (i % 3) * 14, f); el('circle', { cx: x, cy: y, r: 6, fill: ACC, opacity: 0.9 }); });
      sub(730, 400, '초 단위 시각이 분 단위 칸으로 모인다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k2~: count(*) 막대 → 선
    const sortU = k === 4 ? E(u, 0.6, 1.6) : k > 4 ? 1 : 0;
    if (k >= 2) { mono(560, 84, 'count(*) AS orders   WHERE status = \'paid\'', { 'font-size': 14, fill: k === 2 ? ACC : MUT, opacity: k === 2 ? fade(u, 0.2) : 1 });
      PAID.forEach((v, i) => { const g = k === 2 ? E(u, 0.4 + i * 0.3, 1.0 + i * 0.3) : 1; el('rect', { x: X(i) - 18, y: Y(v * g), width: 36, height: AY + AH - Y(v * g), rx: 3, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5 });
        mono(X(i), Y(v) - 8, String(v), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: k === 2 ? fade(u, 1.0 + i * 0.3) : 1 }); }); }
    if (k === 2) { sub(730, 400, 'failed 행은 WHERE 에서 빠진다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { mono(30, 380, '$__timeFilter(created_at)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      mono(30, 406, "→ created_at BETWEEN '…T09:03:00Z' AND '…T10:03:00Z'", { 'font-size': 14, fill: INK, opacity: fade(u, 0.7) });
      sub(730, 350, '보드 시간창(last 1h)이 WHERE 로 들어간다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4: 정렬 전 지그재그 → 정렬 후 선
    const order = [2, 0, 1], pos = (i) => lerp(X(order.indexOf(i) === -1 ? i : order[i]), X(i), sortU);
    if (k >= 4) { const pts = [0, 1, 2].map((i) => [k === 4 ? lerp(X(order[i]), X(i), sortU) : X(i), Y(PAID[i])]);
      const seq = k === 4 && sortU < 0.5 ? [0, 1, 2] : [0, 1, 2]; el('polyline', { points: seq.map((i) => pts[i].join(',')).join(' '), fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-linejoin': 'round' });
      seq.forEach((i) => el('circle', { cx: pts[i][0], cy: pts[i][1], r: 5, fill: ACC })); }
    if (k === 4) { mono(560, 400, 'GROUP BY 1  ORDER BY 1', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      sub(400, 360, sortU < 0.5 ? '정렬 전: 선이 앞뒤로 엉킨다' : '시간 오름차순: 선이 한 방향', 1, { 'font-size': 15, fill: sortU < 0.5 ? BAD : GOOD, 'font-weight': 700 }); return; }
    if (k === 5) { // 느린 패널 세 가지
      [['created_at 인덱스', 'Seq Scan 피하기'], ['$__timeFilter', '스캔을 시간창으로'], ['버킷 크기', '너무 잘게 쪼개지 않기']].forEach(([a, bb], i) => { const y = 320 + i * 0; const x = 360 + i * 200;
        card(x, 370, 186, 56, { rx: 8, stroke: GOOD, s: pop(u, 0.3 + i * 0.4) }); check(x - 76, 362, 8, pop(u, 0.5 + i * 0.4));
        tx(x - 62, 366, a, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) }); tx(x - 62, 386, bb, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); });
      return; }
    // k6: refId B 겹치기
    const lb = E(u, 0.4, 1.4); el('polyline', { points: [0, 1, 2].map((i) => `${X(i)},${Y(FAIL[i])}`).join(' '), fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': `${lb * 300} 400` });
    FAIL.forEach((v, i) => el('circle', { cx: X(i), cy: Y(v), r: 5, fill: BAD, opacity: fade(u, 0.5 + i * 0.3) }));
    [['A', "status = 'paid'", ACC], ['B', "status = 'failed'", BAD]].forEach(([r, q, col], i) => { pill(600 + i * 170, 400, `${r} · ${q}`, col, pop(u, 0.3 + i * 0.6), { mono: true, fs: 13.5 }); });
    sub(400, 360, '쿼리 하나 = 시리즈 하나', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ========== 3. 시각화 · 임계값 ==========
  const LV = (v) => (v >= 0.05 ? BAD : v >= 0.01 ? WARN : GOOD);
  function s3(t, c) { const { k, u } = c;
    if (k === 5) { // 데이터 모양 → 타입
      [['지금 값 하나', 'stat · gauge'], ['시간에 따른 추세', 'timeseries'], ['값의 분포', 'heatmap'], ['원본 행 그대로', 'table']].forEach(([a, bb], i) => { const y = 70 + i * 82, s = pop(u, 0.2 + i * 0.4);
        card(250, y, 300, 58, { rx: 10, text: a, fs: 17, s }); grow(410, y, 560, y, E(u, 0.5 + i * 0.4, 0.9 + i * 0.4), ACC); card(700, y, 240, 58, { rx: 10, text: bb, fs: 17, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.8 + i * 0.4) });
        const gx = 80, gy = y; // 작은 그림
        if (i === 0) mono(gx - 40, gy + 6, '4.2', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 0.3) });
        if (i === 1) spark(gx - 60, gy - 14, 60, 28, SER, 0.3, fade(u, 0.7), INK);
        if (i === 2) for (let a2 = 0; a2 < 4; a2++) for (let b2 = 0; b2 < 2; b2++) el('rect', { x: gx - 60 + a2 * 15, y: gy - 14 + b2 * 15, width: 13, height: 13, fill: WARN, opacity: [0.2, 0.5, 0.9, 0.4, 0.7, 0.3, 0.6, 0.2][a2 + b2 * 4] * fade(u, 1.1) });
        if (i === 3) for (let r = 0; r < 3; r++) el('line', { x1: gx - 60, y1: gy - 10 + r * 10, x2: gx, y2: gy - 10 + r * 10, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.5) }); });
      return; }
    // 큰 stat 패널
    const lvCol = k >= 3 ? WARN : INK, bg = k >= 4 ? WARNBG : PANEL;
    gpanel(40, 60, 380, 250, 'Error Rate', { type: 'stat', fill: k === 4 ? (u > 0.6 ? WARNBG : PANEL) : bg, stroke: k >= 3 ? WARN : GRID, sw: k >= 3 ? 2.4 : 1.8 });
    if (k === 0) { const f = E(u, 0.3, 1.4); spark(70, 110, 320, 120, [0.03, 0.035, 0.04, 0.038, 0.045, 0.042], 0.06, 1, INK, { op: 1 - f });
      mono(230, 200, '0.042', { 'font-size': 48, 'font-weight': 800, 'text-anchor': 'middle', opacity: f }); sub(230, 280, '원시값 그대로', fade(u, 1.6), { 'font-size': 15 });
      sub(680, 200, '시계열이 숫자 하나로 접힌다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    else { const txt = k === 1 ? (u < 1.0 ? '0.042' : '4.20%') : '4.20%'; mono(230, 200, txt, { 'font-size': 48, 'font-weight': 800, 'text-anchor': 'middle', fill: k >= 3 ? (k === 3 && u < 1.6 ? INK : WARN) : INK }); }
    if (k === 1) { card(680, 120, 300, 70, { rx: 10, text: 'unit percentunit\ndecimals 2', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.3) });
      mono(680, 240, '0.042 × 100 → 4.20%', { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); sub(680, 280, 'decimals 2 라 끝 0 까지 쓴다', fade(u, 1.8), { 'font-size': 15 }); return; }
    // 임계값 수직선 0 ~ 0.06
    const x0 = 500, W = 400, X = (v) => x0 + (v / 0.06) * W, y = 150;
    if (k >= 2) { el('line', { x1: x0, y1: y + 11, x2: x0 + W, y2: y + 11, stroke: MUT, 'stroke-width': 1.6 });
      [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06].forEach((v) => mono(X(v), y + 46, String(v), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: k === 2 ? fade(u, 0.3) : 1 }));
      tx(x0, y - 40, 'mode absolute = 값 그대로 자른다', { 'font-size': 15, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.8) : 1 }); }
    if (k === 2) { sub(700, 280, 'steps 배열에 경계를 넣는다', fade(u, 1.5), { 'font-size': 15 }); return; }
    if (k >= 3) { [[0, 0.01, GOOD], [0.01, 0.05, WARN], [0.05, 0.06, BAD]].forEach(([a, bb, col], i) => { const g = k === 3 ? E(u, 0.2 + i * 0.3, 0.6 + i * 0.3) : 1; el('rect', { x: X(a), y, width: (X(bb) - X(a)) * g, height: 22, fill: col, opacity: 0.85 }); });
      const mx = X(0.042), mo = k === 3 ? fade(u, 1.3) : 1; el('line', { x1: mx, y1: y - 14, x2: mx, y2: y + 30, stroke: INK, 'stroke-width': 3, opacity: mo }); mono(mx, y - 20, '0.042', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: mo }); }
    if (k === 3) { tx(500, 250, '0.01 ≤ 0.042 < 0.05 → 노랑', { 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) }); sub(700, 290, '빨강 문턱 0.05 바로 아래', fade(u, 2.1), { 'font-size': 15 }); return; }
    // k4 배경색 + 범례 표
    tx(500, 240, 'colorMode background', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: WARN, opacity: fade(u, 0.3) }); sub(660, 268, '패널 배경 전체를 구간 색으로', fade(u, 0.6), { 'font-size': 14.5 });
    const ly = 300; el('rect', { x: 500, y: ly, width: 400, height: 90, rx: 6, fill: PANEL, stroke: GRID, opacity: fade(u, 1.2) });
    [['Name', 'Mean', 'Max']].concat([['A', '…', '…'], ['B', '…', '…']]).forEach((r, i) => r.forEach((s0, j) => mono(520 + j * 130, ly + 24 + i * 26, s0, { 'font-size': 14, 'font-weight': i ? 400 : 700, fill: i ? INK : MUT, opacity: fade(u, 1.3 + i * 0.2) })));
    sub(230, 350, '범례 표는 시리즈가 여러 개인 timeseries 옵션', fade(u, 2.0), { 'font-size': 14.5 }); }

  // ========== 4. Transform ==========
  const TT = ['10:00', '10:01', '10:02'], TOT = [120, 135, 150], SUC = [118, 134, 148], RATE = ['0.983', '0.993', '0.987'];   // 예시
  function s4(t, c) { const { k, u } = c;
    // 파이프라인 단계 표시
    const ST = ['merge', 'calculateField', 'organize'], on = k <= 1 ? (k === 1 ? 1 : 0) : k <= 3 ? 2 : k <= 5 ? 3 : 3;
    ST.forEach((s0, i) => { const x = 140 + i * 250; el('rect', { x: x - 100, y: 22, width: 200, height: 34, rx: 17, fill: i < on ? ACCBG : PANEL, stroke: i < on ? ACC : GRID, 'stroke-width': 1.8 });
      mono(x, 44, `${i + 1}  ${s0}`, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: i < on ? ACC : OFF });
      if (i < 2) grow(x + 102, 39, x + 146, 39, i < on - 1 ? 1 : 0, MUT); });
    sub(860, 44, '예시 데이터', 1, { 'font-size': 13.5 });
    if (k === 6) { // 순서와 비용
      [['쿼리', '집계로 행을 줄인다', GOOD, 'DB'], ['transform', '표시용 손질만', ACC, '브라우저']].forEach(([a, bb, col, wh], i) => { const x = 250 + i * 440, s = pop(u, 0.3 + i * 0.5);
        card(x, 200, 360, 120, { rx: 12, stroke: col, sw: 2.4, s }); lbl(x, 180, a, fade(u, 0.4 + i * 0.5), { 'font-size': 20, class: 'mono', fill: col }); sub(x, 214, bb, fade(u, 0.5 + i * 0.5), { 'font-size': 15, fill: INK }); sub(x, 244, '실행 위치: ' + wh, fade(u, 0.6 + i * 0.5), { 'font-size': 14 }); });
      grow(440, 200, 500, 200, E(u, 1.2, 1.6), MUT); sub(480, 340, 'transform 은 위에서 아래로 차례대로', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 370, '행이 많으면 브라우저가 느려진다', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 0) { const sl = E(u, 0.2, 1.0);
      table(lerp(10, 60, sl), 110, ['time', 'total'], TT.map((x, i) => [x, TOT[i]]), { col: (j) => (j ? INFO : INK), op: fade(u, 0.2) }); lbl(lerp(95, 145, sl), 96, 'A · 전체', fade(u, 0.2), { fill: INFO });
      table(lerp(760, 560, sl), 110, ['time', 'success'], TT.map((x, i) => [x, SUC[i]]), { col: (j) => (j ? GOOD : INK), op: fade(u, 0.2) }); lbl(lerp(845, 645, sl), 96, 'B · 성공', fade(u, 0.2), { fill: GOOD });
      sub(480, 330, '두 쿼리 결과가 따로 들어온다', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const m = E(u, 0.3, 1.3);
      if (m < 1) { table(lerp(60, 230, m), 110, ['time', 'total'], TT.map((x, i) => [x, TOT[i]]), { col: (j) => (j ? INFO : INK), op: 1 - m * 0.5 }); table(lerp(560, 402, m), 110, ['time', 'success'], TT.map((x, i) => [x, SUC[i]]), { col: (j) => (j ? GOOD : INK), op: 1 - m * 0.5 }); }
      else table(230, 110, ['time', 'total', 'success'], TT.map((x, i) => [x, TOT[i], SUC[i]]), { col: (j) => [INK, INFO, GOOD][j] });
      sub(480, 330, '같은 time 끼리 한 줄로 붙는다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const showRate = k === 2 ? 0 : k === 3 ? 1 : 1, hide = k === 5 ? E(u, 0.3, 1.1) : 0, ren = k === 5 && u > 1.2;
    const cols = ['time', 'total', 'success', ren ? '성공률' : 'success_rate'];
    table(150, 110, cols, TT.map((x, i) => [x, TOT[i], SUC[i], k >= 3 ? RATE[i] : null]), { cw: 130, col: (j) => [INK, INFO, GOOD, ACC][j], head: (j) => j === 3,
      hide: (j) => (j === 1 || j === 2 ? hide : 0), cellOp: (i, j) => (j === 3 && k === 3 ? fade(u, 0.8 + i * 0.3) : 1) });
    if (k === 2) { el('rect', { x: 150 + 390, y: 110, width: 128, height: 120, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.5) });
      sub(480, 300, '새 컬럼 자리가 생긴다', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { mono(480, 290, 'success / total', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) }); sub(480, 320, '118 / 120 = 0.983 …', fade(u, 1.6), { class: 'mono', 'font-size': 15 }); return; }
    if (k === 4) { mono(480, 290, 'excludeByName · renameByName', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) }); sub(480, 320, '숨길 컬럼과 새 이름을 한 번에', fade(u, 1.2), { 'font-size': 15 }); return; }
    // k5: stat 하나
    gpanel(640, 260, 260, 140, '성공률', { type: 'stat', stroke: ACC, op: fade(u, 1.6) }); mono(770, 350, '0.987', { 'font-size': 36, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.9) });
    sub(330, 330, '남은 컬럼 하나를 stat 이 보여 준다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ========== 5. 편집·복제·재배치 ==========
  function board(x, y, w, rowH, rows) { const cw = w / 24; el('rect', { x, y, width: w, height: rows * rowH, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.2 });
    for (let i = 1; i < 24; i++) el('line', { x1: x + i * cw, y1: y, x2: x + i * cw, y2: y + rows * rowH, stroke: GRID, 'stroke-width': i % 6 === 0 ? 1.4 : 0.6 });
    return { X: (cc) => x + cc * cw, Y: (r) => y + r * rowH }; }
  function s5(t, c) { const { k, u } = c;
    if (k === 4) { // timezone
      const T = [['서울 브라우저', 'UTC+9', '18:00'], ['런던 브라우저', 'UTC+0', '09:00']], fix = E(u, 1.4, 2.0);
      mono(480, 60, '같은 점: 2026-11-24T09:00:00Z', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
      T.forEach(([n, z, hh], i) => { const x = 250 + i * 460; R.person(x - 110, 170, null, { s: pop(u, 0.3 + i * 0.3) }); tx(x - 70, 160, n, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.3) }); mono(x - 70, 186, z, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.3) });
        const show = fix > 0.5 ? '09:00' : hh; card(x, 270, 200, 64, { rx: 10, text: show, fs: 28, mono: true, stroke: fix > 0.5 ? GOOD : i ? INK : BAD, color: fix > 0.5 ? GOOD : i ? INK : BAD, s: pop(u, 0.6 + i * 0.3) }); });
      if (u < 1.4) sub(480, 360, 'timezone browser: 사람마다 시각이 다르다', fade(u, 1.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
      else sub(480, 360, 'timezone "utc" 로 고정: 모두 같은 시각', fade(u, 1.5), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    const B = board(40, 70, 560, 20, 15);
    const pr = (x, y, w, h) => [B.X(x) + 3, B.Y(y) + 3, B.X(x + w) - B.X(x) - 6, h * 20 - 6];
    // 기본 배치: Latency(0,0,12,8), RPS(12,0,6,8), Error Rate 는 k0 에서 (0,8,6,6) → (18,0,6,8)
    const [lx, ly, lw, lh] = pr(0, 0, 12, 8); gpanel(lx, ly, lw, lh, 'p99 Latency', { type: 'timeseries' }); spark(lx + 14, ly + 40, lw - 28, lh - 56, SER, 0.3, 1, ACC);
    const removed = k === 3 && u > 2.0;
    if (!removed) { const [rx, ry, rw, rh] = pr(12, 0, 6, 8); gpanel(rx, ry, rw, rh, 'RPS', { type: 'stat', stroke: k === 3 && u > 1.5 ? BAD : GRID }); mono(rx + rw / 2, ry + 100, '1.24K', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO }); }
    const m = k === 0 ? E(u, 0.4, 1.8) : 1, ex = lerp(0, 18, m), ey = lerp(8, 0, m), eh = lerp(6, 8, m);
    const [qx, qy, qw, qh] = pr(ex, ey, 6, eh); gpanel(qx, qy, qw, qh, 'Error Rate', { stroke: k === 0 ? ACC : k === 1 ? ACC : GRID, fill: WARNBG, fs: 14 }); mono(qx + qw / 2, qy + qh / 2 + 18, '4.20%', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
    const RX = 640;
    if (k === 0) { // 마우스 커서
      const cx = qx + qw / 2 + 20, cy = qy + qh / 2 - 34; el('path', { d: `M${cx},${cy} l0,22 l6,-6 l5,10 l4,-2 l-5,-10 l8,0 z`, fill: INK, stroke: PANEL, 'stroke-width': 1.2 });
      mono(RX, 140, '"gridPos": {', { 'font-size': 15 }); mono(RX + 20, 172, `"x": ${Math.round(ex)}, "y": ${Math.round(ey)},`, { 'font-size': 15, fill: ACC, 'font-weight': 700 }); mono(RX + 20, 204, `"w": 6, "h": ${Math.round(eh)}`, { 'font-size': 15, fill: ACC, 'font-weight': 700 }); mono(RX, 236, '}', { 'font-size': 15 });
      sub(RX + 150, 290, '끌어 옮기면 숫자가 바뀐다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const tgt = [800, 260]; grow(qx + qw / 2, qy + qh, tgt[0] - 60, tgt[1] - 40, E(u, 0.4, 1.1), ACC);
      R.browser(tgt[0], tgt[1], 200, 120, null, { s: pop(u, 1.0) }); tx(tgt[0] - 88, tgt[1] + 6, '에러 상세 보드', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(RX + 150, 110, '/d/errors-detail', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) });
      mono(RX + 150, 138, '?var-service=${service}', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      sub(RX + 150, 360, 'uid 경로라 이름이 바뀌어도 안 깨진다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 2) { pill(qx + qw / 2, qy - 14, 'Last 24 hours', WARN, pop(u, 0.5), { mono: true, fs: 13.5 });
      pill(RX + 150, 100, '보드: Last 1 hour', INK, pop(u, 0.2), { mono: true, fs: 14 });
      // 두 시간창 막대
      const x0 = RX + 10, W = 280; el('rect', { x: x0, y: 160, width: W, height: 20, rx: 4, fill: WARN, opacity: 0.8 * fade(u, 1.0) }); mono(x0, 200, 'timeFrom 24h', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.0) });
      el('rect', { x: x0 + W - W / 24, y: 220, width: W / 24, height: 20, rx: 2, fill: ACC }); mono(x0 + W, 262, '1h', { 'font-size': 14, fill: ACC, 'text-anchor': 'end', 'font-weight': 700 });
      sub(RX + 150, 320, '이 패널만 공통 시간창을 무시', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k3 단축키
    const KEYS = [['e', '편집', 0.2], ['p d', '복제', 0.9], ['p r', '제거', 1.6]];
    KEYS.forEach(([kk, a, at], i) => { const y = 110 + i * 70; card(RX + 50, y, 80, 46, { rx: 8, text: kk, fs: 18, mono: true, fill: SOFT, s: pop(u, at) }); tx(RX + 110, y + 6, a, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, at + 0.2), fill: i === 2 ? BAD : INK }); });
    if (u > 0.9) { const d = E(u, 0.9, 1.5); gpanel(lerp(lx, lx + 20, d), lerp(ly, ly + 175, d), lw * 0.5, 70, 'p99 Latency', { stroke: ACC, op: d * 0.9, fs: 13.5 }); }
    if (u > 1.6 && !removed) cross(B.X(15), B.Y(4), 16, pop(u, 1.7));
    sub(RX + 150, 340, 'p r 은 새로고침이 아니라 패널 제거', fade(u, 2.1), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  const quiz = [
    { q: '패널을 복제했을 때 함께 복사되는 것은 무엇인가?',
      o: ['query만 복사되고 시각화는 기본값이 된다', 'query·시각화·옵션이 통째로 복사된다', '옵션만 복사되고 query는 비워진다'], a: 1,
      why: 'targets·type·fieldConfig가 패널 객체 하나에 들어 있어서 복제하면 셋이 함께 따라온다.' },
    { q: 'SQL 패널에서 보드 시간창을 바꿔도 결과가 그대로라면 빠진 것은 무엇인가?',
      o: ['ORDER BY 1', "status = 'paid' 조건", 'WHERE의 $__timeFilter(created_at)'], a: 2,
      why: '$__timeFilter가 보드 시간창을 WHERE 절로 넣어 준다. 이 매크로가 없으면 시간창과 무관하게 전체를 읽는다.' },
    { q: '임계값이 0.01(노랑), 0.05(빨강)이고 값이 0.042일 때 stat 패널 색은 무엇인가?',
      o: ['노랑', '빨강', '초록'], a: 0,
      why: '0.042는 0.01 이상 0.05 미만이라 노랑 구간이다. percentunit·decimals 2로 화면에는 4.20%가 찍힌다.' },
    { q: 'calculateField로 success / total을 만들기 전에 merge가 필요한 이유는 무엇인가?',
      o: ['두 쿼리 결과를 한 표에 모아야 컬럼끼리 계산할 수 있어서', 'merge가 쿼리를 더 빠르게 만들어서', 'merge가 컬럼 이름을 바꿔 줘서'], a: 0,
      why: 'A(total)와 B(success)는 따로 도착한다. 같은 time 행으로 합쳐야 한 행 안에서 나눗셈을 할 수 있다.' },
    { q: '패널에 마우스를 올리고 p 다음 r을 누르면 어떻게 되는가?',
      o: ['그 패널만 새로고침된다', '패널 편집 화면이 열린다', '그 패널이 보드에서 제거된다'], a: 2,
      why: 'Grafana 단축키에서 p r은 Remove panel이다. e가 편집, p d가 복제다.' },
  ];

  const summary = [
    '패널 하나는 query, 시각화 type, 표시 옵션이 한 객체에 묶인 덩어리다.',
    'SQL 패널은 time 별칭과 $__timeFilter가 있어야 시간축과 보드 시간창을 따른다.',
    '단위와 임계값은 값을 바꾸지 않고 읽는 법과 색만 정한다.',
    'transform은 도착한 결과를 브라우저에서 다듬는다. 무거운 집계는 쿼리에서 끝낸다.',
  ];
  const review = [
    { q: '주문 패널 선이 앞뒤로 엉켜 그려지고 시간창을 바꿔도 모양이 같다. 쿼리에서 먼저 볼 것은?',
      o: ['ORDER BY와 $__timeFilter가 빠졌는지', 'thresholds 경계값', 'colorMode 설정'], a: 0,
      why: '정렬이 없으면 점이 시간 순서가 아니라 선이 엉키고, $__timeFilter가 없으면 시간창이 WHERE에 들어가지 않는다.' },
    { q: '성공률 stat이 0.987 대신 success 값 148을 보여 준다. 어느 단계를 고쳐야 하나?',
      o: ['쿼리 B의 WHERE 조건', 'organize에서 success·total을 숨기지 않은 것', 'gridPos의 w 값'], a: 1,
      why: 'stat은 남아 있는 숫자 컬럼을 보여 준다. organize로 success와 total을 빼야 성공률 하나만 남는다.' },
    { q: 'Error Rate를 복제해 Latency 패널을 만들었는데 4.20%처럼 퍼센트로 찍힌다. 왜인가?',
      o: ['Prometheus가 퍼센트로 돌려줘서', 'timezone이 browser라서', '복제할 때 unit percentunit 옵션도 같이 따라와서'], a: 2,
      why: '복제는 query·type·옵션을 통째로 가져온다. 쿼리만 바꾸고 unit을 s로 바꾸지 않으면 표시 방식이 그대로 남는다.' },
  ];

  R.page({ title: 'Grafana 패널 해부', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
