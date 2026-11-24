/* III-1-1 GradientTape 해부 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: y=x² (x=3) → 6.0, persistent 6.0·27.0, 중첩 27.0·18.0 은 코드 주석 값이고 tensorflow 2.21 로 다시 돌려 확인했다.
 * 한 스텝 예(Dense(1)·SGD 0.1·MSE, x=2, y=1)는 초기값 W=0.2, b=0 을 넣어 돌린 값이다 (pred 0.4, loss 0.36, 기울기 −2.4·−1.2, 갱신 뒤 W 0.44·b 0.12). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, cells, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const hsh = (i) => { const s = Math.sin((i + 1) * 78.233) * 43758.5453; return s - Math.floor(s); };
  const KIND = { fwd: INFO, loss: WARN, grad: BAD, apply: GOOD, metric: ACC };

  // 테이프 릴: 바퀴살이 ang 만큼 돈다
  function reel(cx, cy, r, ang, col, op) { const g = el('g', { opacity: op ?? 1 });
    el('circle', { cx, cy, r, fill: PANEL, stroke: col || INK, 'stroke-width': 2.5 }, g); el('circle', { cx, cy, r: r * 0.28, fill: col || INK }, g);
    for (let i = 0; i < 3; i++) { const a = ang + i * 2.094; el('line', { x1: cx + Math.cos(a) * r * 0.32, y1: cy + Math.sin(a) * r * 0.32, x2: cx + Math.cos(a) * r * 0.85, y2: cy + Math.sin(a) * r * 0.85, stroke: col || INK, 'stroke-width': 3, 'stroke-linecap': 'round' }, g); } }
  // 녹화 램프
  function rec(x, y, on) { el('circle', { cx: x, cy: y, r: 8, fill: on ? BAD : OFF }); tx(x + 14, y + 5, 'REC', { 'font-size': 14, 'font-weight': 800, fill: on ? BAD : MUT, class: 'mono' }); }
  // 눈(추적 표시)
  function eye(x, y, s, col) { if (s <= 0) return; const g = R.G(x, y, s);
    el('path', { d: 'M-13,0 Q0,-11 13,0 Q0,11 -13,0 Z', fill: PANEL, stroke: col || GOOD, 'stroke-width': 2.2 }, g); el('circle', { cx: 0, cy: 0, r: 4, fill: col || GOOD }, g); }
  // 벽(stop_gradient)
  function wall(x, y, h, s) { if (s <= 0) return; for (let i = 0; i < 4; i++) el('rect', { x: x - 7, y: y - h / 2 + i * (h / 4) + 1, width: 14, height: h / 4 - 2, rx: 2, fill: i % 2 ? BADBG : BAD, stroke: BAD, opacity: s }); }

  // ---------- 1. fit 상자 열기 ----------
  const SLOT = ['① forward', '② loss', '③ gradient', '④ apply', '⑤ metric'], SK = ['fwd', 'loss', 'grad', 'apply', 'metric'];
  function slots(n, k, u, hot) { SLOT.forEach((s, i) => { const x = 104 + i * 188, on = i < n, isNew = i === n - 1 && k === n;
      const sc = isNew ? pop(u, 0.15) : 1, col = KIND[SK[i]];
      if (!on) { card(x, 34, 160, 36, { rx: 18, stroke: GRID, dash: '5 4', text: s.slice(0, 1), fs: 15, color: OFF, fill: PANEL }); return; }
      card(x, 34, 160, 36, { rx: 18, stroke: col, sw: hot === i ? 3.4 : 2, fill: hot === i ? col : PANEL, text: s, fs: 15, fw: 800, color: hot === i ? PANEL : col, s: sc }); }); }
  // 작은 신경망: x(4칸) → Dense(3) → pred 막대
  const NX = 140, NY = [150, 190, 230, 270], HX = 330, HY = [170, 210, 250], PX = 470;
  const W0 = Array.from({ length: 12 }, (_, i) => hsh(i) * 2 - 1), W1 = W0.map((w, i) => w - 0.55 * (hsh(i + 40) - 0.5));
  function net(o) { o = o || {}; const wf = o.wf || 0;
    NY.forEach((y, i) => card(NX, y, 40, 32, { rx: 5, fill: INFOBG, stroke: INFO, sw: 1.8 }));
    tx(NX, 304, 'x', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono' });
    NY.forEach((y1, i) => HY.forEach((y2, j) => { const w = lerp(W0[i * 3 + j], W1[i * 3 + j], wf), hot = o.grad;
      el('line', { x1: NX + 20, y1, x2: HX - 18, y2, stroke: hot ? BAD : w > 0 ? INFO : WARN, 'stroke-width': 1 + Math.abs(w) * 3.2, opacity: hot ? 0.55 : 0.35 + Math.abs(w) * 0.4, 'stroke-dasharray': hot ? '5 4' : null }); }));
    HY.forEach((y) => el('circle', { cx: HX, cy: y, r: 17, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }));
    tx(HX, 296, 'Dense(3)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono' }); }
  const PB = [0.35, 0.45, 0.2];
  function predBars(gu) { HY.forEach((y, j) => { grow(HX + 18, y, PX - 6, y, gu, MUT, { plain: true, sw: 1.6 });
      el('rect', { x: PX, y: y - 11, width: 110, height: 22, rx: 4, fill: SOFT });
      el('rect', { x: PX, y: y - 11, width: 110 * PB[j] * clamp(gu * 1.4 - 0.4), height: 22, rx: 4, fill: INFO }); });
    tx(PX + 55, 296, 'pred', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', opacity: clamp(gu * 2) }); }
  function s1(t, c) { const { k, u } = c, n = (c.beat.stages || []).length;
    slots(n, k, u, k === 6 ? 2 : null);
    if (k === 0) { // fit 상자에서 재료 넷이 나온다
      const lid = E(u, 0.2, 0.8);
      card(480, 150, 300, 70, { rx: 10, fill: INK, stroke: INK, text: 'model.fit(x, y)', fs: 18, mono: true, color: PANEL });
      el('rect', { x: 330, y: 105 - lid * 18, width: 300, height: 8, rx: 4, fill: MUT, transform: `rotate(${-lid * 5} 330 ${105 - lid * 18})` });
      const ING = [['model', 'Dense(3)'], ['optimizer', 'Adam()'], ['loss_fn', 'SparseCCE'], ['acc', 'SparseCatAcc']];
      ING.forEach(([a, b], i) => { const x = 150 + i * 220, s = pop(u, 0.8 + i * 0.3);
        if (s > 0) { grow(480, 186, x, 262, E(u, 0.7 + i * 0.3, 1.1 + i * 0.3), MUT, { dash: '4 4' }); card(x, 300, 190, 62, { rx: 10, text: a + '\n' + b, fs: 15, mono: true, s, stroke: i === 0 ? INFO : i === 1 ? GOOD : i === 2 ? WARN : ACC }); } });
      note(330, 396, 'compile 에 넘기던 셋 + 메트릭 — 여기선 그냥 변수다', fade(u, 2.2), { fill: MUT }); return; }
    net({ wf: k >= 4 ? (k === 4 ? E(u, 0.6, 1.8) : 1) : 0, grad: k === 3 });
    // ① forward: 점이 x → 층 → pred 로
    const fu = k === 1 ? E(u, 0.2, 1.6) : 1;
    if (k === 1) NY.forEach((y, i) => dot([[NX + 20, y], [HX - 18, HY[i % 3]], [PX, HY[i % 3]]], E(u, 0.2 + i * 0.12, 1.3 + i * 0.12), INFO, 5));
    predBars(fu);
    if (k === 1) { note(620, 150, 'pred = model(x, training=True)', fade(u, 1.4), { class: 'mono', fill: INFO }); sub(760, 186, 'Dropout·BN 은 학습 모드로', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // ② loss: 정답 y 와 비교 → 스칼라
    const lu = k === 2 ? E(u, 0.3, 1.5) : 1;
    card(PX + 55, 344, 92, 34, { rx: 17, text: 'y = 1', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: k === 2 ? pop(u, 0.2) : 1 });
    el('rect', { x: PX - 4, y: HY[1] - 15, width: 118, height: 30, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 2.4, opacity: k === 2 ? fade(u, 0.5) : 1 });
    grow(PX + 116, 210, 700, 210, lu, WARN);
    el('circle', { cx: 740, cy: 210, r: 34 * (k === 2 ? pop(u, 1.2) : 1), fill: WARNBG, stroke: WARN, 'stroke-width': 2.6 });
    tx(740, 216, 'loss', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: k === 2 ? fade(u, 1.4) : 1 });
    if (k === 2) { note(690, 290, '숫자 하나(스칼라)로 줄인다', fade(u, 1.8)); sub(760, 320, '그래야 모든 가중치로 미분할 수 있다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // ③ gradient: loss 에서 거꾸로
    if (k === 3) { [[[706, 210], [PX + 116, 210], [HX + 18, HY[1]], [NX + 20, NY[1]]], [[706, 220], [PX + 116, 250], [HX + 18, HY[2]], [NX + 20, NY[3]]], [[706, 200], [PX + 116, 170], [HX + 18, HY[0]], [NX + 20, NY[0]]]]
        .forEach((rt, i) => dot(rt, E(u, 0.2 + i * 0.25, 1.6 + i * 0.25), BAD, 6));
      card(330, 362, 260, 40, { rx: 8, fill: BADBG, stroke: BAD, text: 'grads = ∂loss / ∂W', fs: 15, mono: true, color: BAD, s: pop(u, 1.5) });
      pill(740, 300, 'GradientTape 가 맡는 자리', BAD, pop(u, 2.0), { fs: 14.5 }); return; }
    // ④ apply: 옵티마이저가 선 굵기를 바꾼다
    card(740, 330, 150, 44, { rx: 10, text: 'Adam', fs: 16, mono: true, stroke: GOOD, color: GOOD, fill: k === 4 ? GOODBG : PANEL });
    if (k === 4) { grow(668, 330, 250, 330, E(u, 0.2, 0.8), GOOD); note(560, 384, 'zip(grads, vars) 로 짝지어 넘긴다', fade(u, 1.6), { fill: GOOD });
      sub(240, 128, '선 굵기 = 가중치 크기', fade(u, 1.0), { 'font-size': 14.5 }); return; }
    // ⑤ metric: 정확도 계기판
    const mu = k === 5 ? E(u, 0.3, 1.8) : 1, gx = 880, gy = 220;
    el('path', { d: `M${gx - 50},${gy} A50,50 0 0 1 ${gx + 50},${gy}`, fill: 'none', stroke: SOFT, 'stroke-width': 12 });
    const a = Math.PI * (1 - 0.8 * mu); el('path', { d: `M${gx - 50},${gy} A50,50 0 0 1 ${gx + 50 * Math.cos(a)},${gy - 50 * Math.sin(a)}`, fill: 'none', stroke: ACC, 'stroke-width': 12, 'stroke-linecap': 'round' });
    tx(gx, gy + 30, 'acc', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, class: 'mono' });
    if (k === 5) { mono(gx, gy - 72, 'update_state', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      sub(860, 290, '진행바의 accuracy', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // k6: ③ 이 이 장의 주제
    banner(480, 392, '③ 을 해 주는 도구 = tf.GradientTape', pop(u, 0.5));
    el('rect', { x: 100, y: 120, width: 540, height: 200, rx: 12, fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '7 5', opacity: fade(u, 1.0) }); }

  // ---------- 2. 녹화 → 되감기 (y = x²) ----------
  function cassette(ang, on, op) { zone(300, 54, 360, 130, null, { fill: SOFT, stroke: GRID, sw: 1.5, op });
    reel(390, 118, 42, ang, on ? BAD : INK, op); reel(570, 118, 42, -ang * 0.8, on ? BAD : INK, op);
    el('path', { d: 'M390,160 L430,176 L530,176 L570,160', fill: 'none', stroke: MUT, 'stroke-width': 3, opacity: op }); }
  function parab(op, tan) { const ax = R.axes(720, 70, 200, 220, { x: [0, 4], y: [0, 16], xt: [0, 3], yt: [0, 9], xl: 'x', yl: 'y = x²' });
    const pts = []; for (let i = 0; i <= 40; i++) { const v = i / 10; pts.push([v, v * v]); }
    R.line(ax, pts, op, INFO, { sw: 2.6 });
    if (op >= 1) { el('circle', { cx: ax.X(3), cy: ax.Y(9), r: 6, fill: INK }); }
    if (tan > 0) { const x0 = lerp(3, 1.8, tan), x1 = lerp(3, 4, tan); el('line', { x1: ax.X(x0), y1: ax.Y(9 + 6 * (x0 - 3)), x2: ax.X(x1), y2: ax.Y(9 + 6 * (x1 - 3)), stroke: BAD, 'stroke-width': 2.8 });
      if (tan >= 1) mono(ax.X(1.9), ax.Y(13.4), '기울기 6', { 'font-size': 15, 'font-weight': 800, fill: BAD }); } }
  function s2(t, c) { const { k, u } = c, isConst = k === 5;
    // 왼쪽: x 카드
    const xs = k === 0 ? pop(u, 0.2) : 1;
    card(140, 118, 200, 70, { rx: 10, text: isConst ? 'c = tf.constant(3.0)' : 'x = tf.Variable(3.0)', fs: 14.5, mono: true, stroke: isConst ? MUT : GOOD, s: xs });
    if (!isConst) eye(140, 70, k === 0 ? pop(u, 0.9) : 1, GOOD);
    if (k === 0) { note(46, 200, 'Variable → 자동 추적 대상', fade(u, 1.2), { fill: GOOD }); sub(480, 120, '테이프는 아직 비어 있다', fade(u, 1.8), { 'font-size': 15 }); cassette(0, false, fade(u, 1.5)); return; }
    // 테이프 (돌기: 녹화 중이면 앞으로, 되감기면 뒤로)
    const spin = k === 1 || k === 2 ? u * 3 : k === 3 ? -u * 5 : 0, on = k === 1 || k === 2;
    cassette(spin, on || (isConst && u > 0.5), 1); rec(440, 74, on);
    mono(480, 40, 'with tf.GradientTape() as tape:', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? BAD : MUT });
    // 기록 칸
    const ops = isConst ? [] : k >= 2 ? [['x', '3.0'], ['mul(x, x)', 'y = 9.0']] : [['x', '3.0']];
    zone(120, 216, 560, 64, null, { fill: PANEL, stroke: GRID, sw: 1.5 });
    tx(100, 255, '기록', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' });
    ops.forEach(([a, b], i) => { const s = k === 2 && i === 1 ? pop(u, 0.5) : k === 1 && i === 0 ? pop(u, 0.8) : 1;
      card(220 + i * 260, 248, 220, 44, { rx: 6, text: `${a}  →  ${b}`, fs: 14.5, mono: true, fw: 700, stroke: i ? INFO : GOOD, fill: i ? INFOBG : GOODBG, s }); });
    if (!isConst && k >= 2) grow(332, 248, 366, 248, k === 2 ? E(u, 0.9, 1.3) : 1, MUT);
    if (k === 1) { sub(400, 320, '여기부터 블록 안의 텐서 연산이 순서대로 남는다', fade(u, 1.5), { 'font-size': 15 }); return; }
    if (k === 2) { note(120, 320, '남는 것은 값이 아니라 "무슨 연산을 했는지"', fade(u, 1.6)); sub(400, 352, '아직 미분값은 없다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (isConst) { mono(400, 248, '(c 는 추적 대상이 아니다 — 기록 없음)', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      card(400, 330, 340, 50, { rx: 10, text: 'tape.gradient(y, c) → None', fs: 16, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.2) });
      note(140, 392, '학습할 값은 Variable 로 만든다 (아니면 tape.watch)', fade(u, 2.0), { fill: MUT }); parab(1, 0); return; }
    // 되감기
    if (k === 3) dot([[600, 248], [350, 248], [220, 248]], E(u, 0.2, 1.6), BAD, 7);
    const v = k === 3 ? E(u, 1.4, 2.1) : 1;
    card(400, 330, 340, 50, { rx: 10, fill: v >= 1 ? BADBG : PANEL, stroke: BAD, s: k === 3 ? pop(u, 1.2) : 1 });
    mono(400, 336, v > 0 ? `dy/dx = 2 · 3.0 = ${(6 * v).toFixed(1)}` : 'dy/dx = ?', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: k === 3 ? fade(u, 1.2) : 1 });
    parab(k === 3 ? E(u, 0.1, 1.0) : 1, k === 3 ? E(u, 1.8, 2.5) : 1);
    if (k === 3) return;
    // k4: 자동미분 = 연산마다 정해진 되감기 규칙
    mono(120, 392, 'mul 의 되감기 규칙  ∂(a·b) = b·∂a + a·∂b', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.4) });
    mono(560, 392, '→ 3.0 + 3.0 = 6.0', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
    card(120, 330, 150, 34, { rx: 17, text: '2x 공식 입력', fs: 14, stroke: MUT, color: MUT, s: pop(u, 1.8) }); cross(120, 330, 13, pop(u, 2.0)); }

  // ---------- 3. 한 스텝 (Dense(1) · SGD 0.1 · MSE) ----------
  const ST = { W: [0.2, 0.44], b: [0, 0.12], pred: [0.4, 1.0], loss: [0.36, 0], gW: -2.4, gb: -1.2 };
  function neuron(o) { // x(2.0) —W→ Σ(+b) → pred
    card(90, 150, 80, 50, { rx: 25, text: 'x = 2.0', fs: 15, mono: true, stroke: INFO, color: INFO });
    el('line', { x1: 130, y1: 150, x2: 262, y2: 150, stroke: INK, 'stroke-width': 3 });
    mono(196, 140, `W = ${o.W.toFixed(2)}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: o.wHot ? GOOD : INK });
    el('circle', { cx: 290, cy: 150, r: 28, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); mono(290, 157, 'Σ', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle' });
    mono(290, 206, `b = ${o.b.toFixed(2)}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: o.wHot ? GOOD : INK }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 5) {
      const ap = k === 5 ? E(u, 0.4, 1.6) : 0, W = lerp(ST.W[0], ST.W[1], ap), b = lerp(ST.b[0], ST.b[1], ap);
      // 녹화 구간
      if (k >= 1) { const g = k === 1 ? E(u, 0.2, 1.2) : 1; el('rect', { x: 40, y: 92, width: 640 * g, height: 160, rx: 12, fill: SOFT, stroke: MUT, 'stroke-width': 1.8, 'stroke-dasharray': '7 5' });
        rec(56, 116, k <= 3); mono(60, 242, 'tape 녹화 구간', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: g }); }
      neuron({ W, b, wHot: k === 5 });
      if (k === 0) { card(560, 150, 170, 46, { rx: 10, text: 'SGD(lr=0.1)', fs: 15, mono: true, stroke: GOOD, s: pop(u, 0.5) });
        card(770, 150, 170, 46, { rx: 10, text: 'MSE', fs: 15, mono: true, stroke: WARN, s: pop(u, 0.8) });
        card(660, 250, 220, 40, { rx: 20, text: 'model.compile(...)', fs: 14.5, mono: true, stroke: MUT, color: MUT, s: pop(u, 1.4) }); cross(660, 250, 14, pop(u, 1.7));
        sub(190, 260, 'W·b 초기값은 예시 (실제로는 무작위)', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      if (k === 1) { sub(360, 300, '이 점선 칸 안의 계산만 미분할 수 있다', fade(u, 1.4), { 'font-size': 15 }); return; }
      // ① forward
      const pv = k === 2 ? E(u, 0.6, 1.6) : 1, pred = k === 5 ? lerp(ST.pred[0], ST.pred[1], E(u, 1.4, 2.4)) : ST.pred[0] * pv;
      if (k === 2) dot([[130, 150], [262, 150], [318, 150], [400, 150]], E(u, 0.2, 1.0), INFO, 6);
      grow(318, 150, 392, 150, k === 2 ? E(u, 0.6, 1.0) : 1, MUT);
      card(460, 150, 120, 46, { rx: 8, text: `pred ${pred.toFixed(2)}`, fs: 15, mono: true, fw: 800, stroke: INFO, color: INFO });
      if (k === 2) { mono(360, 300, 'pred = 2.0 × 0.2 + 0 = 0.4', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.6) }); return; }
      // ② loss: 목표선과 차이
      const lv = k === 3 ? E(u, 0.4, 1.4) : 1, loss = k === 5 ? lerp(ST.loss[0], ST.loss[1], E(u, 1.4, 2.4)) : ST.loss[0] * lv;
      card(600, 104, 90, 34, { rx: 17, text: 'y = 1', fs: 15, mono: true, stroke: GOOD, color: GOOD });
      grow(522, 150, 572, 150, k === 3 ? E(u, 0.2, 0.5) : 1, MUT);
      card(620, 190, 120, 44, { rx: 22, text: `loss ${loss.toFixed(2)}`, fs: 15, mono: true, fw: 800, fill: WARNBG, stroke: WARN, color: WARN, s: k === 3 ? pop(u, 0.4) : 1 });
      // 오른쪽 아래: 수직선 (pred 와 목표)
      const ax = R.axes(720, 290, 200, 0.01, { x: [0, 1.2], y: [0, 1], xt: [0, 0.4, 1] });
      el('line', { x1: ax.X(1), y1: 270, x2: ax.X(1), y2: 300, stroke: GOOD, 'stroke-width': 3 }); mono(ax.X(1) + 6, 266, '목표', { 'font-size': 13.5, fill: GOOD });
      el('circle', { cx: ax.X(pred), cy: 290, r: 8, fill: INFO });
      if (k === 3) { el('line', { x1: ax.X(pred), y1: 290, x2: ax.X(1), y2: 290, stroke: WARN, 'stroke-width': 4, opacity: fade(u, 0.8) });
        mono(360, 300, 'loss = (1 − 0.4)² = 0.36', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.4) }); return; }
      // ③ grads (테이프 밖)
      const gs = k === 4 ? E(u, 1.0, 1.8) : 1;
      if (k === 4) { dot([[620, 168], [460, 150], [290, 150], [196, 150]], E(u, 0.2, 1.4), BAD, 7); dot([[620, 168], [460, 150], [290, 178], [290, 206]], E(u, 0.4, 1.5), BAD, 6); }
      card(250, 340, 300, 64, { rx: 10, fill: BADBG, stroke: BAD });
      mono(250, 332, `∂L/∂W = ${(ST.gW * gs).toFixed(1)}`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      mono(250, 356, `∂L/∂b = ${(ST.gb * gs).toFixed(1)}`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      if (k === 4) { note(430, 330, '테이프 밖에서 한 번에 받는다', fade(u, 1.8), { fill: BAD }); sub(560, 362, '2(pred − y)·x = 2 × (−0.6) × 2', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      // ④ apply
      note(430, 330, 'W ← W − 0.1 × (−2.4) = 0.44', fade(u, 0.3), { fill: GOOD, class: 'mono' });
      note(430, 360, 'b ← b − 0.1 × (−1.2) = 0.12', fade(u, 0.7), { fill: GOOD, class: 'mono' });
      note(430, 396, '다시 넣으면 pred 1.00, loss 0.00', fade(u, 2.2), { fill: INK }); return; }
    // k6·k7: PyTorch 대응
    const rows = (c.beat.compare && c.beat.compare.rows) || [];
    if (k === 6) { tx(60, 40, 'TensorFlow', { 'font-size': 16, 'font-weight': 800, fill: ACC }); tx(560, 40, 'PyTorch', { 'font-size': 16, 'font-weight': 800, fill: INFO });
      rows.forEach((r, i) => { const y = 84 + i * 76, s = pop(u, 0.2 + i * 0.4);
        card(250, y, 380, 44, { rx: 8, text: r.tf, fs: 14, mono: true, stroke: ACC, s });
        card(730, y, 300, 44, { rx: 8, text: r.pt, fs: 14, mono: true, stroke: INFO, s });
        grow(442, y, 578, y, E(u, 0.5 + i * 0.4, 0.9 + i * 0.4), MUT, { plain: true, dash: '4 4' });
        pill(510, y - 26, r.same, MUT, s, { fs: 13.5, fill: PANEL }); });
      return; }
    // k7: 기울기를 받는 손잡이 위치
    zone(30, 40, 430, 300, 'TF: 기울기를 "값"으로 받는다', { fill: ACCBG, color: ACC });
    zone(500, 40, 430, 300, 'PyTorch: .grad 칸에 채운다', { fill: INFOBG, color: INFO });
    mono(60, 110, 'grads = tape.gradient(loss, vars)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
    cells(90, 140, ['−2.4', '−1.2'], { w: 90, h: 44, style: () => ({ stroke: BAD, color: BAD, s: pop(u, 0.5) }) });
    tx(300, 168, '← 내 손에 든 리스트', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
    grow(180, 196, 180, 250, E(u, 1.0, 1.4), ACC); mono(60, 280, 'optimizer.apply_gradients(...)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) });
    mono(530, 110, 'loss.backward()', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4) });
    [['W.grad', '−2.4'], ['b.grad', '−1.2']].forEach(([a, v], i) => { const y = 160 + i * 52; mono(540, y + 6, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      card(700, y, 90, 40, { rx: 6, text: v, fs: 15, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.9 + i * 0.2) }); });
    mono(530, 300, 'optimizer.step()', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.3) });
    banner(480, 388, '순서는 같다 — 손잡이 위치만 다르다', pop(u, 1.9)); }

  // ---------- 4. 세부 규칙 네 가지 ----------
  function miniTape(x, y, w, label, col, o) { o = o || {}; zone(x, y, w, 54, null, { fill: SOFT, stroke: col || GRID, sw: 2, op: o.op ?? 1, dash: o.dash });
    reel(x + 26, y + 27, 16, o.ang || 0, col || INK, o.op ?? 1); mono(x + 52, y + 32, label, { 'font-size': 14.5, 'font-weight': 700, fill: col || INK, opacity: o.op ?? 1 }); }
  function s4(t, c) { const { k, u } = c;
    const RULE = ['persistent', 'watch', '중첩 tape', 'stop_gradient'], cur = [0, 0, 1, 2, 3, 3][k];
    RULE.forEach((r, i) => pill(120 + i * 240, 30, r, i === cur ? ACC : i < cur ? MUT : GRID, 1, { fs: 14.5, fill: i === cur ? ACCBG : PANEL, color: i === cur ? ACC : i < cur ? MUT : OFF }));
    if (k <= 1) { // persistent
      const gone = k === 1 ? E(u, 2.0, 2.5) : 0;
      miniTape(60, 70, 380, 'GradientTape(persistent=True)', ACC, { ang: u * 2, op: 1 - gone * 0.7 });
      card(150, 170, 170, 44, { rx: 6, text: 'y = x·x → 9.0', fs: 14.5, mono: true, stroke: INFO, s: k === 0 ? pop(u, 0.6) : 1, op: 1 - gone * 0.6 });
      card(350, 170, 190, 44, { rx: 6, text: 'z = x·x·x → 27.0', fs: 14.5, mono: true, stroke: INFO, s: k === 0 ? pop(u, 1.0) : 1, op: 1 - gone * 0.6 });
      if (k === 0) { note(60, 260, 'y 와 z 를 각각 미분하려면 테이프가 두 번 살아 있어야 한다', fade(u, 1.6)); return; }
      [['tape.gradient(y, x)', '6.0', 0.3], ['tape.gradient(z, x)', '27.0', 0.9]].forEach(([a, v, at], i) => { const y = 250 + i * 50;
        mono(60, y, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, at) }); grow(250, y - 5, 300, y - 5, E(u, at + 0.2, at + 0.5), MUT);
        card(340, y - 5, 70, 34, { rx: 6, text: v, fs: 15, mono: true, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, at + 0.4) }); });
      if (gone > 0) { cross(250, 97, 18, gone); mono(460, 104, 'del tape', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: gone }); }
      // 오른쪽: 기본(1회용) 테이프
      zone(520, 210, 400, 150, '기본 테이프 (1회용)', { fill: PANEL, stroke: GRID, sw: 1.5, op: fade(u, 0.6) });
      mono(540, 270, '1번째 gradient → 6.0', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 0.8) });
      mono(540, 304, '2번째 gradient → RuntimeError', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      sub(720, 340, '한 번 미분하면 자원이 풀린다', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 2) { // watch
      card(160, 130, 210, 60, { rx: 10, text: 'c = tf.constant(3.0)', fs: 14.5, mono: true, stroke: MUT });
      const w = E(u, 0.6, 1.2); eye(160, 82, w, GOOD); if (w > 0) mono(190, 88, 'tape.watch(c)', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: w });
      miniTape(330, 104, 260, 'y = c · c', w >= 1 ? GOOD : MUT, { ang: u * 2 });
      const r = E(u, 1.4, 2.0);
      card(780, 130, 180, 56, { rx: 10, text: r < 0.5 ? 'None' : '6.0', fs: 20, mono: true, fw: 800, stroke: r < 0.5 ? BAD : GOOD, color: r < 0.5 ? BAD : GOOD, fill: r < 0.5 ? BADBG : GOODBG });
      tx(780, 88, 'tape.gradient(y, c)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, class: 'mono' });
      note(60, 260, '입력에 대한 기울기가 필요할 때 쓴다', fade(u, 1.8));
      sub(330, 296, '적대적 예제 · 설명가능성(어느 픽셀이 결과를 바꿨나)', fade(u, 2.2), { 'font-size': 14.5, 'text-anchor': 'start' }); return; }
    if (k === 3) { // 중첩 → 이계도함수
      zone(40, 64, 560, 250, 't2 (바깥)', { fill: INFOBG, stroke: INFO, sw: 2, color: INFO, op: fade(u, 0.2) });
      zone(70, 104, 300, 110, 't1 (안쪽)', { fill: PANEL, stroke: ACC, sw: 2, color: ACC, op: fade(u, 0.5) });
      mono(90, 172, 'y = x³ = 27.0', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.7) });
      const s1v = E(u, 0.9, 1.5), s2v = E(u, 1.6, 2.2);
      grow(370, 160, 430, 160, s1v, ACC); card(510, 160, 150, 46, { rx: 8, text: 'dy = 3x² = 27.0', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.3) });
      grow(510, 186, 510, 256, s2v, INFO); card(510, 280, 150, 46, { rx: 8, text: 'd2y = 6x = 18.0', fs: 14, mono: true, stroke: INFO, color: INFO, s: pop(u, 2.0) });
      sub(320, 360, '안쪽 기울기를 바깥 테이프가 다시 미분한다 (x = 3)', fade(u, 2.2), { 'font-size': 15 });
      note(640, 160, '2차 최적화', fade(u, 2.3), { fill: MUT }); note(640, 190, '물리 기반 손실 (PINN)', fade(u, 2.4), { fill: MUT }); return; }
    // k4·k5: stop_gradient
    const gan = k === 5, Y = 190;
    const nodes = gan ? [['z', 70], ['G (생성자)', 220], ['fake', 400], ['D (판별자)', 590], ['d_loss', 790]] : [['x', 70], ['model_a', 220], ['frozen', 420], ['model_b', 600], ['loss', 790]];
    nodes.forEach(([s, x], i) => { card(x, Y, tw(s, 15) + 34, 46, { rx: 8, text: s, fs: 15, mono: !gan || i === 0 || i === 2 || i === 4, stroke: i === 4 ? WARN : i === 1 && gan ? INFO : INK, s: pop(u, 0.1 + i * 0.12) });
      if (i) grow(nodes[i - 1][1] + 44, Y, x - tw(s, 15) / 2 - 20, Y, E(u, 0.2 + i * 0.12, 0.5 + i * 0.12), MUT); });
    const wx = gan ? 310 : 320; wall(wx, Y, 70, pop(u, 0.8)); mono(wx, Y + 58, 'stop_gradient', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
    // 역방향 점: loss → 벽에서 멈춤
    const bu = E(u, 1.0, 2.2), bx = lerp(760, wx + 14, bu);
    if (bu > 0) { el('line', { x1: 760, y1: Y + 34, x2: bx, y2: Y + 34, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4' }); el('circle', { cx: bx, cy: Y + 34, r: 6, fill: BAD }); }
    if (bu >= 1) cross(wx - 50, Y + 34, 10, pop(u, 2.2));
    if (!gan) { note(60, 330, 'model_b 는 학습되고, model_a 쪽으로는 기울기가 가지 않는다', fade(u, 2.2)); sub(480, 370, '그 경로의 값을 상수처럼 얼린다', fade(u, 2.4), { 'font-size': 15 }); return; }
    note(60, 330, '판별자를 학습할 때 생성자 쪽으로 기울기가 새지 않게 끊는다', fade(u, 2.2));
    sub(480, 370, '강화학습의 타깃 네트워크 고정도 같은 쓰임', fade(u, 2.4), { 'font-size': 15 }); }

  // ---------- 5. train_step 오버라이드 ----------
  function fitShell(op) { zone(30, 50, 900, 300, 'model.fit(...)  — 에폭·배치 순회 · 콜백 · 진행바', { fill: SOFT, stroke: MUT, sw: 2, op });
    for (let i = 0; i < 5; i++) { const x = 90 + i * 30; el('circle', { cx: x, cy: 320, r: 7, fill: OFF, opacity: op }); } }
  function slotBox(op, s, title) { card(430, 190, 560, 190, { rx: 12, fill: PANEL, stroke: ACC, sw: 2.6, s, op });
    if (title) mono(170, 118, title, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: op }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 4) { fitShell(1);
      slotBox(1, k === 0 ? pop(u, 0.4) : 1, 'MyModel.train_step(self, data)');
      if (k === 0) { mono(170, 160, 'x, y = data', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
        note(170, 230, 'fit 이 매 스텝 부르는 자리를 내 코드로 채운다', fade(u, 1.5), { fill: ACC }); sub(430, 270, '나머지 메서드는 keras.Model 에서 그대로 물려받는다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      // 안쪽 테이프 (①②)
      const tu = k === 1 ? E(u, 0.2, 1.0) : 1;
      el('rect', { x: 170, y: 136, width: 250 * tu, height: 96, rx: 8, fill: SOFT, stroke: MUT, 'stroke-dasharray': '6 4', 'stroke-width': 1.6 });
      rec(186, 154, k === 1);
      mono(186, 190, '① pred = self(x)', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: k === 1 ? fade(u, 0.8) : 1 });
      mono(186, 216, '② loss = compute_loss', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: k === 1 ? fade(u, 1.3) : 1 });
      if (k === 1) { sub(620, 300, 'compile 에 넘긴 loss 를 그대로 쓴다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
      // ③④
      mono(450, 168, '③ grads', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: k === 2 ? fade(u, 0.3) : 1 });
      mono(450, 200, '④ self.optimizer.apply', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: k === 2 ? fade(u, 0.8) : 1 });
      if (k === 2) { card(800, 90, 190, 40, { rx: 8, text: 'compile(optimizer=)', fs: 14, mono: true, stroke: GOOD, s: pop(u, 1.2) }); grow(800, 112, 650, 190, E(u, 1.4, 1.9), GOOD); return; }
      // ⑤ 지표 → 진행바
      mono(450, 232, '⑤ metrics → return {이름: 값}', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: k === 3 ? fade(u, 0.3) : 1 });
      const pb = k === 3 ? E(u, 0.8, 2.0) : 1;
      el('rect', { x: 200, y: 372, width: 300, height: 14, rx: 7, fill: PANEL, stroke: GRID }); el('rect', { x: 200, y: 372, width: 300 * pb, height: 14, rx: 7, fill: ACC });
      mono(520, 384, 'loss: …', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: pb });
      if (k === 3) { sub(720, 314, 'loss 추적기에는 loss, 나머지에는 (y, pred)', fade(u, 1.6), { 'font-size': 14 }); return; }
      // k4: 바깥은 compile · fit 그대로
      for (let i = 0; i < 5; i++) el('circle', { cx: 90 + i * 30, cy: 320, r: 7, fill: i < Math.ceil(E(u, 0.3, 2.2) * 5) ? ACC : OFF });
      mono(250, 326, 'epoch', { 'font-size': 14, fill: MUT });
      pill(760, 326, 'callbacks 그대로', GOOD, pop(u, 1.0), { fs: 14 }); pill(760, 380, 'model.fit(x, y, epochs=5)', INK, pop(u, 0.5), { fs: 14, mono: true }); return; }
    if (k === 5) { // train_step 하나로 부족한 경우
      card(240, 150, 300, 150, { rx: 12, stroke: ACC, sw: 2.4, fill: PANEL });
      mono(240, 98, 'train_step 한 칸', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      mono(240, 150, 'tape 1 · loss 1 · opt 1', { 'font-size': 15, 'text-anchor': 'middle' });
      [['GAN', '모델 2 · tape 2 · 옵티마이저 2'], ['강화학습', '보상으로 만드는 손실'], ['다중 옵티마이저', '부분마다 다른 규칙']].forEach(([a, b], i) => { const y = 92 + i * 86, s = pop(u, 0.4 + i * 0.45);
        card(700, y, 330, 64, { rx: 10, stroke: WARN, fill: WARNBG, s }); tx(560, y - 4, a, { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: s });
        tx(560, y + 20, b, { 'font-size': 14.5, fill: INK, opacity: s }); });
      grow(530, 180, 400, 160, E(u, 1.8, 2.3), BAD); cross(400, 150, 14, pop(u, 2.3));
      sub(240, 260, '한 스텝의 모양 자체가 다르다', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k6: 필요한 만큼만 내려간다 (겹친 상자 + 깊이 화살표)
    const LV = [['model.fit()', '표준 지도학습', GOOD, 820, 300], ['train_step 오버라이드', '스텝 내부만 바꿈', ACC, 620, 220], ['tape 로 짜는 전체 루프', 'GAN · 강화학습', WARN, 420, 140]];
    LV.forEach(([a, b, col, w, h], i) => { const s = pop(u, 0.2 + i * 0.5); el('rect', { x: 480 - w / 2, y: 210 - h / 2 + i * 30, width: w * s, height: h, rx: 14, fill: i === 0 ? SOFT : PANEL, stroke: col, 'stroke-width': 2.4, opacity: s });
      tx(480 - w / 2 + 16, 210 - h / 2 + i * 30 + 26, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: s, class: 'mono' });
      tx(480 + w / 2 - 16, 210 - h / 2 + i * 30 + 26, b, { 'font-size': 14.5, fill: MUT, 'text-anchor': 'end', opacity: s }); });
    banner(480, 392, '표준이면 fit, 필요한 만큼만 안쪽으로', pop(u, 1.9)); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'fit 한 스텝의 다섯 단계 중 GradientTape가 맡는 단계는 무엇인가?',
      o: ['① forward, 입력을 모델에 통과시켜 예측을 얻는다', '③ gradient, 손실을 가중치로 미분해 기울기를 얻는다', '④ apply, 옵티마이저가 가중치를 움직인다'], a: 1,
      why: 'forward·loss는 평범한 계산이고 apply는 옵티마이저 몫이다. 기울기를 구하는 ③ 자리를 tf.GradientTape가 채운다.' },
    { q: 'x = tf.Variable(3.0)에서 y = x * x를 녹화하고 tape.gradient(y, x)를 부르면 무엇이 나오는가?',
      o: ['9.0, y의 값을 돌려준다', 'None, 미분 공식을 넣지 않았기 때문이다', '6.0, 기록된 mul 연산을 되감아 2x를 계산한다'], a: 2,
      why: '테이프는 mul(x, x)라는 연산 기록만 남기고, 되감을 때 연산별 규칙으로 3.0 + 3.0 = 6.0을 만든다. constant 였다면 None이다.' },
    { q: 'W=0.2, b=0, x=2.0, y=1, SGD(lr=0.1)로 한 스텝을 돌리면 W는 얼마가 되는가?',
      o: ['0.44, 기울기 −2.4의 반대 방향으로 0.24 움직인다', '0.20, apply_gradients는 기울기만 저장한다', '−0.04, 기울기 방향 그대로 0.24 움직인다'], a: 0,
      why: 'pred 0.4, loss 0.36에서 ∂L/∂W = −2.4이고, W ← 0.2 − 0.1 × (−2.4) = 0.44다. 갱신 뒤 pred는 1.0이 된다.' },
    { q: '한 테이프로 y와 z를 각각 미분하려면 어떻게 해야 하는가?',
      o: ['tape.watch(y)로 y를 지켜보게 한다', 'GradientTape(persistent=True)로 만들고 다 쓰면 del tape 한다', 'tf.stop_gradient로 y를 감싼다'], a: 1,
      why: '기본 테이프는 gradient를 한 번 부르면 자원이 풀려 두 번째 호출이 RuntimeError다. persistent 테이프는 6.0과 27.0을 모두 돌려준다.' },
    { q: 'train_step만 오버라이드한 모델에서 그대로 쓸 수 있는 것은 무엇인가?',
      o: ['compile의 optimizer·loss와 fit의 콜백·진행바', '아무것도 없다. 루프를 처음부터 다시 짜야 한다', 'fit은 쓸 수 있지만 compile에 넘긴 loss는 못 쓴다'], a: 0,
      why: 'fit은 매 스텝 train_step을 부를 뿐이라 그 안만 바뀐다. self.optimizer·self.compute_loss로 compile 값을 쓰고, 돌려준 딕셔너리가 진행바에 찍힌다.' },
  ];

  const summary = [
    'model.fit 한 스텝은 forward, loss, gradient, apply, metric 다섯 단계로 돈다.',
    'GradientTape는 with 블록 안의 연산을 기록하고 되감아 기울기를 만든다.',
    'Variable은 자동으로 추적되고 constant는 watch 해야 기울기가 나온다.',
    'train_step만 바꾸면 스텝 안은 내 코드로 쓰고 fit의 콜백과 진행바는 그대로 쓴다.',
  ];
  const review = [
    { q: '학습 루프를 짰는데 loss는 찍히지만 가중치가 전혀 바뀌지 않는다. 먼저 의심할 것은?',
      o: ['tape 블록 밖에서 forward를 해서 기울기가 None이다', 'loss가 스칼라가 아니라 벡터다', '모델을 Sequential로 만들었다'], a: 0,
      why: '테이프는 블록 안의 연산만 기록한다. forward나 loss를 밖에서 계산하면 되감을 기록이 없어 기울기가 None이 되고 갱신이 일어나지 않는다.' },
    { q: 'GAN 판별자를 학습하는 동안 생성자 가중치까지 조금씩 바뀌고 있었다. 알맞은 처방은?',
      o: ['판별자 tape를 persistent=True로 바꾼다', '생성자 출력을 tf.stop_gradient로 감싸 그 경로를 끊는다', '생성자 입력 z를 tape.watch 한다'], a: 1,
      why: 'stop_gradient는 감싼 경로를 상수처럼 얼려 기울기가 그쪽으로 흐르지 못하게 한다. watch는 반대로 추적 대상을 늘린다.' },
    { q: 'Keras 3에서 train_step을 오버라이드했더니 진행바 loss가 실제 MSE와 다르게 찍힌다. 먼저 볼 곳은?',
      o: ['self.optimizer를 compile에서 받지 않은 것', 'tape를 두 번 연 것', 'self.metrics를 돌며 loss 추적기에도 (y, pred)를 넣은 것'], a: 2,
      why: 'self.metrics 첫 칸은 loss 평균 추적기라 update_state(loss)로 넣어야 한다. (y, pred)를 넣으면 엉뚱한 값을 평균 낸다.' },
  ];

  RA.page({ title: 'GradientTape — 녹화하고 되감아 기울기를 얻는다', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
