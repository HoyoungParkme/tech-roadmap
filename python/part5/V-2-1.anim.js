/* V-2-1 로깅·설정 관리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행 확인(python 3.12): 레벨 값 10/20/30/40/50, INFO 로거에서 debug 는 버려지고 4줄 통과, debug("…%s", expensive()) 는 버려져도 expensive 1회 호출,
 * isEnabledFor 가드 뒤에도 호출 1회 그대로. dictConfig: 콘솔(INFO) 1줄, app.log(DEBUG) 2줄.
 * JsonFormatter 는 핸들러에 달아야 JSON 이 나온다(원래 코드는 핸들러가 없어 info 가 사라졌다). json.dumps("결제") = "결제".
 * pydantic-settings 2.13: APP_ENV=prod 가 .env 의 dev 를 덮고 DEBUG=true → True, DATABASE_URL 없고 SECRET_KEY 짧으면 2 validation errors. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, server, cross, check, terminal, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const typed = (s, p) => s.slice(0, Math.round(s.length * clamp(p)));
  const LV = [['DEBUG', 10, MUT], ['INFO', 20, INFO], ['WARNING', 30, WARN], ['ERROR', 40, BAD], ['CRITICAL', 50, BAD]];
  function tracker(k, labels) { labels.forEach((s, i) => { const x = 120 + i * 240, on = i === k, done = i < k;
    card(x, 30, 218, 34, { rx: 17, text: s, fs: 14, fw: 700, stroke: on ? BAD : done ? GOOD : GRID, color: on ? BAD : done ? GOOD : MUT, fill: on ? C.BADBG : PANEL, sw: on ? 2.4 : 1.5 }); }); }
  // 키-값 줄 (JSON 필드)
  function kv(x, y, k, v, o) { o = o || {}; const op = o.op ?? 1;
    if (o.hot) el('rect', { x: x - 8, y: y - 17, width: o.w || 400, height: 24, rx: 5, fill: ACCBG, opacity: op });
    mono(x, y, '"' + k + '":', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: op }); mono(x + (o.kw || 120), y, v, { 'font-size': 14.5, fill: o.col || INK, opacity: op }); }

  // ═════════ 1. 레벨 필터 ═════════
  const LY = (v) => 360 - (v - 10) * 6.6;   // 레벨 값 → 세로 위치
  function ladder(k, u) { tx(40, 46, '레벨 값', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    LV.forEach(([n, v, col], i) => { const y = LY(v), s = k === 0 ? pop(u, 0.2 + i * 0.15) : 1;
      card(140, y, 200, 36, { rx: 8, stroke: col, sw: 2, s }); mono(56, y + 5, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s }); mono(222, y + 5, String(v), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: col, opacity: s }); });
    const g = k === 0 ? E(u, 1.2, 1.9) : 1, ty = LY(15);
    el('line', { x1: 30, y1: ty, x2: lerp(30, 470, g), y2: ty, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' });
    tx(250, ty - 8, 'setLevel(INFO) 임계 20', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: g });
    tx(250, ty + 22, '이 아래는 버린다', { 'font-size': 13.5, fill: MUT, opacity: g }); }
  function s1(t, c) { const { k, u } = c;
    ladder(k, u);
    const out = [['INFO', '주문 생성 order_id=…'], ['WARNING', '재고 부족 sku=…'], ['ERROR', '결제 실패 …'], ['CRITICAL', 'DB 연결 끊김']];
    if (k === 0) { tx(700, 140, 'logger = getLogger(__name__)', { 'font-size': 15, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      tx(700, 172, '임계 레벨은 환경에 맞춰 바꾸는 스위치', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
      [['개발', 'DEBUG 까지', 610], ['운영', 'WARNING 이상', 790]].forEach(([a, b, cx], i) => card(cx, 240, 160, 56, { rx: 10, text: a + '\n' + b, fs: 14.5, stroke: i ? WARN : INFO, s: pop(u, 2.0 + i * 0.2) })); }
    if (k === 1) { const p = seg(u, 0.3, 1.3), q = seg(u, 1.3, 2.2), y = LY(10);
      if (p < 1) pill(lerp(800, 160, E(p, 0, 1)), y, 'logger.debug', MUT, p > 0 ? 1 : 0, { mono: true, fs: 13.5 });
      else { pill(160, lerp(y, 405, E(q, 0, 1)), 'debug', OFF, 1 - 0.7 * q, { mono: true, fs: 13.5 }); }
      if (q > 0.5) cross(330, 395, 10, pop(u, 1.8));
      tx(640, 200, 'DEBUG 10 < INFO 20', { 'font-size': 20, 'font-weight': 800, class: 'mono', 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.8) });
      tx(640, 232, '이 호출은 아무것도 남기지 않는다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) }); }
    if (k >= 2) { terminal(520, 60, 410, 160, out.map(([a, b]) => [a.padEnd(9) + b, a === 'INFO' ? '#93c5fd' : a === 'WARNING' ? '#fbbf24' : '#f87171']), k === 2 ? lerp(0, 4, E(u, 0.8, 2.2)) : 4, { fs: 14, lh: 26, title: '출력' });
      if (k === 2) out.forEach(([a], i) => { const v = LV.find((l) => l[0] === a)[1]; dot([[250, LY(v)], [380, LY(v)], [520, 100 + i * 26]], seg(u, 0.3 + i * 0.3, 1.0 + i * 0.3), LV.find((l) => l[0] === a)[2], 7); });
      if (k === 2) tx(720, 260, '임계 이상 4건이 통과한다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) }); }
    if (k === 3 || k === 4) { const y = 300;
      mono(520, y - 30, k === 3 ? 'logger.debug("…=%s", expensive())' : 'if logger.isEnabledFor(DEBUG):', { 'font-size': 14.5, 'font-weight': 700, fill: k === 3 ? WARN : GOOD, opacity: fade(u, 0.2) });
      if (k === 3) { ['"무거운 계산 결과="', '+', '"결과"'].forEach((s, i) => { const x = 530 + [0, 175, 205][i]; mono(x, y + 10, s, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) }); });
        el('line', { x1: 525, y1: y + 6, x2: lerp(525, 780, E(u, 1.0, 1.5)), y2: y + 6, stroke: BAD, 'stroke-width': 2.4 });
        tx(800, y + 10, '조립 안 함', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) }); }
      if (k === 4) { mono(540, y + 6, 'False → 안쪽 줄을 건너뛴다', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 0.7) }); }
      const n = k === 3 ? (u > 1.2 ? 1 : 0) : 1;
      card(640, 378, 260, 40, { rx: 8, stroke: k === 3 ? BAD : GOOD, sw: 2 }); mono(640, 384, 'expensive() 호출: ' + n + '번', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 3 ? BAD : GOOD });
      if (k === 3) tx(860, 384, '인자는 미리 계산된다', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      else tx(860, 384, '1번 그대로', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); } }

  // ═════════ 2. Logger → Handler → Formatter ═════════
  const LINE = ['2026-11-24 12:18:23,345', 'INFO', '__main__', '- 앱 시작'];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { mono(60, 60, typed('LOGGING = {"version": 1,', seg(u, 0.1, 0.8)), { 'font-size': 15, 'font-weight': 700 });
      mono(60, 86, typed('  "disable_existing_loggers": False, …}', seg(u, 0.6, 1.3)), { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      [['True (기본값)', false, 140], ['False', true, 560]].forEach(([n, on, x], i) => { const a = 1.2 + i * 0.5;
        zone(x, 130, 360, 200, 'disable_existing_loggers = ' + n, { stroke: on ? GOOD : BAD, fill: on ? C.GOODBG : C.BADBG, color: on ? GOOD : BAD, op: fade(u, a) });
        ['라이브러리 로거', '먼저 만든 로거'].forEach((m, j) => { const y = 200 + j * 56; card(x + 160, y, 220, 40, { rx: 8, text: m, fs: 14.5, stroke: on ? INK : OFF, color: on ? INK : OFF, op: fade(u, a + 0.2) });
          el('circle', { cx: x + 300, cy: y, r: 8, fill: on ? GOOD : OFF, opacity: fade(u, a + 0.4) }); }); });
      tx(480, 380, '대부분 False: 이미 있는 로거를 끄지 않는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    if (k === 1) { tx(60, 56, 'LogRecord 한 건', { 'font-size': 15, 'font-weight': 700 });
      const F = [['asctime', LINE[0]], ['levelname', LINE[1]], ['name', LINE[2]], ['message', '앱 시작']];
      F.forEach(([a, b], i) => { const y = 92 + i * 40, s = pop(u, 0.2 + i * 0.15); card(250, y, 380, 34, { rx: 6, stroke: GRID, sw: 1.5, s }); mono(76, y + 5, a, { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: s }); mono(200, y + 5, b, { 'font-size': 14.5, opacity: s });
        dot([[440, y], [520, y], [600, 300]], seg(u, 1.0 + i * 0.15, 1.8 + i * 0.15), INFO, 6); });
      card(720, 150, 420, 70, { rx: 10, stroke: WARN, fill: C.WARNBG, sw: 2, s: pop(u, 0.8) }); tx(720, 140, 'Formatter "default"', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.9) });
      mono(720, 166, '%(asctime)s %(levelname)s %(name)s - %(message)s', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      terminal(60, 280, 860, 64, [LINE.join(' ')], u > 1.9 ? 1 : 0, { fs: 15 });
      tx(480, 380, '레코드의 필드를 한 줄 텍스트로 찍는 모양 (시각은 실행 예)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k 2~5: 파이프라인 그림을 쌓아 간다
    const LG = [130, 210], H1 = [470, 120], H2 = [470, 300];
    const loggerBox = () => { card(LG[0], LG[1], 190, 64, { rx: 10, stroke: INFO, sw: 2.4 }); mono(LG[0], LG[1] - 4, k >= 4 ? 'root' : 'logger', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO }); tx(LG[0], LG[1] + 18, k >= 4 ? 'level DEBUG' : '1차 필터', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); };
    loggerBox();
    const hbox = (pos, n, lv, at) => { const s = at == null ? 1 : pop(u, at); card(pos[0], pos[1], 210, 70, { rx: 10, stroke: INK, sw: 2.2, s }); mono(pos[0], pos[1] - 6, n, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); tx(pos[0], pos[1] + 18, '2차 필터 ' + lv, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: lv === 'INFO' ? INFO : MUT, opacity: s }); };
    const g1 = k === 2 ? E(u, 0.2, 0.8) : 1; grow(LG[0] + 96, LG[1] - 10, H1[0] - 108, H1[1] + 10, g1, MUT);
    hbox(H1, 'StreamHandler', 'INFO', k === 2 ? 0.6 : null);
    terminal(660, 70, 270, 110, k >= 5 ? [['INFO __main__ - 앱 시작', '#93c5fd']] : [], k >= 5 ? 1 : 0, { fs: 13.5, title: '콘솔' });
    grow(H1[0] + 106, H1[1], 655, H1[1], k === 2 ? E(u, 1.0, 1.4) : 1, MUT);
    if (k === 2) tx(470, 200, '로거가 통과시켜도 핸들러가 다시 거른다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) });
    if (k >= 3) { grow(LG[0] + 96, LG[1] + 10, H2[0] - 108, H2[1] - 10, k === 3 ? E(u, 0.2, 0.8) : 1, MUT);
      hbox(H2, 'RotatingFileHandler', 'DEBUG', k === 3 ? 0.6 : null); grow(H2[0] + 106, H2[1], 655, H2[1], k === 3 ? E(u, 1.0, 1.4) : 1, MUT);
      ['app.log.5', 'app.log.4', 'app.log.3', 'app.log.2', 'app.log.1', 'app.log'].forEach((n, i) => { const s = k === 3 ? pop(u, 1.2 + i * 0.12) : 1, y = 240 + i * 26 - (i === 5 ? 0 : 0);
        card(790, y, 200, 24, { rx: 5, text: n, mono: true, fs: 13.5, stroke: i === 5 ? INK : GRID, color: i === 5 ? INK : MUT, s }); });
      if (k === 3) tx(790, 404, '10MB 넘으면 돌리고 5개 보관', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 4) { [['__main__', 90], ['app.db', 330]].forEach(([n, y], i) => { pill(LG[0], y + (i ? 30 : -40), n, INFO, pop(u, 0.3 + i * 0.2), { mono: true });
        grow(LG[0], y + (i ? 14 : -24), LG[0], LG[1] + (i ? 32 : -32), E(u, 0.7 + i * 0.2, 1.2 + i * 0.2), INFO); });
      tx(LG[0] + 110, 400, '자식 로거 → 루트로 전파', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    if (k === 5) { mono(LG[0], 60, 'dictConfig(LOGGING)', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      [['INFO 앱 시작', INFO, [H1, H2], 0.2], ['DEBUG 풀 크기=5', MUT, [H2], 1.2]].forEach(([n, col, to, a], i) => {
        if (u > a && u < a + 1.0) pill(LG[0], LG[1] + 52, n, col, 1, { fs: 13.5 });
        to.forEach((h) => dot([[LG[0] + 96, LG[1]], [h[0] - 108, h[1]], [h[0] + 106, h[1]], [655, h[1]]], seg(u, a + 0.2, a + 1.0), col, 7)); });
      if (u > 1.4) { cross(H1[0] + 130, H1[1] + 40, 8, pop(u, 1.6)); tx(H1[0], H1[1] + 62, 'DEBUG 는 콘솔에서 막힘', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) }); }
      tx(790, 404, 'app.log 에는 2줄 (실행 확인)', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.2) }); } }

  // ═════════ 3. JSON 로그 · 상관ID · 예외 ═════════
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 90, 300, 60, { rx: 10, text: 'logging.Formatter', mono: true, fs: 17, stroke: MUT, color: MUT, s: pop(u, 0.2) });
      grow(480, 220, 480, 124, E(u, 0.7, 1.2), INK);
      card(480, 260, 360, 76, { rx: 10, stroke: ACC, sw: 2.6, s: pop(u, 0.5) }); mono(480, 252, 'JsonFormatter', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      mono(480, 278, 'def format(self, record): …', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(480, 350, 'format() 하나만 갈아끼우면 출력 모양이 통째로 바뀐다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(480, 378, '돌려준 문자열이 그대로 로그 한 줄', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { const parts = [['2026-11-24 12:18:34,336', 'ts'], ['INFO', 'level'], ['orders', 'logger'], ['주문 처리', 'msg']];
      const sp = E(u, 0.8, 1.8); let x = 60;
      parts.forEach(([v, key], i) => { const w = tw(v, 15) + 20, tx0 = x, ty0 = 80, tx1 = 520, ty1 = 160 + i * 52;
        x += w + 10; const cx = lerp(tx0 + w / 2, tx1 + 180, sp), cy = lerp(ty0, ty1, sp);
        card(cx, cy, sp > 0.5 ? 360 : w, 38, { rx: 8, stroke: sp > 0.5 ? INFO : GRID, sw: 1.8 });
        if (sp > 0.5) { mono(cx - 165, cy + 5, '"' + key + '":', { 'font-size': 14.5, 'font-weight': 700, fill: INFO }); mono(cx - 70, cy + 5, '"' + v + '"', { 'font-size': 14.5 }); }
        else mono(cx, cy + 5, v, { 'font-size': 15, 'text-anchor': 'middle' }); });
      tx(60, 50, '사람이 읽는 한 줄', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      tx(260, 300, '검색할 수 있는 필드 4개', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.9) });
      tx(260, 330, 'level="ERROR" 같은 조건 검색·집계', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { mono(60, 70, 'log.info("주문 처리", extra={"request_id": rid})', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      card(250, 180, 300, 90, { rx: 10, stroke: INK, s: pop(u, 0.4) }); tx(250, 160, 'record', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      mono(250, 195, '.request_id = rid', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
      grow(330, 86, 260, 150, E(u, 0.5, 1.0), ACC);
      grow(400, 180, 560, 180, E(u, 1.3, 1.7), ACC);
      kv(590, 186, 'request_id', 'rid 값', { hot: true, w: 320, op: fade(u, 1.7), kw: 140 });
      tx(250, 300, 'extra 가 없으면?', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      mono(250, 326, 'getattr(record, "request_id", None)', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      kv(590, 326, 'request_id', 'null', { col: MUT, op: fade(u, 2.2), kw: 140 });
      tx(750, 370, '예외 대신 기본값: 로깅이 앱을 죽이지 않는다', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.4) }); return; }
    if (k === 3) { tx(60, 56, 'record.exc_info 가 있을 때만', { 'font-size': 15, 'font-weight': 700 });
      terminal(60, 72, 420, 130, ['Traceback (most recent call last):', '  File "structured.py", line 25', '    1 / 0', ['ZeroDivisionError: division by zero', '#f87171']], lerp(0, 4, E(u, 0.2, 1.0)), { fs: 13.5, lh: 21 });
      grow(490, 137, 560, 137, E(u, 1.1, 1.4), ACC);
      kv(590, 143, 'exc', '"Traceback …\\n…"', { hot: true, w: 330, op: fade(u, 1.3), kw: 70 });
      tx(60, 260, 'json.dumps("결제")', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.6) });
      [['ensure_ascii=True (기본)', '"\\uacb0\\uc81c"', BAD], ['ensure_ascii=False', '"결제"', GOOD]].forEach(([a, b, col], i) => { const y = 300 + i * 40;
        tx(60, y, a, { 'font-size': 14.5, opacity: fade(u, 1.8 + i * 0.3) }); mono(330, y, b, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 1.8 + i * 0.3) }); });
      return; }
    // k 4, 5: 실제 출력 (rid 는 실행마다 다르다)
    tx(60, 46, k === 4 ? 'h = StreamHandler(); h.setFormatter(JsonFormatter())' : 'except 안에서 log.exception(...)', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: ACC });
    const rows = (y0, lvl, msg, exc, a) => { const o = fade(u, a);
      el('rect', { x: 50, y: y0 - 24, width: 430, height: exc ? 172 : 148, rx: 10, fill: PANEL, stroke: lvl === 'ERROR' ? BAD : INFO, 'stroke-width': 2, opacity: o });
      [['ts', '"2026-11-24 12:18:34,336"'], ['level', '"' + lvl + '"'], ['logger', '"orders"'], ['msg', '"' + msg + '"'], ['request_id', '"61bfa1ad"']].concat(exc ? [['exc', '"Traceback …"']] : []).forEach(([kk, v], i) =>
        kv(66, y0 + i * 24, kk, v, { op: o, hot: kk === 'request_id' && k === 5 && u > 1.8, w: 414, col: kk === 'level' && lvl === 'ERROR' ? BAD : INK })); };
    if (k === 4) { pill(700, 110, 'logger "orders"', INFO, pop(u, 0.2), { mono: true }); grow(700, 128, 700, 168, E(u, 0.4, 0.7), MUT);
      card(700, 196, 250, 44, { rx: 8, text: 'Handler + JsonFormatter', fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 0.6) });
      dot([[700, 220], [700, 260], [480, 200]], seg(u, 1.0, 1.6), ACC, 7);
      rows(110, 'INFO', '주문 처리', false, 1.4);
      tx(700, 300, 'uuid4().hex[:8] = 요청마다 새 8자리', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(700, 326, '값은 실행마다 다르다 (예: 61bfa1ad)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); return; }
    rows(110, 'ERROR', '결제 계산 실패', true, 0.2);
    card(720, 110, 330, 44, { rx: 22, stroke: ACC, sw: 2.2, s: pop(u, 1.2) }); mono(720, 116, 'request_id = "61bfa1ad"', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.3) });
    [['INFO  주문 처리', INFO], ['ERROR 결제 계산 실패', BAD]].forEach(([n, col], i) => { const y = 200 + i * 50; card(720, y, 300, 38, { rx: 8, text: n, fs: 14.5, stroke: col, color: col, s: pop(u, 1.6 + i * 0.25) }); el('path', { d: `M 555 110 L 540 110 L 540 ${y} L 568 ${y}`, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: E(u, 1.4, 1.7) }); });
    tx(720, 320, '한 요청의 로그를 한 번에 꿰맨다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.2) });
    tx(270, 380, 'str(e) 만 남기면 어디서 터졌는지 잃는다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.4) }); }

  // ═════════ 4. 설정 관리 ═════════
  const FIELDS = [['app_env', 'str', '"dev"'], ['debug', 'bool', 'False'], ['database_url', 'str', '필수'], ['secret_key', 'str', '16자 이상'], ['db_host', 'str', '"localhost"'], ['http_timeout', 'float', '3.0']];
  function schema(k, u, hot) { const x = 30, w = 430;
    tx(x, 46, 'class Settings(BaseSettings)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: INFO });
    FIELDS.forEach(([n, ty, d], i) => { const y = 78 + i * 40, s = k === 0 ? pop(u, 0.3 + i * 0.2) : 1, on = hot && hot.includes(i);
      el('rect', { x, y: y - 4, width: w, height: 34, rx: 6, fill: on ? ACCBG : SOFT, opacity: s });
      mono(x + 12, y + 18, n, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); mono(x + 170, y + 18, ty, { 'font-size': 14.5, fill: INFO, opacity: s });
      mono(x + w - 12, y + 18, d, { 'font-size': 14.5, 'text-anchor': 'end', fill: d === '필수' || d.includes('16') ? BAD : MUT, 'font-weight': 700, opacity: s }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 5) { zone(40, 60, 420, 300, 'git 저장소', { stroke: INK, fill: SOFT });
      card(250, 140, 260, 90, { rx: 8, stroke: GOOD, sw: 2, s: pop(u, 0.2) }); mono(140, 116, '.env.example', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) });
      ['APP_ENV=', 'DATABASE_URL=', 'SECRET_KEY='].forEach((s, i) => mono(140, 140 + i * 20, s, { 'font-size': 13.5, opacity: fade(u, 0.4) }));
      mono(250, 270, '.gitignore: .env', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.8) });
      const p = seg(u, 1.0, 1.8), x = lerp(700, 520, Math.sin(p * Math.PI) * 0.9 + 0);
      card(x, 180, 200, 90, { rx: 8, stroke: BAD, sw: 2, fill: C.BADBG }); mono(x - 84, 156, '.env', { 'font-size': 15, 'font-weight': 800, fill: BAD });
      mono(x - 84, 180, 'SECRET_KEY=…', { 'font-size': 13.5 }); mono(x - 84, 200, 'DATABASE_URL=…', { 'font-size': 13.5 });
      if (p >= 1) cross(476, 180, 12, pop(u, 1.8));
      tx(700, 270, '실제 값은 로컬에만', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) });
      tx(480, 392, '운영 시크릿은 파일이 아니라 Vault · Secrets Manager 에서 주입', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); return; }
    schema(k, u, k === 2 ? [0, 1] : k === 3 ? [2, 3] : k === 4 ? [0] : null);
    if (k === 0) { tx(700, 140, '속성 선언 = 설정 스키마', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(700, 170, '오타는 자동완성과 타입 검사가 잡는다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) }); }
    if (k === 1) { card(700, 150, 330, 110, { rx: 10, stroke: INK, s: pop(u, 0.2) }); mono(550, 116, '.env', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) });
      ['APP_ENV=dev', 'DATABASE_URL=postgresql://localhost/app', 'SECRET_KEY=change-me-in-prod-please'].forEach((s, i) => mono(550, 144 + i * 22, typed(s, seg(u, 0.5 + i * 0.3, 1.0 + i * 0.3)), { 'font-size': 13.5 }));
      for (let i = 0; i < 3; i++) dot([[540, 144 + i * 22], [480, 160 + i * 40], [460, 100 + i * 40]], seg(u, 1.6 + i * 0.15, 2.3 + i * 0.15), ACC, 6);
      tx(700, 250, 'extra="ignore": 모르는 키는 조용히 무시', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 2) { tx(700, 96, '환경변수 값은 늘 문자열', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      pill(580, 150, 'DEBUG="true"', MUT, pop(u, 0.6), { mono: true }); grow(660, 150, 740, 150, E(u, 1.0, 1.4), ACC); pill(800, 150, 'True', GOOD, pop(u, 1.4), { mono: true });
      tx(700, 200, 'bool 로 선언해 두면 pydantic 이 바꿔 준다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) });
      tx(700, 250, '아무것도 안 주면 app_env = "dev"', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 2.0), class: 'mono' }); }
    if (k === 3) { tx(700, 80, 'DATABASE_URL 없음, SECRET_KEY=short', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.2) });
      terminal(500, 100, 430, 160, [['2 validation errors for Settings', '#f87171'], 'database_url', ['  Field required', '#fbbf24'], 'secret_key', ['  String should have at least 16', '#fbbf24'], ['  characters', '#fbbf24']], lerp(0, 6, E(u, 0.5, 1.8)), { fs: 13.5, lh: 19 });
      tx(715, 300, '잘못된 설정으로 조용히 도느니 시작하다 죽는다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.1) }); }
    if (k === 4) { tx(700, 56, 'app_env 는 어디서 오나 (위가 우선)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      [['환경변수 APP_ENV', 'prod', ACC], ['.env 파일', 'dev', INK], ['코드 기본값', 'dev', MUT]].forEach(([a, b, col], i) => { const yy = 110 + i * 60, s = pop(u, 0.2 + (2 - i) * 0.35); card(700, yy, 360, 48, { rx: 8, stroke: col, sw: i === 0 ? 2.6 : 1.6, fill: i === 0 ? ACCBG : PANEL, s });
        tx(540, yy + 5, a, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: s }); mono(860, yy + 5, '"' + b + '"', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: s }); });
      card(700, 320, 300, 46, { rx: 23, stroke: ACC, sw: 2.4, s: pop(u, 1.6) }); mono(700, 326, 'settings.app_env = "prod"', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.7) });
      tx(700, 376, '실행 확인: APP_ENV=prod 를 주면 prod', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1) }); } }

  // ═════════ 5. 실무 실패 4종 ═════════
  const PIT = ['① print 디버깅', '② 시크릿 노출', '③ 레벨 남용', '④ 하드코딩'];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tx(480, 90, '교정에 쓸 재료 두 가지', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
      [['logger = getLogger(__name__)', INFO, 300], ['from settings import settings', GOOD, 660]].forEach(([s, col, cx], i) => card(cx, 170, 320, 50, { rx: 10, text: s, mono: true, fs: 14.5, stroke: col, color: col, s: pop(u, 0.4 + i * 0.3) }));
      PIT.forEach((p, i) => { const x = 120 + i * 240; grow(i < 2 ? 300 : 660, 196, x, 272, E(u, 1.2 + i * 0.15, 1.7 + i * 0.15), GRID, { plain: true });
        card(x, 290, 200, 36, { rx: 18, text: p, fs: 14, stroke: GRID, color: MUT, s: pop(u, 1.6 + i * 0.15) }); });
      tx(480, 370, 'logging 을 쓰고 설정을 밖으로 빼면 네 가지가 모두 사라진다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.3) }); return; }
    tracker(k - 1, PIT);
    if (k === 1) { [['print("debug", order)', BAD, '배포 후: 흔적 없음 · 지우지 않으면 소음'], ['logger.debug("order=%s", order)', GOOD, '운영 WARNING 에서는 숨고, 필요할 때 켠다']].forEach(([code, col, note], i) => {
        const x = 40 + i * 460; zone(x, 80, 420, 250, i ? '좋음' : '나쁨', { stroke: col, fill: i ? C.GOODBG : C.BADBG, color: col, op: fade(u, 0.2 + i * 0.6) });
        mono(x + 20, 130, code, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.6) });
        tx(x + 20, 300, note, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.6) }); });
      for (let i = 0; i < 5; i++) { const y = 170 + i * 22; mono(60, y, 'here ' + i, { 'font-size': 13.5, fill: OFF, opacity: fade(u, 0.6 + i * 0.1) }); }
      const on = u > 1.9; card(700, 200, 160, 50, { rx: 25, stroke: on ? GOOD : MUT, sw: 2 }); el('circle', { cx: on ? 750 : 650, cy: 200, r: 18, fill: on ? GOOD : OFF });
      tx(700, 245, on ? 'LOG_LEVEL=DEBUG 로 켬' : '운영: 꺼 둠', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: on ? GOOD : MUT }); }
    if (k === 2) { mono(60, 100, 'log.info(f"db={password}")', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-decoration': u > 1.9 ? 'line-through' : null });
      card(250, 190, 300, 50, { rx: 8, stroke: BAD, fill: C.BADBG, s: pop(u, 0.4) }); mono(250, 196, 'db=s3cr3t!', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.5) });
      server(650, 190, null, { s: 0.8 * pop(u, 0.7) }); tx(650, 260, '로그 수집기', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      dot([[400, 190], [600, 190]], seg(u, 0.8, 1.4), BAD, 7);
      [770, 840, 910].forEach((x, i) => { person(x, 180, null, { s: 0.8 * pop(u, 1.2 + i * 0.15) }); });
      tx(840, 240, '여럿이 본다', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) });
      mono(60, 340, 'log.info("DB 연결 시도 host=%s", settings.db_host)', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) });
      tx(60, 372, '값 대신 안전한 정보만. 한 번 찍힌 시크릿은 회수할 수 없다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 3) { const L = ['주문 조회', '장바구니 담기', '결제 실패!', '주문 조회', '로그인'];
      [['전부 INFO', 40, false], ['레벨을 의미대로', 500, true]].forEach(([n, x, ok], j) => { tx(x, 80, n, { 'font-size': 15, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: fade(u, 0.2 + j * 0.8) });
        L.forEach((m, i) => { const err = i === 2, lv = ok && err ? 'ERROR' : 'INFO', y = 110 + i * 40, s = seg(u, 0.3 + j * 0.8 + i * 0.1, 0.6 + j * 0.8 + i * 0.1);
          const dim = ok && u > 2.0 && !err; card(x + 200, y, 400, 32, { rx: 6, stroke: ok && err ? BAD : GRID, sw: ok && err ? 2.4 : 1.4, op: s * (dim ? 0.3 : 1) });
          mono(x + 14, y + 5, lv.padEnd(6) + m, { 'font-size': 14, fill: ok && err ? BAD : INK, 'font-weight': ok && err ? 800 : 400, opacity: s * (dim ? 0.3 : 1) }); }); });
      tx(240, 340, '진짜 에러가 소음에 묻힌다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.2) });
      tx(700, 340, 'ERROR 이상만 거르면 바로 보인다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.1) });
      mono(700, 370, 'exc_info=True 로 스택까지', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 4) { zone(40, 70, 420, 260, '나쁨: 코드에 박는다', { stroke: BAD, fill: C.BADBG, color: BAD });
      mono(60, 130, 'TIMEOUT = 3', { 'font-size': 16, 'font-weight': 800, fill: BAD });
      ['dev', 'staging', 'prod'].forEach((e, i) => { card(110 + i * 130, 220, 110, 40, { rx: 8, text: e, fs: 14.5, s: pop(u, 0.3 + i * 0.15) }); });
      tx(250, 290, '환경마다 코드 수정 · 재배포', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.9) });
      zone(500, 70, 420, 260, '좋음: 환경에서 주입', { stroke: GOOD, fill: C.GOODBG, color: GOOD, op: fade(u, 1.0) });
      mono(520, 130, 'timeout = settings.http_timeout', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.1) });
      [['dev', '3.0 (기본값)'], ['prod', 'HTTP_TIMEOUT=10 (예)']].forEach(([e, v], i) => { const y = 190 + i * 50; card(580, y, 100, 36, { rx: 8, text: e, fs: 14.5, s: pop(u, 1.3 + i * 0.2) });
        mono(650, y + 5, v, { 'font-size': 14.5, opacity: fade(u, 1.4 + i * 0.2) }); });
      tx(710, 300, '코드는 그대로, 값만 바뀐다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) });
      tx(480, 380, 'pydantic-settings 가 타입까지 검증한다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.3) }); } }

  const quiz = [
    { q: '로거 레벨을 INFO로 두었을 때 logger.debug(...) 호출은 어떻게 되는가?',
      o: ['INFO로 올려서 출력된다', 'DEBUG(10)가 임계 INFO(20)보다 낮아 버려진다', '예외가 난다'], a: 1,
      why: '임계보다 낮은 레벨은 버린다. 단, 인자로 넘긴 expensive() 같은 호출은 버려져도 한 번 실행된다.' },
    { q: '로거 레벨이 DEBUG이고 콘솔 핸들러 레벨이 INFO일 때 DEBUG 레코드는 어디에 남는가?',
      o: ['콘솔과 파일 모두', '아무 데도 남지 않는다', 'DEBUG 레벨인 파일 핸들러에만'], a: 2,
      why: '로거를 통과한 레코드를 핸들러가 다시 거른다. 실행해 보면 콘솔에는 1줄, app.log에는 2줄이 남는다.' },
    { q: 'JsonFormatter를 정의했는데 로그가 JSON으로 안 나온다. 빠진 것은 무엇인가?',
      o: ['핸들러에 setFormatter(JsonFormatter())로 달고 그 핸들러를 로거에 붙이는 일', 'json 모듈 설치', 'ensure_ascii=True'], a: 0,
      why: 'Formatter는 핸들러에 달려야 쓰인다. 핸들러가 없으면 INFO 로그는 아예 사라지고 예외만 기본 형식으로 찍힌다.' },
    { q: '.env에 APP_ENV=dev, 환경변수에 APP_ENV=prod가 있으면 settings.app_env는 무엇인가?',
      o: ['"dev"', '"prod"', '검증 오류'], a: 1,
      why: 'pydantic-settings에서는 환경변수가 .env와 코드 기본값보다 우선한다. 실제로 실행하면 prod가 나온다.' },
    { q: '모든 로그를 INFO로 찍으면 생기는 문제는 무엇인가?',
      o: ['레벨 필터가 무의미해져 진짜 에러가 묻힌다', '로그 파일이 회전하지 않는다', 'logger가 만들어지지 않는다'], a: 0,
      why: '실패는 ERROR로 남겨야 ERROR 이상만 걸러 볼 수 있다. exc_info=True로 스택도 함께 남긴다.' },
  ];

  const summary = [
    'print와 달리 logging은 레벨로 거른다. 개발은 DEBUG, 운영은 WARNING처럼 코드 수정 없이 바꾼다.',
    '로거가 1차로, 핸들러가 2차로 거른다. 구성은 진입점에서 dictConfig로 한 번만 한다.',
    'JSON 로그에 request_id를 필드로 넣으면 한 요청의 로그를 모아 볼 수 있다.',
    '설정은 환경변수로 받고 pydantic-settings로 검증한다. .env와 시크릿은 커밋하지 않는다.',
  ];
  const review = [
    { q: '운영에서 장애가 났는데 로그에 단서가 없다. 코드에는 print 디버깅을 지운 흔적만 있다. 다음부터 어떻게 하나?',
      o: ['print를 지우지 말고 그대로 둔다', 'logger.debug로 남기고 필요할 때 LOG_LEVEL로 켠다', '모든 로그를 ERROR로 찍는다'], a: 1,
      why: 'debug 레벨로 남겨 두면 평소엔 숨고 필요할 때 레벨만 낮춰 다시 본다. 지울 필요가 없다.' },
    { q: '같은 로그가 콘솔에 두세 번씩 찍힌다. 먼저 의심할 것은?',
      o: ['함수마다 basicConfig나 addHandler를 불러 핸들러가 겹쳤다', '레벨이 너무 낮다', 'ensure_ascii를 False로 두었다'], a: 0,
      why: '핸들러가 여러 개 붙으면 레코드가 핸들러 수만큼 찍힌다. 구성은 진입점에서 한 번만 한다.' },
    { q: '배포했더니 DB 비밀번호가 로그 수집기에 그대로 보였다. 고칠 방향은?',
      o: ['로그 레벨을 DEBUG로 낮춘다', '비밀번호를 코드 상수로 옮긴다', '시크릿은 설정에서만 읽고 로그에는 host 같은 안전한 값만 찍는다'], a: 2,
      why: '수집기는 여러 사람이 본다. 시크릿 값은 찍지 않고, 운영 시크릿은 Vault 같은 저장소에서 주입한다.' },
  ];

  R.page({ title: '로깅·설정 관리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
