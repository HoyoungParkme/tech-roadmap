/* IV-1-2 Federation v2 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * compose 결과(@external 오류), query plan, subgraph 로 가는 실제 operation, _entities 의 representations,
 * __resolveReference 호출 수, 응답 JSON 은 @apollo/composition·@apollo/gateway 2.x 로 페이지 SDL 을 직접 돌린 결과다.
 * 예시 데이터: User u1 { name: "Kim", email: "kim@ex.com" }, 주문 o1(12000)·o2(3500) 의 buyer = u1. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, server, person, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 도메인 색: Users = INFO, Orders = ACC, Catalog = WARN, Payment = GOOD
  const DOM = { users: INFO, orders: ACC, catalog: WARN, payment: GOOD };
  const DOMBG = { users: INFOBG, orders: ACCBG, catalog: WARNBG, payment: GOODBG };
  // SDL 카드 (왼쪽 위 기준). lines: [[글, {col, hi, op}]]
  function sdl(x, y, w, title, lines, o) { o = o || {}; const lh = 22, h = 36 + lines.length * lh + 6, g = R.G(x, y, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('rect', { x: 0, y: 0, width: w, height: h, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2 }, g);
    el('rect', { x: 0, y: 0, width: w, height: 28, rx: 10, fill: o.headBg || SOFT }, g); el('rect', { x: 0, y: 18, width: w, height: 10, fill: o.headBg || SOFT }, g);
    tx(12, 19, title, { 'font-size': 14, 'font-weight': 700, fill: col }, g);
    lines.forEach(([s, lo], i) => { lo = lo || {}; if ((lo.op ?? 1) <= 0) return;
      if (lo.hi) el('rect', { x: 4, y: 32 + i * lh, width: w - 8, height: lh - 1, rx: 4, fill: lo.hi, opacity: lo.op ?? 1 }, g);
      mono(12, 48 + i * lh, s, { 'font-size': 14, fill: lo.col || INK, opacity: lo.op ?? 1, 'font-weight': lo.b ? 700 : 400 }, g); });
    return h; }
  // subgraph 서버 + 이름표
  function sg(cx, cy, name, o) { o = o || {}; const col = DOM[name] || INK; server(cx, cy, null, { stroke: col, lamp: col, s: o.s ?? 0.8, op: o.op });
    if ((o.s ?? 1) > 0.05) tx(cx, cy + 54, o.label || name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, opacity: o.op ?? 1 }); }
  function router(cx, cy, o) { o = o || {}; card(cx, cy, o.w || 150, 64, { rx: 12, stroke: INK, sw: 3, fill: SOFT, s: o.s, op: o.op });
    tx(cx, cy - 2, 'Router', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: o.op ?? 1 });
    if (o.sub) tx(cx, cy + 19, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 }); }

  // ---------- 1. 모놀리스 ----------
  const Q5 = [['me: User', 'users'], ['posts: [Post]', 'catalog'], ['orders: [Order]', 'orders'], ['products: [Product]', 'catalog'], ['payments: [Payment]', 'payment']];
  function mono1(o) { o = o || {}; card(400, 200, 330, 250, { rx: 14, stroke: o.stroke || INK, sw: 3, fill: o.fill });
    tx(250, 98, 'GraphQL 서버 1대', { 'font-size': 15, 'font-weight': 800, fill: o.stroke || INK });
    sdl(262, 112, 276, 'schema.graphql · type Query', Q5.map(([s, d]) => [s, { col: o.color ? DOM[d] : INK, hi: o.hiAll || (o.color ? DOMBG[d] : null) }]), { col: o.stroke || INK }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { mono1({});
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; person(400 + Math.cos(a) * 0 + (i - 4.5) * 34, 370, null, { s: 0.55 * pop(u, 0.3 + i * 0.06) }); }
      note(640, 120, '팀 10명', fade(u, 0.9), { 'font-size': 16 });
      el('line', { x1: 640, y1: 190, x2: 920, y2: 190, stroke: MUT, 'stroke-width': 2, opacity: fade(u, 1.2) }); tx(640, 176, '하루', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      for (let i = 0; i < 5; i++) { const s = pop(u, 1.4 + i * 0.15); card(670 + i * 56, 190, 30, 30, { rx: 15, text: '↑', fs: 15, stroke: GOOD, color: GOOD, s }); }
      note(640, 240, '배포 5번 · 문제 없음', fade(u, 2.2), { fill: GOOD }); return; }
    if (k === 1) { const inc = E(u, 1.8, 2.5); mono1({ color: true, stroke: inc > 0.5 ? BAD : INK });
      ['users', 'catalog', 'orders', 'payment'].forEach((d, i) => { const x = 690 + (i % 2) * 140, y = 70 + Math.floor(i / 2) * 60; pill(x, y, d + ' 팀', DOM[d], pop(u, 0.1 + i * 0.1), { fs: 14 }); });
      [[690, 200], [830, 200]].forEach(([x, y], i) => { grow(x, y, 540, 160 + i * 40, E(u, 0.6 + i * 0.2, 1.1 + i * 0.2), BAD); pill(x + 10, y + 26, 'PR #' + (41 + i), BAD, pop(u, 0.5 + i * 0.2), { fs: 13.5, mono: true }); });
      mono(560, 300, '<<<<<<< conflict', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      if (inc > 0) { cross(400, 200, 26 * inc, inc); note(640, 330, '장애 1건 = 전 도메인 다운', inc, { fill: BAD }); }
      note(640, 370, '30명 · 4도메인 · 한 파일', fade(u, 0.4), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 2) { const P = [[160, '모노레포 디렉터리 분리', '결국 한 프로세스'], [480, '도메인별 서버 + BFF', '클라가 endpoint N개'], [800, 'Schema Stitching', '게이트웨이가 다 안다']];
      P.forEach(([x, a, b], i) => { const s = pop(u, 0.2 + i * 0.6), op = fade(u, 0.3 + i * 0.6);
        card(x, 200, 290, 250, { rx: 12, stroke: WARN, sw: 2, s }); tx(x, 100, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: op });
        tx(x, 312, b, { 'text-anchor': 'middle', 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: op }); });
      // (a) 폴더 넷이 한 상자 안에
      card(160, 195, 200, 130, { rx: 10, stroke: INK, sw: 2, op: fade(u, 0.5) }); ['users/', 'catalog/', 'orders/', 'payment/'].forEach((d, i) => mono(80, 160 + i * 26, '📁 ' + d, { 'font-size': 14, opacity: fade(u, 0.6 + i * 0.08) }));
      // (b) 클라이언트 → 서버 4대
      person(400, 200, null, { s: 0.8 * pop(u, 0.9) }); [140, 180, 220, 260].forEach((y, i) => { grow(424, 200, 540, y, E(u, 1.1 + i * 0.08, 1.4 + i * 0.08), MUT); el('rect', { x: 546, y: y - 11, width: 34, height: 22, rx: 4, fill: PANEL, stroke: Object.values(DOM)[i], 'stroke-width': 2, opacity: fade(u, 1.2) }); });
      // (c) 두꺼운 게이트웨이
      card(800, 170, 200, 90, { rx: 10, stroke: BAD, sw: 4, fill: BADBG, op: fade(u, 1.5) }); ['join 규칙', 'User.orders → Order', '타입 합치기 코드'].forEach((s, i) => mono(712, 150 + i * 22, s, { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.6 + i * 0.1) }));
      [740, 800, 860].forEach((x, i) => { grow(x, 215, x, 262, E(u, 1.9, 2.2), MUT, { plain: true }); el('rect', { x: x - 14, y: 262, width: 28, height: 18, rx: 4, fill: PANEL, stroke: INK, 'stroke-width': 1.5, opacity: fade(u, 1.9) }); });
      return; }
    // k3: 쪼개지기 → subgraph 넷 + Router
    const sp = E(u, 0.3, 1.4), names = ['users', 'catalog', 'orders', 'payment'];
    names.forEach((d, i) => { const x = lerp(400, 300 + i * 160, sp), y = lerp(200, 300, sp); sg(x, y, d, { s: 0.65, op: clamp((sp - 0.5) * 3) }); });
    if (sp < 0.6) card(400, 200, 330, 250, { rx: 14, stroke: INK, sw: 3, op: 1 - sp / 0.6 });
    router(540, 140, { s: pop(u, 1.4), sub: 'supergraph' });
    names.forEach((d, i) => grow(540, 172, 300 + i * 160, 254, E(u, 1.8, 2.2), DOM[d], { plain: true }));
    person(120, 140, '클라이언트', { s: pop(u, 1.6) }); grow(150, 140, 462, 140, E(u, 1.9, 2.3), INK); mono(300, 128, '/graphql 하나', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  // ---------- 2. subgraph 정의 ----------
  const USERS_SDL = (o) => [['type User @key(fields: "id") {', { col: INFO, b: true }], ['  id: ID!', { hi: o.key ? INFOBG : null, b: o.key }], ['  name: String!'], ['  email: String'], ['}'], ['type Query { me: User user(id: ID!): User }', { op: o.q ?? 1 }]];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { sdl(60, 60, 520, 'users.graphql', [['extend schema', { b: true }], ['  @link(url: ".../federation/v2.3",'], ['        import: ["@key", "@shareable"])']], { col: INFO, s: pop(u, 0.2) });
      [['@key', 0], ['@shareable', 1]].forEach(([d, i]) => fly(360, 150, 680 + i * 150, 110, seg(u, 0.9 + i * 0.3, 1.6 + i * 0.3), d, { fill: INFO, mono: true, stay: true }));
      tx(680, 70, '쓸 수 있게 된 directive', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 1.0) });
      note(60, 250, '이 한 줄로 이 서버는 federation v2 subgraph가 된다', fade(u, 1.8), {});
      [['@external', 0], ['@requires', 1], ['@provides', 2]].forEach(([d, i]) => mono(80 + i * 150, 310, d, { 'font-size': 14.5, fill: OFF, opacity: fade(u, 2.0) }));
      note(60, 350, '나머지는 import에 적어야 쓸 수 있다', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    sg(130, k >= 2 ? 120 : 200, 'users', { label: 'Users subgraph' });
    if (k !== 4) sdl(240, 40, 380, 'users.graphql', USERS_SDL({ key: k === 1 }), { col: INFO, s: k === 1 ? pop(u, 0.2) : 1, op: k === 3 ? 0.55 : 1 });
    if (k === 1) { lock(560, 100, true, INFO, pop(u, 1.0)); note(240, 250, '@key = 이 User는 id 하나로 찾아갈 수 있다', fade(u, 1.3), { fill: INFO });
      note(240, 280, 'id · name · email의 주인은 Users 팀', fade(u, 1.8), { fill: MUT, 'font-size': 14.5 }); return; }
    // Order subgraph
    const ordS = k === 2 ? pop(u, 0.2) : 1;
    sg(130, 320, 'orders', { label: 'Orders subgraph', s: 0.8 * ordS });
    if (k === 2) { note(660, 120, '서버 2대', fade(u, 0.8), { 'font-size': 16 }); note(660, 150, '배포도 2갈래', fade(u, 1.1), { 'font-size': 16 });
      [[120, INFO], [320, ACC]].forEach(([y, col], i) => { el('line', { x1: 660, y1: 200 + i * 40, x2: 660 + 240 * E(u, 1.3 + i * 0.3, 2.2 + i * 0.3), y2: 200 + i * 40, stroke: col, 'stroke-width': 3 }); });
      sdl(240, 260, 380, 'orders.graphql', [['extend schema @link(… v2.3, import: ["@key"])']], { col: ACC, s: pop(u, 0.6) }); return; }
    if (k === 3 || k === 4) {
      const ol = [['type Order @key(fields: "id") {', { col: ACC, b: true }], ['  id: ID!'], ['  amount: Int!'], ['  buyer: User!', { hi: k === 3 ? ACCBG : null, b: k === 3 }], ['}']];
      if (k === 4) ol.push(['type User @key(fields: "id") {', { col: ACC, b: true, op: fade(u, 0.3) }], ['  id: ID!   # key 필드 그대로', { hi: GOODBG, op: fade(u, 0.6) }], ['  orders: [Order!]!', { hi: ACCBG, b: true, op: fade(u, 0.9) }], ['}', { op: fade(u, 0.3) }]);
      sdl(240, k === 3 ? 230 : 50, 380, 'orders.graphql', ol, { col: ACC });
      if (k === 3) { const pth = el('path', { d: 'M560,325 C700,325 700,80 620,70', fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 0.8) });
        note(700, 210, 'User의 데이터는', fade(u, 1.2), { fill: ACC }); note(700, 236, 'Orders에 없다', fade(u, 1.2), { fill: ACC }); note(700, 280, '채우는 일은 Router 몫', fade(u, 2.0), { fill: MUT, 'font-size': 14.5 }); return; }
      card(800, 300, 280, 96, { rx: 10, stroke: BAD, sw: 2, fill: BADBG, op: fade(u, 1.5) });
      tx(672, 278, 'id: ID! @external로 쓰면', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      mono(672, 304, 'Unknown directive', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) }); mono(672, 326, '"@external"  (compose 실패)', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) });
      note(660, 120, '같은 User를', fade(u, 1.0), { fill: ACC }); note(660, 146, 'Orders가 다시 열어', fade(u, 1.0), { fill: ACC }); note(660, 172, 'orders 필드를 더한다', fade(u, 1.0), { fill: ACC }); return; }
    // k5: supergraph User 합성
    const fx = 690, fy = 120, F = [['id: ID!', 'both'], ['name: String!', 'users'], ['email: String', 'users'], ['orders: [Order!]!', 'orders']];
    sdl(240, 230, 380, 'orders.graphql', [['type User @key(fields: "id") {', { col: ACC, b: true }], ['  id: ID!'], ['  orders: [Order!]!', { hi: ACCBG }], ['}']], { col: ACC, op: 0.55 });
    card(fx + 110, 210, 250, 200, { rx: 12, stroke: INK, sw: 3, s: pop(u, 0.2) }); tx(fx, 132, 'supergraph의 User', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) });
    F.forEach(([f, d], i) => { const a = seg(u, 0.5 + i * 0.3, 1.2 + i * 0.3), to = [fx + 10, 170 + i * 36], from = d === 'orders' ? [560, 318] : [560, to[1]];
      if (a > 0 && a < 1) fly(from[0], from[1], to[0] + 70, to[1], a, f.split(':')[0], { fill: d === 'orders' ? ACC : INFO, mono: true });
      if (a >= 1) { mono(fx, to[1] + 5, f, { 'font-size': 14.5 }); el('circle', { cx: fx + 220, cy: to[1], r: 6, fill: d === 'orders' ? ACC : d === 'users' ? INFO : MUT }); } });
    note(fx - 40, 345, '● Users  ● Orders가 주인', fade(u, 2.0), { 'font-size': 14, fill: MUT });
    note(fx - 40, 372, '클라이언트에겐 User 하나', fade(u, 2.3), { 'font-size': 14.5 }); }

  // ---------- 3. @key 와 reference ----------
  const REP = '{ __typename: "User", id: "u1" }';
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { sg(110, 220, 'users', { label: 'Users subgraph' });
      card(420, 220, 360, 230, { rx: 12, stroke: INFO, sw: 2 }); mono(260, 130, 'resolvers = {', { 'font-size': 15 });
      mono(284, 162, 'Query: { me, user },', { 'font-size': 15 });
      const sl = k === 0 ? pop(u, 0.5) : 1; card(420, 240, 300, 80, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: sl, dash: k === 0 ? '6 4' : null });
      mono(284, 222, 'User: {', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: sl });
      mono(300, 252, k === 0 ? '…' : '__resolveReference({ id })', { 'font-size': 14.5, fill: ACC, opacity: sl }); mono(260, 312, '}', { 'font-size': 15 });
      if (k === 0) { note(620, 100, 'Query 옆에', fade(u, 1.0), { fill: ACC }); note(620, 126, 'User 타입 resolver 자리', fade(u, 1.0), { fill: ACC }); return; }
      if (k === 1) { router(800, 90, { s: pop(u, 0.2) }); fly(800, 130, 520, 260, seg(u, 0.6, 1.6), REP, { fill: INK, mono: true });
        if (u > 1.6) card(800, 330, 300, 34, { rx: 8, text: REP, fs: 13.5, mono: true, stroke: INK });
        note(660, 380, '"이 id의 나머지 필드를 줘"', fade(u, 2.0), {}); return; }
      // k2: id 하나 → 전체 필드
      const fill = E(u, 0.6, 2.0); mono(640, 120, 'db.users.findById("u1")', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.3) });
      grow(600, 240, 680, 240, E(u, 0.4, 0.8), ACC);
      [['id', '"u1"'], ['name', '"Kim"'], ['email', '"kim@ex.com"']].forEach(([f, v], i) => { const a = clamp(fill * 3 - i);
        el('rect', { x: 690, y: 190 + i * 38, width: 240, height: 32, rx: 6, fill: i ? (a > 0.5 ? GOODBG : SOFT) : INFOBG, stroke: i ? GOOD : INFO, 'stroke-width': 1.5, opacity: i ? 0.4 + 0.6 * a : 1 });
        mono(702, 211 + i * 38, f + ': ' + (i === 0 || a > 0.5 ? v : ''), { 'font-size': 14, fill: i ? GOOD : INFO }); });
      note(690, 340, 'key 하나로 entity를 되살린다', fade(u, 2.1), { fill: GOOD }); return; }
    if (k === 3) { // 클라이언트 쿼리 트리, 필드 주인 색은 마지막에
      const rev = E(u, 1.6, 2.2), col = (d) => (rev > 0.5 ? DOM[d] : INK);
      const N = [[150, 200, 'orders(buyerId: "u1")', 'orders'], [440, 130, 'amount', 'orders'], [440, 270, 'buyer', 'orders'], [690, 220, 'name', 'users'], [690, 320, 'email', 'users']];
      [[0, 1], [0, 2], [2, 3], [2, 4]].forEach(([a, b], i) => grow(N[a][0] + (a ? 50 : 100), N[a][1], N[b][0] - 50, N[b][1], E(u, 0.3 + i * 0.2, 0.7 + i * 0.2), GRID, { plain: true }));
      N.forEach(([x, y, s, d], i) => card(x, y, i ? 100 : 200, 38, { rx: 8, text: s, fs: 14, mono: true, stroke: col(d), color: col(d), fill: rev > 0.5 ? DOMBG[d] : PANEL, s: pop(u, 0.1 + i * 0.2) }));
      note(40, 60, '클라이언트가 보내는 쿼리 하나', fade(u, 0.2), {});
      note(560, 400, '■ Orders  ■ Users가 채울 필드', rev, { 'font-size': 14, fill: MUT }); note(40, 400, '클라이언트는 이 색을 모른다', rev, { fill: MUT, 'font-size': 14.5 }); return; }
    if (k === 4 || k === 5) { // query plan (실행 결과)
      router(110, 210, { sub: 'query plan' });
      const steps = [['1 · Fetch orders', '{orders(buyerId:"u1"){amount buyer{__typename id}}}', ACC, 100], ['2 · Flatten orders.@.buyer · Fetch users', '_entities(representations){…on User{name email}}', INFO, 230]];
      steps.forEach(([h, op, col, y], i) => { const a = k === 4 ? seg(u, 0.2 + i * 0.8, 0.9 + i * 0.8) : 1;
        grow(186, 210, 250, y, a, col); card(590, y, 660, 80, { rx: 10, stroke: col, sw: 2, op: fade(a, 0.3) });
        tx(270, y - 14, h, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(a, 0.4) }); mono(270, y + 16, op, { 'font-size': 13.5, opacity: fade(a, 0.5) }); });
      if (k === 4) { grow(590, 330, 590, 340, E(u, 1.9, 2.0), INK, { plain: true });
        card(590, 352, 660, 48, { rx: 10, stroke: INK, sw: 2, op: fade(u, 2.0) }); mono(270, 358, '3 · 합치기 → {"orders":[{"amount":12000,"buyer":{"name":"Kim",…', { 'font-size': 13.5, opacity: fade(u, 2.1) }); return; }
      // k5: representations 2개, __resolveReference 2번
      el('rect', { x: 260, y: 290, width: 670, height: 120, rx: 10, fill: SOFT });
      tx(276, 314, 'variables.representations', { 'font-size': 14, 'font-weight': 700, fill: INFO });
      [0, 1].forEach((i) => card(420 + i * 300, 346, 280, 32, { rx: 8, text: REP, fs: 13.5, mono: true, stroke: INFO, s: pop(u, 0.3 + i * 0.3) }));
      tx(276, 396, `__resolveReference 호출 ${u > 1.2 ? (u > 1.8 ? 2 : 1) : 0}번 · _entities 요청 1번`, { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) }); return; }
    // k6: @key 변형과 directive
    tx(40, 50, '@key 변형', { 'font-size': 16, 'font-weight': 800 });
    [['@key(fields: "id orgId")', '복합 키 · 둘 다 있어야 찾는다'], ['@key(fields: "id") @key(fields: "sku")', '키 여러 개 · 어느 쪽으로도 찾는다']].forEach(([a, b], i) => {
      card(260, 100 + i * 64, 440, 50, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.2 + i * 0.3) }); mono(52, 96 + i * 64, a, { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) });
      tx(52, 116 + i * 64, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
    tx(520, 50, '이웃 directive', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.8) });
    [['@shareable', '같은 필드를 여러 subgraph가 정의'], ['@external', '다른 subgraph가 채우는 필드'], ['@requires', '계산에 남의 필드가 필요'], ['@provides', '가져올 때 함께 줄 수 있는 필드']].forEach(([a, b], i) => {
      const y = 96 + i * 62; pill(590, y, a, ACC, pop(u, 1.0 + i * 0.25), { mono: true, fs: 14 }); tx(660, y + 5, b, { 'font-size': 14, opacity: fade(u, 1.1 + i * 0.25) }); });
    note(40, 330, '모두 "이 필드의 주인이 누구인가" 를 스키마에 적는 방법이다', fade(u, 2.2), {}); }

  // ---------- 4. Router ----------
  const SGS = [['users', 4001], ['orders', 4002], ['catalog', 4003]];
  function topo(o) { o = o || {}; person(80, 210, '클라이언트', {}); grow(110, 210, 300, 210, o.cu ?? 1, INK);
    router(380, 210, { sub: ':4000' }); SGS.forEach(([n], i) => { const y = 90 + i * 120; grow(456, 210, 640, y, o.su ?? 1, DOM[n], { plain: true }); sg(700, y - 10, n, { s: 0.55, op: o.sop ? o.sop(i) : 1 }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { topo({ cu: E(u, 0.6, 1.1), su: E(u, 0.2, 0.6) });
      card(380, 330, 200, 44, { rx: 8, text: 'supergraph.graphql', fs: 14, mono: true, stroke: MUT, s: pop(u, 0.3) }); grow(380, 306, 380, 244, E(u, 0.5, 0.9), MUT);
      lock(260, 120, true, BAD, pop(u, 1.4)); mono(280, 126, 'introspection: false', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.5) });
      note(560, 400, '클라이언트가 아는 주소는 :4000 하나', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { topo({ sop: (i) => fade(u, 0.2 + i * 0.2) });
      SGS.forEach(([n, p], i) => mono(760, 96 + i * 120, `${n}-subgraph…:${p}`, { 'font-size': 14, fill: DOM[n], opacity: fade(u, 0.8 + i * 0.3) }));
      card(380, 340, 260, 56, { rx: 8, stroke: WARN, sw: 2, s: pop(u, 1.6) }); mono(270, 336, 'override_subgraph_url:', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(270, 358, '운영 주소로 덮어쓰기', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.7) }); return; }
    if (k === 2) { topo({});
      // catalog 가 느림 → 5초에서 끊김
      const tt = E(u, 0.3, 1.6); R.clock(600, 330, 24, tt, WARN, 'timeout 5s'); if (u > 1.6) cross(560, 300, 12, pop(u, 1.6));
      // 같은 쿼리 둘 → 하나
      [0, 1].forEach((i) => fly(110, 150 + i * 40, 300, 200, seg(u, 0.3 + i * 0.1, 1.2 + i * 0.1), 'Q', { fill: INFO }));
      if (u > 1.3) pill(380, 130, 'deduplicate_query', INFO, pop(u, 1.3), { mono: true, fs: 13.5 });
      dot([[456, 210], [640, 90]], seg(u, 1.6, 2.4), INFO, 7);
      note(40, 400, '같은 쿼리 둘은 한 번만 보내고, 느린 subgraph는 5초에서 끊는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 3) { topo({});
      card(200, 330, 300, 120, { rx: 10, stroke: GRID, sw: 2, s: pop(u, 0.2) }); tx(66, 292, 'Prometheus /metrics', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) });
      SGS.forEach(([n], i) => { const w = [150, 90, 210][i]; el('rect', { x: 66, y: 306 + i * 26, width: w * E(u, 0.5 + i * 0.2, 1.3 + i * 0.2), height: 16, rx: 3, fill: DOM[n] }); tx(290, 319 + i * 26, n, { 'font-size': 13.5, fill: DOM[n], 'text-anchor': 'end', opacity: fade(u, 0.6) }); });
      card(560, 395, 230, 44, { rx: 8, text: 'GraphOS ← APOLLO_KEY', fs: 14, stroke: INFO, color: INFO, s: pop(u, 1.6) });
      note(560, 30, '(막대 길이는 그림일 뿐인 예시)', fade(u, 0.8), { 'font-size': 13.5, fill: MUT }); return; }
    // k4: Router 가 하는 일
    const ST = [['parse', '쿼리 읽기'], ['plan', 'subgraph 별 sub-query'], ['fetch', '병렬 + _entities'], ['merge', '응답 조립']];
    ST.forEach(([a, b], i) => { const x = 130 + i * 230, s = pop(u, 0.2 + i * 0.35); card(x, 160, 190, 80, { rx: 12, stroke: ACC, sw: 2.5, s });
      mono(x, 156, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + i * 0.35) }); tx(x, 182, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.35) });
      if (i) grow(x - 135, 160, x - 97, 160, E(u, 0.3 + i * 0.35, 0.6 + i * 0.35), ACC); });
    dot([[35, 160], [925, 160]], seg(u, 1.6, 2.6), INK, 7);
    tx(480, 290, '같은 자리에 설 수 있는 것', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.7) });
    [['Apollo Router', 'Rust'], ['Cosmo Router', 'Go · OSS'], ['GraphQL Mesh', 'REST·gRPC도']].forEach(([a, b], i) => { card(250 + i * 230, 340, 200, 56, { rx: 10, stroke: i ? GRID : INK, sw: 2, s: pop(u, 1.9 + i * 0.2) });
      tx(250 + i * 230, 336, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0 + i * 0.2) }); tx(250 + i * 230, 356, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0 + i * 0.2) }); }); }

  // ---------- 5. Stitching vs Federation ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { const fed = k === 1, sh = fed ? E(u, 0.3, 1.5) : 0;
      tx(40, 44, fed ? 'Federation v2' : 'Schema Stitching', { 'font-size': 18, 'font-weight': 800, fill: fed ? GOOD : WARN });
      const gw = lerp(320, 170, sh), gh = lerp(130, 64, sh);
      card(480, 120, gw, gh, { rx: 12, stroke: fed ? INK : BAD, sw: fed ? 3 : 4, fill: fed ? SOFT : BADBG });
      tx(480, 120 - gh / 2 + 24, fed ? 'Router' : '게이트웨이', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
      if (!fed) ['User.orders → Order에서', 'Order.buyer → User에서', '타입 합치기 코드'].forEach((s, i) => mono(340, 116 + i * 22, s, { 'font-size': 13.5, fill: BAD, opacity: fade(u, 0.3 + i * 0.2) }));
      else tx(480, 140, '합성된 plan 실행만', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
      ['users', 'orders', 'catalog'].forEach((n, i) => { const x = 240 + i * 240; grow(480, 120 + gh / 2, x, 280, 1, GRID, { plain: true });
        card(x, 300, 170, 60, { rx: 10, stroke: DOM[n], sw: 2 }); tx(x, 296, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: DOM[n] });
        if (fed) mono(x, 318, '@key(fields: "id")', { 'text-anchor': 'middle', 'font-size': 13.5, fill: DOM[n], opacity: fade(u, 1.2 + i * 0.2) }); });
      if (!fed) { card(880, 300, 110, 60, { rx: 10, stroke: GOOD, sw: 2, dash: '6 4', s: pop(u, 1.3) }); tx(880, 305, 'payment', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
        grow(860, 268, 620, 150, E(u, 1.7, 2.2), BAD); pill(760, 200, '게이트웨이 PR 필요', BAD, pop(u, 2.1), { fs: 13.5 }); }
      else { ['join 규칙', '타입 합치기'].forEach((s, i) => fly(480, 110, 240 + i * 240, 350, seg(u, 0.2 + i * 0.2, 1.3 + i * 0.2), s, { fill: ACC }));
        note(40, 400, '지식이 subgraph로 옮겨 가고 Router는 얇아진다', fade(u, 2.0), {}); }
      return; }
    if (k === 2) { const rows = [['게이트웨이 코드', '많음', '거의 없음'], ['진화', '어려움', '쉬움'], ['표준', '비표준', 'Apollo 표준'], ['운영 도구', '빈약', 'GraphOS / Hive'], ['합성 시점', '게이트웨이 런타임', 'compose 빌드 단계']];
      tx(300, 60, 'Stitching', { 'font-size': 15, 'font-weight': 800, fill: WARN }); tx(560, 60, 'Federation v2', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      rows.forEach(([a, b, c2], i) => { const y = 100 + i * 60, f = fade(u, 0.2 + i * 0.35);
        el('rect', { x: 40, y: y - 20, width: 880, height: 48, rx: 8, fill: i % 2 ? PANEL : SOFT, opacity: f });
        tx(56, y + 9, a, { 'font-size': 15, 'font-weight': 700, opacity: f }); tx(300, y + 9, b, { 'font-size': 15, fill: WARN, opacity: f }); tx(560, y + 9, c2, { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.35) }); });
      return; }
    if (k === 3) { tx(40, 50, '도입 순서', { 'font-size': 18, 'font-weight': 800 });
      [['첫 도메인을', 'subgraph로 뗀다'], ['Router를 세우고', '하나만 등록'], ['두 번째 도메인을', '@key로 잇는다'], ['GraphOS / Hive로', 'schema diff 감시']].forEach(([s1_, s2_], i) => {
        const x = 70 + i * 205, y = 300 - i * 64, op = fade(u, 0.2 + i * 0.45);
        el('rect', { x, y, width: 190, height: 410 - y, rx: 8, fill: i === 3 ? ACCBG : SOFT, stroke: i === 3 ? ACC : GRID, 'stroke-width': 1.5, opacity: op });
        mono(x + 14, y + 30, String(i + 1), { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: op });
        tx(x + 14, y + 58, s1_, { 'font-size': 14.5, 'font-weight': 700, opacity: op }); tx(x + 14, y + 80, s2_, { 'font-size': 14.5, 'font-weight': 700, opacity: op }); });
      return; }
    tx(480, 120, '타입의 주인을 subgraph가 선언한다', { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, opacity: fade(u, 0.2, 0.8) });
    tx(480, 165, 'Router는 compose 된 plan만 실행한다', { 'text-anchor': 'middle', 'font-size': 17, fill: MUT, opacity: fade(u, 0.9) });
    [['@key', 'entity 식별'], ['_entities', 'reference 해결'], ['/graphql 하나', '클라이언트 시점']].forEach(([a, b], i) => { const s = pop(u, 1.2 + i * 0.25);
      card(250 + i * 230, 260, 200, 70, { rx: 10, stroke: ACC, sw: 2, s }); mono(250 + i * 230, 260, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3 + i * 0.25) });
      tx(250 + i * 230, 284, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3 + i * 0.25) }); });
    pill(480, 370, '다음 · IV-2-1 Caching', INFO, pop(u, 2.1), { fs: 14 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: '팀이 30명, 도메인이 4개로 늘자 단일 스키마에서 생긴 일은 무엇인가?',
      o: ['Query 필드가 많아져 GraphQL 문법 오류가 난다', 'PR 충돌이 잦고 장애 하나가 전 도메인으로 번진다', '클라이언트가 endpoint를 여러 개 불러야 한다'], a: 1,
      why: '한 파일과 한 프로세스를 네 팀이 같이 쓰니 충돌과 배포 결합이 매주 생긴다. endpoint가 여러 개가 되는 것은 도메인별 서버 + BFF의 문제다.' },
    { q: 'Orders subgraph가 User 타입에 orders 필드를 더할 때 key 필드 id는 어떻게 쓰는가?',
      o: ['id: ID!를 그대로 쓴다', 'id: ID! @external로 쓴다', 'id를 빼고 orders만 쓴다'], a: 0,
      why: 'v2에서 key 필드는 그대로 둔다. 원래 코드처럼 @external을 붙여 compose해 보면 Unknown directive 오류로 실패했다.' },
    { q: 'Router가 주문의 buyer 이름을 Users subgraph에서 받아 오는 방법은 무엇인가?',
      o: ['두 subgraph의 DB를 직접 JOIN한다', 'Orders가 Users를 HTTP로 직접 부른다', 'Orders에서 받은 __typename과 id를 _entities로 Users에 보낸다'], a: 2,
      why: '실행한 query plan은 Fetch orders 다음에 Flatten(orders.@.buyer)으로 users의 _entities를 불렀다. Users의 __resolveReference가 id로 나머지 필드를 채운다.' },
    { q: 'router.yaml에서 운영 환경의 subgraph 주소를 바꾸는 키는 무엇인가?',
      o: ['subgraphs.routing_url', 'override_subgraph_url', 'supergraph.listen'], a: 1,
      why: 'subgraph 주소는 compose 때 supergraph에 들어가고, Router 설정에서는 override_subgraph_url로 덮어쓴다. subgraphs 키는 rover의 supergraph.yaml 형식이다.' },
    { q: 'Stitching과 비교해 Federation v2에서 새 도메인을 붙일 때 달라지는 점은 무엇인가?',
      o: ['subgraph를 만들어 등록하면 되고 게이트웨이 코드는 손대지 않는다', '게이트웨이에 join 규칙을 더 적는다', '클라이언트가 새 endpoint를 하나 더 부른다'], a: 0,
      why: 'entity가 @key로 자기를 선언하니 join 지식이 subgraph에 있다. Router는 compose된 supergraph로 plan만 실행한다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    '스키마 한 파일을 여러 팀이 같이 쓰면 PR 충돌과 배포 결합, 장애 전파가 매주 생긴다.',
    'subgraph는 @key로 entity를 선언하고, 같은 타입을 여러 subgraph가 나눠 정의한다.',
    'Router는 orders에서 buyer의 id만 받고 _entities로 Users에 나머지 필드를 묻는다.',
    'v2에서 key 필드에 @external을 붙이면 compose가 실패한다. key 필드는 그대로 둔다.',
  ];
  const review = [
    { q: 'Router로 주문 목록을 받는데 Users DB에 같은 사용자 조회가 주문 수만큼 찍힌다. 먼저 손볼 곳은?',
      o: ['Router의 timeout을 늘린다', 'Users의 __resolveReference에 DataLoader를 붙인다', 'Orders subgraph에 User의 name을 복사한다'], a: 1,
      why: '_entities 요청은 한 번이어도 __resolveReference는 representation마다 불린다. 주문 2건에 u1이 두 번 실려 가 2번 불렸다.' },
    { q: '새 subgraph를 붙이고 compose했더니 Unknown directive "@external" 오류가 났다. 먼저 볼 것은?',
      o: ['Router의 override_subgraph_url 주소', '클라이언트 쿼리의 필드 이름', '@link의 import 목록과 key 필드의 @external'], a: 2,
      why: 'import에 없는 directive는 쓸 수 없고, v2의 key 필드는 @external 없이 그대로 쓴다.' },
    { q: '클라이언트 팀이 Federation으로 바꾸면 쿼리를 subgraph별로 나눠 보내야 하냐고 묻는다. 맞는 답은?',
      o: ['/graphql 하나에 한 쿼리를 그대로 보낸다', 'subgraph마다 쿼리를 따로 보낸다', 'query plan을 직접 적어 보낸다'], a: 0,
      why: '쿼리를 subgraph별로 쪼개는 일은 Router가 한다. 클라이언트가 보는 것은 /graphql 하나와 합성된 스키마 하나다.' },
  ];
  R.page({ title: 'Federation v2 — subgraph와 Router', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
