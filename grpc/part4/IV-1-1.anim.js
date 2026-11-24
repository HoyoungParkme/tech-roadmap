/* IV-1-1 Status Code & Error 처리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 와이어 모양(HTTP 200 + grpc-status 트레일러, Trailers-Only, grpc-status-details-bin 첫 바이트 08 03 12 17)과
 * 코드 없는 예외가 UNKNOWN(2)이 되는 것은 grpcio 1.85 서버를 날것 HTTP/2 클라이언트(node)로 불러 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, person, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const NAMES = ['OK', 'Canceled', 'Unknown', 'InvalidArgument', 'DeadlineExceeded', 'NotFound', 'AlreadyExists', 'PermissionDenied',
    'ResourceExhausted', 'FailedPrecondition', 'Aborted', 'OutOfRange', 'Unimplemented', 'Internal', 'Unavailable', 'DataLoss', 'Unauthenticated'];
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const NUM = Object.fromEntries(NAMES.map((n, i) => [n, i]));

  // ---------- 코드 칸 0~16 ----------
  const TX0 = 24, TW = 48, TG = 6, TY = 92;
  const tileX = (n) => TX0 + n * (TW + TG) + TW / 2;
  function strip(o) { o = o || {};
    for (let n = 0; n <= 16; n++) { const s = o.fill ? clamp(o.fill * 17 - n) : 1; if (s <= 0) continue;
      const hot = o.hot && o.hot.includes(n), dim = o.hot && !hot, col = n === 0 ? GOOD : hot ? (o.col || ACC) : INK;
      card(tileX(n), TY + 25, TW, 50, { rx: 7, text: String(n), fs: 18, fw: 800, mono: true, stroke: hot ? (o.col || ACC) : n === 0 ? GOOD : GRID,
        fill: hot ? (o.bg || ACCBG) : n === 0 ? GOODBG : PANEL, color: col, sw: hot ? 2.6 : 1.6, s: 0.5 + 0.5 * s, op: dim ? 0.45 : s }); }
    tx(TX0, TY - 16, 'codes 패키지 · 0~16', { 'font-size': 14, 'font-weight': 700, fill: MUT }); }
  // 강조한 코드의 이름 줄 (아래쪽 카드 목록)
  function names(list, u, col, y0, tag) {
    list.forEach((n, i) => { const s = pop(u, 0.4 + i * 0.25); if (s <= 0) return; const y = (y0 || 190) + i * 42;
      card(260, y, 360, 34, { rx: 8, stroke: col, sw: 1.8, s });
      mono(96, y + 5, String(n).padStart(2, ' '), { 'font-size': 16, 'font-weight': 800, fill: col, opacity: s });
      tx(130, y + 5, NAMES[n], { 'font-size': 15, 'font-weight': 700, opacity: s });
      if (tag && tag[n]) tx(428, y + 5, tag[n], { 'font-size': 13.5, 'font-weight': 700, fill: tag[n].startsWith('재시도 O') ? GOOD : MUT, 'text-anchor': 'end', opacity: s }); });
    // 칸에서 목록으로 이어지는 선
    list.forEach((n, i) => { el('line', { x1: tileX(n), y1: TY + 54, x2: tileX(n), y2: TY + 54 + 14 * E(u, 0.2, 0.6), stroke: col, 'stroke-width': 3 }); }); }

  // HTTP/2 프레임 상자
  function frame(x, y, w, kind, lines, s, o) { o = o || {}; const h = 26 + lines.length * 21, col = o.col || INK;
    const g = card(x + w / 2, y + h / 2, w, h, { rx: 6, stroke: col, sw: 2, fill: o.fill || PANEL, s });
    tx(-w / 2 + 12, -h / 2 + 19, kind, { 'font-size': 13.5, 'font-weight': 800, fill: col }, g);
    lines.forEach((l, i) => { const [a, colr] = Array.isArray(l) ? l : [l, INK]; tx(-w / 2 + 12, -h / 2 + 40 + i * 21, a, { 'font-size': 13.5, class: 'mono', fill: colr, style: 'white-space:pre' }, g); });
    return h; }

  // ---------- 1. Status Code — 에러의 공용 언어 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { // 응답의 세 층
      lbl(480, 40, 'gRPC 응답 하나 = 세 층', 1, { 'font-size': 17 });
      [['code', '5', '정수 · 기계가 switch 로 분기', ACC], ['message', '"user u-42 를 찾을 수 없습니다"', '문장 · 사람이 읽는 설명', INK], ['details', '[ BadRequest, ErrorInfo … ]', '구조체 · 필요할 때만 (Step 4)', MUT]].forEach(([a, v, d, col], i) => {
        const y = 110 + i * 92, sl = E(u, 0.3 + i * 0.55, 0.9 + i * 0.55); if (sl <= 0) return;
        const x = lerp(-60, 0, sl);
        const g = el('g', { opacity: sl });
        el('rect', { x: 150 + x, y: y - 34, width: 660, height: 70, rx: 10, fill: i === 0 ? ACCBG : PANEL, stroke: col, 'stroke-width': 2, 'stroke-dasharray': i === 2 ? '6 5' : null }, g);
        tx(176 + x, y + 6, a, { 'font-size': 17, 'font-weight': 800, fill: col }, g);
        mono(300 + x, y + 6, v, { 'font-size': 16, 'font-weight': 700, fill: i === 0 ? ACC : INK }, g);
        tx(790 + x, y + 26, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }, g); });
      note(480, 400, 'message 는 언제든 바뀐다 · 분기는 code 로만', fade(u, 2.1), { 'text-anchor': 'middle', fill: ACC });
      return; }
    if (k === 1) { // 와이어 모양
      tx(40, 44, '성공 · OK', { 'font-size': 16, 'font-weight': 800, fill: GOOD });
      tx(40, 254, '실패 · NotFound', { 'font-size': 16, 'font-weight': 800, fill: BAD });
      const W = 250;
      const okF = [['HEADERS', [':status: 200', 'content-type: application/grpc']], ['DATA', ['15 bytes (5 + User 10)']], ['HEADERS · 트레일러', [['grpc-status: 0', GOOD], 'grpc-message: ""']]];
      okF.forEach(([kd, ls], i) => { const s = pop(u, 0.2 + i * 0.4); if (s > 0) frame(40 + i * (W + 40), 62, W, kd, ls, s, { col: i === 2 ? GOOD : INK });
        if (i > 0) grow(40 + i * (W + 40) - 36, 98, 40 + i * (W + 40) - 6, 98, E(u, 0.1 + i * 0.4, 0.4 + i * 0.4), MUT); });
      const s4 = pop(u, 1.5);
      if (s4 > 0) frame(40, 272, 540, 'HEADERS + END_STREAM  (Trailers-Only)', [':status: 200', ['grpc-status: 5', BAD], 'grpc-message: user u-42 %EB%A5%BC %EC%B0…'], s4, { col: BAD, fill: BADBG });
      note(620, 300, 'HTTP 상태는 둘 다 200', fade(u, 2.0));
      note(620, 330, '성공 여부는 grpc-status', fade(u, 2.2), { fill: ACC });
      sub(620, 362, 'grpc-message 는 퍼센트 인코딩', fade(u, 2.4), { 'text-anchor': 'start' });
      return; }
    if (k === 2) { strip({ fill: E(u, 0.2, 1.6) });
      check(tileX(0), TY + 86, 10, pop(u, 1.7)); tx(tileX(0) - 20, TY + 120, '성공은 0 하나', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      el('line', { x1: tileX(1) - 20, y1: TY + 66, x2: tileX(16) + 20, y2: TY + 66, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 2.0) });
      lbl((tileX(1) + tileX(16)) / 2, TY + 92, '1 ~ 16 · 전부 에러', fade(u, 2.0), { fill: BAD });
      card(480, 300, 520, 96, { rx: 12, stroke: GRID, sw: 1.5, s: pop(u, 2.2) });
      mono(480, 292, 'codes.OK = 0', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.3) });
      sub(480, 322, 'Go: codes.NotFound · Python: grpc.StatusCode.NOT_FOUND · 같은 숫자 5', fade(u, 2.4));
      return; }
    if (k === 3) { strip({ hot: [2, 3, 4, 5], col: BAD, bg: BADBG }); names([2, 3, 4, 5], u, BAD, 190, { 3: '다시 보내도 같다', 5: '다시 보내도 같다' });
      card(740, 250, 300, 110, { rx: 12, stroke: BAD, sw: 2, s: pop(u, 1.6) });
      lbl(740, 230, '요청·대상 쪽 문제', fade(u, 1.7), { fill: BAD });
      sub(740, 258, '빈 user_id · 없는 사용자', fade(u, 1.8), { 'font-size': 14 });
      sub(740, 282, '재시도해도 결과가 같다', fade(u, 1.9), { 'font-size': 14 }); return; }
    if (k === 4) { strip({ hot: [6, 7, 8, 9], col: WARN, bg: WARNBG }); names([6, 7, 8, 9], u, WARN, 190, { 8: '재시도 O · 백오프' });
      card(740, 250, 300, 110, { rx: 12, stroke: WARN, sw: 2, s: pop(u, 1.6) });
      lbl(740, 230, '상태·권한·한도 문제', fade(u, 1.7), { fill: WARN });
      mono(740, 262, '8 → HTTP 429', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.8) });
      sub(740, 288, '쿼터가 차면 쉬었다 다시', fade(u, 1.9), { 'font-size': 14 }); return; }
    if (k === 5) { strip({ hot: [13, 14, 15, 16], col: INFO, bg: INFOBG }); names([13, 14, 15, 16], u, INFO, 190, { 14: '재시도 O · 기본' });
      card(740, 250, 300, 110, { rx: 12, stroke: GOOD, sw: 2.4, s: pop(u, 1.6) });
      mono(740, 238, '14 Unavailable', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.7) });
      sub(740, 266, '서버가 잠깐 죽었다', fade(u, 1.8), { 'font-size': 14 });
      sub(740, 290, '기다렸다 다시 보내면 산다', fade(u, 1.9), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 6) { const MAP = [[3, 400], [4, 504], [5, 404], [6, 409], [7, 403], [8, 429], [13, 500], [14, 503], [16, 401]];
      strip({ hot: MAP.map((m) => m[0]), col: ACC });
      tx(TX0, 300, 'grpc-gateway 가 바꾸는 HTTP status', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      MAP.forEach(([n, h], i) => { const x = 60 + i * 100, a = 0.2 + i * 0.2;
        grow(tileX(n), TY + 52, x, 330, E(u, a, a + 0.5), ACC, { plain: true, sw: 1.6, op: 0.7 });
        const s = pop(u, a + 0.4); if (s > 0) card(x, 352, 76, 40, { rx: 8, text: String(h), fs: 17, fw: 800, mono: true, stroke: h >= 500 ? BAD : WARN, color: h >= 500 ? BAD : INK, s }); });
      sub(480, 404, '1:1 대응은 아니다 · 9(FailedPrecondition)도 400', fade(u, 2.3), { 'font-size': 14 }); return; }
    strip({ hot: [0], col: GOOD, bg: GOODBG });
    banner(480, 240, 'code(정수)로 분기 · message 는 사람용', pop(u, 0.3));
    note(480, 300, 'message 를 파싱하면 문구가 바뀌는 날 전부 깨진다', fade(u, 1.0), { 'text-anchor': 'middle', fill: MUT });
    note(480, 340, '다음: 서버가 이 코드를 어떻게 실어 보내나', fade(u, 1.6), { 'text-anchor': 'middle', fill: ACC }); }

  // ---------- 2. 서버 — status.Error 로 코드 반환 ----------
  const GATES = [['(1) user_id == ""', 'InvalidArgument'], ['(2) repo.Find → ErrNotFound', 'NotFound'], ['(3) err != nil · DB 장애', 'Unavailable']];
  function handler(hot, o) { o = o || {};
    zone(150, 40, 360, 330, 'GetUser(ctx, req) — 서버 핸들러', { fill: SOFT });
    GATES.forEach(([g], i) => { const y = 110 + i * 78, on = hot === i;
      card(330, y, 320, 50, { rx: 8, stroke: on ? BAD : GRID, sw: on ? 2.6 : 1.6, fill: on ? BADBG : PANEL });
      mono(186, y + 5, g, { 'font-size': 14.5, 'font-weight': 700, fill: on ? BAD : INK }); });
    card(330, 340, 320, 40, { rx: 8, text: 'return user, nil', fs: 14.5, mono: true, stroke: hot === 3 ? GOOD : GRID, color: hot === 3 ? GOOD : MUT, sw: 1.6 });
    person(64, 210, '클라이언트', {}); }
  // 클라이언트가 받는 트레일러 카드
  function trailer(cx, cy, code, msg, s, col, extra) {
    const w = 330, h = extra ? 112 : 88; card(cx, cy, w, h, { rx: 10, stroke: col, sw: 2.4, fill: PANEL, s });
    if (s < 0.3) return; const x = cx - w / 2 + 16;
    tx(x, cy - h / 2 + 22, '클라이언트가 받는 상태', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    mono(x, cy - h / 2 + 48, `grpc-status: ${code}  ${NAMES[code]}`, { 'font-size': 15, 'font-weight': 800, fill: col });
    mono(x, cy - h / 2 + 72, msg, { 'font-size': 13.5, fill: INK });
    if (extra) tx(x, cy - h / 2 + 98, extra, { 'font-size': 13.5, 'font-weight': 700, fill: GOOD }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { handler(null);
      card(760, 170, 300, 120, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.4) });
      mono(632, 140, ') (*pb.User, error) {', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      card(700, 196, 110, 40, { rx: 8, text: '*pb.User', fs: 14.5, mono: true, stroke: GRID, s: pop(u, 0.9) });
      card(830, 196, 100, 40, { rx: 8, text: 'error', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, sw: 2.6, s: pop(u, 1.2) });
      grow(830, 300, 830, 222, E(u, 1.6, 2.2), ACC);
      note(830, 326, '코드는 이 error 하나에 실린다', fade(u, 1.9), { 'text-anchor': 'middle', fill: ACC });
      return; }
    if (k <= 3) { const gi = k - 1; handler(gi);
      const req = ['{ user_id: "" }', '{ user_id: "u-42" }', '{ user_id: "u-42" }'][gi];
      fly(64, 160, 330, 82, seg(u, 0.1, 0.8), req, { mono: true, fill: INK });
      for (let i = 0; i < gi; i++) check(476, 110 + i * 78, 9, 1);
      if (gi === 0) { grow(170, 110, 112, 150, E(u, 1.0, 1.5), BAD); trailer(740, 140, 3, 'user_id 는 필수입니다', pop(u, 1.3), BAD, '재시도 X');
        mono(560, 290, 'status.Error(codes.InvalidArgument, …)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); }
      if (gi === 1) { const f = E(u, 0.9, 1.6);
        mono(560, 74, 'status.Errorf(codes.NotFound,', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) });
        mono(560, 100, '  "user %s 를 찾을 수 없습니다", id)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) });
        if (f > 0) fly(860, 40, 700, 134, f, 'u-42 → %s', { mono: true, fill: ACC, stay: true });
        trailer(740, 200, 5, 'user u-42 를 찾을 수 없습니다', pop(u, 1.7), BAD);
        note(580, 300, 'id 는 message 에 · 분기는 code 5 로', fade(u, 2.2), { fill: ACC }); }
      if (gi === 2) { // 원본 err 는 로그로만
        const lg = pop(u, 0.8); card(330, 400, 300, 34, { rx: 6, fill: INK, stroke: 'none', s: lg });
        mono(196, 405, 'log: db error: <원본 err>', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 1.0) });
        grow(470, 266, 470, 380, E(u, 0.6, 1.0), MUT, { plain: true });
        grow(500, 266, 640, 200, E(u, 1.2, 1.7), BAD, { dash: '6 5' }); cross(580, 230, 13, pop(u, 1.7));
        note(600, 120, 'SQL·스택트레이스를', fade(u, 1.8), { fill: BAD }); note(600, 146, 'message 에 넣으면 그대로 노출', fade(u, 1.9), { fill: BAD });
        note(600, 300, '원본 에러는 로그에만 남긴다', fade(u, 2.2)); }
      return; }
    if (k === 4) { handler(2); grow(170, 266, 112, 230, E(u, 0.3, 0.9), GOOD);
      trailer(740, 180, 14, '일시적으로 처리할 수 없습니다', pop(u, 0.7), GOOD, '재시도 O · 클라이언트가 다시 보낸다');
      note(600, 300, '의존 서비스 장애 = Unavailable', fade(u, 1.6)); sub(600, 328, '무난한 문구만 밖으로', fade(u, 1.9), { 'text-anchor': 'start' }); return; }
    if (k === 5) { // raw error
      zone(150, 40, 360, 160, 'GetUser — 잘못된 반환', { fill: BADBG });
      mono(176, 110, 'return nil,', { 'font-size': 15, fill: INK });
      mono(176, 140, '  errors.New("not found")', { 'font-size': 15, 'font-weight': 700, fill: BAD });
      person(64, 120, null, {});
      grow(500, 120, 600, 120, E(u, 0.3, 0.8), BAD);
      trailer(770, 120, 2, '(코드 없음 → 2 로 뭉개짐)', pop(u, 0.8), BAD);
      [['switch st.Code()', INK], ['case NotFound?   ✗', MUT], ['case Unavailable? ✗', MUT], ['→ 어디로도 못 간다', BAD]].forEach(([s, col], i) => mono(180, 254 + i * 28, s, { 'font-size': 15, fill: col, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.25) }));
      tx(560, 262, '실제로 돌려 보니', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) });
      mono(560, 290, 'Python → UNKNOWN(2)', { 'font-size': 14, fill: INK, opacity: fade(u, 1.9) });
      mono(560, 314, '  "Exception calling application: not found"', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.9) });
      mono(560, 344, 'Node   → UNKNOWN(2) "not found"', { 'font-size': 14, fill: INK, opacity: fade(u, 2.1) }); return; }
    // k6 치트시트
    const CH = [['빈 값 · 형식 오류', 3], ['토큰 없음 · 만료', 16], ['권한 부족', 7], ['리소스 없음', 5], ['중복 생성', 6], ['쿼터 초과', 8], ['DB · 의존 서비스 장애', 14], ['예상 못한 버그', 13]];
    lbl(480, 34, '상황 → 코드', 1, { 'font-size': 17 });
    CH.forEach(([s, n], i) => { const y = 70 + i * 42, a = 0.15 + i * 0.22;
      card(250, y, 280, 34, { rx: 8, stroke: GRID, sw: 1.5, s: pop(u, a) });
      tx(126, y + 5, s, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, a) });
      grow(392, y, 560, y, E(u, a + 0.2, a + 0.6), n === 14 ? GOOD : MUT, { sw: 1.8 });
      const s2_ = pop(u, a + 0.55); if (s2_ > 0) { card(640, y, 150, 34, { rx: 8, stroke: n === 14 ? GOOD : n === 13 ? BAD : ACC, sw: 2, s: s2_ });
        mono(580, y + 5, String(n).padStart(2, ' '), { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: s2_ }); tx(608, y + 5, NAMES[n], { 'font-size': 13.5, 'font-weight': 700, opacity: s2_ }); } });
    note(740, 236, '이 표를 팀에서 하나로', fade(u, 2.2)); note(740, 262, '맞추는 것이 API 품질', fade(u, 2.3)); }

  // ---------- 3. 클라이언트 — 코드별 분기 ----------
  const ROWS = [['OK · err == nil', '성공 반환', GOOD], ['5 NotFound', '"없는 사용자" UI', BAD], ['16 Unauthenticated', '로그인 화면', BAD], ['7 PermissionDenied', '403 화면', BAD],
    ['3 InvalidArgument', '폼 에러 표시', BAD], ['14 · 4 Unavailable·Deadline', 'retryWithBackoff', WARN], ['default · 13 Internal …', 'st.Err() 그대로', MUT]];
  const RY = (i) => 46 + i * 40;
  function rail(on, u, o) { o = o || {};
    person(56, 160, '호출', { s: 0.8 });
    card(200, 160, 132, 44, { rx: 8, text: 'FromError', fs: 15, mono: true, stroke: on > 0 ? INK : GRID, sw: 2 });
    el('circle', { cx: 300, cy: 160, r: 9, fill: on > 0 ? INK : GRID });
    tx(282, 126, 'switch st.Code()', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: on > 0 ? 1 : 0.4 });
    ROWS.forEach(([a, b, col], i) => { const lit = on === i || (o.also && o.also.includes(i)), y = RY(i);
      const p = i === 0 ? `M96,160 C140,${y} 280,${y} 400,${y}` : `M300,160 C340,160 350,${y} 400,${y}`;
      el('path', { d: p, fill: 'none', stroke: lit ? col : GRID, 'stroke-width': lit ? 3 : 1.6 });
      mono(410, y + 5, a, { 'font-size': 14, 'font-weight': lit ? 800 : 500, fill: lit ? col : MUT });
      grow(660, y, 690, y, 1, lit ? col : GRID, { plain: true, sw: 1.4 });
      tx(700, y + 5, b, { 'font-size': 14.5, 'font-weight': lit ? 800 : 500, fill: lit ? col : MUT }); });
    if (on != null && on >= 0) { const y = RY(on), route = on === 0 ? [[96, 160], [250, y], [400, y], [690, y]] : [[96, 160], [300, 160], [400, y], [690, y]];
      dot(route, seg(u, 0.4, 1.6), ROWS[on][2], 7); } }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { rail(0, u); note(480, 360, 'err == nil 이면 분기 없이 그대로 성공', fade(u, 1.6), { 'text-anchor': 'middle', fill: GOOD }); return; }
    if (k === 1) { rail(-1, u);
      card(200, 250, 210, 70, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.5) });
      mono(110, 242, 'st.Code()    → 5', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) });
      mono(110, 266, 'st.Message() → "…"', { 'font-size': 14.5, opacity: fade(u, 1.0) });
      grow(200, 182, 200, 214, E(u, 0.3, 0.6), MUT);
      note(56, 330, 'ok == false → gRPC 가 만든 에러가 아니다 · 그대로 반환', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 2) { rail(1, u);
      card(200, 300, 300, 70, { rx: 10, stroke: BAD, sw: 2, dash: '6 5', s: pop(u, 1.4) });
      mono(70, 292, 'strings.Contains(', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5), 'text-decoration': 'line-through' });
      mono(70, 316, '  err.Error(), "찾을 수")', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5), 'text-decoration': 'line-through' });
      note(56, 370, 'message 매칭 금지 · 정수 5 로만 분기', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 3) { rail(2, u, { also: [3] }); dot([[96, 160], [300, 160], [400, RY(3)], [690, RY(3)]], seg(u, 1.2, 2.4), BAD, 7);
      note(56, 340, '같은 실패라도 코드마다 화면이 다르다', fade(u, 2.0)); return; }
    if (k === 4) { rail(5, u); pill(780, 330, '여기서 세 갈래: 성공 · 재시도 · 실패', WARN, pop(u, 1.8), { fs: 14 }); return; }
    if (k === 5) { rail(6, u); note(56, 340, '모르는 코드를 성공처럼 삼키지 않는다', fade(u, 1.8)); return; }
    // k6, k7 — 백오프 루프 타임라인
    const x0 = 80, sc = 0.8;   // 1ms = 0.8px
    tx(x0, 44, 'retryWithBackoff — 최대 3회, Unavailable 일 때만 계속', { 'font-size': 16, 'font-weight': 800 });
    el('line', { x1: x0, y1: 240, x2: 900, y2: 240, stroke: GRID, 'stroke-width': 2 });
    const sleeps = [100, 200, 400]; let x = x0;
    const upto = k === 6 ? 1 : 3;
    sleeps.forEach((ms, i) => { if (i >= upto) return; const a = k === 6 ? 0.3 : i === 0 ? 0 : 0.3 + (i - 1) * 0.8, g = k === 6 ? E(u, a, a + 0.9) : i === 0 ? 1 : E(u, a, a + 0.7), w = ms * sc;
      el('rect', { x, y: 214, width: w * g, height: 26, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5 });
      if (g > 0.6) mono(x + w / 2, 207, `sleep ${ms}ms`, { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' });
      x += w; const fs = g >= 1 ? 1 : 0;
      if (fs) { el('line', { x1: x, y1: 180, x2: x, y2: 290, stroke: INK, 'stroke-width': 2 });
        mono(x, 312, `시도 ${i + 1}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
        const last = k === 7 && i === 2; card(x, 160, 44, 30, { rx: 6, text: '14', fs: 15, mono: true, fw: 800, stroke: last ? GRID : BAD, color: last ? MUT : BAD, op: last ? 0.5 : 1 }); }
      x += 6; });
    mono(x0, 370, 'backoff *= 2   // 100 → 200 → 400ms', { 'font-size': 15, fill: MUT, opacity: k === 6 ? fade(u, 1.6) : 1 });
    if (k === 7) { card(700, 96, 300, 70, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.8) });
      mono(560, 90, 'status.Code(err) != Unavailable', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(560, 116, '→ 그 자리에서 중단', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); } }

  // ---------- 4. Error Details ----------
  const DT = [['BadRequest', 'field: "email"', '형식이 올바르지 않습니다', WARN], ['ErrorInfo', 'reason: INVALID_EMAIL', 'domain: user.example.com', INFO], ['LocalizedMessage', 'locale: ko-KR', 'message: localizedText(…)', GOOD]];
  function statusBox(filled, o) { o = o || {};
    zone(30, 30, 430, 360, 'google.rpc.Status', { fill: SOFT, stroke: GRID, sw: 1.5 });
    mono(54, 82, 'code    = 3  InvalidArgument', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    mono(54, 110, 'message = "입력값 검증 실패"', { 'font-size': 15 });
    mono(54, 144, 'details = [', { 'font-size': 15, fill: MUT });
    DT.forEach(([n, a, b, col], i) => { const y = 192 + i * 66, f = filled[i] ?? 0, gone = o.gone && o.gone[i];
      el('rect', { x: 60, y: y - 26, width: 376, height: 56, rx: 8, fill: f > 0 && !gone ? PANEL : 'none', stroke: f > 0 && !gone ? col : GRID, 'stroke-width': f > 0 ? 2.2 : 1.5, 'stroke-dasharray': f > 0 ? null : '5 5' });
      if (f > 0 && !gone) { tx(74, y - 4, n, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: f }); mono(74, y + 18, `${a} · ${b}`.slice(0, 44), { 'font-size': 13.5, opacity: f }); } });
    mono(54, 384, ']', { 'font-size': 15, fill: MUT }); }
  function s4(t, c) { const { k, u } = c;
    const filled = [k >= 1 ? (k === 1 ? fade(u, 0.9) : 1) : 0, k >= 2 ? (k === 2 ? fade(u, 0.9) : 1) : 0, k >= 3 ? (k === 3 ? fade(u, 0.9) : 1) : 0];
    if (k <= 4) statusBox(filled);
    if (k === 0) { note(500, 150, 'status.New(InvalidArgument,', fade(u, 0.4), { class: 'mono' }); note(500, 176, '  "입력값 검증 실패")', fade(u, 0.5), { class: 'mono' });
      note(500, 230, 'code + message 만 있는 빈 껍데기', fade(u, 1.2)); sub(500, 258, 'details 칸 세 개는 아직 비어 있다', fade(u, 1.6), { 'text-anchor': 'start' }); return; }
    if (k <= 3) { const i = k - 1, [n, a, b, col] = DT[i]; fly(900, 120, 250, 192 + i * 66, seg(u, 0.2, 0.9), n, { fill: col });
      card(720, 130, 340, 110, { rx: 12, stroke: col, sw: 2.2, s: pop(u, 1.0) });
      tx(566, 106, n, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 1.1) });
      mono(566, 134, a, { 'font-size': 14.5, opacity: fade(u, 1.2) }); mono(566, 160, b, { 'font-size': 14, opacity: fade(u, 1.3) });
      note(566, 290, ['필드 단위 위반 · 폼이 읽는다', '기계가 읽는 이유 · 모니터링이 읽는다', '사용자에게 보일 문구 · 로케일별'][i], fade(u, 1.8), { fill: col });
      sub(566, 318, ['message 에 욱여넣지 않는다', 'Metadata 에 input 같은 맥락을 붙인다', 'message 는 개발자용 한 줄로 남긴다'][i], fade(u, 2.1), { 'text-anchor': 'start' }); return; }
    if (k === 4) { // 와이어 바이트
      tx(500, 64, 'st.WithDetails(br, ei, lm) → 트레일러 한 줄', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(500, 100, 'grpc-status-details-bin: CAMSF+ye…', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
      const BY = [['08', '태그 = 1×8+0', 'code 칸 · varint'], ['03', '값 3', 'InvalidArgument'], ['12', '태그 = 2×8+2', 'message 칸 · 길이형'], ['17', '길이 23', '"입력값 검증 실패" UTF-8']];
      BY.forEach(([b, a, d], i) => { const x = 540 + i * 100, s = pop(u, 0.8 + i * 0.3);
        card(x, 160, 76, 50, { rx: 6, text: b, fs: 22, fw: 800, mono: true, stroke: i % 2 ? GRID : ACC, color: i % 2 ? INK : ACC, s });
        tx(x, 206, a, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0 + i * 0.3) }); });
      sub(690, 240, '앞 4바이트를 풀면: code=3, message 23바이트 …, 뒤로 details 3개', fade(u, 2.0));
      card(690, 320, 360, 64, { rx: 10, stroke: BAD, sw: 1.8, dash: '6 5', s: pop(u, 2.2) });
      mono(530, 316, 'WithDetails 실패 → codes.Internal', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.3) });
      sub(690, 340, '첨부가 깨지면 안전한 코드로 되돌린다', fade(u, 2.4)); return; }
    // k5~7 — 클라이언트가 꺼내 보내는 곳
    statusBox([1, 1, 1], { gone: [k >= 6, k >= 6, k >= 7] });
    if (k === 5) { note(500, 70, 'st := status.Convert(err)   // nil 이 아니다', fade(u, 0.2), { class: 'mono', 'font-size': 14.5 });
      note(500, 100, 'for _, d := range st.Details()', fade(u, 0.5), { class: 'mono', 'font-size': 14.5 });
      note(500, 130, '    switch d.(type)', fade(u, 0.8), { class: 'mono', 'font-size': 14.5 });
      DT.forEach(([n, , , col], i) => { const s = pop(u, 1.1 + i * 0.35); if (s > 0) card(680, 200 + i * 56, 240, 42, { rx: 21, text: 'case *' + n, fs: 14, mono: true, fw: 700, stroke: col, color: col, s }); });
      return; }
    // 목적지 세 곳
    const fa = k === 6 ? E(u, 0.2, 1.0) : 1;
    fly(250, 192, 640, 110, k === 6 ? seg(u, 0.2, 1.0) : 0, 'BadRequest', { fill: WARN });
    card(720, 100, 330, 96, { rx: 10, stroke: GRID, sw: 1.5, op: fa });
    tx(570, 76, '회원가입 폼', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fa });
    el('rect', { x: 570, y: 88, width: 300, height: 34, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 2.4, opacity: fa });
    mono(582, 110, 'email: kim@', { 'font-size': 14.5, opacity: fa }); tx(870, 142, '형식이 올바르지 않습니다', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', opacity: fa });
    const fb = k === 6 ? E(u, 1.1, 1.9) : 1;
    fly(250, 258, 640, 230, k === 6 ? seg(u, 1.1, 1.9) : 0, 'ErrorInfo', { fill: INFO });
    card(720, 240, 330, 70, { rx: 10, stroke: INFO, sw: 1.8, op: fb });
    mono(570, 236, 'track("INVALID_EMAIL",', { 'font-size': 14.5, fill: INFO, opacity: fb }); mono(570, 260, '      "user.example.com")', { 'font-size': 14.5, fill: INFO, opacity: fb });
    if (k === 7) { fly(250, 324, 640, 350, seg(u, 0.2, 1.0), 'LocalizedMessage', { fill: GOOD });
      const s = pop(u, 1.0); card(720, 350, 330, 54, { rx: 27, fill: INK, stroke: 'none', s });
      tx(720, 356, 'toast · ko-KR 문구', { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(720, 404, '개발자용 message 는 로그에만 남는다', fade(u, 1.8)); } }

  // ---------- 5. 재시도 판단 + 정리 ----------
  const BINS = [['재시도', GOOD, 160], ['조건부 · 백오프+상한', WARN, 480], ['즉시 중단', BAD, 800]];
  function bins(content) {
    BINS.forEach(([n, col, x], i) => { el('path', { d: `M${x - 130},250 L${x - 110},370 L${x + 110},370 L${x + 130},250`, fill: SOFT, stroke: col, 'stroke-width': 2.4 });
      lbl(x, 400, n, 1, { fill: col });
      (content[i] || []).forEach((n2, j) => { const xx = x - 75 + (j % 4) * 50, yy = 300 + Math.floor(j / 4) * 40;
        card(xx, yy, 44, 32, { rx: 6, text: String(n2), fs: 15, mono: true, fw: 800, stroke: col, color: col }); }); }); }
  function drop(n, bi, j, u, a) { const [, col, x] = BINS[bi], tx_ = x - 75 + (j % 4) * 50, f = E(u, a, a + 0.8);
    if (f >= 1 || f <= 0) return f >= 1; card(lerp(tileX(n), tx_, f), lerp(TY + 80, 300, f), 44, 32, { rx: 6, text: String(n), fs: 15, mono: true, fw: 800, stroke: col, color: col }); return false; }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { strip({ hot: k === 0 ? [14] : k === 1 ? [4, 8, 10] : [3, 5, 7], col: BINS[k][1] });
      const have = [k >= 1 ? [14] : [], k >= 2 ? [4, 8, 10] : [], []], adding = [[14], [4, 8, 10], [3, 5, 7]][k];
      const done = [];
      adding.forEach((n, j) => { if (drop(n, k, j, u, 0.3 + j * 0.3)) done.push(n); });
      have[k] = have[k].concat(done); bins(have);
      mono(480, 200, ['isRetryable(14) → true', 'isRetryable(4·8·10) → true  (상한 필수)', 'default → false'][k], { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BINS[k][1], opacity: fade(u, 1.4) });
      return; }
    if (k === 3) { tx(60, 50, '손코딩 대신 서비스 설정으로', { 'font-size': 17, 'font-weight': 800 });
      const L = ['grpc.WithDefaultServiceConfig(`{', '  "methodConfig": [{', '    "name": [{"service": "user.v1.UserService"}],', '    "retryPolicy": { … }', '  }]', '}`)'];
      L.forEach((l, i) => mono(80, 100 + i * 32, l, { 'font-size': 15.5, fill: i === 2 ? ACC : INK, 'font-weight': i === 2 ? 700 : 400, opacity: fade(u, 0.2 + i * 0.25) }));
      card(780, 200, 260, 100, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, 1.8) });
      tx(780, 192, '호출부는 그대로', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.9) });
      sub(780, 220, '라이브러리가 대신 다시 보낸다', fade(u, 2.0)); return; }
    if (k === 4) { const x0 = 80, sc = 0.55;
      [['maxAttempts', '4'], ['initialBackoff', '0.1s'], ['maxBackoff', '1s'], ['backoffMultiplier', '2'], ['retryableStatusCodes', '["UNAVAILABLE"]']].forEach(([a, b], i) => {
        mono(80, 50 + i * 28, `"${a}": ${b}`, { 'font-size': 15, fill: i === 4 ? GOOD : INK, 'font-weight': 700, opacity: fade(u, 0.1 + i * 0.15) }); });
      el('line', { x1: x0, y1: 300, x2: 900, y2: 300, stroke: GRID, 'stroke-width': 2 });
      let x = x0; [0, 100, 200, 400].forEach((ms, i) => { const a = 0.9 + i * 0.4, g = E(u, a, a + 0.4);
        if (ms) { el('rect', { x, y: 284, width: ms * sc * g, height: 16, rx: 3, fill: WARNBG, stroke: WARN }); if (g > 0.5) mono(x + ms * sc / 2, 330, `~${ms}ms`, { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle' }); x += ms * sc; }
        if (g >= 1 || !ms) { const s = ms ? pop(u, a + 0.4) : pop(u, 0.8); card(x + 22, 262, 44, 30, { rx: 6, text: i === 3 ? 'OK' : '14', fs: 14, mono: true, fw: 800, stroke: i === 3 ? GOOD : BAD, color: i === 3 ? GOOD : BAD, s });
          mono(x + 22, 238, `#${i + 1}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); }
        x += 44; });
      sub(480, 380, '대기는 0.1 → 0.2 → 0.4s 로 두 배씩, 1s 를 넘지 않는다', fade(u, 2.4)); return; }
    if (k === 5) { lbl(480, 50, '세 가지 함정', 1, { 'font-size': 18 });
      [['raw error 반환', '코드가 2 Unknown 으로 뭉개진다'], ['message 문자열 매칭', '문구가 바뀌면 분기가 전부 깨진다'], ['Internal 남발', '재시도 불가라 장애가 그대로 사용자에게']].forEach(([a, b], i) => {
        const y = 120 + i * 90, s = pop(u, 0.3 + i * 0.45); card(480, y, 640, 70, { rx: 10, stroke: BAD, sw: 2, s }); cross(200, y, 11, s);
        tx(236, y - 4, a, { 'font-size': 16.5, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.45) }); tx(236, y + 20, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.45) }); });
      return; }
    clock(300, 200, 70, E(u, 0.3, 2.2), WARN, 'deadline');
    card(300, 200, 64, 40, { rx: 8, text: '4', fs: 24, fw: 800, mono: true, stroke: WARN, color: WARN, s: pop(u, 2.0) });
    note(440, 170, '다음: IV-1-2 Deadline', fade(u, 0.6), { 'font-size': 18, 'font-weight': 800 });
    note(440, 206, 'DeadlineExceeded(4)는 언제 생기나', fade(u, 1.0));
    note(440, 236, '마감 시각 하나를 체인 전체가 공유한다', fade(u, 1.4), { fill: MUT }); }

  const quiz = [
    { q: '서버가 NotFound로 실패했을 때 HTTP/2 응답의 :status는 무엇인가?',
      o: ['404', '200', '500'], a: 1,
      why: 'gRPC 실패는 :status 200 위에 grpc-status: 5를 실어 보낸다. 성공 여부는 grpc-status로만 판단한다.' },
    { q: 'Go 서버가 errors.New("not found")를 그대로 반환하면 클라이언트가 받는 코드는 무엇인가?',
      o: ['5 NotFound', '13 Internal', '2 Unknown'], a: 2,
      why: '코드가 실리지 않은 에러는 Unknown(2)으로 뭉개진다. 실제로 Python 서버도 UNKNOWN(2)과 예외 문구를 돌려줬다.' },
    { q: '클라이언트가 재시도 경로로 보내는 코드 조합은 무엇인가?',
      o: ['Unavailable·DeadlineExceeded', 'NotFound·InvalidArgument', 'Unauthenticated·PermissionDenied'], a: 0,
      why: '일시 장애와 시간 초과만 다시 보내 볼 가치가 있다. 나머지는 다시 보내도 결과가 같다.' },
    { q: '이메일 형식 오류를 어느 필드에서 났는지까지 알려 주려면 무엇을 쓰는가?',
      o: ['message 문자열에 필드 이름을 넣는다', 'details에 BadRequest를 붙인다', '코드를 InvalidArgument 대신 NotFound로 바꾼다'], a: 1,
      why: 'BadRequest의 FieldViolations에 field=email과 설명을 담으면 클라이언트가 폼 필드를 바로 강조할 수 있다.' },
    { q: '페이지의 retryPolicy 예시에서 retryableStatusCodes에 넣은 코드는 무엇인가?',
      o: ['UNAVAILABLE', 'INTERNAL', 'INVALID_ARGUMENT'], a: 0,
      why: '재시도 대상은 좁게 시작한다. UNAVAILABLE만 넣고 maxAttempts 4, 0.1s에서 두 배씩 기다린다.' },
  ];

  const summary = [
    'gRPC는 HTTP 200 위에 grpc-status 정수 하나로 성공과 실패를 가른다. 0만 성공이다.',
    '서버는 status.Error(code, msg)로 코드를 싣고, 원본 DB 에러는 로그에만 남긴다.',
    '클라이언트는 st.Code()로만 분기하고 message 문자열은 읽기만 한다.',
    '필드 위반이나 다국어 문구는 details에 담고, 재시도는 Unavailable 위주로 좁게 건다.',
  ];
  const review = [
    { q: '재시도 정책을 붙였는데 잘못된 입력 요청까지 네 번씩 다시 간다. 먼저 의심할 것은?',
      o: ['retryableStatusCodes에 INVALID_ARGUMENT가 들어 있다', 'maxBackoff가 너무 짧다', '서버가 grpc-message를 퍼센트 인코딩한다'], a: 0,
      why: '재시도 대상 목록에 든 코드만 다시 보낸다. 3번은 다시 보내도 같은 결과라 목록에서 빼야 한다.' },
    { q: 'DB 장애 때 사용자 화면에 SQL 문장이 그대로 떴다. 서버 코드에서 고칠 곳은?',
      o: ['클라이언트의 switch 문', 'status.Error의 message에 원본 err를 넣은 부분', 'grpc-gateway의 HTTP 매핑표'], a: 1,
      why: 'message는 클라이언트가 그대로 읽는다. 원본 err는 log에만 남기고 밖으로는 Unavailable과 무난한 문구만 보낸다.' },
    { q: '서버 문구를 "찾을 수 없음"에서 "존재하지 않음"으로 바꿨더니 앱의 빈 화면 처리가 깨졌다. 원인은?',
      o: ['grpc-status가 5에서 다른 숫자로 바뀌었다', 'details가 빠졌다', '클라이언트가 message 문자열로 분기했다'], a: 2,
      why: '코드는 그대로 5인데 message 매칭만 실패한 것이다. 분기는 st.Code()로 해야 문구 변경에 흔들리지 않는다.' },
  ];

  R.page({ title: 'Status · Error 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
