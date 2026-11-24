/* IV-2-2 HttpClient로 REST API 호출 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 출력·예외는 .NET 10 에서 로컬 HttpListener 서버로 실제 확인했다: User { Id = 1, Name = Ada, Email = ada@x.io },
 * 404 는 예외 없이 수신 → EnsureSuccessStatusCode 가 HttpRequestException(StatusCode=NotFound), HTML 을 JSON 으로 읽으면 JsonException,
 * PostAsJsonAsync 의 Content-Type "application/json; charset=utf-8" 와 본문 {"sku":"A-100","qty":3}, Order { Id = 42, Status = created },
 * HttpClient.Timeout 기본 100초, 시간 초과는 TaskCanceledException(Inner TimeoutException), 연결 거부는 HttpRequestException(StatusCode=null).
 * api.example.com 의 응답 값과 503 두 번은 설명용 예시다. Polly 대기 2·4·8초는 Math.Pow(2, n) 식에서 나온다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, spans, server, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // 봉투(HTTP 메시지): 첫 줄 + 머리글 줄들 + 본문
  function envelope(x, y, w, first, heads, body, o) { o = o || {}; const lh = 26, h = 44 + heads.length * lh + (body ? 44 : 0), s = o.s ?? 1;
    if (s <= 0) return h;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, opacity: s });
    mono(x + 16, y + 28, first, { 'font-size': 15.5, 'font-weight': 800, fill: o.stroke || INK, opacity: s });
    heads.forEach(([k, v, col, op], i) => { const yy = y + 56 + i * lh; spans(x + 16, yy, [[k + ': ', { fill: MUT }], [v, { fill: col || INK, 'font-weight': 700 }]], { 'font-size': 14, opacity: s * (op ?? 1) }); });
    if (body) { const yy = y + 44 + heads.length * lh; el('line', { x1: x + 10, y1: yy + 4, x2: x + w - 10, y2: yy + 4, stroke: GRID, opacity: s }); mono(x + 16, yy + 30, body, { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: s }); }
    return h; }
  function clientBox(x, y, o) { o = o || {}; card(x, y, 170, 70, { rx: 10, stroke: o.stroke || ACC, sw: 2.4, s: o.s, op: o.op }); if ((o.s ?? 1) > 0.5) { mono(x, y - 6, o.name || 'HttpClient', { 'font-size': 16, 'font-weight': 800, fill: o.stroke || ACC, 'text-anchor': 'middle', opacity: o.op ?? 1 }); if (o.sub) mono(x, y + 18, o.sub, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 }); } }

  // ---------- 1. 기본 GET ----------
  const CX = 130, SX = 830, LY = 150;
  function wire() { el('line', { x1: CX + 90, y1: LY, x2: SX - 70, y2: LY, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': '6 6' }); tx((CX + SX) / 2, LY + 26, '네트워크', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { card(300, 200, 360, 160, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 0.2) });
      if (u > 0.4) { mono(140, 152, 'record User', { 'font-size': 16, 'font-weight': 800, fill: ACC });
        [['Id', 'int'], ['Name', 'string'], ['Email', 'string']].forEach(([a, b], i) => { mono(150, 190 + i * 32, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.25) }); mono(450, 190 + i * 32, b, { 'font-size': 15, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.25) }); }); }
      note(540, 180, '응답 JSON 을 담을 그릇', fade(u, 1.5));
      note(540, 214, 'using System.Net.Http.Json', fade(u, 1.9), { class: 'mono', 'font-size': 14.5, fill: INFO });
      note(540, 242, '→ GetFromJsonAsync 같은 확장', fade(u, 2.1), { 'font-size': 14.5, fill: MUT });
      return; }
    clientBox(CX, LY, { sub: k === 1 ? null : 'BaseAddress ✓', s: k === 1 ? pop(u, 0.2) : 1 });
    server(SX, LY, 'api.example.com', { lamp: k >= 2 ? GOOD : OFF });
    if (k === 1) { pill(CX + 160, LY + 90, 'BaseAddress = https://api.example.com', ACC, pop(u, 0.8), { mono: true, fs: 14 });
      note(CX - 60, LY + 160, '이후 호출은 경로만: "/api/users/1"', fade(u, 1.6), { class: 'mono', 'font-size': 14.5 }); return; }
    wire();
    if (k === 2) { fly(CX + 90, LY - 30, SX - 70, LY - 30, seg(u, 0.2, 1.2), 'GET /api/users/1', { mono: true });
      fly(SX - 70, LY + 30, CX + 90, LY + 30, seg(u, 1.4, 2.3), '응답', { fill: INK });
      if (u > 2.3) pill(CX, LY + 90, 'HttpResponseMessage res', INK, pop(u, 2.3), { mono: true, fs: 14 });
      note(330, 360, '404 도 500 도 "받았다" — 여기서는 예외가 없다', fade(u, 2.4), { fill: WARN, 'font-size': 14.5 }); return; }
    // 상태 문
    const gx = 480;
    if (k === 3) { el('rect', { x: gx - 10, y: 220, width: 20, height: 140, rx: 4, fill: INFO, opacity: fade(u, 0.1) });
      mono(gx, 210, 'EnsureSuccessStatusCode()', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
      const m = E(u, 0.3, 1.2); pill(lerp(760, 300, m), 260, '200 OK', GOOD, 1, { mono: true, fs: 15 }); if (m >= 1) check(370, 260, 9, 1);
      const m2 = E(u, 1.4, 2.0); pill(lerp(760, gx + 70, m2), 330, '404', BAD, 1, { mono: true, fs: 15 });
      if (m2 >= 1) { cross(gx + 30, 330, 9, pop(u, 2.0)); mono(gx - 30, 400, 'HttpRequestException · StatusCode = NotFound', { 'font-size': 14.5, fill: BAD, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }
      return; }
    if (k === 4) { mono(240, 236, 'res.Content (본문)', { 'font-size': 14, fill: MUT });
      card(380, 270, 470, 46, { rx: 8, text: '{"id":1,"name":"Ada","email":"ada@x.io"}', mono: true, fs: 14.5, stroke: GRID, s: pop(u, 0.2) });
      grow(380, 296, 380, 330, E(u, 0.8, 1.2), ACC);
      mono(380, 324, 'ReadFromJsonAsync<User>()', { 'font-size': 14, fill: ACC, 'text-anchor': 'start', opacity: fade(u, 0.9), x: 392 });
      card(380, 370, 470, 46, { rx: 8, text: 'User { Id = 1, Name = Ada, Email = ada@x.io }', mono: true, fs: 14.5, fw: 800, stroke: ACC, color: ACC, s: pop(u, 1.4) });
      return; }
    // k=5 한 줄로
    const m = E(u, 0.3, 1.2);
    ['GetAsync', 'EnsureSuccess…', 'ReadFromJson…'].forEach((s2, i) => pill(lerp(200 + i * 210, 480, m), 260, s2, MUT, 1, { mono: true, fs: 14, op: 1 - m }));
    if (m > 0.6) pill(480, 260, 'GetFromJsonAsync<User>("/api/users/1")', ACC, pop(u, 1.0), { mono: true, fs: 15 });
    note(140, 340, '200 이 아니면', fade(u, 1.6), { 'font-size': 14.5 });
    mono(270, 340, 'HttpRequestException (StatusCode = NotFound)', { 'font-size': 14.5, fill: BAD, 'font-weight': 800, opacity: fade(u, 1.8) });
  }

  // ---------- 2. 수명: 소켓 고갈 vs 재사용 ----------
  const GX = 520, GY = 80, GC = 16, GR = 10, GS = 24;
  function ports(state) { // state(i) → null | 'use' | 'wait'
    for (let i = 0; i < GC * GR; i++) { const st = state(i), x = GX + (i % GC) * GS, y = GY + Math.floor(i / GC) * GS;
      el('rect', { x, y, width: GS - 4, height: GS - 4, rx: 3, fill: st === 'use' ? ACC : st === 'wait' ? WARN : PANEL, stroke: st ? 'none' : GRID, opacity: st === 'wait' ? 0.75 : 1 }); }
    tx(GX, GY - 14, '임시 포트 (한 칸 = 소켓 하나, 그림용)', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); }
  function s2(t, c) { const { k, u } = c, N = GC * GR;
    if (k <= 2) {
      const it = k === 0 ? E(u, 0.4, 2.2) * 3 : k === 1 ? 3 + E(u, 0.2, 2.4) * 60 : 63 + E(u, 0.1, 1.6) * 97;
      mono(60, 80, `요청 ${Math.round(k === 2 ? lerp(630, 10000, E(u, 0.1, 1.6)) : it * 10).toLocaleString('en-US')} / 10,000`, { 'font-size': 20, 'font-weight': 800 });
      note(60, 112, 'for (i < 10_000)', 1, { class: 'mono', fill: MUT });
      // 왼쪽: 매 회차 새 HttpClient
      for (let j = 0; j < 3; j++) { const show = k >= 1 || j < it; clientBox(160 + j * 30, 200 + j * 26, { name: j === 2 ? 'new HttpClient' : ' ', stroke: k >= 1 ? BAD : INK, op: show ? 0.4 + 0.2 * j : 0, s: show ? 1 : 0 }); }
      const used = Math.min(N, Math.floor(it));
      ports((i) => (i < used ? (k === 2 || (k === 1 && i < used - 4) ? 'wait' : 'use') : null));
      if (k === 0) { note(60, 330, '매 회차 using var bad = new HttpClient()', fade(u, 1.0), { class: 'mono', 'font-size': 14.5 }); return; }
      if (k === 1) { note(60, 330, '회차마다 새 연결 = 새 소켓', fade(u, 0.5), { fill: BAD });
        note(60, 362, 'Dispose 뒤에도 소켓은 TIME_WAIT 로 남는다', fade(u, 1.5), { fill: WARN, 'font-size': 14.5 }); return; }
      clock(440, 100, 22, E(u, 0.2, 2.4), WARN, 'TIME_WAIT');
      note(60, 330, 'TIME_WAIT: OS 에 따라 수십 초~수 분', 1, { 'font-size': 14.5, fill: WARN });
      if (u > 1.8) card(260, 390, 400, 40, { rx: 8, fill: BADBG, stroke: BAD, text: 'SocketException · 포트 고갈', fs: 15, fw: 800, color: BAD, s: pop(u, 1.8) });
      return; }
    // k=3, 4: 하나를 공유
    clientBox(170, 200, { name: 'shared', sub: 'Timeout 10초', s: k === 3 ? pop(u, 0.2) : 1 });
    ports((i) => (i < 2 ? 'use' : null));
    for (let j = 0; j < 2; j++) { const x = GX + j * GS + 10, y = GY + 10; grow(258, 200, x - 6, y + 10, k === 3 ? E(u, 0.6, 1.2) : 1, ACC, { plain: true }); }
    if (k === 3) { note(60, 330, '인스턴스 하나 · 스레드 안전', fade(u, 1.0)); note(60, 362, '클래스라면 static readonly 필드에 둔다', fade(u, 1.5), { fill: MUT, 'font-size': 14.5 }); return; }
    for (let i = 0; i < 8; i++) dot([[258, 200], [GX + 10, GY + 20]], ((t * 0.9 + i / 8) % 1), ACC, 5);
    mono(60, 80, `요청 ${Math.round(E(u, 0.2, 2.3) * 10000).toLocaleString('en-US')} / 10,000`, { 'font-size': 20, 'font-weight': 800 });
    note(60, 330, '같은 연결을 계속 다시 쓴다', fade(u, 0.6), { fill: GOOD });
    note(60, 362, '포트가 마르지 않는다', fade(u, 1.4), { fill: GOOD });
  }

  // ---------- 3. IHttpClientFactory ----------
  function handler(x, y, name, state, s, op) { const col = state === 'expiring' ? WARN : ACC;
    card(x, y, 170, 58, { rx: 10, stroke: col, sw: 2.2, s, op, dash: state === 'expiring' ? '6 4' : null });
    if (s > 0.5) { mono(x, y - 4, name, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op ?? 1 }); tx(x, y + 18, state === 'expiring' ? '만료 · 정리 대기' : '연결 풀', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op ?? 1 }); } }
  function s3(t, c) { const { k, u } = c;
    zone(40, 40, 420, 360, 'builder.Services (DI 컨테이너)', { fill: SOFT });
    if (k === 0) { card(250, 150, 300, 56, { rx: 10, text: 'WebApplicationBuilder', mono: true, fs: 15, fw: 800, s: pop(u, 0.2) });
      note(70, 260, '여기에 HttpClient 를 "등록" 한다', fade(u, 1.0)); note(70, 292, '아직 등록된 것이 없다', fade(u, 1.5), { fill: MUT }); return; }
    const reg = k === 1 ? pop(u, 0.2) : 1;
    card(250, 150, 360, 150, { rx: 10, stroke: ACC, sw: 2.2, s: reg });
    if (reg > 0.5) { mono(86, 102, 'AddHttpClient<GitHubService>', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      [['BaseAddress', 'api.github.com'], ['User-Agent', 'MyApp'], ['Timeout', '10초']].forEach(([a, b], i) => { mono(96, 136 + i * 28, a, { 'font-size': 14, fill: MUT, opacity: k === 1 ? fade(u, 0.6 + i * 0.3) : 1 }); mono(410, 136 + i * 28, b, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: k === 1 ? fade(u, 0.6 + i * 0.3) : 1 }); }); }
    zone(500, 40, 420, 200, 'IHttpClientFactory', { fill: SOFT, stroke: INFO, dash: '6 5' });
    const rot = k === 4 ? E(u, 0.8, 1.8) : 0;
    handler(620, 140, 'Handler #1', rot > 0.5 ? 'expiring' : 'active', k === 1 ? pop(u, 1.4) : 1, 1 - 0.5 * rot);
    if (k === 4) { handler(810, 140, 'Handler #2', 'active', pop(u, 1.6));
      const tl = 520, tw2 = 380; el('line', { x1: tl, y1: 220, x2: tl + tw2, y2: 220, stroke: GRID, 'stroke-width': 3 });
      el('line', { x1: tl, y1: 220, x2: tl + tw2 * E(u, 0.1, 0.8), y2: 220, stroke: WARN, 'stroke-width': 3 });
      mono(tl + tw2, 210, '2분', { 'font-size': 14, fill: WARN, 'text-anchor': 'end', 'font-weight': 800 }); }
    if (k >= 2) { card(250, 330, 360, 70, { rx: 10, stroke: INK, sw: 2, s: k === 2 ? pop(u, 0.2) : 1 });
      mono(86, 322, 'GitHubService(HttpClient http)', { 'font-size': 15, 'font-weight': 800, opacity: k === 2 ? fade(u, 0.3) : 1 });
      mono(86, 350, '_http = http;', { 'font-size': 14.5, fill: MUT, opacity: k === 2 ? fade(u, 0.5) : 1 });
      grow(540, 170, 440, 316, k === 2 ? E(u, 0.8, 1.4) : 1, ACC);
      if (k === 2) { note(540, 300, '생성자로 주입받는다', fade(u, 1.4)); note(540, 334, 'new HttpClient() 는 쓰지 않는다', fade(u, 1.8), { fill: BAD }); } }
    if (k === 3) { server(800, 330, 'api.github.com', { lamp: GOOD });
      dot([[440, 330], [540, 170], [620, 170], [700, 300]], seg(u, 0.3, 1.8), ACC, 7);
      pill(560, 280, 'GET /repos/{owner}/{name}', ACC, pop(u, 0.2), { mono: true, fs: 13.5 }); }
    if (k === 4) { note(520, 300, '수명이 지난 핸들러는 진행 중 요청을 마치고 정리', fade(u, 1.9), { 'font-size': 14.5 });
      note(520, 332, '새 핸들러의 새 연결은 DNS 를 다시 조회', fade(u, 2.2), { 'font-size': 14.5, fill: ACC });
      note(520, 372, '소켓은 재사용 · DNS 변경도 따라간다', fade(u, 2.5), { 'font-size': 14.5, fill: GOOD }); }
    if (k === 1) note(520, 300, '등록할 때 설정을 몰아 둔다', fade(u, 1.8));
  }

  // ---------- 4. 헤더 · 인증 · POST ----------
  const AUTH = ['Authorization', 'Bearer eyJhbGci…', ACC];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [['record OrderReq', [['Sku', 'string'], ['Qty', 'int']], '보낼 것'], ['record Order', [['Id', 'int'], ['Status', 'string']], '받을 것']].forEach(([n, f, role], i) => { const x = 250 + i * 420, s = pop(u, 0.3 + i * 0.6);
        card(x, 200, 320, 140, { rx: 12, stroke: i ? INFO : ACC, sw: 2.2, s });
        if (s > 0.5) { mono(x - 140, 158, n, { 'font-size': 16, 'font-weight': 800, fill: i ? INFO : ACC }); f.forEach(([a, b], j) => { mono(x - 130, 196 + j * 32, a, { 'font-size': 15, 'font-weight': 700 }); mono(x + 140, 196 + j * 32, b, { 'font-size': 15, fill: MUT, 'text-anchor': 'end' }); });
          tx(x, 304, role, { 'font-size': 15, 'text-anchor': 'middle', fill: MUT }); } });
      return; }
    if (k === 1) { card(180, 110, 280, 60, { rx: 10, stroke: ACC, sw: 2.4, s: pop(u, 0.2) });
      mono(56, 104, 'DefaultRequestHeaders', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      mono(56, 128, '.Authorization = Bearer …', { 'font-size': 14, opacity: fade(u, 0.4) });
      [['GET /api/orders'], ['POST /api/orders'], ['GET /me']].forEach(([f], i) => { const x = 380 + (i % 3) * 190, y = 220;
        const st = u > 1.0 + i * 0.35; envelope(x - 40, y, 180, f, st ? [['Auth', 'Bearer …', ACC]] : [], null, { s: pop(u, 0.4 + i * 0.2) });
        if (st) grow(180, 140, x + 50, y - 4, seg(u, 0.8 + i * 0.35, 1.0 + i * 0.35), ACC); });
      note(60, 380, '한 번 세팅하면 모든 요청에 붙는다', fade(u, 2.0));
      return; }
    if (k === 2 || k === 3) { const heads = [AUTH, ['Content-Type', 'application/json; charset=utf-8', INFO, k === 2 ? fade(u, 1.2) : 1]];
      envelope(60, 70, 470, 'POST /api/orders', heads, '{"sku":"A-100","qty":3}', { s: k === 2 ? pop(u, 0.2) : 1 });
      if (k === 2) { mono(560, 110, 'new OrderReq("A-100", 3)', { 'font-size': 15, opacity: fade(u, 0.3) });
        grow(600, 126, 480, 196, E(u, 0.6, 1.1), ACC); note(560, 270, 'PostAsJsonAsync 가 직렬화하고', fade(u, 1.4)); note(560, 300, 'Content-Type 까지 붙인다', fade(u, 1.7));
        sub(295, 290, '키는 camelCase (웹 기본값)', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      server(810, 120, 'api.example.com', { lamp: GOOD });
      const m = E(u, 0.2, 1.1);
      envelope(lerp(700, 60, m), 260, 470, 'HTTP/1.1 201 Created', [], '{"id":42,"status":"created"}', { stroke: GOOD });
      if (u > 1.4) card(780, 330, 300, 44, { rx: 8, text: 'Order { Id = 42, Status = created }', mono: true, fs: 14, fw: 800, stroke: ACC, color: ACC, s: pop(u, 1.4) });
      sub(780, 384, '상태 확인 → ReadFromJsonAsync<Order>', fade(u, 1.9), { 'font-size': 14 });
      return; }
    // k=4 요청 하나만
    envelope(60, 70, 300, 'GET /api/orders', [AUTH], null, {});
    envelope(60, 200, 300, 'POST /api/orders', [AUTH], null, {});
    envelope(470, 120, 400, 'GET /me', [['Authorization', 'Bearer (다른 토큰)', WARN]], null, { stroke: WARN, s: pop(u, 0.4) });
    note(470, 270, 'HttpRequestMessage one', fade(u, 1.0), { class: 'mono' });
    note(470, 300, 'one.Headers 는 이 요청에만', fade(u, 1.4));
    note(470, 330, 'SendAsync(one)', fade(u, 1.8), { class: 'mono', fill: WARN });
  }

  // ---------- 5. 타임아웃 · 취소 · 재시도 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const x0 = 220, w = 640, sc = w / 100;
      tx(x0, 70, '죽은 서버에 보낸 요청을 얼마나 기다리나', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      [['기본 Timeout', 100, BAD], ['Timeout = 10초', 10, GOOD]].forEach(([n, v, col], i) => { const y = 120 + i * 80, g = E(u, 0.3 + i * 0.6, 1.8 + i * 0.3);
        tx(40, y + 16, n, { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: x0, y, width: w, height: 24, rx: 4, fill: SOFT });
        el('rect', { x: x0, y, width: sc * v * g, height: 24, rx: 4, fill: col, opacity: 0.7 }); mono(x0 + sc * v * g + 8, y + 18, `${Math.round(v * g)}초`, { 'font-size': 15, 'font-weight': 800, fill: col }); });
      note(40, 330, '기다리는 동안 그 요청을 처리하던 작업이 묶인다', fade(u, 2.0));
      return; }
    if (k === 1) { const nodes = [['화면·상위 요청', 110], ['GetUserAsync(id, ct)', 380], ['GetFromJsonAsync(url, ct)', 700]];
      const cut = u > 1.6;
      nodes.forEach(([n, x], i) => { card(x, 160, i ? 260 : 180, 56, { rx: 10, text: n, mono: i > 0, fs: 14, stroke: cut ? BAD : INK, s: pop(u, 0.2 + i * 0.2) }); if (i) grow(nodes[i - 1][1] + (i === 1 ? 90 : 130), 160, x - 130, 160, E(u, 0.5 + i * 0.2, 0.9 + i * 0.2), cut ? BAD : ACC); });
      mono(240, 130, 'ct', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7) }); mono(540, 130, 'ct', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      if (cut) { pill(110, 250, '사용자가 화면을 떠남', BAD, pop(u, 1.6), { fs: 14 }); [380, 700].forEach((x, i) => cross(x + 110, 130, 9, pop(u, 1.9 + i * 0.2))); }
      note(60, 340, '받은 토큰을 끝까지 넘겨야 함께 멈춘다', fade(u, 2.2));
      return; }
    // 재시도 타임라인 (초 단위 눈금)
    const x0 = 120, sc = 52, y = 200;
    if (k <= 3) { el('line', { x1: x0, y1: y, x2: x0 + 15 * sc, y2: y, stroke: GRID, 'stroke-width': 2 });
      [0, 2, 6, 14].forEach((s2) => mono(x0 + s2 * sc, y + 70, `${s2}초`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' })); }
    if (k === 2) { [[1, 2], [2, 4], [3, 8]].forEach(([n, w], i) => { const a = [0, 2, 6][i], g = E(u, 0.4 + i * 0.5, 0.9 + i * 0.5);
        el('rect', { x: x0 + a * sc, y: y - 16, width: w * sc * g, height: 32, rx: 6, fill: WARNBG, stroke: WARN });
        if (g > 0.6) { mono(x0 + (a + w / 2) * sc, y + 6, `${w}초`, { 'font-size': 14.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' }); tx(x0 + (a + w / 2) * sc, y - 28, `재시도 ${n} 전`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); } });
      mono(x0, 110, 'WaitAndRetryAsync(3, n => 2^n 초)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      note(x0, 330, '5xx 와 HttpRequestException 만 다시 시도', fade(u, 2.0));
      note(x0, 362, '간격을 벌려야 힘든 서버를 더 밀지 않는다', fade(u, 2.3), { fill: MUT }); return; }
    if (k === 3) { const at = [[0, '503', BAD], [2, '503', BAD], [6, '200', GOOD]];
      at.forEach(([s2, code, col], i) => { const a = 0.3 + i * 0.7; const sp = pop(u, a);
        if (i) { const pa = at[i - 1][0]; el('rect', { x: x0 + pa * sc + 14, y: y - 8, width: Math.max(0, (s2 - pa) * sc - 28) * E(u, a - 0.6, a), height: 16, rx: 4, fill: WARNBG }); }
        card(x0 + s2 * sc, y, 64, 44, { rx: 8, text: code, mono: true, fs: 16, fw: 800, stroke: col, color: col, s: sp });
        mono(x0 + s2 * sc, y - 38, `시도 ${i + 1}`, { 'font-size': 14, 'text-anchor': 'middle', opacity: sp }); });
      mono(x0, 110, 'await policy.ExecuteAsync(() => http.GetAsync(…))', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.1) });
      if (u > 2.4) check(x0 + 6 * sc + 50, y, 10, 1);
      note(x0, 340, '응답 503 두 번은 예시 · 대기 2초, 4초는 정책 식', fade(u, 2.2), { fill: MUT, 'font-size': 14.5 }); return; }
    // k=4 .Result
    el('rect', { x: 60, y: 60, width: 840, height: 120, rx: 12, fill: SOFT });
    tx(80, 88, 'UI·옛 ASP.NET: 하나뿐인 컨텍스트 스레드', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    card(250, 130, 300, 50, { rx: 8, text: 'http.GetAsync(url).Result', mono: true, fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 0.2) });
    tx(250, 172, '스레드가 막혀 기다린다', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.6) });
    card(700, 130, 280, 50, { rx: 8, text: 'await 뒤 이어서 할 일', fs: 14.5, stroke: WARN, s: pop(u, 0.8) });
    tx(700, 172, '그 스레드가 비기를 기다린다', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.1) });
    const p = el('path', { d: 'M400,118 C480,80 520,80 560,118', fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ahr)', opacity: fade(u, 1.3) });
    el('path', { d: 'M560,142 C520,178 480,178 400,142', fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ahr)', opacity: fade(u, 1.5) });
    if (u > 1.7) pill(480, 230, '데드락', BAD, pop(u, 1.7), { fs: 15 });
    note(60, 300, 'ASP.NET Core 는 컨텍스트가 없어 데드락 대신 스레드 풀이 마른다', fade(u, 2.0), { 'font-size': 14.5 });
    note(60, 340, '답은 하나: 끝까지 await', fade(u, 2.3), { fill: GOOD });
  }

  // ---------- 6. 예외 구분 ----------
  const BINS = [['catch (HttpRequestException)', BAD, 'HTTP 실패'], ['catch (TaskCanceledException)\nwhen (!cts.IsCancellationRequested)', WARN, '타임아웃 초과'], ['catch (OperationCanceledException)', INFO, '사용자가 취소함']];
  function bins(hot, u0) { BINS.forEach(([n, col, out], i) => { const x = 170 + i * 310, y = 300, on = hot === i;
      card(x, y, 290, 92, { rx: 10, stroke: col, sw: on ? 3 : 1.8, fill: on ? PANEL : SOFT });
      n.split('\n').forEach((ln, j) => mono(x, y - 18 + j * 20, ln, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle' }));
      if (on) mono(x, y + 32, `"${out}"`, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u0, 1.8) }); }); }
  function drop(i, u, label, inner) { const x = 170 + i * 310, m = E(u, 0.4, 1.4);
    card(lerp(480, x, m), lerp(120, 236, m), 260, 40, { rx: 20, text: label, mono: true, fs: 13.5, fw: 800, stroke: BINS[i][1], color: BINS[i][1], fill: PANEL });
    if (inner && u > 1.6) mono(480, 190, inner, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); }
  function s6(t, c) { const { k, u } = c;
    card(480, 60, 520, 56, { rx: 10, stroke: INK, sw: 2, text: 'try { await http.GetFromJsonAsync<User>(…, cts.Token) }', mono: true, fs: 14 });
    if (k === 0) { mono(480, 140, 'using var cts = new CancellationTokenSource();', { 'font-size': 14.5, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.3) });
      note(480, 172, 'try 밖에 있어야 when 절에서 cts 가 보인다', fade(u, 0.8), { 'text-anchor': 'middle', 'font-size': 14.5 });
      if (u > 1.4) card(480, 250, 380, 46, { rx: 8, text: 'User { Id = 1, Name = Ada, … }', mono: true, fs: 15, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, 1.4) });
      note(480, 320, '성공하면 catch 는 하나도 지나지 않는다', fade(u, 2.0), { 'text-anchor': 'middle', fill: MUT });
      return; }
    if (k === 4) { const rows = c.beat.fails.rows;
      tx(60, 140, c.beat.fails.title, { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.1) });
      rows.forEach((r, i) => { const y = 180 + i * 44, s = pop(u, 0.3 + i * 0.3); card(480, y, 840, 36, { rx: 8, stroke: GRID, s }); if (s > 0.5) { mono(80, y + 5, r.case, { 'font-size': 14.5, 'font-weight': 800 }); tx(500, y + 5, r.why, { 'font-size': 14.5, fill: MUT }); } });
      note(60, 380, 'Factory 주입 + 짧은 Timeout + 토큰 + 상태 확인 + 재시도 + await', fade(u, 1.8), { fill: GOOD, 'font-size': 14.5 });
      return; }
    bins(k - 1, u);
    if (k === 1) { drop(0, u, '404 → StatusCode NotFound', null);
      mono(480, 190, '연결 거부도 여기 (StatusCode = null, 안쪽 SocketException)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { drop(1, u, 'http.Timeout 초과', 'cts 는 취소 안 됨 → when 참 · Inner = TimeoutException'); return; }
    drop(2, u, 'cts.Cancel()', 'when 거짓 → 다음 catch 로 · 에러 로그에서 뺀다');
  }

  const quiz = [
    { q: 'GET 요청에 서버가 404를 돌려줬다. GetAsync를 부른 줄에서는 무슨 일이 일어나나?',
      o: ['HttpRequestException이 바로 난다', '예외 없이 응답을 받고, EnsureSuccessStatusCode를 불러야 예외가 난다', 'null이 돌아온다'], a: 1,
      why: '응답을 받은 것 자체는 성공이라 예외가 없다. EnsureSuccessStatusCode가 StatusCode=NotFound인 HttpRequestException을 던진다.' },
    { q: '요청마다 using var c = new HttpClient()를 쓰면 고부하에서 왜 SocketException이 나나?',
      o: ['HttpClient가 스레드 안전하지 않아서', 'Dispose가 예외를 던져서', '닫힌 소켓이 TIME_WAIT로 남아 포트가 바닥나서'], a: 2,
      why: 'Dispose 해도 소켓은 한동안 TIME_WAIT로 포트를 잡고 있다. 1만 번 새로 만들면 포트가 마른다.' },
    { q: 'IHttpClientFactory가 핸들러를 기본 2분마다 갈아끼우는 까닭은 무엇인가?',
      o: ['새 연결에서 DNS를 다시 조회해 바뀐 서버 주소를 따라가려고', '메모리를 아끼려고 연결을 모두 끊으려고', '인증 토큰을 새로 받으려고'], a: 0,
      why: '하나의 핸들러를 영원히 쓰면 옛 IP에 계속 붙는다. 주기적으로 바꾸면 소켓은 재사용하면서 DNS 변화도 반영한다.' },
    { q: 'PostAsJsonAsync("/api/orders", new OrderReq("A-100", 3))이 보내는 본문은 무엇인가?',
      o: ['{"Sku":"A-100","Qty":3}', '{"sku":"A-100","qty":3}', 'Sku=A-100&Qty=3'], a: 1,
      why: 'System.Net.Http.Json은 웹 기본값을 써서 키를 camelCase로 바꾸고 Content-Type: application/json을 붙인다.' },
    { q: 'WaitAndRetryAsync(3, n => 2^n 초) 정책에서 두 번째 재시도 전에는 몇 초를 기다리나?',
      o: ['2초', '4초', '8초'], a: 1,
      why: 'n은 1부터 센다. 첫 재시도 전 2초, 두 번째 4초, 세 번째 8초다.' },
    { q: 'http.Timeout이 터졌을 때 어느 catch로 들어가나?',
      o: ['catch (TaskCanceledException) when (!cts.IsCancellationRequested)', 'catch (HttpRequestException)', 'catch (OperationCanceledException)만'], a: 0,
      why: '시간 초과는 TaskCanceledException으로 오고 우리 cts는 취소되지 않았으므로 when이 참이다. 안쪽 예외는 TimeoutException이다.' },
  ];

  const summary = [
    '404나 500을 받아도 GetAsync는 예외를 내지 않는다. 상태를 확인한 뒤에 본문을 읽는다.',
    '요청마다 HttpClient를 새로 만들면 닫힌 소켓이 남아 포트가 마른다. 하나를 만들어 재사용한다.',
    'ASP.NET Core에서는 IHttpClientFactory로 주입받는다. 핸들러를 2분마다 바꿔 DNS 변경도 따라간다.',
    '기본 Timeout 100초는 길다. 짧게 잡고, 토큰을 넘기고, 재시도는 간격을 벌리고, 끝까지 await한다.',
  ];
  const review = [
    { q: '배포 뒤 API 서버 IP가 바뀌었는데, static HttpClient 하나만 쓰는 서비스가 계속 옛 서버로 요청한다. 어떻게 고치나?',
      o: ['요청마다 new HttpClient()로 바꾼다', 'AddHttpClient로 등록하고 주입받아 핸들러가 주기적으로 바뀌게 한다', 'Timeout을 100초로 늘린다'], a: 1,
      why: '정적 인스턴스는 연결을 계속 붙잡아 DNS 변경을 못 따라간다. Factory는 핸들러를 갈아끼우며 새 연결에서 다시 조회한다. 요청마다 new는 포트 고갈을 부른다.' },
    { q: '외부 API가 가끔 HTML 오류 페이지를 주는데, 로그에는 JsonException만 찍힌다. 먼저 넣을 것은?',
      o: ['본문을 읽기 전에 EnsureSuccessStatusCode()', 'PropertyNameCaseInsensitive = true', '재시도 횟수를 늘리는 것'], a: 0,
      why: '상태를 보지 않고 HTML을 JSON으로 읽으려다 엉뚱한 곳에서 터진 것이다. 상태부터 확인하면 StatusCode가 담긴 HttpRequestException이 난다.' },
    { q: '사용자가 화면을 떠나 취소했는데 에러 알림이 계속 울린다. catch 구성에서 고칠 곳은?',
      o: ['HttpRequestException catch를 없앤다', 'Timeout을 늘린다', '취소는 OperationCanceledException으로 따로 잡아 에러로 기록하지 않는다'], a: 2,
      why: '취소는 정상적인 중단이다. 타임아웃은 when (!cts.IsCancellationRequested)로 가려내고, 취소는 따로 잡아 에러 로그에서 뺀다.' },
  ];

  R.page({ title: 'HttpClient 요청의 일생', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
