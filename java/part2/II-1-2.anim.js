/* II-1-2 상속·다형성·오버라이딩 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
   그림의 재료: 클래스 계층(UML 속 빈 삼각형), 부모 부분 + 자식 부분으로 된 힙 객체, 호출 스택, 클래스별 메서드 표, 참조 화살표 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    cross, check, lock, terminal, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  function area(x, y, w, h, title, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || SOFT, stroke: o.stroke || 'none', 'stroke-width': 2, opacity: o.op ?? 1 });
    if (title) tx(x + 14, y + 24, title, { 'font-size': 15, 'font-weight': 700, fill: o.col || MUT, opacity: o.op ?? 1 }); }
  // 클래스 상자 (왼쪽 위 기준). rows: [[글, {col, dim, hot, strike}]]
  function cls(x, y, w, name, rows, o) { o = o || {}; const rh = 26, h = 36 + rows.length * rh + (rows.length ? 6 : 0), op = o.op ?? 1, st = o.stroke || INK;
    const g = el('g', { opacity: op });
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: st, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    tx(x + w / 2, y + 23, name, { 'font-size': 15, 'font-weight': 800, class: 'mono', 'text-anchor': 'middle', fill: st }, g);
    if (rows.length) el('line', { x1: x, y1: y + 34, x2: x + w, y2: y + 34, stroke: st, 'stroke-width': 1.3 }, g);
    rows.forEach(([s, rs], i) => { rs = rs || {}; const cy = y + 36 + i * rh + rh / 2 + 3;
      if (rs.hot) el('rect', { x: x + 4, y: cy - rh / 2 + 1, width: w - 8, height: rh - 2, rx: 5, fill: rs.hot === true ? ACCBG : rs.hot }, g);
      mono(x + 10, cy + 5, s, { 'font-size': 14, fill: rs.col || (rs.dim ? MUT : INK), 'font-weight': rs.dim ? 400 : 600, 'text-decoration': rs.strike ? 'line-through' : null }, g); });
    return { x, y, w, h, cx: x + w / 2, cy: (i) => y + 36 + i * rh + rh / 2 }; }
  // 상속 화살표: 자식(x1,y1) → 부모(x2,y2), 끝에 빈 삼각형
  function inh(x1, y1, x2, y2, u, o) { o = o || {}; if (u <= 0) return; const col = o.col || INK;
    el('line', { x1, y1, x2: lerp(x1, x2, u), y2: lerp(y1, y2, u), stroke: col, 'stroke-width': 2, 'stroke-dasharray': o.dash });
    if (u > 0.98) { const a = Math.atan2(y2 - y1, x2 - x1), s = 13, q = (d) => [x2 - s * Math.cos(a + d), y2 - s * Math.sin(a + d)];
      el('path', { d: `M${x2},${y2} L${q(-0.45)} L${q(0.45)} Z`, fill: PANEL, stroke: col, 'stroke-width': 2 }); } }
  function slot(x, y, name, val, o) { o = o || {}; const w = o.w || 60, op = o.op ?? 1;
    tx(x - 10, y + 5, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono', fill: o.col || INK, opacity: op });
    el('rect', { x, y: y - 16, width: w, height: 32, rx: 6, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    if (val === '•') el('circle', { cx: x + w / 2, cy: y, r: 5.5, fill: ACC, opacity: op });
    else if (val != null) mono(x + w / 2, y + 5, val, { 'font-size': 14, 'text-anchor': 'middle', fill: o.vcol || INK, opacity: op });
    return { cx: x + w / 2, x1: x + w, y }; }
  function ref(x1, y1, x2, y2, u, o) { o = o || {}; if (u <= 0) return; const col = o.col || ACC;
    const mk = col === BAD ? 'url(#ra-ahr)' : col === ACC ? 'url(#ra-ahb)' : 'url(#ra-ah)';
    const mx = (x1 + x2) / 2 + (o.bx || 0), my = (y1 + y2) / 2 + (o.by || 0);
    el('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, fill: 'none', stroke: col, 'stroke-width': o.sw || 2.4, pathLength: 1,
      'stroke-dasharray': u >= 1 ? o.dash : `${clamp(u)} 1`, 'marker-end': u > 0.98 ? mk : null, opacity: o.op ?? 1 }); }
  function chip(x, y, s, o) { o = o || {}; const fs = o.fs || 14, w = o.w || tw(s, fs) + 22, op = o.op ?? 1;
    el('rect', { x, y: y - 15, width: w, height: 30, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash, opacity: op });
    mono(x + 11, y + 5, s, { 'font-size': fs, fill: o.col || INK, 'font-weight': o.fw || 600, opacity: op, 'text-decoration': o.strike ? 'line-through' : null });
    return { x, y, w, x1: x + w }; }
  // 부모 부분 + 자식 부분으로 된 힙 객체
  function layered(x, y, w, type, parts, o) { o = o || {}; const op = o.op ?? 1, st = o.stroke || ACC; let yy = y + 34;
    const total = 34 + parts.reduce((a, p) => a + 26 + Math.max(1, p[1].length) * 26, 0) + 4;
    el('rect', { x, y, width: w, height: total, rx: 8, fill: PANEL, stroke: st, 'stroke-width': 2.2, opacity: op });
    tx(x + 12, y + 23, type, { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: st, opacity: op });
    if (o.addr) mono(x + w - 10, y + 23, o.addr, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op });
    const rowsY = [];
    parts.forEach(([title, rows, ps]) => { ps = ps || {};
      el('rect', { x: x + 6, y: yy, width: w - 12, height: 24 + Math.max(1, rows.length) * 26, rx: 6, fill: ps.fill || SOFT, stroke: ps.stroke || 'none', 'stroke-width': 2, opacity: op });
      tx(x + 14, yy + 17, title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op }); yy += 24;
      if (!rows.length) { tx(x + 14, yy + 18, '(필드 없음)', { 'font-size': 13.5, fill: MUT, opacity: op }); yy += 26; }
      rows.forEach(([n, v, rs]) => { rs = rs || {}; mono(x + 16, yy + 18, n, { 'font-size': 14.5, fill: rs.col || INK, opacity: op });
        if (v != null) mono(x + w - 16, yy + 18, v, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: rs.vcol || INK, opacity: op }); rowsY.push(yy + 13); yy += 26; });
      yy += 2; });
    return { x, y, w, h: total, rowsY }; }
  const out = (x, y, s, op, col) => tx(x, y, s, { 'font-size': 16, 'font-weight': 800, fill: col || GOOD, 'text-anchor': 'middle', opacity: op ?? 1 });

  // ---------- 1. extends: 물려받아 계층을 만든다 ----------
  function s1(t, c) { const { k, u } = c;
    area(20, 20, 440, 385, '클래스 계층', {});
    const ob = cls(130, 50, 220, 'Object', [['toString() · equals() …', { dim: true }]]);
    const arows = [['# String name']]; if (k >= 1) arows.push(['eat()', { hot: k === 1 && u > 0.3 }], ['sound()  "..."', { hot: k === 1 && u > 0.6 }]);
    const an = cls(130, 150, 220, 'Animal', arows, { op: k === 0 ? fade(u, 0.2) : 1, stroke: k === 0 ? ACC : INK });
    inh(240, 150, 240, ob.y + ob.h, k === 0 ? seg(u, 0.6, 1.3) : 1, { dash: '5 4' });
    if (k <= 1) sub(240, 300, k === 0 ? '# 는 protected — 자식도 쓸 수 있다' : '부모를 안 쓰면 자동으로 Object를 상속한다', fade(u, 1.2), { 'font-size': 14 });
    if (k >= 2) { const dg = cls(50, 290, 190, 'Dog', [['name · eat()', { dim: true }]].concat(k >= 3 ? [['fetch()', { col: ACC, hot: k === 3 }]] : []), { op: k === 2 ? fade(u, 0.2) : 1, stroke: k === 2 ? ACC : INK });
      inh(145, 290, 200, an.y + an.h, k === 2 ? seg(u, 0.5, 1.2) : 1);
      if (k === 2) tx(310, 330, 'Dog is a Animal', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      if (k === 3) tx(255, 345, '← Dog 고유 기능', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
      if (k >= 4) { const dd = dg; // 메서드 찾기: Dog 에서 위로
        if (k === 4) { dot([[dd.cx, dd.y + 20], [dd.cx + 40, dd.y - 10], [240, an.cy(1)]], seg(u, 0.4, 1.4), ACC, 7); el('rect', { x: an.x + 4, y: an.cy(1) - 12, width: an.w - 8, height: 24, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.3) }); } } }
    if (k === 5) { cls(260, 290, 180, 'Cat', [['name · eat()', { dim: true }]], { op: fade(u, 0.2) }); inh(350, 290, 280, an.y + an.h, seg(u, 0.4, 1.0)); }
    // 힙
    area(480, 20, 460, 385, 'Heap', { col: ACC });
    if (k <= 3) sub(710, 200, k <= 1 ? '부모에 공통 상태와 행동을 모은다' : '자식은 다시 쓰지 않고 물려받는다', 1, { 'font-size': 15 });
    if (k >= 4) { const d = layered(640, 60, 270, 'Dog', [['Animal에서 온 부분', [['name', '"바둑이"']]], ['Dog 부분', []]], { op: k === 4 ? fade(u, 0.2) : 1 });
      const s = slot(540, 120, 'd', '•'); ref(s.x1 - 30, s.y, 638, 100, k === 4 ? seg(u, 0.2, 0.8) : 1, { by: -20 });
      terminal(500, 290, 420, 100, k === 4 ? ['바둑이 eats'] : ['바둑이 eats', '바둑이 fetches'], k === 4 ? seg(u, 1.4, 2.0) : 1 + seg(u, 0.6, 1.2), { title: 'console' });
      if (k === 4) sub(710, 265, 'd.eat() — Dog에 없으니 부모 Animal에서 찾는다', fade(u, 1.5), { 'font-size': 14 }); }
    if (k === 5) { chip(500, 230, 'class Dog extends Animal, Pet', { fs: 13.5, stroke: BAD, col: BAD, op: fade(u, 1.3), strike: true }); cross(890, 230, 9, pop(u, 1.6));
      sub(710, 270, 'extends는 하나뿐 — 클래스 다중상속 금지', fade(u, 1.8), { 'font-size': 14, fill: BAD }); } }

  // ---------- 2. 생성자 호출 순서 ----------
  function frame(x, y, w, sig, note, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: 54, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    mono(x + 12, y + 22, sig, { 'font-size': 14.5, 'font-weight': 700, fill: o.stroke || INK, opacity: op });
    if (note) tx(x + 12, y + 44, note, { 'font-size': 13.5, fill: o.ncol || MUT, opacity: op }); }
  function s2(t, c) { const { k, u } = c, FX = 40, FW = 380, YD = 280, YA = 214, YO = 148;
    area(20, 20, 420, 385, k === 0 ? 'class Animal' : '호출 스택', {});
    area(460, 20, 480, 200, 'Heap', { col: ACC });
    if (k === 0) { chip(50, 90, 'Animal(String name) { … }', { fs: 15, stroke: GOOD });
      chip(50, 150, 'Animal() { }', { fs: 15, stroke: BAD, col: BAD, dash: '5 4', strike: true, op: fade(u, 0.6) }); tx(220, 156, '기본 생성자 없음', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) });
      sub(230, 230, '생성자를 하나라도 직접 쓰면', fade(u, 1.4), { 'font-size': 15 }); sub(230, 256, '컴파일러가 기본 생성자를 만들지 않는다', fade(u, 1.6), { 'font-size': 15 });
      sub(700, 120, '아직 객체 없음', 1, { 'font-size': 15 }); }
    if (k >= 1 && k <= 4) {
      const done = (i) => k >= 4 || (k === 3 && u > 0.4 + i * 0.6);
      frame(FX, YD, FW, 'Dog(String name)', k === 1 ? '들어왔지만 본문은 대기' : done(2) ? '본문 실행 — "Dog 생성자"' : 'super가 끝나길 기다린다', { op: k === 1 ? fade(u, 0.2) : 1, stroke: done(2) ? GOOD : INK });
      if (k === 1) { pill(230, 100, 'new Dog("바둑이")', ACC, pop(u, 0.2), { mono: true }); grow(230, 118, 230, YD - 4, seg(u, 0.5, 1.2), ACC); }
      if (k >= 2) { frame(FX, YA, FW, 'Animal(String name)', done(1) ? 'name = "바둑이" · "Animal 생성자"' : 'super(name)으로 불림', { op: k === 2 ? fade(u, 0.3) : 1, stroke: done(1) ? GOOD : INK });
        frame(FX, YO, FW, 'Object()', done(0) ? '실행 완료' : '맨 위 조상 — 자동', { op: k === 2 ? fade(u, 1.0) : 1, stroke: done(0) ? GOOD : MUT });
        if (k === 2) { grow(FX + FW - 30, YD + 4, FX + FW - 30, YA + 54, seg(u, 0.2, 0.6), ACC); grow(FX + FW - 30, YA + 4, FX + FW - 30, YO + 54, seg(u, 0.9, 1.3), MUT);
          tx(FX + 10, 100, '쌓기: 자식 → 부모 → Object', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); } }
      if (k >= 3) { [YO, YA, YD].forEach((y, i) => check(FX + FW - 24, y + 27, 9, k === 3 ? pop(u, 0.4 + i * 0.6) : 1));
        tx(FX + 10, 100, '실행: 위에서 아래로', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: k === 3 ? fade(u, 0.2) : 1 }); }
      // 힙 객체: 부모 부분이 먼저 채워진다
      if (k >= 2) { const nm = k >= 4 || (k === 3 && u > 1.0) ? '"바둑이"' : 'null';
        layered(560, 50, 280, 'Dog', [['Animal 부분', [['name', nm, { vcol: nm === 'null' ? MUT : GOOD }]], { stroke: k === 3 && u > 1.0 && u < 1.9 ? GOOD : 'none' }], ['Dog 부분', []]], { op: k === 2 ? fade(u, 0.5) : 1 }); }
      if (k === 1) sub(700, 120, '객체 자리를 만들고 생성자를 부른다', fade(u, 0.8), { 'font-size': 15 });
      terminal(460, 240, 480, 165, k >= 3 ? ['Animal 생성자', 'Dog 생성자'] : [], k === 3 ? (u > 1.0 ? 1 : 0) + (u > 1.6 ? 1 : 0) : k >= 4 ? 2 : 0, { title: 'console' });
      if (k === 4) { mono(900, 284, '① 부모', { 'font-size': 14, fill: WARN, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.3) }); mono(900, 306, '② 자식', { 'font-size': 14, fill: GOOD, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.6) });
        tx(700, 380, '출력 순서가 곧 생성자 실행 순서다', { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); } }
    if (k === 5) { chip(50, 90, 'Dog(String name) {', { fs: 14.5 });
      chip(80, 136, 'super();', { fs: 14.5, stroke: WARN, col: WARN, dash: '5 4', op: fade(u, 0.3) }); tx(200, 141, '← 컴파일러가 끼워 넣음', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.5) });
      chip(80, 182, 'println("Dog 생성자");', { fs: 14.5, op: 0.7 }); chip(50, 228, '}', { fs: 14.5 });
      chip(500, 90, 'Animal()', { fs: 15, stroke: BAD, col: BAD, dash: '5 4', op: fade(u, 1.0) }); cross(620, 90, 9, pop(u, 1.3));
      ref(126, 121, 498, 90, seg(u, 0.8, 1.4), { col: BAD, by: -70 });
      chip(480, 160, 'error: constructor Animal in class Animal', { fs: 13.5, stroke: BAD, col: BAD, op: fade(u, 1.6), w: 440 });
      mono(491, 196, 'cannot be applied to given types', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.6) });
      tx(230, 330, '해결: super(name)을 직접 쓴다', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      terminal(460, 240, 480, 165, [], 0, { title: 'javac' }); } }

  // ---------- 3. 오버라이딩 ----------
  const LAD = ['private', 'default', 'protected', 'public'];
  function s3(t, c) { const { k, u } = c;
    if (k <= 3) {
      area(20, 20, 470, 385, '클래스', {});
      const an = cls(135, 50, 240, 'Animal', [['sound()   "..."', { hot: k === 0 }]], { stroke: k === 0 ? ACC : INK });
      if (k >= 1) { const dg = cls(40, 220, 200, 'Dog', [['@Override', { col: GOOD }], ['sound()  "멍멍"', { hot: k === 1 }]], { op: k === 1 ? fade(u, 0.2) : 1 });
        inh(140, 220, 210, an.y + an.h, k === 1 ? seg(u, 0.3, 0.9) : 1);
        if (k === 1) { ref(dg.x + dg.w, dg.cy(1), an.x + an.w - 20, an.cy(0) + 12, seg(u, 1.0, 1.8), { bx: 70, col: ACC }); sub(725, 270, '같은 이름·같은 매개변수면 덮어쓴다', fade(u, 1.6), { 'font-size': 15 }); } }
      if (k >= 2) { cls(270, 220, 200, 'Cat', [['@Override', { col: GOOD }], ['public sound() "야옹"', { hot: k === 2 }]], { op: k === 2 ? fade(u, 0.2) : 1 }); inh(370, 220, 300, an.y + an.h, k === 2 ? seg(u, 0.3, 0.9) : 1); }
      area(510, 20, 430, 385, k === 2 ? '접근 범위는 넓히기만' : k === 3 ? '실행' : '부모 Animal.sound()', {});
      if (k <= 1) { terminal(530, 70, 390, 100, ['...'], k === 0 ? seg(u, 0.8, 1.2) : 1, { title: 'new Animal().sound()' });
        if (k === 1) tx(725, 230, '@Override는 실수를 컴파일러가 잡게 한다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) }); }
      if (k === 2) { cells(540, 90, LAD, { w: 90, h: 40, fs: 14, style: (i) => i === 1 ? { stroke: INK, fill: SOFT } : i === 3 ? { stroke: GOOD, fill: GOODBG } : { stroke: GRID } });
        tx(633, 160, 'Animal', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
        grow(640, 176, 860, 176, seg(u, 0.5, 1.2), ACC); check(880, 176, 9, pop(u, 1.3)); tx(860, 160, 'Cat', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.0) });
        grow(620, 226, 560, 226, seg(u, 1.5, 1.9), BAD); cross(546, 226, 8, pop(u, 1.9)); tx(640, 231, '좁히면 컴파일 에러', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) });
        sub(725, 300, 'Animal.sound()는 제어자가 없어 default다', fade(u, 2.2), { 'font-size': 14 }); }
      if (k === 3) { terminal(530, 70, 390, 120, ['> new Dog().sound()', '멍멍', '> new Cat().sound()', '야옹'], 4 * seg(u, 0.2, 1.8), { title: 'console' });
        tx(725, 250, '어느 구현이 도는지는 실행 시점의 객체가 정한다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
      return; }
    // 오버로딩
    area(20, 20, 920, 250, k === 4 ? 'class Printer — 같은 클래스, 이름 같고 매개변수 다름' : '두 개념 나란히', {});
    if (k === 4) { const p = cls(330, 60, 300, 'Printer', [['print(int n)'], ['print(String s)']]);
      [['정수 인자', 0], ['문자열 인자', 1]].forEach(([s, i]) => { const y = p.cy(i), sc = pop(u, 0.4 + i * 0.6);
        pill(150, y + 0, s, i ? INFO : WARN, sc); grow(215, y, 326, y, seg(u, 0.8 + i * 0.6, 1.3 + i * 0.6), i ? ACC : MUT); });
      tx(480, 200, '인자 타입을 보고 컴파일할 때 정해진다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(480, 228, '상속과 무관 — 재정의가 아니다', fade(u, 2.2), { 'font-size': 14 }); }
    if (k === 5) { [['오버라이딩', '부모 ↔ 자식', '시그니처 같음', '실행 중(동적)', ACC], ['오버로딩', '같은 클래스 안', '매개변수 다름', '컴파일 때(정적)', INFO]].forEach(([a, b, s, w, col], i) => {
        const x = 60 + i * 450, sc = pop(u, 0.2 + i * 0.5);
        card(x + 180, 145, 380, 180, { rx: 12, stroke: col, sw: 2.2, s: sc });
        tx(x + 30, 85, a, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.5) });
        [b, s, w].forEach((z, j) => tx(x + 30, 125 + j * 34, ['위치  ', '모양  ', '결정  '][j] + z, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 0.5 + i * 0.5 + j * 0.15) })); }); }
    terminal(20, 290, 920, 115, k === 4 ? ['// void print(int n)    { }', '// void print(String s) { }   오버로딩'] : ['// print(String)은 재정의가 아니라 오버로딩이다'], k === 4 ? 2 * fade(u, 0.3) : fade(u, 1.5), { title: 'Override.java' }); }

  // ---------- 4. 다형성: 동적 바인딩 ----------
  const KC = [['Dog', '멍멍'], ['Cat', '야옹'], ['Cow', '음메']];
  function s4(t, c) { const { k, u } = c;
    area(20, 20, 150, 270, 'Stack', {});
    area(185, 20, 315, 270, 'Heap', { col: ACC });
    area(515, 20, 425, 270, 'Method Area', { col: WARN });
    const an = cls(640, 50, 180, 'Animal', [['sound()  "..."', { hot: k === 2 && u < 1.1 }]], { stroke: k === 2 && u < 1.1 ? ACC : INK });
    const kb = KC.map(([n, s], i) => cls(525 + i * 140, 170, 130, n, [['sound() ' + s, { hot: false }]], { op: k === 0 ? fade(u, 0.3 + i * 0.3) : 1 }));
    kb.forEach((b, i) => inh(b.cx, b.y, 690 + i * 40, an.y + an.h, k === 0 ? seg(u, 0.5 + i * 0.3, 1.0 + i * 0.3) : 1));
    const outs = [];
    if (k === 0) tx(725, 360, '같은 이름 sound(), 내용은 클래스마다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    if (k === 1 || k === 2) { const s = slot(95, 110, 'a', '•', { op: k === 1 ? fade(u, 0.2) : 1 }); tx(30, 150, '선언: Animal', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      const o = cls(250, 90, 180, 'Dog 객체', [['(실제 타입 Dog)', { dim: true }]], { stroke: ACC, op: k === 1 ? fade(u, 0.5) : 1 });
      ref(s.cx, s.y, o.x - 2, o.y + 30, k === 1 ? seg(u, 0.7, 1.4) : 1, { by: -10 });
      ref(o.x + o.w, o.y + 40, kb[0].x + 10, kb[0].y, k === 1 ? seg(u, 1.5, 2.2) : 1, { col: MUT, dash: '5 4', by: 30 });
      if (k === 1) tx(340, 230, '변수는 Animal, 객체는 Dog', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      if (k === 2) { check(830, 64, 9, pop(u, 0.8)); tx(340, 200, '컴파일: Animal에 sound() 있나? ✓', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
        dot([[s.cx, s.y], [o.x, o.y + 30], [o.x + o.w, o.y + 40], [kb[0].cx, kb[0].cy(0)]], seg(u, 1.1, 2.1), ACC, 7);
        el('rect', { x: kb[0].x + 3, y: kb[0].cy(0) - 12, width: kb[0].w - 6, height: 24, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 2.0) });
        tx(340, 230, '실행: 실제 객체 Dog의 sound()', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.4) });
        if (u > 2.1) outs.push('멍멍'); } }
    if (k >= 3) { const s = slot(95, 110, 'zoo', '•'); tx(30, 150, 'Animal[]', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      cells(200, 60, ['[0]', '[1]', '[2]'], { w: 50, h: 34, fs: 13.5, style: (i) => ({ stroke: k === 4 && Math.floor(seg(u, 0.2, 2.6) * 3) === i ? ACC : INK, sw: 2 }) });
      ref(s.cx, s.y, 198, 77, 1, { by: -20 });
      KC.forEach(([n], i) => { const oy = 130 + i * 58, sc = k === 3 ? fade(u, 0.3 + i * 0.4) : 1;
        cls(330, oy, 150, n + ' 객체', [], { stroke: ACC, op: sc });
        ref(225 + i * 56, 94, 330, oy + 18, k === 3 ? seg(u, 0.5 + i * 0.4, 1.1 + i * 0.4) : 1, { by: 10, op: 0.8 });
        if (k === 4 && Math.min(2, Math.floor(seg(u, 0.2, 2.6) * 3)) === i) ref(480, oy + 18, kb[i].x + 15, kb[i].y + 2, seg(u, 0.25 + i * 0.8, 0.75 + i * 0.8), { col: ACC, by: -10 }); });
      if (k === 3) tx(725, 360, '원소 타입이 Animal이라 자식은 무엇이든 담긴다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      if (k === 4) { const n = Math.min(3, Math.floor(seg(u, 0.2, 2.6) * 3 + 0.35)); for (let i = 0; i < n; i++) outs.push(KC[i][1]); }
      if (k === 5) outs.push('멍멍', '야옹', '음메'); }
    terminal(20, 300, 480, 112, outs, outs.length, { title: 'console' });
    if (k >= 4) { chip(520, 345, 'for (Animal x : zoo) x.sound();', { fs: 14, stroke: k === 5 ? GOOD : ACC });
      if (k === 5) { tx(520, 395, '새 동물을 더해도 이 줄은 그대로 (OCP)', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) }); check(915, 345, 9, pop(u, 1.0)); } }
    if (k <= 2 && k > 0) tx(725, 360, k === 1 ? '선언 타입은 부를 수 있는 것을 정한다' : '두 시점의 분리 = 동적 바인딩', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, k === 1 ? 2.2 : 2.3) });
    // 출력이 여러 줄이면 terminal 이 마지막 줄들만 보여 준다
  }

  // ---------- 5. 업/다운캐스팅 · instanceof · final ----------
  function viewObj(x, y, type, rows, o) { return cls(x, y, 210, type + ' 객체', rows.map((r) => [r]), Object.assign({ stroke: ACC }, o)); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 3) {
      area(20, 20, 920, 385, k === 3 ? 'Animal c = new Cat();  Dog bad = (Dog) c;' : 'Animal a = new Dog();', { col: k === 3 ? BAD : MUT });
      if (k <= 2) { const o = viewObj(520, 80, 'Dog', ['eat()', 'sound()', 'fetch()']);
        const a = slot(160, 140, 'a', '•'); tx(160, 180, '타입 Animal', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
        ref(a.x1 - 30, a.y, 518, 120, k === 0 ? seg(u, 0.2, 0.9) : 1, { by: -20 });
        // Animal 로 보는 창
        const wu = k === 0 ? E(u, 1.0, 1.8) : 1, wh = k === 2 ? lerp(58, 84, E(u, 1.4, 2.0)) : 58;
        el('rect', { x: 510, y: 112, width: 230, height: (k === 2 ? wh : 58) * wu, rx: 8, fill: 'none', stroke: k === 2 && u > 1.4 ? GOOD : WARN, 'stroke-width': 3, 'stroke-dasharray': '7 4' });
        tx(752, 140, k === 2 && u > 1.4 ? 'Dog로 보는 창' : 'Animal로 보는 창', { 'font-size': 14, 'font-weight': 700, fill: k === 2 && u > 1.4 ? GOOD : WARN, opacity: wu });
        if (k === 0) tx(340, 100, '업캐스팅 — 자동, 항상 안전', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        if (k === 1) { chip(60, 260, 'a.fetch();', { fs: 15, stroke: BAD, col: BAD, op: fade(u, 0.2) }); ref(180, 260, 518, o.cy(2), seg(u, 0.6, 1.3), { col: BAD, by: 30, dash: '5 4' }); cross(500, o.cy(2), 9, pop(u, 1.3));
          tx(340, 330, '객체는 Dog 지만 선언 타입이 Animal이라 컴파일 에러', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
        if (k === 2) { chip(60, 260, 'if (a instanceof Dog d)', { fs: 14.5, stroke: GOOD, col: GOOD, op: fade(u, 0.2) });
          tx(340, 330, '실제 타입 Dog = Dog ✓ → d로 꺼낸다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
          const d = slot(160, 210, 'd', '•', { op: fade(u, 1.2) }); tx(250, 215, '타입 Dog', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
          ref(d.x1 - 30, d.y, 518, 150, seg(u, 1.3, 1.9), { col: GOOD, by: 10, bx: 40 }); check(760, o.cy(2), 9, pop(u, 2.1)); tx(780, o.cy(2) + 5, 'd.fetch() OK', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: GOOD, opacity: fade(u, 2.1) }); } }
      if (k === 3) { viewObj(520, 80, 'Cat', ['eat()', 'sound()']);
        const cc = slot(160, 140, 'c', '•'); ref(cc.x1 - 30, cc.y, 518, 120, 1, { by: -20 });
        pill(340, 230, '(Dog) c', BAD, pop(u, 0.3), { mono: true });
        tx(340, 280, '컴파일은 통과 — 검사는 실행 중에', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
        dot([[400, 230], [518, 150]], seg(u, 0.9, 1.5), BAD, 7);
        tx(625, 230, '실제 타입 Cat ≠ Dog', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
        banner(625, 290, 'ClassCastException', pop(u, 1.9)); }
      return; }
    area(20, 20, 920, 385, k === 4 ? 'final class — 상속 금지' : 'final method — 재정의 금지', {});
    if (k === 4) { const m = cls(330, 70, 300, 'final class Money', [], { stroke: WARN, op: fade(u, 0.2) }); lock(650, 88, true, WARN, pop(u, 0.5));
      chip(300, 220, 'class X extends Money', { fs: 15, stroke: BAD, col: BAD, op: fade(u, 0.9) }); inh(410, 205, 480, 106, seg(u, 1.0, 1.6), { col: BAD, dash: '6 4' }); cross(470, 160, 11, pop(u, 1.7));
      chip(300, 290, 'final class String', { fs: 15, stroke: WARN, op: fade(u, 2.0) }); tx(500, 296, '← 표준 라이브러리의 대표 예', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 2.1) }); }
    if (k === 5) { const b = cls(330, 60, 300, 'class Base', [['final void rule()'], ['void other()']], { op: 1 }); lock(645, b.cy(0), true, WARN, pop(u, 0.3));
      const ch = cls(330, 220, 300, 'class Child extends Base', [['void rule()', { col: BAD, strike: true }], ['void other()', { col: GOOD }]], { op: fade(u, 0.6) });
      inh(480, 220, 480, b.y + b.h, seg(u, 0.7, 1.2)); cross(650, ch.cy(0), 9, pop(u, 1.5)); check(650, ch.cy(1), 9, pop(u, 1.8));
      tx(800, 190, '클래스는 열고', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); tx(800, 214, '메서드 하나만 잠근다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); } }

  // ---------- 6. 실무 3대 함정 ----------
  function s6(t, c) { const { k, u } = c;
    if (k <= 1) { area(20, 20, 920, 385, k === 0 ? 'class Animal — 함정의 무대' : '① @Override 없이 매개변수가 달라졌다', { col: k ? BAD : MUT });
      const an = cls(330, 60, 300, 'Animal', [['String type = "animal"', { hot: k === 0 && u > 0.3 && u < 1.3 }], ['void sound()  "..."', { hot: k === 0 && u > 1.3 }]]);
      if (k === 0) { tx(480, 250, '필드와 메서드는 상속에서 다르게 움직인다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
      const dg = cls(80, 220, 330, 'Dog', [['void sound()  "..."  (물려받음)', { dim: true }], ['void sound(String s)  새 메서드', { col: BAD, hot: BADBG }]], { op: fade(u, 0.2) });
      inh(245, 220, 400, an.y + an.h, seg(u, 0.3, 0.8));
      dot([[600, 350], [dg.x + dg.w, dg.cy(0)]], seg(u, 0.9, 1.5), ACC, 7);
      pill(680, 350, 'd.sound() → "..."', BAD, pop(u, 1.4), { mono: true, fs: 14 });
      chip(470, 260, 'method does not override or implement', { fs: 13.5, stroke: GOOD, col: GOOD, op: fade(u, 2.0), w: 440 });
      tx(480, 236 - 0, '@Override를 붙였다면 javac가 바로 잡는다', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    if (k <= 3) { area(20, 20, 440, 385, k === 2 ? '② 같은 이름 필드' : 'Animal a = new Cat();', { col: k === 2 ? WARN : MUT });
      area(480, 20, 460, 385, 'Heap', { col: ACC });
      const o = layered(560, 60, 300, 'Cat 객체', [['Animal 부분', [['type', '"animal"']], { stroke: k === 3 && u > 1.0 ? ACC : 'none' }], ['Cat 부분', [['type', '"cat"']], { stroke: k === 2 && u > 0.8 ? WARN : 'none' }]], { op: 1 });
      if (k === 2) { chip(40, 90, 'class Cat extends Animal {', { fs: 14 }); chip(70, 136, 'String type = "cat"; }', { fs: 14, stroke: WARN });
        tx(240, 220, '덮어쓰지 않는다 — 칸이 둘', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
        sub(240, 250, '메서드와 달리 필드는 재정의 대상이 아니다', fade(u, 1.6), { 'font-size': 14 }); }
      if (k === 3) { const a = slot(150, 110, 'a', '•'); tx(150, 150, '선언 타입 Animal', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
        ref(a.x1 - 30, a.y, 558, 80, 1, { by: -20 });
        chip(40, 220, 'a.type', { fs: 15, stroke: ACC, op: fade(u, 0.3) }); ref(120, 220, 562, o.rowsY[0], seg(u, 0.6, 1.2), { by: 40 });
        terminal(40, 280, 400, 100, ['animal'], seg(u, 1.4, 1.8), { title: 'console' });
        sub(700, 330, '필드는 선언 타입 기준 — 컴파일 때 정해진다', fade(u, 1.8), { 'font-size': 14 }); }
      return; }
    area(20, 20, 920, 385, 'Animal x = new Cat();', {});
    const o = cls(600, 70, 220, 'Cat 객체', [['(실제 타입 Cat)', { dim: true }]], { stroke: ACC });
    const x = slot(150, 100, 'x', '•'); ref(x.x1 - 30, x.y, 598, 100, 1, { by: -20 });
    if (k === 4) { chip(60, 200, 'Dog d = (Dog) x;', { fs: 15, stroke: BAD, col: BAD, op: fade(u, 0.2) });
      dot([[260, 200], [598, 120]], seg(u, 0.6, 1.2), BAD, 7); tx(710, 190, 'Cat ≠ Dog', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      banner(480, 300, '실행 중 ClassCastException', pop(u, 1.6)); }
    if (k === 5) { chip(60, 200, 'if (x instanceof Dog dog) dog.fetch();', { fs: 14.5, stroke: GOOD, col: GOOD, op: fade(u, 0.2) });
      dot([[300, 186], [598, 120]], seg(u, 0.5, 1.1), GOOD, 7); tx(710, 190, 'Dog 인가? 아니오', { 'font-size': 16, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      grow(460, 230, 460, 280, seg(u, 1.4, 1.8), MUT); tx(480, 310, 'false → 본문을 건너뛴다, 예외 없음', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); check(300, 304, 10, pop(u, 2.0)); } }

  const quiz = [
    { q: 'd.eat()를 불렀는데 Dog 클래스에는 eat() 코드가 없다. 무엇이 실행되는가?',
      o: ['컴파일 에러가 난다', '부모 Animal에서 물려받은 eat()이 실행된다', 'Object의 eat()이 실행된다'], a: 1,
      why: 'extends Animal 한 줄로 name과 eat()을 물려받는다. Dog에 없는 메서드는 부모에서 찾아 실행한다.' },
    { q: 'new Dog("바둑이")를 실행하면 콘솔에 찍히는 순서는 무엇인가?',
      o: ['Dog 생성자 다음 Animal 생성자', 'Animal 생성자만', 'Animal 생성자 다음 Dog 생성자'], a: 2,
      why: '자식 생성자 첫 줄의 super(name)이 부모 생성자를 먼저 끝낸다. 그다음에 Dog 본문이 실행된다.' },
    { q: 'Animal.sound()를 Cat이 재정의할 때 허용되는 것은 무엇인가?',
      o: ['public void sound()로 접근 범위를 넓히기', 'private void sound()로 좁히기', 'void sound(int n)으로 매개변수 바꾸기'], a: 0,
      why: '접근 범위는 넓히기만 된다. 매개변수를 바꾸면 재정의가 아니라 오버로딩이 된다.' },
    { q: 'Animal a = new Dog(); a.sound();에서 "멍멍"이 나오는 까닭은 무엇인가?',
      o: ['컴파일러가 Dog.sound()를 미리 골라 두기 때문이다', '실행할 때 실제 객체 Dog의 sound()를 찾아가기 때문이다', 'Animal.sound()가 자식을 자동으로 호출하기 때문이다'], a: 1,
      why: '컴파일러는 Animal에 sound()가 있는지만 본다. 어떤 구현을 부를지는 실행 중 실제 객체가 정한다.' },
    { q: 'Animal c = new Cat(); Dog bad = (Dog) c;는 어떻게 되는가?',
      o: ['컴파일 에러가 난다', '정상 실행되고 bad는 Cat처럼 동작한다', '컴파일은 되지만 실행 중 ClassCastException이 난다'], a: 2,
      why: 'Animal에서 Dog로의 캐스트는 문법상 허용된다. 실제 객체가 Cat이라 실행 중에 예외가 난다.' },
    { q: 'Animal a = new Cat();에서 a.type을 출력하면 무엇이 나오는가?',
      o: ['animal', 'cat', '컴파일 에러'], a: 0,
      why: '필드는 재정의되지 않고 객체 안에 칸이 둘 생긴다. 어느 칸을 읽을지는 선언 타입 Animal이 정한다.' },
  ];

  const summary = [
    'extends로 부모의 필드와 메서드를 물려받고, 클래스는 부모를 하나만 둔다.',
    '자식 객체를 만들면 부모 생성자가 먼저 돌고 자식 생성자 본문이 뒤따른다.',
    '부모 타입 변수로 불러도 실행되는 메서드는 실제 객체의 재정의 버전이다.',
    '확인 없이 다운캐스팅하면 실행 중에 예외가 나므로 instanceof로 먼저 본다.',
  ];
  const review = [
    { q: 'Dog에 sound(String s)를 만들었는데 for 문에서 x.sound()를 부르면 여전히 "..."이 나온다. 먼저 의심할 것은?',
      o: ['동적 바인딩이 꺼져 있다', '매개변수가 달라 재정의가 아니라 오버로딩이 됐다', 'Dog 생성자가 super()를 빠뜨렸다'], a: 1,
      why: 'sound(String)은 부모 sound()를 덮지 않는 새 메서드다. @Override를 붙였다면 컴파일 단계에서 잡혔다.' },
    { q: 'Animal에 인자 있는 생성자만 두었더니 Dog 클래스가 컴파일되지 않는다. 고칠 방법은?',
      o: ['Dog 생성자 첫 줄에 super(name)을 쓴다', 'Dog를 final로 만든다', 'Animal의 생성자를 private으로 바꾼다'], a: 0,
      why: 'super를 생략하면 컴파일러가 인자 없는 super()를 넣는데 받아 줄 생성자가 없다. 부모 생성자를 직접 부르면 된다.' },
    { q: 'Animal[] 배열을 도는 코드에 Cow 클래스를 새로 더했다. 반복문에서 고칠 곳은?',
      o: ['Cow용 if 분기를 하나 추가한다', 'instanceof Cow 검사를 넣는다', '고칠 곳이 없다'], a: 2,
      why: 'Cow가 sound()를 재정의하면 x.sound()가 실행 중에 Cow 구현을 찾아간다. 반복문은 그대로 둔다.' },
  ];

  R.page({ title: '상속과 동적 바인딩', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
