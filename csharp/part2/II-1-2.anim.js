/* II-1-2 제네릭 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 스택과 힙의 칸, 박싱 상자, List<T> 의 T 자리, where 제약이 여는 연산, 공변·반공변 방향, JIT 특수화를 그린다.
 * 출력 문자열(42, 2,1, 9, z, 0, List`1[System.Int32], InvalidCastException 메시지)은 .NET 10 SDK 로 실제 실행해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, pill, grow, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const code = (x, y, s, op, a) => mono(x, y, s, Object.assign({ 'font-size': 14.5, fill: INK, opacity: op ?? 1 }, a || {}));
  function klass(x, y, w, title, rows, o) { o = o || {}; const rh = 26, n = o.n ?? rows.length, h = 36 + n * rh + 6, op = o.op ?? 1;
    if (op <= 0) return { x, y, w, h };
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op, 'stroke-dasharray': o.dash });
    el('rect', { x: x + 1, y: y + 1, width: w - 2, height: 30, rx: 7, fill: o.head || SOFT, opacity: op });
    mono(x + 12, y + 21, title, { 'font-size': 15, 'font-weight': 800, fill: o.stroke || INK, opacity: op });
    if (o.tag) tx(x + w - 10, y + 21, o.tag, { 'font-size': 13.5, 'font-weight': 700, fill: o.tagCol || MUT, 'text-anchor': 'end', opacity: op });
    rows.forEach((r, i) => { if (!r || (r.op ?? 1) <= 0) return; const yy = y + 36 + i * rh + 18;
      if (r.hl) el('rect', { x: x + 5, y: yy - 17, width: w - 10, height: 23, rx: 5, fill: r.hl, opacity: op * (r.op ?? 1) });
      mono(x + 12, yy, r.t, { 'font-size': 14, fill: r.fill || INK, 'font-weight': r.fw || 500, opacity: op * (r.op ?? 1) }); });
    return { x, y, w, h }; }
  // 힙의 박싱 상자: 위에 타입 이름, 안에 값
  function boxed(cx, cy, type, val, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const g = R.G(cx, cy, s, o.op);
    el('rect', { x: -66, y: -32, width: 132, height: 64, rx: 6, fill: o.fill || WARNBG, stroke: o.col || WARN, 'stroke-width': 2.2 }, g);
    el('line', { x1: -66, y1: -8, x2: 66, y2: -8, stroke: o.col || WARN, 'stroke-width': 1.4 }, g);
    tx(0, -14, type, { 'font-size': 13.5, 'font-weight': 700, fill: o.col || WARN, 'text-anchor': 'middle', class: 'mono' }, g);
    tx(0, 19, val, { 'font-size': 16, 'font-weight': 800, fill: INK, 'text-anchor': 'middle', class: 'mono' }, g); }
  // 배열 칸 한 줄 (x 왼쪽, y 위)
  function slots(x, y, n, w, vals, o) { o = o || {};
    for (let i = 0; i < n; i++) { const v = vals[i], st = (o.style && o.style(i)) || {};
      el('rect', { x: x + i * w, y, width: w, height: 46, fill: st.fill || PANEL, stroke: st.stroke || INK, 'stroke-width': 1.8, opacity: o.op ?? 1 });
      if (v != null) mono(x + i * w + w / 2, y + 29, String(v), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: st.color || INK, opacity: (o.op ?? 1) * (st.vop ?? 1) });
      mono(x + i * w + w / 2, y + 64, `[${i}]`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 }); } }

  // ---------- 1. object 컬렉션: 박싱과 런타임 캐스팅 ----------
  const BX = [380, 570, 760], BY = 290, SX = 330, SW = 80;
  function s1(t, c) { const { k, u } = c;
    zone(18, 30, 210, 380, '스택', {}); zone(250, 30, 690, 380, '힙', {});
    code(270, 78, 'ArrayList  _items: object[]', 1, { 'font-size': 14, 'font-weight': 700 });
    const has = [k > 0 || u > 1.2, k > 1 || (k === 1 && u > 0.9), k > 1 || (k === 1 && u > 1.9)];
    slots(SX, 96, 4, SW, [], { style: (i) => ({ fill: i < 3 && has[i] ? SOFT : PANEL }) });
    // 칸 → 상자 화살표
    const arrowU = [k === 0 ? E(u, 1.2, 1.6) : 1, k === 1 ? E(u, 0.9, 1.3) : k > 1 ? 1 : 0, k === 1 ? E(u, 1.9, 2.3) : k > 1 ? 1 : 0];
    arrowU.forEach((a, i) => { if (a > 0) { el('circle', { cx: SX + i * SW + SW / 2, cy: 119, r: 5, fill: INK }); grow(SX + i * SW + SW / 2, 124, BX[i], BY - 34, a, MUT); } });
    // 42 가 스택에서 힙 상자로
    if (k === 0) { const f = E(u, 0.4, 1.1); code(70, 120, 'int 42', 1 - f, { 'font-size': 16, 'font-weight': 800 });
      if (f > 0 && f < 1) card(lerp(110, BX[0], f), lerp(120, BY, f), 70, 30, { rx: 6, text: '42', fs: 15, mono: true, fill: WARNBG, stroke: WARN });
      boxed(BX[0], BY, 'Int32 상자', '42', { s: pop(u, 1.0) });
      say(270, 390, '값 타입을 object 칸에 넣으면 힙에 상자를 만든다 (박싱)', fade(u, 1.8), { 'font-size': 14.5, fill: WARN }); }
    else boxed(BX[0], BY, 'Int32 상자', '42', {});
    if (k >= 1) { boxed(BX[1], BY, 'Double 상자', '3.14', { s: k === 1 ? pop(u, 0.7) : 1 });
      boxed(BX[2], BY, 'String 객체', '"hello"', { s: k === 1 ? pop(u, 1.7) : 1, col: INFO, fill: INFOBG });
      if (k === 1) say(270, 390, '3.14 도 박싱, string 은 원래 힙 객체라 참조만 담긴다', fade(u, 2.2), { 'font-size': 14.5, fill: MUT }); }
    if (k === 2) { dot([[SX + SW / 2, 119], [BX[0], BY - 34]], seg(u, 0.3, 0.9), ACC, 7);
      pill(BX[0], BY + 56, 'Int32 맞음 ✓', GOOD, pop(u, 1.0), { fs: 14 });
      const f = E(u, 1.3, 2.0); if (f > 0 && f < 1) card(lerp(BX[0], 120, f), lerp(BY, 210, f), 60, 28, { rx: 6, text: '42', fs: 15, mono: true, stroke: ACC, color: ACC });
      card(120, 210, 150, 42, { rx: 6, text: f >= 1 ? 'a = 42' : 'a', fs: 15, mono: true, s: pop(u, 0.2), stroke: ACC, color: ACC });
      say(36, 260, '값을 꺼내 복사', fade(u, 2.0), { 'font-size': 14.5, fill: ACC }); say(36, 282, '(언박싱)', fade(u, 2.0), { 'font-size': 14.5, fill: ACC }); }
    if (k >= 3) { if (k === 3) dot([[SX + 2 * SW + SW / 2, 119], [BX[2], BY - 34]], seg(u, 0.3, 0.9), BAD, 7);
      card(120, 210, 150, 42, { rx: 6, text: 'a = 42', fs: 15, mono: true, stroke: ACC, color: ACC, op: 0.5 });
      card(120, 270, 150, 42, { rx: 6, text: 'int b', fs: 15, mono: true, stroke: BAD, color: BAD, s: k === 3 ? pop(u, 0.2) : 1 });
      pill(BX[2], BY + 56, 'Int32 아님 ✗', BAD, k === 3 ? pop(u, 1.0) : 1, { fs: 14 });
      // 컴파일 → 실행 띠
      const y = 378; card(360, y, 150, 34, { rx: 17, text: '컴파일 ✓ 통과', fs: 14, stroke: GOOD, color: GOOD, s: k === 3 ? pop(u, 1.3) : 1 });
      grow(438, y, 520, y, k === 3 ? E(u, 1.5, 1.8) : 1, MUT);
      card(670, y, 290, 34, { rx: 17, text: '실행 ✗ InvalidCastException', fs: 14, stroke: BAD, color: BAD, fill: BADBG, s: k === 3 ? pop(u, 1.9) : 1 }); }
    if (k === 4) { el('rect', { x: BX[0] - 74, y: BY - 40, width: BX[1] - BX[0] + 148, height: 80, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 0.3) });
      say(270, 216, '상자 2개 = 힙 할당 2번 + GC 몫', fade(u, 0.6), { 'font-size': 14.5, fill: WARN });
      say(36, 340, '무엇이 들었는지', fade(u, 1.2), { 'font-size': 14.5, fill: BAD }); say(36, 362, '실행해야 안다', fade(u, 1.2), { 'font-size': 14.5, fill: BAD }); } }

  // ---------- 2. List<int> — T 자리에 int ----------
  function tmpl(cx, cy, tval, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const g = R.G(cx, cy, s, o.op);
    const w = o.w || 170; el('rect', { x: -w / 2, y: -22, width: w, height: 44, rx: 8, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2 }, g);
    if (o.hole) el('rect', { x: -w / 2 + 6, y: -16, width: w - 12, height: 32, rx: 6, fill: 'none', stroke: ACC, 'stroke-dasharray': '4 3' }, g);
    R.spans(0, 6, [['List<', { fill: o.col || INK }], [tval || 'T', { fill: ACC }], ['>', { fill: o.col || INK }]], { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' }, g); }
  function s2(t, c) { const { k, u } = c;
    zone(18, 140, 210, 270, '스택', {});
    tmpl(130, 64, 'T', { hole: true, w: 150 });
    const fT = k === 0 ? E(u, 0.5, 1.2) : 1;
    grow(205, 64, 316, 64, k === 0 ? E(u, 1.2, 1.5) : 1, ACC);
    if (k === 0 && fT < 1) pill(lerp(60, 140, fT), lerp(120, 64, fT), 'int', ACC, 1, { fs: 14, mono: true });
    tmpl(400, 64, 'int', { s: k === 0 ? pop(u, 1.4) : 1, col: ACC });
    // List<int> 의 int[] 칸
    code(270, 168, 'List<int>  _items: int[]', k === 0 ? fade(u, 1.8) : 1, { 'font-size': 14, 'font-weight': 700 });
    const vals = [k > 1 || (k === 1 && u > 1.0) ? 42 : null, k > 1 || (k === 1 && u > 1.8) ? 7 : null];
    slots(300, 184, 4, 74, vals, { op: k === 0 ? fade(u, 1.8) : 1, style: (i) => ({ fill: vals[i] != null ? ACCBG : PANEL, color: ACC }) });
    if (k === 1) { [42, 7].forEach((v, i) => { const a = 0.4 + i * 0.8, f = E(u, a, a + 0.6); if (f > 0 && f < 1) card(lerp(110, 337 + i * 74, f), lerp(220, 207, f), 50, 30, { rx: 6, text: String(v), fs: 15, mono: true, stroke: ACC, color: ACC }); });
      say(300, 290, '상자 없이 값이 배열 칸에 바로 들어간다', fade(u, 2.0), { 'font-size': 14.5, fill: GOOD }); }
    if (k === 2) { const y = 340; ['소스', '컴파일러', '실행'].forEach((s, i) => card(330 + i * 220, y, 130, 40, { rx: 8, text: s, fs: 15, s: pop(u, 0.2 + i * 0.15), stroke: i === 1 ? INK : GRID, color: i === 2 ? MUT : INK }));
      grow(395, y, 485, y, E(u, 0.6, 0.8), MUT); grow(615, y, 705, y, E(u, 0.6, 0.8), GRID, { dash: '5 4' });
      const f = E(u, 0.9, 1.5); card(lerp(330, 500, f), 290, 160, 32, { rx: 6, text: 'list.Add("hi")', fs: 14, mono: true, stroke: BAD, color: BAD });
      cross(605, 290, 12, pop(u, 1.5)); code(430, 400, 'CS1503: string 을 int 로 변환 불가', fade(u, 1.8), { fill: BAD, 'font-size': 14 }); }
    if (k >= 3) card(120, 190, 150, 42, { rx: 6, text: 'n = 42', fs: 15, mono: true, stroke: ACC, color: ACC, s: k === 3 ? pop(u, 1.4) : 1, op: k > 3 ? 0.6 : 1 });
    if (k === 3) { dot([[337, 207], [120, 190]], seg(u, 0.4, 1.2), ACC, 7);
      code(300, 300, 'int n = list[0];', fade(u, 0.3), { 'font-weight': 700 }); say(300, 330, '(int) 캐스팅도, 언박싱도 없다', fade(u, 1.6), { 'font-size': 14.5, fill: GOOD }); }
    if (k === 4) { [['string', 620], ['Order', 830]].forEach(([tv, x], i) => {
        el('path', { d: `M130,40 C130,8 ${x},8 ${x},40`, fill: 'none', stroke: ACC, 'stroke-width': 1.8, 'stroke-dasharray': '5 4', opacity: fade(u, 0.3 + i * 0.5) });
        tmpl(x, 64, tv, { s: pop(u, 0.6 + i * 0.5), col: INFO, w: tv === 'Order' ? 180 : 190 }); });
      say(300, 300, '정의는 List<T> 하나, 타입마다 전용 컬렉션', fade(u, 1.8), { 'font-size': 14.5, fill: INFO }); }
    if (k === 5) { [0, 1].forEach((i) => dot([[337 + i * 74, 230], [700, 300]], seg(u, 0.3 + i * 0.7, 0.9 + i * 0.7), ACC, 6));
      code(270, 290, 'foreach (int x in list)', 1, { 'font-size': 14 });
      terminal(640, 260, 290, 110, ['42', '7'], E(u, 0.8, 1.9) * 2, { title: 'Console.WriteLine(x)' }); } }

  // ---------- 3. Box<T> · Swap<T> · IRepository<T> ----------
  function s3(t, c) { const { k, u } = c;
    klass(30, 36, 360, 'class Box<T>', [{ t: 'public T Value { get; }', fill: ACC, fw: 700 }, { t: 'public Box(T value)' }], { op: k === 0 ? fade(u, 0.2) : 1, tag: 'T 미정', tagCol: ACC });
    if (k === 0) say(30, 170, 'T 가 무엇인지 모른 채 로직을 쓴다', fade(u, 1.3), { 'font-size': 14.5, fill: MUT });
    if (k >= 1) { [['Box<int>', 'Value: 42', 540, 80], ['Box<string>', 'Value: "hi"', 800, 160]].forEach(([n, v, x, by], i) => {
        const s = k === 1 ? pop(u, 0.4 + i * 0.5) : 1; grow(390, 70 + i * 40, x - 112, by, k === 1 ? E(u, 0.3 + i * 0.5, 0.6 + i * 0.5) : 1, MUT);
        card(x, by, 220, 70, { rx: 8, text: n + '\n' + v, fs: 15, mono: true, s, stroke: i ? INFO : ACC, color: i ? INFO : ACC }); });
      if (k === 1) code(430, 240, 'a.Value  →  42   (int 그대로)', fade(u, 1.8), { fill: ACC, 'font-weight': 700 }); }
    if (k >= 2) klass(30, 200, 360, 'static void Swap<T>', [{ t: '(ref T x, ref T y)', fill: ACC }, { t: '(x, y) = (y, x);' }], { op: k === 2 ? fade(u, 0.2) : 1, tag: '메서드만 제네릭', tagCol: ACC });
    if (k === 2) say(430, 240, '클래스가 아니라 메서드 하나에 <T>', fade(u, 1.2), { 'font-size': 14.5, fill: MUT });
    if (k >= 3) { const sw = k === 3 ? E(u, 1.4, 2.2) : 1, x1 = 520, x2 = 660, y = 236;
      code(430, y + 6, 'p', 1, { fill: MUT }); code(600, y + 6, 'q', 1, { fill: MUT });
      card(x1, y, 70, 44, { rx: 6, text: '', stroke: INK }); card(x2, y, 70, 44, { rx: 6, text: '', stroke: INK });
      const ya = y - Math.sin(sw * Math.PI) * 36;
      mono(lerp(x1, x2, sw), ya + 6, '1', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      mono(lerp(x2, x1, sw), y + Math.sin(sw * Math.PI) * 36 + 6, '2', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
      if (k === 3) { const f = E(u, 0.3, 1.0); if (f < 1) pill(lerp(520, 260, f), lerp(200, 248, f), 'int', ACC, 1, { fs: 13.5, mono: true });
        code(220, 262, 'T = int', fade(u, 1.0), { fill: ACC, 'font-weight': 800, 'font-size': 14 }); }
      card(820, y, 120, 40, { rx: 6, text: '2,1', fs: 16, mono: true, stroke: GOOD, color: GOOD, s: k === 3 ? pop(u, 2.3) : 1 });
      if (k === 3) say(430, 300, 'Swap(ref p, ref q) — <int> 를 안 써도 인자에서 추론', fade(u, 1.2), { 'font-size': 14.5, fill: MUT }); }
    if (k === 4) { klass(30, 320, 360, 'interface IRepository<T>', [{ t: 'T? FindById(int id);', fill: ACC }], { op: fade(u, 0.2) });
      grow(390, 360, 520, 360, E(u, 0.8, 1.2), ACC);
      klass(530, 320, 400, 'UserRepository : IRepository<User>', [{ t: 'User? FindById(int id)', fill: INFO, fw: 700 }], { op: fade(u, 1.1), stroke: INFO });
      say(530, 310, 'T 가 User 로 고정된다', fade(u, 1.8), { 'font-size': 14.5, fill: INFO }); } }

  // ---------- 4. where 제약 — 연산을 연다 ----------
  const OPS = [['ToString(), Equals()', 'object 가 가진 것'], ['a.CompareTo(b)', 'IComparable<T> 필요'], ['new T()', 'new() 필요']];
  function s4(t, c) { const { k, u } = c;
    tx(40, 46, 'T 로 할 수 있는 일', { 'font-size': 15, 'font-weight': 800 });
    const open = [true, k >= 1, k >= 3], fresh = [false, k === 1, k === 3];
    OPS.forEach(([op, why], i) => { const y = 66 + i * 70, on = open[i] && !(fresh[i] && u < 1.2), col = on ? GOOD : MUT;
      el('rect', { x: 40, y, width: 400, height: 56, rx: 10, fill: on ? GOODBG : SOFT, stroke: on ? GOOD : GRID, 'stroke-width': 2 });
      R.lock(72, y + 30, !on, col, 1); code(112, y + 25, op, 1, { fill: on ? INK : MUT, 'font-weight': 700 });
      tx(112, y + 46, why, { 'font-size': 13.5, fill: MUT }); });
    if (k === 0) { cross(410, 136 - 22 + 22, 12, pop(u, 0.8)); code(40, 300, 'static T Max<T>(T a, T b)', fade(u, 0.4)); code(40, 326, '  => a.CompareTo(b) ...  // 컴파일 에러', fade(u, 1.0), { fill: BAD });
      say(40, 370, '아무 타입이나 올 수 있으니 컴파일러가 막는다', fade(u, 1.8), { 'font-size': 14.5, fill: MUT }); }
    const key = (s, ty, a) => { const f = E(u, a, a + 0.8); card(lerp(720, 330, f), lerp(ty, ty, f), tw(s, 14) + 30, 38, { rx: 19, text: s, fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, op: 1 - fade(u, a + 0.9, 0.3) }); };
    if (k === 1) { key('where T : IComparable<T>', 160, 0.3); say(500, 260, '약속한 만큼 연산이 열린다', fade(u, 1.6), { 'font-size': 14.5, fill: GOOD }); }
    if (k === 2) { [['Max(3, 9)', 'int : IComparable<int>', '9'], ['Max("a", "z")', 'string : IComparable<string>', 'z']].forEach(([call, ok, r], i) => {
        const y = 70 + i * 110, s = pop(u, 0.3 + i * 0.6);
        card(600, y + 20, 200, 40, { rx: 6, text: call, fs: 15, mono: true, s });
        code(500, y + 70, ok, fade(u, 0.6 + i * 0.6), { fill: GOOD, 'font-size': 14 }); check(484, y + 65, 7, pop(u, 0.7 + i * 0.6));
        grow(700, y + 20, 800, y + 20, E(u, 0.9 + i * 0.6, 1.2 + i * 0.6), ACC);
        card(860, y + 20, 80, 40, { rx: 6, text: r, fs: 17, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.2 + i * 0.6) }); });
      say(500, 330, '제약을 만족하면 같은 Max<T> 하나로 처리', fade(u, 2.2), { 'font-size': 14.5, fill: MUT }); }
    if (k === 3) { key('where T : new()', 230, 0.3); code(500, 330, 'static T Create<T>() where T : new()', fade(u, 1.4), { 'font-size': 14 });
      code(500, 356, '  => new T();', fade(u, 1.6), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); }
    if (k === 4) { code(40, 300, 'class Cache<T> where T :', fade(u, 0.2), { 'font-weight': 700 });
      [['class', '종류 먼저', 330], ['IComparable<T>', '인터페이스', 520], ['new()', '맨 끝', 720]].forEach(([s, n, x], i) => { const sc = pop(u, 0.5 + i * 0.4);
        card(x, 345, tw(s, 15) + 34, 40, { rx: 8, text: s, fs: 15, mono: true, s: sc, stroke: ACC, color: ACC });
        tx(x, 390, `${i + 1}. ${n}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.4) }); });
      code(560, 290, 'where T : new(), class', fade(u, 2.0), { fill: BAD, 'text-decoration': 'line-through', 'font-size': 14 }); cross(800, 285, 9, pop(u, 2.1)); } }

  // ---------- 5. 공변·반공변 · default(T) · reified ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { // 위: 공변(꺼내기), 아래: 반공변(넣기)
      const top = 110, bot = 300;
      card(190, top, 260, 56, { rx: 10, text: 'IEnumerable<string>', fs: 15, mono: true, stroke: INFO, color: INFO, s: k === 0 ? pop(u, 0.2) : 1 });
      card(720, top, 260, 56, { rx: 10, text: 'IEnumerable<object>', fs: 15, mono: true, stroke: INK, s: k === 0 ? pop(u, 0.5) : 1, op: k === 1 ? 0.5 : 1 });
      grow(320, top, 590, top, k === 0 ? E(u, 0.6, 1.1) : 1, GOOD);
      if (k === 0) ['"a"', '"b"'].forEach((s, i) => { const a = 1.0 + i * 0.5, f = E(u, a, a + 0.8); if (f > 0 && f < 1) pill(lerp(330, 580, f), top - 30, s, INFO, 1, { fs: 13.5, mono: true }); });
      tx(455, top + 40, 'out T — 꺼내 읽기만', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 1.8) : 0.6 });
      if (k === 0) say(40, 210, 'string 을 꺼내 object 로 보는 것은 언제나 안전하다', fade(u, 2.2), { 'font-size': 14.5, fill: MUT });
      if (k === 1) { card(190, bot, 260, 56, { rx: 10, text: 'IComparer<string>', fs: 15, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.2) });
        card(720, bot, 260, 56, { rx: 10, text: 'IComparer<object>', fs: 15, mono: true, stroke: INK, s: pop(u, 0.4) });
        grow(320, bot, 590, bot, E(u, 0.6, 1.1), GOOD);
        ['"x"', '"y"'].forEach((s, i) => { const a = 1.0 + i * 0.5, f = E(u, a, a + 0.8); if (f > 0 && f < 1) pill(lerp(330, 580, f), bot - 30, s, INFO, 1, { fs: 13.5, mono: true }); });
        tx(455, bot + 40, 'in T — 받아 쓰기만', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        say(40, 390, 'object 를 비교할 줄 알면 string 도 비교할 수 있다', fade(u, 2.2), { 'font-size': 14.5, fill: MUT }); }
      return; }
    if (k <= 3) { code(40, 60, 'static T? FirstOrDefault<T>(List<T> xs)', 1, { 'font-weight': 700 });
      code(40, 86, '    => xs.Count > 0 ? xs[0] : default;', 1, { 'font-weight': 700, fill: ACC });
      [['T = int', '0', ACC], ['T = string', 'null', INFO]].forEach(([tt, v, col], i) => { const y = 150 + i * 70, s = k === 2 ? pop(u, 0.5 + i * 0.5) : 1;
        card(160, y, 220, 50, { rx: 8, text: tt, fs: 15, mono: true, s }); grow(270, y, 400, y, k === 2 ? E(u, 0.8 + i * 0.5, 1.1 + i * 0.5) : 1, col);
        card(490, y, 180, 50, { rx: 8, text: 'default → ' + v, fs: 14.5, mono: true, stroke: col, color: col, s: k === 2 ? pop(u, 1.1 + i * 0.5) : 1 }); });
      if (k === 2) say(40, 330, '참조 타입이면 null, 숫자면 0', fade(u, 2.1), { 'font-size': 14.5, fill: MUT });
      if (k === 3) { code(620, 160, 'new List<int>()', fade(u, 0.2), { 'font-weight': 700 }); slots(620, 180, 4, 60, [], { op: fade(u, 0.3) });
        code(620, 280, 'Count == 0', fade(u, 0.8), { fill: MUT }); grow(700, 290, 700, 330, E(u, 1.0, 1.3), ACC);
        terminal(560, 336, 300, 72, ['0'], E(u, 1.4, 1.8), { title: 'Console.WriteLine(...)' });
        say(40, 330, 'null 이 아니라 0 이다', fade(u, 2.0), { 'font-size': 14.5, fill: WARN }); }
      return; }
    if (k === 4) { code(40, 60, 'typeof(List<int>)', 1, { 'font-weight': 700 });
      card(250, 150, 420, 64, { rx: 10, text: 'C# 실행 중\nList`1[System.Int32]', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.4) });
      card(710, 150, 280, 64, { rx: 10, text: 'Java 실행 중\nList', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.0) });
      tx(250, 210, '타입 인자가 남아 있다 (reified)', { 'font-size': 14.5, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      tx(710, 210, '타입 인자를 지운다 (소거)', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      say(40, 300, '리플렉션·직렬화에서도 T 를 그대로 쓸 수 있다', fade(u, 2.1), { 'font-size': 14.5, fill: MUT }); return; }
    // k5: JIT 이 값 타입마다 전용 기계어를 만든다
    card(130, 120, 190, 60, { rx: 8, text: 'IL: List<T>\n코드 하나', fs: 15, s: pop(u, 0.2) });
    ['List<int> 전용 기계어', 'List<double> 전용 기계어', '참조 타입 공유 기계어'].forEach((s, i) => { const y = 70 + i * 90, a = 0.6 + i * 0.4, col = i < 2 ? ACC : INFO;
      grow(225, 120, 440, y, E(u, a, a + 0.4), col); card(560, y, 240, 50, { rx: 8, text: s, fs: 14.5, s: pop(u, a + 0.3), stroke: col, color: col }); });
    tx(300, 112, 'JIT', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.5) });
    tx(700, 80, 'int 칸 그대로, 박싱 0', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.8) });
    tx(700, 260, 'string · Order 가 함께 쓴다', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 2.0) });
    say(40, 380, '값 타입은 타입마다 전용 코드라 Step 1 의 박싱이 없다', fade(u, 2.2), { 'font-size': 14.5, fill: GOOD }); }

  const quiz = [
    { q: 'ArrayList에 list.Add(42)를 하면 힙에서 무슨 일이 일어나는가?',
      o: ['아무 할당도 없다', 'Int32 상자가 새로 만들어지고 칸에는 그 참조가 담긴다', '42가 문자열로 바뀌어 저장된다'], a: 1,
      why: '원소 타입이 object라 값 타입 42는 힙 상자에 감싸진다(박싱). 꺼낼 때는 (int)로 언박싱한다.' },
    { q: 'List<int> 에 list.Add("hi")를 쓰면 언제 문제가 드러나는가?',
      o: ['빌드할 때 CS1503 오류로', '실행 중 InvalidCastException으로', '문제없이 들어간다'], a: 0,
      why: 'T가 int로 정해져 있어 string은 그 자리에 못 들어간다. Step 1에서 실행 중 터지던 실수가 컴파일 단계로 당겨졌다.' },
    { q: 'int p = 1, q = 2; Swap(ref p, ref q); 뒤에 $"{p},{q}" 는 무엇인가?',
      o: ['1,2', '2,1', '컴파일 에러: <int> 를 안 적어서'], a: 1,
      why: '인자가 int라 컴파일러가 T=int로 추론한다. 튜플 교환으로 값이 바뀌어 2,1이 찍힌다.' },
    { q: '제약 없는 static T Max<T>(T a, T b) 안에서 a.CompareTo(b)가 막히는 이유는 무엇인가?',
      o: ['T가 CompareTo를 가진다는 약속이 없어서', 'CompareTo는 int 에만 있어서', 'static 메서드라서'], a: 0,
      why: 'T는 아무 타입이나 될 수 있으니 컴파일러는 object 수준의 연산만 허락한다. where T : IComparable<T>가 CompareTo를 연다.' },
    { q: '빈 List<int> 로 FirstOrDefault<T>를 부르면 무엇이 찍히나?',
      o: ['null', '0', '예외가 난다'], a: 1,
      why: 'default(T)는 T=int일 때 0이다. 참조 타입일 때만 null이다.' },
  ];

  const summary = [
    'ArrayList에 int를 넣으면 힙 상자가 생기고, 꺼낼 때 캐스팅이 틀려도 실행해야 안다.',
    'List<int> 는 int 칸에 값을 바로 담아 박싱이 없고, 잘못된 타입은 빌드에서 막힌다.',
    'where 제약은 T가 최소한 무엇인지 약속해 CompareTo나 new T() 같은 연산을 연다.',
    'C# 제네릭은 실행 중에도 List`1[System.Int32]처럼 타입 인자가 남는다.',
  ];
  const review = [
    { q: '오래된 코드의 ArrayList를 List<int> 로 바꿨더니 몇몇 줄이 빌드되지 않는다. 가장 먼저 의심할 것은 무엇인가?',
      o: ['int가 아닌 값을 Add 하던 줄', 'List<int> 가 박싱을 해서', 'foreach가 List를 못 돌아서'], a: 0,
      why: '예전에는 아무 값이나 object로 들어갔다. 이제 T=int라 다른 타입을 넣던 줄이 CS1503 오류로 드러난다.' },
    { q: 'Create<T>() 안에서 new T()를 쓰고 싶다. 무엇을 붙여야 하나?',
      o: ['where T : class', 'where T : new()', 'where T : IComparable<T>'], a: 1,
      why: 'new() 제약이 매개변수 없는 생성자가 있다는 약속이다. 여러 제약과 함께 쓰면 맨 끝에 둔다.' },
    { q: 'IEnumerable<string> names를 IEnumerable<object> 변수에 대입할 수 있는 이유는 무엇인가?',
      o: ['IComparer처럼 in으로 선언돼서', 'string이 값 타입이라서', 'T가 out이라 값을 꺼내 읽기만 하기 때문'], a: 2,
      why: '꺼내기만 하는 자리에서는 string을 object로 봐도 깨질 일이 없다. 넣는 자리라면 in이 필요하다.' },
  ];

  R.page({ title: '제네릭과 메모리 칸', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
