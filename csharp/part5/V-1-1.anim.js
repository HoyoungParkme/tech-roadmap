/* V-1-1 ASP.NET Core 최소 API 맛보기 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림 속 응답 값은 .NET 10 SDK 로 페이지 코드를 그대로 돌려 받은 실제 출력이다 (dotnet run, curl). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, dot, cells, kvTable,
    browser, cross, check, terminal, spans, tokens, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  // C# 한 줄 색칠: 문자열은 tokens 가, // 주석은 여기서
  function csTok(s) { const m = s.match(/(^|\s)\/\/.*/); if (!m) return tokens(s); const i = m.index + m[1].length; return tokens(s.slice(0, i)).concat([[s.slice(i), { fill: MUT }]]); }
  // 코드 판: rows = [[문자열, 보임(0~1), 강조]]
  function code(x, y, w, rows, o) { o = o || {}; const fs = o.fs || 14, lh = fs + 10, h = rows.length * lh + 18;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    if (o.title) mono(x + 4, y - 9, o.title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    rows.forEach((r, i) => { if (!r) return; const [s, op = 1, hot] = r; if (op <= 0.01) return; const yy = y + 9 + i * lh;
      if (hot) el('rect', { x: x + 5, y: yy, width: w - 10, height: lh, rx: 5, fill: ACCBG, opacity: op });
      spans(x + 14, yy + lh / 2 + fs * 0.36, csTok(s), { 'font-size': fs, opacity: op }); });
    return h; }
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const MCOL = { GET: INFO, POST: GOOD, PUT: WARN, DELETE: BAD };
  // HTTP 요청 표: 메서드 칸 + 경로
  function req(x, y, method, path, o) { o = o || {}; const fs = o.fs || 15, mw = tw(method, fs) + 16, pw = tw(path, fs) + 18, g = R.G(x, y, o.s ?? 1, o.op ?? 1);
    el('rect', { x: 0, y: -15, width: mw + pw, height: 30, rx: 7, fill: PANEL, stroke: INK, 'stroke-width': 1.8 }, g);
    el('rect', { x: 0, y: -15, width: mw, height: 30, rx: 7, fill: MCOL[method] || INK }, g);
    tx(mw / 2, fs * 0.36, method, { 'text-anchor': 'middle', 'font-size': fs - 1, 'font-weight': 800, fill: PANEL, class: 'mono' }, g);
    tx(mw + 9, fs * 0.36, path, { 'font-size': fs, 'font-weight': 600, class: 'mono' }, g);
    return { w: mw + pw, px: x + mw + 9, cw: fs * 0.6 }; }
  // 상태코드 배지
  function status(cx, cy, code, text, s) { const col = code >= 500 ? BAD : code >= 400 ? WARN : GOOD, bg = code >= 500 ? BADBG : code >= 400 ? WARNBG : GOODBG, str = code + ' ' + text;
    card(cx, cy, tw(str, 15) + 28, 34, { rx: 17, fill: bg, stroke: col, sw: 2.2, text: str, fs: 15, fw: 800, color: col, mono: true, s }); }
  // JSON·텍스트 상자
  function jbox(x, y, lines, o) { o = o || {}; const fs = o.fs || 14, lh = fs + 8, w = o.w || Math.max(...lines.map((l) => tw(l, fs))) + 28, h = lines.length * lh + 14, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.6, opacity: op });
    if (o.title) tx(x + 2, y - 8, o.title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op });
    lines.forEach((l, i) => mono(x + 14, y + 7 + lh * i + lh / 2 + fs * 0.36, l, { 'font-size': fs, fill: o.color || INK, opacity: op * (o.lineOp ? o.lineOp(i) : 1) })); return { w, h }; }
  // 객체 카드: fields = [[이름, 값, 채움(0~1)]]
  function obj(x, y, w, title, fields, o) { o = o || {}; const rh = 30, h = 34 + fields.length * rh + 6, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    el('rect', { x: x + 1, y: y + 1, width: w - 2, height: 29, rx: 9, fill: o.head || ACCBG, opacity: op });
    mono(x + 12, y + 20, title, { 'font-size': 14.5, 'font-weight': 800, fill: o.hc || ACC, opacity: op });
    fields.forEach(([n, v, f], i) => { const yy = y + 34 + i * rh, ff = f ?? 1;
      mono(x + 12, yy + 19, n, { 'font-size': 14, fill: MUT, opacity: op });
      if (ff > 0.02 && v != null) { el('rect', { x: x + w * 0.42, y: yy + 3, width: (w * 0.58 - 8) * ff, height: rh - 6, rx: 5, fill: o.vbg || GOODBG, opacity: op });
        mono(x + w - 14, yy + 19, v, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: o.vc || INK, opacity: op * ff }); } });
    return h; }

  // ---------- 1. 최소 API 뼈대 ----------
  const HELLO = ['var builder = WebApplication.CreateBuilder(args);', 'var app = builder.Build();', 'app.MapGet("/", () => "Hello, World!");', 'app.Run();'];
  const ST = [[540, 'Kestrel'], [690, '라우팅'], [830, '핸들러']], TY = 250;
  function s1(t, c) { const { k, u } = c;
    code(24, 46, 440, HELLO.map((s, i) => (k < i ? null : [k === i ? typed(s, E(u, 0.1, 1.1)) : s, 1, k === i])), { fs: 13.5, title: 'Program.cs' });
    // 빌더: DI · 설정 · 로깅 칸이 채워진다
    card(590, 74, 200, 40, { rx: 9, text: 'builder', mono: true, fs: 15, fw: 800, stroke: ACC, color: ACC, s: k === 0 ? pop(u, 0.3) : 1 });
    cells(490, 104, ['DI', '설정', '로깅'], { w: 62, h: 32, gap: 7, mono: false, fs: 14, style: (i) => ({ stroke: ACC, color: ACC, fill: ACCBG, s: k === 0 ? pop(u, 0.9 + i * 0.35) : 1 }) });
    if (k === 0) { sub(590, 170, '서버는 아직 없다', fade(u, 2.0)); }
    if (k >= 1) { grow(694, 74, 772, 74, k === 1 ? E(u, 0.2, 0.8) : 1, ACC);
      card(850, 74, 150, 40, { rx: 9, text: 'app', mono: true, fs: 15, fw: 800, s: k === 1 ? pop(u, 0.8) : 1 });
      sub(850, 112, '요청 파이프라인', k === 1 ? fade(u, 1.1) : 1); }
    // 파이프라인 길: Kestrel → 라우팅 → 핸들러
    if (k >= 1) { const g = k === 1 ? E(u, 1.0, 2.2) : 1;
      el('line', { x1: 500, y1: TY, x2: lerp(500, 920, g), y2: TY, stroke: GRID, 'stroke-width': 5, 'stroke-linecap': 'round' });
      ST.forEach(([x, n], i) => { const s = k === 1 ? pop(u, 1.2 + i * 0.3) : 1, on = (i === 0 && k >= 3) || (i > 0 && k >= 2);
        el('circle', { cx: x, cy: TY, r: 11 * s, fill: on ? (i === 0 ? GOOD : ACC) : PANEL, stroke: on ? (i === 0 ? GOOD : ACC) : OFF, 'stroke-width': 2.5, 'stroke-dasharray': on ? null : '4 3' });
        lbl(x, TY + 34, n, s, { fill: on ? INK : MUT }); }); }
    if (k === 1) sub(760, 300, '경로가 없어 아직 비어 있다', fade(u, 2.2));
    // 라우트: GET / ↔ 람다
    if (k >= 2) { const s = k === 2 ? pop(u, 0.9) : 1;
      if (k === 2) R.fly(250, 120, 690, 206, seg(u, 0.2, 0.9), 'GET /', { mono: true });
      pill(690, 206, 'GET /', ACC, s, { mono: true, fs: 14 });
      mono(830, 172, '() => "Hello, World!"', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.2) : 1 });
      grow(730, 206, 800, 186, k === 2 ? E(u, 1.0, 1.6) : 1, ACC, { plain: true }); }
    // Kestrel 이 켜지고 듣는다
    if (k >= 3) { const on = k === 3 ? E(u, 0.3, 0.8) : 1;
      for (let i = 0; i < 2; i++) { const ph = ((t * 0.7 + i * 0.5) % 1); el('circle', { cx: 540, cy: TY, r: 14 + ph * 26, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: (1 - ph) * on * 0.8 }); }
      if (k === 3) { mono(540, 330, 'localhost:5000 에서 대기', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
        sub(540, 356, 'app.Run() 은 여기서 멈춰 기다린다', fade(u, 1.6)); } }
    // curl 로 확인
    if (k === 4) { const go = [[500, TY], [540, TY], [690, TY], [830, TY]];
      terminal(24, 230, 440, 112, ['$ curl http://localhost:5000/', ['Hello, World!', 'var(--panel)']], u > 1.9 ? 2 : E(u, 0.1, 0.9), { title: 'terminal' });
      dot(go, seg(u, 0.4, 1.2), INFO, 8); dot(go.slice().reverse(), seg(u, 1.3, 2.0), GOOD, 8);
      if (u > 1.9) status(690, 330, 200, 'OK', pop(u, 1.9)); } }

  // ---------- 2. 바인딩: 값은 어디서 오나 ----------
  // 오른쪽: 라우트 표
  function routes(rows, o) { o = o || {}; const x = 690, y = 34, w = 250, rh = 30;
    el('rect', { x, y, width: w, height: 34 + Math.max(1, rows.length) * rh, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 12, y + 21, '등록된 라우트', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (!rows.length) mono(x + 12, y + 54, '(없음)', { 'font-size': 14, fill: OFF });
    rows.forEach(([m, p, s, hot], i) => { const yy = y + 34 + i * rh; if (hot) el('rect', { x: x + 5, y: yy + 1, width: w - 10, height: rh - 2, rx: 5, fill: ACCBG, opacity: s ?? 1 });
      mono(x + 14, yy + 20, m, { 'font-size': 14, 'font-weight': 800, fill: MCOL[m], opacity: s ?? 1 }); mono(x + 72, yy + 20, p, { 'font-size': 14, opacity: s ?? 1 }); }); }
  function slot(cx, cy, w, s, val, f, col) { card(cx, cy, w, 40, { rx: 8, text: s, mono: true, fs: 14.5, fw: 700, stroke: col, color: col, fill: PANEL });
    if (val != null && f > 0.02) card(cx, cy + 46, tw(val, 15) + 26, 32, { rx: 8, text: val, mono: true, fs: 15, fw: 800, stroke: 'none', fill: col === INFO ? INFOBG : ACCBG, color: col, s: f }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { const r = req(30, 60, 'GET', '/users/42?verbose=true', { fs: 18 }), x42 = r.px + 7 * r.cw, xq = r.px + 9 * r.cw, xe = r.px + 22 * r.cw;
      routes(k === 0 ? [] : [['GET', '/users/{id}', k === 1 ? fade(u, 0.3) : 1, true]]);
      if (k === 0) { dot([[x42, 60], [690, 90]], seg(u, 0.3, 1.2), INFO, 8); cross(815, 140, 14, pop(u, 1.2)); status(815, 186, 404, 'Not Found', pop(u, 1.5));
        sub(260, 130, '일치하는 경로가 없으면 핸들러까지 가지 않는다', fade(u, 1.8)); return; }
      // 경로 템플릿을 주소 아래에 맞춰 대 본다
      mono(r.px, 104, '/users/', { 'font-size': 18, fill: MUT, opacity: k === 1 ? fade(u, 0.2) : 1 });
      mono(r.px + 7 * r.cw, 104, '{id}', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 0.4) : 1 });
      el('rect', { x: x42 - 2, y: 45, width: 2 * r.cw + 4, height: 30, rx: 4, fill: ACC, opacity: 0.16 });
      el('rect', { x: xq - 2, y: 45, width: xe - xq + 4, height: 30, rx: 4, fill: INFO, opacity: 0.14 });
      const gl = k === 1 ? E(u, 0.8, 1.8) : 1;
      grow(x42 + r.cw, 116, 250, 172, gl, ACC); grow((xq + xe) / 2, 78, 520, 172, gl, INFO);
      tx(170, 150, '경로', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: gl }); tx(430, 130, '쿼리', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: gl });
      mono(30, 200, '(', { 'font-size': 20, fill: MUT }); mono(650, 200, ') =>', { 'font-size': 18, fill: MUT });
      const f = k === 2 ? E(u, 0.3, 1.0) : 0;
      slot(250, 194, 150, 'int id', k === 2 ? '42' : null, f, ACC); slot(520, 194, 190, 'bool verbose', k === 2 ? 'true' : null, f, INFO);
      if (k === 1) sub(390, 300, '템플릿에 이름이 있으면 경로, 없으면 쿼리', fade(u, 2.0));
      if (k === 2) { status(110, 330, 200, 'OK', pop(u, 1.3)); jbox(190, 312, ['{"id":42,"verbose":true}'], { op: fade(u, 1.5), title: '응답 본문 (실제 출력)' });
        sub(690, 380, '익명 객체 → JSON 은 자동', fade(u, 2.0)); }
      return; }
    if (k === 3) { req(30, 50, 'POST', '/users', { fs: 18 });
      routes([['GET', '/users/{id}'], ['POST', '/users', fade(u, 0.2), true]]);
      jbox(30, 96, ['{', '  "name": "Ada",', '  "email": "ada@x.io"', '}'], { title: '요청 본문', op: fade(u, 0.3) });
      grow(270, 150, 360, 150, E(u, 0.6, 1.0), GOOD); sub(315, 136, 'json', fade(u, 0.8));
      obj(370, 110, 260, 'CreateUser dto', [['Name', '"Ada"', E(u, 1.0, 1.5)], ['Email', '"ada@x.io"', E(u, 1.4, 1.9)]]);
      status(110, 330, 200, 'OK', pop(u, 2.0)); jbox(190, 312, ['"Ada"'], { op: fade(u, 2.1), title: '응답 본문' });
      sub(500, 240, '복합 타입(record)은 본문 json 에서', fade(u, 1.9)); return; }
    if (k === 4) { const r = req(30, 60, 'GET', '/search?q=csharp', { fs: 18 }), xq = r.px + 8 * r.cw, xe = r.px + 16 * r.cw;
      routes([['GET', '/users/{id}'], ['POST', '/users'], ['GET', '/search', fade(u, 0.2), true]]);
      el('rect', { x: xq - 2, y: 45, width: xe - xq + 4, height: 30, rx: 4, fill: INFO, opacity: 0.14 });
      grow((xq + xe) / 2, 80, 330, 172, E(u, 0.4, 1.1), INFO);
      pill(330, 150, '[FromQuery]', INFO, pop(u, 0.9), { mono: true, fs: 14, fill: INFOBG });
      slot(330, 200, 190, 'string q', '"csharp"', E(u, 1.3, 1.8), INFO);
      status(110, 330, 200, 'OK', pop(u, 1.9)); jbox(190, 312, ['검색: csharp'], { op: fade(u, 2.0), title: '응답 (text/plain)' });
      sub(560, 236, '추론에 기대지 않고 출처를 코드로 고정한다', fade(u, 1.5)); return; }
    // k5: 세 출처 정리
    [['경로  /users/{id}', 'int id', ACC], ['쿼리  ?verbose=true', 'bool verbose · string q', INFO], ['본문  { json }', 'CreateUser dto', GOOD]].forEach(([a, b, col], i) => {
      const y = 70 + i * 82, g = E(u, 0.2 + i * 0.4, 0.8 + i * 0.4);
      card(170, y, 260, 46, { rx: 10, text: a, mono: true, fs: 15, fw: 700, stroke: col, color: col, s: pop(u, 0.2 + i * 0.4) });
      grow(304, y, lerp(304, 470, g), y, g, col);
      card(600, y, 250, 46, { rx: 10, text: b, mono: true, fs: 15, fw: 700, stroke: INK, s: pop(u, 0.6 + i * 0.4) }); });
    card(430, 330, 600, 50, { rx: 10, stroke: WARN, fill: WARNBG, sw: 2, s: pop(u, 1.7) });
    mono(150, 335, 'GET /users/42', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
    tx(290, 335, '(verbose 빠짐)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) });
    status(620, 330, 400, 'Bad Request', pop(u, 2.1)); }

  // ---------- 3. Results 와 상태코드 ----------
  function diamond(cx, cy, s, col) { const g = R.G(cx, cy, s); el('path', { d: 'M-78,0 L0,-32 L78,0 L0,32 Z', fill: PANEL, stroke: col || INK, 'stroke-width': 2.2 }, g);
    tx(0, 5, 'TryGetValue', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono' }, g); }
  function s3(t, c) { const { k, u } = c;
    if (k === 4) { // 헬퍼 ↔ 상태코드 지도
      [['Results.Ok(data)', 200, 'OK', '조회·수정 성공'], ['Results.Created(uri, data)', 201, 'Created', '생성 + Location 헤더'],
        ['Results.BadRequest(err)', 400, 'Bad Request', '잘못된 입력'], ['Results.NotFound()', 404, 'Not Found', '리소스 없음']].forEach(([fn, cd, nm, when], i) => {
        const cx = i % 2 ? 700 : 260, cy = i < 2 ? 100 : 236, s = pop(u, 0.2 + i * 0.35), col = cd >= 400 ? WARN : GOOD;
        card(cx, cy, 400, 108, { rx: 12, stroke: col, sw: 2, s });
        mono(cx - 180, cy - 22, fn, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) });
        status(cx - 180 + (tw(cd + ' ' + nm, 15) + 28) / 2, cy + 12, cd, nm, s);
        tx(cx - 180, cy + 46, when, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.35) }); });
      tx(480, 360, '클라이언트·프록시·모니터링은 이 숫자로 성공과 실패를 가른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    const rows = [['1', '"키보드"'], ['2', '"마우스"']];
    if (k >= 3) rows.push(['3', '"마우스패드"', { hot: true, op: E(u, 0.9, 1.4) }]);
    if (k === 0) rows.forEach((r, i) => { r[2] = { op: E(u, 0.4 + i * 0.5, 0.9 + i * 0.5) }; });
    if (k === 1) rows[0][2] = { hot: true };
    kvTable(30, 74, 290, rows, { title: 'products  Dictionary<int,string>', kw: 80 });
    if (k === 0) { sub(175, 250, '있는지 없는지가 상태코드를 가른다', fade(u, 1.8)); return; }
    if (k === 3) { req(30, 36, 'POST', '/products');
      jbox(30, 236, ['{"name":"마우스패드"}'], { title: '요청 본문', op: fade(u, 0.2) });
      grow(300, 262, 420, 160, E(u, 1.2, 1.7), GOOD);
      card(560, 150, 270, 44, { rx: 9, text: 'Results.Created(…)', mono: true, fs: 15, fw: 700, stroke: GOOD, color: GOOD, s: pop(u, 1.6) });
      status(800, 150, 201, 'Created', pop(u, 1.9));
      jbox(440, 220, ['HTTP/1.1 201 Created', 'Location: /products/3', '', '{"id":3,"name":"마우스패드"}'], { title: '실제 응답', op: fade(u, 2.1), lineOp: (i) => (i === 1 ? 1 : 0.85) });
      return; }
    // k1, k2: 조회 → TryGetValue 갈림길
    const id = k === 1 ? '1' : '999', hit = k === 1;
    req(30, 36, 'GET', '/products/' + id);
    if (k === 2) { const sc = E(u, 0.2, 1.3); el('rect', { x: 36, y: 104 + sc * 66, width: 278, height: 30, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: 1 - fade(u, 1.4) });
      cross(175, 200, 12, pop(u, 1.4)); }
    const dg = E(u, 0.3, 0.9);
    grow(330, 140, 400, 140, dg, MUT); diamond(480, 140, pop(u, 0.5), INK);
    const bu = E(u, 1.0, 1.6);
    el('path', { d: 'M558,140 L600,80 L640,80', fill: 'none', stroke: hit ? GOOD : OFF, 'stroke-width': hit ? 3 : 2, opacity: bu });
    el('path', { d: 'M558,140 L600,200 L640,200', fill: 'none', stroke: hit ? OFF : WARN, 'stroke-width': hit ? 2 : 3, opacity: bu });
    tx(586, 100, 'true', { 'font-size': 13.5, class: 'mono', fill: MUT, opacity: bu, 'text-anchor': 'end' }); tx(586, 190, 'false', { 'font-size': 13.5, class: 'mono', fill: MUT, opacity: bu, 'text-anchor': 'end' });
    card(735, 80, 190, 40, { rx: 8, text: 'Results.Ok(…)', mono: true, fs: 14.5, stroke: hit ? GOOD : GRID, color: hit ? GOOD : MUT, s: pop(u, 1.2) });
    card(735, 200, 210, 40, { rx: 8, text: 'Results.NotFound()', mono: true, fs: 14.5, stroke: hit ? GRID : WARN, color: hit ? MUT : WARN, s: pop(u, 1.3) });
    if (hit) { status(890, 128, 200, 'OK', pop(u, 1.9)); jbox(440, 270, ['{"id":1,"name":"키보드"}'], { title: '응답 본문 (실제 출력)', op: fade(u, 2.1) }); }
    else { status(870, 250, 404, 'Not Found', pop(u, 1.9)); tx(440, 320, '없는 상품을 200 + 빈 본문으로 주면 프론트와 캐시가 성공으로 오해한다', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.1) }); } }

  // ---------- 4. JSON · 검증 · Swagger ----------
  function gate(x, y1, y2, col, label, op) { el('rect', { x: x - 7, y: y1, width: 14, height: y2 - y1, rx: 7, fill: col, opacity: 0.85 * (op ?? 1) });
    mono(x, y1 - 12, label, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: op ?? 1 }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { mono(40, 50, typed('using System.ComponentModel.DataAnnotations;', E(u, 0.1, 1.0)), { 'font-size': 15, 'font-weight': 700, fill: INFO });
      obj(300, 120, 260, 'record CreateUser', [['Name', 'string', 1], ['Email', 'string', 1]], { vbg: SOFT, vc: MUT, op: fade(u, 0.9) });
      [['[Required]', 168], ['[EmailAddress]', 198]].forEach(([a, y], i) => { const s = pop(u, 1.3 + i * 0.35);
        el('line', { x1: 560, y1: y, x2: 640, y2: y, stroke: OFF, 'stroke-width': 1.8, 'stroke-dasharray': '4 3', opacity: s });
        pill(650 + tw(a, 14) / 2 + 13, y, a, INFO, s, { mono: true, fs: 14, fill: INFOBG }); });
      sub(480, 300, '특성은 규칙을 적어 둘 뿐, 아직 아무도 실행하지 않는다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 1) { code(30, 70, 330, [['builder.Services.AddSwaggerGen();', 1, true], ['app.UseSwaggerUI();', fade(u, 0.5), true], ['app.MapPost("/users", …);', 1]], { fs: 14, title: 'Program.cs' });
      browser(700, 200, 400, 250, 'localhost:5000/swagger', { s: pop(u, 0.6) });
      dot([[360, 160], [520, 160], [560, 170]], seg(u, 0.8, 1.5), ACC, 7);
      const dy = 120; if (u > 1.4) { req(520, dy, 'POST', '/users', { fs: 14, op: fade(u, 1.4) });
        mono(520, dy + 40, 'CreateUser { name, email }', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) });
        card(590, dy + 92, 130, 32, { rx: 6, text: 'Try it out', fs: 14, stroke: INFO, color: INFO, s: pop(u, 2.0) }); }
      sub(195, 230, '라우트를 훑어 OpenAPI 문서를 만든다', fade(u, 1.2)); return; }
    const bad = k === 2 || k === 3 || k === 5;
    if (k === 2) { jbox(30, 110, ['{ "name": "",', '  "email": "bad" }'], { title: '요청 본문', op: fade(u, 0.2) });
      grow(250, 140, 360, 140, E(u, 0.5, 1.0), GOOD); sub(305, 126, 'System.Text.Json', fade(u, 0.7));
      obj(370, 96, 260, 'CreateUser dto', [['Name', '""', E(u, 1.0, 1.5)], ['Email', '"bad"', E(u, 1.4, 1.9)]], { vbg: WARNBG });
      sub(500, 260, '빈 이름도 잘못된 이메일도 그대로 객체가 된다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 3 || k === 4) { obj(30, 110, 250, 'CreateUser dto', bad ? [['Name', '""'], ['Email', '"bad"']] : [['Name', '"Ada"'], ['Email', '"ada@x.io"']], { vbg: bad ? WARNBG : GOODBG });
      gate(380, 90, 220, bad ? BAD : GOOD, 'Validator.TryValidateObject', pop(u, 0.2));
      if (bad) { R.fly(290, 140, 460, 120, seg(u, 0.7, 1.3), 'Name', { fill: BAD, stay: true, mono: true }); R.fly(290, 170, 460, 160, seg(u, 0.9, 1.5), 'Email', { fill: BAD, stay: true, mono: true });
        status(560, 248, 400, 'Bad Request', pop(u, 1.6));
        jbox(440, 300, ['Name  · The Name field is required.', 'Email · The Email field is not a valid e-mail address.'], { fs: 13.5, title: 'errorMessage (실제 응답)', op: fade(u, 1.9), color: BAD }); }
      else { dot([[280, 155], [380, 155], [470, 155]], seg(u, 0.5, 1.3), GOOD, 9); check(380, 250, 14, pop(u, 1.0));
        status(600, 155, 201, 'Created', pop(u, 1.4)); jbox(470, 200, ['{"name":"Ada","email":"ada@x.io"}'], { title: '응답 본문', op: fade(u, 1.7) }); }
      return; }
    // k5: [property:] 를 안 쓰면 검증이 빈다 (실제 실행 비교)
    tx(30, 44, 'record 위치 매개변수의 특성 — 같은 요청 {"name":"","email":"bad"}', { 'font-size': 15, 'font-weight': 700 });
    [['[Required] string Name', 201, 'Created', '특성이 생성자 매개변수에만 붙어 Validator 가 못 본다'], ['[property: Required] string Name', 400, 'Bad Request', '속성에 붙어야 Validator 가 읽는다']].forEach(([a, cd, nm, why], i) => {
      const y = 110 + i * 140, s = pop(u, 0.3 + i * 0.9), ok = i === 1;
      card(200, y, 340, 50, { rx: 10, text: a, mono: true, fs: 15, fw: 700, stroke: ok ? GOOD : BAD, color: ok ? GOOD : BAD, s });
      grow(372, y, 520, y, E(u, 0.5 + i * 0.9, 0.9 + i * 0.9), MUT);
      status(620, y, cd, nm, pop(u, 0.9 + i * 0.9)); (ok ? check : cross)(760, y, 12, pop(u, 1.0 + i * 0.9));
      tx(40, y + 50, why, { 'font-size': 14.5, fill: ok ? GOOD : BAD, opacity: fade(u, 1.0 + i * 0.9) }); });
    sub(480, 400, '.NET 10 SDK 로 두 줄을 각각 돌린 결과', fade(u, 2.3)); }

  // ---------- 5. DI · 라우트 충돌 · 컨트롤러와 비교 ----------
  function container(x, y, w, s) { zone(x, y, w, 110, 'DI 컨테이너  builder.Services', { fill: SOFT, op: s });
    if (s > 0.3) { mono(x + 16, y + 58, 'IClock → SystemClock', { 'font-size': 15, 'font-weight': 700, opacity: s }); pill(x + w - 70, y + 54, 'Singleton', ACC, s, { fs: 13.5 }); } }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) container(30, 34, 420, k === 0 ? fade(u, 0.2) : 1);
    if (k === 0) { R.fly(240, 170, 240, 92, seg(u, 0.6, 1.3), 'AddSingleton<IClock, SystemClock>()', { mono: true });
      el('circle', { cx: 700, cy: 110, r: 46 * pop(u, 1.6), fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }); mono(700, 106, 'SystemClock', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      mono(700, 126, '#1', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); sub(700, 186, '앱 전체에서 하나', fade(u, 2.0)); return; }
    if (k === 1) { card(700, 90, 400, 48, { rx: 10, text: '(IClock clock) => clock.Now', mono: true, fs: 15.5, fw: 700, s: pop(u, 0.2) });
      el('rect', { x: 578, y: 72, width: 124, height: 36, rx: 7, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.7) });
      dot([[400, 90], [490, 90], [578, 90]], seg(u, 0.8, 1.6), ACC, 8); grow(450, 100, 572, 100, E(u, 0.8, 1.6), ACC, { plain: true });
      sub(700, 150, '등록된 타입은 컨테이너에서 꺼내 넣는다', fade(u, 1.6));
      [['경로·쿼리·본문', '나머지 매개변수', INFO]].forEach(([a, b, col]) => { card(240, 250, 230, 44, { rx: 9, text: a, fs: 15, stroke: col, color: col, s: pop(u, 1.9) });
        grow(360, 250, 560, 250, E(u, 2.0, 2.5), col); card(680, 250, 220, 44, { rx: 9, text: b, fs: 15, s: pop(u, 2.2) }); });
      return; }
    if (k === 2) { req(30, 270, 'GET', '/now');
      [['() => "A"', 230], ['() => "B"', 330]].forEach(([h, y], i) => { const g = E(u, 0.3, 1.0);
        el('path', { d: `M150,270 C220,270 230,${y} ${lerp(150, 380, g)},${y}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: g });
        card(470, y, 170, 42, { rx: 8, text: 'GET /now  ' + h.slice(6), mono: true, fs: 14, stroke: BAD, color: INK, s: pop(u, 0.2 + i * 0.2) }); });
      status(700, 230, 500, 'Internal Server Error', pop(u, 1.3));
      mono(580, 290, 'AmbiguousMatchException', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      tx(580, 316, '요청이 두 엔드포인트에 동시에 맞았다 (실제 로그)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      pill(700, 372, '빌드 경고 ASP0022 가 먼저 알려 준다', WARN, pop(u, 2.2), { fs: 14, fill: WARNBG }); return; }
    if (k === 3) { const sp = E(u, 0.9, 1.9), n = 9;
      el('rect', { x: 50, y: 40, width: 300, height: lerp(330, 130, sp), rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 }); mono(64, 64, 'Program.cs', { 'font-size': 14.5, 'font-weight': 700 });
      card(600, 170, 240, 200, { rx: 10, stroke: ACC, sw: 2, fill: 'none', s: sp, op: sp });
      card(840, 160, 190, 150, { rx: 10, stroke: INFO, sw: 2, fill: 'none', s: sp, op: sp });
      for (let i = 0; i < n; i++) { const half = i < 5, tgt = half ? [500, 96 + i * 30] : [762, 112 + (i - 5) * 30];
        el('rect', { x: lerp(70, tgt[0], sp), y: lerp(84 + i * 30, tgt[1], sp), width: (half ? 200 : 150) - 36 * (i % 3), height: 12, rx: 4, fill: half ? ACC : INFO, opacity: 0.55 }); }
      mono(600, 296, 'UserEndpoints.cs', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: sp });
      mono(840, 262, 'OrderEndpoints.cs', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: sp });
      if (sp > 0.95) { mono(70, 110, 'app.MapUserEndpoints();', { 'font-size': 14, opacity: fade(u, 1.9) }); mono(70, 136, 'app.MapOrderEndpoints();', { 'font-size': 14, opacity: fade(u, 2.0) }); }
      sub(480, 360, '라우트가 늘면 확장 메서드로 파일을 나눈다', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k4: 고르는 기준
    const cols = [['최소 API', c.beat.compare.minimal, ACC, 250], ['컨트롤러 (MVC)', c.beat.compare.controller, INFO, 710]];
    cols.forEach(([h, rows, col, cx], j) => { card(cx, 58, 340, 42, { rx: 10, text: h, fs: 16, fw: 800, stroke: col, color: col, fill: j ? INFOBG : ACCBG, s: pop(u, 0.2 + j * 0.3) });
      rows.forEach((r, i) => tx(cx - 156, 112 + i * 34, '· ' + r, { 'font-size': 15, opacity: fade(u, 0.5 + j * 0.3 + i * 0.25) })); });
    el('line', { x1: 160, y1: 262, x2: lerp(160, 800, E(u, 1.2, 2.0)), y2: 262, stroke: MUT, 'stroke-width': 2.2, 'marker-end': u > 2 ? 'url(#ra-ah)' : null });
    tx(160, 290, '작게 · 빠르게', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.3) }); tx(800, 290, '팀 · 규모 · 규약', { 'font-size': 14, fill: INFO, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.8) });
    ['라우트 충돌', '바인딩 출처 혼동', '상태코드 누락', '대규모 남용'].forEach((s, i) => pill(140 + i * 228, 350, s, BAD, pop(u, 2.0 + i * 0.12), { fs: 14, fill: BADBG })); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: '최소 API에서 app.Run() 줄이 하는 일은 무엇인가?',
      o: ['라우트를 등록하고 바로 다음 줄로 넘어간다', 'Kestrel 웹서버를 켜고 요청을 기다리며 멈춰 있는다', 'DI 컨테이너에 서비스를 등록한다'], a: 1,
      why: 'app.Run()은 Kestrel을 켜고 그 자리에서 대기한다. 그래서 이 뒤에 쓴 코드는 서버가 멈춘 뒤에야 실행된다.' },
    { q: 'GET /users/42?verbose=true에서 (int id, bool verbose)의 verbose 값은 어디서 오는가?',
      o: ['경로 템플릿의 {id} 자리', '요청 본문 json', '쿼리스트링 ?verbose=true'], a: 2,
      why: '경로 템플릿에 verbose라는 이름이 없으니 원시 타입은 쿼리에서 찾는다. 실제로 verbose를 빼고 부르면 400이 났다.' },
    { q: 'products에 없는 999번을 조회했을 때 돌려줘야 하는 것은 무엇인가?',
      o: ['404 Not Found', '200 OK와 빈 본문', '201 Created'], a: 0,
      why: 'TryGetValue가 false면 Results.NotFound()로 404를 보낸다. 200으로 숨기면 프론트와 캐시가 성공으로 오해한다.' },
    { q: 'record CreateUser([Required] string Name, …)를 Validator.TryValidateObject로 검사하면 빈 이름은 어떻게 되는가?',
      o: ['400으로 막힌다', '검사를 통과해 201이 나간다', '컴파일 오류가 난다'], a: 1,
      why: '특성이 생성자 매개변수에만 붙어 Validator가 보지 못한다. [property: Required]로 써야 실제로 400이 났다.' },
    { q: '같은 GET /now를 두 번 등록한 앱에 GET /now 요청이 오면 어떻게 되는가?',
      o: ['먼저 등록한 핸들러가 실행된다', '나중에 등록한 핸들러가 덮어쓴다', 'AmbiguousMatchException으로 500이 난다'], a: 2,
      why: '두 엔드포인트가 동시에 맞아 라우팅이 하나를 고르지 못한다. 앱은 뜨고, 요청이 올 때 500으로 터진다.' },
  ];

  const summary = [
    'CreateBuilder, Build, MapGet, Run 네 줄이면 Kestrel이 떠서 요청을 받는다.',
    '매개변수는 경로 템플릿, 쿼리, 본문 json 중 하나에서 채워지고 애매하면 [FromQuery]로 고정한다.',
    '있으면 Results.Ok, 없으면 NotFound, 만들면 Created로 상태코드를 정확히 돌려준다.',
    'JSON 변환은 자동이지만 검증은 직접 불러야 하고 record에는 [property: Required]로 붙인다.',
  ];
  const review = [
    { q: 'POST /users로 빈 이름을 보냈는데 201이 돌아왔다. 핸들러에는 Validator.TryValidateObject 호출이 있다. 먼저 의심할 것은?',
      o: ['record 매개변수의 특성이 [property:] 없이 붙어 있다', 'System.Text.Json이 빈 문자열을 null로 바꿨다', 'Results.Created가 400을 201로 덮어썼다'], a: 0,
      why: '위치 매개변수에 붙인 [Required]는 생성자 매개변수에만 남아 Validator가 읽지 못한다. [property: Required]로 바꾸면 400이 난다.' },
    { q: '상품 조회 API가 없는 id에도 200과 빈 본문을 준다. 프론트에서 "상품 없음" 화면이 안 뜬다. 고칠 곳은?',
      o: ['프론트에서 본문 길이를 검사한다', 'TryGetValue가 false인 가지에서 Results.NotFound()를 돌려준다', 'Swagger 문서에 설명을 추가한다'], a: 1,
      why: '클라이언트는 상태코드로 성공과 실패를 가른다. 없는 리소스는 404로 말해야 프론트와 캐시가 제대로 반응한다.' },
    { q: '엔드포인트가 40개를 넘자 Program.cs가 라우트 등록으로 뒤엉켰다. 같은 경로 중복도 한 번 났다. 가장 알맞은 대응은?',
      o: ['라우트를 확장 메서드로 파일별로 나누고, 규모가 계속 크면 컨트롤러를 검토한다', '모든 라우트를 하나의 람다로 합친다', '중복 경로는 나중 것이 이기니 그냥 둔다'], a: 0,
      why: '최소 API는 구조를 강제하지 않아 스스로 나눠야 한다. 중복 경로는 요청 때 AmbiguousMatchException 500이 되므로 그냥 두면 안 된다.' },
  ];

  R.page({ title: 'ASP.NET Core 최소 API — 요청이 지나는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
