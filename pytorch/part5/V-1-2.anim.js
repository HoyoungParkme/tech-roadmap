/* V-1-2 TorchScript·ONNX 내보내기 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   숫자·코드 출력 출처: venv torch 2.15(CPU)에서 코드 블록을 다시 돌린 값(seed 0).
   onnxruntime 은 설치돼 있지 않아 장면 4 의 출력 대조 값(max diff 3.1e-07)은 페이지의 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, card, mono, sub, pill, grow, dot, fly, cells, zone, check, cross, lock, snippet, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 파일 아이콘 (모서리 접힌 종이)
  function fileIcon(cx, cy, name, col, s, note) { const g = R.G(cx, cy, s ?? 1), c = col || INK;
    el('path', { d: 'M-24,-32 H12 L24,-20 V32 H-24 Z', fill: PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M12,-32 V-20 H24', fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    [-8, 2, 12].forEach((y) => el('line', { x1: -14, y1: y, x2: 12, y2: y, stroke: c, 'stroke-width': 2, opacity: 0.5 }, g));
    if (name) tx(0, 54, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: c, class: 'mono' }, g);
    if (note) tx(0, 74, note, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, class: 'mono' }, g); return g; }
  // 빈 칸 격자 (행렬 모양)
  function grid(x, y, rows, cols, cs, col, u) { const n = rows * cols, sh = Math.floor(n * clamp(u ?? 1));
    for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), c = i % cols;
      el('rect', { x: x + c * cs, y: y + r * cs, width: cs - 2, height: cs - 2, rx: 2, fill: i < sh ? col : SOFT, opacity: i < sh ? 0.7 : 1, stroke: i < sh ? 'none' : GRID }); } }
  function phone(cx, cy, s, col) { const g = R.G(cx, cy, s ?? 1), c = col || INK;
    el('rect', { x: -22, y: -38, width: 44, height: 76, rx: 8, fill: PANEL, stroke: c, 'stroke-width': 2.5 }, g);
    el('line', { x1: -8, y1: 30, x2: 8, y2: 30, stroke: c, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g); return g; }

  // =========================================================
  // 1. 파이썬 객체 → 파이썬 밖
  // =========================================================
  const CH = [[70, 'x (1, 4)', INFO], [200, 'fc1', INK], [320, 'relu', INK], [440, 'fc2', INK], [560, 'y (1, 2)', ACC]];
  function chain(o) { o = o || {};
    CH.forEach(([x, s, col], i) => { const show = o.show ? o.show(i) : 1; if (show <= 0) return;
      card(x, 170, i === 1 || i === 3 ? 84 : 92, 44, { rx: 10, text: s, mono: true, fs: 15, stroke: col, color: col, s: show, fill: i === 4 && o.yval ? ACCBG : PANEL });
      if (i && o.g) grow(CH[i - 1][0] + 46, 170, x - 46, 170, o.g(i), MUT); }); }
  function s1(t, c) { const { k, u } = c;
    const box = k >= 5 ? 1 - E(u, 0.2, 1.0) : 1;
    if (box > 0) { el('rect', { x: 140, y: 110, width: 360, height: 180, rx: 14, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: (k === 0 ? fade(u, 0.1) : 1) * box });
      mono(152, 102, 'class TinyNet(nn.Module)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: box }); }
    if (k === 0) { chain({ show: (i) => (i === 1 || i === 3 ? pop(u, 0.4 + (i - 1) * 0.3) : 0) });
      grid(182, 205, 8, 4, 9, INK, E(u, 0.9, 1.6)); mono(222, 270, 'W 8×4', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) });
      grid(404, 205, 2, 8, 9, INK, E(u, 1.2, 1.8)); mono(440, 240, 'W 2×8', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      pill(320, 340, '파라미터 58개 (32+8 · 16+2)', INK, pop(u, 2.0), { fs: 14.5 }); return; }
    if (k <= 4) chain({ show: (i) => (k === 1 && (i === 0 || i === 2 || i === 4) ? pop(u, 0.2 + i * 0.15) : 1), g: (i) => (k === 1 ? E(u, 0.3 + i * 0.25, 0.6 + i * 0.25) : 1), yval: k >= 3 });
    if (k === 1) { dot(CH.map(([x]) => [x, 170]), seg(u, 1.4, 2.6), ACC, 7); sub(320, 340, '분기 없는 한 줄 경로 — 이것이 굳힐 대상이다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2) { pill(320, 60, 'TinyNet().eval()', GOOD, pop(u, 0.2), { mono: true, fs: 15 });
      mono(320, 330, 'model.training → False', { 'font-size': 15, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      sub(320, 362, '이 모델엔 Dropout·BN 이 없지만 굳히기 전 습관이다', fade(u, 1.5), { 'font-size': 14.5 }); return; }
    if (k === 3 || k === 4) { el('rect', { x: 20, y: 30, width: 610, height: 370, rx: 16, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: k === 3 ? fade(u, 0.2) : 1 });
      tx(36, 56, '파이썬 프로세스', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: k === 3 ? fade(u, 0.2) : 1 });
      mono(560, 225, '[-0.195, -0.150]', { 'font-size': 14.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 3 ? fade(u, 1.0) : 1 });
      mono(560, 250, 'shape [1, 2]', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 1.3) : 1 });
      if (k === 3) { dot(CH.map(([x]) => [x, 170]), seg(u, 0.3, 1.0), ACC, 7); sub(320, 340, '파이썬이 있으면 model(x) 한 줄로 끝 (seed 0 실행값)', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); return; }
      // k4: 파이썬 없는 곳 + GIL
      [['C++ 게임 엔진', 90], ['안드로이드·iOS 앱', 200], ['엣지 기기', 310]].forEach(([s, y], i) => { const a = 0.2 + i * 0.35;
        card(800, y, 230, 64, { rx: 12, stroke: GRID, sw: 2, s: pop(u, a) }); tx(700, y - 4, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) });
        tx(700, y + 20, 'python 인터프리터 없음', { 'font-size': 13.5, fill: BAD, opacity: fade(u, a + 0.2) }); if (u > a + 0.3) cross(890, y, 11, pop(u, a + 0.3)); });
      lock(110, 320, true, WARN, pop(u, 1.5)); tx(140, 316, 'GIL — 한 번에 스레드 하나', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      for (let i = 0; i < 4; i++) el('circle', { cx: 150 + i * 22, cy: 345, r: 7, fill: i ? OFF : WARN, opacity: fade(u, 1.8 + i * 0.1) });
      tx(250, 350, '나머지는 기다린다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    // k5: 그래프를 파일로
    const sq = E(u, 0.2, 1.0);
    CH.forEach(([x, s, col]) => card(lerp(x, 320, sq), 170, 84, 40, { rx: 10, text: s, mono: true, fs: 14, stroke: col, op: 1 - sq }));
    fileIcon(250, 180, '.pt', ACC, pop(u, 1.0), 'TorchScript'); fileIcon(400, 180, '.onnx', INFO, pop(u, 1.3), 'ONNX');
    [['C++', 90], ['모바일', 200], ['엣지', 310]].forEach(([s, y], i) => { card(800, y, 200, 56, { rx: 12, text: s, fs: 15, stroke: GOOD, color: INK });
      dot([[i === 1 ? 400 : 250, 180], [690, y]], seg(u, 1.6 + i * 0.25, 2.4 + i * 0.25), i === 1 ? INFO : ACC, 7); });
    sub(320, 360, '계산 과정을 언어 독립 그래프 파일로 굳힌다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 2. trace 는 지나간 길만, script 는 코드 전체를
  // =========================================================
  const FX = { inX: 80, dX: 250, upX: 440, upY: 110, dnY: 290, outX: 590, y: 200 };
  function flow(o) { o = o || {}; const up = o.up ?? 1, dn = o.dn ?? 1;
    card(FX.inX, FX.y, 80, 44, { rx: 10, text: 'x', mono: true, fs: 16, stroke: INFO, color: INFO, s: o.s ? o.s(0) : 1 });
    const g = R.G(FX.dX, FX.y, o.s ? o.s(1) : 1);
    el('path', { d: 'M0,-46 L92,0 L0,46 L-92,0 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.2 }, g);
    tx(0, 5, 'x.sum() > 0', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono' }, g);
    grow(FX.inX + 40, FX.y, FX.dX - 94, FX.y, o.s ? o.s(1) : 1, MUT);
    if (up > 0) { el('polyline', { points: `${FX.dX},${FX.y - 46} ${FX.dX},${FX.upY} ${FX.upX - 60},${FX.upY}`, fill: 'none', stroke: o.upCol || MUT, 'stroke-width': o.upCol ? 3.5 : 2.2, opacity: up });
      card(FX.upX, FX.upY, 120, 44, { rx: 10, text: 'x * 2', mono: true, fs: 16, stroke: o.upCol || INK, op: up }); tx(FX.dX + 10, FX.upY + 30, 'True', { 'font-size': 13.5, fill: MUT, opacity: up }); }
    if (dn > 0) { el('polyline', { points: `${FX.dX},${FX.y + 46} ${FX.dX},${FX.dnY} ${FX.upX - 60},${FX.dnY}`, fill: 'none', stroke: o.dnCol || MUT, 'stroke-width': o.dnCol ? 3.5 : 2.2, opacity: dn, 'stroke-dasharray': o.dnDash });
      card(FX.upX, FX.dnY, 120, 44, { rx: 10, text: 'x - 1', mono: true, fs: 16, stroke: o.dnCol || INK, op: dn, dash: o.dnDash }); tx(FX.dX + 10, FX.dnY - 18, 'False', { 'font-size': 13.5, fill: MUT, opacity: dn }); }
    [[FX.upY, up], [FX.dnY, dn]].forEach(([y, a]) => { if (a > 0) el('polyline', { points: `${FX.upX + 60},${y} ${FX.outX - 40},${y} ${FX.outX - 40},${FX.y}`, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: a }); });
    card(FX.outX, FX.y, 70, 44, { rx: 10, text: 'out', mono: true, fs: 15, stroke: ACC, color: ACC, s: o.s ? o.s(2) : 1 }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { const P = [[90, 'x'], [230, 'fc1'], [350, 'relu'], [470, 'fc2']];
      P.forEach(([x, s], i) => { card(x, 150, 90, 44, { rx: 10, text: s, mono: true, fs: 15, stroke: i ? INK : INFO }); if (i) grow(P[i - 1][0] + 45, 150, x - 45, 150, 1, MUT); });
      if (k === 0) { dot(P.map(([x]) => [x, 150]), seg(u, 0.3, 1.5), BAD, 8); pill(90, 92, 'example (1, 4)', INFO, pop(u, 0.2), { mono: true, fs: 14 });
        el('circle', { cx: 560, cy: 72, r: 8, fill: BAD, opacity: Math.floor(t * 3) % 2 ? 1 : 0.3 }); tx(576, 78, 'REC', { 'font-size': 15, 'font-weight': 800, fill: BAD });
        snippet(560, 120, ['def forward(self, x):', '  input = torch.relu(fc1(x))', '  return fc2(input)'], { fs: 14, op: fade(u, 1.6) });
        sub(280, 260, '지나간 연산만 녹화된다 — traced.code', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
      fly(470, 172, 470, 290, seg(u, 0.1, 0.8), 'traced', { mono: true });
      fileIcon(470, 300, 'tinynet_traced.pt', ACC, pop(u, 0.9), '6,818 B');
      card(760, 160, 260, 60, { rx: 10, text: 'class TinyNet 정의', mono: true, fs: 15, stroke: OFF, color: OFF, dash: '6 4', s: pop(u, 1.3) }); if (u > 1.6) cross(880, 140, 11, pop(u, 1.6));
      sub(760, 220, '로드할 때 파이썬 클래스가 필요 없다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2) { flow({ s: (i) => pop(u, 0.2 + i * 0.5) }); pill(250, 60, 'class Branchy', WARN, pop(u, 0.2), { mono: true, fs: 15 });
      sub(780, 200, '입력 값에 따라 길이 갈린다', fade(u, 1.6), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 3) { const g = E(u, 0.9, 1.7); flow({ upCol: BAD, dn: 1 - g * 0.85, dnDash: '6 5' });
      pill(FX.inX, 140, 'torch.ones(3)', INFO, pop(u, 0.1), { mono: true, fs: 14 }); dot([[FX.inX + 40, FX.y], [FX.dX, FX.y], [FX.dX, FX.upY], [FX.upX, FX.upY]], seg(u, 0.2, 0.9), BAD, 7);
      snippet(640, 70, ['# traced.code', 'def forward(self, x):', '  return torch.mul(x, c0)'], { fs: 14, op: fade(u, 1.5) });
      pill(790, 200, 'TracerWarning 한 줄뿐', WARN, pop(u, 1.9), { fs: 14 });
      mono(640, 260, 'traced(-2·ones) → [-4., -4., -4.]', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) });
      sub(790, 292, 'x - 1 이 그래프에 없다 — 에러 없이 틀린다', fade(u, 2.4), { 'font-size': 14, fill: BAD }); return; }
    if (k === 4) { flow({ upCol: GOOD, dnCol: GOOD });
      snippet(640, 60, ['# scripted.code', 'if bool(torch.gt(torch.sum(x), 0)):', '  _0 = torch.mul(x, 2)', 'else:', '  _0 = torch.sub(x, 1)', 'return _0'], { fs: 13.5, op: fade(u, 0.5) });
      pill(790, 260, '실행하지 않고 코드를 읽는다', GOOD, pop(u, 1.6), { fs: 14 }); return; }
    if (k === 5) { flow({ upCol: GOOD, dnCol: GOOD });
      dot([[FX.inX + 40, FX.y], [FX.dX, FX.y], [FX.dX, FX.upY], [FX.upX, FX.upY]], seg(u, 0.2, 0.9), GOOD, 7);
      dot([[FX.inX + 40, FX.y], [FX.dX, FX.y], [FX.dX, FX.dnY], [FX.upX, FX.dnY]], seg(u, 1.1, 1.8), GOOD, 7);
      [['scripted(ones)', '[ 2.,  2.,  2.]', GOOD, 0.8], ['scripted(-2·ones)', '[-3., -3., -3.]', GOOD, 1.7], ['traced(-2·ones)', '[-4., -4., -4.]', BAD, 2.2]].forEach(([a, b, col, at], i) => {
        mono(650, 120 + i * 60, a, { 'font-size': 14.5, fill: MUT, opacity: fade(u, at) }); mono(650, 144 + i * 60, '→ ' + b, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, at) }); });
      sub(780, 330, '-ones 로 재면 둘 다 -2 라 차이가 안 보인다', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 6) { [['제어 흐름 없음 (순수 텐서 연산)', 'trace 로 충분', INFO], ['데이터에 따라 분기·반복', '반드시 script', GOOD]].forEach(([a, b, col], i) => { const y = 130 + i * 120, s = pop(u, 0.3 + i * 0.6);
        card(260, y, 400, 70, { rx: 12, text: a, fs: 16, stroke: INK, s }); grow(462, y, 590, y, E(u, 0.6 + i * 0.6, 1.0 + i * 0.6), col);
        card(720, y, 220, 70, { rx: 12, text: b, fs: 17, stroke: col, color: col, fill: col === GOOD ? GOODBG : INFOBG, s: pop(u, 0.9 + i * 0.6) }); });
      sub(480, 380, '헷갈리면 script 부터 시도한다', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    // k7: C++
    fileIcon(150, 190, 'tinynet_traced.pt', ACC, 1);
    grow(200, 190, 380, 190, E(u, 0.3, 1.0), ACC);
    zone(400, 90, 500, 220, 'C++ 프로세스 — 파이썬 없음', { fill: SOFT, stroke: INK, sw: 2 });
    snippet(420, 130, ['#include <torch/script.h>', 'auto m = torch::jit::load("tinynet_traced.pt");', 'auto out = m.forward({input}).toTensor();'], { fs: 13.5, op: fade(u, 1.0) });
    if (u > 2.0) check(870, 270, 12, pop(u, 2.0)); }

  // =========================================================
  // 3. torch.export — ExportedProgram 과 동적 축
  // =========================================================
  const GN = [[90, 'x', INFO], [270, 'aten.linear', INK], [450, 'aten.relu', INK], [630, 'aten.linear', INK], [800, 'output', ACC]];
  function epGraph(u, o) { o = o || {};
    GN.forEach(([x, s, col], i) => { const a = 0.2 + i * 0.3; card(x, 200, 136, 44, { rx: 10, text: s, mono: true, fs: 14.5, stroke: col, color: col, s: o.full ? 1 : pop(u, a), op: o.op });
      if (i) grow(GN[i - 1][0] + 68, 200, x - 70, 200, o.full ? 1 : E(u, a - 0.1, a + 0.1), MUT, { op: o.op }); });
    [[270, 'p_fc1_weight', 'p_fc1_bias'], [630, 'p_fc2_weight', 'p_fc2_bias']].forEach(([x, w, b], j) => [w, b].forEach((s, i) => { const yy = 106 + i * 34, a = 1.5 + j * 0.3;
      card(x, yy, 140, 28, { rx: 6, text: s, mono: true, fs: 13.5, stroke: GRID, color: MUT, sw: 1.5, s: o.full ? 1 : pop(u, a), op: o.op }); })); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { pill(330, 170, 'from torch.export import export', ACC, pop(u, 0.3), { mono: true, fs: 15 }); pill(660, 170, 'Dim', INFO, pop(u, 0.9), { mono: true, fs: 16 });
      sub(330, 220, '그래프를 붙잡는 입구', fade(u, 1.2), { 'font-size': 14.5 }); sub(660, 220, '가변 축 선언', fade(u, 1.5), { 'font-size': 14.5 });
      card(480, 320, 380, 50, { rx: 12, text: 'torch.jit → torch.export', mono: true, fs: 16, stroke: MUT, color: INK, s: pop(u, 1.9) }); return; }
    if (k === 1) { epGraph(u); tx(40, 60, 'ep = export(model, example_inputs)', { 'font-size': 16, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.1) });
      pill(480, 300, 'ExportedProgram', ACC, pop(u, 2.0), { mono: true, fs: 15 });
      sub(480, 350, '모델을 한 번 실행해 정적 그래프를 잡는다', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2) { epGraph(u, { full: true, op: 0.45 });
      snippet(40, 260, ['linear = aten.linear.default(x, p_fc1_weight, p_fc1_bias)', 'relu = aten.relu.default(linear)', 'linear_1 = aten.linear.default(relu, p_fc2_weight, p_fc2_bias)'], { fs: 13.5, op: fade(u, 0.3) });
      tx(40, 60, 'print(ep.graph_module) — Core ATen 연산 3개', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      card(780, 380, 340, 44, { rx: 8, text: 'Branchy 를 export → 에러로 멈춘다', fs: 14, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.8) }); return; }
    if (k === 3) { tx(40, 50, 'x 의 0번 축 = Dim("batch", min=1, max=256)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      [[1, GOOD], [8, GOOD], [256, GOOD], [300, BAD]].forEach(([b, col], i) => { const x = 90 + i * 150, h = Math.min(200, 12 + Math.sqrt(b) * 11), s = E(u, 0.3 + i * 0.35, 0.8 + i * 0.35);
        el('rect', { x: x - 30, y: 300 - h * s, width: 60, height: h * s, rx: 4, fill: col, opacity: 0.6 });
        mono(x, 324, `(${b}, 4)`, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: col, opacity: fade(u, 0.5 + i * 0.35) });
        if (u > 0.8 + i * 0.35) (col === GOOD ? check : cross)(x, 350, 10, pop(u, 0.8 + i * 0.35)); });
      sub(310, 390, '300 → Guard failed: x.size()[0] <= 256', fade(u, 2.2), { class: 'mono', 'font-size': 14, fill: BAD });
      card(790, 130, 270, 112, { rx: 10, stroke: WARN, fill: WARNBG, s: pop(u, 1.2) });
      tx(670, 104, '예시 입력이 (1, 4) 면', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) });
      tx(670, 130, '배치 축이 상수 1 로 굳어', { 'font-size': 14, opacity: fade(u, 1.4) });
      tx(670, 154, 'export 가 에러를 낸다', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.5) });
      tx(670, 178, '→ 예시는 (2, 4) 로 잡는다', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.7) });
      sub(790, 270, '선언 안 하면 (8, 4) 도 Guard failed', fade(u, 2.0), { 'font-size': 14, fill: BAD }); return; }
    if (k === 4) { card(150, 200, 180, 56, { rx: 12, text: 'ExportedProgram', mono: true, fs: 15, stroke: ACC, color: ACC });
      grow(242, 200, 400, 200, E(u, 0.2, 0.8), ACC); mono(320, 186, 'save', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
      fileIcon(470, 190, 'tinynet.pt2', ACC, pop(u, 0.8), '11,505 B');
      grow(520, 200, 680, 200, E(u, 1.4, 2.0), INFO); mono(600, 186, 'load', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) });
      card(790, 200, 180, 56, { rx: 12, text: 'ExportedProgram', mono: true, fs: 15, stroke: INFO, color: INFO, s: pop(u, 1.9) });
      sub(480, 340, '클래스 코드 없이 그래프 파일만 옮긴다', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 5 || k === 6) { const root = [480, 330];
      card(root[0], root[1], 220, 56, { rx: 12, text: 'TorchDynamo', mono: true, fs: 17, stroke: INK, fill: SOFT, s: k === 5 ? pop(u, 0.2) : 1 });
      const BR = [[200, 'torch.compile', '실행 속도 (배포 아님)', INFO], [480, 'torch.export', '배포 · 이식성 (권장)', GOOD], [760, 'TorchScript', '유지보수 모드', OFF]];
      BR.forEach(([x, a, b, col], i) => { if (k === 5 && i === 2) return; const ga = k === 5 ? E(u, 0.6 + i * 0.4, 1.1 + i * 0.4) : 1;
        if (i < 2) grow(root[0] + (i ? 0 : -60), root[1] - 28, x, 160, ga, col, { plain: true });
        card(x, 120, 230, 70, { rx: 12, stroke: col, fill: PANEL, sw: 2.5, s: k === 5 ? pop(u, 0.9 + i * 0.4) : 1 });
        mono(x, 114, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col === OFF ? MUT : col, opacity: k === 5 ? fade(u, 1.0 + i * 0.4) : 1 });
        tx(x, 140, b, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: k === 5 ? fade(u, 1.0 + i * 0.4) : 1 }); });
      if (k === 5) { sub(480, 400, '그래프를 잡는 같은 기술 — 목적이 다르다', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
      card(760, 215, 280, 54, { rx: 10, text: 'torch 2.15: jit.trace·script 에\nFutureWarning (deprecated)', fs: 13.5, stroke: WARN, color: INK, fill: WARNBG, s: pop(u, 0.8) });
      sub(480, 400, '새 프로젝트는 export 부터 본다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // =========================================================
  // 4. ONNX — 내보내고, 같은 답인지 숫자로 대조
  // =========================================================
  const OG = [[120, 'x', INFO], [260, 'Linear', INK], [380, 'Relu', INK], [500, 'Linear', INK], [640, 'logits', ACC]];
  function onnxGraph(op) { OG.forEach(([x, s, col], i) => { card(x, 110, i === 0 || i === 4 ? 90 : 100, 40, { rx: 10, text: s, mono: true, fs: 14.5, stroke: col, color: col, op });
    if (i) grow(OG[i - 1][0] + 48, 110, x - 50, 110, 1, MUT, { op }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [['import torch', INK], ['import numpy as np', INFO], ['import onnxruntime as ort', ACC]].forEach(([s, col], i) => pill(480, 110 + i * 70, s, col, pop(u, 0.3 + i * 0.4), { mono: true, fs: 16 }));
      sub(480, 340, 'onnxruntime 은 pip install 로 따로 설치한다', fade(u, 1.7), { 'font-size': 14.5 });
      sub(480, 370, '내보내기와 검증은 한 세트', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { grid(380, 140, 2, 4, 40, INFO, E(u, 0.3, 1.3)); mono(460, 120, 'example (2, 4)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO });
      sub(460, 270, '배치가 1 이면 그 축이 상수로 굳는다', fade(u, 1.6), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 2 || k === 3) { onnxGraph(k === 2 ? fade(u, 0.2) : 1);
      fileIcon(820, 120, 'tinynet.onnx', INFO, k === 2 ? pop(u, 1.2) : 1);
      pill(120, 175, 'input_names=["x"]', INFO, k === 2 ? pop(u, 1.6) : 1, { mono: true, fs: 13.5 }); pill(640, 175, 'output_names=["logits"]', ACC, k === 2 ? pop(u, 1.8) : 1, { mono: true, fs: 13.5 });
      tx(40, 46, 'torch.onnx.export(..., dynamo=True)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      if (k === 2) { sub(400, 300, 'ExportedProgram 을 거쳐 ONNX 그래프를 만든다', fade(u, 2.1), { 'font-size': 14.5, fill: INK }); return; }
      const st = 2 + 6 * (0.5 + 0.5 * Math.sin(t * 2.2));
      grid(330, 240, Math.round(st), 4, 18, INFO, 1); mono(300, 260, 'x', { 'font-size': 16, 'font-weight': 700, fill: INFO, 'text-anchor': 'end' });
      mono(560, 270, 'shape ["batch", 4]', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.5) });
      mono(560, 300, 'dynamic_shapes={"x": {0: "batch"}}', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      sub(640, 350, '이 줄이 없으면 배치 2 로만 돈다', fade(u, 1.6), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); return; }
    // k4~8: 세션 · 대조
    fileIcon(80, 90, '', INFO, 0.8); mono(80, 150, 'tinynet.onnx', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO });
    card(230, 90, 150, 46, { rx: 10, text: 'ort 세션', fs: 15, stroke: INFO, color: INFO, s: k === 4 ? pop(u, 0.3) : 1 }); grow(110, 90, 152, 90, 1, INFO);
    grid(50, 200, 8, 4, 20, INK, k === 4 ? E(u, 0.8, 1.8) : 1); mono(90, 188, 'test (8, 4)', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' });
    if (k === 4) { sub(400, 250, '예시(2)와 다른 배치 8 로 — 동적 축까지 같이 확인', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k >= 5) { grow(140, 280, 330, 230, k === 5 ? E(u, 0.2, 0.7) : 1, ACC); grid(340, 150, 8, 2, 20, ACC, k === 5 ? E(u, 0.6, 1.5) : 1); mono(360, 138, 'torch_out', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC }); }
    if (k === 5) { sub(560, 240, 'model(test).numpy() — 기준 답', fade(u, 1.5), { 'font-size': 14.5, fill: INK }); return; }
    if (k >= 6) { grow(305, 90, 470, 140, k === 6 ? E(u, 0.2, 0.7) : 1, INFO); grid(470, 150, 8, 2, 20, INFO, k === 6 ? E(u, 0.6, 1.5) : 1); mono(490, 138, 'onnx_out', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO }); }
    if (k === 6) { tx(560, 230, '눈으로는 같아 보인다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); sub(660, 260, '반올림된 출력은 미세한 차이를 감춘다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 7) { tx(560, 160, '|torch − onnx| ≤ atol + rtol·|onnx|', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) });
      mono(560, 190, 'rtol = 1e-3   atol = 1e-5', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.5) });
      grid(600, 220, 8, 2, 20, GOOD, E(u, 0.8, 1.6)); mono(700, 260, 'max diff', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5) });
      mono(700, 292, '3.1e-07 (예시)', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7) });
      if (u > 2.0) check(870, 280, 14, pop(u, 2.0)); pill(760, 360, 'PASS — CI 에 넣어 둔다', GOOD, pop(u, 2.2), { fs: 14.5 }); return; }
    // k8: 막혔을 때
    tx(560, 140, '지원 안 되는 연산자를 만나면', { 'font-size': 16, 'font-weight': 700, fill: BAD });
    [['1  표준 연산으로 다시 쓴다', INK], ['2  opset_version 을 올린다', INFO], ['3  커스텀 심볼릭·연산자 등록', WARN]].forEach(([s, col], i) => card(740, 190 + i * 62, 360, 48, { rx: 10, text: s, fs: 15, stroke: col, color: INK, s: pop(u, 0.3 + i * 0.45) })); }

  // =========================================================
  // 5. 목적지가 길을 정한다
  // =========================================================
  const DEST = [[80, '파이썬 서버', '그냥 PyTorch (+compile)', GOOD], [175, 'C++ 서버·엔진', 'TorchScript .pt / export .pt2', INK], [270, 'onnxruntime·TensorRT', 'ONNX .onnx', INFO], [365, 'iOS·안드로이드', 'ExecuTorch', ACC]];
  function s5(t, c) { const { k, u } = c, n = Math.min(k + 1, 4);
    card(110, 220, 150, 70, { rx: 12, text: '학습 끝난\nmodel', fs: 16, stroke: INK, fill: SOFT });
    if (k >= 4) { card(330, 300, 160, 46, { rx: 10, text: 'torch.export', mono: true, fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: k === 4 ? pop(u, 0.3) : 1 }); grow(186, 240, 250, 290, k === 4 ? E(u, 0.2, 0.6) : 1, ACC, { plain: true }); }
    DEST.slice(0, n).forEach(([y, a, b, col], i) => { const fresh = i === n - 1 && k <= 3, gu = fresh ? E(u, 0.2, 1.0) : 1;
      const from = k >= 4 && i >= 1 ? [410, 300] : [186, 220];
      const hot = k >= 4 && i >= 1;
      el('path', { d: `M${from[0]},${from[1]} C${from[0] + 120},${from[1]} ${580 - 140},${y} 580,${y}`, fill: 'none', stroke: hot ? ACC : col === INK ? MUT : col, 'stroke-width': hot ? 3 : 2.2, 'stroke-dasharray': `${600 * gu} 600` });
      tx(670, y + 28, b, { 'font-size': 13.5, fill: MUT, opacity: fresh ? fade(u, 0.8) : 1, class: 'mono' });
      const s = fresh ? pop(u, 1.0) : 1;
      if (i === 3) phone(620, y, s * 0.6, col); else server(620, y, null, { s: s * 0.5, lamp: col });
      tx(670, y + 4, a, { 'font-size': 15.5, 'font-weight': 700, opacity: fresh ? fade(u, 1.1) : 1 }); });
    if (k === 0) sub(330, 400, '파이썬에서 돌리면 내보내지 않는다', fade(u, 1.6), { 'font-size': 14.5, fill: INK });
    if (k === 1) sub(330, 400, '파이썬 없이 로드 — 신규라면 .pt2 쪽', fade(u, 1.6), { 'font-size': 14.5, fill: INK });
    if (k === 2) sub(330, 400, '포맷이 바뀌는 곳 — 출력 대조를 꼭 같이', fade(u, 1.6), { 'font-size': 14.5, fill: INK });
    if (k === 3) sub(330, 400, 'to_edge(export(...)).to_executorch()', fade(u, 1.6), { 'font-size': 14, fill: INK, class: 'mono' });
    if (k === 4) sub(330, 400, '아래 셋의 공통 뿌리 = torch.export', fade(u, 1.2), { 'font-size': 15, fill: ACC, 'font-weight': 700 });
    if (k === 5) { card(830, 400, 220, 34, { rx: 17, text: '다음 장 · 서빙 패턴', fs: 14.5, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 0.4) });
      sub(330, 400, '"무엇으로" 보다 "어디서 실행" 이 먼저', fade(u, 0.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  const quiz = [
    { q: 'PyTorch 모델을 그래프 파일로 내보내야 하는 가장 큰 이유는 무엇인가?',
      o: ['파이썬 인터프리터가 없는 C++·모바일·엣지에서 실행하려고', '파이썬 안에서 추론 결과가 틀려서', '학습을 더 빠르게 하려고'], a: 0,
      why: 'model 은 파이썬 객체라 같은 클래스 코드와 인터프리터가 있어야 돈다. 그래프를 언어 독립 파일로 굳히면 그 의존이 사라진다.' },
    { q: 'Branchy 를 torch.ones(3) 로 trace 한 뒤 -2·ones 를 넣으면 어떻게 되는가?',
      o: ['에러가 나서 멈춘다', 'x - 1 경로가 없어 [-4., -4., -4.] 를 조용히 돌려준다', '자동으로 else 경로를 찾아 [-3., -3., -3.] 을 돌려준다'], a: 1,
      why: 'trace 는 그때 지나간 x * 2 만 녹화한다. TracerWarning 한 줄 외에는 에러 없이 틀린 답을 낸다.' },
    { q: 'export 할 때 dynamic_shapes 로 배치 축을 선언하지 않으면 어떻게 되는가?',
      o: ['예시 입력의 배치 크기로만 돌아가고 다른 배치는 Guard failed 가 난다', '모든 배치 크기가 자동으로 허용된다', '저장할 때 에러가 난다'], a: 0,
      why: '예시 배치로 굳은 그래프에 (8, 4) 를 넣으면 Guard failed 가 난다. 예시 배치가 1 이면 축이 상수로 굳어 동적 선언 자체도 실패하니 예시는 2 이상으로 잡는다.' },
    { q: 'ONNX 로 내보낸 뒤 onnxruntime 출력이 눈으로 보기에 같다. 그다음 할 일은?',
      o: ['그대로 배포한다', '배치 크기를 1 로 고정한다', 'assert_allclose 로 허용 오차 안인지 숫자로 대조한다'], a: 2,
      why: '반올림된 출력은 미세한 차이를 감춘다. rtol·atol 로 대조해 통과해야 같은 답을 낸다고 믿을 수 있다.' },
    { q: '파이썬 FastAPI 서버에서 모델을 돌린다면 알맞은 경로는?',
      o: ['ONNX 로 내보내 onnxruntime 으로 돌린다', '그냥 PyTorch 로 돌리고 필요하면 torch.compile 만 얹는다', 'ExecuTorch 로 바꾼다'], a: 1,
      why: '실행 환경이 파이썬이면 내보낼 이유가 없다. 성급한 내보내기는 디버깅만 어렵게 한다.' },
  ];

  const summary = [
    '모델은 파이썬 객체라서 인터프리터가 없는 C++·모바일·엣지에서는 그대로 돌릴 수 없다.',
    'trace 는 지나간 길만 녹화해 분기가 사라지고, script 는 코드를 컴파일해 if 를 남긴다.',
    'torch.export 는 Core ATen 그래프를 잡고, 배치 축은 Dim 으로 열어야 다른 배치가 돈다.',
    'ONNX 로 내보낸 뒤에는 같은 입력으로 출력을 숫자로 대조하고, 실행할 곳에 맞춰 경로를 고른다.',
  ];
  const review = [
    { q: 'trace 로 내보낸 모델이 서버에서 음수 입력에만 틀린 답을 낸다. 먼저 의심할 것은?',
      o: ['forward 안의 데이터 의존 분기가 한쪽만 녹화되었다', 'onnxruntime 버전이 낮다', '배치 축을 열지 않았다'], a: 0,
      why: '에러 없이 특정 입력에서만 틀리면 trace 의 분기 고정을 의심한다. script 나 export 로 다시 내보내고 양쪽 입력으로 확인한다.' },
    { q: 'export 한 .pt2 를 서빙에 올렸더니 배치 8 요청에서 Guard failed 가 났다. 고칠 곳은?',
      o: ['TorchScript 로 바꾼다', 'dynamic_shapes 로 0번 축을 Dim 으로 열고, 예시 배치는 2 이상으로 다시 export 한다', '요청을 하나씩 보내게 바꾼다'], a: 1,
      why: '예시 입력의 배치로 굳은 그래프다. 0번 축을 가변으로 선언하면 1~256 범위의 배치가 같은 그래프로 돈다.' },
    { q: '안드로이드 앱에 넣을 모델과 C++ 서버에 넣을 모델을 함께 준비한다. 공통으로 먼저 할 일은?',
      o: ['각각 ONNX 로 내보낸다', 'TorchScript 로 trace 한다', 'torch.export 로 ExportedProgram 을 잡는다'], a: 2,
      why: 'ExecuTorch 는 ExportedProgram 을 입력으로 받고, C++ 쪽도 .pt2 로 저장할 수 있다. 두 길의 공통 뿌리가 torch.export 다.' },
  ];

  R.page({ title: '모델 내보내기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
