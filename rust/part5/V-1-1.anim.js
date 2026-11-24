/* V-1-1 Actix-web 핸들러 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 응답 본문·상태코드는 actix-web 4 로 페이지 코드를 실제로 돌린 결과다 (/users/abc → 404, size 없음 → 400, app_data 없음 → 500 …). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, snippet, lock, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 상태코드 알약: 2xx 초록, 4xx 주황, 5xx 빨강
  const scol = (code) => (code >= 500 ? BAD : code >= 400 ? WARN : GOOD);
  const status = (cx, cy, code, s, o) => pill(cx, cy, String(code), scol(code), s, Object.assign({ mono: true, fs: 15 }, o || {}));
  const req = (cx, cy, s, sc, o) => pill(cx, cy, s, INFO, sc, Object.assign({ mono: true, fs: 14, fill: INFOBG }, o || {}));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  // 코드 조각 위 특정 글자 구간에 테두리 (snippet 과 같은 글자 폭: fs*0.6)
  function mark(x, y, line, from, len, fs, col, op) { const lh = fs + 8, cw = fs * 0.55;
    el('rect', { x: x + 18 + from * cw - 3, y: y + 14 + line * lh - 2, width: len * cw + 6, height: fs + 9, rx: 4, fill: col, 'fill-opacity': 0.12, stroke: col, 'stroke-width': 2.2, opacity: op ?? 1 }); }

  // ---------- 1. HttpServer · App ----------
  const HELLO = ['async fn hello() -> impl Responder {', '    HttpResponse::Ok().body("Hello, Actix!")', '}'];
  const LANES = [178, 258, 338];
  function s1(t, c) { const { k, u } = c;
    snippet(24, 20, HELLO, { fs: 14, op: k === 0 ? fade(u, 0.2) : 1 });
    status(500, 44, '200 OK', k === 0 ? pop(u, 0.9) : 1);
    mono(548, 49, '"Hello, Actix!"', { 'font-size': 15, opacity: k === 0 ? fade(u, 1.1) : 1 });
    sub(612, 84, '이 함수가 돌려줄 응답', k === 0 ? fade(u, 1.3) : 1, { 'text-anchor': 'start' });
    if (k === 0) { el('rect', { x: 24, y: 140, width: 912, height: 256, rx: 12, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: fade(u, 1.4) });
      req(300, 260, 'GET /hello', fade(u, 1.6) > 0 ? 1 : 0, { op: fade(u, 1.6) }); grow(370, 260, 560, 260, E(u, 1.8, 2.4), OFF, { dash: '5 5', plain: true });
      cross(600, 260, 14, pop(u, 2.3)); note(640, 266, '연결된 경로 없음', fade(u, 2.4), { fill: MUT }); return; }
    // 런타임 영역이 자란다
    const gw = k === 1 ? E(u, 0.2, 1.0) : 1;
    zone(24, 140, 912 * gw, 256, gw > 0.6 ? '#[actix_web::main] · async 런타임' : '', { fill: SOFT });
    if (gw < 0.95) return;
    const hs = k === 1 ? pop(u, 0.9) : 1;
    card(330, 222, 200, 50, { text: 'HttpServer::new', fs: 15, mono: true, fw: 700, s: hs });
    pill(330, 290, '|| App::new()…', ACC, k === 1 ? pop(u, 1.4) : 1, { mono: true, fs: 14 });
    if (k === 1) { sub(330, 334, '클로저를 받아 두기만 한다 · 아직 bind 전', fade(u, 1.9), { 'font-size': 14 }); return; }
    // 워커마다 App 한 벌
    LANES.forEach((y, i) => { const a = k === 2 ? 0.3 + i * 0.45 : -1, land = k === 2 ? seg(u, a + 0.5, a + 0.9) : 1;
      el('rect', { x: 560, y: y - 28, width: 360, height: 56, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      tx(578, y + 5, i === 2 ? '워커 3 …' : `워커 ${i + 1}`, { 'font-size': 14, 'font-weight': 700, fill: MUT });
      if (k === 2) { grow(400, 290, 650, y, E(u, a, a + 0.5), ACC, { sw: 1.8 }); fly(400, 290, 735, y, seg(u, a, a + 0.6), 'App', { mono: true }); }
      if (land > 0) { card(735, y, 222, 38, { rx: 8, text: 'App · GET /hello → hello', fs: 13.5, mono: true, stroke: ACC, s: k === 2 ? pop(u, a + 0.5) : 1 }); } });
    if (k === 2) { note(560, 392, '워커마다 App 이 따로 · 공유가 없어 락도 없다', fade(u, 2.0), { 'font-size': 14, fill: ACC }); return; }
    // k3: 소켓을 잡고 요청을 받는다
    const ss = pop(u, 0.2);
    card(120, 222, 150, 50, { text: 'bind :8080', fs: 15, mono: true, fw: 700, stroke: GOOD, s: ss });
    sub(120, 266, '127.0.0.1:8080', fade(u, 0.4), { 'font-size': 14, class: 'mono' });
    grow(196, 222, 228, 222, E(u, 0.5, 0.8), GOOD);
    LANES.forEach((y, i) => { const r = [[30, 262], [200, 262], [450, 262], [600, y]];
      for (let j = 0; j < 2; j++) dot(r, ((t * 0.45 + i / 3 + j / 2) % 1) * (u > 0.9 ? 1 : 0), INFO, 5);
      status(890, y, 200, pop(u, 1.1 + i * 0.2), { fs: 13.5 }); });
    banner(330, 362, 'run().await · 요청 수신 중', pop(u, 1.6)); }

  // ---------- 2. 라우팅 · 핸들러 ----------
  const GU = ['async fn get_user(path: web::Path<u32>)', '    -> impl Responder {', '    let id = path.into_inner();', '    format!("user id = {}", id)', '}'];
  const ATTR = '#[get("/users/{id}")]';
  function s2(t, c) { const { k, u } = c, X = 24, Y = 92;
    snippet(X, Y, GU, { fs: 14, op: k === 0 ? fade(u, 0.1) : 1 });
    // 매크로 스티커
    if (k === 0) { fly(640, 40, X + 18 + tw(ATTR, 14) / 2, 66, seg(u, 0.4, 1.3), ATTR, { mono: true, stay: true }); }
    else card(X + 18 + tw(ATTR, 14) / 2, 66, tw(ATTR, 14) + 24, 28, { rx: 14, fill: ACC, stroke: 'none', text: ATTR, fs: 13.5, fw: 700, color: PANEL, mono: true });
    if (k === 0) { note(470, 140, '경로와 메서드가 함수 바로 위에 붙는다', fade(u, 1.5));
      pill(520, 190, 'GET', ACC, pop(u, 1.8), { mono: true }); pill(640, 190, '/users/{id}', ACC, pop(u, 2.0), { mono: true }); return; }
    if (k === 1) { const o1 = fade(u, 0.3), o2 = fade(u, 1.2);
      mark(X, Y, 0, 24, 14, 14, ACC, o1); el('rect', { x: 470, y: 140, width: 16, height: 16, rx: 3, fill: ACC, opacity: o1 });
      mono(496, 154, 'web::Path<u32>', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: o1 }); note(496, 180, '{id} 를 u32 로 뽑는다', o1);
      mark(X, Y, 1, 7, 14, 14, INFO, o2); el('rect', { x: 470, y: 210, width: 16, height: 16, rx: 3, fill: INFO, opacity: o2 });
      mono(496, 224, 'impl Responder', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: o2 }); note(496, 250, '반환값은 HTTP 응답이 된다', o2);
      sub(496, 300, '시그니처가 곧 요청·응답 계약', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    if (k === 2) { // 요청이 템플릿에 맞춰진다
      req(700, 60, 'GET /users/42', pop(u, 0.2));
      card(560, 150, 110, 40, { rx: 6, text: '/users/', fs: 15, mono: true, stroke: GRID });
      card(680, 150, 90, 40, { rx: 6, text: u > 1.1 ? '42' : '{id}', fs: 15, mono: true, stroke: ACC, color: u > 1.1 ? ACC : MUT, fw: 700 });
      fly(745, 60, 680, 150, seg(u, 0.5, 1.1), '42', { mono: true });
      mono(560, 228, 'id = 42', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.3) });
      grow(640, 222, 700, 222, E(u, 1.5, 1.8), MUT);
      mono(716, 228, '"user id = 42"', { 'font-size': 16, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) });
      status(620, 280, '200 OK', pop(u, 2.1)); sub(700, 285, 'String 도 Responder', fade(u, 2.3), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    // 라우팅 표
    const ty = 140;
    zone(470, ty, 466, 92, 'App 라우팅 표', { fill: SOFT });
    const rowOn = k === 3 ? fade(u, 0.9) : 1;
    mono(490, ty + 62, 'GET /users/{id}', { 'font-size': 15, 'font-weight': 700, opacity: rowOn });
    mono(690, ty + 62, '→ get_user', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: rowOn });
    if (k === 3) { mono(490, 60, 'App::new().service(get_user)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      dot([[600, 72], [600, ty + 40]], seg(u, 0.4, 0.9), ACC, 6);
      [[ '.service(get_user) 있음', 200], ['#[get] 만 붙이고 등록 안 함', 404]].forEach(([s, code], i) => { const y = 290 + i * 54, o = fade(u, 1.3 + i * 0.5);
        req(560, y, 'GET /users/42', o > 0 ? 1 : 0, { op: o, fs: 13.5 }); note(640, y + 5, s, o, { 'font-size': 14 }); status(900, y, code, pop(u, 1.5 + i * 0.5)); });
      return; }
    // k4: 두 등록 방식 → 같은 표
    mono(520, 300, 'A  .service(get_user)', { 'font-size': 14, opacity: fade(u, 0.2) });
    mono(520, 344, 'B  .route("/users/{id}", web::get().to(get_user))', { 'font-size': 14, opacity: fade(u, 0.7) });
    grow(506, 295, 540, ty + 96, E(u, 0.4, 0.9), ACC); grow(506, 339, 520, ty + 96, E(u, 0.9, 1.4), ACC);
    pill(800, 262, '결과는 같은 한 줄', GOOD, pop(u, 1.6), { fs: 14 });
    sub(700, 396, '팀에서 한 방식으로 맞춘다', fade(u, 2.0), { 'font-size': 14 }); }

  // ---------- 3. 추출자 ----------
  const SLOT = [{ x: 170, h: 'web::Path<u32>', f: ['oid: u32'], v: ['42'] }, { x: 480, h: 'web::Query<Page>', f: ['page: u32', 'size: u32'], v: ['2', '20'] },
    { x: 790, h: 'web::Json<NewUser>', f: ['name: String', 'email: String'], v: ['"Alice"', '"alice@ex.com"'] }];
  const FAIL = [['/orgs/abc', 404], ['size 빠짐', 400], ['email 빠짐', 400]];
  function slot(i, s, filled) { const d = SLOT[i], y = 196, w = 286, h = 128;
    card(d.x, y + h / 2, w, h, { rx: 10, stroke: i === 0 ? INFO : i === 1 ? WARN : ACC, sw: 2, s });
    if (s < 0.9) return;
    mono(d.x - w / 2 + 14, y + 26, d.h, { 'font-size': 14.5, 'font-weight': 700 });
    d.f.forEach((f, j) => { const yy = y + 62 + j * 36, on = filled[j];
      mono(d.x - w / 2 + 14, yy, f, { 'font-size': 14, fill: MUT });
      el('rect', { x: d.x + 6, y: yy - 19, width: w / 2 - 20, height: 28, rx: 5, fill: on > 0 ? ACCBG : PANEL, stroke: GRID, 'stroke-width': 1.2 });
      if (on > 0) mono(d.x + 14, yy, d.v[j], { 'font-size': 14, 'font-weight': 700, fill: INK, opacity: on }); }); }
  function s3(t, c) { const { k, u } = c;
    zone(24, 20, 640, 96, 'HTTP 요청', { fill: SOFT });
    R.spans(44, 70, [['POST ', { fill: MUT }], ['/orgs/42', { fill: INFO, 'font-weight': 700 }], ['?page=2&size=20', { fill: WARN, 'font-weight': 700 }]], { 'font-size': 16 });
    R.spans(44, 100, [['{"name":"Alice","email":"alice@ex.com"}', { fill: ACC }]], { 'font-size': 15 });
    const f0 = k > 1 ? 1 : k === 1 ? fade(u, 1.1) : 0, fq = k > 2 ? 1 : k === 2 ? [fade(u, 1.0), fade(u, 1.5)] : [0, 0], fb = k > 3 ? 1 : k === 3 ? fade(u, 1.1) : 0;
    slot(0, k === 0 ? 0 : k === 1 ? pop(u, 0.1) : 1, [f0]);
    slot(1, k === 0 ? pop(u, 0.3) : 1, Array.isArray(fq) ? fq : [fq, fq]);
    slot(2, k === 0 ? pop(u, 0.8) : 1, [fb, fb]);
    if (k === 0) { note(700, 64, '받을 모양을 먼저 적는다', fade(u, 1.4)); sub(700, 92, 'serde Deserialize = 입력 스키마', fade(u, 1.7), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    if (k === 1) fly(100, 136, 200, 258, seg(u, 0.4, 1.1), '42', { mono: true, fill: INFO });
    if (k === 2) { fly(230, 136, 520, 258, seg(u, 0.3, 1.0), 'page=2', { mono: true, fill: WARN }); fly(330, 136, 520, 294, seg(u, 0.8, 1.5), 'size=20', { mono: true, fill: WARN }); }
    if (k === 3) { fly(250, 136, 820, 276, seg(u, 0.3, 1.1), '{…}', { mono: true });
      el('line', { x1: 24, y1: 346, x2: 936, y2: 346, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '8 6', opacity: fade(u, 1.4) });
      FAIL.forEach(([s, code], i) => { const x = SLOT[i].x, o = fade(u, 1.6 + i * 0.25);
        mono(x - 40, 380, s, { 'font-size': 14, 'text-anchor': 'middle', opacity: o }); grow(x + 10, 375, x + 50, 375, o, MUT, { sw: 1.6 }); status(x + 84, 375, code, pop(u, 1.7 + i * 0.25), { fs: 13.5 }); });
      sub(800, 410, '핸들러 본문은 실행되지 않는다', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k >= 4) { const o = fade(u, 0.3);
      mono(44, 380, 'format!(…)', { 'font-size': 15, opacity: o }); grow(150, 375, 200, 375, E(u, 0.5, 0.8), MUT);
      mono(212, 380, '"org=42 page=2 name=Alice"', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      status(520, 375, '200 OK', pop(u, 1.2));
      ['id.parse::<u32>()?', 'if page.is_none() { … }'].forEach((s, i) => { const y = 54 + i * 30;
        mono(700, y, s, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5 + i * 0.2) });
        el('line', { x1: 698, y1: y - 5, x2: 698 + tw(s, 14) * E(u, 1.9 + i * 0.2, 2.3 + i * 0.2), y2: y - 5, stroke: BAD, 'stroke-width': 2 }); });
      sub(800, 112, '손으로 짜던 파싱·검사가 사라진다', fade(u, 2.3), { 'font-size': 14 }); } }

  // ---------- 4. web::Data · Arc · Mutex ----------
  const ST = { x: 600, y: 120, w: 330, h: 150 };
  function appState(o) { o = o || {}; const { x, y, w, h } = ST, s = o.s ?? 1;
    const g = R.G(x + w / 2, y + h / 2, s); el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }, g);
    if (s < 0.9) return;
    tx(x + 16, y + 26, 'AppState', { 'font-size': 15, 'font-weight': 800 }); tx(x + w - 14, y + 26, o.title || '', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    mono(x + 16, y + 66, 'app_name: String', { 'font-size': 14, opacity: o.f1 ?? 1 }); mono(x + 226, y + 66, '"api"', { 'font-size': 14, 'font-weight': 700, opacity: o.f1 ?? 1 });
    mono(x + 16, y + 112, 'counter: Mutex<u32>', { 'font-size': 14, opacity: o.f2 ?? 1 });
    lock(x + 240, y + 108, !!o.locked, o.locked ? GOOD : MUT, (o.f2 ?? 1) > 0 ? 0.8 : 0);
    mono(x + 272, y + 113, String(o.n ?? 0), { 'font-size': 20, 'font-weight': 800, fill: o.hot ? ACC : INK, opacity: o.f2 ?? 1 }); }
  const WY = [170, 250, 330];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { appState({ s: pop(u, 0.2), f1: fade(u, 0.8), f2: fade(u, 1.3), title: '공유할 값' });
      note(60, 186, 'app_name · 읽기만 → 그대로', fade(u, 1.0)); note(60, 232, 'counter · 여러 워커가 고친다 → Mutex', fade(u, 1.5), { fill: ACC });
      sub(480, 340, 'Mutex 없이 &mut 를 나눠 줄 수는 없다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 1) { snippet(24, 40, ['async fn hit(data: web::Data<AppState>)'], { fs: 14.5 }); appState({ n: 0 });
      mark(24, 40, 0, 13, 25, 14.5, ACC, fade(u, 0.4));
      const p = E(u, 0.6, 1.5); el('path', { d: `M${ST.x},${ST.y + 40} C 480,170 300,140 ${lerp(ST.x, 230, p)},${lerp(ST.y + 40, 82, p)}`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: p > 0 ? 1 : 0 });
      note(60, 200, '등록된 상태가 인자로 들어온다', fade(u, 1.6)); sub(60, 230, '전역 변수 없이', fade(u, 1.9), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    // 워커 레인
    WY.forEach((y, i) => { el('rect', { x: 24, y: y - 26, width: 300, height: 52, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      tx(40, y + 5, `워커 ${i + 1}`, { 'font-size': 14, 'font-weight': 700, fill: MUT }); });
    if (k === 2) { const got = seg(u, 0.5, 0.8) > 0 && u < 2.3, n = Math.round(tween(2, 3, u - 0.6, 0.6));
      appState({ n, locked: got, hot: u > 1.0, title: '요청 3번째' });
      dot([[300, WY[0]], [ST.x, ST.y + 108]], seg(u, 0.2, 0.7), ACC, 7);
      [1, 2].forEach((i) => { const p = E(u, 0.4, 0.9); el('circle', { cx: lerp(300, 470, p), cy: lerp(WY[i], 250 + i * 26, p), r: 7, fill: WARN });
        if (got) note(490, 256 + i * 26, i === 1 ? 'lock 대기' : '', 1, { 'font-size': 14, fill: WARN }); });
      pill(150, 106, '"api hit #3"', ACC, pop(u, 1.6), { mono: true }); grow(ST.x, ST.y + 108, 262, 118, E(u, 1.3, 1.7), ACC, { sw: 1.8 });
      sub(765, 300, '스코프가 끝나면 잠금이 풀린다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 3) { appState({ n: 3, title: '힙에 하나' });
      WY.forEach((y, i) => { const s = pop(u, 0.2 + i * 0.3); pill(220, y, 'Data', ACC, s, { mono: true, fs: 13.5 });
        grow(258, y, ST.x - 4, ST.y + 75 + (i - 1) * 30, E(u, 0.5 + i * 0.3, 1.0 + i * 0.3), ACC, { dash: '5 4', sw: 1.8 }); });
      note(ST.x, 320, 'Data = Arc · clone 은 포인터 복사', fade(u, 1.6), { fill: ACC });
      sub(ST.x, 350, '실제 값은 하나 · 워커마다 Data::new 하면 갈라진다', fade(u, 2.1), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    // k4: app_data 로 등록
    appState({ n: 3, title: 'app_data 로 등록' });
    mono(24, 60, 'App::new().app_data(state.clone())', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
    WY.forEach((y, i) => { pill(220, y, 'Data', ACC, 1, { mono: true, fs: 13.5 }); status(290, y, 200, pop(u, 0.6 + i * 0.15), { fs: 13.5 }); });
    zone(360, 300, 576, 104, 'app_data 를 빼먹으면', { fill: BADBG, color: BAD, op: fade(u, 1.3) });
    status(410, 356, 500, pop(u, 1.5));
    mono(452, 361, 'Requested application data is', { 'font-size': 13.5, opacity: fade(u, 1.7) });
    mono(452, 383, 'not configured correctly.', { 'font-size': 13.5, opacity: fade(u, 1.7) });
    sub(800, 330, '컴파일은 통과한다', fade(u, 2.2), { 'font-size': 14, fill: BAD, 'font-weight': 700 }); }

  // ---------- 5. JSON 응답 · 에러 ----------
  const FIND = ['async fn find(path: web::Path<u32>)', '    -> Result<web::Json<User>, ApiError>'];
  function s5(t, c) { const { k, u } = c;
    // 왼쪽 위: User · 오른쪽 위: JSON
    const o0 = k === 0 ? fade(u, 0.2) : 1;
    snippet(24, 24, ['#[derive(Serialize)]', 'struct User { id: u32, name: String }'], { fs: 14, op: o0 });
    const jx = 560;
    if (k === 0) { grow(400, 60, jx - 10, 60, E(u, 0.8, 1.3), ACC);
      mono(jx, 52, 'Content-Type: application/json', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3) });
      mono(jx, 82, '{"id":7,"name":"Alice"}', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      sub(jx, 112, 'web::Json(User{…}) 로 감싸면 직렬화', fade(u, 2.0), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    // 왼쪽 아래: ApiError
    const o1 = k === 1 ? fade(u, 0.2) : 1;
    snippet(24, 290, ['#[derive(Debug, Display)]', 'enum ApiError { #[display("not found")] NotFound }'], { fs: 13.5, op: o1 });
    if (k === 1) { note(560, 330, 'Display → "not found"', fade(u, 1.0), { class: 'mono' }); sub(560, 360, '실패 사유를 문자열 대신 변형으로', fade(u, 1.5), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    // 오른쪽 아래: 404 도장
    const s404 = k === 2 ? pop(u, 0.6) : 1;
    status(620, 336, '404 Not Found', s404); mono(700, 341, '"user not found"', { 'font-size': 15, opacity: k === 2 ? fade(u, 1.0) : 1 });
    if (k === 2) { mono(560, 280, 'impl ResponseError for ApiError', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.2) });
      sub(700, 390, '상태코드가 에러 타입에 붙는다', fade(u, 1.6), { 'font-size': 14 }); return; }
    // 가운데: Result 갈래
    snippet(24, 160, FIND, { fs: 14, op: k === 3 ? fade(u, 0.1) : 1 });
    const gx = 400, gy = 190, gu = k === 3 ? E(u, 0.5, 1.3) : 1;
    el('path', { d: `M${gx},${gy} C ${gx + 60},${gy} ${jx - 80},70 ${lerp(gx, jx - 12, gu)},${lerp(gy, 70, gu)}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.5 });
    el('path', { d: `M${gx},${gy} C ${gx + 60},${gy} ${jx - 80},336 ${lerp(gx, jx - 12, gu)},${lerp(gy, 336, gu)}`, fill: 'none', stroke: WARN, 'stroke-width': 2.5 });
    tx(470, 118, 'Ok', { 'font-size': 15, 'font-weight': 800, fill: GOOD, class: 'mono', opacity: gu });
    tx(470, 286, 'Err', { 'font-size': 15, 'font-weight': 800, fill: WARN, class: 'mono', opacity: gu });
    status(jx + 30, 112, 200, 1); mono(jx, 82, '{"id":7,"name":"Alice"}', { 'font-size': 16, 'font-weight': 700, fill: ACC });
    if (k === 3) { sub(200, 260, '성공·실패가 시그니처에 같이 적힌다', fade(u, 1.6), { 'font-size': 14 }); return; }
    // k4: 두 요청
    req(150, 248, 'GET /find/0', pop(u, 0.2), { fs: 13.5 }); req(320, 248, 'GET /find/7', pop(u, 0.4), { fs: 13.5 });
    dot([[gx, gy], [480, 280], [jx - 12, 336]], seg(u, 0.7, 1.5), WARN, 7);
    dot([[gx, gy], [480, 100], [jx - 12, 70]], seg(u, 1.3, 2.1), GOOD, 7);
    note(780, 300, 'id == 0', fade(u, 1.5), { class: 'mono', fill: WARN }); note(780, 150, 'id == 7', fade(u, 2.1), { class: 'mono', fill: GOOD }); }

  // ---------- 6. 실무 함정 ----------
  function laneBox(x, y, w, label, op) { el('rect', { x, y: y - 20, width: w, height: 40, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op ?? 1 }); tx(x + 10, y + 5, label, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op ?? 1 }); }
  function s6(t, c) { const { k, u } = c;
    if (k <= 1) { const opL = k === 1 ? 0.35 : 1;
      // 왼쪽: 직접 호출
      zone(24, 40, 440, 260, '핸들러 안에서 바로 계산', { fill: BADBG, color: BAD, op: opL });
      laneBox(40, 110, 408, '워커', opL); const bw = (k === 0 ? E(u, 0.3, 2.4) : 1) * 300;
      el('rect', { x: 120, y: 98, width: bw, height: 24, rx: 5, fill: BAD, opacity: 0.8 * opL });
      mono(128, 115, 'sum 0..10억', { 'font-size': 13.5, fill: PANEL, opacity: bw > 110 ? opL : 0 });
      for (let i = 0; i < 4; i++) el('circle', { cx: 140 + i * 26, cy: 176, r: 7, fill: WARN, opacity: (k === 0 ? fade(u, 0.6 + i * 0.3) : 1) * opL });
      note(140, 214, '다른 요청 4건이 줄을 선다', (k === 0 ? fade(u, 1.8) : 1) * opL, { fill: BAD, 'font-size': 14 });
      // 오른쪽: web::block
      zone(496, 40, 440, 260, 'web::block 으로 넘김', { fill: GOODBG, color: GOOD });
      laneBox(512, 110, 408, '워커'); laneBox(512, 200, 408, '스레드풀');
      const pw = (k === 0 ? E(u, 0.3, 2.4) : 1) * 300;
      el('rect', { x: 600, y: 188, width: pw, height: 24, rx: 5, fill: WARN, opacity: 0.85 });
      mono(608, 205, 'sum 0..10억', { 'font-size': 13.5, fill: PANEL, opacity: pw > 110 ? 1 : 0 });
      const ticks = k === 0 ? Math.floor(E(u, 0.4, 2.4) * 9) : 9;
      for (let i = 0; i < ticks; i++) el('rect', { x: 600 + i * 34, y: 100, width: 24, height: 20, rx: 4, fill: GOOD, opacity: 0.85 });
      note(600, 266, '그사이 워커는 다른 요청을 계속 처리', k === 0 ? fade(u, 1.6) : 1, { fill: GOOD, 'font-size': 14 });
      if (k === 1) { fly(780, 236, 700, 340, seg(u, 0.3, 1.2), '499999999500000000', { mono: true, stay: true, fill: ACC });
        mono(500, 392, '.await → "sum = 499999999500000000"', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); status(880, 386, 200, pop(u, 1.8)); }
      return; }
    if (k === 2) { // Logger 가 모든 라우트를 감싼다
      const ring = E(u, 0.2, 1.0);
      el('rect', { x: 60, y: 60, width: 420, height: 300, rx: 24, fill: 'none', stroke: ACC, 'stroke-width': 4, 'stroke-dasharray': `${ring * 1440} 1440` });
      tx(80, 88, 'wrap(Logger::default())', { 'font-size': 15, 'font-weight': 700, fill: ACC, class: 'mono', opacity: fade(u, 0.8) });
      const RT = [['GET /hello', 200], ['GET /users/42', 200], ['GET /find/0', 404]];
      RT.forEach(([r, code], i) => { const y = 150 + i * 70; card(270, y, 300, 44, { rx: 8, text: r, fs: 15, mono: true, stroke: GRID });
        dot([[24, y], [60, y], [120, y]], seg(u, 0.9 + i * 0.4, 1.3 + i * 0.4), INFO, 6); });
      R.terminal(520, 90, 416, 200, RT.map(([r, code]) => `"${r}" ${code}`), clamp((u - 1.1) / 0.4, 0, 3), { title: 'Logger 로그 (요약)' });
      sub(728, 330, '핸들러마다 로깅 코드를 넣지 않는다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k3: 추출 실패 응답 통제
    req(170, 60, 'POST /orgs/42', pop(u, 0.1)); mono(260, 66, '{"name":"A"}', { 'font-size': 15, fill: ACC, opacity: fade(u, 0.3) });
    sub(560, 66, 'email 필드가 없다', fade(u, 0.5), { 'text-anchor': 'start', 'font-size': 14, fill: WARN });
    [['기본', 'Json deserialize error: missing field', '`email` at line 1 column 12', BAD], ['JsonConfig.error_handler', '400 · 본문 형식을 우리가 정한다', '(이 코드는 빈 본문 .finish())', GOOD]].forEach(([h, a, b, col], i) => {
      const y = 130 + i * 140, s = pop(u, 0.7 + i * 0.6);
      card(480, y + 50, 912, 112, { rx: 10, stroke: col, sw: 2, s });
      if (s < 0.9) return;
      tx(44, y + 26, h, { 'font-size': 15, 'font-weight': 800, fill: col }); status(880, y + 22, 400, 1, { fs: 13.5 });
      mono(44, y + 62, a, { 'font-size': 14 }); mono(44, y + 88, b, { 'font-size': 14, fill: i ? MUT : INK }); }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'HttpServer::new에 App을 클로저로 넘기는 이유는 무엇인가?',
      o: ['App을 한 번만 만들어 모든 워커가 락으로 나눠 쓰려고', '워커 스레드마다 App을 새로 만들어 공유 없이 돌리려고', 'bind 전에 라우팅 표를 디스크에 저장하려고'], a: 1,
      why: '클로저는 워커마다 한 번씩 불려 App이 워커 수만큼 생긴다. 라우팅 표를 공유하지 않으니 락도 필요 없다.' },
    { q: '#[get("/users/{id}")]만 붙이고 .service(get_user)를 빠뜨리면 GET /users/42는 어떻게 되는가?',
      o: ['200 "user id = 42"', '컴파일 에러로 서버가 뜨지 않는다', '404 Not Found'], a: 2,
      why: '매크로는 경로 정보를 붙일 뿐 등록은 service()가 한다. 실제로 돌려 보면 등록 안 한 경로는 404다.' },
    { q: '/orgs/42?page=2로 size 없이 요청하면 무엇이 나가는가?',
      o: ['400 Query deserialize error: missing field `size`', '200, size는 0으로 채워진다', '핸들러가 돌다가 panic으로 500'], a: 0,
      why: 'Query<Page> 추출이 핸들러 앞에서 실패해 400을 돌려준다. 빠져도 되는 필드는 Option으로 적는다.' },
    { q: 'web::Data<AppState>를 워커마다 clone해도 상태가 하나로 유지되는 이유는 무엇인가?',
      o: ['Data 안이 Arc라 clone이 포인터 복사이기 때문에', 'Mutex가 값을 워커 수만큼 복제하기 때문에', '워커가 실제로는 한 스레드에서 돌기 때문에'], a: 0,
      why: 'web::Data는 Arc로 감싼 값이라 clone하면 참조만 늘고 실체는 하나다. 그 하나를 고칠 때만 Mutex가 필요하다.' },
    { q: 'find가 Err(ApiError::NotFound)를 돌려주면 클라이언트는 무엇을 받는가?',
      o: ['200과 빈 본문', 'error_response가 정한 404와 "user not found"', '500 Internal Server Error'], a: 1,
      why: 'ResponseError의 error_response가 응답을 만든다. 실행해 보면 /find/0은 404 "user not found"다.' },
    { q: '핸들러 안에서 10억까지 더하는 동기 연산을 그냥 돌리면 생기는 일은 무엇인가?',
      o: ['컴파일러가 막는다', '그 워커가 막혀 뒤 요청이 줄을 선다', '자동으로 다른 스레드로 옮겨진다'], a: 1,
      why: 'async 워커 스레드는 await 지점에서만 다른 일로 넘어간다. 긴 동기 연산은 web::block으로 스레드풀에 넘긴다.' },
  ];

  const summary = [
    'Actix는 워커마다 App을 새로 만들고, 핸들러는 impl Responder를 돌려주는 async fn이다.',
    '#[get]을 붙인 핸들러도 service()로 등록해야 한다. 빠뜨리면 404가 난다.',
    'Path·Query·Json 추출에 실패하면 핸들러 전에 404나 400이 나간다.',
    '공유 상태는 web::Data로 넣고, 고칠 값은 Mutex로 감싸고, 무거운 동기 연산은 web::block으로 보낸다.',
  ];
  const review = [
    { q: '/users/abc 요청이 400이 아니라 404로 돌아왔다. 먼저 의심할 것은?',
      o: ['Path<u32> 추출 실패에 대한 Actix 기본 응답', '라우팅 표에 /users가 등록되지 않은 것', 'Json 본문이 비어 있는 것'], a: 0,
      why: 'Actix는 Path를 u32로 못 바꾸면 기본으로 404를 준다. 실행해 보면 본문은 can not parse "abc" to a u32다.' },
    { q: '배포 후 카운터 엔드포인트만 500을 낸다. 로컬 단위 테스트는 핸들러를 직접 불러 통과했다. 먼저 볼 곳은?',
      o: ['Mutex lock이 너무 오래 잡히는지', 'App에 app_data(state.clone())가 빠졌는지', 'ResponseError의 상태코드'], a: 1,
      why: 'Data 추출자는 등록된 값을 찾지 못하면 컴파일은 통과하고 실행 중에 500을 낸다. 등록과 사용은 짝이다.' },
    { q: '보고서 엔드포인트가 도는 동안 /hello까지 느려졌다. 가장 알맞은 처방은?',
      o: ['Logger 미들웨어를 뺀다', '보고서 핸들러를 #[get] 매크로 방식으로 바꾼다', '무거운 계산을 web::block으로 스레드풀에 넘긴다'], a: 2,
      why: '동기 연산이 워커 스레드를 붙잡으면 같은 워커의 다른 요청도 기다린다. web::block은 계산을 다른 스레드로 옮기고 결과만 await한다.' },
  ];

  R.page({ title: 'Actix-web 요청 처리', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
