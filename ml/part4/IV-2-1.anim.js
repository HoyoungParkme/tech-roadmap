/* IV-2-1 DQN — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 무대의 주인공: 상태 수 로그 막대, 아타리 프레임 4장, Q 네트워크(4 → 128 → 128 → 2), 리플레이 버퍼 칸 20개,
 *               온라인망·타깃망 가중치 격자와 동기화 계단, 학습 루프 고리와 아타리 점수 막대 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, cross, check, lock, axes, line, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const T = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15.5, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  const M = (x, y, s, op, a) => mono(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: op ?? 1 }, a || {}));
  const hash = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

  // =========================================================
  // 1. Q 테이블의 붕괴 — 상태 수 (로그 눈금)
  // =========================================================
  const lg10 = (s) => { const m = s.match(/10\^(\d+)/); if (m) return +m[1]; return Math.log10(+s.replace(/[~,+]/g, '')); };
  function stateChart(rows, u, prevN) { const X0 = 230, W = 320, MAXL = 200, Y0 = 92, RH = 52, sx = W / MAXL;
    tx(40, 56, '상태 수 (자릿수, 로그 눈금)', { 'font-size': 15, 'font-weight': 800, fill: MUT });
    const ax80 = X0 + 80 * sx; el('line', { x1: ax80, y1: 70, x2: ax80, y2: Y0 + 5 * RH - 10, stroke: WARN, 'stroke-width': 1.8, 'stroke-dasharray': '6 5' });
    tx(ax80 + 6, 74, '우주 원자 10^80', { 'font-size': 13.5, 'font-weight': 700, fill: WARN });
    rows.forEach((r, i) => { const y = Y0 + i * RH, g = i < prevN ? 1 : E(u, 0.3 + (i - prevN) * 0.3, 0.9 + (i - prevN) * 0.3), L = lg10(r.states), off = L > MAXL, ok = r.table === 'ok';
      if (g <= 0) return; T(40, y + 6, r.env, 1, { 'font-size': 15, 'font-weight': 700 });
      const w = Math.max(4, Math.min(L, MAXL) * sx) * g;
      el('rect', { x: X0, y: y - 10, width: w, height: 22, rx: 4, fill: ok ? GOOD : BAD, opacity: 0.8 });
      if (off && g > 0.98) { [0, 10].forEach((d) => el('line', { x1: X0 + W - 30 + d, y1: y - 16, x2: X0 + W - 38 + d, y2: y + 18, stroke: PANEL, 'stroke-width': 5 }));
        mono(X0 + W + 8, y + 6, '10^67970 →', { 'font-size': 14.5, 'font-weight': 800, fill: BAD }); }
      else mono(X0 + w + 8, y + 6, r.states, { 'font-size': 14.5, 'font-weight': 800, fill: ok ? GOOD : BAD, opacity: fade(u, 0.6 + (i - Math.max(prevN, 0)) * 0.3) * (i < prevN ? 0 : 1) + (i < prevN ? 1 : 0) });
      if (ok) check(X0 - 22, y + 1, 7, 1); else cross(X0 - 22, y + 1, 7, 1); }); }
  function ideaStrip(idea, u, hot) { const y = 372; el('rect', { x: 40, y: y - 26, width: 880, height: 56, rx: 10, fill: hot ? ACCBG : SOFT, stroke: hot ? ACC : GRID, 'stroke-width': 1.5 });
    mono(56, y - 4, idea.from.split(':')[0], { 'font-size': 14, 'font-weight': 800, fill: MUT });
    grow(170, y - 8, 214, y - 8, 1, hot ? ACC : MUT);
    tx(226, y - 3, idea.to, { 'font-size': 15, 'font-weight': 800, fill: hot ? ACC : INK });
    tx(226, y + 20, idea.gain, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) }); }
  function frame(x, y, s, ball, o) { o = o || {}; el('rect', { x, y, width: s, height: s, rx: 4, fill: o.fill || INK, stroke: o.stroke || 'none', 'stroke-width': 2, opacity: o.op ?? 1 });
    el('rect', { x: x + s * 0.15, y: y + s - 10, width: s * 0.3, height: 5, fill: OFF, opacity: o.op ?? 1 });
    el('circle', { cx: x + s * ball, cy: y + s * 0.4, r: Math.max(3, s * 0.06), fill: PANEL, opacity: o.op ?? 1 }); }
  function s1(t, c) { const { k, u } = c, p = c.beat.pane, prevN = c.prev ? c.prev.pane.rows.length : 0;
    stateChart(p.rows, u, prevN); ideaStrip(p.idea, u, k >= 5);
    const RX = 680;
    if (k === 0) { tx(RX, 70, 'Q[state][action]', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.3) });
      for (let r = 0; r < 6; r++) for (let cc = 0; cc < 4; cc++) el('rect', { x: RX + cc * 52, y: 90 + r * 34, width: 48, height: 30, rx: 4, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.4 + (r * 4 + cc) * 0.04, 0.2) });
      T(RX, 318, '칸마다 값 하나를 외운다', fade(u, 1.6)); }
    if (k === 1) { const n = Math.round(lerp(0, 400, E(u, 0.3, 1.8)));
      for (let i = 0; i < 400; i++) { if (i >= n) break; el('rect', { x: RX + (i % 20) * 11, y: 82 + Math.floor(i / 20) * 11, width: 9, height: 9, rx: 1.5, fill: ACC, opacity: 0.55 }); }
      mono(RX, 318, `${n}칸`, { 'font-size': 22, 'font-weight': 800, fill: ACC }); mono(RX + 110, 318, '· 3.2KB', { 'font-size': 18, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 2) { for (let i = 3; i >= 0; i--) frame(RX + i * 18, 80 + i * 18, 110, 0.3 + i * 0.05, { op: fade(u, 0.3 + (3 - i) * 0.15) });
      M(RX, 262, '84 × 84 × 4 = 28,224 픽셀', fade(u, 1.0), { fill: INK, 'font-size': 14.5 });
      M(RX, 292, '256 ^ 28224', fade(u, 1.4), { fill: BAD }); M(RX, 320, '≈ 10^67970 개 상태', fade(u, 1.8), { fill: BAD }); }
    if (k === 3) { M(RX - 10, 110, 'q_table = np.zeros(', fade(u, 0.3), { fill: INK, 'font-size': 14.5 }); M(RX - 10, 136, '    (n_states, 4))', fade(u, 0.3), { fill: INK, 'font-size': 14.5 });
      const g = E(u, 0.9, 1.3); if (g > 0) el('line', { x1: RX - 14, y1: 118, x2: RX - 14 + 230 * g, y2: 118, stroke: BAD, 'stroke-width': 3 });
      cross(RX + 250, 120, 14, pop(u, 1.3));
      T(RX - 10, 200, 'MemoryError 이전에', fade(u, 1.6), { fill: BAD, 'font-weight': 800 }); T(RX - 10, 228, '행 개수를 정수로 못 적는다', fade(u, 1.8), { fill: BAD });
      T(RX - 10, 290, '메모리를 늘려도 답이 없다', fade(u, 2.2), { fill: MUT, 'font-weight': 400 }); }
    if (k === 4) { frame(RX, 80, 100, 0.40, { op: fade(u, 0.3) }); frame(RX + 150, 80, 100, 0.43, { op: fade(u, 0.6) });
      T(RX + 112, 136, '≈', fade(u, 0.6), { 'font-size': 24, 'font-weight': 800, fill: MUT });
      sub(RX + 200, 200, '공이 1픽셀 이동', fade(u, 0.7));
      [['행 #A  →  학습됨', GOOD], ['행 #B  →  0 (처음 봄)', BAD]].forEach(([s, col], i) => { card(RX + 125, 236 + i * 44, 250, 36, { rx: 6, text: s, fs: 14.5, mono: true, stroke: col, color: col, s: pop(u, 1.1 + i * 0.4) }); });
      T(RX, 334, '경험 재사용 0', fade(u, 2.1), { 'font-weight': 800, fill: BAD }); }
    if (k === 5) { const g = E(u, 0.4, 1.4);
      for (let r = 0; r < 5; r++) for (let cc = 0; cc < 4; cc++) el('rect', { x: RX + cc * 40 + g * 60, y: 90 + r * 32, width: 36, height: 28, rx: 4, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: 1 - g });
      card(RX + 120, 170, 170, 80, { rx: 14, stroke: ACC, fill: ACCBG, s: pop(u, 1.2) });
      if (u > 1.4) { mono(RX + 120, 166, 'Q(s; θ)', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); tx(RX + 120, 192, '파라미터 θ 를 학습', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
      fly(RX - 30, 170, RX + 12, 170, seg(u, 1.6, 2.0), 's', { mono: true, stay: true, fill: INFO });
      grow(RX + 206, 170, RX + 250, 170, E(u, 2.0, 2.3), ACC);
      M(RX + 150, 270, '[ Q(s,←), Q(s,→) ]', fade(u, 2.3), { 'text-anchor': 'middle', 'font-size': 14.5 }); }
    if (k === 6) { // 비슷한 화면 → 비슷한 출력
      [[0.40, 0], [0.43, 1]].forEach(([b, i]) => { frame(RX, 80 + i * 110, 80, b, { op: fade(u, 0.3 + i * 0.3) });
        grow(RX + 88, 120 + i * 110, RX + 138, 150 + i * 30, E(u, 0.8 + i * 0.3, 1.1 + i * 0.3), MUT); });
      card(RX + 175, 170, 70, 120, { rx: 10, text: 'net', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.6) });
      [0, 1].forEach((i) => { const y = 112 + i * 110, a = fade(u, 1.4 + i * 0.3); [0.5, 0.82].forEach((v, j) => el('rect', { x: RX + 230, y: y + j * 22, width: 60 * v * (1 + (i ? 0.03 : 0)), height: 16, rx: 3, fill: j ? ACC : INFO, opacity: a }));
        grow(RX + 212, 150 + i * 30, RX + 226, y + 18, E(u, 1.3 + i * 0.3, 1.5 + i * 0.3), MUT, { plain: true }); });
      T(RX, 330, '비슷한 화면 → 비슷한 Q값', fade(u, 2.1), { 'font-weight': 800, fill: ACC }); } }

  // =========================================================
  // 2. DQN 구조 — 표 조회가 forward pass 로
  // =========================================================
  const IX = 160, H1 = 300, H2 = 410, OX = 520, NY = 220;
  const ny = (n, i, sp) => NY + (i - (n - 1) / 2) * sp;
  function node(x, y, r, col, op, fill) { el('circle', { cx: x, cy: y, r, fill: fill || PANEL, stroke: col, 'stroke-width': 2.4, opacity: op }); }
  function edges(x1, n1, sp1, x2, n2, sp2, w, col) { if (w <= 0) return; for (let i = 0; i < n1; i++) for (let j = 0; j < n2; j++) { const y1 = ny(n1, i, sp1), y2 = ny(n2, j, sp2);
      el('line', { x1, y1, x2: lerp(x1, x2, w), y2: lerp(y1, y2, w), stroke: col || GRID, 'stroke-width': 1, opacity: 0.8 }); } }
  function hidden(x, a, lab) { for (let i = 0; i < 6; i++) node(x, ny(7, i < 3 ? i : i + 1, 34), 11, INFO, a); tx(x, ny(7, 3, 34) + 6, '⋮', { 'font-size': 18, 'text-anchor': 'middle', fill: MUT, opacity: a });
    mono(x, 362, lab, { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: a }); }
  function net(c, u, o) { o = o || {}; const p = c.beat.pane, pp = c.prev ? c.prev.pane : null, nh = p.netHidden.length, pnh = pp ? pp.netHidden.length : 0, dim = o.dim ?? 1;
    p.netInput.forEach((s, i) => { node(IX, ny(4, i, 52), 13, INK, dim); tx(IX - 22, ny(4, i, 52) + 5, s, { 'font-size': 14, 'font-weight': 600, 'text-anchor': 'end', opacity: dim }); });
    const a1 = nh >= 1 ? (pnh >= 1 ? 1 : E(u, 0.4, 1.0)) : 0, a2 = nh >= 2 ? (pnh >= 2 ? 1 : E(u, 0.4, 1.0)) : 0;
    if (a1 > 0) { edges(IX, 4, 52, H1, 7, 34, a1); hidden(H1, a1 * dim, '128 · ReLU'); }
    if (a2 > 0) { edges(H1, 7, 34, H2, 7, 34, a2); hidden(H2, a2 * dim, '128 · ReLU'); }
    if (a2 > 0) edges(H2, 7, 34, OX, 2, 70, a2);
    if (nh === 0) { el('rect', { x: IX + 40, y: 120, width: OX - IX - 80, height: 200, rx: 12, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: dim });
      tx((IX + OX) / 2, NY + 8, '?', { 'font-size': 30, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle', opacity: dim }); }
    p.netOutput.forEach((o2, j) => { const y = ny(2, j, 70), best = o.best && o2.best, v = pp && pp.netOutput[j] ? tween(pp.netOutput[j].q, o2.q, u) : o2.q;
      node(OX, y, 15, best ? ACC : INK, 1, best ? ACCBG : PANEL);
      tx(OX + 26, y - 6, o2.action, { 'font-size': 14.5, 'font-weight': 700, fill: best ? ACC : INK });
      mono(OX + 26, y + 16, v > 0 ? 'Q = ' + v.toFixed(2) : 'Q = ?', { 'font-size': 14.5, 'font-weight': 800, fill: v > 0 ? (best ? ACC : INK) : OFF });
      if (best) tx(OX + 108, y + 16, '★', { 'font-size': 18, fill: ACC, opacity: pop(u, 1.4) }); });
    tx(IX, 60, '입력: 상태 4', { 'font-size': 14, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle' });
    tx(OX, 60, '출력: 행동별 Q', { 'font-size': 14, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle' }); }
  function mapping(c, u) { const m = c.beat.pane.mapping, pn = c.prev ? c.prev.pane.mapping.length : 0, X = 680;
    tx(X, 60, '표 시대  →  신경망', { 'font-size': 15, 'font-weight': 800, fill: MUT });
    m.forEach((r, i) => { const y = 96 + i * 62, a = i < pn ? 1 : fade(u, 0.4 + (i - pn) * 0.3);
      el('rect', { x: X - 10, y: y - 22, width: 270, height: 54, rx: 8, fill: i >= pn ? ACCBG : SOFT, opacity: a });
      mono(X, y - 2, r.table.replace(/\s+\(.*/, ''), { 'font-size': 14, fill: MUT, opacity: a });
      mono(X, y + 22, '→ ' + r.net.replace(/\s+\(.*/, ''), { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: a }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { net(c, u); mapping(c, u); [0, 1, 2, 3].forEach((i) => el('circle', { cx: IX, cy: ny(4, i, 52), r: 13, fill: INFO, opacity: 0.5 * (1 - fade(u, 0.4 + i * 0.15)) })); }
    if (k === 1) { net(c, u); mapping(c, u);
      el('rect', { x: 26, y: 36, width: 620, height: 360, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '8 6', opacity: fade(u, 0.3) });
      M(40, 390, 'class QNetwork(nn.Module)', fade(u, 0.5), { 'font-size': 14.5 }); }
    if (k === 2) { net(c, u); mapping(c, u); M(40, 400, 'nn.Linear(state_dim, 128), nn.ReLU()', fade(u, 0.3), { 'font-size': 14 }); }
    if (k === 3) { net(c, u); mapping(c, u); M(40, 400, 'nn.Linear(128, n_actions)  # 행동 2개', fade(u, 0.3), { 'font-size': 14 }); }
    if (k === 4) { net(c, u); mapping(c, u);
      for (let i = 0; i < 4; i++) dot([[IX, ny(4, i, 52)], [H1, ny(7, (i * 2) % 7, 34)], [H2, ny(7, (i * 3 + 1) % 7, 34)], [OX, ny(2, i % 2, 70)]], seg(u, 0.2 + i * 0.12, 1.2 + i * 0.12), ACC, 6);
      M(40, 400, 'return self.layers(state)  # forward 1번', fade(u, 0.3), { 'font-size': 14 }); }
    if (k === 5) { const roll = u > 0.4; net(c, u, { dim: roll ? 0.3 : 1 }); mapping(c, u);
      const die = R.G(340, 110, pop(u, 0.3)); el('rect', { x: -24, y: -24, width: 48, height: 48, rx: 9, fill: PANEL, stroke: WARN, 'stroke-width': 3 }, die);
      [[-10, -10], [10, 10], [0, 0]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 4, fill: WARN }, die));
      M(380, 104, 'random() < ε', fade(u, 0.5), { fill: WARN }); M(380, 128, '→ randrange(2)', fade(u, 0.8), { fill: WARN });
      grow(372, 140, OX - 20, ny(2, 0, 70) - 8, E(u, 1.2, 1.7), MUT, { dash: '6 5' });
      pill(340, 380, 'Q값을 보지 않는다 (탐험)', WARN, pop(u, 1.9), { fs: 14.5 }); }
    if (k === 6) { net(c, u, { best: true }); mapping(c, u);
      M(40, 400, 'int(q_values.argmax().item())  →  1 (→)', fade(u, 0.6), { 'font-size': 14 }); } }

  // =========================================================
  // 3. 경험 리플레이 — 칸 20개
  // =========================================================
  const SX = 40, SY = 196, SW = 40, SG = 4;
  const ballPos = (i) => 0.5 + 0.38 * Math.sin(i * 0.45);   // 연속 경험은 공 위치가 비슷하다
  function slot(i, o) { o = o || {}; const x = SX + i * (SW + SG), y = o.y ?? SY, op = o.op ?? 1;
    el('rect', { x, y, width: SW, height: 54, rx: 6, fill: o.fill ? PANEL : SOFT, stroke: o.hot ? ACC : o.dash ? OFF : GRID, 'stroke-width': o.hot ? 3 : 1.5, 'stroke-dasharray': o.dash ? '4 4' : null, opacity: op });
    if (o.fill) { el('rect', { x: x + 4, y: y + 5, width: SW - 8, height: 26, rx: 3, fill: INK, opacity: op }); el('circle', { cx: x + 4 + (SW - 8) * ballPos(i), cy: y + 18, r: 4, fill: PANEL, opacity: op });
      mono(x + SW / 2, y + 48, 'e' + i, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: o.hot ? ACC : INK, opacity: op }); } }
  function buffer(n, o) { o = o || {}; for (let i = 0; i < 20; i++) slot(i, { fill: i < n, hot: o.hot === i, op: o.op ? o.op(i) : 1 });
    tx(SX, SY - 14, o.title || 'ReplayBuffer', { 'font-size': 15, 'font-weight': 800, fill: MUT }); }
  function s3(t, c) { const { k, u } = c, p = c.beat.pane, pp = c.prev ? c.prev.pane : null;
    if (k === 0) { const bad = p.badExample, good = p.goodExample;
      tx(40, 56, '순서대로 먹이면', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.2) });
      bad.frames.forEach((f, i) => { frame(40 + i * 84, 72, 70, 0.25 + i * 0.02, { op: fade(u, 0.3 + i * 0.12) }); });
      grow(470, 107, 530, 107, E(u, 1.0, 1.3), BAD); T(545, 100, '"왼쪽 장면" 에 과적합', fade(u, 1.2), { fill: BAD, 'font-weight': 800 }); T(545, 126, '→ 오른쪽을 잊는다 → 점수 붕괴', fade(u, 1.3), { 'font-size': 14.5 });
      tx(40, 236, '버퍼에서 무작위로 뽑으면', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      [0.25, 0.6, 0.5, 0.8].forEach((b, i) => { frame(40 + i * 84, 252, 70, b, { op: fade(u, 1.6 + i * 0.12) }); sub(75 + i * 84, 342, good.frames[i], fade(u, 1.6 + i * 0.12)); });
      grow(386, 287, 446, 287, E(u, 2.1, 2.3), MUT); T(460, 280, '시간 상관이 끊긴다 ≈ i.i.d.', fade(u, 2.2), { fill: GOOD, 'font-weight': 800 }); T(460, 306, 'SGD 의 가정을 되살린다', fade(u, 2.3), { 'font-size': 14.5 }); }
    if (k === 1) { buffer(0, { op: (i) => fade(u, 0.2 + i * 0.03, 0.2) });
      M(40, 80, 'class ReplayBuffer:', fade(u, 0.2), { fill: INK });
      ['s', 'a', 'r', "s′", 'done'].forEach((s, i) => card(120 + i * 92, 330, 80, 44, { rx: 8, text: s, fs: 17, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.0 + i * 0.15) }));
      T(40, 300, '경험 하나 = 다섯 값 묶음', fade(u, 1.0), { 'font-weight': 800 }); }
    if (k === 2) { // 가득 찬 버퍼의 동작 (예시: 점선)
      const sh = E(u, 0.8, 1.8);
      for (let i = 0; i < 20; i++) { const x = SX + i * (SW + SG) - sh * (SW + SG); if (i === 0) { el('rect', { x, y: SY, width: SW, height: 54, rx: 6, fill: SOFT, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: 1 - sh }); continue; }
        el('rect', { x, y: SY, width: SW, height: 54, rx: 6, fill: SOFT, stroke: OFF, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }); }
      el('rect', { x: SX + 19 * (SW + SG) + (1 - sh) * 60, y: SY, width: SW, height: 54, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: sh });
      tx(SX, SY - 14, '가득 찼을 때 (예시)', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      M(40, 90, 'self.buffer = deque(maxlen=100_000)', fade(u, 0.2), { fill: INK });
      tx(SX + 4, SY + 90, '← 가장 오래된 경험이 밀려남', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      tx(916, SY + 90, '새 경험이 끝에 붙음', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.2) });
      T(40, 350, '그림은 20칸, 실제 상한은 100,000개', fade(u, 2.0), { fill: MUT, 'font-weight': 400 }); }
    if (k === 3 || k === 4) { const n0 = pp ? pp.filled : 0, n = Math.round(lerp(n0, p.filled, E(u, 0.3, 1.8)));
      buffer(n, { hot: n - 1, title: `ReplayBuffer · ${n}개` });
      if (k === 3) { M(40, 90, 'self.buffer.append((s, a, r, s′, done))', fade(u, 0.2), { fill: INK }); T(40, 330, '저장은 시간 순서 그대로 — 이웃 칸끼리 공 위치가 비슷하다', fade(u, 2.0)); }
      if (k === 4) { [[0, 4], [5, 9], [10, 13]].forEach(([a, b], j) => { const x1 = SX + a * (SW + SG), x2 = SX + b * (SW + SG) + SW, g = fade(u, 1.9 + j * 0.15);
          el('path', { d: `M${x1},${SY + 64} L${x1},${SY + 72} L${x2},${SY + 72} L${x2},${SY + 64}`, fill: 'none', stroke: WARN, 'stroke-width': 2.2, opacity: g }); });
        T(40, 310, '연속 경험은 서로 닮았다 (상관관계)', fade(u, 2.1), { fill: WARN, 'font-weight': 800 }); T(40, 338, '→ 무작위 추출로 순서를 끊어야 한다', fade(u, 2.3)); } }
    if (k >= 5) { const sm = p.sampled; buffer(p.filled, { op: (i) => (k === 7 ? (i === 5 ? 1 : 0.35) : sm.includes(i) ? 0.35 : 1), hot: k === 7 ? 5 : null });
      if (k === 5) { sm.forEach((i, j) => { const x0 = SX + i * (SW + SG), x1 = 300 + j * 60, w = E(u, 0.4 + j * 0.25, 1.0 + j * 0.25);
          if (w > 0) { R.G(0, 0); el('rect', { x: lerp(x0, x1, w), y: lerp(SY, 320, w), width: SW, height: 54, rx: 6, fill: PANEL, stroke: ACC, 'stroke-width': 2.5 });
            el('rect', { x: lerp(x0, x1, w) + 4, y: lerp(SY, 320, w) + 5, width: SW - 8, height: 26, rx: 3, fill: INK }); el('circle', { cx: lerp(x0, x1, w) + 4 + (SW - 8) * ballPos(i), cy: lerp(SY, 320, w) + 18, r: 4, fill: PANEL });
            mono(lerp(x0, x1, w) + SW / 2, lerp(SY, 320, w) + 48, 'e' + i, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC }); } });
        M(40, 90, 'random.sample(self.buffer, batch_size)', fade(u, 0.2), { fill: INK }); tx(296, 310, '배치 (무작위 4개)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
        T(560, 352, '공 위치가 제각각 → 상관이 끊겼다', fade(u, 2.1), { 'font-weight': 800 }); }
      if (k === 6) { const cols = [['states', INFO], ['actions', INK], ['rewards', GOOD], ['next_states', INFO], ['dones', WARN]];
        cols.forEach(([nm, col], j) => { const x = 60 + j * 178, a = fade(u, 0.3 + j * 0.25);
          mono(x, 312, nm, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: a });
          sm.forEach((i, r) => { el('rect', { x: x + r * 36, y: 324, width: 32, height: 32, rx: 4, fill: PANEL, stroke: col, 'stroke-width': 1.8, opacity: a }); mono(x + r * 36 + 16, 345, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: a }); }); });
        M(40, 90, 'torch.stack(states), torch.tensor(actions), …', fade(u, 0.2), { fill: INK }); T(40, 392, '항목별로 묶은 텐서 5개 → 바로 학습 루프로', fade(u, 1.9), { 'font-size': 15 }); }
      if (k === 7) { [['배치 1', sm.map((i) => 'e' + i)], ['배치 2', ['…', 'e5', '…', '…']]].forEach(([nm, items], j) => { const y = 312 + j * 50, a = fade(u, 0.3 + j * 0.6);
          tx(40, y + 26, nm, { 'font-size': 15, 'font-weight': 800, opacity: a });
          items.forEach((s, r) => card(150 + r * 74, y + 20, 64, 36, { rx: 6, text: s, fs: 14.5, mono: true, stroke: s === 'e5' ? ACC : GRID, color: s === 'e5' ? ACC : MUT, fill: s === 'e5' ? ACCBG : PANEL, s: pop(u, 0.4 + j * 0.6 + r * 0.08) })); });
        T(520, 330, '경험 1개가 여러 배치에서 다시 쓰인다', fade(u, 1.6), { 'font-weight': 800, fill: ACC }); T(520, 358, '시뮬레이션이 비쌀수록 이득', fade(u, 2.0), { 'font-size': 14.5 });
        M(40, 90, '# 부수 효과: 경험 재사용 → 데이터 효율', fade(u, 0.2), { fill: MUT }); } } }

  // =========================================================
  // 4. 타깃 네트워크 — 가중치 격자와 동기화
  // =========================================================
  const wv = (seed, i, drift) => hash(seed * 31 + i) * 0.8 + 0.1 + (drift || 0) * (hash(i * 7 + 3) - 0.5) * 0.5;
  function wnet(x, y, name, col, vals, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: 220, height: 186, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2.5, opacity: op });
    tx(x + 14, y + 26, name, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op });
    vals.forEach((v, i) => el('rect', { x: x + 18 + (i % 6) * 32, y: y + 42 + Math.floor(i / 6) * 32, width: 28, height: 28, rx: 4, fill: col, opacity: op * (0.12 + 0.75 * clamp(v)) }));
    if (o.sub) tx(x + 14, y + 210, o.sub, { 'font-size': 13.5, fill: MUT, opacity: op }); }
  const ON = (d) => Array.from({ length: 24 }, (_, i) => wv(1, i, d)), TG0 = Array.from({ length: 24 }, (_, i) => wv(2, i));
  function bull(x, y, s) { const g = R.G(x, y, s); [26, 17, 8].forEach((r, i) => el('circle', { cx: 0, cy: 0, r, fill: i % 2 ? PANEL : C.BADBG, stroke: BAD, 'stroke-width': 2 }, g)); return g; }
  function s4(t, c) { const { k, u } = c, p = c.beat.pane;
    if (k === 0) { wnet(40, 70, '온라인망 θ (하나뿐)', ACC, ON(Math.sin(u * 3) * 0.6));
      const jumps = Math.floor(clamp((u - 0.3) / 2.1) * 4), tx0 = 470 + jumps * 70, ty0 = 150 - jumps * 22;
      bull(tx0, ty0, 1); for (let j = 0; j < jumps; j++) bull(470 + j * 70, 150 - j * 22, 0.5);
      const ph = ((u - 0.3) / 2.1 * 4) % 1; if (u > 0.3 && u < 2.4) dot([[270, 160], [tx0, ty0]], ph, ACC, 6);
      tx(400, 250, '쏠 때마다 과녁도 같이 움직인다', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      p.problem.steps.forEach((s, i) => tx(400 + Math.floor(i / 3) * 250, 296 + (i % 3) * 32, s, { 'font-size': 14.5, fill: i === 4 ? BAD : INK, 'font-weight': i === 4 ? 800 : 500, opacity: fade(u, 1.2 + i * 0.2) })); }
    if (k === 1) { wnet(40, 70, '온라인망 θ', ACC, ON(0));
      M(320, 100, 'SYNC_EVERY = 1_000   # 스텝', fade(u, 0.2), { fill: INK }); M(320, 130, 'GAMMA = 0.99', fade(u, 0.4), { fill: MUT });
      const X0 = 320, W = 580, Y = 250; el('line', { x1: X0, y1: Y, x2: X0 + W * E(u, 0.5, 1.4), y2: Y, stroke: MUT, 'stroke-width': 2.5 });
      for (let i = 0; i <= 4; i++) { const x = X0 + i * W / 4, a = fade(u, 0.6 + i * 0.25); el('line', { x1: x, y1: Y - 12, x2: x, y2: Y + 12, stroke: i ? INFO : MUT, 'stroke-width': 3, opacity: a });
        mono(x, Y + 34, (i * 1000).toLocaleString('en-US'), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: a }); if (i) tx(x, Y - 22, '과녁 이동', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: a }); }
      T(320, 340, '그 사이 1,000 스텝 동안 과녁은 멈춰 있다', fade(u, 2.0), { 'font-weight': 800 }); }
    if (k === 2) { wnet(40, 70, '온라인망 θ', ACC, ON(0), { op: fade(u, 0.2), sub: '학습 대상' }); wnet(360, 70, '타깃망 θ⁻', INFO, TG0, { op: fade(u, 0.8), sub: '과녁 (고정)' });
      M(40, 330, 'online_net = QNetwork(4, 2)', fade(u, 0.3), { fill: INK, 'font-size': 14 }); M(40, 356, 'target_net = QNetwork(4, 2)', fade(u, 0.9), { fill: INK, 'font-size': 14 });
      tx(640, 160, '구조는 같고', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.5) }); tx(640, 188, '가중치는 아직 다르다', { 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); }
    if (k === 3) { const cp = E(u, 0.4, 1.6), tv = TG0.map((v, i) => lerp(v, ON(0)[i], clamp(cp * 24 - i)));
      wnet(40, 70, '온라인망 θ', ACC, ON(0)); wnet(360, 70, '타깃망 θ⁻', INFO, tv);
      for (let i = 0; i < 3; i++) dot([[260, 140 + i * 30], [360, 140 + i * 30]], seg(u, 0.4 + i * 0.3, 1.0 + i * 0.3), ACC, 6);
      lock(590, 96, true, INFO, pop(u, 1.8)); M(360, 300, 'target_net.eval()', fade(u, 1.8), { fill: INFO, 'font-size': 14 });
      M(40, 300, 'load_state_dict(online.state_dict())', fade(u, 0.3), { fill: INK, 'font-size': 14 });
      tx(640, 160, '시작 가중치 = 완전히 같음', { 'font-size': 15.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      tx(640, 192, '옵티마이저엔 online 만', { 'font-size': 15, opacity: fade(u, 2.0) }); tx(640, 218, '→ 타깃망은 갱신되지 않는다', { 'font-size': 15, opacity: fade(u, 2.0) }); }
    if (k === 4 || k === 5) { wnet(40, 70, '온라인망 θ', ACC, ON(0.4), { op: 0.45 }); wnet(360, 70, '타깃망 θ⁻ (고정)', INFO, ON(0));
      const parts = [['r', GOOD], [' + γ · ', INK], ['max Q_target(s′)', INFO]]; let x = 620;
      if (k === 4) { parts.forEach(([s, col], i) => { mono(x, 120, s, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.3) }); x += tw(s, 16); });
        grow(584, 170, 680, 134, E(u, 1.2, 1.7), ACC); cross(150, 163, 26, pop(u, 1.9));
        tx(620, 200, 'TD 타깃은 반드시 타깃망으로', { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 1.8) }); tx(620, 228, 'online 으로 만들면 자기 추격 재발', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 2.1) }); }
      if (k === 5) { const dn = [0, 0, 1, 0]; tx(40, 300, '배치 4개의 max Q_target(s′)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
        dn.forEach((d, i) => { const x = 40 + i * 150, h = 30 + 20 * hash(i + 9), z = d && u > 1.8, a = fade(u, 0.3 + i * 0.15);
          el('rect', { x, y: 380 - (z ? 2 : h), width: 50, height: z ? 2 : h, rx: 3, fill: INFO, opacity: a });
          mono(x + 60, 370, `× (1 − ${d})`, { 'font-size': 14, 'font-weight': 700, fill: d ? WARN : MUT, opacity: fade(u, 1.0 + i * 0.15) });
          if (z) mono(x + 25, 368, '0', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' }); });
        M(620, 120, 'with torch.no_grad():', fade(u, 0.2), { fill: INK, 'font-size': 14 }); M(620, 146, '  next_q = target_net(…).max(1)', fade(u, 0.3), { fill: INFO, 'font-size': 14 });
        tx(620, 210, 'done 이면 미래 가치는 0', { 'font-size': 15.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.9) }); } }
    if (k === 6) { const ax = axes(80, 70, 560, 250, { x: [0, 4000], y: [0, 1], xt: [0, 1000, 2000, 3000, 4000], xl: '학습 스텝', yl: '가중치 하나의 값 (예시)' });
      const on = (s) => 0.45 + 0.25 * Math.sin(s / 520) + 0.12 * Math.sin(s / 170 + 1);
      const pts = []; for (let s = 0; s <= 4000; s += 40) pts.push([s, on(s)]);
      const st = []; for (let s = 0; s <= 4000; s += 40) { st.push([s, on(Math.floor(s / 1000) * 1000)]); if ((s + 40) % 1000 === 0 && s + 40 <= 4000) st.push([s + 39.9, on(Math.floor(s / 1000) * 1000)]); }
      const g = clamp((u - 0.3) / 1.9); line(ax, pts, g, ACC, { sw: 2.6 }); line(ax, st, g, INFO, { sw: 3.2 });
      [['온라인망 θ — 매 스텝 움직임', ACC], ['타깃망 θ⁻ — 1,000 스텝마다 따라잡음', INFO]].forEach(([s, col], i) => { el('rect', { x: 670, y: 92 + i * 34, width: 22, height: 6, fill: col, opacity: fade(u, 0.3) }); tx(700, 100 + i * 34, s, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.3) }); });
      p.fixed.steps.forEach((s, i) => tx(670, 200 + i * 30, s, { 'font-size': 14.5, opacity: fade(u, 1.0 + i * 0.3) })); } }

  // =========================================================
  // 5. 학습 루프 완성 — 고리 + 아타리 점수
  // =========================================================
  const LC = [300, 222], LR = 158;
  const NODES = [['① env.step', '행동 → 결과'], ['② buffer.push', '쌓기만 한다'], ['③ sample(64)', '무작위 배치'], ['TD 타깃', '타깃망으로'], ['MSE → step', '온라인망 갱신'], ['④ 동기화 · ε↓', '1,000 스텝마다']];
  const npos = (i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / 6; return [LC[0] + Math.cos(a) * LR * 1.25, LC[1] + Math.sin(a) * LR]; };
  const HOT = { 4: [0], 5: [1], 6: [2, 3], 7: [4], 8: [5] };
  function ring(k, u) { const hot = HOT[k] || [];
    NODES.forEach(([n, d], i) => { const [x, y] = npos(i), on = hot.includes(i), a = k === 0 ? fade(u, 0.3 + i * 0.3) : 1;
      const [x2, y2] = npos((i + 1) % 6); const g = k === 0 ? E(u, 0.5 + i * 0.3, 0.8 + i * 0.3) : 1;
      const dx = x2 - x, dy = y2 - y, L = Math.hypot(dx, dy); grow(x + dx / L * 62, y + dy / L * 30, x2 - dx / L * 66, y2 - dy / L * 32, g, on ? ACC : MUT, { sw: on ? 3 : 2 });
      card(x, y, 150, 50, { rx: 10, stroke: on ? ACC : k >= 4 ? GRID : INK, fill: on ? ACCBG : PANEL, sw: on ? 3 : 1.8, op: a * (k >= 4 && !on ? 0.75 : 1), s: on ? 1 + bump(u, 0.2) : 1 });
      tx(x, y - 2, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: on ? ACC : INK, opacity: a });
      tx(x, y + 17, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: a }); }); }
  function atari(c, u) { const a = c.beat.pane.atari, pr = c.prev ? c.prev.pane.atari.rows.length : 0, X = 650, W = 200, MX = 2600;
    tx(X, 52, 'Atari (Nature 2015) · 인간 = 100', { 'font-size': 14, 'font-weight': 800, fill: MUT });
    const hx = X + W * 100 / MX;
    a.rows.forEach((r, i) => { const y = 78 + i * 46, g = i < pr ? 1 : E(u, 0.3, 1.1), w = Math.max(3, W * r.dqn / MX * g);
      tx(X, y, r.game, { 'font-size': 13.5, 'font-weight': 700, opacity: i < pr ? 1 : fade(u, 0.3) });
      el('rect', { x: X, y: y + 7, width: w, height: 14, rx: 3, fill: r.dqn >= 100 ? GOOD : BAD, opacity: 0.85 });
      el('line', { x1: hx, y1: y + 3, x2: hx, y2: y + 25, stroke: WARN, 'stroke-width': 2.2 });
      mono(X + w + 8, y + 19, String(Math.round(r.dqn * g)), { 'font-size': 14, 'font-weight': 800, fill: r.dqn >= 100 ? GOOD : BAD }); });
    const ln = c.beat.pane.lineage, pl = c.prev ? c.prev.pane.lineage.length : 0;
    ln.forEach((l, i) => { const x = 650 + (i % 2) * 150, y = 290 + Math.floor(i / 2) * 44; card(x + 66, y, 138, 36, { rx: 8, text: l.name.replace(' DQN', ''), fs: 14, stroke: i ? INFO : ACC, color: i ? INFO : ACC, s: i < pl ? 1 : pop(u, 1.2) }); });
    tx(650, 262, '계보', { 'font-size': 14, 'font-weight': 800, fill: MUT }); }
  function cartpole(x, y, off, ang) { el('line', { x1: x - 120, y1: y + 22, x2: x + 120, y2: y + 22, stroke: MUT, 'stroke-width': 2 });
    el('rect', { x: x + off - 28, y: y, width: 56, height: 20, rx: 4, fill: INK });
    el('line', { x1: x + off, y1: y, x2: x + off + Math.sin(ang) * 70, y2: y - Math.cos(ang) * 70, stroke: WARN, 'stroke-width': 6, 'stroke-linecap': 'round' }); }
  function s5(t, c) { const { k, u } = c; ring(k, u); atari(c, u);
    const cx = LC[0], cy = LC[1];
    if (k === 0) tx(cx, cy + 6, '한 바퀴 = 한 스텝', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
    if (k === 1) { cartpole(cx, cy - 20, 0, 0.12 * Math.sin(u * 3)); M(cx, cy + 36, 'CartPole-v1', fade(u, 0.3), { 'text-anchor': 'middle' }); mono(cx, cy + 62, '상태 4 · 행동 2', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); }
    if (k === 2) [['Adam lr=1e-3', INFO], ['MSELoss', INFO], ['BATCH 64', ACC], ['MIN_BUFFER 1,000', ACC]].forEach(([s, col], i) => pill(cx, cy - 54 + i * 36, s, col, pop(u, 0.3 + i * 0.3), { mono: true, fs: 14 }));
    if (k === 3) { const st = Math.floor(lerp(0, 40, E(u, 0.4, 2.2))); M(cx, cy - 20, 'for episode in range(500)', fade(u, 0.2), { 'text-anchor': 'middle', fill: INK, 'font-size': 14 });
      mono(cx, cy + 20, `step = ${st}`, { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); tx(cx, cy + 50, 'while not done: step += 1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', class: 'mono' }); }
    if (k === 4) { cartpole(cx, cy - 20, lerp(-20, 20, E(u, 0.6, 1.6)), lerp(0.05, 0.25, E(u, 0.6, 1.6))); M(cx, cy + 40, 'env.step(action)', fade(u, 0.3), { 'text-anchor': 'middle', 'font-size': 14 });
      mono(cx, cy + 64, 'nxt, reward, term, trunc', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    if (k === 5) { dot([npos(0), npos(1)], seg(u, 0.3, 1.1), ACC, 8); M(cx, cy - 6, 'push(s, a, r, nxt, term)', fade(u, 0.9), { 'text-anchor': 'middle', 'font-size': 14 });
      tx(cx, cy + 22, '바로 학습하지 않는다', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); tx(cx, cy + 46, '시간 초과(trunc)는 종료 아님', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
    if (k === 6) { dot([npos(1), npos(2)], seg(u, 0.2, 0.8), ACC, 8); dot([npos(2), npos(3)], seg(u, 0.9, 1.5), ACC, 8);
      M(cx, cy - 10, 'len(buffer) ≥ 1,000 ?', fade(u, 0.3), { 'text-anchor': 'middle', fill: WARN, 'font-size': 14 }); M(cx, cy + 16, 'gather → 한 행동의 Q 만', fade(u, 1.6), { 'text-anchor': 'middle', 'font-size': 14 }); }
    if (k === 7) { dot([npos(3), npos(4)], seg(u, 0.2, 0.8), ACC, 8); M(cx, cy - 10, 'loss = MSE(q_pred, td_target)', fade(u, 0.5), { 'text-anchor': 'middle', fill: INK, 'font-size': 13.5 });
      mono(cx, cy + 18, 'zero_grad → backward → step', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); tx(cx, cy + 44, '온라인망 θ 만 갱신', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (k === 8) { dot([npos(4), npos(5)], seg(u, 0.2, 0.7), ACC, 8); M(cx, cy - 30, 'ε = max(0.05, ε × 0.995)', fade(u, 0.5), { 'text-anchor': 'middle', fill: INK, 'font-size': 13.5 });
      tx(cx, cy + 4, '한계: 행동이 이산일 때만', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(cx, cy + 28, '연속 행동은 argmax 불가', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      tx(cx, cy + 52, '→ 정책 경사 (IV-2-2)', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); } }

  R.page({ title: 'DQN — 표를 신경망으로', scenes: [s1, s2, s3, s4, s5] });
})();
