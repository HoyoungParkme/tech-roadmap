/* I-1-2 인메모리 캐시란 — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, spans, pill, grow, fly, dot, server, dbIcon, redisBox, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const H = { 'font-size': 14, 'font-weight': 700, fill: MUT };

  // Redis 메모리 표 (키 · 값 · TTL). rows: {k, v, op, hot, hotFill, gone, ttl, kc, vc}
  function mem(x, y, w, rows, o) { o = o || {}; const rh = o.rh || 36, n = Math.max(rows.length, o.min || 0);
    el('rect', { x, y, width: w, height: rh * n + 40, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 14, y + 24, o.title || 'Redis 메모리 (RAM)', H);
    rows.forEach((r, i) => { if (!r) return; const yy = y + 34 + i * rh, op = r.op ?? 1; if (op <= 0.01) return;
      if (r.hot) el('rect', { x: x + 6, y: yy + 2, width: w - 12, height: rh - 4, rx: 6, fill: r.hotFill || ACCBG, opacity: op });
      mono(x + 16, yy + rh / 2 + 5, r.k, { 'font-size': 14.5, 'font-weight': 700, fill: r.gone ? OFF : r.kc || INK, opacity: op });
      mono(x + (o.kw || w * 0.46), yy + rh / 2 + 5, r.v, { 'font-size': 14.5, fill: r.gone ? OFF : r.vc || INK, opacity: op });
      if (r.gone) el('line', { x1: x + 12, y1: yy + rh / 2, x2: x + 12 + (w - 24) * clamp(r.gone), y2: yy + rh / 2, stroke: BAD, 'stroke-width': 2.5 });
      if (r.ttl != null) mono(x + w - 14, yy + rh / 2 + 5, r.ttl, { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: op }); }); }
  // 터미널에 n 줄을 차례로 친다: 시작 시각 a, 줄 간격 gap → 지금 보일 줄 수(소수면 타이핑 중)
  const typed = (u, base, n, a, gap, d) => { let s = base; for (let i = 0; i < n; i++) s += seg(u, a + i * gap, a + i * gap + (d || 0.4)); return s; };

  // ---------- 1. 저장소 계층 ----------
  const TIERS = [
    { name: 'CPU L1 cache', t: '1 ns', ns: 1, x: '기준', human: '1초', bar: OFF },
    { name: 'RAM (DRAM)', t: '100 ns', ns: 100, x: '100x', human: '1분 40초', bar: ACC, col: ACC },
    { name: 'NVMe SSD', t: '100 µs', ns: 1e5, x: '100,000x', human: '28시간', bar: MUT },
    { name: 'HDD seek', t: '10 ms', ns: 1e7, x: '10,000,000x', human: null, bar: MUT },
    { name: 'DB query', t: '50 ms', ns: 5e7, x: '50,000,000x', human: '1.6년', bar: BAD, col: BAD },
    { name: '네트워크 (cross-AZ)', t: '1 ms', ns: 1e6, x: '—', human: null, bar: INFO },
  ];
  const LOGMAX = Math.log10(5e7), bw = (ns) => 14 + (Math.log10(ns) / LOGMAX) * 440, RY = (i) => 84 + i * 46;
  function tierRow(i, op, g, o) { const T = TIERS[i], y = RY(i);
    if (op <= 0.01) return;
    if (o.band) el('rect', { x: 18, y: y - 20, width: 924, height: 40, rx: 8, fill: o.band, opacity: o.bandOp ?? 1 });
    tx(30, y + 5, T.name, { 'font-size': 15.5, 'font-weight': 700, opacity: op, fill: T.col || INK });
    mono(214, y + 5, T.t, { 'font-size': 15, opacity: op, fill: T.col || INK });
    el('rect', { x: 300, y: y - 9, width: Math.max(0.1, bw(T.ns) * g), height: 18, rx: 4, fill: T.bar, opacity: op });
    if (o.ratio > 0.01) mono(300 + bw(T.ns) * g + 10, y + 5, T.x, { 'font-size': 14, fill: MUT, opacity: op * o.ratio });
    if (o.strike > 0) el('line', { x1: 292, y1: y, x2: 292 + (bw(T.ns) + 16) * o.strike, y2: y, stroke: BAD, 'stroke-width': 3, 'stroke-linecap': 'round' }); }

  function s1(t, c) { const { k, u } = c;
    const hop = k === 0 ? fade(u, 0.1) : 1;
    tx(30, 44, '계층', Object.assign({ opacity: hop }, H)); tx(214, 44, '응답 시간', Object.assign({ opacity: hop }, H));
    tx(300, 44, '막대 = 자릿수 (log 눈금)', Object.assign({ opacity: hop }, H));
    if (k === 3) tx(860, 44, '1 ns 를 1초로 늘리면', Object.assign({ 'text-anchor': 'middle', opacity: fade(u, 0.3) }, H));
    const dimK4 = k === 4 ? lerp(1, 0.35, E(u, 0.2, 0.8)) : 1;
    for (let i = 0; i < 6; i++) {
      let op, g;
      if (i === 5) { op = k < 2 ? 0 : k === 2 ? fade(u, 0.2) : 1; g = k < 2 ? 0 : k === 2 ? E(u, 0.3, 1.0) : 1; }
      else if (i < 2) { op = k === 0 ? fade(u, 0.3 + i * 0.5) : 1; g = k === 0 ? E(u, 0.4 + i * 0.5, 1.1 + i * 0.5) : 1; }
      else { op = k === 0 ? 0 : k === 1 ? fade(u, 0.3 + (i - 2) * 0.5) : 1; g = k === 0 ? 0 : k === 1 ? E(u, 0.4 + (i - 2) * 0.5, 1.1 + (i - 2) * 0.5) : 1; }
      if (i !== 1) op *= dimK4;
      const band = i === 1 && (k === 0 || k === 4) ? ACCBG : i === 4 && k === 1 ? BADBG : null;
      const bandOp = i === 1 && k === 0 ? fade(u, 1.4) : i === 4 && k === 1 ? fade(u, 1.9) : i === 1 && k === 4 ? fade(u, 0.3) : 1;
      const ratio = k <= 2 ? 1 : k === 3 ? 1 - fade(u, 0.1, 0.3) : 0;
      const strike = k === 4 && i >= 2 && i <= 4 ? E(u, 1.0 + (i - 2) * 0.25, 1.5 + (i - 2) * 0.25) : 0;
      tierRow(i, op, g, { band, bandOp, ratio, strike });
      if (k === 3 && i < 5 && TIERS[i].human) { const T = TIERS[i]; pill(860, RY(i), T.human, T.col || INK, pop(u, 0.5 + i * 0.35), { fs: 15 }); }
    }
    if (k === 2) { const a = E(u, 0.9, 1.7), y = 362;
      tx(30, 372, 'Redis GET 한 번', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.8) });
      mono(30, 397, '≈ 0.2 ms', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
      el('rect', { x: 300, y, width: Math.max(0.1, 460 * a), height: 28, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5 });
      tx(412, y + 19, '앱 → Redis 왕복', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      tx(648, y + 19, 'Redis → 앱 왕복', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      el('rect', { x: 528, y: y - 4, width: 4, height: 36, fill: ACC, opacity: fade(u, 1.9) });
      tx(538, y - 10, 'RAM 조회 100 ns (거의 0)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
      tx(776, 372, 'cross-AZ 면', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) });
      tx(776, 394, '왕복만 1 ms', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.2) }); }
    if (k === 3) tx(480, 388, '1 ns 를 1초로 늘리면 DB 쿼리 한 번이 1.6년이다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.3) });
    if (k === 4) { const s = pop(u, 0.3);
      redisBox(610, RY(1), { w: 150, h: 40, s });
      grow(534, RY(1), 300 + bw(100) + 8, RY(1), E(u, 0.6, 1.0), ACC);
      mono(700, RY(1) + 5, '→ 응답 0.2 ms', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      pill(850, RY(3), '디스크 왕복 제거', BAD, pop(u, 1.9), { fs: 14 });
      tx(30, 380, '대가: RAM 1GB ≈ SSD 100GB 가격', { 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) });
      tx(30, 404, '영속성은 RDB / AOF 로 따로 챙긴다 (Part III)', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.4) }); } }

  // ---------- 2. 키-값 모델 ----------
  const TX = 20, TY = 36, TW = 440, TH = 290, LY = (i) => TY + 44 + i * 22;
  const SETS = ['>>> r.set("user:1:name", "Alice")', '>>> r.set("user:1:email", "alice@example.com")', '>>> r.set("post:42:title", "Redis 입문")'];
  const GETS = ['>>> name = r.get("user:1:name")', 'b"Alice"', '>>> title = r.get("post:42:title")', 'b"Redis 입문"'];
  const DELS = ['>>> r.delete("user:1:name")', '1', '>>> r.exists("post:42:title")', '1'];
  const KV = [['user:1:name', '"Alice"'], ['user:1:email', '"alice@example.com"'], ['post:42:title', '"Redis 입문"']];
  const MX = 500, MY = 36, MW = 440, MRY = (i) => MY + 34 + i * 36 + 18;
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) {
      let lines = SETS, shown;
      if (k === 0) shown = typed(u, 0, 3, 0.2, 0.7, 0.45);
      if (k === 1) { lines = SETS.concat(GETS); shown = 3 + seg(u, 0.2, 0.6) + (u > 1.2 ? 1 : 0) + seg(u, 1.4, 1.8) + (u > 2.4 ? 1 : 0); }
      if (k === 2) { lines = SETS.concat(GETS, DELS); shown = 7 + seg(u, 0.2, 0.6) + (u > 0.9 ? 1 : 0) + seg(u, 1.4, 1.8) + (u > 2.1 ? 1 : 0); }
      terminal(TX, TY, TW, TH, lines, shown);
      const rows = KV.map(([kk, v], i) => ({ k: kk, v, op: k === 0 ? fade(u, 1.0 + i * 0.7, 0.2) : 1 }));
      if (k === 1) { if (u > 0.6 && u < 1.4) Object.assign(rows[0], { hot: true }); if (u > 1.8) Object.assign(rows[2], { hot: true }); }
      if (k === 2) { const g = E(u, 0.7, 1.1); if (g > 0) Object.assign(rows[0], { gone: g, op: lerp(1, 0.5, g) }); if (u > 1.9) Object.assign(rows[2], { hot: true, hotFill: GOODBG }); }
      mem(MX, MY, MW, rows, { min: 3 });
      if (k === 0) KV.forEach(([kk], i) => fly(TX + TW - 20, LY(i) - 5, MX + 70, MRY(i), seg(u, 0.65 + i * 0.7, 1.05 + i * 0.7), kk, { mono: true }));
      if (k === 0) tx(MX + MW / 2, 236, 'CREATE TABLE 없이 SET 세 번 → 키 3개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.4) });
      if (k === 1) { fly(MX + 260, MRY(0), TX + 200, LY(4) - 5, seg(u, 0.7, 1.2), 'b"Alice"', { mono: true, fill: INK });
        fly(MX + 260, MRY(2), TX + 200, LY(6) - 5, seg(u, 1.9, 2.4), 'b"Redis 입문"', { mono: true, fill: INK });
        tx(MX + MW / 2, 236, '키만 주면 값이 나온다 · 반환은 bytes', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.4) }); }
      if (k === 2) { fly(TX + TW - 20, LY(7) - 5, MX + 70, MRY(0), seg(u, 0.5, 0.8), 'DEL', { mono: true, fill: BAD });
        if (u > 1.9) check(MX + MW - 28, MRY(2), 10, pop(u, 1.9));
        mono(MX + 10, 236, 'DEL    → 지운 키 개수', { 'font-size': 15, opacity: fade(u, 1.0) });
        mono(MX + 10, 262, 'EXISTS → 있으면 1, 없으면 0', { 'font-size': 15, opacity: fade(u, 2.1) }); }
      return; }
    if (k === 3) { // 키 이름 해부 + namespace 묶음
      const fs = 34, cw = fs * 0.6, x0 = 480 - (11 * cw) / 2, segs = [['user', ACC, '도메인'], [':'], ['1', INFO, '식별자'], [':'], ['name', GOOD, '필드']];
      spans(x0, 70, segs.map(([s, col]) => [s, { fill: col || MUT, 'font-weight': 800 }]), { 'font-size': fs, opacity: fade(u, 0.2) });
      let cx = x0; segs.forEach(([s, col, name], i) => { const w = s.length * cw;
        if (name) { const a = E(u, 0.5 + i * 0.15, 0.9 + i * 0.15);
          el('path', { d: `M${cx + 2},86 V94 H${cx + w - 2} V86`, fill: 'none', stroke: col, 'stroke-width': 2.2, opacity: a });
          tx(cx + w / 2, 118, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, opacity: a }); }
        cx += w; });
      // 왼쪽: 콜론 없는 이름
      tx(60, 172, '콜론 없이', Object.assign({ opacity: fade(u, 1.2) }, H));
      ['name', 'title', 'abc123'].forEach((s, i) => { const y = 206 + i * 44;
        card(140, y, 140, 34, { rx: 6, text: s, fs: 15, mono: true, stroke: BAD, sw: 1.8, s: pop(u, 1.2 + i * 0.12) });
        tx(226, y + 5, '누구의?', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.5 + i * 0.12) }); });
      // 오른쪽: namespace 별로 묶임
      tx(400, 172, '도메인:식별자:필드', Object.assign({ opacity: fade(u, 1.6) }, H));
      [['user:1:*', ['user:1:name', 'user:1:email'], ACC], ['post:42:*', ['post:42:title'], INFO], ['session:*', ['session:abc123'], WARN]].forEach(([ns, keys, col], i) => {
        const x = 400 + i * 182, a = fade(u, 1.7 + i * 0.2), hot = i === 0 && u > 2.3;
        el('rect', { x, y: 186, width: 170, height: 40 + keys.length * 30, rx: 10, fill: hot ? ACCBG : SOFT, stroke: col, 'stroke-width': hot ? 2.5 : 1.5, opacity: a });
        mono(x + 12, 210, ns, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: a });
        keys.forEach((kk, j) => mono(x + 12, 240 + j * 30, kk, { 'font-size': 14, opacity: a })); });
      pill(560, 330, 'SCAN 0 MATCH user:*', ACC, pop(u, 2.2), { mono: true, fs: 14 });
      grow(560, 314, 485, 290, E(u, 2.4, 2.7), ACC);
      return; }
    // k === 4 : O(1) 해시 조회
    pill(110, 70, 'post:42:title', ACC, pop(u, 0.2), { mono: true, fs: 15 });
    grow(196, 70, 270, 70, E(u, 0.5, 0.8), ACC);
    card(340, 70, 130, 40, { rx: 8, text: 'hash(key)', fs: 15, mono: true, s: pop(u, 0.7) });
    const n = 16, bx = 60, bwid = 46, gap = 6, hitIdx = 11, by = 150;
    for (let i = 0; i < n; i++) { const x = bx + i * (bwid + gap), on = i === hitIdx && u > 1.4, a = fade(u, 0.3 + i * 0.03);
      el('rect', { x, y: by, width: bwid, height: 36, rx: 5, fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, 'stroke-width': on ? 2.5 : 1.5, opacity: a });
      if ((i * 7) % 3 !== 0) el('circle', { cx: x + bwid / 2, cy: by + 18, r: 4, fill: on ? ACC : OFF, opacity: a }); }
    tx(bx, by - 12, '버킷 배열', Object.assign({ opacity: fade(u, 0.3) }, H));
    const tx0 = bx + hitIdx * (bwid + gap) + bwid / 2;
    grow(405, 80, tx0, by - 4, E(u, 0.9, 1.4), ACC);
    pill(tx0, by + 64, '"Redis 입문"', ACC, pop(u, 1.5), { mono: true, fs: 14 });
    [['키 1만 개', 24], ['키 1억 개', 64]].forEach(([name, dens], j) => { const y = 286 + j * 56, a = fade(u, 1.8 + j * 0.25);
      tx(60, y + 6, name, { 'font-size': 16, 'font-weight': 700, opacity: a });
      el('rect', { x: 190, y: y - 12, width: 420, height: 24, rx: 5, fill: SOFT, stroke: GRID, opacity: a });
      for (let i = 0; i < dens; i++) el('line', { x1: 196 + i * (408 / dens), y1: y - 8, x2: 196 + i * (408 / dens), y2: y + 8, stroke: OFF, 'stroke-width': 1.5, opacity: a });
      el('rect', { x: 190 + 420 * 0.68, y: y - 12, width: 8, height: 24, fill: ACC, opacity: a });
      pill(720, y, '조회 1번', GOOD, pop(u, 1.9 + j * 0.25), { fs: 14 }); });
    mono(860, 322, 'O(1)', { 'font-size': 30, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.4) }); }

  // ---------- 3. 히트 vs 미스 ----------
  const AP = [120, 180], RB = [470, 70], KR = [470, 128], DB = [470, 300];
  const toR = [[178, 165], [300, 76], [395, 72]], toD = [[178, 205], [300, 296], [420, 298]];
  const rev = (r) => r.slice().reverse();
  function keyRow(o) { o = o || {};
    const x = KR[0] - 125, y = KR[1] - 18;
    el('rect', { x, y, width: 250, height: 36, rx: 6, fill: o.hot ? ACCBG : PANEL, stroke: o.empty ? GRID : ACC, 'stroke-width': 1.8, 'stroke-dasharray': o.empty ? '5 5' : null, opacity: o.op ?? 1 });
    if (o.empty) { tx(KR[0], KR[1] + 5, 'post:42 없음', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT }); return; }
    mono(x + 12, KR[1] + 5, 'post:42', { 'font-size': 14.5, 'font-weight': 700, opacity: o.op ?? 1 });
    mono(x + 90, KR[1] + 5, o.ttl ? '{…}' : '{"title":…}', { 'font-size': 14.5, opacity: o.op ?? 1 });
    if (o.ttl) { clock(x + 158, KR[1], 11, o.ttl, WARN); mono(x + 176, KR[1] + 5, 'TTL 60s', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: o.op ?? 1 }); } }
  function flowBase(o) { o = o || {};
    el('polyline', { points: toR.map((p) => p.join(',')).join(' '), fill: 'none', stroke: GRID, 'stroke-width': 2.5 });
    el('polyline', { points: toD.map((p) => p.join(',')).join(' '), fill: 'none', stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': o.dbIdle ? '5 6' : null });
    server(AP[0], AP[1], o.app || 'get_post(42)', { lamp: o.lamp });
    redisBox(RB[0], RB[1], { w: 150, h: 44 });
    dbIcon(DB[0], DB[1], 'DB', { stroke: o.dbHot ? BAD : o.dbOff ? OFF : INK }); }
  function side(lines, u) { lines.forEach(([s, a, o], i) => { o = o || {};
    (o.mono === false ? tx : mono)(650, 84 + i * 40, s, { 'font-size': o.fs || 15, 'font-weight': o.fw || 600, fill: o.col || INK, opacity: fade(u, a) }); }); }
  const avgOf = (h) => h * 0.2 + (1 - h) * 50;
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { flowBase({ lamp: GOOD, dbIdle: true, dbOff: true }); keyRow({ hot: u > 0.9 });
      dot(toR, seg(u, 0.2, 0.9), ACC, 7); fly(RB[0] - 70, RB[1] + 10, AP[0] + 20, AP[1] - 70, seg(u, 1.0, 1.7), '{"title":…}', { mono: true });
      if (u > 1.7) pill(AP[0], AP[1] - 72, 'hit', GOOD, pop(u, 1.7), { fs: 15 });
      if (u > 1.9) cross(300, 296, 11, pop(u, 1.9));
      tx(300, 336, 'DB 왕복 생략', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) });
      side([['cached = r.get(...)', 0.2], ['→ 값이 있다 = 히트', 0.9, { mono: false }], ['0.2 ms', 1.7, { fs: 30, fw: 800, col: ACC }]], u); return; }
    if (k === 1) { flowBase({ lamp: WARN, dbHot: u > 1.4 }); keyRow({ empty: true });
      dot(toR, seg(u, 0.2, 0.7), ACC, 7); fly(RB[0] - 70, RB[1] + 10, AP[0] + 20, AP[1] - 70, seg(u, 0.7, 1.1), 'None', { mono: true, fill: WARN });
      if (u > 1.1) pill(AP[0], AP[1] - 72, 'miss', WARN, pop(u, 1.1), { fs: 15 });
      dot(toD, seg(u, 1.2, 1.8), INK, 7); dot(rev(toD), seg(u, 1.9, 2.5), INK, 7);
      side([['cached = r.get(...)', 0.2], ['→ None = 미스', 0.8, { mono: false }], ['data = query_post(...)', 1.2], ['50 ms', 1.9, { fs: 30, fw: 800, col: BAD }]], u); return; }
    if (k === 2) { flowBase({ lamp: GOOD, dbIdle: u > 1.4 });
      fly(AP[0] + 40, AP[1] - 40, RB[0] - 40, KR[1], seg(u, 0.3, 1.1), 'SETEX post:42 60', { mono: true });
      if (u > 1.1) keyRow({ op: fade(u, 1.1, 0.2), ttl: 1 - E(u, 1.3, 2.8) * 0.05, hot: u > 1.9 }); else keyRow({ empty: true });
      dot(toR, seg(u, 1.7, 2.1), ACC, 7);
      if (u > 2.2) pill(AP[0], AP[1] - 72, '다음 요청 hit', GOOD, pop(u, 2.2), { fs: 14 });
      side([['r.setex(key, 60, ...)', 0.3], ['→ 키 생성 · TTL 60초', 1.1, { mono: false }], ['다음 요청부터 히트', 2.2, { mono: false, col: GOOD, fw: 700 }]], u); return; }
    // k 3, 4: 100건 격자 + 평균 계산
    const h = tween((c.prev && c.prev.hitRatio) || 90, c.beat.hitRatio, c.u, 1.4) / 100, hits = Math.round(h * 100);
    tx(60, 46, '요청 100건', H);
    for (let j = 0; j < 100; j++) { const x = 60 + (j % 10) * 28, y = 60 + Math.floor(j / 10) * 28, hit = j < hits;
      el('rect', { x, y, width: 24, height: 24, rx: 4, fill: hit ? ACC : BAD, opacity: (k === 3 ? fade(u, 0.1 + j * 0.008, 0.2) : 1) * (hit ? 0.85 : 0.9) }); }
    mono(60, 360, `hit ${hits}`, { 'font-size': 16, 'font-weight': 800, fill: ACC });
    mono(200, 360, `miss ${100 - hits}`, { 'font-size': 16, 'font-weight': 800, fill: BAD });
    const hp = String(+h.toFixed(2)), mp = String(+(1 - h).toFixed(2)), avg = avgOf(h), a1 = fade(u, k === 3 ? 0.9 : 0.1);
    tx(400, 70, '평균 응답 시간', Object.assign({ opacity: a1 }, H));
    spans(400, 108, [[hp, { fill: ACC, 'font-weight': 800 }], [' × 0.2 ms + '], [mp, { fill: BAD, 'font-weight': 800 }], [' × 50 ms']], { 'font-size': 17, opacity: a1 });
    spans(400, 142, [['= '], [(h * 0.2).toFixed(2), { fill: ACC }], [' + '], [((1 - h) * 50).toFixed(1), { fill: BAD }]], { 'font-size': 17, opacity: fade(u, k === 3 ? 1.3 : 0.1) });
    mono(400, 200, (avg >= 1 ? avg.toFixed(2) : avg.toFixed(1)) + ' ms', { 'font-size': 36, 'font-weight': 800, fill: ACC, opacity: fade(u, k === 3 ? 1.6 : 0.1) });
    const bx = 520, bmax = 380, ba = fade(u, k === 3 ? 1.8 : 0.1);
    tx(400, 262, 'DB만', { 'font-size': 15, 'font-weight': 700, opacity: ba }); tx(400, 312, '캐시 + DB', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: ba });
    el('rect', { x: bx, y: 244, width: bmax, height: 26, rx: 5, fill: OFF, opacity: ba }); mono(bx + bmax - 10, 262, '50 ms', { 'font-size': 14.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'end', opacity: ba });
    const w2 = Math.max(4, (bmax * avg) / 50); el('rect', { x: bx, y: 294, width: w2, height: 26, rx: 5, fill: ACC, opacity: ba });
    mono(bx + w2 + 10, 312, (avg >= 1 ? avg.toFixed(2) : avg.toFixed(1)) + ' ms', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: ba });
    pill(800, 364, k === 3 ? '9.6배 빠르다' : '70배 빠르다', GOOD, pop(u, 2.2), { fs: 15 });
    if (k === 3) tx(400, 368, '미스 10%가 시간 대부분', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.4) });
    else tx(400, 368, '90% → 99% : 미스 10건 → 1건', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }

  // ---------- 4. 캐시 패턴 ----------
  function patBase(o) { o = o || {};
    if (!o.noDirect) el('polyline', { points: toD.map((p) => p.join(',')).join(' '), fill: 'none', stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': o.dashD ? '5 6' : null });
    el('polyline', { points: toR.map((p) => p.join(',')).join(' '), fill: 'none', stroke: GRID, 'stroke-width': 2.5 });
    server(AP[0], AP[1], 'app', {});
    redisBox(RB[0], RB[1], { w: 150, h: 44 });
    dbIcon(DB[0], DB[1], 'DB', { stroke: o.dbCol || INK }); }
  function pkey(o) { o = o || {}; const x = KR[0] - 100, y = KR[1] - 17, op = o.op ?? 1;
    if (op <= 0.01 && !o.empty) return;
    el('rect', { x, y, width: 200, height: 34, rx: 6, fill: o.hot ? ACCBG : PANEL, stroke: o.empty ? GRID : ACC, 'stroke-width': 1.8, 'stroke-dasharray': o.empty ? '5 5' : null, opacity: o.empty ? 1 : op });
    if (o.empty) return;
    mono(x + 12, KR[1] + 5, 'key', { 'font-size': 14.5, 'font-weight': 700, opacity: op }); mono(x + 70, KR[1] + 5, 'val', { 'font-size': 14.5, opacity: op });
    if (o.gone) el('line', { x1: x + 8, y1: KR[1], x2: x + 8 + 184 * o.gone, y2: KR[1], stroke: BAD, 'stroke-width': 2.5 }); }
  function steps(list, u) { list.forEach(([s, a, o], i) => { o = o || {};
    (o.mono === false ? tx : mono)(640, 92 + i * 42, s, { 'font-size': 15, 'font-weight': o.fw || 600, fill: o.col || INK, opacity: fade(u, a) }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { patBase({ dbCol: u > 1.1 && u < 2.0 ? ACC : INK });
      dot(toR, seg(u, 0.2, 0.6), ACC, 7); fly(RB[0] - 70, RB[1] + 10, AP[0] + 30, AP[1] - 70, seg(u, 0.6, 1.0), 'None', { mono: true, fill: WARN });
      dot(toD, seg(u, 1.1, 1.5), INK, 7); fly(DB[0] - 50, DB[1], AP[0] + 30, AP[1] + 30, seg(u, 1.5, 1.9), 'val', { mono: true, fill: INK });
      fly(AP[0] + 30, AP[1] - 40, KR[0] - 150, KR[1] - 4, seg(u, 2.0, 2.5), 'cache.set', { mono: true });
      if (u > 2.5) pkey({ op: fade(u, 2.5, 0.15) }); else pkey({ empty: true });
      steps([['① cache.get(key) → None', 0.3], ['② db.query(key)', 1.2], ['③ cache.set(key, val)', 2.0], ['Step 3 과 같은 흐름', 2.5, { mono: false, col: MUT }]], u); return; }
    if (k === 1) { patBase({ dbCol: u > 0.9 ? GOOD : INK });
      fly(AP[0] + 30, AP[1] + 30, DB[0] - 50, DB[1], seg(u, 0.2, 0.9), 'db.update', { mono: true, fill: INK });
      if (u > 0.9) check(DB[0] + 66, DB[1] - 20, 11, pop(u, 0.9));
      fly(AP[0] + 30, AP[1] - 40, KR[0] - 150, KR[1] - 4, seg(u, 1.1, 1.7), 'cache.delete', { mono: true, fill: BAD });
      const g = E(u, 1.7, 2.1); pkey({ gone: g, op: lerp(1, 0.4, g) });
      steps([['① db.update(key, val)', 0.3], ['② cache.delete(key)', 1.1], ['갱신 대신 삭제 = 무효화', 1.9, { mono: false, fw: 700, col: BAD }], ['다음 read 가 다시 채운다', 2.3, { mono: false, col: MUT }]], u); return; }
    if (k === 2) { patBase({ noDirect: true });
      el('polyline', { points: toD.map((p) => p.join(',')).join(' '), fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 6', opacity: 1 - fade(u, 0.3) * 0.5 });
      if (u > 0.5) cross(300, 296, 11, pop(u, 0.5));
      const a = fade(u, 0.2);
      el('rect', { x: 352, y: 20, width: 236, height: 160, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '7 5', opacity: a });
      tx(364, 40, 'CacheLoader', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: a });
      grow(470, 182, 470, 256, E(u, 0.9, 1.3), ACC);
      dot(toR, seg(u, 1.0, 1.4), ACC, 7); dot([[470, 182], [470, 256]], seg(u, 1.4, 1.8), ACC, 7); dot([[470, 256], [470, 182]], seg(u, 1.9, 2.3), INK, 7);
      if (u > 2.3) pkey({ op: fade(u, 2.3, 0.15) }); else pkey({ empty: true });
      steps([['앱: loader.get(key) 만', 0.6], ['미스면 loader 가 DB 읽음', 1.4, { mono: false }], ['앱 코드에서 DB 호출 사라짐', 2.0, { mono: false, col: MUT }], ['Redis 기능 아님 · 래퍼', 2.3, { mono: false, fw: 700, col: WARN }]], u); return; }
    if (k === 3) { patBase({ dbCol: u > 1.3 ? GOOD : INK });
      fly(AP[0] + 30, AP[1] - 40, KR[0] - 150, KR[1] - 4, seg(u, 0.3, 0.9), 'cache.set', { mono: true });
      fly(AP[0] + 30, AP[1] + 30, DB[0] - 50, DB[1], seg(u, 0.3, 1.3), 'db.update', { mono: true, fill: INK });
      pkey({ hot: u > 0.9 }); if (u > 0.9) check(KR[0] + 120, KR[1], 10, pop(u, 0.9)); if (u > 1.3) check(DB[0] + 66, DB[1] - 20, 11, pop(u, 1.3));
      if (u > 1.6) pill(AP[0], AP[1] - 72, 'commit', GOOD, pop(u, 1.6), { fs: 15 });
      steps([['① cache.set(key, val)', 0.3], ['② db.update(key, val)', 0.3], ['둘 다 성공해야 commit', 1.6, { mono: false, fw: 700, col: GOOD }]], u);
      const a = fade(u, 2.0); tx(640, 262, '쓰기 비용', Object.assign({ opacity: a }, H));
      el('rect', { x: 640, y: 276, width: 26 * E(u, 2.0, 2.4), height: 24, rx: 4, fill: ACC, opacity: a });
      el('rect', { x: 668, y: 276, width: 220 * E(u, 2.1, 2.6), height: 24, rx: 4, fill: INK, opacity: a });
      tx(640, 326, '캐시 + DB 를 매번', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.4) }); return; }
    // k 4: 고르기
    [['Cache-Aside', ['앱이 캐시·DB 를 직접', 'get → miss → query → set'], '95% 케이스 · 단순', ACC],
     ['Write-Through', ['쓰기 때 캐시 + DB 함께', 'set + update'], '쓰기가 잦다 · 일관성', INFO],
     ['Write-Behind', ['캐시 먼저, DB 는 나중', 'set → … → update'], '즉시 읽지 않는다 · 비동기', WARN]].forEach(([name, lines, when, col], i) => {
      const cx = 170 + i * 310, s = pop(u, 0.3 + i * 0.35), a = fade(u, 0.4 + i * 0.35);
      card(cx, 190, 286, 210, { rx: 12, stroke: col, sw: i === 0 ? 3.2 : 1.8, s });
      tx(cx, 118, name, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: col, opacity: a });
      tx(cx, 162, lines[0], { 'text-anchor': 'middle', 'font-size': 15, opacity: a });
      mono(cx, 196, lines[1], { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: a });
      el('line', { x1: cx - 110, y1: 220, x2: cx + 110, y2: 220, stroke: GRID, 'stroke-width': 1.5, opacity: a });
      tx(cx, 254, when, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: a }); });
    pill(170, 326, '기본값', ACC, pop(u, 1.6), { fs: 15 });
    tx(480, 384, '실무는 Cache-Aside 부터 시작한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // ---------- 5. 캐시 워밍 ----------
  const GX = 650, GY = 74, GC = 18, GG = 4;
  function grid100(fill, o) { o = o || {};
    tx(GX, GY - 16, 'Redis · post:{id} 100칸', H);
    for (let j = 0; j < 100; j++) { const x = GX + (j % 10) * (GC + GG), y = GY + Math.floor(j / 10) * (GC + GG), on = fill(j);
      el('rect', { x, y, width: GC, height: GC, rx: 3, fill: on ? ACC : PANEL, stroke: on ? 'none' : GRID, 'stroke-width': 1.2, 'stroke-dasharray': on ? null : '3 3', opacity: on ? 0.85 * on : 1 }); } }
  function gauge(c, a, b) { const p = c.prev || {}, h = a == null ? tween(p.hitRatio, c.beat.hitRatio, c.u) : lerp(a, c.beat.hitRatio, E(c.u, b[0], b[1]));
    tx(60, 384, '히트율', { 'font-size': 15.5, 'font-weight': 700 });
    el('rect', { x: 140, y: 370, width: 620, height: 20, rx: 5, fill: SOFT, stroke: GRID });
    el('rect', { x: 140, y: 370, width: Math.max(2, 620 * h / 100), height: 20, rx: 5, fill: h < 50 ? BAD : ACC });
    mono(780, 387, Math.round(h) + '%', { 'font-size': 20, 'font-weight': 800, fill: h < 50 ? BAD : ACC }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) {
      dbIcon(90, 170, 'DB', { stroke: k === 0 && u > 0.4 ? BAD : INK });
      card(300, 170, 236, 48, { rx: 10, text: 'warm_cache_on_startup()', fs: 14, mono: true, stroke: ACC, sw: 2 });
      if (k === 0) { fly(260, 140, 120, 140, seg(u, 0.3, 1.0), 'query_top_posts(limit=100)', { mono: true, fill: INK });
        for (let i = 0; i < 10; i++) el('rect', { x: 230, y: 214 + i * 7, width: 140 * E(u, 1.1 + i * 0.05, 1.5 + i * 0.05), height: 4, rx: 2, fill: INK, opacity: 0.6 });
        tx(300, 300, '인기 글 100개 읽음', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) });
        grid100(() => 0);
        pill(GX + 108, GY + 108, 'cold · 텅 빔', BAD, pop(u, 1.9), { fs: 15, fill: PANEL });
        tx(90, 260, '요청이 전부 DB 로', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
        gauge(c); return; }
      // 파이프라인 관
      const n = k === 1 ? Math.round(lerp(0, 100, E(u, 0.3, 2.0))) : 100, gone = k === 2 ? seg(u, 0.2, 0.9) : 0;
      el('rect', { x: 440, y: 150, width: 180, height: 40, rx: 20, fill: SOFT, stroke: INK, 'stroke-width': 2 });
      for (let i = 0; i < Math.ceil(n / 10); i++) if (!gone) el('rect', { x: 606 - (i + 1) * 16, y: 158, width: 12, height: 24, rx: 3, fill: ACC, opacity: 0.85 });
      if (k === 1) { mono(530, 136, 'pipe.setex × ' + n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
        mono(530, 216, 'post:{id} · TTL 600', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6) });
        tx(530, 242, '아직 전송 전', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
        grid100(() => 0); gauge(c); return; }
      fly(560, 170, GX + 110, GY + 110, seg(u, 0.2, 0.9), 'pipe.execute()', { mono: true });
      grid100((j) => fade(u, 0.9 + ((j % 10) + Math.floor(j / 10)) * 0.045, 0.15));
      pill(530, 250, '왕복 100번 → 1번', GOOD, pop(u, 2.0), { fs: 15 });
      gauge(c, c.prev ? c.prev.hitRatio : 5, [0.9, 1.9]); return; }
    if (k === 3) { grid100(() => 1);
      card(300, 70, 236, 44, { rx: 10, text: 'periodic_refresh()', fs: 14.5, mono: true, stroke: ACC, sw: 2, s: pop(u, 0.2) });
      mono(300, 118, 'time.sleep(300)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      const X0 = 80, PX = 500 / 900, ax = (s) => X0 + s * PX;
      el('line', { x1: X0, y1: 300, x2: X0 + 500 * E(u, 0.3, 0.9), y2: 300, stroke: INK, 'stroke-width': 2 });
      [[0, '0'], [300, '300s'], [600, '600s']].forEach(([s, l]) => { el('line', { x1: ax(s), y1: 294, x2: ax(s), y2: 306, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.5) });
        mono(ax(s), 326, l, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5) }); });
      [0, 300, 600].forEach((s, i) => { const y = 176 + i * 34, g = E(u, 0.8 + i * 0.5, 1.4 + i * 0.5), end = Math.min(900, s + 600);
        el('rect', { x: ax(s), y, width: Math.max(0.1, (ax(end) - ax(s)) * g), height: 22, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5 });
        el('path', { d: `M${ax(s)},${y - 8} l-6,-10 h12 z`, fill: ACC, opacity: fade(u, 0.8 + i * 0.5) });
        if (i === 0) mono(ax(s) + 10, y + 16, 'TTL 600s', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) }); });
      tx(ax(300) + 10, 152, '300초마다 덮어씀', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      clock(GX + 256, GY + 30, 18, 1 - E(u, 0.5, 2.6) * 0.5, WARN);
      tx(GX + 108, GY + 250, '만료 전에 다시 채운다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) });
      gauge(c); return; }
    // k 4: 재배포 전후 히트율
    const X0 = 70, X1 = 590, Y = (p) => 300 - p * 2.2, dx = 260;
    el('line', { x1: X0, y1: 300, x2: X1, y2: 300, stroke: INK, 'stroke-width': 2 }); el('line', { x1: X0, y1: 70, x2: X0, y2: 300, stroke: INK, 'stroke-width': 2 });
    mono(X0 - 8, Y(95) + 5, '95%', { 'font-size': 14, 'text-anchor': 'end', fill: ACC }); mono(X0 - 8, Y(5) + 5, '5%', { 'font-size': 14, 'text-anchor': 'end', fill: BAD });
    el('line', { x1: dx, y1: 64, x2: dx, y2: 300, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); tx(dx + 8, 80, '재배포', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const g1 = E(u, 0.3, 1.6), g2 = E(u, 1.0, 2.2), pts = (fn, g) => { const out = []; for (let x = X0; x <= X0 + (X1 - X0) * g; x += 6) out.push(x + ',' + fn(x)); return out.join(' '); };
    const cold = (x) => x < dx ? Y(95) : Y(Math.min(95, 5 + (x - dx - 4) * 0.55 * (x > dx + 4 ? 1 : 0)));
    if (g1 > 0) el('polyline', { points: pts(cold, g1), fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
    if (g2 > 0) el('polyline', { points: pts(() => Y(95), g2), fill: 'none', stroke: ACC, 'stroke-width': 3.5 });
    tx(dx + 24, Y(5) + 4, '워밍 없음: cold', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
    tx(X1 - 4, Y(95) - 12, '워밍 있음', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 2.0) });
    grid100(() => 1);
    check(GX + 20, 330, 9, pop(u, 2.2)); tx(GX + 38, 335, '사용자도 DB 도 배포를 모른다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.2) });
    gauge(c); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: 'Redis 응답 0.2ms 가운데 대부분을 차지하는 것은 무엇인가?',
      o: ['RAM에서 값을 찾는 시간(100ns)', '디스크에서 값을 읽는 시간', '앱과 Redis 사이의 네트워크 왕복'], a: 2,
      why: 'RAM 조회 100ns는 0.2ms 안에서 거의 보이지 않는다. 대부분은 왕복 시간이라 Redis를 앱과 같은 AZ에 두어야 0.2ms가 나온다.' },
    { q: '키가 1만 개에서 1억 개로 늘면 GET 한 번의 조회 시간은 어떻게 되나?',
      o: ['거의 같다 — 해시 테이블 조회라 O(1)이다', '키 수에 비례해 1만 배 느려진다', '인덱스를 따로 만들어야 같아진다'], a: 0,
      why: '키 조회는 해시 테이블 조회라 O(1)이다. 데이터 양과 관계없이 조회 시간이 같다.' },
    { q: '히트율 90%, 히트 0.2ms, 미스 50ms일 때 평균 응답 시간은 얼마인가?',
      o: ['약 0.2ms', '약 5.18ms', '약 45ms'], a: 1,
      why: '0.9×0.2ms + 0.1×50ms = 5.18ms다. 미스 10%가 평균 시간의 대부분을 차지하므로 히트율을 99%로 올리면 0.7ms까지 떨어진다.' },
    { q: 'Cache-Aside에서 DB의 데이터를 수정하면 캐시는 어떻게 처리하나?',
      o: ['캐시 값도 새 값으로 갱신한다', '캐시는 그대로 두고 TTL이 끝나길 기다린다', '캐시 키를 지우고 다음 읽기가 다시 채우게 한다'], a: 2,
      why: '쓰기에서 캐시를 갱신하려 들면 경합이 생긴다. 지워 두면 다음 읽기가 DB에서 읽어 알아서 채운다.' },
    { q: '캐시 워밍에서 인기 글 100개를 pipeline에 모아 넣는 이유는 무엇인가?',
      o: ['키마다 TTL을 자동으로 붙이려고', '네트워크 왕복 100번을 1번으로 줄이려고', '키 이름 충돌을 막으려고'], a: 1,
      why: 'setex 100개를 파이프라인에 쌓았다가 execute 한 번으로 보낸다. 왕복이 100번에서 1번으로 줄어 워밍이 금방 끝난다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'DB 쿼리는 50ms, Redis 응답은 0.2ms다. 데이터를 디스크가 아니라 RAM에 두기 때문이다.',
    'Redis는 키로 값을 바로 찾는 해시 테이블이라 키가 1억 개여도 조회 시간이 같다.',
    '히트율 90%면 평균 5.18ms, 99%면 0.7ms다. 남은 미스가 평균 시간을 거의 다 차지한다.',
    '실무는 Cache-Aside로 시작하고 쓸 때는 캐시를 지운다. 재시작 직후엔 인기 키를 미리 채운다.',
  ];
  const review = [
    { q: '히트율 90%인 서비스에서 평균 응답을 더 줄이려 한다. 효과가 가장 큰 것은?',
      o: ['Redis 히트 응답을 0.2ms에서 0.1ms로 줄이기', 'Write-Through로 바꾸기', '히트율을 99%로 올리기'], a: 2,
      why: '평균 5.18ms 가운데 5ms가 미스 10%에서 나온다. 히트 시간을 절반으로 줄여도 0.1ms만 줄지만 히트율을 99%로 올리면 0.7ms까지 떨어진다.' },
    { q: '재배포할 때마다 몇 분 동안 DB가 과부하로 느려진다. 가장 맞는 대책은?',
      o: ['시작할 때 인기 키를 미리 채워 둔다', '캐시 키의 TTL을 더 길게 잡는다', '캐시 패턴을 Read-Through로 바꾼다'], a: 0,
      why: '재시작 직후엔 캐시가 비어 모든 요청이 DB로 간다. TTL이나 패턴을 바꿔도 빈 캐시는 그대로라 워밍으로 미리 채워야 한다.' },
    { q: '같은 Redis를 쓰는 두 기능이 모두 키를 1:name 으로 저장했다. 어떤 일이 생기나?',
      o: ['두 번째 SET이 오류를 내며 막힌다', '나중에 쓴 쪽이 값을 덮어쓴다', 'Redis가 기능별로 키를 따로 저장한다'], a: 1,
      why: '같은 키에 SET하면 Redis는 말없이 덮어쓴다. user:1:name처럼 도메인:식별자:필드 규칙으로 이름을 나눠야 충돌이 없다.' },
  ];

  R.page({ title: '캐시 동작 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
