/* III-2-1 제네릭 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 아래 시간 띠 = "컴파일(javac) → 실행(JVM)". 오류가 띠의 어느 쪽에서 잡히는지가 이 장의 줄거리다.
 * 타입 자리는 노란 점선 칸(T), 채워진 타입은 색 알약으로 그린다. 출력값은 페이지 코드 주석(6.0, 4.0, [0, 1, 2], true)이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;
  const ph = (c, k0, a, b) => (c.k > k0 ? 1 : c.k < k0 ? 0 : E(c.u, a, b));
  const pk = (c, k0, a) => (c.k > k0 ? 1 : c.k < k0 ? 0 : pop(c.u, a));

  // 시간 띠: where = 'compile' | 'run' 에서 오류가 잡힘(빨강), ok = 통과 표시
  function timeline(o) { o = o || {}; const y = 384, op = o.op ?? 1;
    el('rect', { x: 40, y: y - 14, width: 420, height: 28, rx: 14, fill: o.where === 'compile' ? BADBG : SOFT, stroke: o.where === 'compile' ? BAD : GRID, 'stroke-width': 2, opacity: op });
    el('rect', { x: 500, y: y - 14, width: 420, height: 28, rx: 14, fill: o.where === 'run' ? BADBG : SOFT, stroke: o.where === 'run' ? BAD : GRID, 'stroke-width': 2, opacity: op });
    tx(250, y + 5, '컴파일 (javac)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: o.where === 'compile' ? BAD : MUT, opacity: op });
    tx(710, y + 5, '실행 (JVM)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: o.where === 'run' ? BAD : MUT, opacity: op });
    grow(462, y, 498, y, op, MUT);
    if (o.ok) check(110, y, 8, o.ok);
    if (o.where && o.s) cross(o.where === 'compile' ? 110 : 570, y, 9, o.s); }
  // 타입 알약 (String = INFO, Integer = WARN, T = 점선 노랑)
  const TC = { String: INFO, Integer: WARN, Double: GOOD, Long: GOOD, Number: ACC, Object: MUT };
  function tslot(cx, cy, name, o) { o = o || {}; const w = tw(name, 15) + 22;
    if (name === 'T') { el('rect', { x: cx - w / 2, y: cy - 14, width: w, height: 28, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: o.op ?? 1 });
      mono(cx, cy + 6, 'T', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: o.op ?? 1 }); return w; }
    card(cx, cy, w, 28, { rx: 6, stroke: TC[name] || INK, sw: 2, fill: PANEL, text: name, fs: 14.5, fw: 800, mono: true, color: TC[name] || INK, s: o.s, op: o.op }); return w; }

  // ---------- 1. 제네릭 이전 ----------
  function s1(t, c) { const { k, u } = c;
    // ObjectBox: 무엇이든 들어가는 칸
    card(230, 150, 300, 170, { rx: 12, stroke: INK, sw: 2.2, s: k === 0 ? pop(u, 0.2) : 1 });
    lbl(230, 90, 'ObjectBox', k === 0 ? fade(u, 0.4) : 1, { class: 'mono' });
    mono(110, 130, 'Object value', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: k === 0 ? fade(u, 0.6) : 1 });
    el('rect', { x: 110, y: 146, width: 240, height: 48, rx: 24, fill: SOFT, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: k === 0 ? fade(u, 0.8) : 1 });
    if (k === 0) { ['String', 'Integer', 'Double'].forEach((s, i) => pill(560 + i * 110, 150, s, TC[s], pop(u, 1.2 + i * 0.2), { mono: true, fs: 14 }));
      sub(670, 196, '무엇이든 들어간다 · 무엇이 들었는지는 아무도 모른다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); }
    // "hello" 가 들어 있다
    const inX = 230;
    if (k === 1) fly(640, 80, inX, 170, seg(u, 0.4, 1.3), '"hello"', { mono: true, fill: INFO, stay: true });
    if (k === 1) { pill(640, 80, 'box.set("hello")', INFO, 1 - seg(u, 0.3, 0.5), { mono: true, fs: 14 }); sub(640, 250, '담을 때는 아무 문제 없다', fade(u, 1.5), { fill: INK, 'font-weight': 700 }); }
    if (k >= 2 && k <= 3) { const go = k === 3 ? E(u, 0.2, 1.0) : 0;
      card(lerp(inX, 640, go), 170, 104, 28, { rx: 14, fill: INFO, stroke: 'none', text: '"hello"', fs: 14, fw: 700, color: PANEL, mono: true });
      if (go > 0.2) sub(lerp(inX, 640, go), 204, '실제 타입 String', 1, { fill: INFO, 'font-weight': 700 }); }
    if (k >= 4) { card(inX, 170, 104, 28, { rx: 14, fill: INFO, stroke: 'none', text: '"hello"', fs: 14, fw: 700, color: PANEL, mono: true }); }
    if (k >= 2 && k <= 3) { // Integer 모양 자리
      mono(520, 92, 'Integer n = (Integer) box.get();', { 'font-size': 15.5, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.2) : 1 });
      el('rect', { x: 680, y: 150, width: 150, height: 44, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: k === 2 ? fade(u, 0.5) : 1 });
      mono(755, 230, 'Integer 자리', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.6) : 1 }); }
    if (k === 2) sub(480, 300, '캐스팅은 "내가 책임진다"는 선언 · 컴파일러는 그냥 통과시킨다', fade(u, 1.3), { fill: INK, 'font-weight': 700 });
    if (k === 3) { const boom = pop(u, 1.1); cross(700, 172, 22, boom);
      [0, 1, 2, 3, 4, 5].forEach((i) => { const a = i * Math.PI / 3, r = 30 + 26 * E(u, 1.1, 1.6); el('line', { x1: 700 + Math.cos(a) * 22, y1: 172 + Math.sin(a) * 22, x2: 700 + Math.cos(a) * r, y2: 172 + Math.sin(a) * r, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.1) * (1 - seg(u, 2.0, 2.6)) }); });
      mono(480, 300, 'java.lang.ClassCastException', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      mono(480, 326, 'class java.lang.String cannot be cast to class java.lang.Integer', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
    if (k === 4) { terminal(430, 34, 500, 126, ['$ java Main', 'Exception in thread "main"', '  java.lang.ClassCastException: …', '  at Main.main(…)'], lerp(0, 4, E(u, 0.2, 1.4)), { title: '실행', fs: 13.5 });
      mono(470, 210, 'System.out.println(n);', { 'font-size': 15.5, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 1.5) });
      sub(640, 244, '여기까지 오지 못한다', fade(u, 1.7), { fill: BAD, 'font-weight': 700 });
      sub(480, 320, '오류가 배포 뒤 특정 데이터에서야 터진다', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); }
    timeline({ ok: k >= 2 ? (k === 2 ? pop(u, 1.0) : 1) : 0, where: k >= 3 ? 'run' : null, s: k === 3 ? pop(u, 1.2) : k > 3 ? 1 : 0, op: k === 0 ? fade(u, 1.0) : 1 });
  }

  // ---------- 2. Box<T> ----------
  function boxClass(x, y, bind, f, o) { o = o || {}; // bind: null 또는 'String', f: 채워진 정도
    card(x + 170, y + 92, 340, 184, { rx: 12, stroke: INK, sw: 2.2, s: o.s });
    if ((o.s ?? 1) < 0.4) return;
    spansLine(x + 20, y + 28, [['class Box<', INK], [bind && f > 0.5 ? bind : 'T', bind && f > 0.5 ? INFO : WARN], ['>', INK]], 16);
    const rows = [['', ' value'], ['void set(', ' v)'], ['', ' get()']];
    rows.forEach(([a, b], i) => { const yy = y + 76 + i * 44, w = tw(a, 15);
      mono(x + 24, yy + 5, a, { 'font-size': 15, fill: INK, opacity: o.rop ? o.rop(i) : 1 });
      const tw0 = bind && f > 0.5 ? tslot(x + 24 + w + 38, yy, bind, { s: pop(f, 0.5) }) : tslot(x + 24 + w + 14, yy, 'T', { op: o.rop ? o.rop(i) : 1 });
      mono(x + 24 + w + (bind && f > 0.5 ? 76 : 28), yy + 5, b, { 'font-size': 15, fill: INK, opacity: o.rop ? o.rop(i) : 1 }); }); }
  function spansLine(x, y, parts, fs) { R.spans(x, y, parts.map(([s, col]) => [s, { fill: col, 'font-weight': 800 }]), { 'font-size': fs }); }
  function s2(t, c) { const { k, u } = c;
    const bind = k >= 3 ? 'String' : null, f = k === 3 ? E(u, 0.8, 1.5) : k > 3 ? 1 : 0;
    boxClass(40, 40, bind, f, { s: k === 0 ? pop(u, 0.2) : 1, rop: (i) => (k === 1 ? (i === 0 ? 0.4 : 1) : 1) });
    if (k === 0) sub(560, 110, 'T = 나중에 채울 타입 자리', fade(u, 1.0), { 'text-anchor': 'start', fill: WARN, 'font-weight': 700 });
    if (k === 1) { el('path', { d: 'M 230 160 C 300 160 300 204 230 204', fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': `${200 * E(u, 0.4, 1.2)} 200`, 'marker-end': u > 1.2 ? 'url(#ra-ahb)' : null });
      sub(560, 170, '넣은 타입 = 나오는 타입', fade(u, 1.2), { 'text-anchor': 'start', fill: ACC, 'font-weight': 700 }); }
    if (k === 2 || k === 5) { // 제네릭 메서드
      const y = k === 2 ? 70 : 60;
      spansLine(420, y, [['static ', INFO], ['<T>', WARN], [' T pick(T a, T b, boolean f)', INK]], 15);
      if (k === 2) { el('rect', { x: 476, y: y - 20, width: 36, height: 28, rx: 5, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 0.6) });
        grow(494, y + 12, 494, y + 52, E(u, 0.8, 1.2), WARN); sub(420, y + 72, '반환형 앞의 <T> = 이 메서드만의 타입 자리', fade(u, 1.2), { 'text-anchor': 'start', fill: WARN, 'font-weight': 700 }); } }
    if (k === 3) { ['String', 'String', 'String'].forEach((s, i) => fly(560, 70, 140 + (i === 1 ? 92 : 0), 116 + i * 44, seg(u, 0.2 + i * 0.15, 0.8 + i * 0.15), s, { mono: true, fill: INFO }));
      pill(560, 70, 'Box<String> box', INFO, 1 - seg(u, 0.2, 0.4), { mono: true, fs: 14.5 });
      mono(560, 240, 'String s = box.get();', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(560, 270, '(String) 캐스팅', { 'font-size': 15, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 1.9) }); sub(720, 300, '꺼낸 값의 타입을 컴파일러가 안다', fade(u, 2.1), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 4) { const bounce = u < 1.2 ? E(u, 0.3, 1.1) : 1 - 0.4 * E(u, 1.2, 1.7);
      card(lerp(640, 300, bounce), 160, 56, 30, { rx: 15, fill: WARN, stroke: 'none', text: '42', fs: 15, fw: 800, color: PANEL, mono: true });
      mono(560, 92, 'box.set(42);', { 'font-size': 16, 'font-weight': 700 });
      el('path', { d: 'M 560 100 q 6 6 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0', fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.2) });
      mono(560, 260, 'incompatible types: int cannot be', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.5) }); mono(560, 282, 'converted to String', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.5) }); }
    if (k === 5) { ['"A"', '"B"'].forEach((s, i) => fly(560 + i * 70, 120, 500, 190, seg(u, 0.2 + i * 0.2, 0.9 + i * 0.2), s, { mono: true, fill: INFO }));
      pill(560, 120, 'pick("A", "B", true)', INFO, 1 - seg(u, 0.1, 0.3), { mono: true, fs: 14 });
      sub(640, 120, 'T = String 으로 추론', fade(u, 1.0), { fill: INFO, 'font-weight': 700 });
      fly(500, 190, 720, 190, seg(u, 1.3, 1.9), '"A"', { mono: true, fill: GOOD, stay: true });
      terminal(560, 230, 360, 100, ['> println(s + " " + r)', 'hello A'], lerp(0, 2, E(u, 1.8, 2.4)), { title: '출력' }); }
    timeline({ ok: k === 3 || k === 5 ? 1 : 0, where: k === 4 ? 'compile' : null, s: k === 4 ? pop(u, 1.3) : 0, op: k >= 3 ? 1 : 0.35 });
  }

  // ---------- 3. 바운디드 타입 ----------
  const TP = { Object: [480, 52], Number: [330, 150], String: [700, 150], Integer: [180, 250], Double: [330, 250], Long: [480, 250] };
  function tree(o) { o = o || {};
    [['Object', 'Number'], ['Object', 'String'], ['Number', 'Integer'], ['Number', 'Double'], ['Number', 'Long']].forEach(([a, b]) => grow(TP[a][0], TP[a][1] + 16, TP[b][0], TP[b][1] - 16, o.g ?? 1, GRID, { plain: true, sw: 2 }));
    Object.entries(TP).forEach(([n, [x, y]]) => tslot(x, y, n, { s: o.s ? o.s(n) : 1, op: o.op ? o.op(n) : 1 })); }
  function s3(t, c) { const { k, u } = c;
    tree({ g: k === 0 ? E(u, 0.2, 0.8) : 1, op: (n) => (k === 4 && n === 'String' ? 0.1 : k >= 2 && k <= 3 ? ((k === 2 && n === 'Integer') || (k === 3 && n === 'Double') || n === 'Number' || n === 'Object' ? 1 : 0.45) : 1) });
    // 울타리: T extends Number
    const fz = k === 0 ? E(u, 0.9, 1.6) : 1;
    el('rect', { x: 110, y: 118, width: 440 * fz, height: 172, rx: 18, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '9 6' });
    mono(124, 314, '<T extends Number>', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 1.6) : 1 });
    if (k === 1) { lock(640, 250, false, GOOD, pop(u, 0.4)); mono(670, 256, 'n.doubleValue()', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) });
      mono(670, 290, 'n.intValue() …', { 'font-size': 15, fill: GOOD, opacity: fade(u, 0.9) });
      sub(760, 340, '상한이 없으면 Object 메서드만 쓸 수 있다', fade(u, 1.5), { fill: INK, 'font-weight': 700 }); }
    if (k === 2 || k === 3) { const vals = k === 2 ? [1, 2, 3] : [1.5, 2.5], T = k === 2 ? 'Integer' : 'Double', tot = vals.reduce((a, b) => a + b, 0);
      mono(620, 230, k === 2 ? 'sum(List.of(1, 2, 3))' : 'sum(List.of(1.5, 2.5))', { 'font-size': 15.5, 'font-weight': 700 });
      mono(620, 256, 'T = ' + T + ' 추론', { 'font-size': 15, fill: TC[T], 'font-weight': 700, opacity: fade(u, 0.4) });
      let run = 0; vals.forEach((v, i) => { const a = 0.7 + i * 0.4; fly(TP[T][0], TP[T][1], 820, 300, seg(u, a, a + 0.4), v.toFixed(1), { mono: true, fill: TC[T] }); if (u > a + 0.4) run += v; });
      mono(620, 310, 'total = ' + run.toFixed(1), { 'font-size': 18, 'font-weight': 800, fill: ACC });
      if (u > 2.0) pill(860, 340, '=> ' + tot.toFixed(1), GOOD, pop(u, 2.0), { mono: true, fs: 16 }); }
    if (k === 4) { const go = u < 1.0 ? E(u, 0.2, 1.0) : 1 - 0.5 * E(u, 1.0, 1.5);
      card(lerp(700, 560, go), 150, 84, 30, { rx: 6, stroke: BAD, sw: 2.5, fill: BADBG, text: 'String', fs: 14.5, fw: 800, color: BAD, mono: true });
      cross(552, 150, 10, pop(u, 1.0)); mono(620, 230, 'sum(List.of("a", "b"))', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.2) });
      sub(760, 270, 'String 은 Number 가 아니다 · 컴파일 에러', fade(u, 1.3), { fill: BAD, 'font-weight': 700 }); }
    timeline({ ok: k === 2 || k === 3 ? 1 : 0, where: k === 4 ? 'compile' : null, s: k === 4 ? pop(u, 1.2) : 0, op: k >= 2 ? 1 : 0.35 });
  }

  // ---------- 4. 와일드카드 · PECS ----------
  function candidates(cx, y, names, o) { o = o || {};
    names.forEach((n, i) => { const yy = y + i * 40, hot = o.hot === i, s = o.s ? o.s(i) : 1;
      card(cx, yy, 190, 32, { rx: 8, stroke: hot ? BAD : GRID, sw: hot ? 2.5 : 1.6, fill: hot ? BADBG : PANEL, text: n, fs: 14, mono: true, color: hot ? BAD : INK, s }); }); }
  function s4(t, c) { const { k, u } = c;
    el('line', { x1: 480, y1: 30, x2: 480, y2: 340, stroke: GRID, 'stroke-width': 1.5 });
    // 왼쪽: producer
    const pOp = k >= 3 && k <= 5 ? 0.4 : 1;
    card(240, 60, 300, 40, { rx: 10, stroke: ACC, sw: 2.4, text: 'List<? extends Number>', fs: 15, fw: 800, mono: true, color: ACC, s: k === 0 ? pop(u, 0.2) : 1, op: pOp });
    sub(240, 100, '실제로 올 수 있는 리스트', pOp * (k === 0 ? fade(u, 0.6) : 1));
    candidates(240, 132, ['List<Integer>', 'List<Double>', 'List<Number>'], { s: (i) => (k === 0 ? pop(u, 0.8 + i * 0.25) : 1), hot: k === 2 && u > 1.1 ? 1 : null });
    if (pOp < 1) el('rect', { x: 20, y: 30, width: 450, height: 300, fill: PANEL, opacity: 0.55 });
    if (k === 1) { ['1', '2', '3'].forEach((v, i) => fly(380, 132 + i * 40, 240, 290, seg(u, 0.3 + i * 0.35, 0.9 + i * 0.35), v, { mono: true }));
      pill(240, 300, '꺼낸 값 = Number · 읽기 OK', GOOD, pop(u, 1.6), { fs: 14 }); }
    if (k === 2) { const b = u < 1.0 ? E(u, 0.2, 1.0) : 1 - E(u, 1.0, 1.6);
      card(240 + 150 * (1 - b), lerp(300, 180, b), 64, 30, { rx: 15, fill: WARN, stroke: 'none', text: 'add(1)', fs: 14, fw: 800, color: PANEL, mono: true });
      cross(360, 172, 11, pop(u, 1.1)); sub(240, 300, 'List<Double> 일 수도 있다 · 쓰기 불가', fade(u, 1.4), { fill: BAD, 'font-weight': 700 }); }
    // 오른쪽: consumer
    if (k >= 3) { const cOp = k === 6 ? 1 : 1;
      card(720, 60, 300, 40, { rx: 10, stroke: INFO, sw: 2.4, text: 'List<? super Integer>', fs: 15, fw: 800, mono: true, color: INFO, s: pk(c, 3, 0.2) });
      sub(720, 100, '실제로 올 수 있는 리스트', ph(c, 3, 0.5, 0.9));
      candidates(720, 132, ['List<Integer>', 'List<Number>', 'List<Object>'], { s: (i) => pk(c, 3, 0.7 + i * 0.25) });
      if (k === 4) { [0, 1, 2].forEach((i) => ['0', '1', '2'].forEach((v, j) => { const a = 0.2 + j * 0.45 + i * 0.15; fly(940, 300, 836 + j * 24, 132 + i * 40, seg(u, a, a + 0.6), v, { mono: true, fill: GOOD }); }));
        pill(720, 300, 'add(i) · 어느 리스트든 Integer 를 담는다', GOOD, pop(u, 1.7), { fs: 14 }); }
      if (k === 5) { fly(880, 172, 720, 262, seg(u, 0.3, 1.0), 'get(0)', { mono: true, fill: INFO });
        pill(720, 300, 'Object 로만 받는다', WARN, pop(u, 1.1), { fs: 14 }); mono(600, 334, 'Integer x = dst.get(0);', { 'font-size': 14.5, fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 1.5) }); } }
    if (k === 6) { pill(240, 300, 'total(List.of(1, 2, 3)) => 6.0', GOOD, pop(u, 0.6), { mono: true, fs: 14 });
      pill(720, 300, 'box => [0, 1, 2]', GOOD, pop(u, 0.9), { mono: true, fs: 14 }); }
    // 아래 띠: PECS
    const pe = k === 6 ? pop(u, 1.4) : 0;
    if (k === 6) { banner(480, 384, 'PECS · 주는 쪽(Producer)은 extends, 받는 쪽(Consumer)은 super', pe); }
    else { mono(240, 386, '읽기 ✓  쓰기 ✗', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: k >= 2 ? 1 : 0.3 });
      mono(720, 386, '쓰기 ✓  읽기 Object', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: k >= 5 ? 1 : k >= 3 ? 0.3 : 0 }); }
  }

  // ---------- 5. 타입 소거 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { zone(30, 40, 360, 250, '소스 코드 (컴파일 전)'); zone(570, 40, 360, 250, '실행 중 힙');
      const er = k === 1 ? E(u, 0.3, 1.0) : 0;
      [['List<String> a', '<String>', INFO], ['List<Integer> b', '<Integer>', WARN]].forEach(([s, tp, col], i) => { const y = 110 + i * 80;
        R.spans(60, y, [['List', { 'font-weight': 800 }], [tp, { fill: col, 'font-weight': 800, opacity: 1 - 0.7 * er, 'text-decoration': er > 0.4 ? 'line-through' : null }], [s.replace('List' + tp, ''), { 'font-weight': 800 }]], { 'font-size': 17, opacity: k === 0 ? fade(u, 0.3 + i * 0.4) : 1 }); });
      if (k === 0) sub(210, 270, '여기까지는 서로 다른 타입', fade(u, 1.3), { fill: INK, 'font-weight': 700 });
      grow(400, 160, 556, 160, k === 0 ? E(u, 1.5, 2.2) : 1, MUT); mono(478, 150, 'javac', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700 });
      card(680, 110, 130, 40, { rx: 8, stroke: INK, sw: 2, text: 'a 객체', fs: 14.5, s: pk(c, 0, 2.0) }); card(680, 200, 130, 40, { rx: 8, stroke: INK, sw: 2, text: 'b 객체', fs: 14.5, s: pk(c, 0, 2.2) });
      if (k === 1) { card(860, 155, 120, 52, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'ArrayList\n.class', fs: 14, mono: true, color: ACC, s: pop(u, 1.0) });
        grow(745, 110, 800, 145, E(u, 1.3, 1.7), ACC); grow(745, 200, 800, 165, E(u, 1.5, 1.9), ACC);
        mono(480, 330, 'a.getClass() == b.getClass()  => true', { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
      return; }
    // k = 2..4: Cache<T> 안에서 new T()
    card(250, 150, 360, 170, { rx: 12, stroke: INK, sw: 2.2 });
    lbl(250, 90, 'class Cache<T>', 1, { class: 'mono' });
    mono(100, 140, '실행 중 T =', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
    el('rect', { x: 210, y: 118, width: 60, height: 32, rx: 6, fill: SOFT, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 3' }); mono(240, 140, '?', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT });
    if (k === 2) { mono(100, 190, 'return new T();', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) }); cross(290, 184, 10, pop(u, 0.9));
      sub(250, 262, '무엇을 만들지 실행 중에는 모른다', fade(u, 1.2), { fill: BAD, 'font-weight': 700 }); }
    if (k >= 3) { mono(100, 190, 'create(Supplier<T> factory)', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      card(720, 150, 220, 70, { rx: 10, stroke: GOOD, sw: 2, text: '호출부\n만드는 방법을 안다', fs: 14.5, s: pk(c, 3, 0.2) });
      if (k === 3) fly(720, 150, 300, 220, seg(u, 0.7, 1.6), 'Supplier<T>', { mono: true, fill: GOOD });
      if (k === 3) sub(720, 212, '생성 책임을 밖으로 넘긴다', fade(u, 1.8), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 4) { mono(100, 222, 'return factory.get();', { 'font-size': 15, 'font-weight': 700 });
      card(560, 150, 80, 40, { rx: 8, stroke: GOOD, sw: 2.5, fill: GOODBG, text: 'T 객체', fs: 14, s: pop(u, 0.6) }); grow(430, 210, 516, 160, E(u, 0.3, 0.7), GOOD); }
    // 소거가 막는 것 (페이지 데이터 erasure.limits)
    const L = (c.beat.erasure && c.beat.erasure.limits) || [];
    const nL = k === 2 ? 1 : k === 3 ? 1 : 3;
    L.slice(0, nL).forEach((l, i) => { const y = 284 + i * 40, s = k === 4 && i > 0 ? pop(u, 1.0 + i * 0.3) : 1; if (s <= 0.05) return;
      cross(50, y, 7, s); mono(70, y + 5, l.x, { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: s }); tx(520, y + 5, l.why, { 'font-size': 14, fill: MUT, opacity: s }); });
  }

  const quiz = [
    { q: 'ObjectBox에 "hello"를 넣고 (Integer) box.get()으로 꺼내면 오류는 언제 드러나는가?',
      o: ['컴파일할 때 빨간 줄로', '실행 중 ClassCastException으로', '아무 오류 없이 0이 나온다'], a: 1,
      why: 'Object로 꺼낸 값을 Integer로 캐스팅하는 줄은 컴파일러가 막지 못한다. 실제 타입이 String이라는 사실은 실행 중에야 드러난다.' },
    { q: 'Box<String> box에 box.set(42)를 쓰면 어떻게 되는가?',
      o: ['컴파일 에러로 막힌다', '42가 "42"로 바뀌어 들어간다', '실행 중 ClassCastException이 난다'], a: 0,
      why: 'T가 String으로 채워져 set은 String만 받는다. 1단계에서 실행 중 터지던 오류가 컴파일 시점으로 당겨졌다.' },
    { q: '<T extends Number>로 상한을 걸면 메서드 안에서 얻는 것은 무엇인가?',
      o: ['String도 받을 수 있게 된다', 'T 값에서 doubleValue() 같은 Number 메서드를 부를 수 있다', '실행 중에 T 정보가 남는다'], a: 1,
      why: '받을 타입을 Number 하위로 좁히는 대신 Number의 기능을 쓸 권한을 얻는다. 그래서 sum(List.of(1, 2, 3))이 6.0을 낸다.' },
    { q: 'List<? extends Number> src에 src.add(1)이 막히는 이유는 무엇인가?',
      o: ['Number는 숫자를 담을 수 없어서', '리스트가 비어 있어서', '실제로는 List<Double>일 수도 있어서'], a: 2,
      why: 'extends 와일드카드는 Number의 어떤 하위 타입 리스트인지 모른다. 그래서 무엇을 넣어도 안전하다고 보장할 수 없고 읽기만 된다.' },
    { q: '클래스 Cache<T> 안에서 new T()를 쓸 수 없는 이유는 무엇인가?',
      o: ['타입 소거로 실행 중에는 T가 무엇인지 모르기 때문이다', 'T가 항상 인터페이스이기 때문이다', 'new는 static 메서드에서만 쓸 수 있기 때문이다'], a: 0,
      why: '컴파일 뒤에는 타입 인자가 지워진다. 그래서 a.getClass() == b.getClass()가 true이고, 생성은 Supplier<T>처럼 밖에서 받아야 한다.' },
  ];

  const summary = [
    'Object 상자와 캐스팅은 타입 오류를 실행 중 ClassCastException으로 미룬다.',
    'Box<String>처럼 T를 채우면 캐스팅이 사라지고 틀린 타입은 컴파일에서 막힌다.',
    '<T extends Number>는 받을 타입을 좁히는 대신 Number 메서드를 쓰게 해 준다.',
    '꺼내 읽으면 extends, 채워 넣으면 super이고, 실행 중에는 타입 인자가 지워진다.',
  ];
  const review = [
    { q: '여러 숫자 리스트를 받아 합계를 내는 메서드에 List<Number>를 썼더니 List<Integer>를 넘길 때 컴파일 에러가 난다. 고칠 방법은?',
      o: ['매개변수를 List<? extends Number>로 바꾼다', '매개변수를 List<? super Number>로 바꾼다', 'List<Integer>를 (List<Number>)로 캐스팅한다'], a: 0,
      why: '제네릭은 불변이라 List<Integer>는 List<Number>가 아니다. 리스트에서 꺼내 읽기만 하므로 Producer에 맞는 extends 와일드카드를 쓴다.' },
    { q: '옛 코드의 Map 캐시에서 값을 꺼내 캐스팅하다 운영 중에 가끔 ClassCastException이 난다. 근본 대책은?',
      o: ['catch로 ClassCastException을 잡아 무시한다', 'Map<String, Order>처럼 타입 인자를 붙여 잘못 넣는 코드를 컴파일에서 막는다', '꺼낼 때 instanceof Map<String, Order>로 검사한다'], a: 1,
      why: '타입 인자를 붙이면 잘못된 put이 컴파일 단계에서 거부되고 꺼낼 때 캐스팅도 사라진다. 제네릭 instanceof는 소거 때문에 쓸 수 없다.' },
    { q: 'void save(List<String> a)와 void save(List<Integer> b) 두 메서드를 한 클래스에 두었더니 컴파일이 안 된다. 이유는?',
      o: ['String과 Integer는 함께 쓸 수 없어서', '매개변수 이름이 달라서', '소거 뒤 둘 다 save(List)가 되어 시그니처가 겹쳐서'], a: 2,
      why: '컴파일 뒤 타입 인자가 지워지면 두 메서드가 같은 시그니처가 된다. 이름을 다르게 짓는 식으로 피한다.' },
  ];

  R.page({ title: '제네릭과 타입 검사', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
