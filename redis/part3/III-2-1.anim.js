/* III-2-1 Persistence RDB vs AOF — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    redisBox, dbIcon, cross, check, clock, terminal, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // ---------- 이 페이지 도구 ----------
  // 파일 아이콘 (모서리 접힌 종이). o.rows: 안에 적을 줄, o.name: 아래 이름
  function doc(cx, cy, w, h, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), x = -w / 2, y = -h / 2, f = Math.min(16, w * 0.22), col = o.stroke || INK;
    el('path', { d: `M${x},${y} H${x + w - f} L${x + w},${y + f} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    el('path', { d: `M${x + w - f},${y} V${y + f} H${x + w}`, fill: 'none', stroke: col, 'stroke-width': 1.6, 'stroke-dasharray': o.dash }, g);
    (o.rows || []).forEach((r, i) => { const [s, rc] = Array.isArray(r) ? r : [r, null]; tx(x + 12, y + 26 + i * 20, s, { 'font-size': 13.5, class: 'mono', fill: rc || INK }, g); });
    if (o.name) tx(0, h / 2 + 21, o.name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: col }, g);
    return g; }
  // 가로 막대 한 줄: 이름(왼쪽) · 막대 · 값
  function hbar(x, y, name, w, frac, col, val, o) { o = o || {};
    tx(x, y + 15, name, { 'font-size': o.fs || 14.5, 'font-weight': 700, fill: o.nameCol || INK });
    const bx = x + (o.nw || 130), bw = Math.max(3, w * clamp(frac));
    el('rect', { x: bx, y, width: w, height: 22, rx: 4, fill: SOFT });
    el('rect', { x: bx, y, width: bw, height: 22, rx: 4, fill: col, opacity: 0.9 });
    if (val != null) mono(bx + bw + 8, y + 16, val, { 'font-size': 14, 'font-weight': 700, fill: col === OFF ? INK : col, opacity: o.vop ?? 1 }); }
  const num = (s) => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;

  // =====================================================================
  // 1. RDB — 주기적 snapshot : 메모리 · 디스크(dump.rdb) · 아래 시간줄
  const EVX = { '0': 80, '60s': 210, '120s': 340, '300s': 590, '305s': 660, '320s': 740, '325s': 830 };
  function evName(e) { const a = e.action; if (e.state === 'crash') return 'crash'; if (/^save /.test(a)) return 'save 조건';
    if (/^SET/.test(a)) return a.split(' ').slice(0, 2).join(' '); if (/LASTSAVE/.test(a)) return 'LASTSAVE'; if (/BGSAVE/.test(a)) return 'BGSAVE'; return 'SAVE'; }
  function timeline(c, y) { const evs = c.beat.viz.events, old = new Set((c.prev ? c.prev.viz.events : []).map((e) => e.time + e.action));
    el('line', { x1: 50, y1: y, x2: 910, y2: y, stroke: GRID, 'stroke-width': 3 });
    const last = {}; evs.forEach((e, i) => { last[e.time] = i; });
    let nNew = 0;
    Object.keys(last).sort((a, b) => num(a) - num(b)).forEach((tm, j) => { const i = last[tm], e = evs[i], x = EVX[tm] ?? 80;
      const fresh = !old.has(e.time + e.action), a = fresh ? pop(c.u, 0.2 + 0.3 * nNew++) : 1, col = e.state === 'snap' ? GOOD : e.state === 'crash' ? BAD : INK;
      if (a <= 0) return;
      if (e.state === 'snap') el('rect', { x: x - 9, y: y - 9, width: 18, height: 18, rx: 3, fill: GOOD, transform: `translate(${x} ${y}) scale(${a}) translate(${-x} ${-y})` });
      else if (e.state === 'crash') cross(x, y, 9, a);
      else el('circle', { cx: x, cy: y, r: 6.5 * a, fill: INK });
      tx(x, y - (j % 2 ? 36 : 16), evName(e), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col, class: 'mono', opacity: clamp(a) });
      mono(x, y + 24, tm === '0' ? '0s' : tm, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: clamp(a) }); }); }
  // Redis 메모리 상자. rows: [[key, val, {hot, gone, op}]]
  function memBox(rows, o) { o = o || {}; const x = 30, y = 40, w = 260, h = 170;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.dead ? SOFT : ACCBG, stroke: o.dead ? OFF : ACC, 'stroke-width': 2.2 });
    tx(x + 14, y + 24, 'Redis 메모리', { 'font-size': 15, 'font-weight': 800, fill: o.dead ? MUT : ACC });
    if (!rows.length) sub(x + w / 2, y + 96, '아직 쓴 키가 없다', 1);
    rows.forEach(([k, v, ro], i) => { ro = ro || {}; const yy = y + 58 + i * 32, op = ro.op ?? 1, col = ro.gone ? BAD : ro.hot ? ACC : INK;
      mono(x + 22, yy, k, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op, 'text-decoration': ro.gone ? 'line-through' : null });
      mono(x + 120, yy, v, { 'font-size': 15, fill: ro.gone ? BAD : INK, opacity: op, 'text-decoration': ro.gone ? 'line-through' : null }); }); }
  function disk(fileRows, o) { o = o || {}; zone(640, 40, 290, 200, '디스크', { fill: SOFT });
    if (o.path) mono(785, 88, '/var/lib/redis/', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: o.path });
    doc(785, 160, 120, 86, { name: 'dump.rdb', rows: fileRows, dash: o.ghost ? '6 5' : null, stroke: o.ghost ? OFF : o.hot ? GOOD : INK, s: o.s, fill: o.hot ? GOODBG : PANEL }); }

  function s1(t, c) { const { k, u } = c;
    const KV2 = [['key1', 'val1'], ['key2', 'val2']];
    const rows = k >= 2 ? KV2.slice() : [];
    // 5: crash — key3 은 메모리에만 있다가 사라진다
    const crashU = 1.1;
    if (k === 5) { rows.push(['key3', 'val3', { hot: u < crashU, gone: u >= crashU, op: fade(u, 0.3) }]); }
    memBox(rows, { dead: k === 5 && u >= crashU });
    disk(k >= 2 ? ['key1 val1', 'key2 val2'] : [], { ghost: k === 0, path: k === 1 ? fade(u, 1.3) : k > 1 ? 1 : 0, hot: (k === 2 && u > 2.2) || (k === 5 && u > 1.6) });
    timeline(c, 356);

    if (k === 0) { // save 조건 3줄
      [['save 3600 1', '1시간에 변경 1번'], ['save 300 100', '5분에 변경 100번'], ['save 60 10000', '1분에 변경 10000번']].forEach(([a, b], i) => {
        const s = pop(u, 0.2 + i * 0.35), y = 72 + i * 62; card(465, y, 270, 50, { rx: 8, s, stroke: ACC, sw: 2 });
        mono(345, y + 5, a, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + i * 0.35) });
        tx(588, y + 5, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.4 + i * 0.35) }); });
      grow(602, 134, 718, 150, E(u, 1.4, 2.1), ACC, { dash: '6 5' });
      sub(465, 270, '하나라도 걸리면 → dump.rdb', fade(u, 1.8), { fill: ACC, 'font-weight': 700, 'font-size': 14.5 }); }

    if (k === 1) { // dir + dbfilename → 경로, 압축
      fly(440, 80, 785, 88, seg(u, 0.2, 1.2), 'dir /var/lib/redis/', { mono: true, fill: INK });
      fly(440, 130, 785, 160, seg(u, 0.5, 1.4), 'dbfilename dump.rdb', { mono: true });
      if (u > 1.3) mono(785, 270, '/var/lib/redis/dump.rdb', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.3) });
      const g = E(u, 1.6, 2.5);
      tx(330, 222, 'rdbcompression yes', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: WARN, opacity: fade(u, 1.5) });
      if (u > 1.5) { el('rect', { x: 330, y: 238, width: 280, height: 18, rx: 4, fill: ACC, opacity: 0.85 * fade(u, 1.5) });
        el('rect', { x: 330, y: 264, width: lerp(280, 140, g), height: 18, rx: 4, fill: GOOD, opacity: fade(u, 1.5) });
        tx(330 + lerp(280, 140, g) + 10, 278, g > 0.95 ? '파일 ≈ 메모리 50%' : '', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD }); } }

    if (k === 2) { // SAVE 는 멈추고 BGSAVE 는 fork
      const x0 = 320, x1 = 620;
      mono(x0, 70, 'SAVE', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.2) });
      tx(x0 + 60, 70, '메인 스레드', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2) });
      const blk = E(u, 0.3, 1.1); el('rect', { x: x0, y: 82, width: (x1 - x0) * blk, height: 22, rx: 4, fill: BAD, opacity: 0.85 });
      if (blk > 0.5) tx(x0 + 150, 98, '저장 끝날 때까지 멈춤', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: PANEL });
      if (u > 1.0) cross(x1 - 6, 70, 9, pop(u, 1.0));
      mono(x0, 152, 'BGSAVE', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
      tx(x0 + 80, 152, '메인 스레드', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) });
      if (u > 1.2) { el('rect', { x: x0, y: 164, width: x1 - x0, height: 22, rx: 4, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.5, opacity: fade(u, 1.2) });
        for (let i = 0; i < 5; i++) el('circle', { cx: x0 + ((t * 120 + i * 60) % (x1 - x0)), cy: 175, r: 5, fill: GOOD }); }
      grow(400, 186, 400, 226, E(u, 1.5, 1.9), GOOD);
      if (u > 1.8) { card(450, 246, 170, 36, { rx: 8, stroke: GOOD, text: 'fork → 자식 프로세스', fs: 13.5, color: GOOD, s: pop(u, 1.8) });
        grow(535, 246, 722, 190, E(u, 2.1, 2.6), GOOD); } }

    if (k === 3) { // copy-on-write
      const x0 = 330, cw = 42, g2 = 6, names = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
      tx(x0, 66, '부모 (메인 스레드)', { 'font-size': 14, 'font-weight': 700, fill: ACC });
      cells(x0, 76, names, { w: cw, h: 34, gap: g2, fs: 13.5, style: (i) => ({ stroke: ACC, s: pop(u, 0.2 + i * 0.06) }) });
      tx(x0, 262, '자식 (BGSAVE)', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) });
      names.forEach((_, i) => { const cx = x0 + i * (cw + g2) + cw / 2; grow(cx, 236, cx, 114, E(u, 0.6 + i * 0.06, 1.0 + i * 0.06), OFF, { plain: true, dash: '4 4' }); });
      el('rect', { x: x0, y: 236, width: 6 * (cw + g2) - g2, height: 10, rx: 3, fill: GOOD, opacity: fade(u, 0.6) });
      if (u < 1.6) sub(530, 176, '같은 페이지를 함께 본다', fade(u, 1.0) * (1 - seg(u, 1.3, 1.6)), { 'font-weight': 700 });
      if (u > 1.4) { const cx = x0 + 2 * (cw + g2) + cw / 2;
        pill(cx, 30, 'SET key2', WARN, pop(u, 1.4), { mono: true, fs: 13.5 });
        card(cx, 172, cw + 10, 32, { rx: 6, text: "p3'", fs: 13.5, mono: true, stroke: WARN, color: WARN, fill: C.WARNBG, s: pop(u, 1.8) });
        tx(cx + 40, 177, '쓰인 페이지만 복사', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); }
      sub(470, 300, '쓰기가 많으면 최악 2배까지', fade(u, 2.3), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 }); }

    if (k === 4) { // LASTSAVE + 복구
      terminal(320, 48, 300, 92, ['127.0.0.1:6379> LASTSAVE', '(integer) UNIX timestamp'], lerp(0, 2, E(u, 0.2, 1.0)));
      [['1', 'Redis 종료'], ['2', 'dump.rdb → dir'], ['3', '재시작 → 자동 로드']].forEach(([n, s], i) => { const y = 172 + i * 40, sc = pop(u, 1.0 + i * 0.25);
        card(470, y, 290, 32, { rx: 16, stroke: i === 2 ? GOOD : GRID, s: sc });
        mono(338, y + 5, n, { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: clamp(sc) }); tx(360, y + 5, s, { 'font-size': 14, 'font-weight': 700, opacity: clamp(sc), fill: i === 2 ? GOOD : INK }); });
      fly(785, 160, 160, 120, seg(u, 1.9, 2.7), 'dump.rdb', { mono: true, fill: GOOD }); }

    if (k === 5) { // crash
      if (u > crashU) { cross(470, 110, 22, pop(u, crashU)); tx(470, 170, 'key3 은 파일에 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, crashU + 0.2) }); }
      el('rect', { x: EVX['300s'], y: 350, width: (EVX['325s'] - EVX['300s']) * E(u, 1.4, 2.0), height: 12, rx: 3, fill: BAD, opacity: 0.25 });
      sub((EVX['300s'] + EVX['325s']) / 2, 408, '마지막 snapshot 이후 = 손실 구간', fade(u, 1.8), { fill: BAD, 'font-weight': 700 });
      pill(470, 232, 'fork 시 메모리 일시 2배', WARN, pop(u, 2.2), { fs: 13.5 }); } }

  // =====================================================================
  // 2. AOF — 모든 쓰기 로그 : 왼쪽 Redis · 오른쪽 appendonly.aof 종이
  const FX = 380, FY = 34, FW = 556, FH = 214;
  const pretty = (e) => e.replace(/\\r\\n/g, ' ');
  function aofFile(c, o) { o = o || {}; const ents = c.beat.viz.entries.filter((e) => !e.startsWith('(')), nPrev = c.prev ? c.prev.viz.entries.filter((e) => !e.startsWith('(')).length : 0;
    el('rect', { x: FX, y: FY, width: FW, height: FH, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    el('line', { x1: FX, y1: FY + 34, x2: FX + FW, y2: FY + 34, stroke: GRID, 'stroke-width': 1.5 });
    mono(FX + 14, FY + 23, 'appendonly.aof', { 'font-size': 15, 'font-weight': 800 });
    if (!ents.length) sub(FX + FW / 2, FY + 110, '(빈 파일 — 아직 기록 없음)', fade(c.u, 0.6));
    ents.forEach((e, i) => { const y = FY + 64 + i * 36, isNew = i >= nPrev, a = isNew ? seg(c.u, 0.3 + (i - nPrev) * 0.4, 0.9 + (i - nPrev) * 0.4) : 1;
      const st = (o.row && o.row(i)) || {};
      if (isNew && a < 1) fly(250, 96, FX + 200, y - 5, a, e.split('\\r\\n')[2] || 'cmd', { mono: true });
      if (a < 1) return;
      if (st.bg) el('rect', { x: FX + 8, y: y - 19, width: FW - 16, height: 28, rx: 5, fill: st.bg });
      mono(FX + 16, y, o.decoded ? pretty(e) : e, { 'font-size': 13.5, fill: st.col || INK, opacity: st.op ?? 1, 'text-decoration': st.strike ? 'line-through' : null }); });
    const sy = c.beat.viz.syncs, prevS = c.prev ? c.prev.viz.syncs.join() : '';
    sy.forEach((s, i) => pill(FX + 100 + i * 180, FY + FH + 28, s, WARN, sy.join() === prevS ? 1 : pop(c.u, 0.4 + i * 0.25), { mono: true, fs: 13.5 })); }

  function s2(t, c) { const { k, u } = c;
    redisBox(150, 96, { w: 180, h: 64, sub: 'appendonly yes', s: k === 0 ? pop(u, 0.2) : 1 });
    el('line', { x1: 240, y1: 96, x2: FX - 6, y2: 96, stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: k === 0 ? fade(u, 0.8) : 1 });
    const rowStyle = k === 2 ? (i) => (i === 0 ? { bg: C.HL } : null)
      : k === 3 ? (i) => ((i === 0 || i === 3) && u > 1.1 ? { col: BAD, strike: true } : null)
      : k === 4 ? (i) => (Math.floor(lerp(0, 4, E(u, 0.3, 2.0)) - 0.001) === i ? { bg: ACCBG } : null) : null;
    aofFile(c, { row: rowStyle, decoded: k >= 3 });

    if (k === 0) { pill(150, 186, 'appendonly yes', ACC, pop(u, 0.4), { mono: true });
      pill(150, 230, 'appendfilename "appendonly.aof"', ACC, pop(u, 0.7), { mono: true, fs: 13.5 });
      sub(150, 290, '이 순간부터 쓰기마다 파일 끝에', fade(u, 1.2), { 'font-weight': 700, fill: INK, 'font-size': 14.5 }); }

    if (k === 1) { const opts = [['always', '손실 0 · 느림', GOOD], ['everysec', '손실 ≤1초 · -5%', ACC], ['no', 'OS 결정 · 위험', BAD]];
      tx(30, 172, 'appendfsync', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      const pick = lerp(0, 1, E(u, 0.9, 1.6));
      el('rect', { x: 24, y: 186 + pick * 46, width: 316, height: 40, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.5) });
      opts.forEach(([a, b, col], i) => { const y = 212 + i * 46;
        mono(38, y, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.15), fill: i === 1 && u > 1.6 ? ACC : INK });
        tx(326, y, b, { 'font-size': 13.5, fill: col, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.15) }); });
      clock(FX + FW - 40, FY + 64, 15, (t % 1), WARN); mono(FX + FW - 64, FY + 68, '1s', { 'font-size': 13.5, 'text-anchor': 'end', fill: WARN, 'font-weight': 700 }); }

    if (k === 2) { const toks = c.beat.viz.entries[0].split('\\r\\n');
      cells(26, 176, toks, { w: 40, h: 34, gap: 4, fs: 13.5, style: (i) => ({ stroke: i === 0 ? INFO : i % 2 ? WARN : ACC, color: i === 0 ? INFO : i % 2 ? WARN : ACC, s: pop(u, 0.2 + i * 0.12) }) });
      tx(26, 236, '*3 = 인자 3개', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.1) });
      tx(26, 262, '$3 = 다음 3바이트', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
      banner(150, 312, '= SET foo bar 한 개', pop(u, 1.8)); }

    if (k === 3) { pill(160, 178, 'auto-aof-rewrite-percentage 100', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      pill(160, 214, 'auto-aof-rewrite-min-size 64mb', ACC, pop(u, 0.4), { mono: true, fs: 13.5 });
      if (u > 1.1) sub(FX + FW - 110, FY + 64 + 3 * 36 + 26, 'SET foo + DEL foo = 없는 것과 같다', fade(u, 1.1), { fill: BAD, 'font-weight': 700 });
      el('rect', { x: 26, y: 246, width: 300, height: 104, rx: 8, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.6) });
      mono(40, 270, 'BGREWRITEAOF 결과', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      mono(40, 300, 'SET counter 1', { 'font-size': 14.5, opacity: fade(u, 1.9) }); mono(40, 326, 'RPUSH list a', { 'font-size': 14.5, opacity: fade(u, 2.1) });
      mono(310, 326, '4 → 2줄', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 2.3) }); }

    if (k === 4) { const n = Math.floor(lerp(0, 4, E(u, 0.3, 2.0)) + 0.001);
      const mem = [['foo', 'bar'], ['counter', '1'], ['list', '[a]']];
      tx(30, 174, '재시작 → 명령 재생', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      el('rect', { x: 26, y: 186, width: 300, height: 120, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 1.8 });
      mem.forEach(([kk, v], i) => { if (n <= i) return; const gone = i === 0 && n >= 4;
        mono(44, 214 + i * 32, kk, { 'font-size': 15, 'font-weight': 700, fill: gone ? BAD : INK, 'text-decoration': gone ? 'line-through' : null });
        mono(170, 214 + i * 32, v, { 'font-size': 15, fill: gone ? BAD : INK, 'text-decoration': gone ? 'line-through' : null }); });
      pill(176, 340, 'redis-check-aof --fix', INFO, pop(u, 2.2), { mono: true, fs: 13.5 }); }

    if (k === 5) { const g = E(u, 0.2, 1.2);
      tx(30, 176, '같은 데이터, 파일 크기', { 'font-size': 15, 'font-weight': 800 });
      hbar(30, 192, 'dump.rdb', 180, 0.2 * g, GOOD, '1배', { nw: 100 });
      el('rect', { x: 130 + 180 * 0.4, y: 226, width: 180 * 0.6 * g, height: 22, rx: 4, fill: WARN, opacity: 0.3 });
      hbar(30, 226, 'AOF', 180, 0.4 * g, WARN, null, { nw: 100 });
      mono(318, 290, '2~5배', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.2) });
      tx(30, 324, '복구: 로드가 아니라 명령 재생', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      tx(30, 350, '쓰기마다 디스크 I/O', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); } }

  // =====================================================================
  // 3. RDB 빠른 복구 / 일부 손실 — 12:00 ~ 12:05 시간줄
  const TL = { x0: 120, x1: 840, y: 66 }, mx = (m) => lerp(TL.x0, TL.x1, m / 5);
  function clockLine(lostCol, lostU) { el('line', { x1: TL.x0 - 20, y1: TL.y, x2: TL.x1 + 20, y2: TL.y, stroke: GRID, 'stroke-width': 3 });
    for (let m = 0; m <= 5; m++) mono(mx(m), TL.y + 26, '12:0' + m, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    el('rect', { x: mx(0) - 10, y: TL.y - 10, width: 20, height: 20, rx: 3, fill: GOOD }); tx(mx(0), TL.y - 18, 'SAVE', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: GOOD, class: 'mono' });
    for (let i = 0; i < 16; i++) { const x = mx(0.6 + i * 0.27); el('circle', { cx: x, cy: TL.y - (lostU ? lerp(0, 24, lostU) * ((i % 3) + 1) / 3 : 0), r: 5, fill: lostCol || INK, opacity: lostU ? 1 - lostU * 0.7 : 1 }); }
    cross(mx(5), TL.y, 11); tx(mx(5), TL.y - 18, 'crash', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: BAD, class: 'mono' }); }

  function s3(t, c) { const { k, u } = c, v = c.beat.viz;
    if (k === 0) { el('line', { x1: TL.x0 - 20, y1: TL.y, x2: TL.x1 + 20, y2: TL.y, stroke: GRID, 'stroke-width': 3 });
      for (let m = 0; m <= 5; m++) mono(mx(m), TL.y + 26, '12:0' + m, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.1 + m * 0.05) });
      const sp = pop(u, 0.3); el('rect', { x: mx(0) - 10, y: TL.y - 10, width: 20, height: 20, rx: 3, fill: GOOD, opacity: clamp(sp) }); tx(mx(0), TL.y - 18, 'SAVE', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: GOOD, class: 'mono', opacity: clamp(sp) });
      const n = Math.floor(lerp(0, 16, E(u, 0.7, 1.8))); for (let i = 0; i < n; i++) el('circle', { cx: mx(0.6 + i * 0.27), cy: TL.y, r: 5, fill: INK });
      if (u > 1.9) { cross(mx(5), TL.y, 11, pop(u, 1.9)); tx(mx(5), TL.y - 18, 'crash', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: BAD, class: 'mono' }); }
    } else clockLine(k === 2 ? BAD : k >= 3 ? OFF : INK, k === 2 ? E(u, 0.5, 1.4) : 0);

    if (k <= 2) { // 메모리 · 파일
      const memX = 160, fileX = 640;
      el('rect', { x: memX - 120, y: 150, width: 240, height: 150, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2 });
      tx(memX, 180, 'Redis 메모리 1GB', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
      doc(fileX, 220, 110, 120, { name: 'dump.rdb', stroke: GOOD, rows: [['12:00', GOOD], ['상태', GOOD]] });
      mono(fileX + 70, 290, v.rdb.fileSize, { 'font-size': 14, 'font-weight': 700, fill: MUT });
      if (k === 0) { pill(450, 140, 'save 300 100', ACC, pop(u, 0.5), { mono: true }); sub(450, 172, '5분 주기 snapshot', fade(u, 0.7)); }
      if (k >= 1) { const g = k === 1 ? E(u, 0.4, 1.8) : 1;
        grow(fileX - 60, 220, memX + 124, 220, k === 1 ? E(u, 0.2, 0.6) : 1, GOOD);
        el('rect', { x: memX - 100, y: 200, width: 200, height: 20, rx: 4, fill: SOFT }); el('rect', { x: memX - 100, y: 200, width: 200 * g, height: 20, rx: 4, fill: GOOD });
        mono(memX, 252, g >= 1 ? '12:00 상태 복원' : '로드 중…', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD });
        mono(memX, 280, Math.round(15 * g) + '초', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }); }
      if (k >= 1) { const g = k === 1 ? E(u, 1.6, 2.5) : 1, rr = num(v.rdb.recovery), ar = num(v.aof.recovery);
        tx(450, 342, '복구 시간', { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, k === 1 ? 1.5 : 0) });
        hbar(560, 328, 'RDB', 240, rr / ar * g, GOOD, v.rdb.recovery, { nw: 50 });
        hbar(560, 360, 'AOF', 240, g, WARN, v.aof.recovery, { nw: 50 }); }
      if (k === 2) { const g = E(u, 0.8, 1.6);
        el('path', { d: `M${mx(0.5)},${TL.y + 46} V${TL.y + 56} H${mx(5)} V${TL.y + 46}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: g });
        tx((mx(0.5) + mx(5)) / 2, TL.y + 80, '12:01~12:05 변경분 — 파일에 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: g });
        pill(450, 200, 'RDB 손실 ' + v.rdb.loss, BAD, pop(u, 1.6), { fs: 14 }); pill(450, 244, 'AOF 손실 ' + v.aof.loss, GOOD, pop(u, 1.9), { fs: 14 }); }
      return; }

    if (k === 3) { const rows = [['1GB', '500MB', 5, '5초'], ['8GB', '4GB', 30, '30초'], ['32GB', '16GB', 120, '2분'], ['64GB', '32GB', 300, '5분']];
      tx(60, 136, '메모리', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(170, 136, 'RDB 파일', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(300, 136, '복구 시간', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      rows.forEach(([m, f, s, lab], i) => { const y = 154 + i * 58, g = E(u, 0.2 + i * 0.3, 1.0 + i * 0.3);
        mono(60, y + 18, m, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1 + i * 0.3) }); mono(170, y + 18, f, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.1 + i * 0.3) });
        el('rect', { x: 300, y, width: 520 * s / 300 * g + 3, height: 26, rx: 4, fill: i === 3 ? BAD : ACC, opacity: 0.88 });
        mono(300 + 520 * s / 300 * g + 12, y + 19, lab, { 'font-size': 15, 'font-weight': 800, fill: i === 3 ? BAD : INK, opacity: fade(u, 0.8 + i * 0.3) }); });
      return; }

    if (k === 4) { // 캐시 — miss 로 다시 채워진다
      const rx = 380, ry = 260; redisBox(rx, ry, { w: 200, h: 70, sub: '복구 직후 (12:00 상태)' });
      dbIcon(800, ry, 'DB');
      const slots = 8; for (let i = 0; i < slots; i++) { const hole = i % 3 === 1, filled = !hole || u > 1.2 + i * 0.12;
        el('rect', { x: rx - 120 + i * 30, y: ry - 76, width: 24, height: 24, rx: 4, fill: filled ? (hole ? GOOD : ACC) : PANEL, stroke: filled ? 'none' : BAD, 'stroke-dasharray': '4 3', 'stroke-width': 1.8 }); }
      person(120, ry, '요청', {});
      grow(160, ry, rx - 104, ry, E(u, 0.2, 0.6), MUT); pill(250, ry - 26, 'miss', WARN, pop(u, 0.5), { mono: true });
      grow(rx + 104, ry, 750, ry, E(u, 0.7, 1.1), MUT); dot([[rx + 104, ry + 14], [750, ry + 14]], seg(u, 0.7, 1.2), INK, 6);
      dot([[750, ry - 14], [rx + 104, ry - 14]], seg(u, 1.2, 1.9), GOOD, 6);
      tx(rx, ry + 84, '다시 채워지는 키', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      banner(560, 380, '손실 ' + v.rdb.loss + ' — 잠깐의 miss spike', pop(u, 2.1)); return; }

    if (k === 5) { // 다시 계산할 수 없는 데이터
      [['사용자 세션', 'session'], ['분산 락', 'lock'], ['작업 큐', 'queue']].forEach(([a, b], i) => { const cx = 200 + i * 230, y = 210, s = pop(u, 0.2 + i * 0.3);
        card(cx, y, 200, 96, { rx: 10, stroke: BAD, sw: 2, s });
        tx(cx, y - 14, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: clamp(s) });
        mono(cx, y + 14, '5분치 손실', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.3) });
        if (u > 1.2 + i * 0.2) cross(cx + 84, y - 40, 9, pop(u, 1.2 + i * 0.2)); });
      tx(430, 300, '다시 계산할 수 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      pill(820, 210, '+ AOF 병행', GOOD, pop(u, 2.0), { fs: 16 }); } }

  // =====================================================================
  // 4. AOF 안전 / 큰 파일
  function bars(x, y, items, unit, o) { o = o || {}; const max = Math.max(...items.map((d) => d.v)), w = o.w || 480;
    items.forEach((d, i) => { const g = o.g ? o.g(i) : 1; const col = d.color === 'emerald' ? GOOD : d.color === 'amber' ? WARN : d.color === 'rose' ? BAD : ACC;
      hbar(x, y + i * 40, d.name, w, d.v / max * g, col, (o.fmt ? o.fmt(d.v) : d.v + unit), { nw: o.nw || 190, vop: g > 0.6 ? 1 : 0 }); }); }
  const mb = (v) => (v >= 1000 ? (v / 1000) + 'GB' : v + 'MB');
  function sizeBars(c, y) { const fs = c.beat.viz.fileSizes, pf = c.prev && c.prev.viz.fileSizes, same = pf && pf.map((f) => f.name).join() === fs.map((f) => f.name).join();
    tx(60, y - 12, '파일 크기', { 'font-size': 14, 'font-weight': 800, fill: MUT });
    bars(60, y, fs.map((f, i) => ({ name: f.name, v: same ? tween(pf[i].size, f.size, c.u) : f.size, color: f.color })), '', { fmt: (v) => mb(Math.round(v)), g: same ? null : (i) => E(c.u, 0.2 + i * 0.2, 1.0 + i * 0.2), nw: 210, w: 470 }); }

  function s4(t, c) { const { k, u } = c, v = c.beat.viz;
    if (k === 0) { const pol = [['always', '0초', 0, 50, GOOD], ['everysec', '최대 1초', 1 / 60, 5, ACC], ['no', '수분 (OS 결정)', 1, 0, BAD]];
      pol.forEach(([n, loss, lf, perf, col], i) => { const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.35), on = i === 1;
        card(cx, 200, 260, 280, { rx: 12, stroke: on && u > 1.6 ? ACC : GRID, sw: on && u > 1.6 ? 3 : 1.5, s });
        mono(cx, 92, n, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: clamp(s) });
        clock(cx - 60, 160, 28, lf * E(u, 0.5 + i * 0.35, 1.3 + i * 0.35), BAD);
        tx(cx - 16, 154, '손실', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.35) }); tx(cx - 16, 176, loss, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.5 + i * 0.35) });
        tx(cx - 104, 240, '성능 비용', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6 + i * 0.35) });
        el('rect', { x: cx - 104, y: 252, width: 208, height: 18, rx: 4, fill: SOFT, opacity: clamp(s) });
        el('rect', { x: cx - 104, y: 252, width: Math.max(2, 208 * perf / 50 * E(u, 0.7 + i * 0.35, 1.4 + i * 0.35)), height: 18, rx: 4, fill: BAD, opacity: 0.85 });
        mono(cx, 298, perf ? '-' + perf + '%' : '0%', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: perf >= 50 ? BAD : INK, opacity: fade(u, 1.0 + i * 0.35) }); });
      pill(480, 368, 'everysec 채택', ACC, pop(u, 1.8), { mono: true, fs: 15 }); return; }

    if (k === 1) { const st = [['시작', '0 KB', 0], ['1시간 후', '100 MB', 100], ['하루 후', '3 GB', 3000]];
      st.forEach(([a, b, s], i) => { const x = 200 + i * 260, h = Math.max(3, 190 * s / 3000 * E(u, 0.2 + i * 0.5, 1.0 + i * 0.5));
        el('rect', { x: x - 50, y: 220 - h, width: 100, height: h, rx: 4, fill: i === 2 ? BAD : i ? WARN : GOOD, opacity: 0.85 });
        el('line', { x1: x - 70, y1: 220, x2: x + 70, y2: 220, stroke: INK, 'stroke-width': 2 });
        tx(x, 246, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1 + i * 0.5) });
        mono(x, 214 - h, b, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.6 + i * 0.5) }); });
      sub(460, 270, '(SET 1만 개)', fade(u, 1.0));
      grow(270, 150, 640, 70, E(u, 1.8, 2.4), BAD, { dash: '6 5' }); return; }

    if (k === 2) { const sx = 130, nx = 780;
      for (let i = 0; i < 18; i++) el('rect', { x: sx - 60, y: 40 + i * 10, width: 120, height: 6, rx: 2, fill: OFF, opacity: fade(u, 0.1 + i * 0.02) });
      tx(sx, 236, '100k 명령 (이력)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 });
      el('rect', { x: 370, y: 60, width: 220, height: 120, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.5) });
      tx(480, 90, '지금 메모리 상태', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
      ['counter = 1', 'list = [a]'].forEach((s, i) => mono(480, 124 + i * 26, s, { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 0.8 + i * 0.2) }));
      grow(200, 120, 364, 120, E(u, 0.6, 1.0), MUT); grow(596, 120, nx - 70, 120, E(u, 1.4, 1.9), GOOD);
      for (let i = 0; i < 2; i++) el('rect', { x: nx - 60, y: 100 + i * 10, width: 120, height: 6, rx: 2, fill: GOOD, opacity: fade(u, 1.9 + i * 0.1) });
      tx(nx, 236, '10k 명령 (결과만)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }

    if (k === 3) { const g = E(u, 0.2, 1.4), sw = E(u, 1.6, 2.2);
      doc(lerp(240, 240, sw), 120, 120, 150, { name: sw < 0.5 ? 'appendonly.aof' : '', stroke: BAD, rows: [['3GB', BAD]], op: 1 - sw });
      el('rect', { x: 560, y: 54, width: 140, height: 150, rx: 6, fill: PANEL, stroke: GOOD, 'stroke-width': 2.2, 'stroke-dasharray': sw < 1 ? '6 4' : null, transform: `translate(${lerp(0, -390, sw)} 0)` });
      el('rect', { x: 572, y: 196 - 136 * g, width: 116, height: 136 * g, rx: 4, fill: GOODBG, transform: `translate(${lerp(0, -390, sw)} 0)` });
      mono(630 + lerp(0, -390, sw), 236, sw > 0.5 ? 'appendonly.aof' : 'temp-rewrite.aof', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD });
      mono(630 + lerp(0, -390, sw), 140, '300MB', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
      if (u > 1.5) tx(820, 120, 'rename 한 번', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      if (u > 1.5) sub(820, 146, '중간에 끊겨도 옛 파일 그대로', fade(u, 1.7)); }

    if (k === 4) { const lanes = [['디스크', 70], ['fsync', 130], ['메인 스레드', 190]];
      lanes.forEach(([n, y]) => { tx(40, y + 6, n, { 'font-size': 14.5, 'font-weight': 700 }); el('line', { x1: 150, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 2 }); });
      const p = E(u, 0.2, 2.2), xNow = lerp(150, 900, p);
      el('rect', { x: 380, y: 58, width: Math.max(0, Math.min(xNow, 900) - 380), height: 24, rx: 4, fill: WARN, opacity: xNow > 380 ? 0.8 : 0 });
      if (xNow > 400) tx(400, 75, 'fork 자식이 rewrite 쓰는 중', { 'font-size': 13.5, 'font-weight': 700, fill: PANEL });
      [[150, 205], [215, 270], [280, 335]].forEach(([a, b]) => { if (xNow > a) el('rect', { x: a, y: 120, width: Math.min(b, xNow) - a, height: 20, rx: 3, fill: GOOD }); });
      if (xNow > 400) { el('rect', { x: 400, y: 120, width: Math.min(xNow, 860) - 400, height: 20, rx: 3, fill: BAD, opacity: 0.85 });
        el('rect', { x: 460, y: 180, width: Math.max(0, Math.min(xNow, 860) - 460), height: 20, rx: 3, fill: BAD, opacity: 0.5 });
        tx(470, 220, '메인 스레드 멈춤 → 응답 spike', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); }
      tx(60, 268, '데이터 손실 (초)', { 'font-size': 14, 'font-weight': 800, fill: MUT });
      bars(60, 280, v.dataLoss.map((d) => ({ name: d.name, v: d.loss, color: d.color })), '초', { g: (i) => E(u, 0.4 + i * 0.3, 1.0 + i * 0.3), nw: 150, w: 420 });
      pill(800, 330, 'no-appendfsync-on-rewrite yes', GOOD, pop(u, 2.2), { mono: true, fs: 13.5 }); return; }

    if (k === 5) { const rows = [['100MB', 5, '5초'], ['1GB', 30, '30초'], ['5GB', 180, '3분'], ['20GB', 900, '15분']];
      tx(60, 46, 'AOF 파일 → 재생 시간', { 'font-size': 15, 'font-weight': 800 });
      rows.forEach(([n, s, lab], i) => { const y = 64 + i * 46, g = E(u, 0.2 + i * 0.3, 1.0 + i * 0.3), col = i === 3 ? BAD : i === 2 ? WARN : GOOD;
        hbar(60, y, n, 520, s / 900 * g, col, g > 0.6 ? lab : null, { nw: 110 }); });
      tx(60, 286, '데이터 손실', { 'font-size': 14, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.4) });
      v.dataLoss.forEach((d, i) => { const col = d.loss > 1 ? BAD : GOOD; pill(200 + i * 220, 330, d.name + ' · ' + (d.loss >= 60 ? (d.loss / 60) + '분' : d.loss + '초'), col, pop(u, 1.5 + i * 0.25), { fs: 14 }); });
      pill(480, 388, 'BGREWRITEAOF 로 작게 유지', ACC, pop(u, 2.3), { mono: true, fs: 14 }); return; }

    sizeBars(c, 296); }

  // =====================================================================
  // 5. 혼합 — 운영급 설정 (코드 창과 함께, 60% 폭)
  function s5(t, c) { const { k, u } = c, v = c.beat.viz;
    // 왼쪽: 메모리 8GB
    const mxl = 30, myl = 40;
    el('rect', { x: mxl, y: myl, width: 230, height: 54, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2, opacity: k === 0 ? fade(u, 0.2) : 1 });
    mono(mxl + 14, myl + 33, 'maxmemory 8gb', { 'font-size': 15.5, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.3) : 1 });
    // 오른쪽: 디스크 파일들 (parts)
    const parts = v.parts, maxW = 300, scale = maxW / 2500, dx = 360;
    tx(dx, 52, '디스크', { 'font-size': 14, 'font-weight': 800, fill: MUT });
    const rdbPart = parts.find((p) => p.name === 'dump.rdb'), aofPart = parts.find((p) => p.name === 'appendonly.aof'), mixed = parts.find((p) => p.name === 'base.rdb');
    if (rdbPart) { hbar(dx, 64, 'dump.rdb', rdbPart.size * scale, 1, OFF, rdbPart.size + 'MB', { nw: 150 }); }
    if (aofPart) { const g = k === 2 ? E(u, 0.8, 1.8) : 1; hbar(dx, 100, 'appendonly.aof', aofPart.size * scale, g, WARN, g > 0.9 ? aofPart.size + 'MB' : null, { nw: 150 }); }
    if (mixed) { const inc = parts.find((p) => p.name === 'incr.aof'), g = k === 3 ? E(u, 0.3, 1.4) : 1;
      tx(dx, 115, 'appendonly.aof', { 'font-size': 14.5, 'font-weight': 700 });
      const w1 = lerp(2500, mixed.size, g) * scale, w2 = inc.size * scale * g, bx = dx + 150;
      el('rect', { x: bx, y: 100, width: w1, height: 22, rx: 4, fill: g < 1 ? WARN : OFF, opacity: 0.9 });
      if (g > 0.3) el('rect', { x: bx + w1, y: 100, width: w2, height: 22, rx: 4, fill: WARN });
      if (g > 0.95) { mono(bx + w1 / 2, 145, 'base.rdb ' + mixed.size, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700 }); mono(bx + w1 + w2 + 8, 116, (mixed.size + inc.size) + 'MB', { 'font-size': 14, 'font-weight': 800, fill: GOOD });
        mono(bx + w1 + w2 / 2 + 30, 145, 'incr.aof ' + inc.size, { 'text-anchor': 'start', 'font-size': 13.5, 'font-weight': 700, fill: WARN }); } }

    if (k === 0) { const used = E(u, 0.4, 1.2);
      el('rect', { x: mxl, y: 130, width: 280, height: 40, rx: 6, fill: SOFT, stroke: GRID }); el('rect', { x: mxl, y: 130, width: 280 * used, height: 40, rx: 6, fill: ACC, opacity: 0.85 });
      tx(mxl + 10, 156, '데이터 ≤ 8GB', { 'font-size': 14, 'font-weight': 700, fill: PANEL, opacity: fade(u, 1.0) });
      el('rect', { x: mxl + 290, y: 130, width: 200, height: 40, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.3) });
      tx(mxl + 390, 156, 'fork 여유 (CoW)', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
      pill(mxl + 120, 220, 'maxmemory-policy allkeys-lru', ACC, pop(u, 1.9), { mono: true, fs: 13.5 });
      sub(480, 300, rdbPart ? rdbPart.desc : '', fade(u, 0.6), { 'font-size': 14 }); }

    if (k === 1) { [['3600', '1'], ['300', '100'], ['60', '10000']].forEach(([s, n], i) => { const cx = 120 + i * 260, sc = pop(u, 0.3 + i * 0.35);
        clock(cx - 50, 250, 30, E(u, 0.5 + i * 0.35, 1.6 + i * 0.35), ACC);
        mono(cx - 6, 244, 'save ' + s, { 'font-size': 15, 'font-weight': 800, opacity: clamp(sc) }); tx(cx - 6, 268, '변경 ' + n + '번↑', { 'font-size': 14, fill: MUT, opacity: clamp(sc) }); });
      sub(480, 330, '트래픽이 많든 적든 하나는 걸린다', fade(u, 1.9), { 'font-weight': 700, 'font-size': 14.5, fill: INK }); }

    if (k === 2) { pill(160, 230, 'appendfsync everysec', ACC, pop(u, 0.3), { mono: true, fs: 14 });
      pill(470, 230, 'auto-aof-rewrite 100% / 64mb', ACC, pop(u, 0.6), { mono: true, fs: 14 });
      sub(480, 300, aofPart ? aofPart.desc + ' — 그대로 크다' : '', fade(u, 1.9), { fill: WARN, 'font-weight': 700, 'font-size': 14.5 }); }

    if (k === 3) { // 복구: 앞은 통째로, 뒤는 재생
      tx(30, 214, '복구할 때', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.4) });
      const bx = 150; el('rect', { x: bx, y: 232, width: 400, height: 40, rx: 6, fill: SOFT, opacity: fade(u, 1.4) });
      el('rect', { x: bx, y: 232, width: 320 * E(u, 1.6, 1.9), height: 40, rx: 6, fill: OFF });
      if (u > 1.9) tx(bx + 160, 258, 'base.rdb 통째로 로드', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
      for (let i = 0; i < 6; i++) { const on = u > 2.0 + i * 0.08; if (on) el('rect', { x: bx + 324 + i * 13, y: 236, width: 9, height: 32, rx: 2, fill: WARN }); }
      if (u > 2.2) tx(bx + 362, 296, '재생', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN });
      pill(700, 252, 'aof-use-rdb-preamble yes', GOOD, pop(u, 0.2), { mono: true, fs: 13.5 }); }

    if (k === 4) { // Redis 7 multi-part AOF
      zone(40, 180, 560, 190, 'appendonlydir/', { fill: SOFT, color: INK });
      [['appendonly.aof.1.base.rdb', OFF, 'RDB 베이스'], ['appendonly.aof.1.incr.aof', WARN, 'base 이후 변경분'], ['appendonly.aof.manifest', INFO, '읽을 순서']].forEach(([n, col, d], i) => {
        const y = 230 + i * 44, s = pop(u, 0.3 + i * 0.4);
        el('rect', { x: 60, y: y - 16, width: 18, height: 22, rx: 3, fill: col, opacity: clamp(s) });
        mono(90, y, n, { 'font-size': 14.5, 'font-weight': 700, opacity: clamp(s) });
        tx(580, y, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.4) }); });
      grow(330, 318, 330, 246, E(u, 1.9, 2.4), INFO, { dash: '5 4' }); pill(760, 280, 'Redis 7+', INFO, pop(u, 0.2), { fs: 14 }); }

    if (k === 5) { // latency 그래프
      const gx = 60, gy = 200, gw = 560, gh = 130; el('line', { x1: gx, y1: gy + gh, x2: gx + gw, y2: gy + gh, stroke: INK, 'stroke-width': 2 }); el('line', { x1: gx, y1: gy, x2: gx, y2: gy + gh, stroke: INK, 'stroke-width': 2 });
      tx(gx + 6, gy - 8, '응답 시간', { 'font-size': 13.5, fill: MUT });
      el('rect', { x: gx + 200, y: gy, width: 180, height: gh, fill: WARN, opacity: 0.12 }); tx(gx + 290, gy + gh + 22, 'rewrite 중', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN });
      const p = E(u, 0.2, 1.4), ptsBad = [], ptsGood = [];
      for (let i = 0; i <= 56; i++) { const x = gx + i * 10; if (x > gx + gw * p) break; const inR = x > gx + 200 && x < gx + 380;
        ptsBad.push(`${x},${gy + gh - 18 - (inR ? 60 + 40 * Math.abs(Math.sin(i * 1.7)) : 0)}`); ptsGood.push(`${x},${gy + gh - 18 - (inR ? 6 : 0)}`); }
      if (ptsBad.length > 1) el('polyline', { points: ptsBad.join(' '), fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: 0.8 });
      if (ptsGood.length > 1 && u > 1.5) el('polyline', { points: ptsGood.join(' '), fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 1.5) });
      pill(780, 230, 'no-appendfsync-on-rewrite yes', GOOD, pop(u, 1.5), { mono: true, fs: 13.5 });
      tx(780, 290, '그 구간만 손실 위험 ↑', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) }); }

    if (k === 6) { terminal(30, 168, 520, 230, ['$ redis-cli CONFIG GET appendonly', '1) "appendonly"  2) "yes"', '$ redis-cli CONFIG GET aof-use-rdb-preamble', '1) "aof-use-rdb-preamble"  2) "yes"', '$ redis-cli INFO persistence', 'aof_enabled:1'], lerp(0, 6, E(u, 0.2, 1.8)), { fs: 13.5 });
      el('path', { d: 'M760,220 h110 l-14,90 h-82 Z', fill: INFOBG(), stroke: INFO, 'stroke-width': 2.2, opacity: fade(u, 1.6) });
      tx(815, 268, 'S3', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      fly(620, 200, 815, 260, seg(u, 1.9, 2.7), 'dump.rdb', { mono: true, fill: GOOD });
      sub(815, 340, '매일 새벽 복사', fade(u, 1.8), { 'font-weight': 700 }); } }
  function INFOBG() { return C.INFOBG; }
  function person(cx, cy, name) { return R.person(cx, cy, name, {}); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: 'RDB 만 쓰는 Redis 가 갑자기 죽으면, 재시작 후 어떤 데이터가 사라지나?',
      o: ['마지막 snapshot 이후에 들어온 쓰기', '전부 — dump.rdb 가 깨진다', '없다 — fork 한 자식이 실시간으로 저장한다'], a: 0,
      why: 'RDB 는 주기적으로 메모리 전체를 찍는 "사진"이다. 마지막 snapshot 이후의 쓰기(예: 320초의 key3)는 파일에 없어 사라진다.' },
    { q: 'AOF 의 fsync 정책 everysec 을 고르면 데이터 손실은 최대 얼마인가?',
      o: ['없다', '최대 1초', '마지막 rewrite 이후 전부'], a: 1,
      why: 'everysec 은 1초마다 디스크에 동기화하므로 손실은 최대 1초, 성능 영향은 약 -5% 다. always 는 느리고 no 는 위험해서 everysec 이 균형점이다.' },
    { q: '5분 주기 snapshot 으로 12:00 에 저장하고 12:05 에 죽었다. RDB 로 재시작하면 어떻게 되나?',
      o: ['12:05 직전 상태까지 모두 돌아온다', '명령을 하나씩 재생하느라 AOF 보다 느리게 돌아온다', '12:00 상태로 빠르게 돌아오고, 12:01~12:05 쓰기는 사라진다'], a: 2,
      why: 'RDB 로딩은 단순 deserialize 라 1GB 면 15초 만에 12:00 시점이 통째로 돌아온다. 대신 손실 구간은 snapshot 주기인 5분이다.' },
    { q: 'BGREWRITEAOF 는 3GB 로 자란 AOF 를 어떻게 줄이나?',
      o: ['지금 메모리 상태를 만드는 최소 명령으로 새 파일을 써서 교체한다', '오래된 명령부터 잘라 버린다', '파일을 gzip 으로 압축해 둔다'], a: 0,
      why: '이력이 아니라 결과만 남기므로 3GB 가 300MB 로 준다. 새 파일을 다 쓴 다음 한 번에 바꿔치기해 중간에 끊겨도 기존 파일은 멀쩡하다.' },
    { q: 'aof-use-rdb-preamble yes(혼합 모드)를 켜면 복구가 어떻게 달라지나?',
      o: ['AOF 를 끄고 RDB 만으로 복구한다', 'RDB 파일과 AOF 파일을 각각 처음부터 재생한다', '앞부분은 RDB 로 통째로 읽고, 뒤의 변경분만 명령을 재생한다'], a: 2,
      why: '혼합 모드에서 AOF 는 base.rdb + incr.aof 로 이뤄진다. 앞은 RDB 속도로, 뒤는 AOF 안전성으로 복구하며 예시에서 파일도 2500MB 에서 1000MB 로 줄었다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'RDB는 메모리 전체를 주기적으로 찍는다. 복구는 빠르지만 마지막 snapshot 뒤의 쓰기는 잃는다.',
    'AOF는 모든 쓰기를 파일 끝에 붙인다. everysec이면 손실은 최대 1초, 성능은 5% 정도 준다.',
    'AOF는 쓰기 횟수만큼 자라고 재생이 느리다. BGREWRITEAOF로 최소 명령만 남겨 줄인다.',
    '캐시 전용이면 RDB로 충분하다. 영속 데이터는 AOF를 같이 켜고 RDB preamble로 복구를 당긴다.',
  ];
  const review = [
    { q: '세션과 분산 락을 담은 Redis를 5분 주기 RDB로만 운영하다 장애가 났다. 무엇이 문제인가?',
      o: ['RDB 로딩이 명령 재생이라 복구가 너무 느리다', '다시 만들 수 없는 데이터인데 최대 5분 치 쓰기를 잃는다', 'BGSAVE가 메인 스레드를 멈춰 장애를 일으켰다'], a: 1,
      why: 'RDB의 손실 구간은 snapshot 주기만큼이다. 캐시는 miss로 다시 채우면 되지만 세션과 락은 되살릴 수 없어 AOF를 같이 켠다.' },
    { q: 'BGSAVE나 AOF rewrite가 돌 때마다 응답 시간이 튄다. 먼저 의심할 것은?',
      o: ['fork로 디스크가 붐벼 fsync가 밀린다', 'RDB 압축이 꺼져 있다', 'LASTSAVE를 너무 자주 부른다'], a: 0,
      why: 'fork 중 디스크가 바쁘면 fsync가 1초를 넘기고 그동안 메인 스레드가 멈춘다. no-appendfsync-on-rewrite로 그 구간만 fsync를 쉬게 할 수 있다.' },
    { q: 'RAM을 거의 다 maxmemory로 잡은 서버가 쓰기가 몰릴 때 BGSAVE를 하다 메모리 부족으로 죽는다. 이유는?',
      o: ['RDB 파일이 메모리보다 커서 디스크에 다 못 써서', 'AOF가 꺼져 있어 RDB가 혼자 일을 떠맡아서', '저장 중 쓰인 페이지가 복사되어 메모리가 더 필요해서'], a: 2,
      why: 'fork 뒤에는 copy-on-write로 바뀐 페이지만 복사되므로 쓰기가 많으면 메모리가 최대 2배까지 는다. 그래서 상한을 정할 때 fork 여유를 남긴다.' },
  ];

  R.page({ title: '디스크 기록 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
