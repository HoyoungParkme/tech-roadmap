/* III-2-2 fit vs GradientTape — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: MNIST 첫 학습 이미지(라벨 5)를 2×2 평균으로 줄인 14×14 밝기(0~9 단계), 모델 파라미터 0 + 100,480 + 1,290 = 101,770,
 * 두 방식의 에폭 평균 학습 손실과 테스트 결과는 tensorflow 2.21 CPU 에서 seed 0 으로 같은 코드를 돌린 값이다.
 * (방식 1 은 validation_split=0.1 이라 54,000장, 방식 2 는 60,000장으로 학습) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, cells, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const hsh = (i) => { const s = Math.sin((i + 1) * 78.233) * 43758.5453; return s - Math.floor(s); };

  const DIGIT = '0000000000000000000000000000000000002243000000578995630000006893600000000003700000000000006410000000000016820000000000005810000000002688000000001598510000002699510000000034310000000000000000000000';
  const LOSS1 = [0.271, 0.121, 0.082, 0.060, 0.044], LOSS2 = [0.259, 0.114, 0.079, 0.058, 0.045];
  function digit(x, y, cs, f, o) { o = o || {}; for (let i = 0; i < 196; i++) { const v = +DIGIT[i] / 9, s = clamp(f * 196 - i * 0.6);
      if (s <= 0) continue; el('rect', { x: x + (i % 14) * cs, y: y + Math.floor(i / 14) * cs, width: cs - 1, height: cs - 1, fill: v > 0 ? (o.col || INK) : SOFT, opacity: v > 0 ? (0.15 + 0.85 * v) * s : s }); } }
  function noise(x, y, cs, seed) { for (let i = 0; i < 196; i++) el('rect', { x: x + (i % 14) * cs, y: y + Math.floor(i / 14) * cs, width: cs - 1, height: cs - 1, fill: ACC, opacity: 0.1 + 0.6 * hsh(i * 7 + seed) }); }

  // ---------- 1. 같은 조건의 대결 ----------
  function modelCol(x, s, colr, title) { tx(x, 70, title, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: colr, opacity: s });
    [['Flatten → 784', '0'], ['Dense(128, relu)', '100,480'], ['Dense(10, softmax)', '1,290']].forEach(([a, p], i) => { const y = 120 + i * 62;
      card(x, y, 230, 46, { rx: 8, text: a, fs: 14.5, mono: true, stroke: colr, s }); mono(x + 128, y + 5, p, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: s });
      if (i) grow(x, y - 39, x, y - 23, s, MUT); });
    mono(x, 316, '합계 101,770', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { digit(60, 60, 18, E(u, 0.2, 1.6));
      mono(60, 340, 'x_tr[0] · 라벨 5', { 'font-size': 15, 'font-weight': 800 }); sub(186, 370, '28×28 을 2×2 평균으로 줄여 그림', 1, { 'font-size': 13.5 });
      const RAW = [0, 81, 240, 253], NRM = ['0.00', '0.32', '0.94', '0.99'];
      mono(420, 110, '15행의 픽셀 일부', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.8) });
      cells(420, 126, RAW, { w: 70, h: 44, style: () => ({ stroke: INK, op: fade(u, 0.9) }) });
      mono(560, 210, '÷ 255', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); grow(560, 220, 560, 240, E(u, 1.4, 1.6), ACC);
      cells(420, 250, NRM, { w: 70, h: 44, style: () => ({ stroke: ACC, color: ACC, op: fade(u, 1.7) }) });
      mono(420, 340, 'x_tr (60000, 28, 28) · x_te (10000, 28, 28)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k <= 2) modelCol(200, k === 1 ? pop(u, 0.2) : 1, ACC, '방식 1 · fit'); if (k <= 2) modelCol(760, k === 1 ? pop(u, 0.6) : 1, INFO, '방식 2 · tape');
    if (k === 1) { mono(480, 186, 'make_model()', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); grow(420, 196, 330, 196, E(u, 1.2, 1.6), MUT); grow(540, 196, 630, 196, E(u, 1.2, 1.6), MUT);
      sub(480, 380, '모델 객체를 새로 찍어 낸다 — 가중치가 서로 새지 않게', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 2) { [['EPOCHS 5', 130], ['BATCH 32', 186], ['LR 1e-3', 242]].forEach(([s, y], i) => card(480, y, 150, 40, { rx: 20, text: s, fs: 15, mono: true, fw: 800, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 0.2 + i * 0.3) }));
      mono(200, 360, 'validation_split=0.1 → 1,688 스텝/에폭', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) });
      mono(760, 360, '60,000 ÷ 32 = 1,875 스텝/에폭', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); return; }
    // k3·k4: 결과
    const ax = R.axes(320, 70, 320, 230, { x: [1, 5], y: [0, 0.3], xt: [1, 2, 3, 4, 5], yt: [0, 0.1, 0.2, 0.3], xl: 'epoch', yl: '학습 loss (에폭 평균)', grid: true });
    const lu = k === 3 ? E(u, 0.2, 1.8) : 1;
    R.line(ax, LOSS1.map((v, i) => [i + 1, v]), lu, ACC, { sw: 3 }); R.line(ax, LOSS2.map((v, i) => [i + 1, v]), lu, INFO, { sw: 3, dash: '7 5' });
    if (lu >= 1) { mono(ax.X(1) + 10, ax.Y(0.271) - 4, '0.271', { 'font-size': 13.5, fill: ACC, 'font-weight': 700 }); mono(ax.X(1) + 10, ax.Y(0.259) + 16, '0.259', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 }); }
    [[ACC, '방식 1 · fit', '97.6%', '0.086', 150], [INFO, '방식 2 · tape', '97.5%', '0.079', 810]].forEach(([colr, n, a, l, x], i) => { const s = k === 3 ? pop(u, 1.4 + i * 0.3) : 1;
      card(x, 180, 220, 130, { rx: 12, stroke: colr, sw: 2.4, s });
      tx(x, 140, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: colr, opacity: s }); mono(x, 186, a, { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', opacity: s });
      mono(x, 222, 'test loss ' + l, { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); });
    if (k === 3) { sub(480, 395, '두 곡선이 겹친다 — seed 0 실행값', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    card(150, 300, 220, 40, { rx: 20, text: '어느 게 더 정확한가?', fs: 15, stroke: MUT, color: MUT, fill: PANEL, s: pop(u, 0.2) }); cross(150, 300, 15, pop(u, 0.7));
    banner(480, 398, '물어야 할 것: 학습 과정에 손을 넣어야 하는가', pop(u, 1.3)); }

  // ---------- 2. 개입 지점 매핑 ----------
  const LB = [['compile(optimizer, loss)', 90], ['callbacks=[EarlyStopping]', 150], ['fit(...)', 240], ['evaluate', 330]];
  const RB = [['optimizer = Adam(LR)', 2], ['loss_fn = SCCE()', 2], ['ds = Dataset…batch(32)', 2], ['for epoch / for x, y', 3], ['with tape: pred, loss', 3], ['grads = tape.gradient', 4], ['apply_gradients(...)', 5], ['print · if: break', 6]];
  function knob(x, y, on, colr) { el('circle', { cx: x, cy: y, r: 7, fill: on ? colr : PANEL, stroke: on ? colr : GRID, 'stroke-width': 2 }); }
  function s2(t, c) { const { k, u } = c;
    tx(170, 40, '방식 1 · 약 12줄', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    tx(760, 40, '방식 2 · 약 40줄', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: k >= 2 ? 1 : 0.3 });
    // 왼쪽
    LB.forEach(([s, y], i) => { const show = i === 0 || k >= 1, sc = (i === 1 || i === 2) && k === 1 ? pop(u, 0.2 + (i - 1) * 0.4) : 1; if (!show) return;
      if (i === 2) { el('rect', { x: 40, y: y - 40, width: 260 * sc, height: 80, rx: 10, fill: INK });
        mono(170, y - 6, 'fit(x, y, ...)', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: sc }); mono(170, y + 20, '순전파·손실·역전파·갱신', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'middle', opacity: sc }); return; }
      card(170, y, 260, 44, { rx: 8, text: s, fs: 14, mono: true, stroke: i === 3 ? GRID : ACC, s: sc }); if (i < 2) knob(318, y, true, ACC); });
    if (k === 0) { note(40, 160, '개입 ① compile 인자', fade(u, 0.8), { fill: ACC }); sub(170, 200, '무엇으로 학습할지만 정한다', fade(u, 1.4), { 'font-size': 14.5 }); }
    if (k === 1) { note(330, 246, '← 그 안은 손댈 수 없다', fade(u, 1.4), { fill: BAD }); note(340, 156, '개입 ② 콜백 (정해진 시점만)', fade(u, 1.0), { fill: ACC }); }
    if (k < 2) return;
    // 오른쪽 블록
    const nR = [0, 0, 3, 5, 6, 7, 8][k];
    RB.slice(0, nR).forEach(([s, from], i) => { const y = 74 + i * 42, isNew = (k === 2 && i < 3) || (k === 3 && i >= 3) || (k >= 4 && i === nR - 1), sc = isNew ? pop(u, 0.2 + (i % 3) * 0.3) : 1;
      card(760, y, 280, 34, { rx: 6, text: s, fs: 13.5, mono: true, stroke: INFO, s: sc }); knob(612, y, true, INFO);
      const ly = from === 2 ? 90 : from === 3 || from === 4 || from === 5 ? 240 : 150, gu = isNew ? E(u, 0.6, 1.4) : 1;
      if (gu > 0) el('path', { d: `M302,${ly} C450,${ly} 470,${y} ${lerp(302, 604, gu)},${lerp(ly, y, gu)}`, fill: 'none', stroke: MUT, 'stroke-width': 1.4, 'stroke-dasharray': '4 4', opacity: 0.7 }); });
    if (k === 4) { mono(330, 400, 'grads = [∂kernel₁, ∂bias₁, ∂kernel₂, ∂bias₂]', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) }); }
    if (k === 5) note(330, 400, '여러 배치를 모았다가 한 번에 적용할 수도 있다', fade(u, 1.4), { fill: GOOD });
    if (k === 6) { mono(170, 400, '손잡이 2곳', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      mono(760, 420 - 6, '모든 줄이 손잡이', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); } }

  // ---------- 3. GAN: 두 모델·두 tape ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { [['g_opt = Adam(1e-4)', '생성자용', ACC, 200], ['d_opt = Adam(1e-4)', '판별자용', INFO, 520]].forEach(([a, b, colr, x], i) => {
        card(x, 120, 260, 60, { rx: 10, text: a, fs: 15, mono: true, stroke: colr, s: pop(u, 0.2 + i * 0.4) }); tx(x, 172, b, { 'font-size': 14.5, 'text-anchor': 'middle', fill: colr, opacity: fade(u, 0.5 + i * 0.4) }); });
      card(820, 120, 150, 50, { rx: 10, text: 'bce', fs: 15, mono: true, stroke: WARN, s: pop(u, 1.0) });
      card(360, 290, 300, 50, { rx: 10, text: 'compile(optimizer= ▢ )', fs: 15, mono: true, stroke: MUT, color: MUT, s: pop(u, 1.4) });
      grow(200, 186, 330, 270, E(u, 1.6, 2.0), BAD); grow(520, 186, 390, 270, E(u, 1.7, 2.1), BAD); cross(360, 250, 13, pop(u, 2.2));
      sub(700, 300, '자리는 하나, 옵티마이저는 둘', fade(u, 2.3), { 'font-size': 15 }); return; }
    // z → G → fake → D ← real
    const zs = k === 1 ? E(u, 0.2, 1.2) : 1;
    for (let i = 0; i < 12; i++) el('rect', { x: 40, y: 70 + i * 16, width: 24, height: 14, rx: 2, fill: INK, opacity: (0.15 + 0.7 * hsh(i + 3)) * clamp(zs * 12 - i) });
    mono(52, 280, 'z', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' }); mono(52, 302, '(batch, 100)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
    if (k === 1) { sub(330, 180, '데이터가 아니라 난수가 입력이다 — fit(x, y) 모양이 아니다', fade(u, 1.3), { 'font-size': 15, 'text-anchor': 'start' }); return; }
    const gu = k === 2 ? E(u, 0.2, 1.0) : 1;
    grow(70, 160, 140, 160, gu, MUT); card(190, 160, 96, 56, { rx: 10, text: 'G', fs: 18, stroke: ACC, color: ACC, fill: ACCBG });
    grow(240, 160, 290, 160, gu, ACC); noise(300, 100, 9, 1); mono(363, 240, 'fake', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    digit(300, 270, 9, 1, { col: INK }); mono(363, 410, 'real', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle' });
    grow(430, 160, 510, 220, k === 2 ? E(u, 0.8, 1.3) : 1, MUT); grow(430, 330, 510, 250, k === 2 ? E(u, 0.9, 1.4) : 1, MUT);
    card(560, 235, 96, 56, { rx: 10, text: 'D', fs: 18, stroke: INFO, color: INFO, fill: INFOBG });
    // 두 테이프 띠
    if (k === 2) { el('rect', { x: 140, y: 90, width: 300 * E(u, 0.5, 1.5), height: 10, rx: 5, fill: ACC, opacity: 0.6 }); mono(140, 82, 'g_tape', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      el('rect', { x: 140, y: 56, width: 470 * E(u, 0.7, 1.8), height: 10, rx: 5, fill: INFO, opacity: 0.6 }); mono(520, 48, 'd_tape', { 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.8) });
      sub(780, 140, '같은 순전파를 두 테이프가 함께 기록', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // D 출력 수직선 0~1
    const NX = 680, NW = 240, Xv = (v) => NX + v * NW;
    el('line', { x1: NX, y1: 300, x2: NX + NW, y2: 300, stroke: MUT, 'stroke-width': 2 }); mono(NX, 324, '0 가짜', { 'font-size': 13.5, fill: MUT }); mono(NX + NW, 324, '진짜 1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    grow(608, 240, 680, 290, 1, MUT, { plain: true });
    el('circle', { cx: Xv(0.5), cy: 300, r: 9, fill: WARN }); mono(Xv(0.5), 282, 'd_fake', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
    if (k === 3) { grow(Xv(0.5) + 12, 350, Xv(0.95), 350, E(u, 0.3, 1.0), ACC); mono(Xv(0.75), 376, 'g_loss: 1 로 속여라', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      grow(Xv(0.5) - 12, 250, Xv(0.05), 250, E(u, 1.0, 1.7), INFO); mono(Xv(0.25), 236, 'd_loss: 0 으로 잡아라', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.3) });
      note(620, 120, '같은 d_fake 를 반대 방향으로 민다', fade(u, 2.0)); sub(780, 160, '더해서 하나로 만들면 상쇄된다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // 각 기울기를 제 모델에만
    if (k >= 4) { el('path', { d: 'M700,360 C600,420 260,420 200,196', fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '7 5', 'marker-end': 'url(#ra-ahb)', opacity: k === 4 ? fade(u, 0.3) : 1 });
      pill(600, 404, 'g_grads → G 변수만', ACC, k === 4 ? fade(u, 0.6) : 1, { fs: 14, fill: PANEL });
      el('path', { d: 'M760,270 C760,200 660,190 610,215', fill: 'none', stroke: INFO, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: k === 4 ? fade(u, 1.0) : 1 });
      mono(790, 210, 'd_grads → D 변수만', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: k === 4 ? fade(u, 1.2) : 1 }); }
    if (k === 4) { note(620, 100, '짝을 잘못 넘기면 생성자가 판별자를 망친다', fade(u, 2.0), { fill: BAD }); return; }
    banner(560, 30, '손실 2 · 옵티마이저 2 · tape 2 → fit 하나로는 불가', pop(u, 0.5)); }

  // ---------- 4. 레시피: 가중·클리핑·train_step ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const LS = [0.5, 0.8, 0.6, 0.4, 0.9, 0.7], SW = [1, 1, 3, 1, 1, 3];
      tx(60, 60, '샘플별 손실 × sample_weight (예시 값)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      LS.forEach((v, i) => { const x = 80 + i * 90, h = 120 * v, w = E(u, 1.0, 1.8), hw = h * lerp(1, SW[i], w) / 3;
        el('rect', { x, y: 220 - h * fade(u, 0.2 + i * 0.1), width: 30, height: h * fade(u, 0.2 + i * 0.1), rx: 3, fill: OFF });
        el('rect', { x: x + 36, y: 220 - hw * 1.0, width: 30, height: hw * w, rx: 3, fill: SW[i] > 1 ? WARN : INFO, opacity: w });
        mono(x + 33, 246, '×' + SW[i], { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: SW[i] > 1 ? WARN : MUT, opacity: fade(u, 0.9) }); });
      mono(80, 300, 'loss = reduce_mean(loss_fn(y, pred, sample_weight=sw))', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      note(80, 350, '희소·어려운 샘플에 더 큰 벌점', fade(u, 2.2), { fill: WARN }); return; }
    if (k === 1) { const ox = 260, oy = 220, S = 40, P = (x, y) => [ox + x * S, oy - y * S];
      el('line', { x1: ox - 30, y1: oy, x2: ox + 200, y2: oy, stroke: GRID }); el('line', { x1: ox, y1: oy + 30, x2: ox, y2: oy - 190, stroke: GRID });
      el('circle', { cx: ox, cy: oy, r: S, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '5 4' }); mono(ox - 8, oy + 56, '노름 1.0', { 'font-size': 14, fill: GOOD, 'font-weight': 700 });
      const sh = E(u, 0.8, 1.6), [ax, ay] = P(lerp(3, 0.6, sh), lerp(4, 0.8, sh));
      el('line', { x1: ox, y1: oy, x2: ax, y2: ay, stroke: sh < 1 ? BAD : GOOD, 'stroke-width': 4, 'marker-end': sh < 1 ? 'url(#ra-ahr)' : 'url(#ra-ah)' });
      mono(P(3, 4)[0] + 10, P(3, 4)[1], 'g = (3, 4) · ‖g‖ = 5', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: 1 - sh * 0.7 });
      mono(ox + 50, oy - 46, '→ (0.6, 0.8)', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7) });
      card(720, 150, 300, 90, { rx: 10, fill: PANEL, stroke: GRID }); mono(590, 140, '작은 g = (0.3, 0.4)', { 'font-size': 14.5, 'font-weight': 700 }); mono(590, 168, '→ (0.3, 0.4) 그대로', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) });
      mono(560, 300, 'grads = [tf.clip_by_norm(g, 1.0) for g in grads]', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) });
      sub(720, 340, '방향은 두고 크기만 1.0 으로 (실행 결과)', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k2~k5: fit 의 고리 안에 train_step 칸
    const ring = (op) => { el('circle', { cx: 480, cy: 220, r: 170, fill: 'none', stroke: MUT, 'stroke-width': 3, 'stroke-dasharray': '8 6', opacity: op });
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + (t * 0.6); el('rect', { x: 480 + Math.cos(a) * 170 - 9, y: 220 + Math.sin(a) * 170 - 9, width: 18, height: 18, rx: 3, fill: INFO, opacity: 0.6 * op }); }
      mono(480, 30, 'model.fit — 데이터 순회 · 콜백 · 검증', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: op }); };
    ring(1);
    card(480, 220, 260, 170, { rx: 12, stroke: ACC, sw: 2.6, fill: PANEL, s: k === 2 ? pop(u, 0.4) : 1 });
    mono(480, 158, 'train_step(self, data)', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    if (k === 2) { mono(480, 200, 'x, y, sw = unpack(data)', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); sub(480, 420 - 8, '루프 전체가 아니라 한 메서드만 바꾼다', fade(u, 1.6), { 'font-size': 15 }); return; }
    mono(480, 194, 'compute_loss(sw)', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.3) : 1 });
    mono(480, 222, 'clip_by_norm(g, 1.0)', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.8) : 1 });
    mono(480, 250, 'self.optimizer.apply', { 'font-size': 14, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 1.2) : 1 });
    if (k === 3) { sub(480, 420 - 8, 'compile 의 loss·optimizer 는 그대로 살아 있다', fade(u, 1.8), { 'font-size': 15 }); return; }
    mono(480, 282, 'return {이름: 값}', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: k === 4 ? fade(u, 0.3) : 1 });
    const pb = k === 4 ? E(u, 0.6, 1.8) : 1; el('rect', { x: 330, y: 404, width: 220, height: 12, rx: 6, fill: PANEL, stroke: GRID }); el('rect', { x: 330, y: 404, width: 220 * pb, height: 12, rx: 6, fill: ACC });
    mono(560, 415, 'loss: …', { 'font-size': 14, fill: ACC, opacity: pb });
    if (k === 4) return;
    const KP = (c.beat.recipe && c.beat.recipe.middle.keep) || [];
    KP.forEach((s, i) => pill(i < 2 ? 140 : 820, i % 2 ? 300 : 140, s, GOOD, pop(u, 0.3 + i * 0.25), { fs: 14 }));
    sub(800, 404, '편의는 fit 이, 스텝 안은 내가', fade(u, 1.4), { 'font-size': 15 }); }

  // ---------- 5. 스펙트럼 ----------
  const STOP = ['model.fit()', 'fit + callbacks', 'train_step 오버라이드', '풀 커스텀 루프'];
  function s5(t, c) { const { k, u } = c, D = c.beat.decision || [], n = D.length;
    const x0 = 120, x1 = 840, X = (i) => lerp(x0, x1, i / 3);
    el('line', { x1: x0, y1: 120, x2: x1, y2: 120, stroke: GRID, 'stroke-width': 8, 'stroke-linecap': 'round' });
    el('line', { x1: x0, y1: 120, x2: lerp(x0, x1, clamp((n - 1) / 3) * (k >= 1 && n > 0 ? 1 : 0)), y2: 120, stroke: ACC, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.7 });
    mono(x0, 80, '통제 낮음 · 코드 짧음', { 'font-size': 14, fill: MUT, opacity: 1 }); mono(x1, 80, '통제 높음 · 코드 김', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    STOP.forEach((s, i) => { const on = k === 0 ? i === 0 || i === 3 : i < n, sc = k >= 1 && k <= 4 && i === n - 1 ? pop(u, 0.2) : 1;
      el('circle', { cx: X(i), cy: 120, r: 13 * sc, fill: on ? ACC : PANEL, stroke: on ? ACC : GRID, 'stroke-width': 3 });
      mono(X(i), 160, s, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: on ? INK : OFF, opacity: (k === 0 && (i === 1 || i === 2)) ? 0.4 : 1 }); });
    // 막대: 코드 길이·제어점 (개념도)
    STOP.forEach((s, i) => { if (!(k === 0 ? i === 0 || i === 3 : i < n)) return; const h = 30 + i * 32, sc = k >= 1 && k <= 4 && i === n - 1 ? E(u, 0.4, 1.2) : 1;
      el('rect', { x: X(i) - 30, y: 300 - h * sc, width: 26, height: h * sc, rx: 3, fill: INFO, opacity: 0.6 }); el('rect', { x: X(i) + 4, y: 300 - h * sc, width: 26, height: h * sc, rx: 3, fill: WARN, opacity: 0.6 }); });
    el('line', { x1: x0 - 50, y1: 300, x2: x1 + 50, y2: 300, stroke: MUT });
    tx(x0 - 50, 326, '파랑 = 코드 길이 · 주황 = 제어점 (개념도)', { 'font-size': 13.5, fill: MUT });
    if (k === 0) { sub(480, 220, '사이에 두 단계가 더 있다', fade(u, 0.8), { 'font-size': 16 }); return; }
    if (k <= 4) { const q = D[n - 1]; card(480, 372, 620, 48, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 0.4) });
      tx(480, 378, `Q${n}. ${q.q}  →  ${q.yes}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); return; }
    // k5: 다음 장 — tf.data
    const P = [['map', 560], ['batch', 680], ['prefetch', 800]];
    P.forEach(([s, x], i) => { card(x, 380, 100, 40, { rx: 20, text: s, fs: 14.5, mono: true, stroke: INFO, s: pop(u, 0.8 + i * 0.3) }); if (i) grow(x - 110, 380, x - 54, 380, E(u, 0.9 + i * 0.3, 1.2 + i * 0.3), INFO); });
    mono(480, 386, '다음: tf.data', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 0.6) });
    banner(300, 214, '필요한 통제만큼만 오른쪽으로', pop(u, 0.3)); }

  const quiz = [
    { q: '같은 모델·데이터·하이퍼파라미터로 두 방식을 돌렸을 때 테스트 정확도가 97.6% 와 97.5% 로 나온 것은 무엇을 뜻하는가?',
      o: ['fit 이 GradientTape 보다 정확한 방식이다', '차이는 난수와 데이터 순서 수준이고 방식의 우열이 아니다', '커스텀 루프는 손실이 더 낮으니 늘 더 낫다'], a: 1,
      why: 'fit 의 한 스텝도 안에서는 tape 로 기울기를 구한다. 그래서 같은 조건이면 학습 손실 곡선이 겹치고, 고르는 기준은 통제력이다.' },
    { q: '방식 1(compile + fit) 에서 학습 과정에 손을 넣을 수 있는 자리는 어디인가?',
      o: ['compile 인자와 정해진 시점에 불리는 콜백', '순전파와 apply 사이의 기울기', '배치마다 손실을 조합하는 줄'], a: 0,
      why: '그 사이의 순전파·손실·역전파·갱신은 fit 안의 블랙박스다. 방식 2 는 모든 줄이 손잡이다.' },
    { q: 'GAN 에서 g_grads 와 d_grads 를 각각 어디에 적용해야 하는가?',
      o: ['둘을 더해 두 모델 모두에 적용한다', '둘 다 판별자 변수에만 적용한다', 'g_grads 는 생성자 변수에만, d_grads 는 판별자 변수에만'], a: 2,
      why: '두 손실은 같은 d_fake 를 반대 방향으로 민다. 짝을 지켜 각 옵티마이저로 각자 변수만 갱신해야 하므로 fit 하나로 담지 못한다.' },
    { q: 'tf.clip_by_norm(g, 1.0) 은 g = (3, 4) 와 g = (0.3, 0.4) 를 각각 어떻게 바꾸는가?',
      o: ['둘 다 노름 1.0 으로 맞춘다', '(0.6, 0.8) 로 줄이고, 작은 쪽은 그대로 둔다', '둘 다 부호를 뒤집는다'], a: 1,
      why: '노름 5 인 벡터는 방향을 두고 크기만 1.0 으로 줄인다. 노름 0.5 인 벡터는 상한 아래라 손대지 않는다.' },
    { q: '데이터 순회·콜백은 fit 에 맡기고 한 스텝의 손실 계산만 바꾸고 싶다면 무엇을 쓰는가?',
      o: ['Model 을 상속해 train_step 만 오버라이드하고 fit 을 쓴다', '풀 커스텀 GradientTape 루프를 짠다', 'fit 에 콜백을 하나 더 넣는다'], a: 0,
      why: '스펙트럼의 세 번째 칸이다. 콜백은 스텝 안을 바꾸지 못하고, 풀 커스텀은 콜백·검증·진행바를 다시 만들어야 한다.' },
  ];

  const summary = [
    '같은 조건이면 fit 과 GradientTape 루프는 사실상 같은 곳으로 수렴한다.',
    'fit 의 개입 자리는 compile 인자와 콜백뿐이고 커스텀 루프는 모든 줄이 개입 자리다.',
    'GAN 은 손실, 옵티마이저, 테이프가 둘씩 필요해 fit 하나로 담지 못한다.',
    '한 스텝만 특수하면 train_step 만 바꾸고 fit 의 편의는 그대로 쓴다.',
  ];
  const review = [
    { q: 'RNN 학습에서 가끔 손실이 튀어 오른다. 콜백·진행바는 그대로 두고 싶을 때 알맞은 방법은?',
      o: ['풀 커스텀 루프로 다시 짠다', 'EarlyStopping 의 patience 를 늘린다', 'train_step 을 오버라이드해 grads 에 clip_by_norm 을 건다'], a: 2,
      why: '기울기 조작은 순전파와 apply 사이에 손을 넣어야 해서 콜백으로는 안 된다. train_step 만 바꾸면 fit 의 편의는 남는다.' },
    { q: 'Keras 3 에서 compiled_loss 를 쓴 train_step 으로 학습했더니 진행바 loss 가 실제 MSE 보다 훨씬 작게 찍힌다. 무엇으로 바꾸는가?',
      o: ['self.compute_loss 를 쓰고 loss 추적기에는 loss 를 넣는다', 'compile(loss=) 를 지운다', '@tf.function 을 뗀다'], a: 0,
      why: 'compiled_loss·compiled_metrics 는 Keras 3 에서 경고가 나는 옛 경로다. compute_loss 와 self.metrics 반복으로 쓰면 진행바가 실제 값을 찍는다.' },
    { q: '팀원이 표준 이미지 분류 과제를 처음부터 GradientTape 루프로 짜려 한다. 먼저 해 줄 말은?',
      o: ['tape 가 fit 보다 정확하니 좋은 선택이다', 'fit 으로 충분한지부터 보자, 결과는 같고 콜백·검증을 공짜로 얻는다', 'GAN 이 아니면 tape 는 쓸 수 없다'], a: 1,
      why: 'MNIST 실행에서도 두 방식의 정확도는 0.1%p 차이였다. 구조가 특수할 때만 오른쪽 끝으로 간다.' },
  ];

  RA.page({ title: 'fit vs GradientTape — 결과는 같고 통제가 다르다', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
