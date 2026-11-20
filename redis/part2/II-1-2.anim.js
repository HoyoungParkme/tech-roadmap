/* II-1-2 List — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, redisBox, person, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, WARN, INFO } = C;

  // ---------- 공통 ----------
  // 위쪽 명령 줄: cmds = [[at, cmd, res]] → 지금 시각에 맞는 마지막 명령을 보인다
  function cmdBar(cmds, u) { const cur = cmds.filter((c) => u >= c[0]).pop() || cmds[0], op = fade(u, cmds[0][0], 0.3);
    el('rect', { x: 24, y: 20, width: 912, height: 46, rx: 10, fill: INK, opacity: op });
    const s = cur[1], n = Math.round(s.length * clamp((u - cur[0]) / 0.35));
    mono(44, 49, '> ' + s.slice(0, Math.max(n, u >= cur[0] ? 1 : 0)), { 'font-size': 16, fill: PANEL, 'font-weight': 700, opacity: op });
    if (cur[2]) mono(916, 49, cur[2], { 'font-size': 16, fill: 'var(--term)', 'text-anchor': 'end', opacity: fade(u, cur[0] + 0.4, 0.2) }); }
  // 리스트 칸 하나 (가로)
  function cell(cx, cy, w, h, s, o) { o = o || {};
    return card(cx, cy, w, h, { rx: 8, text: s, fs: o.fs || 16, mono: true, fw: 700, stroke: o.stroke || INK, color: o.color, fill: o.fill, s: o.s, op: o.op, dash: o.dash, sw: 2 }); }
  // 칸 사이 연결선 (양방향 연결 리스트)
  function links(xs, y, w, op) { for (let i = 1; i < xs.length; i++) { const a = xs[i - 1] + w / 2 + 3, b = xs[i] - w / 2 - 3;
      if (b > a) { el('line', { x1: a, y1: y - 5, x2: b, y2: y - 5, stroke: MUT, 'stroke-width': 1.6, opacity: op ?? 1 }); el('line', { x1: a, y1: y + 5, x2: b, y2: y + 5, stroke: MUT, 'stroke-width': 1.6, opacity: op ?? 1 }); } } }
  function ends(xl, xr, y, o) { o = o || {};
    tx(xl, y + 5, 'head', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: o.hc || MUT, class: 'mono' });
    tx(xr, y + 5, 'tail', { 'font-size': 15, 'font-weight': 700, fill: o.tc || MUT, class: 'mono' }); }

  // ---------- 1. LPUSH / RPUSH ----------
  const L0 = 200, LW = 76, LG = 24, LY = 170, lx = (i) => L0 + i * (LW + LG) + LW / 2;
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const at = [0.3, 1.0, 1.7], vals = ['a', 'b', 'c'];
      cmdBar([[0.3, 'LPUSH tasks a', '(integer) 1'], [1.0, 'LPUSH tasks b', '(integer) 2'], [1.7, 'LPUSH tasks c', '(integer) 3']], u);
      mono(L0, 120, 'tasks', { 'font-size': 16, 'font-weight': 700, fill: MUT });
      const xs = [];
      vals.forEach((v, j) => { if (u < at[j]) return; let idx = 0; for (let m = j + 1; m < 3; m++) idx += E(u, at[m], at[m] + 0.4);
        const x = L0 - 70 + (lx(0) + idx * (LW + LG) - (L0 - 70)) * E(u, at[j], at[j] + 0.4); xs.push(x);
        cell(x, LY, LW, 52, v, { stroke: ACC, color: ACC, fill: j === 2 || u < at[j + 1] ? ACCBG : null }); });
      links(xs.sort((a, b) => a - b), LY, LW);
      ends(L0 - 14, L0 + 3 * (LW + LG) - LG + 14, LY, { hc: ACC });
      grow(L0 - 90, LY - 60, L0 - 30, LY - 20, E(u, 0.2, 0.5), ACC); mono(L0 - 100, LY - 66, 'LPUSH', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
      tx(480, 300, '나중에 넣은 것이 맨 앞 → [c, b, a]', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k >= 1 && k <= 3) { const items = c.beat.viz.items, prevN = k === 1 ? 0 : (c.prev.viz.items || []).length;
      if (k === 1) cmdBar([[0.3, 'RPUSH queue 1', '(integer) 1'], [1.0, 'RPUSH queue 2', '(integer) 2'], [1.7, 'RPUSH queue 3', '(integer) 3']], u);
      if (k === 2) cmdBar([[0.3, 'RPUSH queue 4 5 6', '(integer) 6'], [1.6, 'LLEN queue', '(integer) 6']], u);
      if (k === 3) cmdBar([[0.3, 'LINDEX queue 3', '"4"']], u);
      const at = (i) => (k === 1 ? 0.3 + i * 0.7 : k === 2 ? 0.7 : 0);
      mono(L0, 120, 'queue', { 'font-size': 16, 'font-weight': 700, fill: MUT });
      const xs = items.map((_, i) => lx(i)), vis = items.map((_, i) => i < prevN || u >= at(i));
      links(xs.filter((_, i) => vis[i] && (i < prevN || u > at(i) + 0.4)), LY, LW);
      items.forEach((v, i) => { if (!vis[i]) return; const fresh = i >= prevN, x = fresh ? lerp(lx(i) + 120, lx(i), E(u, at(i), at(i) + 0.4)) : lx(i);
        cell(x, LY, LW, 52, v, { stroke: fresh ? ACC : INK, color: fresh ? ACC : INK, fill: fresh ? ACCBG : null, op: fresh ? fade(u, at(i), 0.25) : 1 }); });
      ends(L0 - 14, lx(items.length - 1) + LW / 2 + 14, LY, { tc: k < 3 ? ACC : MUT });
      if (k === 1) tx(480, 300, '들어온 순서 그대로 → [1, 2, 3]', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.2) });
      if (k === 2) { const n = Math.round(lerp(3, 6, E(u, 0.7, 1.1)));
        card(820, 120, 130, 40, { rx: 8, stroke: GRID, sw: 1.5 }); mono(820, 126, 'len = ' + n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: u > 1.6 ? ACC : INK });
        tx(480, 290, '값 3개를 한 왕복에', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
        tx(480, 322, 'LLEN 은 세지 않고 저장된 길이를 읽는다 → O(1)', { 'text-anchor': 'middle', 'font-size': 15.5, fill: MUT, opacity: fade(u, 1.9) }); }
      if (k === 3) { const p = E(u, 0.4, 2.0) * 3, i = Math.floor(Math.min(p, 3)), f = Math.min(p, 3) - i;
        const x = i >= 3 ? lx(3) : lerp(lx(i), lx(i + 1), f);
        el('circle', { cx: x, cy: LY + 48, r: 8, fill: WARN });
        for (let j = 0; j <= Math.min(Math.ceil(p), 3); j++) mono(lx(j), LY + 80, j + '번째', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: j <= p ? 1 : 0 });
        if (p >= 3) el('rect', { x: lx(3) - LW / 2 - 5, y: LY - 31, width: LW + 10, height: 62, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 3 });
        pill(lx(0), 300, 'O(1)', GOOD, pop(u, 0.2), { mono: true }); pill(lx(5), 300, 'O(1)', GOOD, pop(u, 0.2), { mono: true });
        pill(lx(3), 300, 'LINDEX 3 → O(N)', WARN, pop(u, 2.0), { mono: true });
        tx(480, 370, '가운데는 head 부터 걸어가야 닿는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); } }
    if (k === 4) { tx(60, 104, '작을 때 · listpack 한 덩어리', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      const lp = (x, y, vals, at, col) => { const w = vals.length * 40 + 20; el('rect', { x, y, width: w, height: 48, rx: 8, fill: SOFT, stroke: col || INK, 'stroke-width': 2, opacity: fade(u, at) });
        vals.forEach((v, i) => mono(x + 30 + i * 40, y + 30, v, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, at + 0.05 * i) })); return w; };
      lp(60, 124, ['1', '2', '3', '4', '5', '6'], 0.3);
      tx(360, 154, '연속된 메모리 → 포인터가 없어 작다', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.7) });
      tx(60, 246, '커지면 · quicklist = listpack 노드의 양방향 연결', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
      const nodes = [['1', '2', '3'], ['4', '5', '6'], ['…', '…', '…']], nx = (i) => 60 + i * 240;
      nodes.forEach((v, i) => { const at = 1.4 + i * 0.3; lp(nx(i), 268, v, at, ACC);
        if (i) { el('line', { x1: nx(i - 1) + 140, y1: 286, x2: nx(i) - 4, y2: 286, stroke: ACC, 'stroke-width': 2, opacity: fade(u, at) }); el('line', { x1: nx(i - 1) + 140, y1: 302, x2: nx(i) - 4, y2: 302, stroke: ACC, 'stroke-width': 2, opacity: fade(u, at) }); } });
      tx(480, 380, '전환은 Redis 가 알아서 한다 · 명령은 그대로', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.3) }); } }

  // ---------- 2. LPOP / RPOP ----------
  const JW = 156, JG = 22, J0 = 230, jx = (i) => J0 + i * (JW + JG) + JW / 2, JY = 160;
  const JOBS = ['send-email-1', 'send-email-2', 'send-email-3'];
  function worker(x, y, name, o) { o = o || {}; server(x, y, name || '워커', { lamp: o.lamp || OFF, s: 0.8, stroke: o.stroke }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { mono(J0, 112, 'jobs', { 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: k === 2 ? 1 - fade(u, 2.0) : 1 }); }
    if (k === 0) { cmdBar([[0.3, 'RPUSH jobs send-email-1', '(integer) 1'], [0.9, 'RPUSH jobs send-email-2', '(integer) 2'], [1.5, 'RPUSH jobs send-email-3', '(integer) 3']], u);
      person(80, JY, '생산자', {});
      JOBS.forEach((v, i) => { const a = 0.3 + i * 0.6; if (u < a) return; cell(lerp(jx(i) + 140, jx(i), E(u, a, a + 0.4)), JY, JW, 48, v, { fs: 15, stroke: ACC, color: ACC, op: fade(u, a, 0.2) }); });
      if (u > 1.9) links([jx(0), jx(1), jx(2)], JY, JW);
      ends(J0 - 14, jx(2) + JW / 2 + 14, JY, { tc: ACC });
      tx(480, 300, '넣은 순서가 곧 처리 순서', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 1) { cmdBar([[0.3, 'LPOP jobs', '"send-email-1"']], u);
      worker(110, 300, '워커');
      const go = E(u, 0.5, 1.3);
      cell(lerp(jx(0), 110, go), lerp(JY, 236, go), JW, 48, JOBS[0], { fs: 15, stroke: go > 0 ? BAD : INK, color: go > 0 ? BAD : INK, op: 1 - fade(u, 1.6, 0.4) });
      [1, 2].forEach((i) => cell(lerp(jx(i), jx(i - 1), E(u, 1.3, 1.8)), JY, JW, 48, JOBS[i], { fs: 15 }));
      links([lerp(jx(1), jx(0), E(u, 1.3, 1.8)), lerp(jx(2), jx(1), E(u, 1.3, 1.8))], JY, JW);
      ends(J0 - 14, lerp(jx(2), jx(1), E(u, 1.3, 1.8)) + JW / 2 + 14, JY, { hc: BAD });
      mono(200, 306, '처리: send-email-1', { 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      tx(560, 306, '꺼내는 순간 List 에서 지워진다', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) }); }
    if (k === 2) { cmdBar([[0.3, 'LPOP jobs', '"send-email-2"'], [0.9, 'LPOP jobs', '"send-email-3"'], [1.5, 'LPOP jobs', '(nil)'], [2.0, 'EXISTS jobs', '(integer) 0']], u);
      worker(110, 300, '워커');
      [1, 2].forEach((i, n) => { const a = 0.3 + n * 0.6, go = E(u, a + 0.1, a + 0.5), shift = n === 1 ? 0 : E(u, 0.8, 1.0);
        if (go < 1) cell(lerp(n === 0 ? jx(0) : lerp(jx(1), jx(0), E(u, 0.7, 0.9)), 110, go), lerp(JY, 236, go), JW, 48, JOBS[i], { fs: 15, stroke: go > 0 ? BAD : INK, color: go > 0 ? BAD : INK }); });
      const gone = fade(u, 1.5, 0.5);
      el('rect', { x: J0 - 10, y: JY - 34, width: 2 * (JW + JG), height: 68, rx: 10, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: (1 - gone) * fade(u, 1.2) });
      if (u > 1.5) { cross(J0 + 30, JY - 52, 10, pop(u, 1.6)); tx(J0 + 50, JY - 46, '키 jobs 삭제', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); }
      mono(200, 306, 'None → 루프 종료', { 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.7) });
      tx(560, 306, '빈 List 는 남지 않는다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) });
      tx(560, 334, '다음 RPUSH 때 다시 생긴다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.4) }); }
    // 스택: 세로로
    const SX = 480, SW = 170, sy = (i) => 128 + i * 54;
    if (k === 3) { cmdBar([[0.3, 'LPUSH undo edit1', '(integer) 1'], [0.9, 'LPUSH undo edit2', '(integer) 2'], [1.5, 'LPUSH undo edit3', '(integer) 3']], u);
      mono(SX - SW / 2, 96, 'undo', { 'font-size': 16, 'font-weight': 700, fill: MUT });
      const at = [0.3, 0.9, 1.5];
      [0, 1, 2].forEach((j) => { if (u < at[j]) return; let idx = 0; for (let m = j + 1; m < 3; m++) idx += E(u, at[m], at[m] + 0.4);
        cell(SX, lerp(sy(0) - 40, sy(idx), E(u, at[j], at[j] + 0.4)), SW, 44, 'edit' + (j + 1), { stroke: j === 2 ? ACC : INK, color: j === 2 ? ACC : INK, op: fade(u, at[j], 0.2) }); });
      tx(SX - SW / 2 - 16, sy(0) + 5, 'head', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: ACC, class: 'mono' });
      tx(SX + SW / 2 + 20, sy(0) + 5, '← LPUSH', { 'font-size': 15, 'font-weight': 700, fill: ACC, class: 'mono', opacity: fade(u, 0.3) });
      tx(480, 330, '최신 edit3 가 head 에 온다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 4) { cmdBar([[0.3, 'LPOP undo', '"edit3"'], [1.1, 'LPOP undo', '"edit2"']], u);
      mono(SX - SW / 2, 96, 'undo', { 'font-size': 16, 'font-weight': 700, fill: MUT });
      ['edit3', 'edit2', 'edit1'].forEach((v, j) => { const a = j === 0 ? 0.4 : j === 1 ? 1.2 : 9, go = E(u, a, a + 0.6), up = (j >= 1 ? E(u, 0.9, 1.1) : 0) + (j >= 2 ? E(u, 1.7, 1.9) : 0);
        if (go >= 1) return; cell(lerp(SX, 760, go), lerp(sy(j - up), 120 + j * 50, go), SW, 44, v, { stroke: go > 0 ? BAD : INK, color: go > 0 ? BAD : INK }); });
      ['edit3', 'edit2'].forEach((v, j) => { if (u > 1.0 + j * 0.8) mono(760, 140 + j * 34, `← "${v}"`, { 'font-size': 16, 'font-weight': 700, fill: BAD }); });
      tx(SX - SW / 2 - 16, sy(0) + 5, 'head', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: BAD, class: 'mono' });
      pill(480, 330, 'LPOP undo 5 → 최대 5개를 한 번에', INK, pop(u, 2.1), { mono: true, fs: 14.5 }); }
    if (k === 5) { const rows = [['RPUSH', 'LPOP', 'FIFO 큐', GOOD, 1, -1], ['LPUSH', 'LPOP', 'LIFO 스택', ACC, -1, -1], ['LPUSH', 'RPOP', 'FIFO 큐 (역방향)', GOOD, -1, 1]];
      rows.forEach(([a, b, name, col, ins, out], i) => { const y = 120 + i * 96, at = 0.3 + i * 0.6, op = fade(u, at);
        mono(60, y + 6, `${a} + ${b}`, { 'font-size': 17, 'font-weight': 800, opacity: op });
        const bx = 300; [0, 1, 2, 3].forEach((j) => el('rect', { x: bx + j * 56, y: y - 18, width: 48, height: 36, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 1.8, opacity: op }));
        const inX = ins < 0 ? bx - 14 : bx + 4 * 56 + 6, outX = out < 0 ? bx - 14 : bx + 4 * 56 + 6;
        if (ins < 0) grow(inX - 50, y - 26, inX, y - 8, E(u, at + 0.1, at + 0.4), ACC); else grow(inX + 50, y - 26, inX, y - 8, E(u, at + 0.1, at + 0.4), ACC);
        if (out < 0) grow(outX, y + 8, outX - 50, y + 26, E(u, at + 0.3, at + 0.6), BAD); else grow(outX, y + 8, outX + 50, y + 26, E(u, at + 0.3, at + 0.6), BAD);
        tx(640, y + 6, name, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, at + 0.4) });
        tx(640, y + 30, ins === out ? '같은 쪽 → 최신 먼저' : '반대쪽 → 들어온 순', { 'font-size': 14, fill: MUT, opacity: fade(u, at + 0.5) }); });
      el('line', { x1: 40, y1: 395, x2: 60, y2: 395, stroke: ACC, 'stroke-width': 3, opacity: fade(u, 2.2) }); tx(66, 400, '넣기', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) });
      el('line', { x1: 120, y1: 395, x2: 140, y2: 395, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 2.2) }); tx(146, 400, '꺼내기', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); } }

  // ---------- 3. LRANGE ----------
  const TW = 92, TG = 14, T0 = 220, txx = (i) => T0 + i * (TW + TG) + TW / 2, TY = 160;
  const POSTS = ['105', '104', '103', '102', '101'];
  function tl(o) { o = o || {}; mono(T0, 112, 'timeline:user:1', { 'font-size': 16, 'font-weight': 700, fill: MUT });
    POSTS.forEach((v, i) => { const hl = o.hl && o.hl(i); cell(txx(i), TY, TW, 50, v, { stroke: hl ? ACC : INK, color: hl ? ACC : INK, fill: hl ? ACCBG : null }); });
    POSTS.forEach((_, i) => mono(txx(i), TY + 48, String(i), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }));
    if (o.neg) POSTS.forEach((_, i) => mono(txx(i), TY + 70, String(i - 5), { 'font-size': 14, 'text-anchor': 'middle', fill: o.negCol || MUT })); }
  // 긴 자(인덱스 0..max)
  function ruler(x0, x1, y, max, u, marks) { el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: INK, 'stroke-width': 2.5 });
    marks.forEach(([v, s]) => { const x = lerp(x0, x1, v / max); el('line', { x1: x, y1: y - 7, x2: x, y2: y + 7, stroke: INK, 'stroke-width': 2 }); mono(x, y + 28, s, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { cmdBar(['101', '102', '103', '104', '105'].map((v, i) => [0.3 + i * 0.4, 'LPUSH timeline:user:1 ' + v, `(integer) ${i + 1}`]), u);
      mono(T0, 112, 'timeline:user:1', { 'font-size': 16, 'font-weight': 700, fill: MUT });
      const at = (j) => 0.3 + j * 0.4;
      for (let j = 0; j < 5; j++) { if (u < at(j)) continue; let idx = 0; for (let m = j + 1; m < 5; m++) idx += E(u, at(m), at(m) + 0.3);
        cell(lerp(T0 - 60, txx(0) + idx * (TW + TG), E(u, at(j), at(j) + 0.3)), TY, TW, 50, String(101 + j), { stroke: j === 4 ? ACC : INK, color: j === 4 ? ACC : INK, op: fade(u, at(j), 0.2) }); }
      if (u > 2.4) POSTS.forEach((_, i) => mono(txx(i), TY + 48, String(i), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.4) }));
      tx(480, 300, '인덱스 0 = 언제나 최신 글', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.3) }); }
    if (k === 1) { cmdBar([[0.3, 'LRANGE timeline:user:1 0 9', '5개']], u);
      tl({ hl: (i) => u > 0.8 });
      const g = E(u, 0.6, 1.5), x0 = txx(0) - TW / 2, x1 = lerp(x0, 900, g);
      el('path', { d: `M${x0},${TY + 70} v10 H${x1} v-10`, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      mono(900, TY + 104, '9', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      el('rect', { x: txx(4) + TW / 2 + 14, y: TY - 25, width: 900 - txx(4) - TW / 2 - 14, height: 50, rx: 8, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 1.5) });
      tx((txx(4) + TW / 2 + 914) / 2, TY + 6, '없음', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) });
      tx(480, 320, '범위를 넘겨도 에러 없이 있는 만큼만 온다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(480, 352, 'stop 포함 → 0 9 는 10개 요청', fade(u, 2.3), { 'font-size': 15 }); }
    if (k === 2) { const second = u > 1.4; cmdBar([[0.3, 'LRANGE timeline:user:1 0 -1', '5개'], [1.4, 'LRANGE timeline:user:1 -3 -1', '"103" "102" "101"']], u);
      tl({ neg: true, negCol: second ? ACC : MUT, hl: (i) => (second ? i >= 2 : u > 0.7) });
      tx(T0 - 16, TY + 54, '앞', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); tx(T0 - 16, TY + 76, '뒤', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      pill(txx(2), 300, '0 -1 → 전체', ACC, pop(u, 0.8), { mono: true, fs: 15, op: second ? 0.35 : 1 });
      pill(txx(3) + 60, 300, '-3 -1 → 뒤 3개', ACC, pop(u, 1.8), { mono: true, fs: 15 });
      tx(480, 370, '길이를 몰라도 뒤쪽 N개를 집는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.3) }); }
    if (k === 3) { cmdBar([[0.3, 'LRANGE timeline:user:1 40 59', '20개']], u);
      [['page = 2', 0.2], ['page_size = 20', 0.4], ['start = 2 × 20 = 40', 0.8], ['stop = 40 + 20 − 1 = 59', 1.2]].forEach(([s, at], i) => mono(60, 112 + i * 30, s, { 'font-size': 16, 'font-weight': 700, fill: i >= 2 ? ACC : INK, opacity: fade(u, at) }));
      const x0 = 120, x1 = 840, y = 300; ruler(x0, x1, y, 60, u, [[0, '0'], [20, '20'], [40, '40'], [59, '59']]);
      ['0페이지', '1페이지', '2페이지'].forEach((s, i) => { const a = lerp(x0, x1, i * 20 / 60), b = lerp(x0, x1, (i * 20 + 19) / 60), on = i === 2;
        el('rect', { x: a + 2, y: y - 40, width: Math.max(0, (b - a) * (on ? E(u, 1.4, 2.0) : 1) - 4), height: 26, rx: 5, fill: on ? ACC : SOFT, stroke: on ? 'none' : GRID, opacity: on ? 1 : fade(u, 0.6) });
        tx((a + b) / 2, y - 50, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: on ? ACC : MUT, opacity: on ? fade(u, 1.5) : fade(u, 0.6) }); });
      tx(560, 140, 'stop 이 포함이라 −1', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
      tx(560, 168, '빼먹으면 페이지마다 1개씩 겹친다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 4) { cmdBar([[0.3, 'LRANGE timeline:user:1 2000 2019', '20개']], u);
      const x0 = 80, x1 = 880, y = 190, max = 2019, xs = lerp(x0, x1, 2000 / max);
      el('rect', { x: x0, y: y - 16, width: (xs - x0) * E(u, 0.4, 1.9), height: 32, rx: 6, fill: WARN, opacity: 0.85 });
      el('rect', { x: xs, y: y - 16, width: (x1 - xs) * E(u, 1.9, 2.2), height: 32, rx: 4, fill: ACC });
      el('circle', { cx: lerp(x0, xs, E(u, 0.4, 1.9)), cy: y + 34, r: 8, fill: WARN, opacity: u < 2.0 ? 1 : 0 });
      mono(x0, y + 60, '0', { 'font-size': 14, fill: MUT }); mono(xs, y + 60, '2000', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      tx((x0 + xs) / 2, y - 28, 'S = start 까지 걸어가기', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) });
      tx(x1, y - 28, 'N = 20', { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      mono(480, 330, 'O(S + N)', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      sub(480, 366, '깊은 페이지는 매번 앞쪽을 다시 지나간다', fade(u, 2.4), { 'font-size': 15 }); }
    if (k === 5) { cmdBar([[0.3, 'LTRIM timeline:user:1 0 99', 'OK']], u);
      const x0 = 80, x1 = 880, y = 190, cut = lerp(x0, x1, 100 / 140), drop = E(u, 1.0, 2.0);
      for (let i = 0; i < 28; i++) { const x = x0 + i * ((x1 - x0) / 28), w = (x1 - x0) / 28 - 4, kept = x + w <= cut;
        el('rect', { x, y: y - 18 + (kept ? 0 : drop * 70), width: w, height: 36, rx: 4, fill: kept ? ACC : OFF, opacity: kept ? 0.9 : 1 - drop }); }
      el('line', { x1: cut + 1, y1: y - 40, x2: cut + 1, y2: y + 40, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 5', opacity: fade(u, 0.6) });
      mono(x0, y + 50, '0', { 'font-size': 14, fill: MUT }); mono(cut - 8, y + 50, '99', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      tx(cut + 14, y - 46, '100번째 뒤는 버린다', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      tx(480, 330, 'LPUSH 다음에 LTRIM → 최근 100개만 유지', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.1) }); } }

  // ---------- 4. BLPOP ----------
  const WX = 110, PX = 850, QX = 480, QY = 190;
  function q(items, o) { o = o || {}; zone(QX - 170, QY - 70, 340, 140, 'Redis', { stroke: ACC, color: ACC });
    mono(QX - 150, QY - 22, o.name || 'jobs', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    if (!items.length) tx(QX + 20, QY + 30, '(비어 있음)', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT });
    items.forEach((v, i) => cell(QX - 90 + i * 120, QY + 24, 110, 40, v, { fs: 14.5 })); }
  function zzz(x, y, u, op) { ['z', 'z', 'Z'].forEach((s, i) => tx(x + i * 12, y - i * 10 - ((u * 8) % 6), s, { 'font-size': 15 + i * 2, 'font-weight': 700, fill: INFO, opacity: op ?? 1 })); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { cmdBar([[0.2, 'LPOP jobs', '(nil)']], u);
      worker(WX, QY, '워커', { lamp: WARN }); q([]); person(PX, QY, '생산자', {});
      const pings = 10, x0 = 120, x1 = 840, y = 340, arr = 0.43;
      el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 2 });
      for (let i = 0; i < pings; i++) { const a = 0.3 + i * 0.22, x = lerp(x0, x1, (i + 0.5) / pings);
        el('circle', { cx: x, cy: y, r: 7, fill: i === 5 ? GOOD : WARN, opacity: fade(u, a, 0.15) }); }
      tx(x0, y - 20, 'LPOP 시도 (0.1초마다)', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.3) });
      const ax = lerp(x0, x1, arr); if (u > 1.2) { el('line', { x1: ax, y1: y + 14, x2: lerp(x0, x1, 0.55), y2: y + 14, stroke: BAD, 'stroke-width': 4 });
        tx(ax, y + 40, '작업 도착 → 다음 시도까지 기다림', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.2) }); }
      for (let i = 0; i < 6; i++) dot([[WX + 50, QY - 10], [QX - 170, QY - 10], [WX + 50, QY - 10]], ((t * 1.4 + i / 6) % 1), WARN, 5);
      tx(260, QY + 100, '대부분 None 왕복', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.8), 'text-anchor': 'middle' }); }
    if (k === 1) { cmdBar([[0.2, 'BLPOP jobs 0', ''], [1.4, 'RPUSH jobs job-1', '(integer) 1']], u);
      const got = u > 1.9; worker(WX, QY, '워커', { lamp: got ? GOOD : INFO }); person(PX, QY, '생산자', {});
      q(u > 1.4 && u < 1.9 ? ['job-1'] : []);
      el('line', { x1: WX + 50, y1: QY - 10, x2: QX - 170, y2: QY - 10, stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      if (!got) zzz(WX + 30, QY - 60, t, fade(u, 0.5));
      fly(PX - 40, QY, QX + 40, QY + 24, seg(u, 1.0, 1.4), '"job-1"', { mono: true });
      fly(QX - 90, QY + 24, WX + 40, QY + 70, seg(u, 1.5, 1.9), 'job-1', { mono: true, fill: GOOD });
      pill(WX + 60, QY + 110, "('jobs', 'job-1')", GOOD, pop(u, 1.95), { mono: true, fs: 15 });
      tx(560, 360, 'sleep 없이 자다가 들어오는 즉시 깬다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 2) { cmdBar([[0.2, 'BLPOP high normal low 0', ''], [1.3, 'RPUSH high urgent-1', '(integer) 1']], u);
      worker(WX, QY, '워커', { lamp: u > 1.9 ? GOOD : INFO }); person(PX, QY, '생산자', {});
      zone(QX - 170, 90, 340, 220, 'Redis', { stroke: ACC, color: ACC });
      ['high', 'normal', 'low'].forEach((n, i) => { const y = 150 + i * 56, scan = E(u, 0.4 + i * 0.2, 0.6 + i * 0.2);
        mono(QX - 150, y + 5, n, { 'font-size': 16, 'font-weight': 700, fill: i === 0 ? BAD : MUT });
        el('rect', { x: QX - 60, y: y - 18, width: 200, height: 36, rx: 6, fill: PANEL, stroke: scan > 0 && u < 1.3 ? INFO : GRID, 'stroke-width': 2 });
        mono(QX - 210, y + 5, String(i + 1), { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.2) }); });
      if (u > 1.5 && u < 1.9) cell(QX + 40, 150, 120, 30, 'urgent-1', { fs: 14.5, stroke: BAD, color: BAD });
      fly(PX - 40, QY, QX + 40, 150, seg(u, 1.1, 1.5), '"urgent-1"', { mono: true, fill: BAD });
      fly(QX - 60, 150, WX + 40, QY + 70, seg(u, 1.6, 2.0), 'urgent-1', { mono: true, fill: GOOD });
      pill(WX + 40, QY + 110, "('high', 'urgent-1')", GOOD, pop(u, 2.0), { mono: true, fs: 15 });
      tx(QX + 60, 350, '앞에 적은 키부터 본다 → 우선순위', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 3) { cmdBar([[0.2, 'BLPOP jobs 30', ''], [2.4, 'BLPOP jobs 30', '(nil)']], u);
      worker(WX, QY, '워커', { lamp: INFO }); q([]);
      person(PX, QY, '생산자', { stroke: OFF }); tx(PX, QY + 74, '30초간 없음', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT });
      clock(WX + 150, QY - 10, 30, E(u, 0.3, 2.3), WARN, '30s');
      pill(WX + 40, QY + 110, 'None', WARN, pop(u, 2.4), { mono: true, fs: 15 });
      tx(WX + 100, QY + 116, '→ 헬스체크 후 다시 대기', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.5) });
      pill(QX, 370, 'BRPOP jobs 0 → tail 쪽에서 꺼낸다', INK, pop(u, 1.4), { mono: true, fs: 14.5 }); }
    if (k === 4) { cmdBar([[0.2, 'BLPOP jobs 0  (W1, W2, W3)', ''], [1.3, 'RPUSH jobs job-1', '(integer) 1']], u);
      ['W1', 'W2', 'W3'].forEach((n, i) => { const y = 110 + i * 100, got = i === 0 && u > 1.9;
        card(WX, y, 90, 44, { rx: 8, text: n, fs: 16, stroke: got ? GOOD : INFO, color: got ? GOOD : INK, sw: 2 });
        if (!got) zzz(WX + 54, y - 6, t + i * 0.3, 0.9); else check(WX + 64, y, 10, pop(u, 1.9));
        el('line', { x1: WX + 46, y1: y, x2: QX - 170, y2: QY, stroke: INFO, 'stroke-width': 1.8, 'stroke-dasharray': '5 5', opacity: got ? 0.2 : 0.7 }); });
      q([]); person(PX, QY, '생산자', {});
      fly(PX - 40, QY, QX, QY + 24, seg(u, 0.9, 1.4), '"job-1"', { mono: true });
      fly(QX - 90, QY + 24, WX + 50, 110, seg(u, 1.5, 1.9), 'job-1', { mono: true, fill: GOOD });
      tx(QX, 360, '작업 하나는 한 워커에게만 · 먼저 기다린 W1', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); } }

  // ---------- 5. 실전 작업 큐 ----------
  const P5 = 80, Q5 = 300, W5 = 870, Y5 = 150;
  function flow(c, o) { o = o || {}; const b = c.beat.viz, p = (c.prev && c.prev.viz) || b, n = Math.round(tween(p.queueLength, b.queueLength, c.u));
    ['P1', 'P2'].forEach((s, i) => card(P5, 110 + i * 80, 64, 40, { rx: 8, text: s, fs: 15, stroke: ACC, color: ACC }));
    tx(P5, 64, '생산자', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
    mono(Q5, 104, `jobs · ${n} 대기`, { 'font-size': 15, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < 5; i++) el('rect', { x: Q5 + i * 64, y: Y5 - 22, width: 56, height: 44, rx: 6, fill: i >= 5 - n ? ACCBG : PANEL, stroke: i >= 5 - n ? ACC : GRID, 'stroke-width': 1.8 });
    tx(W5, 64, '워커 (BLPOP)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
    ['W1', 'W2', 'W3'].forEach((s, i) => { const dead = o.dead === i;
      card(W5, 110 + i * 60, 64, 40, { rx: 8, text: s, fs: 15, stroke: dead ? BAD : INK, color: dead ? BAD : INK, op: dead ? 0.5 : 1 }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { flow(c);
      card(260, 300, 330, 92, { rx: 10, s: pop(u, 0.3) });
      ['{ "type": "email",', '  "payload": {…},', '  "ts": time.time() }'].forEach((s, i) => mono(110, 278 + i * 24, s, { 'font-size': 14.5, opacity: fade(u, 0.4 + i * 0.1) }));
      grow(430, 300, 520, 300, E(u, 1.0, 1.3), ACC); mono(475, 290, 'dumps', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
      card(730, 300, 380, 44, { rx: 8, text: '\'{"type": "email", "payload": …}\'', fs: 14.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.3) });
      fly(P5 + 30, 110, Q5 + 4 * 64 + 28, Y5, seg(u, 1.7, 2.4), 'RPUSH', { mono: true }); }
    if (k === 1) { flow(c);
      fly(Q5 + 28, Y5, W5 - 32, 110, seg(u, 0.3, 1.0), 'raw', { mono: true, fill: INK });
      card(240, 300, 380, 44, { rx: 8, text: '\'{"type": "email", "payload": …}\'', fs: 14.5, mono: true, s: pop(u, 1.0) });
      grow(434, 300, 520, 300, E(u, 1.4, 1.7), ACC); mono(477, 290, 'loads', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) });
      card(700, 300, 300, 44, { rx: 8, text: "job['type'] == 'email'", fs: 14.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.7) });
      tx(480, 380, '여기서부터는 평범한 파이썬 dict', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 2) { flow(c);
      cross(W5 - 50, 170, 10, pop(u, 0.6)); tx(W5 - 70, 176, 'handle 실패', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.7) });
      mono(Q5, 284, 'jobs:retry', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.9) });
      for (let i = 0; i < 5; i++) el('rect', { x: Q5 + i * 64, y: 300, width: 56, height: 44, rx: 6, fill: i === 4 && u > 2.0 ? 'var(--warnbg)' : PANEL, stroke: i === 4 && u > 2.0 ? WARN : GRID, 'stroke-width': 1.8, opacity: fade(u, 0.9) });
      fly(W5 - 32, 170, Q5 + 4 * 64 + 28, 322, seg(u, 1.2, 2.0), 'raw 그대로', { mono: true, fill: WARN });
      tx(480, 390, '재시도 규칙은 직접 만든다 · 횟수를 안 세면 영원히 돈다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 3) { flow(c);
      fly(P5 + 30, 110, Q5 + 4 * 64 + 28, Y5, seg(u, 0.3, 1.0), 'email', { mono: true });
      fly(P5 + 30, 190, Q5 + 4 * 64 + 28, Y5, seg(u, 0.7, 1.4), 'thumbnail', { mono: true, fill: INFO });
      mono(80, 300, 'enqueue_job("email", {"to": …})', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(80, 330, 'enqueue_job("thumbnail", {"image_id": 42})', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.7) });
      tx(560, 376, 'type 필드로 핸들러를 고른다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 4) { const dead = u > 1.2; flow(c, { dead: dead ? 2 : -1 });
      fly(Q5 + 28, Y5, W5 - 32, 230, seg(u, 0.3, 1.0), 'job', { mono: true, fill: INK });
      if (dead) { cross(W5, 230, 16, pop(u, 1.2)); }
      tx(W5 - 50, 290, '처리 중 워커 종료', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.3) });
      tx(480, 300, '작업은 List 에도 워커에도 없다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      [['Stream + Consumer Group', 'IV-2-1'], ['RabbitMQ', ''], ['Kafka', '']].forEach(([s], i) => pill(250 + i * 230, 360, s, INK, pop(u, 2.0 + i * 0.15), { fs: 14.5 })); }
    if (k === 5) { flow(c);
      mono(Q5, 254, 'jobs:processing', { 'font-size': 15, 'font-weight': 700, fill: INFO });
      for (let i = 0; i < 5; i++) el('rect', { x: Q5 + i * 64, y: 266, width: 56, height: 44, rx: 6, fill: i === 4 && u > 1.0 ? 'var(--infobg)' : PANEL, stroke: i === 4 && u > 1.0 ? INFO : GRID, 'stroke-width': 1.8 });
      fly(Q5 + 28, Y5, Q5 + 4 * 64 + 28, 288, seg(u, 0.4, 1.0), 'job', { mono: true, fill: INFO });
      mono(40, 352, 'BLMOVE jobs jobs:processing LEFT RIGHT 0', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      fly(Q5 + 4 * 64 + 28, 288, W5 - 40, 110, seg(u, 1.0, 1.6), 'job 사본', { mono: true, fill: INK });
      grow(W5 - 44, 132, Q5 + 4 * 64 + 40, 262, E(u, 1.7, 2.0), GOOD, { dash: '6 5' }); tx(W5 - 40, 340, '끝나면 LREM', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      tx(W5 - 40, 368, '죽으면 processing 에 남는다', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      tx(40, 398, '꺼내기와 옮기기가 한 명령 → 중간에 잃지 않는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); } }

  R.page({ title: 'Redis List 움직임', scenes: [s1, s2, s3, s4, s5] });
})();
