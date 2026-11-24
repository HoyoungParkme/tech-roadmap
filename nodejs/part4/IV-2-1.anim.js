/* IV-2-1 REST API 설계. 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 상태 코드·Location·검증 응답·페이지 구간·에러 형식은 express 5.3.0 + node 24 로 직접 돌려 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const MC = { GET: GOOD, POST: INFO, PUT: WARN, PATCH: ACC, DELETE: BAD };
  const mcol = (m) => MC[m] || INK;
  const scol = (s) => (String(s)[0] === '2' ? GOOD : String(s)[0] === '4' ? WARN : String(s)[0] === '5' ? BAD : MUT);
  function badge(x, y, m, o) { o = o || {}; const w = tw(m, 13.5) + 16;
    card(x + w / 2, y, w, 24, { rx: 5, text: m, fs: 13.5, fw: 800, mono: true, stroke: mcol(m), color: mcol(m), fill: PANEL, sw: 1.8, s: o.s, op: o.op }); return w; }
  function stamp(cx, cy, s, sc) { card(cx, cy, 64, 32, { rx: 6, text: String(s), fs: 17, fw: 800, mono: true, stroke: scol(s), color: scol(s), sw: 2.4, s: sc }); }

  // ---------- 1. 동사 URL 과 자원 URL ----------
  const BADU = [['GET', '/getAllUsers', 0], ['POST', '/createUser', 1], ['POST', '/deleteUser?id=1', 1], ['GET', '/getUserById?id=1', 2], ['POST', '/updateUser', 3]];
  const GOODR = [['GET', '/users', 2, 0], ['GET', '/users/:id', 2, 1], ['POST', '/users', 3, 0], ['PUT', '/users/:id', 3, 1], ['PATCH', '/users/:id', 3, 1], ['DELETE', '/users/:id', 3, 1]];
  function s1(t, c) { const { k, u } = c;
    zone(30, 20, 400, 380, '동사를 URL 에 넣은 설계', { fill: BADBG, op: 0.6, color: BAD });
    BADU.forEach(([m, p, at], i) => { if (k < at) return; const s = k === at ? pop(u, 0.2 + i * 0.25) : 1, y = 80 + i * 60, x = 60 + (i % 2) * 40;
      const bw = badge(x, y, m, { s }); mono(x + bw + 10, y + 5, p, { 'font-size': 15.5, 'font-weight': 700, opacity: Math.min(1, s), fill: k >= 2 ? MUT : INK }); });
    if (k === 1) sub(230, 370, '삭제까지 POST: 메서드가 아무 뜻도 없다', fade(u, 1.6), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
    if (k < 2) { zone(470, 20, 460, 380, '자원(명사) + 메서드', { fill: GOODBG, op: 0.35, color: GOOD }); if (k === 0) sub(230, 370, '같은 대상인데 주소가 행위마다 늘어난다', fade(u, 1.4), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); return; }
    zone(470, 20, 460, 380, '자원(명사) + 메서드', { fill: GOODBG, op: 0.6, color: GOOD });
    // 자원 두 개: 목록 /users · 개별 /users/:id
    [['/users', 140], ['/users/:id', 300]].forEach(([p, y], i) => { card(610, y, 170, 50, { rx: 25, text: p, fs: 17, fw: 800, mono: true, stroke: ACC, color: ACC, fill: PANEL, s: k === 2 ? pop(u, 0.2 + i * 0.2) : 1 }); });
    const ms = GOODR.filter((r) => k >= r[2]);
    const slot = { 0: 0, 1: 0 };
    ms.forEach(([m, p, at, r]) => { const j = slot[r]++, n = r === 0 ? (k >= 3 ? 2 : 1) : (k >= 3 ? 4 : 1), cy = (r === 0 ? 140 : 300) + (j - (n - 1) / 2) * 34;
      const g = k === at ? E(u, 0.5 + j * 0.2, 1.1 + j * 0.2) : 1; grow(697, r === 0 ? 140 : 300, 770, cy, g, mcol(m), { plain: true });
      if (g > 0.9) badge(776, cy, m); });
    if (k === 2) { grow(400, 80, 520, 140, E(u, 1.2, 1.8), MUT, { dash: '4 5' }); grow(400, 260, 520, 300, E(u, 1.4, 2.0), MUT, { dash: '4 5' }); }
    if (k === 4) { banner(480, 385, 'URL = 무엇에 대해,  메서드 = 무엇을', pop(u, 0.4)); } }

  // ---------- 2. 상태 코드 ----------
  function netRow(i, m, path, act, st, label, o) { o = o || {}; const y = 96 + i * 50, a = o.a ?? 1;
    if (a <= 0) return;
    el('line', { x1: 40, y1: y + 25, x2: 920, y2: y + 25, stroke: GRID, 'stroke-width': 1, opacity: a });
    badge(50, y, m, { op: a }); mono(140, y + 5, path, { 'font-size': 15, 'font-weight': 700, opacity: a }); tx(330, y + 5, act, { 'font-size': 14, fill: MUT, opacity: a });
    if (st === '…') { mono(560, y + 5, '응답 전', { 'font-size': 14.5, fill: OFF, 'text-anchor': 'middle', opacity: a }); return; }
    stamp(560, y, st, o.s ?? 1); mono(610, y + 5, label, { 'font-size': 14.5, 'font-weight': 700, fill: scol(st), opacity: o.lop ?? a });
    if (o.extra) mono(740, y + 5, o.extra, { 'font-size': 13.5, fill: MUT, opacity: o.lop ?? a }); }
  function s2(t, c) { const { k, u } = c, reqs = (c.beat.crud && c.beat.crud.reqs) || [], prev = (c.prev && c.prev.crud && c.prev.crud.reqs) || [];
    tx(50, 50, 'Network', { 'font-size': 15, 'font-weight': 800 });
    ['메서드', '경로', '동작', '상태'].forEach((h, i) => tx([50, 140, 330, 545][i], 72, h, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }));
    reqs.forEach((r, i) => { const isNew = !prev[i] || prev[i].status !== r.status || prev[i].path !== r.path;
      const extra = r.status === '201' ? 'Location: /users/3' : r.status === '204' ? '본문 없음' : null;
      netRow(i, r.method, r.path, r.act, r.status, r.label, { a: isNew && k !== 0 ? fade(u, 0.2 + (i - prev.length) * 0.25) : isNew ? fade(u, 0.2) : 1, s: isNew ? pop(u, 0.8 + Math.max(0, i - prev.length) * 0.3) : 1, lop: isNew ? fade(u, 1.1 + Math.max(0, i - prev.length) * 0.3) : 1, extra }); });
    if (k === 1) sub(480, 380, '200 만 돌려주면 "새로 만들었는지" 알 수 없다', fade(u, 1.4), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 });
    if (k === 2) sub(480, 380, '201 + Location: 만들었고, 여기 있다 (id 3 은 예시)', fade(u, 1.6), { 'font-size': 14.5, fill: INK });
    if (k === 4) { const fam = [['2xx 성공', GOOD], ['4xx 요청 잘못', WARN], ['5xx 서버 잘못', BAD]];
      fam.forEach(([s, col], i) => pill(250 + i * 230, 390, s, col, pop(u, 1.8 + i * 0.2), { fs: 14 })); } }

  // ---------- 3. 검증 미들웨어 ----------
  const RULES = ['name 필수', 'age 는 숫자', 'age 0~120'];
  function s3(t, c) { const { k, u } = c, v = c.beat.validate || {}, checks = v.checks || [];
    const good = k === 4;
    // 왼쪽: 들어온 본문
    card(160, 90, 270, 54, { rx: 10, text: v.payload || '', fs: 15, fw: 700, mono: true, stroke: good ? GOOD : WARN, color: good ? GOOD : INK, s: k === 0 || k === 4 ? pop(u, 0.1) : 1 });
    tx(150, 52, good ? '정상 입력' : '들어온 req.body', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 });
    // 가운데: 검사 세 칸 (관문)
    zone(300, 40, 330, 210, 'validateUser', { fill: SOFT });
    RULES.forEach((r, i) => { const ck = checks[i], y = 96 + i * 52, shown = ck != null, now = shown && (!c.prev || !(c.prev.validate.checks || [])[i] || k === 4) ;
      card(465, y, 290, 40, { rx: 8, stroke: !shown ? GRID : ck.ok ? GOOD : BAD, sw: shown ? 2.2 : 1.2, fill: PANEL, dash: shown ? null : '4 4' });
      tx(340, y + 5, r, { 'font-size': 15, 'font-weight': 700, fill: shown ? INK : OFF });
      if (shown) { const s = now ? pop(u, 0.6 + (k === 4 ? i * 0.25 : 0)) : 1; (ck.ok ? check : cross)(590, y, 10, s); } });
    // 오른쪽: errors 배열
    const errs = [];
    checks.forEach((ck, i) => { if (!ck.ok) errs.push(i === 0 ? '{ field: "name", msg: "필수" }' : '{ field: "age", msg: "0~120" }'); });
    if (!good && k < 5) { tx(660, 70, 'errors', { 'font-size': 15, 'font-weight': 800, fill: BAD });
      errs.forEach((e, i) => { const isNew = i === errs.length - 1 && k !== 3 && (k === 0 || k === 2); mono(660, 104 + i * 30, e, { 'font-size': 13.5, fill: BAD, opacity: isNew ? fade(u, 1.0) : 1 }); });
      if (!errs.length) mono(660, 104, '[]', { 'font-size': 14, fill: MUT }); }
    if (k === 1) sub(465, 280, '-3 도 숫자라서 이 검사만은 통과', fade(u, 1.2), { 'font-size': 14.5, fill: INK });
    if (k === 2) sub(465, 280, '바로 끊지 않고 errors 에 모은다', fade(u, 1.4), { 'font-size': 14.5, fill: INK });
    if (k === 3 || k === 5) { const a = k === 3 ? fade(u, 0.3) : 1;
      el('rect', { x: 40, y: 290, width: 880, height: 74, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 2, opacity: a });
      mono(56, 316, 'HTTP 400 Bad Request', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: a });
      mono(56, 346, '{"errors":[{"field":"name","msg":"필수"},{"field":"age","msg":"0~120"}]}', { 'font-size': 14, opacity: k === 3 ? fade(u, 0.9) : 1 });
      if (k === 3) { dbIcon2(880, 245, false); sub(800, 252, '저장 안 함', fade(u, 1.5), { 'font-size': 14, fill: MUT }); } }
    if (k === 4) { grow(630, 145, 740, 145, E(u, 1.4, 2.0), GOOD); card(820, 145, 150, 48, { rx: 10, text: 'createUser', fs: 15, mono: true, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, 1.9) });
      mono(660, 290, 'next()', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      mono(660, 322, '→ HTTP 201  {"name":"Ann","age":30}', { 'font-size': 14.5, fill: INK, opacity: fade(u, 2.1) }); }
    if (k === 5) { mono(40, 400, 'app.post("/users", validateUser, createUser)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      dbIcon2(880, 245, true, pop(u, 0.6)); sub(780, 252, '검증을 지난 값만', fade(u, 1.0), { 'font-size': 14, fill: GOOD }); } }
  function dbIcon2(cx, cy, ok, s) { R.dbIcon(cx, cy - 10, null, { stroke: ok ? GOOD : OFF, s: (s ?? 1) * 0.7 }); }

  // ---------- 4. 페이지·필터·버전·멱등성 ----------
  function s4(t, c) { const { k, u } = c;
    // 맨 위: 요청 URL
    const ex = (c.beat.query && c.beat.query.example) || '';
    el('rect', { x: 30, y: 20, width: 900, height: 40, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    const m = ex.match(/^GET (\/api\/v\d)(\/users)(\?.*)?$/) || [];
    spans(46, 47, [['GET ', { fill: GOOD, 'font-weight': 800 }], [m[1] || '', { fill: ACC, 'font-weight': 800 }], [m[2] || '', {}], [m[3] || '', { fill: INFO }]], { 'font-size': 17 });
    if (k === 0) { // v1 · v2 두 갈래
      [['v1', '/api/v1/users', '지금 클라이언트들', ACC, 130], ['v2', '/api/v2/users', '깨는 변경은 여기로', OFF, 260]].forEach(([v, p, d, col, y], i) => {
        card(150, y, 110, 56, { rx: 12, text: v, fs: 22, fw: 800, mono: true, stroke: col, color: col, dash: i ? '6 5' : null, s: pop(u, 0.3 + i * 0.5) });
        mono(230, y + 6, p, { 'font-size': 16, 'font-weight': 700, fill: i ? MUT : INK, opacity: fade(u, 0.5 + i * 0.5) });
        tx(470, y + 6, d, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.7 + i * 0.5) }); });
      sub(480, 370, 'v1 은 그대로 두고 v2 를 새로 연다', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    // 목록 칸: 한 칸 = 행 하나. 60칸만 그린다(전체 길이는 정하지 않는다)
    const N = 60, cw = 13, x0 = 60, y0 = 110;
    const filtered = k >= 2, sliced = k >= 3, pg = sliced ? (k === 3 ? E(u, 0.3, 1.2) : 1) : 0;
    tx(x0, y0 - 12, filtered ? 'rows (role=admin 으로 거른 뒤, 거른 결과에 번호)' : 'rows', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    for (let i = 0; i < N; i++) { const x = x0 + i * (cw + 1.6), inPage = i >= 20 && i < 40;
      el('rect', { x, y: y0, width: cw, height: 34, rx: 2, fill: inPage && sliced ? ACC : filtered ? INFO : OFF, opacity: inPage && sliced ? 0.35 + 0.65 * pg : filtered ? 0.45 : 0.7 }); }
    mono(x0 + N * (cw + 1.6) + 6, y0 + 24, '…', { 'font-size': 18, fill: MUT });
    [1, 21, 40].forEach((n) => mono(x0 + (n - 1) * (cw + 1.6) + cw / 2, y0 + 56, String(n), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    if (k === 1) { mono(60, 230, 'page  = Number("2")            → 2', { 'font-size': 15, opacity: fade(u, 0.4) });
      mono(60, 262, 'limit = Math.min(Number("20"), 100) → 20', { 'font-size': 15, opacity: fade(u, 0.9) });
      mono(60, 304, '?limit=1000000  →  limit = 100', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) });
      sub(700, 304, '상한이 없으면 한 번에 다 만들려 한다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 2) { mono(60, 240, 'rows = users.filter(u => u.role === "admin")', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.4) });
      sub(480, 290, '조건이 늘어도 주소는 /users 하나', fade(u, 1.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { // 21~40번째를 잘라낸다
      const bx = x0 + 20 * (cw + 1.6) - 3, bw = 20 * (cw + 1.6) + 2; el('rect', { x: bx, y: y0 - 5, width: bw, height: 44, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.0) });
      mono(60, 240, 'start = (2 - 1) * 20 = 20', { 'font-size': 15, opacity: fade(u, 0.4) });
      mono(60, 272, 'rows.slice(20, 40)  → 21~40번째', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      sub(700, 272, 'sort=name 도 같은 자리에서 받는다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // k4: 응답 메타 + 멱등성
    mono(60, 216, '{ data: [20개], page: 2, limit: 20, total: rows.length }', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
    tx(60, 262, '같은 요청을 세 번 보내면', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.6) });
    const idem = [['GET', '그대로', 0], ['PUT', '같은 값으로 덮어씀', 0], ['DELETE', '이미 지워져 그대로', 0], ['POST', '새 행이 3개', 3]];
    idem.forEach(([m, d, n], i) => { const x = 60 + i * 225, y = 300;
      badge(x, y, m, { s: pop(u, 0.8 + i * 0.2) });
      for (let j = 0; j < 3; j++) { const on = clamp((u - 1.2 - j * 0.3) / 0.2); el('circle', { cx: x + 90 + j * 18, cy: y, r: 6, fill: mcol(m), opacity: on }); }
      if (n) for (let j = 0; j < 3; j++) el('rect', { x: x + j * 26, y: y + 26, width: 22, height: 16, rx: 3, fill: BAD, opacity: clamp((u - 1.4 - j * 0.3) / 0.2) });
      tx(x, y + (n ? 64 : 36), d, { 'font-size': 14, fill: n ? BAD : MUT, 'font-weight': 700, opacity: fade(u, 2.0) }); }); }

  // ---------- 5. 라우터 하나로 ----------
  function s5(t, c) { const { k, u } = c, rt = (c.beat.router && c.beat.router.routes) || [];
    tx(40, 44, 'users.router.js', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    rt.forEach((r, i) => { const y = 84 + i * 46, isNew = i === rt.length - 1 && k < 5 && k !== 4 || (k === 5 && r.m === 'PUT'), a = isNew ? fade(u, 0.2) : 1, dashed = r.m === 'PUT';
      el('rect', { x: 40, y: y - 18, width: 470, height: 36, rx: 8, fill: PANEL, stroke: dashed ? OFF : GRID, 'stroke-dasharray': dashed ? '5 4' : null, opacity: a });
      badge(52, y, r.m, { op: a }); mono(140, y + 5, r.p, { 'font-size': 15, 'font-weight': 700, opacity: a }); mono(260, y + 5, r.h, { 'font-size': 14, fill: MUT, opacity: a });
      const sts = r.m === 'DELETE' ? ['204'] : r.s.split(' / ');
      sts.forEach((s, j) => mono(420 + j * 46, y + 5, s, { 'font-size': 15, 'font-weight': 800, fill: scol(s), opacity: a })); });
    // 오른쪽: 공통 에러 핸들러
    const hx = 600, hy = 230;
    card(hx + 160, hy, 300, 70, { rx: 12, stroke: k >= 4 ? BAD : OFF, sw: 2.4, dash: k >= 4 ? null : '6 5', fill: k >= 4 ? BADBG : PANEL, s: k === 4 ? pop(u, 0.3) : 1 });
    tx(hx + 160, hy - 6, k >= 4 ? '공통 에러 핸들러' : '에러 핸들러 자리', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: k >= 4 ? BAD : MUT });
    mono(hx + 160, hy + 18, '(err, req, res, next)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: k >= 4 ? BAD : OFF });
    if (k === 0) sub(hx + 160, hy + 64, '아직은 핸들러마다 제각각 형식', fade(u, 0.8), { 'font-size': 14 });
    if (k >= 1) { const p = k === 1 ? E(u, 0.6, 1.6) : 1; grow(510, 130, hx + 40, hy - 30, p, BAD, { dash: '6 5' });
      if (k === 1) fly(400, 130, hx + 160, hy - 78, seg(u, 0.6, 1.8), '{ status: 404, code: "NOT_FOUND" }', { mono: true, fill: BAD, stay: true }); }
    if (k === 2) { grow(510, 176, hx + 40, hy - 20, E(u, 0.6, 1.4), WARN, { dash: '6 5' }); sub(hx + 160, 120, 'validateUser 가 먼저: 실패하면 400', fade(u, 1.2), { 'font-size': 14.5, fill: INK }); }
    if (k === 3) sub(hx + 160, 120, '204 는 본문이 없어 res.end()', fade(u, 1.0), { 'font-size': 14.5, fill: INK });
    if (k >= 4) { mono(hx + 10, hy + 80, 'res.status(err.status || 500)', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: k === 4 ? fade(u, 1.0) : 1 });
      if (k === 4) sub(hx + 160, hy + 120, 'status 가 없으면 500', fade(u, 1.6), { 'font-size': 14.5 }); }
    if (k === 5) { el('rect', { x: 40, y: 340, width: 880, height: 64, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 0.3) });
      mono(56, 364, 'GET /users/1 (없음)  →  HTTP 404', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3) });
      mono(56, 390, '{"error":{"code":"NOT_FOUND","message":"user 1 없음"}}', { 'font-size': 14.5, opacity: fade(u, 0.9) });
      sub(hx + 160, 120, '모든 실패가 같은 모양', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  const quiz = [
    { q: '사용자 한 명을 지우는 API로 가장 REST다운 것은 무엇인가?',
      o: ['POST /deleteUser?id=1', 'DELETE /users/1', 'GET /users/1/delete'], a: 1,
      why: '주소는 자원(/users/1)만 가리키고, 지우는 행위는 DELETE 메서드가 말한다.' },
    { q: 'POST /users로 새 사용자를 만들었을 때 알맞은 응답은 무엇인가?',
      o: ['200 OK와 빈 본문', '201 Created와 Location 헤더, 만든 자원', '204 No Content'], a: 1,
      why: '201은 "새로 만들었다"는 뜻이고 Location이 그 자원의 주소를 알려 준다. 200만으로는 생성인지 구분되지 않는다.' },
    { q: '{"name":"","age":-3}이 validateUser를 지나면 errors에는 몇 건이 담기나?',
      o: ['1건 (name만)', '3건 (모든 검사)', '2건 (name 필수, age 범위)'], a: 2,
      why: '-3은 숫자라 타입 검사는 통과하고, name 필수와 0~120 범위에서 두 건이 쌓인다. 그래서 400과 함께 두 메시지가 나간다.' },
    { q: '같은 요청을 실수로 세 번 보냈을 때 데이터가 세 번 생길 수 있는 메서드는 무엇인가?',
      o: ['POST', 'PUT', 'DELETE'], a: 0,
      why: 'POST는 멱등이 아니라 보낼 때마다 새 행을 만든다. PUT과 DELETE는 여러 번 보내도 결과가 같다.' },
    { q: 'getUser가 next({ status: 404, code: "NOT_FOUND", … })를 부르면 응답 상태 코드는 누가 정하나?',
      o: ['getUser가 res.status(404)로 직접', '맨 끝의 공통 에러 핸들러가 err.status로', 'Express가 항상 500으로'], a: 1,
      why: '핸들러는 무엇이 잘못됐는지만 넘기고, 공통 에러 핸들러가 err.status와 정해진 { error: { code, message } } 모양으로 응답한다.' },
  ];
  const summary = [
    'URL에는 /users, /users/1 같은 자원만 쓰고 행위는 GET, POST, PUT, DELETE가 맡는다.',
    '생성은 201과 Location, 본문 없는 삭제는 204, 없는 자원은 404로 답한다.',
    '저장 전에 필수, 타입, 범위를 검사하고 틀리면 필드별 메시지와 400을 돌려준다.',
    '목록은 page와 limit(상한 100)으로 잘라 주고, 에러는 한 핸들러에서 한 모양으로 낸다.',
  ];
  const review = [
    { q: '프런트엔드 개발자가 "저장이 됐는지 이미 있던 건지 모르겠다"고 한다. 응답이 늘 200이다. 먼저 바꿀 것은?',
      o: ['URL을 /createUser로 바꾼다', '생성 성공에 201과 Location을 쓴다', '모든 응답 본문을 비운다'], a: 1,
      why: '상태 코드는 클라이언트가 분기하는 계약이다. 생성은 201로 구분해 주고 Location으로 새 주소를 알린다.' },
    { q: '목록 API가 ?limit=1000000 요청 한 번에 멈춰 버렸다. 고칠 곳은?',
      o: ['limit에 Math.min(…, 100) 같은 상한을 건다', 'page 기본값을 0으로 바꾼다', '/api/v2를 새로 연다'], a: 0,
      why: '상한이 없으면 서버가 요청 받은 만큼 응답을 다 만들려 한다. limit을 100으로 묶으면 한 번에 주는 양이 정해진다.' },
    { q: '앱이 에러 응답에서 어떤 곳은 { msg }, 어떤 곳은 { error }를 받아 분기 코드가 늘었다. 서버에서 할 일은?',
      o: ['에러가 날 때마다 200으로 바꾼다', '검증 미들웨어를 지운다', '핸들러는 next(err)만 하고 공통 에러 핸들러가 { error: { code, message } }로 응답한다'], a: 2,
      why: '응답 모양을 정하는 곳을 한 군데로 모으면 클라이언트는 한 가지 형식만 처리하면 된다.' },
  ];

  R.page({ title: 'REST API 계약', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
