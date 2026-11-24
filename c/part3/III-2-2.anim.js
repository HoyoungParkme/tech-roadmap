/* III-2-2 구조체와 메모리 정렬 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 구조체를 바이트 칸 줄로 그린다: 멤버 칸, 회색 패딩, 끝 패딩, 4바이트 경계. 칸 배치는 페이지 STEPS의 grid · compare를 읽는다.
 * 크기·오프셋·직렬화 바이트는 zig cc 0.17 (x86-64)로 실행해 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, fly, dot, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 도우미 ----------
  const TCOL = { char: ACC, int: INFO, short: GOOD, double: WARN };
  // 바이트 칸 줄: cells [{kind:'member'|'pad'|'tail', name, type}] → 같은 멤버는 한 덩어리로 이름을 적는다
  function bytes(x, y, w, cells, o) { o = o || {}; const h = o.h || 48;
    cells.forEach((c, i) => { const s = o.s ? o.s(i) : 1; if (s <= 0) return; const bx = x + i * w;
      const col = c.kind === 'member' ? (TCOL[c.type] || ACC) : c.kind === 'tail' ? BAD : MUT, bg = c.kind === 'member' ? PANEL : c.kind === 'tail' ? BADBG : SOFT;
      el('rect', { x: bx, y, width: w - 3, height: h, rx: 4, fill: bg, stroke: col, 'stroke-width': c.kind === 'member' ? 2 : 1.4, 'stroke-dasharray': c.kind === 'member' ? null : '4 3', opacity: s });
      if (c.kind === 'member') el('rect', { x: bx, y, width: w - 3, height: h, rx: 4, fill: col, opacity: 0.16 * s });
      if (o.hex) mono(bx + (w - 3) / 2, y + h / 2 + 5, o.hex[i], { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: o.hex[i] === '??' ? MUT : INK, opacity: s });
      if (o.index !== false) mono(bx + (w - 3) / 2, y + h + 17, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); });
    if (o.hex) return;
    let i = 0; while (i < cells.length) { let j = i; while (j + 1 < cells.length && cells[j + 1].kind === cells[i].kind && cells[j + 1].name === cells[i].name) j++;
      const c = cells[i], s = o.s ? o.s(i) : 1, cx = x + ((i + j + 1) / 2) * w - 1.5;
      if (s > 0) { const t = c.kind === 'member' ? (o.typeName ? `${c.type} ${c.name}` : c.name) : c.kind === 'tail' ? '끝 패딩' : '패딩';
        const fits = tw(t, 14) < (j - i + 1) * w - 6;
        tx(cx, y + h / 2 + 6, fits ? t : c.kind === 'member' ? c.name : '', { 'font-size': c.kind === 'member' ? 16 : 13.5, 'font-weight': c.kind === 'member' ? 800 : 600, 'text-anchor': 'middle', fill: c.kind === 'member' ? INK : c.kind === 'tail' ? BAD : MUT, opacity: s, class: c.kind === 'member' ? 'mono' : null,
          stroke: c.kind === 'member' ? PANEL : null, 'stroke-width': c.kind === 'member' ? 4 : null, 'paint-order': 'stroke' }); }
      i = j + 1; } }
  // 4바이트 경계선
  function words(x, y, w, n, h, op) { for (let i = 0; i <= n; i += 4) el('line', { x1: x + i * w - 1.5, y1: y - 10, x2: x + i * w - 1.5, y2: y + (h || 48) + 4, stroke: INK, 'stroke-width': 1.6, 'stroke-dasharray': '2 4', opacity: op ?? 0.6 }); }
  const M = (name, type) => ({ kind: 'member', name, type }), P = { kind: 'pad' }, T = { kind: 'tail' };
  const rep = (c, n) => Array(n).fill(c);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 구조체: 묶음과 . / -> ----------
  const PT = [...rep(M('x', 'int'), 4), ...rep(M('y', 'int'), 4), M('label', 'char'), ...rep(P, 3)];
  function s1(t, c) { const { k, u } = c, X = 200, W = 46, Y = 150;
    if (k === 5) { terminal(40, 40, 400, 150, ['$ ./point', '10 20', '10', '10'], lerp(1, 4, E(u, 0.2, 1.4)), { title: 'point.c 출력', fs: 15 });
      tx(500, 56, '중첩: 구조체가 구조체를 품는다', { 'font-size': 16, 'font-weight': 800 });
      const s = pop(u, 0.6); el('rect', { x: 500, y: 76, width: 420, height: 150, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: s });
      mono(516, 100, 'Rect', { 'font-size': 16, 'font-weight': 800, opacity: s });
      ['tl', 'br'].forEach((n, i) => { const s2 = pop(u, 1.0 + i * 0.3); card(610 + i * 200, 160, 180, 80, { rx: 10, stroke: INFO, s: s2 });
        mono(610 + i * 200, 150, `Point ${n}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: s2 });
        mono(610 + i * 200, 176, 'int x, y', { 'font-size': 14, 'text-anchor': 'middle', opacity: s2 }); });
      mono(710, 262, 'r.tl.x  ·  rp->br.y', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) });
      sub(480, 330, '문법은 여기까지. 다음은 이 칸들이 몇 번지에 놓이는가다', fade(u, 2.1), { 'font-size': 15.5, 'font-weight': 700, fill: INK });
      sub(480, 362, '위 그림의 label 뒤 회색 3칸이 그 실마리다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    mono(X, Y - 46, k === 0 ? 'typedef struct { int x; int y; char label; } Point;' : 'Point p = { 10, 20, \'A\' };', { 'font-size': 15, 'font-weight': 700 });
    if (k === 0) { bytes(X, Y, W, PT, { s: (i) => 0.35 * pop(u, 0.3 + (i < 4 ? 0 : i < 8 ? 0.3 : i === 8 ? 0.6 : 0.9)) });
      sub(X + 6 * W, Y + 100, '타입을 정의했을 뿐, 아직 메모리는 잡히지 않았다', fade(u, 1.5), { 'font-size': 15 }); return; }
    bytes(X, Y, W, PT);
    // 값
    const lab = k >= 4 && u > 1.0 ? "'B'" : "'A'";
    [[2, '10', 0.3], [6, '20', 0.6], [8.5, lab, 0.9]].forEach(([at, v, d], i) => { const op = k === 1 ? fade(u, d) : 1;
      mono(X + at * W - 1.5, Y - 12, v, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 2 && k === 4 && u > 1.0 ? WARN : INK, opacity: op }); });
    tx(X + 10.5 * W, Y - 12, 'sizeof = 12', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    mono(X, Y + 96, 'p  (구조체 변수 = 값 자체)', { 'font-size': 14.5, fill: MUT });
    // ptr
    const ps = k === 1 ? pop(u, 1.4) : 1; card(110, 330, 170, 44, { rx: 6, text: 'Point* ptr = &p', fs: 14, mono: true, stroke: INK, s: ps });
    if (ps > 0.9) el('path', { d: `M110,308 C110,250 ${X - 30},${Y + 30} ${X - 4},${Y + 24}`, fill: 'none', stroke: INK, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ah)' });
    if (k === 2) { el('rect', { x: X - 4, y: Y - 4, width: 8 * W + 5, height: 56, rx: 7, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.3) });
      mono(560, 330, 'p.x, p.y  →  10 20', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
      sub(560, 366, 'p는 값이므로 점(.)으로 바로 멤버를 고른다', fade(u, 1.4), { 'font-size': 15 }); }
    if (k === 3) { dot([[110, 308], [110, 250], [X - 4, Y + 24], [X + 2 * W, Y + 24]], seg(u, 0.2, 1.3), ACC, 8);
      el('rect', { x: X - 4, y: Y - 4, width: 4 * W + 5, height: 56, rx: 7, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 1.3) });
      mono(560, 330, 'ptr->x  ≡  (*ptr).x  →  10', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      sub(560, 366, '주소를 따라간 다음 멤버를 고른다. *ptr.x는 괄호가 없어 오류다', fade(u, 1.9), { 'font-size': 15 }); }
    if (k === 4) { const lx = X + 8 * W; el('rect', { x: lx - 4, y: Y - 4, width: W + 5, height: 56, rx: 7, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 0.6) });
      mono(560, 330, "p.label = 'B';", { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3) });
      dot([[110, 308], [110, 250], [X - 4, Y + 24], [lx + 20, Y + 24]], seg(u, 1.4, 2.3), ACC, 7);
      sub(560, 366, 'ptr->label로 읽어도 B다. 같은 메모리를 본다', fade(u, 2.2), { 'font-size': 15 }); } }

  // ---------- 2. 정렬: 놓일 수 있는 주소 ----------
  function s2(t, c) { const { k, u } = c, X = 150, W = 64, Y = 140, g = c.beat.grid || {};
    if (k === 1) { const rules = c.beat.alignRules || [];
      tx(40, 56, '타입별로 시작할 수 있는 주소 (0 ~ 15번지)', { 'font-size': 16, 'font-weight': 800 });
      for (let a = 0; a < 16; a++) mono(220 + a * 42, 86, String(a), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      rules.forEach((r, i) => { const y = 124 + i * 62, op = fade(u, 0.2 + i * 0.35), col = TCOL[r.type] || ACC;
        mono(40, y + 6, `${r.type}`, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: op });
        mono(120, y + 6, `align ${r.size}`, { 'font-size': 14, fill: MUT, opacity: op });
        for (let a = 0; a < 16; a++) { const ok = a % r.size === 0, s = seg(u, 0.3 + i * 0.35 + a * 0.02, 0.5 + i * 0.35 + a * 0.02);
          el('circle', { cx: 220 + a * 42, cy: y, r: ok ? 9 : 4, fill: ok ? col : GRID, opacity: s }); } });
      sub(480, 390, 'alignof 값의 배수 주소에만 놓일 수 있다', fade(u, 2.0), { 'font-size': 15.5, 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { // 어긋난 int는 두 번 읽는다
      const cells = [M('a', 'char'), P, P, ...rep(M('b', 'int'), 4), P];
      tx(40, 56, '만약 b가 3번지에 걸치면', { 'font-size': 16, 'font-weight': 800 });
      words(X, Y, W, 8); bytes(X, Y, W, cells.map((c2, i) => (i >= 3 && i <= 6 ? M('b', 'int') : i === 0 ? M('a', 'char') : P)));
      [[0, 0.3], [4, 1.0]].forEach(([a, d]) => { const s = fade(u, d);
        el('rect', { x: X + a * W - 6, y: Y - 22, width: 4 * W + 6, height: 92, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: s });
        tx(X + (a + 2) * W, Y + 104, a === 0 ? '1번째 읽기' : '2번째 읽기', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: s }); });
      sub(480, 320, 'CPU는 4바이트 단위로 읽는다. 조각 두 개를 이어붙여야 한다', fade(u, 1.7), { 'font-size': 15 });
      sub(480, 352, '아키텍처에 따라서는 하드웨어 예외로 죽는다', fade(u, 2.1), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    tx(40, 56, g.caption || '', { 'font-size': 16, 'font-weight': 800 });
    const cells = g.cells || [];
    words(X, Y, W, 8);
    if (k !== 3) tx(X + 4 * W, Y - 24, '4바이트 경계', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    if (k === 0) { bytes(X, Y, W, cells, { s: (i) => pop(u, 0.2 + i * 0.15) });
      el('rect', { x: X + W - 4, y: Y - 4, width: 4 * W + 5, height: 56, rx: 7, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 1.4) });
      tx(X + 3 * W, Y + 100, 'b가 1번지에서 시작해 경계를 넘는다', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 2) { // b가 1 → 4로 밀린다
      const m = E(u, 0.4, 1.4);
      bytes(X, Y, W, [cells[0]]);
      for (let i = 1; i <= 3; i++) { const s = seg(u, 1.0 + i * 0.15, 1.4 + i * 0.15); if (s > 0) bytes(X + i * W, Y, W, [P], { s: () => s, index: false }); }
      bytes(X + lerp(1, 4, m) * W, Y, W, rep(M('b', 'int'), 4), { index: false });
      for (let i = 1; i < 8; i++) mono(X + i * W + (W - 3) / 2, Y + 65, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      tx(X + 2 * W, Y + 104, '컴파일러가 몰래 넣은 3바이트', { 'font-size': 15, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      mono(X + 8 * W + 20, Y + 30, '5 → 8 B', { 'font-size': 18, 'font-weight': 800, fill: INK, opacity: fade(u, 2.0) }); return; }
    // k3: 오프셋 실측
    bytes(X, Y, W, cells);
    [[0, 'a @ 0', ACC], [4, 'b @ 4', INFO]].forEach(([a, s, col], i) => { const op = fade(u, 0.3 + i * 0.5);
      el('line', { x1: X + a * W, y1: Y + 92, x2: X + a * W, y2: Y + 62, stroke: col, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ah)', opacity: op });
      pill(X + a * W + 20, Y + 118, s, col, op, { mono: true, fs: 15 }); });
    el('path', { d: `M${X},${Y - 16} v-8 H${X + 4 * W - 3} v8`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.3) });
    mono(X + 2 * W, Y - 32, '거리 4 = 패딩의 증거', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    mono(480, 360, '(char*)&m.b - (char*)&m  →  4', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); }

  // ---------- 3. sizeof = 멤버 + 중간 패딩 + 끝 패딩 ----------
  function s3(t, c) { const { k, u } = c, X = 110, W = 62, Y = 120, g = c.beat.grid || {}, pg = (c.prev && c.prev.grid) || {}, cells = g.cells || [], pn = (pg.cells || []).length;
    if (k === 5) { // 배열: 끝 패딩이 있어야 arr[1].b가 4의 배수
      const one = [M('a', 'char'), P, P, P, ...rep(M('b', 'int'), 4), ...rep(M('c', 'short'), 2), T, T], w = 34, x = 64;
      tx(40, 52, 'struct Mixed arr[2];  sizeof(arr) = 24', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      bytes(x, 90, w, [...one, ...one].map((c2) => c2), { h: 40, s: (i) => fade(u, 0.2 + i * 0.03) });
      words(x, 90, w, 24, 40, 0.4);
      ['arr[0]', 'arr[1]'].forEach((s, i) => mono(x + (i * 12 + 6) * w, 80, s, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: INK }));
      mono(x + 16 * w, 168, 'arr[1].b @ 16 ✓', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.0) });
      // 끝 패딩이 없다면
      const op = fade(u, 1.5), noTail = [M('a', 'char'), P, P, P, ...rep(M('b', 'int'), 4), ...rep(M('c', 'short'), 2)];
      tx(40, 236, '끝 패딩이 없다면 (10바이트씩)', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: op });
      bytes(x, 256, w, [...noTail, ...noTail], { h: 40, s: () => op });
      words(x, 256, w, 20, 40, 0.4 * op);
      el('rect', { x: x + 14 * w - 3, y: 252, width: 4 * w + 3, height: 48, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 2.0) });
      mono(x + 16 * w, 334, 'arr[1].b @ 14 — 4의 배수가 아니다', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.1) }); return; }
    if (k === 4) { const parts = [['멤버', 7, ACC], ['중간 패딩', 3, MUT], ['끝 패딩', 2, BAD]], sc = 52;
      tx(40, 60, 'sizeof(struct Mixed) = 12', { 'font-size': 18, 'font-weight': 800, class: 'mono' });
      let x = 120; parts.forEach(([s, n, col], i) => { const g2 = E(u, 0.3 + i * 0.4, 0.9 + i * 0.4);
        el('rect', { x, y: 140, width: n * sc * g2, height: 56, rx: 6, fill: col, opacity: 0.75 });
        tx(x + n * sc / 2, 128, `${s} ${n}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.6 + i * 0.4) }); x += n * sc; });
      mono(120 + 12 * sc + 14, 176, '= 12', { 'font-size': 22, 'font-weight': 800, opacity: fade(u, 1.8) });
      mono(120, 260, '1 + 4 + 2 = 7', { 'font-size': 18, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.9), 'text-decoration': 'line-through' });
      sub(480, 330, '손으로 센 값과 sizeof가 다르면 거의 항상 패딩을 빠뜨린 것이다', fade(u, 2.2), { 'font-size': 15 }); return; }
    mono(40, 56, 'struct Mixed { char a; int b; short c; };', { 'font-size': 15, 'font-weight': 700 });
    for (let i = 0; i < 12; i++) el('rect', { x: X + i * W, y: Y, width: W - 3, height: 48, rx: 4, fill: 'none', stroke: GRID, 'stroke-dasharray': '3 3' });
    words(X, Y, W, 12);
    bytes(X, Y, W, cells, { s: (i) => (i >= pn ? seg(u, 0.3 + (i - pn) * 0.25, 0.6 + (i - pn) * 0.25) : 1), typeName: true });
    const run = tween(pn || 0, cells.length, c.u, 1.6);
    mono(X + 12 * W - 3, Y + 110, `누적 ${Math.round(run)} B`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'end', fill: k === 3 ? BAD : INK });
    const rows = (c.beat.calc && c.beat.calc.rows) || [], last = rows[rows.length - 1];
    if (last) { tx(X, Y + 110, `${last.label} · ${last.detail}`, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) }); }
    if (k === 3) { el('line', { x1: X, y1: Y + 150, x2: X + 12 * W - 3, y2: Y + 150, stroke: BAD, 'stroke-width': 2.2, opacity: fade(u, 1.2) });
      sub(480, Y + 180, '전체 크기는 가장 큰 정렬(int의 4)의 배수로 올림', fade(u, 1.4), { 'font-size': 15.5, 'font-weight': 700, fill: BAD }); }
    if (k === 2) sub(480, Y + 180, '8번지는 이미 2의 배수라 패딩 없이 붙는다', fade(u, 1.4), { 'font-size': 15 });
    if (k === 1) sub(480, Y + 180, 'int는 4의 배수 주소에서만 시작한다', fade(u, 1.4), { 'font-size': 15 });
    if (k === 0) sub(480, Y + 180, '첫 멤버의 오프셋은 언제나 0', fade(u, 1.0), { 'font-size': 15 }); }

  // ---------- 4. 멤버 순서 ----------
  function s4(t, c) { const { k, u } = c, X = 290, W = 50, cmp = c.beat.compare || {}, pc = (c.prev && c.prev.compare) || {};
    if (k === 5) { tx(480, 52, '크기 내림차순으로 선언한다', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      [['double', 8, WARN], ['int', 4, INFO], ['short', 2, GOOD], ['char', 1, ACC]].forEach(([n, sz, col], i) => { const s = E(u, 0.2 + i * 0.3, 0.7 + i * 0.3), y = 90 + i * 54;
        mono(220, y + 26, n, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: s });
        el('rect', { x: 240, y, width: sz * 52 * s, height: 38, rx: 5, fill: col, opacity: 0.7 }); mono(240 + sz * 52 + 10, y + 26, `${sz} B`, { 'font-size': 15, 'font-weight': 700, opacity: s }); });
      tx(480, 330, 'C는 멤버 순서를 바꾸지 않는다. 순서는 개발자 몫이다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(480, 362, '1,000만 개 배열이면 원소당 4B 차이가 40MB가 된다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    const rowOf = (key, y, col) => { const r = cmp[key] || {}, pr = pc[key] || {}, cells = r.cells || [], pn = (pr.cells || []).length;
      tx(40, y + 22, key === 'bad' ? '나쁜 순서' : '좋은 순서', { 'font-size': 16, 'font-weight': 800, fill: col });
      mono(40, y + 46, key === 'bad' ? '{ char; int; char; }' : '{ int; char; char; }', { 'font-size': 13.5, fill: MUT });
      for (let i = 0; i < 12; i++) el('rect', { x: X + i * W, y, width: W - 3, height: 48, rx: 4, fill: 'none', stroke: GRID, 'stroke-dasharray': '3 3' });
      words(X, y, W, 12, 48, 0.4);
      bytes(X, y, W, cells, { s: (i) => (i >= pn ? seg(u, 0.3 + (i - pn) * 0.2, 0.6 + (i - pn) * 0.2) : 1) });
      const sz = r.size; mono(X + 12 * W + 10, y + 32, sz === '?' || sz == null ? '?' : `${Math.round(tween(pr.size === '?' ? 0 : pr.size, sz, u))} B`, { 'font-size': 20, 'font-weight': 800, fill: col }); };
    rowOf('bad', 80, BAD); rowOf('good', 220, GOOD);
    if (k === 4) { banner(480, 360, 'sizeof  Bad = 12  ·  Good = 8  ·  33% 절약', pop(u, 0.5)); }
    else if (k === 1) sub(480, 360, '실제 데이터는 6바이트인데 12바이트를 쓴다', fade(u, 1.8), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
    else if (k === 3) sub(480, 360, '중간 패딩이 사라지고 끝 패딩 2바이트만 남는다', fade(u, 1.8), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); }

  // ---------- 5. pack과 직렬화 ----------
  const NORMAL = [M('a', 'char'), P, P, P, ...rep(M('b', 'int'), 4)], PACKED = [M('a', 'char'), ...rep(M('b', 'int'), 4)];
  function s5(t, c) { const { k, u } = c, X = 260, W = 60;
    if (k <= 2) { tx(40, 92, 'Normal', { 'font-size': 17, 'font-weight': 800 }); mono(40, 116, '{ char a; int b; }', { 'font-size': 13.5, fill: MUT });
      words(X, 70, W, 8); bytes(X, 70, W, NORMAL, { s: k === 0 ? (i) => pop(u, 0.2 + i * 0.1) : null });
      mono(X + 8 * W + 14, 102, '8 B', { 'font-size': 20, 'font-weight': 800 });
      if (k === 0) { sub(480, 230, '패딩 3바이트 덕분에 b를 한 번에 읽는다', fade(u, 1.4), { 'font-size': 15.5, 'font-weight': 700, fill: INK }); return; }
      tx(40, 232, 'Packed', { 'font-size': 17, 'font-weight': 800, fill: WARN }); mono(40, 256, '#pragma pack(push, 1)', { 'font-size': 13.5, fill: MUT });
      words(X, 210, W, 8); bytes(X, 210, W, PACKED, { s: k === 1 ? (i) => pop(u, 0.4 + i * 0.12) : null });
      mono(X + 5 * W + 14, 242, '5 B', { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: k === 1 ? fade(u, 1.2) : 1 });
      el('rect', { x: X + W - 4, y: 206, width: 4 * W + 5, height: 56, rx: 7, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: k === 1 ? fade(u, 1.5) : 1 });
      if (k === 1) { sub(X + 3 * W, 300, 'b가 1번지에서 4바이트 경계를 넘는다', fade(u, 1.7), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
      mono(480, 316, 'Normal=8 Packed=5', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      [['x86', '두 번 읽어 느려진다', WARN], ['ARM 등', '정렬 예외 SIGBUS로 죽을 수 있다', BAD]].forEach(([a, b, col], i) => {
        tx(240 + i * 330, 362, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.4) }); tx(240 + i * 330, 388, b, { 'font-size': 14.5, opacity: fade(u, 1.0 + i * 0.4) }); });
      return; }
    if (k === 3) { // 통째로 보내면 패딩까지 나간다
      const hx = ['41', '??', '??', '??', '2C', '01', '00', '00'];
      tx(40, 60, '보내는 쪽: fwrite(&n, sizeof(n), 1, fp)', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      bytes(150, 84, 58, NORMAL, { hex: hx });
      const sent = E(u, 0.4, 1.6);
      for (let i = 0; i < 8; i++) { const f = clamp(sent * 8 - i); if (f > 0 && f < 1) mono(150 + i * 58 + 28, lerp(150, 260, f), hx[i], { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: hx[i] === '??' ? MUT : ACC }); }
      tx(40, 274, '받는 쪽이 5바이트 규격이라면', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
      bytes(150, 290, 58, PACKED, { hex: hx.slice(0, 5), s: () => fade(u, 1.6) });
      mono(150 + 5 * 58 + 20, 322, 'b = ?? ?? ?? 2C → 값이 깨진다', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      tx(640, 114, '패딩 3B(??)도 함께 나간다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) }); return; }
    if (k === 4) { // 멤버별로 직렬화
      tx(40, 60, 'struct Normal n = { \'A\', 300 };   메모리 8 B', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      const hx = ['41', '??', '??', '??', '2C', '01', '00', '00'];
      bytes(150, 84, 58, NORMAL, { hex: hx });
      tx(40, 254, 'unsigned char buf[5]', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      const out = ['41', '2C', '01', '00', '00'], got = (i) => (u > (i === 0 ? 0.9 : 1.5 + i * 0.1) ? 1 : 0);
      for (let i = 0; i < 5; i++) { const gx = 150 + i * 58; el('rect', { x: gx, y: 270, width: 55, height: 48, rx: 4, fill: got(i) ? ACCBG : PANEL, stroke: got(i) ? ACC : GRID, 'stroke-width': 1.8 });
        if (got(i)) mono(gx + 27, 300, out[i], { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' }); }
      fly(150 + 27, 178, 150 + 27, 294, seg(u, 0.3, 0.9), 'a', { mono: true });
      fly(150 + 6 * 58, 178, 150 + 3 * 58, 294, seg(u, 1.0, 1.6), 'b 4B', { mono: true });
      mono(560, 300, '300 = 0x12C, 리틀 엔디안', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
      sub(480, 380, '"serialized 5 bytes" — 패딩이 끼어들 틈이 없다', fade(u, 2.1), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    // k5: 원칙 + 캐시 라인
    tx(480, 50, '일반 목적이면 정렬을 지키고, 보낼 때만 멤버별로', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
    [['정렬 유지', '메모리 안에서는 패딩을 그대로 둔다', GOOD], ['멤버별 직렬화', '전송 형식은 규격 순서·크기로', GOOD], ['packed는 규격 매핑에만', '네트워크 패킷·파일 포맷', WARN]].forEach(([a, b, col], i) => { const s = pop(u, 0.3 + i * 0.3);
      card(170 + i * 310, 116, 290, 64, { rx: 10, stroke: col, sw: 2, s }); tx(170 + i * 310, 110, a, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.4 + i * 0.3) });
      tx(170 + i * 310, 134, b, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.3) }); });
    const lx = 80, lw = 400;   // 캐시 라인 64B 두 줄
    tx(lx, 222, '캐시 라인 64B', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.2) });
    [0, 1].forEach((i) => el('rect', { x: lx + i * lw, y: 240, width: lw - 4, height: 44, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.6, opacity: fade(u, 1.2) }));
    const sx = lx + lw - 70; el('rect', { x: sx, y: 248, width: 130, height: 28, rx: 5, fill: BAD, opacity: 0.75 * fade(u, 1.6) });
    tx(sx + 65, 312, '경계에 걸친 구조체 → 두 줄을 읽는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    sub(480, 370, '자주 함께 쓰는 멤버는 가까이 모은다', fade(u, 2.2), { 'font-size': 15 }); }

  const quiz = [
    { q: 'ptr이 Point p를 가리킬 때 ptr->x와 같은 식은 무엇인가?',
      o: ['*ptr.x', '(*ptr).x', 'ptr.x'], a: 1,
      why: '->는 주소를 따라간 뒤 멤버를 고르는 축약이다. *ptr.x는 *(ptr.x)로 묶여 오류가 난다.' },
    { q: 'struct { char a; int b; }에서 b는 몇 번지에서 시작하는가?',
      o: ['1번지', '4번지', '8번지'], a: 1,
      why: 'alignof(int)가 4라 b는 4의 배수 주소에 놓인다. 컴파일러가 1~3번지에 패딩 3바이트를 넣는다.' },
    { q: 'struct Mixed { char a; int b; short c; }의 sizeof는 얼마인가?',
      o: ['7', '10', '12'], a: 2,
      why: '멤버 7바이트에 중간 패딩 3, 끝 패딩 2가 붙는다. 전체를 int 정렬 4의 배수로 올려 12가 된다.' },
    { q: '{ char x; int y; char z; }를 { int y; char x; char z; }로 바꾸면 크기는 어떻게 되는가?',
      o: ['12에서 8로 준다', '그대로 12다', '12에서 6으로 준다'], a: 0,
      why: 'int를 0번지에 두면 char 둘이 4, 5번지에 빈틈없이 붙고 끝 패딩 2만 남는다. 전체는 정렬 4의 배수로 올려야 해서 6이 아니라 8이다.' },
    { q: '구조체를 파일에 저장할 때 안전한 방법은 무엇인가?',
      o: ['fwrite(&n, sizeof(n), 1, fp)로 통째로 쓴다', '모든 구조체에 #pragma pack(1)을 건다', '멤버를 정해진 순서와 크기로 하나씩 버퍼에 옮겨 쓴다'], a: 2,
      why: '통째로 쓰면 환경마다 다른 패딩까지 나간다. 멤버별로 옮기면 buf[5] = 41 2C 01 00 00처럼 규격대로 5바이트만 나간다.' },
  ];

  const summary = [
    '구조체 변수는 점(.)으로, 구조체 포인터는 ->로 멤버를 읽는다.',
    'int는 4의 배수 주소에 놓여야 해서 char 뒤에 패딩 3바이트가 끼어든다.',
    'sizeof는 끝 패딩까지 더해 가장 큰 정렬의 배수가 되므로 Mixed는 7이 아니라 12다.',
    '큰 멤버부터 선언하면 12가 8로 줄고, 파일이나 소켓에는 멤버별로 직렬화한다.',
  ];
  const review = [
    { q: '센서 기록 구조체 { char id; double v; char flag; }를 1,000만 개 들고 있다. 메모리를 줄이려면 먼저 할 일은?',
      o: ['double v를 맨 앞으로 옮겨 큰 멤버부터 선언한다', '#pragma pack(1)을 모든 곳에 건다', 'char를 int로 바꾼다'], a: 0,
      why: '작은 멤버 사이에 큰 멤버가 끼면 양쪽에 패딩이 생긴다. 크기 내림차순으로 두면 패딩이 줄고, pack은 어긋난 접근의 대가를 치른다.' },
    { q: 'x86 서버가 보낸 구조체를 ARM 기기가 받았더니 필드 값이 엉망이다. 보낸 쪽은 fwrite로 구조체를 통째로 썼다. 원인으로 가장 그럴듯한 것은?',
      o: ['ARM은 char를 읽지 못한다', '패딩 위치와 크기가 두 환경에서 달라 필드가 어긋났다', 'fwrite가 바이트 순서를 자동으로 바꿨다'], a: 1,
      why: '통째 전송은 그 환경의 패딩까지 함께 나간다. 멤버별로 정해진 순서·크기로 직렬화해야 받는 쪽과 배치가 맞는다.' },
    { q: '손으로 센 구조체 크기가 10인데 sizeof는 12가 나왔다. 무엇을 빠뜨렸나?',
      o: ['중간 패딩', '포인터 크기', '끝 패딩'], a: 2,
      why: '멤버와 중간 패딩까지 세면 10이다. 배열 다음 원소도 정렬되도록 전체를 4의 배수로 올리는 끝 패딩 2바이트가 더 붙는다.' },
  ];

  R.page({ title: '구조체의 바이트 배치', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
