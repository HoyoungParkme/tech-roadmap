/* II-1-2 API Gateway — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: 주소 5개(:8001~:8005), 분당 100 req/IP, RedisRateLimiter(100, 200), 캐시 5분, 아바타 64px·이미지 200px·추천 6/12개는 페이지 코드 값.
 * 300건이 한꺼번에 올 때 200건 통과 / 100건 거절은 토큰 버킷(용량 200)을 node 로 돌린 값. BFF 병렬 지연 40·60·80ms 는 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, cells, person, browser, cross, check, dbIcon, clock, hbar, lock, G } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function svc(cx, cy, name, o) { o = o || {}; const w = o.w || 170, h = o.h || 56;
    const g = card(cx, cy, w, h, { rx: 10, stroke: o.stroke || INK, fill: o.fill, sw: o.sw ?? 2.2, s: o.s, op: o.op, dash: o.dash });
    tx(0, o.sub ? -4 : 6, name, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 700, fill: o.color || o.stroke || INK }, g);
    if (o.sub) tx(0, 16, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.subCol || MUT, class: o.subMono ? 'mono' : null }, g);
    return g; }
  const ln = (x1, y1, x2, y2, col, o) => { o = o || {}; el('line', { x1, y1, x2, y2, stroke: col || GRID, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function phone(cx, cy, o) { o = o || {}; const w = o.w || 52, h = o.h || 88;
    el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.5, opacity: o.op ?? 1 });
    el('circle', { cx, cy: cy + h / 2 - 10, r: 3.5, fill: OFF, opacity: o.op ?? 1 });
    if (o.name) tx(cx, cy + h / 2 + 22, o.name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: o.op ?? 1 }); }

  // ---------- 1. 직접 노출 ----------
  const SV = [['user', 8001], ['catalog', 8002], ['order', 8003], ['payment', 8004], ['shipping', 8005]];
  const svY = (i) => 70 + i * 68;
  function s1(t, c) { const { k, u } = c;
    // 휴대폰 화면 안 주소표
    el('rect', { x: 40, y: 34, width: 210, height: 362, rx: 22, fill: PANEL, stroke: INK, 'stroke-width': 3 });
    el('line', { x1: 125, y1: 48, x2: 165, y2: 48, stroke: OFF, 'stroke-width': 4, 'stroke-linecap': 'round' });
    mono(58, 78, 'const API = {', { 'font-size': 14, 'font-weight': 700 });
    SV.forEach(([n, p], i) => { const f = k === 0 ? clamp(E(u, 0.2, 1.6) * 5 - i) : 1, y = 104 + i * 26;
      const moved = k === 3 && i === 1;
      if (f > 0) mono(62, y, `${n}.shop.com:${p}`.slice(0, Math.ceil(`${n}.shop.com:${p}`.length * f)), { 'font-size': 13.5, fill: moved ? BAD : INK, 'text-decoration': moved && u > 0.8 ? 'line-through' : null });
      const sx = 680, sy = svY(i);
      svc(790, sy, n + '-service', { w: 220, h: 50, sub: 'public :' + p, subMono: true, subCol: WARN, stroke: moved ? BAD : INK, dash: moved ? '5 4' : null });
      if (k === 2) return;
      const lit = k === 1 ? [0, 2, 4].indexOf(i) : -1, g = k === 0 ? E(u, 0.4 + i * 0.25, 0.9 + i * 0.25) : 1;
      grow(250, 104 + i * 26 - 5, sx, sy, g, moved ? BAD : lit >= 0 ? ACC : GRID, { plain: true, sw: lit >= 0 ? 2.6 : 1.8 }); });
    mono(62, 234, '// ... 점점 늘어남', { 'font-size': 13.5, fill: MUT, opacity: k === 0 ? fade(u, 1.8) : 1 });
    if (k === 0) { note(140, 300, '내부 주소가', fade(u, 2.0), { 'text-anchor': 'middle' }); note(140, 324, '앱에 박힌다', fade(u, 2.1), { 'text-anchor': 'middle', fill: BAD }); return; }
    if (k === 1) { const calls = [['/me', 0], ['/orders', 2], ['/active', 4]];
      calls.forEach(([p, i], j) => { const a = 0.2 + j * 0.75, sy = svY(i);
        dot([[250, 99 + i * 26], [680, sy]], seg(u, a, a + 0.35), ACC, 7); dot([[680, sy], [250, 99 + i * 26]], seg(u, a + 0.35, a + 0.7), INK, 7);
        pill(420, lerp(99 + i * 26, sy, 0.4) - 14, 'token', WARN, pop(u, a), { fs: 13.5, mono: true, fill: PANEL });
        const bx = 58 + j * 58, g = E(u, a, a + 0.7);
        el('rect', { x: bx, y: 274, width: 54 * g, height: 30, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5 });
        if (g > 0.9) mono(bx + 27, 294, p, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700 }); });
      tx(58, 266, '홈 화면 하나', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      note(145, 340, '왕복 3번', fade(u, 2.3), { 'text-anchor': 'middle' }); note(145, 366, '인증 3번', fade(u, 2.4), { 'text-anchor': 'middle', fill: WARN }); return; }
    if (k === 2) { const cols = ['인증', 'CORS', '한도', '로그'];
      cols.forEach((s, j) => tx(330 + j * 80, 38, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT }));
      SV.forEach((_, i) => cols.forEach((s, j) => { const f = pop(u, 0.2 + (i * 4 + j) * 0.07, 0.4);
        card(330 + j * 80, svY(i), 70, 40, { rx: 6, fill: WARNBG, stroke: WARN, sw: 1.6, text: '구현', fs: 13.5, color: WARN, s: f }); }));
      note(140, 300, '같은 일 4가지', fade(u, 1.8), { 'text-anchor': 'middle' }); note(140, 324, '× 서비스 5개', fade(u, 1.9), { 'text-anchor': 'middle' });
      mono(140, 356, '= 20곳', { 'font-size': 20, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      sub(470, 410, '다섯 서비스 모두 public 으로 열려 있다', fade(u, 2.3), { fill: WARN, 'font-weight': 700 }); return; }
    // k3: 백엔드를 바꾸면 깔린 앱이 다 깨진다
    cross(470, (104 + 26 - 5 + svY(1)) / 2, 11, pop(u, 0.6));
    ['v1.0', 'v1.1', 'v1.2'].forEach((v, i) => pill(88 + i * 58, 276, v, BAD, pop(u, 1.0 + i * 0.2), { fs: 13.5, mono: true, fill: PANEL }));
    sub(145, 304, '이미 깔린 앱 (예시 버전)', fade(u, 1.2));
    note(145, 340, '모두 옛 주소를', fade(u, 1.7), { 'text-anchor': 'middle', fill: BAD }); note(145, 364, '부른다', fade(u, 1.8), { 'text-anchor': 'middle', fill: BAD });
    sub(790, 412, '앱은 동시에 업데이트할 수 없다', fade(u, 2.1), { fill: BAD, 'font-weight': 700 }); }

  // ---------- 2. API Gateway ----------
  const GW = { x: 340, w: 190, y0: 40, y1: 392 }, PLUG = ['jwt', 'rate-limiting', 'cors', 'request-transformer', 'prometheus'];
  const RT = [['user-service', 8001, '/v1/users · /v1/me'], ['catalog-service', 8002, '/v1/products · categories'], ['order-service', 8003, '/v1/orders · /v1/cart'], ['payment-service', 8004, '/v1/payments']];
  const rtY = (i) => 72 + i * 92;
  const plugOn = (k) => [0, 0, 2, 3, 5, 5][k];
  function gateway(k, u) { el('rect', { x: GW.x - GW.w / 2, y: GW.y0, width: GW.w, height: GW.y1 - GW.y0, rx: 14, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 });
    mono(GW.x, 68, 'api.shop.com', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); sub(GW.x, 88, 'Kong Gateway');
    PLUG.forEach((p, i) => { const y = 124 + i * 52, on = i < plugOn(k), fresh = on && i >= plugOn(Math.max(0, k - 1)) && k > 0;
      card(GW.x, y, 172, 38, { rx: 7, text: on ? p : '', fs: 13.5, mono: true, fw: 700, stroke: on ? ACC : GRID, dash: on ? null : '4 4', fill: on ? PANEL : 'none', color: INK, s: fresh ? pop(u, 0.2 + (i - plugOn(k - 1)) * 0.35) : 1 }); }); }
  function s2(t, c) { const { k, u } = c;
    phone(60, 212, { name: '모바일 앱' });
    gateway(k, u);
    grow(88, 212, GW.x - GW.w / 2 - 2, 212, k === 0 ? E(u, 0.1, 0.5) : 1, INK, { plain: true });
    const nR = k === 0 ? 1 : k === 5 ? 4 : 3;
    for (let i = 0; i < nR; i++) { const y = rtY(i), fresh = (k === 0 && i === 0) || (k === 1 && i > 0) || (k === 5 && i === 3), g = fresh ? E(u, 0.3 + (i % 3) * 0.3, 0.8 + (i % 3) * 0.3) : 1;
      svc(800, y, RT[i][0], { w: 250, h: 52, sub: `${RT[i][0]}.internal:${RT[i][1]}`, subMono: true, s: fresh ? pop(u, 0.2 + (i % 3) * 0.3) : 1 });
      grow(GW.x + GW.w / 2, Math.min(Math.max(y, 60), 380), 673, y, g, ACC, { plain: true });
      mono(553, y - 10, RT[i][2], { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: g }); }
    if (k === 0) { dot([[88, 212], [GW.x - 95, 212], [GW.x + 95, rtY(0)], [673, rtY(0)]], seg(u, 0.9, 2.0), ACC, 7);
      sub(GW.x, 412, '.internal 주소는 Gateway 만 안다', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { check(60, 300, 11, pop(u, 1.6)); sub(60, 330, '앱 변경 없음', fade(u, 1.7), { fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 2) { dot([[88, 205], [GW.x - 95, 205]], seg(u, 0.4, 0.9), BAD, 7); dot([[GW.x - 95, 205], [88, 205]], seg(u, 0.9, 1.3), BAD, 7);
      pill(175, 180, '토큰 없음 → 401', BAD, pop(u, 1.0), { fs: 13.5, fill: PANEL });
      tx(20, 300, '이 IP 의 분당 요청', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      const n = Math.round(lerp(0, 101, E(u, 1.0, 2.3)));
      el('rect', { x: 20, y: 310, width: 200, height: 18, rx: 4, fill: SOFT }); el('rect', { x: 20, y: 310, width: 200 * Math.min(n, 100) / 100, height: 18, rx: 4, fill: n > 100 ? BAD : ACC });
      mono(20, 350, `${Math.min(n, 100)} / 100`, { 'font-size': 15, 'font-weight': 800, fill: n > 100 ? BAD : INK });
      if (n > 100) pill(170, 380, '101번째 → 429', BAD, pop(u, 2.3), { fs: 13.5, fill: PANEL });
      return; }
    if (k === 3) { [['https://shop.com', GOOD, 1], ['https://other.site', BAD, 0]].forEach(([o, col, ok], i) => { const y = 92 + i * 40, sc = pop(u, 0.4 + i * 0.5);
        pill(110, y, o, col, sc, { fs: 13.5, mono: true, fill: PANEL }); (ok ? check : cross)(214, y, 8, sc); });
      sub(110, 162, '예시 출처', fade(u, 1.2));
      dot([[88, 212], [GW.x - 95, 212]], seg(u, 0.5, 1.0), GOOD, 7);
      sub(110, 330, '서비스 코드에서 CORS 가 사라진다', fade(u, 1.9), { fill: INK, 'font-weight': 700, 'font-size': 14 }); return; }
    if (k === 4) { fly(GW.x + 95, rtY(0) + 26, 673, rtY(0) + 26, seg(u, 0.3, 1.3), 'X-Gateway: kong', { mono: true, fill: INFO });
      tx(560, 360, 'status · latency 메트릭 (예시 분포)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.0) });
      [3, 7, 12, 16, 13, 9, 6, 4, 3, 2, 1, 1].forEach((h, i) => { const g = E(u, 1.2 + i * 0.05, 1.8 + i * 0.05);
        el('rect', { x: 560 + i * 28, y: 408 - h * 2.6 * g, width: 22, height: h * 2.6 * g, rx: 2, fill: i > 9 ? WARN : INFO, opacity: 0.8 }); });
      return; }
    // k5
    check(60, 300, 11, pop(u, 1.6)); sub(60, 330, '앱은 그대로', fade(u, 1.7), { fill: GOOD, 'font-weight': 700 });
    pill(553, rtY(3) + 26, 'Gateway 설정 한 블록', ACC, pop(u, 1.4), { fs: 13.5, fill: PANEL }); }

  // ---------- 3. BFF ----------
  const BK = [['user', 70], ['order', 140], ['reco', 210]];
  function tiles(x, y, n, sz, gap, col, u0) { for (let i = 0; i < n; i++) { const r = Math.floor(i / 6), q = i % 6, s = clamp(u0 * n - i);
      el('rect', { x: x + q * (sz + gap), y: y + r * (sz + gap), width: sz * s, height: sz * s, rx: 3, fill: col, opacity: 0.25 + 0.6 * s }); } }
  function s3(t, c) { const { k, u } = c;
    phone(60, 120, { name: '모바일' });
    svc(230, 120, 'mobile BFF', { w: 150, sub: '모바일 팀 소유', s: k === 0 ? pop(u, 0.2) : 1 });
    grow(88, 120, 153, 120, k === 0 ? E(u, 0.5, 0.9) : 1, INK, { plain: true });
    mono(230, 172, 'GET /v1/mobile/home', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 0.9) : 1 });
    BK.forEach(([n, y], i) => { const on = k >= 1; svc(850, y, n + '-service', { w: 170, h: 48, sub: 'gRPC', op: on ? 1 : 0.35 });
      if (on) { grow(306, 120, 764, y, k === 1 ? E(u, 0.1, 0.5) : 1, INFO, { plain: true, sw: 2 }); if (k === 1) dot([[306, 120], [764, y]], seg(u, 0.5, 1.1), ACC, 6); } });
    if (k === 0) { note(560, 300, '화면 하나에 endpoint 하나', fade(u, 1.4), { 'text-anchor': 'middle' }); sub(560, 330, '뒤쪽 서비스는 도메인 단위를 지킨다', fade(u, 1.9), { 'font-size': 14 }); return; }
    if (k === 1) { const x0 = 420, sc = 2; tx(x0, 252, 'Promise.all · 예시 지연', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      [['user', 40], ['order', 60], ['reco', 80]].forEach(([n, ms], i) => { const y = 262 + i * 26, g = E(u, 0.5, 0.5 + ms / 50);
        tx(x0 - 10, y + 15, n, { 'font-size': 13.5, 'text-anchor': 'end', 'font-weight': 700 });
        el('rect', { x: x0, y, width: ms * sc * g, height: 18, rx: 3, fill: INFO, opacity: 0.8 }); if (g > 0.95) mono(x0 + ms * sc + 8, y + 14, ms + 'ms', { 'font-size': 13.5 }); });
      [['병렬', 80, ACC], ['순서대로', 180, OFF]].forEach(([n, ms], i) => { const y = 350 + i * 30, col = i ? OFF : ACC, g = E(u, 2.0, 2.5);
        tx(x0 - 10, y + 15, n, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 800, fill: i ? MUT : ACC, opacity: g });
        el('rect', { x: x0, y, width: ms * sc * g, height: 20, rx: 3, fill: col }); mono(x0 + ms * sc * g + 8, y + 15, ms + 'ms', { 'font-size': 14.5, 'font-weight': 800, fill: i ? INK : ACC, opacity: g }); });
      return; }
    // k2~k5: 응답 만들기
    const RX = 330, RY = 250;
    if (k <= 4) { el('rect', { x: RX, y: RY, width: 420, height: 160, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      mono(RX + 14, RY + 24, 'res.json({ … })  모바일 응답', { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); }
    if (k === 2) { mono(RX + 14, RY + 56, 'user.name   ← displayName', { 'font-size': 14 }); mono(RX + 14, RY + 84, 'user.avatar ← 64px', { 'font-size': 14 });
      const s = lerp(96, 32, E(u, 0.5, 1.6)); el('rect', { x: RX + 300, y: RY + 40, width: s, height: s, rx: 4, fill: INFO, opacity: 0.6 });
      mono(RX + 300 + s + 8, RY + 40 + s / 2 + 5, Math.round(lerp(256, 64, E(u, 0.5, 1.6))) + 'px', { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(RX + 14, RY + 120, '그 밖의 프로필 필드', { 'font-size': 14, fill: OFF });
      el('line', { x1: RX + 10, y1: RY + 115, x2: RX + 10 + 170 * E(u, 1.4, 2.0), y2: RY + 115, stroke: BAD, 'stroke-width': 2.5 });
      sub(RX + 210, RY + 150, '처음 크기는 예시', fade(u, 1.0)); return; }
    if (k === 3) { ['id', 'status', 'total ← formatKRW(…)'].forEach((s, i) => mono(RX + 14, RY + 56 + i * 28, 'orders[].' + s, { 'font-size': 14, opacity: fade(u, 0.3 + i * 0.3) }));
      mono(RX + 14, RY + 140, 'orders[].가격 디테일', { 'font-size': 14, fill: OFF });
      el('line', { x1: RX + 10, y1: RY + 135, x2: RX + 10 + 190 * E(u, 1.5, 2.1), y2: RY + 135, stroke: BAD, 'stroke-width': 2.5 });
      sub(RX + 330, RY + 84, '통화 표기는', fade(u, 1.6), { fill: INK }); sub(RX + 330, RY + 104, 'BFF 가 맞춘다', fade(u, 1.7), { fill: INK }); return; }
    if (k === 4) { mono(RX + 14, RY + 56, 'recommendations · 6개 · 200px', { 'font-size': 14 }); tiles(RX + 14, RY + 72, 6, 52, 10, ACC, E(u, 0.3, 1.6));
      sub(RX + 210, RY + 150, '화면에 맞춘 크기와 개수', fade(u, 1.8), { fill: INK }); return; }
    // k5: 웹 BFF 는 다르게
    browser(60, 320, 90, 70, null, {}); tx(60, 375, '웹', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
    svc(230, 320, 'web BFF', { w: 150, sub: '웹 팀 소유', s: pop(u, 0.2) }); ln(105, 320, 153, 320, INK);
    tx(340, 262, '모바일', { 'font-size': 14, 'font-weight': 700, fill: ACC }); tiles(340, 274, 6, 22, 6, ACC, 1); mono(340, 330, '200px · 6개', { 'font-size': 13.5, fill: MUT });
    tx(560, 262, '웹', { 'font-size': 14, 'font-weight': 700, fill: INFO }); tiles(560, 274, 12, 26, 6, INFO, E(u, 0.6, 1.8)); mono(560, 360, '큰 이미지 · 12개 · 가격 디테일', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) });
    sub(560, 400, '같은 백엔드, 화면마다 다른 응답', fade(u, 2.1), { fill: INK, 'font-weight': 700, 'font-size': 14.5 }); }

  // ---------- 4. 도구 (Spring Cloud Gateway) ----------
  const ROWS = [['user', 90, ['Path', 'StripPrefix(1)', 'JwtAuth', 'RateLimiter'], 'lb://user-service'],
    ['order', 210, ['Path', 'JwtAuth', 'CircuitBreaker'], 'lb://order-service'],
    ['catalog', 330, ['Path', 'Cache 5분'], 'lb://catalog-service']];
  function routeRow(r, op, u0, hot) { const [n, y, fs, tgt] = r;
    ln(165, y, 695, y, GRID, { op, sw: 1.6 });
    pill(84, y, `route("${n}")`, INK, 1, { fs: 13.5, mono: true, op });
    fs.forEach((f, i) => { const x = 235 + i * 125, s = u0 == null ? 1 : pop(u0, 0.1 + i * 0.25);
      card(x, y, 116, 38, { rx: 7, text: f, fs: 13.5, mono: true, fw: 700, stroke: f === hot ? WARN : ACC, color: INK, fill: f === hot ? WARNBG : PANEL, op, s }); });
    card(800, y, 210, 38, { rx: 7, text: tgt, fs: 13.5, mono: true, fw: 700, stroke: INFO, color: INFO, op, s: u0 == null ? 1 : pop(u0, 0.2 + fs.length * 0.25) }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { svc(480, 130, 'GatewayApplication', { w: 320, h: 70, sub: '@SpringBootApplication', subMono: true, s: pop(u, 0.2) });
      pill(390, 210, 'Spring Boot', GOOD, pop(u, 0.7), { fs: 14 }); pill(560, 210, 'Java 스택 그대로', GOOD, pop(u, 0.9), { fs: 14 });
      R.snippet(270, 260, ['SpringApplication.run(GatewayApplication.class, args);'], { op: fade(u, 1.3) });
      sub(480, 360, '별도 인프라 없이 앱 하나가 곧 Gateway', fade(u, 1.9), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k <= 3) { ROWS.forEach((r, i) => { if (i + 1 > k) return; const cur = i + 1 === k; routeRow(r, cur ? 1 : 0.35, cur ? u : null, i === 1 && cur && u > 1.2 ? 'CircuitBreaker' : null);
        if (cur && i !== 1) for (let j = 0; j < 3; j++) dot([[165, r[1]], [695, r[1]]], seg(u, 1.0 + j * 0.4, 1.9 + j * 0.4), ACC, 6); });
      if (k === 1) { mono(330, 52, '/v1/users/7  →  /users/7', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); sub(560, 52, '예시 경로', fade(u, 0.9));
        sub(800, 130, '이름으로 인스턴스를 찾는다', fade(u, 1.8), { fill: INFO, 'font-weight': 700 }); }
      if (k === 2) { const open = u > 1.2;
        if (!open) dot([[165, 210], [695, 210]], seg(u, 0.3, 1.2), ACC, 6);
        else { for (let j = 0; j < 3; j++) dot([[165, 210], [485, 210], [485, 270]], seg(u, 1.3 + j * 0.35, 1.9 + j * 0.35), WARN, 6);
          card(485, 270, 190, 34, { rx: 17, text: 'forward:/fallback', fs: 13.5, mono: true, stroke: WARN, color: WARN, fill: PANEL, s: pop(u, 1.2) }); cross(800, 178, 9, pop(u, 1.2)); }
        sub(800, 248, open ? '회로 열림 → fallback' : 'order 가 흔들린다', 1, { fill: open ? WARN : BAD, 'font-weight': 700 }); }
      if (k === 3) { clock(400, 384, 16, E(u, 0.2, 2.6) * 0.5, INFO); mono(426, 389, '5분 동안 저장', { 'font-size': 13.5, 'font-weight': 700, fill: INFO });
        for (let j = 0; j < 3; j++) dot([[165, 330], [345, 330], [165, 330]], seg(u, 1.4 + j * 0.35, 1.9 + j * 0.35), GOOD, 6);
        sub(720, 384, '개인화되지 않은 응답만', fade(u, 1.8), { fill: WARN, 'font-weight': 700 }); }
      return; }
    if (k === 4) { // RedisRateLimiter(100, 200): 토큰 버킷
      svc(120, 120, 'gateway-1', { w: 150, h: 44 }); svc(120, 220, 'gateway-2', { w: 150, h: 44 });
      ln(195, 120, 300, 165, INFO); ln(195, 220, 300, 185, INFO);
      el('rect', { x: 300, y: 70, width: 160, height: 220, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2.5 });
      const left = lerp(200, 0, E(u, 0.6, 1.8)), hgt = 200 * left / 200; el('rect', { x: 310, y: 280 - hgt, width: 140, height: hgt, rx: 6, fill: INFO, opacity: 0.35 });
      mono(380, 180, Math.round(left) + ' / 200', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
      tx(380, 312, 'Redis 토큰 버킷 (공유)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO });
      sub(380, 334, '1초에 100개 채움 · 최대 200');
      const n = Math.round(lerp(0, 300, E(u, 0.6, 1.8)));
      tx(520, 100, '한꺼번에 들어온 요청', { 'font-size': 14, 'font-weight': 700 }); mono(520, 128, n + ' 건', { 'font-size': 18, 'font-weight': 800 });
      const okN = Math.min(n, 200), noN = Math.max(0, n - 200);
      el('rect', { x: 520, y: 170, width: 380 * okN / 300, height: 26, rx: 4, fill: GOOD }); el('rect', { x: 520 + 380 * okN / 300, y: 170, width: 380 * noN / 300, height: 26, rx: 4, fill: BAD });
      mono(520, 222, '통과 ' + okN, { 'font-size': 15, 'font-weight': 800, fill: GOOD }); mono(900, 222, '429 거절 ' + noN, { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: noN ? 1 : 0.3 });
      sub(710, 280, '토큰 버킷을 node 로 돌린 결과', fade(u, 2.0));
      note(480, 390, '인스턴스가 여러 대라 카운터는 로컬이 아니라 Redis 에', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    // k5: 고르는 기준
    tx(110, 60, '고를 때 보는 것', { 'font-size': 15, 'font-weight': 800 });
    tx(640, 60, 'Spring Cloud GW', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC }); tx(830, 60, '직접 만든 Gateway', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
    [['lb:// 로 discovery 연동'], ['WebFlux 로 높은 처리량'], ['Resilience4j circuit breaker'], ['인증 · rate limit · 캐시 필터']].forEach(([s], i) => { const y = 110 + i * 60, sc = pop(u, 0.2 + i * 0.3);
      card(330, y, 440, 46, { rx: 8, stroke: GRID, sw: 1.5, s: sc }); tx(126, y + 6, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) });
      check(640, y, 11, sc); card(830, y, 130, 34, { rx: 6, text: '처음부터 구현', fs: 13.5, stroke: OFF, color: MUT, dash: '4 4', s: sc }); });
    sub(480, 392, '이미 있는 기능이 선택 기준이 된다', fade(u, 1.9), { fill: INK, 'font-weight': 700, 'font-size': 15 }); }

  // ---------- 5. Gateway 가 모놀리스가 된다 ----------
  const DOM = [['user', 90], ['order', 200], ['pricing', 310]];
  const GWW = [130, 180, 220, 240, 60, 60, 60];
  function s5(t, c) { const { k, u } = c, thick = k <= 3, w = k === 0 ? lerp(60, 130, E(u, 1.2, 2.2)) : lerp(GWW[k - 1], GWW[k], E(u, 0.2, 1.0));
    phone(60, 210, { name: '클라이언트' }); ln(88, 210, 380 - w / 2, 210, INK);
    const gx = 380, col = thick ? (k >= 1 ? BAD : WARN) : ACC;
    el('rect', { x: gx - w / 2, y: 50, width: w, height: 320, rx: 12, fill: thick ? (k >= 1 ? BADBG : WARNBG) : ACCBG, stroke: col, 'stroke-width': 2.5 });
    tx(gx, 392, 'Gateway', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col });
    DOM.forEach(([n, y]) => { svc(820, y, n + '-service', { w: 190, h: 48, op: k === 2 && n !== 'user' ? 0.6 : 1 }); ln(gx + w / 2, y, 725, y, GRID, { sw: 1.8 }); });
    if (k === 0) { fly(560, 60, gx, 130, seg(u, 0.3, 1.2), 'if (amount > 100000 && tier === "GOLD")', { mono: true, fill: BAD });
      if (u > 1.2) { mono(gx, 140, 'applyDiscount', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) }); mono(gx, 160, '(0.1)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.3) }); }
      sub(560, 290, '"여기서 하면 빠르니까"', fade(u, 1.6), { fill: INK, 'font-size': 15 }); return; }
    if (k === 1) { DOM.forEach(([n, y], i) => { pill(620, y - 26, n + ' 규칙', BAD, pop(u, 0.3 + i * 0.25), { fs: 13.5, fill: PANEL }); });
      person(560, 360, null, { s: 0.8 }); fly(590, 360, gx + w / 2, 300, seg(u, 1.3, 2.1), '정책 변경 요청', { fill: WARN });
      sub(560, 412, 'pricing 팀', fade(u, 1.2), { fill: INK }); return; }
    if (k === 2) { dbIcon(560, 330, 'user DB', { s: 0.75, stroke: BAD });
      grow(gx + w / 2, 280, 525, 325, E(u, 0.3, 0.9), BAD);
      lock(820 + 105, 90, true, BAD, pop(u, 1.3)); sub(820, 130, 'schema 를 못 바꾼다', fade(u, 1.5), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { ['팀 A', '팀 B', '팀 C', '팀 D'].forEach((s, i) => { const x = 160 + i * 0, y = 60 + i * 40, sc = pop(u, 0.2 + i * 0.15);
        card(200, y + 10, 90, 30, { rx: 6, text: s, fs: 13.5, stroke: WARN, color: INK, s: sc }); });
      sub(200, 230 + 40, '등록 1주일', fade(u, 0.9), { fill: WARN, 'font-weight': 700, 'font-size': 14.5 });
      if (u > 1.4) { cross(gx, 170, 22, pop(u, 1.4)); DOM.forEach(([n, y]) => cross(705, y, 9, pop(u, 1.7))); }
      sub(gx, 30, '인스턴스 하나 = SPOF', fade(u, 1.5), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 }); return; }
    if (k === 4) { ['라우팅', '토큰 검증', 'rate limit', 'CORS', '로깅 · Trace ID', '정적 캐싱', '압축 · TLS 종단'].forEach((s, i) => {
        const y = 66 + i * 44, sc = pop(u, 0.9 + i * 0.18); check(470, y, 9, sc); tx(490, y + 5, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.95 + i * 0.18) }); });
      return; }
    if (k === 5) { [['비즈니스 로직', 90], ['데이터 접근', 200], ['도메인 모델', 310]].forEach(([s, y], i) => { const f = E(u, 0.4 + i * 0.3, 1.2 + i * 0.3);
        card(lerp(gx, 600, f), y, 130, 34, { rx: 17, text: s, fs: 13.5, stroke: BAD, color: BAD, fill: PANEL }); if (f > 0.95) cross(600 - 78, y, 8, 1); });
      sub(600, 380, 'Gateway 밖, 서비스 안으로', fade(u, 1.9), { fill: INK, 'font-weight': 700 }); return; }
    // k6: 운영 원칙
    [0, 1, 2].forEach((i) => { const y = 120 + i * 90; card(560, y, 100, 50, { rx: 8, text: 'gw-' + (i + 1), fs: 14, mono: true, stroke: i === 1 && u > 1.4 ? BAD : ACC, s: pop(u, 0.2 + i * 0.2) });
      if (!(i === 1 && u > 1.4)) dot([[gx + 30, 210], [510, y], [610, y], [725, [90, 200, 310][i]]], (t * 0.6 + i / 3) % 1, ACC, 5); });
    if (u > 1.4) cross(560, 210, 12, pop(u, 1.4)); sub(560, 270, '하나를 죽여 봐도 계속 돈다', fade(u, 1.7), { fill: GOOD, 'font-weight': 700 });
    sub(gx, 30, 'LB 뒤 다중 인스턴스 · 설정은 GitOps · PR 리뷰', fade(u, 0.6), { fill: INK, 'font-weight': 700, 'font-size': 14 }); }

  const quiz = [
    { q: '모바일 앱이 다섯 서비스의 주소를 직접 들고 있을 때 가장 큰 문제는 무엇인가?',
      o: ['백엔드 주소를 바꾸면 이미 깔린 앱을 동시에 고칠 수 없다', '서비스가 다섯 개라 서버 비용이 늘어난다', '모바일 앱이 HTTPS를 쓸 수 없다'], a: 0,
      why: '앱 업데이트는 사용자 손에 달려 있다. 주소가 앱에 박히면 백엔드를 옮길 때마다 옛 앱이 깨진다.' },
    { q: 'Kong에 jwt와 rate-limiting 플러그인을 걸면 뒤쪽 서비스는 무엇을 덜 하게 되나?',
      o: ['도메인 로직 처리', '토큰 검증과 요청 수 제한', '자기 DB 관리'], a: 1,
      why: '인증과 분당 100건 제한을 Gateway 한 곳에서 처리하므로 서비스는 이미 검증된 요청만 받는다.' },
    { q: '모바일 BFF가 user, order, 추천을 Promise.all로 부르면 기다리는 시간은 어떻게 되나?',
      o: ['세 호출 시간을 모두 더한 만큼', '가장 빠른 호출만큼', '가장 느린 호출만큼'], a: 2,
      why: '세 호출이 동시에 나가므로 가장 늦게 끝나는 하나를 기다린다. 예시로 40·60·80ms면 80ms다.' },
    { q: 'Gateway를 여러 대 띄울 때 RedisRateLimiter를 쓰는 이유는 무엇인가?',
      o: ['인스턴스들이 같은 카운터를 나눠 봐야 해서', 'Redis가 JWT를 검증해 줘서', '캐시를 5분 동안 두려고'], a: 0,
      why: '카운터가 인스턴스마다 따로 있으면 대수만큼 한도가 늘어난다. Redis에 두면 초당 100, 순간 200을 함께 센다.' },
    { q: '다음 중 Gateway에 두어도 되는 것은 무엇인가?',
      o: ['GOLD 등급 할인 계산', '토큰 검증과 rate limit', 'user DB 직접 조회'], a: 1,
      why: 'Gateway는 라우팅, 인증, rate limit 같은 횡단 관심사만 맡는다. 할인 규칙과 데이터 접근은 서비스 몫이다.' },
  ];
  const summary = [
    '앱이 서비스 주소를 직접 알면 백엔드를 옮길 때 이미 깔린 앱이 깨지고, 인증과 CORS를 다섯 번 구현한다.',
    'Gateway는 api.shop.com 한 주소로 받아 내부로 라우팅하고 인증, rate limit, CORS, 메트릭을 한 곳에서 처리한다.',
    'BFF는 화면 하나에 맞춰 여러 백엔드를 병렬로 부르고 필요한 필드만 추려 돌려준다.',
    'Gateway에 할인 규칙이나 DB 접근이 들어오면 모든 팀이 한 곳을 거치는 새 모놀리스가 된다.',
  ];
  const review = [
    { q: '새 서비스를 붙일 때마다 모바일 앱을 다시 배포하고 있다. 가장 먼저 할 일은?',
      o: ['앱 앞에 단일 진입점 Gateway를 두고 라우팅을 설정으로 옮긴다', '서비스 포트를 모두 같은 번호로 맞춘다', '앱 업데이트를 강제한다'], a: 0,
      why: '클라이언트가 api.shop.com만 알면 새 서비스는 Gateway 설정 한 블록으로 붙고 앱은 바뀌지 않는다.' },
    { q: 'Gateway 코드에 화면마다 다른 응답 분기가 쌓이고 있다. 알맞은 정리 방법은?',
      o: ['분기를 모두 user-service로 옮긴다', '클라이언트 종류별 BFF로 나눠 각 팀이 갖게 한다', 'Gateway 인스턴스를 늘린다'], a: 1,
      why: '모바일과 웹은 필요한 필드와 이미지 크기가 다르다. 그 차이는 클라이언트 팀이 소유한 BFF가 흡수한다.' },
    { q: '새 라우트 하나 등록하는 데 일주일이 걸리고, Gateway가 죽으면 전체가 멈춘다. 이 상태를 무엇이라 보나?',
      o: ['정상적인 단일 진입점', 'BFF 패턴의 부작용', 'Gateway가 조직 병목이자 SPOF가 된 안티패턴'], a: 2,
      why: '기술적 단일 진입점은 좋지만 한 팀 독점과 단일 인스턴스는 모놀리스의 문제를 되살린다. 다중 인스턴스와 GitOps로 얇게 유지한다.' },
  ];

  R.page({ title: 'Gateway 토폴로지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
