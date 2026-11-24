/* III-1-1 Variables + Fragment — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 해시·에러 문구·resolver 가 받은 args 는 graphql-js 16 / node crypto 로 실제로 돌려 본 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, spans, person, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- GraphQL·JSON 글 상자 ----------
  const KW = /^(query|mutation|subscription|fragment|on|type|union|enum|input|directive|interface|scalar)$/;
  const JKW = /^(const|let|function|return|if|await|async|import|from|export|new|throw|typeof|switch|case|break)$/;
  function toks(s, lang) { const out = [], re = /(#.*$|\/\/.*$)|("(?:[^"\\]|\\.)*")|(\$\w+)|(@\w+)|(\.\.\.)|(\b\d+\b)|(\b\w+\b)|(\s+|.)/g; let m;
    while ((m = re.exec(s))) { const [t, cm, st, vr, dr, sp, nu, wd] = m;
      if (cm && !(lang === 'js' && t[0] === '#') && !(lang !== 'js' && t[0] === '/')) out.push([t, { fill: MUT }]);
      else if (st) { const key = lang === 'json' && /^\s*:/.test(s.slice(re.lastIndex)); out.push([t, key ? { fill: INFO, 'font-weight': 700 } : { fill: GOOD }]); }
      else if (vr) out.push([t, { fill: ACC, 'font-weight': 700 }]);
      else if (dr) out.push([t, { fill: WARN, 'font-weight': 700 }]);
      else if (sp) out.push([t, { fill: ACC, 'font-weight': 700 }]);
      else if (nu) out.push([t, { fill: WARN }]);
      else if (wd) out.push([t, (lang === 'js' ? JKW : KW).test(t) && lang !== 'json' ? { fill: INFO, 'font-weight': 700 } : /^(null|true|false)$/.test(t) ? { fill: WARN, 'font-weight': 700 } : {}]);
      else out.push([t, {}]); }
    return out; }
  // lines 를 상자에 쓴다. o: fs, w, title, shown(보일 줄 수, 소수면 마지막 줄 타이핑), hi(i), dim(i), lang('gql'|'json'|'js'), op
  function doc(x, y, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = o.lh || fs + 8, n = lines.length, h = n * lh + 18, op = o.op ?? 1;
    const w = o.w || Math.max(...lines.map((s) => tw(s, fs))) + 32, sh = o.shown ?? n;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: op });
    if (o.title) tx(x + 2, y - 9, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: op });
    lines.forEach((s, i) => { if (i >= Math.ceil(sh)) return; const part = i === Math.ceil(sh) - 1 && sh % 1 ? s.slice(0, Math.round(s.length * (sh % 1))) : s, ly = y + 9 + i * lh;
      if (o.hi && o.hi(i)) el('rect', { x: x + 4, y: ly, width: w - 8, height: lh, rx: 4, fill: o.hiFill || ACCBG, opacity: op });
      if (part) spans(x + 14, ly + lh / 2 + fs * 0.36, toks(part, o.lang), { 'font-size': fs, opacity: op * (o.dim && o.dim(i) ? 0.35 : 1) }); });
    return { x, y, w, h, lh, ly: (i) => y + 9 + i * lh + lh / 2, cx: (i, col) => x + 14 + col * fs * 0.6 }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const lpill = (x, y, s, col, sc, o) => pill(x + (tw(s, (o && o.fs) || 14) + 26) / 2, y, s, col, sc, o);   // 왼쪽 끝 기준 알약
  // 굽은 선이 자란다
  function curve(d, u, col, o) { o = o || {}; if (u <= 0) return; const p = el('path', { d, fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.2, pathLength: 100, 'stroke-dasharray': u < 1 ? `${u * 100} 100` : o.dash, opacity: o.op ?? 1, 'marker-end': u >= 1 && !o.plain ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null }); return p; }

  // ---------- 1. $id 변수 ----------
  const Q0 = ['query {', '  user(id: "1") {', '    name', '  }', '}'];
  const Q1 = ['query GetUser($id: ID!) {', '  user(id: $id) {', '    name', '  }', '}'];
  const HASH = { 1: '89401f57021f', 2: 'd5cf795ca14b', 3: 'dc698a036a2d', var: 'aea64633e736' };   // sha256(query 문자열) 앞 12자리 (node crypto)
  function s1(t, c) { const { k, u } = c;
    const D = doc(40, 70, k === 0 ? Q0 : Q1, { fs: 16, w: 330, title: k === 0 ? '쿼리 문서 · 값이 본문에 박힘' : '쿼리 문서 · $id 변수', tcol: k === 0 ? BAD : ACC,
      shown: k === 0 ? lerp(0, 5, E(u, 0.1, 1.0)) : 5, hi: (i) => (k === 1 && i <= 1) || (k === 2 && i === 1) });
    if (k === 0) { tx(500, 56, '서버가 받는 query 문자열', { 'font-size': 15, 'font-weight': 700 });
      tx(800, 56, 'sha256 앞자리', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      [1, 2, 3].forEach((id, i) => { const y = 108 + i * 64, s = pop(u, 0.5 + i * 0.4);
        person(520, y, null, { s: 0.62 * s });
        mono(552, y + 5, `user(id: "${id}")`, { 'font-size': 15, opacity: fade(u, 0.5 + i * 0.4) });
        grow(712, y, 788, y, E(u, 0.7 + i * 0.4, 1.0 + i * 0.4), BAD);
        card(860, y, 128, 32, { rx: 6, text: HASH[id], fs: 13.5, mono: true, stroke: BAD, color: BAD, s }); });
      note(500, 320, '같은 뜻인데 문자열이 사용자마다 다르다', fade(u, 2.0), { fill: BAD });
      sub(700, 350, '캐시 키도, 집계 이름도 사용자 수만큼 흩어진다', fade(u, 2.2), { 'font-size': 14 }); return; }
    // 선언과 사용
    if (k <= 2) { lpill(382, D.ly(0), '선언 · 타입 ID!', ACC, k === 1 ? pop(u, 0.9) : 1, { fs: 13.5 }); lpill(382, D.ly(1), '사용', ACC, k === 1 ? pop(u, 1.2) : 1, { fs: 13.5 }); }
    if (k === 1) { fly(400, D.ly(1), 640, 300, seg(u, 0.2, 1.4), '"1"', { mono: true, fill: WARN });
      mono(560, 150, 'query GetUser($id: ID!)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      mono(560, 184, 'function getUser(id)', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
      sub(700, 220, '변수 = 쿼리의 함수 인자', fade(u, 2.1), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { const V = doc(560, 250, ['{ "id": "1" }'], { lang: 'json', fs: 16, title: 'variables (JSON)', tcol: ACC, op: fade(u, 0.2) });
      dot([[560, V.ly(0)], [470, V.ly(0)], [470, D.ly(1)], [D.cx(1, 12), D.ly(1)]], seg(u, 0.8, 2.0), ACC, 7);
      note(560, 160, '본문은 그대로, 값만 따로 보낸다', fade(u, 0.4));
      sub(700, 190, 'SQL 의 parameterized query 와 같은 발상', fade(u, 1.2), { 'font-size': 14 }); return; }
    if (k === 3) { tx(560, 56, '같은 본문 + 다른 variables', { 'font-size': 15, 'font-weight': 700 });
      [1, 2, 3].forEach((id, i) => { const y = 100 + i * 52, s = pop(u, 0.2 + i * 0.25);
        card(620, y, 120, 34, { rx: 6, text: `{ "id": "${id}" }`, fs: 13.5, mono: true, stroke: ACC, color: INK, s });
        curve(`M682,${y} C730,${y} 730,152 776,152`, E(u, 0.6 + i * 0.2, 1.1 + i * 0.2), ACC, { plain: i !== 1 }); });
      card(850, 152, 140, 38, { rx: 6, text: HASH.var, fs: 14, mono: true, stroke: ACC, color: ACC, sw: 2.6, s: pop(u, 1.2) });
      sub(850, 192, '캐시 키 하나', fade(u, 1.4), { fill: ACC, 'font-weight': 700 });
      lpill(500, 262, 'persisted query · 해시로 GET 요청', GOOD, pop(u, 1.7), { fs: 14 });
      lpill(500, 304, '집계 · GetUser 한 줄에 3번', GOOD, pop(u, 2.0), { fs: 14 }); return; }
    if (k === 4) { const rows = [['$id: ID!', '필수 · null 안 됨'], ['$id: ID', '생략 · null 가능'], ['$first: Int = 10', '안 보내면 10'], ['$tags: [String!]!', '리스트 · 원소도 필수']];
      rows.forEach(([d, m], i) => { const y = 88 + i * 52, s = pop(u, 0.2 + i * 0.3), op = fade(u, 0.2 + i * 0.3);
        mono(470, y + 5, d, { 'font-size': 15, 'font-weight': 700, opacity: op });
        const vx = 680;
        if (i === 0) { card(vx + 30, y, 60, 30, { rx: 5, text: 'ID', fs: 13.5, mono: true, s }); card(vx + 72, y - 12, 20, 20, { rx: 10, text: '!', fs: 13.5, fill: BAD, stroke: 'none', color: PANEL, s }); }
        if (i === 1) card(vx + 30, y, 60, 30, { rx: 5, text: 'null', fs: 13.5, mono: true, dash: '4 3', stroke: MUT, color: MUT, s });
        if (i === 2) card(vx + 30, y, 60, 30, { rx: 5, text: '10', fs: 14, mono: true, fill: WARNBG, stroke: WARN, color: WARN, s });
        if (i === 3) { mono(vx - 4, y + 6, '[', { 'font-size': 20, fill: MUT, opacity: op }); [0, 1, 2].forEach((j) => card(vx + 18 + j * 30, y, 24, 26, { rx: 4, text: 'S', fs: 13.5, mono: true, s })); mono(vx + 104, y + 6, ']', { 'font-size': 20, fill: MUT, opacity: op }); }
        tx(830, y + 5, m, { 'font-size': 14, fill: MUT, opacity: op }); });
      note(40, 300, '$id 를 안 보내면 실행 전에 막힌다', fade(u, 1.6), { fill: BAD });
      mono(40, 332, 'Variable "$id" of required type "ID!" was not provided.', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 2.0) }); return; }
    // k5: HTTP 본문
    const H = ['POST /graphql', '{', '  "operationName": "GetUser",', '  "query": "query GetUser($id: ID!) { … }",', '  "variables": { "id": "1" }', '}'];
    const hk = [2, 3, 4], cur = Math.floor(E(u, 0.6, 2.2) * 3);
    doc(440, 60, H, { lang: 'json', fs: 15, shown: lerp(0, 6, E(u, 0.1, 0.8)), title: 'HTTP 본문 = 세 칸', tcol: INK, hi: (i) => hk[Math.min(2, cur)] === i && u > 0.6 });
    [['operationName', '집계·캐시의 이름'], ['query', '고정된 본문'], ['variables', '바뀌는 값']].forEach(([a, b], i) => { const s = pop(u, 0.8 + i * 0.5);
      card(530 + i * 150, 290, 140, 54, { rx: 8, text: a + '\n' + b, fs: 13.5, stroke: i === 2 ? ACC : INFO, color: INK, s }); }); }

  // ---------- 2. 변수 기본값 · 화면 상태 ----------
  const DECL = ['query SearchPosts(', '  $keyword: String!,', '  $first:   Int    = 20,', '  $after:   String,', '  $orderBy: PostOrder = LATEST', ') {'];
  const ARGS = ['searchPosts(', '  keyword: $keyword,', '  first:   $first,', '  after:   $after,', '  orderBy: $orderBy', ') { … }'];
  function ui(op, kw, hot) {   // 검색 화면 모형: 컨트롤 4개
    card(160, 180, 260, 300, { rx: 12, stroke: GRID, sw: 1.8, op }); tx(42, 52, '검색 화면', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op });
    const ctl = (cx, cy, w, s, i) => card(cx, cy, w, 34, { rx: 6, text: s, fs: 14, mono: true, stroke: hot === i ? ACC : INK, color: hot === i ? ACC : INK, sw: hot === i ? 2.6 : 1.8, op, fill: hot === i ? ACCBG : PANEL });
    ctl(160, 92, 220, kw, 1); ctl(110, 146, 120, 'LATEST ▾', 4); ctl(235, 146, 70, '20', 2);
    [190, 216, 242].forEach((y) => el('rect', { x: 50, y, width: 220, height: 16, rx: 4, fill: SOFT, opacity: op }));
    ctl(190, 296, 140, '다음 페이지 →', 3);
    return { 1: [270, 92], 4: [170, 146], 2: [270, 146], 3: [260, 296] }; }
  function s2(t, c) { const { k, u } = c;
    const kw = k === 4 ? (u < 1.6 ? 'graphql' : 'react'.slice(0, Math.max(1, Math.round(E(u, 1.6, 2.2) * 5)))) : 'graphql';
    const hotRow = k === 3 ? 1 + Math.min(3, Math.floor(E(u, 0.3, 2.3) * 4)) : null;
    const P = ui(k === 3 || k === 4 ? 1 : 0.45, kw, hotRow ? [0, 1, 4, 3, 2][hotRow] : k === 4 ? 1 : null);
    const D = doc(330, 40, DECL, { shown: k === 0 ? lerp(0, 6, E(u, 0.1, 1.2)) : 6, w: 300, hi: (i) => (k === 2 && i === 3) || (hotRow != null && i === [0, 1, 4, 3, 2][hotRow]) });
    if (k === 0) { [['필수', BAD], ['기본값 20', WARN], ['nullable · 생략 가능', MUT], ['enum 기본값', WARN]].forEach(([s, col], i) => lpill(648, D.ly(i + 1), s, col, pop(u, 1.2 + i * 0.25), { fs: 13.5 }));
      sub(480, 236, '화면이 다루는 상태가 그대로 변수 목록이 된다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    const A = doc(668, 40, ARGS, { w: 226, op: k === 1 ? fade(u, 0.1) : 1, hi: (i) => (k === 2 && i === 3) });
    for (let i = 1; i <= 4; i++) grow(630, D.ly(i), 668, D.ly(i), k === 1 ? E(u, 0.4 + i * 0.3, 0.8 + i * 0.3) : 1, ACC, { plain: true });
    if (k === 1) { sub(560, 236, '변수 이름과 인자 이름은 달라도 된다 · 연결은 이 자리에서', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2) { const J = doc(668, 236, ['"pageInfo": {', '  "endCursor": "…",', '  "hasNextPage": true', '}'], { lang: 'json', w: 226, title: '응답 data.searchPosts', op: fade(u, 0.2), hi: (i) => i === 1 });
      curve(`M668,${J.ly(1)} C600,${J.ly(1)} 610,${D.ly(3)} 632,${D.ly(3)}`, E(u, 0.8, 1.9), ACC);
      note(330, 370, '응답의 endCursor 가 다음 요청의 $after 로 돌아간다', fade(u, 2.0)); return; }
    if (k === 3) { [1, 4, 3, 2].forEach((row, i) => { const [x0, y0] = P[row];
        grow(x0 + 4, y0, 328, D.ly(row), E(u, 0.3 + i * 0.5, 0.7 + i * 0.5), ACC, { sw: 2 }); });
      note(330, 260, 'UI 컨트롤 하나 = 변수 하나', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 4) { const V = doc(330, 236, ['useQuery(SEARCH_POSTS, {', `  variables: { keyword: "${u < 1.6 ? 'graphql' : 'react'}", first: 20 }`, '})'], { lang: 'js', title: u < 1.6 ? '클라이언트' : 'refetch({ keyword: "react" })', tcol: u < 1.6 ? MUT : ACC, w: 560, hi: (i) => i === 1 && u > 1.6 });
      tx(330, 360, 'resolver 가 받은 args', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) });
      mono(330, 388, `{ keyword: "${u < 1.6 ? 'graphql' : 'react'}", first: 20, orderBy: "LATEST" }`, { 'font-size': 14.5, opacity: fade(u, 0.8) });
      tx(894, 360, '$after 는 안 보냈다', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.2) }); return; }
    // k5: 정렬마다 사본 ✗
    [['query SearchLatest { … }', 0], ['query SearchHot { … }', 1]].forEach(([s, i]) => { const y = 262 + i * 46, sc = pop(u, 0.2 + i * 0.3);
      card(470, y, 270, 34, { rx: 6, text: s, fs: 14, mono: true, stroke: BAD, color: MUT, s: sc }); cross(620, y, 9, pop(u, 0.9 + i * 0.2)); });
    grow(650, 285, 700, 285, E(u, 1.2, 1.6), ACC);
    card(800, 262, 180, 34, { rx: 6, text: 'query SearchPosts', fs: 14, mono: true, stroke: ACC, color: ACC, sw: 2.4, s: pop(u, 1.5) });
    [['{ orderBy: LATEST }', 0], ['{ orderBy: HOT }', 1]].forEach(([s, i]) => card(800, 306 + i * 38, 180, 30, { rx: 15, text: s, fs: 13.5, mono: true, stroke: ACC, color: INK, s: pop(u, 1.8 + i * 0.25) }));
    note(330, 400, '같은 query, 다른 variables', fade(u, 2.2), { fill: ACC }); }

  // ---------- 3. Fragment 정의 ----------
  function postCard(x, y, o) { o = o || {}; const on = o.on || {}, op = o.op ?? 1;   // PostCard 모형: 부분마다 필드 이름
    card(x + 150, y + 110, 300, 220, { rx: 12, stroke: INK, sw: 2, op }); tx(x, y - 10, 'PostCard 컴포넌트', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op });
    const part = (px, py, w, h, s, key) => { const hot = on[key]; el('rect', { x: px, y: py, width: w, height: h, rx: 6, fill: hot ? ACCBG : SOFT, stroke: hot ? ACC : 'none', 'stroke-width': 2, opacity: op * (o.only && !hot ? 0.45 : 1) });
      mono(px + 10, py + h / 2 + 5, s, { 'font-size': 13.5, fill: hot ? ACC : MUT, 'font-weight': 700, opacity: op }); };
    el('circle', { cx: x + 38, cy: y + 38, r: 20, fill: on.user ? ACCBG : SOFT, stroke: on.user ? ACC : GRID, 'stroke-width': 2, opacity: op });
    mono(x + 38, y + 74, 'avatarUrl', { 'font-size': 13.5, fill: on.user ? ACC : MUT, 'text-anchor': 'middle', opacity: op });
    part(x + 70, y + 24, 130, 28, 'name', 'user');
    part(x + 16, y + 92, 268, 30, 'title', 'post'); part(x + 16, y + 130, 268, 40, 'excerpt', 'post');
    part(x + 16, y + 178, 150, 30, 'commentCount', 'post');
    if (o.like) part(x + 176, y + 178, 108, 30, 'likeCount', 'like');
    return { avatar: [x + 38, y + 38], name: [x + 70, y + 38], title: [x + 16, y + 107], excerpt: [x + 16, y + 150], count: [x + 16, y + 193] }; }
  function fragBox(x, y, w, name, fields, o) { o = o || {}; const lh = o.lh || 24, h = 40 + fields.length * lh + 8, s = o.s ?? 1;
    const g = R.G(x, y, s, o.op);
    el('rect', { x: 0, y: 0, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || ACC, 'stroke-width': 2.2 }, g);
    const t = el('text', { x: 12, y: 24, 'font-size': 13.5, class: 'mono', style: 'white-space:pre' }, g);
    [['fragment ', { fill: INFO, 'font-weight': 700 }], [name, { fill: ACC, 'font-weight': 800 }], [' on ' + o.on, { fill: MUT }]].forEach(([a, b]) => { const ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan'); for (const kk in b) ts.setAttribute(kk, b[kk]); ts.textContent = a; t.appendChild(ts); });
    fields.forEach((f, i) => { const fs = o.fieldS ? o.fieldS(i) : 1; if (fs <= 0) return; const e = el('text', { x: 24, y: 40 + i * lh + 17, 'font-size': 14.5, class: 'mono', fill: f.startsWith('...') ? ACC : f === o.newField ? GOOD : INK, 'font-weight': f.startsWith('...') || f === o.newField ? 700 : 500, opacity: fs }, g); e.textContent = f; });
    return { x, y, w: w * s, h: h * s, fy: (i) => y + (40 + i * lh + 12) * s }; }
  // 다른 fragment 안으로 들어간 UserBasic: 글자 크기는 그대로 두고 한 장으로 접는다
  function ubChip(cx, cy, op, s, hot) { card(cx, cy, 236, 54, { rx: 8, text: '...UserBasic\nid · name · avatarUrl', fs: 13.5, mono: true, fill: ACCBG, stroke: ACC, color: ACC, sw: hot ? 2.6 : 1.8, op, s }); }
  function s3(t, c) { const { k, u } = c;
    const like = k === 4 && u > 1.2;
    const pc = postCard(620, 60, { on: { user: k === 0 || k === 2, post: k === 1, like }, only: k <= 2, like });
    // UserBasic: k0 에 모이고, k2 부터 PostCardFields 의 author 안으로 들어간다
    const inside = k >= 2 ? E(k === 2 ? u : 3, 0.3, 1.5) : 0;
    const PF = ['id', 'title', 'excerpt', 'commentCount', 'author {', '', '', '', '', '}'].concat(like ? ['likeCount'] : []);
    let B = null;
    if (k >= 1) { B = fragBox(300, 40, 290, 'PostCardFields', PF, { on: 'Post', op: k === 1 ? fade(u, 0.1) : 1, newField: 'likeCount', fieldS: (i) => (k === 1 ? fade(u, 0.3 + i * 0.12) : i === 10 ? pop(u, 1.2) : 1) });
      if (k === 1) [[1, pc.title], [2, pc.excerpt], [3, pc.count]].forEach(([i, p], j) => grow(334 + tw(PF[i], 14.5), B.fy(i), p[0] - 4, p[1], E(u, 1.0 + j * 0.3, 1.4 + j * 0.3), ACC, { sw: 1.8 })); }
    const ux = lerp(30, 330, inside), uy = lerp(50, 200, inside), us = lerp(1, 0.8, inside);
    const UB = inside < 1 ? fragBox(ux, uy, 250, 'UserBasic', ['id', 'name', 'avatarUrl'], { on: 'User', s: us, op: 1 - inside, fieldS: (i) => (k === 0 ? pop(u, 0.4 + i * 0.3) : 1) }) : null;
    if (inside > 0) ubChip(450, 248, inside, 1, k === 2);
    if (k === 0) { ['id', 'name', 'avatarUrl'].forEach((f, i) => fly(70 + i * 90, 330, ux + 60, UB.fy(i), seg(u, 0.1 + i * 0.25, 0.7 + i * 0.25), f, { mono: true }));
      grow(282, UB.fy(1), pc.name[0] - 4, pc.name[1], E(u, 1.6, 2.0), ACC, { sw: 1.8 }); grow(282, UB.fy(2), pc.avatar[0] - 24, pc.avatar[1] + 6, E(u, 1.8, 2.2), ACC, { sw: 1.8 });
      note(30, 270, 'User 에서 늘 같이 쓰는 필드 셋에 이름을 붙인다', fade(u, 2.2)); return; }
    if (k === 1) { note(30, 390, '묶음의 기준은 테이블이 아니라 화면 컴포넌트', fade(u, 2.2)); return; }
    if (k === 2) {
      note(30, 390, 'fragment 안에서 fragment 를 펼친다 · 타입만 맞으면 된다', fade(u, 2.0)); return; }
    if (k === 3) { const D = doc(596, 300, ['query Feed($first: Int = 10) {', '  posts(first: $first) {', '    edges { node { ...PostCardFields } }', '} }'], { fs: 13.5, w: 350, shown: lerp(0, 4, E(u, 0.2, 1.2)), hi: (i) => i === 2 });
      curve(`M${D.x + 4},${D.ly(2)} C566,${D.ly(2)} 620,200 594,200`, E(u, 1.3, 1.9), ACC);
      lpill(30, 300, '필드 나열 → 한 줄', ACC, pop(u, 1.9), { fs: 14 });
      note(30, 390, 'query 는 어디서, fragment 는 무엇을 가져올지', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4) { ['query Feed', 'query Search', 'query Profile'].forEach((s, i) => { const y = 100 + i * 86, sc = pop(u, 0.2 + i * 0.2);
        card(150, y, 220, 50, { rx: 8, text: s + '\n...PostCardFields', fs: 13.5, mono: true, stroke: INK, color: INK, s: sc });
        grow(260, y, 298, y, E(u, 0.5 + i * 0.2, 0.8 + i * 0.2), MUT, { sw: 1.8, plain: true });
        dot([[298, y], [262, y]], seg(u, 1.4 + i * 0.15, 2.0 + i * 0.15), GOOD, 6); });
      note(30, 400, '고칠 곳은 fragment 한 곳', fade(u, 1.8), { fill: GOOD }); return; }
    // k5: colocation
    card(310, 380, 560, 60, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.2) }); tx(36, 343, 'PostCard.tsx', { 'font-size': 14, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.3) });
    mono(50, 374, 'function PostCard({ post }) …', { 'font-size': 14, opacity: fade(u, 0.6) });
    mono(50, 398, 'POST_CARD_FRAGMENT = gql`fragment …`', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
    note(620, 318, '컴포넌트와 데이터 명세가', fade(u, 1.6)); note(620, 344, '한 파일에 산다', fade(u, 1.8), { fill: ACC }); }

  // ---------- 4. 인라인 fragment ----------
  const TY = { User: INFO, Post: ACC, Tag: WARN };
  const GS = ['query GlobalSearch($q: String!) {', '  search(keyword: $q) {', '    __typename', '    ... on User { id name avatarUrl }', '    ... on Post { id title author { name } }', '    ... on Tag  { id label postCount }', '  }', '}'];
  const RES = { User: ['"id": "u1"', '"name": "…"', '"avatarUrl": "…"'], Post: ['"id": "p1"', '"title": "…"', '"author": { "name": "…" }'], Tag: ['"id": "t1"', '"label": "…"', '"postCount": 12'] };
  function elem(name, i, fill, o) { o = o || {}; const x = 486, y = 40 + i * 120, col = TY[name];   // 응답 배열의 원소 하나
    el('rect', { x, y, width: 440, height: 108, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2.2, opacity: o.op ?? 1 });
    if (o.tn) { const s = o.tn; el('rect', { x: x + 10, y: y + 10, width: 230, height: 24, rx: 5, fill: col, opacity: 0.16 * s });
      spans(x + 18, y + 27, toks(`"__typename": "${name}"`, 'json'), { 'font-size': 14.5, opacity: s }); }
    RES[name].forEach((s, j) => { const f = fill ? fill(j) : 0; if (f <= 0) return; spans(x + 18 + (1 - f) * 30, y + 54 + j * 21, toks(s, 'json'), { 'font-size': 14, opacity: f }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 70, 220, 44, { rx: 22, text: 'union SearchResult', fs: 15, mono: true, stroke: INK, sw: 2.4, s: pop(u, 0.2) });
      ['User', 'Post', 'Tag'].forEach((n, i) => { const x = 220 + i * 260, s = pop(u, 0.7 + i * 0.3);
        grow(480, 92, x, 162, E(u, 0.4 + i * 0.3, 0.8 + i * 0.3), MUT, { plain: true });
        card(x, 210, 190, 96, { rx: 10, stroke: TY[n], sw: 2.2, s });
        tx(x, 186, 'type ' + n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: TY[n], class: 'mono', opacity: s });
        mono(x, 214, ['id name avatarUrl', 'id title author', 'id label postCount'][i], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s });
        mono(x, 240, '공통 필드 없음', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); });
      tx(40, 312, 'search { id } 처럼 바로 고르면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      mono(40, 342, 'Cannot query field "id" on type "SearchResult".', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.9) });
      mono(40, 366, 'Did you mean to use an inline fragment on "Post", "Tag", or "User"?', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.1) }); return; }
    if (k === 6) { const S = doc(30, 60, ['switch (r.__typename) {', '  case "User": return <UserRow />;', '  case "Post": return <PostRow />;', '  case "Tag":  return <TagChip />;', '}'], { lang: 'js', fs: 14.5, title: 'codegen 이 만든 Discriminated Union', tcol: INFO });
      ['User', 'Post', 'Tag'].forEach((n, i) => { elem(n, i, () => 1, { tn: 1, op: 1 }); curve(`M486,${94 + i * 120} C440,${94 + i * 120} 440,${S.ly(i + 1)} ${S.x + S.w + 4},${S.ly(i + 1)}`, E(u, 0.3 + i * 0.4, 1.0 + i * 0.4), TY[n] === ACC ? ACC : MUT); });
      note(30, 270, 'case 를 빠뜨리면 컴파일 단계에서 잡힌다', fade(u, 2.0), { fill: INFO }); return; }
    // k1~k5: 쿼리와 응답 배열
    const branch = { User: 3, Post: 4, Tag: 5 }, upto = k === 1 ? 2 : k + 1;   // k2: User 줄까지, k3: Post, k4: Tag
    doc(30, 50, GS, { fs: 14.5, w: 420, shown: Math.min(8, upto + 1) + (k >= 4 ? 2 : 0), hi: (i) => i === (k === 1 ? 2 : k + 1) && k <= 4 });
    ['User', 'Post', 'Tag'].forEach((n, i) => { const on = k >= 5 || branch[n] <= upto, now = branch[n] === upto && k <= 4;
      elem(n, i, (j) => (!on ? 0 : now ? fade(u, 0.6 + j * 0.3) : 1), { tn: k === 1 ? pop(u, 0.4 + i * 0.3) : 1 });
      if (now) grow(450, 50 + 9 + branch[n] * 22.5 + 11, 482, 94 + i * 120, E(u, 0.2, 0.6), TY[n] === ACC ? ACC : MUT); });
    if (k === 1) { note(30, 290, '__typename 은 어떤 타입이든 고를 수 있는 필드', fade(u, 1.5)); sub(240, 320, '먼저 이것으로 원소의 종류를 안다', fade(u, 1.9), { 'font-size': 14 }); return; }
    if (k === 2) { note(30, 290, '... on User 의 필드는 User 원소에만 채워진다', fade(u, 1.8)); return; }
    if (k === 3) { note(30, 290, '같은 자리에 Post 분기를 하나 더 · 중첩 필드도 그대로', fade(u, 1.8)); return; }
    if (k === 4) { tx(30, 316, '... on Tag 를 빼면 그 원소는', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(30, 344, '{ "__typename": "Tag" }', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    // k5: 응답 배열 전체
    mono(470, 36, '[', { 'font-size': 26, fill: MUT, opacity: fade(u, 0.2) }); mono(470, 404, ']', { 'font-size': 26, fill: MUT, opacity: fade(u, 0.2) });
    note(30, 300, 'data.search = 종류가 섞인 배열', fade(u, 0.6), { fill: INK });
    sub(240, 330, '원소마다 __typename + 그 타입의 필드만', fade(u, 1.2), { 'font-size': 14 });
    sub(240, 356, '__typename 없이는 화면을 그릴 수 없다', fade(u, 1.8), { 'font-size': 14, fill: BAD }); }

  // ---------- 5. 변수 × fragment 조립 ----------
  function screen(op, hot, title) { card(140, 220, 220, 360, { rx: 12, stroke: GRID, sw: 1.8, op }); tx(32, 30, title || 'Feed 화면', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op });
    [0, 1].forEach((i) => { const y = 64 + i * 140, hp = hot === 'post', hu = hot === 'user';
      el('rect', { x: 46, y, width: 188, height: 122, rx: 8, fill: hp ? ACCBG : PANEL, stroke: hp ? ACC : INK, 'stroke-width': hp ? 2.4 : 1.6, opacity: op });
      el('circle', { cx: 68, cy: y + 24, r: 12, fill: hu ? ACC : SOFT, stroke: hu ? ACC : GRID, 'stroke-width': 2, opacity: op });
      el('rect', { x: 88, y: y + 16, width: 80, height: 14, rx: 4, fill: hu ? ACC : SOFT, opacity: op * (hu ? 0.6 : 1) });
      [52, 74, 92].forEach((dy, j) => el('rect', { x: 58, y: y + dy, width: j ? 164 : 140, height: 12, rx: 4, fill: SOFT, opacity: op })); });
    const hb = hot === 'page'; card(140, 368, 130, 30, { rx: 15, text: '더 보기', fs: 14, stroke: hb ? ACC : INK, color: hb ? ACC : INK, fill: hb ? ACCBG : PANEL, sw: hb ? 2.4 : 1.6, op }); }
  const FEED = ['query Feed(', '  $first:   Int = 20,', '  $after:   String,', '  $orderBy: PostOrder = LATEST', ') {', '  feed(first: $first, after: $after,', '       orderBy: $orderBy) {', '    edges {', '      cursor', '      node { ...PostCard }', '    }', '    pageInfo { ...PageInfoFields }', '  }', '}'];
  function s5(t, c) { const { k, u } = c;
    screen(k === 6 ? 0.25 : 1, k === 0 ? 'user' : k === 1 || k === 4 ? 'post' : k === 2 || k === 5 ? 'page' : null);
    // fragment 상자 세 개 (가운데 열)
    const inside = k >= 1 ? E(k === 1 ? u : 3, 0.3, 1.4) : 0;
    const PCF = ['id', 'title', 'excerpt', 'commentCount', 'author {', '', '', '', '', '}'];
    if (k >= 1) fragBox(280, 30, 280, 'PostCard', PCF, { lh: 22, on: 'Post', op: k === 1 ? fade(u, 1.2) : 1, fieldS: (i) => (k === 1 ? fade(u, 1.2 + i * 0.08) : 1), stroke: k === 1 || k === 4 || k === 6 ? ACC : MUT });
    if (inside < 1) fragBox(lerp(280, 310, inside), lerp(30, 180, inside), 250, 'UserBasic', ['id', 'name', 'avatarUrl'], { lh: 22, on: 'User', s: lerp(1, 0.8, inside), op: 1 - inside, fieldS: (i) => (k === 0 ? pop(u, 0.3 + i * 0.3) : 1), stroke: k === 0 ? ACC : MUT });
    if (inside > 0) ubChip(420, 224, inside, 1, k === 1);
    if (k === 0) { grow(236, 88, 278, 88, E(u, 1.3, 1.7), ACC); note(280, 250, '아바타와 이름은 여러 곳에서 쓴다', fade(u, 1.8)); sub(420, 280, '가장 작은 묶음을 먼저 둔다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k >= 2) fragBox(280, 310, 300, 'PageInfoFields', ['endCursor', 'hasNextPage'], { lh: 22, on: 'PageInfo', s: k === 2 ? pop(u, 0.2) : 1, stroke: k === 2 || k === 5 ? ACC : MUT });
    if (k === 1) { note(600, 120, '컴포넌트 계층이', fade(u, 1.6)); note(600, 148, '그대로 fragment 계층', fade(u, 1.8), { fill: ACC }); return; }
    if (k === 2) { note(600, 350, '늘 같이 쓰는 필드 짝은', fade(u, 0.9)); note(600, 378, '전부 fragment 후보', fade(u, 1.2), { fill: ACC }); return; }
    if (k === 6) { const S = doc(600, 60, ['query Search($q: String!) {', '  search(keyword: $q) {', '    edges {', '      node { ...PostCard }', '    }', '  }', '}'], { fs: 13.5, w: 330, title: '새 검색 화면의 query', tcol: ACC, shown: lerp(0, 7, E(u, 0.2, 1.2)), hi: (i) => i === 3 });
      curve(`M${S.x},${S.ly(3)} C580,${S.ly(3)} 580,100 562,100`, E(u, 1.3, 1.9), ACC);
      note(600, 300, '같은 PostCard 를 쓰는 화면은', fade(u, 1.8)); note(600, 328, '...PostCard 한 줄로 끝난다', fade(u, 2.0), { fill: ACC }); return; }
    const D = doc(590, 40, FEED.slice(0, k === 3 ? 5 : 14), { fs: 13.5, w: 340, shown: k === 3 ? lerp(0, 5, E(u, 0.1, 1.0)) : 14, hi: (i) => (k === 3 && i >= 1 && i <= 3) || (k === 4 && (i === 5 || i === 6 || i === 9)) || (k === 5 && i === 11) });
    if (k === 3) { [['first', '20'], ['after', 'null'], ['orderBy', 'LATEST']].forEach(([n, v], i) => card(660 + i * 100, 236, 92, 44, { rx: 8, text: n + '\n' + v, fs: 13.5, mono: true, stroke: ACC, color: INK, s: pop(u, 1.2 + i * 0.3) }));
      sub(760, 196, '변수 = 화면의 컨트롤', fade(u, 1.0), { 'font-size': 14, fill: ACC, 'font-weight': 700 }); return; }
    if (k === 4) { curve(`M590,${D.ly(9)} C570,${D.ly(9)} 575,120 562,120`, E(u, 0.6, 1.5), ACC);
      note(600, 392, '인자는 변수로, 필드는 fragment 로', fade(u, 1.9)); return; }
    // k5: pageInfo → $after
    curve(`M590,${D.ly(11)} C584,${D.ly(11)} 586,350 582,350`, E(u, 0.3, 1.0), ACC);
    curve(`M${D.x + D.w},${D.ly(11)} C${D.x + D.w + 24},${D.ly(11)} ${D.x + D.w + 24},${D.ly(2)} ${D.x + D.w - 2},${D.ly(2)}`, E(u, 1.1, 2.0), ACC);
    lpill(600, 392, 'endCursor → 다음 $after', ACC, pop(u, 2.0), { fs: 13.5 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '쿼리 본문에 값을 박지 않고 $id 변수로 빼면 운영에서 가장 크게 얻는 것은 무엇인가?',
      o: ['응답 JSON이 더 작아진다', '본문이 하나로 고정돼 캐시 키·집계·persisted query가 한곳에 모인다', '서버가 resolver를 덜 호출한다'], a: 1,
      why: 'id "1", "2", "3"을 박은 문자열은 sha256도 셋이지만, $id로 빼면 본문 해시가 aea64633… 하나로 모이고 값은 variables로만 바뀐다.' },
    { q: '$after: String을 variables에 넣지 않고 보내면 resolver의 args에는 무엇이 들어오는가?',
      o: ['after: null이 들어온다', '실행 전에 "필수 변수 없음" 에러가 난다', 'after 키 자체가 없다'], a: 2,
      why: '기본값 없는 nullable 변수를 생략하면 그 인자는 아예 전달되지 않는다. 실제 args는 { keyword, first: 20, orderBy: "LATEST" } 였다.' },
    { q: 'PostCard에 새 필드를 보여 줘야 할 때 fragment를 쓰면 고칠 곳은 어디인가?',
      o: ['PostCardFields fragment 한 곳', 'PostCard를 쓰는 query 전부', '서버 스키마의 Post 타입'], a: 0,
      why: 'query들은 ...PostCardFields 한 줄로 묶음을 펼치기만 한다. 묶음을 고치면 펼친 모든 곳에 같이 반영된다.' },
    { q: 'union SearchResult 결과에서 ... on Tag 분기를 빠뜨리면 Tag 원소는 어떻게 오는가?',
      o: ['응답 배열에서 빠진다', '{ "__typename": "Tag" }처럼 __typename만 담겨 온다', '검증 에러로 쿼리 전체가 거절된다'], a: 1,
      why: '인라인 fragment는 타입이 맞는 원소에만 필드를 채운다. 공통으로 고를 수 있는 __typename만 남는다.' },
    { q: '화면 하나의 query를 변수와 fragment로 짤 때 각각이 맡는 것은 무엇인가?',
      o: ['변수는 필드 목록, fragment는 인자 값', '둘 다 필드 목록을 줄이는 도구다', '변수는 인자(화면 컨트롤), fragment는 필드 묶음(화면 조각)'], a: 2,
      why: 'feed(first: $first, after: $after)처럼 인자 자리에 변수를, node { ...PostCard }처럼 필드 자리에 fragment를 넣는다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '값을 쿼리 본문에 박으면 사용자마다 문자열이 달라져 캐시 키와 집계가 흩어진다.',
    '$id: ID! 처럼 헤더에 변수를 선언하고 값은 variables JSON으로 따로 보낸다.',
    '검색어, 정렬, 페이지 같은 화면 상태를 변수 하나씩에 대응시키면 query는 하나로 끝난다.',
    'fragment는 화면 컴포넌트가 쓰는 필드 묶음이고, union 결과는 ... on 타입으로 나눠 받는다.',
  ];
  const review = [
    { q: 'Apollo Studio에서 같은 화면의 query가 수백 개의 다른 operation으로 잡힌다. 먼저 의심할 것은?',
      o: ['검색어 같은 값이 query 본문에 문자열로 들어가 있다', 'fragment를 너무 많이 썼다', 'variables에 기본값을 줬다'], a: 0,
      why: '값이 본문에 박히면 같은 뜻의 query도 문자열이 달라진다. 값을 $변수로 빼면 본문 하나에 variables만 바뀐다.' },
    { q: '피드와 검색 화면이 같은 PostCard를 그리는데, 필드 하나를 추가하자 검색 화면만 깨졌다. 무엇이 빠졌나?',
      o: ['검색 화면 query에 $first 변수가 없었다', '검색 화면이 ...PostCard 대신 필드를 따로 나열하고 있었다', 'PostCard 타입에 __typename이 없었다'], a: 1,
      why: '필드 묶음이 query마다 복사돼 있으면 한 곳만 고쳐도 다른 곳이 빠진다. 같은 fragment를 펼치면 수정 지점이 하나가 된다.' },
    { q: '통합 검색 화면에서 Post 원소에 title이 비어 온다. 쿼리를 보니 search { __typename ... on User { name } } 뿐이다. 고칠 것은?',
      o: ['$q 변수의 타입을 ID!로 바꾼다', 'search 아래에 title을 바로 적는다', '... on Post { title } 분기를 더한다'], a: 2,
      why: 'union에는 공통 필드가 없어 title을 바로 고를 수 없다. 타입별 인라인 fragment로 Post일 때의 필드를 적어야 채워진다.' },
  ];

  R.page({ title: '쿼리 문서와 응답', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
