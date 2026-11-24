/* IV-2-1 Service Mesh — 사이드카 · mTLS · 트래픽 분배 · 회복력 · 도구 선택 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, clock, lock, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 파드: 앱 컨테이너 + (있으면) Envoy 사이드카. side 0→1 로 사이드카가 끼어든다
  function mpod(cx, cy, name, o) { o = o || {}; const side = o.side ?? 1, w = 120 + 96 * side, h = o.h || 76;
    const g = card(cx, cy, w, h, { rx: 12, stroke: o.stroke || INK, sw: 2, fill: o.fill || SOFT, s: o.s, op: o.op });
    card(-w / 2 + 62, 4, 104, h - 26, { rx: 7, stroke: INK, sw: 1.6, fill: PANEL, p: g });
    tx(-w / 2 + 62, 0, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono' }, g);
    tx(-w / 2 + 62, 20, ':8000', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, class: 'mono' }, g);
    if (side > 0.02) { const ex = w / 2 - 50; el('rect', { x: ex - 42, y: -h / 2 + 13, width: 84, height: h - 26, rx: 7, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: side }, g);
      tx(ex, 0, 'envoy', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: side }, g);
      if (o.lock) lock(cx + ex + 30, cy + 2, true, GOOD, 0.55 * side * (o.s ?? 1)); }
    if (o.label) tx(0, -h / 2 - 9, o.label, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 700 }, g);
    return g; }
  function flow(route, u, a, n, col, gap) { for (let r = 0; r < n; r++) dot(route, seg(u, a + r * (gap || 0.3), a + r * (gap || 0.3) + 0.8), col || ACC, 5.5); }

  // 1. 사이드카 주입
  const PX = [300, 540, 780];
  function s1(t, c) { const { k, u } = c;
    if (k <= 3) { zone(60, 46, 860, 330, 'namespace: payments', { fill: SOFT, stroke: k === 0 ? ACC : 'none', sw: 2 });
      pill(760, 70, 'istio-injection: enabled', ACC, k === 0 ? pop(u, 0.5) : 1, { mono: true, fs: 13.5 });
      if (k === 0) { tx(490, 220, '스위치는 파드가 아니라 네임스페이스에 단다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
      card(140, 130, 140, 56, { rx: 10, stroke: INK, sw: 2, fill: PANEL, s: k === 1 ? pop(u, 0.2) : 1, text: 'Deployment\norders ×3', fs: 13.5 });
      const side = k === 3 ? E(u, 0.6, 1.5) : 0;
      PX.forEach((x, i) => { const px = x - 40 + 40 * (k === 3 ? 1 : 0) * 0 + (i - 1) * 48 * side; mpod(px + 20, 250, 'orders', { side, s: k === 1 ? pop(u, 0.6 + i * 0.25) : 1 }); });
      if (k === 2) { tx(140, 200, 'containers: 1개', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4) }); tx(490, 340, '개발자가 쓴 스펙은 평소와 같다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.2) }); }
      if (k === 3) { card(400, 130, 200, 46, { rx: 23, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 0.2), text: 'admission webhook', fs: 14, color: WARN });
        PX.forEach((x, i) => grow(400, 154, x + 20 + (i - 1) * 48 + 60, 212, E(u, 0.4 + i * 0.1, 0.9 + i * 0.1), WARN));
        mono(110, 350, '> orders istio-proxy', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); tx(400, 350, '파드 = 앱 + 사이드카', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); }
      return; }
    if (k === 4) { // 파드 하나를 크게: iptables 가 들고 나는 트래픽을 Envoy 로 돌린다
      mpod(480, 150, 'orders', { h: 110 });
      flow([[40, 120], [470, 120], [520, 120], [430, 150]], u, 0.2, 2, INK, 0.5); mono(60, 108, '들어오는 요청', { 'font-size': 13.5, fill: MUT });
      flow([[400, 170], [530, 180], [920, 180]], u, 0.9, 2, ACC, 0.5); mono(900, 168, '나가는 호출', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      mono(480, 80, 'iptables 가 가로채 envoy 로', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      ['mTLS', '재시도·타임아웃', '메트릭', '트레이싱 헤더', 'access log'].forEach((s, i) => { const x = 120 + i * 180; card(x, 320, 160, 48, { rx: 24, stroke: ACC, sw: 2, fill: ACCBG, s: pop(u, 1.2 + i * 0.22), text: s, fs: 14.5, color: ACC });
        grow(530, 200, x, 294, E(u, 1.1 + i * 0.22, 1.5 + i * 0.22), ACC, { plain: true, op: 0.5 }); }); return; }
    // k5: 앱 코드는 HTTP 만
    el('rect', { x: 60, y: 70, width: 470, height: 170, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    ['async with httpx.AsyncClient() as c:', '    await c.post("http://orders/orders")', '# 인증서? 재시도? 메트릭?', '# 앱은 모른다'].forEach((s, i) => mono(80, 110 + i * 34, s, { 'font-size': 14.5, fill: i >= 2 ? MUT : INK, opacity: fade(u, 0.2 + i * 0.3) }));
    [['라이브러리 의존', BAD], ['언어별 구현', BAD], ['정책 산재', BAD]].forEach(([s, cc], i) => { const y = 90 + i * 60; card(740, y, 220, 44, { rx: 10, stroke: cc, sw: 1.8, s: pop(u, 1.1 + i * 0.25), text: s, fs: 14.5 }); cross(640, y, 8, pop(u, 1.3 + i * 0.25)); });
    tx(480, 330, '공통 인프라 로직은 옆 컨테이너로', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 2.0) });
    mono(480, 362, '앱 코드 0줄 수정', { 'text-anchor': 'middle', 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  // 2. mTLS + AuthorizationPolicy
  const CK = [200, 150], OR = [720, 150];
  function s2(t, c) { const { k, u } = c;
    mpod(CK[0], CK[1], 'checkout', { lock: k >= 0, label: 'ns: web · sa: checkout' });
    mpod(OR[0], OR[1], 'orders', { lock: true, label: 'ns: payments', stroke: k >= 1 && k <= 3 ? ACC : INK });
    const mid = [[CK[0] + 108, CK[1]], [OR[0] - 108, OR[1]]];
    el('line', { x1: mid[0][0], y1: CK[1], x2: mid[1][0], y2: OR[1], stroke: GRID, 'stroke-width': 3 });
    if (k === 0) { // 평문 → STRICT
      const strict = u > 1.4, f = seg(u, 0.2, 1.3), f2 = seg(u, 1.6, 2.7), x = lerp(mid[0][0], mid[1][0], E(strict ? f2 : f, 0, 1));
      if ((strict ? f2 : f) > 0 && (strict ? f2 : f) < 1) card(x, OR[1] - 36, strict ? 130 : 150, 30, { rx: 6, stroke: strict ? GOOD : BAD, sw: 2, fill: strict ? GOODBG : BADBG, text: strict ? '•••• 암호문' : 'POST /orders', fs: 13.5, mono: true, color: strict ? GOOD : BAD });
      person(460, 300, '엿보는 쪽', { stroke: strict ? MUT : BAD }); grow(460, 268, 460, 190, 1, strict ? GRID : BAD, { dash: '4 4', plain: true });
      mono(560, 300, strict ? '읽을 수 없다' : '본문이 다 보인다', { 'font-size': 14.5, 'font-weight': 700, fill: strict ? GOOD : BAD });
      pill(200, 300, strict ? 'mode: STRICT' : 'mTLS OFF', strict ? GOOD : BAD, 1, { mono: true, fs: 14 }); return; }
    // 정책 카드
    el('rect', { x: 560, y: 220, width: 360, height: 180, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: k === 1 ? fade(u, 0.2) : 1 });
    tx(574, 244, 'AuthorizationPolicy orders-callers', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, class: 'mono', opacity: k === 1 ? fade(u, 0.3) : 1 });
    const pol = [['action: ALLOW', 1], ['from: …/sa/checkout', 2], ['methods: [POST]', 3], ['paths: /orders, /orders/*', 3]];
    pol.forEach(([s, kk], i) => { if (k < kk) return; mono(578, 276 + i * 28, s, { 'font-size': 14, fill: kk === k ? ACC : INK, 'font-weight': kk === k ? 700 : 400, opacity: kk === k ? fade(u, 0.4) : 1 }); });
    if (k === 1) { tx(60, 290, 'ALLOW 정책이 붙으면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1) }); tx(60, 316, '적힌 것 말고는 전부 거부', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) }); }
    if (k === 2 || k === 3) { // 호출자 비교
      const reqs = k === 2 ? [['checkout 인증서', true], ['다른 서비스 인증서', false]] : [['POST /orders', true], ['GET /orders', false], ['DELETE /admin', false]];
      reqs.forEach(([s, ok], i) => { const y = 270 + i * 44, st = 0.3 + i * 0.5, x = lerp(40, 300, E(u, st, st + 0.6));
        card(x + 70, y, 170, 32, { rx: 8, stroke: ok ? GOOD : BAD, sw: 1.8, fill: PANEL, text: s, fs: 13.5, mono: true, color: ok ? GOOD : BAD });
        if (u > st + 0.6) { if (ok) check(x + 172, y, 9); else { cross(x + 172, y, 8); mono(x + 192, y + 5, '403', { 'font-size': 14, 'font-weight': 800, fill: BAD }); } } });
      if (k === 2) tx(60, 380, '신원은 IP 가 아니라 SPIFFE 인증서', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) { clock(120, 320, 34, (t * 0.25) % 1, GOOD, '24h 회전'); [['전 구간 암호화', GOOD], ['평문 sniffing 불가', GOOD], ['정책 밖 호출 403', BAD]].forEach(([s, cc], i) => tx(200, 290 + i * 30, s, { 'font-size': 15, 'font-weight': 700, fill: cc, opacity: fade(u, 0.4 + i * 0.4) })); }
    if (k === 5) { el('rect', { x: 40, y: 230, width: 500, height: 160, rx: 10, fill: INK });
      ['$ istioctl proxy-config secret orders-pod', '> x509 cert valid 23h', '> SAN: spiffe://cluster.local/ns/…'].forEach((s, i) => mono(58, 266 + i * 34, s, { 'font-size': 14, fill: i ? 'var(--term)' : PANEL, opacity: fade(u, 0.3 + i * 0.5) }));
    } }

  // 3. Traffic Shifting: DestinationRule subset + VirtualService 가중치
  const V1 = [760, 120], V2 = [760, 300], VS = [430, 210];
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    // 파드 묶음
    const grp = (xy, name, col, st) => { zone(xy[0] - 110, xy[1] - 66, 220, 132, k >= 1 ? 'subset ' + name : null, { fill: k >= 1 ? SOFT : 'none', stroke: k >= 1 ? col : 'none', sw: 1.8, op: k === 1 ? fade(u, st) : 1 });
      [-50, 50].forEach((dx) => card(xy[0] + dx, xy[1] + 12, 84, 50, { rx: 8, stroke: col, sw: 2, fill: PANEL, text: 'version=' + name, fs: 13.5, mono: true, color: col })); };
    grp(V1, 'v1', INFO, 0.3); grp(V2, 'v2', ACC, 0.8);
    person(70, 210, null, {});
    // VirtualService 판
    const vsOn = k >= 2;
    card(VS[0], VS[1], 220, 150, { rx: 12, stroke: vsOn ? INK : GRID, sw: 2, fill: PANEL, s: k === 2 ? pop(u, 0.3) : 1 });
    tx(VS[0], VS[1] - 50, vsOn ? 'VirtualService orders' : 'Service orders', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800 });
    if (k === 0) { card(VS[0], 360, 250, 50, { rx: 10, stroke: ACC, sw: 2, fill: ACCBG, s: pop(u, 0.4), text: 'DestinationRule  host: orders', fs: 14, mono: true, color: ACC }); grow(VS[0], 334, VS[0], 288, E(u, 0.9, 1.3), ACC);
      tx(VS[0], 222, 'k8s Service 위에 얹힌다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) }); }
    if (k === 1) tx(VS[0], 222, '라벨로 두 덩어리', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
    if (k >= 3) { mono(VS[0] - 96, VS[1] - 14, '1) x-beta: true → v2', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.3) : 1 }); }
    if (k >= 4) { const w = tween(p.canary, b.canary, u); mono(VS[0] - 96, VS[1] + 14, `2) v1 ${100 - Math.round(w)} / v2 ${Math.round(w)}`, { 'font-size': 13.5, fill: INK, 'font-weight': 700, opacity: k === 4 ? fade(u, 0.3) : 1 }); }
    const toV1 = [[100, 210], [VS[0] - 110, VS[1]], [VS[0] + 110, VS[1]], [V1[0] - 110, V1[1]]], toV2 = [[100, 210], [VS[0] - 110, VS[1]], [VS[0] + 110, VS[1]], [V2[0] - 110, V2[1]]];
    if (k <= 2) flow(toV1, u, 0.4, 4, INFO, 0.4);
    if (k === 3) { flow(toV2, u, 0.6, 3, ACC, 0.5); pill(130, 150, 'x-beta: true', ACC, pop(u, 0.3), { mono: true, fs: 13.5 }); tx(VS[0], 390, '특수 규칙이 위에 있어야 먼저 걸린다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k >= 4) { for (let r = 0; r < 10; r++) { const st = 0.2 + r * 0.22; dot(r === 6 ? toV2 : toV1, seg(u, st, st + 0.8), r === 6 ? ACC : INFO, 5.5); }
      if (k === 4) tx(VS[0], 390, '파드 수와 상관없이 10개 중 1개', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 5) { pill(130, 150, 'x-beta: true', ACC, 1, { mono: true, fs: 13.5 }); flow(toV2, u, 0.5, 2, ACC, 0.9); tx(VS[0], 390, 'apply 즉시 반영, 재시작 없음', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) }); }
    if (k === 6) { [10, 50, 100].forEach((w, i) => { const x = 220 + i * 150, s = pop(u, 0.3 + i * 0.6); card(x, 390, 120, 36, { rx: 18, stroke: ACC, sw: 2, s, text: 'v2 ' + w + '%', fs: 14.5, mono: true, color: ACC }); if (i < 2) grow(x + 62, 390, x + 88, 390, E(u, 0.6 + i * 0.6, 0.9 + i * 0.6), ACC); });
      tx(30, 396, 'v2 성공률', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2) }); } }

  // 4. Retry / Timeout / Circuit Breaker
  function s4(t, c) { const { k, u } = c;
    if (k === 1) { // 시간축: 전체 2초, 시도 500ms × (1 + 3)
      const x0 = 90, W = 780, ms = (v) => x0 + W * v / 2000, y = 150;
      tx(x0, 70, 'orders 가 계속 멈춰 있을 때', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: x0, y: y - 30, width: W, height: 12, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 1.4 }); mono(x0 + W, y - 40, 'timeout 2s', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'end' });
      [0, 525, 1050, 1575].forEach((s, i) => { const e = Math.min(s + 500, 2000), g = E(u, 0.3 + i * 0.45, 0.7 + i * 0.45), cut = s + 500 > 2000;
        el('rect', { x: ms(s), y, width: (ms(e) - ms(s)) * g, height: 40, rx: 5, fill: cut ? BADBG : ACCBG, stroke: cut ? BAD : ACC, 'stroke-width': 2 });
        mono(ms(s) + 8, y + 26, (i ? '재시도 ' + i : '첫 시도'), { 'font-size': 13.5, 'font-weight': 700, fill: cut ? BAD : ACC, opacity: g > 0.6 ? 1 : 0 });
        mono(ms(s), y + 64, String(s), { 'font-size': 13.5, fill: MUT, opacity: g > 0.1 ? 1 : 0 }); });
      mono(ms(2000), y + 64, '2000ms', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      tx(x0, 290, '500ms × 4번 = 2000ms 라 사이 backoff(예: 25ms)만큼 마지막 시도가 잘린다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(x0, 318, '그 뒤 호출자는 504 를 받는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) });
      mono(x0, 370, 'retryOn: 5xx, reset, connect-failure, refused-stream', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) }); return; }
    if (k === 6) { // 라이브러리 vs 사이드카
      tx(250, 50, '앱 안 라이브러리', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD }); tx(710, 50, '사이드카 + YAML', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD });
      [['Java', 'resilience4j'], ['C#', 'polly'], ['Python', '직접 구현']].forEach(([a, b2], i) => { const y = 110 + i * 80, s = pop(u, 0.2 + i * 0.25); card(250, y, 300, 60, { rx: 10, stroke: BAD, sw: 1.8, s });
        tx(120, y + 5, a, { 'font-size': 15, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 }); mono(380, y + 5, b2, { 'font-size': 14, fill: BAD, 'text-anchor': 'end', opacity: s > 0.5 ? 1 : 0 }); });
      card(710, 110, 300, 50, { rx: 10, stroke: GOOD, sw: 2.4, fill: GOODBG, s: pop(u, 1.2), text: 'resilience_policy.yaml 하나', fs: 14.5, mono: true, color: GOOD });
      [0, 1, 2].forEach((i) => { grow(710, 136, 600 + i * 110, 220, E(u, 1.4 + i * 0.1, 1.8 + i * 0.1), GOOD); card(600 + i * 110, 250, 96, 50, { rx: 8, stroke: ACC, sw: 2, fill: ACCBG, text: 'envoy', fs: 14, color: ACC, s: pop(u, 1.6 + i * 0.1) }); });
      tx(710, 330, 'Kiali · Grafana 로 한눈에', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // 호출자 → orders 파드 3개
    const PY = [100, 210, 320], OX = 740, CX = 180;
    mpod(CX, 210, 'checkout', { lock: true });
    PY.forEach((y, i) => { const ej = (k === 4 || k === 5) && i === 1, out = ej && (k === 5 || u > 1.6);
      card(OX, y, 140, 60, { rx: 10, stroke: out ? BAD : INK, sw: 2, fill: out ? BADBG : PANEL, op: out ? 0.55 : 1, text: 'orders-' + (i + 1), fs: 14.5, mono: true, color: out ? BAD : INK }); });
    const route = (i) => [[CX + 108, 210], [460, 210], [OX - 70, PY[i]]];
    if (k === 0) { card(460, 210, 170, 56, { rx: 10, stroke: INK, sw: 2, fill: PANEL, s: pop(u, 0.2), text: 'VirtualService\norders', fs: 13.5 }); for (let r = 0; r < 6; r++) dot(route(r % 3), seg(u, 0.6 + r * 0.25, 1.4 + r * 0.25), ACC, 5.5);
      tx(460, 290, '라우팅 규칙 안에 정책이 같이 산다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); return; }
    card(460, 210, 190, 70, { rx: 10, stroke: ACC, sw: 2, fill: ACCBG, text: 'DestinationRule\ntrafficPolicy', fs: 13.5, color: ACC, s: k === 2 ? pop(u, 0.3) : 1 });
    if (k === 2) { tx(460, 300, '재시도는 호출 방식,', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1) }); tx(460, 326, '커넥션 풀은 대상 보호', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) }); }
    if (k === 3) { // 커넥션 풀 100칸
      const x0 = 300, y0 = 270; tx(x0, y0 - 10, 'maxConnections 100', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      const fill = Math.round(100 * E(u, 0.2, 1.4)); for (let i = 0; i < 100; i++) el('rect', { x: x0 + (i % 25) * 13, y: y0 + Math.floor(i / 25) * 13, width: 10, height: 10, rx: 2, fill: i < fill ? ACC : SOFT });
      for (let r = 0; r < 3; r++) { const st = 1.6 + r * 0.3, f = seg(u, st, st + 0.5); if (f > 0 && f < 1) { const x = lerp(290, 260, f); el('circle', { cx: x, cy: 290 + r * 14, r: 5, fill: BAD }); } }
      mono(250, 400, '넘치면 기다리지 않고 바로 실패', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
      mono(660, 400, 'http2MaxRequests 1000', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) }); }
    if (k === 4) { // 연속 5xx 다섯 번 → 30초 격리
      for (let i = 0; i < 5; i++) { const s = pop(u, 0.2 + i * 0.25); card(OX - 200 + i * 30, 160, 26, 26, { rx: 5, stroke: BAD, sw: 1.6, fill: BADBG, s, text: String(i + 1), fs: 13.5, color: BAD }); }
      mono(OX - 215, 140, '5xx 연속', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.3) });
      clock(OX + 120, 210, 22, E(u, 1.6, 2.8) * 0.3, BAD, '30s 격리');
      tx(460, 300, 'maxEjectionPercent 50', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: fade(u, 2.0) }); tx(460, 326, '절반 넘게는 빼지 않는다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 5) { for (let r = 0; r < 6; r++) { const i = r % 2 ? 2 : 0; dot(route(i), seg(u, 0.2 + r * 0.25, 1.0 + r * 0.25), ACC, 5.5); }
      card(460, 330, 220, 40, { rx: 20, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 1.8), text: '2초 넘으면 504 로 끊는다', fs: 14, color: WARN });
      tx(460, 390, '느린 실패보다 빠른 실패', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.2) }); } }

  // 5. Istio vs Linkerd
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tx(480, 50, '도입 전에 물을 것', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      // 서비스 수 막대
      const x0 = 160, W = 640, y = 140, sc = (n) => x0 + W * n / 20; el('rect', { x: x0, y, width: W, height: 22, rx: 4, fill: SOFT });
      el('rect', { x: x0, y, width: (sc(5) - x0) * E(u, 0.2, 0.8), height: 22, rx: 4, fill: BAD, opacity: 0.7 }); el('rect', { x: sc(10), y, width: (sc(20) - sc(10)) * E(u, 0.8, 1.4), height: 22, rx: 4, fill: GOOD, opacity: 0.7 });
      [0, 5, 10, 20].forEach((n) => mono(sc(n), y + 44, String(n), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' })); tx(x0, y - 12, '서비스 수', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      tx(sc(2.5), y - 12, '비용 > 이득', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); tx(sc(15), y - 12, '검토할 만하다', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      ['mTLS · 트래픽 정책 · 가시화가 정말 필요한가?', 'control plane 까지 운영할 사람이 있는가?'].forEach((s, i) => tx(x0, 270 + i * 40, (i + 2) + '. ' + s, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.8 + i * 0.3) }));
      tx(x0, 240, '1. 서비스가 정말 10개 이상인가?', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.5) }); return; }
    if (k === 5) { tx(480, 46, '상황별 권고', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['시작 단계 · 팀이 작다', 'Linkerd 또는 메시 없이', GOOD], ['멀티클러스터 · 강한 정책 · JWT', 'Istio', ACC], ['사이드카 부담이 걱정', 'Linkerd 또는 Istio ambient', GOOD], ['이미 Argo · Flagger 사용', 'Istio', ACC]].forEach(([a, b2, cc], i) => {
        const y = 100 + i * 72, s = pop(u, 0.2 + i * 0.35); card(270, y, 340, 54, { rx: 10, stroke: GRID, sw: 1.8, s, text: a, fs: 15 }); grow(442, y, 540, y, E(u, 0.5 + i * 0.35, 0.9 + i * 0.35), cc);
        card(700, y, 300, 54, { rx: 27, stroke: cc, sw: 2.4, s: pop(u, 0.7 + i * 0.35), text: b2, fs: 15, color: cc }); });
      tx(480, 400, '기준은 팀이 감당할 운영 부담', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 6) { // 사이드카 → 노드 단위
      tx(250, 50, '파드마다 사이드카', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }); tx(710, 50, '노드에 하나 (ambient · eBPF)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      zone(60, 80, 380, 280, 'node', { fill: SOFT }); zone(520, 80, 380, 280, 'node', { fill: SOFT, op: fade(u, 1.0) });
      for (let i = 0; i < 4; i++) { const x = 140 + (i % 2) * 180, y = 160 + Math.floor(i / 2) * 110; card(x - 22, y, 70, 60, { rx: 8, stroke: INK, sw: 1.8, text: 'app', fs: 14 }); card(x + 40, y, 50, 60, { rx: 8, stroke: ACC, sw: 1.8, fill: ACCBG, text: 'E', fs: 14, color: ACC });
        card(600 + (i % 2) * 180 - 10, y - 20, 90, 50, { rx: 8, stroke: INK, sw: 1.8, text: 'app', fs: 14, s: pop(u, 1.2 + i * 0.1) }); }
      card(710, 330, 300, 36, { rx: 18, stroke: ACC, sw: 2.2, fill: ACCBG, s: pop(u, 1.8), text: 'ztunnel / eBPF', fs: 14.5, mono: true, color: ACC });
      tx(480, 400, '모두 사이드카 비용을 줄이는 쪽', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) }); return; }
    // k1~k4: 두 메시 나란히
    const L = [250, 'Istio', 'Envoy (C++)'], Rr = [710, 'Linkerd', 'linkerd2-proxy (Rust)'];
    [L, Rr].forEach(([x, n, px], j) => { const on = (j === 0 && (k === 1 || k === 2)) || (j === 1 && (k === 3 || k === 4));
      card(x, 80, 380, 56, { rx: 12, stroke: on ? ACC : GRID, sw: on ? 2.5 : 1.6, fill: on ? ACCBG : PANEL }); tx(x, 78, n, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: on ? ACC : MUT }); mono(x, 98, px, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); });
    // 메모리 막대 (사이드카 하나당, 대략값)
    const mb = (x, v, show, col) => { const h = 120 * v / 80 * show; el('rect', { x: x - 30, y: 300 - h, width: 60, height: h, rx: 4, fill: col }); if (show > 0.5) mono(x, 290 - h, '~' + v + 'MB', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); };
    if (k === 1) { ['멀티클러스터', 'JWT · OPA', 'VirtualService 표현력', 'Argo · Flagger 통합', '가장 큰 커뮤니티'].forEach((s, i) => pill(250, 150 + i * 46, s, GOOD, pop(u, 0.3 + i * 0.3), { fs: 14.5 }));
      tx(710, 250, 'Step 3·4 의 표현력이 Istio 를 고르는 이유', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 2) { mb(170, 80, E(u, 0.3, 1.0), BAD); tx(170, 330, '사이드카 하나', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      mono(250, 230, '× 파드 수', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      ['CRD 수십 개', '업그레이드 까다로움'].forEach((s, i) => pill(250 + 110, 330 + i * 0 + i * 44 - 20, s, BAD, pop(u, 1.5 + i * 0.3), { fs: 14 })); }
    if (k === 3 || k === 4) { mb(620, 80, 1, OFF); tx(620, 330, 'Envoy', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); mb(720, 10, k === 3 ? E(u, 0.3, 0.9) : 1, GOOD); tx(720, 330, 'Linkerd', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      if (k === 3) { mono(840, 240, '−87%', { 'font-size': 20, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); pill(250, 200, '$ linkerd install', INK, pop(u, 1.3), { mono: true, fs: 14.5 });
        tx(250, 250, 'mTLS · retry · 골든 메트릭이 바로', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.7) }); }
      if (k === 4) { el('rect', { x: 70, y: 170, width: 360, height: 100, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
        ['match: headers x-beta', 'route: subset v2'].forEach((s, i) => mono(90, 206 + i * 30, s, { 'font-size': 14, fill: MUT }));
        cross(400, 220, 12, pop(u, 0.6)); tx(250, 310, '세밀한 정책 표현은 덜 풍부', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
        tx(250, 340, '외부 인증·정책 통합도 적다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) }); }
      tx(670, 380, '사이드카 하나당 메모리 (대략값)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); } }

  const quiz = [
    { q: 'Istio 사이드카가 orders 파드에 들어가게 만드는 스위치는 어디에 있나?',
      o: ['orders Deployment의 containers 목록', '앱 코드의 import 한 줄', 'payments 네임스페이스의 istio-injection 라벨'], a: 2,
      why: '라벨이 붙은 네임스페이스에 파드가 생기면 admission webhook이 istio-proxy 컨테이너를 끼워 넣는다. 매니페스트와 코드는 그대로다.' },
    { q: 'AuthorizationPolicy가 호출자가 checkout인지 판단하는 근거는 무엇인가?',
      o: ['요청을 보낸 파드의 IP', 'mTLS 인증서에 담긴 SPIFFE 서비스 계정', 'HTTP User-Agent 헤더'], a: 1,
      why: 'principals에 cluster.local/ns/web/sa/checkout을 적는다. 신원이 인증서에서 오므로 IP를 바꿔도 통과하지 못한다.' },
    { q: 'x-beta: true 헤더가 있는 요청은 90/10 가중치와 상관없이 어디로 가나?',
      o: ['항상 subset v2', '90% 확률로 v1', '항상 subset v1'], a: 0,
      why: 'http 규칙은 위에서부터 평가된다. 헤더 match 규칙이 가중치 규칙보다 위에 있어 먼저 걸린다.' },
    { q: 'timeout 2s, attempts 3, perTryTimeout 500ms에서 마지막 재시도가 끝까지 돌지 못하는 이유는 무엇인가?',
      o: ['시도 4번이 2000ms를 다 써서 대기 시간만큼 넘친다', 'attempts가 3이라 시도가 3번뿐이어서', 'outlierDetection이 재시도를 막아서'], a: 0,
      why: '500ms × 4번 = 2000ms로 전체 timeout과 같다. 시도 사이 대기가 조금만 있어도 4번째 시도는 2초에서 잘리고 504가 돌아간다.' },
    { q: '서비스 4개짜리 작은 팀이 메시 도입을 검토한다. mesh_decision.md의 권고는 무엇인가?',
      o: ['Istio 멀티클러스터부터 구축한다', 'Linkerd를 쓰거나 메시를 도입하지 않는다', '사이드카 대신 앱마다 resilience4j를 넣는다'], a: 1,
      why: '서비스가 5개 미만이면 도입 비용이 이득보다 크다고 본다. 시작 단계·작은 팀은 Linkerd 또는 미도입이 권고다.' },
  ];

  const summary = [
    '네임스페이스에 라벨 하나를 달면 파드마다 Envoy가 붙고, 앱은 HTTP만 다룬다.',
    'STRICT mTLS와 ALLOW 정책으로 checkout 인증서를 가진 호출만 POST /orders에 닿는다.',
    'DestinationRule로 v1·v2를 나누고 VirtualService 가중치로 10%만 v2에 보낸다.',
    '재시도·타임아웃·격리를 YAML로 걸지만, 메시 자체가 새 운영 부담이라 규모를 보고 고른다.',
  ];
  const review = [
    { q: '메시를 켠 뒤 일부 배치 잡의 orders 호출만 403을 받는다. 먼저 볼 곳은?',
      o: ['VirtualService의 weight 값', 'AuthorizationPolicy의 principals와 methods', 'outlierDetection의 baseEjectionTime'], a: 1,
      why: 'ALLOW 정책이 붙으면 적힌 호출자·메서드·경로 말고는 거부된다. 배치 잡의 서비스 계정이나 메서드가 목록에 없을 가능성이 크다.' },
    { q: 'orders 파드 하나가 5xx를 연속으로 내는데 앱 코드는 못 고친 상태다. 메시가 해 주는 일은?',
      o: ['그 파드를 30초 동안 후보에서 빼고 나머지로 보낸다', '그 파드의 코드를 자동으로 롤백한다', 'v2 가중치를 100%로 올린다'], a: 0,
      why: 'outlierDetection이 연속 5번 5xx를 낸 엔드포인트를 30초 격리한다. 부분 장애가 전체로 번지지 않게 막는 장치다.' },
    { q: '파드가 많아지면서 사이드카 메모리가 부담이 됐다. 이 장에서 나온 방향은?',
      o: ['retries attempts를 늘린다', 'mTLS를 PERMISSIVE로 낮춘다', '가벼운 프록시나 노드 단위(ambient·eBPF) 메시'], a: 2,
      why: '사이드카 메모리는 파드 수만큼 곱해진다. 가벼운 프록시나 사이드카 없는 메시가 그 비용을 줄이는 방향이다.' },
  ];

  R.page({ title: 'payments 네임스페이스의 메시', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
