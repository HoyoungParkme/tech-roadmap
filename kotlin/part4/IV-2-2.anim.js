/* IV-2-2 Retrofit + 코루틴 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 대상: 인터페이스 메서드가 만드는 HTTP 요청 줄, 메인/OkHttp 스레드 줄과 멈췄다 이어지는 코루틴,
 * 상태코드를 단 응답 봉투와 닫힌 두 갈래(Ok/Fail), 요청이 지나는 인터셉터 관문, Repository → ViewModel → UI 층. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, server, terminal, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // 응답 봉투: 상태코드가 찍힌 편지
  function envelope(cx, cy, code, o) { o = o || {}; const ok = code >= 200 && code < 300, col = o.col || (ok ? GOOD : BAD), g = G(cx, cy, o.s ?? 1, o.op);
    el('rect', { x: -46, y: -30, width: 92, height: 60, rx: 6, fill: PANEL, stroke: col, 'stroke-width': 2.5 }, g);
    el('path', { d: 'M-46,-30 L0,4 L46,-30', fill: 'none', stroke: col, 'stroke-width': 2 }, g);
    tx(0, 24, String(code), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: col }, g); return g; }
  // 스레드 줄 (메인은 화면 프레임 눈금이 흐른다. blocked 면 멈춘 빨간 눈금)
  function lanes(t, yM, yIO, o) { o = o || {};
    [['Main', yM, INK], ['OkHttp 스레드', yIO, INFO]].forEach(([n, y, col]) => { el('line', { x1: 170, y1: y, x2: 760, y2: y, stroke: GRID, 'stroke-width': 10, 'stroke-linecap': 'round' });
      tx(30, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, fill: col }); });
    for (let i = 0; i < 10; i++) { const x = 170 + ((i * 60 + (o.blocked ? 0 : t * 70)) % 590); el('rect', { x: x - 2, y: yM - 9, width: 4, height: 18, rx: 2, fill: o.blocked ? BAD : GOOD, opacity: 0.8 }); }
    server(870, (yM + yIO) / 2, '서버', { s: 0.7 }); }
  // 작은 폰: 상태(Loading 이면 도는 고리, 얼면 회색)
  function mini(cx, cy, state, t, o) { o = o || {};
    card(cx, cy, 120, 170, { rx: 16, stroke: o.frozen ? BAD : INK, sw: 2.2 });
    if (state === 'loading') { const a = (o.frozen ? 0 : t * 5); el('circle', { cx, cy: cy - 6, r: 20, fill: 'none', stroke: GRID, 'stroke-width': 5 });
      el('path', { d: `M${cx + 20 * Math.cos(a)},${cy - 6 + 20 * Math.sin(a)} A20,20 0 0 1 ${cx + 20 * Math.cos(a + 1.8)},${cy - 6 + 20 * Math.sin(a + 1.8)}`, fill: 'none', stroke: o.frozen ? BAD : ACC, 'stroke-width': 5, 'stroke-linecap': 'round' });
      tx(cx, cy + 40, o.frozen ? '멈춤' : 'Loading', { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.frozen ? BAD : MUT, 'font-weight': 700 }); }
    if (state === 'success') { el('rect', { x: cx - 42, y: cy - 50, width: 84, height: 12, rx: 3, fill: INK }); [0, 1, 2].forEach((i) => el('rect', { x: cx - 42, y: cy - 26 + i * 18, width: 84 - i * 14, height: 8, rx: 3, fill: OFF }));
      tx(cx, cy + 52, 'Post 42', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: GOOD }); }
    if (state === 'error') { cross(cx, cy - 8, 14, 1); tx(cx, cy + 34, '오류 표시', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: BAD }); }
    if (o.label) tx(cx, cy + 104, o.label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT }); }

  // ---------- 1. 인터페이스 = API 명세 ----------
  const METHODS = [
    ['@GET("posts/{id}")', 'getPost(@Path("id") id)'],
    ['@GET("posts")', 'getPosts(@Query("userId"), @Query("page"))'],
    ['@POST("posts")', 'createPost(@Body post)']];
  function s1(t, c) { const { k, u } = c;
    // 왼쪽: 인터페이스 카드
    zone(30, 50, 450, 70 + Math.max(1, k) * 64, '', { fill: SOFT, stroke: ACC, op: k === 0 ? fade(u, 0.2) : 1 });
    mono(48, 80, 'interface PostApi {', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 0.3) : 1 });
    METHODS.forEach(([a, b], i) => { if (i >= k) return; const y = 116 + i * 64, fresh = i === k - 1, op = fresh ? fade(u, 0.2) : 1;
      mono(64, y, a, { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: op }); mono(64, y + 24, 'suspend fun ' + b, { 'font-size': 13.5, opacity: op }); });
    const cnt = k; tx(460, 34, `엔드포인트 ${cnt}개`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: ACC });
    if (k === 0) { ['@GET', '@POST', '@Path', '@Query', '@Body'].forEach((s, i) => pill(560 + (i % 3) * 120, 120 + Math.floor(i / 3) * 56, s, INFO, pop(u, 0.6 + i * 0.2), { mono: true, fs: 15 }));
      sub(680, 250, 'retrofit2.http.* 에서 가져오는 표식들', fade(u, 1.8), { 'font-size': 14.5 });
      tx(480, 360, '메서드 하나 = 엔드포인트 하나, 인자 타입은 컴파일러가 확인한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // 오른쪽: 실제 HTTP 요청 줄을 조립
    const RX = 540; tx(RX, 70, '만들어지는 요청', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    if (k === 1) { mono(RX, 110, 'api.getPost(42)', { 'font-size': 16, 'font-weight': 700, fill: ACC });
      const done = u > 1.5; if (!done) mono(RX, 170, 'GET /posts/', { 'font-size': 20, 'font-weight': 800 });
      const sx = RX + tw('GET /posts/', 20);
      if (!done) { el('rect', { x: sx, y: 150, width: 52, height: 28, rx: 5, fill: WARNBG, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4' }); mono(sx + 26, 170, '{id}', { 'font-size': 15, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700 }); }
      else R.spans(RX, 170, [['GET /posts/', {}], ['42', { fill: ACC }]], { 'font-size': 20, 'font-weight': 800 });
      fly(RX + 118, 104, sx + 20, 164, seg(u, 0.6, 1.5), '42', { mono: true });
      tx(RX, 240, '@Path("id")가 {id} 자리에 인자를 끼운다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(RX, 290, '{id}와 @Path 이름이 다르면', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(RX, 314, '첫 호출 때 IllegalArgumentException', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { mono(RX, 110, 'api.getPosts(userId = 7, page = 2)', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      const f1 = E(u, 0.6, 1.1), f2 = E(u, 1.2, 1.7);
      R.spans(RX, 170, [['GET /posts', {}], ['?userId=7', { fill: ACC, 'fill-opacity': f1 }], ['&page=2', { fill: INFO, 'fill-opacity': f2 }]], { 'font-size': 20, 'font-weight': 800 });
      tx(RX, 240, '@Query 인자가 ?key=value로 붙는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      mono(RX, 290, 'page: Int = 1', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.1) });
      tx(RX + 140, 290, '기본값이 있어 생략 가능', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    // k 3: @Body 객체 → JSON 본문
    mono(RX, 110, 'api.createPost(NewPost("안녕"))', { 'font-size': 15, 'font-weight': 700, fill: ACC });
    mono(RX, 160, 'POST /posts', { 'font-size': 20, 'font-weight': 800 });
    card(RX + 80, 240, 160, 64, { rx: 8, text: 'NewPost\ntitle = "안녕"', fs: 14, mono: true, stroke: INFO, s: pop(u, 0.4) });
    grow(RX + 166, 240, RX + 220, 240, E(u, 0.9, 1.3), MUT); sub(RX + 193, 226, '직렬화', fade(u, 1.0));
    const j = E(u, 1.2, 1.9); if (j > 0) { el('rect', { x: RX + 226, y: 212, width: 170, height: 56, rx: 8, fill: INK, opacity: j });
      mono(RX + 240, 246, '{"title":"안녕"}', { 'font-size': 14, fill: 'var(--term)', opacity: j }); }
    sub(RX + 180, 300, 'NewPost 내용은 예시', fade(u, 1.6));
    tx(RX, 350, '직렬화는 Converter(kotlinx.serialization · Moshi) 몫', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // ---------- 2. suspend: 기다리는 동안 스레드를 놓는다 ----------
  function s2(t, c) { const { k, u } = c, blocked = k === 4 && u > 0.5;
    lanes(t, 80, 170, { blocked });
    // viewModelScope 범위
    el('rect', { x: 160, y: 44, width: 610, height: 76, rx: 10, fill: 'none', stroke: GOOD, 'stroke-width': 1.8, 'stroke-dasharray': '6 5', opacity: k === 0 ? fade(u, 0.2) : 0.6 });
    tx(170, 38, 'viewModelScope', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, class: 'mono' });
    const st = k === 0 ? null : k === 4 ? 'loading' : 'loading';
    mini(860, 285, st, t, { frozen: blocked, label: k === 0 ? '화면' : '_state = Loading' });
    if (k === 0) { pill(260, 80, 'loadPost(42)', ACC, pop(u, 0.5), { mono: true, fs: 14 });
      tx(30, 260, 'launch로 코루틴 하나를 띄운다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(30, 290, '화면이 사라지면 viewModelScope와 함께 취소된다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { pill(320, 80, '_state = Loading', ACC, pop(u, 0.2), { mono: true, fs: 14 });
      tx(30, 260, '요청을 보내기 전에 화면 상태부터 바꾼다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(30, 290, '사용자는 곧바로 로딩 표시를 본다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); return; }
    if (k === 2) { // 코루틴이 멈추고 요청은 OkHttp 줄로
      const park = u > 0.5; pill(400, park ? 120 : 80, park ? '⏸ getPost(42) 대기' : 'api.getPost(42)', park ? WARN : ACC, 1, { mono: true, fs: 14, fill: PANEL });
      dot([[430, 170], [800, 170]], seg(u, 0.6, 2.0), INFO, 8); pill(lerp(430, 790, E(u, 0.6, 2.0)), 196, 'GET /posts/42', INFO, u > 0.6 ? 1 : 0, { mono: true, fs: 13.5 });
      tx(30, 270, '코루틴만 멈추고 스레드는 놓아준다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      tx(30, 300, '메인은 그동안 화면을 계속 그린다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); return; }
    if (k === 3) { // 응답 도착 → 멈춘 자리부터 이어서
      const back = E(u, 0.2, 1.2); if (back < 1) envelope(lerp(800, 430, back), 170, 200, { s: 0.6 });
      pill(400, u > 1.3 ? 80 : 120, u > 1.3 ? 'handle(response)' : '⏸ getPost(42) 대기', u > 1.3 ? ACC : WARN, 1, { mono: true, fs: 14, fill: PANEL });
      if (u > 1.3) grow(400, 116, 400, 92, 1, ACC);
      tx(30, 270, '응답이 오면 중단된 다음 줄부터 이어 실행', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(30, 300, '콜백 없이 위에서 아래로 읽힌다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    // k 4: runBlocking 은 메인을 붙잡는다
    pill(400, 80, 'runBlocking { api.getPost(id) }', BAD, pop(u, 0.2), { mono: true, fs: 14, fill: BADBG });
    const sec = 5 * E(u, 0.6, 2.2); clock(560, 280, 34, sec / 5, BAD, `${sec.toFixed(1)}초`);
    tx(30, 270, '메인 스레드가 응답을 기다리며 멈춘다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
    tx(30, 300, '입력에 5초 넘게 응답하지 못하면 ANR', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
    sub(560, 350, '시간 흐름은 예시', fade(u, 0.8)); }

  // ---------- 3. Response → 닫힌 두 갈래 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { // sealed: 하위 타입이 둘로 닫힌다
      el('rect', { x: 250, y: 70, width: 460, height: 230, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.1) });
      mono(270, 100, 'sealed interface ApiResult<out T>', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      card(370, 200, 180, 80, { rx: 10, text: 'Ok<T>\n(data)', fs: 16, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.5) });
      card(590, 200, 180, 80, { rx: 10, text: 'Fail\n(code, msg)', fs: 16, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.8) });
      lock(700, 80, true, INK, pop(u, 1.2));
      const f = E(u, 1.4, 2.0), bx = f < 1 ? lerp(860, 730, f) : 730 + Math.sin(seg(u, 2.0, 2.3) * Math.PI) * 30;
      card(bx + 60, 200, 100, 44, { rx: 8, text: '세 번째?', fs: 14.5, stroke: OFF, color: MUT, dash: '5 4' });
      tx(480, 350, '갈래가 둘로 닫혀 있어 when이 둘 다 다루도록 강제된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // 공통: 봉투 → isSuccessful 갈림길 → 두 갈래
    const code = k === 3 ? 404 : 200, arrive = k === 1 ? E(u, 0.2, 1.0) : 1;
    envelope(lerp(50, 100, arrive), 200, k === 1 ? 200 : code, { col: k === 1 ? INK : null });
    card(300, 200, 170, 60, { rx: 30, text: 'isSuccessful?', fs: 15, mono: true, stroke: INFO, color: INFO, s: k === 1 ? pop(u, 0.9) : 1 });
    tx(300, 248, '2xx인가', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    el('path', { d: 'M385,200 C430,200 430,110 480,110', fill: 'none', stroke: k === 2 ? GOOD : GRID, 'stroke-width': 3 });
    el('path', { d: 'M385,200 C430,200 430,300 480,300', fill: 'none', stroke: k === 3 ? BAD : GRID, 'stroke-width': 3 });
    tx(440, 140, 'yes', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD }); tx(440, 272, 'no', { 'font-size': 13.5, 'font-weight': 700, fill: BAD });
    if (k === 1) { tx(480, 380, '404·500도 예외 없이 정상 응답으로 도착한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      tx(480, 405, '분기 전에는 body()를 건드리지 않는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { dot([[385, 200], [430, 160], [480, 110]], seg(u, 0.1, 0.6), GOOD, 7);
      card(570, 110, 150, 46, { rx: 8, text: 'body() → Post?', fs: 14, mono: true, s: pop(u, 0.5) });
      card(730, 110, 110, 46, { rx: 8, text: '!= null', fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.9) });
      card(870, 110, 120, 46, { rx: 8, text: 'Ok(post)', fs: 15, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.3) });
      grow(645, 110, 673, 110, E(u, 0.7, 0.9), MUT); grow(785, 110, 808, 110, E(u, 1.1, 1.3), MUT);
      mono(730, 190, 'null (예: 204 빈 본문)', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      mono(730, 214, '→ Fail(code(), "빈 응답 본문")', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(480, 380, '여기를 통과한 값만 UI로 간다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    // k 3: 404 → errorBody
    dot([[385, 200], [430, 240], [480, 300]], seg(u, 0.1, 0.6), BAD, 7);
    card(610, 300, 250, 46, { rx: 8, text: 'errorBody()?.string()', fs: 14, mono: true, s: pop(u, 0.5) });
    card(610, 360, 170, 36, { rx: 8, text: '?: "unknown"', fs: 14, mono: true, stroke: MUT, color: MUT, s: pop(u, 1.0) });
    card(850, 300, 170, 46, { rx: 8, text: 'Fail(404, detail)', fs: 14.5, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.4) });
    grow(737, 300, 763, 300, E(u, 1.2, 1.4), MUT);
    tx(480, 60, 'body()를 바로 썼다면 여기서 null → NPE', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); }

  // ---------- 4. 인터셉터: 모든 요청이 지나는 관문 ----------
  function gate(x, n, name, on, s) { const g = G(x, 170, s ?? 1); el('rect', { x: -40, y: -70, width: 80, height: 140, rx: 10, fill: on ? ACCBG : PANEL, stroke: on ? ACC : INK, 'stroke-width': 2.2 }, g);
    tx(0, -44, `#${n}`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: on ? ACC : INK, class: 'mono' }, g);
    tx(0, 98, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }, g); }
  function req(x, y, auth, o) { o = o || {}; const w = auth ? 190 : 120;
    card(x, y, w, auth ? 58 : 40, { rx: 8, fill: PANEL, stroke: o.col || INFO, op: o.op, text: auth ? 'GET /posts/42\nAuthorization: Bearer …' : 'GET /posts/42', fs: 13.5, mono: true, color: INK }); }
  function s4(t, c) { const { k, u } = c;
    el('line', { x1: 40, y1: 170, x2: 780, y2: 170, stroke: GRID, 'stroke-width': 3 });
    tx(40, 150, 'Retrofit', { 'font-size': 14.5, 'font-weight': 700, fill: MUT }); server(870, 170, '서버', { s: 0.7 });
    const showLog = k >= 3;
    gate(330, 1, 'AuthInterceptor', k <= 2, k === 0 ? pop(u, 0.2) : 1);
    if (showLog) gate(560, 2, 'Logging', k === 3, k === 3 ? pop(u, 0.2) : 1);
    if (k === 0) { card(330, 350, 170, 50, { rx: 8, text: 'tokenStore', fs: 15, mono: true, stroke: WARN, s: pop(u, 0.6) });
      mono(330, 296, 'token: () -> String?', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.9) });
      dot([[330, 325], [330, 240]], seg(u, 1.3, 1.9), WARN, 6);
      tx(480, 40, '요청이 올 때마다 그 순간의 토큰을 읽는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { const f = E(u, 0.2, 1.0); req(lerp(110, 250, f), 170, false, { op: u > 1.2 ? 0.35 : 1 });
      if (u > 1.0) { const g = E(u, 1.1, 2.2); req(lerp(330, 560, g), u > 1.2 ? 90 : 170, true, { col: ACC }); }
      mono(330, 320, 'request().newBuilder()', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      mono(330, 344, '.header("Authorization", …)', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.1) });
      mono(330, 368, 'proceed(req)', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(110, 230, '원본은 그대로', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(700, 40, '토큰이 없으면 헤더 없이 그대로 나간다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { mono(40, 330, 'OkHttpClient.Builder()', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      mono(60, 356, '.addInterceptor(AuthInterceptor { tokenStore.access })', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
      for (let i = 0; i < 3; i++) dot([[60, 170], [780, 170]], (t * 0.5 + i / 3) % 1, INFO, 6);
      tx(480, 40, '등록 순서 = 요청이 지나는 순서', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    if (k === 3) { const f = E(u, 0.2, 1.4); req(lerp(450, 640, f), 58, true, { col: ACC });
      const lines = ['--> GET https://…/posts/42', ['Authorization: Bearer …', '#fbbf24'], '--> END GET', '<-- 200 OK https://…/posts/42'];
      terminal(40, 250, 470, 150, lines, Math.min(4, E(u, 0.6, 2.0) * 4), { title: 'Logcat · 예시', fs: 13.5 });
      tx(560, 300, 'Level.BODY: URL·헤더·본문까지', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(560, 330, '토큰이 그대로 찍힌다 · 디버그 빌드만', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); return; }
    // k 4: 타임아웃 두 개와 build()
    clock(220, 330, 30, E(u, 0.3, 1.3) * (10 / 15), WARN, 'connect 10s'); clock(400, 330, 30, E(u, 0.6, 1.9), WARN, 'read 15s');
    pill(620, 330, 'build() → client 완성', GOOD, pop(u, 1.9), { fs: 14.5, mono: true });
    tx(480, 40, 'OkHttp 기본값은 각 10초, 호출 전체 한도(callTimeout)는 기본으로 없다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  // ---------- 5. Repository → ViewModel → UI ----------
  function layer(x, w, name, col, o) { o = o || {}; el('rect', { x, y: 60, width: w, height: 230, rx: 12, fill: o.fill || SOFT, stroke: col || GRID, 'stroke-width': 2, 'stroke-dasharray': o.dash });
    tx(x + w / 2, 50, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col || INK }); }
  function s5(t, c) { const { k, u } = c, st = c.beat.status;
    layer(30, 300, 'Repository', ACC, { dash: '7 5' }); layer(360, 250, 'ViewModel', GOOD); layer(640, 290, 'UI', INK, { fill: PANEL });
    card(110, 120, 130, 44, { rx: 8, text: 'PostApi', fs: 15, mono: true, stroke: INFO, color: INFO });
    sub(110, 160, 'Retrofit 타입은 이 안에만', 1, { 'font-size': 13.5 });
    mini(785, 175, k === 0 ? null : k === 1 ? 'error' : k === 3 && u > 1.2 ? 'success' : 'loading', t);
    if (k === 0) { envelope(110, 230, 200, { s: pop(u, 0.4) });
      grow(160, 230, 210, 230, E(u, 0.9, 1.2), MUT); mono(185, 268, 'toResult()', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      card(270, 230, 100, 44, { rx: 8, text: 'Ok(post)', fs: 14, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.3) });
      fly(270, 230, 485, 160, seg(u, 1.7, 2.5), 'ApiResult', { mono: true, fill: GOOD });
      mono(30, 340, 'suspend fun post(id) = api.getPost(id).toResult()', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      tx(30, 380, '화면은 Retrofit을 몰라도 된다 · 경계는 Repository', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { // 오프라인: IOException 을 결과로 바꾼다
      const wx = 110, wy = 230; [16, 28, 40].forEach((r, i) => el('path', { d: `M${wx - r},${wy - r * 0.2} A${r},${r} 0 0 1 ${wx + r},${wy - r * 0.2}`, fill: 'none', stroke: OFF, 'stroke-width': 4 }));
      cross(wx, wy - 10, 14, pop(u, 0.3));
      card(250, 200, 130, 40, { rx: 8, text: 'IOException', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.7) });
      card(250, 260, 150, 44, { rx: 8, text: 'Fail(-1, …)', fs: 14.5, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.3) });
      grow(250, 222, 250, 236, E(u, 1.1, 1.3), BAD);
      fly(250, 260, 485, 160, seg(u, 1.7, 2.5), 'ApiResult.Fail', { mono: true, fill: BAD });
      mono(30, 340, 'catch (e: IOException) { Fail(-1, "네트워크 오류: …") }', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5) });
      tx(30, 380, '예외는 여기서 흡수 · 위 계층은 결과 두 갈래만 본다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); return; }
    // ViewModel 의 상태 상자
    const sv = k === 2 ? 'Loading' : (u > 1.2 ? 'Success(post)' : 'Loading');
    card(485, 160, 210, 54, { rx: 8, text: `state = ${sv}`, fs: 14.5, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG });
    grow(590, 160, 722, 160, k === 2 ? E(u, 0.4, 0.9) : 1, GOOD);
    if (k === 2) { pill(485, 240, 'MutableStateFlow<UiState>', GOOD, pop(u, 0.2), { mono: true, fs: 13.5, fill: PANEL });
      mono(30, 340, 'state.value = UiState.Loading', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      tx(30, 380, 'UI는 상태를 구독만 한다 · 요청이 언제 나갔는지 몰라도 된다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    // k 3: when(sealed) 두 갈래
    [['is Ok', 'Success(r.data)', GOOD, 330], ['is Fail', 'Error(r.msg)', BAD, 366]].forEach(([a, b, col, y], i) => {
      mono(40, y, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.3) });
      mono(130, y, '-> UiState.' + b, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); });
    check(20, 325, 7, pop(u, 1.2));
    tx(480, 405, '빠뜨린 분기는 컴파일이 막는다 · else가 필요 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
    tx(560, 360, 'HTTP 200 → Success', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.3) }); }

  const quiz = [
    { q: '@GET("posts/{id}")와 @Path("id") id: Long에 42를 넘기면 실제 요청 경로는 무엇인가?',
      o: ['/posts/{id}', '/posts/42', '/posts?id=42'], a: 1,
      why: '@Path("id")가 경로의 {id} 자리에 인자를 끼운다. 쿼리스트링으로 붙는 것은 @Query다.' },
    { q: 'val response = api.getPost(id) 줄에서 응답을 기다리는 동안 메인 스레드는 어떤 상태인가?',
      o: ['코루틴만 멈추고 메인 스레드는 화면을 계속 그린다', '응답이 올 때까지 막혀 있다', '새 스레드로 옮겨져 사라진다'], a: 0,
      why: 'suspend 호출은 코루틴을 중단시키고 스레드를 놓아준다. 전송은 OkHttp 스레드가 맡고, 응답이 오면 다음 줄부터 이어 실행된다.' },
    { q: '반환 타입이 Response<Post>일 때 서버가 404를 돌려주면 어떻게 되는가?',
      o: ['HttpException이 던져진다', '정상 응답으로 오고 isSuccessful이 false다', 'body()가 빈 Post 객체를 준다'], a: 1,
      why: 'Response로 받으면 4xx·5xx도 예외 없이 도착한다. isSuccessful로 먼저 갈라야 하고, 실패 쪽 body()는 null이다.' },
    { q: 'AuthInterceptor가 토큰을 String이 아니라 () -> String? 람다로 받는 이유는 무엇인가?',
      o: ['람다가 더 빨라서', 'OkHttp가 람다만 받아서', '요청할 때마다 그 순간의 최신 토큰을 읽으려고'], a: 2,
      why: '값으로 받으면 만들 때의 토큰이 굳어 갱신 뒤에도 옛 토큰이 붙는다. 람다는 intercept가 불릴 때마다 저장소를 다시 읽는다.' },
    { q: 'Repository가 IOException까지 잡아 ApiResult로 돌려주면 ViewModel은 무엇만 다루면 되는가?',
      o: ['Ok와 Fail 두 갈래', 'IOException과 HttpException', 'OkHttp 콜백과 스레드 전환'], a: 0,
      why: '네트워크 예외는 Repository에서 Fail(-1, …)로 바뀐다. ViewModel은 when으로 Ok와 Fail만 UiState로 옮기면 된다.' },
  ];

  const summary = [
    'Retrofit은 인터페이스 메서드 하나를 엔드포인트 하나로 보고 @Path·@Query·@Body로 요청을 만든다.',
    'suspend 호출은 응답을 기다리는 동안 코루틴만 멈추고 메인 스레드는 화면을 계속 그린다.',
    'Response로 받으면 404도 정상 응답으로 오므로 isSuccessful부터 보고 Ok와 Fail로 나눈다.',
    '토큰과 로그는 OkHttp 인터셉터에 모으고, 화면은 Repository 뒤에서 로딩·성공·에러만 그린다.',
  ];
  const review = [
    { q: '토큰을 갱신했는데도 요청에 옛 토큰이 붙어 401이 계속 난다. AuthInterceptor를 토큰 String을 받도록 바꾼 뒤부터다. 원인은?',
      o: ['인터셉터를 만들 때의 토큰 값이 굳어 버렸다', '로깅 인터셉터를 뒤에 등록했다', 'readTimeout이 너무 짧다'], a: 0,
      why: 'String으로 받으면 생성 시점의 값이 계속 쓰인다. () -> String? 람다로 받아야 요청마다 저장소의 최신 토큰을 읽는다.' },
    { q: '상세 화면에서 가끔 NPE가 난다. 코드는 api.getPost(id).body()!!.title을 바로 쓴다. 먼저 고칠 것은?',
      o: ['readTimeout을 늘린다', 'isSuccessful과 body() null부터 확인해 Ok와 Fail로 나눈다', '호출을 runBlocking으로 감싼다'], a: 1,
      why: '404나 500도 정상 응답으로 오고 그때 body()는 null이다. 상태코드를 먼저 보고 결과 타입으로 좁히면 화면에서 null이 사라진다.' },
    { q: '비행기 모드에서 상세 화면을 열자 앱이 죽는다. 어디서 막는 것이 가장 알맞은가?',
      o: ['Composable 안에서 try/catch', '로그 수준을 Level.BODY로 올린다', 'Repository에서 IOException을 잡아 Fail로 바꾼다'], a: 2,
      why: '연결 실패는 응답이 아니라 IOException으로 온다. Repository가 흡수해 결과로 바꾸면 ViewModel과 UI는 에러 상태 하나만 그리면 된다.' },
  ];

  R.page({ title: '요청 줄 · 스레드 · 응답 갈래', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
