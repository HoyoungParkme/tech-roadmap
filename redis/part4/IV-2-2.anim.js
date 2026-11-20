/* IV-2-2 Redis Cluster — 단일 노드 한계 · 16384 slot · CRC16 · reshard · MOVED/ASK (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, pill, banner, grow, fly, dot, cross, check, clock, terminal, server, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const T = (x, y, s, a) => tx(x, y, s, Object.assign({ 'font-size': 15 }, a || {}));
  const line = (x1, y1, x2, y2, col, o) => { o = o || {}; el('line', { x1, y1, x2, y2, stroke: col || GRID, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); };
  const NC = { N1: INFO, N2: GOOD, N3: WARN, N4: ACC };
  const NB = { N1: INFOBG, N2: GOODBG, N3: WARNBG, N4: ACCBG };
  // slot 막대 (0 ~ 16383 → x0 ~ x0+w)
  const BX = 80, BW = 800, sx = (s) => BX + (s / 16384) * BW;
  function bar(y, segs, o) { o = o || {}; el('rect', { x: BX, y, width: BW, height: 26, rx: 4, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': segs.length ? null : '6 5' });
    segs.forEach((g) => { const w = (sx(g.b + 1) - sx(g.a)) * (g.u ?? 1); el('rect', { x: sx(g.a), y, width: Math.max(0, w), height: 26, fill: NC[g.n], opacity: g.op ?? 0.8 }); });
    if (o.ticks !== false) { mono(BX, y + 46, '0', { 'font-size': 13.5, fill: MUT }); mono(BX + BW, y + 46, '16383', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); } }
  const node = (cx, cy, name, sub2, o) => { o = o || {}; const col = o.col || NC[name] || INK; card(cx, cy, o.w || 150, o.h || 56, { rx: 10, stroke: o.off ? GRID : col, sw: 2.2, fill: o.off ? PANEL : (o.fill || NB[name] || PANEL), s: o.s, dash: o.dash, op: o.op });
    if ((o.s ?? 1) < 0.05) return; mono(cx, cy - (sub2 ? 4 : -5), name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: o.off ? OFF : col, opacity: o.op ?? 1 });
    if (sub2) mono(cx, cy + 17, sub2, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.off ? OFF : INK, opacity: o.op ?? 1 }); };
  const SEG3 = [{ a: 0, b: 5460, n: 'N1' }, { a: 5461, b: 10922, n: 'N2' }, { a: 10923, b: 16383, n: 'N3' }];

  // ───────── 1. 단일 노드 한계 ─────────
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { server(180, 190, 'Redis 노드 1대', {});
      const fx = 360, fy = 60, fh = 280, lv = E(u, 0.2, 1.4);
      el('rect', { x: fx, y: fy, width: 110, height: fh, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
      el('rect', { x: fx + 4, y: fy + fh - 4 - (fh - 8) * 0.92 * lv, width: 102, height: (fh - 8) * 0.92 * lv, rx: 5, fill: WARN, opacity: 0.8 });
      el('line', { x1: fx - 14, y1: fy + 2, x2: fx + 124, y2: fy + 2, stroke: BAD, 'stroke-width': 3 });
      T(fx + 134, fy + 8, '~256GB  ·  서버 RAM 이 천장', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
      T(fx + 55, fy + fh + 26, 'RAM', { 'text-anchor': 'middle', 'font-weight': 700 });
      const g = fade(u, 1.7); el('rect', { x: 620, y: 150, width: 110, height: 190, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: g });
      T(675, 250, 'fork()', { 'text-anchor': 'middle', class: 'mono', 'font-weight': 700, fill: WARN, opacity: g });
      T(620, 370, '백업·복제 때 메모리가 더 필요하다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) });
      grow(476, 240, 614, 240, E(u, 1.6, 2.0), WARN);
      return; }
    if (k === 1) { server(120, 200, 'Redis', {});
      // 단일 스레드 레인
      const lx = 220, ly = 200; el('rect', { x: lx, y: ly - 26, width: 560, height: 52, rx: 26, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      T(lx + 280, ly - 40, '명령 처리 스레드 1개', { 'text-anchor': 'middle', 'font-weight': 700, fill: INK, opacity: fade(u, 0.2) });
      const big = u > 1.2, bx = lerp(780, 320, E(u, 1.2, 1.8));
      for (let i = 0; i < 9; i++) { const x = big ? Math.max(bx + 70 + i * 34, 0) : lx + 560 - ((t * 140 + i * 62) % 560); if (x < lx + 10 || x > lx + 548) continue;
        el('rect', { x: x - 12, y: ly - 12, width: 24, height: 24, rx: 4, fill: big ? WARN : ACC, opacity: 0.85 }); }
      if (big) { card(bx, ly, 110, 40, { rx: 8, fill: BAD, stroke: 'none', text: 'LRANGE 큰 키', fs: 13.5, color: PANEL }); T(lx + 560, ly + 56, '뒤 명령이 전부 기다린다', { 'text-anchor': 'end', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      mono(lx + 560, 120, '~200K ops/s', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', fill: WARN, opacity: fade(u, 0.6) });
      [0, 1, 2].forEach((i) => card(320 + i * 90, 330, 70, 44, { rx: 8, stroke: GRID, text: 'core', fs: 13.5, color: OFF, s: pop(u, 0.8 + i * 0.15) }));
      T(600, 336, '코어를 늘려도 놀고 있다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.1) });
      return; }
    if (k === 2) { const down = u > 0.3;
      server(300, 170, 'primary', { stroke: down && u < 1.4 ? BAD : INK, lamp: down && u < 1.4 ? BAD : GOOD });
      if (down && u < 1.4) cross(300, 170, 22, pop(u, 0.3));
      [0, 1, 2].forEach((i) => { person(70, 90 + i * 100, null, { s: 0.8 }); const ok = u > 1.4; line(100, 90 + i * 100, 236, 170, ok ? GRID : BAD, { dash: ok ? null : '5 5' }); });
      T(70, 400, u < 1.4 ? '노드 다운 = 서비스 다운' : '', { 'font-weight': 800, fill: BAD });
      const rp = pop(u, 1.4); server(620, 170, 'replica', { s: rp, lamp: GOOD });
      card(620, 330, 150, 44, { rx: 22, stroke: INFO, fill: INFOBG, text: 'Sentinel', fs: 15, color: INFO, s: pop(u, 1.6) });
      grow(370, 170, 548, 170, E(u, 1.5, 1.9), GOOD);
      T(820, 120, '장애 대비 OK', { 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9), 'text-anchor': 'middle' });
      T(820, 220, '메모리 천장은', { 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2), 'text-anchor': 'middle' });
      T(820, 244, '그대로 256GB', { 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2), 'text-anchor': 'middle', class: 'mono' });
      return; }
    if (k === 3) { // 판단 자 (메모리 축)
      const x0 = 80, W = 800, mx = (g) => x0 + Math.min(g, 320) / 320 * W, y = 140;
      T(x0, 70, '데이터 크기', { 'font-weight': 800 });
      [[0, 64, GOOD, '단일 노드'], [64, 256, WARN, 'Replica 활용'], [256, 320, BAD, 'Cluster']].forEach(([a, b, col, s], i) => { const g = E(u, 0.2 + i * 0.4, 0.7 + i * 0.4);
        el('rect', { x: mx(a), y, width: (mx(b) - mx(a)) * g, height: 36, fill: col, opacity: 0.8 });
        T((mx(a) + mx(b)) / 2, y + 62, s, { 'text-anchor': 'middle', 'font-weight': 800, fill: col, opacity: fade(u, 0.5 + i * 0.4) }); });
      [64, 256].forEach((g, i) => mono(mx(g), y - 12, g + 'GB', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.4) }));
      T(x0, 280, '처리량', { 'font-weight': 800, opacity: fade(u, 1.6) });
      el('rect', { x: x0, y: 300, width: W * 0.6 * E(u, 1.6, 2.1), height: 30, fill: GOOD, opacity: 0.6 });
      el('rect', { x: x0 + W * 0.6, y: 300, width: W * 0.4 * E(u, 2.0, 2.4), height: 30, fill: BAD, opacity: 0.75 });
      mono(x0 + W * 0.6, 290, '200K ops/s', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      T(x0 + W * 0.8, 360, 'Cluster 또는 DragonflyDB', { 'text-anchor': 'middle', 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) });
      return; }
    // k4: 결정 가이드
    [['작으면', '단일 노드 + Sentinel', 'single'], ['크면', 'Cluster (3+ shard)', 'cluster'], ['운영 단순함 우선', 'DragonflyDB (멀티스레드)', 'df']].forEach(([a, b, kind], i) => {
      const cx = 170 + i * 310, s = pop(u, 0.3 + i * 0.5); card(cx, 210, 280, 280, { rx: 14, stroke: kind === 'cluster' ? ACC : GRID, sw: 2, s });
      T(cx, 110, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.5) });
      const op = fade(u, 0.5 + i * 0.5);
      if (kind === 'single') { node(cx - 50, 200, 'Redis', null, { col: INK, fill: PANEL, w: 90, op }); card(cx + 70, 200, 90, 40, { rx: 20, stroke: INFO, text: 'Sentinel', fs: 13.5, color: INFO, op }); }
      if (kind === 'cluster') ['N1', 'N2', 'N3'].forEach((n, j) => node(cx - 85 + j * 85, 200, n, null, { w: 72, op }));
      if (kind === 'df') { card(cx, 200, 150, 64, { rx: 10, stroke: INK, op }); [0, 1, 2, 3].forEach((j) => el('rect', { x: cx - 56 + j * 30, y: 208, width: 22, height: 14, rx: 3, fill: ACC, opacity: op })); T(cx, 196, '노드 1대', { 'text-anchor': 'middle', 'font-size': 14, opacity: op }); }
      T(cx, 300, b, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: kind === 'cluster' ? ACC : INK, opacity: op }); });
  }

  // ───────── 2. Cluster 구성 ─────────
  const PX = [200, 480, 760], PORTS = ['7000', '7001', '7002'], RPORTS = ['7003', '7004', '7005'];
  function s2(t, c) { const { k, u } = c, v = c.beat.viz;
    const assigned = k >= 1, fillU = k === 1 ? E(u, 0.4, 1.8) : 1;
    PX.forEach((x, i) => { const n = 'N' + (i + 1); node(x, 70, assigned ? n + ' · ' + PORTS[i] : PORTS[i], assigned ? (k === 1 ? Math.round(lerp(0, v.nodes[i].count, fillU)) : v.nodes[i].count).toLocaleString('en-US') + ' slots' : 'slot 0', { off: !assigned, w: 190, s: k === 0 ? pop(u, 0.2 + i * 0.15) : 1, col: NC[n] });
      const rs = k === 0 ? pop(u, 0.65 + i * 0.15) : 1, isRep = k >= 2;
      node(x, 165, isRep ? 'R' + (i + 1) + ' · ' + RPORTS[i] : RPORTS[i], isRep ? 'replica of ' + n : 'slot 0', { off: !isRep, w: 190, h: 50, s: rs, col: NC[n], fill: PANEL, dash: isRep ? '6 4' : null });
      if (isRep) grow(x, 140, x, 98, k === 2 ? E(u, 0.3 + i * 0.3, 0.7 + i * 0.3) : 1, NC[n]); });
    bar(230, assigned ? SEG3.map((g) => ({ ...g, u: fillU })) : []);
    if (!assigned) { T(480, 248, '16384 slot 미할당', { 'text-anchor': 'middle', 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
      mono(80, 330, '--cluster-enabled yes  × 6', { 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) }); return; }
    SEG3.forEach((g, i) => mono((sx(g.a) + sx(g.b)) / 2, 276, g.a + '-' + g.b, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: NC[g.n], opacity: k === 1 ? fade(u, 1.6) : 1 }));
    if (k === 1) { mono(80, 330, 'redis-cli --cluster create … --cluster-replicas 1', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) }); return; }
    if (k === 2) { T(80, 330, 'replica 는 slot 을 갖지 않는다 — primary 가 죽으면 승격', { 'font-weight': 700, fill: MUT, opacity: fade(u, 1.5) }); return; }
    if (k === 3) { terminal(80, 296, 520, 118, ['> CLUSTER INFO', 'cluster_state:ok', 'cluster_slots_assigned:16384', 'cluster_known_nodes:6'], lerp(0, 4, E(u, 0.2, 1.6)), { fs: 14, lh: 19 });
      if (u > 1.7) check(650, 350, 14, pop(u, 1.7)); return; }
    if (k === 4) { mono(80, 330, '> CLUSTER KEYSLOT mykey', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
      mono(80, 360, '(integer) 14687', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.7) });
      const x = sx(14687); dot([[230, 352], [x, 300], [x, 243]], seg(u, 1.0, 1.8), ACC, 8);
      if (u > 1.8) { el('rect', { x: x - 3, y: 222, width: 6, height: 42, fill: INK }); mono(x, 316, 'mykey', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 1.8) });
        el('rect', { x: PX[2] - 99, y: 38, width: 198, height: 64, rx: 12, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 2.0) }); }
      return; }
    // k5: cluster 인식 클라이언트
    card(190, 360, 260, 92, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.2) });
    T(76, 336, 'RedisCluster 매핑 캐시', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) });
    SEG3.forEach((g, i) => { const a = fade(u, 0.6 + i * 0.25); mono(76, 360 + i * 20, g.a + '-' + g.b, { 'font-size': 13.5, opacity: a }); mono(304, 360 + i * 20, '→ ' + g.n, { 'font-size': 13.5, 'text-anchor': 'end', fill: NC[g.n], 'font-weight': 700, opacity: a }); });
    PX.forEach((x, i) => grow(330, 360, x - 20, 100, E(u, 1.4 + i * 0.2, 1.9 + i * 0.2), NC['N' + (i + 1)], { dash: '5 5' }));
    T(560, 380, 'redirect 를 알아서 처리한다', { 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) });
  }

  // ───────── 3. CRC16 + hashtag ─────────
  const NODEX = { N1: sx(2730), N2: sx(8192), N3: sx(13653) };
  function crcBar(hot) { bar(330, SEG3, { ticks: false }); SEG3.forEach((g) => mono((sx(g.a) + sx(g.b)) / 2, 380, g.n, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: NC[g.n], opacity: hot && hot !== g.n ? 0.35 : 1 })); }
  // 키 한 줄: key → [CRC16 % 16384] → slot → node
  function keyRow(y, ex, u0, u, o) { o = o || {}; const a = fade(u, u0), b = fade(u, u0 + 0.5), cc = NC[ex.node] || MUT;
    if (ex.hashtag && /^\{[^}]+\}/.test(ex.key)) { const m = ex.key.match(/^(\{)([^}]+)(\}.*)$/);
      spans(60, y + 5, [[m[1], { fill: MUT }], [m[2], { fill: ACC, 'font-weight': 800 }], [m[3], { fill: MUT }]], { 'font-size': 16, opacity: a }); }
    else mono(60, y + 5, ex.key, { 'font-size': 16, 'font-weight': 700, opacity: a });
    dot([[260, y], [330, y]], seg(u, u0 + 0.1, u0 + 0.5), ACC, 5);
    card(420, y, 170, 34, { rx: 8, stroke: INK, sw: 1.5, fill: SOFT, op: a }); mono(420, y + 5, 'CRC16 % 16384', { 'text-anchor': 'middle', 'font-size': 13.5, opacity: a });
    if (ex.slot != null) { mono(530, y + 5, '→ ' + ex.slot, { 'font-size': 16, 'font-weight': 800, opacity: b });
      mono(650, y + 5, '→ ' + ex.node, { 'font-size': 16, 'font-weight': 800, fill: cc, opacity: b });
      if (o.drop !== false) dot([[690, y], [sx(ex.slot), 330]], seg(u, u0 + 0.6, u0 + 1.1), cc, 6);
      if (u > u0 + 1.1 || o.static) el('rect', { x: sx(ex.slot) - 2.5, y: 322, width: 5, height: 42, fill: INK, opacity: 0.85 }); } }
  function s3(t, c) { const { k, u } = c, ex = c.beat.viz.examples;
    if (k === 0) { crcBar(); ex.forEach((e, i) => keyRow(70 + i * 70, e, 0.2 + i * 0.5, u)); T(780, 140, '같은 키 →', { 'font-weight': 700, opacity: fade(u, 2.2) }); T(780, 164, '언제나 같은 slot', { 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { crcBar(); ex.forEach((e, i) => keyRow(70 + i * 70, { ...e, key: e.key.replace(/\s+\(.*\)$/, '') }, 0, 2, { static: true, drop: false }));
      mono(60, 232, 'MGET user:1 cart:1', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3) });
      ex.forEach((e) => grow(250, 226, NODEX[e.node], 318, E(u, 0.7, 1.2), BAD));
      mono(520, 216, '(error) CROSSSLOT Keys in request', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) });
      mono(520, 240, "        don't hash to the same slot", { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) });
      return; }
    if (k === 3) { // NEW: 중괄호 규칙
      T(60, 50, '해싱되는 부분', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      ex.forEach((e, i) => { const y = 100 + i * 80, a = fade(u, 0.2 + i * 0.6), st = e.hashtag ? 1 : 0;
        if (e.hashtag) { const m = e.key.match(/^(\{)([^}]+)(\}.*)$/); spans(60, y + 6, [[m[1], { fill: MUT }], [m[2], { fill: ACC, 'font-weight': 800 }], [m[3], { fill: MUT }]], { 'font-size': 18, opacity: a }); }
        else { el('rect', { x: 54, y: y - 16, width: tw(e.key, 18) + 12, height: 30, rx: 5, fill: WARNBG, opacity: a }); mono(60, y + 6, e.key, { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: a }); }
        grow(300, y, 395, y, E(u, 0.4 + i * 0.6, 0.7 + i * 0.6), e.hashtag ? ACC : WARN);
        mono(410, y + 6, 'CRC16("' + e.hashed + '")', { 'font-size': 16, 'font-weight': 700, fill: e.hashtag ? ACC : WARN, opacity: fade(u, 0.6 + i * 0.6) });
        mono(600, y + 6, '→ ' + e.slot, { 'font-size': 16, 'font-weight': 800, fill: INK, opacity: fade(u, 0.8 + i * 0.6) });
        T(710, y + 6, e.hashtag ? (i === 0 ? '{ } 안쪽만' : '첫 쌍만, {cart} 는 무시') : '빈 {} → 키 전체', { 'font-size': 15, 'font-weight': 700, fill: e.hashtag ? INK : WARN, opacity: fade(u, 0.8 + i * 0.6) }); });
      T(60, 360, '앞의 두 키는 ' + ex[0].slot + ', {}user:1 은 ' + ex[2].slot + ' — 다른 slot 이다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) });
      return; }
    if (k === 2 || k === 7) { crcBar(); ex.forEach((e, i) => keyRow(52 + i * (k === 7 ? 54 : 70), e, 0.2 + i * (k === 7 ? 0.3 : 0.5), u));
      if (k === 2) T(780, 160, '모두 slot ' + ex[0].slot, { 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
      return; }
    crcBar(k === 4 || k === 5 || k === 6 ? ex[0].node : null); const hn = ex[0].node;
    if (k === 4) { mono(60, 70, 'MGET {user:1}:profile {user:1}:cart', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      grow(300, 90, NODEX[hn], 318, E(u, 0.6, 1.3), GOOD);
      [['1) "..."', 0], ['2) "..."', 1]].forEach(([s, i]) => mono(560, 150 + i * 26, s, { 'font-size': 15, opacity: fade(u, 1.5 + i * 0.2) }));
      if (u > 1.4) check(700, 160, 12, pop(u, 1.4)); T(740, 168, 'OK', { 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) }); return; }
    if (k === 5) { [['H', '{user:1}:hash', 'HSET'], ['L', '{user:1}:queue', 'LPUSH'], ['S', '{user:1}:tags', 'SADD']].forEach(([ic, key, cm], i) => {
        const y = 70 + i * 66, a = fade(u, 0.2 + i * 0.4); card(80, y, 40, 40, { rx: 8, stroke: ACC, fill: ACCBG, text: ic, fs: 18, color: ACC, mono: true, op: a });
        mono(120, y + 6, cm + ' ' + key, { 'font-size': 16, 'font-weight': 700, opacity: a }); dot([[440, y], [NODEX[hn], 318]], seg(u, 0.5 + i * 0.4, 1.1 + i * 0.4), GOOD, 6); });
      card(720, 140, 260, 90, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, 1.8) }); T(720, 132, 'user:1 = 한 slot = 한 노드', { 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 1.9) });
      T(720, 158, 'MULTI · Lua 도 가능', { 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 6) { ex.forEach((e, i) => { const y = 50 + i * 46; spans(60, y + 5, [['{', { fill: MUT }], ['hot_user', { fill: BAD, 'font-weight': 800 }], [e.key.replace('{hot_user', ''), { fill: MUT }]], { 'font-size': 15.5, opacity: fade(u, 0.2 + i * 0.2) }); });
      for (let i = 0; i < 14; i++) dot([[320, 50 + (i % 4) * 46], [NODEX[hn], 318]], ((t * 0.8 + i / 14) % 1), BAD, 4.5);
      const heat = E(u, 0.4, 2.0); ['N1', 'N2', 'N3'].forEach((n) => { const x = NODEX[n], hv = n === hn ? heat : 0.15;
        el('rect', { x: x - 60, y: 260, width: 120, height: 14, rx: 7, fill: SOFT }); el('rect', { x: x - 60, y: 260, width: 120 * hv, height: 14, rx: 7, fill: n === hn ? BAD : GOOD }); });
      T(NODEX[hn] + 120, 250, hn + ' 만 뜨겁다', { 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); return; }
  }

  // ───────── 4. 노드 추가 · reshard ─────────
  const QX = { N1: 150, N2: 370, N3: 590, N4: 810 };
  const SEG4 = [{ a: 0, b: 4095, n: 'N1' }, { a: 4096, b: 5460, n: 'N4' }, { a: 5461, b: 9556, n: 'N2' }, { a: 9557, b: 10922, n: 'N4' }, { a: 10923, b: 15018, n: 'N3' }, { a: 15019, b: 16383, n: 'N4' }];
  function rnodes(c, o) { o = o || {}; const v = c.beat.viz;
    v.after.forEach((n) => { const isNew = n.isNew, joined = !o.notJoined || !isNew; node(QX[n.id], 80, isNew ? 'N4 · 7006' : n.id, o.label ? o.label(n) : (n.slots.length > 16 ? (isNew ? 'slot 0' : n.slots) : n.slots), { w: 190, h: 64, off: isNew && o.n4off, dash: isNew && !joined ? '6 5' : null, s: o.s && isNew ? o.s : 1, col: NC[n.id] }); }); }
  function rangeLabels(segs) { segs.forEach((g, i) => { if (g.b - g.a < 1800 && g.n === 'N4') return; mono((sx(g.a) + sx(g.b + 1)) / 2, 296, g.a + '-' + g.b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: NC[g.n], 'font-weight': 700 }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { rnodes(c, { n4off: true, notJoined: k === 0, s: k === 0 ? pop(u, 0.3) : 1, label: (n) => (n.isNew ? 'slot 0' : n.slots) });
      bar(250, SEG3); rangeLabels(SEG3);
      if (k === 0) { mono(60, 360, 'docker run … redis-server --cluster-enabled yes', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) }); T(QX.N4, 150, '아직 클러스터 밖', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) }); return; }
      ['N1', 'N2', 'N3'].forEach((n, i) => { el('path', { d: `M${QX.N4 - 40},110 Q${(QX.N4 + QX[n]) / 2},${170 + i * 14} ${QX[n] + 40},110`, fill: 'none', stroke: ACC, 'stroke-width': 1.8, 'stroke-dasharray': '4 5', opacity: fade(u, 0.6 + i * 0.2) });
        dot([[QX.N4 - 40, 110], [(QX.N4 + QX[n]) / 2, 150 + i * 7], [QX[n] + 40, 110]], ((t * 0.7 + i / 3) % 1), ACC, 4.5); });
      mono(60, 360, 'redis-cli --cluster add-node 127.0.0.1:7006 127.0.0.1:7000', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
      T(QX.N4, 150, 'gossip 으로 합류 · slot 0', { 'text-anchor': 'middle', 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    if (k === 2) { const g = E(u, 0.9, 2.0);
      rnodes(c, { label: (n) => (n.isNew ? (u > 2.0 ? '4096 slots' : 'slot 0') : n.slots) });
      bar(250, u < 0.9 ? SEG3 : SEG4.map((s) => ({ ...s, op: s.n === 'N4' ? 0.8 * g + 0.0 : 0.8 })));
      if (u < 0.9) rangeLabels(SEG3); else rangeLabels(SEG4.filter((s) => s.n !== 'N4'));
      ['N1', 'N2', 'N3'].forEach((n, i) => { const mv = c.beat.viz.after.find((q) => q.id === n).migrated;
        fly(QX[n], 165 + i * 30, QX.N4, 165 + i * 30, seg(u, 0.4 + i * 0.25, 1.4 + i * 0.25), mv + ' slots', { mono: true, fill: NC[n] });
        mono(QX[n] + 70, 136, '-' + mv, { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.25) }); });
      mono(60, 360, '--cluster-slots 4096   # 16384 / 4', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
      return; }
    if (k === 3) { rnodes(c, { label: (n) => n.slots.replace(' (균등)', '') });
      bar(250, SEG4); rangeLabels(SEG4.filter((s) => s.n !== 'N4'));
      ['N1', 'N2', 'N3', 'N4'].forEach((n, i) => { const h = 60 * E(u, 0.4 + i * 0.2, 1.0 + i * 0.2); el('rect', { x: 330 + i * 80, y: 400 - h, width: 52, height: h, rx: 4, fill: NC[n], opacity: 0.8 }); });
      mono(660, 380, 'redis-cli --cluster rebalance', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
      T(660, 404, '노드별 slot 수를 자동으로 고르게', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) }); return; }
    // k4~k7: slot 5000 이동
    const mig = k === 4 || k === 5 || (k === 6 && u < 2.0);
    rnodes(c, { label: (n) => (n.id === 'N1' && mig ? '5000 MIGRATING' : n.id === 'N4' ? (mig ? '5000 IMPORTING' : k === 6 ? '5000 소유' : '4096 slots') : n.id === 'N1' ? '0-4095' : n.slots) });
    bar(250, SEG4); rangeLabels(SEG4.filter((s) => s.n !== 'N4'));
    const x5 = sx(5000); el('rect', { x: x5 - 4, y: 240, width: 8, height: 46, rx: 2, fill: mig ? BAD : ACC }); mono(x5, 300, 'slot 5000', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: mig ? BAD : ACC });
    if (k === 4) { grow(QX.N1, 112, x5 - 6, 236, E(u, 0.3, 0.8), BAD, { dash: '5 4' }); grow(QX.N4, 112, x5 + 6, 236, E(u, 0.5, 1.0), ACC, { dash: '5 4' });
      person(80, 360, null, { s: 0.8 }); dot([[110, 350], [QX.N1, 116]], seg(u, 1.2, 1.9), INFO, 7); if (u > 1.9) { check(QX.N1 + 110, 150, 10, pop(u, 1.9)); }
      T(140, 380, 'GET 은 계속 응답한다', { 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { // ASK
      person(70, 330, '클라이언트', { s: 0.9 });
      card(330, 330, 230, 36, { rx: 8, stroke: INFO, text: 'slot 5000 키 A · N1 에 남음', fs: 13.5, color: INFO, op: fade(u, 0.2) });
      dot([[100, 320], [QX.N1, 116]], seg(u, 0.2, 0.7), INFO, 6); if (u > 0.7) check(QX.N1 + 110, 150, 9, pop(u, 0.7));
      card(330, 380, 230, 36, { rx: 8, stroke: WARN, text: 'slot 5000 키 B · 옮겨 감', fs: 13.5, color: WARN, op: fade(u, 0.9) });
      dot([[100, 340], [QX.N1, 116]], seg(u, 0.9, 1.3), WARN, 6);
      if (u > 1.3) { fly(QX.N1, 116, 520, 330, seg(u, 1.3, 1.8), 'ASK 5000 N4', { stay: true, fill: WARN, mono: true }); }
      if (u > 1.9) { const p1 = [[600, 330], [QX.N4, 116]]; dot(p1, seg(u, 1.9, 2.3), ACC, 6); mono(640, 380, 'ASKING → 키 B 재요청', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) }); }
      if (u > 2.3) check(QX.N4 + 110, 150, 9, pop(u, 2.3));
      T(640, 406, '매핑 캐시는 그대로', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.4) }); return; }
    if (k === 6) { const steps = ['CLUSTER GETKEYSINSLOT 5000 100', 'MIGRATE host port key …', 'CLUSTER SETSLOT 5000 NODE <N4>'];
      steps.forEach((s, i) => mono(60, 340 + i * 26, (i + 1) + ') ' + s, { 'font-size': 15, 'font-weight': 700, fill: i === 2 ? ACC : INK, opacity: fade(u, 0.2 + i * 0.7) }));
      for (let i = 0; i < 6; i++) dot([[QX.N1 + 60, 112], [QX.N4 - 60, 112]], seg(u, 0.8 + i * 0.12, 1.5 + i * 0.12), BAD, 5);
      if (u > 2.0) T(640, 380, '소유권이 N4 로 넘어갔다', { 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); return; }
    // k7: 운영 팁 · del-node
    [['1000~4000 slot 씩 나눠서', 0], ['트래픽 적은 시간에', 1], ['bigkey 는 미리 정리', 2]].forEach(([s, i]) => pill(180 + i * 230, 350, s, INFO, pop(u, 0.2 + i * 0.3), { fs: 14 }));
    mono(60, 400, 'redis-cli --cluster del-node 127.0.0.1:7000 <node_id>', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) });
    T(830, 400, '빈 노드만 제거', { 'text-anchor': 'middle', 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
  }

  // ───────── 5. MOVED / ASK ─────────
  const NY = { N1: 90, N2: 200, N3: 310 }, NXp = 800;
  function cache(rows, o) { o = o || {}; card(170, 210, 280, 40 + rows.length * 28, { rx: 10, stroke: INK, sw: 2, s: o.s });
    T(44, 210 - (40 + rows.length * 28) / 2 + 22, 'slot 매핑 캐시', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.s ?? 1 });
    rows.forEach((r, i) => { const y = 210 - (40 + rows.length * 28) / 2 + 50 + i * 28, a = r.op ?? 1;
      if (r.hot) el('rect', { x: 38, y: y - 18, width: 264, height: 26, rx: 5, fill: r.hot, opacity: a });
      mono(48, y, r.a, { 'font-size': 14, opacity: a }); mono(292, y, '→ ' + r.n, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: NC[r.n] || INK, opacity: a }); }); }
  const baseRows = () => SEG3.map((g) => ({ a: g.a + '-' + g.b, n: g.n }));
  function cnodes(hot) { ['N1', 'N2', 'N3'].forEach((n, i) => node(NXp, NY[n], n + ' · ' + (7000 + i), null, { w: 170, h: 52, col: NC[n], op: hot && hot !== n ? 0.45 : 1 })); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { cnodes(); cache(baseRows().map((r, i) => ({ ...r, op: fade(u, 1.2 + i * 0.25) })), { s: pop(u, 0.2) });
      ['N1', 'N2', 'N3'].forEach((n, i) => grow(312, 200, NXp - 88, NY[n], E(u, 0.4 + i * 0.15, 0.8 + i * 0.15), INFO, { dash: '5 5' }));
      mono(40, 380, 'startup_nodes = 7000, 7001, 7002', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      mono(560, 380, '← CLUSTER SLOTS', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) }); return; }
    if (k === 1) { cnodes('N2'); cache(baseRows());
      dot([[312, 200], [NXp - 88, NY.N2]], seg(u, 0.3, 0.9), ACC, 7); dot([[NXp - 88, NY.N2], [312, 200]], seg(u, 1.0, 1.5), GOOD, 7);
      mono(40, 360, 'rc.set("user:1", "Alice")  → OK', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(40, 388, 'rc.get("user:1")           → "Alice"', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      T(470, 140, '코드는 단일 노드와 같다', { 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { cnodes(u > 1.6 ? 'N2' : null); cache(baseRows().map((r) => ({ ...r, hot: r.n === 'N2' && u > 1.0 ? GOODBG : null })));
      mono(40, 50, '1) CRC16("user:1") % 16384 = 10778', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(40, 360, '2) 캐시에서 10778 → N2', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
      mono(40, 388, '3) N2 로만 보낸다 — 왕복 1번', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      dot([[312, 200], [NXp - 88, NY.N2]], seg(u, 1.6, 2.3), ACC, 7); return; }
    if (k === 3) { const upd = u > 1.4; cnodes(u > 1.6 ? 'N3' : null);
      cache([{ a: '0-5460', n: 'N1' }, { a: upd ? '10778' : '5461-10922', n: upd ? 'N3' : 'N2', hot: upd ? WARNBG : null }, { a: '10923-16383', n: 'N3' }]);
      dot([[312, 200], [NXp - 88, NY.N2]], seg(u, 0.2, 0.7), ACC, 7);
      if (u > 0.7) fly(NXp - 88, NY.N2, 470, 250, seg(u, 0.7, 1.3), 'MOVED 10778 N3', { stay: true, fill: WARN, mono: true });
      dot([[312, 200], [NXp - 88, NY.N3]], seg(u, 1.6, 2.2), ACC, 7); if (u > 2.2) check(NXp + 100, NY.N3, 10, pop(u, 2.2));
      mono(40, 388, '캐시 갱신 후 N3 로 재요청 → OK', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) }); return; }
    if (k === 4) { cnodes('N1'); card(170, 200, 220, 70, { rx: 10, stroke: INK, sw: 2, text: 'redis.Redis(port=7000)', fs: 14, mono: true });
      dot([[282, 200], [NXp - 88, NY.N1]], seg(u, 0.2, 0.8), INK, 7);
      if (u > 0.8) fly(NXp - 88, NY.N1, 420, 300, seg(u, 0.8, 1.4), 'MOVED 10778 …', { stay: true, fill: BAD, mono: true });
      mono(40, 370, 'redis.exceptions.ResponseError: MOVED 10778 ...', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
      T(40, 400, '자동 redirect 없음 — 에러로 던져진다', { 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { mono(40, 60, 'str(e).split()', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      [['"MOVED"', MUT], ['"10778"', INK], ['"N3:6379"', ACC]].forEach(([s, col], i) => { const x = 140 + i * 210; card(x, 140, 180, 50, { rx: 8, stroke: col, sw: 2, text: s, mono: true, fs: 16, color: col, s: pop(u, 0.5 + i * 0.3) });
        T(x, 192, ['_', 'slot', 'target'][i], { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, class: 'mono', opacity: fade(u, 0.7 + i * 0.3) }); });
      grow(570, 170, 640, 270, E(u, 1.5, 1.9), ACC); node(720, 300, 'N3', '6379', { w: 140 });
      mono(40, 300, 'host, port = target.split(":")', { 'font-size': 15, opacity: fade(u, 1.4) });
      mono(40, 330, '# 새 노드로 재요청', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.7) });
      T(40, 390, '이 코드를 직접 쓰고 있다면 클라이언트를 바꿀 때다', { 'font-weight': 700, fill: WARN, opacity: fade(u, 2.2) }); return; }
    // k6: MOVED vs ASK + 운영 가이드
    const ex = c.beat.viz.examples;
    ex.forEach((e, i) => { const y = 60 + i * 62, a = fade(u, 0.2 + i * 0.5), col = /ASK/.test(e.resp) ? WARN : /MOVED/.test(e.resp) ? INFO : GOOD;
      mono(40, y + 5, e.req, { 'font-size': 15, 'font-weight': 700, opacity: a });
      grow(300, y, 360, y, E(u, 0.3 + i * 0.5, 0.6 + i * 0.5), col);
      card(470, y, 200, 36, { rx: 8, stroke: col, sw: 2, text: e.resp, mono: true, fs: 14, color: col, op: a });
      T(590, y + 5, e.meaning, { 'font-size': 14.5, fill: MUT, opacity: a }); });
    ['cluster-aware 클라이언트', 'startup_nodes 3+', '매핑 캐시 TTL 짧게', 'hashtag', 'bigkey 감시'].forEach((s, i) => {
      const x = [130, 330, 520, 680, 820][i]; pill(x, 300 + (i % 2) * 50, s, ACC, pop(u, 1.6 + i * 0.15), { fs: 14 }); });
  }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: 'Replica 를 붙여도 해결되지 않는 단일 노드의 한계는?',
      o: ['노드가 죽었을 때의 가용성', '읽기 부하 분산', '데이터 크기 상한 — 서버 RAM 한 대'], a: 2,
      why: 'Replica 는 가용성을 올려 주지만 메모리 상한을 올려 주지는 않는다. 256GB 이상이거나 200K ops/s 를 넘기면 Cluster 로 수평 확장한다.' },
    { q: 'Redis Cluster 에서 키가 어느 노드로 갈지는 어떻게 정해지나?',
      o: ['CRC16(key) % 16384 로 slot 을 구하고, 그 slot 을 맡은 노드로 간다', '키 이름의 알파벳 순서로 노드를 나눈다', '빈 메모리가 가장 많은 노드로 간다'], a: 0,
      why: '16384개 slot 을 primary 가 나눠 맡는다(3대면 각 약 5461개). 예를 들어 mykey 는 slot 14687 이라 N3 가 담당한다.' },
    { q: 'Cluster 에서 MGET user:1 cart:1 이 CROSSSLOT 에러를 낸다. 어떻게 고치나?',
      o: ['클라이언트 timeout 을 늘린다', '{user:1}:cart 처럼 hashtag 로 같은 slot 에 묶는다', '노드를 하나 더 추가한다'], a: 1,
      why: '중괄호가 있으면 그 안쪽만 CRC16 대상이라 접두·접미가 달라도 같은 slot(10778)에 모인다. 대신 너무 크게 묶으면 한 노드로 부하가 쏠린다.' },
    { q: '새 노드 7006 을 add-node 로 합류시킨 직후, 이 노드가 처리하는 트래픽은?',
      o: ['없다 — slot 을 받기 전까지 아무것도 처리하지 않는다', '곧바로 전체 트래픽의 1/4', '모든 읽기 요청'], a: 0,
      why: '노드를 띄우기, 합류시키기, slot 주기는 별개 단계다. reshard 로 4096 slot 을 옮겨야 그 slot 의 키와 트래픽이 함께 따라온다.' },
    { q: 'MOVED 와 ASK 응답은 어떻게 다른가?',
      o: ['같은 뜻이고 Redis 버전만 다르다', 'ASK 는 영구 이동이라 캐시를 고치고, MOVED 는 이번 요청만 돌려보낸다', 'MOVED 는 영구 이동이라 매핑 캐시를 고치고, ASK 는 이동 중인 slot 의 이번 요청만 돌려보낸다'], a: 2,
      why: '캐시가 낡으면 MOVED 를 받고 매핑을 갱신한다. ASK 는 reshard 도중 이미 옮겨진 키에만 오며, ASKING 후 한 번만 다시 보내고 캐시는 그대로 둔다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '단일 노드의 데이터는 서버 RAM 한 대를 넘을 수 없다. replica를 붙여도 이 상한은 그대로다.',
    'Cluster는 16384개 slot을 primary들이 나눠 맡는다. 키의 slot은 CRC16(key) % 16384로 정해진다.',
    'slot이 다른 키는 MGET 같은 multi-key 명령에 같이 못 쓴다. hashtag로 같은 slot에 묶는다.',
    '노드를 더하면 reshard로 slot을 옮긴다. 클라이언트가 MOVED와 ASK를 따라가 서비스는 멈추지 않는다.',
  ];
  const review = [
    { q: '데이터가 64GB에 한참 못 미치는 서비스가 장애 대비를 이유로 Cluster를 도입하려 한다. 더 맞는 선택은?',
      o: ['규모와 상관없이 Cluster부터 만든다', 'hashtag로 모든 키를 한 slot에 묶는다', '단일 노드에 replica와 Sentinel을 붙인다'], a: 2,
      why: '장애 대비는 replica와 Sentinel로 된다. Cluster는 메모리나 처리량이 한 대를 넘을 때 쓰는 것이라, 규모를 재지 않고 들이면 운영 비용만 는다.' },
    { q: '한 유저의 프로필, 장바구니, 주문을 모두 {user:1} 같은 hashtag로 묶었더니 인기 유저가 있는 노드만 CPU가 높다. 무엇이 문제인가?',
      o: ['묶는 단위가 너무 커서 한 노드로 부하가 쏠렸다', 'CRC16 계산이 무거워 그 노드가 느려졌다', '매핑 캐시가 낡아 MOVED가 반복된다'], a: 0,
      why: 'hashtag는 분산을 포기하는 대가로 multi-key를 얻는다. 인기 유저의 데이터가 한 slot에 모이면 그 노드만 뜨거워진다.' },
    { q: 'Cluster로 옮긴 뒤 일반 Redis 클라이언트로 붙인 앱이 MOVED 에러를 자주 낸다. 가장 맞는 대처는?',
      o: ['MOVED 문자열을 파싱해 다시 보내는 코드를 곳곳에 넣는다', 'cluster-aware 클라이언트로 바꾸고 시작 노드를 여러 개 준다', 'slot을 노드 하나에 모두 몰아준다'], a: 1,
      why: 'cluster-aware 클라이언트는 slot 매핑을 캐시해 맞는 노드로 바로 보내고, MOVED를 받으면 스스로 매핑을 고친다. 시작 노드가 여럿이면 한 대가 죽어도 붙는다.' },
  ];

  R.page({ title: 'Redis Cluster 의 slot 지도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
