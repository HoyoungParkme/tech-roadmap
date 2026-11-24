/* I-1-2 RPC vs REST — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 왼쪽 REST(URL·동사·JSON) / 오른쪽 gRPC(stub·.proto·바이트), 호출 모양 타임라인, gateway 배치도.
 * 크기는 protobuf 7.36 실측: JSON(공백 제외) 69B, 같은 네 필드 protobuf 37B, GetUserRequest{user_id:"42"} = 0A 02 34 32. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, server, browser, person, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const PKW = /^(syntax|package|message|service|rpc|returns|string|int32|stream|import|option|get)$/;
  function ptoks(line) { const out = [], ci = line.indexOf('//'), code = ci >= 0 ? line.slice(0, ci) : line;
    code.split(/("[^"]*"?|\b\w+\b)/).forEach((w) => { if (!w) return;
      if (w[0] === '"') out.push([w, { fill: ACC }]); else if (PKW.test(w)) out.push([w, { fill: INFO, 'font-weight': 700 }]);
      else if (/^\d+$/.test(w)) out.push([w, { fill: WARN, 'font-weight': 700 }]); else out.push([w, {}]); });
    if (ci >= 0) out.push([line.slice(ci), { fill: MUT }]); return out; }
  const L = { x: 24, w: 446, cx: 247 }, Rr = { x: 490, w: 446, cx: 713 };
  function lanes(on) { zone(L.x, 20, L.w, 386, 'REST', { fill: on === 'rest' ? WARNBG : SOFT, color: WARN }); zone(Rr.x, 20, Rr.w, 386, 'gRPC', { fill: on === 'grpc' ? ACCBG : SOFT, color: ACC }); }

  // ---------- 1. 자원 vs 함수 ----------
  const VERBS = [['GET', '읽기'], ['POST', '생성'], ['PUT', '수정'], ['DELETE', '삭제']];
  const TASKS = ['경로 설계', '동사 선택', '상태코드 해석', 'JSON 파싱'];
  const TPOS = TASKS.map((_, i) => [140 + (i % 2) * 214, 286 + Math.floor(i / 2) * 50]);
  function restLane(k, u) {
    const verb = k === 1 ? VERBS[Math.floor(clamp((u - 0.6) / 0.5, 0, 3.99))][0] : 'GET';
    el('rect', { x: 44, y: 54, width: 406, height: 44, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: k === 0 ? fade(u, 0.1) : 1 });
    card(86, 76, 70, 30, { rx: 15, fill: WARN, stroke: 'none', text: verb, fs: 14, fw: 800, color: PANEL, mono: true, s: k === 0 ? pop(u, 0.3) : 1 });
    mono(132, 82, '/users/42', { 'font-size': 17, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.5) : 1 });
    const op = k === 0 ? fade(u, 1.0) : 1;
    card(150, 160, 116, 40, { rx: 8, stroke: WARN, text: '/users', fs: 15, mono: true, op });
    grow(208, 160, 280, 160, k === 0 ? E(u, 1.2, 1.5) : 1, WARN);
    card(340, 160, 110, 40, { rx: 8, stroke: WARN, fill: WARNBG, text: '42번', fs: 15, op: k === 0 ? fade(u, 1.5) : 1 });
    sub(L.cx, 210, 'URL이 자원(명사)을 가리킨다', k === 0 ? fade(u, 1.8) : 1);
    if (k === 1) { VERBS.forEach(([v, m], i) => { const x = 110 + i * 104, on = v === verb, s = pop(u, 0.2 + i * 0.12);
        card(x, 270, 90, 32, { rx: 16, stroke: on ? WARN : GRID, fill: on ? WARNBG : PANEL, sw: on ? 2.5 : 1.5, text: v, fs: 14, mono: true, fw: 800, s });
        tx(x, 308, m, { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 0.3 + i * 0.12) }); });
      sub(L.cx, 352, '같은 URL에 동사만 갈아 끼운다', fade(u, 2.2)); return; }
    if (k >= 2) { tx(L.x + 14, 262, '사람이 직접 할 일', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: k === 2 ? fade(u, 0.2) : 1 });
      TASKS.forEach((s, i) => { const [x, y] = TPOS[i], moved = k === 5 ? E(u, 0.3 + i * 0.2, 1.1 + i * 0.2) : 0;
        if (k === 5) { card(x, y, 190, 38, { rx: 8, stroke: GRID, text: moved > 0 && moved < 1 ? '' : s, fs: 15, color: OFF, dash: '5 4' }); el('line', { x1: x - 60, y1: y, x2: x + 60, y2: y, stroke: BAD, 'stroke-width': 2, opacity: moved });
          if (moved > 0 && moved < 1) card(lerp(x, 713, moved), lerp(y, 236, moved), 150, 30, { rx: 8, fill: ACC, stroke: 'none', text: s, fs: 14, color: PANEL }); }
        else card(x, y, 190, 38, { rx: 8, stroke: WARN, text: s, fs: 15, s: k === 2 ? pop(u, 0.4 + i * 0.3) : 1 }); }); } }
  function stubMachine(k, u) { const y = 236, xs = [598, 713, 828], names = ['직렬화', '전송', '역직렬화'];
    el('rect', { x: 524, y: y - 34, width: 378, height: 68, rx: 12, fill: PANEL, stroke: ACC, 'stroke-width': 2.5 });
    mono(536, y - 42, 'stub 안에서', { 'font-size': 13.5, fill: ACC, 'font-weight': 700 });
    names.forEach((s, i) => { const lit = k === 4 ? seg(u, 0.9 + i * 0.4, 1.1 + i * 0.4) > 0 : true;
      card(xs[i], y, 104, 40, { rx: 8, stroke: lit ? ACC : GRID, fill: lit ? ACCBG : PANEL, text: s, fs: 15, color: lit ? INK : MUT }); });
    if (k === 4) dot([[540, y + 26], [886, y + 26]], seg(u, 0.8, 2.1), ACC, 6); }
  function s1(t, c) { const { k, u } = c;
    lanes(k <= 2 ? 'rest' : 'grpc');
    restLane(k, u);
    if (k <= 2) { tx(Rr.cx, 210, '같은 일을 gRPC는?', { 'text-anchor': 'middle', 'font-size': 16, fill: OFF, 'font-weight': 700 }); return; }
    card(560, 76, 92, 38, { rx: 8, fill: INK, stroke: 'none', text: 'protoc', fs: 15, fw: 800, color: PANEL, mono: true });
    const f = k === 3 ? seg(u, 0.4, 1.3) : 1;
    if (f < 1) fly(600, 76, 800, 76, f, 'pb.UserServiceClient', { mono: true });
    else card(800, 76, 214, 36, { rx: 8, stroke: ACC, fill: ACCBG, text: 'pb.UserServiceClient', fs: 14.5, mono: true, fw: 700 });
    if (k === 3) { [['URL', 620], ['HTTP 동사', 790]].forEach(([s, x], i) => { pill(x, 160, s, BAD, pop(u, 1.4 + i * 0.25), { fs: 14 }); cross(x, 160, 12, pop(u, 1.7 + i * 0.25)); });
      sub(Rr.cx, 214, '호출하는 코드에 URL과 동사가 나오지 않는다', fade(u, 2.0)); return; }
    spans(512, 136, [['client.', {}], ['GetUser', { fill: ACC, 'font-weight': 700 }], ['(ctx,', {}]], { 'font-size': 15, opacity: k === 4 ? fade(u, 0.2) : 1 });
    mono(530, 160, '&GetUserRequest{UserId: "42"})', { 'font-size': 15, opacity: k === 4 ? fade(u, 0.4) : 1 });
    stubMachine(k, u);
    card(713, 318, 230, 38, { rx: 8, stroke: GOOD, fill: GOODBG, text: 'user.Name == "Alice"', fs: 15, mono: true, s: k === 4 ? pop(u, 2.2) : 1 });
    if (k === 5) banner(480, 384, '남는 것은 메서드 이름과 인자뿐', pop(u, 1.9)); }

  // ---------- 2. 계약: OpenAPI vs .proto ----------
  const YAML = ['openapi: 3.0.0', 'paths:', '  /users/{id}:', '    get:', '      summary: 사용자 조회', '      parameters:', '        - name: id', '          in: path', '          required: true',
    '          schema: { type: string }', '      responses:', '        "200":', '          description: OK', '          content:', '            application/json:', '              schema:',
    '                $ref: User', 'components:', '  schemas:', '    User:', '      type: object', '      properties:', '        id:   { type: string }', '        name: { type: string }'];
  const YSHOW = [1, 10, 17, 24, 24, 24, 24, 24], YKEY = { 0: 'openapi: 3.0.0', 2: '/users/{id} get', 5: 'parameters: id', 10: 'responses "200"', 16: '$ref User', 19: 'schemas: User', 23: 'name: string' };
  const PR = ['syntax = "proto3";', 'package user.v1;', 'service UserService {', '  rpc GetUser(GetUserRequest)', '      returns (User);', '}', 'message GetUserRequest {', '  string user_id = 1;', '}', 'message User {', '  string id   = 1;', '  string name = 2;', '}'];
  const PSHOW = [0, 0, 0, 0, 2, 6, 13, 13], PHI = [[], [], [], [], [0, 1], [2, 3, 4, 5], [6, 7, 8, 9, 10, 11, 12], []];
  function yamlDoc(k, u) { const n = Math.round(lerp(k > 0 ? YSHOW[k - 1] : 0, YSHOW[k], E(u, 0.2, 1.6)));
    el('rect', { x: 36, y: 34, width: 280, height: 366, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(50, 56, 'openapi.yaml', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); mono(304, 56, `${n}줄`, { 'font-size': 14, fill: WARN, 'font-weight': 800, 'text-anchor': 'end' });
    YAML.forEach((s, i) => { if (i >= n) return; const y = 72 + i * 13.4, ind = s.match(/^ */)[0].length, hot = k === 5 && i >= 2 && i <= 16;
      el('rect', { x: 50 + ind * 4, y, width: Math.min(120, (s.length - ind) * 4.4), height: 8, rx: 3, fill: hot ? ACC : YKEY[i] ? WARN : OFF, opacity: hot ? 0.9 : 0.75 });
      if (YKEY[i] && !(k === 5)) mono(186, y + 9, YKEY[i], { 'font-size': 13.5, fill: INK }); }); }
  function s2(t, c) { const { k, u } = c;
    zone(24, 20, 446, 386, 'REST 계약', { fill: k <= 3 ? WARNBG : SOFT, color: WARN }); zone(490, 20, 446, 386, 'gRPC 계약', { fill: k >= 4 ? ACCBG : SOFT, color: ACC });
    yamlDoc(k, u);
    // 서버 코드 상자: 문서와 따로 산다
    const sop = k === 0 ? fade(u, 1.2) : 1;
    el('rect', { x: 336, y: 150, width: 122, height: 112, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: sop });
    tx(397, 176, '서버 코드', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: sop });
    mono(350, 206, 'id', { 'font-size': 14, opacity: sop }); mono(350, 232, k === 3 ? 'username' : 'name', { 'font-size': 14, fill: k === 3 ? BAD : INK, 'font-weight': k === 3 ? 800 : 400, opacity: sop });
    tx(397, 290, '강제 연결 없음', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: sop });
    el('line', { x1: 318, y1: 206, x2: 334, y2: 206, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '3 4', opacity: sop });
    if (k === 3) { el('rect', { x: 182, y: 72 + 23 * 13.4 - 6, width: 120, height: 22, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.0) });
      cross(397, 320, 12, pop(u, 1.4)); tx(397, 352, 'name ≠ username', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, class: 'mono', opacity: fade(u, 1.5) });
      tx(397, 376, '(예) 아무도 모른다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.7) }); }
    if (k < 4) { tx(713, 210, '.proto 한 파일이면?', { 'text-anchor': 'middle', 'font-size': 16, fill: OFF, 'font-weight': 700 }); return; }
    const shown = lerp(PSHOW[k - 1], PSHOW[k], E(u, 0.2, 1.4));
    el('rect', { x: 506, y: 34, width: 414, height: 324, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(520, 56, 'user.proto', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    PR.forEach((s, i) => { if (i >= Math.ceil(shown)) return; const y = 84 + i * 21.5; if (PHI[k].includes(i)) el('rect', { x: 512, y: y - 15, width: 402, height: 20, rx: 4, fill: ACCBG });
      spans(524, y, ptoks(s), { 'font-size': 14.5, opacity: i >= Math.floor(shown) && shown % 1 ? shown % 1 : 1 }); });
    if (k === 5) { tx(713, 384, 'yaml 15줄이 하던 일을 rpc 한 줄이 한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 6) sub(713, 384, '필드 번호가 하위 호환의 열쇠', fade(u, 1.6), { 'font-weight': 700, fill: INK });
    if (k === 7) { [['서버 인터페이스', 610], ['클라이언트 stub', 816]].forEach(([s, x], i) => { const s2 = pop(u, 0.6 + i * 0.3);
        card(x, 384, 180, 34, { rx: 8, stroke: GOOD, fill: GOODBG, text: s, fs: 15, s: s2 }); });
      grow(713, 358, 640, 366, E(u, 0.3, 0.6), ACC); grow(713, 358, 790, 366, E(u, 0.3, 0.6), ACC);
      check(397, 326, 13, pop(u, 1.6)); tx(397, 360, '어긋나면 빌드가 깨진다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) }); } }

  // ---------- 3. 페이로드와 왕복 ----------
  const JS = '{"id":"42","name":"Alice","email":"alice@example.com","role":"admin"}';
  const KEYS = new Set(); (function () { let m; const re = /"(id|name|email|role)"/g; while ((m = re.exec(JS))) for (let i = m.index; i < m.index + m[0].length; i++) KEYS.add(i); })();
  function jsonRows(k, u) { const per = 35, w = 23, gap = 2, x0 = (960 - per * (w + gap) + gap) / 2, cnt = k === 0 ? Math.round(JS.length * E(u, 0.2, 2.0)) : JS.length;
    tx(x0, 34, 'JSON 응답', { 'font-size': 15, 'font-weight': 700 }); mono(x0 + per * (w + gap) - gap, 34, `${cnt} B`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: WARN });
    [...JS].forEach((ch, i) => { if (i >= cnt) return; const x = x0 + (i % per) * (w + gap), y = 44 + Math.floor(i / per) * 36, key = KEYS.has(i);
      el('rect', { x, y, width: w, height: 32, rx: 4, fill: key ? WARNBG : PANEL, stroke: GRID, 'stroke-width': 1.2 });
      mono(x + w / 2, y + 22, ch, { 'font-size': 14.5, 'text-anchor': 'middle', fill: key ? WARN : INK, 'font-weight': key ? 700 : 400 }); }); }
  const PIPE = { x1: 170, x2: 790, y: 318 };
  function pipe(label, col) { el('line', { x1: PIPE.x1, y1: PIPE.y - 16, x2: PIPE.x2, y2: PIPE.y - 16, stroke: col || INK, 'stroke-width': 2.5 }); el('line', { x1: PIPE.x1, y1: PIPE.y + 16, x2: PIPE.x2, y2: PIPE.y + 16, stroke: col || INK, 'stroke-width': 2.5 });
    person(100, PIPE.y + 4, '클라이언트', {}); server(860, PIPE.y - 6, '서버', { s: 0.8 }); if (label) tx((PIPE.x1 + PIPE.x2) / 2, PIPE.y + 44, label, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 600 }); }
  function s3(t, c) { const { k, u } = c;
    jsonRows(k, u);
    if (k === 0) { tx(480, 160, '키 "id" "name" "email" "role" = 23바이트', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) });
      sub(480, 188, '응답마다 키 문자열이 같이 나간다', fade(u, 2.3)); return; }
    if (k === 1) { [['키 문자열 반복', '응답마다 23바이트'], ['텍스트 파싱', '문자를 읽어 값으로'], ['HTTP/1.1', '한 연결에 한 번에 하나']].forEach(([a, b], i) => {
        const cx = 190 + i * 290, s = pop(u, 0.3 + i * 0.4); card(cx, 200, 250, 70, { rx: 10, stroke: WARN, sw: 2.5, s });
        tx(cx, 194, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.4 + i * 0.4) }); tx(cx, 220, b, { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 0.5 + i * 0.4) }); });
      sub(480, 290, '사람이 읽기 좋은 대신 매번 비용을 낸다', fade(u, 1.8)); return; }
    if (k === 6) { pipe('HTTP/1.1 연결', WARN);
      card(330, PIPE.y, 120, 26, { rx: 6, fill: WARN, stroke: 'none', text: 'A 응답 중', fs: 14, color: PANEL, s: pop(u, 0.2) });
      [['B', 0.6], ['C', 0.9]].forEach(([s, at], i) => { card(150 - 0 + i * 0, 250 - i * 36, 90, 28, { rx: 6, stroke: BAD, fill: BADBG, text: s + ' 대기', fs: 14, color: BAD, s: pop(u, at) }); });
      tx(480, 210, '앞 요청이 끝나야 뒤가 출발한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      sub(480, 236, 'Head-of-Line blocking', fade(u, 1.5)); return; }
    pipe(k >= 5 ? 'HTTP/2 커넥션 1개, 스트림 여러 개' : 'channel = 오래 쓰는 커넥션 1개', ACC);
    card(100, 252, 150, 32, { rx: 8, stroke: ACC, fill: ACCBG, text: 'UserServiceStub', fs: 14, mono: true, s: k === 2 ? pop(u, 0.6) : 1 });
    if (k === 2) { grow(PIPE.x1, PIPE.y, PIPE.x2, PIPE.y, E(u, 0.2, 1.0), ACC, { plain: true }); sub(480, 210, 'insecure_channel("localhost:50051")', fade(u, 1.2), { class: 'mono', 'font-size': 15, fill: INK }); return; }
    if (k === 3) { const f = seg(u, 0.3, 1.3), b = seg(u, 1.5, 2.4);
      if (f > 0 && f < 1) cells(lerp(PIPE.x1, PIPE.x2 - 160, E(f, 0, 1)), PIPE.y - 12, ['0A', '02', '34', '32'], { w: 34, h: 24, gap: 4, fs: 13.5, style: (i) => ({ fill: i ? PANEL : ACCBG, stroke: ACC }) });
      if (b > 0 && b < 1) fly(PIPE.x2 - 40, PIPE.y, PIPE.x1 + 40, PIPE.y, b, 'User', { fill: GOOD });
      tx(480, 200, 'GetUserRequest(user_id="42") = 0A 02 34 32', { 'text-anchor': 'middle', 'font-size': 16, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.4) });
      sub(480, 228, '응답은 타입 있는 객체로 돌아온다, 파싱 코드가 없다', fade(u, 2.0)); return; }
    if (k === 4) { const x = 260, max = 460, g = E(u, 0.3, 1.4);
      [['JSON', 69, WARN], ['protobuf', 37, ACC]].forEach(([nm, v, col], i) => { const y = 160 + i * 40;
        tx(x - 12, y + 18, nm, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x, y, width: max * v / 69 * g, height: 26, rx: 4, fill: col, opacity: 0.85 });
        mono(x + 10 + max * v / 69 * g, y + 19, v + ' B', { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.2) }); });
      sub(480, 266, '같은 네 필드, 키가 빠지고 태그 1바이트씩만 남는다', fade(u, 1.6)); return; }
    // k5: 다중 스트림
    [[ACC, 0], [INFO, 0.33], [WARN, 0.66]].forEach(([col, off], j) => { for (let i = 0; i < 3; i++) { const f = ((t * 0.5 + off / 3 + i / 3) % 1);
        el('rect', { x: lerp(PIPE.x1 + 10, PIPE.x2 - 40, f), y: PIPE.y - 10 + (j - 1) * 0, width: 30, height: 20, rx: 4, fill: col, opacity: 0.9 }); } });
    [['stream 1', ACC], ['stream 3', INFO], ['stream 5', WARN]].forEach(([s, col], i) => pill(330 + i * 150, 220, s, col, pop(u, 0.3 + i * 0.25), { mono: true, fs: 14 }));
    sub(480, 186, '호출마다 스트림 하나, 프레임이 섞여서 동시에 흐른다', fade(u, 1.2)); }

  // ---------- 4. 호출 모양과 브라우저 ----------
  const TL = { x0: 150, x1: 900, cy: 130, sy: 300 };
  function timeline(op) { el('line', { x1: TL.x0, y1: TL.cy, x2: TL.x1, y2: TL.cy, stroke: GRID, 'stroke-width': 3, opacity: op }); el('line', { x1: TL.x0, y1: TL.sy, x2: TL.x1, y2: TL.sy, stroke: GRID, 'stroke-width': 3, opacity: op });
    tx(TL.x0 - 16, TL.cy + 5, '클라', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, opacity: op }); tx(TL.x0 - 16, TL.sy + 5, '서버', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, opacity: op });
    tx(TL.x1, TL.sy + 30, '시간 →', { 'text-anchor': 'end', 'font-size': 13.5, fill: MUT, opacity: op }); }
  const down = (x, u, col, dx) => grow(x, TL.cy + 6, x + (dx ?? 30), TL.sy - 8, u, col || INK);
  const up = (x, u, col, dx) => grow(x, TL.sy - 6, x + (dx ?? 30), TL.cy + 8, u, col || ACC);
  function s4(t, c) { const { k, u } = c;
    if (k === 6) { const pts = [[90, 210], [330, 210], [600, 210], [860, 210]];
      browser(90, 200, 120, 90, '브라우저', {}); card(330, 210, 150, 54, { rx: 10, stroke: INFO, text: 'gRPC-Web', fs: 16, s: pop(u, 0.3) });
      card(600, 210, 140, 54, { rx: 10, stroke: INK, fill: SOFT, text: 'Envoy 프록시', fs: 15, s: pop(u, 0.6) }); server(860, 206, 'gRPC 서버', { s: 0.85 });
      grow(152, 210, 252, 210, E(u, 0.9, 1.2), INFO); grow(408, 210, 527, 210, E(u, 1.2, 1.5), INFO); grow(672, 210, 800, 210, E(u, 1.5, 1.8), ACC);
      mono(740, 196, 'gRPC', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      el('path', { d: 'M90,140 Q480,40 860,140', fill: 'none', stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: fade(u, 2.0) }); cross(480, 90, 13, pop(u, 2.1));
      tx(480, 60, '직접 호출 불가: HTTP/2 트레일러를 못 만진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
      sub(480, 330, 'REST는 fetch 한 줄이면 브라우저 어디서나 된다', fade(u, 2.4)); dot(pts, seg(u, 0.9, 2.0), INFO, 6); return; }
    timeline(1);
    const head = ['폴링: 1초마다 다시 묻는다', 'SSE: 서버가 한 방향으로 민다', 'WebSocket: 양방향이면 또 다른 프로토콜', 'unary: 요청 1 · 응답 1', 'stream 키워드 하나로', 'bidi: 같은 스트림에서 양쪽이 동시에'][k];
    tx(525, 50, head, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: k <= 2 ? WARN : ACC });
    if (k === 0) { for (let i = 0; i < 6; i++) { const x = 190 + i * 120, at = 0.2 + i * 0.35, hit = i === 4;
        down(x, E(u, at, at + 0.25), MUT); up(x + 34, E(u, at + 0.2, at + 0.4), hit ? ACC : OFF);
        if (u > at + 0.4) tx(x + 52, TL.cy - 14, hit ? '변경!' : '없음', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: hit ? ACC : MUT }); }
      sub(525, 370, '응답 대부분이 "변화 없음"이다', fade(u, 2.4)); return; }
    if (k === 1) { down(190, E(u, 0.2, 0.5), INK);
      for (let i = 0; i < 5; i++) { const x = 300 + i * 120, at = 0.6 + i * 0.35; up(x, E(u, at, at + 0.25), ACC, 0); }
      el('line', { x1: 620, y1: TL.cy + 30, x2: 640, y2: TL.sy - 30, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 2.2) }); cross(630, 215, 12, pop(u, 2.3));
      sub(525, 370, '클라가 올려 보내는 스트림은 없다', fade(u, 2.4)); return; }
    if (k === 2) { down(220, E(u, 0.2, 0.5), MUT); up(250, E(u, 0.3, 0.6), MUT); down(800, E(u, 0.2, 0.5), MUT); up(830, E(u, 0.3, 0.6), MUT);
      card(525, 215, 300, 60, { rx: 10, stroke: WARN, fill: WARNBG, text: 'WebSocket 서버 따로 운영', fs: 16, s: pop(u, 0.4) });
      check(330, 370, 12, pop(u, 1.4)); tx(350, 376, '대신 브라우저는 fetch 한 줄로 REST를 부른다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); return; }
    if (k === 3) { down(300, E(u, 0.3, 0.8), INK, 60); up(560, E(u, 1.0, 1.5), ACC, 60);
      mono(525, 370, 'rpc Get(OrderReq) returns (Order);', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 4) { el('line', { x1: 525, y1: 90, x2: 525, y2: 340, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5' });
      down(190, E(u, 0.2, 0.5), INK); for (let i = 0; i < 4; i++) up(250 + i * 64, E(u, 0.6 + i * 0.25, 0.85 + i * 0.25), ACC, 0);
      for (let i = 0; i < 4; i++) down(560 + i * 64, E(u, 0.6 + i * 0.25, 0.85 + i * 0.25), INK, 0); up(830, E(u, 1.8, 2.1), ACC, 30);
      mono(340, 370, 'returns (stream Status)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); mono(715, 370, 'Upload(stream Chunk)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(340, 86, '서버 스트리밍', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) }); tx(715, 86, '클라이언트 스트리밍', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
    for (let i = 0; i < 6; i++) { const at = 0.2 + i * 0.32; down(200 + i * 110, E(u, at, at + 0.3), INK, 20); up(250 + i * 110, E(u, at + 0.15, at + 0.45), ACC, 20); }
    mono(525, 370, 'rpc Chat(stream Msg) returns (stream Msg);', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }

  // ---------- 5. 내부 gRPC, 외부 REST ----------
  const N = { ext: [90, 110], gw: [400, 110], srv: [760, 200], int: [400, 300] };
  function arch(k, u, o) { o = o || {};
    browser(N.ext[0], N.ext[1] - 6, 110, 76, '브라우저 · 파트너', { s: 0.95 });
    card(N.gw[0], N.gw[1], 170, 56, { rx: 10, stroke: WARN, fill: WARNBG, text: 'grpc-gateway', fs: 16, mono: true });
    server(N.srv[0], N.srv[1], 'UserService (gRPC)', {});
    card(N.int[0], N.int[1], 170, 56, { rx: 10, stroke: ACC, fill: ACCBG, text: '주문 서비스', fs: 16 });
    el('line', { x1: 150, y1: N.ext[1], x2: 314, y2: N.gw[1], stroke: WARN, 'stroke-width': 2.5 }); el('line', { x1: 486, y1: N.gw[1], x2: 700, y2: N.srv[1] - 30, stroke: ACC, 'stroke-width': 2.5 });
    el('line', { x1: 486, y1: N.int[1], x2: 700, y2: N.srv[1] + 30, stroke: ACC, 'stroke-width': 2.5, opacity: o.intOp ?? 1 });
    tx(232, N.ext[1] - 12, 'REST · JSON', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, 'font-weight': 700 });
    tx(600, 128, 'gRPC', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700 }); tx(600, 290, 'gRPC', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: o.intOp ?? 1 }); }
  const GWP = ['import "google/api/annotations.proto";', 'service UserService {', '  rpc GetUser(GetUserRequest) returns (User) {', '    option (google.api.http) = {', '      get: "/v1/users/{user_id}"', '    };', '  }', '}'];
  function s5(t, c) { const { k, u } = c;
    if (k <= 2 || k === 6) { arch(k, u, { intOp: k === 0 ? 0.25 : 1 });
      if (k === 0 || k === 6) { dot([[150, N.ext[1]], [314, N.gw[1]]], seg(u, 0.3, 0.9), WARN, 7); dot([[486, N.gw[1]], [700, N.srv[1] - 30]], seg(u, 0.9, 1.5), ACC, 7);
        mono(232, 62, 'GET /v1/users/42', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
        card(232, 390, 290, 34, { rx: 8, stroke: WARN, text: '{"id":"42","name":"Alice"}', fs: 14.5, mono: true, s: pop(u, 1.8) }); }
      if (k === 1 || k === 6) { dot([[486, N.int[1]], [700, N.srv[1] + 30]], seg(u, k === 6 ? 0.5 : 0.3, k === 6 ? 1.2 : 1.1), ACC, 7);
        if (k === 1) { mono(600, 350, 'client.GetUser(...)', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.6) }); sub(600, 376, '게이트웨이를 거치지 않고 바이너리로', fade(u, 1.2)); } }
      if (k === 2) { [['외부 공개 → REST', 232, 200, WARN], ['사이 → grpc-gateway', 400, 30, WARN], ['내부 MSA → gRPC', 400, 380, ACC]].forEach(([s, x, y, col], i) => pill(x, y, s, col, pop(u, 0.3 + i * 0.4), { fs: 15 })); }
      if (k === 6) banner(760, 380, '내부는 gRPC, 외부는 REST', pop(u, 2.2)); return; }
    // k3~5: .proto 의 HTTP 매핑
    el('rect', { x: 24, y: 24, width: 520, height: 244, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(38, 46, 'user_gateway.proto', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const shown = k === 3 ? 1 : 8;
    GWP.forEach((s, i) => { if (i >= shown) return; const y = 76 + i * 24, hot = (k === 3 && i === 0) || (k === 4 && (i === 3 || i === 4));
      if (hot) el('rect', { x: 30, y: y - 16, width: 508, height: 22, rx: 4, fill: ACCBG, opacity: k === 4 && i > 0 ? fade(u, 0.3) : 1 });
      spans(40, y, ptoks(s), { 'font-size': 14, opacity: k === 4 && i > 0 ? fade(u, 0.2 + i * 0.08) : 1 }); });
    if (k === 3) { tx(760, 140, 'HTTP 매핑은 표준 확장으로', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.6) });
      sub(760, 166, 'google.api.http 옵션을 쓰려면 먼저 import', fade(u, 0.9)); return; }
    if (k === 4) { mono(600, 330, 'GET /v1/users/', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 1.0) });
      card(784, 324, 64, 34, { rx: 6, stroke: ACC, fill: ACCBG, text: '42', fs: 18, mono: true, s: pop(u, 1.2) });
      card(760, 160, 240, 60, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 1.4) }); mono(760, 154, 'GetUserRequest', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(760, 178, 'user_id = "42"', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) });
      grow(784, 306, 768, 194, E(u, 1.7, 2.2), ACC); sub(400, 390, 'URL의 {user_id}가 요청 message의 필드로 들어간다', fade(u, 2.2)); return; }
    // k5: 정의 하나, 인터페이스 둘
    grow(284, 268, 200, 320, E(u, 0.2, 0.6), ACC); grow(284, 268, 640, 320, E(u, 0.2, 0.6), WARN);
    card(200, 350, 330, 50, { rx: 10, stroke: ACC, fill: ACCBG, text: '내부: client.GetUser(...)', fs: 15, mono: true, s: pop(u, 0.7) });
    card(640, 350, 330, 50, { rx: 10, stroke: WARN, fill: WARNBG, text: '외부: GET /v1/users/42', fs: 15, mono: true, s: pop(u, 1.0) });
    tx(760, 140, '스펙이 갈라지지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); }

  const quiz = [
    { q: 'gRPC로 사용자 42를 읽는 호출부 코드에 나타나지 않는 것은 무엇인가?',
      o: ['메서드 이름 GetUser', 'URL 경로와 HTTP 동사', '요청 message GetUserRequest'], a: 1,
      why: 'stub이 직렬화·전송·역직렬화를 맡아서 호출부에는 메서드 이름과 인자만 남는다. URL과 동사는 stub 안으로 들어갔다.' },
    { q: 'OpenAPI 문서와 .proto의 차이로 맞는 것은 무엇인가?',
      o: ['.proto에서 코드가 생성되어 서버·클라 타입이 어긋날 수 없다', 'OpenAPI는 컴파일되므로 어기면 빌드가 깨진다', '.proto는 사람이 읽는 문서일 뿐 코드와 무관하다'], a: 0,
      why: 'OpenAPI는 서버 코드와 따로 사는 문서다. .proto는 protoc가 서버 인터페이스와 stub을 만들어서 계약이 곧 코드가 된다.' },
    { q: 'id·name·email·role 네 필드를 실어 보낼 때 크기 비교로 맞는 것은 무엇인가?',
      o: ['JSON 78바이트, protobuf 12바이트', '둘 다 69바이트로 같다', 'JSON 69바이트, protobuf 37바이트'], a: 2,
      why: '공백 없는 JSON은 69바이트, 같은 네 필드의 protobuf는 37바이트다. 키 문자열 23바이트가 빠지고 태그 1바이트씩만 남는다.' },
    { q: '응답에만 stream을 붙인 rpc는 어떤 호출 모양인가?',
      o: ['요청 1개, 응답 여러 개', '요청 여러 개, 응답 1개', '요청 1개, 응답 1개'], a: 0,
      why: 'returns (stream Status)처럼 응답 쪽에 stream을 붙이면 서버 스트리밍이다. 요청 쪽이면 클라이언트 스트리밍, 양쪽이면 bidi다.' },
    { q: 'grpc-gateway에서 GET /v1/users/42의 42는 어디로 들어가는가?',
      o: ['HTTP 헤더 x-user-id', 'GetUserRequest의 user_id 필드', '응답 User의 id 필드'], a: 1,
      why: 'option (google.api.http)의 get: "/v1/users/{user_id}"가 URL 자리를 요청 message의 user_id 필드에 잇는다.' },
  ];

  const summary = [
    'REST는 URL로 자원을 가리키고 동사로 일을 정한다. 파싱과 상태코드 해석은 사람 몫이다.',
    'gRPC는 stub으로 원격 메서드를 함수처럼 부르고, 계약 .proto에서 코드가 나온다.',
    '같은 네 필드가 JSON은 69바이트, protobuf는 37바이트다. HTTP/2 한 연결에 호출이 함께 흐른다.',
    '스트리밍은 stream 키워드로 열고, 브라우저와 외부에는 grpc-gateway로 REST를 연다.',
  ];
  const review = [
    { q: '사내 서비스끼리 초당 수천 번 부르는 조회 API를 새로 만든다. 무엇이 알맞은가?',
      o: ['외부 공개처럼 REST/JSON으로 만든다', 'gRPC로 만들고, 필요하면 gateway로 REST도 연다', 'WebSocket 위에 직접 프로토콜을 짠다'], a: 1,
      why: '내부 고빈도 호출은 타입이 맞는 stub과 작은 바이트, HTTP/2 멀티플렉싱의 덕을 본다. 외부가 필요해지면 같은 .proto에 HTTP 매핑만 단다.' },
    { q: 'REST API 문서에는 name인데 서버는 username을 내려 주는 사고가 났다. gRPC라면 어떻게 되는가?',
      o: ['문서 검토로만 잡을 수 있다', '런타임에 JSON 파싱 오류로 드러난다', '.proto에서 서버·클라 코드를 함께 만들어 이름이 어긋날 수 없다'], a: 2,
      why: '.proto 하나에서 양쪽 코드가 생성되므로 필드가 다르면 빌드부터 맞지 않는다. 문서와 코드가 따로 사는 구조가 없다.' },
    { q: '브라우저 화면에서 주문 상태를 실시간으로 받고 싶다. gRPC 서버 스트리밍을 그대로 쓰려면 무엇이 더 필요한가?',
      o: ['gRPC-Web 클라이언트와 Envoy 같은 프록시', 'HTTP/1.1로 내려 서버를 다시 띄우기', '응답마다 stream 키워드를 빼기'], a: 0,
      why: '브라우저는 HTTP/2 트레일러를 직접 다룰 수 없어 gRPC를 바로 부르지 못한다. gRPC-Web과 프록시가 사이를 잇는다.' },
  ];

  R.page({ title: 'REST 호출과 gRPC 호출 나란히', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
