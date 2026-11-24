/* II-1-1 Type System — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 응답 JSON·오류 문구는 graphql 16.15 (graphql-js) 로 코드 블록을 실제로 돌려 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, lbl, pill, banner, grow, dot, cross, check, kvTable } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미: GraphQL·JSON 글자 색칠, 타입 카드 ----------
  const KW = /^(type|input|enum|interface|union|implements|scalar|query|mutation|subscription|on|true|false|null)$/;
  function gtok(s) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b|!)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { fill: INFO, 'font-weight': 700 } : w === '!' ? { fill: BAD, 'font-weight': 800 } : {}]); }); buf = ''; };
    while (i < s.length) { const ch = s[i];
      if (ch === '#' || (ch === '/' && s[i + 1] === '/')) { flush(); out.push([s.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = s.indexOf('"', i + 1), end = e < 0 ? s.length : e + 1; out.push([s.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  // 여러 줄 코드·JSON. n: 보이는 줄 수(소수면 마지막 줄을 타이핑), o.hi(i) 줄 배경색, o.col(i) 줄 글자색, o.op(i) 줄 투명도
  function code(x, y, rows, n, o) { o = o || {}; const fs = o.fs || 14.5, lh = o.lh || fs + 8, N = n == null ? rows.length : n;
    rows.forEach((s, i) => { if (i >= Math.ceil(N - 1e-6)) return; const part = i === Math.ceil(N) - 1 && N % 1 ? s.slice(0, Math.round(s.length * (N % 1))) : s;
      const hc = o.hi && o.hi(i), op = o.op ? o.op(i) : 1;
      if (hc) el('rect', { x: x - 6, y: y + i * lh - fs + 1, width: o.w || tw(s, fs) + 12, height: lh - 2, rx: 4, fill: hc, opacity: op });
      const c = o.col && o.col(i); spans(x, y + i * lh, c ? [[part, { fill: c }]] : gtok(part), { 'font-size': fs, opacity: op }); }); }
  // 타입 카드: 머리 줄 + 필드 줄. o.n 보이는 줄 수, o.s 크기(가운데 기준), rows 는 문자열 또는 [문자열, {bg, c}]
  function tcard(x, y, w, head, rows, o) { o = o || {}; const rh = o.rh || 30, n = o.n ?? rows.length, h = 44 + rh * rows.length, s = o.s ?? 1;
    const at = { h, row: (i) => y + 42 + i * rh + rh / 2, x, y, w };
    if (s <= 0.01) return at;
    const g = el('g', { transform: `translate(${x + w / 2} ${y + h / 2}) scale(${s}) translate(${-w / 2} ${-h / 2})`, opacity: o.op ?? 1 });
    el('rect', { x: 0, y: 0, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.col || INK, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash }, g);
    spans(14, 26, gtok(head), { 'font-size': 15.5, 'font-weight': 700 }, g);
    el('line', { x1: 0, y1: 38, x2: w, y2: 38, stroke: GRID, 'stroke-width': 1.5 }, g);
    rows.forEach((r, i) => { const v = clamp(n - i); if (v <= 0) return; const [t, ro] = Array.isArray(r) ? r : [r, {}], yy = 42 + i * rh;
      if (ro.bg) el('rect', { x: 5, y: yy + 1, width: w - 10, height: rh - 3, rx: 5, fill: ro.bg, opacity: v }, g);
      spans(16, yy + rh / 2 + 5, ro.c ? [[t, { fill: ro.c }]] : gtok(t), { 'font-size': 14.5, opacity: v }, g); });
    return at; }
  // 굽은 선이 자라기 (u 0→1)
  const mk = (col) => (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)');
  function curve(x1, y1, x2, y2, u, col, bx, by, o) { if (u <= 0) return; o = o || {}; const mx = (x1 + x2) / 2 + (bx || 0), my = (y1 + y2) / 2 + (by || 0);
    el('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 1, 'stroke-dasharray': u < 1 ? `${u} 1` : o.dash, opacity: o.op ?? 1, 'marker-end': u > 0.98 ? mk(col) : null }); }
  const qpts = (x1, y1, x2, y2, bx, by) => { const mx = (x1 + x2) / 2 + (bx || 0), my = (y1 + y2) / 2 + (by || 0); return Array.from({ length: 13 }, (_, i) => { const t = i / 12; return [(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2]; }); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. Scalar 5종 ----------
  const SC = [['id: ID', 'ID', '"u_1234"', '직렬화는 String'], ['name: String', 'String', '"박호영"', 'UTF-8 문자열'], ['age: Int', 'Int', '42', '32-bit 정수'],
    ['height: Float', 'Float', '3.14', 'IEEE 754 double'], ['isPremium: Boolean', 'Boolean', 'true', 'true / false']];
  const QRY = ['query {', '  user(id: "1") {', '    id', '    name', '    age', '    height', '    isPremium', '  }', '}'];
  const RES = ['{ "data": {', '  "user": {', '    "id": "1",', '    "name": "박호영",', '    "age": 33,', '    "height": 175.4,', '    "isPremium": true', '  }', '} }'];
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { const shown = [2, 4, 5][k], from = [0, 2, 4][k];
      const tc = tcard(40, 56, 290, 'type User {', SC.map((r) => r[0]), { n: shown, rh: 36 });
      SC.forEach((r, i) => { if (i >= shown) return; const y = tc.row(i), a = i >= from ? E(u, 0.3 + (i - from) * 0.5, 0.9 + (i - from) * 0.5) : 1;
        grow(336, y, 410, y, a, MUT);
        if (a >= 1) { pill(462, y, r[1], i === 0 ? ACC : INK, i >= from ? pop(u, 0.9 + (i - from) * 0.5) : 1, { mono: true });
          mono(535, y + 5, r[2], { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: i >= from ? fade(u, 1.1 + (i - from) * 0.5) : 1 });
          tx(700, y + 5, r[3], { 'font-size': 13.5, fill: MUT, opacity: i >= from ? fade(u, 1.2 + (i - from) * 0.5) : 1 }); } });
      tx(40, 336, '기본 scalar', { 'font-size': 15, 'font-weight': 700 });
      SC.forEach((r, i) => { const on = i < shown, s = on && i >= from ? pop(u, 1.4 + (i - from) * 0.3) : 1;
        card(200 + i * 128, 330, 116, 40, { rx: 8, text: on ? r[1] : '', mono: true, fs: 15, stroke: on ? INK : GRID, dash: on ? null : '5 5', fill: on ? (i === 0 ? ACCBG : PANEL) : SOFT, color: i === 0 ? ACC : INK, s: on ? s : 1 }); });
      mono(900, 336, `${shown} / 5`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', fill: shown === 5 ? GOOD : INK, opacity: 1 });
      if (k === 2) banner(480, 395, '다른 모든 타입은 이 다섯 개의 조합이다', pop(u, 2.2));
      return; }
    if (k === 3) { tx(60, 40, '요청 (쿼리)', { 'font-size': 15, 'font-weight': 700, fill: MUT }); tx(540, 40, '응답 (JSON)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const lh = 31, n = E(u, 0.2, 2.0) * QRY.length;
      code(60, 78, QRY, n, { lh, fs: 15 }); code(540, 78, RES, Math.max(0, n - 0.6), { lh, fs: 15 });
      for (let i = 2; i <= 6; i++) { const a = clamp(n - 0.6 - i); if (a <= 0) continue; const y = 78 + i * lh - 5;
        curve(70 + tw(QRY[i], 15), y, 530, y, a, ACC, 0, 0, { dash: '4 5', sw: 1.8 }); }
      banner(480, 385, '요청한 필드 이름이 응답 키가 된다', pop(u, 2.2)); return; }
    // k4: ID 와 캐시 키
    tx(60, 46, '응답 조각', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    code(60, 84, ['{ "__typename": "User",', '  "id": "1",', '  "name": "박호영" }'], E(u, 0.1, 0.7) * 3, { lh: 30, fs: 15, hi: (i) => (i <= 1 && u > 0.9 ? ACCBG : null) });
    grow(330, 115, 450, 115, E(u, 0.9, 1.3), ACC);
    pill(510, 115, 'User:1', ACC, pop(u, 1.3), { mono: true, fs: 16 });
    kvTable(600, 60, 320, [['User:1', '{ name: "박호영", … }', { hot: u > 1.8, op: fade(u, 1.6) }]], { title: 'Apollo InMemoryCache', kw: 105 });
    sub(760, 148, '__typename + id 로 만든 키', fade(u, 2.0), { 'font-size': 14 });
    note(60, 250, 'ID 는 숫자 1 을 받아도 "1" 로 직렬화한다', fade(u, 1.9));
    note(60, 282, '값은 String 과 같고, 이름이 "유일 식별자" 라는 뜻을 전한다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 });
    banner(480, 370, '같은 id 를 가진 응답은 캐시에서 한 객체로 합쳐진다', pop(u, 2.4)); }

  // ---------- 2. Object Type — 타입 그래프 ----------
  function s2(t, c) { const { k, u } = c, dim = 1;
    if (k === 4) return s2deep(t, c);
    const pf = tcard(610, 26, 280, 'type Profile {', ['bio: String', 'avatarUrl: String'], { s: k === 0 ? pop(u, 0.2) : 1, n: k === 0 ? E(u, 0.5, 1.4) * 2 : 2, op: dim });
    if (k === 0) { note(610, 200, 'scalar 두 개만 가진 가장 단순한 object', fade(u, 1.6)); return; }
    const us = tcard(50, 120, 290, 'type User {', ['id: ID', 'name: String', ['profile: Profile', { bg: k === 1 ? ACCBG : null }], ['posts: [Post]', { bg: k === 2 ? ACCBG : null }]], { s: k === 1 ? pop(u, 0.2) : 1, n: k === 1 ? E(u, 0.4, 1.3) * 4 : 4, op: dim });
    const pe = (k >= 2) ? tcard(610, 222, 280, 'type Post {', ['id: ID', 'title: String', ['author: User', { bg: k === 2 ? ACCBG : null }]], { s: k === 2 ? pop(u, 0.2) : 1, op: dim }) : null;
    const e1 = k === 1 ? E(u, 1.3, 2.1) : 1;
    curve(345, us.row(2), 604, 60, e1, ACC, -40, 10, { op: dim }); if (e1 >= 1) tx(470, 72, 'profile', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: dim });
    if (k === 1) return;
    const e2 = k === 2 ? E(u, 0.8, 1.5) : 1, e3 = k === 2 ? E(u, 1.5, 2.3) : 1;
    curve(345, us.row(3), 604, 250, e2, ACC, -30, 12, { op: dim }); if (e2 >= 1) tx(468, 254, 'posts', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: dim });
    curve(604, pe.row(2), 345, 262, e3, WARN, -20, 70, { op: dim }); if (e3 >= 1) tx(440, 360, 'author (순환)', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: dim });
    if (k === 2) return;
    if (k === 3) { const loop = qpts(345, us.row(3), 604, 250, -30, 12).concat(qpts(604, pe.row(2), 345, 262, -20, 70));
      dot(loop, (t * 0.45) % 1, ACC, 7); dot(qpts(345, us.row(2), 604, 60, -40, 10), (t * 0.45 + 0.5) % 1, ACC, 7);
      banner(480, 395, 'REST 라면 엔드포인트 여러 개, 여기서는 그래프 하나', pop(u, 1.0)); return; }
  }
  // k4: 클라이언트가 정하는 깊이
  function s2deep(t, c) { const { u } = c;
    const lv = [['user(id:"1")', 1], ['posts', 2], ['author', 3], ['posts', 4], ['author', 5], ['name', 6]];
    lv.forEach(([s, d], i) => { const a = pop(u, 0.4 + i * 0.25); if (a <= 0) return; const x = 70 + i * 140, y = 70 + i * 46, extra = i >= 3;
      if (i > 0) grow(70 + (i - 1) * 140 + 58, 70 + (i - 1) * 46 + 16, x - 8, y - 4, clamp(a), extra ? BAD : MUT, { plain: true, dash: extra ? '5 5' : null });
      card(x + 50, y, 116, 34, { rx: 8, text: s, mono: true, fs: 14, stroke: extra ? BAD : INK, dash: extra ? '5 5' : null, color: extra ? BAD : INK, s: a });
      mono(x + 50, y - 24, `깊이 ${d}`, { 'font-size': 13.5, fill: extra ? BAD : MUT, 'text-anchor': 'middle', opacity: clamp(a) }); });
    note(560, 60, '코드의 쿼리: user › posts › author › name', fade(u, 0.2), { fill: MUT, 'font-size': 14 });
    note(60, 372, 'validate() 오류 0개 — 깊이 6도 문법상 통과한다', fade(u, 2.0), { fill: BAD });
    sub(760, 372, '서버가 depth/complexity 제한을 따로 건다', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 3. List 4종 × 반환값 4종 ----------
  const LT = ['[Post]', '[Post!]', '[Post]!', '[Post!]!'], LV = ['null', '[null]', '[]', '[p]'];
  // graphql-js 실행 결과: 1 = 그대로 통과, 'f' = 필드가 null + 오류, 'p' = 부모로 null 이 번짐
  const OK = [[1, 1, 1, 1], [1, 'f', 1, 1], ['p', 1, 1, 1], ['p', 'p', 1, 1]];
  function matrix(t, c, rowHi, colHi) { const { k, u } = c, x0 = 270, cw = 150, y0 = 82, rh = 50;
    tx(x0 - 20, 46, '선언 \\ resolver 가 돌려준 값', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
    LV.forEach((v, j) => { mono(x0 + j * cw + cw / 2, 52, v, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: colHi === j ? GOOD : INK }); });
    if (colHi != null) el('rect', { x: x0 + colHi * cw + 6, y: y0 - 4, width: cw - 12, height: rh * 4 + 4, rx: 8, fill: GOODBG, opacity: fade(u, 0.3) });
    LT.forEach((s, i) => { const y = y0 + i * rh;
      if (rowHi && rowHi[i]) el('rect', { x: 60, y: y, width: x0 + 4 * cw - 54, height: rh - 6, rx: 8, fill: rowHi[i], opacity: k === 1 || k === 4 ? fade(u, 0.3) : 1 });
      mono(x0 - 20, y + rh / 2 + 3, s, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end' });
      LV.forEach((v, j) => { const r = OK[i][j], a = k === 0 ? pop(u, 0.2 + (i * 4 + j) * 0.11, 0.5) : 1, cx = x0 + j * cw + cw / 2, cy = y + rh / 2 - 4;
        if (r === 1) check(cx, cy, 10, a); else { cross(cx - 34, cy + 1, 8, a); mono(cx + 10, cy + 6, r === 'f' ? '→ null' : '→ 부모로', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: clamp(a) }); } }); });
    return y0 + 4 * rh; }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const yb = matrix(t, c);
      note(60, yb + 34, '✗ 는 "Cannot return null for non-nullable field" 오류', fade(u, 2.1), { fill: BAD, 'font-weight': 600 });
      sub(480, yb + 66, 'graphql-js 로 16칸을 모두 실행한 결과', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 1) { const yb = matrix(t, c, [null, null, null, ACCBG]);
      code(80, yb + 40, ['type User {  posts: [Post!]!   tags: [String!]!  }'], E(u, 0.6, 1.8), { fs: 16 });
      sub(480, yb + 78, '목록도 요소도 null 이 아니다 — 실무 기본값', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2) { const yb = matrix(t, c, [BADBG, null, null, ACCBG]);
      tx(80, yb + 32, '[Post!]!', { 'font-size': 14, 'font-weight': 800, fill: ACC, class: 'mono', opacity: fade(u, 0.4) });
      code(170, yb + 32, ['posts.map((p) => p.title)'], E(u, 0.4, 1.0), { fs: 15 });
      mono(900, yb + 32, '검사 0번', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.1) });
      tx(80, yb + 68, '[Post]', { 'font-size': 14, 'font-weight': 800, fill: BAD, class: 'mono', opacity: fade(u, 1.3) });
      code(170, yb + 68, ['if (posts) posts.filter((p) => p).map(…)'], E(u, 1.3, 2.1), { fs: 15 });
      mono(900, yb + 68, '검사 2번', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.2) }); return; }
    if (k === 3) { const yb = matrix(t, c, null, 2);
      note(60, yb + 40, '[] 는 네 선언 모두 통과한다', fade(u, 0.8), { fill: GOOD });
      sub(480, yb + 74, '"결과 없음" 은 null 이 아니라 빈 배열로 돌려준다', fade(u, 1.5), { 'font-size': 15 }); return; }
    const yb = matrix(t, c, [null, WARNBG, null, ACCBG]);
    pill(170, yb + 42, '기본값 [T!]!', ACC, pop(u, 0.6), { fs: 15 });
    pill(450, yb + 42, '없을 수 있는 검색 결과 [T!]', WARN, pop(u, 1.1), { fs: 15 });
    sub(780, yb + 47, '나머지 두 형태는 의도가 있을 때만', fade(u, 1.7), { 'font-size': 14 }); }

  // ---------- 4. Non-null 과 null bubbling ----------
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { const rows = [['id: ID!', { bg: k === 0 ? ACCBG : null }], ['name: String!', { bg: k === 0 ? ACCBG : null }], ['email: String', { bg: k === 1 ? INFOBG : null }], ['bio: String', { bg: k === 1 ? INFOBG : null }]];
      tcard(60, 70, 300, 'type User {', rows, { n: k === 0 ? E(u, 0.2, 1.0) * 2 : 2 + E(u, 0.2, 1.0) * 2 });
      tx(520, 70, '응답이 지키는 약속', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const J = ['"user": {', '  "id": "1",', '  "name": "박호영",', '  "email": null,', '  "bio": null', '}'];
      code(520, 110, J, k === 0 ? E(u, 0.8, 1.8) * 3 : 3 + E(u, 0.8, 1.8) * 3, { lh: 30, fs: 15, hi: (i) => (i === 1 || i === 2 ? ACCBG : (i === 3 || i === 4) && k === 1 ? INFOBG : null) });
      if (k === 0) note(60, 330, '! = 응답에서 절대 빠지지 않는다', fade(u, 2.0), { fill: ACC });
      else note(60, 330, 'nullable = "없을 수 있다" 를 정직하게 적은 것', fade(u, 2.0), { fill: INFO });
      return; }
    if (k === 2) { tx(60, 40, 'resolver 실행 중', { 'font-size': 15, 'font-weight': 700, fill: MUT }); tx(540, 40, '실제 응답 (graphql-js)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const fail = u > 0.6, up = E(u, 0.9, 1.5);
      code(60, 80, ['{ "data": {', '  "user": {      # User (nullable)', '    "id": "1",', '    "name": throw!  # String!', '    "email": null', '  }', '} }'], 7, { lh: 32, fs: 15,
        hi: (i) => (i === 3 && fail ? BADBG : i >= 1 && i <= 5 && up >= 1 ? BADBG : null), col: (i) => (i === 3 && fail ? BAD : null) });
      if (fail) cross(372, 172, 9, pop(u, 0.6));
      if (up > 0) { grow(400, 172, 400, 120, up, BAD); }
      code(540, 80, ['{ "errors": [{', '    "message": "name 조회 실패",', '    "path": ["user", "name"]', '  }],', '  "data": { "user": null }', '}'], E(u, 1.5, 2.4) * 6, { lh: 32, fs: 15, hi: (i) => (i === 4 ? BADBG : i === 2 ? WARNBG : null) });
      note(60, 360, 'name 은 null 이 될 수 없어 한 칸 위 user 가 대신 null 이 된다', fade(u, 2.2), { fill: BAD });
      sub(480, 395, 'user 마저 User! 였다면 data 전체가 null (실행 확인)', fade(u, 2.5), { 'font-size': 14 }); return; }
    if (k === 3) { tx(480, 52, '! 는 되돌리기 어렵다 — 보수적으로 붙인다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      [['ID 와 식별성이 강한 필드만 !', 'id: ID!'], ['DB 컬럼이 NOT NULL 인 것만 !', 'name: String!'], ['새 필드는 nullable 로 연다', 'nickname: String'], ['깊은 트리일수록 ! 를 아낀다', 'posts { author { … } }']].forEach(([a, b], i) => {
        const y = 108 + i * 68, s = pop(u, 0.3 + i * 0.4); card(480, y, 640, 54, { rx: 10, stroke: i === 2 ? GOOD : GRID, sw: 2, s });
        check(190, y, 10, s); tx(216, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) });
        mono(780, y + 5, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.4) }); }); return; }
    // k4: schema check
    tx(60, 46, 'findBreakingChanges (graphql-js) 로 비교', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const r1 = pop(u, 0.3), r2 = pop(u, 1.3);
    card(480, 120, 840, 76, { rx: 10, stroke: BAD, sw: 2, s: r1 });
    code(80, 112, ['email: String!  →  email: String'], r1 >= 0.5 ? 1 : 0, { fs: 16 });
    mono(80, 140, 'User.email changed type from String! to String.', { 'font-size': 14, fill: BAD, opacity: fade(u, 0.8) });
    pill(820, 120, 'breaking', BAD, pop(u, 0.9), { fs: 15 });
    card(480, 230, 840, 76, { rx: 10, stroke: GOOD, sw: 2, s: r2 });
    code(80, 222, ['email: String   →  email: String!'], r2 >= 0.5 ? 1 : 0, { fs: 16 });
    mono(80, 250, 'breaking 0건 — 출력에 ! 를 더하는 건 통과', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.8) });
    pill(820, 230, '통과', GOOD, pop(u, 1.9), { fs: 15 });
    note(60, 330, '! 를 빼는 쪽이 클라이언트를 깨뜨린다', fade(u, 2.2), { fill: BAD });
    sub(480, 370, '그래서 nullable 로 시작하고, 확신이 생기면 ! 를 더한다', fade(u, 2.5), { 'font-size': 15 }); }

  // ---------- 5. Custom Scalar ----------
  function s5(t, c) { const { k, u } = c, bs = k === 0 ? pop(u, 0.2) : 1;
    if (k <= 2) { const B = { x: 480, y: 200 };
      card(B.x, B.y, 230, 78, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: bs });
      if (bs > 0.5) { mono(B.x, B.y - 6, 'scalar DateTime', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); tx(B.x, B.y + 20, 'ISO 8601 형식 시간 문자열', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
      ['serialize', 'parseValue', 'parseLiteral'].forEach((s, i) => { const on = (i === 0 && k >= 1) || (i > 0 && k >= 2); mono(B.x - 100 + i * 100, B.y + 62, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? ACC : OFF, opacity: fade(u, k === 0 ? 0.8 + i * 0.3 : 0) }); });
      if (k === 0) { note(480, 330, '이름 + 변환 함수 3개 = custom scalar', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
      // 나가는 길: resolver → serialize → JSON
      const o = k === 1 ? E(u, 0.3, 1.2) : 1, o2 = k === 1 ? E(u, 1.2, 2.0) : 1;
      tx(70, 76, 'resolver 가 돌려준 값', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      pill(140, 110, 'new Date(…)', INK, k === 1 ? pop(u, 0.2) : 1, { mono: true, fs: 14 });
      curve(220, 110, B.x - 60, B.y - 40, o, MUT, 0, -30);
      curve(B.x + 60, B.y - 40, 680, 110, o2, ACC, 0, -30);
      tx(690, 76, '응답 JSON', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: o2 });
      mono(690, 115, '"2026-05-19T10:00:00.000Z"', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: o2 >= 1 ? 1 : 0 });
      if (k === 1) { note(480, 340, 'serialize 는 서버 → 클라이언트 방향에서만 불린다', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
      // 들어오는 길 두 개
      const v = E(u, 0.2, 1.0), l = E(u, 0.9, 1.7);
      tx(40, 268, 'variables', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: v }); mono(40, 292, '{ "t": "2026-05-19T10:00:00Z" }', { 'font-size': 14, opacity: v });
      curve(282, 286, B.x - 122, B.y + 8, v, INFO, -20, 10);
      tx(40, 336, '쿼리에 직접', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: l }); mono(40, 360, 'posts(after: "2026-…")', { 'font-size': 14, opacity: l });
      curve(252, 352, B.x - 122, B.y + 26, l, INFO, 30, 20);
      pill(800, 240, 'JS Date', GOOD, pop(u, 1.6), { mono: true, fs: 14 }); grow(B.x + 118, B.y + 30, 740, 240, E(u, 1.4, 1.8), GOOD);
      const bad = fade(u, 2.0);
      mono(560, 330, 'posts(after: 123)', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: bad }); cross(740, 325, 8, pop(u, 2.0));
      mono(560, 362, 'Expected value of type "DateTime", found 123; …', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { const a = pop(u, 0.2), b = pop(u, 0.7);
      card(220, 110, 300, 92, { rx: 10, stroke: INK, sw: 2, s: a }); if (a > 0.5) { tx(90, 88, 'typeDefs', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); code(90, 120, ['scalar DateTime'], 1, { fs: 16 }); code(90, 146, ['type Post { createdAt: DateTime! }'], 1, { fs: 13.5 }); }
      card(220, 260, 300, 70, { rx: 10, stroke: INK, sw: 2, s: b }); if (b > 0.5) { tx(90, 246, 'resolvers', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); code(90, 276, ['{ DateTime, Post: { … } }'], 1, { fs: 15 }); }
      grow(376, 110, 560, 180, E(u, 1.1, 1.5), ACC); grow(376, 260, 560, 200, E(u, 1.1, 1.5), ACC);
      card(660, 190, 190, 60, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.5, text: '실행 스키마', fs: 16, color: ACC, s: pop(u, 1.5) });
      mono(60, 370, '선언이 없으면 → Unknown type "DateTime".', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.9) });
      mono(60, 400, '등록이 없으면 → 오류 없이 123 도 그대로 통과', { 'font-size': 14, fill: WARN, opacity: fade(u, 2.3) }); return; }
    tx(480, 56, 'npm i graphql-scalars', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, class: 'mono' });
    [['DateTime', '"2026-05-19T10:00:00.000Z"'], ['EmailAddress', '"sh@dfocus.net"'], ['URL', '"https://…"'], ['JSON', '{ "foo": [1, 2] }'], ['BigInt', '9007199254740993'], ['UUID', '"…-…-…"']].forEach(([n, ex], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = 270 + col * 420, y = 120 + row * 82, s = pop(u, 0.3 + i * 0.25);
      card(x, y, 380, 62, { rx: 10, stroke: i === 0 ? ACC : GRID, sw: 2, s });
      mono(x - 172, y - 4, n, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4 + i * 0.25) });
      mono(x - 172, y + 20, ex, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.25) }); });
    banner(480, 380, '흔한 타입은 이미 있다 — 직접 만드는 건 정말 특별한 것만', pop(u, 2.2)); }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: 'query { user { id name } }를 보냈을 때 응답 JSON의 모양은 무엇인가?',
      o: ['서버가 정한 User 전체 필드가 온다', 'data.user 아래에 id와 name 키만 온다', 'id와 name이 배열로 나란히 온다'], a: 1,
      why: 'GraphQL 응답은 쿼리 모양을 그대로 닮는다. 요청한 필드 이름이 응답 키가 되고, 적지 않은 필드는 오지 않는다.' },
    { q: 'User.posts가 Post를, Post.author가 다시 User를 가리킬 때 일어나는 일은 무엇인가?',
      o: ['스키마 빌드가 순환 참조 오류로 실패한다', '정상이며, 얼마나 깊이 들어갈지는 클라이언트 쿼리가 정한다', '서버가 깊이 2에서 자동으로 끊는다'], a: 1,
      why: '순환은 정상이고 validate()도 깊이 6 쿼리를 오류 없이 통과시킨다. 그래서 깊이·복잡도 제한은 서버가 따로 건다.' },
    { q: 'posts: [Post!]! 필드의 resolver가 빈 배열 []을 돌려주면 어떻게 되는가?',
      o: ['그대로 []가 응답에 실린다', 'non-null 위반 오류가 난다', 'posts 대신 null이 실린다'], a: 0,
      why: '[T!]!는 목록과 요소가 null이 아님만 보장한다. 길이 0은 네 가지 선언 모두에서 통과한다.' },
    { q: 'name: String! 의 resolver가 에러를 던지고 user: User는 nullable이다. 응답의 data는 무엇인가?',
      o: ['{ user: { id, name: null } }', '{ user: null }이고 errors에 path ["user","name"]', 'data 전체가 null'], a: 1,
      why: 'name은 null이 될 수 없어 한 칸 위 user가 null이 되고 오류는 errors 배열에 담긴다. user도 User!였다면 data 전체가 null이다.' },
    { q: '쿼리 문서에 posts(after: "2026-05-19T10:00:00Z")처럼 값을 직접 적으면 DateTime의 어느 함수가 받는가?',
      o: ['serialize', 'parseValue', 'parseLiteral'], a: 2,
      why: '문서 안 값은 AST로 들어와 parseLiteral이 받고, variables로 오면 parseValue가 받는다. serialize는 응답으로 나갈 때만 불린다.' },
  ];

  const summary = [
    '응답 JSON은 쿼리 모양을 그대로 따른다. 요청한 필드 이름이 응답 키가 된다.',
    'object 필드가 다른 object를 가리키면 타입이 그래프가 되고 순환도 허용된다.',
    '목록은 대부분 [T!]!로 적는다. 빈 배열은 어느 선언에서도 통과한다.',
    'non-null 필드가 실패하면 null이 nullable 부모까지 올라가고 오류는 errors에 남는다.',
  ];
  const review = [
    { q: '목록 화면이 가끔 통째로 비고 errors에 "Cannot return null for non-nullable field"가 찍힌다. 먼저 볼 곳은?',
      o: ['요소 하나가 null인데 선언이 [Post!]! 인 필드', 'Apollo Client 캐시 크기', '쿼리에 operation 이름이 없는 것'], a: 0,
      why: '요소 null은 [Post!]에서 목록을 null로 만들고, 목록까지 !면 부모로 번진다. 선언과 실제 데이터가 어긋난 자리부터 본다.' },
    { q: '운영 중인 스키마에서 email: String! 을 email: String으로 바꾸려 한다. 검사기는 무엇이라 하나?',
      o: ['바꿔도 안전하다고 통과시킨다', 'breaking으로 잡는다', '타입 이름이 같아 비교하지 않는다'], a: 1,
      why: '출력 필드에서 !를 빼면 null을 받을 준비가 없던 클라이언트가 깨진다. 반대로 !를 더하는 쪽은 검사를 통과한다.' },
    { q: 'DateTime scalar를 typeDefs에만 적고 resolvers에 넣지 않았다. posts(after: 123)을 보내면?',
      o: ['Unknown type 오류로 서버가 뜨지 않는다', 'parseLiteral 오류로 요청이 거절된다', '오류 없이 숫자 123이 resolver에 그대로 들어온다'], a: 2,
      why: '등록이 없으면 변환 함수가 없어 값이 그대로 지나간다. 선언 자체가 없을 때만 Unknown type 오류가 난다.' },
  ];

  R.page({ title: '타입 시스템 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
