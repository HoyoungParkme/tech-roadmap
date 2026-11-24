/* I-1-2 타입·연산자·문자열 풀 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 왼쪽은 스택(변수 칸), 오른쪽은 힙(객체). 화살표 = 참조. 주소(@0x7f 등)는 페이지의 예시 주소다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 스택 칸 하나: (x, y) 왼쪽 위. 이름 · 타입 · 값 상자. 값 상자의 오른쪽 끝을 돌려준다
  function slot(x, y, name, type, val, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return [x + 260, y + 25];
    const g = R.G(x, y, 1, o.op ?? 1);
    tx(14, 23, name, { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: o.nameCol || INK }, g);
    if (type) tx(14, 43, type, { 'font-size': 13.5, class: 'mono', fill: MUT }, g);
    R.el('rect', { x: o.vx ?? 120, y: 3, width: o.vw ?? 140, height: 44, rx: 7, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, transform: s < 1 ? `translate(${(o.vx ?? 120) + (o.vw ?? 140) / 2} 25) scale(${s}) translate(${-((o.vx ?? 120) + (o.vw ?? 140) / 2)} -25)` : null }, g);
    if (val != null && s > 0.5) tx((o.vx ?? 120) + (o.vw ?? 140) / 2, 31, val, { 'font-size': o.fs || 16, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle', fill: o.valCol || INK }, g);
    return [x + (o.vx ?? 120) + (o.vw ?? 140), y + 25]; }
  const stackZone = (x, y, w, h, t) => zone(x, y, w, h, t || 'Stack · main 프레임', { fill: SOFT });
  const heapZone = (x, y, w, h, t) => zone(x, y, w, h, t || 'Heap', { fill: 'none', stroke: GRID, dash: '6 5' });
  // 휘는 참조 화살표 (u 만큼 자람)
  function ref(x1, y1, x2, y2, u, col, o) { o = o || {}; if (u <= 0) return; const mx = (x1 + x2) / 2, d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
    const p = el('path', { d, fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.4, pathLength: 100, 'stroke-dasharray': u < 1 ? `${u * 100} 100` : (o.dash || null), opacity: o.op ?? 1 });
    if (u >= 1 && !o.plain) el('circle', { cx: x2, cy: y2, r: 4.5, fill: col || ACC, opacity: o.op ?? 1 });
    el('circle', { cx: x1, cy: y1, r: 4, fill: col || ACC, opacity: o.op ?? 1 }); return p; }
  // 힙 객체: 제목 + 주소 + 글자/숫자 칸. (cx, cy) 가운데
  function obj(cx, cy, title, addr, vals, o) { o = o || {}; const n = vals.length, cw = o.cw || 44, w = Math.max(n * (cw + 4) + 24, tw(title, 14) + 40, 120), h = 86, s = o.s ?? 1; if (s <= 0) return { l: cx - w / 2, r: cx + w / 2 };
    card(cx, cy, w, h, { rx: 10, stroke: o.stroke || INK, sw: 2.2, fill: o.fill || PANEL, s, op: o.op, dash: o.dash });
    if (s > 0.6) { tx(cx - w / 2 + 12, cy - 22, title, { 'font-size': 14, 'font-weight': 700, fill: o.titleCol || MUT, opacity: o.op ?? 1 });
      if (addr) mono(cx + w / 2 - 12, cy - 22, addr, { 'font-size': 13.5, fill: o.addrCol || MUT, 'text-anchor': 'end', 'font-weight': 700, opacity: o.op ?? 1 });
      vals.forEach((v, i) => { const x = cx - (n * (cw + 4) - 4) / 2 + i * (cw + 4), hi = o.hi && o.hi(i), p = o.fill1 ? clamp(o.fill1 * n - i) : 1;
        if (p <= 0) return; card(x + cw / 2, cy + 14, cw, 36, { rx: 5, text: v, mono: true, fs: 15, fw: 700, stroke: hi ? (o.hiCol || ACC) : GRID, color: hi ? (o.hiCol || ACC) : INK, fill: hi ? ACCBG : PANEL, sw: hi ? 2.4 : 1.5, s: 0.6 + 0.4 * p, op: o.op }); }); }
    return { l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2 }; }
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: op ?? 1 }, a || {}));
  const result = (x, y, expr, val, op, sc) => { const ok = val === 'true'; card(x, y, tw(expr + ' → ' + val, 15) + 30, 40, { rx: 20, text: expr + ' → ' + val, mono: true, fs: 15, fw: 800, stroke: ok ? GOOD : BAD, color: ok ? GOOD : BAD, fill: PANEL, s: sc ?? 1, op }); };

  // ---------- 1. 원시 vs 참조 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, pv = c.prev || { stack: [] };
    stackZone(28, 26, 312, 380); heapZone(440, 26, 494, 380);
    if (k === 5) { // 기본값: 필드는 기본값, 지역변수는 없다
      [['n', 'int', '?'], ['f', 'boolean', '?'], ['s', 'String', '?']].forEach(([n, ty, v], i) => slot(40, 60 + i * 64, n, ty, v, { s: pop(u, 1.4 + i * 0.12), stroke: WARN, valCol: WARN, dash: '4 3' }));
      say(184, 290, '지역변수는 기본값이 없다', fade(u, 1.8), { fill: WARN });
      say(184, 318, '읽기 전에 대입해야 컴파일된다', fade(u, 2.0), { 'font-weight': 400, fill: MUT });
      const fs = [['int n', '0', INK], ['boolean f', 'false', INK], ['String s', 'null', INFO]];
      card(687, 190, 330, 236, { rx: 12, stroke: INK, sw: 2.2, s: pop(u, 0.2) });
      tx(540, 102, '필드 3개를 가진 객체', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4) });
      fs.forEach(([n, v, col], i) => { const y = 140 + i * 58, p = fade(u, 0.5 + i * 0.3);
        mono(548, y + 6, n, { 'font-size': 16, 'font-weight': 700, opacity: p }); card(780, y, 120, 42, { rx: 6, text: v, mono: true, fs: 16, fw: 800, stroke: col === INFO ? INFO : GRID, color: col, s: pop(u, 0.6 + i * 0.3) }); });
      say(687, 350, '필드는 0 · false · null로 시작한다', fade(u, 1.4)); return; }
    const pos = {}; b.stack.forEach((v, i) => { const y = 60 + i * 64, isNew = !pv.stack.some((p) => p.name === v.name), old = pv.stack.find((p) => p.name === v.name);
      const changed = old && old.val !== v.val, s = isNew ? pop(u, k === 1 ? 1.2 : 0.3) : 1;
      const showVal = changed ? (u < 1.0 ? old.val : v.val) : v.val;
      pos[v.name] = slot(40, y, v.name, v.type, showVal, { s, stroke: v.kind === 'ref' ? ACC : INK, valCol: v.kind === 'ref' ? ACC : changed && u >= 1.0 ? WARN : INK, fill: changed && u >= 1.0 ? WARNBG : PANEL }); });
    if (k === 0) { say(184, 300, '값 10이 칸에 그대로', fade(u, 1.0)); say(687, 216, '힙: 비어 있다', fade(u, 1.4), { fill: MUT, 'font-weight': 400 }); }
    if (k === 1) { fly(250, 85, 250, 149, seg(u, 0.2, 1.1), '10', { mono: true }); say(184, 300, '값을 복사했다 · 칸은 둘', fade(u, 1.6)); }
    if (k === 2) { say(184, 300, 'b만 20, a는 10 그대로', fade(u, 1.4)); }
    if (k >= 3) { const h = b.heap[0], vals = h.body.replace(/[{}\s]/g, '').split(','), pvH = (pv.heap || [])[0];
      const flash = k === 4 && u > 1.6; const showVals = k === 4 && u < 1.6 && pvH ? pvH.body.replace(/[{}\s]/g, '').split(',') : vals;
      const o = obj(700, 170, 'int[] 객체', h.id, showVals, { s: k === 3 ? pop(u, 0.3) : 1, fill1: k === 3 ? clamp((u - 0.5) / 0.8) : null, hi: (i) => flash && i === 0, hiCol: WARN });
      ref(pos.x[0], pos.x[1], o.l, 170, k === 3 ? E(u, 1.4, 2.0) : 1, ACC);
      if (k === 3) { say(184, 330, '변수 x에는 주소만', fade(u, 2.0)); sub(700, 245, '주소는 예시', fade(u, 2.0)); }
      if (k === 4) { ref(pos.y[0], pos.y[1], o.l, 180, E(u, 0.3, 1.0), INFO);
        fly(o.l - 40, 240, 646, 236, seg(u, 1.0, 1.6), 'y[0] = 99', { mono: true, fill: WARN });
        say(700, 270, 'x[0]도 99로 보인다', fade(u, 1.9), { fill: WARN }); say(700, 300, '객체는 하나, 화살표가 둘', fade(u, 2.2), { 'font-weight': 400 }); } } }

  // ---------- 2. 래퍼와 오토박싱 ----------
  function intObj(cx, cy, v, o) { o = o || {}; return obj(cx, cy, 'Integer', null, [v], Object.assign({ cw: 56 }, o)); }
  function s2(t, c) { const { k, u } = c;
    stackZone(24, 26, 296, 380); heapZone(340, 26, 594, 380);
    if (k <= 1) { // List<Integer> 안의 Integer 객체
      const L = obj(470, 120, 'ArrayList', 'nums', ['•', '', ''], { cw: 40, s: k === 0 ? pop(u, 0.2) : 1 });
      if (k === 0) { const wrap = E(u, 0.9, 1.6);
        card(lerp(110, 760, E(u, 0.4, 0.9)), lerp(330, 120, E(u, 0.4, 0.9)), 70, 44, { rx: 6, text: '42', mono: true, fs: 18, fw: 800, stroke: INK, op: u < 0.9 ? 1 : 0 });
        if (u < 0.5) tx(110, 300, 'int', { 'font-size': 14, class: 'mono', fill: MUT, 'text-anchor': 'middle' });
        if (wrap > 0) intObj(760, 120, '42', { s: 0.6 + 0.4 * wrap, stroke: ACC, titleCol: ACC });
        say(760, 196, '오토박싱: int → Integer', fade(u, 1.6), { fill: ACC });
        ref(L.l + 63, 134, 700, 120, E(u, 1.9, 2.5), ACC); say(470, 250, '컬렉션은 객체만 담는다', fade(u, 2.2), { 'font-weight': 400 }); return; }
      intObj(760, 120, '42', { stroke: ACC, titleCol: ACC }); ref(L.l + 63, 134, 700, 120, 1, ACC);
      slot(36, 60, 'first', 'int', u > 1.4 ? '42' : null, { s: pop(u, 0.2) });
      fly(760, 134, 230, 85, seg(u, 0.5, 1.4), '42', { mono: true, fill: INK });
      say(560, 250, '언박싱: Integer → int', fade(u, 1.2), { fill: INFO }); return; }
    if (k <= 3) { // 함정 1: null 언박싱
      const M = obj(620, 110, 'HashMap score', null, ['"lee"', '…'], { cw: 70 });
      tx(620, 186, '"kim" 키는 없다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      slot(36, 60, 's', 'Integer', 'null', { s: k === 2 ? pop(u, 0.6) : 1, stroke: INFO, valCol: INFO });
      if (k === 2) { fly(560, 140, 230, 85, seg(u, 0.1, 0.6), 'get("kim") → null', { mono: true, fill: INFO });
        slot(36, 140, 'v', 'int', null, { s: pop(u, 1.2), stroke: BAD });
        grow(228, 110, 228, 140, E(u, 1.4, 1.7), BAD); cross(300, 165, 14, pop(u, 1.8));
        mono(170, 230, 'NullPointerException', { 'font-size': 15.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
        say(170, 262, 'null은 int로 풀 수 없다', fade(u, 2.1), { 'font-weight': 400 }); return; }
      // k3: 삼항으로 먼저 거른다
      const dx = 600, dy = 280, s = pop(u, 0.2);
      el('path', { d: `M${dx},${dy - 40} L${dx + 110},${dy} L${dx},${dy + 40} L${dx - 110},${dy} Z`, fill: PANEL, stroke: INK, 'stroke-width': 2.2, transform: `translate(${dx} ${dy}) scale(${s}) translate(${-dx} ${-dy})` });
      mono(dx, dy + 5, 's != null ?', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      dot([[228, 85], [dx - 110, dy]], seg(u, 0.5, 1.1), INFO, 7);
      grow(dx + 110, dy, dx + 220, dy, E(u, 1.2, 1.5), OFF); tx(dx + 160, dy - 10, '아니다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.3) });
      card(dx + 260, dy, 60, 40, { rx: 6, text: '0', mono: true, fs: 17, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, 1.5) });
      tx(dx, dy + 68, '참이면 s를 풀고, null이면 0', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) });
      slot(36, 140, 'v', 'int', u > 2.2 ? '0' : null, { s: 1, stroke: GOOD, valCol: GOOD });
      fly(dx + 260, dy - 20, 230, 165, seg(u, 1.7, 2.2), '0', { mono: true, fill: GOOD }); return; }
    // 함정 2: 누적 변수
    const N = 10000000;
    if (k === 4) { const p = E(u, 0.3, 2.4), i = Math.round(p * N);
      slot(36, 60, 'sum', 'Integer', null, { stroke: ACC });
      slot(36, 140, 'i', 'int', i.toLocaleString('en-US'), { fs: 14.5 });
      const n = Math.floor(p * 48); for (let j = 0; j < n; j++) { const cx = 380 + (j % 12) * 44, cy = 70 + Math.floor(j / 12) * 50, last = j === n - 1;
        card(cx + 18, cy + 18, 38, 34, { rx: 5, text: last ? '' : '', stroke: last ? ACC : OFF, fill: last ? ACCBG : PANEL, sw: 1.5 }); }
      if (n) ref(296, 85, 380 + ((n - 1) % 12) * 44, 70 + Math.floor((n - 1) / 12) * 50 + 18, 1, ACC, { sw: 2 });
      say(640, 300, '반복마다 Integer.valueOf가 새 객체를 만든다', fade(u, 1.0), { fill: BAD });
      say(640, 330, '천만 번 박싱 · 버려진 객체는 GC 몫', fade(u, 1.6), { 'font-weight': 400 }); return; }
    const p = E(u, 0.3, 2.2), i = Math.round(p * (N - 1)), sum = p >= 1 ? 49999995000000 : Math.round(i * (i + 1) / 2);
    slot(36, 60, 'sum', 'long', sum.toLocaleString('en-US'), { fs: 14.5, vx: 82, vw: 200, stroke: GOOD });
    slot(36, 140, 'i', 'int', i.toLocaleString('en-US'), { fs: 14.5, vx: 82, vw: 200 });
    say(637, 200, '힙: 객체 0개', fade(u, 0.6), { fill: GOOD, 'font-size': 18 });
    say(637, 236, '같은 스택 칸의 값만 바뀐다', fade(u, 1.0), { 'font-weight': 400 });
    mono(637, 320, '=> 49999995000000', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  // ---------- 3. == vs equals ----------
  function s3(t, c) { const { k, u } = c;
    stackZone(24, 26, 300, 380); heapZone(380, 26, 554, 380);
    if (k === 3) { const s = pop(u, 0.2);
      slot(36, 60, 'a', 'int', '10', { s }); slot(36, 124, 'b', 'int', '10', { s });
      el('path', { d: 'M300,85 C350,85 350,149 300,149', fill: 'none', stroke: GOOD, 'stroke-width': 2.4, opacity: fade(u, 0.8) });
      mono(366, 122, '==', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9) });
      result(174, 240, 'a == b', 'true', fade(u, 1.3), pop(u, 1.3));
      say(657, 200, '원시타입은 힙을 거치지 않는다', fade(u, 1.0), { fill: MUT });
      say(657, 232, '칸 안의 값끼리 바로 비교한다', fade(u, 1.5)); return; }
    if (k === 4) { slot(36, 60, 's', 'String', 'null', { s: pop(u, 0.2), stroke: INFO, valCol: INFO });
      const H = obj(650, 230, 'String', '리터럴', ['h', 'i'], { s: pop(u, 1.3) });
      mono(56, 190, 's.equals("hi")', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      grow(160, 110, 160, 160, E(u, 0.5, 0.8), BAD); cross(290, 186, 11, pop(u, 0.9));
      mono(56, 222, 'NullPointerException', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      mono(H.l - 10, 130, '"hi".equals(s)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      result(650, 330, '"hi".equals(s)', 'false', fade(u, 2.0), pop(u, 2.0));
      say(650, 380, '상수를 앞에 두면 NPE가 없다', fade(u, 2.3), { 'font-weight': 400 }); return; }
    const X = slot(36, 60, 'x', 'String', '@A1', { s: k === 0 ? pop(u, 1.0) : 1, stroke: ACC, valCol: ACC }), Y = slot(36, 260, 'y', 'String', '@B2', { s: k === 0 ? pop(u, 1.3) : 1, stroke: INFO, valCol: INFO });
    const A = obj(700, 110, 'String', '@A1', ['h', 'i'], { s: k === 0 ? pop(u, 0.2) : 1, hi: (i) => k === 2 && u > 0.6 + i * 0.5, hiCol: GOOD });
    const Bo = obj(700, 310, 'String', '@B2', ['h', 'i'], { s: k === 0 ? pop(u, 0.5) : 1, hi: (i) => k === 2 && u > 0.6 + i * 0.5, hiCol: GOOD });
    ref(X[0], X[1], A.l, 110, k === 0 ? E(u, 1.3, 1.9) : 1, ACC); ref(Y[0], Y[1], Bo.l, 310, k === 0 ? E(u, 1.6, 2.2) : 1, INFO);
    if (k === 0) say(700, 212, 'new가 두 번 · 객체도 둘', fade(u, 2.2));
    if (k === 1) { fly(340, 85, 560, 190, seg(u, 0.3, 1.0), '@A1', { mono: true, stay: true }); fly(340, 285, 560, 232, seg(u, 0.3, 1.0), '@B2', { mono: true, stay: true, fill: INFO });
      mono(626, 218, '≠', { 'font-size': 26, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
      result(174, 200, 'x == y', 'false', fade(u, 1.6), pop(u, 1.6)); say(800, 218, '주소를 비교', fade(u, 1.2), { fill: MUT }); }
    if (k === 2) { [0, 1].forEach((i) => { const x = 700 - 24 + i * 48; el('line', { x1: x, y1: 146, x2: x, y2: 274, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 0.6 + i * 0.5) }); });
      result(174, 200, 'x.equals(y)', 'true', fade(u, 1.8), pop(u, 1.8)); say(830, 218, '글자를 비교', fade(u, 1.2), { fill: MUT }); } }

  // ---------- 4. String 불변성과 문자열 풀 ----------
  const PL = [560, 52, 360, 140];
  function s4(t, c) { const { k, u } = c;
    stackZone(24, 26, 296, 380); heapZone(350, 26, 584, 380);
    if (k < 6) zone(PL[0] - 10, PL[1], PL[2], PL[3], 'String pool', { fill: ACCBG, stroke: ACC, dash: '5 4', color: ACC });
    if (k <= 3) { const P = obj(740, 126, 'String', '@P1', ['h', 'i'], { s: k === 0 ? pop(u, 0.2) : 1 });
      const A = slot(36, 60, 'a', null, '@P1', { s: k === 0 ? pop(u, 0.6) : 1, stroke: ACC, valCol: ACC }), Bv = slot(36, 124, 'b', null, '@P1', { s: k === 0 ? pop(u, 1.2) : 1, stroke: ACC, valCol: ACC });
      ref(A[0], A[1], P.l, 116, k === 0 ? E(u, 0.8, 1.3) : 1, ACC); ref(Bv[0], Bv[1], P.l, 136, k === 0 ? E(u, 1.4, 1.9) : 1, ACC);
      if (k === 0) { say(740, 230, '같은 리터럴 · 객체는 하나', fade(u, 2.0)); return; }
      const H = obj(560, 320, 'String (new)', '@H9', ['h', 'i'], { s: k === 1 ? pop(u, 0.3) : 1, stroke: INFO });
      const Cv = slot(36, 300, 'c', null, '@H9', { s: k === 1 ? pop(u, 0.6) : 1, stroke: INFO, valCol: INFO });
      ref(Cv[0], Cv[1], H.l, 320, k === 1 ? E(u, 0.9, 1.5) : 1, INFO);
      if (k === 1) { say(800, 320, '풀 밖에 하나 더', fade(u, 1.6), { fill: INFO }); return; }
      if (k === 2) { result(170, 210, 'a == b', 'true', fade(u, 0.4), pop(u, 0.4)); result(170, 255, 'a == c', 'false', fade(u, 1.2), pop(u, 1.2)); say(820, 320, '== 는 화살표 끝을 본다', fade(u, 1.8)); return; }
      result(820, 250, 'a.equals(c)', 'true', fade(u, 0.3), pop(u, 0.3));
      ref(H.r, 320, P.r, 126, E(u, 1.0, 1.8), GOOD, { dash: '5 4' }); mono(H.r + 40, 360, 'c.intern()', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
      result(170, 230, 'a == c.intern()', 'true', fade(u, 2.0), pop(u, 2.0)); return; }
    if (k <= 5) { const P = obj(740, 126, 'String', '@P2', ['a', 'b'], {});
      const moved = k === 5 ? E(u, 1.0, 1.8) : 0, S = slot(36, 60, 's', null, moved > 0.5 ? '@H8' : '@P2', { stroke: moved > 0.5 ? INFO : ACC, valCol: moved > 0.5 ? INFO : ACC });
      if (k === 4) { ref(S[0], S[1], P.l, 126, 1, ACC); const g = 1 - fade(u, 2.0, 0.6);
        obj(580, 320, 'concat 결과', '@T7', ['a', 'b', 'c', 'd'], { s: pop(u, 0.4), op: g, stroke: OFF, dash: '5 4' });
        say(580, 386, '받는 변수가 없다 · 곧 GC 대상', fade(u, 1.2) * g, { fill: MUT, 'font-weight': 400 });
        mono(170, 230, 'println(s) => ab', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) }); return; }
      const H = obj(580, 320, 'String', '@H8', ['a', 'b', 'c', 'd'], { s: pop(u, 0.3), stroke: INFO });
      const y2 = lerp(126, 320, moved), x2 = lerp(P.l, H.l, moved); ref(S[0], S[1], x2, y2, 1, moved > 0.5 ? INFO : ACC);
      say(740, 222, '"ab"는 그대로 남는다', fade(u, 1.9), { fill: MUT, 'font-weight': 400 });
      mono(170, 230, 'println(s) => abcd', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 2.1) }); return; }
    // k6: StringBuilder 한 버퍼에 붙인다
    const Sb = obj(560, 300, 'StringBuilder 버퍼', 'sb', ['0', '1', '2', '', '', ''], { cw: 40, fill1: null, hi: (i) => i < 3 && u > 0.5 + i * 0.4 });
    slot(36, 280, 'sb', null, 'sb', { stroke: ACC, valCol: ACC }); ref(296, 305, Sb.l, 300, 1, ACC);
    [0, 1, 2].forEach((i) => fly(380, 200, 470 + i * 44, 300, seg(u, 0.3 + i * 0.4, 0.75 + i * 0.4), 'append(' + i + ')', { mono: true }));
    obj(780, 126, 'String', null, ['0', '1', '2'], { s: pop(u, 1.9), stroke: GOOD });
    grow(640, 270, 740, 180, E(u, 1.7, 2.0), GOOD); mono(720, 240, 'toString()', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
    say(170, 200, '+ 를 반복하면 매번 새 String', fade(u, 0.3), { fill: BAD, 'font-weight': 400 });
    say(170, 228, '버퍼는 하나, 마지막에 한 번', fade(u, 1.0)); }

  // ---------- 5. Integer 캐시와 형변환 ----------
  function cacheStrip(op, hi) { const xs = ['-128', '…', '99', '100', '101', '…', '127'];
    zone(340, 40, 590, 120, 'Integer 캐시 (-128 ~ 127, 미리 만들어 둔 객체)', { fill: GOODBG, stroke: GOOD, color: GOOD, op });
    xs.forEach((v, i) => card(392 + i * 80, 112, 68, 40, { rx: 6, text: v, mono: true, fs: 14.5, fw: 700, stroke: v === hi ? ACC : GRID, color: v === hi ? ACC : INK, fill: v === hi ? ACCBG : PANEL, op })); }
  function cup(x, y, w, h, label, bits, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.4 });
    mono(x + w / 2, y + h + 24, label, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' }); tx(x + w / 2, y + h + 46, bits, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { stackZone(24, 26, 290, 380); cacheStrip(1, '100');
      const A = slot(36, 60, 'a', 'Integer', '100', { s: k === 0 ? pop(u, 0.3) : 1, vw: 110 }), Bv = slot(36, 124, 'b', 'Integer', '100', { s: k === 0 ? pop(u, 0.5) : 1, vw: 110 });
      ref(A[0], A[1], 632, 92, k === 0 ? E(u, 0.8, 1.3) : 1, ACC); ref(Bv[0], Bv[1], 632, 128, k === 0 ? E(u, 1.1, 1.6) : 1, ACC);
      if (k === 0) { result(170, 380, 'a == b', 'true', fade(u, 2.0), pop(u, 2.0)); return; }
      const sC = k === 1 ? pop(u, 0.3) : 1, sD = k === 1 ? pop(u, 0.6) : 1;
      const Co = obj(520, 280, 'Integer', '새 객체', ['200'], { cw: 60, s: sC, stroke: INFO }), Do = obj(780, 280, 'Integer', '새 객체', ['200'], { cw: 60, s: sD, stroke: INFO });
      const Cv = slot(36, 230, 'c', 'Integer', '200', { s: sC, vw: 110, stroke: INFO }), Dv = slot(36, 300, 'd', 'Integer', '200', { s: sD, vw: 110, stroke: INFO });
      ref(Cv[0], Cv[1], Co.l, 280, k === 1 ? E(u, 0.8, 1.3) : 1, INFO); ref(Dv[0], Dv[1], Do.l, 290, k === 1 ? E(u, 1.0, 1.6) : 1, INFO);
      if (k === 1) { result(170, 380, 'c == d', 'false', fade(u, 2.0), pop(u, 2.0)); say(650, 370, '캐시 밖은 기본 설정에서 매번 새 객체', fade(u, 1.7), { fill: MUT, 'font-weight': 400 }); return; }
      [0, 1].forEach(() => {}); el('line', { x1: Co.r, y1: 294, x2: Do.l, y2: 294, stroke: GOOD, 'stroke-width': 2.4, 'stroke-dasharray': '5 4', opacity: fade(u, 0.5) });
      mono(650, 288, '200 = 200', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      result(170, 380, 'c.equals(d)', 'true', fade(u, 1.2), pop(u, 1.2)); say(650, 370, '값을 비교하면 범위와 상관없다', fade(u, 1.8)); return; }
    if (k === 3) { cup(150, 150, 120, 80, 'int', '32비트 정수'); cup(560, 130, 240, 100, 'double', '64비트 실수');
      mono(210, 198, '3', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', opacity: 1 - fade(u, 0.6, 0.2) });
      fly(210, 190, 680, 180, seg(u, 0.7, 1.6), '3', { mono: true });
      if (u > 1.6) mono(680, 190, '3.0', { 'font-size': 26, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
      mono(480, 90, 'double wide = i;', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      say(480, 360, '넓은 쪽으로는 캐스팅 없이 자동', fade(u, 1.9), { fill: GOOD }); return; }
    if (k === 4) { cup(150, 130, 240, 100, 'double', '64비트 실수'); cup(620, 150, 120, 80, 'int', '32비트 정수', { stroke: WARN });
      mono(270, 190, '3.9', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', opacity: 1 - fade(u, 0.6, 0.2) });
      const p = E(u, 0.7, 1.6); mono(lerp(258, 668, p), lerp(190, 198, p), '3', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: p >= 1 ? WARN : INK, opacity: u > 0.6 ? 1 : 0 });
      const d = E(u, 1.4, 2.4); mono(lerp(284, 720, Math.min(p, 1)), lerp(190, 400, d), '.9', { 'font-size': 24, 'font-weight': 800, fill: BAD, opacity: u > 0.6 ? 1 - d * 0.6 : 0 });
      mono(480, 90, 'int narrow = (int) 3.9;', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      pill(480, 300, '(int)', WARN, pop(u, 0.5), { mono: true, fs: 15 });
      say(480, 360, '반올림이 아니라 버림 · 3.9 → 3', fade(u, 2.0), { fill: WARN }); return; }
    // k5: 규칙 네 줄
    tx(60, 60, '이 장의 규칙', { 'font-size': 18, 'font-weight': 800 });
    (c.beat.rules || []).forEach((r, i) => { const y = 110 + i * 70, s = pop(u, 0.3 + i * 0.35);
      card(480, y, 840, 54, { rx: 10, stroke: i < 2 ? GOOD : GRID, sw: 2, s });
      mono(90, y + 6, String(i + 1), { 'font-size': 18, 'font-weight': 800, fill: i < 2 ? GOOD : MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.35) });
      tx(120, y + 6, r, { 'font-size': 16, 'font-weight': 600, opacity: fade(u, 0.4 + i * 0.35) }); }); }

  const quiz = [
    { q: 'int[] y = x; 다음 y[0] = 99를 실행하면 x[0]은 어떻게 되는가?',
      o: ['그대로 1이다', '99가 된다', '컴파일 에러가 난다'], a: 1,
      why: '배열 대입은 주소만 복사한다. x와 y가 같은 힙 객체를 가리키므로 x[0]도 99로 보인다.' },
    { q: 'Integer s = score.get("kim")이 null인데 int v = s;를 실행하면 어떻게 되는가?',
      o: ['v에 0이 들어간다', 'NullPointerException이 난다', 'v에 null이 들어간다'], a: 1,
      why: 'null을 int로 언박싱할 수 없어 NPE가 난다. (s != null) ? s : 0처럼 먼저 거른다.' },
    { q: 'new String("hi") 두 개를 x, y에 담았다. x == y의 결과는 무엇인가?',
      o: ['true', '실행마다 다르다', 'false'], a: 2,
      why: '==는 같은 객체인지 묻는다. new가 두 번이라 주소 @A1과 @B2가 달라 false다. 내용 비교는 equals로 한다.' },
    { q: 'String s = "ab"; s.concat("cd"); 다음 println(s)는 무엇을 찍는가?',
      o: ['ab', 'abcd', 'cd'], a: 0,
      why: 'String은 불변이다. concat은 새 객체 "abcd"를 돌려줄 뿐 s를 바꾸지 않고, 받는 변수가 없어 버려진다.' },
    { q: 'Integer c = 200, d = 200;일 때 c == d가 기본 설정에서 false인 이유는 무엇인가?',
      o: ['200은 캐시 범위 -128~127 밖이라 객체가 따로 만들어져서', '200은 int 범위를 넘어서', '== 가 값을 반올림해서'], a: 0,
      why: '캐시 범위 안의 100은 같은 객체를 받지만 200은 각각 새 객체다. 래퍼끼리의 값 비교는 equals로 한다.' },
  ];

  const summary = [
    '원시타입 변수는 값을 칸에 담고 참조타입 변수는 힙 객체의 주소를 담는다.',
    '참조 대입은 주소 복사라서 y[0]을 바꾸면 같은 배열을 보는 x[0]도 바뀐다.',
    'null인 Integer를 int로 풀면 NPE가 나고, 루프 누적을 Integer로 하면 매번 객체가 생긴다.',
    '리터럴 "hi"는 풀에서 공유되고 Integer는 -128~127만 캐시하니 값 비교는 equals로 한다.',
  ];
  const review = [
    { q: '테스트에서 Integer 두 값을 ==로 비교해 통과했는데, 운영에서 주문 번호 1000부터 틀린다. 원인은?',
      o: ['1000부터 int가 넘쳐서', '캐시 범위 밖 값은 서로 다른 객체라 ==가 false가 되어서', 'GC가 Integer를 지워서'], a: 1,
      why: '-128~127은 캐시된 같은 객체라 ==가 우연히 맞았다. 범위 밖은 새 객체이므로 equals로 비교해야 한다.' },
    { q: '메서드가 Map에서 점수를 꺼내 int에 담는 줄에서 가끔 NPE가 난다. 먼저 의심할 것은?',
      o: ['키가 없어 get이 null을 돌려준 경우', 'int 범위를 넘는 점수', '문자열 풀이 가득 찬 경우'], a: 0,
      why: 'Map.get은 키가 없으면 null을 준다. 그 null을 int로 언박싱하는 순간 NPE가 나므로 먼저 null을 걸러야 한다.' },
    { q: '로그인 코드가 입력 비밀번호 문자열을 저장된 값과 ==로 비교한다. 어떻게 고치나?',
      o: ['intern()을 입력값에만 붙인다', '두 값을 new String으로 다시 만든다', 'equals로 내용을 비교한다'], a: 2,
      why: '==는 주소를 비교해 내용이 같아도 false가 날 수 있다. 문자열 내용 비교는 equals로 한다.' },
  ];

  R.page({ title: '스택과 힙', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
