/* III-1-4 클라이언트 사이드 로드밸런싱 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 호출하는 서비스가 쥔 인스턴스 목록과 그 위를 도는 RoundRobin 화살표, DOWN 인스턴스가 목록에서 빠지는 모습,
 * 필터(health·zone·hint·caching)를 지나며 후보가 줄어드는 깔때기, Feign 인터페이스가 HTTP 요청으로 바뀌는 모습.
 * 인스턴스 주소(10.0.0.1x:8082, 10.0.0.2x:8084)·주기(10s, 35s)는 페이지 코드에서, 배분 순서는 STEPS 의 picks 에서 읽는다.
 * 헬스체크 타임라인에서 인스턴스가 죽는 시각과 Random 배분 결과는 "예시" 다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, server, dbIcon, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 인스턴스 상자 한 줄 (세로로 쌓는다). o.down: Set, o.hit: 지금 고른 번호, o.cnt: 배분 수 배열
  function insts(x, ys, names, o) { o = o || {};
    names.forEach((n, i) => { const y = ys[i], dn = o.down && o.down.has(i), hit = o.hit === i, sc = o.s ? o.s(i) : 1; if (sc <= 0) return;
      card(x, y, o.w || 190, 40, { rx: 8, s: sc, stroke: dn ? BAD : hit ? ACC : INK, fill: dn ? BADBG : hit ? ACCBG : PANEL, sw: hit ? 3 : 2 });
      if (sc < 0.5) return;
      el('circle', { cx: x - (o.w || 190) / 2 + 16, cy: y, r: 5, fill: dn ? BAD : GOOD });
      mono(x - (o.w || 190) / 2 + 28, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, fill: dn ? BAD : INK });
      if (dn) tx(x + (o.w || 190) / 2 - 10, y + 5, 'DOWN', { 'font-size': 13.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
      else if (o.cnt) mono(x + (o.w || 190) / 2 - 10, y + 5, String(o.cnt[i]), { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' }); }); }
  // picks 를 u 에 따라 하나씩 보낸다. 돌려주는 값: 지금 고른 번호, 지금까지 배분 수
  function play(picks, n, u, a, b) { const m = picks.length, f = clamp((u - a) / (b - a)), done = Math.min(m, Math.floor(f * m + 1e-6));
    const cnt = new Array(n).fill(0); for (let i = 0; i < done; i++) cnt[picks[i]]++;
    const cur = f > 0 && f < 1 ? picks[Math.min(m - 1, Math.floor(f * m))] : null, local = (f * m) % 1; return { cur, cnt, local, idx: Math.floor(f * m) }; }
  // 호출자 쪽 목록 카드 + RoundRobin 화살표
  function listCard(x, y, rows, o) { o = o || {}; const h = rows.length * 30 + 40;
    el('rect', { x, y, width: o.w || 210, height: h, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2.5, opacity: o.op ?? 1 });
    tx(x + 12, y + 22, o.title || '인스턴스 목록', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: o.op ?? 1 });
    rows.forEach((r, i) => { const yy = y + 48 + i * 30, dn = o.down && o.down.has(i);
      mono(x + 30, yy, r, { 'font-size': 14, fill: dn ? OFF : INK, 'text-decoration': dn ? 'line-through' : null, opacity: o.op ?? 1 });
      if (o.ptr === i) mono(x + 10, yy, '▶', { 'font-size': 14, fill: ACC, 'font-weight': 800 }); }); return h; }

  // ---------- 1. 서버 LB vs 클라이언트 LB ----------
  const IY = [110, 200, 290], IX = 820, IP = ['10.0.0.11:8082', '10.0.0.12:8082', '10.0.0.13:8082'];
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k === 4) { // 의존성
      card(480, 200, 560, 230, { rx: 14, stroke: INK, fill: SOFT, s: pop(u, 0.2) });
      mono(220, 112, 'spring-cloud-starter-netflix-eureka-client', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.4) });
      card(480, 210, 460, 70, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 0.9) });
      mono(480, 216, 'spring-cloud-starter-loadbalancer', { 'font-size': 15.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      tx(480, 284, 'Eureka 클라이언트를 쓰면 이미 들어 있다', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      card(480, 370, 300, 40, { rx: 20, stroke: GRID, text: 'Netflix Ribbon · 더 이상 쓰지 않는다', fs: 14, color: MUT, s: pop(u, 2.0) }); return; }
    person(70, 200, k === 0 ? '클라이언트' : 'order 를 부르는 서비스', {});
    const down = k === 3 ? new Set([2]) : new Set();
    if (k === 0) { card(400, 200, 140, 70, { rx: 10, text: 'LB proxy', fs: 16, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 0.2) });
      grow(100, 200, 328, 200, E(u, 0.3, 0.7), MUT); IY.forEach((y, i) => grow(472, 200, IX - 98, y, E(u, 0.6 + i * 0.1, 1.0 + i * 0.1), MUT));
      insts(IX, IY, ['inst-1', 'inst-2', 'inst-3'], {});
      [0, 1, 2].forEach((i) => dot([[100, 200], [400, 200], [IX - 98, IY[i]]], seg(u, 1.0 + i * 0.5, 1.6 + i * 0.5), INFO, 7));
      mono(400, 280, '홉 +1', { 'font-size': 18, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      sub(400, 308, '프록시가 대신 고른다 · 병목이 될 수 있다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    const pr = b.picks || [], P = play(pr, 3, u, 0.8, 2.6);
    const ptr = k >= 1 ? P.cur : null;
    listCard(150, 120, k >= 2 ? IP : ['inst-1', 'inst-2', 'inst-3'], { ptr, down, w: 230 });
    insts(IX, IY, k >= 2 ? IP : ['inst-1', 'inst-2', 'inst-3'], { hit: P.cur, down, cnt: P.cnt, w: 220 });
    if (k === 1) { card(500, 200, 140, 70, { rx: 10, text: 'LB proxy', fs: 16, stroke: GRID, color: OFF, op: 1 - fade(u, 0.1, 0.5) * 0.6 }); cross(500, 200, 16, pop(u, 0.4)); }
    if (P.cur != null && !down.has(P.cur)) dot([[380, 200], [IX - 110, IY[P.cur]]], P.local, ACC, 8);
    if (k === 2) { dbIcon(500, 70, 'Eureka', { s: 0.7 });
      grow(455, 70, 382, 130, E(u, 0.2, 0.6), INFO);
      mono(150, 330, 'lb://order-service', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      if (P.cur != null) mono(150, 360, '→ ' + IP[P.cur], { 'font-size': 15, 'font-weight': 800, fill: ACC });
      return; }
    if (k === 3) { card(500, 370, 260, 40, { rx: 20, stroke: GRID, text: 'Netflix Ribbon · 유지보수 종료', fs: 14, color: MUT, s: pop(u, 1.8) }); cross(650, 370, 10, pop(u, 2.0));
      note(150, 330, '다음 호출부터 inst-3 은 후보가 아니다', fade(u, 0.5), { fill: BAD }); return; }
    note(150, 330, '목록을 쥔 호출자가 직접 고른다 · 프록시 홉 없음', fade(u, 1.2), { fill: ACC }); }

  // ---------- 2. @LoadBalanced RestTemplate ----------
  const PY = [110, 200, 290], PX = 830;
  function s2(t, c) { const { k, u } = c, b = c.beat;
    const P = play(b.picks || [], 3, u, 0.8, 2.6);
    insts(PX, PY, ['payment inst-1', 'payment inst-2', 'payment inst-3'], { hit: P.cur, cnt: k === 3 ? P.cnt : null, w: 200 });
    // RestTemplate 빈 + 인터셉터 플러그
    const rt = (x, y, name, o) => { o = o || {}; card(x, y, 210, 56, { rx: 10, text: name, fs: 15, mono: true, stroke: o.col || INK, color: o.col || INK, s: o.s, fill: o.fill });
      if (o.plug) { const s = o.plug; card(x + 130, y, 70, 30, { rx: 6, text: 'LB', fs: 14, stroke: ACC, color: PANEL, fill: ACC, s }); } };
    if (k === 0) { rt(220, 120, 'RestTemplate', { s: pop(u, 0.2), plug: pop(u, 1.0) });
      pill(220, 60, '@LoadBalanced', ACC, pop(u, 0.8), { mono: true, fs: 14, fill: ACCBG });
      note(80, 220, '서비스명 → 인스턴스 주소', fade(u, 1.5), { fill: ACC }); note(80, 246, '치환 인터셉터가 끼워진다', fade(u, 1.6), { fill: ACC });
      card(220, 330, 260, 44, { rx: 8, text: '@LoadBalanced 없으면 호스트명 그대로', fs: 14, stroke: GRID, color: MUT, s: pop(u, 2.0) }); return; }
    if (k === 1) { rt(220, 120, 'RestTemplate', { plug: 1 });
      rt(220, 240, 'WebClient.Builder', { s: pop(u, 0.2), plug: pop(u, 1.0), col: INFO });
      pill(220, 186, '@LoadBalanced', ACC, pop(u, 0.8), { mono: true, fs: 14, fill: ACCBG });
      card(220, 340, 210, 40, { rx: 8, text: 'WebClient 자체가 아니다', fs: 14, stroke: BAD, color: BAD, s: pop(u, 1.6) }); return; }
    rt(220, 120, 'RestTemplate', { plug: 1 });
    card(220, 280, 210, 70, { rx: 10, stroke: INK, fill: SOFT, s: k === 2 ? pop(u, 0.2) : 1, text: 'PaymentClient', fs: 15, mono: true });
    grow(220, 150, 220, 242, k === 2 ? E(u, 0.6, 1.2) : 1, ACC); if (k === 2) mono(232, 200, '생성자 주입', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.0) });
    if (k === 2) { note(380, 380, '쓰는 쪽 코드는 평범하다 · 인터셉터는 이미 들어 있다', fade(u, 1.6)); return; }
    // k3: http://payment-service/payments 가 인스턴스 주소로
    mono(360, 60, 'http://payment-service/payments', { 'font-size': 15, 'font-weight': 700 });
    if (P.cur != null) { el('line', { x1: 452, y1: 66, x2: 452 + tw('payment-service', 15) * P.local, y2: 66, stroke: ACC, 'stroke-width': 3 });
      mono(360, 92, `→ payment inst-${P.cur + 1}`, { 'font-size': 15, 'font-weight': 800, fill: ACC });
      dot([[330, 280], [PX - 102, PY[P.cur]]], P.local, ACC, 8); }
    sub(560, 380, '요청마다 RoundRobin 으로 다음 인스턴스', fade(u, 0.6), { 'font-size': 14.5 }); }

  // ---------- 3. 전략과 공급자 ----------
  const Q4 = [80, 160, 240, 320], QX = 830, NM4 = ['inst-1', 'inst-2', 'inst-3', 'inst-4'];
  function s3(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { [['payment-service', 'PaymentLbConfig', ACC, 120], ['order-service', '기본 RoundRobin', MUT, 230], ['catalog-service', '기본 RoundRobin', MUT, 310]].forEach(([s, cfg, col, y], i) => {
        mono(80, y + 5, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.3) });
        pill(520, y, cfg, col, pop(u, 0.5 + i * 0.3), { mono: true, fs: 14, fill: i === 0 ? ACCBG : PANEL }); });
      mono(80, 60, '@LoadBalancerClient(name = "payment-service")', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      sub(480, 390, '설정 클래스 자신에는 @Configuration 을 붙이지 않는다 (붙이면 전역이 된다)', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    const strat = k === 1 ? (u < 1.4 ? 'RoundRobin' : 'Random') : b.strategy;
    if (k <= 2) { el('rect', { x: 60, y: 90, width: 360, height: 90, rx: 12, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      mono(70, 80, 'ReactorLoadBalancer<ServiceInstance>', { 'font-size': 14.5, 'font-weight': 700 });
      card(240, 135, 220, 52, { rx: 10, text: strat + 'LoadBalancer', fs: 15, mono: true, stroke: strat === 'Random' ? WARN : ACC, color: strat === 'Random' ? WARN : ACC, s: k === 1 ? pop(u, u < 1.4 ? 0.2 : 1.4) : 1 });
      if (k === 1) { note(60, 240, '빈 하나로 전략을 갈아끼운다', fade(u, 1.8)); mono(60, 270, 'env.getProperty(PROPERTY_NAME) = "payment-service"', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); } }
    const down = b.down ? new Set([3]) : new Set(), np = (b.picks || []).length;
    if (k === 2 || k === 4) { const P = play(b.picks, 4, u, k === 4 ? 1.4 : 0.6, 2.6);
      insts(QX, Q4, NM4, { hit: P.cur, cnt: P.cnt, down, w: 190 });
      if (P.cur != null) dot([[440, 200], [QX - 97, Q4[P.cur]]], P.local, k === 2 ? WARN : ACC, 8);
      if (k === 2) { mono(60, 240, `고른 순서: inst ${b.picks.map((p) => p + 1).join(', ')}`, { 'font-size': 15, 'font-weight': 700, fill: WARN });
        note(60, 272, '순번 없이 매번 무작위 · 고르게 나뉘지 않을 수 있다', fade(u, 2.2)); sub(60, 300, '배분 순서는 예시', 1, { 'text-anchor': 'start' }); return; } }
    if (k === 3) { // 공급자(목록) ↔ 전략(고르기)
      card(250, 200, 300, 150, { rx: 12, stroke: INFO, sw: 2.5, fill: INFOBG, s: pop(u, 0.2) });
      tx(250, 150, 'ServiceInstanceListSupplier', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.3) });
      tx(250, 178, '어떤 목록에서 고를지', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      NM4.forEach((n, i) => mono(160 + (i % 2) * 100, 214 + Math.floor(i / 2) * 26, n, { 'font-size': 14, opacity: fade(u, 0.6 + i * 0.1) }));
      grow(402, 200, 540, 200, E(u, 1.0, 1.4), MUT);
      card(700, 200, 300, 150, { rx: 12, stroke: WARN, sw: 2.5, fill: WARNBG, s: pop(u, 1.3) });
      tx(700, 150, 'ReactorLoadBalancer', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 1.4) });
      tx(700, 178, '어떻게 고를지', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(700, 226, 'Random → inst-3', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(480, 350, '두 관심사는 따로 바꿀 수 있다', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 4) { // 깔때기: discovery 4 → health 3
      const F = [['withDiscoveryClient', '4'], ['withHealthChecks', '3'], ['withZonePreference', '3'], ['withHints', '3'], ['withCaching', '3']];
      F.forEach(([s, n], i) => { const y = 60 + i * 62, w = 360 - i * 24, s2 = pop(u, 0.2 + i * 0.22);
        card(250, y, w, 44, { rx: 8, s: s2, stroke: i === 1 ? BAD : INFO, fill: i === 1 ? BADBG : PANEL });
        if (s2 > 0.5) { mono(250 - w / 2 + 14, y + 5, '.' + s + '()', { 'font-size': 14.5, 'font-weight': 700, fill: i === 1 ? BAD : INFO }); mono(250 + w / 2 - 12, y + 5, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end' }); } });
      note(60, 400, 'withHealthChecks 가 DOWN 인 inst-4 를 걷어낸다', fade(u, 1.2), { fill: BAD }); } }

  // ---------- 4. 설정값과 Feign ----------
  function s4(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { // 헬스체크 주기 10s: 죽은 뒤 다음 폴링까지는 목록에 남는다
      const ax = R.axes(120, 120, 720, 120, { x: [0, 30], y: [0, 1], xt: [0, 10, 20, 30], xl: '초' });
      [0, 10, 20, 30].forEach((s, i) => { el('circle', { cx: ax.X(s), cy: 180, r: 10, fill: INFO, opacity: fade(u, 0.2 + i * 0.2) }); });
      tx(ax.X(0), 160, '헬스 폴링', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      const f = E(u, 1.0, 1.8); el('rect', { x: ax.X(13), y: 196, width: (ax.X(20) - ax.X(13)) * f, height: 30, rx: 4, fill: BAD, opacity: 0.35 });
      el('line', { x1: ax.X(13), y1: 130, x2: ax.X(13), y2: 240, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.9) });
      tx(ax.X(13), 118, 'inst-4 죽음 (예시 13s)', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      tx(ax.X(16.5), 216, 'DOWN 인데 후보', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      mono(120, 330, 'health-check.interval: 10s', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) });
      note(120, 364, '주기만큼 죽은 인스턴스가 남을 수 있다 · 기본값은 25s', fade(u, 2.1)); return; }
    if (k === 1) { // 캐시 35s: 새 인스턴스가 늦게 보인다
      const ax = R.axes(120, 120, 720, 120, { x: [0, 70], y: [0, 1], xt: [0, 35, 70], xl: '초' });
      [0, 35, 70].forEach((s, i) => { el('rect', { x: ax.X(s) - 6, y: 166, width: 12, height: 28, rx: 3, fill: ACC, opacity: fade(u, 0.2 + i * 0.2) }); });
      tx(ax.X(0), 150, '목록 새로 받기', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
      const f = E(u, 1.0, 1.8); el('rect', { x: ax.X(5), y: 200, width: (ax.X(35) - ax.X(5)) * f, height: 26, rx: 4, fill: WARN, opacity: 0.35 });
      tx(ax.X(5), 118, 'inst-5 증설 (예시 5s)', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.9) });
      tx(ax.X(20), 218, '아직 목록에 없다', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      mono(120, 330, 'cache.ttl: 35s', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) });
      note(120, 364, '디스커버리 호출은 줄고, 증설 반영은 늦어진다', fade(u, 2.1)); return; }
    if (k === 3) { // Feign 인터페이스 → HTTP 요청
      card(230, 190, 400, 170, { rx: 10, stroke: INFO, sw: 2, fill: INFOBG, s: pop(u, 0.1) });
      [['@FeignClient(name = "payment-service")', INFO], ['interface PaymentFeignClient {', INK], ['  @PostMapping("/payments")', INFO], ['  PaymentResult charge(req);', ACC], ['}', INK]].forEach(([s, col], i) =>
        mono(44, 136 + i * 26, s, { 'font-size': 14.5, 'font-weight': i === 3 ? 800 : 600, fill: col, opacity: fade(u, 0.2 + i * 0.1) }));
      fly(250, 216, 600, 120, seg(u, 0.9, 1.7), 'charge(req)', { mono: true });
      if (u > 1.7) { card(720, 120, 300, 80, { rx: 10, stroke: ACC, sw: 2.5, fill: PANEL, s: pop(u, 1.7) });
        mono(590, 112, 'POST http://payment-service', { 'font-size': 14, 'font-weight': 800, fill: ACC }); mono(590, 136, '/payments  body: req', { 'font-size': 14, fill: INK }); }
      sub(720, 210, '구현체는 프레임워크가 만든다', fade(u, 2.2), { 'font-size': 14.5 });
      insts(720, [280, 330, 380], ['inst-1', 'inst-2', 'inst-3'], { w: 180, s: (i) => pop(u, 2.2 + i * 0.1) }); return; }
    // k2 hint, k4 Feign 호출 흐름 (inst-4 DOWN)
    const down = new Set([3]), P = play(b.picks, 4, u, 0.6, 2.6);
    const names = k === 2 ? ['inst-1', 'inst-2 · canary', 'inst-3', 'inst-4'] : NM4;
    insts(QX - 20, Q4, names, { hit: P.cur, cnt: P.cnt, down, w: 230 });
    person(90, 200, 'order-service', {});
    if (P.cur != null) dot([[120, 200], [QX - 135, Q4[P.cur]]], P.local, ACC, 8);
    if (k === 2) { mono(240, 70, 'hint.payment-service: canary', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) });
      mono(240, 98, 'metadata-map.zone: ap-northeast-2a', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4) });
      note(240, 330, 'hint 가 맞는 인스턴스로 쏠린다 · 의도한 쏠림인지 확인', fade(u, 2.0), { fill: WARN }); return; }
    mono(240, 70, 'paymentFeignClient.charge(req)', { 'font-size': 15, 'font-weight': 700, fill: INFO });
    note(240, 330, '살아 있는 3대에만 RoundRobin', fade(u, 2.0), { fill: ACC }); }

  // ---------- 5. lb:// 와 스케일 아웃 ----------
  const IP5 = ['10.0.0.21:8084', '10.0.0.22:8084', '10.0.0.23:8084', '10.0.0.24:8084', '10.0.0.25:8084'], Y5 = [70, 135, 200, 265, 330];
  function s5(t, c) { const { k, u } = c;
    card(170, 120, 240, 64, { rx: 10, text: 'OrderProcessor', fs: 15, mono: true, stroke: INK, fill: SOFT, s: k === 0 ? pop(u, 0.2) : 1 });
    pill(170, 66, 'WebClient.Builder · @LoadBalanced', ACC, k === 0 ? pop(u, 0.8) : 1, { mono: true, fs: 13.5, fill: ACCBG });
    if (k === 0) { note(60, 220, '주입만 해 두었다 · 아직 호출은 없다', fade(u, 1.4)); return; }
    const uri = 'lb://payment-service/payments';
    mono(60, 220, uri, { 'font-size': 16, 'font-weight': 700 });
    el('rect', { x: 57, y: 202, width: tw('lb', 16) + 6, height: 24, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: k === 1 ? fade(u, 0.4) : 1 });
    if (k === 1) { card(220, 310, 360, 56, { rx: 10, text: 'ReactorLoadBalancer\nExchangeFilterFunction', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.9) });
      grow(80, 230, 120, 282, E(u, 0.6, 0.9), ACC); note(420, 316, 'lb 스킴을 보면 끼어든다', fade(u, 1.5), { fill: ACC });
      sub(250, 390, 'http:// 로 쓰면 그냥 호스트명이다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    const n = k === 4 ? 5 : 3, down = new Set([1]);
    insts(800, Y5.slice(0, n), IP5.slice(0, n), { down, w: 230, hit: k === 3 && u > 1.4 ? 0 : null, s: (i) => (k === 4 && i >= 3 ? pop(u, 0.3 + (i - 3) * 0.3) : k === 2 ? pop(u, 0.2 + i * 0.2) : 1) });
    if (k === 2) { mono(60, 290, 'DiscoveryClient → 3개', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      if (u > 1.2) { mono(60, 322, '헬스체크: 22 DOWN 제외', { 'font-size': 15, 'font-weight': 700, fill: BAD }); }
      if (u > 1.8) mono(60, 354, '후보 = [21, 23]', { 'font-size': 17, 'font-weight': 800, fill: ACC }); return; }
    if (k === 3) { mono(60, 290, '후보 = [21, 23]', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      dot([[300, 220], [685, Y5[0]]], seg(u, 0.3, 1.4), ACC, 8);
      const s = 'http://10.0.0.21:8084/payments', m = Math.round(s.length * E(u, 1.3, 2.3)); mono(60, 330, s.slice(0, m), { 'font-size': 16, 'font-weight': 800, fill: ACC });
      sub(250, 370, '치환은 요청 직전 · 코드에는 서비스명만 남는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k4: 5대 · 4 활성, RoundRobin 이 살아 있는 4대를 돈다
    const alive = [0, 2, 3, 4], P = play([0, 1, 2, 3, 0, 1, 2, 3], 4, u, 1.0, 2.6), hitI = P.cur != null ? alive[P.cur] : null;
    if (hitI != null) dot([[300, 220], [685, Y5[hitI]]], P.local, ACC, 8);
    mono(60, 290, '5대 등록 · 4대 활성', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
    note(60, 322, '증설은 자동 편입, DOWN 은 자동 제외', fade(u, 1.2));
    note(60, 352, '호출 코드는 그대로다', fade(u, 1.5));
    sub(250, 396, 'Gateway 는 남북(외부→내부), LoadBalancer 는 동서(서비스 간)', fade(u, 2.0), { 'font-size': 14.5 }); }

  const quiz = [
    { q: '클라이언트 사이드 로드밸런싱에서 인스턴스를 고르는 쪽은 누구인가?',
      o: ['앞단의 LB 프록시', '호출하는 서비스 자신', 'Eureka 서버'], a: 1,
      why: '호출자가 디스커버리에서 목록을 받아 전략으로 하나를 고른다. 그래서 프록시 홉이 없다.' },
    { q: 'reactive 스택에서 lb 호출을 쓰려면 @LoadBalanced를 어디에 붙이나?',
      o: ['WebClient 인스턴스', 'Controller 메서드', 'WebClient.Builder 빈'], a: 2,
      why: 'Builder에 붙여야 거기서 만든 WebClient에 LB 필터가 들어간다.' },
    { q: 'ServiceInstanceListSupplier와 ReactorLoadBalancer의 역할 차이는?',
      o: ['공급자는 후보 목록을 만들고, LoadBalancer는 그중 하나를 고른다', '둘 다 같은 일을 하는 이름만 다른 빈이다', '공급자가 고르고, LoadBalancer는 헬스체크를 한다'], a: 0,
      why: 'withHealthChecks·withZonePreference 같은 필터는 목록을 거르고, RoundRobin·Random은 거른 목록에서 고른다.' },
    { q: 'health-check.interval을 10s로 두면 인스턴스가 죽은 직후 어떤 일이 생길 수 있나?',
      o: ['즉시 목록에서 빠진다', '다음 폴링까지 최대 10초 동안 후보로 남는다', '목록 전체가 비워진다'], a: 1,
      why: '헬스 상태는 주기마다 다시 확인한다. 주기가 길수록 죽은 인스턴스로 가는 요청이 오래 남는다.' },
    { q: 'payment-service 인스턴스를 2대 더 늘렸다. lb://payment-service를 쓰는 코드는 어떻게 해야 하나?',
      o: ['새 IP를 코드에 추가하고 다시 배포한다', 'Gateway 설정만 바꾼다', '그대로 둔다 · 다음 목록 갱신부터 자동으로 포함된다'], a: 2,
      why: '코드에는 서비스명만 있다. 디스커버리 목록이 바뀌면 다음 호출부터 새 인스턴스도 후보가 된다.' },
  ];

  const summary = [
    '클라이언트 사이드 LB는 호출하는 서비스가 인스턴스 목록을 들고 직접 하나를 고른다.',
    '@LoadBalanced를 붙인 RestTemplate·WebClient.Builder는 서비스명을 실제 주소로 바꿔 보낸다.',
    '후보 목록은 health·zone·hint·caching 필터가 거르고, 전략은 기본 RoundRobin이 그중 하나를 고른다.',
    '헬스체크 주기와 캐시 TTL 35s 만큼 DOWN 제외와 증설 반영이 늦어질 수 있다.',
  ];
  const review = [
    { q: '인스턴스 하나가 죽었는데 몇 초 동안 그쪽으로 요청이 계속 실패한다. 먼저 볼 설정은?',
      o: ['spring.cloud.loadbalancer.health-check.interval', 'Feign 인터페이스의 메서드 이름', 'Gateway의 StripPrefix'], a: 0,
      why: '헬스체크 주기 동안은 DOWN 인스턴스가 후보에 남는다. 주기를 줄이면 제외가 빨라진다.' },
    { q: 'hint를 canary로 설정한 뒤 한 인스턴스에만 요청이 몰린다. 어떻게 봐야 하나?',
      o: ['RoundRobin 버그다', '캐시 TTL이 너무 짧다', 'hint가 맞는 인스턴스를 고르는 의도된 동작인지 확인한다'], a: 2,
      why: 'hint·zone 필터는 후보를 좁혀 균등 분산을 일부러 깬다. 원한 쏠림인지 확인하고 쓴다.' },
    { q: '외부 요청은 Gateway로, 서비스 간 호출은 Feign으로 받는다. 이 구성에 대한 설명으로 맞는 것은?',
      o: ['둘 중 하나만 써야 한다', 'Gateway는 남북, LoadBalancer·Feign은 동서 트래픽을 맡는 다른 계층이다', 'Feign을 쓰면 디스커버리가 필요 없다'], a: 1,
      why: '서버 사이드 LB와 클라이언트 사이드 LB는 배타적이지 않다. Feign도 내부에서 LoadBalancer로 인스턴스를 고른다.' },
  ];

  R.page({ title: '클라이언트 로드밸런싱 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
