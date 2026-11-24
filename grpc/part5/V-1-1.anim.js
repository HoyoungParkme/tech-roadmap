/* V-1-1 grpc-gateway (REST/JSON 브릿지) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   바이트·크기·JSON 이름은 python protobuf 7.36 으로 같은 메시지를 직렬화해 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, browser, cross, check, lock, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // CreateUserRequest{name:"Alice", email:"alice@acme.io"} 직렬화 22바이트, User{id:"u-42",…} 28바이트
  const REQ = '0a 05 41 6c 69 63 65 12 0d 61 6c 69 63 65 40 61 63 6d 65 2e 69 6f'.split(' ');
  const USER = '0a 04 75 2d 34 32 12 05 41 6c 69 63 65 1a 0d 61 6c 69 63 65 40 61 63 6d 65 2e 69 6f'.split(' ');
  const JSON_REQ = '{"name":"Alice","email":"alice@acme.io"}';   // 40바이트

  // 바이트 칸: tags 는 태그 바이트 위치(필드번호×8+형식), lens 는 길이 바이트 위치
  function bytes(x, y, arr, n, o) { o = o || {}; const w = o.w || 27, h = 28, per = o.per || 11;
    arr.forEach((b, i) => { const s = clamp(n - i); if (s <= 0) return; const cx = x + (i % per) * (w + 3), cy = y + Math.floor(i / per) * (h + 4);
      const tag = (o.tags || []).includes(i), len = (o.lens || []).includes(i);
      el('rect', { x: cx, y: cy, width: w, height: h, rx: 4, fill: tag ? ACCBG : len ? C.WARNBG : PANEL, stroke: tag ? ACC : len ? WARN : GRID, 'stroke-width': 1.6, opacity: s });
      mono(cx + w / 2, cy + 19, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: tag ? ACC : INK, 'font-weight': tag ? 700 : 400, opacity: s }); }); }
  const REQ_TAGS = { tags: [0, 7], lens: [1, 8] }, USER_TAGS = { tags: [0, 6, 13], lens: [1, 7, 14] };
  // 파일 카드
  function file(cx, cy, name, o) { o = o || {}; const w = o.w || tw(name, 14) + 40, h = 34, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 10} L${w / 2},${-h / 2 + 10} V${h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 1.8 }, g);
    mono(0, 5, name, { 'font-size': 14, 'text-anchor': 'middle', fill: o.color || o.stroke || INK, 'font-weight': 700 }, g); return g; }

  // ───────── 1. 왜 grpc-gateway 인가
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) {
      browser(100, 92, 128, 84, '브라우저', {});
      if (k < 2) { card(100, 300, 150, 56, { rx: 8, fill: INK, stroke: 'none', text: '$ curl', color: PANEL, mono: true, fs: 15 }); lbl(100, 350, 'curl · 파트너', 1, { 'font-size': 14 }); }
      server(850, 130, 'gRPC 서버 :50051', {});
    }
    if (k === 0) {
      // gRPC 한 번의 호출이 실제로 지나가는 프레임
      const rows = [['HEADERS', ':path /user.v1.UserService/CreateUser'], ['DATA', null], ['HEADERS', 'grpc-status: 0    (트레일러)']];
      tx(520, 236, 'gRPC 호출 한 번 = HTTP/2 프레임 셋', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      rows.forEach(([f, s], i) => { const y = 252 + i * 46, a = fade(u, 0.3 + i * 0.35);
        card(300, y + 17, 96, 32, { rx: 6, text: f, fs: 13.5, mono: true, fill: f === 'DATA' ? ACCBG : SOFT, stroke: f === 'DATA' ? ACC : GRID, color: f === 'DATA' ? ACC : INK, op: a });
        if (s) mono(362, y + 22, s, { 'font-size': 13.5, opacity: a, fill: i === 2 ? WARN : INK, 'font-weight': i === 2 ? 700 : 400 });
        else { bytes(362, y + 3, ['00', '00', '00', '00', '16'], a * 5, { tags: [0], lens: [1, 2, 3, 4], w: 26 }); mono(520, y + 22, '+ protobuf 22바이트', { 'font-size': 13.5, opacity: a, fill: ACC }); } });
      grow(165, 105, 770, 128, seg(u, 1.4, 2.2), BAD, { dash: '7 6', plain: true });
      if (u > 2.2) cross(470, 117, 13, pop(u, 2.2));
      tx(470, 160, 'fetch 는 이 프레임을 못 만들고 트레일러도 못 읽는다', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.3) });
      return; }
    if (k <= 2) {
      const gs = k === 1 ? pop(u, 0.2) : 1;
      card(470, 220, 210, 74, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.5, s: gs, text: 'grpc-gateway\nREST 리버스 프록시', fs: 15, color: ACC });
      if (k === 1) el('line', { x1: 175, y1: 290, x2: 365, y2: 232, stroke: GRID, 'stroke-width': 2.5 }); el('line', { x1: 575, y1: 205, x2: 792, y2: 140, stroke: GRID, 'stroke-width': 2.5 });
      if (k === 1) { fly(175, 290, 365, 232, seg(u, 0.7, 1.6), 'POST /v1/users  JSON', { mono: true });
        dot([[575, 205], [792, 140]], seg(u, 1.7, 2.5), ACC, 7); mono(690, 196, 'gRPC', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) });
        sub(470, 280, '클라이언트는 JSON 만 안다', fade(u, 1.2)); return; }
      // k2: 두 방향 변환 — 실제 바이트
      mono(230, 236, '요청', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(690, 196, 'gRPC', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      zone(40, 296, 880, 116, null, { fill: SOFT });
      mono(56, 322, 'JSON 40B', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      mono(56, 348, JSON_REQ, { 'font-size': 14, opacity: fade(u, 0.3) });
      grow(420, 340, 500, 340, seg(u, 0.7, 1.1), ACC);
      mono(510, 322, 'protobuf 22B', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      bytes(510, 330, REQ, lerp(0, 22, E(u, 1.0, 2.0)), Object.assign({ per: 13, w: 26 }, REQ_TAGS));
      tx(480, 404, '요청은 JSON → protobuf, 응답은 protobuf → JSON', { 'text-anchor': 'middle', 'font-size': 14, fill: INK, 'font-weight': 700, opacity: fade(u, 2.1) });
      return; }
    if (k === 3) {
      const L = ['syntax = "proto3";', 'package user.v1;', '', 'import "google/api/annotations.proto";'];
      const n = Math.ceil(lerp(0, 4, E(u, 0.2, 1.6)));
      snippet(120, 90, L.slice(0, n).concat(Array(4 - n).fill('')), { w: 520, fs: 16 });
      if (u > 1.6) { el('rect', { x: 126, y: 172, width: 508, height: 30, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 1.6) });
        grow(640, 187, 720, 187, seg(u, 1.8, 2.2), ACC); pill(800, 187, 'HTTP 매핑의 입구', ACC, pop(u, 2.1)); }
      sub(380, 250, 'REST 경로는 별도 설정 파일이 아니라 .proto 안에서 시작한다', fade(u, 2.2), { 'font-size': 14.5 });
      return; }
    if (k === 4) {
      card(250, 210, 380, 50, { rx: 8, text: 'rpc GetUser(GetUserRequest) returns (User);', mono: true, fs: 14, fill: SOFT, stroke: INK, s: pop(u, 0.2) });
      el('path', { d: `M440,210 C520,210 520,120 600,120`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': 400, 'stroke-dashoffset': 400 * (1 - E(u, 0.8, 1.6)) });
      el('path', { d: `M440,210 C520,210 520,300 600,300`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': 400, 'stroke-dashoffset': 400 * (1 - E(u, 1.1, 1.9)) });
      card(760, 120, 300, 62, { rx: 10, stroke: ACC, text: 'gRPC 스텁\nclient.GetUser(ctx, req)', fs: 14.5, s: pop(u, 1.5) });
      card(760, 300, 300, 62, { rx: 10, stroke: ACC, text: 'REST 핸들러 (*.pb.gw.go)\nGET 경로 → GetUser', fs: 14.5, s: pop(u, 1.9) });
      tx(250, 268, '정의는 한 곳뿐', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.3) });
      return; }
    if (k === 5) {
      const lane = (y, name, items, a0) => { tx(40, y - 40, name, { 'font-size': 15, 'font-weight': 800, fill: INK, opacity: fade(u, a0) });
        items.forEach(([x, s, hot], i) => { const a = pop(u, a0 + 0.15 + i * 0.25); card(x, y, 190, 48, { rx: 8, text: s, fs: 14, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, color: hot ? ACC : INK, s: a });
          if (i) grow(items[i - 1][0] + 96, y, x - 98, y, seg(u, a0 + 0.2 + i * 0.25, a0 + 0.5 + i * 0.25), MUT); }); };
      lane(130, 'grpc-gateway  (변환이 서버 쪽에)', [[150, 'curl · 아무 HTTP', false], [470, '게이트웨이 프록시', true], [800, 'gRPC 서버', false]], 0.1);
      mono(305, 120, 'JSON', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      lane(320, 'gRPC-Web  (스텁이 브라우저 쪽에)', [[150, 'grpc-web JS 스텁', true], [470, 'Envoy 프록시', false], [800, 'gRPC 서버', false]], 1.2);
      mono(305, 310, 'gRPC 프레이밍', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      return; }
    // k6: 선택 기준
    [['아무 HTTP 클라이언트나 붙어야 한다', '외부 파트너 · curl · 대시보드', 'grpc-gateway'], ['우리 웹앱이 타입 안전하게 쓴다', '생성된 스텁 · server-stream', 'gRPC-Web']].forEach(([a, b, pick], i) => {
      const y = 120 + i * 150, s = pop(u, 0.2 + i * 0.6);
      card(330, y, 500, 92, { rx: 12, stroke: GRID, sw: 1.8, s });
      tx(100, y - 8, a, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.6) }); tx(100, y + 20, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.6) });
      grow(590, y, 660, y, seg(u, 0.6 + i * 0.6, 1.0 + i * 0.6), ACC);
      pill(770, y, pick, ACC, pop(u, 0.9 + i * 0.6), { fs: 16 }); }); }

  // ───────── 2. google.api.http
  function reqBar(y, method, path, s) { pill(70, y, method, ACC, s, { mono: true, fs: 15, fill: ACCBG }); mono(70 + tw(method, 15) / 2 + 26, y + 5, path, { 'font-size': 17, 'font-weight': 700, opacity: s }); }
  function msg(x, y, name, rows, o) { o = o || {}; const w = o.w || 300, rh = 34, a = o.op ?? 1;
    el('rect', { x, y, width: w, height: 38 + rows.length * rh, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: a });
    mono(x + 14, y + 25, 'message ' + name, { 'font-size': 14.5, 'font-weight': 700, fill: o.stroke || INK, opacity: a });
    rows.forEach(([f, v, on], i) => { const yy = y + 38 + i * rh;
      mono(x + 14, yy + 22, f, { 'font-size': 14, fill: MUT, opacity: a });
      el('rect', { x: x + w - 130, y: yy + 4, width: 116, height: 26, rx: 5, fill: on ? ACCBG : SOFT, stroke: on ? ACC : GRID, 'stroke-width': 1.4, opacity: a });
      if (v != null) mono(x + w - 72, yy + 22, v, { 'font-size': 13.5, 'text-anchor': 'middle', fill: on ? ACC : MUT, 'font-weight': 700, opacity: a * (on ? on : 1) }); });
    return (i) => [x + w - 130, y + 38 + i * rh + 17]; }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) {
      snippet(60, 70, ['import "google/api/annotations.proto";', '', 'service UserService {', '  ...', '}'].slice(0, Math.ceil(lerp(0, 5, E(u, 0.2, 1.4)))), { w: 440, fs: 16 });
      card(720, 120, 300, 60, { rx: 10, text: 'option (google.api.http)', mono: true, fs: 15, stroke: GOOD, s: pop(u, 1.5) }); check(560, 120, 12, pop(u, 1.6));
      card(720, 260, 300, 60, { rx: 10, text: 'import 를 빼면\nprotoc 단계에서 실패', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 2.0), dash: '6 5' });
      return; }
    if (k === 1) {
      reqBar(60, 'GET', '/v1/users/u-42', pop(u, 0.2));
      snippet(40, 110, ['rpc GetUser(GetUserRequest) returns (User) {', '  option (google.api.http) = {', '    get: "/v1/users/{user_id}"', '  };', '}'], { fs: 14.5, op: fade(u, 0.4) });
      const at = msg(560, 200, 'GetUserRequest', [['string user_id = 1', u > 1.9 ? '"u-42"' : '', E(u, 1.9, 2.3)]], { op: fade(u, 0.8) });
      const [fx, fy] = at(0); fly(232, 94, fx + 58, fy, seg(u, 1.0, 1.9), 'u-42', { mono: true });
      el('rect', { x: 206, y: 46, width: 52, height: 28, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.9) });
      return; }
    if (k === 2) {
      reqBar(60, 'POST', '/v1/users', pop(u, 0.2));
      card(250, 140, 400, 46, { rx: 8, text: JSON_REQ, mono: true, fs: 14, fill: SOFT, stroke: GRID, s: pop(u, 0.5) }); sub(250, 182, '요청 바디 전체', fade(u, 0.6));
      snippet(40, 240, ['post: "/v1/users"', 'body: "*"'], { fs: 15, op: fade(u, 0.8) });
      el('rect', { x: 50, y: 277, width: 120, height: 24, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.0) });
      const v = E(u, 1.6, 2.2);
      msg(580, 120, 'CreateUserRequest', [['string name = 1', v > 0.5 ? '"Alice"' : '', v], ['string email = 2', v > 0.5 ? '"alice@…"' : '', v]], { op: fade(u, 0.9) });
      el('path', { d: 'M452,140 C520,140 520,175 578,175', fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': 200, 'stroke-dashoffset': 200 * (1 - E(u, 1.1, 1.7)), 'marker-end': u > 1.7 ? 'url(#ra-ahb)' : null });
      return; }
    if (k === 3) {
      reqBar(60, 'PATCH', '/v1/users/u-42', pop(u, 0.2));
      card(230, 140, 300, 44, { rx: 8, text: '{"name":"Alice B"}', mono: true, fs: 14, fill: SOFT, stroke: GRID, s: pop(u, 0.4) }); sub(230, 180, 'body: "user" → user 필드로만', fade(u, 0.5));
      snippet(40, 240, ['patch: "/v1/users/{user.id}"', 'body: "user"'], { fs: 15, op: fade(u, 0.6) });
      el('rect', { x: 540, y: 100, width: 380, height: 270, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.7) });
      mono(556, 126, 'message UpdateUserRequest', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.7) });
      mono(556, 156, 'User user = 1', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.7) });
      const a = E(u, 1.3, 1.7), b = E(u, 1.9, 2.3);
      const at = msg(570, 172, 'User', [['string id = 1', a > 0.5 ? '"u-42"' : '', a], ['string name = 2', b > 0.5 ? '"Alice B"' : '', b], ['string email = 3', '', 0]], { w: 330 });
      fly(232, 94, at(0)[0] + 58, at(0)[1], seg(u, 0.8, 1.4), 'u-42', { mono: true });
      fly(392, 150, at(1)[0] + 58, at(1)[1], seg(u, 1.4, 2.0), 'Alice B', { mono: true });
      return; }
    if (k === 4) {
      reqBar(80, 'GET', '/v1/users', pop(u, 0.2));
      reqBar(300, 'GET', '/v1/orgs/acme/users', pop(u, 1.0));
      sub(170, 340, 'additional_bindings', fade(u, 1.1), { 'font-size': 14, fill: ACC, 'text-anchor': 'start' });
      card(720, 190, 280, 70, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.5, text: 'rpc ListUsers', mono: true, fs: 16, color: ACC, s: pop(u, 0.4) });
      el('path', { d: 'M260,80 C450,80 480,175 578,180', fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': 400, 'stroke-dashoffset': 400 * (1 - E(u, 0.6, 1.2)), 'marker-end': u > 1.2 ? 'url(#ra-ahb)' : null });
      el('path', { d: 'M360,300 C480,300 500,210 578,202', fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': 400, 'stroke-dashoffset': 400 * (1 - E(u, 1.4, 2.0)), 'marker-end': u > 2.0 ? 'url(#ra-ahb)' : null });
      tx(720, 260, '경로 둘, RPC 하나', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      return; }
    if (k === 5) {
      pill(70, 60, 'GET', ACC, 1, { mono: true, fs: 15, fill: ACCBG });
      spans(120, 66, [['/v1/orgs/', {}], ['acme', { fill: ACC, 'font-weight': 700 }], ['/users?', {}], ['page_size=20', { fill: WARN, 'font-weight': 700 }], ['&', {}], ['page_token=t9', { fill: WARN, 'font-weight': 700 }]], { 'font-size': 17 });
      const a = E(u, 0.9, 1.3), b = E(u, 1.5, 1.9), d = E(u, 2.0, 2.4);
      const at = msg(520, 150, 'ListUsersRequest', [['string org_id = 1', a > 0.5 ? '"acme"' : '', a], ['int32 page_size = 2', b > 0.5 ? '20' : '', b], ['string page_token = 3', d > 0.5 ? '"t9"' : '', d]], { w: 380 });
      fly(232, 94, at(0)[0] + 58, at(0)[1], seg(u, 0.3, 0.9), 'acme', { mono: true });
      fly(435, 94, at(1)[0] + 58, at(1)[1], seg(u, 0.9, 1.5), '20', { mono: true, fill: WARN });
      fly(578, 94, at(2)[0] + 58, at(2)[1], seg(u, 1.4, 2.0), 't9', { mono: true, fill: WARN });
      [['경로 변수', ACC], ['쿼리스트링', WARN]].forEach(([s, col], i) => { el('rect', { x: 60, y: 180 + i * 40, width: 18, height: 18, rx: 4, fill: col, opacity: fade(u, 0.4 + i * 0.6) }); tx(90, 195 + i * 40, s, { 'font-size': 15, opacity: fade(u, 0.4 + i * 0.6) }); });
      sub(240, 300, '경로·바디에 없는 필드는 쿼리로 채워진다', fade(u, 2.3), { 'font-size': 14.5 });
      return; }
    // k6: 응답 User → JSON
    const v = E(u, 0.3, 1.0);
    msg(60, 100, 'User', [['string id = 1', '"u-42"', v], ['string name = 2', '"Alice"', v], ['string email = 3', '"alice@…"', v]], { w: 330 });
    grow(410, 175, 500, 175, seg(u, 1.0, 1.4), ACC);
    card(700, 175, 380, 120, { rx: 10, fill: SOFT, stroke: ACC, s: pop(u, 1.4) });
    ['{', '  "id": "u-42",', '  "name": "Alice",', '  "email": "alice@acme.io"', '}'].forEach((s, i) => mono(528, 130 + i * 21, s, { 'font-size': 14.5, opacity: fade(u, 1.5 + i * 0.1) }));
    tx(480, 330, 'JSON 이름은 protojson 규칙: user_id → "userId"', { 'text-anchor': 'middle', 'font-size': 15, fill: INK, 'font-weight': 700, opacity: fade(u, 2.1) });
    sub(480, 356, '받을 때는 "user_id" 와 "userId" 둘 다 받는다', fade(u, 2.3), { 'font-size': 14 }); }
  const spans = R.spans;

  // ───────── 3. 코드 생성 + 게이트웨이 등록
  function s3(t, c) { const { k, u } = c;
    if (k === 0) {
      card(220, 200, 280, 200, { rx: 10, fill: PANEL, stroke: INK, sw: 2 }); mono(100, 125, 'gateway_main.go', { 'font-size': 15, 'font-weight': 700 });
      ['import (', '  ".../grpc-gateway/v2/runtime"', '  "google.golang.org/grpc"', '  gw "example.com/user/v1"', ')'].forEach((s, i) => mono(100, 160 + i * 24, s, { 'font-size': 13.5, fill: i === 1 || i === 3 ? ACC : INK, opacity: fade(u, 0.2 + i * 0.15) }));
      [['user_service.pb.go', false], ['user_service_grpc.pb.go', false], ['user_service.pb.gw.go', true]].forEach(([n, hot], i) => file(720, 120 + i * 70, n, { w: 290, stroke: hot ? ACC : INK, s: pop(u, 0.4 + i * 0.25) }));
      sub(720, 340, 'protoc 가 이미 만들어 둔 파일', fade(u, 1.2), { 'font-size': 14 });
      el('path', { d: 'M575,260 C470,260 420,240 362,232', fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': 300, 'stroke-dashoffset': 300 * (1 - E(u, 1.5, 2.3)), 'marker-end': u > 2.3 ? 'url(#ra-ahb)' : null });
      return; }
    if (k === 1) {
      file(110, 210, 'user.proto', { w: 150, s: pop(u, 0.1) });
      card(320, 210, 120, 60, { rx: 10, fill: INK, stroke: 'none', text: 'protoc', color: PANEL, mono: true, fs: 16, s: pop(u, 0.2) }); grow(186, 210, 258, 210, seg(u, 0.2, 0.4), MUT);
      const outs = [['go', 'user_service.pb.go', '메시지 구조체'], ['go-grpc', 'user_service_grpc.pb.go', 'gRPC 스텁'], ['grpc-gateway', 'user_service.pb.gw.go', 'REST 프록시'], ['openapiv2', 'user_service.swagger.json', 'OpenAPI 문서']];
      outs.forEach(([pl, f, what], i) => { const y = 70 + i * 92, a = 0.5 + i * 0.45, hot = i >= 2, col = hot ? ACC : MUT;
        el('path', { d: `M380,210 C430,210 440,${y} 490,${y}`, fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': 300, 'stroke-dashoffset': 300 * (1 - E(u, a, a + 0.4)) });
        mono(500, y - 12, pl, { 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: fade(u, a + 0.3) });
        file(660, y + 14, f, { w: 300, stroke: hot ? ACC : INK, s: pop(u, a + 0.35) });
        tx(822, y + 19, what, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: fade(u, a + 0.4) }); });
      return; }
    // k2~k5: mux 를 가운데 두고 이어 간다
    const reg = k >= 4;
    if (k === 6) {
      [['(A) 별도 프로세스', 230, 1], ['(B) 같은 프로세스', 700, 0]].forEach(([name, cx, hop], i) => { const a = pop(u, 0.2 + i * 0.8);
        zone(cx - 200, 70, 400, 240, name, { fill: SOFT, op: fade(u, 0.1 + i * 0.8) });
        if (hop) { card(cx - 90, 190, 130, 60, { rx: 8, text: 'gateway\n:8080', fs: 14, s: a }); card(cx + 100, 190, 130, 60, { rx: 8, text: 'gRPC\n:50051', fs: 14, s: a });
          grow(cx - 24, 190, cx + 34, 190, seg(u, 0.6, 1.0), ACC); dot([[cx - 24, 190], [cx + 34, 190]], (t * 0.7) % 1, ACC, 5); }
        else { card(cx, 190, 300, 80, { rx: 10, stroke: ACC, fill: ACCBG, text: 'gateway + gRPC 한 바이너리\nRegister…HandlerServer', fs: 14, color: INK, s: a }); }
        mono(cx, 350, hop ? '네트워크 홉 1' : '네트워크 홉 0', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: hop ? WARN : GOOD, opacity: fade(u, 0.8 + i * 0.8) });
        sub(cx, 380, hop ? '배포·확장이 따로, 지연 조금 늘어남' : '지연 최소, 한 프로세스로 묶임', fade(u, 1.0 + i * 0.8), { 'font-size': 14 }); });
      return; }
    // mux 와 라우트 표
    card(380, 200, 280, 200, { rx: 12, stroke: ACC, fill: PANEL, sw: 2.5, s: k === 2 ? pop(u, 0.2) : 1 });
    mono(260, 124, 'runtime.ServeMux', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 2 ? fade(u, 0.3) : 1 });
    const routes = [['GET', '/v1/users/{user_id}'], ['POST', '/v1/users'], ['PATCH', '/v1/users/{user.id}'], ['GET', '/v1/users']];
    routes.forEach(([m, p], i) => { const y = 154 + i * 36, a = reg ? (k === 4 ? fade(u, 0.3 + i * 0.25) : 1) : 0;
      el('rect', { x: 254, y: y - 4, width: 252, height: 28, rx: 5, fill: a ? ACCBG : SOFT, stroke: GRID, 'stroke-width': 1 });
      if (a) { mono(262, y + 15, m, { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: a }); mono(316, y + 15, p, { 'font-size': 13.5, opacity: a }); } });
    if (!reg) mono(380, 240, '(경로 없음)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
    server(820, 200, 'gRPC :50051', { lamp: reg ? GOOD : OFF });
    if (k === 2) { dot([[40, 200], [238, 200]], seg(u, 0.8, 1.6), INK, 7); mono(60, 186, 'HTTP 요청', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      pill(380, 340, 'JSON 마샬링 담당', ACC, pop(u, 1.8)); return; }
    const solid = k >= 4;
    el('line', { x1: 522, y1: 200, x2: 762, y2: 200, stroke: solid ? ACC : MUT, 'stroke-width': solid ? 3 : 2.2, 'stroke-dasharray': solid ? null : '7 6', opacity: k === 3 ? fade(u, 0.3) : 1 });
    if (k === 3) { lock(640, 168, false, WARN, pop(u, 0.8)); pill(640, 250, 'insecure · 내부망 전제', WARN, pop(u, 1.3)); return; }
    if (k === 4) { dot([[522, 200], [762, 200]], seg(u, 1.6, 2.4), ACC, 7); mono(640, 186, 'localhost:50051', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.4) }); return; }
    // k5: 바깥은 :8080 만
    el('line', { x1: 150, y1: 50, x2: 150, y2: 400, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '8 6', opacity: fade(u, 0.2) });
    tx(75, 70, '바깥', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }); tx(195, 70, '내부망', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    pill(380, 320, ':8080 REST', GOOD, pop(u, 0.5), { mono: true });
    dot([[40, 200], [238, 200]], seg(u, 0.6, 1.3), GOOD, 7); check(195, 230, 10, pop(u, 1.2));
    dot([[40, 360], [150, 360]], seg(u, 1.4, 2.0), BAD, 7); cross(150, 360, 12, pop(u, 2.0)); mono(200, 366, ':50051 은 막힘', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // ───────── 4. 요청 흐름 — JSON 이 protobuf 로
  const STAGES = [['curl', 70], ['① 라우팅', 255], ['② 디코드', 445], ['③ gRPC 호출', 640], ['④ 인코드', 845]];
  function pipe(on, u, k) { STAGES.forEach(([s, x], i) => { const hot = i === on;
      card(x, 44, i ? 160 : 100, 40, { rx: 20, text: s, fs: 14.5, stroke: hot ? ACC : GRID, fill: hot ? ACCBG : PANEL, color: hot ? ACC : i < on ? INK : MUT, sw: hot ? 2.5 : 1.5 });
      if (i) el('line', { x1: STAGES[i - 1][1] + (i === 1 ? 52 : 82), y1: 44, x2: x - 82, y2: 44, stroke: i <= on ? ACC : GRID, 'stroke-width': 2 }); }); }
  function s4(t, c) { const { k, u } = c;
    const on = [0, 0, 1, 2, 3, 4, 4, 4, 4][k]; pipe(on, u, k);
    if (k === 0) { terminal(60, 100, 840, 200, ['$ curl -X POST http://localhost:8080/v1/users \\', '    -H "Content-Type: application/json" \\', '    -H "Authorization: Bearer eyJhbGc..." \\', '    -d \'{"name":"Alice","email":"alice@acme.io"}\''], lerp(0, 4, E(u, 0.2, 2.0)), { fs: 15, lh: 30, title: 'REST 클라이언트' });
      sub(480, 340, 'gRPC 라는 사실을 모르는 평범한 POST', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 1) { card(480, 190, 520, 130, { rx: 12, fill: SOFT, stroke: GRID, s: pop(u, 0.2) });
      ['{', '  "name": "Alice",', '  "email": "alice@acme.io"', '}'].forEach((s, i) => mono(250, 150 + i * 26, s, { 'font-size': 17, opacity: fade(u, 0.4 + i * 0.2) }));
      mono(720, 150, '40 바이트', { 'font-size': 15, fill: MUT, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      tx(480, 310, 'name · email 이 곧 메시지 필드 이름이 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { const rows = [['GET', '/v1/users/{user_id}', 'GetUser'], ['POST', '/v1/users', 'CreateUser'], ['PATCH', '/v1/users/{user.id}', 'UpdateUser'], ['GET', '/v1/users', 'ListUsers']];
      const scan = Math.min(1, Math.floor(lerp(0, 2, E(u, 0.3, 1.4))));
      rows.forEach(([m, p, r], i) => { const y = 120 + i * 50, hit = i === 1 && u > 1.4, cur = i === scan && u < 1.4;
        el('rect', { x: 150, y, width: 660, height: 40, rx: 8, fill: hit ? ACCBG : PANEL, stroke: hit ? ACC : cur ? INK : GRID, 'stroke-width': hit ? 2.5 : 1.5 });
        mono(170, y + 26, m, { 'font-size': 15, 'font-weight': 700, fill: hit ? ACC : MUT }); mono(250, y + 26, p, { 'font-size': 15 });
        mono(790, y + 26, '→ ' + r, { 'font-size': 15, 'text-anchor': 'end', fill: hit ? ACC : MUT, 'font-weight': hit ? 700 : 400 }); });
      pill(480, 350, 'body: "*" → 바디 전체가 CreateUserRequest', ACC, pop(u, 1.9)); return; }
    if (k === 3) { mono(60, 120, JSON_REQ, { 'font-size': 14.5, opacity: fade(u, 0.1) }); mono(60, 100, 'JSON 40B', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      grow(440, 140, 440, 170, seg(u, 0.3, 0.6), ACC);
      mono(60, 190, 'CreateUserRequest 22B', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
      bytes(60, 200, REQ, lerp(0, 22, E(u, 0.6, 1.6)), Object.assign({ per: 22, w: 30 }, REQ_TAGS));
      mono(60, 258, '0a = 필드 1 × 8 + 2(길이형)   12 = 필드 2 × 8 + 2', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.6) });
      el('line', { x1: 40, y1: 290, x2: 920, y2: 290, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.7) });
      mono(60, 330, 'Authorization: Bearer eyJhbGc...', { 'font-size': 15, opacity: fade(u, 1.8) }); grow(400, 325, 470, 325, seg(u, 2.0, 2.3), ACC);
      mono(490, 330, 'metadata  authorization: Bearer …', { 'font-size': 15, fill: ACC, opacity: fade(u, 2.2) });
      sub(480, 372, 'HTTP 헤더는 gRPC metadata 로 넘어간다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 4) { card(200, 220, 200, 90, { rx: 12, stroke: ACC, fill: ACCBG, text: 'grpc-gateway', fs: 16, color: ACC }); server(780, 210, 'gRPC 서버 :50051', { lamp: GOOD });
      el('line', { x1: 300, y1: 220, x2: 718, y2: 210, stroke: GRID, 'stroke-width': 3 });
      fly(300, 190, 700, 182, seg(u, 0.3, 1.2), 'HEADERS :path …/CreateUser', { mono: true, fill: INK });
      fly(300, 230, 700, 222, seg(u, 0.9, 1.8), 'DATA 00 00000016 + 22B', { mono: true });
      mono(490, 290, 'HTTP/2 스트림 하나 = RPC 하나', { 'font-size': 15, 'text-anchor': 'middle', fill: INK, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(780, 300, 'REST 가 있는지 모른다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 5) { const rows = [['OK', 0, 200], ['INVALID_ARGUMENT', 3, 400], ['NOT_FOUND', 5, 404], ['PERMISSION_DENIED', 7, 403], ['UNAUTHENTICATED', 16, 401]];
      tx(250, 100, 'gRPC status', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }); tx(720, 100, 'HTTP status', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
      rows.forEach(([n, code, http], i) => { const y = 130 + i * 52, a = 0.2 + i * 0.4, ok = code === 0;
        card(250, y, 300, 40, { rx: 8, text: `${n} (${code})`, mono: true, fs: 15, stroke: ok ? GOOD : GRID, s: pop(u, a) });
        grow(402, y, 660, y, seg(u, a + 0.2, a + 0.5), ok ? GOOD : MUT);
        card(720, y, 110, 40, { rx: 8, text: String(http), mono: true, fs: 17, stroke: ok ? GOOD : WARN, color: ok ? GOOD : WARN, s: pop(u, a + 0.45) }); }); return; }
    if (k === 6) { mono(60, 110, 'User 28B', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      bytes(60, 120, USER, 28, Object.assign({ per: 14, w: 30 }, USER_TAGS));
      grow(260, 200, 260, 240, seg(u, 0.4, 0.8), ACC);
      card(480, 300, 440, 100, { rx: 10, fill: SOFT, stroke: GOOD, s: pop(u, 0.9) });
      ['{"id": "u-42", "name": "Alice",', ' "email": "alice@acme.io"}'].forEach((s, i) => mono(280, 292 + i * 24, s, { 'font-size': 15, opacity: fade(u, 1.1 + i * 0.2) }));
      pill(800, 300, 'HTTP 200', GOOD, pop(u, 1.8), { mono: true, fs: 16 });
      mono(560, 160, '1a = 필드 3 (email)', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.3) }); return; }
    if (k === 7) { card(220, 170, 320, 120, { rx: 10, stroke: BAD, fill: C.BADBG, s: pop(u, 0.2) });
      mono(80, 150, 'gRPC 트레일러', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(80, 178, 'grpc-status: 5', { 'font-size': 15, fill: BAD, 'font-weight': 700 }); mono(80, 204, 'grpc-message: user u-99 not found', { 'font-size': 13.5, fill: BAD });
      grow(385, 170, 470, 170, seg(u, 0.7, 1.1), BAD);
      card(700, 170, 420, 160, { rx: 10, fill: SOFT, stroke: BAD, s: pop(u, 1.1) });
      ['HTTP/1.1 404 Not Found', '{', '  "code": 5,', '  "message": "user u-99 not found",', '  "details": []', '}'].forEach((s, i) => mono(506, 112 + i * 23, s, { 'font-size': 14, fill: i === 0 ? BAD : INK, 'font-weight': i === 0 ? 700 : 400, opacity: fade(u, 1.3 + i * 0.12) }));
      sub(480, 320, '에러 본문 모양은 WithErrorHandler 로 바꿀 수 있다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k8: 스트리밍
    tx(60, 110, 'server-streaming', { 'font-size': 16, 'font-weight': 700 }); pill(380, 104, '줄 단위 JSON', GOOD, pop(u, 0.2));
    [0, 1, 2].forEach((i) => { const a = fade(u, 0.4 + i * 0.4); mono(80, 150 + i * 28, '{"result": {"id": "u-' + (41 + i) + '", …}}', { 'font-size': 15, opacity: a }); dot([[640, 150 + i * 28], [480, 150 + i * 28]], seg(u, 0.3 + i * 0.4, 0.7 + i * 0.4), GOOD, 5); });
    el('line', { x1: 40, y1: 250, x2: 920, y2: 250, stroke: GRID, 'stroke-width': 1.5 });
    tx(60, 290, 'client · bidi streaming', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) });
    tx(60, 320, '같은 방식으로 흉내만 낸다. 보통의 HTTP 클라이언트는 요청을 다 보낸 뒤에 응답을 읽는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) });
    pill(660, 360, '양방향이 필요하면 gRPC 로', WARN, pop(u, 2.1)); }

  // ───────── 5. OpenAPI + 정리
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { snippet(60, 90, ['plugins:', '  - name: go', '  - name: go-grpc', '  - name: grpc-gateway', '  - name: openapiv2'].slice(0, 4).concat(u > 0.6 ? ['  - name: openapiv2'] : []), { w: 330, fs: 16 });
      if (u > 0.6) el('rect', { x: 66, y: 196, width: 318, height: 26, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.6) });
      grow(400, 210, 540, 210, seg(u, 1.0, 1.5), ACC);
      file(700, 210, 'user_service.swagger.json', { w: 300, stroke: ACC, s: pop(u, 1.5) });
      sub(700, 260, 'OpenAPI v2 · Swagger UI 로 바로 시험 호출', fade(u, 1.9), { 'font-size': 14 }); return; }
    if (k === 1 || k === 2) {
      const node = (x, y, s, a, col) => { card(x + tw(s, 14) / 2 + 14, y, tw(s, 14) + 28, 32, { rx: 6, text: s, mono: true, fs: 14, stroke: col || INK, color: col || INK, s: a }); };
      const br = (x1, y1, x2, y2, a) => el('path', { d: `M${x1},${y1} V${y2} H${x2}`, fill: 'none', stroke: MUT, 'stroke-width': 1.8, 'stroke-dasharray': 300, 'stroke-dashoffset': 300 * (1 - a) });
      const a = (s) => (k === 1 ? E(u, s, s + 0.4) : 1);
      node(40, 70, 'paths', 1); br(60, 86, 90, 120, a(0.2)); node(90, 120, '"/v1/users/{user_id}"', a(0.4), ACC);
      br(110, 136, 140, 170, a(0.7)); node(140, 170, 'get', a(0.9));
      br(160, 186, 190, 214, a(1.0)); node(190, 214, 'operationId: UserService_GetUser', a(1.2));
      br(160, 186, 190, 260, a(1.3)); node(190, 260, 'user_id · in: path · required: true', a(1.5), ACC);
      if (k === 1) { sub(700, 360, '경로 변수가 필수 path 파라미터로 적힌다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      br(160, 186, 190, 306, E(u, 0.2, 0.6)); node(190, 306, '200 → $ref #/definitions/v1User', E(u, 0.5, 0.9), ACC);
      card(780, 210, 250, 150, { rx: 10, stroke: ACC, s: pop(u, 1.1) }); mono(670, 160, 'v1User', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      ['id: string', 'name: string', 'email: string'].forEach((s, i) => mono(680, 196 + i * 30, s, { 'font-size': 14.5, opacity: fade(u, 1.3 + i * 0.15) }));
      el('path', { d: 'M520,306 C600,306 600,240 652,230', fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': 300, 'stroke-dashoffset': 300 * (1 - E(u, 0.9, 1.3)) });
      sub(780, 320, 'message User 가 그대로 스키마', fade(u, 1.9), { 'font-size': 14 });
      node(40, 380, '"/v1/users" → post: UserService_CreateUser', fade(u, 2.2)); return; }
    if (k === 3) { const pulse = (t * 0.6) % 1;
      file(170, 210, 'user_service.proto', { w: 230, stroke: ACC, s: pop(u, 0.1) });
      [['go · go-grpc', 'gRPC 스텁', 90], ['grpc-gateway', 'REST 프록시', 210], ['openapiv2', 'Swagger 문서', 330]].forEach(([pl, what, y], i) => { const a = 0.4 + i * 0.4;
        el('path', { d: `M290,210 C380,210 400,${y} 500,${y}`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': 300, 'stroke-dashoffset': 300 * (1 - E(u, a, a + 0.4)) });
        mono(510, y - 14, pl, { 'font-size': 13.5, fill: MUT, opacity: fade(u, a + 0.3) }); card(700, y + 6, 200, 44, { rx: 8, text: what, fs: 15, stroke: INK, s: pop(u, a + 0.35) });
        if (u > 1.8) dot([[290, 210], [380, (210 + y) / 2], [500, y]], pulse, ACC, 6); });
      pill(170, 290, '필드 하나 추가', WARN, pop(u, 1.7)); sub(700, 395, '하나 고치면 셋이 같이 바뀐다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4) {
      zone(30, 60, 440, 330, '① import 누락', { fill: SOFT, color: BAD });
      terminal(50, 100, 400, 140, [['$ protoc ... user_service.proto', null], ['google/api/annotations.proto:', '#fca5a5'], ['  File not found.', '#fca5a5']], lerp(0, 3, E(u, 0.2, 1.0)), { fs: 14, lh: 26 });
      sub(250, 280, 'buf.yaml deps 로 googleapis 를 받는다', fade(u, 1.0), { 'font-size': 14 });
      zone(490, 60, 440, 330, '② POST 인데 body 없음', { fill: SOFT, color: BAD });
      mono(510, 130, '{"name":"Alice", "email":"…"}', { 'font-size': 14.5, opacity: fade(u, 1.2) }); grow(700, 145, 700, 195, seg(u, 1.4, 1.8), BAD);
      card(710, 240, 380, 70, { rx: 8, stroke: BAD, s: pop(u, 1.8) });
      mono(530, 234, 'CreateUserRequest', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); mono(530, 258, 'name: ""   email: ""', { 'font-size': 15.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(710, 320, '에러 없이 빈 값이 들어온다', fade(u, 2.2), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 5) { const x0 = 120, W = 680;
      tx(40, 100, '요청 한 번의 시간', { 'font-size': 15, 'font-weight': 700 });
      [['클라이언트 → 게이트웨이', 0, 0.18, MUT], ['게이트웨이 변환 + 홉', 0.18, 0.42, WARN], ['gRPC 서버 처리', 0.42, 0.88, ACC], ['응답 변환', 0.88, 1, WARN]].forEach(([s, a, b, col], i) => {
        const g = E(u, 0.2 + i * 0.3, 0.6 + i * 0.3); el('rect', { x: x0 + a * W, y: 130, width: Math.max(1, (b - a) * W * g), height: 34, rx: 4, fill: col, opacity: 0.85 });
        tx(x0 + a * W + 4, 190 + (i % 2) * 22, s, { 'font-size': 13.5, fill: col === MUT ? INK : col, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.3) }); });
      sub(480, 260, '길이는 모양만 나타낸 것', fade(u, 1.5), { 'font-size': 13.5 });
      meters_(u); return; }
    // k6: 실무 결론
    el('line', { x1: 380, y1: 50, x2: 380, y2: 390, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': '8 6' });
    tx(190, 70, '바깥', { 'font-size': 16, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle' }); tx(670, 70, '내부', { 'font-size': 16, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle' });
    card(190, 160, 260, 60, { rx: 10, text: 'REST/JSON  :8080', fs: 15, stroke: ACC, s: pop(u, 0.2) }); card(190, 260, 260, 60, { rx: 10, text: 'Swagger UI · OpenAPI', fs: 15, stroke: ACC, s: pop(u, 0.5) });
    [['order', 560, 150], ['user', 780, 150], ['payment', 560, 280], ['stock', 780, 280]].forEach(([n, x, y], i) => server(x, y, n, { s: 0.7, op: fade(u, 0.8 + i * 0.15), lamp: GOOD }));
    grow(322, 160, 470, 160, seg(u, 1.4, 1.8), ACC); mono(670, 230, 'gRPC', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    pill(480, 380, '원본은 .proto 하나', INK, pop(u, 2.1), { fs: 15 }); }
  function meters_(u) {
    [['2xx', GOOD], ['4xx', WARN], ['5xx', BAD]].forEach(([n, col], i) => { const x = 180 + i * 220, a = fade(u, 1.7 + i * 0.2);
      card(x, 330, 180, 64, { rx: 10, stroke: col, op: a }); tx(x - 74, 318, n + ' 응답 비율', { 'font-size': 13.5, fill: MUT, opacity: a });
      mono(x - 74, 346, '감시', { 'font-size': 18, 'font-weight': 800, fill: col, opacity: a }); });
  }

  const quiz = [
    { q: '브라우저 fetch로 gRPC 서버를 바로 부를 수 없는 까닭은 무엇인가?',
      o: ['protobuf를 브라우저가 해석하지 못해서', 'HTTP/2 프레이밍을 고를 수 없고 응답 트레일러의 grpc-status를 읽지 못해서', 'gRPC 서버가 80번 포트를 쓰지 않아서'], a: 1,
      why: 'gRPC는 5바이트 길이 접두를 단 DATA 프레임과 트레일러로 끝나는 호출이다. fetch는 이 프레이밍을 만들지 못하고 트레일러도 내주지 않는다.' },
    { q: 'POST /v1/users에 body: "*" 를 지정하면 무엇이 일어나는가?',
      o: ['JSON 바디 전체가 CreateUserRequest 메시지로 들어간다', '경로의 변수만 메시지로 들어간다', '바디를 쿼리스트링으로 바꿔 보낸다'], a: 0,
      why: 'body: "*" 는 바디 전체를 요청 메시지에 매핑하라는 뜻이다. 그래서 name·email이 name = 1, email = 2 필드로 들어간다.' },
    { q: '게이트웨이를 띄울 때 외부에 열어 두는 포트로 알맞은 것은 무엇인가?',
      o: ['REST :8080과 gRPC :50051 둘 다', 'gRPC :50051만', 'REST :8080만'], a: 2,
      why: '바깥 클라이언트는 게이트웨이의 REST 포트로만 들어온다. gRPC :50051은 게이트웨이가 내부망에서 dial 하는 대상이라 열어 둘 이유가 없다.' },
    { q: 'gRPC 서버가 NOT_FOUND(5)를 돌려주면 게이트웨이는 무엇을 응답하는가?',
      o: ['HTTP 200과 빈 JSON', 'HTTP 404와 code·message·details를 담은 JSON', 'HTTP 500과 grpc-status 헤더'], a: 1,
      why: '게이트웨이는 gRPC status를 HTTP status로 바꾼다. NOT_FOUND는 404이고 본문은 {"code":5,"message":…,"details":[]} 모양이다.' },
    { q: '같은 .proto의 어노테이션에서 swagger.json까지 뽑을 때 얻는 이점은 무엇인가?',
      o: ['스텁·REST 프록시·문서가 한 원본에서 나와 서로 어긋나지 않는다', '문서를 손으로 고칠 수 있다', 'gRPC 호출이 더 빨라진다'], a: 0,
      why: 'go·go-grpc·grpc-gateway·openapiv2 플러그인이 모두 같은 user_service.proto를 읽는다. 하나를 고치면 셋이 같이 다시 생성된다.' },
  ];

  const summary = [
    '브라우저와 curl은 gRPC 프레임과 트레일러를 다루지 못해 서버를 바로 부를 수 없다.',
    'grpc-gateway는 서버 앞에서 JSON을 protobuf로 바꿔 넘기는 REST 프록시다.',
    '경로는 .proto의 google.api.http에 적고, {user_id}는 같은 이름 필드에, body "*"는 메시지 전체에 들어간다.',
    'gRPC status는 HTTP 코드로 바뀌어 NOT_FOUND(5)가 404로 나가고, 외부에는 :8080만 연다.',
  ];
  const review = [
    { q: 'POST /v1/users로 name·email을 보냈는데 서버에는 빈 값만 들어온다. 먼저 의심할 것은?',
      o: ['protojson이 camelCase를 못 읽어서', 'google.api.http에 body 지정이 빠져서', 'gRPC 서버의 포트가 달라서'], a: 1,
      why: 'body를 지정하지 않은 POST는 바디를 버리고 에러도 내지 않는다. body: "*" 를 넣으면 바디 전체가 CreateUserRequest로 들어간다.' },
    { q: '파트너사가 GET /v1/users/u-99를 불러 404를 받았다. gRPC 서버 로그에서 찾아야 할 상태 코드는?',
      o: ['NOT_FOUND(5)', 'PERMISSION_DENIED(7)', 'UNAVAILABLE(14)'], a: 0,
      why: '게이트웨이는 NOT_FOUND를 404로, PERMISSION_DENIED를 403으로 옮긴다. 404의 원래 이름은 NOT_FOUND다.' },
    { q: '사내 웹앱이 서버 스트리밍을 타입 안전하게 쓰고 싶고, 외부 파트너는 curl 로만 붙는다. 알맞은 조합은?',
      o: ['둘 다 grpc-gateway', '둘 다 gRPC-Web', '웹앱은 gRPC-Web, 파트너는 grpc-gateway'], a: 2,
      why: 'gRPC-Web은 브라우저에 생성된 스텁을 두어 타입과 server-stream을 쓴다. 아무 HTTP 클라이언트나 붙어야 하는 쪽은 게이트웨이의 REST가 맞다.' },
  ];

  R.page({ title: 'REST ↔ gRPC 브릿지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
