/* I-2-2 메서드·오버로딩 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 스택 프레임은 아래에서 위로 쌓인다. 화살표 = 참조. 오버로딩 해석은 JLS 15.12.2의 단계(박싱 없이 → 박싱 허용 → 가변인자) 순서를 따른다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: op ?? 1 }, a || {}));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: op ?? 1 }, a || {}));

  // 스택 프레임: (x, y) 왼쪽 위, 폭 w. vars: [[name, val, o]]. 값 상자 오른쪽 끝 좌표 목록을 돌려준다
  function frame(x, y, w, title, vars, o) { o = o || {}; const h = 34 + vars.length * 52, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, 'stroke-dasharray': o.dash, opacity: op });
    mono(x + 14, y + 23, title, { 'font-size': 14.5, 'font-weight': 800, fill: o.stroke || INK, opacity: op });
    return vars.map(([n, v, vo], i) => { vo = vo || {}; const yy = y + 36 + i * 52;
      mono(x + 22, yy + 28, n, { 'font-size': 17, 'font-weight': 800, opacity: op });
      card(x + w - 90, yy + 22, 130, 42, { rx: 7, text: v, mono: true, fs: 16, fw: 800, stroke: vo.stroke || INK, color: vo.color || INK, fill: vo.fill, s: vo.s, op });
      return [x + w - 25, yy + 22]; }); }
  function ref(x1, y1, x2, y2, u, col, o) { o = o || {}; if (u <= 0) return; const mx = (x1 + x2) / 2;
    el('path', { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, fill: 'none', stroke: col || ACC, 'stroke-width': 2.4, pathLength: 100, 'stroke-dasharray': u < 1 ? `${u * 100} 100` : o.dash || null, opacity: o.op ?? 1 });
    el('circle', { cx: x1, cy: y1, r: 4, fill: col || ACC, opacity: o.op ?? 1 }); if (u >= 1) el('circle', { cx: x2, cy: y2, r: 4.5, fill: col || ACC, opacity: o.op ?? 1 }); }
  function user(cx, cy, name, o) { o = o || {}; card(cx, cy, 170, 78, { rx: 10, stroke: o.stroke || INK, sw: 2.2, s: o.s, op: o.op, dash: o.dash });
    if ((o.s ?? 1) > 0.6) { tx(cx - 72, cy - 16, 'User', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
      mono(cx - 72, cy + 20, 'name', { 'font-size': 15, opacity: o.op ?? 1 });
      card(cx + 36, cy + 14, 70, 32, { rx: 5, text: name, mono: true, fs: 16, fw: 800, stroke: o.hi ? WARN : GRID, color: o.hi ? WARN : INK, fill: o.hi ? WARNBG : PANEL, op: o.op }); }
    return { l: cx - 85, r: cx + 85 }; }
  const tok = (x, y, s, col, sc) => card(x, y, tw(s, 15) + 26, 36, { rx: 18, text: s, mono: true, fs: 15, fw: 800, fill: col || ACC, stroke: 'none', color: PANEL, s: sc });
  function out(x, y, w, lines, shown) { terminal(x, y, w, 40 + Math.max(1, lines.length) * 22 + 8, lines.length ? lines : [''], shown ?? lines.length, { fs: 14.5 }); }

  // ---------- 1. 메서드 구조 ----------
  const TK = [['public', 74], ['static', 170], ['int', 250], ['add', 316], ['(int a, int b)', 452]];
  function tokens(o) { o = o || {}; TK.forEach(([s, x], i) => { const inSig = i >= 3, dim = o.sig && !inSig;
      card(x, 70, tw(s, 16) + 24, 44, { rx: 8, text: s, mono: true, fs: 16, fw: 800, stroke: dim ? GRID : inSig && o.sig ? ACC : i === 1 && o.st ? INFO : INK, color: dim ? OFF : inSig && o.sig ? ACC : i === 1 && o.st ? INFO : INK, fill: inSig && o.sig ? ACCBG : PANEL, s: o.s ? o.s(i) : 1 }); }); }
  function classBox(op, o) { o = o || {}; zone(30, 170, 420, 230, 'static · 클래스에 붙는다', { fill: SOFT, op });
    card(240, 250, 300, 70, { rx: 10, text: 'MethodBasics.add(a, b)', mono: true, fs: 15, stroke: INFO, color: INFO, op });
    tx(240, 320, 'this 없음 · 객체가 필요 없다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: op });
    if (o.res) { mono(240, 370, 'add(1, 2) → 3', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: o.res }); } }
  function objBox(op, bal, o) { o = o || {}; zone(490, 170, 440, 230, '인스턴스 · 객체에 붙는다', { fill: 'none', stroke: GRID, dash: '6 5', op });
    if (o.obj === 0) return; card(800, 270, 190, 90, { rx: 10, stroke: INK, sw: 2.2, s: o.obj ?? 1 });
    if ((o.obj ?? 1) > 0.6) { tx(718, 245, 'acc 객체', { 'font-size': 14, 'font-weight': 700, fill: MUT }); mono(718, 285, 'balance', { 'font-size': 15 });
      card(860, 280, 64, 34, { rx: 5, text: String(bal), mono: true, fs: 16, fw: 800, stroke: o.hot ? WARN : GRID, color: o.hot ? WARN : INK, fill: o.hot ? WARNBG : PANEL }); }
    card(590, 270, 150, 56, { rx: 8, text: 'deposit(amount)', mono: true, fs: 14, op: o.m ?? 1 });
    if ((o.m ?? 1) > 0) { ref(665, 270, 705, 270, o.thisU ?? 1, ACC); mono(685, 256, 'this', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: o.m ?? 1 }); } }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { tokens({ s: (i) => pop(u, 0.2 + i * 0.2), st: u > 1.4 }); classBox(fade(u, 1.4)); return; }
    if (k === 1) { tokens({ sig: u > 0.4 }); classBox(1);
      el('path', { d: 'M290,98 V108 H542 V98', fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.6) });
      say(416, 132, '시그니처 = 이름 + 파라미터 목록', fade(u, 0.8), { fill: ACC });
      say(160, 132, '시그니처에서 빠진다', fade(u, 1.4), { fill: MUT, 'font-weight': 400 });
      check(568, 70, 10, pop(u, 1.0)); return; }
    if (k === 2) { mono(480, 70, 'void deposit(int amount) { this.balance += amount; }', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      classBox(0.5); objBox(1, 0, { obj: pop(u, 0.6), m: fade(u, 1.0), thisU: E(u, 1.4, 1.9) });
      say(710, 380, 'this = 이 메서드를 부른 그 객체', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 3) { mono(240, 70, 'int sum = MethodBasics.add(1, 2);', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
      classBox(1, { res: fade(u, 1.4) }); objBox(0.4, 0, { obj: 0, m: 0.4 });
      dot([[240, 92], [240, 214]], seg(u, 0.3, 1.1), INFO, 8); say(240, 140, 'new 없이 클래스 이름으로', fade(u, 0.6), { fill: INFO }); return; }
    if (k === 4) { mono(710, 70, 'acc = new MethodBasics();', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
      mono(710, 104, 'acc.deposit(100);', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      classBox(0.4); const bal = Math.round(tween(0, 100, u - 1.1 > 0 ? u - 1.1 : 0, 0.8));
      objBox(1, u > 1.2 ? bal : 0, { obj: pop(u, 0.3), m: 1, hot: u > 1.2 });
      fly(710, 120, 860, 270, seg(u, 1.1, 1.8), '+100', { mono: true, fill: WARN });
      say(710, 380, '객체마다 자기 balance를 가진다', fade(u, 2.0)); return; }
    // k5: 반환타입만 다른 두 메서드
    [['int', 'add', '(int a, int b)'], ['double', 'add', '(int a, int b)']].forEach(([r, n, p], i) => { const y = 110 + i * 110, s = pop(u, 0.2 + i * 0.3);
      card(160, y, 120, 50, { rx: 8, text: r, mono: true, fs: 17, fw: 800, stroke: GRID, color: MUT, s });
      card(380, y, 260, 50, { rx: 8, text: n + p, mono: true, fs: 17, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s }); });
    mono(380, 170, '=', { 'font-size': 28, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    cross(600, 165, 16, pop(u, 1.4)); mono(640, 172, 'duplicate method', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
    say(480, 340, '시그니처가 같다 · 반환타입은 구별에 쓰이지 않는다', fade(u, 1.9)); }

  // ---------- 2. 원시타입: 값이 복사된다 ----------
  const FX = 60, FW = 330, MAINY = 290;
  function s2(t, c) { const { k, u } = c;
    const mainOn = k >= 1, x = k === 6 ? (u > 1.6 ? '20' : '10') : '10';
    if (k === 0) { frame(FX, 120, FW, 'modify(int n)', [['n', '?']], { dash: '6 5', stroke: MUT, op: fade(u, 0.2) });
      mono(FX + 20, 260, 'n = 99;', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.8) });
      say(680, 160, '파라미터 n은 받은 값의 복사본', fade(u, 1.0)); note(680, 192, '이 프레임 안에서만 산다', fade(u, 1.5)); return; }
    const M = frame(FX, MAINY, FW, 'main()', [['x', x, { stroke: k === 6 && u > 1.6 ? GOOD : INK, color: k === 6 && u > 1.6 ? GOOD : INK, s: k === 1 ? pop(u, 0.4) : 1 }]], {});
    if (k === 1) { say(680, 320, '원본 x = 10은 main 프레임에', fade(u, 1.0)); return; }
    if (k === 7) { const R2 = frame(500, MAINY, FW, 'modify(int n)', [['n', '99', { stroke: WARN, color: WARN }]], { stroke: MUT, dash: '6 5' });
      say(480, 120, '두 칸은 이름도 자리도 다르다', fade(u, 0.3)); note(480, 152, '복사본 99는 프레임과 함께 사라졌다', fade(u, 0.8));
      mono(225, 260, 'x = 10', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); cross(450, 340, 12, pop(u, 1.6)); return; }
    if (k >= 2 && k <= 4) { const drop = k === 2 ? E(u, 0.1, 0.7) : 1, lift = k === 4 ? E(u, 0.3, 1.2) : 0, y = 170 - (1 - drop) * 80 - lift * 60, op = (k === 2 ? fade(u, 0.1) : 1) * (1 - lift);
      const nv = k === 2 ? (u > 1.5 ? '10' : '') : k === 3 ? (u > 1.0 ? '99' : '10') : '99';
      if (op > 0.02) frame(FX, y, FW, 'modify(int n)', [['n', nv, { stroke: k === 3 && u > 1.0 ? WARN : INK, color: k === 3 && u > 1.0 ? WARN : INK }]], { op, stroke: ACC });
      if (k === 2) { fly(M[0][0] - 60, M[0][1], FX + FW - 90, y + 58, seg(u, 0.8, 1.5), '10', { mono: true }); say(680, 160, 'modify(x) · 값 10을 복사', fade(u, 0.8)); }
      if (k === 3) { el('line', { x1: FX + FW + 20, y1: 230, x2: FX + FW + 20, y2: 320, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 1.3) });
        say(680, 230, 'n = 99는 이 프레임 안에서만', fade(u, 1.2), { fill: WARN }); say(680, 262, 'main.x로 가는 길이 없다', fade(u, 1.7), { 'font-weight': 400, fill: MUT }); }
      if (k === 4) { out(560, 120, 300, ['$ java PassByValuePrimitive', '10'], 1 + E(u, 1.2, 1.8)); say(710, 260, '프레임이 사라져도 x는 10', fade(u, 1.8)); }
      return; }
    // k5 · k6: doubled
    const D = frame(FX, 140, FW, 'doubled(int n)', [['n', '10']], { stroke: ACC, op: k === 5 ? fade(u, 0.2) : 1 - fade(u, 1.4, 0.4) });
    if (k === 5) { mono(FX + FW + 30, 200, 'return n * 2;', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.8) });
      pill(680, 260, '20', GOOD, pop(u, 1.4), { mono: true, fs: 18 }); say(680, 320, '원본은 건드리지 않고 값만 돌려준다', fade(u, 1.8)); return; }
    mono(FX + FW + 30, 200, 'x = doubled(x);', { 'font-size': 17, 'font-weight': 700, opacity: 1 });
    fly(FX + FW - 90, 198, M[0][0] - 60, M[0][1], seg(u, 0.6, 1.5), '20', { mono: true, fill: GOOD });
    out(560, 250, 300, ['10', '20'], 1 + E(u, 1.7, 2.2)); say(710, 380, '바꾼 주체는 대입문이다', fade(u, 2.0), { fill: GOOD }); }

  // ---------- 3. 참조타입: 참조값이 복사된다 ----------
  const HX = 720;
  function s3(t, c) { const { k, u } = c;
    zone(470, 26, 466, 380, 'Heap', { fill: 'none', stroke: GRID, dash: '6 5' });
    if (k === 0) { user(HX, 200, '?', { dash: '6 5', stroke: MUT, s: pop(u, 0.3) }); mono(HX, 120, 'class User { String name; }', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      note(HX, 300, '설계도일 뿐 · 아직 객체는 없다', fade(u, 1.2)); return; }
    if (k === 6) { // 정리: 공유 vs 분리
      say(240, 60, '상태 변경 = 공유', 1, { fill: GOOD }); say(690, 60, '재할당 = 분리', fade(u, 0.8), { fill: BAD });
      card(130, 140, 90, 40, { rx: 6, text: 'u', mono: true, fs: 16, stroke: ACC }); card(130, 240, 90, 40, { rx: 6, text: 'obj', mono: true, fs: 16, stroke: INFO });
      const U = user(340, 190, '"B"', { hi: true }); ref(175, 140, U.l, 180, 1, ACC); ref(175, 240, U.l, 200, 1, INFO);
      card(560, 140, 90, 40, { rx: 6, text: 'u', mono: true, fs: 16, stroke: ACC, op: fade(u, 0.8) }); card(560, 260, 90, 40, { rx: 6, text: 'obj', mono: true, fs: 16, stroke: INFO, op: fade(u, 0.8) });
      const U2 = user(800, 130, '"B"', { op: fade(u, 0.8) }), C2 = user(800, 280, '"C"', { op: fade(u, 1.0), stroke: INFO });
      ref(605, 140, U2.l, 130, E(u, 1.0, 1.5), ACC); ref(605, 260, C2.l, 280, E(u, 1.2, 1.7), INFO);
      note(480, 390, '객체를 넘겼는데 원본이 안 바뀌면 메서드 안의 재할당을 의심한다', fade(u, 2.0)); return; }
    const nameNow = k === 1 || k === 2 ? '"A"' : k === 3 ? (u > 1.2 ? '"B"' : '"A"') : '"B"';
    const Uo = user(HX, 130, nameNow, { s: k === 1 ? pop(u, 0.3) : 1, hi: k === 3 && u > 1.2 });
    const M = frame(40, 290, 340, 'main()', [['u', '참조', { stroke: ACC, color: ACC, s: k === 1 ? pop(u, 0.7) : 1 }]], {});
    ref(M[0][0], M[0][1], Uo.l, 140, k === 1 ? E(u, 1.0, 1.6) : 1, ACC);
    if (k === 1) { say(HX, 240, '힙에 객체 하나 · u는 그것을 가리킨다', fade(u, 1.8)); return; }
    if (k === 5) { const C2 = user(HX, 300, '"C"', { op: 1 - fade(u, 1.0, 0.8), stroke: OFF, dash: '5 4' });
      frame(40, 120 - E(u, 0.1, 0.8) * 40, 340, 'reassign(User obj)', [['obj', '참조', { stroke: INFO, color: INFO }]], { stroke: MUT, op: 1 - fade(u, 0.1, 0.6) });
      note(HX, 380, 'new User("C")는 받는 곳이 없어 GC 대상', fade(u, 0.9));
      out(70, 40, 300, ['u.name => B'], E(u, 1.2, 1.8)); return; }
    const title = k <= 3 ? 'mutate(User obj)' : 'reassign(User obj)', drop = (k === 2 || k === 4) ? E(u, 0.1, 0.7) : 1;
    const F = frame(40, 120 - (1 - drop) * 60, 340, title, [['obj', '참조', { stroke: INFO, color: INFO }]], { stroke: INFO, op: (k === 2 || k === 4) ? fade(u, 0.1) : 1 });
    const swing = k === 4 ? E(u, 1.4, 2.1) : 0;
    if (k === 4) user(HX, 300, '"C"', { s: pop(u, 1.0), stroke: INFO });
    ref(F[0][0], F[0][1], Uo.l, lerp(160, 300, swing) - (swing > 0.5 ? 0 : 0), (k === 2 || k === 4) ? E(u, 0.8, 1.3) : 1, INFO);
    if (k === 2) { fly(M[0][0] - 50, M[0][1], F[0][0] - 50, F[0][1], seg(u, 0.4, 0.9), '참조값', {}); say(HX, 250, '변수는 둘, 객체는 하나', fade(u, 1.6)); return; }
    if (k === 3) { fly(F[0][0], F[0][1], HX + 36, 144, seg(u, 0.3, 1.1), 'name = "B"', { mono: true, fill: WARN }); say(HX, 250, 'u.name도 B로 보인다', fade(u, 1.6), { fill: GOOD }); return; }
    say(HX, 380, 'obj 화살표만 새 객체로 옮겨 간다', fade(u, 2.1), { fill: BAD }); }

  // ---------- 4. 오버로딩 ----------
  const CAND = [['print(int n)', 'int: '], ['print(double d)', 'double: '], ['print(String s)', 'str: ']], CY = (i) => 110 + i * 90;
  function s4(t, c) { const { k, u } = c;
    if (k === 5) { [['static int', 'print(int n)'], ['static String', 'print(int n)']].forEach(([r, n], i) => { const y = 130 + i * 100, s = pop(u, 0.2 + i * 0.3);
        card(190, y, 190, 50, { rx: 8, text: r, mono: true, fs: 16, fw: 800, stroke: GRID, color: MUT, s }); card(420, y, 210, 50, { rx: 8, text: n, mono: true, fs: 16, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s }); });
      mono(420, 186, '=', { 'font-size': 28, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      cross(580, 180, 16, pop(u, 1.4)); mono(615, 187, 'duplicate method', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
      say(480, 340, '오버로딩은 파라미터가 달라야 한다', fade(u, 1.9)); return; }
    const n = k === 0 ? 1 : 3, calls = [['42', 0], ['3.14', 1], ['"hi"', 2]], callK = k - 2;
    CAND.slice(0, n).forEach(([s], i) => { const hit = callK === i && u > 1.4; card(720, CY(i), 230, 56, { rx: 10, text: s, mono: true, fs: 16, fw: 800, stroke: hit ? GOOD : INK, color: hit ? GOOD : INK, fill: hit ? GOODBG : PANEL, s: k === 0 || (k === 1 && i > 0) ? pop(u, 0.3 + i * 0.3) : 1 }); });
    card(400, 200, 120, 200, { rx: 12, stroke: GRID, fill: SOFT }); tx(400, 196, '컴파일러', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT });
    tx(400, 222, '인자 타입으로', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); tx(400, 242, '미리 고정', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
    if (k <= 1) { say(130, 200, '이름은 하나', fade(u, 0.6)); note(130, 230, '파라미터만 다르다', fade(u, 1.0)); return; }
    const done = []; calls.forEach(([a, i], j) => { if (j < callK) done.push(CAND[i][1] + a.replace(/"/g, '')); });
    const [a, i] = calls[callK]; const p = E(u, 0.2, 1.4), route = [[110, 200], [340, 200], [460, 200], [530, CY(i)]];
    const seg2 = p * 3, sI = Math.min(2, Math.floor(seg2)), f = seg2 - sI; const P0 = route[sI], P1 = route[sI + 1];
    tok(p >= 1 ? 530 : lerp(P0[0], P1[0], f), p >= 1 ? CY(i) : lerp(P0[1], P1[1], f), 'print(' + a + ')', GOOD);
    if (u > 1.4) done.push(CAND[i][1] + a.replace(/"/g, ''));
    out(40, 300, 280, done, done.length); }

  // ---------- 5. 해석 우선순위 사다리 ----------
  const RUNG = [['①', '정확 일치', 'int → int'], ['②', '기본형 승격', 'int → long'], ['③', '오토박싱', 'int → Integer'], ['④', '가변인자', 'int → int...']], RY = (i) => 100 + i * 76;
  const FC = [['f(long x)', 1], ['f(Integer x)', 2], ['f(int... x)', 3]];
  function ladder(o) { o = o || {}; el('line', { x1: 60, y1: 60, x2: 60, y2: 390, stroke: GRID, 'stroke-width': 4 }); el('line', { x1: 380, y1: 60, x2: 380, y2: 390, stroke: GRID, 'stroke-width': 4 });
    RUNG.forEach(([r, n, ex], i) => { const st = (o.st && o.st(i)) || {}; if ((st.s ?? 1) <= 0) return;
      card(220, RY(i), 320, 56, { rx: 8, stroke: st.stroke || GRID, fill: st.fill || PANEL, sw: st.stroke ? 2.4 : 1.5, s: st.s, op: st.op });
      tx(80, RY(i) - 2, r + ' ' + n, { 'font-size': 16, 'font-weight': 800, fill: st.color || INK, opacity: st.op ?? 1 }); mono(80, RY(i) + 20, o.ex && o.ex(i) || ex, { 'font-size': 13.5, fill: MUT, opacity: st.op ?? 1 }); }); }
  function cands(o) { o = o || {}; FC.forEach(([s, r], i) => { const st = (o.st && o.st(i)) || {}; card(770, RY(r), 210, 50, { rx: 10, text: s, mono: true, fs: 16, fw: 800, stroke: st.stroke || INK, color: st.color || INK, fill: st.fill, s: st.s, op: st.op }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 5 || k === 6) { mono(480, 70, 'static int sum(int... nums)', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      if (k === 5) { say(480, 130, 'nums는 메서드 안에서 int[]다', fade(u, 0.4), { fill: ACC });
        [1, 2, 3].forEach((v, i) => card(380 + i * 80, 220, 70, 50, { rx: 6, text: String(v), mono: true, fs: 18, fw: 800, s: pop(u, 0.8 + i * 0.15) }));
        mono(300, 228, 'nums', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 0.8) });
        mono(480, 320, 'for (int n : nums) s += n;', { 'font-size': 16, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); return; }
      [['sum()', [], '0'], ['sum(1, 2, 3)', ['1', '2', '3'], '6']].forEach(([call, vals, r], j) => { const y = 170 + j * 120, a = 0.3 + j * 1.0;
        mono(120, y + 6, call, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, a) }); grow(260, y, 320, y, E(u, a + 0.2, a + 0.4), MUT);
        if (vals.length) vals.forEach((v, i) => card(360 + i * 64, y, 56, 46, { rx: 6, text: v, mono: true, fs: 17, fw: 800, s: pop(u, a + 0.3 + i * 0.1) }));
        else { card(380, y, 90, 46, { rx: 6, text: '[ ]', mono: true, fs: 17, stroke: GRID, color: MUT, s: pop(u, a + 0.3) }); tx(440, y + 5, '빈 배열', { 'font-size': 14, fill: MUT, opacity: fade(u, a + 0.4) }); }
        grow(560, y, 640, y, E(u, a + 0.5, a + 0.7), MUT); pill(690, y, r, GOOD, pop(u, a + 0.7), { mono: true, fs: 18 }); });
      note(480, 400, '인자 0개도 받는다', fade(u, 2.2)); return; }
    const intArg = k === 4 ? 'Integer.valueOf(7)' : '1';
    const win = k === 4 ? 0 : 1;
    ladder({ ex: (i) => k === 4 && i === 0 ? 'Integer → Integer' : null,
      st: (i) => { if (k === 0) return i === 0 ? { s: pop(u, 0.3) } : { op: 0.25 };
        if (k === 1) return i === 0 ? { op: 0.5 } : { op: 0.25 };
        if (k === 2) return i === 1 ? { stroke: GOOD, fill: GOODBG, color: GOOD, s: pop(u, 0.2) } : i === 0 ? { op: 0.5 } : { op: fade(u, 0.6 + i * 0.2) * 0.6 };
        if (k === 4) return i === 0 ? { stroke: GOOD, fill: GOODBG, color: GOOD } : { op: 0.3 };
        return i === 1 ? { stroke: GOOD, fill: GOODBG, color: GOOD } : i === 0 ? { op: 0.5 } : { op: 0.3 }; } });
    cands({ st: (i) => { const w = (k >= 2 && k !== 4 && i === 0 && (k > 2 || u > 1.6)) || (k === 4 && i === 1 && u > 1.2);
      return { s: k === 0 ? pop(u, 0.8 + i * 0.2) : 1, stroke: w ? GOOD : k === 2 && i > 0 ? GRID : INK, color: w ? GOOD : k === 2 && i > 0 ? MUT : INK, fill: w ? GOODBG : PANEL }; } });
    if (k === 0) { card(560, RY(0), 150, 44, { rx: 8, text: 'f(int x)', mono: true, fs: 15, stroke: BAD, color: BAD, dash: '5 4', s: pop(u, 1.4) }); cross(560, RY(0), 14, pop(u, 1.8));
      note(560, RY(0) + 46, '그런 후보가 없다', fade(u, 1.9)); return; }
    tok(560, 50, 'f(' + intArg + ')', k === 4 ? INFO : ACC, k === 1 || k === 4 ? pop(u, 0.2) : 1);
    if (k === 1) { FC.forEach(([s, r], i) => { grow(620, 60, 662, RY(r), E(u, 0.6 + i * 0.25, 1.0 + i * 0.25), MUT); check(888, RY(r), 9, pop(u, 1.1 + i * 0.25)); });
      say(560, 400, '셋 다 호출 가능하다', fade(u, 1.9)); return; }
    if (k === 2) { grow(380, RY(1), 662, RY(1), E(u, 0.6, 1.4), GOOD); [2, 3].forEach((r) => grow(380, RY(r), 662, RY(r), E(u, 1.0, 1.5), OFF, { dash: '5 4' }));
      note(560, 400, '위 칸에서 맞으면 아래 칸은 보지 않는다', fade(u, 1.9)); return; }
    if (k === 4) { grow(380, RY(0), 662, RY(2), E(u, 0.5, 1.2), GOOD); out(420, 330, 240, ['Integer'], E(u, 1.4, 1.9)); return; }
    grow(380, RY(1), 662, RY(1), 1, GOOD);
    out(420, 330, 240, ['long'], k === 3 ? E(u, 0.4, 1.0) : 1);
    if (k === 3) note(560, 300, 'Integer 버전을 기대했다면 여기서 어긋난다', fade(u, 1.2));
    if (k === 7) say(560, 300, '박싱 ③ · 가변인자 ④까지 내려가지 않는다', fade(u, 0.6), { fill: GOOD }); }

  // ---------- 6. 모호한 오버로딩 ----------
  function tree(o) { o = o || {}; const N = [['Object', 300, 90], ['String', 180, 250], ['Integer', 420, 250]];
    grow(300, 112, 180, 228, 1, GRID, { plain: true }); grow(300, 112, 420, 228, 1, GRID, { plain: true });
    N.forEach(([n, x, y]) => { const st = (o.st && o.st(n)) || {}; card(x, y, 140, 46, { rx: 8, text: n, mono: true, fs: 17, fw: 800, stroke: st.stroke || GRID, color: st.color || MUT, fill: st.fill || PANEL, s: st.s, op: st.op }); }); }
  function s6(t, c) { const { k, u } = c;
    if (k <= 3) { const cand = k === 3 ? ['String', 'Integer'] : ['String', 'Object'];
      tree({ st: (n) => { if (!cand.includes(n)) return { op: 0.5 };
        const win = (k === 1 && n === 'String' && u > 1.2) || (k === 2 && n === 'Object' && u > 1.2);
        return { stroke: win ? GOOD : k === 3 && u > 1.2 ? BAD : INK, color: win ? GOOD : k === 3 && u > 1.2 ? BAD : INK, fill: win ? GOODBG : PANEL }; } });
      mono(560, 60, cand.map((s) => 'f(' + s + ')').join('  vs  '), { 'font-size': 16, 'font-weight': 800 });
      const arg = k === 2 ? '(Object) null' : 'null'; tok(660, 140, 'f(' + arg + ')', k === 3 ? BAD : ACC, k === 0 || k === 2 ? pop(u, 0.3) : 1);
      if (k === 0) { [[180, 250], [300, 90]].forEach(([x, y], i) => el('path', { d: `M600,150 Q${(600 + x) / 2},${(150 + y) / 2 - 30} ${x + 70},${y}`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.8 + i * 0.3) }));
        say(700, 330, 'null은 어느 참조타입에도 들어간다', fade(u, 1.6)); return; }
      if (k === 1) { grow(600, 150, 252, 245, E(u, 0.4, 1.2), GOOD); out(560, 280, 220, ['String'], E(u, 1.4, 1.9)); say(700, 380, '더 아래(구체적)인 타입이 이긴다', fade(u, 1.8), { fill: GOOD }); return; }
      if (k === 2) { grow(580, 130, 372, 92, E(u, 0.5, 1.2), GOOD); out(560, 280, 220, ['Object'], E(u, 1.4, 1.9)); say(700, 380, '캐스팅이 인자 타입을 정한다', fade(u, 1.8)); return; }
      mono(300, 330, '?', { 'font-size': 34, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      note(300, 370, '형제 사이엔 우열이 없다', fade(u, 1.2));
      terminal(520, 250, 400, 90, [['error: reference to f is ambiguous', '#fca5a5']], E(u, 1.5, 2.2), { fs: 14 }); return; }
    if (k <= 5) { tok(150, 210, 'g(1)', ACC, k === 4 ? pop(u, 0.2) : 1);
      const up = [480, 120], dn = [480, 300];
      card(up[0] + 200, up[1], 190, 50, { rx: 10, text: 'g(long x)', mono: true, fs: 16, fw: 800, stroke: k === 5 && u > 0.9 ? GOOD : INK, color: k === 5 && u > 0.9 ? GOOD : INK, fill: k === 5 && u > 0.9 ? GOODBG : PANEL });
      card(dn[0] + 200, dn[1], 190, 50, { rx: 10, text: 'g(Integer x)', mono: true, fs: 16, fw: 800, stroke: k === 5 && u > 1.9 ? INFO : INK, color: k === 5 && u > 1.9 ? INFO : INK });
      grow(200, 196, 576, up[1], k === 4 ? E(u, 0.6, 1.2) : 1, k === 5 ? GOOD : MUT); tx(380, 140, '② 승격 int → long', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 1.0) : 1 });
      grow(200, 224, 576, dn[1], k === 4 ? E(u, 0.9, 1.5) : 1, k === 5 ? OFF : MUT, { dash: k === 5 ? '5 4' : null }); tx(380, 296, '③ 박싱 int → Integer', { 'font-size': 15, 'font-weight': 700, fill: k === 5 ? MUT : INFO, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 1.3) : 1 });
      if (k === 4) { say(480, 395, '컴파일 에러 없이 조용히 한쪽을 고른다', fade(u, 1.9), { fill: WARN }); return; }
      out(40, 300, 230, ['long', 'Integer'], u > 1.9 ? 2 : u > 0.9 ? 1 : 0);
      mono(150, 268, 'g((Integer) 1)', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      fly(230, 268, 590, dn[1], seg(u, 1.5, 1.9), '(Integer) 1', { mono: true, fill: INFO }); return; }
    // k6: 이름을 나눈다
    [['printInt(int n)', '42'], ['printUser(User u)', 'user']].forEach(([s, a], i) => { const y = 140 + i * 120, sc = pop(u, 0.3 + i * 0.4);
      tok(200, y, a, i ? INFO : ACC, sc); grow(250, y, 470, y, E(u, 0.6 + i * 0.4, 1.0 + i * 0.4), GOOD);
      card(600, y, 250, 54, { rx: 10, text: s, mono: true, fs: 16, fw: 800, stroke: GOOD, color: GOOD, fill: GOODBG, s: sc }); check(760, y, 10, pop(u, 1.2 + i * 0.4)); });
    say(480, 380, '헷갈릴 여지가 없으면 규칙을 외울 필요도 없다', fade(u, 2.1)); }

  const quiz = [
    { q: '자바가 메서드를 구별할 때 쓰는 시그니처에 들어가는 것은 무엇인가?',
      o: ['반환타입과 이름', '이름과 파라미터 목록', '접근제어자와 파라미터 목록'], a: 1,
      why: '시그니처는 이름 + 파라미터 목록이다. 그래서 반환타입만 다른 add 두 개는 duplicate method 에러가 난다.' },
    { q: 'int x = 10; modify(x);에서 modify가 n = 99로 바꾸면 println(x)는 무엇을 찍는가?',
      o: ['99', '0', '10'], a: 2,
      why: 'n은 x의 값을 복사한 별도 칸이다. 메서드 안 재할당은 복사본만 바꾸고 프레임과 함께 사라진다.' },
    { q: 'reassign(u) 안에서 obj = new User("C")를 한 뒤 u.name은 무엇인가? (직전 값은 "B")',
      o: ['"B"', '"C"', 'null'], a: 0,
      why: '복사된 것은 참조값이다. 재할당은 obj 화살표만 새 객체로 옮기고, u는 여전히 "B" 객체를 가리킨다.' },
    { q: 'print(int), print(double), print(String)이 있을 때 print(3.14)는 어느 버전을 부르는가?',
      o: ['print(int)', 'print(double)', 'print(String)'], a: 1,
      why: '실수 리터럴 3.14의 타입은 double이다. 컴파일러가 인자 타입으로 print(double)에 미리 고정한다.' },
    { q: 'f(long), f(Integer), f(int...)만 있을 때 f(1)은 무엇을 출력하는가?',
      o: ['Integer', 'varargs', 'long'], a: 2,
      why: '정확 일치 f(int)가 없으니 다음 칸인 기본형 승격(int → long)에서 결정된다. 박싱과 가변인자는 더 뒤 순서다.' },
    { q: 'f(String)과 f(Integer)만 있을 때 f(null)은 어떻게 되는가?',
      o: ['f(String)이 불린다', '컴파일 에러(ambiguous)가 난다', 'NullPointerException이 난다'], a: 1,
      why: 'null은 둘 다에 들어가지만 String과 Integer는 상속 관계가 없어 더 구체적인 쪽을 정할 수 없다.' },
  ];

  const summary = [
    '메서드 시그니처는 이름과 파라미터 목록이고 반환타입만 달라서는 구별되지 않는다.',
    '자바는 항상 값을 복사해 넘기므로 메서드 안에서 int 파라미터를 바꿔도 원본은 그대로다.',
    '객체를 넘기면 참조값이 복사되어 필드 변경은 원본에 보이고 재할당은 보이지 않는다.',
    '오버로딩은 컴파일 때 정확 일치, 승격, 박싱, 가변인자 순으로 고르니 헷갈리면 이름을 나눈다.',
  ];
  const review = [
    { q: 'updateUser(user) 안에서 user = repo.load(id)로 새 객체를 받아 이름을 고쳤는데 호출한 쪽 user는 그대로다. 원인은?',
      o: ['파라미터에 새 객체를 대입해 원본과 연결이 끊겼다', '자바가 객체를 깊은 복사로 넘겼다', 'User가 불변 클래스라서'], a: 0,
      why: '파라미터 재할당은 그 변수의 화살표만 옮긴다. 새 객체를 return해 호출한 쪽이 대입하거나 원래 객체의 필드를 고친다.' },
    { q: 'log(long)과 log(Integer)를 만들었더니 log(5)가 long 버전으로 간다. 가장 깔끔한 해결은?',
      o: ['log(Object)를 하나 더 추가한다', 'logLong, logCount처럼 이름을 나눈다', 'JVM 옵션을 바꾼다'], a: 1,
      why: '승격이 박싱보다 먼저라 int 인자는 long 버전으로 간다. 이름을 나누면 해석 규칙에 기대지 않아도 된다.' },
    { q: 'calc(int x)가 결과를 x에 담아도 호출한 쪽 값이 안 바뀐다. 어떻게 고치나?',
      o: ['파라미터를 Integer로 바꾼다', '메서드를 static으로 바꾼다', '결과를 return하고 호출한 쪽에서 다시 대입한다'], a: 2,
      why: 'int 파라미터는 값의 복사본이라 원본에 닿지 않는다. x = calc(x)처럼 반환값을 대입하는 것이 정석이다.' },
  ];

  R.page({ title: '메서드와 오버로딩', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
