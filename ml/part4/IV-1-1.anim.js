/* IV-1-1 MDP·보상·벨만 방정식 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 무대의 주인공: 4×4 그리드월드(충전소 +10 · 계단 −10 · 가구 · 로봇), 칸마다 채워지는 V(s), Δ 수렴 곡선, 최적 정책 화살표 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, grow, fly, cross, check, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 페이지와 같은 MDP (gridworld_mdp.py) ----------
  const WALL = '1,1', CHG = '0,3', STR = '1,3', START = '3,0', TERM = { '0,3': 10, '1,3': -10 }, STEP_R = -0.1;
  const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }, ACTS = Object.keys(DIRS);
  const key = (r, c) => r + ',' + c, rc = (k) => k.split(',').map(Number);
  const ALL = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) ALL.push(key(r, c));
  const STATES = ALL.filter((k) => k !== WALL);
  function nxt(k, a) { const [r, c] = rc(k), [dr, dc] = DIRS[a], nr = r + dr, nc = c + dc;
    return nr < 0 || nr > 3 || nc < 0 || nc > 3 || key(nr, nc) === WALL ? k : key(nr, nc); }
  // 가치 반복 (제자리 갱신 — 파이썬 코드와 같은 순서). 회차마다 V 스냅샷과 Δ 를 남긴다
  const VI = {};
  function vi(g) { if (VI[g]) return VI[g]; const V = {}; STATES.forEach((k) => { V[k] = TERM[k] ?? 0; });
    const snaps = [{ ...V }], deltas = [null];
    for (let i = 0; i < 100; i++) { let d = 0;
      STATES.forEach((k) => { if (TERM[k] !== undefined) return; const best = Math.max(...ACTS.map((a) => STEP_R + g * V[nxt(k, a)])); d = Math.max(d, Math.abs(best - V[k])); V[k] = best; });
      snaps.push({ ...V }); deltas.push(d); if (d < 1e-4) break; }
    const pol = {}; STATES.forEach((k) => { if (TERM[k] !== undefined) return; let b = -1e9; ACTS.forEach((a) => { const q = STEP_R + g * snaps[snaps.length - 1][nxt(k, a)]; if (q > b) { b = q; pol[k] = a; } }); });
    return (VI[g] = { snaps, deltas, pol, last: snaps[snaps.length - 1] }); }
  const f1 = (v) => (Math.abs(v) < 0.005 ? '0.0' : (v < 0 ? '−' : '') + Math.abs(v).toFixed(v === 10 || v === -10 ? 0 : Math.abs(v) < 0.095 ? 2 : 1));
  const f2 = (v) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);

  // ---------- 격자 그리기 ----------
  const GX = 40, GY = 44, CP = 84, CW = 78;
  const cx = (k) => GX + rc(k)[1] * CP + CW / 2, cy = (k) => GY + rc(k)[0] * CP + CW / 2;
  function bolt(x, y, s, op) { const g = R.G(x, y, s, op); el('path', { d: 'M3,-14 L-7,2 L0,2 L-3,14 L8,-3 L1,-3 Z', fill: GOOD, stroke: GOOD, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g); return g; }
  function stairs(x, y, s, op) { const g = R.G(x, y, s, op); el('path', { d: 'M-13,12 L-13,4 L-5,4 L-5,-4 L3,-4 L3,-12 L13,-12 L13,12 Z', fill: C.BADBG, stroke: BAD, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g); return g; }
  function sofa(x, y, s, op) { const g = R.G(x, y, s, op); el('rect', { x: -22, y: -12, width: 44, height: 18, rx: 5, fill: OFF, stroke: MUT, 'stroke-width': 1.5 }, g);
    el('rect', { x: -26, y: -2, width: 52, height: 16, rx: 5, fill: GRID, stroke: MUT, 'stroke-width': 1.5 }, g); return g; }
  function robot(x, y, s, op) { const g = R.G(x, y, s, op);
    el('line', { x1: 0, y1: -18, x2: 0, y2: -25, stroke: INK, 'stroke-width': 2 }, g); el('circle', { cx: 0, cy: -26, r: 3, fill: ACC }, g);
    el('rect', { x: -15, y: -18, width: 30, height: 26, rx: 9, fill: PANEL, stroke: INK, 'stroke-width': 2.4 }, g);
    el('circle', { cx: -6, cy: -6, r: 3, fill: INK }, g); el('circle', { cx: 6, cy: -6, r: 3, fill: INK }, g);
    el('line', { x1: -13, y1: 12, x2: 13, y2: 12, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' }, g); return g; }
  // 화살표 하나 (칸 가운데에서 방향 쪽으로)
  function arrowIn(k, a, u, col, len) { if (u <= 0) return; const [dr, dc] = DIRS[a], L = len || 26, x = cx(k), y = cy(k);
    grow(x - dc * L * 0.5, y - dr * L * 0.5, x + dc * L * 0.5, y + dr * L * 0.5, u, col || ACC, { sw: 3 }); }
  // o: { lines(0→1), term, wall, rob:[r,c] or k, V, vop(k), hi, ring, coords, cellFill(k), skip(k) }
  function grid(o) { o = o || {}; const ln = o.lines ?? 1;
    ALL.forEach((k, i) => { const x = GX + rc(k)[1] * CP, y = GY + rc(k)[0] * CP, s = clamp(ln * 16 - i), isW = k === WALL && (o.wall ?? 1) > 0;
      if (s <= 0) return; let fill = PANEL, fop = 1;
      const v = o.V && o.V[k] != null ? o.V[k] : null;
      if (isW) fill = SOFT;
      el('rect', { x, y, width: CW, height: CW, rx: 7, fill, stroke: GRID, 'stroke-width': 1.8, opacity: s });
      if (v != null && !isW) { const a = clamp(Math.abs(v) / 10) * 0.55 * (o.vop ? o.vop(k) : 1); if (a > 0.01) el('rect', { x, y, width: CW, height: CW, rx: 7, fill: v > 0 ? GOOD : BAD, opacity: a }); }
      if (o.fill && o.fill(k)) el('rect', { x, y, width: CW, height: CW, rx: 7, fill: o.fill(k), opacity: 0.5 });
      if (o.coords !== false) mono(x + 6, y + 16, rc(k).join(','), { 'font-size': 13.5, fill: MUT, opacity: s * 0.9 }); });
    const tm = o.term ?? 1, wl = o.wall ?? 1;
    if (tm > 0) { bolt(cx(CHG) + 22, cy(CHG) - 18, tm, 1); stairs(cx(STR) + 22, cy(STR) - 18, tm, 1); }
    if (wl > 0) sofa(cx(WALL), cy(WALL) + 6, wl, 1);
    if (o.V) STATES.forEach((k) => { const v = o.V[k]; if (v == null) return; const op = o.vop ? o.vop(k) : 1; if (op <= 0) return;
      const isT = TERM[k] !== undefined; mono(cx(k) - (isT ? 6 : 0), cy(k) + 14, isT ? (v > 0 ? '+' : '') + f1(v) : f1(v), { 'font-size': isT ? 18 : 17, 'font-weight': 800, 'text-anchor': 'middle', fill: isT ? (v > 0 ? GOOD : BAD) : INK, opacity: op }); });
    else if (tm > 0) { mono(cx(CHG) - 8, cy(CHG) + 18, '+10', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: clamp(tm) });
      mono(cx(STR) - 8, cy(STR) + 18, '−10', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: clamp(tm) }); }
    if (o.ring) [].concat(o.ring).forEach((k) => el('rect', { x: GX + rc(k)[1] * CP - 3, y: GY + rc(k)[0] * CP - 3, width: CW + 6, height: CW + 6, rx: 9, fill: 'none', stroke: o.ringCol || WARN, 'stroke-width': 3.5 }));
    if (o.rob) { const [r, c] = Array.isArray(o.rob) ? o.rob : rc(o.rob); robot(GX + c * CP + CW / 2, GY + r * CP + CW / 2 + 6, o.robS ?? 1, 1); } }
  const at = (r, c) => [r, c];
  const robPath = (path, u, a, b) => { const n = path.length - 1, f = clamp((u - a) / (b - a)) * n, i = Math.min(n - 1, Math.floor(f)), w = E(f - i, 0, 1);
    const [r0, c0] = rc(path[i]), [r1, c1] = rc(path[Math.min(n, i + 1)]); return [lerp(r0, r1, w), lerp(c0, c1, w)]; };
  const RX = 420;   // 오른쪽 설명 칸 시작
  const head = (s, op, col) => tx(RX, 70, s, { 'font-size': 18, 'font-weight': 800, fill: col || INK, opacity: op ?? 1 });
  const line2 = (y, s, op, a) => tx(RX, y, s, Object.assign({ 'font-size': 15.5, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  const code = (y, s, op, a) => mono(RX, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: op ?? 1 }, a || {}));

  // =========================================================
  // 1. 지도학습과 뭐가 다른가
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      robot(480, 220, pop(u, 0.3) * 1.6, 1);
      const a = pop(u, 0.8), b = pop(u, 1.4);
      card(200, 220, 250, 120, { rx: 14, stroke: GOOD, fill: C.GOODBG, s: a }); bolt(200, 196, a * 1.4, 1);
      if (a > 0.5) { tx(200, 236, '충전소에 가라', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD }); mono(200, 264, '+10', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: GOOD }); }
      card(760, 220, 250, 120, { rx: 14, stroke: BAD, fill: C.BADBG, s: b }); stairs(760, 196, b * 1.4, 1);
      if (b > 0.5) { tx(760, 236, '계단은 피하라', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD }); mono(760, 264, '−10', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: BAD }); }
      grow(452, 214, 332, 214, E(u, 0.9, 1.3), MUT, { dash: '6 5' }); grow(508, 214, 628, 214, E(u, 1.5, 1.9), BAD, { dash: '6 5' });
      tx(480, 360, '목표를 한 문장으로 적는다 — 뒤의 숫자는 전부 이 문장의 번역이다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 1) {
      // 왼쪽: 지도학습 — 데이터마다 정답 라벨
      tx(60, 56, '지도학습 · 스팸 필터', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.2) });
      [['메일 1', '스팸'], ['메일 2', '정상'], ['메일 3', '스팸']].forEach(([m, l], i) => { const y = 82 + i * 50, s = fade(u, 0.3 + i * 0.15);
        el('rect', { x: 60, y, width: 150, height: 40, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: s }); tx(80, y + 26, m, { 'font-size': 15, opacity: s });
        card(290, y + 20, 110, 40, { rx: 6, text: l, fs: 15, stroke: l === '스팸' ? BAD : GOOD, color: l === '스팸' ? BAD : GOOD, s: pop(u, 0.6 + i * 0.15) }); });
      tx(60, 268, '정답 라벨을 사람이 준다 · 피드백은 즉시', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
      el('line', { x1: 470, y1: 40, x2: 470, y2: 300, stroke: GRID, 'stroke-width': 2, opacity: fade(u, 0.9) });
      // 오른쪽: 강화학습 — 행동열 뒤에 늦게 오는 보상
      tx(500, 56, '강화학습 · 로봇 청소기', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      const acts = ['↑', '↑', '→', '↑', '→', '→'];
      acts.forEach((a, i) => { const x = 520 + i * 66, s = pop(u, 1.1 + i * 0.12);
        card(x, 112, 50, 44, { rx: 8, text: a, fs: 20, stroke: ACC, color: ACC, s });
        mono(x, 168, i < acts.length - 1 ? '0' : '', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2 + i * 0.12) });
        if (i < acts.length - 1) mono(x, 200, '라벨 ?', { 'font-size': 13.5, 'text-anchor': 'middle', fill: OFF, opacity: fade(u, 1.3) }); });
      const rx = 520 + 5 * 66; card(rx, 176, 64, 34, { rx: 8, text: '+10', fs: 17, mono: true, stroke: GOOD, color: GOOD, fill: C.GOODBG, s: pop(u, 2.0) });
      mono(500, 238, '보상', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      tx(500, 268, '정답은 없고, 보상은 여러 행동 뒤에 온다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) });
      tx(480, 350, '라벨 대신 보상 · 즉시가 아니라 나중에', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.4) }); }
    if (k === 2) { grid({ lines: E(u, 0.3, 1.9), term: 0, wall: 0, V: null });
      head('SIZE = 4', fade(u, 0.2), ACC);
      const n = Math.min(16, Math.max(0, Math.floor(E(u, 0.3, 1.9) * 16 + 0.001)));
      mono(RX, 150, `칸 ${n}개`, { 'font-size': 30, 'font-weight': 800, fill: INK });
      line2(200, '4 × 4 격자가 로봇의 세계 전부다', fade(u, 2.0)); line2(228, '상태를 셀 수 있어야 가치도 셀 수 있다', fade(u, 2.3), { fill: MUT, 'font-weight': 400 }); }
    if (k === 3) { grid({ term: pop(u, 0.4), wall: 0 });
      code(80, 'CHARGER = (0, 3)   →  +10', fade(u, 0.4), { fill: GOOD }); code(112, 'STAIRS  = (1, 3)   →  −10', fade(u, 0.9), { fill: BAD });
      grow(RX - 10, 76, cx(CHG) + 44, cy(CHG) - 20, E(u, 0.5, 0.9), MUT, { dash: '5 5' });
      line2(170, '도착하면 에피소드가 끝난다', fade(u, 1.5)); line2(210, '보상이 놓이자 "좋은 칸 / 나쁜 칸" 이 생긴다', fade(u, 2.0), { fill: MUT, 'font-weight': 400 }); }
    if (k === 4) { grid({ wall: pop(u, 0.4), rob: u > 1.1 ? START : null, robS: pop(u, 1.1) });
      code(80, 'WALL  = (1, 1)   진입 불가', fade(u, 0.4), { fill: MUT }); code(112, 'START = (3, 0)   로봇 시작', fade(u, 1.1));
      line2(180, '세계 완성', fade(u, 1.8), { 'font-size': 18, 'font-weight': 800 });
      line2(212, '칸 16 · 종료 칸 2 · 가구 1 · 로봇 1', fade(u, 2.0), { fill: MUT, 'font-weight': 400 }); } }

  // =========================================================
  // 2. MDP 5요소
  // =========================================================
  const SYM = [['S', 0], ['A', 1], ['P', 4], ['R', 2], ['γ', 3]];   // [기호, 처음 나오는 beat]
  function tuple(k, u) { const x0 = RX; tx(x0, 64, '(', { 'font-size': 28, fill: MUT });
    SYM.forEach(([s, kk], i) => { const on = k >= kk, cur = k === kk || (s === 'P' && k === 5), x = x0 + 30 + i * 62;
      if (cur) el('rect', { x: x - 20, y: 34, width: 40, height: 40, rx: 8, fill: ACCBG, opacity: fade(u, 0.1) });
      tx(x, 64, s, { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, class: 'mono', fill: on ? (cur ? ACC : INK) : OFF });
      if (i < 4) tx(x + 31, 64, ',', { 'font-size': 26, fill: MUT }); });
    tx(x0 + 30 + 4 * 62 + 24, 64, ')', { 'font-size': 28, fill: MUT }); }
  function s2(t, c) { const { k, u } = c; tuple(k, u);
    if (k === 0) { grid({ coords: false });
      STATES.forEach((s, i) => { const o = fade(u, 0.3 + i * 0.1, 0.2); if (TERM[s] !== undefined) return; mono(cx(s), cy(s) + 6, String(i + 1), { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: o }); });
      [CHG, STR].forEach((s) => mono(GX + rc(s)[1] * CP + 8, GY + rc(s)[0] * CP + 18, String(STATES.indexOf(s) + 1), { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + STATES.indexOf(s) * 0.1, 0.2) }));
      cross(cx(WALL), cy(WALL), 22, pop(u, 1.9));
      const n = Math.min(15, Math.floor(clamp((u - 0.3) / 1.5) * 15 + 0.001));
      mono(RX, 150, `STATES = ${n}칸`, { 'font-size': 24, 'font-weight': 800, fill: ACC });
      line2(196, '16칸에서 가구 칸만 뺀다', fade(u, 1.9)); line2(226, '가구 칸은 애초에 상태가 아니다', fade(u, 2.2), { fill: MUT, 'font-weight': 400 }); }
    if (k === 1) { const s = '2,2'; grid({ rob: s });
      [['up', '(−1, 0)'], ['down', '(1, 0)'], ['left', '(0, −1)'], ['right', '(0, 1)']].forEach(([a, d], i) => { const [dr, dc] = DIRS[a], x = cx(s), y = cy(s), g = E(u, 0.4 + i * 0.3, 0.8 + i * 0.3);
        grow(x + dc * 30, y + dr * 30, x + dc * (30 + 50 * 1), y + dr * (30 + 50), g, ACC, { sw: 3.5 });
        mono(RX, 130 + i * 34, `"${a}"`.padEnd(8) + d, { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5 + i * 0.3) }); });
      line2(290, '칸마다 비교할 후보가 4개', fade(u, 1.9)); line2(320, '행동 = 좌표 변화량 (dr, dc)', fade(u, 2.2), { fill: MUT, 'font-weight': 400 }); }
    if (k === 2) { const path = ['3,0', '2,0', '1,0']; grid({ rob: robPath(path, u, 0.4, 1.6), ring: u > 1.8 ? [CHG, STR] : null, ringCol: u > 1.8 ? INK : WARN });
      path.slice(1).forEach((p, i) => fly(cx(path[i]), cy(path[i]) - 10, cx(p) + 40, cy(p) - 20, seg(u, 0.5 + i * 0.6, 1.0 + i * 0.6), '−0.1', { stay: true, fill: WARN, mono: true }));
      code(130, 'TERMINALS = { 충전소: +10, 계단: −10 }', fade(u, 1.8), { fill: INK });
      code(166, 'STEP_REWARD = −0.1   # 한 칸 = 배터리', fade(u, 0.5), { fill: WARN });
      line2(240, '이동마다 −0.1 이 없으면', fade(u, 2.2)); line2(268, '배회해도 손해가 없다 → 지름길을 배울 이유가 없다', fade(u, 2.4), { fill: MUT, 'font-weight': 400 }); }
    if (k === 3) { const path = ['0,3', '0,2', '0,1', '0,0', '1,0', '2,0', '3,0'];
      grid({ fill: (s) => (path.indexOf(s) > 0 && u > 0.3 + path.indexOf(s) * 0.25 ? ACCBG : null) });
      path.forEach((s, n) => { if (n === 0) return; mono(cx(s), cy(s) + 30, n === 6 ? '6칸 시작' : `${n}칸`, { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3 + n * 0.25) }); });
      code(110, 'GAMMA = 0.9   # 한 칸 멀어질 때마다 ×0.9', fade(u, 0.2));
      const ax = axes(RX + 30, 150, 440, 170, { x: [-0.5, 6.5], y: [0, 10], xt: [0, 1, 2, 3, 4, 5, 6], xl: '충전소까지 거리 (칸)', yt: [0, 5, 10] });
      for (let n = 0; n <= 6; n++) { const v = 10 * Math.pow(0.9, n), g = E(u, 0.4 + n * 0.25, 0.75 + n * 0.25), x = ax.X(n) - 18;
        if (g <= 0) continue; el('rect', { x, y: ax.Y(v * g), width: 36, height: ax.Y(0) - ax.Y(v * g), rx: 3, fill: n === 6 ? ACC : INFO, opacity: n === 6 ? 0.9 : 0.55 });
        mono(ax.X(n), ax.Y(v * g) - 6, v.toFixed(1), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: n === 6 ? ACC : INK, opacity: fade(u, 0.75 + n * 0.25) }); }
      tx(RX + 470, 140, '0.9⁶ × 10 ≈ 5.3', { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) }); }
    if (k === 4) { const go = E(u, 1.0, 1.6); grid({ rob: [lerp(2, 1, go), 0] });
      code(120, 'transition((2, 0), "up")', fade(u, 0.3), { fill: INK });
      mono(RX, 160, 'dr, dc = ACTIONS["up"] = (−1, 0)', { 'font-size': 15, fill: INFO, opacity: fade(u, 0.6) });
      mono(RX, 196, 'nr, nc = (2 − 1, 0 + 0) = (1, 0)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      grow(cx('2,0'), cy('2,0') - 32, cx('1,0'), cy('1,0') + 30, E(u, 0.8, 1.1), ACC, { sw: 3 });
      line2(260, 'P: 그 행동을 하면 어느 칸으로 가는가', fade(u, 1.8)); line2(290, '오늘은 이 함수를 우리가 전부 안다 (결정적)', fade(u, 2.2), { fill: MUT, 'font-weight': 400 }); }
    if (k === 5) { // 가구에 부딪힘 → 제자리, 격자 밖 → 제자리
      const b1 = seg(u, 0.3, 1.2), b2 = seg(u, 1.3, 2.2), bo = (x) => Math.sin(x * Math.PI) * 0.4;
      grid({ rob: u < 1.25 ? [1, bo(b1)] : [3, -bo(b2)] });
      if (u > 0.7) cross(cx(WALL), cy(WALL) - 24, 12, pop(u, 0.7));
      if (u > 1.7) cross(GX - 6, cy('3,0'), 12, pop(u, 1.7));
      code(120, '(1, 0) "right" → 가구 → (1, 0)', fade(u, 0.5), { fill: WARN }); code(156, '(3, 0) "left"  → 격자 밖 → (3, 0)', fade(u, 1.6), { fill: WARN });
      code(210, '정상 이동이면 → (nr, nc)', fade(u, 2.1), { fill: GOOD });
      line2(270, '부딪히면 제자리 — 이동비 −0.1 만 낸다', fade(u, 2.3)); } }

  // =========================================================
  // 3. 정책 π 와 가치 V(s)
  // =========================================================
  function s3(t, c) { const { k, u } = c, g9 = vi(0.9);
    if (k === 0) { const path = ['0,0', '0,1', '0,2', '0,3'];
      grid({ rob: robPath(path, u, 0.9, 2.0) });
      path.slice(0, 3).forEach((s, i) => arrowIn(s, 'right', E(u, 0.3 + i * 0.15, 0.6 + i * 0.15), ACC, 30));
      tx(RX, 70, 'π : 칸마다 화살표 하나 (행동 지도)', { 'font-size': 16.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      [['−0.1', WARN], ['−0.1', WARN], ['−0.1', WARN], ['+10', GOOD]].forEach(([s, col], i) => card(RX + 40 + i * 92, 130, 74, 36, { rx: 8, text: s, fs: 16, mono: true, stroke: col, color: col, s: pop(u, 1.0 + i * 0.3) }));
      ['', '× 0.9', '× 0.9²', '× 0.9³'].forEach((s, i) => mono(RX + 40 + i * 92, 172, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.1 + i * 0.3) }));
      const v = STEP_R + 0.9 * (STEP_R + 0.9 * (STEP_R + 0.9 * 10));
      tx(RX, 236, 'V(s): 그 지도대로 가면 받을', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(RX, 262, '할인된 보상의 합', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) });
      mono(RX, 304, `V(0,0) = ${f2(v)}`, { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) }); }
    if (k === 1) { const z = {}; STATES.forEach((s) => { z[s] = 0; });
      grid({ V: z, vop: (s) => fade(u, 0.3 + STATES.indexOf(s) * 0.1, 0.2), rob: START, robS: 0.0001 });
      code(80, 'V = {s: 0.0 for s in STATES}', fade(u, 0.2));
      const n = Math.min(15, Math.floor(clamp((u - 0.3) / 1.5) * 15 + 0.001)); mono(RX, 140, `${n} / 15 칸 = 0.0`, { 'font-size': 24, 'font-weight': 800 });
      line2(196, '아직 아무것도 모른다', fade(u, 1.9)); line2(226, '0 은 "모른다" 의 정직한 표현', fade(u, 2.2), { fill: MUT, 'font-weight': 400 }); }
    if (k === 2) { const z = {}; STATES.forEach((s) => { z[s] = TERM[s] !== undefined ? TERM[s] * E(u, 0.5, 1.4) : 0; });
      grid({ V: z });
      code(80, 'for t, reward in TERMINALS.items():', fade(u, 0.2), { fill: INK }); code(108, '    V[t] = reward', fade(u, 0.4));
      mono(RX, 160, 'V[충전소] = +10', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9) });
      mono(RX, 196, 'V[계단]   = −10', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
      line2(256, '고정점 두 개 — 나머지 칸의 값은', fade(u, 1.9)); line2(284, '전부 여기서 흘러나온다', fade(u, 1.9)); }
    if (k === 3) { const s0 = c.prev ? (() => { const z = {}; STATES.forEach((s) => { z[s] = TERM[s] ?? 0; }); return z; })() : null, s3v = g9.snaps[3], V = {};
      STATES.forEach((s) => { V[s] = tween(s0 ? s0[s] : 0, s3v[s], u); });
      grid({ V, ring: u > 0.9 ? '0,2' : null });
      tx(RX, 66, '가치 반복 3번 후', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      grow(cx('0,2') + 30, cy('0,2'), cx(CHG) - 30, cy(CHG), E(u, 1.0, 1.3), WARN, { sw: 3 });
      const parts = [['−0.1', WARN, 1.3, 'STEP_REWARD'], ['+', INK, 1.5], ['0.9', INFO, 1.6, 'GAMMA'], ['×', INK, 1.8], ['10', GOOD, 1.9, 'V(충전소)'], ['=', INK, 2.1], ['8.9', ACC, 2.2]];
      let x = RX; parts.forEach(([s, col, a, nm]) => { const w = tw(s, 26); mono(x, 170, s, { 'font-size': 26, 'font-weight': 800, fill: col, opacity: fade(u, a) });
        if (nm) tx(x + w / 2, 200, nm, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, a) }); x += w + 14; });
      line2(262, '좋은 칸의 "좋음" 이 이웃 칸의 가치로 계산된다', fade(u, 2.4)); } }

  // =========================================================
  // 4. 벨만 방정식 + 가치 반복
  // =========================================================
  const SWEEP = STATES;   // 파이썬 for s in STATES 순서
  function sweepV(g, it, u, a, b) { const A = vi(g).snaps[it - 1], B = vi(g).snaps[it], V = {}, f = clamp((u - a) / (b - a)) * SWEEP.length;
    SWEEP.forEach((s, i) => { V[s] = i < f ? B[s] : A[s]; }); return { V, cur: SWEEP[Math.min(SWEEP.length - 1, Math.floor(f))], f }; }
  function deltaChart(u, a, b, o) { o = o || {}; const g9 = vi(0.9), n = g9.deltas.length - 1, lg = (d) => Math.log10(Math.max(d, 1e-5));
    const ax = axes(RX + 50, 120, 400, 200, { x: [0, n], y: [-5, 1.2], xt: Array.from({ length: n + 1 }, (_, i) => i), xl: '반복 회차' });
    tx(RX + 50, 106, 'Δ (로그 눈금)', { 'font-size': 14, 'font-weight': 600, fill: MUT });
    [[1, '10'], [0, '1'], [-2, '0.01'], [-4, '1e-4']].forEach(([v, s]) => mono(RX + 42, ax.Y(v) + 5, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }));
    const pts = g9.deltas.slice(1).map((d, i) => [i + 1, lg(d)]);
    line(ax, pts, clamp((u - a) / (b - a)), ACC, { sw: 3 });
    pts.forEach(([x, y], i) => { if (u < a + (b - a) * (i / Math.max(1, pts.length - 1)) - 0.01) return; el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 5, fill: ACC });
      mono(ax.X(x) + 8, ax.Y(y) - 8, g9.deltas[i + 1] === 0 ? '0' : g9.deltas[i + 1].toFixed(2), { 'font-size': 13.5, 'font-weight': 700, fill: ACC }); });
    if (o.theta) { el('line', { x1: ax.X(0), y1: ax.Y(-4), x2: ax.X(n), y2: ax.Y(-4), stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: o.theta });
      tx(ax.X(n) + 4, ax.Y(-4) - 8, 'θ', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: o.theta }); }
    return { ax, n }; }
  function s4(t, c) { const { k, u } = c, g9 = vi(0.9);
    if (k === 0) { grid({ V: g9.snaps[0] });
      const parts = [['V(s)', ACC, '지금 가치'], ['=', INK], ['max', INK, '4방향 중'], ['[ R', WARN, '즉시 보상'], ['+', INK], ['γ·V(s′) ]', INFO, '다음 칸 가치']];
      let x = RX; parts.forEach(([s, col, nm], i) => { const w = tw(s, 22), a = 0.3 + i * 0.25; mono(x, 110, s, { 'font-size': 22, 'font-weight': 800, fill: col, opacity: fade(u, a) });
        if (nm) tx(x + w / 2, 140, nm, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, a + 0.1) }); x += w + 12; });
      line2(220, '자기 자신을 참조하는 정의라 한 번에 못 푼다', fade(u, 1.9)); line2(250, '→ 전부 대입하는 일을 반복한다', fade(u, 2.2), { fill: ACC }); }
    if (k === 1) { const sw = sweepV(0.9, 1, u, 0.7, 2.3); grid({ V: sw.V, ring: u > 0.7 && u < 2.3 ? sw.cur : null });
      code(80, 'for i in range(100):', fade(u, 0.2), { fill: INK }); code(108, '    delta = 0.0', fade(u, 0.4));
      mono(RX, 170, 'i = 1', { 'font-size': 26, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      line2(220, '칸을 하나씩 훑으며 값을 바꿔 쓴다', fade(u, 1.0)); line2(250, '방금 바꾼 값을 같은 회차 안에서 바로 쓴다', fade(u, 1.6), { fill: MUT, 'font-weight': 400 });
      line2(300, '전부 0 에서 시작해도 참값으로 수렴한다', fade(u, 2.3)); }
    if (k === 2) { const sw = sweepV(0.9, 2, u, 0.4, 2.2), cur = sw.cur, onT = TERM[cur] !== undefined && u > 0.4 && u < 2.2;
      grid({ V: sw.V, ring: u > 0.4 && u < 2.2 ? cur : null, ringCol: onT ? BAD : WARN });
      [CHG, STR].forEach((s) => { const i = SWEEP.indexOf(s), at0 = 0.4 + (i / SWEEP.length) * 1.8; mono(GX + rc(s)[1] * CP + CW / 2, GY + rc(s)[0] * CP + CW - 6, 'skip', { 'font-size': 13.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, at0, 0.2) }); });
      code(80, 'for s in STATES:', fade(u, 0.2), { fill: INK }); code(108, '    if s in TERMINALS: continue', fade(u, 0.3), { fill: BAD });
      mono(RX, 170, 'i = 2', { 'font-size': 26, 'font-weight': 800, fill: ACC });
      line2(230, '충전소 · 계단은 갱신하지 않는다', fade(u, 1.0)); line2(260, '+10 / −10 이 이웃 칸으로 스며든다', fade(u, 1.8), { fill: MUT, 'font-weight': 400 }); }
    if (k === 3) { const s = '1,2', V2 = g9.snaps[2], V = { ...V2 }; const best = Math.max(...ACTS.map((a) => STEP_R + 0.9 * V2[nxt(s, a)]));
      if (u > 2.1) V[s] = best; grid({ V, ring: s });
      const sym = { up: '↑', down: '↓', left: '←', right: '→' };
      ACTS.forEach((a, i) => { const n = nxt(s, a), q = STEP_R + 0.9 * V2[n], y = 120 + i * 44, ok = Math.abs(q - best) < 1e-9 && u > 1.8;
        const [dr, dc] = DIRS[a]; if (u > 0.4 + i * 0.3) grow(cx(s) + dc * 30, cy(s) + dr * 30, cx(s) + dc * 54, cy(s) + dr * 54, E(u, 0.4 + i * 0.3, 0.7 + i * 0.3), ok ? ACC : n === s ? BAD : MUT, { sw: ok ? 4 : 2.5 });
        if (ok) el('rect', { x: RX - 8, y: y - 24, width: 470, height: 34, rx: 6, fill: ACCBG });
        mono(RX, y, `${sym[a]}  −0.1 + 0.9 × ${f2(V2[n]).padStart(6)} = ${f2(q).padStart(6)}`, { 'font-size': 16, 'font-weight': ok ? 800 : 500, fill: ok ? ACC : n === s ? MUT : INK, opacity: fade(u, 0.4 + i * 0.3) });
        if (n === s) tx(RX + 455, y, '가구 → 제자리', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.3) }); });
      mono(RX, 330, `best = ${f2(best)}  → V(1,2)`, { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
      tx(RX, 362, '계단(→) 은 −9.10 이라 max 에서 버려진다', { 'font-size': 15, fill: BAD, opacity: fade(u, 2.3) }); }
    if (k === 4) { const n = g9.snaps.length - 1, it = Math.min(n, Math.floor(clamp((u - 0.3) / 2.1) * (n + 0.999))), V = g9.snaps[it];
      grid({ V });
      mono(RX, 70, `반복 ${it}회`, { 'font-size': 18, 'font-weight': 800, fill: ACC });
      deltaChart(u, 0.3, 2.4);
      tx(RX, 380, 'Δ = 이번 회차에 값이 가장 크게 움직인 양', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); }
    if (k === 5) { const n = g9.snaps.length - 1; grid({ V: g9.last });
      deltaChart(3, 0, 1, { theta: fade(u, 0.4) });
      check(RX + 300, 70, 13, pop(u, 1.2)); mono(RX, 76, `${n}번 반복 만에 수렴`, { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) });
      tx(RX, 380, 'Δ < θ → 모든 칸이 벨만 방정식을 동시에 만족', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); } }

  // =========================================================
  // 5. 최적 정책 추출
  // =========================================================
  const SYMS = { up: '↑', down: '↓', left: '←', right: '→' };
  function arrows(g, upto, col) { STATES.forEach((s, i) => { if (TERM[s] !== undefined) return; const a = g.pol[s], w = clamp(upto * STATES.length - i);
      if (w > 0) { const [dr, dc] = DIRS[a], x = cx(s), y = cy(s) - 12; grow(x - dc * 16, y - dr * 16, x + dc * 18, y + dr * 18, w, col || ACC, { sw: 3.2 }); } }); }
  function s5(t, c) { const { k, u } = c, g9 = vi(0.9);
    if (k === 0) { grid({ V: g9.last, vop: () => 1 });
      code(80, 'def extract_policy(V):', fade(u, 0.2), { fill: INK }); code(108, '    policy = {}', fade(u, 0.6));
      card(RX + 120, 190, 200, 70, { rx: 10, text: '{ }', fs: 26, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.9) });
      line2(270, '계산은 끝났다 — 남은 일은 V 를 읽는 것', fade(u, 1.6)); }
    if (k === 1) { const f = clamp((u - 0.3) / 1.8) * STATES.length, cur = STATES[Math.min(STATES.length - 1, Math.floor(f))];
      grid({ V: g9.last, ring: u > 0.3 && u < 2.1 ? cur : null, ringCol: TERM[cur] !== undefined ? BAD : WARN, vop: (s) => (TERM[s] !== undefined && f > STATES.indexOf(s) ? 0.35 : 1) });
      [CHG, STR].forEach((s) => { if (f > STATES.indexOf(s)) cross(cx(s) + 26, cy(s) + 22, 9, pop(u, 0.3 + STATES.indexOf(s) / STATES.length * 1.8)); });
      code(80, 'for s in STATES:', fade(u, 0.2), { fill: INK }); code(108, '    if s in TERMINALS: continue', fade(u, 0.3), { fill: BAD });
      line2(190, '도착점에는 나갈 방향이 필요 없다', fade(u, 1.4)); line2(220, '두 칸만 화살표가 비어 있게 된다', fade(u, 1.8), { fill: MUT, 'font-weight': 400 }); }
    if (k === 2) { const up = clamp((u - 0.3) / 1.9); grid({ V: g9.last, vop: (s) => (TERM[s] !== undefined ? 0.35 : 0.55) }); arrows(g9, up);
      code(70, 'policy[s] = max(ACTIONS, key=…)', fade(u, 0.2));
      const items = STATES.filter((s) => TERM[s] === undefined);
      items.forEach((s, i) => { const ix = STATES.indexOf(s), x = RX + (i < 7 ? 0 : 230), y = 112 + (i % 7) * 30;
        mono(x, y, `(${s.replace(',', ', ')}): "${g9.pol[s]}"`, { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: up * STATES.length > ix ? 1 : 0 }); });
      tx(RX, 340, '칸마다 R + γ·V(s′) 가 가장 큰 행동 하나', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.3) }); }
    if (k === 3) { const path = [START]; while (TERM[path[path.length - 1]] === undefined && path.length < 12) path.push(nxt(path[path.length - 1], g9.pol[path[path.length - 1]]));
      grid({ V: g9.last, vop: () => 0.5, rob: robPath(path, u, 0.6, 2.2), fill: (s) => (path.includes(s) && u > 0.4 ? ACCBG : null) }); arrows(g9, 1);
      code(80, 'V = value_iteration(V)', fade(u, 0.1), { fill: INK }); code(108, 'policy = extract_policy(V)', fade(u, 0.2), { fill: INK });
      mono(RX, 168, `policy[(3, 0)] == "${g9.pol[START]}"`, { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
      line2(230, `시작 칸에서 ${path.length - 1}걸음 만에 충전소`, fade(u, 2.2)); line2(260, '모든 화살표가 계단을 피해 충전소로 흐른다', fade(u, 2.4), { fill: MUT, 'font-weight': 400 }); }
    if (k === 4) { // γ 세 가지 — 값이 퍼지는 모습 비교 (실제 계산)
      [0.5, 0.9, 0.99].forEach((g, j) => { const r = vi(g), x0 = 40 + j * 312, y0 = 70, cs = 58, a = fade(u, 0.3 + j * 0.6);
        tx(x0, 52, `γ = ${g}`, { 'font-size': 17, 'font-weight': 800, fill: g === 0.9 ? ACC : INK, opacity: a });
        ALL.forEach((s) => { const [rr, cc] = rc(s), x = x0 + cc * cs, y = y0 + rr * cs, v = r.last[s];
          el('rect', { x, y, width: cs - 4, height: cs - 4, rx: 5, fill: s === WALL ? SOFT : PANEL, stroke: GRID, 'stroke-width': 1.2, opacity: a });
          if (s === WALL) return; el('rect', { x, y, width: cs - 4, height: cs - 4, rx: 5, fill: v > 0 ? GOOD : BAD, opacity: a * clamp(Math.abs(v) / 10) * 0.6 });
          mono(x + (cs - 4) / 2, y + (cs - 4) / 2 + 5, TERM[s] !== undefined ? (v > 0 ? '+10' : '−10') : f1(v), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: TERM[s] !== undefined ? (v > 0 ? GOOD : BAD) : INK, opacity: a }); });
        mono(x0, y0 + 4 * cs + 24, `V(3,0) = ${f2(r.last[START])}`, { 'font-size': 15, 'font-weight': 800, fill: g === 0.9 ? ACC : INK, opacity: a });
        mono(x0, y0 + 4 * cs + 50, `반복 ${r.snaps.length - 1}회`, { 'font-size': 14, fill: MUT, opacity: a }); });
      tx(480, 398, 'γ 가 작으면 먼 칸의 가치가 금방 0 에 가깝다 (근시안)', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.2) }); } }

  R.page({ title: '4×4 그리드월드 — 가치가 번지는 모습', scenes: [s1, s2, s3, s4, s5] });
})();
