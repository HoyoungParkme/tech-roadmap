/* I-2-2 GPU로 보내기 — device·메모리 관리 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, grow, fly, dot, cells, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c, j, a = 0.2, d = 0.7) => (c.k > j ? 1 : c.k === j ? E(c.u, a, a + d) : 0);
  const pp = (c, j, a = 0.2) => (c.k > j ? 1 : c.k === j ? pop(c.u, a) : 0);
  // 칩(CPU/GPU): 핀 + 코어 격자
  function chip(cx, cy, w, h, name, o) { o = o || {}; const col = o.col || INK, g = R.G(cx, cy, 1, o.op ?? 1), np = Math.max(3, Math.floor(w / 34));
    for (let i = 0; i < np; i++) { const px = -w / 2 + 20 + (i * (w - 40)) / (np - 1);
      el('line', { x1: px, y1: -h / 2 - 9, x2: px, y2: -h / 2, stroke: col, 'stroke-width': 3 }, g); el('line', { x1: px, y1: h / 2, x2: px, y2: h / 2 + 9, stroke: col, 'stroke-width': 3 }, g); }
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    const [cn, rn] = o.cores || [2, 1], cs = o.cs || 12, gp = 4, x0 = -(cn * (cs + gp) - gp) / 2, y0 = h / 2 - rn * (cs + gp) - 10;
    for (let r = 0; r < rn; r++) for (let q = 0; q < cn; q++) el('rect', { x: x0 + q * (cs + gp), y: y0 + r * (cs + gp), width: cs, height: cs, rx: 2, fill: o.lit ? col : SOFT, opacity: o.lit ? 0.35 : 1 }, g);
    tx(-w / 2 + 16, -h / 2 + 26, name, { 'font-size': 16, 'font-weight': 800, fill: col }, g); return g; }
  const CPU = [200, 250], GPU = [760, 250], CW = 290, CH = 190;
  function rooms(o) { o = o || {};
    chip(CPU[0], CPU[1], CW, CH, 'CPU', { cores: [4, 1], cs: 16, lit: o.cpu });
    chip(GPU[0], GPU[1], CW, CH, o.gname || 'GPU  cuda:0', { cores: [16, 2], cs: 9, col: ACC, lit: o.gpu, dash: o.gdash, op: o.gop });
    el('line', { x1: CPU[0] + CW / 2 + 4, y1: CPU[1] + 50, x2: GPU[0] - CW / 2 - 4, y2: GPU[1] + 50, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: o.bus ?? 1 }); }
  // 작은 텐서 덩어리 (rows×cols 칸)
  function blk(cx, cy, rows, cols, col, s, label, o) { o = o || {}; const cs = o.cs || 14, w = cols * cs, h = rows * cs; if (s <= 0) return; const g = R.G(cx, cy, s, o.op ?? 1);
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) el('rect', { x: -w / 2 + q * cs, y: -h / 2 + r * cs, width: cs - 2, height: cs - 2, rx: 2, fill: o.fill || PANEL, stroke: col, 'stroke-width': 1.4 }, g);
    if (label) mono(0, h / 2 + 20, label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col }, g); }

  // =========================================================
  // 1. device 기본기 — 한 번 정하고 모두 .to(device)
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k === 2) chip(GPU[0] + 22, GPU[1] - 22, CW, CH, '', { col: ACC, dash: '6 5', op: fade(c.u, 0.3) * 0.6 });
    rooms({ gdash: k === 0 ? '7 5' : null, gop: k === 0 ? 0.5 : 1, cpu: k === 0 ? 1 : 0, gpu: k === 5 ? 1 : 0, gname: k === 0 ? 'GPU (있으면)' : 'GPU  cuda:0' });
    if (k === 0) { pill(CPU[0], 70, '기본 device = cpu', INK, pop(u, 0.3), { fs: 15 });
      blk(CPU[0], 220, 2, 4, INK, pop(u, 0.8), 'torch.randn(2, 4)');
      tx(480, 400, '아무것도 지정하지 않으면 텐서와 모델은 CPU 에서 만들어진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { const pu = E(u, 0.5, 1.2);
      pill(480, 46, 'torch.cuda.is_available()', INK, pop(u, 0.2), { mono: true, fs: 15 });
      grow(400, 60, CPU[0] + 40, CPU[1] - CH / 2 - 14, pu, MUT); grow(560, 60, GPU[0] - 40, GPU[1] - CH / 2 - 14, pu, ACC);
      mono(290, 104, 'False → cpu', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(670, 104, 'True → cuda', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      pill(480, 400, 'device = torch.device(...)  ← 파일 맨 위에서 한 번', ACC, pop(u, 1.8), { mono: true, fs: 14 }); return; }
    pill(480, 46, 'device', ACC, 1, { mono: true, fs: 15 });
    if (k === 2) { // 장 수 (예시)
      tx(GPU[0] + CW / 2 + 4, GPU[1] - CH / 2 - 30, 'cuda:1', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      ['device_count()   → 2   (예시)', 'current_device() → 0', '"cuda" == "cuda:0"'].forEach((s, i) => mono(GPU[0] - 125, 220 + i * 28, s, { 'font-size': 14.5, 'font-weight': 700, fill: i === 2 ? ACC : INK, opacity: fade(u, 0.8 + i * 0.4) }));
      tx(CPU[0], 250, 'GPU 가 여러 장이면', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(CPU[0], 276, '인덱스로 지목한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { const f = E(u, 0.5, 1.3);
      blk(CPU[0], 210, 3, 4, INK, 1, null, { op: 1 - 0.6 * E(u, 1.4, 1.8) });
      fly(CPU[0] + 50, 210, GPU[0] - 50, 210, seg(u, 0.5, 1.3), '(3, 4)', { mono: true });
      blk(GPU[0], 210, 3, 4, ACC, u > 1.3 ? 1 : 0, null, { fill: ACCBG });
      const nx = lerp(CPU[0], GPU[0], E(u, 1.4, 2.0));
      pill(nx, 140, 'x', u > 1.4 ? ACC : INK, 1, { mono: true, fs: 16 });
      mono(480, 92, 'x = x.to(device)', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      tx(480, 400, '.to() 는 새 텐서를 준다. 다시 받지 않으면 x 는 CPU 그대로다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    blk(GPU[0] - 80, 210, 3, 4, ACC, 1, 'x', { fill: ACCBG });
    if (k === 4) { const f = E(u, 0.6, 1.5);
      card(480, 92, 220, 54, { rx: 10, stroke: INFO, sw: 2.2, text: 'model = Linear(4, 2)', fs: 15, mono: true, color: INFO, s: pop(u, 0.2) });
      const wx = lerp(CPU[0] - 30, GPU[0] + 50, f), bx = lerp(CPU[0] + 60, GPU[0] + 120, f);
      blk(wx, 210, 2, 4, INFO, 1, 'weight', { fill: INFOBG }); blk(bx, 210, 2, 1, INFO, 1, 'bias', { fill: INFOBG });
      grow(480, 120, lerp(CPU[0], GPU[0] + 70, f), 186, 1, INFO, { dash: '4 4' });
      mono(480, 400, 'model.to(device) : 같은 model 객체, 파라미터만 이동 (in-place)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) }); return; }
    blk(GPU[0] + 50, 210, 2, 4, INFO, 1, 'weight', { fill: INFOBG }); blk(GPU[0] + 120, 210, 2, 1, INFO, 1, 'bias', { fill: INFOBG });
    blk(GPU[0], 282, 3, 2, ACC, pop(u, 0.8), null, { fill: ACC, cs: 12 }); mono(GPU[0] + 30, 287, 'y', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
    mono(480, 92, 'y = model(x)   →   y.device = cuda:0', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
    if (u > 1.2) check(GPU[0] + 100, 282, 12, pop(u, 1.2));
    tx(CPU[0], 250, '둘 다 같은 device', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }

  // =========================================================
  // 2. 같은 device 원칙 — 배치는 매 스텝 옮긴다
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    if (k < 7) { rooms({ gpu: k === 6 ? 1 : 0 }); blk(GPU[0] + 70, 215, 2, 4, INFO, pp(c, 0, 0.3), 'model', { fill: INFOBG }); }
    if (k === 0) { mono(480, 70, 'model = nn.Linear(4, 2).to(device)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      tx(480, 400, '모델을 옮기는 것까지는 쉽다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    // DataLoader 컨베이어 → CPU
    const belt = (op) => { el('line', { x1: 20, y1: 120, x2: CPU[0] - 40, y2: 120, stroke: OFF, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: op }); tx(24, 100, 'DataLoader', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op }); };
    if (k < 7) belt(at(c, 1, 0.1));
    const xbIn = k === 1 ? E(u, 0.3, 1.1) : 1;
    if (k <= 4) blk(lerp(40, CPU[0] - 40, xbIn), lerp(120, 215, xbIn), 2, 4, INK, 1, xbIn > 0.95 ? 'xb (8, 4)' : null, { cs: 12 });
    if (k === 1) { tx(480, 400, 'DataLoader 가 주는 배치는 CPU 텐서다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 2 || k === 3) { grow(CPU[0] - 10, 196, GPU[0] - 20, 196, k === 2 ? E(u, 0.3, 1.0) : 1, BAD, { dash: '6 4' });
      if (k === 2 ? u > 1.0 : true) cross(480, 196, 15, k === 2 ? pop(u, 1.0) : 1);
      mono(480, 70, 'out = model(xb)', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD });
      if (k === 2) { tx(480, 400, '모델은 cuda:0, 입력은 cpu. forward 에서 바로 터진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
      card(480, 380, 760, 60, { rx: 10, fill: BADBG, stroke: BAD, sw: 2, s: pop(u, 0.2) });
      R.spans(120, 375, [['RuntimeError: Expected all tensors to be on the same device,', { fill: BAD }]], { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) });
      R.spans(120, 397, [['but found cuda:0 and ', { fill: BAD }], ['cpu', { fill: BAD, 'font-weight': 800, 'text-decoration': 'underline' }]], { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.4) });
      grow(300, 352, CPU[0] - 10, 260, E(u, 1.0, 1.6), BAD); tx(362, 322, '안 옮긴 범인', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) }); return; }
    if (k === 4) { card(480, 80, 280, 54, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.2) });
      mono(480, 76, 'opt = SGD(model.parameters())', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      tx(480, 98, 'loss_fn = MSELoss()', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4), class: 'mono' });
      grow(600, 96, GPU[0] + 50, 190, E(u, 0.8, 1.4), INFO);
      tx(480, 400, '옵티마이저는 이미 GPU 에 있는 파라미터를 가리킨다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 5) { [0, 1].forEach((b) => { const d = b * 1.1;
        const a1 = E(u, 0.1 + d, 0.5 + d); if (a1 > 0 && a1 < 1) blk(lerp(40, CPU[0] - 40, a1), lerp(120, 215, a1), 2, 4, INK, 1, null, { cs: 12 });
        fly(CPU[0], 200, GPU[0] - 60, 200, seg(u, 0.5 + d, 1.1 + d), 'xb', { mono: true }); fly(CPU[0], 240, GPU[0] - 60, 240, seg(u, 0.6 + d, 1.2 + d), 'yb', { mono: true, fill: WARN }); });
      mono(480, 70, 'xb, yb = xb.to(device), yb.to(device)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.1) });
      tx(480, 400, '배치는 매 스텝 새로 오니 매번 옮긴다. 라벨도 함께', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 6) { const st = ['forward', 'loss', 'backward', 'step'];
      st.forEach((s, i) => pill(GPU[0] - 100 + i * 66, 290, s, ACC, pop(u, 0.2 + i * 0.2), { mono: true, fs: 13.5 }));
      dot([[GPU[0] - 130, 268], [GPU[0] + 130, 268]], (u * 0.8) % 1, ACC, 6);
      blk(GPU[0] - 70, 205, 2, 4, ACC, 1, 'xb · yb', { cs: 12, fill: ACCBG });
      mono(480, 70, 'pred = model(xb); loss.backward(); opt.step()', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      tx(480, 400, '입력·라벨·모델이 모두 cuda:0. 학습 루프가 그대로 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k7: 흔한 범인
    tx(480, 68, '"found A and B" 를 먼저 읽고, 남은 쪽을 찾는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
    [['입력 x', 'xb = xb.to(device)'], ['라벨 y', 'yb = yb.to(device)'], ['직접 만든 상수 텐서', 'ones(..., device=device)']].forEach(([a, b], i) => { const x = 170 + i * 310;
      card(x, 200, 280, 120, { rx: 12, stroke: BAD, sw: 2.2, s: pop(u, 0.3 + i * 0.3) });
      tx(x, 180, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4 + i * 0.3) });
      mono(x, 220, b, { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.25) }); });
    tx(480, 340, '가중치·마스크처럼 코드에서 만든 텐서도 device 를 지정한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // =========================================================
  // 3. 전송 비용 — H2D 복사 · 겹치기 · 동기화
  // =========================================================
  function tl(x, y, segs, u0, unit) { segs.forEach(([a, w, col, label], i) => { const s = clamp((u0 - a / 10) * 4); if (s <= 0) return;
      el('rect', { x: x + a * unit, y, width: Math.max(0, w * unit * s - 2), height: 30, rx: 4, fill: col, opacity: 0.8 });
      if (label && s > 0.9) tx(x + a * unit + (w * unit) / 2, y + 20, label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: PANEL }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0 || k === 1 || k === 3 || k === 6) {
      chip(CPU[0], CPU[1], CW, CH, 'CPU 메모리', { cores: [4, 1], cs: 16 }); chip(GPU[0], GPU[1], CW, CH, 'GPU 메모리', { cores: [16, 2], cs: 9, col: ACC, lit: k === 3 ? 1 : 0 });
      el('line', { x1: CPU[0] + CW / 2 + 4, y1: 250, x2: GPU[0] - CW / 2 - 4, y2: 250, stroke: GRID, 'stroke-width': 10, 'stroke-linecap': 'round' });
      tx(480, 236, 'PCIe', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: MUT });
      if (k === 0) { [0, 0.5, 1.0].forEach((d) => dot([[CPU[0] + CW / 2, 250], [GPU[0] - CW / 2, 250]], seg(u, 0.4 + d, 1.2 + d), ACC, 9));
        pill(480, 290, 'H2D 복사', ACC, pop(u, 0.3), { fs: 15 });
        tx(480, 70, '배치마다 CPU → GPU 로 실제 데이터가 버스를 탄다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) }); return; }
      if (k === 1) { for (let r = 0; r < 3; r++) for (let q = 0; q < 5; q++) { const i = r * 5 + q, pin = i < 5;
          el('rect', { x: CPU[0] - 110 + q * 44, y: 190 + r * 34, width: 38, height: 28, rx: 4, fill: pin && u > 0.8 ? ACCBG : SOFT, stroke: pin && u > 0.8 ? ACC : GRID, 'stroke-width': 1.6 });
          if (pin && u > 0.8) lock(CPU[0] - 91 + q * 44, 206, true, ACC, 0.55 * pop(u, 0.8 + q * 0.1)); }
        pill(CPU[0], 92, 'pin_memory=True', ACC, pop(u, 0.3), { mono: true, fs: 15 });
        tx(CPU[0] + 160, 160, '페이지 고정', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
        tx(660, 90, 'non_blocking 전송의 전제 조건', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
      if (k === 3) { ['forward', 'backward', 'step'].forEach((s, i) => pill(GPU[0] - 96 + i * 100, 205, s, ACC, pop(u, 0.3 + i * 0.3), { mono: true, fs: 14 }));
        tx(480, 280, '왕복 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.2) });
        tx(480, 70, '옮겨진 배치로 GPU 안에서 끝낸다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
        tx(480, 400, 'GPU 연산은 큐에 쌓이고, CPU 가 결과를 읽는 순간 동기화된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
      // k6 상주
      blk(GPU[0], 210, 4, 10, ACC, pop(u, 0.4), 'X (상주)', { fill: ACCBG, cs: 12 });
      fly(CPU[0], 250, GPU[0] - 60, 250, seg(u, 0.2, 0.7), 'X', { mono: true });
      mono(480, 70, 'X = X.to(device)   # 한 번만', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.1) });
      tx(480, 290, '이후 버스는 쉰다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.2) });
      tx(480, 400, '데이터가 GPU 메모리에 들어가면 반복 전송 자체가 사라진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    const X0 = 190, U = 34;
    if (k === 2) { const uu = u * 1.2;
      tx(60, 96, '동기 복사', { 'font-size': 15, 'font-weight': 800 }); tl(X0, 76, [[0, 3, WARN, '복사'], [3, 4, ACC, '연산'], [7, 3, WARN, '복사'], [10, 4, ACC, '연산']], uu, U);
      tx(X0, 144, 'pin_memory + non_blocking', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      tx(60, 176, '복사', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(60, 226, '연산', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      tl(X0, 156, [[0, 3, WARN, '복사1'], [3, 3, WARN, '복사2'], [7, 3, WARN, '복사3']], uu, U); tl(X0, 206, [[3, 4, ACC, '연산1'], [7, 4, ACC, '연산2']], uu, U);
      tx(480, 320, '다음 배치 복사를 지금 연산 뒤에 숨긴다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) });
      tx(480, 380, '개념도: 칸 길이는 실제 시간이 아니다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); return; }
    if (k === 4) { const uu = u * 1.2;
      tx(60, 116, 'GPU', { 'font-size': 15, 'font-weight': 800, fill: ACC }); tl(X0, 96, [[0, 3, ACC, '스텝1'], [5, 3, ACC, '스텝2'], [10, 3, ACC, '스텝3']], uu, U);
      tx(60, 186, 'CPU', { 'font-size': 15, 'font-weight': 800 }); tl(X0, 166, [[3, 2, BAD, '대기'], [8, 2, BAD, '대기'], [13, 2, BAD, '대기']], uu, U);
      mono(480, 270, 'print(loss.cpu().numpy())  /  running += loss.item()', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      tx(480, 320, '매 스텝 GPU 큐가 빌 때까지 CPU 가 서고, 그동안 GPU 도 논다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(480, 380, '개념도: 칸 길이는 실제 시간이 아니다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); return; }
    // k5: 50 스텝에 한 번
    const ax0 = 100, W = 760;
    el('line', { x1: ax0, y1: 200, x2: ax0 + W, y2: 200, stroke: MUT, 'stroke-width': 2 });
    for (let s = 0; s < 100; s++) { const x = ax0 + (s / 99) * W, on = s % 50 === 0, vis = s / 99 <= E(u, 0.2, 1.8);
      if (vis) el('line', { x1: x, y1: on ? 160 : 190, x2: x, y2: 210, stroke: on ? WARN : OFF, 'stroke-width': on ? 4 : 1.5 }); }
    [0, 50].forEach((s) => { const x = ax0 + (s / 99) * W; mono(x, 150, `step ${s}`, { 'text-anchor': s ? 'middle' : 'start', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.4 + s / 60) }); });
    mono(ax0 + W, 236, 'step', { 'text-anchor': 'end', 'font-size': 14, fill: MUT });
    mono(480, 80, 'if step % 50 == 0: print(f"loss={loss.item():.4f}")', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.1) });
    tx(480, 300, '동기화는 50 스텝에 한 번. 비용이 무시할 만해진다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) }); }

  // =========================================================
  // 4. GPU 메모리 — allocated · reserved · nvidia-smi
  // =========================================================
  const MBW = 4.2;   // 1MB 당 폭
  function memBars(c) { const b = c.beat.mem || {}, p = (c.prev && c.prev.mem) || b, u = c.u;
    const a = tween(p.a, b.a, u), r = tween(p.r, b.r, u), X = 300, CTX = 200;
    const rowsY = [96, 160, 224];
    [['allocated', '텐서가 실제 쓰는 양'], ['reserved', '캐시 할당자가 쥔 양'], ['nvidia-smi', 'reserved + CUDA 컨텍스트']].forEach(([n, d], i) => {
      mono(40, rowsY[i] + 14, n, { 'font-size': 16, 'font-weight': 800, fill: [ACC, WARN, INK][i] }); tx(40, rowsY[i] + 36, d, { 'font-size': 13.5, fill: MUT });
      el('rect', { x: X, y: rowsY[i], width: 600, height: 34, rx: 6, fill: SOFT }); });
    if (a > 0.5) el('rect', { x: X, y: rowsY[0], width: a * MBW, height: 34, rx: 6, fill: ACC, opacity: 0.85 });
    mono(X + Math.max(a * MBW, 0) + 10, rowsY[0] + 23, `${Math.round(a)} MB`, { 'font-size': 15, 'font-weight': 800, fill: ACC });
    if (r > 0.5) el('rect', { x: X, y: rowsY[1], width: r * MBW, height: 34, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 2 });
    if (a > 1 && r > 1) el('rect', { x: X + 2, y: rowsY[1] + 2, width: Math.max(0, Math.min(a, r) * MBW - 4), height: 30, rx: 5, fill: WARN, opacity: 0.6 });
    mono(X + Math.max(r * MBW, 0) + 10, rowsY[1] + 23, `${Math.round(r)} MB`, { 'font-size': 15, 'font-weight': 800, fill: WARN });
    el('rect', { x: X, y: rowsY[2], width: CTX, height: 34, rx: 6, fill: GRID }); tx(X + CTX / 2, rowsY[2] + 22, '컨텍스트 (수백 MB)', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: INK });
    if (r > 0.5) el('rect', { x: X + CTX, y: rowsY[2], width: r * MBW, height: 34, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 2 });
    return { a, r }; }
  function s4(t, c) { const { k, u } = c;
    if (k <= 4) { const m = memBars(c);
      const lines = [['def gpu_report(): allocated · reserved 를 MB 로 찍는다', INK], ['big = torch.randn(4096, 4096, device="cuda")', ACC], ['del big', INK], ['gc.collect()', INK], ['torch.cuda.empty_cache()', WARN]];
      const [s, col] = lines[k]; mono(480, 52, s, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.1) });
      const msg = [
        ['새 프로세스, 텐서가 없어 둘 다 0', '컨텍스트 크기는 GPU·드라이버마다 다르다'],
        ['4096 × 4096 × 4바이트 = 64 MB', 'reserved 는 늘 allocated 이상이다'],
        ['마지막 참조가 사라져 allocated 는 0', '빈 64 MB 블록은 캐시에 남는다'],
        ['순환 참조가 없으면 del 에서 이미 회수됐다', '숫자는 그대로, reserved 64 MB'],
        ['빈 캐시 블록을 OS 로 돌려준다', '없던 메모리가 생기는 것은 아니다']][k];
      tx(480, 330, msg[0], { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.4) });
      tx(480, 360, msg[1], { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.7) });
      if (k === 2 || k === 3) { el('rect', { x: 300, y: 160, width: 64 * MBW, height: 34, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4' }); tx(300 + 32 * MBW, 182, '빈 블록', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN }); }
      if (k === 4 && u > 1.4) cross(300 + 32 * MBW, 177, 12, pop(u, 1.4));
      tx(940, 400, '수치: 64 MB 는 계산값, 컨텍스트는 환경에 따라 다름', { 'text-anchor': 'end', 'font-size': 13.5, fill: MUT }); return; }
    if (k === 5) { // 배치를 절반으로 (예시)
      tx(480, 52, 'OOM 이면 batch_size 부터 줄인다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.1) });
      [[64, 250, 8], [32, 650, 4]].forEach(([bs, cx, n], j) => { tx(cx, 100, `batch ${bs}`, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: j ? ACC : INK, opacity: fade(u, 0.2 + j * 0.6) });
        for (let l = 0; l < 3; l++) for (let i = 0; i < n; i++) { const s = E(u, 0.3 + j * 0.6 + l * 0.15, 0.6 + j * 0.6 + l * 0.15);
          el('rect', { x: cx - 4 * 24 + i * 24, y: 130 + l * 52, width: 20, height: 40, rx: 3, fill: j ? ACCBG : SOFT, stroke: j ? ACC : INK, 'stroke-width': 1.4, opacity: s }); }
        tx(cx, 300, j ? '활성값 절반' : '층마다 저장되는 활성값', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: j ? ACC : MUT, opacity: fade(u, 1.0 + j * 0.6) }); });
      tx(480, 360, '예시 그림: 활성값은 배치 크기에 비례한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k6: no_grad + 순서
    [['학습 forward', '역전파용 활성값 저장', INK, 3], ['with torch.no_grad():', '저장하지 않는다', ACC, 0]].forEach(([a, b, col, n], j) => { const y = 90 + j * 110;
      mono(60, y + 10, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + j * 0.5) });
      for (let l = 0; l < 3; l++) { card(390 + l * 120, y + 4, 90, 40, { rx: 8, text: `층${l + 1}`, fs: 14, stroke: col, s: pop(u, 0.3 + j * 0.5 + l * 0.1) });
        if (n) el('rect', { x: 370 + l * 120, y: y + 34, width: 40, height: 22, rx: 3, fill: WARNBG, stroke: WARN, opacity: fade(u, 0.6 + l * 0.15) }); }
      tx(60, y + 36, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + j * 0.5) }); });
    mono(480, 340, 'allocated  ≤  reserved  <  nvidia-smi', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.6) });
    tx(480, 380, '세 숫자가 다른 것은 정상이다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) }); }

  // =========================================================
  // 5. 실무 패턴 — 고르는 규칙 하나, 전역 상수, 여러 장, CPU 폴백
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const gates = [['torch.cuda.is_available()', 'cuda', ACC], ['torch.backends.mps.is_available()', 'mps', INFO], ['(나머지)', 'cpu', INK]];
      mono(60, 56, 'def pick_device():', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      gates.forEach(([q, d, col], i) => { const y = 110 + i * 92;
        card(260, y, 360, 52, { rx: 10, stroke: col, sw: 2, text: q, fs: 14.5, mono: true, color: col, s: pop(u, 0.3 + i * 0.4) });
        grow(442, y, 560, y, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), col); pill(620, y, `"${d}"`, col, pop(u, 0.9 + i * 0.4), { mono: true, fs: 16 });
        if (i < 2) { grow(260, y + 28, 260, y + 64, E(u, 0.7 + i * 0.4, 0.9 + i * 0.4), MUT); tx(276, y + 52, '없으면', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8 + i * 0.4) }); } });
      tx(800, 160, 'NVIDIA', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) }); tx(800, 252, 'Apple Silicon', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) }); tx(800, 344, '폴백', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { card(480, 210, 220, 64, { rx: 32, stroke: ACC, fill: ACCBG, sw: 3, text: 'DEVICE', fs: 20, mono: true, color: ACC, s: pop(u, 0.2) });
      [['model.to(DEVICE)', 200, 90], ['x.to(DEVICE)', 760, 90], ['yb.to(DEVICE)', 200, 330], ['mask.to(DEVICE)', 760, 330]].forEach(([s, x, y], i) => {
        pill(x, y, s, INK, pop(u, 0.6 + i * 0.2), { mono: true, fs: 14 }); grow(x + (x < 480 ? 80 : -80), y + (y < 200 ? 14 : -14), 480 + (x < 480 ? -100 : 100), 210 + (y < 200 ? -20 : 20), E(u, 0.8 + i * 0.2, 1.2 + i * 0.2), ACC); });
      ['"cuda"', '"cuda"', '"cuda:0"'].forEach((s, i) => { mono(330 + i * 150, 400, s, { 'text-anchor': 'middle', 'font-size': 15, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 1.6 + i * 0.1) }); });
      tx(480, 370, '흩뿌린 문자열 대신 한 곳만 참조한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 2 || k === 3) { const ddp = k === 3;
      chip(270, 240, 300, 200, 'cuda:0', { cores: [16, 2], cs: 9, col: ACC }); chip(690, 240, 300, 200, 'cuda:1', { cores: [16, 2], cs: 9, col: ACC });
      mono(480, 60, ddp ? 'DistributedDataParallel' : 'if torch.cuda.device_count() > 1:', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ddp ? INFO : INK, opacity: fade(u, 0.1) });
      if (!ddp) { blk(270, 220, 2, 4, ACC, 1, 'x', { fill: ACCBG }); fly(330, 220, 640, 220, seg(u, 0.5, 1.4), 'x.to("cuda:1")', { mono: true });
        blk(690, 220, 2, 4, ACC, u > 1.4 ? 1 : 0, 'x1', { fill: ACCBG });
        tx(480, 390, '지목은 어디에 둘지 고르는 일일 뿐, 병렬은 아니다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
      [270, 690].forEach((x, i) => { blk(x, 200, 2, 4, INFO, pop(u, 0.3 + i * 0.2), '모델 사본', { fill: INFOBG }); pill(x, 280, `배치의 ${i + 1}/2`, INK, pop(u, 0.6 + i * 0.2), { fs: 14 }); });
      grow(400, 200, 560, 200, E(u, 1.2, 1.6), INFO); grow(560, 214, 400, 214, E(u, 1.4, 1.8), INFO);
      tx(480, 184, '기울기 동기화', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) });
      tx(480, 390, '프로세스 구성·통신까지 얽힌 별도 주제다 (dl V-2-1)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k4·5: CPU 폴백
    chip(CPU[0], CPU[1], CW, CH, 'CPU', { cores: [4, 1], cs: 16, lit: k === 5 ? 1 : 0 });
    chip(GPU[0], GPU[1], CW, CH, 'GPU', { cores: [16, 2], cs: 9, col: OFF, dash: '6 5', op: k === 4 ? 1 - 0.6 * E(u, 1.0, 1.6) : 0.4 });
    if (k === 4) { terminal(60, 40, 560, 72, ['$ CUDA_VISIBLE_DEVICES="" python train.py'], E(u, 0.2, 1.0) + 0.001, { fs: 15 });
      if (u > 1.4) cross(GPU[0], GPU[1], 26, pop(u, 1.4));
      tx(480, 400, 'GPU 를 감추고 돌려 보면 device 하드코딩·dtype 버그가 드러난다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    mono(480, 70, 'DEVICE_TEST = torch.device("cpu")', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
    blk(CPU[0] - 50, 220, 2, 4, INFO, pop(u, 0.4), 'model', { fill: INFOBG }); blk(CPU[0] + 60, 220, 2, 3, INK, pop(u, 0.6), 'x');
    mono(480, 120, 'assert MyModel().to(DEVICE_TEST)(x.to(DEVICE_TEST)) is not None', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
    if (u > 1.5) check(CPU[0] + 110, 300, 14, pop(u, 1.5));
    tx(480, 400, '통과하면 어느 환경에서든 같은 코드가 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); }

  const quiz = [
    { q: 'x = torch.randn(3, 4) 다음 줄에 x.to(device) 만 쓰고 대입하지 않으면 x 는 어디에 있는가?',
      o: ['그대로 CPU 에 있다', 'GPU 로 옮겨져 있다', '두 곳 모두에 있다'], a: 0,
      why: '텐서의 .to() 는 새 텐서를 돌려준다. x = x.to(device) 로 받아야 한다. 모델의 .to() 는 파라미터를 제자리에서 옮긴다.' },
    { q: '모델은 GPU 에 있고 DataLoader 배치는 그대로 넣었다. model(xb) 에서 무엇이 일어나는가?',
      o: ['배치가 자동으로 GPU 로 따라간다', 'CPU 에서 느리게 계산된다', 'RuntimeError 가 나고 found cuda:0 and cpu 를 알려 준다'], a: 2,
      why: '연산에 들어가는 텐서는 같은 device 에 있어야 한다. 배치는 매 스텝 새로 오니 xb, yb 를 매번 .to(device) 한다.' },
    { q: '학습 루프 안에서 매 스텝 loss.item() 을 부르면 왜 느려지는가?',
      o: ['GPU 큐가 빌 때까지 CPU 가 기다리는 동기화가 걸려서', 'loss 를 float64 로 바꿔서', '그래프를 두 번 만들어서'], a: 0,
      why: 'CPU 가 GPU 결과를 읽는 순간 동기화된다. 로깅은 50 스텝에 한 번처럼 가끔만 한다.' },
    { q: 'GPU 에 64 MB 텐서를 만들었다가 del 한 직후 reserved 는 어떻게 되는가?',
      o: ['0 으로 돌아간다', '64 MB 가 그대로 남는다', '128 MB 로 늘어난다'], a: 1,
      why: 'allocated 는 0 이 되지만 캐시 할당자가 빈 블록을 쥐고 있다. empty_cache() 를 불러야 OS 로 돌아간다.' },
    { q: 'cuda → mps → cpu 순서로 고르는 pick_device() 를 두는 까닭은 무엇인가?',
      o: ['GPU 를 여러 장 동시에 쓰려고', '어느 환경에서든 같은 코드가 돌게 하려고', '메모리를 아끼려고'], a: 1,
      why: 'device 를 한 곳에서 정해 전역 상수로 공유하면 노트북·CI·Mac 에서도 그대로 돈다. 여러 장 병렬은 DDP 의 일이다.' },
  ];

  const summary = [
    'device 를 파일 맨 위에서 한 번 정하고 모델과 텐서를 모두 .to(device) 로 옮긴다.',
    '연산에 들어가는 텐서는 같은 device 여야 하니 배치는 매 스텝 옮긴다.',
    'H2D 복사와 .item() 같은 동기화는 비용이라 pin_memory 로 겹치고 로깅은 가끔만 한다.',
    'del 하면 allocated 는 줄지만 reserved 는 남는다. OOM 이면 배치부터 줄인다.',
  ];
  const review = [
    { q: '노트북에서는 잘 돌던 코드가 CI 서버에서 "Torch not compiled with CUDA enabled" 로 죽는다. 먼저 고칠 곳은?',
      o: ['곳곳에 쓴 .to("cuda") 를 pick_device() 로 정한 DEVICE 로 바꾼다', 'empty_cache() 를 학습 전에 부른다', 'pin_memory=True 를 켠다'], a: 0,
      why: '"cuda" 를 하드코딩하면 GPU 가 없는 곳에서 깨진다. 한 곳에서 고른 DEVICE 만 참조하게 한다.' },
    { q: '입력은 옮겼는데 손실 계산에서 found cuda:0 and cpu 가 났다. 먼저 의심할 것은?',
      o: ['모델 파라미터가 CPU 로 되돌아갔다', 'GPU 메모리가 모자라다', '라벨 yb 를 옮기지 않았다'], a: 2,
      why: 'forward 는 통과했으니 손실에 새로 들어온 텐서가 범인이다. 라벨이나 직접 만든 가중치 텐서를 함께 옮긴다.' },
    { q: 'OOM 이 났다. torch.cuda.empty_cache() 를 넣어도 그대로다. 가장 먼저 해 볼 것은?',
      o: ['nvidia-smi 를 자주 찍는다', 'batch_size 를 줄인다', 'gc.collect() 를 매 스텝 부른다'], a: 1,
      why: 'empty_cache 는 빈 블록을 돌려줄 뿐 메모리를 만들지 않는다. 활성값은 배치에 비례하니 배치를 줄이는 것이 가장 확실하다.' },
  ];

  R.page({ title: 'CPU와 GPU 사이', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
