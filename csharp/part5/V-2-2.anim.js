/* V-2-2 종합: REST API 미니 서비스 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   응답 줄(상태코드, Location, JSON, problem+json)은 페이지 코드를 .NET 10 SDK 로 그대로 띄워 curl 로 받은 실제 출력이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, dot, fly,
    server, cross, check, lock, zone, spans, tokens } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const MCOL = { GET: INFO, POST: GOOD, PUT: WARN, DELETE: BAD };
  function req(x, y, method, path, o) { o = o || {}; const fs = o.fs || 15, mw = tw(method, fs) + 16, pw = tw(path, fs) + 18, g = R.G(x, y, o.s ?? 1, o.op ?? 1);
    el('rect', { x: 0, y: -15, width: mw + pw, height: 30, rx: 7, fill: PANEL, stroke: INK, 'stroke-width': 1.8 }, g);
    el('rect', { x: 0, y: -15, width: mw, height: 30, rx: 7, fill: MCOL[method] || INK }, g);
    tx(mw / 2, fs * 0.36, method, { 'text-anchor': 'middle', 'font-size': fs - 1, 'font-weight': 800, fill: PANEL, class: 'mono' }, g);
    tx(mw + 9, fs * 0.36, path, { 'font-size': fs, 'font-weight': 600, class: 'mono' }, g); return mw + pw; }
  function status(cx, cy, code, text, s) { const col = code >= 500 ? BAD : code >= 400 ? WARN : GOOD, bg = code >= 500 ? BADBG : code >= 400 ? WARNBG : GOODBG, str = code + ' ' + text;
    card(cx, cy, tw(str, 15) + 28, 34, { rx: 17, fill: bg, stroke: col, sw: 2.2, text: str, fs: 15, fw: 800, color: col, mono: true, s }); }
  function jbox(x, y, lines, o) { o = o || {}; const fs = o.fs || 14, lh = fs + 8, w = o.w || Math.max(...lines.map((l) => tw(l, fs))) + 28, h = lines.length * lh + 14, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.6, opacity: op });
    if (o.title) tx(x + 2, y - 8, o.title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op });
    lines.forEach((l, i) => { const [s, col] = Array.isArray(l) ? l : [l, null]; mono(x + 14, y + 7 + lh * i + lh / 2 + fs * 0.36, s, { 'font-size': fs, fill: col || o.color || INK, opacity: op }); }); return { w, h }; }
  function obj(x, y, w, title, fields, o) { o = o || {}; const rh = 30, h = 34 + fields.length * rh + 6, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    el('rect', { x: x + 1, y: y + 1, width: w - 2, height: 29, rx: 9, fill: o.head || ACCBG, opacity: op });
    mono(x + 12, y + 20, title, { 'font-size': 14.5, 'font-weight': 800, fill: o.hc || ACC, opacity: op });
    fields.forEach(([n, v, f, col], i) => { const yy = y + 34 + i * rh, ff = f ?? 1;
      mono(x + 12, yy + 19, n, { 'font-size': 14, fill: col || MUT, opacity: op });
      if (ff > 0.02 && v != null) { el('rect', { x: x + w * 0.45, y: yy + 3, width: (w * 0.55 - 8) * ff, height: rh - 6, rx: 5, fill: o.vbg || SOFT, opacity: op });
        mono(x + w - 14, yy + 19, v, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: o.vc || INK, opacity: op * ff }); } });
    return h; }
  // 요청이 지나는 네 정거장 + (선택) 검증 문
  const SX = { cli: 70, ep: 250, gd: 365, sv: 480, rp: 700 }, SY = 72;
  function stations(o) { o = o || {}; const on = o.on || [];
    el('line', { x1: SX.cli + 50, y1: SY, x2: SX.rp - 70, y2: SY, stroke: GRID, 'stroke-width': 4 });
    [['cli', '클라이언트', 100], ['ep', '엔드포인트', 120], ['sv', 'TodoService', 140], ['rp', 'ITodoRepository', 160]].forEach(([k, n, w]) => {
      const hot = on.includes(k); card(SX[k], SY, w, 42, { rx: 9, text: n, mono: k !== 'cli' && k !== 'ep', fs: 14, fw: 700, stroke: hot ? ACC : GRID, color: hot ? ACC : MUT, fill: hot ? ACCBG : PANEL }); });
    if (o.guard != null) { const col = o.guard === 'bad' ? BAD : o.guard === 'ok' ? GOOD : INK; el('rect', { x: SX.gd - 6, y: SY - 30, width: 12, height: 60, rx: 6, fill: col, opacity: 0.85 });
      tx(SX.gd, SY + 48, '검증', { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle' }); } }
  // 저장소 안의 데이터 (Singleton 인메모리)
  function store(rows, o) { o = o || {}; const x = 790, y = 116, w = 150, rh = 30;
    el('rect', { x, y, width: w, height: 36 + Math.max(1, rows.length) * rh, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 10, y + 22, '저장된 Todo', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (!rows.length) mono(x + 12, y + 56, '(0건)', { 'font-size': 14, fill: OFF });
    rows.forEach(([id, title, done, op, col], i) => { const yy = y + 36 + i * rh + 20, a = op ?? 1;
      mono(x + 12, yy, id, { 'font-size': 14.5, 'font-weight': 800, opacity: a, fill: col || INK }); tx(x + 34, yy, title, { 'font-size': 14.5, opacity: a, fill: col || INK });
      mono(x + w - 10, yy, done, { 'font-size': 13.5, 'text-anchor': 'end', opacity: a, fill: done === 'true' ? GOOD : MUT }); }); }
  const PATH = (a, b) => [[SX[a] + 60, SY], [SX[b] - 60, SY]];
  function trip(u, stops, a, b, col) { // 왼쪽→오른쪽으로 갔다가 되돌아오기
    const fw = stops.map((k) => [SX[k], SY]), bw = fw.slice().reverse();
    dot(fw, seg(u, a, (a + b) / 2), col || INFO, 8); dot(bw, seg(u, (a + b) / 2, b), GOOD, 8); }

  // ---------- 1. 뼈대와 record 계약 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { ['var builder = WebApplication.CreateBuilder(args);', '// (Step 2 에서 여기 서비스 등록)', 'var app = builder.Build();'].forEach((s, i) =>
        mono(40, 70 + i * 30, typed(s, E(u, 0.1 + i * 0.4, 0.6 + i * 0.4)), { 'font-size': 15, fill: s.startsWith('//') ? MUT : INK }));
      card(720, 85, 160, 50, { rx: 10, text: 'app', mono: true, fs: 18, fw: 800, stroke: ACC, color: ACC, s: pop(u, 1.5) });
      sub(480, 230, '컨트롤러 클래스 없이 Program.cs 한 파일에서 시작한다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 1) { obj(60, 60, 300, 'record Todo', [['int Id', '서버가 정함', fade(u, 0.5)], ['string Title', '', 0], ['bool Done', '서버가 정함', fade(u, 0.8)]], { vbg: ACCBG, vc: ACC });
      lock(340, 60, true, ACC, pop(u, 1.0)); tx(372, 66, '불변', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.1) });
      mono(460, 110, 'new Todo(1, "우유", false)', { 'font-size': 14.5, opacity: fade(u, 1.3) }); mono(460, 140, '  == new Todo(1, "우유", false)', { 'font-size': 14.5, opacity: fade(u, 1.5) });
      mono(460, 174, '→ True', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
      sub(640, 220, '값이 같으면 같은 객체로 본다 (자동 동등성)', fade(u, 2.1)); return; }
    if (k === 2) { jbox(40, 80, ['{', '  "title": "우유 사기",', '  "id": 99', '}'], { title: '클라이언트가 보낸 본문' });
      grow(280, 120, 420, 120, E(u, 0.4, 1.0), GOOD);
      obj(430, 92, 280, 'CreateTodoDto', [['string Title', '"우유 사기"', E(u, 0.9, 1.4)]], { vbg: GOODBG });
      fly(230, 136, 300, 260, seg(u, 1.0, 1.8), '"id": 99', { fill: OFF, color: INK, mono: true, stay: true });
      tx(300, 300, '받을 자리가 없어 버려진다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(570, 220, 'Id 와 Done 은 클라이언트가 정할 수 없다', fade(u, 2.1), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); return; }
    if (k === 3) { req(40, 70, 'PUT', '/todos/{id}', { fs: 16 });
      obj(430, 70, 300, 'UpdateTodoDto', [['string Title', '본문', fade(u, 0.6)], ['bool Done', '본문', fade(u, 0.9)]], { vbg: WARNBG });
      el('path', { d: 'M165,90 C190,190 260,210 300,210', fill: 'none', stroke: INFO, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ah)', opacity: fade(u, 1.2) });
      mono(310, 216, 'int id ← 경로', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) });
      sub(480, 300, '요청마다 필요한 필드가 다르면 DTO 도 나눈다', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k4: 최상위 문장 뒤에 형식 선언 (실제 빌드)
    [['record Todo(…);', 'app.Run();', BAD, 'error CS8803'], ['app.Run();', 'record Todo(…);', GOOD, '빌드 성공']].forEach(([a, b, col, res], i) => {
      const x = 60 + i * 450, s = pop(u, 0.3 + i * 0.7);
      el('rect', { x, y: 60, width: 340, height: 110, rx: 10, fill: SOFT, stroke: col, 'stroke-width': 2, opacity: s });
      mono(x + 18, 100, a, { 'font-size': 16, 'font-weight': 700, opacity: s }); mono(x + 18, 140, b, { 'font-size': 16, 'font-weight': 700, opacity: s });
      (i ? check : cross)(x + 30, 210, 12, pop(u, 0.8 + i * 0.7)); mono(x + 54, 216, res, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.9 + i * 0.7) }); });
    tx(60, 270, '최상위 문은 네임스페이스 및 형식 선언 앞에 와야 합니다.', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.2) });
    card(480, 360, 420, 44, { rx: 22, text: 'app.Run() — 서버를 켜고 기다린다', fs: 15, fw: 700, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 2.1) }); }

  // ---------- 2. DI 배선 ----------
  function life(y, label, bars, col, f) { tx(40, y + 5, label, { 'font-size': 14.5, 'font-weight': 700, fill: col });
    bars.forEach(([a, b, s], i) => { const g = f(i); el('rect', { x: a, y: y - 12, width: (b - a) * g, height: 24, rx: 8, fill: col, opacity: 0.8 });
      if (g > 0.7 && s) mono(a + 10, y + 5, s, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL }); }); }
  function s2(t, c) { const { k, u } = c, L = { ep: 160, sv: 460, rp: 770 }, Y = 90;
    const svOn = k >= 1, rpS = k === 0 ? pop(u, 0.3) : 1;
    card(L.rp, Y, 230, 52, { rx: 10, text: k === 5 && u > 1.2 ? 'EfCoreTodoRepository' : 'InMemoryTodoRepository', mono: true, fs: 14.5, fw: 700, stroke: ACC, color: ACC, s: rpS, dash: k === 5 && u > 1.2 ? '6 4' : null });
    if (svOn) card(L.sv, Y, 190, 52, { rx: 10, text: 'TodoService', mono: true, fs: 15, fw: 700, stroke: INFO, color: INFO, s: k === 1 ? pop(u, 0.3) : 1 });
    if (k >= 4) card(L.ep, Y, 170, 52, { rx: 10, text: '엔드포인트', fs: 15, fw: 700, stroke: INK, s: k === 4 ? pop(u, 0.2) : 1 });
    // 수명 띠 (요청 3개)
    if (k <= 1) { tx(260, 196, '요청 1', { 'font-size': 13.5, fill: MUT }); tx(480, 196, '요청 2', { 'font-size': 13.5, fill: MUT }); tx(700, 196, '요청 3', { 'font-size': 13.5, fill: MUT }); life(240, '저장소', [[240, 920, 'Singleton · 앱 전체 1개']], ACC, () => (k === 0 ? E(u, 0.8, 1.8) : 1));
      if (k >= 1) life(290, '서비스', [[240, 420, 'Scoped'], [460, 640, 'Scoped'], [680, 860, 'Scoped']], INFO, (i) => (k === 1 ? E(u, 0.8 + i * 0.3, 1.2 + i * 0.3) : 1));
      sub(480, 360, k === 0 ? '데이터를 들고 있으니 앱 전체가 하나를 나눠 써야 한다' : '상태 없는 로직은 요청 단위로 충분하다', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 2) { grow(L.rp - 118, Y, L.sv + 98, Y, E(u, 0.3, 1.0), ACC); mono(L.sv, 160, 'TodoService(ITodoRepository repo)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9) });
      sub(L.sv, 186, '무엇이 들어올지는 컨테이너가 정한다', fade(u, 1.5)); return; }
    if (k === 3) { ['ListAsync()', 'GetAsync(id)', 'AddAsync(dto)'].forEach((s, i) => pill(L.sv, 170 + i * 40, s, INFO, pop(u, 0.2 + i * 0.25), { mono: true, fs: 14 }));
      fly(L.sv + 80, 250, L.rp - 60, 250, seg(u, 1.0, 1.8), 'new Todo(0, "우유 사기", false)', { mono: true, stay: true, fill: INFO });
      if (u > 1.9) { mono(L.rp - 40, 300, 'Id 0 → 1', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); sub(L.rp - 40, 326, '저장소가 채운다', fade(u, 2.1)); }
      return; }
    if (k === 4) { const g = E(u, 0.4, 1.2); el('line', { x1: 615, y1: 40, x2: 615, y2: lerp(40, 360, g), stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' });
      tx(625, 180, 'interface ITodoRepository', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, class: 'mono', opacity: fade(u, 1.0) });
      ['Task<List<Todo>> GetAllAsync()', 'Task<Todo?> FindAsync(int id)', 'Task<Todo> InsertAsync(Todo todo)'].forEach((s, i) => mono(625, 214 + i * 30, s, { 'font-size': 14, opacity: fade(u, 1.3 + i * 0.25) }));
      grow(L.ep + 85, Y, L.sv - 95, Y, E(u, 0.5, 1.0), INK); grow(L.sv + 95, Y, L.rp - 115, Y, E(u, 0.7, 1.2), INK);
      sub(300, 230, '경계를 넘는 것은 record 뿐이다', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k5: 구현 교체 + 수명 실수
    grow(L.ep + 85, Y, L.sv - 95, Y, 1, INK); grow(L.sv + 95, Y, L.rp - 115, Y, 1, INK);
    tx(L.sv, 140, '엔드포인트·서비스 수정 0줄', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    card(480, 300, 860, 120, { rx: 12, stroke: WARN, fill: WARNBG, sw: 2, s: pop(u, 1.6) });
    tx(70, 268, '저장소를 Scoped 로 등록하면', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) });
    [['요청 1: POST', '1건 저장'], ['요청 2: GET', '새 저장소 → 0건']].forEach(([a, b], i) => { mono(90 + i * 400, 310, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0 + i * 0.2) }); tx(90 + i * 400, 338, b, { 'font-size': 14.5, fill: i ? BAD : INK, opacity: fade(u, 2.0 + i * 0.2) }); }); }

  // ---------- 3. GET · POST ----------
  function s3(t, c) { const { k, u } = c, saved = k >= 3;
    stations({ on: ['ep', 'sv', 'rp'] });
    store(saved ? [['1', '우유 사기', 'false', k === 3 ? fade(u, 1.2) : 1, k === 3 ? GOOD : null]] : []);
    if (k === 0) { req(30, 150, 'GET', '/todos'); trip(u, ['cli', 'ep', 'sv', 'rp'], 0.3, 1.8);
      status(110, 230, 200, 'OK', pop(u, 1.8)); jbox(190, 212, ['[]'], { title: '본문 (실제 출력)', op: fade(u, 1.9) });
      sub(380, 330, '핸들러 인자의 TodoService 는 DI 가 채운다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 1) { req(30, 150, 'GET', '/todos/9'); trip(u, ['cli', 'ep', 'sv', 'rp'], 0.3, 1.6);
      mono(SX.rp, 136, 'null', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      status(110, 230, 404, 'Not Found', pop(u, 1.6));
      req(30, 310, 'GET', '/todos/abc', { op: fade(u, 1.9) }); tx(210, 316, '→ {id:int} 에 맞지 않아 라우트부터 404', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { req(30, 150, 'POST', '/todos');
      jbox(30, 190, ['{"title":"우유 사기"}'], { title: '요청 본문', op: fade(u, 0.2) });
      dot([[200, 205], [SX.ep, 140], [SX.ep, SY + 20]], seg(u, 0.5, 1.2), GOOD, 8);
      obj(300, 190, 280, 'CreateTodoDto dto', [['Title', '"우유 사기"', E(u, 1.2, 1.7)]], { vbg: GOODBG, op: fade(u, 1.0) });
      sub(440, 330, 'System.Text.Json 이 본문을 record 로 바꿔 넣는다', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 3) { req(30, 150, 'POST', '/todos'); trip(u, ['cli', 'ep', 'sv', 'rp'], 0.2, 1.6, GOOD);
      fly(SX.rp, SY + 30, 860, 172, seg(u, 0.6, 1.2), 'Todo(1, …)', { mono: true, fill: GOOD });
      status(120, 230, 201, 'Created', pop(u, 1.6)); jbox(230, 214, ['Location: /todos/1'], { op: fade(u, 1.8), title: '헤더' });
      sub(360, 320, 'Results.Created — 만들었고 여기 있다', fade(u, 2.1), { 'font-size': 15 }); return; }
    // k4: 실제 응답 전문
    jbox(30, 150, ['HTTP/1.1 201 Created', 'Content-Type: application/json; charset=utf-8', ['Location: /todos/1', ACC], '', ['{"id":1,"title":"우유 사기","done":false}', GOOD]], { title: 'curl -i 실제 출력', op: fade(u, 0.2) });
    [['Id', 'id'], ['Title', 'title'], ['Done', 'done']].forEach(([a, b], i) => { const y = 316 + i * 28, s = fade(u, 1.0 + i * 0.3);
      mono(600, y, a, { 'font-size': 15, 'font-weight': 700, opacity: s }); grow(650, y - 5, 730, y - 5, E(u, 1.1 + i * 0.3, 1.5 + i * 0.3), ACC); mono(740, y, '"' + b + '"', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: s }); });
    tx(600, 290, 'record 속성 → camelCase 키', { 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.9) }); }

  // ---------- 4. PUT · DELETE · 검증 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 5) { // 상태코드 지도
      [['GET', '/todos', 200, 'OK'], ['POST', '/todos', 201, 'Created'], ['PUT', '/todos/1', 200, 'OK'], ['DELETE', '/todos/1', 204, 'No Content'], ['PUT', '빈 Title', 400, 'Bad Request'], ['PUT·DELETE', '없는 id', 404, 'Not Found']].forEach(([m, p, cd, nm], i) => {
        const y = 52 + i * 56, s = pop(u, 0.2 + i * 0.25);
        mono(80, y + 5, m, { 'font-size': 15, 'font-weight': 800, fill: MCOL[m] || INK, opacity: s }); mono(240, y + 5, p, { 'font-size': 15, opacity: s });
        grow(400, y, 520, y, E(u, 0.3 + i * 0.25, 0.6 + i * 0.25), MUT); status(640, y, cd, nm, s); });
      tx(480, 400, '같은 엔드포인트도 상황마다 다른 숫자로 답한다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    const del = k >= 3, gd = k === 1 ? 'bad' : k === 2 ? 'ok' : k === 0 ? 'idle' : null;
    stations({ on: ['ep', 'sv', 'rp'], guard: del ? null : gd });
    const rows = k === 4 ? [['1', '우유 사기', 'true', 1 - fade(u, 0.9), BAD]] : [['1', '우유 사기', k >= 2 && !(k === 2 && u < 1.2) ? 'true' : 'false', 1, k === 2 && u > 1.2 ? GOOD : null]];
    store(rows);
    if (k === 0) { req(30, 150, 'PUT', '/todos/1'); jbox(30, 190, ['{"title":"","done":true}'], { title: '요청 본문', op: fade(u, 0.4) });
      mono(300, 156, 'int id ← 경로 · UpdateTodoDto ← 본문', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) });
      sub(420, 320, '경로 값과 본문을 한 핸들러가 함께 받는다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1) { req(30, 150, 'PUT', '/todos/1'); dot([[SX.cli, SY], [SX.ep, SY], [SX.gd - 8, SY]], seg(u, 0.2, 0.9), WARN, 8);
      cross(SX.gd, SY - 44, 11, pop(u, 0.9)); status(130, 216, 400, 'Bad Request', pop(u, 1.2));
      jbox(30, 264, ['Content-Type: application/problem+json', '{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1",', ' "title":"One or more validation errors occurred.",', ' "status":400,"errors":{"title":["제목은 비울 수 없습니다"]}}'], { fs: 13.5, title: '실제 응답', op: fade(u, 1.5) });
      return; }
    if (k === 2) { req(30, 150, 'PUT', '/todos/1'); jbox(200, 136, ['{"title":"우유 사기","done":true}'], { fs: 13.5 }); trip(u, ['cli', 'ep', 'gd', 'sv', 'rp'], 0.2, 1.8, GOOD);
      status(110, 230, 200, 'OK', pop(u, 1.8)); jbox(190, 212, ['{"id":1,"title":"우유 사기","done":true}'], { op: fade(u, 1.9) });
      req(30, 310, 'PUT', '/todos/9', { op: fade(u, 2.0) }); status(250, 310, 404, 'Not Found', pop(u, 2.2)); return; }
    if (k === 3) { req(30, 150, 'DELETE', '/todos/{id:int}'); tx(30, 210, '본문도 DTO 도 없다 — 경로의 id 하나면 된다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      dot([[SX.cli, SY], [SX.ep, SY], [SX.sv, SY], [SX.rp, SY]], seg(u, 1.0, 2.0), BAD, 8); return; }
    // k4: 삭제 204, 다시 삭제 404
    req(30, 150, 'DELETE', '/todos/1'); trip(u, ['cli', 'ep', 'sv', 'rp'], 0.2, 1.2, BAD);
    status(120, 210, 204, 'No Content', pop(u, 1.2)); tx(250, 216, '본문 없음', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.3) });
    req(30, 290, 'DELETE', '/todos/1', { op: fade(u, 1.7) }); status(320, 290, 404, 'Not Found', pop(u, 2.0));
    tx(30, 350, '두 번째는 지울 것이 없다 (실제 출력)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); }

  // ---------- 5. 서비스 단위 테스트 ----------
  const CONCEPTS = [['최소 API', ACC], ['record', ACC], ['DI', INFO], ['async', INFO], ['json', GOOD], ['테스트', GOOD]];
  function s5(t, c) { const { k, u } = c;
    if (k === 5) { el('rect', { x: 40, y: 50, width: 880, height: 110, rx: 10, fill: INK });
      mono(60, 92, '$ dotnet test', { 'font-size': 16, fill: PANEL }); mono(60, 128, typed('  Passed!  (2 tests)', E(u, 0.4, 1.2)), { 'font-size': 16, fill: '#4ade80', 'font-weight': 700 });
      CONCEPTS.forEach(([n, col], i) => { const x = 110 + i * 148, s = pop(u, 1.2 + i * 0.15); el('circle', { cx: x, cy: 260, r: 46 * s, fill: col, opacity: 0.9 });
        tx(x, 266, n, { 'font-size': 15.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: s }); if (i) el('line', { x1: x - 102, y1: 260, x2: x - 46, y2: 260, stroke: GRID, 'stroke-width': 3, opacity: s }); });
      tx(480, 360, '여기에 인증 · EF Core · 페이징을 얹으면 실무 서비스가 된다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    server(860, 330, 'HTTP 서버 없음', { op: 0.35 }); cross(860, 320, 16, 1);
    card(360, 80, 190, 50, { rx: 10, text: 'TodoService', mono: true, fs: 15, fw: 700, stroke: INFO, color: INFO, s: k === 0 ? pop(u, 0.3) : 1 });
    card(660, 80, 260, 50, { rx: 10, text: 'InMemoryTodoRepository', mono: true, fs: 14.5, fw: 700, stroke: ACC, color: ACC, s: k === 0 ? pop(u, 0.6) : 1 });
    grow(530, 80, 460, 80, k === 0 ? E(u, 0.9, 1.4) : 1, ACC);
    mono(40, 40, 'NewService() => new TodoService(new InMemoryTodoRepository())', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 0 ? fade(u, 1.2) : 1 });
    if (k === 0) { sub(480, 200, '웹 서버를 띄우지 않고 서비스만 조립한다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k <= 2) { mono(40, 180, 'await svc.AddAsync(new CreateTodoDto("우유"))', { 'font-size': 15, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.2) : 1 });
      if (k === 1) dot([[360, 105], [660, 105], [660, 220]], seg(u, 0.6, 1.4), GOOD, 8);
      obj(40, 210, 280, 'created', [['Id', '1', k === 1 ? E(u, 1.4, 1.8) : 1], ['Title', '"우유"', k === 1 ? E(u, 1.5, 1.9) : 1], ['Done', 'false', k === 1 ? E(u, 1.6, 2.0) : 1]], { vbg: GOODBG });
      if (k === 2) [['Assert.True(created.Id > 0)', 'Id 는 서버가 준다'], ['Assert.False(created.Done)', '기본값 false'], ['Assert.Equal("우유", created.Title)', '제목 그대로']].forEach(([a, b], i) => {
        const y = 236 + i * 46, s = pop(u, 0.3 + i * 0.4); check(360, y, 10, s); mono(380, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); tx(700, y + 5, b, { 'font-size': 14, fill: MUT, opacity: s }); });
      return; }
    mono(40, 180, 'await svc.UpdateAsync(999, new UpdateTodoDto("x", true))', { 'font-size': 15, 'font-weight': 700 });
    if (k === 3) { dot([[360, 105], [660, 105]], seg(u, 0.4, 1.1), WARN, 8); cross(660, 140, 11, pop(u, 1.1)); tx(690, 146, '999 없음', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) }); }
    card(130, 250, 160, 50, { rx: 10, text: 'null', mono: true, fs: 20, fw: 800, stroke: WARN, color: WARN, dash: '6 4', s: k === 3 ? pop(u, 1.6) : 1 });
    if (k === 4) { mono(240, 256, 'Assert.Null(result)', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) }); check(440, 250, 11, pop(u, 0.6));
      grow(210, 280, 330, 360, E(u, 1.0, 1.5), ACC);
      mono(340, 366, 'updated is null ? Results.NotFound()', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      sub(560, 400, '엔드포인트의 404 가 이 null 에 기대고 있다', fade(u, 1.9), { 'font-size': 15 }); } }

  const quiz = [
    { q: '생성 요청을 저장 모델 Todo가 아니라 CreateTodoDto(Title)로 받는 까닭은 무엇인가?',
      o: ['JSON 변환이 더 빨라서', 'Id와 Done을 클라이언트가 정하지 못하게 하려고', 'record는 필드가 하나여야 해서'], a: 1,
      why: '받을 자리가 Title뿐이라 본문에 "id"를 넣어도 버려진다. Id는 저장소가, Done 기본값은 서버가 정한다.' },
    { q: '인메모리 저장소를 Scoped로 등록하면 생기는 일은 무엇인가?',
      o: ['요청마다 새 저장소가 생겨 앞 요청에서 저장한 것이 사라진다', '앱 전체가 한 저장소를 나눠 써서 더 빠르다', '컴파일 오류가 난다'], a: 0,
      why: '데이터를 들고 있는 인메모리 저장소는 앱 전체가 하나를 공유해야 한다. 그래서 Singleton으로 등록했다.' },
    { q: '{"title":"우유 사기"}로 POST /todos를 보냈을 때 실제로 받은 응답은 무엇인가?',
      o: ['200 OK와 본문', '201 Created와 Location: /todos/1, 본문 {"id":1,…}', '204 No Content'], a: 1,
      why: 'Results.Created가 새 리소스 주소를 Location 헤더에 담는다. 본문 키는 record 속성 이름이 camelCase로 바뀐 것이다.' },
    { q: 'PUT /todos/1에 빈 제목을 보내면 요청은 어디까지 가는가?',
      o: ['엔드포인트의 검증에서 멈추고 400 problem+json이 나간다', '저장소까지 가서 빈 제목으로 바뀐다', '서비스에서 404로 바뀐다'], a: 0,
      why: 'IsNullOrWhiteSpace 검사가 서비스 호출보다 앞에 있어 저장소까지 가지 않는다. 응답 형식은 표준 problem+json이다.' },
    { q: 'Update_missing_id_returns_null 테스트가 지켜 주는 것은 무엇인가?',
      o: ['없는 id를 고치면 예외가 난다는 약속', '없는 id면 null이 나오고, 그래서 엔드포인트가 404를 낸다는 약속', 'Id가 999까지 늘어난다는 약속'], a: 1,
      why: '엔드포인트는 updated is null이면 NotFound를 돌려준다. 그 근거인 null을 테스트로 고정해 저장소를 바꿔도 404가 유지된다.' },
  ];

  const summary = [
    'Todo와 요청 DTO를 record로 나눠 Id와 Done은 서버가 정하게 했다.',
    '엔드포인트, 서비스, 저장소를 DI로 잇고 인메모리 저장소는 Singleton으로 둔다.',
    'POST는 201과 Location, 빈 제목은 400, 삭제는 204, 없는 id는 404로 답한다.',
    '인터페이스 덕분에 서비스를 웹 서버 없이 xUnit으로 검증하고 null을 404의 근거로 고정한다.',
  ];
  const review = [
    { q: '서버를 다시 띄우지 않았는데 방금 POST로 만든 항목이 다음 GET에서 보이지 않는다. 먼저 볼 곳은?',
      o: ['ITodoRepository 등록 수명이 Scoped로 되어 있는지', 'CreateTodoDto에 Id 필드가 있는지', 'Results.Created의 Location 문자열'], a: 0,
      why: 'Scoped면 요청마다 새 인메모리 저장소가 만들어져 앞 요청의 데이터가 없다. 데이터를 들고 있는 저장소는 Singleton이어야 한다.' },
    { q: '프론트 개발자가 "삭제는 됐는데 응답이 비어서 실패인 줄 알았다"고 한다. 서버 쪽 설명으로 맞는 것은?',
      o: ['삭제 실패라 본문이 비었다', '204 No Content는 성공했고 돌려줄 본문이 없다는 뜻이다', '400을 보냈어야 한다'], a: 1,
      why: '상태코드가 계약이다. 204는 성공, 지울 것이 없었다면 404로 구분해서 답한다.' },
    { q: '저장소를 EF Core 구현으로 바꾼 뒤에도 기존 단위 테스트를 그대로 돌리고 싶다. 이게 가능한 까닭은?',
      o: ['EF Core가 인메모리 저장소를 상속하기 때문이다', 'xUnit이 저장소를 자동으로 바꿔 주기 때문이다', '테스트가 구현이 아니라 서비스의 행동과 저장소 계약을 검증하기 때문이다'], a: 2,
      why: '서비스는 인터페이스만 알고 테스트는 Id 부여와 null 반환 같은 행동을 본다. 구현이 바뀌어도 같은 계약을 지키는지 그대로 확인한다.' },
  ];

  R.page({ title: 'Todo REST 서비스 — 요청이 지나는 세 계층', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
