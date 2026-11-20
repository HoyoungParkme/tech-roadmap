/* I-2-2 Redis 설치와 첫 명령 — 장면 5개 (../anim/engine.js 규칙을 따른다)
   왼쪽: beat 의 terminal 데이터를 차례로 친다. 오른쪽: 그 명령이 바꾼 것(컨테이너, 포트, 키, TTL…)을 그린다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, pill, grow, fly, dot, server, redisBox, cross, check, clock, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const H = { 'font-size': 14, 'font-weight': 700, fill: MUT };
  const mid = (x, y, s, o) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }, o || {}));

  // ---------- 터미널 ----------
  const TX = 16, TY = 20, TW = 470, TH = 380, FS = 13.5, MAXW = TW - 34;
  const fit = (s) => { if (tw(s, FS) <= MAXW) return s; let o = s; while (o.length && tw(o + '…', FS) > MAXW) o = o.slice(0, -1); return o + '…'; };
  const linesOf = (b) => (b.terminal || []).map((l) => (l.prompt ? fit(l.prompt + ' ' + l.cmd) : fit(l.out)));
  // 줄 i 가 나타나는 시각 (명령은 타이핑, 출력은 바로)
  const plan = (b) => { const n = (b.terminal || []).length, step = Math.min(0.5, 2.1 / Math.max(1, n)); return (i) => 0.2 + i * step; };
  function term(c) { const b = c.beat, L = linesOf(b), at = plan(b), T = b.terminal || [], st = Math.min(0.5, 2.1 / Math.max(1, T.length));
    let shown = 0; T.forEach((l, i) => { shown += l.prompt ? seg(c.u, at(i), at(i) + st * 0.8) : c.u > at(i) ? 1 : 0; });
    terminal(TX, TY, TW, TH, L, shown, { fs: FS }); return at; }

  // ---------- 공통: 호스트와 컨테이너 ----------
  const HX = 510, HY = 40, HW = 430, HH = 330, CX = 600, CY = 110, CW = 290, CH = 150;
  function host(o) { o = o || {}; const a = o.op ?? 1;
    el('rect', { x: HX, y: HY, width: HW, height: HH, rx: 14, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: a });
    tx(HX + 14, HY + 24, '호스트 (내 PC)', Object.assign({ opacity: a }, H)); }
  function container(o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.01) return;
    const g = R.G(CX + CW / 2, CY + CH / 2, s);
    el('rect', { x: -CW / 2, y: -CH / 2, width: CW, height: CH, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }, g);
    mono(-CW / 2 + 14, -CH / 2 + 26, 'container: redis', { 'font-size': 15, 'font-weight': 800, fill: ACC }, g);
    mono(-CW / 2 + 14, -CH / 2 + 52, 'image redis:7', { 'font-size': 14, fill: MUT }, g);
    el('circle', { cx: -CW / 2 + 22, cy: 30, r: 7, fill: o.up ? GOOD : OFF }, g);
    mono(-CW / 2 + 38, 35, o.proc || 'redis-server', { 'font-size': 14.5, 'font-weight': 700 }, g); }
  function port(g, o) { o = o || {}; if (g <= 0) return; const y = CY + CH / 2;
    el('rect', { x: HX - 8, y: y - 14, width: 16, height: 28, rx: 3, fill: o.col || INK });
    el('line', { x1: HX + 8, y1: y, x2: HX + 8 + (CX - HX - 16) * g, y2: y, stroke: o.col || INK, 'stroke-width': 3 });
    if (g > 0.95) el('rect', { x: CX - 8, y: y - 10, width: 12, height: 20, rx: 3, fill: o.col || INK });
    mono(HX + 46, y - 22, '6379', { 'font-size': 14.5, 'font-weight': 800, fill: o.col || INK, 'text-anchor': 'middle', opacity: clamp(g * 2 - 1) }); }

  // ---------- 1. 설치 ----------
  function s1(t, c) { const { k, u } = c, at = term(c);
    if (k === 0) { host(); container({ s: pop(u, at(1) - 0.1), up: u > at(1) + 0.3 });
      port(E(u, 1.0, 1.6));
      pill(HX + 215, 300, '-d 백그라운드', INK, pop(u, 1.7), { mono: true, fs: 14 });
      pill(HX + 215, 340, 'localhost:6379 열림', ACC, pop(u, 2.1), { mono: true, fs: 14 }); return; }
    if (k === 1) { const y0 = 50;
      el('rect', { x: 530, y: y0, width: 400, height: 250, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      el('path', { d: `M890,${y0} v28 h40`, fill: 'none', stroke: INK, 'stroke-width': 2 });
      mono(548, y0 + 26, 'docker-compose.yml', { 'font-size': 15, 'font-weight': 800 });
      ['services:', '  redis:', '    image: redis:7', '    ports:', '      - "6379:6379"'].forEach((s, i) => { const a = fade(u, 0.5 + i * 0.35, 0.2), hot = i === 4 && u > 2.2;
        if (hot) el('rect', { x: 540, y: y0 + 50 + i * 34, width: 380, height: 28, rx: 5, fill: ACCBG });
        mono(552, y0 + 70 + i * 34, s, { 'font-size': 15, opacity: a, fill: i === 2 || i === 4 ? ACC : INK }); });
      mid(730, 350, '설정이 파일로 남는다 → 재현 가능', { fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 2) { host();
      const vg = pop(u, at(2)), cs = pop(u, at(3));
      container({ s: cs, up: u > at(3) + 0.3, proc: 'redis-server --appendonly yes' });
      port(cs > 0.9 ? 1 : 0);
      const vx = CX + 70, vy = 320, a = vg;
      if (a > 0.01) { const g = R.G(vx, vy, a);
        el('path', { d: 'M-46,-18 V18 A46,12 0 0 0 46,18 V-18', fill: PANEL, stroke: INFO, 'stroke-width': 2.5 }, g); el('ellipse', { cx: 0, cy: -18, rx: 46, ry: 12, fill: PANEL, stroke: INFO, 'stroke-width': 2.5 }, g);
        mono(0, 10, 'redis-data', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' }, g); }
      if (cs > 0.9) { el('line', { x1: vx, y1: CY + CH, x2: vx, y2: 300, stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }); mono(vx + 8, 286, '/data', { 'font-size': 14, fill: INFO }); }
      // AOF 파일에 명령이 쌓인다
      const ax = 790, ay = 290; if (u > at(3) + 0.3) { el('rect', { x: ax, y: ay, width: 140, height: 70, rx: 6, fill: PANEL, stroke: WARN, 'stroke-width': 2 });
        mono(ax + 10, ay + 20, 'appendonly.aof', { 'font-size': 13.5, 'font-weight': 700, fill: WARN });
        for (let i = 0; i < Math.round(lerp(0, 4, E(u, at(3) + 0.4, 2.8))); i++) el('rect', { x: ax + 10, y: ay + 30 + i * 9, width: 70 + (i % 2) * 40, height: 5, rx: 2, fill: WARN, opacity: 0.6 }); }
      return; }
    if (k === 3) { [['docker', 'docker run … redis:7', '팀과 버전을 맞추기 쉽다', ACC, 0.2], ['macOS', 'brew install redis', 'brew services start redis', INK, 0.8], ['Ubuntu', 'sudo apt install redis-server', 'sudo systemctl start redis', INK, 1.4]].forEach(([os, a, b, col, t0], i) => {
        const y = 80 + i * 110, s = pop(u, t0);
        card(726, y, 410, 92, { rx: 10, stroke: col, sw: i === 0 ? 2.5 : 1.6, s });
        tx(536, y - 18, os, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, t0 + 0.1) });
        mono(536, y + 8, a, { 'font-size': 14, opacity: fade(u, t0 + 0.2) });
        (i ? mono : tx)(536, y + 32, b, { 'font-size': 14, fill: MUT, opacity: fade(u, t0 + 0.3) }); });
      mid(726, 404, '로컬 설치는 버전이 OS 패키지에 묶인다', { fill: WARN, opacity: fade(u, 2.2) }); return; }
    // k 4 docker ps
    host(); container({ up: true }); port(1, { col: GOOD });
    const sa = pop(u, at(3) + 0.1);
    pill(CX + 150, 300, 'STATUS  Up 2 seconds', GOOD, sa, { mono: true, fs: 14 });
    pill(CX + 150, 340, 'PORTS  0.0.0.0:6379', GOOD, pop(u, at(4) + 0.1), { mono: true, fs: 14 });
    if (u > 2.2) { check(CX + 30, 300, 9, pop(u, 2.2)); check(CX + 30, 340, 9, pop(u, 2.4)); } }

  // ---------- 2. redis-cli ----------
  function s2(t, c) { const { k, u } = c, at = term(c);
    if (k === 0) { host(); container({ up: true, proc: u > at(1) ? 'redis-cli' : 'redis-server' });
      grow(TX + TW + 2, 150, CX + 20, 150, E(u, 0.4, 0.9), ACC);
      mono(HX + 30, 140, 'exec -it', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.6) });
      pill(CX + CW / 2, 320, '127.0.0.1:6379>', ACC, pop(u, at(1)), { mono: true, fs: 15 });
      mid(CX + CW / 2, 364, '컨테이너 안의 CLI 를 그대로 쓴다', { fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { [['-h', 'localhost', 'host'], ['-p', '6379', 'port'], ['-a', 'password', '인증']].forEach(([f, v, n], i) => { const y = 80 + i * 70, a = fade(u, 0.3 + i * 0.45);
        pill(560, y, f, ACC, pop(u, 0.3 + i * 0.45), { mono: true, fs: 16 });
        mono(610, y + 6, v, { 'font-size': 16, 'font-weight': 700, opacity: a }); tx(760, y + 6, n, { 'font-size': 15, fill: MUT, opacity: a }); });
      lock(870, 220, true, WARN, pop(u, 1.4));
      el('rect', { x: 520, y: 290, width: 420, height: 80, rx: 10, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5, opacity: fade(u, 1.9) });
      tx(536, 322, '-a 로 넘긴 비밀번호는 셸 기록에 남는다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) });
      tx(536, 350, '운영은 환경변수나 파일로 넘긴다', { 'font-size': 14.5, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { redisBox(860, 110, { w: 140, h: 54 });
      el('line', { x1: 560, y1: 110, x2: 790, y2: 110, stroke: GRID, 'stroke-width': 2 });
      fly(560, 96, 780, 96, seg(u, 0.2, 0.6), 'PING', { mono: true });
      fly(780, 126, 560, 126, seg(u, 0.6, 1.0), 'PONG', { mono: true, fill: GOOD });
      if (u > 1.0) pill(560, 110, 'PONG', GOOD, pop(u, 1.0), { mono: true, fs: 15 });
      const y0 = 190; el('rect', { x: 530, y: y0, width: 400, height: 170, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.2) });
      mono(548, y0 + 28, 'INFO server', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.2) });
      [['redis_version', '7.2.4', ACC], ['os', 'Linux 5.15.0 x86_64'], ['arch_bits', '64']].forEach(([kk, v, col], i) => { const a = fade(u, 1.5 + i * 0.25);
        mono(548, y0 + 66 + i * 34, kk, { 'font-size': 14.5, fill: MUT, opacity: a }); mono(700, y0 + 66 + i * 34, v, { 'font-size': 14.5, 'font-weight': 700, fill: col || INK, opacity: a }); }); return; }
    if (k === 3) { el('rect', { x: 520, y: 30, width: 420, height: 110, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      tx(534, 54, 'Redis 메모리', H);
      mid(730, 104, '키 0개', { 'font-size': 18, fill: MUT, opacity: fade(u, at(1)) });
      pill(880, 104, 'DBSIZE', INK, pop(u, at(0)), { mono: true, fs: 13.5 });
      tx(530, 180, 'CLIENT LIST', Object.assign({ opacity: fade(u, at(2)) }, H));
      card(600, 236, 150, 60, { rx: 10, text: 'redis-cli\nid=3', fs: 14, mono: true, s: pop(u, at(3)) });
      grow(676, 236, 790, 236, E(u, at(3), at(3) + 0.4), ACC); redisBox(860, 236, { w: 130, h: 50 });
      mono(600, 290, '127.0.0.1:52344', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, at(3) + 0.2) });
      const fa = fade(u, 2.2); el('rect', { x: 520, y: 330, width: 420, height: 50, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 1.8, opacity: fa });
      mono(540, 361, 'FLUSHDB', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fa }); tx(640, 361, '개발에서만 · 운영 금지', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fa }); return; }
    if (k === 4) { redisBox(860, 200, { w: 140, h: 60 });
      [0, 2, 4].forEach((li, i) => { const y = 90 + i * 110, a0 = at(li), ok = u > a0 + 0.3;
        pill(600, y, 'redis-cli', INK, pop(u, a0) * (u > a0 + 0.9 ? lerp(1, 0.55, E(u, a0 + 0.9, a0 + 1.2)) : 1), { mono: true, fs: 14 });
        dot([[660, y], [790, 200]], seg(u, a0 + 0.1, a0 + 0.4), ACC, 6);
        if (ok) mono(600, y + 32, i === 0 ? 'PING → PONG' : i === 1 ? 'SET → OK' : 'GET → "bar"', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); });
      if (u > at(2) + 0.3) pill(860, 290, 'foo = "bar"', ACC, pop(u, at(2) + 0.3), { mono: true, fs: 14 });
      mid(730, 400, '실행 → 결과 → 종료 (스크립트·CI 용)', { fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k 5 JSON
    el('rect', { x: 520, y: 50, width: 190, height: 130, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    ['# Server', 'redis_version:', '7.2.4', 'os:Linux …'].forEach((s, i) => mono(534, 80 + i * 26, s, { 'font-size': 14, fill: MUT }));
    grow(712, 115, 770, 115, E(u, 0.6, 1.0), ACC);
    el('rect', { x: 772, y: 50, width: 168, height: 130, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.9) });
    ['{', ' "redis_version":', '   "7.2.4",', ' "os": … }'].forEach((s, i) => mono(784, 80 + i * 26, s, { 'font-size': 14, fill: ACC, opacity: fade(u, 1.0 + i * 0.12) }));
    [['jq', 640], ['python', 820]].forEach(([s, x], i) => { grow(856, 184, x, 250, E(u, 1.6 + i * 0.2, 2.0 + i * 0.2), ACC); pill(x, 270, s, ACC, pop(u, 1.9 + i * 0.2), { mono: true, fs: 15 }); });
    mid(730, 340, '사람이 읽는 출력 ↔ 기계가 읽는 출력', { fill: MUT, opacity: fade(u, 2.3) }); }

  // ---------- 3. SET / GET : Redis 메모리 표가 beat 마다 자란다 ----------
  const MX = 506, MY = 24, MW = 438, RH = 38, RY = (i) => MY + 34 + i * RH + RH / 2;
  function memBox(n) { el('rect', { x: MX, y: MY, width: MW, height: RH * n + 40, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); tx(MX + 14, MY + 24, 'Redis 메모리', H); }
  function row(i, kk, v, o) { o = o || {}; const y = RY(i), op = o.op ?? 1; if (op <= 0.01) return;
    if (o.hot) el('rect', { x: MX + 6, y: y - RH / 2 + 2, width: MW - 12, height: RH - 4, rx: 6, fill: o.hotFill || ACCBG, opacity: op });
    mono(MX + 14, y + 5, kk, { 'font-size': 14.5, 'font-weight': 700, fill: o.gone ? OFF : o.kc || INK, opacity: op });
    mono(MX + 140, y + 5, v, { 'font-size': 14.5, fill: o.gone ? OFF : o.vc || INK, opacity: op });
    if (o.ttl != null) { clock(MX + MW - 78, y, 9, o.ttlFrac ?? 1, WARN); mono(MX + MW - 12, y + 5, o.ttl, { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: op }); }
    if (o.gone) el('line', { x1: MX + 10, y1: y, x2: MX + 10 + (MW - 20) * o.gone, y2: y, stroke: BAD, 'stroke-width': 2.5 }); }
  function s3(t, c) { const { k, u } = c, at = term(c);
    memBox(6);
    const helloV = k >= 2 ? '"Hi again"' : '"Hello Redis"';
    // 0 hello
    if (k === 0) row(0, 'hello', helloV, { op: fade(u, at(1), 0.15), hot: u > at(3) });
    else if (k === 2) { const ch = u > at(1); row(0, 'hello', ch ? '"Hi again"' : '"Hello Redis"', { hot: ch, hotFill: WARNBG });
      if (ch) fly(MX + 220, RY(0), MX + 260, RY(0) + 160, seg(u, at(1), at(1) + 0.7), '"Hello Redis"', { mono: true, fill: OFF, color: INK }); }
    else row(0, 'hello', helloV);
    if (k === 0) fly(MX + 220, RY(0), TX + 300, TY + 44 + 3 * 22 - 5, seg(u, at(3) + 0.05, at(3) + 0.5), '"Hello Redis"', { mono: true, fill: INK });
    // 1 session:abc
    if (k >= 1) row(1, 'session:abc', '"data"', { op: k === 1 ? fade(u, at(1), 0.15) : 1, ttl: k === 1 && u < at(3) ? 'TTL 60' : 'TTL 57', ttlFrac: k === 1 ? 1 - E(u, at(1), 2.6) * 0.05 : 0.95, hot: k === 1 && u > at(3) });
    // 2 lock:job1
    if (k >= 3) row(2, 'lock:job1', '"me"', { op: k === 3 ? fade(u, at(1), 0.15) : 1, ttl: 'TTL 30' });
    if (k === 3) { fly(TX + TW - 30, TY + 44 + 2 * 22, MX + 300, RY(2) + 50, seg(u, at(2), at(2) + 0.45), '"other"', { mono: true, fill: BAD });
      if (u > at(3)) { pill(MX + 300, RY(2) + 50, '(nil) — 이미 있다', BAD, pop(u, at(3)), { mono: true, fs: 14 }); }
      tx(MX + 10, 360, 'NX = 없을 때만 저장 → 분산 락의 출발점', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); }
    // 3,4 user:1:*
    if (k >= 4) { row(3, 'user:1:name', '"Alice"', { op: k === 4 ? fade(u, at(1), 0.15) : 1, kc: ACC }); row(4, 'user:1:email', '"alice@example.com"', { op: k === 4 ? fade(u, at(3), 0.15) : 1, kc: ACC }); }
    if (k === 4) pill(MX + MW / 2, 330, 'DBSIZE → 5', INK, pop(u, at(5)), { mono: true, fs: 15 });
    // 5 counter
    if (k >= 5) { const vals = ['0', '1', '2', '12'], idx = k === 5 ? [1, 3, 5, 7].filter((li) => u > at(li)).length - 1 : 3;
      row(5, 'counter', idx >= 0 ? vals[idx] : '', { op: k === 5 ? fade(u, at(1), 0.15) : 1, hot: k === 5 && u > at(3), vc: ACC });
      if (k === 5) { mono(MX + MW / 2, 360, idx >= 0 ? vals[idx] : '0', { 'font-size': 34, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, at(1)) });
        tx(MX + MW / 2, 400, '읽고 · 더하고 · 쓰기를 서버에서 한 번에', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.3) }); } }
    if (k === 1) tx(MX + 10, 340, 'EX 60 → 60초 뒤 스스로 사라진다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, at(3) + 0.2) });
    if (k === 2) tx(MX + 10, 340, 'UPDATE 는 없다 — 같은 키에 SET', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); }

  // ---------- 4. 키 관리 ----------
  function s4(t, c) { const { k, u } = c, at = term(c);
    const base = [['hello', '"Hi again"'], ['session:abc', '"data"'], ['user:1:name', '"Alice"'], ['user:1:email', '"alice@example.com"'], ['counter', '12']];
    if (k === 5) { const w = E(u, at(1), at(1) + 0.6); memBox(5);
      base.slice(1).forEach(([kk, v], i) => row(i, kk, v, { op: 1 - w }));
      mid(MX + MW / 2, 140, 'DBSIZE → 0', { 'font-size': 18, fill: BAD, opacity: fade(u, at(3)) });
      tx(MX, 288, 'FLUSHDB = 지금 DB · FLUSHALL = 전부', Object.assign({ opacity: fade(u, 1.6) }, H));
      for (let i = 0; i < 16; i++) { const x = MX + (i % 8) * 54, y = 302 + Math.floor(i / 8) * 46, cur = i === 0;
        el('rect', { x, y, width: 46, height: 38, rx: 5, fill: cur && w > 0.5 ? BADBG : PANEL, stroke: cur ? BAD : GRID, 'stroke-width': cur ? 2.5 : 1.3, opacity: fade(u, 1.6 + i * 0.02) });
        mono(x + 23, y + 25, String(i), { 'font-size': 14, 'text-anchor': 'middle', fill: cur ? BAD : MUT, opacity: fade(u, 1.6 + i * 0.02) }); }
      pill(MX + MW / 2, 214, '되돌릴 수 없다', BAD, pop(u, 2.2), { fs: 15 }); return; }
    if (k === 0) { memBox(5); const g = E(u, at(3), at(3) + 0.4);
      row(0, 'hello', '"Hi again"', { hot: u > at(0) && u < at(3), gone: g, op: lerp(1, 0.45, g) });
      base.slice(1).forEach(([kk, v], i) => row(i + 1, kk, v));
      [['EXISTS hello', '1', at(1)], ['DEL hello', '1', at(3)], ['EXISTS hello', '0', at(5)]].forEach(([s, v, a], i) => { const y = 300 + i * 34;
        mono(MX + 10, y, s, { 'font-size': 15, opacity: fade(u, a) }); mono(MX + 190, y, '→ ' + v, { 'font-size': 15, 'font-weight': 800, fill: v === '0' ? MUT : ACC, opacity: fade(u, a) }); });
      return; }
    const rows = base.slice(1); memBox(4);
    if (k === 1) { rows.forEach(([kk, v], i) => row(i, kk, v, i === 1 && u > at(1) && u < at(5) ? { ttl: 'TTL 60', hot: true } : i === 1 && u > at(5) ? { hot: true, hotFill: GOODBG } : {}));
      if (u > at(5)) pill(MX + MW - 60, RY(1), '영구', GOOD, pop(u, at(5)), { fs: 14 });
      [['TTL = -2', '키가 없다'], ['TTL = -1', '만료 없이 영구']].forEach(([a, b], i) => { const y = 260 + i * 40;
        mono(MX + 10, y, a, { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8 + i * 0.25) }); tx(MX + 120, y, b, { 'font-size': 15, opacity: fade(u, 1.8 + i * 0.25) }); });
      return; }
    if (k === 2) { const sweep = E(u, at(0) + 0.2, 2.2);
      rows.forEach(([kk, v], i) => row(i, kk, v, { hot: sweep * 4 > i, hotFill: kk.startsWith('user:') ? ACCBG : BADBG }));
      el('rect', { x: MX + 4, y: MY + 34 + sweep * 4 * RH - 2, width: MW - 8, height: 4, fill: BAD, opacity: sweep > 0 && sweep < 1 ? 1 : 0 });
      tx(MX + 10, 250, '전체를 한 번에 훑는 동안', Object.assign({ opacity: fade(u, 0.6) }, H));
      ['GET', 'SET', 'GET', 'INCR'].forEach((s, i) => pill(MX + 40 + i * 92, 290, s, BAD, pop(u, 0.8 + i * 0.15), { mono: true, fs: 14, fill: PANEL }));
      mid(MX + MW / 2, 340, '다른 요청은 전부 줄 서서 기다린다', { fill: BAD, opacity: fade(u, 1.6) });
      mono(MX + MW / 2, 376, '키 100만 개면 수 초', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 3) { const steps = [[0, 1], [1, 3], [3, 4]], ph = Math.min(2, Math.floor(E(u, 0.3, 2.4) * 3)), cur = steps[ph];
      rows.forEach(([kk, v], i) => row(i, kk, v, { hot: i >= cur[0] && i < cur[1], hotFill: kk.startsWith('user:') ? ACCBG : GOODBG }));
      el('path', { d: `M${MX - 2},${RY(cur[0]) - 12} l-12,-8 v16 z`, fill: ACC });
      mono(MX + 10, 236, '커서', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      for (let i = 0; i < 3; i++) { const x = MX + 70 + i * 130; el('rect', { x, y: 220, width: 60, height: 26, rx: 5, fill: i <= ph ? ACC : SOFT, opacity: 0.85 });
        if (i < 2) pill(x + 95, 233, 'GET', GOOD, i < ph ? 1 : 0, { mono: true, fs: 13.5 }); }
      tx(MX + 10, 296, '조금씩 돌려주고, 사이사이 다른 요청을 처리', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
      mono(MX + 10, 334, '커서 0 이 돌아오면 끝', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(MX + 10, 370, '중복은 있을 수 있어도 누락은 없다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) }); return; }
    // k 4 TYPE / DBSIZE / RENAME
    rows.forEach(([kk, v], i) => row(i, kk, v, { hot: i === 1 && u > at(0) && u < at(2) }));
    if (u > at(1)) pill(MX + MW - 60, RY(1), 'string', INFO, pop(u, at(1)), { mono: true, fs: 14 });
    pill(MX + 90, 250, 'DBSIZE → 4', INK, pop(u, at(3)), { mono: true, fs: 15 });
    const r = E(u, 1.8, 2.3); card(MX + 300, 250, 150, 36, { rx: 6, text: r > 0.5 ? 'new_key' : 'old_key', fs: 15, mono: true, stroke: r > 0.5 ? ACC : INK, s: pop(u, 1.4) });
    mono(MX + 300, 292, 'RENAME', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
    tx(MX + 10, 350, '같은 키에 List 명령 → WRONGTYPE', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.3) }); }

  // ---------- 5. python ----------
  function s5(t, c) { const { k, u } = c, at = term(c);
    if (k === 0) { R.snippet(520, 40, ['r = redis.Redis(', '  host="localhost", port=6379,', '  db=0,', '  decode_responses=True)'], { fs: 14.5, w: 420, op: fade(u, at(2)) });
      const y = 270, f = E(u, 1.6, 2.2);
      pill(600, y, 'b"world"', OFF, pop(u, 1.2), { mono: true, fs: 15, color: MUT });
      grow(660, y, 760, y, f, ACC);
      pill(840, y, '"world"', ACC, pop(u, 2.0), { mono: true, fs: 15 });
      mid(730, 330, 'bytes → str 자동 변환', { fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { card(580, 150, 130, 60, { rx: 10, text: 'python\nr', fs: 14.5, mono: true });
      redisBox(860, 150, { w: 130, h: 56 }); el('line', { x1: 646, y1: 150, x2: 794, y2: 150, stroke: GRID, 'stroke-width': 2 });
      fly(650, 136, 790, 136, seg(u, 0.4, 0.9), 'PING', { mono: true }); fly(790, 166, 650, 166, seg(u, 0.9, 1.4), 'PONG', { mono: true, fill: GOOD });
      if (u > 0.4) mono(720, 214, 'TCP 연결', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      pill(580, 240, 'True', GOOD, pop(u, at(1)), { mono: true, fs: 16 });
      mid(730, 330, '첫 명령을 보낼 때 연결이 맺어진다', { fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { tx(520, 44, 'redis-py   ↔   CLI', H);
      [['r.set', 'SET'], ['r.get', 'GET'], ['r.setex', 'SETEX'], ['r.ttl', 'TTL']].forEach(([a, b], i) => { const y = 80 + i * 40, o = fade(u, 0.3 + i * 0.25);
        mono(520, y, a, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: o }); mono(620, y, '↔', { 'font-size': 15, fill: MUT, opacity: o }); mono(660, y, b, { 'font-size': 15, 'font-weight': 700, opacity: o }); });
      el('rect', { x: 510, y: 250, width: 430, height: 120, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); tx(524, 274, 'Redis 메모리', H);
      mono(524, 310, 'py:hello', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, at(1)) }); mono(680, 310, '"world"', { 'font-size': 14.5, opacity: fade(u, at(1)) });
      mono(524, 346, 'session:abc', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); mono(680, 346, '"user-data"', { 'font-size': 14.5, opacity: fade(u, 1.8) });
      mono(926, 346, 'TTL 60', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.8) }); return; }
    if (k === 3) { const vals = ['1', '2', '12'], idx = [1, 3, 5].filter((li) => u > at(li)).length - 1;
      mono(720, 130, 'counter', { 'font-size': 18, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
      mono(720, 200, idx >= 0 ? vals[idx] : '·', { 'font-size': 52, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      ['+1', '+1', '+10'].forEach((s, i) => pill(600 + i * 120, 260, s, ACC, pop(u, at(i * 2 + 1)), { mono: true, fs: 15 }));
      cross(560, 340, 9, pop(u, 2.0)); tx(580, 346, 'get → +1 → set 는 경쟁이 생긴다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) });
      check(560, 380, 9, pop(u, 2.3)); tx(580, 386, 'incr 는 서버에서 한 번에', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.3) }); return; }
    if (k === 4) { tx(520, 44, 'ConnectionPool(max_connections=50)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      el('rect', { x: 600, y: 70, width: 200, height: 250, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.2) });
      for (let i = 0; i < 10; i++) { const y = 86 + i * 23, busy = Math.floor(t * 2 + i * 1.7) % 3 === 0 && u > 0.8;
        el('rect', { x: 616, y, width: 168, height: 15, rx: 4, fill: busy ? ACC : PANEL, stroke: ACC, 'stroke-width': 1.2, opacity: fade(u, 0.3 + i * 0.04) }); }
      redisBox(880, 195, { w: 110, h: 50 }); el('line', { x1: 800, y1: 195, x2: 825, y2: 195, stroke: ACC, 'stroke-width': 3 });
      for (let i = 0; i < 4; i++) dot([[520, 110 + i * 60], [600, 110 + i * 60]], ((t * 0.8 + i * 0.27) % 1) * (u > 0.8 ? 1 : 0), INK, 5);
      mono(530, 352, '요청', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      tx(520, 390, '연결을 빌려 쓰고 돌려준다 · TCP 를 매번 새로 맺지 않는다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k 5 async
    tx(520, 44, 'redis.asyncio — await 하는 동안 다른 일을 한다', Object.assign({ opacity: fade(u, 0.2) }, H));
    ['요청 A', '요청 B', '요청 C'].forEach((s, i) => { const y = 100 + i * 70, x0 = 610 + i * 50;
      tx(520, y + 6, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.2) });
      el('rect', { x: x0, y: y - 12, width: 40 * E(u, 0.4 + i * 0.3, 0.7 + i * 0.3), height: 24, rx: 4, fill: INK, opacity: 0.8 });
      el('rect', { x: x0 + 42, y: y - 12, width: 150 * E(u, 0.7 + i * 0.3, 1.5 + i * 0.3), height: 24, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      if (u > 1.2 + i * 0.3) mono(x0 + 117, y + 5, 'await r.set', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2 + i * 0.3) }); });
    mid(730, 330, 'FastAPI 같은 async 서버와 궁합이 좋다', { fill: MUT, opacity: fade(u, 2.2) }); }

  R.page({ title: '터미널과 Redis 안쪽', scenes: [s1, s2, s3, s4, s5] });
})();
