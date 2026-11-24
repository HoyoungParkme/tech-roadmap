/* V-2-1 성능·확장·보안 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
   실제로 돌려 본 값 (Node 24, 이 저장소 밖 임시 폴더):
   - cluster.js 워커 4개 + 요청 12번: 라운드로빈(리눅스·맥 기본)에서 3·3·3·3. 윈도 기본값(SCHED_NONE)에선 12번 모두 한 워커로 갔다.
   - /report 계산(약 0.46초)을 메인 스레드에서 돌리면 30ms 뒤 온 /health 가 431ms 걸렸고, worker_threads 로 옮기면 6ms.
   - security.js (helmet 8 · cors · express-rate-limit 8 · zod 4): 정상 200, 다른 출처도 200(+허용 헤더는 shop 만), 1MB 넘는 본문 413, 101번째 요청 429, 이메일 형식 오류 400. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, terminal, spans, cross, check, clock, person, server, browser, dbIcon, redisBox, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function status(cx, cy, code, s, o) { o = o || {}; const col = code >= 500 ? BAD : code >= 400 ? WARN : GOOD, bg = code >= 500 ? BADBG : code >= 400 ? WARNBG : GOODBG, str = String(code) + (o.text ? ' ' + o.text : '');
    card(cx, cy, tw(str, o.fs || 15) + 22, 28, { rx: 14, fill: bg, stroke: col, sw: 2, text: str, fs: o.fs || 15, fw: 800, color: col, mono: true, s }); }

  // ---------- 1. cluster ----------
  const CORE = (i) => [95 + (i % 2) * 150, 115 + Math.floor(i / 2) * 140];
  const PIDS = ['33608', '28320', '19896', '31072'];
  function cores(c, who) { // who[i] = { name, load, col, dead }
    el('rect', { x: 20, y: 40, width: 300, height: 300, rx: 14, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
    tx(34, 64, 'CPU · 코어 4개 (예)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < 4; i++) { const [x, y] = CORE(i), w = who[i] || {}; const on = w.load > 0;
      el('rect', { x: x - 65, y: y - 40, width: 130, height: 110, rx: 10, fill: PANEL, stroke: on ? (w.col || ACC) : GRID, 'stroke-width': on ? 2.4 : 1.6 });
      mono(x - 54, y - 18, '코어 ' + (i + 1), { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      tx(x, y + 12, w.name || '놀고 있음', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: on ? (w.col || INK) : OFF, class: w.name ? 'mono' : null });
      el('rect', { x: x - 52, y: y + 40, width: 104, height: 10, rx: 4, fill: SOFT }); el('rect', { x: x - 52, y: y + 40, width: 104 * clamp(w.load || 0), height: 10, rx: 4, fill: w.col || ACC });
      if (w.dead) cross(x + 44, y - 20, 9); } }
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { cores(c, [{ name: 'node app.js', load: 1 }]);
      if (k === 0) { tx(640, 120, '프로세스 하나 = 이벤트 루프 하나', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.4) });
        tx(640, 152, '코어가 몇 개든 한 코어만 일한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.9) });
        hbar(470, 210, 300, 1, 4, { h: 22, u: E(u, 1.2, 2.0), text: '4코어 중 1개' }); }
      if (k === 1) { card(620, 70, 200, 44, { rx: 10, text: 'cluster.js', mono: true, fs: 16, s: pop(u, 0.2) });
        grow(580, 94, 470, 180, E(u, 0.6, 1.1), ACC); grow(660, 94, 780, 180, E(u, 0.9, 1.4), INFO);
        card(470, 210, 230, 58, { rx: 10, stroke: ACC, sw: 2.2, fill: ACCBG, text: 'isPrimary = true\n마스터', fs: 14.5, color: ACC, s: pop(u, 1.1) });
        card(790, 210, 230, 58, { rx: 10, stroke: INFO, sw: 2.2, fill: INFOBG, text: 'isPrimary = false\n워커', fs: 14.5, color: INFO, s: pop(u, 1.4) });
        mono(470, 280, 'os.cpus().length → 4', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        sub(630, 330, '같은 파일이 마스터로도 워커로도 실행된다', fade(u, 2.1)); }
      return; }
    // 마스터 + 워커 4
    const deadIdx = k >= 3 ? 1 : -1;
    const who = [0, 1, 2, 3].map((i) => { const show = k === 2 ? E(u, 0.6 + i * 0.3, 1.0 + i * 0.3) : 1;
      if (i === deadIdx && k === 3 && u < 1.5) return { name: 'pid ' + PIDS[i], load: 0.9, col: BAD, dead: u > 0.4 };
      return { name: 'pid ' + (i === deadIdx ? '30120' : PIDS[i]), load: show, col: i === deadIdx ? GOOD : INFO }; });
    cores(c, who);
    card(640, 70, 260, 48, { rx: 10, stroke: ACC, sw: 2.4, fill: ACCBG, text: '마스터 (fork만 한다)', fs: 15, color: ACC });
    for (let i = 0; i < 4; i++) { const x = 460 + i * 120, y = 200, s = k === 2 ? pop(u, 0.4 + i * 0.3) : 1, dead = i === deadIdx && k === 3 && u < 1.5, reborn = i === deadIdx && (k > 3 || u >= 1.5);
      grow(640, 94, x, y - 28, k === 2 ? E(u, 0.3 + i * 0.3, 0.6 + i * 0.3) : 1, dead ? BAD : MUT, { plain: true });
      card(x, y, 104, 52, { rx: 9, stroke: dead ? BAD : reborn ? GOOD : INFO, sw: 2, dash: dead ? '5 4' : null, text: '워커\n' + (reborn ? '30120' : PIDS[i]), mono: true, fs: 13.5, color: dead ? BAD : reborn ? GOOD : INFO, s: reborn && k === 3 ? pop(u, 1.5) : s });
      if (dead) cross(x + 40, y - 22, 9, pop(u, 0.4)); }
    if (k === 2) sub(640, 260, 'cluster.fork() × 4 · 처리량이 코어 수만큼 는다', fade(u, 1.9), { fill: INK, 'font-weight': 700 });
    if (k === 3) { pill(640, 268, 'cluster.on("exit") → cluster.fork()', ACC, pop(u, 0.9), { mono: true, fs: 13.5 }); sub(640, 304, '나머지 워커 셋은 그동안에도 요청을 받는다', fade(u, 1.7)); }
    if (k === 4) { card(640, 300, 260, 46, { rx: 23, stroke: INK, sw: 2.2, text: '리스닝 소켓 :3000', mono: true, fs: 15, s: pop(u, 0.2) });
      [0, 1, 2, 3].forEach((i) => grow(640, 277, 460 + i * 120, 228, E(u, 0.6 + i * 0.15, 1.1 + i * 0.15), INK));
      sub(640, 348, '마스터가 연결을 받아 워커에 넘긴다 (라운드로빈)', fade(u, 1.5)); }
    if (k === 5) { // 요청 12번: 3·3·3·3 (리눅스 기본 라운드로빈에서 실행한 결과)
      const n = Math.floor(lerp(0, 12, E(u, 0.2, 2.2)));
      for (let j = 0; j < 12; j++) { if (j >= n) break; const i = j % 4, x = 460 + i * 120, lvl = Math.floor(j / 4); el('circle', { cx: x - 30 + lvl * 30, cy: 250, r: 9, fill: INFO }); }
      for (let i = 0; i < 4; i++) mono(460 + i * 120, 284, Math.ceil(Math.max(0, n - i) / 4) + '번', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
      tx(640, 330, '요청 12번 → 워커마다 3번씩, 응답 pid가 돌아가며 바뀐다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(640, 360, '윈도 기본 설정에선 12번이 한 워커로 몰린 실행도 있었다', fade(u, 2.3)); } }

  // ---------- 2. PM2 ----------
  function pmTable(x, y, rows, o) { o = o || {}; const cw = [40, 70, 100, 110, 60], heads = ['id', 'name', 'mode', 'status', '↺'];
    el('rect', { x, y, width: 420, height: 40 + rows.length * 32, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
    let xx = x + 16; heads.forEach((h, j) => { mono(xx, y + 26, h, { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); xx += cw[j]; });
    rows.forEach((r, i) => { let xx = x + 16; const yy = y + 60 + i * 32;
      r.forEach((v, j) => { const col = j === 3 ? (v === 'online' ? GOOD : v === 'errored' ? BAD : WARN) : j === 4 && v > 0 ? WARN : INK;
        mono(xx, yy, String(v), { 'font-size': 14.5, 'font-weight': j === 3 ? 700 : 500, fill: col }); xx += cw[j]; }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { terminal(40, 50, 420, 120, ['$ node app.js', 'listening on 3000', ['TypeError: Cannot read properties of undefined', BAD]], lerp(0, 3, E(u, 0.2, 1.6)), { fs: 14, lh: 26 });
      server(700, 130, 'app.js 프로세스 1개', { stroke: u > 1.6 ? BAD : INK, lamp: u > 1.6 ? BAD : GOOD });
      if (u > 1.6) cross(700, 130, 30, pop(u, 1.6));
      tx(480, 300, '프로세스가 죽으면 서비스도 같이 멈춘다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      sub(480, 332, '되살리는 사람이 없다', fade(u, 2.3)); return; }
    if (k === 1) { mono(40, 60, '$ pm2 start app.js -i max --name api', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      const crash = u > 1.4 && u < 2.1, re = u >= 2.1 ? 1 : 0;
      pmTable(40, 84, [0, 1, 2, 3].map((i) => [i, 'api', 'cluster', i === 2 && crash ? 'errored' : 'online', i === 2 ? re : 0]).slice(0, Math.ceil(lerp(0, 4, E(u, 0.3, 1.2)))));
      tx(700, 130, '-i max = 코어 수만큼', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.6) });
      sub(700, 158, 'cluster.fork() 코드를 쓰지 않는다', fade(u, 0.9));
      if (u > 1.4) { card(700, 240, 300, 60, { rx: 12, stroke: crash ? BAD : GOOD, sw: 2.2, text: crash ? 'id 2가 죽었다' : 'PM2가 바로 다시 띄움 (↺ 1)', fs: 15, color: crash ? BAD : GOOD }); } return; }
    if (k === 2) { // reload: 워커를 하나씩 바꾼다
      const X0 = 190, W = 640; tx(40, 52, 'pm2 reload api', { 'font-size': 16, 'font-weight': 800, class: 'mono' }); sub(460, 52, '시간 →', 1);
      for (let i = 0; i < 4; i++) { const y = 92 + i * 44, sw = X0 + (i + 1) * (W / 5), g = E(u, 0.2, 2.4), xNow = X0 + W * g;
        mono(40, y + 5, 'api ' + i, { 'font-size': 14.5, 'font-weight': 700 });
        el('rect', { x: X0, y: y - 13, width: Math.min(xNow, sw) - X0, height: 26, rx: 5, fill: INFOBG, stroke: INFO, 'stroke-width': 1.2 });
        if (xNow > sw) { el('rect', { x: sw, y: y - 13, width: Math.min(xNow, X0 + W) - sw, height: 26, rx: 5, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.2 }); }
        if (i === 0) { mono(X0 + 10, y + 5, 'v1', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 }); if (xNow > sw + 30) mono(sw + 10, y + 5, 'v2', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700 }); } }
      tx(480, 290, '한 번에 하나씩 바꿔서 늘 셋 이상이 요청을 받는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) });
      sub(480, 320, 'pm2 restart는 전부 내렸다 올려 그 사이 요청이 끊긴다', fade(u, 2.0));
      sub(480, 346, '처리 중인 요청을 마무리하고 내려가야 한다 (graceful shutdown)', fade(u, 2.3)); return; }
    if (k === 3) { // logs: 넷의 로그가 한 줄기로, startup: 재부팅 뒤 자동 기동
      for (let i = 0; i < 4; i++) { const y = 80 + i * 50; card(100, y, 110, 36, { rx: 8, text: 'api ' + i, mono: true, fs: 14, stroke: INFO, color: INFO }); grow(158, y, 300, 155, E(u, 0.3 + i * 0.12, 0.8 + i * 0.12), INFO); }
      terminal(310, 60, 300, 190, ['$ pm2 logs api', '0|api  GET /orders 200', '2|api  POST /pay 500', '1|api  GET /health 200', '3|api  GET /users/7 404'], lerp(0, 5, E(u, 0.6, 1.9)), { fs: 13.5, lh: 26 });
      sub(460, 280, '로그 내용은 예시', fade(u, 1.8));
      server(800, 130, '서버 재부팅', { s: pop(u, 1.2), lamp: GOOD }); mono(800, 240, '$ pm2 startup', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(800, 268, '부팅되면 앱도 저절로 뜬다', fade(u, 2.0)); return; }
    // k 4~5: ecosystem.config.js
    const F = [['name', '"api"'], ['script', '"app.js"'], ['instances', '"max"'], ['exec_mode', '"cluster"'], ['max_memory_restart', '"300M"'], ['env.NODE_ENV', '"production"']];
    el('rect', { x: 40, y: 50, width: 430, height: 270, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2 });
    mono(56, 76, 'ecosystem.config.js', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
    F.forEach(([a, b], i) => { const show = k === 4 ? (i < 3 ? fade(u, 0.3 + i * 0.4) : 0) : i < 3 ? 1 : fade(u, 0.2 + (i - 3) * 0.4), hot = k === 5 && i >= 3; const y = 112 + i * 36;
      if (hot) el('rect', { x: 50, y: y - 22, width: 410, height: 32, rx: 6, fill: ACCBG, opacity: show });
      mono(60, y, a + ':', { 'font-size': 15, fill: MUT, opacity: show }); mono(450, y, b, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: show }); });
    if (k === 4) { mono(700, 140, '-i max  ≡  instances: "max"', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      sub(700, 172, '실행 옵션을 파일로 커밋한다', fade(u, 1.8)); mono(700, 240, '$ pm2 start ecosystem.config.js', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }
    if (k === 5) { // 메모리가 300M 에 닿으면 재시작
      const m = lerp(120, 300, E(u, 0.4, 1.8)), rs = u > 1.9;
      tx(560, 120, 'api 0 메모리', { 'font-size': 15, 'font-weight': 700 });
      hbar(560, 136, 300, Math.round(rs ? 90 : m), 300, { h: 22, col: m >= 299 && !rs ? BAD : ACC, text: (rs ? 90 : Math.round(m)) + 'M' });
      el('line', { x1: 860, y1: 128, x2: 860, y2: 166, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }); mono(860, 190, '300M', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 });
      if (rs) pill(700, 240, '상한에 닿아 ↺ 재시작 (누수 대비)', WARN, pop(u, 1.9));
      sub(700, 290, '메모리 값은 예시', fade(u, 1.0)); } }

  // ---------- 3. worker_threads ----------
  const TX = (ms) => 180 + ms * 1.42;   // 0~500ms → 180~890
  function tl(y, name, op) { el('line', { x1: TX(0), y1: y, x2: TX(500), y2: y, stroke: GRID, 'stroke-width': 2, opacity: op }); tx(30, y + 5, name, { 'font-size': 15, 'font-weight': 800, opacity: op }); }
  function blk(a, b, y, col, bg, label, g, o) { o = o || {}; const w = (TX(b) - TX(a)) * (g ?? 1); if (w <= 0) return; el('rect', { x: TX(a), y: y - 15, width: w, height: 30, rx: 5, fill: bg, stroke: col, 'stroke-width': 1.6 });
    if (label && (g ?? 1) > 0.6) mono(TX(a) + 10, y + 5, label, { 'font-size': 13.5, fill: col, 'font-weight': 700 }); }
  function s3(t, c) { const { k, u } = c;
    [0, 100, 200, 300, 400, 500].forEach((ms) => mono(TX(ms), 400, ms + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    if (k === 4) { // 고르는 기준
      [['I/O 바운드', 'DB·외부 API·프록시', 'cluster로 프로세스만 늘린다', GOOD, 250], ['CPU 바운드', '인코딩·해시·큰 정렬', 'worker_threads로 옮긴다', BAD, 710]].forEach(([a, b, d, col, cx], i) => { const s = pop(u, 0.2 + i * 0.4);
        card(cx, 160, 380, 190, { rx: 14, stroke: col, sw: 2.4, s }); tx(cx, 110, a, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: col, opacity: s });
        sub(cx, 140, b, s); tx(cx, 200, d, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: s }); });
      tx(480, 310, '핸들러가 CPU를 수십 ms 넘게 쓰면 옆 스레드로', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) });
      sub(480, 340, 'console.time으로 재 보면 옮길 곳이 보인다', fade(u, 1.8)); return; }
    const worker = k >= 2;
    tl(110, '메인 스레드', 1);
    if (worker) tl(210, '워커 스레드', k === 2 ? fade(u, 0.2) : 1);
    tl(310, '/health 요청', 1);
    tx(30, 40, '/report 계산 중에 30ms 뒤 /health가 온다 · 이 컴퓨터에서 잰 값', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (!worker) { blk(0, 457, 110, BAD, BADBG, 'crunch() · 457ms 동안 루프를 붙든다', k === 0 ? E(u, 0.2, 1.4) : 1);
      if (k === 0) { blk(30, 461, 310, WARN, WARNBG, '기다림 431ms', E(u, 1.2, 2.3)); el('circle', { cx: TX(30), cy: 310, r: 7, fill: WARN }); }
      if (k === 1) { blk(30, 461, 310, WARN, WARNBG, '기다림 431ms', 1);
        card(TX(250), 200, 330, 50, { rx: 12, stroke: ACC, sw: 2.2, s: pop(u, 0.3) }); mono(TX(250), 206, 'heavyTaskAsync(input) → Promise', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC });
        pill(TX(250), 254, 'pending', WARN, pop(u, 1.0), { mono: true }); sub(TX(250), 284, '호출부는 await로 받을 통로가 생겼다', fade(u, 1.4)); } }
    else { const mv = k === 2 ? E(u, 0.3, 1.3) : 1;
      // 계산 덩어리가 아래 워커 스레드로 내려간다 (워커를 띄우는 데 시간이 조금 더 든다)
      const y = lerp(110, 210, mv); el('rect', { x: TX(26), y: y - 15, width: TX(483) - TX(26), height: 30, rx: 5, fill: BADBG, stroke: BAD, 'stroke-width': 1.6 });
      mono(TX(26) + 10, y + 5, 'heavy.js 계산 (new Worker)', { 'font-size': 13.5, fill: BAD, 'font-weight': 700 });
      if (mv >= 1) { blk(0, 26, 110, INFO, INFOBG, '', 1); grow(TX(483), 196, TX(483), 128, k === 2 ? E(u, 1.6, 2.0) : 1, GOOD); mono(TX(483) - 6, 160, 'message', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'end', opacity: k === 2 ? fade(u, 1.9) : 1 }); }
      if (k === 2) sub(480, 360, '메인 스레드는 Worker를 띄우고 바로 비켜난다', fade(u, 1.6));
      if (k === 3) { blk(30, 36, 310, GOOD, GOODBG, '', E(u, 0.3, 0.6)); el('circle', { cx: TX(30), cy: 310, r: 7, fill: GOOD });
        mono(TX(42), 316, '/health 6ms', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) });
        blk(30, 36, 110, GOOD, GOODBG, '', E(u, 0.3, 0.6));
        mono(TX(483), 66, '/report 483ms', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.2) });
        sub(480, 360, '/health 431ms → 6ms · 계산 쪽은 워커 기동만큼 26ms 늘었다', fade(u, 1.6), { fill: INK, 'font-weight': 700 }); } } }

  // ---------- 4. 수평 확장 · 무상태 ----------
  const LB = [230, 210], INST = [[470, 90], [470, 210], [470, 330]], RD = [790, 210];
  function inst(i, o) { o = o || {}; const [x, y] = INST[i]; card(x, y, 170, 80, { rx: 10, stroke: o.dead ? OFF : INK, sw: 2.2, dash: o.dead ? '6 5' : null, s: o.s ?? 1 });
    mono(x - 72, y - 18, '인스턴스 ' + 'ABC'[i], { 'font-size': 14, 'font-weight': 800, fill: o.dead ? OFF : INK, opacity: o.s ?? 1 });
    el('rect', { x: x - 72, y: y - 4, width: 144, height: 30, rx: 6, fill: o.mem ? (o.mem === 'miss' ? BADBG : WARNBG) : SOFT, stroke: o.mem === 'miss' ? BAD : o.mem ? WARN : GRID, opacity: o.s ?? 1 });
    mono(x, y + 16, o.mem === 'miss' ? '메모리: 세션 없음' : o.mem ? 'sess:abc (메모리)' : '메모리', { 'font-size': 13.5, 'text-anchor': 'middle', fill: o.mem === 'miss' ? BAD : o.mem ? WARN : MUT, 'font-weight': 700, opacity: o.s ?? 1 });
    if (o.dead) cross(x + 70, y - 30, 10); }
  function s4(t, c) { const { k, u } = c, n = k >= 2 ? 3 : 1;
    person(60, LB[1], '로그인한 사용자', {});
    if (n > 1) { card(LB[0], LB[1], 120, 60, { rx: 12, stroke: ACC, sw: 2.4, fill: ACCBG, text: '로드밸런서', fs: 15, color: ACC, s: k === 2 ? pop(u, 0.2) : 1 }); grow(92, LB[1], LB[0] - 62, LB[1], 1, MUT, { plain: true }); }
    else grow(92, LB[1], INST[1][0] - 88, LB[1], 1, MUT, { plain: true });
    const useRedis = k >= 3;
    for (let i = 0; i < 3; i++) { if (n === 1 && i !== 1) continue; const s = k === 2 && i !== 1 ? pop(u, 0.3 + i * 0.2) : 1;
      const mem = useRedis ? null : i === 1 ? 'hit' : k === 2 && i === 2 && u > 1.6 ? 'miss' : null;
      const dead = k === 5 && i === 0 && u > 0.6;
      if (!(k === 5 && i === 0 && u > 1.6)) inst(i, { s, mem, dead });
      if (n > 1) grow(LB[0] + 60, LB[1], INST[i][0] - 88, INST[i][1], k === 2 ? E(u, 0.4, 0.8) : 1, MUT, { plain: true }); }
    if (k >= 1) { redisBox(RD[0], RD[1], { name: 'Redis', sub: 'REDIS_URL', s: k === 1 ? pop(u, 0.3) : 1 });
      for (let i = 0; i < 3; i++) { if (n === 1 && i !== 1) continue; el('line', { x1: INST[i][0] + 86, y1: INST[i][1], x2: RD[0] - 62, y2: RD[1], stroke: useRedis ? ACC : GRID, 'stroke-width': 2, 'stroke-dasharray': useRedis ? null : '5 5', opacity: k === 1 ? fade(u, 0.6) : 1 }); } }
    if (k === 0) sub(470, 380, '한 대일 때는 메모리 세션도 문제없이 돈다', fade(u, 1.0));
    if (k === 1) sub(790, 290, '연결만 했고 아직 세션은 메모리에', fade(u, 1.2));
    if (k === 2) { dot([[92, LB[1]], [LB[0] + 60, LB[1]], [INST[2][0] - 88, INST[2][1]]], seg(u, 0.9, 1.6), INFO, 8);
      if (u > 1.6) { status(650, 336, 401, pop(u, 1.7), { text: '로그인 풀림', fs: 14 }); } }
    if (useRedis) { card(RD[0], RD[1] + 74, 160, 34, { rx: 8, text: 'sess:abc', mono: true, fs: 14.5, stroke: WARN, color: WARN, fill: WARNBG, s: k === 3 ? pop(u, 0.4) : 1 });
      if (k === 3) { dot([[92, LB[1]], [LB[0] + 60, LB[1]], [INST[2][0] - 88, INST[2][1]], [INST[2][0] + 86, INST[2][1]], [RD[0] - 62, RD[1]]], seg(u, 0.9, 2.0), INFO, 8);
        if (u > 2.0) status(650, 380, 200, pop(u, 2.0), { text: '같은 세션', fs: 14 }); mono(RD[0], 330, 'store: new RedisStore(…)', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) }); } }
    if (k === 4) { mono(RD[0], 50, 'secret: process.env.SESSION_SECRET', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.2) });
      [['saveUninitialized: false', '로그인 안 한 방문자의 빈 세션은 저장하지 않는다'], ['resave: false', '바뀐 게 없으면 다시 쓰지 않는다']].forEach(([a, b], i) => { const y = 330 + i * 44;
        mono(640, y, a, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6 + i * 0.5) }); tx(640, y + 18, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.7 + i * 0.5) }); }); }
    if (k === 5) { [['파일', 'S3'], ['캐시', '공유 저장소']].forEach(([a, b], i) => pill(790, 50 + i * 40, a + ' → ' + b, INFO, pop(u, 1.0 + i * 0.3)));
      if (u > 0.6) { card(470, 90, 170, 80, { rx: 10, stroke: GOOD, sw: 2.2, s: pop(u, 1.6) }); mono(398, 72, '새 인스턴스', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) }); }
      sub(470, 395, '상태가 밖에 있으니 아무 인스턴스나 빼고 더할 수 있다', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); } }

  // ---------- 5. 기본 보안 계층 ----------
  const LAY = [['helmet', 220], ['CORS', 330], ['json 1MB', 440], ['rate limit', 560], ['zod 검증', 680]];
  const RQ = [['정상 요청', 80], ['다른 사이트 출처', 140], ['본문 1.1MB', 200], ['같은 IP 101번째', 260], ['email: "not-an-email"', 320]];
  // 각 요청이 멈추는 층 번호 (5 = 라우터까지) — 실행 결과: 200, 200(브라우저가 응답 차단), 413, 429, 400
  const STOP = [5, 5, 2, 3, 4], CODE = [200, 200, 413, 429, 400];
  function s5(t, c) { const { k, u } = c, nL = c.beat.security.layers.length;
    // 페이지 데이터의 층 수: 0,1,2,3,4,4 → 그림에서는 실제 순서대로 helmet·CORS·(json, rate limit)·zod
    const on = [k >= 1, k >= 2, k >= 3, k >= 3, k >= 4];
    LAY.forEach(([n, x], i) => { if (!on[i]) return; const s = (k === i + 1 || (k === 3 && i === 3) || (k === 4 && i === 4)) ? E(u, 0.1, 0.6) : 1;
      el('rect', { x: x - 34, y: 50, width: 68, height: 300 * s, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 1.8 });
      tx(x, 40, n, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: s }); });
    card(800, 200, 70, 300, { rx: 12, stroke: INK, sw: 2, text: '라우터', fs: 15 });
    RQ.forEach(([n, y], i) => { tx(20, y + 5, n, { 'font-size': 13.5, 'font-weight': 700, fill: i === 0 ? GOOD : INK });
      const stopAt = k === 0 ? 5 : (on[STOP[i]] ? STOP[i] : 5), xEnd = stopAt === 5 ? 762 : LAY[stopAt][1] - 34, g = E(u, 0.3 + i * 0.12, 1.6 + i * 0.12);
      el('line', { x1: 175, y1: y, x2: lerp(175, xEnd, g), y2: y, stroke: stopAt === 5 ? (i === 0 ? GOOD : MUT) : WARN, 'stroke-width': 3 });
      if (g >= 1) { if (stopAt < 5) { cross(xEnd - 4, y, 7); status(xEnd - 4, y + 22, CODE[i], 1, { fs: 13.5 }); }
        else if (k > 0) { status(902, y, 200, 1, { fs: 13.5 }); if (i === 1 && k >= 2) mono(440, y - 12, '응답은 브라우저가 못 읽음', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle' }); } } });
    if (k === 0) sub(480, 386, '계층이 없으면 무엇이든 라우터까지 간다', fade(u, 1.8), { fill: BAD, 'font-weight': 700 });
    if (k === 1) sub(480, 386, '응답에 X-Frame-Options: SAMEORIGIN · X-Content-Type-Options: nosniff · CSP 등이 붙는다', fade(u, 1.6));
    if (k === 2) { tx(480, 380, '다른 출처도 서버는 200으로 처리한다. 허용 헤더가 shop.example.com이라', { 'text-anchor': 'middle', 'font-size': 14, fill: INK, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(480, 402, '브라우저가 응답을 읽지 못하게 막을 뿐, curl 같은 도구는 막지 못한다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 3) sub(480, 386, '1MB 넘는 본문은 파싱 전에 413, 분당 100회를 넘긴 101번째는 429', fade(u, 1.8), { fill: INK });
    if (k === 4) sub(480, 386, '스키마에 안 맞으면 DB에 닿기 전에 400 {"error":"invalid"}', fade(u, 1.8), { fill: INK });
    if (k === 5) sub(480, 386, '정상 요청만 200 {"ok":true}까지 간다 · 각 위험은 자기 층에서 걸린다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); }

  // ---------- 6. 시크릿 · 의존성 ----------
  function s6(t, c) { const { k, u } = c;
    if (k === 0) { const cm = [['a1f3', 'DB 설정 추가', true], ['b7c2', '비밀번호 지움', false], ['HEAD', '기능 추가', false]];
      el('line', { x1: 140, y1: 150, x2: lerp(140, 800, E(u, 0.2, 1.4)), y2: 150, stroke: GRID, 'stroke-width': 4 });
      cm.forEach(([h, m, bad], i) => { const x = 160 + i * 300, s = pop(u, 0.3 + i * 0.4); el('circle', { cx: x, cy: 150, r: 16 * s, fill: bad ? BAD : PANEL, stroke: bad ? BAD : INK, 'stroke-width': 3 });
        mono(x, 110, h, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); tx(x, 196, m, { 'text-anchor': 'middle', 'font-size': 14, opacity: s }); });
      card(400, 260, 300, 44, { rx: 8, text: 'const dbPassword = "p@ssw0rd123";', mono: true, fs: 14, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.4) });
      grow(330, 238, 176, 162, E(u, 1.6, 2.0), BAD);
      tx(480, 330, '지우고 다시 커밋해도 a1f3 안에 그대로 남는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(480, 358, '이미 올렸다면 키를 폐기하고 새로 발급한다', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // .env → process.env → config
    const ENV = [['DATABASE_URL', 'postgres://…', 'dbUrl'], ['JWT_SECRET', k === 3 ? null : '••••••', 'jwtSecret'], ['REDIS_URL', 'redis://…', 'redisUrl']];
    el('rect', { x: 30, y: 60, width: 250, height: 150, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 }); mono(44, 84, '.env', { 'font-size': 15, 'font-weight': 800 });
    ENV.forEach(([a, b], i) => mono(44, 116 + i * 28, a + '=' + (b == null ? '' : b === '••••••' ? '••••••' : '…'), { 'font-size': 14, fill: b == null ? BAD : INK, opacity: k === 1 ? fade(u, 0.2 + i * 0.2) : 1 }));
    card(155, 250, 230, 40, { rx: 8, text: '.gitignore에 있다', fs: 14, stroke: GOOD, color: GOOD });
    grow(285, 135, 370, 135, k === 1 ? E(u, 0.8, 1.2) : 1, ACC); mono(328, 122, 'dotenv', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700 });
    el('rect', { x: 375, y: 60, width: 250, height: 150, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2 }); mono(389, 84, 'process.env', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    ENV.forEach(([a, b], i) => { const f = k === 1 ? fade(u, 1.2 + i * 0.3) : 1; mono(389, 116 + i * 28, a, { 'font-size': 14, opacity: f, fill: b == null ? BAD : INK }); if (b == null) mono(610, 116 + i * 28, 'undefined', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', 'font-weight': 700 }); });
    if (k >= 2) { grow(630, 135, 690, 135, k === 2 ? E(u, 0.2, 0.6) : 1, ACC);
      el('rect', { x: 695, y: 60, width: 240, height: 150, rx: 10, fill: k >= 3 ? PANEL : ACCBG, stroke: ACC, 'stroke-width': 2, opacity: k === 2 ? fade(u, 0.4) : 1 }); mono(709, 84, 'config', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      ENV.forEach(([a, b, key], i) => mono(709, 116 + i * 28, key + (b == null ? ': undefined' : ''), { 'font-size': 14, fill: b == null ? BAD : INK, opacity: k === 2 ? fade(u, 0.7 + i * 0.3) : 1 }));
      if (k === 2) sub(815, 240, '쓰는 쪽은 config.dbUrl만 안다', fade(u, 1.8)); }
    if (k === 1) sub(500, 240, '값의 출처가 코드에서 환경으로 바뀐다', fade(u, 2.0));
    if (k === 3) { terminal(330, 260, 600, 110, ['$ node app.js', ['Error: 환경변수 누락: jwtSecret', BAD], '(부팅 단계에서 바로 멈춘다)'], lerp(0, 3, E(u, 0.3, 1.6)), { fs: 14.5, lh: 24 });
      sub(155, 340, '새벽 500 대신 배포 순간 실패', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); }
    if (k === 4) { mono(330, 280, '$ npm audit', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
      const pk = [['express', GOOD], ['body-parser', GOOD], ['어떤 하위 패키지', BAD]];
      pk.forEach(([n, col], i) => { const x = 340 + i * 30, y = 310 + i * 30; card(x + 90, y, 200, 26, { rx: 6, text: n, fs: 13.5, stroke: col, color: col, s: pop(u, 0.4 + i * 0.3) }); });
      sub(450, 410, '내 코드가 깨끗해도 node_modules의 구멍이 내 구멍이다', fade(u, 1.5));
      [['상태 많고 트래픽 완만', '스케일 업 · 큰 서버 1대'], ['무상태 · 트래픽 급증', '스케일 아웃 · 여러 대 + LB']].forEach(([a, b], i) => { const y = 290 + i * 62, s = pop(u, 1.4 + i * 0.4);
        card(790, y, 290, 54, { rx: 10, stroke: INFO, sw: 2, s }); tx(660, y - 4, a, { 'font-size': 14, fill: MUT, opacity: s }); tx(660, y + 17, b, { 'font-size': 15, 'font-weight': 800, opacity: s }); }); } }

  const quiz = [
    { q: '8코어 서버에서 node app.js 하나만 띄우면 어떤 일이 생기는가?',
      o: ['Node가 알아서 8코어에 일을 나눈다', '이벤트 루프가 하나라 코어 하나만 일한다', '요청마다 새 스레드가 생긴다'], a: 1,
      why: 'JavaScript를 돌리는 메인 스레드는 프로세스당 하나다. cluster나 PM2로 코어 수만큼 프로세스를 띄워야 나머지 코어가 일한다.' },
    { q: 'pm2 reload api가 pm2 restart와 다른 점은 무엇인가?',
      o: ['워커를 하나씩 바꿔 배포 중에도 요청을 받는다', '모든 인스턴스를 한꺼번에 빠르게 내린다', '메모리 상한을 300M로 바꾼다'], a: 0,
      why: 'reload는 인스턴스를 순서대로 교체해 늘 나머지가 요청을 받는다. restart는 전부 내렸다 올려 그 사이 요청이 끊긴다.' },
    { q: '/report 계산을 메인 스레드에서 돌릴 때 30ms 뒤 온 /health는 어떻게 되는가?',
      o: ['다른 코어가 바로 처리해 6ms에 끝난다', '자동으로 워커 스레드로 넘어간다', '계산이 끝날 때까지 431ms를 기다린다'], a: 2,
      why: '계산이 이벤트 루프를 붙들고 있어 다른 콜백이 돌지 못한다. worker_threads로 옮기자 같은 요청이 6ms에 끝났다.' },
    { q: '인스턴스를 3대로 늘렸더니 로그인이 자꾸 풀린다. 원인은 무엇인가?',
      o: ['로드밸런서가 너무 느려서', '세션이 각 인스턴스 메모리에 있어 다른 인스턴스는 모른다', 'Redis 연결이 너무 많아서'], a: 1,
      why: '기본 MemoryStore는 그 서버 메모리에만 세션을 둔다. RedisStore로 옮기면 어느 인스턴스든 같은 세션을 읽는다.' },
    { q: 'cors({ origin: ALLOW_ORIGIN })를 붙였을 때 다른 사이트에서 온 요청은 어떻게 되는가?',
      o: ['서버가 403으로 거절한다', '서버는 처리하지만 브라우저가 그 응답을 읽지 못하게 막는다', 'rate limit이 바로 429를 준다'], a: 1,
      why: 'CORS 미들웨어는 허용 출처 헤더만 정한다. 실제로 서버는 200을 돌려줬고, 차단은 브라우저가 한다.' },
    { q: 'JWT_SECRET이 빠진 채 배포됐을 때 config.js의 검사 루프가 하는 일은 무엇인가?',
      o: ['undefined를 빈 문자열로 바꿔 계속 돈다', '첫 요청이 올 때 500을 낸다', '부팅 단계에서 "환경변수 누락: jwtSecret"을 던지고 멈춘다'], a: 2,
      why: '값이 비면 시작하자마자 실패시키는 빠른 실패다. 런타임에 가끔 나는 500보다 원인을 찾기 훨씬 쉽다.' },
  ];

  const summary = [
    '프로세스 하나는 코어 하나만 쓰므로 cluster나 PM2로 코어 수만큼 워커를 띄운다.',
    '무거운 계산은 이벤트 루프를 막으니 worker_threads로 옮기면 다른 요청이 바로 처리된다.',
    '서버를 여러 대로 늘리려면 세션·파일·캐시를 Redis·S3 같은 공유 저장소로 뺀다.',
    'helmet·CORS·크기 제한·rate limit·입력 검증을 라우터 앞에 두고, 시크릿은 환경변수로 받는다.',
  ];
  const review = [
    { q: 'PM2로 워커를 8개 띄웠는데 리포트 생성 요청이 올 때마다 그 워커의 다른 요청이 멈춘다. 먼저 할 일은?',
      o: ['워커 수를 16개로 늘린다', '리포트 계산을 worker_threads로 옮긴다', 'pm2 reload로 다시 배포한다'], a: 1,
      why: '프로세스를 늘려도 한 요청 안의 CPU 계산은 그 워커의 루프를 막는다. 계산만 옆 스레드로 빼야 같은 워커의 다른 요청이 산다.' },
    { q: '로드밸런서 뒤에 인스턴스를 늘린 뒤 업로드한 프로필 사진이 가끔 404가 된다. 먼저 의심할 것은?',
      o: ['파일을 받은 인스턴스의 로컬 디스크에만 저장했다', 'helmet이 이미지 헤더를 막았다', 'rate limit이 너무 낮다'], a: 0,
      why: '다른 인스턴스로 간 요청은 그 디스크를 보지 못한다. 세션을 Redis로 뺀 것처럼 파일도 S3 같은 공유 저장소에 둔다.' },
    { q: '보안 점검에서 "다른 출처에서 API 호출 가능"을 지적받았다. 서버 쪽에서 실제로 요청을 막으려면?',
      o: ['cors의 origin만 좁히면 서버가 요청을 거절한다', 'X-Frame-Options 헤더를 끈다', '인증 검사나 rate limit처럼 서버가 직접 거르는 층을 둔다'], a: 2,
      why: 'CORS는 브라우저가 응답을 읽지 못하게 할 뿐 서버는 요청을 처리한다. 막아야 할 요청은 인증·검증·횟수 제한으로 서버가 직접 거른다.' },
  ];

  R.page({ title: '코어·스레드·인스턴스·계층', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
