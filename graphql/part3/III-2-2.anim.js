/* III-2-2 Mutation 응답 설계 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * data: null 전파·부분 응답·userErrors·union 응답은 graphql-js 16 으로 실제로 돌려 본 모양이다. 캐시 숫자(12→13)·재고 수량은 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, spans, person, cross, check, hbar } = R;
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

  // ---------- 1. entity 직반환 ----------
  // 응답 JSON 을 상자로: errors 칸 · data 칸 · 그 안의 createPost 칸
  function respTree(st, u) { st = st || {};
    el('rect', { x: 520, y: 30, width: 410, height: 362, rx: 12, fill: 'none', stroke: GRID, 'stroke-width': 1.8 }); tx(534, 52, '응답 JSON', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    const eo = st.err ?? 0;
    if (eo > 0) { el('rect', { x: 540, y: 64, width: 370, height: 74, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 1.8, opacity: eo });
      mono(552, 90, '"errors": [{ "message": "Duplicate title",', { 'font-size': 13.5, fill: BAD, opacity: eo }); mono(552, 114, '             "path": ["createPost"] }]', { 'font-size': 13.5, fill: BAD, opacity: eo }); }
    const dn = st.dataNull ?? 0, cn = st.cpNull ?? 0;
    el('rect', { x: 540, y: 152, width: 370, height: 226, rx: 8, fill: dn > 0.5 ? BADBG : PANEL, stroke: dn > 0.5 ? BAD : INK, 'stroke-width': 2 });
    mono(552, 176, dn > 0.5 ? '"data": null' : '"data": {', { 'font-size': 15, 'font-weight': 700, fill: dn > 0.5 ? BAD : INK });
    if (dn > 0.5) return;
    el('rect', { x: 566, y: 192, width: 324, height: 150, rx: 8, fill: cn > 0.5 ? BADBG : st.ok ? GOODBG : SOFT, stroke: cn > 0.5 ? BAD : st.ok ? GOOD : GRID, 'stroke-width': 2, 'stroke-dasharray': st.ok || cn > 0.5 ? null : '5 4' });
    mono(580, 218, cn > 0.5 ? '"createPost": null' : '"createPost": {', { 'font-size': 15, 'font-weight': 700, fill: cn > 0.5 ? BAD : INK });
    if (!(cn > 0.5 && !st.nullable)) lpill(790, 216, st.nullable ? 'Post' : 'Post!', st.nullable ? MUT : BAD, 1, { fs: 13.5, mono: true });
    if (st.ok && cn <= 0.5) { mono(600, 262, '"id": "p1",', { 'font-size': 15, opacity: st.ok }); mono(600, 290, '"title": "hello"', { 'font-size': 15, opacity: st.ok }); } }
  function s1(t, c) { const { k, u } = c;
    if (k <= 3) { const sig = k === 3 ? ['type Mutation {', '  createPost(input: CreatePostInput!): Post', '}'] : ['type Mutation {', '  createPost(input: CreatePostInput!): Post!', '}'];
      doc(30, 50, sig, { fs: 15, w: 450, hi: (i) => i === 1 });
      if (k === 0) { respTree({}, u); lpill(300, 160, '! = 실패하지 않는다는 선언', BAD, pop(u, 1.0), { fs: 14 });
        note(30, 230, '성공만 생각하면 가장 단순한 모양', fade(u, 1.6)); return; }
      if (k === 1) { respTree({ ok: fade(u, 0.4) }, u); mono(30, 236, 'mutation { createPost(input: { title: "hello" })', { 'font-size': 14, opacity: fade(u, 0.2) }); mono(30, 258, '           { id title } }', { 'font-size': 14, opacity: fade(u, 0.2) });
        note(30, 320, '만든 글이 data.createPost 에 그대로', fade(u, 1.5), { fill: GOOD }); return; }
      if (k === 2) { const hit = u > 0.5, up = E(u, 1.2, 1.9);
        respTree({ err: fade(u, 0.7), cpNull: hit ? 1 : 0, dataNull: up >= 1 ? 1 : 0 }, u);
        if (u > 0.3 && u < 1.2) cross(860, 270, 14, pop(u, 0.3));
        if (up > 0 && up < 1) card(850, lerp(262, 176, up), 70, 30, { rx: 15, text: 'null', fs: 14, mono: true, fill: BAD, stroke: 'none', color: PANEL });
        mono(30, 236, 'throw new Error("Duplicate title")', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.2) });
        note(30, 300, 'createPost 가 Post! 라 null 을 담을 수 없다', fade(u, 1.3)); note(30, 328, 'null 이 한 칸 위 data 까지 번진다', fade(u, 1.9), { fill: BAD }); return; }
      respTree({ err: 1, cpNull: 1, nullable: true }, u);
      note(30, 236, '! 를 빼면 null 이 createPost 에서 멈춘다', fade(u, 0.6)); note(30, 266, 'data 는 살아 있고 errors 와 함께 온다', fade(u, 1.2), { fill: GOOD });
      sub(250, 300, '부분 응답 · graphql-js 16 실행 결과', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 4) { el('rect', { x: 60, y: 70, width: 400, height: 210, rx: 12, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.1) }); mono(76, 96, 'errors: [ … ]', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.1) });
      [['비즈니스', 'Duplicate title'], ['프로토콜', '쿼리 검증 실패'], ['시스템', 'DB 연결 끊김']].forEach(([a, b], i) => { const s = pop(u, 0.4 + i * 0.3);
        card(260, 130 + i * 48, 360, 38, { rx: 8, text: a + ' · ' + b, fs: 14.5, stroke: BAD, color: INK, s }); });
      card(720, 120, 300, 110, { rx: 12, stroke: INK, sw: 2, s: pop(u, 1.3) }); tx(590, 100, '글쓰기 폼', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.3) });
      el('rect', { x: 600, y: 120, width: 240, height: 34, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.8, opacity: fade(u, 1.4) }); mono(612, 142, 'title', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
      mono(856, 146, '?', { 'font-size': 26, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      note(60, 330, '종류가 다른 에러가 한 배열에 섞이고', fade(u, 1.8)); note(60, 358, 'HTTP 는 200 · 어느 입력 칸의 문제인지 모른다', fade(u, 2.1), { fill: BAD }); return; }
    // k5: 기준 나누기
    card(250, 130, 380, 70, { rx: 12, text: 'throw\n시스템 에러만 (DB, 버그)', fs: 15, stroke: BAD, color: INK, s: pop(u, 0.2) });
    grow(442, 130, 560, 130, E(u, 0.5, 0.9), BAD); card(720, 130, 300, 50, { rx: 25, text: 'top-level errors[]', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.8) });
    card(250, 260, 380, 70, { rx: 12, text: '예상 가능한 실패\n제목 중복 · 권한 · 금지어', fs: 15, stroke: ACC, color: INK, s: pop(u, 1.1) });
    grow(442, 260, 560, 260, E(u, 1.4, 1.8), ACC); card(720, 260, 300, 50, { rx: 25, text: 'data 안의 타입', fs: 15, stroke: ACC, color: ACC, sw: 2.6, s: pop(u, 1.7) });
    note(60, 380, '이것이 errors as data 패턴', fade(u, 2.1), { fill: ACC }); }

  // ---------- 2. Payload ----------
  function envelope(o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x: 500, y: 40, width: 430, height: 330, rx: 14, fill: 'none', stroke: INK, 'stroke-width': 2.4, opacity: op }); mono(516, 66, 'CreatePostPayload', { 'font-size': 15, 'font-weight': 800, opacity: op });
    // post 칸 (nullable)
    const pf = o.post;
    el('rect', { x: 520, y: 82, width: 390, height: 110, rx: 10, fill: pf === 'ok' ? GOODBG : PANEL, stroke: pf === 'ok' ? GOOD : MUT, 'stroke-width': 1.8, 'stroke-dasharray': pf === 'ok' ? null : '6 4', opacity: op });
    mono(534, 106, 'post: Post', { 'font-size': 14.5, 'font-weight': 700, opacity: op }); tx(896, 106, 'nullable', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op });
    if (pf === 'ok') { mono(548, 140, '{ "id": "p1", "title": "hello" }', { 'font-size': 14.5, fill: GOOD, opacity: o.pu ?? 1 }); }
    if (pf === 'null') mono(548, 150, 'null', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: o.pu ?? 1 });
    // userErrors 칸 (항상 배열)
    el('rect', { x: 520, y: 206, width: 390, height: 150, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 1.8, opacity: op });
    mono(534, 230, 'userErrors: [UserError!]!', { 'font-size': 14.5, 'font-weight': 700, opacity: op });
    if (o.ue === 'empty') mono(548, 280, '[ ]   성공이면 빈 배열', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: o.uu ?? 1 });
    if (o.ue === 'one') { card(715, 292, 360, 76, { rx: 8, stroke: BAD, fill: BADBG, sw: 1.8, op: o.uu ?? 1 });
      mono(546, 280, '{ "field": ["title"], "message": "중복",', { 'font-size': 13.5, fill: BAD, opacity: o.uu ?? 1 }); mono(546, 304, '  "code": "DUPLICATE_TITLE" }', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: o.uu ?? 1 }); } }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { doc(30, 50, ['type Mutation {', '  createPost(input: CreatePostInput!):', u < 1.0 ? '    Post!' : '    CreatePostPayload!', '}'], { fs: 15, w: 420, hi: (i) => i === 2 });
      const g = E(u, 0.8, 1.8); envelope({ op: g });
      card(lerp(240, 715, g), lerp(260, 150, g), lerp(160, 280, g), lerp(70, 50, g), { rx: 10, text: 'Post', fs: 16, mono: true, stroke: ACC, color: ACC, sw: 2.4 });
      note(30, 380, '반환을 봉투로 감싸는 것이 출발점', fade(u, 2.1)); return; }
    if (k === 1) { doc(30, 50, ['type CreatePostPayload {', '  post:       Post', '  userErrors: [UserError!]!', '}'], { fs: 15, w: 420, hi: (i) => (i === 1 && u < 1.3) || (i === 2 && u >= 1.3) });
      envelope({}); lpill(530, 160, '성공일 때만 채워짐', MUT, pop(u, 0.5), { fs: 13.5 });
      lpill(530, 330, 'Non-Null 배열 · null 검사가 필요 없다', ACC, pop(u, 1.5), { fs: 13.5 }); return; }
    if (k === 2) { doc(30, 50, ['type UserError {', '  field:   [String!]!', '  message: String!', '  code:    String', '}'], { fs: 15, w: 360, hi: (i) => i >= 1 && i <= 3 });
      [['field', '["title"]', '어느 입력 칸인가', INFO], ['message', '"중복"', '사람이 읽는 문구', INK], ['code', '"DUPLICATE_TITLE"', '기계가 분기·번역·집계', ACC]].forEach(([f, v, r, col], i) => { const y = 90 + i * 90, s = pop(u, 0.4 + i * 0.4);
        card(660, y, 300, 60, { rx: 10, stroke: col, sw: 2.2, s }); mono(524, y - 4, f, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s }); mono(524, y + 18, v, { 'font-size': 14, opacity: s });
        tx(800, y + 6, r, { 'font-size': 14.5, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: s }); });
      note(30, 330, 'message 만으로는 번역도 집계도 못 한다', fade(u, 2.0)); return; }
    if (k === 3) { doc(30, 50, ['# 실행 결과 (성공)', '{ "createPost": {', '    "post": { "id": "p1", … },', '    "userErrors": [] } }'], { lang: 'json', fs: 14.5, w: 420 });
      envelope({ post: 'ok', pu: fade(u, 0.4), ue: 'empty', uu: fade(u, 1.0) });
      note(30, 300, '성공과 실패가 같은 타입으로 온다', fade(u, 1.6)); sub(220, 330, '응답 처리 코드가 한 갈래', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 4) { envelope({ post: 'null', pu: fade(u, 0.3), ue: 'one', uu: fade(u, 0.8) });
      el('rect', { x: 30, y: 60, width: 420, height: 56, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', opacity: fade(u, 1.3) });
      mono(46, 94, 'top-level "errors"', { 'font-size': 15, fill: MUT, 'text-decoration': 'line-through', opacity: fade(u, 1.3) }); tx(436, 94, '없음', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.5) });
      note(30, 170, 'HTTP 도 GraphQL 도 정상', fade(u, 1.7)); note(30, 200, '실패 원인은 userErrors 에 담긴 데이터', fade(u, 2.0), { fill: ACC }); return; }
    // k5: 폼 분기
    doc(30, 40, ['if (data.createPost.userErrors.length) {', '  userErrors.forEach((e) =>', '    setFieldError(e.field, e.message));', '  return;', '}', 'router.push(`/posts/${post.id}`);'], { lang: 'js', fs: 14, w: 430, hi: (i) => (i === 0 && u < 1.0) || (i === 2 && u >= 1.0) });
    card(720, 150, 360, 190, { rx: 12, stroke: INK, sw: 2 }); tx(560, 70, '글쓰기 폼', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    const bad = u > 1.2; el('rect', { x: 570, y: 92, width: 300, height: 36, rx: 6, fill: PANEL, stroke: bad ? BAD : GRID, 'stroke-width': bad ? 2.4 : 1.6 }); mono(584, 116, 'title', { 'font-size': 14, fill: MUT });
    tx(574, 150, '중복', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
    [176, 204].forEach((y) => el('rect', { x: 570, y, width: 300, height: 18, rx: 4, fill: SOFT }));
    grow(460, 40 + 9 + 2 * 22 + 11, 566, 110, E(u, 0.9, 1.3), BAD);
    note(30, 330, 'field 를 폼 입력 칸에 그대로 대응시킨다', fade(u, 1.9)); }

  // ---------- 3. union 결과 ----------
  const UT = [['CreatePostSuccess', ['post: Post!'], GOOD], ['DuplicateTitleError', ['message: String!', 'existingPostId: ID!'], BAD], ['PermissionDeniedError', ['message: String!', 'requiredRole: Role!'], WARN], ['ValidationError', ['field: String!', 'message: String!'], INFO]];
  const UP = [[580, 100], [820, 100], [580, 250], [820, 250]];
  function utype(i, s) { const [n, fs, col] = UT[i], [x, y] = UP[i]; card(x, y, 228, 110, { rx: 10, stroke: col, sw: 2.2, s });
    tx(x, y - 26, n, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, class: 'mono', fill: col, opacity: clamp(s) });
    fs.forEach((f, j) => mono(x - 98, y + 6 + j * 24, f, { 'font-size': 13.5, opacity: clamp(s) })); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { doc(30, 60, ['type Mutation {', '  createPost(input: CreatePostInput!):', '    CreatePostResult!', '}'], { fs: 16, w: 440, hi: (i) => i === 2 });
      card(700, 160, 300, 60, { rx: 30, text: 'union CreatePostResult', fs: 16, mono: true, stroke: INK, sw: 2.6, s: pop(u, 0.8) });
      sub(700, 220, '결과는 이 중 하나', fade(u, 1.3), { 'font-size': 15 });
      note(30, 300, 'userErrors 배열 대신 결과 타입 자체를 나눈다', fade(u, 1.8)); return; }
    if (k <= 2) { for (let i = 0; i < (k === 1 ? 2 : 4); i++) utype(i, k === 1 || i >= 2 ? pop(u, 0.3 + (i % 2) * 0.5) : 1);
      if (k === 1) { lpill(30, 120, 'existingPostId · 이미 있는 글로 안내', BAD, pop(u, 1.4), { fs: 14 }); note(30, 200, '에러마다 필요한 정보가 다르다', fade(u, 1.8)); sub(200, 230, '전용 타입이면 그것을 필드로 담는다', fade(u, 2.1), { 'font-size': 14 }); return; }
      note(30, 200, '에러 타입이 늘어도 서로 간섭하지 않는다', fade(u, 1.8)); return; }
    if (k === 3) { for (let i = 0; i < 4; i++) utype(i, 1);
      card(200, 175, 250, 52, { rx: 26, text: 'CreatePostResult', fs: 16, mono: true, stroke: INK, sw: 2.6, s: pop(u, 0.2) });
      UP.forEach(([x, y], i) => grow(326, 175, x - 118, y, E(u, 0.5 + i * 0.25, 0.9 + i * 0.25), UT[i][2] === GOOD ? ACC : MUT, { sw: 1.8 }));
      note(30, 360, '스키마만 봐도 어떻게 실패할 수 있는지 보인다', fade(u, 2.0)); return; }
    if (k === 4) { doc(30, 40, ['mutation Create($input: CreatePostInput!) {', '  createPost(input: $input) {', '    __typename', '    ... on CreatePostSuccess     { post { id title } }', '    ... on DuplicateTitleError   { message existingPostId }', '    ... on PermissionDeniedError { message requiredRole }', '    ... on ValidationError       { field message }', '  }', '}'], { fs: 13.5, w: 500, hi: (i) => i === 2 || i === 4 });
      doc(560, 70, ['{ "createPost": {', '    "__typename": "DuplicateTitleError",', '    "message": "…",', '    "existingPostId": "…"', '} }'], { lang: 'json', fs: 14, w: 370, title: '응답 모양 (실행 결과, 값은 줄임)', shown: lerp(0, 5, E(u, 0.6, 1.6)), hi: (i) => i === 1 });
      note(30, 330, '__typename 이 분기 키다', fade(u, 1.9), { fill: ACC }); return; }
    // k5: TS switch
    const S = doc(30, 50, ['switch (data.createPost.__typename) {', '  case "CreatePostSuccess":     router.push(…)', '  case "DuplicateTitleError":   toast(…)', '  case "PermissionDeniedError": showLoginModal()', '  case "ValidationError":       setFieldError(…)', '}'], { lang: 'js', fs: 14, w: 520, shown: lerp(0, 6, E(u, 0.1, 1.2)) });
    [0, 1, 2, 3].forEach((i) => { const y = 80 + i * 60, s = pop(u, 1.0 + i * 0.2); card(750, y, 200, 40, { rx: 20, text: UT[i][0].replace('Error', ''), fs: 14, mono: true, stroke: UT[i][2], color: UT[i][2], s });
      grow(552, S.ly(i + 1), 646, y, E(u, 1.0 + i * 0.2, 1.3 + i * 0.2), MUT, { plain: true }); });
    note(30, 340, 'codegen 의 Discriminated Union 덕분에', fade(u, 1.8)); note(30, 368, 'case 를 빠뜨리면 컴파일이 잡아 준다', fade(u, 2.1), { fill: INFO }); }

  // ---------- 4. optimistic UI ----------
  const LIKE = ['mutation LikePost($id: ID!) {', '  likePost(id: $id) {', '    __typename', '    ... on LikePostSuccess {', '      post { id likeCount isLikedByMe }', '    }', '  }', '}'];
  function cache(rows, o) { o = o || {}; R.kvTable(540, 60, 380, rows, { title: 'Apollo 캐시 (정규화) · 값은 예시', kw: 200, rh: 40 }); }
  function heart(n, on) { card(170, 360, 150, 50, { rx: 25, text: (on ? '♥ ' : '♡ ') + n, fs: 18, mono: true, stroke: on ? BAD : INK, color: on ? BAD : INK, sw: 2.4 }); }
  function s4(t, c) { const { k, u } = c;
    const row = (lc, lk, o) => [['Post:p1', '', { hot: o && o.key }], ['  likeCount', String(lc), { hot: o && o.hot }], ['  isLikedByMe', String(lk), { hot: o && o.hot }], ['  title', '"…"', { gone: o && o.stale }]];
    if (k <= 2) { doc(30, 40, LIKE, { fs: 14, w: 420, shown: k === 0 ? lerp(0, 8, E(u, 0.1, 1.2)) : 8, hi: (i) => k >= 1 && i === 4 });
      cache(row(12, false, { hot: k === 1 && u > 0.8 }));
      if (k === 0) { note(540, 290, '여기 적는 필드가 곧 캐시 갱신 범위', fade(u, 1.6)); return; }
      if (k === 1) { grow(452, 40 + 9 + 4 * 22 + 11, 536, 150, E(u, 0.4, 0.9), ACC); lpill(540, 280, 'id 가 있어야 같은 Post 로 알아본다', ACC, pop(u, 1.4), { fs: 13.5 });
        sub(730, 320, 'title 은 응답에 없으니 갱신되지 않는다', fade(u, 1.9), { 'font-size': 14 }); return; }
      heart(12, false); mono(260, 366, 'useMutation(LIKE_POST, { variables: { id: post.id } })', { 'font-size': 14, opacity: fade(u, 0.4) });
      dot([[170, 334], [170, 300], [400, 300], [400, 348]], seg(u, 0.8, 1.8), ACC, 6); return; }
    if (k === 3) { const D = doc(30, 40, ['optimisticResponse: {', '  likePost: {', '    __typename: "LikePostSuccess",', '    post: {', '      __typename: "Post", id: post.id,', '      likeCount: post.likeCount + 1,', '      isLikedByMe: true } } }'], { lang: 'js', fs: 14, w: 460, hi: (i) => i === 4 });
      cache(row(12, false, { key: u > 1.2 }));
      card(700, 330, 260, 40, { rx: 20, text: '__typename + ":" + id', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.8) });
      grow(700, 308, 640, 106, E(u, 1.2, 1.6), ACC);
      note(30, 260, '실제 응답과 똑같은 모양을 미리 만든다', fade(u, 1.8)); sub(240, 290, '__typename 과 id 가 빠지면 캐시가 엉뚱해진다', fade(u, 2.1), { 'font-size': 14, fill: BAD }); return; }
    if (k === 4) { const now = u > 0.6, srv = E(u, 1.2, 2.2);
      cache(now ? row(13, true, { hot: true }) : row(12, false));
      heart(now ? 13 : 12, now); dot([[250, 360], [540, 360]], seg(u, 1.2, 2.2), INFO, 7);
      tx(250, 300, '클릭 즉시', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) }); tx(540, 300, '서버 응답이 오면 진짜 값으로 덮는다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.0) });
      mono(30, 60, 'likeCount: post.likeCount + 1', { 'font-size': 15, fill: ACC, 'font-weight': 700 }); mono(30, 88, 'isLikedByMe: true', { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      sub(270, 140, '다르면 그때 원래 값으로 돌아간다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k5: 응답 모양 = 갱신 명령서
    doc(30, 50, ['post {', '  id', '  likeCount', '  isLikedByMe', '}'], { fs: 16, w: 240, title: 'mutation 응답에 적은 필드' });
    cache(row(13, true, { hot: true, key: true, stale: true }));
    [[1, 0], [2, 1], [3, 2]].forEach(([i, r], j) => grow(272, 50 + 9 + i * 24 + 12, 536, 60 + 30 + r * 40 + 20, E(u, 0.3 + j * 0.3, 0.7 + j * 0.3), ACC, { sw: 1.8 }));
    [['entity 의 id 필수', GOOD], ['바뀌는 필드는 응답에 포함', GOOD], ['응답에 없는 필드는 그대로 남는다', WARN]].forEach(([s, col], i) => lpill(30 + i * 0, 260 + i * 40, s, col, pop(u, 1.3 + i * 0.3), { fs: 14 })); }

  // ---------- 5. Validation 에러 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { doc(30, 50, ['type ValidationError {', '  path:    [String!]!', '  code:    String!', '  message: String!', '  meta:    JSON      # 선택', '}'], { fs: 15, w: 400, shown: lerp(0, 6, E(u, 0.1, 1.0)) });
      [['path', '["input","items","0","qty"]', '어느 입력인가'], ['code', '"MIN_VALUE"', 'i18n 키'], ['message', '"수량은 1 이상"', '번역이 없을 때 폴백']].forEach(([f, v, r], i) => { const y = 80 + i * 76, s = pop(u, 1.0 + i * 0.3);
        card(700, y, 420, 56, { rx: 10, stroke: [INFO, ACC, INK][i], sw: 2, s }); mono(506, y - 2, f + ': ' + v, { 'font-size': 14, opacity: s }); tx(900, y + 20, r, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s }); });
      tx(490, 330, '값은 예시', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { doc(30, 50, ['type CreateOrderSuccess { order: Order! }', 'type InsufficientStockError {', '  sku: String!  requested: Int!  available: Int!', '}'], { fs: 14, w: 470, hi: (i) => i >= 1 });
      tx(560, 70, '재고 부족 화면 · 값은 예시', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['requested', 5, BAD], ['available', 3, GOOD]].forEach(([n, v, col], i) => { mono(560, 120 + i * 50, n, { 'font-size': 15, 'font-weight': 700, fill: col }); hbar(680, 106 + i * 50, 200, v, 5, { col, u: E(u, 0.4 + i * 0.3, 1.0 + i * 0.3), h: 20 }); });
      note(560, 260, '"3개만 남았어요" 를 바로 그릴 수 있다', fade(u, 1.8)); note(30, 300, '도메인 에러는 화면이 쓸 수치를 함께 담는다', fade(u, 2.0)); return; }
    if (k === 2) { card(200, 180, 250, 52, { rx: 26, text: 'CreateOrderResult', fs: 16, mono: true, stroke: INK, sw: 2.6, s: pop(u, 0.2) });
      [['CreateOrderSuccess', GOOD], ['InsufficientStockError', WARN], ['ValidationError', INFO]].forEach(([n, col], i) => { const y = 90 + i * 90; grow(326, 180, 560, y, E(u, 0.5 + i * 0.3, 0.9 + i * 0.3), MUT, { sw: 1.8 });
        card(720, y, 300, 52, { rx: 10, text: n, fs: 15, mono: true, stroke: col, color: col, sw: 2.2, s: pop(u, 0.8 + i * 0.3) }); });
      note(30, 370, '검증 실패도 예외가 아니라 결과 타입 중 하나', fade(u, 2.0)); return; }
    if (k === 3) { const steps = ['input', 'items', '0', 'qty'], at = Math.floor(E(u, 0.2, 1.6) * 4);
      steps.forEach((s, i) => card(80 + i * 110, 60, 96, 36, { rx: 18, text: s, fs: 15, mono: true, stroke: i < at ? INFO : GRID, color: i < at ? INFO : MUT, fill: i < at ? INFOBG : PANEL, sw: 2 }));
      card(250, 230, 440, 190, { rx: 12, stroke: INK, sw: 2 }); tx(40, 124, '주문 폼 · input', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      [0, 1].forEach((r) => { const y = 160 + r * 60, hot = r === 0 && at >= 4; tx(54, y + 22, 'items[' + r + ']', { 'font-size': 14, class: 'mono', fill: MUT });
        el('rect', { x: 150, y, width: 170, height: 34, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 }); mono(162, y + 22, 'sku', { 'font-size': 14, fill: MUT });
        el('rect', { x: 340, y, width: 110, height: 34, rx: 6, fill: hot ? BADBG : PANEL, stroke: hot ? BAD : GRID, 'stroke-width': hot ? 2.6 : 1.6 }); mono(352, y + 22, 'qty', { 'font-size': 14, fill: hot ? BAD : MUT }); });
      mono(560, 170, 'code "MIN_VALUE"', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.7) });
      grow(620, 182, 620, 220, E(u, 1.8, 2.1), MUT); mono(560, 246, 't("validation.MIN_VALUE")', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      sub(700, 290, 'message 는 번역이 없을 때만', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 4) { [['createOrder', 80], ['updateCart', 180], ['addToWishlist', 280]].forEach(([m, y], i) => { card(150, y, 220, 44, { rx: 8, text: m, fs: 15, mono: true, s: pop(u, 0.2 + i * 0.2) });
        fly(260, y, 620, 180, seg(u, 0.7 + i * 0.3, 1.3 + i * 0.3), 'MIN_VALUE', { mono: true, fill: ACC }); });
      card(700, 180, 200, 120, { rx: 14, text: 'code 로 모은\n에러 분포', fs: 16, stroke: ACC, color: ACC, sw: 2.6, s: pop(u, 0.5) });
      lpill(560, 330, '새 에러 종류 = union 에 타입 하나 추가', INFO, pop(u, 2.0), { fs: 14 });
      tx(560, 380, 'mutation 이름은 예시', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    [['message 만 보내고 code 생략', 'i18n·모니터링 불가'], ['errors 를 string[] 로 평탄화', '폼 필드에 못 붙인다'], ['어떤 땐 throw, 어떤 땐 userErrors', '클라이언트 분기가 두 갈래']].forEach(([a, b], i) => { const y = 80 + i * 96, s = pop(u, 0.3 + i * 0.4);
      card(400, y, 560, 70, { rx: 12, text: a + '\n' + b, fs: 15, stroke: BAD, color: INK, s }); cross(150, y, 14, s); });
    note(150, 390, 'code · path · 한 가지 방식, 이 셋을 지킨다', fade(u, 1.9), { fill: ACC }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: 'createPost: Post! 의 resolver가 throw하면 응답의 data는 어떻게 되는가?',
      o: ['data가 통째로 null이 된다', 'data.createPost만 null이 된다', 'data는 빈 객체 {}가 된다'], a: 0,
      why: 'Post!는 null을 담을 수 없어 null이 한 칸 위로 번진다. 루트 필드라 data까지 null이 되고 메시지는 errors에 실린다.' },
    { q: 'CreatePostPayload에서 제목 중복이 나면 응답은 어떤 모양인가?',
      o: ['post에 에러 문자열이 들어간다', 'top-level errors에 DUPLICATE_TITLE이 실린다', 'post는 null, userErrors에 field·message·code가 담긴다'], a: 2,
      why: '실행 결과 top-level errors는 없고 userErrors에 { field: ["title"], code: "DUPLICATE_TITLE" }가 왔다. 실패도 정상 데이터다.' },
    { q: 'union CreatePostResult 응답을 받은 클라이언트가 분기에 쓰는 값은 무엇인가?',
      o: ['userErrors.length', '__typename', 'HTTP 상태 코드'], a: 1,
      why: '결과는 네 타입 중 하나라 __typename으로 갈라 받는다. codegen이 만든 Discriminated Union이면 case 누락도 컴파일이 잡는다.' },
    { q: 'optimisticResponse에 __typename과 id를 꼭 넣어야 하는 이유는 무엇인가?',
      o: ['서버가 검증에 쓰기 때문에', 'Apollo가 둘을 합친 Post:p1 같은 키로 캐시 항목을 찾기 때문에', '없으면 mutation이 서버로 가지 않아서'], a: 1,
      why: '정규화 캐시는 __typename과 id로 같은 객체를 알아본다. 키가 맞아야 likeCount + 1이 기존 Post에 바로 반영된다.' },
    { q: 'ValidationError의 path를 ["input","items","0","qty"]처럼 배열로 두면 좋은 점은 무엇인가?',
      o: ['중첩 입력과 배열 항목까지 정확히 가리킬 수 있다', '번역 키로 바로 쓸 수 있다', '응답 크기가 줄어든다'], a: 0,
      why: '경로를 따라가면 주문 폼의 items[0].qty 칸에 정확히 빨간 표시를 붙일 수 있다. 번역은 code가 맡는다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'entity를 Post!로 바로 돌려주면 비즈니스 실패도 throw가 되어 data까지 null이 된다.',
    'Payload에 post와 userErrors를 함께 두면 실패도 정상 데이터로 오고 분기가 한 갈래다.',
    'union 결과는 에러마다 전용 타입과 필드를 갖고 __typename으로 갈라 받는다.',
    'mutation 응답에 id와 바뀐 필드를 넣어야 캐시가 갱신되고, 검증 에러는 path와 code로 준다.',
  ];
  const review = [
    { q: '글 등록 화면이 제목 중복 때 data: null을 받아 전체가 에러 화면으로 바뀐다. 먼저 고칠 것은?',
      o: ['중복을 throw 대신 userErrors나 union 결과 타입으로 돌려준다', 'HTTP 상태 코드를 409로 바꾼다', '클라이언트에서 errors 배열을 무시한다'], a: 0,
      why: '예상 가능한 실패를 throw하면 Non-Null 전파로 data가 사라진다. 결과 타입에 담으면 폼이 원인을 받아 칸 옆에 보여 줄 수 있다.' },
    { q: '좋아요를 누르면 숫자는 바로 바뀌는데, 목록의 하트 색은 새로 고침 전까지 그대로다. 의심할 것은?',
      o: ['likePost에 __typename이 없다', 'mutation 응답에 isLikedByMe를 요청하지 않았다', '서버가 likeCount를 잘못 계산했다'], a: 1,
      why: '캐시는 응답에 적힌 필드만 갱신한다. 바뀌는 필드를 응답 문서와 optimisticResponse에 모두 넣어야 화면이 따라온다.' },
    { q: '다국어 앱에서 검증 메시지가 늘 한국어로만 나온다. 응답 설계에서 빠진 것은?',
      o: ['existingPostId 필드', 'path 배열', '번역 키로 쓸 code 값'], a: 2,
      why: 'message는 사람용 폴백일 뿐이다. MIN_VALUE 같은 code가 있어야 화면이 언어에 맞는 문구를 고른다.' },
  ];

  R.page({ title: 'mutation 응답 모양', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
