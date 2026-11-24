/* II-1-2 compile 3인방 — 문자열 vs 객체 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행 확인 (TF 2.21 · Keras 3.15.1):
 *  Adam() 기본값 learning_rate 0.001 · beta_1 0.9 · beta_2 0.999 · epsilon 1e-07 · clipnorm None
 *  ExponentialDecay(1e-3, 1000, 0.9): step 1000 → 0.0009, 2000 → 0.00081, 5000 → 0.00059
 *  로짓 [2, 1, -1]: 문자열 loss(from_logits=False) 는 정답이 0 이든 1 이든 0.693, from_logits=True 는 0.349 / 1.349
 *  get_config()["learning_rate"] → 9.999999747378752e-05 (float32 로 저장된 1e-4)
 *  95:5 데이터에서 "전부 음성" 모델: accuracy 0.95, AUC 0.5
 * val_acc 71% / 94% 는 페이지가 든 예시 값이다(데이터가 주어지지 않음). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, lock, axes, scatter, line, hbar, meters, snippet, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO, INFOBG, GOODBG, BADBG, WARNBG } = C;

  // ---------- 1. 문자열의 정체 ----------
  const PARAMS = [['learning_rate', '0.001'], ['beta_1', '0.9'], ['beta_2', '0.999'], ['epsilon', '1e-07']];
  function adamCard(cx, cy, n, o) { o = o || {}; const h = 70 + 44 * 4;
    card(cx, cy, 330, h, { rx: 12, stroke: o.empty ? OFF : ACC, sw: 2.5, dash: o.empty ? '6 5' : null, fill: o.empty ? PANEL : ACCBG, s: o.s });
    if (o.empty) { tx(cx, cy + 8, '?', { 'font-size': 40, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle' }); sub(cx, cy + 44, '아직 객체는 없다', 1, { 'font-weight': 700 }); return; }
    tx(cx - 145, cy - h / 2 + 34, 'Adam  (name="adam")', { 'font-size': 16, 'font-weight': 800, fill: ACC, class: 'mono', opacity: o.s ?? 1 });
    PARAMS.slice(0, n).forEach(([k, v], i) => { const y = cy - h / 2 + 76 + i * 44, s = o.pop ? o.pop(i) : 1;
      card(cx, y, 300, 36, { rx: 8, stroke: GRID, sw: 1.5, s });
      mono(cx - 136, y + 5, k, { 'font-size': 15, opacity: s }); mono(cx + 76, y + 5, v, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: s });
      if (o.locks) lock(cx + 120, y + 2, true, MUT, o.locks(i) * 0.8); }); }
  function getBox(cx, cy, hot) { card(cx, cy, 230, 84, { rx: 12, stroke: hot ? ACC : INK, sw: 2.5, fill: SOFT });
    mono(cx, cy - 6, 'keras.optimizers', { 'font-size': 14.5, 'text-anchor': 'middle' }); mono(cx, cy + 18, '.get("adam")', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { snippet(40, 70, ['model.compile(', '    optimizer="adam",', '    loss="sparse_categorical_crossentropy",', '    metrics=["accuracy"],', ')'], { op: fade(u, 0.2) });
      ['"adam"', '"sparse_categorical_crossentropy"', '["accuracy"]'].forEach((s, i) => { const y = 270 + i * 44; pill(60 + tw(s, 14) / 2 + 13, y, s, MUT, pop(u, 0.8 + i * 0.3), { mono: true });
        tx(110 + tw(s, 14), y + 5, '← 이름표', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0 + i * 0.3) }); });
      adamCard(740, 210, 0, { empty: true, s: pop(u, 1.6) }); return; }
    // k ≥ 1: "adam" → get() → Adam 객체
    pill(110, 120, '"adam"', MUT, 1, { mono: true, fs: 16 });
    getBox(330, 120, k === 1);
    if (k === 1) { fly(150, 120, 330, 120, seg(u, 0.2, 0.9), '"adam"', { mono: true, fill: MUT }); grow(446, 120, 560, 120, E(u, 1.0, 1.4), ACC); }
    else grow(446, 120, 560, 120, 1, ACC);
    const n = [0, 1, 3, 4, 4][k];
    adamCard(740, 210, n, { s: k === 1 ? pop(u, 1.3) : 1, pop: (i) => (k === 2 && i >= 1) || (k === 3 && i === 3) ? pop(u, 0.4 + (i - 1) * 0.3) : k === 1 ? pop(u, 1.6) : 1,
      locks: k >= 3 ? (i) => (k === 3 ? pop(u, 1.4 + i * 0.15) : 1) : null });
    if (k === 2) { card(330, 250, 230, 56, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 1.2) });
      mono(330, 245, 'type(opt) → Adam', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); mono(330, 267, 'lr.numpy() → 0.001', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.5) });
      sub(330, 320, '고르지 않았는데 값이 이미 있다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); }
    if (k === 3) { mono(70, 250, 'compile("adam")', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
      tx(250, 290, '≡', { 'font-size': 30, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      mono(70, 330, 'compile(optimizer=Adam())', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.9) });
      sub(250, 380, '문자열로는 네 값 중 무엇도 못 바꾼다', fade(u, 1.8), { 'font-weight': 700, fill: BAD }); }
    if (k === 4) { [['"sparse_categorical_crossentropy"', 'SparseCategoricalCrossentropy()'], ['"accuracy"', '정확도 지표 객체']].forEach(([a, b], i) => {
        const y = 236 + i * 70, s = pop(u, 0.3 + i * 0.5); pill(40 + tw(a, 13.5) / 2 + 13, y, a, MUT, s, { mono: true, fs: 13.5 });
        grow(56, y + 16, 56, y + 34, E(u, 0.5 + i * 0.5, 0.8 + i * 0.5), ACC);
        mono(72, y + 36, b, { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.5) }); });
      sub(250, 395, 'loss·metrics 도 문자열 = 기본값 객체', fade(u, 1.8), { 'font-weight': 700, fill: INK }); } }

  // ---------- 2. optimizer 손잡이 ----------
  const KNOB = [['learning_rate', '0.001', '1e-4'], ['beta_1', '0.9', '0.9'], ['beta_2', '0.999', '0.98'], ['clipnorm', '(없음)', '1.0']];
  function knobTable(n, hi, u, k) { tx(40, 50, 'Adam(...)', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC });
    tx(220, 50, '기본값', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(320, 50, '지정', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    KNOB.forEach(([a, d, v], i) => { const y = 84 + i * 46, on = i < n, ch = d !== v, s = i === n - 1 && hi ? pop(u, 0.2) : 1;
      card(200, y, 330, 38, { rx: 8, stroke: on && ch ? ACC : GRID, fill: on && ch ? ACCBG : PANEL, sw: on && ch ? 2 : 1.5, s: on ? s : 1, op: on ? 1 : 0.45 });
      mono(48, y + 5, a, { 'font-size': 14.5, opacity: on ? 1 : 0.45 }); mono(220, y + 5, d, { 'font-size': 14.5, fill: MUT, opacity: on ? 1 : 0.45 });
      if (on) mono(320, y + 5, v, { 'font-size': 14.5, 'font-weight': 800, fill: ch ? ACC : INK, opacity: s }); }); }
  function bowlSteps(ax, f, x0, step, n, col, op) { let x = x0; for (let i = 0; i < n; i++) { const nx = x - step * 2 * x;
      el('circle', { cx: ax.X(x), cy: ax.Y(f(x)), r: 5.5, fill: col, opacity: op }); el('line', { x1: ax.X(x), y1: ax.Y(f(x)), x2: ax.X(nx), y2: ax.Y(f(nx)), stroke: col, 'stroke-width': 2, opacity: op }); x = nx; } }
  function s2(t, c) { const { k, u } = c;
    knobTable([1, 3, 4, 4, 4, 4][k], k <= 2, u, k);
    const RX = 430;
    if (k === 0) { const ax = axes(RX + 20, 70, 440, 250, { x: [-1.1, 1.1], y: [0, 1.25] }), f = (x) => x * x, pts = [];
      for (let i = 0; i <= 44; i++) { const x = -1.1 + i * 0.05; pts.push([x, f(x)]); } line(ax, pts, 1, MUT, { sw: 2 });
      bowlSteps(ax, f, -1.0, 0.42, Math.round(lerp(0, 5, E(u, 0.2, 1.4))), OFF, 1);
      bowlSteps(ax, f, -1.0, 0.042, Math.round(lerp(0, 5, E(u, 1.2, 2.4))), ACC, 1);
      tx(RX + 30, 360, '0.001 의 보폭', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) });
      tx(RX + 230, 360, '1e-4 는 1/10 보폭', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      sub(RX + 230, 392, '발산하면 낮추고, 느리면 높인다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { // 기억 길이 ≈ 1/(1-β)
      tx(RX + 20, 70, '이동평균이 기억하는 길이 ≈ 1 / (1 − β)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      const rows = [['beta_1 = 0.9', 10, 10, INK], ['beta_2 = 0.999', 1000, 1000, MUT], ['beta_2 = 0.98', 1000, 50, ACC]], X = (v) => RX + 20 + 470 * Math.log10(v) / 3;
      rows.forEach(([nm, a, b, col], i) => { const y = 120 + i * 80, v = i === 2 ? Math.pow(10, lerp(3, Math.log10(50), E(u, 1.2, 2.2))) : a, s = fade(u, 0.3 + i * 0.4);
        tx(RX + 20, y, nm, { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: col, opacity: s });
        el('rect', { x: RX + 20, y: y + 10, width: 470, height: 18, rx: 4, fill: SOFT, opacity: s });
        el('rect', { x: RX + 20, y: y + 10, width: Math.max(4, X(v) - RX - 20), height: 18, rx: 4, fill: col, opacity: s * 0.7 });
        mono(RX + 490, y, '약 ' + Math.round(v) + ' 스텝', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: s }); });
      sub(RX + 255, 380, '막대 길이는 로그 눈금 · 낮추면 최근 기울기에 민감', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { // clipnorm: 길이만 1.0 으로
      const cx = RX + 200, cy = 220, R1 = 70; el('circle', { cx, cy, r: R1, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
      mono(cx, cy + R1 + 22, '노름 1.0', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700 });
      const ang = -0.6, L = lerp(0, 3, E(u, 0.2, 1.0)), Lc = u > 1.4 ? lerp(3, 1, E(u, 1.4, 2.2)) : L;
      el('line', { x1: cx, y1: cy, x2: cx + Math.cos(ang) * R1 * 3, y2: cy + Math.sin(ang) * R1 * 3, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 5', opacity: u > 1.4 ? 0.5 : 0 });
      grow(cx, cy, cx + Math.cos(ang) * R1 * Lc, cy + Math.sin(ang) * R1 * Lc, 1, u > 1.4 ? ACC : BAD, { sw: 4 });
      tx(cx + Math.cos(ang) * R1 * 3 + 10, cy + Math.sin(ang) * R1 * 3 + 30, '폭주한 기울기 (길이 3, 예시)', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.8) });
      tx(RX + 20, 380, '방향은 그대로, 길이만 1.0 으로 자른다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { // ExponentialDecay
      const ax = axes(RX + 70, 70, 400, 250, { x: [0, 10000], y: [0, 0.001], xt: [0, 5000, 10000], yt: [0, 0.0005, 0.001], xl: 'step', yl: 'learning_rate', grid: true });
      const pts = []; for (let s0 = 0; s0 <= 10000; s0 += 250) pts.push([s0, 0.001 * Math.pow(0.9, s0 / 1000)]); line(ax, pts, E(u, 0.2, 2.0), ACC, { sw: 3 });
      [[1000, '0.0009'], [2000, '0.00081'], [5000, '0.00059']].forEach(([s0, v], i) => { const yy = 0.001 * Math.pow(0.9, s0 / 1000), op = fade(u, 0.5 + s0 / 10000 * 1.5);
        el('circle', { cx: ax.X(s0), cy: ax.Y(yy), r: 6, fill: ACC, opacity: op }); mono(ax.X(s0) + 8, ax.Y(yy) - 12, v, { 'font-size': 14, 'font-weight': 700, opacity: op }); });
      sub(RX + 270, 400, '1000 스텝마다 0.9 배 · 초반엔 크게, 후반엔 작게', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { card(RX + 130, 120, 250, 60, { rx: 10, text: 'opt = Adam(...)', fs: 15, mono: true, stroke: ACC });
      card(RX + 130, 210, 250, 60, { rx: 10, text: 'opt_scheduled', fs: 15, mono: true, stroke: INFO, s: pop(u, 0.3) });
      sub(RX + 130, 252, 'learning_rate = lr_schedule', fade(u, 0.5), { class: 'mono' });
      fly(RX + 130, 150, RX + 330, 300, seg(u, 0.9, 1.8), 'opt', { mono: true });
      card(RX + 330, 330, 300, 50, { rx: 10, text: 'compile(optimizer=opt, loss="mse")', fs: 14, mono: true, stroke: INK, s: pop(u, 0.6) });
      sub(RX + 330, 385, 'loss 는 문자열 그대로 둬도 된다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    // k === 5
    pill(RX + 70, 120, '"adam"', MUT, 1, { mono: true, fs: 16 });
    ['learning_rate', 'beta_2', 'clipnorm', 'schedule'].forEach((s, i) => { const y = 180 + i * 46; tx(RX + 160, y + 5, s, { 'font-size': 15, class: 'mono', opacity: fade(u, 0.2 + i * 0.2) }); cross(RX + 330, y, 10, pop(u, 0.5 + i * 0.25)); });
    banner(RX + 250, 395, '문자열로는 표현할 자리가 없다', pop(u, 1.8)); }

  // ---------- 3. from_logits ----------
  const Z = [2, 1, -1], SM = [0.705, 0.259, 0.035];
  function barsV(x0, base, vals, scale, cols, u0, fmt) { vals.forEach((v, i) => { const x = x0 + i * 70, h = v * scale * u0;
      el('rect', { x, y: h >= 0 ? base - h : base, width: 50, height: Math.abs(h), rx: 4, fill: cols[i] || ACC, opacity: 0.8 });
      mono(x + 25, h >= 0 ? base - h - 8 : base - h + 20, fmt ? fmt(v) : String(v), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: clamp(u0 * 2 - 0.5) });
      mono(x + 25, base + (v < 0 ? -h + 40 : 22), 'class ' + i, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    el('line', { x1: x0 - 10, y1: base, x2: x0 + 200, y2: base, stroke: MUT, 'stroke-width': 1.5 }); }
  function lossCards(x, y, a, b, col, op) { [['정답 0', a], ['정답 1', b]].forEach(([n, v], i) => { const yy = y + i * 64;
      card(x, yy, 170, 52, { rx: 10, stroke: col, sw: 2, op }); tx(x - 70, yy + 6, n, { 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: op });
      mono(x + 70, yy + 7, v, { 'font-size': 18, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: op }); }); }
  function accGauge(x, y, v, col, label, op) { card(x, y, 170, 70, { rx: 10, stroke: col, sw: 2, op }); tx(x, y - 12, label, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op });
    mono(x, y + 20, Math.round(v) + '%', { 'font-size': 24, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(130, 200, 160, 70, { rx: 10, text: 'Dense(3)\nactivation 없음', fs: 14.5, stroke: INK, s: pop(u, 0.2) }); grow(215, 200, 300, 200, E(u, 0.5, 0.9), MUT);
      barsV(340, 250, Z, 60, [ACC, ACC, BAD], E(u, 0.8, 1.8));
      tx(340, 70, '로짓 (예시 출력)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      [['음수가 있다', BAD], ['합이 1 이 아니다 (2)', BAD]].forEach(([s, col], i) => tx(640, 170 + i * 40, s, { 'font-size': 15.5, 'font-weight': 700, fill: col, opacity: fade(u, 1.6 + i * 0.4) }));
      sub(720, 280, '확률이 아니라 날것의 점수', fade(u, 2.3), { 'font-weight': 700, fill: INK }); return; }
    // k ≥ 1: 같은 로짓을 손실이 어떻게 읽나
    barsV(60, 210, Z, 50, [ACC, ACC, BAD], 1); tx(60, 70, 'logits [2, 1, −1]', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
    if (k === 1) { card(470, 120, 340, 56, { rx: 10, text: 'loss="sparse_categorical_crossentropy"\nfrom_logits=False (기본)', fs: 13.5, mono: true, stroke: BAD, s: pop(u, 0.2) });
      grow(268, 150, 298, 150, E(u, 0.3, 0.6), BAD);
      lossCards(440, 230, '0.693', '0.693', BAD, fade(u, 0.8));
      sub(440, 345, '정답이 달라도 손실이 같다', fade(u, 1.4), { 'font-weight': 700, fill: BAD });
      accGauge(800, 200, tween(null, 71, u), BAD, 'val_acc (예시)', fade(u, 1.8)); sub(800, 270, '에러 없이 조용히', fade(u, 2.2), { 'font-weight': 700 }); return; }
    if (k === 2 || k === 3) { const B = k === 3;
      card(400, 110, 250, 56, { rx: 10, text: B ? 'Dense(3, activation="softmax")\n+ 문자열 loss' : 'SparseCategoricalCrossentropy\n(from_logits=True)', fs: 13.5, mono: true, stroke: GOOD, s: k === 2 || k === 3 ? pop(u, 0.2) : 1 });
      grow(270, 150, 300, 150, E(u, 0.3, 0.6), GOOD);
      sub(400, 160, B ? '모델 안에서 softmax' : '손실 안에서 softmax', fade(u, 0.5), { 'font-weight': 700, fill: GOOD });
      // softmax 확률 막대
      SM.forEach((p, i) => { const x = 300 + i * 70, h = 120 * p * E(u, 0.6, 1.4); el('rect', { x, y: 330 - h, width: 50, height: h, rx: 4, fill: GOOD, opacity: 0.75 });
        mono(x + 25, 330 - h - 8, p.toFixed(3), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); });
      el('line', { x1: 290, y1: 330, x2: 510, y2: 330, stroke: MUT, 'stroke-width': 1.5 }); sub(400, 352, '확률 · 합 1', fade(u, 1.2));
      lossCards(650, 200, '0.349', B ? '1.349' : '1.349', GOOD, fade(u, 1.4));
      if (!B) { accGauge(860, 200, tween(71, 94, u), GOOD, 'val_acc (예시)', fade(u, 1.8)); sub(860, 270, '수치적으로 더 안정 · 권장', fade(u, 2.2), { 'font-weight': 700, fill: GOOD }); }
      else { const rows = [['softmax 있음', 'False', true], ['로짓', 'True', true], ['로짓', 'False', false]];
        rows.forEach(([a, b, ok], i) => { const y = 300 + i * 32, op = fade(u, 1.8 + i * 0.2); tx(752, y, a, { 'font-size': 14, opacity: op }); mono(900, y, b, { 'font-size': 14, opacity: op, 'text-anchor': 'end' });
          if (ok) check(925, y - 5, 8, op); else cross(925, y - 5, 7, op); }); tx(752, 272, '마지막 층 ↔ from_logits', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.7) }); }
      return; }
    // k === 4: 커스텀 손실 함수
    card(560, 120, 420, 52, { rx: 10, text: 'def weighted_loss(y_true, y_pred):', fs: 14.5, mono: true, stroke: INK, s: pop(u, 0.2) });
    [['y_true', 380], ['y_pred (로짓)', 560]].forEach(([s, x], i) => pill(x, 220, s, INFO, pop(u, 0.5 + i * 0.2), { mono: true }));
    card(560, 290, 420, 52, { rx: 10, text: 'crossentropy(..., from_logits=True) × 1.5', fs: 14, mono: true, stroke: GOOD, s: pop(u, 1.0) });
    grow(470, 236, 520, 262, E(u, 0.9, 1.2), MUT); grow(600, 236, 600, 262, E(u, 0.9, 1.2), MUT);
    grow(560, 318, 560, 352, E(u, 1.4, 1.7), ACC); pill(560, 375, '스칼라 하나', ACC, pop(u, 1.8));
    sub(140, 330, '로짓 모델이면 여기도', fade(u, 2.1), { 'font-weight': 700, fill: INK }); sub(140, 352, 'from_logits=True', fade(u, 2.2), { 'font-weight': 700, fill: GOOD, class: 'mono' }); }

  // ---------- 4. 3인방 전부 객체로 ----------
  const TRIO = [['optimizer', '"adam"', 'Adam(learning_rate=1e-4, clipnorm=1.0)'], ['loss', '"binary_crossentropy"', 'BinaryCrossentropy(from_logits=False)'], ['metrics', '["accuracy"]', '[AUC(), Precision(thresholds=0.7)]']];
  function s4(t, c) { const { k, u } = c;
    TRIO.forEach(([n, a, b], i) => { const y = 60 + i * 58, up = k >= i + 1, isNew = k === i + 1;
      lbl(70, y + 6, n, 1, { 'text-anchor': 'start' });
      card(225, y, 170, 40, { rx: 8, text: a, fs: 13.5, mono: true, stroke: up ? OFF : MUT, color: up ? OFF : INK });
      if (up) { grow(315, y, 360, y, isNew ? E(u, 0.2, 0.6) : 1, ACC);
        card(620, y, 500, 40, { rx: 8, text: b, fs: 14, mono: true, stroke: ACC, fill: ACCBG, s: isNew ? pop(u, 0.6) : 1 }); }
      else card(620, y, 500, 40, { rx: 8, stroke: OFF, dash: '5 5', text: '손잡이 없음', fs: 13.5, color: OFF }); });
    const Y0 = 240;
    if (k === 0) { sub(480, Y0 + 40, '읽기는 가장 쉽고, 빠른 검증 단계에선 이게 정답이다', fade(u, 0.8), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    if (k === 1) { sub(480, Y0 + 40, '학습률과 클리핑이 코드에 남는다', fade(u, 1.0), { 'font-weight': 700, fill: ACC, 'font-size': 15 }); return; }
    if (k === 2) { tx(60, Y0 + 40, '이 예: 양성이 드문 이진 분류, 마지막 층 Dense(1, sigmoid)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(60, Y0 + 72, 'sigmoid 확률 출력 ↔ from_logits=False 의 짝이 코드에 보인다', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.3) }); return; }
    if (k === 3) { // 임계값 0.7 로 양성 판정
      const ax = axes(120, Y0 + 30, 720, 60, { x: [0, 1], y: [0, 1], xt: [0, 0.5, 0.7, 1] });
      const P = [0.05, 0.12, 0.2, 0.28, 0.33, 0.41, 0.47, 0.55, 0.62, 0.66, 0.74, 0.81, 0.9], pos = [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1];
      const th = tween(0.5, 0.7, u, 1.4); el('rect', { x: ax.X(th), y: Y0 + 22, width: ax.X(1) - ax.X(th), height: 70, fill: ACCBG });
      el('line', { x1: ax.X(th), y1: Y0 + 14, x2: ax.X(th), y2: Y0 + 96, stroke: ACC, 'stroke-width': 3 });
      mono(ax.X(th), Y0 + 8, 'thresholds=' + th.toFixed(2), { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      P.forEach((p, i) => { const cx = ax.X(p), cy = Y0 + 62; if (pos[i]) el('circle', { cx, cy, r: 8, fill: BAD }); else el('circle', { cx, cy, r: 8, fill: PANEL, stroke: MUT, 'stroke-width': 2 }); });
      tx(120, 410, '● 실제 양성  ○ 실제 음성 (예시 점) · 선 오른쪽만 양성으로 센다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); return; }
    // k === 4: 95:5 에서 accuracy 의 착시
    for (let i = 0; i < 100; i++) { const r = Math.floor(i / 20), cc = i % 20, isPos = i >= 95, s = clamp(E(u, 0.1, 1.0) * 100 - i);
      el('rect', { x: 60 + cc * 22, y: Y0 + r * 22, width: 18, height: 18, rx: 3, fill: isPos ? BAD : SOFT, stroke: isPos ? BAD : GRID, opacity: s }); }
    tx(60, Y0 - 12 + 0, '음성 95 · 양성 5', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) });
    tx(560, Y0 + 14, '"전부 음성" 이라고만 답하는 모델', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
    meters(560, Y0 + 30, 360, [{ name: 'accuracy', val: '0.95', good: true }, { name: 'AUC', val: '0.5', hot: true }], { h: 62 });
    tx(560, Y0 + 124, '양성 5개를 하나도 못 찾는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }

  // ---------- 5. 문자열로 시작해 객체로 ----------
  const EVO = ['① 문자열로 시작', '② 막히는 항목 발견', '③ 그 인자만 객체로', '④ get_config 로 확인'];
  function s5(t, c) { const { k, u } = c, nE = [1, 3, 4, 4, 4][k];
    EVO.forEach((s, i) => { const x = 40 + i * 225, on = i < nE, sc = on && i >= [0, 1, 3, 4, 4][k] ? pop(u, 0.2 + (i - [0, 1, 3, 4, 4][k]) * 0.4) : 1;
      card(x + 100, 46, 200, 40, { rx: 20, text: s, fs: 14.5, stroke: on ? ACC : OFF, color: on ? INK : OFF, fill: on ? ACCBG : PANEL, s: on ? sc : 1, dash: on ? null : '4 4' });
      if (i) grow(x - 22, 46, x - 2, 46, on ? 1 : 0, MUT); });
    if (k === 0) { snippet(60, 110, ['model.compile(optimizer="adam", loss="mse")'], { op: fade(u, 0.3) });
      sub(480, 230, '짧게 쓰고 빨리 돌린다 · 기본값으로 대개 충분하다', fade(u, 1.0), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    if (k === 1) { const ax = axes(80, 130, 300, 180, { x: [0, 10], y: [0, 1], xl: 'step', yl: 'loss' }), pts = [];
      for (let i = 0; i <= 10; i++) pts.push([i, 0.35 + 0.3 * Math.sin(i * 1.3) * (i / 10) + i * 0.04]); line(ax, pts, E(u, 0.2, 1.2), BAD, { sw: 3 });
      tx(240, 360, '발산 (그림은 모양만)', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      snippet(450, 140, ['model.compile(', '    optimizer=Adam(learning_rate=1e-4),', '    loss="mse",   # 그대로', ')'], { op: fade(u, 1.3) });
      sub(660, 300, 'optimizer 만 올리고 loss 는 문자열로 둔다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { terminal(60, 110, 840, 170, ['>>> cfg = model.optimizer.get_config()', '>>> cfg["learning_rate"]', ['9.999999747378752e-05', 'var(--term)'], '>>> cfg["name"]', ["'adam'", 'var(--term)']], lerp(0, 5, E(u, 0.2, 2.0)), { title: 'python', fs: 15 });
      sub(480, 320, '1e-4 가 float32 로 저장돼 조금 다르게 찍힌다', fade(u, 2.2), { 'font-weight': 700, fill: INK, 'font-size': 15 });
      sub(480, 346, '어떤 표기로 시작했든 지금 설정을 꺼내 볼 수 있다', fade(u, 2.4)); return; }
    if (k === 3) { const rows = [['프로토타입 · 빠른 검증', '문자열', MUT], ['하이퍼파라미터 튜닝', '객체', ACC], ['재현 · 코드 리뷰', '객체', ACC], ['프로덕션 배포', '객체', ACC]];
      rows.forEach(([a, b, col], i) => { const y = 120 + i * 62, s = pop(u, 0.2 + i * 0.35);
        card(330, y, 520, 48, { rx: 10, stroke: GRID, sw: 1.5, s }); tx(90, y + 6, a, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) });
        pill(530, y, b, col, s, { fs: 14.5 }); });
      sub(780, 220, '우열이 아니라', fade(u, 1.8), { 'font-weight': 700, fill: INK, 'font-size': 15 }); sub(780, 244, '어느 단계인가', fade(u, 1.9), { 'font-weight': 700, fill: ACC, 'font-size': 15 }); return; }
    // k === 4: 다음은 함수형 API
    [['image', 140, 160], ['text', 140, 280]].forEach(([s, x, y], i) => card(x, y, 110, 40, { rx: 8, text: s, fs: 15, mono: true, stroke: INFO, s: pop(u, 0.2 + i * 0.2) }));
    card(380, 220, 140, 40, { rx: 8, text: 'concatenate', fs: 14.5, stroke: INK, s: pop(u, 0.7) }); grow(197, 165, 308, 210, E(u, 0.6, 0.9), MUT); grow(197, 275, 308, 230, E(u, 0.6, 0.9), MUT);
    [['price', 160], ['category', 280]].forEach(([s, y], i) => { card(620, y, 130, 40, { rx: 8, text: s, fs: 15, mono: true, stroke: ACC, s: pop(u, 1.1 + i * 0.2) }); grow(452, 220, 552, y, E(u, 1.0 + i * 0.2, 1.3 + i * 0.2), ACC); });
    banner(800, 360, '다음 장 II-2-1 · 함수형 API', pop(u, 1.8)); }

  const quiz = [
    { q: 'compile(optimizer="adam")에서 문자열 "adam" 이 실제로 하는 일은 무엇인가?',
      o: ['기본값 Adam 객체를 만들 클래스를 지목한다', '이미 학습된 옵티마이저를 불러온다', '학습률을 자동으로 고른다'], a: 0,
      why: 'Keras가 keras.optimizers.get("adam")으로 Adam()을 새로 만든다. learning_rate 0.001 같은 값은 전부 기본값으로 정해진다.' },
    { q: 'beta_2를 0.999에서 0.98로 낮추면 무엇이 달라지는가?',
      o: ['한 스텝의 보폭이 1/10이 된다', '기울기 크기 이동평균이 기억하는 길이가 약 1000 스텝에서 약 50 스텝으로 줄어 최근 값에 민감해진다', '그래디언트가 노름 1.0으로 잘린다'], a: 1,
      why: '이동평균의 기억 길이는 대략 1/(1−β)다. 0.999면 약 1000 스텝, 0.98이면 약 50 스텝이다.' },
    { q: 'softmax 없는 Dense(3) 출력에 문자열 손실(from_logits=False)을 쓰면 어떤 일이 생기는가?',
      o: ['곧바로 에러가 나서 학습이 멈춘다', 'Keras가 알아서 softmax를 붙여 준다', '에러 없이 돌지만 손실이 잘못 계산돼 정확도가 낮게 나온다'], a: 2,
      why: '로짓 [2, 1, −1]에서 이 손실은 정답이 0 이든 1 이든 0.693으로 같았다. 정답을 구분하지 못하는 손실로 학습하는 셈이다.' },
    { q: '양성이 5%뿐인 데이터에서 accuracy만 보면 위험한 이유는 무엇인가?',
      o: ['전부 음성이라고 답해도 accuracy가 0.95로 높게 나온다', 'accuracy는 학습률을 바꾸기 때문이다', 'accuracy는 문자열로만 쓸 수 있다'], a: 0,
      why: '"전부 음성" 모델은 accuracy 0.95 지만 AUC는 0.5이고 양성을 하나도 못 찾는다. 그래서 AUC·Precision(thresholds=0.7) 같은 지표를 객체로 지정한다.' },
    { q: '프로토타입에서 학습이 발산했을 때 가장 실무적인 대응은 무엇인가?',
      o: ['3인방을 전부 객체로 다시 쓴다', 'optimizer만 Adam(learning_rate=1e-4) 객체로 올리고 나머지는 문자열로 둔다', 'loss를 커스텀 함수로 바꾼다'], a: 1,
      why: '막힌 항목만 객체로 승격하면 된다. 바꾼 뒤 get_config()로 learning_rate가 실제로 1e-4 인지 확인한다.' },
  ];

  const summary = [
    '문자열 "adam" 은 기본값 Adam 객체를 만들라는 줄임말이라 학습률 0.001을 바꿀 수 없다.',
    '객체로 넘기면 학습률, beta_2, clipnorm, 학습률 스케줄까지 직접 정할 수 있다.',
    '로짓 출력에 from_logits=False 손실을 쓰면 에러 없이 손실이 틀려 정확도만 떨어진다.',
    '문자열로 시작해 막히는 항목만 객체로 바꾸고 get_config()로 실제 값을 확인한다.',
  ];
  const review = [
    { q: '마지막 층에서 softmax를 지웠더니 에러는 없는데 검증 정확도가 크게 떨어졌다. 먼저 의심할 것은?',
      o: ['학습률이 너무 작다', '손실이 아직 from_logits=False라 로짓을 확률로 읽고 있다', '배치 크기가 너무 크다'], a: 1,
      why: '마지막 층과 from_logits가 짝이 맞지 않으면 조용히 틀린다. 로짓을 그대로 두려면 손실 객체에 from_logits=True를 켠다.' },
    { q: '문자열 "adam" 으로 학습하다 loss가 발산했다. 코드에서 가장 먼저 바꿀 곳은?',
      o: ['metrics에 AUC를 추가한다', 'loss를 객체로 바꾼다', 'optimizer를 Adam(learning_rate=1e-4) 객체로 바꾼다'], a: 2,
      why: '발산은 보폭이 큰 탓인 경우가 많다. 문자열로는 0.001을 바꿀 수 없으니 optimizer만 객체로 올려 학습률을 낮춘다.' },
    { q: '팀원이 compile에 문자열만 썼는데, 지금 학습률이 정말 0.001 인지 확인하고 싶다. 어떻게 하나?',
      o: ['model.optimizer.get_config()로 learning_rate를 꺼내 본다', '코드를 객체 표기로 전부 다시 쓴다', 'fit을 다시 돌려 진행바를 본다'], a: 0,
      why: '어떤 표기로 만들었든 옵티마이저는 객체다. get_config()가 실제 설정을 딕셔너리로 돌려준다.' },
  ];

  R.page({ title: 'compile 3인방 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
