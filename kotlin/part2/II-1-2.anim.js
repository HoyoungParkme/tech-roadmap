/* II-1-2 scope function — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림의 재료: 수신 객체 카드(필드 칸), 람다 블록(점선 방, 머리에 it/this 표), ?. 문(null 이면 블록을 건너뛴다),
   블록에서 나가는 반환 화살표(객체 자체 또는 마지막 식). 값은 코드에 적힌 것만 쓴다(5, "2개, 10% 할인", 8080). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, G, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot,
    cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const KW = /^(fun|val|var|when|is|if|else|for|in|return|class|data|null|true|false|this|it|let|run|with|apply|also)$/;
  function toks(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '/' && line[i + 1] === '/') { flush(); out.push([line.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = line.indexOf('"', i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  const kt = (x, y, s, o) => { o = o || {}; return spans(x, y, toks(s), { 'font-size': o.fs || 15, opacity: o.op ?? 1, 'text-anchor': o.anchor }, o.p); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  // 객체 카드: 머리(타입) + 필드 줄. rows: [[이름, 값, {hot, vcol}]]
  function obj(x, y, w, head, rows, o) { o = o || {}; const rh = o.rh || 30, h = 40 + rows.length * rh, op = o.op ?? 1, s = o.s ?? 1, st = o.stroke || INK;
    const g = el('g', { opacity: op, transform: s !== 1 ? `translate(${x + w / 2} ${y + h / 2}) scale(${s}) translate(${-x - w / 2} ${-y - h / 2})` : null });
    el('rect', { x, y, width: w, height: h, rx: 9, fill: o.fill || PANEL, stroke: st, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    el('line', { x1: x, y1: y + 32, x2: x + w, y2: y + 32, stroke: st, 'stroke-width': 1.3 }, g);
    mono(x + 12, y + 22, head, { 'font-size': 15, 'font-weight': 700, fill: st }, g);
    rows.forEach(([n, v, rs], i) => { rs = rs || {}; const cy = y + 36 + i * rh + rh / 2;
      if (rs.hot) el('rect', { x: x + 4, y: cy - rh / 2 + 2, width: w - 8, height: rh - 4, rx: 5, fill: rs.hot === true ? WARNBG : rs.hot }, g);
      mono(x + 12, cy + 5, n, { 'font-size': 14.5, fill: rs.col || INK }, g);
      if (v != null) mono(x + w - 12, cy + 5, String(v), { 'font-size': 14.5, 'font-weight': 700, fill: rs.vcol || INK, 'text-anchor': 'end' }, g); });
    return { x, y, w, h, x1: x + w, cy: y + h / 2 }; }
  // 람다 블록: 점선 방 + 머리 코드 + 참조 표(it / this)
  function blk(x, y, w, h, head, ref, o) { o = o || {}; const op = o.op ?? 1, col = o.off ? OFF : o.col || ACC;
    el('rect', { x, y, width: w, height: h, rx: 14, fill: o.off ? PANEL : o.fill || ACCBG, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': '8 5', opacity: op });
    if (head) kt(x + 14, y + 26, head, { op: op * (o.off ? 0.5 : 1), fs: o.fs || 15 });
    if (ref) { const pw = tw(ref, 14) + 26; card(x + w - pw / 2 - 10, y + 20, pw, 26, { rx: 13, text: ref, fs: 14, mono: true, fw: 800, stroke: 'none', fill: o.off ? OFF : col === ACC ? INFO : col, color: PANEL, op, s: o.refS }); } }
  // ?. 문: 동그란 문. 값이 null 이면 아래로 빠진다
  function gate(cx, cy, op, hot) { el('circle', { cx, cy, r: 22, fill: PANEL, stroke: hot ? BAD : INK, 'stroke-width': 2.4, opacity: op ?? 1 });
    mono(cx, cy + 6, '?.', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? BAD : INK, opacity: op ?? 1 }); }
  const nul = (cx, cy, s, o) => card(cx, cy, 62, 34, Object.assign({ rx: 17, text: 'null', fs: 15, mono: true, fw: 700, stroke: MUT, color: MUT, fill: SOFT, s }, o || {}));
  // 반환 슬롯: val 이름 = 값
  function slot(x, y, name, val, o) { o = o || {}; const op = o.op ?? 1, w = o.w || Math.max(110, tw(String(val ?? ''), 15) + 30);
    kt(x, y + 5, name, { op });
    const bx = x + tw(name, 15) + 14; el('rect', { x: bx, y: y - 19, width: w, height: 38, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    if (val != null) mono(bx + w / 2, y + 6, String(val), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: o.vcol || INK, opacity: o.vop ?? op });
    return { bx, cx: bx + w / 2, x1: bx + w }; }
  // 지워지는 접두어: 글자 위로 빨간 줄이 그어진다
  function strike(x, y, s, at, u, fs) { fs = fs || 15; mono(x, y, s, { 'font-size': fs, fill: BAD, opacity: 1 - 0.6 * E(u, at + 0.3, at + 0.6) });
    el('line', { x1: x, y1: y - fs * 0.32, x2: x + tw(s, fs) * E(u, at, at + 0.3), y2: y - fs * 0.32, stroke: BAD, 'stroke-width': 2.4 }); }

  // ---------- 1. let ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { // 두 갈래: User 가 있을 때 / null 일 때
      [[110, false], [300, true]].forEach(([y, isNull], j) => { const at = j * 0.9;
        kt(30, y - 40, isNull ? 'user = null' : 'user = User(…)', { op: fade(u, at) });
        if (!isNull) obj(30, y - 22, 140, 'User', [['name', null], ['id', null]], { s: pop(u, at + 0.1) });
        else nul(90, y, pop(u, at + 0.1));
        gate(250, y, fade(u, at + 0.2), isNull && u > at + 0.8);
        blk(320, y - 62, 400, 124, 'user?.let {', isNull ? null : 'it = User', { off: isNull, op: fade(u, at + 0.3), refS: isNull ? 1 : pop(u, at + 0.75) });
        kt(344, y + 4, 'println("이름: ${it.name}")', { op: fade(u, at + 0.3) * (isNull ? 0.4 : 1), fs: 14.5 });
        kt(344, y + 34, 'log.info("user_login …")', { op: fade(u, at + 0.3) * (isNull ? 0.4 : 1), fs: 14.5 });
        if (!isNull) { dot([[170, y], [228, y], [272, y], [330, y]], seg(u, at + 0.45, at + 0.75), ACC, 8); check(760, y, 13, pop(u, 0.85)); note(782, y + 6, '실행', fade(u, 0.9), { fill: GOOD }); }
        else { const f = E(u, at + 0.5, at + 1.1); if (f > 0 && f < 1) dot([[124, y], [228, y], [250, y + 70], [740, y + 70]], f, MUT, 8);
          if (u > at + 1.1) { cross(760, y, 12, pop(u, at + 1.1)); note(782, y + 6, '건너뜀', fade(u, at + 1.1), { fill: BAD }); } } });
      if (u > 2.1) { const ch = { x: 520, y: 395 }; mono(ch.x, ch.y, 'if (user != null) { … }', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
        el('line', { x1: ch.x - 100, y1: ch.y - 5, x2: ch.x - 100 + 200 * E(u, 2.2, 2.5), y2: ch.y - 5, stroke: BAD, 'stroke-width': 2.4 }); }
      return; }
    if (k === 1) { // 임시 변수 없이 한 식
      card(110, 170, 100, 40, { rx: 20, text: '"Hello"', mono: true, fs: 16, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      blk(230, 90, 420, 160, '"Hello".let {', 'it = "Hello"', { op: fade(u, 0.3) });
      kt(256, 170, 'it.uppercase().length', { op: fade(u, 0.5), fs: 16 });
      const f = E(u, 0.8, 1.2); if (f > 0) card(330, 215, 100, 32, { rx: 8, text: '"HELLO"', mono: true, fs: 14.5, stroke: WARN, color: WARN, op: f * (1 - fade(u, 2.2)) });
      if (u > 1.1) { grow(445, 215, 520, 215, E(u, 1.1, 1.4), MUT); }
      if (u > 1.4) card(560, 215, 60, 32, { rx: 8, text: '5', mono: true, fs: 16, stroke: GOOD, color: GOOD, s: pop(u, 1.4) });
      fly(560, 215, 780, 330, seg(u, 1.7, 2.1), '5', { mono: true, fill: GOOD });
      slot(560, 330, 'val length', u > 2.1 ? 5 : null, { stroke: GOOD, vcol: GOOD, w: 80 });
      sub(330, 290, '"HELLO" 는 블록 밖으로 새지 않는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 600 });
      sub(800, 120, '반환 = 블록의 마지막 식', fade(u, 1.5), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); return; }
    if (k === 2) { // ?.let 체이닝: Long? → User? → String?
      const X = [90, 330, 570, 820], T = ['Long?', 'User?', 'String?'];
      kt(30, 50, 'val display: String? = userId ?.let { findUser(it) } ?.let { "${it.name} 님" }', { fs: 14, op: fade(u, 0.1) });
      [[1, 160], [0, 320]].forEach(([found, y], j) => {
        card(X[0], y, 110, 40, { rx: 8, text: 'userId', mono: true, fs: 15, stroke: INFO, color: INFO });
        gate(200, y, 1); gate(450, y, 1, !found && u > 1.4);
        card(X[1], y, 130, 54, { rx: 10, text: '?.let\nfindUser', mono: true, fs: 13.5, stroke: ACC, s: 1 });
        card(X[2], y, 130, 54, { rx: 10, text: '?.let\n"… 님"', mono: true, fs: 13.5, stroke: found ? ACC : OFF, color: found ? INK : OFF });
        const p = E(u, 0.3 + j * 0.15, 2.0 + j * 0.15);
        if (found) { const typ = p < 0.33 ? T[0] : p < 0.66 ? T[1] : T[2];
          dot([[X[0] + 55, y], [X[3] - 50, y]], p > 0 && p < 1 ? p : 0, ACC, 8); const lx = p >= 1 ? X[3] : lerp(X[0] + 55, X[3] - 50, p);
          if (p >= 1) card(X[3], y, 120, 40, { rx: 8, text: '"… 님"', mono: true, fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 2.0) });
          if (p > 0) mono(lx, y - 40, typ, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); }
        else { const q = E(u, 0.45, 1.4); dot([[X[0] + 55, y], [X[1] + 65, y], [450, y]], q > 0 && q < 1 ? q : 0, INFO, 8);
          if (u > 1.4) { nul(450, y + 44, pop(u, 1.4)); sub(450, y + 84, 'findUser 가 null', fade(u, 1.5), { 'font-size': 14.5, fill: BAD }); }
          if (u > 1.9) { nul(X[3], y, pop(u, 1.9)); mono(X[3], y - 34, 'String?', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT }); }
          if (u > 2.1) note(X[2] - 50, y + 50, '뒤 let 은 실행 안 함', fade(u, 2.1), { fill: MUT }); } });
      return; }
    // k === 3 : it 대신 이름 붙이기 (중첩되면 it 이 흐려진다)
    const ren = E(u, 1.3, 1.8);
    blk(60, 60, 560, 300, ren > 0.5 ? 'user?.let { u ->' : 'user?.let {', ren > 0.5 ? 'u = User' : 'it = User', { op: 1, refS: 1 + bump(u, 1.3) });
    blk(100, 150, 480, 150, 'u.orders.firstOrNull()?.let {', 'it = Order', { col: WARN, fill: WARNBG, op: fade(u, 0.3), fs: 14.5 });
    kt(124, 230, ren > 0.5 ? 'println(u.name)' : 'println(it.name)', { op: fade(u, 0.5), fs: 16 });
    kt(124, 262, 'println(it.total)', { op: fade(u, 0.5), fs: 16 });
    if (u > 0.7 && ren < 0.5) { mono(310, 230, '← 어느 it?', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.7) }); }
    if (ren > 0.5) { mono(310, 230, '← 바깥 User', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      mono(310, 262, '← 안쪽 Order', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) }); }
    sub(800, 140, '중첩되면 it 이 둘이다', fade(u, 0.8), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
    sub(800, 180, '{ u -> } 로 이름을 준다', fade(u, 1.5), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
    sub(800, 260, '(Order 줄은 설명용 예시)', fade(u, 2.2), { 'font-size': 14 }); }

  // ---------- 2. run ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { obj(30, 120, 170, 'user: User', [['profile', null], ['name', null]], { s: pop(u, 0.15) });
      blk(250, 80, 420, 190, 'user.run {', 'this = user', { op: fade(u, 0.3), refS: pop(u, 0.5) });
      const L = [['profile.fetch()', 160], ['name.uppercase()', 210]];
      L.forEach(([s, y], i) => { const at = 0.7 + i * 0.35, off = E(u, at + 0.4, at + 0.8);
        mono(274, y, 'this.', { 'font-size': 16, fill: MUT, opacity: (1 - off) * fade(u, at) });
        kt(lerp(274 + 48, 274, off), y, s, { fs: 16, op: fade(u, at) }); });
      grow(204, 165, 248, 165, E(u, 0.3, 0.6), MUT);
      el('rect', { x: 262, y: 188, width: 260, height: 32, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.8) });
      sub(600, 210, '마지막 식', fade(u, 1.8), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 });
      grow(640, 272, 740, 316, E(u, 2.0, 2.3), GOOD);
      slot(560, 340, 'val name: String', u > 2.3 ? 'name.uppercase()' : null, { stroke: GOOD, vcol: GOOD, w: 190 });
      sub(470, 395, '블록 안에서는 접두어 없이 멤버를 부른다', fade(u, 1.2), { 'font-size': 15 }); return; }
    if (k === 1) { // ?.run: 있을 때 / null 일 때
      [[120, false], [310, true]].forEach(([y, isNull], j) => {
        if (!isNull) card(80, y, 130, 46, { rx: 8, text: 'StringBuilder', mono: true, fs: 14, stroke: INK, s: pop(u, 0.1) }); else nul(80, y, pop(u, 0.2));
        mono(80, y - 34, 'builder', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT });
        gate(190, y, 1, isNull && u > 0.9);
        blk(240, y - 58, 400, 116, 'builder?.run {', isNull ? null : 'this = builder', { off: isNull, op: fade(u, 0.2) });
        if (!isNull) { const buf = u < 0.8 ? '' : u < 1.3 ? 'hello ' : 'hello world';
          kt(262, y + 4, u < 1.3 ? 'append("hello ")' : u < 1.8 ? 'append("world")' : 'toString()', { fs: 15 });
          el('rect', { x: 470, y: y - 6, width: 150, height: 34, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
          mono(480, y + 16, buf, { 'font-size': 15, fill: ACC, 'font-weight': 700 });
          fly(620, y, 740, y, seg(u, 1.9, 2.3), '"hello world"', { mono: true, fill: GOOD });
          if (u > 2.3) card(800, y, 140, 40, { rx: 8, text: '"hello world"', mono: true, fs: 14.5, stroke: GOOD, color: GOOD, s: pop(u, 2.3) }); }
        else { const f = E(u, 0.5, 1.4); if (f > 0 && f < 1) dot([[115, y], [190, y], [190, y + 70], [800, y + 70], [800, y + 20]], f, MUT, 7);
          if (u > 1.4) nul(800, y, pop(u, 1.4)); }
        mono(800, y - 34, 'text', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) }); });
      pill(480, 400, '결과 타입 String?', ACC, pop(u, 2.3), { mono: true }); return; }
    // k === 2 : 수신 객체 없는 run — 지역 변수를 가둔다
    el('ellipse', { cx: 350, cy: 215, rx: 320, ry: 145, fill: ACCBG, stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '9 6', opacity: fade(u, 0.1) });
    kt(40, 44, 'val config = run {', { op: fade(u, 0.1) });
    [['val port', '8080', 'PORT 없으면'], ['val host', '"0.0.0.0"', 'HOST 없으면']].forEach(([n, v, why], i) => { const y = 160 + i * 60, at = 0.4 + i * 0.4;
      kt(150, y, n, { op: fade(u, at) }); card(310, y - 5, 120, 36, { rx: 8, text: v, mono: true, fs: 15, stroke: WARN, color: INK, s: pop(u, at + 0.1) });
      sub(450, y, why, fade(u, at + 0.2), { 'text-anchor': 'start', 'font-size': 14 }); });
    kt(150, 280, 'Config(host, port)', { op: fade(u, 1.2) });
    const m = E(u, 1.5, 2.1); obj(lerp(420, 720, m), lerp(240, 150, m), 190, 'Config', [['host', '"0.0.0.0"'], ['port', '8080']], { stroke: GOOD, op: fade(u, 1.4) });
    if (u > 1.6) { const b = Math.sin(seg(u, 1.6, 2.2) * Math.PI) * 30; card(560 + b, 392, 90, 30, { rx: 6, text: 'port', mono: true, fs: 14, stroke: BAD, color: BAD, op: fade(u, 1.6) }); cross(620, 392, 9, pop(u, 2.1)); }
    sub(790, 397, 'port · host 는 밖에서 안 보인다', fade(u, 2.2), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
    kt(720, 120, 'val config', { op: fade(u, 2.0) }); }

  // ---------- 3. with ----------
  function s3(t, c) { const { k, u } = c;
    const items = k === 0 ? [] : k === 1 ? ['apple', 'banana'].filter((_, i) => u > 0.6 + i * 0.5) : ['apple', 'banana'];
    const disc = k === 0 ? 0 : k === 1 ? Math.round(tween(0, 10, u - 1.3, 0.6)) : 10;
    const CX = k === 3 ? 360 : 60, CY = 120;
    if (k <= 2) { const o = obj(CX, CY, 260, 'cart: Cart', [['items', '[' + items.join(', ') + ']', { hot: k === 1 && u > 0.6 && u < 1.6 }], ['discount', disc, { hot: k === 1 && u > 1.3 }]], { s: k === 0 ? pop(u, 0.2) : 1, stroke: k >= 1 ? ACC : INK });
      if (k === 0) { kt(CX, CY - 20, 'val cart = Cart()', { op: fade(u, 0.1) });
        sub(560, 160, 'items = [] · discount = 0', fade(u, 0.9), { 'font-size': 15, 'text-anchor': 'start' });
        sub(560, 200, '아직 아무 조작도 없다', fade(u, 1.3), { 'font-size': 15, 'text-anchor': 'start' });
        sub(470, 330, 'cart 이름을 몇 번 반복할지가 with 를 고르는 기준이 된다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 600 }); return; }
      blk(30, 60, 610, 300, 'with(cart) {', 'this = cart', { op: 1, fill: 'none' });
      const L = ['items.add("apple")', 'items.add("banana")', 'discount = 10', '"${items.size}개, ${discount}% 할인"'];
      L.forEach((s, i) => { const y = 245 + i * 26, at = k === 1 ? 0.3 + i * 0.5 : -1; if (i === 3 && k === 1) return;
        kt(106, y, s, { fs: 14.5, op: k === 1 ? fade(u, at) : i === 3 ? 1 : 0.55 }); });
      if (k === 1) { [0, 1, 2].forEach((i) => strike(56, 245 + i * 26, 'cart.', 0.6 + i * 0.5, u, 14.5));
        sub(520, 280, '접두어 3번 사라짐', fade(u, 2.0), { 'font-size': 14, fill: BAD, 'font-weight': 700 }); return; }
      el('rect', { x: 98, y: 304, width: 330, height: 26, rx: 5, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.3) });
      grow(430, 318, 690, 280, E(u, 0.7, 1.1), GOOD);
      slot(690, 280, 'summary', u > 1.1 ? '"2개, 10% 할인"' : null, { stroke: GOOD, vcol: GOOD, w: 170 });
      grow(322, 160, 690, 160, E(u, 1.4, 1.7), BAD, { dash: '6 5' }); if (u > 1.7) cross(720, 160, 11, pop(u, 1.7));
      sub(800, 200, 'cart 는 돌려주지 않는다', fade(u, 1.8), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
      sub(800, 380, '객체가 필요하면 apply', fade(u, 2.2), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); return; }
    // k === 3 : run 과의 차이 — ?. 를 붙일 수 있는가
    [['cart?.run { … }', '확장 함수 · 점 표기', true, 250], ['cart?.with(…)', '일반 함수 · ?. 자리 없음', false, 710]].forEach(([s, why, ok, cx], i) => { const at = 0.3 + i * 0.7;
      el('rect', { x: cx - 210, y: 70, width: 420, height: 220, rx: 14, fill: ok ? GOODBG : BADBG, stroke: ok ? GOOD : BAD, 'stroke-width': 2, opacity: fade(u, at) });
      lbl(cx, 108, ok ? 'run' : 'with', fade(u, at), { 'font-size': 20, class: 'mono', fill: ok ? GOOD : BAD });
      mono(cx, 170, s, { 'font-size': 19, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, at + 0.2), 'text-decoration': ok ? null : (u > at + 0.6 ? 'line-through' : null), fill: ok ? INK : BAD });
      (ok ? check : cross)(cx, 222, 14, pop(u, at + 0.5));
      sub(cx, 268, why, fade(u, at + 0.5), { 'font-size': 15, fill: INK }); });
    mono(710, 330, 'with(cart) { … }  는 된다', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    banner(480, 385, '블록 안 동작은 같다 · null 가능성이 있으면 run', pop(u, 2.2)); }

  // ---------- 4. apply ----------
  const REQ = [['url', '"https://api.example.com/users"'], ['method', '"POST"'], ['headers[..]', '"application/json"'], ['body', '"""{"id": 1}"""']];
  function s4(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { const on = k === 0 ? REQ.map((_, i) => u > 0.6 + i * 0.4) : REQ.map(() => true);
      const rows = REQ.map(([n, v], i) => [n, on[i] ? v : '·', { hot: k === 0 && on[i] && u < 0.6 + i * 0.4 + 0.5, vcol: on[i] ? ACC : OFF }]);
      if (k === 0) { blk(20, 40, 920, 290, 'Request().apply {', 'this = Request()', { refS: pop(u, 0.3) });
        const o = obj(40, 90, 430, 'Request', rows, { s: pop(u, 0.15) });
        REQ.forEach(([n], i) => { const at = 0.6 + i * 0.4; kt(500, 150 + i * 32, i === 2 ? 'headers["Content-Type"] = …' : n + ' = …', { fs: 14.5, op: fade(u, at - 0.1) });
          if (u > at - 0.1) grow(495, 145 + i * 32, 475, 145 + i * 32, E(u, at, at + 0.15), ACC); });
        [0, 1, 2, 3].forEach((i) => strike(520 + i * 100, 300, 'request.', 2.0 + i * 0.1, u, 14.5));
        sub(480, 380, '변수 이름 반복 없이 속성 4개를 대입한다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 600 }); return; }
      // k === 1 : 반환은 객체 자신
      const m = E(u, 0.4, 1.2);
      obj(lerp(40, 490, m), lerp(90, 140, m), 430, 'Request', rows, { stroke: m > 0.95 ? GOOD : INK });
      kt(490, 118, 'val request', { op: fade(u, 1.1) });
      el('rect', { x: 480, y: 130, width: 450, height: 186, rx: 12, fill: 'none', stroke: GOOD, 'stroke-width': 2.4, 'stroke-dasharray': '7 5', opacity: fade(u, 1.1) });
      if (u > 1.4) { el('rect', { x: 40, y: 140, width: 380, height: 150, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.4) });
        kt(60, 175, 'run 이었다면', { op: fade(u, 1.5) });
        kt(60, 215, '마지막 줄 body = … 는 대입문', { op: fade(u, 1.7), fs: 14.5 }); cross(390, 210, 10, pop(u, 1.9));
        sub(230, 265, 'request 에 Unit 이 담긴다', fade(u, 2.0), { 'font-size': 14.5, fill: BAD }); }
      banner(480, 380, 'apply 는 블록 결과가 아니라 객체 자신을 돌려준다', pop(u, 2.3)); return; }
    if (k === 2) { // 안드로이드 Button 초기화
      blk(30, 50, 430, 300, 'Button(context).apply {', 'this = Button', { refS: 1 });
      [['text = "확인"', 0.3], ['setOnClickListener { onConfirm() }', 0.9], ['layoutParams = …', 1.5]].forEach(([s, at], i) => kt(54, 130 + i * 40, s, { fs: 14.5, op: fade(u, at) }));
      // 화면 속 버튼 한 개
      el('rect', { x: 560, y: 60, width: 320, height: 300, rx: 22, fill: PANEL, stroke: INK, 'stroke-width': 2.4 });
      const lp = E(u, 1.5, 2.0); el('rect', { x: lerp(650, 600, lp), y: lerp(185, 175, lp), width: lerp(140, 240, lp), height: lerp(56, 70, lp), rx: 10, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.5) });
      card(720, 210, 130, 48, { rx: 10, fill: ACC, stroke: 'none', text: u > 0.4 ? '확인' : '', fs: 17, color: PANEL, s: pop(u, 0.1) });
      if (u > 0.9) { el('path', { d: 'M760,222 l0,26 l7,-7 l6,13 l5,-2 l-6,-13 l10,0 Z', fill: INK, stroke: PANEL, 'stroke-width': 1.5, opacity: fade(u, 0.9) });
        mono(720, 285, 'onConfirm()', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.1) }); }
      sub(720, 330, 'layoutParams', fade(u, 1.8), { 'font-size': 14, fill: INFO });
      kt(30, 395, 'val btn: Button', { op: fade(u, 2.2) }); sub(330, 390, '생성 + 설정이 한 식', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k === 3 : ?.apply
    [[120, false], [310, true]].forEach(([y, isNull]) => {
      if (!isNull) obj(30, y - 50, 160, 'Config', [['port', u > 1.0 ? 'port + 1' : 'port', { vcol: u > 1.0 ? ACC : INK }], ['debug', u > 1.4 ? 'true' : '…', { vcol: u > 1.4 ? ACC : INK }]]);
      else nul(110, y, 1);
      gate(240, y, 1, isNull && u > 0.8);
      blk(290, y - 58, 380, 116, 'config?.apply {', isNull ? null : 'this = config', { off: isNull, op: fade(u, 0.2) });
      kt(312, y + 4, 'port = port + 1', { fs: 15, op: isNull ? 0.35 : fade(u, 0.8) }); kt(312, y + 32, 'debug = true', { fs: 15, op: isNull ? 0.35 : fade(u, 1.3) });
      if (!isNull) { grow(672, y, 740, y, E(u, 1.8, 2.1), GOOD); if (u > 2.1) card(820, y, 130, 40, { rx: 8, text: 'Config', mono: true, fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 2.1) }); }
      else { const f = E(u, 0.4, 1.4); if (f > 0 && f < 1) dot([[140, y], [240, y], [240, y + 70], [820, y + 70], [820, y + 20]], f, MUT, 7); if (u > 1.4) nul(820, y, pop(u, 1.4)); } });
    pill(480, 400, '결과 타입 Config? · 셋업 후에도 타입 유지', ACC, pop(u, 2.3), { fs: 14.5 }); }

  // ---------- 5. also ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const S = [['fetchUsers()', 90], ['.filter', 270], ['.also', 430, true], ['.sortedBy', 600], ['.also', 770, true]], Y = 250;
      el('line', { x1: 60, y1: Y, x2: 900, y2: Y, stroke: GRID, 'stroke-width': 4 });
      S.forEach(([s, x, side], i) => { card(x, Y, side ? 110 : 130, 44, { rx: 10, text: s, mono: true, fs: 15, stroke: side ? WARN : INK, fill: side ? WARNBG : PANEL, s: pop(u, 0.1 + i * 0.1) }); });
      const p = E(u, 0.5, 2.3), x = lerp(90, 880, p);
      if (u > 0.5) card(x, Y - 56, 110, 30, { rx: 15, text: 'List<User>', mono: true, fs: 13.5, stroke: 'none', fill: ACC, color: PANEL });
      terminal(330, 40, 540, 110, ['active=…', 'sorted ok'].slice(0, (x > 430 ? 1 : 0) + (x > 770 ? 1 : 0)), (x > 430 ? 1 : 0) + (x > 770 ? 1 : 0), { title: 'log' });
      [[430, 0], [770, 1]].forEach(([sx, j]) => { if (x > sx) grow(sx, Y - 24, sx, 150, E(u, 0.5 + (sx - 90) / 790 * 1.8, 0.8 + (sx - 90) / 790 * 1.8), WARN); });
      sub(480, 330, 'also 는 받은 객체를 그대로 돌려준다 · 흐름이 끊기지 않는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 600 });
      sub(480, 360, '(active= 뒤에는 실제 활성 사용자 수가 찍힌다)', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 1) { kt(30, 60, 'val pwd = Password(input).also { require(it.isValid()) { "잘못된 비밀번호" } }', { fs: 14, op: fade(u, 0.1) });
      [[150, true], [300, false]].forEach(([y, ok], j) => { const at = 0.3 + j * 0.8;
        card(110, y, 160, 46, { rx: 10, text: 'Password', mono: true, fs: 15, stroke: INK, s: pop(u, at) });
        el('rect', { x: 260, y: y - 34, width: 210, height: 68, rx: 12, fill: WARNBG, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: fade(u, at) });
        kt(276, y + 5, 'require(it.isValid())', { fs: 14, op: fade(u, at) });
        dot([[190, y], [470, y]], seg(u, at + 0.2, at + 0.6), ok ? ACC : BAD, 7);
        if (ok) { if (u > at + 0.6) { check(500, y, 12, pop(u, at + 0.6)); slot(540, y, 'pwd', 'Password', { stroke: GOOD, vcol: GOOD, w: 130 }); } }
        else if (u > at + 0.6) { cross(500, y, 12, pop(u, at + 0.6)); card(720, y, 380, 44, { rx: 8, text: 'IllegalArgumentException: 잘못된 비밀번호', fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, at + 0.7) }); }
        sub(110, y + 44, ok ? '조건 통과' : '조건 실패', fade(u, at), { 'font-size': 14.5, fill: ok ? GOOD : BAD }); });
      sub(480, 395, '검증을 곁다리로 끼워도 대입식 모양은 그대로다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 600 }); return; }
    if (k === 2) { obj(390, 150, 180, 'obj', [['length', '…']], { s: pop(u, 0.1) });
      blk(30, 80, 320, 170, 'apply {', 'this', { refS: pop(u, 0.4) }); kt(54, 160, 'length = …', { fs: 16, op: fade(u, 0.5) }); sub(190, 210, '셋업', fade(u, 0.7), { 'font-size': 16, fill: ACC, 'font-weight': 700 });
      blk(610, 80, 320, 170, 'also {', 'it', { col: WARN, fill: WARNBG, refS: pop(u, 1.0) }); kt(634, 160, 'it.length = …', { fs: 16, op: fade(u, 1.1) }); sub(770, 210, '곁다리 작업', fade(u, 1.3), { 'font-size': 16, fill: WARN, 'font-weight': 700 });
      R.grow(350, 165, 386, 180, E(u, 1.6, 1.9), GOOD); R.grow(610, 165, 574, 180, E(u, 1.8, 2.1), GOOD);
      sub(480, 290, '반환은 둘 다 객체 자신', fade(u, 2.0), { 'font-size': 16, fill: GOOD, 'font-weight': 700 });
      sub(480, 330, '차이는 참조 방식 하나 · 읽는 사람에게 의도를 알린다', fade(u, 2.3), { 'font-size': 15, fill: INK }); return; }
    // k === 3 : 참조 × 반환 2×2 표
    const GX = 300, GY = 100, CWD = 280, CH = 120;
    lbl(GX + CWD / 2, GY - 24, 'this 로 받는다', fade(u, 0.1), { fill: INFO }); lbl(GX + CWD * 1.5, GY - 24, 'it 으로 받는다', fade(u, 0.1), { fill: WARN });
    tx(GX - 16, GY + CH / 2 + 6, '반환 = 객체 자신', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.2) });
    tx(GX - 16, GY + CH * 1.5 + 6, '반환 = 람다 결과', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.2) });
    const cell = [[0, 0, 'apply', '객체 셋업'], [1, 0, 'also', '부수 효과 · 로그'], [0, 1, 'run · with', '여러 호출 후 결과'], [1, 1, 'let', 'null 처리 · 임시 변수']];
    cell.forEach(([cx, cy], i) => el('rect', { x: GX + cx * CWD, y: GY + cy * CH, width: CWD - 8, height: CH - 8, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.6, opacity: fade(u, 0.2) }));
    cell.forEach(([cx, cy, n, why], i) => { const at = 0.6 + i * 0.35, m = E(u, at, at + 0.4), x = GX + cx * CWD + (CWD - 8) / 2, y = GY + cy * CH + 46;
      mono(lerp(480, x, m), lerp(380, y, m), n, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, at) });
      sub(x, y + 36, why, fade(u, at + 0.4), { 'font-size': 15, fill: INK }); }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'user가 null일 때 user?.let { println(it.name) }은 어떻게 되는가?',
      o: ['NullPointerException이 난다', 'it에 null이 들어간 채 블록이 실행된다', '블록 전체를 건너뛰고 결과는 null이다'], a: 2,
      why: '?. 가 null을 만나면 let을 호출하지 않는다. 그래서 if (user != null) 분기를 따로 쓰지 않아도 된다.' },
    { q: 'run 블록 안에서 profile.fetch()처럼 접두어 없이 멤버를 부를 수 있는 이유는 무엇인가?',
      o: ['수신 객체가 this로 잡혀서', 'profile이 전역 변수라서', 'run이 객체를 복사해서'], a: 0,
      why: 'run은 수신 객체를 this로 받는다. this는 생략할 수 있으니 user.profile 대신 profile이라고 쓴다.' },
    { q: "with(cart) { …; \"${items.size}개, ${discount}% 할인\" }의 반환값은 무엇인가?",
      o: ['cart 객체', '"2개, 10% 할인" 문자열', 'Unit'], a: 1,
      why: 'with는 블록의 마지막 식을 돌려준다. items 2개, discount 10이므로 "2개, 10% 할인"이 summary에 담긴다.' },
    { q: 'Request().apply { url = …; method = "POST" }가 request에 담는 것은 무엇인가?',
      o: ['마지막 대입식의 값', '속성이 채워진 Request 객체 자신', 'apply 블록 자체'], a: 1,
      why: 'apply는 블록 결과와 상관없이 수신 객체를 그대로 돌려준다. 그래서 생성과 셋업이 한 식으로 끝난다.' },
    { q: 'filter와 sortedBy 사이에 .also { println(it.size) }를 끼워도 체인이 그대로 이어지는 이유는 무엇인가?',
      o: ['also가 받은 객체를 그대로 돌려줘서', 'also가 println 결과를 돌려줘서', 'also가 리스트를 정렬해 줘서'], a: 0,
      why: 'also는 it으로 받은 객체를 다시 돌려준다. 그래서 로그를 찍어도 List<User> 흐름이 바뀌지 않는다.' },
  ];
  const summary = [
    'let은 객체를 it으로 받고 블록 결과를 돌려준다. ?.let은 null이면 블록을 건너뛴다.',
    'run과 with는 객체를 this로 받아 접두어 없이 여러 번 부르고, 마지막 식을 돌려준다.',
    'apply와 also는 객체 자신을 돌려준다. apply는 셋업에, also는 로그·검증에 쓴다.',
    'with는 일반 함수라 ?.를 붙일 수 없으니 null일 수 있으면 run이나 let을 고른다.',
  ];
  const review = [
    { q: 'nullable인 config에 속성 두 개를 대입하고, 그 config를 다시 변수에 받고 싶다. 알맞은 것은?',
      o: ['with(config) { … }', 'config?.let { … }', 'config?.apply { … }'], a: 2,
      why: '속성 대입이 몰려 있으면 this로 받는 apply가 읽기 좋고, 객체 자신을 돌려준다. ?.를 붙이면 null일 때 건너뛴다.' },
    { q: 'val total = order.also { it.items.sum() }으로 합계를 받으려 했는데 total에 Order가 들어 있다. 원인은?',
      o: ['also는 객체 자신을 돌려준다', 'sum()이 Order를 돌려준다', 'it이 null이었다'], a: 0,
      why: 'also와 apply는 블록 결과를 버리고 객체를 돌려준다. 계산 결과가 필요하면 let이나 run을 쓴다.' },
    { q: '?.let 안에서 또 ?.let을 쓰다 보니 it이 무엇인지 헷갈린다. 가장 먼저 할 일은?',
      o: ['안쪽을 with로 바꾼다', '바깥 람다에 { u -> }처럼 이름을 붙인다', 'it을 this로 바꿔 쓴다'], a: 1,
      why: '중첩되면 바깥 it이 안쪽 it에 가려진다. 이름을 붙이면 어느 값을 가리키는지 코드에 드러난다.' },
  ];

  R.page({ title: 'scope function 5종 — 참조 / 반환', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
