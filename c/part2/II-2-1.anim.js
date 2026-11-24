/* II-2-1 이중 포인터·함수 포인터 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tween, card, mono, sub, lbl, pill, banner, fly, dot, zone, terminal, cross, check, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG } = C;

  // ---------- 지역 도우미 ----------
  const mk = (col) => (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)');
  // 휘는 화살표 (u 만큼 자란다). bend > 0 이면 위로 휜다
  function arc(x1, y1, x2, y2, bend, u, col, o) { o = o || {}; if (u <= 0) return;
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 - bend;
    el('path', { d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.6, pathLength: 1,
      'stroke-dasharray': o.dash || `${clamp(u)} 2`, 'marker-end': u > 0.98 && !o.plain ? mk(col) : null, opacity: o.op ?? 1, 'stroke-linecap': 'round' }); }
  const qpt = (x1, y1, x2, y2, bend, s) => { const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 - bend, a = 1 - s; return [a * a * x1 + 2 * a * s * cx + s * s * x2, a * a * y1 + 2 * a * s * cy + s * s * y2]; };
  function arcDot(x1, y1, x2, y2, bend, s, col, r) { if (s <= 0 || s >= 1) return; const [x, y] = qpt(x1, y1, x2, y2, bend, E(s, 0, 1)); el('circle', { cx: x, cy: y, r: r || 7, fill: col || ACC }); }
  // 메모리 칸 하나: 이름(위) · 값(안) · 주소(아래)
  function room(cx, cy, w, h, o) { o = o || {};
    card(cx, cy, w, h, { rx: 8, fill: o.fill || PANEL, stroke: o.stroke || INK, sw: o.sw || 2.2, dash: o.dash, s: o.s, op: o.op });
    if (o.val != null) mono(cx, cy + 7, String(o.val), { 'text-anchor': 'middle', 'font-size': o.vfs || 20, 'font-weight': 700, fill: o.vcol || INK, opacity: (o.op ?? 1) * (o.vop ?? 1) });
    if (o.name) tx(cx - w / 2, cy - h / 2 - 10, o.name, { 'font-size': 16, 'font-weight': 800, fill: o.ncol || INK, opacity: o.op ?? 1 });
    if (o.type) tx(cx + w / 2, cy - h / 2 - 10, o.type, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', class: 'mono', opacity: o.op ?? 1 });
    if (o.addr) mono(cx, cy + h / 2 + 20, o.addr, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.acol || MUT, opacity: o.op ?? 1 }); }
  // 바이트 칸 한 줄 (연속)
  function bytes(x, y, n, w, h, o) { o = o || {};
    for (let i = 0; i < n; i++) { const a = o.show ? o.show(i) : 1; if (a <= 0) continue;
      el('rect', { x: x + i * w, y, width: w, height: h, fill: (o.fill && o.fill(i)) || PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: a }); } }
  // 대괄호 자 (재기)
  function ruler(x1, x2, y, u, text, col) { if (u <= 0) return; const xe = lerp(x1, x2, E(u, 0, 1));
    el('path', { d: `M${x1},${y - 8} V${y} H${xe}` + (u >= 1 ? ` V${y - 8}` : ''), fill: 'none', stroke: col || INK, 'stroke-width': 2 });
    if (u >= 1 && text) mono((x1 + x2) / 2, y + 20, text, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK }); }
  const hex = (n) => '0x' + n.toString(16);

  // 화살표 경로를 따라 움직이는 알약 (여러 구간)
  function along(segs, s, text, col) { if (s <= 0 || s >= 1) return; const n = segs.length, k = Math.min(n - 1, Math.floor(s * n)), f = E(s * n - k, 0, 1), [x1, y1, x2, y2, b] = segs[k];
    const [x, y] = qpt(x1, y1, x2, y2, b, f); if (text) card(x, y, R.tw(text, 14) + 22, 28, { rx: 14, fill: col || ACC, stroke: 'none', text, fs: 14, color: PANEL, mono: true }); else el('circle', { cx: x, cy: y, r: 8, fill: col || ACC }); }

  // ---------- 1. 주소 체인 x ← p ← pp ----------
  const CH = { y: 170, x: 170, p: 480, pp: 790, w: 170 };
  const pToX = [CH.p - 86, CH.y - 14, CH.x + 86, CH.y - 14, 60], ppToP = [CH.pp - 86, CH.y - 14, CH.p + 86, CH.y - 14, 60];
  function s1(t, c) { const { k, u } = c, xv = k === 4 && u > 1.8 ? '99' : k === 4 ? '42' : k === 5 ? '99' : '42';
    sub(920, 44, '주소 0x100 · 0x200 · 0x300은 예시', 1, { 'text-anchor': 'end' });
    room(CH.x, CH.y, CH.w, 60, { name: 'x', type: 'int', val: xv, addr: '0x100', s: k === 0 ? pop(u, 0.2) : 1 + (k === 4 ? bump(u, 1.8) : 0), stroke: k === 4 && u > 1.8 ? WARN : INK, fill: k >= 4 && xv === '99' ? WARNBG : PANEL, vcol: xv === '99' ? WARN : INK });
    if (k >= 1) room(CH.p, CH.y, CH.w, 60, { name: 'p', type: 'int *', val: k === 1 && u < 1.0 ? '' : '0x100', vcol: ACC, stroke: ACC, addr: '0x200', s: k === 1 ? pop(u, 0.2) : 1 });
    if (k >= 2) room(CH.pp, CH.y, CH.w, 60, { name: 'pp', type: 'int **', val: k === 2 && u < 1.0 ? '' : '0x200', vcol: ACC, stroke: ACC, addr: '0x300', s: k === 2 ? pop(u, 0.2) : 1 });
    if (k === 1) fly(CH.x, CH.y + 52, CH.p, CH.y, seg(u, 0.4, 1.0), '&x', { mono: true });
    if (k === 2) fly(CH.p, CH.y + 52, CH.pp, CH.y, seg(u, 0.4, 1.0), '&p', { mono: true });
    if (k >= 1) arc(...pToX, k === 1 ? seg(u, 1.1, 1.8) : 1, ACC);
    if (k >= 2) arc(...ppToP, k === 2 ? seg(u, 1.1, 1.8) : 1, ACC);
    if (k === 2) tx(480, 290, '별표 개수 = 따라갈 칸 수', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    if (k === 3) { // 세 길로 같은 칸 읽기
      [['x', [], 0.2], ['*p', [pToX], 0.6], ['**pp', [ppToP, pToX], 1.2]].forEach(([e, path, a0], i) => { const y = 300 + i * 34, s = seg(u, a0, a0 + 0.5 + path.length * 0.4);
        if (path.length) along(path, s, null, ACC);
        mono(300, y, e, { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, a0) });
        mono(330, y, `→ 42  (역참조 ${path.length}번)`, { 'font-size': 16, 'font-weight': 700, opacity: path.length ? (s >= 1 ? 1 : 0) : fade(u, 0.5) }); }); }
    if (k === 4) { along([ppToP, pToX], seg(u, 0.2, 1.8), '99', WARN); mono(480, 320, '**pp = 99;', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      tx(480, 352, 'x를 직접 쓰지 않았는데 x가 99가 된다', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
    if (k === 5) terminal(280, 270, 400, 136, ['$ ./chain', 'x   = 42', '*p  = 42', '**pp= 42', 'x   = 99'], 1 + seg(u, 0.2, 1.8) * 4, { title: 'chain.c 실행', lh: 20 }); }

  // ---------- 2. 함수에서 포인터 바꾸기: 스택 프레임 + 힙 ----------
  function heapBlock(cx, cy, v, o) { o = o || {}; card(cx, cy, 150, 56, { rx: 8, stroke: o.col || INK, fill: o.fill || PANEL, sw: 2.4, dash: o.dash, s: o.s, op: o.op });
    mono(cx, cy + 7, v, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: o.col || INK, opacity: o.op ?? 1 });
    if (o.label) tx(cx, cy + 50, o.label, { 'font-size': 14, 'font-weight': 700, fill: o.col || MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 }); }
  function s2(t, c) { const { k, u } = c, PM = [150, 345], HA = [740, 120], HB = [740, 290];
    zone(40, 258, 470, 150, 'main', { stroke: GRID, sw: 2 }); zone(560, 30, 360, 378, '힙', { stroke: GRID, sw: 2, fill: PANEL });
    const pSet = k >= 4 && !(k === 4 && u < 1.6);
    room(PM[0], PM[1], 150, 54, { name: 'p', type: 'int *', val: pSet ? '●' : 'NULL', vcol: pSet ? ACC : WARN, stroke: pSet ? ACC : WARN, s: k === 0 ? pop(u, 0.2) : 1 });
    // 블록 A (bad_alloc 이 만든 것)
    if (k >= 1) { const lost = k >= 2 && !(k === 2 && u < 0.9);
      heapBlock(HA[0], HA[1], k === 1 && u < 1.3 ? '' : '7', { s: k === 1 ? pop(u, 0.9) : 1, col: lost ? BAD : INK, fill: lost ? BADBG : PANEL, label: lost ? '누수 · 주소를 아는 곳이 없다' : 'malloc 한 블록 A' }); }
    if (k === 1 || k === 2) { const op = k === 1 ? fade(u, 0.1) : 1 - E(u, 0.2, 0.8);
      if (op > 0.02) { zone(40, 40, 470, 160, 'bad_alloc(int *q) — 복사본', { stroke: WARN, sw: 2, fill: WARNBG, color: WARN, op });
        room(200, 130, 150, 54, { name: 'q', type: 'int *', val: k === 1 && u < 1.0 ? 'NULL' : '●', vcol: ACC, stroke: WARN, op });
        if (!(k === 1 && u < 1.0)) arc(276, 122, HA[0] - 76, HA[1], 20, k === 1 ? seg(u, 1.0, 1.6) : 1, ACC, { op }); }
      if (k === 1) fly(PM[0], PM[1], 200, 130, seg(u, 0.2, 0.8), 'NULL 복사', { mono: true });
      if (k === 2) terminal(250, 270, 250, 92, ['$ ./alloc', 'bad : 0000000000000000'], 1 + seg(u, 1.0, 1.6), { title: 'Windows 출력', lh: 22 }); }
    if (k >= 3) { const op = k === 3 ? fade(u, 0.1) : k === 4 ? 1 - E(u, 2.2, 2.8) : 0;
      if (op > 0.02) { zone(40, 40, 470, 160, 'good_alloc(int **pp) — 원본의 주소', { stroke: ACC, sw: 2, fill: ACCBG, color: ACC, op });
        room(200, 130, 150, 54, { name: 'pp', type: 'int **', val: '&p', vcol: ACC, stroke: ACC, op });
        arc(200, 158, PM[0], PM[1] - 30, 0, k === 3 ? seg(u, 0.6, 1.3) : 1, ACC, { op }); }
      if (k === 4) { along([[200, 158, PM[0], PM[1] - 30, 0]], seg(u, 0.9, 1.6), null, ACC); }
      const bAlive = !(k === 5);
      if (k >= 4) { heapBlock(HB[0], HB[1], k === 4 && u < 1.2 ? '' : '7', { s: k === 4 ? pop(u, 0.3) : 1, col: bAlive ? GOOD : MUT, fill: bAlive ? GOODBG : PANEL, dash: bAlive ? null : '6 5', op: k === 5 ? 1 - 0.6 * E(u, 0.4, 1.2) : 1, label: k === 5 ? 'free(p)로 반납' : 'malloc 한 블록 B' });
        if (k === 4) arc(PM[0] + 40, PM[1] - 28, HB[0] - 76, HB[1], 170, seg(u, 1.6, 2.2), ACC);
        if (k === 4) terminal(250, 270, 250, 128, ['$ ./alloc', 'bad : 0000000000000000', 'good: 7'], 2 + seg(u, 2.3, 2.8), { title: 'alloc.c 실행', lh: 22 }); }
      if (k === 5) { mono(275, 140, 'free(p);', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle' });
        tx(275, 176, '블록 A는 주소를 잃어 끝내 반납하지 못한다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); } } }

  // ---------- 3. 함수 포인터: 코드 영역의 함수를 가리킨다 ----------
  const FN = [['add', 'a + b', 100], ['sub', 'a - b', 200], ['mul', 'a * b', 300]];
  function codeArea(op, hot) { zone(560, 30, 360, 360, '코드 영역 (함수 기계어)', { stroke: GRID, sw: 2, fill: SOFT, op });
    FN.forEach(([nm, body, y], i) => { const h = hot === i; card(740, y, 320, 70, { rx: 8, stroke: h ? ACC : INK, fill: h ? ACCBG : PANEL, sw: h ? 3 : 2, op });
      mono(596, y - 6, `int ${nm}(int a, int b)`, { 'font-size': 15, 'font-weight': 700, fill: h ? ACC : INK, opacity: op }); mono(612, y + 20, `return ${body};`, { 'font-size': 14.5, fill: MUT, opacity: op }); }); }
  function s3(t, c) { const { k, u } = c, F = [220, 262];
    const tgt = k === 2 || k === 5 ? 0 : k >= 3 ? 2 : -1;
    codeArea(k === 0 ? fade(u, 0.1) : 1, k === 2 ? (u > 1.0 ? 0 : -1) : k === 3 ? (u > 1.0 ? 2 : -1) : tgt);
    if (k === 0) { tx(60, 200, '모두 int 두 개를 받아 int를 돌려준다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(60, 230, '모양이 같아야 한 포인터로 갈아 끼울 수 있다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); return; }
    if (k === 4) { // 괄호 함정
      [['int (*fp)(int, int);', 'fp는 포인터 → 함수를 가리킨다', GOOD, 110], ['int *bad(int, int);', 'bad는 함수 → int* 를 돌려준다', BAD, 250]].forEach(([code, m, col, y], i) => { const a = fade(u, 0.2 + i * 0.8);
        mono(60, y, code, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: a }); tx(60, y + 32, m, { 'font-size': 15, 'font-weight': 700, opacity: a }); });
      mono(60, 330, 'bad = add;', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); cross(200, 324, 9, pop(u, 1.9));
      tx(230, 330, '대입할 수 없다', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 2.0) }); return; }
    // 선언 해부 (k1) / fp 칸
    if (k === 1) { const parts = [['int', 60, '반환 타입'], ['(*fp)', 112, '이름 · 괄호 필수'], ['(int, int)', 196, '매개변수']];
      mono(60, 80, 'int (*fp)(int, int);', { 'font-size': 22, 'font-weight': 800 });
      parts.forEach(([s, x, m], i) => { const w = R.tw(s, 22), a = seg(u, 0.4 + i * 0.4, 0.8 + i * 0.4); if (a <= 0) return;
        el('line', { x1: x, y1: 92, x2: x + w * a, y2: 92, stroke: [INK, ACC, WARN][i], 'stroke-width': 3 }); tx(x, 116 + i * 22, m, { 'font-size': 14, 'font-weight': 700, fill: [INK, ACC, WARN][i], opacity: a }); }); }
    const fpVal = k === 1 ? '(아직 없음)' : k === 2 || k === 5 ? 'add' : u > 0.8 || k > 3 ? 'mul' : 'add';
    room(F[0], F[1], 170, 56, { name: 'fp', type: 'int (*)(int,int)', val: fpVal, vfs: k === 1 ? 15 : 19, vcol: k === 1 ? MUT : ACC, stroke: k === 1 ? MUT : ACC, dash: k === 1 ? '6 5' : null });
    if (k === 2 || k === 3 || k === 5) { const from = k === 3 ? lerp(FN[0][2], FN[2][2], E(u, 0.2, 0.8)) : FN[0][2];
      arc(F[0] + 86, F[1] - 6, 578, from, 30, k === 2 ? seg(u, 0.2, 0.9) : 1, ACC); }
    if (k === 2 || k === 3) { const y = k === 2 ? FN[0][2] : FN[2][2];
      fly(F[0], F[1] + 70, 556, y, seg(u, 1.0, 1.6), '3, 4', { mono: true });
      mono(F[0], F[1] + 86, k === 2 ? 'fp(3, 4)' : '(*fp)(3, 4)', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      fly(556, y, 420, 346, seg(u, 1.8, 2.4), k === 2 ? '7' : '12', { mono: true, fill: GOOD, stay: true }); }
    if (k === 5) terminal(330, 300, 200, 100, ['$ ./funcptr', '7', '12'], 1 + seg(u, 0.3, 1.6) * 2, { title: 'funcptr.c 실행', lh: 20 }); }

  // ---------- 4. 콜백과 디스패치 표 ----------
  function fnCol(op, hot) { FN.forEach(([nm, body, y], i) => { const yy = 90 + i * 90, h = hot === i; card(800, yy, 200, 62, { rx: 8, stroke: h ? ACC : INK, fill: h ? ACCBG : PANEL, sw: h ? 3 : 2, op });
      mono(800, yy - 4, nm, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: h ? ACC : INK, opacity: op }); mono(800, yy + 20, body, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: op }); });
    tx(800, 380, 'int (int, int) 셋', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: op }); }
  const ARR = [5, 2, 8, 1, 9], SORTED = [1, 2, 5, 8, 9];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { // 비교 함수 부호 = 순서
      mono(60, 70, 'int cmp_asc(const void *a, const void *b)', { 'font-size': 17, 'font-weight': 800 }); mono(80, 100, 'return *(const int*)a - *(const int*)b;', { 'font-size': 15, fill: MUT });
      const ax = axes(120, 170, 720, 40, { x: [-8, 8], y: [0, 1], xt: [-5, 0, 5] }); el('rect', { x: ax.X(-8), y: 170, width: ax.X(0) - ax.X(-8), height: 40, fill: ACCBG, opacity: 0.7 });
      tx(ax.X(-4), 160, '음수 · a가 앞', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' }); tx(ax.X(0), 160, '0 · 같다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); tx(ax.X(4), 160, '양수 · b가 앞', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' });
      [[2, 7, -5, 0.4], [7, 2, 5, 1.2], [5, 5, 0, 2.0]].forEach(([a, b, d, a0], i) => { const s = seg(u, a0, a0 + 0.6); if (s <= 0) return;
        el('circle', { cx: ax.X(d * E(s, 0, 1)), cy: 190, r: 9, fill: d < 0 ? ACC : d > 0 ? WARN : INK });
        mono(160 + i * 240, 300, `cmp(&${a}, &${b}) = ${d}`, { 'font-size': 16, 'font-weight': 800, fill: d < 0 ? ACC : d > 0 ? WARN : INK, opacity: s }); });
      tx(480, 360, 'qsort는 값의 뜻을 모르고, 누가 먼저인지만 콜백에 묻는다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    fnCol(k === 1 ? fade(u, 0.2) : 1, k === 6 && u > 0.8 ? 2 : k === 5 ? 2 : -1);
    if (k === 1) { tx(60, 200, '반환 타입과 매개변수가 똑같은 함수 셋', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) }); tx(60, 230, '그래서 한 배열에 담을 수 있다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) }); return; }
    if (k === 2) { const g = E(u, 0.3, 1.2);
      mono(80, 200, 'int (*)(int, int)', { 'font-size': 20, 'font-weight': 800, opacity: 1 - 0.5 * g });
      el('rect', { x: 66, y: 172, width: 260 * g, height: 40, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      if (g >= 1) { pill(196, 130, 'BinOp', ACC, pop(u, 1.3), { mono: true, fs: 17 }); mono(60, 270, 'typedef int (*BinOp)(int, int);', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) }); } return; }
    if (k === 3 || k === 4) { // qsort 로 정렬
      mono(60, 60, 'qsort(arr, 5, sizeof(int), cmp_asc);', { 'font-size': 16, 'font-weight': 800 });
      const g = k === 4 ? E(u, 0.2, 1.4) : 0;
      ARR.forEach((v, i) => { const j = SORTED.indexOf(v), x = lerp(80 + i * 100, 80 + j * 100, g), y = 150 - Math.sin(g * Math.PI) * (i % 2 ? 40 : -40);
        const pair = k === 3 ? Math.floor(seg(u, 0.3, 2.7) * 4) : -1, hot = k === 3 && (i === pair || i === pair + 1);
        card(x + 40, y, 80, 56, { rx: 8, stroke: hot ? ACC : k === 4 && g >= 1 ? GOOD : INK, fill: hot ? ACCBG : PANEL, sw: hot ? 3 : 2.2 });
        mono(x + 40, y + 8, String(v), { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? ACC : INK }); });
      if (k === 3) { const pair = Math.min(3, Math.floor(seg(u, 0.3, 2.7) * 4)), a = ARR[pair], b = ARR[pair + 1], d = a - b;
        if (u > 0.3) { mono(120 + pair * 100, 228, `cmp(&${a}, &${b}) = ${d}`, { 'font-size': 15, 'font-weight': 800, fill: d < 0 ? ACC : WARN, 'text-anchor': 'middle' }); }
        tx(60, 300, '정렬하는 동안 qsort가 cmp_asc를 여러 번 부른다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
        sub(300, 330, '짝은 설명용 예시 · 실제 비교 순서는 qsort 구현이 정한다', fade(u, 1.5), { 'text-anchor': 'middle' }); }
      if (k === 4) terminal(60, 270, 520, 100, ['$ ./callback', '1 2 5 8 9'], 1 + seg(u, 1.6, 2.2), { title: 'callback.c 실행', lh: 22 });
      return; }
    // k5, k6: ops 표
    mono(60, 60, 'BinOp ops[] = { add, sub, mul };', { 'font-size': 16, 'font-weight': 800 });
    for (let i = 0; i < 3; i++) { const y = 90 + i * 90, hot = i === 2 && (k === 6 || u > 1.4);
      card(300, y, 150, 56, { rx: 6, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, sw: hot ? 3 : 2, s: k === 5 ? pop(u, 0.2 + i * 0.25) : 1 });
      mono(210, y + 6, `ops[${i}]`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: MUT });
      el('circle', { cx: 340, cy: y, r: 6, fill: ACC }); arc(346, y, 698, 90 + i * 90, 0, k === 5 ? seg(u, 0.6 + i * 0.2, 1.1 + i * 0.2) : 1, hot ? ACC : MUT); }
    room(140, 350, 100, 48, { name: 'op', type: 'int', val: '2', vfs: 18, vcol: ACC, stroke: ACC, s: k === 5 ? pop(u, 1.4) : 1 });
    if (k === 6) { mono(260, 356, 'ops[op](10, 3)', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      fly(400, 350, 700, 270, seg(u, 0.8, 1.5), '10, 3', { mono: true }); fly(800, 270, 600, 356, seg(u, 1.7, 2.3), '30', { mono: true, fill: GOOD, stay: true });
      tx(480, 400, 'if/switch 사슬이 배열 인덱스 하나로 줄었다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); } }

  // ---------- 5. 연결 리스트 head 바꾸기 ----------
  function node(cx, cy, v, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('rect', { x: -60, y: -25, width: 120, height: 50, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.4, 'stroke-dasharray': o.dash }, g);
    el('line', { x1: -6, y1: -25, x2: -6, y2: 25, stroke: col, 'stroke-width': 2 }, g);
    mono(-33, 8, String(v), { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: col }, g); el('circle', { cx: 27, cy: 0, r: 5, fill: col }, g); }
  const nullMark = (x, y, op) => mono(x, y + 6, 'NULL', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: op ?? 1 });
  function s5(t, c) { const { k, u } = c, LY = 310, HX = 120;
    if (k === 0) { const s = pop(u, 0.2); const g = R.G(480, 170, 2 * s, 1);
      el('rect', { x: -60, y: -25, width: 120, height: 50, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 1.4 }, g); el('line', { x1: -6, y1: -25, x2: -6, y2: 25, stroke: INK, 'stroke-width': 1.2 }, g);
      el('circle', { cx: 27, cy: 0, r: 4, fill: ACC }, g);
      tx(414, 290, 'int v', { 'font-size': 16, 'font-weight': 800, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, 0.9) }); tx(414, 314, '노드가 담는 값', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      tx(560, 290, 'Node *next', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); tx(560, 314, '다음 노드의 주소', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      tx(480, 370, 'next가 NULL이면 마지막 노드다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    // head 칸 (main)
    zone(30, LY - 70, 190, 150, 'main', { stroke: GRID, sw: 2 });
    if (k <= 2) { // 일반형: 기존 첫 노드 앞에 끼우기
      const swung = k === 2 && u > 1.6;
      room(HX, LY + 10, 120, 50, { name: 'head', type: 'Node *', val: '●', vcol: ACC, stroke: ACC });
      node(640, LY + 10, '…', { col: MUT }); tx(640, LY + 62, '기존 첫 노드', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); arc(700, LY + 10, 800, LY + 10, 0, 1, MUT); nullMark(808, LY + 10, 0.8);
      zone(250, 30, 670, 160, 'push_front(Node **head, int v)', { stroke: ACC, sw: 2, fill: ACCBG, color: ACC });
      room(340, 110, 110, 48, { name: 'head', type: 'Node **', val: '&head', vfs: 15, vcol: ACC, stroke: ACC });
      arc(300, 134, HX + 30, LY - 16, 30, k === 1 ? seg(u, 0.3, 1.0) : 1, ACC);
      node(640, 110, 'v', { s: k === 1 ? pop(u, 1.2) : 1, col: ACC, fill: PANEL }); tx(560, 70, 'n = malloc', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 1 ? fade(u, 1.2) : 1 });
      const hx = HX + 60; // head 화살표: 기존 노드 → 새 노드
      if (!swung) arc(hx, LY + 10, 580, LY + 10, 0, 1, ACC); else arc(hx, LY + 4, 580, 120, 40, seg(u, 1.6, 2.3), ACC);
      if (k === 2) { arc(667, 110, 640, LY - 16, -30, seg(u, 0.3, 1.1), INK);
        mono(720, 220, '① n->next = *head', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) }); mono(720, 248, '② *head = n', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
        tx(480, 410, '순서를 바꾸면 기존 목록의 주소를 잃는다', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.3) }); }
      return; }
    // k3~k5: 실제 값 8, 3, 7
    const list = k === 3 ? (u < 1.0 ? [] : [8]) : k === 4 ? (u < 0.9 ? [8] : u < 1.9 ? [3, 8] : [7, 3, 8]) : [7, 3, 8];
    room(HX, LY + 10, 120, 50, { name: 'head', type: 'Node *', val: list.length ? '●' : 'NULL', vfs: list.length ? 20 : 16, vcol: list.length ? ACC : WARN, stroke: list.length ? ACC : WARN });
    const nx = (i, n) => 820 - (n - i) * 170;
    list.forEach((v, i) => { const x = nx(i, list.length), fresh = i === 0 && ((k === 3 && u < 1.6) || (k === 4 && ((u > 0.9 && u < 1.5) || u > 1.9 && u < 2.5)));
      node(x, LY + 10, v, { col: fresh ? ACC : INK, s: fresh ? pop(u, k === 3 ? 1.0 : u > 1.9 ? 1.9 : 0.9) : 1 });
      arc(x + 60, LY + 10, i === list.length - 1 ? 862 : nx(i + 1, list.length) - 62, LY + 10, 0, 1, MUT); });
    nullMark(868, LY + 10, 1);
    if (list.length) arc(HX + 60, LY + 10, nx(0, list.length) - 62, LY + 10, 0, 1, ACC);
    mono(260, 120, k === 3 ? 'Node *head = NULL;' : k === 4 ? 'push_front(&head, 3); push_front(&head, 7);' : 'for (p = head; p; p = p->next)', { 'font-size': 16, 'font-weight': 800 });
    if (k === 3) mono(260, 150, 'push_front(&head, 8);', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
    if (k === 3) tx(260, 184, '빈 리스트도 같은 코드로 처리된다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
    if (k === 4) tx(260, 150, '앞에 넣기는 순회 없이 head만 바꾼다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) });
    if (k === 5) { const s = seg(u, 0.2, 2.0), i = Math.min(2, Math.floor(s * 3)); if (s > 0 && s < 1) el('circle', { cx: nx(i, 3) - 33, cy: LY - 30, r: 8, fill: ACC });
      terminal(560, 90, 360, 100, ['$ ./list', [7, 3, 8].slice(0, s > 0 ? i + 1 : 0).join(' ')], 2, { title: 'list.c 실행', lh: 22 });
      tx(260, 150, '넣은 순서 8, 3, 7의 거꾸로 나온다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); } }

  const quiz = [
    { q: 'int **pp = &p일 때 *pp가 뜻하는 것은 무엇인가?',
      o: ['x의 값 42', 'p에 담긴 값, 곧 x의 주소 0x100', 'pp 자신의 주소 0x300'], a: 1,
      why: '*pp는 pp가 가리키는 칸, 곧 p다. p에는 x의 주소 0x100이 들어 있고, 한 번 더 따라간 **pp가 42다.' },
    { q: '함수가 호출자의 int *p에 새 malloc 주소를 넣어 주려면 무엇을 넘겨야 하는가?',
      o: ['p', '*p', '&p'], a: 2,
      why: 'p를 넘기면 복사본만 바뀌고 블록 주소는 잃는다. &p를 int **로 받아 *pp에 대입해야 원본 p가 바뀐다.' },
    { q: 'int (*fp)(int, int);에서 괄호를 빼 int *fp(int, int);로 쓰면 무엇이 되는가?',
      o: ['int*를 돌려주는 함수 선언', '같은 함수 포인터', 'int 배열을 가리키는 포인터'], a: 0,
      why: '괄호가 없으면 fp가 먼저 (int, int)와 묶여 함수가 되고, *는 반환 타입 int*에 붙는다. 그래서 add를 대입할 수 없다.' },
    { q: 'qsort에 넘긴 cmp_asc(&a, &b)가 음수를 돌려주면 무슨 뜻인가?',
      o: ['두 값이 같다', 'a를 b보다 앞에 둔다', '정렬을 멈춘다'], a: 1,
      why: '규약은 a가 앞이면 음수, 같으면 0, 뒤면 양수다. cmp(&2, &7) = -5이므로 2가 7 앞에 온다.' },
    { q: 'push_front가 Node *head가 아니라 Node **head를 받는 이유는 무엇인가?',
      o: ['head 변수 자체를 새 노드로 바꾸려고', '노드에 담긴 값을 바꾸려고', '리스트 길이를 세려고'], a: 0,
      why: '앞에 넣으면 시작점이 새 노드로 바뀐다. head의 주소를 받아야 *head = n으로 main의 head를 고칠 수 있다.' },
  ];

  const summary = [
    'int **pp는 포인터의 주소를 담는다. *pp는 p의 값이고 **pp는 최종 값 x다.',
    '함수에서 포인터 자체를 바꾸려면 그 포인터의 주소를 넘긴다. 아니면 원본은 그대로이고 누수가 난다.',
    '함수 이름은 코드의 주소다. int (*fp)(int, int)에 담아 실행 중에 바꿔 부를 수 있다.',
    'qsort의 비교 콜백과 함수 포인터 배열은 할 일을 데이터처럼 넘기는 방법이다.',
  ];
  const review = [
    { q: 'init_list(Node *head) 안에서 head = malloc(...)을 했는데 main의 head는 계속 NULL이다. 고칠 방법은?',
      o: ['malloc 대신 calloc을 쓴다', 'Node **head로 받고 *head에 대입한다', 'head를 const로 선언한다'], a: 1,
      why: '포인터도 값으로 복사된다. 호출자의 head를 바꾸려면 그 주소를 받아 *head = n처럼 써야 한다.' },
    { q: 'BinOp ops[] = { add, sub, mul };에서 ops[1](10, 3)의 결과는?',
      o: ['13', '30', '7'], a: 2,
      why: 'ops[1]은 sub를 가리킨다. 10 - 3 = 7이다. 30은 ops[2]인 mul의 결과다.' },
    { q: '설정 값으로 고른 함수 포인터 fp가 NULL인데 fp(3, 4)를 불렀다. 무슨 일이 생기나?',
      o: ['NULL 주소로 뛰어 프로그램이 죽는다', '0을 돌려주고 계속 간다', '컴파일 에러가 난다'], a: 0,
      why: '함수 포인터도 포인터라 NULL을 부르면 실행 중에 죽는다. 부르기 전에 if (fp)로 확인한다.' },
  ];

  R.page({ title: '이중 포인터와 함수 포인터', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
