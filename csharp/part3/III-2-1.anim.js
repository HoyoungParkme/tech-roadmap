/* III-2-1 record·패턴 매칭 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 값은 페이지 코드를 .NET 10 으로 돌린 결과: p1 == p2 True, n1 == n2 False, c1.Items.Count 2(같은 List 공유),
 * Grade 82→B 95→A 40→F, Area Circle(2.0) 12.566370614359172 · Rect(3,4) 12 · Triangle(4,3) 6,
 * Circle { R: 0 } 를 Circle(var r) 아래에 두면 CS8510 오류, _ 없이 Triangle 이 오면 SwitchExpressionException */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 스택·힙 그림 도구 ----------
  function mem(o) { o = o || {}; zone(24, 40, 230, 360, '스택 (변수)', { fill: SOFT, op: o.op }); zone(280, 40, 656, 360, '힙 (객체)', { fill: SOFT, op: o.op }); }
  // 변수 칸: 이름 + 오른쪽 끝 점 (화살표 출발점)
  function slot(y, name, s, col) { card(140, y, 190, 40, { rx: 6, s: s ?? 1, stroke: col || INK });
    mono(60, y + 5, name, { 'font-size': 15, 'font-weight': 700, opacity: clamp(s ?? 1) }); el('circle', { cx: 210, cy: y, r: 5, fill: col || INK, opacity: clamp(s ?? 1) }); }
  // 힙 객체: 제목 + 필드 줄. rows [[이름, 값, {col, op}]]
  function obj(cx, cy, title, rows, o) { o = o || {}; const w = o.w || 230, h = 34 + rows.length * 30, s = o.s ?? 1;
    card(cx, cy + h / 2 - 17, w, h, { rx: 10, s, stroke: o.stroke || INK, sw: 2.2, fill: o.fill });
    if (s < 0.4) return { top: cy - 17, h };
    mono(cx - w / 2 + 12, cy + 4, title, { 'font-size': 14.5, 'font-weight': 800, fill: o.stroke || INK });
    rows.forEach(([n, v, ro], i) => { ro = ro || {}; const y = cy + 34 + i * 30;
      tx(cx - w / 2 + 14, y, n, { 'font-size': 14, fill: MUT, opacity: ro.op ?? 1 });
      mono(cx + w / 2 - 14, y, v, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: ro.col || INK, opacity: ro.op ?? 1 });
      if (ro.lock) lock(cx + w / 2 + 18, y - 4, true, MUT, 0.7); });
    return { top: cy - 17, h }; }
  const ptr = (x1, y1, x2, y2, u, col) => grow(x1, y1, x2, y2, u, col || INK, { sw: 2.4 });

  // ---------- 1. 값 동등성 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) {
      card(250, 90, 330, 50, { rx: 10, text: 'record Point(int X, int Y);', fs: 15, mono: true, stroke: ACC, s: k === 0 ? pop(u, 0.2) : 1 });
      ['Equals', 'GetHashCode', 'ToString'].forEach((m, i) => { const x = 130 + i * 120;
        grow(250, 116, x, 190, k === 0 ? E(u, 0.8 + i * 0.25, 1.2 + i * 0.25) : 1, ACC, { plain: true });
        pill(x, 205, m, ACC, k === 0 ? pop(u, 1.1 + i * 0.25) : 1, { mono: true, fs: 13.5, fill: ACCBG }); });
      note(90, 270, '컴파일러가 값 기준으로 만들어 준다', k === 0 ? fade(u, 2.0) : 1, { fill: ACC });
      if (k === 0) return;
      card(720, 90, 330, 50, { rx: 10, text: 'class Node { X; Y; }', fs: 15, mono: true, s: pop(u, 0.2) });
      card(720, 205, 300, 46, { rx: 10, dash: '6 6', stroke: GRID, text: '자동 생성 없음', fs: 14.5, color: MUT, s: pop(u, 0.8) });
      note(600, 270, '== 는 기본이 참조 비교', fade(u, 1.4), { fill: MUT }); return; }
    mem();
    const isNode = k === 5, nm = isNode ? ['n1', 'n2'] : ['p1', 'p2'], title = isNode ? 'Node' : 'Point';
    const A = [470, 110], B = [760, 110];
    nm.forEach((n, i) => slot(120 + i * 120, n, k === 2 || k === 5 ? pop(u, 0.2 + i * 0.4) : 1));
    const hot = k === 3;
    [A, B].forEach((p, i) => { const s = k === 2 || k === 5 ? pop(u, 0.5 + i * 0.4) : 1;
      obj(p[0], p[1], title, [['X', '1', { col: hot ? GOOD : INK }], ['Y', '2', { col: hot ? GOOD : INK }]], { s, stroke: isNode ? INK : ACC });
      ptr(210, 120 + i * 120, p[0] - 118, p[1] + 30 + i * 30, k === 2 || k === 5 ? E(u, 0.8 + i * 0.4, 1.3 + i * 0.4) : 1, isNode ? INK : ACC); });
    if (k === 2) { note(300, 300, '값은 같고, 힙의 객체는 서로 다른 두 개', fade(u, 2.0)); return; }
    if (k === 3) { [0, 1].forEach((r) => { const y = 144 + r * 30;
        grow(590, y - 5, 640, y - 5, E(u, 0.3 + r * 0.5, 0.7 + r * 0.5), GOOD, { plain: true }); mono(615, y - 12, '=', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.6 + r * 0.5) }); });
      banner(615, 300, 'p1 == p2  →  True', pop(u, 1.6)); note(300, 360, 'X와 Y를 하나씩 비교한다', fade(u, 2.0), { fill: GOOD }); return; }
    if (k === 4) { fly(470, 180, 620, 320, seg(u, 0.3, 1.2), 'ToString()', { fill: ACC, mono: true });
      card(615, 320, 360, 46, { rx: 8, fill: INK, stroke: 'none', s: pop(u, 1.2) }); mono(615, 325, 'Point { X = 1, Y = 2 }', { 'font-size': 16, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      note(300, 390, '필드 이름과 값이 그대로 찍힌다', fade(u, 2.0), { fill: MUT }); return; }
    // k5: 화살표 끝이 다르면 False
    el('circle', { cx: A[0] - 118, cy: A[1] + 30, r: 9, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.6) });
    el('circle', { cx: B[0] - 118, cy: B[1] + 60, r: 9, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.6) });
    banner(615, 300, 'n1 == n2  →  False', pop(u, 1.9)); note(300, 360, 'class는 화살표가 같은 객체를 가리키는지만 본다', fade(u, 2.1), { fill: BAD }); }

  // ---------- 2. 불변 + with ----------
  function s2(t, c) { const { k, u } = c;
    mem();
    if (k >= 5) { // Cart 와 공유되는 List
      slot(120, 'c1', 1); slot(240, 'c2', k === 5 ? pop(u, 0.6) : 1);
      obj(430, 80, 'Cart', [['Id', '"c1"'], ['Items', '●']], {});
      obj(430, 230, 'Cart', [['Id', '"c2"', { col: ACC }], ['Items', '●']], { s: k === 5 ? pop(u, 0.8) : 1, stroke: ACC });
      ptr(210, 120, 313, 110, 1); ptr(210, 240, 313, 260, k === 5 ? E(u, 0.9, 1.3) : 1, ACC);
      const items = k === 6 ? ['apple', 'banana'] : ['apple'];
      card(780, 200, 230, 60 + items.length * 34, { rx: 10, stroke: k === 6 ? BAD : INK, sw: 2.2 });
      mono(680, 190 - items.length * 17 + 8, 'List<string>', { 'font-size': 14.5, 'font-weight': 800 });
      items.forEach((s, i) => card(780, 200 - items.length * 17 + 30 + i * 34, 150, 28, { rx: 6, text: `"${s}"`, fs: 14, mono: true, stroke: i === 1 ? BAD : GRID, s: i === 1 ? pop(u, 0.5) : 1 }));
      ptr(530, 144, 664, 190, 1); ptr(530, 294, 664, 215, k === 5 ? E(u, 1.4, 2.0) : 1, ACC);
      if (k === 5) { note(300, 380, 'with는 Items의 주소만 복사한다 · 같은 List 하나', fade(u, 2.1), { fill: WARN }); return; }
      mono(300, 360, 'c2.Items.Add("banana")', { 'font-size': 15, opacity: fade(u, 0.2) });
      banner(615, 380, 'c1.Items.Count  →  2', pop(u, 1.4)); return; }
    const vals = k === 0 ? ['', '', ''] : ['"A-100"', '5000', 'Pending'];
    slot(120, 'order', k === 1 ? pop(u, 0.2) : k === 0 ? 0 : 1);
    obj(450, 90, 'Order', [['Id', vals[0], { lock: true }], ['Amount', vals[1], { lock: true }], ['Status', vals[2], { lock: true }]], { s: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) { note(300, 300, '위치 프로퍼티는 init 전용 · 만들 때만 채운다', fade(u, 1.4)); return; }
    ptr(210, 120, 333, 120, k === 1 ? E(u, 0.6, 1.1) : 1);
    if (k === 1) { note(300, 300, '이제 이 세 값은 바뀌지 않는다', fade(u, 1.6)); return; }
    if (k === 2) { const g = seg(u, 0.2, 1.0); if (g < 1) fly(760, 300, 560, 184, g, 'Paid', { fill: ACC }); else { cross(600, 184, 12, pop(u, 1.0)); }
      mono(300, 330, 'order.Status = Status.Paid;', { 'font-size': 15, fill: BAD, opacity: fade(u, 0.1) });
      note(300, 370, '컴파일 오류 · init 전용 속성은 생성 뒤 대입할 수 없다', fade(u, 1.3), { fill: BAD }); return; }
    // with 복사본
    const cp = k === 3 ? [E(u, 0.4, 0.9), E(u, 0.7, 1.2), E(u, 1.0, 1.5)] : [1, 1, 1];
    slot(260, 'paid', k === 3 ? pop(u, 0.2) : 1, ACC);
    obj(760, 230, 'Order', [['Id', '"A-100"', { op: cp[0] }], ['Amount', '5000', { op: cp[1] }], ['Status', 'Paid', { op: cp[2], col: ACC }]], { s: k === 3 ? pop(u, 0.2) : 1, stroke: ACC });
    ptr(210, 260, 643, 262, k === 3 ? E(u, 1.4, 2.0) : 1, ACC);
    if (k === 3) { [0, 1].forEach((i) => { const g = seg(u, 0.3 + i * 0.3, 0.8 + i * 0.3); if (g > 0 && g < 1) dot([[560, 154 + i * 30], [740, 294 + i * 30]], g, INK, 5); });
      mono(560, 70, 'order with { Status = Paid }', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.1) }); return; }
    banner(615, 385, 'order.Status = Pending · order == paid → False', pop(u, 0.6)); }

  // ---------- 3. switch 식 ----------
  const NX = (v) => 140 + v * 7, NY = 330;
  const ARMS = [['< 0 or > 100', 'throw', BAD], ['>= 90', '"A"', ACC], ['>= 80 and < 90', '"B"', INFO], ['>= 60', '"C"', WARN], ['_', '"F"', MUT]];
  function armRows(n, hit, u, k) { ARMS.slice(0, n).forEach(([p, r, col], i) => { const y = 54 + i * 34, on = hit === i;
      card(250, y, 420, 30, { rx: 6, stroke: on ? col : GRID, sw: on ? 2.5 : 1.4, fill: on ? PANEL : PANEL, s: 1 });
      mono(56, y + 5, p, { 'font-size': 14.5, 'font-weight': 700, fill: col === MUT ? INK : col });
      mono(340, y + 5, '=>  ' + r, { 'font-size': 14.5, fill: INK }); }); }
  function regions(n, u, k) { const R2 = [[[-8, 0], BAD], [[100, 108], BAD], [[90, 100], ACC], [[80, 90], INFO], [[60, 80], WARN], [[0, 60], MUT]];
    const show = [0, 0, 1, 2, 3, 4], txt = ['throw', 'throw', 'A', 'B', 'C', 'F'];
    R2.forEach(([[a, b], col], i) => { if (show[i] >= n) return; const fresh = show[i] === n - 1 && k === n - 1 + (n >= 3 ? -1 : 0);
      el('rect', { x: NX(a), y: NY - 22, width: NX(b) - NX(a), height: 44, fill: col, opacity: 0.25 });
      tx((NX(a) + NX(b)) / 2, NY + 6, txt[i], { 'font-size': 15, 'font-weight': 800, fill: col === MUT ? INK : col, 'text-anchor': 'middle' }); });
    el('line', { x1: NX(-8), y1: NY + 22, x2: NX(108), y2: NY + 22, stroke: MUT, 'stroke-width': 1.8 });
    [0, 60, 80, 90, 100].forEach((v) => mono(NX(v), NY + 42, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' })); }
  function ball(v, y, col, s) { el('circle', { cx: NX(v), cy: y, r: 20, fill: col || INK, opacity: clamp(s ?? 1) }); mono(NX(v), y + 5, String(v), { 'font-size': 14.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: clamp(s ?? 1) }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 5) { // is 패턴
      card(160, 110, 220, 54, { rx: 10, text: 'object value = "hello"', fs: 14, mono: true, s: pop(u, 0.1) });
      const st = [['is string s', 'string 인가? → s에 담는다', 0.5], ['{ Length: > 0 }', 'Length 5 > 0', 1.1], ['is not null', 'null이 아니다', 1.7]];
      st.forEach(([p, d, a], i) => { const x = 160 + (i + 1) * 0, y = 200 + i * 66;
        grow(160, y - 45, 160, y - 22, E(u, a - 0.3, a), GOOD);
        card(250, y, 400, 46, { rx: 10, stroke: GOOD, s: pop(u, a) }); mono(70, y + 5, p, { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, a) });
        tx(250, y + 5, d, { 'font-size': 14, fill: MUT, opacity: fade(u, a + 0.1) }); check(420, y, 9, pop(u, a + 0.3)); });
      card(720, 270, 300, 80, { rx: 10, fill: INK, stroke: 'none', s: pop(u, 2.1) });
      mono(720, 262, '비어있지 않은 문자열: hello', { 'font-size': 14, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      mono(720, 288, '값이 있다', { 'font-size': 14, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 2.3) });
      note(560, 130, '갈래가 하나면 switch 대신 is', fade(u, 1.0), { fill: MUT }); return; }
    const n = [0, 1, 3, 5, 5][k]; armRows(n);
    if (k === 0) { card(250, 100, 420, 120, { rx: 10, dash: '6 6', stroke: GRID, text: 'score switch { … }', fs: 16, color: MUT, s: pop(u, 0.2) }); }
    regions(n, u, k);
    if (k === 0) { ball(82, 230, INK, pop(u, 0.8)); note(60, 250, '입력 score = 82', fade(u, 1.0)); return; }
    if (k === 1) { ball(82, 230, INK); note(60, 250, '82는 범위 안 · 여기 해당 없음', fade(u, 1.2), { fill: MUT }); return; }
    if (k === 2) { const y = lerp(230, NY - 40, E(u, 1.0, 1.8)); ball(82, y, INFO);
      if (u > 1.8) pill(NX(82) + 80, NY - 60, '"B"', INFO, pop(u, 1.8), { mono: true, fs: 15 }); return; }
    if (k === 3) { ball(82, NY - 40, INFO); note(60, 250, '_가 남은 값을 모두 받는다', fade(u, 1.4), { fill: INK }); return; }
    // k4: 40 이 위에서부터 차례로 맞춰 본다
    const step = Math.min(4, Math.floor(E(u, 0.2, 1.6) * 5));
    el('rect', { x: 36, y: 54 + step * 34 - 17, width: 430, height: 34, rx: 7, fill: 'none', stroke: step === 4 ? INK : BAD, 'stroke-width': 3 });
    const y = lerp(230, NY - 40, E(u, 1.7, 2.3)); ball(40, y, INK);
    [['Grade(82)', '"B"'], ['Grade(95)', '"A"'], ['Grade(40)', '"F"']].forEach(([a, b], i) => { mono(560, 80 + i * 34, `${a}  =>  ${b}`, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.5) }); });
    note(560, 230, '위에서부터 처음 맞는 곳에서 멈춘다', fade(u, 2.2)); }

  // ---------- 4. 위치·프로퍼티 패턴과 완전성 ----------
  function tree(u, o) { o = o || {}; const kids = o.tri ? [['Circle(R)', 90], ['Rect(W, H)', 230], ['Triangle(B, H)', 370]] : [['Circle(R)', 120], ['Rect(W, H)', 320]];
    card(230, 70, 200, 44, { rx: 10, text: 'abstract Shape', fs: 15, mono: true, dash: '6 5', s: o.anim ? pop(u, 0.2) : 1 });
    kids.forEach(([s, x], i) => { const fresh = o.tri && i === 2; grow(230, 92, x, 140, o.anim ? E(u, 0.6 + i * 0.3, 1.0 + i * 0.3) : fresh ? E(u, 0.2, 0.7) : 1, fresh ? WARN : MUT);
      card(x, 160, tw(s, 14) + 26, 40, { rx: 10, text: s, fs: 14, mono: true, stroke: fresh ? WARN : ACC, s: o.anim ? pop(u, 0.9 + i * 0.3) : fresh ? pop(u, 0.7) : 1 }); }); }
  const ARM4 = [['Circle(var r)', 'π·r·r'], ['Rect(var w, var h)', 'w * h'], ['Circle { R: 0 }', '0'], ['_', 'throw']];
  function arms4(n, o) { o = o || {}; ARM4.slice(0, n).forEach(([p, r], i) => { const y = 70 + i * 44, dead = i === 2 && o.dead, bad = i === 2 && !dead, hit = o.hit === i;
      card(705, y, 420, 36, { rx: 7, stroke: bad ? BAD : hit ? GOOD : GRID, sw: bad || hit ? 2.5 : 1.4, fill: bad ? BADBG : hit ? GOODBG : PANEL, dash: dead ? '5 5' : null });
      mono(510, y + 5, dead ? '// ' + p : p, { 'font-size': 14.5, 'font-weight': 700, fill: bad ? BAD : dead ? MUT : INK });
      mono(900, y + 5, dead ? '지움' : '=> ' + r, { 'font-size': 14.5, 'text-anchor': 'end', fill: bad ? BAD : dead ? MUT : INK }); }); }
  function s4(t, c) { const { k, u } = c;
    tree(u, { anim: k === 0, tri: k === 5 });
    if (k === 0) { note(60, 260, 'Shape는 Circle 이거나 Rect다', fade(u, 1.8)); note(60, 290, '닫힌 경우의 집합', fade(u, 2.0), { fill: MUT }); return; }
    const n = k === 1 || k === 5 ? 2 : k === 2 ? 3 : 4;
    arms4(n, { hit: k === 1 ? 0 : k === 4 ? 1 : null, dead: k >= 3 });
    if (k === 1) { obj(140, 250, 'Circle', [['R', '2.0', { col: ACC }]], { w: 170, s: pop(u, 0.2), stroke: ACC });
      fly(200, 284, 330, 284, seg(u, 0.6, 1.3), 'r = 2.0', { fill: ACC, stay: true, mono: true });
      mono(240, 360, `π·r·r = ${tween(0, 12.566370614359172, u, 1.4).toFixed(3)}…`, { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
      note(480, 300, '타입 검사와 값 꺼내기가 한 번에', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 2) { // 입력 공간: Circle 전체를 1번 분기가 이미 덮는다
      el('ellipse', { cx: 230, cy: 300, rx: 170, ry: 80, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      tx(110, 270, 'Circle 전부 = Circle(var r)', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.4) });
      el('ellipse', { cx: 280, cy: 320, rx: 60, ry: 28, fill: BADBG, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.0) });
      mono(280, 325, 'R: 0', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      banner(705, 270, 'CS8510 · 이미 처리된 패턴', pop(u, 1.6)); note(510, 330, '좁은 패턴은 넓은 패턴보다 위에 둔다', fade(u, 2.1), { fill: BAD }); return; }
    if (k === 3) { el('rect', { x: 495, y: 202 - 18, width: 420, height: 36, rx: 7, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 0.3) });
      note(60, 260, '나머지는 모두 _가 받는다', fade(u, 0.8)); note(60, 290, '명시적으로 throw 해 숨지 않게 한다', fade(u, 1.4), { fill: MUT }); return; }
    if (k === 4) { obj(140, 250, 'Rect', [['W', '3', { col: ACC }], ['H', '4', { col: ACC }]], { w: 170, s: pop(u, 0.2), stroke: ACC });
      fly(200, 284, 330, 270, seg(u, 0.6, 1.2), 'w = 3', { fill: ACC, stay: true, mono: true }); fly(200, 314, 330, 310, seg(u, 0.9, 1.5), 'h = 4', { fill: ACC, stay: true, mono: true });
      mono(240, 380, `w * h = ${Math.round(tween(0, 12, u, 1.6))}`, { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) }); return; }
    // k5: _ 를 지우고 Triangle 이 들어오면
    obj(140, 250, 'Triangle', [['B', '4'], ['H', '3']], { w: 170, s: pop(u, 0.8), stroke: WARN });
    const g = E(u, 1.0, 2.0), y = lerp(60, 130, g); el('circle', { cx: 480, cy: y, r: 9, fill: WARN }); for (let i = 0; i < 2; i++) if (g * 2 > i + 0.5) cross(925, 70 + i * 44, 8, 1);
    card(705, 290, 420, 64, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, s: pop(u, 2.0) });
    mono(705, 286, 'SwitchExpressionException', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
    tx(705, 310, '빌드는 경고 CS8509뿐, 터지는 건 실행 중', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  // ---------- 5. 합 타입 + 함수형 ----------
  function sumBox(parts, u, o) { o = o || {}; const x0 = 60, w = 400, y = 80, h = 90, pw = w / parts.length;
    el('rect', { x: x0, y, width: w, height: h, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    tx(x0, y - 12, 'Shape =', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    parts.forEach(([s, col], i) => { const fresh = o.fresh === i, sc = fresh ? pop(u, 0.4) : 1;
      if (i) el('line', { x1: x0 + pw * i, y1: y + 6, x2: x0 + pw * i, y2: y + h - 6, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      el('rect', { x: x0 + pw * i + 6, y: y + 6, width: pw - 12, height: h - 12, rx: 10, fill: col, opacity: 0.18 * clamp(sc) });
      mono(x0 + pw * i + pw / 2, y + h / 2 + 5, s, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: clamp(sc) }); }); return { x0, pw, y, h }; }
  const PARTS2 = [['Circle', INFO], ['Rect', ACC]], PARTS3 = PARTS2.concat([['Triangle', WARN]]);
  function arr(cx, cy, items, o) { o = o || {}; const w = 30 + items.length * 96;
    card(cx, cy, w, 52, { rx: 8, stroke: o.stroke || INK, sw: 2.2, s: o.s });
    items.forEach((s, i) => card(cx - w / 2 + 63 + i * 96, cy, 86, 32, { rx: 6, text: s, fs: 13.5, mono: true, stroke: GRID, s: o.s, op: o.newIdx === i ? fade(o.u, o.at) : 1 })); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { const b = sumBox(k === 0 ? PARTS2 : PARTS3, u, { fresh: k === 1 ? 2 : null });
      if (k === 0) { note(60, 230, '| 는 "또는". 가능한 경우를 한곳에 나열한다', fade(u, 1.0)); return; }
      if (k === 1) { note(60, 230, '경우가 늘면 기존 switch를 모두 다시 봐야 한다', fade(u, 1.0), { fill: WARN }); return; }
      const F = [['π·r·r', INFO], ['w * h', ACC], ['0.5 * b * h', WARN]];
      F.forEach(([f, col], i) => { const x = b.x0 + b.pw * i + b.pw / 2; grow(x, 172, x, 230, E(u, 0.3 + i * 0.3, 0.7 + i * 0.3), col);
        card(x, 255, 120, 40, { rx: 8, text: f, fs: 14, mono: true, stroke: col, s: pop(u, 0.6 + i * 0.3) }); });
      card(720, 120, 330, 50, { rx: 10, text: 'static double Area(Shape s)', fs: 14.5, mono: true, s: pop(u, 0.2) });
      mono(560, 330, 'Area(new Triangle(4, 3))', { 'font-size': 15, opacity: fade(u, 1.5) });
      mono(840, 330, `=> ${Math.round(tween(0, 6, u, 2.2))}`, { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
      note(560, 200, '데이터는 record, 동작은 함수 하나', fade(u, 1.0), { fill: MUT }); return; }
    if (k === 3) { tx(60, 70, 'List<Shape>.Add', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: BAD });
      const g = E(u, 0.6, 1.2); arr(220, 130, g > 0.5 ? ['Circle', 'Rect'] : ['Circle'], { stroke: BAD, newIdx: 1, u, at: 0.9 });
      note(60, 200, '같은 상자가 커진다 · 들고 있던 쪽도 바뀐다', fade(u, 1.2), { fill: BAD });
      tx(500, 70, 'ImmutableArray<Shape>.Add', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: GOOD, opacity: fade(u, 1.0) });
      arr(620, 130, ['Circle'], { s: pop(u, 1.0) }); grow(620, 158, 620, 220, E(u, 1.5, 1.9), GOOD);
      arr(670, 260, ['Circle', 'Rect'], { stroke: GOOD, s: pop(u, 1.9) });
      note(500, 330, '새 배열을 돌려주고 원래 배열은 그대로', fade(u, 2.2), { fill: GOOD }); return; }
    // k4~5: d1, d2
    mem({ op: 1 });
    slot(120, 'd1', 1); slot(260, 'd2', k === 4 ? pop(u, 1.2) : 1, ACC);
    obj(430, 90, 'Drawing', [['Shapes', '●']], { w: 200 }); arr(760, 120, ['Circle']);
    ptr(210, 120, 328, 120, 1); ptr(520, 124, 690, 124, 1);
    obj(430, 240, 'Drawing', [['Shapes', '●']], { w: 200, stroke: ACC, s: k === 4 ? pop(u, 1.0) : 1 }); arr(712, 290, ['Circle', 'Rect'], { stroke: ACC, s: k === 4 ? pop(u, 0.6) : 1 });
    ptr(210, 260, 328, 270, k === 4 ? E(u, 1.3, 1.7) : 1, ACC); ptr(520, 274, 602, 290, k === 4 ? E(u, 1.4, 1.9) : 1, ACC);
    if (k === 4) { mono(300, 385, 'd1 with { Shapes = d1.Shapes.Add(new Rect(2, 3)) }', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.2) }); return; }
    [['d1.Shapes.Length', '1'], ['d2.Shapes.Length', '2'], ['Area(Triangle(4,3))', '6']].forEach(([a, b], i) => {
      mono(300 + i * 215, 370, `${a} = ${b}`, { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3 + i * 0.4) }); }); }

  const quiz = [
    { q: 'new Point(1, 2)를 두 번 만들어 == 로 비교하면 record와 class 결과는 어떻게 다른가?',
      o: ['둘 다 False', 'record는 True, class는 False', 'record는 False, class는 True'], a: 1,
      why: 'record는 컴파일러가 만든 Equals가 X, Y를 비교한다. class Node는 두 객체가 같은 것인지만 봐서 False다.' },
    { q: 'c2 = c1 with { Id = "c2" } 뒤 c2.Items.Add("banana")를 하면 c1.Items.Count는 얼마인가?',
      o: ['1', '0', '2'], a: 2,
      why: 'with는 얕은 복사라 Items에는 같은 List의 주소가 복사된다. 한쪽에서 Add 하면 c1도 2가 된다.' },
    { q: 'Grade(40)이 "F" 가 되는 이유는 무엇인가?',
      o: ['위 분기 넷에 모두 맞지 않아 _까지 내려가서', '40이 >= 60 분기와 같은 범위여서', 'switch 식이 마지막 분기를 기본으로 골라서'], a: 0,
      why: 'switch 식은 위에서부터 처음 맞는 분기를 고른다. 40은 범위 밖도, 90·80·60 이상도 아니므로 _에 걸린다.' },
    { q: 'Circle(var r) 분기 아래에 Circle { R: 0 } 분기를 두면 어떻게 되나?',
      o: ['R이 0인 원만 아래 분기로 간다', '컴파일러가 CS8510 오류로 막는다', '실행 중에 SwitchExpressionException이 난다'], a: 1,
      why: 'Circle(var r)이 모든 Circle을 이미 받으므로 아래 분기는 닿을 수 없다. switch 식에서는 이것이 컴파일 오류다.' },
    { q: 'record Drawing(ImmutableArray<Shape> Shapes)에서 d1 with { Shapes = d1.Shapes.Add(...) } 뒤 d1.Shapes.Length는?',
      o: ['1', '2', '0'], a: 0,
      why: 'ImmutableArray.Add는 새 배열을 돌려주고 원래 배열은 그대로 둔다. d1은 1개, d2는 2개다.' },
  ];

  const summary = [
    'record는 값으로 같음을 판단한다. 같은 값으로 두 번 만들면 == 가 True다.',
    'with는 원본을 두고 일부만 바꾼 새 인스턴스를 만든다. 안의 List는 공유된다.',
    'switch 식은 위에서부터 처음 맞는 분기를 고르므로 좁은 조건을 먼저 둔다.',
    '경우를 추가하면 기존 switch를 다시 본다. _가 없으면 새 값에서 실행 중에 터진다.',
  ];
  const review = [
    { q: '장바구니 record를 with로 복사해 사본에만 상품을 넣었는데 원본 장바구니에도 상품이 생겼다. 먼저 의심할 것은?',
      o: ['record의 Equals가 잘못 생성됐다', 'Items가 List라 with가 같은 리스트를 공유한다', 'with가 원본을 고쳐 쓰는 연산이다'], a: 1,
      why: 'with는 필드 값을 그대로 복사하므로 참조형 필드는 주소만 복사된다. 불변 컬렉션을 쓰면 Add가 새 배열을 만든다.' },
    { q: 'Shape에 Triangle을 추가했더니 일부 화면에서 SwitchExpressionException이 난다. 어떻게 막는 것이 좋은가?',
      o: ['모든 switch를 if-else로 바꾼다', 'Triangle을 class로 바꾼다', 'CS8509 경고를 오류로 올리고 각 switch에 Triangle 분기를 넣는다'], a: 2,
      why: '_가 없는 switch 식은 새 경우를 경고만 내고 지나간다. 경고를 오류로 올리면 빌드에서 빠진 곳이 드러난다.' },
    { q: '좌표를 Dictionary 키로 쓰는데 같은 좌표로 다시 찾으면 못 찾는다. 좌표 타입을 어떻게 바꾸면 되나?',
      o: ['class를 record로 바꿔 값 기준 Equals·GetHashCode를 얻는다', 'class에 public 필드를 더 추가한다', '키를 찾을 때마다 같은 인스턴스를 새로 만든다'], a: 0,
      why: 'class는 참조로 비교하므로 새로 만든 같은 좌표는 다른 키다. record는 값이 같으면 Equals와 해시가 같다.' },
  ];

  R.page({ title: 'record와 패턴 매칭', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
