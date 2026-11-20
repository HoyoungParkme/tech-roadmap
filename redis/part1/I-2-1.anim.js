/* I-2-1 Redis vs Memcached vs DragonflyDB vs 포크 — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, pill, banner, grow, fly, dot, server, redisBox, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const H = { 'font-size': 14, 'font-weight': 700, fill: MUT };
  const T = (x, y, s, a) => tx(x, y, s, a);
  const mid = (x, y, s, o) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }, o || {}));
  // CPU 코어 줄: busy(i) → 0~1
  function cores(x, y, n, busy, o) { o = o || {};
    for (let i = 0; i < n; i++) { const b = busy(i), cx = x + i * 62;
      el('rect', { x: cx, y, width: 50, height: 50, rx: 6, fill: b > 0.5 ? (o.col || ACC) : PANEL, stroke: b > 0.5 ? 'none' : GRID, 'stroke-width': 1.8, opacity: o.op ?? 1 });
      [10, 20, 30, 40].forEach((d) => { el('line', { x1: cx + d, y1: y - 6, x2: cx + d, y2: y, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 }); el('line', { x1: cx + d, y1: y + 50, x2: cx + d, y2: y + 56, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 }); });
      mono(cx + 25, y + 31, b > 0.5 ? 'run' : 'idle', { 'font-size': 13.5, 'text-anchor': 'middle', fill: b > 0.5 ? PANEL : MUT, opacity: o.op ?? 1 }); } }

  // ---------- 1. Redis ----------
  const DS = ['String', 'List', 'Hash', 'Set', 'Sorted Set', 'Stream', 'HyperLogLog', 'Geo', 'Bitmap'];
  function loop(cx, cy, r, t, u, o) { o = o || {};
    el('circle', { cx, cy, r, fill: 'none', stroke: o.col || ACC, 'stroke-width': 3, opacity: o.op ?? 1 });
    const a = -Math.PI / 2 + t * 2.4; el('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 9, fill: o.col || ACC, opacity: o.op ?? 1 });
    mid(cx, cy - 4, '이벤트 루프', { 'font-size': 16, opacity: o.op ?? 1 }); mono(cx, cy + 20, 'thread × 1', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: o.op ?? 1 }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { loop(200, 190, 92, t, u, { op: fade(u, 0.1) });
      ['SET', 'GET', 'INCR', 'ZADD'].forEach((s, i) => { const p = clamp(u * 0.9 - i * 0.35), x = lerp(40, 200, E(p, 0, 1)), y = lerp(330, 98, E(p, 0, 1));
        if (p > 0 && p < 1) pill(x, y, s, INK, 1, { mono: true, fs: 14 }); });
      mid(200, 330, '명령 하나씩 차례로 = 원자적', { fill: ACC, opacity: fade(u, 1.8) });
      tx(440, 58, '자료구조 9종', Object.assign({ opacity: fade(u, 0.4) }, H));
      DS.forEach((s, i) => { const cx = 510 + (i % 3) * 150, cy = 92 + Math.floor(i / 3) * 52; pill(cx, cy, s, ACC, pop(u, 0.5 + i * 0.1), { mono: true, fs: 14 }); });
      tx(440, 268, '그 위에 얹은 기능', Object.assign({ opacity: fade(u, 1.6) }, H));
      ['Pub/Sub', 'Lua', 'MULTI/EXEC'].forEach((s, i) => pill(510 + i * 150, 302, s, INFO, pop(u, 1.7 + i * 0.15), { mono: true, fs: 14 }));
      return; }
    if (k === 1) { redisBox(480, 200, { w: 150, h: 60, s: pop(u, 0.1) });
      [['Python', 170, 90], ['Java', 140, 200], ['Go', 170, 310], ['JS', 790, 90], ['Rust', 820, 200]].forEach(([s, x, y], i) => { const a = 0.3 + i * 0.25;
        grow(x + (x < 480 ? 46 : -46), y, x < 480 ? 400 : 560, 200 + (y - 200) * 0.25, E(u, a, a + 0.4), MUT, { plain: true });
        pill(x, y, s, INK, pop(u, a), { mono: true, fs: 15 }); });
      pill(800, 310, 'p99 < 1 ms', ACC, pop(u, 1.7), { mono: true, fs: 16 });
      mid(480, 380, '모든 언어에 클라이언트 · 트러블슈팅 자료가 가장 많다', { fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 2) {
      tx(60, 50, 'CPU 코어', Object.assign({ opacity: fade(u, 0.1) }, H));
      cores(60, 72, 4, (i) => (i === 0 ? 1 : 0), { op: fade(u, 0.2) });
      mid(184, 160, '한 개만 일한다', { fill: BAD, opacity: fade(u, 0.7) });
      tx(560, 50, '라이선스', Object.assign({ opacity: fade(u, 1.8) }, H));
      [['BSD', GOOD], ['SSPL', WARN], ['AGPL', BAD]].forEach(([s, col], i) => { pill(600 + i * 120, 96, s, col, pop(u, 1.9 + i * 0.2), { mono: true, fs: 15 });
        if (i) grow(600 + (i - 1) * 120 + 34, 96, 600 + i * 120 - 36, 96, E(u, 1.95 + i * 0.2, 2.15 + i * 0.2), MUT); });
      mono(720, 140, '2024', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.4) });
      // 한 줄 처리 레인
      el('rect', { x: 40, y: 220, width: 880, height: 64, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.8) });
      tx(56, 210, '명령 실행 줄 (스레드 1개)', Object.assign({ opacity: fade(u, 0.8) }, H));
      const bw = 300 * E(u, 1.0, 1.5); el('rect', { x: 600, y: 230, width: bw, height: 44, rx: 8, fill: BAD, opacity: 0.9 });
      if (u > 1.4) mono(750, 258, 'LRANGE big 0 -1', { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' });
      ['GET', 'SET', 'GET', 'INCR', 'GET'].forEach((s, i) => { const x = lerp(80 + i * 90, 160 + i * 90, E(u, 1.2, 1.8)); pill(x + 20, 252, s, BAD, pop(u, 1.3 + i * 0.08), { mono: true, fs: 14, fill: PANEL }); });
      mid(480, 330, '큰 키 하나를 훑는 동안 뒤의 요청이 전부 기다린다', { fill: BAD, opacity: fade(u, 1.7) }); return; }
    if (k === 3) { // Redis 6 I/O 스레드
      tx(40, 46, '클라이언트 소켓', Object.assign({ opacity: fade(u, 0.1) }, H));
      for (let i = 0; i < 6; i++) { const y = 84 + i * 50; el('circle', { cx: 80, cy: y, r: 11, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.1 + i * 0.05) }); }
      tx(250, 46, 'io-threads (읽기 · 쓰기)', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.4) });
      [0, 1, 2].forEach((j) => { const y = 108 + j * 100, a = fade(u, 0.4 + j * 0.15);
        el('rect', { x: 250, y: y - 24, width: 200, height: 48, rx: 10, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: a });
        mono(350, y + 5, 'I/O ' + (j + 1), { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: a });
        [0, 1].forEach((q) => { const sy = 84 + (j * 2 + q) * 50; el('line', { x1: 92, y1: sy, x2: 250, y2: y, stroke: GRID, 'stroke-width': 1.8, opacity: a });
          dot([[92, sy], [250, y]], ((t * 0.7 + q * 0.5 + j * 0.2) % 1), INFO, 4.5); });
        el('line', { x1: 450, y1: y, x2: 560, y2: 208, stroke: GRID, 'stroke-width': 1.8, opacity: fade(u, 1.0) });
        dot([[450, y], [560, 208]], seg(u, 1.0 + j * 0.35, 1.5 + j * 0.35), INFO, 6); });
      el('rect', { x: 560, y: 176, width: 360, height: 64, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.9) });
      tx(574, 166, '명령 실행 스레드 1개', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      ['SET', 'GET', 'INCR'].forEach((s, i) => pill(640 + i * 100, 208, s, ACC, pop(u, 1.5 + i * 0.35), { mono: true, fs: 14, fill: PANEL }));
      mid(740, 290, '명령은 여전히 한 줄로 선다', { fill: ACC, opacity: fade(u, 2.3) });
      mono(740, 370, 'Redis 6.0+  io-threads', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.6) }); return; }
    // k 4 언제
    redisBox(480, 200, { w: 160, h: 64, s: pop(u, 0.1) });
    [['캐시', 'GET/SET', 180, 90], ['랭킹', 'Sorted Set', 160, 200], ['큐', 'List', 180, 310], ['분산 락', 'SET NX', 780, 90], ['이벤트', 'Stream', 800, 200], ['알림', 'Pub/Sub', 780, 310]].forEach(([a, b, x, y], i) => { const s = pop(u, 0.3 + i * 0.2);
      grow(x + (x < 480 ? 70 : -70), y, x < 480 ? 395 : 565, 200 + (y - 200) * 0.3, E(u, 0.3 + i * 0.2, 0.7 + i * 0.2), GRID, { plain: true });
      card(x, y, 130, 58, { rx: 10, stroke: ACC, sw: 1.8, s });
      tx(x, y - 4, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.35 + i * 0.2) });
      mono(x, y + 18, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.35 + i * 0.2) }); });
    banner(480, 380, '모르겠으면 Redis', pop(u, 1.8)); }

  // ---------- 2. Memcached ----------
  const MC = (cx, cy, o) => card(cx, cy, o.w || 180, o.h || 54, { rx: 10, stroke: INFO, sw: 2.5, fill: INFOBG, text: 'Memcached', fs: 16, fw: 800, color: INFO, s: o.s, op: o.op });
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { MC(200, 66, { s: pop(u, 0.1) });
      tx(76, 128, 'CPU 코어 전부', Object.assign({ opacity: fade(u, 0.3) }, H));
      cores(76, 146, 4, (i) => (u > 0.4 + i * 0.12 ? 1 : 0), { col: INFO });
      mid(200, 240, '멀티스레드', { fill: INFO, opacity: fade(u, 0.9) });
      const wipe = E(u, 1.9, 2.4);
      el('rect', { x: 470, y: 50, width: 450, height: 200, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      tx(484, 74, '메모리 — key → byte', H);
      [['page:/home', '<html>…'], ['session:abc', '0x7b 0x22 …'], ['user:1', '"Alice"']].forEach(([kk, v], i) => { const y = 108 + i * 44, a = fade(u, 1.0 + i * 0.15) * (1 - 0.75 * wipe);
        mono(490, y, kk, { 'font-size': 14.5, 'font-weight': 700, opacity: a }); mono(690, y, v, { 'font-size': 14.5, fill: MUT, opacity: a }); });
      if (wipe > 0) mid(695, 238, '재시작 → 전부 사라짐', { fill: BAD, opacity: wipe });
      [['List', 0], ['Hash', 1], ['Sorted Set', 2]].forEach(([s, i]) => { pill(540 + i * 140, 310, s, MUT, pop(u, 1.4 + i * 0.1), { mono: true, fs: 14 }); if (u > 1.6) cross(540 + i * 140 + tw(s, 14) / 2 + 30, 310, 8, pop(u, 1.6 + i * 0.1)); });
      tx(470, 366, '자료구조 없음 · 영속성 없음', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { tx(60, 46, 'slab allocator — 크기별 칸을 미리 나눈다', Object.assign({ opacity: fade(u, 0.1) }, H));
      [[6, 40], [4, 64], [2, 136]].forEach(([n, w], r) => { const y = 70 + r * 72, a = fade(u, 0.2 + r * 0.2);
        mono(60, y + 33, 'slab ' + (r + 1), { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: a });
        for (let i = 0; i < n; i++) { const x = 150 + i * (w + 8), filled = u > 1.0 + r * 0.35 && i < (r === 2 ? 1 : 2);
          el('rect', { x, y: y + 8, width: w, height: 40, rx: 4, fill: filled ? INFO : PANEL, stroke: INFO, 'stroke-width': 1.5, opacity: a * (filled ? 0.8 : 1) }); } });
      [['작은 값', 0], ['중간 값', 1], ['큰 값', 2]].forEach(([s, r]) => fly(560, 92 + r * 72, 190, 98 + r * 72, seg(u, 0.6 + r * 0.35, 1.0 + r * 0.35), s, { fill: INFO }));
      mid(330, 300, '맞는 칸에 넣는다 → 조각이 덜 생긴다', { fill: INFO, opacity: fade(u, 1.9) });
      pill(760, 150, 'BSD', GOOD, pop(u, 2.0), { mono: true, fs: 18 });
      mid(760, 196, '라이선스 변동 없음', { fill: GOOD, opacity: fade(u, 2.2) }); return; }
    if (k === 2) {
      tx(40, 46, '없는 기능', Object.assign({ opacity: fade(u, 0.1) }, H));
      ['Pub/Sub', 'Stream', 'MULTI/EXEC'].forEach((s, i) => { pill(100, 90 + i * 56, s, MUT, pop(u, 0.2 + i * 0.15), { mono: true, fs: 15 }); if (u > 0.6) cross(100 + tw(s, 15) / 2 + 34, 90 + i * 56, 9, pop(u, 0.6 + i * 0.12)); });
      // 클라이언트 쪽 해시
      card(420, 200, 150, 60, { rx: 10, text: '클라이언트\nhash(key)', fs: 14.5, stroke: ACC, s: pop(u, 0.9) });
      [90, 200, 310].forEach((y, i) => { const on = i === 1; MC(780, y, { w: 170, h: 48, s: pop(u, 1.0 + i * 0.1) });
        grow(496, 200, 692, y, E(u, 1.3, 1.7), on ? ACC : GRID, { plain: !on }); });
      dot([[496, 200], [692, 200]], seg(u, 1.8, 2.3), ACC, 7);
      mid(420, 260, '어느 서버? 클라이언트가 정한다', { fill: WARN, opacity: fade(u, 1.6) });
      mid(780, 380, '서버끼리는 서로 모른다', { fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { tx(40, 46, 'Memcached', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.1) });
      ['get', 'set', 'add', 'replace', 'delete', 'incr', 'decr'].forEach((s, i) => pill(90 + (i % 2) * 130, 90 + Math.floor(i / 2) * 56, s, INFO, pop(u, 0.2 + i * 0.1), { mono: true, fs: 16 }));
      mono(160, 340, '7개', { 'font-size': 26, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(400, 46, 'Redis', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) });
      const shown = Math.round(200 * E(u, 1.2, 2.2));
      for (let i = 0; i < shown; i++) el('rect', { x: 400 + (i % 25) * 20, y: 66 + Math.floor(i / 25) * 26, width: 14, height: 18, rx: 3, fill: ACC, opacity: 0.75 });
      mono(650, 340, '200+', { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      mid(480, 392, '명령 수 = 표현력', { fill: MUT, opacity: fade(u, 2.4) }); return; }
    MC(480, 200, { w: 200, h: 60, s: pop(u, 0.1) });
    [['페이지 캐시', 200, 110], ['세션 캐시', 200, 290]].forEach(([s, x, y], i) => { const a = 0.4 + i * 0.3;
      grow(x + 80, y, 380, 200 + (y - 200) * 0.3, E(u, a, a + 0.4), GOOD, { plain: true }); card(x, y, 160, 50, { rx: 25, text: s, fs: 15, stroke: GOOD, s: pop(u, a) }); check(x - 100, y, 10, pop(u, a + 0.2)); });
    [['랭킹', 760, 90], ['큐', 760, 200], ['분산 락', 760, 310]].forEach(([s, x, y], i) => { const a = 1.2 + i * 0.2;
      card(x, y, 140, 46, { rx: 23, text: s, fs: 15, stroke: OFF, color: MUT, s: pop(u, a) }); cross(x + 92, y, 9, pop(u, a + 0.15)); });
    mid(480, 380, '진짜 캐시만 필요하고 운영을 단순하게', { fill: INFO, opacity: fade(u, 2.0) }); }

  // ---------- 3. DragonflyDB ----------
  const DF = (cx, cy, o) => card(cx, cy, o.w || 190, o.h || 56, { rx: 10, stroke: WARN, sw: 2.5, fill: WARNBG, text: o.text || 'DragonflyDB', fs: 16, fw: 800, color: WARN, s: o.s, op: o.op });
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { R.snippet(40, 70, ['r = redis.Redis(host="cache")', 'r.set("post:42", data)'], { fs: 15 });
      tx(40, 56, '앱 코드 — 그대로', Object.assign({ opacity: 1 }, H));
      const sw = E(u, 0.6, 1.3);
      grow(380, 110, 520, 110, 1, MUT);
      redisBox(640, 110 - sw * 60, { w: 190, h: 56, op: 1 - sw });
      DF(640, 110 + (1 - sw) * 60, { op: sw });
      tx(40, 236, '단일 노드 처리량', Object.assign({ opacity: fade(u, 1.3) }, H));
      [['Redis', 200, ACC, 0], ['DragonflyDB', 1000, WARN, 1]].forEach(([n, v, col, i]) => { const y = 270 + i * 54, g = E(u, 1.4 + i * 0.4, 2.2 + i * 0.4);
        tx(40, y + 6, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.3) });
        el('rect', { x: 190, y: y - 12, width: Math.max(0.1, 600 * v / 1000 * g), height: 24, rx: 5, fill: col, opacity: 0.85 });
        mono(190 + 600 * v / 1000 * g + 10, y + 6, v === 1000 ? '1M ops' : '200K ops', { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.8 + i * 0.4) }); });
      return; }
    if (k === 1) { card(110, 210, 130, 50, { rx: 10, text: 'Client', fs: 15, s: pop(u, 0.1) });
      grow(176, 210, 300, 210, E(u, 0.3, 0.6), MUT);
      card(380, 210, 150, 56, { rx: 10, text: 'shard router', fs: 15, mono: true, stroke: WARN, sw: 2.5, s: pop(u, 0.5) });
      [['shard1', 90], ['shard2', 210], ['shard3', 330]].forEach(([s, y], i) => { const a = 0.9 + i * 0.2;
        grow(456, 210, 600, y, E(u, a, a + 0.4), WARN, { plain: true });
        el('rect', { x: 600, y: y - 44, width: 320, height: 88, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 2, opacity: fade(u, a) });
        mono(616, y - 18, s + ' · 코어 ' + (i + 1), { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, a) });
        tx(616, y + 10, '자기 메모리', { 'font-size': 14, opacity: fade(u, a) }); tx(616, y + 32, '자기 큐', { 'font-size': 14, opacity: fade(u, a) });
        for (let q = 0; q < 4; q++) el('rect', { x: 730 + q * 20, y: y + 18, width: 14, height: 18, rx: 2, fill: WARN, opacity: fade(u, a) * 0.7 });
        for (let q = 0; q < 6; q++) el('rect', { x: 730 + q * 26, y: y - 6, width: 20, height: 18, rx: 2, fill: SOFT, stroke: GRID, opacity: fade(u, a) }); });
      dot([[176, 210], [300, 210], [456, 210], [600, 90]], seg(u, 1.6, 2.2), ACC, 7);
      mid(380, 300, '코어 사이 공유 없음', { fill: WARN, opacity: fade(u, 2.0) });
      mid(380, 326, '→ 락 없음', { fill: WARN, opacity: fade(u, 2.2) }); return; }
    if (k === 2) {
      tx(60, 46, 'Redis cluster', Object.assign({ opacity: fade(u, 0.1) }, H));
      [0, 1, 2].forEach((i) => server(120 + i * 130, 140, null, { s: pop(u, 0.1 + i * 0.1) }));
      [0, 1].forEach((i) => grow(180 + i * 130, 140, 190 + i * 130, 140, 1, GRID, { plain: true }));
      mid(250, 230, '재분할 · 리밸런싱 운영', { fill: MUT, opacity: fade(u, 0.5) });
      if (u > 1.0) { const s = pop(u, 1.0); el('line', { x1: 50, y1: 80, x2: 450, y2: 250, stroke: BAD, 'stroke-width': 4, opacity: s }); }
      DF(700, 140, { w: 260, h: 110, text: 'DragonflyDB\n노드 1대', s: pop(u, 0.7) });
      pill(700, 232, '256GB 도 단일 노드', WARN, pop(u, 1.3), { fs: 14 });
      [['메모리 30% ↓ (주장)', WARN], ['BSL · 소스 공개', MUT]].forEach(([s, col], i) => pill(300 + i * 360, 330, s, col, pop(u, 1.8 + i * 0.3), { fs: 15 }));
      return; }
    if (k === 3) {
      R.snippet(40, 60, ['EVAL "return redis.call(...)" 0'], { fs: 15 });
      DF(200, 190, { w: 200, h: 52, s: pop(u, 0.4) }); grow(200, 130, 200, 160, E(u, 0.5, 0.8), MUT);
      pill(200, 262, '100% 호환은 아니다', WARN, pop(u, 1.0), { fs: 15 });
      tx(540, 56, '막혔을 때 찾을 자료', Object.assign({ opacity: fade(u, 1.2) }, H));
      [['Redis', 12, ACC, 600], ['Dragonfly', 3, WARN, 800]].forEach(([n, h, col, x], i) => { const g = E(u, 1.3 + i * 0.3, 2.0 + i * 0.3);
        for (let j = 0; j < Math.round(h * g); j++) el('rect', { x: x - 50, y: 320 - j * 18, width: 100, height: 14, rx: 2, fill: col, opacity: 0.75 });
        mid(x, 350, n, { fill: col, opacity: fade(u, 1.3) }); });
      mid(200, 340, '쓰는 명령을 먼저 돌려 보라', { fill: MUT, opacity: fade(u, 2.3) }); return; }
    // k 4 언제
    tx(60, 56, 'Redis 단일 노드', Object.assign({ opacity: fade(u, 0.1) }, H));
    const g = E(u, 0.2, 1.0); el('rect', { x: 60, y: 76, width: 360, height: 30, rx: 6, fill: SOFT, stroke: GRID });
    el('rect', { x: 60, y: 76, width: 360 * g, height: 30, rx: 6, fill: BAD, opacity: 0.85 });
    mono(240, 97, '처리량 한계', { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
    el('line', { x1: 420, y1: 66, x2: 420, y2: 116, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 0.9) });
    tx(60, 176, '메모리', Object.assign({ opacity: fade(u, 1.0) }, H));
    el('rect', { x: 60, y: 196, width: 360, height: 30, rx: 6, fill: SOFT, stroke: GRID, opacity: fade(u, 1.0) });
    el('rect', { x: 60, y: 196, width: 360 * E(u, 1.1, 1.7), height: 30, rx: 6, fill: WARN, opacity: 0.8 });
    mono(240, 217, '128GB+', { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    grow(450, 150, 560, 150, E(u, 1.8, 2.1), WARN);
    DF(720, 150, { w: 230, h: 70, text: 'DragonflyDB', s: pop(u, 2.0) });
    mid(480, 330, '한계에 닿았을 때만 — 측정한 뒤에', { fill: MUT, opacity: fade(u, 2.3) }); }

  // ---------- 4. 포크 ----------
  const YX = (y) => 70 + (y - 2009) * 46;   // 2009 → 70, 2024 → 760
  const TR = 210;
  function trunk(u, k, o) { o = o || {};
    const g = k === 0 ? E(u, 0.1, 0.8) : 1, end = 900, x1 = lerp(YX(2009), end, g), lic = o.lic || 0;
    el('line', { x1: YX(2009), y1: TR, x2: Math.min(x1, YX(2024)), y2: TR, stroke: GOOD, 'stroke-width': 7, 'stroke-linecap': 'round' });
    if (x1 > YX(2024)) el('line', { x1: YX(2024), y1: TR, x2: x1, y2: TR, stroke: lic ? BAD : GOOD, 'stroke-width': 7, 'stroke-linecap': 'round' });
    [2009, 2019, 2024].forEach((y) => { mono(YX(y), TR + 34, String(y), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, k === 0 ? 0.3 : 0) }); });
    tx(YX(2009), TR - 16, 'Redis', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    tx(YX(2009) + 70, TR - 16, lic ? 'BSD …' : 'BSD', { 'font-size': 14, 'font-weight': 700, fill: GOOD });
    if (lic) { pill(840, TR - 30, 'SSPL / AGPL', BAD, lic, { mono: true, fs: 14 }); } }
  function keydb(u, k) { const g = k === 0 ? E(u, 0.9, 1.5) : 1, bx = YX(2019);
    el('path', { d: `M${bx},${TR} C${bx + 30},${TR} ${bx + 20},${TR + 90} ${bx + 60},${TR + 90}`, fill: 'none', stroke: INFO, 'stroke-width': 5, opacity: g });
    el('line', { x1: bx + 60, y1: TR + 90, x2: bx + 60 + 80 * g, y2: TR + 90, stroke: INFO, 'stroke-width': 5, opacity: g });
    el('line', { x1: bx + 140, y1: TR + 90, x2: bx + 140 + 120 * (k === 0 ? E(u, 1.8, 2.4) : 1), y2: TR + 90, stroke: INFO, 'stroke-width': 4, 'stroke-dasharray': '4 8', opacity: g * 0.7 });
    tx(bx + 66, TR + 120, 'KeyDB', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: g }); }
  function valkey(u, k) { const g = k === 1 ? E(u, 0.3, 1.0) : 1, bx = YX(2024) - 16;
    el('path', { d: `M${bx},${TR} C${bx + 30},${TR} ${bx + 20},${TR - 100} ${bx + 60},${TR - 100}`, fill: 'none', stroke: GOOD, 'stroke-width': 5, opacity: g });
    el('line', { x1: bx + 60, y1: TR - 100, x2: bx + 60 + 120 * g, y2: TR - 100, stroke: GOOD, 'stroke-width': 5, opacity: g });
    tx(bx + 66, TR - 116, 'Valkey · BSD', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: g }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) { trunk(u, k, { lic: k >= 2 ? (k === 2 ? pop(u, 0.4) : 1) : 0 }); keydb(u, k);
      if (k >= 1) valkey(u, k);
      if (k === 0) { [['Snap 주도', 0.9], ['+ 멀티스레드', 1.2]].forEach(([s, a], i) => tx(YX(2019) + 66, TR + 150 + i * 24, s, { 'font-size': 14.5, opacity: fade(u, a) }));
        const ax = 300, ay = 330; card(ax - 70, ay, 90, 40, { rx: 8, text: 'node A', fs: 14, mono: true, stroke: INFO, s: pop(u, 1.4) }); card(ax + 70, ay, 90, 40, { rx: 8, text: 'node B', fs: 14, mono: true, stroke: INFO, s: pop(u, 1.4) });
        grow(ax - 22, ay - 7, ax + 22, ay - 7, E(u, 1.6, 1.9), INFO); grow(ax + 22, ay + 7, ax - 22, ay + 7, E(u, 1.7, 2.0), INFO);
        tx(ax, ay + 44, 'Active-Active 복제', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.9) });
        tx(YX(2019) + 210, TR + 76, '2022~ 둔화', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.3) }); return; }
      if (k === 1) { [['7.2.4 직전에서 갈라짐', 1.0], ['Linux Foundation', 1.4], ['AWS · Google · Oracle 주도', 1.8]].forEach(([s, a], i) => tx(470, 50 + i * 24, s, { 'font-size': 14.5, 'font-weight': i ? 400 : 700, opacity: fade(u, a) }));
        pill(820, 350, 'ElastiCache 새 기본', GOOD, pop(u, 2.2), { fs: 15 }); return; }
      if (k === 2) { const a = fade(u, 1.2);
        el('path', { d: 'M100,330 a26,26 0 0 1 40,-26 a32,32 0 0 1 58,8 a22,22 0 0 1 6,44 h-96 a20,20 0 0 1 -8,-26 z', fill: PANEL, stroke: INK, 'stroke-width': 2.2, opacity: a });
        if (u > 1.6) cross(150, 340, 14, pop(u, 1.6));
        tx(230, 345, '클라우드 상업 사용 제약', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
        tx(40, 380, 'Redis Inc. 가 라이선스를 바꿨다 (2024)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) }); return; }
      // k 3 대응
      ['AWS', 'Google'].forEach((s, i) => fly(120 + i * 140, 360, YX(2024) + 120, TR - 100, seg(u, 0.3 + i * 0.3, 1.1 + i * 0.3), s, { fill: GOOD }));
      const x = lerp(560, 870, E(u, 1.4, 2.2)), y = lerp(TR + 60, TR - 72, E(u, 1.4, 2.2));
      pill(x, y, 'ElastiCache 기본', GOOD, 1, { fs: 14 });
      tx(40, 380, 'BSD 를 지킨 포크로 갈아탔다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) }); return; }
    if (k === 4) { card(720, 210, 220, 80, { rx: 12, stroke: GOOD, sw: 2.5, fill: GOODBG, text: 'Valkey', fs: 19, fw: 800, color: GOOD, s: pop(u, 0.1) });
      [['redis-py', 110], ['ioredis', 310]].forEach(([s, y], i) => { const a = 0.4 + i * 0.3;
        card(160, y, 160, 48, { rx: 10, text: s, fs: 16, mono: true, s: pop(u, a) });
        grow(242, y, 606, 210 + (y - 210) * 0.3, E(u, a + 0.2, a + 0.7), GOOD);
        ['SET', 'GET'].forEach((cmd, j) => dot([[242, y], [606, 210 + (y - 210) * 0.3]], ((t * 0.6 + j * 0.5) % 1) * (u > a + 0.7 ? 1 : 0), GOOD, 5)); });
      check(720, 290, 11, pop(u, 1.6)); tx(744, 296, '명령어 100% 동일', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      mid(420, 390, '클라이언트 교체 불필요 → 전환 비용 거의 0', { fill: MUT, opacity: fade(u, 2.1) }); return; }
    tx(60, 56, '무엇이 가장 중요한가', Object.assign({ opacity: fade(u, 0.1) }, H));
    [['상업 클라우드 · 라이선스', 'Valkey', GOOD], ['자체 운영 · 안정성', 'Redis', ACC], ['멀티스레드가 핵심', 'KeyDB / Dragonfly', WARN]].forEach(([q, a, col], i) => { const y = 120 + i * 90, s = pop(u, 0.3 + i * 0.45);
      card(220, y, 330, 58, { rx: 29, text: q, fs: 16, s });
      grow(392, y, 560, y, E(u, 0.6 + i * 0.45, 0.9 + i * 0.45), col);
      card(720, y, 260, 58, { rx: 10, text: a, fs: 17, fw: 800, color: col, stroke: col, sw: 2.5, s: pop(u, 0.8 + i * 0.45) }); }); }

  // ---------- 5. 결정 트리 ----------
  const QS = [['Q1', '자료구조(List/Hash/ZSet) 필요?'], ['Q2', '영속성(재시작 후 유지) 필요?'], ['Q3', 'ElastiCache 등 · 라이선스 민감?'], ['Q4', '단일 노드 처리량 한계?']];
  const QY = (i) => 50 + i * 88, QX = 250, LX = 730;
  function tree(k, u) { const act = Math.min(k, 3), show = (i) => i <= act;
    QS.forEach(([q, s], i) => { if (!show(i)) return; const on = i === act && k <= 3, a = i === k ? fade(u, 0.1) : 1;
      el('rect', { x: QX - 200, y: QY(i) - 24, width: 400, height: 48, rx: 10, fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, 'stroke-width': on ? 2.5 : 1.5, opacity: a });
      mono(QX - 186, QY(i) + 5, q, { 'font-size': 15, 'font-weight': 800, fill: on ? ACC : MUT, opacity: a });
      tx(QX - 146, QY(i) + 5, s, { 'font-size': 15, 'font-weight': 600, opacity: a }); });
    const leaf = (i, y, s, col, lab, a, g) => { grow(QX + 200, QY(i), LX - 130, y, g, col, {}); if (g > 0.5) mono((QX + 200 + LX - 130) / 2, (QY(i) + y) / 2 - 8, lab, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle' });
      card(LX, y, 250, 40, { rx: 20, text: s, fs: 15, fw: 800, color: col, stroke: col, sw: 2, s: a }); };
    const down = (i, g) => { grow(QX, QY(i) + 24, QX, QY(i + 1) - 26, g, MUT); if (g > 0.5) mono(QX + 10, QY(i) + 50, i === 2 ? 'NO' : 'YES', { 'font-size': 14, 'font-weight': 700, fill: MUT }); };
    const st = (i, a0) => (i === k ? [E(u, a0, a0 + 0.5), pop(u, a0 + 0.4)] : [1, 1]);
    if (show(0)) { const [g, a] = st(0, 0.5); leaf(0, QY(0), 'Memcached', INFO, 'NO', a, g); }
    if (show(1)) { if (k >= 1) down(0, k === 1 ? E(u, 0.1, 0.4) : 1); const [g, a] = st(1, 0.6); leaf(1, QY(1), 'Memcached or Redis', INFO, 'NO', a, g); }
    if (show(2)) { if (k >= 2) down(1, k === 2 ? E(u, 0.1, 0.4) : 1); const [g, a] = st(2, 0.6); leaf(2, QY(2), 'Valkey (BSD)', GOOD, 'YES', a, g); }
    if (show(3)) { if (k >= 3) down(2, k === 3 ? E(u, 0.1, 0.4) : 1); const [g, a] = st(3, 0.6); leaf(3, QY(3) - 22, 'DragonflyDB', WARN, 'YES', a, g);
      const [g2, a2] = k === 3 ? [E(u, 1.4, 1.9), pop(u, 1.8)] : [1, 1]; grow(QX + 200, QY(3) + 10, LX - 130, QY(3) + 34, g2, ACC, {});
      card(LX, QY(3) + 34, 250, 40, { rx: 20, text: 'Redis (기본)', fs: 15, fw: 800, color: ACC, stroke: ACC, sw: 2.5, s: a2 });
      if (g2 > 0.5) mono(QX + 270, QY(3) + 42, 'NO', { 'font-size': 14, 'font-weight': 700, fill: ACC }); } }
  function s5(t, c) { const { k, u } = c;
    if (k <= 3) { tree(k, u);
      const notes = ['자료구조가 필요하면 Memcached 탈락', '캐시는 날아가도 되지만 세션·큐·랭킹은 다르다', '관리형이면 사실상 Valkey 가 기본값', '처리량 한계는 측정한 뒤에 말한다'];
      tx(50, 404, notes[k], { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { tx(60, 50, '실무 빈도', H);
      [['Redis', 70, ACC], ['Valkey', 15, GOOD], ['Memcached', 10, INFO], ['Dragonfly', 4, WARN], ['KeyDB', 1, MUT]].forEach(([n, v, col], i) => { const y = 92 + i * 60, g = E(u, 0.2 + i * 0.2, 1.0 + i * 0.2);
        tx(60, y + 6, n, { 'font-size': 16, 'font-weight': 700, fill: col });
        el('rect', { x: 210, y: y - 14, width: Math.max(2, 590 * (v / 70) * g), height: 28, rx: 5, fill: col, opacity: 0.85 });
        mono(220 + 600 * (v / 70) * g, y + 6, v + '%', { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.8 + i * 0.2) }); });
      mid(480, 400, 'Redis 계열이 85% — 나머지는 이유가 분명할 때만', { fill: MUT, opacity: fade(u, 2.2) }); return; }
    tx(480, 90, '"모르겠으면 Redis로 시작."', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, opacity: fade(u, 0.2, 0.6) });
    const y = 240; el('line', { x1: 120, y1: y, x2: 120 + 720 * E(u, 0.8, 1.8), y2: y, stroke: INK, 'stroke-width': 3 });
    [[120, 'Redis 한 대', ACC, 0.9], [480, '운영 6개월', INK, 1.4], [840, '한계가 보이면 교체', WARN, 1.9]].forEach(([x, s, col, a]) => {
      el('circle', { cx: x, cy: y, r: 10, fill: col, opacity: fade(u, a) }); mid(x, y + 40, s, { fill: col, opacity: fade(u, a) }); });
    mid(840, y - 26, 'Dragonfly / Valkey 검토', { fill: MUT, 'font-weight': 600, opacity: fade(u, 2.2) });
    mid(480, 370, '95% 케이스는 Redis 한 대로 충분', { 'font-size': 16, opacity: fade(u, 2.4) }); }

  R.page({ title: '솔루션 비교 무대', scenes: [s1, s2, s3, s4, s5] });
})();
