/* III-2-1 EventEmitter — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 1 on/emit 발행-구독 · 2 once/off/인자 · 3 emit 은 동기 (콜 스택) · 4 error 특별 취급·누수 경고 · 5 EventEmitter vs Promise
 * 실측값(node v24): emit 은 리스너를 등록 순서대로 그 자리에서 호출 → "작업 시작 / A 받음: 42 / B 받음: 42 / emit 다음 줄",
 *   setTimeout 0 콜백은 그 뒤. once 리스너는 실행 뒤 listenerCount 0. 모양이 같은 다른 함수로 off → 1개 그대로.
 *   리스너 없는 emit("error") → throw. 기본 한도 10, 11번째 등록에서 MaxListenersExceededWarning 한 번. setMaxListeners(20) 을 먼저 하면 12개에도 경고 없음.
 *   fs.createReadStream 의 청크 기본 크기 65536 바이트. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, cells, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  // 함수 카드 (리스너 하나)
  function fnCard(cx, cy, name, o) { o = o || {}; return card(cx, cy, o.w || 170, 40, { rx: 8, text: name, fs: 14.5, mono: true, stroke: o.col || INFO, color: o.col || INFO, fill: o.hot ? (o.col === GOOD ? GOODBG : INFOBG) : PANEL, sw: o.hot ? 3 : 2, s: o.s, op: o.op, dash: o.dash }); }
  // 이미터 상자 + 이벤트 이름별 리스너 칸
  function emitter(x, y, name, rows, o) { o = o || {}; const w = o.w || 300, h = 54 + rows.reduce((a, r) => a + 34 + Math.max(1, r.slots) * 48, 0);
    el('rect', { x, y, width: w, height: h, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 2.2, opacity: o.op ?? 1 });
    mono(x + 16, y + 30, name, { 'font-size': 16, 'font-weight': 800, opacity: o.op ?? 1 });
    let yy = y + 54; const pos = [];
    rows.forEach((r) => { mono(x + 16, yy + 20, `"${r.evt}" →`, { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      const ps = []; for (let i = 0; i < Math.max(1, r.slots); i++) { const cy = yy + 34 + 24 + i * 48; ps.push([x + w / 2 + 14, cy]);
        el('rect', { x: x + 40, y: cy - 22, width: w - 52, height: 44, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
        mono(x + 52, cy + 5, String(i), { 'font-size': 13.5, fill: MUT }); }
      pos.push(ps); yy += 34 + Math.max(1, r.slots) * 48; });
    return pos; }

  // ---------- 1. on 으로 등록, emit 으로 발생 ----------
  const OUT1 = ['메일 발송: A-1001', '재고 차감: A-1001'];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const g = card(300, 170, 260, 170, { rx: 12, stroke: INK, dash: '7 6', s: pop(u, 0.2) });
      tx(0, -52, 'class EventEmitter', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono' }, g);
      ['on(evt, fn)', 'emit(evt, …args)', 'once · off'].forEach((s, i) => mono(-96, -12 + i * 30, s, { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.7 + i * 0.3) }, g));
      mono(300, 300, 'require("events")', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
      note(520, 160, '설계도만 있다', fade(u, 1.6), { fill: MUT }); note(520, 192, '발행자도, 구독자도 아직 없다', fade(u, 1.9), { fill: MUT }); return; }
    const n = k === 1 ? 0 : k === 2 ? 1 : k <= 4 ? 2 : 3;
    const pos = emitter(250, 40, 'bus', [{ evt: 'order:created', slots: 3 }], { op: k === 1 ? fade(u, 0.1) : 1 })[0];
    const L = [['sendEmail', '메일 발송'], ['updateStock', '재고 차감'], ['logAudit', '감사 로그']];
    const fire = k === 4 ? [E(u, 0.9, 1.2), E(u, 1.4, 1.7)] : [0, 0];
    L.slice(0, n).forEach(([f, d], i) => { const fresh = (k === 2 && i === 0) || (k === 3 && i === 1) || (k === 5 && i === 2);
      const [x, y] = pos[i], a = fresh ? E(u, 0.3, 1.1) : 1;
      fnCard(lerp(820, x, a), lerp(y - 30, y, a), f, { hot: fire[i] > 0.5 && u < 2.4, dash: i === 2, col: i === 2 ? MUT : INFO });
      if (fresh) note(620, 330, i === 0 ? 'on = "나면 실행해 줘" 예약 · 지금 실행되는 건 없다' : i === 1 ? '덮어쓰기가 아니라 목록 뒤에 추가' : '새 관심사는 on 하나로 붙인다', fade(u, 1.3), { fill: MUT, 'font-size': 14 }); });
    // 발행자
    card(110, 112, 160, 50, { rx: 10, text: '주문 서비스', fs: 15, stroke: INK, op: k >= 4 ? 1 : 0.4 });
    if (k === 1) { note(600, 150, 'bus = new EventEmitter()', fade(u, 0.5), { class: 'mono' }); note(600, 186, '리스너가 없어 emit 해도 아무 일도 없다', fade(u, 1.3), { fill: MUT, 'font-size': 14 }); }
    if (k === 4) { pill(400, 306, 'emit("order:created", { id })', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      dot([[190, 112], [250, 112], [pos[0][0] - 90, pos[0][1]]], seg(u, 0.3, 0.9), ACC, 8); dot([[pos[0][0] - 90, pos[0][1]], [pos[1][0] - 90, pos[1][1]]], seg(u, 1.0, 1.4), ACC, 8);
      terminal(600, 230, 330, 120, OUT1, (u > 1.2) + (u > 1.7), { title: 'node basic.js' }); }
    if (k === 5) { R.snippet(40, 300, ['bus.emit("order:created", { id });'], { fs: 13.5 }); check(370, 320, 10, pop(u, 1.6)); note(40, 380, 'emit 코드는 한 글자도 안 바뀐다', fade(u, 1.8), { fill: GOOD }); } }

  // ---------- 2. once · off · 인자 ----------
  function s2(t, c) { const { k, u } = c;
    const readyGone = k >= 2 ? (k === 2 ? E(u, 0.8, 1.2) : 1) : 0, dataGone = k >= 4 ? (k === 4 ? E(u, 1.6, 2.0) : 1) : 0;
    const pos = emitter(40, 40, 'conn', [{ evt: 'ready', slots: 1 }, { evt: 'data', slots: 1 }], { w: 320 });
    if (readyGone < 1) { const g = fnCard(pos[0][0][0], pos[0][0][1], '() => 준비 완료', { s: k === 0 ? pop(u, 0.4) : 1, op: 1 - readyGone, w: 200, hot: k === 2 && u > 0.4 && u < 0.8 });
      pill(pos[0][0][0] + 110, pos[0][0][1] - 22, 'once · 1회', WARN, (k === 0 ? pop(u, 0.9) : 1) * (1 - readyGone), { fs: 13.5, fill: PANEL }); }
    if (k >= 1 && dataGone < 1) fnCard(pos[1][0][0], pos[1][0][1], 'onData', { s: k === 1 ? pop(u, 1.2) : 1, op: 1 - dataGone, hot: k === 2 && u > 1.8 });
    const T = (lines, n) => terminal(560, 250, 370, 150, lines, n, { title: 'node manage.js' });
    if (k === 0) { note(420, 120, 'once 는 한 번 듣고 스스로 빠진다', fade(u, 1.2), { fill: WARN }); note(420, 152, '"준비 완료"처럼 생애 한 번뿐인 신호에', fade(u, 1.7), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 1) { mono(440, 80, 'function onData(chunk, unit)', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
      grow(520, 92, pos[1][0][0] + 60, pos[1][0][1] - 22, E(u, 0.6, 1.1), INFO);
      mono(440, 300, 'on("data", () => { … })', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); note(440, 332, '익명이면 나중에 가리킬 이름이 없다', fade(u, 2.0), { fill: WARN, 'font-size': 14 }); return; }
    if (k === 2) { pill(560, 70, 'emit("ready")', ACC, pop(u, 0.1), { mono: true, fs: 13.5 }); dot([[500, 70], [pos[0][0][0] + 90, pos[0][0][1]]], seg(u, 0.2, 0.6), ACC, 7);
      pill(560, 120, 'emit("data", 40, "MB")', ACC, pop(u, 1.1), { mono: true, fs: 13.5 });
      fly(640, 140, 470, 196, seg(u, 1.3, 1.9), '40', { mono: true }); fly(700, 140, 560, 196, seg(u, 1.4, 2.0), '"MB"', { mono: true });
      mono(420, 202, 'chunk = 40,  unit = "MB"', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      T(['연결 준비 완료', '수신: 40 MB'], (u > 0.7) + (u > 2.0)); return; }
    T(['연결 준비 완료', '수신: 40 MB'], 2);
    if (k === 3) { pill(560, 70, 'emit("ready")  — 두 번째', ACC, pop(u, 0.1), { mono: true, fs: 13.5 }); dot([[500, 70], [pos[0][0][0] + 90, pos[0][0][1]]], seg(u, 0.3, 0.9), ACC, 7);
      mono(560, 150, '→ false  (듣는 리스너 없음)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.1) });
      note(560, 200, '에러가 아니라 무반응이다', fade(u, 1.5), { fill: WARN }); return; }
    if (k === 4) { mono(420, 70, 'off("data", (c, u) => …)', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 0.2) }); mono(780, 70, '→ 그대로 1개', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
      mono(420, 120, 'off("data", onData)', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) }); mono(780, 120, '→ 0개', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      note(420, 180, '모양이 같아도 다른 함수면 못 뗀다 — 같은 참조만', fade(u, 2.0), { fill: MUT, 'font-size': 14 }); return; }
    pill(560, 70, 'emit("data", 99, "MB")', ACC, pop(u, 0.1), { mono: true, fs: 13.5 }); dot([[500, 70], [pos[1][0][0] + 90, pos[1][0][1]]], seg(u, 0.3, 0.9), ACC, 7);
    mono(560, 120, '(출력 없음)', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
    ['on · 매번', 'once · 1회', 'off · 떼기', 'emit · 인자 전달'].forEach((s, i) => pill(470 + (i % 2) * 190, 170 + Math.floor(i / 2) * 40, s, i === 2 ? BAD : i === 1 ? WARN : ACC, pop(u, 1.3 + i * 0.2), { fs: 13.5, fill: PANEL })); }

  // ---------- 3. 커스텀 이미터 · emit 은 동기 ----------
  const OUT3 = ['작업 시작', 'A 받음: 42', 'B 받음: 42', 'emit 다음 줄'];
  function stackCol(frames) { zone(340, 40, 240, 340, '콜 스택', { fill: SOFT });
    frames.forEach(([s, col, a], i) => { if (a <= 0) return; card(460, 352 - i * 54, 200, 44, { rx: 8, text: s, fs: 14.5, mono: true, stroke: col, color: col, fill: PANEL, s: 0.7 + 0.3 * a, op: a }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(240, 120, 300, 70, { rx: 10, text: 'EventEmitter\non · emit · once · off', fs: 15, stroke: ACC, color: ACC, fill: ACCBG });
      card(240, 300, 300, 70, { rx: 10, text: 'class Job\nrun()', fs: 15, stroke: INK, s: pop(u, 0.3) });
      grow(240, 262, 240, 158, E(u, 0.8, 1.3), ACC); tx(256, 216, 'extends', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: ACC, opacity: fade(u, 1.1) });
      note(480, 190, 'Job 인스턴스가 on · emit 을 그대로 갖는다', fade(u, 1.6)); note(480, 224, 'http.Server 도 이렇게 만들어졌다', fade(u, 2.1), { fill: MUT, 'font-size': 14 }); return; }
    const code = ['run() {', '  console.log("작업 시작");', '  this.emit("done", 42);', '  console.log("emit 다음 줄");', '}'];
    if (k === 1) { R.snippet(40, 60, code, { fs: 14.5 }); el('rect', { x: 46, y: 117, width: 290, height: 24, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 0.6) });
      note(40, 240, 'emit 은 setTimeout 처럼 미루지 않는다', fade(u, 1.0), { fill: ACC }); note(40, 272, '그 줄에서 리스너를 부르고, 끝나야 다음 줄로', fade(u, 1.6), { fill: MUT, 'font-size': 14 }); return; }
    // 리스너 목록 (오른쪽 위)
    const nL = k === 2 ? 1 : 2;
    zone(620, 40, 310, 150, 'job · "done" 리스너', { fill: SOFT });
    ['A', 'B'].slice(0, nL).forEach((n, i) => fnCard(700 + i * 150, 110, `${n}(n)`, { w: 120, s: (k === 2 && i === 0) || (k === 3 && i === 1) ? pop(u, 0.4) : 1 }));
    if (k === 3) { grow(762, 110, 788, 110, E(u, 1.0, 1.3), WARN); note(620, 220, 'A 가 끝나야 B 가 시작된다 — 병렬이 아니다', fade(u, 1.4), { fill: WARN, 'font-size': 14 }); }
    if (k === 2) { note(620, 220, 'job.on("done", A) — 아직 run() 전', fade(u, 1.0), { fill: MUT, 'font-size': 14 }); }
    if (k <= 3) { R.snippet(40, 60, code, { fs: 14, op: 0.6 }); return; }
    // k4: 콜 스택이 쌓였다 빠지는 모습, k5: 끝난 상태
    const tt = k === 4 ? u : 3;
    const on = (a, b) => (tt >= a && tt < b ? 1 : 0);
    if (k === 4) stackCol([['job.run()', INK, on(0.2, 2.5)], ['bus.emit("done")', ACC, on(0.9, 2.1)], ['A(42)', INFO, on(1.1, 1.5) || 0], ['', INK, 0]]);
    if (tt >= 1.55 && tt < 1.95) card(460, 352 - 2 * 54, 200, 44, { rx: 8, text: 'B(42)', fs: 14.5, mono: true, stroke: INFO, color: INFO });
    if (tt >= 0.4 && tt < 0.6) card(460, 352 - 54, 200, 44, { rx: 8, text: 'console.log', fs: 14.5, mono: true, stroke: MUT, color: MUT });
    if (tt >= 2.2 && tt < 2.45) card(460, 352 - 54, 200, 44, { rx: 8, text: 'console.log', fs: 14.5, mono: true, stroke: MUT, color: MUT });
    const n = (tt > 0.5) + (tt > 1.3) + (tt > 1.75) + (tt > 2.3);
    terminal(620, 210, 310, 150, OUT3, n, { title: 'node custom.js' });
    R.snippet(40, 60, code, { fs: 13.5 });
    if (k === 4) { note(40, 240, '출력 순서 = 실행 순서', fade(u, 2.4), { fill: ACC }); return; }
    note(40, 236, '리스너 C 를 더 걸어도 B 다음, "emit 다음 줄" 앞', fade(u, 0.4), { 'font-size': 14 });
    note(40, 268, 'setTimeout(…, 0) 콜백은 이 네 줄이 다 찍힌 뒤 (실측)', fade(u, 1.2), { 'font-size': 14, fill: MUT });
    note(40, 300, '무거운 리스너 하나가 뒤를 전부 멈춘다', fade(u, 1.9), { fill: BAD }); }

  // ---------- 4. error 특별 취급 · 누수 경고 ----------
  function proc(x, y, alive, s) { const g = card(x, y, 170, 64, { rx: 12, stroke: alive ? GOOD : BAD, fill: alive ? GOODBG : BADBG, sw: 2.5, s });
    tx(0, -4, 'node 프로세스', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: alive ? GOOD : BAD }, g); tx(0, 18, alive ? '살아 있음' : '종료됨', { 'font-size': 13.5, 'text-anchor': 'middle', fill: alive ? GOOD : BAD }, g); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { const pos = emitter(40, 50, 'src', [{ evt: 'error', slots: 1 }], { w: 300 });
      if (k >= 1) fnCard(pos[0][0][0], pos[0][0][1], '(err) => log', { col: GOOD, s: k === 1 ? pop(u, 0.4) : 1, hot: k === 2 && u > 1.0 });
      const crash = k === 0 ? E(u, 1.2, 1.5) : 0;
      proc(700, 110, !(k === 0 && crash > 0.5), 1);
      pill(560, 230, 'emit("error", new Error("펑"))', BAD, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5, fill: PANEL, op: k === 1 ? 0.35 : 1 });
      if (k === 0) { dot([[430, 230], [pos[0][0][0] + 90, pos[0][0][1]]], seg(u, 0.3, 0.8), BAD, 8);
        mono(180, 280, '리스너 없음 → throw', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) });
        if (crash > 0) { cross(700, 110, 26, crash); }
        note(560, 300, 'error 만은 아무도 안 들으면 프로세스가 죽는다', fade(u, 1.8), { fill: BAD, 'font-size': 14.5 }); return; }
      if (k === 1) { note(420, 300, '실패할 수 있는 이미터엔 on("error") 를 기본으로', fade(u, 1.2), { fill: GOOD }); return; }
      dot([[430, 230], [pos[0][0][0] + 90, pos[0][0][1]]], seg(u, 0.3, 0.9), BAD, 8);
      terminal(420, 300, 400, 80, ['잡음: 펑'], u > 1.2 ? 1 : 0, { title: 'stderr' }); check(800, 150, 12, pop(u, 1.4)); return; }
    // 리스너 칸: 20칸, 한도선
    const lim = k === 4 ? lerp(10, 20, E(u, 0.3, 1.2)) : 10, n = k === 3 ? Math.min(12, Math.floor(E(u, 0.1, 2.0) * 12 + 0.001)) : 12, x0 = 70, cw = 40;
    mono(40, 70, k === 4 ? 'src.setMaxListeners(20)' : 'for (…12) src.on("tick", () => {})', { 'font-size': 15, 'font-weight': 700, fill: k === 4 ? ACC : INK });
    tx(40, 132, '"tick" 리스너', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < 20; i++) { const on = i < n, over = on && i >= Math.floor(lim);
      el('rect', { x: x0 + i * cw, y: 146, width: cw - 6, height: 44, rx: 5, fill: on ? (over ? WARN : INFO) : PANEL, stroke: on ? 'none' : GRID, 'stroke-width': 1.5, opacity: on ? 0.85 : 1 });
      if (i % 5 === 4 || i === 0) mono(x0 + i * cw + 17, 212, String(i + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    const lx = x0 + lim * cw - 3; el('line', { x1: lx, y1: 132, x2: lx, y2: 200, stroke: BAD, 'stroke-width': 3 }); mono(lx, 124, `한도 ${Math.round(lim)}`, { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
    if (k === 3) { const w = n >= 11 ? 1 : 0; card(480, 290, 860, 68, { rx: 10, stroke: WARN, fill: WARNBG, op: w });
      mono(64, 284, 'MaxListenersExceededWarning: Possible EventEmitter memory leak', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: w });
      mono(64, 308, 'detected. 11 tick listeners added … MaxListeners is 10.', { 'font-size': 14, fill: WARN, opacity: w });
      note(40, 380, '11번째에서 한 번 찍힌다 — 에러가 아니라 off 누락 신호', fade(u, 2.2), { fill: MUT, 'font-size': 14.5 }); return; }
    note(40, 270, '정말 많이 필요하면 한도를 올린다 — 걸기 전에 올려야 경고가 없다', fade(u, 1.4), { fill: ACC, 'font-size': 14.5 });
    note(40, 306, '아니라면 off 를 빠뜨린 곳을 찾는다', fade(u, 2.0), { fill: WARN, 'font-size': 14.5 }); }

  // ---------- 5. EventEmitter vs Promise ----------
  const TL = { x0: 230, x1: 900 };
  function s5(t, c) { const { k, u } = c;
    if (k === 5) { tx(480, 52, '값이 몇 번 오나?', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800 });
      grow(400, 80, 260, 160, E(u, 0.3, 0.8), ACC); grow(560, 80, 700, 160, E(u, 0.5, 1.0), ACC);
      card(230, 210, 300, 96, { rx: 12, stroke: INFO, fill: INFOBG, s: pop(u, 0.9) }); tx(230, 196, '정확히 1번 → Promise', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.0) }); mono(230, 226, 'fs.readFile · fetch', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.1) });
      card(730, 210, 300, 96, { rx: 12, stroke: ACC, fill: ACCBG, s: pop(u, 1.3) }); tx(730, 196, '0..N번 → EventEmitter', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) }); mono(730, 226, 'stream · server · 알림', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5) });
      tx(480, 350, '반복·푸시는 이벤트, 한 번의 결과는 Promise', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // 위: Promise 줄, 아래: 스트림 줄
    const PY = 110, SY = 270;
    [[PY, 'Promise', 'await readFile'], [SY, 'EventEmitter', 'createReadStream']].forEach(([y, a, b], i) => { const op = i === 1 && k === 0 ? 0.3 : 1;
      tx(40, y - 4, a, { 'font-size': 16, 'font-weight': 800, fill: i ? ACC : INFO, opacity: op }); mono(40, y + 20, b, { 'font-size': 13.5, fill: MUT, opacity: op });
      el('line', { x1: TL.x0, y1: y, x2: TL.x1, y2: y, stroke: GRID, 'stroke-width': 3, opacity: op }); });
    // Promise: pending → fulfilled 한 번
    const pg = k === 0 ? E(u, 0.3, 1.8) : 1, fx = 760;
    el('line', { x1: TL.x0, y1: PY, x2: lerp(TL.x0, fx, pg), y2: PY, stroke: WARN, 'stroke-width': 6, 'stroke-linecap': 'round' });
    if (pg < 1) mono(TL.x0 + 10, PY - 16, 'pending', { 'font-size': 14, fill: WARN, 'font-weight': 700 });
    if (pg >= 1) { el('circle', { cx: fx, cy: PY, r: 13, fill: INFO }); mono(fx, PY - 22, k === 3 ? 'await 반환 = 끝' : 'data (한 번)', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' }); }
    if (k === 0) { note(TL.x0, PY + 50, '결과가 반환값으로 와서 그 줄에서 바로 쓴다', fade(u, 2.0), { fill: INFO, 'font-size': 14.5 }); return; }
    // 스트림
    const sx = TL.x0 + 20;
    card(sx, SY, 40, 40, { rx: 20, stroke: ACC, fill: ACCBG, s: k === 1 ? pop(u, 0.2) : 1 });
    if (k === 1) { note(TL.x0, SY + 56, '돌려받는 건 값이 아니라 이미터 — 값은 앞으로 밀려온다', fade(u, 1.0), { fill: ACC, 'font-size': 14.5 }); return; }
    const N = 7, ng = k === 2 ? Math.floor(E(u, 0.2, 2.3) * N + 0.001) : N;
    for (let i = 0; i < ng; i++) { const x = sx + 70 + i * 74; el('rect', { x: x - 26, y: SY - 16, width: 52, height: 32, rx: 6, fill: ACC, opacity: 0.85 }); mono(x, SY + 5, '64KB', { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }); }
    mono(sx + 60, SY - 32, `data 이벤트 × ${ng}`, { 'font-size': 15, 'font-weight': 700, fill: ACC });
    if (k === 2) { sub(560, SY + 50, '호출 횟수 = 청크 수 · 파일 크기가 정한다 (7은 예시)', fade(u, 1.0)); return; }
    const ex = sx + 70 + N * 74 - 10;
    card(ex, SY, 60, 32, { rx: 16, text: 'end', fs: 14, mono: true, stroke: INK, color: PANEL, fill: INK, s: k === 3 ? pop(u, 0.4) : 1 });
    if (k === 3) { note(TL.x0, SY + 56, '끝은 반환이 아니라 end 이벤트로 알린다', fade(u, 1.0), { 'font-size': 14.5 }); return; }
    // k === 4: 에러
    card(fx, PY + 54, 220, 40, { rx: 8, text: 'reject → try / catch', fs: 14, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.3) });
    card(560, SY + 66, 300, 40, { rx: 8, text: 'error 이벤트 → on("error")', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.9) });
    note(TL.x0 - 190, 400, 'on("error") 가 없으면 try/catch 밖에서 터져 프로세스가 죽는다', fade(u, 1.6), { fill: BAD, 'font-size': 14.5 }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: '같은 이벤트에 on으로 리스너 두 개를 걸고 emit을 한 번 하면 어떻게 되는가?',
      o: ['나중에 건 리스너만 실행된다', '두 리스너가 등록 순서대로 모두 실행된다', '먼저 건 리스너만 실행된다'], a: 1,
      why: 'on은 덮어쓰지 않고 목록 뒤에 추가한다. emit 한 번이 메일 발송, 재고 차감 순서로 둘 다 깨운다.' },
    { q: 'conn.on("data", (c, u) => …)로 건 리스너를 나중에 떼려면 어떻게 해야 하는가?',
      o: ['같은 모양의 화살표 함수를 off에 넘긴다', 'emit("data")를 한 번 더 부른다', '처음부터 이름 있는 함수로 등록해 그 참조를 off에 넘긴다'], a: 2,
      why: 'off는 참조로 비교한다. 모양이 같은 새 함수를 넘기면 리스너는 1개 그대로 남는다.' },
    { q: 'run() 안에서 this.emit("done", 42)를 부른 뒤 다음 줄의 console.log는 언제 실행되는가?',
      o: ['리스너 A, B가 모두 끝난 뒤 바로', '리스너보다 먼저', '다음 이벤트 루프 차례에'], a: 0,
      why: 'emit은 동기다. 콜 스택에 리스너를 차례로 올려 끝낸 뒤에야 돌아온다. 출력은 작업 시작, A, B, emit 다음 줄 순서다.' },
    { q: '리스너가 하나도 없는 이미터에서 emit("error", err)를 부르면 어떻게 되는가?',
      o: ['조용히 무시된다', '에러가 던져져 잡지 않으면 프로세스가 죽는다', '경고만 찍히고 계속 돈다'], a: 1,
      why: '다른 이벤트는 듣는 리스너가 없으면 false를 돌려줄 뿐이지만 "error"는 특별 취급되어 예외가 된다.' },
    { q: '파일을 64KB씩 여러 번 받아 처리해야 한다. 알맞은 도구는 무엇인가?',
      o: ['스트림의 data·end 이벤트', 'await fs.promises.readFile 한 번', 'setTimeout'], a: 0,
      why: '값이 0..N번 밀려오는 흐름은 이벤트가 맞다. Promise는 결과가 정확히 한 번 오는 작업에 맞는다.' },
  ];
  const summary = [
    'on으로 리스너를 등록하고 emit으로 알리면 등록된 리스너가 순서대로 모두 실행된다.',
    'once는 한 번 실행되고 빠지며, off로 떼려면 등록할 때와 같은 함수 참조가 필요하다.',
    'emit은 동기라서 리스너가 모두 끝나야 emit 다음 줄로 넘어간다.',
    'error 리스너가 없으면 프로세스가 죽고, 리스너가 10개를 넘으면 누수 경고가 뜬다.',
  ];
  const review = [
    { q: '서버를 오래 띄우니 MaxListenersExceededWarning이 떴다. 요청마다 socket.on("data", …)를 새로 걸고 있었다. 먼저 할 일은?',
      o: ['setMaxListeners(1000)으로 경고를 끈다', '요청이 끝날 때 이름 있는 함수로 건 리스너를 off로 뗀다', 'once를 on으로 바꾼다'], a: 1,
      why: '경고는 리스너가 계속 쌓인다는 신호다. 한도를 올리면 증상만 가려지고 누수는 남는다.' },
    { q: '주문 이벤트 리스너 하나가 무거운 계산을 한 뒤로 주문 API 응답이 같이 느려졌다. 이유는?',
      o: ['emit은 리스너가 끝날 때까지 그 자리에서 기다리기 때문이다', '리스너가 많으면 emit이 자동으로 비동기가 되기 때문이다', 'error 리스너가 없어서다'], a: 0,
      why: 'emit은 동기라 리스너 실행이 끝나야 다음 줄로 간다. 오래 걸리는 일은 리스너 안에서 setImmediate 등으로 미룬다.' },
    { q: '파일 스트림을 try { … } catch로 감쌌는데 파일이 없을 때 프로세스가 죽었다. 고칠 곳은?',
      o: ['await를 앞에 붙인다', 'data 리스너를 하나 더 건다', 'stream.on("error", …)를 건다'], a: 2,
      why: '스트림의 실패는 나중에 error 이벤트로 온다. try/catch 밖에서 터지므로 error 리스너만이 막을 수 있다.' },
  ];

  R.page({ title: 'EventEmitter — 리스너 목록과 실행 순서', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
