/* IV-1-1 Resilience4j 개요 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 감싸는 순서: Decorators는 마지막 with… 가 바깥, 어노테이션 기본 순서는 Retry(CircuitBreaker(RateLimiter(TimeLimiter(Bulkhead(호출))))) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock, terminal, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const MODS = ['Retry', 'CircuitBreaker', 'RateLimiter', 'TimeLimiter', 'Bulkhead'];
  const MCOL = { Retry: INFO, CircuitBreaker: BAD, RateLimiter: WARN, TimeLimiter: MUT, Bulkhead: ACC };
  // 테두리가 자라는 둥근 사각형 (u 0→1)
  function growRect(x, y, w, h, u, col, o) { o = o || {}; if (u <= 0) return; const L = 2 * (w + h);
    el('rect', { x, y, width: w, height: h, rx: o.rx ?? 14, fill: o.fill || 'none', 'fill-opacity': u >= 1 ? 1 : 0, stroke: col, 'stroke-width': o.sw || 3, 'stroke-dasharray': u >= 1 ? o.dash : `${L * u} ${L}` }); }

  // ---------- 1. 무방비 호출 ----------
  function s1(t, c) { const { k, u } = c, ox = 150, px = 800, y = 130;
    if (k <= 1) { server(ox, y, 'order-service', { lamp: k === 1 ? BAD : GOOD, s: k === 0 ? pop(u, 0.2) : 1 }); server(px, y, 'payment-service', { lamp: k === 1 ? WARN : GOOD, s: k === 0 ? pop(u, 0.5) : 1 });
      grow(ox + 62, y, px - 62, y, k === 0 ? E(u, 0.8, 1.6) : 1, MUT);
      mono(475, y - 18, 'RestClient → :8084', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 0 ? fade(u, 1.4) : 1 });
      pill(475, y + 34, '보호막 0개', BAD, k === 0 ? pop(u, 1.9) : 1, { fs: 14 }); }
    if (k === 0) { sub(475, 300, '상대 서비스의 상태가 곧 내 서비스의 상태가 된다', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { clock(px + 92, y - 36, 18, E(u, 0.2, 2.4), WARN); mono(px + 92, y - 64, '3초', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
      const n = 48, cols = 16, used = Math.round(lerp(4, n, E(u, 0.4, 2.4)));
      tx(ox - 60, 232, '톰캣 워커 스레드', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < n; i++) { const q = i % cols, r = Math.floor(i / cols); el('rect', { x: ox - 60 + q * 24, y: 244 + r * 24, width: 20, height: 20, rx: 3, fill: i < used ? BAD : SOFT, opacity: i < used ? 0.85 : 1 }); }
      for (let i = 0; i < 4; i++) dot([[ox + 62, y + 8], [px - 62, y + 8]], seg(u, 0.2 + i * 0.4, 2.8), WARN, 6);
      sub(560, 380, 'pay() 하나가 응답이 올 때까지 스레드를 붙잡는다', fade(u, 1.6), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { const s = pop(u, 0.2); card(330, 180, 300, 150, { rx: 12, stroke: OFF, fill: SOFT, s });
      mono(330, 150, '@HystrixCommand', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3) });
      ['RxJava 의존', '스레드풀 격리 오버헤드'].forEach((w, i) => pill(330, 196 + i * 40, w, MUT, pop(u, 0.6 + i * 0.25), { fs: 13.5 }));
      const st = pop(u, 1.3); card(640, 180, 250, 74, { rx: 8, stroke: BAD, sw: 3.5, fill: PANEL, s: st, text: 'maintenance mode\n2018 ~', fs: 17, color: BAD, fw: 800 });
      sub(480, 330, '신규 개발이 멈춘 라이브러리 · 새로 도입하지 않는다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    // k3: 하나에서 다섯 모듈로 갈라진다
    const sp = E(u, 0.6, 1.6); card(480, 110, 220, 54, { rx: 12, text: 'Resilience4j', fs: 19, fw: 800, fill: ACCBG, stroke: ACC, color: ACC, s: pop(u, 0.1) });
    MODS.forEach((m, i) => { const x = lerp(480, 120 + i * 180, sp), yy = lerp(110, 250, sp);
      if (sp > 0) { el('line', { x1: 480, y1: 137, x2: x, y2: yy - 22, stroke: GRID, 'stroke-width': 2, opacity: sp });
        card(x, yy, 160, 44, { rx: 22, text: m, fs: 14.5, mono: true, fw: 700, stroke: MCOL[m], color: MCOL[m], fill: PANEL, dash: m === 'TimeLimiter' ? '5 4' : null }); } });
    sub(480, 330, 'Java 8 함수형 · 무거운 의존성 없이 필요한 모듈만 고른다', fade(u, 1.9), { 'font-size': 15, fill: INK }); }

  // ---------- 2. 함수 하나를 겹겹이 감싼다 ----------
  const CX = 650, CY = 215;
  const WRAP = ['Bulkhead', 'RateLimiter', 'CircuitBreaker', 'Retry'];   // 코드의 with… 순서 = 안쪽부터
  function shelf(on, k, u) { tx(40, 46, '선언한 모듈', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const notes = { Retry: '기본 3회 · 500ms', CircuitBreaker: '실패율 ≥ 50%', RateLimiter: '주기당 호출 수', TimeLimiter: '비동기 전용', Bulkhead: '동시 실행 수' };
    MODS.forEach((m, i) => { const y = 82 + i * 66, lit = on.includes(m), fresh = lit && !(on.prev || []).includes(m), s = fresh ? pop(u, 0.2) : 1;
      card(150, y, 220, 50, { rx: 10, stroke: lit ? MCOL[m] : GRID, fill: lit ? PANEL : SOFT, sw: lit ? 2.5 : 1.5, dash: m === 'TimeLimiter' ? '5 4' : null, s });
      mono(52, y - 2, m, { 'font-size': 14.5, 'font-weight': 800, fill: lit ? MCOL[m] : OFF });
      if (lit) tx(52, y + 17, notes[m], { 'font-size': 13.5, fill: MUT, opacity: fresh ? fade(u, 0.6) : 1 }); }); }
  function rings(n, u, hot) { WRAP.slice(0, n).forEach((m, i) => { const w = 210 + (i + 1) * 74, h = 62 + (i + 1) * 64, last = i === n - 1;
      growRect(CX - w / 2, CY - h / 2, w, h, last && u != null ? u : 1, hot === m ? INK : MCOL[m], { sw: hot === m ? 4 : 2.6 });
      if (!last || u == null || u >= 1) mono(CX - w / 2 + 12, CY - h / 2 + 20, m, { 'font-size': 14, 'font-weight': 800, fill: MCOL[m] }); }); }
  function core() { card(CX, CY, 200, 56, { rx: 10, text: 'call: Supplier<String>', fs: 14.5, mono: true, fill: SOFT, stroke: INK }); }
  function s2(t, c) { const { k, u } = c, on = (c.beat.active || []).slice(); on.prev = (c.prev && c.prev.active) || [];
    shelf(on, k, u);
    if (k === 0) { card(CX, CY, 200, 56, { rx: 10, text: 'call: Supplier<String>', fs: 14.5, mono: true, fill: SOFT, stroke: INK, s: pop(u, 0.3) });
      mono(CX, CY + 60, '() -> restClient.pay(orderId)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) });
      sub(CX, CY + 110, '보호할 단위는 클래스가 아니라 함수 하나', fade(u, 1.6), { 'font-size': 15, fill: INK }); return; }
    core();
    if (k <= 4) { sub(CX, 395, '선언만 했을 뿐 아직 아무것도 감싸지 않았다', 1, { 'font-size': 15 });
      if (k === 4) { mono(CX, CY + 80, 'CompletableFuture를 돌려받아야 시간을 잴 수 있다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) }); }
      return; }
    if (k === 5) { const per = 0.55; let n = 0, uu = null; WRAP.forEach((m, i) => { const s = seg(u, 0.2 + i * per, 0.2 + (i + 1) * per); if (s > 0) { n = i + 1; uu = s < 1 ? s : null; } }); rings(n, uu);
      mono(CX, 400, '.withBulkhead → .withRateLimiter → .withCircuitBreaker → .withRetry', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3) }); return; }
    // k6: 요청이 바깥에서 안으로
    const v = E(u, 0.2, 2.2), xs = WRAP.map((m, i) => CX - (210 + (i + 1) * 74) / 2).reverse(), x = lerp(40 + 230, CX - 100, v);
    const passed = xs.filter((xx) => x > xx).length, hot = passed ? WRAP[WRAP.length - passed] : null;
    rings(4, null, hot); dot([[270, CY], [CX - 100, CY]], v < 1 ? v : 0, INK, 8);
    if (v >= 1) check(CX + 120, CY, 12, pop(u, 2.3));
    tx(CX, 400, 'TimeLimiter는 이 동기 체인에 끼울 수 없어 4겹이다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.0) }); }

  // ---------- 3. yml로 선언 ----------
  const YML = [
    ['starter-circuitbreaker-resilience4j', 0], ['instances.payment', 0],
    ['sliding-window-size: 10', 1], ['failure-rate-threshold: 50', 1], ['wait-duration…: 5s · half-open 3', 1],
    ['retry max-attempts: 3', 2], ['retry wait-duration: 200ms', 2], ['timelimiter timeout: 3s', 3],
    ['ratelimiter 100 / 1s', 4], ['bulkhead max-concurrent: 20', 5], ['include: circuitbreakers', 6],
  ];
  function ymlPanel(k, u) { zone(20, 20, 330, 380, 'application.yml', { fill: SOFT });
    YML.forEach(([s, kk], i) => { if (kk > k) return; const op = kk === k ? fade(u, 0.2 + (i % 3) * 0.2) : 1;
      mono(36, 66 + i * 31, s, { 'font-size': 13.5, fill: kk === k ? ACC : INK, 'font-weight': kk === k ? 700 : 500, opacity: op }); }); }
  function s3(t, c) { const { k, u } = c, X0 = 390;
    ymlPanel(k, u);
    if (k === 0) { const v = E(u, 0.2, 1.2); fly(X0 + 40, 60, X0 + 280, 170, v, 'resilience4j 스타터', { stay: true });
      card(X0 + 280, 210, 280, 56, { rx: 10, text: 'CircuitBreakerFactory', fs: 15, mono: true, fw: 700, stroke: INK, s: pop(u, 0.1) });
      sub(X0 + 280, 260, '코드는 이 추상화에만 의존', fade(u, 1.2), { 'font-size': 14 });
      pill(X0 + 120, 330, 'instances.payment', ACC, pop(u, 1.6), { mono: true }); pill(X0 + 420, 330, '@CircuitBreaker(name="payment")', ACC, pop(u, 1.9), { mono: true, fs: 13.5 });
      grow(X0 + 210, 330, X0 + 300, 330, E(u, 2.1, 2.5), ACC, { plain: true }); return; }
    if (k === 1) { const outs = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0], n = Math.round(lerp(0, 10, E(u, 0.2, 1.6)));
      tx(X0, 70, '최근 10번', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      outs.forEach((v, i) => { const x = X0 + i * 52; el('rect', { x, y: 82, width: 44, height: 44, rx: 6, fill: i < n ? (v ? GOODBG : BADBG) : PANEL, stroke: i < n ? (v ? GOOD : BAD) : GRID, 'stroke-width': 2, 'stroke-dasharray': i < n ? null : '4 3' }); if (i < n) (v ? check : cross)(x + 22, 104, 9); });
      const f = outs.slice(0, n).filter((v) => !v).length; mono(X0, 170, `실패 ${f} / ${n} = ${n ? Math.round(100 * f / n) : 0}%`, { 'font-size': 18, 'font-weight': 800, fill: n === 10 ? BAD : INK });
      if (n === 10) { pill(X0 + 340, 165, 'OPEN', BAD, pop(u, 1.7), { mono: true, fs: 15, fill: BADBG }); clock(X0 + 60, 260, 26, E(u, 1.9, 2.7), BAD, '5s');
        tx(X0 + 110, 266, '→ HALF_OPEN · 시험 3번', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }
      sub(X0 + 270, 360, '50%는 "넘으면"이 아니라 "같거나 크면" 연다', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2) { const ax = X0 + 40, lane = (y, name, xs, col) => { tx(X0, y - 26, name, { 'font-size': 14, 'font-weight': 700, fill: col });
        el('line', { x1: ax, y1: y, x2: ax + 480, y2: y, stroke: GRID, 'stroke-width': 2 }); xs.forEach(([ms, ok], i) => { const x = ax + ms * 1.1, s = pop(u, 0.3 + i * 0.45);
          el('circle', { cx: x, cy: y, r: 15 * s, fill: ok ? GOODBG : BADBG, stroke: ok ? GOOD : BAD, 'stroke-width': 2 }); (ok ? check : cross)(x, y, 7, s);
          mono(x, y + 34, ms + 'ms', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); }); };
      lane(110, 'IOException · 재시도 대상', [[0, 0], [200, 0], [400, 1]], INK);
      lane(250, '400 Bad Request · 목록에 없음', [[0, 0]], BAD);
      sub(X0 + 340, 300, '재시도 없이 바로 올라간다', fade(u, 1.0), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
      sub(X0 + 270, 370, 'max-attempts 3 = 최초 1번 + 재시도 2번', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const ax = axes(X0 + 30, 120, 480, 90, { x: [0, 4], y: [0, 1], xt: [0, 1, 2, 3, 4], xl: '응답 시간 (초)' });
      const v = lerp(0, 4, E(u, 0.2, 2.4)), cut = Math.min(v, 3);
      el('rect', { x: ax.X(0), y: 150, width: ax.X(cut) - ax.X(0), height: 34, rx: 4, fill: v > 2 ? WARN : ACC, opacity: 0.8 });
      [[2, 'slow-call 2s', WARN], [3, 'timeout 3s', BAD]].forEach(([s, lab, col]) => { el('line', { x1: ax.X(s), y1: 110, x2: ax.X(s), y2: 214, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': '5 3' }); tx(ax.X(s), 102, lab, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle' }); });
      if (v > 3) { cross(ax.X(3) + 26, 167, 12, pop(u, 1.9)); tx(ax.X(3) + 48, 173, '취소', { 'font-size': 15, 'font-weight': 800, fill: BAD }); }
      sub(X0 + 270, 320, '2초를 넘으면 느린 호출로 세고, 3초에서 끊는다', fade(u, 1.0), { 'font-size': 15, fill: INK });
      sub(X0 + 270, 352, 'TimeLimiter는 slow-call 기준보다 길게 잡는다', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 4) { tx(X0, 70, '1초마다 허용량 100을 새로 채운다', { 'font-size': 14.5, 'font-weight': 700 });
      for (let p = 0; p < 3; p++) { const x = X0 + p * 180, fill = Math.max(0, (u - 0.2 - p * 0.85) * 1.7), used = Math.round(Math.min(1, fill) * 100), over = fill > 1 && fill < 2.2;
        el('rect', { x, y: 100, width: 150, height: 180, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
        el('rect', { x, y: 100 + 180 * (1 - Math.min(1, fill)), width: 150, height: 180 * Math.min(1, fill), rx: 8, fill: over ? WARN : ACC, opacity: 0.55 });
        mono(x + 75, 312, `${used} / 100`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: over ? WARN : INK });
        tx(x + 75, 92, `${p}~${p + 1}초`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
        if (over) for (let i = 0; i < 3; i++) dot([[x + 75, 60], [x + 75, 96], [x + 170, 70]], ((t * 1.2 + i / 3) % 1), BAD, 5); }
      sub(X0 + 260, 360, '101번째 호출부터는 다음 주기까지 거절된다', fade(u, 1.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 5) { const n = Math.round(lerp(0, 20, E(u, 0.2, 1.6)));
      tx(X0, 70, 'payment 동시 실행 칸 20', { 'font-size': 14.5, 'font-weight': 700 });
      for (let i = 0; i < 20; i++) { const x = X0 + (i % 10) * 52, y = 90 + Math.floor(i / 10) * 52; el('rect', { x, y, width: 44, height: 44, rx: 6, fill: i < n ? ACC : PANEL, stroke: i < n ? ACC : GRID, 'stroke-width': 2, opacity: i < n ? 0.75 : 1 }); }
      mono(X0 + 520, 70, `${n} / 20`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: n === 20 ? BAD : INK });
      if (n === 20) { dot([[X0 + 260, 300], [X0 + 260, 206], [X0 + 400, 300]], seg(u, 1.7, 2.6), BAD, 8); tx(X0 + 260, 330, '21번째 호출', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
      sub(X0 + 260, 380, '한 의존성이 스레드를 다 가져가지 못하게 막는 칸막이', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k6: actuator
    terminal(X0, 60, 540, 200, ['$ curl :8080/actuator/circuitbreakers', ['  payment  state=CLOSED', '#4ade80']], 1 + E(u, 0.6, 1.6), { title: 'actuator' });
    ['health', 'metrics', 'circuitbreakers'].forEach((s, i) => pill(X0 + 70 + i * 170, 310, s, i === 2 ? ACC : INK, pop(u, 1.4 + i * 0.25), { mono: true }));
    sub(X0 + 270, 370, '코드는 그대로 두고 서비스마다 yml로 임계치를 다르게', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 4. 어노테이션: 문을 차례로 지난다 ----------
  const G3 = [['Retry', 140], ['CircuitBreaker', 340], ['Bulkhead', 540]], G5 = [['Retry', 110], ['CircuitBreaker', 250], ['RateLimiter', 390], ['TimeLimiter', 530], ['Bulkhead', 670]];
  function gate(name, x, s, o) { o = o || {}; const g = R.G(x, 190, s); el('rect', { x: -14, y: -110, width: 28, height: 220, rx: 6, fill: o.hot ? MCOL[name] : PANEL, stroke: MCOL[name], 'stroke-width': 2.5, opacity: o.op ?? 1 }, g);
    tx(0, -122, name, { 'font-size': 14, 'font-weight': 800, fill: MCOL[name], 'text-anchor': 'middle', class: 'mono' }, g); return g; }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [['io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker', GOOD, '어노테이션'], ['io.github.resilience4j.circuitbreaker.CircuitBreaker', MUT, '함수형 클래스']].forEach(([p, col, lab], i) => {
        const y = 120 + i * 110, s = pop(u, 0.3 + i * 0.6); card(480, y, 760, 60, { rx: 10, stroke: col, sw: 2, s }); mono(120, y + 6, p, { 'font-size': 15.5, fill: col, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.6) });
        tx(840, y + 6, lab, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.4 + i * 0.6) }); });
      sub(480, 340, '이름은 같고 패키지가 다르다 · import를 꼭 확인', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    const all5 = k === 6, gs = all5 ? G5 : G3.slice(0, k === 1 ? 1 : k === 2 ? 2 : 3), bodyX = all5 ? 840 : 770;
    gs.forEach(([n, x], i) => { const fresh = (k === 1 && i === 0) || (k === 2 && i === 1) || (k === 3 && i === 2); gate(n, x, fresh ? pop(u, 0.2) : all5 ? pop(u, 0.1 + i * 0.15) : 1); });
    el('line', { x1: 40, y1: 190, x2: bodyX - 80, y2: 190, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    if (k >= 4) card(bodyX, 190, 150, 64, { rx: 10, text: 'pay()\nGET /pay/{id}', fs: 14, mono: true, fill: SOFT, s: k === 4 ? pop(u, 0.2) : 1 });
    if (k === 1) { pill(140, 350, 'name = "payment"', INFO, pop(u, 0.8), { mono: true }); sub(480, 350, 'yml의 retry.instances.payment와 같은 이름', fade(u, 1.2), { 'font-size': 14.5 }); return; }
    if (k === 2) { // 시도 3번이 모두 회로를 지난다
      const tries = 3; let tally = 0;
      for (let i = 0; i < tries; i++) { const a = 0.15 + i * 0.75, v = seg(u, a, a + 0.6); if (u > a + 0.45) tally++;
        dot([[150, 190], [400, 190], [150, 190]], v, INFO, 7); if (v > 0.45 && v < 0.75) cross(420, 160, 9, 1); }
      card(340, 360, 210, 48, { rx: 10, stroke: BAD, sw: 2 }); mono(340, 366, `회로 집계: 실패 ${tally}`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      grow(340, 300, 340, 334, fade(u, 2.4), BAD); pill(600, 360, 'payFallback', ACC, pop(u, 2.4), { mono: true });
      grow(445, 360, 525, 360, E(u, 2.4, 2.8), ACC); return; }
    if (k === 3) { for (let i = 0; i < 20; i++) el('rect', { x: 600 + (i % 10) * 18, y: 320 + Math.floor(i / 10) * 18, width: 14, height: 14, rx: 2, fill: i < Math.round(lerp(0, 20, E(u, 0.6, 1.8))) ? ACC : SOFT });
      tx(600, 308, '동시 20 칸', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); sub(300, 340, '앞 문에서 걸러진 호출은 칸을 쓰지 않는다', fade(u, 1.4), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 4) { dot([[40, 190], [bodyX - 76, 190]], seg(u, 0.4, 1.8), INK, 8); if (u > 1.8) check(bodyX, 250, 11, pop(u, 1.8));
      sub(480, 360, '본문은 평범한 RestClient 호출 · 방어 코드는 한 줄도 없다', fade(u, 1.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 5) { [['String pay(String orderId)', SOFT, GRID], ['String payFallback(String orderId, Throwable t)', ACCBG, ACC]].forEach(([s, f, st], i) => {
        card(400, 345 + (i ? 46 : 0), 460, 38, { rx: 8, text: s, fs: 14, mono: true, fill: f, stroke: st, s: pop(u, 0.3 + i * 0.5) }); });
      tx(650, 397, '+ Throwable', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) }); return; }
    // k6
    G5.forEach(([n, x], i) => mono(x, 330, String(i + 1), { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: MCOL[n], opacity: fade(u, 0.8 + i * 0.2) }));
    dot([[40, 190], [bodyX - 76, 190]], seg(u, 1.0, 2.6), INK, 7);
    sub(480, 376, '기본 순서 · resilience4j.*.aspect-order로 바꿀 수 있다', fade(u, 1.6), { 'font-size': 15, fill: INK }); }

  // ---------- 5. 관측 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(140, 210, 190, 56, { rx: 10, text: 'actuator', fs: 16, fw: 800, s: pop(u, 0.2) });
      ['health', 'metrics', 'prometheus', 'circuitbreakers'].forEach((s, i) => { const y = 80 + i * 86, v = E(u, 0.5 + i * 0.3, 1.0 + i * 0.3);
        el('path', { d: `M235,210 C300,210 300,${y} ${lerp(235, 380, v)},${y}`, fill: 'none', stroke: GRID, 'stroke-width': 2, opacity: v > 0 ? 1 : 0 });
        if (v >= 1) pill(480, y, '/actuator/' + s, i >= 2 ? ACC : INK, pop(u, 1.0 + i * 0.3), { mono: true }); });
      sub(780, 380, '필요한 것만 연다 · * 는 정보 노출', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1) { [['CLOSED', 'UP', GOOD], ['OPEN', 'DOWN', BAD], ['HALF_OPEN', 'UNKNOWN', WARN]].forEach(([s, h, col], i) => {
        const y = 90 + i * 80, v = E(u, 0.3 + i * 0.4, 0.9 + i * 0.4); card(230, y, 180, 52, { rx: 26, text: s, fs: 15, mono: true, fw: 800, stroke: col, color: col, s: pop(u, 0.2 + i * 0.4) });
        grow(330, y, lerp(330, 520, v), y, v, MUT); if (v >= 1) card(600, y, 150, 52, { rx: 10, text: h, fs: 16, mono: true, fw: 800, fill: col, stroke: 'none', color: PANEL }); });
      tx(415, 40, 'health에 보이는 회로 상태', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      pill(420, 370, 'tag application=order-service', ACC, pop(u, 1.9), { mono: true }); return; }
    if (k === 2) { terminal(140, 60, 680, 220, ['$ curl /actuator/circuitbreakers', '{ "payment": { "state": "CLOSED" } }', ['# CLOSED 정상 · OPEN 차단 · HALF_OPEN 탐색', 'var(--off)']], 1 + E(u, 0.3, 2.0) * 2, { title: 'GET', fs: 15 });
      sub(480, 340, 'HALF_OPEN에서 시험이 실패하면 곧바로 다시 OPEN', fade(u, 2.1), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { const ax = axes(130, 70, 640, 250, { x: [0, 10], y: [0, 100], yt: [0, 50, 100], yl: 'failure.rate (%)', xl: '시간 (예시 추이)' });
      el('line', { x1: ax.X(0), y1: ax.Y(50), x2: ax.X(10), y2: ax.Y(50), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }); tx(ax.X(10), ax.Y(50) - 8, '임계치 50', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', 'font-weight': 700 });
      line(ax, [[0, 8], [2, 12], [4, 30], [5, 44], [6, 56], [7, 47], [8, 54], [9, 46], [10, 52]], E(u, 0.2, 2.4), WARN);
      sub(480, 400, '임계치 근처에서 오르내리면 회로가 자꾸 열린다 · 창 크기부터 본다', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 4) { const ax = axes(130, 90, 640, 200, { x: [0, 10], y: [0, 1], yt: [0, 1], yl: 'resilience4j_circuitbreaker_state{state="open"}', xl: '시간 (예시)' });
      line(ax, [[0, 0], [5, 0], [5, 1], [8, 1], [8, 0], [10, 0]], E(u, 0.2, 2.4), BAD, { sw: 3 });
      pill(ax.X(8.9), ax.Y(1) + 10, 'Grafana', INFO, pop(u, 2.0), { fs: 13.5 }); return; }
    // k5: 알람
    const ring = u > 0.6 ? Math.sin(t * 18) * 8 * (1 - E(u, 0.6, 2.4)) : 0, g = R.G(240, 180, pop(u, 0.2));
    g.setAttribute('transform', `translate(240 180) rotate(${ring})`);
    el('path', { d: 'M-30,20 Q-30,-34 0,-36 Q30,-34 30,20 L38,30 L-38,30 Z', fill: WARNBG, stroke: WARN, 'stroke-width': 3 }, g); el('circle', { cx: 0, cy: 38, r: 7, fill: WARN }, g);
    card(560, 120, 330, 52, { rx: 10, text: '알람: payment 회로 OPEN', fs: 16, fw: 800, stroke: BAD, color: BAD, s: pop(u, 0.8) });
    grow(560, 150, 560, 210, E(u, 1.3, 1.7), MUT); card(560, 240, 330, 56, { rx: 10, text: '근본 원인 추적\n느린 DB · 죽은 의존성', fs: 14.5, s: pop(u, 1.7) });
    mono(480, 360, '장애 인지: 사용자 문의 → 알람', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: 'Hystrix 대신 Resilience4j를 쓰는 가장 직접적인 이유는 무엇인가?',
      o: ['Hystrix가 2018년부터 유지보수만 하는 상태라 새로 도입하지 않는다', 'Resilience4j만 동기 호출을 감쌀 수 있다', 'Hystrix는 Spring에서 실행되지 않는다'], a: 0,
      why: 'Hystrix는 maintenance mode라 신규 개발이 멈췄다. Resilience4j는 Java 8 함수형 기반이라 가볍고 모듈을 골라 쓴다.' },
    { q: 'Decorators.ofSupplier(call).withBulkhead(b).withRateLimiter(l).withCircuitBreaker(cb).withRetry(r)에서 가장 바깥 층은 무엇인가?',
      o: ['Bulkhead', 'CircuitBreaker', 'Retry'], a: 2,
      why: '각 with…가 지금까지 만든 Supplier를 다시 감싸므로 마지막에 부른 withRetry가 가장 바깥이다.' },
    { q: 'application.yml에서 sliding-window-size 10, failure-rate-threshold 50이면 언제 회로가 열리는가?',
      o: ['최근 10번 중 실패가 5번 이상일 때', '실패가 10번 연속으로 날 때', '최근 10번 중 실패가 6번 이상일 때'], a: 0,
      why: '실패율이 임계치와 같거나 크면 OPEN이다. 10번 중 5번이면 50%라 바로 열린다.' },
    { q: '@Retry, @CircuitBreaker를 같은 메서드에 붙이고 호출이 3번 모두 실패했다. 회로가 세는 실패는 몇 건인가?',
      o: ['1건, 재시도를 다 쓴 뒤 한 번만 센다', '3건, Retry가 바깥이라 시도마다 회로를 지난다', '0건, Retry가 실패를 감춘다'], a: 1,
      why: '기본 순서에서 Retry가 CircuitBreaker를 감싼다. 시도 하나하나가 회로를 지나므로 실패 3건이 집계된다.' },
    { q: '회로 상태를 health에 넣었을 때 OPEN인 회로는 health에 어떻게 보이는가?',
      o: ['UP', 'UNKNOWN', 'DOWN'], a: 2,
      why: 'CLOSED는 UP, OPEN은 DOWN, HALF_OPEN은 UNKNOWN으로 이어진다. 그래서 프로브나 알람이 이 상태에 반응할 수 있다.' },
  ];

  const summary = [
    '보호 없이 원격 호출을 하면 상대가 3초 걸릴 때 내 스레드도 3초 묶인다.',
    'Resilience4j는 다섯 모듈 중 필요한 것만 골라 함수 하나에 겹겹이 씌운다.',
    '어노테이션은 Retry가 가장 바깥, Bulkhead가 가장 안쪽이라 시도마다 회로가 한 번씩 센다.',
    '임계치는 yml에 선언하고, actuator와 Prometheus로 회로가 열리는 순간을 알람으로 받는다.',
  ];
  const review = [
    { q: '결제 호출에 @Retry와 @CircuitBreaker를 붙였더니 장애 때 회로가 예상보다 빨리 열렸다. 가장 그럴듯한 이유는?',
      o: ['Retry가 바깥이라 재시도한 시도까지 모두 실패로 집계됐다', 'Bulkhead가 실패를 대신 셌다', 'fallbackMethod가 회로를 열었다'], a: 0,
      why: '기본 순서에서 시도마다 회로를 지나므로 요청 하나가 실패 3건을 만든다. 창 10에서는 그만큼 빨리 50%에 닿는다.' },
    { q: '동기 메서드에 @TimeLimiter를 붙였는데 시간 제한이 걸리지 않는다. 먼저 고칠 것은?',
      o: ['timeout-duration을 더 짧게 줄인다', '메서드가 CompletableFuture를 돌려주게 바꾼다', 'Retry의 max-attempts를 늘린다'], a: 1,
      why: 'TimeLimiter는 비동기 결과를 기다리며 시간을 잰다. 동기 Supplier 체인에는 끼울 수 없다.' },
    { q: '@CircuitBreaker(name = "paymnet")처럼 이름에 오타가 났다. 어떤 일이 생기나?',
      o: ['컴파일 오류로 빌드가 멈춘다', '회로가 아예 만들어지지 않아 호출이 막힌다', 'yml의 payment 설정 대신 기본 설정으로 조용히 동작한다'], a: 2,
      why: 'name은 yml instances 이름과 이어지는 열쇠다. 맞는 이름이 없으면 기본값으로 만들어져 의도한 임계치가 적용되지 않는다.' },
  ];

  R.page({ title: '데코레이터 계층 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
