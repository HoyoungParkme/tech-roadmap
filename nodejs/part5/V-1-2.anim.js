/* V-1-2 테스트 — Jest와 supertest — 장면 6개 (../../anim/engine.js 규칙을 따른다)
   테스트 결과(통과 수, toBe 실패 메시지, 201/400)는 페이지 테스트 파일을 Jest 30 · supertest 7 로 Node 24 에서 돌려 본 결과다.
   마지막 장면의 npm test 출력과 커버리지 숫자는 페이지의 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, terminal, spans, cross, check, clock, person, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const MCOL = { GET: INFO, POST: GOOD, PUT: WARN, DELETE: BAD };
  function req(x, y, method, path, o) { o = o || {}; const fs = o.fs || 14.5, mw = tw(method, fs) + 14, pw = tw(path, fs) + 16, g = R.G(x, y, o.s ?? 1, o.op ?? 1);
    el('rect', { x: 0, y: -14, width: mw + pw, height: 28, rx: 7, fill: PANEL, stroke: INK, 'stroke-width': 1.8 }, g);
    el('rect', { x: 0, y: -14, width: mw, height: 28, rx: 7, fill: MCOL[method] || INK }, g);
    tx(mw / 2, fs * 0.36, method, { 'text-anchor': 'middle', 'font-size': fs - 1, 'font-weight': 800, fill: PANEL, class: 'mono' }, g);
    tx(mw + 8, fs * 0.36, path, { 'font-size': fs, 'font-weight': 600, class: 'mono' }, g); return mw + pw; }
  function status(cx, cy, code, s, o) { o = o || {}; const col = code >= 500 ? BAD : code >= 400 ? WARN : GOOD, bg = code >= 500 ? BADBG : code >= 400 ? WARNBG : GOODBG, str = String(code) + (o.text ? ' ' + o.text : '');
    card(cx, cy, tw(str, 15) + 24, 30, { rx: 15, fill: bg, stroke: col, sw: 2, text: str, fs: 15, fw: 800, color: col, mono: true, s }); }
  // 테스트 한 줄: ✓ / ✗ / 빈칸
  function trow(x, y, name, st, op) { if (op <= 0) return; const col = st === 'pass' ? GOOD : st === 'fail' ? BAD : OFF;
    el('rect', { x, y: y - 17, width: 380, height: 34, rx: 8, fill: st === 'pass' ? GOODBG : st === 'fail' ? BADBG : SOFT, opacity: op });
    if (st === 'pass') check(x + 20, y, 8, op); else if (st === 'fail') cross(x + 20, y, 7, op);
    mono(x + 40, y + 5, 'test("' + name + '")', { 'font-size': 14.5, fill: INK, opacity: op, 'font-weight': 600 }); }

  // ---------- 1. describe · test · expect ----------
  const T1 = ['두 수를 더한다', '음수도 처리한다', '객체는 값으로 비교'];
  function s1(t, c) { const { k, u } = c;
    const h = k === 0 ? lerp(60, 250, E(u, 0.6, 1.6)) : 250;
    el('rect', { x: 30, y: 60, width: 420, height: h, rx: 12, fill: PANEL, stroke: ACC, 'stroke-width': 2.4 });
    mono(46, 86, 'describe("sum()", () => {', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    if (k === 4) mono(46, 60 + h + 26, '});  // 묶음을 닫는다', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
    if (k === 0) { card(240, 30, 360, 38, { rx: 8, text: 'function sum(a, b) { return a + b; }', mono: true, fs: 14, s: pop(u, 0.2) }); sub(240, 200, '아직 test가 하나도 없다', fade(u, 1.7)); }
    T1.forEach((n, i) => { const on = k > i || k === 4, now = k === i + 1; if (!on) return; trow(50, 130 + i * 56, n, now && u < 1.6 ? null : 'pass', now ? fade(u, 0.2) : 1); });
    // 오른쪽: 이 beat 의 비교
    if (k === 1 || k === 2) { const [a, b, r] = k === 1 ? ['sum(1, 2)', '3', 3] : ['sum(-1, -2)', '-3', -3];
      mono(700, 110, 'expect(' + a + ')', { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      grow(700, 124, 700, 164, E(u, 0.5, 0.9), MUT);
      card(700, 192, 90, 46, { rx: 10, text: String(r), mono: true, fs: 22, stroke: ACC, color: ACC, s: pop(u, 0.9) });
      mono(700, 260, '.toBe(' + b + ')  →  ' + r + ' === ' + r, { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      check(700, 300, 14, pop(u, 1.6)); sub(700, 340, k === 1 ? '원시값은 toBe (===)로 비교한다' : '다르게 동작할 수 있는 입력은 케이스를 따로 둔다', fade(u, 1.8)); }
    if (k === 3) { // 객체 둘: 값은 같고 주소는 다르다
      [[590, '객체 A'], [810, '객체 B']].forEach(([x, n], i) => { card(x, 92, 150, 50, { rx: 10, text: '{ id: 1 }', mono: true, fs: 17, s: pop(u, 0.2 + i * 0.2) }); sub(x, 136, n + ' · 따로 만든 객체', fade(u, 0.4 + i * 0.2)); });
      const a = fade(u, 0.9); el('rect', { x: 490, y: 160, width: 440, height: 92, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 1.8, opacity: a });
      mono(506, 186, 'toBe  → Object.is(A, B) = false', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: a });
      mono(506, 212, 'Expected: {"id": 1}', { 'font-size': 14, fill: INK, opacity: a }); mono(506, 236, 'Received: serializes to the same string', { 'font-size': 14, fill: INK, opacity: a });
      const b = fade(u, 1.7); el('rect', { x: 490, y: 272, width: 440, height: 56, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.8, opacity: b });
      mono(506, 306, 'toEqual → 키와 값을 하나씩 비교 = 통과', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: b });
      sub(710, 360, '위 빨간 상자는 Jest 30이 실제로 내는 실패 메시지', fade(u, 2.1)); }
    if (k === 4) { terminal(490, 70, 440, 150, [['PASS  sum.test.js', GOOD], '  sum()', '    ✓ 두 수를 더한다', '    ✓ 음수도 처리한다', '    ✓ 객체는 값으로 비교', 'Tests:  3 passed, 3 total'], lerp(0, 6, E(u, 0.3, 1.8)), { fs: 13.5, lh: 18 });
      card(710, 290, 440, 70, { rx: 12, stroke: INFO, sw: 2, s: pop(u, 1.9) });
      mono(510, 284, 'beforeEach(() => { … })', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.0) });
      tx(510, 308, '각 test 직전마다 새 상태를 만들어 테스트끼리 섞이지 않게', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); } }

  // ---------- 2. AAA ----------
  const BANDS = [['Arrange', '준비', 30], ['Act', '실행', 340], ['Assert', '단언', 650]];
  function s2(t, c) { const { k, u } = c;
    card(480, 34, 460, 40, { rx: 20, text: 'test("항목들의 합계를 계산한다")', mono: true, fs: 15, stroke: ACC, color: ACC, s: k === 0 ? pop(u, 0.2) : 1 });
    BANDS.forEach(([n, ko, x], i) => { const on = k === i + 1 || k === 4, done = k > i + 1 && k < 4;
      const gap = k === 4 ? E(u, 0.2, 1.0) * 10 : 0;
      el('rect', { x: x + gap * (i - 1), y: 74, width: 280, height: 300, rx: 12, fill: on ? ACCBG : SOFT, stroke: on ? ACC : done ? GOOD : GRID, 'stroke-width': on ? 2.4 : 1.5, opacity: k === 0 ? fade(u, 0.6 + i * 0.3) : 1 });
      tx(x + 16 + gap * (i - 1), 100, n + ' · ' + ko, { 'font-size': 16, 'font-weight': 800, fill: on ? ACC : done ? GOOD : MUT, opacity: k === 0 ? fade(u, 0.6 + i * 0.3) : 1 }); });
    const items = [['book', 12000, 1], ['pen', 1500, 2]];
    if (k >= 1) { mono(46, 134, 'const items = [', { 'font-size': 14, fill: MUT });
      items.forEach(([n, p, q], i) => { const op = k === 1 ? fade(u, 0.4 + i * 0.5) : 1, y = 168 + i * 50;
        card(170, y, 236, 40, { rx: 8, stroke: INK, sw: 1.6, op });
        mono(64, y + 5, n, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(190, y + 5, p.toLocaleString('en-US') + '원', { 'font-size': 15, opacity: op, 'text-anchor': 'end' }); mono(276, y + 5, '× ' + q, { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: op, 'text-anchor': 'end' }); });
      if (k === 1) sub(170, 300, '검증에 필요한 만큼만 만든다', fade(u, 1.6)); }
    if (k >= 2) { card(480, 170, 200, 52, { rx: 10, text: 'calcTotal(items)', mono: true, fs: 15, stroke: ACC, color: ACC, s: k === 2 ? pop(u, 0.2) : 1 });
      if (k === 2) { dot([[290, 168], [380, 170]], seg(u, 0.5, 1.1), ACC, 7); dot([[290, 218], [380, 175]], seg(u, 0.6, 1.2), ACC, 7); }
      const tot = k === 2 ? Math.round(lerp(0, 15000, E(u, 1.1, 2.2))) : 15000;
      mono(480, 250, 'total = ' + tot.toLocaleString('en-US'), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: INK });
      sub(480, 280, '12,000 × 1 + 1,500 × 2', k === 2 ? fade(u, 1.8) : 1);
      if (k === 2) sub(480, 330, '검증 대상은 딱 한 번 부른다', fade(u, 2.2)); }
    if (k >= 3) { mono(790, 150, 'expect(total)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' }); mono(790, 178, '.toBe(15000)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC });
      check(790, 230, 18, k === 3 ? pop(u, 0.8) : 1); lbl(790, 280, 'PASS', k === 3 ? fade(u, 1.0) : 1, { fill: GOOD, 'font-size': 18 });
      if (k === 3) sub(790, 330, '기대값은 계산식이 아니라 숫자로', fade(u, 1.6)); }
    if (k === 4) tx(480, 404, '세 구간을 빈 줄로 나누면 테스트가 문서처럼 읽힌다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); }

  // ---------- 3. 모킹 ----------
  const RU = [170, 200], ML = [520, 200], IN = [830, 200];
  function calls(x, y, rows, o) { o = o || {}; el('rect', { x, y, width: 230, height: 92, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 1.8, opacity: o.op ?? 1 });
    mono(x + 12, y + 22, 'sendEmail.mock.calls', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: o.op ?? 1 });
    if (!rows) mono(x + 12, y + 56, '[ ]  (기록 없음)', { 'font-size': 15, fill: MUT, opacity: o.op ?? 1 });
    else mono(x + 12, y + 56, '[ ["a@x.com"] ]', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: (o.op ?? 1) * rows });
    mono(x + 12, y + 80, 'length = ' + (rows ? 1 : 0), { 'font-size': 14, fill: MUT, opacity: o.op ?? 1 }); }
  function s3(t, c) { const { k, u } = c, mocked = k >= 1;
    card(RU[0], RU[1], 210, 70, { rx: 12, stroke: GOOD, sw: 2.6, fill: GOODBG }); mono(RU[0], RU[1] - 4, 'registerUser()', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD }); sub(RU[0], RU[1] + 20, '내 로직 · 진짜로 실행');
    // mailer 모듈
    const flip = k === 1 ? E(u, 0.3, 1.0) : mocked ? 1 : 0;
    card(ML[0], ML[1], 210, 70, { rx: 12, stroke: flip > 0.5 ? WARN : INK, sw: 2.4, dash: flip > 0.5 ? '7 5' : null, fill: flip > 0.5 ? WARNBG : PANEL });
    mono(ML[0], ML[1] - 4, 'mailer.sendEmail', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: flip > 0.5 ? WARN : INK });
    sub(ML[0], ML[1] + 20, flip > 0.5 ? 'jest.fn() · 기록만 하는 가짜' : '진짜 구현 · 메일을 보낸다');
    el('line', { x1: RU[0] + 105, y1: RU[1], x2: ML[0] - 105, y2: ML[1], stroke: GRID, 'stroke-width': 2.5 });
    el('line', { x1: ML[0] + 105, y1: ML[1], x2: IN[0] - 70, y2: IN[1], stroke: mocked ? OFF : GRID, 'stroke-width': 2.5, 'stroke-dasharray': mocked ? '5 6' : null });
    card(IN[0], IN[1], 130, 70, { rx: 10, stroke: k === 0 ? BAD : OFF, sw: 2, text: 'a@x.com\n받은편지함', fs: 14, color: k === 0 ? BAD : MUT });
    if (k === 0) { dot([[RU[0] + 105, RU[1]], [ML[0] - 105, ML[1]]], seg(u, 0.3, 0.9), GOOD, 7); fly(ML[0] + 110, ML[1] - 60, IN[0], IN[1] - 66, seg(u, 1.0, 1.9), '✉ 진짜 메일', { fill: BAD, stay: true });
      tx(480, 330, '테스트를 돌릴 때마다 진짜 메일이 나간다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) }); }
    if (mocked) cross((ML[0] + IN[0]) / 2 + 20, ML[1], 11, k === 1 ? pop(u, 1.0) : 1);
    if (k === 1) { pill(ML[0], 88, 'jest.mock("./mailer")', WARN, pop(u, 0.2), { mono: true }); sub(ML[0], 330, 'jest.mock은 파일 맨 위로 끌어올려져 require보다 먼저 적용된다', fade(u, 1.6)); }
    if (k >= 2) { pill(ML[0], 88, 'mockResolvedValue(true)', WARN, k === 2 ? pop(u, 0.2) : 1, { mono: true });
      if (k === 2) sub(ML[0], 128, '부르면 Promise → true를 돌려준다', fade(u, 0.8)); }
    if (k >= 2) calls(ML[0] - 115, 262, k >= 3 && k <= 4 ? (k === 3 ? fade(u, 1.0) : 1) : 0, { op: k === 2 ? fade(u, 1.0) : 1 });
    if (k === 3) { pill(300, 118, 'await registerUser({ email: "a@x.com" })', GOOD, pop(u, 0.1), { mono: true, fs: 13.5 });
      dot([[RU[0] + 105, RU[1] - 8], [ML[0] - 105, ML[1] - 8]], seg(u, 0.4, 1.0), GOOD, 7); dot([[ML[0] - 105, ML[1] + 10], [RU[0] + 105, RU[1] + 10]], seg(u, 1.3, 1.9), WARN, 7);
      if (u > 1.9) mono((RU[0] + ML[0]) / 2, RU[1] + 30, 'true', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle' }); }
    if (k === 4) { [['toHaveBeenCalledTimes(1)', 'length 1'], ['toHaveBeenCalledWith("a@x.com")', 'calls[0][0]']].forEach(([a, b], i) => { const y = 290 + i * 46;
        mono(640, y, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.5) }); check(620, y - 5, 9, pop(u, 0.6 + i * 0.5)); });
      sub(780, 384, '몇 번까지 봐야 중복 발송을 잡는다', fade(u, 1.6)); }
    if (k === 5) { pill(520, 386, 'afterEach(() => jest.clearAllMocks())', INFO, pop(u, 0.2), { mono: true, fs: 13.5 }); sub(800, 300, '기록이 다음 테스트로 새지 않는다', fade(u, 1.0)); } }

  // ---------- 4. supertest ----------
  const TS = [110, 180], ST = [400, 180], AP = [700, 180];
  function s4(t, c) { const { k, u } = c;
    card(TS[0], TS[1], 170, 70, { rx: 12, stroke: ACC, sw: 2.2, text: 'users.api\n.test.js', mono: true, fs: 14.5, color: ACC });
    // app: 미들웨어 → 라우트
    el('rect', { x: AP[0] - 130, y: AP[1] - 80, width: 260, height: 160, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.4 });
    mono(AP[0] - 116, AP[1] - 56, 'app  (require("./app"))', { 'font-size': 14, 'font-weight': 700 });
    card(AP[0], AP[1] - 14, 220, 34, { rx: 7, text: 'express.json()', mono: true, fs: 14, stroke: GRID });
    card(AP[0], AP[1] + 36, 220, 34, { rx: 7, text: 'POST /users 핸들러', fs: 14, stroke: GRID });
    // 고정 포트 3000 은 쓰지 않는다
    card(AP[0], 340, 230, 44, { rx: 10, text: 'server.js · listen(3000)', mono: true, fs: 14, stroke: OFF, color: MUT, dash: '6 5' });
    cross(AP[0] + 128, 340, 9, k === 0 ? pop(u, 0.8) : 1);
    if (k === 0) sub(AP[0], 386, '테스트는 server.js를 불러오지 않는다', fade(u, 1.2));
    // supertest 가 잠깐 여는 임시 포트
    const open = k >= 1 && k <= 3;
    card(ST[0], ST[1], 180, 70, { rx: 12, stroke: open ? INFO : OFF, sw: 2.2, dash: open ? null : '6 5', fill: open ? INFOBG : PANEL });
    mono(ST[0], ST[1] - 4, 'supertest', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: open ? INFO : MUT });
    sub(ST[0], ST[1] + 18, open ? 'listen(0) · 임시 포트' : k === 4 ? '요청 뒤 닫힘' : '대기');
    el('line', { x1: TS[0] + 85, y1: TS[1], x2: ST[0] - 90, y2: ST[1], stroke: GRID, 'stroke-width': 2.5 });
    el('line', { x1: ST[0] + 90, y1: ST[1], x2: AP[0] - 130, y2: AP[1], stroke: GRID, 'stroke-width': 2.5 });
    const path = [[TS[0] + 85, TS[1]], [ST[0] + 90, ST[1]], [AP[0] - 110, AP[1] - 14], [AP[0] - 110, AP[1] + 36]];
    if (k === 1 || k === 3) { const body = k === 1 ? '{ name: "Ada" }' : '{ }';
      pill(260, 90, '.post("/users").send(' + body + ')', ACC, pop(u, 0.2), { mono: true, fs: 13.5 }); dot(path, seg(u, 0.7, 1.9), ACC, 8); }
    if (k === 1) sub(ST[0], 300, 'app.listen을 우리가 부르지 않아도 supertest가 잠깐 띄운다', fade(u, 1.9));
    if (k === 2) { dot(path.slice().reverse(), seg(u, 0.1, 1.0), GOOD, 8); status(ST[0], 96, 201, pop(u, 0.9), { text: 'Created' });
      mono(110, 290, 'res.status', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); mono(250, 290, '201', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) }); check(300, 285, 8, pop(u, 1.4));
      mono(110, 324, 'res.body', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); mono(250, 324, '{ id: 1, name: "Ada" }', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.6) }); check(470, 319, 8, pop(u, 1.9));
      sub(290, 360, '본문은 객체라 toEqual로 비교한다', fade(u, 2.2)); }
    if (k === 3) { if (u > 1.9) dot(path.slice(0, 3).reverse(), seg(u, 1.9, 2.6), WARN, 8); status(ST[0], 260, 400, pop(u, 2.2), { text: 'Bad Request' }); sub(AP[0], 290, '이름이 없으면 핸들러가 400', fade(u, 1.7)); }
    if (k === 4) { el('rect', { x: 40, y: 260, width: 400, height: 110, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2 });
      mono(56, 286, 'describe("POST /users")', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
      [['유저를 생성하고 201을 준다'], ['이름이 없으면 400']].forEach(([n], i) => { const y = 318 + i * 30; check(70, y - 5, 7, pop(u, 0.4 + i * 0.3)); mono(88, y, n, { 'font-size': 14.5, opacity: fade(u, 0.4 + i * 0.3) }); }); } }

  // ---------- 5. 비동기 테스트 타임라인 ----------
  const X = (ms) => 180 + ms * 17;   // 0~40ms → 180~860
  function axis(y, name, op) { el('line', { x1: X(0), y1: y, x2: X(42), y2: y, stroke: GRID, 'stroke-width': 2, opacity: op }); tx(30, y + 5, name, { 'font-size': 15, 'font-weight': 800, opacity: op }); }
  function prom(y, st, op) { // Promise 상태 막대: 0~20ms pending, 그 뒤 fulfilled/rejected
    el('rect', { x: X(0), y: y - 12, width: X(20) - X(0), height: 24, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5, opacity: op });
    mono(X(10), y + 5, 'pending', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
    const col = st === 'rejected' ? BAD : GOOD; el('rect', { x: X(20), y: y - 12, width: X(40) - X(20), height: 24, rx: 6, fill: st === 'rejected' ? BADBG : GOODBG, stroke: col, 'stroke-width': 1.5, opacity: op });
    mono(X(30), y + 5, st, { 'font-size': 14, fill: col, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); }
  function s5(t, c) { const { k, u } = c;
    // 시간 눈금
    [0, 10, 20, 30, 40].forEach((ms) => { mono(X(ms), 404, ms + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); el('line', { x1: X(ms), y1: 46, x2: X(ms), y2: 386, stroke: GRID, 'stroke-dasharray': '2 5' }); });
    tx(935, 30, '예: 응답이 20ms 뒤 온다고 할 때', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    axis(70, 'fetchUser(1)', 1); prom(70, k === 4 ? 'rejected' : 'fulfilled', k === 0 ? fade(u, 0.3) : 1);
    if (k === 0) { const g = E(u, 0.6, 2.4); el('line', { x1: X(0), y1: 98, x2: X(40 * g), y2: 98, stroke: ACC, 'stroke-width': 3 }); sub(X(20), 124, '결과는 지금이 아니라 나중에 온다', fade(u, 1.6)); }
    if (k === 4) mono(X(30), 104, 'fetchUser(999)', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle' });
    // 위: await 없음
    if (k >= 1) { const op = k === 1 ? fade(u, 0.2) : 1; axis(170, 'await 없음', op);
      el('rect', { x: X(0), y: 156, width: X(1.5) - X(0), height: 28, rx: 4, fill: INK, opacity: op });
      mono(X(1.5) + 8, 162 - 10, 'then 등록하고 return', { 'font-size': 13.5, fill: MUT, opacity: op });
      if (k >= 2 || (k === 1 && u > 1.2)) { const s = k === 1 ? pop(u, 1.2) : 1; card(X(3.5), 210, 86, 30, { rx: 15, text: 'PASS', fs: 15, fw: 800, color: GOOD, stroke: GOOD, fill: GOODBG, s }); mono(X(7.5), 216, 'Jest 판정 끝', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: s }); }
      if (k >= 2) { const a = k === 2 ? fade(u, 0.8) : 1; grow(X(20), 92, X(20), 156, k === 2 ? E(u, 0.4, 0.8) : 1, BAD);
        el('rect', { x: X(20), y: 156, width: X(22) - X(20), height: 28, rx: 4, fill: BAD, opacity: a });
        mono(X(22) + 8, 176, 'expect("틀린값") 실패 · 판정 뒤라 결과에 안 들어감', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: a }); } }
    // 아래: await 있음
    if (k >= 3) { const op = k === 3 ? fade(u, 0.2) : 1; axis(300, 'await 있음', op);
      el('rect', { x: X(0), y: 286, width: X(1.5) - X(0), height: 28, rx: 4, fill: INK, opacity: op });
      const w = k === 3 ? E(u, 0.4, 1.6) : 1; el('rect', { x: X(1.5), y: 292, width: (X(20) - X(1.5)) * w, height: 16, rx: 4, fill: INFOBG, stroke: INFO, 'stroke-dasharray': '4 3', opacity: op });
      mono(X(10), 280, 'Jest가 Promise를 기다린다', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
      if (k === 4 || u > 1.6) { const s = k === 3 ? pop(u, 1.6) : 1; el('rect', { x: X(20), y: 286, width: X(22) - X(20), height: 28, rx: 4, fill: GOOD, opacity: s });
        mono(X(22) + 8, 306, k === 4 ? 'rejects.toThrow("not found") 통과' : 'expect(u.name).toBe("Ada") 통과', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: s });
        card(X(25), 344, 86, 30, { rx: 15, text: 'PASS', fs: 15, fw: 800, color: GOOD, stroke: GOOD, fill: GOODBG, s }); mono(X(28), 350, '검증한 뒤 판정', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: s }); } }
    if (k === 2) sub(X(20), 250, '파일에 다른 테스트가 없으면 결과는 PASS, 실패는 결과 밖 로그로 샌다 (Jest 30)', fade(u, 1.8), { fill: INK }); }

  // ---------- 6. 커버리지와 npm test ----------
  const COV = [['Stmts', 'Statements'], ['Branch', 'Branches'], ['Funcs', 'Functions']];
  function s6(t, c) { const { k, u } = c;
    if (k <= 1) { el('rect', { x: 60, y: 60, width: 380, height: 150, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 }); mono(76, 84, 'package.json', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      ['"scripts": {', '  "test": "jest",', '  "test:cov": "jest --coverage"', '}'].forEach((s, i) => mono(76, 116 + i * 24, s, { 'font-size': 15, fill: i === 1 || i === 2 ? ACC : INK, opacity: k === 0 ? fade(u, 0.3 + i * 0.3) : 1, 'font-weight': i === 1 || i === 2 ? 700 : 400 }));
      if (k === 0) { ['팀원', 'CI'].forEach((n, i) => { person(660, 90 + i * 130, n, { s: pop(u, 1.2 + i * 0.3) }); grow(620, 90 + i * 130, 450, 120 + i * 50, E(u, 1.6, 2.2), MUT); }); sub(700, 380, '누구든 npm test 한 줄만 알면 된다', fade(u, 2.2)); }
      if (k === 1) { [['npm test', '평소 · 빠르다', GOOD], ['npm run test:cov', '커버리지까지 · 조금 느리다', WARN]].forEach(([a, b, col], i) => { const y = 270 + i * 60, s = pop(u, 0.3 + i * 0.5);
          card(250, y, 380, 46, { rx: 23, stroke: col, sw: 2, s }); mono(80, y + 5, a, { 'font-size': 15, 'font-weight': 800, opacity: s }); tx(420, y + 5, b, { 'font-size': 13.5, fill: col, 'text-anchor': 'end', 'font-weight': 700, opacity: s }); }); }
      return; }
    if (k === 2) { terminal(60, 50, 520, 200, ['$ npm test', ['PASS  cart.test.js', GOOD], ['PASS  users.api.test.js', GOOD], 'Tests:  12 passed, 12 total'], lerp(0, 4, E(u, 0.2, 1.8)), { fs: 15, lh: 30 });
      sub(320, 280, '페이지의 예시 출력', fade(u, 1.8));
      [['실패 0', GOOD], ['실패 1개라도', BAD]].forEach(([a, col], i) => { const y = 120 + i * 90, s = pop(u, 1.4 + i * 0.4); card(770, y, 260, 60, { rx: 12, stroke: col, sw: 2.2, s }); tx(770, y - 4, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: s }); sub(770, y + 18, i ? 'CI가 배포를 막는다' : 'CI가 다음 단계로 보낸다', s); });
      return; }
    // 커버리지 막대 (예시 값)
    const p = c.prev || {}, vals = c.beat.coverage.metrics.map((m) => m.pct), pv = p.coverage ? p.coverage.metrics.map((m) => m.pct) : vals;
    tx(60, 50, 'npm run test:cov  (페이지 예시 값)', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    COV.forEach(([a, b], i) => { const y = 90 + i * 58, v = tween(pv[i], vals[i], u), low = i === 1;
      tx(60, y + 14, a, { 'font-size': 16, 'font-weight': 800, fill: low ? WARN : INK }); sub(60 + 60, y + 34, b, 1, { 'text-anchor': 'start' });
      hbar(150, y, 360, Math.round(v), 100, { h: 22, col: low ? WARN : ACC, text: Math.round(v) + '%' }); });
    if (k === 3) { el('rect', { x: 620, y: 70, width: 310, height: 150, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.2) });
      [['if (items.length) {', INK, GOODBG], ['  return sum(items);', INK, GOODBG], ['} else {', INK, BADBG], ['  throw new Error("empty");', BAD, BADBG], ['}', INK, null]].forEach(([s, col, bg], i) => { const y = 96 + i * 24, a = fade(u, 1.3 + i * 0.1);
        if (bg) el('rect', { x: 628, y: y - 16, width: 294, height: 22, rx: 4, fill: bg, opacity: a }); mono(640, y, s, { 'font-size': 14, fill: col, opacity: a }); });
      sub(775, 246, '덮지 않은 else · 에러 경로가 Branch를 깎는다', fade(u, 1.9), { fill: WARN, 'font-weight': 700 }); }
    if (k === 4) { [['독립', '순서와 무관'], ['빠름', '외부 호출은 모킹'], ['명확', '이름이 곧 명세']].forEach(([a, b], i) => { const cx = 200 + i * 280, s = pop(u, 0.2 + i * 0.3);
        card(cx, 290, 240, 66, { rx: 12, stroke: GOOD, sw: 2, s }); check(cx - 92, 290, 9, s); tx(cx - 70, 286, a, { 'font-size': 17, 'font-weight': 800, opacity: s }); tx(cx - 70, 308, b, { 'font-size': 13.5, fill: MUT, opacity: s }); });
      tx(780, 140, '100%가 버그 0은 아니다', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.3) });
      sub(780, 170, '핵심 로직·분기·에러 경로를 덮었는지 본다', fade(u, 1.6)); } }

  const quiz = [
    { q: 'expect({ id: 1 }).toBe({ id: 1 })가 실패하는 이유는 무엇인가?',
      o: ['toBe는 Object.is로 같은 객체인지 보기 때문', 'id 값의 타입이 서로 달라서', 'describe 블록 밖에서 불렀기 때문'], a: 0,
      why: '두 객체는 값은 같아도 따로 만든 다른 객체다. 값으로 비교하려면 toEqual을 쓴다.' },
    { q: 'AAA 패턴에서 Act 구간에 들어갈 것은 무엇인가?',
      o: ['items 배열을 만드는 코드', 'calcTotal(items)를 한 번 부르는 코드', 'expect(total).toBe(15000)'], a: 1,
      why: 'Act는 검증 대상을 딱 한 번 실행하는 구간이다. 준비는 Arrange, 확인은 Assert가 맡는다.' },
    { q: 'jest.mock("./mailer") 뒤에 registerUser를 부르면 sendEmail은 어떻게 되는가?',
      o: ['진짜 메일을 보낸 뒤 호출을 기록한다', '에러를 던져 테스트가 멈춘다', '메일은 보내지 않고 호출 인자만 mock.calls에 남긴다'], a: 2,
      why: '모듈 함수가 전부 jest.fn()으로 바뀐다. 가짜는 정해 준 값만 돌려주고 "a@x.com"으로 1번 불린 기록을 남긴다.' },
    { q: 'request(app)이 app.listen 없이도 HTTP 요청을 보낼 수 있는 이유는 무엇인가?',
      o: ['supertest가 임시 포트로 잠깐 띄웠다가 닫기 때문', 'Express가 3000번 포트를 늘 열어 두기 때문', 'HTTP 없이 핸들러 함수만 직접 부르기 때문'], a: 0,
      why: 'supertest는 넘겨받은 app을 listen(0)으로 빈 포트에 띄워 요청을 보낸다. 고정 포트를 쓰지 않아 충돌이 없다.' },
    { q: 'await 없이 fetchUser(1).then(…) 안에 expect를 두면 무슨 일이 생기는가?',
      o: ['Jest가 then이 끝날 때까지 자동으로 기다린다', '테스트 함수가 먼저 끝나 판정이 난 뒤에야 expect가 돈다', 'expect가 동기 코드보다 먼저 실행된다'], a: 1,
      why: '테스트 함수가 Promise를 돌려주지 않으면 Jest는 바로 판정한다. 20ms 뒤 도는 expect는 결과에 반영되지 않는다.' },
    { q: '커버리지에서 Branch가 가장 낮게 나왔다. 무엇을 뜻하는가?',
      o: ['테스트 파일 수가 너무 적다', '함수를 하나도 부르지 않았다', 'else나 에러 경로처럼 한쪽 갈래를 덮지 않았다'], a: 2,
      why: 'Branch는 if의 양쪽 갈래를 모두 지났는지 센다. 성공 경로만 테스트하면 실패 갈래가 남아 이 값이 깎인다.' },
  ];

  const summary = [
    'test 하나에 기대 하나를 적고, 원시값은 toBe로, 객체는 toEqual로 비교한다.',
    'Arrange·Act·Assert를 빈 줄로 나누고 검증 대상은 Act에서 한 번만 부른다.',
    'jest.mock으로 메일·DB 같은 바깥 의존을 가짜로 바꾸고 호출 횟수와 인자를 확인한다.',
    '비동기 테스트는 await가 빠지면 판정이 먼저 나서 expect가 결과에 반영되지 않는다.',
  ];
  const review = [
    { q: '가입 테스트를 돌릴 때마다 개발자 메일함에 환영 메일이 쌓인다. 먼저 고칠 것은?',
      o: ['테스트를 하루 한 번만 돌린다', 'jest.mock("./mailer")로 발송 모듈을 가짜로 바꾼다', 'expect를 지워 sendEmail 호출을 막는다'], a: 1,
      why: '경계 너머의 메일 발송은 가짜로 바꾸고, 호출이 1번 "a@x.com"으로 일어났는지만 단언하면 된다.' },
    { q: 'POST /users 테스트에서 상태코드 201만 확인했더니 잘못된 이름이 저장돼도 통과했다. 빠진 것은?',
      o: ['res.body를 toEqual로 함께 확인하는 단언', 'app.listen(3000)으로 진짜 서버 띄우기', '테스트 이름을 더 길게 쓰기'], a: 0,
      why: '상태코드만 보면 성공했는데 내용이 틀린 응답을 놓친다. 본문은 객체이므로 toEqual로 비교한다.' },
    { q: 'expect에 일부러 틀린 값을 넣었는데 비동기 테스트가 통과한다. 먼저 의심할 것은?',
      o: ['toBe 대신 toEqual을 써야 한다', 'beforeEach가 상태를 초기화했다', '테스트 함수가 Promise를 await하지 않고 끝난다'], a: 2,
      why: 'await나 return이 없으면 Jest는 Promise를 기다리지 않고 판정한다. 테스트를 async로 하고 호출 앞에 await를 붙인다.' },
  ];

  R.page({ title: '테스트가 판정하는 순간', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
