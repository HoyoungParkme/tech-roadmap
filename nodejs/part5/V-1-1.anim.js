/* V-1-1 로깅과 에러 처리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림 속 로그 줄은 pino 10.4 · Express 4 로 페이지 코드를 Node 24 에서 돌려 받은 실제 출력 모양이다.
   (time·pid 는 실행마다 달라 줄였고, hostname 은 가렸다. 요청 표의 ms 값은 페이지 예시) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, terminal, spans, cross, check, clock, person, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  const MCOL = { GET: INFO, POST: GOOD, PUT: WARN, DELETE: BAD };
  // HTTP 요청 표: 메서드 칸 + 경로
  function req(x, y, method, path, o) { o = o || {}; const fs = o.fs || 14.5, mw = tw(method, fs) + 14, pw = tw(path, fs) + 16, g = R.G(x, y, o.s ?? 1, o.op ?? 1);
    el('rect', { x: 0, y: -14, width: mw + pw, height: 28, rx: 7, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 1.8 }, g);
    el('rect', { x: 0, y: -14, width: mw, height: 28, rx: 7, fill: MCOL[method] || INK }, g);
    tx(mw / 2, fs * 0.36, method, { 'text-anchor': 'middle', 'font-size': fs - 1, 'font-weight': 800, fill: PANEL, class: 'mono' }, g);
    tx(mw + 8, fs * 0.36, path, { 'font-size': fs, 'font-weight': 600, class: 'mono' }, g);
    return mw + pw; }
  // 상태코드 배지
  function status(cx, cy, code, s, o) { o = o || {}; const col = code >= 500 ? BAD : code >= 400 ? WARN : GOOD, bg = code >= 500 ? BADBG : code >= 400 ? WARNBG : GOODBG, str = String(code) + (o.text ? ' ' + o.text : '');
    card(cx, cy, tw(str, 15) + 24, 30, { rx: 15, fill: bg, stroke: col, sw: 2, text: str, fs: 15, fw: 800, color: col, mono: true, s }); }
  // JSON 로그를 세로 표로: fields = [[키, 값, 색?]], f = 보이는 줄 수(소수면 마지막 줄이 막 채워지는 중)
  function jcard(x, y, w, title, fields, f, o) { o = o || {}; const rh = o.rh || 27, h = 36 + fields.length * rh + 6;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6 });
    mono(x + 14, y + 23, title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tc || MUT });
    fields.forEach(([k, v, col], i) => { const a = clamp(f - i); if (a <= 0) return; const yy = y + 36 + i * rh;
      if (col && col !== INK) el('rect', { x: x + 6, y: yy, width: w - 12, height: rh - 3, rx: 5, fill: col === BAD ? BADBG : col === WARN ? WARNBG : col === GOOD ? GOODBG : ACCBG, opacity: a });
      mono(x + 16, yy + rh / 2 + 4, '"' + k + '"', { 'font-size': 14, fill: MUT, opacity: a });
      mono(x + (o.kw || 128), yy + rh / 2 + 4, String(v), { 'font-size': 14, 'font-weight': 700, fill: col || INK, opacity: a }); });
    return h; }
  // 터미널 한 줄을 색 조각으로 (spans 를 어두운 판 위에)
  function tline(x, y, parts, op) { spans(x, y, parts.map(([s, col]) => [s, { fill: col || PANEL }]), { 'font-size': 14, opacity: op ?? 1 }); }

  // ---------- 1. console.log 의 한계 ----------
  const PLAIN = ['user logged in bob', 'db slow 1200ms', 'payment failed order 88', 'health check ok'];
  const SRC = ['log', 'log', 'error', 'log'];
  const MISS = [['레벨', '심각도를 가를 표시가 없다'], ['구조', '필드가 없는 문자열 한 줄'], ['출력 대상', 'stdout 말고는 갈 곳이 없다']];
  function s1(t, c) { const { k, u } = c;
    const n = k === 0 ? lerp(0, 3, E(u, 0.2, 1.8)) : k === 1 ? 3 + E(u, 0.2, 0.7) : 4;
    terminal(30, 36, 520, 200, PLAIN, n, { title: 'node server.js  (stdout)', fs: 14.5, lh: 34 });
    // 어디서 찍었나: log / error 꼬리표가 붙었다가 같은 모양이 된다
    if (k === 1) { SRC.forEach((s, i) => { const y = 36 + 44 + i * 34 - 5, op = fade(u, 0.5 + i * 0.12) * (1 - fade(u, 2.0, 0.5));
        pill(470, y, 'console.' + s, s === 'error' ? BAD : INFO, 1, { fs: 13.5, mono: true, op }); });
      tx(290, 262, '어느 줄이 error 였는지 출력만 봐서는 모른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); }
    // 검색: 필드가 없으니 0건
    if (k === 2) { const g = pop(u, 0.3); card(250, 290, 440, 40, { rx: 20, stroke: INFO, sw: 2, s: g });
      mono(50, 296, '🔍 level = error AND orderId = 88', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.5) });
      grow(250, 314, 250, 346, E(u, 1.0, 1.4), BAD);
      tx(250, 372, '검색 결과 0건 · 줄 안에 필드가 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) }); }
    // 출력 대상: stdout 하나뿐
    if (k === 3) { const ys = [[90, 'stdout (터미널)', true], [210, '파일 app.log', false], [330, '로그 수집기', false]];
      ys.forEach(([x, name, ok], i) => { const cx = 90 + i * 160, a = E(u, 0.2 + i * 0.4, 0.8 + i * 0.4);
        grow(290, 246, lerp(290, cx, 1), 300, ok ? a : a * 0.92, ok ? INK : OFF, { dash: ok ? null : '5 5', plain: !ok });
        card(cx, 330, 140, 40, { rx: 9, text: name, fs: 14, stroke: ok ? INK : OFF, color: ok ? INK : MUT, s: pop(u, 0.3 + i * 0.4) });
        if (!ok) cross(cx + 62, 312, 9, pop(u, 1.4 + i * 0.3)); }); }
    // 오른쪽: 빠진 것 셋
    MISS.forEach(([name, d], i) => { const y = 70 + i * 92, hit = k > i || k === 4, now = k === i + 1, s = now ? pop(u, 0.4) : 1;
      const col = k === 4 ? GOOD : hit ? BAD : OFF;
      card(760, y, 300, 72, { rx: 12, stroke: col, sw: hit ? 2.4 : 1.6, fill: k === 4 ? GOODBG : hit ? BADBG : PANEL, s });
      tx(640, y - 6, name + (k === 4 ? ' → 로거가 준다' : ' 없음'), { 'font-size': 16, 'font-weight': 800, fill: k === 4 ? GOOD : hit ? BAD : MUT });
      tx(640, y + 18, k === 4 ? ['error·warn·info·debug', '{ level, msg, orderId … } JSON', '설정으로 stdout·파일·수집기'][i] : d, { 'font-size': 13.5, fill: MUT });
      if (k === 4) check(886, y, 11, pop(u, 0.5 + i * 0.3)); else if (hit) cross(886, y, 10, now ? pop(u, 0.8) : 1); });
    if (k === 0) tx(760, 362, '개발 첫날엔 불편한 줄 모른다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
    if (k === 4) banner(290, 300, '해법: 레벨 + JSON + 라우팅을 주는 로거', pop(u, 0.3)); }

  // ---------- 2. 구조적 로깅 — pino 레벨 사다리 ----------
  // pino 의 실제 레벨 숫자 (logger.levels.values)
  const LV = [['fatal', 60, BAD], ['error', 50, BAD], ['warn', 40, WARN], ['info', 30, GOOD], ['debug', 20, MUT]];
  const LY = (i) => 74 + i * 56;
  function ladder(c) { const { k, u } = c;
    LV.forEach(([name, num, col], i) => { const y = LY(i), g = k === 0 ? E(u, 0.2 + i * 0.18, 0.8 + i * 0.18) : 1, below = k >= 1 && num < 30;
      el('rect', { x: 40, y: y - 19, width: 250 * g, height: 38, rx: 8, fill: below ? SOFT : PANEL, stroke: below ? GRID : col, 'stroke-width': 2 });
      if (g > 0.6) { tx(58, y + 6, name, { 'font-size': 16, 'font-weight': 800, fill: below ? OFF : col, class: 'mono' });
        mono(272, y + 6, String(num), { 'font-size': 15, 'font-weight': 700, fill: below ? OFF : INK, 'text-anchor': 'end' }); } });
    tx(40, 36, 'pino 레벨 (숫자가 클수록 심각)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    if (k >= 1) { const yT = k === 1 ? lerp(LY(0) - 30, LY(3) + 28, E(u, 0.3, 1.5)) : LY(3) + 28;
      el('line', { x1: 28, y1: yT, x2: 310, y2: yT, stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '8 5' });
      tx(40, yT + 72, '이 선 아래는 출력하지 않는다', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.6) : 1 }); } }
  function s2(t, c) { const { k, u } = c;
    ladder(c);
    if (k === 0) { card(620, 120, 340, 50, { rx: 10, text: 'const pino = require("pino")', mono: true, fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 0.4) });
      el('rect', { x: 450, y: 200, width: 340, height: 110, rx: 10, fill: INK, opacity: fade(u, 1.0) });
      mono(470, 230, 'stdout', { 'font-size': 13.5, fill: OFF, opacity: fade(u, 1.0) });
      mono(620, 268, '(출력 0줄)', { 'font-size': 15, fill: OFF, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    if (k === 1) { card(630, 110, 380, 46, { rx: 10, text: 'level: process.env.LOG_LEVEL || "info"', mono: true, fs: 14, stroke: ACC, color: INK, s: pop(u, 0.2) });
      [['LOG_LEVEL 없음 (운영)', 'info 이상', GOOD], ['LOG_LEVEL=debug (개발)', 'debug까지', INFO]].forEach(([a, b, col], i) => { const y = 200 + i * 64, s = pop(u, 0.9 + i * 0.4);
        card(630, y, 380, 48, { rx: 24, stroke: col, sw: 2, s }); tx(460, y + 5, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1 + i * 0.4) }); mono(800, y + 5, b, { 'font-size': 14.5, fill: col, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1 + i * 0.4) }); });
      tx(630, 350, '배포 없이 환경변수 하나로 로그 양이 바뀐다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2) }); }
    if (k === 2) { // require 캐시: 몇 군데서 불러도 같은 객체 하나
      const L = [800, 180];
      card(L[0], L[1], 150, 62, { rx: 12, stroke: ACC, sw: 2.6, fill: ACCBG, s: pop(u, 0.2) }); tx(L[0], L[1] - 3, 'logger', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, class: 'mono' });
      sub(L[0], L[1] + 18, 'level = info');
      ['orders.js', 'pay.js', 'users.js'].forEach((f, i) => { const y = 90 + i * 90, a = E(u, 0.6 + i * 0.35, 1.2 + i * 0.35);
        card(450, y, 150, 42, { rx: 8, text: f, mono: true, fs: 14.5, s: pop(u, 0.4 + i * 0.35) });
        grow(526, y, L[0] - 78, L[1] + (i - 1) * 14, a, ACC);
        if (i === 0) mono(450, 40, '세 파일 모두 require("./logger")', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: a }); });
      tx(630, 370, 'require는 처음 한 번만 실행하고 캐시한 같은 객체를 돌려준다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); }
    if (k === 3) { fly(600, 395, 290, LY(3), seg(u, 0.1, 0.9), 'logger.info({ orderId: 88, amount: 12000 }, "order paid")', { mono: true });
      el('rect', { x: 40, y: LY(3) - 19, width: 250, height: 38, rx: 8, fill: GOODBG, opacity: fade(u, 0.9) * 0.7 });
      jcard(450, 70, 470, 'stdout · JSON 한 줄을 펼친 모습', [['level', 30, GOOD], ['time', '1795492442627'], ['pid', '…'], ['hostname', '…'], ['orderId', 88, ACC], ['amount', 12000, ACC], ['msg', '"order paid"']], lerp(0, 7, E(u, 1.0, 2.5)));
      sub(685, 398, '넘긴 객체의 키가 그대로 필드가 된다 · level 30 = info', fade(u, 2.4)); }
    if (k === 4) { // debug 는 선에서 떨어지고 error 는 통과
      const d = seg(u, 0.2, 1.1); if (d > 0 && d < 1) fly(600, 40, 300, LY(4), d, 'logger.debug({ sql }, "query")', { mono: true, fill: OFF, color: INK, stay: true });
      if (u > 1.1) { cross(310, LY(4), 10, pop(u, 1.1)); mono(330, LY(4) + 5, '버림', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); }
      fly(600, 40, 300, LY(1), seg(u, 1.0, 1.8), 'logger.error({ orderId: 88 }, "payment failed")', { mono: true, fill: BAD });
      if (u > 1.8) el('rect', { x: 40, y: LY(1) - 19, width: 250, height: 38, rx: 8, fill: BADBG, opacity: 0.7 });
      jcard(450, 130, 470, 'stdout', [['level', 50, BAD], ['orderId', 88], ['msg', '"payment failed"']], lerp(0, 3, E(u, 1.8, 2.6)));
      sub(685, 330, 'debug 줄은 아예 쓰이지 않는다 · 저장 비용도 0', fade(u, 2.2)); }
    if (k === 5) { card(620, 66, 380, 44, { rx: 10, text: 'reqLog = logger.child({ requestId: "a1b2" })', mono: true, fs: 14, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      jcard(450, 120, 470, 'reqLog.info("in handler")의 출력', [['level', 30, GOOD], ['requestId', '"a1b2"', ACC], ['msg', '"in handler"']], lerp(0, 3, E(u, 0.7, 1.8)));
      tx(685, 300, 'child가 만든 로거는 모든 줄에 requestId를 붙인다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(685, 326, '다음 장면: 요청마다 다른 ID를 심는다', fade(u, 2.2)); } }

  // ---------- 3. 요청 로깅과 requestId ----------
  // 표의 ms 값은 페이지 예시, ID 는 crypto.randomUUID().slice(0, 8) 형태
  const REQS = [['8574b6a7', 'GET', '/orders', 200, 42], ['c2637f25', 'POST', '/pay', 500, 1180], ['e5f61a02', 'GET', '/health', 200, 5], ['c5543ecb', 'GET', '/users/7', 404, 18]];
  const LANE = { y: 96, a: 70, g: 300, h: 560, f: 820 };
  function lane(c, tok) { const { k, u } = c;
    el('line', { x1: LANE.a + 30, y1: LANE.y, x2: LANE.f, y2: LANE.y, stroke: GRID, 'stroke-width': 3 });
    person(LANE.a, LANE.y, null, { s: 0.8 });
    card(LANE.g, LANE.y, 150, 56, { rx: 10, stroke: ACC, sw: 2.4, fill: ACCBG }); tx(LANE.g, LANE.y - 4, 'app.use(…)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ACC, class: 'mono' }); sub(LANE.g, LANE.y + 16, '요청 로깅 미들웨어');
    card(LANE.h, LANE.y, 130, 56, { rx: 10, text: '핸들러', fs: 15 });
    card(LANE.f, LANE.y, 140, 56, { rx: 10, stroke: k >= 3 ? GOOD : GRID, sw: 2, text: 'res "finish"', mono: true, fs: 14.5, color: k >= 3 ? GOOD : MUT });
    if (tok) dot([[LANE.a + 30, LANE.y], [LANE.f - 70, LANE.y]], tok, ACC, 8); }
  function table(c, rows, o) { o = o || {}; const x = 70, y = 196, cw = [118, 80, 120, 80, 92], heads = ['requestId', 'method', 'path', 'status', 'ms'];
    el('rect', { x: x - 14, y: y - 26, width: 600, height: 36 + rows * 34, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    let xx = x; heads.forEach((h, j) => { const hot = o.hot && o.hot.includes(j); mono(xx, y - 3, h, { 'font-size': 13.5, 'font-weight': 700, fill: hot ? ACC : MUT }); xx += cw[j]; });
    REQS.slice(0, Math.ceil(rows)).forEach((r, i) => { const a = clamp(rows - i), yy = y + 26 + i * 34; let xx = x;
      if (o.mark === i) el('rect', { x: x - 8, y: yy - 20, width: 588, height: 30, rx: 6, fill: BADBG, opacity: a });
      r.forEach((v, j) => { const col = j === 3 ? (v >= 500 ? BAD : v >= 400 ? WARN : GOOD) : j === 4 && v >= 1000 ? BAD : j === 0 ? ACC : INK;
        mono(xx, yy, String(v), { 'font-size': 14.5, 'font-weight': j === 0 || j === 3 ? 700 : 500, fill: col, opacity: a }); xx += cw[j]; }); }); }
  function s3(t, c) { const { k, u } = c, rows = c.beat.request.reqs.length, prev = c.prev ? c.prev.request.reqs.length : 0;
    lane(c, k === 0 ? seg(u, 0.3, 1.6) : 0);
    const shown = rows > prev ? prev + E(u, 1.6, 2.4) : rows;
    if (k < 5) table(c, shown, { hot: k === 4 ? [1, 2, 3, 4] : null, mark: k === 4 ? 1 : null });
    if (k === 1) { // UUID 를 8자리로 자른다
      const full = 'c2637f25-3172-496d-ae7d-134c69c1e068';
      mono(LANE.g - 160, 30, 'crypto.randomUUID()', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2) });
      mono(LANE.g + 6, 30, full.slice(0, 8), { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      mono(LANE.g + 6 + tw(full.slice(0, 8), 14.5), 30, full.slice(8), { 'font-size': 14.5, fill: OFF, opacity: fade(u, 0.4) * (1 - fade(u, 1.0, 0.4)), 'text-decoration': u > 0.9 ? 'line-through' : null });
      if (u > 1.0) pill(720, 148, 'req.log = child({ requestId: "c2637f25" })', ACC, pop(u, 1.1), { fs: 13.5, mono: true }); }
    if (k === 2) { clock(LANE.g + 110, LANE.y - 44, 17, E(u, 0.4, 2.6) * 0.6, ACC); mono(LANE.g + 136, LANE.y - 39, 'start = Date.now()', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
      dot([[LANE.g + 75, LANE.y], [LANE.h - 65, LANE.y]], seg(u, 0.6, 1.6), ACC, 8); }
    if (k === 3) { dot([[LANE.h + 65, LANE.y], [LANE.f - 70, LANE.y]], seg(u, 0.2, 0.9), GOOD, 8);
      if (u > 0.9) { grow(LANE.f, LANE.y + 30, LANE.f, 160, E(u, 0.9, 1.4), GOOD); }
      sub(LANE.f, 182, '응답이 끝난 뒤라 status·ms가 확정', fade(u, 1.2), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 4) { pill(800, 230, 'POST /pay  500 · 1180ms', BAD, pop(u, 1.0), { fs: 14, mono: true }); sub(800, 262, '이 한 줄로 조사 대상이 정해진다', fade(u, 1.4)); }
    if (k === 5) { // 같은 requestId 로 한 요청의 줄을 모은다 (실제 출력은 에러 줄 + 요약 줄 두 개)
      card(330, 190, 520, 40, { rx: 20, stroke: ACC, sw: 2, s: pop(u, 0.2) }); mono(90, 196, '🔍 requestId = "c2637f25"', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) });
      [[[['level ', MUT], ['50', BAD], ['  msg ', MUT], ['"request failed"', INK], ['  err ', MUT], ['"TypeError: …"', BAD]]], [[['level ', MUT], ['30', GOOD], ['  msg ', MUT], ['"request done"', INK], ['  status ', MUT], ['500', BAD], ['  ms ', MUT], ['1180', BAD]]]]
        .forEach(([parts], i) => { const y = 252 + i * 50, a = fade(u, 0.9 + i * 0.5); el('rect', { x: 70, y: y - 20, width: 620, height: 36, rx: 8, fill: SOFT, stroke: ACC, 'stroke-width': 1.5, opacity: a });
          spans(86, y + 4, parts.map(([s, col]) => [s, { fill: col }]), { 'font-size': 14, opacity: a }); });
      tx(380, 386, '핸들러가 req.log를 쓰면 ID가 저절로 붙어 두 줄이 한 요청으로 묶인다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); } }

  // ---------- 4. 중앙 에러 미들웨어 ----------
  const RT = [['GET', '/orders', 90], ['POST', '/pay', 180], ['GET', '/users/:id', 270]];
  const MW = [470, 180];
  function s4(t, c) { const { k, u } = c;
    RT.forEach(([m, p, y], i) => req(40, y, m, p, { s: k === 0 ? pop(u, 0.2 + i * 0.15) : 1 }));
    if (k === 0) { const f = lerp(0, 3, E(u, 0.8, 2.2));
      jcard(330, 100, 330, 'class AppError extends Error', [['message', '"order not found"'], ['status', 404, WARN], ['isOperational', true, GOOD]], f, { kw: 160, stroke: ACC, tc: ACC });
      tx(495, 290, '예상한 에러에는 표시를 단다 · 표시가 없으면 버그', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // 중앙 미들웨어 상자: 인자 4칸
    card(MW[0], MW[1], 250, 96, { rx: 12, stroke: ACC, sw: 2.6, fill: ACCBG, s: k === 1 ? pop(u, 0.2) : 1 });
    tx(MW[0], MW[1] - 26, '중앙 에러 미들웨어', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
    ['err', 'req', 'res', 'next'].forEach((a, i) => { const s = k === 1 ? pop(u, 0.5 + i * 0.2) : 1; card(MW[0] - 87 + i * 58, MW[1] + 14, 52, 32, { rx: 6, text: a, mono: true, fs: 14, stroke: i === 0 ? BAD : INK, color: i === 0 ? BAD : INK, s }); });
    // 라우트에서 에러가 모인다
    if (k === 1) { [[1, BAD], [2, WARN]].forEach(([i, col], j) => dot([[150, RT[i][2]], [MW[0] - 128, MW[1] + (j ? 14 : -14)]], seg(u, 1.0 + j * 0.3, 1.9 + j * 0.3), col, 8));
      sub(MW[0], MW[1] + 82, '인자가 3개면 일반 미들웨어라 에러가 들어오지 않는다', fade(u, 1.9)); }
    if (k >= 2) { grow(160, RT[1][2], MW[0] - 128, MW[1] - 10, 1, BAD, { plain: true, dash: '4 5' }); grow(200, RT[2][2], MW[0] - 128, MW[1] + 20, 1, WARN, { plain: true, dash: '4 5' }); }
    if (k === 2) { mono(MW[0], MW[1] + 84, 'status = err.status || 500', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      [['AppError("user not found", 404)', 404, 300], ['TypeError (버그, status 없음)', 500, 360]].forEach(([a, code, y], i) => { const op = fade(u, 0.9 + i * 0.5);
        mono(340, y + 5, a, { 'font-size': 14, opacity: op, fill: code >= 500 ? BAD : INK }); status(680, y, code, pop(u, 1.1 + i * 0.5)); }); }
    // 서버 로그: 스택까지 (실제 출력)
    if (k >= 3) { const a = k === 3 ? fade(u, 0.3) : 1; el('rect', { x: 640, y: 40, width: 300, height: 150, rx: 10, fill: INK, opacity: a });
      mono(656, 62, '서버 로그 (req.log.error)', { 'font-size': 13.5, fill: OFF, opacity: a });
      const L = [[['"level":', OFF], ['50', BAD]], [['"requestId":', OFF], ['"c321b8fa"', PANEL]], [['"err":', OFF], ['"TypeError: Cannot', BAD]], [['  read properties of null', BAD]], [['  (reading \'total\')"', BAD]]];
      L.forEach((p, i) => tline(656, 88 + i * 21, p, k === 3 ? fade(u, 0.6 + i * 0.25) : 1));
      if (k === 3) grow(MW[0] + 128, MW[1] - 20, 636, 120, E(u, 0.3, 0.8), INK); }
    if (k >= 4) { // 응답 몸통 두 갈래
      const g = k === 4 ? E(u, 0.3, 1.0) : 1;
      grow(MW[0] + 40, MW[1] + 50, 600, 290, g, GOOD); grow(MW[0] + 90, MW[1] + 50, 760, 290, g, BAD);
      mono(560, 260, 'isOperational', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: g, 'text-anchor': 'end' }); mono(790, 260, '표시 없음', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: g });
      const b1 = '{"error":"user not found"}', b2 = '{"error":"Internal Server Error"}';
      card(560, 316, tw(b1, 13.5) + 22, 34, { rx: 8, text: b1, mono: true, fs: 13.5, stroke: GOOD, color: GOOD, fill: GOODBG, s: k === 4 ? pop(u, 1.0) : 1 });
      card(800, 316, tw(b2, 13.5) + 22, 34, { rx: 8, text: b2, mono: true, fs: 13.5, stroke: BAD, color: BAD, fill: BADBG, s: k === 4 ? pop(u, 1.3) : 1 }); }
    if (k === 5) { // 클라이언트 경계: 스택은 넘지 못한다 (실제 응답)
      el('line', { x1: 300, y1: 350, x2: 940, y2: 350, stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '10 6', opacity: fade(u, 0.2) });
      tx(935, 368, '클라이언트 경계', { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      status(500, 392, 404, pop(u, 0.6), { text: 'Not Found' }); status(760, 392, 500, pop(u, 0.9), { text: 'Internal Server Error' });
      const by = lerp(200, 336, E(u, 1.2, 1.9)); if (u > 1.2) { pill(380, by, 'err.stack', BAD, 1, { mono: true, fs: 13.5 }); if (u > 1.9) cross(430, by, 9, pop(u, 1.9)); } } }

  // ---------- 5. 프로세스 크래시 대응 ----------
  function proc(x, y, w, h, pid, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 12, fill: o.dead ? SOFT : PANEL, stroke: o.dead ? OFF : o.col || INK, 'stroke-width': 2.4, 'stroke-dasharray': o.dead ? '6 5' : null, opacity: o.op ?? 1 });
    mono(x + 14, y + 22, 'node 프로세스 · pid ' + pid, { 'font-size': 14, 'font-weight': 700, fill: o.dead ? OFF : INK, opacity: o.op ?? 1 }); }
  const TRAPS = [['민감정보 로깅', '비밀번호·토큰·카드번호는 빼거나 가린다'], ['console.log 남발', '로거 하나로 모아 레벨·구조를 지킨다'], ['빈 catch', '삼키지 말고 최소한 { err }로 남긴다'], ['스택을 응답으로', '클라이언트엔 일반 메시지만']];
  function s5(t, c) { const { k, u } = c;
    if (k === 5) { TRAPS.forEach(([a, b], i) => { const cx = 250 + (i % 2) * 460, cy = 110 + Math.floor(i / 2) * 120, s = pop(u, 0.2 + i * 0.3);
        card(cx, cy, 420, 92, { rx: 12, stroke: BAD, sw: 2, s }); cross(cx - 180, cy - 14, 10, s);
        tx(cx - 160, cy - 8, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) }); tx(cx - 180, cy + 24, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      spans(110, 330, [['catch (e) { logger.error({ e }) }', { fill: MUT, 'text-decoration': 'line-through' }], ['  →  ', { fill: MUT }], ['"e":{}', { fill: BAD, 'font-weight': 700 }]], { 'font-size': 14.5, opacity: fade(u, 1.6) });
      spans(110, 362, [['catch (err) { logger.error({ err }, …) }', { fill: INK }], ['  →  ', { fill: MUT }], ['"err":{"type":"Error","message":…}', { fill: GOOD, 'font-weight': 700 }]], { 'font-size': 14.5, opacity: fade(u, 2.0) });
      return; }
    const dead = k >= 2, newer = k >= 4;
    proc(30, 40, 520, 200, '24044', { dead, op: newer ? 0.45 : 1 });
    // 안쪽: Express 요청 처리 + 에러 미들웨어
    zone(50, 76, 250, 100, 'Express 요청 처리', { fill: SOFT, op: dead ? 0.4 : 1 });
    card(175, 140, 200, 40, { rx: 8, text: '에러 미들웨어', fs: 14.5, stroke: GRID, color: dead ? OFF : INK });
    // 바깥: 타이머 콜백 / Promise
    const out = k === 3 ? 'Promise 거부 (catch 없음)' : 'setTimeout 콜백에서 throw';
    card(430, 126, 210, 46, { rx: 23, stroke: BAD, sw: 2.2, fill: BADBG, text: out, fs: 14, color: BAD, s: (k === 0 || k === 3) ? pop(u, 0.2) : 1, op: dead && k !== 3 ? 0.5 : 1 });
    sub(430, 202, '요청 처리 밖이라 미들웨어가 못 잡는다', (k === 0 || k === 3) ? fade(u, 0.8) : 0.6);
    // process.on 핸들러
    const ev = k === 3 ? 'unhandledRejection' : 'uncaughtException';
    card(770, 126, 300, 64, { rx: 12, stroke: ACC, sw: 2.6, fill: ACCBG, s: k === 0 ? pop(u, 1.0) : 1 }); mono(770, 120, 'process.on("' + ev + '")', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); sub(770, 144, '최후의 방어선');
    if (k === 0 || k === 3) dot([[540, 126], [618, 126]], seg(u, 1.2, 1.9), BAD, 8);
    // fatal 로그 (실제 출력 모양)
    if (k >= 1 && k < 4) { const a = k === 1 ? fade(u, 0.3) : 1; el('rect', { x: 30, y: 262, width: 900, height: k === 3 ? 140 : 70, rx: 10, fill: INK, opacity: a });
      if (k !== 3) tline(48, 304, [['{"level":', OFF], ['60', BAD], [',"err":', OFF], ['"Error: boom\\n    at …"', BAD], [',"msg":', OFF], ['"uncaught exception"}', PANEL]], k === 1 ? fade(u, 0.6) : 1);
      else { tline(48, 296, [['logger.fatal({ reason }, …)       ', OFF], ['→ "reason":{}', BAD], ['   Error는 JSON으로 비어 버린다', OFF]], fade(u, 0.6));
        tline(48, 336, [['logger.fatal({ err: reason }, …)  ', OFF], ['→ "err":{"type":"Error","message":"rej",…}', GOOD]], fade(u, 1.3));
        tline(48, 376, [['pino는 err 키의 Error만 message·stack으로 풀어 적는다', PANEL]], fade(u, 1.9)); } }
    if (k === 1) sub(770, 222, 'fatal = 60 · 왜 죽었는지 남기는 마지막 줄', fade(u, 1.0), { fill: INK, 'font-weight': 700 });
    if (k === 2) { cross(290, 140, 26, pop(u, 0.3)); pill(770, 222, 'process.exit(1)', BAD, pop(u, 0.6), { mono: true }); sub(290, 226, '상태가 오염됐을 수 있어 살려 두지 않는다', fade(u, 1.0), { fill: BAD, 'font-weight': 700 }); }
    if (k >= 4) { const s = k === 4 ? pop(u, 0.9) : 1;
      card(770, 236, 200, 42, { rx: 21, text: 'PM2 · systemd · k8s', fs: 14, fw: 700, stroke: INFO, color: INFO, s: k === 4 ? pop(u, 0.2) : 1 });
      el('rect', { x: 600, y: 300, width: 340, height: 90, rx: 12, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.4, opacity: s });
      mono(616, 326, 'node 프로세스 · 새 pid', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: s }); sub(770, 362, '매니저가 새로 띄운다 (횟수·간격은 운영 설정)', s);
      grow(770, 258, 770, 298, k === 4 ? E(u, 0.5, 0.9) : 1, GOOD); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'console.log만 쓰는 서버에서 할 수 없는 일은 무엇인가?',
      o: ['터미널에서 변수 값을 확인하는 일', 'error 줄만 골라 orderId=88로 검색하는 일', '서버가 켜졌는지 한 줄 찍어 보는 일'], a: 1,
      why: 'console 출력에는 레벨도 필드도 없다. 그래서 심각도나 orderId 같은 값으로 거를 기준이 없다.' },
    { q: 'LOG_LEVEL이 비어 있을 때 logger.debug({ sql }, "query")는 어떻게 되는가?',
      o: ['info 레벨로 바뀌어 남는다', 'error와 같은 줄에 섞여 남는다', '임계치 info보다 낮아 출력되지 않는다'], a: 2,
      why: '기본 임계치는 info(30)이고 debug는 20이다. 임계치보다 낮은 레벨은 아예 쓰이지 않는다.' },
    { q: '요청 요약 로그를 res.on("finish")에서 남기는 이유는 무엇인가?',
      o: ['응답이 끝나야 status와 소요시간 ms가 확정되기 때문', 'finish에서만 requestId를 만들 수 있기 때문', '요청 본문이 그때 처음 읽히기 때문'], a: 0,
      why: '요청이 막 들어온 순간에는 상태 코드도 걸린 시간도 모른다. 응답이 끝난 뒤에 남겨야 네 필드가 다 찬다.' },
    { q: 'POST /pay에서 null 참조 TypeError가 나면 클라이언트는 무엇을 받는가?',
      o: ['500과 스택이 담긴 본문', '500과 {"error":"Internal Server Error"}', '404와 {"error":"order not found"}'], a: 1,
      why: 'TypeError에는 status도 isOperational도 없다. 상태는 500, 본문은 일반 문구가 되고 스택은 서버 로그에만 남는다.' },
    { q: 'uncaughtException 핸들러에서 해야 할 일은 무엇인가?',
      o: ['fatal로 스택을 남기고 process.exit(1)로 끝낸다', '에러를 무시하고 요청을 계속 받는다', '같은 프로세스 안에서 앱을 다시 시작한다'], a: 0,
      why: '여기까지 온 프로세스는 상태가 오염됐을 수 있다. 마지막 로그를 남기고 끝내면 PM2나 k8s가 새 프로세스를 띄운다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    'console.log 출력에는 레벨도 필드도 없어서 운영 로그에서 error만 골라낼 수 없다.',
    'pino는 한 줄에 JSON 하나를 쓰고, LOG_LEVEL보다 낮은 레벨은 아예 출력하지 않는다.',
    '요청마다 requestId를 자식 로거에 심으면 그 요청에서 나온 줄을 ID 하나로 모은다.',
    '에러는 중앙 미들웨어에서 스택을 로그에만 남기고, 프로세스 밖 예외는 로깅 후 종료한다.',
  ];
  const review = [
    { q: '결제 실패 문의가 들어왔는데 로그 수만 줄에서 그 요청을 찾을 수 없다. 처음부터 있었어야 할 것은?',
      o: ['모든 로그를 console.error로 바꾸기', '요청마다 requestId를 심는 로깅 미들웨어', '로그 파일을 하루 단위로 나누기'], a: 1,
      why: 'requestId가 자식 로거에 박혀 있으면 그 요청의 에러 줄과 요약 줄이 같은 ID로 묶여 바로 걸러진다.' },
    { q: '500 응답 본문에 "Cannot read properties of null"이 그대로 보인다. 먼저 의심할 곳은?',
      o: ['에러 미들웨어가 표시 없는 에러의 message를 그대로 응답했다', 'LOG_LEVEL이 debug로 켜져 있다', 'requestId가 8자리라 겹쳤다'], a: 0,
      why: 'isOperational이 없는 에러는 버그다. 본문은 일반 문구로 바꾸고 원래 메시지와 스택은 서버 로그에만 남겨야 한다.' },
    { q: '프로세스가 죽은 뒤 fatal 로그를 열었더니 "reason":{}만 남아 있다. 고칠 곳은?',
      o: ['process.exit(1)을 지워 프로세스를 살려 둔다', 'LOG_LEVEL을 debug로 올려 더 많이 남긴다', '거부 값을 err 키로 넘겨 pino가 message와 stack을 풀게 한다'], a: 2,
      why: 'Error 객체는 JSON으로 바꾸면 빈 객체가 된다. pino는 err 키로 받은 Error만 type·message·stack으로 풀어 적는다.' },
  ];

  R.page({ title: '로그 한 줄이 남기까지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
