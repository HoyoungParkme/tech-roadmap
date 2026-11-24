/* I-1-2 ownership — 값의 단 한 주인 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림 속 출력·에러 문구는 rustc 1.100 (edition 2021)으로 이 페이지 코드를 돌려 확인한 값이다.
   String::from("hello") → len 5, cap 5 / String 칸 24바이트 / i32 4바이트 / (i32, bool) 8바이트 / move·반환 뒤에도 힙 주소는 같다 / clone 은 다른 주소 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // ── 공용 그림 도구 ──────────────────────────────────────────
  // 스택 칸: 이름 + 값 칸들. vals = [[필드, 값]], 값 '●' 은 포인터 점. o.dead 면 회색 점선·취소선
  function slot(x, y, name, vals, o) {
    o = o || {}; const dead = !!o.dead, col = dead ? OFF : (o.col || INK), cw = o.cw || 58, op = o.op ?? 1;
    const g = R.G(x, y, 1, op);
    tx(-12, 35, name, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', class: 'mono', fill: col, 'text-decoration': dead ? 'line-through' : null }, g);
    vals.forEach(([f, v], i) => { const cx = i * (cw + 4);
      el('rect', { x: cx, y: 10, width: cw, height: 40, rx: 5, fill: dead ? SOFT : (o.fill || PANEL), stroke: col, 'stroke-width': 2, 'stroke-dasharray': dead ? '4 4' : null }, g);
      if (f) tx(cx + cw / 2, 3, f, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }, g);
      if (v === '●') el('circle', { cx: cx + cw / 2, cy: 30, r: 6, fill: dead ? OFF : (o.ptrCol || ACC) }, g);
      else mono(cx + cw / 2, 36, String(v), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: dead ? OFF : INK }, g); });
    return { ptr: [x + cw / 2, y + 30], right: x + vals.length * (cw + 4) - 4, bottom: y + 50 };
  }
  // 힙 바이트 칸: shown 개수만큼 채워짐, fall(0→1) 이면 칸이 아래로 떨어지며 사라진다(drop)
  function heap(x, y, chars, o) {
    o = o || {}; const w = o.w || 38, gap = 3, shown = o.shown ?? chars.length, fall = o.fall || 0;
    chars.forEach((ch, i) => { const f = clamp(shown - i); if (f <= 0) return;
      const d = clamp(fall * 1.6 - i * 0.12), cx = x + i * (w + gap), yy = y + d * 46, op = f * (1 - d); if (op <= 0.02) return;
      el('rect', { x: cx, y: yy, width: w, height: 40, rx: 4, fill: o.fill || ACCBG, stroke: o.stroke || ACC, 'stroke-width': 2, opacity: op });
      mono(cx + w / 2, yy + 26, ch, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: o.color || INK, opacity: op }); });
    return { x, y, w: chars.length * (w + gap) - gap };
  }
  // 꺾인 선이 u 만큼 자란다. 끝에 화살촉
  function wire(pts, u, col, o) {
    o = o || {}; if (u <= 0) return; const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = L.reduce((a, b) => a + b, 0);
    let d = clamp(u) * tot; const out = [pts[0]];
    for (let i = 0; i < L.length && d > 0; i++) { const f = Math.min(1, d / L[i]); out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]); d -= L[i]; }
    el('polyline', { points: out.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, 'stroke-linejoin': 'round',
      'marker-end': u > 0.98 && !o.plain ? (col === BAD ? 'url(#ra-ahr)' : col === ACC || !col ? 'url(#ra-ahb)' : 'url(#ra-ah)') : null });
  }
  // rustc 에러 카드 (실제 출력 문구)
  function err(cx, cy, code, lines, s) {
    if (s <= 0.01) return; lines = [].concat(lines); const head = 'error[' + code + ']';
    const w = Math.max(tw(head, 15), ...lines.map((l) => tw(l, 14))) + 34, h = 34 + lines.length * 21, g = R.G(cx, cy, s);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: INK }, g);
    mono(-w / 2 + 16, -h / 2 + 23, head, { 'font-size': 15, 'font-weight': 800, fill: BAD }, g);
    lines.forEach((l, i) => mono(-w / 2 + 16, -h / 2 + 45 + i * 21, l, { 'font-size': 14, fill: PANEL }, g));
  }
  // 수명 막대 (가로): x0 → x1 을 u 만큼
  function bar(x0, x1, y, u, col, name, o) {
    o = o || {}; if (u <= 0) return; const x = lerp(x0, x1, clamp(u));
    el('rect', { x: x0, y: y - 9, width: Math.max(2, x - x0), height: 18, rx: 9, fill: col, opacity: o.op ?? 0.85 });
    if (name) tx(x0 - 12, y + 5, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: o.color || INK });
  }
  const brace = (x, y, op, col) => mono(x, y, '}', { 'font-size': 54, 'font-weight': 800, fill: col || MUT, opacity: op, 'text-anchor': 'middle' });
  const H5 = ['h', 'e', 'l', 'l', 'o'];
  const zones = (l, r) => { zone(30, 40, 420, 360, l || '스택 (main)'); zone(480, 40, 450, 360, r || '힙'); };

  // 1. 모든 값에는 단 한 명의 주인
  function s1(t, c) { const { k, u } = c;
    if (k === 3) { // 수명 막대 비교: C 는 포인터와 메모리 수명이 따로 논다, Rust 는 같다
      lbl(80, 66, 'C', 1, { 'font-size': 18, 'text-anchor': 'start' }); sub(110, 66, '해제를 사람이 부른다', 1, { 'text-anchor': 'start' });
      bar(260, 560, 108, E(u, 0.2, 0.9), INFO, 'buf'); bar(260, 820, 140, E(u, 0.3, 1.2), BAD, '힙 64B');
      tx(834, 146, '누수', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.1) });
      bar(260, 820, 186, E(u, 0.5, 1.4), INFO, 'buf'); bar(260, 520, 218, E(u, 0.6, 1.2), BAD, '힙 64B');
      tx(536, 224, '해제 뒤에도 사용', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) });
      el('line', { x1: 40, y1: 252, x2: 920, y2: 252, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5' });
      lbl(80, 290, 'Rust', 1, { 'font-size': 18, 'text-anchor': 'start' }); sub(130, 290, '주인의 수명 = 값의 수명', 1, { 'text-anchor': 'start' });
      bar(260, 660, 330, E(u, 1.4, 2.2), ACC, 's'); bar(260, 660, 362, E(u, 1.4, 2.2), GOOD, '"hello"');
      brace(690, 366, fade(u, 2.1), INK); mono(720, 352, 'drop 1번', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    zones();
    mono(240, 86, 'let s = String::from("hello");', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle' });
    const dead = k === 2 && u > 1.9, sOp = k === 2 ? 1 - 0.65 * E(u, 1.8, 2.4) : 1;
    const sl = slot(150, 150, 's', [['ptr', '●'], ['len', 5], ['cap', 5]], { op: k === 0 ? fade(u, 0.2, 0.3) : sOp, dead });
    const fill = k === 0 ? lerp(0, 5, E(u, 0.5, 1.5)) : 5, fall = k === 2 ? E(u, 0.9, 2.1) : 0;
    heap(560, 160, H5, { shown: fill, fall });
    if (!(k === 2 && u > 1.0)) wire([sl.ptr, [sl.ptr[0], 245], [520, 245], [556, 182]], k === 0 ? seg(u, 1.4, 2.0) : 1, ACC);
    if (k === 0) pill(240, 120, '유일한 주인', ACC, pop(u, 2.0), { fs: 15 });
    sub(665, 230, 'len 5 · cap 5 (바이트)', k === 0 ? fade(u, 1.6) : k === 2 ? 1 - fade(u, 1.0) : 1);
    if (k === 1) { pill(110, 320, 'println!', INFO, pop(u, 0.1), { mono: true });
      dot([[110, 304], [sl.ptr[0], sl.ptr[1] + 20], [sl.ptr[0], 245], [520, 245], [556, 182]], seg(u, 0.4, 1.6), INFO, 7);
      terminal(560, 280, 340, 92, ['hello'], seg(u, 1.6, 2.0), { title: '출력' });
      tx(250, 330, '통로는 s 하나뿐', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) }); }
    if (k === 2) { brace(410, 190, fade(u, 0.1)); fly(400, 120, 250, 120, seg(u, 0.3, 1.0), 'drop(s)', { mono: true, fill: WARN });
      tx(665, 300, '힙 5바이트 해제', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8), 'text-anchor': 'middle' });
      sub(240, 300, 's 는 여기서 끝', fade(u, 2.0), { 'font-weight': 700 }); }
  }

  // 2. move — 주인이 바뀐다
  function s2(t, c) { const { k, u } = c;
    if (k === 5) { // 함수 인자도 move
      zone(30, 40, 420, 360, '스택 (main)'); zone(480, 40, 450, 210, 'take(v) 의 칸', { stroke: WARN, sw: 2 }); zone(480, 270, 450, 130, '힙');
      const moved = E(u, 0.3, 1.3);
      slot(150, 170, 't', [['ptr', '●'], ['len', 5], ['cap', 5]], { dead: u > 1.1 });
      if (moved > 0 && moved < 1) fly(250, 240, 720, 200, moved, 'ptr · len · cap', { mono: true, fill: ACC });
      const v = slot(620, 110, 'v', [['ptr', '●'], ['len', 5], ['cap', 5]], { op: fade(u, 1.2, 0.3) });
      heap(580, 320, H5);
      wire([v.ptr, [v.ptr[0], 300], [600, 318]], seg(u, 1.4, 1.9), ACC);
      mono(240, 96, 'take(t);', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle' });
      err(240, 320, 'E0382', 'borrow of moved value: `t`', pop(u, 2.0)); return; }
    zones();
    const sDead = (k === 1 && u > 1.6) || k >= 2;
    const sl = slot(150, 110, 's', [['ptr', '●'], ['len', 5], ['cap', 5]], { op: k === 0 ? fade(u, 0.2, 0.3) : 1, dead: sDead && k !== 4, col: k === 4 ? BAD : null, ptrCol: k === 4 ? BAD : null });
    heap(560, 150, H5, { shown: k === 0 ? lerp(0, 5, E(u, 0.4, 1.2)) : 5, fall: k === 4 ? E(u, 1.8, 2.6) * 0.6 : 0 });
    const toHeap = (p, yy) => [p, [p[0], yy], [520, yy], [556, 172]];
    if (!sDead || k === 4) wire(toHeap(sl.ptr, 85 + 85), k === 0 ? seg(u, 1.2, 1.8) : k === 1 ? 1 - seg(u, 1.4, 1.7) : 1, k === 4 ? BAD : ACC, { dash: k === 4 ? '6 5' : null });
    const tOn = k >= 2 || (k === 1 && u > 1.2);
    if (k === 1) fly(250, 188, 250, 228, seg(u, 0.2, 1.2), 'ptr · len · cap (24바이트)', { mono: true, fill: ACC });
    if (tOn || k >= 2) { const tl = slot(150, 240, 't', [['ptr', '●'], ['len', 5], ['cap', 5]], { op: k === 1 ? fade(u, 1.2, 0.3) : 1 });
      wire(toHeap(tl.ptr, 320), k === 1 ? seg(u, 1.3, 1.9) : 1, ACC); }
    if (k === 1) { sub(665, 230, '힙 주소 그대로 · 복사 0바이트', fade(u, 1.9), { 'font-weight': 700, fill: INK }); mono(240, 386, 'let t = s;', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.1) }); }
    if (k === 2) { err(690, 300, 'E0382', ['borrow of moved value: `s`', 'let t = s;  - value moved here', 'println!("{}", s);', '               ^ value borrowed here after move'], pop(u, 0.4)); }
    if (k === 3) { dot([[179, 270], [179, 320], [520, 320], [556, 172]], seg(u, 0.2, 1.2), INFO, 7);
      terminal(560, 260, 340, 92, ['hello'], seg(u, 1.2, 1.6), { title: '출력' }); check(420, 286, 12, pop(u, 1.6)); }
    if (k === 4) { brace(410, 380, fade(u, 0.2), INK);
      tx(560, 250, '둘 다 주인이라면 drop 2번', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4) });
      fly(400, 360, 640, 210, seg(u, 0.6, 1.3), 'drop(t)', { mono: true, fill: WARN });
      fly(400, 360, 720, 210, seg(u, 1.2, 1.9), 'drop(s)', { mono: true, fill: BAD });
      cross(760, 300, 16, pop(u, 1.9)); tx(790, 306, 'double-free', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9), class: 'mono' });
      tx(560, 370, 'Rust 는 s 를 무효로 만들어 drop 을 1번만 넣는다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) }); }
  }

  // 3. Copy 타입
  function s3(t, c) { const { k, u } = c;
    zones('스택', '힙');
    if (k <= 1) {
      mono(240, 86, 'let y = x;', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle' });
      slot(190, 120, 'x: i32', [['4바이트', 5]], { cw: 80, op: k === 0 ? fade(u, 0.1, 0.3) : 1 });
      if (k === 0) fly(230, 192, 230, 228, seg(u, 0.5, 1.4), '5', { mono: true, fill: INFO });
      if (k === 1 || u > 1.4) slot(190, 240, 'y', [['4바이트', 5]], { cw: 80 });
      sub(705, 210, '힙은 쓰지 않는다', 1);
      if (k === 0) sub(240, 350, '주인을 옮기지 않고 4바이트를 그대로 복제', fade(u, 1.6), { 'font-weight': 700, fill: INK });
      if (k === 1) { terminal(540, 250, 340, 92, ['5 5'], seg(u, 0.3, 0.8), { title: '출력' }); check(320, 150, 11, pop(u, 0.9)); check(320, 270, 11, pop(u, 1.1));
        tx(240, 360, 'E0382 없음', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4), 'text-anchor': 'middle' }); }
      return; }
    if (k === 2) {
      mono(240, 86, 'let copy = pair;', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle' });
      slot(160, 120, 'pair', [['i32', 10], ['bool', 'true']], { cw: 70 });
      fly(230, 192, 230, 228, seg(u, 0.3, 1.2), '(10, true)', { mono: true, fill: INFO });
      if (u > 1.2) slot(160, 240, 'copy', [['i32', 10], ['bool', 'true']], { cw: 70 });
      sub(240, 340, '튜플 전체 8바이트 · 구성원이 모두 Copy', fade(u, 1.4), { 'font-weight': 700, fill: INK });
      terminal(540, 250, 360, 92, ['(10, true) (10, true)'], seg(u, 1.8, 2.3), { title: '출력' }); return; }
    // k 3, 4: String
    mono(240, 86, k === 3 ? '만약 String 을 칸만 복사하면?' : 'let s2 = s1.clone();', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle' });
    const a = slot(150, 120, 's1', [['ptr', '●'], ['len', 2], ['cap', 2]]);
    heap(600, 140, ['h', 'i']);
    wire([a.ptr, [a.ptr[0], 190], [560, 190], [598, 168]], 1, ACC);
    if (k === 3) { const b = slot(150, 240, '?', [['ptr', '●'], ['len', 2], ['cap', 2]], { op: fade(u, 0.3, 0.4), col: BAD, ptrCol: BAD });
      wire([b.ptr, [b.ptr[0], 310], [580, 310], [620, 184]], seg(u, 0.7, 1.4), BAD, { dash: '6 5' });
      tx(700, 260, '같은 힙을 주인 둘이 가리킨다', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4), 'text-anchor': 'middle' });
      tx(700, 290, '끝에서 drop 2번', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7), 'text-anchor': 'middle' });
      pill(700, 350, 'String 은 Copy 가 아니다 → 기본은 move', INK, pop(u, 2.1), { fs: 14 }); return; }
    const b = slot(150, 240, 's2', [['ptr', '●'], ['len', 2], ['cap', 2]], { op: fade(u, 0.2, 0.3) });
    heap(600, 270, ['h', 'i'], { shown: lerp(0, 2, E(u, 0.6, 1.3)), fill: GOODBG, stroke: GOOD });
    wire([b.ptr, [b.ptr[0], 320], [560, 320], [598, 300]], seg(u, 1.3, 1.8), GOOD);
    sub(690, 240, '새 힙 자리 (다른 주소)', fade(u, 1.3), { 'font-weight': 700, fill: GOOD, 'text-anchor': 'start' });
    terminal(560, 336, 340, 64, ['hi hi'], seg(u, 2.0, 2.3)); }

  // 4. drop — scope 끝 = 자동 해제
  function s4(t, c) { const { k, u } = c;
    const out = ['start', 'inner', ['  (drop: "inner" 해제)', OFF], 'after inner'];
    if (k <= 2) {
      zone(30, 40, 520, 360, 'main', { fill: SOFT, stroke: k === 2 ? INK : 'none' });
      const bh = k === 0 ? 190 * E(u, 0.2, 0.9) : k === 1 ? 190 * (1 - E(u, 0.3, 1.4)) : 0;
      if (bh > 2) { el('rect', { x: 60, y: 90, width: 460, height: bh, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
        if (bh > 40) tx(76, 114, '{ 안쪽 블록 }', { 'font-size': 14, 'font-weight': 700, fill: ACC }); }
      if (bh > 120) { const sl = slot(180, 140, 's', [['ptr', '●'], ['len', 5], ['cap', 5]], { op: k === 0 ? fade(u, 0.8, 0.3) : 1 });
        wire([[sl.right, sl.ptr[1]], [560, sl.ptr[1]], [596, 160]], k === 0 ? seg(u, 1.1, 1.5) : 1, ACC); }
      zone(570, 40, 360, 160, '힙');
      heap(600, 140, ['i', 'n', 'n', 'e', 'r'], { shown: k === 0 ? lerp(0, 5, E(u, 1.0, 1.6)) : 5, fall: k === 1 ? E(u, 0.5, 1.6) : k === 2 ? 1 : 0, w: 34 });
      const shown = k === 0 ? lerp(0, 2, E(u, 0.3, 1.8)) : k === 1 ? lerp(2, 3, E(u, 1.2, 1.6)) : lerp(3, 4, E(u, 0.2, 0.6));
      terminal(570, 210, 360, 180, out, shown, { title: '출력' });
      if (k === 1) { brace(290, 330, fade(u, 0.1), ACC); tx(310, 322, '← drop(s) 삽입', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) }); }
      if (k === 2) { tx(290, 160, '안쪽 블록의 s 는 이미 해제됐다', { 'font-size': 16, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
        tx(290, 200, '바깥 main 은 계속 실행된다', { 'font-size': 15, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
        pill(150, 330, '① 안쪽 } 에서 s', ACC, pop(u, 0.8), { fs: 14 }); pill(390, 330, '② main } 에서 나머지', INK, pop(u, 1.4), { fs: 14 });
        brace(500, 390, fade(u, 1.2), INK); }
      return; }
    // k 3, 4: 파일 핸들
    zone(30, 40, 470, 360, 'read_file()', { stroke: k === 4 ? INK : 'none' });
    mono(265, 86, 'let f = File::open("data.txt")…;', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle' });
    const closed = k === 4 ? E(u, 0.8, 1.6) : 0;
    const sl = slot(140, 130, 'f', [['File', 'fd']], { cw: 90, op: k === 3 ? fade(u, 0.2, 0.3) : 1 - closed * 0.6, dead: k === 4 && u > 1.6 });
    // 디스크 위 파일
    const fx = 760, fy = 170, g = R.G(fx, fy, k === 3 ? pop(u, 0.5) : 1);
    el('path', { d: 'M-40,-52 H18 L40,-30 V52 H-40 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.5 }, g); el('path', { d: 'M18,-52 V-30 H40', fill: 'none', stroke: INK, 'stroke-width': 2 }, g);
    [-12, 4, 20].forEach((yy) => el('line', { x1: -26, y1: yy, x2: 26, y2: yy, stroke: OFF, 'stroke-width': 3, 'stroke-linecap': 'round' }, g));
    tx(0, 78, 'data.txt', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono' }, g);
    const wireU = k === 3 ? seg(u, 0.9, 1.6) : 1;
    if (!(k === 4 && closed >= 1)) wire([[sl.right, sl.ptr[1]], [fx - 46, fy]], wireU, k === 4 ? OFF : ACC, { op: 1 - closed, plain: true });
    pill(560, 150, '열림', k === 4 ? OFF : ACC, k === 3 ? pop(u, 1.5) : 1 - closed, { fs: 14 });
    if (k === 3) sub(265, 250, '메모리와 같은 규칙: 주인은 f', fade(u, 1.8), { 'font-weight': 700, fill: INK });
    if (k === 4) { brace(470, 390, fade(u, 0.1), INK); fly(380, 300, 230, 215, seg(u, 0.3, 0.9), 'Drop::drop(f)', { mono: true, fill: WARN });
      lock(fx, fy - 2, true, GOOD, pop(u, 1.6));
      tx(760, 300, '디스크립터 닫힘', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7), 'text-anchor': 'middle' });
      tx(265, 320, 'close 를 잊는 경로가 없다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1), 'text-anchor': 'middle' }); }
  }

  // 5. 함수 경계 — 인자/반환도 move
  function s5(t, c) { const { k, u } = c;
    zone(30, 40, 400, 250, '스택 (main)'); zone(470, 40, 460, 250, k === 5 ? 'read_only(s: &String)' : 'take_and_return(s)', { stroke: k <= 2 || k === 5 ? WARN : 'none', sw: 2 });
    zone(30, 305, 900, 95, '힙');
    heap(380, 330, H5);
    const S = [140, 100], T = [580, 120], S2 = [140, 190];
    const s1Dead = k >= 1 && k !== 5 || (k === 0 && u > 0.9), fnOn = k === 0 ? u > 0.9 : k === 1 ? u < 1.2 : false;
    const a = slot(S[0], S[1], 's1', [['ptr', '●'], ['len', 5], ['cap', 5]], { dead: k === 5 ? false : s1Dead, op: k === 0 ? fade(u, 0.1, 0.3) : 1 });
    if (k === 0) fly(240, 172, 700, 196, seg(u, 0.3, 0.9), 'ptr · len · cap', { mono: true });
    if (fnOn) { const f = slot(T[0], T[1], 's', [['ptr', '●'], ['len', 5], ['cap', 5]]); wire([f.ptr, [f.ptr[0], 280], [470, 280], [470, 326]], 1, ACC, { plain: true }); }
    if (k === 0) { pill(700, 230, 's.len() = 5', INFO, pop(u, 1.3), { mono: true }); terminal(40, 220, 380, 70, ['길이 = 5'], seg(u, 1.7, 2.1)); }
    if (k === 1) fly(700, 196, 240, 172, seg(u, 0.4, 1.3), 'ptr · len · cap', { mono: true });
    const s2On = (k === 1 && u > 1.3) || (k >= 2 && k !== 5);
    if (s2On) { const b = slot(S2[0], S2[1], 's2', [['ptr', '●'], ['len', 5], ['cap', 5]], { op: k === 1 ? fade(u, 1.3, 0.3) : 1 }); wire([b.ptr, [b.ptr[0], 286], [400, 286], [400, 326]], k === 1 ? seg(u, 1.5, 2.0) : 1, ACC); }
    if (k === 0 || (k === 5)) wire([[a.ptr[0], a.ptr[1] + 20], [a.ptr[0], 296], [395, 296], [395, 326]], k === 0 ? 1 - seg(u, 0.7, 0.9) : 1, ACC);
    if (k === 1) tx(700, 230, 's 를 마지막 식으로 → 반환', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3), 'text-anchor': 'middle' });
    if (k === 2) { [['s1 → s', 640, 120], ['s → s2', 640, 190]].forEach(([s, x, y], i) => pill(x + 60, y, s, ACC, pop(u, 0.3 + i * 0.6), { mono: true }));
      tx(700, 255, '주인 2번 바뀜 · 힙 주소 그대로', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.6), 'text-anchor': 'middle' }); }
    if (k === 3) err(700, 160, 'E0382', 'borrow of moved value: `s1`', pop(u, 0.4));
    if (k === 4) { dot([[169, 220], [169, 286], [400, 286], [400, 326]], seg(u, 0.2, 1.0), INFO, 7); terminal(560, 100, 330, 80, ['hello'], seg(u, 1.0, 1.4), { title: '출력' });
      pill(725, 230, '힙 복사 0회', GOOD, pop(u, 1.6), { fs: 15 }); }
    if (k === 5) { const r = [620, 140];
      el('rect', { x: r[0], y: r[1], width: 70, height: 40, rx: 5, fill: PANEL, stroke: INFO, 'stroke-width': 2, opacity: fade(u, 0.2) }); mono(r[0] - 12, r[1] + 26, 's', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: INFO, opacity: fade(u, 0.2) });
      mono(r[0] + 35, r[1] - 8, '&String', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      wire([[r[0], r[1] + 20], [340, 130]], seg(u, 0.5, 1.3), INFO, { dash: '6 4' });
      tx(700, 230, '주소만 빌린다 · 주인은 main 의 s1', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4), 'text-anchor': 'middle' }); }
  }

  const quiz = [
    { q: 'let s = String::from("hello"); 가 있는 main이 끝날 때 힙의 "hello"를 해제하는 것은 무엇인가?',
      o: ['프로그래머가 쓴 free(s)', 'GC가 나중에 돌면서 회수한다', '컴파일러가 } 자리에 넣은 drop(s)'], a: 2,
      why: '주인 s의 scope가 끝나는 }에 컴파일러가 drop을 넣는다. 사람이 부르지 않으니 빠뜨리거나 두 번 부를 수 없다.' },
    { q: 'let t = s; 뒤에 println!("{}", s); 를 쓰면 무엇이 일어나는가?',
      o: ['컴파일이 E0382로 멈춘다', '"hello"가 한 번 더 복사돼 출력된다', '실행 중에 panic이 난다'], a: 0,
      why: 's의 ptr·len·cap 24바이트가 t로 옮겨 가고 s는 무효가 된다. rustc는 borrow of moved value: `s`로 빌드를 막는다.' },
    { q: 'let y = x; 뒤에도 x를 쓸 수 있는 경우는 어느 것인가?',
      o: ['x가 String일 때', 'x가 i32일 때', 'x가 Vec<i32>일 때'], a: 1,
      why: 'i32는 Copy 트레잇이 있어 4바이트를 그대로 복제한다. String과 Vec은 힙을 가리키므로 move된다.' },
    { q: '안쪽 블록 { let s = String::from("inner"); }이 닫히면 s는 언제 해제되는가?',
      o: ['main 함수가 끝날 때 한꺼번에', '프로그램이 끝날 때', '안쪽 블록의 }에서 바로'], a: 2,
      why: '수명의 단위는 블록이다. 출력도 start, inner 다음에 해제가 일어나고 그 뒤에 after inner가 찍힌다.' },
    { q: 'let s2 = take_and_return(s1); 에서 힙의 "hello"는 몇 번 복사되는가?',
      o: ['0번', '1번', '2번'], a: 0,
      why: '주인은 s1에서 s, s에서 s2로 두 번 바뀌지만 옮겨지는 것은 스택의 24바이트뿐이다. 힙 주소는 처음과 같다.' },
  ];

  const summary = [
    'String은 스택에 ptr·len·cap 24바이트를 두고 실제 글자는 힙에 둔다.',
    'let t = s는 그 24바이트만 옮긴다. 옛 이름 s를 쓰면 E0382로 빌드가 멈춘다.',
    'i32나 (i32, bool)처럼 Copy인 값은 복제되고, 힙까지 복사하려면 clone을 직접 부른다.',
    '주인이 scope를 벗어나면 drop이 한 번 돈다. 파일 핸들도 같은 규칙으로 닫힌다.',
  ];
  const review = [
    { q: 'Vec<String>을 함수 process(v)에 넘긴 뒤 다음 줄에서 v.len()을 불렀더니 빌드가 멈췄다. 가장 알맞은 고침은 무엇인가?',
      o: ['process가 &Vec<String>을 받게 바꾼다', 'v를 static 변수로 옮긴다', 'unsafe 블록으로 감싼다'], a: 0,
      why: '값을 넘기면 주인이 함수 안으로 옮겨 가 E0382가 난다. 보기만 하는 함수라면 참조로 받으면 주인은 호출자에게 남는다.' },
    { q: 'let a = String::from("x"); let b = a.clone(); 뒤의 상태로 맞는 것은 무엇인가?',
      o: ['a는 무효가 되고 b만 남는다', 'a와 b가 같은 힙 칸을 함께 가리킨다', 'a와 b가 각자 다른 힙 칸의 주인이다'], a: 2,
      why: 'clone은 힙까지 새로 복사한다. 그래서 끝에서 drop이 각자 한 번씩 돌아도 문제가 없다.' },
    { q: '구조체 Point { x: i32, y: i32 }를 let q = p; 했더니 p를 못 쓴다. 이유로 맞는 것은 무엇인가?',
      o: ['구조체는 힙에만 저장되기 때문이다', 'Point에 Copy가 구현돼 있지 않기 때문이다', 'i32 필드는 move만 되기 때문이다'], a: 1,
      why: '복사 여부는 크기가 아니라 Copy 트레잇으로 정해진다. 구성원이 모두 Copy여도 구조체에 #[derive(Clone, Copy)]를 붙여야 복제된다.' },
  ];

  R.page({ title: '스택 칸과 힙 칸', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
