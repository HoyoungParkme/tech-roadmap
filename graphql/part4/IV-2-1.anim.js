/* IV-2-1 Caching — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * APQ 해시(be5d…7cd3), APQ 흐름(PersistedQueryNotFound → 등록 → GET), 아무 쿼리나 등록되는 것,
 * @cacheControl 로 정해지는 Cache-Control 값, 응답 캐시 HIT 때 resolver 호출 수, InMemoryCache 정규화 결과는
 * @apollo/server 5 · server-plugin-response-cache · @apollo/client 4 로 직접 돌린 결과다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, server, dbIcon, browser, person, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const HASH = 'be5d…7cd3';
  // 캐시 키 표 (CDN / 서버 저장소)
  function keyTable(x, y, w, title, rows, o) { o = o || {}; const rh = 30;
    el('rect', { x, y, width: w, height: 34 + Math.max(1, rows.length) * rh, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.8 });
    tx(x + 12, y + 22, title, { 'font-size': 14, 'font-weight': 700, fill: o.stroke || MUT });
    if (!rows.length) mono(x + 14, y + 54, '(비어 있음)', { 'font-size': 14, fill: OFF });
    rows.forEach(([k, v, ro], i) => { ro = ro || {}; const yy = y + 34 + i * rh, op = ro.op ?? 1; if (op <= 0) return;
      if (ro.hi) el('rect', { x: x + 5, y: yy + 1, width: w - 10, height: rh - 3, rx: 5, fill: ro.hi, opacity: op });
      mono(x + 14, yy + 20, k, { 'font-size': 14, 'font-weight': 700, fill: ro.col || INK, opacity: op });
      if (v) mono(x + w - 12, yy + 20, v, { 'font-size': 13.5, fill: ro.vcol || MUT, 'text-anchor': 'end', opacity: op }); }); }
  // 공통 경로: 브라우저 · CDN · 서버
  const P = { b: 100, c: 420, s: 790, y: 150 };
  function path3(o) { o = o || {};
    browser(P.b, P.y, 130, 90, '브라우저', {});
    card(P.c, P.y, 130, 70, { rx: 12, stroke: o.cdn || INK, sw: 2.5, fill: o.cdnFill }); tx(P.c, P.y + 6, 'CDN', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: o.cdn || INK });
    server(P.s, P.y, 'GraphQL 서버', { lamp: o.lamp, op: o.sop });
    el('line', { x1: P.b + 66, y1: P.y, x2: P.c - 66, y2: P.y, stroke: GRID, 'stroke-width': 2.5 }); el('line', { x1: P.c + 66, y1: P.y, x2: P.s - 58, y2: P.y, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': o.idle ? '5 6' : null }); }

  // ---------- 1. POST 라 HTTP 캐시가 약하다 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { path3({ idle: k === 1 && u > 1.4, lamp: k === 1 && u > 1.4 ? OFF : ACC, cdnFill: k === 1 && u > 1.4 ? GOODBG : null, cdn: k === 1 && u > 1.4 ? GOOD : INK });
      if (k === 0) { pill(P.c, 70, 'GET /api/products/42', INFO, pop(u, 0.2), { mono: true, fs: 14 });
        dot([[P.b + 66, P.y], [P.c - 66, P.y], [P.c + 66, P.y], [P.s - 58, P.y]], seg(u, 0.5, 1.6), INFO, 7);
        keyTable(P.c - 160, 250, 320, 'CDN 캐시 키', [['/api/products/42', '', { hi: INFOBG, op: fade(u, 1.8) }]], {});
        note(P.c - 160, 380, 'URL이 곧 캐시 키', fade(u, 2.1), { fill: INFO }); return; }
      pill(640, 250, 'Cache-Control: public, max-age=300', GOOD, pop(u, 0.2), { mono: true, fs: 13.5 }); pill(640, 290, 'ETag: "abc123"', GOOD, pop(u, 0.4), { mono: true, fs: 13.5 });
      dot([[P.b + 66, P.y], [P.c - 66, P.y]], seg(u, 1.4, 1.9), INFO, 7); dot([[P.c - 66, P.y + 12], [P.b + 66, P.y + 12]], seg(u, 1.9, 2.4), GOOD, 7);
      clock(P.c, 320, 30, 1 - E(u, 1.6, 2.8) * 0.1, GOOD, 'max-age 300s');
      pill(P.c, 70, 'HIT', GOOD, pop(u, 1.8), { fs: 15 }); sub(P.s, 70, '서버는 쉰다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 2 || k === 3) { path3({ cdn: k === 3 ? BAD : INK });
      const qs = ['{ product(id:42) { name price } }', '{ product(id:42) { name } }'];
      qs.forEach((q, i) => { const a = seg(u, 0.2 + i * 0.6, 1.2 + i * 0.6); fly(P.b, 70 + i * 0 , P.c, 70, a, 'POST /graphql', { fill: INFO, mono: true });
        card(P.b + 120, 240 + i * 46, 330, 36, { rx: 8, text: 'body: ' + q, fs: 13.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.4 + i * 0.6) }); });
      if (k === 2) { keyTable(560, 230, 330, 'CDN이 보는 키', [['POST /graphql', '', { op: fade(u, 1.2) }], ['POST /graphql', '', { op: fade(u, 1.8), hi: WARNBG }]], {});
        note(560, 360, '본문이 달라도 URL은 같다', fade(u, 2.2), { fill: WARN }); return; }
      cross(P.c, P.y, 22, pop(u, 0.3));
      [['POST는 CDN이 기본으로 캐시하지 않는다', BAD], ['같은 데이터를 여러 모양의 쿼리로 묻는다', WARN], ['인증된 응답이면 더 어렵다', WARN]].forEach(([s, col], i) => note(560, 250 + i * 36, '· ' + s, fade(u, 0.8 + i * 0.4), { fill: col, 'font-size': 14.5 })); return; }
    // k4: GET 에 쿼리를 실으면 URL 이 길어진다
    tx(40, 80, 'GET /graphql?query=…&variables=…', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
    const L = E(u, 0.3, 2.0) * 820, lim = 560; el('rect', { x: 40, y: 110, width: 820, height: 34, rx: 6, fill: SOFT });
    el('rect', { x: 40, y: 110, width: Math.min(L, lim), height: 34, rx: 6, fill: INFO }); if (L > lim) el('rect', { x: 40 + lim, y: 110, width: L - lim, height: 34, rx: 0, fill: BAD });
    el('line', { x1: 40 + lim, y1: 96, x2: 40 + lim, y2: 160, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }); mono(40 + lim, 182, '~2KB', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
    note(40, 240, '쿼리 본문이 길어지면 URL 길이 한계에 걸린다', fade(u, 1.6), { fill: BAD });
    note(40, 300, '쿼리 대신 짧은 식별자를 보내면? → persisted query', fade(u, 2.2), { fill: ACC }); }

  // ---------- 2. Persisted Query (APQ) ----------
  function cs(o) { o = o || {}; person(90, 150, '클라이언트', {}); server(800, 150, 'Apollo Server', { lamp: o.lamp || ACC }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { cs({});
      fly(130, 120, 740, 120, seg(u, 0.2, 1.2), '{ sha256Hash: "' + HASH + '" }', { fill: INFO, mono: true });
      keyTable(560, 230, 330, '서버의 해시 ↔ 쿼리', [], {});
      fly(740, 175, 130, 175, seg(u, 1.4, 2.3), 'PersistedQueryNotFound', { fill: BAD, mono: true });
      if (u > 2.3) card(330, 175, 300, 34, { rx: 8, text: 'PERSISTED_QUERY_NOT_FOUND', fs: 13.5, mono: true, stroke: BAD, color: BAD });
      note(40, 300, '처음 보는 해시 · 실행 결과', fade(u, 2.4), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 1) { cs({});
      fly(130, 110, 740, 110, seg(u, 0.2, 1.1), 'hash + query 본문', { fill: INFO });
      keyTable(560, 230, 360, '서버의 해시 ↔ 쿼리', [[HASH, 'query GetProduct…', { hi: ACCBG, op: fade(u, 1.2), col: ACC }]], { stroke: ACC });
      fly(740, 175, 330, 175, seg(u, 1.6, 2.4), '{ "data": { "product": … } }', { fill: GOOD, mono: true, stay: true });
      note(40, 300, '이번엔 등록하고 결과를 준다', fade(u, 2.3), { fill: ACC }); return; }
    if (k === 2) { // 쿼리 길이와 무관하게 해시 64자
      tx(40, 60, '쿼리 본문', { 'font-size': 15, 'font-weight': 700 });
      [[56, 'query GetProduct…  (이 예시는 56자)'], [900, '실제 화면 쿼리 (수백~수천 자)']].forEach(([n, s], i) => { const w = Math.min(820, n * 0.75 + 40);
        el('rect', { x: 40, y: 80 + i * 50, width: w * E(u, 0.2 + i * 0.3, 1.0 + i * 0.3), height: 30, rx: 5, fill: i ? WARN : INFO }); tx(i ? 50 : 40 + w + 12, 101 + i * 50, s, { 'font-size': 14, fill: i ? PANEL : INFO, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.3) }); });
      tx(40, 220, 'sha256 해시', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) });
      el('rect', { x: 40, y: 236, width: 88 * E(u, 1.4, 1.8), height: 30, rx: 5, fill: ACC }); mono(140, 257, '64자 고정', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) });
      card(480, 350, 880, 48, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 2.0) });
      mono(56, 356, 'GET /graphql?extensions={…"sha256Hash":"' + HASH + '"}&variables={"id":42}', { 'font-size': 14, fill: INFO, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { path3({ cdn: GOOD, cdnFill: GOODBG, idle: true, lamp: OFF });
      keyTable(P.c - 170, 230, 340, 'CDN 캐시 키', [['GET /graphql?…' + HASH, '', { hi: GOODBG, col: GOOD }]], { stroke: GOOD });
      dot([[P.b + 66, P.y], [P.c - 66, P.y]], seg(u, 0.2, 0.7), INFO, 7); dot([[P.c - 66, P.y + 12], [P.b + 66, P.y + 12]], seg(u, 0.7, 1.2), GOOD, 7); pill(P.c, 70, 'HIT', GOOD, pop(u, 0.7), { fs: 15 });
      card(770, 320, 300, 90, { rx: 10, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 1.5) });
      mono(632, 306, '{ dyn } + 처음 보는 해시', { 'font-size': 13.5, opacity: fade(u, 1.6) }); mono(632, 330, '→ 200 · 그냥 등록됨', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(632, 354, 'APQ는 허용 목록이 아니다', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); return; }
    // k4: 빌드 때 등록하는 방식
    card(150, 140, 200, 150, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 0.2) }); tx(150, 92, '빌드 산출물', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
    ['GetProduct', 'GetCart', 'ListOrders', 'Me'].forEach((n, i) => mono(70, 122 + i * 24, '✓ ' + n, { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.12) }));
    grow(252, 140, 420, 140, E(u, 1.0, 1.4), ACC); keyTable(430, 90, 300, '서버 허용 목록', [['GetProduct', ''], ['GetCart', ''], ['ListOrders', ''], ['Me', '']].map(([a]) => [a, '', { op: fade(u, 1.2) }]), { stroke: ACC });
    fly(900, 330, 760, 330, seg(u, 1.6, 2.2), '{ 처음 보는 쿼리 }', { fill: BAD, mono: true, stay: true }); if (u > 2.2) cross(640, 330, 12, 1);
    note(40, 380, '쿼리가 자주 바뀌는 화면엔 맞지 않는다 · 보통 dev는 off, prod만 on', fade(u, 2.4), { fill: MUT, 'font-size': 14 }); }

  // ---------- 3. Apollo Client 정규화 캐시 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { browser(200, 200, 300, 220, null, {}); card(200, 190, 220, 50, { rx: 10, text: 'ApolloClient', fs: 16, mono: true, s: pop(u, 0.2) });
      card(200, 260, 220, 50, { rx: 10, text: 'InMemoryCache', fs: 16, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.7) });
      grow(332, 190, 600, 190, E(u, 1.0, 1.4), MUT); mono(470, 178, 'uri: "/graphql"', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      keyTable(620, 240, 290, '캐시 저장소', [], { stroke: ACC }); note(620, 380, '기본값이 이미 정규화', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 1) { const P1 = ['p1', 'p2', 'p3'], P2 = ['p4', 'p5', 'p6'];
      [['merge 정책 없이', false, 60], ['relayStylePagination()', true, 230]].forEach(([title, ok, y], j) => { const op = fade(u, 0.2 + j * 1.0);
        tx(40, y, title, { 'font-size': 15, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: op });
        const shown = ok ? [...P1, ...P2] : (u > 0.9 ? P2 : P1);
        shown.forEach((p, i) => card(70 + i * 76, y + 50, 64, 40, { rx: 6, text: p, fs: 15, mono: true, stroke: ok ? (i >= 3 ? ACC : GOOD) : (u > 0.9 ? BAD : INK), color: ok && i >= 3 ? ACC : INK, s: ok ? pop(u, 1.2 + i * 0.12) : 1, op }));
        if (!ok) note(330, y + 56, u > 0.9 ? '← 2쪽이 1쪽을 덮었다' : '', fade(u, 1.0), { fill: BAD });
        else note(560, y + 56, '← 이어 붙는다', fade(u, 2.0), { fill: GOOD }); });
      return; }
    if (k === 2) { // 실행 결과: User:1 하나로 합쳐짐
      card(170, 90, 280, 80, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.1) }); mono(42, 80, '쿼리 A', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 }); mono(42, 104, 'user(id:"1"){ id name email }', { 'font-size': 13.5 });
      card(170, 200, 280, 80, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.5) }); mono(42, 190, '쿼리 B', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.5) }); mono(42, 214, 'post{ author{ id name } }', { 'font-size': 13.5, opacity: fade(u, 0.5) });
      grow(312, 90, 470, 150, E(u, 0.8, 1.2), INFO); grow(312, 200, 470, 170, E(u, 1.2, 1.6), WARN);
      keyTable(480, 60, 440, 'cache.extract()', [['User:1', 'name: "' + (u > 1.6 ? 'Kim J.' : 'Kim') + '", email', { hi: ACCBG, col: ACC, op: fade(u, 1.0) }], ['Post:p1', 'author → { __ref: "User:1" }', { op: fade(u, 1.5) }], ['ROOT_QUERY', 'user(1) → User:1, post(p1) → Post:p1', { op: fade(u, 1.7) }]], { stroke: ACC });
      note(480, 230, '두 쿼리가 User:1 한 자리를 같이 쓴다', fade(u, 1.9), { fill: ACC });
      note(480, 260, '나중 응답의 name이 덮고 email은 남는다', fade(u, 2.1), { fill: MUT, 'font-size': 14.5 });
      card(700, 340, 440, 50, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 2.3) }); mono(490, 346, 'user(id:"1"){ name } → 네트워크 없이 HIT', { 'font-size': 14, fill: GOOD }); return; }
    if (k === 3) { tx(40, 60, '캐시 키 = __typename + id', { 'font-size': 17, 'font-weight': 800 });
      [['User:1', '기본 · id가 있음', ACC], ['Product:{"sku":"MUG-1"}', 'keyFields: ["sku"]', INFO], ['ROOT_QUERY 안에 그대로', 'id가 없으면 정규화 안 됨', BAD]].forEach(([a, b, col], i) => {
        const y = 120 + i * 90; card(330, y, 560, 64, { rx: 10, stroke: col, sw: 2, s: pop(u, 0.3 + i * 0.5) });
        mono(70, y + 6, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.5) }); tx(600, y + 6, b, { 'font-size': 14.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.4 + i * 0.5) }); });
      note(40, 400, 'cache.extract()로 직접 본 키 이름이다', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 4) { keyTable(320, 50, 320, '캐시', [['User:1', 'name: ' + (u > 1.2 ? '"Kim"' : '"Kim J."'), { hi: u > 1.2 ? GOODBG : null, col: u > 1.2 ? GOOD : INK }]], {});
      fly(840, 70, 700, 70, seg(u, 0.3, 1.2), 'mutation 응답 User:1', { fill: ACC, mono: true });
      ['프로필 화면', '댓글 작성자', '헤더 아바타'].forEach((n, i) => { const x = 170 + i * 310; browser(x, 280, 230, 120, null, { stroke: u > 1.6 ? GOOD : INK });
        tx(x, 270, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); mono(x, 300, u > 1.6 + i * 0.15 ? 'Kim' : 'Kim J.', { 'font-size': 15, 'text-anchor': 'middle', fill: u > 1.6 + i * 0.15 ? GOOD : MUT });
        grow(480, 120, x, 214, E(u, 1.3, 1.7), GOOD, { plain: true }); });
      note(40, 400, '같은 id를 돌려주면 자동 merge · 아니면 refetchQueries / update', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // k5: fetchPolicy
    const L = [['cache-first (기본)', [['캐시', GOOD]]], ['cache-and-network', [['캐시', GOOD], ['네트워크', INFO]]], ['network-only', [['네트워크', INFO]]], ['no-cache', [['네트워크', INFO], ['저장 안 함', MUT]]]];
    L.forEach(([n, steps], i) => { const y = 70 + i * 88, op = fade(u, 0.2 + i * 0.4);
      mono(40, y + 5, n, { 'font-size': 15, 'font-weight': 700, opacity: op });
      steps.forEach(([s, col], j) => { card(470 + j * 200, y, 170, 44, { rx: 22, text: s, fs: 14.5, stroke: col, color: col, s: pop(u, 0.4 + i * 0.4 + j * 0.3) }); if (j) grow(470 + j * 200 - 115, y, 470 + j * 200 - 87, y, E(u, 0.5 + i * 0.4, 0.8 + i * 0.4), col); }); }); }

  // ---------- 4. 서버 응답 캐시 + @cacheControl ----------
  function ccBadge(x, y, s, col, sc) { pill(x, y, s, col, sc, { mono: true, fs: 14 }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [120, 300].forEach((y, i) => server(150, y, 'Apollo Server ' + (i + 1), {}));
      const m = E(u, 0.5, 1.6);
      [120, 300].forEach((y) => { card(lerp(290, 290, m), y, 120, 40, { rx: 8, text: '메모리', fs: 14, stroke: BAD, color: BAD, op: 1 - m }); });
      card(640, 210, 180, 90, { rx: 12, stroke: ACC, sw: 3, fill: ACCBG, s: pop(u, 1.0) }); tx(640, 216, 'Redis', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) });
      [120, 300].forEach((y, i) => grow(210, y, 548, 210 + (i ? 20 : -20), E(u, 1.5 + i * 0.2, 1.9 + i * 0.2), ACC));
      mono(640, 290, 'KeyvAdapter(KeyvRedis)', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      note(500, 390, '서버가 여러 대면 캐시도 한곳에 둔다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { // 같은 요청 3번 → resolver 1번 (실행 결과)
      server(780, 200, 'Apollo Server', {}); card(560, 200, 190, 80, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG });
      tx(560, 196, 'responseCache', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC }); tx(560, 218, 'Plugin', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC });
      [0, 1, 2].forEach((i) => { const y = 110 + i * 90, a = seg(u, 0.2 + i * 0.7, 0.7 + i * 0.7);
        card(140, y, 220, 40, { rx: 8, text: '{ trending { id title } }', fs: 13.5, mono: true, s: pop(u, 0.1 + i * 0.7) });
        dot([[250, y], [465, 200]], a, INFO, 6);
        if (i === 0) dot([[655, 200], [722, 200]], seg(u, 0.7, 1.0), INFO, 6);
        if (u > 0.8 + i * 0.7) mono(290, y + 30, i ? 'HIT · Age: 0' : 'MISS → resolver', { 'font-size': 14, 'font-weight': 700, fill: i ? GOOD : WARN }); });
      card(780, 360, 220, 50, { rx: 10, stroke: INK, sw: 2, op: fade(u, 2.2) }); mono(780, 366, 'trending() 호출 1번', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    if (k === 2) { tx(40, 60, 'type Query', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      [['trending(limit: Int): [Post!]!', 'maxAge 300 · PUBLIC', GOOD], ['me: User', 'maxAge 60 · PRIVATE', WARN]].forEach(([f, b, col], i) => { const y = 120 + i * 110;
        card(260, y, 440, 60, { rx: 10, stroke: col, sw: 2, s: pop(u, 0.2 + i * 0.6) }); mono(56, y + 5, f, { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.6) });
        ccBadge(680, y, b, col, pop(u, 0.7 + i * 0.6)); });
      card(480, 360, 600, 56, { rx: 10, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 1.9) });
      mono(200, 366, '@cacheControl(scope: PRIVATE)만 쓰면 → no-store', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 3 || k === 4) { // 응답 TTL = 최솟값
      const rows = k === 3 ? [['trending', 300, GOOD], ['Post.author', 600, INFO]] : [['trending', 300, GOOD], ['dyn · setCacheHint', 60, WARN]];
      const q = k === 3 ? '{ trending { id title author { name } } }' : '{ trending { id title } dyn }', res = k === 3 ? 300 : 60;
      card(480, 56, 560, 44, { rx: 8, text: q, fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.1) });
      rows.forEach(([n, v, col], i) => { const y = 130 + i * 70, w = 600 * v / 600 * E(u, 0.4 + i * 0.4, 1.2 + i * 0.4);
        mono(40, y + 18, n, { 'font-size': 15, 'font-weight': 700, fill: col }); el('rect', { x: 260, y, width: 600, height: 26, rx: 5, fill: SOFT }); el('rect', { x: 260, y, width: w, height: 26, rx: 5, fill: col });
        mono(268 + w, y + 19, v + 's', { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.4) }); });
      el('line', { x1: 260 + res, y1: 115, x2: 260 + res, y2: 290, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.8) });
      pill(480, 340, 'Cache-Control: max-age=' + res + ', public', INK, pop(u, 2.0), { mono: true, fs: 15 });
      if (k === 4) mono(40, 400, 'info.cacheControl.setCacheHint({ maxAge: 60 })', { 'font-size': 14, fill: WARN, opacity: fade(u, 0.6) }); return; }
    // k5: PRIVATE 가 응답 전체로
    [['{ trending { id title } meCached { name } }', 'max-age=60, private', WARN], ['{ trending { id title } me { name } }', 'no-store', BAD]].forEach(([q, h, col], i) => { const y = 90 + i * 140;
      card(300, y, 540, 48, { rx: 8, text: q, fs: 14, mono: true, s: pop(u, 0.2 + i * 0.8) });
      grow(574, y, 640, y, E(u, 0.5 + i * 0.8, 0.8 + i * 0.8), col); pill(780, y, h, col, pop(u, 0.8 + i * 0.8), { mono: true, fs: 15 }); });
    sub(300, 140, 'meCached = maxAge 60 · PRIVATE', fade(u, 0.6), { 'font-size': 14 }); sub(300, 280, 'me = PRIVATE만 (maxAge 0)', fade(u, 1.4), { 'font-size': 14 });
    note(40, 360, 'PRIVATE 필드가 하나라도 있으면 응답 전체가 private', fade(u, 2.0), { fill: WARN });
    note(40, 392, '사용자별로 저장하려면 responseCachePlugin({ sessionId })', fade(u, 2.3), { fill: MUT, 'font-size': 14.5 }); }

  // ---------- 5. 4 레이어 ----------
  const NODES = [['Client', 80], ['CDN', 280], ['Router', 480], ['Subgraph', 680], ['DB', 880]];
  const LAY = [['Apollo Cache', 0, ACC], ['GET · HTTP', 1, INFO], ['Redis', 3, WARN], ['DataLoader', 3, GOOD]];
  function pathN(o) { o = o || {}; NODES.forEach(([n, x], i) => { card(x, 120, 120, 50, { rx: 10, text: n, fs: 15, stroke: o.miss && o.miss(i) ? BAD : INK, s: o.s ? o.s(i) : 1 }); if (i) grow(x - 140, 120, x - 60, 120, o.g ?? 1, GRID, { plain: true }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { pathN({ s: (i) => pop(u, 0.1 + i * 0.15), g: E(u, 0.5, 1.0) });
      [['(1) Apollo Cache', 80, ACC], ['(2) GET · HTTP', 280, INFO], ['(3) Redis @cacheControl', 600, WARN], ['(4) DataLoader', 780, GOOD]].forEach(([s, x, col], i) => {
        grow(x, 145, x, 210 + i * 40, E(u, 1.0 + i * 0.3, 1.3 + i * 0.3), col, { plain: true }); pill(x, 222 + i * 40, s, col, pop(u, 1.2 + i * 0.3), { fs: 14 }); });
      return; }
    if (k === 1) { const rows = [['(1) Apollo Cache', '한 브라우저', '메모리 / 세션', ACC, 0.25], ['(2) CDN HTTP', '전 세계', '60~300s', INFO, 0.55], ['(3) Server Redis', '서버 클러스터', '60~3600s', WARN, 1], ['(4) DataLoader', '한 요청', '< 1s', GOOD, 0.04]];
      tx(260, 50, '범위', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(560, 50, 'TTL', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      rows.forEach(([n, sc, ttl, col, w], i) => { const y = 90 + i * 78, op = fade(u, 0.2 + i * 0.35);
        tx(40, y + 18, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op }); tx(260, y + 18, sc, { 'font-size': 15, opacity: op });
        el('rect', { x: 560, y: y + 2, width: 250 * w * E(u, 0.4 + i * 0.35, 1.2 + i * 0.35), height: 22, rx: 4, fill: col }); mono(822, y + 18, ttl, { 'font-size': 14, fill: col, opacity: op }); });
      note(40, 405, '범위가 다르면 TTL도 비우는 방법도 다르다', fade(u, 2.2), {}); return; }
    if (k === 2) { const reload = u > 1.5;
      pathN({ miss: (i) => !reload && u > 0.3 + i * 0.25 && i < 4 });
      if (!reload) { dot(NODES.map(([, x]) => [x, 155]), seg(u, 0.2, 1.4), BAD, 7); note(40, 260, '첫 방문 · 전부 MISS · DB까지', fade(u, 0.5), { fill: BAD }); }
      else { dot([[80, 155], [280, 155]], seg(u, 1.5, 1.9), GOOD, 7); pill(280, 200, 'CDN HIT (300s)', GOOD, pop(u, 1.9), { fs: 14 }); pill(140, 245, '또는 Apollo Cache HIT', ACC, pop(u, 2.2), { fs: 14 });
        note(40, 300, '5초 뒤 새로고침', 1, { fill: GOOD }); }
      return; }
    if (k === 3) { browser(300, 220, 480, 340, '상품 상세 화면', {});
      [['최근 본 상품', 'Apollo Cache HIT', ACC], ['추천', 'Redis HIT (60s)', WARN], ['작성자 정보', 'DataLoader batch', GOOD]].forEach(([w, b, col], i) => { const y = 120 + i * 90;
        card(300, y, 400, 66, { rx: 10, stroke: col, sw: 2, s: pop(u, 0.2 + i * 0.5) }); tx(120, y + 6, w, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.5) });
        grow(500, y, 640, y, E(u, 0.6 + i * 0.5, 0.9 + i * 0.5), col); pill(770, y, b, col, pop(u, 0.8 + i * 0.5), { fs: 14 }); });
      return; }
    [['scope: PRIVATE', '사용자별 데이터', WARN], ['refetchQueries · cache.evict', 'mutation 뒤 stale', INFO], ['cache size limit', '큰 페이지 · 클라이언트', MUT]].forEach(([a, b, col], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.4);
      card(x, 170, 280, 120, { rx: 12, stroke: col, sw: 2.5, s }); mono(x, 160, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.4) });
      tx(x, 190, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.4) }); });
    tx(480, 310, '캐시는 경로 위 네 곳에 나눠 둔다', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, opacity: fade(u, 1.6) });
    pill(480, 370, '다음 · IV-2-2 Subscription', INFO, pop(u, 2.1), { fs: 14 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: '같은 GraphQL 쿼리를 반복해도 CDN이 캐시하지 못하는 가장 큰 이유는 무엇인가?',
      o: ['응답이 JSON이라서', 'POST /graphql 한 URL에 쿼리가 body로 실려 가서', 'GraphQL 서버가 ETag를 만들 수 없어서'], a: 1,
      why: 'CDN은 URL로 캐시 키를 잡는데, 쿼리가 달라도 URL은 늘 POST /graphql 하나다. POST는 CDN이 기본으로 캐시하지도 않는다.' },
    { q: 'APQ에서 서버가 처음 보는 해시만 받았을 때 하는 일은 무엇인가?',
      o: ['PersistedQueryNotFound로 답한다', '해시를 풀어 쿼리를 복원한다', '빈 data를 돌려준다'], a: 0,
      why: 'sha256은 되돌릴 수 없어서 서버는 모른다고 답한다. 직접 돌려 보면 PERSISTED_QUERY_NOT_FOUND가 오고, 클라이언트가 본문을 실어 다시 보낸다.' },
    { q: 'Apollo Client가 서로 다른 두 쿼리의 User를 한 자리에 합칠 수 있는 근거는 무엇인가?',
      o: ['두 쿼리의 문자열이 같아서', '응답 크기가 작아서', '__typename과 id로 만든 캐시 키 User:1'], a: 2,
      why: 'InMemoryCache는 응답을 entity 단위로 쪼개 User:1 같은 키에 저장한다. id가 없으면 ROOT_QUERY 안에 그대로 남아 합쳐지지 않는다.' },
    { q: 'trending(maxAge 300)과 Post.author(maxAge 600)를 함께 물은 응답의 Cache-Control은 무엇인가?',
      o: ['max-age=600, public', 'max-age=300, public', 'max-age=900, public'], a: 1,
      why: '응답 전체의 max-age는 포함된 필드 중 가장 짧은 값이다. 실행 결과도 max-age=300, public이었다.' },
    { q: '상품 상세 페이지를 5초 뒤 새로고침했을 때 DB까지 가지 않고 응답하는 곳은 어디인가?',
      o: ['CDN이나 Apollo Cache', 'DataLoader', 'Subgraph의 resolver'], a: 0,
      why: 'persisted query GET은 CDN에 300초 남아 있고, 브라우저의 Apollo Cache에도 같은 entity가 있다. DataLoader는 한 요청 안에서만 산다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    'GraphQL은 POST /graphql 한 URL로 쿼리를 보내서 CDN이 요청을 구분해 캐시하지 못한다.',
    'APQ는 64자 해시로 GET을 보내 CDN 캐시를 살린다. 아무 쿼리나 등록되니 허용 목록은 아니다.',
    'Apollo Client는 응답을 __typename과 id로 쪼개 저장해서 다른 쿼리와 entity를 함께 쓴다.',
    '서버 응답의 max-age는 필드 중 가장 짧은 값이고, PRIVATE 필드 하나가 응답 전체를 바꾼다.',
  ];
  const review = [
    { q: 'scope: PRIVATE만 붙인 me를 trending과 함께 물었더니 응답이 no-store다. 원인은?',
      o: ['me에 maxAge가 없어 0초로 계산됐다', 'trending의 maxAge 300이 너무 길다', '응답 캐시 플러그인이 Redis에 붙지 않았다'], a: 0,
      why: 'maxAge가 없는 루트 필드는 0초이고 응답은 가장 짧은 값을 따른다. me에 maxAge 60을 주면 max-age=60, private가 된다.' },
    { q: 'APQ를 켰으니 외부에서 임의 쿼리를 못 보낸다고 보고서에 적으려 한다. 맞는 판단은?',
      o: ['맞다, 해시를 모르면 요청할 수 없다', '틀리다, 처음 보는 쿼리도 본문과 오면 등록된다', '맞다, GET 요청은 쿼리 본문을 받지 않는다'], a: 1,
      why: '실행해 보니 { dyn }도 해시와 본문을 함께 보내자 200으로 등록됐다. 허용 목록은 빌드 때 등록하는 방식이 맡는다.' },
    { q: 'mutation으로 이름을 바꿨는데 다른 화면의 작성자 이름이 그대로다. 먼저 확인할 것은?',
      o: ['CDN의 max-age', 'DataLoader의 캐시 크기', 'mutation 응답에 __typename과 id가 오는지'], a: 2,
      why: '같은 캐시 키로 돌아와야 User:1이 자동 merge되고 그 entity를 쓰는 화면이 함께 바뀐다. 아니면 refetchQueries나 update로 고친다.' },
  ];
  R.page({ title: 'GraphQL 캐시 네 겹', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
