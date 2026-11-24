/* II-1-2 Promise — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, terminal, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 이 장의 부품 ----------
  // Promise 알맹이: st = 'pending' | 'ok' | 'bad'
  function ptok(cx, cy, st, o) { o = o || {}; const r = o.r || 34, s = o.s ?? 1; if (s <= 0) return;
    const col = st === 'ok' ? GOOD : st === 'bad' ? BAD : WARN, bg = st === 'ok' ? GOODBG : st === 'bad' ? BADBG : WARNBG;
    el('circle', { cx, cy, r: r * s, fill: bg, stroke: col, 'stroke-width': 3, 'stroke-dasharray': st === 'pending' ? '7 5' : null, opacity: o.op ?? 1 });
    if (o.text) mono(cx, cy + 5, o.text, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 800, fill: col, opacity: (o.op ?? 1) * clamp(s) }); }
  // 시간 레인: rows [{ name, end, fail, col, op }], T 는 지금 시각(초), X(초) → 좌표
  function lanes(x0, y0, X, rows, T, o) { o = o || {};
    rows.forEach((r, i) => { const y = y0 + i * 46, op = r.op ?? 1, now = Math.min(T, r.end), done = T >= r.end;
      tx(x0 - 12, y + 19, r.name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono', opacity: op });
      el('rect', { x: X(0), y, width: X(r.end) - X(0), height: 28, rx: 6, fill: PANEL, stroke: GRID, 'stroke-dasharray': '4 4', opacity: op });
      if (now > 0) el('rect', { x: X(0), y, width: X(now) - X(0), height: 28, rx: 6, fill: r.fail && done ? BAD : r.col || ACC, opacity: (done ? 0.9 : 0.6) * op });
      if (done) { if (r.fail) cross(X(r.end) + 16, y + 14, 8, op); else check(X(r.end) + 16, y + 14, 8, op); }
      if (o.sec !== false) mono(X(r.end) + 30, y + 19, r.end + '초', { 'font-size': 13.5, fill: MUT, opacity: done ? op : 0.5 * op }); }); }

  // ---------- 1. 세 상태 ----------
  function s1(t, c) { const { k, u } = c;
    const P = [290, 205], F = [620, 100], J = [620, 310];
    // 상태 칸
    const fOn = k === 1 || k === 3 || k === 4, jOn = k === 2 || k === 4;
    card(F[0], F[1], 220, 70, { rx: 12, stroke: fOn ? GOOD : GRID, fill: fOn ? GOODBG : PANEL, sw: 2.5 });
    tx(F[0], F[1] - 8, 'fulfilled', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: fOn ? GOOD : OFF, class: 'mono' });
    if (fOn) mono(F[0], F[1] + 18, '"데이터 준비 완료"', { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, opacity: k === 1 ? fade(u, 1.6) : 1 });
    card(J[0], J[1], 220, 70, { rx: 12, stroke: jOn ? BAD : GRID, fill: jOn ? BADBG : PANEL, sw: 2.5 });
    tx(J[0], J[1] - 8, 'rejected', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: jOn ? BAD : OFF, class: 'mono' });
    if (jOn) mono(J[0], J[1] + 18, 'Error("실패했다")', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD, opacity: k === 2 ? fade(u, 1.6) : 1 });
    // 화살표 (resolve / reject)
    el('line', { x1: P[0] + 44, y1: P[1] - 20, x2: F[0] - 116, y2: F[1] + 10, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
    el('line', { x1: P[0] + 44, y1: P[1] + 20, x2: J[0] - 116, y2: J[1] - 10, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
    tx(326, 140, 'resolve(값)', { 'font-size': 14, fill: k === 1 ? GOOD : MUT, class: 'mono', 'font-weight': 700 });
    tx(326, 282, 'reject(이유)', { 'font-size': 14, fill: k === 2 ? BAD : MUT, class: 'mono', 'font-weight': 700 });
    // 알맹이 p
    if (k === 0) { // executor 가 즉시 돈다
      card(110, 205, 150, 40, { rx: 6, text: 'executor()', fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.2), op: 1 - fade(u, 1.4) });
      sub(110, 245, '만들자마자 실행', fade(u, 0.5) * (1 - fade(u, 1.4)), { fill: INFO, 'font-weight': 700 });
      clock(110, 205, 22, E(u, 1.6, 2.8) * 0.5, WARN, null); sub(110, 250, 'setTimeout 100ms', fade(u, 1.6), { 'font-weight': 700 });
      ptok(P[0], P[1], 'pending', { s: pop(u, 0.3), text: 'p' }); sub(P[0], P[1] + 62, 'pending', fade(u, 0.8), { 'font-size': 16, 'font-weight': 800, fill: WARN }); return; }
    if (k === 1 || k === 2) { const ok = k === 1, D = ok ? F : J, m = E(u, 0.4, 1.4);
      grow(P[0] + 44, P[1] + (ok ? -20 : 20), D[0] - 116, D[1] + (ok ? 10 : -10), E(u, 0.2, 0.8), ok ? GOOD : BAD);
      ptok(lerp(P[0], D[0] - 158, m), lerp(P[1], D[1], m), m > 0.6 ? (ok ? 'ok' : 'bad') : 'pending', { text: 'p', r: 30 });
      if (!ok) { // 늦게 온 resolve 는 튕겨 나간다
        const f = seg(u, 1.6, 2.6), bx = lerp(300, D[0] - 190, Math.min(1, f * 2)), by = f < 0.5 ? lerp(380, J[1] + 10, f * 2) : lerp(J[1] + 10, 395, (f - 0.5) * 2);
        if (f > 0 && f < 1) card(f < 0.5 ? bx : lerp(D[0] - 190, 220, (f - 0.5) * 2), by, 104, 28, { rx: 14, text: 'resolve()', fs: 13.5, mono: true, fw: 700, stroke: 'none', fill: GOOD, color: PANEL, op: f < 0.5 ? 1 : 1 - (f - 0.5) * 1.6 });
        sub(470, 400, '나중 호출은 무시된다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 800, fill: BAD }); }
      return; }
    if (k === 3) { // 확정되면 바뀌지 않는다
      ptok(F[0] - 150, F[1], 'ok', { text: 'p', r: 30 }); lock(F[0] + 135, F[1], true, GOOD, pop(u, 1.9));
      const X0 = 60, X1 = 520, Y = 330, x100 = 320;
      el('line', { x1: X0, y1: Y, x2: X1, y2: Y, stroke: MUT, 'stroke-width': 1.8, 'marker-end': 'url(#ra-ah)' });
      mono(X0, Y + 24, '0ms', { 'font-size': 13.5, fill: MUT }); mono(x100, Y + 24, '100ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      el('rect', { x: X0, y: Y - 22, width: (x100 - X0) * E(u, 0.2, 1.0), height: 16, rx: 4, fill: WARN, opacity: 0.7 });
      el('rect', { x: x100, y: Y - 22, width: (X1 - 20 - x100) * E(u, 1.1, 1.8), height: 16, rx: 4, fill: GOOD, opacity: 0.8 });
      mono(X0, Y - 40, 'console.log(p) → Promise { <pending> }', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.4) });
      mono(x100 + 10, Y + 50, 'fulfilled 로 확정, 이후 그대로', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.5) });
      return; }
    // k4: then / catch 로 받는다
    ptok(F[0] - 150, F[1], 'ok', { text: 'p', r: 26 }); ptok(J[0] - 150, J[1], 'bad', { text: 'p', r: 26 });
    tx(P[0] - 120, 210, '실행마다 둘 중 하나', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
    [[F, GOOD, '.then(v => …)', '성공: 데이터 준비 완료'], [J, BAD, '.catch(e => …)', '실패: 실패했다']].forEach(([D, col, h, out], i) => { const a = 0.3 + i * 0.7;
      grow(D[0] + 112, D[1], D[0] + 160, D[1], E(u, a, a + 0.3), col);
      card(850, D[1] - 14, 170, 36, { rx: 6, text: h, fs: 14, mono: true, stroke: col, color: col, s: pop(u, a + 0.3) });
      mono(850, D[1] + 26, out, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: fade(u, a + 0.7) }); });
    sub(850, 210, '결과를 값처럼 받는다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); }

  // ---------- 2. then 체인 ----------
  const ST = [['fetchUser(1)', 50], ['.then(user => fetchOrders(…))', 112], ['.then(orders => summarize(…))', 174], ['.then(report => log(report))', 236], ['.catch(err => …)', 298], ['.finally(() => …)', 360]];
  function s2(t, c) { const { k, u } = c;
    const CX = 250, W = 330;
    const skip = k === 3 || k === 4;
    ST.forEach(([s, y], i) => { const isC = i === 4, isF = i === 5;
      const on = isC ? skip : isF ? k === 4 : !(skip && (i === 2 || i === 3));
      const col = isC ? (skip ? BAD : GRID) : isF ? (k === 4 ? INFO : GRID) : ACC;
      card(CX, y, W, 42, { rx: 8, text: s, fs: 14, mono: true, stroke: on ? col : GRID, color: on ? INK : OFF, sw: on ? 2.2 : 1.5 }); });
    // 줄기
    for (let i = 0; i < 3; i++) el('line', { x1: CX, y1: ST[i][1] + 21, x2: CX, y2: ST[i + 1][1] - 21, stroke: GRID, 'stroke-width': 2.5 });
    // 정상 흐름은 catch 를 비켜 간다 (왼쪽 우회)
    el('path', { d: `M${CX - W / 2},${236} H${CX - W / 2 - 24} V${360} H${CX - W / 2}`, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5' });
    // 값 꼬리표
    const vals = [['user', 81], ['orders', 143], ['report', 205]];
    vals.forEach(([v, y], i) => { const shown = k > i || (k === i && u > 1.3);
      if (skip && i > 0) return;
      pill(CX + W / 2 + 50, y, v, ACC, k === i ? pop(u, 1.3) : shown ? 1 : 0, { mono: true, fs: 14 }); });
    if (k === 0) { dot([[CX, 71], [CX, 91]], seg(u, 0.2, 0.7), ACC, 7);
      // Promise 껍질이 벗겨진다
      const f = E(u, 0.9, 1.9);
      card(CX + W / 2 + 120 + f * 40, 112, 92, 30, { rx: 15, text: 'Promise', fs: 13.5, mono: true, fw: 700, stroke: WARN, color: WARN, op: 1 - f, s: pop(u, 0.6) });
      tx(560, 190, 'Promise 를 return 하면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(560, 216, '다음 then 은 그 안의 값을 받는다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); }
    if (k === 1) dot([[CX, 133], [CX, 153]], seg(u, 0.2, 1.0), ACC, 7);
    if (k <= 2) { const lines = ['$ node chaining.js', ['유저: …', 'var(--term)'], ['리포트: { total: 3 }', 'var(--term)']];
      terminal(560, 250, 376, 110, lines, k === 0 ? 1 + E(u, 0.6, 1.0) : k === 1 ? 2 : 2 + E(u, 1.0, 1.8), { title: '출력' });
      if (k === 2) dot([[CX, 195], [CX, 215]], seg(u, 0.2, 0.9), ACC, 7); }
    if (skip) { // fetchOrders 실패 → 오른쪽 옆길로 catch 까지
      const rail = [[CX + W / 2, 112], [CX + W / 2 + 26, 112], [CX + W / 2 + 26, 298], [CX + W / 2, 298]];
      el('polyline', { points: rail.map((p) => p.join(',')).join(' '), fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: k === 3 ? E(u, 0.3, 1.0) : 1 });
      if (k === 3) { dot(rail, seg(u, 0.4, 1.5), BAD, 7); pill(CX + W / 2 + 90, 112, 'reject', BAD, pop(u, 0.3), { mono: true, fs: 13.5 });
        [174, 236].forEach((y, i) => sub(CX + W / 2 + 80, y + 5, '건너뜀', fade(u, 1.0 + i * 0.2), { fill: BAD, 'font-weight': 700 }));
        mono(560, 380, '실패: (fetchOrders 의 에러)', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) }); } }
    if (k === 4) { // 두 길이 finally 로 모인다
      dot([[CX - W / 2, 236], [CX - W / 2 - 24, 236], [CX - W / 2 - 24, 360], [CX - W / 2, 360]], seg(u, 0.2, 1.3), ACC, 7);
      dot([[CX, 319], [CX, 339]], seg(u, 0.5, 1.3), BAD, 7);
      el('line', { x1: CX, y1: 319, x2: CX, y2: 339, stroke: BAD, 'stroke-width': 2.5 });
      terminal(560, 250, 376, 110, ['$ node chaining.js', ['정리 완료 (스피너 끄기 등)', 'var(--term)']], 1 + E(u, 1.3, 2.0), { title: '성공이든 실패든' });
      tx(560, 120, '성공 길도 실패 길도', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(560, 148, 'finally 를 지난다', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.7) }); } }

  // ---------- 3. 조합기 ----------
  function s3(t, c) { const { k, u } = c;
    const x0 = 190, X = (v) => x0 + v * 72, T = E(u, 0.2, 2.2) * 4.6;
    // 시간 눈금
    if (k < 4) { el('line', { x1: X(0), y1: 52, x2: X(9.4), y2: 52, stroke: MUT, 'stroke-width': 1.5 });
      [0, 1, 2, 3, 4, 9].forEach((v) => { el('line', { x1: X(v), y1: 47, x2: X(v), y2: 57, stroke: MUT }); mono(X(v), 40, v + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      if (k < 4) { const tt = Math.min(T, k === 3 ? 1 : k === 1 ? 2 : k === 2 ? 3 : 4); el('line', { x1: X(tt), y1: 60, x2: X(tt), y2: 230, stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }); } }
    const A = { name: 'fetchA()', end: 3 }, B = { name: 'fetchB()', end: 2 }, Cc = { name: 'fetchC()', end: 4 };
    if (k === 0) { lanes(x0, 76, X, [A, B, Cc], T);
      el('line', { x1: X(0), y1: 232, x2: X(9) * 1, y2: 232, stroke: OFF, 'stroke-width': 3, 'stroke-dasharray': '6 5', opacity: fade(u, 2.0) });
      mono(X(9), 252, '순차라면 3 + 2 + 4 = 9초', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      lbl(480, 300, 'Promise.all  →  가장 느린 4초에 끝', fade(u, 2.2), { 'font-size': 16, fill: ACC });
      R.cells(370, 330, ['a', 'b', 'c'], { w: 70, h: 40, style: () => ({ stroke: GOOD, color: GOOD, s: pop(u, 2.3) }) }); return; }
    if (k === 1) { lanes(x0, 76, X, [{ ...A, op: T > 2 ? 0.35 : 1 }, { ...B, fail: true }, { ...Cc, op: T > 2 ? 0.35 : 1 }], T);
      if (T > 2) { mono(X(4) + 70, 115, '결과는 버려진다', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
        lbl(480, 300, 'B 가 2초에 실패하자 전체가 즉시 reject', 1, { 'font-size': 16, fill: BAD }); ptok(480, 360, 'bad', { r: 26, s: pop(u, 1.4), text: 'all' }); }
      return; }
    if (k === 2) { lanes(x0, 76, X, [A, { ...B, fail: true }], T);
      if (T > 3) { lbl(480, 260, 'allSettled 는 둘 다 끝날 때까지 기다린다', 1, { 'font-size': 16, fill: GOOD });
        card(330, 320, 290, 44, { rx: 8, text: '{ status: "fulfilled", value }', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.8) });
        card(650, 320, 300, 44, { rx: 8, text: '{ status: "rejected", reason }', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 2.0) }); }
      return; }
    if (k === 3) { lanes(x0, 76, X, [{ ...A, op: T > 1 ? 0.35 : 1 }, { name: 'timeout(1000)', end: 1, fail: true, col: WARN }], T);
      if (T > 1) { lbl(480, 260, '먼저 끝난 쪽이 타이머면 race 는 실패로 끝난다', 1, { 'font-size': 16, fill: WARN });
        pill(480, 320, 'race → reject (1초 타임아웃)', BAD, pop(u, 1.2), { fs: 15 }); }
      return; }
    // k4: any — 첫 성공
    sub(480, 44, '예시: 미러 둘 중 하나가 실패한 경우', 1, { 'font-size': 14.5 });
    const f1 = E(u, 0.3, 1.2), f2 = E(u, 0.3, 1.9);
    [['mirror1()', f1, true, 110], ['mirror2()', f2, false, 170]].forEach(([n, f, bad, y]) => {
      tx(250, y + 19, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono' });
      el('rect', { x: 270, y, width: 400, height: 28, rx: 6, fill: PANEL, stroke: GRID, 'stroke-dasharray': '4 4' });
      el('rect', { x: 270, y, width: 400 * f * (bad ? 0.5 : 0.9), height: 28, rx: 6, fill: bad && f >= 1 ? BAD : ACC, opacity: 0.8 });
      if (f >= 1) (bad ? cross : check)(270 + 400 * (bad ? 0.5 : 0.9) + 18, y + 14, 8); });
    sub(470, 160, '실패는 무시', fade(u, 1.2), { fill: BAD, 'font-weight': 700 });
    pill(480, 270, 'any → mirror2 의 값', GOOD, pop(u, 2.0), { fs: 15 });
    sub(480, 320, '전부 실패해야 any 도 실패한다 (AggregateError)', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 4. 콜백 API 를 Promise 로 ----------
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) {
      zone(40, 40, 520, 330, 'function readFileP(path)', { fill: SOFT, color: INK, op: k === 0 ? fade(u, 0.2) : 1 });
      zone(70, 80, 460, 270, 'return new Promise((resolve, reject) => …)', { fill: WARNBG, color: WARN, op: k === 0 ? fade(u, 0.8) : 1 });
      card(300, 200, 380, 60, { rx: 8, text: 'fs.readFile(path, "utf8", (err, data) => …)', fs: 13.5, mono: true, s: k === 0 ? pop(u, 1.4) : 1 });
      if (k === 0) { sub(300, 300, '안에서는 여전히 콜백을 쓴다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); ptok(760, 200, 'pending', { s: pop(u, 2.2), text: '?' }); sub(760, 260, '아직 연결 전', fade(u, 2.3)); return; }
      // 두 칸을 두 갈래에 잇는다
      card(200, 290, 110, 34, { rx: 6, text: 'err', fs: 14.5, mono: true, stroke: BAD, color: BAD }); card(400, 290, 110, 34, { rx: 6, text: 'data', fs: 14.5, mono: true, stroke: GOOD, color: GOOD });
      grow(200, 230, 200, 272, E(u, 0.2, 0.5), MUT, { plain: true }); grow(400, 230, 400, 272, E(u, 0.2, 0.5), MUT, { plain: true });
      el('path', { d: 'M200,307 C200,380 600,380 720,330', fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': 600, 'stroke-dashoffset': 600 * (1 - E(u, 0.6, 1.5)) });
      el('path', { d: 'M455,290 C600,290 620,110 720,110', fill: 'none', stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': 600, 'stroke-dashoffset': 600 * (1 - E(u, 0.9, 1.8)) });
      card(820, 330, 180, 46, { rx: 10, text: 'reject(err)', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.5) });
      card(820, 110, 180, 46, { rx: 10, text: 'resolve(data)', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.8) });
      ptok(820, 220, 'pending', { s: pop(u, 2.1), text: 'Promise' , r: 40, fs: 13.5 });
      return; }
    if (k === 2) { // util.promisify
      const f = E(u, 0.4, 1.8);
      card(lerp(150, 420, Math.min(1, f * 1.3)), 150, 230, 50, { rx: 8, text: 'fs.readFile', fs: 16, mono: true, op: f < 0.75 ? 1 : 0 });
      el('rect', { x: 400, y: 100, width: 160, height: 100, rx: 12, fill: INK });
      tx(480, 145, 'util.', { 'text-anchor': 'middle', 'font-size': 16, fill: PANEL, class: 'mono', 'font-weight': 700 });
      tx(480, 170, 'promisify', { 'text-anchor': 'middle', 'font-size': 16, fill: PANEL, class: 'mono', 'font-weight': 700 });
      card(760, 150, 280, 50, { rx: 8, text: 'readFile(path) → Promise', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.7) });
      tx(120, 280, '감싸는 코드', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
      mono(260, 280, Math.round(tween(9, 1, u, 1.6)) + '줄', { 'font-size': 26, 'font-weight': 800, fill: ACC });
      sub(480, 350, '마지막 인자가 (err, data) 콜백인 함수에만 통한다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: WARN });
      return; }
    // k3: 내장 Promise 버전이 먼저
    const rows = [['require("fs").promises', '내장 Promise 버전, 변환 없음', GOOD], ['util.promisify(fn)', '(err, data) 규약이면 한 줄', ACC], ['new Promise 로 직접', '규약이 특이한 옛 API', WARN]];
    tx(120, 64, '고르는 순서', { 'font-size': 17, 'font-weight': 800 });
    rows.forEach(([a, b, col], i) => { const y = 120 + i * 84, s = pop(u, 0.3 + i * 0.4);
      card(480, y, 680, 64, { rx: 12, stroke: col, sw: i === 0 ? 3 : 1.8, s, fill: i === 0 ? GOODBG : PANEL });
      mono(160, y + 6, (i + 1) + '', { 'font-size': 26, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.4) });
      mono(200, y + 6, a, { 'font-size': 16, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.4) });
      tx(560, y + 6, b, { 'font-size': 15, fill: INK, opacity: fade(u, 0.5 + i * 0.4) }); }); }

  // ---------- 5. 세 가지 함정 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { // catch 누락 → unhandledRejection
      card(160, 120, 200, 46, { rx: 8, text: 'fetchUser(1)', fs: 15, mono: true });
      card(400, 120, 220, 46, { rx: 8, text: '.then(render)', fs: 15, mono: true, op: 0.6 });
      if (k === 1) card(640, 120, 220, 46, { rx: 8, text: '.catch(showError)', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.2) });
      const end = k === 0 ? [[260, 120], [520, 120], [700, 120], [760, 260]] : [[260, 120], [530, 120]];
      dot(end, seg(u, 0.5, 1.6), BAD, 8); pill(160, 70, 'reject', BAD, pop(u, 0.3), { mono: true, fs: 13.5 });
      sub(400, 172, '건너뜀', fade(u, 1.0), { fill: BAD, 'font-weight': 700 });
      if (k === 0) { card(760, 290, 260, 70, { rx: 10, text: 'unhandledRejection\n프로세스 종료 (exit code 1)', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 1.7) });
        sub(480, 390, '서버가 통째로 내려간다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 800, fill: BAD }); }
      else { check(640, 190, 14, pop(u, 1.6)); sub(640, 230, '어느 단계 실패든 여기로', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: GOOD }); }
      return; }
    if (k <= 3) { // return 빠뜨림
      const ret = k === 3;
      card(250, 110, 380, 48, { rx: 8, text: ret ? 'then(u => fetchOrders(u.id))' : 'then(u => { fetchOrders(u.id); })', fs: 14, mono: true, stroke: ret ? GOOD : WARN });
      card(250, 300, 380, 48, { rx: 8, text: '.then(orders => use(orders))', fs: 14, mono: true });
      // fetchOrders 가 만든 Promise
      const pf = E(u, 0.4, 1.0); ptok(560, 110, seg(u, 0.4, 2.2) >= 1 ? 'ok' : 'pending', { r: 24, s: pop(u, 0.4), text: '' });
      grow(440, 110, 530, 110, pf, WARN, { plain: true });
      if (!ret) { fly(250, 140, 250, 270, seg(u, 0.6, 1.4), 'undefined', { fill: BAD, mono: true, stay: true });
        sub(560, 160, '아무도 기다리지 않는다', fade(u, 1.6), { fill: WARN, 'font-weight': 700, 'font-size': 14.5 });
        mono(250, 370, 'orders === undefined', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); }
      else { const w = seg(u, 2.2, 2.8);
        el('path', { d: 'M560,136 C560,220 400,240 300,270', fill: 'none', stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': 400, 'stroke-dashoffset': 400 * (1 - E(u, 1.2, 2.2)) });
        sub(640, 200, '이 Promise 를 기다렸다가 값을 넘긴다', fade(u, 1.0), { fill: GOOD, 'font-weight': 700, 'font-size': 14.5 });
        mono(250, 370, 'orders = [ … ]', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.4) });
        void w; }
      return; }
    // 순차 9초 vs 병렬 3초
    const x0 = 230, X = (v) => x0 + v * 66;
    el('line', { x1: X(0), y1: 64, x2: X(9.5), y2: 64, stroke: MUT, 'stroke-width': 1.5 });
    [0, 3, 6, 9].forEach((v) => { el('line', { x1: X(v), y1: 59, x2: X(v), y2: 69, stroke: MUT }); mono(X(v), 52, v + '초', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    const names = ['fetchA()', 'fetchB()', 'fetchC()'], par = k === 5;
    tx(60, 110, par ? 'Promise.all' : '순차 await', { 'font-size': 15, 'font-weight': 800, fill: par ? GOOD : BAD });
    names.forEach((n, i) => { const y = 130 + i * 44, s0 = par ? lerp(i * 3, 0, E(u, 0.2, 1.2)) : i * 3, g = par ? 1 : E(u, 0.3 + i * 0.6, 0.9 + i * 0.6);
      tx(x0 - 12, y + 19, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', class: 'mono' });
      el('rect', { x: X(s0), y, width: (X(3) - X(0)) * g, height: 28, rx: 6, fill: par ? GOOD : BAD, opacity: 0.75 }); });
    const tot = par ? tween(9, 3, u, 1.0) : Math.max(0.0001, [0, 1, 2].reduce((a, i) => a + 3 * E(u, 0.3 + i * 0.6, 0.9 + i * 0.6), 0));
    tx(60, 330, '걸린 시간', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
    mono(180, 336, Math.round(tot) + '초', { 'font-size': 34, 'font-weight': 800, fill: par ? GOOD : BAD });
    el('line', { x1: X(tot), y1: 120, x2: X(tot), y2: 270, stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' });
    if (par) tx(420, 330, '가장 느린 하나만큼만 기다린다', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
    else tx(420, 330, '서로 독립인데 앞이 끝나야 출발', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: 'resolve("A")를 부른 뒤 같은 executor에서 reject(new Error())를 또 부르면 p의 상태는 무엇인가?',
      o: ['rejected로 바뀐다', 'fulfilled 그대로 남는다', 'pending으로 돌아간다'], a: 1,
      why: '먼저 부른 하나로 딱 한 번 확정되고 그 뒤 호출은 무시된다. 이 불변성 덕분에 결과를 여러 곳에 넘겨도 안전하다.' },
    { q: 'then 체인 두 번째 단계에서 reject 되면 무엇이 실행되는가?',
      o: ['남은 then을 건너뛰고 가장 가까운 catch', '남은 then이 모두 실행된 뒤 catch', '체인이 멈추고 아무것도 실행되지 않는다'], a: 0,
      why: '실패는 남은 then을 건너뛰어 catch로 점프한다. 그래서 단계마다 에러를 검사할 필요 없이 끝에 catch 하나면 된다.' },
    { q: 'fetchA 3초, fetchB 2초, fetchC 4초를 Promise.all로 기다리면 언제 끝나는가?',
      o: ['9초 뒤', '2초 뒤', '4초 뒤'], a: 2,
      why: '셋이 동시에 출발하므로 가장 느린 4초에 끝난다. 하나씩 기다렸다면 3 + 2 + 4 = 9초다.' },
    { q: 'util.promisify로 바꿀 수 있는 함수는 어떤 함수인가?',
      o: ['마지막 인자로 (err, data) 콜백을 받는 함수', '이미 Promise를 돌려주는 함수', '콜백을 첫 인자로 받는 함수'], a: 0,
      why: 'promisify는 에러 우선 콜백 규약을 가정한다. 규약이 다르면 new Promise로 직접 감싸고, fs.promises처럼 내장 버전이 있으면 그걸 먼저 쓴다.' },
    { q: '서로 독립인 3초짜리 작업 셋을 await로 한 줄씩 기다리면 몇 초가 걸리는가?',
      o: ['3초', '9초', '6초'], a: 1,
      why: '앞이 끝나야 다음이 출발하니 3초씩 더해져 9초다. 먼저 다 시작해 두고 Promise.all로 기다리면 3초다.' },
  ];

  const summary = [
    'Promise는 pending에서 fulfilled나 rejected로 딱 한 번 확정되고, 그 뒤로 바뀌지 않는다.',
    'then이 돌려준 값은 다음 then으로 흐르고, 어느 단계의 실패든 끝의 catch 하나로 모인다.',
    '독립 작업은 동시에 시작해 Promise.all로 기다린다. 3초, 2초, 4초짜리가 4초에 끝난다.',
    'catch를 빼면 unhandledRejection으로 프로세스가 죽고, then에서 return을 빼면 값이 사라진다.',
  ];
  const review = [
    { q: '주문 화면이 가끔 빈 주문 목록으로 그려진다. 코드는 p.then(u => { fetchOrders(u.id); }).then(render)이다. 먼저 고칠 곳은?',
      o: ['render 앞에 catch를 하나 더 붙인다', 'Promise.all로 바꾼다', '첫 then이 fetchOrders의 Promise를 return 하게 한다'], a: 2,
      why: 'return이 없으면 다음 then은 기다리지 않고 undefined를 받는다. Promise를 return 하면 풀린 값이 넘어간다.' },
    { q: '배포 뒤 서버가 가끔 통째로 꺼지고 로그에 unhandledRejection이 남았다. 먼저 의심할 것은?',
      o: ['catch 없이 끝나는 Promise 체인', 'resolve를 두 번 부른 곳', 'Promise.all에 넣은 작업 수'], a: 0,
      why: '아무도 잡지 않은 reject는 최신 Node에서 프로세스를 종료시킨다. 체인 끝에 catch, async에서는 try/catch를 둔다.' },
    { q: '미러 세 곳 중 하나만 살아 있어도 파일을 받고 싶다. 가장 알맞은 조합기는?',
      o: ['Promise.all', 'Promise.any', 'Promise.race'], a: 1,
      why: 'any는 실패를 무시하고 처음 성공한 값을 쓴다. race는 먼저 끝난 것이 실패여도 그대로 실패로 끝난다.' },
  ];

  R.page({ title: 'Promise 상태와 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
