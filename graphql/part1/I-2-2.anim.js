/* I-2-2 설치 + Apollo Server 첫 쿼리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 버전(@apollo/server 5.5.2, graphql 16.15.0), 로그·응답 JSON·에러 문구·응답 바이트는
 * node 24 에서 페이지 코드를 그대로 돌려 받은 값이다 (2026-11, 포트만 4123 으로 바꿔 실행). */
(function () {
  const R = window.RA, { C, el, tx, spans, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly, zone,
    server, browser, person, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function codeLines(x, y, L, n, o) { o = o || {}; const lh = o.lh || 24, fs = o.fs || 14.5;
    L.forEach((ln, i) => { if (i >= n) return; const [s, a] = Array.isArray(ln) ? ln : [ln, {}];
      const part = i === Math.floor(n) && n % 1 ? s.slice(0, Math.round(s.length * (n % 1))) : s;
      mono(x, y + i * lh, part, Object.assign({ 'font-size': fs, fill: INK }, a)); }); }

  // ---------- 1. 설치: 터미널 + 폴더 ----------
  const TERM = [[0, '$ mkdir my-graphql && cd my-graphql'], [0, '$ npm init -y'], [1, '$ npm pkg set type=module'], [2, '$ npm i @apollo/server graphql'],
    [2, ['+ @apollo/server@5.5.2', '#86efac']], [2, ['+ graphql@16.15.0', '#86efac']], [4, '$ mkdir src'], [4, '$ touch src/index.js']];
  const TREE = [[0, 0, 'my-graphql/'], [0, 1, 'package.json'], [2, 1, 'node_modules/'], [2, 2, '@apollo/server/  5.5.2'], [3, 3, 'standalone/'], [2, 2, 'graphql/  16.15.0'], [4, 1, 'src/'], [4, 2, 'index.js']];
  function s1(t, c) { const { k, u } = c;
    const lines = TERM.filter(([at]) => at <= k).map(([, s]) => s), before = TERM.filter(([at]) => at < k).length;
    terminal(30, 40, 470, 300, lines, k === 3 ? lines.length : lerp(before, lines.length, E(u, 0.2, 1.6)), { title: 'bash', fs: 14 });
    tx(560, 56, '프로젝트 폴더', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    TREE.forEach(([at, lv, s], i) => { if (at > k) return; const y = 90 + i * 34, a = at === k ? E(u, 0.6 + i * 0.1, 1.2 + i * 0.1) : 1, x = 570 + lv * 26;
      if (a <= 0) return; const hot = (k === 3 && (i === 3 || i === 4 || i === 5)) || at === k;
      if (lv) el('path', { d: `M${x - 16},${y - 22} V${y - 5} H${x - 4}`, fill: 'none', stroke: GRID, 'stroke-width': 1.6, opacity: a });
      mono(x, y, s, { 'font-size': 14.5, 'font-weight': hot ? 800 : 500, fill: hot ? ACC : INK, opacity: a }); });
    if (k >= 1) { const a = k === 1 ? pop(u, 1.4) : 1; pill(820, 124, '"type": "module"', ACC, a, { mono: true, fs: 13.5 }); }
    if (k === 1) note(560, 380, 'import 문법을 쓰려면 이 한 줄이 먼저', fade(u, 1.8));
    if (k === 2) note(560, 380, '필수 패키지는 둘뿐 (지금 npm 은 서버 5.x)', fade(u, 1.8));
    if (k === 3) { tx(840, 230, 'HTTP · 플러그인', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) }); tx(800, 264, 'standalone 은 코어 안에', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(800, 298, 'parse · validate · execute', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) }); note(560, 380, '따로 설치할 standalone 패키지는 없다', fade(u, 1.9)); }
    if (k === 4) note(560, 380, '스키마·리졸버·부팅을 이 한 파일에', fade(u, 1.8));
    if (k === 0) note(560, 380, '평범한 Node 프로젝트에서 시작한다', fade(u, 1.8));
  }

  // ---------- 2. typeDefs + resolvers ----------
  const TD = ['const typeDefs = `#graphql', '  type Query {', '    hello: String!', '  }', '`;'];
  const RS = ['const resolvers = {', '  Query: {', '    hello: () => "Hello GraphQL!",', '  },', '};'];
  const LY = (i) => 80 + i * 24;
  function s2(t, c) { const { k, u } = c;
    zone(24, 34, 420, 160, 'typeDefs · 무엇을 주는가 (SDL)', { fill: k === 0 || k === 1 ? ACCBG : SOFT });
    codeLines(42, LY(0), TD.map((s, i) => [s, { fill: i === 2 ? ACC : INK, 'font-weight': i === 2 ? 800 : 500 }]), k === 0 ? lerp(0, 5, E(u, 0.2, 1.6)) : 5, { lh: 24, fs: 14.5 });
    if (k >= 2) { zone(500, 34, 436, 160, 'resolvers · 어떻게 구하는가', { fill: k === 2 || k === 3 ? ACCBG : SOFT });
      codeLines(518, LY(0), RS.map((s, i) => [s, { fill: i === 2 ? ACC : INK, 'font-weight': i === 2 ? 800 : 500 }]), k === 2 ? lerp(0, 5, E(u, 0.2, 1.4)) : 5, { lh: 24, fs: 14.5 });
      [1, 2].forEach((i) => grow(42 + tw(TD[i], 14.5) + 8, LY(i) - 5, 514, LY(i) - 5, k === 2 ? E(u, 1.4 + i * 0.2, 2.0 + i * 0.2) : 1, ACC, { sw: 1.4, dash: '3 4', plain: true })); }
    if (k === 1) { const x = 42 + tw('    hello: String', 14.5); el('circle', { cx: x + 4, cy: LY(2) - 5, r: 13 * pop(u, 0.3), fill: 'none', stroke: BAD, 'stroke-width': 2.5 });
      card(260, 270, 300, 70, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 0.8), text: 'String!  = null 이면 안 된다\nString   = null 이어도 된다', fs: 15, mono: true });
      note(560, 266, 'Query 에 없는 필드는', fade(u, 1.6)); note(560, 294, '클라이언트가 물을 수 없다', fade(u, 1.8), { fill: ACC }); }
    if (k === 0) note(42, 250, 'type Query 는 조회용 루트 타입', fade(u, 1.8));
    if (k === 2) note(42, 250, '키 구조가 typeDefs 의 타입·필드 이름과 같다', fade(u, 2.2), { fill: ACC });
    if (k === 3) { tx(42, 240, '리졸버 시그니처', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      ['parent', 'args', 'context', 'info'].forEach((s, i) => card(92 + i * 108, 276, 96, 36, { rx: 8, text: s, fs: 14, mono: true, stroke: GRID, color: MUT, s: pop(u, 0.2 + i * 0.15) }));
      tx(42, 326, '지금은 하나도 쓰지 않는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      fly(720, LY(2), 720, 300, seg(u, 1.0, 1.8), '"Hello GraphQL!"', { mono: true, stay: true }); tx(720, 340, '반환값 = 응답의 hello', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.9) }); }
    if (k === 4) { const rows = [[GOOD, '이름이 맞을 때', '{"data":{"hello":"Hello GraphQL!"}}'], [BAD, 'resolvers 에 helo (오타)', '시작 실패: Query.helo defined in resolvers, but not in schema'],
        [WARN, 'resolvers 에 hello 없음', '"Cannot return null for non-nullable field Query.hello." · data: null']];
      rows.forEach(([col, a, b], i) => { const y = 236 + i * 58, s = pop(u, 0.2 + i * 0.5);
        if (col === GOOD) check(40, y, 9, s); else cross(40, y, 8, s);
        tx(60, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.3 + i * 0.5) });
        mono(60, y + 29, b, { 'font-size': 13.5, opacity: fade(u, 0.5 + i * 0.5) }); });
      tx(930, 410, 'Apollo Server 5.5.2 실행 결과', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.0) }); }
  }

  // ---------- 3. ApolloServer → 포트 4000 ----------
  function s3(t, c) { const { k, u } = c, b = c.beat;
    // 서버 상자
    const sx = 560, sy = 170, on = k >= 2;
    el('rect', { x: sx - 180, y: sy - 90, width: 360, height: 180, rx: 14, fill: k >= 1 ? PANEL : 'none', stroke: k >= 1 ? INK : GRID, 'stroke-width': 2.2, 'stroke-dasharray': k >= 1 ? null : '6 5' });
    tx(sx - 166, sy - 64, k >= 1 ? 'new ApolloServer({ typeDefs, resolvers })' : 'ApolloServer', { 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: MUT });
    if (k === 0) { [['@apollo/server', 'ApolloServer', 70], ['@apollo/server/standalone', 'startStandaloneServer', 160]].forEach(([from, name, y], i) => { const s = pop(u, 0.3 + i * 0.5);
        card(150, y, 240, 40, { rx: 8, text: from, fs: 13.5, mono: true, stroke: GRID, s }); grow(272, y, 404, i ? sy + 60 : sy - 40, E(u, 0.8 + i * 0.5, 1.4 + i * 0.5), ACC);
        pill(150, y + 36, name, ACC, pop(u, 0.6 + i * 0.5), { mono: true, fs: 13.5 }); });
      note(40, 300, 'standalone 은 서브패스에서 가져온다', fade(u, 2.0)); }
    if (k >= 1) { const a = k === 1 ? E(u, 0.3, 1.4) : 1;
      card(lerp(240, sx - 70, a), sy - 14, 104, 34, { rx: 8, text: 'typeDefs', fs: 13.5, mono: true, stroke: ACC });
      card(lerp(240, sx + 70, a), sy + 30, 104, 34, { rx: 8, text: 'resolvers', fs: 13.5, mono: true, stroke: ACC });
      if (a >= 1) tx(sx, sy + 76, '스키마 조립 끝', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 1.5) : 1 }); }
    // 포트
    const px = sx + 180; el('rect', { x: px - 8, y: sy - 22, width: 26, height: 44, rx: 5, fill: on ? ACC : PANEL, stroke: on ? ACC : MUT, 'stroke-width': 2, 'stroke-dasharray': on ? null : '4 3' });
    mono(px + 32, sy + 5, ':4000', { 'font-size': 16, 'font-weight': 800, fill: on ? ACC : OFF });
    if (k === 1) note(40, 330, '네트워크는 아직 없다 (포트 닫힘)', fade(u, 1.8), { fill: MUT });
    if (k === 2) { pill(sx, 320, 'url = http://localhost:4000/', ACC, pop(u, 1.0), { mono: true, fs: 15 }); grow(px + 5, sy + 24, sx + 60, 300, E(u, 0.5, 1.0), ACC); }
    if (k === 3) terminal(30, 280, 600, 120, ['$ node src/index.js', ['🚀 GraphQL ready at http://localhost:4000/', '#86efac']], lerp(0, 2, E(u, 0.2, 1.4)), { title: 'bash', fs: 15 });
    if (k === 4) { const R3 = [['POST /', '200 · {"data":{"hello":"Hello GraphQL!"}}', GOOD], ['POST /graphql', '200 · 같은 응답 (경로를 보지 않는다)', GOOD], ['GET / (브라우저)', 'text/html · Apollo Sandbox', INFO]];
      R3.forEach(([a, b2, col], i) => { const y = 300 + i * 38, s = pop(u, 0.2 + i * 0.4);
        pill(110, y, a, col, s, { mono: true, fs: 13.5 }); grow(200, y, 250, y, E(u, 0.4 + i * 0.4, 0.8 + i * 0.4), col);
        mono(262, y + 5, b2, { 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.4) }); }); }
  }

  // ---------- 4. Apollo Sandbox ----------
  function s4(t, c) { const { k, u } = c, b = c.beat;
    const s = k === 0 ? pop(u, 0.2) : 1;
    browser(480, 220, 900, 360, null, { s });
    if (s < 0.9) return;
    mono(130, 54, 'localhost:4000', { 'font-size': 14, fill: MUT });
    const panes = [[30, 230, '스키마 (explorer)'], [270, 400, 'Operation 에디터'], [680, 250, 'Response']];
    if (k === 0) { note(480, 230, '같은 주소, GET 으로 열면 이 화면', fade(u, 0.9), { 'text-anchor': 'middle' }); note(480, 260, 'POST 로 보내면 쿼리 실행', fade(u, 1.4), { 'text-anchor': 'middle', fill: MUT }); return; }
    panes.forEach(([x, w, name], i) => { const a = k === 1 ? E(u, 0.2 + i * 0.3, 0.6 + i * 0.3) : 1;
      el('rect', { x: x + 4, y: 70, width: w - 8, height: 326, rx: 6, fill: SOFT, opacity: a }); tx(x + 16, 92, name, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: a }); });
    // 왼쪽: 인트로스펙션으로 그린 트리
    const ta = k === 1 ? E(u, 1.2, 1.8) : 1;
    mono(46, 126, 'Query', { 'font-size': 14.5, 'font-weight': 800, opacity: ta }); el('path', { d: 'M52,134 V152 H64', fill: 'none', stroke: GRID, 'stroke-width': 1.6, opacity: ta });
    spans(70, 158, [['hello', { 'font-weight': 700, fill: ACC }], [': String!', { fill: MUT }]], { 'font-size': 14.5, opacity: ta });
    if (k === 1) { tx(46, 200, '__schema 로 물어 받은', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 2.0) }); tx(46, 220, '타입 그대로', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 2.0) });
      ['{"queryType":{"name":"Query",', ' "fields":[{"name":"hello",', '  "type":{"kind":"NON_NULL",', '   "ofType":{"name":"String"}}}]}}'].forEach((s, i) => mono(286, 130 + i * 22, s, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) })); }
    if (k === 2) { codeLines(290, 130, ['query {', '  he'], lerp(0, 2, E(u, 0.2, 0.9)), { lh: 24 });
      const s2 = pop(u, 1.1); card(400, 196, 170, 40, { rx: 6, s: s2, stroke: ACC, fill: PANEL });
      if (s2 > 0.5) spans(330, 201, [['hello', { 'font-weight': 800, fill: ACC }], ['  String!', { fill: MUT }]], { 'font-size': 14 });
      grow(178, 154, 288, 154, E(u, 1.6, 2.2), ACC, { dash: '4 4' }); tx(290, 270, '스키마에서 필드를 눌러도 에디터에 들어간다', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 2.2) }); }
    if (k === 3) { codeLines(290, 130, ['query {', '  hello', '}'], 3, { lh: 24 });
      ['Variables', 'Headers'].forEach((n, i) => { const a = pop(u, 0.3 + i * 0.6); card(330 + i * 110, 260, 100, 30, { rx: 6, text: n, fs: 13.5, stroke: i === 0 ? ACC : WARN, s: a }); });
      mono(290, 312, '{ "id": "1" }', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.8) });
      mono(290, 344, 'Authorization: Bearer eyJhbGc…', { 'font-size': 13.5, fill: WARN, opacity: fade(u, 1.4) });
      tx(290, 380, '토큰은 쿼리 문자열이 아니라 Headers 에', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) }); }
    if (k === 4) { codeLines(290, 130, ['query {', '  __typename', '}'], lerp(0, 3, E(u, 0.2, 0.9)), { lh: 24 });
      card(560, 136, 60, 30, { rx: 15, text: 'Run', fs: 13.5, stroke: ACC, color: PANEL, fill: ACC, s: pop(u, 1.0) });
      dot([[620, 150], [690, 150]], seg(u, 1.2, 1.6), ACC, 5);
      codeLines(694, 130, ['{', '  "data": {', '    "__typename":', '      "Query"', '  }', '}'], lerp(0, 6, E(u, 1.5, 2.2)), { lh: 24, fs: 14 });
      tx(286, 300, '서버가 자기 타입 이름을 답한다', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) });
      tx(286, 324, '인트로스펙션의 가장 작은 예', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.3) }); }
  }

  // ---------- 5. { hello } 를 직접 보낸다 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { person(60, 120, k === 0 ? 'curl' : 'fetch', { s: 0.9 }); server(860, 120, 'localhost:4000', { lamp: ACC, s: 0.8 });
      el('line', { x1: 100, y1: 120, x2: 800, y2: 120, stroke: GRID, 'stroke-width': 2.5 });
      const req = ['POST / HTTP/1.1', 'content-type: application/json', '', '{"query":"{ hello }"}'];
      zone(120, 170, 360, 140, '요청', { fill: SOFT });
      codeLines(138, 214, req.map((s, i) => [s, { fill: i === 3 ? ACC : INK, 'font-weight': i === 3 ? 800 : 500 }]), k === 0 ? lerp(0, 4, E(u, 0.2, 1.4)) : 4, { lh: 24, fs: 14 });
      if (k <= 1) dot([[100, 120], [800, 120]], seg(u, k === 0 ? 1.6 : 0.4, k === 0 ? 2.6 : 1.4), ACC, 7);
      if (k === 1) { mono(130, 350, 'body: JSON.stringify({ query: "{ hello }" })', { 'font-size': 14.5, opacity: fade(u, 0.3) });
        note(130, 384, 'Apollo Client 없이 fetch 한 번이면 된다', fade(u, 1.6)); }
      if (k === 0) note(130, 350, '한 주소에 JSON 을 POST 하는 것이 전부', fade(u, 2.0));
      if (k === 2) { dot([[800, 132], [100, 132]], seg(u, 0.2, 1.0), INK, 7);
        zone(520, 170, 410, 140, '응답 · 200 · 36 B', { fill: ACCBG });
        codeLines(538, 214, ['{', '  "data": {', '    "hello": "Hello GraphQL!"', '} }'], lerp(0, 4, E(u, 0.9, 1.8)), { lh: 24, fs: 14 });
        mono(130, 350, 'query Hello { hello }', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.8) }); grow(330, 345, 560, 262, E(u, 1.9, 2.4), ACC, { dash: '3 4', sw: 1.4 });
        tx(560, 360, '적은 필드 이름이 응답의 키', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) });
        tx(560, 386, '로컬 실측 2.5~6 ms (첫 요청 63 ms)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.3) }); }
      return; }
    if (k === 3) { // 봉투: data / errors / extensions
      const envs = [['{ hello }', GOOD, '200', '성공', ['"data": {', '  "hello":', '    "Hello GraphQL!"', '}']],
        ['{ helo }', BAD, '400', '검증 실패', ['"errors": [{ "message":', ' "Cannot query field', '  \\"helo\\" on type \\"Query\\".', '  Did you mean \\"hello\\"?" }]']],
        ['{ hello boom }', WARN, '200', '부분 응답', ['"data": { "hello": "Hello…",', '          "boom": null },', '"errors": [{ "message":', '  "DB 연결 실패",', '  "path": ["boom"] }]']]];
      envs.forEach(([q, col, st, kind, body], i) => { const x = 22 + i * 310, s = pop(u, 0.2 + i * 0.6);
        el('rect', { x, y: 40, width: 296, height: 260, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2.2, opacity: s ? 1 : 0 });
        el('path', { d: `M${x},40 L${x + 148},104 L${x + 296},40`, fill: 'none', stroke: col, 'stroke-width': 1.6, opacity: 0.5 * fade(u, 0.2 + i * 0.6) });
        mono(x + 16, 128, `${q} → ${st}`, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.6) });
        tx(x + 280, 128, kind, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.6) });
        body.forEach((ln, j) => mono(x + 16, 166 + j * 25, ln, { 'font-size': 13.5, opacity: fade(u, 0.5 + i * 0.6) })); });
      tx(940, 316, 'boom = 일부러 throw 하는 예시 리졸버', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.8) });
      ['data', 'errors', 'extensions'].forEach((n, i) => pill(320 + i * 160, 340, n, i === 1 ? BAD : i === 0 ? GOOD : MUT, pop(u, 1.8 + i * 0.15), { mono: true, fs: 14 }));
      tx(480, 390, '봉투의 키는 이 셋뿐. 리졸버 에러는 200 에 errors 가 붙어 온다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    // k 4: 다음 길
    const road = [['Type System', 'Int · String · [User] · User!'], ['3 루트', 'Query · Mutation · Subscription'], ['리졸버 4 인자', 'parent · args · context · info'], ['Input · Enum', 'Interface · Union']];
    el('path', { d: 'M60,250 C260,150 420,330 620,230 S880,170 920,200', fill: 'none', stroke: GRID, 'stroke-width': 10, 'stroke-linecap': 'round' });
    card(90, 250, 170, 50, { rx: 10, text: '✓ { hello }', fs: 16, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.1) });
    road.forEach(([a, b2], i) => { const x = 260 + i * 190, y = i % 2 ? 330 : 140, s = pop(u, 0.5 + i * 0.35);
      card(x, y, 230, 62, { rx: 10, text: a + '\n' + b2, fs: 13.5, stroke: ACC, s }); });
    tx(480, 404, 'Part II 에서 스키마 설계로 넘어간다', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
  }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'import 문법을 쓰려고 package.json에 먼저 넣는 설정은 무엇인가?',
      o: ['"type": "module"', '"main": "index.js"', '"private": true'], a: 0,
      why: 'npm pkg set type=module로 ES Modules를 켠다. 빠뜨리면 import 줄에서 바로 막힌다.' },
    { q: 'resolvers에 hello 대신 helo라고 잘못 적었을 때 일어나는 일은 무엇인가?',
      o: ['응답에 hello가 null로 온다', '서버가 시작부터 실패한다', '경고만 찍고 정상 동작한다'], a: 1,
      why: 'Apollo Server 5.5.2로 돌려 보니 "Query.helo defined in resolvers, but not in schema" 에러로 시작하지 못했다.' },
    { q: 'startStandaloneServer로 띄운 서버가 쿼리를 받는 경로는 무엇인가?',
      o: ['/graphql 하나', '/ 하나', '경로를 보지 않아 /와 /graphql 모두'], a: 2,
      why: '로그에는 http://localhost:4000/ 가 찍히지만 standalone은 경로를 보지 않는다. POST /graphql도 같은 응답을 줬다.' },
    { q: 'Apollo Sandbox 왼쪽 스키마 트리를 만드는 재료는 무엇인가?',
      o: ['서버의 인트로스펙션(__schema) 응답', '브라우저에 저장된 쿼리 기록', 'src/index.js 파일을 직접 읽은 내용'], a: 0,
      why: 'Sandbox는 서버에 __schema를 물어 받은 타입으로 트리와 자동완성을 만든다. { __typename }은 그 가장 작은 예다.' },
    { q: '{ hello boom }에서 boom 리졸버만 에러를 던질 때 오는 응답은 무엇인가?',
      o: ['HTTP 500, data 없음', 'HTTP 200, hello는 값이고 boom은 null, errors 배열', 'HTTP 400, errors만'], a: 1,
      why: '실행 중 에러는 부분 응답이 된다. 실제로 200과 함께 "boom": null, errors[0].path ["boom"]이 왔다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    '패키지는 @apollo/server와 graphql 둘이다. 지금 받으면 서버는 5.x, Node 20 이상이다.',
    'typeDefs는 무엇을 주는지, resolvers는 어떻게 구하는지 적고 두 이름 구조를 맞춘다.',
    'startStandaloneServer가 4000 포트를 열고, 같은 주소를 브라우저로 열면 Sandbox가 뜬다.',
    '값은 data에 담겨 오고 에러가 나면 errors 배열이 붙는다. HTTP 200만으로 성공을 판단하지 않는다.',
  ];
  const review = [
    { q: '서버를 띄웠는데 { hello }가 "Cannot return null for non-nullable field Query.hello."를 낸다. 먼저 볼 곳은?',
      o: ['package.json의 type 설정', 'resolvers에 Query.hello 함수가 있는지', '포트 4000이 열렸는지'], a: 1,
      why: '리졸버가 없으면 default resolver가 null을 내고, hello가 String!이라 에러가 된다.' },
    { q: '프런트 코드가 res.ok만 보고 성공 처리했더니 일부 칸이 빈 채로 화면에 나왔다. 먼저 의심할 것은?',
      o: ['응답 JSON에 errors 배열이 함께 왔다', 'Sandbox가 꺼져 있었다', '쿼리를 POST로 보냈다'], a: 0,
      why: '리졸버 에러는 HTTP 200에 data 일부와 errors가 함께 온다. 응답의 errors를 따로 봐야 한다.' },
    { q: '운영 서버에서 스키마 구조를 밖에 보이고 싶지 않다. 이 장의 코드에서 손볼 곳은?',
      o: ['startStandaloneServer의 port', 'typeDefs 앞의 #graphql 주석', 'ApolloServer 옵션의 introspection'], a: 2,
      why: 'Sandbox의 트리와 자동완성은 인트로스펙션 응답으로 만든다. 코드 주석처럼 운영에서는 introspection을 끄거나 환경 변수로 정한다.' },
  ];
  R.page({ title: 'Apollo Server 첫 실행', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
