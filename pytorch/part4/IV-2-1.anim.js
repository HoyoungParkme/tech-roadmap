/* IV-2-1 PyTorch Lightning — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: 과학 2줄 · 잡무 11줄 · 루프 21줄(L13–33) 은 Step 1 코드의 주석 표시를 그대로 센 값이다.
 *       조기 종료 그림의 val_acc 곡선은 모양만 보여 주는 예시 곡선이다(값 눈금 없음). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 순수 루프 지도 ----------
  // Step 1 코드 L5–33: [줄 번호, 들여쓰기, 길이, 종류 s=과학 c=잡무 n=보통, 확대해서 보일 글]
  const CODE = [
    [5, 0, 12, 'n', 'import torch'], [7, 0, 58, 'n', 'device = "cuda" if ... else "cpu"'], [8, 0, 28, 'c', 'model = MyModel().to(device)'],
    [9, 0, 56, 'n', 'optimizer = Adam(model.parameters())'], [10, 0, 38, 'n', 'loss_fn = CrossEntropyLoss()'],
    [12, 0, 14, 'n', 'best_acc = 0.0'], [13, 0, 22, 'c', 'for epoch in range(10):'], [14, 4, 13, 'c', 'model.train()'],
    [15, 4, 25, 'n', 'for x, y in train_loader:'], [16, 8, 33, 'c', 'x, y = x.to(device), y.to(device)'], [17, 8, 21, 'c', 'optimizer.zero_grad()'],
    [18, 8, 17, 's', 'logits = model(x)'], [19, 8, 25, 's', 'loss = loss_fn(logits, y)'], [20, 8, 15, 'c', 'loss.backward()'], [21, 8, 16, 'c', 'optimizer.step()'],
    [23, 4, 12, 'c', 'model.eval()'], [24, 4, 11, 'n', 'correct = 0'], [25, 4, 21, 'c', 'with torch.no_grad():'], [26, 8, 23, 'n', 'for x, y in val_loader:'],
    [27, 12, 33, 'n', 'x, y = x.to(device), y.to(device)'], [28, 12, 46, 'n', 'correct += (pred == y).sum().item()'], [29, 4, 39, 'n', 'acc = correct / len(dataset)'],
    [30, 4, 18, 'c', 'if acc > best_acc:'], [31, 8, 14, 'n', 'best_acc = acc'], [32, 8, 40, 'n', 'torch.save(model.state_dict(), ...)'], [33, 4, 36, 'c', 'print(f"epoch {epoch} acc {acc}")'],
  ];
  const HL = [[5, 10], [12, 14], [15, 17], [18, 21], [23, 28], [29, 33]];
  const RY = (ln) => 56 + (ln - 5) * 12.4;
  function minimap(k, u, upTo) { const [a, b] = HL[k];
    tx(30, 38, 'Step 1 루프 (L5–33)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    CODE.forEach(([ln, ind, len, kind]) => { const on = ln >= a && ln <= b, seen = ln <= upTo, y = RY(ln);
      const col = !seen ? OFF : kind === 's' ? ACC : kind === 'c' ? WARN : MUT;
      el('rect', { x: 40 + ind * 4, y: y - 4, width: len * 4.2, height: 8, rx: 3, fill: col, opacity: on ? 1 : seen ? 0.55 : 0.4 });
      if (on) el('rect', { x: 34, y: y - 6.5, width: 4, height: 13, fill: INK, opacity: fade(u, 0.1) }); });
    el('rect', { x: 28, y: RY(a) - 9, width: 290, height: RY(b) - RY(a) + 18, rx: 6, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.15) }); }
  function zoom(k, u) { const [a, b] = HL[k], rows = CODE.filter(([ln]) => ln >= a && ln <= b);
    card(530, 70 + rows.length * 16, 360, rows.length * 32 + 24, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 0.2) });
    rows.forEach(([ln, ind, len, kind, txt], i) => { const y = 92 + i * 32, op = fade(u, 0.3 + i * 0.18), col = kind === 's' ? ACC : kind === 'c' ? WARN : INK;
      mono(370, y, txt.length > 36 ? txt.slice(0, 35) + '…' : txt, { 'font-size': 14, fill: col, 'font-weight': kind === 'n' ? 400 : 700, opacity: op });
      if (kind !== 'n') pill(756, y - 5, kind === 's' ? '과학' : '잡무', col, pop(u, 0.5 + i * 0.18), { fs: 13.5 }); }); }
  function tally(upTo, u) { const sc = CODE.filter((r) => r[0] <= upTo && r[3] === 's').length, ch = CODE.filter((r) => r[0] <= upTo && r[3] === 'c').length;
    const y = 330; tx(370, y, '과학', { 'font-size': 15, 'font-weight': 800, fill: ACC }); tx(370, y + 40, '잡무', { 'font-size': 15, 'font-weight': 800, fill: WARN });
    for (let i = 0; i < 11; i++) { el('rect', { x: 420 + i * 30, y: y + 28, width: 24, height: 16, rx: 3, fill: i < ch ? WARN : SOFT, opacity: i < ch ? 0.85 : 1 }); }
    for (let i = 0; i < 2; i++) el('rect', { x: 420 + i * 30, y: y - 12, width: 24, height: 16, rx: 3, fill: i < sc ? ACC : SOFT });
    mono(770, y + 41, ch + '줄', { 'font-size': 16, 'font-weight': 800, fill: WARN }); mono(490, y + 1, sc + '줄', { 'font-size': 16, 'font-weight': 800, fill: ACC }); }
  const TRAP = [null, 'train() 을 빼면 Dropout 이 꺼진 채 학습', 'device 한 줄 빠지면 cuda/cpu 불일치', null, 'eval() · no_grad() 를 빼도 에러가 안 난다', '다섯 줄을 프로젝트마다 복붙'];
  function s1(t, c) { const { k, u } = c, upTo = HL[k][1];
    minimap(k, u, upTo); zoom(k, u); tally(upTo, u);
    if (TRAP[k]) tx(930, 410, TRAP[k], { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.8) });
    else if (k === 3) tx(930, 410, '바뀌는 건 두 줄 · 뒤 두 줄은 어떤 모델이든 똑같다', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.8) });
    else tx(930, 410, '장치를 고르고 옮기는 두 줄은 어디서나 같다', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.8) }); }

  // ---------- 2. LightningModule 슬롯 ----------
  const SL = [['__init__', 'self.model = MyModel()', 'self.loss_fn = CrossEntropyLoss()'], ['training_step', 'logits = self.model(x)', 'loss = ... ; self.log(...)'], ['validation_step', 'acc = (pred == y).mean()', 'self.log("val_acc", acc)'], ['configure_optimizers', 'return Adam(self.parameters())', '']];
  const SX = 600, SY0 = 92, SH = 70;
  function slots(k, u) { card(SX + 30, 210, 420, 330, { rx: 12, stroke: ACC, sw: 2.5, fill: PANEL, s: k === 0 ? pop(u, 0.2) : 1 });
    mono(SX - 170, 64, 'class LitClassifier(L.LightningModule)', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.3) : 1 });
    SL.forEach(([n, a, b], i) => { const y = SY0 + i * (SH + 8), filled = k > i || (k === i + 1), cur = k - 1 === i, fu = cur ? E(u, 0.9, 1.6) : k - 1 > i ? 1 : 0;
      card(SX + 30, y + SH / 2, 396, SH, { rx: 8, stroke: fu > 0.5 ? ACC : GRID, dash: fu > 0.5 ? null : '6 5', fill: fu > 0.5 ? ACCBG : SOFT, sw: 1.8, op: k === 0 ? fade(u, 0.5 + i * 0.2) : 1 });
      mono(SX - 160, y + 22, 'def ' + n, { 'font-size': 14.5, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.5 + i * 0.2) : 1 });
      if (fu > 0) { mono(SX - 140, y + 44, a, { 'font-size': 13.5, fill: ACC, opacity: fu }); if (b) mono(SX - 140, y + 62, b, { 'font-size': 13.5, fill: ACC, opacity: fu }); } }); }
  function bin(items, u, k) { card(200, 360, 340, 84, { rx: 12, stroke: WARN, sw: 2, dash: '6 5', fill: WARNBG });
    tx(44, 336, 'Trainer 가 맡는 잡무', { 'font-size': 14, 'font-weight': 800, fill: WARN });
    items.forEach((s, i) => { const x = 60 + (i % 3) * 110, y = 364 + Math.floor(i / 3) * 26; mono(x, y, s, { 'font-size': 13.5, fill: WARN, 'text-decoration': 'line-through', opacity: i >= items.length - (NEWB[k] || 0) ? fade(u, 1.8) : 1 }); }); }
  const BIN = [[], ['.to(device)'], ['.to(device)', 'x.to(device)'], ['.to(device)', 'x.to(device)', 'zero_grad', 'backward', 'step'], ['.to(device)', 'x.to(device)', 'zero_grad', 'backward', 'step', 'eval()', 'no_grad'], ['.to(device)', 'x.to(device)', 'zero_grad', 'backward', 'step', 'eval()', 'no_grad', 'best 저장']];
  const NEWB = [0, 1, 1, 3, 2, 1];
  const SRC = [null, ['MyModel().to(device)', 0], ['logits · loss', 1], ['zero_grad · backward · step', 1], ['eval() + no_grad + 검증 루프', 2], ['Adam(model.parameters())', 3]];
  function s2(t, c) { const { k, u } = c; slots(k, u); bin(BIN[k], u, k);
    if (k === 0) { note(40, 130, '루프를 짤 자리는 없다', fade(u, 1.2)); note(40, 160, '채워 넣을 자리만 있다', fade(u, 1.5), { fill: ACC }); return; }
    const [src, si] = SRC[k], y = SY0 + si * (SH + 8) + SH / 2;
    card(200, 150, 330, 48, { rx: 10, text: src, fs: 14.5, mono: true, stroke: INK, op: 1 - fade(u, 0.9, 0.3) });
    tx(40, 110, '순수 루프에서', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (k !== 3) fly(260, 150, SX + 30, y, seg(u, 0.5, 1.2), k === 2 ? '과학 2줄' : '이사', { fill: ACC });
    fly(160, 180, 400, 318, seg(u, 0.6, 1.6), k === 1 ? '.to(device)' : k === 2 ? 'x.to(device)' : k === 3 ? '3박자' : k === 4 ? 'eval · no_grad' : 'best 저장', { fill: WARN, mono: true });
    if (k === 3) note(40, 240, 'return loss 하면 backward·step 은 Lightning 이', fade(u, 1.8), { fill: ACC });
    if (k === 2) note(40, 240, '순전파와 손실은 여전히 내가 쓴 코드', fade(u, 1.8), { fill: ACC });
    if (k === 4) note(40, 240, '가장 잦던 실수 두 줄이 코드에서 사라졌다', fade(u, 1.8), { fill: ACC });
    if (k === 5) note(40, 240, '과학은 내 손에, 잡무는 Trainer 로', fade(u, 1.8), { fill: ACC });
    if (k === 1) note(40, 240, '.to(device) 만 떨어져 나간다', fade(u, 1.8), { fill: ACC }); }

  // ---------- 3. Trainer ----------
  function gpu(x, y, s, label) { const g = G(x, y, s);
    el('rect', { x: -44, y: -30, width: 88, height: 60, rx: 6, fill: SOFT, stroke: INK, 'stroke-width': 2 }, g);
    for (let i = 0; i < 6; i++) el('line', { x1: -34 + i * 13, y1: 30, x2: -34 + i * 13, y2: 38, stroke: INK, 'stroke-width': 2 }, g);
    tx(0, 6, label, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono' }, g); }
  function machine(u, live) { card(640, 210, 300, 200, { rx: 16, stroke: ACC, sw: 3, fill: ACCBG, s: live ? pop(u, 0.2) : 1 });
    mono(640, 130, 'L.Trainer(', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); mono(640, 300, ')', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); }
  const ARGS = ['max_epochs=10', 'accelerator="gpu"', 'devices=2', 'precision="16-mixed"'];
  function args(n, u, k) { ARGS.slice(0, n).forEach((a, i) => mono(520, 170 + i * 32, a, { 'font-size': 15, 'font-weight': 700, opacity: i === n - 1 && k === i + 1 ? fade(u, 0.4) : 1 })); }
  const CHORES = ['epoch 루프', 'train/eval', 'device 이동', 'zero_grad', 'backward', 'step', 'no_grad', '진행바', '로깅'];
  function s3(t, c) { const { k, u } = c;
    card(150, 110, 220, 54, { rx: 10, text: 'LitClassifier()', fs: 16, mono: true, stroke: INK, sw: 2, s: k === 0 ? pop(u, 0.2) : 1 });
    if (k === 0) { note(40, 190, 'model = LitClassifier()', fade(u, 0.6), { class: 'mono' }); note(40, 230, '학습 방식은 아직 아무것도 정하지 않았다', fade(u, 1.2), { fill: MUT });
      ['CPU', 'GPU', 'GPU×2'].forEach((s, i) => gpu(140 + i * 140, 330, pop(u, 1.6 + i * 0.2) * 0.9, s)); sub(280, 400, '같은 모델을 어디서든 돌릴 수 있다', fade(u, 2.3)); return; }
    machine(u, k === 1);
    if (k <= 4) args(Math.min(4, k === 4 ? 4 : k === 1 ? 1 : k === 2 ? 3 : 4), u, k);
    if (k === 1) { card(220, 260, 300, 46, { rx: 10, text: 'for epoch in range(10):', fs: 15, mono: true, stroke: OFF, color: OFF, s: pop(u, 0.6) }); cross(220, 260, 16, pop(u, 1.2));
      note(60, 330, '"어떻게 도는지" 가 아니라 "몇 번" 만 적는다', fade(u, 1.6)); return; }
    if (k === 2) { const sp = E(u, 0.6, 1.4); gpu(150, 300, 0.9, 'GPU 0'); gpu(320, 300, 0.9 * sp, 'GPU 1');
      fly(150, 140, 150, 270, seg(u, 0.3, 0.9), 'model', { mono: true }); fly(150, 140, 320, 270, seg(u, 1.0, 1.7), 'model 복제', { mono: true });
      sub(235, 380, '.to(device) 도 분산 설정도 인자가 맡는다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 3) { const h = E(u, 0.6, 1.6);
      tx(40, 240, 'fp32', { 'font-size': 15, 'font-weight': 800, class: 'mono' }); for (let i = 0; i < 32; i++) el('rect', { x: 100 + i * 9, y: 228, width: 7, height: 16, rx: 1, fill: i === 0 ? BAD : i < 9 ? WARN : INFO, opacity: 0.8 });
      tx(40, 290, 'fp16', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: h }); for (let i = 0; i < 16; i++) el('rect', { x: 100 + i * 9, y: 278, width: 7, height: 16, rx: 1, fill: i === 0 ? BAD : i < 6 ? WARN : INFO, opacity: 0.8 * clamp(h * 16 - i) });
      mono(100, 330, '값 하나 4바이트 → 2바이트', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
      sub(220, 380, 'autocast · GradScaler 를 손으로 감쌀 필요가 없다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 4) { const col = E(u, 0.4, 1.6);
      for (let i = 0; i < 21; i++) { const y = lerp(180 + i * 10, 300, col); el('rect', { x: 40, y, width: lerp(60 + (i * 37 % 180), 400, col), height: lerp(6, 30, col) / (i ? 1 : 1), rx: 3, fill: i < 20 ? WARN : ACC, opacity: i === 0 ? 1 : 1 - col }); }
      tx(40, 168, 'Step 1 루프 L13–33 · 21줄', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: 1 - col * 0.5 });
      mono(46, 320, 'trainer.fit(model, train_loader, val_loader)', { 'font-size': 14.5, 'font-weight': 800, fill: PANEL, opacity: fade(u, 1.5) });
      sub(200, 370, '줄어든 건 공학 코드뿐 · 과학은 LightningModule 에 그대로', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 5) { mono(640, 210, 'trainer.fit(...)', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      CHORES.forEach((s, i) => { const x0 = 60 + (i % 3) * 120, y0 = 190 + Math.floor(i / 3) * 56, a = 0.3 + i * 0.2, f = E(u, a + 0.4, a + 1.0);
        card(x0 + 40, y0, 108, 36, { rx: 18, text: s, fs: 13.5, stroke: WARN, color: WARN, s: pop(u, a), op: 1 - 0.55 * f }); dot([[x0 + 94, y0], [490, 210]], seg(u, a + 0.4, a + 1.0), WARN, 6); });
      mono(640, 250, '잡무 9가지 흡수', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.3) }); return; }
    // k6
    ['trainer.fit(model, train, val)', 'trainer.validate(model, val)', 'trainer.predict(model, test)'].forEach((s, i) => pill(640, 150 + i * 50, s, i ? INFO : ACC, pop(u, 0.2 + i * 0.4), { mono: true, fs: 14, fill: PANEL }));
    note(40, 220, '학습 · 검증 · 추론이', fade(u, 1.2)); note(40, 250, '한 가지 사용법으로 묶인다', fade(u, 1.4));
    sub(480, 380, 'predict 는 predict_step(또는 forward) 이 정의돼 있어야 돈다', fade(u, 2.0), { 'font-size': 14.5 }); }

  // ---------- 4. 콜백과 로거 ----------
  const VA = (e) => 1 - 0.55 * Math.exp(-e / 3.5) - 0.0016 * Math.max(0, e - 12) ** 2;   // 모양만 보여 주는 예시 곡선 (12 에폭 뒤 하락)
  const PEAK = 12, STOP = 15;
  function curve(u, upTo, o) { o = o || {}; const ax = R.axes(470, 70, 440, 230, { x: [0, 50], y: [0.4, 1.02], xt: [0, 10, 20, 30, 40, 50], xl: 'epoch', yl: 'val_acc' });
    const P = []; for (let e = 1; e <= upTo; e++) P.push([e, VA(e)]);
    R.line(ax, P, o.g ?? 1, INFO, { sw: 3 }); P.forEach(([e, v], i) => { if (i / P.length <= (o.g ?? 1)) el('circle', { cx: ax.X(e), cy: ax.Y(v), r: 3.5, fill: INFO }); });
    tx(910, 400, '예시 곡선', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); return ax; }
  const star = (x, y, s, col) => el('path', { d: `M${x},${y - 11} l3.5,7 l8,1 l-6,5.5 l1.6,8 l-7.1,-4 l-7.1,4 l1.6,-8 l-6,-5.5 l8,-1 z`, fill: col || WARN, opacity: s });
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [['EarlyStopping', '언제 멈출지', GOOD], ['ModelCheckpoint', '언제 저장할지', GOOD]].forEach(([n, d, col], i) => { const x = 230, y = 120 + i * 80; card(x, y, 320, 60, { rx: 10, stroke: col, sw: 2, s: pop(u, 0.2 + i * 0.3) });
        mono(x - 140, y - 2, n, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.3) }); tx(x - 140, y + 20, d, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      [['TensorBoardLogger', '로컬'], ['WandbLogger', '팀 · 클라우드']].forEach(([n, d], i) => { const x = 700, y = 120 + i * 80; card(x, y, 320, 60, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 1.0 + i * 0.3) });
        mono(x - 140, y - 2, n, { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.1 + i * 0.3) }); tx(x - 140, y + 20, d, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.1 + i * 0.3) }); });
      tx(230, 60, '콜백 · 끼어들기', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD }); tx(700, 60, '로거 · 관측 도구', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
      note(130, 340, '둘 다 실험 코드(LightningModule) 바깥에 있다', fade(u, 1.9)); return; }
    if (k === 1 || k === 2 || k === 4) { const upTo = STOP, g = k === 1 ? E(u, 0.2, 2.2) : 1, ax = curve(u, upTo, { g });
      const cur = Math.max(1, Math.round(g * upTo)), wait = Math.max(0, cur - PEAK);
      if (k === 4) { el('rect', { x: ax.X(STOP), y: 70, width: ax.X(50) - ax.X(STOP), height: 230, fill: SOFT, opacity: 0.8 }); tx(ax.X(32), 190, 'max_epochs=50 까지 안 간다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6) }); }
      if (k === 1 || k === 4) { card(230, 130, 330, 60, { rx: 10, stroke: GOOD, sw: 2 }); mono(230, 126, 'EarlyStopping(patience=3)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
        mono(230, 148, 'monitor="val_acc", mode="max"', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
        for (let i = 0; i < 3; i++) { el('circle', { cx: 180 + i * 50, cy: 220, r: 16, fill: i < wait ? BAD : SOFT, stroke: BAD, 'stroke-width': 2 }); mono(180 + i * 50, 225, String(i + 1), { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: i < wait ? PANEL : BAD }); }
        tx(230, 262, '나아지지 않은 에폭 수', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
        if (wait >= 3) { el('line', { x1: ax.X(STOP), y1: 70, x2: ax.X(STOP), y2: 300, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }); mono(ax.X(STOP) + 6, 88, 'STOP', { 'font-size': 15, 'font-weight': 800, fill: BAD }); } }
      if (k === 4) { mono(40, 330, 'L.Trainer(max_epochs=50,', { 'font-size': 15, 'font-weight': 700 }); mono(60, 356, 'callbacks=[early, ckpt], logger=logger)', { 'font-size': 15, fill: ACC });
        sub(230, 396, '멈출 시점은 콜백이 정한다', fade(u, 1.4), { 'font-size': 14.5 }); }
      if (k === 2) { star(ax.X(PEAK), ax.Y(VA(PEAK)) - 18, pop(u, 0.6));
        card(230, 140, 330, 70, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.3) }); mono(230, 134, 'ModelCheckpoint(save_top_k=1)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.4) });
        mono(230, 160, 'monitor="val_acc", mode="max"', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5) });
        fly(ax.X(PEAK), ax.Y(VA(PEAK)) - 18, 230, 250, seg(u, 1.0, 1.8), 'best-{epoch}-{val_acc:.3f}.ckpt', { fill: WARN, mono: true, stay: true });
        card(230, 320, 330, 56, { rx: 10, stroke: OFF, dash: '5 4', s: pop(u, 1.8) }); mono(230, 316, 'if acc > best_acc: torch.save(...)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: OFF, opacity: fade(u, 1.9) }); cross(230, 320, 14, pop(u, 2.1));
        tx(230, 362, 'Step 1 의 손수 저장 로직', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }
      return; }
    if (k === 3) { const ph = E(u, 1.2, 1.8), tgt = ph < 0.5 ? 0 : 1;
      card(150, 210, 200, 70, { rx: 10, text: 'self.log(...)', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      const L = [['TensorBoardLogger("logs/")', INFO], ['WandbLogger(project=...)', INFO], ['CSVLogger', WARN]];
      L.forEach(([n, col], i) => { const y = 110 + i * 100, on = i === tgt; card(700, y, 360, 60, { rx: 10, stroke: on ? col : GRID, sw: on ? 3 : 1.5, fill: on ? INFOBG : PANEL, s: pop(u, 0.3 + i * 0.2) });
        mono(700, y + 5, n, { 'font-size': 14.5, 'font-weight': on ? 800 : 400, 'text-anchor': 'middle', fill: on ? col : MUT }); });
      for (let j = 0; j < 4; j++) dot([[250, 210], [400, 210], [520, 110 + tgt * 100]], ((u * 0.8 + j / 4) % 1), ACC, 5);
      sub(480, 400, 'logger= 한 줄만 바꾸면 같은 지표가 다른 대시보드로 간다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k5
    mono(40, 80, 'print(ckpt.best_model_path)', { 'font-size': 16, 'font-weight': 800 });
    card(320, 130, 560, 48, { rx: 10, fill: INK, stroke: 'none', s: pop(u, 0.4) }); mono(60, 136, '…/checkpoints/best-epoch=…-val_acc=….ckpt', { 'font-size': 14.5, fill: 'var(--term)', opacity: fade(u, 0.6) });
    [['EarlyStopping', 'tf.keras EarlyStopping'], ['ModelCheckpoint', 'tf.keras ModelCheckpoint'], ['LearningRateMonitor', 'LearningRateScheduler 계열']].forEach(([a, b], i) => { const y = 230 + i * 50, s = pop(u, 1.0 + i * 0.3);
      card(230, y, 280, 40, { rx: 20, text: a, fs: 14.5, mono: true, stroke: GOOD, color: GOOD, s }); grow(380, y, 560, y, seg(u, 1.2 + i * 0.3, 1.6 + i * 0.3), MUT, { plain: true }); grow(560, y, 380, y, seg(u, 1.2 + i * 0.3, 1.6 + i * 0.3), MUT, { plain: true });
      card(720, y, 300, 40, { rx: 20, text: b, fs: 14, mono: true, stroke: INFO, color: INFO, s }); });
    tx(230, 200, 'Lightning', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD }); tx(720, 200, 'TF / Keras', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
    sub(480, 400, '루프는 프레임워크가, 끼어들기는 콜백으로 · 두 진영이 같은 답에 닿았다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 5. 도입 판단 ----------
  const LC = ['팀 협업 · 코드 표준화', '멀티 GPU/TPU · AMP', '실험 관리(콜백·로거)'], PC = ['루프를 배우는 교육 단계', 'GAN·RL 등 비표준 루프', '의존성 최소화 배포'];
  function scale(nL, nR, u, k) { const tilt = (nL - nR) * 4 * (Math.PI / 180), cx = 480, cy = 120, arm = 300;
    el('path', { d: `M${cx - 40},380 L${cx + 40},380 L${cx},${cy + 6} Z`, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    const lx = cx - arm * Math.cos(tilt), ly = cy + arm * Math.sin(tilt), rx = cx + arm * Math.cos(tilt), ry = cy - arm * Math.sin(tilt);
    el('line', { x1: lx, y1: ly, x2: rx, y2: ry, stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }); el('circle', { cx, cy, r: 7, fill: INK });
    [[lx, ly, LC, nL, ACC, 'Lightning 이 이득'], [rx, ry, PC, nR, INFO, '순수 PyTorch 가 유리']].forEach(([x, y, items, n, col, title]) => {
      el('line', { x1: x, y1: y, x2: x, y2: y + 40, stroke: MUT, 'stroke-width': 1.5 });
      el('path', { d: `M${x - 120},${y + 40} L${x + 120},${y + 40} L${x + 100},${y + 54} L${x - 100},${y + 54} Z`, fill: col, opacity: 0.25, stroke: col, 'stroke-width': 1.5 });
      tx(x, y + 76, title, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col });
      items.slice(0, n).forEach((s, i) => card(x, y + 34 - i * 34, 230, 30, { rx: 6, text: s, fs: 14, stroke: col, fill: PANEL, color: INK, sw: 1.5, s: pop(u, 0.4 + i * 0.3) })); }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { const nR = k === 0 ? 0 : 3; scale(3, k === 1 ? Math.round(E(u, 0.1, 1.0) * 3) : nR, u, k);
      if (k === 2) { card(480, 300, 300, 60, { rx: 30, fill: GOODBG, stroke: GOOD, sw: 2.5, s: pop(u, 0.4) }); mono(480, 296, 'Lightning Fabric', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.5) });
        tx(480, 318, '구조는 그대로 · 잡무만 위임', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.7) }); }
      if (k === 1) sub(480, 410, '옵티마이저가 여럿이고 순서가 특이한 루프는 틀에 끼우는 비용이 더 크다', fade(u, 2.0), { 'font-size': 14.5 });
      return; }
    if (k === 3) { const A = [['accelerator', '"gpu"'], ['devices', '2'], ['precision', '"16-mixed"']];
      [['L.Trainer(', ACC, 240], ['L.Fabric(', GOOD, 720]].forEach(([n, col, x], j) => { card(x, 210, 380, 210, { rx: 12, stroke: col, sw: 2.5, s: pop(u, 0.2 + j * 0.5) }); mono(x - 170, 130, n, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + j * 0.5) });
        A.forEach(([a, b], i) => mono(x - 150, 175 + i * 36, `${a}=${b},`, { 'font-size': 15, opacity: fade(u, 0.5 + j * 0.5 + i * 0.15) })); });
      for (let i = 0; i < 3; i++) grow(440, 170 + i * 36, 520, 170 + i * 36, seg(u, 1.6 + i * 0.15, 1.9 + i * 0.15), GOOD, { plain: true, dash: '4 4' });
      mono(720, 300, 'fabric.launch()', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.1) });
      sub(480, 370, '인자 이름이 같아서 나중에 Trainer 로 옮길 때 그대로 쓴다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 4) { el('rect', { x: 430, y: 70, width: 100, height: 280, rx: 12, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.5 });
      tx(480, 60, 'fabric.setup', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, class: 'mono' });
      ['model', 'optimizer', 'train_loader'].forEach((s, i) => { const y = 120 + i * 90, f = E(u, 0.3 + i * 0.4, 1.3 + i * 0.4), x = lerp(180, 760, f);
        card(x, y, 170, 46, { rx: 10, text: s, fs: 15, mono: true, stroke: f > 0.6 ? GOOD : INK, sw: f > 0.6 ? 3 : 2, color: f > 0.6 ? GOOD : INK }); });
      card(180, 380, 220, 34, { rx: 17, text: '.to(device)', fs: 14, mono: true, stroke: OFF, color: OFF, s: pop(u, 1.8) }); cross(180, 380, 12, pop(u, 2.1));
      sub(760, 400, '모델도 옵티마이저도 원래 쓰던 순수 PyTorch 객체 그대로', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 5) { const LN = ['for epoch in range(10):', '    for x, y in train_loader:', '        optimizer.zero_grad()', '        loss = loss_fn(model(x), y)', '        loss.backward()', '        optimizer.step()'];
      card(400, 210, 700, 260, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5 });
      LN.forEach((l, i) => { const y = 110 + i * 38;
        if (i === 4) { const f = E(u, 0.8, 1.6); mono(70, y, l, { 'font-size': 16, fill: BAD, opacity: 1 - f, 'text-decoration': 'line-through' }); mono(70, y, '        fabric.backward(loss)', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: f }); }
        else mono(70, y, l, { 'font-size': 16, opacity: fade(u, 0.1 + i * 0.1) }); });
      pill(830, 262, '바뀐 줄 하나', GOOD, pop(u, 1.8), { fs: 14 });
      note(70, 380, '루프는 여전히 내 것 · AMP 처리는 fabric.backward 가 한다', fade(u, 2.1)); return; }
    // k6
    scale(3, 3, u, 6); banner(480, 300, '다음 장 IV-2-2 · Hugging Face', pop(u, 0.4)); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'Step 1의 순수 학습 루프에서 프로젝트마다 실제로 달라지는 "과학" 코드는 무엇인가?',
      o: ['model.train()과 model.eval()', 'logits = model(x)와 loss = loss_fn(logits, y)', 'loss.backward()와 optimizer.step()'], a: 1,
      why: '코드 주석으로 세면 과학은 순전파·손실 2줄, 잡무는 11줄이다. backward·step은 어떤 모델을 쓰든 글자 그대로 같다.' },
    { q: 'LightningModule로 옮긴 뒤 training_step에 남는 것은 무엇인가?',
      o: ['한 배치의 순전파와 손실 계산', 'epoch 루프와 device 이동', 'zero_grad, backward, step'], a: 0,
      why: 'training_step은 배치 하나를 어떻게 처리할지만 쓴다. loss를 돌려주면 backward·step은 Lightning이 한다.' },
    { q: 'Trainer에 precision="16-mixed" 를 주면 무엇이 달라지는가?',
      o: ['모델 구조가 절반 크기로 바뀐다', '학습 루프를 다시 짜야 한다', 'autocast·GradScaler 없이 혼합정밀(AMP) 학습이 켜진다'], a: 2,
      why: '학습 방식은 인자로 선언한다. 같은 LightningModule을 그대로 두고 precision 인자 하나로 AMP가 켜진다.' },
    { q: 'EarlyStopping(monitor="val_acc", patience=3)이 학습을 멈추는 때는 언제인가?',
      o: ['val_acc가 3 에폭 연속 나아지지 않았을 때', '학습을 시작하고 3 에폭이 지났을 때', 'val_acc가 0.3 아래로 떨어졌을 때'], a: 0,
      why: 'patience는 개선 없이 기다릴 에폭 수다. monitor 이름은 validation_step에서 self.log로 남긴 키와 같아야 한다.' },
    { q: 'Lightning Fabric이 알맞은 상황은 무엇인가?',
      o: ['루프를 전혀 보고 싶지 않을 때', '내 순수 루프 구조는 그대로 두고 device·분산·AMP만 얹고 싶을 때', 'Keras 모델을 PyTorch로 옮길 때'], a: 1,
      why: 'Fabric은 LightningModule로 바꾸지 않는다. fabric.setup으로 감싸고 loss.backward()를 fabric.backward(loss)로 바꾸면 된다.' },
  ];

  const summary = [
    '순수 학습 루프에서 프로젝트마다 바뀌는 과학은 2줄이고 잡무는 11줄이다.',
    'LightningModule은 코드를 지우지 않고 __init__, training_step 같은 자리로 옮긴다.',
    'Trainer 인자만 바꿔 epoch 수, 장치, 혼합정밀을 정하고 fit 한 줄로 학습한다.',
    '끼어들기는 콜백, 관측은 로거로 빼고, 루프를 지키고 싶으면 Fabric을 쓴다.',
  ];
  const review = [
    { q: 'Lightning으로 옮겼더니 trainer.predict에서 forward가 없다는 오류가 났다. 고칠 곳은?',
      o: ['Trainer의 accelerator 인자', 'LitClassifier에 predict_step이나 forward를 정의한다', 'validation_step에서 self.log를 지운다'], a: 1,
      why: 'Trainer는 배치마다 predict_step을 부르고, 기본 구현은 forward를 부른다. 이 장의 LitClassifier는 둘 다 없어서 직접 정의해야 한다.' },
    { q: 'EarlyStopping을 붙였는데 50 에폭을 끝까지 돈다. 가장 먼저 확인할 것은?',
      o: ['monitor 이름이 self.log로 남긴 키와 같은지', 'precision을 16-mixed로 했는지', 'devices를 2로 했는지'], a: 0,
      why: '콜백은 self.log로 남긴 이름을 지켜본다. "val_acc" 와 다른 이름을 적으면 조용히 동작하지 않는다.' },
    { q: 'GAN처럼 옵티마이저 두 개를 번갈아 쓰는 루프를 멀티 GPU로 돌리고 싶다. 알맞은 선택은?',
      o: ['Trainer의 기본 fit에 그대로 맞춘다', 'Keras의 model.fit으로 옮긴다', 'Fabric으로 내 루프를 유지하고 setup과 backward만 바꾼다'], a: 2,
      why: '비표준 루프는 프레임워크 틀에 끼우는 비용이 크다. Fabric은 루프를 내 손에 두고 장치·분산·AMP만 얹어 준다.' },
  ];

  R.page({ title: 'Lightning으로 옮기기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
