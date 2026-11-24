/* IV-2-2 pprof — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 호출 트리 위로 떨어지는 CPU 샘플, 힙 블록(inuse vs alloc), top 표의 flat·cum 막대, list 라인 비용, flame graph(위가 뿌리), 쌓이는 고루틴.
 * 수치는 페이지의 예시 프로파일(총 5.00s, top·list 출력)과 STEPS.top·flame 에서 읽는다. 고루틴 수 8123 은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, lock, spans, terminal, server, clock, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const hsh = (i) => { const v = Math.sin((i + 1) * 91.7) * 43758.5453; return v - Math.floor(v); };

  // 예시 프로그램의 호출 트리 (top 출력과 같은 함수)
  const TREE = { root: ['handleRequest', 480, 90], kids: [['json.Marshal', 230, 220, 42.0], ['compress.Deflate', 480, 220, 28.8], ['Builder.Grow', 730, 220, 9.4]] };
  function callTree(o) { o = o || {};
    card(TREE.root[1], TREE.root[2], 190, 44, { rx: 8, text: TREE.root[0], mono: true, fs: 15, op: o.op ?? 1 });
    TREE.kids.forEach(([n, x, y], i) => { grow(TREE.root[1], TREE.root[2] + 22, x, y - 24, o.grow ? o.grow(i) : 1, GRID, { plain: true });
      card(x, y, 190, 44, { rx: 8, text: n, mono: true, fs: 15, stroke: o.hot === i ? BAD : INK, color: o.hot === i ? BAD : INK, op: o.op ?? 1 }); }); }

  // ---------- 1. 왜 pprof ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { callTree({ op: 0.35 });
      card(480, 340, 150, 44, { rx: 8, text: 'Sum', mono: true, fs: 16, stroke: ACC, color: ACC, s: pop(u, 0.3) });
      el('path', { d: 'M480,290 L410,318 L550,318 Z', fill: WARN, opacity: 0.15 * fade(u, 0.6) });
      el('circle', { cx: 380, cy: 300, r: 16, fill: 'none', stroke: WARN, 'stroke-width': 4, opacity: fade(u, 0.6) }); el('line', { x1: 391, y1: 311, x2: 405, y2: 325, stroke: WARN, 'stroke-width': 5, opacity: fade(u, 0.6) });
      mono(580, 346, '1200 ns/op · 0 allocs (예시)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      note(40, 404, '벤치는 고른 함수 하나만 잰다 — 무엇을 잴지는 알려주지 않는다', fade(u, 1.8), { fill: WARN }); return; }
    if (k === 1) { callTree({ grow: () => 1, hot: u > 2.0 ? 0 : null });
      for (let i = 0; i < 40; i++) { const tgt = i % 10 < 4 ? 0 : i % 10 < 7 ? 1 : i % 10 < 8 ? 2 : -1, a = 0.2 + i * 0.045;
        const [x, y] = tgt < 0 ? [480 + (hsh(i) - 0.5) * 160, 90] : [TREE.kids[tgt][1] + (hsh(i) - 0.5) * 150, TREE.kids[tgt][2]];
        dot([[x, 20], [x, y - 24]], seg(u, a, a + 0.4), INFO, 4); }
      TREE.kids.forEach(([n, x, y, f], i) => { mono(x, y + 48, f.toFixed(1) + '%', { 'font-size': 20, 'font-weight': 800, fill: i === 0 ? BAD : INK, 'text-anchor': 'middle', opacity: fade(u, 1.6 + i * 0.15) }); });
      note(40, 340, '프로그램 전체를 샘플링해 "어느 함수가 몇 %" 를 낸다', fade(u, 2.0), { fill: INFO });
      sub(940, 404, 'flat %, 예시 프로파일', fade(u, 2.0), { 'text-anchor': 'end' }); return; }
    const S = [['측정', 480, 70], ['pprof 로 위치', 760, 190], ['그 함수만 벤치로 개선', 480, 320], ['재측정', 200, 190]];
    S.forEach(([n, x, y], i) => { const s = pop(u, 0.2 + i * 0.35); card(x, y, tw(n, 16) + 44, 48, { rx: 24, text: n, fs: 16, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s });
      const [nx, ny] = [S[(i + 1) % 4][1], S[(i + 1) % 4][2]]; grow(lerp(x, nx, 0.28), lerp(y, ny, 0.28), lerp(x, nx, 0.72), lerp(y, ny, 0.72), E(u, 0.4 + i * 0.35, 0.8 + i * 0.35), ACC); });
    card(480, 190, 190, 44, { rx: 8, text: '느낌상 여기', fs: 15, stroke: OFF, color: MUT, s: pop(u, 1.8) }); cross(480, 190, 16, pop(u, 2.1)); }

  // ---------- 2. 무엇을 잴까 ----------
  const RUN = [0, 0, 1, 0, 2, 1, 0, 0, 1, 3, 0, 1, 0, 0, 1, 2, 0, 1, 3, 0];   // 틱마다 실행 중인 함수 (그림용 순서)
  const FN = [['json.Marshal', BAD], ['compress.Deflate', WARN], ['Builder.Grow', INFO], ['handleRequest', MUT]];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const x0 = 60, dx = 40, n = Math.floor(E(u, 0.2, 2.0) * 20);
      tx(x0, 50, '10ms 마다 (100Hz) "지금 실행 중인 함수" 를 찍는다', { 'font-size': 16, 'font-weight': 800 });
      el('line', { x1: x0, y1: 110, x2: x0 + 20 * dx, y2: 110, stroke: GRID, 'stroke-width': 3 });
      RUN.forEach((f, i) => { if (i >= n) return; el('rect', { x: x0 + i * dx + 2, y: 92, width: dx - 4, height: 36, rx: 4, fill: FN[f][1], opacity: 0.75 }); });
      FN.forEach(([nm, col], f) => { const cnt = RUN.slice(0, n).filter((v) => v === f).length, y = 180 + f * 50;
        mono(260, y + 6, nm, { 'font-size': 15, 'font-weight': 700, fill: col, 'text-anchor': 'end' });
        for (let j = 0; j < cnt; j++) el('rect', { x: 276 + j * 26, y: y - 10, width: 22, height: 22, rx: 4, fill: col, opacity: 0.75 }); });
      note(620, 300, '많이 찍힌 함수 = 계산 핫스팟', fade(u, 2.2), { fill: BAD }); return; }
    if (k === 1) { const n = Math.floor(E(u, 0.2, 2.0) * 14);
      tx(60, 50, '힙 프로파일 — 같은 heap.prof, 두 관점', { 'font-size': 16, 'font-weight': 800 });
      for (let i = 0; i < 14; i++) { if (i >= n) break; const live = i % 3 === 0, x = 60 + i * 60;
        el('rect', { x, y: 90, width: 48, height: 48, rx: 6, fill: live ? ACC : PANEL, stroke: live ? ACC : OFF, 'stroke-width': 2, 'stroke-dasharray': live ? null : '4 4', opacity: live ? 0.8 : 1 }); }
      const live = Math.ceil(n / 3), all = n;
      tx(60, 200, 'inuse_space', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC }); el('rect', { x: 230, y: 184, width: live * 50, height: 22, rx: 4, fill: ACC });
      note(240 + live * 50, 201, '지금 살아 있는 것 → 누수·상주', fade(u, 1.6), { 'font-size': 14 });
      tx(60, 250, 'alloc_space', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: WARN }); el('rect', { x: 230, y: 234, width: all * 50, height: 22, rx: 4, fill: WARN, opacity: 0.8 });
      note(230, 290, '시작 후 할당한 전부 → GC 압박', fade(u, 1.9), { fill: WARN, 'font-size': 14 });
      mono(60, 350, 'go tool pprof -sample_index=alloc_space heap.prof', { 'font-size': 15, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { const ax = R.axes(100, 70, 700, 240, { x: [0, 10], y: [0, 10], xl: '시간', yl: '고루틴 수' });
      R.line(ax, [[0, 3], [2, 3.2], [4, 2.9], [6, 3.1], [8, 3], [10, 3.1]], E(u, 0.2, 1.2), GOOD);
      R.line(ax, [[0, 3], [2, 4.2], [4, 5.5], [6, 6.8], [8, 8.1], [10, 9.4]], E(u, 1.0, 2.2), BAD, { sw: 3 });
      note(ax.X(10) - 4, ax.Y(3.1) + 26, '정상: 평평', fade(u, 1.2), { fill: GOOD, 'text-anchor': 'end' });
      note(ax.X(10) - 4, ax.Y(9.4) - 12, '누수: 우상향', fade(u, 2.2), { fill: BAD, 'text-anchor': 'end' });
      mono(100, 404, 'go tool pprof goroutine.prof', { 'font-size': 15, opacity: fade(u, 2.3) }); return; }
    const MAP = [['CPU 100% 인데 느리다', 'CPU profile', BAD], ['메모리가 계속 는다', 'inuse_space', ACC], ['GC 가 너무 자주 돈다', 'alloc_space', WARN], ['고루틴 수가 우상향', 'goroutine', INFO]];
    MAP.forEach(([a, b, col], i) => { const y = 70 + i * 80, s = pop(u, 0.2 + i * 0.4);
      card(220, y, 300, 50, { rx: 10, text: a, fs: 16, s }); grow(372, y, 590, y, E(u, 0.4 + i * 0.4, 0.8 + i * 0.4), col);
      card(700, y, 210, 50, { rx: 25, text: b, mono: true, fs: 16, stroke: col, color: col, s: pop(u, 0.7 + i * 0.4) }); }); }

  // ---------- 3. 수집 ----------
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { // 파일로 수집: 시간선
      const x0 = 80, x1 = 880, Y = 170;
      if (k === 0) { ['import (', '    "os"', '    "runtime/pprof"', ')'].forEach((s, i) => mono(80, 80 + i * 30, s, { 'font-size': 17, fill: i === 2 ? ACC : INK, 'font-weight': i === 2 ? 800 : 500, opacity: fade(u, 0.2 + i * 0.25) }));
        note(480, 120, '짧게 끝나는 배치·CLI 는 파일로 바로 남긴다', fade(u, 1.4), { fill: ACC }); fly(560, 160, 700, 260, seg(u, 1.6, 2.3), 'cpu.prof', { mono: true, stay: true, fill: INFO }); return; }
      el('line', { x1: x0, y1: Y, x2: x1, y2: Y, stroke: GRID, 'stroke-width': 3 });
      const sx = 200, ex = 760;
      el('line', { x1: sx, y1: Y - 40, x2: sx, y2: Y + 40, stroke: GOOD, 'stroke-width': 3, opacity: k === 1 ? fade(u, 0.2) : 1 }); mono(sx, Y - 50, 'StartCPUProfile', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 0.2) : 1 });
      const pr = k === 1 ? E(u, 0.4, 2.0) : 1;
      if (k === 2) { el('rect', { x: sx + 10, y: Y - 26, width: ex - sx - 20, height: 52, rx: 6, fill: ACCBG }); mono((sx + ex) / 2, Y + 5, 'runHeavyWork()', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); }
      for (let i = 0; i < 26; i++) { const x = sx + 12 + i * 21; if (x > lerp(sx, ex, pr)) break; el('circle', { cx: x, cy: Y + (k === 2 ? 44 : 0), r: 4, fill: INFO, opacity: 0.8 }); }
      el('line', { x1: ex, y1: Y - 40, x2: ex, y2: Y + 40, stroke: BAD, 'stroke-width': 3, opacity: k === 1 ? fade(u, 1.8) : 1 }); mono(ex, Y - 50, 'defer StopCPUProfile', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 1.8) : 1 });
      // 파일
      const fy = 290; card(260, fy, 220, 70, { rx: 8, stroke: INFO, fill: PANEL }); mono(170, fy - 12, 'cpu.prof', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      el('rect', { x: 170, y: fy + 2, width: 180 * pr, height: 14, rx: 4, fill: INFO, opacity: 0.6 }); if (pr >= 1) check(330, fy - 12, 8, 1);
      if (k === 1) { card(700, fy, 220, 70, { rx: 8, stroke: BAD, fill: BADBG, s: pop(u, 2.0) }); mono(610, fy - 12, 'Stop 없음', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
        el('rect', { x: 610, y: fy + 2, width: 90, height: 14, rx: 4, fill: BAD, opacity: 0.5 * fade(u, 2.0) }); mono(710, fy + 14, '잘림', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.1) }); return; }
      note(80, 380, 'Start 와 Stop 사이만 담긴다 — 충분히 일을 시켜야 샘플이 모인다', fade(u, 1.0), { fill: ACC });
      note(560, 300, '너무 짧으면 샘플 몇 개뿐', fade(u, 1.8), { fill: WARN, 'font-size': 14.5 }); return; }
    // 서버: /debug/pprof
    server(170, 170, '서버 :6060', { lamp: GOOD });
    pill(170, 270, 'import _ "net/http/pprof"', ACC, k === 3 ? pop(u, 0.3) : 1, { mono: true, fs: 13.5 });
    mono(300, 120, '/debug/pprof/', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: k === 3 ? fade(u, 0.6) : 1 });
    if (k === 3) { card(720, 170, 280, 50, { rx: 8, text: 'go tool pprof', mono: true, fs: 15, fill: INK, color: PANEL, stroke: 'none', s: pop(u, 0.9) });
      mono(480, 240, 'http://localhost:6060/debug/pprof/profile?seconds=30', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      for (let i = 0; i < 6; i++) dot([[240, 170], [580, 170]], seg(u, 1.2 + i * 0.15, 1.8 + i * 0.15), INFO, 5);
      clock(720, 290, 26, E(u, 1.2, 2.6), INFO, '30s');
      note(60, 380, '운영 중에 재시작 없이 원하는 순간 긁어 온다', fade(u, 2.2), { fill: GOOD }); return; }
    // k4: 노출 금지
    person(800, 150, '외부 누구나', { stroke: BAD, s: pop(u, 0.2) });
    const blk = E(u, 1.0, 1.4);
    grow(760, 150, lerp(760, 300, 0.6), 150, E(u, 0.4, 0.9), BAD, { dash: '6 5' });
    el('rect', { x: 470, y: 90, width: 18, height: 120, rx: 4, fill: INK, opacity: blk }); cross(479, 150, 12, pop(u, 1.3));
    [['힙 덤프', 330], ['고루틴 스택', 370]].forEach(([s, y], i) => pill(620, y, s + ' 유출', BAD, pop(u, 1.6 + i * 0.3), { fs: 14 }));
    note(60, 330, 'localhost 바인딩 · 내부망 · 인증 뒤에만', fade(u, 2.0), { fill: GOOD });
    note(60, 362, '공개망에 열리면 힙·고루틴이 통째로 샌다', fade(u, 2.2), { fill: BAD }); }

  // ---------- 4. top ----------
  function topTable(rows, x, y, o) { o = o || {}; const W = 600, sc = W / 100;
    mono(x, y - 14, 'flat%', { 'font-size': 14, fill: INK, 'font-weight': 700 }); el('rect', { x: x + 54, y: y - 25, width: 14, height: 12, rx: 2, fill: BAD });
    mono(x + 90, y - 14, 'cum%', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: o.cum ?? 0 }); el('rect', { x: x + 136, y: y - 25, width: 14, height: 12, rx: 2, fill: 'none', stroke: INFO, 'stroke-width': 2, opacity: o.cum ?? 0 });
    rows.forEach((r, i) => { const yy = (o.ys ? o.ys(i) : y + i * 58), s = o.rowS ? o.rowS(i) : 1; if (s <= 0) return;
      mono(x - 12, yy + 22, r.fn, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: s, fill: o.hi === r.fn ? BAD : INK });
      el('rect', { x, y: yy + 6, width: W, height: 24, rx: 4, fill: SOFT, opacity: s });
      if (o.cum) el('rect', { x, y: yy + 6, width: r.cum * sc * (o.cumU ?? 1), height: 24, rx: 4, fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: o.cum * s });
      el('rect', { x, y: yy + 6, width: r.flat * sc * s, height: 24, rx: 4, fill: r.flat > 30 ? BAD : ACC, opacity: 0.85 });
      mono(x + W + 10, yy + 23, r.flat.toFixed(1) + (o.cum ? ' / ' + r.cum.toFixed(1) : ''), { 'font-size': 14, 'font-weight': 800, opacity: s }); }); }
  function s4(t, c) { const { k, u } = c, top = c.beat.top || [];
    if (k === 0) { terminal(60, 60, 840, 200, ['$ go tool pprof cpu.prof', '(pprof) top' + (Math.floor(t * 2) % 2 ? '_' : '')], 0.01 + 2 * E(u, 0.1, 1.2), { fs: 16, lh: 32 });
      note(60, 320, '가장 먼저 치는 명령 — 여기서 수사 방향이 정해진다', fade(u, 1.6), { fill: ACC }); return; }
    mono(60, 40, 'Showing nodes accounting for 4.07s, 81.40% of 5.00s total', { 'font-size': 14.5, fill: MUT, opacity: k === 1 ? fade(u, 0.1) : 1 });
    if (k === 4) { // -cum 으로 다시 줄 세우기
      const prev = (c.prev && c.prev.top) || top, order = top.map((r) => prev.findIndex((p) => p.fn === r.fn)), m = E(u, 0.3, 1.5);
      topTable(top, 260, 100, { cum: 1, ys: (i) => 100 + lerp(order[i], i, m) * 58 });
      note(60, 380, 'cum 순서 = 호출 경로의 위쪽부터 — 어디로 내려갈지 고를 때', fade(u, 1.8), { fill: INFO }); return; }
    topTable(top, 260, 100, { rowS: (i) => (k === 1 ? pop(u, 0.4 + i * 0.4) : k === 2 && i >= 2 ? pop(u, 0.3 + (i - 2) * 0.4) : 1), cum: k >= 2 ? (k === 2 ? fade(u, 1.4) : 1) : 0, hi: k === 3 ? 'handleRequest' : null });
    if (k === 1) note(60, 380, '상위 두 함수가 이미 70.8% — 여기부터 판다', fade(u, 1.8), { fill: BAD });
    if (k === 2) note(60, 380, 'flat 은 자기 시간, cum 은 부른 하위까지 합친 시간', fade(u, 1.8), { fill: INFO });
    if (k === 3) { // handleRequest cum 98.6 을 쪼갠다
      const y = 345, sc = 6, parts = [['flat 1.2', 1.2, MUT], ['Marshal 55.4', 55.4, BAD], ['Deflate 31.0', 31.0, WARN], ['Grow 9.4', 9.4, ACC], ['기타 1.6', 1.6, OFF]];
      let x = 260; parts.forEach(([s, v, col], i) => { const g = E(u, 0.4 + i * 0.3, 0.8 + i * 0.3); el('rect', { x, y, width: v * sc * g, height: 26, fill: col, opacity: 0.8 });
        if (v > 10) mono(x + 6, y + 18, s, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, opacity: g }); x += v * sc; });
      mono(250, y + 18, 'handleRequest cum', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end' });
      note(60, 404, '자기 시간은 1.2% 뿐 — 통로다. 태우는 건 json.Marshal', fade(u, 2.0), { fill: BAD }); } }

  // ---------- 5. list · flame ----------
  const LIST = [['func Marshal(v any) ([]byte, error) {', 2.10, 2.77], ['    e := newEncodeState()', 0, 0], ['    err := e.marshal(v, opts)', 1.80, 2.30], ['    buf := e.Bytes()', 0, 0], ['    return append([]byte(nil), buf...)', 0.30, 0.47]];
  function flame(fl, x, y, w, o) { o = o || {}; const rh = 34;
    fl.forEach((f, i) => { const s = o.s ? o.s(i) : 1; if (s <= 0) return; const fx = x + (f.x / 100) * w, fw = (f.w / 100) * w * s, fy = y + f.d * (rh + 4), hot = f.fn === o.hot;
      el('rect', { x: fx, y: fy, width: Math.max(2, fw - 2), height: rh, rx: 4, fill: hot ? BAD : f.d === 0 ? INFO : f.d === 1 ? WARN : OFF, opacity: hot ? 0.9 : 0.6 });
      if (fw > tw(f.fn, 13.5) + 12) mono(fx + 6, fy + 22, f.fn, { 'font-size': 13.5, 'font-weight': 700, fill: hot ? PANEL : INK });
      if (fw > 60 && f.d === 1 && f.w > 20) mono(fx + fw - 8, fy + 22, f.w.toFixed(1) + '%', { 'font-size': 13.5, 'font-weight': 800, fill: hot ? PANEL : INK, 'text-anchor': 'end' }); }); }
  function s5(t, c) { const { k, u } = c, fl = c.beat.flame || [];
    // 왼쪽: list 출력
    mono(20, 36, '(pprof) list json.Marshal', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
    mono(20, 62, '  flat    cum', { 'font-size': 13.5, fill: MUT });
    LIST.forEach(([s, f, cm], i) => { const y = 92 + i * 34, op = k === 0 ? fade(u, 0.3 + i * 0.2) : 1, hot = (k === 1 && (i === 2 || i === 4)) || (k === 2 && i === 4);
      if (hot) el('rect', { x: 14, y: y - 20, width: 470, height: 30, rx: 5, fill: BADBG });
      mono(24, y, f ? f.toFixed(2) + 's' : '  .', { 'font-size': 13.5, fill: f ? BAD : MUT, 'font-weight': 700, opacity: op });
      mono(84, y, cm ? cm.toFixed(2) + 's' : '  .', { 'font-size': 13.5, fill: cm ? INFO : MUT, opacity: op });
      mono(146, y, s.length > 30 ? s.slice(0, 30) + '…' : s, { 'font-size': 13.5, opacity: op, fill: i === 0 ? MUT : INK }); });
    if (k === 1) { [[2, 1.80], [4, 0.30]].forEach(([i, v], j) => hbar(24, 270 + j * 34, 300, v, 2.10, { col: BAD, h: 18, text: v.toFixed(2) + 's', u: E(u, 0.4 + j * 0.4, 1.0 + j * 0.4) }));
      note(24, 360, '1.80 + 0.30 = 2.10s (함수 flat 합)', fade(u, 1.6), { class: 'mono', 'font-size': 14.5 }); }
    if (k === 2) { note(24, 290, '마샬링 버퍼를 재사용하면', fade(u, 0.4), { fill: GOOD }); note(24, 318, '할당과 append 복사를 함께 줄일 여지', fade(u, 0.8), { fill: GOOD }); }
    if (k === 3) { mono(24, 300, '$ go tool pprof -http=:8080 cpu.prof', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.2) }); note(24, 330, 'VIEW → Flame Graph', fade(u, 0.6), { fill: INFO, 'font-size': 14.5 }); }
    // 오른쪽: flame graph (위가 뿌리, 가로 폭 = 시간 비중)
    tx(510, 36, 'flame graph · 가로 폭 = 시간', { 'font-size': 14.5, 'font-weight': 800, fill: MUT });
    flame(fl, 510, 60, 430, { hot: k >= 2 ? 'json.Marshal' : null, s: (i) => { const prevN = (c.prev && c.prev.flame || []).length; return i >= prevN || c.k === 0 ? E(u, 0.3 + (i - prevN) * 0.25, 0.9 + (i - prevN) * 0.25) : 1; } });
    if (k >= 2) note(510, 230, '가장 넓은 프레임 = json.Marshal 55.4%', k === 2 ? fade(u, 1.2) : 1, { fill: BAD, 'font-size': 14.5 });
    if (k === 3) note(510, 258, '그 아래 하위 호출은 13.4% — 대부분 자기 시간', fade(u, 1.6), { fill: MUT, 'font-size': 14 }); }
  const hbar = (x, y, w, v, max, o) => R.hbar(x, y, w, v, max, o);

  // ---------- 6. 재측정 · 고루틴 누수 ----------
  function s6(t, c) { const { k, u } = c;
    if (k === 0) { terminal(40, 30, 880, 80, ['$ go tool pprof -base before.prof after.prof'], Math.max(0.01, E(u, 0.1, 0.8)), { fs: 15 });
      const sc = 260; [['before', 2.10, BAD], ['after', 0.50, GOOD]].forEach(([n, v, col], i) => { const y = 170 + i * 60, g = E(u, 0.6 + i * 0.5, 1.2 + i * 0.5);
        mono(200, y + 18, 'json.Marshal ' + n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x: 220, y, width: v * sc * g, height: 26, rx: 4, fill: col, opacity: 0.8 });
        mono(230 + v * sc, y + 19, v.toFixed(2) + 's', { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.5) }); });
      el('line', { x1: 220 + 0.5 * sc, y1: 160, x2: 220 + 2.1 * sc, y2: 160, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.8) });
      mono(220 + 1.3 * sc, 152, '−1.60s', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      note(40, 340, '기준 총 5.00s 의 32% · Marshal 자신의 76% 가 줄었다', fade(u, 2.1), { fill: ACC });
      sub(920, 404, '예시 프로파일', 1, { 'text-anchor': 'end' }); return; }
    if (k === 3) return pitfalls(u);
    // 고루틴 더미
    const n = k === 1 ? E(u, 0.2, 2.0) : k === 2 ? 1 - E(u, 1.0, 2.4) : 1;
    card(250, 330, 300, 46, { rx: 8, text: 'worker() · chan receive', mono: true, fs: 15, stroke: k === 2 && u > 2.2 ? GOOD : BAD, color: k === 2 && u > 2.2 ? GOOD : BAD });
    for (let i = 0; i < 60; i++) { if (i >= n * 60) break; const x = 120 + (i % 12) * 22, y = 290 - Math.floor(i / 12) * 22;
      el('circle', { cx: x, cy: y, r: 8, fill: k === 2 ? WARN : BAD, opacity: 0.75 }); }
    mono(500, 130, String(Math.round(8123 * n)), { 'font-size': 44, 'font-weight': 800, fill: k === 2 ? WARN : BAD, opacity: k === 3 ? 0.3 : 1 }); note(500, 160, '개 고루틴 · 같은 스택 (예시)', k === 3 ? 0.3 : 1, { fill: MUT });
    if (k === 1) { note(500, 230, '한 스택에 수천 개 = 정상 부하가 아니라 누수', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 2) { spans(500, 220, [['case <-ctx.Done(): ', { fill: INFO, 'font-weight': 700 }], ['return', { fill: GOOD, 'font-weight': 800 }]], { 'font-size': 15.5, opacity: fade(u, 0.3) });
      spans(500, 252, [['close(jobs)', { fill: INFO, 'font-weight': 700 }], ['  → range 가 끝난다', { fill: MUT }]], { 'font-size': 15.5, opacity: fade(u, 0.7) });
      note(500, 300, '고루틴마다 끝나는 길을 만든다', fade(u, 2.2), { fill: GOOD }); return; }
  }
  function pitfalls(u) {
    [['샘플 부족', '부하를 충분히 준다', WARN], ['엔드포인트 노출', '내부망·인증 뒤에만', BAD], ['추측 최적화', '-base 로 재측정', ACC]].forEach(([a, b, col], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.4);
      card(x, 200, 270, 110, { rx: 12, stroke: col, fill: PANEL, sw: 2.5, s });
      tx(x, 190, a, { 'font-size': 18, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) });
      tx(x, 222, b, { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); });
    note(480, 340, '측정 → 개선 → 재측정 루프를 닫아야 끝난다', fade(u, 1.8), { 'text-anchor': 'middle', fill: ACC, 'font-size': 16 }); }

  const quiz = [
    { q: '느린 서비스에서 어느 함수를 고칠지 아직 모를 때 먼저 쓸 도구는 무엇인가?',
      o: ['go test -bench로 아무 함수나 잰다', 'pprof로 전체를 샘플링해 비중이 큰 함수를 찾는다', '느낌상 느린 곳을 먼저 고친다'], a: 1,
      why: '벤치는 고른 함수 하나만 잰다. pprof가 전체 시간 중 어느 함수가 몇 % 인지 보여 준 뒤 그 함수만 벤치로 다듬는다.' },
    { q: '메모리는 안정적인데 GC가 너무 자주 돈다. 어떤 프로파일 관점을 봐야 하나?',
      o: ['heap의 alloc_space', 'heap의 inuse_space', 'goroutine 프로파일'], a: 0,
      why: 'alloc_space는 시작 후 누적 할당량이라 할당이 많은 곳을 짚는다. inuse_space는 지금 살아 있는 메모리(누수)를 본다.' },
    { q: 'runtime/pprof로 CPU 프로파일을 남길 때 defer pprof.StopCPUProfile()을 빼먹으면 어떻게 되나?',
      o: ['샘플링 주기가 1000Hz로 바뀐다', '서버에 /debug/pprof가 열린다', 'cpu.prof가 완성되지 않아 분석 도구가 읽지 못한다'], a: 2,
      why: 'Start와 Stop 사이 샘플이 파일에 담기고 Stop이 파일을 마무리한다. 빠지면 잘린 파일이 남는다.' },
    { q: 'top에서 handleRequest가 flat 1.2%, cum 98.6%다. 올바른 해석은 무엇인가?',
      o: ['handleRequest 자신이 CPU를 가장 많이 태운다', '하위 호출을 거치는 통로일 뿐, 태우는 건 그 아래 함수다', '샘플이 부족해 믿을 수 없다'], a: 1,
      why: 'cum은 하위까지 합친 시간이다. 자기 시간은 1.2% 뿐이고 json.Marshal이 flat 42.0%로 진짜 핫스팟이다.' },
    { q: 'flame graph에서 가장 먼저 볼 프레임은 무엇인가?',
      o: ['가로로 가장 넓은 프레임', '가장 깊은 곳에 있는 프레임', '색이 가장 진한 프레임'], a: 0,
      why: '가로 폭이 시간 비중이다. 이 예시에서는 json.Marshal이 55.4%로 가장 넓다.' },
    { q: 'goroutine 프로파일에서 chan receive · worker() 한 스택에 8123개(예시)가 쌓였다. 알맞은 처방은 무엇인가?',
      o: ['GOMAXPROCS를 늘린다', '채널 버퍼를 키운다', 'context 취소나 채널 close로 고루틴이 빠져나갈 길을 만든다'], a: 2,
      why: '종료 신호를 못 받아 수신 대기에 묶인 고루틴이 쌓이는 누수다. 끝나는 길을 만들어야 줄어든다.' },
  ];

  const summary = [
    '벤치는 고른 함수 하나를 재고, pprof는 프로그램 전체에서 어느 함수가 몇 %인지 찾는다.',
    'CPU는 100Hz 샘플, 힙은 inuse와 alloc 두 관점, 고루틴 프로파일은 누수를 본다.',
    'top에서는 flat이 큰 함수가 핫스팟이고, cum만 큰 함수는 지나가는 통로다.',
    'list로 비싼 줄을, flame graph로 넓은 프레임을 찾고, 고친 뒤 -base로 전후를 비교한다.',
  ];
  const review = [
    { q: '버퍼 재사용을 넣은 뒤 "빨라진 것 같다"는 말만 있다. 효과를 확인하는 가장 직접적인 방법은?',
      o: ['같은 부하로 프로파일을 다시 떠 -base before.prof로 비교한다', 'GC 로그를 끈다', 'top10 -cum만 다시 본다'], a: 0,
      why: '-base는 전후 프로파일의 차이를 숫자로 낸다. 이 예시에서는 json.Marshal이 2.10s에서 0.50s로 줄었다.' },
    { q: '운영 서버의 메모리가 하루 내내 늘고 고루틴 수도 우상향이다. 먼저 열어 볼 두 가지는?',
      o: ['CPU 프로파일과 list', 'heap inuse_space와 goroutine 프로파일', 'alloc_space와 benchstat'], a: 1,
      why: '지금 살아 있는 메모리는 inuse_space가, 쌓이는 고루틴은 goroutine 프로파일이 보여 준다.' },
    { q: '배치를 2초만 돌려 CPU 프로파일을 떴더니 top이 매번 다르게 나온다. 이유로 가장 그럴듯한 것은?',
      o: ['StopCPUProfile을 두 번 불렀다', 'flat과 cum 정렬이 섞였다', '실행이 짧아 100Hz 샘플이 적게 모였다'], a: 2,
      why: '100Hz면 2초에 약 200개 샘플뿐이다. 부하를 충분히 줘 샘플을 모아야 비중이 안정된다.' },
  ];

  R.page({ title: 'pprof 검진실', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
