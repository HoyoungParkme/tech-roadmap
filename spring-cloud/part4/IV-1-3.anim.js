/* IV-1-3 Retry 지수 백오프 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 재시도 폭주 막대는 시뮬레이션 값이다: 1000 클라이언트가 t=0에 함께 실패하고 이후 시도도 실패한다고 두고,
 * 0.5초 칸마다 재시도 수를 셌다 (python random seed 7, jitter는 대기 × [0.5, 1.5] 균등). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, clock, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 0.5초 칸 번호 → 재시도 수 (sim.py 결과)
  const H_FIXED = { 2: 1000, 4: 1000 };
  const H_EXP = { 2: 1000, 6: 1000, 14: 1000 };
  const H_JIT = { 1: 519, 2: 481, 3: 78, 4: 215, 5: 244, 6: 239, 7: 167, 8: 91, 9: 46, 10: 79, 11: 91, 12: 116, 13: 148, 14: 123, 15: 127, 16: 93, 17: 81, 18: 44, 19: 17, 20: 1 };
  function hist(x, y, w, h, H, u, col, o) { o = o || {}; const n = 20, bw = w / n;
    el('line', { x1: x, y1: y + h, x2: x + w, y2: y + h, stroke: MUT, 'stroke-width': 1.8 });
    for (let i = 0; i <= 10; i += 2) mono(x + i * 2 * bw, y + h + 18, i + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    Object.keys(H).forEach((b) => { const v = H[b], bh = h * v / 1000 * clamp(u * 1.6 - (b / n) * 0.6); if (bh <= 0) return;
      el('rect', { x: x + b * bw + 1, y: y + h - bh, width: bw - 2, height: bh, rx: 2, fill: col }); });
    if (o.title) tx(x, y - 10, o.title, { 'font-size': 14, 'font-weight': 700, fill: col });
    if (o.peak) mono(x + w, y - 10, o.peak, { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: fade(u, 1.2) }); }
  // 시간축 위 시도 표시: at 초 배열, res: 1/0
  function timeline(x, y, w, max, at, res, o) { o = o || {}; const X = (s) => x + (s / max) * w;
    el('line', { x1: x, y1: y, x2: x + w, y2: y, stroke: MUT, 'stroke-width': 2 });
    for (let s = 0; s <= max; s += o.step || 1) mono(X(s), y + 26, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    at.forEach((s, i) => { const sc = o.sc ? o.sc(i) : 1; if (sc <= 0) return; const ok = res[i];
      el('circle', { cx: X(s), cy: y, r: 15 * sc, fill: ok ? GOODBG : BADBG, stroke: ok ? GOOD : BAD, 'stroke-width': 2 }); (ok ? check : cross)(X(s), y, 7, sc);
      if (i > 0 && o.waits !== false && !(o.waitsAt && o.waitsAt < 1)) { const a = X(at[i - 1]) + 17, b = X(s) - 17; if (b > a) { el('line', { x1: a, y1: y - 30, x2: b, y2: y - 30, stroke: WARN, 'stroke-width': 2, opacity: sc });
        mono((a + b) / 2, y - 38, (Math.round((s - at[i - 1]) * 10) / 10) + 's', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: sc }); } } });
    return X; }

  // ---------- 1. 일시적 실패 vs 영구 실패 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { zone(40, 230, 420, 170, '재시도 OK · 잠깐이다', { fill: GOODBG, color: GOOD }); zone(500, 230, 420, 170, '재시도 금지 · 요청이 틀렸다', { fill: BADBG, color: BAD, op: k === 1 ? 1 : 0.35 });
      const A = ['ConnectException', 'SocketTimeout', '502', '503', '504', '롤링 재시작'], B = ['400', '401 · 403', '404', '422', 'IllegalArgument'];
      A.forEach((s, i) => { const v = k === 0 ? E(u, 0.2 + i * 0.25, 0.8 + i * 0.25) : 1, col = i % 2, row = Math.floor(i / 2);
        if (v <= 0) return; card(150 + col * 200, lerp(40, 284 + row * 40, v), tw(s, 14) + 26, 32, { rx: 16, text: s, fs: 14, mono: true, stroke: GOOD, color: INK, fill: PANEL }); });
      if (k === 0) { sub(480, 120, '수백 ms 뒤 다시 부르면 성공할 수 있다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
      B.forEach((s, i) => { const v = E(u, 0.2 + i * 0.25, 0.8 + i * 0.25), col = i % 2, row = Math.floor(i / 2);
        if (v <= 0) return; card(610 + col * 200, lerp(40, 284 + row * 40, v), tw(s, 14) + 26, 32, { rx: 16, text: s, fs: 14, mono: true, stroke: BAD, color: INK, fill: PANEL }); });
      sub(710, 120, '100번 불러도 같은 답이 온다', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { tx(60, 60, '400을 세 번 재시도하면', { 'font-size': 16, 'font-weight': 800 });
      timeline(100, 160, 560, 2, [0, 1, 2], [0, 0, 0], { sc: (i) => pop(u, 0.3 + i * 0.5) });
      tx(720, 166, '같은 400', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      [['사용자', '3배 기다리고 같은 에러'], ['상대 서버', '헛부하 3배']].forEach(([a, b], i) => { const s = pop(u, 1.8 + i * 0.3); card(250 + i * 420, 310, 340, 64, { rx: 10, stroke: BAD, sw: 2, s });
        tx(100 + i * 420, 316, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.9 + i * 0.3) }); tx(400 + i * 420, 316, b, { 'font-size': 15, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.9 + i * 0.3) }); }); return; }
    // k3: 세 가지만 정한다
    [['retryExceptions', '어떤 예외를', INFO], ['maxAttempts', '몇 번', ACC], ['waitDuration', '얼마 간격으로', WARN]].forEach(([n, d, col], i) => {
      const cx = 170 + i * 310, s = pop(u, 0.3 + i * 0.4); card(cx, 190, 260, 140, { rx: 14, stroke: col, sw: 2.5, s });
      mono(cx, 170, n, { 'font-size': 17, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.4) });
      tx(cx, 210, d, { 'font-size': 16, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); });
    mono(480, 330, '3회 · 1s', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) });
    sub(480, 370, '정해 주면 Resilience4j가 대신 다시 부른다', fade(u, 2.1), { 'font-size': 15, fill: INK }); }

  // ---------- 2. 고정 간격 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { pill(140, 50, 'orderService', ACC, pop(u, 0.2), { mono: true });
      timeline(120, 200, 600, 2, [0, 1, 2], [0, 0, 0], { sc: (i) => pop(u, 0.6 + i * 0.4) });
      ['1차', '2차', '3차'].forEach((s, i) => tx(120 + i * 300, 160, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.7 + i * 0.4) }));
      sub(480, 320, 'max-attempts 3 = 첫 호출 + 재시도 2번', fade(u, 1.8), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { // 예외 거름망
      const L = ['IOException', 'TimeoutException', 'HttpServerErrorException'];
      el('path', { d: 'M330,80 L630,80 L520,200 L520,250 L440,250 L440,200 Z', fill: INFOBG, stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.1) });
      tx(480, 110, 'retry-exceptions', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, class: 'mono', opacity: fade(u, 0.2) });
      L.forEach((s, i) => { const v = E(u, 0.4 + i * 0.4, 1.2 + i * 0.4); if (v <= 0) return; pill(lerp(480, 230 + i * 250, v), lerp(150, 310, v), s, GOOD, 1, { mono: true, fs: 13.5 }); });
      tx(480, 370, '이 셋에서만 다시 부르고, 나머지 예외는 바로 올라간다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { // 두 목록이 겹치면 ignore
      const a = fade(u, 0.2), b = fade(u, 0.8);
      el('circle', { cx: 390, cy: 200, r: 140, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.5, opacity: a }); el('circle', { cx: 570, cy: 200, r: 140, fill: BADBG, stroke: BAD, 'stroke-width': 2.5, opacity: b * 0.9 });
      tx(330, 46, 'retry-exceptions', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', class: 'mono', opacity: a });
      tx(630, 46, 'ignore-exceptions', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', class: 'mono', opacity: b });
      tx(480, 205, '둘 다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); tx(480, 228, '→ 재시도 안 함', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      mono(800, 330, 'HttpClientErrorException', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.0) }); mono(800, 352, 'OrderValidationException', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.1) });
      sub(480, 400, '절대 재시도하면 안 되는 것은 ignore에 적는다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { const X = timeline(120, 190, 600, 2.5, [0, 1, 2], [0, 0, 0], { step: 0.5, sc: (i) => pop(u, 0.2 + i * 0.5) });
      ['503', '503', '503'].forEach((s, i) => mono(X(i), 240, s, { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.5) }));
      const v = E(u, 1.6, 2.3); if (v > 0) { el('line', { x1: X(2) + 18, y1: 190, x2: lerp(X(2) + 18, 860, v), y2: 190, stroke: BAD, 'stroke-width': 3 });
        card(860, 190, 140, 50, { rx: 10, text: '예외 전파\n또는 fallback', fs: 13.5, stroke: BAD, color: BAD, s: pop(u, 2.2) }); }
      mono(480, 320, '모두 실패하면 2.0s를 쓰고 끝난다', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    // k4: 고정 간격 = 같은 순간 몰림
    hist(140, 120, 680, 220, H_FIXED, u, BAD, { title: '클라이언트 1000개 · 0.5초마다 재시도 수 (시뮬레이션)', peak: '최고 1000 / 0.5s' });
    sub(480, 400, '모두 정확히 1초 뒤, 2초 뒤에 한꺼번에 다시 온다', fade(u, 1.6), { 'font-size': 15, fill: INK }); }

  // ---------- 3. 지수 백오프 + jitter ----------
  function s3(t, c) { const { k, u } = c, max = 10, x0 = 90, w = 760, X = (s) => x0 + s / max * w;
    if (k <= 2) { const fixedAt = [0, 1, 2, 3], expAt = [0, 1, 3, 7], m = k === 0 ? 0 : k === 1 ? E(u, 0.3, 1.8) : 1, at = fixedAt.map((v, i) => lerp(v, expAt[i], m));
      if (k === 2) { [[1, 0.5, 1.5], [3, 2, 4], [7, 5, 9]].forEach(([c0, a, b], i) => { const v = E(u, 0.3 + i * 0.4, 0.9 + i * 0.4);
          el('rect', { x: X(lerp(c0, a, v)), y: 160, width: X(lerp(c0, b, v)) - X(lerp(c0, a, v)), height: 40, rx: 8, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }); });
        tx(X(10), 240, '±50% 구간 어딘가', { 'font-size': 14, fill: WARN, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 1.6) }); }
      timeline(x0, 180, w, max, at, [0, 0, 0, 1], { waitsAt: k === 1 ? m : 1, sc: (i) => (k === 0 ? pop(u, 0.2 + i * 0.3) : 1) });
      const lab = k === 0 ? '대기 1s · 1s · 1s (배수 없음)' : '대기 1s → 2s → 4s  (base × 2ⁿ)';
      tx(x0, 70, lab, { 'font-size': 17, 'font-weight': 800, opacity: k === 1 ? fade(u, 1.6) : k === 0 ? fade(u, 1.2) : 1 });
      if (k === 0) pill(x0 + 70, 290, 'max-attempts 4', ACC, pop(u, 1.6), { mono: true });
      if (k === 2) { mono(x0, 290, '1s → 0.5~1.5s · 2s → 1~3s · 4s → 2~6s', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
        sub(480, 360, 'jitter는 대기 길이가 아니라 재시도 시점을 흩어 놓는다', fade(u, 2.2), { 'font-size': 15, fill: INK }); }
      if (k === 1) sub(480, 330, '같은 시간 안에 오는 재시도가 줄어든다', fade(u, 2.0), { 'font-size': 15, fill: INK });
      return; }
    if (k === 3) { // 상한
      const ws = [1, 2, 4, 8, 16, 32], bx = 150, bw = 90, H = 230, top = 16, Y = (v) => 330 - H * v / top;
      tx(bx, 60, 'n번째 재시도 전 대기 = min(1s × 2ⁿ, 상한)', { 'font-size': 16, 'font-weight': 800 });
      ws.forEach((v, i) => { const g = E(u, 0.2 + i * 0.2, 0.8 + i * 0.2), cap = Math.min(v, 10), shown = lerp(0, Math.min(v, top), g), capV = u > 1.8 ? cap : Math.min(v, top);
        el('rect', { x: bx + i * (bw + 20), y: Y(Math.min(shown, capV)), width: bw, height: 330 - Y(Math.min(shown, capV)), rx: 4, fill: v > 10 && u > 1.8 ? WARN : ACC, opacity: 0.75 });
        mono(bx + i * (bw + 20) + bw / 2, 352, `${i + 1}번`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
        mono(bx + i * (bw + 20) + bw / 2, Y(Math.min(shown, capV)) - 8, (u > 1.8 ? cap : v) + 's', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: g }); });
      el('line', { x1: bx - 10, y1: Y(10), x2: bx + 6 * (bw + 20), y2: Y(10), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 1.6) });
      tx(bx - 14, Y(10) + 5, '10s', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', 'font-weight': 800, opacity: fade(u, 1.6) });
      sub(480, 395, '예시 · 이 장의 4회 설정에서는 4s 까지만 쓴다', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k4: 1000 클라이언트
    hist(90, 70, 780, 110, H_EXP, u, BAD, { title: 'jitter 없음 · 1s · 3s · 7s에 한꺼번에', peak: '최고 1000 / 0.5s' });
    hist(90, 250, 780, 110, H_JIT, seg(u, 0.8, 3), GOOD, { title: 'jitter 0.5 · 시간축에 퍼진다 (시뮬레이션)', peak: '최고 519 / 0.5s' }); }

  // ---------- 4. @Retry + CircuitBreaker ----------
  function nest(outer, inner, s) { card(480, 190, 640, 250, { rx: 16, stroke: outer === 'Retry' ? INFO : BAD, sw: 3, s });
    mono(176, 86, '@' + outer, { 'font-size': 16, 'font-weight': 800, fill: outer === 'Retry' ? INFO : BAD });
    card(480, 205, 440, 160, { rx: 12, stroke: inner === 'Retry' ? INFO : BAD, sw: 2.5, s });
    mono(276, 148, '@' + inner, { 'font-size': 15, 'font-weight': 800, fill: inner === 'Retry' ? INFO : BAD });
    card(480, 220, 230, 56, { rx: 10, text: 'getOrder(id)', fs: 15, mono: true, fill: SOFT, s }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { nest('Retry', 'CircuitBreaker', k === 0 ? pop(u, 0.2) : 1);
      if (k === 0) sub(480, 360, '위에 쓴 @Retry가 바깥 · 재시도마다 서킷을 지난다', fade(u, 1.4), { 'font-size': 15, fill: INK });
      else { mono(480, 262, 'rest.get().uri(…/orders/{id})', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
        el('line', { x1: 380, y1: 360, x2: 580, y2: 360, stroke: MUT, 'stroke-width': 2, opacity: fade(u, 1.0) }); sub(480, 390, '수동 재시도 루프 없음', fade(u, 1.2), { 'font-size': 15, fill: INK }); }
      return; }
    if (k === 2) { const X = timeline(90, 150, 560, 7, [0, 1, 3, 7], [0, 0, 0, 0], { sc: (i) => pop(u, 0.2 + i * 0.35) });
      tx(90, 70, '시도 4번 모두 실패 (대기 1s → 2s → 4s)', { 'font-size': 16, 'font-weight': 800 });
      grow(X(7) + 18, 150, 760, 150, E(u, 1.7, 2.1), ACC); card(840, 150, 150, 56, { rx: 10, text: 'fallback\n(id, e)', fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 2.1) });
      pill(840, 230, 'OrderView.unavailable', ACC, pop(u, 2.4), { mono: true, fs: 13.5 }); return; }
    if (k === 3) { [['Retry 바깥 (권장)', 4, GOOD], ['CircuitBreaker 바깥', 1, BAD]].forEach(([lab, n, col], j) => { const x0 = 90 + j * 440;
        tx(x0, 70, lab, { 'font-size': 16, 'font-weight': 800, fill: col });
        for (let i = 0; i < 4; i++) { const s = pop(u, 0.3 + i * 0.3); el('circle', { cx: x0 + 30 + i * 70, cy: 140, r: 18 * s, fill: BADBG, stroke: BAD, 'stroke-width': 2 }); cross(x0 + 30 + i * 70, 140, 8, s); }
        tx(x0, 200, '서킷이 센 실패', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.4) });
        for (let i = 0; i < n; i++) el('rect', { x: x0 + i * 70 + 12, y: 216, width: 36, height: 36, rx: 6, fill: BAD, opacity: 0.85 * fade(u, 1.5 + i * 0.15) });
        mono(x0 + 350, 244, `${n}건`, { 'font-size': 22, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: fade(u, 1.8) }); });
      sub(480, 340, '서킷이 바깥이면 장애를 4분의 1로 보고 늦게 연다', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    // k4: OPEN 이면 재시도가 바로 멈춘다
    card(140, 190, 150, 56, { rx: 10, text: '@Retry', fs: 15, mono: true, fw: 800, stroke: INFO, color: INFO });
    card(400, 190, 170, 56, { rx: 10, text: 'CB · OPEN', fs: 15, mono: true, fw: 800, fill: BADBG, stroke: BAD, color: BAD });
    dot([[215, 182], [315, 182]], seg(u, 0.2, 0.8), INFO, 7); fly(315, 205, 215, 205, seg(u, 0.8, 1.4), 'CallNotPermitted', { fill: BAD, mono: true });
    if (u > 1.4) { cross(140, 120, 11, pop(u, 1.4)); tx(140, 96, '재시도 안 함', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); }
    grow(140, 218, 140, 300, E(u, 1.6, 2.0), ACC); pill(140, 320, 'fallback', ACC, pop(u, 2.0), { mono: true });
    sub(660, 290, 'CallNotPermittedException은 retry-exceptions에 없다', fade(u, 1.4), { 'font-size': 14.5, fill: INK });
    sub(660, 318, '그래서 첫 시도에서 바로 멈춘다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); }

  // ---------- 5. 멱등성과 재시도 폭주 ----------
  function s5(t, c) { const { k, u } = c, cx = 120, sx = 760;
    const actors = () => { card(cx, 70, 160, 46, { rx: 10, text: 'order (클라이언트)', fs: 14, fw: 700 }); card(sx, 70, 170, 46, { rx: 10, text: 'payment 서버', fs: 14, fw: 700 });
      el('line', { x1: cx, y1: 94, x2: cx, y2: 400, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); el('line', { x1: sx, y1: 94, x2: sx, y2: 400, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); };
    const msg = (y1, y2, u0, lab, col, back) => { const v = E(u, u0, u0 + 0.5); if (v <= 0) return; const a = back ? sx : cx, b = back ? cx : sx;
      grow(a, y1, lerp(a, b, 1), lerp(y1, y2, 1), v, col || INK); if (v >= 1 && lab) mono((a + b) / 2, (y1 + y2) / 2 - 8, lab, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col || INK, 'font-weight': 700 }); };
    if (k <= 2) { actors();
      const key = k >= 1, label = (i) => (key ? 'POST · Key=주문ID' : 'POST /payments');
      msg(130, 150, 0.2, label(0), INK);
      const charge = (y, i, dup) => { const s = pop(u, 0.7 + i * 1.0); card(sx + 100, y, 120, 36, { rx: 8, text: dup ? (k === 2 ? '기존 결과' : '결제 #2') : '결제 #1', fs: 14, fw: 800, stroke: dup && k !== 2 ? BAD : GOOD, color: dup && k !== 2 ? BAD : GOOD, s }); };
      charge(150, 0, false);
      // 응답이 사라진다
      const lost = E(u, 0.8, 1.2); if (lost > 0) { el('line', { x1: sx, y1: 175, x2: lerp(sx, 440, lost), y2: 190, stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' }); if (lost >= 1) cross(430, 190, 10, 1); }
      mono(cx + 10, 222, 'timeout → 실패로 보임', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.2) });
      msg(250, 270, 1.5, label(1), INK); charge(270, 1, true);
      if (k === 0) { banner(480, 360, '같은 결제가 두 번 나간다', pop(u, 2.3)); return; }
      if (k === 1) { mono(480, 340, 'idempotencyKey = cmd.clientRequestId()', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.3) });
        sub(480, 372, '재시도마다 새로 만들지 않고 진입할 때 한 번 만든다', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
      zone(sx - 300, 340, 280, 70, '서버가 기억하는 키', { fill: SOFT }); mono(sx - 284, 392, '주문ID → 결제 #1 결과', { 'font-size': 14, opacity: fade(u, 0.5) });
      msg(296, 314, 2.0, '결제 #1 결과', GOOD, true); return; }
    if (k === 3) { card(300, 190, 280, 110, { rx: 14, stroke: WARN, sw: 3, fill: WARNBG, s: pop(u, 0.2) }); mono(300, 180, 'PENDING', { 'font-size': 28, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      tx(300, 218, '성공도 실패도 단정하지 않는다', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      grow(450, 190, 600, 190, E(u, 1.0, 1.6), MUT); card(700, 190, 200, 64, { rx: 10, text: '나중에 조회로\n확정', fs: 15, s: pop(u, 1.6) });
      sub(480, 340, '돈이 걸린 호출의 대체 응답은 "모름"이 정답일 때가 많다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    // k4·k5: 곱해지는 부하
    const NODES = [['Gateway', 90], ['A', 330], ['B', 570], ['C', 810]], cuts = k === 5;
    NODES.forEach(([n, x], i) => card(x, 70, 120, 44, { rx: 10, text: n, fs: 16, fw: 800, stroke: i === 3 ? BAD : INK, color: i === 3 ? BAD : INK }));
    const nA = 1, nB = cuts ? 1 : 3, nC = cuts ? 3 : 9;
    [[330, nA], [570, nB], [810, nC]].forEach(([x, n], j) => { for (let i = 0; i < n; i++) { const s = pop(u, 0.3 + j * 0.6 + i * 0.05); el('circle', { cx: x - 40 + (i % 3) * 40, cy: 150 + Math.floor(i / 3) * 38, r: 13 * s, fill: j === 2 ? BAD : INFO, opacity: 0.8 }); }
      mono(x, 290, `${n}번`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: j === 2 ? BAD : INK, opacity: fade(u, 0.5 + j * 0.6) }); });
    if (!cuts) { tx(450, 110, 'A가 3번', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 }); tx(690, 110, 'B도 3번씩', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 });
      banner(480, 360, '3 × 3 = 9 · 말단이 가장 세게 맞는다', pop(u, 2.0)); return; }
    tx(570, 116, '하위는 재시도 안 함', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700 });
    [['CircuitBreaker 병행', 'OPEN 이면 즉시 멈춤'], ['최상단 위주', '하위 재시도 최소화'], ['maxAttempts 2~3', '+ 대기 상한'], ['jitter', '시점 분산']].forEach(([a, b], i) => { const s = pop(u, 0.6 + i * 0.3), x = 130 + i * 233;
      card(x, 360, 215, 58, { rx: 10, stroke: GOOD, sw: 2, s, text: a + '\n' + b, fs: 13.5 }); }); }

  const quiz = [
    { q: '다음 중 재시도해도 되는 실패는 무엇인가?',
      o: ['422 Validation', '503 Service Unavailable', '401 인증 실패'], a: 1,
      why: '503은 서버가 잠깐 바쁜 일시적 장애라 다시 부르면 성공할 수 있다. 4xx는 요청 자체가 틀려 몇 번을 불러도 같은 답이 온다.' },
    { q: 'max-attempts 3, wait-duration 1s로 호출이 모두 실패하면 예외가 올라가는 시점은 언제인가?',
      o: ['1.0s', '2.0s', '3.0s'], a: 1,
      why: 'max-attempts 3은 첫 호출과 재시도 2번이다. 0s, 1s, 2s에 세 번 부르고 2.0s에 시도가 바닥난다.' },
    { q: 'wait-duration 1s, multiplier 2, randomized-wait-factor 0.5일 때 두 번째 재시도 전 대기는 어느 구간에서 정해지는가?',
      o: ['1~3초', '0.5~1.5초', '정확히 2초'], a: 0,
      why: '두 번째 대기는 1s × 2 = 2s이고, jitter 0.5가 ±50%를 줘서 1~3초 사이 어딘가로 흩어진다.' },
    { q: '@Retry를 바깥, @CircuitBreaker를 안쪽에 두는 이유는 무엇인가?',
      o: ['재시도 횟수를 줄이려고', 'fallback을 두 번 부르려고', '시도마다 서킷을 지나 실패가 빠짐없이 집계되게 하려고'], a: 2,
      why: '서킷이 바깥이면 재시도 4번이 실패 1건으로만 보여 늦게 열린다. Retry가 바깥이면 4건이 모두 집계된다.' },
    { q: '결제 POST에 재시도를 걸 때 Idempotency-Key는 언제 만들어야 하는가?',
      o: ['호출에 들어갈 때 한 번 만들어 모든 재시도가 같은 키를 쓴다', '재시도할 때마다 새 UUID로 만든다', '서버가 응답할 때 만들어 돌려준다'], a: 0,
      why: '키가 같아야 서버가 두 번째 요청을 같은 결제로 알아보고 기존 결과를 돌려준다. 매번 새로 만들면 중복 결제를 막지 못한다.' },
  ];

  const summary = [
    '503이나 타임아웃처럼 잠깐인 실패만 재시도하고, 4xx는 몇 번 불러도 같은 답이라 바로 올린다.',
    'max-attempts 3은 첫 호출을 포함한 횟수이고, 고정 1초 간격은 여러 클라이언트를 같은 순간에 몰리게 한다.',
    '대기를 1s, 2s, 4s로 늘리고 jitter로 흩으면 1000개 클라이언트의 재시도가 시간축에 퍼진다.',
    'POST는 같은 멱등성 키로 재시도하고, 단계마다 재시도를 걸면 말단 부하가 3 × 3 = 9배가 된다.',
  ];
  const review = [
    { q: '장애 중에 결제 서버 로그를 보니 정확히 1초, 2초 간격으로 요청이 한꺼번에 몰려왔다. 먼저 바꿀 설정은?',
      o: ['max-attempts를 늘린다', '지수 백오프와 randomized wait를 켠다', 'ignore-exceptions를 비운다'], a: 1,
      why: '고정 간격은 모든 클라이언트를 같은 순간으로 맞춘다. 배수로 대기를 늘리고 jitter로 시점을 흩어야 몰림이 풀린다.' },
    { q: '결제 API에 @Retry를 붙인 뒤 같은 주문이 두 번 결제된 사례가 나왔다. 가장 먼저 의심할 것은?',
      o: ['타임아웃으로 실패처럼 보였지만 서버는 이미 처리했고, 재시도가 멱등성 키 없이 나갔다', 'wait-duration이 너무 길었다', 'fallback이 결제를 한 번 더 했다'], a: 0,
      why: '응답만 사라진 경우 서버는 결제를 끝냈을 수 있다. 같은 키를 실어 보내야 서버가 두 번째 요청을 기존 결과로 돌려준다.' },
    { q: 'Gateway, A, B, C로 이어지는 호출에서 A와 B가 각각 3번씩 재시도하도록 설정했다. C가 받는 최대 호출 수는?',
      o: ['3번', '6번', '9번'], a: 2,
      why: 'A의 3번이 각각 B를 부르고, B가 그때마다 3번씩 C를 부르므로 3 × 3 = 9번이다. 재시도는 최상단 위주로 건다.' },
  ];

  R.page({ title: '재시도 타임라인 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
