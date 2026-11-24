/* I-2-1 REST vs GraphQL vs tRPC vs gRPC — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 오른쪽 점수(1~5)는 페이지 STEPS 의 scores 를 그대로 읽는다(페이지가 매긴 상대 평가).
 * GraphQL 응답 모양은 graphql 16, protobuf 바이트(35 B 대 JSON 59 B)는 protobufjs 로 실제로 인코딩해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, spans, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone,
    server, dbIcon, person, browser, cross, check, lock, heat, fly } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function codeLines(x, y, L, n, o) { o = o || {}; const lh = o.lh || 24, fs = o.fs || 14.5;
    L.forEach((ln, i) => { if (i >= n) return; const [s, a] = Array.isArray(ln) ? ln : [ln, {}];
      const part = i === Math.floor(n) && n % 1 ? s.slice(0, Math.round(s.length * (n % 1))) : s;
      mono(x, y + i * lh, part, Object.assign({ 'font-size': fs, fill: INK }, a)); }); }

  // ---------- 오른쪽 점수판 ----------
  const AXES = [['typeSafety', '타입 안전'], ['learning', '배우기 쉬움'], ['ecosystem', '생태계'], ['fetchingControl', '필드 제어'], ['binary', '바이너리']];
  function scores(c, name, col) { const b = c.beat.scores, p = (c.prev && c.prev.scores) || null, x = 668, y0 = 70;
    el('rect', { x: x - 18, y: 30, width: 290, height: 236, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x, 56, name, { 'font-size': 16, 'font-weight': 800, fill: col });
    tx(x + 254, 56, '페이지 평가 1~5', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    AXES.forEach(([key, label], i) => { const y = y0 + 22 + i * 38, v = tween(p ? p[key] : 0, b[key], c.u), changed = p && p[key] !== b[key];
      tx(x, y + 5, label, { 'font-size': 14, 'font-weight': changed ? 800 : 600, fill: changed ? col : INK });
      for (let d = 0; d < 5; d++) { const f = clamp(v - d), cx = x + 112 + d * 26;
        el('circle', { cx, cy: y, r: 9, fill: 'none', stroke: GRID, 'stroke-width': 1.5 });
        if (f > 0) el('circle', { cx, cy: y, r: 9 * f, fill: col }); }
      mono(x + 254, y + 5, String(Math.round(v)), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: changed ? col : INK }); }); }

  // ---------- 1. REST: 자원 × 메서드 ----------
  const RES = ['/api/users', '/api/users/1'], VERB = ['GET', 'POST', 'PUT', 'DELETE'];
  const CELL = { 'GET,0': 0, 'GET,1': 0, 'POST,0': 1, 'PUT,1': 2, 'DELETE,1': 2 };   // 그 칸이 채워지는 beat
  function s1(t, c) { const { k, u } = c;
    scores(c, 'REST', INFO);
    tx(40, 50, '자원(URL) × HTTP 메서드', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    VERB.forEach((v, j) => mono(250 + j * 92, 82, v, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO }));
    RES.forEach((r, i) => { const y = 120 + i * 52; mono(40, y + 5, r, { 'font-size': 15, 'font-weight': 700 });
      VERB.forEach((v, j) => { const at = CELL[v + ',' + i], cx = 250 + j * 92;
        el('rect', { x: cx - 40, y: y - 20, width: 80, height: 40, rx: 6, fill: 'none', stroke: GRID, 'stroke-width': 1.5 });
        if (at == null || at > k) return; const s = at === k ? pop(u, v === 'POST' ? 1.6 : 0.3 + j * 0.25 + i * 0.2) : 1;
        card(cx, y, 74, 34, { rx: 5, fill: INFOBG, stroke: INFO, sw: 1.5, s, text: v === 'GET' ? (i ? '단건' : '목록') : v === 'POST' ? '생성' : v === 'PUT' ? '교체' : '삭제', fs: 14 }); }); });
    if (k === 1) { fly(342, 250, 342, 128, seg(u, 0.6, 1.6), '{ "name": "박호영" }');
      note(40, 280, '같은 URL, 다른 메서드 = 다른 동작', fade(u, 1.6)); }
    if (k === 2) note(40, 280, '자원이 늘어도 규칙은 이 네 칸 그대로', fade(u, 1.4));
    if (k === 3) { // CDN 이 304 로 답한다
      const y = 340; R.person(70, y - 6, null, { s: 0.8 });
      card(270, y, 130, 46, { rx: 10, text: 'CDN 캐시', fs: 15, stroke: GOOD, fill: GOODBG, s: pop(u, 0.2) }); server(520, y, null, { s: 0.6 });
      grow(100, y, 200, y, E(u, 0.4, 0.8), MUT); pill(150, y - 30, 'If-None-Match', MUT, pop(u, 0.5), { mono: true, fs: 13.5 });
      fly(270, y, 100, y, seg(u, 1.0, 1.8), '304', { fill: GOOD, mono: true, stay: true });
      note(345, y + 5, '서버까지 안 간다', fade(u, 1.8), { fill: GOOD, 'font-size': 14 }); tx(40, 290, 'GET 은 URL 이 곧 캐시 키다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); }
    if (k === 4) { const fs = ['id', 'name', 'email', 'phone', 'address', '… 100'];
      tx(40, 290, 'GET /api/users/1 응답', { 'font-size': 15, 'font-weight': 700 });
      fs.forEach((f, i) => card(70 + i * 82, 330, 74, 32, { rx: 16, text: f, fs: 13.5, mono: true, stroke: i < 2 ? INFO : OFF, color: i < 2 ? INK : MUT, s: pop(u, 0.2 + i * 0.1) }));
      cross(560, 330, 12, pop(u, 1.2)); note(40, 390, '필드를 고를 수 없다 · 화면마다 BFF · URL 에 /v1 /v2', fade(u, 1.4), { fill: BAD, 'font-size': 14.5 }); }
  }


  // ---------- 2. GraphQL: 세 루트 타입 ----------
  const LANES = [['Query', 'query { user(id:"1") { name email posts(first:3){ title } } }', '{"data":{"user":{"name":"박호영", …, "posts":[3개]}}}'],
    ['Mutation', 'mutation { createUser(input:{ name:"박호영" }) { id name } }', '{"data":{"createUser":{"id":"2","name":"박호영"}}}'],
    ['Subscription', 'subscription { messageAdded(roomId:"r1") { text sender { name } } }', '{"data":{"messageAdded":{"text":"안녕", …}}}']];
  function s2(t, c) { const { k, u } = c;
    scores(c, 'GraphQL', ACC);
    const dim = k >= 3 ? 0.35 : 1;
    person(46, 150, '클라이언트', { s: 0.8, op: dim }); card(570, 150, 92, 200, { rx: 12, text: '/graphql', fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, op: dim });
    LANES.forEach(([root, q, a], i) => { if (i > k && k < 3) return; const y = 80 + i * 70, on = i === k;
      tx(100, y - 14, root, { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: dim });
      if (i < 2) { el('line', { x1: 96, y1: y, x2: 522, y2: y, stroke: GRID, 'stroke-width': 2, opacity: dim });
        if (on) { dot([[96, y], [522, y]], seg(u, 0.3, 1.1), ACC, 6); dot([[522, y + 14], [96, y + 14]], seg(u, 1.3, 2.1), INK, 6); }
        mono(104, y + 34, on ? a : '', { 'font-size': 13.5, fill: INK, opacity: on ? fade(u, 2.0) : 0 });
        if (!on && k < 3) mono(104, y + 34, a, { 'font-size': 13.5, fill: MUT }); }
      else { // 웹소켓: 한 번 연결해 두고 서버가 계속 밀어 준다
        el('line', { x1: 96, y1: y - 3, x2: 522, y2: y - 3, stroke: ACC, 'stroke-width': 2, opacity: dim * (on ? E(u, 0.2, 0.8) : 1) });
        el('line', { x1: 96, y1: y + 3, x2: 522, y2: y + 3, stroke: ACC, 'stroke-width': 2, opacity: dim * (on ? E(u, 0.2, 0.8) : 1) });
        tx(310, y - 10, 'WebSocket 연결 유지', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: dim });
        if (k === 2) for (let e = 0; e < 3; e++) { const st = 0.9 + e * 0.55; fly(522, y + 26, 110, y + 26, seg(u, st, st + 0.6), 'messageAdded', { mono: true }); }
        if (k === 2) mono(104, y + 50, a, { 'font-size': 13.5, opacity: fade(u, 2.2) }); } });
    if (k === 0) note(104, 330, '읽기: 필드를 적은 그대로 받는다', fade(u, 2.2), { fill: ACC });
    if (k === 1) note(104, 330, '쓰기도 같은 문법, 결과에서 받을 필드도 고른다', fade(u, 2.2), { fill: ACC });
    if (k === 3) { const y = 340; card(90, y, 120, 48, { rx: 10, text: '프런트엔드', fs: 14.5, s: pop(u, 0.2) }); card(530, y, 120, 48, { rx: 10, text: '백엔드', fs: 14.5, s: pop(u, 0.2) });
      card(310, y, 190, 66, { rx: 6, text: 'schema.graphql\n계약서', fs: 14.5, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.6) });
      grow(152, y, 213, y, E(u, 1.0, 1.4), ACC); grow(468, y, 407, y, E(u, 1.0, 1.4), ACC);
      tx(310, y - 48, '합의는 스키마 하나, 구현은 각자', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (k === 4) { const items = [['POST 라 CDN 캐시를 그대로 못 쓴다', 'persisted query'], ['목록 안 필드마다 DB 조회 (N+1)', 'DataLoader'], ['스키마 우선 설계·리졸버 사고', '학습 비용']];
      items.forEach(([a, b], i) => { const y = 296 + i * 40, s = pop(u, 0.2 + i * 0.4);
        R.G(0, 0, 1); cross(52, y, 8, s); tx(70, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) });
        pill(520, y, b, WARN, s, { fs: 13.5 }); }); }
  }

  // ---------- 3. tRPC: 타입이 곧 계약 ----------
  const SRV = [['const t = initTRPC.create();', 0], ['export const appRouter = t.router({', 1], ['  getUser: t.procedure', 1], ['    .input(z.object({ id: z.string() }))', 1], ['    .query(({ input }) => db.users…),', 1],
    ['  createUser: …mutation(…),', 2], ['});', 1], ['export type AppRouter = typeof appRouter;', 2]];
  function s3(t, c) { const { k, u } = c;
    scores(c, 'tRPC', INFO);
    zone(24, 30, 610, 270, 'TypeScript 모노레포 (한 저장소)', { stroke: INFO, sw: 1.5, fill: SOFT });
    tx(44, 74, 'server/router.ts', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    SRV.forEach(([s, at], i) => { if (at > k) return; const a = at === k ? fade(u, 0.2 + i * 0.15) : 1;
      mono(44, 100 + i * 22, s, { 'font-size': 13.5, opacity: a, fill: (at === 2 && i === 7) ? INFO : INK, 'font-weight': i === 7 ? 800 : 500 }); });
    if (k === 0) { card(470, 200, 160, 50, { rx: 8, text: 'schema.graphql\n.proto', fs: 13.5, mono: true, stroke: OFF, color: OFF, dash: '5 4', s: pop(u, 0.4) }); cross(470, 200, 18, pop(u, 1.2));
      note(400, 260, '스키마 파일도 생성 단계도 없다', fade(u, 1.6), { 'font-size': 14 }); }
    if (k === 1) { pill(480, 170, 'zod 입력 검증 = 입력 타입', INFO, pop(u, 1.0), { fs: 13.5 }); }
    if (k >= 2) { const yC = 330; // 클라이언트 파일
      if (k >= 2) { const a = k === 2 ? E(u, 0.8, 1.8) : 1; fly(220, 254, 220, yC - 6, k === 2 ? seg(u, 0.8, 1.8) : 0, 'AppRouter 타입', { fill: INFO, mono: true });
        if (a >= 1 || k > 2) { tx(44, yC - 10, 'client/app.ts', { 'font-size': 14, 'font-weight': 700, fill: MUT }); mono(44, yC + 14, 'import type { AppRouter } from "../server/router";', { 'font-size': 13.5, fill: INFO }); } } }
    if (k >= 3) { const y = 380; mono(44, y, 'await trpc.getUser.query({ id: "1" })', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.2) : 1 });
      if (k === 3) { el('rect', { x: 140, y: y + 8, width: 150, height: 0, fill: 'none' });
        card(560, y - 8, 170, 64, { rx: 6, text: 'getUser   query\ncreateUser mutate', fs: 13.5, mono: true, stroke: INFO, s: pop(u, 0.9) });
        tx(560, y - 48, 'IDE 자동완성', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.3) }); } }
    if (k === 4) { pill(500, 380, 'TanStack Query: 캐시 · 낙관적 업데이트', GOOD, pop(u, 0.4), { fs: 13.5 }); }
    if (k === 5) { [['Swift 앱', 705], ['Kotlin 앱', 800], ['Go 서비스', 895]].forEach(([s, y], i) => { const sc = pop(u, 0.3 + i * 0.3);
        card(y, 330, 88, 40, { rx: 8, text: s, fs: 14, stroke: BAD, s: sc, fill: PANEL }); cross(y + 38, 310, 8, sc); });
      tx(800, 380, 'TS 타입을 못 받는다', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.5) }); }
  }

  // ---------- 4. gRPC: .proto → 바이너리 ----------
  const HEX = ['0a', '01', '31', '12', '09', 'eb', 'b0', '95', 'ed', '98', 'b8', 'ec', '98', '81', '1a', '13', '68', '6f', '79', '6f', '75', '6e', '67', '40', '65', '78', '61', '6d', '70', '6c', '65', '2e', '63', '6f', '6d'];
  function s4(t, c) { const { k, u } = c;
    scores(c, 'gRPC', WARN);
    if (k <= 2) { const blocks = [['service UserService {', '  rpc GetUser (GetUserRequest) returns (User);', '  rpc CreateUser (…) returns (User);', '  rpc StreamUsers (google.protobuf.Empty) returns (stream User);', '}'],
        ['message GetUserRequest  { string id   = 1; }', 'message CreateUserRequest { string name = 1; }'],
        ['message User {', '  string id    = 1;', '  string name  = 2;', '  string email = 3;', '}']];
      let y = 64; blocks.forEach((L, i) => { if (i > k) return; codeLines(40, y, L.map((s) => [s, { fill: /= \d/.test(s) && i === k ? WARN : INK, 'font-weight': i === k ? 700 : 500 }]), i === k ? lerp(0, L.length, E(u, 0.2, 1.6)) : L.length, { lh: 22, fs: 13.5 }); y += L.length * 22 + 14; });
      if (k === 0) pill(470, 360, 'stream = 서버가 여러 번 보낸다', WARN, pop(u, 1.6), { fs: 13.5 });
      if (k === 1) note(40, 330, '= 1, = 2 … 이 번호가 와이어에 실리는 키', fade(u, 1.6), { fill: WARN });
      if (k === 2) note(40, 400, '응답 모양은 고정: 클라이언트가 필드를 고르지 않는다', fade(u, 1.6), { fill: BAD, 'font-size': 14.5 });
      return; }
    if (k === 3) { card(90, 70, 110, 40, { rx: 8, text: 'user.proto', fs: 14, mono: true, stroke: WARN });
      ['Go', 'Java', 'Python', 'TS'].forEach((l, i) => { const x = 250 + i * 95, a = E(u, 0.2 + i * 0.2, 0.6 + i * 0.2); grow(146, 70, x - 34, 70, i === 0 ? a : 0, MUT);
        card(x, 70, 80, 36, { rx: 8, text: l + ' stub', fs: 13.5, stroke: GRID, s: pop(u, 0.4 + i * 0.2) }); });
      tx(40, 140, 'User { id:"1", name:"박호영", email:"hoyoung@example.com" } 한 건을 인코딩', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.8) });
      const n = Math.round(lerp(0, 35, E(u, 0.9, 2.2)));
      HEX.slice(0, n).forEach((h, i) => { const tag = i === 0 || i === 3 || i === 14, x = 40 + (i % 18) * 32, y = 176 + Math.floor(i / 18) * 30;
        el('rect', { x: x - 2, y: y - 17, width: 28, height: 24, rx: 4, fill: tag ? WARN : SOFT, opacity: tag ? 0.9 : 1 });
        mono(x + 12, y, h, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': tag ? 800 : 500, fill: tag ? PANEL : INK }); });
      tx(40, 254, '노란 칸 = 필드 번호 1·2·3 (이름 대신 번호)', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) });
      const g = E(u, 1.6, 2.4); tx(40, 300, 'JSON', { 'font-size': 14, 'font-weight': 700 }); el('rect', { x: 120, y: 287, width: 59 * 7 * g, height: 18, rx: 3, fill: OFF }); mono(126 + 59 * 7 * g, 301, '59 B', { 'font-size': 14, 'font-weight': 700, opacity: g });
      tx(40, 334, 'protobuf', { 'font-size': 14, 'font-weight': 700, fill: WARN }); el('rect', { x: 120, y: 321, width: 35 * 7 * g, height: 18, rx: 3, fill: WARN }); mono(126 + 35 * 7 * g, 335, '35 B', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: g });
      tx(40, 380, '전송은 HTTP/2 · 크기 차이는 데이터마다 다르다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 4) { server(80, 180, '서비스 A', { s: 0.8 }); server(540, 180, '서비스 B', { s: 0.8 });
      el('rect', { x: 140, y: 150, width: 340, height: 60, rx: 30, fill: 'none', stroke: WARN, 'stroke-width': 2 });
      tx(310, 140, 'HTTP/2 연결 하나', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' });
      for (let e = 0; e < 4; e++) { dot([[150, 168], [470, 168]], ((t * 0.5 + e / 4) % 1), INK, 5); dot([[470, 192], [150, 192]], ((t * 0.5 + e / 4 + 0.12) % 1), WARN, 5); }
      note(140, 260, '양쪽이 동시에 계속 보낸다 (bidirectional streaming)', fade(u, 0.8), { 'font-size': 14.5 });
      note(140, 290, '내부 서비스 사이 대량 호출에 맞다', fade(u, 1.4), { fill: WARN, 'font-size': 14.5 }); return; }
    // k 5: 브라우저는 못 바로 부른다
    browser(110, 150, 150, 110, '브라우저', {}); server(520, 150, 'gRPC 서버', { s: 0.8 });
    grow(188, 150, 448, 150, E(u, 0.2, 0.9), BAD); cross(318, 150, 14, pop(u, 0.9));
    card(318, 230, 210, 44, { rx: 10, text: 'gRPC-Web 프록시 필요', fs: 14.5, stroke: WARN, s: pop(u, 1.3) });
    tx(40, 320, '로그에 찍힌 바이트', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.6) });
    mono(40, 350, HEX.slice(0, 16).join(' ') + ' …', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) });
    tx(40, 384, '눈으로 읽을 수 없다 · 배울 것이 가장 많다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) });
  }

  // ---------- 5. 선택 가이드 ----------
  const FINAL = { rest: 4, graphql: 9, trpc: 15, grpc: 21 };   // 각 패러다임의 마지막 beat (STEPS 번호)
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const names = ['REST', 'GraphQL', 'tRPC', 'gRPC'], ids = ['rest', 'graphql', 'trpc', 'grpc'];
      const m = ids.map((id) => { const s = typeof STEPS !== 'undefined' && STEPS[FINAL[id]] && STEPS[FINAL[id]].scores; return AXES.map(([key]) => (s ? s[key] : 0)); });
      const n = Math.round(lerp(0, 4, E(u, 0.2, 1.6)));
      heat(250, 80, m.slice(0, n), 74, { max: 5, rows: names.slice(0, n), cols: AXES.map((a) => a[1]), fs: 18 });
      tx(250, 400, '각 장면 끝의 평가 점수 (1~5)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) });
      note(660, 140, '한 축에서 강하면', fade(u, 1.9)); note(660, 168, '다른 축에서 약하다', fade(u, 2.1), { fill: BAD }); return; }
    if (k === 1) { const Qs = [['공개 API 인가?', 'REST'], ['TS 모노레포인가?', 'tRPC'], ['한 화면에 여러 자원?', 'GraphQL'], ['내부 통신·latency?', 'gRPC'], ['실시간?', 'Subscription / stream']];
      Qs.forEach(([q, a], i) => { const y = 60 + i * 70, s = pop(u, 0.2 + i * 0.35);
        card(220, y, 280, 46, { rx: 23, text: q, fs: 15, stroke: INK, s });
        grow(362, y, 520, y, E(u, 0.4 + i * 0.35, 0.8 + i * 0.35), ACC); mono(538, y - 10, '예', { 'font-size': 13.5, fill: ACC, opacity: s });
        card(650, y, tw(a, 15) + 40, 40, { rx: 8, text: a, fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.6 + i * 0.35) }); });
      return; }
    if (k === 2) { const L = [['외부 · 공개 API', 'REST', INFO, 'GitHub REST · Shopify Admin'], ['앱 · 웹 화면 (BFF)', 'GraphQL', ACC, 'GitHub GraphQL · Shopify Storefront · Twitch'], ['서비스 사이', 'gRPC · protobuf RPC', WARN, 'Google(Stubby·gRPC) · Twitch(Twirp)']];
      L.forEach(([a, b, col, who], i) => { const y = 80 + i * 110, s = pop(u, 0.2 + i * 0.4);
        el('rect', { x: 40, y: y - 36, width: 880, height: 80, rx: 12, fill: SOFT, opacity: s ? 1 : 0 });
        tx(60, y - 6, a, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2 + i * 0.4) });
        card(380, y, 220, 46, { rx: 10, text: b, fs: 16, stroke: col, color: col, sw: 2.5, s });
        tx(520, y + 6, who, { 'font-size': 14, opacity: fade(u, 0.6 + i * 0.4) }); });
      tx(60, 400, 't3 스택 스타트업은 tRPC + Next.js', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { const M = [['GraphQL 은 REST 의 후속', '보완재. 캐시·공개 API 는 REST 가 강하다'], ['tRPC 가 GraphQL 을 대체', '모바일·다른 언어가 끼면 GraphQL'], ['gRPC 는 늘 이득', '브라우저·관찰성·디버깅 비용이 크다']];
      M.forEach(([a, b], i) => { const y = 90 + i * 100, s = pop(u, 0.2 + i * 0.5);
        card(250, y, 380, 56, { rx: 10, text: '"' + a + '"', fs: 16, stroke: BAD, s }); cross(470, y, 12, pop(u, 0.6 + i * 0.5));
        tx(510, y + 6, b, { 'font-size': 15, opacity: fade(u, 0.8 + i * 0.5) }); }); return; }
    // k 4: 이 강의의 초점
    [['REST', INFO], ['GraphQL', ACC], ['tRPC', INFO], ['gRPC', WARN]].forEach(([n, col], i) => { const focus = i === 1, s = focus ? 1 + 0.15 * E(u, 0.6, 1.2) : 1;
      card(150 + i * 220, 170, 180, 80, { rx: 12, text: n, fs: focus ? 22 : 17, stroke: col, color: col, sw: focus ? 3 : 1.5, fill: focus ? ACCBG : PANEL, s, op: focus ? 1 : 1 - 0.4 * E(u, 0.6, 1.2) }); });
    tx(480, 300, '깊이는 GraphQL, 판단은 넷을 견주어서', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    tx(480, 334, '"왜 GraphQL 인가" 를 스스로 답할 수 있어야 한다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
  }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'REST에서 같은 /api/users 주소로 조회와 생성을 가르는 것은 무엇인가?',
      o: ['HTTP 메서드(GET, POST)', 'URL 뒤의 쿼리 문자열', '응답 헤더'], a: 0,
      why: 'REST는 자원을 URL로, 동작을 메서드로 나타낸다. GET /api/users는 목록, POST /api/users는 생성이다.' },
    { q: 'GraphQL에서 이벤트가 생길 때마다 서버가 클라이언트로 밀어 주는 연산은 무엇인가?',
      o: ['mutation', 'query', 'subscription'], a: 2,
      why: 'subscription은 WebSocket 같은 연결을 열어 두고 messageAdded가 생길 때마다 {"data": …}를 보낸다.' },
    { q: 'tRPC 클라이언트가 서버 API의 입력·출력 타입을 아는 방법은 무엇인가?',
      o: ['schema.graphql 파일을 내려받는다', '서버의 AppRouter 타입을 import 한다', 'protoc로 stub을 만든다'], a: 1,
      why: '같은 TypeScript 저장소에서 typeof appRouter를 그대로 가져다 쓴다. 그래서 다른 언어 클라이언트는 이 타입을 받을 수 없다.' },
    { q: 'protobuf 바이트에서 필드 이름 대신 실리는 것은 무엇인가?',
      o: ['필드 이름의 해시', 'JSON 키를 줄인 약자', '.proto에 적은 필드 번호'], a: 2,
      why: 'string id = 1처럼 붙인 번호가 키가 된다. 그래서 User 한 건이 JSON 59 B에서 protobuf 35 B로 줄었다.' },
    { q: 'iOS·Android 앱과 웹이 한 화면에 여러 자원을 모아 받아야 할 때 맞는 선택은 무엇인가?',
      o: ['tRPC', 'GraphQL', 'gRPC'], a: 1,
      why: '언어가 다른 클라이언트가 여럿이고 화면이 자원을 모으면 GraphQL이 맞다. tRPC는 TS 밖으로 타입을 못 넘기고, gRPC는 브라우저에서 프록시가 필요하다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    'REST는 자원을 URL로, 동작을 메서드로 나타내 HTTP 캐시와 CDN을 그대로 쓴다.',
    'GraphQL은 필드 단위로 요청하고 query·mutation·subscription을 스키마 하나에 둔다.',
    'tRPC는 TS 타입이 곧 계약이라 편하지만 다른 언어 클라이언트에는 못 넘긴다.',
    'gRPC는 번호로 된 바이너리를 HTTP/2로 보낸다. 실무는 계층마다 넷을 섞는다.',
  ];
  const review = [
    { q: '공개 API를 GraphQL로만 냈더니 CDN 캐시가 거의 맞지 않는다. 먼저 의심할 것은?',
      o: ['쿼리가 POST 본문에 실려 URL이 캐시 키가 되지 못한다', 'protobuf로 인코딩하지 않았다', 'subscription을 너무 많이 열었다'], a: 0,
      why: 'REST GET은 URL이 캐시 키라 304와 CDN이 그대로 동작한다. GraphQL은 persisted query 같은 장치가 따로 필요하다.' },
    { q: 'TS 한 저장소로 만든 Next.js 대시보드에 Kotlin 앱이 새로 붙는다. tRPC API에서 생기는 문제는?',
      o: ['응답이 바이너리라 Kotlin이 읽지 못한다', 'Kotlin 앱은 AppRouter 타입을 받을 수 없다', '엔드포인트가 하나라 요청이 막힌다'], a: 1,
      why: 'tRPC의 계약은 TS 타입 그 자체다. 다른 언어가 끼면 GraphQL 스키마나 .proto처럼 언어를 가리지 않는 계약이 낫다.' },
    { q: '서비스끼리 초당 많은 호출을 주고받는데 JSON 직렬화 비용이 크다. 이 내부 구간에 맞는 것은?',
      o: ['GraphQL subscription', 'REST 응답에 필드를 더 넣기', 'gRPC(protobuf + HTTP/2)'], a: 2,
      why: '필드 번호로 된 바이너리라 같은 User도 59 B에서 35 B로 줄고, HTTP/2 연결 하나로 양방향 스트리밍도 된다.' },
  ];
  R.page({ title: 'API 네 가지 견주기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
