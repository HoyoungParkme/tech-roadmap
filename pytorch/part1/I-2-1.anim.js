/* I-2-1 autograd 해부 — 동적 계산 그래프 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, grow, fly, dot, cells, zone, cross, check, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c, j, a = 0.2, d = 0.7) => (c.k > j ? 1 : c.k === j ? E(c.u, a, a + d) : 0);
  const pp = (c, j, a = 0.2) => (c.k > j ? 1 : c.k === j ? pop(c.u, a) : 0);
  // 텐서 노드(원): 이름 + 값
  function node(cx, cy, name, val, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('circle', { cx: 0, cy: 0, r: o.r || 32, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    tx(0, val != null ? -4 : 6, name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col }, g);
    if (val != null) mono(0, 16, val, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INK }, g); return g; }
  // 연산 노드(알약)
  const op = (cx, cy, s, sc, o) => card(cx, cy, Math.max(56, tw(s, 15) + 28), 38, Object.assign({ rx: 19, text: s, fs: 15, mono: true, stroke: INK, s: sc }, o || {}));
  function toggle(cx, cy, v, label) { const on = v > 0.5;
    el('rect', { x: cx - 26, y: cy - 13, width: 52, height: 26, rx: 13, fill: on ? ACC : SOFT, stroke: on ? ACC : OFF, 'stroke-width': 2 });
    el('circle', { cx: cx - 13 + 26 * v, cy, r: 10, fill: PANEL, stroke: on ? ACC : OFF, 'stroke-width': 2 });
    if (label) mono(cx + 36, cy + 5, label, { 'font-size': 14, 'font-weight': 700, fill: on ? ACC : MUT }); }

  // =========================================================
  // 1. 손으로 하던 미분을 backward() 가 대신한다
  // =========================================================
  const f = (x) => x * x + 3 * x;
  function s1(t, c) { const { k, u } = c;
    const ax = axes(80, 60, 380, 280, { x: [0, 3.2], y: [0, 20], xt: [0, 1, 2, 3], yt: [0, 5, 10, 15, 20], xl: 'x', yl: 'y = x² + 3x', grid: true });
    const pts = Array.from({ length: 33 }, (_, i) => [i * 0.1, f(i * 0.1)]);
    if (k >= 1) R.line(ax, pts, at(c, 1, 0.2, 1.0), INK, { sw: 2.8 });
    // x = 2 표시
    el('line', { x1: ax.X(2), y1: ax.Y(0), x2: ax.X(2), y2: ax.Y(k >= 1 ? 10 : 0) - 2, stroke: ACC, 'stroke-width': 1.6, 'stroke-dasharray': '4 4', opacity: at(c, 1, 1.0) });
    el('circle', { cx: ax.X(2), cy: ax.Y(k >= 1 ? 10 * at(c, 1, 1.0) : 0), r: 7, fill: ACC, opacity: at(c, 0, 0.3) });
    // 오른쪽: 손 계산 카드
    const PX = 520;
    card(730, 104, 400, 84, { rx: 12, stroke: INFO, sw: 2, s: pp(c, 0, 0.4) });
    tx(PX + 24, 92, '손 계산', { 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: at(c, 0, 0.5) });
    mono(PX + 110, 92, "dy/dx = 2x + 3", { 'font-size': 16, 'font-weight': 700, opacity: at(c, 0, 0.6) });
    mono(PX + 110, 122, 'x = 2  →  2·2 + 3 = 7', { 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: at(c, 0, 0.9) });
    if (k === 0) { toggle(560, 210, E(u, 1.2, 1.6), 'x = tensor(2.0, requires_grad=True)');
      sub(730, 300, 'autograd 가 이 7 을 맞히는지 본다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k <= 2) { mono(PX + 24, 200, 'y = x ** 2 + 3 * x', { 'font-size': 16, 'font-weight': 700, opacity: at(c, 1, 0.3) });
      mono(PX + 24, 230, 'tensor(10., grad_fn=<AddBackward0>)', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: at(c, 1, 1.4) });
      tx(ax.X(2) + 12, ax.Y(10) - 12, '(2, 10)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: at(c, 1, 1.4), class: 'mono' }); }
    if (k === 1) { sub(730, 300, '마지막 연산이 덧셈이라 AddBackward0', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // 접선 기울기 7
    const tg = k === 2 ? E(u, 0.4, 1.4) : 1, L = 0.9 * tg;
    if (k >= 2) el('line', { x1: ax.X(2 - L), y1: ax.Y(10 - 7 * L), x2: ax.X(2 + L), y2: ax.Y(10 + 7 * L), stroke: BAD, 'stroke-width': 3, opacity: k === 4 ? 0.35 : 1 });
    if (k === 2) { pill(PX + 110, 290, 'y.backward()', BAD, pop(u, 0.2), { mono: true, fs: 15 });
      card(730, 340, 250, 50, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.5, s: pop(u, 1.4) });
      mono(730, 346, 'x.grad = tensor(7.)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      if (u > 1.9) check(880, 340, 13, pop(u, 1.9));
      tx(ax.X(0.9), ax.Y(15), '기울기 7', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) }); return; }
    if (k === 3) { card(730, 240, 380, 110, { rx: 12, stroke: OFF, dash: '6 5', s: pop(u, 0.2) });
      mono(560, 220, 'def f(v):', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(590, 248, 'return v ** 2 + 3 * v', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5) });
      tx(560, 282, 'float 을 받아 float 을 낸다. 그래프가 없다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      sub(730, 340, '검산용으로 같은 식을 한 번 더 적는다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { const h = 0.5, sc = E(u, 0.4, 1.2);
      [2 - h, 2 + h].forEach((xv, i) => { el('circle', { cx: ax.X(xv), cy: ax.Y(f(xv)), r: 6, fill: WARN, opacity: fade(u, 0.3 + i * 0.2) }); });
      el('line', { x1: ax.X(1.2), y1: ax.Y(f(1.5) - 7 * 0.3), x2: ax.X(lerp(1.2, 2.8, sc)), y2: ax.Y(f(1.5) - 7 * 0.3 + 7 * 1.6 * sc), stroke: WARN, 'stroke-width': 2.6, 'stroke-dasharray': '7 4' });
      tx(ax.X(1.5), ax.Y(f(1.5)) + 26, 'x−h', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      tx(ax.X(2.5), ax.Y(f(2.5)) - 14, 'x+h', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      mono(PX + 24, 210, '(f(x+h) − f(x−h)) / 2h', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) });
      mono(PX + 24, 244, 'h = 1e-4  →  7.000000000019213', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.3) });
      tx(PX + 24, 276, '7 에 가깝지만 정확히 7 은 아니다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.7) });
      tx(PX + 24, 380, '그림은 보이도록 h 를 0.5 로 키워 그렸다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k5: 셋 비교
    [['손 계산', '7', INFO], ['backward()', '7.0', ACC], ['수치 미분', '7.000000000019', WARN]].forEach(([a, b, col], i) => { const y = 196 + i * 58;
      card(730, y, 400, 48, { rx: 10, stroke: col, sw: 2, s: pop(u, 0.2 + i * 0.3) });
      tx(PX + 26, y + 5, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.3) });
      mono(910, y + 6, b, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: fade(u, 0.3 + i * 0.3) }); });
    tx(730, 390, '자동 미분은 체인룰을 그대로 적용한 정확한 값이다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }

  // =========================================================
  // 2. 실행하는 순간 그래프가 자란다 (define-by-run)
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    if (k <= 3) { const X = [100, 92], Y = [100, 212], W = [100, 330], ADD = [270, 152], S = [420, 152], MUL = [570, 240], Z = [730, 240];
      [[X, 'x', '2.'], [Y, 'y', '3.'], [W, 'w', '4.']].forEach(([p, n, v], i) => node(p[0], p[1], n, v, { s: pp(c, 0, 0.2 + i * 0.2), col: ACC }));
      if (k === 0) { [X, Y, W].forEach((p, i) => mono(p[0] + 48, p[1] + 5, 'grad_fn = None', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0 + i * 0.15) }));
        tx(560, 210, 'leaf 셋. 아직 연산이 없어 그래프도 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
      const g1 = at(c, 1, 0.2, 0.5), g2 = at(c, 1, 1.2, 0.5);
      grow(X[0] + 32, X[1] + 10, ADD[0] - 30, ADD[1] - 10, g1, MUT); grow(Y[0] + 32, Y[1] - 10, ADD[0] - 30, ADD[1] + 10, g1, MUT);
      op(ADD[0], ADD[1], '+', pp(c, 1, 0.6)); grow(ADD[0] + 30, ADD[1], S[0] - 34, S[1], at(c, 1, 0.7, 0.3), MUT);
      node(S[0], S[1], 's', '5.', { s: pp(c, 1, 0.9) });
      grow(S[0] + 26, S[1] + 20, MUL[0] - 30, MUL[1] - 12, g2, MUT); grow(W[0] + 32, W[1] - 8, MUL[0] - 30, MUL[1] + 12, g2, MUT);
      op(MUL[0], MUL[1], '×', pp(c, 1, 1.6)); grow(MUL[0] + 30, MUL[1], Z[0] - 34, Z[1], at(c, 1, 1.7, 0.3), MUT);
      node(Z[0], Z[1], 'z', '20.', { s: pp(c, 1, 1.9) });
      if (k === 1) { tx(560, 380, '코드가 실행된 순서가 곧 그래프 모양이다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
      pill(S[0], S[1] - 56, 'AddBackward0', ACC, pp(c, 2, 0.2), { mono: true, fs: 14 }); pill(Z[0], Z[1] - 56, 'MulBackward0', ACC, pp(c, 2, 0.6), { mono: true, fs: 14 });
      if (k === 2) { tx(560, 380, 'grad_fn 이 None 이면 그래프 밖이다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
      // k3: next_functions — 거꾸로 가는 링크
      const back = (x1, y1, x2, y2, d) => grow(x1, y1, x2, y2, E(u, d, d + 0.5), BAD, { dash: '6 4' });
      back(Z[0] - 30, Z[1] + 40, MUL[0] + 20, MUL[1] + 30, 0.2);
      back(MUL[0] - 20, MUL[1] - 28, S[0] + 20, S[1] + 34, 0.5); back(MUL[0] - 34, MUL[1] + 20, W[0] + 38, W[1] + 6, 0.5);
      back(ADD[0] - 32, ADD[1] - 22, X[0] + 34, X[1] + 18, 1.0); back(ADD[0] - 32, ADD[1] + 22, Y[0] + 34, Y[1] - 18, 1.0);
      [X, Y, W].forEach((p, i) => pill(p[0], p[1] + 48, 'AccumulateGrad', BAD, pop(u, 1.3 + i * 0.1), { mono: true, fs: 13.5 }));
      mono(840, 330, 'z.grad_fn.next_functions', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(840, 356, '(AddBackward0, AccumulateGrad)', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) });
      tx(840, 392, '역전파가 따라갈 길', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k4·5: 파이썬 for 가 그대로 그래프
    card(170, 150, 270, 130, { rx: 10, fill: SOFT, stroke: GRID, s: pp(c, 4, 0.1) });
    ['def dynamic(x, n):', '    out = x', '    for _ in range(n):', '        out = out * x', '    return out'].forEach((s, i) => mono(48, 104 + i * 23, s, { 'font-size': 14, fill: i === 2 || i === 3 ? ACC : INK, 'font-weight': i === 2 ? 700 : 400, opacity: at(c, 4, 0.2) }));
    const n = k === 4 ? (u < 0.9 ? 1 : u < 1.7 ? 2 : 3) : 3;
    mono(170, 262, `n = ${n}`, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: at(c, 4, 0.3) });
    node(380, 160, 'a', '2.', { col: ACC, r: 30 });
    for (let i = 0; i < n; i++) { const x = 480 + i * 140, s = k === 4 ? pop(u, [0.4, 1.0, 1.8][i]) : 1;
      grow(i ? x - 82 : 410, 160, x - 40, 160, s > 0.3 ? 1 : 0, MUT); op(x, 160, 'Mul', s);
      el('path', { d: `M380,190 Q${(380 + x) / 2},${250 + i * 18} ${x},180`, fill: 'none', stroke: OFF, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: s > 0.3 ? 1 : 0 }); }
    if (k === 4) { tx(620, 330, 'n 이 입력마다 달라도 된다. 반복한 만큼 노드가 붙는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    grow(842, 160, 880, 160, 1, MUT); mono(905, 166, '16.', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
    tx(905, 130, 'x⁴', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.2) });
    dot([[880, 140], [480, 140], [400, 140]], seg(u, 0.4, 1.4), BAD, 7);
    card(380, 330, 230, 52, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.5, s: pop(u, 1.4) });
    mono(380, 336, 'a.grad = tensor(32.)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
    mono(700, 336, 'd(x⁴)/dx = 4x³ = 4·8 = 32', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }

  // =========================================================
  // 3. backward 는 .grad 에 더한다 — zero_grad 의 이유
  // =========================================================
  // seed 0 으로 실제 돌린 50 epoch 손실 (zero_grad 있음 / 없음)
  const LA = [1.5812, 1.5809, 1.5807, 1.5804, 1.5802, 1.58, 1.5798, 1.5796, 1.5794, 1.5792, 1.579, 1.5789, 1.5787, 1.5785, 1.5784, 1.5782, 1.5781, 1.578, 1.5778, 1.5777, 1.5776, 1.5775, 1.5774, 1.5772, 1.5771, 1.577, 1.5769, 1.5768, 1.5768, 1.5767, 1.5766, 1.5765, 1.5764, 1.5764, 1.5763, 1.5762, 1.5762, 1.5761, 1.576, 1.576, 1.5759, 1.5759, 1.5758, 1.5757, 1.5757, 1.5757, 1.5756, 1.5756, 1.5755, 1.5755];
  const LB = [1.5812, 1.5809, 1.5804, 1.5797, 1.5789, 1.578, 1.5771, 1.5762, 1.5755, 1.5749, 1.5746, 1.5745, 1.5746, 1.575, 1.5756, 1.5763, 1.5771, 1.578, 1.5789, 1.5796, 1.5802, 1.5806, 1.5808, 1.5808, 1.5805, 1.58, 1.5794, 1.5787, 1.5779, 1.5771, 1.5764, 1.5758, 1.5754, 1.5752, 1.5751, 1.5753, 1.5757, 1.5762, 1.5769, 1.5775, 1.5782, 1.5789, 1.5794, 1.5798, 1.58, 1.58, 1.5798, 1.5795, 1.5791, 1.5785];
  function bucket(x, y, h, val, max, col, o) { o = o || {}; const fh = (h * clamp(val / max));
    el('rect', { x, y, width: 70, height: h, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2.2 });
    el('rect', { x: x + 3, y: y + h - fh, width: 64, height: Math.max(0, fh - 3), rx: 6, fill: col, opacity: 0.75 });
    const ty = y + h - (h * 4) / max; el('line', { x1: x - 14, y1: ty, x2: x + 84, y2: ty, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
    tx(x + 92, ty + 5, '정답 4', { 'font-size': 14, 'font-weight': 700, fill: GOOD });
    mono(x + 35, y + h + 26, 'w.grad', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 });
    mono(x + 35, y - 12, val.toFixed(1), { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 3) { const W = [140, 200], Lo = [400, 200];
      node(W[0], W[1], 'w', '2.0', { col: ACC, s: pp(c, 0, 0.2), r: 36 });
      grow(W[0] + 38, W[1], Lo[0] - 70, W[1], at(c, 0, 0.5, 0.4), MUT); op(262, W[1], 'w ** 2', pp(c, 0, 0.6));
      node(Lo[0], Lo[1], 'loss', null, { s: pp(c, 0, 0.9), r: 36 });
      tx(270, 330, 'dloss/dw = 2w = 4', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: at(c, 0, 1.2), class: 'mono' });
      // 양동이 값
      const v = k === 0 ? 0 : k === 1 ? 4 * E(u, 0.9, 1.5) : k === 2 ? 4 + 4 * E(u, 0.9, 1.5) : (u < 0.9 ? lerp(8, 0, E(u, 0.2, 0.8)) : 4 * E(u, 1.3, 1.9));
      const col = v > 4.05 ? BAD : ACC;
      bucket(640, 80, 260, v, 10, col);
      if (k >= 1) { const back = k === 3 ? seg(u, 0.9, 1.4) : seg(u, 0.2, 0.9);
        dot([[Lo[0] - 36, Lo[1] + 20], [W[0] + 36, W[1] + 20]], back, BAD, 7); dot([[W[0], W[1] + 36], [W[0], 300], [640, 300], [675, 300]], k === 3 ? seg(u, 1.0, 1.4) : seg(u, 0.5, 1.0), BAD, 7);
        pill(Lo[0], 130, k === 3 ? 'loss3.backward()' : k === 2 ? 'loss2.backward()' : 'loss1.backward()', BAD, k === 1 || k === 2 ? pop(u, 0.1) : 1, { mono: true, fs: 14 }); }
      if (k === 2) { tx(540, 380, '4 + 4 = 8. 덮어쓰지 않고 더한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) }); }
      if (k === 3) { pill(500, 60, 'w.grad.zero_()', ACC, pop(u, 0.1), { mono: true, fs: 15 }); if (u > 2.0) check(800, 60, 13, pop(u, 2.0)); }
      return; }
    if (k === 4) { const blk = (x, y, w, h, name, sh, col, d) => { el('rect', { x, y, width: w, height: h, rx: 6, fill: SOFT, stroke: col, 'stroke-width': 2.2, opacity: fade(u, d) });
        tx(x + w / 2, y - 12, name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, d) }); mono(x + w / 2, y + h + 22, sh, { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, d + 0.1) }); };
      blk(70, 80, 90, 230, 'x', '(100, 3)', INK, 0.2); blk(210, 80, 34, 230, 'y', '(100, 1)', INK, 0.5);
      blk(330, 160, 34, 80, 'W', '(3, 1)', ACC, 0.8); mono(347, 205, '0', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, opacity: fade(u, 0.9) });
      tx(347, 300, 'requires_grad', { 'text-anchor': 'middle', 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.0) });
      card(640, 200, 300, 80, { rx: 12, stroke: INFO, sw: 2.2, s: pop(u, 1.3) });
      mono(640, 194, 'SGD([W], lr=0.01)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4) });
      tx(640, 220, '갱신할 파라미터 목록을 받는다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
      grow(490, 200, 370, 200, E(u, 1.7, 2.1), INFO); return; }
    if (k <= 6) { // 학습 루프 + 실제 손실 곡선
      const CX = 170, CY = 200, RR = 90, steps = [['zero_grad()', ACC, -90], ['backward()', BAD, 30], ['step()', INFO, 150]];
      el('circle', { cx: CX, cy: CY, r: RR, fill: 'none', stroke: GRID, 'stroke-width': 3 });
      steps.forEach(([s, col, a], i) => { const r = (a * Math.PI) / 180, x = CX + RR * Math.cos(r), y = CY + RR * Math.sin(r);
        const off = k === 6 && i === 0; pill(x, y, s, off ? OFF : col, 1, { mono: true, fs: 14, op: off ? 0.5 : 1 }); if (off) cross(x, y, 10, pop(u, 0.4)); });
      const ang = (((k === 5 ? u : u) * 360) / 1.2 - 90) * Math.PI / 180; el('circle', { cx: CX + (RR - 22) * Math.cos(ang), cy: CY + (RR - 22) * Math.sin(ang), r: 6, fill: INK });
      mono(CX, CY + 6, '× 50', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      const ax = axes(420, 60, 470, 260, { x: [0, 49], y: [1.574, 1.582], xt: [0, 10, 20, 30, 40, 49], yt: [1.574, 1.578, 1.582], xl: 'epoch', yl: 'loss', grid: true });
      R.line(ax, LA.map((v, i) => [i, v]), k === 5 ? E(u, 0.3, 2.0) : 1, ACC, { sw: 3 });
      tx(ax.X(49) - 4, ax.Y(LA[49]) + 22, 'zero_grad 있음', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 5 ? fade(u, 2.0) : 1 });
      if (k === 6) { R.line(ax, LB.map((v, i) => [i, v]), E(u, 0.5, 2.1), BAD, { sw: 3 });
        tx(ax.X(22), ax.Y(1.5812) - 4, 'zero_grad 없음', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }
      tx(655, 402, '실행 예: torch.manual_seed(0), 같은 데이터', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); return; }
    // k7: retain_graph
    const gop = 1 - E(u, 0.5, 1.1);
    node(150, 140, 'w', null, { col: ACC, r: 30 });
    grow(182, 140, 312, 140, 1, MUT, { op: Math.max(0.15, gop), dash: gop < 0.9 ? '5 5' : null }); op(360, 140, 'w ** 2', 1, { op: Math.max(0.2, gop), dash: gop < 0.9 ? '5 5' : null });
    grow(408, 140, 508, 140, 1, MUT, { op: Math.max(0.15, gop) }); node(550, 140, 'loss', null, { r: 34, op: Math.max(0.3, gop) });
    pill(780, 140, '1번째 backward()', BAD, 1, { mono: true, fs: 14 });
    tx(360, 92, '끝나면 그래프를 버린다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9) });
    pill(780, 210, '2번째 backward()', BAD, pop(u, 1.2), { mono: true, fs: 14 }); if (u > 1.5) cross(890, 210, 11, pop(u, 1.5));
    mono(480, 266, 'RuntimeError: Trying to backward through the graph a second time', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
    card(480, 340, 560, 52, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2, s: pop(u, 2.0) });
    mono(480, 346, 'loss.backward(retain_graph=True)  → 그래프 보존', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) }); }

  // =========================================================
  // 4. 그래프에서 내리기 — detach · no_grad · 동결 · .item()
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { node(110, 150, 'x', '2.', { col: ACC, s: pop(u, 0.1) }); grow(142, 150, 230, 150, E(u, 0.2, 0.5), MUT); op(280, 150, '** 2', pop(u, 0.4)); grow(320, 150, 410, 150, E(u, 0.5, 0.8), MUT);
      node(445, 150, 'y', '4.', { s: pop(u, 0.7) }); mono(445, 210, 'grad_fn=PowBackward0', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, opacity: fade(u, 0.8) });
      grow(478, 150, 640, 150, E(u, 1.0, 1.4), OFF, { dash: '5 5' }); cross(560, 150, 13, pop(u, 1.4));
      node(690, 150, 'y_cut', '4.', { s: pop(u, 1.5), dash: '5 4', r: 38 });
      mono(690, 220, 'requires_grad = False', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      tx(480, 320, '값 4.0 은 그대로, 이 텐서 하나만 그래프에서 내린다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { zone(60, 60, 840, 230, 'with torch.no_grad():', { fill: SOFT, stroke: OFF, dash: '6 5', op: fade(u, 0.1), color: INK });
      card(200, 170, 140, 80, { rx: 8, stroke: INK, sw: 2, s: pop(u, 0.3) }); mono(200, 176, 'val (10, 3)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      grow(272, 170, 380, 170, E(u, 0.6, 1.0), OFF, { dash: '5 5' });
      card(470, 170, 170, 64, { rx: 10, stroke: INK, sw: 2, text: 'Linear(3, 1)', fs: 15, s: pop(u, 0.8) }); grow(557, 170, 660, 170, E(u, 1.0, 1.4), OFF, { dash: '5 5' });
      card(740, 170, 140, 80, { rx: 8, stroke: INK, sw: 2, s: pop(u, 1.3) }); mono(740, 176, 'out (10, 1)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      mono(740, 246, 'grad_fn 없음', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      mono(480, 340, 'out.requires_grad → False', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      tx(480, 380, '애초에 기록하지 않는다. 추론·검증의 기본', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { tx(130, 64, 'backbone = Linear(3, 8)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1), class: 'mono' });
      const ice = (i) => E(u, 0.6 + i * 0.03, 0.9 + i * 0.03);
      for (let r = 0; r < 8; r++) for (let q = 0; q < 3; q++) { const i = r * 3 + q, f = ice(i); el('rect', { x: 140 + q * 40, y: 84 + r * 36, width: 36, height: 32, rx: 4, fill: f > 0.5 ? INFOBG : SOFT, stroke: f > 0.5 ? INFO : INK, 'stroke-width': 1.6 }); }
      for (let r = 0; r < 8; r++) { const f = ice(24 + r); el('rect', { x: 300, y: 84 + r * 36, width: 36, height: 32, rx: 4, fill: f > 0.5 ? INFOBG : SOFT, stroke: f > 0.5 ? INFO : INK, 'stroke-width': 1.6 }); }
      tx(200, 390, 'weight (8, 3)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono' }); tx(318, 390, 'bias (8,)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
      mono(420, 160, 'for p in backbone.parameters():', { 'font-size': 15, opacity: fade(u, 0.3) }); mono(440, 188, 'p.requires_grad_(False)', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.4) });
      card(640, 280, 360, 70, { rx: 12, stroke: INFO, fill: INFOBG, sw: 2, s: pop(u, 1.8) });
      mono(640, 274, '파라미터 32개 → 갱신 안 함', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.9) });
      tx(640, 300, '24 + 8 = 32 · 전이학습의 얼린 몸통', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k3·4: 반복 3번, loss 를 total 에
    const bad = k === 4; mono(60, 60, bad ? 'total += loss          # ❌' : 'total += loss.item()   # ✅', { 'font-size': 16, 'font-weight': 800, fill: bad ? BAD : ACC, opacity: fade(u, 0.1) });
    for (let i = 0; i < 3; i++) { const d = 0.3 + i * 0.55, x = 160 + i * 200, s = fade(u, d, 0.3), gone = !bad && u > d + 0.5;
      node(x, 150, 'x', null, { r: 22, col: ACC, op: gone ? 0.15 : s }); grow(x + 22, 150, x + 60, 150, s, MUT, { op: gone ? 0.15 : 1 }); op(x + 92, 150, '**2', s, { op: gone ? 0.15 : 1 });
      mono(x + 46, 205, `loss ${i + 1} = 4.0`, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: s });
      if (bad && u > d + 0.4) grow(x + 120, 172, x + 120, 290, E(u, d + 0.4, d + 0.7), BAD);
      if (!bad) fly(x + 46, 220, 400, 300, seg(u, d + 0.2, d + 0.6), '4.0', { mono: true }); }
    const tot = Math.min(12, 4 * Math.floor(clamp((u - 0.3) / 0.55 + 0.4, 0, 3)));
    card(480, 320, 480, 56, { rx: 10, stroke: bad ? BAD : ACC, fill: bad ? BADBG : ACCBG, sw: 2.2, s: pop(u, 0.2) });
    mono(480, 326, bad ? (u > 1.9 ? 'tensor(12., grad_fn=<AddBackward0>)' : 'total = tensor(…)') : `total = ${tot.toFixed(1)}  (float)`, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: bad ? BAD : ACC });
    tx(480, 390, bad ? '반복마다 그래프가 살아남아 메모리가 계속 는다' : '파이썬 float 만 더해지고 그래프는 매번 사라진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // =========================================================
  // 5. 실무 디버깅 — grad=None · NaN 추적 · 커스텀 Function
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { const X = [110, 150], H = [430, 150], Y = [750, 150];
      node(X[0], X[1], 'x', '2.', { col: ACC }); grow(142, 150, 230, 150, 1, MUT); op(270, 150, '× 3', 1); grow(310, 150, 396, 150, 1, MUT);
      node(H[0], H[1], 'h', '6.', {}); grow(462, 150, 550, 150, 1, MUT); op(590, 150, '** 2', 1); grow(630, 150, 716, 150, 1, MUT); node(Y[0], Y[1], 'y', '36.', {});
      if (k === 0) dot([[Y[0], 186], [H[0], 186], [X[0], 186]], seg(u, 0.2, 1.0), BAD, 7);
      card(X[0], 260, 170, 50, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.4, s: pp(c, 0, 1.0) }); mono(X[0], 266, 'x.grad = 36.', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: at(c, 0, 1.1) });
      const got = k === 1 && u > 1.2;
      card(H[0], 260, 190, 50, { rx: 10, stroke: got ? ACC : OFF, fill: got ? ACCBG : PANEL, dash: got ? null : '6 4', sw: 2.4, s: pp(c, 0, 1.3) });
      mono(H[0], 266, got ? 'h.grad = 12.' : 'h.grad = None', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: got ? ACC : MUT, opacity: at(c, 0, 1.4) });
      if (k === 0) { tx(H[0], 310, '중간 텐서라 저장하지 않는다 (경고)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) });
        tx(480, 380, 'leaf 인 x 에만 grad 가 남는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
      pill(H[0], 80, 'h.retain_grad()', ACC, pop(u, 0.2), { mono: true, fs: 15 }); grow(H[0], 96, H[0], 116, E(u, 0.4, 0.7), ACC);
      if (k === 1) dot([[Y[0], 186], [H[0], 186]], seg(u, 0.6, 1.2), BAD, 7);
      mono(H[0] + 150, 266, '= 2h = 12', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) });
      tx(480, 380, '디버깅할 때만 켠다. 중간값 수만큼 메모리를 더 쓴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k <= 3) { // log(0) 을 where 로 피한 것 같아도 backward 에서 NaN
      const A = [90, 200], LG = [270, 120], MZ = [270, 280], WH = [500, 200], LO = [700, 200];
      node(A[0], A[1], 'a', '0.', { col: ACC });
      grow(118, 186, 222, 130, 1, MUT); op(LG[0], LG[1], 'log', 1, { stroke: k === 3 ? BAD : INK, sw: k === 3 ? 3 : 2 }); mono(LG[0], LG[1] - 30, '-inf', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
      grow(118, 214, 222, 270, 1, MUT); op(MZ[0], MZ[1], 'a * 0', 1); mono(MZ[0], MZ[1] + 40, '0.', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
      grow(310, 130, 420, 188, 1, MUT); grow(320, 270, 420, 212, 1, MUT);
      op(WH[0], WH[1], 'where(a > 0, ·, ·)', 1); grow(590, 200, 650, 200, 1, MUT); node(LO[0], LO[1], 'loss', '0.', {});
      tx(500, 150, '0 쪽을 고른다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
      if (k === 2) { dot([[LO[0] - 30, 200], [WH[0], 200], [LG[0] + 30, 130]], seg(u, 0.3, 1.2), BAD, 7);
        mono(390, 120, 'grad 0', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.9) });
        card(LG[0], 50, 190, 40, { rx: 8, stroke: BAD, fill: BADBG, text: '0 / 0 = NaN', fs: 15, mono: true, color: BAD, s: pop(u, 1.3) });
        pill(830, 320, 'set_detect_anomaly(True)', WARN, pop(u, 1.7), { mono: true, fs: 14 });
        tx(480, 390, 'forward 는 멀쩡한 0 인데 backward 에서 NaN 이 생긴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
      card(LG[0], 50, 190, 40, { rx: 8, stroke: BAD, fill: BADBG, text: '0 / 0 = NaN', fs: 15, mono: true, color: BAD });
      card(480, 350, 760, 56, { rx: 10, stroke: BAD, fill: BADBG, sw: 2, s: pop(u, 0.3) });
      mono(480, 345, "RuntimeError: Function 'LogBackward0' returned", { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.4) });
      mono(480, 367, 'nan values in its 0th output.', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.5) });
      grow(400, 322, LG[0] + 10, LG[1] + 24, E(u, 0.8, 1.3), BAD);
      tx(800, 120, 'anomaly 를 끄면', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      mono(800, 146, 'a.grad = nan', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.7) });
      tx(800, 170, '어디서 생겼는지 모른다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k <= 5) { const XV = ['-2.', '-0.5', '1.', '3.'], YV = ['0.', '0.', '1.', '3.'], pos = [false, false, true, true];
      mono(60, 64, 'class MyReLU(torch.autograd.Function)', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      tx(60, 120, 'x', { 'font-size': 16, 'font-weight': 800, fill: INK }); cells(100, 96, XV, { w: 64, h: 40, gap: 6, style: (i) => ({ stroke: pos[i] ? INK : MUT }) });
      grow(390, 116, 450, 116, k === 4 ? E(u, 0.4, 0.8) : 1, MUT); pill(420, 88, 'clamp(min=0)', INK, k === 4 ? pop(u, 0.4) : 1, { mono: true, fs: 13.5 });
      tx(470, 120, 'y', { 'font-size': 16, 'font-weight': 800 }); cells(500, 96, YV, { w: 64, h: 40, gap: 6, style: (i) => ({ s: k === 4 ? pop(u, 0.9 + i * 0.1) : 1, stroke: ACC, fill: ACCBG }) });
      card(240, 210, 280, 50, { rx: 10, dash: '6 4', stroke: WARN, text: 'ctx.save_for_backward(x)', fs: 14.5, mono: true, color: WARN, s: k === 4 ? pop(u, 1.4) : 1 });
      grow(240, 140, 240, 182, k === 4 ? E(u, 1.4, 1.7) : 1, WARN);
      if (k === 4) { tx(700, 220, 'backward 에서 쓸 값을 맡겨 둔다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
      // k5 backward
      const Y0 = 300;
      tx(60, Y0 + 24, 'g', { 'font-size': 16, 'font-weight': 800, fill: BAD }); cells(100, Y0, ['1.', '1.', '1.', '1.'], { w: 64, h: 40, gap: 6, style: () => ({ s: pop(u, 0.2), stroke: BAD }) });
      tx(395, Y0 + 26, '×', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.5) });
      grow(240, 236, 240, Y0 - 6, E(u, 0.4, 0.8), WARN);
      cells(430, Y0, ['0', '0', '1', '1'], { w: 44, h: 40, gap: 4, style: (i) => ({ s: pop(u, 0.7 + i * 0.1), stroke: WARN, fill: pos[i] ? WARNBG : PANEL }) });
      mono(526, Y0 + 66, '(x > 0).float()', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, opacity: fade(u, 0.9) });
      tx(640, Y0 + 26, '=', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.2) });
      cells(670, Y0, ['0.', '0.', '1.', '1.'], { w: 60, h: 40, gap: 4, style: () => ({ s: pop(u, 1.4), stroke: ACC, fill: ACCBG }) });
      mono(796, Y0 + 66, 'x.grad', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) }); return; }
    // k6: grad=None 세 원인
    [['leaf 인가?', 'retain_grad()'], ['requires_grad 를 켰나?', 'no_grad 밖인가'], ['float 인가?', '.float()']].forEach(([a, b], i) => { const x = 170 + i * 260;
      card(x, 160, 230, 110, { rx: 12, stroke: WARN, sw: 2.2, s: pop(u, 0.2 + i * 0.3) });
      mono(x - 96, 142, `${i + 1}`, { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3 + i * 0.3) });
      tx(x, 152, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) });
      mono(x, 184, b, { 'text-anchor': 'middle', 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.4 + i * 0.3) }); });
    tx(480, 60, 'x.grad 가 None 이면 셋을 먼저 본다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.1) });
    card(480, 320, 420, 56, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2, s: pop(u, 1.5) });
    tx(480, 326, '다음 장: 이 연산들을 GPU 로 올린다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) }); }

  const quiz = [
    { q: 'x = tensor(2.0, requires_grad=True), y = x**2 + 3*x 에서 y.backward() 뒤 x.grad 는 무엇인가?',
      o: ['tensor(10.)', 'tensor(7.)', 'tensor(6.999)'], a: 1,
      why: '손으로 구한 2x+3 에 x=2 를 넣은 7 과 정확히 같다. 수치 미분(7.000000000019)과 달리 근사가 아니다.' },
    { q: 'z = (x + y) * w 를 실행했을 때 z.grad_fn 은 무엇인가?',
      o: ['AddBackward0', 'AccumulateGrad', 'MulBackward0'], a: 2,
      why: 'grad_fn 은 그 텐서를 만든 마지막 연산이다. z 는 곱셈으로 나왔고, s = x + y 가 AddBackward0 을 단다.' },
    { q: 'w=2 에서 loss = w**2 를 zero_grad 없이 두 번 backward 하면 w.grad 는 무엇인가?',
      o: ['4.0', '8.0', '16.0'], a: 1,
      why: '.grad 는 덮어쓰지 않고 더한다. 4 + 4 = 8 이라 학습 루프는 매 스텝 zero_grad 로 먼저 비운다.' },
    { q: '검증 루프에서 손실을 모아 평균을 내려 한다. 메모리가 새지 않는 코드는 무엇인가?',
      o: ['total += loss.item()', 'total += loss', 'total += loss.clone()'], a: 0,
      why: '.item() 은 파이썬 float 만 꺼낸다. 텐서째 더하면 tensor(12., grad_fn=<AddBackward0>) 처럼 그래프가 남는다.' },
    { q: 'h = x * 3 처럼 중간에 나온 텐서의 grad 를 보고 싶다. 무엇을 해야 하는가?',
      o: ['h.requires_grad_(True)', 'h.retain_grad() 를 걸고 backward 한다', 'h.detach() 를 한다'], a: 1,
      why: '중간 텐서는 기본으로 grad 를 저장하지 않아 None 이다. retain_grad() 를 걸면 h.grad 에 12 가 남는다.' },
  ];

  const summary = [
    'backward() 는 손으로 하던 체인룰을 대신한다. x=2 에서 x²+3x 의 기울기 7 이 그대로 나온다.',
    '그래프는 코드를 실행하는 순간 grad_fn 노드가 붙으며 자라서 파이썬 for 도 그래프가 된다.',
    '.grad 는 더해지므로 학습 루프는 zero_grad, backward, step 순서로 돈다.',
    '추론은 no_grad, 로그는 .item(), 중간값 grad 는 retain_grad() 로 다룬다.',
  ];
  const review = [
    { q: '학습 손실이 줄다가 다시 오르며 흔들린다. 루프에는 loss.backward() 와 opt.step() 만 있다. 먼저 의심할 것은?',
      o: ['opt.zero_grad() 가 빠져 grad 가 쌓인다', '학습률이 너무 작다', 'requires_grad 를 너무 많이 켰다'], a: 0,
      why: '.grad 는 누적되므로 지난 스텝 기울기가 계속 더해진다. 같은 데이터로 돌려 봐도 zero_grad 를 빼면 손실 곡선이 출렁인다.' },
    { q: '검증할 때마다 GPU 메모리가 조금씩 늘어난다. 코드에는 total += loss 가 있다. 알맞은 처치는?',
      o: ['loss.backward(retain_graph=True) 를 쓴다', 'total += loss.item() 으로 바꾸고 no_grad 안에서 돈다', 'loss 를 requires_grad_(False) 로 얼린다'], a: 1,
      why: '텐서째 더하면 매 반복의 그래프가 살아남는다. .item() 으로 float 만 꺼내고, 검증은 처음부터 기록하지 않는다.' },
    { q: 'torch.where 로 log(0) 을 피했는데도 grad 가 NaN 이다. 범인 연산을 찾는 가장 빠른 방법은?',
      o: ['print 로 forward 값을 모두 찍는다', 'h.retain_grad() 를 모든 텐서에 건다', 'set_detect_anomaly(True) 를 켜고 다시 backward 한다'], a: 2,
      why: 'forward 값은 0 으로 멀쩡해 보인다. anomaly 모드가 LogBackward0 에서 NaN 이 났다고 짚어 준다.' },
  ];

  R.page({ title: '계산 그래프 따라가기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
