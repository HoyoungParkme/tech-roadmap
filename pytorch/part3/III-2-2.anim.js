/* III-2-2 학습 모니터링 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 곡선·조기 종료 숫자는 venv torch 로 돌린 실험값이다: 10→256→256→2 MLP, train 500 / val 1000 (합성 데이터, 시드 0),
 * Adam lr 3e-4, 배치 32, EarlyStopping(patience=7, min_delta=1e-4) → best 에폭 14 (val 0.499), 에폭 21 에 멈춤.
 * 층별 기울기는 6층 sigmoid / ReLU MLP 의 첫 backward 실행값, tqdm 한 줄은 tqdm.format_meter 로 찍은 값,
 * print 로 흘러가는 0.83 0.81 0.79 는 페이지의 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, snippet, axes, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  const TL = [0.658, 0.573, 0.508, 0.463, 0.435, 0.418, 0.401, 0.387, 0.372, 0.357, 0.348, 0.335, 0.324, 0.313, 0.305, 0.294, 0.286, 0.28, 0.277, 0.266, 0.262, 0.247];
  const VL = [0.63, 0.575, 0.541, 0.528, 0.524, 0.523, 0.52, 0.515, 0.515, 0.507, 0.505, 0.501, 0.504, 0.504, 0.499, 0.502, 0.502, 0.509, 0.503, 0.513, 0.518, 0.514];
  const VA = [0.678, 0.715, 0.72, 0.726, 0.729, 0.731, 0.737, 0.737, 0.743, 0.745, 0.744, 0.745, 0.744, 0.743, 0.752, 0.748, 0.754, 0.749, 0.758, 0.75, 0.751, 0.757];
  const CNT = [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 2, 0, 1, 2, 3, 4, 5, 6, 7];
  const BEST = 14, STOP = 21;
  const lossAx = (x, y, w, h, o) => axes(x, y, w, h, Object.assign({ x: [0, 21], y: [0.2, 0.7], xt: [0, 7, 14, 21], yt: [0.2, 0.4, 0.6], xl: '에폭', yl: 'loss', grid: true }, o || {}));
  const pts = (a, n) => a.slice(0, n ?? a.length).map((v, i) => [i, v]);

  // =========================================================
  // 1. print 의 한계 → tqdm
  // =========================================================
  const PRINTS = ['0.8312', '0.8274', '0.8105', '0.8191', '0.7987', '0.8033', '0.7921', '0.7950', '0.7889', '0.7912'];
  const BAR = 'epoch 0:  60%|██████    | 300/500 [00:12<00:08, 25.00it/s, loss=0.7912]';
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { pill(480, 150, 'from tqdm import tqdm', ACC, pop(u, 0.3), { mono: true, fs: 17 });
      sub(480, 200, 'pip install tqdm', fade(u, 0.8), { 'font-size': 15 });
      note(480, 290, '학습 코드는 그대로 · 감싸기 한 줄', fade(u, 1.5), { 'text-anchor': 'middle', 'font-size': 17 }); return; }
    if (k === 1) { tx(60, 70, 'for epoch in range(50):  for x, y in loader:', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      const done = E(u, 0.2, 2.6) * 50 * 16;
      for (let e = 0; e < 50; e++) for (let b = 0; b < 16; b++) { const i = e * 16 + b; el('rect', { x: 60 + e * 17, y: 100 + b * 14, width: 14, height: 11, rx: 2, fill: i < done ? ACC : SOFT, opacity: i < done ? 0.7 : 1 }); }
      sub(480, 350, 'zero_grad → backward → step · 여기까지는 문제가 없다', fade(u, 1.6), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { const lines = []; for (let i = 0; i < 40; i++) lines.push(PRINTS[i % PRINTS.length]);
      terminal(60, 60, 360, 300, lines, Math.min(40, E(u, 0.1, 2.6) * 40), { title: 'train.py', fs: 14.5 });
      [['지금 값', true], ['3시간 전보다 나은가', false], ['다른 실험보다 나은가', false], ['NaN 이 언제 터졌나', false]].forEach(([s, ok], i) => {
        (ok ? check : cross)(520, 120 + i * 60, 11, pop(u, 0.8 + i * 0.3)); tx(550, 126 + i * 60, s, { 'font-size': 16, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: fade(u, 0.9 + i * 0.3) }); });
      sub(240, 395, '흘러가는 숫자 (예시)', 1, { 'font-size': 14 }); return; }
    // 진행바
    terminal(40, 90, 880, 120, [], 0, { title: 'train.py' });
    const f = k === 3 ? E(u, 0.4, 2.0) * 0.3 : k === 4 ? lerp(0.3, 0.6, E(u, 0.2, 1.4)) : 0.6;
    const n = Math.round(f * 500), s = `epoch 0: ${String(Math.round(f * 100)).padStart(3)}%|${'█'.repeat(Math.round(f * 10)).padEnd(10)}| ${n}/500`;
    mono(60, 160, k === 3 ? s : k === 4 && u < 1.4 ? s : BAR, { 'font-size': 15, fill: 'var(--term)' });
    if (k === 3) { mono(480, 270, 'pbar = tqdm(loader, desc=f"epoch {epoch}")', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(480, 320, '반복은 그대로 돌고 진행바가 붙는다 · desc 가 왼쪽 이름표가 된다', fade(u, 1.6), { 'font-size': 15, fill: INK }); return; }
    if (k === 4) { [['진행률', 280], ['남은 시간', 560], ['초당 배치', 660], ['최신 loss', 800]].forEach(([s, x], i) => { grow(x, 290, x, 186, E(u, 1.5 + i * 0.2, 1.9 + i * 0.2), ACC, { sw: 1.8 }); tx(x, 312, s, { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6 + i * 0.2) }); });
      sub(480, 380, 'pbar.set_postfix(loss=…) · 스크롤 대신 한 줄이 갱신된다 (tqdm 형식 그대로)', fade(u, 2.3), { 'font-size': 14 }); return; }
    [['살아 있나', true], ['추세', false], ['실험 비교', false]].forEach(([s, ok], i) => { (ok ? check : cross)(300 + i * 180, 290, 13, pop(u, 0.3 + i * 0.3)); tx(300 + i * 180, 330, s, { 'font-size': 16, 'font-weight': 700, fill: ok ? GOOD : BAD, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.3) }); });
    sub(480, 390, '다음 계단: 숫자가 아니라 곡선으로 본다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 2. TensorBoard — 곡선으로 본다
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { [['runs/', 0, INK], ['exp_lr0.001_bs64/', 1, ACC], ['events.out.tfevents…', 2, MUT], ['exp_lr0.01_bs64/', 1, INFO]].forEach(([s, d, col], i) => mono(80 + d * 34, 110 + i * 48, s, { 'font-size': 16, 'font-weight': d < 2 ? 800 : 500, fill: col, opacity: fade(u, 0.2 + i * 0.35) }));
      mono(560, 120, 'writer = SummaryWriter(', { 'font-size': 15, opacity: fade(u, 0.4) }); mono(580, 148, 'log_dir=f"runs/{run_name}")', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      sub(700, 260, '폴더 하나 = 실험 하나', fade(u, 1.6), { 'font-size': 16, fill: INK, 'font-weight': 700 }); sub(700, 288, '나중에 색깔별로 겹쳐 그려진다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 1 || k === 2) { pill(200, 80, 'model.train()', ACC, k === 1 ? pop(u, 0.2) : 1, { mono: true, fs: 15 });
      mono(80, 150, 'train_loss', { 'font-size': 15, 'font-weight': 700 });
      if (k === 1) { cells(200, 128, ['0.0'], { w: 90, h: 38, fs: 15, style: () => ({ stroke: ACC, s: pop(u, 0.8) }) });
        for (let b = 0; b < 16; b++) { const s = seg(u, 1.0 + b * 0.08, 1.2 + b * 0.08); if (s > 0) el('circle', { cx: 340 + b * 30, cy: 147, r: 6, fill: OFF, opacity: s }); }
        sub(560, 200, '배치마다 loss.item() 을 더해 간다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
      const ax = lossAx(500, 90, 400, 230); const sh = E(u, 0.3, 1.2);
      for (let b = 0; b < 16; b++) { const v = 0.66 + 0.1 * Math.sin(b * 1.7); el('circle', { cx: lerp(120 + b * 22, ax.X(0), sh), cy: lerp(250, ax.Y(TL[0]), sh), r: 5, fill: OFF, opacity: 1 - sh * 0.7 }); }
      el('circle', { cx: ax.X(0), cy: ax.Y(TL[0]), r: 8, fill: ACC, opacity: fade(u, 1.2) });
      mono(80, 340, 'train_loss /= len(train_loader)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      mono(ax.X(0) + 14, ax.Y(TL[0]) - 10, '0.658', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      sub(290, 380, '배치 16개 → 에폭 한 점', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const ax = lossAx(110, 80, 500, 240);
      el('circle', { cx: ax.X(0), cy: ax.Y(TL[0]), r: 7, fill: ACC }); el('circle', { cx: ax.X(0), cy: ax.Y(VL[0]), r: 7, fill: WARN, opacity: fade(u, 0.8) });
      mono(720, 140, 'evaluate(model, val_loader)', { 'font-size': 14.5, opacity: fade(u, 0.3), 'text-anchor': 'middle' });
      cells(640, 160, ['0.630', '0.678'], { w: 80, h: 40, fs: 16, style: (i) => ({ stroke: WARN, s: pop(u, 0.8 + i * 0.3) }) });
      mono(680, 222, 'val_loss', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); mono(762, 222, 'val_acc', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(720, 290, '같은 에폭 번호로 함께 기록해야', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); sub(720, 314, '두 곡선을 겹칠 수 있다', fade(u, 1.9), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 4) { const ax = lossAx(110, 70, 560, 270); const g = E(u, 0.2, 2.2);
      el('rect', { x: ax.X(BEST), y: 70, width: ax.X(21) - ax.X(BEST), height: 270, fill: BADBG, opacity: fade(u, 2.0) * 0.8 });
      R.line(ax, pts(TL), g, ACC, { sw: 3 }); R.line(ax, pts(VL), g, WARN, { sw: 3 });
      tx(700, 120, 'Loss/train', { 'font-size': 15, 'font-weight': 800, fill: ACC }); tx(700, 150, 'Loss/val', { 'font-size': 15, 'font-weight': 800, fill: WARN });
      note(700, 230, '에폭 14 뒤로 벌어진다', fade(u, 2.1), { fill: BAD, 'font-size': 15 }); sub(790, 256, 'train 0.305 → 0.247', fade(u, 2.2), { 'font-size': 14 }); sub(790, 280, 'val 0.499 → 0.514', fade(u, 2.3), { 'font-size': 14 });
      sub(390, 400, '태그 앞부분 "Loss/" 가 같으면 한 차트에 겹친다', fade(u, 2.4), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 5) { const ax = axes(110, 90, 560, 200, { x: [0, 21], y: [0, 6e-4], xt: [0, 7, 14, 21], yt: [0, 3e-4, 6e-4], xl: '에폭', yl: 'LR', grid: true });
      R.line(ax, pts(TL.map(() => 3e-4)), E(u, 0.2, 1.6), INFO, { sw: 3 });
      tx(720, 150, '이 실험은 스케줄러 없음', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) }); sub(800, 176, '→ 평평한 선 3e-4', fade(u, 1.6), { 'font-size': 14 });
      sub(480, 370, '손실이 꺾인 자리가 스케줄러 때문인지 LR 곡선을 겹쳐 보면 갈린다', fade(u, 2.1), { 'font-size': 14.5, fill: INK }); return; }
    // k6: 브라우저 계기판
    R.browser(480, 220, 760, 300, null, { s: pop(u, 0.2) });
    mono(150, 92, 'localhost:6006', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) });
    const a1 = lossAx(150, 150, 300, 160, { xl: null, yl: 'Loss' }); R.line(a1, pts(TL), E(u, 0.5, 1.6), ACC, { sw: 2.5 }); R.line(a1, pts(VL), E(u, 0.5, 1.6), WARN, { sw: 2.5 });
    const a2 = axes(560, 150, 260, 160, { x: [0, 21], y: [0.66, 0.77], xt: [0, 21], yt: [0.7, 0.75], yl: 'Acc/val' }); R.line(a2, pts(VA), E(u, 0.9, 2.0), GOOD, { sw: 2.5 });
    pill(480, 400, 'writer.close() · tensorboard --logdir runs', INK, pop(u, 2.0), { mono: true, fs: 14 }); }

  // =========================================================
  // 3. 분포 · 이미지 · 그래프
  // =========================================================
  const W0 = [66, 185, 201, 195, 197, 187, 192, 174, 220, 157, 209, 65];
  const GS = [2.0e-8, 2.1e-7, 1.2e-6, 9.5e-6, 6.8e-5, 5.7e-4, 2.8e-2], GR = [1.5e-5, 1.5e-5, 1.2e-5, 1.3e-5, 1.9e-5, 6.1e-5, 1.1e-3];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { [['add_scalar', '숫자 하나', ACC], ['add_histogram', '분포', WARN], ['add_image', '입력 그림', INFO], ['add_graph', '연산 구조', GOOD]].forEach(([a, b, col], i) => { const x = 150 + i * 220;
        card(x, 180, 190, 110, { rx: 12, stroke: col, sw: 2, s: pop(u, 0.2 + i * 0.3) }); mono(x, 170, a, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.3) });
        sub(x, 200, b, fade(u, 0.4 + i * 0.3), { 'font-size': 14 }); });
      mono(480, 320, 'writer = SummaryWriter("runs/deep")', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(480, 360, '같은 writer · 무엇을 넣느냐만 다르다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const ax = axes(120, 80, 480, 240, { x: [-0.2, 0.2], y: [0, 240], xt: [-0.2, -0.1, 0, 0.1, 0.2], yt: [0, 100, 200], xl: '가중치 값', yl: 'weight/0.weight' });
      W0.forEach((v, i) => { const g = E(u, 0.2 + i * 0.1, 0.8 + i * 0.1), x = ax.X(-0.2 + i * (0.4 / 12)); el('rect', { x: x + 1, y: ax.Y(v * g), width: ax.X(0.4 / 12) - ax.X(0) - 2, height: ax.Y(0) - ax.Y(v * g), fill: WARN, opacity: 0.75 }); });
      note(650, 140, '처음엔 평평하다', fade(u, 1.6), { 'font-size': 16 }); sub(780, 168, 'nn.Linear 기본 초기화 = 균등분포', fade(u, 1.8), { 'font-size': 14 });
      sub(780, 210, '학습하며 서서히 변하는 게 정상', fade(u, 2.1), { 'font-size': 14 }); sub(780, 234, '갑자기 쏠리거나 퍼지면 의심', fade(u, 2.3), { 'font-size': 14, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 2) { tx(80, 66, '층별 평균 |grad| · 6층 MLP 첫 backward (실행값, 로그 눈금)', { 'font-size': 14.5, 'font-weight': 700 });
      const LY = (v) => 330 - ((Math.log10(v) + 8) / 7) * 230;
      [-8, -6, -4, -2].forEach((e) => { el('line', { x1: 100, y1: LY(10 ** e), x2: 880, y2: LY(10 ** e), stroke: GRID, 'stroke-dasharray': '3 4' }); mono(92, LY(10 ** e) + 5, `1e${e}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
      GS.forEach((v, i) => { const x = 130 + i * 106, g = E(u, 0.2 + i * 0.15, 0.8 + i * 0.15), top = lerp(330, LY(v), g);
        el('rect', { x, y: top, width: 36, height: 330 - top, rx: 3, fill: BAD, opacity: 0.75 });
        const g2 = E(u, 1.2 + i * 0.12, 1.8 + i * 0.12), top2 = lerp(330, LY(GR[i]), g2); el('rect', { x: x + 40, y: top2, width: 36, height: 330 - top2, rx: 3, fill: GOOD, opacity: 0.75 });
        mono(x + 38, 352, `L${i + 1}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      tx(130, 390, 'sigmoid 2.0e-08 ~ 2.8e-02', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      tx(520, 390, 'ReLU 1.2e-05 ~ 1.1e-03', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { const D = ['3', '1', '4', '1', '5', '9', '2', '6', '5', '3', '5', '8', '9', '7', '9', '3'];
      D.forEach((d, i) => { const x = 140 + (i % 4) * 66, y = 70 + Math.floor(i / 4) * 66, s = pop(u, 0.2 + i * 0.07), bad = i === 13;
        card(x, y + 28, 58, 58, { rx: 4, fill: INK, stroke: bad ? BAD : INK, sw: bad ? 4 : 1, s });
        const g = R.G(x, y + 40, s); tx(0, 0, d, { 'font-size': 34, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', transform: bad ? 'scale(-1 1)' : null }, g); });
      mono(240, 360, 'make_grid(sample_x[:16], nrow=4)', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      note(500, 160, '뒤집힌 7 · 라벨은 7', fade(u, 1.6), { fill: BAD, 'font-size': 16 }); sub(680, 196, '증강이 과하다는 신호', fade(u, 1.8), { 'font-size': 14.5 });
      sub(680, 250, '손실 곡선은 이런 문제를 알려 주지 않는다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { [['input [B, 784]', MUT], ['Linear', ACC], ['ReLU', INK], ['Linear', ACC], ['output [B, 10]', MUT]].forEach(([s, col], i) => { const y = 70 + i * 66;
        card(330, y, 200, 44, { rx: 22, text: s, fs: 15, mono: true, stroke: col, color: col, s: pop(u, 0.2 + i * 0.25) }); if (i) grow(330, y - 44, 330, y - 24, E(u, 0.2 + i * 0.25, 0.4 + i * 0.25), MUT); });
      mono(700, 180, 'writer.add_graph(model, sample_x)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      sub(700, 220, '구조가 의도대로인지 · 최초 1회면 충분', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { el('line', { x1: 100, y1: 230, x2: 880, y2: 230, stroke: MUT, 'stroke-width': 2 }); tx(880, 256, '에폭', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      for (let e = 0; e < 10; e++) { const x = 130 + e * 76, s = pop(u, 0.4 + e * 0.15);
        if (e === 0) card(x, 160, 84, 36, { rx: 8, text: 'graph', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.2) });
        card(x, 200, 60, 26, { rx: 6, text: 'hist', fs: 13.5, mono: true, stroke: WARN, color: WARN, s }); el('circle', { cx: x, cy: 230, r: 4, fill: MUT }); }
      sub(480, 300, '그래프는 1회, 분포는 매 에폭 · 매 배치로 남기면 로그가 금방 기가 단위가 된다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    // k6: 사례 — 손실은 매끄러운데
    const ax = axes(100, 90, 340, 220, { x: [0, 10], y: [0, 1], xt: [0, 5, 10], xl: '에폭', yl: 'Loss/train' });
    R.line(ax, Array.from({ length: 11 }, (_, i) => [i, 0.9 - 0.06 * i]), E(u, 0.2, 1.0), ACC, { sw: 3 });
    tx(600, 80, 'grad/layer3', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
    const H = [0, 1, 2, 6, 170, 6, 2, 1, 0];
    H.forEach((v, i) => { const g = E(u, 1.1 + i * 0.05, 1.6 + i * 0.05); el('rect', { x: 560 + i * 34, y: 310 - Math.min(200, v) * g, width: 30, height: Math.min(200, v) * g, fill: BAD, opacity: 0.75 }); });
    mono(560 + 4 * 34 + 15, 334, '0', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
    sub(480, 395, '손실은 내려가는데 이 층은 배우지 않는다 · 스칼라만 보면 못 찾는다 (코드 주석의 사례)', fade(u, 2.0), { 'font-size': 14 }); }

  // =========================================================
  // 4. 조기 종료
  // =========================================================
  function stateCards(st, o) { o = o || {};
    [['patience', '7'], ['min_delta', '1e-4'], ['best_loss', st.best], ['counter', st.cnt], ['best_state', st.snap]].forEach(([a, b], i) => { const x = 110 + i * 185, hot = o.hot === i;
      card(x, 70, 170, 64, { rx: 10, stroke: hot ? ACC : i < 2 ? GRID : INK, sw: hot ? 3 : 1.8, fill: hot ? ACCBG : PANEL, s: o.s ? o.s(i) : 1 });
      mono(x, 60, a, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: o.s ? clamp(o.s(i)) : 1 }); mono(x, 86, b, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? ACC : INK, opacity: o.s ? clamp(o.s(i)) : 1 }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { stateCards({ best: 'inf', cnt: '0', snap: 'None' }, { s: (i) => pop(u, 0.2 + i * 0.3) });
      sub(205, 140, '설정', fade(u, 0.8), { 'font-size': 14.5, 'font-weight': 700 }); sub(665, 140, '판정을 위해 들고 있는 상태', fade(u, 1.6), { 'font-size': 14.5, 'font-weight': 700 });
      sub(480, 260, 'min_delta = 이만큼은 좋아져야 개선으로 친다', fade(u, 2.0), { 'font-size': 15, fill: INK });
      sub(480, 290, '잡음 수준의 개선을 개선으로 세지 않는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    const ax = k === 5 ? lossAx(110, 160, 560, 210, { y: [0.2, 0.7], yt: [0.3, 0.5, 0.7] }) : lossAx(110, 160, 560, 210, { y: [0.45, 0.65], yt: [0.5, 0.6] });
    if (k === 1) { const n = Math.min(BEST + 1, Math.floor(E(u, 0.2, 2.2) * (BEST + 1)) + 1);
      R.line(ax, pts(VL, n), 1, WARN, { sw: 3 }); let b = 9;
      for (let i = 0; i < n; i++) if (CNT[i] === 0) { b = i; el('circle', { cx: ax.X(i), cy: ax.Y(VL[i]), r: 6, fill: ACC }); }
      stateCards({ best: VL[b].toFixed(3), cnt: String(CNT[n - 1]), snap: `에폭 ${b}` }, { hot: 2 });
      tx(720, 250, '초록 점 = 개선', { 'font-size': 14.5, 'font-weight': 700, fill: ACC }); sub(800, 278, 'best 갱신 + 가중치 스냅샷', 1, { 'font-size': 14 });
      sub(800, 302, 'counter 는 0 으로', 1, { 'font-size': 14 });
      sub(800, 340, 'deepcopy 로 떠야 이후 학습에 안 바뀐다', fade(u, 2.0), { 'font-size': 13.5, fill: WARN, 'font-weight': 700 }); return; }
    R.line(ax, pts(VL), 1, WARN, { sw: 3 });
    el('circle', { cx: ax.X(BEST), cy: ax.Y(VL[BEST]), r: 8, fill: ACC });
    if (k === 2) { const n = Math.min(7, Math.floor(E(u, 0.2, 2.2) * 7) + 1);
      for (let i = 1; i <= 7; i++) { const e = BEST + i, on = i <= n; mono(ax.X(e), ax.Y(VL[e]) - 14, on ? String(CNT[e]) : '', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 7 ? BAD : WARN }); }
      stateCards({ best: '0.499', cnt: String(n), snap: '에폭 14' }, { hot: 3 });
      if (n === 7) { pill(800, 270, 'should_stop = True', BAD, pop(u, 2.2), { mono: true, fs: 15 }); sub(800, 304, '에폭 21 · 7번 연속 개선 없음', fade(u, 2.3), { 'font-size': 14 }); } return; }
    if (k === 3) { stateCards({ best: '0.499', cnt: '7', snap: '에폭 14' }, { hot: 4 });
      el('path', { d: `M${ax.X(STOP)},${ax.Y(VL[STOP]) - 10} C${ax.X(STOP)},${ax.Y(0.58)} ${ax.X(BEST)},${ax.Y(0.58)} ${ax.X(BEST)},${ax.Y(VL[BEST]) - 14}`, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: fade(u, 0.3) });
      pill(ax.X(17.5), ax.Y(0.6), 'restore', ACC, pop(u, 0.9), { mono: true, fs: 14 });
      sub(800, 270, 'model.load_state_dict(best_state)', fade(u, 1.4), { 'font-size': 13.5, fill: ACC, 'font-weight': 700 });
      sub(800, 300, '멈춘 시점(에폭 21)은 이미 과적합', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 4) { stateCards({ best: 'inf', cnt: '0', snap: 'None' }, { hot: 3 });
      for (let i = 0; i < 22; i++) { const s = seg(u, 0.2 + i * 0.08, 0.4 + i * 0.08); if (s > 0) mono(ax.X(i), ax.Y(VL[i]) - 12, i % 2 ? '1' : '0', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: s }); }
      card(800, 280, 230, 80, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.6) }); tx(800, 272, '루프 안에서 만들면', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      tx(800, 296, '매 에폭 상태가 초기화', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      sub(800, 345, '영원히 멈추지 않는다', fade(u, 2.0), { 'font-size': 14, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 5) {
      R.line(ax, pts(TL), E(u, 0.2, 1.6), ACC, { sw: 3 });
      stateCards({ best: '0.499', cnt: '…', snap: '에폭 14' }, {});
      tx(720, 250, 'train 0.658 → 0.247', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); sub(800, 278, '과적합 구간에서도 계속 내려간다', fade(u, 1.3), { 'font-size': 14 });
      sub(800, 316, '판정은 언제나 val 손실로', fade(u, 1.8), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    // k6
    stateCards({ best: '0.499', cnt: '7', snap: '에폭 14' }, {});
    el('rect', { x: ax.X(STOP) + 4, y: 160, width: 4, height: 210, fill: BAD, opacity: fade(u, 0.3) });
    [['남는 모델', '에폭 14 · val 0.499 · 정확도 0.752'], ['멈춘 곳', '에폭 21 (range(100) 중)'], ['아낀 학습', '에폭 22~99 · 78 에폭']].forEach(([a, b], i) => {
      tx(700, 230 + i * 50, a, { 'font-size': 14.5, 'font-weight': 800, fill: i ? INK : ACC, opacity: fade(u, 0.5 + i * 0.4) }); tx(700, 252 + i * 50, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6 + i * 0.4) }); }); }

  // =========================================================
  // 5. 실무 체계 — 이름 규칙 · W&B/MLflow · 통합 루프
  // =========================================================
  const PARTS = [['20240806', '날짜', MUT], ['resnet18', '모델', ACC], ['lr0.001', '학습률', GOOD], ['bs64', '배치', INFO], ['augFlip', '증강', WARN]];
  function loopBox(hot, u) { const L = [['writer = SummaryWriter(f"runs/{make_run_name(cfg)}")', 0], ['stopper = EarlyStopping(patience=7)', 0], ['for epoch in range(cfg.epochs):', 0], ['tl = train_one_epoch(…)', 1], ['vl, va = evaluate(…)', 1], ['add_scalar ×3 · add_histogram', 1], ['stopper.step(vl, model)', 1], ['if should_stop: restore · break', 1], ['writer.close() · return model', 0]];
    const grp = [[0, 1], [3, 4], [5], [6, 7], [8]];
    el('rect', { x: 40, y: 50, width: 560, height: 340, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    L.forEach(([s, d], i) => { const on = grp[hot] && grp[hot].includes(i), y = 82 + i * 36;
      if (on) el('rect', { x: 46, y: y - 22, width: 548, height: 32, rx: 6, fill: ACCBG, opacity: fade(u, 0.1) });
      mono(60 + d * 28, y, s, { 'font-size': 14, 'font-weight': on ? 800 : 500, fill: on ? ACC : INK }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { let x = 80; PARTS.forEach(([s, lab, col], i) => { const w = tw(s, 17) + 18, a = pop(u, 0.2 + i * 0.3);
        card(x + w / 2, 140, w, 44, { rx: 8, text: s, fs: 17, mono: true, stroke: col, color: col, s: a }); tx(x + w / 2, 186, lab, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.3) });
        if (i < PARTS.length - 1) mono(x + w + 6, 146, '_', { 'font-size': 18, fill: MUT, opacity: fade(u, 0.4 + i * 0.3) }); x += w + 20; });
      card(380, 290, 260, 50, { rx: 10, text: 'exp1 · exp2 · exp_final2', fs: 15, mono: true, stroke: OFF, color: MUT, dash: '6 4', s: pop(u, 1.8) }); cross(530, 290, 11, pop(u, 2.0));
      sub(740, 290, '사흘이면 무의미해진다', fade(u, 2.1), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 1) { [['TensorBoard', '로컬 · 무료', 'writer.add_scalar(…)', ACC], ['Weights & Biases', '클라우드 · 팀', 'wandb.log({…})', INFO], ['MLflow', '셀프호스팅 · 팀', 'mlflow.log_metric(…)', GOOD]].forEach(([a, b, cde, col], i) => { const x = 170 + i * 310;
        card(x, 170, 270, 150, { rx: 12, stroke: col, sw: 2, s: pop(u, 0.2 + i * 0.4) }); tx(x, 130, a, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) });
        sub(x, 158, b, fade(u, 0.4 + i * 0.4), { 'font-size': 14 }); mono(x, 206, cde, { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); });
      sub(480, 320, '기록 호출 한 줄의 차이 · 혼자면 TensorBoard 로 충분하다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 350, '여러 사람이 실험을 비교할 때 클라우드 도구의 값이 생긴다 (mlops 파트)', fade(u, 2.1), { 'font-size': 14 }); return; }
    loopBox(k - 2, u);
    if (k === 2) { pill(780, 140, 'runs/20240806_resnet18_…', ACC, pop(u, 0.4), { mono: true, fs: 13.5 }); pill(780, 200, 'patience=7 · 루프 밖', WARN, pop(u, 0.8), { fs: 14 });
      sub(780, 280, '앞의 네 단계가 한 함수로 합쳐진다', fade(u, 1.5), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { [['tl', '0.305'], ['vl', '0.499'], ['va', '0.752']].forEach(([a, b], i) => { mono(690, 140 + i * 56, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) });
        cells(740, 116 + i * 56, [b], { w: 100, h: 40, fs: 16, style: () => ({ stroke: ACC, s: pop(u, 0.4 + i * 0.3) }) }); });
      sub(780, 330, '에폭 14 의 실행값', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 4) { const ax = lossAx(650, 100, 270, 150, { xl: null, yl: null, xt: [0, 21], yt: [0.3, 0.6] }); R.line(ax, pts(TL), E(u, 0.3, 1.4), ACC, { sw: 2.5 }); R.line(ax, pts(VL), E(u, 0.3, 1.4), WARN, { sw: 2.5 });
      [3, 6, 9, 6, 3].forEach((v, i) => el('rect', { x: 690 + i * 32, y: 360 - v * 8 * E(u, 1.3, 1.9), width: 28, height: v * 8 * E(u, 1.3, 1.9), fill: WARN, opacity: 0.7 }));
      sub(785, 386, '스칼라로 추세, 분포로 원인', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { pill(780, 150, 'stopper.step(vl, model)', WARN, pop(u, 0.3), { mono: true, fs: 14 }); grow(780, 176, 780, 226, E(u, 0.7, 1.1), BAD);
      pill(780, 250, 'restore → break', BAD, pop(u, 1.2), { mono: true, fs: 14 });
      sub(780, 310, '기록이 먼저, 판정은 그 뒤', fade(u, 1.7), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); sub(780, 336, '멈춘 에폭도 차트에 남는다', fade(u, 1.9), { 'font-size': 14 }); return; }
    card(780, 180, 230, 90, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 0.3) }); tx(780, 172, 'return model', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    sub(780, 198, '과적합 전 가장 좋았던 모델', fade(u, 0.6), { 'font-size': 14 });
    sub(780, 300, '모니터링 없는 장기 학습은 도박', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(780, 330, '다음: Part Ⅳ 실전 모델링', fade(u, 1.9), { 'font-size': 14.5, fill: ACC }); }

  const quiz = [
    { q: 'tqdm 진행바로 알 수 있지만 print처럼 여전히 알 수 없는 것은 무엇인가?',
      o: ['학습이 멈췄는지 살아 있는지', '남은 시간', '어제 실험보다 손실이 나은지'], a: 2,
      why: '진행바는 진행률·속도·최신 loss를 한 줄로 보여 준다. 추세와 실험 간 비교는 곡선으로 그려야 보인다.' },
    { q: 'train과 val 손실을 TensorBoard의 한 차트에 겹치려면 태그를 어떻게 지어야 하는가?',
      o: ['"Loss/train", "Loss/val" 처럼 앞부분을 같게', '"train", "val" 처럼 짧게', 'writer를 두 개 만들어 따로'], a: 0,
      why: '슬래시 앞이 차트 그룹 이름이다. 실험에서 두 곡선은 에폭 14 뒤로 벌어졌다.' },
    { q: '손실은 매끄럽게 내려가는데 앞쪽 층이 배우지 않는 문제를 잡으려면 무엇을 기록해야 하는가?',
      o: ['add_scalar로 loss를 더 자주', 'add_histogram으로 층별 기울기', 'add_graph를 매 에폭'], a: 1,
      why: '6층 sigmoid MLP에서 첫 층 평균 |grad| 는 2.0e-08, 마지막 층은 2.8e-02 였다. 이런 차이는 층별 기울기 분포에서만 보인다.' },
    { q: 'patience=7인 EarlyStopping이 에폭 21에 멈췄다. 복원되는 가중치는 언제 것인가?',
      o: ['에폭 21', '에폭 14', '에폭 0'], a: 1,
      why: 'val 손실이 가장 낮았던 에폭 14(0.499)의 스냅샷을 되돌린다. 에폭 21의 가중치는 이미 과적합이 진행된 상태다.' },
    { q: '실험 폴더 이름을 20240806_resnet18_lr0.001_bs64_augFlip처럼 짓는 이유는 무엇인가?',
      o: ['TensorBoard가 이 형식만 읽어서', '폴더 이름이 짧아져서', '폴더 목록만 봐도 어떤 설정의 실험인지 알 수 있어서'], a: 2,
      why: 'exp1, exp2 같은 이름은 며칠 지나면 무엇이었는지 알 수 없다. 설정을 이름에 넣으면 범례만 봐도 실험이 복원된다.' },
  ];

  const summary = [
    'print로 흘러가는 숫자로는 추세도, 실험 사이의 차이도 보이지 않는다.',
    'TensorBoard에 Loss/train과 Loss/val을 함께 남기면 두 곡선이 벌어지는 에폭이 보인다.',
    '손실이 멀쩡해도 층별 기울기 분포에서 배우지 않는 층을 찾을 수 있다.',
    '조기 종료는 val 손실로 판정하고, 멈춘 뒤 가장 좋았던 에폭의 가중치로 되돌린다.',
  ];
  const review = [
    { q: 'EarlyStopping을 붙였는데 100 에폭을 다 돌고 끝났다. 코드를 보니 stopper를 for 문 안에서 만들고 있다. 무엇이 문제인가?',
      o: ['patience가 너무 크다', '매 에폭 counter가 0으로 초기화된다', 'min_delta가 너무 작다'], a: 1,
      why: 'stopper는 에폭을 가로질러 counter와 best를 들고 있어야 한다. 루프 안에서 만들면 매번 새로 시작해 patience에 닿지 못한다.' },
    { q: 'train 손실로 조기 종료를 판정했더니 끝까지 멈추지 않았다. 이 장의 실험에서 그 이유는?',
      o: ['train 손실은 과적합 구간에서도 0.658에서 0.247까지 계속 내려가서', 'train 손실이 NaN이 되어서', 'min_delta를 0으로 둬서'], a: 0,
      why: '과적합은 train이 계속 좋아지는데 val이 나빠지는 상태다. 실험에서 val은 에폭 14의 0.499 뒤로 다시 올랐다.' },
    { q: 'best_state = model.state_dict()로 스냅샷을 떴더니 복원해도 마지막 가중치와 같았다. 원인은?',
      o: ['map_location을 빼먹어서', 'eval()을 안 불러서', 'state_dict가 같은 텐서를 가리켜 이후 학습에 함께 바뀌어서'], a: 2,
      why: 'state_dict()는 파라미터 텐서를 복사하지 않고 이름으로 묶어 보여 준다. copy.deepcopy로 떠야 그 순간의 값이 남는다.' },
  ];

  R.page({ title: '학습 계기판 — tqdm · TensorBoard · 조기 종료', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
