/* II-2-2 trait object vs static dispatch — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림의 재료: 모노모픽화로 찍힌 함수 두 벌과 직접 호출, fat pointer(데이터 ptr + vtable ptr, 16바이트)와 vtable 칸,
   Vec<Box<dyn Shape>>의 힙 배치와 면적 합계, vtable 한 칸에 메서드가 들어가는지(dyn 호환), 정적·동적 선택 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  // ---------- 지역 도우미 ----------
  function diag(x, y, w, rows, o) { o = o || {}; const lh = o.lh || 22, h = 16 + rows.length * lh, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 1.8, opacity: op });
    rows.forEach(([s, col, fw], i) => { const a = (o.show ? o.show(i) : 1) * op; if (a <= 0.01) return;
      mono(x + 14, y + 8 + i * lh + lh * 0.72, s, { 'font-size': o.fs || 14, fill: col || INK, 'font-weight': fw || 400, opacity: a }); });
    return h; }
  // 곡선 화살표 (u 만큼)
  function curve(d, u, col, o) { if (u <= 0) return; o = o || {};
    el('path', { d, fill: 'none', stroke: col || INK, 'stroke-width': o.sw || 2.2, pathLength: 1, 'stroke-dasharray': `${clamp(u)} 2`, 'marker-end': u > 0.98 ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null, opacity: o.op ?? 1 }); }
  // fat pointer: [data ptr | vtable ptr]
  function fatPtr(x, y, o) { o = o || {}; const op = o.op ?? 1, w = o.w || 92;
    [['data', o.dcol || ACC], ['vtable', o.vcol || INFO]].forEach(([n, col], i) => {
      el('rect', { x: x + i * (w + 4), y, width: w, height: 40, rx: 5, fill: PANEL, stroke: col, 'stroke-width': 2.2, opacity: op });
      if (o.nolabel) el('circle', { cx: x + i * (w + 4) + w / 2, cy: y + 20, r: 5, fill: col, opacity: op });
      else { mono(x + i * (w + 4) + 10, y + 25, n, { 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: op }); el('circle', { cx: x + i * (w + 4) + w - 12, cy: y + 20, r: 5, fill: col, opacity: op }); } });
    return o.nolabel ? { d: [x + w / 2, y + 20], v: [x + w + 4 + w / 2, y + 20], r: x + 2 * w + 4 } : { d: [x + w - 12, y + 20], v: [x + 2 * w + 4 - 12, y + 20], r: x + 2 * w + 4 }; }
  // vtable 표
  function vtable(x, y, name, rows, o) { o = o || {}; const op = o.op ?? 1, w = o.w || 200;
    mono(x, y - 8, name, { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: op });
    rows.forEach((r, i) => { const hot = o.hot === i;
      el('rect', { x, y: y + i * 30, width: w, height: 28, rx: 4, fill: hot ? HL : INFOBG, stroke: INFO, 'stroke-width': 1.4, opacity: op });
      mono(x + 10, y + i * 30 + 19, r, { 'font-size': 13.5, opacity: op, 'font-weight': hot ? 800 : 400 }); });
    return (i) => [x + w, y + i * 30 + 14]; }
  const fnBox = (cx, cy, s, col, o) => card(cx, cy, tw(s, 14.5) + 30, 40, Object.assign({ rx: 8, text: s, fs: 14.5, mono: true, stroke: col || INK, color: col || INK }, o || {}));

  // ---------- 1. 정적 디스패치 ----------
  function s1(t, c) { const { k, u } = c;
    card(200, 46, 340, 44, { rx: 10, text: 'trait Shape { fn area(&self) -> f64; }', fs: 14.5, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: k === 0 ? pop(u, 0.2) : 1 });
    [['Circle { r: f64 }', 120, 'Circle::area', '3.14 · r · r'], ['Square { s: f64 }', 280, 'Square::area', 's · s']].forEach(([st, y, fn, body], i) => {
      const a = k === 0 ? fade(u, 0.7 + i * 0.4) : 1; card(130, y, 220, 44, { rx: 8, text: st, fs: 14.5, mono: true, stroke: INK, op: a });
      if (k === 0) mono(130, y + 40, '8 바이트', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      if (k >= 1) { const b = k === 1 ? fade(u, 0.3 + i * 0.6) : 1; grow(242, y, 300, y, b, MUT); fnBox(400, y, fn, INK, { op: b }); mono(400, y + 40, body, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: b }); } });
    if (k === 1) tx(560, 200, '이름은 같아도 서로 다른 함수 둘', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
    if (k >= 2) { const a = k === 2 ? pop(u, 0.2) : 1;
      card(720, 60, 330, 48, { rx: 10, text: 'fn print_area<T: Shape>(&T)', fs: 15, mono: true, stroke: ACC, dash: '6 4', color: ACC, s: a });
      if (k === 2) { tx(720, 110, '소스에는 하나, 아직 기계어가 아니다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.9) });
        tx(720, 136, 'T 자리는 호출될 때 정해진다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.3) }); } }
    if (k === 3) { // 찍혀 나온 두 함수 + 직접 호출
      [['print_area::<Circle>', 120, 'area = 12.56'], ['print_area::<Square>', 280, 'area = 9']].forEach(([nm, y, out], i) => { const a = E(u, 0.3 + i * 0.6, 0.9 + i * 0.6);
        dot([[720, 84], [720, y - 30]], seg(u, 0.1 + i * 0.6, 0.7 + i * 0.6), ACC, 6);
        card(720, y, 260, 48, { rx: 8, text: nm, fs: 15, mono: true, stroke: ACC, fill: ACCBG, color: ACC, op: a });
        if (a >= 1) { el('line', { x1: 590, y1: y, x2: 520, y2: y, stroke: ACC, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ahb)' }); mono(720, y + 44, out, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD }); } });
      tx(560, 200, '직접 호출 · 인라인 가능', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      tx(480, 390, '함수 2벌 (LLVM IR 정의 2개) — 타입이 늘면 함께 는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.1) }); } }

  // ---------- 2. 동적 디스패치: fat pointer와 vtable ----------
  function s2(t, c) { const { k, u } = c;
    const isSq = k === 2 && u > 1.5, boxed = k === 3;
    mono(40, 44, boxed ? 'let boxed: Box<dyn Shape> = Box::new(Circle { r: 1.0 })' : 'fn print_area(shape: &dyn Shape)', { 'font-size': 16, 'font-weight': 800 });
    tx(40, 92, boxed ? 'Box<dyn Shape> 16 바이트' : '&dyn Shape 16 바이트', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const fp = fatPtr(40, 104, { op: k === 0 ? fade(u, 0.2) : 1 });
    if (k === 0) { mono(40, 300, '&Circle은 8 바이트 (주소 하나)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
    // 데이터 (fat pointer 아래)
    const dx = 330, dy = 200, dataTxt = boxed ? 'Circle { r: 1.0 }' : isSq ? 'Square { s: 3.0 }' : 'Circle { r: 2.0 }';
    if (boxed) zone(dx - 14, dy - 32, 220, 86, '힙 (8 바이트)', { fill: WARNBG, stroke: WARN, color: WARN });
    card(dx + 95, dy + 20, 190, 40, { rx: 6, text: dataTxt, fs: 14.5, mono: true, stroke: ACC, s: k === 0 ? pop(u, 0.6) : 1 });
    curve(`M${fp.d[0]},${fp.d[1] + 20} C${fp.d[0]},${dy + 20} ${dx - 60},${dy + 20} ${dx},${dy + 20}`, k === 0 ? seg(u, 0.8, 1.3) : 1, ACC);
    // vtable
    const vx = 600, vy = 140, rows = ['drop_in_place', 'size = 8', 'align = 8', isSq ? 'area → Square::area' : 'area → Circle::area'];
    const vr = vtable(vx, vy, isSq ? 'Square의 vtable' : 'Circle의 vtable', rows, { hot: k === 1 && u > 1.0 ? 3 : -1, w: 230, op: k === 0 ? fade(u, 1.2) : 1 });
    curve(`M${fp.r},${fp.v[1]} C${fp.r + 160},${fp.v[1]} ${vx - 140},${vy + 14} ${vx},${vy + 14}`, k === 0 ? seg(u, 1.3, 1.9) : 1, INFO);
    if (k === 0) tx(600, 300, 'size·align은 rustc 1.100 실측, 칸 순서는 보장되지 않는다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) });
    if (k === 1) { dot([[fp.r, fp.v[1]], [vx - 20, vy + 14], [vx, vy + 104]], seg(u, 0.2, 1.0), INFO, 7);
      grow(vr(3)[0] + 4, vr(3)[1], 900, vr(3)[1] + 150, seg(u, 1.2, 1.8), INFO);
      fnBox(860, 330, 'Circle::area', INFO, { s: pop(u, 1.8) });
      tx(40, 280, '① vtable 주소를 읽고', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) }); tx(40, 308, '② area 칸에서 함수 주소를 읽고', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(40, 336, '③ 그 주소로 점프한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); tx(40, 372, '컴파일 때 대상을 몰라 인라인할 수 없다', { 'font-size': 14, fill: WARN, opacity: fade(u, 2.2) }); }
    if (k === 2) { card(200, 310, 300, 48, { rx: 10, text: 'print_area (기계어 1벌)', fs: 15, mono: true, stroke: INK, fill: SOFT });
      terminal(560, 300, 360, 100, ['$ ./dynamic_dispatch', 'area = 12.56', 'area = 9'], 1 + seg(u, 0.4, 1.2) + seg(u, 1.6, 2.4), {});
      tx(200, 380, '바뀌는 것은 함께 넘어온 vtable 뿐', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) }); }
    if (k === 3) { terminal(560, 300, 360, 80, ['print_area(&*boxed)', 'area = 3.14'], 1 + seg(u, 0.8, 1.4), {});
      tx(40, 300, 'Box는 값을 힙으로 옮겨 소유한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      tx(40, 328, '&*boxed로 빌려 &dyn Shape 자리에 넘긴다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) }); } }

  // ---------- 3. 이종 컬렉션 ----------
  const ITEMS = [['Circle { r: 1.0 }', 3.14, 'Circle'], ['Square { s: 2.0 }', 4, 'Square'], ['Circle { r: 3.0 }', 28.26, 'Circle']];
  function s3(t, c) { const { k, u } = c;
    if (k === 3) { // 정적 Vec 으로는 안 된다
      mono(40, 50, 'let mixed = vec![Circle { r: 1.0 }, Square { s: 2.0 }];', { 'font-size': 16, 'font-weight': 800 });
      tx(40, 100, 'Vec<T>의 칸은 모두 같은 타입 T', { 'font-size': 15, 'font-weight': 700 });
      [0, 1, 2].forEach((i) => card(140 + i * 130, 170, 120, 48, { rx: 6, text: i === 0 ? 'Circle' : '', fs: 15, mono: true, stroke: INK, fill: i ? SOFT : PANEL }));
      const s = E(u, 0.4, 1.2); card(lerp(560, 270, s), 170, 120, 48, { rx: 6, text: 'Square', fs: 15, mono: true, stroke: BAD, color: BAD, fill: BADBG });
      if (u > 1.3) cross(270, 130, 10, pop(u, 1.3));
      diag(40, 250, 640, [['error[E0308]: mismatched types', BAD, 700], ['expected `Circle`, found `Square`', INK]], { show: (i) => fade(u, 1.5 + i * 0.3) });
      tx(40, 370, '섞어 담으려면 원소 타입을 Box<dyn Shape> 하나로 맞춘다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) }); return; }
    mono(40, 36, 'shapes: Vec<Box<dyn Shape>>', { 'font-size': 15, 'font-weight': 800 });
    // Vec 머리 (스택)
    [['ptr', '•'], ['len', '3'], ['cap', '3']].forEach(([n, v], i) => { card(70 + i * 66, 74, 60, 38, { rx: 5, text: v, fs: 15, mono: true, stroke: INK, s: k === 0 ? pop(u, 0.1 + i * 0.1) : 1 }); mono(70 + i * 66, 108, n, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    // 힙의 fat pointer 배열 3칸
    zone(20, 130, 300, 280, '힙: fat pointer 3칸 (16 바이트씩)', { fill: SOFT });
    curve('M70,93 C20,120 20,170 40,180', k === 0 ? seg(u, 0.4, 0.8) : 1, INK);
    const at = k === 1 ? Math.min(2, Math.floor(seg(u, 0.2, 2.4) * 3)) : -1;
    ITEMS.forEach(([obj, a, ty], i) => { const y = 170 + i * 76, show = k === 0 ? fade(u, 0.6 + i * 0.3) : 1;
      if (show <= 0) return; const f = fatPtr(46, y, { op: show, w: 60, nolabel: true });
      const oy = 160 + i * 84; card(500, oy + 20, 190, 40, { rx: 6, text: obj, fs: 14, mono: true, stroke: at === i ? ACC : INK, fill: at === i ? ACCBG : PANEL, op: show });
      curve(`M${f.d[0] + 30},${f.d[1]} C 280,${f.d[1]} 330,${oy + 20} 405,${oy + 20}`, show, ACC, { op: 0.8 });
      const vy = ty === 'Circle' ? 190 : 300;
      curve(`M${f.v[0]},${f.v[1] + 20} C ${f.v[0]},${y + 60} 330,${vy + 40} 740,${vy + 30}`, show, INFO, { op: at === i ? 1 : 0.35 });
      if (k >= 1 && (k > 1 || i <= at)) mono(600 + 10, oy + 25, '→ ' + a, { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: k === 1 && i === at ? fade(u, 0.3 + i * 0.73) : 1 }); });
    ['Circle', 'Square'].forEach((ty, i) => { const y = 190 + i * 110; card(830, y + 30, 160, 70, { rx: 8, text: ty + ' vtable\narea', fs: 14, mono: true, stroke: INFO, fill: INFOBG, color: INFO, op: k === 0 ? fade(u, 1.4) : 1 }); });
    if (k === 0) tx(760, 130, 'Circle 둘은 vtable 하나를 같이 쓴다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
    if (k === 1) mono(560, 60, 'for shape in &shapes { total += shape.area(); }', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' });
    if (k === 2) { const tot = tween(0, 35.4, u, 1.6);
      mono(500, 60, 'total = ' + (u > 1.8 ? '35.4' : tot.toFixed(2)), { 'font-size': 22, 'font-weight': 800, fill: ACC });
      [3.14, 4, 28.26].forEach((v, i) => { const x0 = 420 + [0, 3.14, 7.14][i] * 13; el('rect', { x: x0, y: 80, width: v * 13 * E(u, 0.2 + i * 0.4, 0.8 + i * 0.4), height: 14, rx: 3, fill: i === 1 ? WARN : ACC, opacity: 0.85 }); }); } }

  // ---------- 4. dyn 호환(객체 안전): vtable 한 칸에 들어가는가 ----------
  function slotTable(x, y, name, rows, o) { o = o || {};
    mono(x, y - 10, name, { 'font-size': 14.5, 'font-weight': 800, fill: o.bad ? BAD : INFO });
    rows.forEach(([s, st], i) => { const col = st === 'no' ? BAD : st === 'out' ? OFF : INFO;
      el('rect', { x, y: y + i * 34, width: 250, height: 30, rx: 5, fill: st === 'no' ? BADBG : st === 'out' ? PANEL : INFOBG, stroke: col, 'stroke-width': 1.6, 'stroke-dasharray': st === 'out' ? '5 4' : null });
      mono(x + 10, y + i * 34 + 20, s, { 'font-size': 14, fill: st === 'out' ? MUT : INK }); }); }
  function s4(t, c) { const { k, u } = c;
    const titles = ['trait Draw { fn draw(&self); }', 'trait Bad { fn on<T>(&self, x: T); }', 'trait Cloneable { fn dup(&self) -> Self; }', 'trait Mixed { draw · helper<T> where Self: Sized }'];
    mono(40, 46, titles[k], { 'font-size': 16, 'font-weight': 800, fill: k === 1 || k === 2 ? BAD : ACC });
    tx(40, 80, 'dyn으로 쓰려면 메서드마다 vtable에 주소 한 칸을 만들 수 있어야 한다', { 'font-size': 14, fill: MUT });
    if (k === 0) { fnBox(160, 170, 'draw(&self)', ACC, { s: pop(u, 0.2) });
      dot([[240, 170], [560, 170]], seg(u, 0.6, 1.3), ACC, 7);
      slotTable(580, 140, 'vtable', [['drop · size · align', 'ok'], ['draw → 주소 하나', 'ok']]);
      check(860, 194, 10, pop(u, 1.4));
      pill(300, 300, 'Vec<Box<dyn Draw>> 가능', GOOD, pop(u, 1.8), { mono: true, fs: 15 }); return; }
    if (k === 1) { ['on::<i32>', 'on::<String>', 'on::<f64>', 'on::<…>'].forEach((s, i) => { const a = pop(u, 0.2 + i * 0.25); card(150, 130 + i * 50, 170, 40, { rx: 8, text: s, fs: 14.5, mono: true, stroke: WARN, color: WARN, s: a }); });
      slotTable(580, 160, 'vtable', [['drop · size · align', 'ok'], ['on → ???', 'no']]);
      [0, 1, 2].forEach((i) => grow(240, 150 + i * 50, 575, 210, seg(u, 1.0 + i * 0.15, 1.5 + i * 0.15), BAD, { dash: '6 5' }));
      tx(580, 280, '타입마다 다른 함수라 칸 하나에 못 담는다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      diag(40, 330, 880, [["error[E0038]: the trait `Bad` is not dyn compatible", BAD, 700], ['...because method `on` has generic type parameters', INK]], { show: (i) => fade(u, 1.8 + i * 0.3) }); return; }
    if (k === 2) { card(200, 170, 220, 60, { rx: 8, text: '&dyn Cloneable', fs: 16, mono: true, stroke: INK });
      grow(312, 170, 470, 170, seg(u, 0.3, 0.8), MUT); mono(390, 158, 'dup()', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      card(570, 170, 180, 60, { rx: 8, text: 'Self = ?', fs: 18, mono: true, stroke: BAD, color: BAD, fill: BADBG, dash: '6 4', s: pop(u, 0.9) });
      tx(570, 230, '몇 바이트를 받아 둘지 모른다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      diag(40, 300, 880, [["error[E0038]: the trait `Cloneable` is not dyn compatible", BAD, 700], ['...because method `dup` references the `Self` type in its return type', INK]], { show: (i) => fade(u, 1.6 + i * 0.3) }); return; }
    // k3
    fnBox(160, 160, 'draw(&self)', ACC, {}); fnBox(160, 240, 'helper<T> where Self: Sized', OFF, { op: 1 });
    dot([[240, 160], [560, 190]], seg(u, 0.3, 1.0), ACC, 7);
    slotTable(580, 160, 'vtable', [['drop · size · align', 'ok'], ['draw → 주소 하나', 'ok'], ['helper: 칸 없음', 'out']]);
    check(860, 210, 10, pop(u, 1.2));
    tx(40, 320, 'helper는 dyn 으로는 못 부르지만 트레잇은 다시 dyn 호환', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
    terminal(560, 300, 360, 80, ['let m: &dyn Mixed = &Circle { r: 1.0 };', 'draw circle'], 1 + seg(u, 1.8, 2.4), { title: 'm.draw() 실행 예', fs: 13.5 }); }

  // ---------- 5. 선택 기준 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { mono(40, 46, 'fn sum_areas<T: Shape>(xs: &[T]) -> f64', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      tx(40, 84, '&[Circle]: 8 바이트 값이 빈틈없이 줄지어 있다', { 'font-size': 14, fill: MUT });
      for (let i = 0; i < 6; i++) card(80 + i * 76, 140, 70, 44, { rx: 4, text: 'r', fs: 15, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.2 + i * 0.1) });
      const p = seg(u, 0.9, 2.3); if (p > 0 && p < 1) el('rect', { x: 46 + p * 456, y: 112, width: 70, height: 56, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 3 });
      card(260, 260, 400, 56, { rx: 10, text: 'area() 본문이 반복문 안에 펼쳐진다', fs: 15, stroke: ACC, fill: PANEL, s: pop(u, 1.6) });
      tx(600, 160, '기본값은 정적', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 2.0) }); return; }
    if (k === 1 || k === 2) { mono(40, 46, 'struct Canvas { widgets: Vec<Box<dyn Draw>> }', { 'font-size': 16, 'font-weight': 800, fill: INFO });
      const ws = ['Button', 'Slider', 'Chart'], hot = k === 2 ? Math.min(2, Math.floor(seg(u, 0.2, 2.3) * 3)) : -1;
      ws.forEach((w, i) => card(110 + i * 170, 150, 150, 56, { rx: 8, text: w + '\n(예시 위젯)', fs: 14, stroke: hot === i ? INFO : INK, fill: hot === i ? INFOBG : PANEL, s: k === 1 ? pop(u, 0.2 + i * 0.25) : 1 }));
      card(620, 150, 150, 56, { rx: 8, text: '+ 나중에 추가', fs: 14.5, stroke: GRID, color: MUT, dash: '6 5', s: k === 1 ? pop(u, 1.2) : 1 });
      if (k === 1) tx(40, 260, '어떤 위젯이 더 생길지 컴파일 때 다 알 수 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      if (k === 2) { mono(40, 260, 'for w in &self.widgets { w.draw(); }', { 'font-size': 15, 'font-weight': 700 });
        if (hot >= 0) { dot([[110 + hot * 170, 180], [110 + hot * 170, 320]], (seg(u, 0.2, 2.3) * 3) % 1, INFO, 6);
          fnBox(110 + hot * 170, 340, ws[hot] + '::draw', INFO, {}); }
        tx(560, 300, '위젯마다 vtable을 한 번 거친다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) }); tx(560, 326, '그리기 몇 번에는 무시할 만한 비용', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) }); }
      return; }
    // k3: &dyn vs Box<dyn>
    [['fn log(s: &dyn Shape)', GOOD, false], ['fn log(s: Box<dyn Shape>)', BAD, true]].forEach(([sig, col, heapy], i) => { const x = 40 + i * 470, a = fade(u, 0.2 + i * 0.6);
      mono(x, 60, sig, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: a });
      card(x + 90, 150, 170, 44, { rx: 6, text: 'Circle (스택)', fs: 14, stroke: INK, op: a });
      if (!heapy) { curve(`M${x + 90},104 L${x + 90},126`, seg(u, 0.6, 1.0), GOOD); mono(x + 90, 96, '빌려서 가리킨다', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, opacity: a }); }
      else { const g = E(u, 1.2, 1.9); zone(x + 230, 200, 200, 80, null, { fill: WARNBG, stroke: WARN, op: g }); tx(x + 330, 304, '힙 할당 +1', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: g }); fly(x + 90, 150, x + 330, 258, seg(u, 1.0, 1.8), 'Circle', { stay: true, fill: WARN }); } });
    tx(480, 340, '소유할 필요가 없으면 &dyn으로 충분하다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.1) }); }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: 'print_area<T: Shape>를 Circle과 Square로 한 번씩 부르면 기계어에는 무엇이 남는가?',
      o: ['print_area::<Circle>과 print_area::<Square> 두 함수', 'print_area 하나와 vtable 둘', 'Shape 트레잇 하나'], a: 0,
      why: '정적 디스패치는 모노모픽화다. 호출 대상이 컴파일 때 정해져 직접 호출되고 인라인될 수 있다.' },
    { q: '&dyn Shape가 &Circle보다 두 배인 16바이트인 이유는 무엇인가?',
      o: ['Circle 값을 복사해 같이 들고 있어서', '데이터 주소와 vtable 주소를 함께 들고 있어서', '타입 이름 문자열을 들고 있어서'], a: 1,
      why: 'trait object는 fat pointer다. area()를 부를 때 vtable 주소로 가서 함수 주소를 읽고 점프한다.' },
    { q: 'Circle r=1, Square s=2, Circle r=3을 담은 Vec<Box<dyn Shape>>의 total은 얼마인가?',
      o: ['3.14', '35.4', '컴파일되지 않는다'], a: 1,
      why: '3.14 + 4 + 28.26 = 35.4다. 원소마다 자기 vtable의 area가 불린다.' },
    { q: 'trait Bad { fn on<T>(&self, x: T); }를 &dyn Bad로 쓸 수 없는 이유는 무엇인가?',
      o: ['&self를 받기 때문이다', '반환값이 없기 때문이다', 'on은 T마다 다른 함수라 vtable 한 칸에 담을 수 없기 때문이다'], a: 2,
      why: 'rustc는 E0038 the trait `Bad` is not dyn compatible로 막는다. where Self: Sized를 붙이면 그 메서드만 vtable에서 뺄 수 있다.' },
    { q: '소유권이 필요 없는 함수 인자를 Box<dyn Shape>로 받으면 생기는 손해는 무엇인가?',
      o: ['vtable을 쓸 수 없다', '호출할 때마다 힙 할당이 하나 는다', '정적 디스패치로 바뀐다'], a: 1,
      why: 'Box는 값을 힙으로 옮겨 소유한다. 빌려 쓰기만 하면 &dyn Shape로 이미 있는 값을 가리키면 된다.' },
  ];

  const summary = [
    '제네릭으로 받으면 타입마다 함수가 따로 생겨 직접 호출되고 인라인될 수 있다.',
    'dyn으로 받으면 함수는 하나이고, 16바이트 fat pointer의 vtable로 구현을 찾는다.',
    '서로 다른 타입을 한 Vec에 담는 일은 Box<dyn Shape>로만 할 수 있다.',
    '제네릭 메서드나 Self 반환이 있으면 dyn이 안 되니, 기본은 정적으로 쓴다.',
  ];
  const review = [
    { q: '플러그인을 Vec<T: Plugin>에 모으려 했더니 다른 플러그인 타입을 넣는 줄에서 E0308이 났다. 바꿀 것은?',
      o: ['원소 타입을 Vec<Box<dyn Plugin>>으로 바꾼다', 'Plugin에 제네릭 메서드를 추가한다', 'T를 impl Plugin으로 바꾼다'], a: 0,
      why: 'Vec<T>는 한 가지 타입만 담는다. 종류가 열린 목록은 원소를 Box<dyn Plugin>으로 맞추고 vtable로 분기한다.' },
    { q: 'Box<dyn Store>로 쓰던 트레잇에 fn get<T>(&self) -> T를 추가하자 E0038이 났다. 가장 작은 수정은?',
      o: ['모든 구현을 지우고 enum으로 바꾼다', 'Box를 Rc로 바꾼다', 'get에 where Self: Sized를 붙여 vtable에서 뺀다'], a: 2,
      why: '제네릭 메서드는 vtable 한 칸에 담을 수 없다. 그 메서드만 빼면 나머지 메서드는 계속 dyn으로 부를 수 있다.' },
    { q: '초당 수백만 번 도는 계산 루프의 area() 호출이 dyn이라 느리다. 먼저 해 볼 것은?',
      o: ['vtable을 직접 만든다', '루프 쪽을 제네릭으로 바꿔 인라인되게 한다', 'Box를 하나 더 씌운다'], a: 1,
      why: 'dyn 호출은 vtable을 거쳐 인라인이 안 된다. 타입이 정해지는 뜨거운 경로는 정적 디스패치가 낫다.' },
  ];

  R.page({ title: '정적 디스패치와 trait object', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
