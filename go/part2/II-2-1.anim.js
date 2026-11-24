/* II-2-1 select — 여러 채널 동시 대기 · 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  function gtok(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || ACC, r = o.r || 30;
    el('circle', { cx: 0, cy: 0, r, fill: o.fill || ACCBG, stroke: col, 'stroke-width': 2.6 }, g);
    if (name) tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col, class: 'mono' }, g);
    return g; }
  const zz = (x, y, op) => { mono(x, y, 'z', { 'font-size': 14, 'font-weight': 800, fill: MUT, opacity: op ?? 1 }); mono(x + 10, y - 12, 'z', { 'font-size': 16, 'font-weight': 800, fill: MUT, opacity: op ?? 1 }); };
  // 선택 판: 왼쪽 goroutine + select, 오른쪽에 case 채널들. 데이터: beat.chans, beat.fired
  const GX = 110, SX = 290, PX0 = 470, PX1 = 690, LX = 722, CY = 186;
  const rowsY = (n) => n === 3 ? [86, 186, 286] : [120, 252];
  function board(t, c, o) { o = o || {}; const { k, u } = c, b = c.beat, ch = b.chans || [], ys = rowsY(ch.length), pv = (c.prev && c.prev.chans) || [];
    const fired = b.fired, newFire = fired && (!c.prev || c.prev.fired !== fired);
    gtok(GX, CY, o.gName || 'G', { r: 32, col: o.gCol || ACC, fill: o.gFill, op: o.gOp });
    el('line', { x1: GX + 32, y1: CY, x2: SX - 62, y2: CY, stroke: MUT, 'stroke-width': 2.2, opacity: o.gOp ?? 1 });
    card(SX, CY, 124, 54, { rx: 10, text: 'select', fs: 17, fw: 800, mono: true, stroke: INFO, color: INFO, fill: INFOBG, s: o.selPop ?? 1 });
    ch.forEach((x, i) => { const y = ys[i], was = pv.find((p) => p.name === x.name), turnOn = x.ready && !(was && was.ready);
      const isF = fired === x.name, col = x.bad ? BAD : x.name === 'default' ? WARN : INFO;
      // case 선
      const lineCol = isF ? (x.name === 'default' ? WARN : GOOD) : GRID;
      el('path', { d: `M${SX + 62},${CY} C${SX + 110},${CY} ${PX0 - 60},${y} ${PX0},${y}`, fill: 'none', stroke: lineCol, 'stroke-width': isF ? 3.2 : 2, 'stroke-dasharray': isF ? null : '5 5', opacity: o.scan ? 0.4 + 0.6 * Math.abs(Math.sin(t * 3)) : 1 });
      // 채널 파이프
      const s = o.appear ? pop(u, 0.2 + i * 0.3) : 1;
      card((PX0 + PX1) / 2, y, PX1 - PX0, 46, { rx: 12, stroke: col, sw: 2.2, fill: x.name === 'default' ? WARNBG : x.bad ? BADBG : SOFT, s, text: x.name, fs: 15, mono: true, fw: 800, color: col });
      // 준비 등
      const on = x.ready ? (turnOn ? fade(u, 0.6, 0.5) : 1) : 0;
      el('circle', { cx: LX, cy: y, r: 12, fill: PANEL, stroke: GRID, 'stroke-width': 2, opacity: s });
      if (on > 0) el('circle', { cx: LX, cy: y, r: 12, fill: x.bad ? BAD : GOOD, opacity: on });
      tx(LX + 22, y + 5, x.label, { 'font-size': 14, fill: x.ready ? INK : MUT, 'font-weight': x.ready ? 700 : 400, opacity: o.appear ? fade(u, 0.4 + i * 0.3) : 1 });
      // 선택된 case: 값이 select 를 거쳐 goroutine 으로
      if (isF && newFire && !o.noFlow) dot([[PX0, y], [SX + 62, CY], [GX + 34, CY]], seg(u, 0.6, 1.6), x.name === 'default' ? WARN : GOOD, 8); });
    if (b.note && o.note !== false) tx(480, 404, b.note, { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); }

  // ---------- 1. select 기본 ----------
  function s1(t, c) { const { k, u } = c;
    board(t, c, { appear: k === 0, scan: k === 2 });
    if (k === 0) tx(GX, CY + 66, 'main', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, class: 'mono' });
    if (k === 1) { const y = 186, a = seg(u, 0.2, 0.9); gtok(910, y - 52, 'go', { r: 22, s: pop(u, 0.1) });
      if (a > 0 && a < 1) fly(910, y - 52, PX1 - 30, y - 30, a, '"user row"', { mono: true });
      if (a >= 1) pill(PX1 - 50, y - 38, '"user row"', GOOD, 1, { mono: true, fs: 13.5 }); }
    if (k === 2) tx(SX, CY + 54, '세 case를 한꺼번에 본다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.5) });
    if (k === 3) terminal(40, 280, 340, 70, [['DB: user row', null]], lerp(0, 1, E(u, 1.5, 2.2)), {});
    if (k === 4) { pill(GX + 120, 300, '준비된 case가 없으면 여기서 멈춘다', INFO, pop(u, 0.3), { fs: 13.5 });
      tx(40, 352, '여러 case가 동시에 준비되면 무작위로 하나를 고른다', { 'font-size': 14.5, 'font-weight': 700, fill: INK, opacity: fade(u, 1.0) }); } }

  // ---------- 2. default ----------
  function s2(t, c) { const { k, u } = c, b = c.beat;
    board(t, c, { noFlow: false });
    if (k === 0) tx(GX, CY + 66, 'tryReceive', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, class: 'mono', opacity: 1 });
    if (k === 1) terminal(40, 290, 380, 70, [['대기 중인 작업 없음', null]], lerp(0, 1, E(u, 1.4, 2.1)), {});
    if (k >= 2) { // metricCh 버퍼 칸 (칸 수는 예시)
      const y = rowsY(2)[0], n = 3, full = k === 3, filled = k === 2 ? (u > 1.4 ? 2 : 1) : 3;
      for (let i = 0; i < n; i++) { const x = PX0 + 72 + i * 40; el('rect', { x: x - 16, y: y - 54, width: 32, height: 26, rx: 5, fill: i < filled ? ACC : PANEL, stroke: i < filled ? ACC : GRID, 'stroke-width': 1.6, opacity: 0.85 }); }
      sub(PX0 + 112, y - 62, '버퍼 (칸 수는 예시)', 1);
      if (k === 2) { const a = seg(u, 0.5, 1.4); if (a > 0 && a < 1) fly(GX + 30, CY - 30, PX0 + 112, y - 41, a, 'v', { mono: true }); }
      if (full) { const a = seg(u, 0.6, 1.8); if (a > 0) { const x = lerp(GX + 30, 300, a), yy = lerp(CY - 40, 380, a * a); el('circle', { cx: x, cy: yy, r: 8, fill: BAD, opacity: 1 - seg(u, 1.6, 1.9) }); }
        if (u > 1.8) { cross(300, 372, 12, pop(u, 1.8)); }
        terminal(560, 316, 330, 70, [['드롭: v', '#f87171']], lerp(0, 1, E(u, 1.6, 2.2)), {}); } } }

  // ---------- 3. time.After: 시간표 ----------
  const T0 = 200, T1 = 860, TT = (s) => lerp(T0, T1, s / 2.4);
  function s3(t, c) { const { k, u } = c;
    gtok(GX, 150, 'G', { r: 30 });
    card(SX, 150, 124, 50, { rx: 10, text: 'select', fs: 16, fw: 800, mono: true, stroke: INFO, color: INFO, fill: INFOBG });
    // 두 줄: respCh, time.After(2s)
    const lane = (y, name, col) => { mono(T0 - 12, y + 6, name, { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'end' }); el('line', { x1: T0, y1: y, x2: T1, y2: y, stroke: GRID, 'stroke-width': 2 }); };
    const ly1 = 250, ly2 = 320, op2 = k === 0 ? 0.25 : 1;
    lane(ly1, 'respCh', INFO);
    mono(T0 - 12, ly2 + 6, 'time.After(2s)', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: op2 }); el('line', { x1: T0, y1: ly2, x2: T1, y2: ly2, stroke: GRID, 'stroke-width': 2, opacity: op2 });
    [0, 1, 2].forEach((s) => mono(TT(s), 372, s + 's', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }));
    const now = k === 0 ? lerp(0, 1.2, E(u, 0.2, 2.4)) : k === 1 ? lerp(0, 2, E(u, 0.2, 1.6)) : 2;
    el('line', { x1: TT(now), y1: 226, x2: TT(now), y2: 344, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '3 3' });
    el('rect', { x: TT(0), y: ly1 - 10, width: TT(now) - TT(0), height: 20, rx: 4, fill: INFOBG, stroke: INFO, 'stroke-width': 1.4 });
    tx(TT(now) + 8, ly1 - 16, '응답 없음', { 'font-size': 13.5, fill: MUT, opacity: now > 0.2 ? 1 : 0 });
    if (k >= 1) { el('rect', { x: TT(0), y: ly2 - 10, width: TT(Math.min(now, 2)) - TT(0), height: 20, rx: 4, fill: BADBG, stroke: BAD, 'stroke-width': 1.4 });
      R.clock(TT(2) + 60, ly2, 18, Math.min(now, 2) / 2, BAD); }
    const fireU = k === 1 ? 1.7 : -1;
    if (k >= 1 && (k > 1 || u > fireU)) { el('circle', { cx: TT(2), cy: ly2, r: 9, fill: BAD });
      if (k === 1) dot([[TT(2), ly2], [SX + 62, 160], [GX + 30, 150]], seg(u, 1.8, 2.5), BAD, 8); }
    if (k >= 2) { mono(SX + 90, 110, 'return "", err', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: k === 2 ? fade(u, 0.3) : 1 });
      mono(SX + 90, 136, 'err = timeout after 2s', { 'font-size': 14, fill: INK, opacity: k === 2 ? fade(u, 0.8) : 1 }); }
    if (k === 3) { terminal(560, 40, 360, 70, [['(시각) 느린 응답 포기: timeout after 2s', null]], lerp(0, 1, E(u, 0.4, 1.4)), { fs: 13.5 });
      tx(560, 140, '2초 뒤 반드시 풀려난다', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) }); }
    if (k === 0) tx(SX + 90, 140, '이 case만 있으면 무한정 기다린다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) }); }

  // ---------- 4. ctx.Done() ----------
  function s4(t, c) { const { k, u } = c, b = c.beat;
    board(t, c, { gName: 'worker', gCol: k === 3 ? MUT : ACC, gOp: k === 3 ? 1 - 0.6 * E(u, 1.4, 2.2) : 1, note: k !== 0 });
    if (k === 0) { // 컨텍스트 나무
      pill(110, 46, 'Background', MUT, pop(u, 0.2), { mono: true, fs: 13.5 }); grow(178, 46, 246, 46, seg(u, 0.5, 0.8), MUT);
      pill(330, 46, 'WithTimeout 3s', BAD, pop(u, 0.7), { mono: true, fs: 13.5 }); grow(GX, 64, GX, 150, seg(u, 0.9, 1.2), MUT);
      card(GX + 8, 330, 190, 40, { rx: 8, text: 'defer cancel()', fs: 14.5, mono: true, s: pop(u, 1.2) });
      tx(GX + 8, 372, '누수 방지: 반드시 호출', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) }); }
    if (k === 1) { // 루프로 다시 돌아온다
      el('path', { d: `M${SX - 40},${CY + 30} C${SX - 40},${CY + 110} ${SX + 40},${CY + 110} ${SX + 40},${CY + 30}`, fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, 1.6), 'marker-end': u > 2 ? 'url(#ra-ahb)' : null });
      mono(SX, CY + 112, 'process(job) → 다시 for', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k >= 2) { const y = rowsY(2)[1], s = k === 2 ? pop(u, 0.3) : 1; el('rect', { x: PX0 - 8, y: y - 30, width: 10, height: 60, rx: 3, fill: BAD, opacity: s }); pill(PX0 + 110, y + 42, 'closed', BAD, s, { mono: true, fs: 13.5 }); }
    if (k === 3) { terminal(40, 296, 380, 70, [['취소됨: context deadline exceeded', null]], lerp(0, 1, E(u, 0.4, 1.2)), { fs: 13.5 });
      mono(SX, CY - 50, 'return', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) }); } }

  // ---------- 5. for + select 이벤트 루프: 시간표 ----------
  const L0 = 230, L1 = 900, LT = (s) => lerp(L0, L1, s / 12);
  const EV = [['taskCh', 1.6, ACC, 'handle(t)'], ['ticker.C', 5, INFO, 'flushMetrics()'], ['done', 7.4, BAD, 'return']];
  function s5(t, c) { const { k, u } = c;
    tx(40, 44, 'eventLoop 하나가 세 이벤트를 차례로 처리한다 (작업·종료 시각은 예시)', { 'font-size': 15, 'font-weight': 800 });
    const ys = [120, 200, 280];
    EV.forEach(([n, , col], i) => { mono(L0 - 14, ys[i] + 6, n, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'end' }); el('line', { x1: L0, y1: ys[i], x2: L1, y2: ys[i], stroke: GRID, 'stroke-width': 2 }); });
    [0, 5, 10].forEach((s) => mono(LT(s), 336, s + 's', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }));
    // ticker 눈금: 5초마다 (정지 후는 흐리게)
    [5, 10].forEach((s, i) => { const op = k === 0 ? fade(u, 0.6 + i * 0.4) : 1, stopped = k === 3 && s > 7.4;
      el('line', { x1: LT(s), y1: 186, x2: LT(s), y2: 214, stroke: stopped ? OFF : INFO, 'stroke-width': 3, opacity: op });
      if (stopped && u > 1.4) cross(LT(s), 200, 10, pop(u, 1.4)); });
    if (k === 0) { card(560, 380, 360, 40, { rx: 8, text: 'defer ticker.Stop()', fs: 15, mono: true, s: pop(u, 1.4) }); return; }
    const now = k === 1 ? lerp(0, 2.2, E(u, 0.1, 1.2)) : k === 2 ? lerp(2.2, 5.6, E(u, 0.1, 1.4)) : lerp(5.6, 7.4, E(u, 0.1, 1.0));
    el('line', { x1: LT(now), y1: 96, x2: LT(now), y2: 304, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '3 3' });
    EV.forEach(([n, at, col, act], i) => { if (now < at) return; const fresh = (k === 1 && i === 0) || (k === 2 && i === 1) || (k === 3 && i === 2);
      const s = fresh ? pop(u, i === 0 ? 0.9 : i === 1 ? 1.4 : 1.0) : 1;
      el('circle', { cx: LT(at), cy: ys[i], r: 10 * s, fill: col });
      pill(LT(at) + 20 + R.tw(act, 13.5) / 2 + 12, ys[i] - 26, act, col, s, { mono: true, fs: 13.5 }); });
    if (k === 3) { tx(560, 390, '종료 case가 있어야 셧다운 때 빠져나온다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) }); }
    else tx(560, 390, '할 일이 없을 때는 select에서 블로킹하며 쉰다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); }

  // ---------- 6. 실무 함정 ----------
  function s6(t, c) { const { k, u } = c;
    if (k <= 1) { // 바쁜 대기: 쉬지 않고 도는 루프
      gtok(200, 190, 'G', { r: 34, col: k === 1 ? BAD : ACC, fill: k === 1 ? BADBG : ACCBG });
      const spin = k === 1 ? t * 9 : t * 1.2, r = 74;
      el('circle', { cx: 200, cy: 190, r, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 6' });
      for (let i = 0; i < (k === 1 ? 3 : 1); i++) { const a = spin + i * 2.1; el('circle', { cx: 200 + r * Math.cos(a), cy: 190 + r * Math.sin(a), r: 8, fill: k === 1 ? BAD : ACC }); }
      mono(200, 300, 'for { select { … } }', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
      if (k === 1) { const v = Math.round(lerp(0, 100, E(u, 0.3, 1.4)));
        R.meters(420, 120, 440, [{ name: 'CPU 코어 하나', val: v + '%', bar: v, hot: v > 80 }], { h: 78 });
        mono(640, 250, 'ch 비었음 → default → 다시 for', { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) });
        tx(640, 290, '기능은 멀쩡해 보이고 요금과 지연만 오른다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); }
      else { [['busy loop', 'default만 있는 루프'], ['leak', 'ctx를 안 들음'], ['block forever', '타임아웃 없음']].forEach(([a, b], i) => {
          const y = 110 + i * 80, s = pop(u, 0.4 + i * 0.4); card(640, y, 380, 58, { rx: 10, stroke: BAD, sw: 2, s });
          mono(470, y + 6, a, { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.5 + i * 0.4) }); tx(810, y + 6, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.4) }); });
        tx(640, 370, '첫째는 바쁜 대기다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      return; }
    board(t, c, { gName: 'G' });
    if (k === 2) { zz(GX + 30, CY - 36, fade(u, 0.5)); R.meters(40, 300, 230, [{ name: 'CPU', val: Math.round(tween(100, 0, u)) + '%', bar: tween(100, 0, u), good: true }], { h: 68 }); }
    if (k === 3) { const y = rowsY(2)[1]; mono(SX, CY + 58, 'return', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      [['쉬는 지점', 'default 없이 블로킹'], ['취소 출구', 'ctx.Done() case'], ['상한선', 'WithTimeout · time.After']].forEach(([a, b2], i) => { const s = pop(u, 1.8 + i * 0.2); if (s <= 0) return;
        pill(230, 300 + i * 32, a + ' · ' + b2, GOOD, s, { fs: 13.5 }); }); } }

  const quiz = [
    { q: 'apiCh·dbCh·logCh 중 dbCh에만 값이 들어 있을 때 select는 어떻게 동작하는가?',
      o: ['위에서부터 차례로 apiCh를 먼저 기다린다', '준비된 dbCh case 하나만 실행하고 빠져나온다', '세 case를 모두 실행한다'], a: 1,
      why: 'select는 case를 쓴 순서가 아니라 준비 여부만 본다. 준비된 dbCh 하나만 실행해 DB: user row가 찍힌다.' },
    { q: 'jobCh가 비어 있을 때 default가 있는 select는 어떻게 되는가?',
      o: ['값이 올 때까지 기다린다', 'panic이 난다', '기다리지 않고 즉시 default를 실행한다'], a: 2,
      why: 'default가 있으면 준비된 case가 없을 때 블로킹 대신 곧바로 default로 빠진다. 그래서 대기 중인 작업 없음이 찍힌다.' },
    { q: 'respCh가 2초 넘게 응답하지 않으면 callWithTimeout은 무엇을 돌려주는가?',
      o: ['("", timeout after 2s 오류)', '빈 문자열과 nil', '응답이 올 때까지 돌려주지 않는다'], a: 0,
      why: 'time.After(2s) 채널에 2초 뒤 값이 흘러 그 case가 선택된다. 타임아웃도 평범한 error 값으로 돌아온다.' },
    { q: 'ctx.Done() case가 취소를 곧바로 알아차리는 이유는 무엇인가?',
      o: ['ctx가 1초마다 값을 보내기 때문이다', '취소되면 Done() 채널이 닫히고, 닫힌 채널의 수신은 즉시 끝나기 때문이다', 'worker가 ctx.Err()를 계속 호출하기 때문이다'], a: 1,
      why: '취소 신호는 값이 아니라 채널이 닫혔다는 사실로 전달된다. 닫힌 채널은 항상 즉시 수신되어 그 case가 준비된다.' },
    { q: 'for + select 이벤트 루프에 done case가 꼭 있어야 하는 이유는 무엇인가?',
      o: ['ticker가 멈추지 않게 하려고', 'taskCh의 순서를 지키려고', '셧다운 때 루프가 return으로 빠져나올 출구가 되기 때문에'], a: 2,
      why: '종료 case가 없으면 무한 루프에서 나올 방법이 없어 셧다운 때 이 goroutine만 남는다. return이 출구다.' },
    { q: 'for 안의 select에서 default만 두고 쉬는 지점이 없으면 생기는 일은 무엇인가?',
      o: ['채널이 비어도 루프가 쉬지 않고 돌아 CPU 코어 하나를 태운다', 'select가 영원히 멈춘다', '컴파일 오류가 난다'], a: 0,
      why: '채널이 비면 곧장 default로 빠지고 바로 다시 돈다. default를 빼면 select가 블로킹하며 CPU를 쓰지 않는다.' },
  ];

  const summary = [
    'select는 준비된 case 하나만 실행하고, 여럿이 준비되면 무작위로 고른다.',
    '준비된 case가 없으면 select는 멈춘다. default를 두면 멈추지 않고 바로 지나간다.',
    'time.After는 타임아웃을, ctx.Done()은 위에서 내려온 취소를 case 하나로 받는다.',
    '루프 속 select에는 종료 case를 두고, default만 두어 쉬지 않고 도는 일을 피한다.',
  ];
  const review = [
    { q: '메트릭을 보내는 goroutine이 가끔 통째로 멈춰 요청 처리까지 느려진다. 소비자가 느릴 때도 생산자가 멈추지 않게 하려면?',
      o: ['select에 metricCh <- v case와 default를 두어 가득 차면 버린다', '채널을 nil로 바꾼다', '소비자 쪽에 time.Sleep을 넣는다'], a: 0,
      why: '버퍼가 가득 차면 송신 case가 준비되지 않으니 default로 빠져 그 메트릭만 버린다. 생산자는 멈추지 않는다.' },
    { q: '배포 후 서버 프로세스가 CPU를 거의 안 쓰는데도 종료 신호를 보내면 끝나지 않는다. worker 루프에서 먼저 볼 것은?',
      o: ['default case가 있는지', 'ctx.Done()이나 done 같은 종료 case가 select에 있는지', 'ticker 주기가 5초인지'], a: 1,
      why: 'CPU를 안 쓴다면 블로킹하며 쉬고 있는 것이다. 빠져나올 종료 case가 없으면 셧다운 신호를 받을 길이 없다.' },
    { q: '외부 API를 기다리는 goroutine 수가 장애 때마다 계속 늘어난다. 수신 코드를 어떻게 바꾸는가?',
      o: ['채널 버퍼를 크게 늘린다', 'select에 default만 추가한다', 'select에 time.After나 ctx.Done() case를 함께 둔다'], a: 2,
      why: '타임아웃 없는 수신은 상대가 응답하지 않으면 영원히 멈춘다. 상한선 case를 짝지으면 정해진 시간 뒤 반드시 풀린다.' },
  ];

  R.page({ title: 'select 판', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
