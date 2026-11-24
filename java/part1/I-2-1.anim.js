/* I-2-1 배열과 제어문 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 배열 칸 = 힙의 연속 슬롯, ▲ = 인덱스 i. ArrayList 내부 용량 10·1.5배 증가는 OpenJDK 구현 기준이다(명세가 아님). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: op ?? 1 }, a || {}));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: op ?? 1 }, a || {}));

  // 배열 한 줄: 왼쪽 위 (x, y), 칸 폭 w. o.st(i) → {stroke, fill, color, s, op, dash}, o.idx 인덱스 표시
  function arr(x, y, vals, o) { o = o || {}; const w = o.w || 72, h = o.h || 50, gap = o.gap ?? 8;
    vals.forEach((v, i) => { const st = (o.st && o.st(i)) || {}, cx = x + i * (w + gap) + w / 2; if ((st.s ?? 1) <= 0) return;
      card(cx, y + h / 2, w, h, { rx: 6, text: v == null ? '' : String(v), mono: true, fs: o.fs || 17, fw: 700, stroke: st.stroke || INK, fill: st.fill, color: st.color, s: st.s, op: st.op, dash: st.dash, sw: st.sw || 2 });
      if (o.idx !== false) mono(cx, y + h + 20, String(i), { 'font-size': 14, fill: st.idxCol || MUT, 'text-anchor': 'middle', opacity: st.op ?? 1 }); });
    return (i) => x + i * (w + gap) + w / 2; }
  const ptr = (x, y, col, label) => { el('path', { d: `M${x},${y} l-9,15 h18 z`, fill: col || ACC }); if (label) mono(x, y + 34, label, { 'font-size': 15, 'font-weight': 800, fill: col || ACC, 'text-anchor': 'middle' }); };
  function varBox(x, y, name, val, o) { o = o || {}; mono(x, y + 6, name, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: o.nameCol || INK });
    card(x + 70, y, o.w || 110, 42, { rx: 7, text: String(val), mono: true, fs: 17, fw: 800, stroke: o.stroke || INK, color: o.color || INK, fill: o.fill, s: o.s }); }
  function refLine(x1, y1, x2, y2, u, col) { if (u <= 0) return; const mx = (x1 + x2) / 2;
    el('path', { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, fill: 'none', stroke: col || ACC, 'stroke-width': 2.4, pathLength: 100, 'stroke-dasharray': u < 1 ? `${u * 100} 100` : null });
    el('circle', { cx: x1, cy: y1, r: 4, fill: col || ACC }); if (u >= 1) el('circle', { cx: x2, cy: y2, r: 4.5, fill: col || ACC }); }
  function diamond(cx, cy, text, o) { o = o || {}; const w = o.w || 200, h = o.h || 64, s = o.s ?? 1; if (s <= 0) return;
    el('path', { d: `M${cx},${cy - h / 2} L${cx + w / 2},${cy} L${cx},${cy + h / 2} L${cx - w / 2},${cy} Z`, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, transform: `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})` });
    mono(cx, cy + 5, text, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: o.color || INK, opacity: s }); }

  // ---------- 1. 배열 선언과 생성 ----------
  function s1(t, c) { const { k, u } = c;
    zone(24, 26, 200, 380, 'Stack', { fill: SOFT }); zone(250, 26, 686, 380, 'Heap', { fill: 'none', stroke: GRID, dash: '6 5' });
    if (k <= 2) { const X = 320, vals = k === 0 ? ['', '', '', '', ''] : k === 1 ? ['0', '0', '0', '0', '0'] : [u > 1.9 ? '10' : '0', '0', '0', '0', u > 1.9 ? '50' : '0'];
      const cx = arr(X, 110, vals, { st: (i) => ({ s: k === 0 ? pop(u, 0.3 + i * 0.15) : 1, stroke: k === 2 && (i === 0 || i === 4) && u > 1.9 ? ACC : INK, fill: k === 2 && (i === 0 || i === 4) && u > 1.9 ? ACCBG : PANEL }) });
      varBox(80, 135, 'a', '•', { w: 70, s: k === 0 ? pop(u, 1.2) : 1, stroke: ACC, color: ACC }); refLine(150, 135, X - 4, 135, k === 0 ? E(u, 1.4, 1.9) : 1, ACC);
      if (k === 0) { say(600, 230, 'int 5칸이 한 덩어리로 이어져 있다', fade(u, 1.6)); R.lock(860, 135, true, INK, pop(u, 2.0)); note(860, 180, 'length 5 고정', fade(u, 2.1)); return; }
      if (k === 1) { mono(600, 230, 'a.length → 5    a[0] → 0', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
        [['int', '0'], ['double', '0.0'], ['boolean', 'false'], ['char', "'\\u0000'"], ['참조형', 'null']].forEach(([ty, v], i) => { const x = 330 + i * 120, s = pop(u, 1.0 + i * 0.2);
          card(x + 50, 320, 110, 64, { rx: 8, stroke: GRID, s }); tx(x + 50, 312, ty, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0 + i * 0.2) }); mono(x + 50, 338, v, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.1 + i * 0.2) }); });
        say(593, 270, '쓰레기값 없이 기본값으로 시작', fade(u, 0.9)); return; }
      // k2: 시작 주소 + i × 4바이트
      el('path', { d: `M${cx(0)},104 C${cx(0) + 60},70 ${cx(4) - 60},70 ${cx(4)},104`, fill: 'none', stroke: ACC, 'stroke-width': 2.4, pathLength: 100, 'stroke-dasharray': `${E(u, 0.3, 1.2) * 100} 100` });
      mono(cx(2), 52, 'a[4] = 시작 + 4 × 4바이트', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      say(600, 250, '칸을 세며 걸어가지 않고 한 번에 계산해 간다', fade(u, 1.5)); say(600, 280, '인덱스 접근 O(1)', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 3) { arr(320, 90, ['10', '0', '0', '0', '50'], { st: () => ({ op: 0.45 }) });
      varBox(80, 115, 'a', '•', { w: 70, stroke: ACC, color: ACC });
      const vals = ['1', '2', '3', '4', '5'];
      arr(320, 240, vals.map((v, i) => (u > 0.4 + i * 0.22 + 0.4 ? v : '')), { st: (i) => ({ s: pop(u, 0.2 + i * 0.1) }) });
      vals.forEach((v, i) => fly(250 + i * 30, 360, 356 + i * 80, 265, seg(u, 0.4 + i * 0.22, 0.8 + i * 0.22), v, { mono: true }));
      varBox(80, 265, 'b', '•', { w: 70, s: pop(u, 1.6), stroke: ACC, color: ACC }); refLine(150, 265, 316, 265, E(u, 1.7, 2.1), ACC);
      mono(700, 380, 'b.length → 5 (값 개수로 정해짐)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    // k4 · k5: 2차원 = 배열의 배열
    const sIn = k === 4 ? (i) => pop(u, 0.3 + i * 0.3) : () => 1;
    varBox(80, 200, 'grid', '•', { w: 70, stroke: ACC, color: ACC });
    arr(320, 110, ['•', '•'], { w: 64, h: 50, gap: 80, st: (i) => ({ s: sIn(i), stroke: k === 5 && i === 1 && u > 0.6 ? ACC : INK }), idx: false });
    mono(300, 140, '0', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); mono(444, 140, '1', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    refLine(150, 200, 316, 135, k === 4 ? E(u, 0.2, 0.6) : 1, ACC);
    const rows = [[0, 230], [1, 320]];
    rows.forEach(([r, y]) => { const hit = k === 5 && r === 1, set = hit && u > 1.6;
      arr(560, y - 25, ['0', '0', set ? '9' : '0'], { w: 64, h: 50, st: (i) => ({ s: k === 4 ? pop(u, 0.9 + r * 0.4 + i * 0.1) : 1, stroke: hit && i === 2 && u > 1.1 ? ACC : INK, fill: set && i === 2 ? ACCBG : PANEL }) });
      refLine(352 + r * 144, 160, 556, y, k === 4 ? E(u, 1.0 + r * 0.4, 1.4 + r * 0.4) : 1, hit && u > 0.6 ? ACC : MUT);
      tx(800, y + 5, 'int[3]', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: MUT, opacity: k === 4 ? fade(u, 1.2 + r * 0.4) : 1 }); });
    tx(320, 90, 'int[][] 바깥 배열 (참조 2칸)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    if (k === 4) { say(600, 395, 'grid[1] 자체가 하나의 배열 객체', fade(u, 2.0)); return; }
    mono(700, 70, 'grid[1][2] = 9', { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
    say(600, 395, '인덱스 두 번: 바깥에서 행을, 안쪽에서 칸을 찾는다', fade(u, 1.9)); }

  // ---------- 2. for 루프 순회 ----------
  const A = ['10', '20', '30', '40', '50'], AX = 120, AY = 150;
  function loopArr(o) { o = o || {}; const cx = arr(AX, AY, A, { st: o.st, idx: o.idx });
    if (o.ghost) card(AX + 5 * 80 + 36, AY + 25, 72, 50, { rx: 6, text: o.ghost, mono: true, fs: 16, stroke: o.ghostCol || GRID, color: o.ghostCol || MUT, dash: '5 4', op: o.ghostOp ?? 1 });
    if (o.ghost) mono(AX + 5 * 80 + 36, AY + 70, '5', { 'font-size': 14, fill: o.ghostCol || MUT, 'text-anchor': 'middle', opacity: o.ghostOp ?? 1 });
    return (i) => AX + i * 80 + 36; }
  function s2(t, c) { const { k, u } = c, P = (i) => AX + i * 80 + 36;
    if (k === 0) { loopArr({ st: (i) => ({ s: pop(u, 0.2 + i * 0.12) }) });
      el('path', { d: `M${P(0) - 30},232 V242 H${P(4) + 30} V232`, fill: 'none', stroke: GOOD, 'stroke-width': 2.4, opacity: fade(u, 1.1) });
      say((P(0) + P(4)) / 2, 268, '유효 인덱스 0 .. 4 = length-1', fade(u, 1.3), { fill: GOOD });
      note((P(0) + P(4)) / 2, 300, '원소가 5개면 마지막 인덱스는 4', fade(u, 1.8)); return; }
    if (k === 1) { loopArr({ st: () => ({ op: 0.5 }) });
      const parts = [['i = 0', '초기화'], ['i < a.length', '조건'], ['sum += a[i]', '본문'], ['i++', '증가']];
      parts.forEach(([s, n], i) => { const x = 150 + i * 200, y = 330; pill(x, y, s, i === 2 ? INK : ACC, pop(u, 0.2 + i * 0.3), { mono: true, fs: 14 });
        tx(x, y + 34, n, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.3) });
        if (i < 3) grow(x + 70, y, x + 130, y, E(u, 0.4 + i * 0.3, 0.6 + i * 0.3), MUT); });
      el('path', { d: 'M750,312 C750,270 350,270 350,312', fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4', 'marker-end': 'url(#ra-ah)', opacity: fade(u, 1.5) });
      varBox(760, 60, 'i', '0', { w: 90, s: pop(u, 1.6) }); varBox(760, 110, 'sum', '0', { w: 90, s: pop(u, 1.8) }); return; }
    if (k === 2) { const f = E(u, 0.2, 2.6) * 5, i = Math.min(4, Math.floor(f)), done = f >= 5, sums = [10, 30, 60, 100, 150], cur = Math.min(4, Math.floor(f - 0.001));
      loopArr({ st: (j) => ({ stroke: j === i && !done ? ACC : j < f ? GOOD : INK, fill: j === i && !done ? ACCBG : PANEL }) });
      ptr(P(i), AY + 76, ACC, 'i=' + i);
      if (!done) fly(P(i), AY + 25, 815, 110, (f % 1) * 1.6, A[i], { mono: true });
      varBox(760, 60, 'i', String(Math.min(5, Math.floor(f))), { w: 90 }); varBox(760, 110, 'sum', String(f < 0.6 ? 0 : sums[Math.max(0, Math.floor(f - 0.6))]), { w: 90, stroke: GOOD, color: GOOD }); return; }
    if (k === 3) { loopArr({ st: () => ({ stroke: GOOD }), ghost: '', ghostOp: fade(u, 0.3) }); ptr(P(5), AY + 76, MUT, 'i=5');
      varBox(760, 60, 'i', '5', { w: 90 }); varBox(760, 110, 'sum', '150', { w: 90, stroke: GOOD, color: GOOD, fill: GOODBG });
      mono(470, 330, '5 < 5  →  거짓', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      say(470, 368, '조건이 거짓이 되는 순간 반복이 끝난다', fade(u, 1.4)); return; }
    if (k === 4) { const p = E(u, 0.2, 1.4) * 5; loopArr({ ghost: 'a[5]?', ghostCol: BAD, ghostOp: fade(u, 1.2) }); ptr(P(Math.min(5, Math.floor(p))), AY + 76, p >= 5 ? BAD : ACC, 'i=' + Math.min(5, Math.floor(p)));
      cross(P(5), AY + 25, 16, pop(u, 1.5)); mono(470, 60, 'for (int i = 0; i <= a.length; i++)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.2) });
      say(470, 350, '<= 하나 때문에 배열 밖 칸까지 간다', fade(u, 1.8), { fill: BAD }); return; }
    // k5: for-each
    const f = E(u, 0.3, 2.4) * 5;
    loopArr({ idx: false, st: (j) => ({ stroke: j < f ? GOOD : INK }) });
    A.forEach((v, j) => fly(P(j), AY + 90, 470, 330, clamp(f - j) * 1.0, v, { mono: true }));
    varBox(430, 330, 'v', f > 0.9 ? A[Math.min(4, Math.floor(f - 0.9))] : '', { w: 90, stroke: GOOD });
    mono(470, 60, 'for (int v : a)', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
    say(760, 340, '인덱스가 없다', fade(u, 1.0), { fill: GOOD }); note(760, 368, '그래서 경계 실수도 없다', fade(u, 1.5)); }

  // ---------- 3. 경계 초과 ----------
  function s3(t, c) { const { k, u } = c, P = (i) => AX + i * 80 + 36, wall = AX + 5 * 80 - 4;
    el('rect', { x: AX - 10, y: AY - 16, width: 5 * 80 + 12, height: 82, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.5 });
    tx(AX - 6, AY - 24, '유효 범위 0..4', { 'font-size': 14, 'font-weight': 700, fill: GOOD });
    arr(AX, AY, A, { st: (i) => ({ stroke: k === 0 && i === 4 && u > 0.8 ? ACC : INK, fill: k === 0 && i === 4 && u > 0.8 ? ACCBG : PANEL }) });
    el('line', { x1: wall, y1: AY - 30, x2: wall, y2: AY + 90, stroke: BAD, 'stroke-width': 4 });
    if (k === 0) { ptr(P(lerp(0, 4, E(u, 0.2, 0.8))), AY + 76, ACC, 'a[4]'); pill(P(4), 320, '=> 50', GOOD, pop(u, 1.2), { mono: true, fs: 16 }); say(470, 380, '마지막 칸은 length-1 = 4', fade(u, 1.6)); return; }
    if (k === 1) { const p = E(u, 0.2, 1.0); ptr(lerp(P(4), P(5), p), AY + 76, p > 0.6 ? BAD : ACC, 'a[5]');
      cross(wall, AY + 25, 18, pop(u, 1.0)); say(720, 300, '실행 중에 JVM이 막는다', fade(u, 1.3), { fill: BAD }); note(720, 330, '컴파일은 통과했다', fade(u, 1.7)); return; }
    if (k === 2) { ptr(P(5), AY + 76, BAD, 'a[5]');
      terminal(60, 270, 840, 130, ['Exception in thread "main"', ['java.lang.ArrayIndexOutOfBoundsException:', '#fca5a5'], ['Index 5 out of bounds for length 5', '#fca5a5']], 0.5 + E(u, 0.2, 1.4) * 2.5, { fs: 15, lh: 26 });
      if (u > 1.6) { el('rect', { x: 72, y: 349, width: 72, height: 26, rx: 4, fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); el('rect', { x: 306, y: 349, width: 80, height: 26, rx: 4, fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); }
      tx(620, 380, '어떤 인덱스로, 얼마짜리 배열에', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) }); return; }
    // k3 · k4: 가드
    const gx = 400, gy = 320;
    diamond(gx, gy, 'i >= 0 && i < a.length', { w: 300, h: 70, s: k === 3 ? pop(u, 0.2) : 1 });
    varBox(80, gy, 'i', '5', { w: 70 });
    if (k === 3) { dot([[190, gy], [gx - 150, gy]], seg(u, 0.6, 1.1), INK, 8);
      mono(gx, gy + 56, '5 >= 0 ✓    5 < 5 ✗', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      grow(gx + 150, gy, gx + 260, gy, E(u, 1.6, 2.0), BAD); pill(gx + 360, gy, 'else 로', BAD, pop(u, 2.0), { fs: 15 }); return; }
    grow(gx, gy - 35, P(2), AY + 64, E(u, 0.3, 0.8), GOOD); tx(gx + 20, 255, '범위 안 → a[i] 출력', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) });
    grow(gx + 150, gy, gx + 230, gy, E(u, 1.0, 1.3), BAD);
    terminal(gx + 240, gy - 35, 280, 70, [['범위 밖 인덱스: 5', 'var(--term)']], E(u, 1.3, 2.0), { fs: 15 });
    dot([[190, gy], [gx - 150, gy], [gx + 150, gy], [gx + 235, gy]], seg(u, 0.8, 1.6), INK, 8); }

  // ---------- 4. 조건 분기 ----------
  function token(x, y, s, sc, col) { card(x, y, tw(s, 16) + 30, 38, { rx: 19, text: s, mono: true, fs: 16, fw: 800, fill: col || ACC, stroke: 'none', color: PANEL, s: sc }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { token(480, 180, 'day = 3', pop(u, 0.3)); ['if / else', 'switch', '삼항 ? :'].forEach((s, i) => { grow(480, 205, 220 + i * 260, 300, E(u, 0.9 + i * 0.2, 1.4 + i * 0.2), MUT); pill(220 + i * 260, 320, s, INK, pop(u, 1.4 + i * 0.2), { fs: 15 }); }); return; }
    if (k === 1) { const p = E(u, 0.3, 2.0);
      diamond(300, 110, 'day >= 6', { s: pop(u, 0.1) }); diamond(300, 250, 'day == 3', { s: pop(u, 0.3) });
      grow(300, 142, 300, 216, 1, MUT); tx(312, 185, '거짓', { 'font-size': 14, fill: MUT });
      grow(400, 110, 520, 110, 1, OFF); card(590, 110, 110, 42, { rx: 8, text: '"주말"', mono: true, fs: 15, stroke: GRID, color: MUT });
      grow(400, 250, 520, 250, E(u, 1.6, 1.9), GOOD); tx(460, 240, '참', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      card(590, 250, 110, 42, { rx: 8, text: '"수요일"', mono: true, fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 1.9) });
      grow(300, 282, 300, 350, 1, OFF); card(300, 372, 110, 40, { rx: 8, text: '"평일"', mono: true, fs: 15, stroke: GRID, color: MUT });
      token(lerp(90, 160, Math.min(1, p * 2)), p < 0.5 ? 110 : lerp(110, 250, (p - 0.5) * 2), '3', 1);
      note(800, 180, '위에서부터 차례로 검사', fade(u, 0.6)); return; }
    if (k <= 3) { const rows = [['case 6, 7', '"주말"'], ['case 3', '"수요일"'], ['default', '"평일"']];
      mono(140, 60, 'String name = switch (day) {', { 'font-size': 16, 'font-weight': 700 });
      rows.forEach(([a, b], i) => { const y = 120 + i * 70, hit = k === 3 && i === 1 && u > 1.0, s = k === 2 ? pop(u, 0.3 + i * 0.3) : 1;
        card(300, y, 220, 50, { rx: 8, text: a, mono: true, fs: 16, fw: 700, stroke: hit ? GOOD : INK, color: hit ? GOOD : INK, fill: hit ? GOODBG : PANEL, s });
        grow(414, y, 480, y, k === 2 ? E(u, 0.5 + i * 0.3, 0.8 + i * 0.3) : 1, hit ? GOOD : MUT); mono(495, y + 6, b, { 'font-size': 16, 'font-weight': 700, fill: hit ? GOOD : INK, opacity: k === 2 ? fade(u, 0.6 + i * 0.3) : 1 }); });
      if (k === 2) { note(780, 190, 'case 뒤 -> 는 값 하나를 돌려준다', fade(u, 1.5)); note(780, 220, 'break가 필요 없다', fade(u, 1.8)); return; }
      const p = E(u, 0.2, 1.0); token(lerp(80, 150, p), lerp(60, 190, p), '3', 1);
      fly(560, 190, 790, 300, seg(u, 1.3, 2.0), '"수요일"', { mono: true, fill: GOOD, stay: true });
      mono(700, 260, 'name', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) });
      note(790, 360, '맞는 갈래 하나만 실행된다', fade(u, 2.1)); return; }
    if (k <= 5) { // 전통 switch: case 2 에 break 없음
      const blk = [['case 2:', 'println("화");', false], ['case 3:', 'println("수");', true]];
      blk.forEach(([a, b, brk], i) => { const y = 90 + i * 130, run = k === 5 && u > 0.9 + i * 0.7;
        card(290, y + 30, 340, 110, { rx: 10, stroke: run ? ACC : INK, fill: run ? ACCBG : PANEL });
        mono(140, y + 8, a, { 'font-size': 16, 'font-weight': 800 }); mono(160, y + 38, b, { 'font-size': 16 });
        if (brk) mono(160, y + 66, 'break;', { 'font-size': 16, 'font-weight': 800, fill: GOOD });
        else { el('rect', { x: 150, y: y + 50, width: 120, height: 26, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: k === 4 ? fade(u, 0.6) : 1 });
          tx(285, y + 68, 'break 없음', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: k === 4 ? fade(u, 0.8) : 1 }); } });
      if (k === 4) { note(700, 180, '문법 오류가 아니다', fade(u, 1.3)); note(700, 210, '컴파일러가 막아 주지 않는다', fade(u, 1.7)); return; }
      token(lerp(560, 520, E(u, 0.2, 0.6)), lerp(40, 60, E(u, 0.2, 0.6)), 'day = 2 라면', 1, WARN);
      dot([[120, 110], [120, 250], [120, 300], [120, 390]], seg(u, 0.6, 2.4), ACC, 8);
      terminal(640, 150, 280, 130, ['$ java Main', '화', '수'], E(u, 0.8, 1.9) * 2 + 0.6, { fs: 15 });
      say(780, 320, '"화" 다음 "수"까지 흘러내린다', fade(u, 2.0), { fill: BAD }); return; }
    // k6: 삼항
    mono(480, 70, 'String type = (day >= 6) ? "휴일" : "근무일";', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
    diamond(300, 220, 'day >= 6', { s: pop(u, 0.2) }); token(130, 220, '3', 1);
    grow(400, 220, 560, 150, 1, OFF); card(640, 150, 130, 44, { rx: 8, text: '"휴일"', mono: true, fs: 16, stroke: GRID, color: MUT });
    grow(400, 220, 560, 290, E(u, 0.9, 1.4), GOOD); card(640, 290, 130, 44, { rx: 8, text: '"근무일"', mono: true, fs: 16, stroke: GOOD, color: GOOD, s: pop(u, 1.4) });
    tx(470, 280, '거짓', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.0) });
    note(480, 380, '값 하나를 고를 때만, 중첩은 피한다', fade(u, 1.9)); }

  // ---------- 5. 반복문 4형제 ----------
  const TABS = ['for', 'while', 'do-while', 'for-each'];
  function tabs(on) { TABS.forEach((s, i) => card(150 + i * 220, 40, 180, 40, { rx: 20, text: s, mono: true, fs: 16, fw: 800, stroke: i === on ? ACC : GRID, color: i === on ? PANEL : MUT, fill: i === on ? ACC : PANEL })); }
  function s5(t, c) { const { k, u } = c, P = (i) => AX + i * 80 + 36;
    tabs(Math.min(k, 3));
    if (k === 0) { const f = E(u, 0.3, 2.4) * 4.99, i = Math.floor(f); arr(AX, 150, A, { st: (j) => ({ stroke: j === i ? ACC : INK, fill: j === i ? ACCBG : PANEL }) }); ptr(P(i), 226, ACC, 'i=' + i);
      say(760, 175, '인덱스로 횟수를 센다', fade(u, 0.5)); note(760, 205, '어느 칸인지 i가 안다', fade(u, 1.0)); return; }
    if (k === 1) { const n = Math.min(5, Math.floor(E(u, 0.3, 2.4) * 6));
      diamond(300, 200, 'i < a.length', { w: 220 }); card(300, 330, 140, 46, { rx: 8, text: 'i++', mono: true, fs: 16 });
      grow(300, 232, 300, 306, 1, MUT); el('path', { d: 'M230,330 C140,330 140,200 188,200', fill: 'none', stroke: MUT, 'stroke-width': 2, 'marker-end': 'url(#ra-ah)' });
      grow(410, 200, 520, 200, n >= 5 ? 1 : 0, GOOD); tx(540, 205, '거짓이면 끝', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: n >= 5 ? 1 : 0 });
      dot([[300, 168], [300, 232], [300, 330], [190, 300], [190, 210]], (t * 1.6) % 1, ACC, 7);
      varBox(720, 300, 'i', String(n), { w: 80 }); note(720, 120, '먼저 조건을 본다', fade(u, 0.5)); note(720, 150, '처음부터 거짓이면 0번', fade(u, 1.0)); return; }
    if (k === 2) { card(300, 160, 260, 50, { rx: 8, text: 'println("최소 한 번은 출력")', mono: true, fs: 14, stroke: ACC, s: pop(u, 0.2) });
      diamond(300, 290, 'n > 0', { s: pop(u, 0.9) }); grow(300, 186, 300, 256, E(u, 0.9, 1.2), MUT);
      dot([[300, 110], [300, 160], [300, 290]], seg(u, 0.2, 1.4), ACC, 8);
      grow(400, 290, 520, 290, E(u, 1.6, 1.9), GOOD); tx(540, 295, '0 > 0 거짓 → 끝', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      terminal(620, 120, 300, 90, ['최소 한 번은 출력'], E(u, 0.6, 1.2), { fs: 14 }); varBox(680, 260, 'n', '0', { w: 70 });
      note(480, 390, '본문 먼저, 조건은 뒤에서', fade(u, 2.1)); return; }
    if (k === 3) { const f = E(u, 0.3, 2.4) * 5; arr(AX, 150, A, { idx: false, st: (j) => ({ stroke: j < f ? GOOD : INK }) });
      A.forEach((v, j) => fly(P(j), 240, 470, 330, clamp(f - j), v, { mono: true }));
      say(760, 175, '원소만 꺼낸다', fade(u, 0.5), { fill: GOOD }); note(760, 205, '칸 값을 바꾸지는 못한다', fade(u, 1.0)); return; }
    if (k === 4) { const f = E(u, 0.2, 2.4) * 5, outs = [];
      arr(AX, 150, A, { st: (j) => ({ stroke: j === 2 && f > 2 ? WARN : j === 4 && f > 4 ? BAD : j < f ? GOOD : INK, fill: j === 2 && f > 2 ? WARNBG : j === 4 && f > 4 ? BADBG : PANEL }) });
      if (f > 2.2) tx(P(2), 135, 'continue', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: WARN, 'text-anchor': 'middle' });
      if (f > 4.2) tx(P(4), 135, 'break', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: BAD, 'text-anchor': 'middle' });
      [0, 1, 3].forEach((j) => { if (f > j + 0.6) outs.push(A[j]); });
      ptr(P(Math.min(4, Math.floor(f))), 226, ACC);
      terminal(560, 280, 260, 110, outs.length ? outs : [''], outs.length, { fs: 15, lh: 22 });
      mono(300, 330, '출력: ' + outs.join(', '), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); return; }
    // k5: 라벨로 바깥까지 탈출
    const order = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], f = E(u, 0.2, 2.2) * 6, gx = 160, gy = 150;
    for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) { const n = order.findIndex(([a, b]) => a === r && b === q), seen = n >= 0 && f > n, stop = r === 1 && q === 2 && f > 5;
      card(gx + q * 90, gy + r * 80, 76, 64, { rx: 8, text: `${r}+${q}`, mono: true, fs: 15, stroke: stop ? BAD : seen ? GOOD : GRID, color: stop ? BAD : seen ? INK : MUT, fill: stop ? BADBG : seen ? GOODBG : PANEL }); }
    tx(gx - 40, gy - 50, 'r (행) ↓   c (열) →', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    mono(620, 140, 'outer:', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    mono(620, 170, 'for r … for c …', { 'font-size': 16 });
    mono(620, 200, 'if (r + c == 3) break outer;', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: f > 5 ? 1 : 0.4 });
    if (f > 5.2) { say(700, 280, 'r=1, c=2 에서 두 반복을 한 번에 빠져나온다', 1, { fill: BAD }); note(700, 310, '세 번째 행은 아예 돌지 않는다', fade(u, 2.3)); } }

  // ---------- 6. Arrays 유틸 · ArrayList ----------
  function s6(t, c) { const { k, u } = c;
    if (k <= 1) { const sorted = k === 1 ? E(u, 1.1, 1.9) : 0, vals = [30, 10, 20], dest = [2, 0, 1];
      vals.forEach((v, i) => { const x = lerp(140 + i * 90, 140 + dest[i] * 90, sorted); card(x, 120, 76, 54, { rx: 6, text: String(v), mono: true, fs: 18, fw: 800, stroke: sorted > 0.99 ? GOOD : INK, s: k === 0 ? pop(u, 0.2 + i * 0.1) : 1 }); });
      mono(80, 60, 'int[] a', { 'font-size': 16, 'font-weight': 800 });
      if (k === 0) { mono(490, 125, 'println(a)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.6) }); grow(590, 120, 640, 120, E(u, 0.8, 1.1), MUT);
        terminal(650, 90, 270, 64, [['[I@1b6d3586', 'var(--term)']], E(u, 1.0, 1.6), { fs: 15 });
        note(785, 190, '예시 · 해시는 실행마다 다르다', fade(u, 1.6)); say(480, 290, '[I = int 배열이라는 뜻, 뒤는 해시', fade(u, 2.0)); say(480, 320, '내용은 보이지 않는다', fade(u, 2.2), { 'font-weight': 400, fill: MUT }); return; }
      terminal(480, 190, 440, 120, ['Arrays.toString(a) => [30, 10, 20]', 'Arrays.sort(a)', 'Arrays.toString(a) => [10, 20, 30]'], 0.5 + E(u, 0.2, 2.2) * 2.5, { fs: 14 });
      say(230, 220, '제자리 정렬 · 새 배열을 만들지 않는다', fade(u, 2.0), { fill: GOOD }); return; }
    if (k === 2) { [10, 20, 30].forEach((v, i) => card(140 + i * 90, 120, 76, 54, { rx: 6, text: String(v), mono: true, fs: 18, fw: 800 }));
      el('line', { x1: 366, y1: 84, x2: 366, y2: 156, stroke: BAD, 'stroke-width': 4 });
      const p = E(u, 0.2, 0.8); card(lerp(540, 412, p), 120, 60, 44, { rx: 6, text: '40', mono: true, fs: 17, fw: 800, stroke: BAD, color: BAD }); cross(366, 66, 11, pop(u, 0.8));
      say(230, 200, '크기 3 고정 · 칸을 늘릴 수 없다', fade(u, 0.9), { fill: BAD });
      card(640, 300, 380, 70, { rx: 12, text: 'List<Integer> list = new ArrayList<>();', mono: true, fs: 14, stroke: ACC, color: ACC, s: pop(u, 1.5) });
      say(640, 365, '크기가 변하는 데이터는 List로', fade(u, 2.0)); return; }
    // k3 · k4: ArrayList 속 배열
    const n = k === 3 ? Math.min(3, Math.floor(E(u, 0.3, 2.1) * 3.99)) : 3;
    card(220, 120, 300, 110, { rx: 12, stroke: ACC, sw: 2.4 });
    tx(90, 92, 'ArrayList', { 'font-size': 16, 'font-weight': 800, fill: ACC }); mono(90, 130, 'size = ' + n, { 'font-size': 16, 'font-weight': 700 }); mono(90, 158, 'elementData →', { 'font-size': 15, fill: MUT });
    const cap = 10; for (let i = 0; i < cap; i++) card(410 + i * 52, 150, 46, 46, { rx: 5, text: i < n ? (k === 3 ? ['10', '20', '30'][i] : '•') : '', mono: true, fs: 15, fw: 700, stroke: i < n ? ACC : GRID, fill: i < n ? ACCBG : PANEL });
    tx(410 - 23, 112, '내부 배열 (OpenJDK: 첫 add 때 칸 10개)', { 'font-size': 14, 'font-weight': 600, fill: MUT });
    if (k === 3) { ['add(10)', 'add(20)', 'add(30)'].forEach((s, i) => fly(420, 330, 410 + i * 52, 150, seg(u, 0.3 + i * 0.6, 0.8 + i * 0.6), s, { mono: true }));
      say(480, 260, '꽉 차면 더 큰 배열을 만들어 옮겨 담는다', fade(u, 2.0)); note(480, 290, 'OpenJDK는 1.5배로 늘린다', fade(u, 2.3)); return; }
    [10, 20, 30].forEach((v, i) => { const x = 410 + i * 52; card(x + 30 + i * 70, 290, 92, 44, { rx: 6, text: 'Integer ' + v, fs: 13.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.3 + i * 0.2) }); grow(x, 172, x + 30 + i * 70, 268, E(u, 0.4 + i * 0.2, 0.8 + i * 0.2), INFO); });
    mono(90, 240, 'list.size() → 3', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
    mono(90, 270, 'println(list)', { 'font-size': 15, opacity: fade(u, 1.5) }); mono(90, 296, '=> [10, 20, 30]', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) });
    note(480, 380, '배열은 length(필드), List는 size()(메서드) · 원소는 Integer 객체', fade(u, 2.1)); }
  function s6b(t, c) { const { k, u } = c; if (k !== 5) return s6(t, c);
    tx(80, 60, 'b = a', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: BAD }); tx(560, 60, 'b = a.clone()', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: GOOD, opacity: fade(u, 1.2) });
    varBox(100, 120, 'a', '•', { w: 60, stroke: ACC, color: ACC }); varBox(100, 200, 'b', '•', { w: 60, stroke: BAD, color: BAD, s: pop(u, 0.3) });
    arr(260, 140, ['10', '20', '30'], { w: 54, idx: false }); refLine(160, 120, 256, 160, 1, ACC); refLine(160, 200, 256, 172, E(u, 0.4, 0.9), BAD);
    say(300, 260, '배열은 하나, 화살표가 둘', fade(u, 0.9), { fill: BAD });
    varBox(580, 120, 'a', '•', { w: 60, stroke: ACC, color: ACC, s: fade(u, 1.2) }); varBox(580, 260, 'b', '•', { w: 60, stroke: GOOD, color: GOOD, s: pop(u, 1.4) });
    arr(740, 100, ['10', '20', '30'], { w: 54, idx: false, st: () => ({ op: fade(u, 1.2) }) }); arr(740, 240, ['10', '20', '30'], { w: 54, idx: false, st: (i) => ({ s: pop(u, 1.6 + i * 0.1), stroke: GOOD }) });
    refLine(640, 120, 736, 125, fade(u, 1.2) >= 1 ? 1 : 0, ACC); refLine(640, 260, 736, 265, E(u, 1.9, 2.3), GOOD);
    say(800, 350, '독립된 새 배열', fade(u, 2.2), { fill: GOOD }); }

  const quiz = [
    { q: 'int[] a = new int[5]; 직후 a[3]의 값은 무엇인가?',
      o: ['0', '알 수 없는 쓰레기값', 'null'], a: 0,
      why: '배열 칸은 만들어지는 순간 타입별 기본값으로 채워진다. int는 0, boolean은 false, 참조형은 null이다.' },
    { q: 'int[] a = {10, 20, 30, 40, 50}을 i < a.length로 순회한 뒤 i의 값은 무엇인가?',
      o: ['4', '5', '6'], a: 1,
      why: 'i가 5가 되면 5 < 5가 거짓이라 반복이 끝난다. 그래서 끝난 뒤의 i는 length와 같고, 이 값으로 접근하면 배열 밖이다.' },
    { q: 'length가 5인 배열에서 a[5]에 접근하면 언제 문제가 드러나는가?',
      o: ['컴파일할 때', '실행 중 ArrayIndexOutOfBoundsException으로', '프로그램이 끝날 때 경고로'], a: 1,
      why: '컴파일은 통과한다. 실행 중 JVM이 범위를 검사하고 Index 5 out of bounds for length 5 예외를 던진다.' },
    { q: '전통 switch에서 case 2에 break가 없을 때 day가 2이면 무엇이 출력되는가?',
      o: ['화', '수', '화 다음 수'], a: 2,
      why: 'break가 없으면 아래 case로 흘러내린다(fall-through). 화살표 switch식에는 이 동작이 없다.' },
    { q: 'for-each로 {10, 20, 30, 40, 50}을 돌며 30에서 continue, 50에서 break하면 출력은 무엇인가?',
      o: ['10, 20, 40', '10, 20', '10, 20, 40, 50'], a: 0,
      why: 'continue는 30 회차만 건너뛰고, break는 50에서 반복을 끝낸다. 그래서 10, 20, 40이 찍힌다.' },
    { q: 'int[] b = a; 뒤에 b[0]을 바꾸면 a[0]은 어떻게 되는가?',
      o: ['그대로다', '컴파일 에러다', '같이 바뀐다'], a: 2,
      why: 'b = a는 같은 배열을 가리키게 할 뿐이다. 독립된 복사본은 a.clone()이나 Arrays.copyOf로 만든다.' },
  ];

  const summary = [
    'new int[5]는 힙에 이어진 5칸을 만들고 0으로 채우며, 크기는 그 뒤 바꿀 수 없다.',
    '유효 인덱스는 0부터 length-1까지라 a[5]는 실행 중 ArrayIndexOutOfBoundsException이 된다.',
    '전통 switch는 break가 없으면 아래 case로 흘러내리고, 화살표 switch식은 그렇지 않다.',
    '인덱스가 필요 없으면 for-each를 쓰고, 크기가 변하는 데이터는 ArrayList에 담는다.',
  ];
  const review = [
    { q: '합계를 구하는 루프가 가끔 마지막 줄에서 예외로 멈춘다. 조건이 i <= list.length이다. 먼저 할 일은?',
      o: ['배열 크기를 하나 늘린다', '조건을 i < length로 바꾸거나 for-each로 바꾼다', 'try-catch로 예외를 삼킨다'], a: 1,
      why: '마지막 유효 인덱스는 length-1이다. <=는 한 칸 밖까지 가므로 조건을 고치거나 인덱스가 없는 for-each를 쓴다.' },
    { q: '요일별 처리 코드에서 화요일에 수요일 작업까지 실행된다. 의심할 곳은?',
      o: ['전통 switch의 case에 빠진 break', '삼항 연산자의 우선순위', 'day 변수의 타입'], a: 0,
      why: 'break가 없으면 다음 case로 흘러내린다. 화살표 switch식으로 바꾸면 이 실수가 생기지 않는다.' },
    { q: '사용자가 입력한 항목을 계속 추가해야 한다. 어떤 자료구조가 맞나?',
      o: ['넉넉한 크기의 int 배열', '항목마다 새 배열을 손으로 복사', 'ArrayList'], a: 2,
      why: '배열은 크기가 고정이다. ArrayList는 내부 배열이 차면 더 큰 배열로 옮겨 담아 주므로 add만 하면 된다.' },
  ];

  R.page({ title: '배열과 제어문', scenes: [s1, s2, s3, s4, s5, s6b], quiz, summary, review });
})();
