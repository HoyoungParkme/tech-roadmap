/* I-2-1 borrow & reference — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   확인한 값 (rustc 1.100, edition 2021): &String 은 8바이트 / "Alice 의 길이는 5" / r1·r3 는 같은 주소
   push_str("!") 뒤 len 6, cap 5 → 10 / [1, 2, 3] → push(4) 뒤 [1, 2, 3, 4] / "hello! (5)" / into_bytes → [104, 101, 108, 108, 111, 33], 같은 힙 주소
   에러: E0382(& 를 뺌) E0596(mut 없음) E0499(두 번째 &mut) E0502(&mut 중 &) E0106(make_ref) E0515('static 을 붙여도) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal, meters } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 공용 그림 도구 ──────────────────────────────────────────
  function slot(x, y, name, vals, o) {
    o = o || {}; const dead = !!o.dead, col = dead ? OFF : (o.col || INK), cw = o.cw || 58, op = o.op ?? 1;
    const g = R.G(x, y, 1, op);
    tx(-12, 35, name, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', class: 'mono', fill: col, 'text-decoration': dead ? 'line-through' : null }, g);
    vals.forEach(([f, v], i) => { const cx = i * (cw + 4);
      el('rect', { x: cx, y: 10, width: cw, height: 40, rx: 5, fill: dead ? SOFT : (o.fill || PANEL), stroke: col, 'stroke-width': 2, 'stroke-dasharray': dead ? '4 4' : null }, g);
      if (f) tx(cx + cw / 2, 3, f, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }, g);
      if (v === '●') el('circle', { cx: cx + cw / 2, cy: 30, r: 6, fill: dead ? OFF : (o.ptrCol || ACC) }, g);
      else mono(cx + cw / 2, 36, String(v), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: dead ? OFF : (o.valCol || INK) }, g); });
    return { ptr: [x + cw / 2, y + 30], right: x + vals.length * (cw + 4) - 4, mid: [x + (vals.length * (cw + 4) - 4) / 2, y + 30], top: y + 10, bottom: y + 50 };
  }
  // 참조 칸: 주소 하나(8바이트). col 은 &T = INFO, &mut T = WARN
  const ref = (x, y, name, col, o) => slot(x, y, name, [[(o && o.f) || '&', '●']], Object.assign({ cw: 52, col, ptrCol: col }, o || {}));
  function heap(x, y, chars, o) {
    o = o || {}; const w = o.w || 38, gap = 3, shown = o.shown ?? chars.length, fall = o.fall || 0;
    chars.forEach((ch, i) => { const f = clamp(shown - i); if (f <= 0) return;
      const d = clamp(fall * 1.6 - i * 0.12), cx = x + i * (w + gap), yy = y + d * 46, op = f * (1 - d); if (op <= 0.02) return; const st = (o.st && o.st(i)) || {};
      el('rect', { x: cx, y: yy, width: w, height: 40, rx: 4, fill: st.fill || o.fill || ACCBG, stroke: st.stroke || o.stroke || ACC, 'stroke-width': 2, opacity: op });
      mono(cx + w / 2, yy + 26, ch, { 'font-size': o.fs || 16, 'font-weight': 700, 'text-anchor': 'middle', fill: st.color || INK, opacity: op }); });
  }
  function wire(pts, u, col, o) {
    o = o || {}; if (u <= 0) return; const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = L.reduce((a, b) => a + b, 0);
    let d = clamp(u) * tot; const out = [pts[0]];
    for (let i = 0; i < L.length && d > 0; i++) { const f = Math.min(1, d / L[i]); out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]); d -= L[i]; }
    el('polyline', { points: out.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, 'stroke-linejoin': 'round',
      'marker-end': u > 0.98 && !o.plain ? (col === BAD ? 'url(#ra-ahr)' : col === ACC || !col ? 'url(#ra-ahb)' : 'url(#ra-ah)') : null });
  }
  function err(cx, cy, code, lines, s) {
    if (s <= 0.01) return; lines = [].concat(lines); const head = 'error[' + code + ']';
    const w = Math.max(tw(head, 15), ...lines.map((l) => tw(l, 14))) + 34, h = 34 + lines.length * 21, g = R.G(cx, cy, s);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: INK }, g);
    mono(-w / 2 + 16, -h / 2 + 23, head, { 'font-size': 15, 'font-weight': 800, fill: BAD }, g);
    lines.forEach((l, i) => mono(-w / 2 + 16, -h / 2 + 45 + i * 21, l, { 'font-size': 14, fill: PANEL }, g));
  }
  const brace = (x, y, op, col) => mono(x, y, '}', { 'font-size': 54, 'font-weight': 800, fill: col || MUT, opacity: op, 'text-anchor': 'middle' });
  // 코드 줄 목록: rows = [[줄번호, 글, 표시]] — 표시 'bad' 면 빨간 취소. vis = 보이는 줄 수(소수면 마지막 줄이 나타나는 중)
  function code(x, y, rows, vis, lh) { lh = lh || 34;
    rows.forEach(([n, s, m], i) => { const op = clamp(vis - i); if (op <= 0) return; const yy = y + i * lh;
      mono(x, yy, String(n), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op });
      mono(x + 14, yy, s, { 'font-size': 14.5, fill: m === 'bad' ? BAD : INK, opacity: op, 'text-decoration': m === 'bad' ? 'line-through' : null }); }); }
  // 빌림 막대 (세로): 줄 a 부터 줄 b 까지, u 만큼 자란다
  function vbar(x, y0, y1, u, col, name) { if (u <= 0) return; const y = lerp(y0, y1, clamp(u));
    el('rect', { x: x - 7, y: y0 - 12, width: 14, height: Math.max(4, y - y0 + 16), rx: 7, fill: col, opacity: 0.85 });
    if (name) mono(x, y0 - 20, name, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0, 0.3) }); }
  const ALICE = ['A', 'l', 'i', 'c', 'e'];

  // 1. 왜 borrow 가 필요한가
  function s1(t, c) { const { k, u } = c;
    zone(30, 40, 500, 360, '스택'); zone(550, 40, 380, 360, '힙');
    const lenOn = k <= 1 || k === 2 || k === 4, lenOp = k === 1 ? 1 - E(u, 1.0, 1.8) : k === 2 ? fade(u, 0.3) : 1;
    if (lenOn && lenOp > 0.01) zone(45, 65, 470, 130, k === 4 ? 'len(s: String)' : 'len(s: &String)', { fill: PANEL, stroke: k === 4 ? BAD : INFO, sw: 2, op: lenOp });
    zone(45, 215, 470, 170, 'main()', { fill: PANEL, stroke: GRID, sw: 1.5 });
    heap(600, 270, ALICE);
    const moved = k === 4 && u > 1.0;
    const nm = slot(150, 250, 'name', [['ptr', '●'], ['len', 5], ['cap', 5]], { dead: moved });
    if (!moved) wire([[nm.right, nm.ptr[1]], [596, 290]], 1, ACC);
    if (k <= 2 && lenOp > 0.01) { const s = ref(150, 100, 's', INFO, { f: '&String', cw: 80, op: lenOp * (k === 0 ? fade(u, 0.3) : 1) });
      wire([[s.right, s.ptr[1]], [380, s.ptr[1]], [380, 280], [342, 280]], (k === 0 ? seg(u, 0.6, 1.3) : 1) * lenOp, INFO, { dash: '6 4', op: lenOp });
      if (k === 0) { tx(400, 120, '8바이트 주소', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.4) }); pill(740, 150, 's.len() = 5', INFO, pop(u, 1.8), { mono: true }); } }
    if (k === 1) { brace(480, 170, fade(u, 0.2)); tx(270, 150, 's 만 사라지고 drop 은 없다', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      check(560 + 150, 350, 12, pop(u, 1.8)); tx(735, 356, 'Alice 그대로', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); }
    if (k === 2) { pill(340, 365, 'len(&name)', INFO, pop(u, 0.1), { mono: true }); slot(400, 300, 'n', [['usize', 5]], { cw: 70, op: fade(u, 1.5) });
      tx(740, 130, '주소만 넘어간다', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      tx(740, 160, '주인은 그대로 name', { 'font-size': 15, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 1.1) }); }
    if (k === 3) { slot(400, 300, 'n', [['usize', 5]], { cw: 70 }); terminal(560, 80, 360, 92, ['Alice 의 길이는 5'], seg(u, 0.3, 0.9), { title: '출력' });
      check(130, 340, 12, pop(u, 1.2)); tx(150, 346, 'name 은 계속 쓸 수 있다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.3) }); }
    if (k === 4) { fly(430, 280, 430, 130, seg(u, 0.2, 1.0), 'ptr · len · cap', { mono: true });
      if (u > 1.0) { const s = slot(150, 100, 's', [['ptr', '●'], ['len', 5], ['cap', 5]]); wire([[s.right, s.ptr[1]], [560, s.ptr[1]], [600, 266]], seg(u, 1.0, 1.4), ACC); }
      err(310, 340, 'E0382', 'borrow of moved value: `name`', pop(u, 1.6)); }
  }

  // 2. 읽기 전용 빌림 여럿
  function s2(t, c) { const { k, u } = c;
    if (k === 0) {
      R.card(480, 120, 560, 70, { rx: 12, stroke: INK, sw: 2.5, text: 'fn print(prefix: &str, value: &String)', fs: 17, mono: true, s: pop(u, 0.2) });
      [['&str', 330], ['&String', 600]].forEach(([s, x], i) => { pill(x, 220, s, INFO, pop(u, 0.8 + i * 0.3), { mono: true, fs: 16 }); grow(x, 205, x, 160, seg(u, 0.9 + i * 0.3, 1.2 + i * 0.3), INFO); });
      tx(480, 300, '둘 다 빌린 참조 · 읽기만 한다', { 'font-size': 17, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(480, 335, '소유권은 호출한 쪽에 남는다', fade(u, 2.0)); return; }
    zone(30, 40, 560, 360, '스택'); zone(610, 40, 320, 360, '힙');
    heap(650, 250, ALICE, { w: 46 });
    const nm = slot(200, 250, 'name', [['ptr', '●'], ['len', 5], ['cap', 5]]);
    wire([[nm.right, nm.ptr[1]], [646, 270]], 1, ACC);
    const nRef = k === 1 ? 0 : k === 2 ? lerp(0, 3, E(u, 0.2, 1.8)) : 3;
    const R3 = [['r1', 90], ['r2', 250], ['r3', 410]];
    R3.forEach(([n, x], i) => { const f = clamp(nRef - i); if (f <= 0) return; const r = ref(x, 90, n, INFO, { op: f });
      const tx2 = [200, 262, 322][i]; wire([[r.ptr[0], r.bottom], [lerp(r.ptr[0], tx2, 0.5), 200], [tx2, 257]], f, INFO, { dash: '6 4' }); });
    const cnt = Math.round(nRef);
    if (k <= 2) tx(480, 380, '&name 참조 ' + cnt + '개', { 'font-size': 18, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', class: 'mono' });
    if (k === 1) sub(300, 340, '빌려 줄 원본이 먼저 있어야 한다', fade(u, 0.5), { 'font-weight': 700 });
    if (k === 2) { check(560, 375, 12, pop(u, 2.0)); }
    if (k === 3) { R3.forEach(([, x], i) => dot([[x + 26, 140], [lerp(x + 26, [200, 262, 322][i], 0.5), 200], [[200, 262, 322][i], 257], [nm.right, 280], [646, 270]], seg(u, 0.2 + i * 0.4, 1.2 + i * 0.4), INFO, 6));
      terminal(625, 70, 295, 140, ['first: Alice', 'second: Alice', 'third: Alice'], lerp(0, 3, E(u, 0.8, 2.2)), { title: '출력' }); }
    if (k === 4) { pill(110, 360, 'println!', INK, pop(u, 0.1), { mono: true }); dot([[110, 344], [200, 290], [nm.right, 280], [646, 270]], seg(u, 0.3, 1.2), INK, 7);
      terminal(625, 70, 295, 140, ['first: Alice', 'second: Alice', 'third: Alice', '원본: Alice'], lerp(3, 4, seg(u, 1.2, 1.6)), { title: '출력' });
      tx(420, 375, 'r1 과 r3 는 같은 주소', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 5) { el('rect', { x: 40, y: 300, width: 540, height: 95, rx: 10, fill: PANEL, opacity: 0.92 });
      meters(60, 312, 500, [{ name: '읽는 쪽', val: '4 (r1 r2 r3 name)' }, { name: '쓰는 쪽', val: '0', good: true }], { h: 72 });
      tx(770, 380, '바꾸는 쪽이 없으면 경쟁도 없다', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
  }

  // 3. 쓰기 빌림 — 단 하나
  const ROWS3 = [[6, 'let mut name = String::from("Alice");'], [9, 'let r = &mut name;'], [11, 'let r2 = &mut name;', 'bad'], [12, 'let r3 = &name;', 'bad'],
    [14, 'append_excl(r);'], [15, 'println!("{}", r);'], [18, 'let r4 = &name;'], [19, 'println!("…: {}", r4);']];
  const VIS3 = [0, 1, 2, 4, 6, 8];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) {
      R.card(480, 90, 520, 64, { rx: 12, stroke: WARN, sw: 2.5, text: 'fn append_excl(s: &mut String)', fs: 17, mono: true, s: pop(u, 0.2) });
      pill(480, 165, '&mut = 고쳐도 된다', WARN, pop(u, 0.7), { fs: 15 });
      heap(330, 240, ALICE.concat(['!']), { w: 46, shown: lerp(5, 6, E(u, 1.3, 1.8)), st: (i) => i === 5 ? { fill: WARNBG, stroke: WARN, color: WARN } : {} });
      mono(480, 320, 's.push_str("!")', { 'font-size': 16, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.1) });
      sub(480, 360, '시그니처만 봐도 값을 바꾸는 함수임을 안다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    const vis = lerp(VIS3[k - 1], VIS3[k], E(u, 0.1, 0.8));
    code(70, 70, ROWS3, vis, 40);
    const Y = (i) => 70 + i * 40 - 5;
    // 오른쪽: name 의 힙
    zone(640, 40, 290, 100, 'name 의 힙');
    const bang = k === 4 ? E(u, 1.0, 1.5) : k === 5 ? 1 : 0;
    heap(660, 80, ALICE.concat(bang > 0 ? ['!'] : []), { w: 38, shown: 5 + bang, st: (i) => i === 5 ? { fill: WARNBG, stroke: WARN } : {} });
    if (k === 1) { pill(134, Y(0) - 30, 'mut', WARN, pop(u, 0.8), { mono: true, fs: 15 });
      err(785, 220, 'E0596', ['mut 를 빼면:', 'cannot borrow `name` as mutable,', 'as it is not declared as mutable'], pop(u, 1.4)); }
    // r 의 빌림 막대
    const rEnd = k <= 3 ? Y(Math.min(5, 1 + (k - 1))) : Y(5);
    if (k >= 2) vbar(560, Y(1), k === 2 ? Y(1) + 1 : k === 3 ? Y(3) : Y(5), k === 2 ? E(u, 0.6, 1.0) : k === 4 ? 1 : 1, WARN, 'r');
    if (k === 2) { lock(660, 200, true, WARN, pop(u, 1.3)); tx(685, 206, 'name 으로 가는 길은 r 하나', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) }); }
    if (k === 3) { cross(520, Y(2) - 4, 9, pop(u, 0.6)); cross(520, Y(3) - 4, 9, pop(u, 0.9));
      err(785, 200, 'E0499', ['cannot borrow `name` as mutable', 'more than once at a time'], pop(u, 1.1));
      err(785, 310, 'E0502', ['cannot borrow `name` as immutable', 'because it is also borrowed', 'as mutable'], pop(u, 1.6)); }
    if (k === 4) { mono(785, 160, 'len 5 → 6 · cap 5 → 10', { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.5) });
      terminal(640, 300, 290, 70, ['Alice!'], seg(u, 1.8, 2.2), { title: '출력' }); }
    if (k === 5) { vbar(610, Y(6), Y(7), E(u, 0.8, 1.4), INFO, 'r4');
      el('rect', { x: 540, y: Y(5) + 12, width: 90, height: Y(6) - Y(5) - 26, rx: 6, fill: GOODBG, opacity: fade(u, 1.5) });
      tx(640, 226, '겹치지 않는다', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      tx(640, 252, 'r 은 마지막 사용(15줄)에서 끝', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      terminal(640, 300, 290, 92, ['Alice!', '이제 또 빌릴 수 있다: Alice!'], lerp(1, 2, seg(u, 1.4, 2.0)), { title: '출력', fs: 13.5 }); }
  }

  // 4. 규칙 두 줄
  const ROWS4 = [[9, 'let r1 = &v;'], [10, 'let r2 = &v;'], [11, 'println!("{:?} {:?}", r1, r2);'], [14, 'let m = &mut v;'], [15, 'm.push(4);'], [16, 'println!("{:?}", m);']];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) {
      tx(480, 60, '같은 시점에 고를 수 있는 것은 하나', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      const sw = E(u, 1.2, 1.8), left = sw < 0.5;
      R.card(250, 190, 300, 150, { rx: 14, stroke: INFO, sw: left ? 3.5 : 1.5, fill: left ? INFOBG : PANEL });
      tx(250, 150, '&T 여럿', { 'font-size': 20, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', class: 'mono' }); tx(250, 180, '모두 읽기만', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT });
      [-60, 0, 60].forEach((d, i) => ref(250 + d - 26, 196, '', INFO, { op: pop(u, 0.2 + i * 0.15) }));
      R.card(710, 190, 300, 150, { rx: 14, stroke: WARN, sw: left ? 1.5 : 3.5, fill: left ? PANEL : WARNBG });
      tx(710, 150, '&mut 하나', { 'font-size': 20, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', class: 'mono' }); tx(710, 180, '혼자 고친다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT });
      ref(684, 196, '', WARN, { op: pop(u, 0.6) });
      lbl(480, 198, 'XOR', 1, { 'font-size': 20, fill: MUT });
      el('circle', { cx: lerp(250, 710, sw), cy: 310, r: 14, fill: left ? INFO : WARN }); el('line', { x1: 250, y1: 310, x2: 710, y2: 310, stroke: GRID, 'stroke-width': 4 });
      el('circle', { cx: lerp(250, 710, sw), cy: 310, r: 14, fill: left ? INFO : WARN });
      tx(480, 370, '둘이 함께 사는 구간은 없다', { 'font-size': 16, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k >= 4) { // 규칙 2: dangling
      zone(30, 40, 470, 360, 'make_ref() 의 칸', { stroke: k === 5 ? INK : WARN, sw: 2 }); zone(530, 40, 400, 170, '힙');
      const fall = k === 5 ? E(u, 0.3, 1.4) : 0;
      heap(600, 110, ['o', 'u', 'c', 'h'], { fall });
      const s = slot(150, 100, 's', [['ptr', '●'], ['len', 4], ['cap', 4]], { dead: k === 5 && u > 1.0 });
      if (!(k === 5 && u > 0.4)) wire([[s.right, s.ptr[1]], [596, 130]], 1, ACC);
      mono(265, 230, 'fn make_ref() -> &String', { 'font-size': 15, 'text-anchor': 'middle', fill: INK });
      fly(250, 260, 620, 300, k === 4 ? seg(u, 0.3, 1.2) : 0, '&s', { mono: true, fill: INFO });
      if (k === 4) err(720, 310, 'E0106', ['missing lifetime specifier', 'return type contains a borrowed', 'value, but there is no value', 'for it to be borrowed from'], pop(u, 1.3));
      if (k === 5) { brace(470, 390, fade(u, 0.1), INK); wire([[260, 300], [560, 300], [640, 160]], seg(u, 1.2, 1.7), BAD, { dash: '6 4' }); cross(640, 180, 13, pop(u, 1.7));
        tx(265, 340, '가리킬 값이 이미 없다', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        err(740, 320, 'E0515', ["-> &'static String 으로 바꿔도:", 'cannot return reference to', 'local variable `s`'], pop(u, 2.0)); }
      return; }
    // k 1~3: v 와 빌림 막대
    zone(530, 40, 400, 360, 'v (Vec<i32>)');
    const four = k === 3 ? E(u, 1.2, 1.6) : 0;
    R.cells(560, 90, [1, 2, 3].concat(four > 0 ? [4] : []), { w: 56, h: 46, style: (i) => i === 3 ? { stroke: WARN, fill: WARNBG, op: four } : { stroke: ACC, fill: ACCBG } });
    mono(560, 170, k === 3 && u > 1.6 ? 'len 4 · cap 6' : 'len 3 · cap 3', { 'font-size': 14.5, fill: MUT });
    if (k === 1) { mono(270, 120, 'let mut v = vec![1, 2, 3];', { 'font-size': 16, 'text-anchor': 'middle' });
      tx(270, 200, '참조 0개', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.8) });
      sub(270, 240, '지금은 주인이 무엇이든 할 수 있다', fade(u, 1.2), { 'font-weight': 700 }); return; }
    code(80, 90, ROWS4, k === 2 ? lerp(0, 3, E(u, 0.1, 0.9)) : lerp(3, 6, E(u, 0.1, 0.9)), 44);
    const Y = (i) => 90 + i * 44 - 5;
    vbar(440, Y(0), Y(2), k === 2 ? E(u, 0.4, 1.2) : 1, INFO, 'r1'); vbar(480, Y(1), Y(2), k === 2 ? E(u, 0.7, 1.3) : 1, INFO, 'r2');
    if (k === 2) terminal(550, 230, 360, 70, ['[1, 2, 3] [1, 2, 3]'], seg(u, 1.4, 1.9), { title: '출력' });
    if (k === 3) { vbar(460, Y(3), Y(5), E(u, 0.6, 1.4), WARN, 'm');
      terminal(550, 230, 360, 70, ['[1, 2, 3, 4]'], seg(u, 1.6, 2.0), { title: '출력' });
      tx(730, 340, 'r1 을 m 뒤에 쓰면 E0502', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }
  }

  // 5. 시그니처가 곧 명세
  const KINDS = [['&self', '본다', INFO, 'len()'], ['&mut self', '고친다', WARN, 'push()'], ['self', '가져간다', BAD, 'into_bytes()']];
  function s5(t, c) { const { k, u } = c;
    if (k === 0 || k === 5) {
      KINDS.forEach(([s, v, col, m], i) => { const y = 100 + i * 100, sc = pop(u, 0.2 + i * 0.35);
        R.card(250, y, 260, 70, { rx: 12, stroke: col, sw: 2.5, s: sc });
        mono(150, y + 7, s, { 'font-size': 19, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.35) });
        tx(350, y + 7, v, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.35) });
        grow(400, y, 520, y, seg(u, 0.6 + i * 0.35, 0.9 + i * 0.35), col);
        mono(540, y + 6, m, { 'font-size': 17, fill: INK, opacity: fade(u, 0.8 + i * 0.35) });
        if (k === 5) tx(720, y + 6, ['원본 그대로', '바뀐 채로 계속', '더는 못 쓴다'][i], { 'font-size': 16, 'font-weight': 700, fill: col, opacity: fade(u, 1.2 + i * 0.3) }); });
      if (k === 5) tx(720, 50, '호출 뒤 text', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.0) });
      return; }
    zone(30, 40, 470, 360, '스택'); zone(520, 40, 410, 360, '힙');
    const bang = k >= 3 ? (k === 3 ? E(u, 0.8, 1.3) : 1) : 0, asNum = k === 4 ? E(u, 1.0, 1.6) : 0;
    const chars = ['h', 'e', 'l', 'l', 'o', '!'], nums = [104, 101, 108, 108, 111, 33];
    heap(540, 150, (asNum > 0.5 ? nums : chars).slice(0, bang > 0 ? 6 : 5).map(String), { w: 60, fs: asNum > 0.5 ? 15 : 16, shown: 5 + bang,
      st: (i) => i === 5 ? { fill: WARNBG, stroke: WARN } : {} });
    const len = k >= 3 && bang > 0.5 ? 6 : 5, cap = k >= 3 && bang > 0.5 ? 10 : 5, tDead = k === 4 && u > 0.9;
    const tt = slot(150, 120, 'text', [['ptr', '●'], ['len', len], ['cap', cap]], { dead: tDead });
    if (!tDead) wire([[tt.right, tt.ptr[1]], [536, 170]], 1, ACC);
    if (k === 1) { pill(250, 90, 'let mut', WARN, pop(u, 0.5), { mono: true }); sub(265, 220, '뒤에서 고칠 값이라 mut', fade(u, 1.0), { 'font-weight': 700 }); }
    if (k >= 2) { const n = slot(150, 230, 'n', [['usize', 5]], { cw: 70, op: k === 2 ? fade(u, 1.0) : 1 });
      if (k === 2) { pill(380, 260, 'text.len()', INFO, pop(u, 0.2), { mono: true }); wire([[380, 244], [300, 180]], seg(u, 0.4, 0.9), INFO, { dash: '5 4' }); } }
    if (k === 3) { pill(380, 260, "text.push('!')", WARN, pop(u, 0.2), { mono: true }); wire([[380, 244], [300, 180]], seg(u, 0.4, 0.8), WARN);
      terminal(540, 240, 370, 70, ['hello! (5)'], seg(u, 1.6, 2.0), { title: '출력' });
      tx(150, 330, 'n 은 옛 길이 5 그대로', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 4) { fly(240, 150, 240, 300, seg(u, 0.2, 0.9), 'ptr · len · cap', { mono: true });
      if (u > 0.9) { const b = slot(150, 300, 'bytes', [['ptr', '●'], ['len', 6], ['cap', 10]]); wire([[b.right, b.ptr[1]], [520, b.ptr[1]], [536, 180]], seg(u, 0.9, 1.3), ACC); }
      tx(725, 240, 'Vec<u8> 로 같은 힙을 넘겨받음', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(725, 270, 'text 는 이후 사용 불가 (E0382)', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
  }

  const quiz = [
    { q: 'len(&name)을 부른 뒤에도 name을 쓸 수 있는 이유는 무엇인가?',
      o: ['len이 name의 복사본을 받아서', 'len이 주소만 빌리고 주인은 그대로 name이라서', 'len이 끝날 때 name을 다시 돌려줘서'], a: 1,
      why: '& 는 8바이트 주소만 넘긴다. 함수 안의 s는 주인이 아니어서 함수가 끝나도 drop하지 않는다.' },
    { q: 'r1, r2, r3 = &name 세 개가 동시에 있어도 컴파일이 되는 이유는 무엇인가?',
      o: ['모두 읽기만 해서 값을 바꾸는 쪽이 없기 때문이다', '컴파일러가 세 참조를 하나로 합치기 때문이다', '참조는 세 개까지만 허용되기 때문이다'], a: 0,
      why: '읽는 쪽이 넷이어도 쓰는 쪽이 0이면 경쟁이 없다. &T는 개수 제한이 없다.' },
    { q: 'let r = &mut name; 뒤 r을 아직 쓰는데 let r3 = &name; 을 넣으면 나오는 에러는 무엇인가?',
      o: ['E0499', 'E0596', 'E0502'], a: 2,
      why: 'E0502는 가변 빌림이 살아 있는 동안 불변 빌림을 만들 때 난다. 두 번째 &mut이면 E0499, mut가 빠지면 E0596이다.' },
    { q: 'r1, r2를 다 쓴 뒤 let m = &mut v; 가 허용되는 이유는 무엇인가?',
      o: ['m이 r1, r2보다 늦게 선언돼서 우선권이 있어서', 'r1, r2의 빌림이 마지막 사용에서 끝나 시점이 겹치지 않아서', 'Vec은 빌림 규칙의 예외라서'], a: 1,
      why: 'NLL 덕분에 빌림은 마지막 사용에서 끝난다. 막히는 것은 동시뿐이라 순서대로면 [1, 2, 3, 4]까지 문제없이 간다.' },
    { q: 'text.into_bytes()를 부른 뒤 text는 어떻게 되는가?',
      o: ['소유권이 bytes로 넘어가 더는 쓸 수 없다', '빈 문자열로 남는다', '"hello!"를 그대로 읽을 수 있다'], a: 0,
      why: 'into_bytes는 self를 받는다. 같은 힙을 Vec<u8> [104, 101, 108, 108, 111, 33]으로 넘기고 text는 move된다.' },
  ];

  const summary = [
    '&로 넘기면 8바이트 주소만 간다. 주인은 그대로라 호출 뒤에도 원본을 쓸 수 있다.',
    '&T는 몇 개든 함께 살 수 있다. 읽는 쪽만 있으면 경쟁이 생기지 않는다.',
    '&mut는 한 번에 하나뿐이고, 그동안 다른 참조는 E0499, E0502로 막힌다.',
    '빌림은 마지막 사용에서 끝나고, 함수 안 값의 참조를 돌려주려 하면 빌드가 멈춘다.',
  ];
  const review = [
    { q: '설정 Vec을 순회하며 읽는 동안 같은 Vec에 push하는 코드를 넣었더니 빌드가 멈췄다. 맞는 설명은 무엇인가?',
      o: ['순회용 불변 참조가 살아 있는 동안 가변 빌림을 만들어서', 'Vec은 push를 한 번만 허용해서', 'push가 self를 받아 Vec을 가져가서'], a: 0,
      why: '읽는 참조와 고치는 참조는 같은 시점에 공존할 수 없다. 순회를 끝낸 뒤 push하거나 따로 모아 두었다가 넣는다.' },
    { q: '함수 fn report(v: Vec<i32>)를 부른 뒤 v를 다시 써야 한다. 이 함수는 출력만 한다. 시그니처를 어떻게 바꾸는 것이 맞는가?',
      o: ['fn report(v: &mut Vec<i32>)', 'fn report(v: &Vec<i32>)', 'fn report(v: Vec<i32>) -> Vec<i32>'], a: 1,
      why: '보기만 하면 &T가 맞다. &mut는 고칠 때, 값을 받고 돌려주는 방식은 앞 장의 번거로운 방법이다.' },
    { q: '도우미 함수에서 지역 String을 만들고 &String을 돌려주려 했더니 E0106이 났다. 가장 알맞은 고침은 무엇인가?',
      o: ["반환 타입을 &'static String으로 바꾼다", 'String을 그대로 반환해 소유권을 넘긴다', '함수 안에서 참조를 두 번 만든다'], a: 1,
      why: '지역 값은 함수 끝에서 drop되어 참조할 대상이 없다. \'static을 붙여도 E0515가 나므로 값 자체를 돌려준다.' },
  ];

  R.page({ title: '빌림 화살표와 빌림 구간', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
