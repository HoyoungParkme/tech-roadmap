/* II-1-1 String — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, redisBox, person, crowd, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, INFO } = C;

  // ---------- 공통 ----------
  const typed = (u, n, a = 0.15, d = 0.3) => clamp((u - a) / d, 0, n);          // 터미널 줄이 몇 개 보이나
  const lineAt = (i, a = 0.15, d = 0.3) => a + d * (i + 1);                        // i 번째 줄이 다 찍히는 시각
  // 바이트 칸 한 줄: chars 배열, o = {w, h, gap, fs, style(i)}
  function byteRow(x, y, chars, o) { o = o || {}; const w = o.w || 46, h = o.h || 44, gap = o.gap ?? 6;
    chars.forEach((ch, i) => { const st = (o.style && o.style(i)) || {}; if (st.hide) return;
      card(x + i * (w + gap) + w / 2, y + h / 2, w, h, { rx: 6, text: ch, fs: o.fs || 16, mono: true, fw: 700, stroke: st.stroke || INK, fill: st.fill, color: st.color, s: st.s, op: st.op, sw: st.sw || 2 }); });
    return (i) => x + i * (w + gap) + w / 2; }
  function memPanel(x, y, w, rows, o) { o = o || {}; const rh = 40;
    el('rect', { x, y, width: w, height: 44 + rh * Math.max(rows.length, 1), rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 16, y + 27, o.title || 'Redis 메모리', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    rows.forEach((r, i) => { const yy = y + 40 + i * rh, op = r.op ?? 1;
      if (r.hot) el('rect', { x: x + 6, y: yy + 3, width: w - 12, height: rh - 6, rx: 6, fill: ACCBG, opacity: op });
      mono(x + 16, yy + 26, r.k, { 'font-size': 14.5, 'font-weight': 700, fill: r.hot ? ACC : INK, opacity: op });
      mono(x + (o.kw || 150), yy + 26, r.v, { 'font-size': 14.5, fill: INK, opacity: op });
      if (r.ttl) mono(x + w - 14, yy + 26, r.ttl, { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end', 'font-weight': 700, opacity: op }); }); }

  // ---------- 1. SET / GET ----------
  const KEYS = [['user:1:name', '"Alice"', 0], ['user:1', '{"id": 1, "name": "Alice"}', 1], ['user:1:avatar', '89 50 4E 47 0D 0A …', 2],
    ['session:abc', '"user-data"', 3, 'TTL 3600'], ['key', '"v"', 5]];
  const TOUCH = [0, 1, 2, 3, 3, 4];
  const T1 = [
    ['> SET user:1:name "Alice"', 'OK', '> GET user:1:name', '"Alice"'],
    ['> SET user:1 \'{"id": 1, "name": "Alice"}\'', 'OK', '> GET user:1', '\'{"id": 1, "name": "Alice"}\''],
    ['> SET user:1:avatar "\\x89PNG\\r\\n…"', 'OK', ['# 180 KB 바이너리가 바이트 그대로 저장된다', MUT]],
    ['> SETEX session:abc 3600 "user-data"', 'OK', '> TTL session:abc', '(integer) 3600'],
    ['> SET session:abc "user-data" EX 3600', 'OK', '> TTL session:abc', '(integer) 3600'],
    ['> SET key v NX', 'OK', '> SET key v NX', ['(nil)', WARN], '> SET key2 v XX', ['(nil)', WARN]],
  ];
  function s1(t, c) { const { k, u } = c, L = T1[k] || T1[0];
    terminal(24, 24, 456, 172, L, typed(u, L.length), { title: 'redis-cli', fs: 14 });
    const ins = lineAt(0) + 0.1;
    const rows = KEYS.filter((r) => r[2] <= k).map((r, i) => { const hot = i === TOUCH[k], fresh = r[2] === k;
      return { k: r[0], v: r[1], ttl: r[3], hot, op: fresh ? fade(u, ins, 0.35) : 1 }; });
    memPanel(500, 24, 436, rows, { title: 'Redis 메모리 · 키 → 문자열' });
    if (k === 0) { sub(252, 232, '값은 바이트 덩어리다', fade(u, 0.7), { 'font-size': 15, 'font-weight': 700, fill: INK });
      const xs = byteRow(121, 248, ['A', 'l', 'i', 'c', 'e'], { w: 46, gap: 8, style: (i) => ({ s: pop(u, 0.8 + i * 0.12) }) });
      ['41', '6C', '69', '63', '65'].forEach((h, i) => mono(xs(i), 312, h, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) }));
      mono(400, 276, '5 B', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      pill(252, 368, 'GET → 같은 바이트 그대로 "Alice"', GOOD, pop(u, 1.9), { fs: 14 }); }
    if (k === 1) { card(252, 240, 300, 38, { rx: 8, text: "{'id': 1, 'name': 'Alice'}", fs: 14, mono: true, s: pop(u, 0.5) });
      lbl(80, 228, 'dict', fade(u, 0.5), { 'font-size': 15, fill: MUT });
      grow(200, 262, 200, 318, E(u, 0.9, 1.4), ACC); tx(190, 296, 'json.dumps', { 'text-anchor': 'end', 'font-size': 14, class: 'mono', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.1) });
      card(252, 342, 300, 38, { rx: 8, text: '\'{"id": 1, "name": "Alice"}\'', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.4) });
      lbl(80, 386, 'str', fade(u, 1.4), { 'font-size': 15, fill: ACC });
      grow(304, 318, 304, 262, E(u, 1.9, 2.4), INK); tx(314, 296, 'json.loads', { 'font-size': 14, class: 'mono', 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 2) { lbl(80, 250, 'avatar.png', fade(u, 0.3), { 'font-size': 15 });
      byteRow(150, 228, ['89', '50', '4E', '47', '0D', '0A', '…'], { w: 40, gap: 6, fs: 14.5, style: (i) => ({ s: pop(u, 0.4 + i * 0.08) }) });
      card(120, 310, 190, 38, { rx: 8, text: 'rb  디코딩 없음', fs: 14.5, stroke: GOOD, s: pop(u, 1.0) });
      grow(218, 310, 268, 310, E(u, 1.2, 1.5), GOOD); check(290, 310, 10, pop(u, 1.5)); tx(312, 315, 'bytes 그대로', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
      card(120, 372, 190, 38, { rx: 8, text: 'r  decode=True', fs: 14.5, stroke: BAD, s: pop(u, 1.8) });
      grow(218, 372, 268, 372, E(u, 2.0, 2.3), BAD); cross(290, 372, 9, pop(u, 2.3)); mono(312, 377, 'UnicodeDecodeError', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); }
    if (k === 3) { tx(40, 232, 'SET 다음 EXPIRE 를 따로 보내면', { 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.5) });
      pill(76, 268, 'SET', INK, pop(u, 0.6), { mono: true }); grow(108, 268, 158, 268, E(u, 0.8, 1.0), MUT, { plain: true });
      cross(176, 268, 10, pop(u, 1.0)); pill(250, 268, 'EXPIRE', OFF, pop(u, 1.1), { mono: true, fill: SOFT });
      tx(304, 273, 'TTL 없는 키가 남는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      tx(40, 324, 'SETEX 한 번이면', { 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.6) });
      pill(84, 360, 'SETEX', ACC, pop(u, 1.7), { mono: true }); grow(124, 360, 176, 360, E(u, 1.9, 2.1), ACC);
      clock(206, 360, 20, 1 - E(u, 2.1, 2.9) * 0.08, WARN, 'TTL 3600');
      tx(240, 365, '값과 만료가 함께 들어간다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); }
    if (k === 4) { mono(40, 240, 'SETEX session:abc 3600 "user-data"', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4) });
      lbl(252, 274, '=', fade(u, 0.8), { 'font-size': 20 });
      mono(40, 306, 'SET session:abc "user-data" EX 3600', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      [['EX 초', ACC], ['PX 밀리초', ACC], ['NX', INFO], ['XX', INFO]].forEach(([s, col], i) => pill(78 + i * 104, 362, s, col, pop(u, 1.5 + i * 0.2), { fs: 14 }));
      tx(40, 404, 'SET 하나에 옵션을 붙인다 (2.6.12+)', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 5) { const kx = 300, ky = 312;
      card(kx, ky, 96, 44, { rx: 8, text: 'key', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.4) });
      card(60, 262, 52, 36, { rx: 8, text: 'A', fs: 16 }); card(60, 362, 52, 36, { rx: 8, text: 'B', fs: 16 });
      fly(90, 262, kx - 50, ky - 10, seg(u, 0.5, 1.2), 'SET key v NX', { mono: true });
      fly(90, 362, kx - 50, ky + 10, seg(u, 1.1, 1.8), 'SET key v NX', { mono: true, fill: WARN });
      if (u > 1.2) { check(372, 262, 10, pop(u, 1.2)); tx(392, 267, 'OK', { 'font-size': 16, 'font-weight': 800, fill: GOOD, class: 'mono' }); }
      if (u > 1.8) { cross(372, 362, 9, pop(u, 1.8)); tx(392, 367, '(nil)', { 'font-size': 16, 'font-weight': 800, fill: WARN, class: 'mono' }); }
      tx(40, 412, '먼저 온 한 쪽만 성공한다 → 락의 재료', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.2) }); } }

  // ---------- 2. INCR / DECR ----------
  const T2 = [
    { L: ['> INCR page:42:views', '(integer) 1', '> INCR page:42:views', '(integer) 2', '> INCRBY page:42:views 10', '(integer) 12'], key: 'page:42:views', res: [[1, 1], [3, 2], [5, 12]], from: '(없음)' },
    { L: ['> GET user:1:name', '"Alice"', '> INCR user:1:name', ['(error) ERR value is not an integer or out of range', C.BAD]], key: 'user:1:name', res: [], from: '"Alice"', fixed: '"Alice"' },
    { L: ['> DECR stock:item:1', '(integer) -1', '> DECRBY stock:item:1 5', '(integer) -6'], key: 'stock:item:1', res: [[1, -1], [3, -6]], from: '(없음)' },
    { L: ['> INCRBYFLOAT rate 0.5', '"0.5"'], key: 'rate', res: [[1, 0.5]], from: '(없음)' },
    { L: [['# 클라이언트 1000개가 동시에', MUT], '> INCR page:42:views', '> INCR page:42:views', '> …', '(integer) 1000'], key: 'page:42:views', count: 1000 },
    { L: ['> INCR rate:u1', '(integer) 1', '> EXPIRE rate:u1 60', '(integer) 1', '> INCR rate:u1', '(integer) 100'], key: 'rate:u1', res: [[1, 1], [5, 100]], from: '(없음)' },
    { L: ['> INCR online:users', '> DECR online:users', '> GET online:users', '"53"'], key: 'online:users', count: 53 },
  ];
  function valueAt(d, u) { if (d.fixed) return d.fixed; if (d.count != null) return Math.round(lerp(0, d.count, E(u, 0.4, 2.2)));
    let v = d.from; d.res.forEach(([li, val]) => { if (u >= lineAt(li)) v = val; }); return v; }
  function s2(t, c) { const { k, u } = c, d = T2[k] || T2[0];
    terminal(24, 24, 456, 172, d.L, typed(u, d.L.length), { title: 'redis-cli', fs: k === 1 ? 13.5 : 14 });
    const v = valueAt(d, u), neg = typeof v === 'number' && v < 0;
    card(718, 110, 436, 172, { rx: 12, stroke: k === 1 ? BAD : GRID, sw: 1.8 });
    mono(718, 56, d.key, { 'font-size': 16, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    const lastHit = d.res ? d.res.reduce((a, [li]) => (u >= lineAt(li) ? lineAt(li) : a), -9) : -9;
    const g = R.G(718, 128, 1 + bump(u, lastHit)); mono(0, 0, String(v), { 'font-size': 52, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 1 ? INK : neg ? BAD : ACC }, g);
    if (typeof v === 'number') sub(718, 172, `저장 형태: 문자열 "${v}"`, 1, { 'font-size': 14 });
    else if (k === 1) sub(718, 172, '숫자로 읽을 수 없는 문자열', fade(u, 1.0), { 'font-size': 14, fill: BAD, 'font-weight': 700 });
    if (k === 0) { const xs = [120, 340, 560, 780], vals = ['(없음)', '1', '2', '12'], ops = ['INCR +1', 'INCR +1', 'INCRBY +10'], when = [0.3, lineAt(1), lineAt(3), lineAt(5)];
      xs.forEach((x, i) => { card(x, 312, 130, 56, { rx: 10, text: vals[i], fs: i ? 22 : 16, mono: true, stroke: i ? ACC : GRID, color: i ? ACC : MUT, s: pop(u, when[i]) });
        if (i) { grow(xs[i - 1] + 70, 312, x - 70, 312, E(u, when[i] - 0.3, when[i]), ACC); mono((xs[i - 1] + x) / 2, 296, ops[i - 1], { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, when[i] - 0.3) }); } });
      sub(120, 370, '없는 키는 0 으로 본다', fade(u, 0.6), { 'font-size': 14 }); }
    if (k === 1) { card(150, 268, 140, 46, { rx: 8, text: '"12"', fs: 18, mono: true, stroke: GOOD, s: pop(u, 0.5) });
      check(250, 268, 10, pop(u, 0.8)); tx(272, 274, '64비트 정수로 읽힌다 → 더할 수 있다', { 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) });
      card(150, 350, 140, 46, { rx: 8, text: '"Alice"', fs: 18, mono: true, stroke: BAD, s: pop(u, 1.4) });
      cross(250, 350, 9, pop(u, 1.8)); tx(272, 356, '정수가 아니다 → 오류, 값은 그대로', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }
    if (k === 2) { const X = (n) => 160 + (n + 8) * 52, y = 320;
      el('rect', { x: X(-8), y: y - 22, width: X(0) - X(-8), height: 44, rx: 6, fill: BADBG, opacity: fade(u, 1.6) });
      el('line', { x1: X(-8), y1: y, x2: X(4), y2: y, stroke: INK, 'stroke-width': 2 });
      for (let n = -8; n <= 4; n++) { el('line', { x1: X(n), y1: y - 7, x2: X(n), y2: y + 7, stroke: n === 0 ? INK : OFF, 'stroke-width': n === 0 ? 3 : 1.5 });
        if (n === 0 || n === -1 || n === -6) mono(X(n), y + 30, String(n), { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: n ? BAD : INK }); }
      const vv = typeof v === 'number' ? v : 0, from = vv === -6 ? -1 : 0, at = vv === -6 ? lineAt(3) : lineAt(1), pos = lerp(from, vv, E(u, at - 0.4, at));
      el('circle', { cx: X(pos), cy: y, r: 11, fill: pos < -0.01 ? BAD : ACC });
      tx(X(-3), 268, '0 아래로도 그대로 내려간다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
    if (k === 3) { pill(200, 280, 'INCRBYFLOAT rate 0.5', ACC, pop(u, 0.6), { mono: true, fs: 15 }); grow(318, 280, 380, 280, E(u, 0.9, 1.2), ACC); pill(430, 280, '"0.5"', ACC, pop(u, 1.2), { mono: true, fs: 15 });
      pill(170, 352, 'DECRBYFLOAT', OFF, pop(u, 1.6), { mono: true, fs: 15, fill: SOFT }); cross(270, 352, 8, pop(u, 1.8));
      tx(296, 357, '없다 →', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.9) });
      pill(480, 352, 'INCRBYFLOAT rate -0.5', INK, pop(u, 2.0), { mono: true, fs: 15 }); }
    if (k === 4) { crowd(100, 310, lerp(4, 24, E(u, 0.2, 1.0)), '동시 1000개');
      const lane = [[150, 310], [250, 310], [430, 310]]; for (let i = 0; i < 8; i++) dot(lane, ((t * 0.9 + i / 8) % 1), ACC, 5);
      redisBox(500, 310, { sub: '한 번에 한 명령', w: 130 });
      zone(612, 214, 324, 196, 'DB 식 읽기 → 더하기 → 쓰기', { stroke: BAD, op: fade(u, 1.0) });
      [['A 읽기   n', INK], ['B 읽기   n', INK], ['A 쓰기   n+1', INK], ['B 쓰기   n+1', BAD]].forEach(([s, col], i) => mono(634, 266 + i * 28, s, { 'font-size': 15, fill: col, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.2) }));
      tx(634, 392, 'INCR 두 번인데 1만 올랐다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) }); }
    if (k === 5) { const n = Math.round(lerp(0, 101, E(u, 0.4, 2.2)));
      for (let i = 0; i < 101; i++) { const col = i % 25, row = Math.floor(i / 25), on = i < n, over = i === 100;
        el('rect', { x: 40 + col * 22, y: 226 + row * 26, width: 17, height: 19, rx: 3, fill: on ? (over ? BAD : ACC) : SOFT, opacity: on ? 0.9 : 1 }); }
      tx(40, 378, n >= 101 ? '101번째 → False (차단)' : `요청 ${Math.min(n, 100)}회`, { 'font-size': 15, 'font-weight': 700, fill: n >= 101 ? BAD : INK, class: n >= 101 ? null : 'mono' });
      tx(40, 404, 'count == 1 일 때만 EXPIRE 60', { 'font-size': 14.5, fill: MUT, opacity: fade(u, lineAt(3)) });
      clock(760, 300, 40, u < lineAt(3) ? 0 : 1 - E(u, lineAt(3), 2.9) * 0.2, WARN, 'TTL 60s');
      sub(760, 382, '60초 뒤 키가 사라져 창이 다시 열린다', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 6) { person(140, 290, '로그인', {}); person(820, 290, '로그아웃', {});
      card(480, 300, 190, 54, { rx: 10, text: 'online:users', fs: 16, mono: true, stroke: ACC, color: ACC });
      for (let i = 0; i < 3; i++) { fly(176, 290, 380, 300, seg(u, 0.3 + i * 0.6, 0.9 + i * 0.6), 'INCR +1', { mono: true });
        fly(784, 290, 580, 300, seg(u, 0.6 + i * 0.6, 1.2 + i * 0.6), 'DECR -1', { mono: true, fill: INK }); }
      tx(480, 380, '두 줄이면 숫자가 어긋나지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); } }

  // ---------- 3. 문자열 조작 ----------
  const X3 = 140, W3 = 52, G3 = 6, Y3 = 140, cx3 = (i) => X3 + i * (W3 + G3) + W3 / 2;
  const HW = ['H', 'e', 'l', 'l', 'o', '␣', 'W', 'o', 'r', 'l', 'd'];
  function cmdBar(cmd, res, u, a) { const op = fade(u, a ?? 0.15);
    el('rect', { x: 24, y: 22, width: 912, height: 46, rx: 10, fill: INK, opacity: op });
    mono(44, 51, cmd, { 'font-size': 16, fill: PANEL, 'font-weight': 700, opacity: op });
    if (res) mono(916, 51, res, { 'font-size': 16, fill: 'var(--term)', 'text-anchor': 'end', opacity: fade(u, (a ?? 0.15) + 0.5) }); }
  function keyTag(name) { mono(X3, Y3 - 14, name, { 'font-size': 15, 'font-weight': 700, fill: MUT }); }
  function idxRow(n, y, neg) { for (let i = 0; i < n; i++) mono(cx3(i), y, String(neg ? i - n : i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { cmdBar('> SET msg "Hello"', 'OK', u); keyTag('msg');
      byteRow(X3, Y3, HW.slice(0, 5), { w: W3, gap: G3, style: (i) => ({ s: pop(u, 0.5 + i * 0.15) }) }); idxRow(5, Y3 + 66, false);
      sub(480, 290, '이후 명령은 모두 이 값을 바꿔 간다', fade(u, 1.5), { 'font-size': 15 }); }
    if (k === 1) { cmdBar('> APPEND msg " World"', '(integer) 11', u); keyTag('msg');
      byteRow(X3, Y3, HW, { w: W3, gap: G3, style: (i) => i < 5 ? {} : { stroke: ACC, color: ACC, op: fade(u, 0.5 + (i - 5) * 0.15, 0.3), s: pop(u, 0.5 + (i - 5) * 0.15) } }); idxRow(11, Y3 + 66, false);
      tx(480, 290, '반환값 11 = 붙인 뒤 전체 길이', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); }
    if (k === 2) { cmdBar('> STRLEN msg', '(integer) 11', u); keyTag('msg');
      byteRow(X3, Y3, HW, { w: W3, gap: G3 }); const g = E(u, 0.5, 1.4), x1 = X3, x2 = lerp(X3, X3 + 11 * (W3 + G3) - G3, g);
      el('path', { d: `M${x1},${Y3 + 56} v10 H${x2} v-10`, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      tx((X3 + X3 + 11 * (W3 + G3) - G3) / 2, Y3 + 92, '11 바이트', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
      mono(X3, 318, '"가"', { 'font-size': 20, 'font-weight': 700, opacity: fade(u, 1.7) });
      byteRow(X3 + 70, 292, ['EA', 'B0', '80'], { w: W3, gap: G3, style: (i) => ({ s: pop(u, 1.8 + i * 0.12), stroke: WARN, color: WARN }) });
      tx(X3 + 70 + 3 * (W3 + G3) + 14, 320, '한글 1글자 = 3바이트 (UTF-8)', { 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) }); }
    if (k === 3) { const second = u > 1.5; cmdBar(second ? '> GETRANGE msg 6 -1' : '> GETRANGE msg 0 4', second ? '"World"' : '"Hello"', u, second ? 1.5 : 0.15); keyTag('msg');
      const inA = (i) => i <= 4, inB = (i) => i >= 6;
      byteRow(X3, Y3, HW, { w: W3, gap: G3, style: (i) => (!second && inA(i) && u > 0.6) || (second && inB(i)) ? { stroke: ACC, color: ACC, fill: ACCBG } : { stroke: OFF, color: MUT } });
      idxRow(11, Y3 + 66, false); idxRow(11, Y3 + 90, true);
      tx(X3 - 16, Y3 + 66, '앞', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); tx(X3 - 16, Y3 + 90, '뒤', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      pill(cx3(2), 300, '0..4 → "Hello"', ACC, pop(u, 0.9), { mono: true, fs: 15 });
      pill(cx3(8), 300, '6..-1 → "World"', ACC, pop(u, 1.9), { mono: true, fs: 15 });
      tx(480, 362, 'start 와 end 둘 다 포함한다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.3) }); }
    if (k === 4) { cmdBar('> SETRANGE msg 6 "Redis"', '(integer) 11', u); keyTag('msg');
      const NEW = ['R', 'e', 'd', 'i', 's'];
      byteRow(X3, Y3, HW, { w: W3, gap: G3, style: (i) => i >= 6 ? (u > 0.8 + (i - 6) * 0.15 ? { hide: true } : { stroke: OFF, color: MUT }) : {} });
      byteRow(X3, Y3, HW.map((_, i) => (i >= 6 ? NEW[i - 6] : '')), { w: W3, gap: G3, style: (i) => i < 6 ? { hide: true } : { s: pop(u, 0.8 + (i - 6) * 0.15), stroke: ACC, color: ACC, fill: ACCBG } });
      grow(cx3(6), Y3 - 50, cx3(6), Y3 - 4, E(u, 0.3, 0.6), ACC); mono(cx3(6) + 10, Y3 - 32, 'offset 6', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4) });
      idxRow(11, Y3 + 66, false);
      pill(480, 300, 'GET msg → "Hello Redis"', GOOD, pop(u, 1.8), { mono: true, fs: 15 });
      tx(480, 356, '바뀐 5바이트만 보냈다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 5) { const second = u > 1.4; cmdBar(second ? "> APPEND log:2026-05-19 'INFO  bar\\n'" : "> APPEND log:2026-05-19 'ERROR foo\\n'", second ? '(integer) 20' : '(integer) 10', u, second ? 1.4 : 0.15);
      mono(80, Y3 - 14, 'log:2026-05-19', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const A = ['E', 'R', 'R', 'O', 'R', '␣', 'f', 'o', 'o', '\\n'], Bc = ['I', 'N', 'F', 'O', '␣', '␣', 'b', 'a', 'r', '\\n'];
      byteRow(80, Y3, A.concat(Bc), { w: 36, gap: 4, fs: 14, style: (i) => i < 10 ? { s: pop(u, 0.4 + i * 0.05), stroke: BAD, color: BAD } : { s: pop(u, 1.6 + (i - 10) * 0.05), stroke: INFO, color: INFO } });
      tx(80, Y3 + 80, '1번째 줄', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(480, Y3 + 80, '2번째 줄', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(480, 310, '키 하나가 그날의 로그 파일이 된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) });
      sub(480, 344, '값이 커지면 List 로 나누는 편이 낫다', fade(u, 2.3), { 'font-size': 14.5 }); } }

  // ---------- 4. MSET / MGET ----------
  const AX = 110, RX = 850, WY = 140;
  function wire() { el('line', { x1: AX + 60, y1: WY, x2: RX - 66, y2: WY, stroke: GRID, 'stroke-width': 2.5 });
    server(AX, WY, '앱 서버', {}); redisBox(RX, WY, { sub: '실행 0.1ms' });
    sub((AX + RX) / 2, WY + 30, '왕복(RTT) 1ms', 1, { 'font-size': 14 }); }
  function compare(c, names) { const b = c.beat.viz, p = (c.prev && c.prev.viz) || b, u = c.u;
    const st = tween(p.single.time, b.single.time, u), bt = tween(p.batch.time, b.batch.time, u), sc = tween(p.single.count, b.single.count, u), bc = tween(p.batch.count, b.batch.count, u);
    const max = Math.max(st, bt, 1), W = 520, x0 = 300;
    [[names[0], sc, st, BAD], [names[1], bc, bt, GOOD]].forEach(([n, cnt, ms, col], i) => { const y = 286 + i * 58;
      tx(40, y + 6, n, { 'font-size': 15, 'font-weight': 700 }); mono(240, y + 6, Math.round(cnt) + '회', { 'font-size': 15, 'text-anchor': 'end', fill: col, 'font-weight': 700 });
      el('rect', { x: x0, y: y - 12, width: Math.max(4, W * ms / max), height: 24, rx: 5, fill: col, opacity: 0.85 });
      mono(x0 + Math.max(4, W * ms / max) + 10, y + 6, (ms < 10 ? ms.toFixed(ms % 1 ? 1 : 0) : Math.round(ms)) + 'ms', { 'font-size': 15, 'font-weight': 700, fill: col }); });
    tx(x0, 258, 'RTT 횟수 · 걸린 시간', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }); }
  function s4(t, c) { const { k, u } = c; wire();
    if (k === 0) { const p = E(u, 0.2, 2.4), trips = 12, f = p * trips, i = Math.floor(f), ph = f - i, n = Math.round(p * 100);
      if (p > 0 && p < 1) el('circle', { cx: ph < 0.5 ? lerp(AX + 60, RX - 66, ph * 2) : lerp(RX - 66, AX + 60, (ph - 0.5) * 2), cy: WY, r: 7, fill: ph < 0.5 ? ACC : INK });
      pill((AX + RX) / 2, WY - 50, `SET k:${Math.min(n, 99)} v${Math.min(n, 99)}`, BAD, 1, { mono: true, fs: 14.5 });
      mono((AX + RX) / 2, WY + 66, `왕복 ${n} / 100`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      compare(c, ['개별 SET', 'MSET']); }
    if (k === 1) { fly(AX + 60, WY - 56, RX - 190, WY - 56, seg(u, 0.4, 1.4), 'MSET k:0 v0 … k:99 v99  (100쌍)', { mono: true, fill: GOOD, stay: true });
      if (u > 1.4) fly(RX - 70, WY + 4, AX + 70, WY + 4, seg(u, 1.5, 2.2), 'OK', { mono: true, fill: INK });
      mono((AX + RX) / 2, WY + 66, '왕복 1', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) });
      compare(c, ['개별 SET', 'MSET']); }
    if (k === 2) { fly(AX + 60, WY - 40, RX - 70, WY - 40, seg(u, 0.3, 1.1), 'MGET k:0 k:1 … k:99', { mono: true, fill: GOOD });
      const vals = ['v0', 'v1', 'v2', '…', 'v99'], x = lerp(RX - 330, AX + 80, E(u, 1.2, 2.0));
      if (u > 1.2) R.cells(x, WY + 46, vals, { w: 50, h: 34, gap: 4, fs: 14.5 });
      if (u > 1.2) tx(x + 5 * 54 + 10, WY + 69, '순서 그대로', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) });
      pill(700, WY + 63, '없는 키 자리 → None', WARN, pop(u, 2.2), { fs: 14 });
      compare(c, ['개별 호출', 'MSET + MGET']); }
    if (k === 3) { const cmds = ['SET a 1', 'INCR counter', 'EXPIRE a 60'];
      zone(186, 50, 210, 128, 'pipe 버퍼', { stroke: ACC, op: fade(u, 0.1) });
      const go = E(u, 1.2, 2.0);
      cmds.forEach((s, i) => { const y = 92 + i * 30, x = lerp(290, RX - 170, go), sc = pop(u, 0.3 + i * 0.25);
        if (go > 0) card(290, y, 170, 26, { rx: 6, text: s, fs: 14, mono: true, stroke: OFF, color: OFF, dash: '4 4' });
        if (go < 1) card(x, y, 170, 26, { rx: 6, text: s, fs: 14, mono: true, stroke: ACC, color: ACC, s: sc }); });
      if (u > 2.0) R.cells(AX + 70, WY + 46, ['True', 'int', 'True'], { w: 62, h: 30, gap: 4, fs: 14, style: () => ({ s: pop(u, 2.0) }) });
      if (u > 2.0) tx(AX + 280, WY + 67, 'execute() → 결과 3개', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) });
      compare(c, ['명령 3개 따로', '파이프라인']); }
    if (k === 4) { const W = 760, x0 = 120, max = 110, g = E(u, 0.3, 1.6);
      tx(40, 252, '100번 개별', { 'font-size': 15, 'font-weight': 700 });
      const n = Math.round(100 * g); for (let i = 0; i < n; i++) { const x = x0 + 30 + (W - 30) * i / 100, w = (W - 30) / 100;
        el('rect', { x, y: 268, width: w * (1 / 1.1) - 0.5, height: 26, fill: BAD, opacity: 0.85 }); el('rect', { x: x + w * (1 / 1.1) - 0.5, y: 268, width: w * (0.1 / 1.1), height: 26, fill: INK }); }
      mono(x0 + W, 252, '110ms', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.5) });
      tx(40, 336, 'MSET 1번', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      el('rect', { x: x0 + 30, y: 350, width: (W - 30) * 1.1 / max * fade(u, 1.8), height: 26, fill: GOOD });
      mono(x0 + 50, 369, '1.1ms', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
      el('rect', { x: 560, y: 336, width: 18, height: 14, fill: BAD, opacity: fade(u, 2.0) }); tx(584, 348, '왕복 1ms', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) });
      el('rect', { x: 680, y: 336, width: 18, height: 14, fill: INK, opacity: fade(u, 2.0) }); tx(704, 348, '실행 0.1ms', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) });
      banner(480, 395, '차이는 전부 왕복에서 나온다 · 100배', pop(u, 2.2)); } }

  // ---------- 5. 비트맵 ----------
  const bitsOf = (s) => s.replace(/ /g, '').split('');
  const BX = 90, BW = 44, BG = 6, bcx = (i) => BX + i * (BW + BG) + BW / 2;
  function strip(x, y, bits, o) { o = o || {}; const w = o.w || BW, g = o.g ?? BG;
    bits.forEach((b, i) => { const st = (o.style && o.style(i, b)) || {}, on = st.on ?? b === '1';
      card(x + i * (w + g) + w / 2, y + (o.h || 44) / 2, w, o.h || 44, { rx: 6, text: on ? '1' : '0', fs: o.fs || 16, mono: true, fw: 700, fill: on ? (st.fill || ACC) : PANEL, stroke: on ? 'none' : GRID, color: on ? PANEL : OFF, s: st.s, sw: 1.5 }); }); }
  function s5(t, c) { const { k, u } = c, b = c.beat.viz, p = (c.prev && c.prev.viz) || b, bits = bitsOf(b.bits), pb = bitsOf(p.bits);
    const count = (s) => s.filter((x) => x === '1').length;
    if (k <= 2) { mono(BX, 64, 'dau:2026-05-19', { 'font-size': 16, 'font-weight': 700, fill: k === 0 ? ACC : MUT, opacity: k === 0 ? fade(u, 0.3) : 1 });
      strip(BX, 80, bits, { style: (i, x) => ({ on: x === '1' && (pb[i] === '1' || u > 0.6 + i * 0.05), s: x === '1' && pb[i] !== '1' ? pop(u, 0.6 + i * 0.05) : 1 }) });
      for (let i = 0; i < 16; i++) mono(bcx(i), 146, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: k === 0 ? fade(u, 0.6) : 1 }); }
    if (k === 0) { [['키 = 날짜', 'dau:{date}', 0.3], ['offset = user_id', '칸 번호가 곧 사용자 ID', 0.9], ['비트 = 접속 여부', '0 안 함 · 1 접속', 1.5]].forEach(([a, s, at], i) => {
        const x = 170 + i * 310; card(x, 260, 280, 76, { rx: 10, stroke: ACC, s: pop(u, at) });
        tx(x, 252, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, at) }); tx(x, 278, s, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, at) }); });
      tx(480, 360, '세 가지를 정하면 설계 끝', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 1) { grow(bcx(3), 250, bcx(3), 132, E(u, 0.2, 0.6), ACC); person(bcx(3), 286, 'user 3', {});
      mono(bcx(3) + 46, 210, 'SETBIT dau:… 3 1', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      for (let i = 0; i < 4; i++) { const a = 1.3 + i * 0.3; if (u > a && u < a + 0.3) el('circle', { cx: bcx(3), cy: 102, r: 26 + (u - a) * 60, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: 1 - (u - a) / 0.3 }); }
      tx(560, 300, '100번 접속해도 켜진 비트는 하나', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) });
      mono(560, 330, 'BITCOUNT → 1', { 'font-size': 16, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 2) { el('rect', { x: bcx(5) - 28, y: 72, width: 56, height: 60, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 3, opacity: fade(u, 1.2) });
      mono(bcx(5), 200, 'GETBIT … 5 → 1', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      const n = Math.round(lerp(0, b.activeUsers, E(u, 1.5, 2.4)));
      card(680, 300, 260, 84, { rx: 12, stroke: ACC, s: pop(u, 1.5) }); mono(680, 290, 'BITCOUNT', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(680, 322, String(n), { 'font-size': 30, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      tx(260, 300, `켜진 비트 수 = 오늘 접속 ${b.activeUsers}명`, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 3) { tx(240, 56, '비트맵', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC });
      tx(720, 56, 'DB 테이블', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      const g = E(u, 0.3, 1.2); el('rect', { x: 80, y: 120, width: 320 * g, height: 30, rx: 4, fill: ACC });
      mono(240, 190, '1억 bit ÷ 8', { 'font-size': 16, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      mono(240, 230, '= 12.5 MB', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      const rows = Math.round(lerp(0, 9, E(u, 0.8, 2.0)));
      for (let i = 0; i < rows; i++) { el('rect', { x: 600, y: 84 + i * 26, width: 240, height: 22, rx: 3, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); mono(612, 100 + i * 26, `user_id | date`, { 'font-size': 13.5, fill: MUT }); }
      mono(720, 340, '1억 row', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(240, 300, '켜진 사람 수와 상관없이 크기 고정', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) });
      tx(480, 398, 'ID 가 띄엄띄엄하면 최대 offset 만큼 자리를 차지한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.3) }); }
    if (k === 4) { const A = bitsOf('0100 0111 1001 1010'), Bb = bitsOf(p.bits), AND = bits, OR = A.map((x, i) => (x === '1' || Bb[i] === '1' ? '1' : '0'));
      const SX = 230, w = 38, g = 5, row = (y, label, arr, col, at) => { tx(SX - 16, y + 25, label, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: col, opacity: fade(u, at) });
        if (u > at) strip(SX, y, arr, { w, g, h: 36, fs: 15, style: (i, x) => ({ fill: col, s: pop(u, at + i * 0.02) }) }); };
      row(30, 'dau:05-18', A, INK, 0.1); row(80, 'dau:05-19', Bb, INK, 0.3);
      row(160, 'AND  둘 다 접속', AND, ACC, 0.9); row(240, 'OR   WAU', OR, INFO, 1.6);
      mono(SX + 16 * (w + g) - g, 220, 'BITCOUNT → ' + b.activeUsers, { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.3) });
      tx(480, 340, 'BITOP 결과도 비트맵 → 그대로 BITCOUNT', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 5) { const x0 = 80, x1 = 880, y = 190, X = (id) => lerp(x0, x1, id / 99999999);
      el('line', { x1: x0, y1: y, x2: lerp(x0, x1, E(u, 0.1, 0.8)), y2: y, stroke: INK, 'stroke-width': 3 });
      mono(x0, y + 34, '0', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); mono(x1, y + 34, '1억', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      [[42, 0.9, -62], [1234567, 1.3, -26], [99999999, 1.7, -62]].forEach(([id, at, dy], i) => { const x = X(id), s = pop(u, at);
        el('line', { x1: x, y1: y, x2: x, y2: y + dy + 12, stroke: ACC, 'stroke-width': 2, opacity: fade(u, at) });
        el('circle', { cx: x, cy: y, r: 7 * s, fill: ACC });
        mono(i === 2 ? x : x + (i ? 8 : 0), y + dy, String(id), { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': i === 2 ? 'end' : 'start', opacity: fade(u, at) }); });
      card(480, 300, 280, 70, { rx: 12, stroke: ACC, s: pop(u, 2.0) });
      mono(480, 307, 'BITCOUNT → 3', { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      tx(480, 380, 'ID 가 아무리 커도 세는 비용은 같다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: 'SET 뒤에 EXPIRE를 따로 부르는 대신 SETEX(또는 SET … EX)를 쓰는 이유는 무엇인가?',
      o: ['두 명령 사이에 장애가 나면 만료 없는 키가 남기 때문에', 'SETEX가 값을 압축해 저장하기 때문에', 'EXPIRE는 String 키에 쓸 수 없기 때문에'], a: 0,
      why: 'SETEX는 값 저장과 TTL 설정을 한 명령으로 처리한다. 따로 부르면 그 사이 장애로 TTL이 빠진 키가 생긴다.' },
    { q: '1,000명이 동시에 같은 키에 INCR을 보내면 값은 어떻게 되나?',
      o: ['일부 증가가 덮어써져 1,000보다 덜 오를 수 있다', '정확히 1,000만큼 오른다', '락을 걸지 않으면 오류가 난다'], a: 1,
      why: 'Redis는 명령을 하나씩 순서대로 처리해 읽기-더하기-쓰기가 갈라질 틈이 없다. 그래서 INCR은 별도 락 없이도 동시 호출에 안전하다.' },
    { q: 'msg 값이 "Hello World"일 때 GETRANGE msg 0 4의 결과는 무엇인가?',
      o: ['"Hell" — 파이썬 [0:4]처럼 end는 빠진다', '"o" — 4번 바이트 하나만', '"Hello" — end인 4번 바이트까지 포함한다'], a: 2,
      why: 'GETRANGE는 start와 end를 둘 다 포함한다. 0~4번 바이트 다섯 개라 "Hello"가 나온다.' },
    { q: '키 100개를 SET 100번으로 저장하면 110ms, MSET 한 번이면 1.1ms다. 이 차이는 어디서 나오나?',
      o: ['네트워크 왕복 횟수', 'Redis의 명령 실행 속도', '저장하는 값의 크기'], a: 0,
      why: '왕복 1회가 1ms라 개별 SET은 왕복만 100번을 치른다. MSET은 명령 1개, 왕복 1회로 같은 100개를 저장한다.' },
    { q: '사용자 1억 명의 하루 접속 여부를 비트맵 하나로 저장하면 메모리는 얼마인가?',
      o: ['약 100MB', '약 12.5MB', '약 1.25GB'], a: 1,
      why: '1억 비트는 1억/8 바이트 = 12.5MB다. 사용자당 비트 하나라 같은 사람이 100번 접속해도 늘지 않는다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'String은 최대 512MB 값을 담는 가장 단순한 타입이다. 텍스트, JSON, 바이너리 모두 들어간다.',
    'INCR은 명령이 하나씩 처리되어 1,000명이 동시에 불러도 숫자가 정확히 오른다.',
    '키 100개를 하나씩 넣으면 왕복 100번에 110ms가 든다. MSET으로 묶으면 1.1ms다.',
    '비트맵을 쓰면 사용자 1억 명의 하루 접속을 12.5MB에 담고 BITCOUNT로 바로 센다.',
  ];
  const review = [
    { q: 'API 호출 수를 INCR로 세어 1분 단위로 제한한다. 카운터 창이 1분마다 새로 열리려면 TTL은 언제 거나?',
      o: ['INCR 결과가 1일 때만 EXPIRE 60', '매번 INCR 뒤에 EXPIRE 60', '처음 한 번 PERSIST를 건다'], a: 0,
      why: '매번 EXPIRE를 걸면 호출이 이어지는 동안 창이 계속 뒤로 밀린다. 첫 호출인 1일 때만 걸어야 60초 뒤 키가 사라지고 새 창이 열린다.' },
    { q: '재고 키에 DECR을 계속 걸었더니 -3이 나왔다. 가장 맞는 설명은?',
      o: ['DECR이 원자적이지 않아 값이 꼬였다', '값이 정수가 아니라 오류가 난 결과다', 'DECR은 음수도 허용해 0 아래로 내려간다'], a: 2,
      why: 'DECR은 원자적으로 줄이지만 0에서 멈추지 않는다. 음수를 막으려면 Lua 스크립트나 조건 검사를 직접 넣는다.' },
    { q: '사용자 ID가 UUID인 서비스에서 DAU를 비트맵으로 세려 한다. 먼저 필요한 것은?',
      o: ['BITOP OR로 날짜별 비트맵을 합친다', 'UUID를 연속된 정수 ID에 매핑한다', 'UUID 문자열을 그대로 offset으로 쓴다'], a: 1,
      why: 'offset이 사용자 ID라서 연속된 정수여야 한다. ID가 띄엄띄엄하면 최대 offset만큼 자리를 차지해 메모리 이득이 사라진다.' },
  ];

  R.page({ title: 'Redis String 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
