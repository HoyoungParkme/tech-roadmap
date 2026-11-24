/* V-1-2 성능 측정과 캐시 친화성 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 측정값·체크리스트·메모리 계층·격자 크기는 STEPS 의 bench · checklist · levels · rows/cols · timing 을 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, cells, hbar, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const us = (v) => (v >= 1000 ? Math.round(v).toLocaleString('en-US') : v.toFixed(v < 10 ? 1 : 0));   // 마이크로초 표기
  const TONE = { good: GOOD, mid: WARN, bad: BAD };

  // ---------- 1. 측정 우선 ----------
  function checklist(c) { const items = c.beat.checklist || [], old = (c.prev && c.prev.checklist || []).map((x) => x.text);
    zone(30, 40, 300, 230, '벤치마크 체크리스트', { fill: SOFT });
    items.forEach((it, i) => { const isNew = !old.includes(it.text), s = isNew ? pop(c.u, 0.4) : 1, y = 92 + i * 44;
      if (isNew) el('rect', { x: 40, y: y - 18, width: 280, height: 36, rx: 6, fill: ACCBG, opacity: fade(c.u, 0.3) });
      check(60, y, 8, s); tx(80, y + 5, it.text.replace(/ → /g, ', '), { 'font-size': 13.5, 'font-weight': isNew ? 700 : 500, opacity: s }); }); }
  function runBar(x, y, w, col, s, label) { el('rect', { x, y: y - 14, width: w * s, height: 28, rx: 5, fill: col, opacity: 0.85 }); if (label) mono(x + w / 2, y + 5, label, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', opacity: s > 0.9 ? 1 : 0 }); }
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    checklist(c);
    if (k === 0) { clock(520, 150, 54, (u * 0.3) % 1, GOOD); lbl(520, 236, 'steady_clock', 1, { class: 'mono' }); sub(520, 258, '앞으로만 간다');
      clock(780, 150, 54, 0.3 - E(u, 1.2, 2.0) * 0.15, WARN); lbl(780, 236, 'system_clock', 1, { class: 'mono', fill: MUT }); sub(780, 258, '시각 보정으로 뒤로 갈 수 있다');
      grow(840, 70, 800, 70, E(u, 1.2, 1.8), BAD); cross(780, 150, 18, pop(u, 2.0)); }
    // 함수 → 결과 → sink
    if (k === 1) { card(490, 150, 190, 58, { rx: 10, text: 'sumAll(data)', mono: true, fs: 16, fw: 800, stroke: ACC, s: pop(u, 0.2) });
      grow(588, 150, 700, 150, E(u, 0.6, 1.2), ACC); mono(644, 138, 'return s', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      card(780, 150, 140, 58, { rx: 10, text: 'sink', mono: true, fs: 16, fw: 800, stroke: INK, s: pop(u, 1.2) }); sub(780, 196, 'volatile', fade(u, 1.4), { class: 'mono' });
      note(370, 262, '결과가 쓰이므로 -O2도 루프를 지우지 못한다', fade(u, 1.8), { fill: GOOD }); }
    // 실행 띠: 데이터 1,000,000개를 훑는 한 번의 실행이 막대 하나
    if (k >= 2 && k <= 4) { tx(370, 60, '실행 한 번 = data 1,000,000개 합산', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      el('line', { x1: 370, y1: 210, x2: 930, y2: 210, stroke: GRID, 'stroke-width': 2 }); tx(930, 232, '시간 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      const cold = (b.bench || []).find((x) => x.ns != null);
      if (k === 2) { runBar(380, 150, 200, WARN, E(u, 0.3, 1.2), '1회'); clock(640, 150, 22, E(u, 0.3, 1.2), WARN);
        if (cold) mono(680, 156, `${us(cold.ns / 1000)} µs ?`, { 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.3) });
        note(370, 262, '캐시가 비어 있고 OS도 끼어든다. 한 번 잰 값은 흔들린다', fade(u, 1.8), { fill: WARN }); }
      if (k >= 3) { for (let i = 0; i < 3; i++) { const s = k === 3 ? E(u, 0.3 + i * 0.4, 0.7 + i * 0.4) : 1; runBar(380 + i * 62, 150, 54, OFF, s); }
        sub(470, 186, '워밍업 3회 · 재지 않음', k === 3 ? fade(u, 1.6) : 1, { 'font-weight': 700 }); }
      if (k === 4) { const n = Math.floor(E(u, 0.3, 1.8) * 40); for (let i = 0; i < n; i++) el('rect', { x: 580 + i * 8.5, y: 138, width: 6, height: 24, rx: 2, fill: ACC, opacity: 0.85 });
        el('line', { x1: 576, y1: 116, x2: 576, y2: 196, stroke: INK, 'stroke-width': 2 }); mono(576, 108, 't0', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' });
        if (n >= 40) { el('line', { x1: 922, y1: 116, x2: 922, y2: 196, stroke: INK, 'stroke-width': 2 }); mono(922, 108, 't1', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' }); }
        sub(750, 186, '1000회를 한 구간으로', fade(u, 1.9), { 'font-weight': 700, fill: ACC }); } }
    if (k === 5) { const items = (b.bench || []).filter((x) => x.ns != null), max = Math.max(...items.map((x) => x.ns));
      tx(370, 60, '한 번 합산에 걸린 시간 (µs)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      items.forEach((it, i) => { const y = 100 + i * 70, isNew = !(p.bench || []).some((x) => x.label === it.label && x.ns != null);
        tx(370, y, it.label, { 'font-size': 15, 'font-weight': 800 }); tx(370, y + 20, it.note, { 'font-size': 13.5, fill: MUT });
        hbar(560, y - 14, 300, it.ns / 1000, max / 1000, { col: TONE[it.tone] || INK, text: us(it.ns / 1000), h: 22, u: isNew ? E(u, 0.4, 1.4) : 1 }); });
      note(370, 262, '이 PC에서 잰 값 · 기계마다 다르다', fade(u, 1.8), { fill: MUT, 'font-size': 14 });
      banner(480, 360, '어디가 느린지는 프로파일러로, 얼마나 나아졌는지는 chrono로', pop(u, 2.0)); } }

  // ---------- 2. 메모리 계층 ----------
  function line16(x, y, o) { o = o || {}; const w = 36;
    for (let i = 0; i < 16; i++) { const st = (o.style && o.style(i)) || {}; el('rect', { x: x + i * (w + 3), y, width: w, height: 30, rx: 4, fill: st.fill || PANEL, stroke: st.stroke || GRID, 'stroke-width': st.sw || 1.5, opacity: st.op ?? 1 });
      if (o.label) mono(x + i * (w + 3) + w / 2, y + 20, o.label(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: st.color || MUT, 'font-weight': 700, opacity: st.op ?? 1 }); } }
  function s2(t, c) { const { k, u } = c, lv = c.beat.levels || [], n0 = (c.prev && c.prev.levels || []).length;
    tx(560, 34, '접근 지연 (막대는 상대 길이)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    lv.forEach((L, i) => { const y = 66 + i * 54, isNew = i >= n0, s = isNew ? E(u, 0.2, 0.9) : 1, w = 110 + i * 84, col = L.tone === 'top' ? GOOD : L.tone === 'bot' ? BAD : WARN;
      el('path', { d: `M${265 - w / 2},${y + 22} L${265 - w / 2 + 14},${y - 22} L${265 + w / 2 - 14},${y - 22} L${265 + w / 2},${y + 22} Z`, fill: isNew ? ACCBG : PANEL, stroke: col, 'stroke-width': 2, opacity: s });
      tx(265, y - 1, L.name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); mono(265, y + 17, L.size, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s });
      el('rect', { x: 560, y: y - 10, width: 300 * (L.bar / 100) * s, height: 20, rx: 4, fill: col, opacity: 0.85 });
      mono(560 + 300 * (L.bar / 100) * s + 8, y + 6, L.latency, { 'font-size': 14, 'font-weight': 700, opacity: s }); });
    if (k >= 1) { const s = k === 1 ? E(u, 0.8, 1.6) : 1; tx(40, 352, '캐시 라인 64B', { 'font-size': 14, 'font-weight': 700, opacity: s });
      const st = (i) => { if (k <= 2) return { op: k === 1 ? clamp(s * 16 - i) : 1 };
        if (k === 3) { const on = i === 0 || E(u, 0.6, 1.4) * 15 >= i; return { fill: i === 0 ? ACC : on ? ACCBG : PANEL, stroke: on ? ACC : GRID, color: i === 0 ? PANEL : INK }; }
        const at = Math.floor(E(u, 0.3, 2.2) * 16); return { fill: i > at ? PANEL : i === 0 ? BADBG : GOODBG, stroke: i > at ? GRID : i === 0 ? BAD : GOOD, color: INK }; };
      line16(178, 334, { style: st, label: k >= 2 ? (i) => (k >= 3 ? String(i) : 'int') : null });
      if (k === 2) note(178, 392, '4바이트 int가 정확히 16개 들어간다', fade(u, 1.0), { 'font-size': 14 });
      if (k === 3) { note(178, 392, 'arr[0] 하나를 읽었는데 arr[0..15]가 함께 올라온다', fade(u, 1.5), { 'font-size': 14, fill: ACC }); }
      if (k === 4) { const at = Math.min(15, Math.floor(E(u, 0.3, 2.2) * 16));
        el('path', { d: `M${178 + at * 39 + 18},328 l-6,-9 h12 z`, fill: INK });
        note(178, 392, `미스 1 · 히트 ${at}`, 1, { 'font-size': 15, class: 'mono', fill: at ? GOOD : BAD }); note(380, 392, '첫 접근만 RAM까지 내려간다', fade(u, 2.2), { 'font-size': 14 }); } } }

  // ---------- 3. vector vs list ----------
  const HEAP = [[3, 1], [11, 2], [6, 0], [1, 2], [13, 1], [8, 2], [4, 0], [10, 1]];   // list 노드가 흩어진 칸 (열, 행) — 그림용 배치
  function memGrid(x, y, cw, ch, cols, rows) { for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) el('rect', { x: x + q * cw, y: y + r * ch, width: cw - 3, height: ch - 3, rx: 3, fill: SOFT }); }
  function s3(t, c) { const { k, u } = c, tm = c.beat.timing;
    const VX = 340, VY = 70, CW = 36;
    tx(40, 92, 'std::vector', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: ACC }); sub(40, 114, '원소가 한 줄로 붙어 있다', 1, { 'text-anchor': 'start' });
    tx(40, 242, 'std::list', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: BAD }); sub(40, 264, '노드가 힙 여기저기에', 1, { 'text-anchor': 'start' });
    // vector: 한 줄
    for (let i = 0; i < 16; i++) el('rect', { x: VX + i * CW, y: VY, width: CW - 3, height: 34, rx: 4, fill: k >= 3 ? GOODBG : ACCBG, stroke: ACC, 'stroke-width': 1.5 });
    if (k >= 3) { el('path', { d: `M${VX},${VY + 44} v8 h${16 * CW - 3} v-8`, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: k === 3 ? fade(u, 0.3) : 1 });
      sub(VX + 8 * CW, VY + 72, '캐시 라인 하나에 16개 · 히트', k === 3 ? fade(u, 0.5) : 1, { fill: GOOD, 'font-weight': 700 }); }
    // list: 힙 격자 위 흩어진 노드
    const HX = 340, HY = 170, HW = 38, HH = 40, HR = 3;
    memGrid(HX, HY, HW, HH, 15, HR);
    const pos = HEAP.map(([q, r]) => [HX + q * HW + 17, HY + r * HH + 18]);
    pos.forEach(([x, y], i) => { if (i) el('line', { x1: pos[i - 1][0], y1: pos[i - 1][1], x2: x, y2: y, stroke: BAD, 'stroke-width': 1.6, opacity: 0.6, 'marker-end': 'url(#ra-ahr)' });
      el('rect', { x: x - 15, y: y - 15, width: 30, height: 30, rx: 5, fill: BADBG, stroke: BAD, 'stroke-width': k >= 3 ? 2.4 : 1.6 }); });
    if (k === 3) sub(HX + 285, HY + 146, '노드마다 다른 캐시 라인 · 미스', fade(u, 0.8), { fill: BAD, 'font-weight': 700 });
    // 두 커서가 같은 for 문으로 동시에 걷는다
    if (k >= 1 && k <= 3) { const f = (u / 3 * 1.4) % 1;
      dot([[VX + 17, VY + 17], [VX + 15 * CW + 17, VY + 17]], f, INK, 7);
      dot(pos, f, INK, 7); }
    if (k === 0) { pill(100, 150, '순회 O(n)', MUT, pop(u, 0.5), { mono: true }); pill(100, 300, '순회 O(n)', MUT, pop(u, 0.8), { mono: true });
      note(40, 370, '빅오는 같다', fade(u, 1.2)); }
    if (k === 1) R.snippet(30, 300, ['template <class C>', 'for (int x : c) s += x;'], { op: fade(u, 0.2), fs: 14 });
    if (k === 2) { clock(64, 330, 20, (u / 3) % 1, ACC); mono(96, 336, 't0 → t1 (µs)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      note(40, 384, '같은 잣대로 두 번 잰다', fade(u, 1.0)); }
    if (k === 3) { card(150, 330, 220, 44, { rx: 8, stroke: BAD, sw: 1.6, s: pop(u, 1.2) }); mono(150, 335, 'prev | 값 | next', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      note(40, 384, '값 4B에 포인터 16B가 붙는다', fade(u, 1.6), { fill: BAD, 'font-size': 14 }); }
    if (k === 4 && tm) { zone(30, 300, 900, 108, null, { fill: PANEL, stroke: GRID, sw: 1.5 });
      const max = Math.max(tm.vector, tm.list);
      [['vector', tm.vector, GOOD], ['list', tm.list, BAD]].forEach(([n, v, col], i) => { const y = 322 + i * 40;
        mono(50, y + 14, n, { 'font-size': 15, 'font-weight': 800, fill: col }); hbar(130, y, 560, v, max, { col, h: 22, text: us(v) + ' µs', u: E(u, 0.3 + i * 0.4, 1.4 + i * 0.4) }); });
      mono(920, 336, `× ${(tm.list / tm.vector).toFixed(1)}`, { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.9) });
      sub(860, 396, '이 PC 실측 · 원소 1000만 개', fade(u, 2.0)); } }

  // ---------- 4. 행 우선 vs 열 우선 ----------
  function s4(t, c) { const { k, u } = c, rows = c.beat.rows || 1, cols = c.beat.cols || 8, prow = (c.prev && c.prev.rows) || 0;
    const GX = 60, GY = 70, GS = 40;
    tx(GX, 52, `m[i][j]  (그림은 ${cols}열 · 실제 N = 4096)`, { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' });
    for (let r = 0; r < rows; r++) { const s = r >= prow ? pop(u, 0.2 + (r - prow) * 0.2) : 1;
      for (let q = 0; q < cols; q++) card(GX + q * GS + GS / 2, GY + r * GS + GS / 2, GS - 4, GS - 4, { rx: 4, text: `${r},${q}`, fs: 13.5, mono: true, fw: 600, stroke: GRID, sw: 1.4, fill: [ACCBG, INFOBG, WARNBG, GOODBG][r], s }); }
    // 아래: 1차원 메모리
    const n = rows * cols, MW = Math.min(28, 880 / n), MY = 280;
    tx(GX, MY + 70, '메모리 (주소 순서)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), s = r >= prow ? E(u, 0.5, 1.2) : 1;
      el('rect', { x: GX + i * MW, y: MY, width: MW - 2, height: 30, rx: 3, fill: [ACCBG, INFOBG, WARNBG, GOODBG][r], stroke: GRID, 'stroke-width': 1.2, opacity: s }); }
    if (k === 0) { grow(GX + cols * GS / 2, GY + GS + 6, GX + cols * MW / 2, MY - 6, E(u, 0.8, 1.6), ACC); note(GX + cols * GS + 30, GY + 26, '한 행 = 메모리의 연속 한 줄', fade(u, 1.6)); return; }
    const route = (order) => order.map((i) => [GX + i * MW + MW / 2 - 1, MY + 15]);
    const rowOrder = [...Array(n).keys()], colOrder = []; for (let q = 0; q < cols; q++) for (let r = 0; r < rows; r++) colOrder.push(r * cols + q);
    if (k === 1 || k === 2) { const ord = k === 1 ? rowOrder : colOrder, f = E(u, 0.3, 2.5), at = Math.min(n - 1, Math.floor(f * n));
      for (let j = 1; j <= at; j++) { const a = ord[j - 1], b = ord[j];
        if (k === 2) el('path', { d: `M${GX + a * MW + MW / 2},${MY} Q${GX + (a + b) / 2 * MW + MW / 2},${MY - 40 - Math.abs(b - a) * 2} ${GX + b * MW + MW / 2},${MY}`, fill: 'none', stroke: BAD, 'stroke-width': 1.6, opacity: 0.7 });
        else el('line', { x1: GX + a * MW + MW / 2, y1: MY + 40, x2: GX + b * MW + MW / 2, y2: MY + 40, stroke: GOOD, 'stroke-width': 3 }); }
      const cur = ord[at]; el('circle', { cx: GX + cur * MW + MW / 2 - 1, cy: MY + 15, r: 7, fill: INK });
      const gr = Math.floor(cur / cols), gq = cur % cols; el('rect', { x: GX + gq * GS, y: GY + gr * GS, width: GS - 4, height: GS - 4, rx: 4, fill: 'none', stroke: INK, 'stroke-width': 3 });
      mono(GX + cols * GS + 30, GY + 26, k === 1 ? 'for i { for j { … } }' : 'for j { for i { … } }', { 'font-size': 15, 'font-weight': 800, fill: k === 1 ? GOOD : BAD });
      note(GX + cols * GS + 30, GY + 58, k === 1 ? '주소가 1칸씩 → 라인 하나로 16개 히트' : `주소가 N칸씩 점프 → 접근마다 새 라인`, fade(u, 0.6), { fill: k === 1 ? GOOD : BAD });
      if (k === 2) note(GX + cols * GS + 30, GY + 86, '실제로는 N × 4B = 16KB씩 건너뛴다', fade(u, 1.4), { 'font-size': 14, fill: MUT });
      return; }
    const tm = c.beat.timing; if (!tm) return; const max = Math.max(tm.row, tm.col);
    [['행 우선', tm.row, GOOD], ['열 우선', tm.col, BAD]].forEach(([nm, v, col], i) => { const y = 360 + i * 30;
      tx(GX, y + 14, nm, { 'font-size': 15, 'font-weight': 800, fill: col }); hbar(GX + 80, y, 560, v, max, { col, h: 20, text: v.toFixed(1) + ' ms', u: E(u, 0.3 + i * 0.4, 1.4 + i * 0.4) }); });
    mono(GX + cols * GS + 30, GY + 26, `같은 합, × ${(tm.col / tm.row).toFixed(1)}`, { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
    sub(GX + cols * GS + 130, GY + 56, '이 PC 실측 · N = 4096', fade(u, 2.0)); }

  // ---------- 5. AoS · SoA · false sharing ----------
  const AOS = ['x', 'y', 'z', 'm'];
  function s5(t, c) { const { k, u } = c, LX = 190;
    if (k <= 2) { tx(40, 66, '캐시 라인 64B', { 'font-size': 15, 'font-weight': 800 }); sub(40, 88, 'float 16칸', 1, { 'text-anchor': 'start' });
      line16(LX, 50, { style: (i) => ({ op: k === 0 ? clamp(E(u, 0.2, 1.2) * 16 - i) : 1 }), label: () => '4B' });
      if (k === 0) note(LX, 128, '무엇을 이 16칸에 담느냐가 이 장면의 문제다', fade(u, 1.5)); }
    if (k >= 1 && k <= 2) { const y = 160, s = k === 1 ? 1 : 1;
      tx(40, y + 20, 'AoS', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: WARN });
      line16(LX, y, { style: (i) => { const f = AOS[i % 4], on = f === 'x', vis = k === 1 ? clamp(E(u, 0.2, 1.2) * 16 - i) : 1; return { fill: on ? ACC : SOFT, stroke: on ? ACC : GRID, color: on ? PANEL : OFF, op: vis }; }, label: (i) => AOS[i % 4] + (i >> 2) });
      for (let p = 0; p < 4; p++) el('path', { d: `M${LX + p * 156},${y + 38} v6 h153 v-6`, fill: 'none', stroke: MUT, 'stroke-width': 1.5, opacity: k === 1 ? fade(u, 1.3) : 1 });
      mono(LX + 640, y + 20, '16B / 64B', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: k === 1 ? fade(u, 1.6) : 1 });
      if (k === 1) note(LX, y + 78, 'Particle 4개가 한 라인에 · x만 훑어도 y·z·mass가 같이 실린다', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 2) { const y = 260;
      tx(40, y + 20, 'SoA', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: GOOD });
      line16(LX, y, { style: (i) => ({ fill: ACC, stroke: ACC, color: PANEL, op: clamp(E(u, 0.3, 1.3) * 16 - i) }), label: (i) => 'x' + i });
      mono(LX + 640, y + 20, '64B / 64B', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      note(LX, y + 78, 'x만 모은 배열 · 라인을 다 쓰고 SIMD도 붙는다', fade(u, 1.8), { 'font-size': 14 }); }
    if (k >= 3) { // 두 코어, 각자의 L1, 공유 라인
      const cores = [[240, '코어 0', 'a'], [720, '코어 1', 'b']], good = k === 4;
      cores.forEach(([x, name, v], i) => { card(x, 70, 150, 46, { rx: 8, text: name, fs: 16, fw: 800 });
        mono(x, 118, `스레드 ${i + 1}: ${v}++`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
        zone(x - 170, 140, 340, good ? 150 : 90, 'L1', { fill: SOFT });
        const lines = good ? [0, 1] : [0];
        lines.forEach((li) => { const y = 176 + li * 56; for (let j = 0; j < 7; j++) { const own = good ? (li === i && j === 0) : (j === i);
            const hit = !good && (Math.floor(t * 1.2) % 2 !== i), slot = good ? (li === 0 && j === 0 ? 'a' : li === 1 && j === 0 ? 'b' : '') : j === 0 ? 'a' : j === 1 ? 'b' : '';
            el('rect', { x: x - 156 + j * 39, y, width: 36, height: 34, rx: 4, fill: !good && hit ? BADBG : own ? ACCBG : PANEL, stroke: !good && hit ? BAD : own ? ACC : GRID, 'stroke-width': 1.5, opacity: good && li !== i ? 0.35 : 1 });
            if (slot) mono(x - 138 + j * 39, y + 22, slot, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: good && li !== i ? 0.35 : 1 }); }
          if (good) mono(x + 168, y + 22, `라인 ${li + 1}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: li === i ? 1 : 0.4 }); }); });
      if (!good) { for (let j = 0; j < 3; j++) { dot([[410, 193], [550, 193]], ((t * 0.8 + j / 3) % 1), BAD, 5); dot([[550, 213], [410, 213]], ((t * 0.8 + j / 3 + 0.5) % 1), BAD, 5); }
        mono(480, 252, '무효화 ↔ 무효화', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
        mono(480, 290, 'struct Bad { long a; long b; };', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.2) });
        note(480, 330, 'a와 b는 다른 변수인데 같은 64B 라인에 있다', fade(u, 1.2), { 'text-anchor': 'middle', fill: BAD });
        note(480, 360, '한쪽이 쓸 때마다 상대 코어의 라인이 무효가 된다', fade(u, 1.8), { 'text-anchor': 'middle' }); }
      else { check(480, 210, 14, pop(u, 1.0)); mono(480, 330, 'alignas(64) long a;  alignas(64) long b;', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.2) });
        note(480, 362, '라인이 갈라져 서로 건드리지 않는다', fade(u, 1.3), { 'text-anchor': 'middle', fill: GOOD });
        banner(480, 400, '함께 쓰는 것은 붙이고, 따로 쓰는 것은 뗀다', pop(u, 2.0)); } } }

  // ---------- 6. 실패 사례 ----------
  const P6 = ['측정 없이 최적화', 'list 남용', '열 우선 순회', 'false sharing'];
  function s6(t, c) { const { k, u } = c;
    lbl(480, 34, `실패 ${k + 1} / 4 · ${P6[k]}`, 1, { 'font-size': 17 });
    if (k === 0) { const fns = [['parse()', 0.18], ['render()', 0.12], ['sumAll()', 0.62], ['log()', 0.08]];
      tx(80, 78, '프로파일러가 보여 준 시간 비중 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      fns.forEach(([n, v], i) => { const y = 110 + i * 54; mono(80, y + 15, n, { 'font-size': 15, 'font-weight': 700 });
        hbar(200, y, 420, v, 1, { col: i === 2 ? BAD : OFF, h: 22, text: '', label: false, u: E(u, 0.9, 1.8) }); });
      pill(760, 128, '직감: 여기가 느릴 거야', WARN, pop(u, 0.3), { fs: 14 }); grow(660, 128, 360, 121, E(u, 0.4, 0.9), WARN);
      pill(760, 236, '실제 핫스팟', BAD, pop(u, 1.9), { fs: 14 }); grow(680, 236, 640, 229, E(u, 2.0, 2.3), BAD);
      note(80, 370, '안 느린 곳을 고치면 코드만 복잡해지고 시간은 그대로다', fade(u, 2.2)); return; }
    if (k === 1) { const f = E(u, 0.6, 2.0);
      HEAP.forEach(([q, r], i) => { const x0 = 300 + q * 34, y0 = 90 + r * 36, x1 = 200 + i * 40, y1 = 300, x = lerp(x0, x1, f), y = lerp(y0, y1, f);
        el('rect', { x: x - 16, y: y - 16, width: 34, height: 34, rx: 5, fill: f > 0.95 ? GOODBG : BADBG, stroke: f > 0.95 ? GOOD : BAD, 'stroke-width': 1.8 }); });
      mono(200, 360, 'std::list<int>  →  std::vector<int>', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
      note(560, 306, '흩어진 노드를 한 줄로', fade(u, 2.1), { fill: GOOD }); return; }
    if (k === 2) { const sw = E(u, 0.5, 1.6), lineY = (a) => lerp(a === 0 ? 120 : 160, a === 0 ? 160 : 120, sw);
      mono(120, lineY(0), 'for (int j = 0; j < N; ++j)', { 'font-size': 17, 'font-weight': 800, fill: lerp(0, 1, sw) > 0.5 ? INK : BAD });
      mono(120, lineY(1), 'for (int i = 0; i < N; ++i)', { 'font-size': 17, 'font-weight': 800, fill: sw > 0.5 ? GOOD : INK });
      mono(150, 200, '    sum += m[i * N + j];', { 'font-size': 17 });
      for (let i = 0; i < 24; i++) el('rect', { x: 120 + i * 30, y: 260, width: 27, height: 30, rx: 3, fill: SOFT, stroke: GRID });
      const after = u > 1.6, f = after ? E(u, 1.7, 2.8) : E(u, 0, 1.4), n = Math.floor(f * 24);
      for (let j = 1; j <= n && j < 24; j++) { const a = after ? j - 1 : ((j - 1) % 4) * 6 + Math.floor((j - 1) / 4), b = after ? j : (j % 4) * 6 + Math.floor(j / 4);
        if (after) el('line', { x1: 133 + a * 30, y1: 304, x2: 133 + b * 30, y2: 304, stroke: GOOD, 'stroke-width': 3 });
        else el('path', { d: `M${133 + a * 30},258 Q${133 + (a + b) * 15},${220} ${133 + b * 30},258`, fill: 'none', stroke: BAD, 'stroke-width': 1.5, opacity: 0.7 }); }
      note(120, 350, '알고리즘도 자료구조도 그대로, 두 줄의 순서만 바꾼다', fade(u, 2.2)); return; }
    // k3: Bad → Good
    const sp = E(u, 0.8, 1.8);
    mono(120, 100, sp < 0.5 ? 'struct Bad { long a, b; };' : 'struct Good { alignas(64) long a; alignas(64) long b; };', { 'font-size': 16, 'font-weight': 800, fill: sp < 0.5 ? BAD : GOOD });
    for (let li = 0; li < 2; li++) for (let j = 0; j < 8; j++) el('rect', { x: 120 + j * 44, y: 150 + li * 60, width: 40, height: 40, rx: 4, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(500, 176, '라인 1', { 'font-size': 14, fill: MUT }); mono(500, 236, '라인 2', { 'font-size': 14, fill: MUT });
    card(140, 170, 40, 40, { rx: 4, text: 'a', mono: true, fs: 16, fw: 800, stroke: ACC, fill: ACCBG });
    card(lerp(184, 140, sp), lerp(170, 230, sp), 40, 40, { rx: 4, text: 'b', mono: true, fs: 16, fw: 800, stroke: sp > 0.95 ? GOOD : BAD, fill: sp > 0.95 ? GOODBG : BADBG });
    note(620, 190, sp > 0.95 ? '서로 다른 라인 · 충돌 없음' : '같은 라인 · 코어끼리 충돌', 1, { fill: sp > 0.95 ? GOOD : BAD });
    banner(480, 360, '재고, 붙여 놓고, 놓인 순서로 읽고, 스레드 데이터는 뗀다', pop(u, 2.1)); }

  const quiz = [
    { q: '벤치마크에서 sumAll의 결과를 sink에 더해 두는 이유는 무엇인가?',
      o: ['결과를 아무도 쓰지 않으면 -O2가 루프를 통째로 지운다', '합계를 화면에 보여 주려고', 'sink가 있어야 steady_clock이 움직인다'], a: 0,
      why: '쓰이지 않는 계산은 최적화 빌드에서 사라지고, 그러면 0ns 같은 착시가 나온다. 결과를 써야 측정할 일이 남는다.' },
    { q: 'int 배열에서 arr[0]을 읽으면 캐시에는 무엇이 올라오는가?',
      o: ['arr[0] 4바이트만', 'arr[0]부터 arr[15]까지 64바이트 한 라인', '배열 전체'], a: 1,
      why: '캐시는 64바이트 라인 단위로 움직인다. int 16개가 함께 올라와 다음 15번 접근은 L1 히트가 된다.' },
    { q: 'vector와 list 순회가 둘 다 O(n)인데 시간이 크게 다른 이유는 무엇인가?',
      o: ['list의 for 문 코드가 더 길어서', 'vector가 원소를 압축해 저장해서', 'list 노드가 힙에 흩어져 원소마다 새 캐시 라인을 불러서'], a: 2,
      why: '코드는 같은 템플릿이다. 이 PC에서 1000만 개 합이 vector 약 2,000µs, list 약 110,000µs였고 차이는 메모리 배치에서 왔다.' },
    { q: '행 우선으로 저장된 m[i * N + j]를 빠르게 훑으려면 안쪽 루프 변수는 무엇이어야 하는가?',
      o: ['j', 'i', '어느 쪽이든 같다'], a: 0,
      why: 'j가 1 늘면 주소도 1칸이라 라인을 다 쓴다. i가 안쪽이면 접근마다 16KB를 건너뛰어 이 PC에서 약 40배 느렸다.' },
    { q: '두 스레드가 서로 다른 변수 a, b를 고치는데 코어를 늘려도 빨라지지 않는다. 원인은 무엇인가?',
      o: ['a와 b가 SoA로 저장돼 있다', 'a와 b가 같은 64B 캐시 라인에 있어 서로의 라인을 무효화한다', '스레드가 두 개뿐이라서'], a: 1,
      why: 'false sharing이다. 공유되는 것은 변수가 아니라 캐시 라인이라 alignas(64)로 라인을 갈라야 한다.' },
    { q: '느린 프로그램을 고치기 전에 가장 먼저 할 일은 무엇인가?',
      o: ['의심 가는 함수를 바로 다시 짠다', 'list를 전부 vector로 바꾼다', '프로파일러로 실제 핫스팟을 찾는다'], a: 2,
      why: '직감이 고른 자리는 대개 병목이 아니다. 핫스팟을 찾아 고치고 chrono로 전후를 비교해야 효과를 숫자로 말할 수 있다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    '성능은 직감이 아니라 측정으로 본다. 워밍업 뒤 여러 번 재고, 결과를 써서 최적화가 지우지 못하게 한다.',
    'CPU는 데이터를 64바이트 라인 단위로 가져온다. int 하나를 읽으면 이웃 15개가 함께 올라온다.',
    '연속 배치와 저장 순서대로의 순회가 라인을 다 쓴다. 이 PC에서 list 순회와 열 우선 순회는 수십 배 느렸다.',
    '한 필드만 훑을 때는 SoA로 모으고, 스레드별 변수는 alignas(64)로 다른 라인에 둔다.',
  ];
  const review = [
    { q: '1000만 개를 list에 담아 합만 구하는 코드가 느리다. 가장 먼저 해 볼 만한 것은?',
      o: ['vector로 바꾸고 전후를 chrono로 잰다', 'list에 reserve를 호출한다', '스레드를 더 만든다'], a: 0,
      why: '순회만 하는 데이터라면 연속 배치가 캐시 라인을 다 쓴다. 바꾼 뒤에는 같은 하네스로 재서 효과를 확인한다.' },
    { q: '행렬 합 함수를 고쳤더니 벤치마크가 0ns로 나왔다. 먼저 의심할 것은?',
      o: ['캐시 히트율이 100%가 됐다', '결과를 쓰지 않아 컴파일러가 루프를 지웠다', 'steady_clock이 뒤로 갔다'], a: 1,
      why: '쓰이지 않는 계산은 -O2에서 사라진다. 합을 sink에 넣거나 출력해 결과를 소비해야 진짜 시간이 잡힌다.' },
    { q: '파티클 100만 개의 x만 갱신하는 루프가 느리다. Particle은 {x, y, z, mass}다. 고칠 방향은?',
      o: ['Particle에 alignas(64)를 붙인다', 'list<Particle>로 바꾼다', 'x만 모은 배열로 쪼개 SoA로 바꾼다'], a: 2,
      why: 'AoS에서는 라인 64B 중 x가 16B뿐이다. SoA로 x만 모으면 라인 전체가 x라 대역폭을 다 쓴다.' },
  ];

  R.page({ title: '캐시와 측정', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
