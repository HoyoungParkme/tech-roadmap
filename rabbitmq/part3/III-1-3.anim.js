/* III-1-3 Queue TTL + Length Limit — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 큐(칸이 있는 관, 오른쪽 끝이 head, 왼쪽 끝이 tail). 칸 수와 찬 칸은 STEPS 의 queue.capacity / queue.used 를 쓴다.
 * 상한(x-max-length)은 tail 쪽 벽으로, x-expires 는 큐 옆의 타이머로 그린다.
 * Step 5 의 큐 깊이·메모리 값은 스크립트(awk, sort)를 확인하려고 넣어 본 예시 입력이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, zone, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  function xchg(cx, cy, name, o) { o = o || {}; const w = o.w || 132, a = w / 2, b = 25, d = 14, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INFO;
    el('path', { d: `M${-a},0 L${-a + d},${-b} L${a - d},${-b} L${a},0 L${a - d},${b} L${-a + d},${b} Z`, fill: o.fill || INFOBG, stroke: col, 'stroke-width': 2.2 }, g);
    tx(0, o.type ? -2 : 5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, class: 'mono' }, g);
    if (o.type) tx(0, 16, o.type, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g);
    return g; }
  function tube(x, cy, w, name, items, o) { o = o || {}; const h = o.h || 44, n = o.slots || 5, sw = (w - 12) / n, gw = o.grow ?? 1, op = o.op ?? 1;
    if (gw <= 0) return () => 0;
    el('rect', { x, y: cy - h / 2, width: w * gw, height: h, rx: 10, fill: SOFT, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op, 'stroke-dasharray': o.dash });
    const slotX = (i) => x + w - 6 - sw * (i + 0.5);
    if (gw < 1) return slotX;
    for (let i = 1; i < n; i++) el('line', { x1: x + w - 6 - sw * i, y1: cy - h / 2 + 6, x2: x + w - 6 - sw * i, y2: cy + h / 2 - 6, stroke: GRID, 'stroke-width': 1.2, opacity: op });
    if (name) mono(o.nameX ?? x, o.nameBelow ? cy + h / 2 + 22 : cy - h / 2 - 10, name, { 'font-size': 15, 'font-weight': 700, opacity: op });
    (items || []).forEach((it, i) => { if (!it || i >= n) return; const col = it.col || ACC, cx = it.dx ? slotX(i) + it.dx : slotX(i);
      card(cx, cy + (it.dy || 0), (it.w || sw - 8), h - 14, { rx: 6, fill: it.fill || PANEL, stroke: col, sw: 2, text: it.t, fs: 13.5, mono: true, color: col, s: it.s ?? 1, op: (it.op ?? 1) * op, dash: it.dash }); });
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
  // tail 쪽 상한 벽
  function wall(x, cy, h, label, op, col) { el('rect', { x: x - 7, y: cy - h / 2 - 8, width: 7, height: h + 16, rx: 2, fill: col || BAD, opacity: op });
    if (label) mono(x - 12, cy + h / 2 + 26, label, { 'font-size': 13.5, 'font-weight': 700, fill: col || BAD, opacity: op }); }
  const fillN = (n, pre, col) => Array.from({ length: n }, (_, i) => ({ t: (pre || 'm') + (i + 1), col: col || ACC }));

  // ---------- 1. x-expires ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, q = b.queue, pq = (c.prev && c.prev.queue) || q;
    if (k === 3) { // 어디에 쓰나
      [['RPC reply-to 큐', '요청자별 임시 응답 큐', true], ['웹소켓 세션 큐', '연결이 끊기면 알아서 정리', true], ['상시 워커 큐', '한가한 새벽에 지워지면 사고', false]].forEach(([a, bb, ok], i) => {
        const x = 170 + i * 310, y = 120, s = pop(u, 0.2 + i * 0.4);
        card(x, y, 280, 120, { rx: 12, stroke: ok ? GOOD : BAD, sw: 2.5, s, fill: ok ? GOODBG : BADBG });
        (ok ? check : cross)(x, y - 30, 13, s); tx(x, y + 12, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.4) });
        tx(x, y + 38, bb, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.4) }); });
      card(480, 320, 760, 96, { rx: 12, stroke: GRID, sw: 1.5, s: pop(u, 1.5) });
      tube(140, 300, 170, '', [], { slots: 3, h: 34 }); clock(340, 300, 14, 1, BAD);
      tx(370, 306, 'x-expires: 큐가 통째로 사라진다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      tok(170, 346, 'msg', { col: ACC }); clock(220, 346, 11, 1, WARN);
      tx(370, 352, 'x-message-ttl: 메시지 한 건이 만료된다 (III-1-2)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.9) }); return; }
    const gone = k === 2 ? E(u, 2.1, 2.6) : 0;
    tube(200, 150, 420, 'temp.session.42', k === 1 ? fillN(q.used, 's') : [], { slots: q.capacity, grow: k === 0 ? E(u, 0.2, 0.8) : 1, op: 1 - gone });
    // idle 타이머
    const frac = k === 2 ? E(u, 0.4, 2.0) : k === 1 ? 0 : tween(0, q.ttlPct, u) / 100;
    clock(720, 150, 40, frac, k === 2 ? BAD : WARN);
    mono(720, 220, q.ttlLabel, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN });
    sub(720, 244, k === 0 ? '아직 기준점이 없다' : k === 1 ? '사용 중 · 멈춤' : '마지막 사용부터 흐른다', 1, { 'font-weight': 700, fill: k === 1 ? GOOD : k === 2 ? BAD : MUT });
    if (k === 1) { el('rect', { x: 708, y: 132, width: 8, height: 36, rx: 2, fill: INK }); el('rect', { x: 724, y: 132, width: 8, height: 36, rx: 2, fill: INK }); }
    if (k === 0) { sub(410, 240, '메시지도 컨슈머도 아직 없다', fade(u, 1.2), { 'font-size': 15 }); return; }
    // 컨슈머: k1 붙어 있음, k2 떠남
    const cOp = k === 2 ? 1 - E(u, 0.1, 0.5) : 1;
    el('line', { x1: 620, y1: 150, x2: 860, y2: 150, stroke: k === 1 ? GOOD : GRID, 'stroke-width': 2.5, 'stroke-dasharray': k === 2 ? '6 6' : null, opacity: k === 2 ? 0.5 : 1 });
    node(880, 150, 'C', 'Consumer', { s: k === 1 ? pop(u, 0.2) : 1, op: cOp });
    if (k === 1) { for (let i = 0; i < 2; i++) dot([[620, 150], [855, 150]], (t * 0.7 + i / 2) % 1, GOOD, 6); sub(880, 220, 'basic_consume · ack', fade(u, 0.6), { class: 'mono', 'font-weight': 700, fill: GOOD }); return; }
    if (k === 2) { cross(800, 150, 12, pop(u, 0.3)); sub(880, 220, '세션 종료 · disconnect', fade(u, 0.3), { 'font-weight': 700, fill: BAD });
      if (gone > 0) R.banner(410, 300, '30초 동안 아무도 안 쓰면 큐 자체를 삭제', pop(u, 2.2));
      if (gone > 0.3) mono(410, 150, '(큐 없음)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: gone }); } }

  // ---------- 2. x-max-length ----------
  function gauge(x, name, val, frac, s, hot) { const y0 = 70, H = 200;
    el('rect', { x, y: y0, width: 46, height: H, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: s });
    el('rect', { x, y: y0 + H * (1 - frac), width: 46, height: H * frac, rx: 8, fill: hot ? BAD : ACC, opacity: 0.75 * s });
    mono(x + 23, y0 + H + 24, name, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: s });
    mono(x + 23, y0 + H + 44, val, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); }
  function s2(t, c) { const { k, u } = c, b = c.beat, q = b.queue, pq = (c.prev && c.prev.queue) || q;
    if (k === 4) { // 값 잡는 법
      [['건수 상한', '피크 처리량 × 견딜 지연(초)', 110], ['바이트 상한', '노드 RAM × 0.4 / 큐 개수', 210]].forEach(([a, f, y], i) => {
        const s = pop(u, 0.2 + i * 0.4); card(300, y, 460, 76, { rx: 12, stroke: INFO, sw: 2, s });
        tx(90, y - 8, a, { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3 + i * 0.4) }); tx(90, y + 20, f, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) });
        wire([[530, y], [610, 160]], E(u, 0.8 + i * 0.3, 1.2 + i * 0.3), INFO); });
      card(700, 160, 170, 70, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 1.4), fill: ACCBG });
      tx(700, 156, '큐별 상한', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      tx(700, 180, '둘 중 작은 쪽', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
      // Policy 다이얼
      const ang = -120 + 200 * E(u, 1.9, 2.6); el('circle', { cx: 700, cy: 320, r: 34, fill: PANEL, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 1.7) });
      el('line', { x1: 700, y1: 320, x2: 700 + 26 * Math.cos(ang * Math.PI / 180), y2: 320 + 26 * Math.sin(ang * Math.PI / 180), stroke: ACC, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: fade(u, 1.7) });
      tx(760, 316, 'Policy로 걸면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); tx(760, 338, '재배포 없이 값만 바꾼다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
    const used = Math.round(tween(pq.used, q.used, u, 1.4)), full = used >= q.capacity;
    const down = k >= 2;
    node(70, 150, 'P', 'Producer');
    tube(160, 150, 460, 'work.queue', fillN(used, 'job-', full ? WARN : ACC), { slots: q.capacity });
    wall(160, 150, 44, 'x-max-length', k === 0 ? fade(u, 0.4) : 1);
    if (k === 0) sub(390, 216, '100000 건 (그림은 5칸으로 줄임)', fade(u, 0.8), { 'font-weight': 700 });
    el('line', { x1: 620, y1: 150, x2: 682, y2: 150, stroke: down ? GRID : GOOD, 'stroke-width': 2.5, 'stroke-dasharray': down ? '6 6' : null });
    node(708, 150, 'C', 'Consumer', { col: down ? BAD : INK });
    if (!down) for (let i = 0; i < 2; i++) dot([[620, 150], [682, 150]], (t * 0.6 + i / 2) % 1, GOOD, 5);
    if (down) cross(708, 150, 14, k === 2 ? pop(u, 0.3) : 1);
    // 오른쪽 계기: 건수 · 바이트
    gauge(800, '건수', '100000', used / q.capacity, 1, full);
    gauge(880, '바이트', '512MB', k >= 1 ? used / q.capacity * 0.8 : 0, k === 0 ? 0.35 : k === 1 ? fade(u, 0.4) : 1, false);
    if (k === 1) sub(560, 300, '둘 중 먼저 닿는 쪽이 상한이 된다', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: INK });
    if (k === 2) { for (let i = 0; i < 8; i++) dot([[96, 150], [160, 150]], (t * 1.4 + i / 8) % 1, ACC, 5);
      sub(390, 216, '100만 건 publish · 컨슈머 다운', fade(u, 0.4), { 'font-weight': 700, fill: BAD });
      if (full) pill(390, 260, q.overflowLabel, BAD, pop(u, 1.6), { fs: 14 }); }
    if (k === 3) { // 벽에 부딪힌 새 메시지 → overflow 정책
      for (let i = 0; i < 3; i++) { const v = (t * 0.8 + i / 3) % 1; if (v < 0.6) dot([[96, 150], [150, 150]], v / 0.6, WARN, 6); }
      pill(390, 216, q.overflowLabel + ' · 더 늘지 않는다', BAD, pop(u, 0.3), { fs: 14 });
      wire([[150, 178], [150, 300], [300, 300]], E(u, 0.8, 1.5), BAD);
      card(420, 300, 240, 56, { rx: 10, stroke: BAD, sw: 2.5, s: pop(u, 1.4), fill: BADBG, text: '이후 도착분 → overflow 정책', fs: 15, color: BAD });
      sub(420, 352, '터지느냐가 아니라 무엇을 버리느냐', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); } }

  // ---------- 3. overflow: drop-head vs reject-publish ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 3) { // list_policies
      const L = ['$ rabbitmqctl list_policies', 'vhost  name           pattern      apply-to  priority', '/      metrics-limit  ^metrics\\.   queues    5', '/      orders-limit   ^orders\\.    queues    5', '/      media-limit    ^media\\.     queues    5'];
      terminal(40, 40, 600, 160, L, lerp(0, 5, E(u, 0.2, 1.4)), { title: 'bash', fs: 14 });
      [['metrics.cpu', 'metrics-limit', ACC], ['orders.kr', 'orders-limit', WARN], ['media.img', 'media-limit', INFO]].forEach(([qn, pn, col], i) => { const y = 250 + i * 50, a = 1.4 + i * 0.3;
        tube(40, y, 170, '', [], { slots: 3, h: 34, op: fade(u, a) }); mono(56, y + 5, qn, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, a) });
        wire([[215, y], [400, y]], E(u, a + 0.1, a + 0.5), col); pill(480, y, pn, col, pop(u, a + 0.4), { fs: 14, mono: true }); });
      card(790, 300, 280, 150, { rx: 12, stroke: WARN, sw: 2, s: pop(u, 2.2), fill: WARNBG });
      tx(665, 266, '큐 하나에 정책은 하나', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.3) });
      tx(665, 296, '패턴이 겹치면 우선순위가', { 'font-size': 14, opacity: fade(u, 2.3) }); tx(665, 318, '높은 것만 붙는다', { 'font-size': 14, opacity: fade(u, 2.3) });
      tx(665, 348, '같으면 어느 쪽인지 모른다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.4) }); return; }
    if (k === 4) { // 선택 기준
      [['최신이 소중하다', '로그 · 메트릭 · 위치', 'drop-head', ACC, 0.2], ['전부 소중하다', '주문 · 결제 · 정산', 'reject-publish + confirm', WARN, 0.9]].forEach(([a, bb, pol, col, at0], i) => {
        const x = 250 + i * 460;
        tx(x, 60, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, at0) }); tx(x, 86, bb, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, at0) });
        for (let j = 0; j < 5; j++) { const op = i === 0 ? 0.25 + j * 0.18 : 1; card(x - 140 + j * 70, 160, 58, 40, { rx: 6, stroke: col, sw: 2, s: pop(u, at0 + 0.1 + j * 0.08), op, text: i === 0 ? `t${j + 1}` : `#${j + 1}`, fs: 13.5, mono: true, color: col }); }
        sub(x, 205, i === 0 ? '오래된 것일수록 덜 중요' : '하나도 잃으면 안 된다', fade(u, at0 + 0.5), { 'font-weight': 700 });
        pill(x, 270, pol, col, pop(u, at0 + 0.7), { fs: 16, mono: true }); });
      R.banner(480, 360, '데이터 성격이 overflow 정책을 정한다', pop(u, 2.0)); return; }
    // k0 drop-head, k1 reject-publish, k2 바이트 상한
    const drop = k !== 1, qname = k === 0 ? 'metrics.*' : k === 1 ? 'orders.*' : 'media.*', col = k === 1 ? WARN : k === 2 ? INFO : ACC;
    node(70, 150, 'P', 'Producer');
    pill(390, 66, k === 0 ? 'max-length 100000 · drop-head' : k === 1 ? 'max-length 50000 · reject-publish' : 'max-length-bytes 536870912 · drop-head', col, pop(u, 0.1), { fs: 14, mono: true });
    const sh = drop ? E(u, 0.6, 1.4) : 0;   // 한 칸 밀림
    const base = k === 2 ? [['m1', 70], ['m2', 52], ['m3', 76], ['m4', 46], ['m5', 64]] : [['m1'], ['m2'], ['m3'], ['m4'], ['m5']];
    const after = base.slice(1).concat([[k === 2 ? 'm6' : 'm6', k === 2 ? 80 : undefined]]);
    const items = (drop && u >= 1.4 ? after : base).map(([s, w], i) => ({ t: s, col, w, op: drop && u < 1.4 && i === 0 ? 1 - sh : 1 }));
    tube(160, 150, 460, qname, items, { slots: 5 });
    wall(160, 150, 44, null, 1);
    if (drop) { // 새 m6 가 tail 로 들어오고 head 의 m1 이 떨어진다
      if (u > 0.3 && u < 1.4) { const [x, y] = at([[124, 150], [200, 150]], E(u, 0.3, 1.0)); tok(x, y, 'm6', { col }); }
      const f = E(u, 1.0, 2.0); if (f > 0) { el('rect', { x: 600, y: 140 + f * 120, width: 20, height: 20, rx: 4, fill: col, opacity: 1 - f * 0.6 }); mono(640, 170 + f * 120, 'm1', { 'font-size': 14, 'font-weight': 700, fill: col, opacity: 1 - f * 0.6 }); }
      sub(560, 330, 'head의 가장 오래된 m1이 밀려난다', fade(u, 1.8), { 'font-weight': 700, fill: INK, 'font-size': 15 });
      check(70, 96, 10, pop(u, 1.2)); sub(70, 74, '거절 없음', fade(u, 1.2), { 'font-weight': 700, fill: GOOD });
      if (k === 2) { el('rect', { x: 760, y: 70, width: 46, height: 200, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }); el('rect', { x: 760, y: 76, width: 46, height: 194, rx: 8, fill: INFO, opacity: 0.6 });
        mono(783, 294, '512MiB', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle' }); sub(783, 316, '바이트 합계', 1, { 'font-weight': 700 });
        sub(390, 220, 'm6는 큰 메시지 · 칸 수가 아니라 크기 합으로 잰다', fade(u, 2.0), { 'font-weight': 700, fill: INFO }); }
      return; }
    // reject-publish: m6 가 벽에서 튕기고 producer 는 basic.nack 를 받는다
    if (u > 0.3 && u < 1.0) { const [x, y] = at([[96, 150], [150, 150]], E(u, 0.3, 1.0)); tok(x, y - 40, 'm6', { col: BAD }); }
    if (u >= 1.0) cross(128, 150, 10, pop(u, 1.0));
    fly(150, 236, 90, 236, seg(u, 1.2, 2.0), 'basic.nack', { fill: BAD, mono: true, stay: true });
    sub(40, 276, 'publisher confirm으로 거절을 안다', fade(u, 1.8), { 'font-weight': 700, fill: BAD, 'text-anchor': 'start' });
    sub(560, 330, '기존 m1~m5는 그대로, 새 m6만 거절', fade(u, 2.0), { 'font-weight': 700, fill: INK, 'font-size': 15 }); }

  // ---------- 4. reject-publish-dlx ----------
  const ARGS = ['x-max-length: 50000', 'x-overflow: reject-publish-dlx', 'x-dead-letter-exchange: dlx.exchange', 'x-dead-letter-routing-key: orders.dead'];
  function s4(t, c) { const { k, u } = c, q = c.beat.queue, pq = (c.prev && c.prev.queue) || q;
    xchg(600, 300, 'dlx.exchange', { type: 'direct', col: WARN, fill: WARNBG, s: k === 0 ? pop(u, 0.2) : 1 });
    const dlqIn = (k === 2 && u > 2.2) || k === 3 ? [{ t: 'm6', col: WARN, s: k === 2 ? pop(u, 2.2) : 1 }] : [];
    tube(700, 300, 230, 'dlq.orders', dlqIn, { slots: 3, grow: k === 0 ? E(u, 0.5, 1.0) : 1 });
    el('line', { x1: 666, y1: 300, x2: 700, y2: 300, stroke: WARN, 'stroke-width': 2.5, opacity: k === 0 ? fade(u, 1.0) : 1 });
    mono(683, 342, 'orders.dead', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: k === 0 ? fade(u, 1.2) : 1 });
    if (k === 3) { // 세 정책 비교
      [['drop-head', '가장 오래된 m1이 밀려남', 'DLX 있으면 maxlen으로 이동, 없으면 소멸', ACC], ['reject-publish', '새 m6 거절 · basic.nack', '새 메시지는 어디에도 남지 않는다', BAD], ['reject-publish-dlx', '새 m6 거절 · basic.nack', 'm6는 DLX로 가서 dlq.orders에 남는다', GOOD]].forEach(([n, a, bb, col], i) => {
        const y = 60 + i * 72, s = pop(u, 0.2 + i * 0.4); card(270, y, 500, 62, { rx: 10, stroke: col, sw: 2, s });
        mono(36, y - 6, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.4) });
        tx(250, y - 6, a, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }); tx(36, y + 18, bb, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); });
      sub(270, 290, 'quorum queue는 reject-publish-dlx를 지원하지 않는다', fade(u, 1.8), { 'font-weight': 700, fill: WARN });
      sub(270, 316, '새 것을 거절하면서 남기는 것은 -dlx뿐', fade(u, 2.1), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    node(60, 110, 'P', 'Producer', { op: k === 0 ? 0.4 : 1 });
    const used = Math.round(tween(pq.used, q.used, u, 1.2));
    tube(150, 110, 380, 'orders.queue', k === 0 ? [] : fillN(used, 'm', used >= q.capacity ? WARN : ACC), { slots: q.capacity, op: k === 0 ? 0.35 : 1, dash: k === 0 ? '6 5' : null });
    if (k === 0) { sub(340, 170, '아직 선언 전 · 받을 곳부터 만든다', fade(u, 1.4), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    wall(150, 110, 44, null, 1);
    if (k === 1) { el('rect', { x: 40, y: 200, width: 470, height: 140, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.2) });
      mono(56, 224, 'Map<String, Object> args2', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      ARGS.forEach((a, i) => mono(56, 254 + i * 24, a, { 'font-size': 14.5, 'font-weight': i === 1 ? 800 : 600, fill: i === 1 ? GOOD : INK, opacity: fade(u, 0.5 + i * 0.35) }));
      wire([[340, 200], [340, 136]], E(u, 1.9, 2.3), INK); return; }
    // 2: 꽉 찬 큐에 m6 → 거절 + DLX
    if (u > 0.2 && u < 0.8) { const [x, y] = at([[86, 110], [142, 110]], E(u, 0.2, 0.8)); tok(x, y - 40, 'm6', { col: BAD }); }
    if (u >= 0.8) cross(126, 110, 9, pop(u, 0.8));
    fly(140, 196, 70, 196, seg(u, 1.0, 1.7), 'basic.nack', { fill: BAD, mono: true, stay: true });
    if (u > 1.2 && u < 2.2) { const [x, y] = at([[146, 150], [146, 230], [600, 230], [600, 272]], E(u, 1.2, 2.2)); tok(x, y, 'm6', { col: WARN }); }
    wire([[146, 150], [146, 230], [580, 230], [580, 270]], E(u, 1.1, 1.6), WARN, { dash: '6 5' });
    if (u > 2.2) pill(815, 360, 'x-death reason = maxlen', WARN, pop(u, 2.3), { fs: 14, mono: true }); }

  // ---------- 5. 운영: 정책 그물 · depth 알람 · 메모리 ----------
  const QN = ['metrics.cpu', 'orders.kr', 'media.img', 'temp.session.42', 'billing.audit'];
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { // 정책이 어느 큐에 붙나
      const P = [['metrics-limit', '^metrics\\.', 5, 80], ['orders-limit', '^orders\\.', 5, 140], ['media-limit', '^media\\.', 5, 200], ['temp-expire', '^temp\\.', 10, 260], ['default-guard', '.*', 0, 340]];
      const win = [0, 1, 2, k === 1 ? 3 : 4, 4];
      QN.forEach((n, i) => { const y = 80 + i * 60; tube(40, y, 230, '', [], { slots: 1, h: 36 }); mono(56, y + 5, n, { 'font-size': 14, 'font-weight': 700 }); });
      P.forEach(([n, pat, pr, y], j) => { if (j === 3 && k === 0) return; const isG = j === 4, s = isG && k === 0 ? pop(u, 0.2) : j === 3 ? pop(u, 0.3) : 1;
        card(640, y, 260, 44, { rx: 10, stroke: isG ? MUT : j === 3 ? WARN : GRID, sw: isG || j === 3 ? 2.5 : 1.5, s, fill: isG ? SOFT : PANEL });
        mono(522, y + 5, n, { 'font-size': 14, 'font-weight': 700, opacity: s > 0.9 ? 1 : 0 }); mono(760, y + 5, `p${pr}`, { 'font-size': 14, 'font-weight': 800, fill: pr === 10 ? WARN : pr === 0 ? MUT : INFO, 'text-anchor': 'end', opacity: s > 0.9 ? 1 : 0 }); });
      QN.forEach((n, i) => { const y = 80 + i * 60, j = win[i], ty = P[j][3], fresh = (k === 0 && j === 4) || (k === 1 && i === 3);
        wire([[272, y], [508, ty]], fresh ? E(u, 0.6 + i * 0.15, 1.1 + i * 0.15) : 1, j === 4 ? MUT : j === 3 ? WARN : INFO, { sw: fresh ? 2.6 : 1.6 }); });
      if (k === 0) { sub(600, 392, 'billing.audit처럼 빠뜨린 큐도 상한을 받는다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); }
      else { sub(600, 380, 'temp. 큐에는 temp-expire 하나만 붙는다', fade(u, 1.5), { 'font-weight': 700, fill: WARN }); sub(600, 402, '그래서 max-length도 이 정책에 함께 넣었다', fade(u, 1.7), { 'font-weight': 700, fill: WARN }); }
      return; }
    if (k === 2) { // depth 80% 경보 (예시 값)
      const rows = [['orders.queue', 170000], ['metrics.cpu', 1200]], max = 200000, x0 = 230, W = 520, X = (v) => x0 + v / max * W;
      el('line', { x1: X(160000), y1: 60, x2: X(160000), y2: 200, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.2) });
      mono(X(160000), 52, 'THRESHOLD 160000', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      mono(X(max) + 6, 52, '200000', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2) });
      rows.forEach(([n, v], i) => { const y = 100 + i * 60, hot = v > 160000;
        mono(x0 - 12, y + 18, n, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end' });
        el('rect', { x: x0, y, width: W, height: 26, rx: 5, fill: SOFT }); el('rect', { x: x0, y, width: Math.max(3, (X(v) - x0) * E(u, 0.3 + i * 0.3, 1.2 + i * 0.3)), height: 26, rx: 5, fill: hot ? BAD : ACC, opacity: 0.75 }); });
      terminal(40, 250, 680, 80, ['[ALERT] queue orders.queue depth=170000 (>80%)'], u > 1.4 ? E(u, 1.4, 2.2) : 0, { title: 'awk 결과 · 예시 입력', fs: 14 });
      sub(480, 370, '상한에 닿기 전에 울려야 손쓸 시간이 생긴다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { // memory 기준 정렬 (예시 값)
      const rows = [['metrics.cpu', '1200', '95000000'], ['orders.queue', '170000', '9000000'], ['temp.session.42', '0', '30000']];
      const hx = [60, 330, 520];
      ['name', 'messages', 'memory ▼'].forEach((h, i) => mono(hx[i], 70, h, { 'font-size': 14.5, 'font-weight': 800, fill: i === 2 ? ACC : MUT, opacity: fade(u, 0.2) }));
      el('line', { x1: 50, y1: 82, x2: 700, y2: 82, stroke: GRID, 'stroke-width': 1.5 });
      rows.forEach((r, i) => { const y = 116 + i * 40, op = fade(u, 0.4 + i * 0.3); if (i === 0) el('rect', { x: 50, y: y - 24, width: 650, height: 34, rx: 6, fill: ACCBG, opacity: op });
        r.forEach((v, j) => mono(hx[j], y, v, { 'font-size': 14.5, 'font-weight': j === 2 || i === 0 ? 700 : 500, opacity: op })); });
      card(820, 140, 220, 110, { rx: 12, stroke: GRID, sw: 1.5, s: pop(u, 1.4) });
      mono(820, 120, 'sort -k3 -n -r', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      tx(820, 148, '3번째 열 memory로', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); tx(820, 172, '-k2면 messages 기준이 된다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.7) });
      terminal(40, 270, 660, 80, ['$ rabbitmqctl status | grep -A3 "memory"'], E(u, 1.8, 2.4), { title: 'bash', fs: 14 });
      sub(820, 300, '예시 입력', fade(u, 1.5), { 'font-weight': 700 }); return; }
    // 4: 체크리스트
    ['모든 큐에 max-length 또는 max-length-bytes', '데이터 성격별 overflow (로그 drop-head · 주문 reject*)', '임시 큐는 x-expires로 자동 삭제', 'Policy로 관리해 재배포 없이 조정', '큐 depth 80% 알람'].forEach((s, i) => { const y = 70 + i * 62, a = 0.2 + i * 0.4;
      card(480, y, 640, 48, { rx: 10, stroke: GRID, sw: 1.5, s: pop(u, a) });
      el('rect', { x: 180, y: y - 12, width: 24, height: 24, rx: 5, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, a) }); check(192, y, 9, pop(u, a + 0.3));
      tx(220, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, a + 0.1) }); }); }

  const quiz = [
    { q: 'x-expires=30000을 건 temp.session.42 큐에서 30초 뒤 사라지는 것은 무엇인가?',
      o: ['30초 넘게 머문 메시지만', '아무도 쓰지 않은 큐 자체', '컨슈머 연결'], a: 1,
      why: 'x-expires는 큐의 수명이다. 컨슈머도 basic_get도 없이 30초가 지나면 큐가 통째로 지워지고 남은 메시지도 함께 사라진다.' },
    { q: 'x-max-length와 x-max-length-bytes를 함께 걸면 overflow는 언제 발동하나?',
      o: ['둘 중 하나라도 넘으면', '둘 다 넘어야', '건수 쪽만 본다'], a: 0,
      why: '두 상한 중 먼저 닿는 쪽이 상한이 된다. 큰 메시지를 다루는 큐는 건수보다 바이트가 먼저 찬다.' },
    { q: '꽉 찬 orders.* 큐(reject-publish)에 새 메시지를 publish하면 producer는 어떻게 거절을 알게 되나?',
      o: ['큐의 가장 오래된 메시지가 대신 지워진다', '알 방법이 없다', 'publisher confirm을 켜 두면 basic.nack를 받는다'], a: 2,
      why: 'reject-publish는 새 메시지를 받지 않는다. confirm을 켠 producer만 nack로 거절을 알고 속도를 줄이거나 다시 시도할 수 있다.' },
    { q: 'reject-publish와 reject-publish-dlx의 차이는 무엇인가?',
      o: ['-dlx는 오래된 메시지를 지운다', '-dlx는 거절한 새 메시지를 DLX로 보내 남긴다', '-dlx는 producer에게 nack를 보내지 않는다'], a: 1,
      why: '둘 다 새 메시지를 거절하고 nack를 보낸다. -dlx는 그 메시지를 reason=maxlen으로 dead letter 해 dlq.orders에 남긴다.' },
    { q: '".*" 패턴의 default-guard(우선순위 0)와 ^temp\\. 패턴의 temp-expire(우선순위 10)가 둘 다 temp.session.42에 맞으면 무엇이 붙나?',
      o: ['temp-expire 하나만', '두 정책이 합쳐져서', 'default-guard 하나만'], a: 0,
      why: '큐에는 정책이 하나만 붙고 우선순위가 높은 쪽이 이긴다. 그래서 temp-expire 정의에 max-length도 함께 넣었다.' },
  ];

  const summary = [
    '상한이 없는 큐는 컨슈머가 멈추면 끝없이 쌓여 메모리 알람과 publish 차단까지 간다.',
    'x-max-length와 x-max-length-bytes는 먼저 닿는 쪽이 상한이 되고, 넘치면 overflow가 처리한다.',
    'drop-head는 오래된 것을 밀어내고, reject-publish는 새 것을 거절하며 -dlx는 그것을 DLQ에 남긴다.',
    '임시 큐는 x-expires로 치우고, 상한은 정책으로 걸어 depth 80%에서 알람을 울린다.',
  ];
  const review = [
    { q: '결제 큐에 상한만 걸고 overflow를 정하지 않았더니 오래된 결제 요청이 사라졌다. 고칠 방법으로 알맞은 것은?',
      o: ['x-max-length를 더 작게 잡는다', 'overflow를 reject-publish-dlx로 바꾸고 DLX를 건다', 'x-expires를 건다'], a: 1,
      why: 'overflow 기본값은 drop-head라 오래된 것부터 밀려난다. 결제처럼 전부 소중하면 새 것을 거절하고 DLQ에 남기는 -dlx가 맞다.' },
    { q: '메시지 하나가 수 MB인 media 큐에 x-max-length 100000만 걸었는데 메모리 알람이 났다. 먼저 손볼 것은?',
      o: ['max-length-bytes 상한을 함께 건다', 'consumer prefetch를 늘린다', 'overflow를 drop-head로 바꾼다'], a: 0,
      why: '큰 메시지는 건수보다 바이트가 먼저 찬다. 바이트 상한이 실제 방어선이 된다.' },
    { q: '세션이 끝난 뒤에도 temp. 큐 수천 개가 남아 브로커가 느려졌다. 가장 알맞은 대응은?',
      o: ['각 큐에 x-message-ttl을 건다', '모든 큐에 x-max-length를 건다', '^temp\\. 패턴에 expires 정책을 건다'], a: 2,
      why: '메시지가 아니라 빈 큐가 쌓인 문제다. expires 정책이면 다시 선언하지 않고도 쓰지 않는 temp. 큐를 지운다.' },
  ];

  R.page({ title: '큐 수명과 길이 상한', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
