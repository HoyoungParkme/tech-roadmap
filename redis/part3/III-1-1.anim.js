/* III-1-1 TTL — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, dot, cross, check, terminal, redisBox, person, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  function term(x, y, w, h, beats, k, u, o) { o = o || {};
    const old = o.keep === false ? [] : [].concat(...beats.slice(0, k)), cur = beats[k] || [];
    const p = seg(u, 0.2, Math.min(2.4, 0.2 + 0.38 * cur.length));
    terminal(x, y, w, h, old.concat(cur), old.length + p * cur.length, o); }
  // TTL 고리: frac 만큼 남은 시간
  function ring(cx, cy, r, frac, col, w) { w = w || 6; const f = clamp(frac);
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': w });
    if (f <= 0.001) return;
    if (f >= 0.999) { el('circle', { cx, cy, r, fill: 'none', stroke: col || WARN, 'stroke-width': w }); return; }
    const a = -Math.PI / 2 + f * 2 * Math.PI;
    el('path', { d: `M${cx},${cy - r} A${r},${r} 0 ${f > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`, fill: 'none', stroke: col || WARN, 'stroke-width': w, 'stroke-linecap': 'round' }); }
  const note = (x, s, op, col) => tx(x, 404, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: op ?? 1 });

  // ───────── 1. EXPIRE ─────────
  // 키 한 줄: 이름 · 값 · TTL (ttl<0 이면 영구)
  function keyRow(cy, key, val, ttl, o) { o = o || {}; const op = o.op ?? 1;
    card(685, cy, 490, 62, { rx: 10, stroke: o.stroke || GRID, sw: o.stroke ? 2.5 : 1.5, fill: o.fill || PANEL, op, s: o.s });
    mono(456, cy - 4, key, { 'font-size': 16, 'font-weight': 800, opacity: op, fill: o.keyCol || INK });
    tx(456, cy + 18, val, { 'font-size': 13.5, fill: MUT, opacity: op });
    if (ttl > 0) { ring(892, cy, 17, o.frac ?? 1, o.ringCol || WARN, 5); mono(862, cy + 5, Math.round(ttl) + 's', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: o.ringCol || WARN, opacity: op }); }
    else mono(905, cy + 5, ttl === -2 ? '-2 · 없음' : '-1 · 영구', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: ttl === -2 ? BAD : MUT, opacity: op }); }
  const VAL = { 'session:abc': 'String · "user-data"', 'cache:post:42': 'String · 글 42 캐시', 'config:app': 'String · 앱 설정', 'user:1': 'Hash · name = "Alice"' };
  const RY = [118, 198, 278];
  const T1 = [
    ['> SET session:abc user-data', 'OK', ['# ← 여기서 끊기면 TTL 없음', HL], '> EXPIRE session:abc 1800', '(integer) 1'],
    ['> SETEX session:abc 1800 user-data', 'OK'],
    ['> SET session:abc data EX 1800', '> SET session:abc data PX 1800000', '> SET session:abc data', '    EXAT 1700000000'],
    ['> HSET user:1 name Alice', '(integer) 1', '> EXPIRE user:1 3600', '(integer) 1'],
    ['> HEXPIRE user:1 60 FIELDS 1 name', '1) (integer) 1', ['# Redis 7.4+', OFF]],
    ['> TTL session:abc', '(integer) 1800', '> TTL config:app', '(integer) -1', '> TTL session:zzz', '(integer) -2'],
  ];
  function rows1(c, o) { o = o || {}; const b = c.beat.viz.rows, p = c.prev ? c.prev.viz.rows : null, u = c.u;
    b.forEach((r, i) => { if (o.skip === i) return; const pr = p && p[i] && p[i].key === r.key ? p[i] : null, st = (o.style && o.style(r, i)) || {};
      const ttl = pr && pr.ttl > 0 && r.ttl > 0 ? tween(pr.ttl, r.ttl, u) : r.ttl;
      keyRow(RY[i], r.key, VAL[r.key] || '', ttl, Object.assign({ op: pr || !p ? 1 : fade(u, 0.3) }, st)); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 6) return ttlGuide(c);
    term(20, 26, 400, 368, T1, k, u, { title: 'redis-cli' });
    mono(440, 66, 'Redis 키 공간', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (k === 0) { const on = u > 1.6;
      rows1(c, { skip: 0 });
      const r0 = c.beat.viz.rows[0]; keyRow(RY[0], r0.key, VAL[r0.key], on ? r0.ttl : -1, { s: pop(u, 0.3), stroke: on ? WARN : BAD, frac: E(u, 1.6, 2.2) });
      if (u > 0.9 && u < 1.6) pill(685, 160, '이 사이에 장애가 나면?', BAD, pop(u, 0.9), { fs: 14 });
      note(685, '두 명령 → 사이에 끊기면 영구 키가 남는다', fade(u, 2.1), BAD); return; }
    if (k === 1) { rows1(c, { style: (r, i) => i === 0 ? { stroke: GOOD, frac: E(u, 0.6, 1.2) } : {} });
      if (u > 0.5) check(470 - 30, RY[0], 10, pop(u, 0.5));
      note(685, 'SETEX = 값과 만료를 한 번에 (원자적)', fade(u, 1.4), GOOD); return; }
    if (k === 2) { rows1(c);
      const ax0 = 470, ax1 = 910, y = 340; el('line', { x1: ax0, y1: y, x2: ax1, y2: y, stroke: INK, 'stroke-width': 2 });
      el('circle', { cx: ax0, cy: y, r: 5, fill: INK }); tx(ax0, y + 24, 'now', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, class: 'mono' });
      const xr = 690; el('line', { x1: xr, y1: y - 8, x2: xr, y2: y + 8, stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.5) });
      tx(xr, y - 16, 'EX 1800 = PX 1800000', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, class: 'mono', opacity: fade(u, 0.6) });
      tx(xr, y + 24, '지금부터 상대 시간', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) });
      el('line', { x1: ax1 - 20, y1: y - 8, x2: ax1 - 20, y2: y + 8, stroke: INFO, 'stroke-width': 3, opacity: fade(u, 1.4) });
      tx(ax1 - 20, y + 24, 'EXAT = 절대 시각', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) });
      note(685, '"자정에 만료" 처럼 시점이 정해졌으면 EXAT', fade(u, 2.0)); return; }
    if (k === 3) { rows1(c, { style: (r) => r.key === 'user:1' ? { stroke: ACC, s: pop(u, 0.3), frac: E(u, 1.2, 1.8) } : {} });
      if (u > 1.0) el('rect', { x: 434, y: RY[1] - 37, width: 502, height: 74, rx: 13, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.0) });
      note(685, 'TTL 은 타입과 무관하게 키 통째로 걸린다', fade(u, 1.9)); return; }
    if (k === 4) { rows1(c);
      // user:1 의 필드 하나에만 시계
      const y = 338; card(640, y, 300, 46, { rx: 8, stroke: ACC, sw: 2, s: pop(u, 0.4) });
      mono(510, y + 5, 'user:1', { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 0.5) });
      mono(580, y + 5, 'name', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
      mono(630, y + 5, '"Alice"', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) });
      if (u > 0.9) { ring(738, y, 14, 1 - E(u, 1.0, 2.4) * 0.2, ACC, 4); mono(758, y + 5, '60s', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) }); }
      const v4 = E(u, 0.2, 0.7); if (v4 > 0) el('path', { d: `M930,${RY[1]} L948,${RY[1]} L948,${y} L792,${y}`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': `${v4 * 330} 400` });
      note(685, '7.4+: 필드 하나만 만료 · 키는 남는다', fade(u, 1.8), ACC); return; }
    // k5: TTL 반환값
    rows1(c, { style: (r) => ({ stroke: r.ttl > 0 ? WARN : MUT }) });
    keyRow(RY[2] + 70, 'session:zzz', '없는 키', -2, { op: fade(u, 1.6), stroke: BAD, fill: BADBG });
    note(685, '양수 = 남은 초 · -1 = 영구 · -2 = 키 없음', fade(u, 2.1)); }
  // 용도별 TTL (로그 눈금)
  function ttlGuide(c) { const { u } = c, X0 = 220, X1 = 900, LMAX = Math.log10(172800);
    const X = (s) => X0 + (X1 - X0) * Math.log10(s) / LMAX;
    tx(480, 44, '용도가 TTL 길이를 정한다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
    [[1, '1초'], [60, '1분'], [3600, '1시간'], [86400, '1일']].forEach(([s, l]) => { el('line', { x1: X(s), y1: 70, x2: X(s), y2: 300, stroke: GRID, 'stroke-width': 1.5 }); tx(X(s), 320, l, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); });
    const G = [['분산 락', 5, 30, BAD], ['비밀번호 토큰', 300, 300, WARN], ['API 응답 캐시', 60, 3600, ACC], ['세션', 1800, 86400, INFO], ['일별 통계 키', 86400, 172800, MUT]];
    G.forEach(([n, a, b, col], i) => { const y = 92 + i * 44, v = E(u, 0.2 + i * 0.25, 0.8 + i * 0.25), x0 = X(a), x1 = Math.max(X(b), x0 + 8);
      tx(200, y + 5, n, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.25) });
      el('rect', { x: x0, y: y - 9, width: Math.max(8, (x1 - x0) * v), height: 18, rx: 9, fill: col, opacity: 0.85 }); });
    // 이 장의 키 세 개
    c.beat.viz.rows.forEach((r, i) => { const a = 1.7 + i * 0.25, x = r.ttl > 0 ? X(r.ttl) : X1 + 10;
      el('path', { d: `M${x},336 L${x - 7},348 L${x + 7},348 Z`, fill: INK, opacity: fade(u, a) });
      mono(x, 368 + (i % 2) * 22, r.key + (r.ttl > 0 ? ' ' + r.ttl + 's' : ' -1'), { 'font-size': 14, 'font-weight': 700, 'text-anchor': r.ttl > 0 ? 'middle' : 'end', opacity: fade(u, a) }); }); }

  // ───────── 2. TTL 카운트다운 ─────────
  const CK = { x: 210, y: 200, r: 110 };
  function bigClock(ttl, start, col, key) { ring(CK.x, CK.y, CK.r, ttl / start, col || WARN, 18);
    mono(CK.x, CK.y + 4, String(Math.round(ttl)), { 'font-size': 40, 'font-weight': 800, 'text-anchor': 'middle', fill: col || WARN });
    tx(CK.x, CK.y + 34, '초 남음', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
    mono(CK.x, 58, key, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' }); }
  function s2(t, c) { const { k, u } = c, b = c.beat.viz, p = c.prev ? c.prev.viz : null;
    if (k <= 3) { const st = b.startTtl;
      if (k === 0) { bigClock(st * E(u, 0.3, 1.4), st, WARN, b.key); pill(600, 120, 'SETEX session:abc 1800 data', ACC, pop(u, 0.2), { mono: true, fs: 14 });
        tx(600, 200, 'TTL 은 설정한 순간부터 줄어든다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
        tx(600, 228, '읽기만 해서는 늘어나지 않는다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
      const ttl = k === 3 ? tween(p.currentTtl, b.currentTtl, u - 0.9) : tween(p.currentTtl, b.currentTtl, u);
      bigClock(ttl, st, k === 3 && u > 1.0 ? ACC : WARN, b.key);
      if (k === 1) { pill(600, 80, 'TTL session:abc → ' + b.currentTtl, ACC, pop(u, 0.2), { mono: true, fs: 14 });
        tx(600, 122, (p.currentTtl - b.currentTtl) + '초가 지났다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
        const seq = ['1800', '1799', '…', '1', '0', '-2'];
        seq.forEach((s, i) => { const x = 420 + i * 88, a = 1.2 + i * 0.18, last = i === 5;
          card(x, 230, 70, 40, { rx: 8, stroke: last ? BAD : GRID, sw: last ? 2.5 : 1.5, fill: last ? BADBG : PANEL, text: s, mono: true, fs: 15, color: last ? BAD : INK, s: pop(u, a) });
          if (i) grow(x - 52, 230, x - 37, 230, E(u, a, a + 0.15), MUT, { plain: true }); });
        tx(860, 284, '0 에 닿으면 키 삭제', { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); return; }
      if (k === 2) { const R0 = [['-2', '키 없음', MUT], ['-1', '영구 보관 (의도? 누락?)', BAD], ['양수', '남은 ' + b.currentTtl + '초', GOOD]];
        tx(600, 70, 'diagnose(key)', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono' });
        R0.forEach(([v, d, col], i) => { const y = 130 + i * 76, hit = i === 2 && u > 1.6;
          card(640, y, 420, 56, { rx: 10, stroke: hit ? GOOD : i === 1 ? BAD : GRID, sw: hit || i === 1 ? 2.5 : 1.5, fill: hit ? GOODBG : PANEL, s: pop(u, 0.3 + i * 0.25) });
          mono(470, y + 6, v, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.25) });
          tx(550, y + 6, d, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.25) }); });
        dot([[CK.x + CK.r + 12, CK.y], [400, CK.y], [400, 282], [428, 282]], seg(u, 1.0, 1.6), GOOD, 8);
        note(640, '-1 을 그냥 넘기면 메모리 누수로 자란다', fade(u, 2.0), BAD); return; }
      // k3: 활동하면 EXPIRE 로 다시 1800
      person(560, 210, '활동 중인 사용자', {});
      const v = seg(u, 0.3, 1.0); if (v > 0 && v < 1) card(lerp(520, CK.x + CK.r, E(v, 0, 1)), lerp(150, 150, v), 210, 30, { rx: 15, fill: ACC, stroke: 'none', text: 'EXPIRE session:abc 1800', fs: 13.5, color: PANEL, mono: true });
      [0, 1, 2].forEach((i) => { const a = 0.2 + i * 0.25; if (u > a) pill(760, 150 + i * 44, '요청 ' + (i + 1), ACC, pop(u, a), { fs: 13.5 }); });
      tx(760, 300, 'sliding window 세션', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      note(480, '요청마다 EXPIRE 한 줄 → 활동하는 동안은 로그인 유지', fade(u, 2.0)); return; }
    // k4, k5: cache:* 감사 — SCAN 으로 나눠 훑기
    mono(240, 58, 'cache:*', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
    const cols = 8, rowsN = 4, cw = 50, ch = 36, gx = 40, gy = 80, cls = (i) => [2, 1, 0, 1, 2, 2, 0, 1, 1, 2, 2, 0, 1, 2, 1, 2, 0, 2, 1, 2, 2, 1, 0, 2, 1, 2, 2, 0, 1, 2, 1, 2][i];
    const BK = [['no_ttl', '영구 (-1)', BAD, 640], ['short', '60초 미만', WARN, 760], ['long_ttl', '장기', GOOD, 880]];
    BK.forEach(([n, d, col, x], i) => { const s = k === 4 ? pop(u, 0.3 + i * 0.25) : 1;
      card(x, 300, 104, 120, { rx: 10, stroke: col, sw: 2.5, s });
      mono(x, 230, n, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 0.4 + i * 0.25) : 1 });
      tx(x, 390, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 0.4 + i * 0.25) : 1 });
      if (k === 4) mono(x, 306, '0', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.8 + i * 0.25) }); });
    const done = k === 5 ? Math.floor(clamp((u - 0.3) / 1.9) * 32) : 0, batch = k === 5 ? Math.min(3, Math.floor(clamp((u - 0.3) / 1.9) * 4)) : -1;
    for (let i = 0; i < cols * rowsN; i++) { const r = Math.floor(i / cols), cc = i % cols, x = gx + cc * (cw + 6), y = gy + r * (ch + 8), gone = i < done;
      el('rect', { x, y, width: cw, height: ch, rx: 5, fill: gone ? SOFT : PANEL, stroke: Math.floor(i / 8) === batch && k === 5 ? INFO : GRID, 'stroke-width': Math.floor(i / 8) === batch && k === 5 ? 2.5 : 1.5 }); }
    // 떨어진 키는 바구니 안 점으로
    if (k === 5) { const cnt = [0, 0, 0]; for (let i = 0; i < done; i++) { const b = cls(i), n = cnt[b]++; el('circle', { cx: BK[b][3] - 36 + (n % 5) * 18, cy: 268 + Math.floor(n / 5) * 18, r: 6, fill: BK[b][2] }); }
      if (done < 32 && u > 0.3) dot([[gx + (done % 8) * 56 + 25, gy + Math.floor(done / 8) * 44 + 18], [BK[cls(done)][3], 250]], ((u - 0.3) / 1.9 * 32) % 1, BK[cls(done)][2], 6);
      pill(240, 286, 'SCAN … COUNT 100', INFO, 1, { mono: true, fs: 14 });
      card(255, 340, 300, 34, { rx: 8, stroke: BAD, sw: 1.8, text: 'KEYS cache:* → 서버가 멈춘다', fs: 14, color: BAD, op: fade(u, 0.4) }); cross(84, 340, 8, pop(u, 0.5));
      note(290, '영구 칸에 쌓이는 키가 많으면 TTL 누락 신호', fade(u, 2.2), BAD); return; }
    note(290, '분포를 세기 전에는 TTL 이 잘 붙었는지 모른다', fade(u, 1.6)); }

  // ───────── 3. PERSIST 와 SET 의 함정 ─────────
  const KN = ['temp', 'key', 'key', 'h', null, 'cache:*'];
  const VALS = [['value', 'value', 'value', 'value'], ['v1', 'v1', 'v2', 'v2'], ['v3', 'v3'], ['f = v', 'f = v', 'f = v · f2 = v2'], null, null];
  function stepsRow(steps, u, o) { o = o || {}; const n = steps.length, W = 900 / n, y = 250;
    steps.forEach((st, i) => { const x = 30 + i * W + W / 2, a = 0.3 + i * 0.5, s = pop(u, a), bad = o.bad === i;
      card(x, y, W - 34, 46, { rx: 10, stroke: bad ? BAD : st.persistent ? MUT : WARN, sw: bad ? 3 : 2, fill: bad ? BADBG : PANEL, text: st.state, fs: tw(st.state, 14) > W - 50 ? 13.5 : 14, mono: !/[가-힣]/.test(st.state), s });
      mono(x, y + 50, st.ttl > 0 ? 'TTL ' + st.ttl : 'TTL -1', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: st.ttl > 0 ? WARN : bad ? BAD : MUT, opacity: fade(u, a + 0.2) });
      if (i) grow(x - W + (W - 34) / 2 + 2, y, x - (W - 34) / 2 - 4, y, E(u, a - 0.2, a), MUT); }); }
  function s3(t, c) { const { k, u } = c, steps = c.beat.viz.steps, n = steps.length;
    const cur = Math.max(0, Math.min(n - 1, Math.floor((u - 0.3) / 0.5))), st = steps[cur];
    if (k <= 3) { const bad = k === 1 ? 2 : null, key = KN[k], val = VALS[k][cur];
      const col = st.ttl > 0 ? WARN : (k === 1 ? BAD : MUT);
      card(480, 112, 380, 92, { rx: 12, stroke: col, sw: 2.5, fill: k === 1 && st.ttl < 0 ? BADBG : PANEL });
      mono(310, 102, key, { 'font-size': 20, 'font-weight': 800 }); tx(310, 132, val, { 'font-size': 15, fill: MUT, class: 'mono' });
      if (st.ttl > 0) { ring(620, 112, 26, 1, WARN, 7); mono(580, 118, st.ttl + 's', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: WARN }); }
      else { mono(640, 118, '-1 영구', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: col }); }
      stepsRow(steps, u, { bad });
      const NOTE = ['PERSIST = 영구 전환을 코드에 드러낸다', 'SET 덮어쓰기가 TTL 까지 지웠다', 'KEEPTTL: 값만 바꾸고 TTL 은 그대로', 'HSET 은 키의 TTL 을 건드리지 않는다'];
      note(480, NOTE[k], fade(u, 0.3 + n * 0.5), k === 1 ? BAD : INK); return; }
    if (k === 4) { stepsRow(steps, u);
      card(300, 112, 300, 70, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 0.3) }); cross(180, 112, 10, pop(u, 0.4)); mono(205, 118, 'KEYS cache:*', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) });
      card(660, 112, 300, 70, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 0.6) }); check(540, 112, 10, pop(u, 0.7)); mono(565, 118, 'SCAN + TTL', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.7) });
      note(480, 'KEYS 는 한 번에 전부 훑느라 서버를 멈춘다', fade(u, 2.0)); return; }
    // k5: 사고와 복구
    stepsRow(steps, u, { bad: 0 });
    for (let i = 0; i < 8; i++) { const x = 150 + i * 92, fixed = u > 1.5 && i < Math.floor(lerp(0, 9, E(u, 1.5, 2.3)));
      card(x, 112, 80, 64, { rx: 8, stroke: fixed ? WARN : BAD, sw: 2, fill: fixed ? PANEL : BADBG });
      mono(x, 106, 'cache:', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      if (fixed) mono(x, 128, '60s', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN });
      else mono(x, 128, '-1', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD }); }
    if (u > 0.8 && u < 1.6) { const x = lerp(110, 850, E(u, 0.8, 1.5)); el('line', { x1: x, y1: 70, x2: x, y2: 154, stroke: INFO, 'stroke-width': 3 }); }
    note(480, '원인은 대개 SET 덮어쓰기 → SCAN 으로 찾아 EXPIRE', fade(u, 2.0)); }

  // ───────── 4. Lazy vs Active ─────────
  const GX = 300, GY = 70, GC = 10, GR = 5, GW = 56, GH = 44;
  const EXP = [2, 5, 9, 13, 17, 21, 26, 30, 34, 38, 43, 47];          // 만료된 키 자리
  const SAMPLE = [1, 5, 8, 12, 13, 19, 21, 23, 27, 30, 33, 36, 38, 40, 41, 44, 46, 3, 15, 48];   // 무작위 20개 (고정)
  const cellXY = (i) => [GX + (i % GC) * (GW + 8), GY + Math.floor(i / GC) * (GH + 8)];
  function keyspace(o) { o = o || {}; for (let i = 0; i < GC * GR; i++) { const [x, y] = cellXY(i), ex = EXP.includes(i), gone = o.gone && o.gone(i), sm = o.sample && o.sample(i), hot = o.hot && o.hot(i);
      el('rect', { x, y, width: GW, height: GH, rx: 6, fill: gone ? 'none' : ex ? WARNBG : PANEL, stroke: gone ? GRID : sm ? INFO : hot ? ACC : ex ? WARN : GRID, 'stroke-width': sm || hot ? 3 : 1.5, 'stroke-dasharray': gone ? '4 4' : null });
      if (ex && !gone) mono(x + GW / 2, y + GH / 2 + 5, '0s', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN }); } }
  function legend() { tx(GX, 50, 'Redis 키 공간 · 칸 = 키 · 0s = TTL 이 다 된 키', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); }
  function s4(t, c) { const { k, u } = c, a = c.beat.viz.active;
    legend();
    if (k === 0) { const tgt = 13, [tx0, ty0] = cellXY(tgt);
      keyspace({ gone: (i) => i === tgt && u > 1.4, hot: (i) => i === tgt && u < 1.4 });
      person(110, 150, '클라이언트', {});
      dot([[140, 140], [tx0 + GW / 2, ty0 + GH / 2]], seg(u, 0.2, 0.9), ACC, 7);
      pill(150, 92, 'GET', ACC, pop(u, 0.2), { mono: true });
      if (u > 0.9) tx(110, 282, 'TTL 확인 → 만료 → 삭제', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      if (u > 1.5) { pill(110, 230, 'nil', MUT, pop(u, 1.5), { mono: true }); }
      if (u > 1.9) EXP.filter((i) => i !== tgt).forEach((i) => { const [x, y] = cellXY(i); el('rect', { x: x - 3, y: y - 3, width: GW + 6, height: GH + 6, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.9) }); });
      note(560, '찾지 않은 만료 키는 그대로 남는다', fade(u, 2.1), BAD); return; }
    if (k === 1 || k === 4) { const hit = (i) => SAMPLE.includes(i) && u > 0.4;
      keyspace({ sample: (i) => hit(i) && u < 1.6, gone: (i) => EXP.includes(i) && SAMPLE.includes(i) && u > 1.6 });
      tx(130, 110, 'Active 주기', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
      card(130, 160, 200, 40, { rx: 20, stroke: INFO, sw: 2, text: a.cost, fs: 14.5, color: INFO, s: pop(u, 0.2) });
      // 한 바퀴: 20키 뽑기 → 만료 지움 → 25% 넘으면 다시
      const lines = [['무작위 20키 뽑기', 0.4], ['만료된 것 지우기', 1.4], ['25% 넘으면 반복', 2.0]];
      lines.forEach(([s, at], i) => tx(40, 240 + i * 32, (i + 1) + '. ' + s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, at) }));
      if (k === 4) { const prev = c.prev.viz.active.cost; mono(130, 360, '이전: ' + prev, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'text-decoration': 'line-through', opacity: fade(u, 0.3) });
        note(560, 'hz 10 → 100: 검사 10배, CPU 도 10배', fade(u, 2.1), WARN); return; }
      note(560, '샘플링이라 전수 검사가 아니다', fade(u, 2.2)); return; }
    if (k === 2) { const hotKeys = [13, 21], cold = EXP.filter((i) => !hotKeys.includes(i));
      keyspace({ hot: (i) => hotKeys.includes(i), gone: (i) => (hotKeys.includes(i) && u > 0.9) || (cold.indexOf(i) >= 0 && cold.indexOf(i) < Math.floor(lerp(0, cold.length, E(u, 1.2, 2.4)))) });
      person(110, 150, '자주 읽는 쪽', {});
      hotKeys.forEach((h) => { const [x, y] = cellXY(h); dot([[140, 140], [x + GW / 2, y + GH / 2]], seg(u, 0.2, 0.9), ACC, 6); });
      card(130, 260, 200, 40, { rx: 20, stroke: ACC, sw: 2, text: 'Lazy: 인기 키', fs: 15, color: ACC, s: pop(u, 0.6) });
      card(130, 316, 200, 40, { rx: 20, stroke: INFO, sw: 2, text: 'Active: 비인기 키', fs: 15, color: INFO, s: pop(u, 1.2) });
      note(560, '두 방식이 합쳐야 남김없이 회수된다', fade(u, 2.2)); return; }
    if (k === 3) { const tgt = 30, [x0, y0] = cellXY(tgt);
      keyspace({ gone: (i) => i === tgt && u > 2.0, sample: (i) => i === tgt && u > 1.6 && u < 2.0 });
      if (u < 2.0) el('rect', { x: x0 - 4, y: y0 - 4, width: GW + 8, height: GH + 8, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 2.5 });
      tx(130, 120, 'EXPIRE k 1', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.2) });
      tx(130, 152, 'TTL 은 0 인데', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 0.5) });
      tx(130, 176, '아직 메모리에 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.7) });
      const tk = E(u, 0.9, 2.0); el('line', { x1: 40, y1: 250, x2: 40 + 180 * tk, y2: 250, stroke: WARN, 'stroke-width': 6, 'stroke-linecap': 'round' });
      tx(130, 280, '1~2초 안에 Active 가 찾는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: WARN, opacity: fade(u, 1.2) });
      note(560, '만료 ≠ 즉시 삭제 · 정확한 시점은 notification', fade(u, 2.2)); return; }
    // k5: 지표
    keyspace({ gone: (i) => EXP.includes(i) && EXP.indexOf(i) < Math.floor(lerp(0, EXP.length, E(u, 0.3, 2.2))) });
    const n = Math.floor(lerp(0, EXP.length, E(u, 0.3, 2.2)));
    tx(130, 110, 'INFO stats', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, class: 'mono' });
    mono(40, 160, 'expired_keys', { 'font-size': 15, 'font-weight': 700, fill: ACC });
    for (let i = 0; i < n; i++) el('rect', { x: 40 + i * 16, y: 172, width: 12, height: 18, rx: 2, fill: ACC });
    mono(40, 240, 'used_memory', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const um = 1 - E(u, 1.8, 2.6) * 0.25; el('rect', { x: 40, y: 252, width: 200 * um, height: 18, rx: 3, fill: OFF });
    tx(40, 300, '바로 줄지 않는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
    note(560, '실제 회수량은 expired_keys 로 본다', fade(u, 2.2)); }

  // ───────── 5. Keyspace Notification ─────────
  const RX = 140, CHX0 = 260, CHX1 = 700, CHY = 200, SUBS = [[830, 140], [830, 270]];
  function stage5(c, o) { o = o || {}; const b = c.beat.viz, u = c.u;
    redisBox(RX, CHY, { w: 160, h: 90, sub: o.on ? '이벤트 발행 ON' : '이벤트 발행 OFF' });
    // 채널 파이프
    el('rect', { x: CHX0, y: CHY - 22, width: CHX1 - CHX0, height: 44, rx: 22, fill: SOFT, stroke: o.on ? INK : GRID, 'stroke-width': 2, 'stroke-dasharray': o.on ? null : '6 5' });
    mono((CHX0 + CHX1) / 2, CHY + 6, b.channel, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: o.on ? INK : MUT });
    b.subscribers.forEach((s, i) => { const [x, y] = SUBS[i], live = !s.startsWith('('), dead = o.dead === i;
      card(x, y, 190, 54, { rx: 10, stroke: dead ? BAD : live ? ACC : GRID, sw: live ? 2.5 : 1.5, dash: live ? null : '5 5', text: dead ? s + ' ✕' : s, fs: 15, color: dead ? BAD : live ? INK : MUT, mono: live, s: o.subIn ? pop(u, o.subIn + i * 0.3) : 1 });
      if (live && !dead) el('path', { d: `M${CHX1},${CHY} C${CHX1 + 40},${CHY} ${x - 135},${y} ${x - 95},${y}`, fill: 'none', stroke: ACC, 'stroke-width': 2.2 }); }); }
  function envelope(x, y, s, col) { card(x, y, tw(s, 14) + 26, 30, { rx: 6, fill: col || ACC, stroke: 'none', text: s, fs: 14, color: PANEL, mono: true }); }
  function s5(t, c) { const { k, u } = c, b = c.beat.viz;
    if (k === 0) { stage5(c, { on: u > 1.2 });
      pill(400, 90, 'CONFIG SET notify-keyspace-events Ex', ACC, pop(u, 0.3), { mono: true, fs: 14 });
      [['E', 'keyevent 채널'], ['x', 'expired 이벤트']].forEach(([f, d], i) => { const y = 320 + i * 36, a = 1.3 + i * 0.3;
        card(80, y, 34, 30, { rx: 6, fill: ACC, stroke: 'none', text: f, fs: 16, color: PANEL, mono: true, s: pop(u, a) }); tx(106, y + 5, d, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); });
      note(560, '기본값은 꺼짐 · 켜지 않으면 아무것도 안 온다', fade(u, 2.1)); return; }
    if (k === 1) { // keyspace vs keyevent
      redisBox(110, 210, { w: 150, h: 80, sub: 'session:abc 만료' });
      [[ 'K', '__keyspace@0__:session:abc', 'expired', 120, MUT ], ['E', '__keyevent@0__:expired', 'session:abc', 300, ACC]].forEach(([f, ch, msg, y, col], i) => { const a = 0.3 + i * 0.9;
        card(240, y, 34, 30, { rx: 6, fill: col, stroke: 'none', text: f, fs: 16, color: PANEL, mono: true, s: pop(u, a) });
        el('rect', { x: 275, y: y - 20, width: 470, height: 40, rx: 20, fill: SOFT, stroke: col, 'stroke-width': 2, opacity: fade(u, a) });
        mono(510, y + 5, ch, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col === MUT ? INK : col, opacity: fade(u, a) });
        tx(510, y - 32, i ? '채널 = 이벤트 · 메시지 = 키 이름' : '채널 = 키 · 메시지 = 이벤트 이름', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, a + 0.2) });
        const v = seg(u, a + 0.3, a + 0.9); if (v > 0) envelope(lerp(300, 840, E(v, 0, 1)), y, msg, col); });
      tx(840, 360, '이 예제는 E 만', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { stage5(c, { on: true, subIn: 0.3 });
      pill(830, 70, 'PSUBSCRIBE', ACC, pop(u, 0.2), { mono: true, fs: 14 });
      tx((CHX0 + CHX1) / 2, CHY + 50, '@0 = DB 번호', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) });
      note(560, 'DB 번호가 다르면 채널 이름도 다르다', fade(u, 2.0)); return; }
    if (k === 3) { stage5(c, { on: true });
      ring(RX, 120, 18, 1 - E(u, 0.2, 0.8), WARN, 6); mono(RX + 28, 126, u < 0.8 ? 'session:abc' : 'session:abc 만료', { 'font-size': 14, 'font-weight': 700, fill: u < 0.8 ? INK : BAD });
      const v = seg(u, 0.9, 1.7), w = seg(u, 1.7, 2.3);
      if (v > 0 && v < 1) envelope(lerp(CHX0 + 20, CHX1 - 20, E(v, 0, 1)), CHY - 44, b.message);
      if (w > 0) SUBS.forEach(([x, y]) => envelope(lerp(CHX1, x, E(w, 0, 1)), lerp(CHY, y + 46, E(w, 0, 1)), b.message));
      if (u > 1.2) { mono(RX, 330, '"user-data"', { 'font-size': 15, fill: OFF, 'text-anchor': 'middle', 'text-decoration': 'line-through', opacity: fade(u, 1.2) }); tx(RX, 356, '값은 오지 않는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) }); }
      note(560, 'msg["data"] = 만료된 키 이름', fade(u, 2.3)); return; }
    if (k === 4) { stage5(c, { on: true });
      const gx = 560, gy = 340; card(gx, gy, 300, 44, { rx: 8, stroke: INK, sw: 2, text: 'key.startswith("session:")', fs: 14.5, mono: true, s: pop(u, 0.3) });
      const v = seg(u, 0.5, 1.2); if (v > 0 && v < 1) envelope(lerp(CHX0 + 40, gx - 60, E(v, 0, 1)), lerp(CHY, gy - 40, E(v, 0, 1)), 'session:abc');
      if (u > 1.2) { check(gx + 170, gy, 10, pop(u, 1.2));
        [['DB 정리', 1.4], ['알림', 1.7]].forEach(([s, a], i) => pill(gx + 230, gy - 22 + i * 44, s, GOOD, pop(u, a), { fs: 14 })); }
      note(250, '모든 만료가 한 채널로 → 접두사 필터', fade(u, 2.1)); return; }
    if (k === 5) { stage5(c, { on: true });
      envelope(480, CHY - 46, b.message, WARN);
      const U = [['세션 만료 후처리'], ['임시 파일 정리'], ['락 만료 = 소유자 사망'], ['큐 timeout 알림']];
      U.forEach(([s], i) => { const x = 140 + i * 228; card(x, 352, 210, 46, { rx: 23, stroke: i === 2 ? WARN : GRID, sw: 2, text: s, fs: 14.5, color: i === 2 ? WARN : INK, s: pop(u, 0.4 + i * 0.3) }); });
      return; }
    // k6: 구독자가 죽으면 소실
    stage5(c, { on: true, dead: u > 0.3 ? 0 : null });
    const v = seg(u, 0.6, 1.6); if (v > 0 && v < 1) envelope(lerp(CHX0 + 20, CHX1 + 40, E(v, 0, 1)), CHY - 44, 'session:abc', BAD);
    if (u > 1.6) { const fall = E(u, 1.6, 2.3); card(CHX1 + 40, CHY - 44 + fall * 60, 130, 30, { rx: 6, fill: BADBG, stroke: BAD, dash: '4 4', text: '저장 안 됨', fs: 14, color: BAD, op: 1 - fall * 0.4 }); }
    note(560, 'Pub/Sub 은 보관하지 않는다 · 운영급은 Stream', fade(u, 2.2), BAD); }

  R.page({ title: 'TTL 과 만료 들여다보기', scenes: [s1, s2, s3, s4, s5] });
})();
