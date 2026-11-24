/* I-2-2 Code Generation — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: protoc 엔진에 꽂히는 플러그인, 생성 파일, stub → 연결 → 서버 경로표로 가는 호출 흐름, buf 선언 파일과 검사 사이클.
 * 실측: grpcio-tools 1.85(libprotoc 35.1)로 gen/py/user/v1/user_pb2.py · user_pb2_grpc.py 생성, 미구현 호출은 UNIMPLEMENTED(12) "Method not implemented!",
 *       GetUserRequest(user_id="42") = 0A 02 34 32. Go 쪽은 런타임이 없어 페이지 코드(줄인 모양)를 그대로 그린다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, server, person, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const GO = INFO, PY = WARN;

  function file(cx, cy, name, role, col, s) { if ((s ?? 1) <= 0.01) return; const w = Math.max(tw(name, 14.5), tw(role, 13.5)) + 40, g = R.G(cx, cy, s ?? 1);
    el('path', { d: `M${-w / 2},-24 H${w / 2 - 14} L${w / 2},-10 V24 H${-w / 2} Z`, fill: PANEL, stroke: col, 'stroke-width': 2.2 }, g);
    tx(-w / 2 + 12, -3, name, { 'font-size': 14.5, 'font-weight': 700, class: 'mono' }, g); tx(-w / 2 + 12, 17, role, { 'font-size': 13.5, fill: MUT }, g); }

  // ---------- 1. protoc ----------
  const ENG = { x: 400, y: 210 };
  const PLUG = [['protoc-gen-go', GO, -60], ['protoc-gen-go-grpc', GO, 0], ['grpcio-tools', PY, 60]];
  function engine(k, u) { card(ENG.x, ENG.y, 150, 70, { rx: 12, fill: INK, stroke: 'none', text: 'protoc', fs: 20, fw: 800, color: PANEL, mono: true, s: k === 0 ? pop(u, 0.2) : 1 });
    PLUG.forEach(([n, col, dy], i) => { const f = k === 0 ? E(u, 0.7 + i * 0.4, 1.2 + i * 0.4) : 1, x = lerp(ENG.x + 260, ENG.x + 172, f) - 0, on = k === 0 || (k <= 3 && col === GO) || (k >= 4 && k <= 5 && col === PY) || k === 6;
      if (f <= 0) return; card(x + 0, ENG.y + dy, 190, 34, { rx: 6, stroke: col, fill: on ? PANEL : SOFT, sw: 2, text: n, fs: 14, mono: true, color: on ? INK : MUT, op: k === 0 ? f : on ? 1 : 0.45 });
      el('line', { x1: ENG.x + 75, y1: ENG.y + dy, x2: x - 95, y2: ENG.y + dy, stroke: col, 'stroke-width': 3, opacity: f * (on ? 1 : 0.45) }); }); }
  function s1(t, c) { const { k, u } = c;
    engine(k, u);
    if (k === 0) { tx(ENG.x, 110, 'protoc는 엔진, 언어는 플러그인이 맡는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(ENG.x + 172, 300, 'Go: go install 두 개 · Python: pip install grpcio-tools', fade(u, 2.0)); return; }
    file(130, ENG.y, 'user.proto', 'proto/user/v1/', ACC, k === 1 ? pop(u, 0.3) : 1); grow(222, ENG.y, 322, ENG.y, k === 1 ? E(u, 0.8, 1.2) : 1, ACC);
    if (k === 1) { sub(130, 270, '모든 생성물의 하나뿐인 입력', fade(u, 1.3), { 'font-weight': 700, fill: INK }); return; }
    const goCmd = ['--proto_path=proto', '--go_out=gen/go', '--go-grpc_out=gen/go'], pyCmd = ['-m grpc_tools.protoc', '--python_out=gen/py', '--grpc_python_out=gen/py'];
    if (k === 2 || k === 4) { (k === 2 ? goCmd : pyCmd).forEach((s, i) => pill(ENG.x, 56 + i * 36, s, k === 2 ? GO : PY, pop(u, 0.3 + i * 0.3), { mono: true, fs: 14 }));
      tx(ENG.x, 330, k === 2 ? '플래그 하나가 플러그인 하나' : '모듈 하나로 메시지와 gRPC 코드를 함께', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); }
    const outs = [['user.pb.go', '메시지 struct + 직렬화', GO, 80, 3], ['user_grpc.pb.go', '서버 인터페이스 + stub', GO, 140, 3], ['user_pb2.py', '메시지 클래스', PY, 290, 5], ['user_pb2_grpc.py', 'Servicer + Stub', PY, 350, 5]];
    if (k >= 3) outs.forEach(([n, r, col, y, at], i) => { if (k < at) return; const fresh = k === at, f = fresh ? seg(u, 0.3 + (i % 2) * 0.4, 1.0 + (i % 2) * 0.4) : 1;
      if (f < 1) fly(ENG.x + 300, col === GO ? ENG.y - 30 : ENG.y + 60, 800, y, f, n, { fill: col, mono: true }); else if (k !== 6) file(800, y, n, r, col); });
    if (k === 6) { const T = [['gen/', 0], ['├─ go/user/v1/', 1], ['│   ├─ user.pb.go', 2, GO], ['│   └─ user_grpc.pb.go', 2, GO], ['└─ py/user/v1/', 1], ['    ├─ user_pb2.py', 2, PY], ['    └─ user_pb2_grpc.py', 2, PY]];
      el('rect', { x: 690, y: 60, width: 250, height: 250, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      T.forEach(([s, d, col], i) => mono(704, 92 + i * 31, s, { 'font-size': 15, 'font-weight': d === 2 ? 700 : 400, fill: col || MUT, opacity: fade(u, 0.2 + i * 0.2) }));
      tx(700, 350, '두 언어가 같은 계약에서 같은 구조로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(700, 374, 'Python 쪽은 grpcio-tools 1.85로 실제 생성해 확인', fade(u, 2.0)); } }

  // ---------- 2·3. 생성 코드 해부 (Go / Python 같은 틀) ----------
  // 위: 클라이언트 쪽(stub → 연결), 오른쪽 아래: grpc.Server(경로표 · 서버 계약 · 내 구현), 왼쪽 아래: 설명 칸
  const PIPE = { x1: 360, x2: 900, y: 92 };
  function stubBox(name, sub2, s, col) { card(186, PIPE.y, 300, 64, { rx: 10, stroke: col || ACC, fill: ACCBG, sw: 2.5, s }); mono(186, PIPE.y - 4, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s });
    mono(186, PIPE.y + 18, sub2, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: s }); }
  function pipe(op) { el('rect', { x: PIPE.x1, y: PIPE.y - 16, width: PIPE.x2 - PIPE.x1, height: 32, rx: 16, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: op });
    tx((PIPE.x1 + PIPE.x2) / 2, PIPE.y - 26, '연결 (ClientConn / channel)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op }); }
  function srvZone(op) { zone(520, 160, 416, 248, 'grpc.Server', { fill: SOFT, op }); el('path', { d: `M${PIPE.x2},${PIPE.y + 16} V${172}`, stroke: INK, 'stroke-width': 2.5, opacity: op, 'marker-end': 'url(#ra-ah)' }); }
  function routeTable(path, target, s) { card(728, 210, 380, 44, { rx: 8, stroke: GOOD, fill: GOODBG, sw: 2, s }); mono(548, 215, path, { 'font-size': 13.5, 'font-weight': 700, opacity: s });
    mono(912, 215, '→ ' + target, { 'font-size': 13.5, 'text-anchor': 'end', fill: GOOD, 'font-weight': 700, opacity: s }); }
  function contract(lines, s, col) { const h = 22 * lines.length + 18; el('rect', { x: 538, y: 246, width: 380, height: h, rx: 8, fill: PANEL, stroke: col || INFO, 'stroke-width': 2, opacity: s });
    lines.forEach((l, i) => mono(552, 268 + i * 22, l, { 'font-size': 14, opacity: s, fill: i ? INK : col || INFO, 'font-weight': i ? 400 : 700 })); }
  function mine(outer, inner, s) { el('rect', { x: 538, y: 330, width: 380, height: 64, rx: 8, fill: PANEL, stroke: ACC, 'stroke-width': 2.5, opacity: s });
    mono(552, 352, outer, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: s });
    el('rect', { x: 552, y: 360, width: 352, height: 26, rx: 6, fill: SOFT, stroke: GRID, opacity: s }); mono(562, 378, inner, { 'font-size': 13.5, fill: MUT, opacity: s }); }
  const PATH = '/user.v1.UserService/GetUser';
  function anatomy(lang, k, u) {
    const go = lang === 'go', col = go ? GO : PY;
    const stubName = go ? 'userServiceClient' : 'UserServiceStub', stubSub = go ? '{ cc grpc.ClientConnInterface }' : 'self.GetUser = unary_unary(…)';
    const ct = go ? ['type UserServiceServer interface {', '  GetUser(ctx, *GetUserRequest) (*User, error)', '  mustEmbedUnimplemented…()'] : ['class UserServiceServicer:', '  def GetUser(self, request, context):', '    # 기본은 UNIMPLEMENTED'];
    const my = go ? ['type server struct {', 'UnimplementedUserServiceServer  // embed'] : ['class UserService(UserServiceServicer):', '상속한 기본 동작 (덮어쓰지 않은 rpc)'];
    const reg = go ? 'RegisterUserServiceServer(s, &server{})' : 'add_UserServiceServicer_to_server(svc, server)';
    const st = { stub: go ? 2 : 1, pipe: 2, path: 3, contract: 4, mine: 5, route: 7 };
    const show = (key) => k >= st[key], fresh = (key) => k === st[key];
    stubBox(stubName, stubSub, show('stub') ? (fresh('stub') ? pop(u, 0.2) : 1) : 0);
    if (show('pipe')) { pipe(fresh('pipe') ? fade(u, 0.3) : 1); if (fresh('pipe')) grow(PIPE.x1, PIPE.y, PIPE.x2, PIPE.y, E(u, 0.4, 1.1), ACC, { plain: true }); }
    if (k >= st.contract || k >= st.route) srvZone(k === st.contract ? fade(u, 0.1) : 1);
    if (show('route')) routeTable(PATH, go ? 'server.GetUser' : 'servicer.GetUser', fresh('route') ? pop(u, 0.4) : 1);
    if (show('contract')) contract(ct, fresh('contract') ? fade(u, 0.3) : 1, col);
    if (show('mine')) mine(my[0], my[1], fresh('mine') ? fade(u, 0.3) : 1);
    return { col, reg }; }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { file(480, 120, 'user_grpc.pb.go', 'Code generated by protoc-gen-go-grpc', GO, pop(u, 0.2));
      card(480, 196, 210, 40, { rx: 6, fill: 'none', stroke: BAD, sw: 3, text: 'DO NOT EDIT', fs: 18, fw: 800, color: BAD, s: pop(u, 0.8) });
      pill(300, 290, '손으로 고침', BAD, pop(u, 1.3), { fs: 15 }); grow(370, 290, 560, 290, E(u, 1.5, 1.9), MUT);
      pill(660, 290, 'protoc 다시 실행', INK, pop(u, 1.9), { fs: 15, mono: false }); cross(300, 290, 12, pop(u, 2.2));
      sub(480, 350, '재생성하면 덮어써진다. 고칠 곳은 .proto 뿐', fade(u, 2.3), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { spans(120, 110, [['rpc ', { fill: INFO, 'font-weight': 700 }], ['GetUser(GetUserRequest) returns (User);', {}]], { 'font-size': 17 });
      grow(480, 126, 480, 196, E(u, 0.4, 0.9), MUT);
      spans(60, 236, [['GetUser(', {}], ['ctx context.Context', { fill: ACC, 'font-weight': 800 }], [', in *GetUserRequest, ', {}], ['opts ...grpc.CallOption', { fill: ACC, 'font-weight': 800 }], [')', {}]], { 'font-size': 16, opacity: fade(u, 0.9) });
      mono(320, 266, '(*User, error)', { 'font-size': 16, opacity: fade(u, 1.1) });
      tx(480, 330, 'ctx와 CallOption은 gRPC가 덧붙인다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      sub(480, 356, 'ctx로 데드라인·취소를, opts로 호출별 옵션을 넘긴다', fade(u, 1.9)); return; }
    anatomy('go', k, u);
    if (k === 2) { sub(186, 160, '상태 없이 연결만 쥔 얇은 껍데기', fade(u, 1.0), { 'font-weight': 700, fill: INK }); mono(186, 200, 'NewUserServiceClient(conn)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); }
    if (k === 3) { fly(PIPE.x1 + 20, PIPE.y, PIPE.x2 - 140, PIPE.y, seg(u, 0.3, 1.8), PATH, { mono: true, stay: true });
      mono(40, 210, 'c.cc.Invoke(ctx,', { 'font-size': 15, opacity: fade(u, 0.2) }); mono(56, 236, `"${PATH}",`, { 'font-size': 14, fill: ACC, opacity: fade(u, 0.4) }); mono(56, 262, 'in, out, opts...)', { 'font-size': 15, opacity: fade(u, 0.6) });
      sub(250, 310, '로컬 함수처럼 보여도 안은 이 한 줄', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }
    if (k === 4) { sub(250, 240, '내가 구현할 계약', fade(u, 0.8), { 'font-weight': 700, fill: INK }); sub(250, 266, 'mustEmbed…가 base를 품도록 강제한다', fade(u, 1.2)); }
    if (k === 5) { pill(150, 220, '.proto에 rpc DeleteUser 추가', WARN, pop(u, 0.6), { fs: 14 }); grow(150, 240, 150, 290, E(u, 1.0, 1.3), MUT);
      card(150, 320, 250, 44, { rx: 10, stroke: GOOD, fill: GOODBG, text: '내 서버 그대로 빌드됨', fs: 15, s: pop(u, 1.4) }); check(40, 320, 11, pop(u, 1.6));
      sub(250, 380, 'embed한 base가 새 메서드를 대신 채운다', fade(u, 1.9)); }
    if (k === 6) { dot([[PIPE.x2, PIPE.y + 16], [PIPE.x2, 330]], seg(u, 0.2, 0.9), ACC, 7);
      card(250, 250, 380, 74, { rx: 10, stroke: WARN, fill: WARNBG, sw: 2.5, s: pop(u, 1.0) }); mono(250, 244, 'codes.Unimplemented', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.1) });
      mono(250, 270, '"method GetUser not implemented"', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(250, 320, '구현을 빼먹어도 패닉이 아니라 상태 코드 12가 간다', fade(u, 1.7), { 'font-weight': 700, fill: INK }); }
    if (k === 7) { fly(PIPE.x1 + 20, PIPE.y, PIPE.x2 - 140, PIPE.y, seg(u, 0.2, 1.0), PATH, { mono: true }); dot([[PIPE.x2, PIPE.y + 16], [PIPE.x2, 190]], seg(u, 1.0, 1.4), ACC, 7);
      mono(40, 230, 'RegisterUserServiceServer(', { 'font-size': 15, opacity: fade(u, 0.3) }); mono(56, 256, 's, &server{})', { 'font-size': 15, opacity: fade(u, 0.5) });
      sub(250, 300, '서비스 이름 → 핸들러 경로표를 서버에 넣는다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }
    if (k === 8) { ['func (s *server) GetUser(ctx, req) (*User, error) {', '  return &User{Id: req.UserId, Name: "Alice"}, nil', '}'].forEach((l, i) => mono(30, 220 + i * 24, l, { 'font-size': 13.5, opacity: fade(u, 0.2 + i * 0.2) }));
      fly(PIPE.x2 - 60, PIPE.y, PIPE.x1 + 20, PIPE.y, seg(u, 1.2, 2.2), 'User{Name: "Alice"}', { fill: GOOD, mono: true, stay: true });
      sub(250, 320, '내가 쓰는 코드는 이 메서드뿐이다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); } }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { file(250, 180, 'user_pb2_grpc.py', 'Servicer + Stub', PY, pop(u, 0.2)); file(700, 180, 'user_pb2.py', '메시지 클래스', PY, pop(u, 0.6));
      grow(350, 180, 594, 180, E(u, 1.0, 1.5), PY); mono(470, 166, 'import user_pb2', { 'font-size': 14.5, 'text-anchor': 'middle', fill: PY, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(480, 290, '직렬화는 메시지 파일에 맡긴다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(480, 316, '첫 줄: Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!', fade(u, 2.1)); return; }
    anatomy('py', k, u);
    if (k === 1) { sub(186, 160, 'Go의 UserServiceClient 자리', fade(u, 0.8), { 'font-weight': 700, fill: INK }); sub(186, 186, '인터페이스 없이 클래스 하나', fade(u, 1.1)); }
    if (k === 2) { mono(30, 212, 'self.GetUser = channel.unary_unary(', { 'font-size': 14, opacity: fade(u, 0.3) }); mono(46, 236, `"${PATH}", …)`, { 'font-size': 14, fill: ACC, opacity: fade(u, 0.5) });
      sub(250, 290, 'rpc마다 호출할 수 있는 객체를 미리 묶어 둔다', fade(u, 1.5), { 'font-weight': 700, fill: INK }); }
    if (k === 3) { const steps = [['GetUserRequest(user_id="42")', INK], ['SerializeToString', PY], ['0A 02 34 32', ACC], ['User.FromString', PY]];
      steps.forEach(([s, col], i) => { const y = 200 + i * 52; card(250, y, 330, 38, { rx: 8, stroke: col, sw: 2, text: s, fs: 14.5, mono: true, fw: i === 2 ? 800 : 600, s: pop(u, 0.3 + i * 0.4) }); if (i) grow(250, y - 33, 250, y - 21, E(u, 0.2 + i * 0.4, 0.4 + i * 0.4), MUT); });
      fly(PIPE.x1 + 20, PIPE.y, PIPE.x2 - 80, PIPE.y, seg(u, 1.4, 2.4), '0A 02 34 32', { mono: true }); }
    if (k === 4) { sub(250, 240, 'Go 서버 인터페이스 자리', fade(u, 0.8), { 'font-weight': 700, fill: INK }); sub(250, 266, '상속해서 GetUser만 덮어쓴다', fade(u, 1.2)); }
    if (k === 5) { terminal(24, 196, 480, 150, ['>>> stub.GetUser(GetUserRequest(user_id="1"))', 'grpc.RpcError:', '  code    = StatusCode.UNIMPLEMENTED (12)', "  details = 'Method not implemented!'"], E(u, 0.4, 1.8) * 4, { title: 'grpcio 1.85 실측' });
      dot([[PIPE.x2, PIPE.y + 16], [PIPE.x2, 330]], seg(u, 0.2, 0.9), ACC, 7); }
    if (k === 6) { [['stub', 'Serialize 요청 → FromString 응답', 220], ['서버', 'FromString 요청 → Serialize 응답', 290]].forEach(([a, b, y], i) => {
        tx(40, y + 5, a, { 'font-size': 15, 'font-weight': 800, fill: i ? GOOD : ACC, opacity: fade(u, 0.3 + i * 0.6) }); mono(100, y + 5, b, { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.6) }); });
      sub(250, 350, '서버 쪽은 stub과 정확히 거꾸로 푼다', fade(u, 1.7), { 'font-weight': 700, fill: INK }); }
    if (k === 7) { mono(30, 230, 'add_UserServiceServicer_to_server(', { 'font-size': 14.5, opacity: fade(u, 0.3) }); mono(46, 256, 'UserService(), server)', { 'font-size': 14.5, opacity: fade(u, 0.5) });
      sub(250, 300, '"user.v1.UserService" 이름으로 핸들러를 붙인다', fade(u, 1.4), { 'font-weight': 700, fill: INK }); dot([[PIPE.x2, PIPE.y + 16], [PIPE.x2, 190]], seg(u, 1.0, 1.4), ACC, 7); }
    if (k === 8) { ['server = grpc.server(', '    ThreadPoolExecutor(max_workers=4))', 'add_UserServiceServicer_to_server(', '    UserService(), server)'].forEach((l, i) => mono(30, 216 + i * 24, l, { 'font-size': 14, opacity: fade(u, 0.2 + i * 0.2) }));
      fly(PIPE.x2 - 60, PIPE.y, PIPE.x1 + 20, PIPE.y, seg(u, 1.2, 2.2), 'User(name="Alice")', { fill: GOOD, mono: true, stay: true });
      sub(250, 340, 'Go와 이름만 다르고 구조는 같다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); } }

  // ---------- 4. buf ----------
  const YM = ['version: v2', 'plugins:', '  - remote: buf.build/protocolbuffers/go', '    out: gen/go', '  - remote: buf.build/grpc/go', '    out: gen/go', '  - remote: buf.build/protocolbuffers/python', '    out: gen/py', '  - remote: buf.build/grpc/python', '    out: gen/py'];
  const YSH = [2, 4, 6, 10];
  function yaml(n, hi, x, y) { el('rect', { x, y, width: 420, height: 278, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); mono(x + 14, y + 22, 'buf.gen.yaml', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    YM.forEach((s, i) => { if (i >= n) return; const yy = y + 50 + i * 23; if (hi.includes(i)) el('rect', { x: x + 6, y: yy - 16, width: 408, height: 21, rx: 4, fill: ACCBG });
      mono(x + 16, yy, s, { 'font-size': 14, fill: s.includes('remote') ? INK : MUT }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) { const n = Math.round(lerp(k ? YSH[k - 1] : 0, YSH[k], E(u, 0.2, 1.2))), hi = [[0], [2, 3], [4, 5], [6, 7, 8, 9]][k];
      yaml(n, hi, 24, 60);
      if (k === 0) { ['protoc', '--proto_path=proto', '--go_out=gen/go', '--go_opt=paths=source_relative', '--go-grpc_out=gen/go', '--go-grpc_opt=…'].forEach((s, i) => { const f = E(u, 1.0, 2.0);
          pill(lerp(700, 234, f), lerp(70 + i * 42, 140, f), s, MUT, 1, { mono: true, fs: 13.5, op: 1 - f }); });
        tx(700, 360, '긴 플래그 대신 선언 파일 하나', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
      card(720, 70, 200, 50, { rx: 25, stroke: INFO, fill: INFOBG, text: 'buf.build 원격', fs: 15, fw: 800 });
      if (k === 1 || k === 2) { fly(720, 95, 300, k === 1 ? 110 : 156, seg(u, 0.4, 1.3), k === 1 ? 'protocolbuffers/go' : 'grpc/go', { fill: GO, mono: true });
        if (k === 1) { pill(720, 240, 'go install protoc-gen-go', BAD, pop(u, 1.5), { mono: true, fs: 13.5 }); cross(860, 240, 11, pop(u, 1.8)); sub(720, 290, '로컬 설치 없이 팀 전체가 같은 버전', fade(u, 2.0)); }
        else sub(720, 260, '항목 하나 = protoc 플래그 한 쌍', fade(u, 1.5), { 'font-weight': 700, fill: INK }); return; }
      card(720, 200, 170, 46, { rx: 8, fill: INK, stroke: 'none', text: 'buf generate', fs: 16, fw: 800, color: PANEL, mono: true, s: pop(u, 1.2) });
      [['gen/go', 640, GO], ['gen/py', 800, PY]].forEach(([s, x, col], i) => { grow(720, 224, x, 300, E(u, 1.5, 1.9), col); card(x, 320, 120, 36, { rx: 8, stroke: col, text: s, fs: 15, mono: true, s: pop(u, 1.9 + i * 0.2) }); });
      sub(720, 380, '명령 하나로 두 언어가 함께 나온다', fade(u, 2.2)); return; }
    if (k === 4) { [['lint', 'STANDARD', '이름 · 구조 규칙', INFO], ['breaking', 'FILE', '이전 버전과 비교', WARN]].forEach(([a, b, d, col], i) => { const cx = 260 + i * 440, s = pop(u, 0.3 + i * 0.5);
        card(cx, 190, 360, 120, { rx: 12, stroke: col, sw: 2.5, s }); mono(cx, 170, `${a}: use [${b}]`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.4 + i * 0.5) });
        tx(cx, 204, d, { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 0.5 + i * 0.5) }); });
      tx(480, 60, 'buf.yaml: 모듈 경로와 검사 규칙', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700 });
      sub(480, 320, '생성 설정뿐 아니라 검사 규칙도 선언으로 남긴다', fade(u, 1.6)); return; }
    if (k === 5) { [['buf lint', '스타일 위반', INFO], ['buf breaking', '--against ".git#branch=main"', WARN], ['buf generate', 'Go + Python', GOOD]].forEach(([a, b, col], i) => { const cx = 170 + i * 310, s = pop(u, 0.3 + i * 0.45);
        card(cx, 190, 260, 86, { rx: 12, stroke: col, sw: 2.5, s }); mono(cx, 180, a, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.4 + i * 0.45) });
        mono(cx, 206, b, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.45) }); if (i < 2) grow(cx + 132, 190, cx + 176, 190, E(u, 0.6 + i * 0.45, 0.9 + i * 0.45), MUT); });
      dot([[40, 190], [920, 190]], seg(u, 1.6, 2.6), ACC, 7); sub(480, 300, 'breaking은 main 브랜치의 .proto와 비교한다', fade(u, 1.8)); return; }
    if (k === 6) { const cx = [130, 380, 630, 850];
      card(cx[0], 200, 190, 60, { rx: 10, stroke: INK, text: 'PR (예)\n필드 3 번호 재사용', fs: 14.5, s: pop(u, 0.2) });
      card(cx[1], 200, 190, 60, { rx: 10, stroke: WARN, text: 'CI: buf breaking', fs: 15, mono: true, s: pop(u, 0.6) }); grow(cx[0] + 96, 200, cx[1] - 96, 200, E(u, 0.4, 0.7), MUT);
      cross(cx[1], 262, 14, pop(u, 1.2)); tx(cx[1], 300, '호환이 깨졌다고 실패', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      el('line', { x1: cx[1] + 96, y1: 200, x2: cx[2] - 60, y2: 200, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 1.5) });
      card(cx[2], 200, 120, 50, { rx: 10, stroke: GRID, text: 'merge', fs: 16, color: OFF, s: pop(u, 1.5) }); lock(cx[2] + 72, 186, true, BAD, pop(u, 1.7));
      person(cx[3], 196, '배포된 클라이언트', { s: 0.9 }); check(cx[3] + 40, 160, 12, pop(u, 2.1));
      sub(480, 370, 'merge 전에 막아 이미 나간 클라이언트를 지킨다', fade(u, 2.2)); return; }
    const a = 'protoc --proto_path=proto --go_out=gen/go --go_opt=paths=source_relative --go-grpc_out=gen/go …', b = 'buf generate';
    tx(40, 120, 'protoc 한 줄', { 'font-size': 16, 'font-weight': 700, fill: MUT }); el('rect', { x: 40, y: 136, width: 880 * E(u, 0.2, 1.0), height: 40, rx: 8, fill: SOFT, stroke: GRID });
    mono(54, 162, a.slice(0, Math.round(a.length * E(u, 0.2, 1.0))), { 'font-size': 13.5 });
    tx(40, 240, 'buf 한 줄', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); el('rect', { x: 40, y: 256, width: 160 * E(u, 1.3, 1.6), height: 40, rx: 8, fill: ACCBG, stroke: ACC });
    mono(54, 282, b, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
    tx(480, 360, '결과물은 같고, 설정은 yaml에 남는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // ---------- 5. 한 장 정리 ----------
  const KIND3 = [['메시지', '직렬화 코드', INK], ['서버 base', '내가 구현할 계약', INFO], ['client stub', '원격을 로컬처럼', ACC]];
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { KIND3.forEach(([a, b, col], i) => { const cx = 300 + i * 220, s = k === 0 ? pop(u, 0.3 + i * 0.35) : 1;
        card(cx, 80, 196, 64, { rx: 10, stroke: col, sw: 2.5, s }); tx(cx, 76, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: s }); tx(cx, 98, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s }); });
      [['Go', 200, GO, ['user.pb.go', 'UserServiceServer', 'UserServiceClient'], 1], ['Python', 320, PY, ['user_pb2.py', 'UserServiceServicer', 'UserServiceStub'], 2]].forEach(([nm, y, col, items, at]) => { if (k < at) return;
        tx(110, y + 5, nm, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: k === at ? fade(u, 0.2) : 1 });
        items.forEach((s, i) => card(300 + i * 220, y, 200, 44, { rx: 8, stroke: col, text: s, fs: 14, mono: true, s: k === at ? pop(u, 0.4 + i * 0.3) : 1 })); });
      if (k === 0) sub(520, 200, '언어와 상관없이 세 가지가 나온다', fade(u, 1.6));
      if (k === 1) sub(520, 260, '.pb.go는 메시지, _grpc.pb.go는 서버 base와 stub', fade(u, 1.6));
      if (k === 2) sub(520, 380, '_pb2는 메시지, _pb2_grpc는 Servicer와 Stub', fade(u, 1.6)); return; }
    if (k === 3) { const cx = 480, cy = 210, r = 130, rx = 250, st = [['buf lint', INFO], ['buf breaking', WARN], ['buf generate', GOOD], ['go build && pytest', INK]];
      el('ellipse', { cx, cy, rx, ry: r, fill: 'none', stroke: GRID, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
      st.forEach(([s, col], i) => { const a = -Math.PI / 2 + i * Math.PI / 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * r; card(x, y, tw(s, 15) + 30, 40, { rx: 20, fill: PANEL, stroke: col, sw: 2.5, text: s, fs: 15, mono: true, fw: 700, s: pop(u, 0.2 + i * 0.3) }); });
      const a = -Math.PI / 2 + (u * 0.9) * Math.PI; if (u > 1.0) el('circle', { cx: cx + Math.cos(a) * rx, cy: cy + Math.sin(a) * r, r: 8, fill: ACC });
      tx(cx, cy + 6, '.proto 수정', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) }); sub(cx, 400, '고칠 때마다 사이클을 통째로 돈다', fade(u, 1.8)); return; }
    if (k === 4) { [['생성물을 커밋', ['CI가 단순하다', 'IDE가 바로 안다'], ['diff가 지저분하다']], ['빌드 때 생성', ['저장소가 깨끗하다'], ['모두 도구를 설치한다']]].forEach(([h, pros, cons], i) => { const x = 60 + i * 450, op = fade(u, 0.2 + i * 0.6);
        el('rect', { x, y: 50, width: 400, height: 250, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op }); tx(x + 200, 84, h, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: op });
        pros.forEach((s, j) => { check(x + 34, 130 + j * 40, 9, op); tx(x + 56, 136 + j * 40, s, { 'font-size': 15, opacity: op }); });
        cons.forEach((s, j) => { cross(x + 34, 230 + j * 40, 8, op); tx(x + 56, 236 + j * 40, s, { 'font-size': 15, opacity: op }); }); });
      banner(480, 360, 'buf remote 플러그인이 둘 사이를 줄인다', pop(u, 1.8)); return; }
    if (k === 5) { [['생성 파일은 손으로 고치지 않는다', BAD], ['.proto가 하나뿐인 원본이다', ACC], ['breaking 검사로 배포된 클라이언트를 지킨다', WARN]].forEach(([s, col], i) => { const y = 110 + i * 86, sc = pop(u, 0.3 + i * 0.45);
        card(480, y, 620, 62, { rx: 12, stroke: col, sw: 2.5, s: sc }); tx(480, y + 6, s, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.45) }); });
      return; }
    file(330, 200, 'user_pb2_grpc.py / user_grpc.pb.go', '생성된 stub', ACC, pop(u, 0.2)); grow(510, 200, 600, 200, E(u, 0.8, 1.2), ACC);
    card(720, 200, 220, 56, { rx: 12, stroke: GOOD, fill: GOODBG, text: 'II-1-1 Unary RPC', fs: 16, fw: 800, s: pop(u, 1.2) });
    sub(480, 300, '다음 장에서 이 stub으로 첫 서버와 클라이언트를 만든다', fade(u, 1.7)); }

  const quiz = [
    { q: 'Python에서 .proto로 메시지와 gRPC 코드를 함께 만드는 도구는 무엇인가?',
      o: ['protoc-gen-go-grpc', 'grpcio-tools의 grpc_tools.protoc', 'buf lint'], a: 1,
      why: 'Python은 grpcio-tools 하나로 --python_out과 --grpc_python_out을 모두 처리해 user_pb2.py와 user_pb2_grpc.py를 만든다.' },
    { q: '생성된 Go stub의 GetUser 메서드는 안에서 실제로 무엇을 하는가?',
      o: ['cc.Invoke로 "/user.v1.UserService/GetUser" 경로 호출을 한다', '서버 구현 함수를 같은 프로세스에서 바로 부른다', 'JSON으로 바꿔 HTTP POST를 보낸다'], a: 0,
      why: 'stub은 ClientConn만 쥔 얇은 구조체이고, GetUser는 Invoke 한 줄로 직렬화와 전송을 gRPC 런타임에 넘긴다.' },
    { q: 'Python 서버에서 Servicer의 GetUser를 덮어쓰지 않고 호출을 받으면 클라이언트는 무엇을 받는가?',
      o: ['빈 User 응답', '연결이 끊겨 UNAVAILABLE', 'UNIMPLEMENTED(12)와 "Method not implemented!"'], a: 2,
      why: '생성된 기본 메서드가 UNIMPLEMENTED 코드를 세팅하고 예외를 던진다. grpcio 1.85에서 그대로 확인한 값이다.' },
    { q: 'buf breaking --against ".git#branch=main"이 하는 일은 무엇인가?',
      o: ['main의 .proto와 비교해 호환이 깨지는 변경을 찾는다', 'main 브랜치에 생성 코드를 커밋한다', '스타일 규칙 위반을 고친다'], a: 0,
      why: 'breaking은 이전 버전과 지금 .proto를 비교한다. CI에서 돌리면 번호 재사용 같은 변경을 merge 전에 막는다.' },
    { q: '생성 파일을 저장소에 커밋할 때 치르는 값은 무엇인가?',
      o: ['CI에서 protoc를 꼭 설치해야 한다', 'diff가 지저분해지고 재생성을 잊으면 .proto와 어긋난다', 'IDE가 생성 코드를 못 찾는다'], a: 1,
      why: '커밋하면 CI가 단순하고 IDE가 바로 알지만 diff가 커진다. 빌드 때 생성하면 저장소는 깨끗해도 모두 도구를 맞춰야 한다.' },
  ];

  const summary = [
    'protoc는 엔진이고 언어별 플러그인이 코드를 쓴다. Python은 grpcio-tools 하나면 된다.',
    '생성물은 메시지, 서버 base, client stub 세 가지이고 Go와 Python의 구조가 같다.',
    'stub은 경로 /user.v1.UserService/GetUser로 호출하고, 미구현 메서드는 UNIMPLEMENTED를 돌려준다.',
    'buf는 생성 설정을 yaml에 두고 lint와 breaking 검사를 CI에서 돌린다.',
  ];
  const review = [
    { q: '동료가 user_grpc.pb.go에 로그 한 줄을 직접 넣었는데 다음 날 사라졌다. 왜인가?',
      o: ['Go 컴파일러가 주석을 지웠다', 'git이 충돌을 자동으로 되돌렸다', '.proto를 고쳐 다시 생성하면서 덮어썼다'], a: 2,
      why: '생성 파일은 DO NOT EDIT이고 재생성 때마다 새로 쓰인다. 공통 로그가 필요하면 인터셉터처럼 생성물 밖에서 넣는다.' },
    { q: '.proto에 rpc DeleteUser를 추가했는데 아직 구현하지 않은 Go 서버가 빌드된다. 무엇 덕분인가?',
      o: ['서버 구조체에 UnimplementedUserServiceServer를 embed해서', 'Go가 없는 메서드를 무시해서', 'buf가 구현을 자동으로 만들어서'], a: 0,
      why: 'embed한 base가 새 메서드의 기본 구현을 채운다. 이 메서드를 부르면 UNIMPLEMENTED가 돌아간다.' },
    { q: '팀원마다 protoc-gen-go 버전이 달라 생성물 diff가 계속 생긴다. 알맞은 대응은?',
      o: ['생성물을 .gitignore에 넣고 각자 알아서 만든다', 'buf.gen.yaml에 remote 플러그인을 적어 모두 같은 플러그인으로 생성한다', 'protoc 대신 Python 생성기만 쓴다'], a: 1,
      why: 'remote 플러그인은 buf.build에서 정해진 버전을 받아 쓰므로 로컬 설치 차이가 사라진다.' },
  ];

  R.page({ title: '.proto에서 생성 코드까지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
