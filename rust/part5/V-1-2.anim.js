/* V-1-2 Axum 라우터 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 응답·에러 문구는 axum 0.7.9 로 페이지 코드를 실제로 돌리고 컴파일한 결과다 (레이어 순서, E0277, E0308, ?admin=1 → 400 …). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, snippet, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const scol = (code) => (code >= 500 ? BAD : code >= 400 ? WARN : GOOD);
  const status = (cx, cy, code, s, o) => pill(cx, cy, String(code), scol(parseInt(code, 10)), s, Object.assign({ mono: true, fs: 15 }, o || {}));
  const req = (cx, cy, s, sc, o) => pill(cx, cy, s, INFO, sc, Object.assign({ mono: true, fs: 14, fill: INFOBG }, o || {}));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));

  // ---------- 1. Router ----------
  const ROUTES = [['"/"', 'hello'], ['"/users/:id"', 'show_user']];
  function table(x, y, o) { o = o || {}; zone(x, y, 400, 132, 'Router 라우팅 표', { fill: SOFT });
    ROUTES.forEach(([p, h], i) => { const yy = y + 62 + i * 40, op = o.rows ? o.rows(i) : 1, hot = o.hot === i, miss = o.miss === i;
      if (hot) el('rect', { x: x + 8, y: yy - 22, width: 384, height: 34, rx: 6, fill: ACCBG });
      mono(x + 20, yy, `get  ${p}`, { 'font-size': 15, 'font-weight': 700, opacity: op, fill: miss ? OFF : INK });
      mono(x + 250, yy, `→ ${h}`, { 'font-size': 15, fill: miss ? OFF : ACC, 'font-weight': 700, opacity: op }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { snippet(40, 40, ['[dependencies]', 'axum = "0.7"', 'tokio = { version = "1", features = ["full"] }'], { fs: 14.5, op: fade(u, 0.1) });
      pill(200, 210, 'axum 0.7', ACC, pop(u, 0.7), { mono: true, fs: 16 }); pill(420, 210, 'tokio · full', INFO, pop(u, 1.0), { mono: true, fs: 16 });
      sub(420, 246, '#[tokio::main] · TcpListener 가 여기서 온다', fade(u, 1.3), { 'font-size': 14 });
      mono(40, 320, 'use axum::{routing::get, Router};', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.7) });
      ['get', 'Router'].forEach((s, i) => pill(560 + i * 110, 315, s, ACC, pop(u, 2.0 + i * 0.2), { mono: true })); return; }
    if (k === 1) { snippet(40, 40, ["async fn hello() -> &'static str {", '    "Hello, Axum!"', '}'], { fs: 14.5 });
      grow(410, 76, 500, 76, E(u, 0.4, 0.8), MUT);
      card(600, 76, 180, 44, { text: 'Future', fs: 16, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.7) });
      // tokio 런타임: 퓨처를 polling 하는 바퀴
      const cx = 600, cy = 250, r = 70, a = t * 2.4;
      el('circle', { cx, cy, r, fill: 'none', stroke: INFO, 'stroke-width': 3, 'stroke-dasharray': '10 8', opacity: fade(u, 1.0) });
      el('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 8, fill: INFO, opacity: fade(u, 1.0) });
      tx(cx, cy + 6, 'tokio', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.0) });
      grow(600, 100, 600, 175, E(u, 1.1, 1.5), INFO);
      mono(720, 256, '→ "Hello, Axum!"', { 'font-size': 16, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(240, 200, 'async fn 을 부르면 Future 가 생기고', fade(u, 0.9), { 'font-size': 14 }); sub(240, 226, 'tokio 가 그것을 돌려 값을 얻는다', fade(u, 1.5), { 'font-size': 14 }); return; }
    if (k === 2) { table(40, 140, { rows: (i) => fade(u, 0.2 + i * 0.4), hot: u > 1.9 ? 1 : null, miss: u > 1.5 ? 0 : null });
      req(240, 60, 'GET /users/42', pop(u, 0.9));
      dot([[240, 80], [240, 200], [240, 242]], seg(u, 1.1, 1.9), INFO, 7);
      if (u > 1.5) cross(470, 196, 9, pop(u, 1.5)); if (u > 1.9) check(470, 236, 10, pop(u, 1.9));
      mono(520, 242, ':id = 42', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) });
      sub(700, 340, '매크로 없이 표 한 덩어리로 경로가 보인다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k3: bind → serve
    card(150, 110, 220, 54, { text: 'TcpListener', fs: 16, mono: true, fw: 700, stroke: GOOD, s: pop(u, 0.2) });
    mono(150, 160, '0.0.0.0:3000', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    grow(262, 110, 380, 110, E(u, 0.6, 1.0), GOOD);
    card(480, 110, 200, 54, { text: 'axum::serve', fs: 16, mono: true, fw: 700, stroke: ACC, s: pop(u, 0.9) });
    table(200, 190, {});
    req(150, 300, 'GET /', pop(u, 1.3)); dot([[150, 280], [150, 252], [300, 252]], seg(u, 1.4, 2.0), INFO, 7);
    status(780, 252, '200 OK', pop(u, 2.0)); mono(780, 290, 'text/plain; charset=utf-8', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
    mono(780, 320, '"Hello, Axum!"', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  // ---------- 2. 추출자 ----------
  const ARG = [{ x: 170, h: 'Path(id): Path<u64>', v: 'id = 42', col: INFO, part: '머리' }, { x: 480, h: 'Query(p): Query<Params>', v: 'p.admin = true', col: WARN, part: '머리' },
    { x: 790, h: 'Json(body): Json<NewUser>', v: 'body.name = "Alice"', col: ACC, part: '본문' }];
  function argSlot(i, s, val) { const a = ARG[i], y = 250; card(a.x, y, 290, 92, { rx: 10, stroke: a.col, sw: 2.2, s });
    if (s < 0.9) return; mono(a.x, y - 18, a.h, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
    tx(a.x + 132, y - 52, a.part === '본문' ? '본문을 소비' : '요청 머리만 읽음', { 'font-size': 13.5, fill: a.col, 'text-anchor': 'end', 'font-weight': 700 });
    if (val > 0) mono(a.x, y + 22, a.v, { 'font-size': 15, 'font-weight': 700, fill: a.col, 'text-anchor': 'middle', opacity: val }); }
  function s2(t, c) { const { k, u } = c;
    zone(24, 20, 600, 92, 'HTTP 요청', { fill: SOFT });
    R.spans(44, 66, [['POST ', { fill: MUT }], ['/users/42', { fill: INFO, 'font-weight': 700 }], ['?admin=true', { fill: WARN, 'font-weight': 700 }]], { 'font-size': 16 });
    const bodyGone = k > 2 || (k === 2 && u > 1.6);
    R.spans(44, 96, [['{"name":"Alice"}', { fill: bodyGone ? OFF : ACC }]], { 'font-size': 15 });
    if (bodyGone) tx(220, 96, '본문 소비됨', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (k === 0) { snippet(60, 160, ['#[derive(Deserialize)]', 'struct Params { admin: bool }'], { fs: 14.5, op: fade(u, 0.3) });
      snippet(500, 160, ['#[derive(Deserialize, Serialize)]', 'struct NewUser { name: String }'], { fs: 14.5, op: fade(u, 0.9) });
      note(60, 330, 'serde 가 쿼리와 본문을 이 타입으로 채운다', fade(u, 1.6)); sub(60, 362, 'admin: bool 은 true/false 만 받는다 (?admin=1 은 400)', fade(u, 2.1), { 'text-anchor': 'start', 'font-size': 14, fill: WARN }); return; }
    argSlot(0, k === 1 ? pop(u, 0.1) : 1, k === 1 ? fade(u, 1.2) : 1);
    argSlot(1, k === 1 ? fade(u, 0.5) * 0.6 : 1, k === 2 ? fade(u, 1.0) : k > 2 ? 1 : 0);
    argSlot(2, k === 1 ? fade(u, 0.5) * 0.6 : 1, k === 2 ? fade(u, 2.0) : k > 2 ? 1 : 0);
    if (k === 1) { fly(120, 136, 170, 270, seg(u, 0.4, 1.1), '42', { mono: true, fill: INFO });
      sub(480, 370, '인자 타입이 곧 파싱 규칙 · :id 가 숫자가 아니면 핸들러 전에 400', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 2) { fly(250, 136, 480, 270, seg(u, 0.3, 0.9), 'admin=true', { mono: true, fill: WARN });
      fly(120, 136, 790, 270, seg(u, 1.0, 1.8), '{"name":"Alice"}', { mono: true });
      sub(480, 370, '본문은 한 번만 읽힌다 · 본문 추출자는 맨 뒤', fade(u, 2.1), { 'font-size': 14, fill: ACC, 'font-weight': 700 }); return; }
    // k3: Json 으로 응답
    grow(480, 300, 480, 340, E(u, 0.2, 0.5), MUT);
    mono(480, 362, 'Json(msg)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    status(110, 394, '200 OK', pop(u, 0.9)); mono(170, 399, 'application/json', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.1) });
    mono(340, 399, '"id=42 admin=true name=Alice"', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) }); }

  // ---------- 3. State ----------
  function arcBox(x, y, label, op) { card(x, y, 150, 44, { rx: 8, text: label, fs: 14.5, mono: true, fw: 700, stroke: ACC, op }); }
  function s3(t, c) { const { k, u } = c;
    // 힙의 DbPool 하나와 그것을 가리키는 AppState 들
    const hx = 760, hy = 110;
    card(hx, hy, 220, 64, { rx: 10, text: 'DbPool', fs: 17, fw: 800, stroke: INK, s: k === 0 ? pop(u, 0.2) : 1 });
    tx(hx + 110, hy - 42, '힙 · 하나', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    if (k === 0) { snippet(40, 40, ['#[derive(Clone)]', 'struct AppState { pool: Arc<DbPool> }'], { fs: 14.5, op: fade(u, 0.1) });
      arcBox(180, 220, 'AppState', pop(u, 0.5)); grow(255, 214, hx - 112, hy + 10, E(u, 0.7, 1.1), ACC);
      arcBox(180, 300, 'clone()', pop(u, 1.4)); grow(255, 296, hx - 112, hy + 26, E(u, 1.6, 2.0), ACC, { dash: '5 4' });
      const n = Math.round(tween(1, 2, u - 1.4, 0.5));
      mono(hx, 230, `Arc::strong_count = ${n}`, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC });
      sub(hx, 262, 'clone 은 참조 수만 올린다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 1) { snippet(40, 40, ['fn app(pool: Arc<DbPool>) -> Router {', '    Router::new()', '        .route("/count", get(count))', '        …', '}'], { fs: 14.5 });
      grow(400, 70, hx - 112, hy, E(u, 0.4, 1.0), ACC);
      note(40, 280, '풀을 인자로 받아 Router 를 돌려준다', fade(u, 1.1)); sub(40, 310, '테스트에서는 서버 없이 app(pool) 만 불러 쓴다', fade(u, 1.7), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    if (k === 2) { // 타입이 바뀐다
      card(200, 220, 260, 64, { rx: 10, text: 'Router<AppState>', fs: 16, mono: true, fw: 800, stroke: WARN });
      sub(200, 276, '상태가 아직 필요하다', 1, { 'font-size': 14, fill: WARN });
      fly(200, 120, 470, 168, seg(u, 0.4, 1.2), 'with_state(AppState { pool })', { mono: true, stay: true });
      grow(330, 220, 600, 220, E(u, 1.3, 1.7), ACC);
      card(720, 220, 220, 64, { rx: 10, text: 'Router<()>', fs: 16, mono: true, fw: 800, stroke: GOOD, s: pop(u, 1.7) });
      sub(720, 276, '이제 serve 할 수 있다', fade(u, 1.9), { 'font-size': 14, fill: GOOD });
      sub(480, 360, 'with_state 의 타입 = 핸들러 State<T> 의 T', fade(u, 2.3), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    // k3: 핸들러에서 꺼내 쓴다
    snippet(40, 200, ['async fn count(State(state): State<AppState>)', '    let n = state.pool.query_count().await;', '    format!("total = {}", n)'], { fs: 14 });
    req(160, 60, 'GET /count', pop(u, 0.2));
    grow(hx - 60, hy + 34, 420, 214, E(u, 0.5, 1.0), ACC, { dash: '5 4' });
    note(520, 260, 'State 가 등록된 AppState 를 꺼내 준다', fade(u, 1.0));
    status(160, 340, '200 OK', pop(u, 1.6)); mono(220, 345, '"total = n"', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
    sub(560, 345, '전역 변수·lazy_static 없이', fade(u, 2.1), { 'text-anchor': 'start', 'font-size': 14 }); }

  // ---------- 4. tower 레이어 ----------
  const OC = { x: 290, y: 220 };
  function ring(r, col, label, s, o) { o = o || {}; if (s <= 0) return; const rr = r * s;
    el('circle', { cx: OC.x, cy: OC.y, r: rr, fill: o.fill || 'none', stroke: col, 'stroke-width': 3, opacity: o.op ?? 1 });
    if (label && s > 0.9) tx(OC.x, OC.y - rr + 22, label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col, opacity: o.op ?? 1 }); }
  function s4(t, c) { const { k, u } = c;
    const LINES = ['Router::new()', '    .route("/", get(hello))', '    .layer(TimeoutLayer::new(', '        Duration::from_secs(10)))', '    .layer(TraceLayer::new_for_http())'];
    if (k === 0) { snippet(480, 40, ['use tower_http::trace::TraceLayer;', 'use tower_http::timeout::TimeoutLayer;'], { fs: 14, op: fade(u, 0.1) });
      [[INFO, 'TraceLayer', '로깅'], [WARN, 'TimeoutLayer', '시간 제한']].forEach(([col, n, d], i) => { const s = pop(u, 0.6 + i * 0.4), x = 160 + i * 230;
        el('circle', { cx: x, cy: 230, r: 70 * s, fill: 'none', stroke: col, 'stroke-width': 10, opacity: 0.85 });
        tx(x, 330, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, class: 'mono', opacity: fade(u, 0.9 + i * 0.4) });
        sub(x, 354, d, fade(u, 1.0 + i * 0.4), { 'font-size': 14 }); });
      sub(700, 200, '직접 짤 것 없이 검증된 레이어를 가져온다', fade(u, 1.8), { 'font-size': 14 }); return; }
    snippet(560, 60, LINES.slice(0, k === 1 ? 2 : k === 2 ? 4 : 5), { fs: 13.5 });
    ring(56, INK, '', 1, { fill: PANEL }); tx(OC.x, OC.y + 6, 'handler', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, class: 'mono' });
    if (k === 1) { const a = -Math.PI / 2 + t * 3; el('line', { x1: OC.x, y1: OC.y - 90, x2: OC.x + 18 * Math.cos(a), y2: OC.y - 90 + 18 * Math.sin(a), stroke: BAD, 'stroke-width': 3 });
      el('circle', { cx: OC.x, cy: OC.y - 90, r: 22, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.4) });
      note(OC.x + 60, OC.y - 84, '느린 요청이 끝없이 매달린다', fade(u, 0.8), { fill: BAD }); sub(OC.x, 380, '레이어 0개', fade(u, 1.4), { 'font-size': 14 }); return; }
    ring(110, WARN, 'Timeout 10s', k === 2 ? spring(seg(u, 0.4, 1.2)) : 1);
    if (k === 2) { note(560, 300, '먼저 붙인 레이어 = 안쪽', fade(u, 1.4), { fill: WARN }); return; }
    ring(165, INFO, 'Trace', k === 3 ? spring(seg(u, 0.4, 1.2)) : 1);
    if (k === 3) { note(560, 300, '나중에 붙인 레이어 = 바깥쪽', fade(u, 1.4), { fill: INFO }); sub(560, 330, '요청을 가장 먼저, 응답을 가장 늦게 본다', fade(u, 1.9), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    // k4: 들어갔다 나온다
    const inn = [[OC.x - 260, OC.y - 20], [OC.x - 165, OC.y - 20], [OC.x - 110, OC.y - 20], [OC.x - 50, OC.y - 20]];
    const out = [[OC.x + 50, OC.y + 20], [OC.x + 110, OC.y + 20], [OC.x + 165, OC.y + 20], [OC.x + 250, OC.y + 20]];
    dot(inn, seg(u, 0.2, 1.1), INFO, 8); dot(out, seg(u, 1.3, 2.2), GOOD, 8);
    [['요청', 'Trace → Timeout → handler', INFO, 0.6], ['응답', 'handler → Timeout → Trace', GOOD, 1.6]].forEach(([h, s, col, a], i) => {
      tx(560, 300 + i * 40, h, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, a) }); mono(610, 300 + i * 40, s, { 'font-size': 14.5, opacity: fade(u, a) }); }); }
  const spring = R.spring;

  // ---------- 5. 실무 함정 ----------
  function sig(x, y, args, ok, s) { // 인자 칸 나열
    let cx = x; args.forEach(([a, col]) => { const w = tw(a, 14) + 24; card(cx + w / 2, y, w, 36, { rx: 8, text: a, fs: 14, mono: true, stroke: col, fw: 700, s }); cx += w + 10; });
    if (s > 0.9) (ok ? check : cross)(cx + 20, y, 11, 1); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tx(40, 60, 'bad', { 'font-size': 16, 'font-weight': 800, fill: BAD, class: 'mono' });
      sig(100, 54, [['Json<Body>', ACC], ['Path<u64>', INFO]], false, pop(u, 0.2));
      terminal(40, 96, 880, 96, [['error[E0277]: the trait bound `fn(Json<Body>, Path<u64>) -> …', '#f87171'], ['  {bad}: Handler<_, _>` is not satisfied', '#f87171']], clamp((u - 0.6) / 0.5, 0, 2), { title: 'cargo build' });
      tx(40, 260, 'good', { 'font-size': 16, 'font-weight': 800, fill: GOOD, class: 'mono', opacity: fade(u, 1.5) });
      sig(110, 254, [['Path<u64>', INFO], ['Json<Body>', ACC]], true, pop(u, 1.6));
      sub(480, 340, '본문을 먹는 추출자(Json·String·Bytes)는 마지막 인자 하나만 될 수 있다', fade(u, 2.1), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1) { // 상태 꽂기: 모양이 맞아야 들어간다
      card(200, 120, 300, 50, { rx: 10, text: 'with_state(AppState{..})', fs: 14.5, mono: true, fw: 700, stroke: ACC });
      card(200, 220, 300, 50, { rx: 10, text: 'State<Other>', fs: 14.5, mono: true, fw: 700, stroke: BAD, s: pop(u, 0.3) });
      cross(380, 170, 12, pop(u, 0.8));
      terminal(440, 70, 480, 128, [['error[E0308]: mismatched types', '#f87171'], 'expected `Other`,', 'found `AppState`'], clamp((u - 0.8) / 0.4, 0, 3), { title: 'cargo build' });
      card(200, 320, 300, 50, { rx: 10, text: 'State<AppState>', fs: 14.5, mono: true, fw: 700, stroke: GOOD, s: pop(u, 1.8) });
      check(380, 320, 11, pop(u, 2.0)); note(440, 326, '타입을 맞추면 통과', fade(u, 2.1), { fill: GOOD }); return; }
    if (k === 2) { mono(40, 56, '.layer(auth).layer(trace)', { 'font-size': 17, 'font-weight': 800 });
      const L = [['  req  -> trace', null], ['  req  -> auth', null], ['  handler', null], ['  resp <- auth', null], ['  resp <- trace', null]];
      terminal(500, 40, 420, 170, L, clamp((u - 0.4) / 0.3, 0, 5), { title: '실행 출력' });
      el('circle', { cx: 220, cy: 250, r: 120, fill: 'none', stroke: INFO, 'stroke-width': 3 }); tx(220, 150, 'trace', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO });
      el('circle', { cx: 220, cy: 250, r: 70, fill: 'none', stroke: BAD, 'stroke-width': 3 }); tx(220, 202, 'auth', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD });
      tx(220, 256, 'handler', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono' });
      note(500, 270, '인증보다 로깅이 먼저 돈다', fade(u, 1.9), { fill: BAD });
      sub(500, 300, '인증을 먼저 태우려면 auth 를 가장 나중에 .layer', fade(u, 2.3), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    [['본문 추출자는 맨 뒤', 'E0277 이면 인자 순서부터'], ['with_state 와 State<T> 일치', 'E0308 이면 상태 타입부터'], ['레이어는 선언 역순', '먼저 돌 것을 나중에 .layer']].forEach(([a, b], i) => {
      const y = 90 + i * 100, s = pop(u, 0.2 + i * 0.4); card(480, y, 640, 76, { rx: 12, stroke: GOOD, sw: 2, s }); if (s < 0.9) return;
      check(200, y, 13, 1); tx(236, y - 4, a, { 'font-size': 17, 'font-weight': 800 }); tx(236, y + 22, b, { 'font-size': 14, fill: MUT }); }); }

  const quiz = [
    { q: 'Axum에서 async fn hello를 route("/", get(hello))로 걸면 실제로 그 함수를 돌리는 것은 무엇인가?',
      o: ['Router가 매 요청마다 새 스레드를 만들어 돌린다', '#[get] 매크로가 만든 래퍼가 돌린다', 'hello가 돌려준 Future를 tokio 런타임이 실행한다'], a: 2,
      why: '핸들러는 async fn이라 부르면 Future가 생긴다. axum::serve 아래의 tokio 런타임이 그 Future를 끝까지 돌려 "Hello, Axum!"을 얻는다.' },
    { q: 'Params { admin: bool }을 Query로 받을 때 ?admin=1 요청은 어떻게 되는가?',
      o: ['admin = true로 들어온다', '핸들러가 불리기 전에 400이 나간다', 'admin = false로 들어온다'], a: 1,
      why: '쿼리 bool은 true/false 문자열만 받는다. 실행해 보면 400 Failed to deserialize query string이 나온다.' },
    { q: 'Router::new().route("/count", get(count))에 with_state(AppState{…})를 붙이면 Router 타입은 어떻게 바뀌는가?',
      o: ['Router<AppState>에서 Router<()>로', 'Router<()>에서 Router<AppState>로', '타입은 그대로 Router<AppState>다'], a: 0,
      why: 'State<AppState>를 요구하는 핸들러가 붙으면 Router<AppState>가 된다. with_state가 상태를 채워 주면 서빙할 수 있는 Router<()>가 된다.' },
    { q: '.layer(TimeoutLayer).layer(TraceLayer) 순서로 붙였을 때 요청을 가장 먼저 보는 것은 무엇인가?',
      o: ['TimeoutLayer', 'handler', 'TraceLayer'], a: 2,
      why: '나중에 붙인 레이어가 바깥 껍질이다. 요청은 Trace, Timeout, handler 순으로 들어가고 응답은 거꾸로 나온다.' },
    { q: 'async fn bad(Json(b): Json<Body>, Path(id): Path<u64>)를 라우트에 걸면 무슨 일이 생기는가?',
      o: ['컴파일 에러 E0277 Handler 미구현', '실행 중 Path가 빈 값을 받는다', '정상 동작하고 순서는 상관없다'], a: 0,
      why: '본문을 소비하는 Json은 마지막 인자만 될 수 있다. 어기면 핸들러가 Handler 트레잇을 만족하지 못해 컴파일이 멈춘다.' },
  ];

  const summary = [
    'Axum은 Router 표로 경로를 async fn에 잇고, tokio가 그 Future를 돌린다.',
    'Path·Query·Json 같은 인자 타입이 곧 파싱 규칙이다. 본문을 먹는 Json은 마지막에 둔다.',
    'with_state로 넣은 타입과 State<T>가 같아야 한다. 다르면 E0308로 컴파일이 멈춘다.',
    '레이어는 나중에 붙인 것이 바깥이라 요청을 먼저 본다.',
  ];
  const review = [
    { q: 'Axum 핸들러를 고친 뒤 the trait Handler<_, _> is not satisfied가 떴다. 먼저 볼 것은?',
      o: ['레이어를 붙인 순서', 'Json 같은 본문 추출자가 마지막 인자인지', 'TcpListener 포트 번호'], a: 1,
      why: 'E0277 Handler 미구현은 인자 중 하나가 추출자 규칙을 어길 때 난다. 본문 추출자가 앞에 있으면 바로 이 에러다.' },
    { q: '모든 요청이 인증 전에 로그에 찍힌다. 코드는 .layer(auth).layer(trace)다. 어떻게 고치나?',
      o: ['.layer(trace).layer(auth)로 순서를 바꾼다', 'auth를 핸들러 인자로 옮긴다', 'TimeoutLayer를 추가한다'], a: 0,
      why: '나중에 붙인 레이어가 바깥이라 지금은 trace가 먼저 돈다. auth를 마지막에 붙이면 요청이 auth를 먼저 지난다.' },
    { q: '프런트가 /users/42?admin=1로 보냈더니 400이 났다. 서버 코드에서 고칠 곳은?',
      o: ['Router의 경로를 /users/:id에서 /users로 바꾼다', 'Json 추출자를 맨 앞으로 옮긴다', 'Params.admin의 타입이나 받는 값 형식을 맞춘다'], a: 2,
      why: 'admin: bool은 true/false만 받는다. 쿼리 추출이 핸들러 앞에서 실패했으니 필드 타입과 보내는 값 형식을 맞춰야 한다.' },
  ];

  R.page({ title: 'Axum 요청 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
