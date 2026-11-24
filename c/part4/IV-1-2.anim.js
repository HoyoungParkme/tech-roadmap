/* IV-1-2 동적 배열 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 재할당 횟수·복사 총량은 growth.c 를 zig cc 로 돌려 센 값이다 (realloc 호출 수, 옮긴 원소 수). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, fly } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // 힙 블록: cap 칸, vals 는 채워진 값, size 앞쪽만 유효. o.w 칸 폭
  function block(x, y, vals, cap, size, o) { o = o || {}; const w = o.w || 56, h = o.h || 46, op = o.op ?? 1;
    for (let i = 0; i < cap; i++) { const v = vals[i], live = i < size, has = v != null && v !== '';
      const st = (o.style && o.style(i)) || {};
      card(x + i * w + w / 2, y + h / 2, w, h, { rx: 0, text: has ? String(v) : '', fs: 16, mono: true, fw: 700,
        stroke: st.stroke || (live ? INK : GRID), fill: st.fill || (live ? PANEL : SOFT), color: st.color || (live ? INK : OFF), dash: live ? null : '4 4', sw: st.sw || 2, op: op * (st.op ?? 1), s: st.s });
      if (o.index !== false) mono(x + i * w + w / 2, y + h + 18, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); }
    return { x, y, w, h, R: x + cap * w, cx: (i) => x + i * w + w / 2 }; }
  // 위에 걸친 괄호: 칸 a..b-1
  function brace(x1, x2, y, label, col, op) { if (op <= 0) return;
    el('path', { d: `M${x1},${y + 8} L${x1},${y} L${x2},${y} L${x2},${y + 8}`, fill: 'none', stroke: col, 'stroke-width': 2.2, opacity: op });
    tx((x1 + x2) / 2, y - 8, label, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: col, opacity: op }); }
  // Vec 구조체 (스택): data / size / capacity 세 칸
  function vecBox(x, y, d, o) { o = o || {}; const rows = [['data', d.data], ['size', d.size], ['capacity', d.cap]];
    tx(x, y - 12, o.name || 'Vec v', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: MUT });
    rows.forEach(([n, v], i) => { const yy = y + i * 46, s = o.rowS ? o.rowS(i) : 1; if (s <= 0) return;
      el('rect', { x, y: yy, width: 210, height: 42, rx: 4, fill: PANEL, stroke: (o.hot === i) ? ACC : INK, 'stroke-width': o.hot === i ? 3 : 2, opacity: s });
      tx(x + 12, yy + 27, n, { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: MUT, opacity: s });
      mono(x + 198, yy + 27, v == null ? '' : String(v), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: v === '??' ? WARN : v === 'NULL' ? MUT : INK, opacity: s }); });
    return { dataX: x + 210, dataY: y + 21 }; }
  const fmt = (v) => String(Math.round(v));

  // ---------- 1. 구조 ----------
  function s1(t, c) { const { k, u } = c, B = { x: 330, y: 170 };
    zone(20, 40, 270, 230, '스택', { fill: SOFT }); zone(310, 40, 630, 330, '힙', { fill: SOFT });
    if (k === 0) { vecBox(45, 100, { data: '', size: '', cap: '' }, { rowS: (i) => pop(u, 0.3 + i * 0.4) });
      mono(155, 262, 'sizeof(Vec) = 24', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(625, 200, '아직 힙에는 한 칸도 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.5) });
      tx(480, 400, '포인터 하나만으로는 몇 개 담았는지도, 몇 개까지 담을 수 있는지도 모른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { const ty = (i) => u > 0.4 + i * 0.4;
      vecBox(45, 100, { data: ty(0) ? 'NULL' : '??', size: ty(1) ? 0 : '??', cap: ty(2) ? 0 : '??' });
      mono(155, 262, 'vec_init(&v)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
      tx(625, 190, '첫 push 까지 힙 할당을 미룬다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: INK, opacity: fade(u, 1.8) });
      sub(625, 220, '(lazy 할당)', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2) { const gone = E(u, 0.4, 1.4), nul = u > 1.4;
      const b = block(B.x + 40, B.y, [10, 20, 30, null], 4, 3, { op: 1 - gone });
      if (gone < 1) for (let i = 0; i < 4; i++) el('rect', { x: B.x + 40 + i * 56 + 20 + Math.cos(i * 1.7) * 60 * gone, y: B.y + 18 + 40 * gone * (i % 2 ? 1 : -1), width: 14, height: 10, rx: 2, fill: OFF, opacity: gone > 0 ? 1 - gone : 0 });
      const v = vecBox(45, 100, { data: nul ? 'NULL' : '0x…(블록)', size: u > 1.8 ? 0 : 3, cap: u > 1.8 ? 0 : 4 }, { hot: nul ? 0 : null });
      if (!nul) grow(v.dataX + 2, v.dataY, B.x + 38, B.y + 23, 1, gone > 0.3 ? BAD : ACC);
      mono(625, 300, 'free(v->data);', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.3) });
      mono(625, 330, 'v->data = NULL;  size = capacity = 0;', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(480, 404, 'NULL 로 밀어 두면 다시 써도 dangling 이 아니라 빈 벡터다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    const size = k === 3 ? 2 : tween(2, 3, u), sz = Math.round(size);
    const b = block(B.x + 40, B.y, [10, 20, k === 4 && u > 0.9 ? 30 : null, null], 4, sz, { w: 90 });
    const v = vecBox(45, 100, { data: '0x…(블록)', size: fmt(size), cap: 4 }, { hot: k === 4 ? 1 : null });
    grow(v.dataX + 2, v.dataY, B.x + 38, B.y + 23, 1, ACC);
    if (k === 4) fly(B.x + 40 + 2 * 90 + 45, B.y - 70, B.x + 40 + 2 * 90 + 45, B.y + 23, seg(u, 0.2, 0.9), '30', { mono: true });
    brace(b.x, b.x + sz * 90, B.y - 20, `size = ${sz}`, ACC, k === 3 ? fade(u, 0.3) : 1);
    el('path', { d: `M${b.x},${B.y + 76} L${b.x},${B.y + 84} L${b.R},${B.y + 84} L${b.R},${B.y + 76}`, fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: k === 3 ? fade(u, 0.9) : 1 });
    mono((b.x + b.R) / 2, B.y + 106, 'capacity = 4', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 0.9) : 1 });
    if (k === 3) { mono(625, 340, '0 <= size <= capacity', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(480, 404, '루프 경계는 size · capacity 까지 돌면 쓰레기값을 읽는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }
    else tx(480, 404, 'size 만 3 으로 늘고 capacity 는 4 그대로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }

  // ---------- 2. push_back ----------
  const P = { x: 330, y: 110, w: 70 };
  function s2(t, c) { const { k, u, beat } = c, ps = beat.pushSeq;
    zone(20, 40, 270, 230, '스택', { fill: SOFT });
    const oldB = { x: P.x, y: P.y }, newB = { x: P.x, y: 260 };
    if (k === 0) { const sz = u > 1.0 ? 4 : 3;
      block(oldB.x, oldB.y, [10, 20, 30, u > 1.0 ? 40 : null], 4, sz, { w: P.w });
      const v = vecBox(45, 100, { data: '0x…(4칸)', size: sz, cap: 4 }, { hot: u > 1.0 ? 1 : null }); grow(v.dataX + 2, v.dataY, oldB.x - 3, oldB.y + 23, 1, ACC);
      fly(oldB.x + 3 * P.w + 35, 330, oldB.x + 3 * P.w + 35, oldB.y + 23, seg(u, 0.2, 1.0), '40', { mono: true });
      mono(560, 330, 'v->data[v->size++] = 40;', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(560, 370, '여유 칸이 있으면 대입 한 번 · O(1)', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { block(oldB.x, oldB.y, [10, 20, 30, 40], 4, 4, { w: P.w, style: () => ({ stroke: BAD }) });
      const v = vecBox(45, 100, { data: '0x…(4칸)', size: 4, cap: 4 }, { hot: 2 }); grow(v.dataX + 2, v.dataY, oldB.x - 3, oldB.y + 23, 1, ACC);
      // need 5 vs capacity 4 저울 막대
      const g = E(u, 0.3, 1.3), bx = 420, unit = 70;
      tx(bx - 20, 300, 'need', { 'font-size': 15, 'font-weight': 800, class: 'mono', 'text-anchor': 'end' }); el('rect', { x: bx, y: 284, width: 5 * unit * g, height: 24, rx: 3, fill: BAD });
      mono(bx + 5 * unit * g + 10, 302, '5 = size + 1', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      tx(bx - 20, 344, 'capacity', { 'font-size': 15, 'font-weight': 800, class: 'mono', 'text-anchor': 'end' }); el('rect', { x: bx, y: 328, width: 4 * unit * g, height: 24, rx: 3, fill: INFO });
      mono(bx + 4 * unit * g + 10, 346, '4', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.3) });
      tx(560, 400, '5 > 4 · 조기 반환을 지나 재할당으로 간다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { block(oldB.x, oldB.y, [10, 20, 30, 40], 4, 4, { w: P.w });
      for (let i = 4; i < 8; i++) el('rect', { x: oldB.x + i * P.w, y: oldB.y, width: P.w, height: 46, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.0) });
      const v = vecBox(45, 100, { data: '0x…(4칸)', size: 4, cap: 4 }); grow(v.dataX + 2, v.dataY, oldB.x - 3, oldB.y + 23, 1, ACC);
      const cap = tween(4, 8, u);
      card(560, 300, 300, 60, { rx: 10, stroke: ACC, fill: ACCBG });
      mono(560, 307, `cap = 4 × 2 = ${fmt(cap)}`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      tx(560, 370, '아직 계산만 · 힙은 4칸 그대로', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(560, 400, 'capacity 가 0 이면 1 부터 (0 × 2 는 계속 0)', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    // k3~k5: 새 블록
    const swap = k === 3 ? 0 : k === 4 ? E(u, 0.3, 1.0) : 1, oldGone = k === 3 ? 0 : k === 4 ? E(u, 1.2, 2.0) : 1;
    block(oldB.x, oldB.y, [10, 20, 30, 40], 4, 4, { w: P.w, op: 1 - oldGone * 0.85 });
    if (oldGone > 0.5) mono(oldB.x + 4 * P.w + 20, oldB.y + 28, '옛 블록 · realloc 이 해제', { 'font-size': 14, fill: MUT, opacity: oldGone });
    const sz = k === 5 && u > 1.0 ? 5 : 4, nv = [10, 20, 30, 40, sz === 5 ? 50 : null];
    const copied = k === 3 ? Math.floor(E(u, 0.5, 1.9) * 4.99) : 4;
    block(newB.x, newB.y, nv.map((x, i) => (i < 4 && i >= copied ? null : x)), 8, k === 3 ? copied : sz, { w: P.w, op: k === 3 ? fade(u, 0.2) : 1, style: (i) => (i === 4 && sz === 5 ? { stroke: ACC, fill: ACCBG } : {}) });
    if (k === 3) for (let i = 0; i < 4; i++) dot([[oldB.x + i * P.w + 35, oldB.y + 46], [newB.x + i * P.w + 35, newB.y]], seg(u, 0.5 + i * 0.3, 0.9 + i * 0.3), ACC, 6);
    const v = vecBox(45, 100, { data: swap > 0.5 ? '0x…(8칸)' : '0x…(4칸)', size: sz, cap: swap > 0.5 ? 8 : 4 }, { hot: k === 4 ? 2 : k === 5 ? 1 : null });
    // data 화살표: 옛 블록 → 새 블록
    if (swap < 1) grow(v.dataX + 2, v.dataY, oldB.x - 3, oldB.y + 23, 1, swap > 0 ? OFF : ACC, { op: 1 - swap });
    if (swap > 0) grow(v.dataX + 2, v.dataY, newB.x - 3, newB.y + 23, swap, ACC);
    // tmp 포인터 (k3)
    if (k === 3) { card(155, 305, 120, 36, { rx: 6, text: 'tmp', fs: 15, mono: true, fw: 800, stroke: WARN, color: WARN, op: fade(u, 0.2) }); grow(217, 305, newB.x - 3, newB.y + 23, seg(u, 0.3, 0.9), MUT);
      tx(newB.x + 280, 360, 'v->data 는 아직 옛 블록 · 실패해도 원본은 멀쩡', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); }
    if (k === 4) mono(newB.x + 280, 360, 'v->data = tmp;  v->capacity = 8;', { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) });
    if (k === 5) { fly(newB.x + 4 * P.w + 35, 390, newB.x + 4 * P.w + 35, newB.y + 23, seg(u, 0.2, 1.0), '50', { mono: true });
      tx(newB.x + 280, 390, '자리가 생겼으니 data[4] = 50, size 5', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); } }

  // ---------- 3. 분할상환 ----------
  // push 번호 i(1..n) 에서 옮기는 원소 수: +1 전략은 i-1, 2배 전략은 i-1 이 2의 거듭제곱(또는 0)일 때만
  const isGrow = (i) => i === 1 || ((i - 1) & (i - 2)) === 0;
  function lane(y, h, n, kind, u, prevTot, tot, label, col) {
    const x0 = 160, W = 740, bw = W / n, maxv = n - 1;
    tx(40, y + 20, label, { 'font-size': 15, 'font-weight': 800, fill: col });
    el('line', { x1: x0, y1: y + h, x2: x0 + W, y2: y + h, stroke: MUT, 'stroke-width': 1.5 });
    const shown = E(u, 0.2, 1.8) * n;
    for (let i = 1; i <= n; i++) { if (i > shown + 1) break; const cp = i - 1, re = kind === 'bad' || isGrow(i);
      const hh = re ? Math.max(2, (cp / Math.max(1, maxv)) * (h - 36)) : 2;
      el('rect', { x: x0 + (i - 1) * bw + 0.5, y: y + h - hh, width: Math.max(1, bw - 1.2), height: hh, fill: re ? col : OFF, opacity: re ? 0.85 : 0.6 }); }
    mono(x0 + W, y + 18, `realloc ${fmt(tween(prevTot.r, tot.r, u))}회 · 복사 ${fmt(tween(prevTot.c, tot.c, u))}`, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'end', fill: col }); }
  function s3(t, c) { const { k, u, beat, prev } = c, cmp = beat.compare, pc = prev && prev.compare ? prev.compare : cmp, n = cmp.n;
    mono(480, 34, `n = ${n} 개 push · 막대 = 그 push 에서 옮긴 원소 수`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
    if (k === 5) { // 1+2+4+8 < 2n
      const segs = [1, 2, 4, 8], x0 = 160, unit = 22; let x = x0;
      tx(40, 120, '2배 성장 복사', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      segs.forEach((v, i) => { const g = E(u, 0.2 + i * 0.3, 0.6 + i * 0.3); if (g > 0) { el('rect', { x, y: 100, width: v * unit * g, height: 36, rx: 3, fill: GOOD, opacity: 0.35 + i * 0.15, stroke: PANEL, 'stroke-width': 2 }); if (g > 0.9) mono(x + v * unit / 2, 124, String(v), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INK }); } x += v * unit * g; });
      mono(x0 + 15 * unit + 12, 124, '= 15', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      el('line', { x1: x0 + 32 * unit, y1: 84, x2: x0 + 32 * unit, y2: 152, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 1.6) });
      mono(x0 + 32 * unit - 6, 172, '2n = 32', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      mono(160, 240, '+1 성장은 1+2+…+15 = 120', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
      tx(480, 320, '2배 성장은 n 개를 넣는 전체 복사가 2n 보다 적다', { 'text-anchor': 'middle', 'font-size': 16.5, 'font-weight': 800, opacity: fade(u, 2.2) });
      sub(480, 352, '그래서 push 한 번은 평균 상수 · 분할상환 O(1)', fade(u, 2.4), { 'font-size': 15 }); return; }
    lane(60, 140, n, 'bad', u, { r: pc.grow1.reallocs, c: pc.grow1.copies }, { r: cmp.grow1.reallocs, c: cmp.grow1.copies }, '매번 +1칸', BAD);
    lane(240, 140, n, 'good', u, { r: pc.grow2.reallocs, c: pc.grow2.copies }, { r: cmp.grow2.reallocs, c: cmp.grow2.copies }, '2배 성장', GOOD);
    const caps = cmp.caps2.join(' → ');
    mono(160, 404, `capacity ${caps}`, { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
    if (k === 4) mono(900, 404, `${n - cmp.grow2.reallocs}번은 대입만`, { 'font-size': 15, 'font-weight': 800, fill: INK, 'text-anchor': 'end', opacity: fade(u, 2.2) }); }

  // ---------- 4. 접근·삭제·shrink ----------
  const O = { x: 200, y: 160, w: 70 };
  function s4(t, c) { const { k, u } = c;
    const bx = O.x, by = O.y, cx = (i) => bx + i * O.w + O.w / 2;
    const sizeLbl = (sz, cap, prevSz) => mono(480, 76, `size ${fmt(prevSz == null ? sz : tween(prevSz, sz, u))} / capacity ${cap}`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
    if (k === 0) { block(bx, by, [10, 20, 30, 40, 50], 8, 5, { w: O.w, style: (i) => (i === 3 && u > 1.6 ? { stroke: ACC, fill: ACCBG, sw: 3 } : {}) });
      sizeLbl(5, 8);
      ['+0', '+4', '+8', '+12', '+16'].forEach((s, i) => mono(cx(i), by + 90, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3) }));
      tx(bx - 14, by + 90, '바이트', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.3) });
      card(110, by + 23, 90, 40, { rx: 6, text: 'data', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG });
      const g = E(u, 0.8, 1.6); el('path', { d: `M155,${by + 10} Q${(155 + cx(3)) / 2},${by - 90} ${cx(3)},${by - 4}`, fill: 'none', stroke: ACC, 'stroke-width': 2.6, pathLength: 100, 'stroke-dasharray': `${g * 100} 100`, 'marker-end': g > 0.98 ? 'url(#ra-ahb)' : null });
      mono(480, 300, 'vec_get(v, 3)  =  *(data + 3)  =  40', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) });
      tx(480, 340, '주소 = 시작 + 3 × 4바이트 · 계산 한 번, 걸을 필요가 없다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { const sz = u > 1.0 ? 4 : 5;
      block(bx, by, [10, 20, 30, 40, 50], 8, sz, { w: O.w });
      sizeLbl(4, 8, 5);
      mono(480, 300, 'if (v->size) v->size--;', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      tx(cx(4), by + 80, '값 50 은 남아 있지만 이제 여유 칸', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) });
      tx(480, 360, '지우지 않고 size 만 줄인다 · O(1) · capacity 그대로', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { // vec_erase(v, 1): [10,20,30,40] → [10,30,40]
      const mv = E(u, 0.7, 1.9), out = seg(u, 0.2, 0.6);
      block(bx, by, [10, '', '', '', 50], 8, 4, { w: O.w, style: (i) => (i >= 1 && i <= 3 ? {} : {}) });
      card(cx(1), by + 23 - 60 * out, O.w - 8, 38, { rx: 4, text: '20', fs: 16, mono: true, fw: 700, stroke: BAD, color: BAD, op: 1 - seg(u, 0.5, 0.8) });
      [[2, 30], [3, 40]].forEach(([i, v]) => card(lerp(cx(i), cx(i - 1), mv), by + 23, O.w - 8, 38, { rx: 4, text: String(v), fs: 16, mono: true, fw: 700, stroke: INFO, color: INK, fill: INFOBG }));
      if (u > 2.0) el('rect', { x: bx + 3 * O.w + 4, y: by + 4, width: O.w - 8, height: 38, rx: 4, fill: SOFT, stroke: GRID, 'stroke-dasharray': '4 4' });
      sizeLbl(3, 8, 4);
      mono(480, 300, 'memmove(&data[1], &data[2], 2 × sizeof(int));', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      tx(480, 340, '뒤에 있는 원소 수만큼 옮긴다 · 앞쪽을 지울수록 많이 · O(n)', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { // swap_pop(v, 0): [10,30,40] → [40,30]
      const mv = E(u, 0.5, 1.5), dropS = u > 1.7;
      block(bx, by, ['', 30, dropS ? 40 : '', 40, 50], 8, dropS ? 2 : 3, { w: O.w, style: (i) => (i === 2 && !dropS ? {} : {}) });
      card(cx(0), by + 23 - 50 * clamp(mv * 2), O.w - 8, 38, { rx: 4, text: '10', fs: 16, mono: true, fw: 700, stroke: BAD, color: BAD, op: 1 - clamp(mv * 2) });
      if (!dropS) card(lerp(cx(2), cx(0), mv), by + 23 - Math.sin(mv * Math.PI) * 60, O.w - 8, 38, { rx: 4, text: '40', fs: 16, mono: true, fw: 700, stroke: ACC, color: ACC, fill: ACCBG });
      else card(cx(0), by + 23, O.w - 8, 38, { rx: 4, text: '40', fs: 16, mono: true, fw: 700, stroke: ACC, color: ACC, fill: ACCBG });
      sizeLbl(2, 8, 3);
      mono(480, 300, 'data[0] = data[size - 1];  size--;', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      tx(480, 340, '옮김은 한 번뿐 · O(1) · 대신 순서가 10,30 에서 40,30 으로 바뀐다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) }); return; }
    // k4: shrink — size 3 / capacity 16 → 3
    const sh = E(u, 0.8, 2.0), cap = Math.round(lerp(16, 3, sh)), w = 44;
    block(80, by, [10, 20, 30], cap, 3, { w, index: false });
    mono(480, 76, `size 3 / capacity ${cap}`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
    if (sh < 0.05) brace(80 + 3 * w, 80 + 16 * w, by - 14, '13칸 낭비', WARN, fade(u, 0.2));
    mono(480, 300, 'realloc(v->data, v->size * sizeof(int));', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
    tx(480, 340, '남는 칸을 반납한다 · 블록 주소가 바뀔 수 있다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.0) });
    sub(480, 370, '곧 다시 넣을 거라면 또 재할당이 나므로 남발하지 않는다', fade(u, 2.3), { 'font-size': 15 }); }

  // ---------- 5. 함정 ----------
  function s5(t, c) { const { k, u, beat } = c;
    if (k < 5) zone(20, 40, 250, 250, '스택', { fill: SOFT });
    if (k === 0) { block(400, 110, [u > 0.8 ? 10 : null], 1, u > 0.8 ? 1 : 0, { w: 70, op: fade(u, 0.3) });
      const v = vecBox(40, 90, { data: u > 0.8 ? '0x…A' : 'NULL', size: u > 0.8 ? 1 : 0, cap: u > 0.8 ? 1 : 0 }); if (u > 0.8) grow(v.dataX + 2, v.dataY, 397, 133, seg(u, 0.8, 1.3), ACC);
      mono(437, 90, '블록 A (예시)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      tx(600, 330, 'size 1 = capacity 1 · 이미 꽉 찼다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); return; }
    if (k === 1 || k === 2) { const mv = k === 1 ? E(u, 1.0, 1.8) : 1;
      block(400, 110, [10], 1, 1, { w: 70, op: 1 - 0.6 * mv, style: () => (mv > 0.5 ? { dash: '4 4', stroke: OFF } : {}) });
      mono(437, 90, mv > 0.5 ? '블록 A · 해제됨' : '블록 A (예시)', { 'font-size': 14, fill: mv > 0.5 ? BAD : MUT, 'text-anchor': 'middle' });
      block(600, 230, [10, mv > 0.9 ? 20 : null], 2, mv > 0.9 ? 2 : 1, { w: 70, op: mv });
      mono(670, 210, '블록 B (예시)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: mv });
      const v = vecBox(40, 90, { data: mv > 0.5 ? '0x…B' : '0x…A', size: mv > 0.9 ? 2 : 1, cap: mv > 0.5 ? 2 : 1 });
      if (mv < 1) grow(v.dataX + 2, v.dataY, 397, 133, 1, ACC, { op: 1 - mv }); if (mv > 0) grow(v.dataX + 2, v.dataY, 597, 253, mv, ACC);
      card(155, 260, 100, 36, { rx: 6, text: 'int *p', fs: 15, mono: true, fw: 800, stroke: WARN, color: WARN, op: k === 1 ? fade(u, 0.2) : 1 });
      grow(205, 252, 410, 160, k === 1 ? seg(u, 0.3, 0.9) : 1, mv > 0.5 ? BAD : MUT);
      if (k === 1) tx(600, 380, '같은 자리에서 늘어날 수도 있지만 보장은 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      else { const b = pop(u, 0.4); cross(437, 133, 20, b);
        mono(600, 350, 'printf("%d", *p);   // 해제된 블록 A', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.6) });
        tx(600, 390, '미정의 동작 · 안 죽고 지나가면 조용한 데이터 손상으로 남는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
      return; }
    if (k === 3 || k === 4) { // reserve(1000) → cap 1024, 1000개 넣어도 이동 0
      const fill = k === 3 ? E(u, 0.8, 2.3) : 1, sz = Math.round(fill * 1000) + (k === 4 && u > 1.0 ? 1 : 0);
      const x0 = 320, W = 600;
      el('rect', { x: x0, y: 110, width: W, height: 46, rx: 4, fill: SOFT, stroke: INK, 'stroke-width': 2 });
      el('rect', { x: x0, y: 110, width: W * (sz / 1024), height: 46, rx: 4, fill: ACC, opacity: 0.75 });
      mono(x0, 180, '0', { 'font-size': 13.5, fill: MUT }); mono(x0 + W, 180, '1024', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      const v = vecBox(40, 90, { data: '0x…C', size: sz, cap: 1024 }, { name: 'Vec w', hot: 1 }); grow(v.dataX + 2, v.dataY, x0 - 3, 133, 1, ACC);
      if (k === 3) { mono(620, 240, 'vec_reserve(&w, 1000);   // 1에서 2배씩 → 1024', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
        mono(620, 290, `realloc 0회 · data 주소 그대로`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) }); return; }
      card(155, 260, 100, 36, { rx: 6, text: 'idx = 0', fs: 15, mono: true, fw: 800, stroke: INFO, color: INFO });
      mono(x0 + 8, 100, '[0]', { 'font-size': 14, 'font-weight': 800, fill: INFO });
      mono(620, 240, 'vec_push_back(&w, 42);   // size 1001', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      R.terminal(380, 280, 480, 90, ['$ ./pitfalls', u > 1.5 ? '0' : ''], 2, { title: 'printf("%d\\n", w.data[idx])' });
      tx(620, 400, '인덱스는 블록이 옮겨가도 그대로 맞다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.0) }); return; }
    // k5: 함정 4종 → 해결
    beat.fails.forEach((f, i) => { const y = 60 + i * 82, s = fade(u, 0.2 + i * 0.35), s2 = fade(u, 0.5 + i * 0.35);
      cross(52, y + 10, 8, s); tx(72, y + 16, f.bad, { 'font-size': 16, 'font-weight': 800, opacity: s });
      tx(72, y + 42, f.why, { 'font-size': 14, fill: MUT, opacity: s });
      check(532, y + 10, 9, s2); tx(552, y + 16, f.fix, { 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: s2 }); });
    tx(480, 400, 'std::vector · 파이썬 list · 자바 ArrayList 도 같은 뼈대다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) }); }

  const quiz = [
    { q: 'size가 2이고 capacity가 4인 벡터에서 for 루프 경계로 써야 하는 값은 무엇인가?',
      o: ['capacity, 확보한 칸을 모두 돌아야 한다', 'size, 앞쪽 유효한 칸만 돌아야 한다', '둘 중 큰 값'], a: 1,
      why: '앞 2칸만 유효하고 뒤 2칸은 초기화되지 않은 여유 칸이다. capacity까지 돌면 쓰레기값을 읽는다.' },
    { q: 'realloc 결과를 tmp로 먼저 받는 까닭은 무엇인가?',
      o: ['실패해 NULL이 와도 v->data의 원래 블록 주소를 잃지 않기 위해서다', 'tmp를 써야 realloc이 원소를 복사해 주기 때문이다', 'capacity를 2배로 계산하려면 tmp가 필요하기 때문이다'], a: 0,
      why: 'v->data = realloc(...)은 실패하면 NULL로 덮여 원래 블록을 잃는다. tmp로 받아 NULL을 거른 뒤에만 교체한다.' },
    { q: '원소 64개를 push할 때 2배 성장 전략의 realloc 호출 수는 몇 번인가?',
      o: ['64번', '32번', '7번'], a: 2,
      why: 'capacity가 1, 2, 4, …, 64로 커질 때만 재할당해 7번이다. 매번 +1칸 전략은 64번 부르고 복사도 2016번 한다.' },
    { q: '[10, 30, 40]에서 순서가 상관없을 때 0번을 O(1)에 지우는 방법은 무엇인가?',
      o: ['memmove로 뒤 원소를 한 칸씩 당긴다', '마지막 원소 40으로 0번을 덮고 size를 줄인다', 'capacity를 size에 맞게 줄인다'], a: 1,
      why: 'swap-and-pop은 옮김이 한 번뿐이라 O(1)이다. 대신 결과가 [40, 30]이 되어 순서가 바뀐다.' },
    { q: 'int *p = &v.data[0]; 다음에 push가 재할당을 일으키면 p는 어떻게 되나?',
      o: ['새 블록의 0번을 자동으로 따라간다', 'NULL로 바뀐다', '해제된 옛 블록을 가리킬 수 있어 쓰면 미정의 동작이다'], a: 2,
      why: 'realloc은 블록을 옮길 수 있고 p는 그 사실을 모른다. 주소 대신 인덱스를 들거나 reserve로 재할당을 막는다.' },
  ];

  const summary = [
    '동적 배열은 힙 주소 data, 채운 수 size, 확보한 칸 수 capacity 세 값으로 이뤄진다.',
    '꽉 찼을 때만 capacity를 2배로 realloc하면 push는 평균 상수 시간이다.',
    '64개를 넣을 때 매번 +1칸은 realloc 64번, 2배 성장은 7번이다.',
    'realloc 뒤에는 예전에 받아 둔 원소 주소를 버리고 인덱스로 다시 찾는다.',
  ];
  const review = [
    { q: '파일에서 줄을 읽어 벡터에 넣는 코드가 10만 줄쯤에서 눈에 띄게 느려진다. 먼저 확인할 것은?',
      o: ['push가 매번 한 칸씩만 늘려 realloc하는지', 'size와 capacity를 같은 타입으로 썼는지', 'pop_back이 메모리를 돌려주는지'], a: 0,
      why: '+1 성장은 넣을 때마다 전체를 복사해 O(n²)이 된다. 꽉 찼을 때만 2배로 키우면 복사 총량이 2n보다 적다.' },
    { q: '벡터를 돌며 조건에 맞는 원소를 같은 벡터에 push하는 루프가 가끔 이상한 값을 읽는다. 원인으로 가장 그럴듯한 것은?',
      o: ['인덱스로 접근해서 범위가 틀어졌다', 'capacity를 2배로 늘린 것이 너무 크다', '루프가 잡고 있던 원소 포인터가 재할당 뒤 옛 블록을 가리킨다'], a: 2,
      why: 'push가 재할당을 부르면 블록이 옮겨질 수 있다. 미리 reserve하거나 포인터 대신 인덱스를 들고 다니면 된다.' },
    { q: '게임 오브젝트 목록에서 죽은 오브젝트를 자주 지운다. 순서는 상관없다. 어떤 삭제가 맞나?',
      o: ['vec_erase로 뒤를 당긴다', 'swap-and-pop으로 맨 끝 원소로 덮는다', '지울 때마다 shrink로 capacity를 줄인다'], a: 1,
      why: '순서가 의미 없으면 한 번 덮고 size만 줄이는 O(1) 삭제가 맞다. erase는 뒤 원소 수만큼 옮기고, 잦은 shrink는 재할당을 부른다.' },
  ];

  R.page({ title: '동적 배열 메모리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
