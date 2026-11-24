/* I-1-1 웹 서버란 (Event-driven) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, check, cross } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const N = (v) => Math.round(v).toLocaleString('en-US');

  // 1. Apache prefork: 자식 프로세스 칸이 연결 수만큼 늘고, 아래 메모리 막대가 32GB 를 넘는다
  const GX = 210, GY = 78, CW = 24, CH = 16, GP = 4, COLS = 15;
  const cxy = (i) => [GX + (i % COLS) * (CW + GP), GY + Math.floor(i / COLS) * (CH + GP)];
  function cell(i, fill, stroke, o) { o = o || {}; const [x, y] = cxy(i); el('rect', { x, y, width: CW, height: CH, rx: 3, fill: fill || 'none', stroke: stroke || 'none', 'stroke-width': 1.6, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); }
  function memBar(c) { const b = c.beat, p = c.prev || {}, v = tween(p.totalMem, b.totalMem, c.u), MAX = 32768, x = GX, w = 670, y = 330;
    tx(x, y - 12, '메모리 사용', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    el('rect', { x, y, width: w, height: 22, rx: 5, fill: SOFT, stroke: GRID });
    const over = v > MAX; el('rect', { x, y, width: w * clamp(v / MAX), height: 22, rx: 5, fill: over ? BAD : v > MAX * 0.5 ? WARN : ACC });
    [0, 16, 32].forEach((g) => { const gx = x + (w * g) / 32; el('line', { x1: gx, y1: y + 22, x2: gx, y2: y + 28, stroke: MUT }); mono(gx, y + 44, g + 'GB', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    tx(x + w, y - 12, '32GB 서버 (예시)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    mono(x + w / 2, y - 12, N(v) + ' MB', { 'font-size': 16, 'font-weight': 800, fill: over ? BAD : INK, 'text-anchor': 'middle' });
    if (over) { grow(x + w, y + 11, 935, y + 11, E(c.u, 1.2, 1.8), BAD, { sw: 3 }); } }
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    tx(GX, 52, 'Apache prefork · 자식 프로세스', { 'font-size': 15, 'font-weight': 700 });
    el('rect', { x: 690, y: 40, width: CW, height: CH, rx: 3, fill: ACC }); tx(722, 53, '= 프로세스 1개 · 약 25MB', { 'font-size': 13.5, fill: MUT });
    if (k === 0) {
      for (let i = 0; i < 10; i++) { const on = i < 5, s = pop(u, 0.3 + i * 0.12);
        if (on) { const [x, y] = cxy(i); card(x + CW / 2, y + CH / 2, CW, CH, { rx: 3, fill: ACCBG, stroke: ACC, sw: 1.6, s }); }
        else cell(i, 'none', WARN, { dash: '3 3', op: fade(u, 1.3) }); }
      tx(GX, GY + 48, 'StartServers 5 · 처음에 5개', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      tx(GX, GY + 72, '유휴(놀고 있는) 자식을 5~10개로 유지', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(GX, GY + 96, '요청이 오면 이미 떠 있는 자식이 받는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) });
    } else {
      for (let i = 0; i < 150; i++) cell(i, 'none', GRID);
      let busy, idle = 0;
      if (k === 1) busy = Math.round(lerp(5, 150, E(u, 0.2, 1.6)));
      else if (k === 2) { busy = 100; idle = 4; } else busy = 150;
      for (let i = 0; i < busy; i++) cell(i, k === 3 ? BAD : ACC, null, { op: k === 3 ? 0.85 : 1 });
      for (let i = busy; i < busy + idle; i++) cell(i, ACCBG, ACC);
      if (k === 1) { tx(GX + 430, GY + 20, 'MaxRequestWorkers', { 'font-size': 14, 'font-weight': 700, fill: INK, opacity: fade(u, 0.5) });
        mono(GX + 430, GY + 44, '150', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
        const q = Math.floor(lerp(0, 6, E(u, 1.6, 2.4))); for (let i = 0; i < q; i++) el('circle', { cx: GX + 440 + i * 16, cy: GY + 110, r: 6, fill: WARN });
        if (q) tx(GX + 430, GY + 140, '151번째부터 대기', { 'font-size': 14, 'font-weight': 700, fill: WARN }); }
      if (k === 2) { const [fx, fy] = cxy(104), s = pop(u, 1.4);
        card(820, fy + CH / 2, 130, 40, { text: '부모 httpd', fs: 14, stroke: INK });
        grow(755, fy + CH / 2, fx + CW + 4, fy + CH / 2, E(u, 0.8, 1.4), MUT);
        tx(690, fy - 10, 'fork()', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
        card(fx + CW / 2, fy + CH / 2, CW, CH, { rx: 3, fill: ACCBG, stroke: ACC, sw: 1.6, s });
        tx(650, fy + 52, '유휴가 모자랄 때만 fork', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
        // 연결 하나를 끝까지 잡은 자식 하나
        const [hx, hy] = cxy(37); el('rect', { x: hx - 3, y: hy - 3, width: CW + 6, height: CH + 6, rx: 4, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.2) });
        grow(80, hy + CH / 2, hx - 4, hy + CH / 2, E(u, 0.2, 0.8), INK);
        R.person(60, hy + 10, null, { s: 0.7 });
        tx(40, hy + 48, '연결 1개', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.6) });
        tx(40, hy + 68, '= 자식 1개', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.6) }); }
      if (k === 3) { for (let g = 3; g >= 1; g--) el('rect', { x: GX + g * 10, y: GY - g * 8, width: 15 * (CW + GP) - GP, height: 10 * (CH + GP) - GP, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 1.5, opacity: 0.25 * fade(u, 0.2 + (3 - g) * 0.2) });
        const n = tween(p.connections, b.connections, u, 1.6);
        mono(GX + 440, GY + 60, N(n), { 'font-size': 30, 'font-weight': 800, fill: BAD });
        tx(GX + 440, GY + 88, '프로세스가 필요하다', { 'font-size': 15, 'font-weight': 700, fill: BAD });
        tx(GX + 440, GY + 150, '250,000MB = 32GB의 7.6배', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) }); }
    }
    memBar(c); }

  // 2. C10K: 동시 연결 1만 개라는 질문, 곱셈의 벽, 원인 넷, 발상 전환, 구현체
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) { pill(480, 44, 'C10K · 1999 · Dan Kegel', INK, pop(u, 0.2), { fs: 15 });
      const n = Math.round(lerp(0, 1000, E(u, 0.4, 2.0)));
      for (let i = 0; i < n; i++) el('circle', { cx: 250 + (i % 40) * 12, cy: 100 + Math.floor(i / 40) * 9.4, r: 2.6, fill: i % 97 === 0 ? ACC : OFF });
      tx(760, 120, '동시 연결', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      mono(760, 150, N(n * 10), { 'font-size': 26, 'font-weight': 800 });
      tx(760, 180, '점 하나 = 10개', { 'font-size': 13.5, fill: MUT });
      tx(480, 385, '초당 요청 수가 아니라, 지금 붙어 있는 연결 수', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { const rows = [['100 연결', 2.5, '무시할 만'], ['1,000 연결', 25, '빡빡함'], ['10,000 연결', 250, '100% 소모']];
      tx(260, 60, '연결 × 25MB', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(945, 60, 'CPU 문맥 전환', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'end' });
      rows.forEach(([n, gb, cpu], i) => { const y = 110 + i * 90, g = E(u, 0.2 + i * 0.5, 0.9 + i * 0.5), w = Math.max(3, 500 * (gb / 250) * g), col = i === 2 ? BAD : i === 1 ? WARN : ACC;
        tx(60, y + 20, n, { 'font-size': 16, 'font-weight': 700 }); el('rect', { x: 260, y, width: w, height: 28, rx: 5, fill: col });
        mono(268 + w, y + 20, gb + ' GB', { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.7 + i * 0.5) });
        tx(945, y + 20, cpu, { 'font-size': 14.5, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.8 + i * 0.5) }); });
      tx(480, 390, '연결이 10배면 메모리도 10배. 곱셈이라 언젠가 벽에 닿는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2) }); return; }
    if (k === 2) { tx(60, 62, 'CPU 코어 하나의 시간', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const cols = [ACC, INFO, WARN, GOOD], W = 520, done = E(u, 0.2, 1.6);
      for (let i = 0; i < 12; i++) { const x = 60 + i * 44; if ((i + 1) / 12 > done + 0.08) break;
        el('rect', { x, y: 76, width: 36, height: 28, rx: 3, fill: cols[i % 4], opacity: 0.8 }); el('rect', { x: x + 37, y: 76, width: 6, height: 28, fill: BAD }); }
      tx(60, 126, '빨간 틈 = 프로세스를 바꿔 끼우는 비용', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.2) });
      tx(60, 186, '프로세스 A', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.2) });
      el('rect', { x: 60, y: 198, width: 90, height: 26, rx: 3, fill: ACC, opacity: fade(u, 1.3) });
      el('rect', { x: 150, y: 198, width: Math.max(0.1, 330 * E(u, 1.4, 2.3)), height: 26, fill: 'none', stroke: MUT, 'stroke-dasharray': '4 4', 'stroke-width': 2 });
      mono(160, 216, 'read() 기다리는 중…', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      el('rect', { x: 480, y: 198, width: 60, height: 26, rx: 3, fill: ACC, opacity: fade(u, 2.3) });
      [['① 메모리', '스택·힙·FD 테이블'], ['② 문맥 전환', '초당 수만 회'], ['③ fork / clone', '만들 때마다 시스템콜'], ['④ blocking I/O', 'read() 동안 놀기']].forEach(([a, d], i) => {
        const y = 80 + i * 72, s = pop(u, 0.3 + i * 0.5); card(790, y, 270, 58, { rx: 10, stroke: BAD, sw: 2, s });
        tx(672, y - 3, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.5) }); tx(672, y + 18, d, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) }); });
      tx(60, 300, '메모리만 늘려도 ②·④가 남는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { const cx = 330, cy = 215, r = 130, ready = [5, 17, 30, 41];
      for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2 - Math.PI / 2, on = i < lerp(0, 48, E(u, 0.2, 1.0));
        if (!on) continue; const hot = ready.includes(i) && u > 1.3;
        el('line', { x1: cx + Math.cos(a) * 52, y1: cy + Math.sin(a) * 52, x2: cx + Math.cos(a) * (r - 8), y2: cy + Math.sin(a) * (r - 8), stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2.5 : 1 });
        el('circle', { cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, r: hot ? 8 : 5, fill: hot ? ACC : OFF }); }
      el('circle', { cx, cy, r: 50, fill: ACCBG, stroke: ACC, 'stroke-width': 3 });
      tx(cx, cy - 4, '프로세스', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC }); tx(cx, cy + 16, '1개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
      card(760, 120, 220, 64, { text: '커널\nepoll / kqueue', fs: 15, stroke: INFO, color: INFO, s: pop(u, 1.0) });
      grow(650, 135, cx + 60, cy - 30, E(u, 1.3, 1.9), ACC);
      tx(620, 200, '준비된 연결만 알려 준다', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.7) });
      tx(560, 300, '연결 하나의 몫: 25MB → 수 KB', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(560, 330, '1 프로세스 = N 연결', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.3) }); return; }
    // k4: 연표
    const X = (y) => 120 + (y - 1997) * 52, g = E(u, 0.2, 1.8), ay = 190;
    el('line', { x1: X(1997), y1: ay, x2: lerp(X(1997), X(2011), g), y2: ay, stroke: INK, 'stroke-width': 3 });
    [[1999, 'C10K 질문', MUT], [2004, 'Nginx', ACC], [2009, 'Node.js', INFO]].forEach(([y, s, col], i) => { const on = clamp((g - (X(y) - X(1997)) / (X(2011) - X(1997))) * 8);
      el('circle', { cx: X(y), cy: ay, r: 9 * on, fill: col }); mono(X(y), ay + 34, String(y), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: on });
      lbl(X(y), ay - 24, s, on, { fill: col, 'font-size': 16 }); });
    tx(X(2004), ay - 48, 'Igor Sysoev', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
    ['Nginx', 'Node.js', 'HAProxy'].forEach((s, i) => pill(300 + i * 180, 300, s, ACC, pop(u, 1.8 + i * 0.15), { fs: 15 }));
    tx(480, 360, '공통 뿌리: event loop + non-blocking I/O', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.3) }); }

  // 3. Nginx: master 아래 worker 가 코어마다 하나, worker 하나는 epoll 이벤트 루프로 연결 1만 개를 돈다
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) { card(480, 56, 220, 46, { text: 'master (root)', fs: 16, stroke: INK, s: pop(u, 0.2) });
      for (let i = 0; i < 8; i++) { const x = 165 + i * 90, s = pop(u, 0.6 + i * 0.13);
        grow(480, 80, x, 178, E(u, 0.5 + i * 0.13, 0.9 + i * 0.13), MUT, { plain: true });
        card(x, 200, 74, 44, { text: 'worker', fs: 14, stroke: ACC, color: ACC, fill: ACCBG, s });
        el('line', { x1: x, y1: 224, x2: x, y2: 300, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '3 4', opacity: fade(u, 1.6) });
        card(x, 322, 60, 40, { text: 'core', fs: 13.5, stroke: MUT, color: MUT, sw: 1.5, op: fade(u, 1.6) }); }
      tx(480, 380, 'worker_processes auto → 코어 8개면 worker 8개 (예시)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      mono(480, 406, 'worker_rlimit_nofile 65535  # worker 하나가 열 수 있는 FD', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 1) { const cx = 300, cy = 220, r = 140, f = E(u, 0.2, 1.5);
      for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2 - Math.PI / 2; if (i / 60 > f) break;
        el('circle', { cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, r: 5, fill: OFF }); }
      el('circle', { cx, cy, r: 70, fill: ACCBG, stroke: ACC, 'stroke-width': 3 });
      tx(cx, cy - 10, 'worker 1', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC });
      mono(cx, cy + 16, N(10000 * f), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 }); tx(cx, cy + 36, '연결', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      mono(cx, 40, 'worker_connections 10000;', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3) });
      card(740, 110, 220, 50, { text: 'use epoll', fs: 16, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.6) });
      tx(740, 158, '커널이 준비된 소켓만 돌려준다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9) });
      tx(630, 250, '새 연결 대기열', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.2) });
      const go = seg(u, 1.6, 2.4); [0, 1, 2, 3].forEach((i) => { const sx = 650 + i * 30, sy = 280;
        if (go <= 0) el('circle', { cx: sx, cy: sy, r: 8, fill: ACC, opacity: fade(u, 1.2) });
        else if (go < 1) el('circle', { cx: lerp(sx, cx + r + 6, E(go, 0, 1)), cy: lerp(sy, cy + 20 + i * 12, E(go, 0, 1)), r: 8, fill: ACC }); });
      mono(630, 330, 'multi_accept on;', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(630, 354, '깨어난 김에 대기 중인 연결을 한 번에 받는다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { for (let i = 0; i < 8; i++) { const x = 150 + (i % 4) * 170, y = 80 + Math.floor(i / 4) * 110, f = E(u, 0.2 + i * 0.15, 0.6 + i * 0.15);
        card(x, y, 140, 76, { rx: 10, stroke: ACC, sw: 2, fill: PANEL });
        tx(x - 58, y - 14, 'worker ' + (i + 1), { 'font-size': 14, 'font-weight': 700, fill: ACC });
        el('rect', { x: x - 58, y: y + 2, width: 116, height: 10, rx: 3, fill: SOFT }); el('rect', { x: x - 58, y: y + 2, width: 116 * f, height: 10, rx: 3, fill: ACC });
        mono(x - 58, y + 32, N(10000 * f), { 'font-size': 14.5, 'font-weight': 700 }); }
      const tot = tween(p.connections, b.connections, u, 1.6);
      mono(480, 330, '8 × 10,000 =', { 'text-anchor': 'end', 'font-size': 20, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.0) });
      mono(496, 330, N(tot), { 'font-size': 30, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      tx(480, 380, '서버 전체 동시 연결 상한 = worker 수 × worker_connections', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2) }); return; }
    // k3: 이벤트 루프
    pill(150, 56, '① epoll_create', INFO, pop(u, 0.2), { mono: true, fs: 14 }); grow(240, 56, 290, 56, E(u, 0.5, 0.8), MUT);
    pill(400, 56, '② epoll_ctl(ADD)', INFO, pop(u, 0.7), { mono: true, fs: 14 });
    const cx = 300, cy = 250, r = 92;
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3, opacity: fade(u, 1.0) });
    pill(cx, cy - r, '③ epoll_wait', ACC, pop(u, 1.0), { mono: true, fs: 14, fill: PANEL });
    pill(cx, cy + r, '④ read / write', ACC, pop(u, 1.2), { mono: true, fs: 14, fill: PANEL });
    tx(cx - r - 16, cy + 5, '⑤ 다시 ③', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.4) });
    if (u > 1.3) { const a = ((u - 1.3) * 2.4) * Math.PI * 2 - Math.PI / 2; el('circle', { cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, r: 8, fill: ACC }); }
    tx(cx, cy + 5, '논블로킹', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
    tx(600, 140, '등록된 연결 (FD)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.8) });
    const ready = [9, 22, 35];
    for (let i = 0; i < 48; i++) { const x = 600 + (i % 8) * 36, y = 156 + Math.floor(i / 8) * 30, hot = ready.includes(i) && u > 1.6;
      el('rect', { x, y, width: 28, height: 22, rx: 4, fill: hot ? ACC : SOFT, stroke: hot ? ACC : GRID, opacity: fade(u, 0.8 + i * 0.01) }); }
    tx(600, 360, '③이 준비된 3개만 돌려준다', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
    tx(600, 386, 'fork도 스레드 생성도 없다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); }

  // 4. 메모리: 프로세스 1만 개 대 worker 8개, 250GB 대 2.5MB, 25MB 쪼개 보기, 연결 하나의 몫, 32GB 서버에 몇 개
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { zone(30, 40, 450, 340, 'Apache prefork', { fill: SOFT }); zone(500, 40, 430, 340, 'Nginx', { fill: SOFT, color: ACC });
      const n = Math.round(lerp(0, 1000, E(u, 0.2, 1.4)));
      for (let i = 0; i < n; i++) el('rect', { x: 62 + (i % 40) * 9.6, y: 80 + Math.floor(i / 40) * 9.6, width: 7.5, height: 7.5, fill: BAD, opacity: 0.75 });
      mono(255, 345, N(n * 10) + ' 프로세스', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD });
      tx(255, 370, '칸 하나 = 10개 · 연결당 25MB', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
      for (let i = 0; i < 8; i++) card(590 + (i % 4) * 85, 150 + Math.floor(i / 4) * 70, 70, 48, { text: 'worker', fs: 13.5, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.4 + i * 0.08) });
      mono(715, 345, '8 worker', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      tx(715, 370, '연결당 수백 바이트 (idle)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { const x = 220, W = 640;
      tx(60, 104, 'Apache', { 'font-size': 16, 'font-weight': 700 }); tx(60, 194, 'Nginx', { 'font-size': 16, 'font-weight': 700, fill: ACC });
      el('rect', { x, y: 84, width: W * E(u, 0.2, 1.2), height: 30, rx: 5, fill: BAD });
      mono(x + W - 8, 105, '250 GB', { 'font-size': 16, 'font-weight': 800, fill: PANEL, 'text-anchor': 'end', opacity: fade(u, 1.1) });
      el('rect', { x, y: 174, width: 2.5, height: 30, fill: ACC, opacity: fade(u, 1.2) });
      mono(x + 36, 195, '≈ 2.5 MB', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
      tx(x + 132, 195, 'idle 연결 1만 개 (nginx.org)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
      el('circle', { cx: x + 2, cy: 189, r: 26 * pop(u, 1.5), fill: 'none', stroke: ACC, 'stroke-width': 2 });
      [['문맥 전환', '매우 많음', '거의 없음'], ['fork', '자식 모자랄 때마다', '시작할 때 1회']].forEach(([a, l, r2], i) => { const y = 280 + i * 50, op = fade(u, 1.8 + i * 0.3);
        tx(60, y, a, { 'font-size': 15, 'font-weight': 700, opacity: op }); tx(220, y, l, { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: op }); tx(520, y, r2, { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: op }); }); return; }
    if (k === 2) { const parts = [[5, '기본 RSS', OFF], [15, 'mod_php / mod_perl', BAD], [3, '버퍼·환경 변수', WARN], [2, '기타 모듈', INFO]], x0 = 140, W = 680, sp = E(u, 0.6, 1.4) * 14;
      tx(x0, 60, '자식 프로세스 하나 = 약 25MB', { 'font-size': 15, 'font-weight': 700 });
      let x = x0; parts.forEach(([mb, name, col], i) => { const w = (W * mb) / 25 - 4;
        el('rect', { x: x + i * sp, y: 80, width: w, height: 44, rx: 5, fill: col, opacity: 0.85 });
        mono(x + i * sp + w / 2, 108, mb + 'MB', { 'font-size': 15, 'font-weight': 800, fill: i === 1 ? PANEL : INK, 'text-anchor': 'middle', opacity: fade(u, 1.0 + i * 0.2) });
        tx(x + i * sp + (i === 3 ? w : 0), 148 + (i === 3 ? 22 : 0), name, { 'font-size': 13.5, fill: MUT, 'font-weight': 600, 'text-anchor': i === 3 ? 'end' : 'start', opacity: fade(u, 1.1 + i * 0.2) }); x += w + 4; });
      for (let g = 0; g < 5; g++) { const y = 210 + g * 26, s = E(u, 1.6 + g * 0.15, 2.0 + g * 0.15);
        el('rect', { x: x0 + g * 6, y, width: W * s, height: 18, rx: 4, fill: BAD, opacity: 0.25 + 0.1 * g }); }
      tx(x0, 370, '연결마다 이 덩어리가 통째로 하나씩 더 생긴다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { const busy = u > 0.9 && u < 2.0, ph = u < 0.9 ? 'idle' : busy ? '요청 처리 중' : 'idle';
      tx(80, 60, 'Nginx 연결 하나의 몫', { 'font-size': 15, 'font-weight': 700 });
      pill(780, 60, ph, busy ? WARN : ACC, 1, { fs: 15 });
      card(180, 140, 200, 56, { text: 'ngx_connection_t\n232 B', fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.2) });
      const bo = busy ? E(u, 0.95, 1.2) : u >= 2.0 ? 1 - E(u, 2.0, 2.3) : 0;
      card(470, 140, 210, 56, { text: '요청 버퍼\n1~8 KB', fs: 14, mono: true, stroke: WARN, color: WARN, dash: '5 4', op: Math.max(0.15, bo) });
      for (let i = 0; i < 8; i++) el('rect', { x: 620 + i * 34, y: 114, width: 28, height: 52, rx: 4, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: Math.max(0.15, bo) });
      mono(756, 196, 'proxy_buffers 8 × 4KB', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', opacity: Math.max(0.3, bo) });
      tx(470, 238, '요청을 처리하는 동안에만 붙었다가 돌려준다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.2) });
      el('rect', { x: 120, y: 290, width: 720, height: 70, rx: 12, fill: ACCBG, opacity: fade(u, 2.1) });
      tx(480, 320, 'idle keep-alive 연결 1만 개 ≈ 2.5 MB', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
      tx(480, 346, '하나에 250바이트 남짓 (nginx.org 소개 문구)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k4: 32GB 서버에 연결 몇 개
    zone(40, 40, 880, 330, '같은 32GB 서버', { fill: SOFT });
    const W = 600, x = 250, a = 1200 * E(u, 0.3, 0.9), n = 100000 * E(u, 1.0, 2.0);
    tx(70, 130, 'Apache', { 'font-size': 16, 'font-weight': 700 }); tx(70, 230, 'Nginx', { 'font-size': 16, 'font-weight': 700, fill: ACC });
    el('rect', { x, y: 108, width: Math.max(2, (W * a) / 100000), height: 32, rx: 3, fill: BAD });
    mono(x + 20, 130, '~' + N(a), { 'font-size': 16, 'font-weight': 800, fill: BAD });
    tx(x, 168, '32GB ÷ 25MB ≈ 1,310, 여유를 두면 ~1,200', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9) });
    el('rect', { x, y: 208, width: (W * n) / 100000, height: 32, rx: 3, fill: ACC });
    mono(x + Math.max(20, (W * n) / 100000 - 10), 230, N(n) + '+', { 'font-size': 16, 'font-weight': 800, fill: n > 20000 ? PANEL : ACC, 'text-anchor': n > 20000 ? 'end' : 'start' });
    tx(480, 320, '80배 넘게 더 받는다', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) }); }

  // 5. 왜 Nginx: 점유율, 쓰는 곳, 다섯 역할이 쌓이는 바닥, 한 문장
  function s5(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) { const rows = [['Nginx', 33.8, ACC], ['Apache', 26.4, MUT], ['Cloudflare Server', 22.4, INFO], ['LiteSpeed', 14.1, MUT]];
      tx(250, 52, '웹 서버 점유율 · W3Techs 2024 (페이지 값)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      rows.forEach(([n, v, col], i) => { const y = 80 + i * 72, g = E(u, 0.2 + i * 0.3, 1.0 + i * 0.3);
        tx(230, y + 22, n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end', fill: i === 0 ? ACC : INK });
        el('rect', { x: 250, y, width: Math.max(2, 13 * v * g), height: 32, rx: 5, fill: col, opacity: i === 0 ? 1 : 0.6 });
        mono(258 + 13 * v * g, y + 22, v.toFixed(1) + '%', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.8 + i * 0.3) }); });
      tx(250, 384, '3위는 예전엔 수정한 Nginx, 2022년부터 자체 Pingora로 옮기는 중', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { const cx = 480, cy = 215, nodes = [[200, 100, 'Netflix', 'Open Connect 캐시 장비'], [760, 100, 'GitHub', 'GitHub Pages'], [200, 330, 'Cloudflare', 'edge (예전)'], [760, 330, '국내 대형 서비스', 'Nginx · OpenResty']];
      nodes.forEach(([x, y, a, d], i) => { const g = E(u, 0.4 + i * 0.35, 0.9 + i * 0.35);
        el('line', { x1: cx, y1: cy, x2: lerp(cx, x, g), y2: lerp(cy, y, g), stroke: GRID, 'stroke-width': 3 });
        if (g >= 1) { dot([[cx, cy], [x, y]], (t * 0.7 + i * 0.25) % 1, ACC, 5); card(x, y, 210, 62, { rx: 10, stroke: INK, sw: 2 });
          tx(x, y - 3, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }); tx(x, y + 19, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); } });
      el('polygon', { points: [0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2; return `${cx + Math.cos(a) * 58},${cy + Math.sin(a) * 58}`; }).join(' '), fill: ACC, opacity: pop(u, 0.2) });
      tx(cx, cy + 6, 'Nginx', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: PANEL, opacity: fade(u, 0.3) }); return; }
    if (k === 2) { card(480, 360, 640, 44, { text: '바닥: 동시 연결을 싸게 든다 (event loop)', fs: 15, fill: INK, stroke: 'none', color: PANEL });
      [['웹 서버', '정적 파일'], ['리버스 프록시', '백엔드 앞단'], ['로드 밸런서', 'upstream 분산'], ['TLS 종단', 'HTTPS 처리'], ['캐시 · 압축', 'proxy_cache, gzip']].forEach(([a, d], i) => {
        const yT = 305 - i * 52, a0 = 0.2 + i * 0.42, y = lerp(30, yT, E(u, a0, a0 + 0.4));
        if (u < a0) return; card(480, y, 520 - i * 30, 44, { rx: 8, stroke: ACC, fill: ACCBG, sw: 2 });
        tx(480 - (520 - i * 30) / 2 + 18, y + 6, a, { 'font-size': 15.5, 'font-weight': 800, fill: ACC }); tx(480 + (520 - i * 30) / 2 - 18, y + 6, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }); return; }
    const cx = 480, cy = 250, n = tween(p.connections, b.connections, u, 1.6), f = E(u, 0.2, 1.8);
    for (let i = 0; i < 90; i++) { if (i / 90 > f) break; const a = (i / 90) * Math.PI * 2 - Math.PI / 2, rr = 120 + (i % 3) * 14; el('circle', { cx: cx + Math.cos(a) * rr, cy: cy + Math.sin(a) * rr * 0.72, r: 4, fill: i % 11 === 0 ? ACC : OFF }); }
    card(cx, cy, 180, 70, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.5 });
    mono(cx, cy - 2, N(n), { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: ACC }); tx(cx, cy + 22, '동시 연결', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    tx(cx, 56, 'worker 몇 개가 연결 10만을 들고도 버틴다', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.9) }); }

  const quiz = [
    { q: 'prefork 서버에 동시 연결 150개가 꽉 찬 상태에서 151번째 연결이 오면 어떻게 되는가?',
      o: ['새 스레드를 만들어 바로 처리한다', '자식 프로세스가 빌 때까지 큐에서 기다린다', '가장 오래된 연결을 끊고 받는다'], a: 1,
      why: 'MaxRequestWorkers 150이 동시에 살아 있을 수 있는 자식 수다. 그 위로 온 연결은 자리가 날 때까지 기다린다.' },
    { q: 'C10K 문제에서 메모리를 아무리 늘려도 남는 원인은 무엇인가?',
      o: ['문맥 전환과 blocking I/O', '디스크 용량 부족', '네트워크 대역폭'], a: 0,
      why: '1만 개 프로세스를 코어 몇 개가 번갈아 돌리는 비용과, read()가 끝날 때까지 노는 시간은 메모리와 상관없이 남는다.' },
    { q: '코어 8개 서버에서 worker_processes auto, worker_connections 10000이면 전체 동시 연결 상한은 얼마인가?',
      o: ['10,000', '65,535', '80,000'], a: 2,
      why: '전체 상한은 worker 수 × worker_connections다. 8 × 10,000 = 80,000이다.' },
    { q: 'nginx.org 소개에 따르면 idle keep-alive 연결 1만 개가 쓰는 메모리는 대략 얼마인가?',
      o: ['약 2.5MB', '약 20GB', '약 250GB'], a: 0,
      why: '연결 하나에 작은 구조체만 남기고 버퍼는 요청 중에만 잡기 때문에 1만 개가 2.5MB 남짓이다. 250GB는 prefork로 1만 연결을 받을 때다.' },
    { q: 'Nginx의 다섯 역할(웹 서버, 프록시, 로드 밸런서, TLS 종단, 캐시)이 공통으로 기대는 능력은 무엇인가?',
      o: ['요청마다 새 프로세스를 띄우는 능력', '동시 연결을 적은 메모리로 오래 들고 있는 능력', 'PHP를 직접 실행하는 능력'], a: 1,
      why: '다섯 역할 모두 많은 연결을 동시에 붙잡고 있어야 한다. event loop로 연결 하나를 싸게 드는 것이 그 바닥이다.' },
  ];

  const summary = [
    'Apache prefork는 자식 프로세스 하나가 연결 하나를 맡아 연결마다 약 25MB를 쓴다.',
    '그래서 동시 연결 1만이면 250GB가 필요하고 문맥 전환과 blocking I/O도 같이 터진다.',
    'Nginx는 코어 수만큼의 worker가 epoll 이벤트 루프로 준비된 연결만 골라 처리한다.',
    'idle 연결 1만 개가 약 2.5MB라서 같은 32GB 서버로 80배 넘는 연결을 받는다.',
  ];
  const review = [
    { q: '동시 접속이 1,000을 넘자 Apache prefork 서버의 메모리가 바닥났다. 설정만 바꿔서 해결되지 않는 이유는?',
      o: ['MaxRequestWorkers를 더 올리면 해결된다', '연결마다 프로세스 하나라는 모델 자체가 메모리를 연결 수에 곱하기 때문이다', 'fork를 끄면 메모리가 줄기 때문이다'], a: 1,
      why: '자식 하나가 연결 하나를 맡는 한, 연결이 늘면 25MB짜리 프로세스도 똑같이 는다. 상한을 올리면 메모리 벽에 더 빨리 닿을 뿐이다.' },
    { q: 'worker_connections를 10000으로 올렸는데 연결이 1,024개 근처에서 막힌다. 먼저 의심할 것은?',
      o: ['worker가 열 수 있는 FD 한도(worker_rlimit_nofile)', 'epoll 대신 select가 쓰이고 있다', 'worker_processes가 너무 많다'], a: 0,
      why: '연결 하나는 FD 하나다. 프로세스의 FD 한도가 낮으면 worker_connections를 올려도 그 한도에서 먼저 막힌다.' },
    { q: 'Nginx worker 하나에서 오래 걸리는 동기 작업이 돌기 시작했다. 무슨 일이 생기는가?',
      o: ['다른 worker가 그 연결들을 자동으로 넘겨받는다', 'master가 새 worker를 띄워 그 작업만 맡긴다', '그 worker가 맡은 수천 개 연결이 함께 멈춘다'], a: 2,
      why: 'worker 하나는 이벤트 루프 하나로 많은 연결을 번갈아 처리한다. 루프가 한 곳에서 막히면 그 worker의 연결 전부가 기다린다.' },
  ];

  R.page({ title: '프로세스 모델과 이벤트 루프', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
