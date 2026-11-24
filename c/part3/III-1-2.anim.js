/* III-1-2 malloc·free와 누수 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 힙 블록의 칸·바이트 수, 포인터 화살표, 소유권이 넘어가는 모습을 그린다. 함수 카드 상태와 버그 표는 페이지 STEPS의 apis · bugs를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, fly, dot, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 도우미 ----------
  function ptr(x1, y1, x2, y2, u, col, bend, o) { if (u <= 0) return; o = o || {};
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, b = bend || 0;
    const cx = mx - (dy / L) * b, cy = my + (dx / L) * b, n = 30, m = Math.max(1, Math.round(n * clamp(u))), pts = [];
    for (let i = 0; i <= m; i++) { const s = i / n; pts.push([(1 - s) * (1 - s) * x1 + 2 * (1 - s) * s * cx + s * s * x2, (1 - s) * (1 - s) * y1 + 2 * (1 - s) * s * cy + s * s * y2]); }
    el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || INK, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, opacity: o.op ?? 1,
      'marker-end': u >= 0.98 ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null });
    el('circle', { cx: x1, cy: y1, r: 4.5, fill: col || INK, opacity: o.op ?? 1 }); }
  function frameBox(x, y, w, h, name, vars, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 9, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    mono(x + 14, y + 24, name, { 'font-size': 15.5, 'font-weight': 800, fill: o.stroke || INK, opacity: op });
    (vars || []).forEach((v, j) => { const hot = o.hot && o.hot(v);
      mono(x + 14, y + 50 + j * 23, v, { 'font-size': 14.5, fill: hot ? ACC : INK, 'font-weight': hot ? 800 : 500, opacity: op }); }); }
  function nullSym(x, y, op) { const o = op ?? 1;
    el('line', { x1: x, y1: y - 12, x2: x, y2: y, stroke: MUT, 'stroke-width': 2.2, opacity: o });
    [16, 10, 4].forEach((w, i) => el('line', { x1: x - w, y1: y + i * 5, x2: x + w, y2: y + i * 5, stroke: MUT, 'stroke-width': 2.2, opacity: o }));
    mono(x + 22, y + 9, 'NULL', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: o }); }
  // int 칸 n 개짜리 힙 블록. vals[i]가 null이면 빈칸, '?'면 쓰레기값. st: live | dead | orphan | leak
  function intBlock(x, y, vals, o) { o = o || {}; const w = o.w || 62, h = o.h || 44, st = o.st || 'live', op = o.op ?? 1;
    const col = st === 'dead' ? GRID : st === 'orphan' ? WARN : st === 'leak' ? BAD : ACC, bg = st === 'dead' ? SOFT : st === 'orphan' ? WARNBG : st === 'leak' ? BADBG : ACCBG;
    vals.forEach((v, i) => { const s = o.s ? o.s(i) : 1; if (s <= 0) return; const cx = x + i * w;
      el('rect', { x: cx, y, width: w - 3, height: h, rx: 5, fill: bg, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': st === 'dead' ? '4 3' : null, opacity: op * s });
      for (let b = 1; b < 4; b++) el('line', { x1: cx + b * (w - 3) / 4, y1: y + h - 7, x2: cx + b * (w - 3) / 4, y2: y + h, stroke: col, 'stroke-width': 1, opacity: 0.6 * op * s });
      if (v != null && st !== 'dead') mono(cx + (w - 3) / 2, y + h / 2 + 5, String(v), { 'font-size': v === '?' ? 16 : 15, 'font-weight': 700, 'text-anchor': 'middle', fill: v === '?' ? WARN : (o.hot && o.hot(i)) ? ACC : INK, opacity: op * (o.vop ? o.vop(i) : 1) * s });
      if (o.index) mono(cx + (w - 3) / 2, y + h + 18, `[${i}]`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op * s }); }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function stackZone(x, y, w, h) { el('rect', { x, y, width: w, height: h, rx: 12, fill: SOFT }); tx(x + 14, y + 24, '스택', { 'font-size': 14, 'font-weight': 700, fill: MUT }); }
  function heapZone(x, y, w, h) { el('rect', { x, y, width: w, height: h, rx: 12, fill: SOFT }); tx(x + 14, y + 24, '힙', { 'font-size': 14, 'font-weight': 700, fill: MUT }); }

  // ---------- 1. 네 함수 ----------
  const API = [['malloc(n)', 'void*'], ['calloc(cnt, sz)', 'void*'], ['realloc(p, n)', 'void*'], ['free(p)', 'void']];
  function s1(t, c) { const { k, u } = c, apis = c.beat.apis || [];
    const on = [k >= 1 && k <= 4, k >= 3 && k <= 4, false, k === 5];
    API.forEach(([n, r], i) => { const x = 40 + i * 224, s = k === 0 ? pop(u, 0.3 + i * 0.3) : 1, called = apis[i] && /호출됨|채움|=/.test(apis[i].desc) && !/아직/.test(apis[i].desc);
      card(x + 102, 62, 204, 54, { rx: 10, stroke: on[i] || (k === 5) ? ACC : GRID, sw: on[i] ? 2.6 : 1.6, fill: on[i] ? ACCBG : PANEL, s });
      mono(x + 16, 58, n, { 'font-size': 15, 'font-weight': 800, opacity: s }); mono(x + 16, 80, '→ ' + r, { 'font-size': 13.5, fill: MUT, opacity: s }); });
    if (k === 0) { sub(480, 128, '#include <stdlib.h> 한 줄로 네 함수를 쓴다', fade(u, 1.6), { 'font-size': 15 });
      sub(480, 250, '아직 힙에는 아무것도 없다', fade(u, 2.0), { 'font-size': 15 }); heapZone(300, 150, 630, 240); stackZone(30, 150, 250, 240); return; }
    stackZone(30, 150, 250, 240); heapZone(300, 150, 630, 240);
    // 스택 변수 a, b
    card(150, 210, 180, 40, { rx: 6, text: 'int* a', fs: 15, mono: true, stroke: INK });
    if (k >= 3) card(150, 300, 180, 40, { rx: 6, text: 'int* b', fs: 15, mono: true, stroke: INK, s: k === 3 ? pop(u, 0.2) : 1 });
    const freed = k === 5 ? E(u, 0.3, 1.4) : 0;
    // 블록 a
    const aVals = k === 1 ? ['?', '?', '?', '?'] : [0, 1, 2, 3], aSt = freed > 0.5 ? 'dead' : 'live';
    intBlock(560, 186, aVals, { st: aSt, s: k === 1 ? (i) => pop(u, 0.3 + i * 0.12) : null, vop: k === 2 ? (i) => (u > 1.0 + i * 0.3 ? pop(u, 1.0 + i * 0.3, 0.4) : 0) : null, hot: (i) => k === 4 && i === 3, index: true });
    if (k === 2) for (let i = 0; i < 4; i++) { const f = u > 1.0 + i * 0.3 ? 0 : 1; if (f > 0) mono(560 + i * 62 + 29, 213, '?', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: f }); }
    mono(830, 213, k === 1 ? '16 B · 쓰레기값' : '16 B', { 'font-size': 14, fill: k === 1 ? WARN : MUT, 'font-weight': 700, opacity: freed > 0.5 ? 0 : 1 });
    ptr(240, 210, 556, 206, (k === 1 ? E(u, 0.6, 1.3) : 1) * (1 - freed), ACC, -24);
    if (k === 2) pill(420, 360, 'a == NULL ?  → 아니오', GOOD, pop(u, 0.3), { mono: true, fs: 14 });
    if (k === 1) sub(615, 370, '안의 값은 아직 아무도 채우지 않았다', fade(u, 1.6), { 'font-size': 15, fill: WARN, 'font-weight': 700 });
    // 블록 b
    if (k >= 3) { intBlock(560, 286, [0, 0, 0, 0], { st: aSt, s: k === 3 ? (i) => seg(u, 0.5 + i * 0.15, 0.8 + i * 0.15) : null, hot: (i) => k === 4 && i === 0 });
      mono(830, 313, '16 B', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: freed > 0.5 ? 0 : 1 });
      ptr(240, 300, 556, 306, (k === 3 ? E(u, 1.0, 1.6) : 1) * (1 - freed), ACC, 18); }
    if (k === 3) sub(615, 370, 'calloc은 0으로 채워서 준다', fade(u, 1.7), { 'font-size': 15, fill: ACC, 'font-weight': 700 });
    if (k === 4) { el('rect', { x: 300, y: 344, width: 630, height: 0, fill: 'none' });
      mono(615, 372, 'a[3]=3 b[0]=0', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) }); }
    if (k === 5) { pill(615, 372, '남은 블록 0개 · 누수 0 B', GOOD, pop(u, 1.6), { fs: 15 }); } }

  // ---------- 2. 소유권 ----------
  const CH = ['h', 'e', 'l', 'l', 'o', '\\0'];
  function key(x, y, s, col) { if (s <= 0) return; const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` });
    el('circle', { cx: -10, cy: 0, r: 9, fill: 'none', stroke: col || WARN, 'stroke-width': 3.5 }, g);
    el('path', { d: 'M-1,0 H18 M12,0 V7 M17,0 V6', fill: 'none', stroke: col || WARN, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g); }
  function chars(x, y, o) { o = o || {}; const w = 50;
    CH.forEach((ch, i) => { const s = o.s ? o.s(i) : 1, dead = o.dead, nul = i === 5;
      el('rect', { x: x + i * w, y, width: w - 3, height: 46, rx: 5, fill: dead ? SOFT : nul ? WARNBG : ACCBG, stroke: dead ? GRID : nul ? WARN : ACC, 'stroke-width': 1.8, 'stroke-dasharray': dead ? '4 3' : null });
      if (!dead && s > 0) mono(x + i * w + 23, y + 29, ch, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: nul ? WARN : INK, opacity: s }); }); }
  function s2(t, c) { const { k, u } = c;
    stackZone(30, 40, 360, 340); heapZone(420, 40, 510, 340);
    const bx = 520, by = 150;
    frameBox(50, 80, 320, 100, 'main()', [k >= 5 ? 'char* name = NULL' : k >= 3 ? 'char* name' : 'char* name  (대기)'], { hot: (v) => k === 5 && v.includes('NULL') });
    if (k <= 2) { const s = k === 2 ? E(u, 1.2, 2.0) : 0;
      frameBox(50 + 40 * s, 200, 320, 100, 'str_copy(s)', ['char* dst'], { op: 1 - s, stroke: k === 2 ? MUT : ACC, dash: k === 2 ? '6 4' : null }); }
    // 규칙 꼬리표
    const rs = k === 0 ? pop(u, 0.5) : 1;
    card(675, 82, 480, 40, { rx: 20, text: '규칙: 반환한 포인터는 호출자가 free', fs: 15, stroke: WARN, color: WARN, fill: PANEL, s: rs });
    if (k === 0) { sub(675, 230, '아직 할당은 없다', fade(u, 1.4), { 'font-size': 15 }); key(200, 250, pop(u, 1.0)); return; }
    // 블록: k1에 채워지고, k4 부터 반납
    const dead = k >= 4 && E(u, 0.3, 1.2) > 0.5 || k === 5;
    chars(bx, by, { s: k === 1 ? (i) => fade(u, 0.8 + i * 0.22) : null, dead });
    mono(bx, by - 14, 'strlen("hello") + 1 = 6 B', { 'font-size': 14, fill: MUT });
    if (k === 1) { el('rect', { x: bx + 250 - 3, y: by - 3, width: 53, height: 52, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 2.0) });
      tx(bx + 273, by + 78, '+1 = 널 자리', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }
    // 포인터와 열쇠
    if (k === 1) { ptr(250, 270, bx - 4, by + 23, E(u, 0.3, 0.8), ACC, -30); key(320, 228, 1); }
    if (k === 2) { const m = E(u, 0.2, 1.2); key(lerp(320, 320, m), lerp(228, 108, m), 1);
      ptr(250, 270, bx - 4, by + 23, 1 - E(u, 1.2, 1.8), ACC, -30); ptr(250, 150, bx - 4, by + 23, E(u, 1.3, 2.1), ACC, -20);
      tx(675, 260, 'return dst와 함께 해제 책임이 넘어간다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
    if (k === 3) { key(320, 108, 1); ptr(250, 150, bx - 4, by + 23, 1, ACC, -20); pill(675, 260, 'name == NULL ?  → 아니오', GOOD, pop(u, 0.4), { mono: true, fs: 14 });
      tx(675, 310, 'main이 쥔 열쇠 = free 할 의무', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k === 4) { key(320, 108, 1 - E(u, 0.3, 1.0)); ptr(250, 150, bx - 4, by + 23, 1, E(u, 0.3, 1.2) > 0.5 ? BAD : ACC, -20, { dash: E(u, 0.3, 1.2) > 0.5 ? '6 5' : null });
      pill(675, 260, 'malloc 1 : free 1', GOOD, pop(u, 1.2), { fs: 15 }); check(770, 260, 10, pop(u, 1.4));
      tx(675, 316, 'name 에는 반납된 블록의 옛 주소가 남았다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 5) { nullSym(290, 140, fade(u, 0.3));
      [['free(name) 한 번 더', 'free(NULL)은 무시된다'], ['name[0] 읽기', 'NULL 역참조라 바로 드러난다']].forEach(([a, b], i) => { const s = pop(u, 0.8 + i * 0.4);
        card(675, 262 + i * 60, 440, 48, { rx: 10, stroke: GOOD, sw: 2, s }); mono(475, 268 + i * 60, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.4) });
        tx(875, 268 + i * 60, b, { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.9 + i * 0.4) }); }); } }

  // ---------- 3. 누수 ----------
  const GX = 470, GY = 70, GC = 40, GS = 11;   // 1000칸 = 40 × 25
  function grid1000(n, col, op) { for (let i = 0; i < n; i++) el('rect', { x: GX + (i % GC) * GS, y: GY + Math.floor(i / GC) * GS, width: GS - 2, height: GS - 2, rx: 1.5, fill: col, opacity: op ?? 0.85 }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { stackZone(30, 40, 380, 340); heapZone(450, 40, 480, 340);
      const n = k === 0 ? Math.round(lerp(0, 120, E(u, 0.2, 2.4))) : Math.round(lerp(120, 1000, E(u, 0.1, 1.6)));
      grid1000(n, k === 1 ? BAD : ACC);
      const gone = k === 1 ? E(u, 1.6, 2.3) : 0;
      frameBox(50 + 40 * gone, 80, 340, 100, 'leaky()', [`int i = ${n}`, 'int* p'], { op: 1 - gone, stroke: gone > 0 ? MUT : ACC, dash: gone > 0 ? '6 4' : null });
      if (k === 0 && n > 0) { const i = n - 1; ptr(300, 152, GX + (i % GC) * GS + 4, GY + Math.floor(i / GC) * GS + 4, 1, ACC, -20); }
      mono(GX + 220, 364, k === 0 ? `블록 ${n}개` : `누수 ${(n * 1024).toLocaleString('en-US')} B`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 1 ? BAD : ACC });
      if (k === 0) sub(220, 250, '회차마다 malloc(1024)가 새 블록을 만든다', fade(u, 0.8), { 'font-size': 14.5 });
      if (k === 1) { tx(220, 250, 'free(p)가 빠졌다', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
        tx(220, 280, '함수가 끝나면 p도 사라진다', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
      return; }
    if (k <= 3) { stackZone(30, 40, 360, 340); heapZone(420, 40, 510, 340);
      frameBox(50, 90, 320, 76, 'lost()', [k === 3 ? 'char* p  (free 후)' : 'char* p']);
      const sw = k === 2 ? E(u, 1.0, 1.9) : 1, freed = k === 3 ? E(u, 0.3, 1.2) : 0;
      card(560, 110, 170, 56, { rx: 6, text: '100 B', fs: 16, mono: true, stroke: k === 3 ? BAD : sw > 0.9 ? WARN : ACC, fill: k === 3 ? BADBG : sw > 0.9 ? WARNBG : ACCBG, s: k === 2 ? pop(u, 0.2) : 1 });
      if (k === 3 || u > 0.8) card(660, 270, 300, 56, { rx: 6, text: freed > 0.6 ? '(반납)' : '200 B', fs: 16, mono: true, stroke: freed > 0.6 ? GRID : ACC, fill: freed > 0.6 ? SOFT : ACCBG, dash: freed > 0.6 ? '5 4' : null, color: freed > 0.6 ? MUT : INK, s: k === 2 ? pop(u, 0.8) : 1 });
      if (freed < 0.6) ptr(330, 150, lerp(470, 506, sw), lerp(118, 262, sw), k === 2 ? (sw > 0 ? 1 : E(u, 0.2, 0.7)) : 1, ACC, -24);
      if (k === 2) tx(560, 196, '앞 블록 주소를 아는 곳이 없다', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      if (k === 3) { pill(210, 260, 'free(p)', GOOD, pop(u, 0.2), { mono: true, fs: 15 });
        tx(560, 196, '누수 100 B', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
        tx(660, 350, '지금 p가 가리키는 200 B만 반납', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
      return; }
    // k4: valgrind가 합계를 짚는다
    const lines = ['$ gcc -g leak.c && valgrind --leak-check=full ./a.out', '==1234== definitely lost: 1,024,100 bytes in 1,001 blocks'];
    terminal(40, 40, 880, 120, lines, lerp(0, 2, E(u, 0.2, 1.4)), { title: 'leak.c 주석의 출력 예시', fs: 14.5 });
    const rows = [['leaky()', '1,000 × 1,024 B', '1,024,000 B', '1,000 블록'], ['lost()', '100 B 한 개', '100 B', '1 블록'], ['합계', '', '1,024,100 B', '1,001 블록']];
    rows.forEach(([a, b, cc, d], i) => { const y = 214 + i * 52, op = fade(u, 1.0 + i * 0.4), last = i === 2;
      if (last) el('line', { x1: 80, y1: y - 30, x2: 880, y2: y - 30, stroke: INK, 'stroke-width': 1.8, opacity: op });
      mono(90, y, a, { 'font-size': 16, 'font-weight': 800, opacity: op, fill: last ? BAD : INK }); mono(280, y, b, { 'font-size': 15, opacity: op, fill: MUT });
      mono(700, y, cc, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', opacity: op, fill: last ? BAD : INK }); mono(870, y, d, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end', opacity: op, fill: last ? BAD : INK }); });
    sub(480, 392, 'PID 1234는 예시다. 실제 보고에는 새는 malloc의 줄 번호까지 나온다', fade(u, 2.2), { 'font-size': 14 }); }

  // ---------- 4. realloc ----------
  const RX = 300, RW = 52, RY = 160, slot = (i) => RX + i * RW;
  function slots(n) { for (let i = 0; i < n; i++) el('rect', { x: slot(i), y: RY, width: RW - 3, height: 46, rx: 4, fill: 'none', stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '3 3' });
    for (let i = 0; i <= n; i += 4) mono(slot(i), RY - 10, `+${i * 4}`, { 'font-size': 13.5, fill: MUT }); }
  function s4(t, c) { const { k, u } = c;
    stackZone(30, 40, 240, 340); heapZone(285, 40, 645, 340); slots(12);
    card(150, 120, 190, 40, { rx: 6, text: 'int* arr', fs: 15, mono: true, stroke: INK });
    if (k >= 1 && k <= 3) card(150, 260, 190, 40, { rx: 6, text: k === 2 ? 'int* tmp = NULL' : 'int* tmp', fs: 15, mono: true, stroke: k === 2 ? MUT : INK, s: k === 1 ? pop(u, 0.2) : 1 });
    // 옆자리를 이미 다른 블록이 쓰고 있다 (예시 배치)
    card(slot(4) + 49, RY + 23, 101, 46, { rx: 5, text: '다른 블록', fs: 14, stroke: MUT, fill: OFF, color: INK });
    const oldDead = (k === 3 && E(u, 1.4, 2.2) > 0.5) || k === 4;
    intBlock(slot(0), RY, [0, 1, 2, 3], { w: RW, h: 46, st: oldDead ? 'dead' : 'live', s: k === 0 ? (i) => pop(u, 0.2 + i * 0.15) : null });
    if (k === 0) { mono(slot(0), RY + 76, '16 B', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); sub(slot(5), 300, '뒤 칸은 이미 다른 블록이 쓰고 있다 (예시 배치)', fade(u, 1.4), { 'font-size': 14.5 }); }
    // 새 자리 8칸: 옆이 막혀 있으니 다른 곳(아래 줄)에 32B를 잡는다
    const NX = slot(0), NY = RY + 120;
    if (k === 1 || k === 3 || k === 4) { const v = k === 1 ? [0, 1, 2, 3, null, null, null, null] : [0, 1, 2, 3, null, null, null, 77];
      intBlock(NX, NY, v, { w: RW, h: 46, st: k === 4 && E(u, 0.3, 1.2) > 0.5 ? 'dead' : 'live', s: k === 1 ? (i) => seg(u, 0.4 + i * 0.06, 0.7 + i * 0.06) : null,
        vop: k === 1 ? (i) => fade(u, 1.2 + i * 0.25) : null, hot: (i) => i === 7 });
      mono(NX, NY + 76, '32 B (새 자리)', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); }
    if (k === 1) { cross(slot(4) + 49, RY + 23, 12, pop(u, 0.3));
      for (let i = 0; i < 4; i++) fly(slot(i) + 24, RY + 23, NX + i * RW + 24, NY + 23, seg(u, 1.1 + i * 0.25, 1.7 + i * 0.25), String(i), { mono: true });
      ptr(240, 260, NX - 4, NY + 23, E(u, 1.8, 2.4), ACC, 10); }
    // arr 화살표
    const arrToNew = k === 3 ? E(u, 0.6, 1.4) : k === 4 ? 1 : 0;
    if (!(k === 4 && E(u, 0.3, 1.2) > 0.5)) ptr(240, 120, lerp(slot(0) - 4, NX - 4, arrToNew), lerp(RY + 23, NY + 23, arrToNew), 1, ACC, arrToNew > 0 ? 30 : -14);
    if (k === 2) { nullSym(270, 300, fade(u, 0.3));
      card(470, 330, 300, 62, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 0.7) }); tx(338, 324, 'tmp로 받았다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(338, 348, '원본 16B를 free 하고 return 1', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.8) });
      card(790, 330, 260, 62, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.3) }); mono(674, 324, 'arr = realloc(arr,…)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(674, 348, 'arr = NULL, 16B는 미아', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.4) }); }
    if (k === 3) { tx(slot(6), RY + 26, '옛 블록은 realloc이 free', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) });
      mono(780, NY + 76, '출력: 0 77', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); }
    if (k === 4) pill(620, 370, 'free(arr) 한 번 · 누수 0 B', GOOD, pop(u, 1.4), { fs: 15 }); }

  // ---------- 5. 안전 습관과 버그 표 ----------
  function s5(t, c) { const { k, u } = c, bugs = c.beat.bugs || [], pb = (c.prev && c.prev.bugs) || [];
    if (k === 4) { terminal(40, 40, 520, 186, ['$ valgrind --leak-check=full ./safe', 'All heap blocks were freed -- no leaks are possible', '$ gcc -g -fsanitize=address safe.c', '$ ./a.out'], lerp(0, 4, E(u, 0.2, 2.0)), { title: 'safe.c 주석의 검증 명령', fs: 13.5 });
      sub(300, 262, 'CI에 걸어 두면 사람이 놓친 것을 자동으로 잡는다', fade(u, 2.2), { 'font-size': 14.5 }); }
    else { stackZone(30, 40, 200, 220); heapZone(250, 40, 330, 220);
      card(130, 110, 160, 40, { rx: 6, text: k >= 2 ? 'p = NULL' : 'int* p', fs: 15, mono: true, stroke: k >= 2 ? GOOD : INK });
      const dead = k >= 1 && (k > 1 || E(u, 0.3, 1.2) > 0.5);
      for (let i = 0; i < 10; i++) { const x = 270 + (i % 5) * 60, y = 90 + Math.floor(i / 5) * 54, s = k === 0 ? pop(u, 0.2 + i * 0.06) : 1, gone = k >= 3;
        if (gone) continue;
        el('rect', { x, y, width: 54, height: 44, rx: 5, fill: dead ? SOFT : ACCBG, stroke: dead ? GRID : ACC, 'stroke-width': 1.8, 'stroke-dasharray': dead ? '4 3' : null, opacity: s }); }
      if (k < 3) mono(270, 222, dead ? '40 B (반납됨)' : '40 B = 10 × sizeof(int)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      if (k === 0) { ptr(205, 110, 266, 112, E(u, 0.8, 1.3), ACC, 0); pill(300, 296, 'p == NULL ?  → 아니오', GOOD, pop(u, 1.4), { mono: true, fs: 14 }); }
      if (k === 1) { ptr(205, 110, 266, 112, 1, dead ? BAD : ACC, 0, { dash: dead ? '5 4' : null }); tx(300, 300, 'p 에는 옛 주소가 그대로 남는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
      if (k === 2) { nullSym(130, 170, fade(u, 0.3)); const b = E(u, 1.0, 1.6), back = E(u, 1.6, 2.2);
        pill(lerp(120, 200, b) - lerp(0, 80, back), 300, 'free(p)', GOOD, 1, { mono: true, fs: 14 }); tx(300, 350, 'free(NULL)은 아무 일도 하지 않는다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
      if (k === 3) { tx(415, 150, '남은 힙 블록 0개', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
        mono(300, 320, 'return 0;', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); } }
    // 오른쪽: 버그 4종의 등
    tx(610, 56, '사고 4종', { 'font-size': 15, 'font-weight': 800, fill: MUT });
    bugs.forEach((r, i) => { const y = 92 + i * 76, ok = /^✔/.test(r.fix) || k === 4, was = pb[i] && /^✔/.test(pb[i].fix), turn = ok && !was && k < 4 ? E(u, 0.8, 1.4) : 1;
      const col = ok ? GOOD : WARN; el('rect', { x: 600, y: y - 20, width: 330, height: 64, rx: 10, fill: PANEL, stroke: ok ? GOOD : GRID, 'stroke-width': ok ? 2 : 1.5 });
      el('circle', { cx: 622, cy: y + 12, r: 9, fill: ok ? (turn < 1 ? WARN : GOOD) : WARN, opacity: 0.9 });
      tx(642, y + 4, r.name, { 'font-size': 15, 'font-weight': 800 }); tx(642, y + 28, r.fix.replace(/^✔\s*/, ''), { 'font-size': 13.5, fill: ok ? GOOD : MUT, 'font-weight': 600 }); }); }

  const quiz = [
    { q: 'malloc(4 * sizeof(int)) 직후 블록 안의 값은 무엇인가?',
      o: ['모두 0', '초기화되지 않은 쓰레기값', '0, 1, 2, 3'], a: 1,
      why: 'malloc은 16바이트를 잡아 주기만 하고 채우지 않는다. 0으로 채워 주는 쪽은 calloc이다.' },
    { q: 'str_copy가 return dst를 한 뒤 그 블록을 free할 책임은 누구에게 있는가?',
      o: ['str_copy 자신', '운영체제가 자동으로', '포인터를 받은 호출자 main'], a: 2,
      why: '주석에 적은 규칙대로 반환과 함께 해제 책임이 호출자에게 넘어간다. main이 free(name)을 불러 malloc 1 : free 1을 맞춘다.' },
    { q: 'leaky()의 루프가 1000번 돈 뒤 새는 메모리는 얼마인가?',
      o: ['1,024 B', '1,024,000 B', '0 B (함수가 끝나면 회수된다)'], a: 1,
      why: '회차마다 1,024B 블록을 잡고 free하지 않으므로 1,000 × 1,024 = 1,024,000B가 남는다. p가 사라져도 힙 블록은 회수되지 않는다.' },
    { q: 'p = realloc(p, n)이 위험한 이유는 무엇인가?',
      o: ['실패해 NULL이 오면 원본 주소를 잃어 누수가 된다', 'realloc은 항상 블록을 옮겨 느리기 때문이다', 'realloc은 옛 값을 복사하지 않기 때문이다'], a: 0,
      why: '실패하면 p에 NULL이 덮여 아직 살아 있는 원본 블록을 아무도 가리키지 않게 된다. tmp로 먼저 받고 성공할 때만 p = tmp 한다.' },
    { q: 'free(p) 직후 p = NULL을 하면 무엇이 달라지는가?',
      o: ['블록이 한 번 더 반납된다', '다시 free(p)를 해도 무시되고, 잘못 읽으면 바로 드러난다', '누수 검사 도구가 필요 없어진다'], a: 1,
      why: 'free(NULL)은 아무 일도 하지 않으므로 이중 free가 무해해진다. NULL 역참조는 조용히 넘어가지 않아 use-after-free가 숨지 못한다.' },
  ];

  const summary = [
    'malloc은 쓰레기값 그대로, calloc은 0으로 채워 준다. 둘 다 실패하면 NULL을 돌려준다.',
    'malloc 한 번에 free 한 번을 맞추고, 누가 free할지 주석이나 이름으로 정해 둔다.',
    'free를 빠뜨리거나 유일한 포인터를 덮어쓰면 그 블록은 끝까지 돌아오지 않는다.',
    'realloc 결과는 tmp로 받고, free 뒤에는 p = NULL로 지운 다음 valgrind로 확인한다.',
  ];
  const review = [
    { q: '배열을 키우려고 data = realloc(data, n)을 썼더니 메모리가 부족한 날에만 누수가 보고된다. 먼저 고칠 것은?',
      o: ['realloc 대신 malloc을 두 번 부른다', '결과를 tmp로 받아 NULL이 아닐 때만 data에 넣는다', 'n을 sizeof 없이 바이트 수로 넘긴다'], a: 1,
      why: '메모리가 모자라 realloc이 실패하면 data가 NULL로 덮여 원본 블록을 잃는다. tmp로 받으면 실패해도 원본을 free할 수 있다.' },
    { q: '문자열 복사 함수가 malloc한 버퍼를 돌려주는데, 호출하는 쪽 세 군데 중 한 곳만 free한다. 이 상태로 생기는 일은?',
      o: ['free하지 않은 두 곳에서 누수가 생긴다', '세 곳 모두 이중 free가 난다', '컴파일 오류가 난다'], a: 0,
      why: '반환 포인터의 해제 책임은 받은 쪽에 있다. 받은 곳마다 free 한 번씩 짝이 맞아야 하고, 빠진 곳은 그대로 샌다.' },
    { q: 'free(buf) 뒤에 실수로 buf[0]을 읽는 코드가 남아 있는데 테스트에서는 멀쩡히 돈다. 가장 알맞은 대응은?',
      o: ['buf 크기를 늘린다', 'free를 지운다', 'free 직후 buf = NULL로 지우고 ASan으로 돌려 본다'], a: 2,
      why: '반납된 블록을 읽어도 당장은 값이 남아 있어 티가 안 난다. NULL로 지우면 바로 드러나고, ASan은 use-after-free를 실행 중에 잡는다.' },
  ];

  R.page({ title: '힙 블록과 포인터', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
