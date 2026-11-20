/* V-2-1 모니터링 (INFO · SLOWLOG · MONITOR · exporter · 알람) — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, redisBox, person, cross, check, clock, meters, terminal, snippet, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 이 페이지 전용 도우미 ----------
  // INFO 출력에서 "key: value" 를 찾는다
  const metric = (beat, key) => { for (const s of (beat.viz.sections || [])) for (const m of s.metrics) { const i = m.indexOf(':'); if (m.slice(0, i).trim() === key) return m.slice(i + 1).trim(); } return null; };
  const num = (s) => parseFloat(String(s).replace(/[^\d.]/g, ''));
  // '76%' '12,540' '0.8ms' 를 앞 beat 값에서 이어지게
  function numLike(prev, cur, u) { const m = /^([\d,.]+)(.*)$/.exec(cur); if (!m) return cur;
    const pm = prev && /^([\d,.]+)(.*)$/.exec(prev), b = +m[1].replace(/,/g, ''), a = pm ? +pm[1].replace(/,/g, '') : b;
    const dec = (m[1].split('.')[1] || '').length, v = tween(a, b, u);
    const s = m[1].includes(',') ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec);
    return s + m[2]; }
  // 문서 아이콘
  function doc(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-24,-30 H12 L24,-18 V30 H-24 Z', fill: PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M12,-30 V-18 H24', fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    [-8, 2, 12].forEach((y) => el('line', { x1: -14, y1: y, x2: 14, y2: y, stroke: OFF, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g));
    if (name) tx(0, 52, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  // 작은 선 그래프 (점 배열을 u 만큼 그린다)
  function spark(pts, u, col, sw) { const n = Math.max(2, Math.round(lerp(1, pts.length, clamp(u)))); if (u <= 0) return;
    el('polyline', { points: pts.slice(0, n).map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || ACC, 'stroke-width': sw || 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }); }

  // =====================================================================
  // 1. INFO — 섹션 판이 쏟아진다
  const tileH = (s) => 34 + s.metrics.length * 20;
  function tile(x, y, w, s, o) { o = o || {}; const h = tileH(s), g = G(x + w / 2, y + h / 2, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8 }, g);
    tx(-w / 2 + 12, -h / 2 + 22, '# ' + s.name[0].toUpperCase() + s.name.slice(1), { 'font-size': 15, 'font-weight': 700, fill: o.head || ACC, class: 'mono' }, g);
    s.metrics.forEach((m, i) => mono(-w / 2 + 12, -h / 2 + 44 + i * 20, m, { 'font-size': 13.5, fill: INK }, g)); }
  function layout(secs, x0, y0, w, gap) { const ys = [y0, y0]; return secs.map((s) => { const c = ys[0] <= ys[1] ? 0 : 1, p = { x: x0 + c * (w + gap), y: ys[c] }; ys[c] += tileH(s) + 10; return p; }); }
  function pour(c, cmds, startAt, step) { const { u } = c, secs = c.beat.viz.sections, pos = layout(secs, 340, 18, 290, 20);
    const prevNames = c.prev ? c.prev.viz.sections.map((s) => s.name) : [];
    secs.forEach((s, i) => { const a = startAt + i * step, isNew = c.k === 2 && prevNames.indexOf(s.name) < 0;
      dot([[322, 70], [pos[i].x, pos[i].y + 22]], seg(u, a - 0.3, a + 0.05), ACC, 5);
      tile(pos[i].x, pos[i].y, 290, s, { s: pop(u, a), stroke: isNew ? ACC : GRID, sw: isNew ? 2.4 : 1.8 }); });
    terminal(20, 18, 302, 40 + Math.max(1, cmds.length) * 22 + 8, cmds.map((x) => '$ redis-cli ' + x), cmds.length === 1 ? 0.2 + E(u, 0.1, 0.5) * 0.8 : clamp(u / step, 0, cmds.length), { title: 'redis-cli' }); }

  function s1(t, c) { const { k, u, beat } = c;
    if (k === 0) { pour(c, ['INFO'], 0.7, 0.3); sub(170, 120, '인자 없이 = 전 섹션', fade(u, 0.5), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { pour(c, ['INFO server', 'INFO clients', 'INFO memory', 'INFO stats'], 0.45, 0.45);
      const op = fade(u, 2.0); pill(170, 220, '− replication', OFF, op, { color: MUT });
      el('line', { x1: 112, y1: 220, x2: 228, y2: 220, stroke: MUT, 'stroke-width': 2, opacity: op });
      sub(170, 262, '필요한 섹션만 고른다', op, { 'font-weight': 700, fill: INK });
      tx(340, 268, '출력 길이 (INFO memory 처럼 하나만 고르면)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.1) });
      [['INFO', 1, OFF], ['INFO memory', 0.1, ACC]].forEach(([n, f, col], i) => { const y = 306 + i * 46, a = 2.15 + i * 0.2;
        mono(340, y + 6, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) });
        el('rect', { x: 470, y: y - 12, width: 420 * f * E(u, a, a + 0.4), height: 24, rx: 4, fill: col }); });
      mono(526, 358, '≈ 1/10', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.5) }); return; }
    if (k === 2) { pour(c, ['INFO replication', 'INFO persistence', 'INFO commandstats', 'INFO keyspace'], 0.45, 0.45);
      sub(170, 262, '따로 봐야 의미가 잡힌다', fade(u, 2.0), { 'font-weight': 700, fill: INK });
      tx(340, 268, 'commandstats — 어떤 명령이 서버를 먹나', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.1) });
      [['get', 'calls=950M', 1], ['hgetall', 'calls=10K', 1e4 / 950e6]].forEach(([n, cl, f], i) => { const y = 306 + i * 46, a = 2.15 + i * 0.2, bw = Math.max(4, 330 * f) * E(u, a, a + 0.4);
        mono(340, y + 6, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) });
        el('rect', { x: 440, y: y - 12, width: bw, height: 24, rx: 4, fill: ACC });
        mono(452 + bw, y + 6, cl, { 'font-size': 14, fill: MUT, opacity: fade(u, a + 0.2) }); }); return; }
    if (k === 3) { // Memory 핵심 5개
      terminal(20, 18, 380, 66, ['$ redis-cli INFO memory'], 0.2 + E(u, 0.05, 0.4) * 0.8);
      const used = num(metric(beat, 'used_memory_human')), peak = num(metric(beat, 'used_memory_peak_human')), max = num(metric(beat, 'maxmemory_human'));
      const x0 = 80, W = 800, y = 150, h = 44, px = (g) => x0 + W * g / max;
      el('rect', { x: x0, y, width: W, height: h, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      el('rect', { x: x0, y, width: Math.max(0, px(used) - x0) * E(u, 0.3, 1.2), height: h, rx: 6, fill: ACC, opacity: 0.85 });
      mono(x0 + 12, y + 28, 'used_memory ' + metric(beat, 'used_memory_human'), { 'font-size': 15, 'font-weight': 700, fill: PANEL, opacity: fade(u, 0.9) });
      const po = fade(u, 1.2); el('line', { x1: px(peak), y1: y - 22, x2: px(peak), y2: y + h + 4, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: po });
      mono(px(peak), y - 30, 'peak ' + metric(beat, 'used_memory_peak_human'), { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: po });
      const mo = fade(u, 1.5); el('line', { x1: x0 + W, y1: y - 10, x2: x0 + W, y2: y + h + 10, stroke: BAD, 'stroke-width': 4, opacity: mo });
      mono(x0 + W, y + h + 30, 'maxmemory ' + metric(beat, 'maxmemory_human'), { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: mo });
      // 단편화 비율
      const fr = num(metric(beat, 'mem_fragmentation_ratio')), fo = fade(u, 1.8);
      card(270, 330, 380, 110, { rx: 10, stroke: GRID, sw: 1.5, s: pop(u, 1.7) });
      mono(96, 300, 'mem_fragmentation_ratio', { 'font-size': 14, fill: MUT, opacity: fo });
      const sx = (v) => 110 + (v - 0.8) / 1.2 * 300; el('line', { x1: sx(0.8), y1: 352, x2: sx(2.0), y2: 352, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: fo });
      el('line', { x1: sx(1.5), y1: 352, x2: sx(2.0), y2: 352, stroke: BAD, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: fo * 0.7 });
      [1.0, 1.5].forEach((v) => mono(sx(v), 378, v.toFixed(1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: v >= 1.5 ? BAD : MUT, opacity: fo }));
      el('circle', { cx: sx(fr), cy: 352, r: 9 * pop(u, 2.0), fill: GOOD });
      mono(420, 334, String(fr), { 'font-size': 24, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      // eviction 누적
      card(690, 330, 380, 110, { rx: 10, stroke: GRID, sw: 1.5, s: pop(u, 2.1) });
      mono(516, 300, 'evicted_keys', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) });
      mono(516, 350, metric(beat, 'evicted_keys'), { 'font-size': 30, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) });
      tx(560, 348, '쫓겨난 키 없음 (누적)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    if (k === 4) { // Stats — 히트율
      terminal(20, 18, 380, 66, ['$ redis-cli INFO stats'], 0.2 + E(u, 0.05, 0.4) * 0.8);
      const hits = num(metric(beat, 'keyspace_hits')), miss = num(metric(beat, 'keyspace_misses')), x0 = 80, W = 800, y = 120, hw = W * hits / (hits + miss);
      el('rect', { x: x0, y, width: W, height: 44, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      el('rect', { x: x0, y, width: hw * E(u, 0.3, 1.1), height: 44, rx: 6, fill: ACC, opacity: 0.85 });
      el('rect', { x: x0 + hw, y, width: (W - hw) * E(u, 0.9, 1.3), height: 44, fill: BAD, opacity: 0.85 });
      mono(x0 + 12, y + 28, 'keyspace_hits ' + metric(beat, 'keyspace_hits'), { 'font-size': 15, 'font-weight': 700, fill: PANEL, opacity: fade(u, 0.8) });
      mono(x0 + W, y - 12, 'keyspace_misses ' + metric(beat, 'keyspace_misses'), { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.2) });
      const hr = (beat.viz.sections[1].metrics.find((m) => m.indexOf('hit rate') >= 0) || '').split(':')[1].trim();
      mono(480, 222, 'hits / (hits + misses) = ' + hr, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      if (u > 1.8) meters(80, 262, 800, [
        { name: 'instantaneous_ops_per_sec', val: metric(beat, 'instantaneous_ops_per_sec') },
        { name: 'rejected_connections', val: metric(beat, 'rejected_connections'), good: true },
        { name: 'expired_keys (TTL 만료 누적)', val: metric(beat, 'expired_keys') },
      ], { h: 72 });
      tx(480, 372, 'rejected 가 늘면 maxclients 를 넘긴 것', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { // Clients · Replication
      const M = [250, 210]; lbl(250, 40, 'INFO clients', fade(u, 0.1), { class: 'mono' });
      for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, blocked = i % 5 === 2, rr = 118, s = pop(u, 0.2 + i * 0.03);
        const x = M[0] + Math.cos(a) * rr, y = M[1] + Math.sin(a) * rr * 0.72;
        el('line', { x1: x, y1: y, x2: lerp(x, M[0], 0.45), y2: lerp(y, M[1], 0.45), stroke: blocked ? WARN : GRID, 'stroke-width': 1.5, opacity: s > 0.5 ? 1 : 0, 'stroke-dasharray': blocked ? '3 3' : null });
        el('circle', { cx: x, cy: y, r: 6 * s, fill: blocked && u > 1.0 ? WARN : OFF }); }
      redisBox(M[0], M[1], { w: 120, h: 50, s: pop(u, 0.1) });
      mono(250, 330, 'connected_clients ' + metric(beat, 'connected_clients'), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      mono(250, 356, 'blocked_clients ' + metric(beat, 'blocked_clients'), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.1) });
      sub(250, 380, '주황 = BLPOP 으로 기다리는 중', fade(u, 1.3));
      lbl(700, 40, 'INFO replication', fade(u, 1.2), { class: 'mono' });
      server(600, 210, 'master', { s: pop(u, 1.3), lamp: GOOD });
      [[850, 105], [850, 265]].forEach(([x, y], i) => { const a = 1.6 + i * 0.25;
        grow(658, 210, x - 60, y, E(u, a, a + 0.4), ACC, { plain: true });
        dot([[658, 210], [x - 60, y]], ((t * 0.7 + i * 0.5) % 1) * (u > a + 0.4 ? 1 : 0), ACC, 5);
        server(x, y, 'replica ' + (i + 1), { s: pop(u, a), lamp: GOOD }); });
      pill(728, 150, 'link up', GOOD, pop(u, 2.1), { fs: 13.5 });
      mono(720, 372, 'master_last_io_seconds_ago ' + metric(beat, 'master_last_io_seconds_ago'), { 'font-size': 14, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 2.3) });
      sub(720, 396, '복제 지연 추정 = 1초 전에 마지막으로 받았다', fade(u, 2.4)); return; }
    // k6 redis-py
    snippet(40, 36, ['r = redis.Redis()', 'r.info()', "r.info('memory')['used_memory_human']"], { fs: 15, op: fade(u, 0.1) });
    grow(440, 92, 500, 92, E(u, 0.5, 0.9), ACC);
    const dl = ["{'redis_version': '7.2.4',", " 'connected_clients': 234,", " 'used_memory_human': '1.5G',", " 'instantaneous_ops_per_sec': 12000,", ' … }'];
    el('rect', { x: 510, y: 24, width: 420, height: 150, rx: 8, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.8) });
    dl.forEach((s, i) => mono(526, 52 + i * 26, s, { 'font-size': 14, opacity: fade(u, 0.9 + i * 0.15) }));
    tx(720, 196, 'dict 로 돌려준다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
    // 1분마다 긁기
    const x0 = 100, x1 = 860, y = 300; el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 3, opacity: fade(u, 1.4) });
    for (let i = 0; i <= 4; i++) { const x = lerp(x0, x1, i / 4), s = pop(u, 1.5 + i * 0.15);
      el('circle', { cx: x, cy: y, r: 8 * s, fill: i < 2 ? OFF : ACC }); mono(x, y + 30, i + '분', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s > 0.3 ? 1 : 0 }); }
    tx(x0, y - 26, '1분마다 r.info() 를 긁어 저장', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
    const so = fade(u, 2.2); el('line', { x1: x0 - 6, y1: y, x2: lerp(x0, x1, 0.25) + 6, y2: y, stroke: BAD, 'stroke-width': 3, opacity: so });
    tx(lerp(x0, x1, 0.12), y + 64, '손으로 → 빠뜨린다', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: so });
    pill(lerp(x0, x1, 0.7), y + 72, 'redis_exporter 가 대신 (Step 4)', ACC, pop(u, 2.3), { fs: 14 }); }

  // =====================================================================
  // 2. SLOWLOG — 임계치를 넘은 명령만 링버퍼에
  const ms = (d) => num(String(d).replace(/\(.*\)/, ''));
  function strip(y, ids, o) { o = o || {}; const op = o.op ?? 1;
    tx(60, y - 12, 'SLOWLOG 링버퍼 (slowlog-max-len 256)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op });
    for (let i = 0; i < 12; i++) { const v = ids[i], vo = v != null ? (o.vop ? o.vop(i) : 1) : 0;
      el('rect', { x: 60 + i * 62, y, width: 56, height: 40, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      if (vo > 0) { el('rect', { x: 60 + i * 62, y, width: 56, height: 40, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: vo * op });
        mono(88 + i * 62, y + 26, '#' + v, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: vo * op }); } }
    mono(812, y + 26, '… 256', { 'font-size': 15, fill: MUT, opacity: op });
    el('path', { d: `M880,${y + 20} C925,${y + 20} 925,${y + 70} 870,${y + 70} L100,${y + 70} C42,${y + 70} 30,${y + 20} 54,${y + 20}`, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', 'marker-end': 'url(#ra-ah)', opacity: op });
    sub(480, y + 64, '가득 차면 가장 오래된 항목이 밀려난다', op); }
  function rows(entries, y0, o) { o = o || {}; const max = Math.max(...entries.map((e) => ms(e.duration)));
    entries.forEach((e, i) => { const y = y0 + i * 40, a = (o.at || 0.4) + i * (o.step || 0.25), op = fade(u0, a), d = ms(e.duration), hot = o.hot && o.hot(i, e);
      if (hot) el('rect', { x: 28, y: y - 26, width: 904, height: 36, rx: 6, fill: ACCBG, opacity: op });
      mono(40, y, '#' + e.id, { 'font-size': 14, fill: MUT, opacity: op }); tx(84, y, e.time, { 'font-size': 13.5, fill: MUT, opacity: op });
      mono(160, y, e.cmd, { 'font-size': 14.5, 'font-weight': 700, opacity: op });
      const bw = Math.max(3, 250 * d / max) * E(u0, a, a + 0.6); el('rect', { x: 420, y: y - 15, width: bw, height: 16, rx: 3, fill: d >= 100 ? BAD : GOOD, opacity: 0.85 });
      mono(428 + bw, y, e.duration, { 'font-size': 14, 'font-weight': 700, fill: d >= 100 ? BAD : GOOD, opacity: op });
      mono(930, y, e.client, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }); }
  let u0 = 0;

  function s2(t, c) { const { k, u, beat } = c; u0 = u;
    if (k === 0) {
      terminal(20, 18, 620, 92, ['$ redis-cli CONFIG SET slowlog-log-slower-than 10000', '$ redis-cli CONFIG SET slowlog-max-len 256'], clamp(E(u, 0.1, 1.0) * 2, 0, 2));
      const y = 200, go = fade(u, 1.0);
      el('line', { x1: 60, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 3, opacity: go });
      el('rect', { x: 470, y: y - 34, width: 20, height: 68, rx: 4, fill: WARN, opacity: go });
      tx(480, y - 46, '10000µs = 10ms 넘으면 기록', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: go });
      tx(60, y + 30, '명령', { 'font-size': 14, fill: MUT, opacity: go }); tx(900, y + 30, '빠른 명령은 그냥 통과', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: go });
      if (u > 1.1) for (let i = 0; i < 7; i++) dot([[60, y], [900, y]], (t * 0.35 + i / 7) % 1, ACC, 5);
      strip(300, [], { op: fade(u, 1.5) });
      mono(900, 288, '0 / 256', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 1) {
      terminal(20, 18, 620, 66, ['$ redis-cli SLOWLOG GET'], 0.2 + E(u, 0.05, 0.4) * 0.8);
      const en = beat.viz.entries; strip(300, en.map((e) => e.id), { op: 1 });
      en.forEach((e, i) => dot([[88 + i * 62, 300], [160, 120 + i * 40]], seg(u, 0.4 + i * 0.3, 0.8 + i * 0.3), ACC, 5));
      u0 = u - 0.4; rows(en, 130, { at: 0.4, step: 0.3 }); u0 = u;
      mono(900, 288, en.length + ' / 256', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: ACC, opacity: 1 }); return; }
    if (k === 2) { const e = beat.viz.entries[0], dur = String(e.duration).match(/\d+/)[0], parts = e.cmd.split(' ');
      const R0 = [['1) (integer) ' + e.id, 'ID'], ['2) (integer) 1715000000', '시각 (unix 초)'], ['3) (integer) ' + dur, '소요 µs'],
        ['4) 1) "' + parts[0] + '"  2) ' + parts.slice(1).join(' '), '명령과 인자'], ['5) "' + e.client + '"', '클라이언트 주소'], ['6) ""', '클라이언트 이름']];
      el('rect', { x: 60, y: 24, width: 840, height: 296, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.05) });
      R0.forEach(([raw, name], i) => { const y = 66 + i * 46, a = 0.2 + i * 0.28, op = fade(u, a), hot = i === 2;
        if (hot) el('rect', { x: 72, y: y - 26, width: 816, height: 38, rx: 6, fill: ACCBG, opacity: op });
        mono(90, y, raw, { 'font-size': 16, 'font-weight': hot ? 800 : 600, fill: i === 5 ? MUT : INK, opacity: op });
        grow(510, y - 6, 560, y - 6, E(u, a + 0.1, a + 0.35), MUT);
        tx(574, y, name, { 'font-size': 15, 'font-weight': 700, fill: hot ? ACC : INK, opacity: op }); });
      pill(790, 158, dur + 'µs = 1.2초', BAD, pop(u, 2.0), { mono: true, fs: 14 });
      tx(480, 360, 'µs 를 1000 으로 나눠야 ms 다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { // 실행 시간만 잰다
      const e = beat.viz.entries[0], dur = String(e.duration).match(/\d+/)[0], y = 190, X = [110, 260, 450, 730, 870];
      const names = ['요청 전송', '대기열', '실행 · ' + e.cmd.split(' ')[0], '응답 전송'], subs = ['네트워크', '앞 명령 기다림', '', '네트워크'];
      person(60, y + 20, null, { s: pop(u, 0.1) });
      zone(X[1] - 8, y - 60, X[3] - X[1] + 16, 128, 'Redis 서버 안', { op: fade(u, 0.5) });
      names.forEach((n, i) => { const a = 0.3 + i * 0.4, w = (X[i + 1] - X[i]) * E(u, a, a + 0.35), ex = i === 2;
        el('rect', { x: X[i], y, width: Math.max(0, w - 4), height: 40, rx: 6, fill: ex ? BAD : i === 1 ? WARN : OFF, opacity: ex ? 0.9 : 0.55 });
        tx((X[i] + X[i + 1]) / 2, y + 26, n, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ex ? PANEL : INK, opacity: fade(u, a + 0.25) });
        if (subs[i]) sub((X[i] + X[i + 1]) / 2, y + 62, subs[i], fade(u, a + 0.3)); });
      dot([[X[0], y + 20], [X[4], y + 20]], seg(u, 0.3, 1.9), INK, 6);
      const bo = fade(u, 1.9); el('path', { d: `M${X[2]},${y - 76} V${y - 86} H${X[3] - 4} V${y - 76}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: bo });
      tx((X[2] + X[3]) / 2, y - 96, 'SLOWLOG 가 재는 구간 = ' + dur + 'µs', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: bo });
      const ao = fade(u, 2.2); el('path', { d: `M${X[0]},${y + 84} V${y + 94} H${X[4]} V${y + 84}`, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: ao });
      tx((X[0] + X[4]) / 2, y + 118, '클라이언트가 느끼는 시간 = 네 구간 전부', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: ao });
      tx(480, 395, 'SLOWLOG 가 비어도 느릴 수 있다 → 네트워크 · 대기열을 본다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: INK, opacity: fade(u, 2.5) }); return; }
    if (k === 4) { // LEN, RESET
      const sh = seg(u, 0.1, 0.5) + (u > 0.6 ? 1 : 0) + seg(u, 1.2, 1.6) + (u > 1.75 ? 1 : 0);
      terminal(20, 18, 440, 136, ['$ redis-cli SLOWLOG LEN', '(integer) ' + beat.viz.entries.length, '$ redis-cli SLOWLOG RESET', 'OK'], Math.max(0.2, sh));
      const n = u < 1.8 ? beat.viz.entries.length : 0;
      tx(700, 54, 'SLOWLOG LEN', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, class: 'mono', opacity: fade(u, 0.6) });
      mono(700, 140, String(n), { 'font-size': 72, 'font-weight': 800, 'text-anchor': 'middle', fill: n ? WARN : GOOD, opacity: fade(u, 0.6) });
      tx(700, 186, n ? '조치 끝날 때까지 남겨 둔다' : '비웠다 → 내일은 새것만', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: n ? WARN : GOOD, opacity: fade(u, 0.7) });
      strip(300, beat.viz.entries.map((e) => e.id), { vop: (i) => 1 - seg(u, 1.8 + i * 0.12, 2.2 + i * 0.12) }); return; }
    if (k === 5) { // 단골 범인
      const en = beat.viz.entries; rows(en, 44, { at: 0.2, step: 0.2, hot: (i, e) => !c.prev.viz.entries.some((p) => p.cmd === e.cmd) });
      const y = 290, op = fade(u, 1.3); tx(80, y - 14, 'Redis 메인 스레드 (하나뿐)', { 'font-size': 14.5, 'font-weight': 700, opacity: op });
      el('rect', { x: 80, y, width: 800, height: 40, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      el('rect', { x: 140, y, width: 520 * E(u, 1.4, 2.1), height: 40, rx: 6, fill: BAD, opacity: 0.9 });
      mono(160, y + 26, en[0].cmd + '  ' + en[0].duration, { 'font-size': 15, 'font-weight': 800, fill: PANEL, opacity: fade(u, 1.9) });
      for (let i = 0; i < 8; i++) { const s = pop(u, 1.6 + i * 0.08); el('circle', { cx: 690 + i * 22, cy: y + 20, r: 7 * s, fill: WARN }); }
      tx(860, y + 72, '그동안 다른 요청은 전부 멈춘다', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.2) }); return; }
    if (k === 6) { // SCAN · 페이지로 교체
      const old = c.prev.viz.entries.slice(0, 3), nw = beat.viz.entries, max = ms(old[0].duration);
      tx(40, 44, '전 — SLOWLOG 단골', { 'font-size': 15, 'font-weight': 700, fill: BAD }); tx(520, 44, '후 — 조금씩 나눠 읽기', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5) });
      old.forEach((o, i) => { const y = 100 + i * 92, a = 0.4 + i * 0.45, d0 = ms(o.duration), d1 = ms(nw[i].duration);
        mono(40, y, o.cmd, { 'font-size': 15, 'font-weight': 700, opacity: 1 - 0.5 * fade(u, a + 0.6) });
        el('rect', { x: 40, y: y + 12, width: 380 * d0 / max, height: 16, rx: 3, fill: BAD, opacity: 0.85 - 0.45 * fade(u, a + 0.6) });
        mono(40 + 380 * d0 / max + 8, y + 26, o.duration, { 'font-size': 14, 'font-weight': 700, fill: BAD });
        grow(440, y + 4, 506, y + 4, E(u, a, a + 0.3), ACC);
        mono(520, y, nw[i].cmd, { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, a + 0.2) });
        el('rect', { x: 520, y: y + 12, width: Math.max(4, 380 * d1 / max) * pop(u, a + 0.4), height: 16, rx: 3, fill: GOOD });
        mono(536, y + 26, nw[i].duration, { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, a + 0.5) }); });
      banner(480, 386, '100ms 넘는 명령이 SLOWLOG 에서 사라졌다', pop(u, 2.2)); return; }
    // k7 일일 루틴
    const cx = 420, cy = 215, rx = 230, ry = 140, st = ['SLOWLOG GET 50', '범인 endpoint 추적', '코드 수정 → 배포', 'SLOWLOG RESET'];
    el('ellipse', { cx, cy, rx, ry, fill: 'none', stroke: GRID, 'stroke-width': 3, 'stroke-dasharray': '8 6', opacity: fade(u, 0.1) });
    const pts = []; for (let i = 0; i <= 40; i++) { const a = -Math.PI / 2 + i / 40 * Math.PI * 2; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    if (u > 1.6) dot(pts, (t * 0.3) % 1, ACC, 8);
    st.forEach((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
      card(x, y, tw(s, 15) + 56, 46, { rx: 23, text: (i + 1) + '  ' + s, fs: 15, mono: i === 0 || i === 3, stroke: i === 3 ? GOOD : ACC, sw: 2.2, s: pop(u, 0.3 + i * 0.35) }); });
    lbl(cx, cy - 6, '매일', fade(u, 1.5), { 'font-size': 22 });
    sub(cx, cy + 20, '느린 명령 ' + beat.viz.entries.length + '건부터', fade(u, 1.6));
    card(810, 360, 220, 80, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 2.0), text: 'cron 으로 자동화\n사람이 빠뜨리지 않게', fs: 14.5 }); }

  // =====================================================================
  // 3. MONITOR — 모든 명령을 복사해 흘린다
  const clients = (beat) => beat.viz.sample.map((s) => { const m = /id=(\d+) addr=(\S+) name=(\S*)\s+cmd=(\S+)\s+last-cmd-time=(\d+)/.exec(s); return m && { id: m[1], addr: m[2], name: m[3], cmd: m[4], last: m[5] }; }).filter(Boolean);
  function clientCards(cl, u, o) { o = o || {}; const RX = 800, RY = 215, ua = o.shown ? 3 : u;
    redisBox(RX, RY, { w: 130, h: 56, s: pop(ua, 0.1) });
    cl.forEach((q, i) => { const y = 90 + i * 125, a = 0.3 + i * 0.3, killed = o.kill === q.id, ko = killed ? seg(u, 1.1, 1.6) : 0, noName = !q.name;
      const op = 1 - ko * 0.65;
      grow(362, y, lerp(362, RX - 66, 1 - ko * 0.5), lerp(y, RY + (i - 1) * 14, 1 - ko * 0.5), E(ua, a, a + 0.4), killed && ko > 0 ? BAD : GRID, { plain: true, sw: 2.5, op });
      if (!killed) dot([[362, y], [RX - 66, RY + (i - 1) * 14]], (u * 0.5 + i * 0.33) % 1 * (u > a + 0.4 ? 1 : 0), ACC, 5);
      card(200, y, 324, 82, { rx: 10, stroke: noName ? WARN : INK, sw: noName ? 2.5 : 2, s: pop(ua, a), op,
        text: 'id=' + q.id + '  name=' + (q.name || '(없음)') + '\naddr=' + q.addr + '\ncmd=' + q.cmd + '  last-cmd-time=' + q.last, fs: 14, mono: true, fw: 600 });
      if (killed) cross(lerp(362, RX - 66, 0.5), lerp(y, RY + (i - 1) * 14, 0.5), 14, pop(u, 0.9)); }); }

  function s3(t, c) { const { k, u, beat } = c;
    if (k === 0) { const sm = beat.viz.sample;
      terminal(20, 14, 920, 200, ['$ redis-cli MONITOR', 'OK', ...sm], u < 0.5 ? 0.2 + E(u, 0.05, 0.4) * 0.8 : 2 + sm.length * E(u, 0.5, 1.5));
      const line = sm[0], fs = 18, cw = fs * 0.6, x0 = 480 - line.length * cw / 2, y = 290;
      const segs = [[0, 14, '시각', INK], [16, 17, 'DB', INFO], [18, 32, '클라이언트', WARN], [34, 39, '명령', ACC], [40, 48, '인자', MUT]];
      const lo = fade(u, 1.5); mono(x0, y, line, { 'font-size': fs, 'font-weight': 700, opacity: lo });
      segs.forEach(([a, b, name, col], i) => { const o = fade(u, 1.7 + i * 0.15), xa = x0 + a * cw, xb = x0 + b * cw;
        el('path', { d: `M${xa + 2},${y + 10} V${y + 18} H${xb - 2} V${y + 10}`, fill: 'none', stroke: col, 'stroke-width': 2.5, opacity: o });
        tx((xa + xb) / 2, y + 42, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, opacity: o }); });
      pill(480, 386, beat.viz.warning, BAD, pop(u, 2.4), { fs: 14 }); return; }
    if (k === 1) { const sm = beat.viz.sample.map((s) => { const i = s.indexOf('←'); return i > 0 ? [s.slice(0, i).trimEnd() + '   ← ' + s.slice(i + 1).trim(), BAD] : s; });
      terminal(20, 14, 920, 156, ['$ redis-cli MONITOR', ...sm], 1 + sm.length * E(u, 0.1, 1.2));
      person(170, 290, '10.0.0.9:51001', { s: pop(u, 1.3), stroke: BAD });
      [['"FLUSHDB"', 252], ['"KEYS" "*"', 330]].forEach(([s, y], i) => { const a = 1.5 + i * 0.3; grow(204, 290, 400, y, E(u, a, a + 0.3), BAD);
        pill(470, y, s, BAD, pop(u, a + 0.25), { mono: true, fs: 14.5 }); });
      banner(760, 290, '이 주소부터 추적한다', pop(u, 2.3)); return; }
    if (k === 2) { const RX = 480, RY = 160;
      [[90, 90], [90, 170], [90, 250]].forEach(([x, y], i) => { person(x, y, null, { s: pop(u, 0.1 + i * 0.1) });
        if (u > 0.3) for (let j = 0; j < 3; j++) dot([[x + 30, y], [RX - 80, RY]], (t * 0.9 + j / 3 + i * 0.11) % 1, ACC, 5); });
      redisBox(RX, RY, { w: 150, h: 64, sub: '명령 처리', s: pop(u, 0.2) });
      const mo = fade(u, 0.8); el('rect', { x: 760, y: RY - 50, width: 170, height: 100, rx: 8, fill: INK, opacity: mo });
      mono(845, RY - 18, 'MONITOR', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: mo });
      mono(845, RY + 22, numLike('0', '12,000', u) + ' 줄/초', { 'font-size': 15, 'font-weight': 700, fill: 'var(--term)', 'text-anchor': 'middle', opacity: mo });
      if (u > 1.0) for (let j = 0; j < 9; j++) dot([[RX + 80, RY], [758, RY]], (t * 0.9 + j / 9) % 1, BAD, 5);
      sub(620, RY - 22, '모든 명령을 복사', fade(u, 1.1), { fill: BAD, 'font-weight': 700 });
      const co = pop(u, 1.6); card(RX, 300, 210, 64, { rx: 10, stroke: BAD, sw: 2.5, s: co, text: 'CPU +50% 이상', fs: 18, color: BAD, fw: 800 });
      card(780, 300, 210, 64, { rx: 10, stroke: BAD, sw: 2.5, s: pop(u, 1.9), text: '네트워크 부하', fs: 18, color: BAD, fw: 800 });
      tx(480, 392, 'OPS 가 높을수록 비용도 같이 커진다 — 운영 시간엔 금지', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { // timeout 10
      terminal(20, 14, 920, 66, ['$ timeout 10 redis-cli MONITOR > monitor.log'], 0.2 + E(u, 0.05, 0.5) * 0.8);
      const left = 1 - E(u, 0.5, 2.3), secs = Math.ceil(10 * left - 0.001);
      clock(170, 230, 70, left, WARN); el('circle', { cx: 170, cy: 230, r: 34, fill: PANEL }); mono(170, 238, secs + '초', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: INK });
      sub(170, 330, '10초 뒤 강제 종료', 1, { 'font-weight': 700, fill: INK });
      redisBox(440, 230, { w: 130, h: 56, s: pop(u, 0.2) });
      if (u > 0.5 && u < 2.3) for (let j = 0; j < 6; j++) dot([[508, 230], [730, 230]], (t * 1.1 + j / 6) % 1, ACC, 5);
      if (u >= 2.3) cross(620, 230, 14, pop(u, 2.3));
      doc(790, 222, 'monitor.log', { s: pop(u, 0.4) });
      const n = Math.round(118402 * E(u, 0.5, 2.3)); mono(790, 320, n.toLocaleString('en-US') + ' 줄', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5) });
      pill(790, 360, '저장 완료 (10초)', GOOD, pop(u, 2.4), { fs: 14 }); return; }
    if (k === 4) { // redis-faina
      doc(80, 76, 'monitor.log', { s: pop(u, 0.1) });
      grow(112, 70, 200, 70, E(u, 0.3, 0.6), MUT); pill(290, 70, 'head -10000', INK, pop(u, 0.5), { mono: true, fs: 14 });
      grow(370, 70, 450, 70, E(u, 0.7, 1.0), MUT); pill(530, 70, 'redis-faina', ACC, pop(u, 0.9), { mono: true, fs: 14.5 });
      const st = beat.viz.sample.map((s) => /^(\S+)\s+([\d,]+) 회\s+avg ([\d.]+µs)/.exec(s)).filter(Boolean), max = num(st[0][2]);
      tx(220, 150, '호출 수', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.1) }); tx(900, 150, '평균 소요', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.1) });
      st.forEach((m, i) => { const y = 192 + i * 50, a = 1.1 + i * 0.25, slow = num(m[3]) >= 1000, bw = Math.max(3, 320 * num(m[2]) / max) * E(u, a, a + 0.5);
        mono(60, y, m[1], { 'font-size': 16, 'font-weight': 800, fill: slow ? BAD : INK, opacity: fade(u, a) });
        el('rect', { x: 220, y: y - 15, width: bw, height: 18, rx: 3, fill: ACC, opacity: 0.85 });
        mono(228 + bw, y, m[2] + ' 회', { 'font-size': 14, opacity: fade(u, a + 0.3) });
        mono(900, y, m[3], { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: slow ? BAD : INK, opacity: fade(u, a + 0.3) });
        if (slow) pill(700, y - 5, '느림', BAD, pop(u, a + 0.5), { fs: 13.5 }); });
      const top = beat.viz.sample.find((s) => s.indexOf('top key') === 0);
      pill(480, 370, top, INK, pop(u, 2.2), { mono: true, fs: 14.5 }); return; }
    if (k === 5) { pill(480, 28, 'redis-cli CLIENT LIST', INK, pop(u, 0.05), { mono: true, fs: 14 });
      clientCards(clients(beat), u, {}); sub(800, 290, '접속자 목록만 읽는다', fade(u, 1.5), { fill: GOOD, 'font-weight': 700 });
      pill(800, 330, '상시 부담 없음', GOOD, pop(u, 1.8), { fs: 14 }); return; }
    if (k === 6) { // commandstats
      terminal(20, 14, 520, 66, ['$ redis-cli INFO commandstats'], 0.2 + E(u, 0.05, 0.4) * 0.8);
      const st = beat.viz.sample.map((s) => /cmdstat_(\w+):calls=(\w+),usec_per_call=([\d.]+)/.exec(s)).filter(Boolean), max = Math.max(...st.map((m) => +m[3]));
      tx(360, 124, 'usec_per_call (평균 µs)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.5) });
      st.forEach((m, i) => { const y = 170 + i * 66, a = 0.6 + i * 0.35, v = +m[3], slow = v >= 1000, bw = Math.max(4, 440 * v / max) * E(u, a, a + 0.6);
        mono(60, y, m[1], { 'font-size': 17, 'font-weight': 800, fill: slow ? BAD : INK, opacity: fade(u, a) });
        mono(170, y, 'calls=' + m[2], { 'font-size': 14, fill: MUT, opacity: fade(u, a) });
        el('rect', { x: 360, y: y - 16, width: bw, height: 20, rx: 3, fill: slow ? BAD : ACC, opacity: 0.85 });
        mono(370 + bw, y, m[3] + 'µs', { 'font-size': 15, 'font-weight': 700, fill: slow ? BAD : INK, opacity: fade(u, a + 0.4), 'text-anchor': slow ? 'end' : 'start', ...(slow ? { x: 360 + bw - 10, fill: PANEL } : {}) }); });
      pill(880, 302, '범인', BAD, pop(u, 1.9), { fs: 14 });
      tx(480, 395, '누적 통계라 상시 수집해도 부담이 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    // k7 끊고 표준으로
    const cl = clients(c.steps[5]); pill(480, 28, 'redis-cli CLIENT KILL ID 51', BAD, pop(u, 0.2), { mono: true, fs: 14 });
    clientCards(cl, u, { kill: '51', shown: true });
    banner(600, 396, '평소 추적은 SLOWLOG + commandstats', pop(u, 2.0)); }

  // =====================================================================
  // 4. exporter → Prometheus → Grafana
  const NX = [110, 370, 630, 860], NY = 86;
  function pipeline(k, u) {
    const ap = (i) => (k === i ? pop(u, 0.2) : k > i ? 1 : 0);
    redisBox(NX[0], NY, { w: 140, h: 62, sub: ':6379', s: ap(0) });
    if (k >= 1) { grow(182, NY, 284, NY, k === 1 ? E(u, 0.1, 0.4) : 1, MUT); card(NX[1], NY, 170, 62, { rx: 10, text: 'redis_exporter\n:9121/metrics', fs: 14, mono: true, s: ap(1), stroke: INK }); }
    if (k >= 2) { grow(458, NY, 544, NY, k === 2 ? E(u, 0.1, 0.4) : 1, MUT); card(NX[2], NY, 170, 62, { rx: 10, text: 'Prometheus\n:9090', fs: 14.5, s: ap(2), stroke: INK }); }
    if (k >= 3) { grow(718, NY, 784, NY, k === 3 ? E(u, 0.1, 0.4) : 1, MUT); card(NX[3], NY, 150, 62, { rx: 10, text: 'Grafana\n:3000', fs: 14.5, s: ap(3), stroke: INK }); }
    if (k >= 1) sub(233, NY + 34, 'INFO', k === 1 ? fade(u, 0.4) : 1);
    if (k >= 2) sub(501, NY + 34, '긁기', k === 2 ? fade(u, 0.4) : 1);
    if (k >= 3) sub(751, NY + 34, '질의', k === 3 ? fade(u, 0.4) : 1); }
  function metricsPage(x, y, w, lines, u, o) { o = o || {}; el('rect', { x, y, width: w, height: 40 + lines.length * 34, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.1) });
    mono(x + 14, y + 24, 'GET :9121/metrics', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.1) });
    lines.forEach(([name, kind], i) => { const yy = y + 58 + i * 34, a = (o.at || 0.3) + i * 0.25;
      mono(x + 14, yy, name, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, a) });
      if (kind) pill(x + w - 50, yy - 5, kind, kind === 'counter' ? WARN : INFO, pop(u, a + 0.15), { fs: 13.5 }); }); }
  const counterPts = (x, y, w, h) => { const p = []; let v = 0; for (let i = 0; i <= 24; i++) { v += [3, 5, 2, 6, 4, 7, 3, 5][i % 8]; p.push([x + i / 24 * w, y + h - v / 112 * h]); } return p; };

  function s4(t, c) { const { k, u } = c; pipeline(k, u);
    if (k === 0) { snippet(40, 176, ['services:', '  redis:', '    image: redis:7', '    ports: ["6379:6379"]'], { fs: 15, op: fade(u, 0.5) });
      [['INFO', 600], ['SLOWLOG', 780]].forEach(([n, x], i) => { const a = 1.0 + i * 0.35;
        el('path', { d: `M${NX[0] + 40},${NY + 32} Q${x - 80},${NY + 90} ${x},${232}`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, a) });
        doc(x, 270, n, { s: pop(u, a + 0.1), stroke: ACC }); });
      tx(690, 370, '측정 대상이 먼저 — 숫자는 Redis 가 이미 들고 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { const pairs = [['connected_clients:234', 'redis_connected_clients 234'], ['blocked_clients:5', 'redis_blocked_clients 5'], ['connected_slaves:2', 'redis_connected_slaves 2']];
      tx(60, 186, 'INFO (Redis 형식)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4) });
      tx(540, 186, '/metrics (Prometheus 형식)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4) });
      pairs.forEach(([a, b], i) => { const y = 230 + i * 50, at = 0.6 + i * 0.4;
        mono(60, y, a, { 'font-size': 15, opacity: fade(u, at) });
        fly(300, y - 5, 520, y - 5, seg(u, at + 0.1, at + 0.6), '변환', { fill: INK });
        mono(540, y, b, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, at + 0.55) }); });
      mono(60, 396, 'REDIS_ADDR: "redis://redis:6379"', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { doc(200, 280, 'prometheus.yml', { s: pop(u, 0.5) });
      zone(400, 186, 520, 214, 'prometheus 컨테이너 :9090', { stroke: GRID, op: fade(u, 0.6) });
      grow(232, 270, 396, 240, E(u, 0.8, 1.2), ACC); sub(316, 236, '마운트', fade(u, 1.1), { 'font-weight': 700, fill: ACC });
      mono(420, 240, '/etc/prometheus/prometheus.yml', { 'font-size': 14.5, opacity: fade(u, 1.2) });
      tx(420, 280, '시계열 저장소', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) });
      [0, 1, 2].forEach((j) => { const p = []; for (let i = 0; i <= 20; i++) p.push([560 + i * 17, 340 - j * 18 + Math.sin(i * 0.9 + j * 2) * 8]); spark(p, E(u, 1.5 + j * 0.2, 2.6), j === 0 ? ACC : j === 1 ? INFO : WARN, 2.2); }); return; }
    if (k === 3) { pill(160, 290, 'Prometheus', INK, pop(u, 0.4), { fs: 15 }); sub(160, 326, '데이터 소스', fade(u, 0.5));
      grow(230, 290, 386, 290, E(u, 0.7, 1.1), ACC);
      R.browser(640, 290, 480, 200, null, { s: pop(u, 0.5) }); mono(420, 226, 'localhost:3000', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) });
      [0, 1, 2].forEach((j) => { const x = 420 + j * 152, a = 1.1 + j * 0.3; el('rect', { x, y: 248, width: 140, height: 118, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.2, opacity: fade(u, a) });
        const p = []; for (let i = 0; i <= 12; i++) p.push([x + 10 + i * 10, 340 - (Math.sin(i * 0.8 + j) * 0.5 + 0.5) * 50 - j * 6]); spark(p, E(u, a, a + 0.6), [ACC, INFO, WARN][j], 2.2); }); return; }
    if (k === 4) { // scrape 30s
      snippet(36, 166, ['global:', '  scrape_interval: 30s', 'scrape_configs:', '  - job_name: "redis"', '    static_configs:', '      - targets: ["redis_exporter:9121"]'], { fs: 14, op: fade(u, 0.1) });
      dot([[NX[2] - 86, NY + 10], [NX[1] + 86, NY + 10]], seg(u, 0.3, 0.8), MUT, 6); dot([[NX[1] + 86, NY - 10], [NX[2] - 86, NY - 10]], seg(u, 0.9, 1.4), ACC, 6);
      const x0 = 520, x1 = 910, y = 300; el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 3, opacity: fade(u, 0.6) });
      ['0s', '30s', '60s', '90s', '120s'].forEach((s, i) => { const x = lerp(x0, x1, i / 4), sc = pop(u, 0.8 + i * 0.3);
        el('circle', { cx: x, cy: y, r: 9 * sc, fill: ACC }); mono(x, y + 32, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: sc > 0.3 ? 1 : 0 }); });
      tx(x0, y - 30, '30초마다 한 번 긁어 간다 (pull)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.7) });
      pill(220, 372, 'job="redis" 라벨이 붙는다', ACC, pop(u, 2.2), { fs: 14 }); return; }
    if (k === 5) { metricsPage(40, 168, 470, [['redis_up 1', 'gauge'], ['redis_connected_clients', 'gauge'], ['redis_memory_used_bytes', 'gauge'], ['redis_memory_max_bytes', 'gauge']], u);
      const lo = pop(u, 1.4); el('circle', { cx: 620, cy: 230, r: 22 * lo, fill: GOOD }); tx(660, 226, '생사 판정', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.5) });
      mono(660, 250, 'redis_up == 1', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.5) });
      tx(600, 316, '용량 판정', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.9) });
      el('rect', { x: 600, y: 334, width: 300, height: 24, rx: 5, fill: SOFT, stroke: GRID, 'stroke-width': 1.2, opacity: fade(u, 1.9) });
      el('rect', { x: 600, y: 334, width: 300 * 0.75 * E(u, 2.0, 2.6), height: 24, rx: 5, fill: ACC, opacity: 0.8 });
      mono(600, 382, 'used / max · clients', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 6) { metricsPage(40, 168, 470, [['redis_keyspace_hits_total', 'counter'], ['redis_keyspace_misses_total', 'counter'], ['redis_commands_total', 'counter'], ['redis_evicted_keys_total', 'counter']], u);
      el('rect', { x: 560, y: 170, width: 360, height: 150, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.2) });
      spark(counterPts(580, 186, 320, 120), E(u, 1.3, 2.2), WARN, 2.5); tx(580, 200, '누적 — 늘기만 한다', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
      mono(560, 356, '(redis_memory_used_bytes /', { 'font-size': 14, opacity: fade(u, 2.1) }); mono(560, 378, ' redis_memory_max_bytes) * 100', { 'font-size': 14, opacity: fade(u, 2.1) });
      tx(560, 404, '= 메모리 사용률 패널', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.3) }); return; }
    if (k === 7) { // rate()
      el('rect', { x: 40, y: 170, width: 340, height: 150, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.1) });
      spark(counterPts(56, 186, 308, 120), E(u, 0.2, 0.9), WARN, 2.5); mono(56, 344, 'redis_keyspace_hits_total', { 'font-size': 14, fill: WARN, opacity: fade(u, 0.3) });
      pill(470, 245, 'rate( … [5m] )', ACC, pop(u, 1.0), { mono: true, fs: 14.5 }); grow(388, 245, 404, 245, E(u, 1.0, 1.2), ACC); grow(536, 245, 572, 245, E(u, 1.2, 1.4), ACC);
      el('rect', { x: 580, y: 170, width: 340, height: 150, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.3) });
      const p = []; for (let i = 0; i <= 24; i++) p.push([596 + i * 12.8, 250 - [3, 5, 2, 6, 4, 7, 3, 5][i % 8] * 4 + 18]); spark(p, E(u, 1.4, 2.1), ACC, 2.5);
      tx(596, 200, '초당 값', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      mono(40, 376, 'hits / (hits + misses)          → 히트율', { 'font-size': 14.5, opacity: fade(u, 2.0) });
      mono(40, 402, 'rate(redis_commands_total[1m])  → OPS', { 'font-size': 14.5, opacity: fade(u, 2.3) }); return; }
    // k8 대시보드 11835
    fly(160, 230, 300, 290, seg(u, 0.1, 0.6), 'Import 11835', { mono: true });
    R.browser(560, 290, 700, 214, null, { s: pop(u, 0.4) }); mono(280, 201, 'Redis Dashboard · 11835', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) });
    ['메모리', 'OPS', '히트율', '연결수'].forEach((n, j) => { const x = 226 + j * 170, a = 0.8 + j * 0.3; el('rect', { x, y: 226, width: 160, height: 160, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.2, opacity: fade(u, a) });
      tx(x + 12, 250, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) });
      const p = []; for (let i = 0; i <= 14; i++) p.push([x + 12 + i * 9.7, 360 - (Math.sin(i * 0.7 + j * 1.3) * 0.5 + 0.5) * 70 - j * 4]); spark(p, E(u, a + 0.1, a + 0.7), [WARN, ACC, GOOD, INFO][j], 2.4); });
    sub(100, 330, '한 화면에', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }

  // =====================================================================
  // 5. 대시보드 + 알람 규칙
  function panels(c) { const b = c.beat.viz.panels, p = c.prev ? c.prev.viz.panels : null;
    b.forEach((q, i) => { const x = 20 + (i % 3) * 152, y = 16 + Math.floor(i / 3) * 92, col = q.status === 'warn' ? WARN : q.status === 'danger' ? BAD : GOOD;
      const s = c.k === 0 ? pop(c.u, 0.1 + i * 0.12) : 1, g = G(x + 70, y + 41, s);
      el('rect', { x: -70, y: -41, width: 140, height: 82, rx: 8, fill: PANEL, stroke: col, 'stroke-width': 2.2 }, g);
      tx(-60, -17, q.name, { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }, g);
      mono(-60, 20, numLike(p && p[i].value, q.value, c.u), { 'font-size': 21, 'font-weight': 800, fill: q.status === 'good' ? INK : col }, g);
      tx(56, 20, q.trend === 'up' ? '↑' : q.trend === 'down' ? '↓' : '→', { 'font-size': 18, 'font-weight': 700, fill: col, 'text-anchor': 'end' }, g); }); }
  function rules(c) { const al = c.beat.viz.alerts, pn = c.prev ? c.prev.viz.alerts.map((a) => a.name) : [];
    zone(484, 14, 456, 188, 'redis_critical · interval 1m', { stroke: GRID });
    if (!al.length) sub(712, 116, '규칙 0개 — 아무도 깨우지 않는다', fade(c.u, 0.4), { 'font-size': 14.5, 'font-weight': 700 });
    al.forEach((a, i) => { const y = 60 + i * 28, isNew = pn.indexOf(a.name) < 0, s = isNew ? pop(c.u, 0.3) : 1, fire = /발화/.test(a.name);
      if (isNew || fire) el('rect', { x: 492, y: y - 13, width: 440, height: 26, rx: 5, fill: fire ? C.WARNBG : ACCBG, opacity: Math.min(1, s) });
      pill(540, y, a.severity, a.severity === 'critical' ? BAD : WARN, s, { fs: 13 });
      mono(594, y + 5, a.name, { 'font-size': 14, 'font-weight': isNew ? 700 : 500, opacity: Math.min(1, s) }); }); }
  function gauge(y, cur, thr, label, o) { o = o || {}; const x0 = 100, W = 760, X = (v) => x0 + W * v / 100;
    el('rect', { x: x0, y, width: W, height: 34, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    el('rect', { x: x0, y, width: Math.max(0, X(cur) - x0), height: 34, rx: 6, fill: o.col || ACC, opacity: 0.85 });
    mono(x0 + 12, y + 23, cur.toFixed(o.dec ?? 0) + '%', { 'font-size': 16, 'font-weight': 800, fill: PANEL });
    el('line', { x1: X(thr), y1: y - 14, x2: X(thr), y2: y + 48, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
    mono(X(thr), y + 68, label, { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' }); }

  function s5(t, c) { const { k, u, beat } = c; panels(c); rules(c);
    if (k === 0) { const x0 = 80, x1 = 880, y = 320; el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 3 });
      for (let i = 0; i <= 5; i++) { const x = lerp(x0, x1, i / 5), on = u > 0.4 + i * 0.35; el('circle', { cx: x, cy: y, r: on ? 9 : 6, fill: on ? ACC : OFF }); mono(x, y + 32, i + 'm', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
      tx(x0, y - 40, '1분마다 평가 — 하지만 볼 규칙이 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      tx(x1, 396, '사람이 계속 화면을 봐야 한다', { 'text-anchor': 'end', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { const x0 = 120, x1 = 880, hi = 262, lo = 330, X = (f) => lerp(x0, x1, f), rv = E(u, 0.2, 2.0);
      mono(104, hi + 5, '1', { 'font-size': 14, 'text-anchor': 'end', fill: MUT }); mono(104, lo + 5, '0', { 'font-size': 14, 'text-anchor': 'end', fill: MUT });
      tx(x0, 236, 'redis_up', { 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
      const pts = [[0, hi], [0.22, hi], [0.22, lo], [0.28, lo], [0.28, hi], [0.5, hi], [0.5, lo], [1, lo]].map(([f, y]) => [X(f), y]);
      const cut = X(rv), shown = []; for (let i = 0; i < pts.length; i++) { if (pts[i][0] <= cut) shown.push(pts[i]); else { shown.push([cut, pts[i - 1][1]]); break; } }
      el('polyline', { points: shown.map((p) => p.join(',')).join(' '), fill: 'none', stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' });
      const ao = fade(u, 0.9); sub(X(0.25), 362, '잠깐 끊김 → 무시', ao, { fill: GOOD, 'font-weight': 700 });
      const bo = fade(u, 1.6); el('path', { d: `M${X(0.5)},${lo + 18} V${lo + 26} H${X(0.66)} V${lo + 18}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: bo });
      mono(X(0.58), lo + 46, 'for: 30s', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: bo });
      pill(X(0.84), 300, 'RedisDown → critical', BAD, pop(u, 2.1), { fs: 14 }); return; }
    if (k === 2) { mono(100, 250, 'redis_memory_used_bytes / redis_memory_max_bytes', { 'font-size': 14.5, opacity: fade(u, 0.3) });
      gauge(290, tween(0, num(beat.viz.panels[0].value), u), 90, '> 0.9 for 5m', { col: WARN });
      pill(480, 400, '지금 ' + beat.viz.panels[0].value + ' — 미발화', GOOD, pop(u, 1.8), { fs: 14 }); return; }
    if (k === 3 || k === 4) { const hr = num(beat.viz.panels[1].value), ph = c.prev ? num(c.prev.viz.panels[1].value) : hr, v = k === 3 ? tween(0, hr, u) : tween(ph, hr, u);
      mono(100, 250, 'rate(hits[5m]) / (rate(hits[5m]) + rate(misses[5m]))', { 'font-size': 14.5, opacity: k === 3 ? fade(u, 0.3) : 1 });
      gauge(276, v, 80, '< 0.8', { col: v < 80 ? WARN : GOOD, dec: 1 });
      if (k === 3) { pill(480, 396, '지금 ' + beat.viz.panels[1].value + ' — 정상', GOOD, pop(u, 1.8), { fs: 14 }); return; }
      const x0 = 300, W = 360, y = 382, f = E(u, 1.2, 2.2);
      tx(x0 - 14, y + 6, 'pending', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.1) });
      el('rect', { x: x0, y: y - 10, width: W, height: 20, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.2, opacity: fade(u, 1.1) });
      el('rect', { x: x0, y: y - 10, width: W * f, height: 20, rx: 10, fill: WARN, opacity: 0.85 });
      mono(x0 + W / 2, y + 5, 'for: 10m', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: f > 0.6 ? PANEL : INK, opacity: fade(u, 1.1) });
      pill(800, y, 'FIRING · warning', WARN, pop(u, 2.3), { fs: 14 }); return; }
    if (k === 5) { const y0 = 260, x0 = 180, W = 620;
      mono(166, y0 + 5, 'master_repl_offset', { 'font-size': 14, 'text-anchor': 'end', opacity: fade(u, 0.3) });
      mono(166, y0 + 55, 'slave_repl_offset', { 'font-size': 14, 'text-anchor': 'end', opacity: fade(u, 0.5) });
      el('rect', { x: x0, y: y0 - 12, width: W * E(u, 0.3, 1.0), height: 24, rx: 4, fill: ACC, opacity: 0.85 });
      el('rect', { x: x0, y: y0 + 38, width: W * 0.68 * E(u, 0.5, 1.2), height: 24, rx: 4, fill: INFO, opacity: 0.75 });
      const bo = fade(u, 1.4); el('path', { d: `M${x0 + W * 0.68},${y0 + 72} V${y0 + 80} H${x0 + W} V${y0 + 72}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: bo });
      mono(x0 + W * 0.84, y0 + 102, '차이 > 1000000 (1MB)', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: bo });
      pill(320, y0 + 102, 'OR  connected_slaves == 0', BAD, pop(u, 1.9), { mono: true, fs: 13.5 }); return; }
    if (k === 6) { const x0 = 120, W = 720, y = 300, thr = x0 + W * 0.6;
      mono(x0, 250, 'rate(redis_evicted_keys_total[5m])', { 'font-size': 14.5, opacity: fade(u, 0.3) });
      el('rect', { x: x0, y, width: W, height: 34, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.4) });
      el('line', { x1: thr, y1: y - 14, x2: thr, y2: y + 48, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: fade(u, 0.8) });
      mono(thr, y + 68, '> 100/s for 5m', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      el('circle', { cx: x0 + 6, cy: y + 17, r: 10 * pop(u, 1.2), fill: GOOD });
      mono(x0 + 24, y + 23, '지금 ' + beat.viz.panels[5].value + '/s', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
      tx(940, 396, '90% 알람보다 먼저 움직인다', { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 7) { ['redis-1', 'redis-2', 'redis-3'].forEach((n, i) => { const y = 250 + i * 56, a = 0.2 + i * 0.2;
        card(90, y, 120, 40, { rx: 8, text: n, fs: 14.5, mono: true, s: pop(u, a) });
        fly(150, y, 420, 306, seg(u, a + 0.4, a + 1.1), 'RedisMemoryHigh', { fill: BAD, mono: true }); });
      card(500, 306, 190, 70, { rx: 10, stroke: ACC, sw: 2.5, s: pop(u, 0.5), text: 'group_by:\n[alertname]', fs: 14.5, mono: true });
      grow(598, 306, 690, 306, E(u, 1.8, 2.1), ACC);
      card(810, 306, 220, 70, { rx: 10, stroke: INK, sw: 2, s: pop(u, 2.0), text: 'slack-redis\n메시지 1통', fs: 15 }); return; }
    // k8 Slack 수신자
    el('rect', { x: 330, y: 226, width: 590, height: 172, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.2) });
    mono(350, 254, '#alerts-redis', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
    el('rect', { x: 350, y: 270, width: 5, height: 108, fill: WARN, opacity: fade(u, 0.6) });
    mono(370, 300, 'RedisLowHitRate', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.8) });
    mono(370, 336, 'Hit rate < 80% for 10m', { 'font-size': 15.5, opacity: fade(u, 1.3) });
    mono(370, 366, 'api_url: $SLACK_WEBHOOK', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.7) });
    tx(40, 300, '제목 ← alertname', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
    tx(40, 336, '본문 ← summary', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
    grow(196, 295, 360, 295, E(u, 0.9, 1.2), ACC); grow(184, 331, 360, 331, E(u, 1.4, 1.7), ACC); }

  R.page({ title: 'Redis 모니터링 콘솔', scenes: [s1, s2, s3, s4, s5] });
})();
