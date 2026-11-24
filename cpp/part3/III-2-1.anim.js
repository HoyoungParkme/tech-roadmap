/* III-2-1 알고리즘·이터레이터 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 출력값·remove 뒤 꼬리 값·에러 줄 수는 zig c++ 0.17(clang, libc++)로 코드 블록을 돌려 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const mk = (col) => (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)');
  function arc(x1, y1, x2, y2, bend, u, col, o) { o = o || {}; if (u <= 0) return; const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 - bend;
    el('path', { d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 1, 'stroke-dasharray': `${clamp(u)} 2`, 'marker-end': u > 0.98 ? mk(col) : null, opacity: o.op ?? 1 }); }
  // 칸 하나 (가운데 x, 위 y)
  function cell(cx, y, v, o) { o = o || {}; card(cx, y + (o.h || 52) / 2, o.w || 66, o.h || 52, { rx: 6, text: v == null ? '' : String(v), fs: o.fs || 19, mono: true, fw: 800, fill: o.fill || PANEL, stroke: o.stroke || INK, color: o.color, dash: o.dash, sw: o.sw || 2, s: o.s, op: o.op }); }
  // 아래에서 위로 가리키는 이터레이터 화살표 + 이름
  function iter(x, y, name, col, op, o) { o = o || {}; if (op <= 0) return; const len = o.len || 34;
    el('line', { x1: x, y1: y + len, x2: x, y2: y + 4, stroke: col, 'stroke-width': 2.6, 'marker-end': mk(col === ACC || col === BAD ? col : null), opacity: op });
    mono(x, y + len + 20, name, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op }); }

  // ---------- 1. [begin, end) ----------
  const I = { x: 170, y: 120, p: 84 };
  const ix = (i) => I.x + i * I.p;
  function s1(t, c) { const { k, u } = c, data = c.beat.data;
    const vals = k === 4 ? [] : [10, 20, 30, 40, 50];
    vals.forEach((v, i) => cell(ix(i), I.y, v, { s: k === 0 ? pop(u, 0.2 + i * 0.2) : 1, fill: ACCBG, stroke: ACC }));
    const n = vals.length, endX = ix(n);
    if (k !== 0) cell(endX, I.y, '', { dash: '6 5', stroke: OFF, op: k === 1 ? fade(u, 0.2) : 1 });
    if (k === 0) { tx(I.x - 40, I.y - 24, 'v', { 'font-size': 18, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.2) }); note(I.x - 40, 300, '순회할 원소 다섯 칸', fade(u, 1.4)); return; }
    if (k === 1) { iter(ix(0), I.y + 56, 'begin()', ACC, fade(u, 0.5)); iter(endX, I.y + 56, 'end()', BAD, fade(u, 1.0));
      tx(endX, I.y - 14, '마지막의 다음', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      note(I.x - 40, 330, 'it != end()인 동안 ++it으로 한 칸씩', fade(u, 1.8)); return; }
    if (k === 2 || k === 5) { const pos = Math.min(5, Math.floor(seg(u, 0.2, 2.4) * 6)), xx = ix(Math.min(pos, 5));
      iter(xx, I.y + 56, pos >= 5 ? 'it == end' : '*it', pos >= 5 ? BAD : ACC, 1);
      if (pos < 5) el('rect', { x: ix(pos) - 36, y: I.y - 4, width: 72, height: 60, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 3 });
      tx(I.x - 40, 300, '출력', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      for (let i = 0; i < Math.min(pos, 5); i++) mono(I.x + 10 + i * 46, 300, String(vals[i]), { 'font-size': 18, 'font-weight': 800, fill: ACC });
      if (k === 5) { mono(I.x - 40, 350, 'for (int x : v)', { 'font-size': 15.5, 'font-weight': 700 });
        mono(I.x - 40, 378, '  = for (auto it = begin(v); it != end(v); ++it)', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.8) }); }
      else note(I.x - 40, 350, 'end 자리에서는 읽지 않고 멈춘다', fade(u, 2.3), { fill: BAD });
      return; }
    if (k === 3) { iter(ix(0), I.y + 56, 'begin()', ACC, 1); iter(endX, I.y + 56, 'end()', BAD, 1);
      const g = E(u, 0.3, 1.5); el('path', { d: `M${ix(0)},${I.y - 18} V${I.y - 28} H${lerp(ix(0), endX, g)}` + (g >= 1 ? ` V${I.y - 18}` : ''), fill: 'none', stroke: INK, 'stroke-width': 2 });
      mono((ix(0) + endX) / 2, I.y - 40, 'end() − begin() = 5', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      note(I.x - 40, 330, '+1 보정 없이 뺄셈이 곧 원소 수', fade(u, 1.9), { fill: ACC }); return; }
    // k 4: 빈 컨테이너
    cell(ix(0), I.y, '', { dash: '6 5', stroke: OFF });
    el('line', { x1: ix(0) - 14, y1: I.y + 100, x2: ix(0) - 14, y2: I.y + 60, stroke: ACC, 'stroke-width': 2.6, 'marker-end': mk(ACC), opacity: fade(u, 0.4) });
    el('line', { x1: ix(0) + 14, y1: I.y + 100, x2: ix(0) + 14, y2: I.y + 60, stroke: BAD, 'stroke-width': 2.6, 'marker-end': mk(BAD), opacity: fade(u, 0.8) });
    mono(ix(0), I.y + 124, 'begin == end', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
    note(380, 150, '원소가 없으면 두 이터레이터가 같은 곳', fade(u, 1.3));
    note(380, 182, '루프는 한 번도 돌지 않는다', fade(u, 1.6), { fill: MUT, 'font-weight': 500 });
    mono(380, 240, '지금 v는 원소 5개라 (begin == end) => 0', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); }

  // ---------- 2. 이터레이터 범주 계단 ----------
  const CATS = [['input', '++ · 읽기 한 번'], ['forward', '++ · 여러 번'], ['bidirectional', '++ · --'], ['random access', '+n · it[k]']];
  function stairs(n, u, k) { const x0 = 40, w = 118, base = 380;
    CATS.slice(0, n).forEach(([nm, ops], i) => { const h = 70 + i * 62, s = i === n - 1 && k === i ? E(u, 0.1, 0.8) : 1, top = base - h * s;
      el('rect', { x: x0 + i * (w + 6), y: top, width: w, height: base - top, rx: 6, fill: i === 3 ? ACCBG : SOFT, stroke: i === 3 ? ACC : GRID, 'stroke-width': 2 });
      if (s >= 1) { tx(x0 + i * (w + 6) + w / 2, top + 24, nm, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', fill: i === 3 ? ACC : INK });
        tx(x0 + i * (w + 6) + w / 2, top + 46, ops, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); } }); }
  function s2(t, c) { const { k, u } = c, n = Math.min(4, (c.beat.categories || []).length);
    stairs(n, u, k);
    el('line', { x1: 548, y1: 30, x2: 548, y2: 400, stroke: GRID, 'stroke-width': 1.5 });
    const X = 580;
    if (k === 0) { tx(X, 60, '입력 스트림', { 'font-size': 15, 'font-weight': 700 });
      [5, 8, 2, 9].forEach((v, i) => { const g = seg(u, 0.4 + i * 0.4, 0.8 + i * 0.4); cell(640 + i * 72, 100, v, { w: 60, op: 1 - g * 0.75, fill: g > 0.5 ? SOFT : PANEL, stroke: g > 0.5 ? OFF : INK }); });
      note(X, 220, '읽은 칸은 지나가면 끝', fade(u, 2.0)); note(X, 250, '되돌아가 다시 읽지 못한다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 1) { tx(X, 60, 'forward_list', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      [3, 1, 2].forEach((v, i) => { cell(630 + i * 100, 100, v, { w: 60 }); if (i < 2) grow(662 + i * 100, 126, 696 + i * 100, 126, 1, MUT); });
      dot([[630, 180], [730, 180], [830, 180]], seg(u, 0.3, 1.1), ACC, 7); dot([[630, 200], [730, 200], [830, 200]], seg(u, 1.3, 2.1), INFO, 7);
      note(X, 260, '같은 범위를 몇 번이고 다시 훑는다', fade(u, 1.8)); return; }
    if (k === 2) { tx(X, 60, 'list (노드가 흩어져 있다)', { 'font-size': 15, 'font-weight': 700 });
      [[620, 110, 3], [760, 150, 1], [860, 100, 2]].forEach(([x, y, v]) => cell(x, y, v, { w: 56 }));
      arc(650, 130, 730, 168, 20, seg(u, 0.3, 0.8), ACC); arc(730, 190, 650, 152, -20, seg(u, 0.8, 1.3), INFO);
      mono(X, 270, '++lit; --lit;   ✓', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
      mono(X, 304, 'lit += 2;       ✗', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      note(X, 344, 'n칸 점프를 상수 시간에 못 한다', fade(u, 2.1), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 3) { tx(X, 60, 'vector v{3, 1, 2} (연속 칸)', { 'font-size': 15, 'font-weight': 700 });
      [3, 1, 2].forEach((v, i) => cell(630 + i * 72, 100, v, { w: 66, fill: i === 1 && u > 1.6 ? ACC : ACCBG, stroke: ACC, color: i === 1 && u > 1.6 ? PANEL : null }));
      arc(630, 96, 774, 96, 40, seg(u, 0.3, 1.0), ACC); mono(700, 60 + 20, 'it += 2', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      mono(X, 220, 'it[-1]  =>  1', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      note(X, 270, '위 계단은 아래 계단 능력을 다 가진다', fade(u, 2.0)); return; }
    if (k === 4) { // std::sort 관문
      el('rect', { x: 700, y: 60, width: 60, height: 300, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 });
      tx(730, 380, 'std::sort', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', fill: ACC });
      tx(730, 404, 'random access 필요', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      const g1 = E(u, 0.3, 1.3), g2 = E(u, 0.7, 1.5);
      pill(lerp(610, 860, g1), 130, 'vector', GOOD, 1, { mono: true, fs: 15 }); if (g1 >= 1) check(915, 130, 9, 1);
      pill(lerp(610, 650, g2), 250, 'list', BAD, 1, { mono: true, fs: 15 }); if (g2 >= 1) cross(686, 250, 9, pop(u, 1.5));
      tx(600, 300, '컴파일 에러', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); return; }
    // k 5: list::sort 는 링크만 바꾼다
    tx(X, 60, 'l.sort()  링크만 다시 잇는다', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
    const P = { 3: [620, 120], 1: [760, 160], 2: [860, 110] };
    Object.entries(P).forEach(([v, [x, y]]) => cell(x, y, v, { w: 56, fill: GOODBG, stroke: GOOD }));
    arc(760, 186, 860, 136, -24, seg(u, 0.4, 1.0), GOOD); arc(860, 88, 640, 100, 50, seg(u, 1.0, 1.7), GOOD);
    mono(X, 290, 'list  =>  1 2 3', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
    note(X, 330, '원소는 제자리, 순서만 바뀐다', fade(u, 2.1), { fill: MUT, 'font-weight': 500 }); }

  // ---------- 3. 알고리즘 5종 ----------
  const SRC = [30, 10, 50, 20, 40], SORTED = [10, 20, 30, 40, 50];
  const A = { x: 200, y: 70, p: 84 };
  const ax = (i) => A.x + i * A.p;
  function chips(algos, k, u) { (algos || []).forEach((a, i) => { const s = i === algos.length - 1 && k > 0 ? pop(u, 0.1) : 1;
    pill(870, 56 + i * 44, a.name.replace(/\(.*$/, ''), i === algos.length - 1 ? ACC : MUT, s, { mono: true, fs: 13.5 }); }); }
  function s3(t, c) { const { k, u } = c; chips(c.beat.algos, k, u);
    tx(40, 102, 'v', { 'font-size': 18, 'font-weight': 800, class: 'mono' });
    if (k === 0) { SRC.forEach((v, i) => cell(ax(i), A.y, v, { s: pop(u, 0.2 + i * 0.15) }));
      iter(ax(0), A.y + 56, 'begin', ACC, fade(u, 1.2), { len: 26 }); iter(ax(5), A.y + 56, 'end', BAD, fade(u, 1.4), { len: 26 });
      note(40, 300, '알고리즘이 받는 것은 이 두 이터레이터뿐이다', fade(u, 1.8)); return; }
    if (k === 1) { const g = E(u, 0.3, 1.8);
      SRC.forEach((v, i) => { const j = SORTED.indexOf(v); cell(lerp(ax(i), ax(j), g), A.y + Math.sin(g * Math.PI) * (i % 2 ? 40 : -26), v, { fill: g >= 1 ? ACCBG : PANEL, stroke: g >= 1 ? ACC : INK }); });
      mono(40, 300, 'std::sort(v.begin(), v.end());', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      note(40, 340, '제자리에서 오름차순으로', fade(u, 2.0), { fill: ACC }); return; }
    SORTED.forEach((v, i) => cell(ax(i), A.y, v, { fill: (k === 5 && v > 25 && u > 0.3 + i * 0.3) ? ACC : ACCBG, stroke: ACC, color: (k === 5 && v > 25 && u > 0.3 + i * 0.3) ? PANEL : null }));
    if (k === 2) { const pos = Math.min(4, Math.floor(seg(u, 0.2, 1.8) * 5));
      iter(ax(pos), A.y + 56, pos === 4 ? 'it' : '50?', pos === 4 ? ACC : MUT, 1, { len: 26 });
      mono(40, 260, 'it − v.begin()  =>  idx 4', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      note(40, 310, '값이 아니라 위치를 준다 · 못 찾으면 end()', fade(u, 2.2)); return; }
    if (k === 3) { tx(40, 262, 'doubled', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      SORTED.forEach((v, i) => { const a0 = 0.3 + i * 0.35; grow(ax(i), A.y + 56, ax(i), 220, seg(u, a0, a0 + 0.3), ACC, { sw: 1.8 });
        cell(ax(i), 226, v * 2, { fill: GOODBG, stroke: GOOD, s: pop(u, a0 + 0.3) }); });
      tx(ax(0) + 40, 178, '× 2', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      note(40, 340, 'doubled(v.size())로 자리를 먼저 만들어 둔다', fade(u, 2.2), { fill: WARN }); return; }
    if (k === 4) { const pos = seg(u, 0.2, 2.0) * 5, done = Math.min(5, Math.floor(pos));
      let acc = 0; for (let i = 0; i < done; i++) acc += SORTED[i];
      if (done < 5) dot([[ax(done), A.y + 70], [ax(done), A.y + 120]], pos - done, ACC, 7);
      card(480, 250, 160, 66, { rx: 10, stroke: ACC, sw: 2.5 }); mono(480, 260, String(acc), { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      tx(480, 210, '누적 (초기값 0)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      note(40, 350, '0.0으로 시작하면 결과도 double이 된다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); return; }
    // k 5: count_if > 25
    el('line', { x1: ax(0) - 40, y1: 50, x2: ax(4) + 40, y2: 50, stroke: GRID, 'stroke-width': 0 });
    const cnt = SORTED.filter((v, i) => v > 25 && u > 0.3 + i * 0.3).length;
    mono(40, 260, `count_if(x > 25)  =>  ${cnt}`, { 'font-size': 17, 'font-weight': 800, fill: ACC });
    note(40, 310, '루프 대신 이름이 의도를 말한다', fade(u, 2.2)); }

  // ---------- 4. M + N 조합 · ranges 파이프 ----------
  const ALG = ['sort', 'find', 'count_if', 'transform'], CON = ['vector', 'list', 'array', 'deque'];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { card(240, 100, 150, 50, { rx: 10, text: 'std::sort', fs: 16, mono: true, s: pop(u, 0.2) });
      R.cells(150, 260, [1, 2, 3, 4, 5, 6], { w: 52, h: 44, gap: 4, style: (i) => ({ s: pop(u, 0.3 + i * 0.08), fill: ACCBG, stroke: ACC }) });
      grow(200, 126, 176, 254, seg(u, 0.9, 1.3), ACC); grow(280, 126, 470, 254, seg(u, 1.1, 1.5), INFO);
      tx(150, 340, 'first', { 'font-size': 14, class: 'mono', fill: ACC, opacity: fade(u, 1.3) }); tx(470, 340, 'last', { 'font-size': 14, class: 'mono', fill: INFO, opacity: fade(u, 1.5), 'text-anchor': 'end' });
      note(560, 120, 'sort는 이것이 vector 인지 모른다', fade(u, 1.7)); note(560, 152, '두 이터레이터와 < 만 안다', fade(u, 2.0), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 1) { tx(60, 50, '직접 구현하면 4 × 4', { 'font-size': 15, 'font-weight': 700, fill: BAD });
      for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) el('rect', { x: 60 + q * 52, y: 70 + r * 52, width: 46, height: 46, rx: 5, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, opacity: seg(u, 0.2 + (r * 4 + q) * 0.05, 0.4 + (r * 4 + q) * 0.05) });
      mono(164, 310, '16개', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.0) });
      tx(420, 50, '이터레이터로 이으면 4 + 4', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
      ALG.forEach((a, i) => pill(470 + i * 118, 90, a, ACC, pop(u, 1.1 + i * 0.1), { mono: true, fs: 13.5 }));
      el('rect', { x: 420, y: 160, width: 480, height: 26, rx: 13, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: fade(u, 1.4) });
      tx(660, 178, 'iterator', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, class: 'mono', opacity: fade(u, 1.4) });
      CON.forEach((a, i) => pill(470 + i * 118, 256, a, INK, pop(u, 1.5 + i * 0.1), { mono: true, fs: 13.5 }));
      ALG.forEach((a, i) => { grow(470 + i * 118, 106, 470 + i * 118, 158, seg(u, 1.7, 2.0), MUT, { sw: 1.6 }); grow(470 + i * 118, 240, 470 + i * 118, 188, seg(u, 1.8, 2.1), MUT, { sw: 1.6 }); });
      mono(660, 310, '8개', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { mono(60, 110, 'std::sort(a.begin(), b.end());', { 'font-size': 17, fill: BAD, opacity: fade(u, 0.2) });
      cross(420, 104, 10, pop(u, 0.6)); tx(450, 110, '다른 컨테이너의 end를 섞는 실수', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 0.7) });
      mono(60, 190, 'std::ranges::sort(v);', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
      check(330, 184, 10, pop(u, 1.5)); note(60, 250, '범위 객체 하나를 넘기니 짝이 어긋날 일이 없다', fade(u, 1.9)); return; }
    // k 3~5: views 파이프라인
    const SRCV = [1, 2, 3, 4, 5, 6];
    tx(40, 44, 'v', { 'font-size': 17, 'font-weight': 800, class: 'mono' });
    SRCV.forEach((v, i) => cell(110 + i * 62, 60, v, { w: 54, h: 44, fs: 17, fill: ACCBG, stroke: ACC }));
    const F = [210, 210], T = [500, 210];
    card(F[0], F[1], 170, 56, { rx: 10, text: 'filter\nx % 2 == 0', fs: 14, fill: INFOBG, stroke: INFO, s: k === 3 ? pop(u, 0.3) : 1 });
    if (k >= 4) { card(T[0], T[1], 170, 56, { rx: 10, text: 'transform\nx * 10', fs: 14, fill: INFOBG, stroke: INFO, s: k === 4 ? pop(u, 0.3) : 1 }); grow(296, 210, 412, 210, k === 4 ? seg(u, 0.5, 0.9) : 1, INFO); }
    if (k === 3 || k === 4) { note(40, 320, '파이프를 조립했을 뿐 아직 아무 원소도 지나가지 않았다', fade(u, 1.2), { fill: MUT });
      mono(40, 356, k === 3 ? '통과할 값: 2, 4, 6' : '나올 값: 20, 40, 60', { 'font-size': 15, fill: INFO, opacity: fade(u, 1.8) }); return; }
    // k 5: 순회하며 한 원소씩 끌어온다
    tx(640, 214, 'for', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    const per = 2.4 / 6, out = [];
    SRCV.forEach((v, i) => { const a0 = 0.15 + i * per, s = (u - a0) / per; if (u >= a0 + per && v % 2 === 0) out.push(v * 10);
      if (s <= 0 || s >= 1) return; const odd = v % 2;
      const route = odd ? [[110 + i * 62, 104], [F[0], F[1] - 30], [F[0], F[1] + 60]] : [[110 + i * 62, 104], [F[0], F[1]], [T[0], T[1]], [690, 210]];
      dot(route, s, odd ? OFF : ACC, 8); });
    out.forEach((v, i) => cell(740 + i * 66, 186, v, { w: 58, h: 46, fs: 17, fill: GOODBG, stroke: GOOD }));
    note(40, 330, '원소를 하나 꺼낼 때마다 filter와 transform이 그 원소에만 돈다', fade(u, 0.3));
    note(40, 362, '홀수는 filter에서 떨어지고 중간 vector는 없다', fade(u, 1.0), { fill: MUT, 'font-weight': 500 }); }

  // ---------- 5. 술어 · 비교자 ----------
  const PPL = [['Ada', 36], ['Linus', 54], ['Grace', 42]];
  function person(cx, cy, nm, age, o) { o = o || {};
    card(cx, cy, 150, 92, { rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, sw: o.sw || 2, s: o.s, op: o.op });
    if ((o.s ?? 1) < 0.5) return;
    tx(cx - 60, cy - 14, nm, { 'font-size': 17, 'font-weight': 800, opacity: o.op ?? 1, fill: o.color });
    el('rect', { x: cx - 60, y: cy + 4, width: 120, height: 12, rx: 3, fill: SOFT, opacity: o.op ?? 1 });
    el('rect', { x: cx - 60, y: cy + 4, width: 120 * age / 60, height: 12, rx: 3, fill: o.bar || ACC, opacity: o.op ?? 1 });
    mono(cx + 60, cy - 14, String(age), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', opacity: o.op ?? 1 }); }
  const px = (i) => 160 + i * 200;
  function s5(t, c) { const { k, u } = c;
    const asc = [0, 2, 1], desc = [1, 2, 0];
    let order = [0, 1, 2], g = 1, from = [0, 1, 2];
    if (k === 1) { from = [0, 1, 2]; order = asc; g = E(u, 0.4, 1.6); } else if (k === 2) { from = asc; order = desc; g = E(u, 0.4, 1.6); } else if (k >= 3) { order = asc; from = asc; }
    const slot = (pi, arr) => arr.indexOf(pi);
    PPL.forEach(([nm, age], pi) => { const x = lerp(px(slot(pi, from)), px(slot(pi, order)), g), y = 120 + (g > 0 && g < 1 ? Math.sin(g * Math.PI) * (pi === 1 ? -30 : 30) : 0);
      let st = {};
      if (k === 3 || k === 4) { const pos = Math.floor(seg(u, 0.2, 1.8) * (k === 3 ? 3 : 4)), my = slot(pi, asc), hit = k === 3 && age > 50 && pos >= my;
        st = hit ? { fill: ACC, color: PANEL, stroke: ACC, bar: PANEL } : my < pos ? { op: 0.45 } : {}; }
      if (k === 5) { const yes = age >= 40; st = yes && u > 0.8 ? { fill: GOODBG, stroke: GOOD, sw: 2.6 } : {}; }
      person(x, y, nm, age, Object.assign({ s: k === 0 ? pop(u, 0.2 + pi * 0.25) : 1 }, st)); });
    if (k === 0) { note(80, 260, 'struct에는 < 가 없다. 무엇으로 비교할지 알려 줘야 한다', fade(u, 1.4)); return; }
    if (k === 1 || k === 2) { mono(80, 250, k === 1 ? '[](auto& a, auto& b){ return a.age < b.age; }' : '[](auto& a, auto& b){ return a.age > b.age; }', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      note(80, 300, k === 1 ? '"a가 b보다 앞서는가"를 돌려주는 이항 술어' : 'sort는 그대로, < 를 > 로만 바꿨다', fade(u, 1.8));
      if (k === 1) note(80, 340, '<= 를 쓰면 strict weak ordering이 깨진다', fade(u, 2.2), { fill: BAD }); return; }
    if (k === 3 || k === 4) { const n = k === 3 ? 3 : 4, pos = Math.min(n - 1, Math.floor(seg(u, 0.2, 1.8) * n));
      if (k === 4) cell(px(3), 94, '', { w: 150, h: 92, dash: '6 5', stroke: OFF });
      iter(pos === 3 ? px(3) : px(pos), 172, k === 3 && pos === 2 ? 'it → Linus' : pos === 3 ? 'it == end' : 'it', pos === 3 ? BAD : ACC, 1, { len: 30 });
      mono(80, 300, k === 3 ? 'find_if(…, [](auto& x){ return x.age > 50; })' : '만약 x.age > 60 이었다면', { 'font-size': 15, 'font-weight': 700, fill: k === 3 ? ACC : BAD, opacity: fade(u, 0.2) });
      note(80, 340, k === 3 ? '처음 참이 된 원소의 위치를 준다' : 'if (it != p.end()) 없이 it->name을 쓰면 UB', fade(u, 2.0), { fill: k === 3 ? INK : BAD }); return; }
    // k 5: count_if age >= 40
    el('line', { x1: 60, y1: 128, x2: 760, y2: 128, stroke: WARN, 'stroke-width': 0 });
    mono(80, 250, 'count_if(…, [](auto& x){ return x.age >= 40; })  =>  2', { 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
    note(80, 300, '같은 데이터, 술어만 바꿔 끼운다', fade(u, 1.8)); }

  // ---------- 6. 실무 실패 사례 ----------
  const P6 = { x: 150, y: 100, p: 80 };
  const qx = (i) => P6.x + i * P6.p;
  function s6(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { const start = [1, 3, 2, 3, 4, 3], after = [1, 2, 4, 3, 4, 3];
      tx(40, 60, 'v{1, 3, 2, 3, 4, 3}', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      if (k === 0) { const g = E(u, 0.3, 1.5);
        // 남길 원소(1, 2, 4)가 앞으로 미끄러진다
        [[0, 0], [2, 1], [4, 2]].forEach(([from, to]) => cell(lerp(qx(from), qx(to), g), P6.y + (g > 0 && g < 1 ? -40 * Math.sin(g * Math.PI) : 0), start[from], { fill: ACCBG, stroke: ACC }));
        [1, 3, 5].forEach((i) => { if (g < 1) cell(qx(i), P6.y, start[i], { op: 1 - g, stroke: OFF }); });
        if (g >= 1) [3, 4, 5].forEach((i) => cell(qx(i), P6.y, after[i], { fill: SOFT, stroke: OFF, color: OFF, dash: '5 4' }));
        iter(qx(3), P6.y + 56, '새 끝 (remove 반환값)', WARN, fade(u, 1.7), { len: 30 });
        mono(40, 300, 'size()  =>  6  그대로', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
        sub(qx(4), P6.y - 14, '꼬리 3 4 3은 실측값 · 내용은 정해지지 않음', fade(u, 2.1), { 'font-size': 13.5 });
        note(40, 340, '알고리즘은 컨테이너 크기를 바꿀 수 없다', fade(u, 2.2)); return; }
      [0, 1, 2].forEach((i) => cell(qx(i), P6.y, after[i], { fill: ACCBG, stroke: ACC }));
      [3, 4, 5].forEach((i) => { const g = E(u, 0.4, 1.2); cell(qx(i), P6.y + g * 60, after[i], { fill: SOFT, stroke: OFF, color: OFF, op: 1 - g }); });
      el('line', { x1: qx(3) - 40, y1: P6.y - 16, x2: qx(3) - 40, y2: P6.y + 70, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: fade(u, 0.2) });
      mono(40, 300, 'v.erase(std::remove(…, 3), v.end());', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) });
      mono(40, 336, 'size()  =>  3   (1 2 4)', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      note(40, 376, 'C++20이면 std::erase(v, 3) 한 줄', fade(u, 2.0), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 2) { tx(40, 60, '짝수 지우기: v = {1, 2, 4}', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      // 1: 건너뜀 → 2: erase, 4 가 당겨짐 → 4: erase
      const ph = seg(u, 0.2, 2.4) * 3, st = Math.floor(ph);
      const vals = st === 0 ? [1, 2, 4] : st === 1 ? [1, 2, 4] : st === 2 ? [1, 4] : [1];
      vals.forEach((v, i) => cell(qx(i), P6.y, v, { fill: ACCBG, stroke: ACC }));
      const at = st === 0 ? 0 : st === 1 ? 1 : st === 2 ? 1 : 1;
      iter(qx(at), P6.y + 56, st === 0 ? '++it' : st === 3 ? 'it == end' : 'it = v.erase(it)', st === 3 ? BAD : ACC, 1, { len: 30 });
      mono(40, 300, 'for (auto it = v.begin(); it != v.end(); )', { 'font-size': 15, opacity: fade(u, 0.2) });
      mono(40, 326, '    if (*it % 2 == 0) it = v.erase(it); else ++it;', { 'font-size': 15, opacity: fade(u, 0.2) });
      note(40, 372, 'erase가 돌려준 다음 위치를 받아 이어 간다 · 결과 {1}', fade(u, 2.3), { fill: GOOD }); return; }
    if (k === 3) { tx(40, 60, '잘못된 루프: 머리에서 ++it (w = {2, 4, 6, 1})', { 'font-size': 15, 'font-weight': 700 });
      const ph = Math.floor(seg(u, 0.2, 2.0) * 3), vals = ph === 0 ? [2, 4, 6, 1] : ph === 1 ? [4, 6, 1] : [4, 1];
      vals.forEach((v, i) => cell(qx(i), P6.y, v, { fill: v === 4 && ph >= 1 ? WARNBG : ACCBG, stroke: v === 4 && ph >= 1 ? WARN : ACC }));
      iter(qx(ph === 0 ? 0 : 1), P6.y + 56, ph === 0 ? 'erase' : '++it로 4를 건너뜀', ph === 0 ? ACC : WARN, 1, { len: 30 });
      mono(40, 300, '결과 {4, 1}  (실측)', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) });
      note(40, 340, '지운 직후 원소를 한 칸 건너뛰어 조용히 틀린다', fade(u, 2.3), { fill: BAD }); return; }
    if (k === 4) { mono(60, 90, 'std::sort(l.begin(), l.end());', { 'font-size': 17, fill: BAD, opacity: fade(u, 0.2) });
      R.hbar(60, 120, 520, 138 * E(u, 0.4, 1.3), 138, { col: BAD, text: '에러 138줄', h: 20 });
      mono(60, 210, 'l.sort();', { 'font-size': 19, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) }); check(180, 204, 10, pop(u, 1.7));
      note(60, 270, 'list 이터레이터는 bidirectional이라 std::sort가 못 받는다', fade(u, 1.9));
      note(60, 304, 'v는 vector라서 이 파일의 알고리즘이 성립한다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); return; }
    // k 5: end 역참조
    tx(40, 60, '지금 v = {1}', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
    cell(qx(0), P6.y, 1, { fill: ACCBG, stroke: ACC }); cell(qx(1), P6.y, '', { dash: '6 5', stroke: OFF });
    iter(qx(1), P6.y + 56, '*v.end()', BAD, fade(u, 0.3), { len: 30 }); cross(qx(1), P6.y + 26, 12, pop(u, 0.9));
    iter(qx(0), P6.y + 56, 'v.back()', GOOD, fade(u, 1.3), { len: 30 });
    mono(40, 320, 'v.back()  =>  1', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
    note(40, 360, 'end는 경계일 뿐 원소가 아니다', fade(u, 2.1)); }

  const quiz = [
    { q: 'v = {10, 20, 30, 40, 50}에서 v.end()가 가리키는 곳은 어디인가?',
      o: ['마지막 원소 50', '50 바로 다음, 원소가 없는 경계', '첫 원소 10'], a: 1,
      why: 'end()는 마지막의 다음(past-the-end)이다. 그래서 end() − begin()이 원소 수 5가 되고, end는 역참조하지 않는다.' },
    { q: 'std::sort(l.begin(), l.end())가 list에서 컴파일되지 않는 이유는 무엇인가?',
      o: ['list 이터레이터가 점프(random access)를 못 해서', 'list 원소는 비교할 수 없어서', 'list는 begin()을 제공하지 않아서'], a: 0,
      why: 'sort는 it + n 같은 점프가 필요하다. list는 ++와 --만 되므로 멤버 함수 l.sort()를 쓴다.' },
    { q: 'v{30, 10, 50, 20, 40}을 sort한 뒤 find(v.begin(), v.end(), 50)의 위치(it − v.begin())는 무엇인가?',
      o: ['2', '4', '50'], a: 1,
      why: '정렬 뒤 v는 10 20 30 40 50이라 50은 인덱스 4에 있다. find는 값이 아니라 위치를 돌려준다.' },
    { q: 'v | views::filter(…) | views::transform(…)를 만든 순간 일어나는 계산은 무엇인가?',
      o: ['짝수만 담은 새 vector가 만들어진다', 'v가 제자리에서 바뀐다', '아무것도 없다, 순회할 때 원소마다 계산한다'], a: 2,
      why: 'views는 지연 평가다. for로 하나씩 꺼낼 때 그 원소에만 filter와 transform이 돌아 20 40 60이 나온다.' },
    { q: 'sort의 비교자를 a.age <= b.age로 쓰면 안 되는 이유는 무엇인가?',
      o: ['같은 나이면 서로 앞선다고 답해 규칙이 깨져서', '<=가 <보다 비교 비용이 커서', '정렬 방향이 내림차순으로 바뀌어서'], a: 0,
      why: '같은 나이면 a<=b와 b<=a가 둘 다 참이다. 비교자 규칙이 깨지면 sort가 미정의 동작에 빠질 수 있다.' },
    { q: 'std::remove(v.begin(), v.end(), 3)만 호출한 뒤 v.size()는 어떻게 되나?',
      o: ['3을 뺀 개수로 줄어든다', '0이 된다', '처음 크기 6 그대로다'], a: 2,
      why: 'remove는 남길 원소를 앞으로 옮기고 새 끝만 돌려준다. erase로 그 뒤를 잘라야 크기가 3이 된다.' },
  ];

  const summary = [
    '이터레이터 범위는 [begin, end)이고 end는 마지막의 다음이라 읽지 않는다.',
    '알고리즘은 이터레이터 두 개만 받아서 컨테이너가 무엇이든 그대로 쓸 수 있다.',
    '알고리즘마다 요구하는 이터레이터 범주가 있어서 list에는 std::sort 대신 l.sort()를 쓴다.',
    'remove는 크기를 줄이지 않으니 erase와 짝지어 쓰고, erase 뒤에는 돌려받은 이터레이터로 이어 간다.',
  ];
  const review = [
    { q: '주문 목록 vector에서 취소 건을 for 문 머리 ++it로 지웠더니 연달아 있던 취소 건 하나가 남았다. 원인은?',
      o: ['vector는 순회 중에 erase를 지원하지 않는다', '취소 건 비교에 ==를 써서', 'erase 뒤에 또 ++it를 해 한 칸 건너뛰었다'], a: 2,
      why: 'erase는 지운 뒤 다음 원소를 가리키는 이터레이터를 돌려준다. 거기서 ++it를 하면 실측처럼 {2, 4, 6, 1}이 {4, 1}로 남는다.' },
    { q: 'list<int>를 정렬하려고 std::sort를 썼더니 에러가 138줄 나왔다. 가장 알맞은 고침은?',
      o: ['l.sort()를 쓴다', 'std::sort에 비교자를 하나 더 넘긴다', 'list를 그대로 두고 std::find로 바꾼다'], a: 0,
      why: 'std::sort는 random access를 요구하고 list는 bidirectional이다. list는 링크만 다시 잇는 멤버 sort를 제공한다.' },
    { q: '점수 vector에서 60점 미만을 지운 뒤 size()를 찍었더니 그대로다. 코드에서 먼저 볼 곳은?',
      o: ['점수가 int인지 double인지', 'remove_if 결과를 erase로 잘라 냈는지', 'reserve를 했는지'], a: 1,
      why: 'remove 계열은 남길 원소를 앞으로 모으고 새 끝만 알려 준다. v.erase(새 끝, v.end())까지 해야 크기가 준다.' },
  ];

  R.page({ title: '이터레이터와 알고리즘', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
