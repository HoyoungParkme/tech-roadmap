/* I-1-1 Node.js란 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행해 본 값(node v24.14.0, 이 컴퓨터): 50MB 파일 readFileSync 98ms · readFile 의 B) 1ms, C) 42ms,
 * heavySum(5e9) 4.5초 · 10ms 타이머 최대 지연 4,853ms(메인) / 77ms(Worker), 스레드 풀 기본 4개. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, browser, cross, check, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const CODE1 = { 0: ['const http = require("http");'], 1: ['const server = http.createServer(', '  (req, res) => { … });'], 2: ['res.end("Hello from Node!");'],
    3: ['server.listen(3000, () => {', '  console.log("서버 실행: …");', '});'], 4: ['$ node app.js'] };

  // 톱니 (V8 엔진)
  function cog(cx, cy, r, rot, col) { const g = el('g', { transform: `translate(${cx} ${cy}) rotate(${rot})` });
    for (let i = 0; i < 8; i++) el('rect', { x: -5, y: -r - 7, width: 10, height: 12, rx: 2, fill: col, transform: `rotate(${i * 45})` }, g);
    el('circle', { cx: 0, cy: 0, r, fill: PANEL, stroke: col, 'stroke-width': 4 }, g); el('circle', { cx: 0, cy: 0, r: r * 0.35, fill: col }, g); }
  // 런타임 층: stdlib · V8 · libuv · OS
  const LX = 510, LW = 420;
  const LAYERS = [{ key: '표준 라이브러리', y: 62, sub: 'JS 모듈' }, { key: 'V8', y: 150, sub: 'from Chrome' }, { key: 'libuv', y: 238, sub: 'C 라이브러리' }];
  function stack(c, o) { const parts = c.beat.runtime.parts, u = c.u, k = c.k;
    LAYERS.forEach((L, i) => { const p = parts.find((q) => q.name === L.key); if (!p) return;
      const isNew = !(c.prev && c.prev.runtime.parts.find((q) => q.name === L.key)), s = isNew ? pop(u, 0.15) : 1;
      const hot = p.tone === 'point', col = hot ? ACC : p.tone === 'good' ? GOOD : INK;
      card(LX + LW / 2, L.y + 34, LW, 68, { rx: 10, stroke: col, sw: hot ? 2.8 : 1.8, fill: hot ? ACCBG : PANEL, s });
      if (s < 0.5) return;
      tx(LX + 16, L.y + 28, L.key, { 'font-size': 17, 'font-weight': 800, fill: col });
      if (!(o && o.noRole && L.key === '표준 라이브러리')) tx(LX + 16, L.y + 52, p.role, { 'font-size': 13.5, fill: MUT });
      mono(LX + LW - 14, L.y + 24, L.sub, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
    // OS 바닥
    el('rect', { x: LX, y: 326, width: LW, height: 40, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(LX + LW / 2, 351, '운영체제 — 파일 · 소켓 · 스레드', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 600 }); }

  // ---------- 1. 런타임 구성 ----------
  function s1(t, c) { const { k, u } = c;
    stack(c, { noRole: k === 0 });
    snippet(24, 30, CODE1[k], { fs: 14.5, op: fade(u, 0.1, 0.3) });
    if (k === 0) { ['http', 'fs', 'path', 'crypto'].forEach((m, i) => pill(LX + 40 + [0, 56, 108, 172][i], 114, m, i === 0 ? ACC : MUT, pop(u, 0.4 + i * 0.12), { mono: true, fs: 13.5 }));
      fly(LX + 40, 114, 150, 170, seg(u, 1.1, 2.0), 'http', { mono: true, stay: true });
      if (u > 2.0) { card(150, 220, 230, 54, { rx: 10, text: 'http = { createServer, get … }', fs: 13.5, mono: true, stroke: ACC, s: pop(u, 2.0) }); }
      note(24, 320, '브라우저에는 없는 서버용 모듈', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 1) { const rot = t * 120; cog(LX + 260, 184, 20, rot, ACC);
      dot([[260, 75], [LX + 232, 184]], seg(u, 0.3, 1.2), ACC, 7);
      if (u > 1.3) { grow(LX - 10, 196, 330, 220, E(u, 1.3, 1.8), ACC); card(200, 230, 250, 62, { rx: 10, text: 'server\n요청 핸들러 1개 등록', fs: 14.5, stroke: ACC, s: pop(u, 1.8) }); }
      note(24, 320, 'JS 소스를 컴파일해 실행하는 주체 = V8', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 2) { browser(110, 250, 150, 96, '브라우저 · curl');
      card(330, 250, 120, 50, { rx: 10, text: 'server', fs: 15, stroke: ACC });
      dot([[186, 238], [270, 238]], seg(u, 0.2, 0.9), INFO, 7); pill(228, 214, 'GET /', INFO, pop(u, 0.2), { mono: true, fs: 13.5 });
      fly(300, 280, 110, 256, seg(u, 1.0, 2.0), 'Hello from Node!', { mono: true, stay: true });
      if (u > 2.0) mono(110, 294, '200 OK', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
      sub(250, 370, '실행해 보면: 200 Hello from Node!', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { // libuv 고리가 돈다 + :3000 소켓
      const cx = LX + 250, cy = 272, r = 26, a = t * 3;
      el('circle', { cx, cy, r, fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': '10 7', 'stroke-dashoffset': -t * 30, opacity: fade(u, 0.3) });
      el('circle', { cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, r: 6, fill: GOOD, opacity: fade(u, 0.3) });
      pill(300, 230, ':3000 대기 중', GOOD, pop(u, 0.9), { mono: true, fs: 15 });
      grow(370, 238, LX + 218, 264, E(u, 1.2, 1.9), GOOD);
      note(24, 320, 'listen 뒤로 프로세스가 끝나지 않는다', fade(u, 2.0), { fill: GOOD }); return; }
    // k4: 실행 + 세 역할
    terminal(24, 120, 440, 120, ['$ node app.js', '서버 실행: http://localhost:3000'], lerp(0, 2, E(u, 0.2, 1.4)), { title: 'terminal' });
    [['언어', 0, ACC], ['동시성', 2, GOOD], ['실무 API', 1, INK]].forEach(([s, li, col], i) => { const L = LAYERS[[1, 2, 0][i]];
      pill(LX + 270, L.y + 34, s, col, pop(u, 1.5 + i * 0.25), { fs: 14 }); });
    note(24, 300, 'Node = V8 + libuv + 표준 라이브러리', fade(u, 2.3), { 'font-size': 16, 'font-weight': 800 }); }

  // ---------- 2. 단일 스레드 이벤트 루프 ----------
  const MAIN = { x: 230, y: 54, w: 250, h: 120 }, POOL = { x: 560, y: 54, w: 370 }, Q = { x: 560, y: 262 };
  function frame(s, col, sc) { card(MAIN.x + MAIN.w / 2, MAIN.y + 76, MAIN.w - 30, 44, { rx: 8, text: s, fs: 14.5, mono: true, stroke: col || ACC, fill: PANEL, s: sc }); }
  function loopRing(cx, cy, t, on) { el('circle', { cx, cy, r: 46, fill: 'none', stroke: on ? ACC : GRID, 'stroke-width': 3, 'stroke-dasharray': '12 8', 'stroke-dashoffset': on ? -t * 40 : 0 });
    const a = on ? t * 2.2 : -1.57; el('circle', { cx: cx + Math.cos(a) * 46, cy: cy + Math.sin(a) * 46, r: 7, fill: on ? ACC : OFF });
    tx(cx, cy + 5, '이벤트 루프', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? ACC : MUT }); }
  function pool(busy) { zone(POOL.x, POOL.y, POOL.w, 170, 'libuv 스레드 풀 (기본 4개)', { fill: SOFT });
    for (let i = 0; i < 4; i++) { const y = POOL.y + 38 + i * 32, b = busy[i];
      mono(POOL.x + 16, y + 17, `T${i + 1}`, { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      el('rect', { x: POOL.x + 52, y: y + 3, width: 300, height: 20, rx: 4, fill: PANEL, stroke: GRID });
      if (b) { el('rect', { x: POOL.x + 52, y: y + 3, width: 300 * clamp(b.p), height: 20, rx: 4, fill: b.done ? GOOD : INFO, opacity: 0.75 });
        mono(POOL.x + 60, y + 18, b.s, { 'font-size': 13.5, fill: INK, 'font-weight': 700 }); } } }
  function queue(items) { zone(Q.x, Q.y, 370, 74, '콜백 큐 (완료된 I/O)', { fill: SOFT });
    if (!items.length) { tx(Q.x + 185, Q.y + 54, '비어 있음', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); return; }
    items.forEach(([s, op], i) => card(Q.x + 60 + i * 96, Q.y + 48, 84, 32, { rx: 6, text: s, fs: 13.5, mono: true, stroke: GOOD, color: GOOD, op })); }
  function incoming(list, prev, u) { tx(70, 46, '들어온 요청', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle' });
    list.forEach((r, i) => { const isNew = !prev || !prev.includes(r); pill(70, 80 + i * 44, r, INFO, isNew ? pop(u, 0.2 + i * 0.1) : 1, { mono: true, fs: 14 }); }); }
  function s2(t, c) { const { k, u } = c, L = c.beat.loop, P = c.prev && c.prev.loop;
    incoming(L.incoming, P && P.incoming, u);
    zone(MAIN.x, MAIN.y, MAIN.w, MAIN.h, '메인 스레드 (JS 실행은 하나)', { fill: PANEL, stroke: GRID, sw: 1.5 });
    loopRing(355, 290, t, k >= 1);
    sub(355, 372, L.queueNote, fade(u, 1.8), { 'font-size': 13.5 });
    if (k === 0) { pill(300, 118, 'http', MUT, pop(u, 0.3), { mono: true }); pill(400, 118, 'fs', MUT, pop(u, 0.5), { mono: true });
      pool([]); queue([]); return; }
    if (k === 1) { fly(70, 80, MAIN.x + 125, MAIN.y + 76, seg(u, 0.2, 1.0), 'req A', { fill: INFO, mono: true });
      if (u > 1.0) frame('handler(req A)', ACC, pop(u, 1.0)); pool([]); queue([]); return; }
    if (k === 2) { const p1 = E(u, 0.9, 2.8);
      if (u < 0.5) frame('fs.readFile(…, cb)', ACC, 1);
      fly(MAIN.x + 125, MAIN.y + 76, POOL.x + 200, POOL.y + 51, seg(u, 0.5, 1.0), 'read data.json', { fill: INFO, mono: true });
      if (u > 1.1) frame('handler(req B)', ACC, pop(u, 1.1));
      fly(70, 124, MAIN.x + 125, MAIN.y + 76, seg(u, 0.5, 1.1), 'req B', { fill: INFO, mono: true });
      pool([{ s: 'A: data.json', p: p1 * 0.7 }, u > 1.8 ? { s: 'B: data.json', p: E(u, 1.8, 2.8) * 0.3 } : null]);
      queue([]); tx(MAIN.x + 10, MAIN.y + MAIN.h + 24, 'cb A 등록만 하고 기다리지 않는다', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    if (k === 3) { const done = u > 0.6;
      pool([{ s: 'A: data.json', p: lerp(0.7, 1, E(u, 0.1, 0.6)), done }, { s: 'B: data.json', p: 0.3 + E(u, 0.2, 2.6) * 0.5 }]);
      fly(POOL.x + 200, POOL.y + 51, Q.x + 60, Q.y + 48, seg(u, 0.6, 1.2), 'cb A', { fill: GOOD, mono: true });
      queue(u > 1.2 && u < 1.6 ? [['cb A', 1]] : []);
      fly(Q.x + 60, Q.y + 48, MAIN.x + 125, MAIN.y + 76, seg(u, 1.5, 2.0), 'cb A', { fill: GOOD, mono: true });
      if (u > 2.0) frame('cb A → res.end(data)', GOOD, pop(u, 2.0));
      fly(MAIN.x, MAIN.y + 76, 110, 80, seg(u, 2.2, 2.7), '응답', { fill: GOOD });
      if (u > 2.7) check(28, 80, 9, 1); return; }
    // k4: 네 요청이 번갈아 — 메인 스레드 시간줄
    pool([{ s: 'C', p: 0.8 }, { s: 'D', p: 0.55 }, { s: 'B', p: 1, done: true }, null]);
    queue([['cb B', 1], ['cb C', fade(u, 1.6)]]);
    const seq = ['A', 'B', 'C', 'D', 'cbA', 'cbB', 'cbC', 'cbD'], x0 = MAIN.x + 8, w = 28;
    seq.forEach((s, i) => { const s2 = clamp(E(u, 0.2, 2.2) * 8 - i); if (s2 <= 0) return; const cb = s.startsWith('cb');
      el('rect', { x: x0 + i * (w + 2), y: MAIN.y + 54, width: w * s2, height: 30, rx: 3, fill: cb ? GOOD : INFO, opacity: 0.8 });
      if (s2 > 0.9) mono(x0 + i * (w + 2) + w / 2, MAIN.y + 104, cb ? '↩' : s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: cb ? GOOD : INFO, 'font-weight': 700 }); });
    tx(MAIN.x + 10, MAIN.y + MAIN.h + 24, '짧은 일만 번갈아 — 기다림은 스레드 풀이', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  // ---------- 3. 블로킹 vs 논블로킹 (50MB 파일로 잰 값) ----------
  const TX = (ms) => 170 + ms * 6.8;   // 0~105ms → x
  function lane(y, title, col, op) { tx(24, y - 8, title, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op });
    el('line', { x1: TX(0), y1: y + 24, x2: TX(105), y2: y + 24, stroke: GRID, 'stroke-width': 2, opacity: op });
    mono(24, y + 29, '메인 스레드', { 'font-size': 13.5, fill: MUT, opacity: op }); }
  function mark(ms, y, s, col, sc, dy) { dy = dy || 0; el('line', { x1: TX(ms), y1: y + 6 + dy, x2: TX(ms), y2: y + 42, stroke: col, 'stroke-width': 2.5, opacity: sc });
    pill(TX(ms), y - 6 + dy, s, col, sc, { mono: true, fs: 13.5 }); }
  function axis(y) { [0, 25, 50, 75, 100].forEach((v) => mono(TX(v), y, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' })); }
  function s3(t, c) { const { k, u } = c, Y1 = 52, Y2 = 236;
    lane(Y1, 'readFileSync (동기)', BAD, 1); axis(Y1 + 70);
    const syncW = k === 1 ? E(u, 0.2, 2.2) : k > 1 ? 1 : 0;
    mark(0, Y1 + 18, '1)', INK, k === 0 ? pop(u, 0.3) : 1);
    if (syncW > 0) { el('rect', { x: TX(0) + 2, y: Y1 + 12, width: (TX(98) - TX(0)) * syncW, height: 24, rx: 4, fill: BAD, opacity: 0.8 });
      if (syncW > 0.4) mono(TX(10), Y1 + 29, `스레드 정지 ${Math.round(98 * syncW)}ms`, { 'font-size': 14, fill: PANEL, 'font-weight': 800 });
      for (let i = 0; i < Math.floor(syncW * 6); i++) el('circle', { cx: TX(0) - 34 - (i % 3) * 12, cy: Y1 + 52 + Math.floor(i / 3) * 12, r: 5, fill: BAD, opacity: 0.7 }); }
    if (k >= 2) { mark(98, Y1 + 18, '2) 3)', INK, k === 2 ? pop(u, 0.3) : 1);
      if (k === 2) sub(TX(98) - 90, Y1 + 112, '2) 파일 다 읽음: 52428800 bytes', fade(u, 0.8), { 'font-size': 14, fill: INK }); }
    if (k === 0) { note(TX(20), Y1 + 112, '아직 아무것도 막히지 않았다', fade(u, 0.8), { fill: MUT }); }
    if (k === 1) note(TX(30), Y1 + 112, '그 사이 온 요청은 뒤에서 줄을 선다', fade(u, 1.6), { fill: BAD });
    // 비동기 레인
    const on = k >= 3, op = k >= 3 ? 1 : 0.35;
    lane(Y2, 'readFile (비동기)', GOOD, op);
    mono(24, Y2 + 79, 'libuv', { 'font-size': 13.5, fill: MUT, opacity: op });
    el('line', { x1: TX(0), y1: Y2 + 74, x2: TX(105), y2: Y2 + 74, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5', opacity: op });
    if (!on) { note(TX(20), Y2 + 120, c.beat.blocking.lanes[1].note, 1, { fill: MUT }); return; }
    mark(0, Y2 + 18, 'A)', INK, k === 3 ? pop(u, 0.2) : 1);
    const rd = k === 3 ? E(u, 0.6, 2.4) : 1;
    el('rect', { x: TX(0) + 2, y: Y2 + 64, width: (TX(42) - TX(0)) * rd, height: 20, rx: 4, fill: INFO, opacity: 0.7 });
    if (rd > 0.5) mono(TX(2), Y2 + 104, '파일 읽기 (스레드 풀)', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
    if (k === 3) { dot([[TX(1), Y2 + 30], [TX(1), Y2 + 68]], seg(u, 0.3, 0.7), INFO, 6);
      for (let i = 0; i < 5; i++) { const x = TX(8 + i * 18) ; el('rect', { x, y: Y2 + 14, width: 30, height: 20, rx: 3, fill: GOOD, opacity: 0.7 * fade(u, 1.0 + i * 0.25) }); }
      note(TX(55), Y2 + 120, '스레드는 다른 일을 계속한다', fade(u, 2.0), { fill: GOOD }); return; }
    for (let i = 0; i < 5; i++) el('rect', { x: TX(8 + i * 18), y: Y2 + 14, width: 30, height: 20, rx: 3, fill: GOOD, opacity: 0.7 });
    mark(1, Y2 + 18, 'B)', ACC, pop(u, 0.4), -30);
    mark(42, Y2 + 18, 'C)', GOOD, pop(u, 1.0));
    dot([[TX(42), Y2 + 68], [TX(42), Y2 + 30]], seg(u, 0.7, 1.0), GOOD, 6);
    ['A)', 'B)', 'C)'].forEach((s, i) => card(TX(64) + i * 66, Y2 + 120, 56, 34, { rx: 8, text: s, fs: 15, mono: true, stroke: i === 1 ? ACC : INK, color: i === 1 ? ACC : INK, s: pop(u, 1.5 + i * 0.2) }));
    note(TX(64) - 40, Y2 + 166, '출력 순서 ≠ 코드 순서', fade(u, 2.2), { fill: ACC }); }

  // ---------- 4. CPU 바운드 ----------
  const T0 = 150, T1 = 900, SEC = (s) => T0 + (s / 5) * (T1 - T0);
  function ticks(y, from, to, col, op) { for (let s = from; s < to; s += 0.08) el('line', { x1: SEC(s), y1: y, x2: SEC(s), y2: y + 14, stroke: col || GOOD, 'stroke-width': 1.6, opacity: op ?? 1 }); }
  function tl(y, name, op) { mono(24, y + 12, name, { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: op });
    el('line', { x1: T0, y1: y + 22, x2: T1, y2: y + 22, stroke: GRID, 'stroke-width': 2, opacity: op }); }
  function s4(t, c) { const { k, u } = c, YM = 70, YW = 170;
    [0, 1, 2, 3, 4, 5].forEach((s) => mono(SEC(s), 40, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    tl(YM, '메인 스레드', 1);
    if (k === 4) { // 선택 기준: 요청 하나의 시간 구성
      ticks(YM - 2, 0, 5, GOOD, 0.5);
      const rows = c.beat.cpu.pick; tx(24, 150, '요청 하나가 시간을 어디에 쓰나', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
      rows.forEach((r, i) => { const y = 180 + i * 96, g = E(u, 0.4 + i * 0.5, 1.4 + i * 0.5), io = /I\/O/.test(r.work);
        tx(24, y + 16, r.work, { 'font-size': 15, 'font-weight': 700 });
        const segs = io ? [[0, 0.06, 'cpu'], [0.06, 0.8, 'wait'], [0.8, 0.86, 'cpu']] : [[0, 0.86, 'cpu']];
        segs.forEach(([a, b, kind]) => { const x = SEC(a * 5), w = (SEC(b * 5) - SEC(a * 5)) * g;
          el('rect', { x, y: y + 28, width: w, height: 22, rx: 4, fill: kind === 'cpu' ? (io ? ACC : BAD) : SOFT, stroke: kind === 'wait' ? GRID : 'none', 'stroke-dasharray': kind === 'wait' ? '4 4' : null }); });
        if (io) mono(SEC(2), y + 44, 'I/O 대기 — libuv 가 기다린다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) });
        else mono(SEC(0.3), y + 44, 'CPU 계산 — 메인 스레드가 직접', { 'font-size': 13.5, fill: PANEL, opacity: fade(u, 1.7), 'font-weight': 700 });
        pill(940 - (R.tw(r.verdict, 13.5) + 26) / 2, y + 2, r.verdict, r.tone === 'good' ? GOOD : BAD, pop(u, 1.2 + i * 0.5), { fs: 13.5 }); });
      return; }
    const blockMain = k === 1 ? E(u, 0.2, 2.2) : 0;
    if (k === 0) { ticks(YM - 2, 0, 5, GOOD, fade(u, 0.2));
      card(300, 160, 300, 64, { rx: 10, text: 'function heavySum()\nfor (i < 5e9) s += i', fs: 14.5, mono: true, stroke: INK, s: pop(u, 0.5) });
      note(480, 166, '아직 호출 전 — 10ms 타이머가 촘촘히 돈다', fade(u, 1.2), { fill: GOOD }); return; }
    if (k === 1) { ticks(YM - 2, 0, 0.06, GOOD);
      el('rect', { x: SEC(0.06), y: YM + 10, width: (SEC(4.5) - SEC(0.06)) * blockMain, height: 24, rx: 4, fill: BAD, opacity: 0.85 });
      if (blockMain > 0.3) mono(SEC(0.2), YM + 27, 'heavySum()  CPU 100%', { 'font-size': 14, fill: PANEL, 'font-weight': 800 });
      const i = Math.round(5e9 * blockMain);
      mono(150, 170, `i = ${i.toLocaleString('en-US')}`, { 'font-size': 22, 'font-weight': 800, fill: BAD });
      mono(150, 200, `${(4.5 * blockMain).toFixed(1)}초 경과`, { 'font-size': 15, fill: MUT });
      for (let j = 0; j < 5; j++) { person(560 + j * 70, 190, null, { s: 0.7, stroke: OFF }); }
      note(540, 262, '들어온 요청은 응답을 못 받는다', fade(u, 1.2), { fill: BAD });
      card(480, 330, 600, 54, { rx: 10, text: '10ms 타이머 최대 지연  4,853ms', fs: 17, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 2.2) }); return; }
    // k2, k3 : Worker 스레드
    const op2 = k === 2 ? fade(u, 0.3) : 1;
    tl(YW, 'Worker 스레드', op2);
    el('rect', { x: T0 - 4, y: YW - 14, width: T1 - T0 + 8, height: 52, rx: 8, fill: 'none', stroke: INFO, 'stroke-dasharray': '6 5', 'stroke-width': 1.6, opacity: op2 });
    if (k === 2) { ticks(YM - 2, 0, 5, GOOD, 1);
      pill(480, 270, 'const { Worker } = require("worker_threads")', INFO, pop(u, 0.8), { mono: true, fs: 14 });
      note(250, 330, '요청을 받는 루프는 하나, 스레드는 더 만들 수 있다', fade(u, 1.6), { fill: INFO }); return; }
    const mv = E(u, 0.2, 1.0);
    ticks(YM - 2, 0, 5, GOOD, 1);
    el('rect', { x: SEC(0.06), y: lerp(YM + 10, YW + 10, mv), width: SEC(4.5) - SEC(0.06), height: 24, rx: 4, fill: INFO, opacity: 0.8 });
    mono(SEC(0.2), lerp(YM + 27, YW + 27, mv), 'heavySum()  다른 스레드에서', { 'font-size': 14, fill: PANEL, 'font-weight': 800 });
    if (u > 1.2) { const back = E(u, 1.2, 2.0); el('path', { d: `M${SEC(4.5)},${YW + 10} Q${SEC(4.7)},${YM + 60} ${lerp(SEC(4.5), SEC(4.6), back)},${YM + 30}`, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      pill(SEC(3.4), YM + 66, 'message → resolve', INFO, pop(u, 1.6), { mono: true, fs: 13.5 }); }
    card(480, 330, 600, 54, { rx: 10, text: '10ms 타이머 최대 지연  4,853ms → 77ms', fs: 17, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 2.1) }); }

  // ---------- 5. process · global ----------
  const TERM5 = [
    ['$ node intro.js one two'], ["[ '…/node.exe', '…/intro.js',", "  'one', 'two' ]"],
    ['undefined', '29496'], ['true'],
    ['$ node', '> window', 'Uncaught ReferenceError:', '  window is not defined'], ['$ echo $?', '0', '$ node', '> 1 + 1', '2'],
  ];
  function s5(t, c) { const { k, u } = c;
    const lines = k === 0 ? [...TERM5[0], ...TERM5[1]] : k === 1 ? [...TERM5[0], ...TERM5[1], ...TERM5[2]] : k === 2 ? [...TERM5[0], ...TERM5[1], ...TERM5[2], ...TERM5[3]] : k === 3 ? TERM5[4] : TERM5[5];
    const prevN = k === 0 ? 1 : k === 1 ? 3 : k === 2 ? 5 : 0;
    terminal(24, 30, 430, 360, lines.map((s) => (/Error|not defined/.test(s) ? [s, '#f87171'] : s)), lerp(prevN, lines.length, E(u, 0.2, 1.6)), { title: k >= 3 ? 'REPL' : 'node intro.js', lh: 26, fs: 14.5 });
    const X = 490;
    if (k === 0) { tx(X, 60, 'process.argv', { 'font-size': 17, 'font-weight': 800, class: 'mono' });
      [['[0]', 'node 실행 파일 경로'], ['[1]', 'intro.js 경로'], ['[2]', "'one'"], ['[3]', "'two'"]].forEach(([i, v], j) => {
        const hot = j >= 2, s = pop(u, 0.8 + j * 0.25); card(X + 210, 104 + j * 54, 420, 44, { rx: 8, stroke: hot ? ACC : GRID, fill: hot ? ACCBG : PANEL, s });
        if (s > 0.5) { mono(X + 14, 110 + j * 54, i, { 'font-size': 15, fill: MUT, 'font-weight': 700 }); tx(X + 70, 110 + j * 54, v, { 'font-size': 15, 'font-weight': hot ? 800 : 500, fill: hot ? ACC : INK, class: hot ? 'mono' : null }); } });
      note(X, 352, '명령행 인자는 [2] 부터', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 1) { [['process.env.NODE_ENV', 'undefined', '설정 안 하고 실행'], ['NODE_ENV=production 로 실행', "'production'", '실행 환경이 값을 준다'], ['process.pid', '29496', '실행할 때마다 다르다']].forEach(([a, b, d], j) => {
        const y = 70 + j * 98, s = pop(u, 0.5 + j * 0.45); card(X + 210, y + 26, 420, 78, { rx: 10, stroke: j === 1 ? GOOD : GRID, s });
        if (s > 0.5) { mono(X + 14, y + 16, a, { 'font-size': 14.5, fill: MUT }); mono(X + 14, y + 46, b, { 'font-size': 18, 'font-weight': 800, fill: j === 1 ? GOOD : INK }); tx(X + 406, y + 46, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); } });
      return; }
    if (k === 2) { const s = pop(u, 0.3); card(X + 210, 170, 420, 200, { rx: 12, stroke: ACC, sw: 2.4, s });
      if (s > 0.5) { tx(X + 18, 96, '전역 객체 하나', { 'font-size': 15, 'font-weight': 800, fill: ACC });
        [['process', 1], ['console', 1], ['setTimeout', 1], ['myFlag: true', fade(u, 1.0)]].forEach(([n, op], j) => mono(X + 30, 134 + j * 32, n, { 'font-size': 15, opacity: op, 'font-weight': j === 3 ? 800 : 500, fill: j === 3 ? ACC : INK })); }
      pill(X + 330, 136, 'global', INK, pop(u, 0.6), { mono: true }); pill(X + 330, 186, 'globalThis', ACC, pop(u, 1.4), { mono: true });
      note(X + 260, 236, '두 이름, 같은 객체', fade(u, 1.8), { fill: ACC, 'font-size': 14 }); return; }
    if (k === 3) { tx(X, 60, '브라우저 것인가, 언어 것인가', { 'font-size': 16, 'font-weight': 800 });
      [['window', false, '브라우저 전역'], ['document', false, '화면(DOM)'], ['localStorage', false, '브라우저 저장소'], ['fetch', true, 'Node 18부터 기본 제공']].forEach(([n, ok, d], j) => {
        const y = 100 + j * 64, s = pop(u, 0.4 + j * 0.35); card(X + 210, y + 14, 420, 52, { rx: 10, stroke: ok ? GOOD : BAD, fill: ok ? GOODBG : BADBG, s });
        if (s > 0.5) { (ok ? check : cross)(X + 26, y + 14, 9, 1); mono(X + 50, y + 20, n, { 'font-size': 16, 'font-weight': 800, fill: ok ? GOOD : BAD }); tx(X + 404, y + 20, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); } });
      return; }
    // k4 종료 코드
    [['process.exit(0)', '0 = 성공', GOOD], ['process.exit(1)', '0 이 아니면 실패', BAD]].forEach(([a, b, col], j) => { const s = pop(u, 0.3 + j * 0.4);
      card(X + 210, 100 + j * 80, 420, 60, { rx: 10, stroke: col, s }); if (s > 0.5) { mono(X + 20, 106 + j * 80, a, { 'font-size': 16, 'font-weight': 800, fill: col }); tx(X + 400, 106 + j * 80, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); } });
    card(X + 210, 300, 420, 70, { rx: 10, text: 'node 만 치면 REPL\n한 줄씩 바로 실행해 본다', fs: 15, stroke: ACC, color: INK, s: pop(u, 1.4) }); }

  const quiz = [
    { q: 'Node.js에서 JS 소스를 기계어로 바꿔 실행하는 부분은 무엇인가?',
      o: ['libuv', 'V8', '표준 라이브러리의 http 모듈'], a: 1,
      why: 'V8은 크롬에서 떼어 온 JS 엔진이다. libuv는 이벤트 루프와 스레드 풀을, 표준 라이브러리는 http·fs 같은 API를 맡는다.' },
    { q: 'fs.readFile을 부른 직후 메인 스레드가 하는 일은 무엇인가?',
      o: ['콜백만 등록하고 다음 요청을 처리하러 간다', '파일이 다 읽힐 때까지 기다린다', '새 스레드를 만들어 그 요청을 넘긴다'], a: 0,
      why: '읽기는 libuv 스레드 풀(기본 4개)이 맡는다. 메인 스레드는 끝나면 부를 콜백만 남기고 빠져나온다.' },
    { q: 'readFile 예제에서 B)가 C)보다 먼저 찍히는 이유는 무엇인가?',
      o: ['B) 줄이 코드에서 더 아래에 있어서', 'console.log가 비동기라서', '파일 읽기가 끝나기 전에 스레드가 다음 줄로 넘어가서'], a: 2,
      why: '50MB 파일로 재 보면 B)는 1ms에, C)는 읽기가 끝난 42ms에 찍힌다. 스레드가 기다리지 않았다는 증거다.' },
    { q: '메인 스레드에서 heavySum(5e9)를 돌리는 동안 10ms 타이머는 어떻게 되었나?',
      o: ['다른 스레드에서 제때 계속 돌았다', '4초 넘게 한 번도 돌지 못했다', '조금씩 늦지만 10ms 간격은 지켰다'], a: 1,
      why: '계산이 끝날 때까지 이벤트 루프가 멈춰 최대 지연이 4,853ms였다. Worker로 옮기자 77ms로 줄었다.' },
    { q: 'Node v24에서 그냥 실행했을 때 없는 것은 무엇인가?',
      o: ['fetch', 'globalThis', 'document'], a: 2,
      why: 'document는 브라우저가 주는 화면 객체라 Node에는 없다. fetch는 Node 18부터 기본으로 들어 있다.' },
  ];

  const summary = [
    'Node.js는 크롬의 V8 엔진에 libuv와 표준 라이브러리를 붙여 브라우저 밖에서 JS를 돌린다.',
    'JS를 실행하는 스레드는 하나다. 파일 읽기 같은 I/O는 libuv에 맡기고 콜백만 남긴다.',
    '50MB 파일에서 readFileSync는 스레드를 98ms 붙들었고 readFile은 1ms 만에 다음 줄로 갔다.',
    '순수 계산은 루프를 멈춘다. heavySum을 Worker로 옮기자 타이머 지연이 4,853ms에서 77ms가 됐다.',
  ];
  const review = [
    { q: '이미지 썸네일을 요청 핸들러 안에서 만들었더니 다른 API까지 수 초씩 멈춘다. 먼저 의심할 것은?',
      o: ['CPU 계산이 메인 스레드에서 돌아 이벤트 루프를 막고 있다', 'libuv 스레드 풀이 기본 4개라서 모자란다', 'http 모듈이 요청을 하나씩만 받는다'], a: 0,
      why: '순수 계산은 대신 기다려 줄 곳이 없어 메인 스레드가 직접 돈다. Worker로 빼면 루프가 다시 요청을 받는다.' },
    { q: '설정 파일을 읽는 코드다. readFileSync를 써도 괜찮은 자리는 어디인가?',
      o: ['요청마다 실행되는 핸들러 안', '타이머 콜백 안', '서버를 띄우기 전 부팅 코드에서 한 번'], a: 2,
      why: 'Sync는 읽는 동안 스레드를 붙든다. 아직 요청을 받기 전인 부팅 때 한 번이면 막힐 요청이 없다.' },
    { q: '브라우저에서 돌던 코드를 node로 실행하자 ReferenceError가 났다. 가장 그럴듯한 원인은?',
      o: ['fetch를 썼다', 'document나 window를 썼다', 'globalThis를 썼다'], a: 1,
      why: 'window·document는 브라우저가 주는 객체다. fetch와 globalThis는 Node에도 있다.' },
  ];

  R.page({ title: 'Node.js 런타임 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
