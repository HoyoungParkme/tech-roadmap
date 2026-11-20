/* IV-1-2 Q-learning — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 무대의 주인공: 2×2 그리드월드(S0 시작 · S3 목표 +10), 4×4 Q 테이블, TD 오차 수직선, ε 감쇠 곡선, 걸음 수 학습 곡선 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, grow, fly, cross, check, lock, axes, line, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const AR = ['↑', '↓', '←', '→'], DIR = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const MOVES = [[0, 2, 0, 1], [1, 3, 0, 1], [0, 2, 2, 3], [3, 3, 3, 3]];

  // ---------- 2×2 그리드 ----------
  let GX = 40, GY = 80, CP = 126, CW = 118;
  const gx = (s) => GX + (s % 2) * CP + CW / 2, gy = (s) => GY + Math.floor(s / 2) * CP + CW / 2;
  function flag(x, y, s) { const g = R.G(x, y, s); el('line', { x1: -8, y1: 16, x2: -8, y2: -18, stroke: INK, 'stroke-width': 2.5 }, g); el('path', { d: 'M-8,-18 L14,-11 L-8,-4 Z', fill: GOOD }, g); return g; }
  function agent(x, y, s) { const g = R.G(x, y, s ?? 1);
    el('rect', { x: -16, y: -16, width: 32, height: 28, rx: 9, fill: PANEL, stroke: INK, 'stroke-width': 2.4 }, g);
    el('circle', { cx: -6, cy: -4, r: 3, fill: INK }, g); el('circle', { cx: 6, cy: -4, r: 3, fill: INK }, g);
    el('line', { x1: 0, y1: -16, x2: 0, y2: -23, stroke: INK, 'stroke-width': 2 }, g); el('circle', { cx: 0, cy: -24, r: 3, fill: ACC }, g); return g; }
  // o: { show(0→1), agent: s 또는 [x,y], hot:[s…], arrow:{from,to}, aru, policy:[…], pu }
  function world(o) { o = o || {}; const sh = o.show ?? 1;
    [0, 1, 2, 3].forEach((s) => { const a = clamp(sh * 4 - s); if (a <= 0) return; const x = GX + (s % 2) * CP, y = GY + Math.floor(s / 2) * CP, hot = o.hot && o.hot.includes(s);
      el('rect', { x, y, width: CW, height: CW, rx: 10, fill: s === 3 ? C.GOODBG : hot ? C.WARNBG : PANEL, stroke: s === 3 ? GOOD : hot ? WARN : GRID, 'stroke-width': 2, opacity: a });
      mono(x + 10, y + 22, 'S' + s, { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: a });
      if (s === 3) { flag(x + CW - 34, y + 36, a); mono(x + CW / 2, y + CW - 16, '+10', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: a }); } });
    if (o.arrow && (o.aru ?? 1) > 0) { const { from, to } = o.arrow, dx = gx(to) - gx(from), dy = gy(to) - gy(from), L = Math.hypot(dx, dy);
      grow(gx(from) + dx / L * 34, gy(from) + dy / L * 34, gx(to) - dx / L * 40, gy(to) - dy / L * 40, o.aru ?? 1, WARN === o.acol ? MUT : (o.acol || ACC), { sw: 4 }); }
    if (o.policy) [0, 1, 2].forEach((s) => { const a = AR.indexOf(o.policy[s]); if (a < 0) return; const w = clamp((o.pu ?? 1) * 3 - s), [dr, dc] = DIR[a];
      grow(gx(s) + dc * 22, gy(s) + dr * 22 + 20, gx(s) + dc * 54, gy(s) + dr * 54 + 20, w, ACC, { sw: 4 }); });
    if (o.agent != null) { const p = Array.isArray(o.agent) ? o.agent : [gx(o.agent), gy(o.agent)]; agent(p[0], p[1], o.as ?? 1); } }
  const glide = (a, b, w) => [lerp(gx(a), gx(b), E(w, 0, 1)), lerp(gy(a), gy(b), E(w, 0, 1))];

  // ---------- Q 테이블 ----------
  // o: { cs, op(r,c), hi:[r,c], rowMax, vals, dim }
  function qtab(x, y, vals, o) { o = o || {}; const cs = o.cs || 62, op = o.tabOp ?? 1;
    AR.forEach((a, c) => tx(x + c * cs + (cs - 4) / 2, y - 10, a, { 'font-size': 18, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: op }));
    [0, 1, 2, 3].forEach((r) => { mono(x - 10, y + r * cs + cs / 2 + 2, 'S' + r, { 'font-size': 15, 'font-weight': 800, fill: r === 3 ? GOOD : MUT, 'text-anchor': 'end', opacity: op });
      const row = vals ? vals[r] : null, mx = row ? Math.max(...row) : 0;
      [0, 1, 2, 3].forEach((c) => { const a = (o.op ? o.op(r, c) : 1) * op; if (a <= 0) return; const xx = x + c * cs, yy = y + r * cs, v = row ? row[c] : null;
        el('rect', { x: xx, y: yy, width: cs - 4, height: cs - 4, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: a });
        if (v != null && r < 3 && v > 0) el('rect', { x: xx, y: yy, width: cs - 4, height: cs - 4, rx: 6, fill: ACC, opacity: a * (0.1 + 0.6 * clamp(v / 10)) });
        if (v != null) mono(xx + (cs - 4) / 2, yy + (cs - 4) / 2 + 5, r === 3 ? '·' : v.toFixed(1), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: r === 3 ? OFF : v > 6.5 ? PANEL : v > 0 ? INK : OFF, opacity: a });
        const isHi = o.hi && o.hi[0] === r && o.hi[1] === c, isMax = o.rowMax && r < 3 && mx > 0 && Math.abs(v - mx) < 1e-9;
        if (isHi || isMax) el('rect', { x: xx - 2, y: yy - 2, width: cs, height: cs, rx: 7, fill: 'none', stroke: isHi ? WARN : INK, 'stroke-width': 3, opacity: isHi ? 1 : (o.rowMax ?? 1) }); }); }); }
  const qv = (c, u) => { const b = c.beat.qtable, p = c.prev && c.prev.qtable; if (!b) return null;
    return b.values.map((row, r) => row.map((v, cc) => tween(p ? p.values[r][cc] : v, v, u))); };
  const T = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15.5, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  const M = (x, y, s, op, a) => mono(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: op ?? 1 }, a || {}));

  // =========================================================
  // 1. 벨만의 한계 — P 를 모르는 세계
  // =========================================================
  function s1(t, c) { const { k, u } = c, g = c.beat.grid; GX = 40; GY = 80; CP = 126; CW = 118;
    if (k === 0) { world({ show: E(u, 0.2, 1.4), agent: u > 1.4 ? 0 : null, as: pop(u, 1.4) });
      ['#   S0 S1', '#   S2 S3(G)'].forEach((s, i) => M(360, 120 + i * 30, s, fade(u, 0.3 + i * 0.3), { fill: MUT, 'font-size': 17 }));
      T(360, 210, '칸 4개가 세계 전부', fade(u, 1.5), { 'font-size': 17, 'font-weight': 800 });
      T(360, 244, 'S3 도착 → +10 · 그 외 0 · 벽이면 제자리', fade(u, 1.9), { fill: MUT, 'font-weight': 400 });
      T(360, 300, '작아야 표가 몇 칸인지 눈으로 따라간다', fade(u, 2.3)); }
    if (k === 1) { world({ agent: 0 });
      DIR.forEach(([dr, dc], i) => { const w = E(u, 0.3 + i * 0.2, 0.6 + i * 0.2), x = gx(0), y = gy(0);
        grow(x + dc * 26, y + dr * 26, x + dc * 54, y + dr * 54, w, i === 1 || i === 3 ? ACC : MUT, { sw: 3 }); });
      M(360, 120, 'N_STATES, N_ACTIONS = 4, 4', fade(u, 0.3), { fill: INK, 'font-size': 16 }); M(360, 152, 'GOAL = 3', fade(u, 0.6), { fill: GOOD, 'font-size': 16 });
      const n = Math.round(lerp(0, 16, E(u, 1.0, 1.8)));
      mono(360, 220, `4 상태 × 4 행동 = ${n}`, { 'font-size': 24, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      T(360, 262, '이 두 숫자가 그대로 Q 테이블의 크기가 된다', fade(u, 2.1)); }
    if (k === 2) { world({ agent: 0, arrow: g.arrow, aru: E(u, 1.3, 1.7), hot: u > 1.3 ? [0, 1] : null });
      const X = 380, Y = 70; el('rect', { x: X, y: Y, width: 540, height: 250, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.2) });
      tx(X + 16, Y + 28, '환경 안의 MOVES (정답표)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
      AR.forEach((a, j) => tx(X + 150 + j * 80, Y + 60, a, { 'font-size': 18, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3) }));
      MOVES.forEach((row, r) => { mono(X + 30, Y + 96 + r * 38, `S${r}${r === 3 ? ' 종료' : ''}`, { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.4 + r * 0.15) });
        row.forEach((v, j) => { const hot = r === 0 && j === 3 && u > 1.2;
          if (hot) el('rect', { x: X + 150 + j * 80 - 26, y: Y + 74 + r * 38, width: 52, height: 30, rx: 6, fill: C.HL });
          mono(X + 150 + j * 80, Y + 96 + r * 38, 'S' + v, { 'font-size': 16, 'font-weight': hot ? 800 : 600, 'text-anchor': 'middle', opacity: fade(u, 0.4 + r * 0.15) }); }); });
      lock(X + 510, Y + 30, true, BAD, pop(u, 1.9));
      T(X, 354, '에이전트는 이 표를 볼 수 없다 — 환경의 소유물', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); }
    if (k === 3) { world({ agent: 2, arrow: g.arrow, aru: E(u, 1.6, 2.0), hot: [2] });
      const bx = 640, by = 190; card(bx, by, 220, 120, { rx: 14, fill: INK, stroke: 'none', s: pop(u, 0.3) });
      if (u > 0.5) { mono(bx, by - 14, 'env_step()', { 'font-size': 17, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }); tx(bx, by + 28, '? ? ?', { 'font-size': 24, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle' }); }
      fly(gx(2) + 40, gy(2) - 40, bx - 110, by, seg(u, 0.8, 1.5), '(S2, →)', { mono: true });
      T(400, 320, '할 수 있는 일은 호출뿐 — 안쪽 P 는 보이지 않는다', fade(u, 2.1)); }
    if (k === 4) { world({ agent: u < 0.4 ? 2 : glide(2, 3, seg(u, 0.4, 1.0)), arrow: { from: 2, to: 3 } });
      const bx = 470; card(bx, 130, 160, 80, { rx: 12, fill: INK, stroke: 'none' }); mono(bx, 136, 'env_step', { 'font-size': 16, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' });
      [['S3', 'next_state', INFO], ['10.0', 'reward', GOOD], ['True', 'done', WARN]].forEach(([v, n, col], i) => { const x = 640 + i * 105, a = 0.6 + i * 0.35;
        fly(bx + 80, 130, x, 120, seg(u, a, a + 0.4), v, { mono: true, stay: true, fill: col });
        mono(x, 160, n, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, a + 0.4) }); });
      const mc = c.beat.modelCompare, a2 = fade(u, 1.9);
      el('rect', { x: 330, y: 220, width: 290, height: 120, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: a2 });
      el('rect', { x: 636, y: 220, width: 290, height: 120, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5, opacity: fade(u, 2.2) });
      tx(346, 246, '모델 기반 (앞 장)', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: a2 });
      tx(652, 246, '모델 프리 (이번 장)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) });
      mc.left.items.slice(0, 2).forEach((s, i) => tx(346, 278 + i * 28, s, { 'font-size': 13.5, opacity: a2 }));
      mc.right.items.slice(0, 2).forEach((s, i) => tx(652, 278 + i * 28, s, { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 2.2) })); } }

  // =========================================================
  // 2. Q 함수 — 4×4 표, 전부 0
  // =========================================================
  const QX = 600, QY = 92;
  function s2(t, c) { const { k, u } = c; GX = 40; GY = 80; CP = 126; CW = 118;
    world({ agent: 0 });
    if (k === 0) { // V 는 4칸, Q 는 16칸
      tx(360, 70, 'V(s)', { 'font-size': 16, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.2), 'text-anchor': 'middle' });
      [0, 1, 2, 3].forEach((r) => { el('rect', { x: 330, y: QY + r * 62, width: 58, height: 58, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.3 + r * 0.1) }); mono(320, QY + r * 62 + 34, 'S' + r, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.3) }); });
      tx(QX + 120, 50, 'Q(s, a)', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      qtab(QX, QY, null, { op: (r, cc) => fade(u, 0.9 + (r * 4 + cc) * 0.06, 0.2) });
      grow(400, 210, QX - 40, 210, E(u, 0.8, 1.1), MUT, { dash: '6 5' });
      mono(480, 378, 'V 4칸  →  Q 4 × 4 = 16칸', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
    if (k === 1) { const z = c.beat.qtable.values; qtab(QX, QY, z, { op: (r, cc) => fade(u, 0.4 + (r * 4 + cc) * 0.08, 0.2) });
      M(330, 130, 'Q = np.zeros(', fade(u, 0.2), { fill: INK }); M(330, 158, '  (N_STATES, N_ACTIONS))', fade(u, 0.2), { fill: INK });
      const n = Math.min(16, Math.floor(clamp((u - 0.4) / 1.3) * 16 + 0.001)); mono(330, 220, `${n} / 16 칸 = 0.0`, { 'font-size': 20, 'font-weight': 800, fill: ACC });
      T(330, 300, '0 은 "모른다" 이지 "나쁘다" 가 아니다', fade(u, 2.0), { 'font-size': 15 }); }
    if (k === 2) { const q = c.beat.qtable; qtab(QX, QY, q.values, { hi: u > 1.2 ? q.hi : null });
      el('rect', { x: QX - 34, y: QY - 3, width: 4 * 62 + 34, height: 62, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 0.4) });
      M(330, 130, 'np.argmax(Q[state])', fade(u, 0.3), { fill: INK });
      M(330, 170, 'Q[S0] = [0, 0, 0, 0]', fade(u, 0.7), { fill: MUT });
      M(330, 210, '→ 0번 = ↑', fade(u, 1.3), { fill: WARN, 'font-size': 18 });
      T(330, 280, '전부 0 이라 동점 — 첫 행동을', fade(u, 1.8), { 'font-size': 15 }); T(330, 306, '고를 뿐, 근거는 없다', fade(u, 1.8), { 'font-size': 15 });
      T(330, 360, 'P 없이 행동을 고르는 한 줄', fade(u, 2.3), { fill: ACC, 'font-weight': 800 }); }
    if (k === 3) { const q = c.beat.qtable; qtab(QX, QY, q.values, {});
      for (let i = 0; i < 12; i++) { const r = Math.floor(i / 4), cc = i % 4, a = fade(u, 0.4 + i * 0.08, 0.2) * (1 - fade(u, 1.6, 0.4));
        if (a > 0) tx(QX + cc * 62 + 48, QY + r * 62 + 17, '?', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: a }); }
      M(330, 140, 'Q = np.zeros((4, 4))', fade(u, 0.2), { fill: INK });
      T(330, 200, '채워진 칸', fade(u, 0.3)); mono(330, 236, '0 / 16', { 'font-size': 26, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      T(330, 300, '학습 = 이 16칸을', fade(u, 1.8), { 'font-weight': 800 }); T(330, 326, '경험으로 채우는 일', fade(u, 1.8), { 'font-weight': 800 }); } }

  // =========================================================
  // 3. Q-learning 업데이트 한 줄
  // =========================================================
  const Q3X = 680, Q3Y = 110;
  function tdRows(rows, u, a0) { rows.forEach((r, i) => { const y = 92 + i * 30, a = fade(u, a0 + i * 0.12), col = r.tone === 'good' ? GOOD : r.tone === 'warn' ? WARN : r.tone === 'final' ? ACC : INK;
      if (r.tone === 'final' || r.tone === 'warn') el('rect', { x: 316, y: y - 20, width: 320, height: 28, rx: 5, fill: r.tone === 'final' ? ACCBG : C.WARNBG, opacity: a });
      tx(324, y, r.k, { 'font-size': 14, fill: INK, opacity: a }); mono(628, y, r.v, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: a }); }); }
  function numLine(y, marks, o) { o = o || {}; const X = (v) => 330 + v * 25;
    el('line', { x1: X(0), y1: y, x2: X(10), y2: y, stroke: MUT, 'stroke-width': 2 });
    [0, 5, 10].forEach((v) => { el('line', { x1: X(v), y1: y - 5, x2: X(v), y2: y + 5, stroke: MUT }); mono(X(v), y + 24, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    marks.forEach(([v, s, col, op, up]) => { if ((op ?? 1) <= 0) return; el('circle', { cx: X(v), cy: y, r: 8, fill: col, opacity: op ?? 1 });
      tx(X(v), up ? y - 16 : y + 44, s, { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op ?? 1 }); });
    return X; }
  function s3(t, c) { const { k, u } = c, b = c.beat; GX = 40; GY = 110; CP = 120; CW = 112;
    const q = qv(c, u); qtab(Q3X, Q3Y, q, { cs: 60, hi: b.qtable.hi });
    if (k === 0) { world({ agent: 0 });
      [['α 학습률', 0.5, ACC, '한 번의 경험을 얼마나 믿을지'], ['γ 할인율', 0.9, INFO, '미래를 얼마나 믿을지'], ['ε 탐험률', 1.0, WARN, '처음엔 전부 무작위']].forEach(([n, v, col, d], i) => { const y = 96 + i * 82, a = fade(u, 0.3 + i * 0.4);
        tx(316, y, n, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: a });
        if (a > 0) hbar(316, y + 12, 230, v * E(u, 0.3 + i * 0.4, 0.9 + i * 0.4), 1, { col, text: v.toFixed(1), h: 16 });
        tx(316, y + 50, d, { 'font-size': 13.5, fill: MUT, opacity: a }); }); }
    if (k === 1) { world({ agent: u < 0.5 ? 2 : glide(2, 3, seg(u, 0.5, 1.2)), arrow: b.grid.arrow, aru: E(u, 0.3, 0.6), hot: [2] });
      fly(gx(3), gy(3), 470, 140, seg(u, 1.3, 1.9), 'r = +10', { mono: true, stay: true, fill: GOOD });
      M(330, 220, '(s, a, r, s′) = (S2, →, 10, S3)', fade(u, 1.9), { fill: INK, 'font-size': 14.5 });
      T(330, 270, '경험 하나로 표의 한 칸을 고친다', fade(u, 2.3), { 'font-size': 15 }); }
    if (k >= 2) world({ agent: 3, arrow: b.grid.arrow, hot: [2] });
    if (k === 2) { tdRows(b.tdBox.rows, u, 0.3);
      const X = numLine(330, [[10, 'td_target 10.0', WARN, fade(u, 1.4), true], [0, 'Q(S2,→) = 0', MUT, fade(u, 1.0)]]);
      T(316, 400, '방금 겪어 본 값 = r + γ · max Q(S3, ·)', fade(u, 2.1), { 'font-size': 14.5 }); }
    if (k === 3) { tdRows(b.tdBox.rows, u, 0.2);
      const X = numLine(330, [[10, '목표 10.0', WARN, 1, true], [0, '알던 값 0', MUT, 1]]);
      const g = E(u, 0.9, 1.6); if (g > 0) { el('path', { d: `M${X(0)},${312} L${X(0)},${302} L${lerp(X(0), X(10), g)},${302} L${lerp(X(0), X(10), g)},${312}`, fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); }
      mono(X(5), 292, 'TD 오차 = 10.0', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (k === 4) { tdRows(b.tdBox.rows, u, 0.1); const m = lerp(0, 5, E(u, 1.0, 1.8));
      const X = numLine(330, [[10, '목표 10.0', WARN, 0.5, true], [m, `Q = ${m.toFixed(1)}`, ACC, 1, false]]);
      mono(X(2.5), 300, '× α 0.5', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); }
    if (k === 5) { tdRows(b.tdBox.rows, u, -1); const seq = [5, 7.5, 8.75];
      const X = numLine(330, [[10, '참값 10', GOOD, 1, true]].concat(seq.map((v, i) => [v, v === 8.75 ? '8.75' : v.toFixed(1), ACC, fade(u, 0.4 + i * 0.5), i % 2 === 1])));
      seq.slice(1).forEach((v, i) => grow(X(seq[i]) + 8, 330, X(v) - 9, 330, E(u, 0.6 + i * 0.5, 0.9 + i * 0.5), ACC, { sw: 2.5 }));
      M(330, 404, 'state ← next_state · n_steps += 1', fade(u, 1.9), { fill: INK, 'font-size': 14 }); } }

  // =========================================================
  // 4. 탐험 vs 활용 (ε-greedy)
  // =========================================================
  const epsAt = (ep) => Math.max(0.05, Math.pow(0.995, ep));
  function epsChart(u, a, b, o) { o = o || {}; const ax = axes(400, 90, 480, 230, { x: [0, 650], y: [0, 1], xt: [0, 150, 300, 450, 600], yt: [0, 0.5, 1], xl: '에피소드', yl: 'ε', grid: true });
    const pts = []; for (let ep = 0; ep <= 650; ep += 10) pts.push([ep, epsAt(ep)]);
    line(ax, pts, clamp((u - a) / (b - a)), WARN, { sw: 3 });
    el('line', { x1: ax.X(0), y1: ax.Y(0.05), x2: ax.X(650), y2: ax.Y(0.05), stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '6 5', opacity: fade(u, b) });
    mono(ax.X(650), ax.Y(0.05) - 8, '하한 0.05', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, b) });
    return ax; }
  function s4(t, c) { const { k, u } = c, b = c.beat, cmp = b.epsBox.compare; GX = 40; GY = 110; CP = 120; CW = 112;
    if (k <= 2) { qtab(Q3X, Q3Y, qv(c, u), { cs: 60, hi: b.qtable.hi, rowMax: k === 2 ? fade(u, 0.6) : 0 }); }
    const cmpRow = (i, y, a) => { const r = cmp[i], col = r.tone === 'good' ? GOOD : BAD;
      mono(316, y, r.name, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: a }); tx(316, y + 22, r.result, { 'font-size': 13.5, fill: MUT, opacity: a }); };
    if (k === 0) { // 활용만 하면 같은 길만 돈다
      const loop = (u * 0.8) % 1; world({ agent: loop < 0.5 ? glide(0, 2, loop * 2) : glide(2, 3, (loop - 0.5) * 2), hot: [0, 2] });
      grow(gx(0), gy(0) + 36, gx(2), gy(2) - 40, E(u, 0.3, 0.6), MUT, { sw: 3 }); grow(gx(2) + 36, gy(2), gx(3) - 40, gy(3), E(u, 0.6, 0.9), MUT, { sw: 3 });
      el('rect', { x: 316, y: 90, width: 300, height: 30, rx: 6, fill: C.WARNBG, opacity: fade(u, 0.3) }); el('rect', { x: 316 + 0, y: 90, width: 300, height: 30, rx: 6, fill: 'none', stroke: WARN, opacity: fade(u, 0.3) });
      el('rect', { x: 316, y: 90, width: 90, height: 30, rx: 6, fill: WARN, opacity: 0.8 * fade(u, 0.3) });
      tx(361, 111, 'ε 탐험', { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      tx(511, 111, '1−ε 활용 (argmax)', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      cmpRow(0, 190, fade(u, 1.4)); T(316, 270, '채워진 칸이 하나뿐이면', fade(u, 1.9), { 'font-size': 15 }); T(316, 296, '그 하나만 영원히 반복한다', fade(u, 1.9), { 'font-size': 15, fill: BAD }); }
    if (k === 1) { world({ agent: u < 0.9 ? 0 : glide(0, 1, seg(u, 0.9, 1.5)), arrow: b.grid.arrow, aru: E(u, 0.9, 1.3), acol: WARN, hot: [1] });
      const die = R.G(380, 120, pop(u, 0.2)); el('rect', { x: -26, y: -26, width: 52, height: 52, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 3 }, die);
      [[-12, -12], [12, 12], [0, 0], [12, -12], [-12, 12]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 4, fill: WARN }, die));
      M(430, 112, 'random() < ε', fade(u, 0.4), { fill: WARN }); M(430, 138, '→ 아무 행동이나', fade(u, 0.6), { fill: WARN });
      cmpRow(0, 210, 0.45); cmpRow(1, 270, fade(u, 1.6));
      T(316, 350, '안 가본 칸은 0 으로 남고 선택되지 않는다', fade(u, 2.2), { 'font-size': 14.5 }); }
    if (k === 2) { const pol = b.qtable.values.slice(0, 3).map((row) => AR[row.indexOf(Math.max(...row))]);
      world({ agent: 1, policy: pol, pu: E(u, 0.7, 1.6) });
      M(316, 112, 'return int(np.argmax(Q[state]))', fade(u, 0.3), { fill: INK, 'font-size': 14 });
      cmpRow(0, 180, 0.45); cmpRow(1, 236, 0.45); cmpRow(2, 292, fade(u, 1.6));
      T(316, 370, '행마다 가장 큰 칸 = 배운 대로 간다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 3) { world({ agent: 1, arrow: b.grid.arrow, acol: WARN });
      const ax = epsChart(u, 0.3, 1.8);
      b.epsBox.schedule.filter((s) => s.ep !== '하한').forEach((s, i) => { const ep = s.ep === 'ep 1' ? 1 : +s.ep.slice(3), a = fade(u, 0.5 + i * 0.35);
        el('circle', { cx: ax.X(ep), cy: ax.Y(s.eps), r: 6, fill: WARN, opacity: a });
        mono(ax.X(ep) + 10, ax.Y(s.eps) - 10, `${s.ep} · ${s.eps.toFixed(2)}`, { 'font-size': 13.5, 'font-weight': 700, fill: INK, opacity: a }); });
      M(400, 400, 'EPSILON, EPS_DECAY, EPS_MIN = 1.0, 0.995, 0.05', fade(u, 0.2), { fill: INK, 'font-size': 14 }); }
    if (k === 4) { world({ agent: 1, arrow: b.grid.arrow, acol: WARN });
      const ax = epsChart(3, 0, 0.01), ep = lerp(0, 520, E(u, 0.4, 2.3)), e = epsAt(ep);
      el('circle', { cx: ax.X(ep), cy: ax.Y(e), r: 9, fill: ACC });
      mono(ax.X(ep) + (ep > 330 ? -14 : 14), ax.Y(e) - 24, `ep ${Math.round(ep)} · ε ${e.toFixed(2)}`, { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': ep > 330 ? 'end' : 'start' });
      M(400, 400, 'EPSILON = max(EPS_MIN, EPSILON * EPS_DECAY)', fade(u, 0.2), { fill: INK, 'font-size': 14 }); } }

  // =========================================================
  // 5. 에피소드 반복 → 수렴 (학습 곡선은 걸음 수)
  // =========================================================
  function curve(c, u) { const bx = c.beat.curveBox, prevN = c.prev && c.prev.curveBox ? c.prev.curveBox.bars.length : 0, X0 = 626, W = 272, Y0 = 330, H = 220, mx = bx.max;
    tx(X0, 70, '최근 10회 평균 걸음 수', { 'font-size': 15, 'font-weight': 800 });
    el('line', { x1: X0, y1: Y0, x2: X0 + W, y2: Y0, stroke: MUT, 'stroke-width': 1.8 });
    const y2 = Y0 - H * 2 / mx; el('line', { x1: X0, y1: y2, x2: X0 + W, y2: y2, stroke: GOOD, 'stroke-width': 1.8, 'stroke-dasharray': '6 5' });
    tx(X0 + W + 6, y2 + 5, '최단 2', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD });
    const bw = W / 8; bx.bars.forEach((b, i) => { const g = i < prevN ? 1 : E(u, 0.4 + (i - prevN) * 0.4, 0.9 + (i - prevN) * 0.4), h = H * b.v / mx * g, x = X0 + i * bw + 4;
      if (g <= 0) return; el('rect', { x, y: Y0 - h, width: bw - 8, height: h, rx: 3, fill: b.v <= 3 ? GOOD : b.v <= 5 ? INFO : WARN, opacity: 0.8 });
      mono(x + (bw - 8) / 2, Y0 - h - 6, b.v.toFixed(1), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.7 + (i - prevN) * 0.4) });
      mono(x + (bw - 8) / 2, Y0 + 20, b.ep, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: g }); });
    tx(X0 + W, Y0 + 44, '에피소드', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
  function s5(t, c) { const { k, u } = c, b = c.beat; GX = 30; GY = 70; CP = 104; CW = 98;
    const q = qv(c, u); qtab(330, 100, q, { cs: 66, rowMax: k >= 3 ? fade(u, 0.3) : 0 });
    curve(c, u);
    if (k === 0) { world({ agent: 0 }); M(330, 412, 'for episode in range(300):', fade(u, 0.2), { fill: INK, 'font-size': 14 }); }
    if (k === 1) { world({ agent: 0 }); M(330, 412, 'steps_history.append(n_steps)', fade(u, 0.2), { fill: INK, 'font-size': 14 });
      T(30, 330, '보상은 언제나 +10 이라', fade(u, 1.8), { 'font-size': 14.5 }); T(30, 354, '도착 걸음 수를 잰다', fade(u, 1.8), { 'font-size': 14.5, fill: ACC }); }
    if (k === 2) { world({ agent: 0 }); M(330, 412, 'print(… 최근 10회 평균 걸음 수 …)', fade(u, 0.2), { fill: INK, 'font-size': 14 });
      T(30, 330, '곡선이 평평해지면', fade(u, 1.8), { 'font-size': 14.5 }); T(30, 354, '수렴 신호다', fade(u, 1.8), { 'font-size': 14.5, fill: ACC }); }
    if (k === 3) { world({ agent: 0, policy: b.grid.policy, pu: E(u, 0.5, 1.6) }); M(330, 412, 'Q.argmax(axis=1) → ↓ ↓ → ·', fade(u, 0.3), { fill: INK, 'font-size': 14 });
      T(30, 330, 'S0 은 ↓ · → 가 9.0 동점', fade(u, 1.9), { 'font-size': 14.5 }); T(30, 354, '— 어느 쪽도 두 걸음', fade(u, 1.9), { 'font-size': 14.5, fill: MUT }); }
    if (k === 4) { const w = seg(u, 0.4, 1.8); world({ agent: w < 0.5 ? glide(0, 2, w * 2) : glide(2, 3, (w - 0.5) * 2), policy: b.grid.policy, hot: [0, 2] });
      M(330, 412, 'print(np.round(Q, 2))', fade(u, 0.2), { fill: INK, 'font-size': 14 });
      T(30, 330, '상태가 폭발하면 표를 못 만든다', fade(u, 2.0), { 'font-size': 14.5, fill: BAD }); T(30, 354, '→ 다음 장 DQN', fade(u, 2.3), { 'font-size': 14.5, fill: ACC, 'font-weight': 800 }); } }

  R.page({ title: 'Q 테이블이 채워지는 과정', scenes: [s1, s2, s3, s4, s5] });
})();
