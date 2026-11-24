/* II-1-1 클래스·상속·인터페이스 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 클래스 카드, 힙 객체의 칸, 메서드 테이블(가상 호출 칸), 인터페이스 지도, 캐스팅 검사를 그린다.
 * 출력 문자열은 .NET 10 SDK 로 코드를 실제로 돌려 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 도우미 ----------
  // 클래스 카드: 윗띠에 이름, 아래로 멤버 줄. rows: [{t, fill, op, fw}] (op 0 이면 안 그림)
  function klass(x, y, w, title, rows, o) { o = o || {}; const rh = 26, n = o.n ?? rows.length, h = 36 + n * rh + 6, op = o.op ?? 1;
    if (op <= 0) return { x, y, w, h, row: (i) => y + 36 + i * rh + 13 };
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op, 'stroke-dasharray': o.dash });
    el('rect', { x: x + 1, y: y + 1, width: w - 2, height: 30, rx: 7, fill: o.head || SOFT, opacity: op });
    mono(x + 12, y + 21, title, { 'font-size': 15, 'font-weight': 800, fill: o.stroke || INK, opacity: op });
    if (o.tag) tx(x + w - 10, y + 21, o.tag, { 'font-size': 13.5, 'font-weight': 700, fill: o.tagCol || MUT, 'text-anchor': 'end', opacity: op });
    rows.forEach((r, i) => { if (!r || (r.op ?? 1) <= 0) return; const yy = y + 36 + i * rh + 18;
      if (r.hl) el('rect', { x: x + 5, y: yy - 17, width: w - 10, height: 23, rx: 5, fill: r.hl, opacity: op * (r.op ?? 1) });
      mono(x + 12, yy, r.t, { 'font-size': 14, fill: r.fill || INK, 'font-weight': r.fw || 500, opacity: op * (r.op ?? 1) }); });
    return { x, y, w, h, row: (i) => y + 36 + i * rh + 13 }; }
  // 상속 화살표 (속이 빈 삼각형 머리). 자식(x,y1) → 부모(x,y2)
  function inherit(x1, y1, x2, y2, u, col) { if (u <= 0) return; const ex = lerp(x1, x2, u), ey = lerp(y1, y2, u);
    el('line', { x1, y1, x2: ex, y2: ey, stroke: col || MUT, 'stroke-width': 2.2 });
    if (u > 0.97) { const a = Math.atan2(y2 - y1, x2 - x1), s = 11, bx = x2 - Math.cos(a) * s * 1.4, by = y2 - Math.sin(a) * s * 1.4;
      el('path', { d: `M${x2},${y2} L${bx + Math.sin(a) * s},${by - Math.cos(a) * s} L${bx - Math.sin(a) * s},${by + Math.cos(a) * s} Z`, fill: PANEL, stroke: col || MUT, 'stroke-width': 2.2 }); } }
  // 힙 객체: 칸을 위에서 아래로. rows: [{k, v, tag, col, vop}]
  function heapObj(x, y, w, title, rows, o) { o = o || {}; const rh = 34, op = o.op ?? 1;
    if (op <= 0) return; tx(x, y - 10, title, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op });
    rows.forEach((r, i) => { const yy = y + i * rh, s = r.s ?? 1; if (s <= 0) return;
      el('rect', { x, y: yy, width: w, height: rh, fill: r.bg || PANEL, stroke: r.col || INK, 'stroke-width': 1.8, opacity: op * s });
      mono(x + 10, yy + 22, r.k, { 'font-size': 14, fill: r.kcol || MUT, opacity: op * s });
      if (r.v) mono(x + (o.vx || 76), yy + 22, r.v, { 'font-size': 14.5, 'font-weight': 700, fill: r.vcol || INK, opacity: op * s * (r.vop ?? 1) });
      if (r.tag) tx(x + w - 8, yy + 22, r.tag, { 'font-size': 13.5, fill: r.tagCol || MUT, 'text-anchor': 'end', opacity: op * s }); }); }
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const code = (x, y, s, op, a) => mono(x, y, s, Object.assign({ 'font-size': 14.5, fill: INK, opacity: op ?? 1 }, a || {}));
  // 메서드 테이블: 칸 이름 → 가리키는 구현
  function mtable(x, y, w, title, slots, o) { o = o || {}; const op = o.op ?? 1, rh = 34; if (op <= 0) return;
    el('rect', { x, y, width: w, height: 32 + slots.length * rh + 8, rx: 8, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 2, opacity: op });
    mono(x + 10, y + 21, title, { 'font-size': 14.5, 'font-weight': 800, fill: o.stroke && o.stroke !== GRID ? o.stroke : INK, opacity: op });
    if (o.tag) tx(x + w - 8, y + 21, o.tag, { 'font-size': 13.5, 'font-weight': 700, fill: o.tagCol || MUT, 'text-anchor': 'end', opacity: op });
    slots.forEach((s, i) => { const yy = y + 32 + i * rh; if ((s.op ?? 1) <= 0) return; const so = op * (s.op ?? 1);
      el('rect', { x: x + 6, y: yy, width: w - 12, height: rh - 4, rx: 5, fill: s.bg || SOFT, stroke: s.col || 'none', 'stroke-width': 1.8, 'stroke-dasharray': s.dash, opacity: so });
      mono(x + 14, yy + 20, s.k, { 'font-size': 14, fill: MUT, opacity: so });
      mono(x + w - 14, yy + 20, s.v, { 'font-size': 14, 'font-weight': 700, fill: s.vcol || INK, 'text-anchor': 'end', opacity: so }); }); }

  // ---------- 1. 클래스 · 생성자 · 상속 ----------
  function s1(t, c) { const { k, u } = c;
    const A = klass(40, 36, 300, 'class Animal', [
      { t: 'string Name { get; }', op: k === 0 ? fade(u, 0.5) : 1 },
      { t: 'Animal(string name)', op: k === 0 ? fade(u, 0.9) : 1 },
      { t: 'void Eat()', op: k === 1 ? fade(u, 0.3) : k > 1 ? 1 : 0, hl: k === 1 ? ACCBG : null, fill: k === 1 ? ACC : INK, fw: k === 1 ? 700 : 500 },
    ], { op: k === 0 ? fade(u, 0.1, 0.3) : 1 });
    if (k >= 2) { const dy = 236;
      inherit(190, dy, 190, A.y + A.h, k === 2 ? E(u, 0.2, 0.9) : 1);
      code(206, (dy + A.y + A.h) / 2 + 5, ': Animal', k === 2 ? fade(u, 0.9) : 1, { fill: ACC, 'font-weight': 700 });
      klass(40, dy, 300, 'class Dog', [
        { t: 'Name · Eat()   ← 물려받음', fill: MUT, op: k === 2 ? fade(u, 1.5) : 1 },
        { t: 'string Breed { get; }', op: k === 2 ? fade(u, 2.0) : 1, hl: k === 2 ? ACCBG : null, fill: k === 2 ? ACC : INK },
        { t: 'Dog(name, breed) : base(name)', op: k === 3 ? fade(u, 0.3) : k > 3 ? 1 : 0, hl: k === 3 ? ACCBG : null, fill: k === 3 ? ACC : INK },
        { t: 'void Fetch()', op: k === 4 ? fade(u, 0.3) : k > 4 ? 1 : 0, hl: k === 4 ? ACCBG : null, fill: k === 4 ? ACC : INK },
      ], { op: k === 2 ? fade(u, 1.0, 0.4) : 1, stroke: k === 2 ? ACC : INK, n: 4 }); }
    // 오른쪽: 힙에 놓이는 객체의 칸
    const isDog = k >= 2, oy = 62, fillName = k === 3 ? E(u, 1.3, 1.7) : k > 3 ? 1 : 0, fillBreed = k === 3 ? E(u, 2.1, 2.5) : k > 3 ? 1 : 0;
    const rows = [{ k: '헤더', v: '', bg: SOFT }, { k: '타입', v: isDog ? '→ Dog' : '→ Animal', vcol: isDog ? ACC : INK },
      { k: 'Name', v: '"바둑이"', vop: fillName, tag: 'Animal 부분', bg: INFOBG, col: fillName > 0.5 && k === 3 ? INFO : INK }];
    if (isDog) rows.push({ k: 'Breed', v: '"진돗개"', vop: fillBreed, tag: 'Dog 부분', bg: ACCBG, s: k === 2 ? pop(u, 1.8) : 1, col: fillBreed > 0.5 && k === 3 ? ACC : INK });
    heapObj(690, oy, 240, isDog ? (k >= 5 ? '힙: d 가 가리키는 Dog 객체' : 'Dog 객체의 칸') : 'Animal 객체의 칸', rows, { op: k === 0 ? fade(u, 1.4) : 1 });
    if (k === 1) say(690, 230, 'Eat() 은 객체 칸을', fade(u, 1.2), { 'font-size': 14.5, fill: MUT }), say(690, 252, '늘리지 않는다 (타입에 있다)', fade(u, 1.2), { 'font-size': 14.5, fill: MUT });
    if (k === 2) say(690, 228, '부모 칸 위에 자식 칸이 붙는다', fade(u, 2.1), { 'font-size': 14.5, fill: ACC });
    // 생성 순서 (k ≥ 3)
    if (k >= 3) { const seq = [['① new Dog("바둑이", "진돗개")', INK], ['② : base(name) 로 먼저 넘김', ACC], ['③ Animal(name): Name 채움', INFO], ['④ Dog 본문: Breed 채움', ACC]];
      tx(400, 156, '생성 순서', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: k >= 5 ? 0.5 : 1 });
      seq.forEach(([s, col], i) => code(400, 184 + i * 26, s, (k === 3 ? fade(u, 0.3 + i * 0.6) : 1) * (k >= 5 ? 0.5 : 1), { fill: col, 'font-size': 14 }));
      if (k === 3) { grow(660, 236, 690, oy + 34 * 2 + 17, E(u, 1.3, 1.6), INFO); grow(640, 288, 690, oy + 34 * 3 + 17, E(u, 2.1, 2.4), ACC); } }
    if (k === 4) { // Fetch 안에서 부모 Name 사용
      const p = E(u, 0.7, 1.6); el('path', { d: 'M330,349 C380,349 380,296 340,296', fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: p });
      say(390, 330, 'Fetch() 안에서 부모의 Name 을 그대로 쓴다', fade(u, 1.4), { 'font-size': 14.5, fill: INFO }); }
    if (k >= 5) { // 스택의 d → 힙 객체, 호출 결과
      card(560, 116, 80, 40, { rx: 6, text: 'd', fs: 16, mono: true, s: pop(u, 0.2), stroke: ACC, color: ACC });
      tx(560, 82, '스택', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      grow(600, 116, 688, 116, E(u, 0.4, 0.9), ACC);
      terminal(400, 300, 540, 108, ['> d.Eat();', '바둑이 이(가) 먹는다', '> d.Fetch();', '바둑이(진돗개) 공을 문다'], E(u, 0.8, 2.4) * 4, { title: 'dotnet run' }); } }

  // ---------- 2. virtual · override · sealed · abstract (메서드 테이블) ----------
  function s2(t, c) { const { k, u } = c;
    const T = { x: 30, y: 60, w: 280 }, Ci = { x: 340, y: 160, w: 280 }, Sq = { x: 650, y: 160, w: 280 };
    // Shape 의 표
    mtable(T.x, T.y, T.w, 'Shape', [
      { k: 'Area()', v: '(비어 있음)', vcol: WARN, dash: '5 4', col: WARN, bg: PANEL },
      { k: 'Describe()', v: 'Shape.Describe', op: k === 1 ? fade(u, 0.4) : k > 1 ? 1 : 0, col: k === 1 ? GOOD : 'none', vcol: k === 1 ? GOOD : INK },
    ], { op: k === 0 ? fade(u, 0.1, 0.4) : 1, tag: 'abstract', tagCol: WARN });
    if (k === 0) { card(460, 92, 190, 40, { rx: 8, text: 'new Shape()', fs: 15, mono: true, s: pop(u, 1.2), stroke: BAD, color: BAD }); cross(578, 92, 12, pop(u, 1.6));
      say(380, 150, '본문 없는 칸이 남은 설계도는 객체가 될 수 없다', fade(u, 1.9), { 'font-size': 14.5, fill: MUT }); }
    if (k === 1) say(340, 132, 'virtual: 기본 구현이 있고, 자식이 바꿔도 된다', fade(u, 1.0), { 'font-size': 14.5, fill: GOOD });
    // Circle
    if (k >= 2) { inherit(Ci.x + 140, Ci.y, T.x + 200, T.y + 108, k === 2 ? E(u, 0.1, 0.6) : 1);
      mtable(Ci.x, Ci.y, Ci.w, 'Circle : Shape', [
        { k: 'Area()', v: 'Circle.Area  πr²', vcol: ACC, col: k === 2 ? ACC : 'none', bg: k === 2 ? ACCBG : SOFT, op: k === 2 ? fade(u, 1.0) : 1 },
        { k: 'Describe()', v: 'Shape.Describe', vcol: MUT, op: k === 2 ? fade(u, 1.5) : 1 },
      ], { op: k === 2 ? fade(u, 0.5) : 1, tag: 'override', tagCol: ACC });
      if (k === 2) say(Ci.x, Ci.y + 128, '빈 칸을 override 가 채운다', fade(u, 2.0), { 'font-size': 14.5, fill: ACC }); }
    // Square (sealed)
    if (k >= 3) { inherit(Sq.x + 60, Sq.y, T.x + 250, T.y + 108, k === 3 ? E(u, 0.1, 0.6) : 1);
      const ov = k === 4 ? E(u, 0.6, 1.2) : k > 4 ? 1 : 0;
      mtable(Sq.x, Sq.y, Sq.w, 'Square : Shape', [
        { k: 'Area()', v: 'Square.Area  side²', vcol: ACC, op: k === 3 ? fade(u, 1.0) : 1 },
        { k: 'Describe()', v: ov > 0.5 ? 'Square.Describe' : 'Shape.Describe', vcol: ov > 0.5 ? ACC : MUT, col: k === 4 && ov > 0.5 ? ACC : 'none', bg: k === 4 && ov > 0.5 ? ACCBG : SOFT },
      ], { op: k === 3 ? fade(u, 0.5) : 1, tag: 'sealed', tagCol: INK });
      if (k === 3) { R.lock(Sq.x + Sq.w - 70, Sq.y + 16, true, INK, pop(u, 1.3));
        card(Sq.x + 140, 350, 230, 40, { rx: 8, text: 'class Tiny : Square', fs: 14.5, mono: true, s: pop(u, 1.6), stroke: BAD, color: BAD, dash: '5 4' }); cross(Sq.x + 270, 350, 12, pop(u, 2.0)); }
      if (k === 4) { say(Sq.x, 290, 'override: 칸의 주소를 바꾼다', fade(u, 1.3), { 'font-size': 14.5, fill: ACC });
        say(Sq.x, 316, 'new 로 쓰면 칸은 Shape.Describe 그대로', fade(u, 2.0), { 'font-size': 14.5, fill: WARN }); } }
    // 부모 타입 변수로 호출
    if (k === 5) { card(120, 260, 200, 40, { rx: 6, text: 'Shape c', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      code(40, 312, '= new Circle { R = 2 }', fade(u, 0.3), { 'font-size': 14 });
      const route = [[220, 260], [Ci.x + 30, Ci.y + 100], [Ci.x + 140, Ci.y + 84], [Ci.x + 140, Ci.y + 50]];
      grow(220, 260, Ci.x, Ci.y + 84, E(u, 0.4, 0.8), ACC);
      dot([[220, 260], [Ci.x + 10, Ci.y + 84]], seg(u, 0.6, 1.1), ACC, 7);
      dot([[Ci.x + 140, Ci.y + 84], [Ci.x + 140, Ci.y + 50]], seg(u, 1.2, 1.6), INFO, 7);
      code(40, 360, 'c.Describe()', fade(u, 0.5), { fill: ACC, 'font-weight': 700 });
      say(40, 386, 'Describe 칸 → Area 칸 → Circle.Area', fade(u, 1.3), { 'font-size': 14.5, fill: MUT });
      terminal(Ci.x, 300, 270, 92, ['> c.Describe()', '넓이 12.6'], E(u, 1.7, 2.4) * 2, {});
      void route; } }

  // ---------- 3. 인터페이스 (계약 · 기본 구현 · 다중 구현 · 명시적 구현) ----------
  function s3(t, c) { const { k, u } = c;
    const IL = { x: 30, y: 36, w: 410 }, ID = { x: 30, y: 196, w: 410 }, FL = { x: 520, y: 36, w: 410 };
    klass(IL.x, IL.y, IL.w, 'interface ILogger', [
      { t: 'void Log(string msg);', fill: WARN },
      { t: 'void LogError(msg) => Log("[ERROR] " + msg)', op: k === 1 ? fade(u, 0.4) : k > 1 ? 1 : 0, fill: GOOD, hl: k === 1 ? GOODBG : null },
    ], { op: k === 0 ? fade(u, 0.1, 0.4) : 1, tag: k >= 1 ? '기본 구현 C# 8+' : '계약', tagCol: k >= 1 ? GOOD : MUT, n: 2 });
    if (k === 0) say(IL.x, 150, '몸통 없는 칸: 구현체가 채워야 한다', fade(u, 1.2), { 'font-size': 14.5, fill: WARN });
    if (k === 1) say(IL.x, 150, '구현체가 안 만들어도 이 몸통이 쓰인다', fade(u, 1.3), { 'font-size': 14.5, fill: GOOD });
    if (k >= 2) klass(ID.x, ID.y, ID.w, 'interface IDisposable', [{ t: 'void Dispose();', fill: WARN }], { op: k === 2 ? fade(u, 0.3) : 1, tag: '계약', stroke: k === 2 ? ACC : INK });
    if (k === 2) say(ID.x, 300, '계약이 둘. 클래스 하나가 둘 다 맡을 수 있다', fade(u, 1.4), { 'font-size': 14.5, fill: MUT });
    if (k >= 3) { const op = k === 3 ? fade(u, 0.2) : 1;
      klass(FL.x, FL.y, FL.w, 'FileLogger : ILogger, IDisposable', [
        { t: 'public void Log(string msg)', fill: ACC, fw: 700 },
        { t: 'void IDisposable.Dispose()', op: k === 4 ? fade(u, 0.4) : k > 4 ? 1 : 0, fill: INFO, hl: k === 4 ? INFOBG : null },
      ], { op, n: 2, stroke: ACC });
      grow(IL.x + IL.w, IL.y + 62, FL.x, FL.y + 62, k === 3 ? E(u, 0.6, 1.2) : 1, ACC);
      grow(ID.x + ID.w, ID.y + 50, FL.x, FL.y + 88, k === 3 ? E(u, 1.0, 1.6) : 1, MUT);
      if (k === 3) say(FL.x, 150, '부모 클래스는 하나, 인터페이스는 여러 개', fade(u, 1.8), { 'font-size': 14.5, fill: ACC }); }
    // 변수 타입별로 보이는 멤버
    if (k === 4) { const lens = [['FileLogger f', 'Log()', 'Dispose() 안 보임'], ['IDisposable d', 'Dispose()', '']];
      lens.forEach(([v, a, b], i) => { const y = 200 + i * 62, s = pop(u, 1.0 + i * 0.5);
        card(FL.x + 90, y, 180, 40, { rx: 6, text: v, fs: 14.5, mono: true, s, stroke: i ? INFO : INK, color: i ? INFO : INK });
        code(FL.x + 196, y + 5, a, fade(u, 1.2 + i * 0.5), { fill: GOOD, 'font-weight': 700 });
        if (b) code(FL.x + 270, y + 5, b, fade(u, 1.4), { fill: BAD }); });
      say(FL.x, 296, '명시적 구현은 인터페이스 타입으로만 보인다', fade(u, 2.0), { 'font-size': 14.5, fill: INFO }); }
    if (k >= 5) { card(FL.x + 90, 200, 180, 40, { rx: 6, text: 'ILogger log', fs: 14.5, mono: true, stroke: ACC, color: ACC, s: k === 5 ? pop(u, 0.2) : 1 });
      grow(FL.x + 180, 200, FL.x + 230, FL.y + 102, k === 5 ? E(u, 0.3, 0.6) : 1, ACC);
      if (k === 5) { dot([[FL.x + 180, 200], [FL.x + 250, FL.y + 62]], seg(u, 0.6, 1.1), ACC, 7);
        dot([[FL.x + 90, 200], [IL.x + IL.w - 30, IL.y + 88], [IL.x + 300, IL.y + 62], [FL.x, FL.y + 62]], seg(u, 1.3, 2.2), GOOD, 7); }
      const lines = ['> log.Log("주문 저장")', '[FILE] 주문 저장', '> log.LogError("타임아웃")', '[FILE] [ERROR] 타임아웃'];
      if (k === 6) lines.push('> ((IDisposable)log).Dispose()', '파일 핸들 닫음');
      terminal(FL.x, 252, FL.w, 160, lines, k === 5 ? E(u, 0.8, 2.4) * 4 : 4 + E(u, 0.8, 1.8) * 2, { title: 'dotnet run', lh: 20 });
      if (k === 6) { card(ID.x + 205, 340, 300, 40, { rx: 6, text: '(IDisposable)log', fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.2) });
        grow(ID.x + 205, 320, ID.x + 205, ID.y + 66, E(u, 0.4, 0.8), INFO);
        say(ID.x, 396, '캐스팅해야 Dispose 가 보인다', fade(u, 1.0), { 'font-size': 14.5, fill: INFO }); } } }

  // ---------- 4. 다형성 (가상 디스패치) ----------
  const MT = { x: 640, w: 290, y: [36, 150, 264] };
  function s4(t, c) { const { k, u } = c;
    // 오른쪽: 타입별 메서드 테이블의 Speak 칸
    mtable(MT.x, MT.y[0], MT.w, 'Animal', [{ k: 'Speak()', v: '"..."' }], { op: k === 0 ? fade(u, 0.2) : 1, tag: 'virtual', tagCol: GOOD });
    if (k >= 1) { mtable(MT.x, MT.y[1], MT.w, 'Dog : Animal', [{ k: 'Speak()', v: '"멍멍!"', vcol: ACC, col: k === 1 ? ACC : 'none', bg: k === 1 ? ACCBG : SOFT }], { op: k === 1 ? fade(u, 0.3) : 1, tag: 'override', tagCol: ACC });
      inherit(MT.x + MT.w - 30, MT.y[1], MT.x + MT.w - 30, MT.y[0] + 74, k === 1 ? E(u, 0.8, 1.3) : 1); }
    if (k >= 2) { mtable(MT.x, MT.y[2], MT.w, 'Cat : Animal', [{ k: 'Speak()', v: '"야옹~"', vcol: INFO, col: k === 2 ? INFO : 'none', bg: k === 2 ? INFOBG : SOFT }], { op: k === 2 ? fade(u, 0.3) : 1, tag: 'override', tagCol: INFO });
      el('path', { d: `M${MT.x + MT.w + 6},${MT.y[2] + 30} C${MT.x + MT.w + 26},${MT.y[2]} ${MT.x + MT.w + 26},${MT.y[0] + 74} ${MT.x + MT.w + 6},${MT.y[0] + 60}`, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: k === 2 ? fade(u, 0.9) : 1 }); }
    if (k === 0) { say(40, 120, 'Animal a = new Animal();', fade(u, 0.8), { 'font-family': 'monospace' }); say(40, 150, 'a.Speak() → 칸에 적힌 "..."', fade(u, 1.4), { fill: MUT });
      say(40, 200, '재정의가 없으면 부모 구현이 그대로 쓰인다', fade(u, 2.0), { 'font-size': 14.5, fill: MUT }); }
    if (k === 1 || k === 2) { const s = k === 1 ? 'Animal a = new Dog();' : 'Animal a = new Cat();', r = k === 1 ? '"멍멍!"' : '"야옹~"', col = k === 1 ? ACC : INFO;
      code(40, 120, s, fade(u, 0.5)); code(40, 150, 'a.Speak()  →  ' + r, fade(u, 1.5), { fill: col, 'font-weight': 700 });
      say(40, 200, k === 1 ? '변수 타입은 Animal, 고르는 건 실제 객체' : '부모 코드는 한 줄도 안 바뀌었다', fade(u, 2.0), { 'font-size': 14.5, fill: MUT }); }
    // 리스트 → 객체 → 테이블
    if (k >= 3) { const kinds = ['Dog', 'Cat', 'Dog'], cols = [ACC, INFO, ACC], oy = [80, 190, 300];
      tx(40, 52, 'List<Animal> zoo', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      kinds.forEach((kd, i) => { const sy = 80 + i * 56, s = k === 3 ? pop(u, 0.2 + i * 0.35) : 1;
        card(110, sy + 18, 140, 44, { rx: 6, text: `[${i}] Animal`, fs: 14, mono: true, s, stroke: GRID });
        const os = k === 3 ? pop(u, 0.6 + i * 0.35) : 1;
        card(400, oy[i], 120, 56, { rx: 8, text: kd + ' 객체', fs: 15, s: os, stroke: cols[i], color: cols[i] });
        grow(180, sy + 18, 340, oy[i], k === 3 ? E(u, 0.8 + i * 0.35, 1.1 + i * 0.35) : 1, MUT);
        const ty = kd === 'Dog' ? MT.y[1] + 52 : MT.y[2] + 52;
        el('line', { x1: 460, y1: oy[i], x2: MT.x, y2: ty, stroke: cols[i], 'stroke-width': 1.6, 'stroke-dasharray': '4 4', opacity: k === 3 ? fade(u, 1.8 + i * 0.2) : 0.7 }); });
      if (k === 3) say(40, 400, '담을 때는 모두 Animal, 객체 안의 타입은 그대로', fade(u, 2.2), { 'font-size': 14.5, fill: MUT }); }
    if (k === 4 || k === 5) { const kinds = ['Dog', 'Cat', 'Dog'], oy = [80, 190, 300];
      code(40, 270, 'foreach (Animal a in zoo)', 1, { 'font-size': 14 }); code(60, 294, 'a.Speak();', 1, { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      kinds.forEach((kd, i) => { const a = 0.3 + i * 0.75, ty = kd === 'Dog' ? MT.y[1] + 52 : MT.y[2] + 52;
        if (k === 4) dot([[180, 98 + i * 56], [400, oy[i]], [MT.x + 40, ty]], seg(u, a, a + 0.6), kd === 'Dog' ? ACC : INFO, 7);
        const out = kd === 'Dog' ? '멍멍!' : '야옹~', op = k === 4 ? fade(u, a + 0.6) : 1;
        pill(560, oy[i] - 36, out, kd === 'Dog' ? ACC : INFO, op > 0 ? 1 : 0, { fs: 14, fill: PANEL, op }); });
      if (k === 5) terminal(40, 316, 300, 98, ['멍멍!', '야옹~', '멍멍!'], E(u, 0.3, 1.8) * 3, { title: '출력 순서 = 담은 순서', lh: 19 }); }
    if (k === 6) { code(40, 270, 'foreach (Animal a in zoo)', 1, { 'font-size': 14 }); code(60, 294, 'a.Speak();', 1, { 'font-size': 14, fill: ACC, 'font-weight': 700 }); check(200, 288, 9, pop(u, 1.4));
      el('rect', { x: 380, y: 330, width: 230, height: 70, rx: 8, fill: PANEL, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.3) });
      code(394, 356, 'class Cow : Animal', fade(u, 0.4), { fill: GOOD, 'font-weight': 700, 'font-size': 14 });
      code(394, 382, 'Speak() => "음메~"', fade(u, 0.7), { fill: GOOD, 'font-size': 14 });
      say(40, 360, '새 타입은 추가만, 반복문은 그대로', fade(u, 1.6), { 'font-size': 14.5, fill: GOOD }); } }

  // ---------- 5. 캐스팅 — 두 줄: 실제 객체가 Dog 일 때 / Cat 일 때 ----------
  function lane(y, kind, col) { card(90, y, 120, 48, { rx: 8, text: kind + ' 객체', fs: 15, stroke: col, color: col });
    code(30, y - 34, 'Animal a →', 1, { fill: MUT, 'font-size': 14 }); }
  function s5(t, c) { const { k, u } = c, Y = [130, 300];
    tx(30, 40, '실제 객체를 보고 검사한다', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    lane(Y[0], 'Dog', ACC); lane(Y[1], 'Cat', INFO);
    const ops = ['(Dog)a', 'a as Dog', 'a is Dog d3', 'a switch { … }', 'a.Speak()'], op = ops[k];
    const gx = 330; card(gx, 215, 170, 44, { rx: 22, text: op, fs: 15, mono: true, s: pop(u, 0.2), stroke: k === 4 ? GOOD : INK, color: k === 4 ? GOOD : INK });
    // 두 객체에서 검사기로
    [0, 1].forEach((i) => { const y = Y[i]; grow(150, y, gx - 85, 215 + (i ? 10 : -10), E(u, 0.4 + i * 0.2, 0.8 + i * 0.2), MUT); dot([[150, y], [gx - 85, 215]], seg(u, 0.6 + i * 0.2, 1.1 + i * 0.2), i ? INFO : ACC, 6); });
    const res = (i, s, col, a, o) => { o = o || {}; grow(gx + 85, 215, 560, Y[i], E(u, a, a + 0.3), col); card(o.cx || 700, Y[i], o.w || 260, 48, { rx: 8, text: s, fs: 14.5, mono: true, s: pop(u, a + 0.3), stroke: col, color: col, fill: o.fill }); };
    if (k === 0) { res(0, 'd1 = Dog ✓', GOOD, 1.2); res(1, 'InvalidCastException', BAD, 1.6, { fill: BADBG });
      tx(700, 360, 'Unable to cast … Cat to Dog', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 2.1) }); }
    if (k === 1) { res(0, 'd2 = Dog', GOOD, 1.2); res(1, 'd2 = null', WARN, 1.6);
      code(570, 360, 'if (d2 is not null) 를 빼면 NRE', fade(u, 2.1), { fill: WARN, 'font-size': 14 }); }
    if (k === 2) { res(0, 'true → d3 사용', GOOD, 1.2); res(1, 'false → d3 없음', MUT, 1.6);
      say(570, 360, '검사와 변수 묶기가 한 문장', fade(u, 2.1), { 'font-size': 14.5, fill: GOOD }); }
    if (k === 3) { const arms = [['Dog => "멍멍!"', ACC], ['Cat => "야옹~"', INFO], ['_   => "..."', MUT]];
      arms.forEach(([s, col], i) => { const y = 120 + i * 60; card(720, y, 260, 44, { rx: 6, text: s, fs: 14.5, mono: true, s: pop(u, 0.4 + i * 0.2), stroke: col, color: col }); });
      grow(gx + 85, 215, 590, 120, E(u, 1.2, 1.5), ACC); grow(gx + 85, 215, 590, 180, E(u, 1.5, 1.8), INFO);
      el('rect', { x: 590, y: 300, width: 260, height: 44, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-dasharray': '5 4', 'stroke-width': 2, opacity: fade(u, 2.0) });
      code(604, 327, 'Cow => ?  갈래를 또 추가', fade(u, 2.0), { fill: WARN, 'font-size': 14 }); }
    if (k === 4) { res(0, 'Dog.Speak → 멍멍!', GOOD, 1.0); res(1, 'Cat.Speak → 야옹~', GOOD, 1.3);
      const st = fade(u, 1.8); code(560, 400, 'is / as / switch 분기', st, { fill: MUT, 'text-decoration': 'line-through', 'font-size': 14 });
      say(560, 380, '캐스팅이 통째로 사라진다', fade(u, 2.0), { 'font-size': 14.5, fill: GOOD }); } }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'new Dog("바둑이", "진돗개")를 만들 때 객체 칸이 채워지는 순서는 무엇인가?',
      o: ['Breed가 먼저, 그다음 Name', ': base(name)로 Animal 생성자가 먼저 돌아 Name, 그다음 Breed', '둘이 동시에 채워진다'], a: 1,
      why: '자식 생성자는 부모 생성자를 먼저 부른다. Animal 부분의 Name이 채워진 뒤에 Dog 본문이 Breed를 채운다.' },
    { q: 'Shape c = new Circle { R = 2 }; c.Describe()가 "넓이 12.6"을 출력하는 이유는 무엇인가?',
      o: ['Shape의 Describe가 Area 칸을 부르고, Circle은 그 칸을 override로 채웠기 때문', '변수 타입이 Shape라서 Shape.Area가 실행되기 때문', 'Describe가 sealed라서'], a: 0,
      why: 'Describe는 그대로 Shape 것이지만 안에서 부르는 Area() 칸은 Circle.Area를 가리킨다. 반지름 2의 넓이 12.566… 이 F1 형식으로 12.6이 된다.' },
    { q: 'FileLogger가 Dispose를 void IDisposable.Dispose()로 구현했다. FileLogger 타입 변수로 f.Dispose()를 부르면 어떻게 되나?',
      o: ['정상 호출된다', 'ILogger의 기본 구현이 대신 돈다', '보이지 않아 컴파일되지 않는다. IDisposable로 캐스팅해야 한다'], a: 2,
      why: '명시적 구현은 그 인터페이스 타입으로 볼 때만 드러난다. ((IDisposable)log).Dispose()처럼 캐스팅해서 부른다.' },
    { q: 'List<Animal> 에 Dog, Cat, Dog를 담고 foreach로 a.Speak()를 부르면 무엇이 찍히나?',
      o: ['... / ... / ...', '멍멍! / 야옹~ / 멍멍!', '컴파일 에러'], a: 1,
      why: '변수 타입은 Animal이지만 런타임이 실제 객체의 Speak 칸을 따라간다. 담은 순서대로 멍멍!, 야옹~, 멍멍! 이 나온다.' },
    { q: 'a가 실제로 Cat일 때 Dog? d2 = a as Dog; 의 결과는 무엇인가?',
      o: ['InvalidCastException이 난다', 'd2는 null이 된다', 'd2는 Cat 객체를 가리킨다'], a: 1,
      why: 'as는 실패하면 예외 대신 null을 준다. 그래서 바로 d2.Fetch()를 부르면 NullReferenceException이 난다.' },
  ];

  const summary = [
    '자식 객체는 부모 칸 위에 자기 칸을 더한 모양이고, 생성할 때 부모 생성자가 먼저 돈다.',
    'virtual 칸을 자식이 override로 바꾸면 부모 타입 변수로 불러도 자식 구현이 실행된다.',
    '인터페이스는 여러 개를 구현할 수 있고, 명시적 구현은 그 인터페이스 타입으로만 보인다.',
    'is·as 분기가 늘어나면 virtual 메서드로 옮겨 각 타입이 알아서 동작하게 한다.',
  ];
  const review = [
    { q: 'Dog가 Speak()를 override 대신 new로 선언했다. Animal a = new Dog(); a.Speak()는 무엇을 부르나?',
      o: ['Animal의 Speak', 'Dog의 Speak', '컴파일 에러'], a: 0,
      why: 'new는 메서드 테이블의 칸을 바꾸지 않고 이름만 가린다. 부모 타입 변수로 부르면 칸에 적힌 부모 구현이 돈다.' },
    { q: 'Dog 생성자에서 : base(name)을 지웠더니 빌드가 깨졌다. 먼저 의심할 것은 무엇인가?',
      o: ['Dog에 Breed 프로퍼티가 없어서', 'Animal에 매개변수 없는 생성자가 없어서', 'Dog가 sealed가 아니라서'], a: 1,
      why: ': base를 생략하면 컴파일러는 부모의 매개변수 없는 생성자를 찾는다. Animal(string name) 하나뿐이면 CS7036 오류가 난다.' },
    { q: '로거 구현을 파일에서 DB로 바꾸려 한다. 호출부를 건드리지 않으려면 변수 타입을 무엇으로 두어야 하나?',
      o: ['FileLogger', 'object', 'ILogger'], a: 2,
      why: '호출부가 ILogger 계약만 알면 new 부분만 갈아 끼우면 된다. 실제 실행은 담긴 객체의 구현이 맡는다.' },
  ];

  R.page({ title: '클래스와 객체의 칸', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
