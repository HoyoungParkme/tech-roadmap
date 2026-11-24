/* II-1-1 Keras Sequential · compile · fit — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 venv(TF 2.21 · Keras 3.15.1, keras.utils.set_random_seed(0))에서 페이지 코드를 그대로 돌린 값이다.
 *  ① fit(epochs=5): loss 0.2507 0.1108 0.0754 0.0549 0.0404 · accuracy 0.9298 0.9677 0.9783 0.9840 0.9891
 *  ② validation_split=0.2: loss 0.2821 0.1269 0.0856 0.0624 0.0469 · val_loss 0.1656 0.1265 0.1163 0.1102 0.1022 (1500 배치/에폭)
 *  ③ evaluate(test) 0.0803 / 0.9745 · predict(x_test[0]) 7번 자리 0.99994 · 100장 중 99장 정답
 *  ④ summary 0 / 100,480 / 1,290 / 101,770
 * 손글씨 그림은 x_train[0](정답 5)·x_test[0](정답 7)을 14×14 로 줄인 밝기(0~9)다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, axes, scatter, line, hbar, lock, meters, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO, INFOBG, GOODBG, BADBG, WARNBG } = C;

  // ---------- 데이터 ----------
  const D5 = '0000000000000000000000000000000000002143000000579995620000006893600000000002700000000000007410000000000007810000000000005900000000001698000000000599500000002699500000000034310000000000000000000000';
  const D7 = '0000000000000000000000000000000000000000000002300000000000066888886000000000011550000000000019100000000000640000000000018000000000000740000000000047000000000001910000000000069000000000000320000000';
  const ACC1 = [0.930, 0.968, 0.978, 0.984, 0.989], LOSS1 = [0.251, 0.111, 0.075, 0.055, 0.040];
  const TL = [0.282, 0.127, 0.086, 0.062, 0.047], VL = [0.166, 0.127, 0.116, 0.110, 0.102];
  const fmt = (v) => Math.round(v).toLocaleString('en-US');

  // 14×14 손글씨: 칸 밝기를 잉크 진하기로. o.rows 만큼 위에서부터 보임
  function digit(x, y, cs, str, o) { o = o || {}; const rows = o.rows ?? 14;
    el('rect', { x: x - 3, y: y - 3, width: cs * 14 + 6, height: cs * 14 + 6, rx: 4, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: o.op ?? 1 });
    for (let r = 0; r < Math.min(14, Math.ceil(rows)); r++) for (let c = 0; c < 14; c++) { const v = +str[r * 14 + c]; if (!v) continue;
      el('rect', { x: x + c * cs, y: y + r * cs, width: cs - 0.6, height: cs - 0.6, fill: o.col || INK, opacity: (o.op ?? 1) * (0.15 + 0.85 * v / 9) * (r < Math.floor(rows) ? 1 : rows % 1) }); } }
  // 왼쪽 "5줄" 목록: on 개수만큼 채움, hi 는 지금 줄
  const FIVE = ['load_data()', 'x / 255.0', 'Sequential([...])', 'compile(...)', 'fit(x, y, epochs=5)'];
  function fiveLines(on, hi, u, newFrom) {
    tx(36, 44, '이 장의 5줄', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    FIVE.forEach((s, i) => { const y = 66 + i * 50, isOn = i < on, s0 = i >= newFrom && i < on ? pop(u, 0.2 + (i - newFrom) * 0.3) : 1;
      card(178, y + 16, 284, 40, { rx: 8, stroke: i === hi ? ACC : isOn ? GRID : OFF, fill: i === hi ? ACCBG : PANEL, sw: i === hi ? 2.2 : 1.5, dash: isOn ? null : '4 4', s: isOn ? s0 : 1 });
      mono(48, y + 21, String(i + 1), { 'font-size': 14, 'font-weight': 800, fill: isOn ? ACC : OFF });
      if (isOn) mono(70, y + 21, s, { 'font-size': 14, fill: INK, opacity: s0 }); }); }

  // ---------- 1. 5줄의 전력 ----------
  // 장면 공통 자리: 손글씨(380,100) · Flatten 기둥(560) · Dense128(700) · Dense10(840)
  const GX = 372, GY = 96, GC = 12, FX = 560, FY = 62, FH = 280;
  const H128 = (i) => 74 + i * 17, H10 = (i) => 84 + i * 26;
  function flattenCol(u0, op) { // 196칸이 한 줄 기둥으로 (u0: 0→1 진행)
    for (let r = 0; r < 14; r++) { const t = E(u0, r * 0.045, r * 0.045 + 0.4);
      for (let c = 0; c < 14; c++) { const v = +D5[r * 14 + c], ax = GX + c * GC, ay = GY + r * GC, bx = FX - 7, by = FY + (r * 14 + c) * (FH / 196);
        el('rect', { x: lerp(ax, bx, t), y: lerp(ay, by, t), width: lerp(GC - 0.6, 14, t), height: lerp(GC - 0.6, FH / 196 + 0.2, t), fill: v ? INK : GRID, opacity: (op ?? 1) * (v ? 0.15 + 0.85 * v / 9 : 0.35) }); } } }
  function net(o) { o = o || {}; const g1 = o.g1 ?? 1, g2 = o.g2 ?? 1, n1 = o.n1 ?? 1, n2 = o.n2 ?? 1, op = o.op ?? 1;
    for (let i = 0; i < 16; i++) { const s = clamp(n1 * 16 - i); if (s <= 0) continue;
      [0.1, 0.35, 0.6, 0.9].forEach((f) => { if (g1 > 0) el('line', { x1: FX + 8, y1: FY + FH * f, x2: lerp(FX + 8, 692, g1), y2: lerp(FY + FH * f, H128(i), g1), stroke: GRID, 'stroke-width': 1, opacity: op * 0.8 }); });
      el('circle', { cx: 700, cy: H128(i), r: 7 * s, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: op }); }
    for (let j = 0; j < 10; j++) { const s = clamp(n2 * 10 - j); if (s <= 0) continue;
      if (g2 > 0) [0, 5, 10, 15].forEach((i) => el('line', { x1: 708, y1: H128(i), x2: lerp(708, 832, g2), y2: lerp(H128(i), H10(j), g2), stroke: GRID, 'stroke-width': 1, opacity: op * 0.8 }));
      el('circle', { cx: 840, cy: H10(j), r: 9 * s, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: op });
      mono(858, H10(j) + 5, String(j), { 'font-size': 13.5, fill: MUT, opacity: op * s }); } }
  function s1(t, c) { const { k, u } = c;
    fiveLines([2, 3, 3, 4, 5, 5][k], [1, 2, 2, 3, 4, -1][k], u, [0, 2, 3, 3, 4, 9][k]);
    if (k === 0) { // MNIST 한 장 + 6만 장 더미 + 0~255 → 0~1
      [3, 2, 1].forEach((d) => el('rect', { x: 430 + d * 8, y: 76 - d * 8, width: 14 * 15 + 6, height: 14 * 15 + 6, rx: 4, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.2 + (3 - d) * 0.15) }));
      digit(433, 79, 15, D5, { rows: lerp(0, 14, E(u, 0.2, 1.2)) });
      lbl(538, 318, 'x_train[0] · 정답 5', fade(u, 0.8));
      mono(538, 344, '(60000, 28, 28)', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
      const v = lerp(255, 1, E(u, 1.4, 2.4));
      tx(760, 150, '픽셀 범위', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(760, 184, '0 ~ ' + (v > 1.5 ? Math.round(v) : '1.0'), { 'font-size': 22, 'font-weight': 800, fill: v > 1.5 ? INK : GOOD, opacity: fade(u, 1.2) });
      sub(805, 212, '÷ 255.0', fade(u, 1.5), { 'font-weight': 700, fill: GOOD });
      return; }
    // k ≥ 1: 손글씨 → Flatten 기둥 (k5 는 곡선만)
    if (k === 5) { s1curve(u); return; }
    digit(GX, GY, GC, D5, { op: k === 1 ? 1 - 0.55 * E(u, 0.2, 1.8) : 0.45 });
    flattenCol(k === 1 ? E(u, 0.2, 2.2) : 1);
    lbl(GX + 84, GY + 196, '(28, 28)', 1, { class: 'mono', fill: MUT });
    lbl(FX, FY + FH + 26, 'Flatten', k === 1 ? fade(u, 1.6) : 1);
    mono(FX, FY + FH + 48, '(784,)', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.9) : 1 });
    if (k === 1) { sub(FX + 90, 120, '값은 그대로,', fade(u, 2.0), { 'font-weight': 700 }); sub(FX + 90, 140, '모양만 편다', fade(u, 2.1), { 'font-weight': 700 }); return; }
    const op = k === 5 ? 1 - 0.75 * E(u, 0.1, 0.8) : 1;
    net({ g1: k === 2 ? E(u, 0.2, 1.0) : 1, n1: k === 2 ? E(u, 0.2, 1.0) : 1, g2: k === 2 ? E(u, 1.0, 1.8) : 1, n2: k === 2 ? E(u, 1.0, 1.8) : 1, op });
    if (k <= 4) { lbl(700, 380, 'Dense(128) relu', k === 2 ? fade(u, 0.8) : 1); lbl(840, 380, 'Dense(10) softmax', k === 2 ? fade(u, 1.6) : 1);
      mono(700, 402, '(128,)', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.0) : 1 });
      mono(840, 402, '(10,)', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.8) : 1 }); }
    if (k === 3) { // 문자열 세 개가 날아와 장비가 된다
      const tags = [['"adam"', 'Adam()'], ['"sparse_categorical_crossentropy"', '손실 객체'], ['["accuracy"]', '지표 객체']];
      tags.forEach(([a, b], i) => { const t0 = 0.2 + i * 0.5, y = 30 + i * 0;
        fly(178, 216, [452, 610, 780][i], 30, seg(u, t0, t0 + 0.7), a, { mono: true });
        if (u > t0 + 0.7) pill([452, 610, 780][i], 30, b, ACC, pop(u, t0 + 0.7), { fs: 14 }); });
      return; }
    if (k >= 3) [['Adam()', 452], ['손실 객체', 610], ['지표 객체', 780]].forEach(([b, x]) => pill(x, 30, b, ACC, 1, { fs: 14, op: op }));
    if (k === 4) { // fit: 진행바와 흐르는 점
      const ep = Math.min(5, 1 + Math.floor(E(u, 0.2, 2.6) * 5 - 1e-6)), f = (E(u, 0.2, 2.6) * 5) % 1 || (u > 2.6 ? 1 : 0);
      for (let i = 0; i < 4; i++) { const ph = (t * 0.9 + i / 4) % 1; dot([[FX + 10, FY + 60 + i * 50], [700, H128(i * 4)], [840, H10(i * 2 + 1)]], ph, ACC, 5); }
      mono(372, 326, `Epoch ${ep}/5`, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      el('rect', { x: 372, y: 336, width: 150, height: 12, rx: 6, fill: SOFT });
      el('rect', { x: 372, y: 336, width: 150 * (u > 2.6 ? 1 : f), height: 12, rx: 6, fill: ACC });
      mono(372, 372, `${fmt(1875 * (u > 2.6 ? 1 : f))}/1875`, { 'font-size': 14, fill: MUT });
      return; }
  }
  function s1curve(u) { { // 에폭별 accuracy 와 loss
      const ax = axes(420, 80, 380, 260, { x: [1, 5], y: [0.92, 1.0], xt: [1, 2, 3, 4, 5], yt: [0.92, 0.96, 1.0], xl: 'epoch', yl: 'accuracy', grid: true });
      const pts = ACC1.map((v, i) => [i + 1, v]); line(ax, pts, E(u, 0.3, 2.0), GOOD, { sw: 3 }); scatter(ax, pts.map((p) => [...p, GOOD]), { u: E(u, 0.3, 2.0) });
      mono(ax.X(1) + 10, ax.Y(ACC1[0]) + 24, ACC1[0].toFixed(3), { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5) });
      mono(ax.X(5) - 10, ax.Y(ACC1[4]) + 26, ACC1[4].toFixed(3), { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      const lo = tween(LOSS1[0], LOSS1[4], u, 1.8);
      card(880, 170, 120, 64, { rx: 10, stroke: GRID, sw: 1.5, op: fade(u, 0.4) });
      tx(880, 160, 'loss', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      mono(880, 186, lo.toFixed(3), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) });
      sub(610, 404, '첫 에폭부터 93%, 5에폭이면 98.9%', fade(u, 2.2), { 'font-weight': 700, fill: INK }); } }

  // ---------- 2. fit 이 대신 해 주는 일 ----------
  function dataBar(k, u) { // 6만 장 막대: 배치로 자르고, 섞고, 끝 20%를 검증으로
    const x0 = 40, y0 = 58, w = 420, h = 30, nb = 30, valOn = k >= 2, sp = valOn ? (k === 2 ? E(u, 0.3, 1.3) : 1) : 0;
    const trW = valOn ? w * 0.8 : w, perm = [7, 2, 19, 11, 0, 23, 5, 14, 28, 9, 17, 3, 25, 12, 21, 1, 26, 8, 15, 29, 4, 18, 10, 27, 6, 22, 13, 24, 16, 20];
    tx(x0, y0 - 12, valOn ? '훈련 48,000' : 'x_train 60,000', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const n = valOn ? 24 : nb, bw = (valOn ? w * 0.8 : w) / n;
    for (let i = 0; i < n; i++) { const sh = k >= 1 ? (k === 1 ? E(u, 1.2, 2.2) : 1) : 0, j = perm.filter((p) => p < n).indexOf(i);
      const xx = x0 + lerp(i, j < 0 ? i : j, sh) * bw * (valOn ? 1 : 1);
      el('rect', { x: xx + 1, y: y0, width: bw - 2, height: h, rx: 3, fill: k >= 1 ? (i % 3 === 0 ? ACC : i % 3 === 1 ? INFO : WARN) : OFF, opacity: k >= 1 ? 0.55 : 0.7 }); }
    if (valOn) { const vx = x0 + w * 0.8 + 12 * sp;
      el('rect', { x: vx, y: y0, width: w * 0.2 - 2, height: h, rx: 3, fill: GOOD, opacity: 0.25 + 0.5 * sp, stroke: GOOD, 'stroke-width': 1.5 });
      tx(vx + w * 0.1, y0 - 12, '검증 12,000', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: sp }); }
    if (k >= 1) mono(x0, y0 + h + 22, 'batch_size=32 → 1,500 배치/에폭', { 'font-size': 14, fill: INK, opacity: k === 1 ? fade(u, 0.4) : 1 });
    if (k === 1) sub(x0 + 330, y0 + h + 22, '에폭마다 섞기', fade(u, 1.4), { 'font-weight': 700, fill: WARN }); }
  function loopRing(cx, cy, r, t, op) { const names = ['순전파', '손실', '역전파', '갱신'];
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3, opacity: op });
    names.forEach((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      card(x, y, tw(s, 14.5) + 22, 30, { rx: 15, text: s, fs: 14.5, stroke: i === 2 ? BAD : ACC, color: i === 2 ? BAD : INK, op }); });
    const a = -Math.PI / 2 + ((t * 0.7) % 1) * Math.PI * 2; el('circle', { cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, r: 6, fill: ACC, opacity: op }); }
  function s2(t, c) { const { k, u } = c;
    dataBar(k, u);
    const nT = [2, 3, 3, 4, 5, 5][k], nV = [0, 0, 3, 4, 5, 5][k], pT = [0, 2, 3, 3, 4, 5][k], pV = [0, 0, 0, 3, 4, 5][k];
    const ax = axes(560, 50, 360, 270, { x: [1, 5], y: [0, 0.3], xt: [1, 2, 3, 4, 5], yt: [0, 0.1, 0.2, 0.3], xl: 'epoch', yl: 'loss', grid: true });
    const gT = pT + (nT - pT) * E(u, 0.3, 1.6), gV = pV + (nV - pV) * E(u, 0.6, 1.9);
    const T = TL.map((v, i) => [i + 1, v]), V = VL.map((v, i) => [i + 1, v]);
    if (gT > 0) { line(ax, T, gT >= 1 ? (gT - 1) / 4 : 0, ACC, { sw: 3 }); scatter(ax, T.slice(0, Math.ceil(gT)).map((p) => [...p, ACC]), { u: 1 }); }
    if (gV > 0) { line(ax, V, gV >= 1 ? (gV - 1) / 4 : 0, GOOD, { sw: 3, dash: '7 5' }); scatter(ax, V.slice(0, Math.ceil(gV)).map((p) => [...p, GOOD]), { u: 1, hollow: true }); }
    tx(ax.X(5) - 4, 70, 'train', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'end' });
    if (nV) tx(ax.X(5) - 4, 92, 'val (점선)', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: k === 2 ? fade(u, 0.6) : 1 });
    if (k <= 2) { loopRing(250, 268, 82, t, 1); mono(250, 274, 'epochs=5', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT }); }
    if (k === 0) { sub(250, 394, '이 고리 전체가 fit 한 줄 안에서 돈다', fade(u, 1.2), { 'font-weight': 700, fill: INK }); }
    if (k >= 3) { // History 딕셔너리
      const keys = ['accuracy', 'loss', 'val_accuracy', 'val_loss'];
      zone(40, 150, 430, 250, 'history.history', { fill: SOFT });
      keys.forEach((s, i) => { const y = 192 + i * 30, sc = k === 3 ? pop(u, 0.3 + i * 0.25) : 1, hot = (k >= 4 && s === 'loss') || (k === 5 && s === 'val_loss');
        card(130, y, 160, 26, { rx: 6, text: `"${s}"`, fs: 14, mono: true, stroke: hot ? (s === 'loss' ? ACC : GOOD) : GRID, color: hot ? (s === 'loss' ? ACC : GOOD) : INK, s: sc });
        if (k === 3) mono(222, y + 5, ': [ … 5개 ]', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.25) }); });
      if (k >= 4) { tx(330, 186, 'history.history["loss"]', { 'font-size': 13.5, class: 'mono', fill: ACC, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 0.3) : 1 });
        TL.forEach((v, i) => { const s = k === 4 ? pop(u, 0.5 + i * 0.25) : 1; card(330, 214 + i * 36, 90, 28, { rx: 6, text: v.toFixed(3), fs: 14.5, mono: true, stroke: ACC, s }); }); } }
    if (k === 5) { const x = ax.X(5), y1 = ax.Y(TL[4]), y2 = ax.Y(VL[4]);
      el('line', { x1: x - 14, y1, x2: x - 14, y2, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.0) });
      mono(x - 20, (y1 + y2) / 2 + 5, '간격', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.0) });
      sub(740, 395, 'val 도 아직 내려간다 · 다시 오르면 과적합 신호', fade(u, 1.6), { 'font-weight': 700, fill: INK }); } }

  // ---------- 3. evaluate · predict ----------
  function stack(x, y, n, label, sub0, col, op) { for (let d = 3; d >= 0; d--) el('rect', { x: x + d * 7, y: y - d * 7, width: 120, height: 120, rx: 6, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: op });
    digit(x + 18, y + 18, 6, n, { op, stroke: 'none' }); lbl(x + 60, y + 150, label, op); mono(x + 60, y + 172, sub0, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: op }); }
  function modelBox(cx, cy, o) { o = o || {}; card(cx, cy, 150, 96, { rx: 12, stroke: INK, sw: 2.5, s: o.s, op: o.op }); lbl(cx, cy - 12, 'model', o.op ?? 1); sub(cx, cy + 14, '101,770 가중치', o.op ?? 1); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { stack(60, 120, D5, '훈련 60,000', '학습에 씀', GRID, k === 0 ? 1 - 0.5 * E(u, 1.2, 2.0) : 0.5);
      stack(270, 120, D7, '테스트 10,000', '학습에 안 씀', ACC, k === 0 ? pop(u, 0.3) : 1);
      modelBox(660, 180, { s: k === 0 ? pop(u, 0.8) : 1 });
      if (k === 0) { sub(330, 340, 'x_test / 255.0 · 같은 정규화', fade(u, 1.4), { 'font-weight': 700, fill: INK }); return; }
      dot([[410, 180], [585, 180]], seg(u, 0.2, 1.0), ACC, 7); grow(410, 180, 580, 180, E(u, 0.1, 0.9), ACC);
      lock(660, 100, true, INK, pop(u, 0.9)); sub(660, 72, '가중치 그대로', fade(u, 1.0), { 'font-weight': 700, fill: INK });
      const L = tween(null, 0.0803, u), A = 0.9745;
      [['test_loss', '0.080'], ['test_acc', '0.975']].forEach(([n, v], i) => { const y = 140 + i * 80, s = pop(u, 1.2 + i * 0.4);
        card(860, y, 150, 62, { rx: 10, stroke: i ? GOOD : GRID, sw: 2, s }); tx(860, y - 8, n, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.3 + i * 0.4) });
        mono(860, y + 18, v, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: i ? GOOD : INK, opacity: fade(u, 1.3 + i * 0.4) }); });
      grow(737, 180, 780, 150, E(u, 1.0, 1.4), MUT); return; }
    // k ≥ 2: 한 장을 배치로 감싸 predict
    const big = k <= 4;
    if (big) { digit(70, 110, 12, D7, {}); lbl(154, 312, 'x_test[0]', 1);
      const wrap = k === 2 ? E(u, 0.8, 1.6) : 1;
      if (wrap > 0) el('rect', { x: 70 - 14 * wrap - 3, y: 110 - 14 * wrap - 3, width: 168 + 28 * wrap + 6, height: 168 + 28 * wrap + 6, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '8 5', opacity: wrap });
      mono(154, 344, wrap > 0.5 ? '(1, 28, 28)' : '(28, 28)', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: wrap > 0.5 ? ACC : INK });
      if (k === 2) sub(154, 372, 'np.newaxis 로 배치 차원 추가', fade(u, 1.6), { 'font-weight': 700 });
      modelBox(380, 200, { s: k === 2 ? pop(u, 1.8) : 1 }); grow(262, 200, 300, 200, k === 2 ? E(u, 2.0, 2.5) : 1, ACC); }
    if (k === 3 || k === 4) { // 확률 막대 10개
      const P = [0, 0, 0, 0.00005, 0, 0, 0, 0.99994, 0, 0.00001], x0 = 520, bw = 36, base = 330, H = 230, g = k === 3 ? E(u, 0.3, 1.8) : 1;
      grow(457, 200, 505, 200, k === 3 ? E(u, 0.1, 0.4) : 1, ACC);
      P.forEach((p, i) => { const x = x0 + i * (bw + 6), h = Math.max(2, H * p * g), hot = k === 4 && i === 7;
        el('rect', { x, y: base - h, width: bw, height: h, rx: 3, fill: hot ? GOOD : i === 7 ? ACC : OFF });
        mono(x + bw / 2, base + 20, String(i), { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: hot ? GOOD : MUT }); });
      el('line', { x1: x0 - 4, y1: base, x2: x0 + 10 * (bw + 6), y2: base, stroke: MUT, 'stroke-width': 1.5 });
      mono(x0 + 7 * (bw + 6) + bw / 2, base - H * g - 10, (0.99994 * g).toFixed(5), { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 4 ? GOOD : ACC });
      mono(x0, 70, 'probs.shape = (1, 10)', { 'font-size': 14.5, fill: INK, opacity: k === 3 ? fade(u, 0.3) : 1 });
      sub(x0 + 3 * (bw + 6) + bw / 2, base - 18, '0.00005', k === 3 ? fade(u, 1.6) : 1, { class: 'mono' });
      if (k === 3) sub(720, 392, '열 개를 다 더하면 1 · 아직 "답"은 아니다', fade(u, 2.0), { 'font-weight': 700, fill: INK });
      if (k === 4) { el('circle', { cx: 900, cy: 120, r: 36 * pop(u, 0.9), fill: GOODBG, stroke: GOOD, 'stroke-width': 3 });
        tx(900, 134, '7', { 'font-size': 40, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        mono(720, 392, 'np.argmax(probs[0]) → 7 · 정답도 7', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.3) }); }
      return; }
    if (k === 5) { // 100장을 한 번에
      for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), cc = i % 10, s = clamp(E(u, 0.2, 1.4) * 100 - i);
        el('rect', { x: 60 + cc * 26, y: 70 + r * 26, width: 22, height: 22, rx: 3, fill: PANEL, stroke: GRID, 'stroke-width': 1.2, opacity: s }); }
      digit(62, 72, 1.3, D7, { stroke: 'none' });
      mono(190, 352, 'x_test[:100]  (100, 28, 28)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 0.8) });
      modelBox(440, 200, { s: pop(u, 0.8) }); grow(330, 200, 362, 200, E(u, 1.0, 1.3), ACC);
      // (100, 10) 확률 표 → argmax → (100,)
      for (let r = 0; r < 10; r++) for (let j = 0; j < 10; j++) { const on = (r * 3 + 7) % 10 === j; el('rect', { x: 560 + j * 14, y: 98 + r * 20, width: 12, height: 17, rx: 2, fill: on ? ACC : SOFT, opacity: fade(u, 1.2 + r * 0.05) }); }
      mono(630, 82, '(100, 10)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
      grow(712, 200, 770, 200, E(u, 1.8, 2.1), ACC); sub(741, 186, 'argmax', fade(u, 1.8), { class: 'mono', 'font-weight': 700 });
      for (let r = 0; r < 10; r++) el('rect', { x: 790, y: 98 + r * 20, width: 30, height: 17, rx: 2, fill: r === 7 && u > 2.2 ? BAD : GOOD, opacity: 0.6 * fade(u, 2.0 + r * 0.03) });
      mono(805, 82, '(100,)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.0) });
      mono(805, 340, '99 / 100 정답', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: INK, opacity: fade(u, 2.3) }); } }

  // ---------- 4. summary() 해부 ----------
  const ROWS = [['flatten (Flatten)', '(None, 784)', 0], ['dense (Dense)', '(None, 128)', 100480], ['dense_1 (Dense)', '(None, 10)', 1290]];
  function s4(t, c) { const { k, u } = c, x0 = 30, y0 = 56;
    // 표
    el('rect', { x: x0, y: y0, width: 520, height: 210, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    [['Layer (type)', 14], ['Output Shape', 220], ['Param #', 506]].forEach(([s, x], i) => tx(x0 + x, y0 + 26, s, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': i === 2 ? 'end' : 'start' }));
    el('line', { x1: x0 + 10, y1: y0 + 38, x2: x0 + 510, y2: y0 + 38, stroke: GRID, 'stroke-width': 1.5 });
    const nRow = [1, 2, 3, 3, 3, 3][k];
    ROWS.slice(0, nRow).forEach(([n, sh, p], i) => { const y = y0 + 66 + i * 38, isNew = i === nRow - 1 && k <= 2, op = isNew ? fade(u, 0.2) : 1;
      const v = isNew ? lerp(0, p, E(u, 0.4, 1.6)) : p, hot = k === 4 ? i === Math.min(2, Math.floor(E(u, 0.2, 2.4) * 3)) : isNew;
      if (hot) el('rect', { x: x0 + 6, y: y - 24, width: 508, height: 34, rx: 6, fill: ACCBG });
      mono(x0 + 14, y, n, { 'font-size': 14.5, opacity: op }); mono(x0 + 220, y, sh, { 'font-size': 14.5, fill: ACC, opacity: op });
      mono(x0 + 506, y, fmt(v), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: op }); });
    if (k >= 2) { const tot = k === 2 ? lerp(100480, 101770, E(u, 0.6, 1.6)) : 101770;
      el('line', { x1: x0 + 10, y1: y0 + 172, x2: x0 + 510, y2: y0 + 172, stroke: GRID, 'stroke-width': 1.5 });
      mono(x0 + 14, y0 + 196, 'Total params', { 'font-size': 15, 'font-weight': 700 }); mono(x0 + 506, y0 + 196, fmt(tot), { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' }); }
    else if (k === 1) { mono(x0 + 14, y0 + 196, 'Total params', { 'font-size': 15, 'font-weight': 700, fill: MUT }); mono(x0 + 506, y0 + 196, fmt(lerp(0, 100480, E(u, 0.4, 1.6))), { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' }); }
    // 오른쪽: 가중치 모양을 크기대로
    const RX = 640;
    if (k === 0) { el('rect', { x: RX + 40, y: 70, width: 14, height: 280, rx: 3, fill: OFF, opacity: fade(u, 0.3) });
      lbl(RX + 47, 380, '(784,)', fade(u, 0.3), { class: 'mono', fill: ACC });
      tx(RX + 90, 160, 'Flatten 은', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) }); tx(RX + 90, 186, '배울 값이 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9) });
      mono(RX + 90, 220, 'Param # = 0', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      sub(290, 300, 'None 은 배치 크기 자리', fade(u, 1.6), { 'font-weight': 700, fill: INK }); sub(290, 322, '몇 장을 넣어도 된다', fade(u, 1.7)); return; }
    if (k <= 3 || k === 5) { const g = k === 1 ? E(u, 0.3, 1.5) : 1;
      // W1 784×128 (세로 280, 가로 46) + b1 · W2 128×10 (세로 46, 가로 3.6)
      el('rect', { x: RX, y: 70, width: 46, height: 280 * g, fill: ACC, opacity: 0.35 }); el('rect', { x: RX, y: 70, width: 46, height: 280 * g, fill: 'none', stroke: ACC, 'stroke-width': 2 });
      for (let i = 1; i < 8; i++) el('line', { x1: RX, y1: 70 + i * 35, x2: RX + 46, y2: 70 + i * 35, stroke: PANEL, 'stroke-width': 1, opacity: 0.6 * g });
      el('rect', { x: RX + 56, y: 70, width: 46, height: 5, fill: WARN, opacity: fade(u, k === 1 ? 1.3 : 0) });
      mono(RX + 23, 376, 'W 784×128', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 });
      mono(RX + 79, 62, 'b 128', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, k === 1 ? 1.3 : 0) });
      if (k >= 2) { const g2 = k === 2 ? E(u, 0.3, 1.2) : 1;
        el('rect', { x: RX + 150, y: 70, width: 6, height: 46 * g2, fill: INFO, opacity: 0.6 }); el('rect', { x: RX + 162, y: 70, width: 6, height: 3, fill: WARN });
        mono(RX + 160, 140, 'W 128×10', { 'font-size': 14, 'fill': INFO, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, k === 2 ? 0.8 : 0) });
        mono(RX + 160, 160, '+ b 10', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, k === 2 ? 0.9 : 0) }); }
      if (k === 3) { const lines2 = ['784 × 128 + 128 = 100,480', '128 × 10  +  10 =   1,290', 'Flatten           =       0'];
        lines2.forEach((s, i) => mono(x0 + 14, 310 + i * 28, s.slice(0, Math.round(s.length * E(u, 0.2 + i * 0.6, 0.9 + i * 0.6))), { 'font-size': 16, 'font-weight': 700, fill: i < 2 ? INK : MUT }));
        sub(RX + 170, 300, '입력 × 출력 + 편향', fade(u, 2.0), { 'font-weight': 700, fill: INK, 'font-size': 15 }); sub(RX + 170, 324, '은닉층이 전체의 98.7%', fade(u, 2.3), { 'font-weight': 700, fill: ACC }); }
      if (k === 5) { snippet(x0, 296, ['W, b = model.layers[1].get_weights()', 'print(W.shape, b.shape)'], { op: fade(u, 0.2) });
        mono(x0 + 14, 392, '(784, 128) (128,)', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) });
        [0, 1, 2].forEach((i) => el('rect', { x: RX - 4 + i * 0, y: 70 + i * 2, width: 54, height: 284, rx: 4, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 1.2) * (i === 0 ? 1 : 0) }));
        sub(RX + 170, 300, '표의 숫자와 배열 모양이', fade(u, 1.5), { 'font-weight': 700, fill: INK, 'font-size': 15 }); sub(RX + 170, 324, '정확히 같다', fade(u, 1.6), { 'font-weight': 700, fill: GOOD, 'font-size': 15 }); }
      if (k === 1) { sub(290, 300, '784 입력이 128 뉴런에 전부 연결', fade(u, 1.4), { 'font-weight': 700, fill: INK }); sub(290, 322, '입력이 커질수록 파라미터가 폭발한다', fade(u, 1.7)); }
      if (k === 2) { sub(290, 300, '출력층은 1,290 개뿐', fade(u, 1.4), { 'font-weight': 700, fill: INK }); }
      return; }
    // k === 4: for layer in model.layers
    snippet(x0, 290, ['for layer in model.layers:', '    print(layer.name, layer.output.shape)'], { op: fade(u, 0.2) });
    const out = [['flatten', '(None, 784)'], ['dense', '(None, 128)'], ['dense_1', '(None, 10)']];
    el('rect', { x: RX - 20, y: 80, width: 300, height: 150, rx: 10, fill: INK });
    out.forEach(([a, b], i) => { const s = fade(u, 0.5 + i * 0.6); mono(RX, 116 + i * 36, a, { 'font-size': 15, fill: PANEL, opacity: s }); mono(RX + 120, 116 + i * 36, b, { 'font-size': 15, fill: 'var(--term)', opacity: s }); });
    sub(RX + 130, 270, 'Keras 3 에서는 layer.output.shape', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }

  // ---------- 5. 방식 1의 지도 ----------
  function chain(x, y, names, col, u0) { names.forEach((s, i) => { const xx = x + i * 112, sc = pop(u0, 0.1 + i * 0.15);
      card(xx, y, 100, 36, { rx: 8, text: s, fs: 14, stroke: col, s: sc }); if (i) grow(xx - 62, y, xx - 52, y, E(u0, 0.2 + i * 0.15, 0.4 + i * 0.15), col); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { zone(30, 40, 440, 300, 'Sequential 이 되는 것', { fill: GOODBG, color: GOOD });
      chain(90, 140, ['Input', 'Flatten', 'Dense', 'Dense'], GOOD, u); check(250, 240, 20, pop(u, 1.2)); sub(250, 300, '입력에서 출력까지 한 줄', fade(u, 1.3), { 'font-weight': 700, fill: INK });
      zone(490, 40, 440, 300, '안 되는 것', { fill: BADBG, color: BAD, op: fade(u, 1.0) });
      const o = fade(u, 1.2); card(560, 190, 90, 36, { rx: 8, text: 'x', fs: 15, stroke: BAD, op: o }); card(700, 130, 90, 36, { rx: 8, text: 'a', fs: 15, stroke: BAD, op: o }); card(700, 250, 90, 36, { rx: 8, text: 'b', fs: 15, stroke: BAD, op: o }); card(850, 190, 110, 36, { rx: 8, text: 'concat', fs: 14, stroke: BAD, op: o });
      grow(605, 180, 655, 140, E(u, 1.4, 1.8), BAD); grow(605, 200, 655, 240, E(u, 1.4, 1.8), BAD); grow(745, 140, 795, 180, E(u, 1.8, 2.2), BAD); grow(745, 240, 795, 200, E(u, 1.8, 2.2), BAD);
      cross(710, 300, 16, pop(u, 2.2)); return; }
    if (k === 1 || k === 2) { // compile: 문자열 → 객체, 학습률 손잡이
      card(170, 90, 150, 44, { rx: 22, text: '"adam"', fs: 16, mono: true, stroke: MUT, color: MUT });
      grow(250, 90, 330, 90, k === 1 ? E(u, 0.4, 1.0) : 1, ACC);
      card(560, 90, 430, 44, { rx: 10, text: 'optimizers.Adam(learning_rate=1e-4)', fs: 15, mono: true, stroke: ACC, s: k === 1 ? pop(u, 1.0) : 1 });
      if (k === 1) { sub(480, 150, '문자열은 기본값 객체와 같다 · 조정이 필요할 때 객체로', fade(u, 1.6), { 'font-weight': 700, fill: INK }); sub(480, 176, '다음 절 II-1-2 의 주제', fade(u, 1.9)); }
      // 손실 그릇과 보폭: 0.001 → 0.0001
      const ax = axes(120, 190, 420, 190, { x: [-1, 1], y: [0, 1] }), f = (x) => x * x;
      const pts = []; for (let i = 0; i <= 40; i++) { const x = -1 + i / 20; pts.push([x, f(x)]); } line(ax, pts, 1, MUT, { sw: 2 });
      const lr = k === 1 ? 0.001 : tween(0.001, 0.0001, u, 1.4), step = lr / 0.001 * 0.45;
      let x = -0.9; for (let i = 0; i < 4; i++) { const nx = x + step * (1 - x * 0.1) * 0.9; el('circle', { cx: ax.X(x), cy: ax.Y(f(x)), r: 6, fill: ACC });
        grow(ax.X(x), ax.Y(f(x)), ax.X(Math.min(nx, 0.95)), ax.Y(f(Math.min(nx, 0.95))), 1, ACC, { plain: true }); x = Math.min(nx, 0.95); }
      meters(620, 230, 300, [{ name: 'learning_rate', val: lr < 0.00095 ? lr.toExponential(1).replace('e-4', 'e-4') : '0.001' }], { h: 76 });
      sub(770, 340, k === 2 ? '보폭이 1/10 로 줄었다' : '기본값 0.001', 1, { 'font-weight': 700, fill: k === 2 ? ACC : MUT }); return; }
    if (k === 3) { // 분기 코드 그래프
      card(110, 210, 110, 40, { rx: 8, text: 'inputs', fs: 15, stroke: INK }); card(270, 210, 110, 40, { rx: 8, text: 'Flatten', fs: 15, stroke: INK, s: pop(u, 0.2) });
      grow(165, 210, 215, 210, E(u, 0.2, 0.5), MUT);
      card(450, 130, 130, 40, { rx: 8, text: 'Dense(64) a', fs: 14.5, stroke: ACC, s: pop(u, 0.6) }); card(450, 290, 130, 40, { rx: 8, text: 'Dense(64) b', fs: 14.5, stroke: ACC, s: pop(u, 0.8) });
      grow(325, 200, 385, 140, E(u, 0.5, 0.9), ACC); grow(325, 220, 385, 280, E(u, 0.7, 1.1), ACC);
      card(650, 210, 140, 40, { rx: 8, text: 'concatenate', fs: 14.5, stroke: ACC, s: pop(u, 1.2) }); grow(515, 140, 580, 200, E(u, 1.1, 1.4), ACC); grow(515, 280, 580, 220, E(u, 1.1, 1.4), ACC);
      card(850, 110, 170, 60, { rx: 10, text: 'Sequential([...])\n한 줄 리스트', fs: 14, stroke: BAD, color: BAD, s: pop(u, 1.6) }); cross(850, 175, 16, pop(u, 1.9));
      banner(650, 370, '분기가 필요하면 함수형 API · II-2-1', pop(u, 2.1)); return; }
    if (k === 4) { // fit 상자를 열면 GradientTape 루프
      card(200, 210, 230, 160, { rx: 12, stroke: INK, sw: 2.5 }); lbl(200, 160, 'model.fit(...)', 1, { class: 'mono' }); sub(200, 190, '안이 보이지 않는다', 1);
      const op = E(u, 0.5, 1.3); el('rect', { x: 400, y: 60, width: 520, height: 320, rx: 14, fill: SOFT, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: op });
      grow(318, 210, 396, 210, op, ACC);
      mono(420, 92, 'with tf.GradientTape() as tape:', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: op });
      const ops = ['x', 'W·x+b', 'softmax', 'loss'];
      ops.forEach((s, i) => { const x = 470 + i * 120, s0 = pop(u, 1.0 + i * 0.25); card(x, 180, 100, 40, { rx: 8, text: s, fs: 14.5, mono: true, stroke: INK, s: s0 }); if (i) grow(x - 108, 180, x - 52, 180, E(u, 1.0 + i * 0.25, 1.2 + i * 0.25), MUT); });
      // 테이프: 기록 → 되감기
      el('rect', { x: 430, y: 240, width: 460 * E(u, 1.0, 2.0), height: 18, rx: 4, fill: WARN, opacity: 0.35 });
      tx(430, 278, '연산을 테이프에 기록', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
      [3, 2, 1].forEach((i, j) => grow(470 + i * 120, 320, 470 + (i - 1) * 120 + 10, 320, E(u, 2.0 + j * 0.15, 2.3 + j * 0.15), BAD));
      tx(890, 350, '되감아 기울기 계산 · Part Ⅲ', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.3) }); return; }
    // k === 5: 세 계단
    const L = [['Sequential + fit', '표준 순차 모델 · 결과부터', 'II-1-1 · II-1-2', GOOD], ['함수형 API', '분기 · 다중 입력 · skip', 'II-2-1', ACC], ['GradientTape', 'fit 안의 루프를 손으로', 'Part Ⅲ', BAD]];
    L.forEach(([a, b, ch, col], i) => { const x = 60 + i * 130, y = 70 + i * 100, s = pop(u, 0.2 + i * 0.4);
      card(x + 220, y + 32, 440, 64, { rx: 10, stroke: col, sw: 2.5, s });
      tx(x + 20, y + 30, a, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.4) });
      tx(x + 20, y + 52, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.4) });
      mono(x + 428, y + 38, ch, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) });
      if (i) grow(x - 40, y - 4, x - 10, y + 16, E(u, 0.1 + i * 0.4, 0.4 + i * 0.4), MUT); });
    sub(700, 400, '필요할 때만 한 계단씩 내려간다', fade(u, 1.7), { 'font-weight': 700, fill: INK, 'font-size': 15 }); }


  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'Flatten 층의 파라미터 수가 0 인 이유는 무엇인가?',
      o: ['값을 바꾸지 않고 (28, 28)을 (784,)로 펴기만 해서', '입력이 0~1 로 정규화돼 있어서', '마지막 층이 softmax 라서'], a: 0,
      why: 'Flatten 은 28×28 칸을 한 줄 784칸으로 다시 늘어놓을 뿐 곱하거나 더하는 값이 없다. 그래서 배울 가중치도 없다.' },
    { q: 'validation_split=0.2 로 fit 하면 에폭마다 배치가 몇 개 도는가? (batch_size=32, 훈련 6만 장)',
      o: ['1,875개', '1,500개', '375개'], a: 1,
      why: '6만 장 중 끝 20%(12,000장)가 검증으로 빠져 48,000장이 남는다. 48,000 ÷ 32 = 1,500 배치다.' },
    { q: '한 장짜리 이미지 (28, 28)을 predict 에 넣기 전에 해야 하는 일은 무엇인가?',
      o: ['argmax 를 먼저 구한다', '255 로 한 번 더 나눈다', '배치 차원을 붙여 (1, 28, 28)로 만든다'], a: 2,
      why: 'predict 는 언제나 여러 장 묶음을 기대한다. np.newaxis 로 감싸면 (1, 10) 확률이 나오고, 7번 자리가 0.99994 였다.' },
    { q: 'Dense(128) 이 784 차원 입력을 받을 때 파라미터 수는 무엇인가?',
      o: ['784 × 128 = 100,352', '784 × 128 + 128 = 100,480', '784 + 128 = 912'], a: 1,
      why: '가중치 W 가 784×128 개, 편향 b 가 출력 뉴런 수만큼 128 개다. 합이 summary 의 100,480 과 같다.' },
    { q: '한 입력을 두 갈래로 나눴다가 합치는 모델이 필요할 때 넘어갈 곳은 어디인가?',
      o: ['함수형 API (II-2-1)', 'compile 에 객체 넘기기 (II-1-2)', 'epochs 를 늘리기'], a: 0,
      why: 'Sequential 은 층을 한 줄 리스트로만 잇는다. 갈라졌다 합치는 그래프는 텐서를 변수로 다루는 함수형 API 가 그린다.' },
  ];

  const summary = [
    '층을 리스트로 쌓고 compile 과 fit 을 부르면 MNIST 가 5줄로 학습된다.',
    'fit 은 배치 자르기, 섞기, 역전파, 집계를 대신하고 History 로 에폭별 기록을 돌려준다.',
    'evaluate 는 테스트셋으로 재기만 하고, predict 는 배치를 받아 확률을 내며 argmax 로 답을 고른다.',
    'Dense 파라미터는 입력×출력+출력이라 784에서 128로 가는 층이 100,480개를 차지한다.',
  ];
  const review = [
    { q: '평가한다고 테스트셋으로 fit 을 한 번 더 돌렸더니 점수가 크게 올랐다. 먼저 의심할 것은?',
      o: ['테스트셋이 학습에 새어 들어가 가중치가 바뀌었다', '배치 크기가 너무 작았다', 'softmax 가 빠졌다'], a: 0,
      why: 'fit 은 정답을 보고 가중치를 바꾼다. 평가는 가중치를 그대로 두는 evaluate 로 해야 테스트 정확도 0.975 같은 값이 성적표가 된다.' },
    { q: '훈련 loss 는 0.047 까지 내려갔고 val_loss 는 0.102 에서 아직 내려가는 중이다. 지금 판단으로 맞는 것은?',
      o: ['이미 과적합이므로 바로 멈춘다', '두 곡선 사이 간격을 보며 val_loss 가 다시 오르는지 지켜본다', 'val_loss 는 무시하고 훈련 loss 만 본다'], a: 1,
      why: '과적합 신호는 val_loss 가 바닥을 찍고 다시 오를 때다. 간격이 있다는 것만으로는 아직 아니다.' },
    { q: 'Dense(128) 을 Dense(256) 으로 바꾸면 첫 Dense 층 파라미터는 어떻게 되는가?',
      o: ['100,480 그대로다', '약 두 배로 늘어난다', '절반으로 줄어든다'], a: 1,
      why: '공식이 입력×출력+출력이라 출력 뉴런이 두 배가 되면 100,480 개였던 이 층의 가중치도 거의 두 배가 된다.' },
  ];

  R.page({ title: 'Keras 5줄 학습 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
