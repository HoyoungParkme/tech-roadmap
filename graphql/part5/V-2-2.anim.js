/* V-2-2 운영 체크리스트 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 스키마 SDL, N+1과 DataLoader 배치, 캐시 층, 요청이 지나는 보안 관문, 관찰 신호, 48칸 점검표.
 * DataLoader 호출 수(50 → 1, 키 5개)는 graphql 16 + dataloader로 돌려 확인한 값. 나머지 숫자는 체크리스트 문서의 기준값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, cross, check, lock, dbIcon, person, spans, tokens, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  function code(x, y, lines, shown, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || fs + 7, n = lines.length;
    const w = o.w || Math.max(...lines.map((l) => tw(Array.isArray(l) ? l[0] : l, fs))) + 28, h = n * lh + 16;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: o.op ?? 1 });
    if (o.title) tx(x + 4, y - 8, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: o.op ?? 1 });
    const sh = shown == null ? n : shown;
    lines.forEach((l, i) => { if (i >= Math.ceil(sh)) return; let [s, col] = Array.isArray(l) ? l : [l, null];
      if (i === Math.ceil(sh) - 1 && sh % 1) s = s.slice(0, Math.round(s.length * (sh % 1)));
      const yy = y + 8 + fs + i * lh;
      if (col) mono(x + 14, yy, s, { 'font-size': fs, fill: col, 'font-weight': 600, opacity: o.op ?? 1 });
      else spans(x + 14, yy, tokens(s), { 'font-size': fs, opacity: o.op ?? 1 }); });
    return { w, h }; }

  // ---------- 1. Schema ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { [['schema.graphql', 120], ['codegen', 360], ['서버 타입 · 클라이언트 훅', 640]].forEach(([n, x], i) => { const s = pop(u, 0.2 + i * 0.3);
        card(x, 80, i === 2 ? 260 : 170, 50, { rx: 10, text: n, fs: 15, mono: i < 2, stroke: i === 0 ? ACC : INK, color: i === 0 ? ACC : INK, s }); if (i) grow(x - (i === 2 ? 190 : 150), 80, x - (i === 2 ? 134 : 89), 80, E(u, 0.3 + i * 0.3, 0.5 + i * 0.3), MUT); });
      [['query { feed { id } }', '이름 없음', BAD], ['query GetFeed { feed { id } }', 'operation 이름', GOOD], ['mutation archiveOrder(…)', '동사 + 명사', GOOD], ['subscription orderShipped', '과거시제', GOOD]].forEach(([q, w, col], i) => {
        const y = 180 + i * 50, a = 0.9 + i * 0.3; mono(60, y, q, { 'font-size': 15, 'font-weight': 700, fill: col === BAD ? OFF : INK, 'text-decoration': col === BAD ? 'line-through' : null, opacity: fade(u, a) });
        (col === BAD ? cross : check)(470, y - 5, 9, pop(u, a + 0.2)); tx(494, y, w, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, a + 0.2) }); });
      return; }
    if (k === 1) { const L = ['input CreatePostInput { title: String!  body: String! }', 'type CreatePostPayload {', '  post: Post', '  errors: [UserError!]!     # errors as data', '}', 'type Mutation {', '  createPost(input: CreatePostInput!): CreatePostPayload!', '}', ['type Post { …  views: Int  # 새 필드는 nullable로 시작 }', ACC]];
      code(40, 50, L, E(u, 0.2, 2.0) * L.length, { fs: 14.5, lh: 27 });
      note(40, 380, '느낌표는 나중에 뺄 수 없다. 처음엔 아끼고 굳혀 간다', fade(u, 2.2)); return; }
    if (k === 2) { code(40, 50, ['type Post {', ['  oldTitle: String @deprecated(reason: "use title")', WARN], '  title: String', '}'], 4, { fs: 14.5 });
      const ax = R.axes(80, 210, 360, 130, { x: [0, 6], y: [0, 100], xt: [], yt: [], xl: '배포 후 시간', yl: 'oldTitle 사용량' });
      R.line(ax, [[0, 90], [1, 70], [2, 42], [3, 20], [4, 6], [5, 0], [6, 0]], E(u, 0.3, 1.8), WARN);
      if (u > 1.8) { cross(ax.X(6) + 20, ax.Y(0) - 10, 9, pop(u, 1.9)); tx(ax.X(5), ax.Y(0) - 26, '0이 된 뒤 삭제', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.9), 'text-anchor': 'middle' }); }
      sub(180, 404, '곡선은 모양만 보인 예시', 1, { 'font-size': 13.5 });
      code(560, 70, ['enum Status {', '  DRAFT  PUBLISHED', ['  ARCHIVED   # 추가 OK', GOOD], ['  ~~DRAFT~~  # 제거 금지', BAD], '}'], E(u, 0.8, 1.8) * 5, { fs: 14 });
      pill(700, 300, 'Registry + rover subgraph check', ACC, pop(u, 2.2), { fs: 14 }); return; }
    code(40, 70, ['"""게시글. 작성자만 수정할 수 있다."""', 'type Post {', '  """목록에 보이는 제목 (최대 100자)"""', '  title: String', '}'], E(u, 0.2, 1.4) * 5, { fs: 14.5 });
    grow(480, 130, 560, 130, E(u, 1.4, 1.8), MUT);
    card(740, 140, 320, 150, { rx: 12, stroke: INFO, sw: 2, s: pop(u, 1.8) }); tx(600, 98, 'API 문서', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.9) });
    mono(600, 132, 'Post.title: String', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 2.0) }); tx(600, 158, '목록에 보이는 제목 (최대 100자)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.1) });
    note(40, 330, 'description이 그대로 문서가 된다. 예시 쿼리도 함께 둔다', fade(u, 2.3)); }

  // ---------- 2. Performance ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { tx(40, 40, '{ posts { author { name } } } · 글 50개, 작성자 5명', { 'font-size': 15, 'font-weight': 800 });
      for (let i = 0; i < 50; i++) { const x = 50 + (i % 10) * 22, y = 70 + Math.floor(i / 10) * 22; el('rect', { x, y, width: 16, height: 16, rx: 3, fill: INFO, opacity: 0.75 }); }
      dbIcon(150, 300, null, { stroke: BAD });
      const nn = Math.round(E(u, 0.2, 1.6) * 50); for (let i = 0; i < nn; i++) { const x = 58 + (i % 10) * 22, y = 78 + Math.floor(i / 10) * 22; el('line', { x1: x, y1: y + 8, x2: 150, y2: 270, stroke: BAD, 'stroke-width': 0.8, opacity: 0.5 }); }
      mono(150, 370, `DB 호출 ${nn}번`, { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); tx(150, 396, '그냥 resolver', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      for (let i = 0; i < 50; i++) { const x = 540 + (i % 10) * 22, y = 70 + Math.floor(i / 10) * 22, f = E(u, 0.4, 1.4); el('rect', { x, y, width: 16, height: 16, rx: 3, fill: ACC, opacity: 0.75 });
        if (f > 0 && f < 1) dot([[x + 8, y + 8], [650, 220]], f, ACC, 3); }
      R.cells(580, 205, ['1', '2', '3', '4', '5'], { w: 34, h: 30, style: () => ({ stroke: ACC, op: fade(u, 1.4), s: pop(u, 1.4) }) });
      grow(650, 240, 650, 268, E(u, 1.7, 1.9), ACC); dbIcon(650, 300, null, {});
      mono(650, 370, 'DB 호출 1번 (키 5개)', { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); tx(650, 396, 'DataLoader · 한 틱에 모아 배치 (실행해서 확인)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      return; }
    if (k === 1) { const L = [['Apollo Client', 'normalized cache'], ['CDN', 'Persisted Query GET'], ['GraphQL 서버', 'Redis response cache'], ['resolver', '@cacheControl(maxAge)']];
      L.forEach(([a, b], i) => { const x = 130 + i * 230, s = pop(u, 0.2 + i * 0.3); card(x, 160, 190, 80, { rx: 12, stroke: i === 1 ? ACC : INK, s });
        tx(x, 154, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); mono(x, 180, b, { 'font-size': 13, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
      [10, 7, 4, 2].forEach((w, i) => { if (i === 3) return; const x1 = 225 + i * 230, x2 = 265 + i * 230; el('line', { x1, y1: 160, x2, y2: 160, stroke: ACC, 'stroke-width': [10, 7, 4][i] * E(u, 1.2 + i * 0.2, 1.6 + i * 0.2), 'stroke-linecap': 'round' }); });
      note(130, 290, '층마다 다른 트래픽을 걷어 내 안쪽으로 갈수록 요청이 준다', fade(u, 2.0)); sub(130, 320, '선 굵기는 모양만 보인 예시', fade(u, 2.0), { 'text-anchor': 'start', 'font-size': 13.5 });
      note(130, 360, '가장 싼 캐시는 서버에 닿기 전 CDN에서 끝난다', fade(u, 2.3), { fill: ACC }); return; }
    if (k === 2) { const L = ['posts(first: 20, after: "Y3Vyc29yOjIw") {', '  edges { cursor  node { id title } }', '  pageInfo { hasNextPage  endCursor }', '}'];
      code(40, 60, L, E(u, 0.2, 1.4) * 4, { fs: 15, lh: 28, title: 'Relay Connection' });
      [['first: 20', true], ['first: 100', true], ['first: 1000', false], ['first 없음', false]].forEach(([s, ok], i) => { const y = 240 + i * 40, a = 1.4 + i * 0.2;
        mono(60, y, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); (ok ? check : cross)(220, y - 5, 9, pop(u, a)); });
      note(270, 280, 'first를 필수로, 최대 100', fade(u, 2.0)); note(270, 310, '정렬 키 (createdAt, id)에 인덱스', fade(u, 2.3), { fill: ACC }); return; }
    if (k === 3) { tx(60, 50, 'posts WHERE author_id = ?', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      for (let i = 0; i < 24; i++) { const x = 60 + i * 16, hit = i === 17, f = E(u, 0.2, 1.4); el('rect', { x, y: 80, width: 13, height: 40, rx: 2, fill: hit ? ACC : i / 24 < f ? BAD : SOFT, opacity: 0.8 }); }
      tx(60, 146, '인덱스 없음: 행을 처음부터 끝까지', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.0) });
      for (let i = 0; i < 24; i++) el('rect', { x: 60 + i * 16, y: 180, width: 13, height: 40, rx: 2, fill: i === 17 ? ACC : SOFT, opacity: fade(u, 1.4) });
      grow(60 + 17 * 16 + 6, 250, 60 + 17 * 16 + 6, 222, E(u, 1.6, 1.9), ACC); tx(60, 270, 'FK 인덱스: 바로 찾는다', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.8) });
      code(520, 70, ['SET statement_timeout = …;'], fade(u, 1.0), { fs: 14 });
      tx(520, 180, '@defer로 무거운 필드를 나눠 보낸다 (선택)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      [['1차 응답', '{ post { title } }', 0], ['나중에', '{ comments … }', 1]].forEach(([a, b, i]) => { const s = pop(u, 1.8 + i * 0.4); card(620 + i * 180, 240, 160, 60, { rx: 8, stroke: i ? WARN : GOOD, s });
        tx(620 + i * 180, 234, a, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); mono(620 + i * 180, 256, b, { 'font-size': 13, fill: MUT, 'text-anchor': 'middle', opacity: s }); }); return; }
    const ax = R.axes(80, 60, 560, 260, { x: [0, 600], y: [0, 10], xt: [0, 100, 300, 500], yt: [], xl: '응답 시간 (ms)', yl: '요청 수' });
    const pts = []; for (let v = 0; v <= 600; v += 20) pts.push([v, 9 * Math.exp(-Math.pow((v - 45) / 30, 2)) + 1.2 * Math.exp(-v / 160)]);
    R.line(ax, pts, E(u, 0.2, 1.4), INFO); sub(600, 108, '분포 모양은 예시', 1, { 'font-size': 13.5 });
    el('line', { x1: ax.X(100), y1: 60, x2: ax.X(100), y2: 320, stroke: GOOD, 'stroke-width': 2.4, 'stroke-dasharray': '6 4', opacity: fade(u, 1.4) }); tx(ax.X(100) + 6, 76, 'p95 목표 100ms', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
    el('line', { x1: ax.X(500), y1: 60, x2: ax.X(500), y2: 320, stroke: BAD, 'stroke-width': 2.4, opacity: fade(u, 1.9) }); tx(ax.X(500) - 6, 76, 'resolver > 500ms 알람', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.9) }); }

  // ---------- 3. Security ----------
  const GATES = [['JWT', 'ctx.user'], ['introspection', '운영 OFF'], ['Depth', '7~10'], ['Complexity', '점수 한도'], ['Timeout', '5s'], ['Allowlist', '등록 쿼리만']];
  function gates(on, hot, u) { GATES.forEach(([a, b], i) => { if (i >= on) return; const x = 110 + i * 140, h = hot === i;
      el('rect', { x: x - 54, y: 60, width: 108, height: 150, rx: 10, fill: h ? ACCBG : SOFT, stroke: h ? ACC : GRID, 'stroke-width': h ? 2.6 : 1.5 });
      tx(x, 120, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); tx(x, 146, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { gates(1, 0); dot([[20, 135], [110, 135]], seg(u, 0.2, 0.8), INK, 7);
      code(250, 70, ['context: verify(JWT) → ctx.user'], fade(u, 0.6), { fs: 14 });
      code(250, 150, ['User.email: 본인 · ADMIN만', 'policy: @auth 또는 graphql-shield'], E(u, 1.0, 1.8) * 2, { fs: 14 }); lock(560, 300, true, ACC, pop(u, 1.6));
      note(590, 306, '한 요청이 여러 자원을 걸치니 권한은 필드 단위로', fade(u, 2.0)); return; }
    if (k === 1) { gates(6, Math.min(5, Math.floor(E(u, 0.2, 2.2) * 6)), u);
      dot([[20, 135], [880, 135]], E(u, 0.2, 2.4), BAD, 8); mono(110, 250, '__schema', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'text-decoration': 'line-through', opacity: fade(u, 0.6) });
      note(60, 320, 'Depth · Complexity · Timeout을 겹쳐 걸고, 마지막이 Allowlist', fade(u, 2.2)); note(60, 350, 'Allowlist까지 가면 우리가 만든 쿼리만 돈다', fade(u, 2.4), { fill: ACC }); return; }
    if (k === 2) { tx(60, 50, 'rate limit · IP/사용자별 토큰 통', { 'font-size': 15, 'font-weight': 800 });
      const tok = Math.round(lerp(12, 3, E(u, 0.4, 2.0))); for (let i = 0; i < 12; i++) el('circle', { cx: 80 + (i % 6) * 30, cy: 100 + Math.floor(i / 6) * 30, r: 10, fill: i < tok ? ACC : SOFT, stroke: GRID });
      [['가벼운 쿼리', 1, 0.5], ['무거운 쿼리 (복잡도 높음)', 6, 1.2]].forEach(([n, cost, a], i) => { mono(330, 104 + i * 44, n, { 'font-size': 14, opacity: fade(u, a) }); mono(620, 104 + i * 44, `토큰 −${cost}`, { 'font-size': 14, 'font-weight': 800, fill: i ? BAD : INK, opacity: fade(u, a + 0.2) }); });
      sub(330, 190, '토큰 수는 예시', 1, { 'text-anchor': 'start', 'font-size': 13.5 });
      tx(60, 260, 'CORS whitelist', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.6) });
      [['https://app.example.com', true], ['https://evil.example', false]].forEach(([o, ok], i) => { mono(80, 296 + i * 34, o, { 'font-size': 14, opacity: fade(u, 1.7 + i * 0.2) }); (ok ? check : cross)(400, 291 + i * 34, 9, pop(u, 1.8 + i * 0.2)); });
      note(500, 300, '요청 수보다 요청 하나의 무게가 문제다', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 3) { code(40, 60, ['variables: { "email": "kim@x.io",', '             "card": "4111…" }'], 2, { fs: 14, title: '로그로 가기 전', op: fade(u, 0.2) });
      grow(440, 90, 500, 90, E(u, 0.6, 0.9), MUT); code(510, 60, [['variables: { "email": "***",', MUT], ['             "card": "***" }', MUT]], fade(u, 0.9) * 2, { fs: 14, title: '마스킹 후' });
      [0, 1].forEach((i) => { mono(60, 200 + i * 36, 'createOrder  Idempotency-Key: 7f3a', { 'font-size': 14, opacity: fade(u, 1.2 + i * 0.3) }); (i ? cross : check)(420, 195 + i * 36, 9, pop(u, 1.4 + i * 0.3)); tx(440, 200 + i * 36, i ? '같은 키 → 다시 실행 안 함' : '실행', { 'font-size': 14, fill: i ? WARN : GOOD, opacity: fade(u, 1.4 + i * 0.3) }); });
      code(40, 300, ['connection_init { connectionParams: { authToken } }  → 만료되면 close'], fade(u, 2.0), { fs: 14, title: 'WebSocket' }); return; }
    terminal(60, 60, 840, 220, ['2026-11-24T09:12:03Z  user=9 (ADMIN)  deletePost id=10', '2026-11-24T09:14:47Z  user=1 (USER)   updateProfile email', '2026-11-24T09:20:11Z  user=9 (ADMIN)  banUser id=2'], E(u, 0.2, 1.8) * 3, { title: 'audit.log (예시)' });
    note(60, 330, '민감 mutation은 누가 · 언제 · 무엇을 바꿨는지 남긴다', fade(u, 2.0)); }

  // ---------- 4. Observability ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const ax = R.axes(80, 70, 420, 230, { x: [0, 10], y: [0, 10], xt: [], yt: [], xl: '응답 시간', yl: 'GetFeed 요청 수' });
      const pts = []; for (let v = 0; v <= 10; v += 0.25) pts.push([v, 9 * Math.exp(-Math.pow((v - 2) / 1.2, 2)) + 1.5 * Math.exp(-v / 3)]); R.line(ax, pts, E(u, 0.2, 1.2), INFO);
      [['p50', 2.1], ['p95', 5.2], ['p99', 7.6]].forEach(([n, v], i) => { const op = fade(u, 1.2 + i * 0.3); el('line', { x1: ax.X(v), y1: 80, x2: ax.X(v), y2: 300, stroke: i ? WARN : GOOD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: op });
        tx(ax.X(v), 80 + i * 18, n, { 'font-size': 14, 'font-weight': 800, fill: i ? WARN : GOOD, 'text-anchor': 'middle', opacity: op }); });
      sub(290, 392, '분포 모양은 예시', 1, { 'font-size': 13.5 });
      [['UNAUTHENTICATED', 0.6], ['BAD_USER_INPUT', 0.3], ['INTERNAL', 0.1]].forEach(([n, f], i) => { const y = 120 + i * 50; mono(580, y, n, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.8 + i * 0.15) }); el('rect', { x: 580, y: y + 8, width: 300 * f * E(u, 1.8, 2.4), height: 14, rx: 4, fill: i === 2 ? BAD : WARN }); });
      tx(580, 90, 'operation × error code', { 'font-size': 14, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { const L = [['OTel trace', 'resolver 단 span', INFO], ['Sentry', 'INTERNAL_SERVER_ERROR 캡처', BAD], ['DB slow query log', '느린 SQL', WARN], ['WebSocket', '활성 연결 수 · 메시지 rate', ACC]];
      el('line', { x1: 140, y1: 60, x2: 140, y2: 380, stroke: INK, 'stroke-width': 3 }); mono(140, 46, 'request 7c1e…', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' });
      L.forEach(([a, b, col], i) => { const y = 100 + i * 78, s = pop(u, 0.3 + i * 0.4); grow(140, y, 260, y, E(u, 0.3 + i * 0.4, 0.6 + i * 0.4), col, { plain: true });
        card(480, y, 420, 58, { rx: 10, stroke: col, s }); tx(290, y - 4, a, { 'font-size': 15.5, 'font-weight': 800, opacity: s }); tx(290, y + 18, b, { 'font-size': 13.5, fill: MUT, opacity: s }); });
      return; }
    if (k === 2) { [['error rate > 1% · 5분', 'P1 호출', BAD], ['schema diff (breaking)', 'Slack', INFO], ['PQ allowlist miss 급증', '배포 문제 의심', WARN]].forEach(([a, b, col], i) => {
        const y = 90 + i * 100, s = pop(u, 0.3 + i * 0.5); R.clock(90, y, 24, E(u, 0.3 + i * 0.5, 1.0 + i * 0.5), col);
        card(420, y, 520, 64, { rx: 10, stroke: col, sw: 2, s }); mono(180, y + 5, a, { 'font-size': 15, 'font-weight': 700, opacity: s }); pill(600, y, b, col, s, { fs: 14 }); });
      note(60, 400, '알람은 행동할 수 있는 것만. 나머지는 대시보드로', fade(u, 2.3)); return; }
    if (k === 3) { code(40, 60, ['apollographql-client-name: ios-app', 'apollographql-client-version: 3.2.1', 'x-correlation-id: 7c1e…'], E(u, 0.2, 1.2) * 3, { fs: 14.5, title: '요청 헤더 (값은 예시)' });
      [['ios-app 3.2.1', 'error 0.1%', GOOD], ['ios-app 3.1.0', 'error 4%', BAD]].forEach(([a, b, col], i) => { const y = 230 + i * 56, s = pop(u, 1.4 + i * 0.3); card(250, y, 420, 46, { rx: 8, stroke: col, s });
        mono(60, y + 5, a, { 'font-size': 15, 'font-weight': 700, opacity: s }); mono(300, y + 5, b, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s }); });
      note(520, 250, '구버전 앱만 깨지는지', fade(u, 2.0)); note(520, 276, '5분 안에 확인한다', fade(u, 2.2), { fill: ACC }); sub(250, 360, '버전과 비율은 예시', 1, { 'font-size': 13.5 }); return; }
    const S = ['1. 증상 확인: 어느 operation · code', '2. 최근 배포·스키마 변경 확인', '3. rollback 또는 scale up', '4. 회고: 빠진 체크 항목 찾기'];
    S.forEach((s, i) => { const y = 80 + i * 56, op = fade(u, 0.2 + i * 0.35); el('rect', { x: 60, y: y - 26, width: 480, height: 42, rx: 8, fill: SOFT, stroke: GRID, opacity: op }); tx(76, y, s, { 'font-size': 15, 'font-weight': 700, opacity: op }); });
    tx(60, 40, 'runbook', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
    card(760, 160, 240, 120, { rx: 12, stroke: WARN, sw: 2, s: pop(u, 1.8) }); tx(760, 150, '정기 chaos test', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
    tx(760, 176, '부하 · 의존성 장애 흉내', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
    note(60, 380, '사고를 끝내는 것은 도구가 아니라 절차를 아는 사람이다', fade(u, 2.3)); }

  // ---------- 5. 48 항목 ----------
  const AX = [['Schema', ACC], ['Performance', INFO], ['Security', BAD], ['Observability', GOOD]];
  const ITEMS = ['Schema-first 단일 출처', 'operation 이름 항상', 'mutation: 동사+명사', 'subscription: 과거시제', 'mutation 인자 input 묶음', 'mutation 응답 Payload/union',
    'non-null 신중', '새 필드는 nullable 시작', 'JSON scalar 남발 X', '@deprecated(reason)', 'Enum 값 제거 금지', 'Registry + CI check',
    'DataLoader 전체 *ById', 'context.loaders 요청 단위', 'N+1 trace 자동 탐지', '@cacheControl 비싼 필드', 'Redis response cache', 'Persisted Query CDN',
    'Apollo Client cache', 'Relay Connection', 'first 강제 (max=100)', 'DB FK + sort 인덱스', 'statement_timeout', 'p95 < 100ms 목표',
    'JWT 검증 ctx.user', 'field-level auth', '@auth/shield 정책', 'introspection OFF (prod)', 'Depth Limit 7~10', 'Complexity Score',
    'Timeout 5s (3 단)', 'Persisted Allowlist', 'Rate limit', 'CORS whitelist', 'PII 마스킹', 'Idempotency key',
    'operation 이름 표준화', 'Apollo Studio / Hive', 'OpenTelemetry resolver trace', 'p50/95/99', 'operation×code error 분포', 'Sentry INTERNAL capture',
    'Schema diff Slack 알람', 'PQ allowlist miss 알람', 'WS 연결 모니터', 'DB slow query log', 'Client Awareness', 'runbook + chaos test'];
  function grid48(done, cur, u) { AX.forEach(([n, col], r) => { tx(40, 66 + r * 52, n, { 'font-size': 14, 'font-weight': 800, fill: col });
      for (let q = 0; q < 12; q++) { const i = r * 12 + q, x = 170 + q * 62, y = 44 + r * 52, on = i < done, isCur = cur && i >= cur[0] && i < cur[1];
        const f = isCur ? clamp((u - 0.3) * 4 - (i - cur[0]) * 0.5) : on ? 1 : 0;
        el('rect', { x, y, width: 56, height: 38, rx: 6, fill: f > 0 ? col : PANEL, stroke: f > 0 ? 'none' : GRID, 'stroke-width': 1.5, opacity: f > 0 ? 0.3 + 0.55 * f : 1 });
        mono(x + 28, y + 24, String(i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: f > 0.5 ? PANEL : MUT }); } }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['launch 전', '1회 전체'], ['운영 중', '분기마다 1회'], ['사고 후', '회고에서 갭 찾기']].forEach(([a, b], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.4);
        R.clock(x, 150, 46, (i + 1) / 4, [ACC, INFO, WARN][i]); card(x, 270, 240, 70, { rx: 12, stroke: [ACC, INFO, WARN][i], s });
        tx(x, 264, a, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); tx(x, 288, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
      note(480, 380, '같은 표를 세 시점에 펼친다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k <= 8) { const a = (k - 1) * 6, b = a + 6; grid48(a, [a, b], u);
      ITEMS.slice(a, b).forEach((s, i) => { const x = 60 + (i % 2) * 440, y = 290 + Math.floor(i / 2) * 36, op = fade(u, 0.4 + i * 0.25);
        mono(x, y, String(a + i + 1).padStart(2, ' ') + '.', { 'font-size': 14, fill: AX[Math.floor(a / 12)][1], 'font-weight': 800, opacity: op }); tx(x + 36, y, s, { 'font-size': 15, opacity: op }); });
      mono(900, 280, `${b} / 48`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: AX[Math.floor(a / 12)][1], opacity: fade(u, 1.8) }); return; }
    grid48(48, null, u);
    [['40 이상', '출항 가능', GOOD], ['30 ~ 40', '출항하되 분기 점검 필수', WARN], ['30 미만', '빠진 항목부터 처리', BAD]].forEach(([a, b, col], i) => { const y = 290 + i * 40, s = pop(u, 0.3 + i * 0.4);
      pill(130, y, a, col, s, { fs: 15, mono: true }); tx(220, y + 5, b, { 'font-size': 15, 'font-weight': 700, opacity: s }); });
    mono(900, 330, '✓ 수 / 48', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.6) }); tx(900, 360, '= 운영 성숙도', { 'font-size': 15, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: 'Post.oldTitle을 더 이상 안 쓰게 하려 한다. 체크리스트대로라면 먼저 할 일은 무엇인가?',
      o: ['스키마에서 바로 지운다', '@deprecated(reason)를 붙이고 사용량이 0이 된 뒤 지운다', '타입을 String!으로 바꾼다'], a: 1,
      why: '필드 삭제는 쓰는 클라이언트를 깨뜨린다. 먼저 알리고 Registry의 사용량이 0이 된 뒤 지운다.' },
    { q: '글 50개의 author를 그냥 resolver로 풀면 DB를 50번 부른다. DataLoader를 쓰면 몇 번인가? (작성자 5명)',
      o: ['1번', '5번', '50번'], a: 0,
      why: 'DataLoader는 한 틱 동안 load 된 키를 모아 배치 함수를 한 번 부른다. 실행해 보면 키 5개로 1번 호출된다.' },
    { q: 'DoS 방어로 겹쳐 거는 것에 들어가지 않는 것은 무엇인가?',
      o: ['Depth Limit', 'Query Timeout', 'normalized cache'], a: 2,
      why: 'Depth · Complexity · Timeout을 겹치고 마지막에 Allowlist를 둔다. normalized cache는 클라이언트 성능 항목이다.' },
    { q: '"구버전 앱만 깨진다"를 빨리 확인하려면 어떤 항목이 있어야 하는가?',
      o: ['Client Awareness (클라이언트 이름·버전)', 'DB slow query log', 'runbook'], a: 0,
      why: '요청에 클라이언트 이름과 버전이 붙어 있어야 버전별 error를 나눠 볼 수 있다.' },
    { q: '48 항목 중 ✓ 가 33개다. 체크리스트의 판정은 무엇인가?',
      o: ['출항 가능', '출항하되 분기 점검 필수', '출항 전에 빠진 항목부터 처리'], a: 1,
      why: '40 이상이면 출항 가능, 30~40은 출항하되 분기 점검 필수, 30 미만이면 빠진 항목부터 처리한다.' },
  ];
  const summary = [
    '운영 점검은 Schema, Performance, Security, Observability 네 축에 12개씩 48개 항목이다.',
    '스키마는 이름 규칙과 nullable 시작, @deprecated로 클라이언트를 깨지 않고 바꾼다.',
    '성능은 요청마다 새 DataLoader, 캐시 4층, first 상한으로 N+1과 목록 폭증을 막는다.',
    '보안은 인증과 방어선을 겹치고, 관찰성은 operation 이름과 알람, runbook으로 사고를 끝낸다.',
  ];
  const review = [
    { q: '배포 직후 PQ allowlist miss가 급증했다. 체크리스트 기준으로 먼저 의심할 것은?',
      o: ['새 클라이언트 빌드의 쿼리가 allowlist에 등록되지 않은 채 배포됐다', 'DB 인덱스가 빠졌다', 'introspection이 켜져 있다'], a: 0,
      why: 'allowlist는 빌드가 만든 목록으로 갱신된다. 배포 순서가 어긋나면 정상 쿼리도 목록에 없어 거절된다.' },
    { q: 'DataLoader를 서버 전역에 하나 만들어 두었더니 다른 사용자의 데이터가 보였다. 어느 항목을 어겼나?',
      o: ['DataLoader 모든 *ById resolver', 'context.loaders를 요청마다 새로 생성', 'Rate limit'], a: 1,
      why: 'loader는 캐시를 가진다. 전역에 두면 요청 사이에 캐시가 새니 context에서 요청마다 만든다.' },
    { q: '목록 필드 하나가 가끔 전체 테이블을 읽어 DB를 멈춘다. 함께 점검할 두 항목은?',
      o: ['operation 이름과 Sentry', 'introspection OFF와 CORS', 'first 강제(max 100)와 정렬 키 인덱스'], a: 2,
      why: 'first 없는 목록은 전체를 긁고, 인덱스 없는 정렬은 전체를 훑는다. 목록 필드와 인덱스는 한 쌍으로 본다.' },
  ];

  R.page({ title: '운영 4 축 × 12 = 48', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
