/* IV-1-2 무중단 배포 — Rolling · Blue-Green · Canary · Flag · 자동 롤백 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, clock, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 파드 칸: st = v1 | v2 | v2p(준비 전) | blue | green | empty
  const COL = { v1: [INFO, INFOBG], v2: [ACC, ACCBG], v2p: [ACC, PANEL], blue: [INFO, INFOBG], green: [GOOD, GOODBG], empty: [GRID, PANEL], bad: [BAD, BADBG] };
  function box(cx, cy, sz, st, o) { o = o || {}; const [c1, c2] = COL[st] || COL.empty;
    card(cx, cy, sz, sz, { rx: 6, stroke: c1, fill: c2, sw: st === 'empty' || st === 'v2p' ? 1.8 : 2.2, dash: st === 'empty' || st === 'v2p' ? '4 3' : null, s: o.s, op: o.op, text: o.text, fs: 13.5, mono: true, color: c1 }); }
  // v1/v2 트래픽 막대
  function tbar(x, y, w, pct, o) { o = o || {}; const a = o.l || ['v1', INFO], b = o.r || ['v2', ACC], v = clamp(pct / 100);
    el('rect', { x, y, width: w, height: 30, rx: 6, fill: SOFT });
    if (v < 1) el('rect', { x, y, width: w * (1 - v), height: 30, rx: 6, fill: a[1], opacity: 0.75 });
    if (v > 0) el('rect', { x: x + w * (1 - v), y, width: w * v, height: 30, rx: 6, fill: b[1] });
    if (1 - v > 0.12) mono(x + 10, y + 20, `${a[0]} ${Math.round((1 - v) * 100)}%`, { 'font-size': 14, 'font-weight': 700, fill: PANEL });
    if (v > 0.12) mono(x + w - 10, y + 20, `${b[0]} ${Math.round(v * 100)}%`, { 'font-size': 14, 'font-weight': 700, fill: PANEL, 'text-anchor': 'end' });
    else if (v > 0) mono(x + w + 8, y + 20, `${b[0]} ${Math.round(v * 100)}%`, { 'font-size': 14, 'font-weight': 700, fill: b[1] });
    if (o.title) tx(x, y - 10, o.title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); }

  // 1. Rolling Update
  const RX0 = 120, RS = 64;   // 10칸: 8 + surge 2
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const tr = tween(p.v2Traffic, b.v2Traffic, u);
    tbar(120, 350, 720, tr, { title: 'Service 트래픽 (준비된 파드에 고르게)' });
    if (k === 4) { // 시간축: 준비 20초 가정
      tx(120, 40, '새 파드 준비 20초 가정 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const cols = [[0, 7, 3, 0], [20, 4, 6, 3], [40, 1, 8, 6], [60, 0, 8, 8]], base = 300, ph = 21;
      el('line', { x1: 110, y1: base - 7 * ph, x2: 860, y2: base - 7 * ph, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 1.6) });
      mono(860, base - 7 * ph - 8, '준비 ≥ 7', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      cols.forEach(([tt, v1, v2, rd], i) => { const x = 170 + i * 180, g = E(u, 0.2 + i * 0.3, 0.7 + i * 0.3), hot = tt === 20;
        if (hot) el('rect', { x: x - 14, y: base - 10 * ph - 6, width: 108, height: 10 * ph + 12, rx: 8, fill: ACCBG, opacity: fade(u, 1.4) });
        let y = base; const seg2 = (n, col, dash, lab) => { for (let j = 0; j < n; j++) { y -= ph; el('rect', { x, y: y + 2, width: 80, height: ph - 3, rx: 3, fill: dash ? PANEL : col, stroke: col, 'stroke-width': 1.4, 'stroke-dasharray': dash ? '3 2' : null, opacity: g }); } };
        seg2(v1, INFO); seg2(rd, ACC); seg2(v2 - rd, ACC, true);
        mono(x + 40, base + 20, `t=${tt}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: g });
        mono(x + 40, base - 10 * ph - 12, `${v1}·${v2}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: g }); });
      return; }
    // 파드 칸
    const v1 = Math.round(tween(p.v1, b.v1, u)), v2 = b.v2 || 0, rdy = b.v2Ready == null ? v2 : b.v2Ready;
    for (let i = 0; i < 10; i++) { const x = RX0 + i * RS + 30, y = 150;
      let st = 'empty', s = 1;
      if (i < 8 && i < v1) st = 'v1';
      else if (i >= 8 - (8 - v1) && i < v1 + v2 && i >= v1) st = i - v1 < rdy ? 'v2' : 'v2p';
      if (i >= 8 && k < 1 && st === 'empty') continue;
      if (k === 0 && i < 8) s = pop(u, 0.2 + i * 0.1);
      if (k === 1 && i >= 8) s = pop(u, 0.3 + (i - 8) * 0.2);
      if (k === 3 && st.startsWith('v2')) s = pop(u, 0.6 + (i - v1) * 0.25);
      box(x, y, 52, st, { s, text: st === 'v1' ? '1.0' : st.startsWith('v2') ? '2.0' : '' }); }
    mono(RX0, 100, 'replicas: 8', { 'font-size': 15, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 });
    if (k >= 1) { const x8 = RX0 + 8 * RS - 2; el('line', { x1: x8, y1: 116, x2: x8, y2: 186, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: k === 1 ? fade(u, 0.3) : 1 });
      mono(RX0 + 9 * RS + 14, 100, 'maxSurge 2', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 0.5) : 1 }); }
    if (k === 1) { const s = 'maxUnavailable 1 → 준비된 파드 7개 아래로 안 내려간다';
      el('path', { d: `M${RX0},200 v10 h${7 * RS - 10} v-10`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.2) }); tx(RX0, 240, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(RX0, 266, '동시에 최대 10개, 최소 7개 준비', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 2) { const f = E(u, 0.4, 1.0); mono(RX0, 250, 'image: registry/orders:', { 'font-size': 15 });
      mono(RX0 + 23 * 9, 250, f < 0.5 ? '1.0.0' : '2.0.0', { 'font-size': 15, 'font-weight': 800, fill: f < 0.5 ? INFO : ACC, opacity: Math.abs(f - 0.5) * 2 });
      card(700, 245, 220, 56, { rx: 10, stroke: ACC, sw: 2.2, fill: ACCBG, s: pop(u, 1.2), text: 'ReplicaSet v2 (0개)', fs: 14.5, color: ACC });
      tx(700, 300, 'template 이 바뀌면 새 ReplicaSet', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
    if (k === 3) { tx(RX0 + 8 * RS - 20, 240, 'readyz OK 전에는 트래픽 0', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(RX0, 240, 'v1 8 → 7', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) }); }
    if (k === 5) { // 공존: 일부 요청이 v2 로 가서 호환이 깨지면 5XX
      for (let r = 0; r < 7; r++) { const toV2 = r % 2 === 1, x = toV2 ? RX0 + 6 * RS + 30 : RX0 + (r % 4) * RS + 30, st = 0.2 + r * 0.25;
        dot([[480, 330], [x, 182]], seg(u, st, st + 0.5), toV2 ? ACC : INFO, 6); if (toV2 && u > st + 0.5) { cross(x + 20, 210, 6, 1); } }
      mono(RX0 + 6 * RS + 70, 214, '5XX', { 'font-size': 14, fill: BAD, 'font-weight': 800, opacity: fade(u, 0.9) });
      clock(250, 266, 22, E(u, 1.3, 2.6) * 0.4, WARN, null); mono(282, 272, 'progressDeadlineSeconds 600', { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 1.3) });
      pill(720, 266, '↶ kubectl rollout undo', BAD, pop(u, 1.9), { mono: true, fs: 13.5 }); } }

  // 2. Blue-Green
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const BY = 120, GY = 260, X0 = 360, SV = [150, 190];
    const sel = k < 5 ? 'blue' : (u > 0.6 || k > 5 ? 'green' : 'blue');
    if (k < 6) { // Service
      card(SV[0], SV[1], 190, 86, { rx: 12, stroke: INK, sw: 2.2, fill: PANEL });
      tx(SV[0], SV[1] - 12, 'Service orders', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
      const hot = k === 4 || k === 5; if (hot) el('rect', { x: SV[0] - 84, y: SV[1] + 2, width: 168, height: 26, rx: 5, fill: sel === 'blue' ? INFOBG : GOODBG });
      mono(SV[0], SV[1] + 21, 'color: ' + sel, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: sel === 'blue' ? INFO : GOOD });
      // 파드 두 줄
      const blueOp = k === 5 ? 1 - E(u, 1.8, 2.5) : 1;
      for (let i = 0; i < 8; i++) { box(X0 + i * 62, BY, 50, 'blue', { s: k === 0 ? pop(u, 0.2 + i * 0.08) : 1, op: blueOp, text: k >= 1 ? '1.0' : '' });
        if (k >= 2) box(X0 + i * 62, GY, 50, 'green', { s: k === 2 ? pop(u, 0.3 + i * 0.1) : 1, text: k >= 3 ? '2.0' : '' }); }
      tx(X0 - 30, BY - 40, 'orders-blue  color=blue', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: blueOp });
      if (k >= 2) tx(X0 - 30, GY - 40, 'orders-green  color=green', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: k === 2 ? fade(u, 0.3) : 1 });
      const ty = sel === 'blue' ? BY : GY, tc = sel === 'blue' ? INFO : GOOD;
      grow(SV[0] + 95, SV[1], X0 - 34, ty, 1, tc, { plain: true, sw: 3 });
      for (let r = 0; r < 4; r++) { const st = (k === 5 ? 0.7 : 0.2) + r * 0.3; dot([[30, SV[1]], [SV[0] + 95, SV[1]], [X0 - 30, ty], [X0 + (r * 2 + 1) * 62, ty]], seg(u, st, st + 0.9), tc, 5.5); }
      if (k >= 3 && sel === 'blue') { el('line', { x1: SV[0] + 95, y1: SV[1], x2: X0 - 34, y2: GY, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); mono(X0 - 34, GY + 48, '트래픽 0', { 'font-size': 13.5, fill: MUT, opacity: k === 3 ? fade(u, 0.8) : 1 }); }
      // 자원 계기
      const n = Math.round(tween(p.v1 + p.v2, b.v1 + b.v2, u)) || 8;
      card(150, 340, 190, 56, { rx: 10, stroke: n > 8 ? WARN : GRID, sw: 1.8 }); tx(70, 334, '떠 있는 파드', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
      mono(70, 358, String(n) + (n >= 16 ? '  (2배)' : ''), { 'font-size': 19, 'font-weight': 800, fill: n > 8 ? WARN : INK });
      if (k === 4) { tx(X0, 380, '트래픽 스위치는 배포가 아니라 selector 한 줄', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) }); }
      if (k === 5) { mono(X0, 380, "kubectl patch svc orders … color: green", { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.2) });
        mono(X0 + 230, BY + 4, 'delete', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) * (1 - E(u, 2.6, 3)) }); }
      return; }
    // k6: 얻는 것과 치르는 것
    tx(250, 60, '얻는 것', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD }); tx(690, 60, '치르는 것', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD });
    [['즉시 100% 전환', 'selector 한 줄'], ['즉시 롤백', 'blue 로 다시 patch'], ['미리 검증', 'green 은 트래픽 0 상태로']].forEach(([a, b2], i) => { const y = 120 + i * 82, s = pop(u, 0.2 + i * 0.3);
      card(250, y, 330, 64, { rx: 10, stroke: GOOD, sw: 2, s }); check(110, y, 9, s); tx(132, y - 4, a, { 'font-size': 15.5, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 }); tx(132, y + 19, b2, { 'font-size': 13.5, fill: MUT, opacity: s > 0.5 ? 1 : 0 }); });
    [['파드 8 → 16', '잠시 자원 2배'], ['DB 스키마', 'v1·v2 가 같이 읽어야 한다'], ['cold start', '전환 직후 첫 분이 느릴 수 있다']].forEach(([a, b2], i) => { const y = 120 + i * 82, s = pop(u, 1.1 + i * 0.3);
      card(690, y, 330, 64, { rx: 10, stroke: BAD, sw: 2, s }); cross(550, y, 8, s); tx(572, y - 4, a, { 'font-size': 15.5, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 }); tx(572, y + 19, b2, { 'font-size': 13.5, fill: MUT, opacity: s > 0.5 ? 1 : 0 }); }); }

  // 3. Canary (Argo Rollouts + Istio)
  const STAIR = [[0, 1], [5, 1], [5, 10], [15, 10], [15, 50], [30, 50], [30, 100], [35, 100]];
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    // 왼쪽: stable 10 / canary 줄
    const sx = 50, sy = 300;
    const nSt = k === 8 ? Math.round(lerp(10, 0, E(u, 1.4, 2.4))) : 10, nCa = Math.round(tween(p.v2, b.v2, u));
    tx(sx, sy - 38, 'stable (1.0)', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
    for (let i = 0; i < 10; i++) box(sx + 14 + i * 30, sy - 14, 24, i < nSt ? 'v1' : 'empty', { s: k === 0 ? pop(u, 0.2 + i * 0.06) : 1 });
    tx(sx, sy + 26, 'canary (2.0)', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: k >= 1 ? 1 : 0.3 });
    for (let i = 0; i < 10; i++) box(sx + 14 + i * 30, sy + 52, 24, i < nCa ? 'v2' : 'empty', { op: k >= 1 ? 1 : 0.3, text: k === 5 && i < nCa ? '' : '' });
    if (k === 0) { card(200, 140, 260, 90, { rx: 10, stroke: ACC, sw: 2.2, s: pop(u, 0.6) }); mono(90, 130, 'kind: Rollout', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) }); mono(90, 160, 'replicas: 10', { 'font-size': 15, opacity: fade(u, 1.0) });
      tx(200, 212, 'Deployment 대신 단계가 들어 있는 CRD', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (k >= 1 && k <= 2) { pill(120, 110, 'orders-stable', INFO, k === 1 ? pop(u, 0.3) : 1, { mono: true, fs: 14 }); pill(300, 110, 'orders-canary', ACC, k === 1 ? pop(u, 0.6) : 1, { mono: true, fs: 14 });
      if (k === 1) tx(50, 200, '서비스가 둘이라 지표도 둘로 나뉜다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      if (k === 2) { card(210, 190, 300, 54, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.3), text: 'VirtualService orders-vs', fs: 14.5, mono: true }); grow(150, 162, 130, 128, E(u, 0.8, 1.1), INFO); grow(270, 162, 290, 128, E(u, 0.8, 1.1), ACC);
        tx(50, 240, 'weight 는 Istio 가, 숫자는 Rollouts 가 쓴다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) }); } }
    // 오른쪽: 가중치 계단 그래프
    const ax = axes(510, 70, 390, 230, { x: [0, 35], y: [0, 100], xt: [0, 5, 15, 30], yt: [0, 10, 50, 100], xl: '분', yl: 'canary 가중치 %', grid: true });
    const upto = k < 3 ? 0 : k === 3 ? lerp(0, 3 / 7, E(u, 0.2, 2.0)) : k === 4 ? lerp(3 / 7, 5 / 7, E(u, 0.8, 1.8)) : k < 8 ? 5 / 7 : lerp(5 / 7, 1, E(u, 0.2, 1.4));
    line(ax, STAIR, upto, ACC, { sw: 3.4 });
    if (k >= 3) { [['pause 5m', 2.5, 1], ['pause 10m', 10, 10]].forEach(([s, x, y]) => mono(ax.X(x), ax.Y(y) - 10, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 1.4) : 1 })); }
    if (k >= 4) { const gx = ax.X(15), gy = ax.Y(30); el('path', { d: `M${gx},${gy - 16} l16,16 l-16,16 l-16,-16 z`, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: k === 4 ? fade(u, 0.3) : 1 });
      mono(gx + 22, gy + 5, 'analysis', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: k === 4 ? fade(u, 0.4) : 1 }); mono(ax.X(22.5), ax.Y(50) - 10, 'pause 15m', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 1.6) : 1 }); }
    mono(900, 52, 'canary 파드 = ceil(10 × w%)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: k >= 3 ? 1 : 0 });
    if (k === 5) { tx(sx, sy + 104, 'image: registry/orders:2.0.0', { 'font-size': 14, 'font-weight': 700, fill: ACC, class: 'mono', opacity: fade(u, 0.4) }); }
    if (k === 6 || k === 7) { // 합격 기준
      const y = 380; tx(510, y - 12, '성공률 (orders-canary)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      if (k === 6) { const x0 = 510, W = 390, sc = (v) => x0 + W * (v - 0.95) / 0.05; el('rect', { x: x0, y, width: W, height: 20, rx: 4, fill: SOFT });
        el('rect', { x: x0, y, width: (sc(0.996) - x0) * E(u, 0.3, 1.2), height: 20, rx: 4, fill: GOOD });
        el('line', { x1: sc(0.99), y1: y - 6, x2: sc(0.99), y2: y + 26, stroke: BAD, 'stroke-width': 2.4 }); mono(sc(0.99) - 6, y + 15, '≥ 0.99', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.0) });
        mono(900, y - 12, '에러 0.4% → 0.996 통과', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.4) });
        mono(50, 200, 'failureLimit 2', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); [0, 1].forEach((i) => box(200 + i * 34, 195, 24, 'empty', { s: pop(u, 2.0 + i * 0.15) })); mono(270, 200, '0 / 2', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); }
      if (k === 7) { const n = 20; for (let i = 0; i < n; i++) { const okk = i !== 13, s = pop(u, 0.2 + i * 0.07); el('circle', { cx: 520 + i * 19, cy: y + 10, r: 6 * s, fill: okk ? GOOD : BAD }); }
        mono(50, 150, 'rate(2xx [2m])', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) }); el('line', { x1: 50, y1: 162, x2: 250, y2: 162, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.3) });
        mono(50, 186, 'rate(전체 [2m])', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); tx(50, 214, 'canary 서비스 요청만 센다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.9) }); } }
    if (k === 8) { mono(ax.X(30) - 6, ax.Y(100) + 22, '100%', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.3) });
      tx(50, 200, '단계마다 통과하면 사람 손 없이 끝까지', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) }); tx(50, 226, '실패하면 그 자리에서 abort', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 2.0) }); } }

  // 4. Feature Flag: 100명 격자에서 켜진 사람
  const GX = 610, GY = 80, CS = 29, ON = (i) => (i * 37) % 100 < 10;   // 결정적으로 10명
  function grid(pct, o) { o = o || {}; const lim = pct / 10;
    for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), cc = i % 10, on = ON(i) && ((i * 37) % 100) < lim * 10 * (o.frac ?? 1);
      el('circle', { cx: GX + cc * CS, cy: GY + r * CS, r: 10, fill: on ? ACC : o.off || OFF, opacity: o.op ?? 1 }); }
    if (o.code) el('rect', { x: GX - 16, y: GY - 16, width: CS * 10 + 3, height: CS * 10 + 3, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '6 4' }); }
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const on = tween(p.flagOn, b.flagOn, u);
    grid(on, { code: k === 6, op: k === 7 ? 0.35 : 1 });
    mono(GX + 135, GY + CS * 10 + 8, `pricing_v2 켜짐 ${Math.round(on)}%`, { 'font-size': 14.5, 'font-weight': 800, fill: on > 0 ? ACC : MUT, 'text-anchor': 'middle', opacity: k === 7 ? 0.35 : 1 });
    const FS = [400, 120];   // 플래그 서버
    if (k <= 4) { card(FS[0], FS[1], 200, 64, { rx: 10, stroke: k === 2 ? BAD : WARN, sw: 2.2, fill: k === 2 ? BADBG : WARNBG, s: k === 0 ? pop(u, 0.3) : 1 });
      tx(FS[0], FS[1] - 4, '플래그 서버', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: k === 2 ? BAD : WARN }); mono(FS[0], FS[1] + 18, 'pricing_v2', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      card(140, 230, 210, 60, { rx: 10, stroke: INK, sw: 2, s: k === 0 ? pop(u, 0.6) : 1 }); mono(140, 226, 'POST /orders', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 }); mono(140, 246, 'api.get_client()', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      grow(245, 215, 300, 150, k === 0 ? E(u, 1.0, 1.4) : 1, WARN, { plain: true, dash: '4 4' }); }
    if (k === 0) tx(40, 340, 'OpenFeature: 벤더를 바꿔 끼울 수 있는 규격', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
    if (k === 1) { for (let r = 0; r < 3; r++) { const st = 0.2 + r * 0.7; dot([[20, 230], [35, 230]], seg(u, st, st + 0.3), INK, 6); dot([[245, 215], [300, 150]], seg(u, st + 0.3, st + 0.6), WARN, 5); }
      clock(80, 340, 20, (t * 0.4) % 1, INFO); tx(112, 346, '배포 때가 아니라 요청마다 묻는다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) }); }
    if (k === 2) { cross(FS[0], FS[1], 18, pop(u, 0.3)); pill(140, 320, 'default_value=False', INFO, pop(u, 0.9), { mono: true, fs: 14 });
      grow(140, 342, 140, 380, E(u, 1.3, 1.7), INFO); mono(140, 400, 'price_engine_v1', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) });
      tx(400, 230, '서버가 죽어도', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); tx(400, 252, '기존 동작 유지', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 3) { el('rect', { x: 40, y: 290, width: 330, height: 110, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.2) });
      ['EvaluationContext(', '  targeting_key=user.id,', '  attributes={country, beta_group})'].forEach((s, i) => mono(52, 318 + i * 26, s, { 'font-size': 13.5, opacity: fade(u, 0.3 + i * 0.25), fill: i === 1 ? ACC : INK }));
      fly(200, 290, FS[0], FS[1] + 32, seg(u, 1.2, 1.9), 'context', {});
      const i = 7; const cx = GX + (i % 10) * CS, cy = GY + Math.floor(i / 10) * CS; el('circle', { cx, cy, r: 15, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 2.0) });
      tx(GX - 20, GY - 30, '같은 id 는 늘 같은 결과 (sticky)', { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 4) { tx(40, 330, 'if use_v2_pricing:', { 'font-size': 14.5, class: 'mono', 'font-weight': 700 });
      mono(60, 356, '→ price_engine_v2', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(60, 382, '→ price_engine_v1 (나머지)', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) }); }
    if (k === 5) { const st = [['0% 배포', '코드만 먼저'], ['사내 100%', '직원 검증'], ['1→10→50→100', '베타 확대'], ['OFF', '사고 시 즉시']];
      st.forEach(([a, b2], i) => { const y = 80 + i * 78, s = pop(u, 0.2 + i * 0.4), last = i === 3;
        card(190, y, 300, 60, { rx: 10, stroke: last ? BAD : ACC, sw: 2, s }); mono(60, y + 5, a, { 'font-size': 15, 'font-weight': 800, fill: last ? BAD : ACC, opacity: s > 0.5 ? 1 : 0 }); tx(320, y + 5, b2, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s > 0.5 ? 1 : 0 });
        if (i < 3) grow(190, y + 31, 190, y + 47, E(u, 0.5 + i * 0.4, 0.7 + i * 0.4), MUT); });
      tx(190, 400, '재배포 0번', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) }); }
    if (k === 6) { tbar(40, 120, 470, 100, { title: '카나리 (인프라): v2 코드에 도달한 트래픽', l: ['v1', INFO], r: ['v2 코드', ACC] });
      tbar(40, 240, 470, on, { title: '플래그 (앱): 새 가격을 보는 사용자', l: ['끔', OFF], r: ['켬', ACC] });
      tx(40, 340, '배포 = 코드 도달, 플래그 = 사용자 노출', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.0) }); }
    if (k === 7) { const lines = ['if flag_a:', '  if flag_b:', '    if flag_c:', '      …', '  else:', 'else:'];
      lines.forEach((s, i) => mono(60, 90 + i * 30, s, { 'font-size': 15, fill: i < 3 ? WARN : MUT, opacity: fade(u, 0.2 + i * 0.25) }));
      tx(60, 300, '정리 안 한 플래그 = if 지옥', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) });
      clock(80, 360, 20, E(u, 1.8, 2.6) * 0.3, BAD); tx(112, 366, '평가 지연도 SLO 항목 · 캐싱', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 2.0) }); } }

  // 5. 자동 롤백 (Flagger)
  function s5(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 6) { tx(480, 46, '상황에 맞는 전략', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['빠른 hotfix', 'Rolling', INFO], ['큰 전환을 한 번에', 'Blue-Green', GOOD], ['위험한 변경', 'Canary + 자동 롤백', ACC], ['사용자별 베타', 'Feature Flag', WARN]].forEach(([a, b2, cc], i) => {
        const y = 100 + i * 72, s = pop(u, 0.2 + i * 0.35); card(270, y, 300, 54, { rx: 10, stroke: GRID, sw: 1.8, s, text: a, fs: 15.5 });
        grow(425, y, 540, y, E(u, 0.5 + i * 0.35, 0.9 + i * 0.35), cc); card(680, y, 260, 54, { rx: 27, stroke: cc, sw: 2.4, s: pop(u, 0.7 + i * 0.35), text: b2, fs: 15.5, color: cc }); });
      tx(480, 400, '같이 쓰면 배포 사고가 사용자에게 닿기 전에 멈춘다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { tx(480, 46, '켜기 전에 볼 것', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      // 짧은 창: 들쭉날쭉
      zone(40, 80, 280, 260, '창이 짧으면 오탐', { fill: SOFT }); const pts = []; for (let i = 0; i <= 14; i++) pts.push([60 + i * 17, 200 + (i % 2 ? -1 : 1) * (18 + (i % 3) * 9)]);
      el('polyline', { points: pts.slice(0, 1 + Math.round(14 * E(u, 0.2, 1.0))).map((q) => q.join(',')).join(' '), fill: 'none', stroke: WARN, 'stroke-width': 2.4 });
      el('line', { x1: 56, y1: 210, x2: 304, y2: 210, stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '4 3' });
      zone(340, 80, 280, 260, 'KPI 가 없으면 미탐', { fill: SOFT }); mono(360, 150, 'HTTP 200', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.8) }); mono(360, 200, '결제 실패', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.1) });
      tx(360, 250, '성공률만 보면 통과', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) });
      zone(640, 80, 280, 260, '롤백도 SLO', { fill: SOFT }); clock(780, 190, 44, E(u, 1.5, 2.4), GOOD, '1분 안에'); return; }
    // 시간축 (분)
    const ax = axes(110, 70, 520, 220, { x: [0, 6], y: [95, 100], xt: [0, 1, 2, 3, 4, 5, 6], yt: [95, 97, 99, 100], xl: '분', yl: '요청 성공률 %', grid: true });
    if (k === 0) { card(370, 180, 380, 150, { rx: 14, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 0.3) }); tx(200, 130, 'kind: Canary (Flagger)', { 'font-size': 15, 'font-weight': 800, fill: ACC, class: 'mono', opacity: fade(u, 0.5) });
      card(370, 200, 260, 60, { rx: 10, stroke: INK, sw: 2, fill: PANEL, s: pop(u, 0.9), text: 'Deployment orders', fs: 15, mono: true }); tx(370, 280, 'targetRef 로 감싼다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) }); }
    // 실패 칸 5개
    const fails = k === 4 ? Math.floor(clamp((u - 0.3) / 0.4, 0, 5)) : 0;
    if (k >= 1) { tx(680, 90, 'threshold 5', { 'font-size': 14, 'font-weight': 700 }); for (let i = 0; i < 5; i++) box(700 + i * 44, 128, 34, i < fails ? 'bad' : 'empty', { s: k === 1 ? pop(u, 0.3 + i * 0.1) : 1, text: i < fails ? String(i + 1) : '' });
      mono(680, 186, 'interval 1m · stepWeight 10', { 'font-size': 13.5, fill: MUT }); }
    // 가중치
    const w = tween(p.v2Traffic, b.v2Traffic, u, 1);
    if (k >= 1) { tx(680, 236, 'canary 가중치', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); el('rect', { x: 680, y: 248, width: 230, height: 22, rx: 4, fill: SOFT });
      el('rect', { x: 680, y: 248, width: Math.max(2, 230 * (k === 4 ? (fails >= 5 ? lerp(0.1, 0, E(u, 2.3, 2.7)) : 0.1) : w / 100)), height: 22, rx: 4, fill: ACC });
      mono(910, 290, (k === 4 && fails >= 5 ? Math.round(lerp(10, 0, E(u, 2.3, 2.7))) : Math.round(w)) + '%', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' }); }
    if (k >= 2) { el('line', { x1: ax.X(0), y1: ax.Y(99), x2: ax.X(6), y2: ax.Y(99), stroke: BAD, 'stroke-width': 2.2, opacity: k === 2 ? fade(u, 0.3) : 1 });
      mono(ax.X(6) - 4, ax.Y(99) - 8, 'min 99', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'end' }); }
    if (k === 2 || k === 3) line(ax, [[0, 99.6], [1, 99.6], [2, 99.7], [3, 99.6], [4, 99.6], [5, 99.7], [6, 99.6]], k === 2 ? E(u, 0.6, 2.0) : 1, GOOD);
    if (k === 3) { [['request-duration', 'P99 ≤ 500ms'], ['payment-success-rate', '≥ 95%']].forEach(([a, b2], i) => { const y = 340 + i * 36, s = pop(u, 0.4 + i * 0.4);
        pill(110 + tw(a, 13.5) / 2 + 13, y, a, INFO, s, { mono: true, fs: 13.5 }); mono(330, y + 5, b2, { 'font-size': 14, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 }); });
      tx(480, 360, 'HTTP 200 이어도', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); tx(480, 384, '돈이 안 들어오면 실패', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.5) }); }
    if (k === 4) { line(ax, [[0, 99.6], [0.5, 97.2], [1, 97], [2, 97], [3, 97], [4, 97], [5, 97]], E(u, 0.1, 2.3), BAD);
      mono(ax.X(5), ax.Y(97) + 22, '97% (에러 3%)', { 'font-size': 14, fill: BAD, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      card(800, 370, 200, 44, { rx: 10, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 2.5), text: 'Slack 알림 · 롤백', fs: 14.5, color: WARN });
      tx(110, 370, '5분 동안 10% 사용자만 영향', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.4) }); }

  }

  const quiz = [
    { q: 'replicas 8, maxSurge 2, maxUnavailable 1인 롤링 업데이트에서 준비된 파드 수의 하한은 몇 개인가?',
      o: ['6개', '7개', '10개'], a: 1,
      why: '8 - maxUnavailable 1 = 7이다. 새 파드가 준비되는 만큼만 v1을 줄이므로 준비된 파드는 7개 아래로 내려가지 않는다.' },
    { q: 'Blue-Green에서 문제가 난 v2를 즉시 되돌리는 방법은 무엇인가?',
      o: ['Service selector를 color: blue로 다시 patch한다', 'green Deployment 이미지를 1.0.0으로 다시 빌드한다', 'green 파드를 하나씩 지운다'], a: 0,
      why: 'blue 8대가 그대로 떠 있으므로 selector 한 줄만 되돌리면 트래픽이 즉시 v1으로 돌아간다.' },
    { q: 'canary_argo.yaml에서 10% 단계를 지나 50%로 올라가려면 무엇이 통과해야 하나?',
      o: ['analysis의 성공률 0.99 이상 조건', '사람의 승인 버튼', 'canary 파드 10개 준비'], a: 0,
      why: 'steps에 analysis가 들어 있어 Prometheus로 잰 2xx 비율이 0.99 이상이어야 setWeight 50으로 넘어간다.' },
    { q: '플래그 서버가 응답하지 않을 때 create_order는 어떻게 동작하나?',
      o: ['요청이 500 에러로 실패한다', 'default_value=False라 v1 가격 엔진을 쓴다', '모든 사용자에게 v2 가격을 적용한다'], a: 1,
      why: '평가에 실패하면 기본값 False가 돌아온다. 그래서 플래그 서버 장애가 주문 장애로 번지지 않는다.' },
    { q: 'Flagger 설정(interval 1m, threshold 5)에서 성공률이 계속 97%라면 언제 롤백되나?',
      o: ['첫 실패 직후', '가중치가 100%가 된 뒤', '실패가 5번 쌓인 약 5분 뒤'], a: 2,
      why: '1분마다 검사해 99% 미만이면 실패를 하나 센다. 5번째 실패에서 weight가 0으로 돌아간다.' },
  ];

  const summary = [
    '롤링 업데이트는 준비된 파드를 7개 이상 지키며 바꾸지만, 그동안 v1과 v2가 함께 응답한다.',
    'Blue-Green은 파드를 16개로 늘리는 대신 selector 한 줄로 전환하고 되돌린다.',
    '카나리는 1%, 10%, 50%, 100%로 올리며 성공률 0.99 같은 숫자 기준으로 다음 단계를 연다.',
    '플래그는 배포와 노출을 떼고, Flagger는 실패가 5번 쌓이면 가중치를 0으로 돌린다.',
  ];
  const review = [
    { q: 'API 응답 필드 이름을 바꾸는 배포를 롤링으로 했더니 일부 요청만 5xx가 났다. 먼저 의심할 것은?',
      o: ['v1과 v2가 함께 트래픽을 받는 공존 구간의 호환성', 'maxSurge가 너무 작은 것', 'Ingress의 TLS 설정'], a: 0,
      why: '롤링은 교체가 끝날 때까지 두 버전이 같이 응답한다. 서로 맞지 않는 응답이 섞이면 일부 사용자만 실패를 본다.' },
    { q: '카나리 성공률은 99.6%로 통과했는데 결제 매출이 줄었다. 무엇이 빠졌나?',
      o: ['pause 시간', '결제 성공률 같은 비즈니스 KPI 지표', 'stable 서비스'], a: 1,
      why: 'HTTP 200이어도 결제가 실패할 수 있다. auto_rollback.yaml처럼 payment-success-rate 95% 같은 지표를 함께 걸어야 잡힌다.' },
    { q: '새 가격 엔진을 재배포 없이 사내 직원에게만 먼저 보여 주고 싶다. 알맞은 도구는?',
      o: ['Blue-Green 전환', 'maxUnavailable 조정', 'targeting_key와 속성으로 켜는 Feature Flag'], a: 2,
      why: '카나리는 트래픽 비율로 나누고, 플래그는 사용자 문맥으로 나눈다. 특정 사용자 집단만 켜는 일은 플래그가 맡는다.' },
  ];

  R.page({ title: 'orders v1 → v2 바꾸기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
