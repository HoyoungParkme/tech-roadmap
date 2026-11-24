/* II-2-2 Rule of 0·3·5 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 스택의 객체 · 힙 블록 · 포인터 화살표와 객체 일생 타임라인을 그린다. 주소(0x9000 등)는 예시 값이다.
 * 주소 공유·이동 결과·복사 가능 여부·컴파일 에러 문구는 페이지 코드를 zig c++(clang, libc++)로 돌려 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, pill, banner, fly, dot, zone, cross, check, terminal, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function arrow(x1, y1, x2, y2, u, col, o) { if (u <= 0) return; o = o || {}; const mx = (x1 + x2) / 2;
    el('path', { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, fill: 'none', stroke: col || INK, 'stroke-width': o.sw || 2.4, pathLength: 100,
      'stroke-dasharray': u < 1 ? `${u * 100} 100` : o.dash, opacity: o.op ?? 1, 'marker-end': u >= 1 && !o.plain ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const SW = 250, SH = 46;
  // 스택 객체 칸: data 포인터를 가진 Buffer
  function obj(x, y, name, o) { o = o || {}; const g = R.G(x + SW / 2, y + SH / 2, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -SW / 2, y: -SH / 2, width: SW, height: SH, rx: 8, fill: o.empty ? SOFT : PANEL, stroke: o.stroke || (o.empty ? OFF : INK), 'stroke-width': 2, 'stroke-dasharray': o.empty ? '5 4' : null }, g);
    tx(-SW / 2 + 14, 6, name, { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: o.empty ? MUT : INK }, g);
    tx(-SW / 2 + 22 + tw(name, 16), 5, o.field || 'data', { 'font-size': 13.5, fill: MUT, class: 'mono' }, g);
    if (o.val) tx(SW / 2 - 14, 6, o.val, { 'font-size': 14, 'font-weight': 700, class: 'mono', 'text-anchor': 'end', fill: o.valCol || BAD }, g);
    else el('circle', { cx: SW / 2 - 18, cy: 0, r: 6, fill: o.ptrCol || ACC }, g); }
  const out = (x, y) => [x + SW - 18, y + SH / 2];
  // 힙 블록: 칸 n 개 + 주소(예시)
  function block(x, y, addr, o) { o = o || {}; const n = o.n || 3, w = 46, dead = o.dead || 0;
    for (let i = 0; i < n; i++) card(x + i * (w + 4) + w / 2, y + 20, w, 40, { rx: 4, text: o.vals ? String(o.vals[i] ?? '') : '', fs: 15, mono: true, stroke: dead > 0.5 ? OFF : o.stroke || INK, dash: dead > 0.5 ? '4 4' : null, s: o.s, fill: o.fill });
    if (addr) mono(x, y - 8, addr, { 'font-size': 13.5, fill: o.addrCol || MUT, 'font-weight': 700, opacity: o.s ?? 1 });
    if (dead > 0) cross(x + n * (w + 4) / 2, y + 20, 15, pop(dead, 0, 1));
    return [x - 4, y + 20]; }
  const zones = (st) => { zone(24, 34, 320, 270, st || '스택', { fill: SOFT }); zone(364, 34, 572, 270, '힙 (주소는 예시)', { fill: SOFT }); };
  const term = (lines, shown) => terminal(610, 312, 326, 100, lines, shown, { title: '출력' });

  // ---------- 1. 특수 멤버 함수 다섯: 객체의 일생 ----------
  const TL = [{ x: 150, name: '복사 생성자', trig: 'T b = a;', col: INFO }, { x: 330, name: '이동 생성자', trig: 'T b = move(a);', col: GOOD },
    { x: 510, name: '복사 대입', trig: 'b = a;', col: INFO }, { x: 690, name: '이동 대입', trig: 'b = move(a);', col: GOOD }, { x: 860, name: '소멸자', trig: '수명 끝', col: BAD }];
  function s1(t, c) { const { k, u } = c;
    obj(44, 60, 'Buffer', { s: k === 0 ? pop(u, 0.2) : 1, field: 'int* data · n' });
    block(430, 63, 'new int[n]', { n: 5, s: k === 0 ? pop(u, 0.7) : 1 });
    arrow(...out(44, 60), 426, 83, k === 0 ? E(u, 1.0, 1.6) : 1, ACC);
    if (k === 0) { note(430, 150, '직접 관리하는 자원이 생겼다', fade(u, 1.7), { fill: ACC }); return; }
    // 타임라인
    const y = 270; el('line', { x1: 60, y1: y, x2: 920, y2: y, stroke: GRID, 'stroke-width': 4, 'stroke-linecap': 'round' });
    tx(60, y + 46, '태어남', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(420, y + 46, '덮어씀', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(920, y + 46, '죽음', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'end' });
    const shown = [null, [4], [4, 0], [4, 0, 2], [4, 0, 2, 1, 3], [4, 0, 2, 1, 3]][k], fresh = [null, [4], [0], [2], [1, 3], []][k];
    shown.forEach((i) => { const e = TL[i], isNew = fresh.includes(i), s = isNew ? pop(u, 0.3 + fresh.indexOf(i) * 0.4) : 1;
      el('circle', { cx: e.x, cy: y, r: 9 * s, fill: e.col });
      card(e.x, y - 64, 160, 58, { rx: 8, stroke: e.col, sw: k === 5 ? 3 : 2, s });
      tx(e.x, y - 70, e.name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: e.col, opacity: s });
      mono(e.x, y - 48, e.trig, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: s }); });
    if (k === 1) note(430, 150, '수명이 끝날 때 delete[]로 돌려준다', fade(u, 1.0), { fill: BAD });
    if (k === 2) note(430, 150, '기본 구현은 data의 주소 값만 베낀다', fade(u, 1.0), { fill: WARN });
    if (k === 3) note(430, 150, '이미 쥔 자원부터 처리해야 한다', fade(u, 1.0), { fill: WARN });
    if (k === 4) note(430, 150, '곧 사라질 객체에서는 소유권만 넘긴다', fade(u, 1.2), { fill: GOOD });
    if (k === 5) { el('path', { d: `M60,${y + 62} L60,${y + 72} L920,${y + 72} L920,${y + 62}`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.4) });
      banner(490, 404, '자원을 쥐면 다섯은 한 세트', pop(u, 0.8)); } }

  // ---------- 2. Rule of 3: 얕은 복사가 부르는 이중 해제와 깊은 복사 ----------
  function s2(t, c) { const { k, u } = c;
    zones();
    obj(44, 70, 'a', { s: k === 0 ? pop(u, 0.2) : 1 });
    const A = block(560, 70, '0x9000', { s: k === 0 ? pop(u, 0.6) : 1 });
    arrow(...out(44, 70), ...A, k === 0 ? E(u, 0.9, 1.5) : 1, ACC);
    if (k === 0) { note(44, 340, 'data = new int[n] · 소유자 a 하나', fade(u, 1.6)); return; }
    if (k === 1) { // 기본 복사였다면
      obj(44, 190, 'b', { s: pop(u, 0.2), stroke: BAD }); arrow(...out(44, 190), A[0], A[1] + 10, E(u, 0.4, 1.0), BAD, { dash: '6 5' });
      tx(160, 262, '기본 복사라면 같은 주소', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      fly(650, 220, 640, 120, seg(u, 1.2, 1.7), 'delete[] 0x9000', { mono: true, fill: BAD }); fly(650, 220, 640, 120, seg(u, 1.9, 2.4), 'delete[] 0x9000', { mono: true, fill: BAD });
      if (u > 2.4) { cross(640, 90, 20, pop(u, 2.4)); }
      note(44, 340, '소멸자가 같은 주소를 두 번 해제한다 · 이중 해제(UB)', fade(u, 2.0), { fill: BAD }); return; }
    // k2~4: 깊은 복사
    obj(44, 190, 'b', { s: k === 2 ? pop(u, 0.2) : 1 });
    const cp = k === 2 ? seg(u, 0.9, 1.9) : 1;
    const B = block(560, 190, '0xA000', { s: k === 2 ? pop(u, 0.5) : 1, stroke: GOOD });
    if (k === 2) for (let i = 0; i < 3; i++) { const p = clamp(cp * 3 - i); if (p > 0 && p < 1) fly(583 + i * 50, 110, 583 + i * 50, 210, p, 'copy', { mono: true, fill: GOOD }); }
    arrow(...out(44, 190), ...B, k === 2 ? E(u, 1.9, 2.4) : 1, ACC);
    if (k === 2) note(44, 340, 'new int[o.n] 후 std::copy · 주소가 다르다', fade(u, 2.0), { fill: GOOD });
    if (k === 3) { const steps = [['① this == &o면 그대로 돌아간다', INFO], ['② 내 블록 delete[]', BAD], ['③ new로 다시 할당하고 복사', GOOD]];
      steps.forEach(([s, col], i) => note(44, 334 + i * 26, s, fade(u, 0.3 + i * 0.6), { fill: col }));
      if (u > 0.9 && u < 1.5) cross(635, 210, 16, pop(u, 0.9)); }
    if (k === 4) { ['~Buffer()', 'Buffer(const Buffer&)', 'operator=(const Buffer&)'].forEach((s, i) => { check(44, 330 + i * 28, 8, pop(u, 0.2 + i * 0.3)); mono(62, 335 + i * 28, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.3) }); });
      tx(780, 290, '각자 자기 블록을 한 번씩 해제', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); } }

  // ---------- 3. Rule of 5: 훔치고 비운다 ----------
  function s3(t, c) { const { k, u } = c, mv = c.beat.move.after;
    zones();
    const aNull = mv.a === 'nullptr' && !(k === 2 && u < 0.8) && !(k === 4 && u < 0.8);
    obj(44, 70, 'a', aNull ? { empty: true, val: 'nullptr' } : {});
    const A = block(560, 120, '0x9000');
    if (!aNull) arrow(...out(44, 70), A[0], A[1] - 8, 1, ACC);
    const hasB = mv.b && mv.b !== '(아직 없음)';
    if (k === 0) { obj(44, 200, 'b', { empty: true, val: '(아직 없음)', valCol: MUT }); note(44, 340, '이대로면 임시를 받을 때도 깊은 복사를 한다', fade(u, 0.8)); return; }
    if (k === 3) { // 이동 대입: b 의 옛 블록부터 해제
      obj(44, 200, 'b', {}); const Bo = block(400, 240, '0xB000', { n: 2, dead: seg(u, 0.4, 0.9) });
      const f = E(u, 1.0, 1.7); arrow(...out(44, 200), lerp(Bo[0], A[0], f), lerp(Bo[1], A[1] + 10, f), 1, ACC);
      note(44, 340, '① 내 블록 delete[]  ② data = o.data', fade(u, 0.3), { fill: WARN }); return; }
    if (hasB) { obj(44, 200, 'b', { s: k === 1 ? pop(u, 0.2) : 1 }); arrow(...out(44, 200), A[0], A[1] + 10, k === 1 ? E(u, 0.5, 1.1) : 1, ACC); }
    if (k === 1) { note(44, 340, 'data(o.data) · 할당도 복사도 없다', fade(u, 1.2), { fill: GOOD }); note(44, 366, '아직 둘이 같은 주소를 가리킨다', fade(u, 1.8), { fill: WARN }); }
    if (k === 2) { if (u > 0.4 && u < 0.8) cross(330, 93, 10, 1); note(44, 340, 'o.data = nullptr · 원본이 소멸해도 지울 것이 없다', fade(u, 1.0), { fill: GOOD }); }
    if (k === 4) { note(44, 336, 'vector 재할당 때 원소 4개를 옮기면', fade(u, 1.0));
      hbar(150, 352, 260, 4, 4, { h: 16, u: E(u, 1.2, 1.8), col: BAD, text: '복사 4 · 이동에 noexcept 없음' });
      hbar(150, 380, 260, 4, 4, { h: 16, u: E(u, 1.5, 2.1), col: GOOD, text: '이동 4 · noexcept 있음' }); } }

  // ---------- 4. = default / = delete ----------
  const ROWS4 = [{ sig: 'Widget()', kind: 'default' }, { sig: 'Widget(const Widget&)', kind: 'delete' }, { sig: 'operator=(const Widget&)', kind: 'delete' },
    { sig: 'Widget(Widget&&) · operator=(Widget&&)', kind: 'default' }, { sig: '~Widget()', kind: 'default' }];
  function s4(t, c) { const { k, u } = c, show = [1, 2, 3, 4, 5][k];
    tx(330, 48, 'class Widget의 특수 멤버 함수', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
    ROWS4.slice(0, show).forEach((r, i) => { const y = 92 + i * 54, isNew = i === show - 1, s = isNew ? pop(u, 0.2) : 1, del = r.kind === 'delete';
      card(260, y, 420, 42, { rx: 8, stroke: del ? BAD : GOOD, fill: del ? BADBG : PANEL, sw: 2, s });
      mono(66, y + 5, r.sig, { 'font-size': 14.5, 'font-weight': 700, opacity: s });
      pill(410, y, del ? '= delete' : '= default', del ? BAD : GOOD, s, { mono: true, fs: 13.5 }); });
    if (k === 1 || k === 2) { const what = k === 1 ? 'Widget b = a;' : 'b = a;', y = 92 + k * 54;
      pill(780, y, what, INK, pop(u, 0.4), { mono: true, fs: 15 }); el('line', { x1: 720, y1: y, x2: 480, y2: y, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.8) }); cross(600, y, 11, pop(u, 1.1));
      if (k === 1) card(700, 370, 440, 44, { rx: 10, stroke: BAD, fill: BADBG, text: "error: call to deleted constructor of 'Widget'", fs: 14, mono: true, s: pop(u, 1.5) }); }
    if (k === 3) { const y = 92 + 3 * 54; pill(800, y, 'Widget b = std::move(a);', GOOD, pop(u, 0.5), { mono: true, fs: 14 }); check(640, y, 11, pop(u, 1.2));
      banner(700, 380, 'move-only · 소유권은 하나뿐', pop(u, 1.6)); }
    if (k === 4) { card(700, 330, 440, 118, { rx: 12, stroke: WARN, fill: WARNBG, sw: 2, s: pop(u, 0.6) });
      tx(500, 296, '실험: 소멸자 몸통만 직접 적은 클래스', { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 0.8) });
      mono(500, 324, 'struct T { string s; ~T() {} };', { 'font-size': 14, opacity: fade(u, 0.9) });
      tx(500, 352, 'std::move 뒤 원본 s가 100글자 그대로', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(500, 378, '이동이 자동 생성되지 않아 복사됐다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) }); } }

  // ---------- 5. Rule of 0: 멤버가 스스로 관리 ----------
  const MEM = [{ y: 70, name: 'data', type: 'unique_ptr<int[]>', blk: 3 }, { y: 150, name: 'scores', type: 'vector<int>', blk: 4 }, { y: 230, name: 'name', type: 'string', blk: 5 }];
  function s5(t, c) { const { k, u } = c, n = Math.min(k + 1, 3), mvF = k === 4 ? E(u, 0.5, 1.5) : 0;
    zone(24, 34, 330, 272, 'Widget a', { fill: SOFT }); zone(384, 34, 552, 272, '힙', { fill: SOFT });
    MEM.slice(0, n).forEach((m, i) => { const isNew = k === i, s = isNew ? pop(u, 0.2) : 1;
      card(190, m.y + 22, 300, 50, { rx: 8, stroke: INK, sw: 2, s, fill: mvF > 0.98 ? SOFT : PANEL });
      mono(54, m.y + 20, m.name, { 'font-size': 15, 'font-weight': 800, opacity: s }); mono(54, m.y + 38, m.type, { 'font-size': 13.5, fill: MUT, opacity: s });
      if (mvF < 0.98) el('circle', { cx: 320, cy: m.y + 22, r: 6, fill: ACC, opacity: s }); else mono(326, m.y + 27, '비어 있음', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', 'font-weight': 700 });
      const B = block(520, m.y + 2, null, { n: m.blk, s: isNew ? pop(u, 0.5) : 1 });
      if (k === 4) { mono(330, m.y - 2, '', {}); }
      if (mvF < 0.98) arrow(320, m.y + 22, ...B, isNew ? E(u, 0.8, 1.3) : 1, ACC, { op: 1 - mvF });
      if (isNew && k < 3) pill(860, m.y + 22, i === 0 ? '알아서 delete[]' : '스스로 관리', GOOD, pop(u, 1.4), { fs: 13.5 }); });
    if (k === 3) { const fns = [['소멸자', true], ['이동 생성 · 이동 대입', true], ['복사 생성 · 복사 대입', false]];
      fns.forEach(([s, ok], i) => { const y = 336 + i * 26; if (ok) check(44, y - 5, 8, pop(u, 0.4 + i * 0.4)); else cross(44, y - 5, 8, pop(u, 0.4 + i * 0.4));
        tx(62, y, s + (ok ? ' · 멤버별 자동 생성' : ' · unique_ptr 때문에 자동 삭제'), { 'font-size': 14.5, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: fade(u, 0.4 + i * 0.4) }); });
      pill(780, 360, '직접 쓴 특수 함수 0개', GOOD, pop(u, 1.8), { fs: 15 }); }
    if (k === 4) { MEM.forEach((m, i) => fly(250, m.y + 22, 250, 326, seg(u, 0.3 + i * 0.2, 1.2 + i * 0.2), m.name, { mono: true, fill: ACC }));
      card(190, 384, 300, 44, { rx: 8, text: 'Widget b = std::move(a);', fs: 14.5, mono: true, stroke: GOOD, sw: 2.5, s: pop(u, 0.2) });
      tx(660, 360, '세 멤버가 각자 이동 · a는 비었다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); } }

  // ---------- 6. 실패: 소멸자만 있는 BadBuf ----------
  function s6(t, c) { const { k, u } = c;
    zones(k >= 2 ? '스택 · GoodBuf' : '스택 · BadBuf');
    if (k <= 1) {
      obj(44, 70, 'a', { field: 'char* p' }); const A = block(560, 70, '0x9000', { n: 4 }); arrow(...out(44, 70), ...A, 1, ACC);
      if (k === 0) { [['~BadBuf() { delete[] p; }', true], ['BadBuf(const BadBuf&)', false], ['operator=(const BadBuf&)', false]].forEach(([s, ok], i) => { const y = 180 + i * 38;
          card(180, y, 290, 32, { rx: 6, stroke: ok ? INK : OFF, dash: ok ? null : '5 4', s: pop(u, 0.3 + i * 0.4) });
          mono(50, y + 5, s, { 'font-size': 13.5, 'font-weight': 700, fill: ok ? INK : MUT, opacity: fade(u, 0.3 + i * 0.4) }); });
        note(44, 340, '복사 두 개가 없으니 기본 얕은 복사가 끼어든다', fade(u, 1.6), { fill: BAD }); return; }
      obj(44, 190, 'b', { field: 'char* p', s: pop(u, 0.2), stroke: BAD }); arrow(...out(44, 190), A[0], A[1] + 10, E(u, 0.3, 0.9), BAD);
      tx(186, 262, 'b.p == a.p', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      fly(650, 230, 660, 110, seg(u, 1.1, 1.6), '~b: delete[]', { mono: true, fill: BAD }); fly(650, 230, 660, 110, seg(u, 1.8, 2.3), '~a: delete[]', { mono: true, fill: BAD });
      if (u > 2.3) cross(660, 90, 20, pop(u, 2.3));
      note(44, 340, '같은 주소를 두 번 지운다 · 미정의 동작', fade(u, 2.2), { fill: BAD }); return; }
    obj(44, 110, 'g', { field: 'unique_ptr<char[]> p', s: k === 2 ? pop(u, 0.2) : 1, empty: k === 4 && u > 1.6, val: k === 4 && u > 1.6 ? '소멸' : null });
    const dead = k === 4 ? seg(u, 1.6, 2.1) : 0; const G = block(560, 110, null, { n: 4, s: k === 2 ? pop(u, 0.5) : 1, dead });
    if (!(k === 4 && u > 1.6)) arrow(...out(44, 110), ...G, k === 2 ? E(u, 0.8, 1.3) : 1, ACC, { sw: 3.2 });
    if (k === 2) note(44, 340, '해제는 unique_ptr가 맡는다 · delete[]를 쓸 일이 없다', fade(u, 1.5), { fill: GOOD });
    if (k === 3) { [['이동', true], ['소멸', true], ['복사', false]].forEach(([s, ok], i) => { const x = 440 + i * 160; card(x, 240, 140, 44, { rx: 8, text: s + (ok ? ' 자동' : ' 막힘'), fs: 15, stroke: ok ? GOOD : BAD, s: pop(u, 0.3 + i * 0.3) }); });
      note(44, 340, '소멸자를 안 쓰니 이동 자동 생성이 살아 있다', fade(u, 1.4), { fill: GOOD }); }
    if (k === 4) { mono(44, 220, 'GoodBuf g;', { 'font-size': 15, 'font-weight': 700 }); mono(44, 248, 'return 0;', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      note(44, 340, '스코프가 끝나면 p가 알아서 한 번 해제한다', fade(u, 1.9), { fill: GOOD }); note(44, 368, '쓰는 쪽 정리 코드 0줄', fade(u, 2.2), { fill: GOOD }); } }

  const quiz = [
    { q: '다섯 특수 멤버 함수 가운데 b = a; 처럼 이미 살아 있는 객체에 값을 덮어쓸 때 불리는 것은 무엇인가?',
      o: ['복사 생성자', '복사 대입 연산자', '소멸자'], a: 1,
      why: '복사 생성자는 새 객체가 태어날 때, 복사 대입은 이미 있는 객체를 덮어쓸 때 불린다. 그래서 대입은 기존 자원 처리가 하나 더 필요하다.' },
    { q: '소멸자에서 delete[] data를 하는 Buffer를 기본 복사로 Buffer b = a; 하면 무슨 일이 생기나?',
      o: ['b가 새 블록을 할당받아 안전하다', '컴파일 에러가 난다', 'a.data와 b.data가 같은 주소라 소멸 때 두 번 해제된다'], a: 2,
      why: '기본 복사는 포인터 값만 베낀다. 두 객체가 같은 주소를 쥔 채 소멸하면 delete[]가 두 번 돌아 미정의 동작이 된다.' },
    { q: '이동 생성자에서 o.data = nullptr; 을 빠뜨리면 어떻게 되나?',
      o: ['원본이 소멸할 때 넘겨준 블록을 또 지운다', '이동이 복사로 바뀐다', '아무 문제 없다'], a: 0,
      why: '훔친 뒤에도 원본이 같은 주소를 쥐고 있으면 원본 소멸자가 그 블록을 해제한다. 비워야 이중 해제가 없다.' },
    { q: 'Widget(const Widget&) = delete; 인 클래스에서 Widget b = a; 를 쓰면?',
      o: ['컴파일 에러가 난다', '얕은 복사가 일어난다', '자동으로 이동된다'], a: 0,
      why: '= delete는 그 호출을 빌드 단계에서 막는다. clang은 call to deleted constructor 에러를 낸다.' },
    { q: 'unique_ptr, vector, string 멤버만 가진 Rule of 0 클래스에 대해 맞는 것은?',
      o: ['다섯 특수 함수를 직접 적어야 한다', '소멸·이동은 자동으로 생기고 복사는 unique_ptr 때문에 막힌다', '복사와 이동이 모두 막힌다'], a: 1,
      why: '컴파일러가 멤버별로 특수 함수를 만들면서 복사할 수 없는 멤버가 있으면 복사를 삭제한다. 그래서 move-only 클래스가 된다.' },
    { q: 'BadBuf를 GoodBuf로 고칠 때 한 일은 무엇인가?',
      o: ['복사 생성자를 직접 구현했다', 'char* 를 std::unique_ptr<char[]> 로 바꾸고 소멸자를 지웠다', '소멸자에 noexcept를 붙였다'], a: 1,
      why: '원시 포인터를 RAII 타입에 맡기면 해제와 이동이 그 타입 안으로 들어가고, 손으로 쓸 특수 함수가 0개가 된다.' },
  ];

  const summary = [
    '힙을 직접 쥔 클래스는 소멸자, 복사 둘, 이동 둘을 한 세트로 다뤄야 한다.',
    '소멸자만 적고 복사를 두면 포인터 값만 베껴져 같은 주소를 두 번 해제한다.',
    '이동은 포인터를 넘겨받고 원본을 nullptr로 비우며, noexcept가 있어야 vector가 쓴다.',
    '멤버를 unique_ptr, vector, string으로 채우면 직접 쓸 특수 함수가 0개가 된다.',
  ];
  const review = [
    { q: '레거시 클래스에 ~Image() { delete[] pixels; }만 있다. 이미지를 vector에 넣었더니 가끔 크래시가 난다. 먼저 의심할 것은?',
      o: ['vector의 용량이 모자라다', '복사가 정의되지 않아 얕은 복사된 사본이 같은 pixels를 지운다', 'pixels 배열이 너무 크다'], a: 1,
      why: 'vector는 원소를 복사하거나 옮긴다. 복사 함수가 없으면 기본 얕은 복사가 포인터만 베껴 사본과 원본이 같은 버퍼를 두 번 해제한다.' },
    { q: '팀원이 로그 클래스에 빈 소멸자 ~Logger() {}를 추가한 뒤 vector<Logger> 성능이 떨어졌다. 가장 그럴듯한 이유는?',
      o: ['소멸자 때문에 이동 연산이 자동 생성되지 않아 복사로 옮긴다', '소멸자가 매번 메모리를 해제해서', '빈 함수 호출 비용이 커서'], a: 0,
      why: '소멸자를 사용자가 선언하면 이동 연산이 자동 생성되지 않는다. 소멸자를 지우거나 이동을 = default로 되살린다.' },
    { q: '파일 핸들을 하나만 소유해야 하는 클래스를 만든다. 복사는 막고 넘기기는 허용하려면?',
      o: ['복사 둘은 = delete, 이동 둘은 = default로 적는다', '소멸자만 = delete로 적는다', '다섯 함수를 모두 = delete로 적는다'], a: 0,
      why: '복사를 막고 이동만 열면 소유권이 하나뿐인 move-only 타입이 된다. 다섯 모두 지우면 함수에서 돌려줄 수도 없다.' },
  ];

  R.page({ title: '메모리 들여다보기 · Rule of 0·3·5', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
