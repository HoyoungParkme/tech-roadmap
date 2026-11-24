/* V-1-2 Ktor — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 겹겹이 싼 서버, 잘리는 URL, 객체 ⇄ JSON 변환기, 요청이 지나는 관문, 스레드 레인을 그린다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, zone, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const ap = (k, i, u, s = 0.2, d = 0.6) => (k > i ? 1 : k === i ? R.spring(seg(u, s, s + d)) : 0);
  const gr = (k, i, u, s = 0.2, d = 0.9) => (k > i ? 1 : k === i ? E(u, s, s + d) : 0);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 둥근 틀이 그려지며 나타남 (f 0→1)
  function frame(x, y, w, h, f, col, o) { o = o || {}; if (f <= 0) return; const P = 2 * (w + h);
    el('rect', { x, y, width: w, height: h, rx: 14, fill: o.fill || 'none', 'fill-opacity': clamp(f), stroke: col, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': f < 1 ? `${P * f} ${P}` : o.dash });
    if (o.title) mono(x + 14, y + 22, o.title, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: fade(f, 0.6, 0.4) }); }
  // 상태코드 응답 알약
  const resp = (x, y, code, body, col, s) => pill(x, y, `${code}  ${body}`, col, s, { fs: 13.5, mono: true, fill: PANEL });

  // ---------- 1. 엔진 → 모듈 → routing → suspend 핸들러 ----------
  const CL = [70, 230];
  function s1(t, c) { const { k, u } = c;
    person(CL[0], CL[1] - 10, '클라이언트', {});
    frame(150, 30, 790, 370, gr(k, 0, u, 0.1, 1.0), INK, { title: 'embeddedServer(Netty, port = 8080)' });
    // 포트
    const ps = ap(k, 0, u, 0.9); card(150, CL[1], 70, 34, { rx: 17, text: ':8080', fs: 14, mono: true, fw: 800, fill: INK, stroke: 'none', color: PANEL, s: ps });
    if (k === 0) { [0, 1, 2].forEach((i) => { const p = ((t * 0.9 + i / 3) % 1); el('circle', { cx: 150, cy: CL[1], r: 20 + p * 46, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: (1 - p) * fade(u, 1.2) }); });
      note(380, 220, 'start(wait = true)', fade(u, 1.4), { class: 'mono', 'font-size': 16, 'font-weight': 800 });
      note(380, 248, '메인 스레드를 붙잡고 서버를 살려 둔다', fade(u, 1.7), { fill: MUT }); return; }
    frame(200, 66, 720, 318, gr(k, 1, u, 0.1, 0.7), INFO, { title: 'Application.module()' });
    frame(240, 104, 660, 266, gr(k, 1, u, 0.6, 0.7), ACC, { title: 'routing { }', fill: ACCBG });
    const entry = [[CL[0] + 30, CL[1]], [185, CL[1]], [300, 180]];
    if (k === 1) { dot(entry, seg(u, 1.2, 1.9), INFO, 8); pill(90, 150, 'GET /', INFO, pop(u, 1.0), { mono: true, fs: 13.5 });
      if (u > 1.9) { note(380, 190, '등록된 경로가 없다', fade(u, 1.9), { fill: BAD }); fly(300, 180, CL[0] + 10, CL[1] + 90, seg(u, 2.0, 2.6), '404', { fill: BAD, mono: true, stay: true }); } return; }
    // 라우트와 핸들러
    const rs = ap(k, 2, u, 0.2);
    card(390, 180, 160, 44, { rx: 8, text: 'get("/")', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, s: rs });
    card(700, 180, 300, 64, { rx: 10, stroke: INK, s: ap(k, 2, u, 0.5) });
    if (k >= 2) { mono(566, 172, 'suspend 블록', { 'font-size': 14, fill: MUT, opacity: k === 2 ? fade(u, 0.7) : 1 });
      mono(566, 196, 'call.respondText(…)', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.7) : 1 });
      grow(470, 180, 548, 180, gr(k, 2, u, 0.8, 0.4), ACC); }
    // 스레드 레인: 코루틴은 기다리는 동안 스레드를 놓는다 (예시)
    if (k === 2) { const L = { x: 290, w: 580 }, slots = [['A', 0, 0.0, 0.18], ['B', 0, 0.2, 0.36], ['C', 1, 0.0, 0.25], ['A', 1, 0.3, 0.48], ['D', 0, 0.4, 0.6], ['B', 1, 0.52, 0.7], ['C', 0, 0.64, 0.82], ['D', 1, 0.75, 0.95]];
      const shown = E(u, 0.9, 2.5);
      ['스레드 1', '스레드 2'].forEach((n, i) => { const y = 262 + i * 40; tx(L.x - 4, y + 5, n, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.8) });
        el('rect', { x: L.x + 6, y: y - 13, width: L.w, height: 26, rx: 5, fill: PANEL, stroke: GRID, opacity: fade(u, 0.8) }); });
      slots.forEach(([n, lane, a, b]) => { if (shown <= a) return; const w = (Math.min(b, shown) - a) * L.w, x = L.x + 6 + a * L.w, y = 262 + lane * 40;
        el('rect', { x, y: y - 11, width: w, height: 22, rx: 4, fill: n === 'A' ? ACC : n === 'B' ? INFO : n === 'C' ? WARN : GOOD, opacity: 0.85 });
        if (w > 24) tx(x + 10, y + 5, n, { 'font-size': 13.5, 'font-weight': 800, fill: PANEL }); });
      note(290, 348, '요청 4개를 스레드 2개가 번갈아 처리 (예시 · 빈칸 = 기다리는 동안 스레드를 놓음)', fade(u, 2.2), { 'font-size': 13.5, fill: MUT });
      dot(entry.concat([[390, 180]]), seg(u, 0.4, 0.9), ACC, 8); return; }
    // k3: 응답
    dot(entry.concat([[390, 180], [548, 180]]), seg(u, 0.2, 0.9), ACC, 8);
    fly(600, 330, CL[0] + 60, CL[1] + 80, seg(u, 1.0, 2.0), '200  Hello, Ktor!', { fill: GOOD, mono: true, stay: true });
    note(300, 300, '엔진 → 모듈 → 라우팅 → 핸들러', fade(u, 2.0), { 'font-size': 17, 'font-weight': 800 }); }

  // ---------- 2. URL 을 자르고, 객체 ⇄ JSON ----------
  const OB = { x: 170, y: 330 }, CV = { x: 480, y: 330 }, JS = { x: 790, y: 330 };
  function s2(t, c) { const { k, u } = c;
    // 아래 줄: 객체 · 변환기 · JSON
    const us = ap(k, 0, u, 0.2);
    card(OB.x, OB.y, 240, 92, { rx: 10, stroke: INK, s: us });
    if (us > 0) { mono(OB.x - 108, OB.y - 16, 'data class User(', { 'font-size': 14.5, 'font-weight': 800, opacity: clamp(us) });
      mono(OB.x - 96, OB.y + 6, 'val id: Int,', { 'font-size': 14, opacity: clamp(us) }); mono(OB.x - 96, OB.y + 26, 'val name: String)', { 'font-size': 14, opacity: clamp(us) }); }
    const st = gr(k, 0, u, 0.9, 0.6); if (st > 0) { const y = lerp(220, OB.y - 60, st); card(OB.x, y, 140, 30, { rx: 6, text: '@Serializable', fs: 14, mono: true, fw: 800, fill: ACC, stroke: 'none', color: PANEL }); }
    if (k === 0) { note(330, 240, '이 표시가 없으면 컴파일은 되지만', fade(u, 1.7), { fill: MUT }); note(330, 266, '실행 중 직렬화에서 터진다', fade(u, 1.9), { fill: BAD }); return; }
    const cs = ap(k, 1, u, 0.2);
    card(CV.x, CV.y, 210, 76, { rx: 12, stroke: INFO, fill: INFOBG, sw: 2.5, s: cs });
    if (cs > 0) { tx(CV.x, CV.y - 6, 'ContentNegotiation', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: clamp(cs) });
      mono(CV.x, CV.y + 18, 'json()  ⇄', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: clamp(cs) }); }
    card(JS.x, JS.y, 260, 60, { rx: 8, fill: SOFT, stroke: GRID, s: ap(k, 1, u, 0.5) });
    const idv = k === 4 ? 7 : 42, json = `{"id":${idv},"name":"Hoyoung"}`;
    if (k >= 1) mono(JS.x, JS.y + 5, json, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: k === 4 ? INFO : GOOD, opacity: k === 1 ? fade(u, 0.7) : 1 });
    if (k === 1) { dot([[OB.x + 120, OB.y - 8], [CV.x - 105, OB.y - 8], [CV.x + 105, OB.y - 8], [JS.x - 130, OB.y - 8]], seg(u, 1.0, 1.8), ACC, 7);
      dot([[JS.x - 130, OB.y + 10], [CV.x + 105, OB.y + 10], [CV.x - 105, OB.y + 10], [OB.x + 120, OB.y + 10]], seg(u, 1.8, 2.6), INFO, 7);
      note(330, 240, 'respond는 객체 → JSON, receive는 JSON → 객체', fade(u, 1.2), { fill: MUT }); return; }
    // 위 줄: 요청
    if (k <= 3) { const parts = [['GET', INK], [' /users', INK], ['/42', ACC], ['?verbose=true', INFO]]; let x = 170;
      parts.forEach(([p, col], i) => { const w = tw(p, 17) + 10, lift = (i === 2 && k >= 2) ? gr(k, 2, u, 0.6, 0.6) : (i === 3 && k >= 3) ? gr(k, 3, u, 0.3, 0.6) : 0;
        mono(x, 70 + lift * 0, p, { 'font-size': 17, 'font-weight': 800, fill: col });
        if (lift > 0) { el('rect', { x: x - 4, y: 50, width: w - 4, height: 28, rx: 5, fill: 'none', stroke: col, 'stroke-width': 2, opacity: lift }); }
        x += w; });
      // 경로 틀
      mono(266, 104, '/users/{id}', { 'font-size': 15, fill: MUT, opacity: gr(k, 2, u, 0.2, 0.4) });
      if (k >= 2) { const f = gr(k, 2, u, 0.9, 0.7); grow(330, 82, 330, 150, f, ACC);
        mono(250, 176, 'parameters["id"] = "42"', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(f, 0.7, 0.3) });
        mono(250, 202, '.toInt() → 42', { 'font-size': 15, fill: ACC, opacity: k === 2 ? fade(u, 1.8) : 1 }); }
      if (k >= 3) { const f = gr(k, 3, u, 0.5, 0.6); grow(470, 82, 600, 150, f, INFO);
        mono(560, 176, 'queryParameters["verbose"]', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(f, 0.7, 0.3) });
        mono(560, 202, '= "true"  (없으면 null)', { 'font-size': 15, fill: INFO, opacity: fade(f, 0.7, 0.3) }); }
      if (k === 2) note(560, 120, 'id는 문자열로 들어온다', fade(u, 2.0), { fill: MUT });
      if (k === 3) { mono(OB.x - 100, OB.y + 64, 'User(42, "Hoyoung")', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
        dot([[OB.x + 120, OB.y], [CV.x - 105, OB.y], [CV.x + 105, OB.y], [JS.x - 130, OB.y]], seg(u, 1.3, 2.0), ACC, 7);
        resp(JS.x, 250, 200, 'application/json', GOOD, pop(u, 2.1)); } return; }
    // k4: POST — 본문 JSON 이 객체가 된다
    mono(170, 70, 'POST /users', { 'font-size': 17, 'font-weight': 800 });
    mono(330, 70, `body ${json}`, { 'font-size': 15, fill: INFO, opacity: fade(u, 0.2) });
    dot([[640, 80], [JS.x, JS.y - 30]], seg(u, 0.3, 0.8), INFO, 7);
    dot([[JS.x - 130, OB.y], [CV.x + 105, OB.y], [CV.x - 105, OB.y], [OB.x + 120, OB.y]], seg(u, 0.9, 1.6), INFO, 7);
    mono(OB.x - 100, OB.y + 64, 'receive<User>() → User(7, "Hoyoung")', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) });
    resp(JS.x, 250, 201, 'Created', GOOD, pop(u, 2.1));
    note(560, 150, 'respond(HttpStatusCode.Created, body)', fade(u, 1.9), { class: 'mono', 'font-size': 14.5 }); }

  // ---------- 3. 관문을 차례로 지난다 ----------
  const Y = 212, G3 = [{ n: 'CORS', x: 200 }, { n: 'CallLogging', x: 320 }];
  const RX = 470, AX = 650, HX = 840;
  function gate(x, name, col, s, sub2) { if (s <= 0) return; el('rect', { x: x - 9, y: Y - 56, width: 18, height: 112, rx: 6, fill: col === BAD ? BADBG : PANEL, stroke: col, 'stroke-width': 2.4, opacity: clamp(s) });
    tx(x, Y - 66, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: clamp(s) });
    if (sub2) tx(x, Y + 76, sub2, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: clamp(s) }); }
  function s3(t, c) { const { k, u } = c;
    el('line', { x1: 90, y1: Y, x2: HX - 60, y2: Y, stroke: GRID, 'stroke-width': 3 });
    person(60, Y - 8, null, {});
    G3.forEach((g, i) => gate(g.x, g.n, INK, ap(k, 0, u, 0.2 + i * 0.3), k === 2 ? null : i === 0 ? 'Origin 허용' : '요청 기록'));
    card(RX, Y, 96, 44, { rx: 22, text: 'routing', fs: 14.5, mono: true, fw: 800, stroke: ACC, color: ACC });
    card(HX, Y, 150, 54, { rx: 9, text: 'get("/admin/stats")', fs: 13.5, mono: true, stroke: k === 3 ? OFF : INK, color: k === 3 ? OFF : INK });
    if (k === 0) { dot([[90, Y], [RX - 48, Y]], seg(u, 0.9, 1.8), INFO, 8);
      R.terminal(150, 300, 420, 92, ['INFO  GET /admin/stats', ['… 모든 요청이 한 줄씩 남는다', 'var(--off)']], E(u, 1.8, 2.4) * 2, { title: 'CallLogging' });
      note(560, 120, '라우팅보다 먼저, 모든 요청에', fade(u, 1.6), { fill: MUT }); return; }
    // 인증 스킴 등록 (이름표)
    const ks = ap(k, 1, u, 0.2);
    card(660, 66, 300, 52, { rx: 10, stroke: INFO, fill: INFOBG, s: ks });
    if (ks > 0) { mono(522, 60, 'install(Authentication)', { 'font-size': 13.5, fill: MUT, opacity: clamp(ks) }); mono(522, 82, 'bearer("auth-bearer")', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: clamp(ks) }); }
    if (k === 1) { note(240, 330, '스킴에 이름을 붙여 둔다.', fade(u, 1.0)); note(240, 356, '경로는 이 이름으로 골라 쓴다.', fade(u, 1.3), { fill: MUT }); return; }
    if (k === 2) { // 토큰 검사 람다 — 두 요청
      mono(250, 296, 'token == "secret" ?', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      [['Bearer secret', 'UserIdPrincipal("admin")', GOOD, 0], ['(토큰 없음)', 'null → 401', BAD, 1]].forEach(([tk, out, col, i]) => { const y = 336 + i * 40, a = 0.6 + i * 0.8;
        card(180, y, 170, 32, { rx: 6, text: tk, fs: 14, mono: true, stroke: INK, s: pop(u, a) });
        grow(270, y, 420, y, E(u, a + 0.3, a + 0.8), col);
        mono(430, y + 5, out, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, a + 0.8) }); });
      return; }
    // k3: 이 경로만 보호 — 토큰 없는 요청이 끊긴다
    frame(AX - 70, Y - 100, HX - AX + 160, 200, 1, INFO, { title: 'authenticate("auth-bearer")', dash: '7 5' });
    gate(AX, '', BAD, 1, '토큰 확인');
    pill(110, Y - 70, '토큰 없음', MUT, pop(u, 0.1), { fs: 13.5 });
    dot([[90, Y], [RX, Y], [AX - 12, Y]], seg(u, 0.2, 1.3), INFO, 8);
    if (u > 1.3) { cross(AX, Y, 14, pop(u, 1.3)); fly(AX - 30, Y + 20, 200, Y + 140, seg(u, 1.6, 2.4), '401 Unauthorized', { fill: BAD, mono: true, stay: true });
      tx(HX, Y + 52, '도달 못 함', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) }); } }

  // ---------- 4. StatusPages 바깥 틀 · 블로킹 레인 ----------
  const PH = [['Setup', 150], ['Monitoring', 330], ['Plugins', 510], ['Call · routing', 720]];
  function phases(op) { PH.forEach(([n, x], i) => { el('rect', { x: x - 78, y: 120, width: i === 3 ? 230 : 156, height: 200, rx: 8, fill: SOFT, opacity: op });
    tx(x + (i === 3 ? 37 : 0), 146, n, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: op }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k >= 3) return lanes(t, c);
    phases(1);
    card(760, 250, 160, 46, { rx: 8, text: 'post("/report")', fs: 14, mono: true, stroke: INK });
    frame(40, 60, 880, 300, gr(k, 0, u, 0.2, 1.2), WARN, { title: 'StatusPages — CallFailed 훅 (Setup 단계 앞)' });
    if (k === 0) { note(80, 392, '가장 바깥 틀 · install을 어디에 적어도 같은 자리', fade(u, 1.6), { fill: WARN }); return; }
    if (k === 1) { const sp = [760, 226]; if (u > 0.3) { el('circle', { cx: sp[0], cy: sp[1], r: 10 + 4 * Math.sin(t * 9), fill: BAD, opacity: fade(u, 0.3) }); tx(sp[0] + 18, sp[1] - 10, 'Exception', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) }); }
      dot([sp, [760, 62]], seg(u, 0.8, 1.5), BAD, 8);
      fly(760, 62, 300, 392, seg(u, 1.6, 2.5), '503 {"error":"집계 실패 — 잠시 후 재시도"}', { fill: WARN, mono: true, stay: true });
      return; }
    // k2: 인증도 안쪽 — 설치 순서를 바꿔도 같다
    card(596, 250, 150, 46, { rx: 8, text: 'Authentication', fs: 14, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 0.2) });
    [['install(StatusPages)', 'install(Authentication)'], ['install(Authentication)', 'install(StatusPages)']].forEach((pair, i) => { const x = 90 + i * 250, op = fade(u, 0.8 + i * 0.4);
      el('rect', { x: x - 10, y: 168, width: 230, height: 62, rx: 6, fill: PANEL, stroke: GRID, opacity: op });
      pair.forEach((s, j) => mono(x, 192 + j * 24, s, { 'font-size': 13.5, fill: s.includes('Status') ? WARN : INFO, 'font-weight': 700, opacity: op })); });
    note(90, 272, '두 순서 모두 잡는 범위가 같다', fade(u, 1.8), { fill: WARN });
    dot([[596, 226], [596, 62]], seg(u, 1.6, 2.3), BAD, 8); }
  // k3·k4: 이벤트 루프 레인과 IO 풀
  function lanes(t, c) { const { k, u } = c, X0 = 220, W = 640;
    const lane = (y, name, col) => { tx(X0 - 12, y + 5, name, { 'font-size': 14, 'font-weight': 700, fill: col || MUT, 'text-anchor': 'end' }); el('rect', { x: X0, y: y - 16, width: W, height: 32, rx: 6, fill: PANEL, stroke: GRID }); };
    lbl(480, 42, k === 3 ? 'suspend 핸들러 안에서 heavyJdbcQuery() 직접 호출' : 'withContext(Dispatchers.IO) { heavyJdbcQuery() }', 1, { class: 'mono', 'font-size': 15, fill: k === 3 ? BAD : GOOD });
    lane(100, '이벤트 루프 1'); lane(150, '이벤트 루프 2');
    if (k === 3) { const f = E(u, 0.3, 2.2);
      el('rect', { x: X0 + 2, y: 86, width: (W - 4) * f, height: 28, rx: 5, fill: BAD, opacity: 0.85 }); if (f > 0.25) tx(X0 + 14, 105, 'JDBC 대기 — 스레드가 묶임', { 'font-size': 14, 'font-weight': 700, fill: PANEL });
      [0, 1, 2, 3].forEach((i) => { const x = X0 + 4 + i * 150, a = 0.4 + i * 0.4; el('rect', { x, y: 136, width: 120, height: 28, rx: 5, fill: INFO, opacity: 0.8 * fade(u, a) }); });
      const q = Math.round(lerp(0, 6, E(u, 0.6, 2.4))); for (let i = 0; i < q; i++) card(260 + i * 92, 250, 80, 34, { rx: 6, text: 'GET', fs: 13.5, mono: true, stroke: WARN, color: WARN, fill: WARNBG });
      note(220, 218, '줄 선 요청 — 가벼운 API도 함께 기다린다', fade(u, 1.0), { fill: WARN });
      note(220, 330, '스레드 수는 그림용 예시다', fade(u, 2.0), { fill: MUT, 'font-size': 13.5 }); return; }
    // k4: 무거운 일은 IO 풀로
    lane(260, 'IO 1', INFO); lane(310, 'IO 2', INFO);
    const mv = E(u, 0.2, 1.1);
    el('rect', { x: X0 + 2, y: lerp(86, 246, mv), width: W - 4, height: 28, rx: 5, fill: BAD, opacity: 0.85 }); tx(X0 + 14, lerp(105, 265, mv), 'JDBC 대기 (IO 스레드)', { 'font-size': 14, 'font-weight': 700, fill: PANEL });
    [0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => { const a = 1.0 + i * 0.18, x = X0 + 4 + (i % 4) * 158, y = i < 4 ? 86 : 136; el('rect', { x, y, width: 120, height: 28, rx: 5, fill: INFO, opacity: 0.8 * fade(u, a) }); });
    note(220, 220, '이벤트 루프는 비어 다음 요청을 받는다', fade(u, 1.6), { fill: GOOD });
    note(220, 370, 'Dispatchers.IO 기본 상한: 64개와 코어 수 중 큰 값', fade(u, 2.0), { fill: MUT, 'font-size': 14 }); }

  // ---------- 5. 표준 세트 · 기능별 라우트 · 얇은 핸들러 ----------
  const STD = ['ContentNegotiation', 'CallLogging', 'StatusPages', 'Authentication'];
  function s5(t, c) { const { k, u } = c;
    // 레일과 플러그인 4개
    el('line', { x1: 40, y1: 60, x2: 920, y2: 60, stroke: GRID, 'stroke-width': 3 });
    STD.forEach((n, i) => { const f = gr(k, 0, u, 0.2 + i * 0.3, 0.5), x = 140 + i * 225, y = lerp(-10, 60, f); if (f <= 0) return;
      card(x, y, 200, 40, { rx: 8, text: n, fs: 14.5, fw: 800, stroke: ACC, color: ACC, fill: PANEL, op: f }); });
    if (k === 0) { note(300, 200, '필요한 것만 install 한다', fade(u, 1.6), { 'font-size': 17, 'font-weight': 800 }); note(300, 230, '안 쓰는 플러그인은 넣지 않는다', fade(u, 1.9), { fill: MUT }); return; }
    // routing 에 확장 함수만 나열
    frame(40, 100, 300, 160, 1, ACC, { title: 'routing { }', fill: ACCBG });
    [['userRoutes(userService)', 0], ['reportRoutes(reportService)', 1]].forEach(([n, i]) => { const s = ap(k, 1, u, 0.2 + i * 0.3);
      card(190, 160 + i * 52, 270, 40, { rx: 8, text: n, fs: 14, mono: true, stroke: INK, s }); });
    if (k === 1) { [0, 1].forEach((i) => { const f = E(u, 1.0 + i * 0.3, 1.8 + i * 0.3); grow(326, 160 + i * 52, 470, 150 + i * 90, f, MUT);
        card(560, 150 + i * 90, 170, 48, { rx: 6, text: i ? 'Report 라우트 파일' : 'User 라우트 파일', fs: 14, s: pop(u, 1.6 + i * 0.3) }); });
      note(470, 360, '경로 정의가 한 파일에 뭉치지 않는다', fade(u, 2.2), { fill: MUT }); return; }
    // 얇은 핸들러와 Service
    frame(400, 100, 520, 140, 1, INK, { title: 'fun Route.userRoutes(service)' });
    [['① 파싱', 'call.parameters["id"]!!.toInt()'], ['② 응답', 'call.respond(…)']].forEach(([a, b], i) => { const op = k === 2 ? fade(u, 0.3 + i * 0.4) : 1;
      tx(420, 160 + i * 40, a, { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: op }); mono(500, 160 + i * 40, b, { 'font-size': 14, opacity: op }); });
    const sv = k === 2 ? gr(k, 2, u, 1.2, 0.6) : 1;
    card(660, 330, 300, 64, { rx: 10, stroke: INFO, fill: INFOBG, sw: 2.2, op: Math.max(0.25, sv) });
    tx(660, 326, 'UserService', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: Math.max(0.25, sv) });
    mono(660, 348, 'findById(id) — 로직은 여기', { 'text-anchor': 'middle', 'font-size': 13.5, opacity: Math.max(0.25, sv) });
    pill(400, 330, 'Koin 주입', INFO, ap(k, 2, u, 1.6), { fs: 13.5 });
    if (k === 2) return;
    // k3: 요청이 한 바퀴
    dot([[40, 300], [400, 160], [560, 160]], seg(u, 0.2, 0.8), ACC, 8);
    dot([[640, 168], [660, 298]], seg(u, 0.9, 1.3), ACC, 8);
    dot([[690, 298], [700, 205]], seg(u, 1.4, 1.8), INFO, 8);
    fly(560, 200, 120, 380, seg(u, 1.9, 2.6), '200  Service 결과', { fill: GOOD, stay: true }); }

  const quiz = [
    { q: 'Ktor 핸들러가 suspend 블록이라서 얻는 것은 무엇인가?',
      o: ['기다리는 동안 스레드를 놓아 적은 스레드로 많은 요청을 받는다', '라우트를 등록하지 않아도 404가 나지 않는다', '핸들러가 여러 서버로 자동 복제된다'], a: 0,
      why: '코루틴은 기다리는 동안 스레드를 붙잡지 않는다. 그래서 스레드 몇 개가 여러 요청을 번갈아 처리한다.' },
    { q: 'call.respond(User(42, "Hoyoung"))가 JSON으로 나가려면 무엇이 있어야 하는가?',
      o: ['User를 문자열로 바꾸는 toString', 'routing 블록 두 개', 'ContentNegotiation의 json()과 User의 @Serializable'], a: 2,
      why: '변환기(ContentNegotiation)와 직렬화 대상 표시(@Serializable)가 함께 있어야 {"id":42,"name":"Hoyoung"}이 나간다.' },
    { q: '토큰 없이 GET /admin/stats를 보내면 어떻게 되는가?',
      o: ['핸들러가 실행된 뒤 응답만 401로 바뀐다', 'authenticate 단계에서 401로 끊겨 핸들러에 닿지 않는다', 'CORS 단계에서 403으로 막힌다'], a: 1,
      why: '검증 람다가 null을 돌려주면 인증 플러그인이 401을 보낸다. 보호된 경로의 핸들러는 실행되지 않는다.' },
    { q: 'suspend 핸들러 안에서 heavyJdbcQuery()를 그대로 부르면 무엇이 문제인가?',
      o: ['JDBC 결과가 JSON으로 바뀌지 않는다', 'StatusPages가 꺼진다', '요청을 처리하던 스레드가 묶여 다른 요청까지 밀린다'], a: 2,
      why: '블로킹 호출은 스레드를 놓지 않는다. withContext(Dispatchers.IO)로 보내면 이벤트 루프 스레드가 다음 요청을 받는다.' },
    { q: '얇은 핸들러에 남겨 두는 일은 무엇인가?',
      o: ['DB 조회와 집계 계산', '요청 파싱과 응답', '플러그인 설치'], a: 1,
      why: '핸들러는 id를 파싱하고 결과를 respond만 한다. 로직은 Koin으로 주입한 UserService가 맡아 따로 테스트할 수 있다.' },
  ];

  const summary = [
    'Ktor 서버는 엔진, Application 모듈, routing, suspend 핸들러를 겹쳐 조립한다.',
    '@Serializable과 ContentNegotiation이 있어야 respond와 receive가 JSON을 다룬다.',
    '토큰 검사에 실패한 요청은 authenticate에서 401로 끝나 핸들러에 닿지 않는다.',
    '블로킹 호출은 Dispatchers.IO로 보내고 예외는 StatusPages 한곳에서 응답으로 바꾼다.',
  ];
  const review = [
    { q: '/report 요청이 몰리자 가벼운 다른 API까지 느려졌다. 먼저 의심할 것은?',
      o: ['핸들러가 JDBC를 Dispatchers.IO 없이 직접 부른다', 'CORS 설정에 anyHost()가 있다', 'User에 @Serializable이 붙어 있다'], a: 0,
      why: '블로킹 호출이 이벤트 루프 스레드를 잡으면 그 스레드를 쓰는 모든 요청이 줄을 선다. IO 디스패처로 옮기면 풀린다.' },
    { q: 'POST /users가 실패하고 로그에 User의 serializer를 찾지 못했다는 오류가 있다. 고칠 곳은?',
      o: ['routing에 post를 하나 더 등록한다', 'StatusPages를 맨 아래로 옮긴다', 'data class User에 @Serializable을 붙인다'], a: 2,
      why: '@Serializable이 없으면 컴파일은 되지만 receive<User>()가 실행 중 변환에 실패한다. 표시를 붙이면 JSON 본문이 User가 된다.' },
    { q: '토큰 없는 요청이 401을 받았는데 StatusPages의 exception 블록은 호출되지 않았다. 까닭은?',
      o: ['StatusPages를 Authentication보다 뒤에 설치해서', '인증 실패는 예외가 아니라 인증 플러그인이 보낸 401 응답이라서', 'CallLogging이 예외를 먼저 삼켜서'], a: 1,
      why: 'StatusPages는 설치 위치와 상관없이 파이프라인 바깥에서 예외를 받는다. 토큰이 없는 요청은 예외 없이 401 응답으로 끝난다.' },
  ];

  R.page({ title: 'Ktor 요청이 지나는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
