/* I-1-2 컬렉션 내부 동작 — 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, hbar, lock, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  function tag(x, y, name, o) { o = o || {}; const col = o.col || ACC, w = Math.max(58, tw(name, 16) + 36), g = R.G(x, y, o.s ?? 1, o.op);
    el('path', { d: `M${-w / 2 + 14},-17 H${w / 2} V17 H${-w / 2 + 14} L${-w / 2},0 Z`, fill: o.fill || ACCBG, stroke: col, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('circle', { cx: -w / 2 + 13, cy: 0, r: 3.5, fill: PANEL, stroke: col, 'stroke-width': 1.6 }, g);
    mono(7, 6, name, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g);
    return { x0: x - w / 2, x1: x + w / 2, y }; }
  // 포인터 칸 한 줄: n 칸 중 앞 m 칸에 포인터(점). 돌려주는 cx(i) 로 칸 가운데
  function slots(x, y, n, m, o) { o = o || {}; const w = o.w || 50, gap = o.gap ?? 4, cx = (i) => x + i * (w + gap) + w / 2;
    for (let i = 0; i < n; i++) { const full = i < m, st = o.style ? o.style(i) : {}; if ((st.s ?? 1) <= 0) continue;
      card(cx(i), y + 21, w, 42, { rx: 5, stroke: st.stroke || (full ? INK : OFF), dash: full ? null : '5 4', fill: st.fill, sw: st.sw || 2, s: st.s });
      if (full) el('circle', { cx: cx(i), cy: y + 21, r: 4.5, fill: st.stroke || INK }); }
    return cx; }
  // 값 객체(작은 원)
  const vball = (cx, cy, v, o) => { o = o || {}; card(cx, cy, Math.max(44, tw(String(v), 15) + 18), 36, { rx: 18, text: String(v), fs: 15, mono: true, stroke: o.col || INK, color: o.col || INK, fill: o.fill, s: o.s, op: o.op, sw: o.sw }); };
  const link = (x1, y1, x2, y2, u, col) => grow(x1, y1, x2, y2, u, col || MUT, { sw: 1.8 });
  // 해시 테이블 칸 (세로): rows 개수 n, 칸마다 내용 f(i)
  function table(x, y, n, f, o) { o = o || {}; const h = o.h || 36, w = o.w || 150;
    for (let i = 0; i < n; i++) { const r = f(i) || {}; const yy = y + i * (h + 3);
      el('rect', { x, y: yy, width: w, height: h, rx: 5, fill: r.fill || PANEL, stroke: r.stroke || GRID, 'stroke-width': r.sw || 1.5 });
      mono(x - 10, yy + h / 2 + 5, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      if (r.text && (r.op ?? 1) > 0) mono(x + 12, yy + h / 2 + 5, r.text, { 'font-size': 15, 'font-weight': 700, fill: r.color || INK, opacity: r.op ?? 1 }); }
    return (i) => y + i * (h + 3) + h / 2; }

  // =========================================================
  // 1. list — 포인터 칸이 연속으로 놓인 동적 배열
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const V = [10, 20, 30, 40], cx = slots(120, 120, 4, 4, { w: 70, style: (i) => ({ stroke: i === 2 && u > 1.5 ? ACC : INK, sw: i === 2 && u > 1.5 ? 3 : 2 }) });
      mono(120, 330, 'nums · 포인터 4칸 (칸마다 8바이트)', { 'font-size': 14, fill: MUT });
      V.forEach((v, i) => { mono(cx(i), 190, '+' + i * 8, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); link(cx(i), 146, cx(i), 252, 1, i === 2 && u > 1.5 ? ACC : GRID); vball(cx(i), 270, v, { col: i === 2 && u > 1.5 ? ACC : INK, fill: i === 2 && u > 1.5 ? ACCBG : null }); });
      const a = cx(0) - 35, b = cx(2); el('path', { d: `M${a},116 Q${(a + b) / 2},${40} ${lerp(a, b, E(u, 0.4, 1.4))},${lerp(116, 112, E(u, 0.4, 1.4))}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: u > 0.4 ? 1 : 0 });
      mono(470, 80, '시작 주소 + 2 × 8바이트', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      mono(470, 112, 'nums[2]  →  30', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.6) });
      card(740, 270, 260, 60, { rx: 12, text: '계산 한 번 · O(1)\n원소가 백만 개여도 같다', fs: 15, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 2.1) }); return; }
    if (k === 1) { const n = u < 0.4 ? 0 : Math.min(4, 1 + Math.floor((u - 0.4) / 0.45)), cx = slots(120, 120, 4, n, { w: 70, style: (i) => ({ s: u > 0.4 ? 1 : 0, stroke: i < n ? ACC : OFF }) });
      mono(120, 100, 'lst  용량 4칸 (첫 append 때 확보)', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) });
      for (let i = 0; i < n; i++) { link(cx(i), 146, cx(i), 252, 1, GRID); vball(cx(i), 270, i, { s: pop(u, 0.4 + i * 0.45) }); }
      card(660, 140, 230, 80, { rx: 12, stroke: INK }); tx(560, 128, 'sys.getsizeof(lst)', { 'font-size': 14, fill: MUT });
      mono(660, 172, u < 0.4 ? '56' : '88', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: u < 0.4 ? MUT : ACC });
      ['0 88', '1 88', '2 88', '3 88'].forEach((s, i) => mono(560 + i * 66, 250, s, { 'font-size': 14, fill: INK, opacity: fade(u, 0.5 + i * 0.45) }));
      sub(660, 300, '네 번 넣는 동안 크기가 그대로다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 385, '5번째 append 에서 8칸으로 옮긴다 (88 → 120바이트)', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 2) { const moving = (i) => E(u, 0.9 + (3 - i) * 0.3, 1.2 + (3 - i) * 0.3), V = [10, 20, 30, 40];
      const cx = slots(120, 120, 8, 0, { w: 70, gap: 6, style: () => ({ s: fade(u, 0.1) }) });
      mono(120, 100, '용량이 꽉 차서 8칸짜리로 옮긴 뒤 민다', { 'font-size': 14, fill: MUT });
      V.forEach((v, i) => { const x = lerp(cx(i), cx(i + 1), moving(i)); card(x, 141, 70, 42, { rx: 5, text: String(v), fs: 16, mono: true, stroke: moving(i) > 0 && moving(i) < 1 ? WARN : INK });
        if (moving(i) > 0 && moving(i) < 1) grow(x + 30, 100, x + 60, 100, 1, WARN); });
      if (u > 2.1) card(cx(0), 141, 70, 42, { rx: 5, text: '5', fs: 16, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 2.1) });
      mono(120, 230, 'nums.insert(0, 5)', { 'font-size': 17, 'font-weight': 700 });
      mono(120, 270, '원소 4개가 한 칸씩 이동  →  O(n)', { 'font-size': 16, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(120, 330, '[5, 10, 20, 30, 40]', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) });
      mono(560, 330, 'getsizeof 88 → 120', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4) }); return; }
    // k3, k4: deque — 블록 양끝에 바로 붙이고 뗀다
    const blk = (x, vals, o) => { o = o || {}; el('rect', { x, y: 110, width: 300, height: 70, rx: 10, fill: SOFT, stroke: INK, 'stroke-width': 2 }); vals.forEach((v, i) => { if (v == null) return; card(x + 38 + i * 56, 145, 46, 46, { rx: 6, text: String(v), fs: 16, mono: true, stroke: o.hi === i ? ACC : INK, fill: o.hi === i ? ACCBG : null, s: o.s ? o.s(i) : 1 }); }); };
    if (k === 3) { tx(80, 80, 'deque: 칸 묶음(블록)을 양쪽으로 이어 붙인 구조', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
      blk(330, [null, 0, 1, 2, 3], { hi: 1, s: (i) => (i === 1 ? pop(u, 1.0) : 1) });
      fly(150, 145, 404, 145, seg(u, 0.3, 1.0), 'appendleft(0)', { mono: true });
      mono(480, 240, '다른 원소는 그대로 · O(1)', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      el('line', { x1: 330, y1: 280, x2: 630, y2: 280, stroke: GRID, 'stroke-width': 2 }); grow(630, 280, 690, 280, E(u, 1.8, 2.2), MUT); grow(330, 280, 270, 280, E(u, 1.8, 2.2), MUT);
      sub(480, 310, '왼쪽 끝 · 오른쪽 끝 모두 O(1)', fade(u, 2.2)); return; }
    tx(80, 64, 'popleft() 뒤', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
    blk(80, [null, u < 0.8 ? 0 : null, 1, 2, 3]); if (u >= 0.2 && u < 1.2) fly(154, 145, 154, 60, seg(u, 0.2, 1.2), '0', { mono: true, fill: OFF, color: INK });
    mono(420, 152, 'deque([1, 2, 3])', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
    tx(80, 250, '앞에서 100,000번 빼기 (이 PC, Python 3.12 측정)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
    [['list.pop(0)', 528.2, BAD], ['deque.popleft()', 3.8, GOOD]].forEach(([n, v, col], i) => { const y = 280 + i * 56;
      mono(80, y + 14, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.3 + i * 0.3) });
      hbar(260, y, 520, v, 528.2, { col, h: 20, u: E(u, 1.4 + i * 0.3, 2.2 + i * 0.3), text: v.toFixed(1) + 'ms', label: u > 1.6 + i * 0.3 }); }); }

  // =========================================================
  // 2. tuple — 못 바꾸니 해시를 낼 수 있다
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    const tup = (x, y, vals, o) => { o = o || {}; const n = vals.length, W = n * 96 + 20; el('rect', { x, y, width: W, height: 70, rx: 12, fill: o.fill || INFOBG, stroke: INFO, 'stroke-width': 2.2 });
      vals.forEach((v, i) => card(x + 58 + i * 96, y + 35, 86, 46, { rx: 6, text: String(v), fs: 17, mono: true, stroke: INK, s: o.s ? o.s(i) : 1 })); lock(x + W + 4, y + 2, true, INFO, o.ls ?? 1); return { x1: x + W, cx: (i) => x + 58 + i * 96 }; };
    if (k === 0) { mono(80, 80, 'point = (37.5, 127.0)', { 'font-size': 17, 'font-weight': 700 });
      const p = tup(80, 110, ['37.5', '127.0'], { s: (i) => pop(u, 0.2 + i * 0.2) });
      if (u < 1.2) fly(500, 60, p.cx(0), 145, seg(u, 0.5, 1.2), '0', { mono: true, fill: BAD }); else fly(p.cx(0), 145, 420, 60, seg(u, 1.2, 1.7), '0', { mono: true, fill: BAD });
      if (u > 1.2) cross(p.cx(0), 145, 16, pop(u, 1.2));
      mono(80, 250, 'point[0] = 0', { 'font-size': 16, opacity: fade(u, 1.3) });
      mono(80, 284, "TypeError: 'tuple' object does not support item assignment", { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) });
      sub(480, 360, '"이 묶음은 바뀌지 않는다"를 문법으로 못 박는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const p = tup(60, 70, ['37.5', '127.0']);
      grow(p.x1 + 30, 105, 420, 105, E(u, 0.3, 0.8), INFO); mono(430, 98, 'hash(…)', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(430, 124, '% 8 = 3', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(620, 54, 'cache (dict) 의 칸', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const Y = table(620, 70, 8, (i) => (i === 3 ? { text: '(37.5, 127.0) → "서울"', op: fade(u, 1.4), stroke: u > 1.3 ? ACC : GRID, fill: u > 1.3 ? ACCBG : PANEL, color: ACC } : {}), { w: 280, h: 34 });
      dot([[520, 112], [600, Y(3)]], seg(u, 1.0, 1.4), INFO, 6);
      mono(60, 260, 'cache[(37.5, 127.0)]', { 'font-size': 16, opacity: fade(u, 1.8) }); mono(60, 294, '→ 서울', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
      sub(300, 360, '안 바뀌니 해시값도 안 바뀐다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { tx(560, 54, 'seen (set) 의 칸 · 8칸 기준', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const Y = table(560, 70, 8, (i) => (i === 7 ? { text: '(0, 0)', op: fade(u, 0.5) } : i === 2 ? { text: '(1, 1)', op: fade(u, 0.8), stroke: u > 1.4 ? ACC : GRID, fill: u > 1.4 ? ACCBG : PANEL } : {}), { w: 200, h: 34 });
      mono(60, 90, 'seen = {(0, 0), (1, 1)}', { 'font-size': 16, 'font-weight': 700 });
      mono(60, 140, '(1, 1) in seen', { 'font-size': 16, opacity: fade(u, 1.0) }); dot([[230, 136], [550, Y(2)]], seg(u, 1.0, 1.4), ACC, 6);
      mono(270, 140, '→ True', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      mono(60, 250, 'seen.add([1, 2])', { 'font-size': 16, opacity: fade(u, 1.7) }); if (u > 1.9) cross(330, 245, 12, pop(u, 1.9));
      mono(60, 290, "TypeError: unhashable type: 'list'", { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(280, 360, '가변 list 는 해시값이 없어 칸을 못 정한다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 3) { card(200, 120, 260, 70, { rx: 12, text: 'min_max([3, 1, 4, 1, 5])', fs: 16, mono: true, stroke: INK, s: pop(u, 0.2) });
      mono(200, 180, 'return min(xs), max(xs)', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      const at = lerp(200, 500, E(u, 0.7, 1.4)); if (u > 0.7) { el('rect', { x: at - 80, y: 90, width: 160, height: 60, rx: 12, fill: INFOBG, stroke: INFO, 'stroke-width': 2.2 });
        card(at - 36, 120, 56, 40, { rx: 6, text: '1', fs: 17, mono: true }); card(at + 36, 120, 56, 40, { rx: 6, text: '5', fs: 17, mono: true }); }
      mono(500, 72, 'tuple (1, 5)', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      const t1 = tag(420, 270, 'lo', { s: pop(u, 1.6) }), t2 = tag(600, 270, 'hi', { s: pop(u, 1.8) });
      grow(464, 140, 440, 250, E(u, 1.7, 2.1), ACC); grow(536, 140, 590, 250, E(u, 1.9, 2.3), ACC);
      mono(500, 345, 'lo, hi = min_max(…)   # 1 5', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    // k4: 얕은 불변
    mono(60, 70, 'row = (1, [2, 3])', { 'font-size': 17, 'font-weight': 700 });
    el('rect', { x: 60, y: 100, width: 212, height: 70, rx: 12, fill: INFOBG, stroke: INFO, 'stroke-width': 2.2 }); lock(282, 102, true, INFO);
    card(118, 135, 86, 46, { rx: 6, text: '1', fs: 17, mono: true }); card(214, 135, 86, 46, { rx: 6, stroke: INK }); el('circle', { cx: 214, cy: 135, r: 5, fill: INK });
    grow(214, 160, 380, 250, 1, INK);
    const vals = u > 1.0 ? [2, 3, 4] : [2, 3];
    el('rect', { x: 380, y: 222, width: 230, height: 66, rx: 10, fill: WARNBG, stroke: WARN, 'stroke-width': 2 }); mono(390, 214, 'list (가변)', { 'font-size': 14, fill: WARN, 'font-weight': 700 });
    cells(396, 233, vals, { w: 60, h: 44, style: (i) => ({ s: i === 2 ? pop(u, 1.0) : 1, stroke: i === 2 ? WARN : INK }) });
    mono(660, 260, 'row[1].append(4)', { 'font-size': 16, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.4) });
    mono(60, 340, 'print(row)  →  (1, [2, 3, 4])', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.5) });
    mono(60, 384, "hash(row)  →  TypeError: unhashable type: 'list'", { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) });
    sub(780, 140, '칸(포인터)은 못 바꾸지만', fade(u, 0.6), { 'font-size': 15 }); sub(780, 166, '가리키는 list 는 바뀐다', fade(u, 0.9), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }

  // =========================================================
  // 3. dict — 인덱스 칸 + 넣은 순서대로 쌓이는 항목 표
  // =========================================================
  function entries(x, y, rows, o) { o = o || {}; tx(x, y - 12, o.title || '항목 표 (넣은 순서)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    rows.forEach((r, i) => { const yy = y + i * 42, s = r.s ?? 1; if (s <= 0) return;
      el('rect', { x, y: yy, width: 330, height: 36, rx: 6, fill: r.hi ? ACCBG : PANEL, stroke: r.hi ? ACC : INK, 'stroke-width': r.hi ? 2.5 : 1.6, opacity: s });
      mono(x - 10, yy + 23, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s });
      mono(x + 14, yy + 23, r.k, { 'font-size': 15, 'font-weight': 700, fill: r.hi ? ACC : INK, opacity: s }); mono(x + 190, yy + 23, r.v, { 'font-size': 15, opacity: s }); });
    return (i) => y + i * 42 + 18; }
  function s3(t, c) { const { k, u } = c;
    const IX = 90, IY = 64, slotsOf = (map, o) => table(IX, IY, 8, (i) => (map[i] != null ? { text: String(map[i]), stroke: o && o.hi === i ? ACC : INK, fill: o && o.hi === i ? ACCBG : PANEL, color: o && o.hi === i ? ACC : INK, op: o && o.op ? o.op(i) : 1 } : {}), { w: 70, h: 34 });
    tx(IX - 30, IY - 14, '인덱스 칸 (8개)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (k <= 1) { const keys = [['"id"', '7', 1], ['"name"', '"kim"', 3], ['"age"', '30', 5]];
      const map = {}; keys.forEach(([, , s], i) => { map[s] = i; });
      const Y = slotsOf(map, { hi: k === 1 && u > 1.0 ? 3 : null, op: (i) => (k === 0 ? fade(u, 0.5 + map[i] * 0.6) : 1) });
      const EY = entries(560, 80, keys.map(([kk, v], i) => ({ k: kk, v, s: k === 0 ? fade(u, 0.7 + i * 0.6) : 1, hi: k === 1 && i === 1 && u > 1.5 })));
      if (k === 0) { keys.forEach(([kk, , s], i) => { const st = 0.2 + i * 0.6; fly(330, 40, 330, Y(s), seg(u, st, st + 0.5), `hash(${kk}) % 8`, { mono: true, fill: INFO });
          grow(170, Y(s), 548, EY(i), E(u, st + 0.4, st + 0.7), MUT); });
        sub(330, 395, '문자열 해시는 실행마다 바뀐다 · 칸 번호는 예시', fade(u, 2.2), { 'font-size': 14 }); return; }
      mono(330, 50, 'user["name"]', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle' });
      dot([[330, 62], [330, Y(3) - 30], [170, Y(3)]], seg(u, 0.2, 1.0), INFO, 7);
      grow(170, Y(3), 548, EY(1), E(u, 1.0, 1.5), ACC);
      mono(560, 260, '키가 같은지 한 번 확인하고 값을 꺼낸다', { 'font-size': 15, opacity: fade(u, 1.6) });
      mono(560, 300, '→ kim', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      card(700, 370, 300, 50, { rx: 12, text: '앞에서부터 훑지 않는다 · 평균 O(1)', fs: 15, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 2.2) }); return; }
    if (k === 2) { const Y = slotsOf({ 3: 0 }, { hi: u > 0.9 ? 3 : null, op: () => fade(u, 0.9) });
      mono(560, 70, 'ok = {(1, 2): "point"}', { 'font-size': 16, 'font-weight': 700 });
      fly(330, 40, 330, Y(3), seg(u, 0.2, 0.8), 'hash((1, 2)) % 8 = 3', { mono: true, fill: INFO });
      const EY = entries(560, 120, [{ k: '(1, 2)', v: '"point"', s: fade(u, 1.0), hi: true }], { title: 'ok 의 항목 표' }); grow(170, Y(3), 548, EY(0), E(u, 1.0, 1.3), ACC);
      mono(560, 210, 'ok[(1, 2)]  →  point', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      mono(560, 290, '{[1, 2]: "x"}', { 'font-size': 16, opacity: fade(u, 1.7) }); if (u > 1.9) cross(720, 285, 12, pop(u, 1.9));
      mono(560, 326, "TypeError: unhashable type: 'list'", { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(330, 395, '튜플 (1, 2) 의 해시는 실행마다 같다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 3) { const ks = [['"b"', '1', 6], ['"a"', '2', 1], ['"c"', '3', 4]], map = {}; ks.forEach(([, , s], i) => { map[s] = i; });
      const Y = slotsOf(map, { op: (i) => fade(u, 0.3 + map[i] * 0.5) });
      const EY = entries(560, 80, ks.map(([kk, v], i) => ({ k: kk, v, s: fade(u, 0.4 + i * 0.5) })), { title: 'd 의 항목 표 (넣은 순서)' });
      ks.forEach(([, , s], i) => grow(170, Y(s), 548, EY(i), E(u, 0.5 + i * 0.5, 0.8 + i * 0.5), MUT));
      dot([[540, 98], [540, 182]], seg(u, 1.8, 2.3), ACC, 6);
      mono(560, 250, "list(d)  →  ['b', 'a', 'c']", { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) });
      sub(700, 300, '칸은 흩어져도 순회는 항목 표 순서 (3.7+)', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 4) { const Y = slotsOf({ 1: 0, 3: 1, 5: 2 }, { hi: null });
      entries(560, 80, [{ k: '"id"', v: '7' }, { k: '"name"', v: '"kim"' }, { k: '"age"', v: '30' }]);
      dot([[330, 40], [330, Y(6)], [170, Y(6)]], seg(u, 0.2, 0.9), WARN, 7);
      if (u > 0.9) el('rect', { x: IX - 3, y: Y(6) - 20, width: 76, height: 40, rx: 7, fill: 'none', stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '5 4' });
      mono(330, 30, 'hash("email") → 빈 칸 (예시 6)', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      mono(560, 260, 'user["email"]', { 'font-size': 16, opacity: fade(u, 1.1) }); mono(760, 260, '→ KeyError', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) });
      mono(560, 300, 'user.get("email", "없음")', { 'font-size': 16, opacity: fade(u, 1.7) }); mono(820, 300, '→ 없음', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) }); return; }
    // k5: 정수 키는 hash(n) == n
    const Y = slotsOf({ 0: 0, 1: 1, 2: 2, 3: 3 }, { op: (i) => fade(u, 0.4 + i * 0.35) });
    const EY = entries(560, 80, [0, 1, 2, 3].map((n) => ({ k: String(n), v: String(n * n), s: fade(u, 0.5 + n * 0.35) })), { title: 'squares 의 항목 표' });
    [0, 1, 2, 3].forEach((n) => grow(170, Y(n), 548, EY(n), E(u, 0.6 + n * 0.35, 0.9 + n * 0.35), MUT));
    mono(330, 40, '{n: n * n for n in range(4)}', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
    mono(560, 290, '{0: 0, 1: 1, 2: 4, 3: 9}', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
    sub(700, 330, '정수 키는 hash(n) == n', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 4. set — 키만 있는 해시 테이블, list in 과의 차이
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const items = ['"py"', '"go"', '"py"', '"rust"'], slot = [2, 5, 2, 7];
      tx(560, 54, 'tags 의 칸 · 번호는 예시', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const Y = table(600, 70, 8, (i) => { const j = slot.findIndex((s, q) => s === i && q !== 2); return j >= 0 ? { text: items[j], op: fade(u, 0.5 + j * 0.45) } : {}; }, { w: 170, h: 34 });
      items.forEach((s, i) => { const st = 0.2 + i * 0.45; mono(80, 90 + i * 40, s, { 'font-size': 16, 'font-weight': 700, fill: i === 2 ? WARN : INK });
        if (i !== 2) fly(150, 85 + i * 40, 640, Y(slot[i]), seg(u, st, st + 0.4), s, { mono: true, fill: INFO }); });
      if (u > 1.1) { fly(150, 165, 560, Y(2), seg(u, 1.1, 1.5), '"py"', { mono: true, fill: WARN, stay: u < 1.6 }); if (u > 1.5) { cross(560, Y(2), 11, pop(u, 1.5)); sub(330, 168, '같은 칸에 같은 키 → 버림', fade(u, 1.5), { fill: WARN, 'font-weight': 700, 'text-anchor': 'start' }); } }
      mono(80, 300, '"go" in tags', { 'font-size': 17, opacity: fade(u, 2.0) }); mono(260, 300, '→ True  (해시 한 번)', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) });
      sub(300, 370, '출력 순서는 실행마다 다를 수 있다', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 1) { const A = [330, 230], B = [560, 230], r = 130;
      el('circle', { cx: A[0], cy: A[1], r, fill: INFOBG, stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.1) }); el('circle', { cx: B[0], cy: B[1], r, fill: WARNBG, stroke: WARN, 'stroke-width': 2.5, opacity: 0.75 * fade(u, 0.3) });
      lbl(A[0] - 90, 70, 'a = {1, 2, 3}', fade(u, 0.2), { fill: INFO, class: 'mono' }); lbl(B[0] + 90, 70, 'b = {2, 3, 4}', fade(u, 0.4), { fill: WARN, class: 'mono' });
      const ball = (x, y, v, hi, s) => vball(x, y, v, { col: hi ? ACC : INK, fill: hi ? ACCBG : PANEL, s, sw: hi ? 3 : 2 });
      ball(250, 230, 1, u > 1.9, pop(u, 0.5)); ball(445, 200, 2, u > 1.0 && u < 1.9, pop(u, 0.6)); ball(445, 265, 3, u > 1.0 && u < 1.9, pop(u, 0.7)); ball(640, 230, 4, false, pop(u, 0.8));
      mono(820, 370, 'a & b → {2, 3}', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1), 'text-anchor': 'middle' });
      mono(820, 405, 'a - b → {1}', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9), 'text-anchor': 'middle' }); return; }
    if (k === 2) { tx(60, 56, 'big = list(range(1_000_000))  ·  targets = [999999, -1, 500000]', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const x0 = 60, W = 840; el('rect', { x: x0, y: 80, width: W, height: 40, rx: 6, fill: SOFT, stroke: INK, 'stroke-width': 1.6 });
      ['0', '1', '2', '…', '500000', '…', '999999'].forEach((s, i) => mono(x0 + [14, 40, 66, 200, 420, 640, 790][i], 106, s, { 'font-size': 14, fill: MUT }));
      const runs = [[999999, 1.0, BAD], [-1, 1.0, BAD], [500000, 0.5, WARN]];
      runs.forEach(([tg, frac, col], i) => { const st = 0.2 + i * 0.7, p = E(u, st, st + 0.6) * frac, y = 160 + i * 52;
        el('rect', { x: x0, y, width: W * p, height: 22, rx: 4, fill: col, opacity: 0.8 }); mono(x0 + W * p + 8, y + 17, '', {});
        mono(x0, y - 6, `${tg} in big  ·  비교 ${(tg === 500000 ? 500001 : 1000000).toLocaleString('en-US')}번${tg === -1 ? ' (없음)' : ''}`, { 'font-size': 14, fill: INK, opacity: fade(u, st) }); });
      mono(60, 345, '3개 찾는 데 비교 2,500,001번  ·  12.49ms (측정)', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.3) });
      sub(480, 395, '찾을 것이 m개면 O(n × m)', fade(u, 2.5), { 'font-size': 15 }); return; }
    if (k === 3) { card(200, 110, 270, 56, { rx: 12, text: 'lookup = set(big)', fs: 17, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.2) });
      mono(200, 162, '한 번 만드는 데 20.6ms (측정)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      tx(560, 54, 'lookup 의 칸', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 6; i++) { const y = 70 + i * 40, lab = ['…', '999997', '999998', '999999', '…', ''][i]; el('rect', { x: 600, y, width: 200, height: 34, rx: 5, fill: i === 3 && u > 1.4 ? ACCBG : PANEL, stroke: i === 3 && u > 1.4 ? ACC : GRID, 'stroke-width': 1.5 }); if (lab) mono(614, y + 23, lab, { 'font-size': 15, 'font-weight': 700, fill: i === 3 ? ACC : MUT }); }
      mono(60, 270, '999999 in lookup', { 'font-size': 17, opacity: fade(u, 0.8) }); dot([[240, 265], [590, 207]], seg(u, 0.9, 1.4), ACC, 7);
      mono(60, 306, 'hash(999999) = 999999  →  칸으로 바로', { 'font-size': 15, fill: INFO, opacity: fade(u, 1.2) });
      mono(60, 360, '비교 1번 · 평균 O(1)', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); return; }
    tx(60, 64, '같은 3개를 찾는 시간 (이 PC, Python 3.12 측정)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    [['t in big   (list)', '12.49ms', BAD, 1], ['t in lookup (set)', '0.00015ms', GOOD, 0.004]].forEach(([n, v, col, f], i) => { const y = 110 + i * 70;
      mono(60, y, n, { 'font-size': 16, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.4) });
      el('rect', { x: 60, y: y + 12, width: Math.max(4, 760 * f * E(u, 0.3 + i * 0.4, 1.2 + i * 0.4)), height: 22, rx: 4, fill: col });
      mono(60 + Math.max(4, 760 * f) + 10, y + 29, v, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.4) }); });
    mono(60, 290, 'fast = [t for t in targets if t in lookup]', { 'font-size': 16, opacity: fade(u, 1.6) });
    mono(60, 330, '→ [999999, 500000]', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
    card(760, 320, 260, 60, { rx: 12, text: '전체 O(n × m) → O(m)\n(set 은 한 번만 만든다)', fs: 15, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 2.2) }); }

  // =========================================================
  // 5. 얕은 복사 · 깊은 복사 · [[0]*3]*3
  // =========================================================
  // 바깥 list: n 칸 포인터, 칸 가운데 좌표 반환
  function outer(x, y, n, name, o) { o = o || {}; const w = 54; el('rect', { x: x - 8, y: y - 8, width: n * (w + 6) + 10, height: 58, rx: 10, fill: o.fill || PANEL, stroke: o.col || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    tx(x - 8, y - 16, name, { 'font-size': 15, 'font-weight': 800, fill: o.col || INK, class: 'mono', opacity: o.op ?? 1 });
    const cx = (i) => x + i * (w + 6) + w / 2; for (let i = 0; i < n; i++) { card(cx(i), y + 21, w, 40, { rx: 5, sw: 1.6, op: o.op }); el('circle', { cx: cx(i), cy: y + 21, r: 4.5, fill: o.col || INK, opacity: o.op ?? 1 }); } return cx; }
  function inner(x, y, vals, o) { o = o || {}; el('rect', { x: x - 8, y: y - 8, width: vals.length * 50 + 12, height: 54, rx: 9, fill: o.fill || SOFT, stroke: o.col || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    cells(x, y, vals, { w: 44, h: 38, gap: 6, fs: 15, style: (i) => (o.style ? o.style(i) : { op: o.op }) }); return { x: x - 8, cx: x + (vals.length * 50 - 6) / 2 }; }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { const deep = k === 1;
      const o1 = outer(90, 80, 2, 'original'), o2 = outer(620, 80, 2, deep ? 'deep' : 'shallow', { col: deep ? GOOD : WARN, op: fade(u, 0.2) });
      const a = inner(250, 230, deep ? [1, 2] : u > 1.4 ? [1, 2, 99] : [1, 2], { style: (i) => ({ s: i === 2 ? pop(u, 1.4) : 1, stroke: i === 2 ? BAD : INK }), col: !deep && u > 1.4 ? BAD : INK }), b = inner(250, 320, [3, 4]);
      link(o1(0), 125, a.x + 10, 245, 1, INK); link(o1(1), 125, b.x + 10, 330, 1, INK);
      if (!deep) { link(o2(0), 125, a.x + 160, 245, E(u, 0.5, 1.0), WARN); link(o2(1), 125, b.x + 110, 330, E(u, 0.7, 1.2), WARN);
        mono(620, 230, 'shallow[0].append(99)', { 'font-size': 15, fill: WARN, opacity: fade(u, 1.2) });
        mono(560, 380, 'print(original)  →  [[1, 2, 99], [3, 4]]', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0), 'text-anchor': 'middle' });
        sub(820, 300, '안쪽 list 는 같은 객체', fade(u, 1.0), { fill: WARN, 'font-weight': 700, 'font-size': 15 }); return; }
      const a2 = inner(640, 230, u > 1.4 ? [1, 2, 99] : [1, 2], { col: GOOD, fill: GOODBG, op: fade(u, 0.5), style: (i) => ({ s: i === 2 ? pop(u, 1.4) : 1, stroke: i === 2 ? GOOD : INK, op: fade(u, 0.5) }) });
      const b2 = inner(640, 320, [3, 4], { col: GOOD, fill: GOODBG, op: fade(u, 0.7) });
      link(o2(0), 125, a2.x + 30, 222, E(u, 0.6, 1.0), GOOD); link(o2(1), 125, b2.x + 40, 312, E(u, 0.8, 1.2), GOOD);
      mono(820, 170, 'deep[0].append(99)', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.2), 'text-anchor': 'middle' });
      mono(480, 395, 'print(original)  →  [[1, 2], [3, 4]]', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0), 'text-anchor': 'middle' }); return; }
    const rowVals = (r) => (k === 3 && u > 1.0) || k === 4 ? (k === 4 ? (r === 0 && u > 1.5 ? [1, 0, 0] : [0, 0, 0]) : [1, 0, 0]) : [0, 0, 0];
    const g = outer(90, 110, 3, 'grid');
    if (k <= 3) { const row = inner(560, 190, rowVals(0), { col: k === 3 && u > 1.0 ? BAD : INK, style: (i) => ({ stroke: k === 3 && i === 0 && u > 1.0 ? BAD : INK, s: k === 2 ? pop(u, 0.2) : 1 }) });
      [0, 1, 2].forEach((i) => link(g(i), 155, row.x + 4, 200 + (i - 1) * 12, k === 2 ? E(u, 0.8 + i * 0.35, 1.2 + i * 0.35) : 1, k === 3 ? BAD : INK));
      mono(560, 170, '[0] * 3  (단 하나)', { 'font-size': 14, fill: MUT });
      mono(90, 50, k === 2 ? 'grid = [[0] * 3] * 3' : 'grid[0][0] = 1', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
      if (k === 2) sub(330, 300, '*3 은 같은 행을 가리키는 포인터를 3개 만든다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 3) { ['[1, 0, 0]', '[1, 0, 0]', '[1, 0, 0]'].forEach((s, i) => mono(90 + i * 120, 330, s, { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5 + i * 0.2) }));
        mono(90, 300, 'print(grid)', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); sub(700, 330, '한 칸을 바꿨는데 세 행이 다 바뀐다', fade(u, 2.2), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); } return; }
    mono(90, 50, 'grid = [[0] * 3 for _ in range(3)]', { 'font-size': 16, 'font-weight': 700 });
    [0, 1, 2].forEach((i) => { const row = inner(560, 70 + i * 80, rowVals(i), { col: GOOD, style: (j) => ({ s: pop(u, 0.2 + i * 0.3), stroke: i === 0 && j === 0 && u > 1.5 ? ACC : INK }) }); link(g(i), 155, row.x - 4, 95 + i * 80, E(u, 0.4 + i * 0.3, 0.8 + i * 0.3), GOOD); });
    mono(90, 330, 'grid[0][0] = 1', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
    mono(90, 365, '[[1, 0, 0], [0, 0, 0], [0, 0, 0]]', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) }); }

  // =========================================================
  // 6. 고르는 기준 — 네 컬렉션의 모양에 예제를 얹는다
  // =========================================================
  function s6(t, c) { const { k, u } = c;
    const P = [['list', 130, '순서 O · 중복 O · 가변'], ['tuple', 370, '순서 O · 불변 · 키 가능'], ['dict', 610, '키 → 값 · 삽입순'], ['set', 850, '중복 X · in O(1)']];
    const on = [0, 1, 2, 3, 3][k];
    P.forEach(([n, cx, d], i) => { const hi = i === on, op = hi ? 1 : 0.45;
      el('rect', { x: cx - 110, y: 50, width: 220, height: 250, rx: 14, fill: hi ? ACCBG : PANEL, stroke: hi ? ACC : GRID, 'stroke-width': hi ? 3 : 1.5 });
      mono(cx, 82, n, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: hi ? ACC : MUT });
      tx(cx, 108, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: Math.max(op, 0.8) }); });
    // list: 할 일
    const todo = ['설계', '구현', '테스트'].concat(k === 0 && u > 1.0 ? ['배포'] : k > 0 ? ['배포'] : []);
    todo.forEach((s, i) => card(130, 140 + i * 36, 150, 30, { rx: 5, text: s, fs: 14, stroke: k === 0 && i === 3 ? ACC : INK, op: on === 0 ? 1 : 0.45, s: k === 0 && i === 3 ? pop(u, 1.0) : 1 }));
    // tuple: 좌표
    card(370, 170, 170, 46, { rx: 8, text: '(37.5, 127.0)', fs: 15, mono: true, stroke: INFO, op: on === 1 ? 1 : 0.45 }); lock(450, 140, true, INFO, on === 1 ? 1 : 0.6);
    if (k === 1) { mono(370, 245, 'dict 키로 OK', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) }); }
    // dict: 가격표
    [['"apple"', '1000'], ['"banana"', '500']].forEach(([a, b], i) => { const y = 150 + i * 40, hi = k === 2 && i === 0 && u > 1.0;
      card(610, y, 190, 32, { rx: 5, stroke: hi ? ACC : INK, sw: hi ? 2.5 : 1.6, op: on === 2 ? 1 : 0.45 }); mono(530, y + 5, a, { 'font-size': 14, opacity: on === 2 ? 1 : 0.45 }); mono(690, y + 5, b, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: on === 2 ? 1 : 0.45 }); });
    if (k === 2) mono(610, 250, 'price["apple"] → 1000', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
    // set: 방문 경로 / 허용 메서드
    const items = k === 4 ? ['"GET"', '"POST"', '"PUT"'] : ['"/home"'];
    items.forEach((s, i) => card(850, 150 + i * 38, 130, 30, { rx: 15, text: s, fs: 14, mono: true, stroke: k === 4 && i === 1 && u > 1.0 ? ACC : INK, sw: k === 4 && i === 1 && u > 1.0 ? 2.5 : 1.6, op: on === 3 ? 1 : 0.45, s: k === 3 ? pop(u, 0.6) : k === 4 ? pop(u, 0.2 + i * 0.15) : 1 }));
    if (k === 3) mono(850, 250, '"/home" in visited', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
    if (k === 4) mono(850, 280, 'is_allowed("POST")', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
    const Q = ['순서가 있고, 나중에 고친다', '안 바뀌는 묶음, 키로도 쓴다', '이름으로 값을 찾는다', '"있나?"만 묻는다, 중복은 필요 없다', '"있나?"를 반복해서 묻는다 → set'][k];
    card(480, 360, tw(Q, 17) + 60, 52, { rx: 26, text: Q, fs: 17, stroke: INK, fill: PANEL, s: pop(u, 0.2) });
    if (k === 4) sub(850, 320, 'list 면 매번 앞에서부터 비교', fade(u, 1.8), { fill: BAD, 'font-weight': 700, 'font-size': 14 }); }

  const quiz = [
    { q: 'nums.insert(0, 5)가 nums[2] 읽기보다 느린 이유는 무엇인가?',
      o: ['insert는 해시를 다시 계산해야 해서', '뒤에 있는 원소를 전부 한 칸씩 밀어야 해서', '파이썬이 리스트를 통째로 정렬해서'], a: 1,
      why: 'list는 포인터 칸이 연속으로 놓인 배열이다. 앞에 끼우면 원소 4개가 모두 한 칸씩 이동하는 O(n) 작업이 된다.' },
    { q: 'tuple은 dict의 키가 될 수 있고 list는 안 되는 이유는 무엇인가?',
      o: ['tuple은 불변이라 해시값이 바뀌지 않기 때문이다', 'tuple이 list보다 메모리를 적게 쓰기 때문이다', 'tuple은 원소가 항상 두 개이기 때문이다'], a: 0,
      why: '키는 해시값으로 칸을 정한다. 내용이 바뀔 수 있는 list는 해시를 주지 않아 unhashable 오류가 난다.' },
    { q: 'd에 "b", "a", "c" 순서로 넣었을 때 list(d)의 결과는 무엇인가?',
      o: ["['a', 'b', 'c']", "['b', 'a', 'c']", '실행할 때마다 다르다'], a: 1,
      why: '3.7부터 dict는 항목을 넣은 순서대로 쌓아 두고 그 순서로 순회한다. 해시 칸이 흩어져 있어도 결과는 같다.' },
    { q: '백만 개짜리 list에서 값 3개를 in으로 찾는 코드를 빠르게 바꾸는 방법은 무엇인가?',
      o: ['list를 먼저 정렬한다', 'in 대신 for 문으로 직접 비교한다', 'set(big)을 한 번 만들고 그 set에 in을 쓴다'], a: 2,
      why: 'list의 in은 앞에서부터 비교해 3개 찾는 데 2,500,001번을 비교했다. set은 해시로 칸을 바로 찾아 한 번이면 된다.' },
    { q: 'grid = [[0] * 3] * 3 뒤에 grid[0][0] = 1을 하면 무엇이 출력되는가?',
      o: ['[[1, 0, 0], [0, 0, 0], [0, 0, 0]]', '[[1, 0, 0], [1, 0, 0], [1, 0, 0]]', 'TypeError'], a: 1,
      why: '* 3은 같은 행을 가리키는 포인터를 세 개 만든다. 행이 하나뿐이라 한 칸을 바꾸면 세 줄에 모두 보인다.' },
    { q: '허용된 HTTP 메서드인지 요청마다 검사할 때 allowed를 무엇으로 두는 게 맞는가?',
      o: ['set, in 검사가 평균 O(1)이라서', 'list, 순서가 있어야 해서', 'tuple, 불변이라 더 빨라서'], a: 0,
      why: '"있나?"를 반복해서 묻는 자리에는 해시 테이블이 맞다. list나 tuple의 in은 앞에서부터 비교한다.' },
  ];

  const summary = [
    'list는 포인터 칸이 연속으로 놓인 배열이라 인덱싱은 O(1), 앞 삽입은 O(n)이다.',
    'dict와 set은 키를 해시해 칸을 바로 찾는다. 그래서 키는 tuple처럼 불변이어야 한다.',
    '큰 list에 in을 반복하면 느리다. set으로 한 번 바꾸면 3개 찾는 시간이 12.49ms에서 거의 0이 된다.',
    '[:]와 copy.copy는 겉만 새로 만든다. 안쪽까지 떼려면 deepcopy, 2차원 배열은 컴프리헨션으로 만든다.',
  ];
  const review = [
    { q: '작업 큐를 list로 만들고 q.pop(0)으로 꺼냈더니 작업이 쌓일수록 점점 느려졌다. 먼저 바꿀 것은?',
      o: ['collections.deque의 popleft()로 꺼낸다', 'list를 tuple로 바꿔 메모리를 줄인다', 'q.sort()로 먼저 정렬한 뒤 꺼낸다'], a: 0,
      why: 'pop(0)은 남은 원소를 모두 앞으로 당기는 O(n)이다. 측정에서 10만 번 꺼내기가 pop(0) 528.2ms, popleft 3.8ms였다.' },
    { q: '설정 묶음을 깊이 2단계 리스트로 두고 [:]로 복사해 고쳤더니 원본 설정까지 바뀌었다. 원인은?',
      o: ['[:]가 원본을 지우고 새 리스트를 다시 만들었다', '바깥만 새로 만들어 안쪽 리스트는 원본과 공유한다', 'tuple이 섞여 있어서 복사가 중간에 멈췄다'], a: 1,
      why: '얕은 복사는 바깥 칸의 포인터만 옮겨 적는다. 안쪽까지 떼어 내려면 copy.deepcopy가 필요하다.' },
    { q: '방문한 좌표 [x, y]를 set에 넣으려 했더니 TypeError가 났다. 맞는 처리는?',
      o: ['set 대신 list에 넣고 in으로 검사한다', 'dict의 값으로 넣는다', '좌표를 (x, y) 튜플로 바꿔 넣는다'], a: 2,
      why: 'set 원소는 해시가 필요해 가변 list는 못 들어간다. 불변인 tuple로 바꾸면 해시가 생기고 in 검사도 O(1)로 남는다.' },
  ];

  R.page({ title: '컬렉션의 메모리 칸', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
