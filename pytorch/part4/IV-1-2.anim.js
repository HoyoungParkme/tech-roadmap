/* IV-1-2 전이학습 (torchvision ResNet50) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: 층별 파라미터 수·특징 맵 크기·weights 메타(정확도, resize)·학습 대상 수는 torchvision 0.29 / torch 2.15 CPU 로 코드를 돌려 센 값이다.
 *       세 전략의 정확도 곡선(74 / 88 / 92%)과 전처리 불일치 폭락(92% → 54%)은 페이지의 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const hsh = (i) => { const s = Math.sin((i + 1) * 78.233) * 43758.5453; return s - Math.floor(s); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  // ---------- ResNet50 층 스택 (가로) ----------
  const L = [
    { n: 'conv1·bn1', w: 84, sh: '64×56×56', p: 9536 },
    { n: 'layer1', w: 84, sh: '256×56×56', p: 215808 },
    { n: 'layer2', w: 88, sh: '512×28×28', p: 1219584 },
    { n: 'layer3', w: 92, sh: '1024×14×14', p: 7098368 },
    { n: 'layer4', w: 104, sh: '2048×7×7', p: 14964736 },
    { n: 'avgpool', w: 84, sh: '2048', p: 0 },
    { n: 'fc', w: 84, sh: '1000', p: 2049000 },
  ];
  let xx = 30; L.forEach((l) => { l.x = xx + l.w / 2; xx += l.w + 12; });
  const SY = 190, SH = 104;
  // o: ap(i) 보이기 0→1, lockA(i) 자물쇠 0→1, hot(i) 학습 중, fc: 'old'|'new', fcSwap 0→1, shapes, params, dim(i)
  function stack(o) { o = o || {};
    L.forEach((l, i) => { const s = o.ap ? o.ap(i) : 1; if (s <= 0.01) return; const isFc = i === 6, hot = o.hot && o.hot(i), lk = o.lockA ? o.lockA(i) : 0;
      if (isFc && o.fcSwap != null) { const sw = o.fcSwap;
        if (sw < 1) card(l.x, SY + 60 * E(sw, 0, 1), l.w, SH, { rx: 8, stroke: MUT, fill: SOFT, text: 'fc\n1000', fs: 14.5, op: 1 - sw, color: MUT });
        if (sw > 0) { card(l.x, SY - 70 * (1 - E(sw, 0, 1)), l.w, SH, { rx: 8, stroke: GOOD, sw: 3, fill: GOODBG, text: 'fc\n10', fs: 15, color: GOOD, op: clamp(sw * 2) }); }
        return; }
      const newFc = isFc && o.fc === 'new', col = hot ? ACC : newFc ? GOOD : lk > 0.5 ? INFO : INK;
      card(l.x, SY, l.w, SH, { rx: 8, s, stroke: col, sw: hot || newFc ? 3 : 2, fill: hot ? ACCBG : newFc ? GOODBG : lk > 0.5 ? INFOBG : PANEL, text: isFc ? (newFc ? 'fc\n10' : 'fc\n1000') : l.n, fs: 14.5, color: col, op: o.dim && o.dim(i) ? 0.35 : 1 });
      if (lk > 0) lock(l.x, SY - SH / 2 - 18 - 30 * (1 - E(lk, 0, 1)), true, INFO, 0.9 * clamp(lk * 3));
      if (hot && o.hotTag !== false) mono(l.x, SY - SH / 2 - 12, '학습', { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      if (o.shapes) mono(l.x, SY + SH / 2 + 20, isFc && newFc ? '10' : l.sh, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: typeof o.shapes === 'function' ? o.shapes(i) : 1 });
      if (o.params) mono(l.x, SY + SH / 2 + (o.shapes ? 42 : 20), isFc && newFc ? '20,490' : l.p ? fmt(l.p) : '0', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: hot ? ACC : INK, opacity: typeof o.params === 'function' ? o.params(i) : 1 }); });
    for (let i = 1; i < 7; i++) { const a = L[i - 1], b = L[i]; el('line', { x1: a.x + a.w / 2, y1: SY, x2: b.x - b.w / 2, y2: SY, stroke: GRID, 'stroke-width': 2.5, opacity: o.ap ? o.ap(i) : 1 }); } }
  const LX = (i) => L[i].x;

  // ---------- 1. 백본 가져오기 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      card(250, 120, 340, 60, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 0.2) }); mono(100, 127, 'from torchvision import models', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3) });
      card(250, 210, 340, 60, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 0.6) }); mono(100, 217, 'ResNet50_Weights', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.7) });
      ['IMAGENET1K_V1', 'IMAGENET1K_V2', 'DEFAULT'].forEach((s, i) => { const y = 120 + i * 60; pill(640, y, 'ResNet50_Weights.' + s, i === 1 ? ACC : MUT, pop(u, 1.1 + i * 0.25), { mono: true, fs: 14 }); });
      grow(425, 210, 470, 180, seg(u, 0.9, 1.2), MUT);
      note(100, 330, '가중치 열거형에서 나중에 전처리(weights.transforms())도 꺼낸다', fade(u, 2.0)); return; }
    if (k === 1) {
      const V = [['IMAGENET1K_V1', '76.13', '256', MUT], ['IMAGENET1K_V2', '80.858', '232', ACC]];
      V.forEach(([n, a, r, col], i) => { const x = 230 + i * 360, s = pop(u, 0.2 + i * 0.4);
        card(x, 160, 320, 150, { rx: 12, stroke: col, sw: i ? 3 : 2, s });
        mono(x, 112, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s });
        tx(x - 130, 152, 'ImageNet acc@1', { 'font-size': 14, fill: MUT, opacity: s }); mono(x + 130, 152, a + '%', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: s });
        tx(x - 130, 186, 'resize → crop', { 'font-size': 14, fill: MUT, opacity: s }); mono(x + 130, 186, r + ' → 224', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: s }); });
      card(400, 300, 380, 44, { rx: 22, text: 'models.resnet50(pretrained=True)', fs: 15, mono: true, stroke: OFF, color: OFF, s: pop(u, 1.3) }); cross(400, 300, 16, pop(u, 1.6));
      mono(400, 360, 'models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.9) });
      sub(400, 394, '두 버전은 정확도도 전처리도 다르다 · torchvision weights 메타 값', fade(u, 2.2)); return; }
    // k ≥ 2: 층 스택
    stack({ ap: (i) => (k === 2 ? pop(u, 0.2 + i * 0.28) : 1), shapes: (i) => (k === 2 ? fade(u, 0.4 + i * 0.28) : 1), params: k === 4 ? (i) => fade(u, 0.3 + i * 0.2) : false, hot: k === 3 ? (i) => i === 6 : null, hotTag: false });
    if (k === 2) { tx(30, 100, '입력 3×224×224', { 'font-size': 14, fill: MUT });
      grow(60, 330, 700, 330, seg(u, 0.4, 2.2), MUT); tx(40, 360, '가장자리·색', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) }); tx(700, 360, '상위 특징', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      mono(840, 160, 'named_children()', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      sub(840, 190, 'relu · maxpool 은', fade(u, 0.5)); sub(840, 210, '첫 칸에 묶어 그림', fade(u, 0.5)); return; }
    if (k === 3) { const fc = L[6];
      for (let i = 0; i < 9; i++) grow(fc.x + fc.w / 2, SY, 870, 90 + i * 25, seg(u, 0.3 + i * 0.06, 0.8 + i * 0.06), ACC, { sw: 1.4, plain: true });
      mono(905, 96, '0', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); mono(905, 300, '999', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
      card(400, 340, 520, 50, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 1.2) });
      mono(400, 346, 'Linear(in_features=2048, out_features=1000)', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      sub(400, 394, '1000 은 ImageNet 클래스 수 · 우리 문제는 10', fade(u, 1.9), { fill: BAD, 'font-size': 15 }); return; }
    // k4: 파라미터 총량
    const tot = 25557032, x0 = 30, W = 900, y = 340; let acc = 0;
    L.forEach((l, i) => { if (!l.p) return; const w = W * l.p / tot, g = E(u, 0.6 + i * 0.15, 1.2 + i * 0.15);
      el('rect', { x: x0 + acc, y, width: Math.max(1, w * g), height: 26, fill: i === 6 ? MUT : i === 4 ? ACC : i === 3 ? INFO : WARN, opacity: 0.75 });
      if (w > 60) mono(x0 + acc + w / 2, y + 18, l.n + ' ' + Math.round(l.p / tot * 100) + '%', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: PANEL, opacity: fade(u, 1.6) });
      acc += w; });
    mono(930, 312, fmt(tot) + ' params', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.8) });
    tx(30, 312, '모두 이미 학습된 상태로 받는다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); }

  // ---------- 2. 특징 추출 ----------
  function s2(t, c) { const { k, u } = c;
    const lockA = (i) => (k === 1 ? E(u, 0.3 + i * 0.18, 0.8 + i * 0.18) : k >= 2 ? (i === 6 && k >= 2 ? 0 : 1) : 0);
    stack({ lockA, fcSwap: k === 2 ? E(u, 0.4, 1.6) : null, fc: k >= 2 ? 'new' : 'old', hot: k >= 3 ? (i) => false : null, params: k === 3 || k === 4 });
    if (k === 0) { pill(200, 330, 'import torch.nn as nn', INK, pop(u, 0.2), { mono: true, fs: 15 }); pill(520, 330, 'import torch.optim as optim', INK, pop(u, 0.5), { mono: true, fs: 15 });
      note(30, 80, '구조는 그대로 두고 "무엇을 학습할지" 만 바꾼다', fade(u, 1.0)); return; }
    if (k === 1) { const n = Math.round(lerp(25557032, 0, E(u, 0.3, 2.0)));
      mono(30, 82, 'for p in model.parameters(): p.requires_grad = False', { 'font-size': 15, 'font-weight': 700, fill: INFO });
      tx(30, 330, '학습 대상', { 'font-size': 15, 'font-weight': 700 }); mono(130, 330, fmt(n), { 'font-size': 22, 'font-weight': 800, fill: n ? INK : INFO });
      sub(480, 380, '층을 지우는 게 아니다 · 순전파는 그대로 지나가고 기울기만 안 쌓는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 2) { mono(30, 82, 'model.fc = nn.Linear(model.fc.in_features, 10)', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      note(30, 340, '새로 만든 층은 requires_grad=True 로 태어난다', fade(u, 1.6), { fill: GOOD });
      sub(30, 370, 'in_features 는 숫자로 적지 말고 model.fc 에서 읽는다', fade(u, 2.0), { 'text-anchor': 'start', 'font-size': 14.5 }); return; }
    if (k === 3) { mono(30, 82, 'sum(p.numel() for p in m.parameters() if p.requires_grad)', { 'font-size': 14.5, 'font-weight': 700 });
      const sx = lerp(20, 740, E(u, 0.3, 2.0)); el('line', { x1: sx, y1: 120, x2: sx, y2: 280, stroke: WARN, 'stroke-width': 3 });
      L.forEach((l, i) => { if (sx > l.x) mono(l.x, 300, i === 6 ? '+20,490' : '+0', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 6 ? GOOD : MUT }); });
      return; }
    if (k === 4) { const tot = 23528522, y = 354; tx(30, 82, 'print(count_trainable(model))  →  20,490', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: GOOD });
      el('rect', { x: 30, y, width: 900, height: 28, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5 });
      el('rect', { x: 30, y, width: Math.max(2, 900 * 20490 / tot) * fade(u, 0.5), height: 28, rx: 2, fill: GOOD });
      tx(40, y - 10, '학습 20,490 (0.09%)', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.7) });
      tx(920, y - 10, '동결 23,508,032', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 1.0) });
      sub(480, 405, 'fc 를 바꾼 뒤 전체 23,528,522개 · torch 2.15 실행값', fade(u, 1.6)); return; }
    if (k === 5) {   // 옵티마이저에 학습 대상만
      card(720, 360, 250, 50, { rx: 10, stroke: GOOD, sw: 2.5, text: 'Adam(params, lr=1e-3)', fs: 15, mono: true, color: GOOD, s: pop(u, 0.2) });
      el('path', { d: 'M300,300 L560,300 L480,345 L380,345 Z', fill: SOFT, stroke: MUT, 'stroke-width': 2, opacity: fade(u, 0.3) });
      mono(430, 328, 'filter(requires_grad)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      L.forEach((l, i) => { const a = 0.5 + i * 0.2, ok = i === 6;
        if (ok) dot([[l.x, SY + 52], [430, 300], [430, 345], [600, 360]], seg(u, a, a + 1.3), GOOD, 7);
        else { dot([[l.x, SY + 52], [lerp(l.x, 430, 0.6), 296]], seg(u, a, a + 0.8), INFO, 6); if (u > a + 0.8) cross(lerp(l.x, 430, 0.6), 286, 7, 1); } });
      sub(150, 400, '통째로 넘기면 동결이 무의미해진다', fade(u, 2.2), { fill: BAD, 'font-size': 14.5 }); return; }
    // k6
    const A = [-90, 30, 150], N = ['zero_grad', 'backward', 'step'], cx = 800, cy = 340, r = 52;
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 2.5 });
    A.forEach((a, i) => pill(cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180), N[i], ACC, pop(u, 0.3 + i * 0.2), { mono: true, fs: 13.5, fill: PANEL }));
    pill(250, 340, 'criterion = nn.CrossEntropyLoss()', INK, pop(u, 0.2), { mono: true, fs: 15 });
    sub(480, 404, 'IV-1-1 루프 그대로 · 바뀐 건 모델 준비뿐', fade(u, 1.4), { 'font-size': 14.5 }); }

  // ---------- 3. 입력 규격 ----------
  function photo(x, y, sz, seed, o) { o = o || {}; const n = 8, cs = sz / n, op = o.op ?? 1; if (op <= 0) return; const P = [ACC, INFO, GOOD, WARN, BAD], bg = P[seed % 5], fg = P[(seed + 2) % 5];
    for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) { const obj = Math.hypot(q - 3.5, (r - 4) * 1.2) < 2.6;
      el('rect', { x: x + q * cs, y: y + r * cs, width: cs - 0.6, height: cs - 0.6, fill: obj ? fg : bg, opacity: op * (obj ? 0.5 + 0.4 * hsh(seed * 64 + r * 8 + q) : 0.1 + 0.25 * hsh(seed * 9 + r * 8 + q)) }); }
    el('rect', { x, y, width: sz, height: sz, fill: 'none', stroke: o.stroke || GRID, 'stroke-width': 1.5, opacity: op }); }
  function pipe(u, live) { const ap = (a) => (live ? fade(u, a) : 1);
    photo(40, 150, 32, 3, { op: ap(0.1) }); mono(56, 206, '32×32', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: ap(0.1) });
    grow(84, 166, 140, 166, live ? seg(u, 0.3, 0.6) : 1, MUT);
    const g = live ? E(u, 0.5, 1.2) : 1, s1 = lerp(32, 116, g); photo(150, 166 - s1 / 2, s1, 3, { op: ap(0.4) });
    mono(208, 250, 'Resize 232', { 'font-size': 14, 'text-anchor': 'middle', opacity: ap(0.9) });
    grow(278, 166, 330, 166, live ? seg(u, 1.2, 1.5) : 1, MUT);
    photo(340, 108, 116, 3, { op: ap(1.3) * 0.4 }); el('rect', { x: 345, y: 113, width: 106, height: 106, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: ap(1.5) });
    mono(398, 250, 'CenterCrop 224', { 'font-size': 14, 'text-anchor': 'middle', opacity: ap(1.5) });
    grow(466, 166, 518, 166, live ? seg(u, 1.8, 2.1) : 1, MUT);
    [2, 1, 0].forEach((j) => el('rect', { x: 530 + j * 10, y: 116 - j * 8, width: 96, height: 96, rx: 3, fill: [BAD, GOOD, INFO][j], opacity: 0.22 * ap(2.0), stroke: [BAD, GOOD, INFO][j], 'stroke-width': 1.5 }));
    mono(600, 250, 'Normalize', { 'font-size': 14, 'text-anchor': 'middle', opacity: ap(2.1) });
    mono(600, 272, '[3, 224, 224]', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: ap(2.2) }); }
  const SPEC = ['ImageClassification(', '  crop_size=[224]', '  resize_size=[232]', '  mean=[0.485, 0.456, 0.406]', '  std=[0.229, 0.224, 0.225]', '  interpolation=BILINEAR )'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const B = [['datasets.CIFAR10(', INFO], ['transform = ?', WARN], ['DataLoader(...)', INK]];
      B.forEach(([s, col], i) => { const x = 170 + i * 310; card(x, 180, 260, 70, { rx: 12, stroke: col, sw: 2.2, dash: i === 1 ? '7 5' : null, s: pop(u, 0.2 + i * 0.4) });
        mono(x, 186, s, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.3 + i * 0.4) }); if (i) grow(x - 180, 180, x - 134, 180, seg(u, 0.4 + i * 0.4, 0.7 + i * 0.4), MUT); });
      note(170, 300, '전처리는 Dataset 의 transform 자리에 꽂힌다 · 로더보다 먼저 정한다', fade(u, 1.8)); return; }
    if (k === 1) { card(260, 200, 440, 230, { rx: 10, fill: SOFT, stroke: WARN, sw: 2, dash: '6 5', s: pop(u, 0.2) });
      ['T.Resize(232), T.CenterCrop(224)', 'T.ToTensor()', 'T.Normalize(', '  mean=[0.485, 0.456, 0.406],', '  std=[0.229, 0.224, 0.225])'].forEach((l, i) => mono(60, 130 + i * 30, l, { 'font-size': 15, fill: i === 0 || i > 2 ? WARN : INK, opacity: fade(u, 0.4 + i * 0.2) }));
      tx(60, 340, '방법 A · 숫자를 손으로 옮긴다', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3) });
      card(710, 170, 380, 110, { rx: 12, stroke: BAD, sw: 2, s: pop(u, 1.4) });
      mono(710, 150, 'weights 를 V1 으로 바꾸면', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(710, 186, 'resize 232 → 256', { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) });
      sub(710, 250, '같이 고치는 걸 잊으면 조용히 성능이 내려간다', fade(u, 2.2)); return; }
    if (k === 2 || k === 3) { card(170, 130, 260, 56, { rx: 28, text: 'IMAGENET1K_V2', fs: 16, mono: true, stroke: ACC, color: ACC, s: k === 2 ? pop(u, 0.2) : 1 });
      grow(170, 160, 170, 220, k === 2 ? seg(u, 0.5, 0.9) : 1, ACC); mono(186, 200, '.transforms()', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 2 ? fade(u, 0.6) : 1 });
      card(170, 260, 260, 64, { rx: 12, stroke: GOOD, sw: 2.5, text: 'preprocess', fs: 17, mono: true, color: GOOD, s: k === 2 ? pop(u, 1.0) : 1 });
      if (k === 2) { note(380, 140, '방법 B · 백본에게 물어본다', fade(u, 1.2), { fill: GOOD }); note(380, 180, '그 가중치가 학습 때 쓴 전처리를', fade(u, 1.5)); note(380, 210, '객체째로 돌려준다', fade(u, 1.7));
        note(380, 260, '백본을 바꾸면 전처리도 따라 바뀐다', fade(u, 2.2), { fill: GOOD }); return; }
      card(650, 230, 480, 230, { rx: 10, fill: INK, stroke: 'none', s: pop(u, 0.2) });
      SPEC.forEach((l, i) => mono(430, 150 + i * 30, l, { 'font-size': 15, fill: i === 0 || i === 5 ? PANEL : 'var(--term)', opacity: fade(u, 0.3 + i * 0.25) }));
      sub(650, 380, 'print(preprocess) · 방법 A 에 적으려던 값과 같다', fade(u, 2.0)); return; }
    pipe(u, k === 4);
    if (k === 4) { mono(40, 330, 'CIFAR10(..., transform=preprocess)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(40, 358, 'DataLoader(train_ds, batch_size=64, shuffle=True)', { 'font-size': 15, opacity: fade(u, 0.6) });
      card(830, 190, 190, 110, { rx: 12, stroke: WARN, sw: 2, s: pop(u, 2.2) });
      mono(830, 178, '224² / 32²', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); mono(830, 210, '= 49배', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.4) });
      sub(830, 266, '배치를 64 로 줄인 이유', fade(u, 2.5)); return; }
    // k5
    card(240, 340, 400, 46, { rx: 23, text: 'x.shape → [64, 3, 224, 224]', fs: 16, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.2) }); check(460, 340, 12, pop(u, 0.6));
    const bx = 840, by = 380; tx(bx - 30, 90, '전처리 일치 vs 불일치 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle' });
    [[92, GOOD, '일치'], [54, BAD, '불일치']].forEach(([v, col, n], i) => { const h = 220 * v / 100 * E(u, 0.8 + i * 0.4, 1.6 + i * 0.4), x = bx - 90 + i * 120;
      el('rect', { x, y: by - 40 - h, width: 64, height: h, rx: 4, fill: col, opacity: 0.8 });
      mono(x + 32, by - 48 - h, v + '%', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 1.4 + i * 0.4) });
      tx(x + 32, by - 14, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }); });
    sub(380, 400, '에러 없이 정확도만 떨어진다', fade(u, 2.3), { fill: BAD, 'font-size': 15 }); }

  // ---------- 4. 미세조정 ----------
  function s4(t, c) { const { k, u } = c;
    const l4 = k === 0 ? 0 : k === 1 ? E(u, 0.3, 1.0) : 1;
    const lockA = (i) => (i === 6 ? 0 : i === 4 ? 1 - l4 : 1);
    if (k !== 5) stack({ lockA, fc: 'new', hot: (i) => i === 6 || (i === 4 && l4 > 0.5) });
    if (k === 0) { for (let j = 0; j < 3; j++) dot([[900, SY], [LX(6) + 20, SY]], ((u * 0.9 + j / 3) % 1), WARN, 6);
      note(30, 330, '1단계 · Step 2 상태(백본 동결) 그대로 head 만 몇 에폭', fade(u, 0.5));
      sub(30, 362, '랜덤 fc 의 큰 기울기가 백본으로 흘러가지 않게 먼저 가라앉힌다', fade(u, 1.4), { 'text-anchor': 'start', 'font-size': 14.5 }); return; }
    if (k === 1) { mono(30, 82, 'for p in model.layer4.parameters(): p.requires_grad = True', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      const n = Math.round(lerp(20490, 14985226, E(u, 1.0, 2.2)));
      tx(30, 340, '학습 대상', { 'font-size': 15, 'font-weight': 700 }); mono(130, 340, fmt(n), { 'font-size': 22, 'font-weight': 800, fill: ACC });
      mono(400, 340, '(전체의 63.7%)', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) });
      sub(30, 380, '앞쪽 범용 층(conv1 ~ layer3)은 그대로 얼려 둔다', fade(u, 1.6), { 'text-anchor': 'start', 'font-size': 14.5 }); return; }
    if (k === 2) { const ax0 = 120, ax1 = 840, y = 340, X = (e) => lerp(ax0, ax1, (e + 6) / 4);   // log10 lr: -6 ~ -2
      el('line', { x1: ax0, y1: y, x2: ax1, y2: y, stroke: MUT, 'stroke-width': 2 });
      [-6, -5, -4, -3, -2].forEach((e) => { el('line', { x1: X(e), y1: y - 5, x2: X(e), y2: y + 5, stroke: MUT }); mono(X(e), y + 24, '1e' + e, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
      [[-3, 'fc', GOOD, 6], [-5, 'layer4', ACC, 4]].forEach(([e, n, col, li], i) => { const s = pop(u, 0.4 + i * 0.5), x = lerp(LX(li), X(e), E(u, 0.4 + i * 0.5, 1.2 + i * 0.5));
        el('circle', { cx: x, cy: y, r: 10 * s, fill: col }); mono(x, y - 20, n + ' lr', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s }); });
      el('path', { d: `M${X(-5)},${y - 42} Q${(X(-5) + X(-3)) / 2},${y - 70} ${X(-3)},${y - 42}`, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.8) });
      mono((X(-5) + X(-3)) / 2, y - 64, '100배', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.9) });
      tx(30, 82, 'optim.Adam([{fc, lr 1e-3}, {layer4, lr 1e-5}])', { 'font-size': 15, 'font-weight': 700, class: 'mono' }); return; }
    if (k === 3) { // 갱신 크기 비교
      [[6, 44, GOOD], [4, 8, ACC]].forEach(([i, len, col], j) => { const x = LX(i), y = SY + SH / 2 + 30, g = E(u, 0.3 + j * 0.5, 1.2 + j * 0.5);
        grow(x - len * g / 2 - 1, y + 30, x + len * g / 2 + 1, y + 30, g, col, { sw: 6, plain: true }); mono(x, y + 64, i === 6 ? '크게' : '살살', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: g }); });
      dot([[20, SY], [LX(3), SY]], seg(u, 0.3, 1.6), INFO, 7); mono(LX(1), SY + SH / 2 + 30, '순전파만 통과', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.0) });
      note(30, 400, '백본은 이미 좋다 · 같은 lr 이면 배운 특징이 흔들린다', fade(u, 2.0)); return; }
    if (k === 4) { const ep = 1 + Math.floor(E(u, 0.2, 2.6) * 4.99);
      dot([[20, SY - 20], [900, SY - 20]], seg(u, 0.1, 1.2), INK, 7);
      dot([[900, SY + 20], [LX(4) - 40, SY + 20]], seg(u, 1.2, 2.3), WARN, 7);
      card(800, 340, 200, 60, { rx: 12, stroke: INK, sw: 2 }); mono(800, 348, 'epoch ' + ep + ' / 5', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle' });
      mono(30, 330, 'zero_grad → backward → step', { 'font-size': 15, 'font-weight': 700, fill: ACC }); sub(30, 360, '기울기는 layer4 까지만 거슬러 간다', fade(u, 1.8), { 'text-anchor': 'start', 'font-size': 14.5 }); return; }
    // k5: 세 전략 곡선 (예시)
    const ax = R.axes(560, 50, 340, 200, { x: [1, 6], y: [20, 100], xt: [1, 2, 3, 4, 5, 6], yt: [40, 60, 80, 100], grid: true, xl: 'epoch', yl: '정확도 %' });
    const CV = [['직접 학습', MUT, [30, 48, 58, 65, 70, 74]], ['특징 추출', INFO, [72, 80, 84, 86, 87, 88]], ['미세조정', ACC, [78, 85, 89, 90, 91, 92]]];
    CV.forEach(([n, col, p], i) => { const g = E(u, 0.2 + i * 0.5, 1.2 + i * 0.5); R.line(ax, p.map((v, j) => [j + 1, v]), g, col, { sw: 3 });
      if (g > 0.98) mono(ax.X(6) + 8, ax.Y(p[5]) + 5 + (i === 1 ? 8 : i === 2 ? -6 : 0), p[5] + '%', { 'font-size': 14.5, 'font-weight': 800, fill: col });
      tx(40 + i * 160, 380, '■ ' + n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.3 + i * 0.5) }); });
    tx(560, 300, '예시 값', { 'font-size': 13.5, fill: MUT }); }
  const s4w = (t, c) => { if (c.k === 5) { const { u } = c;
      L.forEach((l, i) => { const lk = i === 6 || i === 4 ? 0 : 1; card(40 + i * 66, 160, 58, 70, { rx: 6, stroke: i === 4 ? ACC : i === 6 ? GOOD : INFO, fill: i === 4 ? ACCBG : i === 6 ? GOODBG : INFOBG, sw: 2, text: ['c1', 'L1', 'L2', 'L3', 'L4', 'ap', 'fc'][i], fs: 14, color: INK });
        if (lk) lock(40 + i * 66, 108, true, INFO, 0.7); });
      note(20, 280, 'head 먼저 → layer4 해동', fade(u, 0.5)); note(20, 310, '해동층 lr 은 head 의 1/100', fade(u, 0.9)); }
    s4(t, c); };

  // ---------- 5. 실무 확장 ----------
  const ZOO = [['convnext_base', 'ConvNeXt', GOOD], ['efficientnet_b0', 'EfficientNet', GOOD], ['vit_base_patch16_224', 'ViT', WARN], ['swin_base_patch4', 'Swin', WARN]];
  function zoo(u, live) { ZOO.forEach(([n, f, col], i) => { const x = 130 + (i % 2) * 260, y = 100 + Math.floor(i / 2) * 70, s = live ? pop(u, 0.2 + i * 0.25) : 1;
      card(x, y, 240, 54, { rx: 10, stroke: col, sw: 2, s }); mono(x, y - 2, n, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); tx(x, y + 18, f, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); }); }
  function modePanel(u) { const sw = E(u, 0.3, 1.0);
    [['model.train()', ACC, 1 - sw], ['model.eval()', INFO, sw]].forEach(([n, col, on], i) => { const x = 200 + i * 360;
      card(x, 200, 320, 170, { rx: 12, stroke: col, sw: 2, op: 0.35 + 0.65 * on }); mono(x, 140, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: 0.35 + 0.65 * on });
      for (let j = 0; j < 6; j++) { const off = i === 0 && (j === 1 || j === 4), cx = x - 90 + j * 36; el('circle', { cx, cy: 190, r: 10, fill: off ? OFF : col, opacity: (0.35 + 0.65 * on) * (off ? 0.5 : 0.8) }); if (off) cross(cx, 190, 8, 0.35 + 0.65 * on); }
      tx(x, 240, i ? 'Dropout 꺼짐 · BN 누적 통계' : 'Dropout 켜짐 · BN 배치 통계', { 'font-size': 14, 'text-anchor': 'middle', opacity: 0.35 + 0.65 * on }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0 || k === 1 || k === 2) { zoo(u, k === 0);
      if (k === 0) { note(620, 110, 'import timm', fade(u, 1.2), { class: 'mono', 'font-size': 17, 'font-weight': 800 }); note(620, 150, 'torchvision 보다 훨씬 많은', fade(u, 1.5)); note(620, 178, '최신 사전학습 백본 카탈로그', fade(u, 1.7)); return; }
      if (k === 1) { const m = E(u, 0.3, 1.2);
        card(lerp(240, 480, m), 290, 300, 44, { rx: 10, text: 'Step 1 · 백본 로드', fs: 14.5, stroke: GRID, op: 1 - m });
        card(lerp(720, 480, m), 290, 300, 44, { rx: 10, text: 'Step 2 · fc 교체', fs: 14.5, stroke: GRID, op: 1 - m });
        card(480, 300, 860, 64, { rx: 12, fill: SOFT, stroke: ACC, sw: 2.5, op: m });
        mono(480, 296, 'timm.create_model("convnext_base",', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: m });
        mono(480, 320, 'pretrained=True, num_classes=10)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: m });
        sub(480, 380, '백본 로드와 머리 교체가 인자 두 개로 줄었다', fade(u, 1.9), { 'font-size': 15 }); return; }
      ['resolve_data_config({}, model=model)', 'create_transform(**cfg)'].forEach((s, i) => { const y = 270 + i * 66; card(330, y, 520, 46, { rx: 23, text: s, fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.3 + i * 0.6) });
        if (i) grow(330, y - 42, 330, y - 24, seg(u, 0.7, 1.0), GOOD); });
      card(780, 303, 220, 64, { rx: 12, text: 'preprocess', fs: 17, mono: true, stroke: GOOD, sw: 2.5, color: GOOD, s: pop(u, 1.5) });
      sub(330, 400, '백본마다 입력 규격이 다르다 · Step 3 의 교훈 그대로', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { const D = [['동물·사물 사진', '작다', GOOD, [6]], ['제품·문서', '중간', WARN, [4, 6]], ['의료·위성', '크다', BAD, [2, 3, 4, 6]]];
      grow(60, 70, 900, 70, seg(u, 0.1, 0.6), MUT); tx(60, 54, 'ImageNet 과의 거리 (도메인 갭)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      D.forEach(([n, g, col, hot], i) => { const x0 = 70 + i * 300, s = pop(u, 0.5 + i * 0.5);
        tx(x0 + 130, 110, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s }); tx(x0 + 130, 134, '갭 ' + g, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: s });
        for (let j = 0; j < 7; j++) { const on = hot.includes(j); card(x0 + 10 + j * 36, 200, 30, 70, { rx: 4, stroke: on ? col : INFO, fill: on ? (col === GOOD ? GOODBG : col === WARN ? WARNBG : BADBG) : INFOBG, sw: 2, s }); }
        tx(x0 + 130, 266, ['fc 만 교체', 'layer4 해동', '얕은 층까지 해동'][i], { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8 + i * 0.5) }); });
      sub(480, 330, '칸 7개 = conv1 · layer1~4 · avgpool · fc (색칠한 칸만 학습)', fade(u, 2.0), { 'font-size': 14.5 });
      note(240, 380, '갭이 클수록 더 풀고, 데이터가 적을수록 덜 푼다', fade(u, 2.3)); return; }
    if (k === 4) { modePanel(u); sub(480, 330, '같은 입력에 같은 답이 나오게 층 동작을 고정한다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 5) { ['x', 'model', 'logits'].forEach((s, i) => { const x = 160 + i * 220; card(x, 150, 140, 50, { rx: 10, text: s, fs: 16, mono: true, stroke: i === 2 ? ACC : INK, color: i === 2 ? ACC : INK, s: pop(u, 0.2 + i * 0.3) });
        if (i) grow(x - 150, 150, x - 74, 150, seg(u, 0.3 + i * 0.3, 0.6 + i * 0.3), MUT); });
      grow(590, 150, 690, 150, seg(u, 1.2, 1.5), ACC); mono(700, 156, 'argmax(dim=1)', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      card(480, 270, 640, 50, { rx: 25, fill: INFOBG, stroke: INFO, sw: 2, s: pop(u, 1.7) });
      mono(480, 276, 'with torch.no_grad():  그래프 기록을 끈다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.8) });
      sub(480, 330, 'eval() 은 층 동작을, no_grad() 는 메모리·속도를 맡는다 · 항상 짝으로', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k6
    zoo(u, false); banner(480, 330, '다음 장 IV-2-1 · PyTorch Lightning', pop(u, 0.4));
    sub(480, 384, '손으로 짠 학습 루프를 프레임워크에 넘긴다', fade(u, 1.0), { 'font-size': 15 }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'ResNet50을 가져와 CIFAR-10에 쓰려고 할 때, 그대로 쓸 수 없는 층은 무엇인가?',
      o: ['layer4 — 너무 깊어서', 'fc — 출력이 ImageNet 1000 클래스용이라서', 'conv1 — 입력 채널이 달라서'], a: 1,
      why: 'model.fc는 Linear(2048, 1000)이다. 우리 문제는 10 클래스이므로 in_features 2048은 그대로 두고 출력만 10으로 갈아 끼운다.' },
    { q: '백본을 얼리고 fc를 바꾼 뒤 count_trainable(model)이 20,490이 나왔다. 그다음 꼭 지킬 것은 무엇인가?',
      o: ['옵티마이저에 requires_grad가 켜진 파라미터만 넘긴다', 'model.fc.in_features를 1000으로 바꾼다', '학습률을 1e-5로 낮춘다'], a: 0,
      why: 'filter(lambda p: p.requires_grad, ...)로 학습 대상만 넘겨야 한다. 전체 23,528,522개 중 학습할 것은 fc의 20,490개뿐이다.' },
    { q: '전처리를 백본과 다르게 넣었을 때 생기는 일은 무엇인가?',
      o: ['shape 오류로 바로 멈춘다', '학습 속도만 느려진다', '에러 없이 정확도만 크게 떨어진다'], a: 2,
      why: '백본은 학습 때 본 크기와 ImageNet 평균·표준편차에 맞춰져 있다. 규격이 어긋나도 텐서 모양은 맞아서 오류 없이 점수만 내려간다(예: 92% → 54%).' },
    { q: 'layer4를 해동할 때 fc와 layer4에 학습률을 다르게 주는 이유는 무엇인가?',
      o: ['layer4는 이미 잘 학습돼 있어 크게 흔들면 배운 특징이 망가져서', 'layer4의 파라미터가 fc보다 적어서', 'Adam은 그룹마다 lr이 달라야만 동작해서'], a: 0,
      why: '새 fc는 처음부터 배워야 해서 1e-3, 사전학습된 layer4는 조금만 조율하면 되니 1e-5로 100배 작게 준다.' },
    { q: '배포한 모델이 같은 사진에 매번 다른 답을 낸다. 먼저 의심할 것은 무엇인가?',
      o: ['timm 백본을 쓰지 않은 것', 'model.eval()을 부르지 않은 것', 'num_classes를 10으로 둔 것'], a: 1,
      why: 'eval()을 빠뜨리면 Dropout이 켜져 있고 BN이 배치 통계를 써서 답이 흔들린다. 추론에는 eval()과 no_grad()를 함께 켠다.' },
  ];

  const summary = [
    'ResNet50의 2,556만 개 가중치를 학습된 채로 받고 fc만 우리 클래스 수로 바꾼다.',
    '백본을 얼리면 학습 대상은 fc의 20,490개뿐이고 옵티마이저에도 그것만 넘긴다.',
    '전처리는 weights.transforms()로 백본에서 받아야 규격이 어긋나지 않는다.',
    'head를 먼저 안정시킨 뒤 layer4를 풀고, 해동층 lr은 head의 1/100로 준다.',
  ];
  const review = [
    { q: 'ResNet50 백본을 IMAGENET1K_V1 가중치로 바꿨는데 전처리는 손으로 적은 Resize(232) 그대로다. 생길 문제는?',
      o: ['V1은 resize 256으로 학습돼 입력 규격이 조용히 어긋난다', 'fc의 in_features가 바뀌어 shape 오류가 난다', 'V1은 동결이 되지 않는다'], a: 0,
      why: '두 버전은 resize 값이 232와 256으로 다르다. weights.transforms()로 받았다면 가중치를 바꿀 때 전처리도 함께 바뀐다.' },
    { q: '특징 추출로 학습했는데 백본 가중치까지 바뀌어 있었다. 가장 먼저 볼 곳은?',
      o: ['weights.transforms()의 출력', 'DataLoader의 batch_size', '옵티마이저에 넘긴 파라미터 목록과 requires_grad'], a: 2,
      why: '얼린 줄 알았던 층이 바뀌었다면 requires_grad를 끄지 않았거나, 켜진 층이 옵티마이저에 들어간 것이다. count_trainable로 숫자부터 확인한다.' },
    { q: '의료 영상처럼 ImageNet과 많이 다른 데이터를 다룬다. 알맞은 계획은?',
      o: ['fc만 바꾸고 처음부터 lr 1e-3으로 전체를 학습한다', 'head를 먼저 학습하고 layer4보다 앞쪽 층까지 낮은 lr로 풀어 본다', '전처리를 생략해 원본 통계를 지킨다'], a: 1,
      why: '도메인 갭이 크면 더 깊은 층까지 풀어야 한다. 그래도 head를 먼저 안정시키고 해동층에는 작은 lr을 주는 순서는 같다.' },
  ];

  R.page({ title: 'ResNet50 전이학습', scenes: [s1, s2, s3, s4w, s5], quiz, summary, review });
})();
