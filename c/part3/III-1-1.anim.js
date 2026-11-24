/* III-1-1 스택 vs 힙 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 스택 프레임·힙 블록·포인터 화살표를 그린다. 프레임 목록과 비교표·실패 목록은 페이지 STEPS의 frames · compare · decide · fails를 읽는다.
 * 주소값은 실행마다·OS마다 달라지므로 그림에 적은 주소는 모두 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, fly, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 도우미 ----------
  // 포인터 화살표: (x1,y1)에서 (x2,y2)로, u 만큼 자란다. bend는 휘는 정도
  function ptr(x1, y1, x2, y2, u, col, bend, o) { if (u <= 0) return; o = o || {};
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, b = bend || 0;
    const cx = mx - (dy / L) * b, cy = my + (dx / L) * b, n = 30, m = Math.max(1, Math.round(n * clamp(u))), pts = [];
    for (let i = 0; i <= m; i++) { const s = i / n; pts.push([(1 - s) * (1 - s) * x1 + 2 * (1 - s) * s * cx + s * s * x2, (1 - s) * (1 - s) * y1 + 2 * (1 - s) * s * cy + s * s * y2]); }
    el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || INK, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, opacity: o.op ?? 1,
      'marker-end': u >= 0.98 ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null });
    el('circle', { cx: x1, cy: y1, r: 4.5, fill: col || INK, opacity: o.op ?? 1 }); }
  // 스택 프레임 상자: 이름 + 변수 두 칸씩
  function frameBox(x, y, w, h, name, vars, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 9, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    mono(x + 14, y + 24, name, { 'font-size': 15.5, 'font-weight': 800, fill: o.stroke || INK, opacity: op });
    (vars || []).forEach((v, j) => { const hot = o.hot && o.hot(v);
      mono(x + 14 + (j % 2) * (o.colw || 160), y + 50 + Math.floor(j / 2) * 23, v, { 'font-size': 14.5, fill: hot ? ACC : INK, 'font-weight': hot ? 800 : 500, opacity: op }); }); }
  // NULL 접지 기호
  function nullSym(x, y, op) { const o = op ?? 1;
    el('line', { x1: x, y1: y - 12, x2: x, y2: y, stroke: MUT, 'stroke-width': 2.2, opacity: o });
    [16, 10, 4].forEach((w, i) => el('line', { x1: x - w, y1: y + i * 5, x2: x + w, y2: y + i * 5, stroke: MUT, 'stroke-width': 2.2, opacity: o }));
    mono(x + 22, y + 9, 'NULL', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: o }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 스택 프레임 push / pop ----------
  const SX = 60, SW = 340, FY = 60, FH = 88, FG = 8, fy = (i) => FY + i * (FH + FG);
  const DEPTH = [1, 2, 3, 2, 1], WHO = ['main', 'compute', 'square', 'compute', 'main'];
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {}, fr = b.frames || [], pf = p.frames || [];
    el('rect', { x: SX - 18, y: 44, width: SW + 36, height: 3 * (FH + FG) + 26, rx: 12, fill: SOFT });
    tx(SX - 10, 34, '스택 · 높은 주소', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    tx(SX + SW / 2, 404, '프레임은 아래(낮은 주소)로 쌓인다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
    const hot = (v) => (k === 2 && v === 'int r = 25') || (k === 3 && v === 'int sum = 25') || (k === 4 && v === 'int result = 25');
    const show = k === 5 ? fr : fr;
    show.forEach((f, i) => { const fresh = k < 5 && i >= pf.length, dy = fresh ? lerp(-26, 0, E(u, 0.2, 0.9)) : 0, op = fresh ? fade(u, 0.2, 0.5) : 1;
      frameBox(SX, fy(i) + dy, SW, FH, f.name, f.vars, { op, hot, dash: k === 5 ? '6 4' : null, stroke: k === 5 ? MUT : i === fr.length - 1 ? ACC : INK }); });
    // pop 되는 프레임: 오른쪽으로 밀려나며 사라지고, 반환값 25가 아래 프레임으로 날아간다
    if (k < 5 && pf.length > fr.length) { const i = pf.length - 1, s = E(u, 0.2, 1.2);
      frameBox(SX + 40 * s, fy(i), SW, FH, pf[i].name, pf[i].vars, { op: 1 - s, stroke: MUT, dash: '6 4' });
      fly(SX + 262, fy(i) + 22, SX + 262, fy(i - 1) + 22, seg(u, 0.3, 1.35), 'return 25', { mono: true }); }
    // SP 화살표
    const n = k === 5 ? 3 : tween(pf.length || fr.length, fr.length, u, 0.8), spy = FY + n * (FH + FG) - FG;
    el('line', { x1: SX + SW + 56, y1: spy, x2: SX + SW + 8, y2: spy, stroke: ACC, 'stroke-width': 3, 'marker-end': 'url(#ra-ahb)' });
    mono(SX + SW + 60, spy + 5, 'SP', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    // 오른쪽: 호출 깊이 막대
    const ax = R.axes(560, 90, 340, 200, { x: [-0.5, 4.5], y: [0, 3.4], yt: [1, 2, 3], grid: true });
    tx(500, 62, '호출 깊이 (프레임 수)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const last = Math.min(k, 4);
    for (let i = 0; i <= last; i++) { const g = i === last && k < 5 ? E(u, 0.2, 1.0) : 1, top = ax.Y(DEPTH[i] * g), hi = (k === 5 && DEPTH[i] === 3) || (k < 5 && i === last);
      el('rect', { x: ax.X(i) - 26, y: top, width: 52, height: ax.Y(0) - top, rx: 4, fill: hi ? ACC : OFF, opacity: 0.9 });
      mono(ax.X(i), ax.Y(0) + 22, WHO[i], { 'font-size': 13.5, 'text-anchor': 'middle', fill: hi ? ACC : MUT, 'font-weight': hi ? 800 : 500 }); }
    tx(560 + 170, 346, '맨 위 프레임 = 지금 실행 중인 함수', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: k < 5 ? 1 : 0 });
    if (k === 5) { banner(730, 346, '쌓인 순서의 반대로 정리 · free 호출 0번', pop(u, 0.4));
      sub(730, 384, 'push = SP 내리기, pop = SP 되돌리기', fade(u, 1.2), { 'font-size': 14.5 }); } }

  // ---------- 2. 힙 블록 malloc / free ----------
  const HX = 520, HY = 108, CWd = 36, CHt = 22;   // 10 × 10 칸 = int 100개
  const cellXY = (i) => [HX + (i % 10) * CWd, HY + Math.floor(i / 10) * CHt];
  function heapBlock(fill, alive, o) { o = o || {};
    for (let i = 0; i < 100; i++) { const [x, y] = cellXY(i), f = fill(i); if (f <= 0 && !o.ghost) continue;
      el('rect', { x: x + 1, y: y + 1, width: CWd - 2, height: CHt - 2, rx: 3, fill: alive ? ACCBG : SOFT, stroke: alive ? ACC : GRID, 'stroke-width': 1, 'stroke-dasharray': alive ? null : '3 3', opacity: o.ghost ? 1 : f });
      if (i < 10 && o.vals) mono(x + CWd / 2, y + 16, String(i * i), { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': i === 9 && o.hot9 ? 800 : 500, fill: i === 9 && o.hot9 ? ACC : INK, opacity: o.vals(i) }); } }
  function heapFrame(title) { el('rect', { x: 470, y: 44, width: 460, height: 340, rx: 12, fill: SOFT });
    tx(486, 70, title, { 'font-size': 14, 'font-weight': 700, fill: MUT });
    mono(HX, HY - 12, '0x5a3f10 (예시)', { 'font-size': 13.5, fill: MUT }); mono(HX + 360, HY - 12, '400 B = int × 100', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 5) return s2wrap(t, c);
    heapFrame('힙');
    el('rect', { x: 30, y: 44, width: 380, height: 340, rx: 12, fill: SOFT }); tx(46, 70, '스택', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    // 프레임: main은 늘, make_array는 k ≤ 1 동안
    const mainVars = k === 0 || k === 1 ? ['int* squares  (대기)'] : k >= 4 ? ['int* squares = NULL'] : ['int* squares'];
    frameBox(46, 90, 348, 80, 'main()', mainVars, { colw: 340, hot: (v) => k === 4 && v.includes('NULL') });
    if (k <= 2) { const s = k === 2 ? E(u, 0.2, 1.1) : 0;
      frameBox(46 + 40 * s, 186, 348, 80, 'make_array(n=100)', ['int n = 100', 'int* arr'], { op: 1 - s, stroke: k === 2 ? MUT : ACC, dash: k === 2 ? '6 4' : null }); }
    const [bx, by] = [HX - 2, HY + 4];
    // 블록 상태
    if (k === 0) heapBlock((i) => seg(u, 0.3 + i * 0.008, 0.6 + i * 0.008), true);
    else if (k <= 3) heapBlock(() => 1, true, { vals: (i) => (k === 1 ? fade(u, 0.3 + i * 0.12) : 1), hot9: k === 3 });
    else heapBlock((i) => 1 - seg(u, 0.3 + i * 0.01, 0.8 + i * 0.01), true, { vals: (i) => 1 - fade(u, 0.3) });
    if (k === 1) { for (let i = 10; i < 100; i++) { const [x, y] = cellXY(i), f = seg(u, 0.3 + i * 0.015, 0.5 + i * 0.015); if (f > 0) el('rect', { x: x + 1, y: y + 1, width: CWd - 2, height: CHt - 2, rx: 3, fill: ACC, opacity: 0.35 * f }); } }
    if (k === 4) { heapBlock((i) => seg(u, 0.3 + i * 0.01, 0.8 + i * 0.01), false); sub(HX + 180, HY + 254, '(반납됨)', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700 }); }
    // 포인터
    if (k <= 1) ptr(300, 252, bx, by + 20, k === 0 ? E(u, 0.9, 1.7) : 1, ACC, -40);
    if (k === 1) fly(240, 230, 200, 140, seg(u, 1.6, 2.6), 'return arr', { mono: true });
    if (k === 2 || k === 3) ptr(300, 140, bx, by + 20, k === 2 ? E(u, 0.8, 1.8) : 1, ACC, -30);
    if (k === 4) { ptr(300, 140, bx, by + 20, 1 - E(u, 0.2, 0.9), ACC, -30); nullSym(330, 150, fade(u, 1.0)); }
    // 설명 조각
    if (k === 0) { pill(220, 312, 'arr == NULL ?  → 아니오', GOOD, pop(u, 1.9), { fs: 14, mono: true });
      sub(220, 350, '실패하면 NULL이 온다', fade(u, 2.2)); }
    if (k === 2) { pill(220, 230, '해제 책임 → main', WARN, pop(u, 1.6), { fs: 14.5 }); sub(220, 300, 'make_array 프레임은 사라져도', fade(u, 1.8));
      sub(220, 322, '힙 블록은 그대로 남는다', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); }
    if (k === 3) { const [x9, y9] = cellXY(9); dot([[300, 140], [bx, by + 20], [x9 + 18, y9 + 11]], seg(u, 0.2, 1.1), ACC, 7);
      el('rect', { x: x9 - 1, y: y9 - 1, width: CWd + 2, height: CHt + 2, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 1.0) });
      fly(x9, y9 + 10, 230, 250, seg(u, 1.0, 1.45), 'squares[9] = 81', { mono: true, stay: true }); }
    if (k === 4) { pill(220, 230, 'malloc 1회 : free 1회', GOOD, pop(u, 1.8), { fs: 14.5 }); } }
  // k5: 수명 비교 — 힙 블록 vs 스택 배열
  function s2wrap(t, c) { const u = c.u, x0 = 230, x1 = 900, T = (v) => lerp(x0, x1, v);
    tx(480, 50, '같은 배열, 수명은 어디에 두느냐로 갈린다', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
    el('line', { x1: x0, y1: 330, x2: x1, y2: 330, stroke: MUT, 'stroke-width': 1.8, 'marker-end': 'url(#ra-ah)' });
    tx(x1, 356, '시간', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    const ev = [[0.05, 'make_array 호출'], [0.32, 'return'], [0.6, 'squares[9] 읽기'], [0.88, 'free']];
    ev.forEach(([v, s], i) => { const op = fade(u, 0.2 + i * 0.2); el('line', { x1: T(v), y1: 96, x2: T(v), y2: 330, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: op });
      tx(T(v), 384, s, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: op }); });
    const g1 = E(u, 0.4, 1.6);
    tx(40, 160, '힙 (malloc)', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    el('rect', { x: T(0.05), y: 140, width: (T(0.88) - T(0.05)) * g1, height: 30, rx: 6, fill: ACC, opacity: 0.85 });
    mono(T(0.6), 190, '81을 읽는다', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); check(T(0.6) + 70, 186, 8, pop(u, 1.7));
    tx(40, 260, '스택 배열', { 'font-size': 16, 'font-weight': 800, fill: BAD });
    const g2 = E(u, 1.0, 1.8);
    el('rect', { x: T(0.05), y: 240, width: (T(0.32) - T(0.05)) * g2, height: 30, rx: 6, fill: BAD, opacity: 0.8 });
    if (u > 1.8) { el('rect', { x: T(0.32), y: 240, width: T(0.88) - T(0.32), height: 30, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '6 5', opacity: fade(u, 1.8) });
      tx(T(0.6), 261, '쓰레기 주소를 가리킨다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); cross(T(0.32), 225, 9, pop(u, 1.9)); } }

  // ---------- 3. 메모리 레이아웃 ----------
  const MX = 70, MW = 300, SEG = { stack: [40, 110], gap: [110, 200], heap: [200, 270], data: [270, 330], text: [330, 390] };
  function s3(t, c) { const { k, u } = c, b = c.beat, segs = b.segments || [], hi = (i) => segs[i] && segs[i].hi;
    const grow = k === 5 ? E(u, 0.3, 1.8) : 0, sOut = grow * 46, hOut = grow * 46;   // k5: 서로를 향해 자란다
    const box = (key, i, name, desc, col, bg) => { const [a, z] = SEG[key], y0 = key === 'heap' ? a - hOut : a, y1 = key === 'stack' ? z + sOut : z;
      el('rect', { x: MX, y: y0, width: MW, height: y1 - y0, fill: hi(i) ? bg : PANEL, stroke: hi(i) ? col : GRID, 'stroke-width': hi(i) ? 2.6 : 1.5 });
      tx(MX + 12, y0 + 24, name, { 'font-size': 15, 'font-weight': 800, fill: hi(i) ? col : INK });
      tx(MX + 12, y0 + 45, desc, { 'font-size': 13.5, fill: MUT }); };
    box('stack', 0, '스택', '지역변수 · 함수 프레임', ACC, ACCBG);
    box('heap', 2, '힙', 'malloc이 쓰는 영역', WARN, WARNBG);
    box('data', 3, '데이터 (Data/BSS)', '전역 · 정적 변수', INFO, INFOBG);
    box('text', 4, '코드 (Text)', '실행 명령어 · 읽기 전용', INK, SOFT);
    el('rect', { x: MX, y: SEG.gap[0] + sOut, width: MW, height: Math.max(0, SEG.gap[1] - SEG.gap[0] - sOut - hOut), fill: 'none', stroke: GRID, 'stroke-dasharray': '5 5' });
    if (k < 4) tx(MX + MW / 2, 160, '빈 공간', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
    el('line', { x1: 46, y1: 390, x2: 46, y2: 46, stroke: MUT, 'stroke-width': 1.8, 'marker-end': 'url(#ra-ah)' });
    tx(40, 30, '높은 주소', { 'font-size': 13.5, fill: MUT }); tx(40, 410, '낮은 주소', { 'font-size': 13.5, fill: MUT });
    // 칸 안의 변수
    if (k >= 0 && k <= 4) { const s1 = k === 0 ? pop(u, 0.3) : 1, s2 = k === 0 ? pop(u, 0.7) : 1;
      card(MX + 232, 290, 112, 26, { rx: 5, text: 'g_counter = 0', fs: 13.5, mono: true, stroke: INFO, s: s1 });
      card(MX + 232, 318, 112, 26, { rx: 5, text: 's_cache = 7', fs: 13.5, mono: true, stroke: INFO, s: s2 }); }
    if (k >= 1 && k <= 4) { const s = k === 1 ? pop(u, 0.3) : 1; card(MX + 232, 60, 112, 26, { rx: 5, text: 'local = 1', fs: 13.5, mono: true, stroke: ACC, s }); }
    if (k >= 2 && k <= 4) { const s = k === 2 ? pop(u, 0.3) : 1, freed = k === 4 ? E(u, 1.2, 2.0) : 0;
      card(MX + 232, 90, 112, 26, { rx: 5, text: 'onHeap', fs: 13.5, mono: true, stroke: ACC, s });
      card(MX + 232, 234, 112, 30, { rx: 5, text: freed > 0.5 ? '(반납)' : '64 B', fs: 14, mono: true, stroke: freed > 0.5 ? GRID : WARN, fill: freed > 0.5 ? SOFT : WARNBG, dash: freed > 0.5 ? '4 3' : null, s: k === 2 ? pop(u, 0.9) : 1 });
      ptr(MX + 288, 98, MX + 290, 220, (k === 2 ? E(u, 1.0, 1.8) : 1) * (1 - freed), ACC, -46); }
    if (k === 3) { // 네 구역 주소 찍기 — 리눅스 x86-64의 전형적인 순서
      [['stack', 70, ACC], ['heap', 236, WARN], ['global', 300, INFO], ['code', 360, INK]].forEach(([s, y, col], i) => {
        const op = fade(u, 0.3 + i * 0.45); el('circle', { cx: MX + MW, cy: y, r: 6, fill: col, opacity: op });
        mono(MX + MW + 14, y + 5, s, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: op }); }); }
    if (k === 4) { const a = E(u, 0.3, 1.2);
      el('line', { x1: MX + 200, y1: SEG.heap[0] - 4, x2: MX + 200, y2: SEG.heap[0] - 4 - 34 * a, stroke: WARN, 'stroke-width': 3, 'marker-end': 'url(#ra-ah)' });
      el('line', { x1: MX + 70, y1: SEG.stack[1] + 4, x2: MX + 70, y2: SEG.stack[1] + 4 + 34 * a, stroke: ACC, 'stroke-width': 3, 'marker-end': 'url(#ra-ahb)' });
      tx(MX + 212, SEG.heap[0] - 16, '힙은 위로', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      tx(MX + 82, SEG.stack[1] + 30, '스택은 아래로', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) }); }
    if (k === 5) { const hit = fade(u, 1.7); el('line', { x1: MX, y1: 155, x2: MX + MW, y2: 155, stroke: BAD, 'stroke-width': 4, opacity: hit });
      cross(MX + MW + 20, 155, 10, pop(u, 1.8)); }
    // 오른쪽: 스택 vs 힙 비교표 (beat 마다 한 줄씩)
    const rows = (b.compare && b.compare.rows) || [], pr = (c.prev && c.prev.compare && c.prev.compare.rows) || [];
    const TX = 450, cw = [100, 196, 180], ry = (i) => 96 + i * 50;
    if (k === 5) { tx(TX, 66, '한쪽이 폭주하면', { 'font-size': 18, 'font-weight': 800 });
      [['스택이 너무 깊어지면', '스택 오버플로', ACC], ['힙을 free 없이 계속 쓰면', 'malloc 실패 (NULL)', WARN]].forEach(([a, z, col], i) => { const s = pop(u, 0.6 + i * 0.5);
        card(TX + 250, 140 + i * 96, 480, 74, { rx: 12, stroke: col, sw: 2.2, s });
        tx(TX + 30, 134 + i * 96, a, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.5) });
        tx(TX + 30, 160 + i * 96, z, { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.9 + i * 0.5) }); });
      sub(TX + 250, 350, '빈 공간 하나를 위아래에서 나눠 쓰기 때문이다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    tx(TX + 8, 66, '구분', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(TX + cw[0] + 8, 66, '스택', { 'font-size': 15, 'font-weight': 800, fill: ACC }); tx(TX + cw[0] + cw[1] + 8, 66, '힙', { 'font-size': 15, 'font-weight': 800, fill: WARN });
    el('line', { x1: TX, y1: 76, x2: TX + 476, y2: 76, stroke: GRID, 'stroke-width': 1.5 });
    const SHORT = { '수명': ['스코프 끝나면 자동 해제', 'free 할 때까지 유지'], '속도': ['빠름 (SP 이동뿐)', '느림 (빈 공간 탐색)'], '크기': ['작음 (≈1~8MB)', '큼 (가용 메모리까지)'],
      '크기 결정': ['컴파일 타임', '런타임 가능'], '관리 책임': ['컴파일러 (자동)', '개발자 (malloc/free)'] };
    rows.forEach((r, i) => { const fresh = i >= pr.length, s = fresh ? E(u, 0.3, 1.0) : 1, y = ry(i), [a, z] = SHORT[r.k] || [r.stack, r.heap];
      if (fresh) el('rect', { x: TX, y: y - 4, width: 476 * s, height: 40, rx: 6, fill: ACCBG, opacity: 0.6 });
      tx(TX + 8, y + 22, r.k, { 'font-size': 14.5, 'font-weight': 700, opacity: s });
      tx(TX + cw[0] + 8, y + 22, a, { 'font-size': 14.5, opacity: s }); tx(TX + cw[0] + cw[1] + 8, y + 22, z, { 'font-size': 14.5, opacity: s }); });
    if (k === 3) sub(TX + 251, 400, '주소 값은 실행마다·OS마다 다르다. 위 순서는 리눅스의 전형', fade(u, 2.0), { 'font-size': 13.5 }); }

  // ---------- 4. 선택 기준: 세 질문 ----------
  const QX = 250, QW = 400, QY = [96, 186, 276];
  const ITEMS = ['int nums[8]', 'malloc(sizeof(int) * n)', 'return 할 결과', 'malloc(strlen(name) + 8)', '16MB 버퍼'];
  const GATE = [3, 0, 1, 1, 2];   // 각 beat의 데이터가 걸리는 질문 (3 = 셋 다 아니오)
  function s4(t, c) { const { k, u } = c, qs = (c.beat.decide || []), pq = (c.prev && c.prev.decide) || [];
    // 오른쪽 두 통: 힙(위) · 스택(아래)
    el('rect', { x: 720, y: 50, width: 220, height: 220, rx: 12, fill: WARNBG, stroke: WARN, 'stroke-width': 2 });
    tx(736, 76, '힙 (malloc)', { 'font-size': 15, 'font-weight': 800, fill: WARN });
    el('rect', { x: 720, y: 290, width: 220, height: 104, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
    tx(736, 316, '스택 (기본값)', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    // 질문 칸: decide에 들어온 것만, 새로 들어온 것은 펼쳐진다
    QY.forEach((y, i) => { const on = i < qs.length, fresh = on && i >= pq.length, s = fresh ? E(u, 0.2, 0.8) : 1;
      if (!on) { el('rect', { x: QX, y: y - 28, width: QW, height: 56, rx: 10, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 5' }); return; }
      const lit = GATE[k] === i, col = lit ? WARN : INK;
      el('rect', { x: QX, y: y - 28, width: QW * s, height: 56, rx: 10, fill: lit ? WARNBG : PANEL, stroke: lit ? WARN : GRID, 'stroke-width': lit ? 2.6 : 1.6 });
      tx(QX + 16, y + 6, `${i + 1}. ${qs[i].q}`, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: s });
      el('line', { x1: QX + QW, y1: y, x2: 716, y2: y < 230 ? y : 230, stroke: lit ? WARN : GRID, 'stroke-width': 2, 'marker-end': lit ? 'url(#ra-ah)' : null, opacity: s });
      tx(QX + QW + 10, y - 8, '예', { 'font-size': 14, fill: lit ? WARN : MUT, 'font-weight': 700, opacity: s }); });
    el('line', { x1: QX + QW / 2, y1: 310, x2: QX + QW / 2, y2: 342, stroke: GRID, 'stroke-width': 2 });
    el('line', { x1: QX + QW / 2, y1: 342, x2: 716, y2: 342, stroke: GATE[k] === 3 ? ACC : GRID, 'stroke-width': 2, 'marker-end': GATE[k] === 3 ? 'url(#ra-ahb)' : null });
    tx(QX + QW / 2 + 10, 332, '모두 아니오', { 'font-size': 14, fill: GATE[k] === 3 ? ACC : MUT, 'font-weight': 700 });
    // 지금 데이터가 내려와 통으로 들어간다
    const g = GATE[k], stopY = g === 3 ? 342 : QY[g], route = [[150, 40], [150, stopY], [QX + QW + 30, stopY], [g === 3 ? 760 : 760, g === 3 ? 360 : 110 + (k - 1) * 40]];
    tx(40, 34, '데이터', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const pu = E(u, 0.3, 1.9), seg1 = clamp(pu * 2), seg2 = clamp(pu * 2 - 1);
    const px = seg1 < 1 ? 150 : lerp(150, route[2][0], seg2), py = seg1 < 1 ? lerp(56, stopY, seg1) : stopY;
    if (pu < 1) pill(px, py, ITEMS[k], k === 0 ? ACC : WARN, 1, { mono: true, fs: 13.5, fill: PANEL });
    // 통 안에 쌓인 것들
    if (k === 0) { const s = fade(u, 1.9); for (let i = 0; i < 8; i++) el('rect', { x: 740 + i * 23, y: 340, width: 20, height: 26, rx: 3, fill: ACC, opacity: 0.75 * s });
      mono(830, 386, 'nums[8] · 해제 코드 없음', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: s }); }
    const heapItems = [['int × n', 1], ['결과 블록', 2], ['"Hello, …"', 3], ['16MB', 4]];
    heapItems.forEach(([s, at], i) => { if (k < at) return; const op = k === at ? fade(u, 1.9) : 1;
      card(830, 108 + i * 40, 180, 30, { rx: 6, text: s, fs: 14, mono: true, stroke: WARN, fill: PANEL, op }); });
    if (k === 3) pill(830, 248, 'free 책임 → 호출자', WARN, pop(u, 2.1), { fs: 13.5 });
    if (k === 4) { const bw = E(u, 0.3, 1.5);
      tx(40, 384, '스택 한계 8MB', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      el('rect', { x: 150, y: 396, width: 220, height: 12, rx: 3, fill: SOFT, stroke: GRID });
      el('rect', { x: 150, y: 396, width: 440 * bw, height: 12, rx: 3, fill: BAD, opacity: 0.7 });
      mono(150 + 440 * bw + 8, 408, '16MB', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) }); }
    if (k === 1) sub(QX + QW / 2, 384, 'n은 실행 중에야 정해진다', fade(u, 2.0), { 'font-size': 14.5 });
    if (k === 2) sub(QX + QW / 2, 384, '스택에 두면 return 순간 사라진다', fade(u, 2.0), { 'font-size': 14.5, fill: BAD }); }

  // ---------- 5. 실패 사례 4가지 ----------
  const TAGS = ['스택 오버플로', '메모리 누수', 'dangling 반환', '힙 주소 분실'];
  function tags(k, u) { TAGS.forEach((s, i) => { const on = i <= k, cur = i === Math.min(k, 3) && k < 4;
    card(130 + i * 233, 396, 210, 34, { rx: 17, text: s, fs: 14.5, stroke: on ? BAD : GRID, color: on ? (cur || k === 4 ? BAD : MUT) : OFF, fill: cur ? BADBG : PANEL, sw: cur ? 2.4 : 1.5, s: i === k && k < 4 ? pop(u, 0.1) : 1 }); }); }
  function block(x, y, w, h, s, st, o) { o = o || {};
    const col = st === 'leak' ? BAD : st === 'free' ? GRID : st === 'orphan' ? WARN : ACC, bg = st === 'leak' ? BADBG : st === 'free' ? SOFT : st === 'orphan' ? WARNBG : ACCBG;
    card(x + w / 2, y + h / 2, w, h, { rx: 6, text: s, fs: 15, mono: true, stroke: col, fill: bg, color: st === 'free' ? MUT : INK, dash: st === 'free' ? '5 4' : null, op: o.op, s: o.s }); }
  function s5(t, c) { const { k, u } = c;
    tags(k, u);
    if (k === 0) { // 큰 지역 배열이 스택 한계를 뚫는다
      el('rect', { x: 330, y: 40, width: 300, height: 320, rx: 10, fill: SOFT });
      tx(346, 64, 'overflow() 프레임', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      el('line', { x1: 310, y1: 200, x2: 650, y2: 200, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' });
      tx(660, 206, '스택 한계 8MB', { 'font-size': 15, 'font-weight': 700, fill: BAD });
      const h = 280 * E(u, 0.3, 1.8); el('rect', { x: 370, y: 76, width: 220, height: h, rx: 6, fill: h > 124 ? BAD : ACC, opacity: 0.8 });
      mono(480, 76 + Math.min(h, 120) / 2 + 6, 'int big[4,000,000]', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: PANEL, opacity: fade(u, 0.5) });
      tx(660, 300, '× 4B ≈ 16MB', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) });
      pill(160, 200, 'SIGSEGV', BAD, pop(u, 2.0), { mono: true, fs: 15 }); sub(160, 236, '함수에 들어가자마자', fade(u, 2.1));
      return; }
    if (k === 1) { // free 누락
      el('rect', { x: 40, y: 44, width: 320, height: 300, rx: 12, fill: SOFT }); tx(56, 68, '스택', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      const gone = E(u, 1.0, 1.7); frameBox(60 + 40 * gone, 96, 280, 74, 'leak()', ['char* buf'], { op: 1 - gone, stroke: gone > 0 ? MUT : ACC, dash: gone > 0 ? '6 4' : null });
      block(520, 110, 200, 60, '1024 B', gone > 0.9 ? 'leak' : 'live', { s: pop(u, 0.2) });
      ptr(250, 156, 516, 140, (E(u, 0.3, 0.9)) * (1 - gone), ACC, -30);
      if (gone > 0.9) { tx(620, 200, '주소를 아는 변수가 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
      for (let i = 0; i < 5; i++) { const s = pop(u, 2.0 + i * 0.1); if (s > 0) block(430 + i * 92, 250, 80, 40, '1KB', 'leak', { s }); }
      sub(620, 320, '루프 안이면 계속 쌓인다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 2) { // 지역변수 주소 반환
      el('rect', { x: 40, y: 44, width: 360, height: 300, rx: 12, fill: SOFT }); tx(56, 68, '스택', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      frameBox(60, 86, 320, 70, 'main()', ['int* p = dangling()'], { colw: 300 });
      const gone = E(u, 0.9, 1.6);
      frameBox(60, 170, 320, 70, 'dangling()', ['int x = 42'], { op: 1 - gone * 0.75, stroke: gone > 0 ? MUT : ACC, dash: gone > 0 ? '6 4' : null });
      if (gone > 0.5) { el('rect', { x: 60, y: 170, width: 320, height: 70, rx: 9, fill: OFF, opacity: 0.3 * gone }); mono(250, 222, '?? ??', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: gone }); }
      fly(160, 225, 300, 135, seg(u, 0.2, 1.0), 'return &x', { mono: true });
      ptr(372, 124, 382, 212, E(u, 1.0, 1.7), gone > 0.9 ? BAD : ACC, -44);
      cross(430, 206, 11, pop(u, 1.9));
      tx(470, 170, 'return 순간 프레임이 pop 됐다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(470, 200, 'p는 사라진 자리를 가리킨다', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
      tx(470, 260, '고치기: 값으로 반환하거나 malloc', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    // k 3, 4: 포인터 덮어쓰기
    el('rect', { x: 40, y: 44, width: 300, height: 300, rx: 12, fill: SOFT }); tx(56, 68, '스택', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    frameBox(60, 110, 260, 70, 'lost()', [k === 4 ? 'char* p  (free 후)' : 'char* p'], { colw: 240 });
    const sw = k === 3 ? E(u, 1.0, 1.9) : 1, freed = k === 4 ? E(u, 0.3, 1.2) : 0;
    block(560, 80, 150, 56, '100 B', k === 4 ? 'leak' : sw > 0.9 ? 'orphan' : 'live', { s: k === 3 ? pop(u, 0.2) : 1 });
    if (k === 4 || sw > 0) block(560, 230, 260, 56, freed > 0.6 ? '(반납)' : '200 B', freed > 0.6 ? 'free' : 'live', { s: k === 3 ? pop(u, 0.8) : 1 });
    const ty = lerp(108, 258, sw), tx2 = lerp(556, 556, sw);
    if (freed < 0.6) ptr(300, 146, tx2, ty, k === 3 ? Math.max(E(u, 0.2, 0.7), sw > 0 ? 1 : 0) : 1, ACC, -20);
    if (k === 3) { tx(635, 168, '이 블록의 주소를 아는 곳이 없다', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    pill(240, 250, 'free(p)', GOOD, pop(u, 0.2), { mono: true, fs: 15 });
    tx(635, 168, '누수 100 B — 끝까지 남는다', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    tx(690, 318, '200 B만 반납', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'square가 r 값을 return한 직후, 스택에서 일어나는 일은 무엇인가?',
      o: ['r 변수가 힙으로 옮겨져 계속 남는다', 'square 프레임이 통째로 pop되고 값 25만 compute로 복사된다', 'free를 불러야 square 프레임이 정리된다'], a: 1,
      why: 'return하면 SP가 되돌아가며 square 프레임 전체가 사라진다. 살아남는 것은 sum에 복사된 값 25뿐이다.' },
    { q: 'make_array가 return한 뒤에도 squares[9]를 읽어 81을 얻을 수 있는 이유는 무엇인가?',
      o: ['배열이 힙에 있어서 free 전까지 살아 있기 때문이다', 'make_array 프레임이 main이 끝날 때까지 남기 때문이다', '컴파일러가 배열을 전역 변수로 바꾸기 때문이다'], a: 0,
      why: 'malloc으로 잡은 400B 블록은 함수 프레임과 수명이 따로다. free(squares)를 부를 때까지 그대로 남는다.' },
    { q: 'layout.c에서 onHeap 변수 자체와 그것이 가리키는 64B는 각각 어디에 있는가?',
      o: ['둘 다 힙', '변수는 스택, 64B는 힙', '변수는 데이터 영역, 64B는 스택'], a: 1,
      why: 'onHeap은 demo 안의 지역변수라 스택 프레임에 있다. malloc(64)가 준 블록만 힙에 있다.' },
    { q: '세 질문에 모두 "아니오"가 나온 데이터는 어디에 두는가?',
      o: ['힙에 두고 바로 free 한다', '스택에 둔다', '전역 변수로 만든다'], a: 1,
      why: '런타임 크기, 함수 넘어 생존, 큰 데이터가 모두 아니면 스택이 기본이다. 해제 코드가 필요 없어 빠르고 안전하다.' },
    { q: 'p = malloc(100); p = malloc(200); free(p); 를 실행하면 누수는 얼마인가?',
      o: ['0바이트', '100바이트', '200바이트'], a: 1,
      why: 'free(p)는 지금 p가 가리키는 200B만 돌려준다. 앞 100B의 주소는 덮어써져서 반납할 길이 없다.' },
  ];

  const summary = [
    '스택 프레임은 함수가 불리면 쌓이고 return하면 SP만 되돌려 통째로 사라진다.',
    '힙은 malloc으로 빌리고 free로 돌려준다. 함수가 끝나도 블록은 남는다.',
    '스택은 위에서 아래로, 힙은 아래에서 위로 자라며 가운데 빈 공간을 나눠 쓴다.',
    '런타임 크기, 함수 밖 생존, 큰 데이터 중 하나면 힙이고 아니면 스택에 둔다.',
  ];
  const review = [
    { q: '함수 안에서 int buf[4000000]을 선언했더니 함수에 들어가자마자 죽었다. 가장 알맞은 수정은?',
      o: ['배열을 malloc으로 힙에 잡고 다 쓰면 free 한다', '배열 크기를 그대로 두고 재귀 깊이를 줄인다', '배열을 함수 밖으로 반환한다'], a: 0,
      why: 'int 400만 개는 약 16MB라 스택 한계(보통 1~8MB)를 넘는다. 큰 데이터는 힙에 두라는 선택 기준 그대로다.' },
    { q: '함수가 만든 배열의 주소를 돌려받아 썼더니 값이 엉망이다. 함수 안에서 int arr[100]으로 만들었다면 원인은?',
      o: ['malloc을 너무 많이 불렀다', '배열이 데이터 영역에 있어서 덮어써졌다', 'return 순간 프레임이 pop되어 그 주소가 무효가 됐다'], a: 2,
      why: '지역 배열은 함수 프레임과 함께 사라진다. 함수 밖에서 써야 하면 malloc으로 힙에 만들고 호출자가 free 한다.' },
    { q: '오래 도는 서버의 메모리 사용량이 요청마다 조금씩 늘기만 한다. 먼저 의심할 것은?',
      o: ['스택 프레임이 pop되지 않는다', 'malloc한 블록을 free하지 않거나 포인터를 덮어써 잃었다', '전역 변수가 너무 많다'], a: 1,
      why: '스택은 return마다 저절로 정리되지만 힙은 free해야만 돌아온다. 누락이나 주소 분실이 반복되면 사용량이 계속 쌓인다.' },
  ];

  R.page({ title: '스택과 힙의 메모리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
