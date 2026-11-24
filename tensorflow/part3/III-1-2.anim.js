/* III-1-2 커스텀 학습 루프 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: 검증 정확도 곡선(earlyStop.series)은 페이지의 예시 값, reset 누락 곡선(resetDemo)은 MNIST 6,000장으로 실제 돌린 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, cells, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const hsh = (i) => { const s = Math.sin((i + 1) * 78.233) * 43758.5453; return s - Math.floor(s); };

  // 배치 타일 (작은 격자 = 이미지 묶음)
  function tile(cx, cy, s, col, o) { o = o || {}; if (s <= 0) return; const g = R.G(cx, cy, s, o.op);
    el('rect', { x: -20, y: -20, width: 40, height: 40, rx: 5, fill: o.fill || PANEL, stroke: col || INK, 'stroke-width': 2 }, g);
    for (let i = 0; i < 9; i++) el('rect', { x: -14 + (i % 3) * 10, y: -14 + Math.floor(i / 3) * 10, width: 8, height: 8, rx: 1.5, fill: col || INK, opacity: 0.15 + 0.5 * hsh(i + (o.seed || 0)) }, g); }

  // ---------- 1. 루프 설계도 ----------
  const TRK = { y: 210, reset: 110, b0: 210, bN: 8, bw: 50, val0: 650, log: 860 };
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const ING = [['model', 'build_model()', INK], ['optimizer', 'Adam(1e-3)', GOOD], ['loss_fn', 'SparseCCE', WARN], ['train_ds', 'Dataset', INFO], ['val_ds', 'Dataset', INFO], ['EPOCHS', '20', ACC]];
      ING.forEach(([a, b, col], i) => { const x = 150 + (i % 3) * 330, y = 120 + Math.floor(i / 3) * 120, s = pop(u, 0.2 + i * 0.25);
        card(x, y, 200, 70, { rx: 10, stroke: col, s, text: a + '\n' + b, fs: 15, mono: true });
        if (i === 3 || i === 4) for (let j = 0; j < 3; j++) tile(x + 130 + j * 10, y - 6 + j * 6, s * 0.7, INFO, { seed: j }); });
      note(110, 380, '전부 루프 밖에서 한 번만 만든다', fade(u, 2.0), { fill: ACC }); return; }
    // 에폭 순회: 위로 돌아가는 큰 화살표 + 20칸
    const eu = k === 1 ? E(u, 0.2, 1.4) : 1;
    el('path', { d: `M${TRK.log + 40},${TRK.y - 36} C${TRK.log + 40},70 ${TRK.reset - 40},70 ${TRK.reset - 40},${TRK.y - 36}`, fill: 'none', stroke: ACC, 'stroke-width': 3, pathLength: 100, 'stroke-dasharray': `${eu * 100} 100`, 'marker-end': eu >= 1 ? 'url(#ra-ahb)' : null });
    mono(480, 64, 'for epoch in range(EPOCHS)', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 0.8) : 1 });
    const cur = k === 1 ? Math.floor(E(u, 0.4, 2.4) * 3) : 0;
    for (let i = 0; i < 20; i++) el('rect', { x: 300 + i * 18, y: 116, width: 14, height: 14, rx: 3, fill: i === cur ? ACC : i < cur ? ACCBG : PANEL, stroke: i === cur ? ACC : GRID });
    mono(680, 128, `epoch ${cur} / 20`, { 'font-size': 14, fill: MUT });
    el('line', { x1: TRK.reset - 40, y1: TRK.y, x2: TRK.log + 40, y2: TRK.y, stroke: GRID, 'stroke-width': 3, opacity: eu });
    if (k === 1) { sub(480, 300, '데이터셋 전체를 20번 훑는 바깥 반복문', fade(u, 1.8), { 'font-size': 15 }); return; }
    // reset 자리
    const rs = k === 2 ? pop(u, 0.3) : 1;
    card(TRK.reset, TRK.y, 80, 66, { rx: 8, dash: k < 3 ? '5 4' : null, stroke: WARN, fill: WARNBG, s: rs, text: 'reset', fs: 15, color: WARN });
    if (k === 2) { note(60, 300, '에폭 시작 자리에 리셋을 먼저 잡아 둔다 (코드는 Step 3)', fade(u, 1.2), { fill: WARN }); return; }
    // 배치 순회 + train_step
    for (let i = 0; i < TRK.bN; i++) tile(TRK.b0 + i * TRK.bw, TRK.y, k === 3 ? pop(u, 0.1 + i * 0.08) : 1, INFO, { seed: i * 3 });
    card(TRK.b0 + 3.5 * TRK.bw, 320, 220, 50, { rx: 10, text: 'loss = train_step(x, y)', fs: 14.5, mono: true, stroke: ACC, fill: ACCBG, s: k === 3 ? pop(u, 0.9) : 1 });
    const bi = k === 3 ? Math.min(TRK.bN - 1, Math.floor(E(u, 0.9, 2.6) * TRK.bN)) : -1;
    if (bi >= 0) { const x = TRK.b0 + bi * TRK.bw; el('rect', { x: x - 24, y: TRK.y - 24, width: 48, height: 48, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 3 }); grow(x, TRK.y + 26, TRK.b0 + 3.5 * TRK.bw, 294, 1, ACC); }
    mono(TRK.b0 - 24, TRK.y - 40, 'for x, y in train_ds', { 'font-size': 14.5, 'font-weight': 700, fill: INFO });
    if (k === 3) { sub(TRK.b0 + 3.5 * TRK.bw, 384, '배치마다 한 번 — III-1-1 의 tape 한 스텝이 여기 들어간다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // 검증
    for (let i = 0; i < 3; i++) tile(TRK.val0 + i * 46, TRK.y, k === 4 ? pop(u, 0.2 + i * 0.15) : 1, GOOD, { seed: 40 + i });
    mono(TRK.val0 - 22, TRK.y - 40, 'val_ds', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD });
    card(TRK.val0 + 46, 320, 130, 50, { rx: 10, text: 'eval_step', fs: 14.5, mono: true, stroke: GOOD, s: k === 4 ? pop(u, 0.8) : 1 });
    if (k === 4) { R.lock(TRK.val0 + 140, 320, true, GOOD, pop(u, 1.3)); note(560, 390, '갱신 없이 재기만 한다 · 에폭마다 한 번', fade(u, 1.6), { fill: GOOD }); return; }
    // 로깅
    terminal(TRK.log - 76, 280, 170, 90, ['epoch 0: ...'], E(u, 0.3, 1.2), { fs: 13.5 });
    card(TRK.log, TRK.y, 74, 50, { rx: 8, text: 'print', fs: 14.5, mono: true, stroke: INK, s: pop(u, 0.2) });
    banner(400, 392, 'fit() 은 이 여섯 블록을 대신 조립해 돌렸다', pop(u, 1.6)); }

  // ---------- 2. @tf.function train_step ----------
  const FN = ['@tf.function', 'def train_step(x, y):', '  with GradientTape() as tape:', '    logits = model(x, training=True)', '    loss = loss_fn(y, logits)', '  grads = tape.gradient(loss, vars)', '  optimizer.apply_gradients(...)', '  return loss, logits'];
  const LINE_OF = [2, 3, 4, 5, 6, 7];
  function gnode(x, y, s, col, sc, o) { o = o || {}; card(x, y, tw(s, 14) + 26, 38, { rx: 19, text: s, fs: 14, mono: true, fw: 700, stroke: col, color: col, fill: o.fill || PANEL, s: sc }); }
  function dropIcon(x, y, on, s) { for (let i = 0; i < 6; i++) { const cx = x + (i % 3) * 18, cy = y + Math.floor(i / 3) * 18, off = on && (i === 1 || i === 3 || i === 5);
      el('circle', { cx, cy, r: 6 * s, fill: off ? PANEL : INFO, stroke: off ? OFF : INFO, 'stroke-width': 2 }); if (off && s > 0.5) cross(cx, cy, 5, 1); } }
  function s2(t, c) { const { k, u } = c, n = (c.beat.stepFlow || []).length;
    if (k <= 5) {
      // 왼쪽: 파이썬 함수
      zone(24, 40, 400, 250, '파이썬 함수', { fill: SOFT });
      FN.forEach((s, i) => { const hot = (k === 0 && i <= 2) || (k > 0 && i === LINE_OF[n - 1]);
        if (hot) el('rect', { x: 30, y: 58 + i * 27, width: 388, height: 25, rx: 4, fill: ACCBG });
        mono(40, 76 + i * 27, s, { 'font-size': 14, fill: i === 0 ? ACC : INK, 'font-weight': i === 0 ? 800 : 500 }); });
      // 오른쪽: 그래프
      zone(450, 40, 490, 250, '그래프 (첫 호출 때 추적)', { fill: PANEL, stroke: GRID, sw: 1.5 });
      if (k === 0) { sub(695, 170, '아직 호출 전 — 그래프가 없다', fade(u, 0.8), { 'font-size': 15 }); grow(424, 165, 450, 165, E(u, 1.2, 1.6), ACC); }
      if (n >= 2) { gnode(540, 100, 'model', INFO, k === 1 ? pop(u, 0.3) : 1); dropIcon(500, 128, true, k === 1 ? pop(u, 0.8) : 1);
        mono(560, 160, 'training=True 굳음', { 'font-size': 13.5, fill: WARN, opacity: k === 1 ? fade(u, 1.4) : 1 }); }
      if (n >= 3) { grow(586, 100, 676, 100, k === 2 ? E(u, 0.2, 0.6) : 1, MUT); gnode(730, 100, 'loss_fn', WARN, k === 2 ? pop(u, 0.5) : 1);
        grow(784, 100, 836, 100, k === 2 ? E(u, 0.8, 1.1) : 1, MUT); el('circle', { cx: 870, cy: 100, r: 22 * (k === 2 ? pop(u, 1.1) : 1), fill: WARNBG, stroke: WARN, 'stroke-width': 2.4 }); mono(870, 105, 'loss', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 800 }); }
      if (n >= 4) { grow(870, 124, 870, 186, k === 3 ? E(u, 0.2, 0.7) : 1, BAD, { dash: '5 4' }); gnode(870, 210, 'grads', BAD, k === 3 ? pop(u, 0.7) : 1);
        if (k === 3) dot([[870, 100], [870, 210]], E(u, 0.2, 1.0), BAD, 6); }
      if (n >= 5) { grow(826, 210, 720, 210, k === 4 ? E(u, 0.2, 0.6) : 1, GOOD); gnode(660, 210, 'apply', GOOD, k === 4 ? pop(u, 0.6) : 1);
        grow(620, 210, 560, 210, k === 4 ? E(u, 0.8, 1.2) : 1, GOOD); cells(470, 192, ['W', 'b'], { w: 38, h: 36, style: () => ({ stroke: GOOD, color: GOOD, fill: k === 4 && u > 1.2 && u < 2.2 ? GOODBG : PANEL }) }); }
      if (n >= 6) { gnode(700, 266, 'return loss, logits', ACC, k === 5 ? pop(u, 0.3) : 1); }
      if (k < 5) { if (k >= 1) sub(695, 330, ['', 'model 호출이 그래프 노드로 기록된다', 'loss 가 이 그래프의 끝점', '역전파 노드가 붙는다 · grads 수 = 변수 수', '여기까지가 한 스텝 그래프의 전부'][k], fade(u, 1.6), { 'font-size': 15 }); return; }
      // 호출 타임라인
      tx(24, 336, '호출', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const bars = [[200, '1번째: 추적(trace)', WARN]].concat([1, 2, 3, 4, 5].map((i) => [36, '', ACC]));
      let x = 70; bars.forEach(([w, s, col], i) => { const g = E(u, 0.6 + i * 0.25, 0.9 + i * 0.25); el('rect', { x, y: 322, width: w * g, height: 22, rx: 4, fill: col, opacity: 0.85 }); if (s) tx(x + 8, 372, s, { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: g }); x += w + 8; });
      tx(320, 372, '2번째부터: 같은 그래프 재사용 (빠름)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      sub(800, 400, '막대 길이는 개념도', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    if (k === 6) { // eval_step: 쌍둥이 그래프
      zone(30, 40, 430, 280, 'train_step 그래프', { fill: SOFT });
      zone(500, 40, 430, 280, 'eval_step 그래프', { fill: GOODBG, stroke: GOOD, sw: 2, color: GOOD, op: fade(u, 0.2) });
      [['model(training=True)', INFO], ['loss_fn', WARN], ['tape.gradient', BAD], ['apply_gradients', GOOD]].forEach(([s, col], i) => gnode(245, 90 + i * 58, s, col, 1));
      dropIcon(390, 82, true, 1);
      [['model(training=False)', INFO], ['loss_fn', WARN]].forEach(([s, col], i) => gnode(715, 90 + i * 58, s, col, pop(u, 0.4 + i * 0.3)));
      dropIcon(880, 82, false, pop(u, 0.7));
      ['tape.gradient', 'apply_gradients'].forEach((s, i) => { const y = 206 + i * 58; gnode(715, y, s, OFF, pop(u, 1.0 + i * 0.2)); cross(715, y, 14, pop(u, 1.4 + i * 0.2)); });
      note(30, 370, 'training 플래그는 그래프에 굳는다 → 함수를 둘로 나눈다', fade(u, 1.9)); return; }
    // k7: 루프 전체가 아니라 한 스텝에만
    zone(30, 40, 900, 330, '파이썬 (eager) — for epoch · print · if 조기 종료', { fill: SOFT, op: fade(u, 0.1) });
    el('path', { d: 'M120,260 C120,110 840,110 840,260', fill: 'none', stroke: MUT, 'stroke-width': 3, 'stroke-dasharray': '6 5', 'marker-end': 'url(#ra-ah)', opacity: fade(u, 0.3) });
    card(480, 250, 300, 110, { rx: 12, fill: ACCBG, stroke: ACC, sw: 2.6, s: pop(u, 0.6) });
    mono(480, 236, '@tf.function', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) });
    mono(480, 266, 'train_step (그래프)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
    pill(150, 330, 'print(...)', MUT, pop(u, 1.2), { mono: true, fs: 14 }); pill(810, 330, 'if patience: break', MUT, pop(u, 1.4), { mono: true, fs: 14 });
    note(60, 404, '매 배치 반복되는 순수 텐서 연산에만 붙인다', fade(u, 2.0), { fill: ACC }); }

  // ---------- 3. 메트릭 생명주기 ----------
  function jar(x, y, name, lv, lines, o) { o = o || {}; const h = 150, w = 130;
    el('path', { d: `M${x},${y} V${y + h} Q${x},${y + h + 10} ${x + 10},${y + h + 10} H${x + w - 10} Q${x + w},${y + h + 10} ${x + w},${y + h} V${y}`, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2.4, opacity: o.op ?? 1 });
    if (lv > 0.005) el('rect', { x: x + 4, y: y + h + 6 - (h - 4) * lv, width: w - 8, height: (h - 4) * lv, rx: 4, fill: o.col || INK, opacity: 0.25 });
    mono(x + w / 2, y - 14, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: o.col || INK, opacity: o.op ?? 1 });
    lines.forEach((s, i) => mono(x + w / 2, y + 60 + i * 26, s, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: o.op ?? 1 })); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 4) {
      const JL = { x: 70 }, JA = { x: 260 };
      const nb = k === 3 ? Math.floor(E(u, 0.3, 2.3) * 5) : k === 4 ? 5 : 0, drain = k === 2 ? 1 - E(u, 0.4, 1.4) : 0;
      const lvL = k === 2 ? 0.55 * drain : nb * 0.11, lvA = k === 2 ? 0.7 * drain : nb * 0.15;
      jar(JL.x, 110, 'train_loss', lvL, k === 2 && drain > 0.5 ? ['total …', 'count …'] : [`total ${nb ? 'Σloss' : 0}`, `count ${nb}`], { col: WARN, op: k === 0 ? fade(u, 0.3) : 1 });
      if (k >= 1) jar(JA.x, 110, 'train_acc', lvA, k === 2 && drain > 0.5 ? ['맞힘 …', '전체 …'] : [`맞힘 ${nb ? '…' : 0}`, `전체 ${nb * 32}`], { col: INFO, op: k === 1 ? fade(u, 0.3) : 1 });
      mono(135, 310, 'Mean()', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); if (k >= 1) mono(325, 310, 'SparseCatAcc()', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      // 생명주기 바퀴
      const PH = [['reset_state', '에폭 시작', WARN], ['update_state', '배치마다', INFO], ['result', '에폭 끝', GOOD]], act = [null, null, 0, 1, 2][k];
      PH.forEach(([a, b, col], i) => { const x = 560 + i * 140, y = 120, on = act !== null && i <= act;
        card(x, y, 124, 60, { rx: 10, stroke: on ? col : GRID, fill: i === act ? col : PANEL, text: a + '\n' + b, fs: 13.5, mono: true, color: i === act ? PANEL : on ? col : OFF, s: i === act && k >= 2 ? pop(u, 0.2) : 1 });
        if (i) grow(x - 78, y, x - 64, y, on ? 1 : 0, MUT); });
      if (k <= 1) { note(500, 240, k === 0 ? '손실 평균 누적기 — 루프 밖에서 한 번만 만든다' : '정수 라벨 + logits → 맞힌 비율 누적', fade(u, 0.9));
        if (k === 1) sub(700, 276, '원-핫 라벨이면 CategoricalAccuracy', fade(u, 1.6), { 'font-size': 14.5 }); return; }
      if (k === 2) { note(500, 240, '지난 에폭 값을 0 으로 비운다', fade(u, 1.2), { fill: WARN }); sub(700, 276, '에폭 루프 "안" 맨 앞이어야 한다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
      if (k === 3) { for (let i = 0; i < 5; i++) { const at = 0.3 + i * 0.4; const f = E(u, at, at + 0.35); if (f > 0 && f < 1) { el('circle', { cx: 135, cy: lerp(40, 230, f), r: 7, fill: WARN }); el('circle', { cx: 325, cy: lerp(40, 230, f), r: 7, fill: INFO }); } }
        note(500, 240, '배치마다 이번 결과를 넣는다 (반환값 없음)', fade(u, 1.0), { fill: INFO }); return; }
      // k4: result → 로그
      terminal(500, 220, 420, 110, ['epoch 0: loss=0.618 acc=0.838'], E(u, 0.5, 1.6), { title: 'print', fs: 14.5 });
      sub(710, 360, 'MNIST 6,000장 실행 예 (6에폭 중 첫 에폭)', fade(u, 1.8), { 'font-size': 14 }); return; }
    // k5: reset 을 잊으면 — 실제 실행 곡선
    const d = c.beat.resetDemo; if (!d) return;
    const ax = R.axes(110, 50, 520, 290, { x: [0, 5], y: [0.82, 1], xt: [0, 1, 2, 3, 4, 5], yt: [0.85, 0.9, 0.95, 1], xl: 'epoch', yl: 'train_acc', grid: true });
    const lu = E(u, 0.2, 1.8);
    R.line(ax, d.acc.map((v, i) => [i, v]), lu, GOOD, { sw: 3 }); R.line(ax, d.accNoReset.map((v, i) => [i, v]), lu, BAD, { sw: 3, dash: '7 5' });
    if (lu >= 1) { mono(ax.X(5) + 10, ax.Y(0.976) + 5, '0.976', { 'font-size': 15, 'font-weight': 800, fill: GOOD }); mono(ax.X(5) + 10, ax.Y(0.937) + 5, '0.937', { 'font-size': 15, 'font-weight': 800, fill: BAD }); }
    note(700, 120, 'reset 함', fade(u, 0.5), { fill: GOOD }); note(700, 150, '에폭마다의 실제 정확도', fade(u, 0.6), { fill: MUT, 'font-size': 14 });
    note(700, 210, 'reset 잊음', fade(u, 1.0), { fill: BAD }); note(700, 240, '1에폭부터 누적한 평균', fade(u, 1.1), { fill: MUT, 'font-size': 14 });
    sub(780, 330, 'MNIST 6,000장 · 6에폭 실행값', fade(u, 2.0), { 'font-size': 14 });
    banner(370, 404, '곡선이 실제보다 완만하게 보인다', pop(u, 2.2)); }

  // ---------- 4. 검증과 조기 종료 ----------
  function s4(t, c) { const { k, u } = c, es = c.beat.earlyStop || { series: [], patienceLimit: 3 }, S = es.series, pS = (c.prev && c.prev.earlyStop && c.prev.earlyStop.series) || [];
    const ax = R.axes(80, 60, 420, 260, { x: [0, 7], y: [0.6, 0.85], xt: [0, 1, 2, 3, 4, 5, 6], yt: [0.6, 0.7, 0.8], xl: 'epoch', yl: 'val_acc (예시 값)', grid: true });
    const newFrom = pS.length, pts = S.map((p, i) => [p.epoch, p.val]);
    const lu = S.length > newFrom ? E(u, 0.3, 1.6) : 1, shown = newFrom + (S.length - newFrom) * lu;
    if (pts.length > 1) R.line(ax, pts, clamp((shown - 1) / (pts.length - 1)), INFO);
    S.forEach((p, i) => { const s = i < newFrom ? 1 : clamp((shown - i) * 2); if (s <= 0) return;
      el('circle', { cx: ax.X(p.epoch), cy: ax.Y(p.val), r: 6 * s, fill: p.best ? GOOD : p.fired ? BAD : WARN });
      if (s >= 1) mono(ax.X(p.epoch), ax.Y(p.val) + (p.best ? -12 : 22), p.val.toFixed(2), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: p.best ? GOOD : WARN }); });
    // 오른쪽 상태판
    const best = S.filter((p, i) => p.best && i < Math.ceil(shown)).reduce((m, p) => Math.max(m, p.val), 0);
    const lastShown = S[Math.min(S.length, Math.ceil(shown)) - 1], pat = lastShown ? lastShown.patience : 0;
    zone(560, 50, 370, 200, '상태', { fill: SOFT });
    mono(580, 104, `best_val_acc = ${best.toFixed(2)}`, { 'font-size': 16, 'font-weight': 800, fill: GOOD });
    mono(580, 146, 'patience', { 'font-size': 16, 'font-weight': 800 });
    for (let i = 0; i < es.patienceLimit; i++) el('rect', { x: 690 + i * 44, y: 126, width: 36, height: 28, rx: 5, fill: i < pat ? BAD : PANEL, stroke: i < pat ? BAD : GRID, 'stroke-width': 2 });
    mono(830, 146, `/ ${es.patienceLimit}`, { 'font-size': 15, fill: MUT });
    if (k === 0) { note(580, 200, 'val_loss · val_acc 누적기도 따로 만든다', fade(u, 0.8)); sub(290, 200, '아직 검증 전', fade(u, 0.5), { 'font-size': 15 }); return; }
    if (k === 1) { note(580, 200, '에폭마다 val 누적기를 0 으로', fade(u, 0.8), { fill: WARN }); return; }
    if (k === 2) { // training=False
      tx(580, 300, 'training=True', { 'font-size': 14.5, 'font-weight': 700, fill: WARN }); dropIcon2(760, 290, true);
      tx(580, 350, 'training=False', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) }); dropIcon2(760, 340, false, fade(u, 0.6));
      note(580, 200, 'Dropout OFF · BN 은 이동평균', fade(u, 1.2), { fill: GOOD }); sub(740, 400, '갱신 없이 재기만 한다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 3) { note(580, 200, '검증 배치마다 update_state', fade(u, 0.8), { fill: INFO }); return; }
    // 체크포인트 파일
    const fileS = k === 4 ? pop(u, 1.4) : 1, fx = 640, fy = 330;
    el('path', { d: `M${fx - 26},${fy - 32} h36 l16,16 v48 h-52 Z`, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.4, opacity: fileS });
    mono(fx + 40, fy + 6, 'best.weights.h5', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fileS });
    if (k === 4) { note(580, 200, '개선 → 저장하고 patience 0', fade(u, 1.0), { fill: GOOD }); grow(ax.X(3) + 10, ax.Y(0.8), fx - 30, fy - 10, E(u, 0.9, 1.4), GOOD); return; }
    if (k === 5) { mono(ax.X(5), ax.Y(0.8) + 80, '0.80 = best → 정체', { 'font-size': 13.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      if (shown >= S.length - 0.01) { banner(290, 392, '조기 종료 @ epoch 6', pop(u, 1.9)); } note(580, 200, '넘지 못하면 정체로 센다', fade(u, 0.6), { fill: BAD }); return; }
    // k6: best 가중치 복원
    el('circle', { cx: ax.X(3), cy: ax.Y(0.8), r: 14, fill: 'none', stroke: GOOD, 'stroke-width': 3 });
    grow(fx - 30, fy - 30, ax.X(3) + 14, ax.Y(0.8) + 10, E(u, 0.4, 1.2), GOOD);
    mono(580, 200, 'model.load_weights(...)', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) });
    sub(745, 236, '= restore_best_weights=True', fade(u, 1.6), { 'font-size': 14.5 }); }
  function dropIcon2(x, y, on, op) { for (let i = 0; i < 6; i++) { const cx = x + i * 22, off = on && i % 2 === 1;
      el('circle', { cx, cy: y, r: 8, fill: off ? PANEL : INFO, stroke: off ? OFF : INFO, 'stroke-width': 2, opacity: op ?? 1 }); if (off) cross(cx, y, 6, 1); } }

  // ---------- 5. 완성 루프 ----------
  const SEC = [['reset', 80, WARN], ['train', 300, ACC], ['validate', 170, GOOD], ['log', 100, INK], ['early stop', 130, BAD]];
  function track(lit, u, k) { let x = 70; SEC.forEach(([s, w, col], i) => { const on = lit.includes(i), now = i === lit[lit.length - 1] && k >= 1 && k <= 5;
      el('rect', { x, y: 150, width: w - 6, height: 56, rx: 8, fill: on ? (now ? col : PANEL) : SOFT, stroke: on ? col : GRID, 'stroke-width': now ? 3 : 2 });
      mono(x + (w - 6) / 2, 184, s, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: on ? (now ? PANEL : col) : OFF });
      if (i === 1 && on) for (let j = 0; j < 6; j++) el('rect', { x: x + 14 + j * 46, y: 214, width: 30, height: 14, rx: 3, fill: INFO, opacity: 0.3 + 0.1 * j });
      x += w; });
    el('path', { d: 'M850,160 C850,80 80,80 80,150', fill: 'none', stroke: MUT, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', 'marker-end': 'url(#ra-ah)' });
    mono(465, 84, 'for epoch in range(epochs)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 6) {
      if (k === 0) { card(480, 90, 640, 50, { rx: 10, text: 'def train(model, train_ds, val_ds, epochs=20, patience_limit=3)', fs: 14.5, mono: true, stroke: ACC, s: pop(u, 0.3) });
        pill(380, 170, 'best_val_acc = 0.0', GOOD, pop(u, 1.0), { mono: true, fs: 14.5 }); pill(600, 170, 'patience = 0', BAD, pop(u, 1.3), { mono: true, fs: 14.5 });
        note(220, 270, 'fit() 이 인자로 받던 것이 함수 인자가 된다', fade(u, 1.8)); return; }
      const lit = [[], [0], [0, 1], [0, 1, 2], [0, 1, 2, 3], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4]][k];
      track(lit, u, k);
      const MSG = ['', 'for m in (train_loss, train_acc): m.reset_state()', 'train_step(x, y) → train 메트릭 update', 'val reset → eval_step → val 메트릭 update', 'print(f"e{epoch} loss=… acc=… val=…")', 'v > best ? 저장 : patience+1 → 한계면 break', ''];
      if (k <= 5) mono(480, 290, MSG[k], { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      if (k === 1) sub(480, 330, '이 한 줄이 빠지면 전체 학습이 조용히 틀어진다', fade(u, 1.4), { 'font-size': 15 });
      if (k === 2) { dot([[84, 221], [370, 221]], E(u, 0.6, 2.2), ACC, 7); sub(480, 330, 'GAN 이면 이 자리에서 train_step 을 두 번 부른다', fade(u, 1.6), { 'font-size': 15 }); }
      if (k === 3) sub(480, 330, '학습 리셋과 검증 리셋은 자리가 다르다', fade(u, 1.4), { 'font-size': 15 });
      if (k === 4) sub(480, 330, '이 자리에는 무엇이든 끼울 수 있다 — 기울기 노름, 커스텀 지표', fade(u, 1.4), { 'font-size': 15 });
      if (k === 5) { [['저장', GOOD], ['patience+1', WARN], ['break', BAD]].forEach(([s, col], i) => { grow(810, 210, 700 + i * 110, 360, E(u, 0.5 + i * 0.3, 0.9 + i * 0.3), col); pill(700 + i * 110, 380, s, col, pop(u, 0.9 + i * 0.3), { fs: 14 }); }); }
      if (k === 6) { card(480, 330, 360, 54, { rx: 10, text: 'load_weights(best) → return best_val_acc', fs: 14.5, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 0.4) });
        banner(480, 404, 'fit(validation_data, callbacks=[...]) 와 같은 일', pop(u, 1.4)); }
      return; }
    // k7: 언제 무엇을
    const PL = c.beat.pickList || [];
    PL.forEach((p, i) => { const y = 70 + i * 76, s = pop(u, 0.2 + i * 0.35), fit = p.tone === 'fit';
      card(370, y, 600, 58, { rx: 10, stroke: fit ? GOOD : WARN, fill: PANEL, s }); tx(90, y + 6, p.when, { 'font-size': 15, 'font-weight': 700, opacity: s });
      pill(780, y, p.pick, fit ? GOOD : WARN, s, { fs: 15, fill: fit ? GOODBG : WARNBG }); });
    sub(480, 395, 'fit 으로 표현되지 않는 순간이 루프를 여는 신호다', fade(u, 1.8), { 'font-size': 15 }); }

  const quiz = [
    { q: 'fit() 을 펼친 청사진에서 metric.reset_state() 자리는 어디인가?',
      o: ['배치 순회 안, train_step 바로 뒤', '에폭 순회 안 맨 앞, 배치 순회 전', '루프 밖, 재료를 만들 때 한 번'], a: 1,
      why: '리셋은 에폭마다 지난 집계를 비우는 일이라 에폭 루프 맨 앞에 둔다. 루프 밖이면 학습 전체에서 한 번만 비워진다.' },
    { q: '@tf.function 을 루프 전체가 아니라 train_step 에 붙이는 이유는 무엇인가?',
      o: ['매 배치 반복되는 텐서 연산만 그래프로 돌리고 print·if 같은 파이썬 제어는 eager 로 두려고', 'train_step 에 붙여야 기울기를 계산할 수 있어서', '루프 전체에 붙이면 GradientTape 를 쓸 수 없어서'], a: 0,
      why: '첫 호출에서 한 번 추적한 그래프를 이후 배치마다 재사용해 빨라진다. 로그·조기 종료 같은 파이썬 제어는 그래프 밖에 둬야 다루기 쉽다.' },
    { q: 'MNIST 6,000장으로 6에폭을 돌릴 때 reset_state() 를 빠뜨리면 6에폭째 train_acc 는 어떻게 찍히는가?',
      o: ['0.976 그대로, 리셋은 속도에만 영향을 준다', '0.838, 첫 에폭 값에 고정된다', '0.937, 1에폭부터 누적한 평균이라 실제 0.976 보다 낮다'], a: 2,
      why: '누적기가 에폭 경계를 넘어 쌓이면 지난 에폭의 낮은 정확도까지 평균에 들어간다. 그래서 곡선이 실제보다 완만해 보인다.' },
    { q: '예시에서 e5 의 val_acc 0.80 이 best 0.80 과 같을 때 코드는 이것을 어떻게 세는가?',
      o: ['개선으로 보고 가중치를 저장한다', '정체로 보고 patience 를 1 올린다', '무시하고 patience 를 그대로 둔다'], a: 1,
      why: '조건이 v > best_val_acc 라서 같은 값은 개선이 아니다. e4·e5·e6 에서 patience 가 3 이 되어 epoch 6 에서 멈춘다.' },
    { q: '표준 이미지 분류 모델을 학습할 때 알맞은 선택은 무엇인가?',
      o: ['model.fit(), 코드가 짧고 검증된 경로라 실수 여지가 적다', '커스텀 루프, 항상 더 정확하다', '커스텀 루프, fit 은 검증을 할 수 없다'], a: 0,
      why: '표준 지도학습이면 fit() 으로 충분하다. GAN·강화학습·다중 옵티마이저처럼 fit 으로 표현되지 않을 때 루프를 연다.' },
  ];

  const summary = [
    'fit 은 에폭 순회 안에 배치 순회를 두고 배치마다 train_step 을 부르는 반복문이다.',
    'train_step 에 @tf.function 을 붙이면 첫 호출에 그래프를 만들고 이후 재사용한다.',
    '메트릭은 에폭 시작에 reset, 배치마다 update, 에폭 끝에 result 순서로 돈다.',
    '검증은 training=False 로 재고, best 를 넘지 못한 에폭이 patience 만큼 쌓이면 멈춘다.',
  ];
  const review = [
    { q: '커스텀 루프로 학습했더니 검증 정확도가 학습 때보다 늘 들쭉날쭉하고 낮다. 먼저 의심할 것은?',
      o: ['eval_step 에서 training=True 로 모델을 불렀다', 'train_step 에 @tf.function 을 붙였다', 'val 메트릭을 Mean 으로 만들었다'], a: 0,
      why: 'training=True 로 검증하면 Dropout 이 켜지고 BatchNorm 이 배치 통계를 써서 값이 흔들리고 낮게 나온다. eval_step 은 training=False 로 부른다.' },
    { q: '학습 정확도 곡선이 에폭마다 점점 덜 오르는데, 같은 모델을 fit 으로 돌리면 훨씬 빨리 오른다. 가장 그럴듯한 원인은?',
      o: ['optimizer 를 루프 밖에서 만들었다', '에폭 시작의 reset_state() 가 빠져 누적 평균이 찍힌다', 'eval_step 을 별도 함수로 나눴다'], a: 1,
      why: '리셋이 없으면 메트릭이 1에폭부터 누적돼 6에폭째 실제 0.976 이 0.937 로 찍히는 식으로 완만해진다.' },
    { q: '수동 조기 종료 코드에서 매 에폭 save_weights 를 부르고 끝에 load_weights 를 했다. 무엇이 문제인가?',
      o: ['저장 파일 이름에 .weights.h5 가 붙어서', 'patience 를 0 으로 되돌리지 않아서', '마지막 에폭 가중치가 남아 best 시점으로 돌아가지 못한다'], a: 2,
      why: '저장은 개선된 순간에만 해야 한다. 매 에폭 저장하면 마지막, 더 나쁠 수 있는 가중치가 복원된다.' },
  ];

  RA.page({ title: '커스텀 학습 루프 — 에폭·배치·메트릭을 손으로 돌린다', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
