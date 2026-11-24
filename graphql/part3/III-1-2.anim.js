/* III-1-2 Aliases + Directives — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 에러 문구·응답 JSON·@defer 청크는 graphql-js 16 / 17.1 과 @graphql-tools 로 실제로 돌려 본 결과다. */
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

  // 스위치(Boolean 변수): f 0→1 이 false→true
  function toggle(cx, cy, f, name, o) { o = o || {}; const op = o.op ?? 1; f = clamp(f);
    el('rect', { x: cx - 30, y: cy - 15, width: 60, height: 30, rx: 15, fill: f > 0.5 ? ACC : OFF, opacity: op });
    el('circle', { cx: cx - 15 + 30 * f, cy, r: 11, fill: PANEL, opacity: op });
    if (name) mono(cx - 42, cy + 5, name, { 'font-size': o.fs || 15, 'font-weight': 700, 'text-anchor': 'end', fill: ACC, opacity: op });
    mono(cx + 42, cy + 5, f > 0.5 ? 'true' : 'false', { 'font-size': o.fs || 15, 'font-weight': 700, fill: f > 0.5 ? ACC : MUT, opacity: op }); }

  // ---------- 1. Alias ----------
  const QA0 = ['query {', '  user(id: "1") { name }', '  user(id: "2") { name }', '}'];
  const QA1 = ['query {', '  me:     user(id: "1") { name }', '  friend: user(id: "2") { name }', '}'];
  const FEED3 = ['query Feed {', '  trending: posts(orderBy: HOT,    first: 5) { title }', '  latest:   posts(orderBy: LATEST, first: 5) { title }', '  myDrafts: posts(authorIs: ME, status: DRAFT) { title }', '}'];
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { const D = doc(40, 70, k === 0 ? QA0 : QA1, { fs: 16, w: 380, title: '쿼리', hi: (i) => k >= 1 && (i === 1 || i === 2) });
      if (k === 0) { const Rr = doc(560, 70, ['{ "data": {', '    "user": ?', '} }'], { lang: 'json', fs: 16, w: 340, title: '응답 · 키는 필드 이름' });
        fly(D.x + D.w - 20, D.ly(1), 736, Rr.ly(1), seg(u, 0.3, 1.2), 'user #1', { mono: true, fill: INFO, stay: true });
        fly(D.x + D.w - 20, D.ly(2), 820, Rr.ly(1), seg(u, 0.6, 1.5), 'user #2', { mono: true, fill: WARN, stay: true });
        if (u > 1.5) cross(882, Rr.ly(1), 12, pop(u, 1.5));
        tx(40, 282, '담을 자리가 하나뿐 · graphql-js 검증 결과', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) });
        mono(40, 312, 'Fields "user" conflict because they have differing arguments.', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) });
        mono(40, 336, 'Use different aliases on the fields to fetch both if this was intentional.', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.2) }); return; }
      if (k === 1) { ['me:', 'friend:'].forEach((s, i) => lpill(440, D.ly(i + 1), s + ' 응답에서 쓸 이름', ACC, pop(u, 0.4 + i * 0.4), { fs: 13.5 }));
        const Rr = doc(640, 70, ['{ "data": {', '    "me":     { … },', '    "friend": { … }', '} }'], { lang: 'json', fs: 16, w: 290, shown: lerp(1, 4, E(u, 1.0, 1.8)) });
        note(40, 300, '필드 앞에 이름: 을 붙이면 응답 키가 그 이름이 된다', fade(u, 2.0)); return; }
      const Rr = doc(500, 50, ['{', '  "data": {', '    "me":     { "name": "…" },', '    "friend": { "name": "…" }', '  }', '}'], { lang: 'json', fs: 16, w: 420, shown: lerp(0, 6, E(u, 0.1, 1.0)), hi: (i) => i === 2 || i === 3 });
      [1, 2].forEach((i) => curve(`M${D.x + D.w},${D.ly(i)} C470,${D.ly(i)} 470,${Rr.ly(i + 1)} 500,${Rr.ly(i + 1)}`, E(u, 1.0 + i * 0.3, 1.6 + i * 0.3), ACC));
      note(40, 300, '쿼리에 적은 모양 그대로 응답이 채워진다', fade(u, 2.0)); sub(250, 330, '클라이언트가 받을 JSON 키를 쿼리에서 정한다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 3) { card(170, 120, 270, 44, { rx: 8, text: 'posts(orderBy: HOT, first: 5)', fs: 14, mono: true, s: pop(u, 0.2) });
      grow(310, 120, 380, 120, E(u, 0.7, 1.1), ACC);
      card(470, 120, 150, 44, { rx: 22, text: 'trending', fs: 16, mono: true, stroke: ACC, color: ACC, sw: 2.6, s: pop(u, 1.0) });
      // 화면 모형: 섹션 이름 = alias
      card(760, 190, 300, 300, { rx: 12, stroke: GRID, sw: 1.8, s: pop(u, 1.3) });
      [['인기 글', 'trending', ACC], ['최신 글', 'latest', MUT], ['내 임시 글', 'myDrafts', MUT]].forEach(([a, b, col], i) => { const y = 80 + i * 90, op = fade(u, 1.5 + i * 0.2);
        tx(630, y, a, { 'font-size': 15, 'font-weight': 800, opacity: op }); mono(890, y, b, { 'font-size': 14, fill: col, 'text-anchor': 'end', 'font-weight': 700, opacity: op });
        [0, 1].forEach((j) => el('rect', { x: 630, y: y + 14 + j * 22, width: 260, height: 14, rx: 4, fill: SOFT, opacity: op })); });
      grow(545, 120, 620, 84, E(u, 1.9, 2.3), ACC);
      note(40, 260, '응답 키를 화면이 부르는 이름으로', fade(u, 2.0)); sub(200, 290, '충돌이 없어도 의미를 붙이려고 쓴다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k4: 한 쿼리에 목록 셋
    doc(30, 50, FEED3, { fs: 14, w: 500, shown: lerp(1, 5, E(u, 0.1, 0.9)) });
    [['trending', 5], ['latest', 5], ['myDrafts', 2]].forEach(([n, m], i) => { const y = 70 + i * 62;
      mono(560, y + 5, n, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9 + i * 0.25) });
      for (let j = 0; j < m; j++) card(680 + j * 48, y, 40, 34, { rx: 5, text: 't', fs: 13.5, mono: true, stroke: GRID, color: MUT, s: pop(u, 1.0 + i * 0.25 + j * 0.06) });
      if (i === 2) mono(680 + 2 * 48, y + 5, '…', { 'font-size': 16, fill: MUT, opacity: fade(u, 1.6) }); });
    tx(30, 296, '목록마다 따로 부르면', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) });
    [0, 1, 2].forEach((i) => grow(220, 290 + (i - 1) * 12 + 6, 420, 290 + (i - 1) * 12 + 6, E(u, 1.5 + i * 0.15, 1.9 + i * 0.15), MUT));
    mono(436, 302, '요청 3번', { 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.9) });
    tx(30, 356, 'alias 로 한 쿼리', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
    grow(220, 350, 420, 350, E(u, 2.1, 2.4), ACC, { sw: 3.5 }); mono(436, 356, '요청 1번', { 'font-size': 14.5, fill: ACC, 'font-weight': 800, opacity: fade(u, 2.4) }); }

  // ---------- 2. @include ----------
  const PROF = ['query Profile($id: ID!, $withEmail: Boolean!) {', '  user(id: $id) {', '    id', '    name', '    email @include(if: $withEmail)', '  }', '}'];
  function respUser(x, y, withEmail, op, o) { o = o || {}; const lines = ['{ "data": { "user": {', '    "id": "1",', '    "name": "…"'].concat(withEmail > 0 ? ['    "email": "…"'] : [], ['} } }']);
    const Rr = doc(x, y, lines, { lang: 'json', fs: 15, w: 300, title: '응답', hi: (i) => withEmail > 0 && i === 3, op });
    return Rr; }
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { const D = doc(30, 50, PROF, { fs: 14.5, w: 460, shown: k === 0 ? lerp(0, 7, E(u, 0.1, 1.2)) : 7, hi: (i) => i === 4 });
      if (k === 0) { lpill(500, D.ly(4), '꼬리표 @include', WARN, pop(u, 1.4), { fs: 13.5 }); toggle(220, 300, 0.5, '$withEmail', { op: fade(u, 1.8) });
        note(40, 370, '조건 값은 variables 로 넘긴다', fade(u, 2.1)); return; }
      const on = k === 1 ? 0 : E(u, 0.3, 0.7);
      toggle(220, 300, on, '$withEmail');
      mono(40, 360, `{ "id": "1", "withEmail": ${on > 0.5 ? 'true' : 'false'} }`, { 'font-size': 14.5, opacity: 0.85 });
      const Rr = respUser(560, 60, k === 2 ? fade(u, 0.8) : 0, fade(u, 0.2));
      if (k === 1) { el('rect', { x: 574, y: 182, width: 160, height: 24, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 1.6, 'stroke-dasharray': '4 3', opacity: fade(u, 1.0) });
        mono(588, 199, '"email"', { 'font-size': 14, fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 1.0) });
        note(560, 246, 'email 키 자체가 없다', fade(u, 1.5), { fill: BAD }); sub(680, 274, 'null 이 아니라 없음', fade(u, 1.9), { 'font-size': 14 }); return; }
      note(560, 236, '쿼리 문서는 그대로, variables 만 바꿨다', fade(u, 1.4)); return; }
    if (k === 3) { const D = doc(30, 50, ['query Me($isAdmin: Boolean!) {', '  me {', '    name', '    ...AdminFields @include(if: $isAdmin)', '  }', '}'], { fs: 14.5, w: 460, hi: (i) => i === 3 });
      doc(30, 260, ['fragment AdminFields on User {', '  email', '  phone', '}'], { fs: 14.5, w: 330, title: '관리자에게만 보일 필드 묶음' });
      const on = E(u, 1.0, 1.4); toggle(560, 300, on, '$isAdmin', { fs: 14.5 });
      const lines = ['{ "data": { "me": {', '    "name": "…"'].concat(on > 0.5 ? ['    "email": "…",', '    "phone": "…"'] : [], ['} } }']);
      doc(560, 60, lines, { lang: 'json', fs: 15, w: 300, title: '응답', hi: (i) => on > 0.5 && (i === 2 || i === 3) });
      note(560, 370, '필드 묶음 전체를 한 번에 켜고 끈다', fade(u, 1.8)); return; }
    // k4: 캐시 키가 둘
    doc(30, 50, PROF, { fs: 14.5, w: 460, dim: (i) => i !== 0 });
    R.kvTable(60, 236, 840, [['Profile + {"id":"1","withEmail":false}', '{ id, name }', { hot: false }], ['Profile + {"id":"1","withEmail":true}', '{ id, name, email }', { hot: E(u, 0.8, 1.2) > 0.5 }]].slice(0, u < 0.8 ? 1 : 2), { title: '클라이언트 캐시 · 키 = 쿼리 + variables', kw: 520, rh: 40 });
    note(560, 110, '토글할수록 캐시 항목이 는다', fade(u, 1.6), { fill: WARN }); sub(700, 140, '토글 변수는 적게', fade(u, 2.0), { 'font-size': 14 }); }

  // ---------- 3. @skip ----------
  const SK = ['query Feed($lowBandwidth: Boolean!) {', '  posts(first: 20) {', '    id', '    title', '    coverImage(width: 1200) @skip(if: $lowBandwidth) { url }', '    thumbnail(width: 200) @include(if: $lowBandwidth) { url }', '  }', '}'];
  // 글 카드 모형: cover(0~1) 큰 이미지, thumb(0~1) 작은 이미지
  function post(cover, thumb, op) { card(760, 175, 300, 250, { rx: 12, stroke: INK, sw: 2, op: op ?? 1 }); tx(610, 40, '피드의 글 하나', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op ?? 1 });
    if (cover > 0.02) { el('rect', { x: 626, y: 66, width: 268, height: 130 * cover, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 1.6 });
      if (cover > 0.6) mono(760, 136, 'coverImage 1200px', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: cover }); }
    const ty = 66 + 130 * cover + 14;
    if (thumb > 0.02) { el('rect', { x: 626, y: ty, width: 56 * thumb, height: 56 * thumb, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.6 }); mono(692, ty + 34, '200px', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: thumb }); }
    const tt = thumb > 0.02 ? ty + 66 : ty;
    mono(626, tt + 14, 'title', { 'font-size': 15, 'font-weight': 800 }); mono(626, tt + 36, 'id', { 'font-size': 13.5, fill: MUT }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { doc(30, 50, SK, { fs: 13.5, w: 540, shown: k === 0 ? 4 : k === 1 ? 5 : 6, hi: (i) => (k === 0 && (i === 2 || i === 3)) || (k === 1 && i === 4) || (k === 2 && i === 5) });
      let lb, cover, thumb;
      if (k === 0) { lb = 0; cover = 0; thumb = 0; toggle(220, 300, 0, '$lowBandwidth', { op: fade(u, 0.6) }); post(0, 0, 1);
        note(40, 370, 'id, title 은 어떤 경우에도 받는다', fade(u, 1.2)); return; }
      if (k === 1) { lb = E(u, 1.2, 1.6); cover = 1 - E(u, 1.4, 1.9); thumb = 0; }
      else { lb = 1 - E(u, 1.5, 1.9); cover = E(u, 1.7, 2.2); thumb = 1 - E(u, 1.5, 1.8); }
      toggle(220, 300, lb, '$lowBandwidth'); post(cover, thumb);
      note(40, 370, k === 1 ? '@skip 은 조건이 true 면 뺀다' : '같은 변수를 @skip 과 @include 에 · 맞바꾸는 스위치', fade(u, 0.3), { fill: k === 1 ? INFO : GOOD }); return; }
    if (k === 3) { doc(30, 50, ['query($s: Boolean!, $i: Boolean!) {', '  user(id: "1") {', '    name', '    email @skip(if: $s) @include(if: $i)', '  }', '}'], { fs: 14.5, w: 450, hi: (i) => i === 3 });
      const x0 = 640, y0 = 90, cw = 130, ch = 70;
      tx(x0 + cw, y0 - 40, '@include(if: $i)', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle', fill: WARN });
      tx(x0 - 14, y0 - 12, '@skip(if: $s)', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', 'text-anchor': 'end', fill: WARN });
      ['false', 'true'].forEach((v, j) => { mono(x0 + j * cw + cw / 2, y0 - 12, v, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); mono(x0 - 14, y0 + j * ch + ch / 2 + 5, v, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); });
      [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([s, i], n) => { const inc = !s && i, sc = pop(u, 0.4 + n * 0.3);
        card(x0 + i * cw + cw / 2, y0 + s * ch + ch / 2, cw - 8, ch - 8, { rx: 8, text: inc ? 'email 포함' : '빠짐', fs: 14.5, stroke: inc ? GOOD : GRID, color: inc ? GOOD : MUT, fill: inc ? GOODBG : PANEL, sw: inc ? 2.6 : 1.6, s: sc }); });
      note(40, 300, '둘 다 붙이면 skip 이 false, include 가 true 일 때만 남는다', fade(u, 1.8));
      sub(260, 330, '네 칸을 머리로 추적해야 한다 · 하나만 쓰자', fade(u, 2.2), { 'font-size': 14, fill: WARN }); return; }
    // k4: 실무 세 패턴
    [['$isLoggedIn', 'field @include(if: $isLoggedIn)', '게스트 / 로그인'], ['$variantB', 'newField @include(if: $variantB)', 'AB 테스트'], ['$useNew', 'legacyField @skip(if: $useNew)', '점진 출시']].forEach(([v, f, lab], i) => { const y = 80 + i * 86, op = fade(u, 0.2 + i * 0.4);
      tx(40, y + 5, lab, { 'font-size': 15, 'font-weight': 800, opacity: op });
      toggle(300, y, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), null, { op });
      mono(260, y + 5, v, { 'font-size': 14.5, 'text-anchor': 'end', fill: ACC, 'font-weight': 700, opacity: op });
      mono(390, y + 5, f, { 'font-size': 14.5, opacity: op }); });
    note(40, 350, '모든 필드에 도배할 정도면 query 를 둘로 쪼갠다', fade(u, 1.9), { fill: WARN }); }

  // ---------- 4. @defer / @stream ----------
  const DASH = ['query Dashboard {', '  me {', '    id', '    name', '    ... on User @defer(label: "stats") {', '      lifetimeStats { posts comments likes }', '    }', '  }', '}'];
  function timeline(m1, m2, o) { o = o || {}; const y = 384;
    grow(480, y, 930, y, 1, MUT); tx(930, y + 26, '시간', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    if (m1 > 0) { el('circle', { cx: 510, cy: y, r: 9 * m1, fill: ACC }); tx(510, y - 16, '청크 1 · 즉시', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: m1 }); }
    if (m2 > 0) { const x = o.x2 || 820; el('circle', { cx: x, cy: y, r: 9 * m2, fill: WARN }); tx(x, y - 16, '청크 2 · 나중', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: m2 }); } }
  function dash(name, stats) { card(705, 150, 420, 210, { rx: 12, stroke: INK, sw: 2 }); tx(500, 36, '대시보드 화면', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    el('circle', { cx: 540, cy: 90, r: 20, fill: name ? ACCBG : SOFT, stroke: name ? ACC : GRID, 'stroke-width': 2 });
    mono(576, 96, name ? 'id · name' : '', { 'font-size': 15, 'font-weight': 700, fill: ACC });
    ['posts', 'comments', 'likes'].forEach((s, i) => { const x = 520 + i * 128;
      el('rect', { x, y: 140, width: 116, height: 88, rx: 8, fill: stats > 0.5 ? WARNBG : PANEL, stroke: stats > 0.5 ? WARN : GRID, 'stroke-width': 1.8, 'stroke-dasharray': stats > 0.5 ? null : '5 4' });
      mono(x + 58, 190, stats > 0.5 ? s : '…', { 'font-size': 14.5, fill: stats > 0.5 ? WARN : MUT, 'text-anchor': 'middle', 'font-weight': 700 }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { doc(30, 40, DASH, { fs: 14, w: 430, shown: k === 0 ? 4 : 9, hi: (i) => (k === 0 && (i === 2 || i === 3)) || (k === 1 && i >= 4 && i <= 6) });
      dash(k === 0 ? fade(u, 0.8) : 1, 0);
      timeline(k === 0 ? pop(u, 0.6) : 1, k === 1 ? pop(u, 0.5) : 0, { x2: k === 1 ? lerp(520, 820, E(u, 0.6, 1.8)) : 820 });
      note(30, k === 0 ? 300 : 300, k === 0 ? '먼저 그릴 가벼운 필드는 바깥에' : '@defer 를 붙인 fragment 는 뒤 청크로 밀린다', fade(u, 1.4), { fill: k === 0 ? ACC : WARN }); return; }
    if (k === 2) { doc(30, 40, DASH, { fs: 14, w: 430, dim: (i) => i < 4 || i > 6 });
      const A = doc(476, 40, ['{ "data": { "me": { "id": "1", "name": "…" } },', '  "pending": [{ "id": "0", "path": ["me"],', '                "label": "stats" }],', '  "hasNext": true }'], { lang: 'json', fs: 13.5, w: 450, title: '청크 1 (graphql-js 17.1 실행 결과)', tcol: ACC, op: fade(u, 0.2) });
      const B2 = doc(476, 210, ['{ "incremental": [{ "id": "0",', '    "data": { "lifetimeStats": { … } } }],', '  "completed": [{ "id": "0" }],', '  "hasNext": false }'], { lang: 'json', fs: 13.5, w: 450, title: '청크 2', tcol: WARN, op: fade(u, 1.0) });
      curve(`M${476 + 450},${B2.ly(0)} C950,${B2.ly(0)} 950,${A.ly(1)} ${476 + 450},${A.ly(1)}`, E(u, 1.5, 2.2), WARN);
      note(30, 300, 'id "0" 으로 pending 의 path ["me"] 를 찾아', fade(u, 1.8)); note(30, 328, '그 자리에 병합한다', fade(u, 2.0), { fill: WARN });
      timeline(1, 1); return; }
    if (k === 3) { doc(30, 40, ['query LongList {', '  posts(first: 1000) @stream(initialCount: 20) {', '    id title', '  }', '}'], { fs: 14, w: 430, hi: (i) => i === 1 });
      for (let i = 0; i < 20; i++) card(500 + (i % 10) * 42, 70 + Math.floor(i / 10) * 42, 36, 36, { rx: 5, fill: ACCBG, stroke: ACC, sw: 1.6, s: pop(u, 0.2 + i * 0.01, 0.4) });
      tx(500, 44, '처음 20개 · 청크 1', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      for (let i = 0; i < 30; i++) { const s = pop(u, 1.0 + Math.floor(i / 10) * 0.45 + (i % 10) * 0.02, 0.4); card(500 + (i % 10) * 42, 170 + Math.floor(i / 10) * 42, 36, 36, { rx: 5, fill: WARNBG, stroke: WARN, sw: 1.6, s }); }
      mono(500, 316, '… 나머지 980개는 뒤 청크로 흘러온다', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) });
      note(30, 300, '@defer 는 필드 묶음을, @stream 은 리스트 항목을 나눈다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    // k4: 도입 전 확인
    [['서버', 'Apollo Router · GraphQL Yoga'], ['클라이언트', 'Apollo Client · urql']].forEach(([a, b], i) => { const y = 110 + i * 100, s = pop(u, 0.3 + i * 0.4);
      card(300, y, 440, 74, { rx: 10, stroke: WARN, sw: 2, s }); tx(110, y - 6, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.4) });
      tx(110, y + 20, b + ' 부분 지원', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); });
    mono(560, 165, '+', { 'font-size': 30, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.0) });
    card(760, 160, 260, 110, { rx: 12, text: '양쪽이 모두\n지원해야 쓴다', fs: 16, stroke: INK, sw: 2.4, s: pop(u, 1.3) });
    note(80, 330, 'incremental delivery 명세는 아직 진행 중', fade(u, 1.8), { fill: WARN });
    sub(330, 360, 'graphql-js 17 에서도 experimentalExecuteIncrementally 로 따로 부른다', fade(u, 2.2), { 'font-size': 14 }); }

  // ---------- 5. Custom directive ----------
  const FIELDS = [['Query', 'me: User', null], ['Query', 'adminStats: AdminStats', '@auth(requires: ADMIN)'], ['User', 'name: String!', '@uppercase']];
  function fieldRows(o) { o = o || {};
    FIELDS.forEach(([ty, f, d], i) => { const y = 70 + i * 66, hot = o.hot === i;
      el('rect', { x: 30, y, width: 410, height: 48, rx: 8, fill: hot ? INFOBG : PANEL, stroke: hot ? INFO : GRID, 'stroke-width': hot ? 2.4 : 1.6 });
      mono(46, y + 30, ty + '.', { 'font-size': 15, fill: MUT }); mono(46 + tw(ty + '.', 15), y + 30, f, { 'font-size': 15, 'font-weight': 700 });
      const ds = o.tag ? o.tag(i) : 1; if (d && ds > 0) lpill(452, y + 24, d, WARN, ds, { fs: 13.5, mono: true }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { doc(30, 50, ['directive @auth(requires: Role!) on FIELD_DEFINITION', 'directive @uppercase on FIELD_DEFINITION', '', 'enum Role { ADMIN USER GUEST }'], { fs: 15, w: 520, shown: lerp(0, 4, E(u, 0.1, 1.4)), hi: (i) => i <= 1 });
      lpill(200, 220, '이름 · 인자', WARN, pop(u, 1.5), { fs: 14 }); lpill(360, 220, '붙일 자리 = 필드 정의', INFO, pop(u, 1.8), { fs: 14 });
      doc(600, 60, ['type Query {', '  me: User', '  adminStats: AdminStats', '}'], { fs: 15, w: 300, hi: (i) => i === 1 || i === 2, op: fade(u, 1.9) });
      note(30, 320, '먼저 스키마에 이름과 붙일 수 있는 위치를 선언한다', fade(u, 2.2)); return; }
    if (k === 1) { fieldRows({ tag: (i) => pop(u, 0.4 + i * 0.4) });
      fly(700, 380, 560, 136 + 24, seg(u, 0.1, 0.6), '@auth', { mono: true, fill: WARN });
      note(30, 300, '필드에 붙였을 뿐이다', fade(u, 1.6)); sub(220, 330, '아직 아무 일도 일어나지 않는 표시', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2) { const sc = E(u, 0.2, 2.2) * 3, hot = Math.min(2, Math.floor(sc));
      fieldRows({ hot }); el('rect', { x: 24, y: 64 + sc * 66 - 4, width: 422, height: 4, rx: 2, fill: INFO, opacity: sc < 3 ? 1 : 0 });
      tx(700, 46, 'getDirective(schema, field, …)', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: INFO, 'text-anchor': 'middle' });
      ['undefined', '[{ "requires": "ADMIN" }]', '[{}]'].forEach((r, i) => mono(680, 70 + i * 66 + 30, '→ ' + r, { 'font-size': 14.5, fill: i ? WARN : MUT, 'font-weight': 700, opacity: sc > i + 0.5 ? 1 : 0 }));
      note(30, 300, 'mapSchema 가 필드를 하나씩 돌며 표시를 읽는다', fade(u, 0.4)); return; }
    if (k === 3) { fieldRows({ hot: 2, tag: (i) => (i === 2 ? 1 : 0) });
      el('rect', { x: 560, y: 70, width: 360, height: 220, rx: 14, fill: WARNBG, stroke: WARN, 'stroke-width': 2.2, opacity: fade(u, 0.2) });
      tx(574, 94, '감싼 resolve · toUpperCase', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) });
      el('rect', { x: 600, y: 120, width: 280, height: 110, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.4) });
      tx(614, 144, '원래 resolve', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.4) });
      fly(660, 190, 840, 260, seg(u, 0.8, 1.6), '"kim"', { mono: true, fill: INK, stay: u < 1.7 });
      if (u > 1.7) card(740, 262, 90, 30, { rx: 15, text: '"KIM"', fs: 14, mono: true, fill: WARN, stroke: 'none', color: PANEL, s: pop(u, 1.7) });
      note(30, 300, '원래 resolve 를 꺼내 감싼다', fade(u, 1.0)); sub(200, 330, '실행 결과 me.name = "KIM"', fade(u, 2.0), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 4) { fieldRows({ hot: 1, tag: (i) => (i === 1 ? 1 : 0) });
      card(790, 90, 260, 44, { rx: 8, text: 'ctx.user.role = "USER"', fs: 14.5, mono: true, s: pop(u, 0.2) });
      card(790, 150, 260, 44, { rx: 8, text: 'requires = "ADMIN"', fs: 14.5, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.5) });
      mono(940, 128, '≠', { 'font-size': 26, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
      doc(476, 210, ['{ "errors": [{ "message": "Forbidden",', '               "path": ["adminStats"] }],', '  "data": { "me": { "name": "KIM" },', '            "adminStats": null } }'], { lang: 'json', fs: 14, w: 450, title: '응답 (실행 결과)', tcol: BAD, shown: lerp(0, 4, E(u, 1.0, 1.8)), hi: (i) => i === 3 });
      note(30, 300, '막힌 필드만 null, 나머지는 그대로 온다', fade(u, 2.0), { fill: BAD }); return; }
    // k5: 새 스키마
    [['schema', INK, 0.2], ['mapSchema', INFO, 0.6], ['새 schema', ACC, 1.0]].forEach(([s, col, at], i) => { card(170 + i * 300, 150, 200, 70, { rx: 12, text: s, fs: 17, mono: true, stroke: col, color: col, sw: 2.4, s: pop(u, at) });
      if (i) grow(270 + (i - 1) * 300 + 4, 150, 70 + i * 300 - 6, 150, E(u, at - 0.2, at), MUT); });
    [['name', '@uppercase'], ['adminStats', '@auth']].forEach(([f, d], i) => { const s = pop(u, 1.4 + i * 0.3);
      card(770, 250 + i * 50, 220, 38, { rx: 19, text: f + ' ← ' + d, fs: 14, mono: true, stroke: WARN, color: INK, s }); });
    note(80, 300, '선언하고, 붙이고, 순회하며 감싼다', fade(u, 1.8)); sub(250, 330, '이 셋이 모여 커스텀 directive 가 된다', fade(u, 2.1), { 'font-size': 14 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '한 쿼리에서 user(id: "1")과 user(id: "2")를 alias 없이 함께 부르면 어떻게 되는가?',
      o: ['두 결과가 user 배열로 합쳐져 온다', '검증 단계에서 필드 충돌(conflict) 에러로 거절된다', '뒤에 적은 user만 응답에 남는다'], a: 1,
      why: '응답 키는 필드 이름이라 같은 키에 다른 인자의 결과 둘을 담을 수 없다. graphql-js는 실행 전에 alias를 쓰라는 에러를 낸다.' },
    { q: 'email @include(if: $withEmail)에서 withEmail이 false면 응답의 email은 어떻게 되는가?',
      o: ['키 자체가 응답에 없다', '"email": null로 온다', '"email": "" 로 온다'], a: 0,
      why: 'directive로 빠진 필드는 실행되지 않으니 null도 아니고 키가 아예 없다. 실행 결과는 { id, name } 뿐이었다.' },
    { q: '한 필드에 @skip(if: $s) @include(if: $i)를 둘 다 붙이면 필드가 남는 경우는 무엇인가?',
      o: ['$s가 true이고 $i가 true일 때', '둘 중 하나라도 true일 때', '$s가 false이고 $i가 true일 때'], a: 2,
      why: '@skip이 true면 빠지고, @include가 false면 빠진다. 네 조합을 돌려 보면 skip false·include true 한 칸만 email이 남는다.' },
    { q: '@defer를 붙인 fragment의 필드는 응답에서 어떻게 오는가?',
      o: ['첫 청크에 null로 들어갔다가 다시 덮인다', '뒤 청크로 따로 와서 pending에 적힌 path 자리에 병합된다', '클라이언트가 따로 다시 요청해야 받는다'], a: 1,
      why: 'graphql-js 17.1로 돌리면 첫 청크는 hasNext: true와 pending [{ id: "0", path: ["me"] }]을 보내고, 둘째 청크가 id "0"으로 lifetimeStats를 채운다.' },
    { q: 'SDL에 directive @uppercase를 선언하고 필드에 붙이기만 하면 무슨 일이 일어나는가?',
      o: ['아무 일도 없다. mapSchema로 resolve를 감싸는 코드가 있어야 동작한다', '서버가 자동으로 문자열을 대문자로 바꾼다', '스키마 빌드 에러가 난다'], a: 0,
      why: '선언과 부착은 표시일 뿐이다. getDirective로 표시를 읽고 원래 resolve를 감싸야 "kim"이 "KIM"이 된다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '응답 키는 필드 이름이라, 같은 필드를 다른 인자로 두 번 부르려면 alias가 있어야 한다.',
    '@include는 true일 때 넣고 @skip은 true일 때 빼며, 빠진 필드는 키 자체가 없다.',
    '@defer와 @stream은 응답을 청크로 나눠 보내지만 서버와 클라이언트가 모두 지원해야 한다.',
    '커스텀 directive는 선언하고 붙인 뒤 mapSchema로 resolve를 감싸야 동작한다.',
  ];
  const review = [
    { q: '권한 화면에서 email 키가 없어 화면이 깨졌다. 쿼리에는 email @include(if: $isAdmin)이 있다. 먼저 볼 것은?',
      o: ['보낸 variables에서 isAdmin 값', 'email 필드의 resolver 에러 로그', '서버의 @auth 구현'], a: 0,
      why: '@include가 false면 필드는 실행되지 않고 키도 없다. 에러가 아니라 조건 값의 문제이니 variables부터 본다.' },
    { q: '대시보드 첫 화면을 빨리 그리려 무거운 lifetimeStats를 뒤로 미루고 싶다. 알맞은 방법은?',
      o: ['lifetimeStats에 alias를 붙인다', 'lifetimeStats를 ... on User @defer로 감싼다', 'lifetimeStats에 @skip(if: true)를 붙인다'], a: 1,
      why: '@defer는 감싼 필드를 다음 청크로 보낸다. @skip은 아예 빼 버리고, alias는 키 이름만 바꾼다.' },
    { q: 'adminStats에 @auth(requires: ADMIN)를 붙였는데 USER도 값을 받는다. 가장 먼저 의심할 것은?',
      o: ['Role enum에 ADMIN이 없다', 'alias 때문에 필드 이름이 바뀌었다', 'mapSchema로 감싼 스키마 대신 원래 스키마를 서버에 넘겼다'], a: 2,
      why: '부착만으로는 동작하지 않는다. 감싼 resolve가 들어간 새 schema를 서버에 써야 Forbidden이 던져진다.' },
  ];

  R.page({ title: '쿼리와 응답 모양', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
