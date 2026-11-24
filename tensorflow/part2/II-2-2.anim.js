/* II-2-2 콜백 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 곡선은 페이지가 든 예시 곡선(EPOCHS 1~12, val_loss 최저 7에폭 0.37)이다. 학습 데이터가 없어 실제 학습은 돌리지 않았다.
 * 대신 이 val_loss 를 Keras 3.15.1 의 EarlyStopping(patience=3, min_delta=0.001, restore_best_weights=True)·
 * ReduceLROnPlateau(factor=0.5, patience=2) 에 에폭마다 그대로 넣어 확인했다:
 *  EarlyStopping 은 10에폭에서 멈추고 best_epoch 는 7에폭(0부터 6), ReduceLROnPlateau 는 9에폭 끝에 lr 1e-3 → 5e-4.
 *  ModelCheckpoint(save_best_only=True) 가 파일을 쓰는 에폭은 1~7. run 비교값 0.37 / 0.33 / 0.61 은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, axes, scatter, line, hbar, snippet, terminal, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO, INFOBG, GOODBG, BADBG, WARNBG } = C;
  const TR = [0.90, 0.70, 0.55, 0.44, 0.36, 0.30, 0.25, 0.21, 0.18, 0.16, 0.14, 0.12];
  const VA = [0.85, 0.65, 0.52, 0.44, 0.40, 0.38, 0.37, 0.38, 0.40, 0.43, 0.47, 0.52];
  const BEST = 7, STOP = 10;

  // 손실 곡선 판: o.upto(val 을 몇 에폭까지), o.trU, o.vaU (그려지는 비율)
  function chart(x, y, w, h, o) { o = o || {};
    const ax = axes(x, y, w, h, { x: [1, 12], y: [0.1, 0.92], xt: o.xt || [1, 4, 7, 10, 12], yt: [0.2, 0.5, 0.8], xl: 'epoch', yl: 'loss', grid: true });
    const up = o.upto || 12, T = TR.slice(0, up).map((v, i) => [i + 1, v]), V = VA.slice(0, up).map((v, i) => [i + 1, v]);
    line(ax, T, o.trU ?? 1, o.trCol || MUT, { sw: 2.2, dash: '6 5', op: o.trOp ?? 1 });
    line(ax, V, o.vaU ?? 1, o.vaCol || ACC, { sw: 3.2 });
    if ((o.vaU ?? 1) >= 1) V.forEach(([e, v]) => el('circle', { cx: ax.X(e), cy: ax.Y(v), r: 4, fill: o.vaCol || ACC }));
    if (o.legend !== false) { tx(x + 14, y + h - 34, 'val_loss', { 'font-size': 14, 'font-weight': 700, fill: o.vaCol || ACC });
      tx(x + 14, y + h - 14, 'loss (점선)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: o.trOp ?? 1 }); }
    return ax; }
  const exNote = (x, y, op) => tx(x, y, '예시 곡선', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op ?? 1 });

  // ---------- 1. 콜백 = fit 의 훅 ----------
  const T0 = 70, T1 = 890, LY = 150, EPX = [[140, 340], [370, 570], [600, 800]];
  function pin(x, h, label, col, s, up) { const y2 = up === false ? LY + h : LY - h;
    el('line', { x1: x, y1: LY, x2: x, y2: lerp(LY, y2, clamp(s)), stroke: col, 'stroke-width': 2.5 });
    el('circle', { cx: x, cy: lerp(LY, y2, clamp(s)), r: 6 * clamp(s), fill: col });
    if (label) tx(x, y2 + (up === false ? 22 : -12), label, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle', class: 'mono', opacity: clamp(s) }); }
  const METHODS = ['on_train_begin', 'on_epoch_begin', 'on_epoch_end ★', 'on_train_end'];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { pill(480, 80, 'from tensorflow import keras', INK, pop(u, 0.2), { mono: true, fs: 15 });
      grow(T0, LY + 40, T1, LY + 40, E(u, 0.6, 1.8), MUT, { sw: 4 }); tx(T0, LY + 70, 'model.fit(...) 이 도는 시간', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.0) });
      sub(480, 300, 'keras.callbacks 안에 확장 지점이 이미 있다', fade(u, 1.8), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    // 시간줄
    el('line', { x1: T0, y1: LY, x2: T1, y2: LY, stroke: MUT, 'stroke-width': 4 });
    EPX.forEach(([a, b], i) => { el('rect', { x: a, y: LY - 14, width: b - a, height: 28, rx: 6, fill: SOFT, stroke: GRID }); mono((a + b) / 2, LY + 5, '에폭 ' + i, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); });
    mono(845, LY + 5, '…', { 'font-size': 16, 'text-anchor': 'middle', fill: MUT });
    if (k >= 6) EPX.forEach(([a, b], i) => { for (let j = 1; j < 10; j++) { const x = a + j * (b - a) / 10, s = k === 6 ? clamp(E(u, 0.2, 1.4) * 30 - (i * 9 + j)) : 1; el('line', { x1: x, y1: LY - 14, x2: x, y2: LY - 14 - 12 * s, stroke: INFO, 'stroke-width': 1.6 }); } });
    if (k === 6) sub(480, 245, 'on_train_batch_begin / end · 배치마다 (거의 안 건드림)', fade(u, 1.0), { 'font-weight': 700, fill: INFO });
    if (k >= 2) pin(T0, 60, 'train_begin', INK, k === 2 ? E(u, 0.3, 0.9) : 1);
    if (k >= 3) EPX.forEach(([a], i) => pin(a, 48, i === 0 ? 'epoch_begin' : '', MUT, k === 3 ? E(u, 0.3 + i * 0.3, 0.8 + i * 0.3) : 1, false));
    if (k >= 4) EPX.forEach(([, b], i) => { pin(b, 60, '★ ' + VA[i].toFixed(3), ACC, k === 4 ? E(u, 0.3 + i * 0.3, 0.8 + i * 0.3) : 1); });
    if (k === 4) sub(470, 230, 'on_epoch_end: 검증이 막 끝나 logs["val_loss"] 가 있다', fade(u, 1.4), { 'font-weight': 700, fill: ACC, 'font-size': 15 });
    if (k >= 5) pin(T1, 60, 'train_end', INK, k === 5 ? E(u, 0.3, 0.9) : 1);
    if (k < 7) { // 아래: TraceCallback 클래스의 메서드 칸
      card(480, 330, 640, 140, { rx: 12, stroke: INK, sw: 2, fill: PANEL, s: k === 1 ? pop(u, 0.2) : 1 });
      mono(180, 284, 'class TraceCallback(keras.callbacks.Callback):', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.4) : 1 });
      const nM = [0, 0, 1, 2, 3, 4, 4][k];
      METHODS.forEach((m, i) => { const x = 200 + (i % 2) * 290, y = 322 + Math.floor(i / 2) * 42, on = i < nM, s = on && i === nM - 1 && k <= 5 ? pop(u, 0.2) : 1;
        card(x + 120, y, 260, 34, { rx: 8, stroke: on ? (i === 2 ? ACC : INK) : OFF, dash: on ? null : '4 4', fill: on && i === 2 ? ACCBG : PANEL, s: on ? s : 1 });
        if (on) mono(x + 2, y + 5, 'def ' + m, { 'font-size': 14, fill: i === 2 ? ACC : INK, 'font-weight': 700, opacity: s }); }); return; }
    // k === 7: fit 이 직접 부른다 · 재생 헤드와 출력
    const p = E(u, 0.2, 2.6), hx = lerp(T0, T1, p);
    el('circle', { cx: hx, cy: LY, r: 9, fill: BAD });
    const ev = [[T0, '▶ 학습 시작 (1회)'], ...EPX.flatMap(([a, b], i) => [[a, `  ┌ 에폭 ${i} 시작`], [b, `  └ 에폭 ${i} 끝 · val_loss=${VA[i].toFixed(3)}`]]), [T1, '■ 학습 끝 (1회)']];
    const shown = ev.filter(([x]) => x <= hx + 0.5).length;
    terminal(70, 236, 820, 176, ev.map((e) => [e[1], 'var(--term)']), shown, { title: 'model.fit(..., callbacks=[TraceCallback()])', fs: 14, lh: 19 }); }

  // ---------- 2. EarlyStopping ----------
  const ES = [['monitor', "'val_loss'"], ['patience', '3'], ['min_delta', '0.001'], ['restore_best_weights', 'True']];
  function paramList(n, u, k, newAt) { tx(650, 60, 'EarlyStopping(', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC });
    ES.forEach(([a, b], i) => { const y = 96 + i * 44, on = i < n, s = on && i === n - 1 && k === newAt ? pop(u, 0.2) : 1;
      card(795, y, 290, 36, { rx: 8, stroke: on ? (i === 3 ? WARN : ACC) : OFF, dash: on ? null : '4 4', fill: on ? (i === 3 ? WARNBG : ACCBG) : PANEL, s: on ? s : 1 });
      if (on) { mono(662, y + 5, a + '=', { 'font-size': 14, opacity: s }); mono(930, y + 5, b, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'end', fill: i === 3 ? WARN : ACC, opacity: s }); } });
    tx(650, 96 + 4 * 44, ')', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC }); }
  function s2(t, c) { const { k, u } = c;
    paramList([0, 1, 2, 3, 4, 4, 4][k], u, k, k);
    const ax = chart(70, 50, 520, 280, { trOp: k >= 1 ? 0.45 : 1, vaU: k === 0 ? E(u, 0.3, 1.8) : 1, trU: k === 0 ? E(u, 0.3, 1.8) : 1, upto: k === 6 ? STOP : 12 });
    exNote(70, 400, 1);
    if (k === 6) [11, 12].forEach((e) => { el('circle', { cx: ax.X(e), cy: ax.Y(VA[e - 1]), r: 5, fill: OFF }); cross(ax.X(e), ax.Y(VA[e - 1]), 7, pop(u, 0.3)); });
    if (k === 1) { tx(ax.X(10), ax.Y(0.16) - 14, 'loss 는 끝까지 내려간다', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      tx(ax.X(10), ax.Y(0.47) - 16, 'val_loss 를 봐야 과적합이 보인다', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k >= 2) { el('circle', { cx: ax.X(BEST), cy: ax.Y(0.37), r: 11, fill: 'none', stroke: GOOD, 'stroke-width': 3 });
      mono(ax.X(BEST), ax.Y(0.37) + 28, '최저 0.37', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); }
    if (k >= 2 && k !== 3) { const w = k === 2 ? E(u, 0.3, 2.1) * 3 : 3;
      el('rect', { x: ax.X(BEST) + 4, y: 50, width: (ax.X(BEST + 1) - ax.X(BEST)) * w, height: 280, fill: WARN, opacity: 0.13 });
      tx((ax.X(BEST) + ax.X(STOP)) / 2, ax.Y(0.78), 'wait', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' });
      for (let i = 1; i <= 3; i++) if (w >= i - 0.2) mono((ax.X(BEST + i) + ax.X(BEST + i - 1)) / 2, ax.Y(0.66), String(i), { 'font-size': 17, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
      if (w >= 2.9) { el('line', { x1: ax.X(STOP), y1: 50, x2: ax.X(STOP), y2: 330, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }); mono(ax.X(STOP), 44, '중단', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); } }
    if (k === 3) { const x6 = ax.X(6), x7 = ax.X(7);
      el('line', { x1: x6, y1: ax.Y(0.38), x2: x7 + 60, y2: ax.Y(0.38), stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', opacity: fade(u, 0.3) });
      mono(x7 + 64, ax.Y(0.38) - 52, '0.38 → 0.37', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(x7 + 64, ax.Y(0.38) - 32, '줄어든 폭 0.01 ≥ 0.001', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.0) });
      sub(330, 380, 'min_delta 보다 작은 개선은 개선으로 치지 않는다 · mode="min"', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }
    if (k === 4 || k === 5 || k === 6) { const r = k === 4 ? E(u, 0.4, 1.6) : 1, yb = 300;
      grow(ax.X(STOP), yb, lerp(ax.X(STOP), ax.X(BEST) + 6, r), yb, 1, GOOD, { sw: 3 });
      if (k === 4) tx((ax.X(STOP) + ax.X(BEST)) / 2, yb - 12, 'restore', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k === 4) sub(795, 330, '없으면 나빠진 10에폭 가중치가 남는다', fade(u, 1.8), { 'font-weight': 700, fill: WARN });
    if (k === 5) { tx(650, 330, 'fit(..., epochs=100)', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) });
      for (let i = 0; i < 100; i++) el('rect', { x: 650 + (i % 50) * 5.8, y: 346 + Math.floor(i / 50) * 14, width: 4.4, height: 11, fill: i < STOP ? ACC : SOFT, opacity: fade(u, 0.4 + i * 0.012) });
      tx(650, 400, '10 에폭만 돈다 · 멈출 때는 콜백이 정한다', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 6) { mono(795, 345, 'len(history["loss"]) → 10', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      sub(795, 375, '가중치는 7에폭으로 돌아가 있다', fade(u, 1.2), { 'font-weight': 700, fill: GOOD }); } }

  // ---------- 3. ModelCheckpoint ----------
  function fileIcon(x, y, name, col, s, sub0) { const g = clamp(s);
    el('path', { d: `M${x - 24},${y - 30} h34 l14 14 v46 h-48 z`, fill: PANEL, stroke: col, 'stroke-width': 2.2, opacity: g });
    el('path', { d: `M${x + 10},${y - 30} v14 h14`, fill: 'none', stroke: col, 'stroke-width': 2, opacity: g });
    if (name) mono(x + 36, y - 2, name, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: g });
    if (sub0) mono(x + 36, y + 20, sub0, { 'font-size': 13.5, fill: MUT, opacity: g }); }
  function s3(t, c) { const { k, u } = c;
    const ax = chart(60, 60, 400, 250, { legend: true, trOp: 0.35, xt: [1, 4, 7, 10, 12] }); exNote(60, 400, 1);
    const RX = 520;
    if (k === 0) { dbIcon(RX + 80, 180, '디스크', { s: pop(u, 0.3) }); pill(RX + 260, 120, 'best_ckpt = ModelCheckpoint(...)', INK, pop(u, 0.8), { mono: true, fs: 13.5 });
      sub(RX + 200, 300, '메모리에 남는 건 마지막 12에폭(0.52)', fade(u, 1.4), { 'font-weight': 700, fill: BAD }); return; }
    if (k === 1) { snippet(RX, 70, ['filepath="best_model.keras",', 'monitor="val_loss", mode="min",'], { op: fade(u, 0.2) });
      fileIcon(RX + 40, 220, 'best_model.keras', INK, pop(u, 0.8), '구조 + 가중치');
      sub(RX + 200, 320, '무엇을 기준으로 최고를 고를지 정한다', fade(u, 1.4), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2 || k === 6) { // 에폭마다 판정: 1~7 만 덮어쓴다
      const p = Math.min(12, Math.floor(E(u, 0.2, 2.6) * 12 + 1e-6) + (k === 6 ? 0 : 0)), cur = Math.max(1, p);
      for (let e = 1; e <= cur; e++) { const saved = e <= BEST; el('circle', { cx: ax.X(e), cy: ax.Y(VA[e - 1]), r: saved ? 7 : 5, fill: saved ? GOOD : OFF }); }
      const last = Math.min(cur, BEST);
      fileIcon(RX + 40, 120, 'best_model.keras', GOOD, 1, `epoch ${last} · val ${VA[last - 1].toFixed(2)}`);
      if (k === 6) { for (let e = 1; e <= 12; e++) { const x = RX + 10 + ((e - 1) % 6) * 68, y = 230 + Math.floor((e - 1) / 6) * 50, on = e <= cur;
          card(x + 28, y, 60, 40, { rx: 8, stroke: on ? (e <= BEST ? GOOD : GRID) : OFF, dash: on ? null : '3 3' }); mono(x + 14, y + 5, String(e), { 'font-size': 14, fill: MUT, opacity: on ? 1 : 0.4 });
          if (on) { if (e <= BEST) check(x + 42, y, 7, 1); else mono(x + 44, y + 5, '–', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle' }); } }
        sub(RX + 200, 360, 'callbacks=[best_ckpt] · 에폭 끝마다 판정', fade(u, 0.3), { 'font-weight': 700, fill: INK }); }
      else sub(RX + 200, 260, '8에폭부터는 val_loss 가 나빠져 파일이 그대로다', fade(u, 2.2), { 'font-weight': 700, fill: INK });
      return; }
    if (k === 3) { mono(RX, 100, 'filepath="ckpt/ep{epoch:02d}-', { 'font-size': 14.5, opacity: fade(u, 0.2) }); mono(RX, 124, '    val{val_loss:.3f}.weights.h5"', { 'font-size': 14.5, opacity: fade(u, 0.3) });
      grow(RX + 150, 140, RX + 150, 190, E(u, 0.6, 1.0), ACC);
      fileIcon(RX + 40, 240, 'ep07-val0.370.weights.h5', ACC, pop(u, 1.1), '7에폭이면 이 이름');
      sub(RX + 200, 330, '이름이 매번 달라 덮어쓰지 않고 쌓인다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { tx(RX, 70, 'save_best_only=False · 매 에폭 저장', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      for (let e = 1; e <= 12; e++) { const x = RX + (e > 6 ? 210 : 0), y = 100 + ((e - 1) % 6) * 34, s = clamp(E(u, 0.3, 2.2) * 12 - (e - 1));
        mono(x, y + 12, `ep${String(e).padStart(2, '0')}-val${VA[e - 1].toFixed(3)}`, { 'font-size': 13.5, fill: e === BEST ? GOOD : INK, opacity: s }); }
      sub(RX + 200, 330, '12에폭이면 파일 12개 · 큰 모델은 디스크를 먹는다', fade(u, 2.3), { 'font-weight': 700, fill: WARN }); return; }
    if (k === 5) { fileIcon(RX + 20, 130, '.keras', INK, pop(u, 0.2), '구조 + 가중치');
      fileIcon(RX + 20, 250, '.weights.h5', ACC, pop(u, 0.8), '가중치만 · 작고 빠름');
      sub(RX + 200, 340, '가중치만 저장하면 구조는 코드로 다시 만든다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    // k === 7: 디스크에서 최고 모델을 그대로
    fileIcon(RX + 20, 110, 'best_model.keras', GOOD, 1, 'epoch 7 · val 0.37');
    grow(RX + 120, 150, RX + 120, 200, E(u, 0.3, 0.7), GOOD); pill(RX + 180, 230, 'keras.models.load_model(...)', GOOD, pop(u, 0.7), { mono: true, fs: 13.5 });
    [['restore_best_weights', '메모리 안에서', ACC], ['ModelCheckpoint', '디스크에 · 크래시에도', GOOD]].forEach(([a, b, col], i) => { const y = 300 + i * 46;
      card(RX + 200, y, 400, 38, { rx: 8, stroke: col, s: pop(u, 1.3 + i * 0.3) }); mono(RX + 12, y + 5, a, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 1.4 + i * 0.3) });
      tx(RX + 388, y + 5, b, { 'font-size': 14, 'text-anchor': 'end', opacity: fade(u, 1.4 + i * 0.3) }); }); }

  // ---------- 4. ReduceLROnPlateau + TensorBoard ----------
  const SQ = [['EarlyStopping', '멈춤'], ['ModelCheckpoint', '저장'], ['ReduceLROnPlateau', 'lr 절반'], ['TensorBoard', '기록·비교']];
  function squad(n, u, newFrom, k) { SQ.forEach(([a, b], i) => { const x = 128 + i * 236, on = i < n, s = on && i >= newFrom ? pop(u, 0.2 + (i - newFrom) * 0.35) : 1;
      card(x, 48, 220, 50, { rx: 10, stroke: on ? ACC : OFF, fill: on ? ACCBG : PANEL, dash: on ? null : '4 4', s: on ? s : 1 });
      tx(x, 44, a, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? INK : OFF, opacity: on ? s : 1 }); tx(x, 64, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: on ? s : 0.6 }); }); }
  function s4(t, c) { const { k, u } = c;
    const n = [4, 4, 4, 4, 2, 4, 4, 4][k], nf = [0, 9, 9, 9, 0, 2, 9, 9][k];
    squad(n, u, nf, k);
    if (k === 0) { sub(720, 400, '넷은 역할이 겹치지 않는다', fade(u, 1.4), { 'font-weight': 700, fill: INK, 'font-size': 16 }); }
    if (k <= 2) { // val 곡선 + lr 계단
      const ax = chart(80, 110, 440, 190, { trOp: 0.3, legend: false, upto: k === 2 ? STOP : 12, xt: [1, 4, 7, 9, 10] }); exNote(80, 410, 1);
      const lx = axes(600, 130, 320, 160, { x: [1, 12], y: [0, 0.0011], xt: [1, 9, 12], yt: [0.0005, 0.001], xl: 'epoch', yl: 'learning_rate' });
      const drop = k === 2 ? E(u, 1.0, 1.8) : k === 1 ? E(u, 0.8, 1.8) : 0, lrPts = [[1, 0.001], [9, 0.001], [9, lerp(0.001, 0.0005, drop)], [12, lerp(0.001, 0.0005, drop)]];
      line(lx, lrPts, 1, WARN, { sw: 3 });
      mono(lx.X(9) + 8, lx.Y(lerp(0.001, 0.0005, drop)) + 22, drop > 0.5 ? '5e-4' : '1e-3', { 'font-size': 14.5, 'font-weight': 800, fill: WARN });
      if (k === 1) sub(760, 350, 'factor=0.5 · 정체하면 lr × 0.5', fade(u, 1.4), { 'font-weight': 700, fill: INK });
      if (k === 2) { [8, 9].forEach((e, i) => mono(ax.X(e), 132, 'wait ' + (i + 1), { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.3) }));
        el('line', { x1: ax.X(STOP), y1: 110, x2: ax.X(STOP), y2: 300, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 1.8) });
        mono(ax.X(STOP) + 6, 124, 'ES 중단', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
        sub(760, 350, 'patience 2 < 3 · lr 을 먼저 낮춰 본다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); }
      return; }
    if (k === 3) { const now = 'logs/1124-101500'; tx(80, 150, 'TensorBoard(log_dir=run_dir, histogram_freq=1)', { 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.2) });
      ['logs/', '  1124-101500/   ← 이번 실행 (예시 이름)', '    train/', '    validation/'].forEach((s, i) => mono(100, 200 + i * 30, s, { 'font-size': 15, fill: i === 1 ? ACC : INK, opacity: fade(u, 0.5 + i * 0.3) }));
      sub(700, 260, '실행마다 시각을 붙인 폴더', fade(u, 1.6), { 'font-weight': 700, fill: INK, 'font-size': 15 }); sub(700, 284, '로그가 섞이지 않는다', fade(u, 1.8), { 'font-size': 15 }); void now; return; }
    if (k === 4 || k === 5) { snippet(80, 120, ['callbacks = [', '    EarlyStopping(monitor="val_loss", patience=3,', '                  restore_best_weights=True),', '    ModelCheckpoint("best_model.keras", save_best_only=True),', k === 5 ? '    reduce_lr,' : '', k === 5 ? '    tensorboard,' : '', ']'].filter((x, i) => x || i === 6 || i < 4), { op: 1, fs: 14 });
      sub(480, 390, k === 4 ? '메모리 복원(ES)과 디스크 보존(MC)은 서로를 대신하지 못한다' : '같은 경계에서 fit 이 넷을 모두 부른다', fade(u, 1.2), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    // k 6 · 7: run 비교 (예시 값)
    const runs = [['baseline lr=1e-3', 0.37, INK], ['+ReduceLR', 0.33, GOOD], ['lr=1e-2 (발산)', 0.61, BAD]].slice(0, k === 6 ? 2 : 3);
    tx(80, 140, k === 6 ? 'model.fit(..., epochs=100, callbacks=callbacks)' : 'tensorboard --logdir logs', { 'font-size': 15, class: 'mono', 'font-weight': 700 });
    runs.forEach(([n, v, col], i) => { const y = 190 + i * 62, isNew = (k === 6 && i === 1) || (k === 7 && i === 2);
      tx(80, y + 16, 'run: ' + n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: isNew ? fade(u, 0.3) : 1 });
      hbar(360, y + 2, 420, v, 0.7, { col, text: 'best val ' + v.toFixed(2), u: isNew ? E(u, 0.4, 1.4) : 1, h: 22 }); });
    sub(480, 400, '값은 예시 · 여러 run 을 겹쳐 보고 나은 설정을 고른다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }

  // ---------- 5. 커스텀 콜백과 경계선 ----------
  function ring(cx, cy, r, t, op, locked) { const names = ['순전파', '손실', '역전파', '갱신'];
    el('circle', { cx, cy, r, fill: 'none', stroke: INK, 'stroke-width': 3, opacity: op });
    names.forEach((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 2; card(cx + Math.cos(a) * r, cy + Math.sin(a) * r, tw(s, 14.5) + 22, 30, { rx: 15, text: s, fs: 14.5, stroke: INK, op }); });
    const a = -Math.PI / 2 + ((t * 0.6) % 1) * Math.PI * 2; el('circle', { cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, r: 6, fill: ACC, opacity: op });
    if (locked) lock(cx, cy + 4, true, INK, 1); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { card(300, 110, 520, 80, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: k === 0 ? pop(u, 0.2) : 1 });
      mono(60, 100, 'class SamplePredictCallback(Callback):', { 'font-size': 15, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.4) : 1 });
      tx(60, 128, '에폭마다 검증 샘플 3개를 실제로 예측해 본다', { 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 0.7) : 1 }); }
    if (k === 0) { sub(480, 260, '4대 콜백도 모두 같은 방식으로 만들어져 있다', fade(u, 1.4), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    if (k === 1 || k === 2) { [0, 1, 2].forEach((i) => { const x = 110 + i * 90, a = k === 1 ? E(u, 0.4 + i * 0.2, 1.2 + i * 0.2) : 1;
        card(lerp(x, 640 + i * 70, a), lerp(250, 110, a), 56, 56, { rx: 8, stroke: INFO, fill: INFOBG, text: 'x' + i, fs: 14, mono: true }); });
      if (k === 1) { tx(110, 300, 'x_val[:3]', { 'font-size': 15, class: 'mono', 'font-weight': 700, fill: INFO, opacity: 1 - fade(u, 1.2) }); sub(700, 170, 'self.x_sample', fade(u, 1.6), { class: 'mono', 'font-weight': 700, fill: INFO }); return; }
      pill(300, 220, 'on_epoch_end', ACC, pop(u, 0.2), { mono: true });
      grow(370, 220, 520, 220, E(u, 0.4, 0.8), ACC); pill(640, 220, 'self.model.predict(self.x_sample)', INK, pop(u, 0.8), { mono: true, fs: 13.5 });
      terminal(60, 270, 840, 120, [['[에폭 0] 샘플 예측: [ · · · ]', 'var(--term)'], ['[에폭 1] 샘플 예측: [ · · · ]', 'var(--term)']], lerp(0, 2, E(u, 1.2, 2.4)), { title: 'preds.argmax(axis=1) · 정수 3개', fs: 15 });
      return; }
    if (k === 3) { card(220, 150, 300, 120, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.2) }); mono(90, 120, 'logs = {', { 'font-size': 15, opacity: fade(u, 0.3) });
      mono(110, 148, "'loss': …,", { 'font-size': 15, opacity: fade(u, 0.4) }); mono(110, 174, "'val_loss': …", { 'font-size': 15, opacity: fade(u, 0.5) }); mono(90, 200, '}', { 'font-size': 15, opacity: fade(u, 0.5) });
      fly(370, 150, 700, 150, seg(u, 0.8, 1.6), 'requests.post', { mono: true });
      el('path', { d: 'M600,110 h240 a14,14 0 0 1 14,14 v60 a14,14 0 0 1 -14,14 h-200 l-20,20 v-20 h-20 a14,14 0 0 1 -14,-14 v-60 a14,14 0 0 1 14,-14 z', fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.6) });
      tx(720, 160, '에폭 끝 지표 알림', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.7) });
      sub(480, 320, '긴 학습을 돌려 놓고 자리를 비울 때 쓸모 있다', fade(u, 2.0), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    if (k === 4) { snippet(60, 70, ['model.fit(x_train, y_train, validation_data=(x_val, y_val),', '          epochs=12, callbacks=[SamplePredictCallback(x_val[:3])])'], { op: fade(u, 0.2), fs: 14 });
      el('line', { x1: 70, y1: 240, x2: 890, y2: 240, stroke: MUT, 'stroke-width': 4 });
      [[110, 330], [360, 580], [610, 830]].forEach(([a0, b0], i) => { el('rect', { x: a0, y: 226, width: b0 - a0, height: 28, rx: 6, fill: SOFT, stroke: GRID });
        mono((a0 + b0) / 2, 245, '에폭 ' + i, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
        const g = E(u, 0.5 + i * 0.4, 1.0 + i * 0.4); el('line', { x1: b0, y1: 226, x2: b0, y2: 226 - 50 * g, stroke: ACC, 'stroke-width': 2.5 }); el('circle', { cx: b0, cy: 226 - 50 * g, r: 6 * g, fill: ACC }); });
      mono(830, 160, 'on_epoch_end', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) });
      sub(480, 320, '내장이든 커스텀이든 같은 경계에서 불린다', fade(u, 1.6), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    if (k === 5 || k === 6) { ring(260, 220, 110, t, 1, true); tx(260, 380, 'fit 한 스텝 · 순서 고정', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      if (k === 5) { pill(560, 120, '경계에 끼어들기', GOOD, pop(u, 0.3)); check(680, 120, 10, pop(u, 0.5)); grow(500, 140, 390, 190, E(u, 0.4, 0.9), GOOD);
        pill(560, 300, '순서 바꾸기', BAD, pop(u, 1.0)); cross(660, 300, 10, pop(u, 1.3)); grow(500, 290, 380, 250, E(u, 1.1, 1.6), BAD, { dash: '6 4' }); return; }
      // GAN: 생성자·판별자를 번갈아
      card(700, 130, 140, 50, { rx: 10, text: '생성자 G', fs: 15, stroke: WARN, s: pop(u, 0.3) }); card(700, 300, 140, 50, { rx: 10, text: '판별자 D', fs: 15, stroke: WARN, s: pop(u, 0.5) });
      el('path', { d: 'M760,155 Q830,215 760,275', fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'marker-end': 'url(#ra-ah)', opacity: fade(u, 0.8) });
      el('path', { d: 'M640,275 Q570,215 640,155', fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'marker-end': 'url(#ra-ah)', opacity: fade(u, 1.0) });
      tx(700, 220, '번갈아 학습', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.1) });
      cross(860, 215, 14, pop(u, 1.6)); sub(700, 380, '한 스텝 구조 자체가 다르다', fade(u, 1.8), { 'font-weight': 700, fill: BAD, 'font-size': 15 }); return; }
    // k === 7: 방식 1 졸업
    [['방식 1 · fit', '콜백으로 경계에 끼어든다', GOOD, 'II-1-1 ~ II-2-2'], ['방식 2 · GradientTape', '루프 자체를 직접 쓴다', BAD, 'Part Ⅲ · III-1-1']].forEach(([a, b, col, ch], i) => {
      const x = 140 + i * 180, y = 110 + i * 130, s = pop(u, 0.2 + i * 0.6); card(x + 260, y, 520, 76, { rx: 12, stroke: col, sw: 2.5, s });
      tx(x + 20, y - 4, a, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.6) }); tx(x + 20, y + 22, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.6) });
      mono(x + 500, y + 6, ch, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.6) }); });
    grow(300, 150, 360, 196, E(u, 0.6, 1.0), MUT);
    sub(480, 380, '커스텀 콜백이 fit 으로 할 수 있는 것의 끝이다', fade(u, 1.6), { 'font-weight': 700, fill: INK, 'font-size': 15 }); }

  const quiz = [
    { q: '검증 손실을 보고 멈출지·저장할지·lr을 낮출지 결정하기 가장 좋은 훅은 무엇인가?',
      o: ['on_train_begin', 'on_epoch_end', 'on_train_batch_begin'], a: 1,
      why: 'on_epoch_end는 그 에폭의 검증 평가가 막 끝난 직후라 logs["val_loss"]를 손에 쥐고 있다.' },
    { q: 'val_loss가 7에폭 0.37에서 최저를 찍고 계속 나빠질 때, patience=3인 EarlyStopping은 언제 멈추는가?',
      o: ['8에폭', '7에폭', '10에폭'], a: 2,
      why: '8·9·10 에폭 세 번 연속 개선이 없어야 patience가 다 찬다. restore_best_weights=True면 7에폭 가중치로 되돌린다.' },
    { q: 'save_best_only=True인 ModelCheckpoint가 디스크에 남기는 것은 무엇인가?',
      o: ['감시 지표가 가장 좋았던 에폭의 모델 하나', '마지막 에폭의 모델', '모든 에폭의 모델'], a: 0,
      why: '갱신될 때만 덮어쓰므로 예시 곡선에서는 1~7에폭에만 파일이 바뀌고, 결국 7에폭 모델이 남는다.' },
    { q: 'ReduceLROnPlateau의 patience를 EarlyStopping보다 짧게(2 < 3) 잡는 이유는 무엇인가?',
      o: ['TensorBoard 로그를 줄이려고', '멈추기 전에 학습률을 먼저 낮춰 보려고', '체크포인트 파일 수를 줄이려고'], a: 1,
      why: '예시 곡선에서 lr은 9에폭 끝에 1e-3에서 5e-4로 줄고, 그래도 나아지지 않으면 10에폭에 EarlyStopping이 멈춘다.' },
    { q: '생성자와 판별자를 번갈아 학습하는 GAN을 콜백만으로 만들 수 없는 이유는 무엇인가?',
      o: ['콜백은 self.model에 접근할 수 없어서', '콜백은 on_epoch_end를 쓸 수 없어서', '콜백은 fit이 정한 경계에 끼어들 뿐 한 스텝의 순서를 바꾸지 못해서'], a: 2,
      why: 'fit의 한 스텝은 순전파·손실·역전파·갱신 순서로 고정돼 있다. 순서를 바꾸려면 GradientTape로 루프를 직접 쓴다.' },
  ];

  const summary = [
    '콜백은 fit이 학습 시작, 에폭 경계, 배치 경계, 학습 끝마다 대신 불러 주는 훅이다.',
    'EarlyStopping은 val_loss가 patience 만큼 안 줄면 멈추고 최저점 가중치로 되돌린다.',
    'ModelCheckpoint는 감시 지표가 좋아진 에폭만 디스크에 저장해 최고 모델을 남긴다.',
    'ReduceLROnPlateau로 학습률을 먼저 낮추고, 순서를 바꿔야 하면 GradientTape로 간다.',
  ];
  const review = [
    { q: 'EarlyStopping을 붙였는데 최종 모델 성능이 최저점보다 나쁘다. 먼저 확인할 것은?',
      o: ['patience를 0으로 줄였는지', 'restore_best_weights=True를 켰는지', 'TensorBoard를 붙였는지'], a: 1,
      why: '이 인자가 없으면 멈춘 시점(예시에서는 나빠진 10에폭)의 가중치가 남는다. 켜면 7에폭 가중치로 돌아간다.' },
    { q: '긴 학습 중 세션이 끊겨 메모리의 모델을 잃었다. 미리 해 뒀어야 할 것은?',
      o: ['ModelCheckpoint(save_best_only=True)로 디스크에 최고 모델 남기기', 'ReduceLROnPlateau의 factor를 0.5로 두기', 'epochs를 작게 잡기'], a: 0,
      why: 'restore_best_weights는 메모리 안에서만 지킨다. 디스크에 남긴 best_model.keras는 load_model 한 줄로 되살릴 수 있다.' },
    { q: 'EarlyStopping(patience=3)과 ReduceLROnPlateau(patience=5)를 같이 썼더니 lr이 한 번도 줄지 않았다. 왜인가?',
      o: ['factor가 0.5라서', 'TensorBoard가 lr을 고정해서', 'lr을 낮추기 전에 EarlyStopping이 먼저 멈춰서'], a: 2,
      why: '정체가 3에폭 이어지면 EarlyStopping이 먼저 학습을 끝낸다. lr을 먼저 낮추려면 ReduceLROnPlateau의 patience를 더 짧게 잡는다.' },
  ];

  R.page({ title: '콜백으로 fit에 끼어들기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
