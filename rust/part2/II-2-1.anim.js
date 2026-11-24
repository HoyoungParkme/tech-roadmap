/* II-2-1 derive 매크로 — Debug/Clone/Copy/Eq — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림의 재료: derive 뱃지 줄(beat.derives), 구조체 필드 칸(beat.struct), 손으로 쓴 impl이 한 줄로 접히는 모습과 실제 확장,
   서식 {:?}·{:#?}·{} 가 찾아가는 트레잇, 스택 8바이트 복사와 String의 ptr·len·cap → 힙(move와 clone),
   HashMap 버킷과 Eq 비교, 필드별 트레잇 구현표 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  // ---------- 지역 도우미 ----------
  function diag(x, y, w, rows, o) { o = o || {}; const lh = o.lh || 22, h = 16 + rows.length * lh, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 1.8, opacity: op });
    rows.forEach(([s, col, fw], i) => { const a = (o.show ? o.show(i) : 1) * op; if (a <= 0.01) return;
      mono(x + 14, y + 8 + i * lh + lh * 0.72, s, { 'font-size': o.fs || 14, fill: col || INK, 'font-weight': fw || 400, opacity: a }); });
    return h; }
  // derive 뱃지 줄 (beat.derives 그대로): 켜짐 ACC, 꺼짐 회색, 막힘 빨강
  function rail(x, y, ds, o) { o = o || {}; let xx = x;
    tx(x, y - 22, '#[derive(…)]', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, class: 'mono' });
    ds.forEach((d, i) => { const w = tw(d.name, 14) + 26, col = d.blocked ? BAD : d.on ? ACC : OFF, a = o.a ? o.a(i) : 1;
      el('rect', { x: xx, y: y - 14, width: w, height: 28, rx: 14, fill: d.on ? ACCBG : d.blocked ? BADBG : PANEL, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': d.on || d.blocked ? null : '4 4', opacity: a });
      mono(xx + 13, y + 5, d.name, { 'font-size': 14, 'font-weight': 700, fill: d.on ? ACC : d.blocked ? BAD : MUT, opacity: a });
      if (d.blocked) el('line', { x1: xx + 8, y1: y, x2: xx + w - 8, y2: y, stroke: BAD, 'stroke-width': 2, opacity: a });
      xx += w + 8; }); }
  // 구조체 칸 (beat.struct): 이름 + 필드(이름: 타입) + 값
  function structCard(x, y, st, vals, o) { o = o || {}; const fw = o.fw || 120, op = o.op ?? 1, col = o.stroke || INK;
    mono(x, y - 10, o.label || st.name, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: op });
    st.fields.forEach((f, i) => { const xx = x + i * (fw + 6), hot = o.hot && o.hot(i);
      el('rect', { x: xx, y, width: fw, height: 60, rx: 6, fill: hot ? (hot === true ? HL : hot) : o.fill || PANEL, stroke: col, 'stroke-width': 2, opacity: op });
      mono(xx + 10, y + 21, `${f.name}: ${f.type}`, { 'font-size': 13.5, fill: MUT, opacity: op });
      if (vals && vals[i] != null) mono(xx + 10, y + 47, String(vals[i]), { 'font-size': 17, 'font-weight': 800, opacity: op }); });
    return { w: st.fields.length * (fw + 6) - 6, fx: (i) => x + i * (fw + 6) + fw / 2 }; }
  function codeLines(x, y, lines, o) { o = o || {}; const lh = o.lh || 22, fs = o.fs || 14;
    lines.forEach((s, i) => { const a = (o.show ? o.show(i) : 1) * (o.op ?? 1); if (a <= 0.01) return; const hl = o.hl && o.hl(i);
      if (hl) el('rect', { x: x - 6, y: y + i * lh - lh * 0.72, width: o.w || tw(s, fs) + 12, height: lh, rx: 4, fill: hl === true ? HL : hl, opacity: 0.7 * a });
      mono(x, y + i * lh, s, { 'font-size': fs, fill: (o.col && o.col(i)) || INK, 'font-weight': o.fw || 400, opacity: a }); }); }

  // ---------- 1. derive가 impl을 대신 쓴다 ----------
  const HAND = ['impl std::fmt::Debug for Point {', '    fn fmt(&self, f: &mut Formatter) -> Result {', '        f.debug_struct("Point")', '         .field("x", &self.x)', '         .field("y", &self.y)', '         .finish()', '    }', '}'];
  function s1(t, c) { const { k, u } = c, b = c.beat;
    rail(560, 50, b.derives, { a: (i) => (k === 3 && i === 0 ? pop(u, 1.4) : 1) });
    const sc = structCard(40, 60, b.struct, null, { stroke: k <= 2 ? INK : ACC, label: (k >= 3 ? '#[derive(Debug)] ' : '') + 'struct ' + b.struct.name, hot: (i) => k === 2 && u > 0.6 + i * 0.6 && u < 1.4 + i * 0.6 });
    if (k === 0) { mono(40, 200, 'println!("{:?}", p);', { 'font-size': 18, 'font-weight': 700, fill: BAD }); cross(300, 194, 10, pop(u, 0.6));
      tx(40, 240, '구현된 트레잇이 하나도 없어 {:?}로 찍을 수 없다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) }); return; }
    if (k <= 2) { // 손으로 쓰는 impl
      const n = k === 1 ? 2 + Math.round(seg(u, 1.6, 2.4)) * 0 : 8;
      el('rect', { x: 30, y: 150, width: 560, height: 30 + 8 * 24, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      codeLines(46, 176, HAND, { lh: 24, fs: 14.5, show: (i) => (k === 1 ? (i < 2 || i >= 6 ? fade(u, 0.2 + i * 0.25) : 0) : i >= 2 && i <= 5 ? fade(u, 0.3 + (i - 2) * 0.4) : 1), hl: (i) => (k === 2 && (i === 3 || i === 4) ? true : k === 1 && i === 1) });
      if (k === 2) { [0, 1].forEach((i) => grow(sc.fx(i), 122, 300, 176 + (3 + i) * 24 - 8, seg(u, 0.6 + i * 0.6, 1.2 + i * 0.6), ACC));
        mono(760, 250, '손으로 쓴 줄', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT }); mono(760, 290, String(Math.round(tween(4, 8, u))), { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, fill: WARN });
        tx(760, 330, '필드가 늘면 줄도 는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      if (k === 1) { tx(640, 220, '시그니처를 한 글자도', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); tx(640, 244, '틀리면 안 된다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); }
      return; }
    if (k === 3) { // 8줄 → 1줄
      const s = E(u, 0.2, 1.2);
      el('rect', { x: 30, y: 150, width: 560, height: lerp(222, 40, s), rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: 1 - s * 0.6 });
      if (s < 0.5) codeLines(46, 176, HAND, { lh: 24, fs: 14.5, op: 1 - s * 2 });
      if (s > 0.5) mono(46, 176, '#[derive(Debug)]', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: (s - 0.5) * 2 });
      mono(760, 250, '손으로 쓴 줄', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT }); mono(760, 290, String(Math.round(lerp(8, 1, s))), { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, fill: ACC });
      tx(310, 250, '같은 Debug impl을 컴파일러가 만든다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    // k4: 실제 확장 결과
    tx(40, 170, 'rustc -Zunpretty=expanded로 본 실제 확장', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    el('rect', { x: 30, y: 182, width: 900, height: 134, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 1.8 });
    codeLines(46, 206, ['#[automatically_derived]', 'impl ::core::fmt::Debug for Point2 {', '    fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {', '        ::core::fmt::Formatter::debug_struct_field2_finish(f, "Point2", "x", &self.x, "y", &&self.y)'],
      { lh: 26, fs: 14, show: (i) => fade(u, 0.2 + i * 0.35), col: (i) => (i === 3 ? ACC : INK) });
    terminal(560, 330, 370, 78, ['$ ./derive_intro', 'Point2 { x: 3, y: 4 }'], 1 + seg(u, 1.8, 2.4), { title: '{:?} 실행 예' });
    tx(40, 360, '컴파일할 때 펼쳐지므로 실행 비용은 손으로 쓴 것과 같다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }

  // ---------- 2. {:?} · {:#?} · {} 가 찾는 트레잇 ----------
  const FMT = [['{:?}', 'Debug'], ['{:#?}', 'Debug'], ['{}', 'Display']];
  function s2(t, c) { const { k, u } = c, b = c.beat, outs = b.outputs || [];
    rail(560, 40, b.derives);
    structCard(40, 70, b.struct, [3, 4], { label: 'p: Point', stroke: ACC });
    // 서식 세 갈래
    FMT.forEach(([f, tr], i) => { const y = 200 + i * 66, show = k >= i + 1 || (k === 4 && i === 2), on = k === i + 1;
      const okTr = tr === 'Debug' || k === 4, a = show ? (on ? fade(u, 0.2) : 1) : 0.25;
      card(100, y, 110, 46, { rx: 8, text: f, fs: 17, mono: true, stroke: on ? (okTr ? ACC : BAD) : GRID, color: INK, op: a });
      grow(158, y, 238, y, show ? (on ? seg(u, 0.3, 0.8) : 1) : 0, okTr ? ACC : BAD, { plain: !okTr });
      card(320, y, 150, 46, { rx: 23, text: tr + (tr === 'Display' ? (k === 4 ? ' (손으로)' : '') : ' (derive)'), fs: 14.5, mono: true, stroke: okTr ? ACC : BAD, fill: okTr ? ACCBG : BADBG, color: okTr ? ACC : BAD, op: a });
      if (show && !okTr) cross(410, y - 24, 8, on ? pop(u, 0.9) : 1);
      if (show && okTr && i < 2) check(410, y - 24, 8, on ? pop(u, 0.9) : 1); });
    // 출력
    if (k === 0) { tx(560, 220, 'derive(Debug)만 붙인 값', { 'font-size': 15, 'font-weight': 700 }); tx(560, 248, '아직 아무것도 찍지 않았다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) }); return; }
    if (k === 1) { grow(470, 200, 560, 200, seg(u, 0.9, 1.4), ACC);
      terminal(570, 160, 360, 80, ['$ ./debug_vs_display', 'Point { x: 3, y: 4 }'], 1 + seg(u, 1.4, 2.2), {});
      tx(570, 280, '필드 이름과 값을 차례로 찍는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { terminal(500, 170, 430, 160, ['$ ./debug_vs_display', 'Point { x: 3, y: 4 }', 'Point {', '    x: 3,', '    y: 4,', '}'], 2 + seg(u, 0.4, 2.0) * 4, { title: '{:#?} 는 들여쓰기' }); return; }
    if (k === 3) { diag(500, 300, 440, [["error[E0277]: `Point` doesn't", BAD, 700], ['  implement `std::fmt::Display`', BAD, 700], ['Display는 derive가 없다', INK]], { show: (i) => fade(u, 1.0 + i * 0.3) });
      tx(500, 210, '{}는 사람이 읽을 모양을 찾는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) }); tx(500, 236, '그 모양은 프로그램마다 달라 자동으로 못 만든다', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) }); return; }
    // k4
    codeLines(510, 190, ['impl fmt::Display for Point {', '  fn fmt(…) {', '    write!(f, "({}, {})", self.x, self.y)', '  }', '}'], { lh: 22, fs: 14, show: (i) => fade(u, 0.2 + i * 0.2), col: (i) => (i === 2 ? ACC : INK) });
    card(720, 360, 180, 48, { rx: 8, fill: INK, stroke: 'none', text: '(3, 4)', fs: 20, mono: true, color: PANEL, s: pop(u, 1.6) }); }

  // ---------- 3. Copy vs Clone: 스택 복사, move, 힙 복제 ----------
  function stackRow(x, y, name, vals, o) { o = o || {}; const op = o.op ?? 1, col = o.col || INK;
    mono(x - 12, y + 26, name, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: o.dead ? OFF : col, opacity: op, 'text-decoration': o.dead ? 'line-through' : null });
    vals.forEach(([n, v], i) => { const a = o.fill ? clamp(o.fill * vals.length - i) : 1; if (a <= 0) return;
      el('rect', { x: x + i * 74, y, width: 70, height: 40, rx: 5, fill: o.dead ? SOFT : PANEL, stroke: o.dead ? OFF : col, 'stroke-width': 2, opacity: op * a });
      mono(x + i * 74 + 35, y + 26, v, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: o.dead ? OFF : INK, opacity: op * a });
      mono(x + i * 74 + 35, y + 56, n, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op * a }); }); }
  function heap(x, y, s, o) { o = o || {}; const op = o.op ?? 1;
    [...s].forEach((ch, i) => { el('rect', { x: x + i * 40, y, width: 38, height: 40, rx: 4, fill: o.fill || WARNBG, stroke: WARN, 'stroke-width': 1.8, opacity: op });
      mono(x + i * 40 + 19, y + 26, `'${ch}'`, { 'font-size': 15, 'text-anchor': 'middle', opacity: op }); }); }
  function arrowTo(x1, y1, x2, y2, u, col, d) { if (u <= 0) return; const mx = (x1 + x2) / 2;
    el('path', { d: d || `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, fill: 'none', stroke: col || INK, 'stroke-width': 2.2, pathLength: 1, 'stroke-dasharray': `${clamp(u)} 2`, 'marker-end': u > 0.98 ? 'url(#ra-ah)' : null }); }
  function s3(t, c) { const { k, u } = c;
    // 위: Point (Copy)
    zone(20, 16, 920, 150, 'Point — i32 필드 둘, 8 바이트 (Copy)', { fill: SOFT });
    rail(560, 54, c.beat.derives.slice(1, 3), {});
    stackRow(110, 70, 'a', [['x', '1'], ['y', '2']], {});
    if (k === 0) { tx(330, 98, 'Copy는 Clone을 전제로 한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      tx(330, 124, 'derive(Copy)만 쓰면 E0277: the trait bound `P1: Clone`', { 'font-size': 13.5, fill: BAD, class: 'mono', opacity: fade(u, 1.0) }); }
    if (k >= 1) { stackRow(420, 70, 'b', [['x', '1'], ['y', '2']], { fill: k === 1 ? E(u, 0.4, 1.4) : 1, col: ACC });
      if (k === 1) { fly(300, 58, 480, 58, seg(u, 0.2, 1.0), '8바이트 복사', { mono: false }); }
      if (k >= 1) { check(300, 70, 9, k === 1 ? pop(u, 1.6) : 1); mono(640, 96, 'a.x, b.x → 1 1', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: k === 1 ? fade(u, 1.8) : 1 }); } }
    // 아래: String (move / clone)
    zone(20, 180, 920, 230, 'String — 스택에 ptr·len·cap, 글자는 힙', { fill: SOFT });
    const dead = k >= 2 && (k > 2 || u > 1.0);
    stackRow(110, 230, 's1', [['ptr', '•'], ['len', '2'], ['cap', '2']], { dead, op: k === 0 ? fade(u, 1.2) : 1 });
    heap(560, 230, 'hi', { op: k === 0 ? fade(u, 1.4) : 1 });
    zone(540, 210, 120, 80, null, { fill: 'none', stroke: WARN, dash: '5 4' }); mono(600, 306, '힙', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700 });
    if (!dead) arrowTo(0, 0, 0, 0, k === 0 ? seg(u, 1.5, 2.2) : 1, INK, 'M147,230 C147,206 580,206 580,226');
    if (k >= 2) { const g = k === 2 ? E(u, 0.2, 1.0) : 1;
      stackRow(110, 330, 's2', [['ptr', '•'], ['len', '2'], ['cap', '2']], { fill: g, col: ACC });
      arrowTo(0, 0, 0, 0, k === 2 ? seg(u, 1.0, 1.6) : 1, INK, 'M145,330 C145,302 600,312 600,274');
      if (k === 2) { diag(680, 216, 250, [['error[E0382]:', BAD, 700], ['borrow of moved', BAD, 700], ['value: `s1`', BAD, 700]], { show: (i) => fade(u, 1.6 + i * 0.2) });
        tx(810, 330, '머리 24바이트만 옮겨지고', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); tx(810, 352, 's1은 더 쓸 수 없다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); } }
    if (k === 3) { const g = E(u, 0.3, 1.2);
      heap(720, 330, 'hi', { op: g, fill: ACCBG });
      stackRow(420, 330, 's3', [['ptr', '•'], ['len', '2']], { fill: E(u, 1.0, 1.6), col: ACC });
      arrowTo(570, 350, 716, 350, seg(u, 1.6, 2.2), ACC);
      mono(800, 395, 'ptr 같나? false', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) });
      mono(780, 262, '.clone() → 힙을 새로', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) }); } }

  // ---------- 4. PartialEq/Eq + Hash: HashMap 키 ----------
  const BX = (i) => 520 + i * 52, BY = 230;
  function buckets(hot, fill) { tx(520, BY - 36, 'HashMap 버킷 (위치는 예시)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    for (let i = 0; i < 8; i++) { const f = fill[i];
      el('rect', { x: BX(i), y: BY - 20, width: 46, height: 40, rx: 5, fill: hot === i ? HL : f ? ACCBG : PANEL, stroke: f ? ACC : GRID, 'stroke-width': 1.8 });
      mono(BX(i) + 23, BY + 38, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      if (f) mono(BX(i) + 23, BY + 6, '•', { 'font-size': 18, 'text-anchor': 'middle', fill: ACC, 'font-weight': 800 }); } }
  function s4(t, c) { const { k, u } = c;
    rail(40, 46, c.beat.derives);
    const fill = { 2: k >= 1 && (k > 1 || u > 1.0), 5: k >= 1 && (k > 1 || u > 1.8) };
    buckets(k === 2 && u > 1.0 ? 5 : -1, fill);
    if (k === 0) { tx(40, 150, 'Hash: 어느 버킷인지 고른다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.4) });
      tx(40, 180, 'Eq: 버킷 안에서 정말 같은 키인지 가린다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(40, 220, '둘 중 하나라도 없으면 insert가 컴파일되지 않는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) });
      tx(40, 246, 'error[E0277]: the trait bound `Point: Hash` is not satisfied', { 'font-size': 13.5, fill: BAD, class: 'mono', opacity: fade(u, 1.8) }); return; }
    if (k === 1) { [['Point { x: 0, y: 0 }', '"origin"', 2, 0.2], ['Point { x: 1, y: 2 }', '"a"', 5, 1.0]].forEach(([key, v, bk, a], i) => {
        const y = 140 + i * 60; mono(40, y, `insert(${key}, ${v})`, { 'font-size': 14.5, fill: INK, opacity: fade(u, a) });
        dot([[300, y - 5], [BX(bk) + 23, BY - 20]], seg(u, a + 0.2, a + 0.8), ACC, 6); });
      mono(40, 300, `len() = ${u > 1.8 ? 2 : u > 1.0 ? 1 : 0}`, { 'font-size': 17, 'font-weight': 800, fill: ACC }); return; }
    if (k === 2) { mono(40, 150, 'let k = Point { x: 1, y: 2 };', { 'font-size': 15, 'font-weight': 700 }); tx(40, 176, '새로 만든 값 (저장한 값과 다른 자리)', { 'font-size': 13.5, fill: MUT });
      dot([[290, 145], [BX(5) + 23, BY - 20]], seg(u, 0.3, 1.0), INFO, 7);
      // 버킷 5 안에서 필드별 비교
      [['x', '1', '1'], ['y', '2', '2']].forEach(([f, a, b2], i) => { const y = 330 + i * 32, o = fade(u, 1.2 + i * 0.4);
        mono(520, y, `k.${f} == 저장된.${f}`, { 'font-size': 14.5, opacity: o }); mono(760, y, `${a} == ${b2}`, { 'font-size': 14.5, 'font-weight': 700, opacity: o }); if (o > 0.9) check(850, y - 5, 8, 1); });
      card(220, 330, 260, 50, { rx: 8, fill: INK, stroke: 'none', text: 'Some("a")', fs: 18, mono: true, color: PANEL, s: pop(u, 2.1) }); return; }
    // k3: == 와 assert_eq!
    mono(40, 150, 'assert_eq!(k, Point { x: 1, y: 2 });', { 'font-size': 16, 'font-weight': 700 });
    [['x', 1], ['y', 2]].forEach(([f, v], i) => { const y = 200 + i * 40; mono(60, y, `${f}: ${v} == ${v}`, { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.4) }); check(200, y - 5, 8, pop(u, 0.5 + i * 0.4)); });
    pill(130, 300, '통과', GOOD, pop(u, 1.3), { fs: 15 });
    tx(40, 360, 'f64 필드는 NaN 때문에 Eq를 못 붙인다 (E0277 `f64: Eq`)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }

  // ---------- 5. derive는 필드 전부가 구현해야 성립 ----------
  const COLS = ['Debug', 'Clone', 'Copy', 'PartialEq'];
  const FIELD = [['id: u64', [1, 1, 1, 1]], ['conn: TcpStream', [1, 0, 0, 0]]];
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { const x0 = 230, cw = 140, y0 = 100;
      mono(40, 50, 'struct User { id: u64, conn: TcpStream }', { 'font-size': 17, 'font-weight': 800 });
      COLS.forEach((s, j) => mono(x0 + j * cw + cw / 2, y0, s, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: k === 1 && j === 1 ? BAD : MUT }));
      FIELD.forEach(([n, v], i) => { const y = y0 + 40 + i * 50; mono(40, y + 5, n, { 'font-size': 15, 'font-weight': 700 });
        v.forEach((ok, j) => { const a = pop(u, k === 0 ? 0.2 + (i * 4 + j) * 0.1 : 0); if (ok) check(x0 + j * cw + cw / 2, y, 8, a); else cross(x0 + j * cw + cw / 2, y, 7, a); }); });
      el('line', { x1: 40, y1: y0 + 130, x2: 820, y2: y0 + 130, stroke: INK, 'stroke-width': 2 });
      mono(40, y0 + 165, 'User', { 'font-size': 16, 'font-weight': 800 });
      COLS.forEach((s, j) => { const ok = j === 0, a = k === 0 ? pop(u, 1.6 + j * 0.15) : 1, cx = x0 + j * cw + cw / 2;
        card(cx, y0 + 160, 110, 38, { rx: 19, text: ok ? 'derive 됨' : '불가', fs: 14, stroke: ok ? ACC : BAD, fill: ok ? ACCBG : (k === 1 && j === 1 ? BADBG : PANEL), color: ok ? ACC : BAD, s: a }); });
      tx(40, y0 + 210, '열마다 필드 전부가 ✓여야 구조체도 derive 할 수 있다', { 'font-size': 15, 'font-weight': 700, opacity: k === 0 ? fade(u, 2.2) : 1 });
      if (k === 1) diag(40, 330, 620, [['error[E0277]: the trait bound `TcpStream: Clone` is not satisfied', BAD, 700]], { show: () => fade(u, 0.6) });
      return; }
    // k2, k3: CiName — 바이트 비교 vs 대소문자 무시
    const hand = k === 3, A = 'Rust', Bs = 'RUST';
    mono(40, 50, hand ? 'impl PartialEq for CiName { eq_ignore_ascii_case }' : '#[derive(PartialEq)] struct CiName(String)', { 'font-size': 16, 'font-weight': 800, fill: hand ? ACC : INK });
    [[A, 120], [Bs, 200]].forEach(([s, y], r) => { mono(40, y + 26, r ? 'CiName("RUST")' : 'CiName("Rust")', { 'font-size': 15, 'font-weight': 700 });
      [...s].forEach((ch, i) => { const diff = !hand && i > 0, a = fade(u, 0.2 + i * 0.1);
        el('rect', { x: 260 + i * 56, y, width: 50, height: 40, rx: 5, fill: diff && u > 1.0 ? BADBG : hand && u > 1.0 ? GOODBG : PANEL, stroke: diff && u > 1.0 ? BAD : INK, 'stroke-width': 1.8, opacity: a });
        mono(285 + i * 56, y + 26, ch, { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', opacity: a }); }); });
    [0, 1, 2, 3].forEach((i) => { const ok = hand || i === 0, a = fade(u, 1.0 + i * 0.15); mono(285 + i * 56, 290, ok ? '=' : '≠', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ok ? GOOD : BAD, opacity: a }); });
    card(720, 200, 200, 56, { rx: 10, fill: INK, stroke: 'none', text: '== → ' + (hand ? 'true' : 'false'), fs: 18, mono: true, color: PANEL, s: pop(u, 1.8) });
    tx(40, 360, hand ? '도메인 규칙은 손으로 쓴 impl에 담는다' : 'derive가 만든 ==는 필드를 바이트까지 그대로 비교한다', { 'font-size': 15, 'font-weight': 700, fill: hand ? ACC : BAD, opacity: fade(u, 2.0) }); }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: '#[derive(Debug)] 한 줄이 실제로 하는 일은 무엇인가?',
      o: ['실행 중에 필드를 찾아 출력한다', '컴파일할 때 필드 목록을 읽어 impl Debug 블록을 만들어 넣는다', 'Display 구현까지 함께 만든다'], a: 1,
      why: 'derive는 절차 매크로다. rustc로 펼쳐 보면 debug_struct_field2_finish를 부르는 impl Debug가 들어 있다.' },
    { q: 'derive(Debug)만 붙인 Point를 println!("{}", p)로 찍으면 어떻게 되는가?',
      o: ['E0277로 컴파일이 막힌다', 'Point { x: 3, y: 4 }가 찍힌다', '(3, 4)가 찍힌다'], a: 0,
      why: '{}는 Display를 찾는다. Display는 derive가 없어 impl을 직접 써야 (3, 4)처럼 찍힌다.' },
    { q: 'let s2 = s1; 다음에 s1을 쓰면 E0382가 나는 이유는 무엇인가?',
      o: ['String이 Clone을 구현하지 않아서', 's2가 힙 글자까지 복사해 s1이 비어서', 'String은 Copy가 아니라 소유권이 s2로 옮겨갔기 때문'], a: 2,
      why: 'String은 힙을 소유해 Copy를 붙일 수 없다. 대입하면 ptr·len·cap만 옮겨지고 s1은 더 쓸 수 없는 이름이 된다.' },
    { q: 'Point를 HashMap 키로 쓰려면 꼭 derive해야 하는 조합은 무엇인가?',
      o: ['Clone과 Copy', 'Eq와 Hash', 'Debug와 Display'], a: 1,
      why: 'Hash로 버킷을 고르고 Eq로 같은 키인지 가린다. 둘 중 하나가 없으면 insert가 E0277로 막힌다.' },
    { q: 'User에 conn: TcpStream 필드가 있을 때 #[derive(Clone)]이 막히는 이유는 무엇인가?',
      o: ['TcpStream이 Clone을 구현하지 않아서', 'u64 필드가 Copy라서', 'Debug를 먼저 지워야 해서'], a: 0,
      why: 'derive(Clone)은 모든 필드를 clone하는 코드를 만든다. 필드 하나라도 Clone이 없으면 the trait bound `TcpStream: Clone`으로 막힌다.' },
  ];

  const summary = [
    '#[derive]는 필드 목록을 읽어 손으로 쓸 impl을 컴파일 때 대신 만든다.',
    'Debug는 derive로 {:?}가 열리지만 Display는 derive가 없어 직접 써야 한다.',
    'Copy 타입은 대입해도 원본이 남고, String은 move되어 원래 이름을 못 쓴다.',
    'HashMap 키에는 Eq와 Hash가 필요하고, 필드 하나라도 못 하면 derive도 안 된다.',
  ];
  const review = [
    { q: 'Vec<u8> 필드를 가진 구조체에 #[derive(Clone, Copy)]를 붙이자 E0204가 났다. 바로잡는 방법은?',
      o: ['Copy를 빼고 Clone만 derive해 필요할 때 .clone()을 부른다', 'Clone을 빼고 Copy만 남긴다', 'Vec<u8>을 String으로 바꾼다'], a: 0,
      why: '힙을 소유한 필드가 있으면 비트 복사가 안전하지 않아 Copy를 못 붙인다. Clone은 힙을 새로 할당해 복제한다.' },
    { q: 'assert_eq!(a, b)가 실패했는데 값이 출력되지 않고 컴파일도 안 된다. 먼저 붙일 것은?',
      o: ['Hash', 'Copy', 'Debug와 PartialEq'], a: 2,
      why: 'assert_eq!는 ==를 쓰려고 PartialEq를, 실패 시 값을 찍으려고 Debug를 요구한다. 테스트할 타입에는 둘을 습관처럼 붙인다.' },
    { q: '이름을 대소문자 무시로 비교해야 하는데 derive(PartialEq)로 "Rust"와 "RUST"가 다르게 나온다. 할 일은?',
      o: ['derive(Eq)를 더 붙인다', 'PartialEq를 손으로 impl해 eq_ignore_ascii_case로 비교한다', '두 값을 Hash로 비교한다'], a: 1,
      why: 'derive가 만드는 ==는 필드를 그대로 비교한다. 도메인 규칙이 있으면 eq를 직접 써서 true가 나오게 한다.' },
  ];

  R.page({ title: 'derive가 대신 쓰는 impl', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
