/* II-2-2 학습 루프 직접 쓰기 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   손실 곡선 숫자는 예시 실행 결과다: 선형 회귀 데이터(학습 512개·검증 128개, 배치 32, seed 0),
   nn.Linear(10, 1) · MSELoss · Adam(lr=0.01) 로 train_one_epoch / evaluate 템플릿을 10 에폭 돌렸다 (venv torch CPU). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, axes, hbar, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 예시 실행 결과 ----------
  const TR = [2.8755, 1.8614, 1.1903, 0.7342, 0.4392, 0.2543, 0.1461, 0.0825, 0.0481, 0.0289];
  const VA = [2.1920, 1.4690, 0.9420, 0.5787, 0.3412, 0.1939, 0.1069, 0.0595, 0.0329, 0.0200];
  function curves(x, y, w, h, n, o) { o = o || {}; const ax = axes(x, y, w, h, { x: [1, 10], y: [0, 3], xt: [1, 5, 10], yt: [0, 1, 2, 3], xl: 'epoch', yl: 'loss', grid: true });
    const pts = (A) => A.slice(0, Math.max(1, Math.ceil(n))).map((v, i) => [i + 1, v]);
    if (o.train !== false) { R.line(ax, pts(TR), n >= 2 ? 1 : 0, ACC, { sw: 2.8 }); pts(TR).forEach(([e, v]) => el('circle', { cx: ax.X(e), cy: ax.Y(v), r: 4.5, fill: ACC })); }
    if (o.val) { R.line(ax, pts(VA), n >= 2 ? 1 : 0, GOOD, { sw: 2.8, dash: '7 5' }); pts(VA).forEach(([e, v]) => el('circle', { cx: ax.X(e), cy: ax.Y(v), r: 4.5, fill: GOOD })); }
    return ax; }
  // Dropout 이 낀 작은 신경망: drop(i) 이 참이면 꺼진 뉴런
  function tinyNet(cx, cy, drop, o) { o = o || {}; const cols = [[-70, 3], [0, 5], [70, 1]];
    const pos = cols.map(([dx, n]) => Array.from({ length: n }, (_, i) => [cx + dx, cy + (i - (n - 1) / 2) * 26]));
    pos.slice(0, -1).forEach((col, li) => col.forEach((p, a) => pos[li + 1].forEach((q, b) => { const off = li === 0 ? drop(b) : drop(a); el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: off ? SOFT : GRID, 'stroke-width': 1.4 }); })));
    pos.forEach((col, li) => col.forEach(([x, y], i) => { const off = li === 1 && drop(i); el('circle', { cx: x, cy: y, r: 9, fill: off ? PANEL : li === 2 ? ACC : ACCBG, stroke: off ? OFF : ACC, 'stroke-width': 2, 'stroke-dasharray': off ? '3 3' : null }); }));
    if (o.name) tx(cx, cy + 90, o.name, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono' }); }
  const modeTag = (x, y, mode, op) => pill(x, y, mode === 'train' ? 'model.train()' : 'model.eval()', mode === 'train' ? ACC : GOOD, op ?? 1, { mono: true, fs: 14 });

  // =========================================================
  // 1. fit() 한 줄 vs 루프 열 줄
  // =========================================================
  function s1(t, c) { const { k, u } = c, cmp = c.beat.compare || { keras: [], torch: [] }, pcmp = (c.prev && c.prev.compare) || { torch: [] };
    // 왼쪽: Keras
    zone(24, 30, 400, 360, 'Keras', { stroke: INFO, fill: PANEL });
    cmp.keras.forEach((s, i) => mono(44, 76 + i * 24, s, { 'font-size': 14, fill: s.startsWith('#') ? MUT : INK, opacity: k === 1 ? fade(u, 0.2 + i * 0.12) : 1 }));
    if (k >= 1) { const g = R.G(224, 345, k === 1 ? pop(u, 1.6) : 1); el('rect', { x: -150, y: -34, width: 300, height: 68, rx: 10, fill: INK }, g);
      tx(0, -4, 'fit() 안에서 무슨 일이?', { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }, g); tx(0, 20, '보이지 않는다', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'middle' }, g); }
    // 오른쪽: PyTorch — 이전 beat 까지의 줄은 바로, 새 줄은 타이핑
    zone(450, 30, 486, 360, 'PyTorch', { stroke: ACC, fill: PANEL });
    const old = pcmp.torch.length;
    cmp.torch.forEach((s, i) => { const op = i < old ? 1 : fade(u, 0.3 + (i - old) * 0.3); mono(470, 76 + i * 24, s, { 'font-size': 14, fill: s.startsWith('#') ? (i ? GOOD : MUT) : INK, 'font-weight': s.includes('backward') || s.includes('step') ? 800 : 400, opacity: op }); });
    if (k === 0) { sub(224, 250, '같은 학습을', fade(u, 0.6), { 'font-size': 16, fill: INK, 'font-weight': 700 }); sub(693, 250, '두 프레임워크로 나란히', fade(u, 1.0), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { [['model', 'nn.Linear(10, 1)', ACC], ['loss_fn', 'nn.MSELoss()', WARN], ['optimizer', 'Adam(lr=1e-3)', INFO]].forEach(([a, b, col], i) => {
        const s = pop(u, 0.4 + i * 0.4); card(540 + i * 150, 230, 136, 70, { rx: 10, stroke: col, sw: 2.2, s }); tx(540 + i * 150, 222, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.5 + i * 0.4) });
        mono(540 + i * 150, 246, b, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); });
      sub(693, 320, 'compile 단계 없이 그냥 변수 셋', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) return;
    if (k >= 3) { // 에폭·배치 눈금
      const by = 320; tx(470, by - 6, 'epoch', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      for (let e = 0; e < 10; e++) { const on = k > 3 || E(u, 0.4 + e * 0.1, 0.6 + e * 0.1) > 0.5; el('rect', { x: 530 + e * 38, y: by - 22, width: 32, height: 22, rx: 4, fill: on ? ACC : SOFT, opacity: on ? 0.75 : 1 }); }
      tx(470, by + 34, 'batch', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      for (let b = 0; b < 32; b++) { const on = ((u * 10) | 0) % 32 >= b; el('rect', { x: 530 + b * 11.8, y: by + 16, width: 9, height: 22, rx: 2, fill: on ? INFO : SOFT, opacity: on ? 0.7 : 1 }); } }
    if (k === 3) { sub(224, 400, 'fit(epochs=10, batch_size=32) 의 정체 = for 두 줄', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { sub(693, 400, 'II-2-1 의 3박자가 배치 루프 안에 그대로', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    // k5: 고칠 수 있는 자리 표시
    [[124, '로그'], [148, '손실 조합'], [172, '갱신 조건']].forEach(([y, s], i) => { const p = pop(u, 0.4 + i * 0.4); if (p <= 0) return; el('circle', { cx: 462, cy: y - 5, r: 6 * p, fill: WARN }); mono(920, y, '+ ' + s, { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.4) }); }); }

  // =========================================================
  // 2. 표준 루프 조립 — DataLoader 에서 배치를 꺼내 3박자
  // =========================================================
  const DROPS = [[1, 3], [0, 2, 4], [2, 3], [1, 4]];
  function dataBar(x, y, cut, o) { o = o || {}; const w = 440, n = 16, bw = w / n;
    tx(x, y - 10, 'train_loader.dataset — 512개', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    el('rect', { x, y, width: w, height: 28, rx: 5, fill: INFO, opacity: 0.25 });
    for (let i = 1; i < n; i++) if (cut > i / n) el('line', { x1: x + i * bw, y1: y - 3, x2: x + i * bw, y2: y + 31, stroke: PANEL, 'stroke-width': 3 });
    if (o.taken != null) for (let i = 0; i < o.taken; i++) el('rect', { x: x + i * bw + 2, y: y + 2, width: bw - 4, height: 24, rx: 3, fill: INFO, opacity: 0.7 });
    if (cut >= 1) mono(x + w, y + 48, '배치 32 × 16', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'end', 'font-weight': 700 }); }
  function s2(t, c) { const { k, u } = c;
    const ep = k >= 1 ? 1 : 0;
    // 공통: 모델(학습 모드) 와 누적기
    const dset = DROPS[Math.floor(u * 2.2) % 4], drop = (i) => dset.includes(i);
    tinyNet(560, 200, drop, { name: 'model' });
    modeTag(560, 70, 'train', k === 0 ? pop(u, 0.3) : 1);
    if (k === 0) { sub(560, 330, 'Dropout 이 매번 다른 뉴런을 끈다 (학습 모드)', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(560, 365, '루프에 들어가기 전에 한 번', fade(u, 1.6), { 'font-size': 14 }); return; }
    mono(40, 60, `epoch ${ep} / num_epochs`, { 'font-size': 16, 'font-weight': 800, fill: ACC });
    // running_loss 누적기
    const RX = 800, rl = k <= 2 ? 0 : k === 3 || k === 4 ? 0 : k === 5 ? lerp(0, 1, E(u, 0.6, 2.0)) : 1;
    tx(RX - 80, 280, 'running_loss', { 'font-size': 14, class: 'mono', 'font-weight': 700, fill: MUT });
    el('rect', { x: RX - 80, y: 292, width: 160, height: 26, rx: 5, fill: SOFT }); el('rect', { x: RX - 80, y: 292, width: 160 * rl, height: 26, rx: 5, fill: WARN, opacity: 0.8 });
    if (k === 1) { mono(RX, 340, '= 0.0', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.6) });
      sub(300, 380, '에폭이 시작될 때마다 누적기를 0 으로', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k >= 2) dataBar(30, 120, k === 2 ? E(u, 0.2, 1.2) : 1, { taken: k === 2 ? 0 : 1 });
    if (k === 2) { fly(57, 134, 300, 210, seg(u, 1.4, 2.3), '(xb, yb)', { mono: true, fill: INFO, stay: true });
      sub(300, 380, 'DataLoader 가 배치를 하나씩 꺼내 준다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { card(300, 210, 96, 30, { rx: 14, text: '(xb, yb)', fs: 13.5, mono: true, stroke: INFO, color: INFO });
      pill(300, 270, 'zero_grad()', GOOD, pop(u, 0.2), { mono: true, fs: 14 });
      dot([[350, 210], [490, 200], [630, 200]], seg(u, 0.6, 1.6), ACC, 8); pill(700, 200, 'pred', INK, pop(u, 1.6), { mono: true, fs: 14 });
      pill(700, 140, 'loss', ACC, pop(u, 2.0), { mono: true, fs: 14 });
      sub(300, 380, '그래프가 생겼을 뿐, 파라미터는 그대로', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { pill(700, 140, 'loss', ACC, 1, { mono: true, fs: 14 });
      dot([[690, 160], [630, 200], [560, 200], [490, 200]], seg(u, 0.2, 1.2), BAD, 8); pill(400, 270, 'backward()', BAD, pop(u, 0.2), { mono: true, fs: 14 });
      pill(400, 310, 'step()', ACC, pop(u, 1.3), { mono: true, fs: 14 }); if (u > 1.5) check(470, 310, 11, pop(u, 1.5));
      sub(300, 380, '배치 하나마다 3박자가 한 바퀴', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { // 텐서째 vs .item()
      const g = E(u, 0.4, 2.2);
      tx(30, 250, 'running_loss += loss', { 'font-size': 14, class: 'mono', fill: BAD, 'font-weight': 700 });
      for (let i = 0; i < Math.round(g * 6); i++) { card(60 + i * 58, 290, 50, 28, { rx: 6, text: 'Add', fs: 13.5, mono: true, stroke: BAD, color: BAD }); if (i) el('line', { x1: 35 + i * 58, y1: 290, x2: 25 + i * 58, y2: 290, stroke: BAD, 'stroke-width': 2 }); }
      sub(200, 335, 'grad_fn 사슬이 계속 붙어 메모리에 남는다', fade(u, 1.2), { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      tx(30, 375, 'running_loss += loss.item() * xb.size(0)', { 'font-size': 14, class: 'mono', fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.4) });
      sub(200, 405, '파이썬 float 하나 — 그래프와 끊긴다', fade(u, 1.8), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); return; }
    // k6: 에폭 평균
    mono(RX, 345, '÷ 512', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3) });
    mono(RX, 385, 'epoch 1: loss=2.8755', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
    sub(300, 380, '예시 실행의 첫 에폭 평균 (배치 크기로 가중)', fade(u, 1.6), { 'font-size': 14 }); }

  // =========================================================
  // 3. 검증 — 두 스위치
  // =========================================================
  function sw(x, y, name, on, col) { el('rect', { x, y, width: 64, height: 32, rx: 16, fill: on ? col : SOFT, stroke: on ? col : GRID, 'stroke-width': 2 });
    el('circle', { cx: on ? x + 48 : x + 16, cy: y + 16, r: 12, fill: PANEL, stroke: GRID });
    mono(x + 76, y + 22, name, { 'font-size': 15, 'font-weight': 700, fill: on ? col : MUT }); }
  function s3(t, c) { const { k, u } = c;
    const A = k >= 1, B = k >= 2;
    sw(40, 40, 'model.eval()', A && (k !== 1 || u > 0.4), GOOD); sw(40, 84, 'torch.no_grad()', B && (k !== 2 || u > 0.4), INFO);
    if (k === 0) { zone(330, 40, 600, 300, 'def evaluate(model, val_loader, loss_fn)', { stroke: GOOD, fill: PANEL });
      R.lock(630, 170, true, GOOD, pop(u, 0.6) * 1.8);
      sub(630, 250, '파라미터를 바꾸지 않는다', fade(u, 1.0), { 'font-size': 16, fill: INK, 'font-weight': 700 });
      sub(630, 285, 'backward · step 이 없다', fade(u, 1.4), { 'font-size': 14 }); return; }
    if (k === 1) { // 같은 입력 세 번
      const TRo = [-0.224, -0.12, -0.319];
      tx(360, 60, '같은 입력 1개를 세 번 넣으면 (Dropout 0.5 가 낀 모델)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      tx(360, 120, 'train 모드', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      TRo.forEach((v, i) => { tinyNet(420 + i * 160, 200, (j) => DROPS[i].includes(j)); mono(420 + i * 160, 300, v.toFixed(3), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3 + i * 0.25) }); });
      tx(360, 350, 'eval 모드', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
      [0, 1, 2].forEach((i) => mono(420 + i * 160, 390, '-0.218', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.6 + i * 0.2) }));
      return; }
    if (k === 2) { const L = (x, y, nodes, col, op) => nodes.forEach(([s, w], i) => { const xx = x + i * 110; card(xx, y, w, 34, { rx: 8, text: s, fs: 13.5, mono: true, stroke: col, op }); if (i) grow(xx - 110 + 35, y, xx - w / 2 - 4, y, 1, col === GRID ? GRID : MUT); });
      tx(360, 150, '평소', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      L(400, 190, [['xb', 50], ['model', 70], ['pred', 60]], INK, 1); mono(730, 196, 'grad_fn = AddmmBackward0', { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      tx(360, 270, 'with torch.no_grad():', { 'font-size': 15, 'font-weight': 800, fill: INFO, class: 'mono', opacity: fade(u, 0.6) });
      L(400, 310, [['xb', 50], ['model', 70], ['pred', 60]], INFO, fade(u, 0.8)); mono(730, 316, 'grad_fn = None', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(640, 390, '그래프를 안 만든다 → 메모리↓ 속도↑ (eval 과는 하는 일이 다르다)', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3 || k === 4 || k === 5) { // 검증 배치 4개
      tx(360, 150, 'val_loader — 128개 = 배치 32 × 4', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      for (let b = 0; b < 4; b++) { const done = k > 3 || E(u, 0.3 + b * 0.45, 0.6 + b * 0.45) > 0.5; el('rect', { x: 360 + b * 70, y: 165, width: 62, height: 30, rx: 5, fill: done ? GOOD : SOFT, opacity: done ? 0.6 : 1 }); }
      if (k === 3) { dot([[390, 210], [560, 260], [700, 260]], (u * 0.8) % 1, INFO, 8); card(560, 260, 90, 40, { rx: 8, text: 'model', fs: 14, mono: true, stroke: GOOD });
        tx(720, 240, 'total_loss += loss.item() * 32', { 'font-size': 14, class: 'mono', fill: INK, opacity: fade(u, 0.8) });
        sub(640, 390, 'forward 만 — backward 도 step 도 없다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      if (k === 4) { tx(360, 240, 'pred.argmax(1) == yb', { 'font-size': 15, class: 'mono', 'font-weight': 700 });
        const win = [0, 2, 1, 2], lab = [0, 2, 2, 2];
        win.forEach((w, s) => { const x0 = 370 + s * 140, g = E(u, 0.4 + s * 0.3, 0.8 + s * 0.3);
          [0.5, 0.2, 0.8].map((_, j) => (j === w ? 0.9 : 0.25 + 0.15 * ((s + j) % 3))).forEach((h, j) => el('rect', { x: x0 + j * 26, y: 340 - 60 * h * g, width: 20, height: 60 * h * g, rx: 3, fill: j === w ? ACC : OFF }));
          if (u > 1.4 + s * 0.15) (w === lab[s] ? check : cross)(x0 + 34, 365, 10, pop(u, 1.4 + s * 0.15)); });
        sub(640, 405, '가장 큰 점수의 클래스가 정답이면 correct += 1 (그림은 예시)', fade(u, 2.0), { 'font-size': 14, fill: INK }); return; }
      card(640, 280, 360, 64, { rx: 12, text: 'return total_loss / n, correct / n', fs: 15, mono: true, stroke: GOOD, s: pop(u, 0.4) });
      sub(640, 350, '(val_loss, val_acc) — 값만 돌려준다', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k6 / k7: 학습·검증 교대
    const n = k === 6 ? lerp(1, 10, E(u, 0.2, 2.4)) : 10;
    tx(360, 150, '에폭마다', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    for (let e = 0; e < Math.floor(n); e++) { el('rect', { x: 360 + e * 56, y: 160, width: 34, height: 22, rx: 4, fill: ACC, opacity: 0.7 }); el('rect', { x: 396 + e * 56, y: 160, width: 16, height: 22, rx: 4, fill: GOOD, opacity: 0.7 }); }
    mono(360, 205, '■ train_one_epoch  ■ evaluate', { 'font-size': 13.5, fill: MUT });
    if (k === 6) { modeTag(640, 250, Math.floor(u * 2) % 2 ? 'eval' : 'train');
      sub(640, 300, '모드를 되돌리는 건 train_one_epoch 첫 줄', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    curves(400, 240, 380, 130, 10, { val: true, train: false });
    mono(800, 260, 'val', { 'font-size': 14, 'font-weight': 700, fill: GOOD });
    mono(400, 405, 'epoch 1: val_loss=2.1920 … epoch 10: 0.0200', { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 0.6) }); }

  // =========================================================
  // 4. 커스텀 — 누적 · 로깅 · 다중 손실 · GAN
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { const GX = 600, GY = 340, GH = 220;
      tx(40, 60, 'accum = 4', { 'font-size': 20, 'font-weight': 800, class: 'mono', fill: ACC });
      el('rect', { x: GX, y: GY - GH, width: 120, height: GH, rx: 8, fill: SOFT, stroke: BAD, 'stroke-width': 2 });
      mono(GX + 60, GY + 24, '.grad', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      const filled = k === 0 ? 0 : k === 1 ? Math.min(4, E(u, 0.2, 2.2) * 4) : 4, cleared = k === 2 && u > 1.4;
      for (let b = 0; b < 4; b++) { const x = 80 + b * 110, on = b < filled; card(x, 200, 90, 50, { rx: 8, text: `배치 ${b + 1}`, fs: 14, stroke: on ? INFO : GRID, color: on ? INFO : MUT });
        if (k >= 1) mono(x, 250, 'loss / 4', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: on ? 1 : 0.4 });
        const part = clamp(filled - b); if (part > 0 && !cleared) el('rect', { x: GX + 10, y: GY - (b + part) * GH / 4 + 4, width: 100, height: Math.max(0, part * GH / 4 - 6), rx: 4, fill: BAD, opacity: 0.35 + 0.12 * b }); }
      if (k === 0) { pill(GX + 60, GY - GH / 2, 'zero_grad() 루프 밖 1번', GOOD, pop(u, 0.6), { mono: true, fs: 13.5 }); sub(330, 390, 'GPU 메모리가 작아 배치를 못 키울 때', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      if (k === 1) { sub(330, 390, 'backward 만 반복 — 여기선 누적을 일부러 쓴다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      pill(GX + 200, 160, 'step()', ACC, pop(u, 0.3), { mono: true, fs: 15 }); if (u > 1.4) pill(GX + 200, 220, 'zero_grad()', GOOD, pop(u, 1.4), { mono: true, fs: 15 });
      sub(330, 390, '배치 32 라면 32 × 4 = 128 배치 한 번의 갱신과 같다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const x0 = 120, w = 740, y = 200; el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
      const cur = E(u, 0.1, 2.6) * 350;
      el('circle', { cx: x0 + w * Math.min(cur, 350) / 350, cy: y, r: 8, fill: ACC });
      [0, 100, 200, 300].forEach((s, i) => { const xx = x0 + w * s / 350, on = cur >= s; el('line', { x1: xx, y1: y - 16, x2: xx, y2: y + 16, stroke: on ? WARN : MUT, 'stroke-width': 3 }); mono(xx, y + 40, `step ${s}`, { 'font-size': 14, 'text-anchor': 'middle', fill: on ? WARN : MUT });
        if (on) card(xx, y - 60, 150, 36, { rx: 8, text: 'print(loss…)', fs: 13.5, mono: true, stroke: WARN }); });
      sub(480, 330, 'if step % 100 == 0: — fit 이라면 콜백을 만들 일이 if 한 줄', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 360, '나눠 둔 값을 되돌려 loss.item() * accum 으로 찍는다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 4) { card(200, 130, 150, 50, { rx: 10, text: 'ce_loss', fs: 15, mono: true, stroke: INFO, s: pop(u, 0.2) }); card(200, 280, 150, 50, { rx: 10, text: 'l1_reg', fs: 15, mono: true, stroke: WARN, s: pop(u, 0.4) });
      grow(276, 135, 450, 195, E(u, 0.6, 1.0), INFO); grow(276, 275, 450, 215, E(u, 0.6, 1.0), WARN);
      mono(350, 150, '× 1.0', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.8) }); mono(350, 276, '× 0.3', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.8) });
      card(500, 205, 90, 50, { rx: 25, text: 'loss', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.0) });
      dot([[545, 205], [700, 140]], seg(u, 1.4, 2.2), BAD, 7); dot([[545, 205], [700, 270]], seg(u, 1.4, 2.2), BAD, 7);
      card(760, 140, 140, 40, { rx: 8, text: '분류 쪽 grad', fs: 14, stroke: BAD, s: pop(u, 2.0) }); card(760, 270, 140, 40, { rx: 8, text: '정규화 쪽 grad', fs: 14, stroke: BAD, s: pop(u, 2.1) });
      sub(480, 370, '더하기만 하면 backward 한 번에 두 갈래로 흐른다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5: GAN 두 옵티마이저
    const turn = Math.floor(u / 1.2) % 2;
    [[200, '판별자 D', 'opt_D', INFO, 0], [760, '생성자 G', 'opt_G', ACC, 1]].forEach(([x, a, b, col, i]) => { const on = turn === i;
      card(x, 180, 300, 120, { rx: 14, stroke: col, sw: on ? 3.5 : 1.5, fill: on ? (i ? ACCBG : C.INFOBG) : PANEL });
      tx(x, 165, a, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: col });
      mono(x, 200, `${b}.zero_grad → backward → step`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: on ? INK : MUT }); });
    grow(360, 160, 600, 160, 1, MUT); grow(600, 200, 360, 200, 1, MUT);
    sub(480, 320, '옵티마이저 둘을 번갈아 — 루프라서 그냥 순서대로 쓴다', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 5. 재사용 뼈대 — 두 함수와 메인 루프
  // =========================================================
  function fnBox(x, y, w, h, title, lines, col, o) { o = o || {}; zone(x, y, w, h, title, { stroke: col, fill: PANEL, op: o.op });
    lines.forEach(([s, a, hot], i) => mono(x + 16, y + 52 + i * 24, s, { 'font-size': 14, fill: hot ? col : INK, 'font-weight': hot ? 800 : 400, opacity: a })); }
  function s5(t, c) { const { k, u } = c;
    const tl = [['model.train()', k === 0 ? fade(u, 0.6) : 1, true], ['for xb, yb in loader:', k === 1 ? fade(u, 0.2) : k > 1 ? 1 : 0], ['  zero_grad · loss · backward · step', k === 1 ? fade(u, 0.6) : k > 1 ? 1 : 0], ['  running += loss.item() * n', k === 2 ? fade(u, 0.3) : k > 2 ? 1 : 0], ['return running / len(dataset)', k === 2 ? fade(u, 0.8) : k > 2 ? 1 : 0, k === 2]];
    const ev = [['model.eval()', k === 3 ? fade(u, 0.4) : k > 3 ? 1 : 0, true], ['with torch.no_grad():', k === 3 ? fade(u, 0.8) : k > 3 ? 1 : 0, true], ['  total += loss.item() * n', k === 4 ? fade(u, 0.3) : k > 4 ? 1 : 0], ['return total / n', k === 4 ? fade(u, 0.8) : k > 4 ? 1 : 0, k === 4]];
    const sm = k >= 5;
    fnBox(24, 24, sm ? 330 : 440, 170, 'def train_one_epoch(...)', tl, ACC, { op: k === 0 ? fade(u, 0.1) : 1 });
    if (k >= 3) fnBox(24, 212, sm ? 330 : 440, 140, 'def evaluate(...)', ev, GOOD, { op: k === 3 ? fade(u, 0.1) : 1 });
    if (k === 0) { card(700, 110, 380, 90, { rx: 12, text: '스위치를 함수 안에 고정\n→ 호출하는 쪽이 빼먹을 수 없다', fs: 15, stroke: ACC, s: pop(u, 1.2) }); return; }
    if (k <= 2) { const rx = 700; for (let b = 0; b < 16; b++) { const on = (u * 6) % 16 > b; el('rect', { x: rx - 160 + (b % 8) * 40, y: 80 + Math.floor(b / 8) * 44, width: 34, height: 36, rx: 4, fill: on ? ACC : SOFT, opacity: on ? 0.7 : 1 }); }
      mono(rx, 200, '배치 16개 × 3박자', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      if (k === 2) { mono(rx, 260, 'train = 2.8755', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) }); sub(rx, 290, '예시 실행 1 에폭 평균', fade(u, 1.4), { 'font-size': 14 }); }
      return; }
    if (k <= 4) { card(700, 280, 300, 80, { rx: 12, text: k === 3 ? '스위치 A · B 가\n함수 안에 있다' : 'val = 2.1920\n(예시 실행 1 에폭)', fs: 15, stroke: GOOD, mono: k === 4, s: pop(u, 1.2) }); return; }
    // k5, k6: 메인 루프 + 곡선
    const n = k === 5 ? lerp(1, 10, E(u, 0.3, 2.4)) : 10;
    snippet(24, 362, ['for epoch: tr = train_one_epoch(…); val = evaluate(…)'], { fs: 13.5 });
    const ax = curves(420, 50, 440, 260, n, { val: true });
    mono(870, ax.Y(TR[Math.ceil(n) - 1]) - 6, 'train', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: n >= 10 ? 1 : 0 });
    mono(870, ax.Y(VA[Math.ceil(n) - 1]) + 16, 'val', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: n >= 10 ? 1 : 0 });
    if (k === 5) { mono(640, 380, `epoch ${Math.ceil(n)}: train=${TR[Math.ceil(n) - 1].toFixed(4)} val=${VA[Math.ceil(n) - 1].toFixed(4)}`, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }); return; }
    // k6: 체크포인트 · 조기 종료 자리
    VA.forEach((v, i) => { if (u > 0.3 + i * 0.15) { el('circle', { cx: ax.X(i + 1), cy: ax.Y(v), r: 9, fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); } });
    card(640, 360, 250, 40, { rx: 8, text: 'TODO: if val < best_val: save', fs: 13.5, mono: true, stroke: WARN, dash: '5 4', s: pop(u, 1.6) });
    card(640, 404, 250, 28, { rx: 8, text: 'TODO: 조기 종료 (Part Ⅲ)', fs: 13.5, stroke: WARN, dash: '5 4', s: pop(u, 2.0) }); }

  // ---------- 확인 문제 ----------
  const quiz = [
    { q: 'PyTorch 에 Keras 의 fit() 같은 한 줄이 없는 이유는 무엇인가?',
      o: ['아직 개발되지 않아서', '학습 과정을 사용자 코드로 열어 두어 어느 줄이든 고칠 수 있게 하려고', 'GPU 에서만 fit 이 동작해서'], a: 1,
      why: 'fit() 이 감추던 에폭·배치 반복과 3박자를 직접 쓰게 해서, 로깅·손실 조합 같은 변경을 그 자리에서 넣을 수 있다.' },
    { q: '배치 손실을 모을 때 running_loss += loss 대신 loss.item() 을 쓰는 이유는 무엇인가?',
      o: ['loss 텐서를 그대로 더하면 grad_fn 사슬이 남아 메모리가 쌓여서', '.item() 이 손실을 더 정확하게 계산해서', 'loss 텐서는 더하기를 지원하지 않아서'], a: 0,
      why: '텐서끼리 더하면 AddBackward0 노드가 계속 붙는다. .item() 은 파이썬 float 만 꺼내 그래프와 끊는다.' },
    { q: 'model.eval() 과 torch.no_grad() 의 차이로 맞는 것은 무엇인가?',
      o: ['둘은 같은 일을 하니 하나만 켜면 된다', 'eval() 은 그래프를 끄고, no_grad() 는 Dropout 을 끈다', 'eval() 은 Dropout·BN 의 모드를 바꾸고, no_grad() 는 grad_fn 생성을 멈춘다'], a: 2,
      why: '실행해 보면 eval() 에서 Dropout 모델 출력이 −0.218 로 고정되고, no_grad() 안에서 pred.grad_fn 이 None 이 된다. 하는 일이 달라 둘 다 켠다.' },
    { q: 'gradient accumulation(accum=4)에서 zero_grad() 는 언제 부르는가?',
      o: ['매 배치 backward 직전', '4 배치마다 step() 한 직후', '에폭이 끝날 때만'], a: 1,
      why: '네 배치의 기울기를 일부러 쌓아야 하므로 배치마다 지우면 안 된다. step() 으로 갱신한 직후에만 지운다.' },
    { q: 'train_one_epoch 첫 줄에 model.train() 을 두는 이유는 무엇인가?',
      o: ['evaluate 가 바꿔 놓은 eval 모드를 매 에폭 학습 전에 되돌리려고', '파라미터를 초기화하려고', '옵티마이저를 다시 만들려고'], a: 0,
      why: '메인 루프가 학습과 검증을 번갈아 부르므로, 스위치를 함수 안에 고정해 두면 켜고 끄기를 빼먹을 일이 없다.' },
  ];

  const summary = [
    'PyTorch 는 fit() 대신 에폭과 배치 두 겹 for 문 안에 3박자를 직접 쓴다.',
    '배치 손실은 loss.item() 으로 float 을 꺼내 모아야 그래프가 메모리에 남지 않는다.',
    '검증에서는 model.eval() 로 층 모드를, torch.no_grad() 로 그래프 생성을 따로 끈다.',
    '학습과 검증을 두 함수로 나누고 스위치를 함수 안에 고정해 에폭마다 번갈아 부른다.',
  ];
  const review = [
    { q: '검증 손실이 같은 데이터로 돌려도 매번 조금씩 다르게 나온다. 먼저 의심할 것은?',
      o: ['evaluate 안에 model.eval() 이 빠져 Dropout 이 켜져 있다', 'torch.no_grad() 가 빠졌다', 'loss.item() 을 써서'], a: 0,
      why: 'Dropout 이 켜져 있으면 같은 입력도 출력이 흔들린다. no_grad 를 빼면 메모리만 더 쓰고 값은 같다.' },
    { q: 'GPU 메모리 때문에 배치를 8 로 줄였지만 배치 32 와 같은 갱신을 원한다. 루프를 어떻게 바꾸나?',
      o: ['학습률을 4배로 올린다', '에폭 수를 4배로 늘린다', 'loss 를 4 로 나눠 backward 하고 4 배치마다 step() 후 zero_grad() 한다'], a: 2,
      why: 'gradient accumulation 이다. 네 배치의 기울기를 쌓아 한 번에 갱신하면 큰 배치 하나와 같은 효과가 난다.' },
    { q: '학습이 몇 에폭 지나자 메모리가 계속 늘다 결국 OOM 이 났다. 학습 루프에서 먼저 볼 줄은?',
      o: ['model.train() 위치', 'running_loss += loss 처럼 텐서째 더하는 집계 줄', 'scheduler.step() 위치'], a: 1,
      why: '텐서째 더하면 배치마다 그래프가 이어 붙어 메모리에 남는다. loss.item() 으로 바꾸면 사슬이 끊긴다.' },
  ];

  R.page({ title: '학습 루프 직접 쓰기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
