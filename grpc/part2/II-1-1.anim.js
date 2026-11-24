/* II-1-1 Unary RPC — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 바이트·크기·상태 코드·에러 문구·채널 상태는 grpcio 1.85 / protobuf (python) 로 .proto 와 코드 블록을 다시 만들어 돌려 확인한 값이다.
 * Go 코드는 같은 동작을 python 으로 재현해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cells, kvTable, zone,
    server, person, cross, check, lock, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const KW = /^(syntax|package|option|service|rpc|returns|stream|message|string|int32|int64|bool|func|return|if|else|for|go|defer|nil|type|struct|import|from|def|with|as|try|except|elif|await|async|None|var)$/;
  function ctok(s) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { fill: INFO, 'font-weight': 700 } : {}]); }); buf = ''; };
    while (i < s.length) { const ch = s[i];
      if ((ch === '/' && s[i + 1] === '/') || ch === '#') { flush(); out.push([s.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = s.indexOf('"', i + 1), end = e < 0 ? s.length : e + 1; out.push([s.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  // 여러 줄 코드. n: 보이는 줄 수(소수면 마지막 줄 타이핑), o.hi(i) 줄 배경
  function code(x, y, rows, n, o) { o = o || {}; const fs = o.fs || 14.5, lh = o.lh || fs + 9, N = n == null ? rows.length : n;
    if (o.box) el('rect', { x: x - 14, y: y - fs - 10, width: o.box, height: rows.length * lh + 16, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    rows.forEach((s, i) => { if (i >= Math.ceil(N - 1e-6)) return; const part = i === Math.ceil(N) - 1 && N % 1 ? s.slice(0, Math.round(s.length * (N % 1))) : s;
      const hc = o.hi && o.hi(i); if (hc) el('rect', { x: x - 6, y: y + i * lh - fs + 1, width: tw(s, fs) + 12, height: lh - 3, rx: 4, fill: hc });
      spans(x, y + i * lh, ctok(part), { 'font-size': fs }); });
    return { row: (i) => y + i * lh - fs * 0.35 }; }
  // 바이트 칸: 16진 두 글자짜리 칸을 n 개까지 채운다
  function bytes(x, y, hexes, n, o) { o = o || {}; const w = o.w || 34, gap = o.gap ?? 4;
    hexes.forEach((h, i) => { const v = clamp((n ?? hexes.length) - i); if (v <= 0) return; const st = (o.style && o.style(i)) || {};
      card(x + i * (w + gap) + w / 2, y, w, 32, { rx: 5, text: h, fs: 14, mono: true, fw: 700, stroke: st.stroke || GRID, fill: st.fill || PANEL, color: st.color || INK, sw: 1.6, s: 0.6 + 0.4 * v, op: v }); });
    return (i) => x + i * (w + gap) + w / 2; }
  // 클라이언트·서버 판
  function ends(o) { o = o || {}; const y = o.y ?? 210;
    card(o.L ?? 110, y, 150, 64, { text: o.ln || 'Client', fs: 16, fw: 800, stroke: o.lc || INK });
    card(o.R ?? 850, y, 150, 64, { text: o.rn || 'Server', fs: 16, fw: 800, stroke: o.rc || ACC, fill: ACCBG, color: ACC }); }
  const stat = (cx, cy, s, col, sc) => pill(cx, cy, s, col, sc, { mono: true, fs: 14 });
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. .proto 계약 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const cd = code(56, 80, ['syntax = "proto3";', 'package user.v1;', 'option go_package = "example.com/user/v1;userv1";'], E(u, 0.2, 1.4) * 3, { box: 520, hi: (i) => (i === 1 && u > 1.5 ? ACCBG : null) });
      grow(150, 140, 380, 255, E(u, 1.5, 2.0), ACC); void cd;
      if (u > 1.9) spans(300, 280, [['/', {}], ['user.v1', { fill: ACC, 'font-weight': 800 }], ['.UserService/GetUser', {}]], { 'font-size': 18, opacity: fade(u, 1.9) });
      sub(470, 312, 'HTTP/2 요청의 :path 앞부분이 패키지 이름이다', fade(u, 2.2), { 'font-size': 14.5 });
      sub(470, 370, 'go_package 는 Go 생성 코드의 import 경로일 뿐 wire 에는 안 실린다', fade(u, 2.5), { 'font-size': 14 }); return; }
    if (k === 1) { code(56, 80, ['service UserService {', '  rpc GetUser(GetUserRequest)', '      returns (GetUserResponse);', '}'], E(u, 0.1, 0.8) * 4, { box: 400 });
      person(600, 150, 'Client'); server(860, 150, 'Server', { s: 0.75 });
      el('line', { x1: 640, y1: 130, x2: 810, y2: 130, stroke: GRID, 'stroke-width': 2 }); el('line', { x1: 640, y1: 175, x2: 810, y2: 175, stroke: GRID, 'stroke-width': 2 });
      fly(650, 130, 740, 130, seg(u, 0.8, 1.5), 'GetUserRequest', { stay: true, mono: true });
      fly(800, 175, 702, 175, seg(u, 1.5, 2.2), 'GetUserResponse', { stay: true, mono: true, fill: INK });
      mono(725, 260, '요청 1 · 응답 1', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.1) });
      const sp = pop(u, 2.3); pill(230, 290, 'stream', MUT, sp, { mono: true, fs: 15 }); if (sp > 0.5) cross(230, 290, 16, sp);
      sub(230, 330, '어느 쪽에도 stream 이 없다', fade(u, 2.4)); return; }
    if (k === 2) { lbl(480, 46, 'UserService 의 rpc 세 개', 1);
      [['GetUser', 'GetUserRequest', 'GetUserResponse'], ['CreateUser', 'CreateUserRequest', 'GetUserResponse'], ['DeleteUser', 'DeleteUserRequest', 'DeleteUserResponse']].forEach(([n, a, b], i) => {
        const y = 110 + i * 92, s = pop(u, 0.2 + i * 0.45), g = E(u, 0.5 + i * 0.45, 1.1 + i * 0.45);
        card(150, y, 190, 50, { text: n, mono: true, fs: 16, fw: 800, s, stroke: ACC, color: ACC });
        grow(260, y - 10, 500, y - 10, g, ACC); grow(500, y + 12, 260, y + 12, E(u, 0.8 + i * 0.45, 1.4 + i * 0.45), INK);
        mono(380, y - 18, a, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: g }); mono(380, y + 32, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: g });
        mono(620, y + 6, '1 : 1', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2 + i * 0.4) }); });
      note(740, 210, '조회·생성·삭제', fade(u, 2.2)); note(740, 236, '모두 같은 모양', fade(u, 2.3)); return; }
    if (k === 3) { code(56, 70, ['message GetUserRequest {', '  string user_id = 1;', '}'], 3, { box: 360, hi: (i) => (i === 1 ? ACCBG : null) });
      sub(480, 172, 'GetUserRequest{user_id: "u-42"} 를 직렬화하면', fade(u, 0.3), { 'font-size': 14.5 });
      const H = ['0a', '04', '75', '2d', '34', '32'], bx = bytes(300, 220, H, E(u, 0.5, 1.6) * 6, { w: 52, style: (i) => (i === 0 ? { stroke: ACC, fill: ACCBG, color: ACC } : i === 1 ? { stroke: WARN } : {}) });
      grow(bx(0), 262, bx(0), 292, E(u, 1.7, 2.0), ACC); grow(bx(1), 262, bx(1), 292, E(u, 1.9, 2.2), WARN);
      tx(bx(0), 314, '태그: 필드 1 × 8 + 형식 2 = 10', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'start', opacity: fade(u, 1.8) });
      tx(bx(1) - 20, 344, '길이 4', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      mono((bx(2) + bx(5)) / 2, 268, '"u-42"', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.7) });
      mono(780, 228, '6 바이트', { 'font-size': 20, 'font-weight': 800, fill: INK, opacity: fade(u, 1.6) });
      sub(480, 392, '필드 이름 user_id 는 어디에도 없다. 번호 1 만 실린다', fade(u, 2.4), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 4) { code(56, 62, ['message GetUserResponse {', '  string id = 1;  string name = 2;', '  string email = 3;  int32 age = 4;', '}'], 4, { box: 400, fs: 14 });
      const segs = [['0a', '04', 'u-42', 1, '1×8+2'], ['12', '05', 'Alice', 2, '2×8+2'], ['1a', '0c', 'alice@ex.com', 3, '3×8+2'], ['20', null, '1e = 30', 4, '4×8+0']];
      let x = 40; segs.forEach(([tg, ln, v, f, fm], i) => { const s = E(u, 0.3 + i * 0.4, 0.8 + i * 0.4); if (s <= 0) return;
        const vw = tw(v, 14) + 22, w = 42 + (ln ? 42 : 0) + vw;
        card(x + 21, 230, 38, 34, { rx: 5, text: tg, mono: true, fs: 14, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, op: s });
        if (ln) card(x + 63, 230, 38, 34, { rx: 5, text: ln, mono: true, fs: 14, stroke: WARN, op: s });
        card(x + (ln ? 84 : 42) + vw / 2, 230, vw - 4, 34, { rx: 5, text: v, mono: true, fs: 14, fw: 600, stroke: GRID, op: s });
        mono(x + 21, 272, fm, { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: s });
        tx(x + w / 2, 196, '필드 ' + f, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 600, opacity: s }); x += w + 10; });
      mono(480, 330, '합계 29 바이트', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(480, 365, 'age 는 길이 없이 숫자 하나(varint)로 끝난다 · 형식 0', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 5) { ['message CreateUserRequest { string name = 1; string email = 2; }', 'message DeleteUserRequest { string user_id = 1; }', 'message DeleteUserResponse { bool ok = 1; }'].forEach((s, i) => {
        const v = E(u, 0.2 + i * 0.3, 0.6 + i * 0.3); if (v > 0) spans(60, 64 + i * 30, ctok(s.slice(0, Math.round(s.length * v))), { 'font-size': 14 }); });
      const d = pop(u, 1.1); card(480, 250, 150, 96, { rx: 8, text: 'user.proto\n메시지 6 · rpc 3', fs: 15, stroke: ACC, s: d });
      grow(400, 250, 230, 250, E(u, 1.5, 2.0), ACC); grow(560, 250, 730, 250, E(u, 1.5, 2.0), ACC);
      card(150, 250, 150, 60, { text: '서버 코드', fs: 15, s: pop(u, 1.9) }); card(810, 250, 150, 60, { text: '클라이언트 코드', fs: 15, s: pop(u, 1.9) });
      sub(480, 350, '양쪽이 같은 파일에서 같은 타입을 만든다', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); check(480, 384, 11, pop(u, 2.4)); return; }
    if (k === 6) { const g = E(u, 0.8, 1.8);
      lbl(80, 70, 'REST', 1, { 'text-anchor': 'start', fill: MUT }); mono(170, 70, 'GET /users/42', { 'font-size': 15, opacity: fade(u, 0.2) });
      mono(80, 108, '{"id":"u-42","name":"Alice","email":"alice@ex.com","age":30}', { 'font-size': 14, fill: INK, opacity: fade(u, 0.4) });
      R.hbar(80, 128, 600, 60 * g, 60, { h: 22, text: Math.round(60 * g) + ' B', col: OFF });
      sub(820, 108, '스키마 = 문서', fade(u, 0.6), { fill: INK, 'font-size': 14.5 });
      lbl(80, 220, 'gRPC', 1, { 'text-anchor': 'start', fill: ACC }); mono(170, 220, 'GetUser({user_id})', { 'font-size': 15, opacity: fade(u, 0.3) });
      mono(80, 258, '0a 04 75 2d 34 32 12 05 41 6c 69 63 65 1a 0c …', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.5) });
      R.hbar(80, 278, 600, 29 * g, 60, { h: 22, text: Math.round(29 * g) + ' B', col: ACC });
      sub(820, 258, '스키마 = .proto 강제', fade(u, 0.7), { fill: ACC, 'font-size': 14.5, 'font-weight': 700 });
      sub(480, 360, '같은 사용자 한 명: JSON 60 바이트, Protobuf 29 바이트 (공백 없는 JSON 기준)', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    // k7 코드 생성
    card(110, 200, 140, 80, { rx: 8, text: 'user.proto', mono: true, fs: 15, stroke: ACC });
    const gp = pop(u, 0.4); card(330, 200, 120, 70, { rx: 35, text: 'protoc', mono: true, fs: 17, fw: 800, fill: INK, stroke: 'none', color: PANEL, s: gp });
    dot([[180, 200], [270, 200]], seg(u, 0.3, 0.9), ACC, 7);
    [['user_pb2.py', '메시지 클래스', 90], ['user_pb2_grpc.py', 'Stub · Servicer', 160], ['user.pb.go', '메시지 구조체', 240], ['user_grpc.pb.go', 'Client · Server 인터페이스', 310]].forEach(([f, d, y], i) => {
      const a = 1.0 + i * 0.3; grow(390, 200, 520, y, E(u, a, a + 0.4), ACC);
      if (u > a + 0.3) { pill(620, y, f, i < 2 ? INFO : ACC, pop(u, a + 0.3), { mono: true, fs: 14 }); tx(730, y + 5, d, { 'font-size': 14, fill: MUT, opacity: fade(u, a + 0.5) }); } });
    sub(330, 270, 'python 은 grpc_tools 로 직접 생성', fade(u, 2.3)); sub(480, 392, '손으로 쓰는 직렬화·전송 코드가 0줄이 된다', fade(u, 2.5), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 2. 서버 핸들러 ----------
  const SV = { hx: 560, hy: 200 };
  function handler(lab, o) { o = o || {}; card(SV.hx, SV.hy, 230, 120, { rx: 12, stroke: o.col || ACC, sw: 2.5, fill: PANEL });
    mono(SV.hx, SV.hy - 34, 'GetUser(ctx, req)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: o.col || ACC });
    if (lab) tx(SV.hx, SV.hy + 4, lab, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: o.lc || INK }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { lbl(480, 46, 'server.go 가 가져오는 네 조각', 1);
      [['grpc', '서버 본체 · Serve'], ['codes', '상태 코드 번호표'], ['status', '코드 + 메시지 = 에러'], ['pb', '생성된 user.v1 코드']].forEach(([n, d], i) => {
        const y = lerp(92 + i * 66, 120 + i * 66, E(u, 0.2 + i * 0.3, 0.8 + i * 0.3)), x = 300;
        if (u < 0.2 + i * 0.3) return;
        card(x, y, 150, 50, { rx: 8, text: n, mono: true, fs: 16, fw: 800, stroke: i === 3 ? ACC : INK, color: i === 3 ? ACC : INK, op: fade(u, 0.2 + i * 0.3, 0.5) });
        tx(x + 100, y + 5, d, { 'font-size': 15, opacity: fade(u, 0.7 + i * 0.3) }); });
      sub(480, 400, 'codes·status 가 있어야 실패를 번호로 실어 보낸다', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { zone(40, 50, 380, 250, 'UserServiceServer (생성된 인터페이스)', { fill: SOFT });
      ['GetUser', 'CreateUser', 'DeleteUser'].forEach((m, i) => mono(70, 110 + i * 40, m + '(…)', { 'font-size': 15, opacity: fade(u, 0.2 + i * 0.15) }));
      zone(520, 50, 400, 250, 'userServer', { fill: ACCBG, color: ACC, stroke: ACC, sw: 2 });
      const ep = pop(u, 0.8); card(720, 120, 340, 44, { rx: 8, text: 'Unimplemented…Server (임베드)', fs: 14.5, stroke: MUT, dash: '5 4', s: ep });
      [['GetUser', '직접 구현', GOOD], ['CreateUser', 'UNIMPLEMENTED (12)', WARN], ['DeleteUser', 'UNIMPLEMENTED (12)', WARN]].forEach(([m, r, col], i) => {
        const y = 186 + i * 36, op = fade(u, 1.3 + i * 0.3); mono(560, y, m, { 'font-size': 14.5, 'font-weight': 700, opacity: op }); mono(900, y, r, { 'font-size': 14, fill: col, 'text-anchor': 'end', 'font-weight': 700, opacity: op }); });
      grow(425, 160, 515, 160, E(u, 1.0, 1.4), ACC);
      sub(480, 350, 'rpc 가 늘어도 빈 자리는 임베드가 채워 컴파일이 깨지지 않는다', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 2) { kvTable(200, 90, 560, [['"u-42"', 'Alice · alice@ex.com · 30', { hot: u > 1.4 }]], { title: 'users  map[string]*GetUserResponse', kw: 130, rh: 44 });
      const r = pop(u, 1.8); card(480, 280, 380, 56, { rx: 10, text: '실무: repository · DB 조회 계층', fs: 15, stroke: INFO, dash: '6 5', color: INFO, s: r });
      grow(480, 170, 480, 248, E(u, 1.6, 2.0), INFO, { dash: '5 4' }); sub(480, 360, '핸들러는 얇게, 조회는 다른 계층으로', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 3) { handler('func 하나', {});
      [['ctx', 120, 0.3], ['req *GetUserRequest', 280, 0.6]].forEach(([s, y, a]) => { grow(170, y, SV.hx - 120, SV.hy + (y < 200 ? -20 : 20), E(u, a, a + 0.5), INK); pill(150, y, s, INK, pop(u, a), { mono: true, fs: 14 }); });
      [['*GetUserResponse', 150, GOOD, 1.1], ['error', 250, BAD, 1.4]].forEach(([s, y, col, a]) => { grow(SV.hx + 120, SV.hy + (y < 200 ? -20 : 20), 790, y, E(u, a, a + 0.5), col); pill(850, y, s, col, pop(u, a + 0.4), { mono: true, fs: 14 }); });
      ['데드라인', '취소', 'metadata'].forEach((s, i) => { const x = 80 + i * 110; card(x, 60, 98, 32, { rx: 16, text: s, fs: 14, stroke: INFO, color: INFO, s: pop(u, 1.8 + i * 0.2) }); });
      grow(150, 78, 150, 102, E(u, 1.8, 2.1), INFO); sub(480, 380, '원격 호출이어도 모양은 보통 함수와 같다', fade(u, 2.4), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 4) { handler(u > 1.1 ? 'user_id == "" ?' : '검사 중', { col: u > 1.1 ? BAD : ACC, lc: u > 1.1 ? BAD : INK }); person(120, 200, 'Client');
      fly(170, 170, 440, 170, seg(u, 0.2, 1.0), 'user_id: ""', { mono: true, stay: u < 1.1 });
      if (u > 1.4) { fly(440, 260, 300, 260, seg(u, 1.4, 2.2), 'status 3 · InvalidArgument', { mono: true, fill: BAD, stay: true }); }
      mono(560, 330, '"user_id 는 필수입니다"', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) });
      sub(560, 370, 'DB 까지 가지 않고 그 자리에서 거절', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 5) { kvTable(330, 60, 300, [['"u-42"', 'Alice', { op: 1 }]], { title: 'users', kw: 110, rh: 40 });
      fly(130, 150, 330, 100, seg(u, 0.2, 0.9), 'user_id: "u-99"', { mono: true });
      if (u > 0.9) { const sx = lerp(345, 600, E(u, 0.9, 1.5)); el('rect', { x: sx, y: 92, width: 26, height: 30, rx: 4, fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); }
      if (u > 1.5) mono(480, 160, 'ok == false', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      stat(480, 210, 'status 5 · NotFound', BAD, pop(u, 1.7)); mono(480, 248, '"user u-99 없음"', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      card(480, 330, 520, 60, { rx: 10, stroke: GRID, s: pop(u, 2.1) });
      spans(240, 336, [['fmt.Errorf(…) 로 돌려주면  ', { fill: INK }], ['status 2 · Unknown', { fill: WARN, 'font-weight': 800 }]], { 'font-size': 15, opacity: fade(u, 2.2) });
      if (u > 2.4) cross(712, 330, 11, 1); return; }
    if (k === 6) { kvTable(330, 60, 300, [['"u-42"', 'Alice', { hot: u > 1.0 }]], { title: 'users', kw: 110, rh: 40 });
      fly(130, 150, 330, 100, seg(u, 0.2, 0.9), 'user_id: "u-42"', { mono: true });
      if (u > 1.2) { check(660, 112, 12, pop(u, 1.2)); }
      card(480, 250, 300, 92, { rx: 10, stroke: GOOD, fill: GOODBG, s: pop(u, 1.4) });
      ['id: "u-42"  name: "Alice"', 'email: "alice@ex.com"  age: 30'].forEach((s, i) => mono(480, 242 + i * 24, s, { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.6) }));
      mono(480, 330, 'return user, nil', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      fly(330, 380, 120, 380, seg(u, 2.0, 2.7), '응답 1개', { fill: GOOD }); return; }
    if (k === 7) { const gs = pop(u, 0.2); card(240, 210, 220, 160, { rx: 12, stroke: INK, sw: 2.5, s: gs }); mono(240, 150, 'grpc.Server', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: gs });
      pill(110, 210, ':50051', ACC, pop(u, 0.5), { mono: true });
      [['/user.v1.UserService/GetUser', 'GetUser'], ['/user.v1.UserService/CreateUser', 'CreateUser'], ['/user.v1.UserService/DeleteUser', 'DeleteUser']].forEach(([p, h], i) => {
        const y = 110 + i * 70, a = 0.9 + i * 0.35; grow(355, 210, 420, y, E(u, a, a + 0.3), ACC);
        if (u > a + 0.2) { mono(430, y + 5, p, { 'font-size': 14, opacity: fade(u, a + 0.2) }); mono(900, y + 5, '→ ' + h, { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, a + 0.3) }); } });
      sub(480, 380, 'RegisterUserServiceServer 가 경로 → 메서드 표를 만든다', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); return; }
    // k8 Serve
    server(560, 190, 'grpc.Server', { lamp: GOOD });
    terminal(40, 70, 330, 110, [['$ go run server.go', null], ['listening :50051', null]], E(u, 0.2, 1.0) * 2, { title: 'server' });
    for (let i = 0; i < 4; i++) { const a = 0.9 + i * 0.4; dot([[120, 320 - i * 6], [490, 200]], seg(u, a, a + 0.6), ACC, 6); }
    const n = Math.min(4, Math.floor(seg(u, 1.3, 2.9) * 5)); mono(560, 300, `처리한 요청 ${n}`, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
    sub(560, 340, 'Serve(lis) 는 여기서 멈춰 계속 받는다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); }

  // ---------- 3. Go 클라이언트 ----------
  function chanBox(x, y, state, col, s) { card(x, y, 200, 76, { rx: 12, stroke: col || INK, sw: 2.5, s }); mono(x, y - 8, 'conn (채널)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s ?? 1 });
    pill(x, y + 20, state, col || MUT, s, { mono: true, fs: 13.5 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { [['grpc', 'NewClient · 채널'], ['credentials/insecure', 'TLS 없이 연결'], ['pb', 'NewUserServiceClient']].forEach(([n, d], i) => {
        const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.4); card(x, 150, 260, 60, { rx: 10, text: n, mono: true, fs: 15, fw: 800, s, stroke: i === 2 ? ACC : i === 1 ? WARN : INK, color: i === 2 ? ACC : INK });
        tx(x, 205, d, { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5 + i * 0.4) }); });
      lock(480, 300, false, WARN, pop(u, 1.8)); sub(480, 345, 'insecure 는 로컬 개발용. 운영에서는 TLS 자격증명으로 바꾼다', fade(u, 2.0), { fill: WARN, 'font-weight': 700, 'font-size': 14.5 }); return; }
    if (k === 1) { chanBox(220, 200, u > 0.8 ? 'IDLE' : '…', MUT, pop(u, 0.2)); server(780, 200, 'localhost:50051', { s: 0.85 });
      el('line', { x1: 330, y1: 200, x2: 700, y2: 200, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': '6 7', opacity: fade(u, 0.6) });
      mono(515, 185, 'TCP 아직 없음', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
      ['첫 호출', 'CONNECTING', 'READY'].forEach((s, i) => pill(300 + i * 180, 320, s, i === 2 ? GOOD : i === 1 ? WARN : INK, pop(u, 1.4 + i * 0.35), { mono: i > 0, fs: 14 }));
      grow(355, 320, 415, 320, E(u, 1.7, 1.9), MUT); grow(545, 320, 595, 320, E(u, 2.0, 2.2), MUT);
      sub(480, 380, '주소만 잡아 두고, 연결은 처음 부를 때 맺힌다', fade(u, 2.4), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 2) { const x0 = 80, x1 = 880; el('line', { x1: x0, y1: 140, x2: lerp(x0, x1, E(u, 0.2, 1.4)), y2: 140, stroke: INK, 'stroke-width': 3 });
      tx(x0, 120, 'main() 수명', { 'font-size': 14.5, fill: MUT, 'font-weight': 600 }); pill(x0 + 40, 180, 'NewClient', INK, pop(u, 0.2), { mono: true, fs: 14 });
      for (let i = 0; i < 6; i++) { const x = 220 + i * 100, s = pop(u, 0.6 + i * 0.18); el('circle', { cx: x, cy: 140, r: 9 * s, fill: ACC }); if (i === 0) tx(x, 112, 'GetUser 호출', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'start', opacity: s }); }
      pill(x1 - 60, 180, 'defer conn.Close()', GOOD, pop(u, 1.8), { mono: true, fs: 14 });
      sub(480, 250, '연결 하나를 앱이 살아 있는 동안 여러 호출이 같이 쓴다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 });
      card(480, 320, 380, 50, { rx: 10, stroke: BAD, dash: '5 4', s: pop(u, 2.3) }); tx(480, 326, '호출마다 NewClient · Close', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.3) }); if (u > 2.5) cross(690, 320, 11, 1); return; }
    if (k === 3) { chanBox(260, 220, 'IDLE', MUT);
      const s = pop(u, 0.4); card(260, 220, 300, 160, { rx: 14, stroke: ACC, sw: 2.5, fill: 'none', s }); mono(260, 160, 'client (stub)', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: s });
      pill(620, 150, 'client.GetUser(ctx, req)', ACC, pop(u, 1.0), { mono: true }); grow(415, 175, 520, 155, E(u, 1.0, 1.3), ACC);
      ['직렬화', 'HTTP/2 전송', '역직렬화'].forEach((n, i) => { card(560 + i * 130, 260, 116, 40, { rx: 8, text: n, fs: 14, stroke: GRID, dash: '4 4', color: MUT, s: pop(u, 1.5 + i * 0.25) }); });
      sub(690, 310, '안에서 해 주는 일 (안 보인다)', fade(u, 2.2)); return; }
    if (k === 4) { const ax = R.axes(120, 120, 720, 160, { x: [0, 4], y: [0, 1], xt: [0, 1, 2, 3, 4], xl: '초' });
      el('line', { x1: ax.X(3), y1: 100, x2: ax.X(3), y2: 282, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 0.3) });
      mono(ax.X(3), 92, '데드라인 3s', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      const w = E(u, 0.6, 2.2) * 4; el('rect', { x: ax.X(0), y: 150, width: ax.X(Math.min(w, 3)) - ax.X(0), height: 30, rx: 6, fill: WARN, opacity: 0.85 });
      tx(ax.X(0) + 10, 171, '느린 서버 (4초 걸림)', { 'font-size': 14.5, 'font-weight': 700, fill: PANEL, opacity: fade(u, 0.7) });
      if (w > 3) stat(ax.X(3) + 110, 165, 'DEADLINE_EXCEEDED', BAD, pop(u, 1.8));
      el('rect', { x: ax.X(0), y: 210, width: Math.max(2, ax.X(w) - ax.X(0)), height: 30, rx: 6, fill: OFF });
      tx(ax.X(0) + 10, 231, '데드라인 없음', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.7) });
      if (u > 2.2) mono(ax.X(4) + 10, 231, '…계속 대기', { 'font-size': 14.5, fill: MUT });
      sub(480, 380, '실측: timeout 3초에 4초 걸리는 서버를 부르면 3.00초에 끊긴다', fade(u, 2.4), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 5) { const st = [['Go 구조체', 'UserId: "u-42"', 100], ['protobuf', '0a 04 75 2d 34 32', 330], ['HTTP/2 DATA', '00 00 00 00 06 + 6B', 580], ['서버', 'GetUser 실행', 820]];
      st.forEach(([n, v, x], i) => { const a = 0.2 + i * 0.5; card(x, 130, 200, 70, { rx: 10, stroke: i === 3 ? ACC : INK, s: pop(u, a) }); tx(x, 122, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, a) });
        mono(x, 148, v, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, a + 0.1) }); if (i) grow(st[i - 1][2] + 104, 130, x - 104, 130, E(u, a - 0.2, a), ACC); });
      el('rect', { x: 100, y: 240, width: 760 * E(u, 0.2, 2.6), height: 30, rx: 6, fill: WARN, opacity: 0.8 });
      tx(110, 261, '이 goroutine 은 응답이 올 때까지 멈춰 있다 (blocking)', { 'font-size': 14.5, 'font-weight': 700, fill: INK, opacity: fade(u, 0.6) });
      sub(480, 330, '5바이트 머리 = 압축 여부 1 + 길이 4', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 6) { fly(820, 120, 160, 120, seg(u, 0.2, 1.0), '0a 04 75 2d 34 32 12 05 41 6c …', { mono: true, fill: INK, stay: true });
      ['resp.Id = "u-42"', 'resp.Name = "Alice"', 'resp.Age = 30 (int32)'].forEach((s, i) => mono(110, 190 + i * 30, s, { 'font-size': 15, opacity: fade(u, 1.0 + i * 0.25) }));
      card(480, 160, 120, 40, { rx: 8, text: 'err == nil ?', mono: true, fs: 14, stroke: GOOD, s: pop(u, 0.9) });
      terminal(460, 220, 440, 90, [['id=u-42 name=Alice age=30', null]], E(u, 1.8, 2.4), { title: 'client' });
      sub(480, 380, 'JSON 파싱 없이 필드가 타입째 들어 있다', fade(u, 2.4), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 7 || k === 8) { const lane = (y, name, col) => { tx(40, y + 5, name, { 'font-size': 15, 'font-weight': 700, fill: col }); el('line', { x1: 160, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 2 }); };
      lane(120, 'main', INK); lane(240, 'goroutine', ACC);
      const g = k === 7 ? E(u, 0.3, 2.4) : 1;
      el('rect', { x: 200, y: 226, width: 420 * g, height: 28, rx: 6, fill: ACC, opacity: 0.8 }); if (g > 0.1) mono(212, 245, 'client.GetUser(…) 대기', { 'font-size': 14, fill: PANEL, 'font-weight': 700 });
      el('rect', { x: 200, y: 106, width: (k === 7 ? 560 * E(u, 0.3, 2.4) : 300), height: 28, rx: 6, fill: OFF });
      mono(212, 125, '다른 일', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, k === 7 ? 0.6 : 0) });
      grow(200, 140, 200, 210, k === 7 ? E(u, 0.2, 0.5) : 1, ACC); mono(208, 182, 'go func()', { 'font-size': 14, fill: ACC, opacity: k === 7 ? fade(u, 0.4) : 1 });
      if (k === 7) { sub(480, 330, '같은 동기 호출을 goroutine 하나에 맡겼을 뿐이다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
      el('rect', { x: 500, y: 106, width: 120 * E(u, 0.2, 1.0), height: 28, rx: 6, fill: WARN, opacity: 0.85 }); if (u > 0.5) mono(510, 125, '<-done', { 'font-size': 14, 'font-weight': 700 });
      grow(620, 226, 620, 140, E(u, 1.0, 1.5), GOOD); mono(630, 190, 'done <- r', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.2) });
      terminal(560, 290, 360, 70, [['비동기 결과: Alice', null]], E(u, 1.6, 2.2), { title: 'client' });
      sub(270, 330, '기다리는 자리만 옮겨졌고, 호출은 여전히 요청 1 · 응답 1', fade(u, 2.3), { 'font-size': 14 }); return; } }

  // ---------- 4. Python 클라이언트 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { card(130, 200, 150, 70, { rx: 8, text: 'user.proto', mono: true, fs: 15, stroke: ACC });
      grow(210, 190, 360, 130, E(u, 0.3, 0.8), ACC); grow(210, 210, 360, 270, E(u, 0.5, 1.0), ACC);
      [['user_pb2', 'GetUserRequest · GetUserResponse', 130], ['user_pb2_grpc', 'UserServiceStub · Servicer', 270]].forEach(([n, d, y], i) => {
        pill(470, y, n, ACC, pop(u, 0.8 + i * 0.3), { mono: true, fs: 15 }); tx(560, y + 5, d, { 'font-size': 14.5, opacity: fade(u, 1.1 + i * 0.3) }); });
      sub(480, 370, 'Go 와 파일 이름만 다르고 들어 있는 것은 같다', fade(u, 2.1), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { code(120, 120, ['def get_user(user_id: str) -> None:', '    """user_id 로 단건 조회 — 동기 Unary 호출."""'], E(u, 0.2, 1.2) * 2, { box: 640 });
      pill(300, 250, 'user_id: str', INK, pop(u, 1.3), { mono: true }); grow(380, 250, 560, 250, E(u, 1.6, 2.0), ACC); pill(660, 250, '요청 1 · 응답 1', ACC, pop(u, 2.0));
      sub(480, 330, '호출 한 번이 끝날 때까지 이 함수가 기다린다', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 2) { el('rect', { x: 120, y: 80, width: 8, height: 230 * E(u, 0.2, 1.2), fill: ACC, rx: 3 });
      code(150, 100, ['with grpc.insecure_channel("localhost:50051") as channel:', '    stub = user_pb2_grpc.UserServiceStub(channel)', '    …  호출들  …'], E(u, 0.2, 1.4) * 3, { fs: 14.5 });
      pill(250, 230, 'channel 열림', GOOD, pop(u, 0.6), { fs: 14 }); pill(250, 330, 'channel 닫힘', MUT, pop(u, 1.8), { fs: 14 });
      sub(600, 290, '블록을 벗어나면 자동으로 닫힌다', fade(u, 2.0), { 'font-size': 15, fill: INK }); sub(600, 320, 'Go 의 defer conn.Close() 자리', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 3) { spans(80, 110, ctok('GetUserRequest(user_id="u-42")'), { 'font-size': 17, opacity: fade(u, 0.2) }); check(470, 104, 11, pop(u, 0.6));
      mono(520, 110, '0a 04 75 2d 34 32', { 'font-size': 15, fill: ACC, opacity: fade(u, 0.8) });
      spans(80, 210, ctok('GetUserRequest(userid="u-42")'), { 'font-size': 17, opacity: fade(u, 1.1) }); cross(470, 204, 11, pop(u, 1.4));
      card(480, 290, 720, 56, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 1.6) });
      mono(480, 296, 'ValueError: Protocol message GetUserRequest has no "userid" field.', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.7) });
      sub(480, 370, '스키마에 없는 필드는 보내기 전에 막힌다 (실행 결과)', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 4) { const sec = tween(0, 3, u, 2.0); clock(200, 190, 70, clamp(sec / 3), WARN, `timeout=3.0 · ${sec.toFixed(1)}s`);
      code(340, 130, ['response = stub.GetUser(request, timeout=3.0)', 'print(f"name={response.name} age={response.age}")'], E(u, 0.2, 1.0) * 2, { fs: 14.5 });
      terminal(340, 200, 540, 80, [['name=Alice age=30', null]], E(u, 1.0, 1.4), { title: '빠른 서버' });
      if (u > 2.2) stat(610, 330, '느린 서버면 3.00s 에 DEADLINE_EXCEEDED', BAD, pop(u, 2.2)); return; }
    if (k === 5) { ends({ y: 120 }); el('line', { x1: 185, y1: 120, x2: 775, y2: 120, stroke: GRID, 'stroke-width': 2 });
      fly(775, 120, 185, 120, seg(u, 0.2, 1.0), 'grpc-status: 5', { mono: true, fill: BAD });
      card(330, 270, 420, 130, { rx: 12, stroke: BAD, sw: 2.5, s: pop(u, 1.0) }); mono(330, 230, 'except grpc.RpcError as e', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      [['e.code()', 'StatusCode.NOT_FOUND'], ['e.details()', "'user u-99 없음'"]].forEach(([a, b], i) => { const op = fade(u, 1.4 + i * 0.4); mono(140, 272 + i * 34, a, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(290, 272 + i * 34, b, { 'font-size': 15, fill: BAD, opacity: op }); });
      sub(760, 270, 'Go 는 error 값', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); sub(760, 296, 'Python 은 예외', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 6) { pill(130, 210, 'e.code()', INK, pop(u, 0.2), { mono: true, fs: 15 });
      [['NOT_FOUND · 5', '없는 사용자: …', '다시 불러도 같다', 90, BAD], ['DEADLINE_EXCEEDED · 4', '서버 응답 지연', '잠시 뒤 다시 해 볼 만하다', 210, WARN], ['그 밖 (UNKNOWN 2 …)', '기타 오류 [코드]', '코드를 로그로 남긴다', 330, MUT]].forEach(([n, a, b, y, col], i) => {
        const at = 0.5 + i * 0.5; grow(200, 210, 300, y, E(u, at, at + 0.3), col);
        if (u > at + 0.2) { pill(420, y, n, col, pop(u, at + 0.2), { mono: true, fs: 14 }); tx(560, y - 2, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, at + 0.4) }); tx(560, y + 20, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, at + 0.5) }); } });
      return; }
    if (k === 7) { lbl(240, 60, '동기', 1, { fill: MUT }); lbl(720, 60, 'grpc.aio', 1, { fill: ACC });
      el('line', { x1: 480, y1: 40, x2: 480, y2: 330, stroke: GRID, 'stroke-dasharray': '5 6', 'stroke-width': 1.5 });
      const L = [['with grpc.insecure_channel(…) as ch:', ''], ['  stub = UserServiceStub(ch)', ''], ['  r = stub.GetUser(req, timeout=3.0)', '']];
      const A = [['async with grpc.aio.insecure_channel(…) as ch:', 'async'], ['  stub = UserServiceStub(ch)', ''], ['  r = await stub.GetUser(req, timeout=3.0)', 'await']];
      L.forEach(([s], i) => spans(30, 120 + i * 40, ctok(s), { 'font-size': 13.5, opacity: fade(u, 0.2 + i * 0.2) }));
      A.forEach(([s, h], i) => { const y = 120 + i * 40; if (h && u > 1.4) { const x0 = 500 + tw(s.slice(0, s.indexOf(h)), 13.5); el('rect', { x: x0 - 3, y: y - 16, width: tw(h, 13.5) + 6, height: 22, rx: 4, fill: ACCBG }); }
        spans(500, y, ctok(s), { 'font-size': 13.5, opacity: fade(u, 0.6 + i * 0.2) }); });
      sub(480, 300, '메서드 이름·인자는 그대로, async 와 await 만 붙는다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    // k8 실행
    terminal(120, 70, 720, 190, [['$ python client.py', null], ['name=Alice age=30', null], ['없는 사용자: user u-99 없음', null]], E(u, 0.2, 1.6) * 3, { title: 'get_user("u-42") · get_user("u-99")', fs: 15, lh: 30 });
    pill(300, 320, 'u-42 → 응답', GOOD, pop(u, 1.8)); pill(640, 320, 'u-99 → RpcError(NOT_FOUND)', BAD, pop(u, 2.1), { mono: true, fs: 13.5 });
    sub(480, 380, 'python 으로 서버까지 띄워 실제로 찍은 출력이다', fade(u, 2.4), { 'font-size': 14 }); }

  // ---------- 5. 정리 ----------
  function mode(cx, cy, name, a, b, hot, s) { card(cx, cy, 200, 112, { rx: 12, stroke: hot ? ACC : GRID, sw: hot ? 2.8 : 1.6, fill: hot ? ACCBG : PANEL, s });
    if (s < 0.5) return; tx(cx, cy - 32, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? ACC : INK });
    for (let i = 0; i < a; i++) el('rect', { x: cx - 70 + i * 16, y: cy - 10, width: 12, height: 12, rx: 3, fill: INK });
    for (let i = 0; i < b; i++) el('rect', { x: cx + 70 - i * 16 - 12, y: cy + 14, width: 12, height: 12, rx: 3, fill: ACC });
    grow(cx - 70, cy + 4, cx + 70, cy + 4, 1, MUT, { sw: 1.4 }); mono(cx, cy + 46, `${a > 1 ? 'N' : '1'} : ${b > 1 ? 'N' : '1'}`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['① Unary', 1, 1], ['② Server Stream', 1, 3], ['③ Client Stream', 3, 1], ['④ Bidi', 3, 3]].forEach(([n, a, b], i) => mode(120 + i * 240, 170, n, a, b, i === 0, pop(u, 0.2 + i * 0.3)));
      banner(120, 290, '지금 여기', pop(u, 1.6)); sub(600, 300, '나머지 셋은 stream 이 어느 쪽에 붙는지만 다르다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { spans(60, 150, [['rpc GetUser(', {}], ['      ', {}], ['GetUserRequest) returns (', {}], ['      ', {}], ['GetUserResponse);', {}]], { 'font-size': 18, opacity: fade(u, 0.2) });
      [[188, 0.6], [535, 0.9]].forEach(([x, a]) => { el('rect', { x, y: 128, width: 62, height: 30, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, a) }); mono(x + 31, 192, '비었음', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, a + 0.2) }); });
      banner(480, 270, '두 칸 다 비면 Unary', pop(u, 1.5)); sub(480, 330, '모드를 바꾸려면 코드가 아니라 .proto 를 고친다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 2) { const rows = [['서버', 'func(ctx, req) (resp, error)', 'def GetUser(self, req, ctx)'], ['클라', 'client.GetUser(ctx, req)', 'stub.GetUser(req, timeout=…)']];
      lbl(420, 70, 'Go', 1); lbl(740, 70, 'Python', 1);
      rows.forEach(([r, g, p], i) => { const y = 130 + i * 80, op = fade(u, 0.3 + i * 0.5); tx(80, y + 5, r, { 'font-size': 16, 'font-weight': 700, opacity: op });
        card(420, y, 280, 50, { rx: 8, text: g, mono: true, fs: 13.5, stroke: GRID, op }); card(740, y, 290, 50, { rx: 8, text: p, mono: true, fs: 13.5, stroke: GRID, op });
        grow(562, y, 593, y, E(u, 0.5 + i * 0.5, 0.8 + i * 0.5), MUT, { plain: true }); });
      sub(480, 330, '언어가 달라도 자리와 순서가 같다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 3) { [['0', 'OK', GOOD], ['2', 'UNKNOWN', WARN], ['3', 'INVALID_ARGUMENT', BAD], ['4', 'DEADLINE_EXCEEDED', BAD], ['5', 'NOT_FOUND', BAD]].forEach(([n, s, col], i) => {
        const y = 80 + i * 52, op = fade(u, 0.2 + i * 0.25); mono(90, y + 6, n, { 'font-size': 20, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: op }); mono(110, y + 6, s, { 'font-size': 15, opacity: op }); });
      clock(700, 170, 70, E(u, 0.8, 2.2), WARN, 'WithTimeout · timeout=3.0');
      sub(700, 320, '에러는 번호로, 기다림은 시한으로', fade(u, 2.2), { fill: INK, 'font-size': 15 }); return; }
    if (k === 4) { ['호출마다 데드라인(timeout)을 건다', '에러는 status 코드로 돌려준다', '스트리밍은 정말 필요할 때만 쓴다'].forEach((s, i) => {
        const y = 110 + i * 80, sc = pop(u, 0.2 + i * 0.45); card(480, y, 560, 60, { rx: 12, stroke: GOOD, s: sc }); check(240, y, 12, sc); tx(275, y + 6, s, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.45) }); });
      return; }
    // k5 다음: 응답 1개가 N개로
    person(130, 200, 'Client'); server(830, 200, 'Server', { s: 0.8 }); el('line', { x1: 180, y1: 200, x2: 770, y2: 200, stroke: GRID, 'stroke-width': 2 });
    const sp = E(u, 0.8, 1.8); for (let i = 0; i < 4; i++) { const x = lerp(480, 300 + i * 120, sp); if (i === 0 || sp > 0) card(x, 160, 100, 34, { rx: 17, text: i === 0 && sp < 0.05 ? 'Resp' : 'Resp #' + (i + 1), fs: 13.5, mono: true, fill: ACC, stroke: 'none', color: PANEL, op: i === 0 ? 1 : sp }); }
    spans(220, 300, [['returns (', {}], ['stream', { fill: ACC, 'font-weight': 800 }], [' GetUserResponse)', {}]], { 'font-size': 18, opacity: fade(u, 1.6) });
    sub(480, 360, '다음 장 II-1-2: 요청 1 · 응답 N (Server Streaming)', fade(u, 2.2), { fill: INK, 'font-size': 15 }); }

  const quiz = [
    { q: 'GetUserRequest{user_id: "u-42"}를 직렬화한 6바이트에서 맨 앞 0a는 무엇인가?',
      o: ['필드 이름 user_id의 해시', '필드 번호 1과 형식 2를 합친 태그', '메시지 전체 길이'], a: 1,
      why: '태그는 필드 번호×8+형식이다. 1×8+2 = 10 = 0x0a이고, 이어지는 04가 길이, 나머지 4바이트가 "u-42"이다.' },
    { q: '서버가 없는 사용자를 fmt.Errorf로 돌려주면 클라이언트는 어떤 코드를 받나?',
      o: ['NotFound (5)', 'Unknown (2)', 'OK (0)'], a: 1,
      why: '상태 코드를 실어 보내지 않으면 클라이언트는 Unknown으로 받는다. 분기하려면 status.Error(codes.NotFound, …)로 보내야 한다.' },
    { q: 'grpc.NewClient를 부른 직후 채널 상태는 어떠한가?',
      o: ['이미 TCP 연결이 맺혀 READY다', '서버에 요청 하나를 보낸 상태다', '주소만 잡아 둔 IDLE이고 첫 호출 때 연결한다'], a: 2,
      why: '채널은 연결 관리자다. 실행해 보면 호출 전 IDLE, 첫 호출에서 CONNECTING, READY로 넘어간다.' },
    { q: 'Python에서 서버가 NotFound를 보내면 클라이언트 코드는 무엇으로 알아채나?',
      o: ['grpc.RpcError 예외의 e.code()', '응답 메시지의 error 필드', 'HTTP 상태 404'], a: 0,
      why: '서버가 보낸 status는 RpcError 예외가 된다. e.code()는 StatusCode.NOT_FOUND, e.details()는 "user u-99 없음"이다.' },
    { q: '.proto에서 rpc를 Unary로 만드는 것은 무엇인가?',
      o: ['서버 핸들러를 동기로 짜는 것', '요청·응답 타입 어느 쪽에도 stream이 없는 것', 'timeout을 거는 것'], a: 1,
      why: '모드는 계약이 정한다. 요청과 응답 앞이 모두 비어 있으면 요청 1 · 응답 1인 Unary다.' },
  ];
  const summary = [
    'Unary는 요청 하나에 응답 하나를 주고받는 원격 함수 호출이다.',
    '.proto의 필드 번호가 바이트의 태그가 되어, 사용자 하나가 JSON 60바이트 대신 29바이트로 간다.',
    '서버는 실패를 status 코드로 보내야 클라이언트가 NOT_FOUND와 DEADLINE_EXCEEDED를 가른다.',
    '호출은 응답이 올 때까지 멈추므로 3초 같은 데드라인을 꼭 건다.',
  ];
  const review = [
    { q: '클라이언트 로그에 에러가 전부 Unknown으로만 찍힌다. 먼저 의심할 것은?',
      o: ['서버가 status 코드 없이 일반 에러를 돌려준다', '클라이언트 timeout이 너무 길다', '.proto 필드 번호가 겹친다'], a: 0,
      why: '코드를 싣지 않은 에러는 Unknown(2)으로 도착한다. 서버에서 status.Error로 NotFound(5) 같은 코드를 보내야 한다.' },
    { q: '서버 하나가 가끔 멈추자 그 서버를 부르는 클라이언트 요청이 끝없이 쌓였다. 무엇이 빠졌나?',
      o: ['채널을 호출마다 새로 만드는 코드', '호출에 거는 데드라인', 'Unimplemented 임베드'], a: 1,
      why: 'Unary 호출은 응답이 올 때까지 멈춘다. timeout을 3초로 걸면 3.00초에 DEADLINE_EXCEEDED로 끊긴다.' },
    { q: 'user.proto의 GetUserResponse에서 age 필드 번호 4를 5로 바꿔 서버만 배포했다. 무슨 일이 생기나?',
      o: ['JSON처럼 이름으로 찾아 그대로 읽힌다', '컴파일이 안 되어 배포가 막힌다', '옛 클라이언트는 4번만 찾으므로 age를 0으로 읽는다'], a: 2,
      why: 'wire에는 이름이 아니라 번호가 실린다. 태그가 0x20에서 0x28로 바뀌면 옛 클라이언트는 모르는 필드로 넘기고 age는 기본값 0이 된다.' },
  ];

  R.page({ title: 'Unary 호출 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
