/* I-2-1 역전파 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, dot, cells, zone,
    cross, check, axes, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 데이터: backprop.py 를 그대로 돌린 값 (w1=0.5, w2=−0.3, w3=0.8, w4=0.4, x=y=1) ----------
  const V = { z1: 0.5, a1: 0.6225, z2: -0.3, a2: 0.4256, yh: 0.6682, L: 0.0550, d: -0.3318, d1: -0.0624, d2: -0.0324 };
  const G = { w1: -0.0624, w2: -0.0324, w3: -0.2065, w4: -0.1412 };
  const W0 = { w1: 0.5, w2: -0.3, w3: 0.8, w4: 0.4 }, W1 = { w1: 0.531, w2: -0.284, w3: 0.903, w4: 0.471 };
  // 30 step 학습의 손실 (lr = 0.5)
  const LOSS = [0.05505, 0.02623, 0.01206, 0.0054, 0.00237, 0.00103, 0.00044, 0.00019, 8e-05, 3e-05, 1e-05, 1e-05, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const f3 = (v) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(3), f4 = (v) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(4);
  const sg = (z) => 1 / (1 + Math.exp(-z));
  const Lw3 = (w3) => 0.5 * (w3 * sg(0.5) + 0.4 * sg(-0.3) - 1) ** 2;

  // ---------- 계산 그래프: x → h1, h2 → ŷ → L ----------
  const EDG = [['w1', 'x', 'h1'], ['w2', 'x', 'h2'], ['w3', 'h1', 'y'], ['w4', 'h2', 'y'], ['out', 'y', 'L']];
  function layout(x0, x1, yc, sp) { const dx = (x1 - x0) / 4; return { x: [x0, yc], h1: [x0 + dx * 1.5, yc - sp], h2: [x0 + dx * 1.5, yc + sp], y: [x0 + dx * 3, yc], L: [x1, yc] }; }
  // o: { P(layout), w(가중치 글), hi:Set, grads:Set, vals:{node:text}, fwd:u, bwd:u, thick:{edge:px}, dim }
  function graph(o) { const P = o.P, hi = o.hi || new Set(), gr = o.grads || new Set();
    EDG.forEach(([id, a, b]) => { const A = P[a], B = P[b], on = hi.has(id), col = on ? ACC : OFF;
      el('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: gr.has(id) ? BAD : col, 'stroke-width': o.thick && o.thick[id] ? o.thick[id] : on ? 4 : 2.4, opacity: o.dim ?? 1 });
      if (id === 'out') return; const wl = labPos(P, id, 'w'), gl = labPos(P, id, 'g');
      if (o.w) mono(wl[0], wl[1], `${id}=${W0[id]}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? ACC : MUT });
      if (gr.has(id)) pill(gl[0], gl[1], `∂L/∂${id} = ${f3(G[id])}`, BAD, o.gs ? o.gs(id) : 1, { mono: true, fs: 13.5, fill: PANEL }); });
    const fwd = o.fwd, bwd = o.bwd;
    if (fwd != null) { [['x', 'h1', 'y', 'L'], ['x', 'h2', 'y', 'L']].forEach((r) => dot(r.map((k) => P[k]), fwd, INFO, 7)); }
    if (bwd != null) { [['L', 'y', 'h1', 'x'], ['L', 'y', 'h2', 'x']].forEach((r) => dot(r.map((k) => P[k]), bwd, BAD, 7)); }
    Object.entries(P).forEach(([k, [cx, cy]]) => { const nm = { x: 'x', h1: 'h1', h2: 'h2', y: 'ŷ', L: 'L' }[k], isL = k === 'L';
      card(cx, cy, 52, 52, { rx: isL ? 10 : 26, text: nm, fs: 17, stroke: isL ? WARN : INK, color: isL ? WARN : INK, fill: k === 'h1' || k === 'h2' ? ACCBG : PANEL, op: o.dim ?? 1 });
      const v = o.vals && o.vals[k]; if (v) { const [s, col, op] = Array.isArray(v) ? v : [v, INK, 1]; mono(cx, cy + (k === 'h1' ? -38 : 46), s, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: op }); } }); }
  const S = (...a) => new Set(a);
  // 가중치 글은 마름모 안쪽, 기울기 알약은 바깥쪽
  function labPos(P, id, kind) { const e = EDG.find((q) => q[0] === id), A = P[e[1]], B = P[e[2]], m = [lerp(A[0], B[0], 0.5), lerp(A[1], B[1], 0.5)];
    const up = id === 'w1' || id === 'w3', left = id === 'w1' || id === 'w2';
    return kind === 'w' ? [m[0] + (left ? 22 : -22), m[1] + (up ? 26 : -14)] : [m[0] + (left ? -58 : 58), m[1] + (up ? -30 : 40)]; }

  // =========================================================
  // 1. 수치 미분의 벽
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const ax = axes(80, 60, 460, 280, { x: [0, 2.2], y: [0, 0.13], xt: [0, 0.8, 1.6], yt: [0, 0.05, 0.1], xl: 'w3', yl: 'L(w3)', grid: true });
      R.line(ax, Array.from({ length: 89 }, (_, i) => [i * 0.025, Lw3(i * 0.025)]), E(u, 0.1, 0.9), ACC, { sw: 3 });
      const e = 0.3 * E(u, 0.9, 1.4), w = 0.8; el('circle', { cx: ax.X(w), cy: ax.Y(Lw3(w)), r: 7, fill: INK, opacity: fade(u, 0.8) });
      if (u > 0.9) { [w - e, w + e].forEach((q) => { el('line', { x1: ax.X(q), y1: ax.Y(0), x2: ax.X(q), y2: ax.Y(Lw3(q)), stroke: WARN, 'stroke-width': 1.6, 'stroke-dasharray': '4 4' }); el('circle', { cx: ax.X(q), cy: ax.Y(Lw3(q)), r: 6, fill: WARN }); }); }
      if (u > 1.4) { const a = w - 0.3, b = w + 0.3, sl = (Lw3(b) - Lw3(a)) / 0.6, ext = 0.45; el('line', { x1: ax.X(a - ext), y1: ax.Y(Lw3(a) - sl * ext), x2: ax.X(lerp(a - ext, b + ext, E(u, 1.4, 1.9))), y2: ax.Y(lerp(Lw3(a) - sl * ext, Lw3(b) + sl * ext, E(u, 1.4, 1.9))), stroke: BAD, 'stroke-width': 2.6 }); }
      mono(ax.X(0.5), ax.Y(0) - 10, 'w−ε', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); mono(ax.X(1.1), ax.Y(0) - 10, 'w+ε', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      pill(750, 120, '∂L/∂w ≈ (L(w+ε) − L(w−ε)) / 2ε', BAD, pop(u, 1.6), { fs: 15 });
      sub(750, 180, '빨간 선의 기울기 = 기울기 근사값', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(750, 220, '(그림의 ε 는 보이게 크게 그림)', fade(u, 2.1), { 'font-size': 13.5 }); return; }
    const P = layout(70, 470, 200, 90);
    if (k === 1) { graph({ P, w: true, fwd: seg(u, 0.3, 1.8) });
      el('rect', { x: 40, y: 70, width: 470, height: 260, rx: 14, fill: 'none', stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.2) });
      tx(56, 96, 'loss_fn(weights)', { 'font-size': 15, 'font-weight': 800, fill: INFO, class: 'mono', opacity: fade(u, 0.2) });
      card(740, 170, 300, 64, { rx: 12, text: 'loss_fn 호출 1번\n= forward 1번', fs: 16, stroke: INFO, color: INFO, fill: C.INFOBG, s: pop(u, 1.4) });
      sub(740, 260, '호출 횟수가 곧 비용이다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2 || k === 3) { const wi = k === 2 ? Math.min(3, Math.floor(clamp((u - 0.3) / 2.2) * 4)) : Math.min(3, Math.floor(clamp((u - 0.2) / 2.4) * 4));
      const names = ['w1', 'w2', 'w3', 'w4'];
      graph({ P, w: true, hi: S(names[wi]), fwd: k === 3 ? ((u - 0.2) / 0.6) % 1 : null });
      tx(580, 88, 'weights', { 'font-size': 15, 'font-weight': 700, fill: MUT, class: 'mono' });
      cells(580, 100, names.map((n) => W0[n]), { w: 76, h: 40, fs: 15, style: (i) => (i === wi ? { stroke: ACC, fill: ACCBG, sw: 3 } : {}) });
      el('path', { d: `M${618 + wi * 82},156 l-8,12 h16 z`, fill: ACC });
      tx(580, 200, 'grads', { 'font-size': 15, 'font-weight': 700, fill: MUT, class: 'mono' });
      cells(580, 212, names.map((n, i) => (i < wi || (k === 3 && u > 2.6) ? f3(G[n]) : '0')), { w: 76, h: 40, fs: 14, style: (i) => (i < wi ? { color: BAD, stroke: BAD } : {}) });
      if (k === 2) { mono(580, 300, 'for i in range(len(weights)):', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
        sub(740, 340, '루프 길이 = 가중치 수 → 장난감은 4바퀴', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      const cnt = Math.min(8, Math.floor(clamp((u - 0.2) / 2.4) * 8) + 1);
      mono(580, 305, 'loss_fn 호출', { 'font-size': 15, fill: MUT }); mono(900, 310, `${cnt} / 8`, { 'font-size': 26, 'font-weight': 800, fill: INFO, 'text-anchor': 'end' });
      pill(740, 360, `+ε 한 번 · −ε 한 번 → 가중치당 forward 2번`, INFO, pop(u, 0.4), { fs: 14 }); return; }
    if (k === 4) { const rows = [['장난감 (4개)', 8, '8번', GOOD], ['작은 MLP (10만 개)', 2e5, '20만 번', WARN], ['ResNet-50 (2,500만 개)', 5e7, '5,000만 번', BAD], ['GPT급 (수십억 개)', 3e9, '수십억 번', BAD]];
      tx(60, 70, '한 걸음당 forward 횟수 (로그 눈금)', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      rows.forEach(([nm, v, s, col], i) => { const y = 110 + i * 70, a = 0.2 + i * 0.4; tx(60, y + 14, nm, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) });
        hbar(330, y, 440, Math.log10(v), 10, { h: 22, col, u: E(u, a, a + 0.5), text: s }); });
      sub(480, 395, '학습은 이 한 걸음을 수십만 번 — 큰 모델은 불가능 (시간은 대략)', fade(u, 2.1), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    // k5 목표
    graph({ P, w: true, fwd: seg(u, 0.2, 1.1), bwd: seg(u, 1.2, 2.1), grads: u > 2.1 ? S('w1', 'w2', 'w3', 'w4') : S(), gs: () => pop(u, 2.1) });
    card(740, 140, 300, 56, { rx: 12, text: 'forward 1번 + backward 1번', fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.4) });
    sub(740, 200, '→ 모든 ∂L/∂w 를 한꺼번에', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    pill(740, 270, '그 방법 = 역전파', BAD, pop(u, 2.2), { fs: 16 }); }

  // =========================================================
  // 2. 미분 = 책임 배분
  // =========================================================
  function s2(t, c) { const { k, u } = c; const P = layout(70, 560, 200, 100);
    const vals = {};
    if (k >= 1) { vals.x = 'x = 1.0'; vals.h1 = ['a1 = ' + V.a1, INFO, k === 1 ? fade(u, 1.0) : 1]; vals.h2 = ['a2 = ' + V.a2, INFO, k === 1 ? fade(u, 1.2) : 1]; }
    if (k >= 2) vals.y = ['ŷ = ' + V.yh, INFO, k === 2 ? fade(u, 1.2) : 1];
    if (k >= 3) vals.L = ['L = ' + V.L.toFixed(4), WARN, k === 3 ? fade(u, 1.0) : 1];
    const thick = k === 5 ? Object.fromEntries(['w1', 'w2', 'w3', 'w4'].map((w) => [w, 2 + 16 * Math.abs(G[w]) * E(u, 0.3, 1.3)])) : null;
    graph({ P, w: k !== 5, vals, hi: k === 1 ? S('w1', 'w2') : k === 2 ? S('w3', 'w4') : k === 4 ? S('w3') : S(), fwd: k === 1 ? seg(u, 0.2, 1.4) * 0.5 : k === 2 ? 0.5 + seg(u, 0.2, 1.2) * 0.25 : null, grads: k === 4 ? S('w3') : S(), gs: () => pop(u, 1.8), thick });
    if (k === 0) { ['w1', 'w2', 'w3', 'w4'].forEach((w, i) => { const gl = labPos(P, w, 'g'); pill(gl[0], gl[1], `∂L/∂${w} = ?`, BAD, pop(u, 0.6 + i * 0.25), { mono: true, fs: 13.5, fill: PANEL }); });
      card(790, 180, 260, 84, { rx: 12, text: '∂L/∂w =\nw 를 조금 올리면\nL 이 얼마나 변하나', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.8) });
      sub(790, 270, '= 이 가중치의 책임 지분', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const rx = 800;
    if (k === 1) { mono(rx, 120, 'z1 = 0.5 · 1.0 = 0.5', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); mono(rx, 150, 'a1 = σ(0.5) = 0.6225', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.0) });
      mono(rx, 210, 'z2 = −0.3 · 1.0 = −0.3', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); mono(rx, 240, 'a2 = σ(−0.3) = 0.4256', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.2) }); return; }
    if (k === 2) { mono(rx, 120, 'w3·a1 = 0.498', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.4) }); mono(rx, 150, 'w4·a2 = 0.170', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      mono(rx, 195, 'ŷ = 0.6682', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.2) });
      sub(rx, 240, '정답 y = 1.0 과는 아직 거리가 있다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { // 수직선 위 ŷ 와 y 의 간격
      const Y = (v) => 330 - v * 220; el('line', { x1: rx, y1: Y(0), x2: rx, y2: Y(1.1), stroke: MUT, 'stroke-width': 2 });
      [[0, '0'], [0.5, '0.5'], [1, '1.0']].forEach(([v, s]) => mono(rx - 12, Y(v) + 5, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }));
      el('circle', { cx: rx, cy: Y(V.yh), r: 8, fill: INFO }); mono(rx + 14, Y(V.yh) + 5, 'ŷ 0.668', { 'font-size': 14.5, 'font-weight': 700, fill: INFO });
      el('circle', { cx: rx, cy: Y(1), r: 8, fill: GOOD }); mono(rx + 14, Y(1) + 5, 'y 1.0', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD });
      el('rect', { x: rx - 6, y: Y(1), width: 12, height: (Y(V.yh) - Y(1)) * E(u, 0.4, 1.0), fill: BAD, opacity: 0.6 });
      mono(rx - 22, Y(0.83) + 5, 'ŷ−y = −0.332', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.8) });
      sub(rx, 380, 'L = ½(ŷ−y)² = 0.0550', fade(u, 1.4), { 'font-size': 15, fill: WARN, 'font-weight': 800 }); return; }
    if (k === 4) { mono(rx, 110, `w3 = ${tween(0.8, 0.81, seg(u, 0.3, 1.0) * 3).toFixed(2)}`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      hbar(700, 150, 160, 0.05505, 0.06, { h: 20, col: OFF, text: '0.05505' }); sub(690, 166, 'L0', 1, { 'font-size': 14, 'text-anchor': 'end' });
      hbar(700, 185, 160, 0.053, 0.06, { h: 20, col: WARN, u: E(u, 0.9, 1.4), text: '0.05300' }); sub(690, 201, 'L1', fade(u, 0.9), { 'font-size': 14, 'text-anchor': 'end' });
      mono(rx, 260, '(L1 − L0) / 0.01 ≈ −0.205', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) });
      sub(rx, 295, '음수 → 올리면 손실이 준다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5: 책임 지분 — 선 굵기와 막대
    tx(640, 80, '|∂L/∂w| = 책임 크기', { 'font-size': 15, 'font-weight': 800, fill: BAD });
    [['w3', 0.2], ['w4', 0.5], ['w1', 0.8], ['w2', 1.1]].forEach(([w, a], i) => { const y = 110 + i * 56; mono(640, y + 17, w, { 'font-size': 16, 'font-weight': 800, fill: BAD });
      hbar(680, y, 190, Math.abs(G[w]), 0.21, { h: 22, col: BAD, u: E(u, a, a + 0.5), text: f4(G[w]) }); });
    sub(760, 360, '부호 = 고칠 방향 (전부 음수 → 올린다)', fade(u, 1.7), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    sub(760, 390, 'w3 의 책임이 w2 의 6배 이상', fade(u, 2.1), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  // =========================================================
  // 3. 체인룰 — 경로를 따라 국소 미분을 곱한다
  // =========================================================
  const TERMS1 = [['∂L/∂ŷ', 'ŷ − y', '−0.332'], ['∂ŷ/∂a1', 'w3', '0.8'], ['∂a1/∂z1', 'a1(1−a1)', '0.235'], ['∂z1/∂w1', 'x', '1.0']];
  const TERMS2 = [['∂L/∂ŷ', 'ŷ − y', '−0.332'], ['∂ŷ/∂a2', 'w4', '0.4'], ['∂a2/∂z2', 'a2(1−a2)', '0.244'], ['∂z2/∂w2', 'x', '1.0']];
  function termRow(terms, n, u, o) { o = o || {}; const y = 300;
    terms.forEach(([sym, f, v], i) => { const x = 110 + i * 190, s = o.pop ? (i < n - (o.fresh || 0) ? 1 : pop(u, o.pop + (i - (n - (o.fresh || 0))) * 0.3)) : 1;
      if (i >= n) { card(x, y, 150, 74, { rx: 10, text: '?', fs: 20, stroke: OFF, color: OFF, dash: '6 4' }); }
      else { const g = R.G(x, y, s); el('rect', { x: -75, y: -37, width: 150, height: 74, rx: 10, fill: i === 0 && o.shared ? C.WARNBG : PANEL, stroke: i === 0 && o.shared ? WARN : BAD, 'stroke-width': 2.2 }, g);
        tx(0, -14, sym, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD }, g); mono(0, 6, f, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, g); mono(0, 28, v, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' }, g); }
      if (i < 3) tx(x + 95, y + 7, '×', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const boxes = [['x', 90, INK], ['g', 270, INFO], ['f', 450, ACC], ['y', 630, INK]];
      boxes.forEach(([s, x, col], i) => { card(x, 130, i === 0 || i === 3 ? 60 : 110, 60, { rx: i === 0 || i === 3 ? 30 : 10, text: s === 'g' ? 'g(x)' : s === 'f' ? 'f(g)' : s, fs: 18, mono: true, stroke: col, color: col, s: pop(u, 0.2 + i * 0.25) }); if (i) grow(boxes[i - 1][1] + (i === 1 ? 32 : 57), 130, x - (i === 3 ? 32 : 57), 130, E(u, 0.2 + i * 0.25, 0.4 + i * 0.25), MUT); });
      grow(630, 190, 450, 190, E(u, 1.2, 1.5), BAD); grow(450, 190, 270, 190, E(u, 1.5, 1.8), BAD);
      mono(540, 215, "f'(g(x))", { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.4) }); mono(360, 215, "g'(x)", { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.7) });
      mono(360, 280, "dy/dx = f'(g(x)) · g'(x)", { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(360, 320, '바깥 미분 × 안쪽 미분', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      pill(820, 130, 'w1 → z1 → a1 → ŷ → L', ACC, pop(u, 2.2), { fs: 14, mono: true }); sub(820, 170, '신경망 = 거대한 합성함수', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    const P = layout(90, 650, 120, 70), path1 = S('w1', 'w3', 'out'), path2 = S('w2', 'w4', 'out');
    if (k === 1) { graph({ P, w: true, fwd: seg(u, 0.1, 1.2) });
      const items = [['z1', '0.5'], ['a1', '0.6225'], ['z2', '−0.3'], ['a2', '0.4256'], ['ŷ', '0.6682'], ['L', '0.0550']];
      tx(70, 285, '보관한 중간값', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      items.forEach(([n, v], i) => { const x = 70 + i * 140, s = pop(u, 0.6 + i * 0.25); const g = R.G(x + 60, 335, s); el('rect', { x: -60, y: -26, width: 120, height: 52, rx: 8, fill: SOFT, stroke: INFO, 'stroke-width': 2 }, g); mono(0, 6, `${n} = ${v}`, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO }, g); });
      sub(800, 40, '곧 미분 계산에 다시 쓸 값', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k <= 4) { graph({ P, w: true, hi: k === 2 ? S('out') : path1, grads: k === 4 ? S('w1') : S(), gs: () => pop(u, 1.6) });
      const n = k === 2 ? 1 : 4; termRow(TERMS1, n, u, { pop: k === 2 ? 0.3 : k === 3 ? 0.3 : null, fresh: k === 2 ? 1 : k === 3 ? 3 : 0 });
      if (k === 2) sub(480, 380, '손실 함수만 알면 구해지는 국소 정보', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 3) sub(480, 380, '전부 그 자리에서 바로 나오는 값 — 어려운 항이 없다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 4) { mono(480, 385, '= −0.0624', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.6) }); pill(740, 385, '수치 미분 −0.0624 와 일치', GOOD, pop(u, 1.4), { fs: 14 }); }
      return; }
    if (k === 5) { graph({ P, w: true, hi: path2, grads: S('w2'), gs: () => pop(u, 1.6) }); termRow(TERMS2, 4, u, { pop: 0.3, fresh: 3, shared: true });
      mono(480, 385, '= −0.0324', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.4) }); return; }
    // k6: 두 경로가 ∂L/∂ŷ 를 공유
    graph({ P, w: true, hi: S('w1', 'w2', 'w3', 'w4', 'out') });
    el('circle', { cx: lerp(P.y[0], P.L[0], 0.5), cy: P.y[1], r: 34, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 0.3) });
    mono(240, 290, '∂L/∂w1 = ', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5) }); mono(240, 340, '∂L/∂w2 = ', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.8) });
    [290, 340].forEach((y, i) => { pill(420, y - 5, '∂L/∂ŷ', WARN, pop(u, 0.6 + i * 0.3), { fs: 15, fill: C.WARNBG }); mono(475, y, i ? '× w4 × a2(1−a2) × x' : '× w3 × a1(1−a1) × x', { 'font-size': 15, opacity: fade(u, 0.7 + i * 0.3) }); });
    sub(480, 395, '같은 항을 두 번 계산 중 — 재사용하면?', fade(u, 1.8), { 'font-size': 15, fill: WARN, 'font-weight': 800 }); }

  // =========================================================
  // 4. δ 를 거꾸로 — 한 번에 전부
  // =========================================================
  function s4(t, c) { const { k, u } = c; if (k === 6) return s4check(u); const P = layout(80, 600, 200, 105);
    const vals = { x: 'x = 1.0', h1: ['a1 ' + V.a1, INFO, 1], h2: ['a2 ' + V.a2, INFO, 1], y: ['ŷ ' + V.yh, INFO, 1] };
    if (k >= 1 && k <= 4) vals.y = ['δ_out = ' + f4(V.d), BAD, k === 1 ? fade(u, 0.8) : 1];
    if (k >= 3 && k <= 4) { vals.h1 = ['δ_1 = ' + f4(V.d1), BAD, k === 3 ? fade(u, 1.4) : 1]; vals.h2 = ['δ_2 = ' + f4(V.d2), BAD, k === 3 ? fade(u, 1.6) : 1]; }
    const grads = k === 2 || k === 3 ? S('w3', 'w4') : k >= 4 ? S('w1', 'w2', 'w3', 'w4') : S();
    const bw = k === 1 ? seg(u, 0.2, 0.9) * 0.25 : k === 2 ? 0.25 + seg(u, 0.2, 1.2) * 0.35 : k === 3 ? 0.6 + seg(u, 0.2, 1.2) * 0.12 : k === 4 ? 0.72 + seg(u, 0.2, 1.2) * 0.28 : null;
    graph({ P, w: k >= 5 ? false : true, vals, fwd: k === 0 ? seg(u, 0.2, 1.8) : null, bwd: bw, grads, gs: (id) => (k === 2 || (k === 4 && (id === 'w1' || id === 'w2')) ? pop(u, 1.2) : 1) });
    const rx = 790;
    if (k === 0) { tx(rx - 110, 100, 'cache', { 'font-size': 16, 'font-weight': 800, fill: INFO, class: 'mono' });
      [['x', '1.0', 0.4], ['a1', '0.6225', 0.9], ['a2', '0.4256', 1.1]].forEach(([n, v, a], i) => { const g = R.G(rx, 140 + i * 56, pop(u, a)); el('rect', { x: -100, y: -22, width: 200, height: 44, rx: 8, fill: C.INFOBG, stroke: INFO, 'stroke-width': 2 }, g); mono(0, 6, `${n} = ${v}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO }, g); });
      sub(rx, 330, 'backward 가 다시 쓸 값을 들고 간다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { card(rx, 150, 250, 60, { rx: 12, text: 'δ_out = ŷ − y\n= −0.3318', fs: 16, stroke: BAD, color: BAD, fill: C.BADBG, s: pop(u, 0.5) });
      sub(rx, 220, '딱 한 번만 계산한다', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(rx, 250, '방향을 뒤집어 출력에서 출발', fade(u, 1.7), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 2) { mono(rx, 140, 'δ_out × a1 = −0.2065', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.6) }); mono(rx, 175, 'δ_out × a2 = −0.1412', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.9) });
      sub(rx, 240, 'cache 의 a1, a2 를 곱하기만 — 곱셈 두 번', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { mono(rx, 130, 'δ_1 = δ_out·w3·a1(1−a1)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); mono(rx, 155, '= −0.0624', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.0) });
      mono(rx, 200, 'δ_2 = δ_out·w4·a2(1−a2)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); mono(rx, 225, '= −0.0324', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.3) });
      sub(rx, 280, 'δ_out 을 다시 계산하지 않고 물려받는다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { mono(rx, 140, 'δ_1 × x = −0.0624', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.6) }); mono(rx, 175, 'δ_2 × x = −0.0324', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.9) });
      pill(rx, 240, 'backward 1번 → 기울기 4개', BAD, pop(u, 1.6), { fs: 15 }); return; }
    if (k === 5) { tx(rx - 140, 110, '기울기 4개를 얻는 비용', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      tx(rx - 140, 150, '수치 미분', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }); hbar(rx - 140, 160, 200, 8, 8, { h: 20, col: WARN, u: E(u, 0.3, 0.9), text: 'forward 8' });
      tx(rx - 140, 220, '역전파', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9) }); hbar(rx - 140, 230, 200, 2, 8, { h: 20, col: ACC, u: E(u, 0.9, 1.4), text: 'fwd 1 + bwd 1' });
      sub(rx, 310, '수치 미분은 이제 검증 도구', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
  }
  function s4check(u) {
    const hdr = ['', 'backprop', 'numeric', '|차이|'], xs = [130, 330, 530, 760];
    hdr.forEach((s, i) => tx(xs[i], 80, s, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, class: 'mono' }));
    ['w1', 'w2', 'w3', 'w4'].forEach((w, i) => { const y = 130 + i * 56, a = 0.2 + i * 0.35, op = fade(u, a);
      el('rect', { x: 70, y: y - 26, width: 800, height: 46, rx: 8, fill: i % 2 ? SOFT : PANEL, opacity: op });
      mono(xs[0], y + 5, w, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: op });
      mono(xs[1], y + 5, (G[w] < 0 ? '−' : '+') + Math.abs(G[w]).toFixed(4), { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: op });
      mono(xs[2], y + 5, (G[w] < 0 ? '−' : '+') + Math.abs(G[w]).toFixed(4), { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, a + 0.2) });
      mono(xs[3] - 20, y + 5, '< 1e-7', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, a + 0.3) }); if (u > a + 0.4) check(xs[3] + 60, y, 11, pop(u, a + 0.4)); });
    sub(480, 380, 'assert 통과 — 구현이 옳다는 증거', fade(u, 2.0), { 'font-size': 15, fill: GOOD, 'font-weight': 800 }); }

  // =========================================================
  // 5. 학습 사이클
  // =========================================================
  const RING = [['forward', INFO], ['loss', WARN], ['backward', BAD], ['update', ACC]];
  function ring(cx, cy, r, on, u) { el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3 });
    const a0 = -Math.PI / 2;
    RING.forEach(([s, col], i) => { const a = a0 + i * Math.PI / 2, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a), act = i === on;
      card(x, y, 116, 40, { rx: 20, text: `[${i + 1}] ${s}`, fs: 14, stroke: act ? col : OFF, color: act ? PANEL : MUT, fill: act ? col : PANEL, s: act ? 1 + R.bump(u, 0.2) : 1 }); });
    if (on >= 0) { const a = a0 + on * Math.PI / 2 + Math.PI / 4; el('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 6, fill: RING[on][1], opacity: fade(u, 0.6) }); } }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const ax = axes(90, 70, 420, 270, { x: [0, 2.2], y: [0, 0.13], xt: [0, 0.8, 1.6], yt: [0, 0.05, 0.1], xl: 'w3', yl: 'L', grid: true });
      R.line(ax, Array.from({ length: 89 }, (_, i) => [i * 0.025, Lw3(i * 0.025)]), 1, OFF, { sw: 2.6 });
      const w = 0.8, g = -0.2065, nw = w - 0.5 * g, q = E(u, 0.8, 1.8);
      el('circle', { cx: ax.X(lerp(w, nw, q)), cy: ax.Y(Lw3(lerp(w, nw, q))), r: 8, fill: ACC });
      grow(ax.X(w), ax.Y(Lw3(w)) - 24, ax.X(nw), ax.Y(Lw3(w)) - 24, E(u, 0.4, 0.9), ACC);
      mono(ax.X((w + nw) / 2), ax.Y(Lw3(w)) - 34, '−lr·∂L/∂w3', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      pill(740, 120, 'lr = 0.5', ACC, pop(u, 0.2), { mono: true, fs: 18 });
      mono(740, 185, 'w ← w − lr · ∂L/∂w', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      sub(740, 230, '기울기 = 방향과 크기, lr = 얼마나 갈지', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(740, 260, '(그림: w3 만 움직인 단면)', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    if (k <= 4) { const P = layout(60, 470, 210, 95), on = k - 1;
      ring(740, 210, 120, on, u);
      const vals = { y: ['ŷ = ' + V.yh, INFO, 1] }; if (k >= 2) vals.L = ['L = ' + V.L.toFixed(4), WARN, k === 2 ? fade(u, 0.6) : 1];
      graph({ P, w: k !== 4, vals, fwd: k === 1 ? seg(u, 0.2, 1.6) : null, bwd: k === 3 ? seg(u, 0.2, 1.6) : null, grads: k === 3 ? S('w1', 'w2', 'w3', 'w4') : S(), gs: () => pop(u, 1.4) });
      if (k === 1) { mono(740, 205, 'for step in', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) }); mono(740, 225, 'range(30)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) }); }
      if (k === 4) { ['w1', 'w2', 'w3', 'w4'].forEach((w) => { const e = EDG.find((q) => q[0] === w), A = P[e[1]], B = P[e[2]], up = w === 'w1' || w === 'w3';
          const lp = labPos(P, w, 'w'); void A; void B; void up; mono(lp[0], lp[1], `${w}=${tween(W0[w], W1[w], u).toFixed(3)}`, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); });
        mono(740, 200, `L ${tween(0.055, 0.0262, seg(u, 1.0, 2.2) * 3).toFixed(4)}`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
        sub(740, 228, '0.0550 → 0.0262', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      return; }
    if (k === 5) { const ax = axes(90, 70, 500, 270, { x: [0, 29], y: [0, 0.06], xt: [0, 10, 20, 29], yt: [0, 0.02, 0.04, 0.06], xl: 'step', yl: 'loss', grid: true });
      R.line(ax, LOSS.map((v, i) => [i, v]), E(u, 0.2, 1.8), WARN, { sw: 3 });
      [[10, '0.9947'], [20, '0.9999']].forEach(([s, y], i) => { const a = 0.9 + i * 0.6; el('circle', { cx: ax.X(s), cy: ax.Y(LOSS[s]), r: 6, fill: INFO, opacity: fade(u, a) }); mono(ax.X(s), ax.Y(0.012 + i * 0.012), `ŷ=${y}`, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, a) }); });
      mono(ax.X(0) + 12, ax.Y(0.055) + 4, '0.0550', { 'font-size': 14, 'font-weight': 700, fill: WARN });
      card(780, 150, 260, 60, { rx: 12, text: '4박자를 30번 반복\nŷ → 정답 1.0', fs: 15, stroke: GOOD, color: GOOD, fill: C.GOODBG, s: pop(u, 1.6) });
      sub(780, 230, '가중치를 손으로 설계하지 않았다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k6: 큰 그림 — loss.backward() 와 기울기 소실
    pill(240, 80, 'loss.backward()', BAD, pop(u, 0.2), { mono: true, fs: 18 });
    sub(240, 125, '= 오늘 손으로 쓴 backward 의 자동화', fade(u, 0.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    sub(240, 152, '(계산 그래프를 거꾸로 타는 자동미분)', fade(u, 0.8), { 'font-size': 14 });
    tx(560, 70, '층마다 δ 에 w·σ′ (σ′ ≤ 0.25) 가 곱해지면', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.0) });
    for (let i = 0; i < 10; i++) { const x = 900 - i * 36, v = Math.pow(0.25, i), h = Math.max(1.5, 150 * v), a = 1.1 + i * 0.1; el('rect', { x: x - 13, y: 260 - h * E(u, a, a + 0.2), width: 26, height: h * E(u, a, a + 0.2), rx: 3, fill: BAD, opacity: 0.85 }); }
    grow(900, 290, 580, 290, E(u, 1.1, 2.1), BAD); mono(740, 315, '출력 → 입력', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    mono(740, 350, '0.25¹⁰ ≈ 1e-6 → 기울기 소실 (I-1-2)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) });
    sub(240, 260, '체인룰 "곱의 연쇄" 가 만든 구조적 병', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    sub(240, 290, '처방: ReLU · 잔차 연결 (이후 챕터)', fade(u, 2.4), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '수치 미분으로 가중치 100만 개의 기울기를 구하면, 한 걸음 업데이트에 forward가 몇 번 필요한가?',
      o: ['forward 1번 + backward 1번', 'forward 100만 번', 'forward 200만 번'], a: 2,
      why: '가중치 하나마다 +ε, −ε 로 forward를 2번 돌려야 하니 100만 개면 200만 번이다. 비용이 모델 크기에 비례해 확장이 불가능하다.' },
    { q: '장난감 네트워크에서 ∂L/∂w3 = −0.207 은 무엇을 뜻하나?',
      o: ['w3를 조금 올리면 손실이 줄어든다', 'w3를 내려야 손실이 줄어든다', 'w3는 손실과 무관하다'], a: 0,
      why: '부호는 고칠 방향, 크기는 책임의 크기다. 음수이므로 올리는 방향이 맞고, w3의 책임은 w2(−0.032)보다 6배 이상 크다.' },
    { q: '체인룰로 ∂L/∂w1 을 구하는 방법은?',
      o: ['w1을 ε만큼 흔들어 손실 변화를 잰다', 'w1→z1→a1→ŷ→L 경로의 국소 미분을 차례로 곱한다', '네 가중치의 기울기를 모두 더한다'], a: 1,
      why: '(−0.332)×0.8×0.235×1.0 = −0.0624 로, 흔들어 재지 않고 계산만으로 수치 미분과 같은 값이 나온다.' },
    { q: '역전파가 가중치 수와 상관없이 forward 1번 + backward 1번으로 끝나는 이유는?',
      o: ['수치 미분 값을 근사로 대신 써서', '가중치마다 경로 곱을 처음부터 다시 해서', '출력의 δ를 한 번 구해 거꾸로 흘리며 재사용해서'], a: 2,
      why: 'δ_out = ŷ − y 를 한 번만 구하고, 층마다 ∂L/∂w = δ × 저장해 둔 입력값으로 떨군다. 결과는 수치 미분과 1e-7 미만 차이로 일치한다.' },
    { q: '학습 한 걸음(사이클)의 올바른 순서는?',
      o: ['forward → loss → backward → update', 'backward → forward → update → loss', 'forward → update → loss → backward'], a: 0,
      why: '예측하고, 틀린 정도를 재고, 책임을 배분하고, w ← w − lr·∂L/∂w 로 고친다. 한 걸음 만에 손실이 0.0550에서 0.0262로 줄었다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '수치 미분은 가중치마다 forward를 2번 돌려서, 100만 개면 한 걸음에 200만 번이 든다.',
    '∂L/∂w는 그 가중치의 책임이다. 부호는 고칠 방향을, 크기는 책임의 크기를 알려 준다.',
    '체인룰로 경로의 국소 미분을 곱하면 흔들어 보지 않고도 수치 미분과 같은 값이 나온다.',
    '역전파는 출력의 δ를 거꾸로 흘리며 재사용해, forward와 backward 한 번씩으로 끝난다.',
  ];
  const review = [
    { q: '직접 짠 backward가 맞는지 확인하고 싶다. 가장 알맞은 방법은?',
      o: ['모든 학습을 수치 미분으로 바꿔 돌린다', '가중치 몇 개를 수치 미분으로 재서 비교한다', '한 걸음 뒤 손실이 줄었는지만 본다'], a: 1,
      why: '수치 미분은 느려서 학습에는 못 쓰지만 정의 그대로라 정답 대조용으로 좋다. 이 장도 역전파 결과가 수치 미분과 1e-7 미만 차이로 맞는지 확인했다.' },
    { q: 'sigmoid 층을 깊게 쌓자 입력 쪽 가중치의 기울기가 거의 0이 됐다. 역전파 구조로 본 원인은?',
      o: ['forward 때 중간값을 저장하지 않았다', '학습률이 너무 커서 발산했다', 'δ가 층을 지날 때마다 w × σ′가 곱해져 작아진다'], a: 2,
      why: 'σ′는 0.25를 넘지 못해서 곱의 연쇄가 길어질수록 δ가 0에 가까워진다. 기울기 소실은 체인룰의 곱셈 구조에서 나온다.' },
    { q: '메모리를 아끼려고 forward 직후 중간 활성값(a1, a2)을 버렸다. 무엇이 문제인가?',
      o: ['backward에서 기울기 재료가 없다', '예측값 ŷ가 forward 결과와 달라진다', '손실 값을 계산할 수 없게 된다'], a: 0,
      why: '역전파는 저장해 둔 입력값에 δ를 곱해 ∂L/∂w를 얻는다. 버리면 forward를 다시 돌려야 하고, 예측과 손실은 이미 계산된 뒤라 영향이 없다.' },
  ];

  RA.page({ title: '역전파 — 책임을 거꾸로 나눈다', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
