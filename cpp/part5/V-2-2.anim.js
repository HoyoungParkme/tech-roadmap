/* V-2-2 종합: 벤치마크로 배우는 최적화 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 측정 원칙·표본·측정 막대·함정은 STEPS 의 method · sample · bench · pitfalls 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, hbar, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const TONE = { good: GOOD, mid: WARN, bad: BAD };
  const fms = (v) => (v >= 10 ? String(Math.round(v)) : v >= 0.1 ? String(+v.toFixed(2)) : String(v));
  // 측정 막대: bench.bars 를 위에서부터, 새로 생긴 막대는 자란다
  function benchBars(x, y, w, c, o) { o = o || {}; const b = c.beat.bench || {}, bars = b.bars || [], old = ((c.prev && c.prev.bench && c.prev.bench.bars) || []).map((q) => q.label);
    const max = o.max || b.max || Math.max(...bars.map((q) => q.ms));
    bars.forEach((q, i) => { const yy = y + i * 52, isNew = !old.includes(q.label), col = TONE[q.tone] || INK;
      tx(x, yy, q.label, { 'font-size': 14, 'font-weight': 800, fill: col });
      hbar(x, yy + 8, w, q.ms, max, { col, h: 20, text: fms(q.ms) + ' ' + (b.unit || 'ms'), u: isNew ? E(c.u, 0.4, 1.4) : 1 }); });
    return bars; }

  // ---------- 1. 측정 하네스 ----------
  function s1(t, c) { const { k, u } = c, sm = c.beat.sample || { warm: [] }, ws = sm.warm, ow = ((c.prev && c.prev.sample) || { warm: [] }).warm.length;
    const method = c.beat.method || [], oldM = ((c.prev && c.prev.method) || []).length;
    // 왼쪽: 회차별 1회 시간 (예시 값)
    const ax = R.axes(80, 70, 380, 190, { x: [0, 5.5], y: [0, 200], yt: [0, 100, 200], grid: true });
    tx(70, 54, 'ns (예시 값)', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); tx(505, 281, '회차', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
    ws.forEach((v, i) => { const isNew = i >= ow, g = isNew ? E(u, 0.3 + (i - ow) * 0.3, 1.0 + (i - ow) * 0.3) : 1, x = ax.X(i + 1), top = ax.Y(v * g), cold = i === 0;
      el('rect', { x: x - 22, y: top, width: 44, height: ax.Y(0) - top, rx: 4, fill: cold ? BAD : GOOD, opacity: cold && k >= 2 ? 0.35 : 0.85 });
      mono(x, top - 8, String(v), { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', opacity: g > 0.95 ? 1 : 0, fill: cold ? BAD : INK });
      mono(x, ax.Y(0) + 20, String(i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
    if (k >= 2) { cross(ax.X(1), ax.Y(91), 12, k === 2 ? pop(u, 1.4) : 1); sub(ax.X(1) + 30, ax.Y(0) + 42, '1회차는 워밍업 · 버림', k === 2 ? fade(u, 1.5) : 1, { fill: BAD, 'font-weight': 700 }); }
    if (k === 0) { clock(ax.X(1) + 60, ax.Y(150), 18, E(u, 0.2, 1.0), WARN); }
    if (k === 5) { el('line', { x1: ax.X(1.5), y1: ax.Y(90), x2: ax.X(5.4), y2: ax.Y(90), stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.5) });
      mono(ax.X(5.4) + 6, ax.Y(90) + 5, '≈ 90', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.8) }); }
    // 오른쪽: 이 beat 의 장치
    const RX = 520;
    if (k === 0) { pill(720, 110, '#include <chrono>', INFO, pop(u, 0.3), { mono: true, fs: 15 }); note(RX, 180, '한 번만 재 본 값은 캐시가 식은 상태다', fade(u, 1.0)); note(RX, 210, '이 숫자로 무엇을 판단하면 안 된다', fade(u, 1.4), { fill: BAD }); }
    if (k === 1) { card(720, 110, 380, 56, { rx: 10, text: 'benchmark(fn, iters, warmup)', mono: true, fs: 16, fw: 800, stroke: ACC, s: pop(u, 0.2) });
      [['iters = 1,000,000', 600], ['warmup = 3', 830]].forEach(([s, x], i) => { grow(x, 140, x, 172, E(u, 0.8 + i * 0.3, 1.2 + i * 0.3), ACC); pill(x, 190, s, ACC, pop(u, 1.1 + i * 0.3), { mono: true, fs: 14 }); });
      note(RX, 250, '측정 규칙을 인자로 빼서 어떤 코드든 같은 잣대로 잰다', fade(u, 1.9), { 'font-size': 14 }); }
    if (k === 2) { mono(RX, 110, 'for (i < warmup) fn();', { 'font-size': 16, 'font-weight': 800 }); note(RX, 150, '캐시·분기 예측을 데우는 실행', fade(u, 0.6)); note(RX, 180, '측정 구간에는 넣지 않는다', fade(u, 1.0), { fill: GOOD }); }
    if (k === 3) { const n = Math.floor(E(u, 0.3, 2.0) * 30);
      el('line', { x1: RX + 10, y1: 90, x2: RX + 10, y2: 160, stroke: INK, 'stroke-width': 2.5 }); mono(RX + 10, 80, 't0', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' });
      for (let i = 0; i < n; i++) el('rect', { x: RX + 22 + i * 12, y: 110, width: 8, height: 30, rx: 2, fill: ACC, opacity: 0.85 });
      if (n >= 30) { el('line', { x1: RX + 390, y1: 90, x2: RX + 390, y2: 160, stroke: INK, 'stroke-width': 2.5 }); mono(RX + 390, 80, 't1', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' }); }
      mono(RX + 200, 186, 'fn() × iters', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      note(RX, 230, 'steady_clock 은 앞으로만 간다', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 4) { mono(RX + 10, 120, '(t1 - t0) ns', { 'font-size': 20, 'font-weight': 800 }); el('line', { x1: RX, y1: 136, x2: RX + 200, y2: 136, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.4) });
      mono(RX + 40, 166, 'iters', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 0.6) }); mono(RX + 230, 146, '= 1회 평균', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) });
      note(RX, 220, '한 번의 흔들림이 백만 분의 일로 묻힌다', fade(u, 1.6), { 'font-size': 14 }); }
    if (k === 5) { note(RX, 110, '1회차만 유독 느리다', fade(u, 0.4), { fill: BAD }); note(RX, 140, '2회차부터 90ns대로 모인다', fade(u, 0.8), { fill: GOOD });
      note(RX, 190, '빈 람다를 넣으면 이 PC에서 0 ns/op', fade(u, 1.4), { 'font-size': 14, fill: MUT }); note(RX, 214, '지워진 코드는 잴 수 없다 (5단계)', fade(u, 1.6), { 'font-size': 14, fill: MUT }); }
    // 아래: 원칙 칩
    method.forEach((m, i) => { const x = 40 + i * 300, s = i >= oldM ? pop(u, 0.5) : 1;
      card(x + 140, 368, 284, 64, { rx: 10, stroke: GOOD, sw: 2, s, fill: i >= oldM ? GOODBG : PANEL });
      tx(x + 14, 362, m.key, { 'font-size': 14.5, 'font-weight': 800, opacity: s }); tx(x + 14, 386, m.good, { 'font-size': 13.5, fill: MUT, opacity: s }); }); }

  // ---------- 2. 행 우선 vs 열 우선 ----------
  const GC = 16, GR = 6, CS = 22, GX = 40, GY = 80;
  function grid(state) { for (let r = 0; r < GR; r++) for (let q = 0; q < GC; q++) { const st = state(r, q) || {};
      el('rect', { x: GX + q * CS, y: GY + r * CS, width: CS - 2, height: CS - 2, rx: 3, fill: st.fill || SOFT, stroke: st.stroke || 'none', 'stroke-width': 1.5, opacity: st.op ?? 1 }); }
    for (let r = 0; r < GR; r++) el('rect', { x: GX - 3, y: GY + r * CS - 2, width: GC * CS + 4, height: CS + 2, rx: 4, fill: 'none', stroke: GRID, 'stroke-width': 1.2 }); }
  function s2(t, c) { const { k, u } = c;
    tx(GX, 54, 'm 의 왼쪽 위 일부 · 한 줄 = int 16개 = 캐시 라인 64B', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const total = GR * GC;
    if (k === 0) grid((r, q) => ({ op: clamp(E(u, 0.2, 1.6) * GR - r) }));
    if (k === 1 || k === 3) { grid(() => ({}));
      if (k === 1) { grow(GX, GY + 11, GX + GC * CS - 6, GY + 11, E(u, 0.4, 1.4), GOOD); note(GX, GY + GR * CS + 40, '안쪽 루프 j: 주소가 +1씩', fade(u, 1.2), { fill: GOOD }); }
      else { grow(GX + 10, GY, GX + 10, GY + GR * CS - 4, E(u, 0.4, 1.4), BAD); note(GX, GY + GR * CS + 40, '안쪽 루프 i: 주소가 +N(4KB)씩', fade(u, 1.2), { fill: BAD }); } }
    if (k === 2) { const n = Math.floor(E(u, 0.2, 2.6) * total);
      grid((r, q) => { const i = r * GC + q; return i < n ? { fill: GOODBG, stroke: GOOD } : i === n ? { fill: INK } : {}; });
      mono(GX, GY + GR * CS + 40, `라인 로드 ${Math.ceil(n / GC)} · 원소 ${n}`, { 'font-size': 15, 'font-weight': 800, fill: GOOD }); }
    if (k === 4) { const n = Math.floor(E(u, 0.2, 2.6) * total), cr = n % GR;
      grid((r, q) => { const i = q * GR + r; return i < n ? { fill: BADBG, stroke: BAD } : i === n ? { fill: INK } : r === cr ? { fill: WARNBG } : {}; });
      mono(GX, GY + GR * CS + 40, `라인 로드 ${n} · 원소 ${n}`, { 'font-size': 15, 'font-weight': 800, fill: BAD });
      note(GX, GY + GR * CS + 68, '원소 하나 쓰려고 라인 하나를 통째로 부른다', fade(u, 1.0), { 'font-size': 14 }); }
    if (k === 5) { grid((r, q) => ({ fill: r % 2 ? GOODBG : SOFT }));
      note(GX, GY + GR * CS + 40, '연산 횟수는 둘 다 N² = 1,048,576번', fade(u, 0.4)); }
    const bars = benchBars(470, 90, 330, c, { max: 6.2 });
    if (k === 5 && bars.length === 2) { mono(930, 260, `× ${Math.round(bars[1].ms / bars[0].ms)}`, { 'font-size': 26, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      sub(800, 290, '이 PC · -O2 · 1024 × 1024', fade(u, 1.8)); }
    if (k <= 1) note(470, 220, '1024 × 1024 int = 4MB', fade(u, 0.8), { fill: MUT, 'font-size': 14 }); }

  // ---------- 3. reserve 와 이동 ----------
  function header(x, y, name, ptr, size, cap, o) { o = o || {}; const col = o.col || INK;
    mono(x, y - 30, name, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: o.op ?? 1 });
    [['ptr', ptr], ['size', size], ['cap', cap]].forEach(([k, v], i) => { card(x + 50 + i * 100, y, 96, 40, { rx: 6, stroke: col, sw: 1.8, fill: PANEL, op: o.op });
      tx(x + 10 + i * 100, y - 6, k, { 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 }); mono(x + 10 + i * 100, y + 14, String(v), { 'font-size': 14, 'font-weight': 800, opacity: o.op ?? 1 }); }); }
  function buf(x, y, w, fillN, cellsN, col, o) { o = o || {}; el('rect', { x, y, width: w, height: 34, rx: 6, fill: PANEL, stroke: col, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    el('rect', { x: x + 3, y: y + 3, width: Math.max(0, (w - 6) * clamp(fillN)), height: 28, rx: 4, fill: col, opacity: (o.op ?? 1) * 0.35 });
    if (o.label) mono(x + w / 2, y + 22, o.label, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: o.op ?? 1 }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { const nAlloc = k === 0 ? 0 : Math.floor(E(u, 0.2, 2.4) * 21), cap = nAlloc ? Math.pow(2, nAlloc - 1) : 0;
      header(40, 90, 'std::vector<int> v;', cap ? '0x…' : 'null', cap ? cap.toLocaleString('en-US') : 0, cap.toLocaleString('en-US'));
      // 할당마다 용량 막대 (선형 눈금이라 마지막 몇 개만 보인다)
      tx(40, 186, '할당한 버퍼의 용량 (1회차 → 21회차)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 21; i++) { const h = Math.max(2, 120 * Math.pow(2, i) / 1048576), on = i < nAlloc;
        el('rect', { x: 40 + i * 20, y: 320 - h, width: 15, height: h, rx: 2, fill: on ? (i === nAlloc - 1 ? BAD : WARN) : SOFT, opacity: on ? 0.9 : 1 }); }
      mono(40, 344, '1', { 'font-size': 13.5, fill: MUT }); mono(460, 344, '1,048,576', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      if (k === 1) { const moved = nAlloc > 1 ? Math.pow(2, nAlloc - 1) - 1 : 0;
        mono(520, 230, `할당 ${nAlloc}회`, { 'font-size': 20, 'font-weight': 800, fill: BAD });
        mono(520, 262, `이사한 원소 ${moved.toLocaleString('en-US')}개`, { 'font-size': 17, 'font-weight': 800, fill: WARN });
        note(520, 296, '용량이 2배씩 늘 때마다 전부 새 버퍼로 옮긴다', fade(u, 1.5), { 'font-size': 14 }); }
      else note(520, 240, '용량 0에서 출발한다', fade(u, 0.6), { fill: MUT });
      benchBars(520, 60, 300, c); return; }
    if (k === 2 || k === 3) { header(40, 90, 'std::vector<int> v;', '0x…', k === 3 ? Math.round(E(u, 0.2, 2.4) * 1000000).toLocaleString('en-US') : 0, '1,000,000');
      buf(40, 180, 420, k === 3 ? E(u, 0.2, 2.4) : 0, 0, GOOD, { label: k === 3 ? 'push_back × 1,000,000' : 'reserve(1000000)' });
      grow(90, 112, 90, 176, k === 2 ? E(u, 0.3, 0.9) : 1, GOOD);
      mono(40, 260, k === 2 ? '할당 1회' : '할당 1회 · 이사 0', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: k === 2 ? fade(u, 1.0) : 1 });
      benchBars(520, 60, 300, c);
      if (k === 3) note(520, 220, '같은 push_back인데 이사가 사라졌다', fade(u, 1.6), { fill: GOOD }); return; }
    // k4, k5: 복사 vs 이동 — 버퍼가 어디로 가는가
    const mv = k === 5 ? E(u, 0.6, 1.8) : 0;
    header(40, 80, 'a', mv > 0.5 ? 'null' : '0x…', mv > 0.5 ? 0 : '1,000,000', mv > 0.5 ? 0 : '1,000,000', { col: mv > 0.5 ? OFF : INK });
    header(40, 250, k === 5 ? 'b = std::move(a)' : 'c = a  (복사)', k === 5 ? (mv > 0.5 ? '0x…' : 'null') : '0x…', k === 5 ? (mv > 0.5 ? '1,000,000' : 0) : '1,000,000', k === 5 ? (mv > 0.5 ? '1,000,000' : 0) : '1,000,000', { col: k === 5 ? ACC : WARN });
    buf(380, 150, 120, 1, 0, GOOD, { label: '버퍼 4MB' });
    if (k === 4) { buf(380, 310, 120, E(u, 0.6, 1.8), 0, WARN, { label: '새 4MB', dash: u < 1.8 ? '5 4' : null });
      grow(90, 102, 380, 160, 1, MUT); grow(90, 272, 380, 322, E(u, 0.3, 0.8), WARN);
      for (let j = 0; j < 4; j++) dot([[440, 186], [440, 308]], seg(u, 0.6 + j * 0.25, 1.2 + j * 0.25), WARN, 5);
      note(560, 200, '복사: 원소 100만 개를 새로 베낀다', fade(u, 1.2), { fill: WARN }); note(560, 230, '값 반환은 RVO나 이동이라 이 비용이 없다', fade(u, 1.9), { 'font-size': 14 }); }
    else { const ax = lerp(102, 272, mv); grow(90, ax, 380, 160, 1, mv > 0.5 ? ACC : MUT);
      if (mv < 1) dot([[90, 102], [90, 272]], mv, ACC, 7);
      note(560, 200, '이동: 포인터 하나만 넘기고 a는 빈 상태', fade(u, 1.9), { fill: ACC }); }
    const all = (c.beat.bench || {}).bars || [], old = ((c.prev && c.prev.bench && c.prev.bench.bars) || []).map((q) => q.label);
    all.filter((q) => /반환/.test(q.label)).forEach((q, i) => { const y = 290 + i * 56, col = TONE[q.tone] || INK;
      tx(560, y, q.label, { 'font-size': 14, 'font-weight': 800, fill: col });
      hbar(560, y + 8, 260, Math.max(q.ms, 0.004), 0.9, { col, h: 20, text: q.ms + ' ms', u: old.includes(q.label) ? 1 : E(u, 0.4, 1.4) }); }); }

  // ---------- 4. vector vs list ----------
  const ADDR = [7, 31, 2, 24, 15, 38, 10, 28, 4, 35, 19, 1];   // list 노드가 놓인 칸 (그림용)
  function s4(t, c) { const { k, u } = c, AX = 60, AW = 22, n = 40;
    // 주소 축 두 줄: 위는 vector, 아래는 list
    [[100, 'vector', ACC], [250, 'list', BAD]].forEach(([y, nm, col]) => { mono(AX, y - 30, 'std::' + nm, { 'font-size': 16, 'font-weight': 800, fill: col });
      for (let i = 0; i < n; i++) el('rect', { x: AX + i * AW, y, width: AW - 2, height: 30, rx: 3, fill: SOFT }); });
    mono(AX + n * AW, 70, '주소 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    for (let i = 0; i < 24; i++) el('rect', { x: AX + i * AW, y: 100, width: AW - 2, height: 30, rx: 3, fill: ACCBG, stroke: ACC, 'stroke-width': 1.2 });
    ADDR.forEach((a, i) => el('rect', { x: AX + a * AW, y: 250, width: AW - 2, height: 30, rx: 3, fill: BADBG, stroke: BAD, 'stroke-width': 1.4 }));
    if (k === 0) { pill(AX + 640, 70, '순회 O(N)', MUT, pop(u, 0.4), { mono: true }); pill(AX + 640, 220, '순회 O(N)', MUT, pop(u, 0.7), { mono: true }); note(AX, 340, '복잡도 표만 보면 둘은 같다', fade(u, 1.2)); }
    if (k === 1) { pill(480, 340, 'N = 10,000,000', ACC, pop(u, 0.3), { mono: true, fs: 15 }); note(AX, 390, 'vector만 해도 40MB · 캐시에 다 안 들어간다', fade(u, 1.0)); }
    if (k === 2) R.snippet(AX, 310, ['long sumVector(const std::vector<int>& v)', '    for (int x : v) s += x;'], { op: fade(u, 0.2), fs: 14 });
    if (k >= 3) { // vector: 커서 + 앞서 끌어온 라인 (프리페치)
      const f = k === 3 ? E(u, 0.2, 2.6) : ((u / 3) % 1), at = Math.floor(f * 24);
      for (let i = at; i < Math.min(24, at + 8); i++) el('rect', { x: AX + i * AW, y: 100, width: AW - 2, height: 30, rx: 3, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.6 });
      el('circle', { cx: AX + at * AW + 10, cy: 115, r: 6, fill: INK });
      if (k === 3) { sub(AX + (at + 4) * AW, 156, '프리페처가 미리 끌어옴', fade(u, 0.6), { fill: GOOD, 'font-weight': 700 }); } }
    if (k >= 4) { const f = k === 4 ? E(u, 0.2, 2.6) : ((u / 3) % 1), at = Math.min(ADDR.length - 1, Math.floor(f * ADDR.length));
      for (let j = 1; j <= at; j++) { const a = ADDR[j - 1], b = ADDR[j];
        el('path', { d: `M${AX + a * AW + 10},250 Q${AX + (a + b) / 2 * AW + 10},${200 - Math.abs(b - a) * 1.5} ${AX + b * AW + 10},250`, fill: 'none', stroke: BAD, 'stroke-width': 1.6, opacity: 0.7 }); }
      el('circle', { cx: AX + ADDR[at] * AW + 10, cy: 265, r: 6, fill: INK });
      if (k === 4) { clock(AX + ADDR[at] * AW + 10, 312, 12, (u * 2) % 1, BAD); sub(AX + 440, 330, 'next를 따라갈 때마다 캐시 미스 · 기다림', fade(u, 0.6), { fill: BAD, 'font-weight': 700 }); } }
    if (k >= 3) { const bars = (c.beat.bench || {}).bars || [], max = (c.beat.bench || {}).max, old = ((c.prev && c.prev.bench && c.prev.bench.bars) || []).map((q) => q.label);
      bars.forEach((q, i) => { const y = 352 + i * 30, col = TONE[q.tone] || INK; mono(AX, y + 15, q.label.replace(' 순회', ''), { 'font-size': 14, 'font-weight': 800, fill: col });
        hbar(AX + 130, y, 520, q.ms, max, { col, h: 20, text: fms(q.ms) + ' ms', u: old.includes(q.label) ? 1 : E(u, 0.4, 1.4) }); });
      if (k === 5 && bars.length === 2) mono(920, 390, `× ${Math.round(bars[1].ms / bars[0].ms)}`, { 'font-size': 24, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.2) }); } }

  // ---------- 5. 벤치마크 함정 ----------
  function codeCard(x, y, lines, o) { o = o || {}; el('rect', { x, y, width: o.w || 420, height: lines.length * 26 + 20, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    lines.forEach(([s, a], i) => mono(x + 16, y + 30 + i * 26, s, Object.assign({ 'font-size': 15 }, a || {}))); }
  function s5(t, c) { const { k, u } = c, pf = c.beat.pitfalls || [];
    if (k === 0) { const cut = E(u, 0.8, 1.8);
      codeCard(40, 50, [['long sum = 0;'], ['t0 = now();'], ['for (…) sum += f(i);', { opacity: 1 - cut * 0.8, 'text-decoration': cut > 0.3 ? 'line-through' : null, fill: cut > 0.3 ? BAD : INK }], ['t1 = now();'], ['// sum 을 아무도 안 쓴다', { fill: MUT }]]);
      pill(620, 110, '-O2: 결과를 안 쓰니 지운다', BAD, pop(u, 0.6), { fs: 14 }); grow(520, 110, 330, 122, E(u, 0.7, 1.1), BAD);
      mono(620, 200, `t1 - t0 ≈ ${cut > 0.9 ? '0' : '…'} ns`, { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      note(480, 300, '0ns가 나오면 빨라진 게 아니라 코드가 사라진 것이다', fade(u, 2.0), { 'text-anchor': 'middle' }); }
    if (k === 1) { const f = E(u, 0.6, 1.6);
      codeCard(40, 60, [['bench([]{ return 2 + 3; });']], { w: 400 }); grow(440, 85, 540, 85, f, BAD); codeCard(550, 60, [[f > 0.9 ? 'return 5;  // 컴파일할 때 끝' : '', { fill: BAD }]], { w: 360 });
      codeCard(40, 170, [['volatile int a = 2, b = 3;'], ['bench([&]{ return a + b; });']], { w: 400 }); grow(440, 210, 540, 210, E(u, 1.4, 2.0), GOOD);
      note(550, 216, '실행할 때 읽어야 하니 지울 수 없다', fade(u, 2.0), { fill: GOOD }); }
    if (k === 2) { // now() 비용 대 연산 하나
      tx(40, 70, '측정 1회만 감쌀 때', { 'font-size': 15, 'font-weight': 800 });
      [['now()', 27, WARN], ['f()', 1, ACC], ['now()', 27, WARN]].forEach(([s, w, col], i, arr) => { const x0 = 40 + arr.slice(0, i).reduce((a, q) => a + q[1] * 12 + 6, 0);
        el('rect', { x: x0, y: 90, width: w * 12 * E(u, 0.2 + i * 0.3, 0.8 + i * 0.3), height: 34, rx: 5, fill: col, opacity: 0.85 }); if (w > 5) mono(x0 + w * 6, 112, s, { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.3) }); });
      note(40, 160, 'now() 한 번 ≈ 27ns (이 PC) · 재려는 연산보다 크다', fade(u, 1.2), { fill: WARN });
      tx(40, 220, '100만 번 묶어 잴 때', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.5) });
      el('rect', { x: 40, y: 240, width: 8, height: 34, rx: 2, fill: WARN, opacity: fade(u, 1.5) });
      el('rect', { x: 52, y: 240, width: 820 * E(u, 1.6, 2.6), height: 34, rx: 5, fill: ACC, opacity: 0.85 });
      el('rect', { x: 876, y: 240, width: 8, height: 34, rx: 2, fill: WARN, opacity: fade(u, 2.6) });
      mono(460, 262, 'for (1e6) f();', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      note(40, 320, '시계 비용은 그대로인데 신호가 백만 배 커진다 · 마지막에 iters로 나눈다', fade(u, 2.5), { 'font-size': 14 }); }
    if (k === 3) { codeCard(40, 50, [['for (int i = 0; i < 1000000; ++i)'], ['    sum += a * b + i;', { fill: GOOD, 'font-weight': 700 }], ['doNotOptimize(sum);', { fill: ACC, 'font-weight': 800 }]], { w: 440 });
      card(720, 90, 300, 60, { rx: 10, text: 'asm volatile("" : : "g"(v) : "memory")', mono: true, fs: 13.5, stroke: ACC, s: pop(u, 0.6) });
      fly(250, 118, 600, 90, seg(u, 1.0, 1.8), 'sum', { mono: true });
      note(560, 170, '컴파일러는 sum이 어딘가에서 쓰인다고 본다', fade(u, 1.8), { 'font-size': 14 }); check(540, 165, 9, pop(u, 1.8));
      note(40, 210, '이 PC: 결과를 소비한 루프 약 0.2ms · 상수만 쓰고 버린 루프 ≈ 0', fade(u, 2.2), { 'font-size': 14, fill: MUT }); }
    if (k === 4) { [['g++ bench.cpp', '-O0 · 인라인·벡터화 꺼짐', BAD], ['g++ -O2 bench.cpp', '릴리스와 같은 최적화', GOOD]].forEach(([a, b, col], i) => { const x = 250 + i * 460, s = pop(u, 0.2 + i * 0.4);
        card(x, 80, 360, 60, { rx: 10, stroke: col, sw: 2.2, s }); mono(x, 76, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s }); tx(x, 100, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); });
      tx(40, 160, '벤치마크 4계명', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.8) });
      pf.forEach((p, i) => { const y = 196 + i * 44, s = pop(u, 1.0 + i * 0.25); check(56, y, 9, s);
        tx(76, y + 5, p.title.replace(/ \(.*\)$/, ''), { 'font-size': 15, 'font-weight': 800, opacity: s }); mono(330, y + 5, p.fix, { 'font-size': 13.5, fill: GOOD, opacity: s }); }); }
    if (k < 4) { const y = 380; pf.forEach((p, i) => { const s = i === pf.length - 1 && !(c.prev && (c.prev.pitfalls || []).some((q) => q.title === p.title)) ? pop(u, 0.4) : 1;
        pill(130 + i * 230, y, p.title.replace(/ \(.*\)$/, ''), WARN, s, { fs: 13.5 }); }); } }

  const quiz = [
    { q: '벤치마크 하네스에서 앞의 몇 회를 측정에서 빼는 이유는 무엇인가?',
      o: ['첫 실행은 캐시와 분기 예측이 식어 있어 유독 느리기 때문', '시계가 처음에는 부정확하기 때문', '컴파일러가 첫 실행을 지우기 때문'], a: 0,
      why: '콜드 실행은 정상 상태가 아니다. 그림의 예시에서도 1회차만 182ns였고 2회차부터 90ns대로 모였다.' },
    { q: '1024×1024 행렬을 열 우선으로 합하면 느려지는 이유는 무엇인가?',
      o: ['덧셈 횟수가 더 많아서', '안쪽 루프가 한 행(4KB)씩 건너뛰어 원소마다 새 캐시 라인을 불러서', '열 우선은 정수 오버플로가 나서'], a: 1,
      why: '연산 횟수는 같다. 이 PC에서 행 우선 0.13ms, 열 우선 5.9ms로 약 45배 차이가 났고 원인은 접근 순서였다.' },
    { q: 'std::vector<int> b = std::move(a); 다음의 상태로 맞는 것은 무엇인가?',
      o: ['a와 b가 같은 버퍼를 함께 가리킨다', '원소 100만 개가 b로 복사된다', 'b가 a의 버퍼 포인터를 넘겨받고 a는 빈 상태가 된다'], a: 2,
      why: '이동은 포인터만 넘긴다. 이 PC에서 복사는 0.9ms, 이동은 0.0001ms 수준이었다.' },
    { q: '1000만 원소 합에서 vector가 list보다 빠른 가장 큰 이유는 무엇인가?',
      o: ['vector의 순회 복잡도가 더 낮아서', '원소가 연속이라 캐시 라인을 다 쓰고 프리페처가 다음 주소를 미리 읽어서', 'list는 순회하며 원소를 복사해서'], a: 1,
      why: '둘 다 O(N)이다. list는 next를 따라 흩어진 주소로 점프해 미스가 나고, 이 PC에서 약 50배 느렸다.' },
    { q: '벤치마크 결과가 0ns로 나왔다. 가장 먼저 의심할 것은 무엇인가?',
      o: ['결과를 쓰지 않아 -O2가 계산을 지웠다', 'CPU가 아주 빨라졌다', 'steady_clock이 멈췄다'], a: 0,
      why: '쓰이지 않는 계산은 사라진다. doNotOptimize(sum)이나 전역 대입으로 결과를 소비해야 진짜 시간을 잰다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    '재기 전에 고치지 않는다. 워밍업은 버리고, 충분히 반복하고, 평균이나 최솟값을 본다.',
    '연산 횟수가 같아도 접근 순서가 시간을 정한다. 이 PC에서 열 우선 합은 행 우선보다 약 45배 느렸다.',
    'reserve로 재할당을 없애고, 큰 vector는 복사 대신 이동한다. 이동은 포인터 하나만 넘긴다.',
    '결과를 소비하고, 런타임 입력을 쓰고, -O2로 빌드해야 벤치마크 숫자를 믿을 수 있다.',
  ];
  const review = [
    { q: '-O0로 빌드해 두 함수를 쟀더니 A가 B보다 빨랐다. 이 결과로 A를 고르기 전에 할 일은?',
      o: ['-O2로 다시 빌드해 같은 하네스로 잰다', '-O0 결과를 그대로 믿고 A를 고른다', '반복 횟수를 1회로 줄여 다시 잰다'], a: 0,
      why: '-O0는 인라인과 벡터화가 꺼져 릴리스 성능과 무관하다. 실제로 배포할 빌드 설정으로 재야 한다.' },
    { q: '로그 100만 줄을 vector에 push_back으로 모으는데 느리다. 줄 수는 미리 안다. 가장 싼 개선은?',
      o: ['list로 바꾼다', '채우기 전에 reserve로 용량을 잡는다', '정수마다 std::move를 붙여 넣는다'], a: 1,
      why: '용량이 2배씩 늘 때마다 전부 옮기던 재할당이 사라진다. 이 PC에서 100만 개 채우기가 2.5ms에서 1.2ms로 줄었다.' },
    { q: '이미지 처리 루프를 for (x) for (y) img[y * W + x]로 짰더니 느리다. 데이터는 행 우선이다. 먼저 바꿀 것은?',
      o: ['img를 list로 바꾼다', '스레드를 늘린다', '두 루프의 순서를 바꿔 안쪽이 x가 되게 한다'], a: 2,
      why: '안쪽 루프가 y면 접근마다 한 행을 건너뛴다. 순서만 바꾸면 연속 주소를 훑어 캐시 라인을 다 쓴다.' },
  ];

  R.page({ title: '벤치마크로 보는 최적화', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
