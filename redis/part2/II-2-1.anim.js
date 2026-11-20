/* II-2-1 Hash — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, redisBox, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 공통 ----------
  function cmdBar(cmds, u) { const cur = cmds.filter((c) => u >= c[0]).pop() || cmds[0], op = fade(u, cmds[0][0], 0.3);
    el('rect', { x: 24, y: 20, width: 912, height: 46, rx: 10, fill: INK, opacity: op });
    const s = cur[1], n = Math.round(s.length * clamp((u - cur[0]) / 0.35));
    mono(44, 49, '> ' + s.slice(0, Math.max(n, u >= cur[0] ? 1 : 0)), { 'font-size': 16, fill: PANEL, 'font-weight': 700, opacity: op });
    if (cur[2]) mono(916, 49, cur[2], { 'font-size': 16, fill: 'var(--term)', 'text-anchor': 'end', opacity: fade(u, cur[0] + 0.4, 0.2) }); }
  // Hash 하나: 머리(키 이름) + 필드/값 줄. rows: [{f, v, op, hl, gone, col, dash}]
  const RH = 40;
  function hashCard(x, y, w, key, rows, o) { o = o || {}; const fw = o.fw || 130, h = 46 + RH * rows.length + 8, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: PANEL, stroke: o.stroke || ACC, 'stroke-width': 2.5, opacity: op });
    el('rect', { x, y, width: w, height: 40, rx: 12, fill: ACCBG, opacity: op });
    mono(x + 16, y + 26, key, { 'font-size': 16, 'font-weight': 800, fill: o.stroke || ACC, opacity: op });
    mono(x + w - 14, y + 26, 'hash', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op });
    rows.forEach((r, i) => { const yy = y + 46 + i * RH, rop = (r.op ?? 1) * op, col = r.gone ? OFF : r.col || INK;
      if (r.hl) el('rect', { x: x + 6, y: yy + 2, width: w - 12, height: RH - 4, rx: 6, fill: r.hlFill || 'var(--hl)', opacity: 0.55 * rop });
      if (r.dash) el('rect', { x: x + 8, y: yy + 3, width: w - 16, height: RH - 6, rx: 6, fill: 'none', stroke: OFF, 'stroke-width': 1.8, 'stroke-dasharray': '5 5', opacity: rop });
      mono(x + 18, yy + 25, r.f, { 'font-size': 15, 'font-weight': 700, fill: r.gone ? OFF : MUT, opacity: rop, 'text-decoration': r.gone ? 'line-through' : null });
      mono(x + fw, yy + 25, r.v, { 'font-size': 15, fill: col, 'font-weight': r.hl ? 700 : 400, opacity: rop, 'text-decoration': r.gone ? 'line-through' : null });
      if (i < rows.length - 1) el('line', { x1: x + 12, y1: yy + RH, x2: x + w - 12, y2: yy + RH, stroke: GRID, 'stroke-width': 1, opacity: rop }); });
    return { h, rowY: (i) => y + 46 + i * RH + RH / 2 }; }
  // 왕복 횟수 점: n 개의 RTT 를 차례로
  function rtts(x1, x2, y, n, u, a, b, col) { for (let i = 0; i < n; i++) { const s = seg(u, a + (b - a) * i / n, a + (b - a) * (i + 1) / n);
      if (s > 0 && s < 1) el('circle', { cx: s < 0.5 ? lerp(x1, x2, s * 2) : lerp(x2, x1, (s - 0.5) * 2), cy: y, r: 7, fill: col || ACC }); } }

  // ---------- 1. HSET / HGET ----------
  const U1 = [['name', '"Alice"'], ['email', '"alice@example.com"'], ['age', '"30"']];
  const HX = 60, HY = 100, HW = 400;
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const at = [0.3, 0.9, 1.5];
      cmdBar([[0.3, 'HSET user:1 name Alice', '(integer) 1'], [0.9, 'HSET user:1 email alice@example.com', '(integer) 1'], [1.5, 'HSET user:1 age 30', '(integer) 1']], u);
      hashCard(HX, HY, HW, 'user:1', U1.map(([f, v], i) => ({ f, v, op: fade(u, at[i] + 0.2, 0.3), hl: u > at[i] && u < at[i] + 0.7 })));
      U1.forEach(([f], i) => fly(760, 120 + i * 40, HX + 60, HY + 66 + i * RH, seg(u, at[i], at[i] + 0.4), f, { mono: true }));
      tx(700, 300, '키는 하나, 그 안에 필드가 쌓인다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 1) { const second = u > 1.4;
      cmdBar([[0.3, 'HGET user:1 name', '"Alice"'], [1.4, 'HGET user:1 email', '"alice@example.com"']], u);
      const hc = hashCard(HX, HY, HW, 'user:1', U1.map(([f, v], i) => ({ f, v, hl: (i === 0 && !second && u > 0.5) || (i === 1 && second) })));
      fly(HX + HW, hc.rowY(0), 720, 140, seg(u, 0.6, 1.2), '"Alice"', { mono: true, stay: true });
      fly(HX + HW, hc.rowY(1), 720, 186, seg(u, 1.6, 2.2), '"alice@example.com"', { mono: true, stay: true });
      tx(720, 250, '원하는 필드 하나만 네트워크를 탄다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) });
      tx(720, 330, 'String + JSON 이면', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) });
      tx(720, 356, '한 필드를 보려 해도 전체를 받는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 2) { cmdBar([[0.3, 'HGETALL user:1', '6줄']], u);
      const hc = hashCard(HX, HY, HW, 'user:1', U1.map(([f, v], i) => ({ f, v, hl: u > 0.5, col: i === 2 ? WARN : INK })));
      U1.forEach(([f, v], i) => fly(HX + HW, hc.rowY(i), 700, 130 + i * 42, seg(u, 0.6 + i * 0.25, 1.2 + i * 0.25), `"${f}": ${v === '"alice@example.com"' ? '"alice@..."' : v}`, { mono: true, stay: true, fill: i === 2 ? WARN : ACC }));
      tx(700, 290, '숫자 30 도 문자열 "30" 으로 온다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) });
      pill(700, 340, 'O(N) · 필드 수만큼 실어 온다', WARN, pop(u, 2.3), { fs: 14.5 }); }
    if (k === 3) { const second = u > 1.4;
      cmdBar([[0.3, 'HEXISTS user:1 email', '(integer) 1'], [1.4, 'HEXISTS user:1 phone', '(integer) 0']], u);
      const rows = U1.map(([f, v], i) => ({ f, v, hl: i === 1 && u > 0.5 && !second, hlFill: 'var(--goodbg)' })).concat([{ f: 'phone', v: '(없음)', dash: true, gone: true, op: fade(u, 1.5) }]);
      const hc = hashCard(HX, HY, HW, 'user:1', rows);
      check(HX + HW + 40, hc.rowY(1), 11, pop(u, 0.7)); mono(HX + HW + 64, hc.rowY(1) + 6, '1', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.7) });
      cross(HX + HW + 40, hc.rowY(3), 10, pop(u, 1.8)); mono(HX + HW + 64, hc.rowY(3) + 6, '0', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      tx(720, 340, '값은 가져오지 않고 있는지만 답한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 4) { cmdBar([[0.3, 'HDEL user:1 age', '(integer) 1'], [1.4, 'HLEN user:1', '(integer) 2']], u);
      const g = E(u, 0.8, 1.3);
      hashCard(HX, HY, HW, 'user:1', U1.map(([f, v], i) => (i === 2 ? { f, v, gone: u > 0.5, op: 1 - g } : { f, v })));
      const n = u > 1.4 ? 2 : 3; card(720, 150, 170, 70, { rx: 12, stroke: u > 1.4 ? ACC : GRID, s: 1 + bump(u, 1.4) });
      mono(720, 140, 'HLEN', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); mono(720, 170, String(n), { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      tx(720, 260, '세지 않고 저장된 개수를 읽는다 → O(1)', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(720, 300, '마지막 필드까지 지우면 키도 사라진다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 5) { const rows = U1.map(([f, v]) => ({ f, v })); const hc = hashCard(HX, 50, HW, 'user:1', rows);
      [['HSET', 0, 0.3], ['HGET', 1, 0.6], ['HDEL', 2, 0.9]].forEach(([cmd, i, at]) => { pill(HX + HW + 70, hc.rowY(i), cmd, GOOD, pop(u, at), { mono: true, fs: 14.5 }); grow(HX + HW + 32, hc.rowY(i), HX + HW + 4, hc.rowY(i), E(u, at, at + 0.3), GOOD); });
      mono(HX + HW + 130, hc.rowY(1) + 6, 'O(1) · 필드 하나만 만진다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
      const sy = 250, scan = E(u, 1.4, 2.4);
      for (let i = 0; i < 12; i++) el('rect', { x: HX + 10 + i * 34, y: sy, width: 28, height: 28, rx: 4, fill: i / 12 < scan ? WARN : SOFT, opacity: 0.85 });
      tx(HX + 12 * 34 + 24, sy + 20, '…', { 'font-size': 18, fill: MUT });
      pill(HX + 560, sy + 14, 'HGETALL → O(N)', WARN, pop(u, 1.4), { mono: true, fs: 14.5 });
      tx(HX, 330, '필드가 1000개를 넘으면 객체를 나눌지 고민한다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.3) }); } }

  // ---------- 2. 여러 필드 한 번에 ----------
  const PX = 60, PY = 100, PW = 380;
  function prod(c, o) { o = o || {}; return hashCard(PX, PY, PW, 'product:42', c.beat.viz.fields.map((f, i) => ({ f: f.name, v: f.name === 'title' || f.name === 'category' ? `"${f.value}"` : `"${f.value}"`, op: o.op ? o.op(i) : 1, hl: o.hl ? o.hl(i, f) : false, col: o.col ? o.col(i, f) : INK })), { fw: 140, op: o.cardOp }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { cmdBar([[0.3, 'HSET product:42 title Notebook price 1200 stock 50 category tech', '(integer) 4']], u);
      card(760, 150, 300, 150, { rx: 10, s: pop(u, 0.2) });
      ['mapping={', '  "title": "Notebook",', '  "price": 1200,', '  "stock": 50,', '  "category": "tech" }'].forEach((s, i) => mono(624, 104 + i * 24, s, { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.08) }));
      fly(610, 150, PX + PW - 40, 160, seg(u, 0.9, 1.5), '명령 1개 · 왕복 1회', { stay: false });
      prod(c, { op: (i) => fade(u, 1.5, 0.3), hl: () => u > 1.5 && u < 2.2 });
      pill(760, 300, 'RTT 1회', GOOD, pop(u, 1.9), { mono: true, fs: 15 });
      tx(PX, 340, 'redis-py 3.0+ : hmset 대신 hset(mapping=)', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 1) { cmdBar([[0.3, 'HMGET product:42 title price', '"Notebook" "1200"'], [1.7, 'HGETALL product:42', '8줄']], u);
      const all = u > 1.7, hc = prod(c, { hl: (i, f) => (all ? u > 1.9 : f.selected && u > 0.5), col: (i, f) => (!all && !f.selected ? OFF : INK) });
      R.cells(560, 140, ['"Notebook"', '"1200"'], { w: 140, h: 40, gap: 8, fs: 15, style: (i) => ({ s: pop(u, 0.8 + i * 0.2), stroke: ACC, color: ACC }) });
      tx(560, 124, 'HMGET → 요청 순서대로', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
      if (all) { R.cells(560, 240, ['title', 'Notebook', 'price', '1200', '…'], { w: 70, h: 34, gap: 4, fs: 13.5, style: (i) => ({ s: pop(u, 1.9 + i * 0.08), stroke: WARN, color: WARN }) });
        tx(560, 226, 'HGETALL → 전부 실어 온다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) }); }
      tx(560, 330, 'stock · category 는 전송되지 않았다', { 'font-size': 15, fill: MUT, opacity: u < 1.7 ? fade(u, 1.2) : 0 }); }
    if (k === 2) { cmdBar([[0.3, 'HKEYS product:42', '4개'], [1.4, 'HVALS product:42', '4개']], u);
      const f = c.beat.viz.fields;
      prod(c, { op: () => 0.35 });
      f.forEach((x, i) => { const y = PY + 66 + i * RH, a = E(u, 0.5 + i * 0.1, 1.0 + i * 0.1), b = E(u, 1.6 + i * 0.1, 2.1 + i * 0.1);
        mono(lerp(PX + 18, 520, a), y, x.name, { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: a > 0 ? 1 : 0 });
        mono(lerp(PX + 140, 720, b), y, `"${x.value}"`, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: b > 0 ? 1 : 0 }); });
      lbl(560, 120, 'HKEYS', fade(u, 0.5), { fill: INFO }); lbl(770, 120, 'HVALS', fade(u, 1.6), { fill: ACC });
      tx(480, 360, '둘 다 O(N) · 필드가 많으면 HSCAN 으로 나눠 읽는다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.3) }); }
    if (k === 3) { cmdBar([[0.3, 'SET product:42:title "Notebook"', 'OK'], [0.9, 'SET product:42:price 1200', 'OK'], [1.5, 'SET product:42:stock 50', 'OK']], u);
      const ks = c.beat.viz.fields.slice(0, 3), pos = [[200, 140], [480, 230], [230, 320]];
      ks.forEach((x, i) => { const at = 0.3 + i * 0.6; card(pos[i][0], pos[i][1], 260, 48, { rx: 8, text: `${x.name} = "${x.value}"`, fs: 14.5, mono: true, stroke: WARN, s: pop(u, at + 0.3) }); });
      server(820, 160, '앱 서버', { s: 0.8 });
      rtts(560, 760, 110, 3, u, 0.3, 2.1, WARN);
      const n = u < 0.3 ? 0 : Math.min(3, Math.floor((u - 0.3) / 0.6) + 1);
      mono(820, 290, `RTT ${n}회`, { 'font-size': 20, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      tx(820, 330, '키 3개로 흩어진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
      tx(820, 356, '만료·삭제도 따로', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.4) }); }
    if (k === 4) { cmdBar([[0.3, 'HSET product:42 title Notebook price 1200 stock 50', '(integer) 3']], u);
      const ks = [['title', 'Notebook'], ['price', '1200'], ['stock', '50']], from = [[200, 140], [480, 230], [230, 320]], g = E(u, 0.4, 1.4);
      if (g < 1) ks.forEach(([f, v], i) => card(lerp(from[i][0], PX + PW / 2, g), lerp(from[i][1], PY + 66 + i * RH, g), 260, 48, { rx: 8, text: `product:42:${f}`, fs: 14.5, mono: true, stroke: WARN, op: 1 - g }));
      if (g >= 1) hashCard(PX, PY, PW, 'product:42', ks.map(([f, v]) => ({ f, v: `"${v}"`, op: fade(u, 1.4, 0.3) })), { fw: 140 });
      server(820, 160, '앱 서버', { s: 0.8 }); rtts(560, 760, 110, 1, u, 1.5, 2.1, GOOD);
      mono(820, 290, u > 1.5 ? 'RTT 1회' : 'RTT 3회', { 'font-size': 20, 'font-weight': 800, fill: u > 1.5 ? GOOD : BAD, 'text-anchor': 'middle' });
      tx(820, 330, '키 3개 → 1개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); } }

  // ---------- 3. HINCRBY ----------
  const CF = ['views', 'likes', 'comments', 'avg_rating'];
  function cval(b, f) { const x = (b.viz.fields || []).find((y) => y.name === f); return x ? x.value : null; }
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || b;
    // 카운터 판 4개 (avg_rating 은 생긴 다음부터)
    const ratingOn = k >= 3;
    const keep = {};
    CF.forEach((f) => { let v = cval(b, f); if (v == null) { for (let j = k; j >= 0; j--) { const s = c.steps[j], vv = cval(s, f); if (vv != null) { v = vv; break; } } } keep[f] = v; });
    const pv = {}; CF.forEach((f) => { let v = c.prev ? cval(p, f) : null; if (v == null && c.prev) { for (let j = k - 1; j >= 0; j--) { const vv = cval(c.steps[j], f); if (vv != null) { v = vv; break; } } } pv[f] = v; });
    const touched = { 1: ['views'], 2: ['likes'], 3: ['avg_rating'], 4: ['views', 'likes', 'comments'], 5: [] }[k] || [];
    mono(60, 108, 'post:42', { 'font-size': 17, 'font-weight': 800, fill: ACC });
    mono(170, 108, 'title = "Redis 입문"', { 'font-size': 15, fill: MUT });
    CF.forEach((f, i) => { if (f === 'avg_rating' && !ratingOn) return; const x = 60 + i * 222, on = touched.includes(f), appear = f === 'avg_rating' && k === 3 ? pop(u, 0.4) : 1;
      let v = keep[f]; if (k === 2 && f === 'likes') v = u < 0.9 ? lerp(0, 88, E(u, 0.3, 0.8)) : u < 1.6 ? 88 : lerp(88, 87, E(u, 1.6, 1.9));
      else if (pv[f] != null && typeof v === 'number') v = tween(pv[f], v, u);
      const g = R.G(x + 100, 190, appear);
      el('rect', { x: -100, y: -62, width: 200, height: 124, rx: 12, fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, 'stroke-width': on ? 2.5 : 1.5 }, g);
      mono(0, -32, f, { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }, g);
      const txt = f === 'avg_rating' ? (+v).toFixed(1) : Math.round(v).toLocaleString('en-US');
      mono(0, 18, txt, { 'font-size': 32, 'font-weight': 800, fill: on ? ACC : INK, 'text-anchor': 'middle' }, g); });
    if (k === 0) { cmdBar([[0.3, 'HSET post:42 title "Redis 입문" views 0 likes 0 comments 0', '(integer) 4']], u);
      tx(480, 320, '게시글 하나 = 키 하나, 카운터는 그 안의 필드', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(480, 352, '없는 필드는 0 으로 보고 시작하므로 초기화는 선택', fade(u, 2.2), { 'font-size': 15 }); }
    if (k === 1) { cmdBar([[0.3, 'HINCRBY post:42 views 1', '(integer) 1543']], u);
      for (let i = 0; i < 10; i++) dot([[60 + 100 + (i - 5) * 40, 360], [160, 260]], ((t * 0.9 + i / 10) % 1), ACC, 5);
      tx(560, 330, '필드 하나만 원자적으로 증가', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(560, 358, '다른 필드는 그대로 · 증가 후 값을 바로 돌려준다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 2) { cmdBar([[0.3, 'HINCRBY post:42 likes 1', '(integer) 88'], [1.6, 'HINCRBY post:42 likes -1', '(integer) 87']], u);
      pill(382, 300, '+1 좋아요', GOOD, pop(u, 0.3), { mono: true, fs: 14.5 }); pill(382, 344, '-1 취소', BAD, pop(u, 1.6), { mono: true, fs: 14.5 });
      tx(560, 330, '음수를 넘기면 감소', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 3) { cmdBar([[0.3, 'HINCRBYFLOAT post:42 avg_rating 0.1', '"0.1"']], u);
      tx(60, 330, '없던 필드 avg_rating 이 이 순간 생긴다', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      tx(60, 360, '실수는 오차가 쌓인다 → 정밀도가 중요하면 정수로 환산', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) { cmdBar([[0.3, 'HMGET post:42 views likes comments', '"1543" "87" "12"']], u);
      R.cells(240, 310, ['"1543"', '"87"', '"12"'], { w: 110, h: 40, gap: 10, fs: 16, style: (i) => ({ s: pop(u, 1.0 + i * 0.15), stroke: ACC, color: ACC }) });
      tx(240, 300, '한 왕복 · 요청 순서대로 · 전부 문자열', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(620, 336, '→ int() 로 바꿔 쓴다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 5) { el('rect', { x: 0, y: 262, width: 960, height: 158, fill: PANEL });
      tx(170, 288, 'String: 키 3개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
      ['post:42:views', 'post:42:likes', 'post:42:comments'].forEach((s, i) => card(170, 316 + i * 36, 230, 30, { rx: 6, text: s, fs: 14, mono: true, stroke: WARN, s: pop(u, 0.3 + i * 0.15) }));
      grow(296, 352, 410, 352, E(u, 1.0, 1.4), ACC);
      card(600, 352, 350, 52, { rx: 10, text: 'post:42 { views, likes, comments }', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.4) });
      tx(600, 300, 'Hash: 키 1개 · 메모리 약 40% 절약', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) }); } }

  // ---------- 4. 객체 매핑 ----------
  const OX = 60, OY = 96, OW = 300, HX4 = 560, HW4 = 360;
  function model(o) { o = o || {}; const op = o.op ?? 1, rows = o.rows || [['id', 'int'], ['name', 'str'], ['email', 'str'], ['age', 'int']];
    el('rect', { x: OX, y: OY, width: OW, height: 46 + rows.length * 36 + 8, rx: 12, fill: PANEL, stroke: o.stroke || INFO, 'stroke-width': 2.5, opacity: op });
    mono(OX + 16, OY + 28, o.title || 'class User(BaseModel)', { 'font-size': 15, 'font-weight': 800, fill: o.stroke || INFO, opacity: op });
    rows.forEach(([a, b, col], i) => mono(OX + 28, OY + 70 + i * 36, `${a}: ${b}`, { 'font-size': 15, fill: col || INK, opacity: op * (o.rowOp ? o.rowOp(i) : 1) })); }
  const UV = [['id', '"1"'], ['name', '"Alice"'], ['email', '"a@b.com"'], ['age', '"30"']];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { model({ rowOp: (i) => fade(u, 0.4 + i * 0.3) }); grow(OX + OW + 20, OY + 110, HX4 - 20, OY + 110, E(u, 1.8, 2.2), MUT, { dash: '6 5' });
      tx(HX4 + 10, OY + 116, '이 이름이 그대로 Hash 필드가 된다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 1) { model({ title: 'User(id=1, name="Alice", …)', rows: [['id', '1'], ['name', '"Alice"'], ['email', '"a@b.com"'], ['age', '30']] });
      grow(OX + OW + 20, OY + 110, HX4 - 20, OY + 110, E(u, 0.4, 0.9), ACC); mono((OX + OW + HX4) / 2, OY + 98, 'model_dump()', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      hashCard(HX4, OY, HW4, 'user:1', UV.map(([f, v], i) => ({ f, v, op: fade(u, 1.0 + i * 0.15, 0.25) })), { fw: 120 });
      mono(OX, 340, 'r.hset(f"user:{user.id}", mapping=user.model_dump())', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      tx(OX, 372, '중첩 dict · list 필드는 JSON 문자열로 바꿔 넣는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 2) { const life = E(u, 0.9, 1.9);
      cmdBar([[0.3, 'EXPIRE user:1 600', '(integer) 1'], [2.0, 'HEXPIRE user:1 600 FIELDS 1 email', '1) (integer) 1']], u);
      hashCard(OX, 96, 300, 'user:1', UV.map(([f, v]) => ({ f, v, op: 1 - life * 0.75 })), { fw: 100, stroke: u > 0.9 ? WARN : ACC });
      clock(OX + 380, 170, 28, life, WARN, 'TTL 600');
      tx(OX, 342, 'EXPIRE 는 키 단위', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) });
      tx(OX, 370, '시간이 되면 필드 4개가 함께 사라진다', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.4) });
      hashCard(560, 96, 340, 'user:1', UV.map(([f, v], i) => ({ f, v, gone: i === 2 && u > 2.5, hl: i === 2 && u > 2.0, hlFill: 'var(--warnbg)' })), { fw: 100, op: fade(u, 2.0) });
      tx(560, 342, 'HEXPIRE (7.4+)', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 2.1) });
      tx(560, 370, 'email 필드 하나만 만료', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 2.3) }); }
    if (k === 3) { cmdBar([[0.3, 'HGETALL user:1', '8줄'], [1.8, 'HGETALL user:{없는 id}', '(empty array)']], u);
      const hc = hashCard(OX, OY, 340, 'user:1', UV.map(([f, v]) => ({ f, v, hl: u > 0.5 && u < 1.8 })), { fw: 110 });
      card(700, 150, 300, 44, { rx: 8, text: "{'id': '1', 'age': '30', …}", fs: 14.5, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.9) });
      tx(700, 200, '전부 문자열', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.1) });
      card(620, 290, 90, 44, { rx: 8, text: '{}', fs: 18, mono: true, s: pop(u, 2.0) }); grow(670, 290, 720, 290, E(u, 2.1, 2.3), MUT);
      card(790, 290, 110, 44, { rx: 8, text: 'None', fs: 16, mono: true, stroke: INFO, color: INFO, s: pop(u, 2.3) });
      tx(700, 350, '없는 키는 에러가 아니라 빈 dict', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.4) }); }
    if (k === 4) { hashCard(OX, OY, 300, 'user:1', UV.map(([f, v], i) => ({ f, v, col: i === 0 || i === 3 ? WARN : INK })), { fw: 100 });
      [['"1"', '1', 0], ['"30"', '30', 3]].forEach(([a, b2, i], n) => { const y = OY + 66 + i * RH, at = 0.4 + n * 0.6;
        grow(OX + 320, y - 5, 540, y - 5, E(u, at, at + 0.4), ACC); mono(430, y - 14, 'int()', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, at) }); });
      el('rect', { x: 560, y: OY, width: 340, height: 46 + 4 * 36 + 8, rx: 12, fill: PANEL, stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 1.6) });
      mono(576, OY + 28, 'User 복원', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      [['id', '1'], ['name', '"Alice"'], ['email', '"a@b.com"'], ['age', '30']].forEach(([a, b2], i) => mono(588, OY + 70 + i * 36, `${a} = ${b2}`, { 'font-size': 15, fill: i === 0 || i === 3 ? ACC : INK, 'font-weight': i === 0 || i === 3 ? 700 : 400, opacity: fade(u, 1.7 + i * 0.1) }));
      tx(480, 370, '캐스팅을 잊으면 "30" 인 채로 조용히 틀린다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.3) }); }
    if (k === 5) { cmdBar([[0.3, 'HSET user:1 email alice@new.com', '(integer) 0']], u);
      hashCard(OX, OY, 380, 'user:1  (Hash)', UV.map(([f, v], i) => (i === 2 ? { f, v: u > 0.9 ? '"alice@new.com"' : v, hl: u > 0.9, col: u > 0.9 ? ACC : INK } : { f, v })), { fw: 110 });
      fly(500, OY + 66 + 2 * RH, OX + 200, OY + 66 + 2 * RH, seg(u, 0.4, 0.9), 'email', { mono: true });
      tx(OX, 330, '바뀐 필드 하나만 보낸다', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.1) });
      el('rect', { x: 520, y: OY, width: 380, height: 90, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.4) });
      mono(536, OY + 28, 'user:1:json  (String)', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4) });
      const re = E(u, 1.7, 2.4); el('rect', { x: 536, y: OY + 46, width: 348 * re, height: 28, rx: 5, fill: WARN, opacity: 0.35 });
      mono(546, OY + 66, '{"id": 1, "name": …, "email": …}', { 'font-size': 14, opacity: fade(u, 1.5) });
      tx(520, 330, 'JSON 이면 전체를 다시 쓴다', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.2) }); }
    if (k === 6) { const steps = [['save_user(User(id=1, …))', 'HSET user:1 …', 0.3], ['user = load_user(1)', 'HGETALL user:1', 1.0], ['update_email(1, "alice@new.com")', 'HSET user:1 email …', 1.7]];
      steps.forEach(([py, cmd, at], i) => { const y = 120 + i * 90, s = pop(u, at);
        card(260, y, 400, 54, { rx: 10, text: py, fs: 14.5, mono: true, stroke: INFO, s }); grow(470, y, 560, y, E(u, at + 0.2, at + 0.5), ACC);
        card(720, y, 300, 54, { rx: 10, text: cmd, fs: 14.5, mono: true, stroke: ACC, color: ACC, s: pop(u, at + 0.4) }); });
      tx(480, 398, '앱 코드는 Redis 를 거의 의식하지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.3) }); } }

  // ---------- 5. String vs Hash 메모리 ----------
  const MAXB = 280, BX = 380, BWID = 440;
  function bars(c, n, u) { const rows = c.beat.viz.rows || [], prev = (c.prev && c.prev.viz.rows) || [];
    const lane = [['① String JSON', BAD], ['② String 분할', WARN], ['③ Hash', GOOD]];
    lane.forEach(([name, col], i) => { const y = 250 + i * 54, r = rows.find((x) => x.method === name.slice(2)), pr = prev.find((x) => x.method === name.slice(2));
      tx(60, y + 6, name, { 'font-size': 16, 'font-weight': 700, fill: r ? INK : OFF });
      el('rect', { x: BX, y: y - 14, width: BWID, height: 28, rx: 5, fill: SOFT });
      if (!r) return; const v = tween(pr ? pr.memory : 0, r.memory, u);
      el('rect', { x: BX, y: y - 14, width: BWID * v / MAXB, height: 28, rx: 5, fill: col, opacity: 0.85 });
      mono(BX + BWID * v / MAXB + 10, y + 6, `약 ${Math.round(v)} B`, { 'font-size': 16, 'font-weight': 800, fill: col }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 110, 620, 52, { rx: 10, text: 'user = {"id": 1, "name": "Alice", "email": "a@b.com", "age": 30}', fs: 15, mono: true, s: pop(u, 0.3) });
      ['①', '②', '③'].forEach((s, i) => { grow(480, 140, 200 + i * 280, 200, E(u, 0.9 + i * 0.25, 1.3 + i * 0.25), MUT); });
      [['String JSON'], ['String 분할'], ['Hash']].forEach(([s], i) => lbl(200 + i * 280, 226, ['①', '②', '③'][i] + ' ' + s, fade(u, 1.2 + i * 0.25)));
      tx(480, 320, '같은 객체를 세 방식으로 저장해 메모리를 잰다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(480, 352, '값보다 키 개수와 오버헤드에서 크게 갈린다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 1) { card(320, 110, 520, 50, { rx: 8, text: 'user:1:json → \'{"id": 1, "name": "Alice", …}\'', fs: 15, mono: true, stroke: BAD, s: pop(u, 0.3) });
      tx(620, 116, '필드 이름까지 문자 그대로 담는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
      tx(60, 190, '부분 수정 불가 · 고치려면 전체를 다시 쓴다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
    if (k === 2) { ['user:1:id', 'user:1:name', 'user:1:email', 'user:1:age'].forEach((s, i) => card(140 + i * 225, 110, 205, 44, { rx: 8, text: s, fs: 14.5, mono: true, stroke: WARN, s: pop(u, 0.3 + i * 0.15) }));
      tx(60, 190, '키 4개로 흩어지고 조회에 왕복 4번', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.3) }); }
    if (k === 3 || k === 4) { const flat = ['id', '1', 'name', 'Alice', 'email', 'a@b.com', 'age', '30'], xs = [];
      let x = 60; flat.forEach((s) => { const w = tw(s, 15) + 22; xs.push([x, w]); x += w + 3; });
      mono(60, 92, 'user:1  (listpack)', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      flat.forEach((s, i) => { const [x0, w] = xs[i]; card(x0 + w / 2, 124, w, 38, { rx: 4, text: s, fs: 15, mono: true, fill: i % 2 ? PANEL : SOFT, stroke: GOOD, sw: 1.5, s: k === 3 ? pop(u, 0.3 + i * 0.08) : 1 }); });
      if (k === 3) tx(60, 190, '작은 Hash 는 납작한 한 덩어리 · 포인터가 없다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.3) }); }
    if (k === 4) { cmdBar([[0.2, 'OBJECT ENCODING user:1', '"listpack"']], u);
      el('rect', { x: 0, y: 160, width: 960, height: 260, fill: PANEL });
      [['필드 수 > 128', 'hash-max-listpack-entries'], ['값 하나 > 64바이트', 'hash-max-listpack-value']].forEach(([a, b2], i) => { const y = 200 + i * 66;
        card(220, y, 330, 54, { rx: 10, stroke: WARN, s: pop(u, 0.6 + i * 0.3) }); tx(220, y - 4, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.7 + i * 0.3) });
        mono(220, y + 18, b2, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.7 + i * 0.3) }); });
      tx(220, 320, '둘 중 하나라도 넘으면', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.3) });
      grow(400, 233, 520, 233, E(u, 1.4, 1.8), WARN);
      const hx = 560; mono(hx, 196, 'hashtable', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.7) });
      for (let i = 0; i < 6; i++) { const y = 210 + i * 28, on = i % 2 === 0; el('rect', { x: hx, y, width: 40, height: 22, rx: 3, fill: PANEL, stroke: INK, 'stroke-width': 1.5, opacity: fade(u, 1.8 + i * 0.05) });
        if (on) { grow(hx + 42, y + 11, hx + 90, y + 11, E(u, 2.0, 2.3), MUT); card(hx + 140, y + 11, 90, 22, { rx: 4, text: i === 0 ? 'name' : i === 2 ? 'email' : 'age', fs: 13.5, mono: true, sw: 1.5, s: pop(u, 2.2) }); } }
      tx(770, 290, '버킷 + 포인터', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); tx(770, 316, '메모리 이득이 줄어든다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.4) });
      tx(220, 390, 'OBJECT ENCODING 으로 확인', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.4) }); return; }
    if (k === 5) { R.terminal(60, 80, 520, 130, ['> MEMORY USAGE user:1', '(integer) …', '> MEMORY USAGE user:1:json', '(integer) …'], clamp((u - 0.2) / 0.3, 0, 4), { title: 'redis-cli', fs: 15 });
      tx(620, 130, '추측하지 말고 잰다', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.4) });
      tx(620, 160, '버전·설정·값 크기에 따라 달라진다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 6) { const G4 = [['객체 (속성 < 100개)', 'Hash', GOOD], ['단일 값 · 계산 결과', 'String', INFO], ['자주 변하는 숫자 필드', 'Hash + HINCRBY', GOOD], ['큰 JSON 통째 캐시', 'String', INFO]];
      G4.forEach(([a, b2, col], i) => { const x = 130 + (i % 2) * 470, y = 120 + Math.floor(i / 2) * 120, s = pop(u, 0.3 + i * 0.3);
        card(x + 120, y, 420, 84, { rx: 12, stroke: col, s }); tx(x - 70, y - 8, a, { 'font-size': 15.5, fill: MUT, 'font-weight': 600, opacity: fade(u, 0.4 + i * 0.3) });
        mono(x - 70, y + 22, '→ ' + b2, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.5 + i * 0.3) }); });
      tx(480, 380, '속성이 있는 객체는 Hash, 통째로 쓰는 값은 String', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    bars(c, 3, u); }

  R.page({ title: 'Redis Hash 들여다보기', scenes: [s1, s2, s3, s4, s5] });
})();
