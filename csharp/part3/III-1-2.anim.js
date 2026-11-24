/* III-1-2 async·await — Task 모델 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: example.com 응답 길이 577자(2026-11 .NET 10 실측, 페이지가 바뀌면 달라진다), 작업 300·200·250ms(페이지 예),
 *       Task.Delay 로 흉내 낸 실측 771 / 316 / 206ms. 진행 중인 I/O Task 의 Status 는 WaitingForActivation(실측). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, browser, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 스레드 하나: 굵은 물결선. busy 면 진하게, 아니면 흐리게
  function thread(x, y, w, col, op) { let d = `M${x},${y}`; for (let i = 0; i <= w; i += 6) d += ` L${x + i},${y + Math.sin(i / 7) * 4}`;
    el('path', { d, fill: 'none', stroke: col || INK, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: op ?? 1 }); }
  // Task 상자: 위에 Status, 아래에 Result 칸 (값 없는 Task 는 Result 칸 없음)
  function taskBox(cx, cy, title, status, stCol, result, o) { o = o || {}; const h = o.noResult ? 86 : 124, s = o.s ?? 1;
    card(cx, cy, 250, h, { rx: 12, stroke: o.stroke || INK, sw: 2.5, s });
    if (s < 0.3) return;
    mono(cx, cy - h / 2 + 24, title, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
    tx(cx - 112, cy - h / 2 + 54, 'Status', { 'font-size': 13.5, fill: MUT });
    pill(cx + 30, cy - h / 2 + 49, status, stCol, 1, { mono: true, fs: 13.5, fill: PANEL });
    if (o.noResult) return;
    tx(cx - 112, cy - h / 2 + 96, 'Result', { 'font-size': 13.5, fill: MUT });
    card(cx + 30, cy - h / 2 + 92, 150, 32, { rx: 6, text: result, fs: 14, mono: true, dash: result === '?' ? '5 5' : null, stroke: result === '?' ? GRID : GOOD, fill: result === '?' ? PANEL : GOODBG, color: result === '?' ? MUT : INK }); }

  // ---------- 1. Task ----------
  function s1(t, c) { const { k, u } = c;
    if (k < 4) { card(150, 200, 200, 56, { rx: 10, text: 'client : HttpClient', fs: 15, mono: true, s: k === 0 ? pop(u, 0.3) : 1 });
      browser(820, 200, 170, 110, 'example.com', { s: k === 0 ? pop(u, 0.9) : 1 }); }
    if (k === 0) { note(60, 300, '객체 하나를 만들었을 뿐, Task는 아직 0개', fade(u, 1.6), { fill: MUT }); return; }
    if (k === 4) { // 값 없는 Task + 상태 지도
      taskBox(300, 120, 'save : Task', 'RanToCompletion', GOOD, '', { noResult: true, s: pop(u, 0.2) });
      note(450, 128, '결과 칸이 없다 · 끝났는지만 알린다', fade(u, 0.8), { fill: MUT });
      const st = [['WaitingForActivation', 140, 300, INFO], ['RanToCompletion', 470, 250, GOOD], ['Faulted', 470, 310, BAD], ['Canceled', 470, 370, WARN]];
      st.forEach(([s, x, y, col], i) => { if (i) grow(140 + 100, 300, x - tw(s, 13.5) / 2 - 16, y, E(u, 1.0 + i * 0.25, 1.5 + i * 0.25), col);
        pill(x + (i ? 40 : 0), y, s, col, pop(u, 0.9 + i * 0.25), { mono: true, fs: 13.5, fill: PANEL }); });
      note(700, 256, '값을 품는다', fade(u, 2.0), { fill: GOOD }); note(700, 316, '예외를 품는다', fade(u, 2.1), { fill: BAD }); note(700, 376, '취소됨', fade(u, 2.2), { fill: WARN }); return; }
    const done = k >= 3;
    taskBox(480, 200, 'pending : Task<string>', done ? 'RanToCompletion' : 'WaitingForActivation', done ? GOOD : INFO, done ? '577자 string' : '?', { s: k === 1 ? pop(u, 0.4) : 1, stroke: done ? GOOD : INK });
    if (k === 1) { dot([[250, 200], [355, 200], [605, 200], [735, 200]], seg(u, 0.4, 1.8), ACC, 7);
      note(330, 330, '요청을 보내자마자 약속을 돌려받는다', fade(u, 1.8), { fill: ACC }); return; }
    if (k === 2) { card(480, 90, 230, 40, { rx: 20, text: 'IsCompleted = False', fs: 15, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.3) });
      thread(80, 340, 300, OFF, 1); note(80, 380, '스레드: 이 응답을 붙잡고 있지 않다', fade(u, 0.9), { fill: MUT });
      for (let i = 0; i < 3; i++) dot([[735, 200], [610, 200]], ((t * 0.7 + i / 3) % 1), OFF, 5);
      note(620, 300, 'OS·네트워크가 응답을 기다린다', fade(u, 1.4), { fill: INFO }); return; }
    // k3: 응답 도착 → 값으로
    dot([[735, 200], [605, 200]], seg(u, 0.1, 0.8), GOOD, 8);
    pill(480, 90, 'await pending', ACC, pop(u, 0.6), { mono: true, fs: 15 });
    fly(480, 230, 150, 330, seg(u, 1.2, 2.0), 'html = 577자', { fill: GOOD, stay: true, mono: true });
    note(270, 400, 'Task<string>이 string이 되었다', fade(u, 2.2), { fill: GOOD }); }

  // ---------- 2. await 의 흐름 (상태 머신 타임라인) ----------
  const TL = { x0: 170, x1: 920, yT: 110, yI: 210, yS: 320 };
  const AX = [170, 300, 330, 640, 760, 900];  // T0, 동기 끝, await, I/O 완료, 재개 끝, 호출부
  function lanes() { [['호출 스레드', TL.yT], ['네트워크 I/O', TL.yI], ['state 필드', TL.yS]].forEach(([s, y]) => { tx(24, y + 5, s, { 'font-size': 14.5, 'font-weight': 700, fill: MUT }); el('line', { x1: TL.x0, y1: y, x2: TL.x1, y2: y, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '3 5' }); }); }
  function bar(x1, x2, y, g, col, text, o) { o = o || {}; if (g <= 0) return; const w = (x2 - x1) * g;
    el('rect', { x: x1, y: y - 17, width: w, height: 34, rx: 6, fill: col, opacity: o.op ?? 0.9 });
    if (text && g > 0.6) tx(x1 + 10, y + 5, text, { 'font-size': 13.5, 'font-weight': 700, fill: o.tc || PANEL }); }
  function stateVal(x, v, col, s, op) { card(x, TL.yS, 64, 36, { rx: 8, text: String(v), fs: 17, mono: true, fw: 800, stroke: col, color: col, s, op }); }
  function s2(t, c) { const { k, u } = c;
    lanes();
    mono(TL.x0, 26, 'FetchLengthAsync(url)', { 'font-size': 15, 'font-weight': 700 });
    // A 구간: 진입 ~ await 전 (동기)
    bar(AX[0], AX[1], TL.yT, k === 0 ? E(u, 0.3, 1.3) * 0.5 : k === 1 ? 0.5 + 0.5 * E(u, 0.2, 1.2) : 1, INFO, k >= 1 ? '동기 구간' : '');
    stateVal(AX[0] + 40, k === 2 ? 0 : -1, k === 2 ? WARN : INFO, k === 0 ? pop(u, 1.0) : 1, k >= 3 ? 0.35 : 1);
    if (k === 0) { note(AX[0], 170, '호출한 스레드가 그대로 들어온다', fade(u, 1.4), { fill: INFO }); note(250, 382, '컴파일러가 만든 상태 머신의 state = -1 (실행 중)', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 1) { pill(AX[1], 60, 'Console: 요청 시작', INK, pop(u, 1.0), { fs: 13.5 }); note(AX[0], 170, 'await 앞줄까지는 호출자가 기다린다', fade(u, 1.6), { fill: WARN }); return; }
    // await 지점: 메서드가 잘린다
    el('line', { x1: AX[2], y1: TL.yT - 34, x2: AX[2], y2: TL.yS + 30, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: k === 2 ? fade(u, 0.1) : 1 });
    pill(AX[2], 60, 'await', ACC, k === 2 ? pop(u, 0.1) : 1, { mono: true, fs: 15 });
    // 스레드는 반납되어 다른 일
    const freeG = k === 2 ? E(u, 0.5, 1.8) : 1;
    bar(AX[2] + 6, AX[3], TL.yT, freeG, OFF, '반납 · 다른 요청 처리', { tc: INK, op: 0.55 });
    bar(AX[2] + 6, AX[3], TL.yI, k === 2 ? E(u, 0.6, 2.2) : 1, WARN, 'GetStringAsync 진행', { op: 0.85 });
    if (k === 2) { grow(AX[2] - 10, TL.yT + 22, AX[0] + 40, TL.yT + 52, E(u, 0.3, 0.9), ACC);
      note(AX[2] + 20, 382, 'state = 0을 적고 호출자에게 Task를 돌려준다', fade(u, 1.9), { fill: WARN }); return; }
    // k3: I/O 완료 → continuation
    el('line', { x1: AX[3], y1: TL.yT - 34, x2: AX[3], y2: TL.yS + 30, stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
    dot([[AX[3], TL.yI], [AX[3], TL.yT]], k === 3 ? seg(u, 0.2, 0.8) : 0, GOOD, 7);
    bar(AX[3] + 6, AX[4], TL.yT, k === 3 ? E(u, 0.8, 1.8) : 1, GOOD, '응답 도착');
    if (k === 3) { stateVal(AX[3], -1, INFO, pop(u, 1.0)); note(AX[2] + 20, 382, '런타임이 await 다음 줄부터 다시 이어 간다 (continuation)', fade(u, 1.8), { fill: GOOD }); return; }
    stateVal(AX[3], -2, GOOD, 1);
    bar(AX[4] + 6, AX[5], TL.yT, E(u, 0.3, 1.2), INK, 'len = 577');
    note(AX[2] + 20, 382, 'return body.Length로 Task<int>가 완료된다 (state = -2)', fade(u, 1.5), { fill: GOOD }); }

  // ---------- 3. 데드락 ----------
  const UI = [230, 210], TK = [720, 210];
  function uiThread(col, locked, s) { el('circle', { cx: UI[0], cy: UI[1], r: 70, fill: col === BAD ? BADBG : col === GOOD ? GOODBG : PANEL, stroke: col || INK, 'stroke-width': 3 });
    lbl(UI[0], UI[1] - 18, 'UI 스레드', 1, { fill: col || INK }); if (locked) lock(UI[0], UI[1] + 24, true, BAD, s ?? 1); }
  function taskNode(done) { card(TK[0], TK[1], 220, 90, { rx: 12, stroke: done ? GOOD : INK, sw: 2.5 });
    mono(TK[0], TK[1] - 10, 'GetStringAsync', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
    tx(TK[0], TK[1] + 20, done ? 'I/O는 끝났다' : 'I/O 진행 중', { 'font-size': 13.5, 'text-anchor': 'middle', fill: done ? GOOD : MUT }); }
  function arc(x1, y1, x2, y2, bend, u, col, text) { if (u <= 0) return; const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + bend;
    const p = el('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, fill: 'none', stroke: col, 'stroke-width': 3, pathLength: 100, 'stroke-dasharray': u < 1 ? `${u * 100} 100` : null, 'marker-end': u >= 1 ? (col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null });
    if (text && u >= 1) tx(mx, my + (bend < 0 ? 18 : -6), text, { 'font-size': 14.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle' }); return p; }
  function s3(t, c) { const { k, u } = c;
    if (k === 5) { // 호출 체인
      const ch = ['Button_Click', 'LoadAsync', 'GetAsync'];
      [['끝까지 async', GOOD, 250, false], ['중간에 .Result', BAD, 700, true]].forEach(([title, col, x, broken], j) => {
        lbl(x, 60, title, fade(u, 0.2 + j * 0.8), { fill: col });
        ch.forEach((s, i) => { const y = 120 + i * 100, sc = pop(u, 0.3 + j * 0.8 + i * 0.15);
          card(x, y, 220, 50, { rx: 10, text: s, fs: 15, mono: true, stroke: col, s: sc });
          if (i < 2) { const lab = broken && i === 0 ? '.Result' : 'await'; grow(x, y + 26, x, y + 74, E(u, 0.5 + j * 0.8 + i * 0.15, 0.8 + j * 0.8 + i * 0.15), broken && i === 0 ? BAD : GOOD);
            mono(x + 14, y + 55, lab, { 'font-size': 14, 'font-weight': 700, fill: broken && i === 0 ? BAD : GOOD, opacity: fade(u, 0.8 + j * 0.8) }); } });
        if (broken) lock(x + 140, 120, true, BAD, pop(u, 2.0)); });
      note(330, 410, '한 곳만 막아도 위의 고리가 다시 생긴다', fade(u, 2.3), { fill: BAD }); return; }
    const blocked = k >= 1 && k <= 3, fixed = k === 4;
    uiThread(blocked ? BAD : fixed ? GOOD : INK, blocked, k === 1 ? pop(u, 0.6) : 1);
    taskNode(k >= 2);
    if (k === 0) { mono(UI[0], UI[1] + 30, 'BadGet()', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      arc(UI[0] + 70, UI[1] - 10, TK[0] - 110, TK[1] - 10, -50, E(u, 0.6, 1.4), MUT, '비동기 API 호출'); return; }
    const lab = k === 3 ? '.Wait() · GetResult()' : fixed ? 'await (반납)' : '.Result로 기다림';
    arc(UI[0] + 70, UI[1] - 20, TK[0] - 110, TK[1] - 20, -70, k === 1 ? E(u, 0.8, 1.6) : 1, fixed ? GOOD : BAD, lab);
    if (k === 1) { note(80, 360, '값이 나올 때까지 이 스레드는 아무 일도 못 한다', fade(u, 1.8), { fill: BAD }); return; }
    // continuation 이 UI 스레드로 돌아가려 한다
    card(TK[0], 340, 200, 40, { rx: 8, text: 'continuation', fs: 15, mono: true, stroke: fixed ? GOOD : WARN, fill: fixed ? GOODBG : WARNBG, s: k === 2 ? pop(u, 0.3) : 1 });
    arc(TK[0] - 100, 340, UI[0] + 60, UI[1] + 40, 40, k === 2 ? E(u, 0.9, 1.8) : 1, fixed ? GOOD : BAD, fixed ? '바로 실행' : 'UI 스레드로 돌아가야 함');
    if (k === 2) { banner(480, 60, '서로를 기다린다 = 데드락', pop(u, 2.0)); return; }
    if (k === 3) { pill(480, 60, '이름만 다르고 같은 고리', BAD, pop(u, 0.4), { fs: 15 }); return; }
    note(560, 70, '스레드를 반납하니 돌아올 자리가 있다', fade(u, 1.4), { fill: GOOD }); }

  // ---------- 4. 병렬 ----------
  const GX = (ms, sc) => 230 + ms * (sc || 0.8), JOBS = [['GetUserAsync', 300, INFO], ['GetOrdersAsync', 200, ACC], ['GetCartAsync', 250, WARN]];
  function jobBar(i, y, start, g, op, dash) { const [n, ms, col] = JOBS[i];
    tx(24, y + 5, n, { 'font-size': 14, 'font-weight': 700, class: 'mono', opacity: op });
    if (g <= 0) return; el('rect', { x: GX(start), y: y - 13, width: ms * 0.8 * g, height: 26, rx: 5, fill: col, opacity: (op ?? 1) * (dash ? 0.35 : 0.9) });
    if (g > 0.95) mono(GX(start) + ms * 0.8 - 6, y + 5, `${ms}ms`, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'end', opacity: op }); }
  function axisMs(y) { el('line', { x1: GX(0), y1: y, x2: GX(750), y2: y, stroke: MUT, 'stroke-width': 1.5 });
    [0, 200, 300, 500, 750].forEach((v) => { el('line', { x1: GX(v), y1: y, x2: GX(v), y2: y + 5, stroke: MUT }); mono(GX(v), y + 20, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }); }
  function mark(ms, y1, y2, col, text, op) { el('line', { x1: GX(ms), y1, x2: GX(ms), y2, stroke: col, 'stroke-width': 3, opacity: op }); pill(GX(ms), y1 - 14, text, col, op, { fs: 13.5, fill: PANEL, mono: true }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 5) { // 취소 토큰: 0~2.5초
      const X = (s) => 230 + s * 260; el('line', { x1: X(0), y1: 300, x2: X(2.5), y2: 300, stroke: MUT, 'stroke-width': 1.5 });
      [0, 1, 2, 2.5].forEach((v) => mono(X(v), 320, v + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      tx(24, 205, 'GetSlowAsync', { 'font-size': 14, 'font-weight': 700, class: 'mono' });
      const g = E(u, 0.2, 2.0), end = Math.min(2, g * 2.5);
      el('rect', { x: X(0), y: 187, width: X(end) - X(0), height: 26, rx: 5, fill: end >= 2 ? BAD : INFO, opacity: 0.85 });
      el('line', { x1: X(2), y1: 120, x2: X(2), y2: 300, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 5' });
      pill(X(2), 104, 'cts : 2초 상한', BAD, pop(u, 0.3), { fs: 13.5, fill: PANEL, mono: true });
      if (g * 2.5 >= 2) { cross(X(2) + 22, 200, 12, pop(u, 1.75)); note(X(2) + 44, 206, '취소 · 예외로 끝난다', fade(u, 1.9), { fill: BAD }); }
      note(230, 380, '병렬이어도 하나가 늘어지면 전체가 늘어진다. 토큰으로 끝을 정한다', fade(u, 2.2), { fill: MUT }); return; }
    // 위: 순차
    const topOp = k >= 2 ? 0.45 : 1;
    tx(24, 56, '순차 await', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: topOp });
    const starts = [0, 300, 500];
    [0, 1, 2].forEach((i) => { const g = k === 0 ? (i === 0 ? E(u, 0.3, 1.8) : 0) : k === 1 ? (i === 0 ? 1 : E(u, 0.2 + (i - 1) * 0.9, 1.0 + (i - 1) * 0.9)) : 1; jobBar(i, 90 + i * 40, starts[i], g, topOp); });
    const tot = k === 0 ? 300 : 750;
    if (k <= 1) { mono(GX(750) + 14, 132, `${Math.round(tween(k === 1 ? 300 : 0, tot, u, 1.8))}ms`, { 'font-size': 20, 'font-weight': 800, fill: BAD });
      axisMs(220); if (k === 1) note(GX(0), 270, '서로 상관없는 세 호출인데 시간이 더해진다', fade(u, 2.0), { fill: BAD }); return; }
    mono(GX(750) + 14, 132, '750ms', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: topOp });
    // 아래: 먼저 다 시작
    tx(24, 226, '먼저 시작 → 함께 기다림', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
    [0, 1, 2].forEach((i) => { const after = k === 4 && i !== 1; jobBar(i, 260 + i * 40, 0, k === 2 ? E(u, 0.3, 1.8) : 1, 1, after); });
    axisMs(350);
    if (k === 2) { note(GX(0), 400, 'await 없이 호출만 → 셋이 이미 함께 달린다', fade(u, 1.9), { fill: GOOD }); return; }
    if (k === 3) { mark(300, 240, 340, GOOD, 'WhenAll', pop(u, 0.3)); mono(GX(750) + 14, 302, `${Math.round(tween(750, 300, u, 1.4))}ms`, { 'font-size': 20, 'font-weight': 800, fill: GOOD });
      note(GX(0), 400, '합이 아니라 가장 느린 하나 · 실측 771ms → 316ms', fade(u, 1.8), { fill: GOOD }); return; }
    mark(200, 240, 340, ACC, 'WhenAny', pop(u, 0.3)); mono(GX(750) + 14, 302, '200ms', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
    note(GX(0), 400, '나머지 둘은 계속 돈다 · 필요 없으면 취소한다', fade(u, 1.6), { fill: WARN }); }

  // ---------- 5. 반환 타입 · ConfigureAwait · I/O vs CPU ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { taskBox(260, 200, 'Task', 'RanToCompletion', GOOD, '', { noResult: true, s: pop(u, 0.2) });
      taskBox(680, 200, 'Task<int>', 'RanToCompletion', GOOD, 'int', { s: pop(u, 0.7) });
      note(160, 300, 'SaveAsync · 끝났는지만', fade(u, 1.2), { fill: MUT }); note(580, 320, 'CountAsync · 값을 돌려준다', fade(u, 1.5), { fill: MUT });
      banner(480, 390, '둘 다 await 할 수 있다', pop(u, 2.0)); return; }
    if (k === 1) { zone(40, 50, 380, 330, '스택', { fill: SOFT }); zone(470, 50, 450, 330, '힙', { fill: SOFT });
      tx(60, 110, '캐시 hit', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.2) });
      card(230, 160, 300, 54, { rx: 10, text: 'ValueTask<int> { 값 v }', fs: 15, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 0.4) });
      note(60, 220, '힙 할당 없음', fade(u, 0.9), { fill: GOOD });
      tx(60, 280, '캐시 miss', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
      card(230, 320, 300, 54, { rx: 10, text: 'ValueTask<int> { Task }', fs: 15, mono: true, stroke: WARN, s: pop(u, 1.3) });
      grow(380, 320, 570, 320, E(u, 1.6, 2.1), WARN); card(680, 320, 200, 54, { rx: 10, text: 'Task<int> 객체', fs: 15, mono: true, stroke: WARN, fill: WARNBG, s: pop(u, 2.0) });
      note(500, 150, '자주 불리고 대개 바로 끝나는 길만', fade(u, 2.2), { fill: MUT }); note(500, 176, '한 번만 await 한다', fade(u, 2.3), { fill: MUT }); return; }
    if (k === 2) { [['async Task', 230, GOOD], ['async void', 700, BAD]].forEach(([s, x, col], j) => {
        card(x, 90, 260, 50, { rx: 10, text: s, fs: 16, mono: true, stroke: col, s: pop(u, 0.2 + j * 0.3) });
        const g = seg(u, 0.7, 1.4); if (g > 0 && g < 1) dot([[x, 115], [x, 115 + (j ? 210 : 100)]], g, BAD, 8); });
      taskBox(230, 260, '(Task)', 'Faulted', BAD, '예외 보관', { s: pop(u, 1.3) });
      note(110, 380, '호출자가 await 해서 잡는다', fade(u, 1.8), { fill: GOOD });
      card(700, 320, 240, 60, { rx: 10, stroke: BAD, sw: 3, fill: BADBG, s: pop(u, 1.4) }); mono(700, 326, '프로세스 종료', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      note(590, 240, '담을 Task가 없다', fade(u, 1.1), { fill: BAD }); note(590, 400, '이벤트 핸들러만 예외로 허용', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 3) { [['UI 스레드', 130, INK], ['스레드 풀', 300, INFO]].forEach(([s, y, col]) => { tx(24, y + 5, s, { 'font-size': 14.5, 'font-weight': 700, fill: col }); thread(150, y, 760, col, 0.35); });
      bar(150, 330, 130, E(u, 0.2, 0.8), INK, 'LibReadAsync');
      pill(345, 70, 'await …ConfigureAwait(false)', ACC, pop(u, 0.6), { mono: true, fs: 13.5 });
      bar(360, 560, 215, E(u, 0.8, 1.4), WARN, 'I/O');
      el('path', { d: 'M560,215 Q600,180 640,140', fill: 'none', stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': '5 5', opacity: fade(u, 1.4) }); cross(640, 140, 10, pop(u, 1.5));
      grow(560, 215, 610, 290, E(u, 1.5, 1.9), GOOD); bar(620, 800, 300, E(u, 1.9, 2.5), GOOD, 'r.Trim()');
      note(560, 380, 'UI 스레드로 돌아가지 않으니 데드락도 막힌다', fade(u, 2.3), { fill: GOOD }); return; }
    // k4: I/O vs CPU
    zone(40, 50, 420, 330, 'I/O 바운드 · async', { fill: SOFT }); zone(500, 50, 420, 330, 'CPU 바운드 · Task.Run', { fill: SOFT });
    thread(70, 150, 360, OFF, 1); note(70, 120, '기다리는 동안 스레드 0개', fade(u, 0.4), { fill: GOOD });
    for (let i = 0; i < 3; i++) dot([[80, 250], [420, 250]], ((t * 0.6 + i / 3) % 1), INFO, 6); note(70, 300, '네트워크·디스크가 일한다', fade(u, 0.8), { fill: INFO });
    tx(530, 120, '호출 스레드', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) }); thread(640, 115, 250, GOOD, fade(u, 1.0));
    tx(530, 230, '풀 스레드', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) }); thread(640, 225, 250, INK, fade(u, 1.3));
    bar(640, 890, 225, E(u, 1.4, 2.4), BAD, 'HeavyCompute(data)');
    note(530, 320, '계산은 누군가의 스레드가 꼭 해야 한다', fade(u, 2.2), { fill: BAD }); }

  // ---------- 6. 체크리스트 ----------
  const RULES = [['① async all the way', '.Result · .Wait() 쓰지 않기'], ['② 반환은 Task', 'async void 금지'], ['③ 독립 작업은 WhenAll', '합 대신 최댓값'], ['④ 토큰을 끝까지 전달', 'ct를 하위 호출에 넘긴다']];
  function s6(t, c) { const { k, u } = c;
    RULES.forEach(([a, b], i) => { if (i > Math.min(k, 3)) return; const y = 70 + i * 80, on = i === Math.min(k, 3) && k < 4, s = on ? pop(u, 0.1) : 1;
      card(200, y, 330, 64, { rx: 10, stroke: on ? ACC : GRID, sw: on ? 2.5 : 1.5, fill: on ? ACCBG : PANEL, s });
      tx(50, y - 4, a, { 'font-size': 15, 'font-weight': 800, fill: on ? ACC : INK }); tx(50, y + 19, b, { 'font-size': 13.5, fill: MUT }); check(335, y, 9, on ? pop(u, 1.8) : 1); });
    const X = 680;
    if (k === 0) { mono(X - 200, 120, '_client.GetStringAsync(url).Result', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 0.3) }); cross(X + 200, 114, 10, pop(u, 0.7));
      mono(X - 200, 200, 'await _client.GetStringAsync(url)', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 1.0) }); check(X + 200, 194, 10, pop(u, 1.4)); return; }
    if (k === 1) { mono(X - 200, 120, 'async void RunAsync()', { 'font-size': 15, fill: BAD, opacity: fade(u, 0.3) }); cross(X + 130, 114, 10, pop(u, 0.7));
      mono(X - 200, 200, 'async Task RunAsync()', { 'font-size': 15, fill: GOOD, opacity: fade(u, 1.0) }); check(X + 130, 194, 10, pop(u, 1.4)); return; }
    if (k === 2) { const sc = 0.5; [[300, 0, INFO], [200, 300, ACC], [250, 500, WARN]].forEach(([ms, st, col], i) => {
        el('rect', { x: 470 + st * sc, y: 100 + i * 30, width: ms * sc * E(u, 0.2, 1.0), height: 22, rx: 4, fill: col, opacity: 0.85 });
        el('rect', { x: 470, y: 230 + i * 30, width: ms * sc * E(u, 1.0, 1.8), height: 22, rx: 4, fill: col, opacity: 0.85 }); });
      mono(470 + 750 * sc + 14, 135, '750ms', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      mono(470 + 300 * sc + 14, 265, '300ms', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); return; }
    // k3~4: 토큰이 아래로 흘러간다
    const ch = ['WorkAsync(ct)', 'GetStringAsync(url, ct)'];
    ch.forEach((s, i) => card(X, 110 + i * 120, 270, 50, { rx: 10, text: s, fs: 15, mono: true, stroke: INFO }));
    grow(X, 136, X, 204, 1, INFO);
    pill(X - 230, 70, '취소 버튼', BAD, 1, { fs: 14 });
    if (k === 3) { dot([[X - 230, 86], [X - 135, 110], [X, 135], [X, 230]], seg(u, 0.3, 1.6), BAD, 8);
      note(X - 200, 320, '받은 ct를 넘겨야 진행 중인 요청이 끊긴다', fade(u, 1.8), { fill: BAD }); return; }
    card(X, 330, 300, 44, { rx: 10, text: 'ct.ThrowIfCancellationRequested()', fs: 13.5, mono: true, stroke: WARN, fill: WARNBG, s: pop(u, 0.3) });
    dot([[X, 255], [X, 310]], seg(u, 0.6, 1.2), BAD, 8);
    banner(480, 400, '네 규칙 4 / 4', pop(u, 1.8)); }

  const quiz = [
    { q: 'client.GetStringAsync(url)를 부른 직후 손에 들어오는 것은 무엇인가?',
      o: ['다운로드가 끝난 string', '아직 결과가 없는 Task<string>', '다운로드를 맡은 새 스레드'], a: 1,
      why: '요청을 보내자마자 Task<string>을 돌려준다. 그 순간 IsCompleted는 False이고, await 해야 577자 string이 나온다.' },
    { q: 'async 메서드가 아직 안 끝난 Task를 await 할 때 호출 스레드는 무엇을 하나?',
      o: ['Task가 끝날 때까지 그 자리에서 멈춘다', '호출자에게 돌아가 다른 일을 한다', '새 스레드를 만들어 기다리게 한다'], a: 1,
      why: '컴파일러가 만든 상태 머신이 state를 적고 호출자에게 돌아간다. I/O가 끝나면 await 다음 줄부터 이어 실행한다.' },
    { q: 'UI 스레드에서 .Result로 비동기 결과를 기다리면 왜 멈추나?',
      o: ['continuation이 돌아갈 UI 스레드가 .Result로 막혀 있어서', 'HttpClient가 UI 스레드에서는 동작하지 않아서', '.Result가 예외를 삼켜서'], a: 0,
      why: 'UI 스레드는 Task 완료를 기다리고, Task의 뒷부분은 그 UI 스레드에서 실행되길 기다린다. 서로 기다리니 둘 다 못 간다.' },
    { q: '300·200·250ms 걸리는 독립 호출 셋을 먼저 시작하고 Task.WhenAll로 기다리면 대략 얼마 걸리나?',
      o: ['750ms', '250ms', '300ms'], a: 2,
      why: '셋이 함께 달리므로 가장 느린 300ms에 끝난다. 하나씩 await 하면 750ms다.' },
    { q: 'async void 메서드에서 던진 예외가 위험한 이유는 무엇인가?',
      o: ['예외를 담을 Task가 없어 호출자가 잡을 수 없다', 'void라서 예외가 무시되고 계속 실행된다', 'ConfigureAwait가 예외를 지운다'], a: 0,
      why: 'async Task는 예외를 Task에 담아 await 하는 쪽에서 잡게 한다. async void는 그 상자가 없어 프로세스가 죽을 수 있다.' },
    { q: 'WorkAsync(CancellationToken ct)에서 취소 버튼을 눌러도 요청이 안 끊긴다. 가장 먼저 볼 곳은?',
      o: ['ct를 GetStringAsync(url, ct)처럼 하위 호출에 넘겼는지', 'WhenAll을 썼는지', '반환 타입이 ValueTask 인지'], a: 0,
      why: '토큰은 받기만 해서는 아무 일도 하지 않는다. 진행 중인 요청까지 넘겨야 그 요청이 취소된다.' },
  ];

  const summary = [
    'Task는 아직 끝나지 않은 작업의 결과를 담을 상자다. await로 그 값을 꺼낸다.',
    'await는 스레드를 붙잡지 않고 돌아갔다가 I/O가 끝나면 다음 줄부터 이어 간다.',
    '.Result나 .Wait()로 기다리면 UI 스레드에서 서로를 기다리는 데드락이 난다.',
    '독립 작업은 먼저 다 시작해 WhenAll로 기다린다. 750ms가 300ms로 줄었다.',
  ];
  const review = [
    { q: '버튼을 누르면 화면이 굳고 다시 풀리지 않는다. 버튼 처리 코드에서 먼저 찾을 것은?',
      o: ['비동기 메서드 호출 뒤에 붙은 .Result나 .Wait()', 'Task.WhenAll로 묶은 호출', 'ConfigureAwait(false)가 붙은 await'], a: 0,
      why: 'UI 스레드가 .Result로 막히면 continuation이 돌아올 곳이 없어 영원히 기다린다. await로 바꾸면 고리가 끊긴다.' },
    { q: '사용자·주문·장바구니 API를 차례로 await 하는 화면이 750ms 걸린다. 셋은 서로 결과를 쓰지 않는다. 고칠 방법은?',
      o: ['각 호출 앞에 Task.Run을 붙인다', '셋을 먼저 시작해 두고 Task.WhenAll로 함께 기다린다', '반환 타입을 ValueTask로 바꾼다'], a: 1,
      why: '독립 작업은 동시에 돌 수 있다. 먼저 다 시작하면 시간은 가장 느린 300ms가 된다.' },
    { q: '라이브러리 메서드 안의 await에 ConfigureAwait(false)를 붙이는 이유로 맞는 것은?',
      o: ['await를 동기 호출로 바꾸려고', '예외를 Task 밖으로 바로 던지려고', '원래 컨텍스트로 돌아가지 않아 데드락 위험과 비용을 줄이려고'], a: 2,
      why: 'continuation이 UI 스레드 대신 스레드 풀에서 이어지므로, 누가 위에서 .Result를 써도 돌아갈 자리를 기다리지 않는다.' },
  ];

  R.page({ title: 'Task와 await 타임라인', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
