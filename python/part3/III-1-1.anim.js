/* III-1-1 이터레이터·제너레이터 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 python 3.12.10 으로 코드 블록을 직접 돌려 얻은 값이다.
 *   sys.getsizeof(big_list) = 8448728, sys.getsizeof(big_gen) = 200
 *   tracemalloc: 1,000,000개 리스트(int 객체 포함) ≈ 40,448,128 B, 10**7개 리스트 ≈ 409,094,560 B, sum(제너레이터) 최고 536 B
 *   소진된 list_iterator.__reduce__() → (iter, ([],))  (StopIteration 뒤 리스트 참조를 놓는다)
 *   take(iter([1, None, 3])) → [1]  (None 이 진짜 값이면 일찍 멈춘다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, terminal, tokens, spans, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  // ---------- 공용 도우미 ----------
  // 파이썬 객체 상자: 위에 타입 이름, 아래 칸은 호출하는 쪽이 채운다
  function pyobj(x, y, w, h, type, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, opacity: op, 'stroke-dasharray': o.dash });
    el('line', { x1: x, y1: y + 30, x2: x + w, y2: y + 30, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    mono(x + 12, y + 21, type, { 'font-size': 14.5, 'font-weight': 700, fill: o.stroke || INK, opacity: op }); }
  // 이름표(변수) → 객체 화살표
  function nameTag(cx, cy, name, x2, y2, u, o) { o = o || {}; const w = tw(name, 15) + 26, col = o.col || INFO;
    if (u <= 0) return; pill(cx, cy, name, col, o.s ?? 1, { mono: true, fs: 15, fill: INFOBG });
    const sx = x2 < cx ? cx - w / 2 - 2 : cx + w / 2 + 2; grow(sx, cy, x2, y2, clamp(u * 1.6 - 0.4), ACC); }
  // 코드 상자: hi(i) 줄 강조, pc 는 실행 위치 화살표(소수면 줄 사이를 미끄러진다)
  function code(x, y, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = fs + 9, pad = o.pc !== undefined ? 34 : 16;
    const w = o.w || Math.max(...lines.map((s) => tw(s, fs))) + pad + 18, h = lines.length * lh + 14, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    lines.forEach((s, i) => { const yy = y + 7 + i * lh, shown = o.show ? clamp(o.show - i) : 1; if (shown <= 0) return;
      if (o.hi && o.hi(i)) el('rect', { x: x + 4, y: yy, width: w - 8, height: lh, rx: 4, fill: HL, opacity: op * shown });
      spans(x + pad, yy + fs + 2, tokens(s), { 'font-size': fs, opacity: op * shown }); });
    if (o.pc != null && o.pc >= 0) { const py = y + 7 + o.pc * lh + lh / 2; el('path', { d: `M${x + 9},${py - 7} L${x + 22},${py} L${x + 9},${py + 7} Z`, fill: o.pcCol || ACC, opacity: op }); }
    return { w, h, lh, line: (i) => y + 7 + i * lh + lh / 2 }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const typed = (lines, u, a = 0.2, b = 1.6) => lerp(0, lines.length, E(u, a, b));

  // ---------- 1. 이터러블 vs 이터레이터 ----------
  const L = { x: 175, y: 60, w: 320, h: 130 }, I = { x: 590, y: 60, w: 290, h: 130 };
  const cx_ = (i) => L.x + 22 + i * 80 + 35;
  function listObj(idx, o) { o = o || {};
    pyobj(L.x, L.y, L.w, L.h, 'list', { op: o.op });
    cells(L.x + 22, L.y + 46, [10, 20, 30], { w: 70, h: 48, gap: 10, index: true,
      style: (i) => ({ s: o.fill ? clamp(o.fill * 3 - i) : 1, stroke: i === idx ? INFO : INK, sw: i === idx ? 3.5 : 2, fill: i === idx ? INFOBG : PANEL }) }); }
  function iterObj(index, s, o) { o = o || {}; if (s <= 0) return;
    pyobj(I.x, I.y, I.w, I.h, 'list_iterator', { op: s });
    if (!o.noSeq) { el('circle', { cx: I.x + 22, cy: I.y + 58, r: 5, fill: ACC, opacity: s }); mono(I.x + 36, I.y + 63, 'seq', { 'font-size': 15, fill: MUT, opacity: s });
      grow(I.x + 22, I.y + 58, L.x + L.w + 4, I.y + 58, o.seqU ?? s, ACC); }
    else mono(I.x + 36, I.y + 63, 'seq = NULL', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: s });
    mono(I.x + 36, I.y + 103, 'index', { 'font-size': 15, fill: MUT, opacity: s });
    card(I.x + 150, I.y + 98, 56, 34, { rx: 6, text: String(index), mono: true, fs: 17, stroke: INFO, color: INFO, op: s }); }
  function badges(x, items, s) { items.forEach(([t, ok], i) => { const b = pill(x + i * 150, 228, t + (ok ? '  ✓' : '  ✗'), ok ? GOOD : BAD, s(i), { mono: true, fs: 14, fill: ok ? GOODBG : BADBG }); }); }
  const T1 = [
    ['>>> hasattr(nums, "__iter__")', 'True', '>>> hasattr(nums, "__next__")', 'False'],
    ['>>> it = iter(nums)', '>>> type(it)', "<class 'list_iterator'>"],
    ['>>> next(it)', '10'],
    ['>>> next(it)', '20', '>>> next(it)', '30'],
    ['>>> next(it)', ['StopIteration', 'var(--bad)']],
    ['>>> iter(it) is it', 'True'],
  ];
  function s1(t, c) { const { k, u } = c;
    const idx = [null, 0, 1, 3, 3, 3][k], prevIdx = [null, 0, 0, 1, 3, 3][k];
    listObj(k >= 1 && k <= 3 ? (k === 2 ? (u > 1.2 ? 1 : 0) : k === 3 ? (u > 1.9 ? 3 : u > 1.0 ? 2 : 1) : 0) : null, { fill: k === 0 ? E(u, 0.1, 1.0) : 1 });
    nameTag(88, L.y + 70, 'nums', L.x - 2, L.y + 70, k === 0 ? E(u, 0.2, 0.9) : 1);
    badges(L.x + 85, [['__iter__', true], ['__next__', false]], (i) => (k === 0 ? pop(u, 1.0 + i * 0.5) : 1));
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1, iv = k === 2 ? Math.round(tween(0, 1, u)) : k === 3 ? (u > 1.9 ? 3 : u > 1.0 ? 2 : 1) : idx;
      iterObj(iv, s, { seqU: k === 1 ? E(u, 0.6, 1.3) : 1, noSeq: k >= 4 });
      nameTag(928, I.y + 70, 'it', I.x + I.w + 2, I.y + 70, k === 1 ? E(u, 0.9, 1.6) : 1);
      badges(I.x + 70, [['__iter__', true], ['__next__', true]], (i) => (k === 1 ? pop(u, 1.3 + i * 0.4) : 1)); }
    // 꺼낸 값이 터미널로 날아간다
    if (k === 2) fly(cx_(0), L.y + 70, 300, 330, seg(u, 0.4, 1.4), '10', { mono: true, fill: INFO });
    if (k === 3) { fly(cx_(1), L.y + 70, 300, 330, seg(u, 0.45, 1.0), '20', { mono: true, fill: INFO }); fly(cx_(2), L.y + 70, 300, 374, seg(u, 1.1, 1.9), '30', { mono: true, fill: INFO }); }
    terminal(30, 272, 540, 140, T1[k], typed(T1[k], u, k === 3 ? 0.1 : 0.2, k === 3 ? 2.0 : 1.4), { title: 'python 3.12' });
    // 오른쪽 아래: 이 beat 의 한 줄
    if (k === 0) note(600, 330, '돌 수는 있지만', fade(u, 1.8), { fill: MUT }), note(600, 356, '스스로 꺼내 주지는 않는다', fade(u, 2.0));
    if (k === 2) note(600, 330, '리스트는 그대로,', fade(u, 1.5), { fill: MUT }), note(600, 356, 'index 만 0 → 1', fade(u, 1.7), { fill: INFO });
    if (k === 3) note(600, 330, 'index 3 = 길이 3', fade(u, 2.1), { fill: MUT }), note(600, 356, '남은 값 0개', fade(u, 2.2), { fill: WARN });
    if (k === 4) { const s = pop(u, 0.5); card(I.x + I.w / 2, I.y - 24, 190, 40, { rx: 20, fill: BAD, stroke: 'none', text: 'StopIteration', fs: 16, fw: 800, color: PANEL, mono: true, s });
      cross(L.x + L.w + 45, I.y + 58, 10, pop(u, 1.2));
      note(600, 330, '리스트를 가리키던 seq 를 놓는다', fade(u, 1.4), { fill: BAD }); note(600, 356, '되감기·재사용은 없다', fade(u, 1.7)); }
    if (k === 5) { // 자기 자신으로 돌아오는 화살표 + 포함 관계
      const p = el('path', { d: `M${I.x + I.w - 30},${I.y} C${I.x + I.w - 30},${I.y - 46} ${I.x + 70},${I.y - 46} ${I.x + 70},${I.y - 4}`, fill: 'none', stroke: ACC, 'stroke-width': 2.4, pathLength: 100, 'stroke-dasharray': `${E(u, 0.2, 1.0) * 100} 100`, 'marker-end': u > 1.0 ? 'url(#ra-ahb)' : null });
      mono(I.x + 145, I.y - 36, 'iter(it) → it', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
      const s = E(u, 1.2, 2.0); zone(598, 282, 340, 128, '이터러블 (__iter__)', { fill: SOFT, op: s });
      mono(612, 330, 'list  dict  str  range', { 'font-size': 14, fill: MUT, opacity: s });
      zone(612, 344, 312, 56, '이터레이터 (__iter__ + __next__)', { fill: INFOBG, color: INFO, op: E(u, 1.6, 2.4) });
      mono(626, 390, 'list_iterator  generator', { 'font-size': 14, fill: INFO, opacity: E(u, 1.6, 2.4) }); }
    void prevIdx; }

  // ---------- 2. for 루프의 진짜 원리 ----------
  const RG = { x: 640, y: 262, r: 62 };
  const B_LINES = ['it = iter(nums)', 'while True:', '    try:', '        x = next(it)', '    except StopIteration:', '        break', '    print(x)'];
  function s2(t, c) { const { k, u } = c;
    // 왼쪽: (A) 와 (B)
    tx(30, 34, '(A) 우리가 쓰는 for', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: k >= 1 ? 1 : 0 });
    if (k >= 1) code(30, 44, ['for x in nums:', '    print(x)'], { w: 300, op: k === 1 ? fade(u, 0.2) : 1, hi: () => k === 1 });
    if (k >= 2) { tx(30, 148, '(B) 파이썬이 실제로 하는 일', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const hi = { 2: [0], 3: [1, 2, 3], 4: [4, 5], 5: [] }[k];
      code(30, 158, B_LINES, { w: 300, fs: 14, show: k === 2 ? lerp(0, 7, E(u, 0.1, 1.2)) : 7, hi: (i) => hi.includes(i) }); }
    if (k === 5) { tx(180, 136, '≡', { 'font-size': 34, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); }
    // 오른쪽 위: nums 리스트와 이터레이터
    const n = k === 3 ? (u > 2.0 ? 3 : u > 1.3 ? 2 : u > 0.6 ? 1 : 0) : k >= 4 ? 3 : 0;
    tx(380, 34, 'nums', { 'font-size': 15, fill: INFO, 'font-weight': 700, class: 'mono', opacity: k === 0 ? fade(u, 0.2) : 1 });
    cells(380, 44, [10, 20, 30], { w: 54, h: 40, gap: 6, style: (i) => ({ s: k === 0 ? pop(u, 0.4 + i * 0.3) : 1, stroke: k >= 2 && i === n ? INFO : INK, sw: k >= 2 && i === n ? 3.5 : 2 }) });
    if (k === 0) { note(380, 130, '값 세 개짜리 이터러블', fade(u, 1.5), { fill: MUT }); return; }
    if (k === 1) { terminal(380, 110, 300, 130, ['10', '20', '30'], typed([1, 2, 3], u, 0.6, 2.0), { title: '출력' });
      note(710, 160, '겉으로는 두 줄', fade(u, 1.0), { fill: MUT }); note(710, 186, '안에서는 무슨 일이?', fade(u, 1.6)); return; }
    // iter() 는 한 번: 이터레이터 상자
    const s = k === 2 ? pop(u, 0.3) : 1;
    card(840, 64, 150, 64, { rx: 10, text: 'list_iterator\nindex ' + n, fs: 14.5, mono: true, stroke: INFO, color: INFO, s: s * 0.9 });
    if (k === 2) { grow(560, 64, 760, 64, E(u, 0.2, 0.8), ACC); mono(660, 54, 'iter(nums)', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) }); }
    mono(840, 120 + 24, 'iter() 호출  1회', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.2) : 1 });
    if (k === 2) { note(380, 200, '반복마다 새로 만들면', fade(u, 1.8), { fill: MUT }); note(380, 226, '첫 값만 영원히 나온다', fade(u, 2.1), { fill: BAD }); return; }
    // next() 고리
    el('circle', { cx: RG.x, cy: RG.y, r: RG.r, fill: 'none', stroke: GRID, 'stroke-width': 10, opacity: k === 5 ? 0.5 : 1 });
    mono(RG.x, RG.y + 5, 'next(it)', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: INFO });
    if (k < 5) mono(RG.x, RG.y - RG.r - 14, 'while True', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
    const calls = k === 3 ? n : k >= 4 ? 4 : 0;
    if (k === 3) { const ph = E(u, 0.1, 2.3) * 3; const a = -Math.PI / 2 + (ph % 1) * 2 * Math.PI; if (ph < 3) el('circle', { cx: RG.x + RG.r * Math.cos(a), cy: RG.y + RG.r * Math.sin(a), r: 8, fill: INFO }); }
    // x 변수
    const xv = k === 3 ? [null, 10, 20, 30][n] : 30;
    pill(RG.x + 150, RG.y - 30, 'x', INFO, 1, { mono: true, fs: 15, fill: INFOBG });
    grow(RG.x + 172, RG.y - 30, RG.x + 214, RG.y - 30, 1, ACC);
    card(RG.x + 250, RG.y - 30, 64, 40, { rx: 6, text: xv == null ? '' : String(xv), mono: true, fs: 17, stroke: INK });
    mono(RG.x + 150, RG.y + 20, 'next() 호출  ' + calls + '회', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    terminal(RG.x + 110, RG.y + 40, 200, 110, ['10', '20', '30'].slice(0, k === 3 ? n : 3), k === 3 ? n : 3, { title: '출력' });
    if (k === 4) { // 네 번째 next → StopIteration → except 가 잡는다
      const go = E(u, 0.4, 1.6);
      card(lerp(RG.x, RG.x - 40, go), lerp(RG.y + RG.r, 392, go), 150, 32, { rx: 16, fill: BAD, stroke: 'none', text: 'StopIteration', fs: 14, fw: 800, color: PANEL, mono: true, s: pop(u, 0.3) });
      const s2 = pop(u, 1.6); card(440, 392, 150, 34, { rx: 8, text: 'except → break', fs: 14, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: s2 });
      note(380, 330, '루프가 조용히 끝난다', fade(u, 2.0), { fill: GOOD }); }
    if (k === 5) { // 무엇이든 같은 기계로
      [['"abc"', 'str'], ['{…}', 'dict'], ['range(3)', 'range'], ['f', 'file']].forEach(([a, b], i) => { const s3 = pop(u, 0.6 + i * 0.3);
        card(420 + i * 74, 150, 66, 34, { rx: 8, text: a, mono: true, fs: 13.5, stroke: INFO, color: INFO, s: s3 });
        tx(420 + i * 74, 184, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8 + i * 0.3) }); });
      note(380, 222, '__iter__/__next__ 만 지키면 for 로 돈다', fade(u, 1.9), { fill: ACC }); } }

  // ---------- 3. 제너레이터 함수 ----------
  const G_LINES = ['def countdown(n):', '    while n > 0:', '        yield n', '        n -= 1'];
  const T3 = [
    [],
    ['>>> gen = countdown(3)', '>>> type(gen)', "<class 'generator'>"],
    ['>>> next(gen)', '3'],
    ['>>> next(gen)', '2', '>>> next(gen)', '1'],
    ['>>> next(gen)', ['StopIteration', 'var(--bad)']],
    ['>>> for x in countdown(3):', '...     print(x)', '3', '2', '1'],
  ];
  // 생성기 객체 안에 프레임(지역 변수 n, 멈춘 줄, 상태)
  function genObj(x, y, nv, state, o) { o = o || {}; const s = o.s ?? 1, dead = state === '종료';
    pyobj(x, y, 300, 168, 'generator · countdown', { op: s * (o.op ?? 1), stroke: dead ? OFF : INK });
    el('rect', { x: x + 16, y: y + 44, width: 268, height: 108, rx: 8, fill: dead ? SOFT : INFOBG, stroke: dead ? OFF : INFO, 'stroke-width': 1.5, 'stroke-dasharray': dead ? '5 4' : null, opacity: s * (o.op ?? 1) });
    tx(x + 30, y + 66, dead ? '프레임 없음 (gi_frame = None)' : '프레임 (지역 변수가 살아 있다)', { 'font-size': 13.5, fill: dead ? MUT : INFO, 'font-weight': 700, opacity: s * (o.op ?? 1) });
    if (!dead) { mono(x + 30, y + 106, 'n', { 'font-size': 17, 'font-weight': 700, opacity: s });
      card(x + 84, y + 100, 52, 36, { rx: 6, text: nv, mono: true, fs: 18, stroke: INFO, color: INK, op: s, s: o.nPop ?? 1 }); }
    const col = state === '⏸ 멈춤' ? WARN : state === '▶ 실행' ? GOOD : state === '종료' ? BAD : MUT;
    card(x + 218, y + 130, 120, 28, { rx: 14, text: state, fs: 14, fw: 800, stroke: col, color: col, fill: PANEL, op: s }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 6) return s3expr(t, c);
    // 코드와 실행 위치 (pc: 0=def, 1=while, 2=yield, 3=n-=1, 4=끝)
    let pc = -1, nv = '3', st = '실행 전';
    if (k === 2) { pc = u < 0.4 ? -1 : u < 1.0 ? lerp(0, 1, E(u, 0.4, 0.8)) : lerp(1, 2, E(u, 1.0, 1.4)); st = u < 0.4 ? '실행 전' : u < 1.4 ? '▶ 실행' : '⏸ 멈춤'; }
    if (k === 3) { const a = u < 1.3 ? u : u - 1.1; // 두 바퀴
      pc = a < 0.3 ? 2 : a < 0.6 ? lerp(2, 3, E(a, 0.3, 0.5)) : a < 0.9 ? lerp(3, 1, E(a, 0.6, 0.85)) : lerp(1, 2, E(a, 0.9, 1.1));
      nv = u < 0.5 ? '3' : u < 1.6 ? '2' : '1'; st = (u > 1.15 && u < 1.4) || u > 2.2 ? '⏸ 멈춤' : '▶ 실행'; }
    if (k === 4) { pc = u < 0.3 ? 2 : u < 0.6 ? 3 : u < 0.9 ? 1 : 4; nv = u < 0.5 ? '1' : '0'; st = u < 1.0 ? '▶ 실행' : '종료'; }
    if (k === 5) { pc = -1; st = '실행 전'; }
    const cd = code(30, 40, G_LINES, { w: 330, pc: k >= 2 && k <= 4 && pc >= 0 && pc < 4 ? pc : null, show: k === 0 ? lerp(0, 4, E(u, 0.1, 1.0)) : 4, hi: (i) => i === 2 && (k === 0 || (k >= 2 && k <= 3)) });
    if (k === 0) { const s = pop(u, 1.3); card(410, 40 + 7 + 2 * cd.lh + cd.lh / 2, 120, 30, { rx: 15, text: 'yield 발견', fs: 14, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s });
      grow(350, 40 + 7 + 2 * cd.lh + cd.lh / 2, 346, 40 + 7 + 2 * cd.lh + cd.lh / 2, 0, ACC);
      note(30, 200, '호출하면 몸통을 돌리지 않고', fade(u, 1.8), { fill: MUT }); note(30, 226, '제너레이터 객체를 돌려주는 함수가 된다', fade(u, 2.1));
      note(30, 300, 'return 은 함수를 끝낸다', fade(u, 2.2), { fill: MUT }); note(30, 326, 'yield 는 값을 내주고 그 자리에 멈춘다', fade(u, 2.4), { fill: ACC }); return; }
    if (k === 4 && pc === 4) note(30, 172, 'while 조건 n > 0 이 거짓 → 함수 반환', 1, { fill: BAD });
    // 생성기 객체
    const dead = k === 4 && u > 1.0;
    genObj(420, 40, nv, k === 5 ? '종료' : dead ? '종료' : st, { s: k === 1 ? pop(u, 0.3) : 1, op: k === 5 ? 0.45 : 1 });
    if (k === 5) mono(570, 32, '앞의 gen (소진)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
    nameTag(800, 124, 'gen', 722, 124, k === 1 ? E(u, 0.8, 1.5) : 1);
    if (k === 1) { note(30, 200, '몸통은 한 줄도 돌지 않았다', fade(u, 1.6), { fill: WARN }); }
    // 값이 나온다
    const outs = { 2: ['3'], 3: ['2', '1'] }[k];
    if (outs) outs.forEach((v, i) => fly(560, 140, 830, 230 + i * 36, seg(u, k === 2 ? 1.4 : 1.15 + i * 1.05 - 0.05, (k === 2 ? 2.2 : 1.9 + i * 1.0)), v, { mono: true, fill: INFO }));
    if (k === 2 || k === 3) { tx(780, 214, 'next 가 받은 값', { 'font-size': 13.5, fill: MUT, opacity: 1 });
      const got = k === 2 ? (u > 2.2 ? ['3'] : []) : ['3'].concat(u > 1.9 ? ['2'] : []).concat(u > 2.85 ? ['1'] : []);
      cells(780, 224, got, { w: 46, h: 34, gap: 8, style: () => ({ stroke: INFO, color: INFO }) }); }
    if (k === 4) { const s = pop(u, 1.1); card(860, 170, 170, 36, { rx: 18, fill: BAD, stroke: 'none', text: 'StopIteration', fs: 15, fw: 800, color: PANEL, mono: true, s }); }
    if (k === 5) { // 새 제너레이터를 for 가 끝까지 당긴다
      const s = pop(u, 0.2); card(830, 120, 170, 56, { rx: 10, text: 'countdown(3)\n새 객체', fs: 14, mono: false, stroke: INFO, color: INFO, fill: INFOBG, s });
      const got = ['3', '2', '1'].filter((_, i) => u > 0.8 + i * 0.4);
      cells(770, 224, got, { w: 46, h: 34, gap: 8, style: () => ({ stroke: GOOD, color: GOOD }) });
      card(860, 290, 170, 30, { rx: 15, text: 'StopIteration → 종료', fs: 13.5, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 2.0) }); }
    if (T3[k].length) terminal(30, 232, 400, 178, T3[k], typed(T3[k], u, 0.2, k === 3 ? 2.6 : 1.6), { title: 'python 3.12' }); }
  // 제너레이터 식: (i * i for i in range(4))
  function s3expr(t, c) { const { u } = c;
    code(30, 30, ['squares = (i * i for i in range(4))'], { fs: 16 });
    tx(30, 112, 'range(4)', { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' });
    cells(30, 122, [0, 1, 2, 3], { w: 56, h: 44, gap: 8, style: (i) => ({ stroke: (u > 0.4 && i === 0) || (u > 1.4 && i > 0) ? INFO : GRID, color: INK }) });
    card(400, 144, 110, 50, { rx: 25, text: 'i * i', fs: 18, mono: true, stroke: ACC, color: ACC, fill: ACCBG });
    grow(282, 144, 340, 144, 1, MUT); grow(458, 144, 540, 144, 1, MUT);
    // next(squares) → 0 하나만
    fly(60, 144, 600, 144, seg(u, 0.4, 1.1), '0', { mono: true, fill: INFO });
    mono(560, 104, 'next(squares)', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.3) });
    if (u > 1.1) card(620, 144, 50, 40, { rx: 6, text: '0', mono: true, fs: 18, stroke: INFO, color: INFO });
    // list(squares) → 나머지
    mono(560, 236, 'list(squares)', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.3) });
    [1, 4, 9].forEach((v, i) => fly(60 + (i + 1) * 64 + 28, 144, 620 + i * 58, 276, seg(u, 1.5 + i * 0.25, 2.1 + i * 0.25), String(v), { mono: true }));
    cells(596, 256, [1, 4, 9].filter((_, i) => u > 2.1 + i * 0.25), { w: 50, h: 40, gap: 8, style: () => ({ stroke: ACC, color: ACC }) });
    note(30, 330, '대괄호 대신 소괄호 하나로 제너레이터가 된다', fade(u, 2.2));
    note(30, 360, '0 은 이미 꺼냈으니 list 에는 1, 4, 9 만 남는다', fade(u, 2.4), { fill: MUT }); }

  // ---------- 4. 메모리 ----------
  const MB = (b) => (b / 1e6).toFixed(1) + ' MB';
  function memZone(x, title, op) { zone(x, 40, 420, 250, title, { fill: SOFT, op }); }
  function listGrid(fill, col) { const cols = 24, rows = 10; for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const i = r * cols + q, on = i < fill * cols * rows; if (!on) continue;
    el('rect', { x: 50 + q * 16.4, y: 78 + r * 16.4, width: 13, height: 13, rx: 2, fill: col || BAD, opacity: 0.75 }); } }
  function s4(t, c) { const { k, u } = c;
    memZone(30, '리스트 [x * x for x in range(1_000_000)]', k === 0 ? fade(u, 0.3) : 1);
    memZone(510, '제너레이터 (x * x for x in range(1_000_000))', k === 0 ? fade(u, 0.6) : 1);
    if (k === 0) { note(240, 200, '측정 전', fade(u, 0.8), { 'text-anchor': 'middle', fill: MUT }); note(720, 200, '측정 전', fade(u, 1.0), { 'text-anchor': 'middle', fill: MUT });
      code(250, 320, ['import sys', 'sys.getsizeof(obj)   # 객체가 차지하는 바이트'], { op: fade(u, 1.4) }); return; }
    // 리스트: 칸이 가득 찬다 (한 칸 ≈ 4,167개)
    const lf = k === 1 ? E(u, 0.2, 2.0) : 1;
    listGrid(lf, k >= 4 ? OFF : BAD);
    const bytes = Math.round(8448728 * lf);
    mono(240, 262, 'getsizeof  ' + bytes.toLocaleString('en-US') + ' B', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
    if (k === 1) { note(30, 330, '100만 개를 지금 당장 전부 만든다', fade(u, 2.0)); note(30, 358, 'getsizeof 는 포인터 배열 몫, int 객체까지 재면 ≈ 40.4 MB', fade(u, 2.3), { fill: MUT }); return; }
    // 제너레이터: 작은 상자 하나
    const gs = k === 2 ? pop(u, 0.3) : 1;
    card(720, 150, 200, 80, { rx: 10, text: 'genexpr\n다음 값만 계산', fs: 15, stroke: GOOD, color: GOOD, fill: GOODBG, s: gs });
    mono(720, 262, 'getsizeof  200 B', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: k === 2 ? fade(u, 0.8) : 1 });
    if (k === 2) { const x0 = 160, wmax = 520;
      tx(30, 336, '리스트', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); hbar(x0, 322, wmax, 8448728, 8448728, { col: BAD, h: 20, text: '8,448,728 B', u: E(u, 0.8, 1.8) });
      tx(30, 376, '제너레이터', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); hbar(x0, 362, wmax, 200, 8448728, { col: GOOD, h: 20, text: '200 B', u: E(u, 1.2, 2.0) });
      return; }
    if (k === 3) { // sum 이 하나씩 받아 더하고 버린다
      zone(30, 300, 900, 112, null, { fill: PANEL, stroke: GRID });
      mono(60, 336, 'range(10**7)', { 'font-size': 15, fill: MUT });
      for (let i = 0; i < 6; i++) dot([[180, 330], [600, 330]], ((t * 0.7 + i / 6) % 1), INFO, 6);
      card(660, 330, 80, 44, { rx: 22, text: 'Σ', fs: 22, stroke: ACC, color: ACC, fill: ACCBG });
      mono(700, 392, 'total = 333,333,283,333,335,000,000', { 'font-size': 14.5, 'text-anchor': 'middle', fill: INK, 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(60, 392, '최고 메모리 536 B (tracemalloc)', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(910, 336, '리스트였다면 ≈ 409 MB', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.0) }); return; }
    if (k === 4) { // 인덱싱·len 불가
      [['big_list[3]', '9', true], ['len(big_list)', '1000000', true]].forEach(([a, b], i) => { const s = pop(u, 0.2 + i * 0.3);
        card(240, 330 + i * 44, 360, 36, { rx: 8, s, stroke: GOOD });
        mono(80, 336 + i * 44, a, { 'font-size': 15, opacity: s }); mono(290, 336 + i * 44, '→ ' + b, { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: s }); });
      [['big_gen[3]', 'not subscriptable'], ['len(big_gen)', 'has no len()']].forEach(([a, b], i) => { const s = pop(u, 1.0 + i * 0.3);
        card(720, 330 + i * 44, 400, 36, { rx: 8, s, stroke: BAD });
        mono(536, 336 + i * 44, a, { 'font-size': 15, opacity: s }); mono(680, 336 + i * 44, 'TypeError', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: s }); });
      return; }
    // k 5, 6: 한 번 꺼내면 지나간다
    const v = k === 5 ? '0' : '1';
    fly(720, 150, 720, 360, seg(u, 0.4, 1.4), v, { mono: true, fill: INFO });
    if (u > 1.4) card(720, 360, 54, 38, { rx: 6, text: v, mono: true, fs: 18, stroke: INFO, color: INFO, op: 1 - E(u, 1.8, 2.6) * 0.8 });
    mono(560, 324, 'next(big_gen)', { 'font-size': 15, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle' });
    note(790, 366, u > 1.9 ? '지나간 값 (버려짐)' : '', 1, { fill: MUT });
    if (k === 6) { const s = pop(u, 1.8); mono(240, 330, '0 으로 되감기?', { 'font-size': 15, 'text-anchor': 'middle', opacity: s }); cross(240, 370, 14, s);
      note(240, 405, '앞으로만 간다', fade(u, 2.2), { 'text-anchor': 'middle', fill: BAD }); }
    else note(240, 360, '리스트는 몇 번을 읽어도 그대로', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); }

  // ---------- 5. itertools 와 yield from ----------
  const LOG = ['INFO ok', 'ERROR db', 'INFO login', 'ERROR timeout', 'INFO ok', 'ERROR disk', 'ERROR db', 'INFO bye', 'ERROR auth', 'INFO ok'];
  function fileIcon(x, y, o) { o = o || {}; const g = R.G(x, y, o.s, o.op);
    el('path', { d: 'M-34,-44 H18 L34,-28 V44 H-34 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M18,-44 V-28 H34', fill: 'none', stroke: INK, 'stroke-width': 2 }, g);
    for (let i = 0; i < 6; i++) el('line', { x1: -24, y1: -22 + i * 11, x2: 22, y2: -22 + i * 11, stroke: i < (o.read ?? 0) ? INFO : OFF, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    if (o.name) tx(0, 66, o.name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono' }, g); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { // 부품 세 개
      // count(10): 끝없는 띠
      tx(30, 46, 'count(10)', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: INFO });
      const sh = k === 1 ? E(u, 0.2, 1.2) : 0;
      for (let i = 0; i < 11; i++) { const x = 170 + i * 62 - sh * 0; const s = k === 0 ? pop(u, 0.3 + i * 0.08) : 1, cut = k >= 1 && i >= 3;
        card(x, 42, 52, 38, { rx: 6, text: i < 10 ? String(10 + i) : '…', mono: true, fs: 15, stroke: cut ? GRID : INFO, color: cut ? OFF : INK, s, op: i > 7 ? 0.5 : 1 }); }
      mono(880, 47, '끝없음', { 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 1.4) : 1 });
      if (k >= 1) { const cu = k === 1 ? E(u, 0.3, 1.0) : 1; el('line', { x1: 324, y1: 14, x2: 324, y2: lerp(14, 72, cu), stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
        mono(340, 100, 'islice(gen, 3)', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: cu });
        [10, 11, 12].forEach((v, i) => fly(170 + i * 62, 82, 200 + i * 56, 148, k === 1 ? seg(u, 1.0 + i * 0.2, 1.7 + i * 0.2) : 1, String(v), { mono: true, fill: INFO, stay: true }));
        mono(400, 153, '[10, 11, 12]', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: k === 1 ? fade(u, 2.0) : 1 }); }
      if (k === 0) { note(30, 330, '셋 다 값을 미리 만들지 않는다', fade(u, 1.8)); note(30, 358, '이터레이터를 받아 이터레이터를 돌려준다', fade(u, 2.1), { fill: MUT }); }
      if (k === 2) { // chain: 두 리스트가 한 줄로
        tx(30, 222, 'chain([1, 2], [3, 4])', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: ACC });
        cells(60, 240, [1, 2], { w: 48, h: 38, gap: 6, style: () => ({ stroke: INK }) }); cells(220, 240, [3, 4], { w: 48, h: 38, gap: 6, style: () => ({ stroke: INK }) });
        const route = [[84, 278], [84, 330], [700, 330]], route2 = [[244, 278], [244, 330], [700, 330]];
        [0, 1].forEach((i) => dot(route.map(([a, b], j) => (j === 0 ? [a + i * 54, b] : j === 1 ? [a + i * 54, b] : [a, b])), seg(u, 0.3 + i * 0.4, 1.1 + i * 0.4), ACC, 7));
        [0, 1].forEach((i) => dot(route2.map(([a, b], j) => (j < 2 ? [a + i * 54, b] : [a, b])), seg(u, 1.1 + i * 0.4, 1.9 + i * 0.4), ACC, 7));
        el('line', { x1: 60, y1: 330, x2: 700, y2: 330, stroke: GRID, 'stroke-width': 2 });
        cells(720, 312, [1, 2, 3, 4].filter((_, i) => u > 1.1 + i * 0.4), { w: 46, h: 36, gap: 6, style: () => ({ stroke: ACC, color: ACC }) });
        note(30, 400, '새 리스트를 만들지 않고 차례로 넘겨준다', fade(u, 2.3), { fill: MUT }); }
      return; }
    if (k <= 5) { // 로그 파이프라인
      const rd = k >= 3, flt = k >= 4, sl = k >= 5;
      fileIcon(80, 150, { name: 'app.log', read: k === 3 ? Math.floor(E(u, 0.3, 2.4) * 6) : k === 5 ? 6 : 6 });
      const S = [[250, 'read_lines()', INFO, rd], [480, 'only_errors()', WARN, flt], [710, 'islice(pipe, 5)', ACC, sl]];
      S.forEach(([x, name, col, on], i) => { if (!on) return; const s = (k === 3 && i === 0) || (k === 4 && i === 1) || (k === 5 && i === 2) ? pop(u, 0.2) : 1;
        card(x, 150, 170, 56, { rx: 28, text: name, mono: true, fs: 14.5, stroke: col, color: col, fill: PANEL, s }); });
      el('line', { x1: 118, y1: 150, x2: 165, y2: 150, stroke: GRID, 'stroke-width': 6, opacity: rd ? 1 : 0 });
      if (flt) el('line', { x1: 335, y1: 150, x2: 395, y2: 150, stroke: GRID, 'stroke-width': 6 });
      if (sl) el('line', { x1: 565, y1: 150, x2: 625, y2: 150, stroke: GRID, 'stroke-width': 6 });
      // 줄이 하나씩 흐른다
      const n = k === 3 ? 3 : k === 4 ? 6 : 10, span = 2.2 / n;
      for (let i = 0; i < n; i++) { const line = LOG[i], err = line.startsWith('ERROR'), a = 0.25 + i * span, uu = seg(u, a, a + span * 1.4);
        if (uu <= 0 || uu >= 1) continue;
        const endX = !flt ? 330 : err ? (sl ? 800 : 560) : 430, x = lerp(130, endX, uu), y = !err && flt && x > 400 ? 150 + (x - 400) * 2 : 150;
        card(x, y - 44, tw(line, 13.5) + 22, 28, { rx: 6, text: line, mono: true, fs: 13.5, stroke: err ? BAD : GRID, color: err ? BAD : MUT, fill: PANEL, op: !err && flt && x > 400 ? 0.5 : 1 }); }
      tx(30, 250, k === 3 ? 'read_lines' : k === 4 ? 'only_errors' : 'islice', { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' });
      const outN = k === 4 ? Math.min(4, LOG.slice(0, 6).filter((l, i) => l.startsWith('ERROR') && u > 0.25 + (i + 1.4) * (2.2 / 6)).length) : k === 5 ? Math.min(5, LOG.filter((l, i) => l.startsWith('ERROR') && u > 0.25 + (i + 1.4) * 0.22).length) : 0;
      if (k === 3) { note(30, 290, '파일 전체가 아니라 한 줄씩 yield 한다', fade(u, 1.4)); note(30, 318, '파일 객체도 이터레이터다', fade(u, 1.8), { fill: MUT }); }
      if (k >= 4) { cells(30, 270, Array.from({ length: outN }, () => 'ERROR'), { w: 78, h: 34, gap: 8, fs: 13.5, style: () => ({ stroke: BAD, color: BAD }) });
        note(30, 340, k === 4 ? 'INFO 줄은 걸러지고 ERROR 만 다음으로 간다' : '에러 5개를 채우면 더 당기지 않는다', fade(u, 2.0)); }
      if (k === 5) { note(30, 368, '나머지 줄은 읽지도 않는다 (예시 로그)', fade(u, 2.3), { fill: MUT }); }
      return; }
    // k 6: yield from 으로 펼친다
    code(30, 30, ['def flatten(rows):', '    for row in rows:', '        yield from row'], { hi: (i) => i === 2 });
    const s = E(u, 0.3, 1.0);
    el('rect', { x: 470, y: 40, width: 280, height: 70, rx: 10, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: 1 - E(u, 1.4, 2.0) });
    [[0, [1, 2]], [1, [3, 4]]].forEach(([r, vals]) => { const x0 = 486 + r * 134;
      el('rect', { x: x0, y: 52, width: 116, height: 46, rx: 8, fill: SOFT, stroke: INK, 'stroke-width': 1.5, opacity: 1 - E(u, 1.4, 2.0) });
      vals.forEach((v, j) => { const i = r * 2 + j, fx = x0 + 30 + j * 56, tx_ = 500 + i * 62, p = E(u, 0.6 + i * 0.25, 1.4 + i * 0.25);
        card(lerp(fx, tx_, p), lerp(75, 200, p), 46, 36, { rx: 6, text: String(v), mono: true, fs: 16, stroke: p > 0.95 ? ACC : INK, color: p > 0.95 ? ACC : INK }); }); });
    mono(470, 30, '[[1, 2], [3, 4]]', { 'font-size': 14.5, fill: MUT });
    mono(470, 250, 'list(flatten(...))  →  [1, 2, 3, 4]', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.0) });
    note(30, 200, 'for v in row: yield v 를 한 줄로', fade(u, 1.0) * s);
    note(30, 228, '하위 제너레이터에 생산을 맡긴다', fade(u, 1.4), { fill: MUT }); }

  // ---------- 6. 실무 함정 ----------
  function heads(on) { [['① 메모리 폭발', 1], ['② 1회 소비', 2], ['③ StopIteration 누수', 4]].forEach(([s, from], i) => {
      const act = on >= from && on < [2, 4, 9][i]; pill(150 + i * 300, 26, s, act ? BAD : GRID, 1, { fs: 14, color: act ? BAD : MUT, fill: act ? BADBG : PANEL }); }); }
  function s6(t, c) { const { k, u } = c;
    heads(k);
    if (k === 0) { // tee: 하나를 두 갈래로
      mono(60, 120, 'from itertools import tee', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      card(200, 220, 150, 50, { rx: 25, text: 'gen', mono: true, fs: 16, stroke: INFO, color: INFO, s: pop(u, 0.5) });
      grow(276, 210, 470, 170, E(u, 0.9, 1.5), ACC); grow(276, 230, 470, 270, E(u, 0.9, 1.5), ACC);
      pill(510, 170, 'a', ACC, pop(u, 1.4), { mono: true }); pill(510, 270, 'b', ACC, pop(u, 1.5), { mono: true });
      note(600, 210, '두 번 써야 할 때를 대비한 도구', fade(u, 1.8)); note(600, 238, '세 함정 모두 "한 방향, 한 번"에서 나온다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 1) { // 큰 파일
      fileIcon(110, 200, { name: 'big.log (수 GB)', read: 6 });
      tx(250, 110, 'open("big.log").read()', { 'font-size': 15, class: 'mono', fill: BAD, 'font-weight': 700 });
      const f1 = E(u, 0.3, 1.6); el('rect', { x: 250, y: 124, width: 640, height: 34, rx: 6, fill: SOFT, stroke: GRID });
      el('rect', { x: 250, y: 124, width: 640 * Math.min(1, f1 * 1.1), height: 34, rx: 6, fill: BAD, opacity: 0.8 });
      if (f1 > 0.9) mono(570, 147, 'RAM 넘침 → 프로세스 종료', { 'font-size': 15, fill: PANEL, 'font-weight': 800, 'text-anchor': 'middle' });
      tx(250, 230, 'for line in f:', { 'font-size': 15, class: 'mono', fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) });
      el('rect', { x: 250, y: 244, width: 640, height: 34, rx: 6, fill: SOFT, stroke: GRID, opacity: fade(u, 1.2) });
      const ph = (t * 1.3) % 1; if (u > 1.4) el('rect', { x: 250 + ph * 600, y: 244, width: 40, height: 34, rx: 6, fill: GOOD, opacity: 0.8 });
      mono(250, 306, '한 번에 한 줄만 메모리에', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 1.8) }); return; }
    if (k === 2 || k === 3) { // 1회 소비
      mono(40, 96, 'g = (x for x in range(3))', { 'font-size': 15, 'font-weight': 700 });
      const left = k === 2 ? (u < 0.4 ? 3 : u < 1.2 ? 3 - Math.floor(E(u, 0.4, 1.2) * 3) : 0) : 0;
      card(140, 170, 170, 70, { rx: 10, text: left ? 'g  (남은 값 ' + left + ')' : 'g  (소진)', fs: 15, mono: true, stroke: left ? INFO : OFF, color: left ? INFO : MUT, dash: left ? null : '5 4' });
      if (k === 2) { mono(300, 156, 'list(g)', { 'font-size': 15, fill: INFO, 'font-weight': 700 }); mono(420, 156, '[0, 1, 2]', { 'font-size': 15, fill: INFO, opacity: fade(u, 1.2) });
        mono(300, 196, 'list(g)', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) }); mono(420, 196, '[]', { 'font-size': 15, fill: BAD, 'font-weight': 800, opacity: fade(u, 1.8) });
        note(40, 290, '오류 없이 조용히 빈 결과가 나온다', fade(u, 2.1), { fill: BAD }); return; }
      // 해결: 담거나 복제
      mono(560, 96, 'data = list(...)', { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
      cells(560, 110, [0, 1, 2], { w: 46, h: 36, gap: 6, style: (i) => ({ stroke: GOOD, s: pop(u, 0.2 + i * 0.1) }) });
      grow(740, 128, 820, 108, E(u, 0.6, 1.0), MUT); grow(740, 128, 820, 150, E(u, 0.6, 1.0), MUT);
      mono(830, 113, '1번째', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) }); mono(830, 155, '2번째', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) });
      mono(560, 236, 'a, b = tee(gen)', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.1) });
      mono(560, 270, 'next(a), next(a)  → 0, 1', { 'font-size': 14.5, opacity: fade(u, 1.4) });
      tx(560, 304, '내부 버퍼 (b 몫)', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.7) });
      cells(560, 314, [0, 1].filter((_, i) => u > 1.8 + i * 0.3), { w: 46, h: 34, gap: 6, style: () => ({ stroke: WARN, color: WARN }) });
      note(40, 300, '두 방법 모두 메모리를 조금 쓴다', fade(u, 2.2), { fill: MUT }); return; }
    // ③ StopIteration 누수
    code(40, 80, ['def take(it):', '    while True:', '        v = next(it, None)', '        if v is None:', '            return', '        yield v'], { hi: (i) => (k === 4 ? i === 2 : i === 3 || i === 4) });
    if (k === 4) { mono(500, 100, 'yield next(it)   # 기본값 없이', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
      const p = E(u, 0.3, 1.2); card(lerp(560, 640, p), 150, 150, 32, { rx: 16, fill: WARN, stroke: 'none', text: 'StopIteration', fs: 13.5, fw: 800, color: PANEL, mono: true, op: 1 - E(u, 1.2, 1.5) });
      card(780, 150, 160, 32, { rx: 16, fill: BAD, stroke: 'none', text: 'RuntimeError', fs: 14, fw: 800, color: PANEL, mono: true, s: pop(u, 1.3) });
      tx(500, 210, '제너레이터 밖으로 새면 바뀐다 (PEP 479, 3.7+)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) });
      mono(500, 260, 'next(it, None)', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.9) });
      mono(660, 260, '→ None 을 돌려받는다', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 2.1) }); return; }
    // k 5: None 이면 return
    const rows = [['1', GOOD], ['2', GOOD], ['None', MUT]];
    rows.forEach(([v, col], i) => { const s = pop(u, 0.3 + i * 0.4); card(560 + i * 90, 110, 78, 36, { rx: 6, text: v, mono: true, fs: 15, stroke: col, color: col, s }); });
    mono(560, 180, 'list(take(iter([1, 2])))  →  [1, 2]', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.5) });
    tx(500, 260, '주의: None 이 진짜 값이면 일찍 멈춘다', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.9) });
    mono(500, 288, 'take(iter([1, None, 3]))  →  [1]', { 'font-size': 14.5, fill: WARN, opacity: fade(u, 2.1) });
    mono(500, 316, '그럴 땐 END = object() 를 기본값으로', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) }); }

  const quiz = [
    { q: 'nums = [10, 20, 30]에서 next(nums)를 바로 부르면 어떻게 되는가?',
      o: ['10이 나온다', 'TypeError가 난다. 리스트에는 __next__가 없다', 'StopIteration이 난다'], a: 1,
      why: '리스트는 __iter__만 가진 이터러블이다. iter(nums)로 list_iterator를 만들어야 next()를 부를 수 있다.' },
    { q: 'for x in nums: 가 도는 동안 iter(nums)는 몇 번 불리는가?',
      o: ['원소 수만큼 3번', '반복마다 한 번씩 4번', '루프 시작할 때 1번'], a: 2,
      why: 'iter()는 한 번만 불러 이터레이터를 얻고, 그 뒤로는 next(it)만 반복한다. 매번 새로 만들면 첫 값만 계속 나온다.' },
    { q: 'gen = countdown(3)을 실행한 직후 함수 몸통은 몇 줄이 실행됐는가?',
      o: ['한 줄도 실행되지 않았다', '첫 yield까지 실행됐다', '끝까지 실행돼 3, 2, 1이 준비됐다'], a: 0,
      why: 'yield가 있는 함수를 부르면 제너레이터 객체만 생긴다. 몸통은 첫 next()가 올 때 yield n까지 돈다.' },
    { q: '[x * x for x in range(1_000_000)]과 (x * x for x in range(1_000_000))의 getsizeof 차이가 나는 까닭은 무엇인가?',
      o: ['리스트는 값 100만 개를 미리 다 만들고, 제너레이터는 다음 값만 계산한다', '제너레이터가 값을 압축해 저장한다', '리스트는 int를, 제너레이터는 float을 담는다'], a: 0,
      why: '리스트는 8,448,728 B, 제너레이터는 200 B였다. 제너레이터는 값을 저장하지 않고 필요할 때 하나씩 만든다.' },
    { q: 'pipe = only_errors(read_lines("app.log"))에서 islice(pipe, 5)로 5개를 얻으면 파일은 어디까지 읽히는가?',
      o: ['파일 전체를 먼저 읽고 5개를 고른다', '다섯 번째 ERROR 줄이 나올 때까지만 읽는다', '처음 5줄만 읽는다'], a: 1,
      why: '각 단계가 값을 하나씩 당긴다. islice가 5개를 채우면 더 당기지 않으므로 뒤쪽 줄은 읽히지 않는다.' },
    { q: 'g = (x for x in range(3))에서 list(g)를 두 번 부르면 두 번째 결과는 무엇인가?',
      o: ['[0, 1, 2]', 'StopIteration 오류', '[]'], a: 2,
      why: '첫 list(g)가 값을 모두 꺼내 g는 소진됐다. 오류 없이 빈 리스트가 나와서 더 찾기 어렵다.' },
  ];

  const summary = [
    '리스트는 __iter__만 있는 이터러블이고, iter()가 __next__를 가진 이터레이터를 따로 만든다.',
    'for는 iter()를 한 번 부르고 next()를 반복하다가 StopIteration에서 조용히 멈춘다.',
    'yield가 있는 함수는 부르면 객체만 생기고, next()마다 yield까지 돌았다 멈추며 지역 변수를 지킨다.',
    '100만 개 리스트는 getsizeof로 8,448,728 B, 제너레이터는 200 B다. 대신 인덱싱과 재사용이 안 된다.',
  ];
  const review = [
    { q: '로그를 걸러 낸 제너레이터 errors로 개수를 세고 나서 같은 errors로 목록을 출력했더니 아무것도 안 나왔다. 먼저 의심할 것은?',
      o: ['파일 인코딩이 틀렸다', '개수를 세면서 errors가 이미 소진됐다', 'ERROR 줄이 원래 없었다'], a: 1,
      why: '제너레이터는 한 번 훑으면 끝난다. 두 번 쓸 값은 list()로 담아 두거나 tee로 나눠야 한다.' },
    { q: '수 GB짜리 로그에서 ERROR 줄의 수만 세려 한다. 메모리를 가장 적게 쓰는 방법은?',
      o: ['sum(1 for line in f if "ERROR" in line)', 'len([l for l in f.read().splitlines() if "ERROR" in l])', 'lines = list(f) 다음 반복문으로 센다'], a: 0,
      why: '제너레이터 식을 sum에 넘기면 한 줄씩 보고 버린다. read()나 list(f)는 파일 전체를 한꺼번에 올린다.' },
    { q: '직접 만든 클래스를 for로 돌리고 싶다. 최소한 무엇을 갖춰야 하는가?',
      o: ['__len__만 있으면 된다', 'list를 상속해야 한다', '__iter__가 __next__를 가진 객체를 돌려주면 된다'], a: 2,
      why: 'for는 iter()로 이터레이터를 얻고 next()를 부르는 절차일 뿐이다. __iter__ 안에서 yield를 쓰면 가장 짧게 끝난다.' },
  ];

  R.page({ title: '이터레이터·제너레이터 들여다보기', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
