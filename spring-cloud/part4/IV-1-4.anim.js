/* IV-1-4 Bulkhead — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 칸 수(used·queued·rejected·cap)는 beat 데이터의 pools / sharedPool을 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, clock, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const SC = [INFO, GOOD, BAD];                 // catalog · user · payment
  const NAME = ['catalog', 'user', 'payment'];
  const pv = (c, i, f) => { const p = c.prev && c.prev.pools && c.prev.pools[i]; return p && c.prev.pools[i].mode === c.beat.pools[i].mode ? p[f] : null; };
  const tw0 = (c, i, f) => Math.round(tween(pv(c, i, f), c.beat.pools[i][f], c.u));

  // 배: 칸막이 수 parts, 물 높이 levels[0..1]
  function ship(x, y, w, h, levels, parts) { const n = levels.length, cw = w / n;
    el('path', { d: `M${x},${y} L${x + w},${y} L${x + w - 30},${y + h} L${x + 30},${y + h} Z`, fill: PANEL, stroke: INK, 'stroke-width': 3 });
    if (!parts) { const lv = levels[0]; if (lv > 0) { const top = y + h - h * lv; el('path', { d: `M${x + 30 * lv},${top} L${x + w - 30 * lv},${top} L${x + w - 30},${y + h - 2} L${x + 30},${y + h - 2} Z`, fill: INFO, opacity: 0.35 }); } return; }
    levels.forEach((lv, i) => { if (lv <= 0) return; const top = y + h - h * lv; el('rect', { x: x + i * cw + (i === 0 ? 30 * lv : 2), y: top, width: cw - (i === 0 || i === n - 1 ? 30 * lv : 0) - 4, height: y + h - top - 2, fill: INFO, opacity: 0.35 }); });
    if (parts) for (let i = 1; i < n; i++) el('line', { x1: x + i * cw, y1: y, x2: x + i * cw, y2: y + h, stroke: INK, 'stroke-width': 3 }); }

  // ---------- 1. 공용 워커 200 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, sp = b.sharedPool, used = Math.round(tween(c.prev && c.prev.sharedPool ? c.prev.sharedPool.used : null, sp.used, u));
    if (k === 3) { ship(160, 110, 640, 170, [1, 1, 1].map((v) => v * E(u, 0.2, 1.8)), false);
      ['catalog', 'user', 'payment'].forEach((n, i) => tx(160 + 107 + i * 213, 96, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: SC[i] }));
      tx(480, 320, '칸막이가 없으면 한 곳에 든 물이 배 전체를 채운다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      pill(480, 370, '헬스체크 실패 → 인스턴스 제외', BAD, pop(u, 2.0), { fs: 14 }); return; }
    const gx = 90, gy = 150, cs = 19; tx(gx, gy - 14, '톰캣 워커 스레드 (threads.max 200, 공용)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    mono(gx + 20 * cs, gy - 14, `${used} / 200`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: used >= 200 ? BAD : INK });
    for (let i = 0; i < 200; i++) { const q = i % 20, r = Math.floor(i / 20), on = i < used;
      el('rect', { x: gx + q * cs, y: gy + r * cs, width: cs - 3, height: cs - 3, rx: 2, fill: on ? (k === 0 ? INK : BAD) : SOFT, opacity: on ? 0.8 : 1 }); }
    card(700, 120, 200, 48, { rx: 10, text: 'checkout()', fs: 15, mono: true, s: k === 0 ? pop(u, 0.2) : 1 }); card(700, 250, 200, 48, { rx: 10, text: 'payment-service', fs: 15, fw: 800, stroke: k >= 1 ? WARN : INK, color: k >= 1 ? WARN : INK });
    grow(700, 146, 700, 222, k === 0 ? E(u, 0.6, 1.2) : 1, MUT); mono(712, 190, 'getForObject (블로킹)', { 'font-size': 13.5, fill: MUT });
    if (k >= 1) { clock(830, 250, 18, k === 1 ? E(u, 0.2, 2.6) : 1, WARN); mono(830, 290, '5초', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN }); }
    if (k === 2) { banner(700, 340, '초당 40건 × 5초 = 200개', pop(u, 0.5));
      ['catalog', 'user'].forEach((n, i) => { const y = 390; pill(560 + i * 170, y, n + ' 요청 대기', SC[i], pop(u, 1.4 + i * 0.3), { fs: 13.5 }); }); }
    if (k === 0) sub(700, 340, '평소엔 12개만 쓴다 · 여유가 있으면 공용 풀이 가장 효율적', fade(u, 1.4), { 'font-size': 14 });
    if (k === 1) sub(700, 340, '응답이 올 때까지 워커가 반환되지 않는다', fade(u, 1.0), { 'font-size': 14.5, fill: INK }); }

  // ---------- 2. Semaphore: 서비스마다 칸 수 ----------
  function lanes(c, o) { o = o || {}; const b = c.beat, u = c.u;
    b.pools.forEach((p, i) => { const y = 80 + i * 92, cap = p.cap, cw = 21, x0 = 190, used = tw0(c, i, 'used');
      tx(x0 - 20, y + 20, NAME[i], { 'font-size': 16, 'font-weight': 800, fill: SC[i], 'text-anchor': 'end' });
      for (let j = 0; j < cap; j++) el('rect', { x: x0 + j * (cw + 3), y, width: cw, height: 30, rx: 4, fill: j < used ? SC[i] : PANEL, stroke: j < used ? 'none' : GRID, 'stroke-width': 1.5, opacity: j < used ? 0.75 : 1 });
      mono(x0 + cap * (cw + 3) + 10, y + 21, `${used}/${cap}`, { 'font-size': 15, 'font-weight': 800, fill: used >= cap ? BAD : INK });
      if (p.rejected) { const r = tw0(c, i, 'rejected'), ex = x0 + cap * (cw + 3); for (let j = 0; j < 3; j++) dot([[ex + 190, y - 8], [ex + 90, y + 15], [ex + 190, y + 38]], ((c.u * 0.8 + j / 3) % 1), BAD, 5);
        mono(ex + 210, y + 21, `거절 ${r}`, { 'font-size': 15, 'font-weight': 800, fill: BAD }); } }); }
  function s2(t, c) { const { k, u } = c;
    lanes(c);
    if (k === 0) { tx(190, 46, 'resilience4j.bulkhead.instances', { 'font-size': 15, class: 'mono', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.2) }); sub(480, 380, '서비스마다 세마포어를 따로 둔다 · 공용 워커 풀에 기대지 않는다', fade(u, 1.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { el('rect', { x: 186, y: 80 + 2 * 92 - 6, width: 10 * 24 + 4, height: 42, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      mono(190, 380, 'maxConcurrentCalls: 10', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) }); sub(640, 380, '요청이 아무리 밀려도 동시에 10개까지만', fade(u, 1.2), { 'font-size': 15 }); return; }
    if (k === 2) { mono(190, 380, 'maxWaitDuration: 0ms', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) }); pill(650, 380, 'BulkheadFullException', BAD, pop(u, 1.0), { mono: true, fs: 13.5 }); return; }
    if (k === 3) { sub(480, 380, 'catalog · user는 각자 25칸 · payment 포화와 상관없다', fade(u, 1.0), { 'font-size': 15, fill: INK }); return; }
    // k4: 칸 하나 = 톰캣 워커 하나가 응답까지 묶임
    for (let j = 0; j < 10; j++) { const x = 190 + j * 24 + 10, v = E(u, 0.3 + j * 0.08, 0.9 + j * 0.08);
      el('line', { x1: x, y1: 80 + 2 * 92 + 30, x2: x, y2: lerp(80 + 2 * 92 + 30, 340, v), stroke: BAD, 'stroke-width': 2 }); if (v >= 1) el('circle', { cx: x, cy: 348, r: 7, fill: BAD }); }
    tx(190, 384, '톰캣 워커 10개는 payment 응답까지 그대로 묶여 있다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); }

  // ---------- 3. ThreadPool: 서비스별 풀 + 큐 ----------
  function poolBox(c, i, x, y) { const p = c.beat.pools[i], used = tw0(c, i, 'used'), q = tw0(c, i, 'queued'), col = SC[i];
    zone(x, y, 280, 240, NAME[i] + '-pool', { fill: SOFT, color: col });
    for (let j = 0; j < p.cap; j++) { const cx = x + 30 + (j % 5) * 52, cy = y + 60 + Math.floor(j / 5) * 46; el('circle', { cx, cy, r: 17, fill: j < used ? col : PANEL, stroke: col, 'stroke-width': 2, opacity: j < used ? 0.8 : 1 }); }
    tx(x + 14, y + 150, `스레드 ${used}/${p.cap}`, { 'font-size': 14, 'font-weight': 700, class: 'mono' });
    const qw = Math.min(13, 250 / p.qcap - 2);
    for (let j = 0; j < p.qcap; j++) el('rect', { x: x + 14 + j * (qw + 2), y: y + 166, width: qw, height: 22, rx: 2, fill: j < q ? WARN : PANEL, stroke: j < q ? 'none' : GRID, opacity: j < q ? 0.8 : 1 });
    tx(x + 14, y + 210, `큐 ${q}/${p.qcap}`, { 'font-size': 14, 'font-weight': 700, class: 'mono' });
    if (p.rejected) mono(x + 266, y + 210, `거절 ${tw0(c, i, 'rejected')}`, { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); }
  function s3(t, c) { const { k, u } = c;
    [2, 0, 1].forEach((i, n) => poolBox(c, i, 30 + n * 310, 40));
    if (k === 0) { sub(480, 330, 'thread-pool-bulkhead · 세마포어와 다른 설정 트리', fade(u, 0.6), { 'font-size': 15, fill: INK });
      fly(170, 400, 170, 300, seg(u, 1.0, 1.8), '톰캣 워커 → 위임', { fill: INK }); return; }
    if (k === 1) { banner(480, 340, '스레드 5개가 다 차면 거절이 아니라 큐로', pop(u, 1.2)); return; }
    if (k === 2) { sub(480, 330, 'payment 큐가 가득 차도 catalog · user는 자기 풀에서 돈다', fade(u, 1.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { banner(480, 340, 'payment 최대 부담 = 스레드 5 + 큐 10 = 15', pop(u, 0.8));
      for (let j = 0; j < 3; j++) dot([[170, 300], [170, 268], [330, 300]], seg(u, 0.3 + j * 0.4, 1.0 + j * 0.4), BAD, 6); return; }
    // k4: 워커는 바로 돌아간다
    person(120, 360, null, { s: 0.8 }); fly(160, 350, 260, 300, seg(u, 0.3, 1.0), '작업 넘김', { fill: INK });
    fly(260, 330, 160, 380, seg(u, 1.1, 1.8), '바로 반환', { fill: GOOD }); if (u > 1.8) check(80, 330, 10, pop(u, 1.8));
    sub(620, 370, '대신 반환 타입은 CompletableFuture 여야 한다', fade(u, 1.8), { 'font-size': 15, fill: INK }); }

  // ---------- 4. @Bulkhead + @TimeLimiter + fallback ----------
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { poolBox(c, 2, 620, 40);
      if (k === 0) { [['@Bulkhead(type = THREADPOOL,', ACC], ['          fallbackMethod = "payFallback")', ACC], ['@TimeLimiter(name = "paymentService")', INFO], ['CompletableFuture<String> pay(orderId)', INK]].forEach(([s, col], i) =>
          mono(40, 90 + i * 34, s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.3 + i * 0.35) }));
        sub(300, 300, 'name은 yml의 paymentService와 정확히 같아야 한다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
      if (k === 1) { person(110, 200, '톰캣 워커', { s: 0.9 }); fly(150, 190, 600, 120, seg(u, 0.2, 1.2), 'pay(orderId)', { mono: true, fill: INK });
        fly(560, 230, 190, 250, seg(u, 1.3, 2.1), 'Future 즉시', { fill: GOOD, stay: true }); sub(330, 340, '느린 호출이 쌓이는 곳은 payment 풀 안쪽이다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
      for (let j = 0; j < 4; j++) fly(600, 300, 200, 120 + j * 50, seg(u, 0.3 + j * 0.35, 1.1 + j * 0.35), '{"status":"PENDING"}', { mono: true, fill: WARN, stay: true });
      sub(300, 360, '거절된 요청은 기다리지 않고 PENDING 응답', fade(u, 1.6), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { const x0 = 140, w = 640, X = (s) => x0 + (s / 5) * w;
      el('line', { x1: x0, y1: 300, x2: x0 + w, y2: 300, stroke: MUT, 'stroke-width': 1.8 }); for (let s = 0; s <= 5; s++) mono(X(s), 322, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      const v = lerp(0, 5, E(u, 0.2, 2.6));
      tx(x0 - 12, 128, '호출자', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x: x0, y: 110, width: X(Math.min(v, 2)) - x0, height: 30, rx: 4, fill: INFO, opacity: 0.75 });
      tx(x0 - 12, 218, '풀 스레드', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x: x0, y: 200, width: X(v) - x0, height: 30, rx: 4, fill: BAD, opacity: 0.7 });
      el('line', { x1: X(2), y1: 90, x2: X(2), y2: 300, stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '5 3' }); tx(X(2), 82, 'timeoutDuration 2s', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
      if (v > 2) { pill(X(2) + 90, 125, 'fallback', ACC, pop(u, 1.2), { mono: true, fs: 13.5 }); }
      if (v >= 5) tx(X(5), 192, 'payment 응답 (5초)', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'end' });
      sub(480, 380, 'Future를 취소해도 실행 중인 스레드는 끊기지 않는다 · HTTP 타임아웃도 함께', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
    // k4: 세 겹
    [['fallback', '대체', WARN, 360], ['Bulkhead', '격리', ACC, 270], ['TimeLimiter', '절단', INFO, 180]].forEach(([n, d, col, w], i) => { const s = pop(u, 0.2 + i * 0.4);
      el('rect', { x: 340 - w / 2 * s, y: 210 - w / 2 * 0.8 * s, width: w * s, height: w * 0.8 * s, rx: 18, fill: 'none', stroke: col, 'stroke-width': 3 });
      mono(340 - w / 2 + 12, 210 - w * 0.4 + 22, n + ' · ' + d, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.4) }); });
    card(340, 230, 120, 44, { rx: 10, text: 'payment', fs: 15, fw: 800, stroke: BAD, color: BAD });
    person(780, 200, '톰캣 워커', {}); check(830, 150, 12, pop(u, 1.8));
    sub(760, 300, '장애가 워커까지 올라오지 못한다', fade(u, 1.9), { 'font-size': 15, fill: INK }); }

  // ---------- 5. 정리 ----------
  function s5(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { ship(160, 80, 640, 170, [1, 1, 1].map((v) => v * E(u, 0.2, 1.6)), false);
      sub(480, 310, '최악의 경우 이 서비스가 얼마나 먹느냐에 아무도 답할 수 없다', fade(u, 1.6), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { [['SemaphoreBulkhead', '동시 호출 수만 센다 · 가볍다', 'maxConcurrentCalls'], ['ThreadPoolBulkhead', '전용 풀 + 큐 · 워커를 놓아 준다', 'maxThreadPoolSize · queueCapacity']].forEach(([n, d, key], i) => {
        const x = 250 + i * 460, s = pop(u, 0.3 + i * 0.5); card(x, 200, 400, 170, { rx: 14, stroke: i ? ACC : INFO, sw: 2.5, s });
        mono(x, 150, n, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: i ? ACC : INFO, opacity: fade(u, 0.4 + i * 0.5) });
        tx(x, 196, d, { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.5) }); mono(x, 240, key, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6 + i * 0.5) }); });
      sub(480, 340, '블로킹 I/O를 떼어내야 하면 ThreadPool, 동시성만 묶으면 Semaphore', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    const pay = b.pools[2], used = tw0(c, 2, 'used'), q = tw0(c, 2, 'queued'), rej = tw0(c, 2, 'rejected');
    if (k <= 3) { poolBox(c, 2, 40, 40); poolBox(c, 0, 340, 40); poolBox(c, 1, 640, 40);
      if (k === 2) { for (let j = 0; j < 3; j++) fly(180, 280, 110 + j * 110, 340, seg(u, 0.4 + j * 0.3, 1.0 + j * 0.3), 'PENDING', { fill: WARN, stay: true }); sub(680, 340, '거절은 실패가 아니라 설계다', fade(u, 1.6), { 'font-size': 15, fill: INK }); }
      if (k === 3) { ['TimeLimiter 절단', 'Bulkhead 격리', 'CircuitBreaker 반복 실패 차단', 'fallback 대체'].forEach((s, i) => pill(130 + i * 230, 330, s, i === 2 ? BAD : ACC, pop(u, 0.3 + i * 0.3), { fs: 13.5 }));
        sub(480, 380, '회로가 반복 실패를 끊으면 격벽 칸이 헛되이 차지 않는다', fade(u, 1.8), { 'font-size': 15, fill: INK }); }
      return; }
    // k4: 칸막이 있는 배
    ship(160, 70, 640, 170, [0, 0, E(u, 0.2, 1.4) * 0.8], true);
    ['catalog', 'user', 'payment'].forEach((n, i) => tx(160 + 107 + i * 213, 58, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: SC[i] }));
    tx(480, 300, '격리는 장애를 없애지 않고 한 칸에 가둔다', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    sub(480, 345, '예측 가능한 부분 저하 > 예측할 수 없는 전체 마비', fade(u, 1.8), { 'font-size': 15, fill: INK }); }

  const quiz = [
    { q: 'payment가 5초씩 느리고 초당 40건이 들어오면 톰캣 워커 200개가 모두 차는 이유는 무엇인가?',
      o: ['40건 × 5초 = 200개의 스레드가 응답을 기다리며 동시에 묶이기 때문이다', 'payment가 order의 스레드를 빼앗아 가기 때문이다', '톰캣이 느린 요청을 두 번씩 처리하기 때문이다'], a: 0,
      why: '블로킹 호출은 응답이 올 때까지 워커를 놓지 않는다. 초당 40건이 5초씩 머물면 동시에 200개가 묶인다.' },
    { q: 'maxConcurrentCalls 10, maxWaitDuration 0ms인 세마포어 격벽에 11번째 동시 호출이 오면 어떻게 되는가?',
      o: ['빈 칸이 날 때까지 기다린다', '즉시 BulkheadFullException으로 거절된다', 'catalog의 칸을 빌려 쓴다'], a: 1,
      why: '대기 시간이 0이라 칸이 없으면 기다리지 않고 바로 거절된다. 그래서 payment에 묶이는 워커는 10개를 넘지 않는다.' },
    { q: '스레드 5, 큐 10인 ThreadPoolBulkhead에서 payment가 최악의 경우 차지하는 작업 수는?',
      o: ['5', '10', '15'], a: 2,
      why: '스레드 5개에서 실행되고 큐 10칸에서 기다리는 것까지가 전부다. 16번째부터는 거절되므로 최대 부담은 15다.' },
    { q: '@TimeLimiter(2s)가 붙은 ThreadPool 호출이 2초를 넘겼다. 풀 스레드는 어떻게 되는가?',
      o: ['TimeLimiter가 스레드를 인터럽트해 바로 돌려받는다', '호출자는 2초에 fallback을 받지만 풀 스레드는 HTTP 응답이 올 때까지 묶여 있다', '풀 전체가 다시 시작된다'], a: 1,
      why: 'CompletableFuture 취소는 실행 중인 스레드를 끊지 않는다. 풀 스레드를 빨리 돌려받으려면 HTTP 클라이언트 타임아웃도 건다.' },
    { q: 'CircuitBreaker를 Bulkhead와 함께 쓰면 좋은 이유는 무엇인가?',
      o: ['반복 실패를 회로가 끊어 격벽 칸이 헛되이 차지 않는다', '격벽 칸 수가 두 배로 늘어난다', 'fallback이 필요 없어진다'], a: 0,
      why: '이미 죽은 서비스로 가는 호출을 회로가 먼저 끊으면 칸이 빨리 비어 회복이 빠르다. 이 장의 예에서 거절이 6건에서 1건으로 준다.' },
  ];

  const summary = [
    'payment가 5초씩 느리면 초당 40건만으로 공용 톰캣 워커 200개가 모두 묶인다.',
    '세마포어 격벽은 payment 동시 호출을 10개로 묶지만, 그 10개 워커는 응답까지 그대로 잡혀 있다.',
    '스레드풀 격벽은 전용 스레드 5개와 큐 10칸으로 최대 부담을 15로 고정하고 워커를 바로 돌려준다.',
    'TimeLimiter와 fallback, CircuitBreaker를 겹치면 장애가 payment 칸 안에만 머문다.',
  ];
  const review = [
    { q: '세마포어 격벽을 붙였는데도 payment가 느려질 때 다른 API 응답이 같이 느려졌다. 다음으로 할 일은?',
      o: ['maxConcurrentCalls를 200으로 올린다', '격벽을 지우고 공용 풀로 돌린다', 'ThreadPoolBulkhead로 바꿔 블로킹 호출을 워커 밖으로 옮긴다'], a: 2,
      why: '세마포어는 수만 셀 뿐 호출 스레드를 그대로 쓴다. 느린 블로킹 호출을 전용 풀로 넘겨야 워커가 바로 풀린다.' },
    { q: 'ThreadPool 격벽 + TimeLimiter 2초를 걸었는데 장애 중 payment 풀의 큐가 계속 꽉 차 있다. 먼저 의심할 것은?',
      o: ['RestTemplate에 읽기 타임아웃이 없어 풀 스레드가 응답까지 묶여 있다', 'fallbackMethod 이름이 틀렸다', 'catalog 풀이 payment 큐를 차지했다'], a: 0,
      why: 'TimeLimiter는 호출자만 2초에 놓아 준다. 풀 스레드는 HTTP 응답이 올 때까지 일하므로 클라이언트 타임아웃이 있어야 빨리 빈다.' },
    { q: 'payment 장애로 BulkheadFullException이 쏟아질 때 사용자에게 가장 알맞은 응답은?',
      o: ['500 에러를 그대로 보여 준다', 'fallback으로 PENDING을 돌려주고 나중에 확정한다', '격벽이 빌 때까지 요청을 붙잡고 기다린다'], a: 1,
      why: '거절은 설계된 부분 저하다. 기다리게 하면 다시 스레드가 쌓이므로 바로 PENDING을 주고 뒤에서 처리한다.' },
  ];

  R.page({ title: '서비스별 격리 풀 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
