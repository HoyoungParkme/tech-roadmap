/* II-1-2 상속 vs 컴포지션 — 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, dot, fly, cells, zone, cross, check, terminal, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c, j, a = 0.2, d = 0.6) => (c.k > j ? 1 : c.k === j ? E(c.u, a, a + d) : 0);
  const pp = (c, j, a = 0.2) => (c.k > j ? 1 : c.k === j ? pop(c.u, a) : 0);

  // 파이썬 객체·클래스 상자: 머리 + 이름공간 줄. rows [{k, v, op, hot, kcol, vcol, dash}]
  function obj(cx, top, w, head, rows, o) { o = o || {}; const rh = 30, h = 36 + rows.length * rh + 6, g = R.G(cx, top, o.s ?? 1, o.op ?? 1), col = o.stroke || INK;
    el('rect', { x: -w / 2, y: 0, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    el('line', { x1: -w / 2, y1: 33, x2: w / 2, y2: 33, stroke: col, 'stroke-width': 1.2, opacity: 0.45 }, g);
    tx(-w / 2 + 12, 23, head, { 'font-size': 15, 'font-weight': 700, fill: o.hcol || col, class: 'mono' }, g);
    if (o.tag) tx(w / 2 - 12, 23, o.tag, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }, g);
    rows.forEach((r, i) => { const y = 36 + i * rh, op = r.op ?? 1; if (op <= 0) return;
      if (r.hot) el('rect', { x: -w / 2 + 5, y: y + 1, width: w - 10, height: rh - 3, rx: 6, fill: r.hot === true ? ACCBG : r.hot, opacity: op }, g);
      if (r.dash) el('rect', { x: -w / 2 + 5, y: y + 1, width: w - 10, height: rh - 3, rx: 6, fill: 'none', stroke: r.dash, 'stroke-dasharray': '5 4', 'stroke-width': 1.6, opacity: op }, g);
      mono(-w / 2 + 14, y + 20, r.k, { 'font-size': 14.5, 'font-weight': 700, fill: r.kcol || INK, opacity: op }, g);
      if (r.v) mono(w / 2 - 14, y + 20, r.v, { 'font-size': 14.5, fill: r.vcol || INK, 'text-anchor': 'end', 'font-weight': r.vb ? 700 : 400, opacity: op }, g); });
    return { top, h, bottom: top + h, left: cx - w / 2, right: cx + w / 2, cx, rowY: (i) => top + 36 + i * rh + 15 }; }
  function arrow(x1, y1, x2, y2, u, col, o) { if (u <= 0) return; o = o || {}; const x = lerp(x1, x2, u), y = lerp(y1, y2, u), c = col || MUT;
    el('line', { x1, y1, x2: x, y2: y, stroke: c, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    if (u > 0.92 && !o.plain) { const a = Math.atan2(y2 - y1, x2 - x1), L = o.hs || 10;
      el('path', { d: `M${x},${y} L${x - L * Math.cos(a - 0.42)},${y - L * Math.sin(a - 0.42)} L${x - L * Math.cos(a + 0.42)},${y - L * Math.sin(a + 0.42)} Z`, fill: c, opacity: o.op ?? 1 }); } }
  // 상속 화살표: 자식 → 부모, 끝에 속이 빈 삼각형 (UML)
  function inh(x1, y1, x2, y2, u, col) { if (u <= 0) return; const a = Math.atan2(y2 - y1, x2 - x1), L = 14, c = col || INK, ex = lerp(x1, x2 - Math.cos(a) * L, u), ey = lerp(y1, y2 - Math.sin(a) * L, u);
    el('line', { x1, y1, x2: ex, y2: ey, stroke: c, 'stroke-width': 2.2 });
    if (u > 0.92) el('path', { d: `M${x2},${y2} L${x2 - L * Math.cos(a - 0.5)},${y2 - L * Math.sin(a - 0.5)} L${x2 - L * Math.cos(a + 0.5)},${y2 - L * Math.sin(a + 0.5)} Z`, fill: PANEL, stroke: c, 'stroke-width': 2 }); }
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op }, a || {}));
  const code = (x, y, s, op, a) => mono(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op }, a || {}));

  // =========================================================
  // 1. is-a 계층과 오버라이드 — 같은 speak(), 다른 동작
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    const A = obj(480, 30, 300, 'class Animal', [{ k: 'name', v: '' }, { k: '__init__(name)', v: '' }, { k: 'speak()', v: '"..."', vcol: MUT, vb: true, hot: k === 0 && u > 1.0 ? true : null }], { s: pp(c, 0, 0.2) });
    const D = obj(250, 232, 230, 'class Dog(Animal)', [{ k: 'speak()', v: '"멍멍"', vb: true, vcol: ACC, hot: (k === 1 && u > 1.2) || (k === 4 && u > 0.6 && u < 1.4) ? true : null }], { s: pp(c, 1, 0.2) });
    const Ct = obj(710, 232, 230, 'class Cat(Animal)', [{ k: 'speak()', v: '"야옹"', vb: true, vcol: ACC, hot: (k === 2 && u > 1.2) || (k === 4 && u > 1.4 && u < 2.2) ? true : null }], { s: pp(c, 2, 0.2) });
    if (k >= 1) { inh(D.cx + 40, D.top, A.left + 70, A.bottom, at(c, 1, 0.5), INK); mono(330, 205, 'is-a', { 'font-size': 14, fill: MUT, opacity: at(c, 1, 0.9), 'text-anchor': 'end' });
      sub(D.cx, D.bottom + 22, 'name · __init__ 은 물려받는다', at(c, 1, 1.6), { 'font-size': 14 }); }
    if (k >= 2) { inh(Ct.cx - 40, Ct.top, A.right - 70, A.bottom, at(c, 2, 0.5), INK); mono(630, 205, 'is-a', { 'font-size': 14, fill: MUT, opacity: at(c, 2, 0.9) }); }
    if (k === 0) { pill(480, 250, 'Animal("동물").speak()', INK, pop(u, 0.5), { mono: true, fs: 15 });
      code(480, 300, '→ "..."', fade(u, 1.2), { 'text-anchor': 'middle', fill: MUT });
      say(480, 340, '자식이 채울 자리 · 아직 기본값뿐', fade(u, 1.7), { 'font-size': 14, fill: MUT }); }
    const call = (j, cx, s, r, box) => { if (k !== j) return; pill(cx, 372, s, INK, pop(u, 0.3), { mono: true, fs: 14.5 });
      dot([[cx, 356], [cx, box.rowY(0) + 10]], seg(u, 0.5, 1.2), ACC, 6); code(cx + tw(s, 14.5) / 2 + 22, 377, '→ ' + r, fade(u, 1.4), { fill: ACC }); };
    call(1, 220, 'Dog("바둑").speak()', '"멍멍"', D); call(2, 680, 'Cat("나비").speak()', '"야옹"', Ct);
    if (k >= 3) { const x0 = 330, ptr = k === 4 ? (u < 1.4 ? 0 : 1) : -1;
      code(x0 - 14, 378, 'animals', at(c, 3, 0.2), { 'text-anchor': 'end' });
      cells(x0, 354, ['Dog 바둑', 'Cat 나비'], { w: 140, h: 44, gap: 10, mono: false, fs: 15, style: (i) => ({ s: k === 3 ? pop(u, 0.4 + i * 0.3) : 1, stroke: i === ptr ? ACC : INK, fill: i === ptr ? ACCBG : null, sw: i === ptr ? 3 : 2 }) });
      if (k === 3) say(480, 336, '둘 다 Animal 이라 한 리스트에 담긴다', fade(u, 1.4), { 'font-size': 14, fill: MUT });
      if (k === 4) { dot([[x0 + 70, 354], [D.cx + 40, D.bottom]], seg(u, 0.3, 0.8), ACC, 6); dot([[x0 + 220, 354], [Ct.cx - 40, Ct.bottom]], seg(u, 1.1, 1.6), ACC, 6);
        code(780, 366, '바둑 멍멍', fade(u, 0.9), { fill: ACC }); code(780, 394, '나비 야옹', fade(u, 1.7), { fill: ACC });
        code(110, 394, 'a.speak()', fade(u, 0.2), { 'text-anchor': 'middle' }); say(110, 366, 'if 분기 없음', fade(u, 2.1), { 'font-size': 14, fill: GOOD }); } } }

  // =========================================================
  // 2. super().__init__() — 호출 스택에 부모 프레임이 올라갔다 내려온다
  // =========================================================
  const ST = { x: 40, w: 300, y0: 336, fh: 50 };   // 스택: 바닥부터 위로
  function frame(i, s, args, o) { o = o || {}; const y = ST.y0 - i * (ST.fh + 8), op = o.op ?? 1;
    el('rect', { x: ST.x + 10, y, width: ST.w - 20, height: ST.fh, rx: 8, fill: o.fill || PANEL, stroke: o.col || INK, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: op });
    mono(ST.x + 24, y + 21, s, { 'font-size': 14.5, 'font-weight': 700, fill: o.col || INK, opacity: op }); mono(ST.x + 24, y + 41, args, { 'font-size': 13.5, fill: MUT, opacity: op }); return y; }
  function s2(t, c) { const { k, u } = c, bad = k >= 5;
    zone(ST.x, 50, ST.w, 350, '호출 스택 (위가 지금 실행 중)', {});
    const A = obj(780, 36, 290, 'class Animal', [{ k: '__init__(name)', v: 'self.name', vcol: ACC, hot: (k === 0 && u > 0.8) || (k === 2 && u > 0.4 && u < 1.8) ? true : null }], { s: pp(c, 0, 0.2) });
    const D = obj(780, 176, 290, bad ? 'class Bad(Animal)' : 'class Dog(Animal)', [{ k: '__init__(name, breed)', v: '', hot: k === 1 && u > 0.6 ? true : null }], { s: bad ? (k === 5 ? pop(u, 0.2) : 1) : pp(c, 1, 0.2), stroke: bad ? BAD : INK, hcol: bad ? BAD : INK });
    if (k >= 1) inh(780, D.top, 780, A.bottom, at(c, 1, 0.5), INK);
    if (k === 0) { say(480, 250, 'Animal.__init__ 이 self.name 을 세팅한다', fade(u, 1.0), { 'font-size': 14.5 }); return; }
    if (k === 1) { cross(780, (A.bottom + D.top) / 2, 11, pop(u, 1.4)); say(800, (A.bottom + D.top) / 2 + 5, '자동 호출 안 됨', fade(u, 1.5), { 'font-size': 14, fill: BAD, 'text-anchor': 'start' }); }
    // 스택과 객체
    const name = bad ? null : k >= 3 || (k === 2 && u > 1.4) ? '"바둑"' : null, breed = k >= 4 || (k === 3 && u > 0.8) || bad ? '"진돗개"' : null;
    const objOp = k === 1 ? fade(u, 0.9) : 1, ob = bad ? 'b' : 'd';
    if (k <= 3 || bad) { const fy = frame(0, bad ? 'Bad.__init__' : 'Dog.__init__', 'self, name, breed', { op: k === 1 ? fade(u, 0.3) : k === 5 ? fade(u, 0.3) : 1, col: bad ? BAD : INK, fill: (k === 3 || k === 5) ? ACCBG : null });
      if (!bad && k === 2) { const lift = E(u, 0.2, 0.6), op2 = u < 1.9 ? lift : 1 - E(u, 1.9, 2.3);
        if (op2 > 0) frame(1, 'Animal.__init__', 'self, name="바둑"', { op: op2, col: ACC, fill: ACCBG });
        mono(ST.x + ST.w - 16, fy - 18, 'super()', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 0.2) * (1 - E(u, 1.9, 2.3)) }); }
      if (bad) { frame(1, 'Animal.__init__', 'super() 없음 · 칸이 빠졌다', { dash: '6 5', col: OFF, op: k === 5 ? fade(u, 0.8) : 1 }); } }
    if (k === 4) { frame(0, 'Dog.__init__', '끝 · 스택에서 빠졌다', { dash: '6 5', col: OFF, op: 1 - E(u, 0.2, 0.8) * 0.6 }); }
    const O = obj(480, 210, 220, ob, [{ k: 'name', v: name || (bad ? '없음' : ''), vb: true, vcol: name ? ACC : BAD, kcol: !name && bad ? OFF : INK, dash: !name && bad ? BAD : null, hot: k === 2 && u > 1.4 ? true : null },
      { k: 'breed', v: breed || '', vb: true, vcol: ACC, hot: k === 3 && u > 0.8 ? true : null }], { op: objOp, tag: bad ? 'Bad 객체' : 'Dog 객체' });
    if (k === 1) { pill(480, 160, 'Dog("바둑", "진돗개")', INK, pop(u, 0.2), { mono: true, fs: 14.5 }); say(480, 340, 'self 는 아직 비어 있다', fade(u, 1.8), { 'font-size': 14, fill: MUT }); }
    if (k === 2) arrow(ST.x + ST.w - 10, ST.y0 - 32, O.left - 4, O.rowY(0), E(u, 1.0, 1.4), ACC);
    if (k === 3) { arrow(ST.x + ST.w - 10, ST.y0 + 24, O.left - 4, O.rowY(1), E(u, 0.4, 0.8), ACC); say(480, 340, '부모 상태 위에 자식 속성을 얹는다', fade(u, 1.4), { 'font-size': 14 }); }
    if (k === 4) { code(480, 350, 'd.name, d.breed → 바둑 진돗개', fade(u, 1.0), { 'text-anchor': 'middle', fill: GOOD }); check(O.right + 22, O.top + 18, 11, pop(u, 1.4)); }
    if (k === 5) { arrow(ST.x + ST.w - 10, ST.y0 + 24, O.left - 4, O.rowY(1), E(u, 1.2, 1.6), ACC); say(480, 340, '오류 없이 객체가 만들어진다', fade(u, 1.9), { 'font-size': 14, fill: WARN }); }
    if (k === 6) { code(480, 340, 'b.breed → 진돗개', fade(u, 0.3), { 'text-anchor': 'middle', fill: GOOD });
      code(480, 372, 'b.name  → AttributeError', fade(u, 1.0), { 'text-anchor': 'middle', fill: BAD });
      say(480, 402, "'Bad' object has no attribute 'name'", fade(u, 1.6), { 'font-size': 14, fill: BAD, class: 'mono', 'font-weight': 600 }); } }

  // =========================================================
  // 3. 다이아몬드와 MRO — 한 줄로 세우고 앞에서부터 찾는다
  // =========================================================
  const N = { A: [300, 74], B: [150, 196], C: [450, 196], D: [300, 318] }, METH = { A: 'who() · root()', B: 'who()', C: 'who()', D: 'pass' };
  const SX = 640, SW = 140, sy = (i) => 62 + i * 52;
  function node(n, s, o) { o = o || {}; const [x, y] = N[n]; card(x, y, 170, 60, { rx: 10, s, stroke: o.col || INK, fill: o.fill, sw: o.sw || 2.2 });
    if (s > 0.5) { tx(x, y - 5, 'class ' + n, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: o.col || INK }); mono(x, y + 17, METH[n], { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); } }
  function s3(t, c) { const { k, u } = c, mro = c.beat.mro, order = mro.order, look = mro.lookup || [];
    const edge = (a, b, j) => { const [x1, y1] = N[a], [x2, y2] = N[b]; inh(x1 + (x2 - x1) * 0.18, y1 - 30, x2 - (x2 - x1) * 0.18, y2 + 30, at(c, j, 0.6), MUT); };
    if (k >= 1) { edge('B', 'A', 1); edge('C', 'A', 1); } if (k >= 2) { edge('D', 'B', 2); edge('D', 'C', 2); }
    const who = k === 4 ? (u > 1.4 ? 'B' : null) : null, rootHit = k === 5 && u > 2.0;
    node('A', pp(c, 0, 0.2), { col: rootHit ? GOOD : INK, fill: rootHit ? GOODBG : null });
    node('B', pp(c, 1, 0.2), { col: who === 'B' ? GOOD : INK, fill: who === 'B' ? GOODBG : null }); node('C', pp(c, 1, 0.4), { col: k === 4 && u > 1.4 ? OFF : INK });
    node('D', pp(c, 2, 0.2), { col: k >= 2 ? ACC : INK });
    if (k === 0) say(300, 150, '모든 클래스는 object 를 상속한다', fade(u, 1.2), { 'font-size': 14, fill: MUT });
    if (k === 2) say(300, 400, 'who() 는 B 것? C 것?', fade(u, 1.4), { fill: WARN });
    // 오른쪽: __mro__ 줄
    tx(SX, 40, k <= 1 ? (k === 0 ? 'A.__mro__' : 'B.__mro__') : 'D.__mro__', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    const shown = k === 3 ? Math.floor(lerp(1, 5.99, E(u, 0.3, 2.0))) : order.length;
    for (let i = 0; i < 5; i++) { const y = sy(i), has = i < order.length && i < shown, nm = has ? order[i] : (k === 2 ? '?' : '');
      if (!has && !(k === 2 && i < 5)) continue;
      const scan = (k === 4 && i <= 1 && u > 0.3 + i * 0.5) || (k === 5 && i <= 3 && u > 0.3 + i * 0.4), hit = (k === 4 && i === 1 && u > 0.8) || (k === 5 && i === 3 && u > 1.5) || (k === 6 && u > 0.4);
      card(SX + SW / 2, y + 20, SW, 40, { rx: 8, text: nm, mono: true, fs: 16, dash: has ? null : '5 5', stroke: hit ? GOOD : scan ? WARN : has ? INK : OFF, color: has ? INK : OFF, fill: hit ? GOODBG : null });
      if (i < 4 && has && i + 1 < shown) arrow(SX + SW / 2, y + 41, SX + SW / 2, y + 51, 1, OFF, { sw: 1.6, hs: 7 }); }
    if (k === 3) dot([N.D, N.B, N.C, N.A].map(([x, y]) => [x, y]), seg(u, 0.3, 2.0), ACC, 7);
    if (k === 3) say(300, 400, '공통 조상 A 는 자식들 뒤에 한 번만', fade(u, 2.1), { 'font-size': 14.5 });
    const R0 = SX + SW + 16;
    if (k === 1 && look[0]) code(R0, sy(0) + 26, 'who() ✓', fade(u, 1.2), { fill: GOOD, 'font-size': 14 });
    if (k === 4) { code(R0, sy(0) + 26, '없음', fade(u, 0.5), { fill: MUT, 'font-size': 14 }); code(R0, sy(1) + 26, 'who() ✓ "B"', fade(u, 1.0), { fill: GOOD, 'font-size': 14 });
      code(R0, sy(2) + 26, '안 봄', fade(u, 1.6), { fill: OFF, 'font-size': 14 }); say(300, 400, 'd.who() → "B" · 찾으면 멈춘다', fade(u, 1.9), { 'font-size': 14.5 }); }
    if (k === 5) { ['없음', '없음', '없음'].forEach((s, i) => code(R0, sy(i) + 26, s, fade(u, 0.5 + i * 0.4), { fill: MUT, 'font-size': 14 }));
      code(R0, sy(3) + 26, 'root() ✓', fade(u, 1.6), { fill: GOOD, 'font-size': 14 }); say(300, 400, 'd.root() → "root-A"', fade(u, 2.1), { 'font-size': 14.5, class: 'mono' }); }
    if (k === 6) { code(300, 384, 'isinstance(d, A)      → True', fade(u, 0.6), { 'text-anchor': 'middle', fill: GOOD, 'font-size': 14 });
      code(300, 408, 'isinstance(d, (B, C)) → True', fade(u, 1.2), { 'text-anchor': 'middle', fill: GOOD, 'font-size': 14 });
      say(R0 + 52, sy(5) - 6, 'MRO 전체가 d 의 타입', fade(u, 1.8), { 'font-size': 14 }); } }

  // =========================================================
  // 4. has-a — 참조 한 줄로 부품을 들고, 요청을 넘긴다
  // =========================================================
  function part(top, head, out, o) { o = o || {}; return obj(760, top, 270, head, [{ k: 'start()', v: out, vb: true, vcol: ACC, hot: o.hot ? true : null }], { s: o.s, op: o.op }); }
  function s4(t, c) { const { k, u } = c;
    const P1 = part(70, 'Engine', '"부릉"', { s: pp(c, 0, 0.2), hot: (k === 1 && u > 1.0) || (k === 3 && u > 0.9 && u < 1.6) || (k === 5 && u > 0.7 && u < 1.3) });
    const P2 = part(236, 'ElectricEngine', '"웅~"', { s: pp(c, 1, 0.2), hot: (k === 1 && u > 1.0) || (k === 5 && u > 1.7 && u < 2.3) });
    if (k === 0) { obj(230, 70, 270, '(주인 없음)', [], { dash: '6 5', stroke: OFF, hcol: OFF, op: fade(u, 0.8) }); say(760, 200, '혼자서도 말이 되는 부품', fade(u, 1.2), { 'font-size': 14, fill: MUT }); return; }
    if (k === 1) { say(760, 360, 'Engine 을 상속하지 않았다 · start() 모양만 같다', fade(u, 1.4), { 'font-size': 14 }); cross(760, P1.bottom + 22, 9, pop(u, 1.8)); mono(780, P1.bottom + 27, '상속 관계 없음', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.8) }); return; }
    const car = (top, head, s, tgt, hotRow) => { const O = obj(230, top, 290, head, [{ k: 'engine', v: '●', vcol: ACC, hot: hotRow === 0 ? true : null }, { k: 'start()', v: 'engine.start()', vcol: MUT, op: at(c, 3, 0.2), hot: hotRow === 1 ? true : null }], { s, tag: 'Car' });
      return O; };
    const G1 = car(70, k >= 4 ? 'gas' : 'car', pp(c, 2, 0.2), P1, k === 3 && u < 0.9 ? 1 : (k === 5 && u < 0.7 ? 1 : null));
    arrow(G1.right - 18, G1.rowY(0), P1.left - 4, P1.rowY(0) - 8, at(c, 2, 0.8), ACC);
    if (k === 2) { pill(230, 250, 'Car(Engine())', INK, pop(u, 0.3), { mono: true, fs: 15 }); say(480, 300, '물려받지 않고 생성자로 받아 self.engine 에 담는다', fade(u, 1.6), { 'font-size': 14 }); }
    if (k === 3) { pill(230, 260, 'car.start()', INK, pop(u, 0.1), { mono: true, fs: 15 });
      dot([[230, 245], [230, G1.rowY(1)], [G1.right - 18, G1.rowY(0)], [P1.left, P1.rowY(0)]], seg(u, 0.2, 1.0), ACC, 7);
      dot([[P1.left, P1.rowY(0)], [230, 245]], seg(u, 1.4, 2.0), INK, 7);
      code(320, 265, '→ "부릉"', fade(u, 2.0), { fill: ACC }); say(480, 330, 'Car 는 엔진 내부를 모른다 · start() 하나만 안다', fade(u, 2.2), { 'font-size': 14 }); }
    if (k >= 4) { const G2 = car(236, 'ev', pp(c, 4, 0.4), P2, k === 5 && u > 1.2 && u < 1.7 ? 1 : null);
      arrow(G2.right - 18, G2.rowY(0), P2.left - 4, P2.rowY(0) - 8, at(c, 4, 1.0), ACC);
      if (k === 4) { code(480, 384, 'gas = Car(Engine())   ev = Car(ElectricEngine())', fade(u, 1.5), { 'text-anchor': 'middle', 'font-size': 14 }); say(480, 410, 'Car 코드는 한 글자도 안 바뀌었다', fade(u, 2.0), { 'font-size': 14, fill: GOOD }); }
      if (k === 5) { dot([[G1.left, G1.rowY(1)], [G1.right - 18, G1.rowY(0)], [P1.left, P1.rowY(0)]], seg(u, 0.2, 0.8), ACC, 7);
        dot([[G2.left, G2.rowY(1)], [G2.right - 18, G2.rowY(0)], [P2.left, P2.rowY(0)]], seg(u, 1.2, 1.8), ACC, 7);
        code(230, 384, 'gas.start() → "부릉"', fade(u, 0.9), { 'text-anchor': 'middle', fill: ACC, 'font-size': 14.5 });
        code(700, 384, 'ev.start() → "웅~"', fade(u, 1.9), { 'text-anchor': 'middle', fill: ACC, 'font-size': 14.5 }); } } }

  // =========================================================
  // 5. 상속은 문을 전부 연다 · 컴포지션은 필요한 문만 낸다
  // =========================================================
  const LISTM = ['append', 'extend', 'insert', 'remove', 'pop', 'sort', 'reverse', 'clear', 'index', '[i] = x'];
  const AXES = ['결합도', '런타임 교체', '기반 변경 영향', '캡슐화'];
  function s5(t, c) { const { k, u } = c;
    const ax = Math.min(k, 3); if (k <= 3) pill(480, 28, AXES.slice(0, ax + 1).join(' · '), WARN, 1, { fs: 14, fill: WARNBG });
    else pill(480, 28, '컴포지션: 보유하고 필요한 것만 공개', GOOD, 1, { fs: 14, fill: GOODBG });
    // 왼쪽 BadStack
    zone(30, 56, 430, 350, 'class BadStack(list)', { stroke: BAD, op: 1, color: BAD });
    LISTM.forEach((m, i) => { const x = 90 + (i % 5) * 84, y = 108 + Math.floor(i / 5) * 40, hot = m === 'insert' && (k === 2 || k === 3);
      pill(x, y, m, hot ? BAD : MUT, k === 0 ? pop(u, 0.4 + i * 0.12) : 1, { mono: true, fs: 13.5, fill: hot ? BADBG : null }); });
    pill(90, 188, 'push', INK, pp(c, 0, 0.2), { mono: true, fs: 13.5 });
    if (k === 0) say(245, 236, 'list 의 메서드가 전부 따라 들어온다', fade(u, 1.8), { 'font-size': 14, fill: BAD });
    if (k >= 1) { lock(430, 80, true, BAD, pp(c, 1, 0.3)); if (k === 1) say(245, 236, '부모는 class 문에 박혀 고를 수 없다', fade(u, 0.7), { 'font-size': 14, fill: BAD }); }
    if (k === 2) say(245, 236, '만든 적 없는 insert() 도 열려 있다', fade(u, 0.6), { 'font-size': 14, fill: BAD });
    if (k >= 3) { const v = k === 3 ? (u < 0.5 ? [1] : u < 1.2 ? [1, 2] : u < 1.4 ? [1, 2] : [99, 1, 2]) : [99, 1, 2];
      code(60, 300, 's', 1, { 'font-size': 16 });
      cells(90, 276, v, { w: 60, h: 44, style: (i) => ({ stroke: v[i] === 99 ? BAD : INK, fill: v[i] === 99 ? BADBG : null, s: k === 3 && v[i] === 99 ? pop(u, 1.4) : 1 }) });
      if (k === 3) { code(320, 290, 's.insert(0, 99)', fade(u, 1.2), { fill: BAD, 'font-size': 14 }); }
      code(90, 364, k === 3 ? '' : '[99, 1, 2] · LIFO 깨짐', 1, { fill: BAD, 'font-size': 14 });
      if (k === 3) code(90, 364, 'print(s) → [99, 1, 2]', fade(u, 2.0), { fill: BAD, 'font-size': 14 }); }
    // 오른쪽 Stack
    const rOn = k >= 4;
    zone(500, 56, 430, 350, rOn ? 'class Stack' : 'class Stack  (아직 없음)', { stroke: rOn ? GOOD : OFF, dash: rOn ? null : '6 6', fill: rOn ? SOFT : PANEL, color: rOn ? GOOD : OFF });
    if (rOn) { el('rect', { x: 580, y: 150, width: 270, height: 110, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: at(c, 4, 0.2) });
      mono(594, 172, 'self._items  (list, 안에 숨김)', { 'font-size': 13.5, fill: MUT, opacity: at(c, 4, 0.3) });
      const v = k === 4 ? [] : u < 0.5 ? [1] : u < 1.4 ? [1, 2] : [1];
      cells(600, 190, v.length ? v : [''], { w: 56, h: 44, style: (i) => ({ op: v.length ? 1 : 0.3, stroke: INK }) });
      pill(560, 100, 'push', GOOD, pp(c, 4, 0.8), { mono: true, fs: 14.5 }); arrow(560, 116, 600, 186, at(c, 4, 1.0), GOOD, { sw: 1.8 });
      pill(870, 100, 'pop', GOOD, pp(c, 5, 0.2), { mono: true, fs: 14.5 });
      if (k >= 5) arrow(780, 186, 860, 118, at(c, 5, 1.3), GOOD, { sw: 1.8 });
      if (k === 4) { say(715, 300, '리스트 메서드는 밖에서 안 보인다', fade(u, 1.4), { 'font-size': 14 }); cross(715, 340, 10, pop(u, 1.8)); mono(735, 345, 'st.insert 없음', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
      if (k === 5) { fly(690, 212, 870, 140, seg(u, 1.4, 2.0), '2', { mono: true });
        code(715, 310, 'st.push(1); st.push(2)', fade(u, 0.2), { 'text-anchor': 'middle', 'font-size': 14 });
        code(715, 340, 'st.pop() → 2', fade(u, 1.9), { 'text-anchor': 'middle', fill: GOOD }); say(715, 372, '마지막에 넣은 것이 먼저 · LIFO 보장', fade(u, 2.2), { 'font-size': 14, fill: GOOD }); } } }

  // =========================================================
  // 6. 덕타이핑 · Protocol — 공통 부모 없이 모양으로 통과
  // =========================================================
  function s6(t, c) { const { k, u } = c, dec = c.beat.decide || (c.prev && c.prev.decide) || [];
    const Rb = obj(130, 120, 200, 'Robot', [{ k: 'speak()', v: '"삐빕"', vb: true, vcol: ACC, hot: k === 2 && u > 0.4 && u < 1.2 ? true : null }], { s: pp(c, 0, 0.2) });
    const Pe = obj(390, 120, 200, 'Person', [{ k: 'speak()', v: '"안녕"', vb: true, vcol: ACC, hot: k === 2 && u > 1.3 && u < 2.1 ? true : null }], { s: pp(c, 0, 0.4) });
    obj(260, 30, 200, '공통 부모?', [], { dash: '6 5', stroke: OFF, hcol: OFF, op: k === 0 ? fade(u, 0.8) : 0.6 });
    cross(330, 51, 10, pp(c, 0, 1.2));
    if (k === 0) say(260, 260, '아무 관계도 없는데 둘 다 speak() 가 있다', fade(u, 1.5), { 'font-size': 14 });
    if (k >= 1) { card(260, 280, 300, 56, { rx: 12, stroke: INFO, fill: INFOBG, s: pp(c, 1, 0.3) });
      code(260, 276, 'def greet(x):', at(c, 1, 0.4), { 'text-anchor': 'middle', fill: INFO }); mono(260, 298, '요구하는 것: x.speak() 하나', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: at(c, 1, 0.6) }); }
    if (k === 1) say(260, 360, 'x 의 타입은 묻지 않는다', fade(u, 1.4), { 'font-size': 14 });
    if (k === 2) { dot([[Rb.cx, Rb.bottom], [230, 252]], seg(u, 0.3, 0.9), ACC, 7); dot([[Pe.cx, Pe.bottom], [290, 252]], seg(u, 1.2, 1.8), ACC, 7);
      code(160, 360, 'greet(Robot())  → 삐빕', fade(u, 1.0), { fill: ACC, 'font-size': 14 }); code(160, 388, 'greet(Person()) → 안녕', fade(u, 1.9), { fill: ACC, 'font-size': 14 }); }
    if (k >= 3) { const g = R.G(260, 372, pp(c, 3, 0.3), 1);
      el('rect', { x: -150, y: -26, width: 300, height: 52, rx: 12, fill: 'none', stroke: WARN, 'stroke-width': 2.4, 'stroke-dasharray': '7 5' }, g);
      mono(0, -4, 'class Speaker(Protocol)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN }, g); mono(0, 17, 'def speak(self) -> str: ...', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); }
    if (k === 4) { arrow(Rb.cx - 40, Rb.bottom + 4, 170, 344, E(u, 0.3, 0.9), GOOD, { dash: '5 4' }); arrow(Pe.cx + 40, Pe.bottom + 4, 350, 344, E(u, 0.6, 1.2), GOOD, { dash: '5 4' });
      check(Rb.right + 14, Rb.top + 16, 10, pop(u, 1.2)); check(Pe.right + 14, Pe.top + 16, 10, pop(u, 1.4)); say(260, 238, '상속 없이 Speaker 를 만족한다', fade(u, 1.6), { 'font-size': 14, fill: GOOD }); }
    // 오른쪽: 고르는 질문들
    zone(560, 30, 380, 380, '상속? 컴포지션? 묻는 순서', {});
    dec.forEach((d, i) => { const y = 66 + i * 84, j = i, op = c.k > j ? 1 : c.k === j ? fade(u, 0.5) : 0; if (op <= 0) return;
      const col = d.tone === 'comp' ? GOOD : INFO;
      tx(578, y + 18, (i + 1) + '. ' + d.q, { 'font-size': 15, 'font-weight': 700, opacity: op });
      pill(640, y + 48, '예 → ' + d.yes, col, op > 0 ? 1 : 0, { fs: 13.5, op });
      pill(820, y + 48, '아니오 → ' + d.no, MUT, op > 0 ? 1 : 0, { fs: 13.5, op }); }); }

  const quiz = [
    { q: 'Dog가 __init__을 정의하지 않았는데 Dog("바둑").name이 동작한다. 그 이유는 무엇인가?',
      o: ['Dog가 Animal의 __init__을 물려받아 그대로 쓰기 때문이다', '파이썬이 name 속성을 자동으로 만들어 주기 때문이다', 'speak()를 오버라이드했기 때문이다'], a: 0,
      why: '자식에 없는 메서드는 부모에서 찾는다. Dog는 speak()만 덮었으므로 __init__은 Animal의 것이 쓰여 self.name이 생긴다.' },
    { q: '자식 __init__에서 super().__init__(name)을 빠뜨리면 무슨 일이 생기는가?',
      o: ['클래스를 정의할 때 바로 오류가 난다', '객체는 만들어지지만 b.name을 읽을 때 AttributeError가 난다', 'name이 None으로 채워진다'], a: 1,
      why: '부모 __init__이 불리지 않아 self.name이 생기지 않는다. 선언과 생성은 조용히 지나가고 읽는 순간에야 터진다.' },
    { q: 'D(B, C)에서 d.who()가 "B"를 돌려주는 이유는 무엇인가?',
      o: ['C가 A보다 나중에 정의됐기 때문이다', 'D가 who()를 직접 오버라이드했기 때문이다', 'MRO D, B, C, A, object에서 B를 먼저 만나 멈추기 때문이다'], a: 2,
      why: '메서드는 __mro__ 순서대로 찾고 처음 찾은 곳에서 멈춘다. D에는 who()가 없고 바로 다음이 B다.' },
    { q: 'Car(Engine())을 Car(ElectricEngine())으로 바꿔도 Car 코드가 그대로인 이유는 무엇인가?',
      o: ['ElectricEngine이 Engine을 상속했기 때문이다', 'Car가 engine.start()라는 공개 메서드에만 기대기 때문이다', 'Car가 엔진 종류를 if로 검사하기 때문이다'], a: 1,
      why: 'Car는 보유한 부품에 start() 요청을 넘길 뿐이다. 같은 start()만 있으면 어떤 부품이든 생성자에서 갈아 끼울 수 있다.' },
    { q: 'BadStack(list)에서 s.insert(0, 99)가 되어 [99, 1, 2]가 된다. 그 이유는 무엇인가?',
      o: ['list의 메서드가 전부 BadStack에 그대로 열려 있기 때문이다', 'push가 안에서 insert를 부르기 때문이다', '파이썬 스택은 원래 중간 삽입을 허용하기 때문이다'], a: 0,
      why: '상속하면 부모가 가진 것이 모두 자식의 공개 메서드가 된다. 리스트를 self._items로 보유하면 push·pop만 열 수 있다.' },
    { q: 'Robot이 아무것도 상속하지 않았는데 greet2(x: Speaker)를 만족하는 이유는 무엇인가?',
      o: ['Robot이 typing 모듈을 import했기 때문이다', 'Protocol은 상속 관계 대신 speak() 모양만 보기 때문이다', 'greet2가 인자의 타입을 런타임에 바꾸기 때문이다'], a: 1,
      why: 'Protocol은 구조적 타입이다. speak(self) -> str 모양을 가진 객체라면 공통 부모 없이도 계약을 만족한다.' },
  ];

  const summary = [
    '상속은 is-a 관계다. 자식은 부모의 __init__과 메서드를 물려받고, 같은 이름으로 덮어 동작을 바꾼다.',
    '자식이 __init__을 정의하면 부모 __init__은 저절로 불리지 않는다. super().__init__()을 맨 앞에서 부른다.',
    '다중상속은 __mro__ 순서(D, B, C, A, object)로 메서드를 찾고 처음 찾은 곳에서 멈춘다.',
    '재사용만 원하면 부품을 보유하고 위임한다. 공개할 메서드를 직접 고르고 부품은 생성자에서 바꾼다.',
  ];
  const review = [
    { q: '스택이 필요해 list를 상속했더니 동료가 s.insert(0, x)를 써서 순서가 깨졌다. 알맞은 고침은?',
      o: ['insert를 덮어써서 예외를 내게 한다', 'list를 self._items로 보유하고 push·pop만 연다', '문서에 insert를 쓰지 말라고 적는다'], a: 1,
      why: '상속하면 부모의 문이 전부 열려 하나씩 막아도 새 문이 생길 수 있다. 보유하고 필요한 것만 공개하면 LIFO가 구조로 보장된다.' },
    { q: 'D(B, C) 다이아몬드에서 D, B, C가 모두 super().__init__()을 부른다. A.__init__은 몇 번 실행되는가?',
      o: ['한 번', '두 번', '한 번도 안 된다'], a: 0,
      why: 'super()는 부모가 아니라 MRO 상 다음 클래스로 넘어간다. D, B, C, A 순서로 한 줄로 이어지므로 A는 한 번만 초기화된다.' },
    { q: '주문 클래스를 테스트할 때 실제 결제 모듈 대신 가짜를 넣고 싶다. 어떤 구조가 가장 쉬운가?',
      o: ['주문 클래스가 결제 클래스를 상속한다', '주문 클래스 안에서 결제 객체를 직접 만든다', '결제 객체를 생성자로 받아 self에 보유한다'], a: 2,
      why: '부품을 생성자로 받으면 교체 지점이 한 곳뿐이다. Car(Engine())처럼 테스트에서는 가짜 부품을 넣으면 된다.' },
  ];

  R.page({ title: '클래스 관계 들여다보기', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
