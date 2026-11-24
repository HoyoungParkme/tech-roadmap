/* II-1-2 스마트 포인터 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 스택 칸의 스마트 포인터 · 힙 객체 · 참조 카운트(제어 블록)를 그린다. 출력 줄·카운트·sizeof 는 페이지 코드를 zig c++(libc++, 64비트)로 돌려 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, pill, banner, fly, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function arrow(x1, y1, x2, y2, u, col, o) { if (u <= 0) return; o = o || {}; const mx = (x1 + x2) / 2;
    el('path', { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, fill: 'none', stroke: col || INK, 'stroke-width': o.sw || 2.4, pathLength: 100,
      'stroke-dasharray': u < 1 ? `${u * 100} 100` : o.dash, opacity: o.op ?? 1, 'marker-end': u >= 1 ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null }); }
  const SW = 236, SH = 44;
  function slot(x, y, name, o) { o = o || {}; const g = R.G(x + SW / 2, y + SH / 2, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -SW / 2, y: -SH / 2, width: SW, height: SH, rx: 8, fill: o.empty ? SOFT : PANEL, stroke: o.stroke || (o.empty ? OFF : INK), 'stroke-width': 2, 'stroke-dasharray': o.empty ? '5 4' : null }, g);
    tx(-SW / 2 + 14, 6, name, { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: o.empty ? MUT : INK }, g);
    if (o.type) tx(-SW / 2 + 14 + tw(name, 16) + 10, 5, o.type, { 'font-size': 13.5, fill: MUT, class: 'mono' }, g);
    if (o.val) tx(SW / 2 - (o.ptr ? 34 : 14), 6, o.val, { 'font-size': 14, 'font-weight': 700, class: 'mono', 'text-anchor': 'end', fill: o.valCol || MUT }, g);
    if (o.ptr) el('circle', { cx: SW / 2 - 18, cy: 0, r: 6, fill: o.ptrCol || ACC }, g); }
  const out = (x, y) => [x + SW - 18, y + SH / 2];
  const zones = (o) => { o = o || {}; zone(24, 34, 296, o.h || 262, o.st || '스택 · main()', { fill: SOFT }); zone(344, 34, 592, o.h || 262, '힙', { fill: SOFT }); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 힙 객체 카드 (죽으면 회색 점선 + 엑스)
  function obj(cx, cy, name, o) { o = o || {}; const dead = o.dead ?? 0;
    card(cx, cy, o.w || 130, o.h || 56, { rx: 10, text: name, fs: 16, mono: true, stroke: dead > 0.5 ? OFF : o.stroke || INK, color: dead > 0.5 ? MUT : INK, fill: o.fill, dash: dead > 0.5 ? '5 4' : null, sw: 2.5, s: o.s, op: o.op });
    if (dead > 0) cross(cx, cy, 16, pop(dead, 0, 1)); }
  // 제어 블록: use_count 숫자
  function ctrl(cx, cy, n, o) { o = o || {}; card(cx, cy, 150, 56, { rx: 10, stroke: o.hot ? WARN : INFO, fill: INFOBG, sw: 2, s: o.s, op: o.op });
    tx(cx, cy - 8, o.label || 'use_count', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: o.op ?? 1 });
    mono(cx, cy + 18, String(Math.round(n)), { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: n <= 0.5 ? BAD : INK, opacity: o.op ?? 1 }); }
  const term = (lines, shown) => terminal(610, 306, 326, 108, lines, shown, { title: '출력' });

  // ---------- 1. unique_ptr: 소유자는 언제나 하나 ----------
  const WX = 640, WY = 160;
  function s1(t, c) { const { k, u } = c, P = { p: 64, q: 196 };
    zones();
    if (k === 0) { slot(44, P.p, 'p', { empty: true, val: '아직 없음' }); slot(44, P.q, 'q', { empty: true, val: '아직 없음' });
      card(WX, WY, 380, 80, { rx: 10, text: 'struct Widget\n~Widget() → "delete" 출력', fs: 15, mono: true, stroke: OFF, dash: '6 5', s: pop(u, 0.3) });
      tx(WX, WY + 70, '누가 이 줄을 부르게 할 것인가', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) }); return; }
    const moved = k >= 3, mvF = k === 3 ? E(u, 0.4, 1.4) : moved ? 1 : 0, dead = k === 5 ? seg(u, 1.0, 1.6) : 0;
    const frameOp = k === 5 ? 1 - 0.6 * E(u, 0.3, 1.0) : 1;
    slot(44, P.p, 'p', mvF > 0.98 ? { type: 'unique_ptr', empty: true, val: 'nullptr', valCol: BAD, op: frameOp } : { type: 'unique_ptr', ptr: true, s: k === 1 ? pop(u, 0.2) : 1, op: frameOp });
    if (moved || k === 2) slot(44, P.q, 'q', k === 2 ? { type: 'unique_ptr', empty: true, val: '?' } : { type: 'unique_ptr', ptr: true, s: k === 3 ? pop(u, 0.2) : 1, op: frameOp });
    obj(WX, WY, 'Widget', { s: k === 1 ? pop(u, 0.5) : 1, dead });
    const [px, py] = out(44, P.p), [qx, qy] = out(44, P.q);
    if (dead < 0.5) arrow(lerp(px, qx, mvF), lerp(py, qy, mvF), WX - 70, WY, k === 1 ? E(u, 1.0, 1.6) : 1, ACC, { sw: 3.5 });
    if (k === 1) { pill(WX, WY - 62, 'make_unique<Widget>()', ACC, pop(u, 0.3), { mono: true }); note(380, 262, '소유자 1명', fade(u, 1.8), { fill: ACC }); }
    if (k === 2) { arrow(qx, qy, WX - 70, WY + 14, E(u, 0.3, 1.0), BAD, { dash: '6 5' }); cross(470, 190, 14, pop(u, 1.1));
      pill(WX, 262, 'auto q = p;  → 컴파일 에러', BAD, pop(u, 1.3), { mono: true, fs: 14 });
      sub(WX, 360, '복사 생성자가 = delete라 빌드가 멈춘다', fade(u, 1.8), { fill: INK, 'font-size': 15 }); }
    if (k === 3) { [['소유권', 0.5]].forEach(([s, d]) => fly(150, P.p + 22, 150, P.q + 22, seg(u, d, d + 0.9), s, {}));
      pill(WX, WY - 62, 'auto q = std::move(p);', ACC, pop(u, 0.2), { mono: true }); note(380, 262, '소유자는 여전히 1명 · 이제 q', fade(u, 1.6), { fill: ACC }); }
    if (k >= 4) term(['p는 이제 nullptr', 'q가 소유', 'delete'], k === 4 ? E(u, 0.3, 1.6) * 2 : 2 + E(u, 1.5, 2.0));
    if (k === 5) { note(40, 334, 'return → q의 소멸자가 delete를 부른다', fade(u, 0.4)); mono(40, 366, `delete 호출 ${dead >= 1 ? 1 : 0}번`, { 'font-size': 20, 'font-weight': 800, fill: GOOD }); } }

  // ---------- 2. shared_ptr: use_count 가 0 이 되면 해제 ----------
  const NX = 520, NY = 150, CX = 760;
  function s2(t, c) { const { k, u } = c, fr = c.beat.frames, pf = c.prev ? c.prev.frames : null;
    const n = tween(pf ? pf[pf.length - 1].count : null, fr[fr.length - 1].count, u, 0.6);
    zones();
    const inner = k >= 1 && k <= 3, blk = k === 3 ? 1 - E(u, 0.3, 1.2) : inner ? 1 : 0;
    if (blk > 0) zone(36, 120, 272, 168, '{ 안쪽 블록 }', { fill: PANEL, stroke: GRID, dash: '6 5', op: blk });
    const aOp = k === 4 ? 1 - E(u, 0.3, 0.9) : 1;
    slot(44, 64, 'a', { type: 'shared_ptr', ptr: true, s: k === 0 ? pop(u, 0.2) : 1, op: aOp });
    const hs = [['b', 156, 1], ['c', 222, 2]];
    hs.forEach(([nm, y, from]) => { if (k < from || k > 3) return; const op = k === 3 ? blk : 1;
      slot(56, y, nm, { type: 'shared_ptr', ptr: true, s: k === from ? pop(u, 0.2) : 1, op });
      const [x0, y0] = [56 + SW - 18, y + 22]; arrow(x0, y0, NX - 66, NY + (nm === 'b' ? 10 : 20), k === from ? E(u, 0.5, 1.1) : 1, ACC, { op }); });
    const dead = k === 4 ? seg(u, 1.3, 1.9) : 0;
    // 한 번의 할당: 객체 + 제어 블록
    el('rect', { x: NX - 80, y: NY - 48, width: CX + 90 - (NX - 80), height: 96, rx: 14, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5', opacity: k === 0 ? fade(u, 1.2) : 1 });
    if (k === 0) tx(NX - 70, NY - 58, 'make_shared · 할당 한 번', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.3) });
    obj(NX, NY, 'Node', { s: k === 0 ? pop(u, 0.4) : 1, dead });
    ctrl(CX, NY, n, { s: k === 0 ? pop(u, 0.7) : 1, hot: k >= 1 && k <= 4 && u < 1.6 });
    if (aOp > 0.05) arrow(...out(44, 64), NX - 66, NY - 6, k === 0 ? E(u, 0.8, 1.4) : 1, ACC, { op: aOp });
    const lines = ['1', '3', '1', 'delete'], shown = [E(u, 1.4, 1.9), 1, 1 + E(u, 1.4, 1.9), 2 + E(u, 1.4, 1.9), 3 + E(u, 1.9, 2.3)][k];
    term(lines, shown);
    if (k === 3) note(40, 334, 'b, c 소멸 → 3에서 1', fade(u, 1.0), { fill: WARN });
    if (k === 4) { note(40, 334, 'a 소멸 → 0 → Node 해제', fade(u, 0.8), { fill: BAD }); mono(40, 366, '마지막으로 놓는 쪽이 치운다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); } }

  // ---------- 3. weak_ptr: 되돌림은 관찰로 ----------
  const AX = 520, BX2 = 800, AY = 106, BY = 200;
  function node3(cx, cy, name, cnt, o) { o = o || {}; const dead = o.dead || 0, op = o.op ?? 1;
    card(cx, cy, 200, 116, { rx: 12, stroke: dead > 0.5 ? OFF : INK, dash: dead > 0.5 ? '5 4' : null, sw: 2.5, s: o.s, op });
    tx(cx - 86, cy - 32, name, { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: op });
    mono(cx + 86, cy - 32, `강한 참조 ${Math.round(cnt)}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: cnt < 0.5 ? BAD : INFO, opacity: op });
    [['next', 'shared_ptr', 0], ['prev', o.prevType || 'weak_ptr', 1]].forEach(([f, ty, i]) => { const y = cy + 2 + i * 34;
      el('rect', { x: cx - 88, y: y - 14, width: 176, height: 28, rx: 6, fill: f === 'prev' && o.prevHot ? INFOBG : SOFT, opacity: op });
      mono(cx - 78, y + 5, f, { 'font-size': 14.5, 'font-weight': 700, opacity: op }); mono(cx + 78, y + 5, ty, { 'font-size': 13.5, fill: ty === 'weak_ptr' ? INFO : ty === '?' ? MUT : INK, 'text-anchor': 'end', opacity: op }); });
    if (dead > 0) cross(cx, cy, 18, pop(dead, 0, 1)); }
  function s3(t, c) { const { k, u } = c;
    zone(24, 34, 912, 262, null, { fill: SOFT });
    const P0 = c.prev && c.prev.cnt3 ? c.prev.cnt3 : null;
    // 카운트: a, b (스택의 a·b 가 하나씩, a->next 가 b 에 하나 더)
    const cntA = k === 4 ? (u > 0.6 && u < 2.2 ? 2 : 1) : k === 5 ? (u < 1.4 ? 1 : 0) : 1;
    const cntB = k <= 1 ? 1 : k === 5 ? (u < 0.6 ? 2 : u < 2.0 ? 1 : 0) : (k === 2 ? (u < 1.2 ? 1 : 2) : 2);
    const deadA = k === 5 ? seg(u, 1.4, 1.9) : 0, deadB = k === 5 ? seg(u, 2.0, 2.5) : 0;
    slot(44, 70, 'a', { type: 'shared_ptr', ptr: true, op: k === 5 ? 1 - E(u, 1.0, 1.3) : 1 });
    slot(44, 200, 'b', { type: 'shared_ptr', ptr: true, op: k === 5 ? 1 - E(u, 0.3, 0.6) : 1 });
    if (!(k === 5 && u > 1.3)) arrow(...out(44, 70), AX - 104, AY - 20, 1, ACC);
    if (!(k === 5 && u > 0.6)) arrow(...out(44, 200), BX2 - 104, BY + 22, 1, ACC);
    node3(AX, AY, 'a의 Node', cntA, { dead: deadA, prevType: k === 0 ? '?' : 'weak_ptr', prevHot: k === 1 });
    node3(BX2, BY, 'b의 Node', cntB, { dead: deadB, prevType: k === 0 ? '?' : 'weak_ptr', prevHot: k === 1 });
    // a->next = b (강한, 실선)
    if (k >= 2 && deadA < 0.5) arrow(AX + 88, AY + 2, BX2 - 100, BY - 34, k === 2 ? E(u, 0.3, 1.1) : 1, ACC, { sw: 3.5 });
    // b->prev = a (약한, 점선)
    if (k >= 3 && deadA < 0.5) el('path', { d: `M${BX2 - 88},${BY + 36} C${BX2 - 190},${BY + 60} ${AX + 40},${BY + 40} ${AX + 30},${AY + 60}`, fill: 'none', stroke: INFO, 'stroke-width': 2.4, 'stroke-dasharray': k === 3 ? `${E(u, 0.3, 1.1) * 100} 100` : '6 5', pathLength: 100 });
    if (k === 0) { tx(480, 330, 'prev도 shared_ptr라면?', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      [[400, 375], [560, 375]].forEach(([x, y], i) => card(x, y, 70, 36, { rx: 18, text: i ? 'b' : 'a', fs: 15, mono: true, stroke: BAD, s: pop(u, 1.2 + i * 0.1) }));
      arrow(436, 366, 524, 366, E(u, 1.5, 1.9), BAD); arrow(524, 386, 436, 386, E(u, 1.7, 2.1), BAD);
      tx(620, 382, '서로 1을 붙잡아 영영 0이 안 된다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 1) note(40, 330, 'prev는 weak_ptr · 카운트를 올리지 않는다', fade(u, 0.8), { fill: INFO });
    if (k === 2) note(40, 330, 'a->next = b  →  b의 강한 참조 1 → 2', fade(u, 1.2), { fill: ACC });
    if (k === 3) note(40, 330, 'b->prev = a  →  a의 강한 참조 그대로 1', fade(u, 1.2), { fill: INFO });
    if (k === 4) { fly(BX2 - 88, BY + 36, AX + 30, AY + 60, seg(u, 0.1, 0.6), 'lock()', { fill: INFO });
      note(40, 330, 'lock()이 준 shared_ptr가 살아 있는 동안만 2', fade(u, 0.7), { fill: INFO }); term(['prev 유효'], E(u, 0.9, 1.4)); }
    if (k === 5) { note(40, 330, ['b 소멸 → b의 Node 2 → 1', 'a 소멸 → a의 Node 1 → 0 · 해제', 'next가 풀리며 b의 Node 1 → 0 · 해제'][u < 1.3 ? 0 : u < 2.0 ? 1 : 2], 1, { fill: u < 1.3 ? WARN : BAD });
      term(['prev 유효', 'delete', 'delete'], 1 + (u >= 1.5 ? 1 : 0) + (u >= 2.1 ? 1 : 0)); } }

  // ---------- 4. 소유 vs 관찰 ----------
  function s4(t, c) { const { k, u } = c;
    zone(24, 34, 296, 262, '스택', { fill: SOFT }); zone(344, 34, 592, 262, '힙', { fill: SOFT });
    // 범례
    el('line', { x1: 40, y1: 330, x2: 90, y2: 330, stroke: ACC, 'stroke-width': 3.5 }); tx(100, 335, '소유 (해제 책임)', { 'font-size': 14, 'font-weight': 700 });
    el('line', { x1: 40, y1: 362, x2: 90, y2: 362, stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); tx(100, 367, '관찰 (책임 없음)', { 'font-size': 14, 'font-weight': 700 });
    if (k <= 2) {
      const W0 = [600, 120];
      if (k === 0) { slot(44, 140, 'take: w', { type: 'unique_ptr', ptr: true, s: pop(u, 0.2) }); obj(...W0, 'Widget', { s: pop(u, 0.5) }); arrow(...out(44, 140), W0[0] - 66, W0[1], E(u, 0.8, 1.4), ACC, { sw: 3.5 });
        pill(640, 240, '값으로 받음 = 이제 내 것', ACC, pop(u, 1.6)); return; }
      if (k === 1) { slot(44, 140, 'use: w', { type: 'Widget*', ptr: true, ptrCol: INFO, s: pop(u, 0.2) }); obj(...W0, 'Widget', {});
        arrow(...out(44, 140), W0[0] - 66, W0[1], E(u, 0.8, 1.4), INFO, { sw: 2, dash: '6 5' }); pill(640, 240, 'w->run()만 · delete 안 함', INFO, pop(u, 1.6)); return; }
      // k2: 관찰로 넘기고, 소유권은 move 로
      const ph = u < 1.1 ? 0 : u < 2.2 ? 1 : 2, mvF = E(u, 1.2, 1.9);
      slot(44, 60, 'main: w', mvF > 0.98 ? { type: 'unique_ptr', empty: true, val: 'nullptr', valCol: BAD } : { type: 'unique_ptr', ptr: true });
      slot(44, 140, 'use: w', { type: 'Widget*', ptr: true, ptrCol: INFO, op: ph === 0 ? fade(u, 0.2) : 0.3 });
      slot(44, 220, 'take: w', { type: 'unique_ptr', ptr: true, op: ph >= 1 ? fade(u, 1.1) : 0.3 });
      const dead = seg(u, 2.3, 2.8); obj(...W0, 'Widget', { dead });
      if (ph === 0) arrow(...out(44, 140), W0[0] - 66, W0[1] + 8, E(u, 0.3, 0.8), INFO, { sw: 2, dash: '6 5' });
      const [ax, ay] = out(44, 60), [bx, by] = out(44, 220); if (dead < 0.5) arrow(lerp(ax, bx, mvF), lerp(ay, by, mvF), W0[0] - 66, W0[1] - 6, 1, ACC, { sw: 3.5 });
      pill(640, 240, ph === 0 ? 'use(w.get())' : 'take(std::move(w))', ph === 0 ? INFO : ACC, 1, { mono: true });
      if (u > 2.3) tx(640, 280, 'take가 끝나며 Widget 해제', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' });
      return; }
    // k3, k4: 진짜 공유
    slot(44, 80, 's', { type: 'shared_ptr', ptr: true, s: k === 3 ? pop(u, 0.2) : 1 });
    const S0 = [520, 110]; obj(...S0, 'Widget', { s: k === 3 ? pop(u, 0.4) : 1 });
    const n = k === 3 ? 1 : tween(1, 3, u, 0.8); ctrl(780, 110, n, { s: k === 3 ? pop(u, 0.6) : 1 });
    arrow(...out(44, 80), S0[0] - 66, S0[1], k === 3 ? E(u, 0.7, 1.3) : 1, ACC, { sw: 3.5 });
    if (k === 3) pill(640, 240, 'make_shared<Widget>()', ACC, pop(u, 1.4), { mono: true });
    if (k === 4) { slot(44, 190, 'owners', { type: 'vector', ptr: true }); arrow(...out(44, 190), 386, 242, 1, MUT);
      [0, 1].forEach((i) => { const x = 430 + i * 90; card(x, 242, 80, 40, { rx: 6, text: `[${i}]`, fs: 15, mono: true, stroke: ACC, s: pop(u, 0.3 + i * 0.3) });
        arrow(x, 222, S0[0] - 20 + i * 40, S0[1] + 28, E(u, 0.6 + i * 0.3, 1.1 + i * 0.3), ACC, { sw: 2.5 }); });
      tx(780, 176, 's 하나 + 원소 둘 = 3', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.4) });
      tx(700, 252, '마지막 하나가 놓을 때 해제', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); } }

  // ---------- 5. 실패와 수정 ----------
  function tree(px, py, cx, cy, o) { // 부모 위, 자식 아래
    obj(px, py, 'parent', { w: 140, h: 48, dead: o.deadP }); obj(cx, cy, 'child', { w: 140, h: 48, dead: o.deadC });
    if (o.links) { arrow(px - 30, py + 24, cx - 30, cy - 24, 1, ACC, { sw: 3 });
      el('path', { d: `M${cx + 30},${cy - 24} C${cx + 50},${cy - 60} ${px + 50},${py + 60} ${px + 30},${py + 26}`, fill: 'none', stroke: o.weak ? INFO : BAD, 'stroke-width': o.weak ? 2.2 : 3, 'stroke-dasharray': o.weak ? '6 5' : null, 'marker-end': o.weak ? 'url(#ra-ah)' : 'url(#ra-ahr)' }); }
    mono(px + 80, py + 5, `${o.cp}`, { 'font-size': 18, 'font-weight': 800, fill: o.cp ? INK : BAD }); mono(cx + 80, cy + 5, `${o.cc}`, { 'font-size': 18, 'font-weight': 800, fill: o.cc ? INK : BAD }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { const end = E(u, 1.0, 1.6) > 0.5;
      tx(240, 52, 'parent도 shared_ptr', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      tx(720, 52, 'parent는 weak_ptr', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 1 ? GOOD : MUT, opacity: k === 1 ? 1 : 0.35 });
      // 왼쪽: 순환 (k0 에서 스코프 끝)
      const sc0 = k === 0 ? end : true;
      tree(240, 110, 240, 240, { links: true, weak: false, cp: sc0 ? 1 : 2, cc: sc0 ? 1 : 2 });
      tx(240, 310, sc0 ? 'main이 끝나도 1 · 1 남음' : '스택 a, b가 하나씩 더 붙잡음', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: sc0 ? BAD : MUT, opacity: k === 0 ? fade(u, 0.3) : 1 });
      mono(240, 350, '소멸자 0번 · 누수', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: k === 0 ? fade(u, 1.7) : 1 });
      if (k === 1) { const fr = E(u, 1.0, 2.2), cp = fr < 0.3 ? 1 : 0, cc = fr < 0.7 ? 1 : 0;
        tree(720, 110, 720, 240, { links: true, weak: true, cp: u < 1.0 ? 1 : cp, cc: u < 1.0 ? 2 : cc, deadP: seg(u, 1.4, 1.8), deadC: seg(u, 2.0, 2.4) });
        tx(720, 310, '되돌림이 카운트를 안 올린다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.5) });
        mono(720, 350, '소멸자 2번 · 정상 해제', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.3) }); }
      sub(480, 400, '숫자는 각 노드의 강한 참조 수 (실행해서 확인)', 1); return; }
    zones();
    if (k === 2) { const mvF = E(u, 1.3, 2.0);
      slot(44, 70, 'p', mvF > 0.98 ? { type: 'unique_ptr<int>', empty: true, val: 'nullptr', valCol: BAD } : { type: 'unique_ptr<int>', ptr: true });
      slot(44, 200, 'q', { type: 'unique_ptr<int>', ptr: mvF > 0.02, empty: mvF <= 0.02, val: mvF <= 0.02 ? '?' : null });
      obj(640, 140, '42', {}); const [ax, ay] = out(44, 70), [bx, by] = out(44, 200);
      if (u < 1.2) { arrow(bx, by, 570, 150, E(u, 0.2, 0.7), BAD, { dash: '6 5' }); cross(470, 180, 13, pop(u, 0.8)); pill(640, 240, 'auto q = p;  → 컴파일 에러', BAD, pop(u, 0.6), { mono: true, fs: 14 }); }
      arrow(lerp(ax, bx, mvF), lerp(ay, by, mvF), 572, 140, 1, ACC, { sw: 3.5 });
      if (u >= 1.2) pill(640, 240, 'auto q = std::move(p);', ACC, pop(u, 1.2), { mono: true, fs: 14 }); return; }
    if (k === 3) { const bad = u < 1.6;
      slot(44, 120, 'q', bad ? { type: 'unique_ptr<int>', ptr: true } : { type: 'unique_ptr<int>', empty: true, val: 'nullptr', valCol: MUT });
      obj(640, 140, '42', { dead: bad ? seg(u, 0.5, 0.9) : 1 });
      if (bad) { arrow(...out(44, 120), 572, 140, 1, ACC, { sw: 3.5 }); pill(640, 66, 'delete q.get();', BAD, pop(u, 0.2), { mono: true });
        if (u > 0.9) { pill(640, 236, '} → q 소멸자가 또 delete', BAD, pop(u, 1.0), { fs: 14 }); mono(640, 280, '이중 해제 → 크래시', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); } }
      else { pill(640, 66, 'q.reset();', GOOD, pop(u, 1.6), { mono: true }); check(560, 236, 11, pop(u, 1.9));
        tx(580, 242, '해제는 소유자가 딱 한 번', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }
      return; }
    // k4: 크기 비교
    tx(480, 64, '같은 int 하나를 가리킬 때', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
    const rows = [['unique_ptr<int>', 8, '포인터 1개', GOOD], ['shared_ptr<int>', 16, '포인터 2개 + 제어 블록', WARN]];
    rows.forEach(([n, b, d, col], i) => { const y = 120 + i * 110, g = E(u, 0.3 + i * 0.4, 1.0 + i * 0.4);
      mono(250, y + 6, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end' });
      for (let j = 0; j < b / 8; j++) card(320 + j * 100, y, 92, 44, { rx: 6, text: j ? 'ctrl*' : 'T*', fs: 15, mono: true, stroke: col, s: pop(g, 0, 0.6) });
      mono(540, y + 6, `${b} 바이트`, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.8 + i * 0.4) });
      tx(540, y + 34, d, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.9 + i * 0.4) }); });
    card(420, 318, 190, 56, { rx: 10, stroke: INFO, fill: INFOBG, text: '강한·약한 카운트\n(원자적 증감)', fs: 14, s: pop(u, 1.4) });
    arrow(420, 253, 420, 288, E(u, 1.5, 1.9), INFO, { sw: 2 });
    banner(480, 398, '단독 소유면 unique_ptr가 기본이다', pop(u, 2.0)); }

  const quiz = [
    { q: 'auto q = p; 처럼 unique_ptr를 복사하려 하면 어떻게 되나?',
      o: ['q와 p가 Widget을 함께 소유한다', '컴파일 에러가 나서 빌드가 멈춘다', '실행 중에 이중 해제로 크래시한다'], a: 1,
      why: 'unique_ptr의 복사 생성자는 delete 되어 있다. 소유자가 둘이 될 길을 언어가 빌드 단계에서 막고, 넘길 때는 std::move를 쓴다.' },
    { q: '안쪽 블록에서 b, c가 소멸한 직후 a.use_count()는 얼마인가?',
      o: ['1', '0', '3'], a: 0,
      why: '카운트는 3에서 2 만큼 줄어 1이 된다. 0이 아니므로 Node는 살아 있고, main이 끝나 a가 사라질 때 해제된다.' },
    { q: 'b->prev = a; 에서 prev가 weak_ptr이면 a의 강한 참조 수는 어떻게 되나?',
      o: ['1에서 2로 오른다', '1에서 0으로 내려간다', '변하지 않는다'], a: 2,
      why: 'weak_ptr는 관찰만 하고 강한 카운트를 올리지 않는다. 그래서 고리가 닫히지 않고 main이 끝나면 delete가 두 번 찍힌다.' },
    { q: 'take(std::move(w))로 unique_ptr를 값으로 넘긴 뒤 Widget은 언제 해제되나?',
      o: ['take 함수가 끝날 때', 'main이 끝날 때', 'w.get()을 호출할 때'], a: 0,
      why: '값으로 받은 take의 매개변수가 새 소유자다. 그 매개변수의 수명이 take 끝에서 끝나므로 그때 해제되고, main의 w는 nullptr이 된다.' },
    { q: 'delete q.get(); 을 하면 무엇이 문제인가?',
      o: ['q가 nullptr이 되어 다시 못 쓴다', '나중에 q의 소멸자가 같은 주소를 또 지워 이중 해제가 된다', '메모리가 해제되지 않아 누수가 생긴다'], a: 1,
      why: 'get()은 관찰용 포인터라 소유권은 그대로 q에 있다. 직접 지우면 q가 소멸할 때 한 번 더 지운다. 해제는 q.reset()에 맡긴다.' },
  ];

  const summary = [
    'unique_ptr는 소유자가 하나뿐이라 복사는 빌드가 막고 넘길 때는 std::move를 쓴다.',
    'shared_ptr는 복사마다 use_count가 오르고 0이 되는 순간 객체를 지운다.',
    '서로를 shared_ptr로 잡으면 카운트가 1에 묶여 누수되니 되돌림은 weak_ptr로 둔다.',
    '수명을 책임지면 unique_ptr를 기본으로, 쓰기만 하면 raw 포인터나 참조로 받는다.',
  ];
  const review = [
    { q: '트리 노드가 parent와 children을 모두 shared_ptr로 들고 있다. 프로그램이 끝나도 소멸자 로그가 안 찍힌다. 먼저 바꿀 것은?',
      o: ['children을 weak_ptr로 바꾼다', 'parent를 weak_ptr로 바꾼다', '노드마다 delete를 직접 부른다'], a: 1,
      why: '부모가 자식을 소유하고 자식은 부모를 관찰하는 방향이 자연스럽다. 되돌림인 parent를 weak_ptr로 바꾸면 고리가 풀려 둘 다 해제된다.' },
    { q: '함수 render(Widget*)에 unique_ptr로 들고 있는 객체를 잠깐 그리게 하고 싶다. 알맞은 호출은?',
      o: ['render(w.get())', 'render(std::move(w).get())', 'render(new Widget(*w))'], a: 0,
      why: '그리기만 하는 함수는 수명을 책임지지 않으므로 관찰용 raw 포인터를 넘긴다. 소유권은 계속 w에 남는다.' },
    { q: '팀 코드에서 단독으로만 쓰는 객체가 전부 shared_ptr다. 바꾸면 얻는 것으로 맞는 것은?',
      o: ['객체가 더 오래 살아남는다', '순환 참조가 생길 수 있게 된다', '포인터가 16바이트에서 8바이트로 줄고 원자적 카운트 증감이 사라진다'], a: 2,
      why: 'shared_ptr는 포인터 두 개와 제어 블록의 원자적 카운트를 쓴다. 소유자가 하나면 unique_ptr로 충분하고 소유 관계도 코드에 드러난다.' },
  ];

  R.page({ title: '메모리 들여다보기 · 스마트 포인터', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
