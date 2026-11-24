/* II-1-1 콜백과 콜백 지옥 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, terminal, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // ---------- 이 장의 부품 ----------
  // 콜 스택: frames 는 아래부터 [{ t, col, s }]
  function stack(x, y, w, h, frames, o) { o = o || {};
    zone(x, y, w, h, o.title || '콜 스택 (메인 스레드)', { fill: SOFT });
    el('line', { x1: x + 14, y1: y + h - 14, x2: x + w - 14, y2: y + h - 14, stroke: MUT, 'stroke-width': 2 });
    frames.forEach((f, i) => card(x + w / 2, y + h - 34 - i * 42, w - 32, 34, { rx: 6, text: f.t, fs: 14, mono: true, stroke: f.col || INK, color: f.col || INK, fill: f.fill || PANEL, s: f.s, op: f.op }));
    if (!frames.length && o.empty) sub(x + w / 2, y + h / 2 + 10, o.empty, o.emptyOp ?? 1, { 'font-weight': 700 }); }
  // 큐 한 줄
  function lane(x, y, w, title, items, o) { o = o || {};
    tx(x, y - 9, title, { 'font-size': 14, 'font-weight': 700, fill: o.color || MUT });
    el('rect', { x, y, width: w, height: 46, rx: 8, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.8 });
    let cx = x + 10; items.forEach((it) => { const iw = it.w || tw(it.t, 14) + 24; card(cx + iw / 2, y + 23, iw, 32, { rx: 6, text: it.t, fs: 14, mono: true, fw: 700, stroke: 'none', fill: it.fill || ACC, color: it.color || PANEL, s: it.s, op: it.op }); cx += iw + 8; });
    if (!items.length && o.empty) sub(x + w / 2, y + 28, o.empty, 1); }
  // 코드 한 줄 칸 (강조하면 배경이 칠해진다)
  function codeRow(x, y, w, s, o) { o = o || {};
    if (o.hi) el('rect', { x, y: y - 17, width: w, height: 26, rx: 5, fill: o.hiCol || ACCBG, opacity: o.hi });
    mono(x + 10, y + 1, s, { 'font-size': o.fs || 14.5, fill: o.col || INK, opacity: o.op ?? 1 }); }

  // ---------- 1. 콜백 = 나중에 실행할 함수 ----------
  function s1(t, c) { const { k, u } = c;
    const SX = 24, SY = 40, SW = 260, SH = 228;
    // libuv 영역
    zone(310, 40, 626, 118, 'libuv (백그라운드에서 대신 기다린다)', { fill: SOFT });
    // 타이머 칸: k 가 지날수록 시계가 찬다 (1000ms)
    const tf = [0, 0.15, 0.3, 0.4, 0][k] + (k === 0 ? 0.05 * E(u, 1.4, 2.6) : k === 4 ? lerp(0.45, 1, E(u, 1.4, 2.2)) : 0.1 * E(u, 0.2, 2.6));
    const timerOn = k > 0 || u > 1.4;
    clock(380, 104, 26, timerOn ? tf : 0, WARN, '1000ms');
    tx(420, 98, '타이머', { 'font-size': 15, 'font-weight': 700, opacity: timerOn ? 1 : 0.35 });
    if (timerOn && !(k === 4 && u > 2.2)) card(500, 104, 56, 28, { rx: 6, text: 'fn', fs: 14, mono: true, fw: 700, stroke: 'none', fill: WARN, color: PANEL });
    // 파일 읽기 칸
    const fileOn = k >= 1 && !(k === 1 && u < 1.3);
    const prog = k === 1 ? 0.6 * E(u, 1.3, 2.8) : k === 2 ? lerp(0.6, 1, E(u, 0.2, 1.0)) : 1;
    tx(610, 92, '파일 읽기  data.txt', { 'font-size': 15, 'font-weight': 700, opacity: k >= 1 ? 1 : 0.35 });
    el('rect', { x: 610, y: 106, width: 230, height: 14, rx: 7, fill: PANEL, stroke: GRID });
    if (k >= 1) el('rect', { x: 610, y: 106, width: 230 * prog, height: 14, rx: 7, fill: ACC, opacity: fileOn ? 1 : 0 });
    if (k >= 1) mono(850, 118, prog >= 0.999 ? '완료' : Math.round(prog * 100) + '%', { 'font-size': 14, 'font-weight': 700, fill: prog >= 0.999 ? GOOD : MUT, opacity: fileOn ? 1 : 0 });
    const cbInWorker = k === 1 ? u > 1.3 : k === 2 ? u < 1.1 : false;
    if (cbInWorker) card(890, 82, 58, 26, { rx: 6, text: 'cb', fs: 14, mono: true, fw: 700, stroke: 'none', fill: ACC, color: PANEL });
    // 콜백 큐 + 이벤트 루프 화살표
    const inQ = (k === 2 && u > 2.0) || k === 3 || (k === 4 && u < 0.5);
    lane(370, 200, 566, '콜백 큐 (완료된 일의 콜백이 줄 선다)', inQ ? [{ t: 'cb(err, data)', s: k === 2 ? pop(u, 2.0) : 1 }] : [], { empty: '비어 있음' });
    el('path', { d: 'M370,223 C340,223 320,223 296,223', stroke: k === 4 ? ACC : GRID, 'stroke-width': 2.5, fill: 'none', 'marker-end': k === 4 ? 'url(#ra-ahb)' : 'url(#ra-ah)' });
    tx(333, 260, '이벤트 루프', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: k === 4 ? ACC : MUT });
    if (k === 2) fly(900, 96, 450, 223, seg(u, 1.1, 2.0), 'cb', { mono: true });
    // 콜 스택
    let fr = [];
    if (k === 0 && u < 1.6) fr = [{ t: 'setTimeout(fn, 1000)', s: pop(u, 0.2) }];
    if (k === 1 && u < 1.6) fr = [{ t: 'fs.readFile(…, cb)', s: pop(u, 0.2) }];
    if (k === 3 && u > 0.2 && u < 2.0) fr = [{ t: 'console.log(…)', s: pop(u, 0.2), col: INFO }];
    if (k === 4 && u > 0.9) fr = [{ t: 'cb(err, data)', s: pop(u, 0.9), col: ACC }];
    stack(SX, SY, SW, SH, fr, { empty: '비어 있음', emptyOp: 1 });
    if (k === 0) fly(150, 230, 500, 104, seg(u, 0.6, 1.4), 'fn', { mono: true, fill: WARN });
    if (k === 1) fly(150, 230, 890, 82, seg(u, 0.6, 1.3), 'cb', { mono: true });
    if (k === 4) dot([[370, 223], [296, 223], [154, 200]], seg(u, 0.2, 0.9), ACC, 7);
    // 아래 콘솔
    const lines = ['$ node callback-basics.js', ['먼저 찍힘 — 콜백을 기다리지 않는다', 'var(--term)'], ['파일 내용: (data.txt 의 내용)', 'var(--term)'], ['1초 뒤 실행됨', 'var(--term)']];
    const shown = k < 3 ? 1 : k === 3 ? 1 + E(u, 0.6, 1.6) : 2 + E(u, 1.2, 1.8) + (u > 2.2 ? E(u, 2.2, 2.7) : 0);
    terminal(24, 290, 912, 120, lines, shown, { title: '출력' });
    if (k === 0) sub(SX + SW / 2, SY + 100, '넘겼을 뿐, 아직 실행 안 함', fade(u, 1.7), { fill: WARN, 'font-weight': 700 });
    if (k === 2) sub(SX + SW / 2, SY + 100, '읽기가 끝나면 cb 가 큐로', fade(u, 2.1), { fill: ACC, 'font-weight': 700 }); }

  // ---------- 2. 실행 순서 A → C → B ----------
  const ORD = [['console.log("A) start");', 'A'], ['setTimeout(() => log("B"), 0);', 'B'], ['console.log("C) end");', 'C']];
  function s2(t, c) { const { k, u } = c;
    zone(24, 40, 330, 150, '코드 (위에서 아래로)', { fill: SOFT });
    const cur = k === 0 ? 0 : k === 1 ? 1 : k === 2 ? 2 : -1;
    ORD.forEach(([s], i) => codeRow(36, 84 + i * 36, 306, s, { hi: i === cur ? 1 : 0, fs: 14, op: k >= 4 ? 0.5 : 1 }));
    // 스택
    let fr = [];
    if (k === 0 && u > 0.2 && u < 1.6) fr = [{ t: 'log("A")', s: pop(u, 0.2), col: INFO }];
    if (k === 1 && u > 0.2 && u < 1.4) fr = [{ t: 'setTimeout(…, 0)', s: pop(u, 0.2) }];
    if (k === 2 && u > 0.2 && u < 1.4) fr = [{ t: 'log("C")', s: pop(u, 0.2), col: INFO }];
    if (k === 3 && u > 1.0 && u < 2.4) fr = [{ t: 'B 콜백', s: pop(u, 1.0), col: ACC }];
    stack(380, 40, 240, 150, fr, { title: '콜 스택', empty: k === 2 && u > 1.4 ? '비었다 → 이제 큐 차례' : '비어 있음' });
    // 큐
    const qB = (k === 1 && u > 1.3) || k === 2 || (k === 3 && u < 0.4);
    lane(650, 70, 286, '콜백 큐', qB ? [{ t: 'B 콜백', s: k === 1 ? pop(u, 1.3) : 1 }] : [], { empty: '비어 있음' });
    if (k === 1) { fly(500, 150, 720, 93, seg(u, 0.6, 1.3), 'B', { mono: true }); sub(785, 140, '0ms 여도 일단 큐로', fade(u, 1.5), { fill: WARN, 'font-weight': 700 }); }
    if (k === 3) dot([[700, 93], [640, 93], [620, 150], [500, 150]], seg(u, 0.3, 1.0), ACC, 7);
    // 출력 순서
    const outs = [['A) start'], ['C) end'], ['B) timeout 콜백']];
    const shown = k === 0 ? E(u, 0.8, 1.4) : k === 1 ? 1 : k === 2 ? 1 + E(u, 0.8, 1.4) : k === 3 ? 2 + E(u, 1.6, 2.2) : 3;
    terminal(24, 214, 330, 120, ['$ node execution-order.js'].concat(outs.map((x) => [x[0], 'var(--term)'])), 1 + shown, { title: '출력', lh: 21 });
    if (k === 3) { // 코드 순서 vs 출력 순서
      tx(390, 236, '코드 순서', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) });
      tx(390, 316, '출력 순서', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      const top = ['A', 'B', 'C'], bot = ['A', 'C', 'B'], xs = [560, 660, 760];
      top.forEach((s, i) => card(xs[i], 230, 54, 34, { rx: 17, text: s, fs: 16, mono: true, fw: 800, s: pop(u, 2.0 + i * 0.1) }));
      bot.forEach((s, i) => card(xs[i], 310, 54, 34, { rx: 17, text: s, fs: 16, mono: true, fw: 800, stroke: s === 'B' ? ACC : INK, color: s === 'B' ? ACC : INK, s: pop(u, 2.2 + i * 0.1) }));
      top.forEach((s, i) => grow(xs[i], 248, xs[bot.indexOf(s)], 292, E(u, 2.3, 2.7), s === 'B' ? ACC : MUT, { plain: true }));
      mono(840, 315, 'B 가 맨 뒤', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.5) }); }
    if (k === 4) { // 콜백 밖에서 읽으면 undefined
      const X0 = 400, X1 = 920, Y = 330, now = 470, later = 800;
      el('line', { x1: X0, y1: Y, x2: X1, y2: Y, stroke: MUT, 'stroke-width': 1.8, 'marker-end': 'url(#ra-ah)' });
      tx(X1, Y + 26, '시간', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      card(now, 250, 170, 36, { rx: 6, text: 'console.log(result)', fs: 13.5, mono: true, s: pop(u, 0.2) });
      grow(now, 270, now, Y - 4, E(u, 0.4, 0.8), MUT, { plain: true });
      mono(now, Y + 26, 'undefined', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      card(later, 250, 190, 36, { rx: 6, text: '콜백: result = d', fs: 13.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.4) });
      grow(later, 270, later, Y - 4, E(u, 1.6, 2.0), ACC, { plain: true });
      mono(later, Y + 26, '읽기가 끝난 뒤', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      el('rect', { x: now + 4, y: Y - 10, width: (later - now - 8) * E(u, 0.9, 1.6), height: 20, rx: 4, fill: WARNBG });
      mono((now + later) / 2, Y + 5, '아직 값이 없다', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(400, 390, '결과를 쓰는 코드는 콜백 안에 둔다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); } }

  // ---------- 3. 에러 우선 콜백 (err, data) ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 3) return tryLate(u);
    const G0 = R.G(0, 0, 1, 1);
    // 시그니처: (err, data) 두 칸
    const errV = k === 0 ? '?' : k === 1 ? 'Error' : 'null', datV = k === 0 ? '?' : k === 1 ? 'undefined' : '"파일 내용"';
    const errC = k === 0 ? INK : k === 1 ? BAD : GOOD, datC = k === 0 ? INK : k === 1 ? OFF : GOOD;
    R.el('rect', { x: 40, y: 104, width: 330, height: 92, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }, G0);
    R.tx(56, 128, '콜백 (err, data) =>', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' }, G0);
    const fill = k >= 1 && k <= 2 ? pop(u, 0.9) : 1;
    R.card(118, 166, 130, 38, { rx: 6, text: 'err = ' + errV, fs: 14, mono: true, stroke: errC, color: errC, p: G0, s: k === 1 || k === 2 ? 0.9 + 0.1 * fill : 1 });
    R.card(286, 166, 150, 38, { rx: 6, text: 'data = ' + (datV.length > 9 ? datV.slice(0, 9) + '…' : datV), fs: 14, mono: true, stroke: datC, color: datC, p: G0 });
    // 두 갈래
    const up = [[370, 150], [470, 150], [520, 88], [600, 88]], dn = [[370, 150], [470, 150], [520, 232], [600, 232]];
    const pathD = (p) => 'M' + p.map((q) => q.join(',')).join(' L');
    R.el('path', { d: pathD(up), fill: 'none', stroke: k === 2 ? GOOD : GRID, 'stroke-width': k === 2 ? 3 : 2, 'stroke-dasharray': k === 0 ? '6 6' : null }, G0);
    R.el('path', { d: pathD(dn), fill: 'none', stroke: k === 1 ? BAD : GRID, 'stroke-width': k === 1 ? 3 : 2, 'stroke-dasharray': k === 0 ? '6 6' : null }, G0);
    R.card(735, 88, 270, 52, { rx: 10, text: 'err === null\nJSON.parse(data) → 설정 로드', fs: 14, stroke: k === 2 ? GOOD : GRID, color: k === 1 ? OFF : INK, p: G0 });
    R.card(735, 232, 270, 52, { rx: 10, text: 'if (err) { …  return; }\n여기서 끝, 아래로 안 감', fs: 14, stroke: k === 1 ? BAD : GRID, color: k === 2 ? OFF : INK, p: G0 });
    if (k === 0) { sub(520, 296, '아직 어느 쪽이 채워질지 모른다', fade(u, 0.8), { 'font-size': 15, 'font-weight': 700, fill: INK }); }
    if (k === 1) { fly(120, 40, 118, 166, seg(u, 0.2, 0.9), 'Error(ENOENT)', { fill: BAD, mono: true });
      dot(dn, seg(u, 1.1, 1.9), BAD, 7);
      mono(600, 292, '읽기 실패: ENOENT: no such file …', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.9) });
      // 막힌 아래 로직
      el('line', { x1: 886, y1: 205, x2: 886, y2: 262, stroke: BAD, 'stroke-width': 5, opacity: fade(u, 2.0) });
      tx(886, 192, '아래 로직 차단', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1), 'text-anchor': 'middle' }); }
    if (k === 2) { fly(120, 40, 118, 166, seg(u, 0.2, 0.9), 'null', { fill: GOOD, mono: true }); fly(300, 40, 286, 166, seg(u, 0.3, 1.0), '"파일 내용"', { fill: GOOD, mono: true });
      dot(up, seg(u, 1.1, 1.9), GOOD, 7);
      mono(600, 146, '설정 로드: { … }', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(600, 300, '여기 왔다면 err 는 null, data 는 믿고 쓴다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }
  }

  // try 는 이미 끝났다: 시간축 위에 try 블록과 나중에 불린 콜백
  function tryLate(u) {
      const X0 = 60, X1 = 920, Y = 300, tEnd = 330, cbX = 640;
      tx(480, 70, '콜백은 try 블록이 끝난 뒤에 불린다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.1) });
      el('line', { x1: X0, y1: Y, x2: X1, y2: Y, stroke: MUT, 'stroke-width': 1.8, 'marker-end': 'url(#ra-ah)' });
      tx(X1, Y + 26, '시간', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      const w = (tEnd - X0) * E(u, 0.2, 0.8);
      el('rect', { x: X0, y: Y - 60, width: w, height: 46, rx: 8, fill: C.INFOBG, stroke: INFO, 'stroke-width': 2 });
      mono(X0 + 14, Y - 31, 'try { fs.readFile(…) }', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.6) });
      mono(X0 + 14, Y + 26, 'catch 가 지키는 구간', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 0.9) });
      card(cbX + 60, Y - 37, 190, 40, { rx: 8, text: '콜백: throw e', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.2) });
      mono(cbX + 60, Y + 26, '읽기 실패 뒤', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      grow(cbX + 60, Y - 58, cbX + 60, Y - 120, E(u, 1.6, 2.0), BAD);
      pill(cbX + 60, Y - 142, 'uncaughtException: ENOENT', BAD, pop(u, 2.0), { mono: true, fs: 13.5 });
      grow(cbX - 40, Y - 37, tEnd + 30, Y - 37, E(u, 1.5, 2.0), BAD, { dash: '5 5' }); cross(tEnd + 50, Y - 37, 9, pop(u, 2.1));
      tx(480, 390, '그래서 에러는 throw 대신 첫 인자 err 로 넘어온다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.3) }); }

  // ---------- 4. 콜백 지옥 (피라미드) ----------
  const HELL = [['fs.readFile(cfgPath, (err, cfg) => {', '설정 파일 읽기'], ['db.query(cfg.sql, (err, rows) => {', '읽은 값으로 DB 조회'], ['api.call(rows[0].id, (err, resp) => {', '조회 결과로 API'], ['fs.writeFile("./log", resp, (err) => {', '응답을 로그로']];
  function s4(t, c) { const { k, u } = c;
    const X = 40, Y0 = 50, RH = 34, IND = 34;
    const open = Math.min(k + 1, 4), closing = k === 4 ? E(u, 0.2, 2.2) * 4 : k >= 5 ? 4 : 0;
    // 들여쓰기 자
    for (let i = 0; i <= 4; i++) { el('line', { x1: X + i * IND, y1: Y0 - 16, x2: X + i * IND, y2: Y0 + 9 * RH, stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '2 5' }); }
    for (let i = 0; i < open; i++) { const appear = i === k ? E(u, 0.2, 0.9) : 1, x = X + i * IND, y = Y0 + i * RH;
      const col = i >= 2 ? (i >= 3 ? BAD : WARN) : ACC;
      el('rect', { x, y, width: 470 * appear, height: RH - 6, rx: 5, fill: i >= 3 ? BADBG : i >= 2 ? WARNBG : ACCBG });
      mono(x + 10, y + 19, HELL[i][0], { 'font-size': 13.5, fill: INK, opacity: fade(u, i === k ? 0.5 : -1) });
      // if (err) 칩
      pill(x + 520, y + 14, 'if (err)', col, i === k ? pop(u, 0.9) : 1, { mono: true, fs: 13.5 }); }
    // 가운데 한 줄
    if (k >= 3) { const y = Y0 + 4 * RH, x = X + 4 * IND; mono(x + 10, y + 19, 'console.log("완료")', { 'font-size': 13.5, fill: MUT, opacity: k === 3 ? fade(u, 1.4) : 1 }); }
    // 닫는 괄호
    for (let i = 0; i < 4; i++) { if (closing <= i) break; const y = Y0 + (5 + i) * RH, x = X + (3 - i) * IND;
      mono(x + 10, y + 19, '});', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: clamp(closing - i) }); }
    // 오른쪽 계기
    const depth = open, errs = open;
    const pd = k > 0 && k <= 3 ? tween(k, k + 1, u) : depth;
    tx(760, 90, '중첩 깊이', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
    mono(760, 130, Math.round(pd) + '단', { 'font-size': 32, 'font-weight': 800, fill: depth >= 3 ? (depth >= 4 ? BAD : WARN) : ACC });
    tx(760, 180, 'if (err) 복사본', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
    mono(760, 220, Math.round(pd) + '개', { 'font-size': 32, 'font-weight': 800, fill: errs >= 3 ? WARN : INK });
    if (k === 2) { el('line', { x1: X, y1: Y0 + 3 * RH - 3, x2: 640, y2: Y0 + 3 * RH - 3, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '8 5', opacity: fade(u, 1.4) });
      tx(760, 270, '3단 = 경고선', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.5) }); }
    if (k === 3) tx(760, 270, '정작 하는 일은 로그 한 줄', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
    if (k === 4) { tx(760, 270, '닫는 괄호도 네 겹', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      tx(760, 296, '단계 하나 끼우면 다시 맞춘다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 5) { // 피라미드 윤곽이 자란다
      const xs = [0, 1, 2, 3, 4, 3, 2, 1, 0], pts = [];   // 줄마다 들여쓰기 왼쪽 끝을 따라 계단을 그린다
      xs.forEach((d, i) => { const x = X + d * IND - 6; pts.push([x, Y0 + i * RH - 3], [x, Y0 + (i + 1) * RH - 3]); });
      const f = E(u, 0.2, 1.4), n = pts.length - 1, kk = f * n, j = Math.floor(kk), ps = pts.slice(0, j + 1);
      if (j < n) ps.push([lerp(pts[j][0], pts[j + 1][0], kk - j), lerp(pts[j][1], pts[j + 1][1], kk - j)]);
      el('polyline', { points: ps.map((q) => q.join(',')).join(' '), fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-linejoin': 'round' });
      banner(800, 330, '파멸의 피라미드', pop(u, 1.5));
      tx(800, 378, '다음 해법: Promise', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) }); } }

  // ---------- 5. 함정과 탈출 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { // 함정 1: err 를 안 본다
      card(220, 120, 330, 60, { rx: 10, text: '(err, data) => use(data)', fs: 15, mono: true });
      fly(220, 30, 150, 120, seg(u, 0.2, 0.8), 'Error', { fill: BAD, mono: true });
      const fall = E(u, 0.9, 1.7);
      if (u > 0.8) card(150, lerp(150, 330, fall), 70, 28, { rx: 6, text: 'Error', fs: 13.5, mono: true, fw: 700, stroke: 'none', fill: BAD, color: PANEL, op: 1 - fall * 0.8 });
      sub(150, 380, '아무도 안 봤다', fade(u, 1.6), { fill: BAD, 'font-weight': 700, 'font-size': 15 });
      grow(390, 120, 650, 120, E(u, 1.2, 1.8), MUT); fly(390, 88, 530, 88, seg(u, 1.2, 1.8), 'data = undefined', { fill: OFF, color: INK, mono: true, stay: true });
      card(760, 120, 210, 60, { rx: 10, text: '저 멀리 다른 함수', fs: 15, stroke: BAD, s: pop(u, 1.9) });
      pill(760, 190, '여기서 터진다', BAD, pop(u, 2.2), { fs: 14 });
      return; }
    if (k === 1) { // 함정 2: return 누락 → 콜백 두 번
      card(230, 90, 380, 48, { rx: 8, text: 'if (err) cb(err);      // return 없음', fs: 14, mono: true, stroke: BAD });
      card(230, 160, 380, 48, { rx: 8, text: 'cb(null, data);', fs: 14, mono: true });
      dot([[40, 90], [420, 90], [440, 125], [420, 160], [40, 160]], seg(u, 0.2, 1.6), BAD, 7);
      const n = u < 0.9 ? 0 : u < 1.6 ? 1 : 2;
      card(620, 120, 150, 120, { rx: 10, stroke: n >= 2 ? BAD : GRID, sw: 2.5 });
      tx(620, 92, 'cb 호출 횟수', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700 });
      mono(620, 150, String(n), { 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 800, fill: n >= 2 ? BAD : INK });
      [0, 1].forEach((i) => { const a = 0.9 + i * 0.7; fly(700, 120, 880, 222 + i * 34, seg(u, a, a + 0.6), i ? '응답 2' : '응답 1', { fill: i ? BAD : INK, stay: true }); });
      R.person(880, 320, '클라이언트', { s: pop(u, 0.3) });
      tx(600, 380, '응답이 두 번 가고, 로직도 두 번 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) });
      return; }
    if (k === 2) { // fs/promises: 콜백 자리 대신 Promise 를 돌려받는다
      const m = E(u, 0.6, 1.6);
      card(260, 140, 360, 64, { rx: 10, text: 'fs.readFile(path, cb)', fs: 16, mono: true, op: 1 - m });
      card(260, 140, 360, 64, { rx: 10, text: 'fsp.readFile(path)', fs: 16, mono: true, stroke: ACC, color: ACC, op: m });
      grow(450, 140, 610, 140, E(u, 1.4, 1.9), ACC);
      const s = pop(u, 1.8); el('circle', { cx: 690, cy: 140, r: 40 * s, fill: WARNBG, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
      mono(690, 146, 'Promise', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      sub(690, 205, '결과를 값으로 돌려받는다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      tx(480, 300, '한 번 확정되면 다시 바뀌지 않으니, 두 번 호출 함정이 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.3) });
      return; }
    if (k === 3) { // 피라미드가 평평해진다
      const f = E(u, 0.4, 1.8), rows = ['const cfg = await fsp.readFile(…)', 'const rows = await db.query(…)', 'console.log("평평하다")'];
      rows.forEach((s, i) => { const x = 60 + lerp(i * 60, 0, f), y = 70 + i * 52;
        el('rect', { x, y, width: 420, height: 38, rx: 6, fill: ACCBG });
        mono(x + 12, y + 25, s, { 'font-size': 14.5 }); });
      tx(60, 260, '들여쓰기', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
      mono(160, 260, lerp(4, 1, f).toFixed(0) + '단', { 'font-size': 18, 'font-weight': 800, fill: f > 0.9 ? GOOD : WARN });
      tx(600, 120, '위에서 아래로', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      tx(600, 150, '쓰인 순서대로 읽힌다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) });
      grow(580, 70, 580, 190, E(u, 1.8, 2.4), ACC);
      return; }
    // k4: if (err) 네 개가 catch 하나로
    [0, 1, 2, 3].forEach((i) => { const f = E(u, 0.3 + i * 0.3, 0.9 + i * 0.3), x = lerp(90, 440, f), y = lerp(60 + i * 50, 135, f);
      if (f < 0.97) card(x, y, 120, 34, { rx: 17, text: 'if (err)', fs: 14, mono: true, stroke: WARN, color: WARN, op: f > 0.75 ? 0.1 : 1 }); });
    card(520, 135, 200, 70, { rx: 10, text: 'catch (err)\n한 곳에서', fs: 15, mono: false, stroke: GOOD, color: GOOD, s: pop(u, 0.2) });
    const rows = [['중첩 콜백', '평평한 흐름'], ['단계마다 if (err)', 'catch 하나'], ['거꾸로 읽힘', '위에서 아래로']];
    rows.forEach(([a, b], i) => { const y = 270 + i * 44, op = fade(u, 1.8 + i * 0.2);
      tx(100, y, a, { 'font-size': 15, fill: MUT, 'text-decoration': 'line-through', opacity: op });
      grow(300, y - 5, 380, y - 5, E(u, 1.9 + i * 0.2, 2.2 + i * 0.2), ACC);
      tx(400, y, b, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: op }); });
    tx(700, 300, '다음 장: Promise', { 'font-size': 18, 'font-weight': 800, fill: INK, opacity: fade(u, 2.4) }); }

  const quiz = [
    { q: 'fs.readFile(path, cb)를 호출한 순간 일어나는 일은 무엇인가?',
      o: ['cb가 바로 실행되고 그동안 다음 줄은 기다린다', 'libuv에 읽기를 맡기고 곧장 다음 줄로 넘어간다', '파일을 다 읽을 때까지 메인 스레드가 멈춘다'], a: 1,
      why: '콜백은 넘기는 순간 실행되지 않는다. 읽기가 끝나면 cb가 큐에 실리고, 콜 스택이 빈 뒤 이벤트 루프가 불러 준다.' },
    { q: 'A를 찍고, setTimeout(B, 0)을 걸고, C를 찍었다. 출력 순서는 무엇인가?',
      o: ['A → B → C', 'B → A → C', 'A → C → B'], a: 2,
      why: '0ms 여도 B는 큐로 간다. 동기 코드 A, C가 끝나 콜 스택이 빈 뒤에야 B가 실행된다.' },
    { q: 'readFile 호출을 try/catch로 감쌌는데 콜백 안 throw가 잡히지 않는 이유는 무엇인가?',
      o: ['콜백이 불릴 때는 try 블록이 이미 끝나 있어서', 'catch에 인자를 적지 않아서', 'readFile은 에러를 만들지 않아서'], a: 0,
      why: '콜백은 나중에 다른 실행 맥락에서 불린다. 그래서 에러는 throw 대신 첫 인자 err로 전달되고, 콜백 첫 줄에서 검사한다.' },
    { q: '순차 비동기 4단계를 콜백으로 이었을 때 생기는 일이 아닌 것은 무엇인가?',
      o: ['들여쓰기가 4단까지 깊어진다', 'if (err)가 단계마다 복사된다', '네 작업이 동시에 실행되어 빨라진다'], a: 2,
      why: '앞 결과가 있어야 다음을 하므로 안쪽으로 들어갈 뿐, 빨라지지 않는다. 깊이 4단, if (err) 4개, 닫는 괄호 4겹이 남는다.' },
    { q: 'if (err) cb(err); 다음 줄에 바로 cb(null, data)가 있다. 에러가 나면 어떻게 되는가?',
      o: ['cb가 두 번 불린다', 'cb가 한 번도 불리지 않는다', '두 번째 호출은 Node가 막아 준다'], a: 0,
      why: 'return이 없어 아래 줄까지 내려간다. 응답이 두 번 가는 버그가 되고, Promise는 한 번만 확정되므로 이 함정이 없다.' },
  ];

  const summary = [
    '콜백은 일이 끝나면 불러 달라고 넘겨 두는 함수다. 넘기는 순간에는 실행되지 않는다.',
    '동기 코드가 다 끝나 콜 스택이 비어야 큐의 콜백이 돈다. 그래서 A, C, B 순서로 찍힌다.',
    'Node 콜백은 첫 인자가 err다. 콜백 첫 줄에서 검사하고 바로 return 한다.',
    '콜백을 네 번 이으면 들여쓰기 4단과 if (err) 4개가 생긴다. Promise와 async가 이를 편다.',
  ];
  const review = [
    { q: 'readFile 콜백 안에서 result에 값을 넣고, 호출 바로 아랫줄에서 result를 찍었더니 undefined다. 고칠 방법은?',
      o: ['readFile 앞에 setTimeout(fn, 0)을 하나 더 건다', 'result를 쓰는 코드를 콜백 안으로 옮긴다', 'result를 let 대신 const로 바꾼다'], a: 1,
      why: '아랫줄은 동기 코드라 읽기가 끝나기 전에 실행된다. 결과는 콜백이 불린 뒤에만 있으므로 그 안에서 쓴다.' },
    { q: '응답이 가끔 두 번 전송된다는 신고가 왔다. 콜백 코드에서 먼저 찾아볼 것은?',
      o: ['콜백 안의 들여쓰기 깊이', 'setTimeout의 지연 시간', 'if (err) cb(err) 뒤에 return이 빠진 곳'], a: 2,
      why: 'return이 없으면 에러 경로와 정상 경로가 둘 다 실행되어 콜백이 두 번 불린다.' },
    { q: '설정 읽기, DB 조회, API 호출, 로그 쓰기를 콜백으로 이어 놓았다. 중간에 단계 하나를 끼우기 가장 쉬운 방법은?',
      o: ['fs/promises와 await로 바꿔 한 줄씩 늘어놓는다', '콜백을 한 겹 더 중첩하고 괄호를 맞춘다', '모든 단계를 setTimeout으로 감싼다'], a: 0,
      why: 'await로 펴면 단계가 위에서 아래로 한 줄씩 놓이고, 에러는 catch 하나에서 잡힌다. 끼울 때 괄호를 다시 맞출 일이 없다.' },
  ];

  R.page({ title: '콜백이 큐를 거쳐 돌아오는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
