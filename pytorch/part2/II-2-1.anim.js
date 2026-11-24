/* II-2-1 손실·옵티마이저 — 3박자 리듬 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   숫자는 페이지 코드를 venv 의 torch(CPU)로 돌린 값이다. 3박자 장면은 torch.manual_seed(0) 으로 x, y, 모델을 만든 결과. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, axes, hbar, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const f4 = (v) => v.toFixed(4);

  // ---------- 실행 결과 ----------
  const EP = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99];
  const L_OK = [2.6634, 1.7838, 1.6227, 1.5094, 1.4239, 1.3574, 1.305, 1.2633, 1.2298, 1.203, 1.1814, 1.164, 1.15, 1.1387, 1.1296, 1.1223, 1.1163, 1.1116, 1.1077, 1.1046, 1.1025];
  const L_NOZERO = [2.6634, 1.9002, 1.4649, 1.6745, 2.352, 2.2745, 1.7901, 1.5817, 1.9574, 1.7983, 1.6402, 1.679, 2.3447, 2.451, 1.8082, 1.3851, 1.8818, 2.4568, 2.3746, 1.6806, 1.7239];
  const L_FLAT = EP.map(() => 2.6634);
  const G_OK = [2.534, 1.488, 0.998], G_NOZERO = [2.534, 3.999, 3.949];
  const W0 = [-0.0037, 0.2682, -0.4115, -0.368], B0 = -0.1926, WG = [1.2357, 0.663, -2.0608, -0.4541], BG = 0.1941, W1 = [-0.1273, 0.2019, -0.2054, -0.3226], B1 = -0.212;

  // 손실 곡선 판
  function curvePanel(x, y, w, h, series, o) { o = o || {};
    const ax = axes(x, y, w, h, { x: [0, 100], y: [0, 3], xt: [0, 50, 100], yt: [0, 1, 2, 3], xl: 'epoch', yl: o.yl || 'loss', grid: true });
    series.forEach(([data, col, u, name, ly]) => { R.line(ax, EP.map((e, i) => [e, data[i]]), u, col, { sw: 2.8 });
      if (name && u >= 1) mono(x + w + 6, ax.Y(ly ?? data[data.length - 1]) + 5, name, { 'font-size': 14, 'font-weight': 700, fill: col }); });
    return ax; }

  // =========================================================
  // 1. 손실 함수와 마지막 층의 궁합
  // =========================================================
  function bars(x0, base, vals, scale, o) { o = o || {}; const bw = o.bw || 54, gap = o.gap || 30;
    el('line', { x1: x0 - 14, y1: base, x2: x0 + vals.length * (bw + gap) - gap + 14, y2: base, stroke: MUT, 'stroke-width': 1.8 });
    vals.forEach((v, i) => { const xx = x0 + i * (bw + gap), hh = v * scale * (o.u ?? 1), hot = o.hot === i;
      el('rect', { x: xx, y: hh >= 0 ? base - hh : base, width: bw, height: Math.abs(hh), rx: 4, fill: v < 0 ? BAD : hot ? ACC : o.col || INFO, opacity: 0.85 });
      if (o.vals !== false) mono(xx + bw / 2, hh >= 0 ? base - hh - 8 : base - hh + 20, (o.fmt || ((a) => a.toFixed(1)))(v), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: v < 0 ? BAD : INK, opacity: o.op ?? 1 });
      if (o.lab) mono(xx + bw / 2, base + (v < 0 ? -10 : 22), o.lab[i], { 'font-size': 14, fill: hot ? ACC : MUT, 'text-anchor': 'middle', 'font-weight': hot ? 800 : 400 }); }); }
  function meter(cx, cy, label, v, col) { card(cx, cy, 190, 78, { rx: 12, stroke: col || ACC, sw: 2.2 }); tx(cx - 80, cy - 14, label, { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    mono(cx - 80, cy + 22, f4(v), { 'font-size': 26, 'font-weight': 800, fill: col || ACC }); }
  const LOG = [2.0, 0.5, -1.0], P1 = [0.786, 0.175, 0.039], P2 = [0.496, 0.269, 0.235];
  function s1(t, c) { const { k, u } = c, LAB = ['0', '1', '2'];
    if (k === 0) { tx(60, 60, 'logits = [[2.0, 0.5, -1.0]]', { 'font-size': 16, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.1) });
      bars(90, 260, LOG, 70, { u: E(u, 0.3, 1.2), lab: LAB, hot: 0 });
      card(640, 150, 300, 70, { rx: 12, text: 'target = [0]\n정답 클래스 번호', fs: 16, stroke: ACC, color: ACC, s: pop(u, 1.3) });
      card(640, 270, 300, 60, { rx: 12, text: 'softmax 를 씌우지 않은 점수', fs: 15, stroke: INFO, s: pop(u, 1.8) });
      sub(320, 380, '원-핫이 아니라 인덱스 하나', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { bars(40, 250, LOG, 50, { lab: LAB, hot: 0, bw: 44, gap: 16 });
      zone(220, 80, 380, 250, 'nn.CrossEntropyLoss()', { stroke: ACC, fill: ACCBG });
      grow(196, 200, 236, 200, E(u, 0.2, 0.5), MUT);
      tx(240, 124, '안에서 softmax', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4) });
      bars(260, 300, P1, 140, { u: E(u, 0.5, 1.3), lab: LAB, hot: 0, bw: 44, gap: 16, fmt: (a) => a.toFixed(3), col: OFF });
      mono(470, 190, '−log(0.786)', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      grow(600, 200, 680, 200, E(u, 1.8, 2.1), ACC); meter(790, 200, 'loss', lerp(0, 0.2413, E(u, 1.9, 2.5)));
      sub(480, 390, 'logits 를 그대로 넘기면 손실이 알아서 처리한다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { tx(40, 50, 'probs = softmax(logits)  →  criterion(probs, target)', { 'font-size': 15, class: 'mono', 'font-weight': 700, fill: BAD });
      bars(60, 250, P1, 160, { lab: LAB, hot: 0, bw: 40, gap: 14, fmt: (a) => a.toFixed(3), col: OFF });
      grow(210, 200, 260, 200, E(u, 0.3, 0.6), BAD); tx(214, 186, '또 softmax', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.4) });
      bars(290, 250, [0, 1, 2].map((i) => lerp(P1[i], P2[i], E(u, 0.5, 1.4))), 160, { lab: LAB, hot: 0, bw: 40, gap: 14, fmt: (a) => a.toFixed(3), col: OFF });
      sub(370, 300, '세 칸이 평평해진다', fade(u, 1.3), { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      meter(560, 130, 'loss', tween(0.2413, 0.7017, u, 1.4), BAD);
      tx(480, 230, 'class 0 의 기울기', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) });
      hbar(480, 248, 300, 0.214, 0.214, { col: GOOD, text: '−0.214 (정상)', u: E(u, 1.5, 2.0) });
      hbar(480, 282, 300, 0.129, 0.214, { col: BAD, text: '−0.129 (이중)', u: E(u, 1.7, 2.2) });
      sub(480, 390, '에러는 없다 — 기울기만 약해져 학습이 느려진다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const ax = axes(80, 80, 380, 230, { x: [-4, 4], y: [0, 1], xt: [-4, 0, 0.8, 4], yt: [0, 0.5, 1], xl: 'logit', yl: 'sigmoid', grid: true });
      const pts = []; for (let i = 0; i <= 40; i++) { const z = -4 + i * 0.2; pts.push([z, 1 / (1 + Math.exp(-z))]); } R.line(ax, pts, E(u, 0.2, 1.0), INFO);
      if (u > 1.0) { el('line', { x1: ax.X(0.8), y1: ax.Y(0), x2: ax.X(0.8), y2: ax.Y(0.69), stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
        el('line', { x1: ax.X(-4), y1: ax.Y(0.69), x2: ax.X(0.8), y2: ax.Y(0.69), stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
        el('circle', { cx: ax.X(0.8), cy: ax.Y(0.69), r: 7, fill: ACC }); mono(ax.X(0.8) + 12, ax.Y(0.69) + 22, '0.690', { 'font-size': 15, 'font-weight': 800, fill: ACC }); }
      zone(540, 80, 380, 170, 'nn.BCEWithLogitsLoss()', { stroke: ACC, fill: ACCBG });
      mono(560, 140, 'logit 0.8 · target 1.0', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      mono(560, 180, 'sigmoid 내장', { 'font-size': 15, fill: INFO, opacity: fade(u, 1.0) });
      mono(560, 225, '−log(0.690) = 0.3711', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      card(730, 320, 380, 52, { rx: 12, text: 'BCELoss 면 sigmoid 를 직접 씌워야 한다', fs: 14, stroke: WARN, s: pop(u, 2.1) }); return; }
    // k4: MSE
    const pred = [2.5, 0.0, 2.1], tru = [3.0, -0.5, 2.0];
    const ax = axes(80, 80, 440, 200, { x: [-1, 4], y: [0, 3], xt: [-1, 0, 1, 2, 3, 4], yt: [] });
    pred.forEach((p, i) => { const y = ax.Y(2.5 - i * 0.9), s = fade(u, 0.3 + i * 0.3);
      el('line', { x1: ax.X(Math.min(p, tru[i])), y1: y, x2: ax.X(Math.max(p, tru[i])), y2: y, stroke: WARN, 'stroke-width': 4, opacity: s });
      el('circle', { cx: ax.X(p), cy: y, r: 8, fill: ACC, opacity: s }); el('rect', { x: ax.X(tru[i]) - 7, y: y - 7, width: 14, height: 14, fill: INK, opacity: s }); });
    tx(80, 330, '● pred   ■ true', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) });
    ['(−0.5)² = 0.25', '(0.5)² = 0.25', '(0.1)² = 0.01'].forEach((s, i) => mono(580, 120 + i * 42, s, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.3) }));
    el('line', { x1: 580, y1: 230, x2: 800, y2: 230, stroke: INK, 'stroke-width': 1.5, opacity: fade(u, 1.8) });
    mono(580, 268, '평균 = 0.17', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
    sub(480, 395, '회귀는 활성화 없이 선형 출력 그대로 — MSELoss', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 2. 옵티마이저는 파라미터의 참조를 쥔다
  // =========================================================
  function paramT(o) { o = o || {}; const x = 70, y = 110, cs = 34;
    tx(x, y - 16, 'model.weight (3×4)', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: INK });
    for (let r = 0; r < 3; r++) for (let cc = 0; cc < 4; cc++) el('rect', { x: x + cc * cs, y: y + r * cs, width: cs - 3, height: cs - 3, rx: 3, fill: ACCBG, stroke: o.hot ? ACC : GRID, 'stroke-width': o.hot ? 2 : 1.2, opacity: o.op ?? 1 });
    tx(x, 262, 'model.bias (3)', { 'font-size': 14, 'font-weight': 700, class: 'mono' });
    for (let i = 0; i < 3; i++) el('rect', { x: x + i * cs, y: 274, width: cs - 3, height: cs - 3, rx: 3, fill: ACCBG, stroke: GRID, opacity: o.op ?? 1 });
    return { w: [x + 4 * cs, y + 50], b: [x + 3 * cs, 290] }; }
  function s2(t, c) { const { k, u } = c;
    const P = paramT({ op: k === 0 ? fade(u, 0.2) : 1, hot: k === 3 });
    if (k === 0) { pill(140, 370, 'nn.Linear(4, 3) · 값 15개', ACC, pop(u, 0.8), { mono: true, fs: 14 });
      card(640, 200, 380, 90, { rx: 12, text: 'model.parameters() 가 돌려주는 것\n= 이 텐서 두 개', fs: 16, stroke: INFO, s: pop(u, 1.4) }); return; }
    const OX = 560, OY = 70;
    zone(OX, OY, 370, k >= 2 ? 300 : 120, 'optimizer = optim.Adam(...)', { stroke: INFO, fill: C.INFOBG, op: k === 1 ? fade(u, 0.2) : 1 });
    const ref = (g) => { grow(OX + 20, OY + 80, P.w[0] + 12, P.w[1], g, ACC); grow(OX + 20, OY + 100, P.b[0] + 12, P.b[1], g, ACC); };
    if (k === 1) { ref(E(u, 0.6, 1.4)); mono(OX + 20, OY + 54, 'params → 참조 2개', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      const g = R.G(745, 300, pop(u, 1.6)); el('rect', { x: -110, y: -30, width: 220, height: 60, rx: 10, fill: PANEL, stroke: OFF, 'stroke-dasharray': '5 5', 'stroke-width': 2 }, g);
      tx(0, 6, '값 복사본', { 'font-size': 15, 'text-anchor': 'middle', fill: OFF, 'font-weight': 700 }, g);
      if (u > 1.9) cross(745, 300, 18, pop(u, 1.9));
      sub(380, 400, '복사가 아니라 그 텐서 객체를 가리킨다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    ref(1);
    mono(OX + 20, OY + 54, 'param_groups[0] = {', { 'font-size': 15, 'font-weight': 700, fill: INFO });
    const lr = k < 4 ? 0.001 : k === 4 ? lerp(0.001, 0.0005, E(u, 0.6, 1.6)) : 0.0005;
    const rows = [['"params"', '[weight, bias]'], ['"lr"', lr.toFixed(4).replace(/0+$/, '')], ['"weight_decay"', '0']];
    rows.forEach(([a, b], i) => { const y = OY + 100 + i * 46, op = k === 2 ? fade(u, 0.3 + i * 0.4) : 1, hot = (k === 4 && i === 1);
      if (hot) el('rect', { x: OX + 26, y: y - 24, width: 330, height: 36, rx: 6, fill: ACCBG });
      mono(OX + 36, y, a, { 'font-size': 15, fill: ACC, opacity: op }); mono(OX + 340, y, b, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', opacity: op }); });
    mono(OX + 20, OY + 250, '}', { 'font-size': 15, 'font-weight': 700, fill: INFO });
    if (k === 2) { sub(380, 400, '하이퍼파라미터는 그룹 단위로 보관된다 — 지금은 그룹 1개', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { banner(380, 30, 'g["params"][0] is model.weight  →  True', pop(u, 0.4));
      sub(380, 400, '그래서 backward 가 채운 .grad 를 step 이 바로 본다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { sub(380, 400, 'grp["lr"] = 5e-4 — 다음 step 부터 새 lr (스케줄러가 하는 일)', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5
    ['optim.SGD(model.parameters(), lr=0.1, momentum=0.9)', 'optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)'].forEach((s, i) => mono(40, 360 + i * 30, s, { 'font-size': 14, fill: INK, opacity: fade(u, 0.4 + i * 0.5) }));
    pill(745, 400, '첫 인자는 늘 파라미터', GOOD, pop(u, 1.6), { fs: 14 }); }

  // =========================================================
  // 3. 3박자 — zero_grad · backward · step
  // =========================================================
  function graph3(k, u, o) { o = o || {}; const y = 190;
    // x → Linear(w,b) → pred → MSE(y) → loss
    card(60, y, 76, 44, { rx: 8, text: 'x (8,4)', fs: 13.5, mono: true, stroke: INFO, color: INFO });
    const g = o.graph ?? 1;
    grow(100, y, 140, y, g, MUT); card(205, y, 120, 50, { rx: 10, text: 'Linear', fs: 15, stroke: ACC, op: g > 0 ? 1 : 0.3 });
    grow(266, y, 300, y, g, MUT); card(338, y, 70, 40, { rx: 8, text: 'pred', fs: 14, mono: true, stroke: INK, op: g });
    grow(374, y, 410, y, g, MUT); card(455, y, 84, 44, { rx: 8, text: 'MSE', fs: 15, stroke: WARN, op: g });
    card(455, 110, 76, 36, { rx: 8, text: 'y (8,1)', fs: 13.5, mono: true, stroke: INFO, color: INFO }); grow(455, 128, 455, 166, g, MUT);
    grow(498, y, 520, y, g, MUT); card(560, y, 76, 44, { rx: 22, text: 'loss', fs: 15, mono: true, stroke: ACC, color: ACC, op: g });
    // w 와 .grad 칸
    const wx = 70, wy = 270, cw = 92;
    tx(20, wy + 22, 'w', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC }); tx(20, wy + 66, '.grad', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: BAD });
    const wv = o.w || W0; wv.forEach((v, i) => { card(wx + i * cw + cw / 2, wy + 16, cw - 8, 32, { rx: 6, text: v.toFixed(4), fs: 14, mono: true, stroke: o.wHot ? ACC : GRID, fill: o.wHot ? ACCBG : PANEL }); });
    (o.grad || [null, null, null, null]).forEach((v, i) => { card(wx + i * cw + cw / 2, wy + 60, cw - 8, 32, { rx: 6, text: v == null ? 'None' : v.toFixed(4), fs: 14, mono: true, stroke: v == null ? GRID : BAD, color: v == null ? OFF : BAD, op: o.gop ?? 1 }); });
    return { wx, wy, cw, y }; }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { [['model', 'nn.Linear(4, 1)', ACC], ['criterion', 'nn.MSELoss()', WARN], ['optimizer', 'optim.SGD(lr=0.1)', INFO]].forEach(([a, b, col], i) => {
        const s = pop(u, 0.3 + i * 0.5); card(170 + i * 310, 180, 260, 110, { rx: 14, stroke: col, sw: 2.5, s });
        tx(170 + i * 310, 165, a, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.4 + i * 0.5) });
        mono(170 + i * 310, 200, b, { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.5) }); });
      sub(480, 320, '이 셋으로 세 박자를 100번 돌린다', fade(u, 2.0), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const grid = (x, y, r, cc, col, lab, a) => { for (let i = 0; i < r; i++) for (let j = 0; j < cc; j++) { const s = E(u, a + (i * cc + j) * 0.02, a + 0.2 + (i * cc + j) * 0.02); if (s > 0) el('rect', { x: x + j * 30, y: y + i * 30, width: 27 * s, height: 27, rx: 3, fill: col, opacity: 0.25 + 0.4 * ((i * 7 + j * 3) % 5) / 5 }); }
        mono(x, y - 14, lab, { 'font-size': 16, 'font-weight': 800, fill: col }); };
      grid(200, 90, 8, 4, INFO, 'x  (8, 4)', 0.2); grid(520, 90, 8, 1, WARN, 'y  (8, 1)', 1.0);
      sub(480, 380, 'torch.randn 으로 만든 배치 8개 (seed 0)', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const AX = [640, 70, 260, 250];
    const okU = k === 5 ? E(u, 1.4, 2.6) : 0;
    if (k <= 5) { const G = k <= 3 ? null : WG;
      const w = k === 5 ? W0.map((v, i) => lerp(v, W1[i], E(u, 0.3, 1.2))) : W0;
      const L = graph3(k, u, { graph: k === 2 ? E(u, 0.2, 1.2) : 1, grad: k === 3 ? [null, null, null, null] : k === 4 ? WG.map((v, i) => (E(u, 0.9 + i * 0.15, 1.2 + i * 0.15) > 0.5 ? v : null)) : G, wHot: k === 5, w });
      curvePanel(AX[0], AX[1], AX[2], AX[3], k === 5 ? [[L_OK, GOOD, okU, '정상']] : []);
      const lv = k < 2 ? null : k === 5 ? tween(2.6634, 2.1568, u, 1.0) : 2.6634;
      if (k === 2) { mono(560, 240, 'MseLossBackward0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); mono(205, 236, 'AddmmBackward0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
      if (lv != null) { mono(560, 140, lv.toFixed(4), { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 1.3) : 1 }); if (k !== 5) el('circle', { cx: AX[0], cy: AX[1] + AX[3] - 2.6634 / 3 * AX[3], r: 6, fill: ACC, opacity: k === 2 ? fade(u, 1.4) : 1 }); }
      if (k === 3) { pill(320, 58, '① optimizer.zero_grad()', GOOD, pop(u, 0.2), { mono: true, fs: 15 }); sub(300, 400, '.grad 를 비운다 — autograd 는 += 로 누적하기 때문', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      if (k === 4) { pill(320, 58, '② loss.backward()', BAD, pop(u, 0.2), { mono: true, fs: 15 });
        dot([[560, 212], [455, 212], [338, 212], [205, 216], [205, 330]], seg(u, 0.3, 1.3), BAD, 8); dot([[560, 172], [455, 172], [338, 172], [205, 166]], seg(u, 0.4, 1.4), BAD, 6);
        mono(560, 400, 'bias.grad = 0.1941', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.8), 'text-anchor': 'middle' });
        sub(300, 400, 'w 값은 그대로', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      if (k === 5) { pill(320, 58, '③ optimizer.step()', ACC, pop(u, 0.2), { mono: true, fs: 15 });
        sub(300, 400, 'w ← w − 0.1 × grad  ·  loss 2.6634 → 2.1568', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700, class: 'mono' });
        if (okU >= 1) mono(AX[0] + AX[2], AX[1] + AX[3] - 1.1025 / 3 * AX[3] - 12, '1.1025', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end' }); }
      return; }
    // k6 / k7: 결함 재현
    const ax = curvePanel(80, 70, 470, 270, [[L_OK, GOOD, 1, '정상', 1.0], k === 6 ? [L_NOZERO, BAD, E(u, 0.3, 2.0), 'zero_grad 없음', 1.9] : [L_FLAT, WARN, E(u, 0.3, 1.6), 'step 없음', 2.66]]);
    if (k === 6) { tx(690, 90, '|w.grad| 크기', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      ['반복 1', '반복 2', '반복 3'].forEach((s, i) => { const y = 120 + i * 62; tx(690, y + 14, s, { 'font-size': 14, fill: MUT });
        hbar(760, y, 120, G_OK[i], 4, { h: 16, col: GOOD, text: G_OK[i].toFixed(3), u: E(u, 0.5 + i * 0.3, 0.9 + i * 0.3) }); hbar(760, y + 22, 120, G_NOZERO[i], 4, { h: 16, col: BAD, text: G_NOZERO[i].toFixed(3), u: E(u, 0.6 + i * 0.3, 1.0 + i * 0.3) }); });
      sub(480, 405, '지난 기울기가 쌓여 갱신이 엇나간다 — 100번 뒤 1.7239 (정상 1.1025)', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    card(800, 170, 230, 96, { rx: 12, text: '.grad 는 채워지지만\n파라미터가 그대로', fs: 15, stroke: WARN, s: pop(u, 1.0) });
    sub(480, 405, 'step 이 없으면 100번 돌아도 loss 2.6634 그대로', fade(u, 2.0), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }

  // =========================================================
  // 4. 순서 실수 — 한 반복 안의 호출 순서와 .grad 칸
  // =========================================================
  const CHIP = { zero: ['zero_grad()', GOOD], step: ['step()', ACC], back: ['backward()', BAD], fwd: ['forward/loss', INFO] };
  function order(seq, u, y, o) { o = o || {}; const x0 = 60, w = 150, gap = 22;
    seq.forEach((key, i) => { const [s, col] = CHIP[key], cx = x0 + i * (w + gap) + w / 2, on = o.static ? 1 : E(u, 0.2 + i * 0.45, 0.5 + i * 0.45);
      card(cx, y, w, 40, { rx: 20, text: s, fs: 14, mono: true, stroke: col, color: col, fill: on > 0.5 ? PANEL : SOFT, op: 0.35 + 0.65 * on });
      if (i) grow(cx - w / 2 - gap + 2, y, cx - w / 2 - 2, y, on, MUT); }); }
  // .grad 칸 상태: 0 비어 있음 / 1 채워짐 / 2 누적
  function gradSlot(x, y, st, lab) { const col = st === 0 ? OFF : st === 1 ? BAD : C.WARN;
    el('rect', { x, y, width: 150, height: 54, rx: 8, fill: st === 0 ? SOFT : st === 1 ? C.BADBG : C.WARNBG, stroke: col, 'stroke-width': 2 });
    mono(x + 75, y + 33, st === 0 ? 'None' : st === 1 ? '이번 grad' : '누적 grad', { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle' });
    if (lab) tx(x + 75, y - 10, lab, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
  function s4(t, c) { const { k, u } = c;
    const titles = ['실수 1 — step 이 먼저', '실수 2 — 사이에 낀 zero_grad', '실수 3 — 반복문 밖 초기화', '표준 뼈대', 'step 뒤에 zero_grad'];
    tx(40, 42, titles[k], { 'font-size': 17, 'font-weight': 800, fill: k >= 3 ? GOOD : BAD });
    const ax = (series) => curvePanel(600, 110, 270, 220, series);
    if (k === 0) { order(['zero', 'step', 'back'], u, 100);
      gradSlot(110, 170, 0, 'step 할 때 .grad'); sub(185, 250, 'backward 는 그 뒤에야 채운다', fade(u, 1.4), { 'font-size': 14 }); if (u > 0.9 && u < 2.6) { cross(330, 197, 12, pop(u, 0.9)); tx(360, 202, '갱신할 것이 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD }); }
      ax([[L_OK, OFF, 1], [L_FLAT, BAD, E(u, 1.4, 2.4)]]);
      sub(300, 300, '파라미터가 그대로 → loss 2.6634 에서 안 움직임', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
      sub(300, 330, '(회색 = 정상 순서의 곡선)', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 1) { order(['back', 'zero', 'step'], u, 100);
      gradSlot(110, 170, u < 0.6 ? 0 : u < 1.1 ? 1 : 0, 'step 직전 .grad'); if (u > 1.1) { cross(330, 197, 12, pop(u, 1.1)); tx(360, 202, '방금 채운 걸 지웠다', { 'font-size': 15, 'font-weight': 700, fill: BAD }); }
      ax([[L_OK, OFF, 1], [L_FLAT, BAD, E(u, 1.4, 2.4)]]);
      sub(300, 300, '세 줄이 다 있는데 loss 가 안 줄어든다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 2) { mono(60, 105, 'optimizer.zero_grad()   # 루프 밖 1번', { 'font-size': 15, fill: INK, 'font-weight': 700 });
      [1, 2, 3].forEach((it, i) => { const s = E(u, 0.3 + i * 0.4, 0.6 + i * 0.4); tx(80, 160 + i * 52, `반복 ${it}`, { 'font-size': 14, fill: MUT, opacity: s });
        hbar(150, 148 + i * 52, 260, s * G_NOZERO[i], 4, { h: 20, col: i ? WARN : BAD, text: (s * G_NOZERO[i]).toFixed(3) }); });
      tx(150, 136, '|w.grad|', { 'font-size': 13.5, fill: MUT, class: 'mono' });
      ax([[L_OK, OFF, 1], [L_NOZERO, BAD, E(u, 1.0, 2.4)]]);
      sub(300, 340, '첫 반복만 정상 — 그다음부터 loss 가 오르내린다', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { mono(60, 82, 'for epoch in range(100):', { 'font-size': 15, fill: INK, 'font-weight': 700 }); order(['zero', 'fwd', 'back', 'step'], u, 130);
      ax([[L_OK, GOOD, E(u, 1.6, 2.6), '1.1025', 1.1]]);
      sub(300, 300, '반복문 안에서 이 네 줄 순서', fade(u, 2.0), { 'font-size': 16, fill: GOOD, 'font-weight': 700 }); return; }
    order(['fwd', 'back', 'step', 'zero'], u, 130, {});
    ax([[L_OK, GOOD, 1, '1.1025', 1.1]]);
    sub(300, 280, '다음 반복 전에만 지우면 된다', fade(u, 1.8), { 'font-size': 16, fill: GOOD, 'font-weight': 700 });
    sub(300, 310, '정상 순서와 100번 내내 같은 loss (실행 확인)', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); }

  // =========================================================
  // 5. 확장 — 파라미터 그룹 · 스케줄러 · 클리핑
  // =========================================================
  // StepLR(10, 0.5) 실제 lr (에폭 0~9, 10~19, 20~29)
  const LR_HEAD = [1e-3, 5e-4, 2.5e-4], LR_BACK = [1e-4, 5e-5, 2.5e-5];
  function stairs(x, y, w, h, u, mark) { const ax = axes(x, y, w, h, { x: [0, 30], y: [0, 1.1e-3], xt: [0, 10, 20, 30], yt: [], xl: 'epoch' });
    mono(x - 8, ax.Y(1e-3) + 5, '1e-3', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); mono(x - 8, ax.Y(5e-4) + 5, '5e-4', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    const st = (L) => [[0, L[0]], [10, L[0]], [10, L[1]], [20, L[1]], [20, L[2]], [30, L[2]]];
    R.line(ax, st(LR_HEAD), u, ACC, { sw: 3 }); R.line(ax, st(LR_BACK), u, INFO, { sw: 3 });
    if (u >= 1) { mono(x + w + 6, ax.Y(2.5e-4) + 5, 'head', { 'font-size': 14, 'font-weight': 700, fill: ACC }); mono(x + w + 6, ax.Y(2.5e-5) + 2, 'backbone', { 'font-size': 14, 'font-weight': 700, fill: INFO }); }
    if (mark != null) { el('line', { x1: ax.X(mark), y1: y, x2: ax.X(mark), y2: y + h, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); }
    return ax; }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const g = (i) => pop(u, 0.3 + i * 0.4);
      card(170, 170, 200, 80, { rx: 12, text: 'model[0]\nLinear(4, 8)', fs: 15, stroke: INFO, s: g(0) }); card(330, 170, 80, 50, { rx: 10, text: 'ReLU', fs: 14, stroke: WARN, s: g(1) }); card(490, 170, 200, 80, { rx: 12, text: 'model[2]\nLinear(8, 3)', fs: 15, stroke: ACC, s: g(2) });
      pill(170, 260, 'lr 1e-4 · 백본', INFO, pop(u, 1.4), { mono: true, fs: 14 }); pill(490, 260, 'lr 1e-3 · head', ACC, pop(u, 1.7), { mono: true, fs: 14 });
      sub(170, 300, '값 40개', fade(u, 1.5), { 'font-size': 14 }); sub(490, 300, '값 27개', fade(u, 1.8), { 'font-size': 14 });
      card(790, 170, 260, 100, { rx: 12, text: 'param_groups 가\n두 개가 된다', fs: 16, stroke: GOOD, s: pop(u, 2.0) });
      sub(330, 370, '사전학습 백본은 작게, 새 head 는 크게 — 전이학습', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { stairs(90, 70, 540, 260, E(u, 0.3, 2.0));
      pill(805, 120, 'StepLR(step_size=10, gamma=0.5)', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      sub(805, 170, '10 에폭마다 lr × 0.5', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(805, 210, '두 그룹 모두 같은 비율', fade(u, 1.6), { 'font-size': 14 }); return; }
    // k2~k5: 두 겹 루프 시계
    const CX = 250, CY = 220, RO = 150, RI = 92, ep = k === 5 ? lerp(9, 10, E(u, 0.8, 1.6)) : 0;
    el('circle', { cx: CX, cy: CY, r: RO, fill: 'none', stroke: GRID, 'stroke-width': 14 });
    for (let e = 0; e < 30; e++) { const a = -Math.PI / 2 + e / 30 * 2 * Math.PI, on = e < ep; el('line', { x1: CX + Math.cos(a) * (RO - 7), y1: CY + Math.sin(a) * (RO - 7), x2: CX + Math.cos(a) * (RO + 7), y2: CY + Math.sin(a) * (RO + 7), stroke: on ? WARN : MUT, 'stroke-width': on ? 3 : 1.5 }); }
    tx(CX, CY - RO - 14, 'for epoch in range(30)', { 'font-size': 14, class: 'mono', 'text-anchor': 'middle', fill: MUT, 'font-weight': 700 });
    el('circle', { cx: CX, cy: CY, r: RI, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
    mono(CX, CY - RI + 24, 'for xb, yb in loader', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
    const steps = ['zero_grad', 'backward', 'clip', 'step'], hot = k === 2 ? 0 : k === 3 ? 2 : k === 4 ? 3 : -1;
    steps.forEach((s, i) => card(CX, CY - 20 + i * 30, 120, 26, { rx: 6, text: s, fs: 13.5, mono: true, stroke: i === hot ? (i === 2 ? WARN : ACC) : GRID, color: i === hot ? INK : MUT, fill: i === hot ? ACCBG : PANEL }));
    const spin = (u * 1.6) % 1, a = -Math.PI / 2 + spin * 2 * Math.PI; if (k !== 5) el('circle', { cx: CX + Math.cos(a) * (RI + 10), cy: CY + Math.sin(a) * (RI + 10), r: 7, fill: ACC });
    const RX = 470;
    if (k === 2) { tx(RX, 110, '바깥 = 에폭, 안쪽 = 배치', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.3) });
      tx(RX, 150, '3박자는 안쪽에서 돈다', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.8) });
      card(RX + 210, 260, 420, 76, { rx: 12, text: '스케줄러를 안쪽에 두면\n10 배치마다 lr 이 절반 → 금세 0 에 가깝다', fs: 15, stroke: WARN, s: pop(u, 1.5) }); return; }
    if (k === 3) { const ox = RX + 170, oy = 220, rr = 80, L = lerp(150, rr, E(u, 1.0, 1.8)), ang = -0.5;
      el('circle', { cx: ox, cy: oy, r: rr, fill: C.GOODBG, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
      mono(ox, oy + rr + 24, 'max_norm = 1.0', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD });
      el('line', { x1: ox, y1: oy, x2: ox + Math.cos(ang) * L, y2: oy + Math.sin(ang) * L, stroke: L > rr + 2 ? BAD : GOOD, 'stroke-width': 4, 'marker-end': L > rr + 2 ? 'url(#ra-ahr)' : 'url(#ra-ah)' });
      tx(ox + 120, oy - 40, u < 1.0 ? '긴 기울기' : '방향은 그대로, 길이만 자른다', { 'font-size': 14.5, 'font-weight': 700, fill: u < 1.0 ? BAD : GOOD });
      sub(RX + 200, 395, 'backward 다음, step 전 — 이 자리여야 효과가 있다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { tx(RX, 110, 'optimizer.step()', { 'font-size': 18, 'font-weight': 800, class: 'mono', fill: ACC });
      tx(RX, 150, '배치마다 — 파라미터를 움직인다', { 'font-size': 15, fill: MUT });
      for (let b = 0; b < 12; b++) { const on = (u * 4) % 12 > b; el('rect', { x: RX + b * 36, y: 200, width: 30, height: 40, rx: 4, fill: on ? ACC : SOFT, opacity: on ? 0.8 : 1 }); }
      mono(RX, 270, '배치 1 · 2 · 3 …', { 'font-size': 14, fill: MUT }); return; }
    // k5: scheduler.step()
    const ax = stairs(RX, 90, 380, 220, 1, 10);
    pill(RX + 190, 40, 'scheduler.step() — 에폭 끝에 1번', WARN, pop(u, 0.3), { mono: true, fs: 14 });
    mono(RX + 190, 375, 'get_last_lr() → [5e-05, 0.0005]', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.7) }); }

  // ---------- 확인 문제 ----------
  const quiz = [
    { q: 'CrossEntropyLoss에 softmax를 씌운 probs를 넘기면 어떤 일이 생기는가?',
      o: ['에러가 나서 바로 알 수 있다', '에러 없이 손실이 0.2413에서 0.7017로 커지고 기울기가 약해진다', '손실이 0이 되어 학습이 끝난다'], a: 1,
      why: 'CrossEntropyLoss 안에 이미 softmax가 있어 두 번 걸린다. class 0 기울기도 −0.214에서 −0.129로 작아져 학습이 느려진다.' },
    { q: 'optimizer.step() 한 줄이 실제 모델 파라미터를 바꿀 수 있는 이유는 무엇인가?',
      o: ['옵티마이저가 파라미터 텐서의 참조를 들고 있어서', '옵티마이저가 매번 모델을 새로 만들어서', 'step()이 model.parameters()를 다시 복사해서'], a: 0,
      why: 'param_groups[0]["params"][0] is model.weight가 True다. 같은 객체라서 제자리에서 갱신된다.' },
    { q: '3박자에서 zero_grad를 맨 앞에 두는 이유는 무엇인가?',
      o: ['backward가 .grad를 덮어쓰지 않고 += 로 쌓기 때문', 'step이 .grad를 읽지 못하게 하려고', 'forward를 빠르게 하려고'], a: 0,
      why: '지우지 않으면 지난 기울기가 쌓인다. 실행해 보면 |w.grad| 가 2.534, 3.999로 커지고 loss는 100번 뒤 1.7239에 머문다.' },
    { q: 'loss.backward() → optimizer.zero_grad() → optimizer.step() 순서로 쓰면 어떻게 되는가?',
      o: ['정상 순서와 똑같이 학습된다', 'loss가 발산해 NaN이 된다', '방금 채운 .grad를 지워 파라미터가 움직이지 않는다'], a: 2,
      why: 'step이 볼 .grad가 비어 있다. 100번 돌려도 loss가 2.6634에서 그대로다.' },
    { q: 'clip_grad_norm_을 넣을 자리는 어디인가?',
      o: ['backward 다음, optimizer.step() 전', 'optimizer.step() 다음', '에폭 루프가 끝난 뒤'], a: 0,
      why: '.grad가 채워진 뒤, 그 값으로 갱신하기 전에 잘라야 효과가 있다. step 뒤면 이미 갱신이 끝났다.' },
  ];

  const summary = [
    'CrossEntropyLoss는 softmax를 품고 있어 마지막 층은 logits를 그대로 넘긴다.',
    '옵티마이저는 파라미터의 참조를 쥐고 있어 step 한 줄로 실제 가중치가 바뀐다.',
    'autograd가 .grad를 쌓으므로 zero_grad, backward, step 순서를 반복문 안에서 지킨다.',
    '클리핑은 backward와 step 사이, scheduler.step()은 에폭 끝에 한 번 둔다.',
  ];
  const review = [
    { q: '분류 모델을 학습하는데 에러는 없고 손실이 아주 느리게 줄어든다. 모델 끝에 nn.Softmax가 있다. 먼저 할 일은?',
      o: ['학습률을 크게 올린다', '마지막 Softmax를 빼고 logits를 CrossEntropyLoss에 넘긴다', 'MSELoss로 바꾼다'], a: 1,
      why: '손실이 softmax를 한 번 더 걸어 기울기가 약해진 상태다. 실행값으로 class 0 기울기가 −0.214에서 −0.129로 줄었다.' },
    { q: '배치 루프 안에 scheduler.step()을 넣었더니 몇 에폭 만에 학습이 멈췄다. 원인은?',
      o: ['StepLR이 배치마다 불려 10 배치마다 lr이 절반이 됐다', 'optimizer.step()이 사라졌다', '파라미터 그룹이 하나뿐이라서'], a: 0,
      why: 'step_size=10은 scheduler.step() 호출 10번마다 줄인다는 뜻이다. 에폭 끝에 한 번 불러야 10 에폭마다 줄어든다.' },
    { q: '세 박자가 다 있는데 loss가 첫 값에서 한 번도 안 변한다. 의심할 것은?',
      o: ['데이터가 너무 많다', 'zero_grad를 루프 밖에 두었다', 'step이 backward 앞에 있거나 zero_grad가 backward와 step 사이에 있다'], a: 2,
      why: '두 경우 모두 step이 비어 있는 .grad를 본다. 루프 밖 zero_grad는 값이 오르내리지 멈추지는 않는다.' },
  ];

  R.page({ title: '손실 · 옵티마이저 · 3박자', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
