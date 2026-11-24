/* III-1-1 템플릿 기초 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 심볼 이름·typeid·에러 줄 수는 zig c++ 0.17(clang, libc++, x86_64-windows-gnu)로 코드 블록을 돌려 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, terminal, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const KW = /^(template|typename|class|struct|return|const|int|double|char|auto|public|explicit|void|bool|long|std|requires)$/;
  function ctok(s) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < s.length) { const ch = s[i];
      if (ch === '/' && s[i + 1] === '/') { flush(); out.push([s.slice(i), { fill: MUT }]); return out; }
      if (ch === '"' || ch === "'") { flush(); const e = s.indexOf(ch, i + 1), end = e < 0 ? s.length : e + 1; out.push([s.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  // 코드 한 줄. parts: 문자열 또는 { slot: 보일 글, w: 칸 글자 수, col, hot, s }. o.n: 앞에서부터 보일 글자 수(타이핑)
  // 돌려주는 값: 칸마다 { x, y, w } (가운데 x)
  function row(x, y, parts, o) { o = o || {}; const fs = o.fs || 17, cw = fs * 0.6, n = o.n ?? 1e9, op = o.op ?? 1; let cx = x, used = 0; const slots = [];
    parts.forEach((p) => {
      if (typeof p === 'string') { const vis = p.slice(0, clamp(n - used, 0, p.length)); used += p.length;
        if (vis) spans(cx, y, ctok(vis), { 'font-size': fs, opacity: op }); cx += p.length * cw; return; }
      const w = (p.w || p.slot.length) * cw + 12, sc = used < n ? (p.s ?? 1) : 0; used += 1;
      slots.push({ x: cx + w / 2, y: y - fs * 0.34, w });
      if (sc > 0) { const col = p.col || ACC;
        card(cx + w / 2, y - fs * 0.34, w, fs + 10, { rx: 5, fill: p.hot ? col : p.fill || ACCBG, stroke: col, sw: 2, dash: p.dash, s: sc, op });
        mono(cx + w / 2, y, p.slot, { 'font-size': fs, 'font-weight': 800, fill: p.hot ? PANEL : col, 'text-anchor': 'middle', opacity: op * clamp(sc) }); }
      cx += w + 2; });
    return slots; }
  const plain = (x, y, s, o) => row(x, y, [s], o);
  // 휘는 선 (u 만큼 자란다)
  function arc(x1, y1, x2, y2, bend, u, col, o) { o = o || {}; if (u <= 0) return;
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 - bend, mk = col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)';
    el('path', { d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 1,
      'stroke-dasharray': o.dash ? null : `${clamp(u)} 2`, 'marker-end': u > 0.98 && !o.plain ? mk : null, opacity: o.op ?? 1 }); }
  // 파일 아이콘 (모서리 접힌 종이)
  function fileIcon(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), w = o.w || 92, h = o.h || 58, c = o.stroke || INK;
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 14} L${w / 2},${-h / 2 + 14} V${h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: `M${w / 2 - 14},${-h / 2} V${-h / 2 + 14} H${w / 2}`, fill: 'none', stroke: c, 'stroke-width': 1.6 }, g);
    mono(0, 6, name, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: c }, g); return g; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 함수 템플릿: 타입 자리 T ----------
  const T1 = { x: 64, y1: 82, y2: 120, y3: 154, y4: 186 };
  function tplCard(k, u, o) { o = o || {};
    zone(40, 34, 520, 172, '함수 템플릿 = 설계도', { fill: SOFT });
    const n1 = k === 0 ? Math.round(lerp(0, 22, E(u, 0.2, 1.1))) : 99;
    const d = row(T1.x, T1.y1, ['template <typename ', { slot: 'T', s: k === 0 ? pop(u, 1.2) : 1, hot: o.hot }, '>'], { n: n1 });
    if (k < 1) return { d };
    const s2 = (i) => (k === 1 ? pop(u, 0.5 + i * 0.45) : 1) + bump(o.pulse ?? -9, 0.2 + i * 0.15);
    const n2 = k === 1 ? Math.round(lerp(0, 22, E(u, 0.1, 1.6))) : 99;
    const sl = row(T1.x, T1.y2, [{ slot: 'T', s: s2(0), hot: o.hot }, ' myMax(', { slot: 'T', s: s2(1), hot: o.hot }, ' a, ', { slot: 'T', s: s2(2), hot: o.hot }, ' b) {'], { n: n2 });
    if (k >= 2) { const n3 = k === 2 ? Math.round(lerp(0, 26, E(u, 0.2, 1.2))) : 99;
      plain(T1.x, T1.y3, '    return a > b ? a : b;', { n: n3 }); plain(T1.x, T1.y4, '}', { n: k === 2 ? (u > 1.2 ? 1 : 0) : 1 }); }
    return { d, sl }; }
  function s1(t, c) { const { k, u } = c, b = c.beat;
    const { d, sl } = tplCard(k, u, { pulse: k === 4 ? u : -9 });
    if (k === 0) { note(600, 80, 'T = 나중에 채울 타입 자리', fade(u, 1.4), { fill: ACC });
      note(600, 112, '이 줄만으로는 코드가 0줄 생긴다', fade(u, 1.9), { fill: MUT, 'font-weight': 500 }); return; }
    // T 선언에서 세 자리로 선이 뻗는다
    if (sl) sl.forEach((p, i) => arc(d[0].x, d[0].y + 14, p.x, p.y - 14, 26, k === 1 ? seg(u, 0.6 + i * 0.45, 1.2 + i * 0.45) : 1, ACC, { op: k === 1 ? 1 : 0.45, sw: 1.8 }));
    if (k === 1) { const roles = b.blanks || [];
      lbl(660, 70, 'T가 쓰인 자리', 1, { 'text-anchor': 'start', fill: MUT });
      roles.forEach((r, i) => { const y = 108 + i * 42, s = pop(u, 0.6 + i * 0.45);
        card(890, y - 5, 36, 30, { rx: 5, fill: ACCBG, stroke: ACC, text: r.slot, fs: 16, mono: true, color: ACC, s });
        note(660, y, r.role, fade(u, 0.7 + i * 0.45)); });
      note(660, 250, '세 자리는 같은 T라 함께 채워진다', fade(u, 2.1), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 2) { // 오버로드는 본문 3벌, 템플릿은 1벌
      lbl(600, 64, '오버로드로 쓰면', 1, { 'text-anchor': 'start' });
      ['int', 'double', 'string'].forEach((ty, i) => { const y = 92 + i * 40, s = pop(u, 0.3 + i * 0.3);
        card(760, y, 300, 32, { rx: 6, s, stroke: WARN, fill: WARNBG });
        if (s > 0.5) spans(620, y + 5, ctok(`${ty} myMax(${ty} a, ${ty} b)`), { 'font-size': 13.5 }); });
      mono(925, 135, '×3', { 'font-size': 20, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      lbl(600, 250, '템플릿으로 쓰면', fade(u, 1.6), { 'text-anchor': 'start' });
      card(760, 282, 300, 34, { rx: 6, s: pop(u, 1.8), stroke: GOOD, fill: GOODBG, text: 'return a > b ? a : b;', fs: 14, mono: true });
      mono(925, 287, '×1', { 'font-size': 20, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 2.1) });
      note(600, 344, '비교 로직은 한 벌, 타입만 빈칸', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); return; }
    // k 3, 4: 호출이 빈칸을 채운 모습이 아래로 찍혀 나온다
    const rows = [['myMax(3, 7)', 'int', '7'], ['myMax(2.5, 1.5)', 'double', '2.5'], ['myMax(a, b)', 'string', 'pear']];
    const nRows = k === 3 ? 2 : 3;
    lbl(60, 240, '호출할 때 T가 채워진다', 1, { 'text-anchor': 'start', fill: MUT });
    rows.slice(0, nRows).forEach(([call, ty, out], i) => { const y = 284 + i * 46, a0 = k === 3 ? 0.2 + i * 1.1 : i === 2 ? 0.2 : -9;
      const on = a0 < 0 ? 1 : E(u, a0, a0 + 0.5), fill = a0 < 0 ? 1 : E(u, a0 + 0.5, a0 + 1.0);
      if (on <= 0) return;
      pill(130, y - 6, call, INK, a0 < 0 ? 1 : pop(u, a0), { mono: true, fs: 14 });
      grow(214, y - 6, 252, y - 6, on, MUT);
      const lab = fill > 0.5 ? ty : 'T';
      row(262, y, [{ slot: lab, w: 6, s: 1, hot: fill > 0.5 && fill < 1 }, ' myMax(', { slot: lab, w: 6, hot: fill > 0.5 && fill < 1 }, ' a, ', { slot: lab, w: 6, hot: fill > 0.5 && fill < 1 }, ' b)'], { fs: 15, op: on });
      mono(700, y, '=> ' + out, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: a0 < 0 ? 1 : fade(u, a0 + 0.9) });
      tx(790, y, `T = ${ty}`, { 'font-size': 14, fill: MUT, class: 'mono', opacity: a0 < 0 ? 1 : fade(u, a0 + 0.9) }); });
    if (k === 4) { note(600, 90, '설계도의 T는 그대로 비어 있다', fade(u, 1.2), { fill: ACC });
      note(600, 122, '채워진 쪽은 호출마다 따로 생긴다', fade(u, 1.7), { fill: MUT, 'font-weight': 500 }); } }

  // ---------- 2. 인스턴스화: 심볼 표에 함수가 찍힌다 ----------
  const SYM = { int: ['_Z5myMaxIiET_S0_S0_', 'int myMax<int>(int, int)'], double: ['_Z5myMaxIdET_S0_S0_', 'double myMax<double>(double, double)'],
    string: ['_Z5myMaxINSt3__112basic_string…', 'string myMax<string>(string, string)'] };
  const CALLS = [['myMax(3, 7);', 1], ['myMax(2.5, 1.5);', 2], ['myMax<double>(3, 4);', 3], ['myMax(3, 4.5);', 4], ['myMax<double>(3, 4.5);', 4], ['myMax(a, b);  // string', 5]];
  function s2(t, c) { const { k, u } = c, ins = c.beat.instances || [], pn = c.prev ? (c.prev.instances || []).length : 0;
    zone(40, 30, 380, 56, null, { fill: ACCBG }); row(56, 64, ['template <typename ', { slot: 'T' }, '> T myMax(T, T)'], { fs: 15 });
    // main 의 호출 목록
    tx(44, 118, 'main()', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    CALLS.forEach(([s, kk], i) => { if (kk > k) return; const y = 150 + i * 34, cur = kk === k;
      const bad = i === 3, op = cur ? fade(u, i === 4 ? 1.5 : 0.1) : 1;
      if (cur && op > 0) el('rect', { x: 40, y: y - 20, width: 5, height: 28, rx: 2, fill: bad ? BAD : ACC, opacity: op });
      plain(56, y, s, { fs: 15, op: op * (cur ? 1 : 0.55) });
      if (bad && (k > 3 || u > 1.2)) cross(300, y - 5, 8, k > 3 ? 1 : pop(u, 1.2)); });
    if (k === 0) mono(56, 190, '// 아직 호출이 없다', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.3) });
    // 심볼 표 (컴파일 결과)
    zone(470, 30, 460, 300, 'main.o 안의 함수 (컴파일 결과)', { fill: SOFT });
    const types = ins.map((x) => x.type);
    types.forEach((ty, i) => { const y = 78 + i * 74, isNew = i >= pn && k > 0, s = isNew ? pop(u, 1.0) : 1; if (!SYM[ty]) return;
      const hot = (k === 2 || k === 3 || k === 4) && ty === 'double';
      card(700, y + 14, 436, 62, { rx: 8, s, stroke: hot && k >= 2 ? ACC : GRID, sw: hot && k >= 2 ? 2.6 : 1.5 });
      if (s > 0.6) { mono(494, y + 8, SYM[ty][0], { 'font-size': 13.5, fill: MUT });
        spans(494, y + 32, ctok(SYM[ty][1]), { 'font-size': 14.5 }); } });
    if (k === 0) { mono(700, 160, '0개', { 'font-size': 34, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      sub(700, 192, '틀만 있으면 함수는 하나도 안 생긴다', fade(u, 0.8), { 'font-size': 14.5 }); }
    // 호출 → 설계도 → 표 로 흐르는 점
    if (k === 1 || k === 2 || k === 5) { const ci = k === 1 ? 0 : k === 2 ? 1 : 5, y0 = 150 + ci * 34 - 5, ty = k === 5 ? 2 : k - 1;
      dot([[250, y0], [430, 58], [470, 92 + ty * 74]], seg(u, 0.1, 0.95), ACC, 7); }
    if (k === 3) { const y0 = 150 + 2 * 34 - 5; arc(270, y0, 470, 166, 30, seg(u, 0.3, 1.2), ACC);
      pill(370, 270, '3, 4 → 3.0, 4.0', ACC, pop(u, 1.2), { mono: true, fs: 13.5 });
      note(480, 362, '새로 찍지 않고 이미 있는 myMax<double>을 쓴다', fade(u, 1.6), { fill: ACC }); }
    if (k === 4) { // 추론 충돌: T 하나에 두 후보
      const bx = 380, by = 290; card(bx, by, 50, 40, { rx: 6, text: 'T', fs: 20, mono: true, fill: BADBG, stroke: BAD, color: BAD, s: pop(u, 0.2) });
      pill(bx - 80, by + 58, '3 → int', INK, pop(u, 0.4), { mono: true, fs: 13.5 }); pill(bx + 80, by + 58, '4.5 → double', INK, pop(u, 0.6), { mono: true, fs: 13.5 });
      grow(bx - 70, by + 42, bx - 16, by + 22, seg(u, 0.5, 0.9), BAD); grow(bx + 70, by + 42, bx + 16, by + 22, seg(u, 0.7, 1.1), BAD);
      note(470, 404, '하나로 못 정해 컴파일 에러, <double>을 적으면 해결', fade(u, 1.7), { fill: BAD }); }
    // 개수
    const cnt = Math.round(tween(pn, ins.length, u));
    mono(930, 384, `소스의 틀 1개 · 생성된 함수 ${cnt}개`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: cnt >= 2 ? WARN : INK, opacity: k === 3 || k === 4 ? 0.0 : 1 }); }

  // ---------- 3. 클래스 템플릿: Box<T> → Box<int>, Box<string> ----------
  function classBox(cx, y, w, head, rows, o) { o = o || {}; const rh = 30, h = 40 + rows.length * rh, s = o.s ?? 1; if (s <= 0) return;
    const g = R.G(cx, y + h / 2, s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2 }, g);
    el('line', { x1: -w / 2, y1: -h / 2 + 36, x2: w / 2, y2: -h / 2 + 36, stroke: o.stroke || INK, 'stroke-width': 1.6 }, g);
    spans(-w / 2 + 14, -h / 2 + 24, ctok(head), { 'font-size': 15, 'font-weight': 700 }, g);
    rows.forEach((r, i) => { const op = o.rowOp ? o.rowOp(i) : 1; if (op <= 0) return; spans(-w / 2 + 14, -h / 2 + 60 + i * rh, ctok(r), { 'font-size': 14.5, opacity: op }, g); });
    return h; }
  function s3(t, c) { const { k, u } = c;
    lbl(170, 30, '설계도', 1, { fill: MUT });
    classBox(170, 44, 260, 'template<class T> Box', ['T value;', 'Box(T v)', 'T get() const'], { fill: ACCBG, stroke: ACC, rowOp: (i) => (i === 0 ? (k === 0 ? fade(u, 0.6) : 1) : k === 0 ? 0 : k === 1 ? fade(u, 0.3 + i * 0.4) : 1) });
    if (k === 0) { note(330, 110, '← 멤버 타입이 T로 비어 있다', fade(u, 1.0), { fill: ACC }); note(40, 260, '아직 어떤 Box도 생기지 않았다', fade(u, 1.6), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 1) { note(330, 150, '← 멤버 함수도 T를 함께 쓴다', fade(u, 1.2), { fill: ACC }); note(40, 260, '타입이 정해질 때 이 함수들도 같이 찍힌다', fade(u, 1.8), { fill: MUT, 'font-weight': 500 }); return; }
    const sI = k === 2 ? pop(u, 0.4) : 1, sS = k === 3 ? pop(u, 0.4) : k > 3 ? 1 : 0;
    if (k === 2) grow(302, 90, 352, 90, E(u, 0.1, 0.4), ACC); if (k === 3) grow(302, 130, 352, 230, E(u, 0.1, 0.4), ACC);
    lbl(470, 30, '컴파일러가 만든 클래스', 1, { fill: MUT });
    classBox(470, 44, 230, 'class Box<int>', ['int value;', 'int get() const'], { s: sI });
    if (sS > 0) classBox(470, 190, 230, 'class Box<string>', ['string value;', 'string get() const'], { s: sS });
    // 객체: 메모리 칸
    lbl(800, 30, '만든 객체', 1, { fill: MUT });
    const oa = k === 2 ? fade(u, 1.1) : 1;
    tx(680, 84, 'a', { 'font-size': 17, 'font-weight': 800, class: 'mono', opacity: oa });
    R.cells(704, 62, ['', '', '', ''], { w: 34, h: 36, gap: 0, style: () => ({ op: oa, fill: ACCBG, stroke: ACC }) });
    mono(772, 87, '42', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: oa });
    sub(772, 118, 'int 4바이트', oa);
    if (sS > 0) { const ob = k === 3 ? fade(u, 1.1) : 1;
      tx(680, 224, 'b', { 'font-size': 17, 'font-weight': 800, class: 'mono', opacity: ob });
      el('rect', { x: 704, y: 202, width: 216, height: 36, rx: 4, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: ob });
      mono(812, 227, '"hi"', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: ob });
      sub(812, 258, 'std::string 24바이트 (libc++)', ob); }
    if (k === 3) note(40, 380, 'Box<int>와 Box<string>은 서로 다른 클래스다', fade(u, 1.8), { fill: WARN });
    if (k === 4) { fly(772, 150, 640, 362, seg(u, 0.3, 1.2), '42 : int', { mono: true, stay: true });
      fly(812, 284, 760, 362, seg(u, 0.8, 1.7), '"hi" : string', { mono: true, stay: true, fill: INK });
      note(40, 300, 'a.get()은 int, b.get()은 string', fade(u, 1.6));
      note(40, 330, '꺼낼 때 형변환이 없다', fade(u, 2.0), { fill: GOOD });
      mono(560, 404, 'cout << a.get() << " " << b.get();  // => 42 hi', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 5) { zone(40, 300, 880, 104, null, { fill: SOFT });
      row(60, 336, ['std::vector<', { slot: 'T' }, '>'], { fs: 16 });
      grow(240, 330, 300, 330, E(u, 0.2, 0.6), ACC);
      row(312, 336, ['std::vector<', { slot: 'int', fill: GOODBG, col: GOOD }, '> v'], { fs: 16, op: fade(u, 0.5) });
      R.cells(560, 314, [1, 2, 3], { w: 44, h: 40, gap: 4, style: (i) => ({ s: pop(u, 0.8 + i * 0.25) }) });
      note(60, 388, 'STL 컨테이너도 전부 이 방식으로 찍어낸 클래스다', fade(u, 1.6), { fill: ACC }); } }

  // ---------- 4. 특수화 · 기본 인자 · 제네릭 람다 ----------
  const STR = { a: ['a', 'p', 'p', 'l', 'e', '\\0'], b: ['p', 'e', 'a', 'r', '\\0'] };
  function s4(t, c) { const { k, u } = c;
    // 기본 템플릿 카드
    zone(40, 30, 420, 92, '기본 템플릿', { fill: GOODBG, stroke: k === 4 ? GOOD : 'none' });
    row(56, 76, k >= 3 ? ['template <typename ', { slot: 'T = int', s: k === 3 ? pop(u, 0.3) : 1, col: GOOD, fill: PANEL }, '>'] : ['template <typename T>'], { fs: 15, op: k === 0 ? fade(u, 0.2) : 1 });
    plain(56, 104, 'T myMax(T a, T b)  { a > b ... }', { fs: 15, op: k === 0 ? fade(u, 0.5) : 1 });
    if (k === 0) { note(40, 170, '대부분의 타입은 이 한 벌로 처리한다', fade(u, 1.1), { fill: MUT, 'font-weight': 500 }); return; }
    // 특수화 카드
    const sp = k === 1 ? pop(u, 0.2) : 1;
    zone(40, 142, 420, 112, 'const char* 전용 (완전 특수화)', { fill: WARNBG, stroke: k === 4 ? WARN : 'none', op: clamp(sp) });
    plain(56, 188, 'template <>', { fs: 15, op: clamp(sp) });
    plain(56, 214, 'const char* myMax<const char*>(a, b)', { fs: 15, op: clamp(sp) });
    plain(56, 240, k >= 2 ? '  { strcmp(a, b) > 0 ? a : b }' : '  { ... }', { fs: 15, op: k === 2 ? fade(u, 1.6) : clamp(sp) });
    // 문자열 리터럴 메모리 (주소는 예시)
    if (k <= 2) { const x0 = 560, cw2 = 46;
      tx(520, 52, '문자열 리터럴 (주소는 예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['a', STR.a, 90, '0x4050'], ['b', STR.b, 186, '0x4040']].forEach(([nm, chs, y, ad], j) => {
        tx(520, y + 26, nm, { 'font-size': 17, 'font-weight': 800, class: 'mono' });
        chs.forEach((ch, i) => { const hot = k === 2 && i === 0; card(x0 + i * cw2 + cw2 / 2, y + 20, cw2 - 2, 38, { rx: 4, text: ch, fs: 16, mono: true, fill: hot ? (j === 0 ? WARNBG : GOODBG) : PANEL, stroke: hot ? (j === 0 ? WARN : GOOD) : GRID, sw: hot ? 2.6 : 1.5 }); });
        mono(x0 + chs.length * cw2 + 10, y + 26, ad, { 'font-size': 13.5, fill: k === 1 ? BAD : MUT, 'font-weight': k === 1 ? 700 : 400 }); });
      if (k === 1) { note(520, 290, 'a > b는 글자가 아니라 주소를 비교한다', fade(u, 1.0), { fill: BAD });
        mono(520, 322, '0x4050 > 0x4040  =>  "apple" ?', { 'font-size': 15, fill: BAD, opacity: fade(u, 1.6) });
        sub(700, 350, '어느 쪽이 큰지는 링커가 둔 위치에 달렸다', fade(u, 2.0), { 'font-size': 14 }); }
      if (k === 2) { mono(560 + 23, 162, "'a' 97", { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 0.5) });
        mono(560 + 23, 258, "'p' 112", { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.8) });
        note(520, 300, '첫 글자에서 p가 크다', fade(u, 1.2)); mono(520, 332, 'strcmp("apple", "pear") < 0  =>  pear', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); }
      return; }
    if (k === 3) { note(520, 70, '<타입>을 못 정하면 int로 채운다', fade(u, 0.8), { fill: GOOD });
      note(520, 102, 'vector의 두 번째 인자(할당자)도', fade(u, 1.3), { fill: MUT, 'font-weight': 500 });
      note(520, 128, '기본값이 있는 템플릿 인자다', fade(u, 1.3), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 4) { // 호출마다 다른 버전으로
      [['myMax(3, 7)', 76, '7', GOOD], ['myMax("apple", "pear")', 198, 'pear', WARN]].forEach(([call, ty, out, col], i) => { const y = 300 + i * 56, a0 = 0.2 + i * 0.8;
        pill(640, y, call, INK, pop(u, a0), { mono: true, fs: 14 });
        arc(640 - (i ? 110 : 60), y - 18, 462, ty, 40, seg(u, a0 + 0.3, a0 + 0.9), col);
        mono(830, y + 6, '=> ' + out, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, a0 + 0.9) }); });
      note(520, 70, '인자 타입을 보고 컴파일러가 고른다', fade(u, 1.8)); return; }
    // k 5: 제네릭 람다 = 컴파일러가 만든 템플릿 operator()
    zone(40, 270, 880, 136, null, { fill: SOFT });
    plain(60, 302, 'auto add = [](auto x, auto y) { return x + y; };', { fs: 15, n: Math.round(lerp(0, 50, E(u, 0.1, 1.0))) });
    grow(480, 316, 480, 340, seg(u, 1.0, 1.3), ACC);
    plain(60, 368, 'struct 이름없음 { template<class A, class B> auto operator()(A x, B y) const; };', { fs: 14, op: fade(u, 1.3) });
    mono(60, 396, 'add(2, 3)  // => 5', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
    note(520, 70, 'auto 매개변수는 템플릿과 같다', fade(u, 1.6), { fill: ACC }); }

  // ---------- 5. C++ 코드 생성 vs Java 타입 소거 ----------
  const BOARD = [['타입별 코드', '타입마다 생성', '하나로 소거', 0], ['런타임 타입', '살아 있다', '지워진다', 0], ['실행 속도', '인라인 가능', '박싱 비용', 0],
    ['바이너리', '타입 수만큼', '작게 유지', 1], ['빌드 시간', '느리다', '가볍다', 1], ['에러 위치', '사용 지점', '선언 지점', 1]];
  function board(k, u) { const x = 572, y = 36, rh = 52;
    tx(x + 108, y + 14, 'C++', { 'font-size': 15, 'font-weight': 800, fill: ACC }); tx(x + 238, y + 14, 'Java', { 'font-size': 15, 'font-weight': 800, fill: INFO });
    BOARD.slice(0, k + 1).forEach(([a, cp, jv, w], i) => { const yy = y + 30 + i * rh, op = i === k ? fade(u, 0.2) : 1;
      el('line', { x1: x, y1: yy, x2: x + 360, y2: yy, stroke: GRID, 'stroke-width': 1.2, opacity: op });
      el('rect', { x: x + (w ? 230 : 100), y: yy + 6, width: 128, height: rh - 12, rx: 6, fill: GOODBG, opacity: op * (i === k ? fade(u, 1.0) : 1) });
      tx(x, yy + 32, a, { 'font-size': 14.5, 'font-weight': 700, opacity: op });
      tx(x + 108, yy + 32, cp, { 'font-size': 14, opacity: op, fill: w ? MUT : INK }); tx(x + 238, yy + 32, jv, { 'font-size': 14, opacity: op, fill: w ? INK : MUT }); }); }
  function block(cx, cy, w, h, text, col, s) { card(cx, cy, w, h, { rx: 6, text, fs: 14, mono: true, fill: PANEL, stroke: col, sw: 2.2, s }); }
  function s5(t, c) { const { k, u } = c; board(k, u);
    el('line', { x1: 548, y1: 30, x2: 548, y2: 400, stroke: GRID, 'stroke-width': 1.5 });
    if (k === 0) { lbl(150, 46, 'C++', 1, { fill: ACC });
      pill(110, 92, 'myMax(3, 7)', INK, pop(u, 0.2), { mono: true, fs: 13.5 }); pill(110, 148, 'myMax(2.5, 1.5)', INK, pop(u, 0.4), { mono: true, fs: 13.5 });
      grow(196, 92, 300, 92, seg(u, 0.6, 1.0), ACC); grow(206, 148, 300, 148, seg(u, 0.8, 1.2), ACC);
      block(400, 92, 180, 40, 'myMax<int>', ACC, pop(u, 1.0)); block(400, 148, 180, 40, 'myMax<double>', ACC, pop(u, 1.2));
      lbl(150, 226, 'Java', 1, { fill: INFO });
      pill(110, 270, 'List<String>', INK, pop(u, 0.5), { mono: true, fs: 13.5 }); pill(110, 326, 'List<Integer>', INK, pop(u, 0.7), { mono: true, fs: 13.5 });
      grow(196, 270, 300, 296, seg(u, 1.2, 1.6), INFO); grow(200, 326, 300, 300, seg(u, 1.3, 1.7), INFO);
      block(400, 298, 180, 44, 'List (Object)', INFO, pop(u, 1.7));
      sub(400, 346, '둘이 한 클래스로 합쳐진다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 1) { terminal(40, 40, 480, 150, ['$ ./a.exe', 'typeid(int).name()    i', 'typeid(double).name() d'], k === 1 ? lerp(0, 3, E(u, 0.2, 1.4)) : 3, { title: 'C++' });
      lbl(150, 236, 'Java', 1, { fill: INFO });
      mono(60, 280, 'new ArrayList<String>().getClass()', { 'font-size': 14.5, opacity: fade(u, 1.2) });
      mono(60, 308, '  == new ArrayList<Integer>().getClass()', { 'font-size': 14.5, opacity: fade(u, 1.4) });
      mono(60, 344, '=> true', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.8) });
      sub(280, 380, '실행 중에는 String과 Integer를 구분할 수 없다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 2) { tx(40, 46, 'C++ · myMax<int>를 -O2로 컴파일', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      ['mov   eax, edx', 'cmp   ecx, edx', 'cmovg eax, ecx', 'ret'].forEach((s, i) => mono(64, 84 + i * 26, s, { 'font-size': 15, opacity: fade(u, 0.2 + i * 0.25) }));
      sub(390, 110, 'int 그대로 비교 3줄', fade(u, 1.3), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 });
      sub(390, 136, '(스택 프레임 줄은 뺐다)', fade(u, 1.5), { 'font-size': 13.5 });
      tx(40, 230, 'Java · int를 Integer로 감싼다', { 'font-size': 15, 'font-weight': 700, fill: INFO });
      card(100, 300, 70, 44, { rx: 6, text: '3', fs: 18, mono: true, s: pop(u, 1.0) });
      grow(140, 300, 230, 300, seg(u, 1.3, 1.7), INFO);
      card(330, 300, 180, 70, { rx: 8, stroke: INFO, sw: 2.2, text: 'Integer 객체\nvalue = 3', fs: 14, s: pop(u, 1.7) });
      sub(330, 362, '힙 객체 + 참조 따라가기', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 3) { tx(40, 46, '같은 로직이 바이너리에 쌓이는 양', { 'font-size': 15, 'font-weight': 700 });
      lbl(160, 380, 'C++', 1, { fill: ACC }); lbl(400, 380, 'Java', 1, { fill: INFO });
      ['myMax<int>', 'myMax<double>', 'myMax<string>'].forEach((s, i) => block(160, 330 - i * 54, 190, 44, s, ACC, pop(u, 0.3 + i * 0.4)));
      block(400, 330, 190, 44, 'myMax', INFO, pop(u, 0.4));
      sub(280, 100, '타입을 하나 더 쓸 때마다 C++ 쪽에 한 칸', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 4) { tx(40, 46, '헤더를 include 한 파일마다 다시 생성', { 'font-size': 15, 'font-weight': 700 });
      fileIcon(110, 120, 'util.h', { fill: ACCBG, stroke: ACC, s: pop(u, 0.1) });
      ['a.cpp', 'b.cpp', 'c.cpp'].forEach((f, i) => { const x = 110 + i * 150, y = 240, a0 = 0.4 + i * 0.35;
        if (i) fileIcon(x, y, f, { s: pop(u, a0) }); else fileIcon(x, y, f, { s: pop(u, a0) });
        grow(110, 150, x, y - 32, seg(u, a0, a0 + 0.4), ACC, { sw: 1.8 });
        pill(x, y + 54, 'myMax<int>', ACC, pop(u, a0 + 0.6), { mono: true, fs: 13.5 }); });
      grow(410, 294, 470, 340, seg(u, 1.9, 2.2), MUT);
      sub(280, 384, '링커가 하나만 남기지만, 컴파일은 세 번 했다', fade(u, 2.2), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); return; }
    // k 5: 에러가 사용 지점에서
    tx(40, 46, '비교 안 되는 타입을 넣으면', { 'font-size': 15, 'font-weight': 700 });
    plain(56, 92, 'template <typename T>', { fs: 15 }); plain(56, 120, 'T myMax(T a, T b) {', { fs: 15 });
    plain(56, 148, '    return a > b ? a : b;', { fs: 15 });
    el('path', { d: 'M128,156 q5,6 10,0 t10,0 t10,0 t10,0 t10,0', fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.0) });
    plain(56, 210, 'myMax(p, q);   // Obj에는 > 가 없다', { fs: 15, op: fade(u, 0.3) });
    arc(110, 194, 140, 166, -20, seg(u, 0.6, 1.1), BAD);
    note(40, 266, 'C++: 템플릿 본문 안쪽 줄에서 에러가 난다', fade(u, 1.3), { fill: BAD });
    note(40, 298, 'Java: 선언의 타입 경계에서 바로 걸린다', fade(u, 1.7), { fill: INFO });
    note(40, 350, 'C#은 중간: 값 타입만 특화 코드를 만든다', fade(u, 2.1), { fill: MUT, 'font-weight': 500 }); }

  // ---------- 6. 실무 실패 사례 ----------
  function s6(t, c) { const { k, u } = c;
    if (k === 0) { fileIcon(160, 120, 'util.h', { fill: ACCBG, stroke: ACC, s: pop(u, 0.2), w: 120, h: 76 });
      mono(160, 190, '#pragma once', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.7) });
      ['main.cpp', 'other.h'].forEach((f, i) => { const x = 460 + i * 220; fileIcon(x, 120, f, { s: pop(u, 0.6 + i * 0.3), w: 110 }); arc(x - 56, 120, 222, 120, 30, seg(u, 0.9 + i * 0.3, 1.4 + i * 0.3), MUT); });
      note(420, 230, 'main.cpp가 util.h를 두 번 만나도', fade(u, 1.6));
      note(420, 262, '내용은 한 번만 들어간다', fade(u, 1.9), { fill: ACC });
      note(60, 330, '템플릿을 담을 헤더부터 준비한다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 1) { // 정의를 .cpp 에 두면 링크 에러
      const L = [[110, 'main.cpp', 'main.o', 'myMax<int> 필요 (없음)', BAD], [110, 'util.cpp', 'util.o', '정의만 있고 생성 0개', MUT]];
      L.forEach(([x, f, o, s, col], i) => { const y = 80 + i * 130, a0 = i * 0.4;
        fileIcon(x, y, f, { s: pop(u, a0), w: 112 }); grow(x + 60, y, x + 150, y, seg(u, a0 + 0.3, a0 + 0.7), MUT);
        tx(x + 106, y - 12, '컴파일', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, a0 + 0.3) });
        fileIcon(x + 210, y, o, { s: pop(u, a0 + 0.7), w: 104, stroke: i === 0 ? BAD : INK });
        tx(x + 210, y + 50, s, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, a0 + 0.9) });
        grow(x + 266, y, 520, 146, seg(u, 1.4, 1.8), MUT); });
      card(600, 146, 140, 50, { rx: 8, text: '링커', fs: 16, s: pop(u, 1.7) });
      mono(560, 222, 'lld-link: error: undefined symbol:', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) });
      mono(560, 246, '  int myMax<int>(int, int)', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) });
      zone(40, 330, 880, 74, null, { fill: GOODBG, op: fade(u, 2.3) });
      note(60, 374, '고침: 정의를 util.h에 두면 main.o 안에서 myMax<int>가 만들어진다', fade(u, 2.3), { fill: GOOD }); return; }
    if (k === 2) { tx(40, 50, '서로 다른 타입마다 Box가 통째로 하나씩', { 'font-size': 15, 'font-weight': 700 });
      ['Box<int>', 'Box<long>', 'Box<float>', 'Box<A>', 'Box<B>', 'Box<C>', 'Box<D>', 'Box<E>'].forEach((s, i) => { const col = i % 4, rw = Math.floor(i / 4);
        block(130 + col * 210, 110 + rw * 64, 180, 46, s, WARN, pop(u, 0.2 + i * 0.16)); });
      const n = Math.min(8, Math.floor(seg(u, 0.2, 1.5) * 8.99));
      mono(900, 260, `${n}개`, { 'font-size': 26, 'font-weight': 800, fill: WARN, 'text-anchor': 'end' });
      zone(40, 296, 880, 104, null, { fill: GOODBG, op: fade(u, 1.8) });
      note(60, 334, '고침: 타입과 무관한 부분은 비템플릿 함수로 뺀다', fade(u, 1.8), { fill: GOOD });
      note(60, 368, '필요한 타입만 쓰면 생성 코드도 그만큼만', fade(u, 2.1), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 3) { // concepts 관문
      el('rect', { x: 400, y: 40, width: 160, height: 330, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.1) });
      tx(480, 72, 'totally_ordered', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', class: 'mono' });
      tx(480, 96, '< > == 가 되는가', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      [['int', 1], ['double', 1], ['std::string', 1], ['Obj', 0]].forEach(([ty, ok], i) => { const y = 140 + i * 58, a0 = 0.3 + i * 0.4, g = E(u, a0, a0 + 0.8);
        const x = ok ? lerp(150, 790, g) : lerp(150, 330, g);
        pill(x, y, ty, ok ? GOOD : BAD, 1, { mono: true, fs: 14, op: fade(u, a0 - 0.2) });
        if (!ok && g >= 1) cross(372, y, 9, pop(u, a0 + 0.8)); if (ok && g >= 1) check(880, y, 9, 1); });
      plain(40, 402, 'template <std::totally_ordered T>  T myMax(T a, T b)', { fs: 14.5, op: fade(u, 2.0) }); return; }
    // k 4: 제약이 있으면 에러가 호출한 줄에서 난다 (clang 실측)
    tx(40, 46, 'myMax(p, q)에서 Obj에 > 가 없을 때 첫 에러 위치', { 'font-size': 15, 'font-weight': 700 });
    mono(60, 84, '제약 없음   util.h 본문 줄: invalid operands (Obj, Obj)', { 'font-size': 14, fill: BAD, opacity: fade(u, 0.3) });
    mono(60, 112, 'concepts    호출한 줄: constraints not satisfied', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.7) });
    tx(40, 170, '라이브러리 깊은 곳일수록 차이가 크다: list에 sort', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
    const mx = Math.max(ERR.plain, ERR.concept);
    tx(40, 222, 'std::sort', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.0) });
    tx(40, 292, 'ranges::sort', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: GOOD, opacity: fade(u, 1.0) });
    R.hbar(170, 206, 600, ERR.plain * E(u, 1.1, 1.9), mx, { col: BAD, text: `${ERR.plain}줄`, h: 22 });
    mono(170, 252, ERR.plainHead, { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.7) });
    R.hbar(170, 276, 600, ERR.concept * E(u, 1.4, 2.0), mx, { col: GOOD, text: `${ERR.concept}줄`, h: 22 });
    mono(170, 322, ERR.conceptHead, { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.9) });
    note(40, 380, '정의는 헤더에, T에는 제약을, 인스턴스는 필요한 만큼만', fade(u, 2.2), { fill: ACC }); }
  // zig c++ 0.17 실측: std::sort(l.begin(), l.end()) / std::ranges::sort(l) 를 list<int> 에 쓴 stderr 줄 수와 첫 에러 위치
  const ERR = { plain: 138, concept: 22, plainHead: 'make_heap.h:37 error: invalid operands … (에러 4개)', conceptHead: 'main.cpp:3 error: no matching function (에러 1개)' };

  // ---------- 확인 문제 ----------
  const quiz = [
    { q: 'template<typename T> T myMax(T a, T b) 한 줄을 써 두기만 했을 때 생기는 실행 코드는 무엇인가?',
      o: ['int·double·string 용 함수 세 개', '아무것도 없다', 'T를 Object로 바꾼 함수 하나'], a: 1,
      why: '템플릿은 설계도라서 호출이 있어야 그 타입의 함수가 만들어진다. 정의만 있으면 생성된 함수는 0개다.' },
    { q: 'myMax(3, 4.5)가 컴파일 에러인 까닭은 무엇인가?',
      o: ['두 인자가 T 하나를 int와 double로 서로 다르게 정하려 해서', '3을 double로 바꿀 수 없어서', 'myMax<double>이 아직 만들어지지 않아서'], a: 0,
      why: 'a와 b가 같은 T인데 3은 int, 4.5는 double이라 추론이 부딪친다. myMax<double>(3, 4.5)처럼 적으면 해결된다.' },
    { q: 'Box<int> a(42); Box<std::string> b("hi");를 쓴 뒤 두 클래스의 관계는 무엇인가?',
      o: ['한 클래스를 타입만 바꿔 같이 쓴다', 'Box<string>이 Box<int>를 상속한다', '이름만 닮은 서로 다른 두 클래스다'], a: 2,
      why: '클래스 템플릿도 타입마다 클래스를 통째로 새로 찍는다. 멤버 타입도 크기도 기계어도 다르다.' },
    { q: 'const char* 용 myMax를 따로 특수화한 이유는 무엇인가?',
      o: ['기본 버전의 a > b가 글자가 아니라 주소를 비교해서', 'const char*는 템플릿 인자가 될 수 없어서', '문자열 비교가 int보다 느려서'], a: 0,
      why: '포인터끼리 >는 주소 비교라 "apple"과 "pear" 중 어느 것이 나올지 위치에 달린다. 특수화에서 strcmp로 내용을 비교한다.' },
    { q: 'C++ 템플릿과 Java 제네릭을 가르는 차이는 무엇인가?',
      o: ['C++만 컴파일 시점에 타입을 검사한다', 'Java는 실행 중에도 List<String>과 List<Integer>를 구분한다', 'C++는 타입마다 기계어를 따로 만들고 Java는 하나로 합친다'], a: 2,
      why: 'C++는 myMax<int>와 myMax<double>을 따로 찍는 코드 생성이고, Java는 타입을 지워 List 하나로 합친다.' },
    { q: '템플릿 정의를 util.cpp에만 두고 main.cpp에서 myMax(3, 7)을 부르면 어떻게 되나?',
      o: ['main.cpp 컴파일 단계에서 바로 에러가 난다', '컴파일은 되지만 링크에서 myMax<int>를 못 찾는다', 'util.cpp가 알아서 int 버전을 만들어 준다'], a: 1,
      why: 'main.cpp는 선언만 보고 호출을 남기고, util.cpp는 int로 쓰인 적이 없어 아무것도 만들지 않는다. 그래서 링커가 심볼을 못 찾는다.' },
  ];

  // ---------- 정리 · 복습 ----------
  const summary = [
    '함수 템플릿은 타입 자리를 T로 비운 설계도이고, 비교 로직은 한 벌만 쓴다.',
    '호출을 만나면 컴파일러가 그 타입 전용 함수를 찍는다. 쓰지 않은 타입은 생기지 않는다.',
    '클래스도 같아서 Box<int>와 Box<string>은 서로 다른 클래스로 각각 생성된다.',
    '정의는 헤더에 두고, T에는 concepts로 제약을 걸어 에러를 짧게 만든다.',
  ];
  const review = [
    { q: '헤더에 Box<T>를 두고 30가지 타입으로 썼더니 바이너리가 크게 불었다. 먼저 해 볼 일은?',
      o: ['타입과 무관한 공통 코드를 비템플릿 함수로 빼낸다', '모든 Box 멤버에 inline을 붙인다', '정의를 .cpp로 옮겨 숨긴다'], a: 0,
      why: '타입마다 클래스가 통째로 찍히니 공통 부분이 30번 복제된다. 정의를 .cpp로 숨기면 오히려 링크 에러가 난다.' },
    { q: 'myMax(p, q)에서 Obj에 >가 없어 수백 줄 에러가 났다. 어디를 고치는 것이 좋은가?',
      o: ['호출부에 myMax<Obj>를 명시한다', 'T에 std::totally_ordered 제약을 건다', 'Obj를 const char*로 특수화한다'], a: 1,
      why: '제약을 걸면 비교할 수 없는 타입은 관문에서 막혀 짧은 에러 한 덩어리로 끝난다. 명시 지정은 에러를 없애지 못한다.' },
    { q: 'myMax("apple", "pear")가 컴파일러에 따라 다른 답을 냈다. 가장 그럴듯한 원인은?',
      o: ['T가 std::string으로 추론되어서', 'strcmp가 대소문자를 구분해서', '기본 템플릿이 두 리터럴의 주소를 비교해서'], a: 2,
      why: '인자는 const char*로 추론되고 기본 버전의 >는 주소를 비교한다. 리터럴 위치는 링커가 정하므로 결과가 달라질 수 있다.' },
  ];

  R.page({ title: '템플릿 인스턴스화', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
