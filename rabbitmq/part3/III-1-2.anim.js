/* III-1-2 Message TTL — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 큐(칸이 있는 관, 오른쪽 끝이 head)와 그 아래 시간축. 메시지마다 TTL 막대가 붙고, 시간 커서가 지나가면 만료된다.
 * 숫자는 페이지의 코드·STEPS 데이터(queueTtl, clockMs, queue[].ttl)에서 읽는다.
 * Step 3 마지막 beat 의 "실제 제거 시각"은 세 건을 같은 순간에 넣었다고 놓고 head 판정 규칙으로 계산한 값이다(예시). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, zone, cross, check, clock, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  function xchg(cx, cy, name, o) { o = o || {}; const w = o.w || 132, a = w / 2, b = 25, d = 14, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INFO;
    el('path', { d: `M${-a},0 L${-a + d},${-b} L${a - d},${-b} L${a},0 L${a - d},${b} L${-a + d},${b} Z`, fill: o.fill || INFOBG, stroke: col, 'stroke-width': 2.2 }, g);
    tx(0, o.type ? -2 : 5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, class: 'mono' }, g);
    if (o.type) tx(0, 16, o.type, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g);
    return g; }
  function tube(x, cy, w, name, items, o) { o = o || {}; const h = o.h || 44, n = o.slots || 5, sw = (w - 12) / n, gw = o.grow ?? 1, op = o.op ?? 1;
    if (gw <= 0) return () => 0;
    el('rect', { x, y: cy - h / 2, width: w * gw, height: h, rx: 10, fill: SOFT, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    const slotX = (i) => x + w - 6 - sw * (i + 0.5);
    if (gw < 1) return slotX;
    for (let i = 1; i < n; i++) el('line', { x1: x + w - 6 - sw * i, y1: cy - h / 2 + 6, x2: x + w - 6 - sw * i, y2: cy + h / 2 - 6, stroke: GRID, 'stroke-width': 1.2, opacity: op });
    if (name) mono(o.nameX ?? x, o.nameBelow ? cy + h / 2 + 22 : cy - h / 2 - 10, name, { 'font-size': 15, 'font-weight': 700, opacity: op });
    (items || []).forEach((it, i) => { if (!it || i >= n) return; const col = it.col || ACC;
      card(slotX(i), cy, sw - 8, h - 14, { rx: 6, fill: it.fill || PANEL, stroke: col, sw: 2, text: it.t, fs: 13.5, mono: true, color: col, s: it.s ?? 1, op: (it.op ?? 1) * op, dash: it.dash }); });
    return slotX; }
  function node(cx, cy, letter, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('circle', { cx: 0, cy: 0, r: 26, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    tx(0, 7, letter, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: col }, g);
    if (name) tx(0, 46, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: o.nameCol || INK }, g); return g; }
  function tok(cx, cy, s, o) { o = o || {}; const col = o.col || ACC;
    return card(cx, cy, tw(s, 13.5) + 20, 28, { rx: 6, fill: o.fill || PANEL, stroke: col, sw: 2, text: s, fs: 13.5, mono: true, color: col, s: o.s ?? 1, op: o.op ?? 1 }); }
  function at(pts, u) { const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), T = L.reduce((a, b) => a + b, 0);
    let d = clamp(u) * T, i = 0; while (i < L.length - 1 && d > L[i]) { d -= L[i]; i++; } const f = L[i] ? d / L[i] : 0;
    return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; }
  function wire(pts, u, col, o) { o = o || {}; if (u <= 0) return; const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), T = L.reduce((a, b) => a + b, 0);
    let d = clamp(u) * T; const out = [pts[0]]; for (let i = 0; i < L.length; i++) { if (d >= L[i]) { out.push(pts[i + 1]); d -= L[i]; } else { const f = d / L[i]; out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]); break; } }
    const mk = col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)';
    el('polyline', { points: out.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, 'stroke-linejoin': 'round', 'marker-end': u > 0.98 && o.arrow !== false ? mk : null }); }
  // 시간축: 0 ~ maxS 초. 돌려준 X(초) 로 위치를 얻는다
  function timeline(x, y, w, maxS, ticks, op) { const X = (s) => x + (s / maxS) * w;
    el('line', { x1: x, y1: y, x2: x + w, y2: y, stroke: MUT, 'stroke-width': 1.8, opacity: op ?? 1 });
    ticks.forEach((s) => { el('line', { x1: X(s), y1: y, x2: X(s), y2: y + 6, stroke: MUT, opacity: op ?? 1 }); mono(X(s), y + 22, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op ?? 1 }); });
    return X; }
  // 시간 커서 (세로 점선 + 경과 시각)
  function cursor(X, s, y0, y1) { el('line', { x1: X(s), y1: y0, x2: X(s), y2: y1, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
    mono(X(s), y0 - 8, s.toFixed(1) + 's', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' }); }
  const sec = (ms) => ms / 1000;

  // ---------- 1. 큐 단위 TTL ----------
  function badge(cx, cy, text, col, s, o) { o = o || {}; const g = card(cx, cy, tw(text, 14) + 60, 36, { rx: 18, stroke: col, sw: 2, fill: o.fill || PANEL, s });
    clock(cx - (tw(text, 14) + 60) / 2 + 20, cy, 10, o.frac ?? 1, col); mono(cx + 12, cy + 5, text, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: s >= 0.9 ? 1 : 0 }); return g; }
  function s1(t, c) { const { k, u } = c, b = c.beat, q = b.queue || [], pq = (c.prev && c.prev.queue) || [];
    const slotX = tube(220, 200, 480, 'notifications', q.map((m, i) => ({ t: m.id, col: ACC, s: i >= pq.length ? pop(u, 0.9 + (i - pq.length) * 0.5) : 1 })), { grow: k === 0 ? E(u, 0.2, 0.9) : 1 });
    badge(460, 120, `x-message-ttl = ${b.queueTtl}ms`, WARN, k === 0 ? pop(u, 1.0) : 1);
    if (k === 0) { sub(460, 262, '아직 메시지가 없다', fade(u, 1.6), { 'font-size': 15 }); return; }
    node(80, 200, 'P', 'Producer', { s: k === 1 ? pop(u, 0.2) : 1 });
    // 새로 들어온 메시지가 P 에서 날아온다
    q.forEach((m, i) => { if (i < pq.length) return; const a = 0.3 + (i - pq.length) * 0.5;
      if (u > a && u < a + 0.6) { const [x, y] = at([[106, 200], [slotX(i), 200]], E(u, a, a + 0.6)); tok(x, y - 36, m.id, { col: ACC }); } });
    // 메시지마다 TTL 막대 (같은 8초)
    q.forEach((m, i) => { const fresh = i >= pq.length, a = fresh ? 1.1 + (i - pq.length) * 0.5 : 0, g = fresh ? E(u, a, a + 0.6) : 1;
      el('rect', { x: slotX(i) - 40, y: 232, width: 80 * g, height: 10, rx: 3, fill: WARN, opacity: 0.85 });
      mono(slotX(i), 262, sec(m.ttl) + 's', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, a + 0.4) }); });
    if (k === 1) { wire([[460, 138], [slotX(0), 176]], E(u, 1.4, 1.9), WARN, { dash: '5 4' }); sub(110, 300, 'properties 없음', fade(u, 0.5), { class: 'mono', 'font-weight': 700 });
      R.banner(460, 345, 'publish에는 만료 설정이 없어도 큐의 8초가 붙는다', pop(u, 2.0)); return; }
    lock(612, 118, true, WARN, pop(u, 1.6));
    card(460, 340, 600, 66, { rx: 10, stroke: GRID, sw: 1.5, s: pop(u, 1.8) });
    tx(180, 334, '인자로 건 TTL은 큐를 지우고 다시 선언해야 바뀐다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
    tx(180, 356, '정책(message-ttl)으로 걸면 운영 중에도 바꿀 수 있다', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // ---------- 2. 메시지 단위 TTL ----------
  function props(cx, cy, name, ms, s, hot) { card(cx, cy, 300, 92, { rx: 10, stroke: hot ? ACC : GRID, sw: hot ? 2.5 : 1.5, s });
    if (s < 0.9) return; mono(cx - 136, cy - 22, `BasicProperties ${name}`, { 'font-size': 14, 'font-weight': 700, fill: MUT });
    R.spans(cx - 136, cy + 4, [['.expiration(', {}], [`"${ms}"`, { fill: ACC, 'font-weight': 800 }], [')', {}]], { 'font-size': 15 });
    mono(cx - 136, cy + 28, '.deliveryMode(2)', { 'font-size': 14.5, fill: INK }); }
  function s2(t, c) { const { k, u } = c, b = c.beat, q = b.queue || [];
    const X = timeline(220, 330, 480, 10, [0, 3, 5, 10]);
    mono(712, 335, '시간', { 'font-size': 13.5, fill: MUT });
    const pub = k === 3, inQ = pub ? q.map((m, i) => u > 0.3 + i * 0.3) : q.map(() => false);
    const now = pub ? lerp(0, sec(b.clockMs), E(u, 0.9, 2.4)) : 0;
    const items = q.map((m, i) => inQ[i] ? { t: m.id, col: now >= sec(m.ttl) ? OFF : ACC, op: now >= sec(m.ttl) ? 0.45 : 1 } : null);
    tube(220, 90, 480, 'promos', items.filter(Boolean), { grow: k === 0 ? E(u, 0.2, 0.8) : 1 });
    const bg = card(820, 90, 200, 40, { rx: 20, stroke: MUT, sw: 2, s: k === 0 ? pop(u, 0.9) : 1 });
    mono(830, 95, 'arguments = null', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: k === 0 ? fade(u, 1.1) : 1 });
    if (k === 0) { clock(820, 160, 16, 1, OFF); cross(820, 160, 14, pop(u, 1.4)); sub(820, 205, '큐 TTL 없음', fade(u, 1.5), { 'font-weight': 700 });
      sub(460, 250, '만료 시간은 메시지가 들고 온다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // 메시지별 TTL 막대 (시간축 위)
    q.forEach((m, i) => { const y = 230 + i * 44, fresh = k === 1 + i, g = fresh ? E(u, 1.0, 1.8) : 1, done = now >= sec(m.ttl);
      if (k < 1 + i) return;
      mono(208, y + 6, m.id, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: done ? OFF : ACC });
      el('rect', { x: X(0), y: y - 8, width: (X(sec(m.ttl)) - X(0)) * g, height: 16, rx: 4, fill: done ? OFF : ACC, opacity: 0.75 });
      mono(X(sec(m.ttl)) + 8, y + 6, `"${m.ttl}"`, { 'font-size': 14, 'font-weight': 700, fill: done ? OFF : ACC, opacity: fresh ? fade(u, 1.6) : 1 });
      if (done) { el('line', { x1: X(0), y1: y, x2: X(sec(m.ttl)), y2: y, stroke: BAD, 'stroke-width': 2.5 }); sub(X(sec(m.ttl)) + 110, y + 5, '만료', 1, { 'font-weight': 800, fill: BAD, 'font-size': 15 }); } });
    if (k === 1 || k === 2) { props(800, 220, k === 1 ? 'p3s' : 'p10s', k === 1 ? 3000 : 10000, pop(u, 0.2), true);
      if (k === 1) { pill(770, 296, '"3000"  문자열', GOOD, pop(u, 2.0), { fs: 13.5 }); pill(900, 296, '3000 ✗', BAD, pop(u, 2.2), { fs: 13.5, mono: true }); }
      else sub(830, 296, '같은 큐, 다른 만료', fade(u, 2.0), { 'font-weight': 700, fill: INK, 'font-size': 15 });
      return; }
    // 3: publish 후 시간이 흐른다 (clockMs 까지)
    q.forEach((m, i) => { const a = 0.3 + i * 0.3 - 0.4; if (u > a && u < a + 0.4) { const [x, y] = at([[110, 40], [600, 40]], E(u, a, a + 0.4)); tok(x, y, m.id); } });
    if (u > 0.9) cursor(X, now, 212, 340);
    if (now >= 3) R.banner(830, 200, 'promo-A만 먼저 만료', pop(u, 1.9)); }

  // ---------- 3. 둘 다 있으면 작은 값 ----------
  function s3(t, c) { const { k, u } = c, b = c.beat, q = b.queue || [], cap = sec(b.queueTtl);
    const X = timeline(250, 380, 520, 20, [0, 3, 5, 8, 20]);
    const head = k === 4, now = head ? lerp(0, 7.5, E(u, 0.3, 2.4)) : 0;
    const gone = { 'ord-10': 3, 'ord-11': 8, 'ord-12': 8 };   // head 판정 규칙으로 계산한 실제 제거 시각 (예시)
    const items = q.map((m) => (head && now >= gone[m.id]) ? null : { t: m.id, col: ACC });
    tube(250, 70, 520, 'orders', items.filter(Boolean), { slots: 5 });
    if (head) mono(770 - 6, 112, '← head', { 'font-size': 14, 'font-weight': 800, fill: INK, 'text-anchor': 'end' });
    // 큐 TTL 상한선
    el('line', { x1: X(cap), y1: 140, x2: X(cap), y2: 380, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: k === 0 ? E(u, 0.3, 1.0) : 1 });
    mono(X(cap) + 8, 152, `x-message-ttl ${b.queueTtl}`, { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: k === 0 ? fade(u, 0.8) : 1 });
    if (k === 0) { sub(560, 250, '모든 메시지의 상한이 8초가 된다', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    q.forEach((m, i) => { const y = 200 + i * 52, fresh = k === 1 + i && !head, g = fresh ? E(u, 0.3, 1.1) : 1;
      if (!head && k < 1 + i) return;
      const ask = sec(m.msgTtl), ap = sec(m.ttl);
      mono(238, y + 6, m.id, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end' });
      if (!head) { // 요청한 값(옅게) → 적용 값(진하게)
        el('rect', { x: X(0), y: y - 9, width: (X(ask) - X(0)) * g, height: 18, rx: 4, fill: ask > cap ? BAD : INFO, opacity: 0.22 });
        if (ask > cap && g > 0.9) { cross(X(11), y, 8, pop(u, 1.2)); }
        el('rect', { x: X(0), y: y - 9, width: (X(ap) - X(0)) * (fresh ? E(u, 1.1, 1.7) : 1), height: 18, rx: 4, fill: m.applied === 'msg' ? INFO : WARN, opacity: 0.85 });
        mono(X(20) + 6, y + 6, `min(${m.queueTtl}, ${m.msgTtl}) = ${m.ttl}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: m.applied === 'msg' ? INFO : WARN, opacity: fresh ? fade(u, 1.6) : 1 });
        return; }
      // 4: head 판정
      const exp = now >= ap, rm = now >= gone[m.id];
      el('rect', { x: X(0), y: y - 9, width: X(ap) - X(0), height: 18, rx: 4, fill: rm ? OFF : INFO, opacity: rm ? 0.35 : 0.85 });
      if (exp && !rm) { el('rect', { x: X(ap), y: y - 9, width: X(Math.min(now, gone[m.id])) - X(ap), height: 18, rx: 4, fill: BAD, opacity: 0.35 });
        mono(X(20) + 6, y + 6, '만료됐지만 head가 아니라 남음', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end' }); }
      if (rm) mono(X(20) + 6, y + 6, `${gone[m.id]}s에 제거`, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' }); });
    if (head) { cursor(X, now, 176, 380); sub(640, 24, '예시: 세 건을 같은 순간에 넣었다고 가정', 1, { 'font-weight': 700 }); } }

  // ---------- 4. 만료 → 삭제 또는 DLX ----------
  function shatter(cx, cy, f) { for (let i = 0; i < 7; i++) { const a = -0.6 + i * 0.2; el('rect', { x: cx - 5 + Math.sin(i * 2.3) * 30 * f, y: cy - 5 + f * (30 + i * 9), width: 10, height: 10, rx: 2, fill: ACC, opacity: 1 - f, transform: `rotate(${a * 90 * f} ${cx} ${cy})` }); } }
  function s4(t, c) { const { k, u } = c, b = c.beat, ttl = sec(b.queueTtl);
    // 레인 A: DLX 없음
    const tA = k === 0 ? lerp(0, sec(b.clockMs), E(u, 0.3, 1.6)) : sec(b.clockMs), expA = tA >= ttl;
    tube(40, 100, 320, 'cache.invalidate', expA ? [] : [{ t: 'msg-noDlx', col: ACC }], { slots: 3 });
    clock(400, 100, 18, Math.min(1, tA / ttl), expA ? BAD : WARN); mono(430, 106, `TTL ${ttl}s`, { 'font-size': 14, 'font-weight': 700, fill: WARN });
    if (expA) { const f = k === 0 ? E(u, 1.6, 2.5) : 1; if (f < 1) shatter(306, 100, f);
      if (k < 3) pill(620, 100, '만료 = 삭제 · 로그 없음', BAD, k === 0 ? pop(u, 1.8) : 1, { fs: 14 }); }
    if (k === 0) return;
    // 레인 B: DLX 있음
    const tB = k === 1 ? lerp(0, sec(b.clockMs), E(u, 0.5, 1.6)) : sec(b.clockMs), expB = tB >= ttl;
    tube(40, 270, 320, 'orders.pending', expB ? [] : [{ t: 'msg-dlx', col: ACC }], { slots: 3 });
    clock(400, 270, 18, Math.min(1, tB / ttl), expB ? BAD : WARN); mono(430, 276, `TTL ${ttl}s`, { 'font-size': 14, 'font-weight': 700, fill: WARN });
    sub(200, 322, 'x-dead-letter-exchange: dlx.exchange', k === 1 ? fade(u, 0.3) : 1, { class: 'mono', 'font-weight': 700, fill: WARN });
    xchg(560, 270, 'dlx.exchange', { type: 'direct', col: WARN, fill: WARNBG, s: k === 1 ? pop(u, 0.4) : 1 });
    const bound = k >= 2, bg = k === 2 ? E(u, 0.2, 0.8) : 1;
    if (bound) { el('line', { x1: 626, y1: 270, x2: lerp(626, 680, bg), y2: 270, stroke: WARN, 'stroke-width': 2.5 });
      mono(653, 312, 'orders.dead', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 0.6) : 1 }); }
    const arrived = (k === 2 && u > 2.0) || k === 3;
    if (bound) tube(680, 270, 250, 'orders.dead.queue', arrived ? [{ t: 'msg-dlx', col: WARN, s: k === 2 ? pop(u, 2.0) : 1 }] : [], { slots: 3, grow: k === 2 ? E(u, 0.4, 1.0) : 1 });
    if (k === 1 && u > 1.6 && u < 2.5) { const [x, y] = at([[306, 270], [306, 222], [560, 222], [560, 245]], E(u, 1.6, 2.5)); tok(x, y, 'msg-dlx', { col: WARN }); }
    if (k === 1 && u > 2.4) sub(560, 340, '받을 큐가 아직 없다', 1, { 'font-weight': 700, fill: BAD });
    if (k === 2 && u > 1.0 && u < 2.0) { const [x, y] = at([[626, 270], [806, 270]], E(u, 1.0, 2.0)); tok(x, y, 'msg-dlx', { col: WARN }); }
    if (k === 2) sub(560, 360, '바인딩이 없으면 여기서 버려진다', fade(u, 1.2), { 'font-weight': 700, fill: MUT });
    if (k === 3) { const rows = [['reason', 'expired'], ['count', '1'], ['queue', 'orders.pending'], ['time', '2026-05-20T10:24Z'], ['original-expiration', '(없음 · 큐 TTL)']];
      el('rect', { x: 560, y: 30, width: 380, height: 186, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.3) });
      mono(576, 54, 'x-death (msg-dlx)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) });
      rows.forEach(([kk, v], i) => { const y = 84 + i * 27, op = fade(u, 0.5 + i * 0.25);
        mono(576, y, kk, { 'font-size': 14, fill: MUT, opacity: op }); mono(924, y, v, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: kk === 'reason' ? WARN : i === 4 ? MUT : INK, opacity: op }); }); } }

  // ---------- 5. TTL + DLX = 지연 큐 ----------
  function s5(t, c) { const { k, u } = c, b = c.beat, q = b.queue || [];
    // 작업 쪽: work.exchange → work.queue → Consumer
    xchg(520, 110, 'work.exchange', { w: 150, type: 'direct', s: k === 0 ? pop(u, 0.2) : 1 });
    const wg = k === 0 ? E(u, 0.5, 1.1) : 1;
    el('line', { x1: 595, y1: 110, x2: lerp(595, 630, wg), y2: 110, stroke: INFO, 'stroke-width': 2.5 }); sub(612, 146, 'job', wg, { class: 'mono', 'font-weight': 700, fill: INFO });
    const delivered = k === 2 && u > 2.3;
    tube(630, 110, 220, 'work.queue', [], { slots: 3, grow: wg });
    node(905, 110, 'C', 'Consumer', { s: k === 0 ? pop(u, 1.1) : 1, col: delivered ? GOOD : INK });
    if (k === 0) { sub(740, 190, '작업 큐에는 TTL이 없다', fade(u, 1.5), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    // 대기 큐: 소비자 0 + TTL + DLX
    const ttl = sec(b.queueTtl || 5000), wgw = k === 1 ? E(u, 0.2, 0.8) : 1;
    node(60, 110, 'P', 'Producer', { s: k === 1 ? pop(u, 0.2) : 1 });
    const T = k === 2 ? lerp(0, ttl, E(u, 0.4, 1.9)) : 0, waiting = k >= 2 && !(k === 2 && u > 1.9);
    tube(130, 110, 260, 'wait.queue', waiting && q[0] ? [{ t: q[0].id, col: ACC }].concat(k >= 3 && q[1] ? [{ t: q[1].id, col: ACC }] : []) : [], { slots: 3, grow: wgw });
    clock(410, 60, 16, k === 2 ? T / ttl : 0, WARN); mono(432, 66, `TTL ${ttl}s`, { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: k === 1 ? fade(u, 0.8) : 1 });
    wire([[390, 120], [445, 120]], k === 1 ? E(u, 1.0, 1.5) : 1, WARN, { dash: '5 4' });
    sub(260, 160, '소비자 0 · 만료되면 work.exchange로', k === 1 ? fade(u, 1.3) : 1, { 'font-weight': 700, fill: WARN });
    if (k === 1) { node(260, 236, 'C', '대기 큐에 소비자 없음', { dash: '4 4', col: OFF, nameCol: MUT, s: pop(u, 1.6) }); cross(260, 236, 16, pop(u, 1.9)); return; }
    if (k === 2) { const X = timeline(130, 300, 520, ttl, [0, 1, 2, 3, 4, 5]);
      if (u < 0.4) { const [x, y] = at([[86, 110], [370, 110]], E(u, 0.05, 0.4)); tok(x, y - 36, q[0].id); }
      cursor(X, T, 280, 300);
      if (u > 1.9 && u < 2.4) { const [x, y] = at([[390, 70], [470, 70], [700, 70]], E(u, 1.9, 2.4)); tok(x, y, q[0].id, { col: WARN }); }
      if (delivered) { check(905, 60, 10, pop(u, 2.3)); R.banner(640, 360, `${q[0].id}이 ${ttl}초 늦게 work.queue에 도착`, pop(u, 2.3)); }
      return; }
    // 3: 단계별 대기 큐 (TTL 이 다른 큐를 여러 개)
    if (k === 3) { [['wait.5s', 5, ACC], ['wait.30s', 30, WARN], ['wait.5m', 300, BAD]].forEach(([n, s, col], i) => { const y = 230 + i * 58, a = 0.3 + i * 0.45;
        tube(130, y, 220, n, i === 1 && u > 1.6 ? [{ t: q[1] ? q[1].id : 'retry-2', col }] : [], { slots: 2, h: 40, nameX: 30, op: fade(u, a) ? 1 : 0, grow: E(u, a, a + 0.4) });
        el('rect', { x: 380, y: y - 7, width: Math.log10(s) / Math.log10(300) * 220 * E(u, a + 0.3, a + 0.8), height: 14, rx: 4, fill: col, opacity: 0.7 });
        mono(612, y + 5, `${s}s`, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, a + 0.6) });
        wire([[650, y], [700, y], [700, 150]], E(u, a + 0.5, a + 1.0), OFF, { dash: '4 4' }); });
      sub(800, 240, '실패할수록 더 긴 대기 큐로', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: INK });
      sub(800, 264, '(막대는 로그 눈금)', fade(u, 1.9)); return; }
    // 4: 한 묶음
    const chips = [['큐 TTL', 'x-message-ttl'], ['메시지 TTL', 'expiration "ms"'], ['min 규칙', '작은 값'], ['head 판정', '맨 앞에서 제거'], ['만료 후', '삭제 또는 DLX'], ['지연 큐', 'TTL + DLX']];
    chips.forEach(([a, bb], i) => { const x = 95 + i * 154, y = 300, s = pop(u, 0.2 + i * 0.3), last = i === 5;
      card(x, y, 140, 64, { rx: 10, stroke: last ? ACC : GRID, sw: last ? 2.5 : 1.5, s, fill: last ? ACCBG : PANEL });
      tx(x, y - 5, a, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: last ? ACC : INK, opacity: fade(u, 0.3 + i * 0.3) });
      mono(x, y + 17, bb, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3 + i * 0.3) });
      if (i < 5) wire([[x + 72, y], [x + 82, y]], E(u, 0.4 + i * 0.3, 0.6 + i * 0.3), OFF); }); }

  const quiz = [
    { q: 'x-message-ttl=8000인 큐에 TTL 없이 publish한 메시지의 만료 시간은 얼마인가?',
      o: ['만료되지 않는다', '8초', 'publish 할 때마다 다르다'], a: 1,
      why: '큐 인자 x-message-ttl은 그 큐에 들어오는 모든 메시지에 붙는다. producer가 아무것도 정하지 않아도 8초 뒤 만료 대상이 된다.' },
    { q: '메시지 단위 TTL을 주는 expiration 값은 어떤 형태로 넣어야 하나?',
      o: ['밀리초를 담은 문자열 "3000"', '정수 3000', '초 단위 문자열 "3s"'], a: 0,
      why: 'expiration은 밀리초 숫자를 문자열로 담는 필드다. 브로커는 "3000" 같은 문자열 표현만 받는다.' },
    { q: '큐 TTL이 8000이고 메시지 expiration이 "20000"이면 실제로 적용되는 TTL은?',
      o: ['20000ms', '28000ms', '8000ms'], a: 2,
      why: '둘 다 있으면 작은 값이 적용된다. min(8000, 20000) = 8000이라 메시지 TTL로 큐 상한을 늘릴 수 없다.' },
    { q: 'DLX가 없는 큐에서 TTL이 지난 메시지는 어떻게 되나?',
      o: ['조용히 삭제된다', 'dead letter 큐로 옮겨진다', '컨슈머에게 만료 표시를 달고 배달된다'], a: 0,
      why: 'x-dead-letter-exchange가 없으면 만료는 곧 소멸이다. DLX를 걸어야 reason: expired와 함께 남는다.' },
    { q: '지연 큐 패턴에서 대기 큐(wait.queue)에 반드시 지켜야 할 조건은?',
      o: ['durable=false로 만든다', '소비자를 붙이지 않는다', 'TTL을 메시지마다 다르게 준다'], a: 1,
      why: '대기 큐에 소비자가 있으면 TTL이 끝나기 전에 꺼내 가서 지연이 사라진다. 소비자 0이어야 TTL이 타이머가 된다.' },
  ];

  const summary = [
    'TTL은 큐 인자 x-message-ttl로 모든 메시지에 걸거나, expiration 문자열로 한 건에만 건다.',
    '둘 다 있으면 작은 값이 적용되고, 만료된 메시지는 큐 맨 앞에 와야 실제로 빠진다.',
    'DLX가 없으면 만료된 메시지는 흔적 없이 사라지고, 있으면 reason: expired로 옮겨진다.',
    '소비자 없는 대기 큐에 TTL과 DLX를 걸면 정해진 시간 뒤에 작업 큐로 넘기는 지연 큐가 된다.',
  ];
  const review = [
    { q: '알림 큐에 x-message-ttl을 8000으로 걸었다가 30000으로 바꿔 다시 선언했더니 채널이 닫혔다. 가장 알맞은 대응은?',
      o: ['큐를 지우고 다시 만들거나, TTL을 정책(message-ttl)으로 옮긴다', 'publish마다 expiration "30000"을 붙인다', '컨슈머 prefetch를 늘린다'], a: 0,
      why: '인자로 건 TTL은 선언 뒤 바꿀 수 없어 다른 값으로 재선언하면 거절된다. expiration을 붙여도 min 규칙 때문에 8초를 넘지 못한다.' },
    { q: '한 큐에 5분짜리 메시지 뒤로 5초짜리 메시지를 넣었다. 5초짜리가 제때 빠지지 않는 이유는?',
      o: ['expiration을 정수로 넣어서', '만료 판정이 큐 맨 앞에서만 일어나서', 'DLX가 없어서'], a: 1,
      why: '메시지 단위 TTL은 head에 왔을 때 판정된다. 앞의 5분짜리가 빠질 때까지 뒤의 5초짜리는 만료돼도 큐에 남는다.' },
    { q: '30초 뒤 재시도를 만들려고 wait.queue에 TTL 30000과 DLX를 걸었는데 메시지가 바로 처리된다. 먼저 확인할 것은?',
      o: ['DLX 바인딩 키가 job인지', 'expiration이 문자열인지', 'wait.queue에 소비자가 붙어 있는지'], a: 2,
      why: '대기 큐에 소비자가 있으면 TTL이 끝나기 전에 꺼내 간다. 지연은 소비자가 0일 때만 생긴다.' },
  ];

  R.page({ title: 'TTL로 메시지 수명 정하기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
