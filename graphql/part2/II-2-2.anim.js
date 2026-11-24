/* II-2-2 Input / Enum / Interface / Union — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 응답 JSON·스키마 검사 결과·오류 문구는 graphql 16.15 (graphql-js, @graphql-tools/schema) 로 코드 블록을 실제로 돌려 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, zone, cells } = R;
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

  // ---------- 1. Input ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { const rows = ['updateUserBad(', '  id: ID!,', '  name: String,', '  email: String,', '  bio: String,', '  timezone: String,', '): User!'];
      const shown = k === 0 ? E(u, 0.2, 1.2) * 4 : 6;
      const vis = k === 0 ? rows.slice(0, 4).concat([rows[6]]) : rows;
      code(50, 70, vis, k === 0 ? (shown >= 4 ? 5 : shown) : 7, { fs: 15, lh: 30, hi: (i) => (k === 1 && (i === 4 || i === 5) && u > 0.4 ? WARNBG : null) });
      tx(470, 46, '클라이언트 쿼리 문서', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      const doc = k === 0 ? ['mutation($id: ID!, $name: String,', '         $email: String) {', '  updateUserBad(id: $id, name: $name,', '                email: $email) { id }', '}']
        : ['mutation($id: ID!, $name: String,', '         $email: String, $bio: String,', '         $timezone: String) {', '  updateUserBad(id: $id, name: $name,', '    email: $email, bio: $bio,', '    timezone: $timezone) { id }', '}'];
      code(470, 86, doc, k === 0 ? E(u, 0.8, 1.8) * doc.length : doc.length, { fs: 14, lh: 26, hi: (i) => (k === 1 && [1, 2, 4, 5].includes(i) && u > 1.0 ? WARNBG : null) });
      if (k === 0) { note(50, 330, '인자를 시그니처에 그대로 늘어놓은 모양', fade(u, 2.0)); return; }
      zone(50, 300, 860, 100, 'findBreakingChanges / findDangerousChanges (graphql-js)', { op: fade(u, 1.6) });
      mono(70, 350, 'breaking 0건 · dangerous 2건 (OPTIONAL_ARG_ADDED bio, timezone)', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
      mono(70, 380, '기존 요청은 안 깨진다. 새 값을 보내는 쪽은 문서를 고쳐야 한다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { const flds = ['name', 'email', 'bio', 'timezone'];
      code(50, 70, ['updateUserBad(id, name, email,', '              bio, timezone)'], 2, { fs: 15, lh: 28, op: () => 1 - 0.6 * E(u, 1.4, 2.0) });
      const ic = tcard(520, 60, 340, 'input UpdateUserInput {', flds.map((f) => f + ': String'), { n: E(u, 0.9, 1.9) * 4, col: ACC });
      flds.forEach((f, i) => fly(150 + i * 60, 140, 640, ic.row(i), seg(u, 0.3 + i * 0.2, 1.0 + i * 0.2), f, { mono: true }));
      note(50, 330, 'input 키워드 = 쓰기 전용 모양을 따로 정의한다', fade(u, 2.1));
      sub(480, 370, '인자 4개 → 타입 1개', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 3) { code(50, 70, ['updateUser(id: ID!, input: UpdateUserInput!): User!'], E(u, 0.1, 0.8), { fs: 15.5, hi: () => ACCBG });
      tx(50, 128, '클라이언트 문서 (고정)', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      code(50, 160, ['mutation($input: UpdateUserInput!) {', '  updateUser(id: "1", input: $input) { id name }', '}'], 3, { fs: 14.5, lh: 26 });
      tx(560, 250, 'variables 만 바뀐다', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      const addBio = u > 1.2;
      code(560, 284, [addBio ? '{ "input": { "name": "호영", "bio": "hi" } }' : '{ "input": { "name": "호영" } }'], 1, { fs: 14.5, hi: () => (addBio ? GOODBG : null) });
      if (addBio) pill(700, 330, 'bio 추가 — 문서 그대로', GOOD, pop(u, 1.2), { fs: 14 });
      mono(50, 380, 'resolver 가 받은 args: {"id":"1","input":{"name":"호영","bio":"hi"}}', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { tx(480, 52, 'input 으로 묶으면 따라오는 것', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      [['필드를 더해도 mutation 시그니처 그대로', 'updateUser(id, input)'], ['input 필드에 기본값·@deprecated', 'name: String = "…"'], ['variables 한 덩어리', '$input: UpdateUserInput!'], ['여러 mutation 이 같은 input 공유', 'create / update']].forEach(([a, b], i) => {
        const y = 108 + i * 68, s = pop(u, 0.3 + i * 0.4); card(480, y, 700, 54, { rx: 10, stroke: GOOD, sw: 2, s }); check(160, y, 10, s);
        tx(186, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) }); mono(810, y + 5, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.4) }); }); return; }
    // k5: 두 트리는 섞이지 않는다
    lbl(230, 50, '출력 타입 (type)', 1, { fill: INK }); lbl(730, 50, '입력 타입 (input)', 1, { fill: ACC });
    el('line', { x1: 480, y1: 40, x2: 480, y2: 270, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '8 6', opacity: fade(u, 0.3) });
    ['User', 'Post', 'Comment'].forEach((s, i) => card(230, 100 + i * 56, 160, 40, { rx: 8, text: s, mono: true, fs: 15, s: pop(u, 0.2 + i * 0.15) }));
    ['UpdateUserInput', 'CreatePostInput', 'OrderItemInput'].forEach((s, i) => card(730, 100 + i * 56, 200, 40, { rx: 8, text: s, mono: true, fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.4 + i * 0.15) }));
    fly(310, 100, 470, 150, seg(u, 1.0, 1.6), 'User', { mono: true, fill: BAD, stay: u < 1.7 });
    if (u > 1.6) cross(480, 150, 12, pop(u, 1.6));
    mono(60, 310, 'input X { user: User }', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) });
    mono(60, 338, '→ The type of X.user must be Input Type but got: User.', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) });
    mono(60, 372, 'type Query { a: UpdateUserInput }', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.2) });
    mono(60, 400, '→ The type of Query.a must be Output Type but got: UpdateUserInput.', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.4) }); }

  // ---------- 2. Enum ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { code(60, 70, ['enum Role {'], 1, { fs: 16 });
      ['ADMIN', 'USER', 'GUEST'].forEach((s, i) => card(200 + i * 200, 150, 170, 56, { rx: 10, text: s, mono: true, fs: 18, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.4 + i * 0.3) }));
      code(60, 230, ['}'], 1, { fs: 16 });
      note(60, 300, '이 세 값 말고는 스키마를 통과하지 못한다', fade(u, 1.8));
      sub(480, 350, 'enum 값은 문자열이 아니라 식별자다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1) { const st = [['PENDING', 120], ['PAID', 330], ['SHIPPED', 540], ['DELIVERED', 770]];
      st.forEach(([s, x], i) => { const a = pop(u, 0.2 + i * 0.3); card(x, 120, 170, 50, { rx: 25, text: s, mono: true, fs: 16, stroke: ACC, color: ACC, s: a }); if (i) grow(st[i - 1][1] + 88, 120, x - 90, 120, E(u, 0.3 + i * 0.3, 0.6 + i * 0.3), ACC); });
      card(330, 230, 190, 50, { rx: 25, text: 'CANCELLED', mono: true, fs: 16, stroke: MUT, color: MUT, s: pop(u, 1.4) }); grow(160, 145, 240, 225, E(u, 1.3, 1.6), MUT);
      fly(820, 330, 600, 215, seg(u, 1.7, 2.3), '"SHIPED"', { mono: true, fill: BAD, stay: true });
      if (u > 2.3) cross(680, 215, 10, pop(u, 2.3));
      note(60, 360, 'String 이었다면 오타가 런타임까지 간다 — enum 이면 요청 단계에서 막힌다', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 2) { const m = E(u, 0.5, 1.2);
      const tc = tcard(60, 70, 330, 'type User {', ['id: ID!', 'name: String!', ['role: ' + (m > 0.5 ? 'Role!' : 'String!'), { bg: m > 0.5 ? ACCBG : WARNBG }]]);
      grow(396, tc.row(2), 520, tc.row(2), E(u, 1.2, 1.6), ACC);
      ['"ADMIN"', '"USER"', '"GUEST"'].forEach((s, i) => pill(600 + i * 110, tc.row(2), s, ACC, pop(u, 1.5 + i * 0.2), { mono: true, fs: 14 }));
      note(60, 330, '응답의 role 도 세 값 중 하나로 보장된다', fade(u, 2.0));
      sub(480, 370, '입력(인자)과 출력(필드) 어디에나 쓸 수 있다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 3) { tx(60, 46, '쿼리 문법', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 }); tx(520, 46, '응답 JSON', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      code(60, 84, ['users(role: ADMIN) { id name role }'], E(u, 0.1, 0.7), { fs: 15 });
      code(520, 84, ['{ "id": "1", "name": "박호영",', '  "role": "ADMIN" }'], E(u, 0.7, 1.3) * 2, { fs: 15, lh: 26, hi: (i) => (i === 1 ? ACCBG : null) });
      sub(300, 120, '따옴표 없음 = 식별자', fade(u, 0.7), { 'font-size': 14 }); sub(700, 150, 'JSON 에서는 문자열', fade(u, 1.3), { 'font-size': 14 });
      [['users(role: "ADMIN")', 'Enum "Role" cannot represent non-enum value: "ADMIN".', 1.4], ['users(role: ADMNI)', 'Value "ADMNI" does not exist in "Role" enum.', 2.0]].forEach(([q, m, a], i) => {
        const y = 220 + i * 76; cross(70, y - 5, 8, pop(u, a)); mono(92, y, q, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) });
        mono(92, y + 28, m + ' Did you mean the enum value "ADMIN"?', { 'font-size': 13.5, fill: BAD, opacity: fade(u, a + 0.2) }); }); return; }
    if (k === 4) { tx(60, 46, 'DB 에 저장된 값', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      cells(60, 70, ['0', '1', '2'], { w: 70, h: 50 });
      card(480, 95, 280, 60, { rx: 10, stroke: ACC, sw: 2.5, s: pop(u, 0.4) }); if (u > 0.6) { mono(480, 90, 'RoleMap[p.role]', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC }); mono(480, 114, '{ 0: "ADMIN", 1: "USER", 2: "GUEST" }', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
      grow(280, 95, 336, 95, E(u, 0.6, 1.0), MUT); grow(624, 95, 700, 95, E(u, 1.0, 1.4), ACC);
      cells(710, 70, ['ADMIN', 'USER', 'GUEST'].map((s, i) => (u > 1.4 + i * 0.15 ? s : '')), { w: 76, h: 50, fs: 13.5, style: () => ({ stroke: ACC, color: ACC }) });
      zone(60, 220, 840, 110, '변환을 빼먹으면 (resolver 가 0 을 그대로 돌려줄 때)', { op: fade(u, 1.7) });
      mono(80, 280, 'Enum "Role" cannot represent value: 0', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      mono(80, 310, 'path: ["users", 0, "role"]  ·  Role! 이라 data 까지 null', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) });
      sub(480, 380, '저장 형식과 스키마 값이 달라도 된다 — 바꾸는 건 resolver 의 일', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    // k5: 진화 규칙
    code(60, 60, ['enum Role { ADMIN USER GUEST }'], 1, { fs: 16 });
    const a = pop(u, 0.3), b = pop(u, 1.3);
    card(480, 150, 840, 84, { rx: 10, stroke: WARN, sw: 2, s: a });
    if (a > 0.6) { mono(80, 140, '+ OWNER', { 'font-size': 16, 'font-weight': 800, fill: WARN }); mono(80, 168, 'VALUE_ADDED_TO_ENUM · "OWNER was added to enum type Role."', { 'font-size': 14, fill: MUT }); pill(830, 150, 'dangerous', WARN, pop(u, 0.8), { fs: 14 }); }
    card(480, 262, 840, 84, { rx: 10, stroke: BAD, sw: 2, s: b });
    if (b > 0.6) { mono(80, 252, '− GUEST', { 'font-size': 16, 'font-weight': 800, fill: BAD }); mono(80, 280, 'VALUE_REMOVED_FROM_ENUM · "GUEST was removed from enum type Role."', { 'font-size': 14, fill: MUT }); pill(830, 262, 'breaking', BAD, pop(u, 1.8), { fs: 14 }); }
    note(60, 380, '추가는 클라이언트 switch 에 default 를 두고, 제거는 @deprecated 로 천천히', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 3. Interface ----------
  function nodeTpl(op) { card(480, 62, 240, 70, { rx: 12, stroke: ACC, sw: 2.5, dash: '7 5', fill: ACCBG, op }); mono(480, 56, 'interface Node', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: op }); mono(480, 82, 'id: ID!', { 'font-size': 15, 'text-anchor': 'middle', fill: INK, opacity: op }); }
  function impl(x, name, rows, a, col) { const tc = tcard(x, 150, 270, 'type ' + name + ' implements Node {', rows, { s: a, col: col || INK, rh: 28 }); return tc; }
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { nodeTpl(k === 0 ? fade(u, 0.2) : 1);
      if (k === 0) { note(480, 200, '데이터는 없다 — "id 는 반드시 있어야 한다" 는 약속', fade(u, 1.0), { 'text-anchor': 'middle' }); sub(480, 240, '이 계약을 따르는 타입은 모두 Node 로 다룰 수 있다', fade(u, 1.8), { 'font-size': 15 }); return; }
      const us = impl(60, 'User', [['id: ID!', { bg: ACCBG }], 'name: String!', 'email: String'], k === 1 ? pop(u, 0.2) : 1);
      curve(195, 150, 400, 98, k === 1 ? E(u, 0.7, 1.2) : 1, ACC, 0, -10, { dash: '6 5' });
      if (k === 1) { zone(380, 260, 540, 120, 'id 를 빼먹으면 (buildSchema)', { op: fade(u, 1.5) });
        mono(400, 316, 'Interface field Node.id expected', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.7) }); mono(400, 342, 'but User does not provide it.', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.7) });
        sub(650, 372, 'implements 는 선언이자 검사다', fade(u, 2.2), { 'font-size': 14 }); return; }
      impl(630, 'Post', [['id: ID!', { bg: ACCBG }], 'title: String!', 'body: String!'], pop(u, 0.2));
      curve(765, 150, 560, 98, E(u, 0.7, 1.2), ACC, 0, -10, { dash: '6 5' });
      note(480, 330, '공통 id 만 계약으로 묶고, 나머지 필드는 타입마다 자유', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    if (k === 3) { nodeTpl(1);
      code(60, 200, ['type Query { node(id: ID!): Node }'], E(u, 0.1, 0.7), { fs: 15.5 });
      grow(300, 185, 400, 100, E(u, 0.7, 1.1), ACC);
      [['User', 690, 210], ['Post', 840, 210]].forEach(([n, x, y], i) => { grow(560, 85, x, y - 20, E(u, 1.0 + i * 0.3, 1.4 + i * 0.3), MUT); card(x, y, 110, 40, { rx: 8, text: n, mono: true, fs: 15, s: pop(u, 1.3 + i * 0.3) }); });
      note(60, 330, '어느 구현체든 돌려줄 수 있다 — Relay 의 표준 진입점', fade(u, 2.0));
      sub(480, 370, '하나의 query 로 어떤 엔터티든 id 로 가져온다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 4 || k === 5) { const q = ['query($id: ID!) {', '  node(id: $id) {', '    __typename id', '    ... on Post { title }', '    ... on User { name }', '  }', '}'];
      code(50, 70, k === 4 ? q.slice(0, 4).concat(['  }', '}']) : q, k === 4 ? E(u, 0.2, 1.2) * 6 : 7, { fs: 15, lh: 30, hi: (i) => (i === 2 ? ACCBG : (i === 3 && k === 4) || (i === 4 && k === 5) ? GOODBG : null) });
      if (k === 4) { zone(470, 60, 450, 130, 'title 을 ... on 없이 바로 쓰면', { op: fade(u, 1.3) });
        mono(490, 116, '{ node(id: "Post:42") { id title } }', { 'font-size': 14, opacity: fade(u, 1.4) });
        mono(490, 146, 'Cannot query field "title" on type "Node".', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.7) });
        mono(490, 170, 'Did you mean to use an inline fragment on "Post"?', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.9) });
        note(50, 330, '공통 id 는 바로, 타입 전용 필드는 ... on 안에서만', fade(u, 2.2)); return; }
      tx(470, 50, '$id 에 따라 (graphql-js)', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      code(470, 90, ['"Post:42" → { "__typename": "Post",', '  "id": "Post:42", "title": "GraphQL 타입" }'], E(u, 0.6, 1.4) * 2, { fs: 14, lh: 26 });
      code(470, 180, ['"User:7"  → { "__typename": "User",', '  "id": "User:7", "name": "박호영" }'], E(u, 1.4, 2.2) * 2, { fs: 14, lh: 26 });
      note(50, 330, '분기는 클라이언트가 다 적고, 서버는 실제 타입 쪽만 채운다', fade(u, 2.3));
      sub(480, 375, '응답 값은 예시 데이터', fade(u, 2.5), { 'font-size': 14 }); return; }
    // k6: __resolveType
    code(50, 70, ['Node: { __resolveType: (obj) => obj.__typename }'], E(u, 0.1, 0.7), { fs: 15.5, hi: () => ACCBG });
    card(160, 170, 200, 50, { rx: 10, text: '{ __typename: "Post", … }', mono: true, fs: 13.5, s: pop(u, 0.6) });
    grow(262, 170, 380, 170, E(u, 0.9, 1.2), ACC); pill(440, 170, '"Post"', ACC, pop(u, 1.2), { mono: true, fs: 15 });
    pill(700, 170, '캐시 키 Post:42', INFO, pop(u, 1.6), { mono: true, fs: 15 });
    zone(50, 250, 870, 110, '__resolveType 을 빼먹으면', { op: fade(u, 1.8) });
    mono(70, 302, 'Abstract type "Node" must resolve to an Object type at runtime', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) });
    mono(70, 328, 'for field "Query.node". …', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) });
    sub(480, 395, '서버가 실제 타입을 알려 주면 id 기반 캐시와 공통 쿼리를 얻는다', fade(u, 2.4), { 'font-size': 14.5 }); }

  // ---------- 4. Union ----------
  const UT = [['User', ['id', 'name']], ['Post', ['id', 'title']], ['Tag', ['id', 'label']]];
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { code(60, 54, ['union SearchResult = User | Post | Tag'], k === 0 ? E(u, 0.1, 0.8) : 1, { fs: 16 });
      UT.forEach(([n, f], i) => { const x = 160 + i * 260, a = k === 0 ? pop(u, 0.8 + i * 0.3) : 1; card(x, 150, 200, 90, { rx: 10, stroke: [INFO, ACC, WARN][i], sw: 2.2, s: a });
        if (a > 0.6) { mono(x, 128, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: [INFO, ACC, WARN][i] }); mono(x, 160, f.join(' · '), { 'font-size': 14.5, 'text-anchor': 'middle' }); } });
      if (k === 0) { note(60, 270, '공통 필드를 요구하지 않는다 — 종류만 묶는다', fade(u, 1.9)); sub(480, 310, 'interface 와 다른 점', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      code(60, 250, ['search(keyword: String!): [SearchResult!]!'], E(u, 0.1, 0.7), { fs: 15 });
      ['User', 'Post', 'Tag', 'Post', 'User'].forEach((n, i) => { const col = { User: INFO, Post: ACC, Tag: WARN }[n]; card(120 + i * 120, 320, 104, 44, { rx: 8, text: n, mono: true, fs: 15, stroke: col, color: col, s: pop(u, 0.9 + i * 0.2) }); });
      sub(480, 390, '종류가 섞인 목록 하나', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 2) { code(50, 70, ['search(keyword: "graphql") {', '  __typename', '  ... on User { id name }', '  ... on Post { id title }', '  ... on Tag  { id label }', '}'], E(u, 0.1, 1.0) * 6, { fs: 14.5, lh: 28, hi: (i) => (i === 1 ? ACCBG : null) });
      tx(470, 50, '응답 (graphql-js, 예시 데이터)', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      code(470, 86, ['[ { "__typename": "User", "id": "u1", … },', '  { "__typename": "Post", "id": "p1", … },', '  { "__typename": "Tag", "id": "t1", … } ]'], E(u, 1.0, 1.8) * 3, { fs: 13.5, lh: 26 });
      zone(50, 260, 870, 100, '{ search(keyword: "graphql") { id } } 처럼 바로 쓰면', { op: fade(u, 1.9) });
      mono(70, 312, 'Cannot query field "id" on type "SearchResult". Did you mean', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 2.1) });
      mono(70, 336, 'to use an inline fragment on "Post", "Tag", or "User"?', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 2.1) });
      sub(480, 395, 'union 에서 공통으로 물을 수 있는 건 __typename 뿐', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k <= 4) { const ok = tcard(60, 60, 300, 'type CreatePostSuccess {', ['post: Post!'], { s: k === 3 ? pop(u, 0.2) : 1, col: GOOD });
      const er = tcard(60, 180, 300, 'type CreatePostUserError {', ['field: String!', 'message: String!'], { s: k === 3 ? pop(u, 0.7) : 1, col: BAD });
      if (k === 3) { note(420, 130, '성공과 사용자 에러를 각각 타입으로', fade(u, 1.5)); sub(620, 170, '에러를 예외가 아니라 데이터로 다룰 준비', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      el('path', { d: 'M372,70 Q420,70 420,170 Q420,270 372,270', fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      code(440, 176, ['union CreatePostResult'], E(u, 0.4, 0.9), { fs: 16 });
      code(440, 206, ['= CreatePostSuccess | CreatePostUserError'], E(u, 0.7, 1.2), { fs: 13.5 });
      code(60, 350, ['createPost(input: CreatePostInput!): CreatePostResult!'], E(u, 1.4, 2.0), { fs: 15, hi: () => ACCBG });
      sub(480, 395, '200 응답 안에서 성공과 실패가 타입으로 갈린다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // k5: 클라이언트 분기 + 서버 __resolveType
    code(50, 70, ['switch (data.createPost.__typename) {', '  case "CreatePostSuccess":    // 글 화면으로', '  case "CreatePostUserError":  // 입력칸에 message', '}'], E(u, 0.1, 1.0) * 4, { fs: 15, lh: 30 });
    code(50, 240, ['CreatePostResult: { __resolveType: (obj) => … }'], E(u, 1.2, 1.8), { fs: 15, hi: () => ACCBG });
    pill(720, 115, 'TS 판별 유니온으로 생성', INFO, pop(u, 1.0), { fs: 14 });
    note(50, 320, '클라이언트는 __typename 으로, 서버는 __resolveType 으로', fade(u, 2.0));
    sub(480, 370, '처리하지 않은 분기는 타입 검사기가 알려 준다', fade(u, 2.3), { 'font-size': 14.5 }); }

  // ---------- 5. 함께 쓰기 — 주문 스키마 ----------
  function s5(t, c) { const { k, u } = c, P = (kk, d) => (k === kk ? pop(u, d || 0.2) : k > kk ? 1 : 0), hot = (kk) => (k === kk ? ACC : INK);
    if (k === 6) { tx(60, 46, 'createOrder 세 가지 응답 (graphql-js, 예시 데이터)', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      [['CreateOrderSuccess', '"order": { "id": "Order:1", "status": "PENDING" }', GOOD], ['InsufficientStockError', '"sku": "TSHIRT-M", "requested": 3, "available": 1', WARN], ['CouponInvalidError', '"couponId": "OLD10", "reason": "만료된 쿠폰"', BAD]].forEach(([n, b, col], i) => {
        const y = 100 + i * 86, s = pop(u, 0.3 + i * 0.4); card(480, y, 860, 70, { rx: 10, stroke: col, sw: 2, s });
        mono(70, y - 6, '"__typename": "' + n + '"', { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.4) });
        mono(70, y + 20, b, { 'font-size': 14, opacity: fade(u, 0.5 + i * 0.4) }); });
      banner(480, 385, '실패 종류마다 필요한 필드가 다르다 — 그래서 union', pop(u, 2.0)); return; }
    const es = P(0); if (es) tcard(30, 20, 270, 'enum OrderStatus', ['PENDING PAID SHIPPED', 'DELIVERED CANCELLED'], { s: es, col: hot(0), rh: 26 });
    const ns = P(1); if (ns) tcard(345, 20, 230, 'interface Node', ['id: ID!'], { s: ns, col: hot(1), rh: 26 });
    const os = P(2); const od = tcard(320, 140, 290, 'type Order implements Node', ['id: ID!', 'status: OrderStatus!', 'amount: Int!', 'items: [OrderItem!]!'], { s: os, col: hot(2), rh: 26 });
    if (os) { curve(465, 140, 460, 76, k === 2 ? E(u, 0.6, 1.0) : 1, ACC, 0, 0, { dash: '5 4' }); curve(320, od.row(1), 200, 82, k === 2 ? E(u, 0.8, 1.3) : 1, MUT, -40, 20); }
    const is = P(3); const ci = tcard(30, 260, 270, 'input CreateOrderInput', ['items: [OrderItemInput!]!', 'couponId: ID'], { s: is, col: hot(3), rh: 26 });
    const ii = P(4); if (ii) { tcard(330, 318, 230, 'input OrderItemInput', ['sku: String!  qty: Int!'], { s: ii, col: hot(4), rh: 26 }); curve(300, ci.row(0), 330, 340, k === 4 ? E(u, 0.6, 1.0) : 1, ACC, 20, 10);
      if (k === 4) { mono(620, 370, 'items: [OrderItem!]!  ✗ 출력 타입은 못 넣는다', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.3) }); } }
    const us = P(5); if (us) { const un = tcard(650, 20, 290, 'union CreateOrderResult', [['CreateOrderSuccess', { c: GOOD }], ['InsufficientStockError', { c: WARN }], ['CouponInvalidError', { c: BAD }]], { s: us, col: hot(5), rh: 26 });
      curve(650, un.row(0), 612, 160, E(u, 0.8, 1.3), GOOD, 0, 0); mono(650, 200, 'createOrder(input: CreateOrderInput!)', { 'font-size': 13.5, opacity: fade(u, 1.3) }); mono(650, 222, '  : CreateOrderResult!', { 'font-size': 13.5, opacity: fade(u, 1.3) }); }
    const msg = ['도메인의 "정해진 값" 은 enum 후보', 'Node 하나로 캐시 키와 공통 조회의 기반', '한 타입 안에서 interface 계약과 enum 값이 함께', '쓰기 인자는 별도 input 으로', '같은 개념도 읽기용 type, 쓰기용 input 을 따로', '성공 1개 + 실패 2개를 union 으로'][k];
    if (k !== 4) note(k === 5 ? 650 : k === 3 ? 640 : 650, k === 5 ? 280 : k === 3 ? 300 : 90, msg, fade(u, 1.6), { 'font-size': 14.5 });
    else note(620, 300, msg, fade(u, 1.6), { 'font-size': 14.5 }); }

  const quiz = [
    { q: 'mutation 인자로 출력용 type User를 그대로 쓰면 어떻게 되는가?',
      o: ['스키마 검증에서 "must be Input Type" 오류가 난다', '자동으로 input 타입으로 바뀐다', '쓰는 데 문제없지만 느려진다'], a: 0,
      why: '인자와 input 필드에는 입력 타입만 올 수 있다. graphql-js는 "The type of … must be Input Type but got: User"로 거절한다.' },
    { q: 'enum Role이 있을 때 쿼리에 users(role: "ADMIN")처럼 따옴표를 붙이면?',
      o: ['문자열이라도 같은 값이라 통과한다', '검증 오류로 거절된다', 'USER로 바뀌어 실행된다'], a: 1,
      why: '쿼리 문법에서 enum 값은 따옴표 없는 식별자다. 따옴표를 붙이면 "cannot represent non-enum value" 오류가 난다. JSON 응답에서만 문자열로 온다.' },
    { q: 'node(id: ID!): Node 응답에서 Post 전용 필드 title을 받으려면 어떻게 적는가?',
      o: ['node { title }', 'node(type: Post) { title }', 'node { ... on Post { title } }'], a: 2,
      why: 'interface에서 바로 물을 수 있는 건 계약 필드뿐이다. 타입 전용 필드는 인라인 fragment 안에 적는다.' },
    { q: 'union SearchResult = User | Post | Tag에서 fragment 없이 바로 요청할 수 있는 필드는 무엇인가?',
      o: ['__typename', 'id', 'name'], a: 0,
      why: 'union은 공통 필드를 요구하지 않아 세 타입에 다 id가 있어도 바로 물을 수 없다. 공통으로 쓸 수 있는 건 __typename뿐이다.' },
    { q: '주문 생성 실패가 "재고 부족"과 "쿠폰 무효" 두 가지다. 반환 타입으로 알맞은 것은?',
      o: ['Order를 돌려주고 실패면 예외를 던진다', '성공 1개와 실패 2개를 묶은 union', 'status: String 하나로 실패 이유를 적는다'], a: 1,
      why: '실패마다 필요한 필드(requested·available, reason)가 다르다. union으로 묶으면 클라이언트가 __typename으로 모든 경우를 나눠 처리한다.' },
  ];

  const summary = [
    'mutation 인자는 input 타입 하나로 묶고, 출력 type은 input 안에 넣을 수 없다.',
    'enum은 정해진 값만 통과시키고, 값을 빼면 breaking이고 더하면 dangerous다.',
    'interface는 공통 필드를 강제하고, 타입 전용 필드는 ... on 안에서 묻는다.',
    'union은 공통 필드 없이 종류를 묶고, 성공과 여러 실패를 __typename으로 나눈다.',
  ];
  const review = [
    { q: '주문 상태를 String으로 두었더니 "SHIPED" 같은 오타가 DB까지 들어갔다. 스키마에서 바꿀 것은?',
      o: ['상태 필드를 enum OrderStatus로 바꾼다', '상태 필드를 nullable로 바꾼다', '상태를 union으로 바꾼다'], a: 0,
      why: 'enum이면 스키마에 없는 값은 요청 검증 단계에서 거절된다. 오타가 resolver까지 오지 못한다.' },
    { q: '검색 결과 화면에서 { search { id } }를 보냈더니 "Did you mean to use an inline fragment" 오류가 났다. 먼저 고칠 것은?',
      o: ['검색 resolver에서 id를 문자열로 바꾼다', 'id를 ... on User / Post / Tag 안으로 옮기거나 interface로 공통 필드를 만든다', '서버에 __resolveType을 지운다'], a: 1,
      why: 'union에서는 공통 필드를 바로 물을 수 없다. fragment 안에 적거나, 공통 필드가 필요하면 interface로 설계한다.' },
    { q: 'interface Node를 반환하는 node(id) 호출이 "must resolve to an Object type at runtime" 오류로 실패한다. 먼저 의심할 것은?',
      o: ['클라이언트가 fragment를 안 적었다', 'enum 값이 하나 빠졌다', '서버에 Node의 __resolveType이 없다'], a: 2,
      why: '서버는 돌려준 객체가 User인지 Post인지 알아야 한다. __resolveType이나 isTypeOf가 없으면 실행 중에 실패한다.' },
  ];

  R.page({ title: '스키마 타입 네 가지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
