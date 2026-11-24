/* III-1-2 Gateway 인증 + Rate Limit — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 서비스 8개와 Gateway(인증 위치), JWT 필터의 관문 5개와 401 통, Redis 토큰 버킷(10/20/1), KeyResolver 가 고른 버킷 키,
 * 완성형 필터 파이프라인과 관측 지표. 버킷 수치(30건 몰림 → 20 통과·10 거부)는 SCG 토큰 버킷 식을 파이썬으로 돌려 확인했다.
 * 토큰 값(sub 42, roles), IP, Redis timestamp, 지연 분포는 "예시" 로 표시한다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, lock, kvTable, dbIcon, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function req(x, y, method, path, o) { o = o || {}; const fs = o.fs || 14, mw = tw(method, fs) + 16, pw = tw(path, fs) + 18, g = R.G(x, y, o.s, o.op);
    el('rect', { x: 0, y: -15, width: mw + pw, height: 30, rx: 7, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    el('rect', { x: 0, y: -15, width: mw, height: 30, rx: 7, fill: o.mcol || INFO }, g);
    mono(mw / 2, 5, method, { 'font-size': fs, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }, g);
    mono(mw + 9, 5, path, { 'font-size': fs, fill: o.pcol || INK }, g); return mw + pw; }
  const gateway = (cx, cy, o) => { o = o || {}; const g = card(cx, cy, o.w || 130, o.h || 80, { rx: 12, stroke: ACC, sw: 3, fill: ACCBG, s: o.s, op: o.op });
    tx(0, o.sub ? -4 : 6, o.name || 'Gateway', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC }, g);
    if (o.sub) mono(0, 18, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: ACC }, g); return g; };

  // ---------- 1. 인증 위치: 서비스 8곳 vs Gateway 1곳 ----------
  const SVC = ['user', 'order', 'catalog', 'payment', '', '', '', ''];
  const SP = (i) => ({ x: 720 + (i % 2) * 150, y: 64 + Math.floor(i / 2) * 72 });
  const GW = { x: 420, y: 168 }, CL = { x: 80, y: 168 };
  function services(o) { o = o || {};
    SVC.forEach((n, i) => { const p = SP(i), st = o.style ? o.style(i) : {};
      card(p.x, p.y, 134, 44, { rx: 8, stroke: st.stroke || (n ? INK : GRID), dash: n ? null : '5 4', sw: 2, fill: st.fill, op: st.op });
      tx(p.x - 52, p.y + 5, n || `서비스 ${i + 1}`, { 'font-size': 14.5, 'font-weight': 700, fill: n ? INK : MUT, opacity: st.op ?? 1 }); }); }
  function keyOn(i, s, col) { const p = SP(i); lock(p.x + 46, p.y, true, col || ACC, 0.7 * s); }
  function s1(t, c) { const { k, u } = c;
    const isB = k >= 2;
    person(CL.x, CL.y, '클라이언트', {});
    gateway(GW.x, GW.y, { sub: isB ? 'JWT 검증' : '라우팅만', op: 1 });
    grow(CL.x + 30, CL.y, GW.x - 66, GW.y, 1, MUT, { plain: true });
    SVC.forEach((_, i) => { const p = SP(i); el('line', { x1: GW.x + 66, y1: GW.y, x2: p.x - 68, y2: p.y, stroke: GRID, 'stroke-width': 1.6 }); });
    const atk = k === 3 || k === 6;
    services({ style: (i) => (atk && i === 1 ? { stroke: BAD } : {}) });
    if (k === 0) { SVC.forEach((_, i) => { const s = pop(u, 0.4 + i * 0.15); if (s > 0) keyOn(i, s); });
      SVC.forEach((_, i) => { const p = SP(i); dot([[CL.x + 30, CL.y], [GW.x - 66, GW.y], [GW.x + 66, GW.y], [p.x - 68, p.y]], seg(u, 0.1 + i * 0.05, 1.2 + i * 0.05), INFO, 5); });
      note(40, 300, '모델 A · 서비스가 각자 JWT 를 검증한다', fade(u, 1.6));
      note(40, 330, 'Gateway 를 우회해도 서비스가 막는다', fade(u, 2.1), { fill: GOOD }); return; }
    if (k === 1) { SVC.forEach((_, i) => keyOn(i, 1));
      SVC.forEach((_, i) => { const p = SP(i); hbar(p.x - 60, p.y + 26, 90, 1, 1, { h: 6, label: false, col: WARN, u: E(u, 0.3 + i * 0.1, 0.9 + i * 0.1) }); });
      const n = Math.round(lerp(0, 8, E(u, 0.4, 2.0)));
      tx(40, 300, '공개키 rotate 배포', { 'font-size': 15, 'font-weight': 700 }); mono(230, 302, `${n} / 8`, { 'font-size': 22, 'font-weight': 800, fill: BAD });
      note(40, 340, 'JWKS 로직 8벌 · 서명 검증 CPU 도 서비스마다', fade(u, 1.8), { fill: WARN }); return; }
    // 모델 B: 열쇠가 Gateway 로 모인다
    const lockAt = k === 2 ? E(u, 0.2, 1.3) : 1;
    if (k === 2) SVC.forEach((_, i) => { const p = SP(i); if (lockAt < 1) lock(lerp(p.x + 46, GW.x, lockAt), lerp(p.y, GW.y - 54, lockAt), true, ACC, 0.7); });
    if (lockAt >= 1) lock(GW.x, GW.y - 56, true, ACC, 1);
    if (k === 2) { SVC.forEach((_, i) => { const p = SP(i); dot([[GW.x + 66, GW.y], [p.x - 68, p.y]], seg(u, 1.4 + i * 0.05, 2.2 + i * 0.05), ACC, 5); });
      pill(GW.x, GW.y + 70, 'X-User-Id · X-Roles', ACC, pop(u, 1.5), { mono: true, fs: 13.5, fill: PANEL });
      tx(40, 300, '검증 위치', { 'font-size': 15, 'font-weight': 700 }); mono(130, 302, `${Math.round(lerp(8, 1, lockAt))}곳`, { 'font-size': 22, 'font-weight': 800, fill: ACC }); return; }
    pill(GW.x, GW.y + 70, 'X-User-Id · X-Roles', ACC, 1, { mono: true, fs: 13.5, fill: PANEL });
    if (k === 3) { person(560, 360, '외부 공격자', { stroke: BAD });
      const p = SP(1); grow(590, 350, p.x - 60, p.y + 20, E(u, 0.3, 1.2), BAD, { dash: '6 5' });
      pill(560, 300, 'X-User-Id: 1', BAD, pop(u, 1.0), { mono: true, fs: 13.5, fill: PANEL });
      note(40, 330, '헤더만 믿으면 백엔드가 노출될 때 그대로 속는다', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 4) { ['① 서명 검증', '② claim 추출', '③ 헤더 주입'].forEach((s, i) => card(GW.x - 170 + i * 0, 270 + i * 40, 160, 32, { rx: 16, text: s, fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 0.3 + i * 0.4), fill: PANEL }));
      note(40, 300, 'layer1 = Gateway', fade(u, 0.2), { fill: ACC }); return; }
    if (k === 5) { const p = SP(1);
      card(560, 330, 330, 110, { rx: 10, stroke: INK, s: pop(u, 0.2), fill: PANEL });
      tx(410, 300, 'order 서비스 안', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4) });
      cross(420, 330, 7, fade(u, 0.8)); tx(436, 335, 'JWT 다시 파싱하지 않는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.8) });
      check(420, 364, 8, fade(u, 1.4)); mono(436, 369, 'X-Roles 로 메서드 권한만 본다', { 'font-size': 14, opacity: fade(u, 1.4) });
      grow(p.x - 60, p.y + 22, 700, 290, E(u, 0.2, 0.6), MUT, { plain: true }); note(40, 300, 'layer2·3 = 서비스', fade(u, 0.2)); return; }
    // k6: 인터넷 / 내부망
    const f = E(u, 0.2, 1.0);
    el('rect', { x: 10, y: 20, width: 480 * f, height: 250, rx: 12, fill: BADBG, opacity: 0.45 });
    el('rect', { x: 600, y: 20, width: 340, height: 300 * f, rx: 12, fill: GOODBG, opacity: 0.6 });
    tx(20, 290, '인터넷 · Gateway 만 열림', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
    tx(930, 345, '내부 전용 · NetworkPolicy / private subnet', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.0) });
    person(300, 360, '외부 공격자', { stroke: BAD });
    grow(330, 352, lerp(330, 598, E(u, 1.2, 1.9)), 352, 1, BAD, { dash: '6 5', plain: true });
    el('rect', { x: 594, y: 330, width: 8, height: 50, rx: 3, fill: INK, opacity: fade(u, 1.9) }); cross(620, 356, 9, pop(u, 2.0)); }

  // ---------- 2. JWT 글로벌 필터: 관문 5개 ----------
  const GATES = [['public?', 210], ['Bearer?', 360], ['서명', 510], ['claim', 660], ['헤더 주입', 810]];
  const GY = 160, BIN = { x: 480, y: 360 };
  function pipe(k, u, hot, o) { o = o || {};
    el('line', { x1: 60, y1: GY, x2: 930, y2: GY, stroke: GRID, 'stroke-width': 3 });
    GATES.forEach(([s, x], i) => { const on = hot === i;
      card(x, GY, 104, 46, { rx: 10, text: s, fs: 14.5, stroke: on ? ACC : o.done && o.done > i ? GOOD : GRID, fill: on ? ACCBG : PANEL, color: on ? ACC : INK, sw: on ? 3 : 2 }); });
    R.server(905, GY - 2, null, { s: 0.55, lamp: GOOD }); sub(905, GY + 44, '백엔드', 1);
    // 401 통
    el('path', { d: `M${BIN.x - 70},${BIN.y - 30} L${BIN.x - 56},${BIN.y + 30} L${BIN.x + 56},${BIN.y + 30} L${BIN.x + 70},${BIN.y - 30}`, fill: BADBG, stroke: BAD, 'stroke-width': 2 });
    mono(BIN.x, BIN.y + 6, '401', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); }
  const drop = (x, u, a, label) => { dot([[x, GY + 24], [x, GY + 70], [BIN.x, BIN.y - 30]], seg(u, a, a + 0.8), BAD, 7);
    if (u > a + 0.8) pill(x, GY + 92, label, BAD, pop(u, a + 0.8), { mono: true, fs: 13.5, fill: PANEL }); };
  function s2(t, c) { const { k, u } = c;
    if (k === 9) { // getOrder -50
      const x0 = 120, x1 = 860, y = 200; el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: MUT, 'stroke-width': 2 });
      [[-100, 'RequestId (III-1-1)', INK, 200], [-50, 'JwtAuthGlobalFilter', ACC, 430], ['1, 2…', 'RequestRateLimiter 등', WARN, 660], ['마지막', '백엔드 호출', MUT, 830]].forEach(([v, s, col, x], i) => { const sc = pop(u, 0.2 + i * 0.3);
        el('circle', { cx: x, cy: y, r: 9 * sc, fill: col }); if (sc < 0.5) return;
        mono(x, y - 22, String(v), { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); tx(x, y + 32, s, { 'font-size': 14.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle' }); });
      card(480, 330, 620, 64, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 1.6), text: 'X-User-Id 를 먼저 넣어야 뒤의 rate limit 이\n그 헤더로 사용자별 버킷을 고를 수 있다', fs: 15 }); return; }
    const hot = [null, 0, 0, 1, 2, 3, 4, 4, null][k];
    pipe(k, u, hot, { done: k >= 7 ? 5 : 0 });
    if (k === 0) { const f = E(u, 0.3, 1.4); el('rect', { x: 140, y: 110, width: 740 * f, height: 100, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 3 });
      if (f > 0.95) tx(150, 100, '@Component JwtAuthGlobalFilter implements GlobalFilter, Ordered', { 'font-size': 14, 'font-weight': 800, fill: ACC, class: 'mono' });
      note(40, 270, '모든 route 에 걸린다 · route 설정은 그대로', fade(u, 1.7)); return; }
    if (k === 1) { const P = ['/api/auth/login', '/api/auth/signup', '/api/auth/refresh', '/actuator/health'];
      zone(30, 230, 290, 170, 'PUBLIC_PATHS', { fill: SOFT });
      P.forEach((p, i) => mono(48, 280 + i * 30, p, { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.3) }));
      note(620, 300, '토큰이 없어야 정상인 길', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { req(30, 70, 'POST', '/api/auth/login', { s: pop(u, 0.1) });
      dot([[60, GY], [210, GY]], seg(u, 0.3, 0.8), ACC, 7); if (u > 0.8) check(210, GY - 40, 10, pop(u, 0.8));
      const f = E(u, 1.0, 2.0); el('path', { d: `M210,${GY - 24} C300,30 760,30 880,${GY - 24}`, fill: 'none', stroke: ACC, 'stroke-width': 2.6, pathLength: 100, 'stroke-dasharray': `${f * 100} 100` });
      tx(545, 48, 'public → 검증 없이 chain.filter()', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 3) { req(30, 70, 'GET', '/api/orders  (Authorization 없음)', { s: pop(u, 0.1), mcol: MUT });
      dot([[60, GY], [360, GY]], seg(u, 0.2, 0.8), INFO, 7); drop(360, u, 0.8, 'missing token');
      const s = 'Bearer eyJhbGciOi…'; mono(600, 270, s, { 'font-size': 16, opacity: fade(u, 1.6) });
      el('line', { x1: 598, y1: 265, x2: 598 + tw('Bearer ', 16) * E(u, 1.9, 2.4), y2: 265, stroke: BAD, 'stroke-width': 2.5 });
      mono(600, 300, 'substring(7) = "Bearer " 7글자 떼기', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { req(30, 70, 'GET', '/api/orders  Bearer <위조>', { s: pop(u, 0.1), mcol: BAD });
      dot([[60, GY], [510, GY]], seg(u, 0.2, 0.9), INFO, 7); drop(510, u, 0.9, 'bad signature');
      lock(600, 66, true, ACC, pop(u, 0.4)); tx(624, 72, 'JWKS 공개키 (캐시)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      card(820, 290, 150, 44, { rx: 8, text: 'Auth Server', fs: 14.5, stroke: GRID, color: MUT }); cross(820, 290, 12, pop(u, 1.8));
      sub(820, 334, '요청마다 부르지 않는다', fade(u, 1.9)); return; }
    if (k === 5) { card(230, 300, 330, 96, { rx: 10, fill: SOFT, stroke: GRID, s: pop(u, 0.2) });
      mono(80, 285, '{ "sub": "42",', { 'font-size': 15, opacity: fade(u, 0.4) }); mono(80, 312, '  "roles": ["USER","ADMIN"] }', { 'font-size': 15, opacity: fade(u, 0.6) });
      tx(80, 340, '토큰 본문 (예시 값)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.7) });
      grow(410, 300, 560, 300, E(u, 1.0, 1.4), ACC);
      mono(580, 290, 'userId   = "42"', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      mono(580, 318, 'rolesStr = "USER,ADMIN"', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); return; }
    if (k === 6) { card(740, 290, 340, 100, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 0.2) });
      mono(590, 265, 'GET /api/orders', { 'font-size': 15, opacity: fade(u, 0.4) });
      mono(590, 292, '+ X-User-Id: 42', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      mono(590, 318, '+ X-Roles: USER,ADMIN', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
      sub(740, 364, 'mutate() 로 만든 새 요청 · 원본은 불변', fade(u, 1.8)); return; }
    if (k === 7) { dot([[60, GY], [880, GY]], seg(u, 0.2, 1.4), ACC, 8); if (u > 1.4) check(905, GY - 50, 11, pop(u, 1.4));
      req(30, 70, 'GET', '/api/orders  Bearer <깨진 문자열>', { s: pop(u, 1.4), mcol: MUT });
      drop(510, u, 1.7, 'invalid token');
      sub(220, 300, 'parse 예외도 catch 로 401', fade(u, 2.3), { 'text-anchor': 'start' }); return; }
    // k8: 401 응답 만들기
    card(760, 330, 330, 92, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, s: pop(u, 0.3) });
    mono(610, 312, 'HTTP 401 Unauthorized', { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.5) });
    mono(610, 340, 'X-Auth-Failure: bad signature', { 'font-size': 14.5, opacity: fade(u, 0.9) });
    mono(610, 362, 'setComplete() · 백엔드 호출 없음', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3) });
    grow(552, 360, 620, 340, E(u, 0.2, 0.6), BAD, { plain: true }); }

  // ---------- 3. 토큰 버킷 ----------
  // 버킷: cap 칸(4열) 중 tokens 개가 차 있다
  function bucket(cx, by, cap, tokens, o) { o = o || {}; const cols = o.cols || 4, rows = Math.ceil(cap / cols), cs = o.cs || 24, w = cols * cs + 16, h = rows * cs + 14;
    el('path', { d: `M${cx - w / 2},${by - h} L${cx - w / 2 + 6},${by} L${cx + w / 2 - 6},${by} L${cx + w / 2},${by - h}`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.5 });
    for (let i = 0; i < cap; i++) { const r = Math.floor(i / cols), q = i % cols, x = cx - w / 2 + 8 + q * cs + cs / 2, y = by - 8 - r * cs - cs / 2, on = i < tokens;
      el('circle', { cx: x, cy: y, r: cs / 2 - 3, fill: on ? (o.col || ACC) : 'none', stroke: on ? 'none' : GRID, 'stroke-width': 1.2, opacity: on ? 0.9 : 1 }); }
    if (o.label) tx(cx, by + 22, o.label, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', class: o.mono ? 'mono' : null, fill: o.lcol || INK });
    return { w, h }; }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { // Gateway 2대가 Redis 하나를 같이 본다
      [['gateway-1', 120], ['gateway-2', 280]].forEach(([n, y], i) => gateway(150, y, { name: n, w: 150, h: 60, s: pop(u, 0.1 + i * 0.2) }));
      dbIcon(480, 200, 'redis-master:6379', { stroke: BAD });
      [120, 280].forEach((y, i) => grow(226, y, 432, 200 + (i ? 20 : -20), E(u, 0.6, 1.2), ACC));
      tx(480, 300, '버킷은 하나 · 두 대가 같은 카운터를 센다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.3) });
      card(780, 200, 280, 130, { rx: 10, stroke: BAD, dash: '6 5', s: pop(u, 1.6) });
      tx(780, 170, 'Redis 가 없으면', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.7) });
      tx(780, 202, '인스턴스마다 따로 센다', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(780, 230, '2대면 제한이 2배로 느슨', { 'font-size': 14.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { // 10/20/1
      const tok = Math.min(20, Math.floor(lerp(0, 20, E(u, 0.2, 2.0))));
      bucket(300, 340, 20, tok, { label: `tokens ${tok} / 20`, mono: true });
      for (let i = 0; i < 3; i++) dot([[300 - 20 + i * 20, 40], [300 - 20 + i * 20, 190]], ((t * 0.9 + i / 3) % 1), INFO, 5);
      mono(300, 30, '+10 / 초', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' });
      [['replenishRate: 10', '초당 채우는 토큰'], ['burstCapacity: 20', '버킷이 담는 최대 토큰'], ['requestedTokens: 1', '요청 1건이 쓰는 토큰']].forEach(([a, b], i) => {
        mono(500, 110 + i * 70, a, { 'font-size': 16, 'font-weight': 800, fill: i === 1 ? ACC : INK, opacity: fade(u, 0.3 + i * 0.5) });
        tx(500, 136 + i * 70, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) }); }); return; }
    if (k === 2) { // 사용자별 버킷
      mono(480, 40, 'key-resolver: "#{@userKeyResolver}"', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      [['user 42', 300, 14], ['user 7', 660, 20]].forEach(([n, x, tk], i) => { bucket(x, 330, 20, tk, { label: n, mono: true });
        person(x, 100, null, { s: 0.8 }); dot([[x, 130], [x, 200]], ((t * 0.8 + i * 0.3) % 1), i ? INFO : WARN, 6); });
      sub(480, 392, '버킷 단위 = 사용자', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { // search 5/10, IP 기준
      bucket(260, 330, 20, 20, { label: 'orders 10/20 · user', mono: true });
      const tok = Math.round(lerp(10, 10, 1)); bucket(640, 330, 10, tok, { label: 'search 5/10 · IP', mono: true, col: WARN, stroke: WARN, lcol: WARN });
      mono(640, 120, '+5 / 초', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      mono(260, 80, '+10 / 초', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' });
      note(480, 40, '비싼 검색은 버킷을 작게, 비로그인 호출이 많아 IP 로', fade(u, 1.0), { 'text-anchor': 'middle' }); return; }
    if (k === 4) { // 30건 몰림 → 20 통과 / 10 거부, 그다음 초엔 10 통과 (SCG 토큰 버킷 식으로 계산)
      const ax = R.axes(160, 60, 520, 280, { x: [0, 3], y: [0, 30], yt: [0, 10, 20, 30], grid: true, yl: '요청 수', xl: '' });
      [[30, 20], [15, 10], [15, 10]].forEach(([n, ok], i) => { const g = E(u, 0.3 + i * 0.5, 1.0 + i * 0.5), x = ax.X(i + 0.5) - 40;
        el('rect', { x, y: ax.Y(ok * g), width: 80, height: ax.Y(0) - ax.Y(ok * g), fill: GOOD, opacity: 0.85 });
        el('rect', { x, y: ax.Y((ok + (n - ok) * g) * 1), width: 80, height: ax.Y(ok) - ax.Y(ok + (n - ok) * g), fill: BAD, opacity: 0.75 * clamp(g * 1.5 - 0.5) });
        mono(ax.X(i + 0.5), ax.Y(0) + 22, `${i}초`, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
        if (g > 0.9) { mono(ax.X(i + 0.5), ax.Y(ok / 2) + 5, String(ok), { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' });
          mono(ax.X(i + 0.5), ax.Y(ok + (n - ok) / 2) + 5, String(n - ok), { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }); } });
      el('rect', { x: 720, y: 120, width: 16, height: 16, rx: 3, fill: GOOD }); tx(744, 133, '통과', { 'font-size': 14.5 });
      el('rect', { x: 720, y: 150, width: 16, height: 16, rx: 3, fill: BAD }); tx(744, 163, '429', { 'font-size': 14.5 });
      tx(720, 220, '쉬는 동안 20개가 쌓여', { 'font-size': 14.5, opacity: fade(u, 1.8) }); tx(720, 246, '처음 20건은 한꺼번에 통과', { 'font-size': 14.5, opacity: fade(u, 1.9) });
      tx(720, 272, '그다음부터 초당 10건', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 5) { // 토큰이 없으면 429
      bucket(200, 330, 20, 0, { label: 'tokens 0 / 20', mono: true, stroke: BAD });
      dot([[200, 60], [200, 160]], seg(u, 0.2, 0.8), INFO, 7);
      grow(280, 200, 460, 200, E(u, 0.9, 1.3), BAD);
      card(640, 200, 330, 124, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, s: pop(u, 1.2) });
      [['HTTP 429 Too Many Requests', 800, BAD], ['X-RateLimit-Remaining: 0', 600, INK], ['X-RateLimit-Burst-Capacity: 20', 600, INK], ['X-RateLimit-Replenish-Rate: 10', 600, INK]].forEach(([s, w, col], i) =>
        mono(490, 162 + i * 26, s, { 'font-size': 14, 'font-weight': w, fill: col, opacity: fade(u, 1.4 + i * 0.2) }));
      R.server(880, 340, 'order-service', { s: 0.7, op: 0.5 }); cross(880, 340, 14, pop(u, 2.1)); return; }
    // k6: Redis 키와 Lua
    kvTable(80, 70, 520, [['request_rate_limiter.{user-42}.tokens', '0'], ['request_rate_limiter.{user-42}.timestamp', '1764…']], { title: 'Redis · 사용자마다 키 2개 (값은 예시)', kw: 430, rh: 40 });
    card(760, 140, 260, 110, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 0.6) });
    tx(760, 118, 'Lua 스크립트 한 번', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
    tx(760, 146, '읽기 · 계산 · 쓰기를', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    tx(760, 170, '원자적으로', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
    [0, 1].forEach((i) => dot([[180 + i * 300, 330], [180 + i * 300, 250], [640, 160]], seg(u, 1.3 + i * 0.3, 2.3 + i * 0.3), INFO, 6));
    [['gateway-1', 180], ['gateway-2', 480]].forEach(([n, x]) => card(x, 350, 150, 40, { rx: 8, text: n, fs: 14.5, stroke: ACC, color: ACC }));
    sub(480, 400, '두 대가 동시에 와도 한 사용자 = 한 버킷', fade(u, 2.0), { 'font-size': 14.5 }); }

  // ---------- 4. KeyResolver ----------
  function sorter(rows, u, o) { o = o || {};   // rows: [label, key, bucketX, col]
    card(400, 200, 130, 300, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG });
    tx(400, 70, o.name || 'KeyResolver', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', class: 'mono' });
    rows.forEach(([lab, key, by, col], i) => { const y = 90 + i * 72, at = 0.2 + i * 0.4;
      card(150, y, 220, 44, { rx: 8, text: lab, fs: 14, mono: true, stroke: col || INK, s: pop(u, at), fw: 600 });
      dot([[262, y], [335, y], [465, by]], seg(u, at + 0.3, at + 1.0), col || INFO, 6);
      grow(468, by, 560, by, E(u, at + 1.0, at + 1.2), col || INFO, { plain: true });
      if (u > at + 1.0 && !(i > 0 && rows[i - 1][1] === key)) pill(660, by, key, col || INK, pop(u, at + 1.0), { mono: true, fs: 14, fill: PANEL }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { sorter([['X-User-Id: 42', '42', 90], ['X-User-Id: 7', '7', 162], ['(헤더 없음)', 'anonymous', 300, WARN], ['(헤더 없음)', 'anonymous', 300, WARN]], u, { name: 'userKeyResolver' });
      sub(800, 340, '비로그인은 모두 한 버킷을 나눠 쓴다', fade(u, 2.2), { fill: WARN, 'font-size': 14.5, 'text-anchor': 'end' }); return; }
    if (k === 1) { // NAT 뒤 100명 = IP 하나
      for (let i = 0; i < 24; i++) el('circle', { cx: 60 + (i % 6) * 26, cy: 90 + Math.floor(i / 6) * 26, r: 8, fill: OFF, opacity: fade(u, 0.1 + i * 0.03) });
      tx(60, 210, '사무실 NAT 뒤 100명', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) });
      grow(220, 130, 330, 130, E(u, 0.8, 1.2), MUT); card(400, 130, 130, 60, { rx: 10, text: 'ipKey\nResolver', fs: 14, stroke: ACC, color: ACC, fill: ACCBG });
      grow(466, 130, 560, 130, E(u, 1.2, 1.5), MUT, { plain: true }); pill(660, 130, '203.0.113.7', BAD, pop(u, 1.4), { mono: true, fs: 14, fill: PANEL });
      bucket(660, 330, 20, 0, { stroke: BAD, cs: 20, label: '한 버킷을 100명이 같이' , lcol: BAD });
      sub(150, 300, 'remoteAddress 가 없으면 "unknown"', fade(u, 2.0), { 'font-size': 14.5 }); sub(150, 400, 'IP 는 예시', 1); return; }
    if (k === 2) { sorter([['X-API-Key: key-A', 'key-A', 90, INFO], ['X-API-Key: key-B', 'key-B', 162, ACC], ['(키 없음)', 'noapikey', 234, MUT]], u, { name: 'apiKeyResolver' });
      sub(660, 330, '파트너마다 quota 를 따로 줄 수 있다', fade(u, 1.9), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 3 || k === 4) { sorter(k === 3 ? [['X-User-Id: 42', 'u:42', 90, ACC]] : [['X-User-Id: 42', 'u:42', 90, ACC], ['(헤더 없음) IP A', 'ip:203.0.113.7', 162, WARN], ['(헤더 없음) IP B', 'ip:198.51.100.4', 234, WARN]], k === 3 ? u : u + 0.0, { name: 'userOrIpResolver' });
      if (k === 3) sub(660, 160, '접두사로 사용자 42 와 IP 42.x 가 섞이지 않는다', fade(u, 1.6), { 'font-size': 14.5, fill: INK });
      else sub(660, 330, '비로그인도 IP 마다 버킷이 갈린다 (IP 는 예시)', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    // k5: X-Forwarded-For 위조
    person(90, 200, '공격자', { stroke: BAD });
    ['1.1.1.1', '2.2.2.2', '3.3.3.3', '4.4.4.4'].forEach((ip, i) => { const at = 0.2 + i * 0.4, y = 70 + i * 70;
      pill(270, y, `XFF: ${ip}`, BAD, pop(u, at), { mono: true, fs: 13.5, fill: PANEL });
      grow(350, y, 560, y, E(u, at + 0.2, at + 0.5), BAD, { plain: true });
      bucket(650, y + 26, 8, 8, { cols: 8, cs: 18, col: GOOD }); });
    tx(650, 30, '매번 새 버킷 = 제한이 없다', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    card(860, 200, 150, 64, { rx: 10, stroke: ACC, sw: 2.5, text: 'Trusted Proxy\n설정 필요', fs: 14.5, color: ACC, s: pop(u, 2.1) }); }

  // ---------- 5. 통합 파이프라인 ----------
  const ST = [['default\nfilters', 230], ['RateLimiter\n20 / 40', 390], ['Circuit\nBreaker', 550], ['Retry\nGET × 3', 710]];
  const PY = 110;
  function line5(k, u, hot, o) { o = o || {};
    person(70, PY, null, { s: 0.8 }); el('line', { x1: 100, y1: PY, x2: 820, y2: PY, stroke: GRID, 'stroke-width': 3 });
    ST.forEach(([s, x], i) => card(x, PY, 132, 62, { rx: 10, text: s, fs: 14.5, stroke: hot === i ? ACC : GRID, fill: hot === i ? ACCBG : PANEL, color: hot === i ? ACC : INK, sw: hot === i ? 3 : 2 }));
    [0, 1, 2].forEach((i) => card(880, 58 + i * 52, 110, 38, { rx: 6, text: `order #${i + 1}`, fs: 13.5, stroke: o.dead ? BAD : INK, color: o.dead ? BAD : INK, fill: o.dead ? BADBG : PANEL }));
    mono(880, 22, 'lb://order-service', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 4) line5(k, u, [0, 1, 2, 3, 3][k], { dead: k === 2 });
    if (k === 0) { dot([[100, PY], [820, PY]], seg(u, 0.2, 1.4), INFO, 7);
      pill(300, 210, '→ X-Gateway: spring-cloud', INFO, pop(u, 0.6), { mono: true, fs: 14, fill: PANEL });
      pill(300, 260, '← X-Powered-By: gateway', WARN, pop(u, 1.2), { mono: true, fs: 14, fill: PANEL });
      note(500, 215, '모든 route 공통 · route 마다 반복하지 않는다', fade(u, 1.7));
      sub(480, 340, '${random.uuid} 는 기동할 때 한 번만 풀린다 · 요청별 ID 는 GlobalFilter 에서', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 1) { bucket(390, 400, 40, Math.round(lerp(40, 28, E(u, 0.4, 2.0))), { cols: 8, cs: 18 });
      mono(560, 260, 'replenishRate 10 → 20', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(560, 290, 'burstCapacity 20 → 40', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      mono(560, 320, 'key: userOrIpResolver', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.1) });
      sub(700, 360, '앞에서 끊을수록 뒤 단계 비용을 아낀다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { dot([[100, PY], [550, PY]], seg(u, 0.2, 0.9), INFO, 7);
      const open = u > 1.0; el('line', { x1: 616, y1: PY, x2: open ? 650 : 664, y2: open ? PY - 28 : PY, stroke: open ? BAD : GOOD, 'stroke-width': 4, 'stroke-linecap': 'round' });
      tx(550, 175, open ? 'ordersCb OPEN' : 'CLOSED', { 'font-size': 15, 'font-weight': 800, fill: open ? BAD : GOOD, 'text-anchor': 'middle', class: 'mono' });
      const f = E(u, 1.2, 2.0); el('path', { d: `M550,${PY + 34} C550,240 300,240 260,280`, fill: 'none', stroke: WARN, 'stroke-width': 2.6, pathLength: 100, 'stroke-dasharray': `${f * 100} 100` });
      if (f > 0.95) pill(260, 300, 'forward:/fallback/orders', WARN, pop(u, 2.0), { mono: true, fs: 14, fill: PANEL });
      sub(720, 300, '죽은 백엔드를 기다리는 스레드가 쌓이지 않는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 3) { [0, 1, 2].forEach((i) => dot([[776, PY], [826, 58 + i * 52], [776, PY]], seg(u, 0.2 + i * 0.5, 0.65 + i * 0.5), INFO, 6));
      pill(710, 190, 'GET → 최대 3회 재시도', GOOD, pop(u, 0.4), { fs: 14, fill: PANEL });
      pill(710, 240, 'POST → 재시도 없음', BAD, pop(u, 1.4), { fs: 14, fill: PANEL });
      sub(400, 300, 'POST 를 다시 보내면 주문이 두 번 생길 수 있다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 4) { // 100 → 200 → 400ms (factor 2, 최대 2s)
      const ax = R.axes(160, 210, 600, 130, { x: [0, 2000], y: [0, 1], xt: [0, 100, 300, 700, 2000], xl: 'ms' });
      let x0 = 0; [100, 200, 400].forEach((ms, i) => { const g = E(u, 0.3 + i * 0.5, 0.8 + i * 0.5);
        el('rect', { x: ax.X(x0), y: 240 + i * 28, width: (ax.X(x0 + ms) - ax.X(x0)) * g, height: 20, rx: 3, fill: INFO, opacity: 0.8 });
        if (g > 0.9) mono(ax.X(x0 + ms) + 8, 255 + i * 28, `${ms}ms`, { 'font-size': 14, 'font-weight': 700, fill: INFO }); x0 += ms; });
      el('line', { x1: ax.X(2000), y1: 215, x2: ax.X(2000), y2: 340, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      tx(ax.X(2000), 206, 'maxBackoff 2s', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', 'font-weight': 700 }); return; }
    if (k === 5) { // actuator 노출
      tx(80, 60, 'management.endpoints.web.exposure.include', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      ['health', 'info', 'gateway', 'prometheus', 'metrics'].forEach((s, i) => { const x = 140 + i * 165;
        pill(x, 130, s, i === 2 ? WARN : ACC, pop(u, 0.3 + i * 0.25), { mono: true, fs: 15, fill: PANEL }); });
      lock(305, 180, true, WARN, pop(u, 1.6)); tx(330, 186, 'gateway 엔드포인트는 read-only · 외부 비공개', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.7) });
      dbIcon(480, 310, 'Prometheus', { s: pop(u, 2.0) }); return; }
    if (k === 6) { // 히스토그램: 평균 vs p99 (분포는 예시)
      const ax = R.axes(140, 60, 620, 270, { x: [0, 20], y: [0, 10], xl: '응답 시간 →', yl: '요청 수' });
      const H = [2, 6, 9, 8, 6, 4, 3, 2, 1.5, 1, 0.8, 0.6, 0.5, 0.4, 0.4, 0.3, 0.3, 0.6, 0.8, 0.5];
      H.forEach((h, i) => { const g = E(u, 0.2 + i * 0.05, 0.6 + i * 0.05); el('rect', { x: ax.X(i) + 2, y: ax.Y(h * g), width: ax.X(1) - ax.X(0) - 4, height: ax.Y(0) - ax.Y(h * g), fill: i >= 17 ? BAD : INFO, opacity: 0.75 }); });
      [[4.5, '평균', INK, 1.5], [18.5, 'p99', BAD, 2.0]].forEach(([x, s, col, at]) => { el('line', { x1: ax.X(x), y1: 60, x2: ax.X(x), y2: 330, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: fade(u, at) });
        tx(ax.X(x) + 6, 76, s, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, at) }); });
      tx(780, 170, '평균만 보면', { 'font-size': 14.5, opacity: fade(u, 2.2) }); tx(780, 196, '꼬리의 느린 요청이', { 'font-size': 14.5, opacity: fade(u, 2.2) }); tx(780, 222, '안 보인다', { 'font-size': 14.5, opacity: fade(u, 2.2) });
      sub(450, 400, '분포는 예시', 1); return; }
    if (k === 7) { const M = [['spring_cloud_gateway_requests_seconds', 'route 별 지연'], ['…_seconds_count', 'RPS'], ['resilience4j_circuitbreaker_state', 'CB 상태'], ['…_count{httpStatusCode="429"}', 'rate limit 거부']];
      dbIcon(820, 200, 'Prometheus');
      M.forEach(([m, d], i) => { const y = 80 + i * 72, at = 0.2 + i * 0.4;
        mono(40, y, m, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, at) }); tx(40, y + 24, d, { 'font-size': 14, fill: MUT, opacity: fade(u, at) });
        dot([[560, y - 4], [770, 190]], seg(u, at + 0.3, at + 1.0), ACC, 6); });
      sub(820, 300, 'routeId 라벨로 느린 백엔드를 좁힌다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k8: 알림 규칙 4개
    const A = [['5xx 비율', '> 5% · 5분'], ['p99 지연', '> 1000ms · 5분'], ['CB OPEN', '30초 지속'], ['한 사용자', '1시간 1만 건 초과']];
    tx(480, 50, 'Alertmanager 규칙', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
    A.forEach(([a, b], i) => { const cx = 260 + (i % 2) * 440, cy = 130 + Math.floor(i / 2) * 110, s = pop(u, 0.3 + i * 0.3);
      card(cx, cy, 380, 80, { rx: 10, stroke: BAD, sw: 2, s });
      tx(cx - 170, cy - 6, a, { 'font-size': 16, 'font-weight': 800, opacity: s > 0.5 ? 1 : 0 }); mono(cx - 170, cy + 22, b, { 'font-size': 15, fill: BAD, opacity: s > 0.5 ? 1 : 0 }); });
    tx(480, 380, '로그 grep 대신 조건이 넘으면 알림이 온다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: '모델 B(Gateway 에서만 JWT 검증)가 안전하려면 꼭 필요한 조건은 무엇인가?',
      o: ['서비스마다 JWKS를 따로 캐시한다', '백엔드는 내부망에만 두거나 mTLS로 출처를 보장한다', 'JWT 만료 시간을 1분으로 줄인다'], a: 1,
      why: '백엔드는 X-User-Id 헤더를 그대로 믿는다. 외부에서 백엔드에 직접 닿을 수 있으면 헤더를 위조당한다.' },
    { q: 'Authorization 헤더 없이 /api/orders를 부르면 JwtAuthGlobalFilter는 어떻게 하나?',
      o: ['서명 검증까지 시도한 뒤 500을 낸다', 'anonymous 사용자로 백엔드에 보낸다', '파싱 전에 missing token 401로 끊는다'], a: 2,
      why: '헤더가 없거나 "Bearer " 로 시작하지 않으면 토큰을 꺼내기 전에 unauthorized(…, "missing token")으로 끝낸다.' },
    { q: 'replenishRate 10, burstCapacity 20인 버킷에 쉬고 있다가 30건이 한꺼번에 오면?',
      o: ['10건 통과, 20건 429', '20건 통과, 10건 429', '30건 모두 통과'], a: 1,
      why: '쉬는 동안 토큰이 최대 20개까지 쌓여 있으므로 20건이 통과하고 나머지 10건은 429를 받는다.' },
    { q: '사무실 NAT 뒤 100명이 같은 IP로 들어온다. ipKeyResolver를 쓰면 무슨 일이 생기나?',
      o: ['100명이 한 버킷을 나눠 써서 함께 막힌다', '사람마다 버킷이 자동으로 갈린다', 'Gateway가 NAT를 감지해 제한을 끈다'], a: 0,
      why: '버킷 키가 IP 하나뿐이라 100명이 같은 토큰을 쓴다. 로그인 사용자는 X-User-Id로 나누는 편이 공정하다.' },
    { q: '완성형 설정에서 Retry에 methods: GET을 두는 까닭은 무엇인가?',
      o: ['GET이 가장 느려서', 'Retry 필터는 GET만 지원해서', 'POST를 재시도하면 같은 주문이 두 번 생길 수 있어서'], a: 2,
      why: '재시도는 여러 번 보내도 결과가 같은 요청에만 건다. 주문 생성 같은 POST는 중복 처리 위험이 있다.' },
  ];

  const summary = [
    'JWT를 서비스 8곳에서 검증하면 키를 바꿀 때마다 8번 배포해야 한다.',
    'Gateway가 검증하고 X-User-Id를 넣으면 백엔드는 헤더만 믿으므로 내부망에 숨겨야 한다.',
    'RequestRateLimiter는 Redis 토큰 버킷이라 Gateway가 여러 대여도 한 사용자는 버킷 하나를 쓴다.',
    '10/20/1이면 평소 초당 10건, 쉬고 난 뒤엔 20건까지 한꺼번에 받고 넘치면 429를 준다.',
  ];
  const review = [
    { q: 'userKeyResolver로 제한을 걸었는데 모든 요청이 anonymous 버킷 하나로 몰린다. 먼저 확인할 것은?',
      o: ['Redis 메모리가 모자란지', 'JWT 필터가 rate limit보다 먼저 돌아 X-User-Id를 넣는지', 'burstCapacity가 0 인지'], a: 1,
      why: 'userKeyResolver는 JWT 필터가 넣은 X-User-Id를 읽는다. 순서가 뒤집히면 헤더가 없어 모두 anonymous가 된다.' },
    { q: 'Gateway를 여러 대로 늘렸는데 Redis 없이 각자 메모리로 센다면 사용자 한 명의 실제 한도는?',
      o: ['그대로 초당 10건', 'Gateway 대수만큼 나뉘어 줄어든다', 'Gateway 대수만큼 배로 느슨해진다'], a: 2,
      why: '인스턴스마다 따로 세면 요청이 나뉘어 들어갈 때 각자 10건씩 통과시킨다. 공유 카운터가 있어야 한도가 하나로 유지된다.' },
    { q: '외부 파트너마다 다른 호출 한도를 주고 싶다. 알맞은 조합은?',
      o: ['apiKeyResolver로 X-API-Key마다 버킷을 나눈다', 'ipKeyResolver로 파트너 IP를 묶는다', 'JWT 필터에서 파트너 요청을 모두 401로 막는다'], a: 0,
      why: 'API 키 단위로 버킷을 나누면 한 파트너가 몰려도 다른 파트너의 한도를 먹지 않는다.' },
  ];

  R.page({ title: '보안 + 보호 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
