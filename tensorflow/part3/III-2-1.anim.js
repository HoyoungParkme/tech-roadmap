/* III-2-1 Layer·Model 서브클래싱 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: Linear(3) 에 (8,4) 입력 → W (4,3)·b (3,) · 출력 (8,3), ResidualMLP(4, 3) 파라미터 20+20+15=55,
 * MLPWithDropout(16) 80+0+51=131, 세 문법 MLP 모두 131 — tensorflow 2.21(Keras 3.15) 로 돌려 확인했다.
 * DynamicNet 의 두 입력 벡터는 경로를 보여 주려는 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, cells, zone, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const hsh = (i) => { const s = Math.sin((i + 1) * 78.233) * 43758.5453; return s - Math.floor(s); };

  // 층 = 세로 뉴런 줄
  function col(x, ys, o) { o = o || {}; ys.forEach((y, i) => { const off = o.off && o.off(i), s = o.s ?? 1;
      el('circle', { cx: x, cy: y, r: (o.r || 12) * s, fill: off ? PANEL : o.fill || PANEL, stroke: off ? OFF : o.col || INK, 'stroke-width': 2.2, opacity: o.op ?? 1 });
      if (off && s > 0.6) cross(x, y, 6, 1); }); }
  function links(x1, ys1, x2, ys2, u, colr, op) { if (u <= 0) return; ys1.forEach((a, i) => ys2.forEach((b, j) => el('line', { x1: x1 + 12, y1: a, x2: lerp(x1 + 12, x2 - 12, u), y2: lerp(a, b, u), stroke: colr || MUT, 'stroke-width': 1.2, opacity: op ?? 0.45 }))); }
  const ys = (n, cy, gap) => Array.from({ length: n }, (_, i) => cy + (i - (n - 1) / 2) * gap);

  // ---------- 1. 함수형의 한계 → call() ----------
  const VA = [0.5, 1.2, -0.3, 0.8], VB = [-1.0, 0.2, -0.6, -0.4];   // 예시 입력 (평균 0.55, −0.45)
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { // 굳은 그래프
      const IN = ys(4, 200, 44), H = ys(5, 200, 40);
      card(100, 200, 120, 46, { rx: 8, text: 'Input(4)', fs: 15, mono: true, stroke: INFO, s: pop(u, 0.2) });
      col(330, H, { col: INK, s: pop(u, 0.5) }); tx(330, 320, 'Dense(32)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.6) });
      H.forEach((y) => grow(160, 200, 316, y, E(u, 0.6, 1.2), INK, { plain: true, sw: 1.6 }));
      lock(100, 104, true, INK, pop(u, 1.3)); mono(124, 112, '연결이 이 순간 굳는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) });
      el('path', { d: 'M160,220 C220,330 520,330 600,250', fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 1.8) });
      card(660, 230, 200, 46, { rx: 8, text: 'if mean(x) > 0 : ?', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.9) }); cross(660, 280, 13, pop(u, 2.2));
      note(560, 360, '값에 따라 다른 층을 타는 길은 그릴 수 없다', fade(u, 2.3), { fill: BAD }); return; }
    // 클래스 카드
    card(170, 70, 300, 50, { rx: 10, text: 'class DynamicNet(keras.Model)', fs: 15, mono: true, stroke: ACC, fill: ACCBG, s: k === 1 ? pop(u, 0.3) : 1 });
    if (k === 1) { note(40, 150, '모델을 함수 호출이 아니라 클래스로 정의한다', fade(u, 1.0)); sub(320, 190, 'Sequential·함수형 = 함수를 부르는 문법', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    // __init__: 부품 a, b (아직 연결 없음)
    const A = ys(4, 175, 28), B = ys(4, 295, 28), ps = k === 2 ? pop(u, 0.4) : 1;
    if (k <= 3) {
    zone(520, 100, 200, 260, '__init__ 부품', { fill: SOFT, op: ps });
    col(620, A, { col: GOOD, s: ps, r: 10 }); mono(660, 181, 'self.a', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: ps });
    col(620, B, { col: INFO, s: ps, r: 10 }); mono(660, 301, 'self.b', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: ps });
    mono(620, 380, 'Dense(32, relu) × 2', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: ps }); }
    if (k === 2) { note(40, 200, '아직 연결하지 않았다 — 부품만', fade(u, 1.0)); sub(250, 240, '속성으로 두면 Keras 가 가중치를 모아 준다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 3) { // 입력에 따라 경로가 갈린다
      const pick = u < 1.5 ? 0 : 1, v = pick ? VB : VA, m = v.reduce((a, b) => a + b, 0) / 4, pu = E(u, pick ? 1.6 : 0.2, pick ? 2.5 : 1.1);
      cells(40, 200, v.map((x) => x.toFixed(1)), { w: 54, h: 40, style: () => ({ stroke: pick ? INFO : GOOD }) });
      mono(40, 270, `mean = ${m.toFixed(2)}  ${m > 0 ? '> 0 → self.a' : '≤ 0 → self.b'}`, { 'font-size': 15, 'font-weight': 800, fill: pick ? INFO : GOOD });
      dot([[280, 220], [420, 220], [600, pick ? 295 : 175]], pu, pick ? INFO : GOOD, 8);
      el('path', { d: 'M280,220 L420,220 L600,175', fill: 'none', stroke: GOOD, 'stroke-width': pick ? 1.5 : 3.5, opacity: pick ? 0.3 : 1 });
      el('path', { d: 'M280,220 L420,220 L600,295', fill: 'none', stroke: INFO, 'stroke-width': pick ? 3.5 : 1.5, opacity: pick ? 1 : 0.3 });
      mono(760, 210, 'def call(self, x):', { 'font-size': 14.5, 'font-weight': 700 }); mono(760, 236, '  if ...: return a(x)', { 'font-size': 14, fill: GOOD }); mono(760, 260, '  return b(x)', { 'font-size': 14, fill: INFO });
      sub(150, 330, '예시 입력', 1, { 'font-size': 13.5 }); return; }
    // k4: PyTorch 와 판박이
    const rows = (c.beat.parallel && c.beat.parallel.rows) || [];
    rows.forEach((r, i) => { const y = 170 + i * 90, s = pop(u, 0.3 + i * 0.5), pt = r.fw === 'PyTorch';
      pill(90, y, r.fw, pt ? INFO : ACC, s, { fs: 14.5 });
      card(330, y, 300, 50, { rx: 8, text: r.a, fs: 15, mono: true, stroke: pt ? INFO : ACC, s }); mono(490, y + 6, r.b, { 'font-size': 15, 'font-weight': 700, opacity: s }); });
    banner(330, 380, 'forward ↔ call — 한쪽을 알면 다른 쪽이 읽힌다', pop(u, 1.6)); }

  // ---------- 2. 커스텀 Layer: 지연 생성 ----------
  function wgrid(x, y, rows, cols, cs, f, colr, o) { o = o || {}; for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const i = r * cols + q, s = clamp(f * rows * cols - i);
      el('rect', { x: x + q * cs, y: y + r * cs, width: cs - 4, height: cs - 4, rx: 3, fill: s > 0 ? colr : PANEL, opacity: s > 0 ? 0.25 + 0.55 * hsh(i + (o.seed || 0)) : 1, stroke: s > 0 ? colr : GRID, 'stroke-dasharray': s > 0 ? null : '3 3' }); } }
  function s2(t, c) { const { k, u } = c;
    // 왼쪽: 층 카드 (생명주기 표시)
    const LC = [['__init__', '설정', MUT], ['build', '가중치', ACC], ['call', '계산', GOOD]], act = [0, 0, 1, 1, 2, 2][k];
    LC.forEach(([a, b, colr], i) => { const y = 80 + i * 70, on = i <= act; card(110, y, 170, 52, { rx: 10, stroke: on ? colr : GRID, fill: i === act ? colr : PANEL, text: a + ' · ' + b, fs: 14.5, mono: true, color: i === act ? PANEL : on ? colr : OFF });
      if (i) grow(110, y - 44, 110, y - 28, on ? 1 : 0, MUT); });
    mono(30, 316, 'layer = Linear(units=3)', { 'font-size': 14.5, 'font-weight': 700 });
    const nW = k >= 5 ? (k === 5 ? 2 : 2) : k >= 3 ? 2 : 0;
    mono(30, 346, `len(layer.weights) = ${k === 5 ? (u < 1 ? 0 : 2) : nW}`, { 'font-size': 14.5, 'font-weight': 800, fill: (k === 5 ? u >= 1 : nW) ? GOOD : BAD });
    // 오른쪽: W 모양
    const WX = 560, WY = 110, cs = 40;
    if (k <= 1) { mono(WX - 20, WY - 30, k === 0 ? 'W = 아직 없음' : 'W shape = (?, 3)', { 'font-size': 16, 'font-weight': 800, fill: k === 0 ? MUT : BAD });
      if (k === 1) { for (let q = 0; q < 3; q++) el('rect', { x: WX + q * cs, y: WY, width: cs - 4, height: 150, rx: 4, fill: 'none', stroke: BAD, 'stroke-dasharray': '5 4', 'stroke-width': 1.8, opacity: fade(u, 0.4 + q * 0.2) });
        mono(WX - 30, WY + 82, '?', { 'font-size': 30, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        mono(WX + 58, WY + 182, 'units = 3', { 'font-size': 14.5, fill: ACC, 'text-anchor': 'middle' });
        note(300, 380, 'input_dim 은 입력을 봐야 안다 → 생성을 미룬다', fade(u, 1.6), { fill: BAD }); }
      else note(300, 380, '__init__ 이 아는 것은 units 뿐이다', fade(u, 1.0)); return; }
    // 입력 (8, 4)
    const iu = k === 2 ? E(u, 0.2, 1.0) : 1;
    mono(300, 64, 'inputs (8, 4)', { 'font-size': 15, 'font-weight': 700, fill: INFO });
    wgrid(300, 76, 8, 4, 24, iu, INFO, { seed: 3 });
    if (k === 2) { el('rect', { x: 296, y: 72, width: 98, height: 196, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: 0 });
      el('line', { x1: 300, y1: 286, x2: 392, y2: 286, stroke: ACC, 'stroke-width': 3, opacity: fade(u, 1.1) }); mono(346, 308, '마지막 축 = 4', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      mono(560, 160, 'input_dim = input_shape[-1] = 4', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      sub(640, 200, 'batch(8) 는 무시한다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // W (4,3), b (3,)
    const wu = k === 3 ? E(u, 0.3, 1.6) : 1;
    mono(WX, WY - 26, 'W (4, 3)', { 'font-size': 15, 'font-weight': 800, fill: ACC }); wgrid(WX, WY, 4, 3, cs, wu, ACC, { seed: 9 });
    mono(WX + 150, WY - 26, 'b (3,)', { 'font-size': 15, 'font-weight': 800, fill: ACC }); cells(WX + 150, WY, ['0', '0', '0'], { w: 36, h: 36, gap: 4, style: () => ({ stroke: ACC, op: k === 3 ? fade(u, 1.6) : 1 }) });
    if (k === 3) { note(560, 300, 'add_weight → 학습 대상으로 자동 등록', fade(u, 1.8), { fill: ACC }); sub(680, 334, '파라미터 4×3 + 3 = 15', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // call: matmul → (8, 3)
    const cu = k === 4 ? E(u, 0.3, 1.8) : 1;
    mono(760, 260, 'outputs (8, 3)', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
    wgrid(760, 272, 4, 3, 26, cu, GOOD, { seed: 20 }); mono(790, 390, '… 8행', { 'font-size': 13.5, fill: MUT });
    grow(WX + 130, 220, 750, 280, cu, GOOD);
    if (k === 4) { mono(470, 340, 'matmul(inputs, W) + b', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.5) }); sub(560, 376, '매 순전파마다 돈다 · 여기서 가중치를 만들면 안 된다', fade(u, 2.0), { 'font-size': 14 }); return; }
    banner(560, 400, '첫 호출에 build(4) — 가중치 0개 → 2개', pop(u, 1.2)); }

  // ---------- 3. 커스텀 Model: ResidualMLP ----------
  const L = { in: 120, d1: 300, d2: 470, add: 600, out: 780 }, Y4 = ys(4, 200, 46), Y3 = ys(3, 200, 50);
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { [['self.d1', 'Dense(4, relu)', INFO], ['self.d2', 'Dense(4)', INFO], ['self.out', 'Dense(3, softmax)', GOOD]].forEach(([a, b, colr], i) => {
        const x = 200 + i * 280, y = 150 + (i % 2) * 90, s = pop(u, 0.3 + i * 0.4); card(x, y, 220, 64, { rx: 10, stroke: colr, s, text: a + '\n' + b, fs: 15, mono: true }); });
      note(120, 360, '__init__ = 부품 목록 · 연결 순서는 call 이 정한다', fade(u, 1.8)); return; }
    // 입력 + residual 보관
    col(L.in, Y4, { col: INFO, fill: INFOBG }); mono(L.in, 312, 'x (4)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
    const ru = k === 1 ? E(u, 0.3, 1.3) : 1;
    el('path', { d: `M${L.in},${Y4[0] - 18} C${L.in},50 ${L.add},50 ${L.add},${200 - 26}`, fill: 'none', stroke: ACC, 'stroke-width': 3, pathLength: 100, 'stroke-dasharray': `${ru * 100} 100`, 'marker-end': ru >= 1 ? 'url(#ra-ahb)' : null });
    mono(360, 62, 'residual = x', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: ru });
    const d1u = k === 1 ? E(u, 1.2, 2.0) : 1;
    links(L.in, Y4, L.d1, Y4, d1u, INFO); col(L.d1, Y4, { col: INFO, s: k === 1 ? pop(u, 1.8) : 1 }); mono(L.d1, 312, 'd1 · relu', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: d1u });
    if (k === 1) { sub(480, 380, '중간 텐서를 파이썬 변수로 붙잡아 둔다', fade(u, 2.2), { 'font-size': 15 }); return; }
    const d2u = k === 2 ? E(u, 0.3, 1.2) : 1;
    links(L.d1, Y4, L.d2, Y4, d2u, INFO); col(L.d2, Y4, { col: INFO, s: k === 2 ? pop(u, 1.0) : 1 }); mono(L.d2, 312, 'd2 (활성화 없음)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: d2u });
    if (k === 2) { sub(480, 380, '더한 다음에 relu 를 건다 (ResNet 관례)', fade(u, 1.6), { 'font-size': 15 }); return; }
    // + residual → relu → out
    const au = k === 3 ? E(u, 0.2, 1.0) : 1;
    grow(L.d2 + 14, 200, L.add - 26, 200, au, INFO);
    el('circle', { cx: L.add, cy: 200, r: 24 * (k === 3 ? pop(u, 0.6) : 1), fill: ACCBG, stroke: ACC, 'stroke-width': 2.6 }); mono(L.add, 208, '+', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    const ou = k === 3 ? E(u, 1.0, 1.8) : 1;
    links(L.add + 12, [200], L.out, Y3, ou, GOOD, 0.8); col(L.out, Y3, { col: GOOD, s: k === 3 ? pop(u, 1.6) : 1 }); mono(L.out, 312, 'out · softmax (3)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: ou });
    mono(L.add, 252, 'relu', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: au });
    if (k === 3) { sub(480, 380, '더하려면 마지막 차원이 같아야 한다 — 입력 4 = units 4', fade(u, 2.2), { 'font-size': 15 }); return; }
    // 파라미터 수
    [[L.d1, '20'], [L.d2, '20'], [L.out, '15']].forEach(([x, v], i) => pill(x, 350, v, MUT, k === 4 ? pop(u, 0.3 + i * 0.2) : 1, { mono: true, fs: 14 }));
    mono(900, 356, '= 55', { 'font-size': 15, 'font-weight': 800, fill: INK, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 1.0) : 1 });
    if (k === 4) { card(480, 404, 470, 30, { rx: 15, text: 'model.compile(...) → model.fit(x_train, y_train, epochs=5)', fs: 13.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.4) }); return; }
    banner(480, 404, '구조는 서브클래싱 + 학습은 fit 한 줄', pop(u, 0.5)); }

  // ---------- 4. training · get_config · summary ----------
  const H16 = ys(8, 160, 22);
  function summaryTable(x, y, rows, total, op) { const w = 420;
    el('rect', { x, y, width: w, height: 40 + rows.length * 32 + 34, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    [['Layer', 0], ['Output', 190], ['Param #', 330]].forEach(([s, dx]) => tx(x + 14 + dx, y + 26, s, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op }));
    rows.forEach(([a, b, p], i) => { const yy = y + 62 + i * 32; mono(x + 14, yy, a, { 'font-size': 14, opacity: op }); mono(x + 204, yy, b, { 'font-size': 14, opacity: op, fill: b === '?' ? BAD : INK });
      mono(x + w - 14, yy, p, { 'font-size': 14, 'text-anchor': 'end', opacity: op, fill: /unbuilt/.test(p) ? BAD : INK, 'font-weight': 700 }); });
    mono(x + 14, y + 62 + rows.length * 32 + 4, `Total params: ${total}`, { 'font-size': 14.5, 'font-weight': 800, opacity: op, fill: total === '0' ? BAD : GOOD }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) {
      card(180, 70, 300, 50, { rx: 10, text: 'MLPWithDropout(units=16)', fs: 15, mono: true, stroke: ACC, s: k === 0 ? pop(u, 0.2) : 1 });
      mono(40, 130, 'self.units = 16 · self.rate = 0.5', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 0.8) : 1 });
      if (k === 0) { mono(40, 200, 'model.weights → []', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
        note(40, 250, '설정만 남겼다 — 가중치는 아직 없다', fade(u, 1.8)); sub(240, 290, 'get_config 가 이 값을 그대로 내보낸다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      // 스위치
      const sw = k === 1 ? (u < 1.5 ? 1 : 0) : 1;
      mono(40, 200, 'call(self, x, training=None)', { 'font-size': 15, 'font-weight': 700 });
      [['fit', 'training=True', WARN], ['predict', 'training=False', GOOD]].forEach(([a, b, colr], i) => { const y = 250 + i * 50, on = k === 1 ? (i === 0) === (sw === 1) : true;
        pill(80, y, a, colr, 1, { mono: true, fs: 14 }); mono(140, y + 5, '→ ' + b, { 'font-size': 14.5, 'font-weight': 700, fill: on ? colr : OFF }); });
      if (k === 1) { sub(240, 370, 'training 은 Keras 가 넣어 준다 — 받을 자리가 있어야 한다', fade(u, 0.6), { 'font-size': 14.5 }); return; }
      // Dropout 그림: 학습/추론
      const tr = u < 1.5;
      [[560, 'dense (16)'], [760, 'drop(x, training)']].forEach(([x, s], i) => mono(x, 300, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' }));
      col(560, H16, { col: INFO, r: 9 }); col(560, H16.map((y) => y), { col: INFO, r: 9, op: 0.3 });
      col(760, H16, { col: tr ? WARN : GOOD, r: 9, off: (i) => tr && hsh(i + 5) < 0.5 });
      H16.forEach((y) => el('line', { x1: 571, y1: y, x2: 749, y2: y, stroke: MUT, 'stroke-width': 1.2, opacity: 0.4 }));
      mono(660, 350, tr ? 'training=True → 일부를 끈다' : 'training=False → 전부 통과', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: tr ? WARN : GOOD });
      sub(660, 390, '보이는 8칸만 그린 개념도 (rate 0.5)', 1, { 'font-size': 13.5 }); return; }
    if (k === 3) { // get_config → save → load
      card(160, 120, 260, 70, { rx: 10, text: 'get_config()\n{"units": 16, "rate": 0.5}', fs: 14, mono: true, stroke: ACC, s: pop(u, 0.2) });
      grow(292, 120, 400, 120, E(u, 0.6, 1.0), ACC);
      el('path', { d: 'M420,90 h44 l16,16 v44 h-60 Z', fill: ACCBG, stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, 0.9) }); mono(450, 178, 'model.keras', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      grow(484, 120, 616, 120, E(u, 1.2, 1.6), ACC);
      card(770, 120, 300, 50, { rx: 10, text: 'MLPWithDropout(units=16, rate=0.5)', fs: 13.5, mono: true, stroke: GOOD, s: pop(u, 1.6) });
      zone(60, 240, 840, 110, 'get_config 가 없으면', { fill: BADBG, stroke: BAD, sw: 1.5, color: BAD, op: fade(u, 1.8) });
      mono(84, 300, 'model.save(...)  →  NotImplementedError', { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      sub(480, 334, '함수형·Sequential 은 직렬화가 자동, 서브클래싱은 직접 쓴다 (Keras 3 실행 결과)', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k4·k5: summary
    if (k === 4) { mono(40, 60, 'model.summary()   # build 전', { 'font-size': 15, 'font-weight': 700 });
      summaryTable(40, 80, [['dense', '?', '0 (unbuilt)'], ['dropout', '?', '0'], ['dense_1', '?', '0 (unbuilt)']], '0', fade(u, 0.5));
      note(500, 140, '에러가 아니다 — 아직 입력을 본 적이 없다', fade(u, 1.4), { fill: BAD }); sub(700, 180, 'Keras 2 에서는 ValueError 였다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 5) { mono(40, 60, 'model(tf.zeros((1, 4)))   # 더미 입력', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      const f = E(u, 0.4, 1.4); summaryTable(40, 80, f < 0.5 ? [['dense', '?', '0 (unbuilt)'], ['dropout', '?', '0'], ['dense_1', '?', '0 (unbuilt)']] : [['dense', '(1, 16)', '80'], ['dropout', '?', '0'], ['dense_1', '(1, 3)', '51']], f < 0.5 ? '0' : '131', 1);
      note(500, 140, '4×16 + 16 = 80 · 16×3 + 3 = 51', fade(u, 1.6), { class: 'mono' });
      card(690, 260, 400, 64, { rx: 10, fill: WARNBG, stroke: WARN, s: pop(u, 2.0) });
      tx(690, 254, 'model.build((None, 4)) 만 부르면', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.0) });
      tx(690, 278, '경고만 나고 합계 0 (build() 가 없을 때)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    // k6: 자동 주입
    [['model.fit(...)', 'training=True', WARN, 120], ['model.predict(...)', 'training=False', GOOD, 260]].forEach(([a, b, colr, y], i) => { const s = pop(u, 0.3 + i * 0.5);
      card(200, y, 260, 56, { rx: 10, text: a, fs: 15, mono: true, stroke: colr, s }); grow(334, y, 520, y, E(u, 0.6 + i * 0.5, 1.0 + i * 0.5), colr);
      card(700, y, 300, 56, { rx: 10, text: 'call(x, ' + b + ')', fs: 15, mono: true, stroke: colr, color: colr, s }); });
    note(60, 380, '직접 model(x) 를 부를 때만 training 을 손으로 넘긴다', fade(u, 1.8)); }

  // ---------- 5. 세 문법 지도 ----------
  function s5(t, c) { const { k, u } = c;
    const TX = [160, 480, 800], NM = ['Sequential', '함수형', '서브클래싱'], CL = [MUT, WARN, ACC];
    NM.forEach((n, i) => { if (k < i) return; const s = k === i ? pop(u, 0.2) : 1, x = TX[i];
      zone(x - 140, 40, 280, 230, null, { fill: k === i ? (i === 2 ? ACCBG : SOFT) : PANEL, stroke: CL[i], sw: k === i ? 2.6 : 1.5, op: s });
      tx(x, 70, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: CL[i], opacity: s });
      if (i === 0) [['Dense(16, relu)', 120], ['Dense(3, softmax)', 180]].forEach(([b, y]) => card(x, y, 200, 44, { rx: 6, text: b, fs: 14, mono: true, stroke: INK, s }));
      if (i === 1) { [['Input(4)', 110], ['Dense(16)', 165], ['Dense(3)', 220]].forEach(([b, y], j) => { card(x, y, 140, 36, { rx: 18, text: b, fs: 14, mono: true, stroke: WARN, s }); if (j) grow(x, y - 37, x, y - 20, s, WARN); }); }
      if (i === 2) { mono(x - 120, 110, 'class SubMLP(Model):', { 'font-size': 14, 'font-weight': 700, opacity: s }); mono(x - 110, 146, '__init__: d, o', { 'font-size': 14, opacity: s });
        mono(x - 110, 182, 'call: o(d(x))', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: s }); if (k >= 3) { mono(x - 110, 218, 'pdb · print 가능', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.6) : 1 }); } }
      mono(x, 250, 'params 131', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: INK, opacity: k === i ? fade(u, 1.2) : 1 }); });
    const T = c.beat.table || { rows: [] };
    if (k <= 3) { // 표의 한 줄씩
      T.rows.forEach((r, i) => { const x = TX[i]; r.cells.forEach((v, j) => mono(x - 120, 300 + j * 26, `${T.cols[j]}: ${v}`, { 'font-size': 13.5, fill: /✓/.test(v) ? GOOD : /수동|약함|일자/.test(v) ? BAD : INK, opacity: i === k && k <= 2 ? fade(u, 0.8 + j * 0.2) : 1 })); });
      if (k === 3) sub(480, 412, '세 문법 모두 같은 MLP — 파라미터 131개 (Keras 3 실행 결과)', fade(u, 1.4), { 'font-size': 14 }); return; }
    // k4·k5: 위에서 아래로 내려가는 선택
    const FC = c.beat.flowchart || [];
    FC.forEach((f, i) => { const y = 300 + i * 38, s = k === 4 ? pop(u, 0.2 + i * 0.5) : 1;
      tx(120, y + 5, f.q, { 'font-size': 14.5, opacity: s }); grow(560, y, 640, y, s, CL[i]); pill(TX[i] === 480 ? 720 : 720, y, f.yes, CL[i], s, { fs: 14 }); });
    if (k === 5) banner(480, 412, '최강 조합: 서브클래싱 + 커스텀 train_step + fit', pop(u, 0.5)); }

  const quiz = [
    { q: '함수형 API로는 표현할 수 없고 서브클래싱이 필요한 모델은 무엇인가?',
      o: ['입력이 두 개이고 출력이 하나인 모델', '입력 값의 평균에 따라 다른 층을 타는 모델', '층을 한 줄로 쌓은 모델'], a: 1,
      why: '함수형은 빌드할 때 연결이 굳는 정적 그래프다. 값에 따라 경로를 고르는 if 분기는 call() 안의 파이썬 코드로만 쓸 수 있다.' },
    { q: 'Linear(units=3)의 W를 __init__이 아니라 build에서 만드는 이유는 무엇인가?',
      o: ['W의 모양 (input_dim, 3) 중 input_dim은 첫 입력을 봐야 알 수 있어서', 'build에서 만들어야 W가 0으로 초기화되어서', 'call이 매번 새 W를 만들기 때문에'], a: 0,
      why: '(8, 4) 입력을 처음 받는 순간 build가 input_shape[-1] = 4를 읽고 W (4, 3)와 b (3,)를 만든다. 그래서 weights가 0개에서 2개가 된다.' },
    { q: 'ResidualMLP(units=4, n_classes=3)에서 h + residual이 가능한 조건은 무엇인가?',
      o: ['출력층이 softmax 여야 한다', 'd2에 relu가 걸려 있어야 한다', '입력 차원과 units가 4로 같아야 한다'], a: 2,
      why: '더하려면 두 텐서의 마지막 차원이 같아야 한다. 다르면 residual 쪽에 Dense를 하나 끼워 맞춘다.' },
    { q: 'Keras 3에서 build 전에 서브클래싱 모델의 summary()를 부르면 어떻게 되는가?',
      o: ['ValueError로 멈춘다', '층마다 ? 와 0 (unbuilt)가 찍힌다', '자동으로 (None, 4)를 가정해 131이 찍힌다'], a: 1,
      why: '아직 입력을 본 적이 없어서 모양과 파라미터를 모른다. 더미 입력 (1, 4)를 흘리면 80 · 0 · 51, 합계 131로 채워진다.' },
    { q: '층이 일자로 쌓이는 단순한 분류 모델이라면 어떤 문법이 알맞은가?',
      o: ['Sequential, 가장 쉽고 직렬화도 자동이다', '서브클래싱, 표현력이 가장 크다', '함수형, 일자 구조에서는 Sequential을 쓸 수 없다'], a: 0,
      why: '세 문법이 같은 MLP(파라미터 131)를 만든다면 쉬운 쪽이 이긴다. 막힐 때만 함수형, 서브클래싱으로 내려간다.' },
  ];

  const summary = [
    '함수형은 연결이 굳는 정적 그래프라 입력 값에 따른 분기를 담지 못한다.',
    '커스텀 Layer는 첫 입력을 본 build에서 W의 모양을 정해 가중치를 만든다.',
    '서브클래싱 Model도 compile과 fit으로 그대로 학습한다.',
    'get_config는 직접 써야 하고, summary는 더미 입력으로 빌드한 뒤에 채워진다.',
  ];
  const review = [
    { q: '서브클래싱 모델을 model.save 했더니 NotImplementedError가 났다. 먼저 할 일은?',
      o: ['model.build((None, 4))를 부른다', '__init__ 인자를 돌려주는 get_config를 구현한다', 'call에 training 인자를 추가한다'], a: 1,
      why: 'Keras 3은 __init__ 인자를 복원할 방법이 없으면 저장 단계에서 멈춘다. get_config로 units·rate를 돌려주면 저장과 로드가 된다.' },
    { q: '학습 정확도는 높은데 predict 결과가 매번 조금씩 달라진다. 서브클래싱 call에서 의심할 줄은?',
      o: ['self.drop(x)처럼 training을 하위 층에 넘기지 않은 줄', 'super().__init__()를 부른 줄', 'self.dense를 __init__에서 만든 줄'], a: 0,
      why: 'training을 넘기지 않으면 Dropout이 엉뚱한 모드로 돌 수 있다. drop(x, training=training)처럼 받은 값을 그대로 전달한다.' },
    { q: 'build()를 쓰지 않은 서브클래싱 모델에 model.build((None, 4)) 후 summary를 봤더니 합계가 0이다. 알맞은 처방은?',
      o: ['batch 차원을 None 대신 1로 바꾼다', 'Sequential로 다시 만든다', 'model(tf.zeros((1, 4)))로 더미 입력을 한 번 흘린다'], a: 2,
      why: 'Keras 3은 이 경우 경고만 내고 가중치를 만들지 않는다. 실제로 한 번 호출해야 각 층의 build가 돌아 131이 찍힌다.' },
  ];

  RA.page({ title: '서브클래싱 — 층과 모델을 클래스로 짠다', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
