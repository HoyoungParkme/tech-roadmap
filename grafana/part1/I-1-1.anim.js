/* I-1-1 Dashboard란 무엇인가 — 장면 4개 (../../anim/engine.js 규칙을 따른다)
 * 그림: Grafana 보드 화면(머리줄·시간 선택기·tag 줄·24칸 그리드)과 dashboard.json 이 바뀌는 모습.
 * 표시 문자열은 Grafana valueFormats(toSeconds·percentunit·reqps)를 node 로 옮겨 돌린 결과다:
 *   0.18 s → "180 ms", 0.0042 percentunit → "0.420%", 1240 reqps → "1.24K req/s", 67 percent → "67%".
 * p99 선의 모양(SER)은 예전 화면의 예시 데이터다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, dot, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  const SER = [0.12, 0.14, 0.13, 0.17, 0.19, 0.21, 0.18, 0.16, 0.20, 0.22, 0.19, 0.17, 0.18];   // 예시 p99(초)
  // Grafana 패널 틀: 제목 + 오른쪽 위 type
  function gpanel(x, y, w, h, title, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8, 'stroke-dasharray': o.dash, opacity: op });
    if (title) tx(x + 10, y + 21, title, { 'font-size': o.fs || 14.5, 'font-weight': 700, opacity: op, fill: o.tcol || INK });
    if (o.type) mono(x + w - 10, y + 21, o.type, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }
  // 상자 안 꺾은선 (u 만큼)
  function spark(x, y, w, h, data, max, u, col, o) { o = o || {}; if (u <= 0) return; const n = data.length - 1, k = clamp(u) * n, i = Math.floor(k);
    const P = data.slice(0, i + 1).map((v, j) => [x + (j / n) * w, y + h - (v / max) * h]);
    if (i < n) { const f = k - i; P.push([x + ((i + f) / n) * w, y + h - (lerp(data[i], data[i + 1], f) / max) * h]); }
    if (o.fill) el('polygon', { points: [[P[0][0], y + h], ...P, [P[P.length - 1][0], y + h]].map((p) => p.join(',')).join(' '), fill: col || ACC, opacity: o.fill });
    el('polyline', { points: P.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.5, 'stroke-linejoin': 'round' }); }
  // 반원 게이지: v(0~100), 띠 색은 70/90 경계
  function gauge(cx, cy, r, v, u) { const A = (p) => Math.PI * (1 - p / 100), P = (p, rr) => [cx + rr * Math.cos(A(p)), cy - rr * Math.sin(A(p))];
    const arc = (a, b, col, sw) => { const [x1, y1] = P(a, r), [x2, y2] = P(b, r); el('path', { d: `M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`, fill: 'none', stroke: col, 'stroke-width': sw }); };
    arc(0, 100, SOFT, 14); if (u > 0) arc(0, Math.max(0.5, v * u), GOOD, 14);
    const [nx, ny] = P(v * u, r - 22); el('line', { x1: cx, y1: cy, x2: nx, y2: ny, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' }); el('circle', { cx, cy, r: 5, fill: INK }); }
  // Grafana 머리줄: 경로 + 시간 선택기 + 새로고침
  function topbar(x, y, w, crumb, time, o) { o = o || {};
    el('rect', { x, y, width: w, height: 40, rx: 6, fill: INK });
    tx(x + 14, y + 26, crumb, { 'font-size': 15, 'font-weight': 700, fill: PANEL, opacity: o.cOp ?? 1 });
    if (time) { const tw0 = tw(time, 13.5) + 22, rx = x + w - (o.refresh ? 74 : 10) - tw0;
      el('rect', { x: rx, y: y + 8, width: tw0, height: 24, rx: 5, fill: 'none', stroke: o.tHot ? ACC : OFF, 'stroke-width': o.tHot ? 2.4 : 1.4 });
      mono(rx + 11, y + 25, time, { 'font-size': 13.5, fill: PANEL });
      if (o.refresh) { el('rect', { x: x + w - 66, y: y + 8, width: 56, height: 24, rx: 5, fill: 'none', stroke: OFF, 'stroke-width': 1.4 }); mono(x + w - 38, y + 25, o.refresh, { 'font-size': 13.5, fill: PANEL, 'text-anchor': 'middle' }); } } }
  function chip(x, y, s, col, sc, o) { o = o || {}; const w = tw(s, 13.5) + 18, g = R.G(x + w / 2, y, sc ?? 1, o.op);
    el('rect', { x: -w / 2, y: -12, width: w, height: 24, rx: 5, fill: o.fill || ACCBG, stroke: col || ACC, 'stroke-width': 1.4 }, g);
    mono(0, 5, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col || ACC, 'font-weight': 700 }, g); return w; }
  // 24칸 그리드 보드: 좌표 변환을 돌려준다
  function board(x, y, w, rowH, rows, o) { o = o || {}; const cw = w / 24;
    el('rect', { x, y, width: w, height: rows * rowH, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.2 });
    for (let i = 1; i < 24; i++) el('line', { x1: x + i * cw, y1: y, x2: x + i * cw, y2: y + rows * rowH, stroke: GRID, 'stroke-width': i % 6 === 0 ? 1.4 : 0.6, opacity: o.gridOp ?? 1 });
    if (o.ruler) [0, 6, 12, 18, 24].forEach((v) => mono(x + v * cw, y - 8, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    return { X: (c) => x + c * cw, Y: (r) => y + r * rowH, cw, rowH }; }
  function folderIcon(cx, cy, w, h, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op), col = o.stroke || INK;
    el('path', { d: `M${-w / 2},${-h / 2 + 10} V${h / 2} H${w / 2} V${-h / 2 + 10} H${-w / 2 + 52} L${-w / 2 + 42},${-h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    if (name) tx(-w / 2 + 14, -h / 2 + 34, name, { 'font-size': 15, 'font-weight': 800, fill: col }, g); return g; }

  // ========== 1. 빈 보드 ==========
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const typed = k === 0 ? Math.round(lerp(0, 14, E(u, 0.2, 1.0))) : 14;
    topbar(30, 30, 580, 'Platform / ' + 'Service Health'.slice(0, typed), k >= 2 && k < 5 ? (k === 2 && u < 1.0 ? 'Last 6 hours' : 'Last 1 hour') : (k >= 5 ? 'Last 1 hour' : 'Last 6 hours'), { refresh: k >= 2 ? '30s' : null, tHot: k === 2 });
    // tag 줄
    tx(40, 96, 'tags', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (b.tags.length) chip(80, 91, 'platform', ACC, k === 1 ? pop(u, 0.3) : 1);
    else mono(80, 96, '[]', { 'font-size': 13.5, fill: OFF });
    // 변수·annotation 자리
    if (k >= 3) { const s = k === 3 ? E(u, 0.3, 1.0) : 1;
      [['변수 자리', 40], ['annotation 자리', 190]].forEach(([s0, x], i) => { el('rect', { x, y: 112, width: 136, height: 28, rx: 5, fill: 'none', stroke: i ? WARN : INFO, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', opacity: s });
        tx(x + 68, 131, s0, { 'font-size': 13.5, 'text-anchor': 'middle', fill: i ? WARN : INFO, opacity: s }); }); }
    // 빈 도화지
    const hot = k === 4;
    el('rect', { x: 30, y: 152, width: 580, height: 236, rx: 8, fill: hot ? SOFT : PANEL, stroke: hot ? ACC : OFF, 'stroke-width': 2, 'stroke-dasharray': '8 6' });
    if (hot) { const g = E(u, 0.2, 1.2); for (let i = 1; i < 24; i++) if (i / 24 < g) el('line', { x1: 30 + i * 580 / 24, y1: 156, x2: 30 + i * 580 / 24, y2: 384, stroke: GRID, 'stroke-width': i % 6 === 0 ? 1.4 : 0.6 }); }
    tx(320, 262, '+ Add visualization', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? ACC : MUT });
    mono(320, 292, '"panels": []', { 'font-size': 16, 'text-anchor': 'middle', fill: hot ? ACC : OFF, 'font-weight': 700 });
    if (hot) { sub(320, 330, '24칸 격자만 있고 그릴 데이터는 0개', fade(u, 1.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

    // 오른쪽: beat 마다 한 가지
    const RX = 650;
    if (k === 0) { el('rect', { x: RX, y: 70, width: 290, height: 34, rx: 6, fill: SOFT, stroke: GRID });
      mono(RX + 12, 92, '/d/' + 'service-health'.slice(0, Math.round(lerp(0, 14, E(u, 0.6, 1.4)))), { 'font-size': 14.5, fill: INK });
      lbl(RX + 145, 56, 'URL에 박히는 uid', fade(u, 0.5), { fill: ACC });
      const ren = E(u, 1.7, 2.3);
      tx(RX, 160, 'title', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.5) });
      mono(RX + 60, 160, ren > 0.5 ? '"Service Health v2"' : '"Service Health"', { 'font-size': 14.5, opacity: fade(u, 1.5), fill: ren > 0.5 ? WARN : INK });
      tx(RX, 196, 'uid', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.5) });
      mono(RX + 60, 196, '"service-health"', { 'font-size': 14.5, opacity: fade(u, 1.5), fill: ACC, 'font-weight': 700 });
      lock(RX + 240, 192, true, ACC, pop(u, 2.1));
      sub(RX + 145, 248, '이름을 바꿔도 링크는 그대로', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { [['tags', '["platform"]', ACC], ['timezone', '"browser"', INK], ['schemaVersion', '39', INK], ['version', '1', INK]].forEach(([a, v, col], i) => {
        const y = 92 + i * 52, s = pop(u, 0.3 + i * 0.35); card(RX + 145, y, 290, 40, { rx: 8, stroke: i ? GRID : ACC, s });
        tx(RX + 14, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4 + i * 0.35) }); mono(RX + 276, y + 5, v, { 'font-size': 15, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.4 + i * 0.35) }); });
      sub(RX + 145, 320, 'tag는 검색, 나머지는 보드 메타', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 2) { // 6시간 창이 1시간으로 줄어든다
      const x0 = RX, w = 290, f = lerp(1, 1 / 6, E(u, 0.4, 1.3));
      tx(x0, 80, '보드 시간창', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      el('rect', { x: x0, y: 92, width: w, height: 26, rx: 4, fill: SOFT });
      el('rect', { x: x0 + w * (1 - f), y: 92, width: w * f, height: 26, rx: 4, fill: ACC, opacity: 0.85 });
      mono(x0, 138, 'now-6h', { 'font-size': 13.5, fill: MUT }); mono(x0 + w, 138, 'now', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      mono(x0 + w * (1 - f), 82, 'now-1h', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.2) });
      clock(x0 + 60, 230, 34, (u * 0.5) % 1, ACC, null); mono(x0 + 60, 236, '30s', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      tx(x0 + 115, 222, 'refresh 30s', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); sub(x0 + 185, 248, '30초마다 다시 묻는다', fade(u, 1.7), { 'font-size': 14 });
      sub(x0 + 145, 320, '보드의 모든 패널이 이 창을 같이 쓴다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { mono(RX, 110, '"templating": { "list": [] }', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 0.4) });
      mono(RX, 150, '"annotations": { "list": [] }', { 'font-size': 14.5, fill: WARN, opacity: fade(u, 0.9) });
      sub(RX + 145, 210, '자리만 잡아 둔 빈 배열', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(RX + 145, 240, '변수는 Part II에서 채운다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 4) { card(RX + 145, 130, 250, 64, { rx: 10, text: 'dashboard 자체 데이터\n0 행', fs: 16, stroke: BAD, color: BAD, s: pop(u, 0.6) });
      sub(RX + 145, 210, '보드는 패널을 담는 껍데기', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5 저장 흐름
    const ST = ['New dashboard', '폴더 Platform 지정', 'tag platform 부여', 'Save'];
    ST.forEach((s0, i) => { const y = 82 + i * 62, s = pop(u, 0.2 + i * 0.4); card(RX + 120, y, 220, 42, { rx: 21, text: s0, fs: 15, stroke: i === 3 ? ACC : INK, color: i === 3 ? ACC : INK, s });
      if (i < 3) grow(RX + 120, y + 22, RX + 120, y + 40, E(u, 0.4 + i * 0.4, 0.6 + i * 0.4), MUT); });
    dot([[RX + 120, 82], [RX + 120, 268]], seg(u, 0.3, 1.9), ACC, 7);
    if (u > 2.0) { pill(RX + 120, 340, 'uid service-health 확정', ACC, pop(u, 2.0), { mono: true, fs: 14 }); } }

  // ========== 2. Panel 추가 ==========
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 6) { // 24칸 나눠 쓰기
      const x0 = 120, W = 600; [[24], [12, 12], [8, 8, 8], [6, 6, 6, 6]].forEach((row, r) => { const y = 60 + r * 80, sp = E(u, 0.3 + r * 0.45, 0.8 + r * 0.45);
        let acc = 0; row.forEach((w, i) => { const x = x0 + (acc / 24) * W, ww = (w / 24) * W; acc += w;
          const gap = sp * 6; el('rect', { x: x + (i ? gap : 0), y, width: ww - (i ? gap : 0) - (i < row.length - 1 ? gap : 0), height: 50, rx: 6, fill: r === 0 ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 2 });
          if (sp > 0.5 || r === 0) mono(x + ww / 2, y + 31, 'w ' + w, { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC }); });
        tx(x0 - 20, y + 31, ['풀 폭', '절반', '1/3', '1/4'][r], { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.3 + r * 0.45) }); });
      sub(420, 395, '한 줄의 w 합이 24가 되게 나눈다', fade(u, 2.2), { 'font-size': 15.5, fill: INK, 'font-weight': 700 }); return; }
    const B = board(30, 70, 560, 24, 10, { ruler: true });
    const w = k < 2 ? 12 : k === 2 ? lerp(12, 24, E(u, 0.4, 1.4)) : 24, PX = B.X(0) + 3, PY = B.Y(0) + 3, PW = B.X(w) - B.X(0) - 6, PH = 8 * 24 - 6;
    gpanel(PX, PY, PW, PH, k >= 1 ? 'p99 Latency' : null, { type: k >= 1 ? 'timeseries' : null, dash: k === 0 ? '6 5' : null, stroke: k === 0 || k === 2 ? ACC : GRID, s: 1, op: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) { mono(PX + PW / 2, PY + PH / 2 + 5, 'id 1', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.7) }); }
    // 그래프 칸
    const gx = PX + 64, gy = PY + 40, gw = PW - 84, gh = PH - 60;
    if (k >= 1) { el('line', { x1: gx, y1: gy + gh, x2: gx + gw, y2: gy + gh, stroke: GRID, 'stroke-width': 1.4 }); el('line', { x1: gx, y1: gy, x2: gx, y2: gy + gh, stroke: GRID, 'stroke-width': 1.4 }); }
    if (k >= 4) { const lu = k === 4 ? E(u, 1.3, 2.4) : 1; spark(gx, gy, gw, gh, SER, 0.3, lu, ACC);
      [[0.1, '0.1', '100 ms'], [0.2, '0.2', '200 ms']].forEach(([v, a, bb]) => { const yy = gy + gh - (v / 0.3) * gh, sw = k === 5 ? E(u, 0.5, 1.2) : k > 5 ? 1 : 0;
        mono(gx - 8, yy + 5, sw > 0.5 ? bb : a, { 'font-size': 13.5, 'text-anchor': 'end', fill: sw > 0.5 ? ACC : MUT, 'font-weight': sw > 0.5 ? 700 : 400 }); }); }
    if (k === 2) mono(B.X(w) - 4, B.Y(8) + 22, `w ${Math.round(w)}`, { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
    // 오른쪽
    const RX = 620;
    if (k === 0) { mono(RX, 110, '"panels": [', { 'font-size': 15, opacity: fade(u, 0.2) }); mono(RX + 20, 140, '{ "id": 1 }', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(RX, 170, ']', { 'font-size': 15, opacity: fade(u, 0.2) });
      sub(RX + 150, 230, '배열에 객체 하나 = 패널 하나', fade(u, 1.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { pill(RX + 150, 110, 'title  p99 Latency', INK, pop(u, 0.3), { fs: 14.5 }); pill(RX + 150, 160, 'type  timeseries', ACC, pop(u, 0.8), { mono: true, fs: 14.5 });
      sub(RX + 150, 220, 'type이 그리는 방식을 정한다', fade(u, 1.4), { 'font-size': 15 }); return; }
    if (k === 2) { mono(RX + 20, 120, '"gridPos": {', { 'font-size': 14.5 }); mono(RX + 40, 150, `"x": 0, "y": 0,`, { 'font-size': 14.5 }); mono(RX + 40, 180, `"w": ${Math.round(w)}, "h": 8`, { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); mono(RX + 20, 210, '}', { 'font-size': 14.5 });
      sub(RX + 150, 260, 'h는 높이 칸 수', fade(u, 1.6), { 'font-size': 15 }); return; }
    // 데이터소스
    const DX = 860, DY = 250; R.dbIcon(DX, DY, 'Prometheus', { s: k === 3 ? pop(u, 0.3) : 1 });
    if (k === 3) { grow(PX + PW, PY + 120, DX - 48, DY, E(u, 0.8, 1.5), ACC, { dash: '6 5' }); pill(DX - 40, 120, 'uid prom-default', ACC, pop(u, 1.4), { mono: true, fs: 13.5 }); return; }
    el('line', { x1: PX + PW, y1: PY + 120, x2: DX - 48, y2: DY, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    if (k === 4) { R.fly(PX + PW - 30, PY + 110, DX - 40, DY - 50, seg(u, 0.2, 1.1), 'refId A · histogram_quantile(0.99, …)', { mono: true });
      for (let i = 0; i < 5; i++) dot([[DX - 48, DY], [PX + PW, PY + 120]], seg(u, 1.0 + i * 0.12, 1.6 + i * 0.12), INK, 5);
      sub(DX - 40, 340, '결과 시계열이 선이 된다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 5) { card(DX - 50, 110, 200, 66, { rx: 10, text: 'unit "s"\n0.18 → 180 ms', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.4) });
      const lx = gx + gw, ly = gy + gh - (0.18 / 0.3) * gh; el('circle', { cx: lx, cy: ly, r: 6, fill: ACC, opacity: fade(u, 1.2) });
      pill(lx - 50, ly - 30, '180 ms', ACC, pop(u, 1.3), { mono: true, fs: 14 }); } }

  // ========== 3. 4-panel 보드 ==========
  const P4 = [[0, 0, 12, 8], [12, 0, 6, 8], [18, 0, 6, 8], [0, 8, 24, 6]];
  function s3(t, c) { const { k, u } = c, b = c.beat;
    topbar(30, 14, 900, 'Platform / Service Health — Golden Signals', 'Last 1 hour', { refresh: '30s', tHot: k === 6 });
    chip(40, 74, 'platform', ACC); if (k >= 0) chip(130, 74, 'golden-signals', ACC, k === 0 ? pop(u, 0.4) : 1);
    if (k === 0) { mono(300, 79, '/d/golden-signals', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) }); }
    const B = board(30, 96, 600, 21, 14);
    const rect = (gp) => [B.X(gp[0]) + 3, B.Y(gp[1]) + 3, B.X(gp[0] + gp[2]) - B.X(gp[0]) - 6, gp[3] * 21 - 6];
    // 1. Latency
    const w1 = k === 0 ? 24 : k === 1 ? lerp(24, 12, E(u, 0.3, 1.2)) : 12, [x1, y1, , h1] = rect([0, 0, w1, 8]), W1 = B.X(w1) - B.X(0) - 6;
    gpanel(x1, y1, W1, h1, 'p99 Latency', { type: W1 > 240 ? 'timeseries' : null, stroke: k === 1 ? ACC : GRID }); spark(x1 + 14, y1 + 36, W1 - 28, h1 - 50, SER, 0.3, 1, ACC);
    if (k === 1) { const [ex, ey, ew, eh] = rect([12, 0, 12, 8]); el('rect', { x: ex, y: ey, width: ew, height: eh, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.2) });
      tx(ex + ew / 2, ey + eh / 2 + 5, '12칸 빈자리', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.4) }); }
    // 2. RPS
    if (k >= 2) { const [x, y, w, h] = rect(P4[1]), dx = k === 2 ? (1 - E(u, 0.2, 1.0)) * 300 : 0;
      gpanel(x + dx, y, w, h, 'RPS', { type: 'stat', stroke: k === 2 ? ACC : GRID });
      mono(x + dx + w / 2, y + 96, '1.24K', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO }); mono(x + dx + w / 2, y + 122, 'req/s', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO }); }
    // 3. Error Rate
    const errC = k >= 4 ? GOOD : INK;
    if (k >= 3) { const [x, y, w, h] = rect(P4[2]), dx = k === 3 ? (1 - E(u, 0.2, 1.0)) * 300 : 0;
      gpanel(x + dx, y, w, h, 'Error Rate', { type: null, stroke: k === 3 ? ACC : k === 4 ? GOOD : GRID, fill: k >= 4 ? GOODBG : PANEL, fs: 14 });
      mono(x + dx + w / 2, y + 104, '0.420%', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 4 ? (u > 1.4 ? GOOD : INK) : errC }); }
    if (k === 3) { [[0, 12], [12, 6], [18, 6]].forEach(([x0, w], i) => { const xa = B.X(x0) + 4, xb = B.X(x0 + w) - 4, yy = B.Y(8) + 4;
        el('line', { x1: xa, y1: yy, x2: lerp(xa, xb, E(u, 1.0 + i * 0.3, 1.3 + i * 0.3)), y2: yy, stroke: ACC, 'stroke-width': 4 }); });
      lbl(330, B.Y(8) + 48, '12 + 6 + 6 = 24', fade(u, 2.0), { class: 'mono', fill: ACC, 'font-size': 17 }); }
    // 4. CPU
    if (k >= 5) { const [x, y, w, h] = rect(P4[3]), dy = k === 5 ? -(1 - E(u, 0.2, 1.0)) * 120 : 0, op = k === 5 ? fade(u, 0.2) : 1;
      if (op > 0.05) { gpanel(x, y + dy, w, h, 'CPU 사용률', { type: 'gauge', stroke: k === 5 ? ACC : GRID, op });
        gauge(x + w / 2 - 40, y + dy + h - 16, 66, 67, k === 5 ? E(u, 1.0, 2.0) : 1); mono(x + w / 2 + 50, y + dy + h - 30, '67%', { 'font-size': 26, 'font-weight': 800, fill: GOOD, opacity: k === 5 ? fade(u, 1.8) : 1 }); } }
    // 오른쪽 설명
    const RX = 660;
    if (k === 2) { sub(RX + 135, 140, 'x 12 · w 6', fade(u, 0.8), { class: 'mono', 'font-size': 16, fill: ACC, 'font-weight': 700 });
      sub(RX + 135, 176, 'Traffic을 값 하나로', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(RX + 135, 214, 'reqps는 1000을 넘으면 K를 붙인다', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 3) { sub(RX + 135, 140, 'x 18 · w 6', fade(u, 0.8), { class: 'mono', 'font-size': 16, fill: ACC, 'font-weight': 700 });
      sub(RX + 135, 176, '5xx ÷ 전체 요청', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 4) { // 임계값 수직선: 0 ~ 0.06
      const x0 = RX + 10, W = 260, X = (v) => x0 + (v / 0.06) * W, y = 160, g = E(u, 0.2, 1.0);
      [[0, 0.01, GOOD], [0.01, 0.05, WARN], [0.05, 0.06, BAD]].forEach(([a, bb, col], i) => el('rect', { x: X(a), y, width: (X(bb) - X(a)) * clamp(g * 3 - i), height: 22, fill: col, opacity: 0.85 }));
      [[0, '0'], [0.01, '0.01'], [0.05, '0.05']].forEach(([v, s]) => mono(X(v), y + 44, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) }));
      const mx = X(0.0042); el('line', { x1: mx, y1: y - 14, x2: mx, y2: y + 30, stroke: INK, 'stroke-width': 3, opacity: fade(u, 1.2) });
      mono(mx, y - 22, '0.0042', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(x0, 250, '0.0042 < 0.01 → 초록', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      sub(x0 + 130, 286, '1%를 넘으면 노랑, 5%부터 빨강', fade(u, 2.0), { 'font-size': 14.5 }); }
    if (k === 5) { sub(RX + 135, 170, 'y 8 · w 24 · h 6', fade(u, 0.6), { class: 'mono', 'font-size': 16, fill: ACC, 'font-weight': 700 });
      sub(RX + 135, 206, '둘째 줄로 내려간다', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(RX + 135, 242, 'max 100이 눈금 끝', fade(u, 1.6), { 'font-size': 14.5 }); }
    if (k === 6) { P4.forEach((gp, i) => { const [x, y, w] = rect(gp); pill(x + w / 2, y + (i === 3 ? 30 : 58), gp.join(','), INK, pop(u, 0.2 + i * 0.25), { mono: true, fs: 13.5, fill: PANEL }); });
      P4.forEach((gp, i) => { const [x, y, w] = rect(gp); dot([[820, 34], [x + w - 20, y + 12]], seg(u, 1.3 + i * 0.1, 2.1 + i * 0.1), ACC, 6); });
      sub(RX + 135, 140, '시간창 1번 = 4패널 동시 갱신', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 0) { sub(RX + 135, 150, 'tag 하나 더', fade(u, 0.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(RX + 135, 184, 'uid도 새 보드용으로', fade(u, 1.2), { 'font-size': 14.5 }); }
  }

  // ========== 4. Folder & Tag ==========
  const DASH = [['Service Health', 'P', ['platform', 'golden-signals']], ['Node Exporter', 'P', ['platform', 'prod']], ['Payment API', 'Y', ['payment', 'golden-signals', 'prod']], ['Payment Batch', 'Y', ['payment']]];
  function s4(t, c) { const { k, u } = c;
    if (k <= 4) {
      // 파일 → Grafana → 폴더
      const F = [110, 92]; card(F[0], F[1], 170, 78, { rx: 8, stroke: INK, s: k === 0 ? pop(u, 0.2) : 1 });
      mono(F[0] - 72, F[1] - 14, 'dashboards.yml', { 'font-size': 14, 'font-weight': 700 }); mono(F[0] - 72, F[1] + 10, 'apiVersion: 1', { 'font-size': 13.5, fill: MUT }); mono(F[0] - 72, F[1] + 30, 'providers:', { 'font-size': 13.5, fill: MUT });
      const G0 = [380, 92]; card(G0[0], G0[1], 150, 56, { rx: 10, text: 'Grafana', fs: 17, stroke: ACC, color: ACC, fill: ACCBG, s: k === 0 ? pop(u, 0.6) : 1 });
      el('line', { x1: F[0] + 86, y1: F[1], x2: G0[0] - 76, y2: G0[1], stroke: GRID, 'stroke-width': 2.5 });
      if (k === 0) { dot([[F[0] + 86, F[1]], [G0[0] - 76, G0[1]]], seg(u, 0.9, 1.7), ACC, 7); sub(380, 170, 'UI로 만들지 않아도 보드가 뜬다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      // 폴더
      const PF = [700, 120], YF = [700, 300], showY = k >= 3;
      folderIcon(PF[0], PF[1], 300, 130, 'Team-Platform', { s: k === 1 ? pop(u, 0.3) : 1, stroke: k === 2 ? WARN : INK });
      mono(PF[0] + 150, PF[1] - 74, 'folderUid team-platform', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: k === 1 ? fade(u, 1.0) : 1 });
      ['Service Health', 'Node Exporter'].forEach((n, i) => card(PF[0] - 70 + i * 140, PF[1] + 22, 128, 36, { rx: 6, text: n, fs: 13.5, stroke: GRID, s: k === 1 ? pop(u, 0.8 + i * 0.3) : 1 }));
      grow(G0[0] + 76, G0[1], PF[0] - 152, PF[1], k === 1 ? E(u, 0.4, 0.9) : 1, MUT);
      if (k === 1) { lock(PF[0] + 178, PF[1] - 24, false, INFO, pop(u, 1.4));
        sub(380, 250, '폴더 이름이 곧 권한 단위', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
        sub(380, 284, 'folderUid는 이름이 바뀌어도 그대로', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      if (k === 2) { lock(PF[0] + 178, PF[1] - 24, true, WARN, pop(u, 0.3));
        card(380, 230, 210, 44, { rx: 8, text: 'Save', fs: 16, stroke: OFF, color: OFF, s: pop(u, 0.6) }); cross(510, 230, 13, pop(u, 1.0));
        sub(380, 280, 'Cannot save provisioned dashboard', fade(u, 1.2), { class: 'mono', 'font-size': 13.5, fill: BAD });
        clock(110, 250, 30, (u / 3) % 1, ACC, null); mono(110, 256, '30s', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' });
        sub(110, 304, '30초마다 파일을 다시 읽는다', fade(u, 1.6), { 'font-size': 14 });
        sub(380, 340, 'allowUiUpdates: false — 파일이 원본', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      if (showY) { folderIcon(YF[0], YF[1], 300, 130, 'Team-Payment', { s: k === 3 ? pop(u, 0.3) : 1 });
        ['Payment API', 'Payment Batch'].forEach((n, i) => card(YF[0] - 70 + i * 140, YF[1] + 22, 128, 36, { rx: 6, text: n, fs: 13.5, stroke: GRID, s: k === 3 ? pop(u, 0.8 + i * 0.3) : 1 }));
        grow(G0[0] + 76, G0[1] + 10, YF[0] - 152, YF[1], k === 3 ? E(u, 0.4, 0.9) : 1, MUT); }
      if (k === 3) { [['…/dashboards/platform', PF], ['…/dashboards/payment', YF]].forEach(([pth, F2], i) => { mono(60, 230 + i * 70, pth, { 'font-size': 14, opacity: fade(u, 1.0 + i * 0.4), fill: i ? WARN : INFO, 'font-weight': 700 });
          dot([[250, 225 + i * 70], [F2[0] - 150, F2[1] + 20]], seg(u, 1.3 + i * 0.4, 2.2 + i * 0.4), i ? WARN : INFO, 6); });
        sub(170, 380, '경로가 달라 보드 파일이 섞이지 않는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      // k4 권한
      const who = [['Platform 팀', PF, 'Edit', GOOD, 0], ['다른 팀', PF, 'View', INFO, 1], ['Payment 팀', YF, 'Edit', GOOD, 2], ['다른 팀', YF, '없음', BAD, 3]];
      who.forEach(([n, F2, perm, col, i]) => { const py = 200 + i * 52, s = pop(u, 0.2 + i * 0.35);
        R.person(70, py - 6, null, { s: s * 0.6 }); tx(100, py, n, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) });
        grow(200, py - 5, F2[0] - 155, F2[1] + 40 + (i % 2) * 14, E(u, 0.5 + i * 0.35, 1.0 + i * 0.35), col === GOOD ? ACC : col === BAD ? BAD : MUT, { dash: col === BAD ? '5 4' : null });
        pill(300, py - 5, perm, col, pop(u, 0.8 + i * 0.35), { fs: 13.5 }); if (col === BAD) cross(F2[0] - 170, F2[1] + 54, 9, pop(u, 1.6 + i * 0.1)); });
      sub(700, 400, '권한은 보드가 아니라 폴더에 붙는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5~7: 보드 목록과 tag
    const prodOn = k >= 5, sel = k === 6 ? (u < 1.3 ? ['prod'] : ['prod', 'golden-signals']) : [];
    const tagsOf = (i) => (i === 0 && prodOn ? DASH[0][2].concat(['prod']) : DASH[i][2]);
    if (k === 7) { // 세 가지 역할
      [['folder', '권한 경계', '팀 단위로 신중히 · 옮기기 번거롭다', INFO], ['tag', '검색 필터', '자유롭게 여러 개 · 환경/팀/도메인', ACC], ['uid', '영구 URL', '이름이 바뀌어도 링크가 안 깨진다', WARN]].forEach(([a, bb, cc, col], i) => {
        const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.45); card(cx, 170, 270, 150, { rx: 12, stroke: col, sw: 2.4, s });
        lbl(cx, 128, a, fade(u, 0.3 + i * 0.45), { 'font-size': 22, class: 'mono', fill: col }); lbl(cx, 172, bb, fade(u, 0.4 + i * 0.45), { 'font-size': 18 });
        sub(cx, 210, cc, fade(u, 0.6 + i * 0.45), { 'font-size': 13.5 }); });
      if (u > 1.6) { lock(170, 300, true, INFO, pop(u, 1.6)); chip(445, 300, 'prod', ACC, pop(u, 1.8)); mono(790, 305, '/d/golden-signals', { 'font-size': 14.5, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.0) }); }
      return; }
    // 검색창
    el('rect', { x: 40, y: 30, width: 880, height: 44, rx: 8, fill: PANEL, stroke: k === 6 ? ACC : GRID, 'stroke-width': 1.8 });
    tx(58, 58, 'Filter by tags', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
    let cx0 = 180; sel.forEach((s0, i) => { cx0 += chip(cx0, 52, s0, ACC, pop(u, i === 0 ? 0.3 : 1.3)) + 8; });
    if (sel.length === 2) tx(cx0 + 8, 58, '둘 다 붙은 보드만 (AND)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
    DASH.forEach(([n, f, tags0], i) => { const tags = tagsOf(i), y = 110 + i * 64, ok = sel.every((s0) => tags.includes(s0)), op = sel.length ? (ok ? 1 : 0.22) : 1;
      el('rect', { x: 40, y, width: 880, height: 52, rx: 8, fill: sel.length && ok ? ACCBG : PANEL, stroke: GRID, 'stroke-width': 1.4, opacity: op });
      tx(60, y + 32, n, { 'font-size': 16, 'font-weight': 700, opacity: op }); tx(250, y + 32, f === 'P' ? 'Team-Platform' : 'Team-Payment', { 'font-size': 13.5, fill: MUT, opacity: op });
      let tx0 = 420; tags.forEach((s0) => { const isNew = i === 0 && s0 === 'prod' && k === 5; tx0 += chip(tx0, y + 26, s0, isNew ? WARN : ACC, isNew ? pop(u, 0.6) : 1, { op, fill: isNew ? WARNBG : ACCBG }) + 8; }); });
    if (k === 5) sub(480, 390, 'Service Health에 prod를 더해 tag 3개', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 6) sub(480, 390, '/api/search?tag=prod&tag=golden-signals와 같다', fade(u, 2.1), { class: 'mono', 'font-size': 14 }); }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: '대시보드 제목을 "Service Health v2"로 바꿨을 때 그대로 남는 것은 무엇인가?',
      o: ['보드 URL에 들어 있는 uid', 'title 필드 값', '화면 맨 위 경로 표시'], a: 0,
      why: 'uid는 URL(/d/service-health)에 박히는 영구 식별자다. title은 사람이 읽는 이름이라 바뀌어도 링크는 깨지지 않는다.' },
    { q: 'gridPos를 { x: 0, y: 0, w: 24, h: 8 }로 둔 패널은 보드에서 어떻게 보이는가?',
      o: ['보드 왼쪽 절반을 차지한다', '맨 윗줄 가로 전체를 차지한다', '보드 높이 전체를 차지한다'], a: 1,
      why: '보드 가로는 24칸이다. w 24는 한 줄을 꽉 채우고, h 8은 높이 칸 수일 뿐이다.' },
    { q: 'Error Rate 값이 0.0042이고 임계값이 0.01(노랑), 0.05(빨강)일 때 패널 색은 무엇인가?',
      o: ['빨강', '노랑', '초록'], a: 2,
      why: '0.0042는 첫 경계 0.01보다 작아 기본색 초록 구간에 있다. percentunit이라 화면에는 0.420%로 보인다.' },
    { q: '대시보드 권한을 팀별로 나눌 때 기준이 되는 단위는 무엇인가?',
      o: ['폴더', 'tag', 'uid'], a: 0,
      why: '권한은 폴더에 붙는다. tag는 검색 필터이고 uid는 링크용 식별자라 권한을 정하지 않는다.' },
  ];

  const summary = [
    '대시보드는 데이터를 갖지 않는다. 패널을 담는 틀과 공통 시간창, 변수 자리만 있다.',
    '패널은 panels 배열의 객체 하나이고, gridPos로 가로 24칸 격자에 놓인다.',
    '시간창은 보드 공통이라 우상단에서 한 번 바꾸면 모든 패널이 다시 쿼리한다.',
    '폴더는 권한 단위, tag는 검색 필터, uid는 바뀌지 않는 URL 식별자다.',
  ];
  const review = [
    { q: '한 줄에 p99 Latency(w 12), RPS(w 6)를 놓았다. Error Rate를 같은 줄 오른쪽 끝에 붙이려면 gridPos는?',
      o: ['x 18, y 0, w 6', 'x 12, y 0, w 12', 'x 0, y 8, w 6'], a: 0,
      why: '앞 두 패널이 0~18칸을 쓰므로 x 18에서 w 6이면 합이 24로 줄이 꽉 찬다. y 8은 다음 줄이다.' },
    { q: '다른 팀이 결제 보드를 고칠 수 있다는 보고가 왔다. 먼저 확인할 곳은?',
      o: ['보드의 tags 목록', 'Team-Payment 폴더의 권한', '보드의 time range'], a: 1,
      why: '편집 권한은 폴더 단위로 붙는다. tag와 시간창은 누가 고칠 수 있는지와 관계가 없다.' },
    { q: 'provisioning으로 올린 보드를 화면에서 고친 뒤 저장했더니 거부됐다. 왜인가?',
      o: ['uid가 바뀌어서', '폴더에 tag가 없어서', 'allowUiUpdates가 false라서'], a: 2,
      why: 'allowUiUpdates: false인 provider의 보드는 UI 저장을 막는다. 고치려면 파일을 바꾸고, Grafana는 30초마다 파일을 다시 읽는다.' },
  ];

  R.page({ title: 'Grafana 대시보드 구조', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
