/* III-1-2 Eviction 정책 — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, pill, banner, grow, dot, cross, check, terminal, redisBox, dbIcon, server, person, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  function term(x, y, w, h, beats, k, u, o) { o = o || {};
    const old = o.keep === false ? [] : [].concat(...beats.slice(0, k)), cur = beats[k] || [];
    const p = seg(u, 0.2, Math.min(2.4, 0.2 + 0.38 * cur.length));
    terminal(x, y, w, h, old.concat(cur), old.length + p * cur.length, o); }
  function ring(cx, cy, r, frac, col, w) { w = w || 5; const f = clamp(frac);
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': w }); if (f <= 0.001) return;
    if (f >= 0.999) { el('circle', { cx, cy, r, fill: 'none', stroke: col, 'stroke-width': w }); return; }
    const a = -Math.PI / 2 + f * 2 * Math.PI; el('path', { d: `M${cx},${cy - r} A${r},${r} 0 ${f > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }); }
  const note = (x, s, op, col) => tx(x, 404, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: op ?? 1 });
  const fmtN = (n) => Math.round(n).toLocaleString('en-US');

  // ───────── 1. maxmemory ─────────
  const TK = { x: 600, w: 130, bot: 360, px: 130 };            // 1GB = 130px
  const gy = (gb) => TK.bot - gb * TK.px;
  function tank(used, max, o) { o = o || {}; const top = gy(2.05);
    el('rect', { x: TK.x, y: top, width: TK.w, height: TK.bot - top, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    tx(TK.x + TK.w / 2, top - 10, '인스턴스 RAM', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const uh = Math.min(used, 2.05) * TK.px, hot = max > 0 && used / max >= 0.9;
    el('rect', { x: TK.x + 4, y: TK.bot - uh, width: TK.w - 8, height: Math.max(0, uh - 4), rx: 5, fill: hot ? BADBG : ACCBG, stroke: hot ? BAD : ACC, 'stroke-width': 1.5 });
    mono(TK.x - 12, TK.bot - uh + 16, 'used ' + used.toFixed(2) + 'GB', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: hot ? BAD : ACC });
    if (max > 0 && o.maxOp !== 0) { const y = gy(max); el('line', { x1: TK.x - 6, y1: y, x2: TK.x + TK.w + 14, y2: y, stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '8 5', opacity: o.maxOp ?? 1 });
      mono(TK.x + TK.w + 22, y + 5, 'maxmemory ' + (Math.round(max * 10) / 10) + 'gb', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: o.maxOp ?? 1 }); }
    if (o.keys != null) mono(TK.x + TK.w / 2, TK.bot + 26, '키 ' + fmtN(o.keys) + '개', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT }); }
  const T1 = [
    [['# redis.conf', OFF], 'maxmemory 2gb', 'maxmemory-policy allkeys-lru'],
    ['$ redis-cli CONFIG SET maxmemory 2gb', 'OK', '$ redis-cli CONFIG SET \\', '    maxmemory-policy allkeys-lru', 'OK', ['# 단위: 1b 1kb 1mb 1gb', OFF]],
    [['# RAM 의 70~80% 로 낮춘다', OFF], ['# 나머지: OS · fork · 버퍼', OFF]],
    ['$ redis-cli CONFIG GET maxmemory', '1) "maxmemory"', ['2) 바이트 단위 값', OFF], '$ redis-cli INFO memory | grep used_memory_human', 'used_memory_human:1.00G'],
    ['$ redis-cli INFO memory', 'used_memory_human:1.30G', 'used_memory_peak_human:…', 'maxmemory_human:1.40G', 'evicted_keys:…'],
    [['# maxmemory 0 (제한 없음)', HL], ['# → RAM 을 넘기면 swap', HL]],
  ];
  function s1(t, c) { const { k, u } = c, b = c.beat.viz, p = c.prev ? c.prev.viz : null;
    term(20, 26, 420, 368, T1, k, u, { title: 'bash' });
    const used = p ? tween(p.used, b.used, u) : b.used * E(u, 0.6, 1.6), max = p ? tween(p.max, b.max, u) : b.max, keys = p ? tween(p.totalKeys, b.totalKeys, u) : b.totalKeys * E(u, 0.6, 1.6);
    if (k === 5) { tank(Math.min(used, 2.05), 0, { keys });
      const sw = E(u, 0.8, 1.8); dbIcon(870, 300, 'swap (디스크)', { stroke: BAD, op: fade(u, 0.6) });
      if (sw > 0) { el('path', { d: `M${TK.x + TK.w},${gy(1.9)} C${800},${gy(1.9)} ${830},${220} ${850},${262}`, fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': `${sw * 200} 300` }); }
      mono(TK.x + TK.w + 22, gy(2.05) + 18, '상한 없음', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) });
      card(860, 170, 190, 64, { rx: 10, stroke: BAD, sw: 2.5, s: pop(u, 1.6) });
      mono(860, 162, '0.2ms → 200ms', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.7) });
      tx(860, 186, '응답 1000배 악화', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
      note(680, '상한이 없으면 보호도 없다', fade(u, 2.2), BAD); return; }
    tank(used, max, { keys, maxOp: k === 0 ? fade(u, 0.4) : 1 });
    if (k === 0) { note(680, 'redis.conf 에 적어야 재시작 뒤에도 남는다', fade(u, 2.0)); return; }
    if (k === 1) { pill(840, 170, '재시작 없이 즉시', ACC, pop(u, 1.2), { fs: 14 }); pill(840, 214, 'conf 에도 꼭 반영', WARN, pop(u, 1.6), { fs: 14 });
      note(680, 'CONFIG SET 은 재시작하면 날아간다', fade(u, 2.1)); return; }
    if (k === 2) { const top = gy(2.05), y = gy(max);
      if (u > 1.2) { el('rect', { x: TK.x + 4, y: top + 4, width: TK.w - 8, height: Math.max(0, y - top - 8), rx: 5, fill: SOFT, stroke: MUT, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.2) });
        tx(TK.x + TK.w / 2, (top + y) / 2 - 4, 'OS · fork', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.4) });
        tx(TK.x + TK.w / 2, (top + y) / 2 + 16, '버퍼 몫', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.4) }); }
      note(680, '꽉 채우면 RDB 저장 때 fork 가 메모리를 못 잡는다', fade(u, 2.0)); return; }
    if (k === 3) { pill(860, 290, 'CONFIG GET = 상한', WARN, pop(u, 0.5), { fs: 14 }); pill(860, 336, 'INFO memory = 실제', ACC, pop(u, 1.3), { fs: 14 });
      note(680, '설정했다고 믿는 값과 실제 값을 둘 다 본다', fade(u, 2.0)); return; }
    // k4: 93%
    const y = gy(max); el('path', { d: `M${TK.x + TK.w - 30},${y - 22} l8,-12 l8,12 z`, fill: BAD, opacity: fade(u, 1.4) });
    tx(TK.x + TK.w - 22, y - 40, 'peak', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
    card(860, 230, 150, 60, { rx: 10, stroke: BAD, sw: 2.5, s: pop(u, 1.0) });
    mono(860, 240, Math.round(used / max * 100) + '%', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.1) });
    note(680, 'used 보다 peak · 순간 스파이크에서 죽는다', fade(u, 2.0)); }

  // ───────── 2. allkeys-lru ─────────
  const KX = (i) => 120 + i * 180, KY = 230;
  const idle = (s) => s >= 86400 ? (s / 86400) + '일' : s >= 3600 ? (s / 3600) + '시간' : s >= 60 ? (s / 60) + '분' : s + '초';
  function keyCard(x, y, key, sub, o) { o = o || {}; const gone = o.gone, col = gone ? OFF : o.col || INK;
    card(x, y, 166, 84, { rx: 10, stroke: gone ? GRID : o.ring || INK, sw: o.ring ? 3 : 2, fill: gone ? SOFT : o.fill || PANEL, dash: gone ? '5 5' : null, s: o.s, op: o.op });
    mono(x, y - 16, key, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: o.op ?? 1, 'text-decoration': gone ? 'line-through' : null });
    tx(x, y + 12, sub, { 'font-size': 14, 'text-anchor': 'middle', fill: gone ? OFF : o.subCol || MUT, opacity: o.op ?? 1, class: o.monoSub ? 'mono' : null }); }
  function memFull(u, o) { o = o || {}; const w = 560, x = 200, y = 64;
    el('rect', { x, y, width: w, height: 26, rx: 6, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    el('rect', { x: x + 3, y: y + 3, width: (w - 6) * (o.fill ?? 1), height: 20, rx: 4, fill: BADBG });
    tx(x - 12, y + 18, 'used', { 'font-size': 14.5, 'text-anchor': 'end', 'font-weight': 700, fill: BAD });
    tx(x + w + 12, y + 18, '= maxmemory', { 'font-size': 14.5, 'font-weight': 700, fill: WARN }); }
  function lruKeys(c, o) { o = o || {}; const keys = c.beat.viz.keys, pk = c.prev ? c.prev.viz.keys : null, u = c.u;
    keys.forEach((kk, i) => { const was = pk && pk[i] && pk[i].evicted, now = kk.evicted, gone = now && (was || u > (o.evictAt ?? 1.6));
      const st = (o.style && o.style(kk, i)) || {};
      keyCard(KX(i), KY, kk.key.replace('cache:', 'cache:'), (o.sub ? o.sub(kk) : idle(kk.lastAccess) + ' 전 사용'), Object.assign({ gone }, st));
      if (now && !was && u > (o.evictAt ?? 1.6) - 0.3) cross(KX(i) + 64, KY - 30, 10, pop(u, (o.evictAt ?? 1.6) - 0.3, 0.3)); }); }
  function s2(t, c) { const { k, u } = c, keys = c.beat.viz.keys;
    if (k === 1) { // used_memory 가 상한 근처를 오르내린다
      const X0 = 90, X1 = 900, Y = (v) => 330 - v * 220, maxV = 0.85;
      el('line', { x1: X0, y1: 340, x2: X1, y2: 340, stroke: INK, 'stroke-width': 2 }); el('line', { x1: X0, y1: 340, x2: X0, y2: 80, stroke: INK, 'stroke-width': 2 });
      tx(X0 - 10, 80, 'used_memory', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'start' });
      el('line', { x1: X0, y1: Y(maxV), x2: X1, y2: Y(maxV), stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '8 5' });
      mono(X0 + 14, Y(maxV) - 10, 'maxmemory', { 'font-size': 15, 'font-weight': 800, fill: WARN });
      const pts = []; let v = 0.6, x = X0; const n = 14, dx = (X1 - X0) / n;
      for (let i = 0; i < n; i++) { pts.push([x, Y(v)]); x += dx * 0.75; v = v + (v < maxV ? 0.07 : 0.05); pts.push([x, Y(v)]); if (v > maxV) { x += dx * 0.25; v = maxV - 0.03; pts.push([x, Y(v)]); } else x += dx * 0.25; }
      const shown = E(u, 0.2, 2.2), cut = X0 + (X1 - X0) * shown, vis = pts.filter((p) => p[0] <= cut);
      if (vis.length > 1) el('path', { d: 'M' + vis.map((p) => p.join(',')).join(' L'), fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-linejoin': 'round' });
      vis.forEach((p, i) => { if (i && p[1] > vis[i - 1][1] && vis[i - 1][1] < Y(maxV)) el('circle', { cx: p[0], cy: vis[i - 1][1], r: 5, fill: BAD }); });
      pill(300, 370, '새 명령 → 메모리 검사', INK, pop(u, 0.4), { fs: 14 }); pill(640, 370, '넘으면 키를 지워 복귀', BAD, pop(u, 1.2), { fs: 14 });
      return; }
    if (k <= 2) { memFull(u);
      lruKeys(c, { evictAt: 1.8, style: (kk) => (u > 0.4 && u < 1.9) ? { ring: INFO } : {} });
      const v = seg(u, 0.2, 0.8); if (v > 0 && v < 1) card(lerp(860, 860, v), lerp(20, 64, E(v, 0, 1)), 150, 28, { rx: 14, fill: ACC, stroke: 'none', text: 'SET cache:new', fs: 13.5, color: PANEL, mono: true });
      tx(480, 140, k === 0 ? '무작위 샘플 5개 중 가장 오래 안 쓴 키' : 'maxmemory-samples 5 → 10', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.5) });
      if (k === 0 && u > 2.0) pill(KX(4), KY + 76, 'cache:new 자리', ACC, pop(u, 2.0), { mono: true, fs: 13.5 });
      if (k === 2) { [['5', '빠름 · 부정확'], ['10', '균형'], ['50', '정확 · 느림']].forEach(([n, d], i) => { const x = 270 + i * 210, on = i === 1;
          card(x, 350, 190, 44, { rx: 22, stroke: on ? ACC : GRID, sw: on ? 2.5 : 1.5, fill: on ? ACCBG : PANEL, s: pop(u, 0.9 + i * 0.2) });
          mono(x - 70, 355, n, { 'font-size': 16, 'font-weight': 800, fill: on ? ACC : INK, opacity: fade(u, 1.0 + i * 0.2) }); tx(x - 40, 355, d, { 'font-size': 14.5, fill: on ? ACC : INK, opacity: fade(u, 1.0 + i * 0.2) }); }); }
      else note(480, '제거는 메모리가 찼을 때만 일어난다', fade(u, 2.2));
      return; }
    if (k === 3) { // 키마다 24bit lastaccess
      lruKeys(c, { style: () => ({}), sub: () => '' });
      keys.forEach((kk, i) => { const x = KX(i), a = 0.3 + i * 0.2;
        el('rect', { x: x - 60, y: KY + 2, width: 120, height: 26, rx: 4, fill: kk.evicted ? 'none' : INFOBG, stroke: kk.evicted ? GRID : INFO, 'stroke-width': 1.5, opacity: fade(u, a) });
        mono(x, KY + 20, '24bit 시각', { 'font-size': 13.5, 'text-anchor': 'middle', fill: kk.evicted ? OFF : INFO, opacity: fade(u, a) }); });
      // 없는 전역 리스트
      const y = 110; el('path', { d: `M${KX(0)},${y} L${KX(4)},${y}`, stroke: OFF, 'stroke-width': 2.5, 'stroke-dasharray': '6 6', opacity: fade(u, 1.4) });
      [0, 1, 2, 3, 4].forEach((i) => el('circle', { cx: KX(i), cy: y, r: 7, fill: PANEL, stroke: OFF, 'stroke-width': 2, opacity: fade(u, 1.4) }));
      if (u > 1.7) cross(480, y, 16, pop(u, 1.7));
      tx(480, 76, '전역 LRU 연결 리스트 — 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
      note(480, '뽑은 샘플끼리 시각만 비교한다', fade(u, 2.2)); return; }
    if (k === 4) { [['완벽한 LRU', '모든 키를 줄 세운 리스트', 300], ['Redis 근사 LRU', '키마다 24bit 시각 + 샘플', 660]].forEach(([n, d, x], i) => {
        card(x, 170, 300, 150, { rx: 12, stroke: i ? ACC : GRID, sw: i ? 2.5 : 1.5, s: pop(u, 0.3 + i * 0.4) });
        tx(x, 128, n, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: i ? ACC : INK, opacity: fade(u, 0.4 + i * 0.4) });
        tx(x, 156, d, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.4) });
        tx(x - 120, 204, '메모리', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.4) });
        el('rect', { x: x - 60, y: 192, width: (i ? 40 : 170) * E(u, 0.9 + i * 0.4, 1.5 + i * 0.4), height: 16, rx: 3, fill: i ? ACC : OFF }); });
      tx(480, 300, '고르는 키는 거의 같다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.8) });
      mono(480, 340, '완벽 LRU 대비 99% 효과', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.1) }); return; }
    if (k === 5) { const X0 = 120, X1 = 860, Yb = 330;
      el('line', { x1: X0, y1: Yb, x2: X1, y2: Yb, stroke: INK, 'stroke-width': 2 }); el('line', { x1: X0, y1: Yb, x2: X0, y2: 80, stroke: INK, 'stroke-width': 2 });
      mono(X0, 70, 'evicted_keys (누적)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const pts = [[0, 0], [0.55, 0.12], [0.62, 0.2], [0.75, 0.75], [1, 0.95]], sh = E(u, 0.2, 2.0);
      const vis = pts.filter((p) => p[0] <= sh).map((p) => [X0 + (X1 - X0) * p[0], Yb - 230 * p[1]]);
      if (vis.length > 1) el('path', { d: 'M' + vis.map((p) => p.join(',')).join(' L'), fill: 'none', stroke: ACC, 'stroke-width': 3 });
      if (u > 1.5) { el('rect', { x: X0 + (X1 - X0) * 0.6, y: 90, width: (X1 - X0) * 0.17, height: Yb - 90, fill: BADBG, opacity: 0.6 }); tx(X0 + (X1 - X0) * 0.685, 110, '기울기 급증', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) }); }
      note(480, '메모리 부족 · TTL 누락 · 핫 데이터 과다를 의심', fade(u, 2.1)); return; }
    // k6
    tx(480, 70, 'allkeys-lru 를 고를 때', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
    [['캐시 전용 인스턴스', '가장 흔한 경우'], ['어떤 키가 중요한지 딱 잘라 말할 수 없을 때', '우선순위가 흐릿하면 최근 사용이 안전한 기준']].forEach(([a, d], i) => { const y = 150 + i * 100, s = pop(u, 0.3 + i * 0.5);
      card(480, y, 640, 76, { rx: 12, stroke: GOOD, sw: 2, s }); check(200, y, 12, s);
      tx(230, y - 4, a, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.5) }); tx(230, y + 22, d, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) }); });
    note(480, 'LRU = 캐시의 표준', fade(u, 1.8), ACC); }

  // ───────── 3. allkeys-lfu ─────────
  const LX = 340, LW = 520, LMAX = Math.log10(30000);
  const lw = (f) => Math.max(6, LW * Math.log10(Math.max(1, f) * 1.0 + 1) / LMAX);
  function freqRows(c, o) { o = o || {}; const keys = c.beat.viz.keys, pk = c.prev ? c.prev.viz.keys : null, u = c.u, n = keys.length, top = o.top ?? 100, gap = o.gap ?? 54;
    keys.forEach((kk, i) => { const y = top + i * gap, pr = pk && pk[i] && pk[i].key === kk.key ? pk[i] : null, was = pr && pr.evicted, gone = kk.evicted && (was || u > (o.evictAt ?? 1.8));
      const f = pr ? tween(pr.freq, kk.freq, u - (o.tw ?? 0)) : kk.freq * E(u, 0.2 + i * 0.12, 1.0 + i * 0.12), col = gone ? OFF : kk.freq >= 1000 ? GOOD : kk.freq >= 50 ? WARN : BAD;
      mono(LX - 16, y + 5, kk.key, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: gone ? OFF : INK, 'text-decoration': gone ? 'line-through' : null });
      el('rect', { x: LX, y: y - 12, width: lw(f), height: 24, rx: 4, fill: col, opacity: gone ? 0.35 : 0.85 });
      mono(LX + lw(f) + 10, y + 5, fmtN(f), { 'font-size': 15, 'font-weight': 700, fill: gone ? OFF : INK });
      if (kk.evicted && !was && u > (o.evictAt ?? 1.8) - 0.2) cross(LX - 16 - tw(kk.key, 15) - 20, y, 10, pop(u, (o.evictAt ?? 1.8) - 0.2, 0.3)); }); }
  function s3(t, c) { const { k, u } = c, keys = c.beat.viz.keys;
    if (k === 0) { tx(LX, 58, '사용 횟수 (로그 눈금)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT }); freqRows(c);
      note(480, '카운터가 가장 낮은 키부터 사라진다', fade(u, 2.2)); return; }
    if (k === 1) { // 시간 vs 빈도
      [['LRU', '언제 마지막으로 썼나', '시간', 260], ['LFU', '모두 몇 번 썼나', '빈도', 700]].forEach(([n, q, a, x], i) => { const s = pop(u, 0.3 + i * 0.5);
        card(x, 150, 360, 150, { rx: 12, stroke: i ? ACC : INFO, sw: 2.5, s });
        tx(x, 112, n, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: i ? ACC : INFO, opacity: fade(u, 0.4 + i * 0.5) });
        tx(x, 150, '"' + q + '"', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.5) });
        tx(x, 186, '기준 = ' + a, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.6 + i * 0.5) }); });
      const gone = keys.filter((kk) => kk.evicted).map((kk) => kk.key);
      tx(480, 290, 'LFU 가 버리는 키', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.5) });
      gone.forEach((g, i) => { const x = 480 + (i - (gone.length - 1) / 2) * 220; pill(x, 330, g, BAD, pop(u, 1.6 + i * 0.3), { mono: true, fs: 14.5 }); });
      note(480, '최근 한 번 스친 키를 살릴지 버릴지가 갈린다', fade(u, 2.2)); return; }
    if (k === 2) { // burst
      freqRows(c, { top: 92, gap: 50, evictAt: 2.1 });
      const hy = 92 + 3 * 50; if (u > 0.6) pill(LX + 280, hy, '방금 호출됨', WARN, pop(u, 0.6), { fs: 13.5 });
      [['LRU', '방금 썼으니 살린다', INFO, 300], ['LFU', '하루 5회 → 먼저 버린다', ACC, 680]].forEach(([n, d, col, x], i) => { const a = 1.1 + i * 0.5;
        card(x, 330, 330, 54, { rx: 27, stroke: col, sw: 2.5, s: pop(u, a) });
        tx(x - 140, 336, n, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, a) }); tx(x - 90, 336, d, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); });
      return; }
    if (k === 3) { // Morris counter: 8bit
      tx(480, 58, 'Morris counter · 8bit', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      const bits = Math.floor(lerp(0, 255, E(u, 0.3, 2.2)) ** 0.5 * 16) & 255;
      for (let i = 0; i < 8; i++) { const on = (bits >> (7 - i)) & 1, x = 300 + i * 46; card(x, 130, 40, 48, { rx: 6, stroke: INK, sw: 2, fill: on ? ACCBG : PANEL, text: String(on), mono: true, fs: 18, color: on ? ACC : MUT }); }
      mono(690, 136, '0 ~ 255', { 'font-size': 16, 'font-weight': 700, fill: MUT });
      // 호출(점) 은 많지만 카운터는 가끔만 오른다
      for (let i = 0; i < 30; i++) { const x = 120 + i * 24, hit = i % 7 === 0 || i === 2 || i === 4; const show = u > 0.3 + i * 0.06;
        if (!show) continue; el('circle', { cx: x, cy: 236, r: 6, fill: hit ? ACC : OFF }); if (hit) el('line', { x1: x, y1: 226, x2: x, y2: 200, stroke: ACC, 'stroke-width': 2 }); }
      tx(120, 270, '호출마다 확률적으로 +1 · 값이 클수록 오를 확률이 작아진다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(480, 330, '8비트로 백만 단위 사용량까지 표현', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      note(480, 'OBJECT FREQ 는 실제 호출 수가 아니라 로그 근사치', fade(u, 2.2)); return; }
    if (k === 4) { tx(LX, 58, '시간이 지나면 카운터가 내려간다', { 'font-size': 14.5, 'font-weight': 700, fill: MUT }); freqRows(c, { tw: 0.8, evictAt: 9 });
      ring(110, 350, 20, 1 - E(u, 0.3, 1.8), WARN, 6); mono(140, 344, 'lfu-decay-time 1분', { 'font-size': 14.5, 'font-weight': 700, fill: WARN }); mono(140, 366, 'lfu-log-factor 10', { 'font-size': 14.5, 'font-weight': 700, fill: INFO });
      note(600, '감쇠가 없으면 옛 인기 키가 자리를 계속 차지한다', fade(u, 2.2)); return; }
    if (k === 5) { // OBJECT FREQ 는 LFU 일 때만
      terminal(30, 40, 430, 230, [['# maxmemory-policy allkeys-lfu', OFF], '> OBJECT FREQ cache:hot', ['(integer) 0~255 카운터', HL], '> OBJECT IDLETIME cache:hot', ['(error) ERR An LRU maxmemory', BAD], ['  policy is not selected …', BAD]], 6 * E(u, 0.2, 1.3), { title: 'allkeys-lfu' });
      terminal(500, 40, 430, 230, [['# maxmemory-policy allkeys-lru', OFF], '> OBJECT FREQ cache:hot', ['(error) ERR An LFU maxmemory', BAD], ['  policy is not selected …', BAD], '> OBJECT IDLETIME cache:hot', ['(integer) 마지막 접근 뒤 초', HL]], 6 * E(u, 1.2, 2.3), { title: 'allkeys-lru' });
      pill(245, 320, 'LFU → OBJECT FREQ', ACC, pop(u, 1.4), { mono: true, fs: 15 }); pill(715, 320, 'LRU → OBJECT IDLETIME', INFO, pop(u, 2.3), { mono: true, fs: 15 });
      return; }
    // k6: 대가
    tx(480, 64, 'LFU 의 대가', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
    [['유리할 때', '핫 / 콜드 차이가 크고 burst 가 있다', GOOD], ['CPU', 'LRU 보다 조금 더 쓴다', WARN], ['warmup', '측정 초반에는 빈도가 부정확하다', BAD]].forEach(([a, d, col], i) => { const y = 136 + i * 82, s = pop(u, 0.3 + i * 0.4);
      card(480, y, 620, 64, { rx: 12, stroke: col, sw: 2, s }); tx(200, y + 6, a, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.4) }); tx(330, y + 6, d, { 'font-size': 15.5, 'font-weight': 600, opacity: fade(u, 0.4 + i * 0.4) }); });
    note(480, 'burst 트래픽이면 LFU 가 LRU 보다 낫다', fade(u, 2.0), ACC); }

  // ───────── 4. volatile-* ─────────
  function vkey(x, y, kk, o) { o = o || {}; const prot = kk.protected, gone = o.gone;
    card(x, y, 190, 70, { rx: 10, stroke: gone ? GRID : prot ? INFO : WARN, sw: 2.5, fill: gone ? SOFT : prot ? INFOBG : PANEL, dash: gone ? '5 5' : null, s: o.s });
    mono(x, y - 8, kk.key, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: gone ? OFF : INK, 'text-decoration': gone ? 'line-through' : null, opacity: o.op ?? 1 });
    if (prot) { lock(x - 30, y + 18, true, INFO, 0.7); tx(x - 14, y + 23, 'TTL -1 · 보호', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 }); }
    else { ring(x - 40, y + 18, 9, kk.ttl / 600, gone ? OFF : WARN, 4); mono(x - 24, y + 23, 'TTL ' + kk.ttl + 's', { 'font-size': 13.5, 'font-weight': 700, fill: gone ? OFF : WARN }); } }
  function s4(t, c) { const { k, u } = c, keys = c.beat.viz.keys, n = keys.length;
    const pos = (i) => [480 + (i - (n - 1) / 2) * 220, 210];
    if (k === 0) { ['volatile-lru', 'volatile-lfu', 'volatile-ttl', 'volatile-random'].forEach((p, i) => { const on = i === 2 && u > 1.0;
        pill(150 + i * 220, 70, p, on ? ACC : INK, pop(u, 0.2 + i * 0.15), { mono: true, fs: 14.5, fill: on ? ACCBG : PANEL }); });
      keys.forEach((kk, i) => vkey(...pos(i), kk, { s: pop(u, 1.0 + i * 0.15) }));
      if (u > 1.7) keys.forEach((kk, i) => { if (kk.candidate) { const [x, y] = pos(i); el('rect', { x: x - 101, y: y - 41, width: 202, height: 82, rx: 13, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 1.7) }); } });
      note(480, '네 가지 모두 TTL 있는 키만 후보로 본다', fade(u, 2.1)); return; }
    if (k === 1) { zoneBox(60, 110, 400, 200, '영구 — 설정 · 인증', INFO, u, 0.2); zoneBox(500, 110, 400, 200, '임시 — 캐시', WARN, u, 0.5);
      keys.forEach((kk, i) => { const prot = kk.protected, j = keys.filter((q, m) => m < i && q.protected === prot).length; vkey((prot ? 260 : 700), 175 + j * 86, kk, { s: pop(u, 0.6 + i * 0.15) }); });
      note(480, '영구 키가 지워지면 캐시 미스가 아니라 데이터 손실', fade(u, 2.0), BAD); return; }
    const T = k === 2 ? ['> SET permanent:config "..."', '> SET cache:post:42 "..." EX 60', '> SET cache:post:43 "..." EX 600'] : null;
    if (k === 2) { terminal(30, 290, 520, 120, T, 3 * E(u, 0.2, 1.4), { title: 'redis-cli', lh: 24 });
      keys.forEach((kk, i) => vkey(...[200 + i * 280, 150], kk, { s: pop(u, 0.4 + i * 0.4) }));
      tx(740, 340, 'EX 를 붙이는 순간', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(740, 366, '"버려도 된다" 는 표시', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { memBarSmall(u);
      keys.forEach((kk, i) => { const gone = kk.evicted && u > 1.6; vkey(...[200 + i * 280, 210], kk, { gone }); if (kk.evicted && u > 1.2) cross(200 + i * 280 + 84, 210 - 34, 10, pop(u, 1.2, 0.3)); });
      if (u > 0.5 && u < 1.6) { el('rect', { x: 200 + 280 - 103, y: 210 - 43, width: 206, height: 86, rx: 13, fill: 'none', stroke: ACC, 'stroke-width': 3 }); el('rect', { x: 200 + 560 - 103, y: 210 - 43, width: 206, height: 86, rx: 13, fill: 'none', stroke: ACC, 'stroke-width': 3 }); }
      tx(480, 310, '남은 TTL 60s < 600s → cache:post:42 먼저', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) });
      note(480, '곧 사라질 키부터 지우니 히트율 손해가 작다', fade(u, 2.0)); return; }
    // k4: 후보 0개 → OOM
    memBarSmall(u);
    keys.forEach((kk, i) => vkey(...[200 + i * 280, 200], kk));
    tx(480, 270, '제거 후보 0개', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.5) });
    terminal(180, 296, 600, 100, ['> SET cache:post:44 "..."', ["(error) OOM command not allowed when used memory > 'maxmemory'.", BAD]], 2 * E(u, 0.8, 1.9), { title: 'redis-cli', fs: 13.5 });
    }
  function zoneBox(x, y, w, h, title, col, u, a) { el('rect', { x, y, width: w, height: h, rx: 14, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: fade(u, a) }); tx(x + 16, y - 10, title, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, a) }); }
  function memBarSmall(u) { el('rect', { x: 240, y: 56, width: 480, height: 26, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 2 }); tx(480, 74, '메모리 = maxmemory · 새 SET 이 왔다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD }); }

  // ───────── 5. noeviction ─────────
  function memV(pct, u) { const x = 60, w = 110, top = 70, bot = 340, h = bot - top;
    el('rect', { x, y: top, width: w, height: h, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    const fh = h * pct / 100, hot = pct >= 90; el('rect', { x: x + 4, y: bot - fh + 2, width: w - 8, height: Math.max(0, fh - 6), rx: 5, fill: hot ? BADBG : ACCBG, stroke: hot ? BAD : ACC, 'stroke-width': 1.5 });
    mono(x + w / 2, bot - fh / 2 + 8, Math.round(pct) + '%', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? BAD : ACC });
    tx(x + w / 2, bot + 26, '메모리', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT }); }
  // "명령 → 결과" 줄들
  function attempts(list, u, x, y, o) { o = o || {}; const W = o.w || 660; list.forEach((s, i) => { const [a, r] = s.split('→').map((q) => q.trim()), at = 0.3 + i * 0.5, yy = y + i * 64;
      const bad = /❌/.test(r || ''), warn = /⚠/.test(r || ''), good = /✅/.test(r || ''), col = bad ? BAD : warn ? WARN : good ? GOOD : INK;
      card(x + W / 2, yy, W, 50, { rx: 10, stroke: col, sw: 2, fill: bad ? BADBG : PANEL, s: pop(u, at) });
      tx(x + 20, yy + 6, a, { 'font-size': 15.5, 'font-weight': 700, class: /^[A-Za-z]/.test(a) ? 'mono' : null, opacity: fade(u, at + 0.1) });
      if (r) tx(x + W - 20, yy + 6, r.replace(/[❌✅⚠]/g, '').trim() || (good ? 'OK' : ''), { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: fade(u, at + 0.25) });
      if (bad) cross(x + W - 20 - tw(r.replace(/[❌✅⚠]/g, '').trim(), 15.5) - 24, yy, 9, pop(u, at + 0.25)); else if (good) check(x + W - 20 - tw(r.replace(/[❌✅⚠]/g, '').trim() || 'OK', 15.5) - 24, yy, 9, pop(u, at + 0.25)); }); }
  function s5(t, c) { const { k, u } = c, st = c.beat.viz.state, p = c.prev ? c.prev.viz.state : null;
    const pct = p ? tween(p.memory, st.memory, u) : st.memory * E(u, 0.1, 0.8);
    if (k === 1) { // 도미노
      memV(pct, u);
      person(300, 200, '사용자 요청', {}); redisBox(530, 120, { sub: 'SET → OOM', stroke: BAD, fill: BADBG }); dbIcon(800, 210, 'DB', { stroke: u > 1.6 ? BAD : INK });
      dot([[330, 190], [470, 130]], seg(u, 0.2, 0.7), BAD, 7); if (u > 0.7) cross(440, 150, 10, pop(u, 0.7, 0.3));
      for (let i = 0; i < 8; i++) dot([[330, 210], [750, 210]], ((t * 0.7 + i / 8) % 1) * (u > 1.0 ? 1 : 0), WARN, 5);
      tx(540, 250, '캐시 저장 실패 → 전부 DB 직행', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      card(800, 330, 170, 56, { rx: 10, stroke: BAD, sw: 2.5, s: pop(u, 1.6) }); mono(800, 337, 'CPU 95%', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.7) });
      note(540, '캐시 장애는 항상 DB 로 번진다', fade(u, 2.2), BAD); return; }
    if (k === 4) { // 정책 선택 가이드
      memV(pct, u);
      const G = [['캐시 전용 (대부분)', 'allkeys-lru'], ['burst 트래픽', 'allkeys-lfu'], ['영구 + 캐시 혼합', 'volatile-lru'], ['영속 DB', 'noeviction'], ['모르겠음', 'allkeys-lru']];
      G.forEach(([a, b], i) => { const y = 84 + i * 62, s = pop(u, 0.2 + i * 0.3), col = b === 'noeviction' ? INFO : i === 4 ? ACC : INK;
        card(565, y, 680, 48, { rx: 10, stroke: i === 4 ? ACC : GRID, sw: i === 4 ? 2.5 : 1.5, fill: i === 4 ? ACCBG : PANEL, s });
        tx(250, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) });
        grow(520, y, 620, y, E(u, 0.4 + i * 0.3, 0.7 + i * 0.3), MUT);
        mono(640, y + 6, b, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.6 + i * 0.3) }); });
      return; }
    memV(pct, u);
    if (k === 3) { // redis.conf 에 못 박기
      card(330, 150, 250, 130, { rx: 8, stroke: INK, sw: 2.5, s: pop(u, 0.2) }); mono(220, 112, 'redis.conf', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.3) });
      mono(220, 150, 'maxmemory 2gb', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) }); mono(220, 178, 'maxmemory-policy', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.7) }); mono(240, 200, 'allkeys-lru', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.7) });
      attempts(st.attempts, u, 490, 120, { w: 440 }); return; }
    attempts(st.attempts, u, 230, 110, {});
    if (k === 0) tx(560, 330, 'OOM command not allowed when used memory > \'maxmemory\'.', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, class: 'mono', opacity: fade(u, 1.4) });
    const NOTE = { 0: '읽기와 DEL 은 되고, 쓰기만 거부한다', 2: '정책만 바꿔도 자리가 생긴다 · FLUSHDB 는 최후 수단', 5: '이 셋이 조기 경보다' };
    if (NOTE[k]) note(560, NOTE[k], fade(u, 2.0), k === 0 ? BAD : INK); }

  R.page({ title: '메모리가 찼을 때 들여다보기', scenes: [s1, s2, s3, s4, s5] });
})();
