/* II-2-2 Set / Sorted Set — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, server, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  // 터미널: beats[k] 의 줄을 이 beat 동안 타이핑한다. keep 이면 앞 beat 줄도 남긴다
  function term(x, y, w, h, beats, k, u, o) { o = o || {};
    const old = o.keep === false ? [] : [].concat(...beats.slice(0, k)), cur = beats[k] || [];
    const p = seg(u, 0.2, Math.min(2.4, 0.2 + 0.38 * cur.length));
    terminal(x, y, w, h, old.concat(cur), old.length + p * cur.length, o); }
  // 멤버 알약 (mono)
  function chip(x, y, s, o) { o = o || {}; return pill(x, y, s, o.col || INK, o.s ?? 1, { mono: true, fs: o.fs || 15, fill: o.fill || PANEL, op: o.op, color: o.color }); }
  const chipW = (s, fs) => tw(s, fs || 15) + 26;
  // 알약이 a 에서 b 로 이동 (u0~u1). 도착하면 그 자리에 남는다
  function travel(s, a, b, u, u0, u1, o) { if (u < u0) return; const v = E(u, u0, u1);
    chip(lerp(a[0], b[0], v), lerp(a[1], b[1], v), s, Object.assign({ fill: v < 1 ? ACCBG : PANEL, col: v < 1 ? ACC : INK }, o)); }
  const note = (s, op) => tx(690, 402, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op ?? 1 });

  // ───────── 1. Set 기본 ─────────
  const BAG = { cx: 690, cy: 226, rx: 210, ry: 128 };
  const POS = { redis: [600, 178], cache: [775, 168], database: [620, 278], tutorial: [785, 272] };
  const T1 = [
    ['> SADD post:42:tags redis', '(integer) 1', '> SADD post:42:tags cache', '(integer) 1', '> SADD post:42:tags redis', ['(integer) 0   # 이미 있음', HL]],
    ['> SADD post:42:tags database tutorial', '(integer) 2'],
    ['> SMEMBERS post:42:tags', '1) "redis"', '2) "cache"', '3) "database"', '4) "tutorial"'],
    ['> SISMEMBER post:42:tags redis', '(integer) 1', '> SISMEMBER post:42:tags java', '(integer) 0', '> SCARD post:42:tags', '(integer) 4'],
    ['> SREM post:42:tags tutorial', '(integer) 1', '> SREM post:42:tags java', ['(integer) 0   # 오류 아님', HL]],
    ['> SRANDMEMBER post:42:tags', '"cache"', '> SRANDMEMBER post:42:tags 2', '1) "redis"', '2) "database"'],
  ];
  function s1(t, c) { const { k, u } = c, b = c.beat.viz, p = c.prev ? c.prev.viz : null;
    term(20, 26, 410, 368, T1, k, u, { title: 'redis-cli' });
    el('ellipse', { cx: BAG.cx, cy: BAG.cy, rx: BAG.rx, ry: BAG.ry, fill: SOFT, stroke: INK, 'stroke-width': 2.5 });
    chip(600, 62, 'post:42:tags', { fs: 15, col: INK, fill: PANEL });
    tx(680, 67, 'Set', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    // 멤버 수 (앞 beat 값에서)
    let n = b.members.length;
    if (k === 0) n = (u > 1.0 ? 1 : 0) + (u > 1.6 ? 1 : 0);
    else if (p) n = Math.round(tween(p.members.length, b.members.length, u - 0.6));
    mono(905, 67, '멤버 ' + n, { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
    const src = [436, 120];
    if (k === 0) {
      travel('redis', src, POS.redis, u, 0.3, 1.0); travel('cache', src, POS.cache, u, 0.9, 1.6);
      if (u > 1.6) { const v = E(u, 1.6, 2.1), x = lerp(src[0], 520, v), y = lerp(src[1], 96, v);
        chip(x, y, 'redis', { col: OFF, color: MUT, fill: PANEL });
        if (u > 2.1) { cross(x, y, 12, pop(u, 2.1, 0.4)); tx(x, y + 36, '중복 → 무시', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.15) }); } }
      note('같은 값을 여러 번 넣어도 멤버는 하나', fade(u, 2.2)); return; }
    // 기본 멤버 그리기 (beat 별로 덧그림)
    if (k === 1) { chip(POS.redis[0], POS.redis[1], 'redis'); chip(POS.cache[0], POS.cache[1], 'cache');
      travel('database', [436, 236], POS.database, u, 0.3, 1.3); travel('tutorial', [436, 300], POS.tutorial, u, 0.3, 1.3);
      grow(436, 330, 560, 330, E(u, 0.3, 1.2), ACC); tx(498, 352, '왕복 1번', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      note('SADD 한 번에 여러 멤버를 넣는다', fade(u, 1.5)); return; }
    if (k === 2) { const ms = b.members;
      ms.forEach((m, i) => { const on = u > 0.3 + i * 0.35; chip(POS[m][0], POS[m][1], m, { col: on ? INFO : INK, fill: on ? INFOBG : PANEL });
        dot([POS[m], [436, 110 + i * 22]], seg(u, 0.3 + i * 0.35, 0.9 + i * 0.35), INFO, 7); });
      pill(690, 352, 'O(N) · 멤버 수만큼 훑는다', WARN, pop(u, 1.8), { fs: 14 });
      note('돌려주는 순서는 보장되지 않는다', fade(u, 2.0)); return; }
    if (k === 3) { b.members.forEach((m) => chip(POS[m][0], POS[m][1], m, m === 'redis' && u > 0.9 ? { col: GOOD, fill: GOODBG } : {}));
      grow(600, 80, POS.redis[0], POS.redis[1] - 18, E(u, 0.3, 0.9), ACC);
      if (u > 0.9) mono(POS.redis[0] - 52, POS.redis[1] + 5, '1', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      if (u > 1.1) { const s = pop(u, 1.1); el('circle', { cx: 700, cy: 228, r: 30 * s, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
        mono(700, 233, 'java', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
        mono(745, 233, '0', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) }); }
      if (u > 1.8) el('rect', { x: 836, y: 46, width: 76, height: 30, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.8) });
      note('SISMEMBER 는 O(1) · 멤버가 많아도 같다', fade(u, 2.1)); return; }
    if (k === 4) { ['redis', 'cache', 'database'].forEach((m) => chip(POS[m][0], POS[m][1], m));
      const v = E(u, 0.6, 1.4), [x, y] = POS.tutorial;
      if (v < 1) chip(x, y, 'tutorial', { s: 1 - v * 0.4, col: BAD, color: BAD, op: 1 - v });
      cross(x, y, 12, u < 0.4 ? 0 : pop(u, 0.4, 0.4) * (1 - v));
      if (u > 1.4) { mono(x, y + 5, 'tutorial', { 'font-size': 15, fill: OFF, 'text-anchor': 'middle', 'text-decoration': 'line-through', opacity: fade(u, 1.4) }); }
      note('없는 값을 SREM 해도 0 이 돌아올 뿐, 오류가 아니다', fade(u, 1.9)); return; }
    // k5: 무작위로 뽑기 (deterministic hop)
    const ms = b.members, ring = (m, col, s) => { const [x, y] = POS[m]; el('rect', { x: x - chipW(m) / 2 - 7, y: y - 22, width: chipW(m) + 14, height: 44, rx: 22, fill: 'none', stroke: col, 'stroke-width': 3, opacity: s }); };
    ms.forEach((m) => chip(POS[m][0], POS[m][1], m));
    if (u > 0.3 && u < 1.0) ring(ms[Math.floor((u - 0.3) / 0.12) % 3], OFF, 1);
    if (u >= 1.0) { ring('cache', ACC, 1); mono(POS.cache[0] + 64, POS.cache[1] + 6, '①', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); }
    if (u >= 1.4) { ['redis', 'database'].forEach((m) => { ring(m, INFO, fade(u, 1.4)); mono(POS[m][0] - chipW(m) / 2 - 26, POS[m][1] + 6, '②', { 'font-size': 18, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.5) }); }); }
    note('꺼내기만 한다 · Set 의 멤버는 그대로 3개', fade(u, 2.0)); }

  // ───────── 2. 집합 연산 (벤 다이어그램) ─────────
  const A = { x: 200, y: 200 }, Bc = { x: 362, y: 200 }, RR = 128;
  const VP = { bob: [128, 165], dave: [134, 240], carol: [281, 200], alice: [438, 165], eve: [432, 240] };
  function venn(f, draw) { f = f || {}; draw = draw ?? 1;
    const ca = el('clipPath', { id: 'r222-ca' }); el('circle', { cx: A.x, cy: A.y, r: RR }, ca);
    el('circle', { cx: A.x, cy: A.y, r: RR, fill: f.a || 'none', opacity: f.aop ?? 1 });
    el('circle', { cx: Bc.x, cy: Bc.y, r: RR, fill: f.b || 'none', opacity: f.bop ?? 1 });
    el('circle', { cx: Bc.x, cy: Bc.y, r: RR, fill: f.lens || PANEL, opacity: f.lens ? f.lop ?? 1 : 1, 'clip-path': 'url(#r222-ca)' });
    const L = 2 * Math.PI * RR;
    [A, Bc].forEach((o) => el('circle', { cx: o.x, cy: o.y, r: RR, fill: 'none', stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': `${L * draw} ${L}` }));
    mono(150, 54, 'follows:alice', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
    mono(416, 54, 'follows:bob', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); }
  function members(o) { o = o || {}; Object.keys(VP).forEach((m) => { const st = (o.style && o.style(m)) || {}; chip(VP[m][0], VP[m][1], m, Object.assign({ fs: 14 }, st)); }); }
  // 결과 줄: 이름 + 칩들 (칩은 도착 시각 at 이후 보인다)
  function row(y, name, items, u, o) { o = o || {}; mono(546, y + 5, name, { 'font-size': 14.5, 'font-weight': 800, fill: o.col || INK, opacity: o.op ?? 1 });
    let x = o.x0 || 620; items.forEach(([s, at, src]) => { const w = chipW(s, 13.5), cx = x + w / 2;
      if (src && u != null && u < at + 0.6 && u >= at) dot([src, [cx, y]], seg(u, at, at + 0.6), o.col || ACC, 7);
      else if (u == null || u >= at) chip(cx, y, s, { fs: 13.5, col: o.col || INK, fill: o.fill || PANEL, op: o.op, s: src && u != null ? pop(u, at + 0.6, 0.4) : 1 });
      x += w + 6; }); return x; }
  const T2 = [
    ['> SADD follows:alice bob carol dave', '(integer) 3', '> SADD follows:bob alice carol eve', '(integer) 3'],
    ['> SINTER follows:alice follows:bob', '1) "carol"'],
    ['> SUNION follows:alice follows:bob', '1) "bob"  2) "carol"  3) "dave"', '4) "alice"  5) "eve"'],
    ['> SDIFF follows:alice follows:bob', '1) "bob"  2) "dave"', '> SINTERSTORE common_follow \\', '    follows:alice follows:bob', '(integer) 1'],
    [['# suggest_friends("alice")', OFF], '> SMEMBERS follows:alice', '1) "bob"  2) "carol"  3) "dave"', ['# suggestions = set()', OFF]],
    ['> SDIFF follows:bob follows:alice', '1) "alice"  2) "eve"', '> SDIFF follows:carol follows:alice', '(empty array)', '> SDIFF follows:dave follows:alice', '(empty array)'],
  ];
  function s2(t, c) { const { k, u } = c;
    term(530, 22, 410, 190, T2, k, u, { keep: false, title: 'redis-cli' });
    if (k === 0) { venn({}, E(u, 0.2, 1.2));
      ['bob', 'carol', 'dave'].forEach((m, i) => chip(VP[m][0], VP[m][1], m, { fs: 14, s: pop(u, 0.6 + i * 0.2) }));
      ['alice', 'eve'].forEach((m, i) => chip(VP[m][0], VP[m][1], m, { fs: 14, s: pop(u, 1.4 + i * 0.2) }));
      tx(281, 362, 'carol 은 두 Set 에 다 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      return; }
    if (k <= 3) {
      const f = k === 1 ? { lens: ACCBG, lop: fade(u, 0.2) } : k === 2 ? { a: INFOBG, b: INFOBG, lens: INFOBG, aop: fade(u, 0.2), bop: fade(u, 0.2) } : { a: WARNBG, aop: fade(u, 0.2) };
      venn(f);
      members({ style: (m) => (k === 1 && m === 'carol') ? { col: ACC, fill: ACCBG } : (k === 3 && (m === 'bob' || m === 'dave')) ? { col: WARN, fill: WARNBG } : (k === 2 ? { col: INFO } : {}) });
      const Y = [250, 292, 334, 376];
      row(Y[0], 'SINTER', [['carol', k === 1 ? 0.6 : -1, VP.carol]], u, { col: k === 1 ? ACC : INK });
      if (k >= 2) { row(Y[1], 'SUNION', ['bob', 'carol', 'dave', 'alice', 'eve'].map((m, i) => [m, k === 2 ? 0.4 + i * 0.25 : -1, VP[m]]), u, { col: k === 2 ? INFO : INK });
        if (k === 2) tx(281, 362, 'carol 은 한 번만 들어간다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) }); }
      if (k === 3) { row(Y[2], 'SDIFF', [['bob', 0.4, VP.bob], ['dave', 0.65, VP.dave]], u, { col: WARN, x0: 610 });
        tx(281, 362, 'alice 쪽에만 있는 사람', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.9) });
        const s = pop(u, 1.5); if (s > 0) { mono(546, Y[3] + 5, 'common_follow', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
          chip(720, Y[3], 'carol', { fs: 13.5, col: ACC, fill: ACCBG, s }); tx(770, Y[3] + 5, '← 새 키로 저장', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); } }
      return; }
    // k4, k5: 친구 추천
    const bOnly = k === 5 && u > 0.2 && u < 1.3;
    venn({ a: k === 4 ? ACCBG : null, aop: k === 4 ? fade(u, 0.3) : 1, b: bOnly ? WARNBG : null, bop: bOnly ? fade(u, 0.2, 0.2) : 1 });
    members({ style: (m) => (k === 4 && ['bob', 'carol', 'dave'].includes(m)) ? { col: ACC } : (bOnly && (m === 'alice' || m === 'eve')) ? { col: WARN, fill: WARNBG } : {} });
    mono(546, 255, 'friends', { 'font-size': 14.5, 'font-weight': 800 });
    const F = [['bob', 0], ['carol', 0], ['dave', 0]]; let fx = 650; const fpos = {};
    F.forEach(([m]) => { const w = chipW(m, 13.5); fpos[m] = fx + w / 2; fx += w + 8; });
    F.forEach(([m], i) => { const on = k === 5 && ((m === 'bob' && u < 1.3) || (m === 'carol' && u >= 1.3 && u < 1.8) || (m === 'dave' && u >= 1.8 && u < 2.3));
      chip(fpos[m], 250, m, { fs: 13.5, col: on ? WARN : ACC, fill: on ? WARNBG : PANEL, s: k === 4 ? pop(u, 0.5 + i * 0.2) : 1 }); });
    if (k === 5 && u < 2.3) { const cx = u < 1.3 ? fpos.bob : u < 1.8 ? fpos.carol : fpos.dave; el('path', { d: `M${cx - 7},${222} L${cx + 7},${222} L${cx},${232} Z`, fill: WARN }); }
    mono(546, 335, 'suggestions', { 'font-size': 14.5, 'font-weight': 800 });
    el('rect', { x: 660, y: 310, width: 270, height: 50, rx: 10, fill: 'none', stroke: k === 4 ? MUT : ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: k === 4 ? fade(u, 1.2) : 1 });
    if (k === 4) { mono(795, 340, 'set()', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      tx(281, 362, 'alice 가 팔로우하는 3명을 차례로 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); return; }
    const ax = 712, ex = 800;
    dot([VP.alice, [ax, 335]], seg(u, 0.5, 1.1), WARN, 7); dot([VP.eve, [ex, 335]], seg(u, 0.5, 1.1), WARN, 7);
    if (u >= 1.1) { chip(ax, 335, 'alice', { fs: 13.5, col: u > 2.3 ? OFF : ACC, color: u > 2.3 ? OFF : null, fill: PANEL, s: pop(u, 1.1, 0.4) });
      chip(ex, 335, 'eve', { fs: 13.5, col: ACC, fill: ACCBG, s: pop(u, 1.1, 0.4) }); }
    if (u >= 1.3) mono(fpos.carol, 290, '∅', { 'font-size': 16, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
    if (u >= 1.8) mono(fpos.dave, 290, '∅', { 'font-size': 16, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    if (u >= 2.3) cross(ax, 335, 11, pop(u, 2.3, 0.3));
    tx(281, 362, u < 2.3 ? 'bob 이 팔로우 − 내가 팔로우 = {alice, eve}' : '자기 자신 alice 를 빼면 추천은 eve', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: u < 2.3 ? WARN : ACC, opacity: u < 2.3 ? fade(u, 0.6) : fade(u, 2.3, 0.3) }); }

  // ───────── 3. Sorted Set 쓰기 ─────────
  const ZX = { idx: 456, name: 478, bar: 572, maxW: 280, max: 2000 }, ZY = (i) => 108 + i * 56;
  const asc = (ms) => ms.slice().sort((a, b) => a.score - b.score || (a.name < b.name ? -1 : 1));
  function zrow(y, i, m, sc, o) { o = o || {}; const col = o.col || INK, op = o.op ?? 1;
    if (o.bg) el('rect', { x: 440, y: y - 22, width: 490, height: 44, rx: 8, fill: o.bg, opacity: op });
    mono(ZX.idx, y + 5, String(i), { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: op });
    mono(ZX.name, y + 5, m, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op });
    const w = Math.max(4, ZX.maxW * sc / ZX.max);
    el('rect', { x: ZX.bar, y: y - 11, width: w, height: 22, rx: 4, fill: o.bar || OFF, opacity: op, stroke: o.dash ? MUT : 'none', 'stroke-dasharray': o.dash ? '4 4' : null });
    mono(ZX.bar + w + 8, y + 5, String(Math.round(sc)), { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: op }); }
  function zset(c, o) { o = o || {}; const { u } = c, b = asc(c.beat.viz.members), pv = c.prev && c.prev.viz.members ? asc(c.prev.viz.members) : null;
    b.forEach((m, i) => { const j = pv ? pv.findIndex((q) => q.name === m.name) : i, ps = pv && pv[j] ? pv[j].score : m.score;
      const y = lerp(ZY(j < 0 ? i : j), ZY(i), E(u, o.moveAt ?? 1.0, (o.moveAt ?? 1.0) + 0.8)), sc = lerp(ps, m.score, E(u, o.growAt ?? 0.4, (o.growAt ?? 0.4) + 0.8));
      const st = (o.style && o.style(m.name)) || {}; zrow(y, i, m.name, sc, st); }); return b; }
  function zhead() { chip(530, 60, 'game:scores', { fs: 15 }); tx(610, 65, 'Sorted Set · index 0 = 가장 낮은 점수', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); }
  const T3 = [
    ['> ZADD game:scores 1200 Alice', '    980 Bob 1450 Carol 760 Dave', '(integer) 4'],
    [['# Eve 가 Bob 과 같은 980 이라면', OFF], ['# 정렬: … Bob(980) Eve(980) …', OFF]],
    ['> ZADD game:scores 1500 Alice', ['(integer) 0   # 새 멤버 0, 갱신', HL]],
    ['> ZINCRBY game:scores 100 Bob', '"1080"'],
    ['> ZSCORE game:scores Carol', '"1450"', '> ZCARD game:scores', '(integer) 4'],
    ['> ZADD game:scores NX 2000 Alice', ['(integer) 0   # 이미 있어 무시', HL], '> ZADD game:scores XX 2000 Alice', ['(integer) 0   # 2000 으로 갱신', HL], '> ZADD game:scores GT 1000 Alice', ['(integer) 0   # 작아서 무시', HL]],
  ];
  const note3 = (s, op) => tx(686, 404, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 });
  function s3(t, c) { const { k, u } = c;
    if (k === 6) return skipList(c);
    term(20, 26, 400, 368, T3, k, u, { title: 'redis-cli' });
    zhead();
    if (k === 0) { const ins = c.beat.viz.members, b = asc(ins);
      ins.forEach((m, i) => { const j = b.findIndex((q) => q.name === m.name), a = 0.2 + i * 0.25;
        if (u < a) return; const y = lerp(ZY(i), ZY(j), E(u, 1.4, 2.2));
        zrow(y, u > 1.8 ? j : i, m.name, m.score * E(u, a, a + 0.5), { op: fade(u, a, 0.3) }); });
      note3('넣는 순간 score 오름차순으로 자리 잡는다', fade(u, 2.1)); return; }
    if (k === 1) { const b = asc(c.beat.viz.members), shift = E(u, 0.5, 1.3);
      b.forEach((m, i) => { const ii = i >= 2 ? i + shift : i; zrow(ZY(ii), i >= 2 ? (shift > 0.5 ? i + 1 : i) : i, m.name, m.score, m.name === 'Bob' ? { col: WARN } : {}); });
      if (u > 1.0) zrow(ZY(2), 2, 'Eve', 980 * E(u, 1.0, 1.6), { col: WARN, bar: WARNBG, dash: true, op: fade(u, 1.0) });
      if (u > 1.3) pill(880, ZY(2), '가정', WARN, pop(u, 1.3), { fs: 13.5 });
      note3('동점이면 이름순 Bob < Eve · REV 조회는 Eve 가 먼저', fade(u, 1.9)); return; }
    if (k === 2) { zset(c, { growAt: 0.4, moveAt: 1.2, style: (n) => n === 'Alice' ? { col: ACC, bar: ACC } : {} });
      note3('같은 멤버면 덮어쓰기 · Alice 가 맨 위로 올라간다', fade(u, 2.0)); return; }
    if (k === 3) { const b = zset(c, { growAt: 1.1, style: (n) => n === 'Bob' ? { col: ACC, bar: ACC } : {} }), i = b.findIndex((m) => m.name === 'Bob');
      const v = seg(u, 0.3, 1.1); if (v > 0 && v < 1) chip(lerp(430, ZX.bar + 160, E(v, 0, 1)), lerp(80, ZY(i) - 30, E(v, 0, 1)), '+100', { fs: 14, col: ACC, fill: ACCBG });
      note3('읽지 않고 서버에서 더한다 · 동시 요청에도 안전', fade(u, 1.8)); return; }
    if (k === 4) { const b = zset(c, { style: (n) => n === 'Carol' && u > 0.5 ? { col: ACC, bg: ACCBG } : {} }), i = b.findIndex((m) => m.name === 'Carol');
      if (u > 0.6) pill(905, ZY(i), '1450', ACC, pop(u, 0.6), { fs: 14, mono: true });
      if (u > 1.4) { const y0 = ZY(0) - 20, y1 = ZY(3) + 20, s = E(u, 1.4, 2.0);
        el('path', { d: `M444,${y0} L438,${y0} L438,${lerp(y0, y1, s)} L444,${lerp(y0, y1, s)}`, fill: 'none', stroke: INFO, 'stroke-width': 2.5 }); }
      if (u > 2.0) mono(438, ZY(3) + 46, 'ZCARD 4', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 2.0) });
      note3('ZSCORE 는 해시 조회라 O(1)', fade(u, 2.1)); return; }
    // k5: NX / XX / GT
    zset(c, { growAt: 1.0, style: (n) => n === 'Alice' ? { col: ACC, bar: ACC } : {} });
    [['NX 2000', '무시', BAD, 0.4], ['XX 2000', '반영', GOOD, 0.9], ['GT 1000', '무시', BAD, 1.6]].forEach(([a, r, col, at], i) => {
      const cx = 530 + i * 150, s = pop(u, at); card(cx, 344, 132, 34, { rx: 17, stroke: col, sw: 2, s, text: a + ' → ' + r, fs: 14, color: col, mono: false }); });
    note3('GT: 1000 < 2000 이라 그대로 · 최고점 기록에 쓴다', fade(u, 2.0)); }
  // skip list (beat 6): 층마다 건너뛰며 찾는다
  function skipList(c) { const { u } = c, L = [290, 222, 154];
    const N = [['head', 1, 3], ['Dave', 760, 1], ['Bob', 1080, 2], ['Carol', 1450, 1], ['Alice', 2000, 3]], X = [80, 250, 420, 590, 760], NIL = 900;
    N.forEach(([n, s, h], i) => { for (let l = 0; l < h; l++) { const op = fade(c.u, 0.1 + l * 0.15);
        el('rect', { x: X[i] - 42, y: L[l] - 20, width: 84, height: 40, rx: 6, fill: i === 0 ? SOFT : PANEL, stroke: INK, 'stroke-width': 2, opacity: op });
        let j = i + 1; while (j < N.length && N[j][2] <= l) j++; const x2 = j < N.length ? X[j] - 44 : NIL - 22;
        grow(X[i] + 42, L[l], x2, L[l], E(u, 0.2 + l * 0.15, 0.7 + l * 0.15), MUT, { sw: 1.8 }); }
      if (i) { mono(X[i], 340, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); mono(X[i], 362, String(s), { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); }
      else tx(X[i], 340, 'head', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT }); });
    L.forEach((y) => { el('rect', { x: NIL - 22, y: y - 14, width: 44, height: 28, rx: 5, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }); });
    tx(NIL, 340, 'NIL', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
    // Carol 찾기: head L2 → (Alice 는 큼) 내려감 → Bob L1 → 내려감 → Carol
    const route = [[80, 154], [80, 222], [420, 222], [420, 290], [590, 290]];
    dot(route, seg(u, 0.9, 2.1), ACC, 8);
    if (u > 2.1) el('rect', { x: 590 - 46, y: 290 - 24, width: 92, height: 48, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 2.1) });
    if (u > 1.1) mono(600, 132, 'Alice 2000 > 1450 → 아래 층', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
    tx(480, 50, 'ZADD · ZRANK: 위층에서 건너뛰며 내려간다 → O(log N)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
    tx(480, 78, '층 수는 멤버마다 무작위로 정해진다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) });
    card(480, 398, 470, 32, { rx: 16, fill: INK, stroke: 'none', text: '멤버 1억 개여도 약 27번 비교 · ZSCORE 는 해시라 O(1)', fs: 14.5, color: PANEL, s: pop(u, 2.2) }); }

  // ───────── 4. 순위 조회 ─────────
  const ALL = [['Dave', 760], ['Bob', 1080], ['Carol', 1450], ['Alice', 1500]];
  const CX = (i) => 230 + i * 160, CY = 150;
  function arr(c, o) { o = o || {}; const n = o.n ?? 4;
    tx(40, 96, 'REV 순서', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(40, 210, 'ZRANGE 순서', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    ALL.forEach(([nm, sc], i) => { const st = (o.style && o.style(nm, i)) || {}; if (st.hide) return;
      const x = CX(i) + (st.dx || 0), y = CY + (st.dy || 0);
      card(x, y, 140, 58, { rx: 8, stroke: st.col || INK, fill: st.fill || PANEL, sw: st.col ? 2.5 : 2, op: st.op });
      mono(x, y - 3, nm, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: st.col || INK, opacity: st.op ?? 1 });
      mono(x, y + 18, String(sc), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: st.op ?? 1 });
      const ri = st.ri ?? i, rv = st.rv ?? (n - 1 - i);
      mono(x, 96, String(rv), { 'font-size': 15, 'text-anchor': 'middle', fill: st.rvCol || MUT, 'font-weight': st.rvCol ? 800 : 400, opacity: st.op ?? 1 });
      mono(x, 210, String(ri), { 'font-size': 15, 'text-anchor': 'middle', fill: st.riCol || MUT, 'font-weight': st.riCol ? 800 : 400, opacity: st.op ?? 1 }); }); }
  function bracket(i0, i1, y, col, s, label) { const x0 = CX(i0) - 72, x1 = lerp(x0, CX(i1) + 72, s);
    el('path', { d: `M${x0},${y + 8} L${x0},${y} L${x1},${y} L${x1},${y + 8}`, fill: 'none', stroke: col, 'stroke-width': 2.5 });
    if (label && s > 0.98) tx((x0 + x1) / 2, y - 8, label, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col }); }
  const T4 = [
    ['> ZREVRANGE game:scores 0 9 WITHSCORES', '1) "Alice"  2) "1500"', '3) "Carol"  4) "1450"', '5) "Bob"    6) "1080"', '7) "Dave"   8) "760"'],
    ['> ZRANGE game:scores 0 9 REV WITHSCORES', ['# ZREVRANGE 와 같은 결과 (6.2+)', OFF]],
    ['> ZRANGE game:scores 0 9', '1) "Dave" 2) "Bob" 3) "Carol" 4) "Alice"', '> ZRANGEBYSCORE game:scores 1000 1500', '1) "Bob" 2) "Carol" 3) "Alice"'],
    ['> ZREVRANK game:scores Bob', ['(integer) 2', HL]],
    [['# around_me("Bob", 5)', OFF], '> ZREVRANK game:scores Bob', '(integer) 2', '> ZREVRANGE game:scores 0 7 WITHSCORES', ['# 4명 전부 (있는 만큼)', OFF]],
    ['> ZCOUNT game:scores 1000 +inf', '(integer) 3', '> ZREVRANGE game:scores 100 149', '(empty array)'],
    ['> ZREM game:scores Dave', '(integer) 1', '> ZREMRANGEBYRANK game:scores 0 -101', ['(integer) 0   # 100명 이하라 그대로', HL]],
  ];
  function board(rows, u, at, x, y) { rows.forEach((r, i) => { const yy = y + i * 34, op = fade(u, at + i * 0.2);
      card(x + 16, yy, 32, 26, { rx: 13, fill: i === 0 ? ACC : SOFT, stroke: 'none', text: String(r.rank), fs: 14, color: i === 0 ? PANEL : INK, op });
      mono(x + 44, yy + 5, r.name, { 'font-size': 15, 'font-weight': 700, opacity: op });
      mono(x + 200, yy + 5, String(r.score), { 'font-size': 15, 'text-anchor': 'end', fill: MUT, opacity: op }); }); }
  function s4(t, c) { const { k, u } = c, rows = c.beat.viz.rows;
    term(20, 236, 460, 176, T4, k, u, { keep: false, title: 'redis-cli' });
    if (k === 0) { const v = seg(u, 0.2, 1.4), at = (i) => 0.2 + (3 - i) * 0.3;
      arr(c, { style: (n, i) => u > at(i) ? { col: ACC, rvCol: ACC } : {} }); dot([[CX(3) + 80, 120], [CX(0) - 80, 120]], v, ACC, 7);
      board(rows, u, 0.4, 560, 262); tx(740, 404, 'stop=9 여도 있는 4명만 온다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { arr(c, { style: () => ({ rvCol: ACC }) });
      const s = pop(u, 0.3); card(720, 270, 400, 40, { rx: 8, stroke: OFF, sw: 1.8, s, text: 'ZREVRANGE key 0 9', fs: 15, color: MUT, mono: true });
      if (u > 0.8) el('line', { x1: 560, y1: 270, x2: lerp(560, 880, E(u, 0.8, 1.2)), y2: 270, stroke: BAD, 'stroke-width': 2.2 });
      card(720, 334, 400, 40, { rx: 8, stroke: ACC, sw: 2.5, s: pop(u, 1.2), text: 'ZRANGE key 0 9 REV', fs: 15, color: ACC, mono: true, fill: ACCBG });
      tx(720, 390, 'BYSCORE · LIMIT 도 ZRANGE 의 옵션 (6.2+)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { const lit = (i) => u > 0.2 + i * 0.25 && u < 1.4;
      arr(c, { style: (n, i) => lit(i) ? { col: INFO, riCol: INFO } : (u > 1.6 && i >= 1) ? { col: ACC } : {} });
      if (u > 1.6) bracket(1, 3, 60, ACC, E(u, 1.6, 2.2), '1000 ≤ score ≤ 1500');
      tx(720, 290, 'ZRANGEBYSCORE 1000 1500', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.8) });
      mono(720, 346, rows.length + '명', { 'font-size': 34, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(720, 388, '점수로 자르면 BYSCORE, 순위로 자르면 0 9', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { arr(c, { style: (n) => n === 'Bob' ? { col: ACC, rvCol: ACC, fill: ACCBG } : {} });
      if (u > 0.5) el('circle', { cx: CX(1), cy: 91, r: 16, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.5) });
      mono(600, 334, '2', { 'font-size': 40, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      grow(630, 322, 730, 322, E(u, 1.3, 1.8), ACC); tx(680, 308, '+1', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      tx(800, 336, '3등', { 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      tx(700, 390, '0부터 세므로 화면에는 +1', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { arr(c, { style: (n) => n === 'Bob' ? { col: ACC, rvCol: ACC } : u > 1.6 ? { col: INFO } : {} });
      mono(560, 286, 'rank  = 2', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) });
      mono(560, 318, 'start = max(0, 2−5) = 0', { 'font-size': 16, opacity: fade(u, 0.8) });
      mono(560, 350, 'stop  = 2+5 = 7', { 'font-size': 16, opacity: fade(u, 1.1) });
      if (u > 1.5) bracket(0, 3, 60, INFO, E(u, 1.5, 2.1), 'REV 0 ~ 7 → 있는 4명');
      tx(560, 392, '없는 사용자는 rank 가 None → []', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 5) { arr(c, { style: (n, i) => i >= 1 && u > 0.5 ? { col: ACC } : {} });
      if (u > 0.5) bracket(1, 3, 60, ACC, E(u, 0.5, 1.0), 'score ≥ 1000 → 3명');
      const X0 = 510, W = 420, pw = W / 3;
      [0, 1, 2].forEach((p) => { const on = p === 2 && u > 1.4; el('rect', { x: X0 + p * pw, y: 296, width: pw - 4, height: 40, rx: 6, fill: on ? ACCBG : SOFT, stroke: on ? ACC : GRID, 'stroke-width': on ? 2.5 : 1.5, opacity: fade(u, 1.1 + p * 0.1) });
        tx(X0 + p * pw + pw / 2 - 2, 321, 'page ' + p, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: on ? ACC : INK, opacity: fade(u, 1.1 + p * 0.1) });
        mono(X0 + p * pw + pw / 2 - 2, 358, (p * 50) + '~' + (p * 50 + 49), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2 + p * 0.1) }); });
      tx(720, 400, 'page=2 → 순위 100~149 로 바로 자른다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    // k6: ZREM Dave, ZREMRANGEBYRANK 0 -101
    const out = E(u, 0.3, 1.0);
    arr(c, { n: 3, style: (n, i) => n === 'Dave' ? { dy: out * 30, op: 1 - out, col: BAD } : { ri: u > 1.0 ? i - 1 : i, rv: 3 - i } });
    if (u > 0.3 && u < 1.2) cross(CX(0), CY, 14, pop(u, 0.3, 0.3));
    const X0 = 510, W = 420, cut = X0 + W * 0.45;
    el('rect', { x: X0, y: 300, width: cut - X0 - 3, height: 38, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.2) });
    el('rect', { x: cut + 3, y: 300, width: X0 + W - cut - 3, height: 38, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.4) });
    tx((X0 + cut) / 2, 324, '0 ~ -101 지움', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
    tx((cut + X0 + W) / 2, 324, '끝 100개 = 상위 100명', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
    tx(X0, 362, '← rank 0 = 최저점', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) }); tx(X0 + W, 362, '-1 = 최고점 →', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.7) });
    tx(720, 400, 'ZREMRANGEBYRANK 는 낮은 점수부터 센다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // ───────── 5. 기간별 리더보드 ─────────
  const BX = [370, 600, 830], BW = 210, BT = 106, BH = 186, KEYS = [['daily', '{day}'], ['weekly', '{week}'], ['monthly', '{month}']];
  const parse = (s) => { const m = String(s).split(' '); return [m[0], m[1] === '—' ? null : Number(m[1])]; };
  function boards(c, o) { o = o || {}; const b = c.beat.viz, p = c.prev ? c.prev.viz : null, u = c.u;
    ['daily', 'weekly', 'monthly'].forEach((key, i) => { const x = BX[i], dim = o.pick != null && o.pick !== i, op = dim ? 0.35 : 1, on = o.pick === i;
      el('rect', { x: x - BW / 2, y: BT, width: BW, height: BH, rx: 10, fill: PANEL, stroke: on ? ACC : INK, 'stroke-width': on ? 3 : 2, opacity: op });
      const kv = o.keyIn == null ? 1 : fade(u, o.keyIn + i * 0.25);
      mono(x - BW / 2 + 14, BT + 24, 'leaderboard:', { 'font-size': 13.5, fill: MUT, opacity: op * kv });
      mono(x - BW / 2 + 14, BT + 46, KEYS[i][0] + ':' + KEYS[i][1], { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: op * kv });
      el('line', { x1: x - BW / 2 + 10, y1: BT + 58, x2: x + BW / 2 - 10, y2: BT + 58, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      b[key].forEach((s, j) => { const [nm, v] = parse(s), pv = p ? parse(p[key][j])[1] : null, y = BT + 88 + j * 34;
        const val = v == null ? '—' : String(Math.round(pv == null ? v * E(u, o.fillAt ?? 0.2, (o.fillAt ?? 0.2) + 0.8) : tween(pv, v, u - (o.tweenAt ?? 0))));
        const ch = pv != null && v != null && pv !== v;
        mono(x - BW / 2 + 14, y, (j + 1) + '. ' + nm, { 'font-size': 15, 'font-weight': 700, opacity: op });
        mono(x + BW / 2 - 14, y, val, { 'font-size': 15, 'text-anchor': 'end', fill: ch ? ACC : v == null ? OFF : INK, 'font-weight': ch ? 800 : 400, opacity: op }); }); }); }
  const SV = [95, 222];
  function s5(t, c) { const { k, u } = c;
    server(SV[0], SV[1], '앱 서버', { lamp: k === 1 || k === 5 ? ACC : OFF });
    if (k === 0) { clock(SV[0], 70, 26, E(u, 0.2, 0.9) * 0.6, INFO, null); tx(SV[0], 118, 'now', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, class: 'mono' });
      boards(c, { keyIn: 0.9 }); [0, 1, 2].forEach((i) => dot([[SV[0] + 30, 70], [BX[i] - 40, BT + 40]], seg(u, 0.5 + i * 0.25, 1.1 + i * 0.25), INFO, 6));
      tx(600, 340, '키 이름이 나뉘면 리더보드도 나뉜다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { boards(c, { fillAt: 1.3 });
      const v = seg(u, 0.2, 1.1); if (v > 0 && v < 1) card(lerp(SV[0] + 70, 250, E(v, 0, 1)), 160, 150, 50, { rx: 8, fill: ACC, stroke: 'none', text: 'ZINCRBY ×3\nEXPIRE', fs: 13.5, color: PANEL, mono: true });
      [0, 1, 2].forEach((i) => dot([[262, 160], [BX[i] - 60, BT + 90]], seg(u, 1.0, 1.5), ACC, 6));
      tx(180, 120, '왕복 1번', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      clock(BX[0] - 80, 336, 18, 1 - E(u, 1.8, 2.6) * 0.1, WARN, null);
      mono(BX[0] - 54, 341, 'EXPIRE 604800s = 7일', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); return; }
    // k ≥ 2: daily 를 고른다
    boards(c, { pick: 0, tweenAt: 0.9 });
    clock(BX[0] - 80, 336, 18, 0.1, WARN, null); mono(BX[0] - 54, 341, 'TTL 7일', { 'font-size': 14, 'font-weight': 700, fill: WARN });
    if (k === 2) { pill(BX[0], 80, 'period = "daily"', ACC, pop(u, 0.3), { mono: true, fs: 14 });
      grow(SV[0] + 60, SV[1] - 30, BX[0] - BW / 2 - 6, 170, E(u, 0.8, 1.5), ACC);
      tx(720, 345, '조회 코드는 하나 · 키 이름만 바뀐다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    const reads = [['ZREVRANGE 0 9', 'top10'], ['ZREVRANK alice', 'my_rank = 0'], ['ZSCORE alice', 'my_score = 980.0']];
    if (k === 3) { reads.forEach(([cmd, r], i) => { const a = 0.3 + i * 0.6, v = seg(u, a, a + 0.5);
        if (v > 0 && v < 1) card(lerp(BX[0] - 60, SV[0] + 20, E(v, 0, 1)), lerp(150, 300, E(v, 0, 1)), tw(cmd, 13.5) + 24, 28, { rx: 14, fill: ACC, stroke: 'none', text: cmd, fs: 13.5, color: PANEL, mono: true });
        mono(24, 318 + i * 30, r, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a + 0.5) }); });
      tx(720, 345, '순위판 = 명령 3개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k4, k5: 응답 다듬기
    const me = c.beat.viz.daily[0] ? parse(c.beat.viz.daily[0])[1] : 0, pme = c.prev ? parse(c.prev.viz.daily[0])[1] : me;
    if (k === 4) { mono(24, 318, 'top10', { 'font-size': 15, 'font-weight': 700 }); mono(24, 348, 'my_rank = 0', { 'font-size': 15, 'font-weight': 700 }); mono(24, 378, 'my_score = 980.0', { 'font-size': 15, 'font-weight': 700 });
      card(715, 360, 440, 92, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 0.3) });
      mono(515, 352, '"score": 980.0', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.5) }); grow(660, 347, 700, 347, E(u, 0.8, 1.1), ACC); mono(712, 352, '980', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) }); tx(925, 352, 'int()', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.1) });
      mono(515, 384, '"rank": 0', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); grow(660, 379, 700, 379, E(u, 1.6, 1.9), ACC); mono(712, 384, '1', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) }); tx(925, 384, '+1 (0부터 셈)', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.9) });
      return; }
    // k5: add_score("alice",100), add_score("bob",80) → 바로 조회
    [['+100 alice', 0.2], ['+80 bob', 0.6]].forEach(([s, a]) => { const v = seg(u, a, a + 0.6); if (v > 0 && v < 1) card(lerp(SV[0] + 60, BX[0] - 40, E(v, 0, 1)), lerp(SV[1], 200, E(v, 0, 1)), tw(s, 13.5) + 24, 28, { rx: 14, fill: ACC, stroke: 'none', text: s, fs: 13.5, color: PANEL, mono: true }); });
    card(715, 360, 440, 70, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 1.6) });
    mono(715, 366, '"me": {"rank": 1, "score": ' + Math.round(tween(pme, me, u - 0.9)) + '}', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: 'Set에 SADD로 "redis"를 두 번 넣으면 멤버는 몇 개가 되나?',
      o: ['오류가 난다 — 이미 있는 값이다', '2개 — 넣은 만큼 쌓인다', '1개 — 중복은 무시된다'], a: 2,
      why: 'Set은 중복 없는 집합이라 같은 값을 몇 번 SADD해도 멤버는 하나다. 중복 체크 코드가 필요 없다.' },
    { q: 'alice와 bob이 둘 다 팔로우하는 사람을 구하는 명령은 무엇인가?',
      o: ['SINTER', 'SUNION', 'SDIFF'], a: 0,
      why: 'SINTER는 교집합을 돌려준다. 예제의 결과는 carol 하나이고, SQL JOIN이 필요 없다.' },
    { q: 'Sorted Set에 이미 있는 멤버 Alice를 새 점수로 다시 ZADD하면 어떻게 되나?',
      o: ['Alice가 두 번 들어간다', '점수가 새 값으로 덮어써지고 순위가 바로 바뀐다', '기존 점수에 새 점수가 더해진다'], a: 1,
      why: '멤버는 유일하므로 ZADD는 score 덮어쓰기다(1200 → 1500). 점수를 더하려면 ZINCRBY를 쓴다.' },
    { q: 'ZREVRANK가 Bob에게 2를 돌려줬다. 화면에 보여 줄 순위는 몇 등인가?',
      o: ['1등', '2등', '3등'], a: 2,
      why: 'ZREVRANK는 0부터 센다. 사용자에게 보일 때는 +1 해서 3등이다.' },
    { q: '일간·주간·월간 리더보드를 따로 운영하는 방법은 무엇인가?',
      o: ['기간마다 다른 키 이름에 ZINCRBY한다', '한 키의 score 소수점에 기간을 섞는다', '조회할 때 ZRANGEBYSCORE로 기간을 거른다'], a: 0,
      why: '기간별 리더보드는 로직이 아니라 키 이름으로 나눈다. 점수를 얻으면 세 키에 파이프라인으로 ZINCRBY하고, 일간 키에는 7일 TTL을 건다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'Set은 중복 없는 집합이다. 같은 값을 여러 번 SADD해도 멤버는 하나라 중복 검사가 필요 없다.',
    '교집합, 합집합, 차집합 명령으로 공통 친구나 추천 대상을 SQL JOIN 없이 구한다.',
    'Sorted Set은 멤버마다 score를 두고 넣는 순간 정렬한다. skip list라 삽입이 O(log N)이다.',
    '리더보드는 ZINCRBY로 점수를 쌓고 ZREVRANGE와 ZREVRANK로 읽는다. 기간별 순위는 키로 나눈다.',
  ];
  const review = [
    { q: '앱이 ZSCORE로 점수를 읽고 더한 뒤 ZADD로 쓰자, 동시 요청에서 점수가 빠졌다. 가장 맞는 수정은?',
      o: ['ZADD에 gt 옵션을 붙인다', 'ZINCRBY로 서버에서 더한다', 'ZREVRANK로 순위를 먼저 확인한다'], a: 1,
      why: '읽고 쓰는 사이에 다른 요청이 끼면 그 점수가 덮어써진다. ZINCRBY는 현재 점수를 읽지 않고 원자적으로 더하며, gt는 더 클 때만 덮어쓰는 옵션이라 누적이 안 된다.' },
    { q: '친구 추천을 요청마다 큰 Set 두 개의 SINTER로 계산했더니 Redis가 바빠졌다. 가장 맞는 조치는?',
      o: ['SINTERSTORE로 결과를 저장하고 TTL을 건다', 'SMEMBERS로 둘 다 받아 앱에서 교집합을 구한다', 'Set을 List로 바꿔 저장한다'], a: 0,
      why: '큰 Set 연산은 결과를 새 키에 저장하고 TTL을 걸어 재사용한다. SMEMBERS로 통째로 받아 오면 O(N) 조회와 전송이 오히려 늘어난다.' },
    { q: '리더보드 키에 순위 밖 사용자가 계속 쌓인다. 상위 100명만 남기는 명령은?',
      o: ['ZREMRANGEBYRANK key 0 99', 'ZREM key 100', 'ZREMRANGEBYRANK key 0 -101'], a: 2,
      why: 'rank는 낮은 점수부터 0으로 센다. 0부터 -101까지 지우면 점수가 높은 100명만 남고, 0 99를 지우면 하위 100명만 빠진다.' },
  ];

  R.page({ title: 'Set / Sorted Set 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
