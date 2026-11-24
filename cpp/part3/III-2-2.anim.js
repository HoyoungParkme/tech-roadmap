/* III-2-2 람다와 함수 객체 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 출력값과 std::function 비용은 zig c++ 0.17(clang, libc++)로 코드 블록·실험을 돌려 확인한 값이다. 주소는 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 실측 (exp4/fn.cpp, -O2, 5천만 번 호출): 템플릿 9.6~12.0ms, std::function 71.3~84.7ms. sizeof(람다 [base]) 4, sizeof(std::function) 48
  const FN = { tpl: 10, sfn: 75, szLam: 4, szFn: 48 };

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const mk = (col) => (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)');
  function arc(x1, y1, x2, y2, bend, u, col, o) { o = o || {}; if (u <= 0) return; const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 - bend;
    el('path', { d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 1, 'stroke-dasharray': o.dash ? o.dash : `${clamp(u)} 2`, 'marker-end': u > 0.98 ? mk(col) : null, opacity: o.op ?? 1 }); }
  // 변수 칸: 이름(위 왼쪽) · 값(가운데) · 주소(아래)
  function varBox(cx, cy, name, val, o) { o = o || {}; const w = o.w || 110, h = o.h || 50, op = o.op ?? 1;
    card(cx, cy, w, h, { rx: 8, fill: o.fill || PANEL, stroke: o.stroke || INK, sw: o.sw || 2.2, dash: o.dash, s: o.s, op });
    if ((o.s ?? 1) < 0.5) return;
    mono(cx, cy + 7, String(val), { 'font-size': o.vfs || 20, 'font-weight': 800, 'text-anchor': 'middle', fill: o.vcol || INK, opacity: op });
    if (name) tx(cx - w / 2, cy - h / 2 - 9, name, { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: o.ncol || INK, opacity: op });
    if (o.addr) mono(cx, cy + h / 2 + 19, o.addr, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); }
  // 객체 상자: 제목 + 멤버 영역
  function objBox(x, y, w, h, title, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || SOFT, stroke: o.stroke || INK, 'stroke-width': 2.4, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    tx(x + 14, y + 24, title, { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: o.tcol || INK, opacity: o.op ?? 1 }); }

  // ---------- 1. 함수 객체 = 상태 + operator() ----------
  function s1(t, c) { const { k, u } = c, fx = c.beat.functor, pf = c.prev ? c.prev.functor : null;
    // 설계도
    objBox(40, 40, 380, 190, 'struct Adder', { op: k === 0 ? fade(u, 0.1) : 1 });
    varBox(140, 120, 'int base', k >= 2 ? '·' : '?', { s: k === 0 ? pop(u, 0.4) : 1, vcol: MUT });
    if (k >= 1) { card(230, 194, 340, 46, { rx: 8, fill: INFOBG, stroke: INFO, s: k === 1 ? pop(u, 0.3) : 1 });
      if (k > 1 || u > 0.6) mono(72, 200, 'int operator()(int x) const', { 'font-size': 14.5, 'font-weight': 700, fill: INFO });
      if (k === 1) note(440, 210, '← ()를 붙여 부를 수 있게 된다', fade(u, 1.2), { fill: INFO }); }
    if (k === 0) { note(440, 120, '← 일반 함수에는 없는', fade(u, 1.0)); note(458, 148, '"품고 다니는 값"', fade(u, 1.2), { fill: ACC });
      note(40, 300, '함수 포인터는 코드 주소 하나라 이런 멤버를 못 가진다', fade(u, 1.8), { fill: MUT, 'font-weight': 500 }); return; }
    if (k < 2) return;
    // 객체 add
    const baseV = '10';
    objBox(540, 40, 200, 120, 'add', { fill: ACCBG, stroke: ACC, tcol: ACC, op: k === 2 ? fade(u, 0.2) : 1 });
    varBox(640, 122, 'base', baseV, { s: k === 2 ? pop(u, 0.6) : 1, vcol: ACC, w: 100 });
    if (k === 2) { fly(140, 120, 640, 122, seg(u, 0.6, 1.4), 'base = 10', { mono: true }); mono(540, 200, 'Adder add{10};', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    // 호출
    const calls = { 3: [5, 15], 4: [7, 17] };
    if (calls[k]) { const [x, r] = calls[k];
      mono(540, 250, `add(${x})`, { 'font-size': 18, 'font-weight': 800 });
      fly(580, 240, 640, 150, seg(u, 0.2, 0.9), `x = ${x}`, { mono: true, fill: INK });
      mono(540, 300, `base + x = 10 + ${x}`, { 'font-size': 16, opacity: fade(u, 1.0) });
      mono(540, 350, `=> ${r}`, { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      if (k === 4) { mono(40, 300, 'add(5) => 15', { 'font-size': 15, fill: MUT }); note(40, 370, 'base는 그대로 10 · 매번 넘길 필요가 없다', fade(u, 2.0), { fill: GOOD }); }
      return; }
    // k 5: 같은 operator(), 다른 상태
    objBox(760, 40, 170, 120, 'add100', { fill: WARNBG, stroke: WARN, tcol: WARN, op: fade(u, 0.2) });
    varBox(845, 122, 'base', '100', { s: pop(u, 0.4), vcol: WARN, w: 100 });
    arc(640, 166, 360, 208, -20, seg(u, 0.8, 1.4), INFO); arc(845, 166, 400, 214, -40, seg(u, 1.0, 1.6), INFO);
    mono(560, 300, 'add(5)    => 15', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
    mono(560, 330, 'add100(5) => 105', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
    note(40, 300, '코드는 한 벌, 객체마다 상태가 다르다', fade(u, 2.1)); }

  // ---------- 2. 람다 = 컴파일러가 만든 이름 없는 functor ----------
  const ST = { fx: 130, sx: 290, y: 120 };
  function frame(k, u, fv, sv, o) { o = o || {};
    zone(40, 40, 380, 170, 'main의 스택 (주소는 예시)', { fill: SOFT });
    varBox(ST.fx, ST.y, 'factor', fv, { addr: '0x1000', s: o.s ? o.s(0) : 1, vcol: o.fhot ? WARN : INK, stroke: o.fhot ? WARN : INK });
    varBox(ST.sx, ST.y, 'sum', sv, { addr: '0x2000', s: o.s ? o.s(1) : 1, vcol: o.shot ? ACC : INK, stroke: o.shot ? ACC : INK }); }
  function lam(o) { o = o || {}; objBox(520, 40, 400, 170, '이름 없는 struct (f)', { fill: ACCBG, stroke: ACC, tcol: ACC, op: o.op });
    varBox(620, 120, 'factor (복사본)', o.fv ?? 3, { s: o.s0 ?? 1, vcol: ACC, w: 120 });
    varBox(810, 120, 'sum& (별칭)', '→', { s: o.s1 ?? 1, vcol: INFO, w: 120, stroke: INFO }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { frame(k, u, 3, 0, { s: (i) => pop(u, 0.3 + i * 0.4) });
      note(40, 280, '람다는 바깥 변수를 저절로 알지 못한다', fade(u, 1.3)); note(40, 312, '대괄호에 적은 것만 들고 간다', fade(u, 1.6), { fill: ACC }); return; }
    if (k <= 3) { const sum = k === 1 ? 0 : k === 2 ? Math.round(tween(0, 90, u, 1.6)) : Math.round(tween(90, 93, u - 1.0, 0.6));
      frame(k, u, k === 3 && u > 0.3 ? 100 : 3, sum, { fhot: k === 3, shot: k >= 2 });
      lam({ op: k === 1 ? fade(u, 0.1) : 1, s0: k === 1 ? pop(u, 1.0) : 1, s1: k === 1 ? pop(u, 1.3) : 1 });
      if (k === 1) fly(ST.fx, ST.y, 620, 120, seg(u, 0.5, 1.1), '3 복사', { mono: true });
      arc(810, 146, ST.sx + 30, 146, -50, k === 1 ? seg(u, 1.5, 2.2) : 1, INFO);
      mono(40, 270, '[factor, &sum](int x) { sum += factor * x; }', { 'font-size': 15, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.2) : 1 });
      if (k === 2) { for (let i = 0; i < 3; i++) dot([[810, 146], [550, 230], [ST.sx + 30, 146]], seg(u, 0.2 + i * 0.4, 0.9 + i * 0.4), INFO, 6);
        mono(40, 320, 'f(10); f(20);   3*10 + 3*20 = 90', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); }
      if (k === 3) { mono(40, 320, 'factor = 100;  f(1);', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) });
        mono(40, 352, 'sum => 93   (f 안의 factor는 여전히 3)', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); }
      if (k === 1) note(40, 330, '값 캡처는 멤버로 복사, 참조 캡처는 원본을 가리킨다', fade(u, 2.2));
      return; }
    // k 4, 5: [n = 0]() mutable
    objBox(40, 40, 420, 190, 'g = [n = 0]() mutable', { fill: WARNBG, stroke: WARN, tcol: WARN, op: k === 4 ? fade(u, 0.1) : 1 });
    const nv = k === 4 ? 0 : u < 0.8 ? 0 : u < 1.6 ? 1 : 2;
    varBox(160, 136, 'n', nv, { s: k === 4 ? pop(u, 0.4) : 1, vcol: WARN, stroke: WARN });
    lock(330, 140, k === 4 ? u < 1.2 : false, k === 4 && u < 1.2 ? INK : GOOD, k === 4 ? 1 + bump(u, 1.2) : 1);
    tx(330, 196, k === 4 && u < 1.2 ? 'const' : 'mutable', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', fill: k === 4 && u < 1.2 ? MUT : GOOD });
    if (k === 4) { note(500, 110, '값 캡처 멤버는 기본이 const', fade(u, 0.5)); note(500, 142, 'mutable을 붙여야 ++n이 된다', fade(u, 1.4), { fill: GOOD }); return; }
    mono(500, 110, 'g() => 1', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.8) }); mono(500, 146, 'g() => 2', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.6) });
    mono(500, 196, 'cout << g() << g();  // => 12', { 'font-size': 15.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.0) });
    note(40, 300, '람다도 호출 사이에 상태를 품는 객체다', fade(u, 2.2)); }

  // ---------- 3. 알고리즘에 술어로 ----------
  const V0 = [5, 2, 8, 1, 9, 3], VS = [9, 8, 5, 3, 2, 1];
  const vx = (i) => 140 + i * 82;
  function row(vals, y, st) { vals.forEach((v, i) => { const s = (st && st(i, v)) || {}; card(vx(i), y, 66, 52, { rx: 6, text: String(v), fs: 20, mono: true, fw: 800, fill: s.fill || ACCBG, stroke: s.stroke || ACC, color: s.color, op: s.op, s: s.s }); }); }
  function s3(t, c) { const { k, u } = c;
    tx(40, 106, 'v', { 'font-size': 18, 'font-weight': 800, class: 'mono' });
    if (k === 0) { row(V0, 100, (i) => ({ s: pop(u, 0.2 + i * 0.12) })); note(40, 220, '알고리즘의 "무엇을 기준으로" 자리를 람다가 채운다', fade(u, 1.4)); return; }
    if (k === 1) { const g = E(u, 0.4, 1.8);
      V0.forEach((v, i) => { const j = VS.indexOf(v); card(lerp(vx(i), vx(j), g), 100 + Math.sin(g * Math.PI) * (i % 2 ? 36 : -30), 66, 52, { rx: 6, text: String(v), fs: 20, mono: true, fw: 800, fill: ACCBG, stroke: ACC }); });
      pill(330, 210, '[](int a, int b) { return a > b; }', ACC, pop(u, 0.2), { mono: true, fs: 14.5 });
      note(40, 280, '"a가 b 앞에 오는가"를 그 자리에서 정의 · 내림차순', fade(u, 2.0)); return; }
    const hot = (i, v) => { if (k === 3) { const pos = Math.floor(seg(u, 0.3, 0.9) * 1.99); return i === 0 && pos >= 1 ? { fill: ACC, color: PANEL } : {}; }
      if (k === 4) return v % 2 && u > 0.3 + i * 0.3 ? { fill: GOOD, stroke: GOOD, color: PANEL } : {}; return {}; };
    row(VS, 100, hot);
    // 임계치 캡처
    if (k >= 2 && k <= 3) { varBox(150, 260, 'threshold', 4, { s: k === 2 ? pop(u, 0.2) : 1 });
      objBox(400, 214, 330, 96, '[threshold](int x)', { fill: ACCBG, stroke: ACC, tcol: ACC, op: k === 2 ? fade(u, 0.7) : 1 });
      varBox(500, 276, null, 4, { s: k === 2 ? pop(u, 1.3) : 1, w: 70, h: 40, vcol: ACC, vfs: 18 });
      mono(560, 282, 'x > 4 ?', { 'font-size': 16, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.5) : 1 });
      if (k === 2) fly(150, 260, 500, 276, seg(u, 0.8, 1.3), '4', { mono: true }); }
    if (k === 2) { note(40, 370, '기준값을 캡처해 술어 안으로 넣는다', fade(u, 2.0)); return; }
    if (k === 3) { el('line', { x1: vx(0), y1: 186, x2: vx(0), y2: 132, stroke: ACC, 'stroke-width': 2.6, 'marker-end': mk(ACC), opacity: fade(u, 0.9) });
      mono(vx(0), 204, 'it', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9) });
      mono(780, 282, '*it => 9', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      note(40, 370, '정렬 뒤라 맨 앞 9가 바로 4보다 크다', fade(u, 1.9)); return; }
    const n = VS.filter((v, i) => v % 2 && u > 0.3 + i * 0.3).length;
    mono(40, 250, `count_if(…, [](int x){ return x % 2 != 0; })  =>  ${n}`, { 'font-size': 16, 'font-weight': 800, fill: GOOD });
    note(40, 300, '술어는 템플릿 인자로 들어가 원소마다 인라인 호출된다', fade(u, 2.0)); }

  // ---------- 4. std::function: 타입을 지운 상자 ----------
  const SL = (i) => 140 + i * 196;
  const HOLD = [['[](int x){ return x + 1; }', '람다', 11], ['&doubleIt', '함수 포인터', 20], ['Adder{10}', 'functor (예)', null], ['[base](int x){…}', '캡처 람다', 110]];
  function s4(t, c) { const { k, u } = c, n = (c.beat.stdfunction.holds || []).length, pn = c.prev ? (c.prev.stdfunction.holds || []).length : 0;
    tx(40, 50, 'std::vector<std::function<int(int)>> ops', { 'font-size': 15.5, 'font-weight': 800, class: 'mono' });
    HOLD.forEach(([code, kind, out], i) => { const filled = i < n, isNew = filled && i >= pn, x = SL(i), ex = i === 2;
      card(x, 130, 180, 74, { rx: 10, fill: filled ? (ex ? SOFT : ACCBG) : PANEL, stroke: filled ? (ex ? MUT : ACC) : GRID, dash: filled && !ex ? null : '6 5', sw: 2.2 });
      tx(x, 104, 'int(int)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, class: 'mono' });
      if (!filled) return; const op = isNew ? fade(u, 1.0) : 1;
      mono(x, 134, code.length > 18 ? code.slice(0, 17) + '…' : code, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
      tx(x, 156, kind, { 'font-size': 13.5, 'text-anchor': 'middle', fill: ex ? MUT : ACC, 'font-weight': 700, opacity: op });
      if (isNew) fly(x, 300, x, 130, seg(u, 0.2, 0.9), kind, { fill: ex ? MUT : ACC }); });
    if (k === 0) { note(40, 250, '람다마다 타입이 다르고 이름도 없다', fade(u, 0.8)); note(40, 282, 'auto 변수 하나에는 한 종류만 담긴다', fade(u, 1.3), { fill: MUT, 'font-weight': 500 });
      note(40, 330, '시그니처 int(int)만 맞추면 담기는 공통 상자가 필요하다', fade(u, 1.9), { fill: ACC }); return; }
    if (k === 1) { note(40, 250, '상자 밖에서는 "int를 받아 int를 주는 것" 만 남는다', fade(u, 1.4)); return; }
    if (k === 2) { note(40, 250, '람다가 아니어도 시그니처가 같으면 같은 자리에 들어간다', fade(u, 1.4)); return; }
    if (k === 3) { note(40, 250, 'Step 1의 Adder 같은 functor도 들어간다 (이 코드에는 없다)', fade(u, 1.4), { fill: MUT }); return; }
    if (k === 4) { note(40, 250, '캡처한 base = 100도 상자 안에 같이 보관된다', fade(u, 1.4));
      mono(40, 290, `sizeof(람다 [base]) = ${FN.szLam}  ·  sizeof(std::function) = ${FN.szFn}`, { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
      note(40, 326, '상자에 다 안 들어가는 큰 캡처는 힙에 따로 잡힌다 (libc++)', fade(u, 2.1), { fill: WARN }); return; }
    // k 5: 호출과 비용
    [0, 1, 3].forEach((i, j) => mono(SL(i), 200, `op(10) => ${HOLD[i][2]}`, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.2 + j * 0.3) }));
    tx(40, 262, '5천만 번 호출 (-O2, 이 기기 실측 예)', { 'font-size': 14.5, 'font-weight': 700 });
    tx(40, 306, '템플릿 · auto', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD }); tx(40, 356, 'std::function', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: WARN });
    R.hbar(200, 292, 560, FN.tpl * E(u, 0.8, 1.4), FN.sfn, { col: GOOD, text: `약 ${FN.tpl}ms`, h: 20 });
    R.hbar(200, 342, 560, FN.sfn * E(u, 1.0, 2.0), FN.sfn, { col: WARN, text: `약 ${FN.sfn}ms`, h: 20 });
    note(40, 404, '실행 중에 무엇이 들었는지 찾아가는 간접 호출이라 인라인되지 않는다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); }

  // ---------- 5. 실무 실패 사례 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { const good = k === 1, gone = E(u, 1.0, 1.6);
      zone(40, 50, 330, 160, good ? 'makeGood()의 스택' : 'makeBad()의 스택', { fill: gone > 0.5 ? PANEL : SOFT, stroke: gone > 0.5 ? OFF : 'none', dash: '6 5' });
      varBox(150, 140, 'x', 42, { op: 1 - gone * 0.7, addr: '0x3000', stroke: gone > 0.5 ? OFF : INK, vcol: gone > 0.5 ? OFF : INK });
      if (gone > 0.5) { cross(150, 140, 20, pop(u, 1.4)); tx(205, 92, '함수가 끝나 사라짐', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) }); }
      objBox(560, 60, 340, 150, good ? '[x] 람다' : '[&x] 람다', { fill: good ? GOODBG : BADBG, stroke: good ? GOOD : BAD, tcol: good ? GOOD : BAD, op: fade(u, 0.2) });
      if (good) { varBox(730, 140, 'x (사본)', 42, { s: pop(u, 0.5), vcol: GOOD, stroke: GOOD }); fly(150, 140, 730, 140, seg(u, 0.3, 0.9), '42 복사', { mono: true, fill: GOOD });
        mono(560, 270, 'f()  =>  42', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
        note(40, 330, '저장하거나 나중에 부를 람다는 값으로 캡처한다', fade(u, 2.0), { fill: GOOD }); return; }
      varBox(730, 140, 'x&', '→', { s: pop(u, 0.5), vcol: BAD, stroke: BAD });
      arc(690, 140, 210, 140, 40, seg(u, 0.5, 1.0), BAD);
      mono(560, 270, 'f()  =>  ???  (UB)', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      note(40, 330, '컴파일은 통과하고, 실행할 때 엉뚱한 값이나 크래시가 난다', fade(u, 2.1), { fill: BAD }); return; }
    if (k === 2) { mono(40, 70, 'return [x]() { return x; };   // std::function<int()>로 반환', { 'font-size': 15, 'font-weight': 700 });
      note(40, 116, '저장해서 나중에 부르니 std::function이 맞다', fade(u, 0.5), { fill: GOOD });
      note(40, 170, '바로 쓰고 버리는 술어라면 템플릿으로 받는다', fade(u, 1.0));
      mono(60, 210, 'template<class P> void run(P p)', { 'font-size': 15, fill: GOOD, opacity: fade(u, 1.2) });
      tx(40, 280, '템플릿', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD }); tx(40, 330, 'std::function', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: WARN });
      R.hbar(200, 266, 560, FN.tpl * E(u, 1.4, 1.8), FN.sfn, { col: GOOD, text: `약 ${FN.tpl}ms`, h: 20 });
      R.hbar(200, 316, 560, FN.sfn * E(u, 1.5, 2.3), FN.sfn, { col: WARN, text: `약 ${FN.sfn}ms`, h: 20 });
      sub(480, 380, '앞 장면의 실측 예 · 뜨거운 루프에서 차이가 쌓인다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3 || k === 4) { varBox(150, 140, 'n (바깥)', 0, { addr: '0x4000' });
      objBox(400, 60, 300, 150, k === 3 && u < 1.4 ? '[n]() { n++; }' : '[n]() mutable', { fill: WARNBG, stroke: WARN, tcol: WARN });
      const cv = k === 3 ? 0 : u < 0.8 ? 0 : u < 1.6 ? 1 : 2;
      varBox(500, 150, 'n (사본)', cv, { vcol: WARN, stroke: WARN, w: 100 });
      lock(640, 150, k === 3 && u < 1.4, k === 3 && u < 1.4 ? BAD : GOOD, k === 3 ? 1 + bump(u, 1.4) : 1);
      if (k === 3) { mono(40, 280, 'error: cannot assign to a variable captured by copy', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) });
        note(40, 330, 'mutable을 붙이면 사본을 고칠 수 있다', fade(u, 1.6), { fill: GOOD }); return; }
      mono(40, 280, 'g(); g();', { 'font-size': 17, 'font-weight': 800 });
      note(40, 330, '사본은 2가 됐지만 바깥 n은 0 그대로', fade(u, 2.0), { fill: WARN }); return; }
    // k 5: 큰 객체 캡처
    varBox(200, 120, 'big', '"긴 문자열..."', { w: 260, vfs: 16 });
    tx(40, 220, '[=] 였다면', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
    card(380, 230, 260, 50, { rx: 8, text: '"긴 문자열..." 통째 복사', fs: 15, stroke: BAD, fill: BADBG, s: pop(u, 0.5) });
    tx(40, 330, '[&big]은', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
    card(200, 370, 140, 46, { rx: 8, text: 'big&', fs: 15, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 1.3) });
    grow(200, 346, 200, 150, seg(u, 1.5, 2.0), GOOD);
    note(560, 330, '바로 쓰고 끝나는 람다라면', fade(u, 2.1)); note(560, 360, '참조로 크기만 읽는다', fade(u, 2.2), { fill: GOOD }); }

  const quiz = [
    { q: 'Adder add{10}; add(5);에서 15가 나오는 까닭은 무엇인가?',
      o: ['operator()가 멤버 base 10을 읽어서', 'add(5)가 Adder 생성자를 다시 불러서', '10과 5가 컴파일 시간에 더해져서'], a: 0,
      why: 'add(5)는 add.operator()(5) 호출이다. 객체에 저장된 base 10과 인자 5를 더해 15를 돌려준다.' },
    { q: '[factor, &sum] 람다를 만든 뒤 factor = 100으로 바꾸고 f(1)을 부르면 sum은 얼마인가?',
      o: ['190', '90', '93'], a: 2,
      why: 'factor는 만들 때 3으로 복사돼 멤버에 들어 있다. 그래서 90 + 3×1 = 93이고 sum은 참조라 바깥 값이 바뀐다.' },
    { q: 'v를 9 8 5 3 2 1로 정렬한 뒤 find_if(x > threshold)에서 threshold가 4라면 *it는 무엇인가?',
      o: ['5', '9', '8'], a: 1,
      why: 'find_if는 앞에서부터 처음 참이 되는 원소를 준다. 맨 앞 9가 이미 4보다 커서 9다.' },
    { q: 'std::function<int(int)>을 쓰는 것이 맞는 경우는 무엇인가?',
      o: ['여러 종류의 호출 대상을 담아 두고 나중에 부를 때', 'sort의 비교자를 넘길 때마다', '람다 하나를 바로 한 번 부를 때'], a: 0,
      why: '타입을 지워 담는 대가로 간접 호출이 된다. 실측에서 템플릿보다 7배쯤 느렸으니 저장·교체가 필요할 때만 쓴다.' },
    { q: 'makeBad()가 [&x]로 지역 변수를 캡처해 람다를 반환하면 무엇이 문제인가?',
      o: ['컴파일 에러가 난다', '사라진 x의 자리를 람다가 계속 가리킨다', 'x가 힙으로 옮겨져 메모리가 샌다'], a: 1,
      why: '참조 캡처는 주소만 들고 간다. 반환 뒤 x의 스택 칸은 사라져 호출하면 미정의 동작이다. [x]로 복사하면 안전하다.' },
  ];

  const summary = [
    '함수 객체는 operator()를 가진 객체라서 멤버로 상태를 품고 함수처럼 불린다.',
    '람다는 컴파일러가 만드는 이름 없는 함수 객체이고 캡처 목록이 그 멤버가 된다.',
    '값 캡처는 만든 순간의 사본이라 바깥이 바뀌어도 그대로고, 참조 캡처는 원본 수명에 묶인다.',
    'std::function은 저장과 교체가 필요할 때만 쓰고, 바로 쓰는 술어는 템플릿으로 받는다.',
  ];
  const review = [
    { q: '버튼 콜백 람다를 등록했는데 눌렀을 때 엉뚱한 값이 찍힌다. 람다는 [&count]로 지역 변수를 잡았다. 먼저 의심할 것은?',
      o: ['count를 값으로 잡아 갱신이 안 됐다', 'mutable을 안 붙여 컴파일이 반쯤 됐다', 'count가 있던 함수가 이미 끝나 참조가 죽었다'], a: 2,
      why: '나중에 불리는 콜백은 지역 변수보다 오래 산다. 참조 캡처는 사라진 칸을 가리키므로 값으로 잡거나 수명이 긴 곳에 둔다.' },
    { q: '정렬 비교자를 std::function<bool(int,int)>로 받는 함수를 만들었더니 느리다. 가장 먼저 바꿀 것은?',
      o: ['비교자를 템플릿 인자로 받는다', '비교자를 mutable 람다로 바꾼다', '비교자를 [&]로 캡처한다'], a: 0,
      why: '템플릿으로 받으면 람다 타입이 그대로 남아 인라인된다. std::function은 원소마다 간접 호출을 한다.' },
    { q: '[n = 0]() mutable { return ++n; } 람다 g를 두 번 부른 뒤 바깥에 있던 같은 이름 n이 0 그대로다. 왜인가?',
      o: ['mutable이 증가를 막아서', 'g의 n은 람다 객체 안의 사본이라서', '두 번째 호출이 첫 번째를 되돌려서'], a: 1,
      why: '초기화 캡처와 값 캡처는 람다 객체 안에 사본을 만든다. mutable은 그 사본만 고치게 해 준다.' },
  ];

  R.page({ title: '람다와 캡처 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
