/* IV-1-2 CircuitBreaker 상태 전이 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 창 계산은 Resilience4j 규칙(COUNT_BASED, 최소 호출 수, 임계치 "이상"이면 OPEN, OPEN 동안 집계 안 함,
 * HALF_OPEN은 시험 호출을 다 채운 뒤 판정)을 그대로 따른다. beat 데이터 calls/fails와 같은 값이 나온다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 호출 결과 순서 (1 = 성공, 0 = 실패). 앞 18건은 Step 2, 뒤 7건은 payment 장애로 전부 실패
  const SEQ = [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const WIN = 20, MIN = 10, THR = 50;
  const windowAt = (n) => SEQ.slice(Math.max(0, n - WIN), n);              // n 번째 호출까지 본 창
  const rateOf = (w) => (w.length < MIN ? null : (100 * w.filter((x) => !x).length) / w.length);
  const pct = (v) => (v == null ? '—' : (Math.round(v * 10) / 10).toFixed(1) + '%');

  // ---------- 공통 부품 ----------
  const ST = { CLOSED: GOOD, OPEN: BAD, HALF_OPEN: WARN };
  // 작은 상태 머신 (세 동그라미). on = 지금 상태
  function fsm(x, y, on, o) { o = o || {}; const s = o.s ?? 1, P = { CLOSED: [x, y], OPEN: [x + 190 * s, y], HALF_OPEN: [x + 95 * s, y + 92 * s] }, r = 34 * s;
    const edge = (a, b, col, lab, bend) => { const [x1, y1] = P[a], [x2, y2] = P[b], mx = (x1 + x2) / 2 + (bend || [0, 0])[0], my = (y1 + y2) / 2 + (bend || [0, 0])[1];
      el('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, fill: 'none', stroke: col || GRID, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      const anc = a === 'OPEN' ? 'start' : a === 'HALF_OPEN' ? 'end' : 'middle', dx = anc === 'start' ? 8 : anc === 'end' ? -8 : 0;
      if (lab) tx(mx + dx, my + (bend && bend[1] < 0 ? -2 : 14), lab, { 'font-size': 13.5, fill: MUT, 'text-anchor': anc, 'font-weight': 600 }); };
    edge('CLOSED', 'OPEN', on === 'OPEN' ? BAD : null, o.labels ? '실패율 ≥ 50%' : null, [0, -42 * s]);
    edge('OPEN', 'HALF_OPEN', on === 'HALF_OPEN' ? WARN : null, o.labels ? o.waitLab || 'wait 10s' : null, [40 * s, 10 * s]);
    edge('HALF_OPEN', 'CLOSED', o.back ? GOOD : null, o.labels ? '시험 통과' : null, [-40 * s, 10 * s]);
    Object.keys(P).forEach((k) => { const [cx, cy] = P[k], hot = k === on;
      el('circle', { cx, cy, r: hot ? r + 3 * bumpy(o.t) : r, fill: hot ? ST[k] : PANEL, stroke: ST[k], 'stroke-width': hot ? 3 : 2 });
      tx(cx, cy + 5, k === 'HALF_OPEN' ? 'HALF' : k, { 'font-size': k === 'HALF_OPEN' ? 14 : 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? PANEL : ST[k], class: 'mono' }); }); }
  const bumpy = (t) => (t == null ? 0 : (Math.sin(t * 4) + 1) / 2);
  // 회로 스위치: x1→x2 선 위 레버. openU 0(닫힘)→1(열림)
  function breaker(x1, x2, y, openU, col) { const mx = (x1 + x2) / 2, a = lerp(0, -38, openU) * Math.PI / 180;
    el('line', { x1, y1: y, x2: mx - 26, y2: y, stroke: col || INK, 'stroke-width': 3 }); el('line', { x1: mx + 26, y1: y, x2, y2: y, stroke: col || INK, 'stroke-width': 3 });
    el('circle', { cx: mx - 26, cy: y, r: 5, fill: col || INK }); el('circle', { cx: mx + 26, cy: y, r: 5, fill: col || INK });
    el('line', { x1: mx - 26, y1: y, x2: mx - 26 + 52 * Math.cos(a), y2: y + 52 * Math.sin(a), stroke: col || INK, 'stroke-width': 4, 'stroke-linecap': 'round' }); }
  // 창 칸 20개: vals는 0/1 배열(왼쪽부터 오래된 것). o.shift 0→1 이면 왼쪽으로 밀려 나감
  function windowRow(x, y, vals, o) { o = o || {}; const w = 36, g = 5, shown = o.shown ?? vals.length;
    for (let i = 0; i < WIN; i++) el('rect', { x: x + i * (w + g), y, width: w, height: 36, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' });
    vals.forEach((v, i) => { const s = clamp(shown - i); if (s <= 0) return; const cx = x + i * (w + g) + w / 2 - (o.slide || 0) * (w + g);
      if (cx < x) return;
      el('rect', { x: cx - w / 2, y: y + (1 - s) * -18, width: w, height: 36, rx: 6, fill: v ? GOODBG : BADBG, stroke: v ? GOOD : BAD, 'stroke-width': 2, opacity: s });
      if (v) check(cx, y + 18, 7, s); else cross(cx, y + 18, 7, s); });
    if (o.min) { const mx = x + MIN * (w + g) - g / 2; el('line', { x1: mx, y1: y - 12, x2: mx, y2: y + 48, stroke: INFO, 'stroke-width': 2.5, opacity: o.min });
      tx(mx, y + 66, 'minimum 10', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: o.min }); }
    tx(x, y - 14, o.title || 'sliding window · 최근 20건 (COUNT_BASED)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); }
  // 실패율 막대 + 50% 선
  function rateBar(x, y, w, v, o) { o = o || {}; const h = 26;
    el('rect', { x, y, width: w, height: h, rx: 5, fill: SOFT });
    if (v != null) el('rect', { x, y, width: Math.max(2, w * v / 100), height: h, rx: 5, fill: v >= THR ? BAD : v > 30 ? WARN : GOOD });
    const tx50 = x + w * THR / 100; el('line', { x1: tx50, y1: y - 8, x2: tx50, y2: y + h + 8, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 3', opacity: o.thr ?? 1 });
    tx(tx50, y - 13, 'threshold 50%', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: o.thr ?? 1 });
    tx(x - 12, y + 18, o.name || '실패율', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
    mono(x + w + 12, y + 19, o.text ?? pct(v), { 'font-size': 18, 'font-weight': 800, fill: v != null && v >= THR ? BAD : INK }); }

  // ---------- 1. 폭포 장애 ----------
  const SV = { g: 130, o: 450, p: 800, y: 92 };
  function chain(o) { o = o || {};
    [['Gateway', SV.g, o.gBad], ['order-service', SV.o, o.oBad], ['payment-service', SV.p, o.pSlow]].forEach(([n, x, bad], i) => {
      card(x, SV.y, 170, 52, { rx: 10, text: n, fs: 15, fw: 800, stroke: bad ? BAD : INK, fill: bad ? BADBG : PANEL, color: bad ? BAD : INK, s: o.pop ? o.pop(i) : 1 }); });
    if (!o.noLink) { grow(SV.g + 86, SV.y, SV.o - 86, SV.y, o.grow ?? 1, o.gBad ? BAD : MUT); grow(SV.o + 86, SV.y, SV.p - 86, SV.y, o.grow ?? 1, o.oBad ? BAD : MUT); } }
  function pool(x, y, used, o) { o = o || {}; const cols = 25, cs = 15, n = 200;
    for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), q = i % cols, on = i < used;
      el('rect', { x: x + q * cs, y: y + r * cs, width: cs - 3, height: cs - 3, rx: 2, fill: on ? (o.col || BAD) : SOFT, opacity: on ? 0.85 : 1 }); }
    tx(x, y - 12, o.title || 'order 톰캣 워커 스레드 200', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    mono(x + cols * cs, y - 12, `${Math.round(used)} / 200`, { 'font-size': 15, 'font-weight': 800, fill: used >= 200 ? BAD : INK, 'text-anchor': 'end' }); }
  function s1(t, c) { const { k, u } = c;
    chain({ pop: k === 0 ? (i) => pop(u, 0.2 + i * 0.3) : null, grow: k === 0 ? E(u, 0.9, 1.6) : 1, pSlow: k >= 1, oBad: k === 2, gBad: k === 2 && u > 1.4 });
    const px = 290, py = 196;
    if (k === 0) { for (let i = 0; i < 2; i++) { dot([[SV.g + 86, SV.y], [SV.o - 86, SV.y]], (t * 0.7 + i / 2) % 1, GOOD, 6); dot([[SV.o + 86, SV.y], [SV.p - 86, SV.y]], (t * 0.7 + i / 2 + 0.25) % 1, GOOD, 6); }
      pill(SV.p, SV.y + 52, '정상 50ms', GOOD, pop(u, 1.4), { fs: 13.5 });
      pool(px, py, tween(0, 12, u), { col: INK }); pill(SV.o, SV.y - 50, 'max 200 · timeout 30s', INK, pop(u, 1.8), { mono: true, fs: 13.5 }); return; }
    if (k === 1) { clock(SV.p + 112, SV.y - 4, 18, E(u, 0.2, 2.6), WARN); mono(SV.p, SV.y + 54, '응답 30초', { 'font-size': 15, fill: WARN, 'font-weight': 800, 'text-anchor': 'middle' });
      pool(px, py, Math.round(lerp(12, 200, E(u, 0.3, 2.2))));
      const need = E(u, 1.0, 2.4); tx(px, 372, '초당 100건 × 30초 = 3000개 필요', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      el('rect', { x: px, y: 384, width: 375 * need, height: 14, rx: 3, fill: BAD, opacity: 0.25 * fade(u, 1.0) });
      el('rect', { x: px, y: 384, width: 375 * (200 / 3000), height: 14, rx: 3, fill: INK, opacity: fade(u, 1.0) });
      mono(px + 25 + 4, 410, '200', { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 1.0), 'text-anchor': 'middle' }); mono(px + 375 * need, 410, String(Math.round(3000 * need)), { 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0), 'text-anchor': 'end' });
      return; }
    if (k === 2) { pool(px, py, 200); cross(SV.o + 70, SV.y - 22, 10, pop(u, 0.4));
      for (let i = 0; i < 3; i++) dot([[SV.o - 86, SV.y + 4], [SV.g + 86, SV.y + 4]], seg(u, 0.6 + i * 0.25, 1.4 + i * 0.25), BAD, 6);
      cross(SV.g + 70, SV.y - 22, 10, pop(u, 1.5)); sub(SV.g, SV.y + 52, 'Gateway 스레드도 고갈', fade(u, 1.6), { fill: BAD, 'font-weight': 700, 'font-size': 14 });
      sub(SV.o, SV.y + 52, '새 요청을 못 받음', fade(u, 0.5), { fill: BAD, 'font-weight': 700, 'font-size': 14 }); return; }
    // k3: 빠른 실패
    const fall = E(u, 0.2, 0.9); pool(px, py, Math.round(lerp(200, 14, E(u, 1.2, 2.4))), { col: fall > 0.5 && u > 1.2 ? INK : BAD });
    card(SV.o + 175, SV.y - 70 + 70 * fall, 132, 34, { rx: 17, text: 'CircuitBreaker', fs: 14, fill: ACC, stroke: 'none', color: PANEL, op: fade(u, 0.1) });
    for (let i = 0; i < 3; i++) { const v = seg(u, 1.0 + i * 0.35, 1.6 + i * 0.35); dot([[SV.o + 86, SV.y + 2], [SV.o + 150, SV.y + 2], [SV.o + 86, SV.y + 14]], v, ACC, 6); }
    pill(SV.p, SV.y + 54, '실패율 100% · 전부 타임아웃', BAD, pop(u, 0.5), { fs: 13.5 });
    sub(SV.o + 120, SV.y + 62, '기다리지 않고 즉시 실패', fade(u, 1.4), { fill: ACC, 'font-weight': 700, 'font-size': 14 }); }

  // ---------- 2. CLOSED: 창에 결과를 쌓는다 ----------
  const WX = 66, WY = 70;
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {}, n = b.calls ?? 0, n0 = k === 0 ? 0 : p.calls ?? 0;
    const shown = lerp(n0, n, E(u, 0.2, 1.6)), w = windowAt(n);
    windowRow(WX, WY, w, { shown, min: k >= 1 ? (k === 1 ? fade(u, 1.4) : 1) : 0 });
    tx(WX + 30, 38, '', {});
    pill(WX + 70, 26, 'paymentService', ACC, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5 });
    fsm(720, 220, 'CLOSED', { labels: k >= 3, s: 0.85, t });
    const r = rateOf(w), rDraw = n < MIN ? null : tween(rateOf(windowAt(n0)) ?? r, r, u);
    if (k === 0) { sub(WX + 400, WY + 76, '아직 호출 0건 · 창이 비어 있다', fade(u, 0.8), { 'font-size': 15 }); return; }
    rateBar(150, 196, 360, k === 1 ? null : rDraw, { thr: k >= 2 ? (k === 2 ? fade(u, 0.6) : 1) : 0, text: n < MIN ? `판정 전 ${n}/10` : null });
    if (k >= 2) { rateBar(150, 278, 360, 0, { name: 'slow율', thr: 0, text: '≥ 80%' }); sub(330, 328, '2초 넘게 걸린 호출의 비율', k === 2 ? fade(u, 1.2) : 1, { 'font-size': 14 }); }
    if (k === 2) { el('rect', { x: 150 + 360 * 0.8 - 1, y: 272, width: 3, height: 38, fill: BAD, opacity: fade(u, 1.2) }); }
    if (k === 1) sub(330, 262, '10건이 모이기 전에는 실패율을 계산하지 않는다', fade(u, 1.6), { 'font-size': 15, fill: INFO, 'font-weight': 700 });
    if (k === 3) sub(720 + 81, 384, 'OPEN 10초 뒤 시험 호출 3건', fade(u, 1.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    if (k === 4) { const ok = u > 1.4; mono(330, 368, `${pct(r)} < 50% → 통과`, { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      dot([[60, 398], [600, 398]], seg(u, 1.6, 2.6), GOOD, 7); if (ok) check(620, 398, 9, pop(u, 2.4)); } }

  // ---------- 3. OPEN: 창이 미끄러져 50%에 닿는다 ----------
  function s3(t, c) { const { k, u } = c;
    const slideN = k === 0 ? Math.round(lerp(18, 25, E(u, 0.2, 1.6))) : 25, w = windowAt(slideN), r = rateOf(w);
    const flip = k === 0 ? E(u, 1.7, 2.3) : 1;
    windowRow(WX, WY, w, {});
    if (k === 0) { rateBar(150, 150, 360, r, {}); fsm(720, 200, flip > 0.5 ? 'OPEN' : 'CLOSED', { s: 0.9, labels: true, t });
      mono(WX, 140 + 92, `@CircuitBreaker(name = "paymentService")`, { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4) });
      if (flip > 0.5) banner(330, 300, `실패 ${w.filter((x) => !x).length} / ${w.length} = 50% → OPEN`, pop(u, 1.9));
      return; }
    // k ≥ 1: 회로가 열린 길
    const y = 250, ox = 120, px = 840; breaker(ox + 70, px - 80, y, 1, BAD);
    card(ox, y, 140, 50, { rx: 10, text: 'order', fs: 15, fw: 800 }); card(px, y, 140, 50, { rx: 10, text: 'payment', fs: 15, fw: 800, stroke: k >= 3 ? OFF : INK, color: k >= 3 ? OFF : INK });
    rateBar(150, 150, 360, 50, { text: k >= 3 ? '50.0% (멈춤)' : null });
    if (k === 1) { const s = pop(u, 0.2), s2_ = pop(u, 0.8);
      card(300, 340, 330, 40, { rx: 8, text: 'PayResult pay(PayRequest req)', fs: 14.5, mono: true, s, fill: SOFT, stroke: GRID });
      card(690, 340, 400, 40, { rx: 8, text: 'PayResult payFallback(PayRequest req, Throwable t)', fs: 14, mono: true, s: s2_, fill: ACCBG, stroke: ACC });
      tx(690, 392, '+ 마지막에 Throwable 하나', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); return; }
    // 요청이 스위치 앞에서 바로 돌아간다
    for (let i = 0; i < 3; i++) { const v = seg(u, 0.2 + i * 0.5, 1.1 + i * 0.5); dot([[ox + 70, y - 6], [ox + 230, y - 6], [ox + 230, y + 40], [ox + 70, y + 40]], v, ACC, 7); }
    pill(ox + 260, y + 76, 'PayResult.pending', ACC, pop(u, 0.6), { mono: true, fs: 13.5 });
    if (k === 2) { tx(px - 150, y - 46, '30초 대기', { 'font-size': 15, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      el('line', { x1: px - 196, y1: y - 51, x2: lerp(px - 196, px - 104, E(u, 0.8, 1.3)), y2: y - 51, stroke: BAD, 'stroke-width': 3 });
      sub(ox + 260, y + 112, '본문을 실행하지 않고 곧바로 fallback', fade(u, 1.5), { 'font-size': 15, fill: INK }); return; }
    mono(px, y + 54, '호출 0건', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
    sub(560, y + 112, 'OPEN 동안 거절된 호출은 창에 들어가지 않는다 · 실패율은 그대로', fade(u, 1.2), { 'font-size': 15, fill: INK }); }

  // ---------- 4. HALF_OPEN: 시험 호출 3건 ----------
  function s4(t, c) { const { k, u } = c, b = c.beat, tr = b.trial || [];
    const state = k === 0 ? 'OPEN' : k === 3 && u > 1.8 ? 'CLOSED' : 'HALF_OPEN';
    fsm(80, 90, state, { s: 0.85, labels: true, t, back: k === 3 && u > 1.8, waitLab: 'wait 10s 뒤 첫 호출' });
    // 시계
    const cf = k === 0 ? E(u, 0.3, 2.6) * 0.8 : 1; clock(120, 330, 34, cf, BAD); mono(120, 392, k === 0 ? `${(cf * 10).toFixed(1)}s / 10s` : '10s 경과', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700 });
    if (k === 0) { mono(320, 330, 'registry.circuitBreaker("paymentService")', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4) });
      sub(560, 370, '이름으로 yml의 그 서킷을 꺼낸다', fade(u, 1.2), { 'font-size': 15 }); }
    // 로그 창
    const logs = [['[CB] paymentService : CLOSED -> OPEN', 'var(--term)']];
    if (k >= 1) logs.push(['[CB] paymentService : OPEN -> HALF_OPEN', '#fbbf24']);
    if (k === 3 && u > 1.8) logs.push(['[CB] paymentService : HALF_OPEN -> CLOSED', '#4ade80']);
    terminal(450, 40, 480, 130, logs, k === 1 ? 1 + E(u, 0.6, 1.6) : logs.length, { title: 'log.warn', fs: 14 });
    if (k === 0) return;
    if (k === 1) { dot([[260, 260], [420, 260]], seg(u, 0.1, 0.6), INK, 7); sub(690, 204, '기본값: 10초가 지난 뒤 들어온 첫 호출이 전이를 일으킨다', fade(u, 1.0), { 'font-size': 14.5, fill: INK }); }
    // 시험 칸 3개
    const X0 = 450, Y0 = 240; tx(X0, Y0 - 12, 'HALF_OPEN 시험 호출 3건', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    for (let i = 0; i < 3; i++) { const x = X0 + i * 64, v = tr[i], s = v == null ? 0 : k >= 2 && (c.prev && c.prev.trial && c.prev.trial[i] != null) ? 1 : pop(u, 0.3 + i * 0.5);
      el('rect', { x, y: Y0, width: 54, height: 54, rx: 8, fill: PANEL, stroke: GRID, 'stroke-dasharray': '4 3', 'stroke-width': 1.5 });
      if (v != null && s > 0) { el('rect', { x, y: Y0, width: 54, height: 54, rx: 8, fill: v ? GOODBG : BADBG, stroke: v ? GOOD : BAD, 'stroke-width': 2, opacity: s }); (v ? check : cross)(x + 27, Y0 + 27, 11, s); } }
    if (k === 2) { const j = ['{ "paymentService": {', '    "state": "HALF_OPEN",', '    "bufferedCalls": 2 } }'];
      j.forEach((ln, i) => mono(670, Y0 + 14 + i * 22, ln, { 'font-size': 14, fill: i === 1 ? WARN : INK, 'font-weight': i === 1 ? 800 : 500, opacity: fade(u, 0.8 + i * 0.2) }));
      tx(X0, Y0 + 92, '2 / 3 · 3건을 다 채우기 전에는 판정하지 않는다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) }); }
    if (k === 3) { mono(X0, Y0 + 92, '실패 1 / 3 = 33.3% < 50%', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
      sub(X0 + 230, Y0 + 130, '50% 이상이었다면 다시 OPEN으로 돌아가 10초를 기다린다', fade(u, 2.0), { 'font-size': 14 }); } }

  // ---------- 5. 상태 머신 한 바퀴 + Gateway 필터 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const y = 170, xs = [90, 300, 520, 790];
      [['요청', '/api/payments/1'], ['predicate', 'Path=/api/payments/**'], ['filter', 'CircuitBreaker · paymentCb'], ['uri', 'payment-service']].forEach(([a, b2], i) => {
        const s = pop(u, 0.2 + i * 0.3); card(xs[i], y, i === 2 ? 220 : 190, 64, { rx: 10, text: a + '\n' + b2, fs: 14, mono: i > 0, s, stroke: i === 2 ? ACC : INK, color: i === 2 ? ACC : INK, fill: i === 2 ? ACCBG : PANEL });
        if (i) grow(xs[i - 1] + (i === 3 ? 112 : 96), y, xs[i] - (i === 2 ? 112 : 96), y, E(u, 0.4 + i * 0.3, 0.8 + i * 0.3), MUT); });
      grow(520, y + 34, 520, y + 120, E(u, 1.6, 2.0), ACC); pill(520, y + 140, 'fallbackUri: forward:/fallback/payment', ACC, pop(u, 2.0), { mono: true, fs: 13.5 });
      sub(480, 60, '서비스 코드를 고치지 않고 라우트에 필터 한 줄', fade(u, 0.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const items = [['sliding-window-size', '20'], ['minimum-number-of-calls', '10'], ['failure-rate-threshold', '50'], ['slow-call-rate-threshold', '80'], ['slow-call-duration-threshold', '2s'], ['wait-duration-in-open-state', '10s'], ['permitted-…-half-open-state', '3']];
      items.forEach(([key, v], i) => { const col = i % 2, row = Math.floor(i / 2), x = 70 + col * 420, y = 60 + row * 82, s = pop(u, 0.2 + i * 0.2);
        card(x + 180, y + 24, 380, 62, { rx: 10, stroke: GRID, sw: 1.5, s }); mono(x + 6, y + 30, key, { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.2) });
        mono(x + 356, y + 32, v, { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.2) }); });
      sub(700, 395, '시작값일 뿐, 트래픽을 보고 조정한다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 2) { tx(480, 46, 'record-exceptions에 있는 것만 실패로 센다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
      zone(110, 240, 320, 150, '실패로 집계', { fill: BADBG, color: BAD }); zone(530, 240, 320, 150, '집계하지 않음 (성공으로 기록)', { fill: SOFT });
      [['IOException', 270, BAD], ['TimeoutException', 270, BAD], ['400 Bad Request', 690, MUT]].forEach(([n, tx_, col], i) => {
        const v = E(u, 0.3 + i * 0.5, 1.1 + i * 0.5), x0 = 280 + i * 200; card(lerp(x0, tx_, v), lerp(110, 300 + (i === 1 ? 46 : 0), v), tw(n, 14) + 30, 34, { rx: 17, text: n, fs: 14, mono: true, stroke: col, color: col, fill: PANEL }); });
      sub(690, 372, '멀쩡한 payment의 회로가 열리지 않게', fade(u, 2.0), { 'font-size': 14 }); return; }
    // k3: 한 바퀴
    fsm(250, 120, null, { s: 1.6, labels: true });
    const P = [[250, 120], [554, 120], [402, 267]], f = (t * 0.45) % 1, seg3 = Math.floor(f * 3), ff = f * 3 - seg3, a = P[seg3], bb = P[(seg3 + 1) % 3];
    el('circle', { cx: lerp(a[0], bb[0], ff), cy: lerp(a[1], bb[1], ff) - Math.sin(ff * Math.PI) * (seg3 === 0 ? 60 : 16), r: 9, fill: ACC });
    [['CLOSED', '통과 + 집계', GOOD], ['OPEN', '차단 + fallback', BAD], ['HALF_OPEN', '시험 3건', WARN]].forEach(([n, d, col], i) => {
      const y = 110 + i * 70, s = pop(u, 0.3 + i * 0.35); card(800, y, 220, 52, { rx: 10, stroke: col, sw: 2, s }); mono(708, y + 5, n, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.35) }); tx(892, y + 5, d, { 'font-size': 14, 'text-anchor': 'end', opacity: fade(u, 0.4 + i * 0.35) }); }); }

  const quiz = [
    { q: '결제 서비스가 응답 없이 30초씩 붙잡을 때 주문 서비스가 먼저 무너지는 이유는 무엇인가?',
      o: ['결제 서비스가 주문 서비스의 DB를 같이 쓰기 때문이다', '초당 100건이 30초씩 기다리면 3000개 스레드가 필요한데 풀은 200개뿐이기 때문이다', 'Gateway가 주문 서비스로 가는 요청을 막기 때문이다'], a: 1,
      why: '기다리는 동안 스레드는 반환되지 않는다. 100 × 30 = 3000개가 필요한데 200개가 다 차면 멀쩡한 요청도 받을 수 없다.' },
    { q: '창 크기 20, minimum-number-of-calls 10인 서킷에서 처음 8건 중 1건이 실패했다. 지금 서킷은 어떤 상태인가?',
      o: ['CLOSED, 아직 실패율을 계산하지 않는다', 'OPEN, 실패가 한 번 나왔다', 'HALF_OPEN, 판정할 건수가 모자라다'], a: 0,
      why: '기록된 호출이 10건보다 적으면 실패율을 계산하지 않으므로 9건이 다 실패해도 열리지 않는다. 8건이면 계속 CLOSED로 통과시킨다.' },
    { q: 'OPEN 상태에서 pay()를 부르면 무슨 일이 일어나는가?',
      o: ['본문을 실행해 보고 실패하면 fallback으로 간다', '30초 타임아웃까지 기다린 뒤 실패한다', '본문을 실행하지 않고 곧바로 fallback이 응답한다'], a: 2,
      why: 'OPEN이면 CallNotPermittedException으로 즉시 거절되고 payFallback이 PENDING을 돌려준다. payment에는 호출이 0건 간다.' },
    { q: 'HALF_OPEN에서 시험 호출 3건 중 1건이 실패했다. 다음 상태는 무엇인가?',
      o: ['OPEN, 실패가 하나라도 있으면 다시 연다', 'CLOSED, 실패율 33.3%가 임계치 50%보다 낮다', 'HALF_OPEN, 시험을 3건 더 한다'], a: 1,
      why: '시험 3건을 다 채운 뒤 실패율로 판정한다. 1/3 = 33.3%는 50% 미만이라 CLOSED로 돌아간다.' },
    { q: 'record-exceptions에 IOException과 TimeoutException만 적었다. 다운스트림이 400을 돌려주면 서킷은 그 호출을 어떻게 세는가?',
      o: ['실패로 센다', '실패로 세지 않는다', '서킷을 즉시 OPEN으로 바꾼다'], a: 1,
      why: '목록에 없는 예외는 실패로 집계하지 않는다. 잘못된 요청 때문에 멀쩡한 서비스의 회로가 열리는 일을 막는다.' },
  ];

  const summary = [
    '느린 다운스트림을 30초씩 기다리면 스레드 200개가 금방 차고 장애가 위로 번진다.',
    'CLOSED에서는 최근 20건의 성공과 실패를 쌓고, 10건이 모여야 실패율을 계산한다.',
    '실패율이 50% 이상이 되면 OPEN이 되어 본문 없이 곧바로 fallback이 응답한다.',
    '10초 뒤 시험 호출 3건의 실패율이 50% 미만이면 CLOSED로, 아니면 다시 OPEN으로 간다.',
  ];
  const review = [
    { q: '서킷을 붙였는데 장애 중에도 한참 동안 OPEN이 되지 않았다. 설정을 보니 TIME_BASED 창의 minimum-number-of-calls가 실제 트래픽보다 훨씬 컸다. 먼저 의심할 것은?',
      o: ['최소 호출 수를 채우지 못해 실패율을 아예 계산하지 않았다', 'failure-rate-threshold가 50이라 너무 낮았다', 'fallbackMethod 시그니처가 틀렸다'], a: 0,
      why: '기록된 호출이 최소 호출 수보다 적으면 실패율이 계산되지 않아 CLOSED가 유지된다. 트래픽에 맞는 값으로 낮춰야 한다.' },
    { q: 'OPEN이 된 뒤 10초가 지났는데도 actuator에 계속 OPEN으로 보인다. 그 사이 들어온 요청은 없었다. 가장 그럴듯한 설명은?',
      o: ['wait-duration-in-open-state 설정이 무시되었다', '기본값에서는 10초가 지난 뒤 첫 호출이 와야 HALF_OPEN으로 바뀐다', '시험 호출 3건이 모두 실패했다'], a: 1,
      why: '자동 전이 설정을 켜지 않으면 wait가 지난 뒤 들어온 호출이 HALF_OPEN 전이를 일으킨다. 요청이 없었으니 상태가 그대로다.' },
    { q: 'payment 장애로 서킷이 OPEN인 동안 fallback이 PENDING을 돌려주고 있다. 이때 order 서비스의 스레드는 어떻게 되는가?',
      o: ['30초씩 기다리다 풀이 다시 고갈된다', 'HALF_OPEN이 될 때까지 대기열에 쌓인다', '기다리지 않고 바로 반환되어 다른 요청을 받는다'], a: 2,
      why: 'OPEN은 다운스트림을 부르지 않고 즉시 fallback으로 끝낸다. 30초 대기가 사라져 Step 1의 스레드 고갈이 일어나지 않는다.' },
  ];

  R.page({ title: '상태 머신 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
