/* I-1-1 Protocol Buffers IDL — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: .proto 파일 한 장, 필드 번호 배지, 바이트 칸(실측 0A 04 75 2D 34 32 …), 번호 칸(하위 호환).
 * 바이트·크기·오류 문구는 grpcio-tools 1.85(libprotoc 35.1) / protobuf 7.36 으로 직접 돌려 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 도우미 ----------
  const PKW = /^(syntax|package|message|service|rpc|returns|enum|repeated|reserved|string|int32|bool|double|stream)$/;
  function ptoks(line) { const out = [], ci = line.indexOf('//'), code = ci >= 0 ? line.slice(0, ci) : line;
    code.split(/("[^"]*"?|\b\w+\b)/).forEach((w) => { if (!w) return;
      if (w[0] === '"') out.push([w, { fill: ACC }]); else if (PKW.test(w)) out.push([w, { fill: INFO, 'font-weight': 700 }]);
      else if (/^\d+$/.test(w)) out.push([w, { fill: WARN, 'font-weight': 700 }]); else out.push([w, {}]); });
    if (ci >= 0) out.push([line.slice(ci), { fill: MUT }]); return out; }
  // .proto 파일 카드: shown 줄까지 보임(소수면 마지막 줄을 타이핑), hi 는 강조 줄 번호 배열
  function doc(x, y, w, h, name, lines, shown, hi, o) { o = o || {}; const lh = o.lh || 27, fs = o.fs || 14.5;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    el('path', { d: `M${x},${y + 32} H${x + w}`, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 21, name, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const n = Math.ceil(shown);
    lines.forEach((ln, i) => { if (i >= n) return; const yy = y + 54 + i * lh, part = i === n - 1 && shown % 1 ? ln.slice(0, Math.round(ln.length * (shown % 1))) : ln;
      if (hi && hi.includes(i)) el('rect', { x: x + 6, y: yy - 18, width: w - 12, height: lh - 2, rx: 4, fill: ACCBG });
      spans(x + 16, yy, ptoks(part), { 'font-size': fs }); }); }
  // 번호 배지
  function badge(cx, cy, n, s, col) { if (s <= 0.01) return; const g = R.G(cx, cy, s);
    el('circle', { cx: 0, cy: 0, r: 14, fill: col || ACC }, g); tx(0, 5, String(n), { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: PANEL, class: 'mono' }, g); }
  // 바이트 칸 한 줄. bytes: ['0A', …], style(i) → {fill, stroke, color}
  function bytes(x, y, arr, o) { o = o || {}; cells(x, y, arr, { w: o.w || 44, h: o.h || 36, gap: o.gap ?? 6, fs: o.fs || 15, style: o.style }); }
  const prevK = (arr, k) => (k > 0 ? arr[k - 1] : 0);

  // ---------- 1. .proto 한 파일 ----------
  const P1 = ['syntax = "proto3";', 'package user.v1;', '', 'message User {', '  string id   = 1;', '  string name = 2;', '}', 'service UserService {', '  rpc GetUser(GetUserRequest)', '      returns (User);', '}'];
  const SHOW1 = [1, 2, 2, 7, 11], HI1 = [[0], [1], [], [3, 4, 5, 6], [7, 8, 9, 10]];
  function pathBar(k, u) {   // /user.v1.UserService/GetUser 를 조각으로
    const parts = [['/', 0], ['user.v1', 1], ['.', 0], ['UserService', 2], ['/', 0], ['GetUser', 3]], fs = 16;
    const ws = parts.map(([s]) => tw(s, fs) + (s.length > 1 ? 18 : 6)), total = ws.reduce((a, b) => a + b, 0) + 4 * (parts.length - 1);
    let x = 712 - total / 2; const y = 80, filled = (role) => role === 0 || role === 1 || k >= 4;
    tx(712, 46, 'rpc 전체 경로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
    parts.forEach(([s, role], i) => { const w = ws[i], cx = x + w / 2; x += w + 4;
      const on = filled(role), fresh = (role === 1 && k === 1) || ((role === 2 || role === 3) && k === 4);
      const op = fresh ? fade(u, 1.1) : 1;
      if (s.length > 1) card(cx, y, w, 38, { rx: 6, stroke: on ? ACC : GRID, dash: on ? null : '5 4', fill: on ? ACCBG : PANEL, sw: 2 });
      if (on) mono(cx, y + 6, s, { 'font-size': fs, 'font-weight': 700, fill: s.length > 1 ? ACC : INK, 'text-anchor': 'middle', opacity: op });
      else mono(cx, y + 6, '?', { 'font-size': fs, fill: OFF, 'text-anchor': 'middle' });
      if (role) tx(cx, y + 42, ['', 'package', 'service', 'rpc'][role], { 'text-anchor': 'middle', 'font-size': 13.5, fill: on ? INK : MUT, opacity: role === 1 && k === 1 ? fade(u, 1.3) : 1 }); });
    if (k === 1) fly(150, 103, 640, 80, seg(u, 0.2, 1.1), 'user.v1', { mono: true }); }
  function fan(k, u) {   // protoc → 언어별 파일
    const a = k === 2 ? 0.2 : -9, outs = ['user.pb.go', 'user_pb2.py', 'user_pb.ts', 'Java 등'];
    grow(466, 250, 540, 250, k === 2 ? E(u, 0.2, 0.6) : 1, MUT);
    card(590, 250, 96, 46, { rx: 8, fill: INK, stroke: 'none', text: 'protoc', fs: 15, fw: 800, color: PANEL, mono: true, s: k === 2 ? pop(u, 0.5) : 1 });
    outs.forEach((s, i) => { const y = 176 + i * 50, at = a + 0.8 + i * 0.25;
      grow(640, 250, 726, y, k === 2 ? E(u, at, at + 0.35) : 1, MUT);
      card(826, y, 190, 36, { rx: 8, stroke: i < 3 ? INFO : GRID, text: s, fs: 14.5, mono: true, color: i < 3 ? INK : MUT, s: k === 2 ? pop(u, at + 0.3) : 1 }); });
    if (k === 2) sub(826, 392, '언어마다 플러그인이 코드를 쓴다', fade(u, 2)); }
  function s1(t, c) { const { k, u } = c;
    const shown = lerp(prevK(SHOW1, k), SHOW1[k], E(u, 0.2, 1.4));
    doc(24, 24, 440, 372, 'user.proto', P1, shown, HI1[k]);
    if (k === 0) {
      terminal(498, 34, 440, 150, ['$ protoc nosyntax.proto', 'No edition or syntax specified', '(Defaulted to "syntax = "proto2";")'], E(u, 0.4, 1.8) * 3, { title: 'syntax 줄이 없으면' });
      pill(590, 250, 'required', BAD, pop(u, 1.9), { mono: true, fs: 15 }); cross(590, 250, 16, pop(u, 2.1));
      tx(660, 256, 'proto3에는 required가 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      sub(718, 318, '모든 필드가 선택이고, 안 보내면 기본값', fade(u, 2.3)); return; }
    pathBar(k, u);
    if (k === 1) { sub(712, 170, '같은 이름의 message가 있어도 package로 갈린다', fade(u, 1.6)); return; }
    fan(k, u);
    if (k === 3) { tx(500, 372, 'message User', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.6) });
      [[1, 'id', 690], [2, 'name', 800]].forEach(([n, s, x], i) => { badge(x, 366, n, pop(u, 0.9 + i * 0.3)); mono(x + 22, 372, s, { 'font-size': 15, opacity: fade(u, 1.0 + i * 0.3) }); });
      sub(712, 404, '= 뒤 숫자는 값이 아니라 필드 번호', fade(u, 1.8)); }
    if (k === 4) {
      card(586, 372, 168, 34, { rx: 8, stroke: INFO, text: 'GetUserRequest', fs: 14.5, mono: true, s: pop(u, 0.4) });
      grow(672, 372, 708, 372, E(u, 0.7, 1.0), ACC);
      card(754, 372, 86, 34, { rx: 17, fill: ACC, stroke: 'none', text: 'GetUser', fs: 14.5, fw: 800, color: PANEL, mono: true, s: pop(u, 1.0) });
      grow(799, 372, 806, 372, E(u, 1.3, 1.5), ACC);
      card(848, 372, 70, 34, { rx: 8, stroke: GOOD, text: 'User', fs: 14.5, mono: true, s: pop(u, 1.5) });
      sub(712, 410, 'rpc 한 줄 = 요청 message → 응답 message', fade(u, 1.9)); } }

  // ---------- 2. message 문법 · 필드 번호 ----------
  const KIND = { scalar: INFO, repeated: WARN, enum: GOOD, message: ACC };
  function fieldTable(c) { const { u } = c, f = c.beat.fields || [], pf = (c.prev && c.prev.fields) || [];
    el('rect', { x: 24, y: 24, width: 452, height: 384, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    spans(40, 56, ptoks('message User {'), { 'font-size': 15 });
    f.forEach((r, i) => { const cy = 92 + i * 42, fresh = i >= pf.length, at = fresh ? 0.3 + (i - pf.length) * 0.35 : -9, op = fade(u, at + 0.1);
      if (c.k === 6) el('rect', { x: 32, y: cy - 18, width: 436, height: 36, rx: 6, fill: ACCBG, opacity: 0.6 });
      badge(60, cy, r.num, fresh ? pop(u, at) : 1, c.k === 6 ? ACC : INK);
      mono(88, cy + 5, r.type, { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: op });
      mono(242, cy + 5, r.name, { 'font-size': 15, opacity: op });
      pill(420, cy, r.kind, KIND[r.kind] || INFO, fresh ? pop(u, at + 0.2) : 1, { fs: 13.5 }); });
    mono(40, 92 + f.length * 42, '}', { 'font-size': 15, opacity: 0.8 }); }
  function enumBox(open, u, fresh) { const x = 520, y = 40, w = 412, rows = [['0', 'STATUS_UNSPECIFIED'], ['1', 'STATUS_ACTIVE'], ['2', 'STATUS_BANNED']];
    el('rect', { x, y, width: w, height: open ? 152 : 40, rx: 10, fill: PANEL, stroke: GOOD, 'stroke-width': 2 });
    spans(x + 14, y + 26, ptoks('enum Status'), { 'font-size': 15 });
    if (!open) return; rows.forEach(([n, s], i) => { const yy = y + 66 + i * 32, op = fresh ? fade(u, 0.3 + i * 0.3) : 1;
      if (i === 0) el('rect', { x: x + 8, y: yy - 20, width: w - 16, height: 30, rx: 6, fill: GOODBG, opacity: op });
      mono(x + 24, yy, n, { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: op }); mono(x + 54, yy, s, { 'font-size': 15, opacity: op });
      if (i === 0) tx(x + w - 14, yy, '기본값', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: fresh ? fade(u, 1.4) : 1 }); }); }
  function addrBox(open, u, fresh) { const x = 520, y = 226, w = 412;
    el('rect', { x, y, width: w, height: open ? 122 : 40, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2 });
    spans(x + 14, y + 26, ptoks('message Address'), { 'font-size': 15 });
    if (!open) return; [[1, 'string city'], [2, 'string country']].forEach(([n, s], i) => { const yy = y + 62 + i * 36;
      badge(x + 34, yy - 5, n, fresh ? pop(u, 0.3 + i * 0.3) : 1, INK); spans(x + 58, yy, ptoks(s), { 'font-size': 15, opacity: fresh ? fade(u, 0.4 + i * 0.3) : 1 }); }); }
  function s2(t, c) { const { k, u } = c;
    fieldTable(c);
    if (k === 0) { spans(540, 110, ptoks('string id = 1;'), { 'font-size': 24 });
      el('rect', { x: 707, y: 84, width: 24, height: 36, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 0.8) });
      grow(719, 124, 719, 168, E(u, 1.0, 1.4), WARN);
      tx(743, 196, '필드 번호 (값이 아니다)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
      sub(743, 222, '바이트 안에서 이 번호로 필드를 찾는다', fade(u, 1.6));
      bytes(560, 262, ['0A'], { style: () => ({ fill: ACCBG, stroke: ACC }) });
      mono(620, 286, '= (1 << 3) | 2', { 'font-size': 16, fill: INK, opacity: fade(u, 2.0) });
      sub(743, 340, '이 태그 한 바이트에 번호 1이 들어 있다', fade(u, 2.2)); return; }
    if (k === 1) { tx(726, 70, '스칼라 타입과 값 예', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700 });
      [['string', '"Alice"'], ['int32', '30'], ['bool', 'true'], ['double', '3.14']].forEach(([ty, v], i) => { const cx = 620 + (i % 2) * 212, cy = 130 + Math.floor(i / 2) * 84, s = pop(u, 0.3 + i * 0.3);
        card(cx, cy, 196, 64, { rx: 10, stroke: INFO, sw: 2, s }); mono(cx, cy - 6, ty, { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.3) });
        mono(cx, cy + 18, v, { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.3) }); });
      sub(726, 330, '번호는 2, 3, 4로 이어 붙인다', fade(u, 1.8)); return; }
    if (k === 2) { tx(726, 80, 'repeated string roles = 5', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, class: 'mono' });
      tx(540, 150, '보내지 않으면', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4) });
      el('rect', { x: 680, y: 128, width: 120, height: 36, rx: 6, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.5) });
      mono(740, 152, '[ ]', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); tx(820, 152, '빈 배열', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) });
      tx(540, 226, '두 개를 보내면', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) });
      cells(680, 204, ['"admin"', '"dev"'], { w: 100, h: 36, gap: 8, fs: 15, style: (i) => ({ stroke: WARN, s: pop(u, 1.4 + i * 0.3) }) });
      sub(726, 300, 'null이 없으니 비었는지만 보면 된다', fade(u, 2)); return; }
    if (k === 3) { enumBox(false, u); addrBox(false, u);
      [[5, 60], [6, 246]].forEach(([i, ty], j) => grow(470, 92 + i * 42, 516, ty, E(u, 0.4 + j * 0.4, 0.9 + j * 0.4), j ? ACC : GOOD));
      tx(726, 330, '타입 자리에 enum·message를 그대로 쓴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      sub(726, 356, '문자열 상수를 손으로 맞출 일이 없다', fade(u, 1.8)); return; }
    if (k === 4) { enumBox(true, u, true); addrBox(false, u);
      sub(726, 300, '값을 보내지 않으면 0이 들어온다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 5) { enumBox(true, u, false); addrBox(true, u, true);
      sub(726, 380, '번호는 message마다 따로 센다', fade(u, 1.4)); return; }
    // k6: 태그 크기
    tx(726, 60, '필드 번호와 태그 크기 (LEN 필드)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700 });
    [['필드 1', ['0A'], '1바이트', GOOD], ['필드 15', ['7A'], '1바이트', GOOD], ['필드 16', ['82', '01'], '2바이트', WARN]].forEach(([nm, b, sz, col], i) => {
      const y = 92 + i * 70, s = pop(u, 0.3 + i * 0.4);
      tx(540, y + 24, nm, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) });
      bytes(640, y, b, { style: () => ({ stroke: col, fill: col === GOOD ? GOODBG : WARNBG, s }) });
      tx(760, y + 24, sz, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.5 + i * 0.4) }); });
    sub(726, 330, '16~2047은 2바이트, 자주 쓰는 필드에 1~15를 준다', fade(u, 1.8)); }

  // ---------- 3. service · rpc ----------
  const ROWS = [['GetUserRequest', 'GetUser', 'User'], ['CreateUserRequest', 'CreateUser', 'User'], ['ListUsersRequest', 'ListUsers', 'ListUsersResponse']];
  const BOX = [{ cx: 122, w: 200, name: 'GetUserRequest', f: ['string user_id'] }, { cx: 338, w: 212, name: 'CreateUserRequest', f: ['string name', 'int32 age'] },
    { cx: 570, w: 228, name: 'ListUsersRequest', f: ['int32 page_size', 'string page_token'] }, { cx: 818, w: 236, name: 'ListUsersResponse', f: ['repeated User users', 'string next_page_token'] }];
  function rpcRow(i, y, s, hiReq, hiRes) { const [rq, nm, rs] = ROWS[i];
    card(200, y, 220, 32, { rx: 8, stroke: hiReq ? ACC : INFO, fill: hiReq ? ACCBG : PANEL, sw: hiReq ? 2.5 : 2, text: rq, fs: 14, mono: true, s });
    if (s > 0.9) { el('line', { x1: 310, y1: y, x2: 388, y2: y, stroke: MUT, 'stroke-width': 2, 'marker-end': 'url(#ra-ah)' }); el('line', { x1: 572, y1: y, x2: 640, y2: y, stroke: MUT, 'stroke-width': 2, 'marker-end': 'url(#ra-ah)' }); }
    card(480, y, 180, 32, { rx: 16, fill: INK, stroke: 'none', text: 'rpc ' + nm, fs: 14, fw: 800, color: PANEL, mono: true, s });
    card(760, y, 230, 32, { rx: 8, stroke: hiRes ? ACC : GOOD, fill: hiRes ? ACCBG : PANEL, sw: hiRes ? 2.5 : 2, text: rs, fs: 14, mono: true, s }); }
  function msgBox(b, s, hot) { const h = 34 + b.f.length * 30 + 10, x = b.cx - b.w / 2, y = 248;
    const g = R.G(b.cx, y + h / 2, s); el('rect', { x: -b.w / 2, y: -h / 2, width: b.w, height: h, rx: 10, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2.5 : 1.5 }, g);
    tx(-b.w / 2 + 12, -h / 2 + 22, b.name, { 'font-size': 14, 'font-weight': 700, class: 'mono' }, g);
    b.f.forEach((f, i) => { const yy = -h / 2 + 54 + i * 30;
      el('circle', { cx: -b.w / 2 + 22, cy: yy - 5, r: 11, fill: INK }, g); tx(-b.w / 2 + 22, yy, String(i + 1), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: PANEL, class: 'mono' }, g);
      tx(-b.w / 2 + 40, yy, f, { 'font-size': 13.5, class: 'mono' }, g); }); void x; }
  function s3(t, c) { const { k, u } = c;
    zone(24, 24, 912, 196, 'service UserService', { fill: SOFT });
    const hiBox = k >= 3 && k <= 6 ? k - 3 : -1;
    rpcRow(0, 70, k === 0 ? pop(u, 0.3) : 1, hiBox === 0, false);
    if (k >= 1) [1, 2].forEach((i) => rpcRow(i, 70 + i * 40, k === 1 ? pop(u, 0.3 + (i - 1) * 0.5) : 1, hiBox === i, hiBox === 3 && i === 2));
    if (k === 0) { tx(480, 160, 'rpc 이름(요청 message) returns (응답 message)', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); }
    if (k === 2) { const y = 190, op = fade(u, 0.3);
      card(200, y, 220, 30, { rx: 8, stroke: GRID, dash: '5 4', text: 'WatchRequest', fs: 14, mono: true, color: MUT, op });
      card(480, y, 180, 30, { rx: 15, stroke: MUT, dash: '5 4', text: 'rpc Watch', fs: 14, mono: true, color: MUT, op });
      mono(650, y + 5, 'stream', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.8) });
      for (let i = 0; i < 4; i++) { const f = ((u * 0.7 + i / 4) % 1); if (u > 0.9) el('circle', { cx: 720 + f * 180, cy: y, r: 6, fill: WARN, opacity: 0.85 }); }
      tx(480, 262, 'stream을 붙이면 응답이 여러 개 흘러온다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      sub(480, 290, '이 장은 요청 1 · 응답 1인 unary만 쓴다', fade(u, 1.8)); return; }
    if (k >= 3 && k <= 6) { BOX.forEach((b, i) => { if (i > k - 3) return; msgBox(b, i === k - 3 ? pop(u, 0.3) : 1, i === k - 3); });
      if (k === 6) { ['User', 'User', 'User'].forEach((s, i) => card(732 + i * 62, 384, 54, 28, { rx: 6, stroke: GOOD, text: s, fs: 13.5, mono: true, s: pop(u, 0.9 + i * 0.2) }));
        mono(918, 389, '+토큰', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.6) }); }
      if (k === 3) sub(480, 392, '요청도 message, 파라미터가 늘면 필드만 더한다', fade(u, 1.2));
      if (k === 5) sub(340, 392, '목록은 page_size와 page_token으로 나눠 받는다', fade(u, 1.2));
      return; }
    if (k === 7) { const op1 = fade(u, 0.6), op2 = fade(u, 1.1);
      grow(330, 200, 232, 250, E(u, 0.2, 0.6), MUT); grow(630, 200, 728, 250, E(u, 0.2, 0.6), MUT);
      mono(480, 240, 'protoc', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      el('rect', { x: 24, y: 256, width: 416, height: 140, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2, opacity: op1 });
      tx(40, 282, '서버가 구현할 인터페이스', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: op1 });
      ['type UserServiceServer interface {', '  GetUser(ctx, *GetUserRequest)', '    (*User, error)', '}'].forEach((s, i) => mono(40, 312 + i * 22, s, { 'font-size': 14, opacity: op1 }));
      el('rect', { x: 520, y: 256, width: 416, height: 140, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: op2 });
      tx(536, 282, '클라이언트가 부를 stub', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: op2 });
      ['client.GetUser(ctx,', '  &GetUserRequest{UserId: "42"})'].forEach((s, i) => mono(536, 312 + i * 22, s, { 'font-size': 14, opacity: op2 }));
      dot([[520, 372], [440, 372]], seg(u, 1.6, 2.5), ACC, 7);
      tx(480, 362, '요청', { 'text-anchor': 'middle', 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) }); } }

  // ---------- 4. wire 인코딩 ----------
  const JS = '{"id":"u-42","name":"Alice","age":30}';
  const KEYS = new Set(), PUNC = new Set(), NUM = new Set(), NAMEK = new Set();
  (function () { let m; const re = /"(id|name|age)"/g; while ((m = re.exec(JS))) for (let i = m.index; i < m.index + m[0].length; i++) KEYS.add(i);
    [...JS].forEach((ch, i) => { if (!KEYS.has(i) && /[{}:,]/.test(ch)) PUNC.add(i); }); NUM.add(JS.indexOf('30')); NUM.add(JS.indexOf('30') + 1);
    for (let i = JS.indexOf('"name"'); i < JS.indexOf('"name"') + 6; i++) NAMEK.add(i); })();
  const PB = ['0A', '04', '75', '2D', '34', '32', '12', '05', '41', '6C', '69', '63', '65', '18', '1E'];
  const GRP = [[0, 6, 'id = "u-42"'], [6, 13, 'name = "Alice"'], [13, 15, 'age = 30']];
  function jsonStrip(k, u, mode) { const n = JS.length, w = 22, gap = 2, x0 = (960 - n * (w + gap) + gap) / 2, y = 52;
    const cnt = k === 0 ? Math.round(n * E(u, 0.2, 2.0)) : n;
    tx(x0, 40, 'JSON', { 'font-size': 15, 'font-weight': 700 }); mono(x0 + n * (w + gap) - gap, 40, `${cnt} B`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: WARN });
    [...JS].forEach((ch, i) => { if (i >= cnt) return; const x = x0 + i * (w + gap), key = KEYS.has(i);
      let fill = key && mode !== 'plain' ? WARNBG : PANEL, stroke = GRID, col = INK, struck = false;
      if (mode === 'why') { if (key) { fill = BADBG; col = BAD; struck = true; } else if (PUNC.has(i)) { fill = WARNBG; col = WARN; } else if (NUM.has(i)) { fill = INFOBG; col = INFO; } }
      if (mode === 'name' && NAMEK.has(i)) { fill = BADBG; col = BAD; struck = true; }
      el('rect', { x, y, width: w, height: 32, rx: 4, fill, stroke, 'stroke-width': 1.2 });
      mono(x + w / 2, y + 22, ch, { 'font-size': 14.5, 'text-anchor': 'middle', fill: col, 'font-weight': key ? 700 : 400 });
      if (struck) el('line', { x1: x + 2, y1: y + 16, x2: x + w - 2, y2: y + 16, stroke: BAD, 'stroke-width': 2 }); });
    return { x0, w, gap }; }
  function pbStrip(n, u, k, fresh0) { const w = 44, gap = 6, x0 = (960 - 15 * (w + gap) + gap) / 2, y = 290;
    tx(x0, 278, 'protobuf', { 'font-size': 15, 'font-weight': 700 }); mono(x0 + 15 * (w + gap) - gap, 278, `${n} B`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: ACC });
    PB.forEach((b, i) => { if (i >= n) return; const g = GRP.findIndex(([a, z]) => i >= a && i < z), first = GRP[g][0], isTag = i === first, isLen = i === first + 1 && g < 2;
      const s = i >= fresh0 ? pop(u, 0.6 + (i - fresh0) * 0.12) : 1;
      card(x0 + i * (w + gap) + w / 2, y + 18, w, 36, { rx: 6, stroke: isTag ? ACC : isLen ? INFO : INK, fill: isTag ? ACCBG : isLen ? INFOBG : PANEL, sw: isTag ? 2.5 : 1.8, text: b, fs: 15, mono: true, fw: isTag ? 800 : 600, s }); });
    GRP.forEach(([a, z, s], g) => { if (z > n) return; const xa = x0 + a * (w + gap), xb = x0 + z * (w + gap) - gap, op = z > fresh0 && a >= fresh0 ? fade(u, 1.4) : 1;
      el('path', { d: `M${xa},${y + 44} v6 H${xb} v-6`, fill: 'none', stroke: MUT, 'stroke-width': 1.5, opacity: op });
      tx((xa + xb) / 2, y + 72, s, { 'text-anchor': 'middle', 'font-size': 14.5, class: 'mono', 'font-weight': 700, opacity: op }); }); }
  function bitRow(num, type, op) { const bits = ((num << 3) | type).toString(2).padStart(8, '0'), x0 = 90, y = 160, w = 34;
    [...bits].forEach((b, i) => { const isNum = i < 5;
      card(x0 + i * (w + 4) + w / 2, y, w, 40, { rx: 5, stroke: isNum ? ACC : INFO, fill: isNum ? ACCBG : INFOBG, text: b, fs: 17, mono: true, fw: 800, color: isNum ? ACC : INFO, op }); });
    tx(x0 + 2.5 * (w + 4) - 2, y - 32, `필드 번호 ${num}`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: op });
    tx(x0 + 6.5 * (w + 4) - 2, y - 32, `타입 ${type} ${type ? 'LEN' : 'VARINT'}`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: op });
    const hex = '0x' + ((num << 3) | type).toString(16).toUpperCase().padStart(2, '0');
    mono(x0, y + 50, `(${num} << 3) | ${type} = ${hex}`, { 'font-size': 16, 'font-weight': 700, opacity: op }); }
  function sizeBars(u, fresh) { const x = 560, y = 140, max = 250, g = fresh ? E(u, 1.2, 2.2) : 1;
    tx(x, y - 20, '같은 데이터의 크기', { 'font-size': 15, 'font-weight': 700, opacity: fresh ? fade(u, 1.1) : 1 });
    [['JSON', 37, WARN], ['protobuf', 15, ACC]].forEach(([nm, v, col], i) => { const yy = y + i * 46;
      tx(x, yy + 16, nm, { 'font-size': 14.5, 'font-weight': 700 }); el('rect', { x: x + 84, y: yy, width: Math.max(2, max * v / 37 * g), height: 24, rx: 4, fill: col, opacity: 0.85 });
      mono(x + 92 + max * v / 37 * g, yy + 18, v + ' B', { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fresh ? fade(u, 1.6) : 1 }); }); }
  function s4(t, c) { const { k, u } = c;
    jsonStrip(k, u, k === 5 ? 'why' : k === 3 || k === 4 ? 'name' : 'plain');
    if (k === 0) { pbStrip(0, u, k, 0); tx(480, 130, '키 "id" "name" "age" = 15바이트', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      sub(480, 158, '요청마다 같은 키 문자열이 다시 실린다', fade(u, 2.2)); return; }
    if (k === 1) { bitRow(1, 2, fade(u, 0.3, 0.6));
      [['0', 'VARINT (정수)'], ['2', 'LEN (문자열·바이트)']].forEach(([n, s], i) => { const op = fade(u, 1.4 + i * 0.3);
        mono(560, 150 + i * 36, n, { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: op }); tx(584, 150 + i * 36, '= ' + s, { 'font-size': 15, opacity: op }); });
      sub(700, 236, '하위 3비트가 wire 타입', fade(u, 2.0)); pbStrip(0, u, k, 0); return; }
    const n = [0, 0, 6, 13, 15, 15, 15][k], f0 = [0, 0, 0, 6, 13, 99, 99][k];
    if (k >= 2 && k <= 4) bitRow(k - 1, k === 4 ? 0 : 2, fade(u, 0.1, 0.4));
    if (k === 2) sub(720, 160, '태그 · 길이 4 · UTF-8 4바이트', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 3) { tx(720, 150, '"name"이라는 글자는', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); tx(720, 176, '어디에도 나가지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) }); }
    if (k === 4) sizeBars(u, true);
    if (k === 5) { [['이름 미전송', '키 15바이트가 0이 된다', BAD], ['VARINT', '30은 1E 한 바이트', INFO], ['구분자 없음', '{ } : , 가 필요 없다', WARN]].forEach(([a, b, col], i) => {
        const cx = 170 + i * 310, s = pop(u, 0.3 + i * 0.35); card(cx, 170, 270, 74, { rx: 10, stroke: col, sw: 2.5, s });
        tx(cx, 162, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.35) }); tx(cx, 188, b, { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 0.5 + i * 0.35) }); }); }
    if (k === 6) { terminal(150, 104, 660, 152, ['$ protoc --decode=user.v1.User user.proto < u.bin', 'id: "u-42"', 'name: "Alice"', 'age: 30'], 1 + E(u, 0.8, 2.0) * 3, { title: '사람이 읽으려면' });
      tx(480, 404, '바이트만 보면 읽을 수 없다. 스키마(.proto)가 있어야 풀린다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); pbStrip(15, u, k, 99); return; }
    pbStrip(n, u, k, f0); }

  // ---------- 5. 하위 호환 ----------
  const SLOT = { x0: 40, w: 134, gap: 16, y: 34, h: 100 };
  function slot(i, o) { const x = SLOT.x0 + (i - 1) * (SLOT.w + SLOT.gap), cx = x + SLOT.w / 2, s = o.s ?? 1; if (s <= 0.01) return;
    const g = R.G(cx, SLOT.y + SLOT.h / 2, s);
    el('rect', { x: -SLOT.w / 2, y: -SLOT.h / 2, width: SLOT.w, height: SLOT.h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash }, g);
    tx(0, -14, String(i), { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, class: 'mono', fill: o.numCol || INK }, g);
    if (o.label) tx(0, 26, o.label, { 'text-anchor': 'middle', 'font-size': 15, class: 'mono', 'font-weight': 700, fill: o.color || INK, 'text-decoration': o.strike ? 'line-through' : null, opacity: o.lop ?? 1 }, g);
    if (o.lock) lock(SLOT.w / 2 - 20, -SLOT.h / 2 + 22, true, MUT, 0.7);
    return cx; }
  const scx = (i) => SLOT.x0 + (i - 1) * (SLOT.w + SLOT.gap) + SLOT.w / 2;
  function s5(t, c) { const { k, u } = c;
    const base = [['id'], ['name'], ['age']];
    base.forEach(([nm], j) => { const i = j + 1; let label = nm, col = INK, strike = false, stroke = GRID, fill = PANEL;
      if (k === 3 && i === 2) { label = u < 1.0 ? 'name' : 'full_name'; stroke = GOOD; fill = GOODBG; }
      if (k === 4 && i === 3) { label = 'score'; col = BAD; stroke = BAD; fill = BADBG; }
      slot(i, { label, color: col, strike, stroke, fill, sw: 2.5, s: k === 0 ? pop(u, 0.2 + j * 0.2) : 1 });
      if (!(k === 4 && i === 3)) lock(scx(i) + 46, SLOT.y + 22, true, MUT, k === 0 ? pop(u, 0.9 + j * 0.2) : 0.8); });
    if (k >= 1) slot(4, { label: 'email', stroke: ACC, fill: ACCBG, sw: 2.5, s: k === 1 ? pop(u, 0.3) : 1 }); else slot(4, { dash: '6 5', numCol: OFF });
    [5, 6].forEach((i, j) => { if (k >= 2) slot(i, { fill: SOFT, label: ['phone', 'fax'][j], strike: true, color: MUT, stroke: MUT, dash: '6 4', s: k === 2 ? pop(u, 0.2 + j * 0.2) : 1 });
      else slot(i, { dash: '6 5', numCol: OFF }); });
    if (k >= 2) tx(scx(5) + 75, SLOT.y + SLOT.h + 24, 'reserved 5, 6', { 'text-anchor': 'middle', 'font-size': 15, class: 'mono', 'font-weight': 700, fill: MUT, opacity: k === 2 ? fade(u, 0.7) : 1 });
    const yb = 210;
    if (k === 0) { tx(480, 316, '배포된 바이트 안의 태그가 이 칸 번호를 가리킨다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      bytes(105, 240, PB, { w: 44, style: (i) => ({ stroke: [0, 6, 13].includes(i) ? ACC : GRID, fill: [0, 6, 13].includes(i) ? ACCBG : PANEL, s: pop(u, 1.3 + i * 0.04) }) });
      [[0, 1], [6, 2], [13, 3]].forEach(([b, sl], j) => grow(105 + b * 50 + 22, 238, scx(sl), SLOT.y + SLOT.h + 4, E(u, 1.9 + j * 0.15, 2.4 + j * 0.15), ACC));
      sub(480, 344, '번호를 바꾸면 옛 바이트가 다른 칸으로 들어간다', fade(u, 2.3)); return; }
    if (k === 1) { terminal(60, yb, 400, 150, ['새 서버가 보낸 바이트:', ['… 18 1E 22 06 61 40 …', 'var(--term)'], '구버전 클라가 읽은 값:', ['id, name, age 그대로', 'var(--term)']], E(u, 0.6, 2.0) * 4, { title: '필드 4 추가 후' });
      card(700, yb + 50, 300, 54, { rx: 10, stroke: GOOD, sw: 2, text: '모르는 필드 4는 건너뛴다', fs: 15, s: pop(u, 1.8) });
      sub(700, yb + 104, '버리지 않고 보관했다가 다시 보낼 때 함께 싣는다', fade(u, 2.1)); return; }
    if (k === 2) { const f = seg(u, 0.8, 1.5), back = seg(u, 1.5, 1.9), cx = scx(5), x = lerp(240, cx, E(f, 0, 1)) - back * 60, y = lerp(300, SLOT.y + SLOT.h + 30, E(f, 0, 1)) + back * 40;
      if (u > 0.8) card(x, y, 190, 32, { rx: 8, stroke: BAD, fill: BADBG, text: 'string email = 5;', fs: 14, mono: true, color: BAD });
      if (u > 1.5) cross(x + 108, y - 2, 11, pop(u, 1.55));
      terminal(60, 300, 600, 92, ['$ protoc reuse.proto', 'reuse.proto:3:40: Field "email" uses reserved number 5.'], E(u, 1.8, 2.6) * 2, { title: '컴파일 단계에서 막힌다' }); return; }
    if (k === 3) { tx(480, 196, '이름은 바이트에 실리지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.6) });
      [['name 일 때', 0.8], ['full_name 일 때', 1.4]].forEach(([s, at], j) => { const y = 226 + j * 62; tx(130, y + 24, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, at) });
        bytes(150, y, PB.slice(6, 13), { style: (i) => ({ stroke: i === 0 ? ACC : GRID, fill: i === 0 ? ACCBG : PANEL, s: pop(u, at + i * 0.05) }) }); });
      check(530, 290, 16, pop(u, 2.0)); tx(560, 296, '같은 바이트, 호환 유지', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) }); return; }
    if (k === 4) { tx(480, 192, '3번을 int32 score로 다시 쓰면', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) });
      tx(110, 244, '옛 데이터', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.6) });
      bytes(130, 222, ['18', '1E'], { style: (i) => ({ stroke: BAD, fill: i ? PANEL : BADBG, s: pop(u, 0.7 + i * 0.1) }) });
      mono(260, 246, 'age = 30 으로 저장', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.9) });
      grow(480, 240, 560, 240, E(u, 1.2, 1.6), BAD);
      card(680, 240, 210, 44, { rx: 10, stroke: BAD, fill: BADBG, text: 'score: 30', fs: 16, mono: true, color: BAD, s: pop(u, 1.6) });
      sub(680, 284, '에러 없이 값만 틀린다', fade(u, 1.9), { 'font-weight': 700, fill: BAD });
      pill(300, 334, 'int32 → string 타입 변경', BAD, pop(u, 2.1), { fs: 14 }); cross(430, 334, 10, pop(u, 2.3));
      tx(470, 340, '도 같은 사고를 낸다', { 'font-size': 15, opacity: fade(u, 2.3) }); return; }
    // k5: 계약 우선 흐름
    const st = [['.proto 리뷰·합의', INFO], ['protoc 생성', INK], ['서버 구현 · 클라 호출', GOOD], ['buf breaking 검사', WARN]];
    st.forEach(([s, col], i) => { const cx = 130 + i * 233, s2 = pop(u, 0.2 + i * 0.3); card(cx, 270, 200, 56, { rx: 10, stroke: col, sw: 2.5, text: s, fs: 15, s: s2 });
      badge(cx - 100, 242, i + 1, s2, col); if (i < 3) grow(cx + 102, 270, cx + 131, 270, E(u, 0.5 + i * 0.3, 0.8 + i * 0.3), MUT); });
    dot([[30, 270], [930, 270]], seg(u, 1.4, 2.6), ACC, 7);
    tx(480, 350, '코드보다 .proto를 먼저 합의하고, 바꿀 때마다 호환을 검사한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: '.proto 파일 맨 위에 syntax 줄을 빼면 protoc는 어떻게 하는가?',
      o: ['컴파일을 거부한다', 'proto2로 해석하고 경고를 낸다', 'proto3로 해석한다'], a: 1,
      why: 'protoc는 "No edition or syntax specified" 경고를 내고 proto2로 읽는다. 그래서 첫 줄에 syntax = "proto3"를 적는다.' },
    { q: '`string id = 1;`에서 1은 무엇인가?',
      o: ['id 필드의 기본값', '필드가 몇 번째 줄인지 나타내는 순서', '바이트 안에서 필드를 가리키는 필드 번호'], a: 2,
      why: '1은 값이 아니라 필드 번호다. 태그 바이트 0x0A에 이 번호가 들어가고, 1~15는 태그가 1바이트다.' },
    { q: 'rpc 시그니처에서 요청 파라미터를 따로 message로 만드는 까닭은 무엇인가?',
      o: ['나중에 필드를 더해도 rpc 시그니처가 깨지지 않아서', 'protoc가 원시 타입을 인자로 못 받아서 어쩔 수 없이', '응답 속도가 빨라져서'], a: 0,
      why: 'CreateUserRequest처럼 요청을 message로 두면 필드를 추가해도 rpc 한 줄은 그대로다. 구버전 호출도 계속 돈다.' },
    { q: 'User{id:"u-42", name:"Alice", age:30}을 protobuf로 인코딩하면 몇 바이트인가?',
      o: ['37바이트', '15바이트', '44바이트'], a: 1,
      why: '0A 04 "u-42"(6) + 12 05 "Alice"(7) + 18 1E(2) = 15바이트다. 같은 데이터의 공백 없는 JSON은 37바이트다.' },
    { q: '필드 3(age)을 지우고 그 번호를 int32 score에 다시 주면 옛 데이터는 어떻게 되는가?',
      o: ['protoc가 컴파일 에러를 낸다', '읽을 때 예외가 난다', '옛 age 30이 score 30으로 조용히 읽힌다'], a: 2,
      why: '태그 18 1E는 "필드 3에 30"이라는 뜻뿐이라 새 스키마는 score: 30으로 읽는다. 그래서 지운 번호는 reserved로 막는다.' },
  ];

  const summary = [
    '.proto 한 파일이 서버와 클라이언트의 계약이고 protoc가 언어별 코드를 만든다.',
    '필드 이름 뒤의 숫자는 필드 번호이고, 바이트에는 이름 대신 이 번호가 실린다.',
    'User 예시는 JSON 37바이트, protobuf 15바이트다. 태그는 (번호 << 3) | 타입이다.',
    '필드는 새 번호로 더하고, 지운 번호는 reserved로 막아 재사용하지 않는다.',
  ];
  const review = [
    { q: '로그에 찍힌 protobuf 바이트 "18 1E"를 보고 알 수 있는 것은 무엇인가?',
      o: ['필드 이름이 age라는 것', '필드 3에 VARINT 값 30이 들어 있다는 것', '메시지 전체가 2바이트라는 것'], a: 1,
      why: '0x18은 (3 << 3) | 0이라 필드 3, VARINT다. 이름은 바이트에 없으니 .proto가 있어야 age인 줄 안다.' },
    { q: '배포된 User에서 phone(5번)을 지웠다. 한 달 뒤 새 필드를 넣는다. 맞는 방법은?',
      o: ['reserved 5로 막아 두고 새 필드에는 안 쓰던 번호를 준다', '비어 있는 5번을 새 필드에 준다', '기존 필드 번호를 하나씩 당겨 빈칸을 없앤다'], a: 0,
      why: '5번을 다시 쓰면 옛 phone 바이트가 새 필드로 읽힌다. reserved로 막으면 protoc가 재사용을 컴파일 단계에서 거부한다.' },
    { q: '구버전 클라이언트가 email(4번)이 추가된 새 응답을 받았다. 무슨 일이 생기는가?',
      o: ['파싱이 실패해 호출이 에러로 끝난다', 'email 값이 name 칸에 잘못 들어간다', '모르는 필드 4는 건너뛰고 나머지를 그대로 읽는다'], a: 2,
      why: '새 번호로 더한 필드는 구버전이 모르는 필드로 넘긴다. 그래서 필드 추가는 하위 호환을 깨지 않는다.' },
  ];

  R.page({ title: '.proto 한 파일에서 바이트까지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
