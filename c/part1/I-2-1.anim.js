/* I-2-1 제어문·함수 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 분기 흐름도, 반복 칸 추적, 컴파일러가 아는 이름 표, 메모리 칸(주소는 예시)으로 그린다.
 * 출력 값(bonus=10, 0, sum=6, digits=3, tries=3, max=9, 1 2, sum=150, 1 2 3, 120)은 zig cc 로 실제 실행해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function diamond(cx, cy, w, h, text, o) { o = o || {}; const op = o.op ?? 1;
    el('path', { d: `M${cx},${cy - h / 2} L${cx + w / 2},${cy} L${cx},${cy + h / 2} L${cx - w / 2},${cy} Z`, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, opacity: op });
    mono(cx, cy + 5, text, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: o.color || INK, opacity: op }); }
  // 메모리 칸: 이름 · 값 · 주소(예시)
  function memCell(x, y, w, name, val, o) { o = o || {}; const op = o.op ?? 1, h = o.h || 40;
    el('rect', { x, y, width: w, height: h, rx: 5, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    mono(x + w / 2, y + h / 2 + 7, String(val), { 'font-size': o.fs || 18, 'font-weight': 800, 'text-anchor': 'middle', fill: o.color || INK, opacity: op });
    if (name) mono(x - 8, y + h / 2 + 5, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: o.nameCol || INK, opacity: op });
    if (o.addr) mono(x + w + 8, y + h / 2 + 5, o.addr, { 'font-size': 13.5, fill: MUT, opacity: op }); }

  // ---------- 1. 분기 ----------
  const CASES = [["case 'A':", 'bonus = 20; break;'], ["case 'B':", 'bonus = 10; break;'], ["case 'C':", 'bonus = 5;  break;'], ['default:', 'bonus = 0;']];
  function s1(t, c) { const { k, u } = c;
    // 왼쪽: if / else if / else
    const dimL = k >= 2 ? 0.45 : 1, D1 = [170, 140], D2 = [170, 262];
    card(170, 52, 150, 38, { rx: 19, text: 'score = 82', fs: 16, mono: true, fw: 800, stroke: ACC, color: ACC, op: dimL });
    grow(170, 72, 170, 104, 1, MUT, { op: dimL }); diamond(D1[0], D1[1], 210, 72, 'score >= 90 ?', { op: dimL });
    grow(170, 176, 170, 226, 1, MUT, { op: dimL }); diamond(D2[0], D2[1], 210, 72, 'score >= 60 ?', { op: dimL });
    grow(275, 140, 330, 140, 1, MUT, { op: dimL }); card(370, 140, 70, 40, { rx: 8, text: 'A', fs: 16, fw: 800, op: dimL * (k >= 0 ? 0.5 : 1) });
    grow(275, 262, 320, 262, 1, MUT, { op: dimL }); card(370, 262, 90, 40, { rx: 8, text: '합격', fs: 16, fw: 800, stroke: k >= 1 ? GOOD : INK, color: k >= 1 ? GOOD : INK, sw: k >= 1 ? 3 : 2, op: dimL });
    grow(170, 298, 170, 338, 1, MUT, { op: dimL }); card(170, 362, 100, 40, { rx: 8, text: '불합격', fs: 16, fw: 800, op: dimL * (k >= 1 ? 0.45 : 1) });
    tx(290, 128, '참', { 'font-size': 14, fill: MUT, opacity: dimL }); tx(186, 206, '거짓', { 'font-size': 14, fill: MUT, opacity: dimL }); tx(290, 250, '참', { 'font-size': 14, fill: MUT, opacity: dimL });
    if (k === 0) { dot([[170, 72], [170, 140], [170, 262]], seg(u, 0.2, 1.8), ACC, 9); cross(300, 140, 10, pop(u, 1.0)); if (u > 1.8) el('circle', { cx: 170, cy: 228, r: 9, fill: ACC }); }
    if (k === 1) { dot([[170, 228], [170, 262], [330, 262]], seg(u, 0.2, 1.4), ACC, 9); check(370, 300, 10, pop(u, 1.4)); tx(170, 404, '마지막 else 는 검사조차 안 한다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k < 2) return;
    // 오른쪽: switch
    el('line', { x1: 450, y1: 30, x2: 450, y2: 400, stroke: GRID, 'stroke-width': 2 });
    card(600, 52, 170, 38, { rx: 19, text: "grade = 'B'", fs: 16, mono: true, fw: 800, stroke: ACC, color: ACC, s: k === 2 ? pop(u, 0.2) : 1 });
    const RY = (i) => 112 + i * 54, noBreak = k === 5;
    CASES.forEach(([a, b], i) => { const ran = (k >= 3 && i === 1) || (noBreak && i >= 1), skip = k === 4 && i >= 2;
      el('rect', { x: 530, y: RY(i) - 20, width: 360, height: 40, rx: 6, fill: ran ? (noBreak && i >= 2 ? BADBG : ACCBG) : PANEL, stroke: ran ? (noBreak && i >= 2 ? BAD : ACC) : GRID, 'stroke-width': 2, opacity: skip ? 0.4 : 1 });
      mono(546, RY(i) + 6, a, { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: skip ? 0.4 : 1 });
      const bb = noBreak && i === 1 ? 'bonus = 10;' : b; mono(650, RY(i) + 6, bb, { 'font-size': 15, opacity: skip ? 0.4 : 1 });
      if (noBreak && i === 1) mono(760, RY(i) + 6, 'break;', { 'font-size': 15, fill: OFF, 'text-decoration': 'line-through' }); });
    if (k === 2) { const g = E(u, 0.8, 1.8); el('path', { d: `M690,60 C760,60 930,70 890,${RY(1)}`, fill: 'none', stroke: ACC, 'stroke-width': 2.6, 'stroke-dasharray': `${g * 400} 600` });
      tx(800, 40, "'B' 라벨로 곧장 점프", { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (k === 3 || k === 4) { const g = k === 3 ? E(u, 1.0, 1.8) : 1; el('path', { d: `M890,${RY(1)} C930,${RY(1)} 930,330 880,330`, fill: 'none', stroke: GOOD, 'stroke-width': 2.6, 'stroke-dasharray': `${g * 300} 600` });
      if (g >= 1) tx(905, 300, 'break', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); }
    if (k === 4) tx(710, RY(2) + 34, '실행 안 됨', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
    if (k === 5) dot([[530, RY(1)], [530, RY(2)], [530, RY(3)], [530, RY(3) + 30]], seg(u, 0.2, 2.2), BAD, 8);
    // bonus 칸
    const bv = k === 2 ? 0 : k === 3 ? (u < 0.6 ? 0 : 10) : k === 4 ? 10 : u < 0.8 ? 10 : u < 1.5 ? 5 : 0;
    memCell(690, 336, 120, 'bonus', bv, { stroke: k === 5 && bv === 0 ? BAD : ACC, color: k === 5 && bv === 0 ? BAD : ACC });
    if (k === 4) mono(830, 362, '✓ 출력 bonus=10', { 'font-size': 14, fill: GOOD, 'font-weight': 700 });
    if (k === 5) tx(830, 362, u > 1.6 ? '덮어써졌다' : '', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
  }

  // ---------- 2. 반복 ----------
  function s2(t, c) { const { k, u } = c, tr = c.beat.trace, rows = tr.rows || [], prevRows = c.prev && c.prev.trace ? c.prev.trace.rows.length : 0;
    const top = k >= 3 ? 0.45 : 1, CX = (i) => 140 + i * 92;
    mono(40, 44, 'for (int i = 0; i < 5; i++)', { 'font-size': 17, 'font-weight': 800, opacity: top });
    [['초기화 i = 0', 520], ['조건 i < 5', 680], ['증감 i++', 830]].forEach(([s, x], i) => pill(x, 38, s, INFO, k === 0 ? pop(u, 0.4 + i * 0.3) : 1, { fs: 13.5, fill: PANEL, op: top }));
    for (let i = 0; i <= 5; i++) { const r = rows[i], done = !!r, even = i % 2 === 0;
      card(CX(i), 104, 64, 44, { rx: 6, text: String(i), fs: 18, mono: true, fw: 800, stroke: i === 5 ? BAD : done ? (even ? ACC : WARN) : GRID, dash: i === 5 ? '5 4' : null, fill: done && even ? ACCBG : PANEL, op: top });
      if (done) { const nu = i >= prevRows ? fade(u, 0.3 + (i - prevRows) * 0.45) : 1; tx(CX(i), 150, even ? '+' + i : 'continue', { 'font-size': 14, 'font-weight': 700, fill: even ? ACC : WARN, 'text-anchor': 'middle', opacity: nu * top }); } }
    if (k === 1) { el('path', { d: `M${CX(1) - 20},80 C${CX(1)},50 ${CX(2) - 20},50 ${CX(2) - 30},80`, fill: 'none', stroke: WARN, 'stroke-width': 2.4, opacity: fade(u, 1.2) }); }
    const sum = rows.length ? rows[rows.length - 1].sum : 0, psum = c.prev && c.prev.trace && c.prev.trace.rows.length ? c.prev.trace.rows[c.prev.trace.rows.length - 1].sum : 0;
    memCell(CX(5) + 100, 84, 90, 'sum', Math.round(tween(psum, sum, u, 1.8)), { stroke: ACC, color: ACC, op: top });
    if (k === 2) tx(CX(5), 176, 'i = 5 → 조건 거짓 → 끝', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    if (k <= 2) { if (k === 0) sub(480, 260, '아직 한 회차도 돌지 않았다. 끝나는 조건은 i < 5 자리에 적혀 있다', fade(u, 1.4), { 'font-size': 15 });
      if (k === 1) sub(480, 260, 'continue 는 루프를 끝내지 않고 이번 회차만 접는다', fade(u, 1.6), { 'font-size': 15 }); if (k === 2) sub(480, 260, '조건을 i <= 5 로 쓰면 한 번 더 돈다 (off-by-one)', fade(u, 2.2), { 'font-size': 15, fill: WARN });
      return; }
    el('line', { x1: 30, y1: 200, x2: 930, y2: 200, stroke: GRID, 'stroke-width': 2 });
    if (k === 3) { mono(40, 236, 'while (n > 0) { n /= 10; digits++; }', { 'font-size': 16, 'font-weight': 800 });
      const step = Math.min(3, Math.floor(E(u, 0.3, 2.2) * 3.2)), ns = ['100', '10', '1', '0'];
      ns.forEach((s, i) => { if (i > step) return; const x = 120 + i * 190; card(x, 310, 110, 50, { rx: 8, text: 'n = ' + s, fs: 17, mono: true, fw: 800, stroke: i === 3 ? BAD : ACC, color: i === 3 ? BAD : INK, s: pop(u, 0.3 + i * 0.6) });
        if (i > 0) { grow(x - 130, 310, x - 58, 310, 1, MUT); mono(x - 94, 296, '÷10', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); } });
      memCell(820, 368, 90, 'digits', step, { stroke: ACC, color: ACC, h: 36, fs: 17 });
      tx(560, 400, 'n /= 10 을 빼면 n 이 그대로라 영원히 돈다', { 'font-size': 14, fill: WARN, opacity: fade(u, 2.3), 'text-anchor': 'end' }); return; }
    // k 4: do-while
    mono(40, 236, 'do { tries++; } while (tries < 3);', { 'font-size': 16, 'font-weight': 800 });
    card(260, 320, 160, 56, { rx: 10, text: '본문 tries++', fs: 16, stroke: ACC, s: pop(u, 0.2) }); diamond(560, 320, 200, 70, 'tries < 3 ?', { op: fade(u, 0.5) });
    grow(342, 320, 456, 320, E(u, 0.5, 0.9), MUT); el('path', { d: 'M560,355 C560,410 260,410 260,350', fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: fade(u, 0.8) });
    tx(410, 378, '참이면 다시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
    const lap = Math.min(3, 1 + Math.floor(E(u, 0.6, 2.3) * 3)); memCell(760, 300, 80, 'tries', lap, { stroke: ACC, color: ACC });
    tx(260, 272, '검사보다 먼저 한 번 실행', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    if (lap >= 3 && u > 2.3) tx(800, 370, '3 에서 끝', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle' });
  }

  // ---------- 3. 함수 ----------
  const FSRC = ['int max(int a, int b);', 'int main(void) {', '  int r = max(3, 9);', '}', 'int max(int a, int b) {', '  if (a > b) return a;', '  return b;', '}'];
  function s3(t, c) { const { k, u } = c, LY = (i) => 76 + i * 34, noProto = k === 4;
    zone(24, 40, 400, 300, 'function.c', { fill: SOFT });
    const scanTo = [0, 2, 4, 6, 2][k], from = c.prev && k > 0 && k < 4 ? [0, 2, 4, 6][k - 1] : 0, sy = LY(lerp(from, scanTo, E(u, 0.2, 1.2)));
    FSRC.forEach((s, i) => { const gone = noProto && i === 0; mono(40, LY(i) + 18, s, { 'font-size': 15, fill: gone ? OFF : i === 0 ? INFO : INK, 'text-decoration': gone ? 'line-through' : null, 'font-weight': i === scanTo ? 800 : 400 }); });
    el('rect', { x: 30, y: sy - 2, width: 388, height: 30, rx: 5, fill: 'none', stroke: noProto && u > 1.2 ? BAD : ACC, 'stroke-width': 2.5 });
    tx(224, 372, '컴파일러는 위에서 아래로 한 번 읽는다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
    // 오른쪽 위: 컴파일러가 아는 이름
    zone(470, 40, 460, 96, '컴파일러가 아는 함수', { fill: noProto ? BADBG : INFOBG });
    if (!noProto && (k > 0 || u > 1.0)) mono(490, 104, 'int max(int, int)', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: k === 0 ? fade(u, 1.0) : 1 });
    if (noProto) tx(490, 104, '(비어 있음)', { 'font-size': 15, fill: BAD, 'font-weight': 700 });
    if (k === 1) { check(880, 98, 11, pop(u, 1.4)); tx(700, 170, '인자 2개 · int · 반환 int 검사 통과', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (noProto) { terminal(470, 170, 460, 110, ['$ cc function.c', "error: call to undeclared", "  function 'max'"], 1 + E(u, 1.2, 2.0) * 2, { lh: 24 });
      tx(700, 316, '옛 컴파일러는 int 반환으로 가정하고 경고만 냈다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k >= 2) { // 호출 → 값 복사 → 반환
      zone(470, 180, 200, 150, 'main', { fill: PANEL, stroke: GRID }); zone(730, 180, 200, 150, 'max', { fill: ACCBG, stroke: ACC, op: k === 2 ? fade(u, 0.2) : 1 });
      const rv = k === 3 && E(u, 0.8, 1.8) >= 1 ? '9' : '?'; memCell(560, 226, 80, 'r', rv, { stroke: rv === '9' ? GOOD : INK, color: rv === '9' ? GOOD : INK });
      mono(570, 300, 'max(3, 9)', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT });
      memCell(820, 216, 60, 'a', '3', { h: 36, fs: 17, op: k === 2 ? fade(u, 1.1) : 1 }); memCell(820, 270, 60, 'b', '9', { h: 36, fs: 17, op: k === 2 ? fade(u, 1.5) : 1, stroke: k === 3 ? GOOD : INK });
      if (k === 2) { fly(560, 278, 850, 234, seg(u, 0.3, 1.1), '3', { mono: true }); fly(590, 278, 850, 288, seg(u, 0.7, 1.5), '9', { mono: true });
        tx(700, 370, 'a, b 는 넘어온 값의 복사본이다', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
      if (k === 3) { tx(830, 352, 'a > b 거짓 → return b', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
        fly(850, 288, 600, 246, seg(u, 0.8, 1.8), '9', { fill: GOOD, mono: true }); tx(700, 400, 'return 은 값을 돌려주고 그 자리에서 함수를 끝낸다', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); } }
  }

  // ---------- 4. 값 복사와 배열 붕괴 ----------
  const ARR = [10, 20, 30, 40, 50];
  function s4(t, c) { const { k, u } = c;
    // 왼쪽: swap
    zone(24, 36, 410, 136, 'main 프레임', { fill: SOFT }); zone(24, 196, 410, 150, 'swap 프레임 (복사본)', { fill: ACCBG, op: k === 2 ? 1 - E(u, 0.3, 1.3) : k > 2 ? 0 : 1 });
    memCell(120, 70, 80, 'x', 1, { addr: '0x…a8', stroke: k >= 2 ? GOOD : INK }); memCell(120, 118, 80, 'y', 2, { addr: '0x…ac', stroke: k >= 2 ? GOOD : INK });
    if (k <= 1 || (k === 2 && u < 1.3)) { const sw = k === 0 ? E(u, 1.4, 2.4) : 1, op = k === 2 ? 1 - E(u, 0.3, 1.3) : 1;
      if (k === 0) { fly(160, 90, 160, 250, seg(u, 0.2, 0.9), '1', { mono: true }); fly(160, 138, 160, 298, seg(u, 0.4, 1.1), '2', { mono: true }); }
      if (k > 0 || u > 1.1) { memCell(120, 230, 80, 'a', sw >= 0.5 ? 2 : 1, { op, stroke: ACC }); memCell(120, 278, 80, 'b', sw >= 0.5 ? 1 : 2, { op, stroke: ACC });
        if (k === 0 && sw > 0 && sw < 1) { el('path', { d: 'M215,250 C260,250 260,298 215,298', fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); } }
      if (k === 0) tx(330, 274, '함수 안에서만 뒤바뀐다', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }
    if (k >= 2) { check(300, 112, 10, 1); tx(230, 230, '그대로 1, 2', { 'font-size': 16, fill: GOOD, 'font-weight': 800, opacity: k === 2 ? fade(u, 1.5) : 1 });
      if (k === 2) terminal(40, 280, 380, 80, ['$ ./passing', '1 2'], 1 + E(u, 1.6, 2.2), {}); }
    tx(30, 400, '주소는 예시 (실행마다 달라진다)', { 'font-size': 13.5, fill: MUT });
    // 오른쪽: 배열
    if (k === 0) return;
    zone(470, 36, 466, 136, 'main 의 int arr[5]', { fill: SOFT });
    const AX = (i) => 490 + i * 86; ARR.forEach((v, i) => { const hot = k === 4 && Math.floor(E(u, 0.3, 2.2) * 5) === i;
      memCell(AX(i), 72, 72, null, v, { stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL }); mono(AX(i) + 36, 132, ['0x…c0', 'c4', 'c8', 'cc', 'd0'][i], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    if (k === 3) { const g = E(u, 0.3, 1.2); el('path', { d: `M490,150 V160 H${490 + 426 * g} V150`, fill: 'none', stroke: GOOD, 'stroke-width': 2.5 });
      tx(703, 196, 'sizeof(arr) = 20 바이트 → 20 / 4 = 5 개', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); }
    if (k === 1 || k >= 3) { const y = 250; zone(470, 220, 466, 130, k === 4 ? 'sum(arr, n) 안' : 'sum 안의 arr', { fill: ACCBG, op: k === 1 ? fade(u, 0.3) : 1 });
      memCell(560, y, 110, 'int *arr', '0x…c0', { fs: 15, stroke: ACC, op: k === 1 ? fade(u, 0.5) : 1 });
      grow(615, y, 556, 116, k === 1 ? E(u, 0.9, 1.6) : 1, ACC);
      if (k === 1) { tx(700, 274, 'sizeof(arr) = 8 (포인터 크기)', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); tx(700, 300, '8 / 4 = 2 개? 틀린 답', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.1) }); }
      if (k >= 3) memCell(760, 250, 70, 'len', 5, { stroke: GOOD, color: GOOD });
      if (k === 4) { const n = Math.min(5, Math.floor(E(u, 0.3, 2.2) * 5) + 1), s = ARR.slice(0, n).reduce((a, b) => a + b, 0);
        memCell(760, 300, 70, 's', s, { stroke: ACC, color: ACC, h: 36, fs: 17 }); if (n >= 5 && u > 2.2) tx(850, 324, 'sum=150', { 'font-size': 15, 'font-weight': 800, fill: GOOD, class: 'mono' }); } }
  }

  // ---------- 5. 스코프 · 수명 · 재귀 ----------
  function stackFrame(x, y, w, h, name, o) { o = o || {}; zone(x, y, w, h, name, { fill: o.fill || ACCBG, stroke: o.stroke || ACC, sw: 1.8, op: o.op ?? 1, color: o.stroke || ACC, dash: o.dash }); }
  function s5(t, c) { const { k, u } = c;
    // 왼쪽: 데이터 영역 (프로그램 내내)
    zone(24, 36, 380, 170, '데이터 영역 · 프로그램이 끝날 때까지', { fill: SOFT });
    const calls = k <= 1 ? 0 : k === 2 ? (u > 1.4 ? 1 : 0) : k === 3 ? 1 : k >= 4 ? (k === 4 ? 1 + Math.min(2, Math.floor(E(u, 0.3, 2.2) * 3)) : 3) : 0;
    const nval = calls; memCell(150, 74, 90, 'calls', calls, { stroke: INFO, color: INFO, s: 1, op: k === 0 ? fade(u, 0.3) : 1 });
    tx(260, 100, '전역: 어디서나 보인다', { 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 1.0) : 1 });
    if (k >= 1) { el('rect', { x: 40, y: 132, width: 348, height: 60, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: k === 1 ? fade(u, 1.0) : 1 });
      memCell(150, 142, 90, 'static n', nval, { stroke: WARN, color: WARN, op: k === 1 ? fade(u, 0.4) : 1 });
      tx(256, 168, '함수 안에서만 보임', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.2) : 1 }); }
    // 오른쪽: 스택
    zone(460, 36, 476, 360, '스택 · 호출마다 생겼다 사라진다', { fill: SOFT });
    stackFrame(480, 66, 436, 46, 'main');
    if (k === 2 || k === 4) { const cyc = k === 4 ? (E(u, 0.3, 2.2) * 3) % 1 : E(u, 0.2, 2.4), op = cyc < 0.15 ? cyc / 0.15 : cyc > 0.85 ? (1 - cyc) / 0.15 : 1;
      stackFrame(480, 124, 436, 46, 'counter()', { op }); }
    if (k === 2) tx(698, 220, 'counter 프레임은 사라져도 n, calls 는 남는다', { 'font-size': 14.5, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
    if (k === 4) { const n = Math.min(3, 1 + Math.floor(E(u, 0.3, 2.2) * 3)); mono(698, 250, [1, 2, 3].slice(0, n).join('  '), { 'font-size': 28, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
      tx(698, 290, '같은 함수를 불러도 결과가 달라진다: 숨은 상태', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }
    if (k === 3) { const down = E(u, 0.2, 1.4), up = E(u, 1.5, 2.6), vals = [120, 24, 6, 2, 1];
      for (let i = 0; i < 5; i++) { const appear = clamp(down * 5 - i), gone = i > 0 && clamp(up * 5 - (4 - i)) >= 1; if (appear <= 0 || gone) continue;
        const y = 124 + i * 50; stackFrame(480, y, 436, 42, `factorial(${5 - i})`, { op: appear });
        if (up > 0 && clamp(up * 5 - (4 - i)) > 0) mono(900, y + 27, '→ ' + vals[i], { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end' }); }
      if (down >= 1 && up <= 0) tx(698, 390, 'k <= 1 에서 멈춘다', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle' });
      if (up >= 1) tx(698, 220, '5! = 120', { 'font-size': 22, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', class: 'mono' }); }
    if (k === 5) { const ret = E(u, 0.8, 1.6);
      if (ret < 1) { stackFrame(480, 124, 436, 90, 'bad()', { op: 1 - ret * 0.7 }); [0, 1, 2].forEach((i) => memCell(560 + i * 80, 150, 70, i ? null : 'a[3]', '?', { h: 36, fs: 16, op: 1 - ret })); }
      else { el('rect', { x: 480, y: 124, width: 436, height: 90, rx: 12, fill: BADBG, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); tx(698, 174, '이미 회수된 자리', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' }); }
      memCell(150, 240, 110, 'int *p', '0x…', { stroke: BAD, color: BAD, op: fade(u, 1.2) });
      if (u > 1.4) { el('path', { d: 'M260,260 C380,260 420,170 476,170', fill: 'none', stroke: BAD, 'stroke-width': 2.6, 'stroke-dasharray': '6 5' }); }
      tx(220, 320, '댕글링 포인터', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(220, 350, '해결: 호출자 배열을 받거나 static·malloc', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }
  }

  const quiz = [
    { q: "switch (grade)에서 grade가 'B'이고 case 'B'에 break가 없으면 bonus는 얼마로 끝나는가?",
      o: ['10', '5', '0'], a: 2,
      why: "case는 진입점일 뿐이라 'B'에서 시작해 'C', default까지 흘러간다. 마지막 bonus = 0이 앞의 값을 덮어쓴다." },
    { q: 'for (i = 0; i < 5; i++) 안에서 홀수일 때 continue를 쓰면 무슨 일이 생기는가?',
      o: ['그 회차의 나머지를 건너뛰고 i++ 로 넘어간다', '루프 전체가 끝난다', 'i를 다시 0으로 돌린다'], a: 0,
      why: 'continue는 이번 회차만 접는다. 그래서 0, 2, 4만 더해져 sum은 6이다.' },
    { q: 'main 아래에 정의한 max를 main에서 부르려면 무엇이 필요한가?',
      o: ['max를 static으로 바꾸기', 'main 위에 프로토타입 int max(int, int); 두기', 'max를 다른 파일로 옮기기'], a: 1,
      why: '컴파일러는 위에서 아래로 한 번 읽는다. 선언을 먼저 보아야 인자와 반환 타입을 검사하고 호출을 통과시킨다.' },
    { q: 'sum(int arr[], int len) 안에서 sizeof(arr)가 8인 이유는 무엇인가?',
      o: ['원소가 2개만 복사됐다', 'int가 8바이트라서', '배열이 첫 원소를 가리키는 포인터로 붕괴했다'], a: 2,
      why: '배열은 통째로 복사되지 않고 첫 원소의 주소만 넘어간다. 64비트에서 포인터는 8바이트라 개수 정보가 사라진다.' },
    { q: 'counter()를 세 번 부르면 1, 2, 3이 나온다. 값을 기억하는 변수는 무엇인가?',
      o: ['함수 안의 static int n', '매개변수', '보통 지역 변수 int n'], a: 0,
      why: 'static 지역 변수는 보이는 범위는 함수 안이지만 수명은 프로그램 전체라, 초기화는 한 번이고 값이 호출 사이에 남는다.' },
  ];

  const summary = [
    'if 사슬은 처음 참인 갈래 하나만 돌고, switch는 맞는 case로 바로 뛰어 break까지 내려간다.',
    'break를 빠뜨리면 아래 case까지 흘러 bonus가 10이 아니라 0으로 끝난다.',
    '함수 인자는 복사본이라 swap(x, y) 뒤에도 1 2이고, 배열은 포인터로 넘어가 길이를 따로 줘야 한다.',
    'static 지역은 호출 사이 값을 기억하고, 지역 배열 주소를 돌려주면 사라진 자리를 가리킨다.',
  ];
  const review = [
    { q: '배열 합계 함수 안에서 개수를 sizeof(arr)/sizeof(arr[0])로 구했더니 늘 2가 나온다. 고칠 방법은?',
      o: ['호출하는 쪽에서 개수를 구해 len 인자로 함께 넘긴다', 'arr를 int arr[5]로 선언하면 크기가 전달된다', 'sizeof 대신 strlen을 쓴다'], a: 0,
      why: '함수 안의 arr는 8바이트 포인터라 8/4 = 2가 나온다. 진짜 배열이 있는 main에서 20/4 = 5를 구해 넘겨야 한다.' },
    { q: 'swap(x, y)를 불렀는데 x, y가 그대로다. 원본을 바꾸려면?',
      o: ['swap 안에 return을 추가한다', 'swap(&x, &y)처럼 주소를 넘기고 포인터로 받는다', 'x, y를 static으로 만든다'], a: 1,
      why: 'C는 언제나 값을 복사해 넘긴다. 주소를 넘겨야 함수가 호출한 쪽의 칸에 직접 쓸 수 있다.' },
    { q: '재귀 함수를 고쳤더니 바로 프로그램이 죽는다. 먼저 확인할 것은?',
      o: ['printf 형식 지정자', '전역 변수 개수', '종료 조건이 언젠가 참이 되는지'], a: 2,
      why: '재귀는 부를 때마다 프레임이 쌓인다. k <= 1 같은 종료 조건이 없거나 닿지 않으면 스택이 넘쳐 죽는다.' },
  ];

  R.page({ title: '실행 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
