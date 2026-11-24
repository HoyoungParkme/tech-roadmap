/* I-1-2 클래스·생성자·소멸자(RAII) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal, snippet, G } = R;
  const { INK, MUT, OFF, GRID, PANEL, SOFT, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // ── 지역 도우미 ──────────────────────────────────────────
  function cellBox(cx, cy, o) { o = o || {}; const w = o.w || 120, h = o.h || 50, g = G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash }, g);
    let v = o.val, sy = 1;
    if (o.flip) { const [old, at, u] = o.flip; if (u < at) { v = old; sy = 1 - seg(u, at - 0.18, at); } else sy = seg(u, at, at + 0.18); }
    if (v != null) { const vg = el('g', { transform: `scale(1 ${Math.max(0.05, sy)})` }, g); tx(0, 7, v, { 'text-anchor': 'middle', 'font-size': o.fs || 19, 'font-weight': 700, class: 'mono', fill: o.valCol || INK }, vg); }
    if (o.name) tx(0, h / 2 + 21, o.name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono' }, g);
    return g; }
  // 파일 아이콘 (모서리 접힌 종이)
  function doc(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s ?? 1, o.op ?? 1), c = o.stroke || INK;
    el('path', { d: 'M-26,-34 H12 L26,-20 V34 H-26 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M12,-34 V-20 H26', fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    [-6, 4, 14].forEach((y) => el('line', { x1: -16, y1: y, x2: 14, y2: y, stroke: OFF, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g));
    if (name) tx(0, 56, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  // 번개(예외)
  function bolt(cx, cy, s, col) { if (s <= 0) return; const g = G(cx, cy, s);
    el('path', { d: 'M4,-22 L-10,2 L0,2 L-6,22 L12,-4 L2,-4 Z', fill: col || BAD, stroke: col || BAD, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g); }
  const logLines = (x, y, lines, shown, o) => { o = o || {}; lines.forEach((s, i) => { const op = clamp(shown - i); if (op <= 0) return;
    mono(x, y + i * 22, s, { 'font-size': 14, fill: o.col || INK, opacity: op, 'font-weight': 600 }); }); };

  // ── 1. 클래스 — 데이터와 동작을 묶고 문을 단다 ──────────────────
  function s1(t, c) { const { k, u } = c, OX = 250, OY = 60, OW = 460, OH = 236, V = [280, 100, 180, 170], CNT = [370, 196];
    zone(OX, OY, OW, OH, 'class Counter', { fill: PANEL, stroke: INK, sw: 2.2, op: k === 0 ? fade(u, 0.1) : 1, color: INK });
    zone(V[0], V[1], V[2], V[3], 'private', { fill: SOFT, stroke: GRID, sw: 1.5, op: k === 0 ? fade(u, 0.3) : 1 });
    lock(V[0] + V[2] - 22, V[1] + 18, true, MUT, 0.8);
    const cv = k === 0 ? '?' : k <= 3 ? '0' : '2', cf = k === 1 ? ['?', 1.4, u] : k === 4 ? (u < 1.25 ? ['0', 0.9, u] : ['1', 1.6, u]) : null;
    cellBox(CNT[0], CNT[1], { name: 'count_', val: k === 4 && u < 0.9 ? '0' : k === 4 && u < 1.6 ? '1' : cv, flip: cf, w: 100, s: k === 0 ? pop(u, 0.4) : 1, stroke: (k === 1 && u > 1.4) || (k === 4 && u > 0.9) ? WARN : INK, valCol: k === 0 ? MUT : INK });
    if (k >= 1) { zone(480, 100, 210, 170, 'public', { fill: ACCBG, stroke: 'none', op: k === 1 ? fade(u, 0.2) : 1, color: ACC }); }
    const meth = [['Counter()', 1], ['increment()', 2], ['value() const', 3]];
    meth.forEach(([m, kk], i) => { if (k < kk) return; const y = 140 + i * 46, s = k === kk ? pop(u, 0.4) : 1;
      pill(585, y, m, ACC, s, { mono: true, fs: 14, fill: PANEL }); });
    // 바깥 코드
    tx(70, 90, '바깥 코드', { 'font-size': 15, 'font-weight': 800, fill: MUT });
    if (k === 0) { dot([[110, 196], [276, 196]], seg(u, 0.8, 1.5), BAD, 7); cross(276, 196, 11, pop(u, 1.5)); tx(140, 236, '직접 못 닿는다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
    if (k === 1) { dot([[530, 140], [470, 140], [420, 190]], seg(u, 0.8, 1.35), WARN, 7); sub(370, 262, ': count_(0)  태어날 때 0', fade(u, 1.6), { 'font-weight': 700, fill: WARN }); }
    if (k === 2) { el('path', { d: 'M640,166 C700,240 560,320 330,292 C300,288 270,280 262,270', fill: 'none', stroke: INFO, 'stroke-width': 2.2, 'stroke-dasharray': '5 5', opacity: fade(u, 0.9) });
      mono(640, 318, 'this → 이 객체 자신', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) });
      mono(560, 86, 'this->count_ += 1', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); }
    if (k === 3) { dot([[420, 196], [470, 220], [520, 232]], seg(u, 0.8, 1.4), INFO, 7); tx(720, 290, '읽기만 하는 창구', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) });
      mono(720, 314, 'const = 상태를 안 바꾼다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.7) }); }
    if (k === 4) { [0.2, 1.0].forEach((a) => dot([[120, 186], [240, 186], [520, 186], [470, 186], [420, 196]], seg(u, a, a + 0.65), WARN, 7));
      fly(530, 232, 760, 360, seg(u, 1.9, 2.5), '2', { mono: true });
      mono(110, 166, 'c.increment() ×2', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.2) }); }
    if (k === 5) { dot([[110, 210], [276, 210]], seg(u, 0.3, 0.9), BAD, 7); cross(276, 210, 12, pop(u, 0.9));
      mono(60, 186, 'c.count_ = 99;', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.2) }); }
    // 아래: 코드 · 출력
    const lines = [['class Counter {', 'private:', '    int count_;'], ['public:', '    Counter() : count_(0) {}'], ['void increment() {', '    this->count_ += 1;', '}'], ['int value() const {', '    return count_;', '}'], ['Counter c;', 'c.increment();  c.increment();', 'std::cout << c.value();'], ['// c.count_ = 99;  // 컴파일 에러']][k];
    snippet(40, 318, lines, { fs: 13.5 });
    if (k === 4) terminal(580, 318, 340, 92, ['$ ./a.out', '2'], u > 2.5 ? 2 : 1, { title: '출력' });
    if (k === 5) terminal(450, 318, 470, 92, ['error: \'count_\' is a private', '       member of \'Counter\''], seg(u, 1.1, 1.8) * 2, { title: '컴파일러', fs: 13.5 }); }

  // ── 2. 생성자와 초기화 리스트 ──────────────────────────────────
  function s2(t, c) { const { k, u } = c, HX = 240, HY = 170, FX = 790, FY = 150;
    const broken = k === 2 ? seg(u, 1.2, 1.9) : 0, gone = k === 4 ? seg(u, 0.4, 1.2) : 0;
    zone(60, 70, 360, 190, 'File 객체', { fill: PANEL, stroke: broken > 0.4 ? BAD : INK, sw: 2.2, dash: broken > 0.4 || gone > 0.4 ? '7 6' : null, op: (1 - broken * 0.75) * (1 - gone * 0.8), color: INK });
    zone(620, 70, 300, 190, '디스크', { fill: SOFT });
    doc(FX, FY, k === 2 ? 'no_such_file' : 'data.txt', { stroke: k === 2 ? BAD : INK, s: k === 0 ? pop(u, 0.5) : 1 });
    if (k === 2) cross(FX, FY, 14, pop(u, 0.4));
    const opened = k === 1 ? E(u, 0.6, 1.3) : k === 3 || k === 4 ? 1 : 0;
    cellBox(HX, HY, { name: 'handle_', val: k === 0 ? '?' : k === 2 ? 'nullptr' : 'FILE*', flip: k === 1 ? ['?', 1.3, u] : k === 2 ? ['?', 0.9, u] : null, w: 120, valCol: k === 0 ? MUT : k === 2 ? BAD : ACC, stroke: k === 2 ? BAD : INK, op: (1 - broken * 0.7) * (1 - gone * 0.8), s: k === 0 ? pop(u, 0.2) : 1 });
    if (opened > 0) { const leak = k === 4 && gone > 0.5;
      el('line', { x1: HX + 60, y1: HY, x2: lerp(HX + 60, FX - 30, opened), y2: lerp(HY, FY, opened), stroke: leak ? WARN : GOOD, 'stroke-width': 3, 'stroke-dasharray': leak ? '8 5' : null });
      if (opened > 0.98) el('circle', { cx: FX - 30, cy: FY, r: 6, fill: leak ? WARN : GOOD }); }
    if (k === 1) { // 두 갈래 비교: 본문 대입 vs 초기화 리스트
      const lanes = [['본문 대입', ['칸 생김 (값 없음)', '= fopen(…)'], BAD], ['초기화 리스트', ['fopen(…) 결과로 태어남'], GOOD]];
      lanes.forEach(([nm, ticks, col], i) => { const y = 312 + i * 50, op = fade(u, 0.3 + i * 0.6);
        tx(60, y + 5, nm, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op });
        el('line', { x1: 200, y1: y, x2: lerp(200, 900, E(u, 0.3 + i * 0.6, 1.2 + i * 0.6)), y2: y, stroke: GRID, 'stroke-width': 2 });
        ticks.forEach((s, j) => { const x = 260 + j * 300, s2 = pop(u, 0.7 + i * 0.6 + j * 0.3); el('circle', { cx: x, cy: y, r: 7 * s2, fill: col });
          tx(x + 14, y + 5, s, { 'font-size': 14, fill: INK, opacity: fade(u, 0.8 + i * 0.6 + j * 0.3) }); }); });
      mono(780, 312, '2번 일한다', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      mono(780, 362, '1번', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 2.2) }); return; }
    if (k === 2) { bolt(110, 330, pop(u, 1.2)); fly(240, 260, 120, 360, seg(u, 1.3, 2.1), 'runtime_error', { fill: BAD, mono: true });
      tx(490, 320, '생성이 끝나지 않았다', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      tx(490, 346, '반쯤 만들어진 File 은 남지 않는다', { 'font-size': 14.5, fill: INK, opacity: fade(u, 2.0) });
      terminal(490, 356, 320, 62, ['caught: open failed'], u > 2.3 ? 1 : 0, { lh: 20 }); return; }
    if (k === 3) { check(400, 92, 12, pop(u, 0.4)); tx(240, 290, '생성자를 통과했다 = 파일이 열려 있다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) });
      snippet(40, 316, ['File f("data.txt");', 'f.readLine(buf, 256);   // null 검사 없이'], { fs: 14, op: fade(u, 1.1) }); return; }
    if (k === 4) { tx(240, 290, '객체는 사라졌는데', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.0) });
      pill(FX, 236, '아직 열림', WARN, pop(u, 1.4), { fs: 14 }); tx(480, 340, '~File() 이 없으면 fclose 가 불리지 않아 핸들이 샌다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) }); return; }
    snippet(40, 300, ['class File {', '    std::FILE* handle_;   // 감쌀 자원'], { fs: 14, op: fade(u, 0.8) }); }

  // ── 3. 소멸자와 RAII — 스코프 시간선 ───────────────────────────
  function s3(t, c) { const { k, u } = c, X0 = 90, X1 = 870, TY = 200, xs = [130, 300, 470, 640, 810];
    const names = ['{ 스코프 진입', 'File() — fopen', 'readLine()', '~File() 정의', '} — ~File() 자동'];
    // 시간선이 지금 beat 의 표지까지 자란다
    const reach = k === 0 ? lerp(X0, xs[0], E(u, 0.2, 0.8)) : lerp(xs[k - 1], xs[k], E(u, 0.2, 1.0));
    el('line', { x1: X0, y1: TY, x2: X1, y2: TY, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 6' });
    el('line', { x1: X0, y1: TY, x2: reach, y2: TY, stroke: INK, 'stroke-width': 3 });
    xs.forEach((x, i) => { if (i > k) return; const s = i === k ? pop(u, 0.9) : 1, col = i === 3 ? INFO : i === 4 ? GOOD : i === 1 ? ACC : INK;
      el('circle', { cx: x, cy: TY, r: 9 * s, fill: i === 3 ? PANEL : col, stroke: col, 'stroke-width': 2.5 });
      tx(x, TY + 34, names[i], { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: i === k ? fade(u, 1.0) : 1 }); });
    // 위: 스택의 f 칸 수명
    tx(X0, 76, '스택의 f', { 'font-size': 15, 'font-weight': 800 });
    const fEnd = k === 0 ? xs[0] + 130 * E(u, 0.6, 1.2) : k === 4 ? lerp(xs[3], xs[4], E(u, 0.2, 1.0)) : Math.min(reach, xs[3] + 40);
    if (reach > xs[0] + 1 || k > 0) { el('rect', { x: xs[0], y: 94, width: Math.max(4, fEnd - xs[0]), height: 34, rx: 6, fill: k === 0 ? SOFT : ACCBG, stroke: k === 0 ? OFF : ACC, 'stroke-width': 2, 'stroke-dasharray': k === 0 ? '5 4' : null });
      mono(xs[0] + 12, 117, k === 0 ? '자리만 잡힘' : 'File f', { 'font-size': 14, 'font-weight': 700, fill: k === 0 ? MUT : ACC }); }
    // 아래: 파일 상태 막대
    tx(X0, 296, 'data.txt', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    el('rect', { x: X0, y: 310, width: X1 - X0, height: 30, rx: 6, fill: SOFT });
    if (k >= 1) { const openFrom = xs[1], openEnd = k === 1 ? lerp(openFrom, openFrom + 40, E(u, 0.9, 1.4)) : k < 4 ? reach : lerp(xs[3], xs[4], E(u, 0.2, 1.0)), w = Math.max(0, openEnd - openFrom);
      el('rect', { x: openFrom, y: 310, width: w, height: 30, rx: 6, fill: GOOD, opacity: 0.85 });
      if (w > 50) mono(openFrom + 10, 330, '열림', { 'font-size': 14, 'font-weight': 700, fill: PANEL }); }
    mono(X0 + 10, 330, '닫힘', { 'font-size': 14, fill: MUT });
    if (k === 4 && u > 1.2) mono(xs[4] + 8, 330, '닫힘', { 'font-size': 14, 'font-weight': 700, fill: INK, opacity: fade(u, 1.2) });
    // beat 별 표시
    if (k === 1) { dot([[xs[1], TY], [xs[1], 310]], seg(u, 1.1, 1.6), GOOD, 7); mono(xs[1] + 14, 268, 'fopen', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.4) }); }
    if (k === 2) { dot([[xs[2], 310], [xs[2], TY]], seg(u, 1.1, 1.7), ACC, 7); mono(xs[2] + 14, 268, 'fgets', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(xs[2], 160, '검사 없이 바로 쓴다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 3) { el('circle', { cx: xs[4], cy: TY, r: 9, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '3 3', opacity: fade(u, 1.4) });
      el('path', { d: `M${xs[3]},${TY - 14} C${xs[3]},150 ${xs[4]},150 ${xs[4]},${TY - 14}`, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.3) });
      tx((xs[3] + xs[4]) / 2, 160, '스코프 끝에서 불릴 자리', { 'text-anchor': 'middle', 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 4) { pill(xs[4], 150, '컴파일러가 넣은 호출', GOOD, pop(u, 1.0), { fs: 14 }); dot([[xs[4], TY], [xs[4], 310]], seg(u, 1.0, 1.5), GOOD, 7);
      tx(480, 390, 'fclose 를 한 줄도 쓰지 않았는데 파일이 닫혔다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.9) }); } }

  // ── 4. 수동 new/delete vs RAII — 예외가 터질 때 ────────────────
  function lane(x, title, o) { o = o || {}; tx(x + 205, 68, title, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: o.col || INK, opacity: o.op ?? 1 });
    zone(x, 82, 410, 106, '스택', { fill: o.frameGone ? SOFT : PANEL, stroke: o.frameGone ? OFF : INK, sw: 2, dash: o.frameGone ? '6 5' : null, op: o.op ?? 1 });
    zone(x, 204, 410, 112, '힙', { fill: SOFT, op: o.op ?? 1 }); }
  function bufBlock(cx, cy, o) { o = o || {}; if ((o.s ?? 1) <= 0.01) return; card(cx, cy, 150, 50, { rx: 8, text: 'Buffer', fs: 16, fw: 800, mono: true, stroke: o.col || INK, fill: o.fill, sw: 2.4, s: o.s, op: o.op }); }
  function s4(t, c) { const { k, u } = c, L = 40, Rr = 510;
    // 왼쪽: manual()
    const lGone = k === 1 ? seg(u, 1.0, 1.5) > 0.5 : k >= 2;
    lane(L, 'manual()', { frameGone: lGone, op: k >= 2 ? 0.55 : 1 });
    if (!lGone) { cellBox(L + 110, 140, { name: '', val: 'p', w: 70, h: 44, fs: 17, fill: ACCBG, stroke: ACC, valCol: ACC, s: k === 0 ? pop(u, 0.3) : 1 }); mono(L + 158, 146, 'Buffer*', { 'font-size': 14, fill: MUT });
      el('line', { x1: L + 110, y1: 162, x2: L + 110, y2: lerp(162, 236, k === 0 ? E(u, 0.8, 1.3) : 1), stroke: ACC, 'stroke-width': 2.6, 'marker-end': k > 0 || u > 1.3 ? 'url(#ra-ahb)' : null }); }
    bufBlock(L + 110, 262, { s: k === 0 ? pop(u, 0.6) : 1, col: lGone ? BAD : INK, fill: lGone ? BADBG : null, op: k >= 2 ? 0.7 : 1 });
    if (k === 0) mono(L + 200, 268, 'new Buffer()', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
    if (k === 1) { bolt(L + 300, 135, pop(u, 0.3)); mono(L + 330, 140, 'risky()', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) });
      mono(L + 250, 172, 'delete p;', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6), 'text-decoration': 'line-through' });
      tx(L + 290, 268, '가리키는 것이 없다', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); }
    if (k >= 1) pill(L + 110, 300 - 6 + 8, '누수', BAD, k === 1 ? pop(u, 1.7) : 1, { fs: 14 });
    // 오른쪽: safe()
    if (k >= 2) { const freed = k === 4 ? seg(u, 0.9, 1.5) : 0, unwind = k === 3 ? E(u, 0.8, 1.8) : k === 4 ? 1 : 0;
      lane(Rr, 'safe()', { op: k === 2 ? fade(u, 0.1) : 1, frameGone: k === 4 && u > 1.6 });
      if (!(k === 4 && u > 1.6)) { el('rect', { x: Rr + 40, y: 112, width: 190, height: 60, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.2, opacity: k === 2 ? fade(u, 0.3) : 1 });
        mono(Rr + 52, 132, 'unique_ptr', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: k === 2 ? fade(u, 0.3) : 1 });
        cellBox(Rr + 110, 152, { val: 'p', w: 60, h: 30, fs: 15, fill: ACCBG, stroke: ACC, valCol: ACC, s: k === 2 ? pop(u, 0.5) : 1 });
        if (freed < 0.5) el('line', { x1: Rr + 110, y1: 168, x2: Rr + 110, y2: lerp(168, 236, k === 2 ? E(u, 0.9, 1.4) : 1), stroke: ACC, 'stroke-width': 2.6, 'marker-end': k > 2 || u > 1.4 ? 'url(#ra-ahb)' : null }); }
      bufBlock(Rr + 110, 262, { s: k === 2 ? pop(u, 0.7) : 1 - freed });
      if (k === 2) mono(Rr + 200, 268, 'make_unique<Buffer>()', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      if (k >= 3) { bolt(Rr + 300, 135, k === 3 ? pop(u, 0.3) : 1); mono(Rr + 330, 140, 'risky()', { 'font-size': 15, 'font-weight': 800, fill: BAD });
        el('path', { d: `M${Rr + 370},176 C${Rr + 400},150 ${Rr + 400},110 ${Rr + 370},92`, fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '5 4', opacity: unwind, 'marker-end': unwind > 0.98 ? 'url(#ra-ahr)' : null });
        tx(Rr + 300, 72 + 128, '스택 되감기', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: unwind, 'text-anchor': 'middle' }); }
      if (k === 4) { mono(Rr + 230, 262, '~unique_ptr() → delete', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) }); check(Rr + 110, 262, 16, pop(u, 1.5)); } }
    // 아래: 로그를 넣어 돌린 결과
    tx(L, 340, '생성자·소멸자에 로그를 넣어 돌린 결과', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    logLines(L + 10, 366, ['Buffer()', 'caught'], k === 0 ? fade(u, 0.7) : k === 1 ? 1 + fade(u, 1.9) : 2);
    if (k === 1) tx(L + 140, 388, '~Buffer() 는 끝내 안 찍힌다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) });
    if (k >= 2) logLines(Rr + 10, 366 - 22 + 22, ['Buffer()', '~Buffer()', 'caught'], k === 2 ? fade(u, 1.0) : k === 3 ? 1 : 1 + seg(u, 1.0, 1.4) + seg(u, 1.9, 2.3), { col: INK });
    if (k === 4) { lock(Rr + 190, 380, u < 2.2, GOOD, pop(u, 2.0) * 0.9); tx(Rr + 212, 386, 'lock_guard 도 같은 원리', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) }); } }

  // ── 5. 소멸 순서 — 스택처럼 거꾸로 ─────────────────────────────
  function s5(t, c) { const { k, u } = c, SX = 120, SW = 220, base = 330, H = 62;
    const objs = ['Lock', 'File', 'Buffer'];
    const out = ['생성: Lock', '생성: File', '생성: Buffer', '소멸: Buffer', '소멸: File', '소멸: Lock'];
    if (k === 0) { card(330, 150, 300, 150, { rx: 12, stroke: INK, sw: 2.2, s: pop(u, 0.2) }); mono(330, 104, 'struct Tag', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3) });
      pill(330, 146, '생성자 → "생성: name"', ACC, pop(u, 0.7), { fs: 14 }); pill(330, 190, '~Tag() → "소멸: name"', GOOD, pop(u, 1.1), { fs: 14 });
      pill(650, 190, 'noexcept', INFO, pop(u, 1.6), { mono: true, fs: 15 }); tx(650, 230, '소멸자는 던지지 않는다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      tx(480, 300, '되감는 중에 또 던지면 std::terminate', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) });
      terminal(580, 318, 340, 92, ['$ ./a.out'], 1, { title: '출력' }); return; }
    tx(SX, 74, '스택 (main 안의 지역 객체)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    el('line', { x1: SX - 10, y1: base + 4, x2: SX + SW + 10, y2: base + 4, stroke: INK, 'stroke-width': 3 });
    // 쌓기: k1 Lock, k2 File·Buffer / 빼기: k3 Buffer, k4 File, k5 Lock
    const inAt = [k === 1 ? 0.2 : -1, k === 2 ? 0.2 : -1, k === 2 ? 0.9 : -1], outAt = [k === 5 ? 0.3 : 9, k === 4 ? 0.3 : 9, k === 3 ? 0.3 : 9];
    objs.forEach((nm, i) => { const present = k >= [1, 2, 2][i] && k <= [5, 4, 3][i]; if (!present) return;
      const y = base - H / 2 - i * (H + 6); let dy = 0, dx = 0, op = 1;
      if (inAt[i] >= 0) { const e = E(u, inAt[i], inAt[i] + 0.6); dy = (1 - e) * -120; op = e; }
      if (k === [5, 4, 3][i]) { const e = E(u, outAt[i], outAt[i] + 0.8); dx = e * 260; op = 1 - e; }
      card(SX + SW / 2 + dx, y + dy, SW, H, { rx: 8, text: 'Tag ' + nm, fs: 17, fw: 800, mono: true, stroke: dx > 0 ? GOOD : INK, op });
      mono(SX - 14, y + 5, String(i + 1), { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: op }); });
    if (k >= 2 && k <= 3) { el('path', { d: `M${SX + SW + 18},${base - H * 1.5 - 6} C${SX + SW + 60},${base - H * 1.5} ${SX + SW + 60},${base - H / 2} ${SX + SW + 18},${base - H / 2}`, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4', 'marker-end': 'url(#ra-ah)', opacity: k === 2 ? fade(u, 1.6) : 1 });
      tx(SX + SW + 66, base - H, 'File 은 Lock 안에서 연다', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.7) : 1 }); }
    const shown = [0, 1 + (u > 0.8 ? 1 : 0), 2 + (u > 0.8 ? 1 : 0) + (u > 1.5 ? 1 : 0), 4 + (u > 1.1 ? 1 : 0), 5 + (u > 1.1 ? 1 : 0), 6 + (u > 1.1 ? 1 : 0)][k];
    terminal(580, 90, 340, 200, ['$ ./a.out'].concat(out), shown, { title: '출력' });
    if (k >= 3) { const pos = k - 3; mono(560, 314, '나중에 생성 → 먼저 소멸', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: k === 3 ? fade(u, 1.4) : 1 }); }
    if (k === 2) mono(SX + SW / 2, 380, '깊이 1 → 3', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
    if (k === 3) mono(SX + SW / 2, 380, '} 에 닿았다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INK, opacity: fade(u, 0.2) });
    if (k === 5) { const nx = (c.beat.destroy && c.beat.destroy.next) || [];
      tx(560, 346, '이어지는 장', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.6) });
      nx.forEach((n, i) => pill(605 + i * 110, 380, n.id, ACC, pop(u, 1.8 + i * 0.2), { mono: true, fs: 14 })); } }

  const quiz = [
    { q: 'Counter의 count_를 private에 두고 increment() 로만 바꾸게 하면 얻는 것은 무엇인가?',
      o: ['실행 속도가 빨라진다', 'count_가 메모리를 덜 쓴다', '값이 바뀌는 길이 하나로 좁아져 상태가 망가지지 않는다'], a: 2,
      why: '바깥 코드는 count_에 직접 닿을 수 없고 public 함수만 부른다. c.count_ = 99는 컴파일 에러가 된다.' },
    { q: 'File 생성자에서 fopen이 실패해 throw 하면 그 File 객체는 어떻게 되는가?',
      o: ['handle_가 nullptr인 채로 남는다', '생성이 끝나지 않아 객체가 존재하지 않는다', '소멸자가 대신 파일을 연다'], a: 1,
      why: '생성자를 끝까지 통과해야 객체가 생긴다. 그래서 세상에 남는 File은 모두 파일이 열려 있는 객체뿐이다.' },
    { q: 'process() 안의 지역 객체 File f는 언제 fclose를 부르는가?',
      o: ['프로그램이 끝날 때', 'GC가 돌 때', '함수의 닫는 중괄호에 닿을 때'], a: 2,
      why: '스택 객체는 스코프를 벗어나는 순간 컴파일러가 소멸자를 부른다. 언제 정리될지 코드만 보고 정확히 안다.' },
    { q: 'risky()가 throw 할 때 manual()의 Buffer는 새고 safe()의 Buffer는 풀리는 이유는 무엇인가?',
      o: ['스택을 되감을 때 지역 객체 unique_ptr의 소멸자가 delete를 부르기 때문에', 'make_unique가 예외를 막기 때문에', 'new는 힙을, make_unique는 스택을 쓰기 때문에'], a: 0,
      why: '되감기는 지나가는 스코프의 지역 객체 소멸자를 모두 부른다. manual()의 delete p 줄은 실행되지 않는다.' },
    { q: 'Lock, File, Buffer 순서로 만든 지역 객체는 어떤 순서로 소멸하는가?',
      o: ['Lock, File, Buffer', 'Buffer, File, Lock', '컴파일러마다 다르다'], a: 1,
      why: '소멸은 생성의 정확한 역순이다. 실행해 보면 소멸: Buffer, File, Lock 순으로 찍힌다.' },
  ];

  const summary = [
    '클래스는 상태를 private에 숨기고 public 함수로만 바꾸게 해서 언제나 유효한 상태를 지킨다.',
    '생성자는 초기화 리스트에서 자원을 잡고, 실패하면 throw해서 반쪽 객체를 남기지 않는다.',
    '소멸자에 해제를 두면 스코프를 벗어나는 순간 컴파일러가 불러 준다. 예외가 나도 같다.',
    '한 스코프의 지역 객체는 만든 순서의 역순으로 소멸한다. Buffer, File, Lock 순이었다.',
  ];
  const review = [
    { q: '파일을 여는 함수에 return이 세 군데 있는데 가끔 핸들이 샌다. 가장 먼저 바꿀 것은 무엇인가?',
      o: ['핸들을 소멸자에서 닫는 클래스로 감싼다', 'return마다 fclose를 하나씩 더 쓴다', '파일을 전역 변수로 옮긴다'], a: 0,
      why: '사람이 모든 출구에 정리 코드를 맞추면 언젠가 빠진다. 소멸자에 두면 return 이든 예외든 스코프를 나갈 때 반드시 닫힌다.' },
    { q: '락을 잡고 파일을 연 뒤 예외가 났다. lock_guard와 File 객체를 썼다면 정리 순서는 어떻게 되는가?',
      o: ['락이 먼저 풀리고 파일이 닫힌다', '파일이 먼저 닫히고 락이 풀린다', '아무것도 정리되지 않는다'], a: 1,
      why: '되감기도 역순 소멸 규칙을 따른다. 나중에 만든 File이 먼저 닫히고 먼저 만든 락이 마지막에 풀린다.' },
    { q: '소멸자 안에서 예외를 던지게 고쳤더니 가끔 프로그램이 즉시 종료된다. 이유는 무엇인가?',
      o: ['소멸자는 두 번 불리기 때문에', '소멸자에서는 cout을 쓸 수 없어서', '이미 되감는 중에 또 예외가 나면 std::terminate가 불리기 때문에'], a: 2,
      why: '소멸자는 기본적으로 noexcept다. 예외로 되감는 도중 소멸자가 다시 던지면 처리할 곳이 없어 프로그램이 끝난다.' },
  ];

  R.page({ title: '객체의 수명과 자원', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
