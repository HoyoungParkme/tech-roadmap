/* II-2-2 Circuit Breaker — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: 200 req/s·3초·Tomcat 200 스레드·대기열 100, CB 50%·창 20·최소 10·10초·시범 5건, Retry 3번(100·200ms), Bulkhead 20/50/30·100ms, timeout 2s 는 페이지 코드 값.
 * 스레드·대기열·거부 수(1초 200/200, 1.5초 대기열 100, 5초 거부 500), CB 가 20번째 호출에서 열림, 시범 5건 중 2건 실패 = 40% → CLOSED,
 * 최악 6.3초(2s×3 + 0.1 + 0.2)는 node 로 돌려 확인한 값. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, cells, person, cross, check, dbIcon, clock, hbar, lock, G } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function svc(cx, cy, name, o) { o = o || {}; const w = o.w || 170, h = o.h || 56;
    const g = card(cx, cy, w, h, { rx: 10, stroke: o.stroke || INK, fill: o.fill, sw: o.sw ?? 2.2, s: o.s, op: o.op, dash: o.dash });
    tx(0, o.sub ? -4 : 6, name, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 700, fill: o.color || o.stroke || INK }, g);
    if (o.sub) tx(0, 16, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.subCol || MUT, class: o.subMono ? 'mono' : null }, g);
    return g; }
  const ln = (x1, y1, x2, y2, col, o) => { o = o || {}; el('line', { x1, y1, x2, y2, stroke: col || GRID, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 칸 격자: n 칸, cols 열, 앞에서부터 fill 칸을 col 로 채움
  function grid(x, y, n, cols, fill, col, o) { o = o || {}; const sz = o.sz || 12, gp = o.gap ?? 2;
    for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), q = i % cols, on = i < fill;
      el('rect', { x: x + q * (sz + gp), y: y + r * (sz + gp), width: sz, height: sz, rx: 2, fill: on ? col : PANEL, stroke: on ? 'none' : GRID, 'stroke-width': 1, opacity: on ? 0.85 : 1 }); } }

  // ---------- 1. Cascade failure ----------
  // 200 req/s, 3초, 풀 200, 대기열 100 (node 시뮬레이션과 같은 식)
  function sim(t) { const arr = 200 * t, busy = Math.min(200, arr), q = clamp(200 * (t - 1), 0, 100), done = clamp(200 * (t - 3), 0, 200);
    return { busy, q, done, rej: Math.max(0, arr - busy - q - done), arr }; }
  function s1(t, c) { const { k, u } = c;
    const T = [0, lerp(0, 1, E(u, 0.2, 2.4)), lerp(1, 3, E(u, 0.2, 2.4)), lerp(3, 5, E(u, 0.2, 2.4)), 5][k], S = sim(T), hot = k >= 1 && k <= 3;
    const fDown = k === 3 && u > 1.6;
    svc(110, 70, 'frontend', { w: 150, stroke: fDown ? BAD : INK });
    svc(450, 70, 'order-service', { w: 190, stroke: k >= 2 && k <= 3 ? BAD : INK });
    svc(810, 70, 'payment', { w: 150, sub: hot || k === 4 ? '응답 3초' : '정상', subCol: hot ? WARN : MUT, stroke: hot ? WARN : INK });
    ln(185, 70, 355, 70, k === 3 ? BAD : MUT); ln(545, 70, 735, 70, hot ? WARN : MUT);
    if (k === 0) { pill(640, 44, 'timeout 없음', BAD, pop(u, 0.4), { fs: 13.5, fill: PANEL }); for (let i = 0; i < 4; i++) dot([[545, 70], [735, 70], [545, 70]], seg(u, 0.4 + i * 0.5, 1.2 + i * 0.5), GOOD, 6); }
    if (hot) for (let i = 0; i < 3; i++) { dot([[185, 70], [355, 70]], (t * 0.5 + i / 3) % 1, WARN, 5); dot([[545, 70], [735, 70]], (t * 0.5 + i / 3 + 0.15) % 1, WARN, 5); }
    // order 스레드 풀 200 = 20 × 10
    if (k <= 3) { tx(310, 124, 'order 스레드 풀 (Tomcat 기본 200)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      const nb = k === 0 ? Math.round(6 + 4 * Math.sin(t * 3)) : Math.round(S.busy);
      grid(310, 134, 200, 20, nb, k === 0 ? GOOD : BAD, { sz: 12, gap: 2 });
      mono(600, 196, Math.round(k === 0 ? nb : S.busy) + ' / 200', { 'font-size': 20, 'font-weight': 800, fill: k === 0 ? INK : BAD });
      tx(600, 172, '사용 중', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }); }
    if (k >= 1 && k <= 3) { mono(40, 150, 't = ' + T.toFixed(1) + 's', { 'font-size': 18, 'font-weight': 800, fill: INFO }); }
    if (k === 1) { clock(810, 150, 22, E(u, 0.2, 2.4), WARN, '3초 대기'); sub(450, 300, '들어오는 요청마다 스레드 하나가 3초씩 묶인다', fade(u, 1.8), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 2 || k === 3) { tx(40, 300, '대기열', { 'font-size': 14, 'font-weight': 700 });
      el('rect', { x: 100, y: 288, width: 200, height: 16, rx: 4, fill: SOFT }); el('rect', { x: 100, y: 288, width: 2 * S.q, height: 16, rx: 4, fill: WARN });
      mono(310, 301, Math.round(S.q) + ' / 100', { 'font-size': 14, 'font-weight': 700 });
      tx(40, 340, '거부', { 'font-size': 14, 'font-weight': 700, fill: BAD }); mono(100, 342, Math.round(S.rej) + '건', { 'font-size': 20, 'font-weight': 800, fill: BAD });
      tx(40, 380, '처리 완료', { 'font-size': 14, 'font-weight': 700, fill: GOOD }); mono(120, 382, Math.round(S.done) + '건', { 'font-size': 20, 'font-weight': 800, fill: GOOD });
      if (k === 2) { note(520, 300, '필요한 스레드 = 200 req/s × 3초 = 600', fade(u, 0.8)); note(520, 330, '있는 스레드 = 200', fade(u, 1.2), { fill: BAD });
        note(520, 360, '빠져나가는 속도 ≈ 67 req/s', fade(u, 1.8), { fill: WARN }); return; }
      // k3: frontend 로 번짐
      tx(470, 300, 'frontend 스레드', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      grid(470, 310, 60, 20, Math.round(lerp(0, 60, E(u, 0.6, 2.0))), BAD, { sz: 12, gap: 2 });
      if (fDown) { cross(110, 30, 10, pop(u, 1.6)); grow(355, 92, 185, 92, E(u, 1.6, 2.2), BAD); }
      note(470, 384, '아래가 막히면 위가 죽는다', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 0) { sub(450, 340, '상한 없이 기다리는 호출', fade(u, 1.6), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    // k4: 필요한 4가지
    [['Timeout', 640, 112, INFO], ['Circuit Breaker', 640, 160, ACC], ['Retry', 270, 112, GOOD], ['Bulkhead', 450, 200, WARN]].forEach(([s, x, y, col], i) => pill(x, y, s, col, pop(u, 0.3 + i * 0.35), { fs: 15, fill: PANEL }));
    grid(310, 250, 200, 40, 20, WARN, { sz: 10, gap: 2 }); sub(450, 330, '의존성마다 칸을 나눈다', fade(u, 1.6));
    note(480, 390, '다음 장면들이 이 넷을 하나씩 채운다', fade(u, 2.0), { 'text-anchor': 'middle' }); }

  // ---------- 2. Circuit Breaker 상태 ----------
  const ST = { CLOSED: [150, 92], OPEN: [810, 92], HALF: [480, 196] };
  function states(cur, o) { o = o || {};
    [['CLOSED', 'CLOSED', GOOD], ['OPEN', 'OPEN', BAD], ['HALF', 'HALF-OPEN', WARN]].forEach(([key, name, col]) => { const [x, y] = ST[key], on = cur === key;
      card(x, y, 150, 50, { rx: 25, text: name, fs: 16, fw: 800, stroke: col, color: on ? PANEL : col, fill: on ? col : PANEL, sw: 2.5, s: on ? 1 + R.bump(o.t || 0, o.at || 0) : 1 }); });
    grow(228, 92, 732, 92, 1, MUT); tx(480, 80, '실패율 ≥ 50%', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD });
    grow(770, 120, 560, 186, 1, MUT); tx(712, 168, o.wait || '10초 뒤', { 'font-size': 14, 'font-weight': 700, fill: WARN });
    grow(400, 186, 190, 120, 1, MUT); tx(170, 168, '시범 실패 < 50%', { 'font-size': 14, 'font-weight': 700, fill: GOOD }); }
  const WX = 142, cellX = (i) => WX + i * 34;
  function windowStrip(vals, o) { o = o || {}; tx(WX, 268, o.title || 'slidingWindowSize 20 · 최근 호출', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    for (let i = 0; i < 20; i++) { const v = vals[i]; el('rect', { x: cellX(i), y: 278, width: 30, height: 32, rx: 4, fill: v == null ? PANEL : v === 1 ? GOODBG : v === 2 ? WARNBG : BADBG, stroke: v == null ? GRID : v === 1 ? GOOD : v === 2 ? WARN : BAD, 'stroke-width': 1.6 });
      if (v === 0) cross(cellX(i) + 15, 294, 6, 1); if (v === 1) check(cellX(i) + 15, 294, 6, 1); if (v === 2) mono(cellX(i) + 15, 299, '2s', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700 }); } }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { states('CLOSED'); windowStrip([1, 1, 1, 2, 1, 1, 0].map((v, i) => (i < Math.floor(E(u, 0.2, 1.6) * 7) ? v : null)));
      note(WX, 350, 'failureRateThreshold 50 · 실패가 절반이면 연다', fade(u, 1.4)); note(WX, 380, 'slowCallDurationThreshold 2s · 2초 넘는 호출도 나쁜 호출로 센다', fade(u, 1.9), { fill: WARN }); return; }
    if (k === 1) { states('CLOSED', { wait: '10초 뒤' }); windowStrip([]);
      el('line', { x1: cellX(10) - 2, y1: 266, x2: cellX(10) - 2, y2: 320, stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.6) });
      tx(cellX(10) + 6, 336, 'minimumNumberOfCalls 10 · 이전엔 계산 안 함', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.7) });
      pill(480, 236, '시범 호출 5건', WARN, pop(u, 1.3), { fs: 13.5, fill: PANEL }); clock(860, 160, 16, E(u, 1.6, 2.6), WARN);
      note(WX, 384, '10초 쉬고, 5건만 흘려 보고, 최근 20건으로 판정', fade(u, 2.0)); return; }
    if (k === 2) { const n = Math.floor(lerp(0, 20, E(u, 0.2, 2.3))), vals = [], nn = Math.max(0, n);
      for (let i = 0; i < nn; i++) vals.push(i < 10 ? 1 : 0);
      const fails = Math.max(0, nn - 10), opened = nn >= 20;
      states(opened ? 'OPEN' : 'CLOSED', { t: u, at: 2.3 }); windowStrip(vals);
      pill(800, 236, '@CircuitBreaker', ACC, pop(u, 0.2), { fs: 13.5, mono: true, fill: PANEL });
      mono(WX, 352, `실패 ${fails} / ${nn} = ${nn >= 10 ? Math.round(fails / nn * 100) : '-'}%`, { 'font-size': 18, 'font-weight': 800, fill: opened ? BAD : INK });
      sub(640, 352, nn < 10 ? '10건 전에는 판정하지 않는다' : opened ? '20번째 호출에서 50% → OPEN' : '아직 50% 아래', 1, { fill: opened ? BAD : MUT, 'font-weight': 700, 'font-size': 14 }); return; }
    if (k === 3 || k === 5) { states('OPEN'); }
    if (k === 3) { for (let i = 0; i < 4; i++) { const a = 0.2 + i * 0.5; dot([[40, 300], [300, 300]], seg(u, a, a + 0.3), INK, 6); dot([[300, 300], [300, 380], [560, 380]], seg(u, a + 0.3, a + 0.7), WARN, 6); }
      card(300, 300, 150, 40, { rx: 8, text: 'payment 호출', fs: 13.5, stroke: OFF, color: OFF, dash: '5 4' }); cross(375, 284, 7, 1);
      card(620, 380, 130, 34, { rx: 6, text: 'outbox', fs: 14, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.5) });
      mono(620, 340, 'PendingPayment +' + Math.min(4, Math.floor((u - 0.2) / 0.5) + 1), { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.6) });
      pill(820, 380, 'pending 응답', GOOD, pop(u, 1.0), { fs: 13.5, fill: PANEL });
      sub(300, 250, '호출하지 않고 바로 fallback', fade(u, 0.4), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 4) { const toHalf = u > 0.5, done5 = u > 1.9; states(done5 && u > 2.2 ? 'CLOSED' : toHalf ? 'HALF' : 'OPEN', { t: u, at: 2.2 });
      const res = [1, 0, 1, 1, 0], n = Math.floor(lerp(0, 5, E(u, 0.6, 1.9)));
      tx(WX, 268, 'HALF-OPEN 시범 호출 5건', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 5; i++) { const v = i < n ? res[i] : null; el('rect', { x: cellX(i), y: 278, width: 30, height: 32, rx: 4, fill: v == null ? PANEL : v ? GOODBG : BADBG, stroke: v == null ? GRID : v ? GOOD : BAD, 'stroke-width': 1.6 });
        if (v === 0) cross(cellX(i) + 15, 294, 6, 1); if (v === 1) check(cellX(i) + 15, 294, 6, 1); }
      const f = res.slice(0, n).filter((x) => !x).length;
      mono(WX, 352, `실패 ${f} / ${n || 0}` + (n === 5 ? ' = 40% < 50%' : ''), { 'font-size': 18, 'font-weight': 800, fill: n === 5 ? GOOD : INK });
      sub(640, 352, n === 5 ? '→ CLOSED 로 돌아간다 (3건이면 60% → 다시 OPEN)' : '소량만 흘려 본다', 1, { fill: n === 5 ? GOOD : MUT, 'font-weight': 700, 'font-size': 14 }); return; }
    // k5: 효과
    const x0 = 250, W = 600;
    [['CB 없이 기다림', 3000, OFF, '3초'], ['OPEN 에서 fallback', 0.1, ACC, '0.1ms']].forEach(([s, v, col, lab], i) => { const y = 280 + i * 46, g = E(u, 0.3 + i * 0.5, 1.3 + i * 0.5);
      tx(x0 - 14, y + 17, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x: x0, y, width: Math.max(3, W * v / 3000 * g), height: 24, rx: 4, fill: col });
      mono(x0 + Math.max(3, W * v / 3000 * g) + 10, y + 18, lab, { 'font-size': 15, 'font-weight': 800, fill: i ? ACC : INK, opacity: fade(u, 0.9 + i * 0.5) }); });
    note(480, 395, '스레드를 잡지 않고, payment 는 회복할 틈을 얻는다', fade(u, 1.9), { 'text-anchor': 'middle', fill: GOOD }); }

  // ---------- 3. Resilience4j 모듈 ----------
  const RINGS = [['CircuitBreaker', ACC, 290, 96], ['RateLimiter', INFO, 360, 156], ['Retry', GOOD, 430, 216], ['Bulkhead', WARN, 500, 276]];
  function onion(n, u, k) { const cx = 290, cy = 220;
    for (let i = Math.min(n, 4) - 1; i >= 0; i--) { const [name, col, w, h] = RINGS[i], fresh = i === n - 1 && k === i, s = fresh ? pop(u, 0.2) : 1;
      card(cx, cy, w * (k === 5 ? 1 : 0.92), h, { rx: 18, stroke: col, fill: i % 2 ? SOFT : PANEL, sw: 2.5, s });
      tx(cx - w * (k === 5 ? 1 : 0.92) / 2 + 12, cy - h / 2 + 20, name, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: s }); }
    card(cx, cy + 6, 240, 38, { rx: 8, text: 'paymentClient.charge(cmd)', fs: 13.5, mono: true, stroke: INK, fill: PANEL }); }
  function s3(t, c) { const { k, u } = c, PX = 580;
    onion(k === 4 ? 4 : Math.min(k + 1, 4), u, k);
    if (k === 0) { R.snippet(PX, 70, ['CircuitBreaker cb =', '  CircuitBreaker.ofDefaults("payment");'], { fs: 13.5, op: fade(u, 0.5) });
      note(PX, 190, '객체로 만들어 어디에 감쌀지 코드가 정한다', fade(u, 1.2)); return; }
    if (k === 1) { tx(PX, 90, '1초 창 · limitForPeriod 100', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      const n = Math.round(lerp(0, 101, E(u, 0.3, 2.0))); grid(PX, 110, 100, 20, Math.min(n, 100), INFO, { sz: 14, gap: 2 });
      mono(PX, 220, Math.min(n, 100) + ' / 100', { 'font-size': 18, 'font-weight': 800, fill: INFO });
      if (n > 100) pill(PX + 230, 214, '101번째는 다음 1초까지 대기', WARN, pop(u, 2.0), { fs: 13.5, fill: PANEL });
      note(PX, 280, '내가 보내는 양을 스스로 묶는다', fade(u, 2.2)); return; }
    if (k === 2) { tx(PX, 70, '시도 3번 = 첫 호출 + 재시도 2번', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      const segs = [['1', 0, BAD], ['100ms', 1, MUT], ['2', 0, BAD], ['200ms', 1, MUT], ['3', 0, GOOD]];
      let x = PX; segs.forEach(([s, wait, col], i) => { const w = wait ? (s === '100ms' ? 60 : 110) : 46, a = 0.3 + i * 0.35, g = E(u, a, a + 0.3);
        if (wait) { el('line', { x1: x, y1: 120, x2: x + w * g, y2: 120, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); if (g > 0.9) mono(x + w / 2, 106, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
        else { card(x + w / 2, 120, w, 34, { rx: 6, text: s, fs: 15, fw: 800, mono: true, stroke: col, color: col, s: pop(u, a) }); }
        x += w + 6; });
      mono(PX, 180, 'IOException → 재시도', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(PX, 210, '그 밖의 예외 → 재시도 없음', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.6) });
      note(PX, 280, '간격을 2배씩 늘려 상대에게 숨 돌릴 틈을 준다', fade(u, 2.2)); return; }
    if (k === 3) { tx(PX, 70, 'maxConcurrentCalls 20', { 'font-size': 15, 'font-weight': 800, fill: WARN });
      const n = Math.round(lerp(0, 20, E(u, 0.2, 1.2))); grid(PX, 90, 20, 10, n, WARN, { sz: 22, gap: 4 });
      if (u > 1.3) { card(PX + 300, 102, 50, 30, { rx: 6, text: '21', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.3) }); clock(PX + 350, 102, 13, E(u, 1.5, 2.1), WARN); }
      if (u > 2.1) mono(PX, 190, 'BulkheadFullException', { 'font-size': 14.5, 'font-weight': 800, fill: BAD });
      sub(PX + 150, 222, '100ms 기다려도 자리가 없으면 실패', fade(u, 2.1), { fill: INK }); return; }
    if (k === 4) { tx(PX, 70, 'timeoutDuration 2s', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      const X = (s) => PX + 110 * s; el('line', { x1: PX, y1: 150, x2: X(3), y2: 150, stroke: MUT, 'stroke-width': 1.6 });
      [0, 1, 2, 3].forEach((s) => mono(X(s), 172, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      const g = E(u, 0.2, 1.8); el('rect', { x: PX, y: 110, width: Math.min(X(2), PX + 330 * g) - PX, height: 26, rx: 4, fill: WARN, opacity: 0.8 });
      if (g * 3 > 2) { el('rect', { x: X(2), y: 110, width: 110, height: 26, rx: 4, fill: 'none', stroke: OFF, 'stroke-dasharray': '4 4' }); el('line', { x1: X(2), y1: 96, x2: X(2), y2: 150, stroke: BAD, 'stroke-width': 3 }); tx(X(2) + 8, 96, '여기서 끊는다', { 'font-size': 14, 'font-weight': 700, fill: BAD }); }
      note(PX, 230, 'TimeLimiter 는 Future 를 돌려주는', fade(u, 1.9), { fill: MUT, 'font-size': 14 }); note(PX, 252, '비동기 호출에 붙어 이 동기 체인엔 없다', fade(u, 1.9), { fill: MUT, 'font-size': 14 }); return; }
    // k5: 합성
    R.snippet(PX, 60, ['Decorators.ofSupplier(supplier)', '  .withCircuitBreaker(cb)', '  .withRateLimiter(rateLimiter)', '  .withRetry(retry)', '  .withBulkhead(bulkhead)', '  .decorate();'], { fs: 13.5, op: fade(u, 0.2) });
    dot([[40, 220], [170, 220]], seg(u, 0.6, 1.6), INK, 7);
    note(PX, 260, '나중에 붙인 것이 바깥을 감싼다', fade(u, 1.4)); note(PX, 290, 'Bulkhead → Retry → RateLimiter → CB → 호출', fade(u, 1.8), { fill: ACC, 'font-size': 14 }); }

  // ---------- 4. Bulkhead (격벽) ----------
  const CMP = [['payment', 20, 2, BAD, 110], ['product', 50, 5, INFO, 360], ['inventory', 30, 3, GOOD, 610]];
  function hull() { el('path', { d: 'M70,120 H890 L860,320 Q480,350 100,320 Z', fill: SOFT, stroke: INK, 'stroke-width': 2.5 }); }
  function s4(t, c) { const { k, u } = c;
    hull(); tx(480, 106, 'order-service 의 호출 자원', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT });
    if (k === 0) { const n = Math.round(lerp(0, 200, E(u, 0.2, 1.6))); grid(200, 150, 200, 25, n, BAD, { sz: 18, gap: 3 });
      tx(200, 142, 'Tomcat 스레드 200 · 한 칸', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); mono(760, 142, n + ' / 200 payment', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
      for (let i = 0; i < 3; i++) { dot([[20, 380], [180, 380], [20, 380]], seg(u, 1.6 + i * 0.3, 2.2 + i * 0.3), INFO, 7); }
      if (u > 1.7) cross(200, 380, 9, 1); tx(220, 386, 'product 호출 거부', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) }); return; }
    const shown = k === 1 ? 1 : 3;
    CMP.slice(0, shown).forEach(([name, n, rows, col, x], i) => { const fresh = (k === 1 && i === 0) || (k === 2 && i > 0), s = fresh ? pop(u, 0.2 + i * 0.3) : 1;
      if (i > 0 || shown > 1) el('line', { x1: x - 18, y1: 126, x2: x - 18, y2: 330, stroke: INK, 'stroke-width': 3, opacity: s });
      let fill = 0; if (i === 0) fill = k === 3 ? Math.round(lerp(0, 20, E(u, 0.3, 2.0))) : k >= 4 ? 20 : 0;
      if (i > 0 && k >= 4) fill = Math.round(n * (0.3 + 0.25 * Math.sin(t * 2 + i)));
      tx(x, 148, name + ' ' + n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s });
      grid(x, 162, n, 10, fill, col, { sz: 18, gap: 4 });
      if (k >= 3 && (i === 0 || k >= 4)) mono(x, 300, fill + ' / ' + n, { 'font-size': 15, 'font-weight': 800, fill: col }); });
    if (k === 1) { el('line', { x1: 342, y1: 126, x2: 342, y2: 330, stroke: INK, 'stroke-width': 3 }); sub(600, 230, '나머지 자원은 다른 호출 몫', fade(u, 1.2), { 'font-size': 14.5 });
      note(110, 380, '자리가 없으면 100ms 만 기다린다 (maxWaitDuration)', fade(u, 1.6)); return; }
    if (k === 2) { note(110, 380, '빠르고 잦은 호출은 크게, 느린 호출은 작게 · 합 100', fade(u, 1.6)); return; }
    if (k === 3) { pill(220, 380, '@Bulkhead("payment", SEMAPHORE)', ACC, pop(u, 0.2), { fs: 13.5, mono: true, fill: PANEL });
      note(460, 386, '스레드를 새로 만들지 않고 숫자만 센다', fade(u, 1.6)); return; }
    if (k === 4) { note(110, 380, '이름이 다르면 카운터도 따로 · product 와 inventory 는 제 속도로 돈다', fade(u, 0.8)); return; }
    // k5: 21번째
    card(110 + 230, 380, 50, 30, { rx: 6, text: '21', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.3) }); clock(395, 380, 13, E(u, 0.5, 1.2), WARN);
    if (u > 1.2) mono(420, 386, 'BulkheadFullException', { 'font-size': 14.5, 'font-weight': 800, fill: BAD });
    for (let i = 0; i < 4; i++) dot([[360, 360], [560, 360]], (t * 0.7 + i / 4) % 1, INFO, 5);
    tx(110, 386, 'payment 꽉 참', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) });
    sub(740, 380, 'product 는 멀쩡하다', fade(u, 1.6), { fill: GOOD, 'font-weight': 700, 'font-size': 15 }); }

  // ---------- 5. 네 보호 한 세트 ----------
  const GATES = [['Retry', GOOD, 170], ['CircuitBreaker', ACC, 330], ['TimeLimiter', INFO, 490], ['Bulkhead', WARN, 650]];
  function gates(k, u, hot) { GATES.forEach(([n, col, x], i) => { const s = k === 0 ? pop(u, 0.2 + i * 0.3) : 1, on = hot === n;
      el('rect', { x: x - 60, y: 60, width: 120, height: 170, rx: 12, fill: on ? col : PANEL, 'fill-opacity': on ? 0.15 : 1, stroke: col, 'stroke-width': on ? 3.5 : 2.2, opacity: s });
      tx(x, 84, n, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col, opacity: s }); });
    svc(840, 145, 'payment', { w: 130, h: 60 }); ln(30, 150, 775, 150, MUT, { sw: 1.8, dash: '5 5' });
    card(170, 270, 110, 32, { rx: 6, text: 'fallback', fs: 13.5, mono: true, stroke: WARN, color: WARN, op: k === 0 ? fade(u, 1.6) : 1 });
    ln(170, 230, 170, 254, WARN, { op: k === 0 ? fade(u, 1.6) : 1 }); }
  function s5(t, c) { const { k, u } = c;
    const hot = [null, null, null, 'TimeLimiter', 'Retry', null, null][k] || (k === 5 ? null : null);
    gates(k, u, hot);
    if (k === 0) { sub(480, 330, '바깥부터 Retry → CircuitBreaker → TimeLimiter → Bulkhead (Spring Boot 기본 순서)', fade(u, 1.4), { fill: INK, 'font-weight': 700, 'font-size': 14 });
      sub(480, 360, 'fallback 은 가장 바깥 Retry 에 단다', fade(u, 1.9), { fill: WARN, 'font-weight': 700, 'font-size': 14.5 }); return; }
    const path = [[30, 150], [770, 150]];
    if (k === 1) { fly(30, 150, 770, 150, seg(u, 0.2, 1.0), 'key ord-42', { mono: true }); fly(30, 150, 770, 150, seg(u, 1.1, 1.9), 'key ord-42', { mono: true, fill: WARN });
      el('rect', { x: 600, y: 300, width: 330, height: 100, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      mono(616, 324, 'payment 쪽 key → 결과', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      if (u > 1.0) mono(616, 352, 'ord-42 → 결제 승인', { 'font-size': 14.5, 'font-weight': 700 });
      if (u > 1.9) mono(616, 380, 'ord-42 → 같은 결과 반환', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD });
      sub(300, 330, '재시도가 와도 한 번만 처리된다', fade(u, 2.0), { fill: GOOD, 'font-weight': 700, 'font-size': 15 }); sub(300, 356, 'ord-42 는 예시 주문 번호', fade(u, 1.0)); return; }
    if (k === 2) { dot([[30, 150], [770, 150]], seg(u, 0.1, 0.7), INK, 7); cross(770, 150, 9, pop(u, 0.7));
      dot([[170, 230], [170, 254]], seg(u, 0.9, 1.2), WARN, 7);
      card(380, 340, 200, 40, { rx: 6, text: 'outbox · PendingPayment', fs: 13.5, stroke: WARN, color: WARN, s: pop(u, 1.2) }); grow(226, 270, 278, 330, E(u, 1.2, 1.5), WARN);
      pill(640, 340, '응답: pending', GOOD, pop(u, 1.6), { fs: 14, fill: PANEL });
      sub(480, 400, '요청을 잃지 않고 나중에 처리한다', fade(u, 2.0), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 3) { const X = (s) => 120 + 220 * s; el('line', { x1: X(0), y1: 360, x2: X(3), y2: 360, stroke: MUT, 'stroke-width': 1.6 });
      [0, 1, 2, 3].forEach((s) => mono(X(s), 382, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      const g = E(u, 0.2, 1.8); el('rect', { x: X(0), y: 320, width: Math.min(X(2), X(0) + 660 * g) - X(0), height: 26, rx: 4, fill: INFO, opacity: 0.7 });
      if (g * 3 > 2) { el('line', { x1: X(2), y1: 306, x2: X(2), y2: 360, stroke: BAD, 'stroke-width': 3 }); tx(X(2) + 10, 312, 'timeoutDuration 2s', { 'font-size': 14, 'font-weight': 700, fill: BAD });
        el('rect', { x: X(2), y: 320, width: 220 * (g * 3 - 2), height: 26, rx: 4, fill: 'none', stroke: OFF, 'stroke-dasharray': '4 4' }); }
      sub(480, 412, 'Future 는 취소돼도 돌던 스레드는 남을 수 있어 HTTP 클라이언트 timeout 도 둔다', fade(u, 2.0), { fill: INK, 'font-size': 13.5 }); return; }
    if (k === 4) { const X = (ms) => 60 + 840 * ms / 6300, segs = [[0, 2000, '시도 1', INFO], [2000, 2100, '', MUT], [2100, 4100, '시도 2', INFO], [4100, 4300, '', MUT], [4300, 6300, '시도 3', INFO]];
      segs.forEach(([a, b, s, col], i) => { const g = E(u, 0.2 + i * 0.35, 0.5 + i * 0.35); if (g <= 0) return;
        el('rect', { x: X(a), y: 300, width: (X(b) - X(a)) * g, height: 28, rx: 4, fill: s ? INFOBG : WARNBG, stroke: s ? INFO : WARN, 'stroke-width': 1.5 });
        if (s && g > 0.9) tx((X(a) + X(b)) / 2, 319, s + ' · 최대 2s', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: INFO }); });
      mono(X(2050), 290, '100ms', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.6) }); mono(X(4200), 290, '200ms', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.3) });
      mono(900, 360, '최악 6.3초', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.1) });
      sub(300, 360, 'IOException · TimeoutException 만 다시 시도', fade(u, 1.8), { fill: INK, 'font-weight': 700 });
      sub(480, 400, '재시도는 대기 시간도 곱한다. timeout 과 함께 잡는다', fade(u, 2.3), { fill: MUT }); return; }
    if (k === 5) { [['실패율 50%', 330], ['10초 차단', 330], ['창 20건', 330], ['동시 20', 650], ['대기 100ms', 650]].forEach(([s, x], i) => {
        const y = 120 + (i < 3 ? i : i - 3) * 34; pill(x, y, s, x === 330 ? ACC : WARN, pop(u, 0.3 + i * 0.25), { fs: 13.5, fill: PANEL }); });
      sub(480, 340, '보호 설정은 yml 한 파일에, 운영 중에도 조정한다', fade(u, 1.8), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    // k6: 지나가는 순서
    dot([[30, 150], [770, 150]], seg(u, 0.1, 0.9), INK, 7);
    dot([[770, 150], [170, 190]], seg(u, 0.9, 1.3), BAD, 6);
    dot([[170, 190], [770, 190]], seg(u, 1.3, 1.8), INK, 6);
    dot([[170, 230], [170, 254]], seg(u, 1.9, 2.1), WARN, 7);
    card(380, 340, 200, 40, { rx: 6, text: 'outbox queue', fs: 14, mono: true, stroke: WARN, color: WARN, s: pop(u, 2.1) }); grow(226, 270, 278, 330, E(u, 2.1, 2.4), WARN);
    sub(700, 340, '하나라도 빠지면 그 지점이 뚫린다', fade(u, 2.2), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); }

  const quiz = [
    { q: 'payment가 3초씩 느려지고 order에 200 req/s가 들어올 때, Tomcat 기본 200 스레드는 언제 바닥나나?',
      o: ['3초 뒤, 첫 응답이 올 때', '1초 만에', '바닥나지 않는다'], a: 1,
      why: '필요한 스레드는 200 × 3초 = 600개인데 풀은 200개다. 첫 1초에 들어온 200건이 모두 3초씩 묶인다.' },
    { q: 'slidingWindowSize 20, minimumNumberOfCalls 10, 임계 50%에서 정상 10건 뒤 실패가 이어지면 회로는 언제 열리나?',
      o: ['20번째 호출에서 10/20 = 50%가 될 때', '첫 실패가 나자마자', '실패 20건이 쌓일 때'], a: 0,
      why: '최근 20건 중 실패가 절반에 닿는 순간 OPEN이다. node로 돌려 보면 20번째 호출에서 열린다.' },
    { q: 'IntervalFunction.ofExponentialBackoff(100ms, 2)에 maxAttempts 3이면 재시도 사이 대기는 어떻게 되나?',
      o: ['100, 200, 400ms', '100ms 한 번', '100ms, 200ms'], a: 2,
      why: 'maxAttempts는 첫 호출을 포함한 시도 수다. 시도 3번 사이의 대기는 두 번, 100ms와 200ms다.' },
    { q: 'payment 격벽이 20/20으로 찼을 때 product 호출은 어떻게 되나?',
      o: ['product도 같이 거부된다', '자기 칸 50개로 그대로 처리된다', 'payment가 빌 때까지 기다린다'], a: 1,
      why: '격벽 이름이 다르면 카운터도 따로다. payment의 21번째만 100ms 뒤 BulkheadFullException을 받는다.' },
    { q: 'Spring Boot에서 @Retry와 @CircuitBreaker를 함께 쓸 때 fallback은 어디에 달아야 재시도가 제대로 도나?',
      o: ['가장 바깥에서 감싸는 @Retry', '@CircuitBreaker', '@Bulkhead'], a: 0,
      why: '기본 순서는 Retry가 가장 바깥이다. 안쪽 CircuitBreaker가 fallback으로 결과를 돌려주면 Retry는 실패를 보지 못해 다시 시도하지 않는다.' },
  ];
  const summary = [
    'payment가 3초씩 느려지면 200 req/s에 스레드 600개가 필요해져 Tomcat 기본 200개가 1초 만에 바닥난다.',
    'Circuit Breaker는 최근 20건 중 절반이 실패하면 열려 0.1ms 만에 fallback하고, 10초 뒤 5건으로 회복을 본다.',
    'Bulkhead는 의존성마다 동시 호출 칸을 따로 둬서 payment가 막혀도 product는 제 칸으로 돈다.',
    'Retry는 첫 호출 포함 3번까지 100ms, 200ms를 쉬며 다시 시도하므로 timeout과 멱등키를 함께 둔다.',
  ];
  const review = [
    { q: 'payment 장애 때 order의 스레드 덤프를 보니 200개가 모두 payment 응답을 기다린다. 가장 먼저 넣을 방어는?',
      o: ['Retry 횟수 늘리기', 'payment 호출에 timeout', '스레드 풀을 1000으로 늘리기'], a: 1,
      why: '상한 없는 대기가 스레드를 묶는다. 풀을 늘려도 200 req/s × 3초 = 600개처럼 수요가 따라오므로 대기 상한부터 둔다.' },
    { q: '결제 재시도를 켠 뒤 고객 일부가 두 번 청구됐다. CB와 timeout 설정은 정상이다. 빠진 것은?',
      o: ['Bulkhead', '더 긴 waitDurationInOpenState', 'orderId로 만든 멱등키'], a: 2,
      why: 'timeout으로 끊긴 첫 요청이 payment에서는 처리됐을 수 있다. 같은 key로 다시 오면 payment가 이미 처리한 결과를 돌려준다.' },
    { q: 'payment가 완전히 멈추자, 회로가 열리기 전까지 order 응답이 6초 넘게 걸렸다. 가장 그럴듯한 이유는?',
      o: ['Retry가 2초 timeout 시도를 3번 거치며 기다렸다', 'Bulkhead 칸이 너무 컸다', 'fallback이 outbox에 저장하느라 느렸다'], a: 0,
      why: '2초 × 3번에 대기 100ms와 200ms를 더하면 최악 6.3초다. 회로가 열리면 그 뒤 호출은 바로 fallback으로 간다.' },
  ];

  R.page({ title: 'CB · Bulkhead 상태', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
