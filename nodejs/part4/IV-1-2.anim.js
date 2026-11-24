/* IV-1-2 미들웨어 — 요청 처리 파이프라인. 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행 순서·응답 값·헤더·async 에러 동작은 express 5.3.0 / 4.22.3 + cors + helmet + node 24 로 직접 돌려 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 정거장(미들웨어) 하나: 가운데 기준 판 + 이름 + 아래 작은 이름
  function station(cx, cy, name, subname, o) { o = o || {}; const w = o.w || 150, h = o.h || 62, col = o.col || INK;
    card(cx, cy, w, h, { rx: 12, stroke: col, sw: o.hot ? 3 : 2, fill: o.fill || PANEL, dash: o.dash, s: o.s, op: o.op });
    if ((o.s ?? 1) <= 0.05) return;
    tx(cx, cy - 3, name, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: o.op ?? 1 });
    if (subname) mono(cx, cy + 19, subname, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 }); }
  // 요청 토큰
  function tok(x, y, col, label) { el('circle', { cx: x, cy: y, r: 13, fill: col || ACC }); tx(x, y + 4.5, label || 'req', { 'font-size': 11, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }); }
  // 멈춘 요청 주변을 도는 점 (hang)
  function spinner(x, y, t, col) { for (let i = 0; i < 8; i++) { const a = t * 4 + i * Math.PI / 4; el('circle', { cx: x + Math.cos(a) * 24, cy: y + Math.sin(a) * 24, r: 3, fill: col || WARN, opacity: (i + 1) / 8 }); } }
  // 키-값 패널 (req 객체 등)
  function objPanel(x, y, w, title, rows, o) { o = o || {}; const h = o.h || 40 + rows.length * 30;
    zone(x, y, w, h, title, { fill: SOFT });
    rows.forEach(([k, v, col, a], i) => { if ((a ?? 1) <= 0) return; const yy = y + 52 + i * 30;
      mono(x + 16, yy, k, { 'font-size': 14.5, 'font-weight': 800, fill: col || INK, opacity: a ?? 1 });
      if (v != null) mono(x + (o.kw || 150), yy, v, { 'font-size': 14.5, fill: INK, opacity: a ?? 1 }); }); }

  // ---------- 1. (req, res, next) 함수 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { // 함수 해부
      const a0 = k === 0 ? fade(u, 0.1) : 1;
      el('rect', { x: 150, y: 50, width: 440, height: 190, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: a0 });
      spans(170, 84, [['function ', { fill: INFO, 'font-weight': 700 }], ['logger', { 'font-weight': 800 }], ['(', {}], ['req', { fill: GOOD, 'font-weight': 800 }], [', ', {}], ['res', { fill: MUT, 'font-weight': 800 }], [', ', {}], ['next', { fill: k >= 1 ? ACC : OFF, 'font-weight': 800 }], [') {', {}]], { 'font-size': 17, opacity: a0 });
      spans(196, 120, [['console.log(req.method, req.url);', {}]], { 'font-size': 15, opacity: k === 0 ? fade(u, 0.6) : 1 });
      spans(196, 152, [[k >= 1 ? 'next();' : '// next() 를 아직 부르지 않았다', { fill: k >= 1 ? ACC : MUT, 'font-weight': k >= 1 ? 800 : 400 }]], { 'font-size': 15, opacity: k === 1 ? fade(u, 0.3) : a0 });
      mono(170, 184, '}', { 'font-size': 17, opacity: a0 });
      [['req', '요청: 읽고 값을 붙인다', GOOD], ['res', '응답: 아직 안 씀', MUT], ['next', k >= 1 ? '다음으로 넘기는 함수' : '안 부르면 멈춘다', k >= 1 ? ACC : WARN]].forEach(([n, d, col], i) => {
        const x = 200 + i * 140; card(x, 218, 120, 28, { rx: 14, text: n, fs: 14, fw: 800, mono: true, stroke: col, color: col, s: k === 0 ? pop(u, 0.9 + i * 0.25) : 1 });
        sub(x, 260, d, k === 0 ? fade(u, 1.2 + i * 0.25) : 1, { 'font-size': 13.5, fill: col }); });
      R.terminal(640, 50, 280, 120, ['$ node middleware-basic.js', ['GET /users', 'var(--term)']], k === 0 ? lerp(1, 2, E(u, 0.8, 1.6)) : 2, { title: 'console' });
      // 요청 토큰: k0 에서는 함수 앞에서 멈춰 돈다, k1 에서는 next() 로 빠져나간다
      if (k === 0) { tok(370, 340, WARN); spinner(370, 340, t, WARN); grow(370, 300, 370, 322, fade(u, 1.0), WARN, { plain: true });
        tx(410, 345, '응답도 다음 단계도 없이 매달린다 (hang)', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); }
      else { const x = lerp(370, 860, E(u, 0.6, 1.8)); grow(370, 340, 860, 340, E(u, 0.3, 1.0), ACC); tok(x, 340, ACC);
        tx(560, 380, 'next() = "내 일은 끝났다, 다음으로"', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
      return; }
    // k2~: 파이프라인 레일
    const Y = 200;
    el('line', { x1: 60, y1: Y, x2: 900, y2: Y, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
    mono(60, 80, 'app.use(logger);', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: k === 2 ? fade(u, 0.2) : 1 });
    station(300, Y, 'logger', '(req, res, next)', { col: ACC, s: k === 2 ? pop(u, 0.4) : 1 });
    if (k === 2) { for (let i = 0; i < 3; i++) { const x = lerp(60, 540, ((u - 0.8 - i * 0.45) / 1.4)); if (u > 0.8 + i * 0.45 && x < 540) tok(x, Y - 48, ACC); }
      sub(300, Y + 66, '경로를 안 적었으니 모든 요청이 지난다', fade(u, 1.4), { 'font-size': 14.5, fill: INK }); return; }
    station(620, Y, 'GET /users', '(req, res)', { col: GOOD, s: k === 3 ? pop(u, 0.2) : 1 });
    el('line', { x1: 700, y1: Y, x2: 900, y2: Y, stroke: PANEL, 'stroke-width': 8, opacity: 0.8 });
    tx(800, Y - 14, '체인 끝', { 'font-size': 14, fill: OFF, 'text-anchor': 'middle', 'font-weight': 700 });
    if (k === 3) { const p = E(u, 0.4, 1.4); if (p < 1) tok(lerp(80, 620, p), Y - 48, ACC);
      fly(620, Y + 70, 300, Y + 70, seg(u, 1.5, 2.5), '[{"id":1,"name":"kim"}]', { mono: true, fill: GOOD, stay: true });
      sub(620, Y + 120, 'res.json 이 응답을 보내며 체인이 끝난다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    // k4: 포트가 열리고 요청이 계속 지나간다
    for (let i = 0; i < 4; i++) { const f = ((t * 0.5 + i / 4) % 1); tok(lerp(80, 620, f), Y - 48, ACC); }
    card(120, 300, 100, 32, { rx: 16, text: ':3000', fs: 15, fw: 800, mono: true, stroke: ACC, color: PANEL, fill: ACC, s: pop(u, 0.2) });
    R.terminal(480, 270, 440, 130, ['$ node middleware-basic.js', 'GET /users', 'GET /users', 'GET /users'], lerp(1, 4, E(u, 0.4, 2.2)), { title: 'console' }); }

  // ---------- 2. 정거장을 차례로 ----------
  const P2 = [['로깅', 'logger', INK], ['본문 파싱', 'express.json()', INFO], ['인증', 'auth', WARN], ['GET /users', '핸들러', GOOD]], PX = [140, 350, 560, 770], PY = 110;
  function s2(t, c) { const { k, u } = c;
    el('line', { x1: 50, y1: PY, x2: 910, y2: PY, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
    P2.forEach(([n, s, col], i) => { if (i > k) return; station(PX[i], PY, n, s, { col, w: 170, s: i === k && k < 4 ? pop(u, 0.2) : 1 }); });
    if (k === 4) station(900, PY, '', null, { w: 40, h: 62, dash: '5 4', col: OFF });
    // 토큰은 지금 정거장까지 간다
    const reach = Math.min(k, 3), p = k < 4 ? E(u, 0.7, 1.9) : 1, x = lerp(k === 0 ? 40 : PX[reach - 1], PX[reach], p);
    if (k < 4) tok(x, PY - 48, ACC);
    if (k < 4 && p > 0.05 && p < 0.95) mono(lerp(x, PX[reach], 0.5) - 20, PY - 74, 'next()', { 'font-size': 13.5, fill: ACC, 'font-weight': 700 });
    // req 객체가 정거장을 지날수록 채워진다
    const A = (kk) => (k === kk ? fade(u, 1.6) : k > kk ? 1 : 0);
    objPanel(40, 200, 430, 'req (같은 객체가 끝까지 전달된다)', [
      ['req.method', '"GET"', INK, 1], ['req.url', '"/users"', INK, 1],
      ['req.body', 'JSON 본문 → 객체', INFO, A(1)], ['인증', '통과 → next()', WARN, A(2)]], { h: 190 });
    if (k === 0) R.terminal(510, 200, 410, 120, ['$ node pipeline.js', '→ GET /users'], lerp(1, 2, E(u, 1.4, 2.2)), { title: 'console' });
    if (k === 1) sub(700, 250, '뒤 정거장은 앞에서 채운 값을 이어받는다', fade(u, 2.0), { 'font-size': 14.5, fill: INK });
    if (k === 2) { grow(560, 145, 560, 300, E(u, 1.8, 2.4), BAD, { dash: '6 5' });
      card(700, 330, 230, 40, { rx: 10, text: '실패면 여기서 응답하고 끝', fs: 14, stroke: BAD, color: BAD, dash: '5 4', s: pop(u, 2.2) }); }
    if (k === 3) sub(700, 250, '앞 세 곳을 모두 지난 요청만 여기 온다', fade(u, 2.0), { 'font-size': 14.5, fill: INK });
    if (k === 4) { fly(770, 180, 640, 180, seg(u, 0.3, 1.2), 'res.json', { fill: GOOD, mono: true, stay: true });
      envelope2(510, 220, 410, '200', '[{"id":1,"name":"kim"}]', fade(u, 1.0));
      tx(900, 72, '실행 안 됨', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.6) }); } }
  function envelope2(x, y, w, st, body, op) { const col = st[0] === '5' ? BAD : st[0] === '4' ? WARN : GOOD;
    el('rect', { x, y, width: w, height: 70, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: op });
    mono(x + 14, y + 26, 'HTTP ' + st, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op });
    mono(x + 14, y + 52, body, { 'font-size': 14, opacity: op }); }

  // ---------- 3. 적용 범위와 순서 ----------
  const RQ = ['/users/3', '/admin/users', '/adminx'], CX = [470, 640, 810];
  const MW = [['app.use(fn)', '전역', ACC], ['app.use("/admin", fn)', '경로별', GOOD], ['app.get("/users/:id", checkId, …)', '라우트별', INFO]];
  const HIT = [[1, 1, 1], [0, 1, 0], [1, 0, 0]];
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) {
      RQ.forEach((r, j) => card(CX[j], 52, tw('GET ' + r, 14) + 22, 30, { rx: 15, text: 'GET ' + r, fs: 14, fw: 700, mono: true, stroke: INK }));
      MW.forEach(([code, name, col], i) => { if (i > k) return; const y = 118 + i * 74, a = i === k ? fade(u, 0.2) : 1;
        tx(40, y, name, { 'font-size': 15.5, 'font-weight': 800, fill: col, opacity: a }); mono(40, y + 24, code, { 'font-size': 13.5, fill: MUT, opacity: a });
        RQ.forEach((_, j) => { const on = HIT[i][j], g = i === k ? E(u, 0.6 + j * 0.35, 1.0 + j * 0.35) : 1;
          el('line', { x1: CX[j], y1: 72, x2: CX[j], y2: lerp(72, y + 8, i === k ? g : 1), stroke: GRID, 'stroke-width': 2 });
          if (g > 0.95 || i < k) (on ? check : cross)(CX[j], y + 8, 11); }); });
      if (k === 1) sub(640, 360, '접두어는 경로 단위로 맞춘다: /admin/users 는 걸리고 /adminx 는 안 걸린다', fade(u, 2.0), { 'font-size': 14.5, fill: INK });
      if (k === 2) sub(640, 360, '가장 좁은 범위: 그 라우트 하나', fade(u, 2.0), { 'font-size': 14.5, fill: INK });
      return; }
    if (k === 3) { // /users/3 이 실제로 지나는 순서
      tx(480, 50, 'GET /users/3 이 지나는 순서 = 등록 순서', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      const seq = [['전역 fn', ACC], ['checkId', INFO], ['핸들러', GOOD]];
      seq.forEach(([n, col], i) => { const x = 210 + i * 270; station(x, 170, n, null, { col, s: pop(u, 0.3 + i * 0.45), w: 160 }); if (i) grow(x - 190, 170, x - 82, 170, E(u, 0.3 + i * 0.45, 0.7 + i * 0.45), MUT); });
      sub(480, 236, '"/admin" 미들웨어는 접두어가 안 맞아 건너뛴다', fade(u, 1.6), { 'font-size': 14.5 });
      envelope2(330, 280, 300, '200', '"user 3"', fade(u, 2.0)); return; }
    // k4: 인증을 라우트보다 아래에 두면
    tx(40, 50, '등록 순서', { 'font-size': 15, 'font-weight': 800, fill: MUT });
    const lines = [['app.use(logger)', INK], ['app.get("/users", handler)', GOOD], ['app.use(auth)   ← 너무 늦다', BAD]];
    lines.forEach(([s, col], i) => mono(60, 90 + i * 40, (i + 1) + '  ' + s, { 'font-size': 15.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.3) }));
    dot([[30, 90], [30, 130], [520, 130]], seg(u, 1.0, 2.0), ACC, 8);
    envelope2(530, 96, 380, '200', '인증 없이 응답이 나갔다', fade(u, 1.9));
    sub(240, 230, 'auth 에는 닿지도 않는다', fade(u, 2.1), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
    banner(480, 320, '보안·파싱 미들웨어는 라우트보다 위에', pop(u, 2.3)); }

  // ---------- 4. 내장·서드파티 · req 에 붙이기 ----------
  const SL = [['express.json()', '내장', INFO], ['cors()', '서드파티', GOOD], ['helmet()', '서드파티', GOOD], ['auth', '직접 만든 것', WARN], ['POST /posts', '핸들러', INK]], SX = [110, 290, 470, 650, 830], SY = 70;
  function s4(t, c) { const { k, u } = c;
    el('line', { x1: 30, y1: SY, x2: 930, y2: SY, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
    const at = [1, 2, 2, 3, 0];
    SL.forEach(([n, kind, col], i) => { const on = k >= at[i];
      if (!on) { card(SX[i], SY, 150, 50, { rx: 10, dash: '5 4', stroke: GRID, fill: SOFT }); return; }
      const p = k === at[i] ? E(u, 0.2, 1.0) : 1, y = i === 1 || i === 2 ? lerp(160, SY, p) : SY;
      station(SX[i], y, n, kind, { col, w: 160, h: 54, s: i === 0 || i === 3 ? (k === at[i] ? pop(u, 0.2) : 1) : 1 }); });
    if (k <= 1) { [1, 2].forEach((i) => { station(SX[i], 160, SL[i][0], 'require 만 함', { col: OFF, w: 160, h: 54, dash: '5 4' }); });
      if (k === 0) sub(380, 210, '불러왔을 뿐, app.use 전에는 아무 요청도 거치지 않는다', fade(u, 0.8), { 'font-size': 14.5, fill: INK }); }
    // 아래: req 객체와 응답
    const body = k === 0 ? 'undefined' : k === 1 && u < 1.2 ? '\'{"title":"hi"}\'  (문자열)' : '{ title: "hi" }';
    objPanel(40, 240, 430, 'req · POST /posts {"title":"hi"} (예시)', [
      ['req.body', body, INFO, 1],
      ['req.user', k < 3 ? 'undefined' : k === 3 && u < 1.0 ? 'undefined' : '{ id: 7, role: "admin" }', WARN, 1]], { h: 140 });
    if (k === 3) fly(650, 100, 300, 312, seg(u, 0.3, 1.0), 'req.user = …', { fill: WARN, mono: true });
    if (k === 2) { zone(500, 240, 420, 150, '응답 헤더', { fill: SOFT, op: fade(u, 1.0) });
      [['Access-Control-Allow-Origin: *', GOOD, 'cors'], ['Content-Security-Policy: …', GOOD, 'helmet'], ['X-Powered-By: Express', BAD, 'helmet 이 뺀다']].forEach(([h, col, by], i) => { const y = 292 + i * 30, a = fade(u, 1.2 + i * 0.3);
        mono(516, y, h, { 'font-size': 14, fill: col, opacity: a, 'text-decoration': i === 2 ? 'line-through' : null }); tx(904, y, by, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: a }); }); }
    if (k === 4) { envelope2(500, 260, 420, '200', '{"author":7,"body":{"title":"hi"}}', fade(u, 0.8));
      sub(710, 360, '핸들러는 준비 작업 없이 꺼내 쓰기만 한다', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); }
    if (k === 1) sub(710, 300, 'JSON 문자열을 읽어 객체로 바꿔 req.body 에', fade(u, 1.4), { 'font-size': 14.5, fill: INK });
    if (k === 3) sub(710, 300, 'req 는 이 요청 하나에만 산다', fade(u, 1.4), { 'font-size': 14.5, fill: INK }); }

  // ---------- 5. 에러 처리 미들웨어 ----------
  const EX = [130, 320, 510, 700], EY = 90, LY = 300;
  function s5(t, c) { const { k, u } = c, fail = c.beat.error ? c.beat.error.failAt : 3;
    el('line', { x1: 40, y1: EY, x2: 920, y2: EY, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
    el('line', { x1: 40, y1: LY, x2: 920, y2: LY, stroke: BADBG, 'stroke-width': 6, 'stroke-linecap': 'round' });
    tx(40, LY - 16, '에러 길', { 'font-size': 14, 'font-weight': 800, fill: BAD });
    const skip = (i) => k >= 3 && i > fail;
    [['로깅', INK], ['본문 파싱', INFO], ['인증', WARN], ['핸들러', GOOD]].forEach(([n, col], i) =>
      station(EX[i], EY, n, null, { col: skip(i) ? OFF : col, w: 140, h: 52, dash: skip(i) ? '5 4' : null, hot: i === fail && k >= 1 }));
    if (k >= 3) tx(EX[3], EY + 46, '건너뜀', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'middle', 'font-weight': 700 });
    // 에러 길 끝: 등록 전에는 Express 기본 핸들러, k4 부터 우리 4인자 핸들러
    const mine = k >= 4;
    if (!mine) { card(830, LY, 170, 64, { rx: 10, dash: '5 4', stroke: MUT, text: 'Express 기본\n에러 핸들러', fs: 14 }); }
    else { card(820, LY, 190, 64, { rx: 10, stroke: BAD, sw: 2.6, fill: BADBG, s: k === 4 ? pop(u, 0.3) : 1 });
      tx(820, LY - 6, '에러 핸들러', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      mono(820, LY + 17, '(err, req, res, next)', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle' }); }
    const jump = (from, u0) => { const x = EX[from], p = E(u, u0, u0 + 0.8);
      if (p > 0) { R.cross(x, EY - 44, 9, pop(u, u0 - 0.2)); grow(x, EY + 28, x, LY - 4, Math.min(1, p * 2), BAD); grow(x, LY, mine ? 724 : 744, LY, clamp(p * 2 - 1), BAD); } };
    if (k === 0) { const p = E(u, 0.3, 1.8); if (p < 1) tok(lerp(40, 700, p), EY - 40, ACC);
      sub(480, 390, '에러를 받아 줄 우리 핸들러가 아직 없다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1) { jump(3, 0.3);
      envelope2(500, 340, 420, '500  text/html', '<pre>Error: 동기 에러!<br> &nbsp;at …</pre>', fade(u, 1.6));
      tx(40, 380, 'throw 는 Express 가 잡는다', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 1.2) });
      tx(40, 404, '(개발 모드 기본 응답은 스택까지 보인다)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { R.cross(EX[3], EY - 44, 9, pop(u, 0.1)); mono(EX[3] - 70, EY + 46, 'await → reject', { 'font-size': 13.5, fill: BAD, 'font-weight': 700 });
      // 버전에 따라 갈린다
      card(250, 190, 380, 64, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 0.5) });
      tx(76, 182, 'Express 4', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) });
      tx(76, 206, 'reject 를 아무도 안 받음 → 프로세스 종료 (exit 1)', { 'font-size': 13.5, fill: INK, opacity: fade(u, 0.8) });
      card(700, 190, 400, 64, { rx: 10, stroke: GOOD, fill: GOODBG, s: pop(u, 1.2) });
      tx(516, 182, 'Express 5', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
      tx(516, 206, 'reject 를 받아 next(err) 로 넘겨 준다', { 'font-size': 13.5, fill: INK, opacity: fade(u, 1.5) });
      sub(480, 390, 'try/catch + next(err) 는 두 버전 모두에서 안전하다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    jump(fail, k === 3 ? 0.3 : -1);
    if (k === 3) { mono(EX[fail] + 16, 200, 'next(err)', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) });
      sub(480, 390, '인자가 있는 next 는 일반 미들웨어를 전부 건너뛴다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 4) { card(560, 380, 360, 40, { rx: 10, dash: '5 4', stroke: OFF, text: '(err, req, res) 3인자 → 일반 미들웨어로 본다', fs: 13.5, color: MUT, s: pop(u, 1.2) }); R.cross(390, 380, 9, pop(u, 1.6));
      tx(40, 360, '맨 마지막에 등록', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) }); return; }
    envelope2(500, 340, 420, '500  application/json', '{"error": err.message}', fade(u, 0.6));
    tx(40, 372, '/sync 요청이면', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
    mono(40, 398, '{"error":"동기 에러!"}', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }

  const quiz = [
    { q: '미들웨어가 next()도 부르지 않고 응답도 보내지 않으면 그 요청은 어떻게 되나?',
      o: ['다음 미들웨어로 자동으로 넘어간다', 'Express가 404를 보낸다', '응답 없이 그 자리에 매달린다'], a: 2,
      why: '넘길지 끝낼지는 미들웨어가 정한다. 둘 다 하지 않으면 클라이언트는 타임아웃까지 기다린다.' },
    { q: '로깅 → express.json() → 인증 → 핸들러 순으로 걸었다. 인증이 req.body 값을 읽을 수 있는 이유는 무엇인가?',
      o: ['본문 파싱이 인증보다 앞에서 req.body를 채웠기 때문', '인증 미들웨어는 원래 본문을 직접 읽기 때문', 'req.body는 요청이 오면 늘 채워져 있기 때문'], a: 0,
      why: '같은 req 객체가 정거장을 차례로 지난다. 앞에서 붙인 값을 뒤가 이어받으므로 순서가 곧 의존 관계다.' },
    { q: 'app.use("/admin", fn)의 fn은 어느 요청에서 실행되나?',
      o: ['/admin/users와 /adminx 모두', '/admin/users는 실행되고 /adminx는 아니다', '/admin과 정확히 같은 경로만'], a: 1,
      why: '접두어는 경로 조각 단위로 맞춘다. /admin 아래의 경로는 걸리지만 /adminx는 다른 경로다.' },
    { q: 'POST 핸들러에서 req.body가 undefined다. 가장 먼저 의심할 것은 무엇인가?',
      o: ['express.json()을 안 걸었거나 라우트보다 아래에 걸었다', 'helmet이 본문을 지웠다', 'cors()를 안 걸었다'], a: 0,
      why: 'req.body를 채우는 것은 본문 파서다. 파서가 없거나 라우트 뒤에 있으면 핸들러가 볼 때 아직 비어 있다.' },
    { q: '인증 미들웨어가 next(new Error("토큰 없음"))을 불렀다. 그다음 실행되는 것은 무엇인가?',
      o: ['다음 일반 미들웨어', '라우트 핸들러', '4인자 에러 핸들러'], a: 2,
      why: '인자가 있는 next는 일반 미들웨어와 핸들러를 모두 건너뛰고 (err, req, res, next) 핸들러로 간다.' },
  ];
  const summary = [
    '미들웨어는 (req, res, next)를 받는 함수다. next()를 부르거나 응답해야 요청이 멈추지 않는다.',
    '등록한 순서가 실행 순서라서 본문 파싱과 인증은 라우트보다 위에 둔다.',
    '전역은 app.use(fn), 경로별은 app.use("/admin", fn), 라우트별은 핸들러 앞 인자로 건다.',
    '에러는 맨 끝의 4인자 핸들러가 받는다. Express 4의 async 에러는 next(err)로 직접 넘긴다.',
  ];
  const review = [
    { q: '/admin 라우트에 인증을 붙였는데 로그인 없이도 열린다. 먼저 볼 것은?',
      o: ['인증 미들웨어가 /admin 라우트 등록보다 아래에 있는지', 'helmet을 켰는지', '응답 코드가 200인지'], a: 0,
      why: '라우트가 먼저 응답하면 그 아래 미들웨어는 실행되지 않는다. 검사는 지켜야 할 라우트보다 위에 있어야 한다.' },
    { q: 'Express 4 서버에서 async 핸들러의 DB 호출이 실패할 때마다 서버 프로세스가 내려간다. 고칠 방법은?',
      o: ['에러 핸들러 인자를 3개로 줄인다', 'try/catch로 잡아 next(err)로 넘긴다', 'express.json()을 맨 위로 옮긴다'], a: 1,
      why: 'Express 4는 reject된 Promise를 받지 않아 처리되지 않은 reject로 프로세스가 끝난다. 잡아서 next(err)로 넘기면 에러 핸들러가 응답한다.' },
    { q: '에러 응답이 우리 JSON 대신 스택이 담긴 HTML로 나간다. 가능성이 가장 큰 원인은?',
      o: ['cors()가 없어서', 'next()를 너무 많이 불러서', '에러 핸들러가 라우트보다 위에 있거나 인자가 3개라서'], a: 2,
      why: '에러 핸들러로 인식되지 못하면 Express 기본 핸들러가 응답한다. 맨 끝에 두고 인자 4개를 모두 적어야 한다.' },
  ];

  R.page({ title: '미들웨어 파이프라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
