/* II-1-1 클래스와 dunder 메서드 — 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, dot, fly, cells, zone, cross, check, terminal, snippet, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // beat j 에서 a초부터 0→1 (그 뒤 beat 에서는 1)
  const at = (c, j, a = 0.2, d = 0.6) => (c.k > j ? 1 : c.k === j ? E(c.u, a, a + d) : 0);
  const pp = (c, j, a = 0.2) => (c.k > j ? 1 : c.k === j ? pop(c.u, a) : 0);
  const now = (c, j, a) => c.k > j || (c.k === j && c.u >= a);

  // 파이썬 객체 상자: 머리(이름) + 이름공간 줄. rows [{k, v, op, hot, kcol, vcol}]
  function obj(cx, top, w, head, rows, o) { o = o || {}; const rh = 30, h = 36 + rows.length * rh + 6, g = R.G(cx, top, o.s ?? 1, o.op ?? 1), col = o.stroke || INK;
    el('rect', { x: -w / 2, y: 0, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    el('line', { x1: -w / 2, y1: 33, x2: w / 2, y2: 33, stroke: col, 'stroke-width': 1.2, opacity: 0.45 }, g);
    tx(-w / 2 + 12, 23, head, { 'font-size': 15, 'font-weight': 700, fill: o.hcol || col, class: 'mono' }, g);
    if (o.tag) tx(w / 2 - 12, 23, o.tag, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }, g);
    rows.forEach((r, i) => { const y = 36 + i * rh, op = r.op ?? 1; if (op <= 0) return;
      if (r.hot) el('rect', { x: -w / 2 + 5, y: y + 1, width: w - 10, height: rh - 3, rx: 6, fill: r.hot === true ? ACCBG : r.hot, opacity: op }, g);
      mono(-w / 2 + 14, y + 20, r.k, { 'font-size': 14.5, 'font-weight': 700, fill: r.kcol || INK, opacity: op }, g);
      mono(w / 2 - 14, y + 20, r.v, { 'font-size': 14.5, fill: r.vcol || INK, 'text-anchor': 'end', 'font-weight': r.vb ? 700 : 400, opacity: op }, g); });
    return { top, h, bottom: top + h, left: cx - w / 2, right: cx + w / 2, rowY: (i) => top + 36 + i * rh + 15 }; }
  // 화살표 (끝에 촉), u 만큼 자란다
  function arrow(x1, y1, x2, y2, u, col, o) { if (u <= 0) return; o = o || {}; const x = lerp(x1, x2, u), y = lerp(y1, y2, u), c = col || MUT;
    el('line', { x1, y1, x2: x, y2: y, stroke: c, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    if (u > 0.92 && !o.plain) { const a = Math.atan2(y2 - y1, x2 - x1), L = o.hs || 10;
      el('path', { d: `M${x},${y} L${x - L * Math.cos(a - 0.42)},${y - L * Math.sin(a - 0.42)} L${x - L * Math.cos(a + 0.42)},${y - L * Math.sin(a + 0.42)} Z`, fill: c, opacity: o.op ?? 1 }); } }
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op }, a || {}));
  const code = (x, y, s, op, a) => mono(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op }, a || {}));

  // =========================================================
  // 1. 클래스 속성은 틀에 하나, 인스턴스 속성은 객체마다
  // =========================================================
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev;
    const cnt = (s) => +((s && s.attrModel && s.attrModel.classAttrs[0].value) || 0);
    const n = k >= 2 && cnt(p) !== cnt(b) ? lerp(cnt(p), cnt(b), E(u, 1.5, 2.1)) : cnt(b);
    const cntHot = (k === 2 || k === 3) && u > 1.4 && u < 2.5 || (k === 5 && u > 1.5);
    const CL = obj(480, 34, 330, 'Vector', [
      { k: 'count', v: String(Math.round(n)), vb: true, hot: cntHot ? true : null, vcol: cntHot ? ACC : INK },
      { k: '__init__', v: 'function', op: at(c, 1, 0.3), vcol: MUT }], { s: pp(c, 0, 0.2), tag: '클래스 객체' });
    if (k === 0) { say(480, 230, '인스턴스는 아직 0개', fade(u, 1.0), { fill: MUT });
      say(480, 262, 'class 본문은 한 번 실행되고 count = 0 도 이때 한 번 생긴다', fade(u, 1.5), { 'font-size': 14, 'font-weight': 600, fill: MUT }); }
    if (k === 1) { obj(270, 250, 230, 'self', [], { dash: '6 5', stroke: OFF, hcol: MUT, op: fade(u, 0.9), tag: '빈 객체' });
      arrow(CL.left + 30, CL.rowY(1) + 12, 300, 248, E(u, 1.2, 1.8), ACC, { dash: '5 5' });
      say(270, 322, '__new__가 만든 빈 객체가 self로 들어온다', fade(u, 1.8), { 'font-size': 14 }); }
    const inst = (cx, j, name, xv, yv, tagX, call) => {
      if (k < j) return; const s = k === j ? pop(u, 0.5) : 1;
      if (k === j) pill(tagX, 214, call, ACC, pop(u, 0.2), { mono: true, fs: 14.5 });
      const hx = k === 4 && u > 0.8, hy = k === 4 && u > 1.0;
      const B = obj(cx, 250, 230, name, [
        { k: 'x', v: xv, op: at(c, j, 0.9, 0.3), vb: true, hot: hx ? true : null },
        { k: 'y', v: yv, op: at(c, j, 1.2, 0.3), vb: true, hot: hy ? true : null }], { s, tag: 'Vector 객체' });
      const side = cx < 480 ? 1 : -1, tagPos = cx < 480 ? 72 : 888;
      pill(tagPos, 301, name, INK, pp(c, j, 2.0), { mono: true, fs: 15 });
      arrow(tagPos + side * 30, 301, cx - side * 115, 301, at(c, j, 2.1, 0.4), INK);
      arrow(cx + side * 60, 250, 480 - side * 80, CL.bottom + 2, at(c, j, 0.6, 0.6), OFF, { dash: '4 5', sw: 1.8 });
      mono(lerp(cx + side * 60, 480 - side * 80, 0.5) + side * 14, (250 + CL.bottom) / 2 + 5, '__class__', { 'font-size': 13.5, fill: MUT, opacity: at(c, j, 1.0), 'text-anchor': side > 0 ? 'start' : 'end' });
      return B; };
    const V1 = inst(270, 2, 'v1', '3', '4', 110, 'Vector(3, 4)'), V2 = inst(690, 3, 'v2', '1', '2', 850, 'Vector(1, 2)');
    if (k === 4) { dot([[102, 301], [200, 301], [230, V1.rowY(0)]], seg(u, 0.2, 0.8), ACC, 6);
      dot([[858, 301], [760, 301], [650, V2.rowY(0)]], seg(u, 0.6, 1.2), ACC, 6);
      code(270, 390, 'v1.x, v1.y → 3 4', fade(u, 1.3), { 'text-anchor': 'middle', fill: ACC });
      code(690, 390, 'v2.x, v2.y → 1 2', fade(u, 1.7), { 'text-anchor': 'middle', fill: ACC });
      say(480, 305, 'x 자리가 서로 다르다', fade(u, 2.1), { fill: MUT, 'font-size': 14 }); }
    if (k === 5) { dot([[102, 301], [180, 301], [330, 252], [400, CL.bottom], [430, CL.rowY(0)]], seg(u, 0.2, 1.5), ACC, 6);
      say(270, 390, 'v1에 count 가 없다 → 클래스로 올라간다', fade(u, 0.6), { 'font-size': 14, fill: WARN });
      code(668, 70, 'v1.count     → 2', fade(u, 1.6), { fill: ACC });
      code(668, 100, 'Vector.count → 2', fade(u, 2.0), { fill: ACC });
      say(690, 390, '속성 찾기: 인스턴스 → 클래스', fade(u, 2.2), { 'font-size': 14 }); } }

  // =========================================================
  // 2. 어떤 문법이 __str__ 로, 어떤 문법이 __repr__ 로 가나
  // =========================================================
  const CALLS = ['print(v)', 'str(v)', 'repr(v)', '[v]  (리스트 출력)', 'f"{v}"', 'f"{v!r}"'];
  const CLBL = { '[v]  (리스트 출력)': 'print([v])' };
  const RY = (i) => 62 + i * 60, SLOT = { STR: [445, 140], REPR: [445, 245], OBJ: [445, 368] };
  function s2(t, c) { const { k, u } = c, rows = c.beat.mapping.rows, prev = (c.prev && c.prev.mapping.rows) || [];
    const hasRepr = k >= 1, hasStr = k >= 2;
    zone(335, 86, 220, 216, 'class Vector', { op: 1 });
    const slot = (key, name, has, a) => { const [x, y] = SLOT[key], s = has ? (c.k === a ? pop(u, 0.2) : 1) : 1;
      if (has) card(x, y, 190, 46, { rx: 8, text: name, fs: 16, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s });
      else card(x, y, 190, 46, { rx: 8, text: name + ' 없음', fs: 14.5, mono: true, stroke: OFF, color: OFF, dash: '6 5', fw: 600 }); };
    slot('STR', '__str__', hasStr, 2); slot('REPR', '__repr__', hasRepr, 1);
    card(SLOT.OBJ[0], SLOT.OBJ[1], 220, 40, { rx: 8, text: 'object 기본 __repr__', fs: 14, stroke: k === 0 ? BAD : GRID, color: k === 0 ? BAD : MUT, sw: 1.6 });
    let j = 0;
    rows.forEach((r) => { const i = CALLS.indexOf(r.call); if (i < 0) return; const y = RY(i);
      const pv = prev.find((q) => q.call === r.call), fresh = !pv || pv.arrow !== r.arrow || pv.out !== r.out;
      const a0 = fresh ? 0.3 + (j++) * 0.75 : -9, op = fresh ? 1 : 0.4;
      const key = r.arrow.includes('기본') ? 'OBJ' : r.arrow.includes('__str__') ? 'STR' : 'REPR', [sx, sy] = SLOT[key];
      const col = r.tone === 'bad' ? BAD : r.tone === 'info' ? INFO : ACC;
      pill(120, y, CLBL[r.call] || r.call, INK, fresh && !pv ? pop(u, a0 - 0.1) : 1, { mono: true, fs: 14.5 });
      const u1 = fresh ? E(u, a0, a0 + 0.4) : 1, u2 = fresh ? E(u, a0 + 0.4, a0 + 0.7) : 1;
      if (key === 'REPR' && r.call === 'print(v)' && !hasStr) {   // __str__ 이 없어 __repr__ 로 폴백
        arrow(185, y, SLOT.STR[0] - 98, SLOT.STR[1], u1, OFF, { dash: '5 5', op });
        arrow(SLOT.STR[0] + 70, SLOT.STR[1] + 24, SLOT.REPR[0] + 70, SLOT.REPR[1] - 24, fresh ? E(u, a0 + 0.4, a0 + 0.8) : 1, WARN, { op });
        mono(SLOT.REPR[0] + 82, (SLOT.STR[1] + SLOT.REPR[1]) / 2 + 5, '폴백', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: op * (fresh ? fade(u, a0 + 0.7) : 1) });
      } else arrow(185, y, sx - 98, sy, u1, col, { op });
      arrow(sx + 98, sy, 598, y, fresh ? E(u, a0 + 0.6, a0 + 0.9) : u2, col, { op });
      code(606, y + 5, r.out, op * (fresh ? fade(u, a0 + 0.85) : 1), { fill: r.tone === 'bad' ? BAD : INK, 'font-size': 14.5 });
      if (fresh) dot([[185, y], [sx - 98, sy], [sx + 98, sy], [598, y]], seg(u, a0, a0 + 0.9), col, 6); }); }

  // =========================================================
  // 3. == 는 __eq__, set·dict 는 __hash__ 로 칸을 고른 뒤 __eq__ 로 확인
  // =========================================================
  const HASH = '1079245023883434373';   // python 3.12: hash((3, 4))
  const TB = { x0: 300, y: 336, w: 54, gap: 6 }, bucket = (i) => TB.x0 + i * (TB.w + TB.gap) + TB.w / 2;
  function s3(t, c) { const { k, u } = c;
    const A = obj(150, 46, 210, 'a', [{ k: 'x', v: '3' }, { k: 'y', v: '4' }], { tag: 'id ①', s: pp(c, 0, 0.1) });
    const B = obj(150, 196, 210, 'b', [{ k: 'x', v: '3' }, { k: 'y', v: '4' }], { tag: 'id ②', s: pp(c, 0, 0.2) });
    const eqv = k === 0 ? ['a is b 와 같음', MUT] : ['필드 비교', ACC];
    const hv = k === 0 ? ['id 기반', MUT] : k === 1 ? (u < 1.7 ? ['id 기반', MUT] : ['None', BAD]) : ['hash((x, y))', ACC];
    obj(790, 40, 300, 'class Vector', [
      { k: '__eq__', v: eqv[0], vcol: eqv[1], vb: true, hot: k === 1 && u < 1.6 ? true : null },
      { k: '__hash__', v: hv[0], vcol: hv[1], vb: true, hot: (k === 1 && u >= 1.7) ? BADBG : (k === 2 && u < 1.2) ? true : null }]);
    if (k >= 2) { const lab = k === 4 ? 'set 내부 해시표 · 8칸' : k === 5 ? 'dict 내부 해시표 · 8칸' : 'set·dict 가 쓰는 해시표 · 8칸', hit = k === 2 ? u > 2.1 : k >= 4;
      tx(TB.x0, TB.y - 10, lab, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: at(c, 2, 1.5) });
      const vals = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i === 5 && ((k === 4 && u > 1.0) || k === 5) ? 'a' : ''));
      cells(TB.x0, TB.y, vals, { w: TB.w, h: 44, gap: TB.gap, index: true, style: (i) => ({ op: at(c, 2, 1.5), stroke: i === 5 && hit ? ACC : GRID, fill: i === 5 && hit ? ACCBG : null, sw: i === 5 && hit ? 2.6 : 1.5, color: ACC }) }); }
    const X = 470;
    if (k === 0) { pill(X, 80, 'a == b', INK, pop(u, 0.2), { mono: true, fs: 16 });
      say(X, 124, '기본 == 는 같은 객체인지만 묻는다', fade(u, 0.6), { 'font-size': 14, fill: MUT });
      code(X, 178, 'id ①   vs   id ②', fade(u, 1.0), { 'text-anchor': 'middle', 'font-size': 18 });
      code(X, 230, 'False', pop(u, 1.6) > 0 ? 1 : 0, { 'text-anchor': 'middle', 'font-size': 24, fill: BAD });
      say(X, 280, 'hash(a) 는 id 기반 해시라 쓸 수 있다', fade(u, 2.1), { 'font-size': 14, fill: MUT }); }
    if (k === 1) { pill(X, 70, 'a == b', INK, 1, { mono: true, fs: 16 });
      fly(A.right, A.top + 50, X - 70, 140, seg(u, 0.3, 0.9), '(3, 4)', { mono: true, stay: true, fill: INK });
      fly(B.right, B.top + 50, X + 70, 140, seg(u, 0.4, 1.0), '(3, 4)', { mono: true, stay: true, fill: INK });
      code(X, 146, '==', fade(u, 1.0), { 'text-anchor': 'middle', 'font-size': 17 });
      code(X, 196, 'True', fade(u, 1.2), { 'text-anchor': 'middle', 'font-size': 24, fill: GOOD });
      code(X, 262, "hash(a) → TypeError: unhashable type: 'Vector'", fade(u, 1.9), { 'text-anchor': 'middle', 'font-size': 14, fill: BAD });
      cross(X, 296, 11, pop(u, 2.1)); }
    if (k === 2) { pill(X, 70, 'hash(a)', INK, pop(u, 0.2), { mono: true, fs: 16 });
      code(X, 122, '= hash((3, 4))', fade(u, 0.5), { 'text-anchor': 'middle' });
      code(X, 162, '= ' + HASH, fade(u, 0.9), { 'text-anchor': 'middle', fill: ACC });
      code(X, 202, '& 7  →  5번 칸', fade(u, 1.3), { 'text-anchor': 'middle' });
      arrow(X + 40, 214, bucket(5), TB.y - 4, E(u, 1.6, 2.1), ACC); }
    if (k === 3) { code(X, 80, 'a == b  → True', fade(u, 0.2), { 'text-anchor': 'middle', fill: GOOD });
      say(X, 106, '값을 묻는다 (__eq__)', fade(u, 0.4), { 'font-size': 14, fill: MUT });
      pill(X, 160, 'a is b', WARN, pop(u, 0.7), { mono: true, fs: 16 });
      arrow(X - 50, 150, A.right + 6, A.top + 18, E(u, 0.9, 1.4), WARN); arrow(X - 50, 170, B.right + 6, B.top + 18, E(u, 1.0, 1.5), WARN);
      code(X, 222, 'id ① ≠ id ②  → False', fade(u, 1.6), { 'text-anchor': 'middle', fill: BAD });
      say(X, 252, '객체 자체를 묻는다 · dunder로 못 바꾼다', fade(u, 2.0), { 'font-size': 14, fill: MUT }); }
    if (k === 4) { pill(X, 70, '{a, b}', INK, pop(u, 0.2), { mono: true, fs: 16 });
      fly(A.right, A.top + 50, bucket(5), TB.y + 22, seg(u, 0.3, 1.0), 'a', { mono: true });
      fly(B.right, B.top + 50, bucket(5), TB.y - 30, seg(u, 1.1, 1.7), 'b', { mono: true, stay: u < 2.1 });
      if (u > 1.7) code(bucket(5) + 40, TB.y - 36, 'a == b → True', fade(u, 1.7), { 'font-size': 14, fill: WARN });
      cross(bucket(5), TB.y - 30, 11, u > 2.1 ? pop(u, 2.1) : 0);
      code(X, 150, '{Vector(x=3, y=4)}', fade(u, 2.1), { 'text-anchor': 'middle', fill: GOOD });
      say(X, 182, '원소 1개 · 해시로 칸을 찾고 == 로 확인', fade(u, 2.3), { 'font-size': 14 }); }
    if (k === 5) { pill(X, 70, 'd = {a: "origin"};  d[b]', INK, 1, { mono: true, fs: 15 });
      code(bucket(5), TB.y - 18, '"origin"', fade(u, 0.2), { 'text-anchor': 'middle', 'font-size': 14, fill: ACC });
      dot([[B.right, B.top + 50], [bucket(5) - 40, TB.y - 40], [bucket(5), TB.y + 10]], seg(u, 0.5, 1.3), WARN, 7);
      code(X, 128, 'hash(b) & 7 → 5번 칸', fade(u, 0.7), { 'text-anchor': 'middle' });
      code(X, 166, '그 칸의 a 와 a == b → True', fade(u, 1.3), { 'text-anchor': 'middle' });
      code(X, 222, '→ "origin"', fade(u, 1.8), { 'text-anchor': 'middle', 'font-size': 20, fill: GOOD }); } }

  // =========================================================
  // 4. dunder 하나가 문법 하나를 연다 · + 는 새 객체를 만든다
  // =========================================================
  const LX = 433, CWD = 66;
  const cellX = (i) => LX + i * (CWD + 8) + CWD / 2;
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) {
      const P = obj(520, 34, 300, 'p', [{ k: '_coords', v: 'list ▼', vcol: MUT }], { tag: 'Path3D 객체' });
      arrow(LX + 14 + 107, P.bottom, LX + 107, 146, 1, OFF, { sw: 1.8 });
      const lit = (i) => (k === 1 && u > 1.0 && u < 1.8) || (k === 2 && i === 0 && u > 1.0) || (k === 3 && ((u > 0.2 + i * 0.4 && u < 0.6 + i * 0.4) || (i === 2 && u > 2.0)));
      cells(LX, 150, [10, 20, 30], { w: CWD, h: 46, gap: 8, index: true, style: (i) => ({ s: k === 0 ? pop(u, 0.2 + i * 0.12) : 1, stroke: lit(i) ? ACC : INK, fill: lit(i) ? ACCBG : null, sw: lit(i) ? 3 : 2 }) });
      const CS = obj(820, 34, 220, 'class Path3D', [
        { k: '__len__', v: '', op: at(c, 1, 0.2) }, { k: '__getitem__', v: '', op: at(c, 2, 0.2) }], {});
      [['len(p)', 120], ['p[0]', 180], ['for c in p', 240], ['p[-1]', 300]].forEach(([s, y], i) => pill(100, y, s, INK, i < 2 ? pp(c, 0, 0.3 + i * 0.2) : pp(c, 3, 0.1 + (i - 2) * 1.8), { mono: true, fs: 15 }));
      const res = (y, s, col, op) => code(168, y + 5, s, op, { fill: col, 'font-size': 14.5 });
      res(120, k >= 1 ? '→ 3' : 'TypeError: has no len()', k >= 1 ? GOOD : BAD, k === 0 ? fade(u, 0.9) : k === 1 ? fade(u, 1.7) : 1);
      res(180, k >= 2 ? '→ 10' : 'TypeError: not subscriptable', k >= 2 ? GOOD : BAD, k === 0 ? fade(u, 1.3) : k === 2 ? fade(u, 1.7) : 1);
      if (k < 3) say(cellX(1), 300, ['dunder 가 없으면 문법이 닫혀 있다', '__len__ 이 0을 돌려주면 if p 는 False', '음수 인덱스·슬라이싱은 리스트가 처리한다'][k], fade(u, 1.9), { 'font-size': 14, fill: MUT });
      if (k === 1) dot([[150, 120], [CS.left, CS.rowY(0)], [cellX(1), 196]], seg(u, 0.3, 1.1), ACC, 6);
      if (k === 2) dot([[130, 180], [CS.left, CS.rowY(1)], [cellX(0), 196]], seg(u, 0.3, 1.1), ACC, 6);
      if (k === 3) { const i = Math.min(3, Math.floor(clamp((u - 0.2) / 0.4, 0, 3.99))), px = LX + i * (CWD + 8) + CWD / 2, bad = i === 3;
        if (u > 0.2 && u < 2.0) { el('path', { d: `M${px},${222} l-9,14 l18,0 z`, fill: bad ? BAD : ACC });
          code(px, 256, 'p[' + i + ']', 1, { 'text-anchor': 'middle', fill: bad ? BAD : ACC, 'font-size': 14.5 }); }
        if (bad && u < 2.0) { el('rect', { x: LX + 3 * (CWD + 8), y: 150, width: CWD, height: 46, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
          code(LX + 3 * (CWD + 8) + CWD + 10, 178, 'IndexError → 반복 끝', 1, { fill: BAD, 'font-size': 14 }); }
        const got = [10, 20, 30].slice(0, Math.min(3, Math.floor(clamp((u - 0.4) / 0.4, 0, 3))));
        res(240, '→ [' + got.join(', ') + (got.length === 3 ? ']' : ''), ACC, u > 0.4 ? 1 : 0);
        res(300, '→ 30', ACC, fade(u, 2.1));
        say(cellX(1), 300, '__getitem__을 0, 1, 2 … 로 부른다', fade(u, 2.2), { 'font-size': 14, fill: MUT }); }
      return; }
    // k4~5: Vector 의 + (평면 위 화살표)
    const A = obj(150, 46, 200, 'a', [{ k: 'x', v: '3' }, { k: 'y', v: '4' }], { s: pp(c, 4, 0.1), stroke: INFO, hcol: INFO });
    const Bb = obj(150, 172, 200, 'b', [{ k: 'x', v: '1' }, { k: 'y', v: '2' }], { s: pp(c, 4, 0.2), stroke: WARN, hcol: WARN });
    pill(380, 66, 'a + b', INK, pp(c, 4, 0.7), { mono: true, fs: 16 });
    code(380, 118, '→ a.__add__(b)', at(c, 4, 1.0), { 'text-anchor': 'middle' });
    code(380, 158, '→ Vector(3+1, 4+2)', at(c, 4, 1.4), { 'text-anchor': 'middle' });
    obj(380, 186, 190, '새 객체', [{ k: 'x', v: '4', vb: true }, { k: 'y', v: '6', vb: true }], { s: pp(c, 4, 1.9), stroke: ACC, hcol: ACC });
    const ax = axes(590, 46, 300, 300, { x: [0, 7], y: [0, 7], xt: [0, 2, 4, 6], yt: [2, 4, 6], grid: true });
    const vec = (x0, y0, x1, y1, uu, col, sw) => arrow(ax.X(x0), ax.Y(y0), ax.X(x1), ax.Y(y1), uu, col, { sw: sw || 3, hs: 13 });
    vec(0, 0, 3, 4, at(c, 4, 0.3), INFO); vec(0, 0, 1, 2, at(c, 4, 0.5), WARN);
    code(ax.X(3) - 8, ax.Y(4) - 10, 'a', at(c, 4, 0.8), { fill: INFO, 'text-anchor': 'end' });
    if (k === 5) { const m = E(u, 0.2, 1.0); vec(3 * m, 4 * m, 3 * m + 1, 4 * m + 2, u > 0.2 ? 1 : 0, WARN);
      vec(0, 0, 4, 6, E(u, 1.0, 1.7), ACC, 3.4);
      code(ax.X(4) + 12, ax.Y(6) + 4, '(4, 6)', fade(u, 1.7), { fill: ACC });
      check(262, 72, 10, pop(u, 2.0)); check(262, 198, 10, pop(u, 2.1));
      say(150, 312, 'a, b 는 그대로', fade(u, 2.1), { fill: GOOD }); }
    else code(ax.X(1) + 10, ax.Y(2) + 4, 'b', at(c, 4, 0.9), { fill: WARN }); }

  // =========================================================
  // 5. 첫 인자를 누가 채우나 — self · cls · 없음
  // =========================================================
  function strip(c, y, call, params, res, a0, o) { o = o || {}; const { k, u } = c, now0 = (d) => (k === o.k ? E(u, a0 + d, a0 + d + 0.4) : 1);
    pill(150, y, call, INK, k === o.k ? pop(u, a0) : 1, { mono: true, fs: 15 });
    arrow(150 + tw(call, 15) / 2 + 18, y, 300, y, now0(0.2), MUT);
    params.forEach(([name, val, col, from], i) => { const cx = 380 + i * 150, op = now0(0.4 + i * 0.2);
      sub(cx, y - 32, name, op, { 'font-weight': 700, fill: col || MUT, class: 'mono', 'font-size': 14 });
      card(cx, y, 136, 42, { rx: 8, text: val, fs: 15, mono: true, stroke: col || INK, color: col || INK, op, dash: o.ghost === i ? '5 5' : null });
      if (from) arrow(from[0], from[1], cx, y - 46, now0(0.5 + i * 0.2), col || ACC, { dash: '5 4', sw: 1.8 }); });
    if (res) { const rx = 380 + params.length * 150 - 40; arrow(rx - 20, y, rx + 20, y, now0(0.9), MUT);
      code(rx + 30, y + 5, res, now0(1.1), { fill: o.rcol || ACC }); } }
  function s5(t, c) { const { k, u } = c;
    const xv = k === 3 && u > 2.0 ? '5' : '3', renew = k === 4 ? (u < 1.9 ? 0 : pop(u, 1.9)) : 1;
    const V = obj(170, 56, 230, k >= 4 ? 'v  (새 객체)' : 'v', [{ k: '_x', v: k === 4 && u < 1.9 ? '5' : xv, vb: true, hot: k === 3 && u > 2.0 ? true : null }, { k: 'y', v: '4', vb: true }], { tag: 'Vector 객체', s: k === 4 ? (u < 1.5 ? 1 - E(u, 1.2, 1.5) : renew) : pp(c, 0, 0.1) });
    const CL = obj(670, 36, 440, 'class Vector', [
      { k: 'magnitude', v: '@property', op: at(c, 1, 0.2), vcol: INFO, hot: k === 1 && u < 1.4 ? true : null },
      { k: 'x', v: k >= 3 ? '@property + @x.setter' : '@property', op: at(c, 2, 0.2), vcol: INFO, hot: (k === 2 || k === 3) && u < 1.4 ? true : null },
      { k: 'from_tuple', v: '@classmethod', op: at(c, 4, 0.2), vcol: WARN, hot: k === 4 && u < 1.4 ? true : null },
      { k: 'dot', v: '@staticmethod', op: at(c, 5, 0.2), vcol: MUT, hot: k === 5 && u < 1.4 ? true : null }], {});
    const SELF = [V.left + 115, V.bottom + 2], CLS = [CL.left + 60, CL.bottom + 2];
    if (k === 0) { strip(c, 300, 'v._x', [], null, 0.4, { k: 0 }); code(300, 305, '→ 3', fade(u, 1.0), { fill: INK });
      say(560, 300, '밑줄은 관례일 뿐 · "밖에서 만지지 말라"는 신호', fade(u, 1.4), { 'font-size': 14, fill: MUT }); }
    if (k === 1) strip(c, 300, 'v.magnitude', [['self', 'v', INFO, SELF], ['계산', 'hypot(3, 4)', INK]], '5.0', 0.6, { k: 1 });
    if (k === 2) strip(c, 300, 'v.x', [['self', 'v', INFO, SELF], ['돌려줌', 'self._x', INK]], '3', 0.6, { k: 2 });
    if (k === 3) { strip(c, 280, 'v.x = -1', [['self', 'v', INFO, SELF], ['value', '-1', BAD]], 'ValueError', 0.3, { k: 3, rcol: BAD });
      strip(c, 372, 'v.x = 5', [['self', 'v', INFO], ['value', '5', GOOD]], '_x = 5', 1.1, { k: 3, rcol: GOOD }); }
    if (k === 4) strip(c, 300, 'Vector.from_tuple((3, 4))', [['cls', 'Vector', WARN, CLS], ['t', '(3, 4)', INK]], 'cls(3, 4)', 0.4, { k: 4 });
    if (k === 5) { strip(c, 300, 'Vector.dot(a, b)', [['자동 첫 인자', '없음', OFF], ['a', 'a', INK], ['b', 'b', INK]], null, 0.4, { k: 5, ghost: 0 });
      say(480, 380, 'self도 cls도 받지 않는 함수 · 클래스 이름 아래 묶어 둘 뿐', fade(u, 1.8), { 'font-size': 14, fill: MUT }); }
    if (k === 6) { strip(c, 280, 'v.magnitude', [['self', 'v', INFO, SELF]], '5.0', 0.2, { k: 6 });
      strip(c, 372, 'Vector.dot(v, v)', [['a', 'v', INK], ['b', 'v', INK]], '3·3 + 4·4 = 25', 1.0, { k: 6 }); } }

  // =========================================================
  // 6. 실무 함정 3종 — 주소만 찍힘 · unhashable · 공유 리스트
  // =========================================================
  function chips(c) { const { k, u } = c;
    [['① __repr__ 누락', 0], ['② __hash__ 누락', 1], ['③ 클래스 속성 공유', 2]].forEach(([s, i]) => {
      const fixed = k >= 3 && i < 2 && (k > 3 || u > 2.2), cur = i === k;
      pill(170 + i * 310, 30, s, fixed ? GOOD : cur ? BAD : MUT, 1, { fs: 14, fill: fixed ? GOODBG : cur ? BADBG : null }); }); }
  function s6(t, c) { const { k, u } = c; chips(c);
    if (k === 0) { obj(150, 80, 200, 'Bad1(1)', [{ k: 'x', v: '1', vb: true }], { s: pop(u, 0.2) }); obj(150, 180, 200, 'Bad1(2)', [{ k: 'x', v: '2', vb: true }], { s: pop(u, 0.35) });
      terminal(300, 80, 630, 160, ['>>> print([Bad1(1), Bad1(2)])', ['[<__main__.Bad1 object at 0x…>,', '#fca5a5'], [' <__main__.Bad1 object at 0x…>]', '#fca5a5']], lerp(0, 3, E(u, 0.5, 1.7)), { fs: 15, lh: 30 });
      say(480, 300, '값 1과 2는 객체 안에 있는데 출력에는 주소만 나온다', fade(u, 1.8), { 'font-size': 14.5 });
      code(480, 352, '__repr__ 를 넣으면 → [Vec(x=1), Vec(x=2)]', fade(u, 2.3), { 'text-anchor': 'middle', fill: GOOD, 'font-size': 14.5 }); }
    if (k === 1) { obj(190, 80, 260, 'class Bad2', [{ k: '__eq__', v: '정의함', vcol: GOOD, vb: true }, { k: '__hash__', v: 'None', vcol: BAD, vb: true, hot: BADBG }], { s: pop(u, 0.2) });
      card(190, 250, 130, 40, { rx: 8, text: 'Bad2(1)', mono: true, fs: 15, op: u < 0.5 || u > 1.4 ? 1 : 0.3 });
      const x0 = 430; tx(x0, 212, '{Bad2(1)} · set 해시표', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      cells(x0, 222, ['', '', '', '', '', '', '', ''], { w: 52, h: 40, gap: 6, style: () => ({ stroke: GRID, sw: 1.5 }) });
      fly(255, 250, 600, 242, seg(u, 0.5, 1.2), 'Bad2(1)', { mono: true, fill: BAD });
      cross(600, 242, 13, u > 1.2 ? pop(u, 1.2) : 0);
      code(670, 310, "TypeError: unhashable type: 'Bad2'", fade(u, 1.4), { 'text-anchor': 'middle', fill: BAD, 'font-size': 14.5 });
      say(670, 345, '선언할 때는 조용하다가 set 에 넣는 순간 터진다', fade(u, 1.9), { 'font-size': 14 });
      code(480, 392, '고침: __hash__ = hash(필드 튜플) · 또는 @dataclass(frozen=True)', fade(u, 2.3), { 'text-anchor': 'middle', fill: GOOD, 'font-size': 14 }); }
    if (k === 2) { const CL = obj(480, 74, 240, 'class Bad3', [{ k: 'tags', v: '→ list', vcol: MUT }], { s: pop(u, 0.1) });
      const filled = u > 1.3; el('rect', { x: 690, y: 92, width: 150, height: 34, rx: 6, fill: filled ? BADBG : SOFT, stroke: filled ? BAD : INK, 'stroke-width': 2 });
      code(765, 115, filled ? '["a"]' : '[ ]', 1, { 'text-anchor': 'middle', fill: filled ? BAD : INK });
      sub(765, 146, '리스트는 하나뿐', 1, { 'font-weight': 700 });
      arrow(CL.right, CL.rowY(0), 688, 109, 1, OFF, { sw: 1.8 });
      const B1 = obj(200, 244, 200, 'b1', [{ k: '__dict__', v: '{}', vcol: MUT }], { tag: 'Bad3 객체' }), B2 = obj(760, 244, 200, 'b2', [{ k: '__dict__', v: '{}', vcol: MUT }], { tag: 'Bad3 객체' });
      arrow(250, 244, 400, CL.bottom + 2, 1, OFF, { dash: '4 5', sw: 1.8 }); arrow(710, 244, 560, CL.bottom + 2, 1, OFF, { dash: '4 5', sw: 1.8 });
      pill(200, 350, 'b1.tags.append("a")', INK, pop(u, 0.2), { mono: true, fs: 14.5 });
      dot([[200, 336], [250, 290], [400, CL.bottom], [CL.right - 30, CL.rowY(0)], [690, 109]], seg(u, 0.3, 1.3), ACC, 7);
      pill(760, 350, 'b2.tags', INK, pop(u, 1.4), { mono: true, fs: 14.5 });
      dot([[760, 336], [710, 290], [560, CL.bottom], [CL.right - 30, CL.rowY(0)], [690, 109]], seg(u, 1.5, 2.2), WARN, 7);
      code(760, 396, '→ ["a"]  b2도 바뀜', fade(u, 2.2), { 'text-anchor': 'middle', fill: BAD, 'font-size': 14.5 });
      code(480, 214, '고침: __init__ 안에서 self.tags = []', fade(u, 2.5), { 'text-anchor': 'middle', fill: GOOD, 'font-size': 14.5 }); }
    if (k === 3) { snippet(40, 96, ['@dataclass(frozen=True)', 'class Good:', '    x: int', '    y: int'], { fs: 15, op: fade(u, 0.1) });
      arrow(320, 150, 520, 150, E(u, 0.5, 0.9), ACC);
      obj(720, 74, 360, 'class Good', ['__init__', '__repr__', '__eq__', '__hash__'].map((s, i) => ({ k: s, v: '자동 생성', vcol: GOOD, vb: true, op: fade(u, 0.9 + i * 0.3) })), { stroke: GOOD, hcol: GOOD });
      say(480, 300, '필드만 적으면 ①②를 한 번에 막는다', fade(u, 2.2), { 'font-size': 15 });
      say(480, 330, 'frozen=True 라서 __hash__ 까지 만들어 준다', fade(u, 2.4), { 'font-size': 14, fill: MUT }); }
    if (k === 4) { terminal(30, 76, 520, 190, ['>>> print(Good(3, 4))', ['Good(x=3, y=4)', '#86efac'], '>>> print({Good(3, 4), Good(3, 4)})', ['{Good(x=3, y=4)}', '#86efac']], lerp(0, 4, E(u, 0.2, 2.0)), { fs: 15, lh: 30 });
      const x0 = 595, w = 38, g = 5, b5 = x0 + 5 * (w + g) + w / 2; tx(x0, 132, 'set 해시표 · 8칸', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      cells(x0, 142, ['', '', '', '', '', u > 1.5 ? 'G' : '', '', ''], { w, h: 40, gap: g, style: (i) => ({ stroke: i === 5 && u > 1.5 ? ACC : GRID, fill: i === 5 && u > 1.5 ? ACCBG : null, sw: 1.5, color: ACC }) });
      fly(700, 260, b5, 162, seg(u, 0.9, 1.5), 'Good(3, 4)', { mono: true });
      fly(820, 260, b5, 120, seg(u, 1.5, 2.1), 'Good(3, 4)', { mono: true, stay: u < 2.3 });
      cross(b5, 120, 10, u > 2.3 ? pop(u, 2.3) : 0);
      code(760, 236, 'hash 같음 · == True → 하나로', fade(u, 2.2), { 'text-anchor': 'middle', fill: GOOD, 'font-size': 14 });
      say(480, 330, '__repr__·__eq__·__hash__ 가 모두 제대로 동작한다', fade(u, 2.4), { 'font-size': 15 }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'v1, v2를 만든 뒤 v1.count를 읽으면 2가 나온다. 그 이유는 무엇인가?',
      o: ['__init__이 count를 v1에 복사해 두었기 때문이다', 'v1에 count가 없어서 클래스 Vector에서 찾아오기 때문이다', 'v1.count는 v2.count를 가리키기 때문이다'], a: 1,
      why: '속성 찾기는 인스턴스에서 먼저, 없으면 클래스로 올라간다. count는 Vector 한 곳에만 있고 그 값이 2다.' },
    { q: '__repr__만 만들고 __str__은 없을 때 print(v)가 찍는 것은 무엇인가?',
      o: ['<__main__.Vector object at 0x…>', '아무것도 찍지 않는다', 'Vector(x=3, y=4)'], a: 2,
      why: 'print는 __str__을 먼저 찾고 없으면 __repr__로 폴백한다. 반대 방향 폴백은 없다.' },
    { q: '__eq__만 정의한 Vector를 set에 넣으면 어떻게 되는가?',
      o: ['TypeError: unhashable type이 난다', '값이 같은 것끼리 하나로 합쳐진다', '주소가 달라 둘 다 들어간다'], a: 0,
      why: '__eq__를 정의하면 파이썬이 __hash__를 None으로 덮는다. set은 해시로 칸을 고르므로 넣는 순간 TypeError다.' },
    { q: 'Vector(3, 4) + Vector(1, 2)에서 __add__가 지켜야 할 관례는 무엇인가?',
      o: ['self의 x, y를 고쳐 a를 결과로 만든다', '새 Vector(4, 6)을 만들어 돌려준다', '더한 값을 출력만 하고 None을 돌려준다'], a: 1,
      why: '+는 원본을 바꾸지 않아야 수학처럼 예측할 수 있다. 결과는 새 객체로 돌려주고 a, b는 그대로 둔다.' },
    { q: 'Vector.from_tuple((3, 4))를 부를 때 첫 인자 cls에 들어가는 것은 무엇인가?',
      o: ['Vector 클래스 자체', '새로 만들어질 인스턴스', '튜플 (3, 4)'], a: 0,
      why: '@classmethod는 첫 인자로 클래스를 받는다. 그래서 cls(3, 4)로 만들면 자식 클래스에서 불러도 자식 타입이 나온다.' },
    { q: 'class 본문에 tags = []를 둔 Bad3에서 b1.tags.append("a") 뒤 b2.tags도 ["a"]가 된다. 왜 그런가?',
      o: ['append가 모든 인스턴스에 값을 복사하기 때문이다', 'b2가 b1의 복사본이기 때문이다', 'b1, b2 모두 클래스에 있는 리스트 하나를 보기 때문이다'], a: 2,
      why: 'b1, b2의 __dict__에는 tags가 없어 둘 다 클래스의 같은 리스트를 찾아간다. 객체마다 따로 두려면 __init__에서 self.tags = []로 만든다.' },
  ];

  const summary = [
    'self.x는 인스턴스마다 따로 있고, class 본문의 count는 클래스 한 곳에 있어 모든 인스턴스가 함께 본다.',
    'print와 str은 __str__을, repr과 리스트 출력은 __repr__을 부른다. 하나만 만든다면 __repr__이다.',
    '__eq__를 정의하면 __hash__가 None이 된다. set이나 dict 키로 쓰려면 같은 필드로 __hash__를 함께 만든다.',
    '@property는 계산된 속성, @classmethod는 cls를 받는 대안 생성자, @staticmethod는 묶어 둔 일반 함수다.',
  ];
  const review = [
    { q: '로그에 [<__main__.Order object at 0x…>]만 찍혀 원인을 못 찾고 있다. 가장 먼저 할 일은?',
      o: ['Order에 __str__만 정의한다', 'Order에 __repr__을 정의한다', 'print 대신 str()로 감싸 찍는다'], a: 1,
      why: '리스트 안의 객체는 __str__이 아니라 __repr__로 찍힌다. __repr__을 만들면 print, 리스트, 디버거 모두에서 값이 보인다.' },
    { q: 'Point에 __eq__를 넣었더니 다른 모듈의 set(points)가 TypeError로 죽었다. 알맞은 고침은?',
      o: ['__eq__를 다시 지운다', 'set 대신 list에 담는다', '__eq__와 같은 필드로 __hash__를 만든다'], a: 2,
      why: '__eq__만 있으면 __hash__가 None이라 set에 못 넣는다. 같은 필드로 __hash__를 만들거나 @dataclass(frozen=True)를 쓰면 값 비교와 set이 함께 된다.' },
    { q: 'Box에 클래스 속성 items = []를 두고 @classmethod from_list로 객체를 만들었더니 모든 Box의 items가 같이 바뀐다. 원인은?',
      o: ['items가 클래스에 하나뿐이라 모든 객체가 같은 리스트를 봐서', 'classmethod가 self 대신 cls를 받아서', 'from_list 안에서 Box 이름을 직접 써서'], a: 0,
      why: '어떤 생성자로 만들든 인스턴스에 items가 없으면 클래스의 리스트 하나를 함께 본다. __init__에서 self.items = []로 객체마다 만들어야 한다.' },
  ];

  R.page({ title: '객체와 dunder 들여다보기', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
