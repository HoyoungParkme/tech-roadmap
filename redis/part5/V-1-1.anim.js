/* V-1-1 캐시 함정 4가지 — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, person, crowd, cross, check, lock, clock, meters, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // 앞 beat 값에서 이어지는 숫자 (s 초부터 d 초 동안)
  const TW = (a, b, u, s = 0.1, d = 1.2) => (a == null ? b : lerp(a, b, E(u, s, s + d)));
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  // 계속 흐르는 점 n 개 (t 기준이라 같은 t 면 같은 그림)
  function stream(route, t, n, col, speed, r) { for (let i = 0; i < n; i++) dot(route, (t * (speed || 0.7) + i / n) % 1, col || ACC, r || 5); }
  // Redis 키 한 줄: 키 이름 + 값 (+ 지워짐 표시)
  function keyRow(x, y, k, v, o) { o = o || {}; const op = o.op ?? 1, col = o.gone ? OFF : o.col || INK;
    if (o.hot) el('rect', { x: x - 10, y: y - 21, width: o.w || 330, height: 32, rx: 6, fill: ACCBG, opacity: op });
    mono(x, y, k, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op, 'text-decoration': o.gone ? 'line-through' : null });
    if (v != null) mono(x + (o.vx ?? tw(k, 15) + 16), y, v, { 'font-size': 14.5, fill: o.gone ? OFF : o.vcol || INK, opacity: op, 'text-decoration': o.gone ? 'line-through' : null }); }
  const line = (x1, y1, x2, y2, o) => el('line', Object.assign({ x1, y1, x2, y2, stroke: GRID, 'stroke-width': 2.5 }, o || {}));

  // =========================================================
  // 1. Stampede — 키 하나가 만료되는 순간
  // =========================================================
  const S = { cy: 220, cx: 80, rx: 380, gx: 660, dx: 862 };
  const toHit = [[118, S.cy], [S.rx, S.cy], [118, S.cy]];
  const toDB = [[118, S.cy], [560, S.cy], [S.dx - 48, S.cy]];
  function s1(t, c) { const { k, u } = c, b = c.beat.viz.after, p = c.prev ? c.prev.viz.after : null;
    const dbHot = b.dbLoad >= 50;
    zone(180, 30, 380, 262, 'Redis', { stroke: ACC, sw: 2, fill: SOFT });
    line(118, S.cy, 180, S.cy);
    line(560, S.cy, S.dx - 48, S.cy, { 'stroke-dasharray': k === 1 || k === 4 || k === 5 || k === 7 ? null : '5 6' });
    dbIcon(S.dx, S.cy - 10, 'DB', { stroke: dbHot || (k === 1 && u > 0.9) ? BAD : INK });
    crowd(S.cx, S.cy, 24, '1000명');
    mono(200, 208, 'GET post:42', { 'font-size': 13.5, fill: MUT });

    // post:42 키 줄과 TTL 시계
    let gone = false, frac = 0.6, show = 1;
    if (k === 0) frac = 0.6 - 0.25 * E(u, 0.2, 2.6);
    if (k === 1) { frac = 0.12 * (1 - E(u, 0.2, 0.8)); gone = u > 0.8; }
    if (k === 2) frac = 0.8;
    if (k === 3) { gone = true; frac = 0; }
    if (k === 4) { gone = u < 1.9; frac = u < 1.9 ? 0 : 1; }
    if (k === 5) frac = 1;
    if (k === 6) frac = 0.2 - 0.12 * E(u, 0.2, 1.4);
    if (k === 7) frac = u < 2.0 ? 0.08 : lerp(0.08, 1, E(u, 2.0, 2.5));
    keyRow(200, 86, 'post:42', '{…}', { gone, show, hot: (k === 0 || k === 2) && Math.floor(t * 2) % 2 === 0 });
    clock(510, 80, 18, frac, gone ? OFF : WARN);
    sub(510, 120, gone ? '만료' : 'TTL', 1, { fill: gone ? BAD : MUT, 'font-weight': 700 });

    if (k >= 2) { lock(S.gx, S.cy - 4, true, k === 2 ? OFF : INK, k === 2 ? pop(u, 0.4) : 1); sub(S.gx, S.cy + 34, '락', 1, { 'font-weight': 700, fill: INK }); }

    if (k === 0) { stream(toHit, t, 6, GOOD, 0.6); pill(S.rx, 262, 'hit → 즉시 반환', GOOD, pop(u, 0.4)); sub(S.dx, S.cy + 88, 'DB 조용', fade(u, 0.8)); }
    if (k === 1) { pill(S.rx, 262, 'miss', BAD, pop(u, 0.8), { mono: true });
      if (u > 0.8) stream(toDB, t, 16, BAD, 0.9);
      pill(740, 140, 'db.query × 1000', BAD, pop(u, 1.2), { mono: true }); }
    if (k === 2) { stream(toHit, t, 6, GOOD, 0.6); pill(760, 70, 'safe_get_mutex(key)', ACC, pop(u, 0.2), { mono: true });
      tx(S.gx, S.cy - 46, 'miss 경로에만', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9) });
      pill(S.rx, 262, 'hit 는 락 없이 반환', GOOD, pop(u, 1.2)); }
    if (k === 3) { // 경주: 한 명만 락을 잡는다
      [0, 1, 2, 3, 4].forEach((i) => { const a = 0.2 + i * 0.12, arrive = a + 0.8, rt = [[118, S.cy], [S.gx - 22, S.cy]];
        if (i === 0) { dot(rt, seg(u, a, arrive), ACC, 7); if (u >= arrive) el('circle', { cx: S.gx + 26, cy: S.cy, r: 7, fill: ACC }); }
        else { dot(rt, seg(u, a, arrive), WARN, 6); dot([[S.gx - 22, S.cy + 10], [118, S.cy + 10]], seg(u, arrive + 0.1, arrive + 1.1), WARN, 6); } });
      keyRow(200, 152, 'lock:rebuild:post:42', '"1"', { op: fade(u, 1.0), col: ACC });
      clock(510, 146, 18, 1, WARN); sub(510, 186, 'EX 30', fade(u, 1.0), { fill: INK, 'font-weight': 700 });
      sub(S.rx, 262, '나머지: sleep 0.1 → 재시도', fade(u, 1.6), { fill: WARN, 'font-weight': 700, 'font-size': 14 });
      terminal(600, 18, 350, 134, ['> SET lock:rebuild:post:42 1 NX EX 30', ['OK', 'var(--good)'], '> SET lock:rebuild:post:42 1 NX EX 30', ['(nil)', 'var(--warn)']], lerp(0, 4, E(u, 0.5, 2.2)), { fs: 13.5 }); }
    if (k === 4) { const rt = [[S.gx + 26, S.cy], [S.dx - 48, S.cy]];
      dot(rt, seg(u, 0.2, 0.9), ACC, 7);
      fly(S.dx - 40, 30, 400, 30, seg(u, 1.0, 1.9), 'SETEX post:42 60', { mono: true });
      const unlocked = u > 2.1;
      keyRow(200, 152, 'lock:rebuild:post:42', '"1"', { gone: unlocked, col: ACC });
      if (unlocked) sub(470, 186, 'finally → DEL', fade(u, 2.1), { fill: MUT, 'font-weight': 700 });
      if (u > 2.0) stream(toHit, t, 6, GOOD, 0.6);
      pill(750, 60, 'DB 조회 1000회 → 1회', GOOD, pop(u, 0.6)); }
    if (k === 5) { // 남의 락을 지우는 사고
      const ttl = 1 - E(u, 0.2, 1.0), expired = u > 1.0, bTake = u > 1.25, killed = u > 2.0;
      dot([[S.gx + 26, S.cy], [S.dx - 48, S.cy]], seg(u, 0.1, 0.4), ACC, 7);
      if (u > 0.4 && u < 1.9) { el('circle', { cx: S.dx - 48, cy: S.cy, r: 7, fill: ACC }); }
      sub(S.dx - 20, 150, 'A: DB 조회 30초 넘김', fade(u, 0.4), { fill: WARN, 'font-weight': 700 });
      if (!bTake) { keyRow(200, 152, 'lock:…:post:42', '"1"', { gone: expired, col: ACC }); pill(470, 152 - 5, 'A', ACC, 1, { fs: 13.5 }); clock(530, 146, 16, ttl, WARN); }
      else { keyRow(200, 152, 'lock:…:post:42', '"1"', { gone: killed, col: killed ? BAD : INFO }); pill(470, 152 - 5, 'B', INFO, pop(u, 1.25), { fs: 13.5 });
        if (!killed) clock(530, 146, 16, 1, WARN); }
      fly(S.dx - 48, S.cy - 30, 330, 152, seg(u, 1.6, 2.0), 'A 의 DEL', { fill: BAD, mono: false });
      if (killed) { cross(470, 147, 13, pop(u, 2.0)); sub(380, 186, 'B 의 락이 지워졌다', 1, { fill: BAD, 'font-weight': 700 }); }
      pill(760, 40, '값이 둘 다 "1" — 주인 구분 불가', BAD, pop(u, 1.4), { fs: 13.5 });
      pill(760, 84, 'GET == 내 토큰 일 때만 DEL', GOOD, pop(u, 2.2), { fs: 13.5 }); }
    if (k === 6) { // TTL 막대와 10% 구간
      const x0 = 600, w = 320, y = 60, rem = lerp(20, 4, E(u, 0.2, 1.4)) / 60;
      el('rect', { x: x0, y, width: w, height: 18, rx: 4, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      el('rect', { x: x0, y, width: w * 0.1, height: 18, rx: 4, fill: C.WARNBG, stroke: WARN, 'stroke-width': 1.5 });
      el('rect', { x: x0, y: y + 3, width: w * rem, height: 12, rx: 3, fill: rem < 0.1 ? WARN : ACC });
      mono(x0, y - 10, '남은 TTL', { 'font-size': 13.5, fill: MUT }); mono(x0 + w * 0.1 + 4, y + 40, '← ttl < 6 (10%)', { 'font-size': 13.5, fill: WARN, 'font-weight': 700 });
      const inZone = u > 1.2;
      for (let i = 0; i < 20; i++) { const lucky = i === 7 && inZone; dot(toHit, (t * 0.5 + i / 20) % 1, lucky ? ACC : GOOD, lucky ? 7 : 4.5); }
      if (inZone) { grow(560, 272, S.dx - 48, 272, E(u, 1.4, 2.2), ACC, { dash: '6 5' }); pill(740, 134, '20번 중 1번꼴 (5%) 재빌드', ACC, pop(u, 1.4), { fs: 13.5 }); } }
    if (k === 7) { stream(toHit, t, 8, GOOD, 0.6);
      line(560, 272, S.dx - 48, 272, { stroke: ACC, 'stroke-dasharray': '6 5', 'stroke-width': 2 });
      dot([[560, 272], [S.dx - 48, 272], [560, 272]], seg(u, 0.3, 2.0), ACC, 7);
      tx(700, 298, 'rebuild_async (스레드)', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
      pill(S.rx, 262, '낡은 값 즉시 반환', GOOD, pop(u, 0.5)); }

    const rps = TW(p && p.rps, b.rps, u), cpu = TW(p && p.dbLoad, b.dbLoad, u, k === 1 ? 0.9 : 0.1), lat = TW(p && p.latency, b.latency, u, k === 1 ? 0.9 : 0.1);
    meters(150, 322, 660, [
      { name: '초당 요청', val: fmt(rps) },
      { name: 'DB CPU', val: Math.round(cpu) + '%', bar: cpu, hot: cpu >= 50 },
      { name: 'p95 응답', val: fmt(lat) + 'ms', hot: lat >= 500, good: b.latency <= 2 },
    ]); }

  // =========================================================
  // 2. Penetration — 없는 키가 캐시를 뚫는다
  // =========================================================
  const P = { y: 140, rx: 440, dx: 862 };
  const BITS = 16, bitW = 34, set1 = [2, 7, 12], setOther = [4, 9, 13];
  function flowLog(c, u, y0) { const f = c.beat.viz.flow;
    tx(40, y0, '요청 기록', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    f.forEach((r, i) => { const y = y0 + 32 + i * 42, op = fade(u, 0.4 + i * 0.45);
      const bad = /miss|ERR/.test(r.cache), good = /hit|없음|확인|확실/.test(r.cache);
      mono(40, y + 5, r.req, { 'font-size': 14, opacity: op, 'font-weight': 600 });
      pill(430, y, r.cache, bad ? BAD : good ? GOOD : INK, op, { fs: 13.5, mono: /^[A-Za-z_]/.test(r.cache) });
      const dbGo = r.db === '안 감';
      pill(650, y, 'DB: ' + r.db, dbGo ? GOOD : WARN, op, { fs: 13.5 });
      tx(800, y + 5, r.stored ? '캐시 남김' : '안 남김', { 'font-size': 14, 'font-weight': 700, fill: r.stored ? GOOD : BAD, opacity: op }); });
    if (c.beat.viz.attack) tx(940, y0, c.beat.viz.attack, { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
  function pipe(o) { o = o || {};
    zone(280, 40, 320, 150, 'Redis', { stroke: ACC, sw: 2, fill: SOFT, op: o.rop });
    line(100, P.y, 280, P.y); line(600, P.y, P.dx - 48, P.y, { 'stroke-dasharray': o.dbIdle ? '5 6' : null });
    dbIcon(P.dx, P.y - 10, o.dbLabel || 'DB', { stroke: o.dbHot ? BAD : INK, op: o.dop }); }
  function bitArray(x, y, on, o) { o = o || {};
    for (let i = 0; i < BITS; i++) { const v = on.has(i) ? 1 : 0, hl = o.hl && o.hl.includes(i);
      card(x + i * bitW + bitW / 2, y, bitW - 4, 34, { rx: 5, text: String(v), fs: 15, mono: true, stroke: hl ? (v ? GOOD : BAD) : GRID, sw: hl ? 2.5 : 1.5, fill: v ? ACCBG : PANEL, color: v ? ACC : MUT }); } }
  const bx = (x, i) => x + i * bitW + bitW / 2;
  function s2(t, c) { const { k, u } = c;
    if (k <= 3) { pipe({ dbHot: k === 1, dbIdle: k === 2 || (k === 3 && u > 1.8) });
      person(60, P.y - 10, k === 1 ? '공격자' : '사용자', { stroke: k === 1 ? BAD : INK });
      const hit = [[100, P.y], [P.rx, P.y], [100, P.y]], through = [[100, P.y], [P.dx - 48, P.y], [100, P.y]];
      if (k === 0) { keyRow(300, 92, 'user:99999', '(없음)', { vcol: MUT });
        dot(through, seg(u, 0.2, 2.0), ACC, 7);
        pill(P.rx, 172, '(nil) → miss', BAD, pop(u, 0.5), { fs: 13.5 });
        pill(P.dx, 62, 'None', INK, pop(u, 1.1), { mono: true });
        const sk = pop(u, 1.6); pill(720, 102, 'setex 건너뜀', OFF, sk, { fs: 13.5 }); if (u > 1.9) cross(806, 102, 10, pop(u, 1.9)); }
      if (k === 1) { keyRow(300, 92, 'user:99999', '(없음)', { vcol: MUT });
        stream(through, t, 12, BAD, 0.8);
        pill(P.dx, 62, 'DB 조회 ' + fmt(lerp(3, 1000, E(u, 0.3, 2.0))) + '회', BAD, pop(u, 0.3), { fs: 13.5 }); }
      if (k === 2) { keyRow(300, 92, 'user:99999', '"__NULL__"', { hot: Math.floor(t * 2) % 2 === 0, col: ACC });
        stream(hit, t, 6, GOOD, 0.6); pill(P.rx, 172, '__NULL__ → None', GOOD, pop(u, 0.5), { mono: true, fs: 13.5 }); }
      if (k === 3) { const stored = u > 1.6;
        dot(through.slice(0, 2), seg(u, 0.2, 1.0), ACC, 7);
        fly(P.dx - 60, 22, 440, 22, seg(u, 1.0, 1.6), 'SETEX user:99999 60 "__NULL__"', { mono: true });
        keyRow(300, 92, 'user:99999', stored ? '"__NULL__"' : '(없음)', { col: stored ? ACC : INK, vcol: stored ? INK : MUT });
        if (stored) { clock(570, 86, 15, 1 - E(u, 1.7, 2.9) * 0.1, WARN); }
        if (u > 1.8) stream(hit, t, 6, GOOD, 0.6);
        pill(P.dx, 62, 'DB 1000회 → 1회', GOOD, pop(u, 2.0), { fs: 13.5 }); }
      flowLog(c, u, 236); return; }
    if (k === 4) { const x0 = 200, on = new Set(set1.filter((_, i) => u > 1.6 + i * 0.2));
      tx(x0, 44, 'BF.RESERVE user:exists 0.001 100000000', { class: 'mono', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      bitArray(x0, 92, on, { hl: u > 1.6 ? set1 : null });
      mono(x0, 66, '비트 배열 — 값은 저장하지 않는다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) });
      pill(480, 176, 'BF.ADD user:exists user:1', ACC, pop(u, 1.0), { mono: true, fs: 13.5 });
      set1.forEach((b, i) => grow(480, 160, bx(x0, b), 112, E(u, 1.2 + i * 0.15, 1.6 + i * 0.15), ACC));
      flowLog(c, u, 236); return; }
    if (k === 5) { terminal(130, 26, 700, 180, ['> BF.RESERVE user:exists 0.001 100000000', ["(error) ERR unknown command 'BF.RESERVE'", 'var(--bad)'], '> MODULE LIST', '1) 1) "name"', '   2) "bf"'], lerp(0, 5, E(u, 0.2, 2.2)), { fs: 14.5, title: 'redis-cli' });
      flowLog(c, u, 236); return; }
    if (k === 6) { const on = new Set(set1.concat(setOther)), gx = 150, ax = 160;
      pipe({ dbIdle: u < 1.6, rop: 1 });
      person(48, P.y - 10, null, {});
      // 게이트: 작은 비트 배열
      zone(118, 40, 140, 150, 'Bloom', { stroke: INFO, sw: 2, fill: PANEL });
      for (let i = 0; i < 8; i++) { const b = i * 2, v = on.has(b) || on.has(b + 1) ? 1 : 0;
        card(136 + (i % 4) * 34, 82 + Math.floor(i / 4) * 38, 28, 30, { rx: 4, text: String(v), fs: 14, mono: true, stroke: GRID, sw: 1.2, fill: v ? ACCBG : PANEL, color: v ? ACC : MUT }); }
      dot([[90, P.y], [gx + 30, P.y]], seg(u, 0.2, 0.7), BAD, 7);
      if (u > 0.7 && u < 1.4) cross(gx + 46, P.y + 2, 10, pop(u, 0.7));
      pill(gx + 40, 214, 'user:99999 → 없음 → None', BAD, pop(u, 0.8), { mono: true, fs: 13.5 });
      dot([[90, P.y], [P.rx, P.y], [P.dx - 48, P.y]], seg(u, 1.4, 2.5), GOOD, 7);
      pill(560, 24, 'user:1 → 있음 → 캐시/DB', GOOD, pop(u, 1.5), { mono: true, fs: 13.5 });
      flowLog(c, u, 250); return; }
    // k === 7 오탐 / 누락
    const x0 = 200, on = new Set(set1.concat(setOther));
    bitArray(x0, 70, on, {});
    mono(x0, 36, 'user:exists', { 'font-size': 15, 'font-weight': 700 });
    const probes = [[[3, 7, 12], '없는 키', 1, BAD, '0 이 하나라도 → 확실히 없음', GOOD], [[4, 7, 13], '안 넣은 키', 2, WARN, '전부 1 → 있을 수도 (오탐)', WARN]];
    probes.forEach(([bits, name, row, col, verdict, vcol], i) => { const y = 132 + i * 50, a = 0.2 + i * 0.7;
      mono(40, y + 5, name, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, a) });
      bits.forEach((b, j) => grow(130, y, bx(x0, b), 90, E(u, a + 0.1 + j * 0.08, a + 0.5 + j * 0.08), col, { sw: 1.6 }));
      tx(x0 + BITS * bitW + 12, y + 5, verdict, { 'font-size': 14, 'font-weight': 700, fill: vcol, opacity: fade(u, a + 0.6) }); });
    flowLog(c, u, 250); }

  // =========================================================
  // 3. Avalanche — 같은 TTL 의 키 무리
  // =========================================================
  const GX = 40, GY = 50, COLS = 20, ROWS = 5, CW = 22, CG = 3;
  const hsh = (i) => ((i * 2654435761) >>> 0) % 1000 / 1000;   // 칸마다 고정된 흔들림
  const TX0 = 80, TX1 = 900, TMAX = 90, BASE = 388, HMAX = 130;
  const tX = (s) => TX0 + (TX1 - TX0) * s / TMAX;
  function grid(ttlOf, now, o) { o = o || {};
    for (let i = 0; i < COLS * ROWS; i++) { const x = GX + (i % COLS) * (CW + CG), y = GY + Math.floor(i / COLS) * (CW + CG);
      const born = o.fill == null || i / (COLS * ROWS) < o.fill, alive = born && now < ttlOf(i);
      el('rect', { x, y, width: CW, height: CW, rx: 3, fill: !born ? PANEL : alive ? ACCBG : C.BADBG, stroke: !born ? GRID : alive ? ACC : BAD, 'stroke-width': 1.3 }); }
    mono(GX, GY + ROWS * (CW + CG) + 16, '한 칸 = 키 100개 · 10,000 키', { 'font-size': 13.5, fill: MUT }); }
  function axis(ticks) {
    el('line', { x1: TX0, y1: BASE, x2: TX1, y2: BASE, stroke: INK, 'stroke-width': 2 });
    ticks.forEach((s) => { el('line', { x1: tX(s), y1: BASE, x2: tX(s), y2: BASE + 6, stroke: INK, 'stroke-width': 2 }); mono(tX(s), BASE + 22, s + 's', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
    tx(TX0, BASE - HMAX - 16, '그 순간 만료되는 키 수', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }); }
  // 만료 분포: [a, b] 구간에 평평하게, 높이는 peak/10000 비율 (최소 3px), now 까지만
  function spread(a, b, peak, now, col, o) { o = o || {}; const x0 = tX(a), x1 = tX(Math.max(a + 1, Math.min(b, now))); if (now < a) return;
    const h = Math.max(3, HMAX * peak / 10000);
    el('rect', { x: x0, y: BASE - h, width: Math.max(6, x1 - x0), height: h, fill: col, opacity: o.op ?? 0.85, rx: 2 });
    if (now >= b && o.label) mono(tX(b) + 10, BASE - 6, o.label, { 'font-size': 15, 'font-weight': 800, fill: col }); }
  function cursor(now) { if (now <= 0) return; el('line', { x1: tX(now), y1: BASE - HMAX - 4, x2: tX(now), y2: BASE, stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); }
  function s3(t, c) { const { k, u } = c, rows = c.beat.viz.rows, last = rows[rows.length - 1];
    if (k === 0) { grid(() => 60, 0, { fill: E(u, 0.2, 1.8) });
      snippet(590, 46, ['for post_id in top_posts():', '    r.setex(…, 60, …)'], { fs: 14, op: fade(u, 0.2) });
      axis([0, 60]); el('rect', { x: tX(60) - 4, y: BASE - HMAX, width: 8, height: HMAX, fill: 'none', stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '5 4', opacity: fade(u, 1.8) });
      tx(tX(60) + 14, BASE - HMAX + 16, '전부 60초 뒤에 만료 예정', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { const now = lerp(0, 60.5, E(u, 0.2, 1.6)); grid(() => 60, now); axis([0, 60]); if (now < 60) cursor(now);
      if (now >= 60) { const h = HMAX * E(u, 1.5, 1.9); el('rect', { x: tX(60) - 4, y: BASE - h, width: 8, height: h, fill: BAD });
        mono(tX(60) + 12, BASE - HMAX + 14, fmt(last.expired) + ' 동시 miss', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) }); }
      dbIcon(800, 110, 'DB', { stroke: now >= 60 ? BAD : INK });
      if (now >= 60) for (let i = 0; i < 8; i++) dot([[560, 70 + i * 8], [756, 110]], (t * 1.2 + i / 8) % 1, BAD, 4.5);
      return; }
    if (k === 2 || k === 3) { const [a, bb] = k === 2 ? [50, 80] : [48, 72], span = bb - a, now = lerp(0, 88, E(u, 0.3, 2.4));
      const ttlOf = (i) => a + hsh(i) * span; grid(ttlOf, now); axis(k === 2 ? [0, 50, 60, 80] : [0, 48, 60, 72]); cursor(now);
      el('rect', { x: tX(60) - 4, y: BASE - HMAX, width: 8, height: HMAX, fill: 'none', stroke: OFF, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' });
      mono(tX(60) - 10, BASE - HMAX + 14, '전: 10,000', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      spread(a, bb, last.expired, now, GOOD, { label: '최대 ' + fmt(last.expired) });
      const code = k === 2 ? ['ttl = base_ttl + random.randint(-10, 20)', '# 50~80초'] : ['def with_jitter(base, ratio=0.2):', '    delta = int(base * ratio)', '# with_jitter(60) → 48~72초'];
      snippet(574, 40, code, { fs: 13.5, op: fade(u, 0.2) }); return; }
    if (k === 4) { // hot + warm 두 벌
      const hotGone = u > 0.9, y1 = 80, y2 = 136;
      zone(40, 34, 520, 140, 'Redis', { stroke: ACC, sw: 2, fill: SOFT });
      keyRow(60, y1 + 5, 'hot:post:42', '{…}', { gone: hotGone }); clock(470, y1, 16, hotGone ? 0 : 0.15 * (1 - E(u, 0.2, 0.9)), WARN); mono(500, y1 + 5, '60s', { 'font-size': 13.5, fill: MUT });
      keyRow(60, y2 + 5, 'warm:post:42', '{…}', { hot: u > 1.3 && u < 2.4 }); clock(470, y2, 16, 0.9, INFO); mono(500, y2 + 5, '600s', { 'font-size': 13.5, fill: MUT });
      person(660, 110, '요청', {});
      dot([[630, 100], [330, y1], [330, y2], [630, 118]], seg(u, 0.4, 2.0), ACC, 7);
      if (hotGone) cross(250, y1, 10, pop(u, 0.9));
      pill(790, 110, 'stale 값으로 응답', GOOD, pop(u, 1.9), { fs: 14 });
      rows.forEach((r, i) => { const x = 170 + i * 310, y = 300, op = fade(u, 0.6 + i * 0.5), bad = r.expired > 0;
        card(x, y, 280, 62, { rx: 10, stroke: bad ? WARN : GOOD, sw: 2, op });
        tx(x, y - 6, r.time, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: op });
        mono(x, y + 18, '동시 miss ' + fmt(r.expired), { 'text-anchor': 'middle', 'font-size': 14, fill: bad ? WARN : GOOD, opacity: op }); });
      return; }
    if (k === 5) { // peak 비교 + 넓이는 같다
      const x0 = 260, max = 620, [a, b] = rows;
      [[a, BAD], [b, GOOD]].forEach(([r, col], i) => { const y = 70 + i * 70, g = E(u, 0.2 + i * 0.4, 1.2 + i * 0.4), w = Math.max(4, max * r.expired / 10000 * g);
        tx(40, y + 6, r.time, { 'font-size': 15, 'font-weight': 700 });
        el('rect', { x: x0, y: y - 12, width: w, height: 26, rx: 4, fill: col, opacity: 0.85 });
        mono(i === 0 ? x0 + w - 10 : x0 + w + 10, y + 6, fmt(r.expired), { 'font-size': 15, 'font-weight': 800, fill: i === 0 ? PANEL : col, 'text-anchor': i === 0 ? 'end' : 'start', opacity: fade(u, 1.0 + i * 0.4) }); });
      // 같은 넓이의 두 모양
      const op = fade(u, 1.6), yb = 360;
      el('line', { x1: 120, y1: yb, x2: 840, y2: yb, stroke: INK, 'stroke-width': 2, opacity: op });
      el('rect', { x: 250, y: yb - 120, width: 12, height: 120 * E(u, 1.6, 2.2), fill: BAD, opacity: 0.85 });
      el('rect', { x: 470, y: yb - 12, width: 300 * E(u, 1.8, 2.4), height: 12, fill: GOOD, opacity: 0.85 });
      tx(272, yb - 100, '몰림', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: op });
      tx(620, yb - 24, '퍼짐', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: op });
      tx(480, 404, '두 모양의 넓이(총 조회 수)는 같다 — 다른 것은 꼭대기', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k === 6 Redis 재시작
    const down = u > 0.6 && u < 1.5, refill = u >= 1.5;
    grid(() => 999, 0, { fill: refill ? E(u, 1.5, 2.6) : u < 0.6 ? 1 : 0 });
    server(700, 90, 'Redis', { lamp: down ? BAD : GOOD, stroke: down ? BAD : INK });
    if (down) pill(700, 24, '재시작 → 메모리 비움', BAD, pop(u, 0.6), { fs: 14 });
    server(860, 90, 'Replica', { op: fade(u, 1.5), lamp: GOOD });
    if (refill) { grow(760, 90, 800, 90, E(u, 1.5, 1.8), ACC); pill(760, 194, '워밍 자동화', GOOD, pop(u, 1.6), { fs: 14 }); }
    rows.forEach((r, i) => { const x = 170 + i * 310, y = 320, op = fade(u, 0.3 + i * 0.6), bad = r.status === 'avalanche';
      card(x, y, 280, 62, { rx: 10, stroke: bad ? BAD : r.expired ? WARN : GRID, sw: 2, op });
      tx(x, y - 6, r.time, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: op });
      mono(x, y + 18, '동시 miss ' + fmt(r.expired), { 'text-anchor': 'middle', 'font-size': 14, fill: bad ? BAD : r.expired ? WARN : MUT, opacity: op }); });
    tx(40, 236, 'jitter 로는 못 막는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) }); }

  // =========================================================
  // 4. Hot Key — 한 노드만 뜨겁다
  // =========================================================
  const NX = 640, NY = [70, 170, 270], NW = 150, NH = 76, AY = [110, 250];
  function nodes(c, u, o) { o = o || {}; const ns = c.beat.viz.nodes, pv = c.prev ? c.prev.viz.nodes : null;
    ns.forEach((n, i) => { const y = NY[i], load = TW(pv && pv[i].load, n.load, u, o.ls ?? 0.3), hot = load >= 60;
      card(NX + NW / 2, y, NW, NH, { rx: 10, stroke: hot ? BAD : INK, sw: hot ? 2.8 : 2 });
      tx(NX + 14, y - 14, n.id, { 'font-size': 15, 'font-weight': 800, fill: hot ? BAD : INK });
      const bx0 = NX + NW + 16, bw = 120;
      el('rect', { x: bx0, y: y - 9, width: bw, height: 18, rx: 4, fill: SOFT });
      el('rect', { x: bx0, y: y - 9, width: bw * clamp(load / 100), height: 18, rx: 4, fill: hot ? BAD : GOOD });
      mono(bx0 + bw + 6, y + 6, Math.round(load) + '%', { 'font-size': 14, 'font-weight': 700, fill: hot ? BAD : INK });
      if (o.keys !== false) (n.hotKeys || []).forEach((kk) => pill(NX + NW / 2, y + 16, kk, BAD, 1, { mono: true, fs: 13.5 })); });
    mono(NX + NW + 16, NY[0] - 30, 'CPU', { 'font-size': 13.5, fill: MUT }); }
  function apps(o) { o = o || {}; AY.forEach((y, i) => { server(90, y, null, { s: 0.7 }); mono(90, y + 44, 'app' + (i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }); }
  function l1(y, entry, o) { o = o || {}; const g = card(330, y, 190, entry ? 64 : 44, { rx: 8, stroke: INFO, sw: 2, s: o.s, fill: PANEL });
    mono(330, y - (entry ? 14 : -5), '_local_cache', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: o.s ?? 1 });
    if (entry) mono(330, y + 14, entry, { 'text-anchor': 'middle', 'font-size': 13.5, opacity: o.eop ?? 1 }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 6) { // 찾고, 앞에서 막는다
      terminal(30, 24, 450, 130, ['$ redis-cli --hotkeys', '# Scanning the entire keyspace…', ["Hot key '\"product:42\"' found so far", 'var(--bad)']], lerp(0, 3, E(u, 0.2, 1.6)), { fs: 14 });
      nodes(c, u, { ls: 0 });
      const ch = [['CDN 5초', 100], ['L1', 230], ['Redis', 360], ['Replica', 490]];
      ch.forEach(([s, x], i) => { const sc = pop(u, 1.2 + i * 0.25); pill(x, 250, s, i === 0 ? ACC : i === 3 ? INFO : INK, sc, { fs: 14.5 }); if (i) grow(ch[i - 1][1] + 40, 250, x - 40, 250, E(u, 1.2 + i * 0.25, 1.5 + i * 0.25), MUT); });
      tx(40, 310, '앞에서 끊을수록 Redis 까지 오는 요청이 준다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) });
      return; }
    apps();
    const thr = k >= 1;
    const route = (y, end) => [[118, y], [end, y < 180 ? NY[0] : NY[0] + 10]];
    if (k <= 3) {
      if (k <= 1) AY.forEach((y, j) => stream([[118, y], [425, y], [NX, NY[0]]], t + j * 0.13, 9, BAD, 0.8));
      if (thr) AY.forEach((y) => l1(y, k >= 2 ? 'product:42 → {…}' : null, { s: k === 1 ? pop(u, 0.3) : 1, eop: k === 3 ? fade(u, 1.4) : 1 }));
      nodes(c, u);
      if (k === 0) { tx(330, 380, 'product:42 → slot 하나 → N1 하나', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
        tx(330, 404, '노드를 늘려도 이 키는 쪼개지지 않는다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) }); }
      if (k === 1) tx(330, 380, '네트워크를 타기 전에 한 겹 더', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8) });
      if (k === 2) { AY.forEach((y, j) => { stream([[118, y], [236, y], [118, y]], t + j * 0.2, 7, GOOD, 0.9); stream([[118, y], [NX, NY[0]]], t + j * 0.3, 2, BAD, 0.5); });
        pill(330, 180, 'L1 hit → Redis 안 감', GOOD, pop(u, 0.4), { fs: 14 }); }
      if (k === 3) { AY.forEach((y) => { dot([[118, y], [NX, NY[0]], [425, y]], seg(u, 0.2, 1.3), ACC, 7); clock(452, y, 13, 1 - E(u, 1.4, 2.8), WARN); });
        pill(330, 180, 'GET → L1 에 1초 저장', ACC, pop(u, 1.3), { fs: 14 }); }
      return; }
    // k 4, 5: 키 분할
    nodes(c, u, { keys: false });
    const shardNode = (i) => i % 3, shardPos = (i) => { const n = shardNode(i), idx = Math.floor(i / 3); return [NX + 30 + idx * 32, NY[n] + 18]; };
    for (let i = 0; i < 10; i++) { const [x, y] = shardPos(i), sc = k === 4 ? pop(u, 0.3 + i * 0.08) : 1;
      card(x, y, 28, 24, { rx: 5, text: String(i), fs: 13.5, mono: true, stroke: ACC, sw: 1.6, s: sc, fill: ACCBG, color: ACC }); }
    mono(NX, 350, 'counter:0 ~ counter:9', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    if (k === 4) { pill(330, 180, 'INCR counter:{0~9 랜덤}', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      AY.forEach((y, j) => { for (let m = 0; m < 5; m++) { const i = (m * 7 + j * 3 + Math.floor(t * 2)) % 10, [x, yy] = shardPos(i); dot([[118, y], [x, yy]], (t * 0.8 + m / 5 + j * 0.1) % 1, ACC, 4.5); } });
      tx(330, 380, '쓰기가 세 노드로 흩어진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) }); }
    if (k === 5) { const tot = [330, 300];
      for (let i = 0; i < 10; i++) { const [x, y] = shardPos(i); dot([[x, y], [tot[0] + 60, tot[1]]], seg(u, 0.2 + i * 0.1, 0.9 + i * 0.1), INFO, 5); }
      mono(tot[0], tot[1] + 34, 'GET counter:' + Math.min(9, Math.floor(clamp((u - 0.2) / 0.1, 0, 9))), { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, opacity: u < 1.9 ? fade(u, 0.2) : 0 });
      pill(tot[0], tot[1], 'total = GET × 10 합산', INFO, pop(u, 1.9), { fs: 14 });
      tx(330, 380, '읽기 비용 10배 — 쓰기가 훨씬 많을 때만 이득', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); } }

  // =========================================================
  // 5. 종합 방어 — get_resilient 한 함수
  // =========================================================
  const ST = [['① L1', '_l1_cache', 105], ['② Redis', 'GET key', 275], ['③ 락', 'SET NX EX 10', 445], ['DB', 'fetch_fn(key)', 615], ['④ SETEX', 'ttl ± 20%', 800]];
  const SY = 120;
  function stations(on, o) { o = o || {};
    el('line', { x1: 20, y1: SY, x2: 870, y2: SY, stroke: GRID, 'stroke-width': 2.5 });
    ST.forEach(([n, s, x], i) => { const lit = on.includes(i), op = o.op ?? 1;
      card(x, SY, 140, 64, { rx: 10, stroke: lit ? ACC : GRID, sw: lit ? 2.6 : 1.6, fill: lit ? ACCBG : PANEL, op });
      tx(x, SY - 6, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: lit ? ACC : MUT, opacity: op });
      mono(x, SY + 16, s, { 'text-anchor': 'middle', 'font-size': 13.5, fill: lit ? INK : MUT, opacity: op }); }); }
  const sx = (i) => ST[i][2];
  function matrix(c, u, y0) { const ds = c.beat.viz.defenses, prev = c.prev ? c.prev.viz.defenses.map((d) => d.trap + d.defense) : [];
    tx(40, y0, '함정', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(240, y0, '방어', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(880, y0, '비용', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle' });
    ds.forEach((d, i) => { const y = y0 + 30 + i * 36, fresh = !prev.includes(d.trap + d.defense), op = fresh ? fade(u, 0.9) : 1;
      if (fresh) el('rect', { x: 30, y: y - 20, width: 900, height: 30, rx: 6, fill: ACCBG, opacity: op });
      tx(40, y, d.trap, { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: op });
      tx(240, y, d.defense, { 'font-size': 15, fill: GOOD, 'font-weight': 600, opacity: op });
      const col = /낮음/.test(d.cost) ? GOOD : d.cost === '중' ? WARN : BAD; pill(880, y - 5, d.cost, col, op, { fs: 13.5 }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 7) { const sh = E(u, 0.2, 1.0);
      card(480, 70, lerp(880, 420, sh), 70, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG });
      tx(480, 66, 'get_resilient(key, fetch_fn, ttl)', { 'text-anchor': 'middle', class: 'mono', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      tx(480, 90, '방어 4겹은 안에 숨는다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) });
      snippet(40, 130, ['data = get_resilient(', '    "post:42",', '    lambda k: db.query_post(…),', '    ttl=60,', ')'], { fs: 14, op: fade(u, 1.0) });
      const ds = c.beat.viz.defenses; ds.forEach((d, i) => { const y = 150 + i * 56, op = fade(u, 1.3 + i * 0.2);
        card(720, y, 420, 46, { rx: 10, stroke: GOOD, sw: 2, op }); check(530, y, 9, op);
        tx(550, y + 5, d.trap, { 'font-size': 15, 'font-weight': 700, opacity: op }); tx(910, y + 5, d.defense, { 'font-size': 14, fill: GOOD, 'text-anchor': 'end', opacity: op }); });
      return; }
    const lit = [[0], [0, 1], [1], [1, 2], [2, 3], [2, 4], [3, 4]][k];
    stations(lit);
    const r0 = [[20, SY], [sx(0) - 70, SY]];
    if (k === 0) { dot([[20, SY], [sx(0) - 70, SY], [20, SY]], seg(u, 0.2, 1.4), GOOD, 7); pill(sx(0), 50, 'hit → 바로 반환', GOOD, pop(u, 0.8), { fs: 14 }); }
    if (k === 1) { dot([[20, SY], [sx(1) - 70, SY]], seg(u, 0.2, 0.9), ACC, 7);
      pill(sx(1), 50, '"__NULL__" → None', GOOD, pop(u, 0.9), { mono: true, fs: 13.5 });
      fly(sx(1), SY + 44, sx(0), SY + 44, seg(u, 1.4, 2.2), 'L1 에 1초 적재', { fill: INFO }); }
    if (k === 2) { dot([[20, SY], [sx(1) - 70, SY], [20, SY]], seg(u, 0.2, 1.6), GOOD, 7);
      clock(sx(1) + 58, SY - 48, 14, 0.07, WARN); pill(sx(1) - 30, 50, 'ttl < 10% · 5%', WARN, pop(u, 0.5), { fs: 13.5 });
      const th = [[sx(1), SY + 32], [sx(1), 196], [sx(3), 196], [sx(3), SY + 32]];
      el('polyline', { points: th.map((p) => p.join(',')).join(' '), fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.8) });
      dot(th, seg(u, 0.9, 2.3), ACC, 6); tx((sx(1) + sx(3)) / 2, 188, '스레드로 재빌드 · 응답은 지금 값', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) }); }
    if (k === 3) { dot([[20, SY], [sx(2) - 70, SY]], seg(u, 0.2, 1.0), ACC, 7);
      [1, 2, 3].forEach((i) => { dot([[20, SY + 4 * i], [sx(2) - 72, SY + 4 * i], [20, SY + 4 * i]], seg(u, 0.3 + i * 0.15, 1.8 + i * 0.15), WARN, 5); });
      pill(sx(2), 50, '1명만 OK', GOOD, pop(u, 1.0), { fs: 14 }); pill(sx(1) - 30, 196, '나머지: sleep 0.05 → 재시도', WARN, pop(u, 1.3), { fs: 13.5 }); }
    if (k === 4) { dot([[sx(2) + 70, SY], [sx(3) - 70, SY]], seg(u, 0.2, 0.8), ACC, 7);
      pill(sx(3), 50, 'None', INK, pop(u, 0.8), { mono: true });
      const arc = [[sx(3), SY - 34], [sx(3), 28], [sx(1), 28], [sx(1), SY - 34]];
      dot(arc, seg(u, 1.1, 2.1), ACC, 6); pill((sx(1) + sx(3)) / 2, 28, 'SETEX key 60 "__NULL__"', ACC, pop(u, 1.2), { mono: true, fs: 13.5 }); }
    if (k === 5) { dot([[sx(3) + 70, SY], [sx(4) - 70, SY]], seg(u, 0.2, 0.8), ACC, 7);
      pill(sx(4), 50, '60 → 48~72초', GOOD, pop(u, 0.8), { fs: 14 });
      if (u > 1.5) { cross(sx(2) + 52, SY - 22, 9, pop(u, 1.5)); pill(sx(2), 196, 'finally: DEL lock', MUT, pop(u, 1.6), { mono: true, fs: 13.5 }); } }
    if (k === 6) { const th = [[sx(1), SY + 32], [sx(1), 196], [sx(3), 196], [sx(3), SY + 32]], th2 = [[sx(3), SY + 32], [sx(3), 196], [sx(4), 196], [sx(4), SY + 32]];
      el('polyline', { points: th.concat(th2.slice(1)).map((p) => p.join(',')).join(' '), fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      dot(th, seg(u, 0.2, 1.2), ACC, 6); dot(th2, seg(u, 1.2, 2.0), ACC, 6);
      pill(sx(4), 50, '_rebuild 도 jitter', GOOD, pop(u, 1.8), { fs: 14 }); pill(sx(1), 50, '고정 TTL 금지', BAD, pop(u, 0.6), { fs: 14 }); }
    matrix(c, u, 248); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: 'Cache Stampede 방어에서 SET NX EX 락은 무슨 일을 하나?',
      o: ['모든 요청이 캐시를 읽기 전에 락부터 잡게 한다', 'miss 일 때 한 명만 DB 를 읽어 캐시를 채우고, 나머지는 잠시 뒤 캐시를 다시 본다', '캐시 TTL 을 30초 늘려 준다'], a: 1,
      why: '락은 miss 경로에만 둔다. 한 명만 통과하니 DB 조회가 1000회에서 1회로 줄고, ex=30 덕분에 락 주인이 죽어도 영원히 막히지 않는다.' },
    { q: '존재하지 않는 user:99999999 를 반복 조회하는 Cache Penetration 은 어떻게 막나?',
      o: ['TTL 에 jitter 를 준다', 'L1 로컬 캐시를 앞에 둔다', '"없음"을 __NULL__ 로 60초 캐시하거나 Bloom filter 로 먼저 거른다'], a: 2,
      why: 'None 을 저장하지 않으면 매번 DB 까지 뚫린다. __NULL__ 캐시는 DB 조회를 1000회에서 1회로 줄이고, Bloom filter 는 없는 키를 캐시 앞에서 잘라 낸다.' },
    { q: '같은 TTL 60초로 워밍한 1만 개 키가 한꺼번에 만료되는 Avalanche 의 가장 싼 방어는?',
      o: ['TTL 에 랜덤 흔들림(jitter)을 줘 만료 시각을 흩는다', '모든 키에 mutex 락을 건다', 'TTL 을 없애고 영구 저장한다'], a: 0,
      why: '60초 대신 50~80초 랜덤을 주면 동시 만료가 10000건에서 1000건으로 줄고 DB peak 이 1/100 로 평탄해진다. 총 조회 수는 같다.' },
    { q: 'product:42 한 키에 요청이 몰리는 Hot Key 를 Cluster 노드 추가로 풀 수 없는 이유는?',
      o: ['Cluster 는 읽기 명령을 지원하지 않아서', '키 하나는 slot 하나에 묶여 한 노드만 담당하기 때문', '노드를 늘리면 TTL 이 초기화되어서'], a: 1,
      why: '분산의 최소 단위가 키라서 노드를 늘려도 그 노드만 계속 뜨겁다. 그래서 L1 로컬 캐시나 키 분할로 푼다.' },
    { q: '4 함정 종합 방어 함수에서 요청이 가장 먼저 확인하는 곳은?',
      o: ['DB', 'mutex 락', 'Redis(L2)', '프로세스 로컬 L1 캐시'], a: 3,
      why: '방어는 바깥에서 안으로 L1 → Redis(__NULL__ 처리) → miss 면 락 → DB → jitter TTL 저장 순서다. L1 에서 끝나면 Redis 도 DB 도 건드리지 않는다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'TTL이 끝나는 순간 몰린 요청이 전부 DB로 간다. miss 경로에만 SET NX 락을 걸어 한 명만 보낸다.',
    '없는 키를 반복 조회하면 매번 DB까지 뚫린다. 없음을 __NULL__로 짧게 캐시하거나 Bloom filter로 거른다.',
    '같은 TTL로 넣은 키는 함께 만료된다. TTL에 jitter를 주면 DB peak이 100분의 1로 준다.',
    '키 하나에 몰린 부하는 노드를 늘려도 나뉘지 않는다. 로컬 L1 캐시나 키 분할로 푼다.',
  ];
  const review = [
    { q: '세 증상 중 TTL jitter로 풀리는 것은?',
      o: ['없는 ID를 반복 조회해 DB가 바쁘다', '같은 시각에 워밍한 키들이 함께 만료되며 DB가 튄다', '인기 상품 키 하나가 노드 CPU를 태운다'], a: 1,
      why: 'jitter는 만료 시각을 흩어 Avalanche를 막는다. 없는 키 조회는 __NULL__ 캐시나 Bloom filter로, 핫키는 L1 캐시나 키 분할로 푼다.' },
    { q: '공격자가 없는 회원 ID를 매번 바꿔 가며 조회한다. __NULL__ 캐시를 넣었는데도 DB 부하가 그대로다. 이유와 대처는?',
      o: ['__NULL__의 TTL이 짧아서다. TTL을 훨씬 길게 늘린다', 'miss 경로에 락이 없어서다. SET NX 락을 건다', 'ID가 매번 달라 __NULL__이 안 맞는다. Bloom filter를 둔다'], a: 2,
      why: 'null 캐시는 같은 없는 키를 다시 물을 때만 듣는다. Bloom filter는 있는 ID만 담아 처음 보는 ID도 캐시 앞에서 잘라 낸다.' },
    { q: '조회수 카운터 키 하나에 INCR이 몰려 한 노드가 뜨겁다. L1 캐시를 붙였는데 나아지지 않았다. 다음 대처는?',
      o: ['카운터를 여러 키로 쪼개 증가시키고 읽을 때 합산한다', 'TTL에 jitter를 섞어 저장한다', 'Cluster에 노드를 더 붙인다'], a: 0,
      why: 'L1은 읽기만 막고 INCR 같은 쓰기는 못 막는다. 키를 쪼개면 slot이 흩어져 노드가 나눠 받지만, 노드만 늘리면 그 키는 여전히 한 노드에 있다.' },
  ];

  R.page({ title: '캐시 함정 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
