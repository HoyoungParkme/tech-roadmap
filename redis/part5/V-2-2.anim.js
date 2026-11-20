/* V-2-2 운영 출항 점검표 (4축 × 12항목) — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, redisBox, person, cross, check, lock, clock, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 공통: 왼쪽 점검판 + 위쪽 새 항목 목록 ----------
  const AXN = { m: 'Memory', p: 'Persistence', s: 'Security', o: 'Observability' };
  const ids = (b) => (b && b.checks ? b.checks.map((x) => x.id) : []);
  const fresh = (c) => { const p = ids(c.prev); return c.beat.checks.filter((x) => p.indexOf(x.id) < 0); };
  function board(c, L, row) { const { u, beat } = c, on = ids(beat), nw = fresh(c).map((x) => x.id);
    tx(30, 36, AXN[L] + ' 축', { 'font-size': 17, 'font-weight': 800 });
    mono(290, 36, on.length + ' / 12', { 'font-size': 16, 'font-weight': 800, fill: on.length === 12 ? GOOD : ACC, 'text-anchor': 'end' });
    for (let i = 0; i < 12; i++) { const id = L + (i + 1), x = 30 + (i % 3) * 90, y = 52 + Math.floor(i / 3) * 54, n = nw.indexOf(id), has = on.indexOf(id) >= 0;
      el('rect', { x, y, width: 84, height: 46, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' });
      if (!has) { mono(x + 42, y + 29, id, { 'font-size': 15, 'text-anchor': 'middle', fill: OFF }); continue; }
      const g = G(x + 42, y + 23, n >= 0 ? pop(u, 0.2 + n * 0.2) : 1);
      el('rect', { x: -42, y: -23, width: 84, height: 46, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': n >= 0 ? 2.8 : 2 }, g);
      el('path', { d: 'M-30,0 L-24,6 L-14,-6', fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      mono(10, 6, id, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }, g); }
    const cum = tween(c.prev ? c.prev.cumulative : null, beat.cumulative, u);
    tx(30, 296, '누적', { 'font-size': 15, 'font-weight': 700, fill: MUT }); mono(290, 296, Math.round(cum) + ' / 48', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end' });
    for (let r = 0; r < 4; r++) { mono(30, 325 + r * 22, 'MPSO'[r], { 'font-size': 13.5, 'font-weight': 700, fill: r === row ? ACC : MUT });
      for (let j = 0; j < 12; j++) { const f = r * 12 + j < cum; el('rect', { x: 50 + j * 20, y: 312 + r * 22, width: 16, height: 16, rx: 3, fill: f ? (r === row ? ACC : OFF) : PANEL, stroke: f ? 'none' : GRID, 'stroke-width': 1.2 }); } } }
  function newList(c) { fresh(c).forEach((ch, i) => { const y = 40 + i * 25, op = fade(c.u, 0.2 + i * 0.2);
    check(346, y - 5, 7, op); mono(362, y, ch.id, { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: op });
    tx(406, y, ch.text, { 'font-size': 14.5, opacity: op }); }); }
  const cmd = (y, lines, u, w) => terminal(340, y, w || 590, 40 + lines.length * 22 + 6, lines, Math.max(0.2, Math.min(lines.length, E(u, 0.1, 0.4 + lines.length * 0.3) * lines.length)));
  function doc(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-22,-28 H10 L22,-16 V28 H-22 Z', fill: PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M10,-28 V-16 H22', fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    [-6, 4, 14].forEach((y) => el('line', { x1: -12, y1: y, x2: 12, y2: y, stroke: OFF, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g));
    if (name) tx(0, 48, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  function keyCell(x, y, w, name, o) { o = o || {}; const g = G(x + w / 2, y + 13, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -13, width: w, height: 26, rx: 5, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 1.8 }, g);
    mono(-w / 2 + 10, 5, name, { 'font-size': 13.5, 'font-weight': 600, fill: o.color || INK }, g); return g; }

  // =====================================================================
  // 1. Memory
  function s1(t, c) { const { k, u } = c; board(c, 'm', 0); newList(c);
    if (k === 0) { cmd(140, ['$ redis-cli CONFIG GET maxmemory', '$ redis-cli CONFIG GET maxmemory-policy'], u);
      const x0 = 360, W = 560, y = 290, op = fade(u, 0.9);
      tx(x0, y - 12, '인스턴스 RAM', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: op });
      el('rect', { x: x0, y, width: W, height: 40, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      el('rect', { x: x0, y, width: W * 0.75 * E(u, 1.0, 1.6), height: 40, rx: 6, fill: ACC, opacity: 0.8 });
      el('rect', { x: x0 + W * 0.7, y: y - 6, width: W * 0.1, height: 52, fill: ACC, opacity: 0.18 * fade(u, 1.5) });
      el('line', { x1: x0 + W * 0.75, y1: y - 10, x2: x0 + W * 0.75, y2: y + 50, stroke: ACC, 'stroke-width': 3, opacity: fade(u, 1.5) });
      tx(x0 + W * 0.75, y - 16, 'maxmemory = RAM 의 70~80%', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      [['allkeys-lru', GOOD], ['allkeys-lfu', GOOD], ['volatile-*', GOOD], ['noeviction', BAD]].forEach(([s, col], i) => { const x = 422 + i * 150, sc = pop(u, 1.8 + i * 0.15);
        pill(x, 380, s, col, sc, { mono: true, fs: 14 }); if (i === 3) el('line', { x1: x - 54, y1: 380, x2: x + 54, y2: 380, stroke: BAD, 'stroke-width': 2.5, opacity: sc > 0.5 ? 1 : 0 }); }); return; }
    if (k === 1) { // 상한에 닿으면
      const keys = ['cache:old', 'cache:user:2', 'cache:post:7', 'session:3', 'cache:feed'];
      [[475, 'noeviction', BAD], [805, 'allkeys-lru', GOOD]].forEach(([cx, name, col], j) => { const x = cx - 115;
        lbl(cx, 112, name, fade(u, 0.1 + j * 0.2), { class: 'mono', fill: col });
        el('rect', { x, y: 166, width: 230, height: 166, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
        el('line', { x1: x - 6, y1: 170, x2: x + 236, y2: 170, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
        keys.forEach((kname, i) => { let y = 300 - i * 30, op = 1, dx = 0;
          if (j === 1 && i === 0) { dx = 80 * E(u, 1.0, 1.6); op = 1 - seg(u, 1.0, 1.6); }
          if (j === 1 && i > 0) y += 30 * E(u, 1.4, 1.8);
          if (op > 0.02) keyCell(x + 15 + dx, y, 200, kname + (j === 1 && i === 0 ? '  (LRU)' : ''), { op, stroke: j === 1 && i === 0 ? WARN : INK }); });
        fly(cx, 128, cx, 158, seg(u, 0.4 + j * 0.2, 1.0 + j * 0.2), 'SET new v', { mono: true, fill: INK }); });
      if (u > 1.0) cross(475, 146, 13, pop(u, 1.0));
      keyCell(705, 180, 200, 'new', { s: pop(u, 1.9), stroke: ACC, fill: ACCBG, color: ACC });
      sub(475, 356, 'SET 거절 · GET 은 그대로 된다', fade(u, 1.2), { fill: BAD, 'font-weight': 700 });
      sub(805, 356, '오래 안 쓴 키를 지우고 받는다', fade(u, 2.0), { fill: GOOD, 'font-weight': 700 });
      mono(360, 394, "(error) OOM command not allowed when used memory > 'maxmemory'.", { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.4) }); return; }
    if (k === 2) { cmd(140, ['$ redis-cli --scan --pattern "cache:*"'], u);
      const ks = [['cache:user:1', 1], ['cache:user:2', -1], ['cache:post:7', 1], ['cache:post:9', 1], ['cache:feed:3', -1], ['cache:rank', 1]];
      ks.forEach(([n, ttl], i) => { const x = i < 3 ? 350 : 570, y = 230 + (i % 3) * 50, a = 0.6 + i * 0.25, scanned = u > a;
        el('rect', { x, y, width: 200, height: 38, rx: 6, fill: PANEL, stroke: scanned ? ACC : GRID, 'stroke-width': scanned ? 2.2 : 1.5 });
        mono(x + 10, y + 24, n, { 'font-size': 14, 'font-weight': 600 });
        if (ttl > 0) clock(x + 180, y + 19, 10, 0.65, WARN); else mono(x + 190, y + 24, '-1', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
        if (ttl < 0) fly(x + 180, y + 19, 772, 290, seg(u, a + 0.2, a + 0.8), '-1', { mono: true, fill: BAD }); });
      card(860, 290, 130, 70, { rx: 10, stroke: WARN, sw: 2.5, text: 'TTL = -1\n| wc -l', fs: 14.5, mono: true, color: WARN, s: pop(u, 0.4) });
      sub(635, 400, 'SCAN 으로 조금씩 훑는다 — KEYS 가 아니라서 운영 중에도 안전', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { pill(635, 152, 'TTL 누락 키 발견 → 코드 점검', WARN, pop(u, 0.2), { fs: 14.5 });
      [[262, '같은 TTL 로 저장한 키 12개', false], [354, 'TTL + 랜덤 (jitter)', true]].forEach(([y, name, jit], r) => { const a = 0.6 + r * 0.8;
        tx(400, y - 32, name, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, a) });
        el('line', { x1: 400, y1: y, x2: 910, y2: y, stroke: GRID, 'stroke-width': 3, opacity: fade(u, a) });
        tx(400, y + 22, '저장', { 'font-size': 13.5, fill: MUT, opacity: fade(u, a) }); tx(910, y - 32, '만료 시각 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, a) });
        for (let i = 0; i < 12; i++) { const ex = jit ? 640 + ((i * 7) % 12) * 18 : 800, g = E(u, a + 0.1 + i * 0.03, a + 0.6 + i * 0.03);
          if (!jit) el('rect', { x: 794, y: y - 5 - (i + 1) * 4.5 * g, width: 14, height: 4, fill: BAD });
          else el('rect', { x: ex, y: y - 14 * g, width: 8, height: 14 * g, rx: 2, fill: GOOD }); }
        sub(jit ? 740 : 800, y + 22, jit ? '흩어져 만료' : '한꺼번에 만료 → DB 로 몰림', fade(u, a + 0.7), { fill: jit ? GOOD : BAD, 'font-weight': 700 }); }); return; }
    if (k === 4) { cmd(140, ['$ redis-cli --bigkeys'], u);
      const ks = [['user:1', 'string', 0.04], ['cache:post:7', 'string', 0.06], ['session:3', 'hash', 0.05], ['leaderboard', 'zset', 1]];
      ks.forEach(([n, ty, f], i) => { const y = 242 + i * 34, a = 0.6 + i * 0.3, big = f === 1;
        mono(350, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, fill: big ? BAD : INK, opacity: fade(u, a) });
        mono(480, y + 5, ty, { 'font-size': 13.5, fill: MUT, opacity: fade(u, a) });
        el('rect', { x: 540, y: y - 11, width: Math.max(4, 380 * f * E(u, a, a + 0.6)), height: 22, rx: 4, fill: big ? BAD : ACC, opacity: 0.85 });
        if (big) tx(910, y + 5, '수백 MB', { 'font-size': 14.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'end', opacity: fade(u, a + 0.6) }); });
      pill(635, 388, '이 키 하나 지우는 동안 서버가 멈춘다 → UNLINK', BAD, pop(u, 2.2), { fs: 14 }); return; }
    if (k === 5) { cmd(140, ['$ redis-cli --hotkeys'], u);
      for (let i = 0; i < 9; i++) { const sx = 400 + i * 60; el('circle', { cx: sx, cy: 228, r: 5, fill: OFF, opacity: fade(u, 0.3) });
        const to = i % 4 === 3 ? (i < 4 ? 420 : 820) : 620; dot([[sx, 234], [to, 262]], ((t * 0.8 + i * 0.13) % 1) * (u > 0.6 ? 1 : 0), to === 620 ? BAD : ACC, 5); }
      [[420, 'shard 1', GOOD], [620, 'shard 2', BAD], [820, 'shard 3', GOOD]].forEach(([x, n, col], i) => server(x, 304, n, { lamp: col, stroke: i === 1 ? BAD : INK, s: pop(u, 0.2 + i * 0.15) }));
      pill(620, 396, 'product:1 한 키에 몰린다', BAD, pop(u, 1.6), { mono: false, fs: 14 }); return; }
    if (k === 6) { cmd(140, ['$ redis-cli INFO memory | grep mem_fragmentation_ratio'], u);
      mono(350, 248, 'used_memory', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5) });
      el('rect', { x: 540, y: 232, width: 250 * E(u, 0.5, 1.0), height: 22, rx: 4, fill: ACC, opacity: 0.85 });
      mono(350, 292, 'used_memory_rss', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.9) });
      for (let i = 0; i < 9; i++) { const w = 36, x = 540 + i * 42, g = E(u, 0.9 + i * 0.05, 1.3 + i * 0.05); el('rect', { x, y: 276, width: w * g, height: 22, rx: 3, fill: i % 3 === 1 ? OFF : WARN, opacity: 0.85 }); }
      tx(920, 270, 'ratio = rss / used', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      const sx = (v) => 380 + (v - 0.6) / 1.4 * 520, y = 334, so = fade(u, 1.6);
      [[0.6, 1.0, BAD, '스왑 (더 나쁨)'], [1.0, 1.5, GOOD, '정상'], [1.5, 2.0, BAD, '단편화']].forEach(([a, b, col, n]) => { el('rect', { x: sx(a), y, width: sx(b) - sx(a) - 3, height: 14, rx: 3, fill: col, opacity: 0.75 * so });
        tx((sx(a) + sx(b)) / 2, y + 36, n, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: so }); });
      [1.0, 1.5].forEach((v) => mono(sx(v), y - 6, v.toFixed(1), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: so }));
      mono(350, 404, '1.5 넘으면 MEMORY PURGE 또는 재시작 고려', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k7 나머지는 알람과 리뷰로
    const nw = fresh(c).map((x) => x.id);
    [[482, 'Prometheus 알람 (상시)', ['used/max > 0.9 → critical', 'rate(evicted[5m]) > 100'], ['m11', 'm12'], INFO],
     [787, '코드 리뷰', ['user:{id}:profile', 'String 여러 개 → Hash'], ['m8', 'm9'], WARN]].forEach(([cx, title, lines, mv, col], j) => { const a = 0.9 + j * 0.3;
      card(cx, 250, 285, 150, { rx: 10, stroke: col, sw: 2.2, s: pop(u, a) });
      tx(cx - 128, 244, title, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, a + 0.1) });
      lines.forEach((s, i) => mono(cx - 128, 282 + i * 26, s, { 'font-size': 13.5, opacity: fade(u, a + 0.8 + i * 0.15) }));
      mv.forEach((id, i) => { const li = nw.indexOf(id); fly(380, 35 + li * 25, cx - 100 + i * 60, 202, seg(u, a + 0.2 + i * 0.15, a + 0.8 + i * 0.15), id, { mono: true, stay: true, fill: col }); }); });
    banner(635, 382, 'Memory 12 / 12', pop(u, 2.2)); }

  // =====================================================================
  // 2. Persistence
  function s2(t, c) { const { k, u } = c; board(c, 'p', 1); newList(c);
    if (k === 0) { cmd(110, ['$ redis-cli CONFIG GET save', '1) "save"', '2) "3600 1"'], u);
      redisBox(430, 310, { w: 140, h: 60, sub: '메모리', s: pop(u, 0.8) });
      grow(502, 310, 750, 310, E(u, 1.1, 1.7), ACC); fly(510, 310, 740, 310, seg(u, 1.1, 1.8), '스냅샷', {});
      doc(800, 304, 'dump.rdb', { s: pop(u, 1.7), stroke: ACC });
      tx(625, 290, '3600초 안에 1번 이상 바뀌면', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(635, 400, 'save 가 비어 있으면 스냅샷을 아예 안 뜬다', fade(u, 2.1), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 1) { cmd(110, ['$ redis-cli CONFIG GET appendonly', '$ redis-cli CONFIG GET appendfsync'], u);
      redisBox(410, 300, { w: 120, h: 56, s: pop(u, 0.6) });
      if (u > 0.9) for (let i = 0; i < 4; i++) dot([[472, 300], [590, 300]], (t * 0.8 + i / 4) % 1, ACC, 5);
      doc(630, 294, 'appendonly.aof', { s: pop(u, 0.8), stroke: ACC });
      sub(630, 372, '쓰기 명령을 한 줄씩 덧붙인다', fade(u, 1.1));
      [['always', '매번 fsync · 느림', INK], ['everysec', '최대 1초 손실', GOOD], ['no', 'OS 에 맡김 · 위험', BAD]].forEach(([n, d, col], i) => { const y = 228 + i * 56, s = pop(u, 1.3 + i * 0.25);
        card(832, y, 190, 46, { rx: 10, stroke: col, sw: i === 1 ? 3 : 1.8, s, fill: i === 1 ? C.GOODBG : PANEL });
        mono(748, y - 3, n, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: s > 0.5 ? 1 : 0 }); tx(748, y + 16, d, { 'font-size': 13.5, fill: MUT, opacity: s > 0.5 ? 1 : 0 }); }); return; }
    if (k === 2) { tx(360, 162, 'appendonly.aof — 혼합 모드', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) });
      el('rect', { x: 360, y: 176, width: 220 * E(u, 0.4, 0.9), height: 40, rx: 6, fill: ACC, opacity: 0.85 });
      tx(470, 201, 'RDB preamble', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: PANEL, opacity: fade(u, 0.8) });
      el('rect', { x: 584, y: 176, width: 300 * E(u, 0.8, 1.2), height: 40, rx: 6, fill: SOFT, stroke: INK, 'stroke-width': 1.5 });
      tx(734, 201, '그 뒤 AOF 명령', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.1) });
      sub(470, 236, '빠르게 통째 로드', fade(u, 1.0)); sub(734, 236, '마지막 변경만 재실행', fade(u, 1.2));
      tx(360, 284, 'BGREWRITEAOF — 다시 써서 줄인다', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.4) });
      const nw = lerp(520, 240, E(u, 1.6, 2.3));
      el('rect', { x: 360, y: 298, width: 520, height: 26, rx: 5, fill: 'none', stroke: OFF, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: fade(u, 1.5) });
      el('rect', { x: 360, y: 298, width: nw, height: 26, rx: 5, fill: WARN, opacity: 0.75 * fade(u, 1.5) });
      mono(360 + nw + 10, 316, nw < 300 ? '새 파일' : '', { 'font-size': 14, 'font-weight': 700, fill: WARN });
      tx(360, 356, '다시 쓰는 동안 옛 파일 + 새 파일 → 디스크 두 배', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
      mono(360, 386, 'no-appendfsync-on-rewrite yes', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.4) }); return; }
    if (k === 3) { const MX = 520, MY = 300, RX = 820;
      grow(MX + 58, MY, RX - 58, MY, E(u, 0.6, 1.0), ACC, { plain: true }); if (u > 1.0) dot([[MX + 58, MY], [RX - 58, MY]], (t * 0.7) % 1, ACC, 5);
      server(MX, MY, 'master', { lamp: GOOD, s: pop(u, 0.3) }); server(RX, MY, 'replica', { lamp: GOOD, s: pop(u, 0.6) });
      [430, 660, 880].forEach((x, i) => { const s = pop(u, 1.1 + i * 0.2);
        el('line', { x1: x, y1: 194, x2: MX, y2: MY - 42, stroke: INFO, 'stroke-width': 1.6, 'stroke-dasharray': '4 4', opacity: s > 0.5 ? 1 : 0 });
        card(x, 180, 104, 32, { rx: 16, text: 'Sentinel ' + (i + 1), fs: 13.5, stroke: INFO, color: INFO, s }); });
      tx(660, 140, '3개 이상 · 과반이 동의해야 failover', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) });
      pill(MX, 396, 'min-replicas-to-write 1', ACC, pop(u, 2.2), { mono: true, fs: 14 }); return; }
    if (k === 4) { mono(340, 160, '0 4 * * * root /usr/local/bin/redis-backup.sh', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      const cx = 440, cy = 290, r = 62, f = E(u, 0.4, 1.4);
      el('circle', { cx, cy, r, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; el('line', { x1: cx + Math.sin(a) * (r - 8), y1: cy - Math.cos(a) * (r - 8), x2: cx + Math.sin(a) * (r - 2), y2: cy - Math.cos(a) * (r - 2), stroke: MUT, 'stroke-width': 2 }); }
      const ha = f * (4 / 12) * Math.PI * 2; el('line', { x1: cx, y1: cy, x2: cx + Math.sin(ha) * 34, y2: cy - Math.cos(ha) * 34, stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' });
      el('line', { x1: cx, y1: cy, x2: cx, y2: cy - 50, stroke: INK, 'stroke-width': 2.5, 'stroke-linecap': 'round' });
      lbl(cx, cy + r + 26, '매일 04:00', fade(u, 1.3), { class: 'mono' });
      zone(600, 196, 330, 170, 'prod 서버 디스크', { stroke: GRID, op: fade(u, 1.4) });
      server(690, 290, null, { s: pop(u, 1.5) }); grow(750, 290, 790, 290, E(u, 1.7, 2.0), ACC); doc(840, 284, 'dump.rdb', { s: pop(u, 1.9) });
      pill(765, 398, '같은 서버 디스크에만 있다', WARN, pop(u, 2.3), { fs: 14 }); return; }
    if (k === 5) { cmd(110, ['$ redis-cli BGSAVE', '$ sleep 30', '$ aws s3 cp dump.rdb s3://my-backup/redis/$DATE.rdb'], u);
      const gone = fade(u, 2.0); zone(350, 250, 230, 150, 'prod 서버', { stroke: GRID, op: 1 - 0.6 * gone });
      doc(465, 330, 'dump.rdb', { s: pop(u, 0.9), op: 1 - 0.6 * gone }); if (gone > 0) cross(465, 320, 30, pop(u, 2.0));
      fly(490, 320, 790, 330, seg(u, 1.1, 1.8), '$DATE.rdb', { mono: true });
      el('path', { d: 'M700,268 H900 L880,394 H720 Z', fill: C.INFOBG, stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.7) });
      mono(800, 258, 's3://my-backup/redis/', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      if (u > 1.8) card(800, 330, 130, 30, { rx: 6, text: '$DATE.rdb', fs: 13.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.8) });
      sub(800, 384, '서버가 사라져도 남는다', fade(u, 2.3), { fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 6) { const steps = ['Staging 환경 준비', 'dump.rdb 삭제', 'AOF 손상 시뮬레이션', 'redis-server 시작', '복구 시간 측정 (RTO)', '데이터 일치 확인 (RPO)', '결과 문서화'];
      el('rect', { x: 360, y: 128, width: 560, height: 276, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.1) });
      tx(384, 158, 'Game Day 시나리오', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      steps.forEach((s, i) => { const y = 192 + i * 30, a = 0.4 + i * 0.25; mono(390, y, (i + 1) + '.', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, a) });
        tx(418, y, s, { 'font-size': 14.5, opacity: fade(u, a), 'font-weight': i === 4 || i === 5 ? 700 : 400 }); });
      tx(900, 158, '있다 ≠ 복구된다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 2.3) }); return; }
    if (k === 7) { const x0 = 380, x1 = 900;
      el('line', { x1: x0, y1: 150, x2: x1, y2: 150, stroke: GRID, 'stroke-width': 3 });
      for (let i = 0; i < 7; i++) { const x = lerp(x0, x1, i / 6), on = u > 0.2 + i * 0.22; el('circle', { cx: x, cy: 150, r: 13, fill: on ? ACC : PANEL, stroke: on ? ACC : GRID, 'stroke-width': 2 });
        mono(x, 155, String(i + 1), { 'font-size': 13.5, 'font-weight': 800, fill: on ? PANEL : MUT, 'text-anchor': 'middle' }); }
      const y = 300, A = 470, B = 690, Cc = 860, op = fade(u, 1.2);
      el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: INK, 'stroke-width': 2.5, opacity: op });
      [[A, '마지막 백업', ACC], [B, '장애', BAD], [Cc, '복구 완료', GOOD]].forEach(([x, n, col], i) => { const s = pop(u, 1.3 + i * 0.25);
        el('circle', { cx: x, cy: y, r: 9 * s, fill: col }); tx(x, y + 30, n, { 'font-size': 14.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: s > 0.5 ? 1 : 0 }); });
      const ro = fade(u, 2.0); el('path', { d: `M${A},${y - 16} V${y - 24} H${B} V${y - 16}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: ro });
      tx((A + B) / 2, y - 34, 'RPO = 잃은 데이터 구간', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: ro });
      const to = fade(u, 2.3); el('path', { d: `M${B},${y + 46} V${y + 54} H${Cc} V${y + 46}`, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: to });
      tx((B + Cc) / 2, y + 76, 'RTO = 복구 시간', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: to });
      tx(380, 400, '둘 다 숫자로 문서에 남긴다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.5) }); return; }
    // k8 replica lag 알람
    const x0 = 540, W = 360;
    mono(526, 190, 'master_repl_offset', { 'font-size': 14, 'text-anchor': 'end', opacity: fade(u, 0.3) });
    mono(526, 236, 'replica offset', { 'font-size': 14, 'text-anchor': 'end', opacity: fade(u, 0.5) });
    el('rect', { x: x0, y: 176, width: W * E(u, 0.3, 1.0), height: 22, rx: 4, fill: ACC, opacity: 0.85 });
    el('rect', { x: x0, y: 222, width: W * 0.62 * E(u, 0.5, 1.2), height: 22, rx: 4, fill: INFO, opacity: 0.75 });
    const bo = fade(u, 1.4); el('path', { d: `M${x0 + W * 0.62},${256} V${264} H${x0 + W} V${256}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: bo });
    tx(x0 + W * 0.81, 286, '뒤처짐 > 10초 → 알람', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: bo });
    banner(635, 362, 'Persistence 12 / 12 · 누적 24 / 48', pop(u, 2.0)); }

  // =====================================================================
  // 3. Security — 겹겹이 두른 벽
  const LX = 745, LY = 290, LAY = [[370, 220, 'VPC · 방화벽 6379 차단'], [296, 172, 'bind private · protected-mode'], [222, 124, 'AUTH requirepass'], [150, 80, 'ACL']];
  function layers(c, n) { const { k, u } = c;
    LAY.forEach(([w, h, name], i) => { if (i >= n) return; const isNew = i === n - 1 && k === i, s = isNew ? E(u, 0.3, 0.9) : 1;
      el('rect', { x: LX - w / 2 * s, y: LY - h / 2 * s, width: w * s, height: h * s, rx: 14, fill: i % 2 ? PANEL : SOFT, stroke: isNew ? ACC : GRID, 'stroke-width': isNew ? 2.8 : 1.8 });
      tx(LX - w / 2 + 12, LY - h / 2 + 17, name, { 'font-size': 13.5, 'font-weight': 700, fill: isNew ? ACC : MUT, opacity: isNew ? fade(u, 0.8) : 1 }); });
    redisBox(LX, LY + 8, { w: 96, h: 38, s: 1 });
    if (k >= 5) { lock(LX + 50, LY - 26, true, ACC, k === 5 ? pop(u, 1.6) : 1); } }
  function s3(t, c) { const { k, u } = c; board(c, 's', 2); newList(c); layers(c, Math.min(4, k + 1));
    if (k === 0) { cmd(98, ['$ timeout 3 redis-cli -h $PUBLIC_IP ping'], u);
      person(400, 300, '외부 IP', { stroke: BAD, s: pop(u, 0.5) });
      const p = seg(u, 0.9, 1.6), back = seg(u, 1.6, 2.0); if (p > 0 && back < 1) el('circle', { cx: back > 0 ? lerp(556, 430, back) : lerp(430, 556, p), cy: 290, r: 7, fill: BAD });
      if (u > 1.6) cross(562, 290, 10, pop(u, 1.6));
      pill(450, 380, 'Connection refused', BAD, pop(u, 2.0), { mono: true, fs: 14 }); return; }
    if (k === 1) { [['bind 0.0.0.0', BAD, true], ['bind <private IP>', GOOD], ['protected-mode yes', GOOD]].forEach(([s, col, x], i) => { const y = 220 + i * 56, sc = pop(u, 0.9 + i * 0.3);
        pill(442, y, s, col, sc, { mono: true, fs: 14 }); if (x) el('line', { x1: 380, y1: y, x2: 504, y2: y, stroke: BAD, 'stroke-width': 2.5, opacity: sc > 0.5 ? 1 : 0 }); });
      sub(442, 396, '컨테이너는 포트 publish 도 본다', fade(u, 2.1), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { mono(345, 196, 'CONFIG GET requirepass', { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.6) });
      pill(442, 236, '********', INK, pop(u, 1.0), { mono: true, fs: 15 }); sub(442, 270, '값은 찍지 않는다', fade(u, 1.2), { fill: BAD, 'font-weight': 700 });
      card(442, 334, 190, 56, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 1.6) }); lock(370, 334, true, INFO, pop(u, 1.6));
      tx(392, 340, 'Secret Manager', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) });
      grow(538, 334, 630, 300, E(u, 2.0, 2.4), INFO); return; }
    if (k === 3) { terminal(340, 186, 210, 152, ['> ACL LIST', 'user default …', 'user app ~cache:*', '> ACL WHOAMI', '"app"'], Math.max(0.2, 5 * E(u, 0.5, 1.8)), { fs: 13.5 });
      tx(445, 372, '한 줄뿐이면 권한 분리 안 함', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) }); return; }
    if (k === 4) { [['FLUSHALL', 230], ['KEYS', 300]].forEach(([n, y], i) => { const a = 0.6 + i * 0.4, s = pop(u, a);
        pill(395, y, n, BAD, s, { mono: true, fs: 14.5 }); el('line', { x1: 395 - tw(n, 14.5) / 2 - 6, y1: y, x2: 395 + tw(n, 14.5) / 2 + 6, y2: y, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, a + 0.5) });
        grow(452, y, 494, y, E(u, a + 0.4, a + 0.7), MUT); pill(520, y, '""', INK, pop(u, a + 0.7), { mono: true, fs: 14.5 }); });
      mono(345, 196, 'rename-command', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(345, 366, 'ACL: -@dangerous 도 같다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { [['app', 'Redis', 'tls-port · tls-cert-file', 220], ['master', 'replica', 'tls-replication yes', 320]].forEach(([a, b, lab, y], i) => { const at = 0.4 + i * 0.5;
        card(372, y, 64, 32, { rx: 8, text: a, fs: 13.5, mono: true, s: pop(u, at) }); card(510, y, 70, 32, { rx: 8, text: b, fs: 13.5, mono: true, s: pop(u, at) });
        el('line', { x1: 404, y1: y, x2: 475, y2: y, stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, at + 0.2) }); lock(440, y - 2, true, ACC, pop(u, at + 0.4));
        mono(442, y + 38, lab, { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, at + 0.5) }); });
      sub(442, 400, 'replication 빠지면 노드 사이 평문', fade(u, 2.1), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 6) { card(442, 250, 196, 104, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.4) });
      mono(358, 226, 'redis.crt', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.6) });
      mono(358, 252, 'x509 -enddate', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) });
      mono(358, 278, 'notAfter=…', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) });
      const x0 = 352, W = 180, y = 336, f = E(u, 1.2, 2.2); el('rect', { x: x0, y, width: W, height: 14, rx: 7, fill: SOFT, stroke: GRID, 'stroke-width': 1.2 });
      el('rect', { x: x0, y, width: W * (1 - f * 0.85), height: 14, rx: 7, fill: f > 0.6 ? WARN : GOOD });
      pill(442, 384, '만료 30일 전 → 갱신 알람', WARN, pop(u, 2.2), { fs: 13.5 }); return; }
    // k7 audit
    terminal(340, 150, 210, 130, ['audit: CONFIG SET', 'audit: FLUSHDB', 'audit: ACL SETUSER'], Math.max(0.2, 3 * E(u, 0.3, 1.4)), { fs: 13.5, title: 'proxy' });
    sub(445, 302, '큰 변경은 흔적을 남긴다', fade(u, 1.5), { 'font-weight': 700, fill: INK });
    banner(445, 372, 'Security 12 / 12', pop(u, 2.0)); }

  // =====================================================================
  // 4. Observability
  const N = { r: [395, 200], e: [525, 200], p: [660, 200], g: [850, 170], a: [850, 232] };
  function stack(k, u) { const ap = (i) => (k === i ? pop(u, 0.3) : 1);
    redisBox(N.r[0], N.r[1], { w: 96, h: 44, s: 1 });
    grow(445, 200, 466, 200, k === 0 ? E(u, 0.4, 0.7) : 1, MUT); card(N.e[0], N.e[1], 112, 44, { rx: 8, text: 'exporter', fs: 14, mono: true, s: ap(0) });
    grow(583, 200, 600, 200, k === 0 ? E(u, 0.8, 1.1) : 1, MUT); card(N.p[0], N.p[1], 116, 44, { rx: 8, text: 'Prometheus', fs: 14, s: k === 0 ? pop(u, 0.8) : 1 });
    if (k >= 1) { const s = k === 1 ? pop(u, 0.4) : 1, s2 = k === 1 ? pop(u, 0.8) : 1;
      grow(720, 192, 786, 172, k === 1 ? E(u, 0.3, 0.6) : 1, MUT); card(N.g[0], N.g[1], 124, 40, { rx: 8, text: 'Grafana', fs: 14, s });
      grow(720, 208, 786, 230, k === 1 ? E(u, 0.7, 1.0) : 1, MUT); card(N.a[0], N.a[1], 124, 40, { rx: 8, text: 'Alertmanager', fs: 14, s: s2 }); } }
  const RULES = [['RedisMemoryCritical', 'used / max > 0.9 · for 5m', 'o7'], ['RedisLowHitRate', 'hit rate < 0.8 · for 10m', 'o8'], ['RedisConnectionsHigh', 'clients / maxclients > 0.8', 'o9'],
    ['RedisLatencyHigh', 'p99 > 0.01s (10ms)', 'o10'], ['RedisRejectedConnections', 'rate(rejected[5m]) > 0', 'o11']];
  function vbar(x, y, h, thr, fill, u, a, lab, low) { el('rect', { x, y, width: 56, height: h, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    el('rect', { x, y: y + h * (1 - fill * E(u, a, a + 0.8)), width: 56, height: h * fill * E(u, a, a + 0.8), rx: 6, fill: (low ? fill < thr : fill > thr) ? WARN : ACC, opacity: 0.8 });
    el('line', { x1: x - 10, y1: y + h * (1 - thr), x2: x + 66, y2: y + h * (1 - thr), stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
    mono(x - 14, y + h * (1 - thr) + 5, lab, { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end' }); }
  function s4(t, c) { const { k, u } = c; board(c, 'o', 3); newList(c);
    if (k <= 2) stack(k, u);
    if (k === 0) { if (u > 1.1) for (let i = 0; i < 3; i++) dot([[581, 200], [602, 200]], (t + i / 3) % 1, ACC, 4);
      const bo = fade(u, 1.3); el('path', { d: 'M347,236 V246 H718 V236', fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: bo });
      tx(532, 272, '수집 계층', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: bo });
      tx(635, 340, '수집이 없으면 대시보드도 알람도 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { [['Grafana', '보는 도구', INFO], ['Alertmanager', '깨우는 도구', WARN]].forEach(([n, d, col], i) => { const s = pop(u, 1.2 + i * 0.35);
        card(495 + i * 290, 320, 250, 70, { rx: 10, stroke: col, sw: 2.2, s, text: n + '\n' + d, fs: 15, color: col }); });
      pill(635, 396, '대시보드 11835 임포트', INK, pop(u, 2.1), { fs: 13.5 }); return; }
    if (k === 2) { tx(340, 270, '매일 자정 cron', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) });
      mono(340, 296, 'redis-cli SLOWLOG GET 100 > slowlog-$(date +%F).log', { 'font-size': 14, opacity: fade(u, 0.8) });
      fly(560, 300, 820, 336, seg(u, 1.2, 1.9), '요약 → Slack', { stay: true, fill: INFO });
      mono(340, 384, 'redis_commands_total{cmd="hgetall"}', { 'font-size': 14, fill: ACC, opacity: fade(u, 2.0) });
      sub(470, 406, 'commandstats 는 메트릭으로', fade(u, 2.1)); return; }
    if (k <= 6) { const n = k - 2, nwid = fresh(c).map((x) => x.id);
      tx(350, 112, 'groups: redis-sla', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: MUT, opacity: k === 3 ? fade(u, 0.3) : 1 });
      RULES.slice(0, n + (k === 6 ? 1 : 0)).forEach(([nm, cond, id], i) => { const y = 146 + i * 50, isNew = nwid.indexOf(id) >= 0, s = isNew ? pop(u, 0.5 + (id === 'o11' ? 0.4 : 0)) : 1;
        if (isNew) el('rect', { x: 340, y: y - 20, width: 360, height: 46, rx: 8, fill: ACCBG, opacity: Math.min(1, s) });
        mono(352, y, nm, { 'font-size': 14.5, 'font-weight': 800, opacity: Math.min(1, s) });
        mono(352, y + 20, cond, { 'font-size': 13.5, fill: MUT, opacity: Math.min(1, s) }); });
      const mx = 820;
      if (k === 3) { vbar(mx, 150, 200, 0.9, 0.95, u, 1.0, '0.9'); sub(mx + 28, 384, 'for: 5m', fade(u, 1.8), { fill: BAD, 'font-weight': 700 }); }
      if (k === 4) { vbar(mx, 150, 200, 0.8, 0.7, u, 1.0, '0.8', true); sub(mx + 28, 384, '배포 직후는 원래 낮다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); }
      if (k === 5) { for (let i = 0; i < 20; i++) { const x = 760 + (i % 4) * 36, y = 340 - Math.floor(i / 4) * 40, on = i < 16 * E(u, 0.9, 1.9);
          el('rect', { x, y, width: 30, height: 32, rx: 5, fill: on ? (i >= 16 ? BAD : ACC) : PANEL, stroke: GRID, 'stroke-width': 1.2 }); }
        el('line', { x1: 750, y1: 216, x2: 914, y2: 216, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4' }); mono(746, 221, '80%', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end' });
        sub(830, 400, '꽉 차면 새 연결 거부', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); }
      if (k === 6) { const p = []; for (let i = 0; i <= 14; i++) p.push([740 + i * 13, 300 - (i === 10 ? 110 : 30 + Math.sin(i) * 14)]);
        el('line', { x1: 736, y1: 230, x2: 926, y2: 230, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4' }); mono(926, 220, '10ms', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end' });
        const n2 = Math.max(2, Math.round(lerp(1, p.length, E(u, 0.6, 1.6)))); el('polyline', { points: p.slice(0, n2).map((q) => q.join(',')).join(' '), fill: 'none', stroke: INFO, 'stroke-width': 2.5 });
        mono(736, 340, 'p99', { 'font-size': 14, 'font-weight': 700, fill: INFO });
        mono(736, 384, 'rejected = 0 이어야 정상', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); }
      return; }
    // k7~k9 라우팅
    const AM = [430, 280], PD = [790, 186], SL = [790, 360];
    card(AM[0], AM[1], 160, 50, { rx: 10, text: 'Alertmanager', fs: 15, stroke: INK, s: k === 7 ? pop(u, 0.1) : 1 });
    grow(512, 270, 700, 196, k === 7 ? E(u, 0.3, 0.8) : 1, BAD); card(PD[0], PD[1], 176, 50, { rx: 10, text: 'critical-pager\nPagerDuty', fs: 14, stroke: BAD, color: BAD, s: k === 7 ? pop(u, 0.6) : 1 });
    person(912, 186, null, { stroke: BAD, s: k === 7 ? pop(u, 1.2) : 1 });
    if (k === 7) { pill(790, 130, '새벽에도 깨운다', BAD, pop(u, 1.6), { fs: 13.5 }); dot([[512, 270], [700, 196]], seg(u, 1.0, 1.6), BAD, 7); return; }
    grow(512, 290, 700, 356, k === 8 ? E(u, 0.3, 0.8) : 1, WARN); card(SL[0], SL[1], 176, 50, { rx: 10, text: 'warning-slack\n#redis-alerts', fs: 14, stroke: WARN, color: WARN, s: k === 8 ? pop(u, 0.6) : 1 });
    if (k === 8) { dot([[512, 290], [700, 356]], seg(u, 1.0, 1.6), WARN, 7); sub(790, 406, '업무 시간에 보면 된다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    mono(340, 140, 'route: receiver: warning-slack', { 'font-size': 14, opacity: fade(u, 0.2) });
    mono(340, 164, '  severity="critical" → critical-pager', { 'font-size': 14, fill: BAD, opacity: fade(u, 0.5) });
    for (let i = 0; i < 4; i++) { const crit = i % 2 === 0, a = 0.8 + i * 0.35; dot(crit ? [[512, 270], [700, 196]] : [[512, 290], [700, 356]], seg(u, a, a + 0.5), crit ? BAD : WARN, 7); }
    banner(430, 372, 'Observability 12 / 12', pop(u, 2.2)); }

  // =====================================================================
  // 5. 종합 — final_audit.py 가 48칸을 판정
  const AUTO = { m: ['m1', 'm2', 'm3', 'm10'], p: ['p2', 'p3', 'p4', 'p7'], s: ['s3', 's4', 's5', 's7'], o: ['o4', 'o6'] };
  const AUTOK = { m: 2, p: 4, s: 5, o: 6 }, ROWK = { m: 1, p: 3, s: 5, o: 6 };
  function grid(c) { const { k, u } = c;
    ['m', 'p', 's', 'o'].forEach((L, r) => { const y = 22 + r * 50, hot = k === ROWK[L] || k === AUTOK[L] || (k === 8);
      if (hot && k >= 1) el('rect', { x: 10, y: y - 4, width: 930, height: 50, rx: 8, fill: SOFT, opacity: k === 8 ? fade(u, 0.3 + r * 0.25) : fade(u, 0.1) });
      tx(20, y + 27, AXN[L], { 'font-size': 15, 'font-weight': 800, fill: hot ? ACC : INK });
      for (let j = 0; j < 12; j++) { const id = L + (j + 1), x = 140 + j * 66, s = k === 0 ? pop(u, 0.2 + (r * 12 + j) * 0.03) : 1;
        const done = k >= AUTOK[L], auto = done && AUTO[L].indexOf(id) >= 0, ext = done && L === 'o' && j < 3, nowAuto = auto && k === AUTOK[L];
        const g = G(x + 31, y + 21, nowAuto ? pop(u, 0.4 + AUTO[L].indexOf(id) * 0.2) * 0.25 + 0.75 : s);
        el('rect', { x: -31, y: -21, width: 62, height: 42, rx: 7, fill: auto ? ACCBG : PANEL, stroke: auto ? ACC : ext ? INFO : done ? WARN : GRID, 'stroke-width': auto ? 2.4 : 1.6, 'stroke-dasharray': done && !auto ? '5 4' : null }, g);
        mono(auto ? 8 : 0, 5, id, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: auto ? ACC : done ? MUT : INK }, g);
        if (auto) el('path', { d: 'M-24,0 L-19,5 L-11,-5', fill: 'none', stroke: GOOD, 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); } });
    if (k >= 2) { const lo = k === 2 ? fade(u, 1.6) : 1, y = 232;
      el('rect', { x: 140, y: y - 11, width: 18, height: 14, rx: 3, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5, opacity: lo }); tx(164, y + 1, '코드가 자동 판정', { 'font-size': 13.5, fill: MUT, opacity: lo });
      el('rect', { x: 300, y: y - 11, width: 18, height: 14, rx: 3, fill: PANEL, stroke: WARN, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', opacity: lo }); tx(324, y + 1, '사람이 확인', { 'font-size': 13.5, fill: MUT, opacity: lo });
      if (k >= 6) { el('rect', { x: 430, y: y - 11, width: 18, height: 14, rx: 3, fill: PANEL, stroke: INFO, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', opacity: k === 6 ? fade(u, 1.2) : 1 }); tx(454, y + 1, '외부 스택 검증', { 'font-size': 13.5, fill: MUT, opacity: k === 6 ? fade(u, 1.2) : 1 }); } } }
  function reads(u, a, b) { pill(300, 300, a, ACC, pop(u, 0.3), { mono: true, fs: 15 }); pill(640, 300, b, ACC, pop(u, 0.6), { mono: true, fs: 15 }); }
  function s5(t, c) { const { k, u } = c; grid(c);
    if (k === 0) { terminal(40, 252, 880, 110, ['$ python final_audit.py prod-redis.example.com', ['48 항목 PASS/FAIL + JSON 리포트', 'var(--term)']], Math.max(0.2, 2 * E(u, 0.4, 1.8)));
      tx(480, 398, '점검표를 문서가 아니라 실행되는 코드로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { reads(u, 'r.info("memory")', 'r.config_get("max*")'); dot([[300, 284], [300, 70]], seg(u, 0.8, 1.4), ACC, 7); dot([[640, 284], [640, 70]], seg(u, 1.0, 1.6), ACC, 7);
      mono(480, 360, 'maxmemory · maxmemory-policy · … 한 번에', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); return; }
    if (k === 2) { snippet(80, 258, ['"m1_maxmemory_set": maxmemory > 0', '"m2_policy_chosen": policy != "noeviction"', '"m10_fragmentation_ok": ratio < 1.5'], { fs: 14.5, op: fade(u, 0.3) });
      mono(900, 300, '자동 4', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      mono(900, 334, '사람 8', { 'font-size': 18, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.7) });
      tx(900, 380, '못 잡는 항목을 아는 것도 점검이다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.1) }); return; }
    if (k === 3) { reads(u, 'r.info("persistence")', 'r.info("replication")'); dot([[300, 284], [300, 120]], seg(u, 0.8, 1.4), ACC, 7); dot([[640, 284], [640, 120]], seg(u, 1.0, 1.6), ACC, 7);
      tx(480, 360, '영속성과 복제는 한 몸이라 같이 읽는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) }); return; }
    if (k === 4) { snippet(80, 258, ['"p2_aof_enabled": aof_enabled == 1', '"p3_fsync_everysec": appendfsync == "everysec"', '"p7_has_replica": connected_slaves > 0'], { fs: 14.5, op: fade(u, 0.3) });
      tx(900, 380, 'Sentinel 수 · 복구 훈련은 Redis 에 물을 수 없다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.9) }); return; }
    if (k === 5) { snippet(80, 258, ['"s3_bind_private": "0.0.0.0" not in bind', '"s4_protected_mode": protected-mode == "yes"', '"s7_acl_users": len(acl_list()) > 2'], { fs: 14.5, op: fade(u, 0.3) });
      tx(900, 380, 'VPC · 방화벽은 인프라 코드에서 본다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.9) }); return; }
    if (k === 6) { snippet(80, 258, ['"o4_slowlog_threshold": slower-than <= 10000', '"o6_commandstats_ok": "cmdstat_get" in …'], { fs: 14.5, op: fade(u, 0.3) });
      tx(900, 380, 'exporter · Grafana 는 밖에서 헬스체크', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 1.9) }); return; }
    if (k === 7) { snippet(80, 256, ['r = redis.Redis(host=host)', 'results = {', '    "timestamp": now().isoformat(),', '    "host": "prod-redis",'], { fs: 14.5, op: fade(u, 0.3) });
      pill(760, 300, '언제', ACC, pop(u, 1.2), { fs: 15 }); pill(760, 346, '어디를', ACC, pop(u, 1.5), { fs: 15 });
      grow(726, 300, 430, 316, E(u, 1.3, 1.6), ACC); grow(718, 346, 430, 340, E(u, 1.6, 1.9), ACC); return; }
    if (k === 8) { ['memory', 'persistence', 'security', 'observability'].forEach((n, i) => { const x = 200 + i * 190, a = 0.4 + i * 0.3;
        dot([[110, 43 + i * 50], [x, 290]], seg(u, a, a + 0.6), ACC, 6); pill(x, 300, '"' + n + '"', ACC, pop(u, a + 0.5), { mono: true, fs: 14.5 }); });
      mono(80, 300, 'results', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.2) });
      tx(480, 370, '축 구조가 그대로 리포트 구조가 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 9) { mono(80, 290, 'passed = sum(v for v in all_checks)', { 'font-size': 15, opacity: fade(u, 0.2) });
      mono(80, 320, 'score  = f"{passed}/{total}"', { 'font-size': 15, opacity: fade(u, 0.5) });
      mono(80, 350, 'ready  = passed == total', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
      card(760, 320, 260, 96, { rx: 12, stroke: GOOD, sw: 3, s: pop(u, 1.3) });
      mono(760, 318, c.beat.verdict.split(' ')[0], { 'font-size': 30, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(760, 350, 'ready = True', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      tx(480, 402, '하나라도 빠지면 ready 는 거짓', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); return; }
    // k10 CI 게이트
    const st = [['build', 150], ['final_audit.py', 400], ['deploy', 720]];
    st.forEach(([n, x], i) => card(x, 300, i === 1 ? 190 : 140, 50, { rx: 10, text: n, fs: 15, mono: true, stroke: i === 1 ? ACC : INK, s: pop(u, 0.2 + i * 0.2) }));
    grow(222, 300, 302, 300, E(u, 0.5, 0.8), MUT);
    grow(497, 290, 648, 290, E(u, 1.0, 1.4), GOOD); mono(572, 276, 'exit 0', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    grow(400, 327, 400, 372, E(u, 1.6, 1.9), BAD); pill(400, 392, 'exit 1 → 배포 멈춤', BAD, pop(u, 1.9), { fs: 14 });
    check(820, 300, 14, pop(u, 1.5)); cross(500, 392, 12, pop(u, 2.0));
    tx(940, 392, '사람이 리포트를 안 읽어도 막힌다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.3) }); }

  R.page({ title: '운영 출항 점검표', scenes: [s1, s2, s3, s4, s5] });
})();
