/* V-2-2 프로덕션 API 조립 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림 속 응답·로그 줄은 페이지 코드(app.js·middleware·routes·service)를 Express 4 로 돌려 받은 실제 값이다.
   DB 는 pg 대신 같은 모양을 돌려주는 메모리 가짜 풀로 바꿔 돌렸다. ms 는 실행마다 달라 그림에 적지 않았다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, terminal, spans, cross, check, clock, person, server, dbIcon, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function status(cx, cy, code, s, o) { o = o || {}; const col = code >= 500 ? BAD : code >= 400 ? WARN : GOOD, bg = code >= 500 ? BADBG : code >= 400 ? WARNBG : GOODBG, str = String(code) + (o.text ? ' ' + o.text : '');
    card(cx, cy, tw(str, 15) + 22, 30, { rx: 15, fill: bg, stroke: col, sw: 2, text: str, fs: 15, fw: 800, color: col, mono: true, s }); }
  function jline(x, y, s, col, op) { mono(x, y, s, { 'font-size': 14, 'font-weight': 700, fill: col || INK, opacity: op ?? 1 }); }

  // ---------- 1. 계층 구조 ----------
  const LAYERS = [['app.js', '조립 · 미들웨어·라우터·에러 핸들러 등록', 'app.js'], ['middleware', '로깅 · helmet · 검증 · 에러', 'middleware'], ['routes', 'URL을 서비스로 연결', 'routes'], ['service', '규칙 (async/await)', 'service'], ['repository', 'DB 풀로 쿼리만', 'repository']];
  const LYY = (i) => 70 + i * 72;
  function s1(t, c) { const { k, u } = c, names = c.beat.overview.layers.map((l) => l.name), env = c.beat.overview.env, penv = c.prev ? c.prev.overview.env.length : 0;
    // 왼쪽: .env → process.env
    el('rect', { x: 24, y: 40, width: 250, height: 170, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
    mono(38, 64, 'process.env', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
    if (k === 0) { card(150, 250, 200, 40, { rx: 8, text: '.env  →  dotenv', mono: true, fs: 14.5, s: pop(u, 0.2) }); grow(150, 228, 150, 214, E(u, 0.5, 0.8), ACC); sub(150, 300, '설정값이 코드 밖으로 나간다', fade(u, 1.2)); }
    if (!env.length) mono(38, 100, '(NODE_ENV 등은 아직)', { 'font-size': 13.5, fill: MUT });
    env.forEach((e, i) => { const op = i >= penv ? fade(u, 0.3 + (i - penv) * 0.3) : 1; mono(38, 98 + i * 30, e.k, { 'font-size': 14, fill: MUT, opacity: op }); mono(262, 98 + i * 30, e.v, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: op }); });
    // 가운데: 계층 쌓기
    LAYERS.forEach(([n, d], i) => { if (!names.includes(n)) return; const isNew = c.prev && !c.prev.overview.layers.some((l) => l.name === n), s = isNew ? pop(u, 0.3 + i * 0.1) : 1;
      card(480, LYY(i), 300, 56, { rx: 10, stroke: i === 0 ? ACC : INK, sw: 2.2, fill: i === 0 ? ACCBG : PANEL, s });
      mono(340, LYY(i) - 4, n, { 'font-size': 15.5, 'font-weight': 800, fill: i === 0 ? ACC : INK, opacity: s }); tx(340, LYY(i) + 17, d, { 'font-size': 13.5, fill: MUT, opacity: s });
      if (i > 1) grow(480, LYY(i - 1) + 28, 480, LYY(i) - 30, isNew ? E(u, 0.2, 0.6) : 1, MUT); });
    if (k >= 4) { dbIcon(800, LYY(4) - 10, 'PostgreSQL', { s: k === 4 ? pop(u, 0.6) * 0.75 : 0.75 }); grow(632, LYY(4), 760, LYY(4) - 10, k === 4 ? E(u, 0.8, 1.2) : 1, MUT); }
    // 오른쪽: beat 마다 한 가지
    if (k === 1) ['routes/tasks.js', 'middleware/logger.js', 'middleware/error.js'].forEach((f, i) => { pill(800, 70 + i * 44, 'require("./' + f.replace('.js', '') + '")', INFO, pop(u, 0.5 + i * 0.3), { mono: true, fs: 13.5 }); });
    if (k === 2) { ['requestLogger', 'helmet()', 'express.json()'].forEach((m, i) => { const x = 690 + i * 0, y = 60 + i * 48; card(800, y, 220, 36, { rx: 18, text: (i + 1) + '. ' + m, mono: true, fs: 14, stroke: ACC, color: ACC, s: pop(u, 0.3 + i * 0.4) }); });
      sub(800, 216, '등록 순서 = 실행 순서 · 로깅이 맨 앞', fade(u, 1.7), { fill: INK, 'font-weight': 700 }); }
    if (k === 3) { pill(800, 90, 'app.use("/tasks", tasksRouter)', ACC, pop(u, 0.2), { mono: true, fs: 13.5 }); sub(800, 130, '라우터는 서비스를 알고', fade(u, 0.9)); sub(800, 154, '서비스는 라우터를 모른다', fade(u, 1.3)); }
    if (k === 4) { pill(800, 76, 'app.use(errorHandler)  // 맨 끝', BAD, pop(u, 0.2), { mono: true, fs: 13.5 }); sub(800, 116, '의존은 위에서 아래로만 흐른다', fade(u, 1.4), { fill: INK, 'font-weight': 700 }); }
    if (k === 5) { el('rect', { x: 24, y: 236, width: 250, height: 110, rx: 10, fill: INK, opacity: fade(u, 0.2) });
      mono(38, 262, '$ node app.js', { 'font-size': 14, fill: PANEL, opacity: fade(u, 0.3) }); mono(38, 288, 'up on :3000', { 'font-size': 14, fill: GOOD, opacity: fade(u, 0.8), 'font-weight': 700 });
      tx(38, 322, '직접 실행할 때만 listen', { 'font-size': 13.5, fill: OFF, opacity: fade(u, 1.1) });
      pill(800, 76, 'module.exports = app', GOOD, pop(u, 1.3), { mono: true }); sub(800, 116, '테스트는 listen 없이 이 app을 쓴다', fade(u, 1.7)); } }

  // ---------- 2. 요청 파이프라인 ----------
  const PL = [['requestLogger', 100], ['helmet', 260], ['express.json', 410], ['validateTask', 570], ['라우터', 730]];
  const PY = 120;
  function pipe(act, o) { o = o || {}; el('line', { x1: 30, y1: PY, x2: 880, y2: PY, stroke: GRID, 'stroke-width': 3 });
    PL.forEach(([n, x], i) => { const on = i <= act, cut = o.cut != null && i > o.cut; card(x, PY, i === 4 ? 110 : 140, 50, { rx: 10, stroke: cut ? OFF : on ? ACC : INK, sw: on ? 2.6 : 1.8, fill: on && !cut ? ACCBG : cut ? SOFT : PANEL, text: n, mono: i < 4, fs: 14, color: cut ? OFF : on ? ACC : INK }); }); }
  function s2(t, c) { const { k, u } = c;
    const act = k <= 1 ? 0 : k === 2 ? (u < 1 ? 0 : u < 1.8 ? 1 : 2) : k <= 4 ? 3 : 4;
    pipe(act, { cut: k === 4 && u > 1.2 ? 3 : null });
    // 요청 토큰
    const tokX = k === 0 ? lerp(30, PL[0][1], E(u, 0.2, 1.0)) : k === 2 ? lerp(PL[0][1], PL[2][1], E(u, 0.4, 2.2)) : k === 5 ? lerp(PL[3][1], PL[4][1], E(u, 0.3, 1.3)) : PL[Math.min(act, 3)][1];
    el('circle', { cx: tokX, cy: PY - 44, r: 13, fill: k === 4 ? WARN : ACC }); mono(tokX, PY - 39, '1', { 'font-size': 14, fill: PANEL, 'font-weight': 800, 'text-anchor': 'middle' });
    if (k === 0) { mono(PL[0][1], PY + 50, 'req.id = ++seq  → 1', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); clock(PL[0][1] + 110, PY + 46, 13, E(u, 1.3, 2.6) * 0.4, ACC); sub(PL[0][1] + 60, PY + 84, 'start = Date.now()', fade(u, 1.4)); }
    // 아래: 로그 창 (finish 때 한 줄)
    const lines = [];
    if (k >= 1) lines.push(['{"id":1,"method":"POST","path":"/tasks","status":201,"ms":…}', null]);
    if (k >= 4) lines.push(['{"id":2,"method":"POST","path":"/tasks","status":400,"ms":…}', WARN]);
    el('rect', { x: 30, y: 262, width: 900, height: 96, rx: 10, fill: INK });
    mono(46, 284, 'stdout · res.on("finish") 때 한 줄', { 'font-size': 13.5, fill: OFF });
    lines.forEach(([s, col], i) => mono(46, 312 + i * 26, s, { 'font-size': 14, fill: col || PANEL, opacity: (k === 1 && i === 0) || (k === 4 && i === 1) ? fade(u, 1.4) : 1 }));
    if (k === 1) sub(480, 390, '응답이 끝나야 status가 정해진다 · 사람이 아니라 기계가 검색할 JSON', fade(u, 1.8));
    if (k === 2) sub(330, PY + 56, 'next()를 불러야 다음 칸으로 간다', fade(u, 1.0));
    if (k === 3 || k === 4) { const bad = k === 4; card(PL[3][1], PY + 64, 210, 34, { rx: 8, text: 'req.body = { title: ' + (bad ? '"" }' : '"우유 사기" }'), mono: true, fs: 13.5, stroke: bad ? WARN : GRID, s: pop(u, 0.2) });
      mono(PL[3][1], PY + 104, 'typeof title === "string" && title.trim()', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6) });
      if (bad) { grow(PL[3][1] - 20, PY - 28, 300, 60, E(u, 1.0, 1.5), WARN); status(250, 52, 400, pop(u, 1.4), { text: '{"error":"title is required"}' }); sub(PL[4][1] + 80, PY + 50, 'return이라 뒤는 실행 안 됨', fade(u, 1.8), { fill: WARN, 'font-weight': 700 }); } }
    if (k === 5) { sub(480, 400, '로깅이 맨 앞이라 깨진 JSON으로 400이 난 요청도 로그에 남는다 (실행 확인)', fade(u, 1.8), { fill: INK, 'font-weight': 700 });
      pill(PL[4][1], PY + 60, '여기부터 입력은 믿어도 된다', GOOD, pop(u, 1.3)); } }

  // ---------- 3. 서비스 · 저장소 · 커넥션 풀 ----------
  const RT = [110, 76], SV = [350, 76], RP = [600, 76], DB = [850, 250];
  function s3(t, c) { const { k, u } = c;
    // 풀: max 10
    const slots = 10, busy = k === 2 ? (u > 0.8 ? 1 : 0) : 0;
    el('rect', { x: 120, y: 210, width: 600, height: 110, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.6 });
    mono(136, 234, 'new Pool({ connectionString: DATABASE_URL, max: 10 })', { 'font-size': 14, 'font-weight': 700, fill: k === 0 ? ACC : MUT });
    for (let i = 0; i < slots; i++) { const s = k === 0 ? pop(u, 0.4 + i * 0.12) : 1, on = busy && i === 0;
      card(160 + i * 56, 282, 44, 44, { rx: 8, stroke: on ? ACC : GOOD, sw: 2, fill: on ? ACCBG : GOODBG, s, text: on ? '대여' : '', fs: 13.5, color: ACC }); }
    dbIcon(DB[0], DB[1], 'PostgreSQL', { s: 0.8 });
    if (k === 0) sub(420, 360, '커넥션 10개를 만들어 두고 앱 전체가 돌려 쓴다', fade(u, 1.8), { fill: INK, 'font-weight': 700 });
    // 위: 라우터 → 서비스 → 저장소
    if (k >= 1) card(RP[0], RP[1], 200, 50, { rx: 10, text: 'insertTask()', mono: true, fs: 15, stroke: INFO, color: INFO, s: k === 1 ? pop(u, 0.2) : 1 });
    if (k >= 4) { card(SV[0], SV[1], 200, 50, { rx: 10, text: 'createTask()', mono: true, fs: 15, stroke: ACC, color: ACC, s: k === 4 ? pop(u, 0.2) : 1 }); grow(SV[0] + 100, SV[1], RP[0] - 104, RP[1], k === 4 ? E(u, 0.6, 1.0) : 1, MUT); }
    if (k === 5) { card(RT[0], RT[1], 150, 50, { rx: 10, text: '라우터', fs: 15, s: pop(u, 0.2) }); grow(RT[0] + 75, RT[1], SV[0] - 104, SV[1], E(u, 0.4, 0.8), MUT);
      el('line', { x1: RT[0], y1: RT[1] + 26, x2: DB[0] - 50, y2: DB[1] - 40, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 6', opacity: fade(u, 1.0) }); cross(470, 160, 10, pop(u, 1.3));
      sub(470, 196, '라우터는 DB도 풀도 모른다', fade(u, 1.5), { fill: INK, 'font-weight': 700 }); }
    if (k === 1) sub(RP[0], 130, '저장소에는 규칙이 없다 · 쿼리만', fade(u, 0.8));
    if (k === 2) { mono(40, 150, '"INSERT INTO tasks(title) VALUES($1) RETURNING *"', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(40, 178, 'params = ["우유 사기"]', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
      spans(500, 178, [['"VALUES(\'" + title + "\')"', { fill: MUT, 'text-decoration': 'line-through' }]], { 'font-size': 14, opacity: fade(u, 1.4) }); cross(830, 172, 8, pop(u, 1.6));
      dot([[160, 260], [160, 250], [DB[0] - 46, DB[1] - 10]], seg(u, 1.0, 2.0), ACC, 7); }
    if (k === 3) { card(640, 150, 330, 40, { rx: 8, text: 'rows[0] = { id: 1, title: "우유 사기", done: false }', mono: true, fs: 13.5, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.3) });
      fly(160, 282, RP[0], RP[1] + 26, seg(u, 0.9, 1.7), 'rows[0]', { fill: GOOD, mono: true }); sub(420, 360, '쿼리가 끝나면 커넥션은 풀로 돌아간다 (pool.query가 알아서)', fade(u, 1.8)); }
    if (k === 4) { mono(SV[0], 140, '"  우유 사기  ".trim()', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6) }); mono(SV[0], 166, '→ "우유 사기"', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.1) });
      sub(SV[0] + 300, 166, '규칙이 들어갈 자리 · SQL은 한 줄도 없다', fade(u, 1.6)); } }

  // ---------- 4. 에러 미들웨어와 응답 규격 ----------
  const RESP = [[201, '{"id":1,"title":"우유 사기","done":false}', '생성 성공'], [400, '{"error":"title is required"}', '검증 실패'], [500, '{"error":"internal error"}', '서버 오류']];
  function s4(t, c) { const { k, u } = c;
    // 라우트 사슬
    const R0 = 70;
    card(110, R0, 170, 44, { rx: 9, text: 'router.post("/")', mono: true, fs: 14, stroke: ACC, color: ACC });
    card(320, R0, 170, 44, { rx: 9, text: 'validateTask', mono: true, fs: 14, s: k === 0 ? pop(u, 0.5) : 1 });
    card(560, R0, 240, 44, { rx: 9, text: k >= 1 ? 'try { await createTask }' : 'service', mono: true, fs: 14, s: k === 0 ? pop(u, 0.8) : 1 });
    grow(195, R0, 233, R0, 1, MUT); grow(405, R0, 438, R0, 1, MUT);
    if (k === 0) sub(320, 130, '라우터가 아는 것은 검증과 서비스뿐', fade(u, 1.4));
    if (k === 1) { dot([[30, R0], [195, R0], [405, R0], [440, R0]], seg(u, 0.4, 1.6), ACC, 8); sub(560, 124, '핸들러 인자에 next를 받아 둔다', fade(u, 1.6)); }
    if (k === 2) { grow(682, R0, 760, R0, E(u, 0.2, 0.6), GOOD); status(830, R0, 201, pop(u, 0.6)); mono(480, 140, 'res.status(201).json(task)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      mono(480, 172, '{"id":1,"title":"우유 사기","done":false}', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      sub(480, 204, '200이 아니라 201 · 상태코드도 계약이다', fade(u, 1.8)); }
    // 에러 핸들러
    const EH = [480, 260];
    if (k >= 3) { card(EH[0], EH[1], 300, 60, { rx: 12, stroke: BAD, sw: 2.4, fill: BADBG, s: k === 3 ? pop(u, 1.0) : 1 });
      mono(EH[0], EH[1] - 4, 'errorHandler(err, req, res, next)', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD }); sub(EH[0], EH[1] + 18, '인자 4개 · 맨 마지막 등록'); }
    if (k === 3) { card(560, 140, 200, 34, { rx: 8, text: 'DB 연결 실패 (예)', fs: 14, stroke: BAD, color: BAD, s: pop(u, 0.2) });
      grow(560, 158, EH[0] + 40, EH[1] - 32, E(u, 0.6, 1.2), BAD, { dash: '6 4' }); mono(620, 210, 'catch → next(err)', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.8) });
      sub(EH[0], 340, '라우터는 직접 응답하지 않고 넘기기만 한다', fade(u, 1.6)); }
    if (k === 4) { const a = fade(u, 0.3); el('rect', { x: 30, y: 330, width: 420, height: 64, rx: 10, fill: INK, opacity: a });
      mono(44, 352, '서버 로그 (console.error)', { 'font-size': 13.5, fill: OFF, opacity: a }); mono(44, 378, 'Error: … at insertTask (stack)', { 'font-size': 14, fill: BAD, opacity: fade(u, 0.7) });
      grow(EH[0] - 60, EH[1] + 30, 300, 328, E(u, 0.3, 0.7), INK);
      grow(EH[0] + 150, EH[1], 700, EH[1], E(u, 1.0, 1.4), BAD); status(790, EH[1], 500, pop(u, 1.3)); mono(700, 320, '{"error":"internal error"}', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(700, 350, '스택은 로그에만 · 응답엔 일반 문구', fade(u, 1.9)); }
    if (k === 5) { el('rect', { x: 130, y: 150, width: 700, height: 64, rx: 0, fill: 'none' });
      RESP.forEach(([code, body, when], i) => { const y = 340 + 0 * i, x = 90 + i * 300, s = pop(u, 0.3 + i * 0.3);
        card(x + 120, 360, 280, 76, { rx: 10, stroke: code >= 500 ? BAD : code >= 400 ? WARN : GOOD, sw: 2, s });
        status(x + 30, 340, code, s); tx(x + 74, 345, when, { 'font-size': 14, 'font-weight': 700, opacity: s });
        (body.length > 30 ? [body.slice(0, body.lastIndexOf(',') + 1), body.slice(body.lastIndexOf(',') + 1)] : [body]).forEach((b, j, arr) => mono(x + 120, 382 + (j - (arr.length - 1) / 2) * 18, b, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: s })); });
      sub(480, 150, '실패는 어디서 나든 { error } 한 가지 모양', fade(u, 1.4), { fill: INK, 'font-weight': 700 }); } }

  // ---------- 5. 통합 테스트와 체크리스트 ----------
  const MINI = ['logger', 'helmet', 'json', 'validate', 'router', 'service'];
  function s5(t, c) { const { k, u } = c, cl = c.beat.checklist, pcl = c.prev ? c.prev.checklist.length : 0;
    card(100, 90, 160, 60, { rx: 10, text: 'tasks.test.js', mono: true, fs: 14.5, stroke: ACC, color: ACC });
    el('rect', { x: 210, y: 50, width: 470, height: 84, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.2 });
    mono(224, 72, 'require("../app")  · listen 하지 않음', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const stop = k === 3 || k === 4 ? 3 : 5;
    MINI.forEach((m, i) => { const x = 252 + i * 76, hit = (k === 1 || k === 3) && seg(u, 0.4, 1.8) * 6 > i && i <= stop;
      card(x, 106, 68, 32, { rx: 6, text: m, fs: 13.5, mono: true, stroke: hit ? ACC : i > stop && (k === 3 || k === 4) ? OFF : GRID, fill: hit ? ACCBG : PANEL, color: i > stop && (k === 3 || k === 4) ? OFF : INK }); });
    if (k === 0) sub(445, 160, '직접 실행한 게 아니라서 app.listen은 건너뛴다', fade(u, 0.8));
    if (k === 1 || k === 3) pill(260, 186, k === 1 ? '.post("/tasks").send({ title: "우유 사기" })' : '.post("/tasks").send({ title: "" })', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
    const asserts = [];
    if (k >= 2) asserts.push(['res.status toBe(201)', k === 2 ? 0.4 : 0], ['res.body.title toBe("우유 사기")', k === 2 ? 0.9 : 0]);
    if (k >= 4) asserts.push(['res.status toBe(400)', k === 4 ? 0.4 : 0], ['res.body.error toBeDefined()', k === 4 ? 0.9 : 0]);
    asserts.forEach(([s, d], i) => { const y = 230 + i * 34, op = d ? fade(u, d) : 1; check(46, y - 5, 8, op); mono(66, y, s, { 'font-size': 14.5, opacity: op }); });
    if (k === 2) status(560, 190, 201, pop(u, 0.2));
    if (k === 4) status(560, 190, 400, pop(u, 0.2));
    if (k === 5) { el('rect', { x: 30, y: 366, width: 420, height: 40, rx: 8, fill: INK, opacity: fade(u, 0.2) }); mono(46, 392, 'Tests:  2 passed, 2 total', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.4) }); }
    // 오른쪽: 배포 전 체크리스트
    el('rect', { x: 500, y: 214, width: 440, height: 196, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(516, 238, '배포 전 체크리스트', { 'font-size': 14, 'font-weight': 800, fill: MUT });
    cl.forEach((it, i) => { const op = i >= pcl ? fade(u, 0.5 + (i - pcl) * 0.25) : 1, y = 268 + i * 30; check(528, y - 5, 7, op); tx(546, y, it.item, { 'font-size': 14, opacity: op }); }); }

  const quiz = [
    { q: 'app.js에서 errorHandler를 app.use("/tasks", tasksRouter)보다 먼저 등록하면 어떻게 되는가?',
      o: ['라우터에서 next(err)로 넘긴 에러가 errorHandler에 닿지 않는다', '모든 요청이 errorHandler를 먼저 지나 500이 된다', '등록 순서와 상관없이 똑같이 동작한다'], a: 0,
      why: '미들웨어는 등록 순서대로 실행된다. 에러 핸들러는 앞 계층 뒤에 있어야 그곳에서 던진 실패를 받는다.' },
    { q: 'validateTask가 빈 title을 받고 return res.status(400)…으로 끝내면 무엇이 일어나는가?',
      o: ['next()가 불려 라우터도 실행된다', '뒤 계층은 실행되지 않고 400 {"error":"title is required"}가 나간다', 'errorHandler가 500으로 바꾼다'], a: 1,
      why: '응답을 보내고 return하면 next()가 불리지 않는다. 그래서 라우터·서비스·DB는 아예 실행되지 않는다.' },
    { q: '저장소가 title 값을 넘기는 올바른 방법은 무엇인가?',
      o: ['SQL 문자열에 title을 더해 이어붙인다', 'title을 trim한 뒤 문자열에 끼워 넣는다', 'VALUES($1) 자리에 두고 [title] 배열로 따로 넘긴다'], a: 2,
      why: '파라미터 바인딩은 값을 SQL 문법과 분리해 넘긴다. 입력이 무엇이든 쿼리 구조가 바뀌지 않아 인젝션이 막힌다.' },
    { q: 'DB가 끊겨 createTask가 거부되면 클라이언트는 무엇을 받는가?',
      o: ['500과 {"error":"internal error"}', '500과 스택이 담긴 본문', '200과 빈 객체'], a: 0,
      why: 'catch에서 next(err)로 넘기면 errorHandler가 status 500을 정하고 스택은 로그에만 남긴다. 본문은 일반 문구다.' },
    { q: 'tasks.test.js가 require("../app")으로 앱을 쓸 수 있으려면 app.js에 무엇이 있어야 하는가?',
      o: ['app.listen(3000)이 맨 위에 있어야 한다', 'module.exports = app으로 내보내야 한다', '테스트 안에서 dotenv를 다시 불러야 한다'], a: 1,
      why: 'supertest는 내보낸 app 객체를 받아 임시 포트로 요청한다. listen은 직접 실행할 때만 하도록 막아 둔다.' },
  ];

  const summary = [
    '설정은 process.env에서 읽고, 로깅·보안·검증·라우터·에러 처리를 등록 순서대로 쌓는다.',
    '검증 미들웨어가 잘못된 입력을 400으로 돌려보내면 서비스와 DB는 실행되지 않는다.',
    '저장소는 커넥션 풀과 파라미터 바인딩으로 쿼리만 하고 규칙은 서비스가 맡는다.',
    '실패는 next(err)로 에러 핸들러에 모으고, supertest로 201과 400 계약을 확인한다.',
  ];
  const review = [
    { q: '깨진 JSON을 보낸 요청이 400을 받았는데 요청 로그에 남지 않았다. 먼저 볼 곳은?',
      o: ['app.js에서 requestLogger가 express.json()보다 뒤에 등록됐는지', 'errorHandler의 인자가 4개인지', '풀의 max 값이 10인지'], a: 0,
      why: 'json 파싱이 실패하면 그 뒤 미들웨어는 실행되지 않는다. 로깅을 맨 앞에 두면 이런 요청도 남는다.' },
    { q: '요청 로그의 path가 전부 "/"로 찍혀 어느 API인지 모르겠다. 고칠 것은?',
      o: ['라우터를 app.use 없이 app.post로만 쓴다', 'helmet을 빼서 경로를 숨기지 않게 한다', '로그에 req.path 대신 req.originalUrl을 남긴다'], a: 2,
      why: '"/tasks"에 붙인 라우터 안에서는 req.path가 마운트 경로를 뺀 "/"가 된다. originalUrl은 원래 경로를 그대로 가진다.' },
    { q: 'supertest 테스트를 돌리자 "port 3000 already in use"가 나며 실패한다. 먼저 의심할 것은?',
      o: ['테스트에서 status 대신 body를 먼저 확인했다', 'app.js가 불러오기만 해도 listen을 실행한다', 'validateTask가 빈 title을 막지 못한다'], a: 1,
      why: 'require할 때마다 listen하면 개발 서버와 포트가 겹친다. app은 내보내기만 하고 listen은 직접 실행할 때만 한다.' },
  ];

  R.page({ title: '요청 하나가 계층을 지나는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
