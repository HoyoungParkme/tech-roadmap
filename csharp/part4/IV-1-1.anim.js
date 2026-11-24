/* IV-1-1 List·Dictionary 내부 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 .NET 10 에서 코드를 실제로 돌려 확인한 값: new List<int>() 의 Capacity 0 → 첫 Add 때 4,
 * 1000만 개 Add 동안 Capacity 23번 변경(최종 16,777,216), 버킷 3개(apple→2, banana→0, cherry→2),
 * List version 4 → 5. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, cross, check, terminal, axes, line, hbar, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  // 위가 열린 대괄호 (칸 묶음 표시)
  function brace(x1, x2, y, col, u) { if (u <= 0) return; const xm = lerp(x1, x2, 0.5), w = (x2 - x1) / 2 * u;
    el('path', { d: `M${xm - w},${y} v8 H${xm + w} v-8`, fill: 'none', stroke: col, 'stroke-width': 2.2 }); }
  // 휘어진 화살표 (a 에서 b 로, h 만큼 위로 볼록)
  function arc(x1, y1, x2, y2, h, u, col) { if (u <= 0) return; const p = el('path', { d: `M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - h} ${x2},${y2}`, fill: 'none', stroke: col || ACC, 'stroke-width': 2.4, pathLength: 100, 'stroke-dasharray': `${u * 100} 100`, 'marker-end': u > 0.98 ? (col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ahb)') : null }); return p; }

  // ---------- 1. List<T> = 자라는 배열 ----------
  const AX = 560, AW = 72, AG = 8, AY = 92, AH = 56;
  const cx = (i) => AX + i * (AW + AG) + AW / 2;
  function listFrame(k, u, cap, size) {
    zone(20, 40, 180, 200, '스택', { fill: SOFT });
    zone(222, 40, 718, 200, '힙', { fill: SOFT });
    card(110, 120, 120, 52, { rx: 8, text: 'list', mono: true, fs: 16, fw: 700 });
    el('circle', { cx: 150, cy: 120, r: 5, fill: ACC }); grow(155, 120, 262, 120, 1, ACC);
    // List<int> 객체
    card(345, 120, 160, 104, { rx: 10, stroke: ACC, sw: 2.2, fill: PANEL });
    tx(345, 88, 'List<int>', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, class: 'mono' });
    mono(282, 120, '_items', { 'font-size': 15, 'font-weight': 700 }); el('circle', { cx: 400, cy: 115, r: 5, fill: INK });
    mono(282, 150, '_size', { 'font-size': 15, 'font-weight': 700 }); mono(408, 150, String(size), { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
  }
  function s1(t, c) { const { k, u } = c, d = c.beat.listArray, pd = c.prev && c.prev.listArray;
    const cap = d.capacity;
    if (k === 0) { listFrame(k, u, 0, 0);
      grow(405, 115, AX - 6, 115, E(u, 0.3, 1.0), MUT);
      card(AX + 26, 115, 48, 40, { rx: 6, text: '[ ]', mono: true, fs: 15, stroke: GRID, s: pop(u, 0.9) });
      note(AX + 70, 110, 'int[0]  길이 0인 배열', fade(u, 1.2), { class: 'mono', 'font-size': 15 });
      note(AX + 70, 134, 'Capacity 0 · _size 0', fade(u, 1.6), { fill: MUT, class: 'mono', 'font-size': 14 });
      sub(480, 290, '아직 칸이 하나도 없다. 첫 Add 때 4칸 배열을 만든다', fade(u, 2.0), { 'font-size': 15 });
      return; }
    // 4칸 배열
    let size = d.size; if (k === 1) size = [0, 1, 2].filter((i) => u >= 1.15 + i * 0.55).length;
    if (k === 4) size = u < 2.0 ? 3 : 4;
    listFrame(k, u, cap, size);
    grow(405, 115, AX - 4, 115, k === 1 ? E(u, 0.1, 0.5) : 1, ACC);
    mono(cx(3) + AW / 2 + 10, AY + AH / 2 + 5, `int[${cap}]`, { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    let vals = ['10', '20', '30', null];
    if (k === 1) vals = vals.map((v, i) => (i < size ? v : null));
    // Insert(0, 5): 30 → 3, 20 → 2, 10 → 1 순서로 한 칸씩, 그다음 5 가 0 에
    const sh = [seg(u, 0.3, 0.8), seg(u, 0.8, 1.3), seg(u, 1.3, 1.8)];   // 30, 20, 10 이동 진행
    if (k === 4) vals = [u >= 2.1 ? '5' : null, null, null, null];
    for (let i = 0; i < cap; i++) {
      const hi = k === 2 && i === 1 && u > 1.2, full = k === 4 && u > 2.2;
      card(cx(i), AY + AH / 2, AW, AH, { rx: 6, text: vals[i] || '', mono: true, fs: 17, fw: 700, stroke: hi ? ACC : full ? BAD : vals[i] || k === 4 ? INK : GRID, fill: hi ? ACCBG : PANEL, dash: vals[i] || k === 4 ? null : '5 4', sw: hi ? 3 : 2, s: k === 1 ? pop(u, 0.1 + i * 0.06) : 1 });
      mono(cx(i), AY + AH + 20, `[${i}]`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    if (k === 1) { ['10', '20', '30'].forEach((v, i) => fly(150, 300, cx(i), AY + AH / 2, seg(u, 0.6 + i * 0.55, 1.15 + i * 0.55), `Add(${v})`, { mono: true })); }
    if (k === 4) { // 이동하는 값들
      [['30', 2], ['20', 1], ['10', 0]].forEach(([v, from], j) => { const p = sh[j], x = lerp(cx(from), cx(from + 1), E(p, 0, 1));
        card(x, AY + AH / 2 - (p > 0 && p < 1 ? 10 : 0), AW - 8, AH - 10, { rx: 6, text: v, mono: true, fs: 17, fw: 700, stroke: p > 0 && p < 1 ? WARN : INK, fill: PANEL });
        if (p > 0) arc(cx(from), AY - 4, cx(from + 1), AY - 4, 26, Math.min(1, p * 1.4), WARN); });
      fly(150, 300, cx(0), AY + AH / 2, seg(u, 1.9, 2.3), 'Insert(0, 5)', { mono: true, fill: WARN });
      const moved = sh.filter((p) => p >= 1).length;
      note(560, 290, `뒤로 민 칸: ${moved} / 3`, fade(u, 0.3), { class: 'mono', fill: WARN, 'font-size': 17, 'font-weight': 800 });
      if (u > 2.2) pill(cx(3) + 10, AY + AH + 50, '4 / 4 꽉 참', BAD, pop(u, 2.3), { fs: 14 }); }
    if (k === 2) { // 주소 계산 후 바로 칸 1
      const st = AX;
      el('line', { x1: st, y1: AY + AH + 34, x2: st, y2: AY + AH + 10, stroke: MUT, 'stroke-width': 2, opacity: fade(u, 0.2) });
      note(st, AY + AH + 52, '시작 주소', fade(u, 0.2), { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      spans(282, 300, [['주소 = 시작 + ', {}], ['1', { fill: ACC, 'font-weight': 800 }], [' × 4바이트', {}]], { 'font-size': 18, opacity: fade(u, 0.5) });
      arc(AX + 6, AY - 4, cx(1), AY - 4, 40, E(u, 0.8, 1.3), ACC);
      fly(cx(1), AY + AH / 2, 110, 210, seg(u, 1.5, 2.3), '20', { mono: true });
      if (u > 2.3) card(110, 210, 120, 40, { rx: 8, text: 'x = 20', mono: true, fs: 16, fw: 800, stroke: ACC, color: ACC });
      sub(480, 340, '앞 칸을 훑지 않는다. 몇 번째든 계산 한 번 (O(1))', fade(u, 2.2), { 'font-size': 15 }); }
    if (k === 3) { const x0 = cx(0) - AW / 2, x3 = cx(3) + AW / 2;
      brace(x0, cx(2) + AW / 2, AY + AH + 30, ACC, E(u, 0.2, 0.8));
      note(lerp(x0, cx(2) + AW / 2, 0.5), AY + AH + 62, 'Count = _size = 3', fade(u, 0.7), { class: 'mono', fill: ACC, 'text-anchor': 'middle', 'font-weight': 800 });
      brace(x0, x3, AY + AH + 78, INK, E(u, 1.1, 1.7));
      note(lerp(x0, x3, 0.5), AY + AH + 110, 'Capacity = _items.Length = 4', fade(u, 1.6), { class: 'mono', 'text-anchor': 'middle', 'font-weight': 800 });
      sub(cx(3), AY - 18, '빈 칸 1', fade(u, 2.1), { fill: GOOD, 'font-weight': 700 }); }
    // 아래: 연산 비용
    const ops = (d.ops || []);
    if (k !== 3) ops.forEach((o, i) => { const col = o.tone === 'bad' ? BAD : GOOD, x = 120 + i * 260, y = 380, isNew = !(pd && pd.ops && pd.ops.some((p) => p.op === o.op));
      const s = isNew ? pop(u, 2.0) : 1;
      card(x + 100, y, 236, 40, { rx: 8, stroke: col, sw: 2, s, fill: o.tone === 'bad' ? BADBG : GOODBG });
      tx(x - 6, y + 5, o.op.replace(' (빈 칸 있을 때)', ''), { 'font-size': 14, 'font-weight': 700, class: 'mono', opacity: s ? 1 : 0 });
      mono(x + 208, y + 5, o.big, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: s ? 1 : 0 }); });
  }

  // ---------- 2. Capacity 재할당 ----------
  // .NET 10 실측: 빈 List 에 1000만 개 Add → Capacity 0→4→8→…→16,777,216 (23번 변경)
  const CAPS = []; for (let v = 4; v <= 16777216; v *= 2) CAPS.push(v);   // 23개
  function chart(o) { o = o || {};
    const ax = axes(560, 70, 340, 230, { x: [0, 7], y: [0, 7.5], xl: 'Add 횟수', yl: 'Capacity (로그 눈금)', xt: [], yt: [] });
    [[0, '1'], [3, '1천'], [6, '100만'], [7, '1000만']].forEach(([v, s]) => mono(ax.X(v), 70 + 230 + 20, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    [[Math.log10(4), '4'], [Math.log10(4096), '4,096'], [Math.log10(16777216), '16,777,216']].forEach(([v, s]) => mono(556, ax.Y(v) + 5, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }));
    return ax; }
  function stair(ax, n, col) { // 처음 n 개 계단
    const pts = []; let x = 0; CAPS.slice(0, n).forEach((cp, i) => { const at = i === 0 ? 0 : Math.log10(CAPS[i - 1] + 1); pts.push([at, Math.log10(cp)]); const nx = i + 1 < CAPS.length ? Math.log10(cp + 1) : 7; pts.push([Math.min(7, nx), Math.log10(cp)]); x = nx; });
    if (pts.length > 1) line(ax, pts, 1, col || BAD, { sw: 2.6 }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { const ax = chart();
      if (k === 0) { card(140, 110, 130, 46, { rx: 8, text: 'slow', mono: true, fs: 16, fw: 700 });
        grow(205, 110, 268, 110, E(u, 0.3, 0.8), MUT); card(320, 110, 90, 40, { rx: 6, text: '[ ]', mono: true, stroke: GRID, s: pop(u, 0.7) });
        note(80, 180, 'new List<int>()  →  Capacity 0', fade(u, 1.0), { class: 'mono' });
        note(80, 212, '최종 크기를 모른다', fade(u, 1.4), { fill: MUT });
        stair(ax, Math.round(E(u, 1.8, 2.4)), BAD);
        if (u > 2.0) note(ax.X(0.3), ax.Y(0.6) - 16, '첫 Add: 0 → 4', fade(u, 2.0), { class: 'mono', fill: BAD, 'font-size': 14 });
        return; }
      // k=1: 4칸 꽉 참 → 8칸 새 배열, 복사
      const y1 = 80, y2 = 190, cw = 40;
      mono(40, y1 - 12, '옛 배열 int[4]', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const gone = fade(u, 2.0);
      for (let i = 0; i < 4; i++) card(60 + i * (cw + 4), y1 + 22, cw, 36, { rx: 4, text: String(i), mono: true, fs: 14, stroke: BAD, fill: BADBG, op: 1 - 0.65 * gone });
      if (u > 2.0) { el('line', { x1: 40, y1: y1 + 22, x2: 236, y2: y1 + 22, stroke: MUT, 'stroke-width': 2, opacity: gone }); note(250, y1 + 28, 'GC 대상', gone, { fill: MUT, 'font-size': 14 }); }
      mono(40, y2 - 12, '새 배열 int[8]', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.3) });
      for (let i = 0; i < 8; i++) { const filled = i < 4 ? seg(u, 0.8 + i * 0.22, 1.0 + i * 0.22) >= 1 : i === 4 && u > 1.9;
        card(60 + i * (cw + 4), y2 + 22, cw, 36, { rx: 4, text: filled ? String(i) : '', mono: true, fs: 14, stroke: filled ? ACC : GRID, dash: filled ? null : '4 3', s: pop(u, 0.3 + i * 0.04) }); }
      for (let i = 0; i < 4; i++) dot([[60 + i * (cw + 4), y1 + 40], [60 + i * (cw + 4), y2 + 4]], seg(u, 0.6 + i * 0.22, 1.0 + i * 0.22), ACC, 6);
      note(40, 300, '복사 4개 + 다섯 번째 Add', fade(u, 1.9), { class: 'mono', fill: ACC });
      stair(ax, Math.max(2, Math.round(lerp(2, 23, E(u, 0.4, 2.4)))), BAD);
      const n = Math.max(2, Math.round(lerp(2, 23, E(u, 0.4, 2.4))));
      note(40, 350, `Capacity 변경 ${n}번`, 1, { class: 'mono', fill: BAD, 'font-size': 18, 'font-weight': 800 });
      note(40, 380, `지금 Capacity ${fmt(CAPS[n - 1])}`, 1, { class: 'mono', fill: MUT, 'font-size': 15 });
      return; }
    if (k === 2 || k === 3) { const ax = chart(); stair(ax, 23, BAD);
      note(ax.X(4.2), ax.Y(7.22) - 10, 'slow', 1, { fill: BAD, class: 'mono', 'font-weight': 800 });
      const fy = ax.Y(7); el('line', { x1: ax.X(0), y1: fy, x2: lerp(ax.X(0), ax.X(7), E(u, k === 2 ? 1.0 : -1, k === 2 ? 1.8 : 0)), y2: fy, stroke: GOOD, 'stroke-width': 3 });
      note(ax.X(0.2), fy + 22, 'fast: 처음부터 10,000,000', k === 2 ? fade(u, 1.8) : 1, { fill: GOOD, class: 'mono', 'font-size': 14 });
      card(140, 100, 130, 46, { rx: 8, text: 'fast', mono: true, fs: 16, fw: 700, stroke: GOOD });
      note(60, 160, 'new List<int>(10_000_000)', 1, { class: 'mono', 'font-size': 15 });
      // 한 번에 잡은 큰 배열 (막대)
      const bx = 60, bw = 420, by = 190;
      el('rect', { x: bx, y: by, width: bw * (k === 2 ? E(u, 0.3, 0.9) : 1), height: 34, rx: 5, fill: PANEL, stroke: GOOD, 'stroke-width': 2 });
      const fill = k === 3 ? E(u, 0.2, 2.2) : 0;
      if (fill > 0) el('rect', { x: bx + 2, y: by + 2, width: (bw - 4) * fill, height: 30, rx: 4, fill: GOOD, opacity: 0.55 });
      mono(bx + bw, by + 56, 'int[10,000,000]', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      if (k === 2) note(bx, by + 92, '할당 1번 · 이후 재할당 0', fade(u, 1.2), { fill: GOOD, 'font-weight': 700 });
      if (k === 3) { note(bx, by + 92, `_size ${fmt(10000000 * fill)}`, 1, { class: 'mono', 'font-size': 18, 'font-weight': 800 });
        note(bx, by + 124, 'Capacity 변경  slow 23번 · fast 0번', fade(u, 1.4), { class: 'mono', 'font-size': 15 });
        note(bx, by + 154, '끝난 뒤 slow 는 빈 칸 6,777,216개', fade(u, 2.0), { class: 'mono', 'font-size': 15, fill: MUT }); }
      return; }
    // k=4 EnsureCapacity
    card(140, 100, 130, 46, { rx: 8, text: 'buf', mono: true, fs: 16, fw: 700 });
    note(60, 160, 'buf.EnsureCapacity(10_000_000)', 1, { class: 'mono' });
    const cp = E(u, 0.5, 1.4);
    note(60, 220, 'Capacity', 1, { fill: MUT });
    mono(180, 224, fmt(lerp(0, 10000000, cp)), { 'font-size': 26, 'font-weight': 800, fill: ACC });
    el('rect', { x: 60, y: 246, width: 420, height: 14, rx: 4, fill: SOFT }); el('rect', { x: 60, y: 246, width: 420 * cp, height: 14, rx: 4, fill: ACC });
    sub(270, 292, '두 배씩 늘리지 않고 한 번에 n 으로', fade(u, 1.5), { 'font-size': 15 });
    terminal(560, 90, 360, 150, ['$ dotnet run', ['10000000', 'var(--term)']], u < 1.8 ? 1 : 1 + seg(u, 1.8, 2.3), { title: 'Console.WriteLine(buf.Capacity)' });
  }

  // ---------- 3. Dictionary: 해시로 위치 계산 ----------
  const BK = { x: 700, y: 70, h: 78, w: 220 };   // 버킷 b0..b2
  const by = (b) => BK.y + b * (BK.h + 12) + BK.h / 2;
  const HX = { apple: '0x6FF9600E', banana: '0x3E3F0FFA', cherry: '0x0007D396' }, BIDX = { apple: 2, banana: 0, cherry: 2 };
  function buckets(entries, o) { o = o || {};
    for (let b = 0; b < 3; b++) { const y = BK.y + b * (BK.h + 12), hot = o.hot === b;
      el('rect', { x: BK.x, y, width: BK.w, height: BK.h, rx: 8, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2.6 : 1.6 });
      mono(BK.x - 12, y + BK.h / 2 + 5, `b${b}`, { 'font-size': 15, fill: MUT, 'text-anchor': 'end', 'font-weight': 700 }); }
    entries.forEach(([key, val, b, s]) => { if (!s) return; const i = entries.filter((e) => e[2] === b && e[3]).indexOf(entries.find((e) => e[0] === key));
      card(BK.x + 60 + i * 110, by(b), 100, 36, { rx: 6, text: val == null ? key : `${key}:${val}`, mono: true, fs: 14.5, fw: 700, stroke: ACC, s }); }); }
  function pipe(key, u0, u, o) { o = o || {}; // 키 → GetHashCode → % 3 → 버킷
    const y = o.y || 200, p1 = seg(u, u0, u0 + 0.35), p2 = seg(u, u0 + 0.35, u0 + 0.7), p3 = seg(u, u0 + 0.7, u0 + 1.0);
    pill(70, y, `"${key}"`, INK, pop(u, u0 - 0.1), { mono: true, fs: 15 });
    grow(122, y, 166, y, p1, MUT);
    card(250, y, 160, 44, { rx: 8, text: 'GetHashCode()', mono: true, fs: 14.5, stroke: INFO, color: INFO, s: p1 > 0 ? 1 : 0 });
    grow(332, y, 372, y, p2, MUT);
    mono(380, y + 6, HX[key], { 'font-size': 16, 'font-weight': 800, opacity: p2 > 0.3 ? 1 : 0 });
    grow(490, y, 524, y, p3, MUT);
    mono(530, y + 6, `% 3 = ${BIDX[key]}`, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: p3 > 0.3 ? 1 : 0 });
    return p3; }
  function s3(t, c) { const { k, u } = c;
    tx(BK.x, 52, '버킷 3개 (.NET 10 실제 값)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (k === 0) { const a = pipe('apple', 0.2, u, { y: 140 }), b = pipe('banana', 1.3, u, { y: 260 });
      dot([[630, 140], [BK.x + 10, by(2)]], seg(u, 1.2, 1.5), ACC, 7); dot([[630, 260], [BK.x + 10, by(0)]], seg(u, 2.3, 2.6), ACC, 7);
      buckets([['apple', 3, 2, u > 1.5 ? pop(u, 1.5) : 0], ['banana', 5, 0, u > 2.6 ? pop(u, 2.6) : 0]]);
      return; }
    const base = [['apple', 3, 2, 1], ['banana', 5, 0, 1]];
    if (k === 1) { pipe('apple', 0.2, u, { y: 200 }); buckets(base, { hot: u > 1.3 ? 2 : null });
      arc(640, 190, BK.x + 4, by(2) - 10, 30, E(u, 1.2, 1.6), ACC);
      fly(BK.x + 60, by(2), 120, 330, seg(u, 1.8, 2.4), '3', { mono: true });
      if (u > 2.4) card(120, 330, 110, 40, { rx: 8, text: 'n = 3', mono: true, fs: 16, fw: 800, stroke: ACC, color: ACC });
      note(300, 336, '비교 1번 · 다른 키는 보지 않는다', fade(u, 2.0), { fill: ACC });
      return; }
    if (k === 2) { pipe('cherry', 0.2, u, { y: 200 }); buckets(base, { hot: u > 1.3 ? 2 : null });
      arc(640, 190, BK.x + 4, by(2) - 10, 30, E(u, 1.2, 1.6), WARN);
      if (u > 1.6) { card(BK.x + 110, by(2) + 54, 200, 30, { rx: 6, text: 'Equals("apple")?', mono: true, fs: 14, stroke: WARN, color: INK, s: pop(u, 1.6) }); }
      if (u > 2.0) cross(BK.x + 225, by(2) + 54, 9, pop(u, 2.0));
      if (u > 2.2) card(150, 330, 230, 40, { rx: 8, text: 'TryGetValue → false', mono: true, fs: 15, fw: 800, stroke: BAD, color: BAD, s: pop(u, 2.2) });
      note(420, 336, '같은 버킷 ≠ 같은 키', fade(u, 2.4), { fill: WARN });
      return; }
    if (k === 3) { // entries 배열: a b c → a 지움 → d 가 빈자리
      buckets(base, {});
      note(40, 90, '안쪽 entries 배열 (넣은 자리)', 1, { fill: MUT, 'font-size': 14 });
      const st = u < 0.9 ? ['a', 'b', 'c'] : u < 1.6 ? ['', 'b', 'c'] : ['d', 'b', 'c'];
      st.forEach((v, i) => card(80 + i * 90, 140, 76, 50, { rx: 6, text: v, mono: true, fs: 18, fw: 700, stroke: v === 'd' ? WARN : v ? INK : GRID, dash: v ? null : '5 4', s: pop(u, 0.1 + i * 0.1) }));
      const steps = [['a, b, c 넣기', 0.2], ['Remove("a")', 0.9], ['d 넣기 → 빈자리', 1.6]];
      steps.forEach(([s, a], i) => note(40, 232 + i * 28, s, fade(u, a), { class: 'mono', 'font-size': 14.5, fill: i === 2 ? WARN : INK }));
      if (u > 2.1) { pill(200, 350, 'foreach → d  b  c', WARN, pop(u, 2.1), { mono: true, fs: 15 }); }
      return; }
    // k=4 HashSet: 키만
    const sp = pop(u, 0.3);
    buckets([['apple', null, 2, sp], ['banana', null, 0, sp]], { hot: u > 1.8 ? 2 : null });
    tx(680, 392, 'HashSet<string> — 값 없이 키만', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.3) });
    pipe('apple', 0.6, u, { y: 200 });
    if (u > 1.9) card(150, 330, 250, 40, { rx: 8, text: 'Contains("apple") → True', mono: true, fs: 15, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, 1.9) });
  }

  // ---------- 4. 실무 지뢰 두 개 ----------
  function left(k, u) { const op = k >= 2 ? 0.35 : 1;
    tx(40, 44, '① 키의 해시 · Equals', { 'font-size': 15, 'font-weight': 800, opacity: op });
    card(230, 92, 330, 44, { rx: 8, text: 'record Point(int X, int Y)', mono: true, fs: 15, fw: 700, stroke: ACC, op, s: k === 0 ? pop(u, 0.2) : 1 });
    ['Equals 자동', 'GetHashCode 자동'].forEach((s, i) => pill(140 + i * 170, 146, s, GOOD, k === 0 ? pop(u, 0.7 + i * 0.3) : 1, { fs: 13.5, op }));
    const p1 = k === 0 ? pop(u, 1.3) : 1;
    card(120, 220, 140, 54, { rx: 8, text: 'Point(1,2)\n#1', mono: true, fs: 14, s: p1, op });
    if (k === 0) { grow(190, 220, 300, 220, E(u, 1.6, 2.0), ACC); card(360, 220, 110, 40, { rx: 6, text: 'grid: "A"', mono: true, fs: 14, s: pop(u, 2.0) }); return; }
    card(360, 220, 110, 40, { rx: 6, text: 'grid: "A"', mono: true, fs: 14, op });
    if (k >= 2) return;
    card(120, 310, 140, 54, { rx: 8, text: 'Point(1,2)\n#2', mono: true, fs: 14, s: pop(u, 0.2) });
    note(40, 360, '다른 객체 · 값은 같다', fade(u, 0.4), { fill: MUT, 'font-size': 14 });
    arc(190, 300, 330, 244, 10, E(u, 0.7, 1.3), ACC);
    note(205, 322, '해시 같음 · Equals 참', fade(u, 1.2), { fill: ACC, 'font-size': 14 });
    if (u > 1.6) card(370, 368, 210, 40, { rx: 8, text: 'ContainsKey → True', mono: true, fs: 15, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, 1.6) });
    note(40, 404, 'class 로 만들었다면 → False', fade(u, 2.2), { fill: BAD, 'font-size': 14.5 });
  }
  function s4(t, c) { const { k, u } = c;
    el('line', { x1: 480, y1: 30, x2: 480, y2: 400, stroke: GRID, 'stroke-width': 1.5 });
    left(k, u);
    const rop = k < 2 ? 0.35 : 1;
    tx(510, 44, '② 반복 중 수정', { 'font-size': 15, 'font-weight': 800, opacity: rop });
    const X0 = 540, W = 70, cxR = (i) => X0 + i * (W + 10) + W / 2, Y = 120;
    let vals = [1, 2, 3, 4];
    if (k < 2) { vals.forEach((v, i) => card(cxR(i), Y, W, 50, { rx: 6, text: String(v), mono: true, fs: 18, op: rop })); return; }
    if (k === 2) { const rm = seg(u, 1.0, 1.5);
      const cur = u < 0.5 ? 0 : u < 1.0 ? 1 : 1;
      // 2 를 지우며 뒤를 당긴다
      const show = rm < 1 ? [[1, 0], [2, 1], [3, 2], [4, 3]] : [[1, 0], [3, 1], [4, 2]];
      show.forEach(([v, i]) => { const isTwo = v === 2; card(cxR(i), Y, W, 50, { rx: 6, text: String(v), mono: true, fs: 18, stroke: isTwo && u > 0.8 ? BAD : INK, op: isTwo ? 1 - rm : 1 }); });
      const cxCur = u < 1.6 ? cxR(cur) : lerp(cxR(1), cxR(2), E(u, 1.6, 1.9));
      tx(cxCur, Y - 40, '▼', { 'font-size': 18, fill: ACC, 'text-anchor': 'middle' });
      note(540, 210, 'foreach (var n in nums)', 1, { class: 'mono', 'font-size': 15 });
      note(540, 240, 'n == 2 → nums.Remove(n)', fade(u, 0.8), { class: 'mono', 'font-size': 15, fill: BAD });
      mono(540, 280, `_version  ${u < 1.2 ? 4 : 5}`, { 'font-size': 18, 'font-weight': 800, fill: u < 1.2 ? INK : WARN });
      if (u > 1.2) note(700, 280, '4 → 5', fade(u, 1.2), { class: 'mono', fill: WARN });
      if (u > 1.9) { card(700, 340, 330, 44, { rx: 8, fill: BADBG, stroke: BAD, text: 'InvalidOperationException', mono: true, fs: 15, fw: 800, color: BAD, s: pop(u, 1.9) });
        sub(700, 384, 'MoveNext 가 version 이 다른 걸 알아챘다', fade(u, 2.2)); }
      return; }
    if (k === 3) { const rm = seg(u, 1.0, 1.6);
      const show = rm < 1 ? [[1, 0], [3, 1], [4, 2]] : [[1, 0], [3, 1]];
      show.forEach(([v, i]) => card(cxR(i), Y, W, 50, { rx: 6, text: String(v), mono: true, fs: 18, stroke: v === 4 && u > 0.6 ? BAD : INK, op: v === 4 ? 1 - rm : 1 }));
      sub(700, 168, '예외 직전 Remove(2) 는 이미 반영된 상태', fade(u, 0.2));
      note(540, 220, 'nums.RemoveAll(n => n % 2 == 0)', fade(u, 0.4), { class: 'mono', 'font-size': 15 });
      if (u > 1.7) card(640, 290, 180, 44, { rx: 8, text: '[1, 3]', mono: true, fs: 18, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, 1.7) });
      note(540, 360, '안에서 한 번에 처리 · 예외 없음', fade(u, 2.1), { fill: GOOD });
      return; }
    // k=4 역방향 for
    const i = u < 0.9 ? 1 : 0, rm = seg(u, 1.4, 1.9);
    const show = rm < 1 ? [[1, 0], [3, 1]] : [[3, 0]];
    show.forEach(([v, j]) => card(cxR(j), Y, W, 50, { rx: 6, text: String(v), mono: true, fs: 18, stroke: v === 1 && u > 1.0 ? BAD : INK, op: v === 1 ? 1 - rm : 1 }));
    if (u < 1.4) { tx(cxR(i), Y - 40, '▼', { 'font-size': 18, fill: ACC, 'text-anchor': 'middle' }); mono(cxR(i), Y + 46, `i = ${i}`, { 'font-size': 14, fill: ACC, 'text-anchor': 'middle' }); }
    note(540, 220, 'for (i = Count-1; i >= 0; i--)', 1, { class: 'mono', 'font-size': 15 });
    note(540, 250, 'nums[i] == 1 → RemoveAt(i)', fade(u, 0.6), { class: 'mono', 'font-size': 15 });
    if (u > 2.0) card(640, 310, 160, 44, { rx: 8, text: '[3]', mono: true, fs: 18, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, 2.0) });
    note(540, 372, '뒤에서 지우면 남은 인덱스가 안 밀린다', fade(u, 2.2), { fill: GOOD, 'font-size': 14.5 });
  }

  // ---------- 5. 선택 지도 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) {
      // 10만 칸 띠
      const x0 = 60, w = 840, y = 120;
      tx(x0, 96, 'blocked: List<string> (10만 개)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      el('rect', { x: x0, y, width: w, height: 30, rx: 4, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      for (let i = 1; i < 40; i++) el('line', { x1: x0 + i * w / 40, y1: y, x2: x0 + i * w / 40, y2: y + 30, stroke: GRID });
      const sc = k === 0 ? E(u, 0.3, 2.4) : 1;
      el('rect', { x: x0, y, width: w * sc, height: 30, rx: 4, fill: BAD, opacity: 0.25 });
      if (k === 0) { el('line', { x1: x0 + w * sc, y1: y - 6, x2: x0 + w * sc, y2: y + 36, stroke: BAD, 'stroke-width': 3 }); }
      note(x0, 196, 'List.Contains — 앞에서부터 하나씩 비교', 1, { 'font-size': 15 });
      mono(x0 + w, 196, `비교 ${fmt(100000 * sc)}`, { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
      if (k === 0) { sub(480, 260, '찾는 값이 없거나 끝에 있으면 10만 번 전부 (O(n))', fade(u, 2.2), { 'font-size': 15 }); return; }
      tx(x0, 260, 'blockedSet: HashSet<string>', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) });
      pill(140, 310, 'userId', INK, pop(u, 0.4), { mono: true });
      grow(190, 310, 280, 310, E(u, 0.6, 1.0), MUT);
      card(350, 310, 120, 40, { rx: 6, text: '해시', fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.9) });
      arc(412, 300, 560, 300, 26, E(u, 1.2, 1.6), ACC);
      card(600, 310, 70, 40, { rx: 6, text: 'b?', mono: true, stroke: ACC, s: pop(u, 1.6) });
      mono(x0 + w, 316, '비교 1', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.8) });
      sub(480, 390, 'ToHashSet() 한 번이면 이후 Contains 는 평균 O(1)', fade(u, 2.1), { 'font-size': 15 });
      return; }
    if (k === 2) { const items = [
        ['인덱스·순서', 'List<T>', (x, y, s) => cells(x - 92, y - 22, ['7', '3', '9', '1'], { w: 40, h: 40, gap: 6, fs: 15, index: true, style: () => ({ s }) })],
        ['키로 값 찾기', 'Dictionary<K,V>', (x, y, s) => { [['"kim"', '31'], ['"lee"', '27']].forEach(([a, b], i) => { card(x - 40, y - 14 + i * 44, 84, 36, { rx: 6, text: a, mono: true, fs: 14, s }); grow(x + 4, y - 14 + i * 44, x + 30, y - 14 + i * 44, s, MUT); card(x + 64, y - 14 + i * 44, 60, 36, { rx: 6, text: b, mono: true, fs: 14, s }); }); }],
        ['있나 없나', 'HashSet<T>', (x, y, s) => { el('ellipse', { cx: x, cy: y + 6, rx: 100 * s, ry: 52 * s, fill: ACCBG, stroke: ACC, 'stroke-width': 2 }); ['a', 'b', 'c'].forEach((v, i) => mono(x - 40 + i * 40, y + 12, v, { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', opacity: s })); }],
      ];
      items.forEach(([need, name, draw], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.6);
        tx(x, 70, need, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.6) });
        draw(x, 190, s);
        tx(x, 320, name, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.4 + i * 0.6) }); });
      sub(480, 390, '접근 패턴이 자료구조를 정한다', fade(u, 2.2), { 'font-size': 15 });
      return; }
    if (k === 3) {
      // Queue
      const s0 = pop(u, 0.2), s1 = pop(u, 0.9), s2 = pop(u, 1.6);
      tx(170, 70, '앞에서 꺼내기 (FIFO)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      const qs = seg(u, 0.4, 1.4);
      ['1', '2', '3'].forEach((v, i) => card(lerp(110 + i * 50, 60 + i * 50, qs), 190, 44, 44, { rx: 6, text: v, mono: true, fs: 16, s: s0, op: i === 0 ? 1 - qs : 1 }));
      card(lerp(260, 210, qs), 190, 44, 44, { rx: 6, text: '4', mono: true, fs: 16, stroke: ACC, s: s0, op: qs });
      grow(40, 240, 100, 240, s0, MUT); note(30, 268, '나감', s0, { 'font-size': 14, fill: MUT }); grow(250, 240, 300, 240, s0, ACC); note(250, 268, '들어옴', s0, { 'font-size': 14, fill: ACC });
      tx(170, 320, 'Queue<T>', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.4) });
      // Stack
      tx(480, 70, '위에서 넣고 빼기 (LIFO)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.9) });
      const ps = seg(u, 1.1, 1.6);
      ['1', '2', '3'].forEach((v, i) => card(480, 260 - i * 46, 90, 40, { rx: 6, text: v, mono: true, fs: 16, s: s1 }));
      card(480, lerp(100, 122, ps), 90, 40, { rx: 6, text: '4', mono: true, fs: 16, stroke: ACC, s: s1, op: ps });
      tx(480, 320, 'Stack<T>', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 1.1) });
      // Sorted tree
      tx(790, 70, '늘 정렬된 순회', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      [[790, 130, '20'], [720, 210, '10'], [860, 210, '30']].forEach(([x, y, v], i) => { if (i) el('line', { x1: 790, y1: 148, x2: x, y2: y - 18, stroke: MUT, 'stroke-width': 2, opacity: s2 }); card(x, y, 56, 38, { rx: 19, text: v, mono: true, fs: 15, s: s2 }); });
      mono(790, 270, '순회: 10 → 20 → 30', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(790, 320, 'SortedDictionary', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 1.8) });
      mono(790, 346, 'O(log n)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.1) });
      return; }
    // k=4 지도
    const picks = c.beat.map.picks;
    picks.forEach((p, i) => { const x = 170 + (i % 3) * 310, y = 90 + Math.floor(i / 3) * 110, s = pop(u, 0.2 + i * 0.18);
      card(x, y, 280, 90, { rx: 10, stroke: p.big.includes('log') ? WARN : ACC, sw: 2, s });
      tx(x - 126, y - 16, p.need, { 'font-size': 14, fill: MUT, opacity: s ? 1 : 0 });
      mono(x - 126, y + 12, p.pick, { 'font-size': 17, 'font-weight': 800, opacity: s ? 1 : 0 });
      mono(x - 126, y + 34, p.big, { 'font-size': 14, fill: p.big.includes('log') ? WARN : GOOD, 'font-weight': 700, opacity: s ? 1 : 0 }); });
    tx(40, 320, '자주 터지는 실수', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
    c.beat.map.fails.rows.forEach((r, i) => { note(60, 352 + i * 30, `${r.case}  →  ${r.why}`, fade(u, 1.8 + i * 0.3), { 'font-size': 14.5 }); });
  }

  const quiz = [
    { q: 'new List<int>()에 Add를 세 번 하면 Count와 Capacity는 무엇인가?',
      o: ['Count 3, Capacity 3', 'Count 3, Capacity 4', 'Count 3, Capacity 5'], a: 1,
      why: '첫 Add 때 4칸 배열이 생기고 값 세 개가 들어간다. Count는 실제 개수 _size, Capacity는 배열 길이라 3과 4다.' },
    { q: '빈 List에 1000만 개를 Add 하는 동안 Capacity가 여러 번 바뀌는 까닭은 무엇인가?',
      o: ['꽉 찰 때마다 2배 크기 새 배열을 만들고 전부 복사하기 때문이다', 'Add 할 때마다 배열을 한 칸씩 늘리기 때문이다', 'GC가 쓰지 않는 칸을 주기적으로 줄이기 때문이다'], a: 0,
      why: '배열은 크기를 못 바꾼다. 4, 8, 16 … 16,777,216까지 23번 새 배열을 만들고 복사한다. 미리 Capacity를 주면 0번이다.' },
    { q: 'cherry를 넣은 적이 없는데 apple과 같은 버킷 2를 가리킨다. TryGetValue("cherry")는 무엇을 돌려주나?',
      o: ['apple의 값 3', 'false', 'KeyNotFoundException'], a: 1,
      why: '버킷이 같아도 그 안의 키를 Equals로 비교한다. apple과 cherry는 다르므로 찾지 못하고 false를 돌려준다.' },
    { q: 'foreach로 List를 돌다 Remove를 부르면 왜 InvalidOperationException이 나나?',
      o: ['Remove가 원소를 null로 바꾸기 때문이다', '내부 version이 바뀐 것을 다음 MoveNext가 알아채기 때문이다', 'foreach는 읽기 전용 복사본을 돌기 때문이다'], a: 1,
      why: 'Remove가 version을 4에서 5로 올리고, 열거자는 시작할 때 기억한 4와 달라진 것을 보고 예외를 던진다.' },
    { q: '차단 목록 10만 개에서 사용자 id를 자주 찾는다. 알맞은 자료구조는 무엇인가?',
      o: ['List<string> 의 Contains', 'Queue<string>', 'HashSet<string> 의 Contains'], a: 2,
      why: 'List.Contains는 최악에 10만 번 비교한다. HashSet은 해시로 버킷을 계산해 평균 O(1)로 끝난다.' },
  ];

  const summary = [
    'List<T>는 배열 하나와 개수로 된다. 인덱스로 꺼내면 O(1), 가운데 끼우면 뒤를 밀어 O(n)이다.',
    '꽉 찬 List에 Add하면 2배 배열로 전부 복사한다. 1000만 개면 Capacity가 23번 바뀐다.',
    'Dictionary는 해시를 버킷 수로 나눈 나머지로 자리를 정하고, 같은 버킷 안에서는 Equals로 키를 가린다.',
    'foreach 도중 고치면 예외가 난다. 키는 record로, 멤버십 검사는 HashSet으로 바꾼다.',
  ];
  const review = [
    { q: '로그 1000만 줄을 List에 담는 배치가 느리다. 줄 수는 미리 안다. 먼저 바꿀 것은?',
      o: ['new List<string>(줄 수)로 Capacity를 미리 준다', 'List 대신 Dictionary에 담는다', 'foreach 대신 for를 쓴다'], a: 0,
      why: 'Capacity를 주지 않으면 23번 새 배열을 만들며 매번 전부 복사한다. 크기를 알면 한 번에 잡아 복사를 0번으로 만든다.' },
    { q: 'class로 만든 좌표 키로 Dictionary에 값을 넣었는데, 같은 좌표로 새로 만든 키로 찾으면 못 찾는다. 원인은?',
      o: ['버킷 수가 3개뿐이라서', 'Equals와 GetHashCode가 값이 아니라 참조로 비교해서', 'Dictionary가 넣은 순서를 지키지 않아서'], a: 1,
      why: 'class는 기본으로 참조를 비교하므로 새로 만든 객체는 다른 키다. record로 바꾸거나 두 메서드를 값 기준으로 함께 구현한다.' },
    { q: '목록에서 조건에 맞는 원소를 지우는데 예외 없이 끝내려 한다. 옳은 방법은?',
      o: ['foreach 안에서 Remove를 부른다', 'foreach 안에서 Add로 표시만 해 둔다', 'RemoveAll(조건)을 쓰거나 인덱스를 뒤에서 앞으로 돈다'], a: 2,
      why: 'foreach 중 수정은 version이 바뀌어 예외가 난다. RemoveAll은 안에서 한 번에 처리하고, 역방향 for는 지워도 남은 인덱스가 밀리지 않는다.' },
  ];

  R.page({ title: '컬렉션 속을 열어 보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
