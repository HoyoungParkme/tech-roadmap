/* II-1-2 제어식 — nn.Module 서브클래싱 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  const shapeTag = (cx, y, s, op, col) => mono(cx, y, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col || INFO, opacity: op ?? 1 });
  // 층 벽돌: 이름(고정폭) + 아래 작은 설명
  const brick = (cx, cy, w, name, col, o) => { o = o || {}; card(cx, cy, w, o.h || 42, { rx: 8, text: name, fs: o.fs || 14, mono: true, stroke: col || ACC, fill: o.fill || PANEL, s: o.s, op: o.op, color: o.color }); };
  // _modules 서랍: keys 를 위에서부터 칸으로
  function drawer(x, y, w, keys, o) { o = o || {}; const rh = 34, h = Math.max(1, keys.length) * rh + 36;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || SOFT, stroke: o.stroke || INFO, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    mono(x + 12, y + 22, o.title || '_modules', { 'font-size': 14, 'font-weight': 700, fill: o.stroke || INFO, opacity: o.op ?? 1 });
    if (!keys.length) mono(x + w / 2, y + 56, '{ }', { 'font-size': 16, fill: MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 });
    keys.forEach(([key, val, a], i) => { const yy = y + 34 + i * rh, s = a ?? 1; if (s <= 0) return;
      el('rect', { x: x + 8, y: yy, width: w - 16, height: rh - 6, rx: 6, fill: PANEL, stroke: GRID, opacity: s });
      mono(x + 18, yy + 20, `'${key}'`, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: s });
      mono(x + w - 16, yy + 20, val, { 'font-size': 13.5, fill: INK, 'text-anchor': 'end', opacity: s }); }); return h; }

  // =========================================================
  // 1. 2메서드 계약 — Sequential 의 세 부품이 __init__ 과 forward 로
  // =========================================================
  const PARTS = [['Linear(784,128)', ACC], ['ReLU()', WARN], ['Linear(128,10)', ACC]];
  const ATTR = ['fc1', 'act', 'fc2'];
  function s1(t, c) { const { k, u } = c;
    // 왼쪽: Sequential (기준)
    zone(24, 40, 230, 250, 'seq = nn.Sequential(', { stroke: k === 0 ? ACC : GRID, fill: PANEL, dash: '6 4' });
    PARTS.forEach(([s, col], i) => { if (k === 2 && u > 0.3 + i * 0.4) return; brick(139, 100 + i * 62, 190, s, col, { s: k === 0 ? pop(u, 0.3 + i * 0.35) : 1, op: k > 2 ? 0.45 : 1 }); });
    if (k === 0) { [0, 1].forEach((i) => grow(139, 122 + i * 62, 139, 140 + i * 62, E(u, 1.0 + i * 0.3, 1.3 + i * 0.3), MUT));
      card(600, 165, 420, 110, { rx: 14, text: '이 세 부품을\nclass MLP(nn.Module) 로 옮긴다', fs: 17, stroke: INFO, color: INFO, dash: '7 5', s: pop(u, 1.6) });
      sub(139, 320, '순서대로 늘어놓기만 하는 지름길', fade(u, 1.2), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    // 오른쪽: class MLP
    zone(290, 26, 646, 380, 'class MLP(nn.Module)', { stroke: INFO, fill: C.INFOBG, op: k === 1 ? fade(u, 0.1) : 1 });
    mono(310, 74, 'super().__init__()', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: k === 1 ? fade(u, 0.5) : 1 });
    // __init__ 선반
    tx(310, 112, '① __init__ = 부품', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const reg = (i) => (k === 2 ? E(u, 0.4 + i * 0.4, 1.0 + i * 0.4) : k > 2 ? 1 : 0);
    const keys = k === 1 ? [] : ATTR.map((a, i) => [a, PARTS[i][0].replace('()', ''), reg(i)]);
    drawer(700, 50, 220, keys, { op: k === 1 ? fade(u, 0.8) : 1 });
    if (k === 1) { sub(810, 140, '부품을 담을 저장소', fade(u, 1.1), { 'font-size': 14 });
      card(610, 280, 520, 72, { rx: 12, text: 'super().__init__() 가 없으면\ncannot assign module before Module.__init__() call', fs: 14, stroke: BAD, color: BAD, s: pop(u, 1.8) }); return; }
    ATTR.forEach((a, i) => { const f = k === 2 ? E(u, 0.3 + i * 0.4, 0.9 + i * 0.4) : 1; if (k === 2 && u <= 0.3 + i * 0.4) return; const x = lerp(139, 370 + i * 105, f), y = lerp(100 + i * 62, 150, f);
      brick(x, y, 96, 'self.' + a, PARTS[i][1], { fs: 14 }); });
    if (k === 2) { sub(530, 200, '대입하는 순간 _modules 에 등록', fade(u, 1.8), { 'font-size': 14, fill: INK, 'font-weight': 700 }); pill(810, 230, 'params 101,770', ACC, pop(u, 2.2), { mono: true, fs: 14 }); return; }
    // forward 흐름
    tx(310, 222, '② forward = 흐름', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const Y = 300, xs = [340, 470, 600, 730, 860];
    const show = (i) => (k === 3 ? (i <= 2 ? E(u, 0.3 + i * 0.5, 0.8 + i * 0.5) : 0) : k === 4 ? (i <= 2 ? 1 : E(u, 0.3 + (i - 3) * 0.6, 0.9 + (i - 3) * 0.6)) : 1);
    card(xs[0], Y, 56, 40, { rx: 20, text: 'x', fs: 17, mono: true, stroke: INFO, color: INFO });
    [1, 2, 3].forEach((i) => { const s = show(i); if (s <= 0) return; grow(xs[i - 1] + 34, Y, xs[i] - 46, Y, s, MUT); brick(xs[i], Y, 86, 'self.' + ATTR[i - 1], PARTS[i - 1][1], { s }); });
    if (show(4) > 0) { grow(xs[3] + 46, Y, xs[4] - 34, Y, show(4), ACC); card(xs[4], Y, 74, 40, { rx: 20, text: 'return', fs: 14, mono: true, stroke: ACC, color: ACC, s: show(4) }); }
    if (k === 3) { shapeTag(xs[0], Y + 46, '(4,784)', fade(u, 0.4)); shapeTag(xs[1], Y + 46, '(4,128)', fade(u, 1.0)); shapeTag(xs[2], Y + 46, '(4,128)', fade(u, 1.4));
      sub(600, 385, 'Sequential 의 순서가 호출 순서로 그대로', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    shapeTag(xs[3], Y + 46, '(4,10)', k === 4 ? fade(u, 1.2) : 1);
    if (k === 4) { sub(600, 385, '메서드 두 개면 모델 하나가 끝난다', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    // k5: model(x) 호출
    dot(xs.map((x) => [x, Y]), seg(u, 0.4, 2.0), ACC, 8);
    pill(139, 340, 'model(x)', GOOD, pop(u, 0.2), { mono: true, fs: 16 });
    grow(190, 340, 300, 310, E(u, 0.3, 0.7), GOOD);
    pill(600, 385, 'out.shape → torch.Size([4, 10])', GOOD, pop(u, 2.0), { mono: true, fs: 14 }); }

  // =========================================================
  // 2. forward 의 자유 — 잔차 · 루프 · 분기
  // =========================================================
  function vec(cx, cy, n, seed, o) { o = o || {}; const w = 22, h = n * 12;
    el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 4, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    for (let i = 0; i < n; i++) { const v = Math.sin(i * 1.9 + seed) * 0.8, bw = Math.abs(v) * 16; el('rect', { x: v >= 0 ? cx + w / 2 + 2 : cx - w / 2 - 2 - bw, y: cy - h / 2 + i * 12 + 3, width: bw, height: 6, rx: 2, fill: v >= 0 ? ACC : BAD, opacity: (o.op ?? 1) * 0.8 }); } }
  function s2(t, c) { const { k, u } = c, Y = 230;
    if (k <= 2 || k === 6) { // ResidualMLP
      const box = k === 0 ? pop(u, 0.2) : 1;
      zone(60, 40, 840, 320, 'class ResidualMLP(nn.Module)', { stroke: INFO, fill: C.INFOBG, op: box });
      const bg = R.G(470, Y, k === 0 ? pop(u, 0.5) : 1); el('rect', { x: -170, y: -46, width: 340, height: 92, rx: 12, fill: PANEL, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, bg);
      tx(-160, -54, 'self.block = nn.Sequential', { 'font-size': 14, 'font-weight': 700, fill: ACC, class: 'mono' }, bg);
      [['Linear', ACC], ['ReLU', WARN], ['Linear', ACC]].forEach(([s, col], i) => card(-110 + i * 110, 0, 90, 38, { rx: 8, text: s, fs: 14, stroke: col, p: bg }));
      card(130, Y, 56, 44, { rx: 22, text: 'x', fs: 18, mono: true, stroke: INFO, color: INFO, op: k === 0 ? fade(u, 1.0) : 1 });
      el('line', { x1: 158, y1: Y, x2: 300, y2: Y, stroke: MUT, 'stroke-width': 2.2, opacity: k === 0 ? fade(u, 1.0) : 1 });
      if (k === 0) { shapeTag(130, Y + 46, '(2,16)', fade(u, 1.2)); pill(470, 330, 'dim = 16 · params 544', ACC, pop(u, 1.6), { mono: true, fs: 14 });
        sub(470, 395, '안쪽은 직선 흐름 → Sequential 로 묶는다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      const PX = 740;
      if (k === 1) { el('line', { x1: 640, y1: Y, x2: 690, y2: Y, stroke: MUT, 'stroke-width': 2.2 }); dot([[158, Y], [640, Y], [690, Y]], seg(u, 0.2, 1.4), ACC, 8);
        vec(715, Y, 8, 1.3, { op: fade(u, 1.4) }); mono(715, Y - 62, 'out', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.4) });
        vec(130, 132, 8, 0.2, { stroke: INFO, op: fade(u, 0.6) }); mono(160, 112, 'x 는 그대로 남아 있다', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) });
        sub(470, 395, 'out = self.block(x)  — x 를 덮어쓰지 않는다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700, class: 'mono' }); return; }
      // k2 / k6: 덧셈
      el('line', { x1: 640, y1: Y, x2: PX - 20, y2: Y, stroke: MUT, 'stroke-width': 2.2 }); el('line', { x1: PX + 20, y1: Y, x2: 830, y2: Y, stroke: MUT, 'stroke-width': 2.2 });
      el('circle', { cx: PX, cy: Y, r: 20, fill: C.GOODBG, stroke: GOOD, 'stroke-width': 2.5 }); mono(PX, Y + 8, '+', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
      const g = k === 2 ? E(u, 0.2, 1.0) : 1;
      el('polyline', { points: `150,${Y - 22} 150,110 ${PX},110 ${PX},${Y - 20}`, fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': `${g * 900} 900` });
      card(860, Y, 60, 40, { rx: 20, text: 'relu', fs: 13.5, mono: true, stroke: INK });
      if (k === 2) { dot([[150, Y - 22], [150, 110], [PX, 110], [PX, Y - 20]], seg(u, 0.9, 2.0), INFO, 8); dot([[158, Y], [640, Y], [PX - 20, Y]], seg(u, 0.9, 2.0), ACC, 8);
        mono(440, 96, 'out = x + out', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
        sub(470, 395, '이 덧셈 한 줄이 잔차 연결 — Sequential 로는 못 쓴다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      // k6: 실행
      dot([[150, Y - 22], [150, 110], [PX, 110], [PX, Y - 20]], seg(u, 0.2, 1.3), INFO, 8); dot([[158, Y], [640, Y], [PX - 20, Y], [900, Y]], seg(u, 0.2, 1.6), ACC, 8);
      shapeTag(130, Y + 46, '(2,16)', 1); shapeTag(860, Y + 46, '(2,16)', fade(u, 1.6), GOOD);
      pill(470, 330, 'm(torch.randn(2, 16)).shape → [2, 16]', GOOD, pop(u, 1.8), { mono: true, fs: 14 });
      sub(470, 395, '더하려면 모양이 같아야 한다 — 잔차 연결은 shape 를 바꾸지 않는다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    // k3~5: Flexible
    zone(40, 40, 880, 330, 'class Flexible(nn.Module)', { stroke: INFO, fill: C.INFOBG });
    R.spans(70, 92, [['def forward(self, ', { fill: INK }], ['x', { fill: INFO, 'font-weight': 800 }], [', ', {}], ['use_relu=True', { fill: k === 5 ? WARN : MUT, 'font-weight': 700 }], [', ', {}], ['n_repeat=1', { fill: k === 4 ? ACC : MUT, 'font-weight': 700 }], ['):', {}]], { 'font-size': 17, opacity: k === 3 ? fade(u, 0.3) : 1 });
    const FX = 400, FY = 230;
    if (k === 3) { brick(FX, FY, 130, 'self.fc', ACC, { s: pop(u, 0.8), h: 52, fs: 16 }); pill(FX, FY + 56, 'Linear(dim, dim)', ACC, pop(u, 1.1), { mono: true, fs: 13.5 });
      [['x', INFO, 250], ['use_relu', WARN, 470], ['n_repeat', ACC, 640]].forEach(([s, col, x], i) => { const f = pop(u, 1.4 + i * 0.25); pill(x, 140, s, col, f, { mono: true, fs: 14 }); });
      sub(480, 395, '그냥 파이썬 함수 — 인자도 기본값도 마음대로 (Sequential 은 x 하나뿐)', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { brick(FX, FY, 130, 'self.fc', ACC, { h: 52, fs: 16 });
      el('path', { d: `M ${FX + 66} ${FY - 10} C ${FX + 160} ${FY - 110}, ${FX - 160} ${FY - 110}, ${FX - 66} ${FY - 10}`, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '7 5', 'marker-end': 'url(#ra-ahb)' });
      const n = Math.min(3, Math.floor(u / 0.7) + 1), ph = (u % 0.7) / 0.7;
      if (u < 2.1) { const a = Math.PI * (1 - ph); el('circle', { cx: FX + Math.cos(a) * 110, cy: FY - 70 - Math.sin(a) * 30, r: 8, fill: ACC }); }
      mono(FX, FY + 70, `n_repeat=3 · ${n}번째 통과`, { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      card(720, FY, 300, 84, { rx: 12, text: '같은 fc 를 반복 통과\n= 가중치 공유', fs: 15, stroke: WARN, s: pop(u, 1.6) });
      sub(480, 395, 'for _ in range(n_repeat): x = self.fc(x)', fade(u, 0.6), { 'font-size': 15, fill: INK, 'font-weight': 700, class: 'mono' }); return; }
    // k5: 분기
    const on = Math.floor(u / 1.0) % 2 === 0;
    card(160, FY, 56, 44, { rx: 22, text: 'x', fs: 18, mono: true, stroke: INFO, color: INFO }); brick(330, FY, 110, 'self.fc', ACC);
    el('line', { x1: 188, y1: FY, x2: 275, y2: FY, stroke: MUT, 'stroke-width': 2.2 });
    el('polyline', { points: `385,${FY} 460,${FY} 520,${FY - 60} 620,${FY - 60}`, fill: 'none', stroke: on ? WARN : GRID, 'stroke-width': on ? 3.5 : 2 });
    el('polyline', { points: `385,${FY} 460,${FY} 520,${FY + 60} 760,${FY + 60} 800,${FY}`, fill: 'none', stroke: on ? GRID : INK, 'stroke-width': on ? 2 : 3.5 });
    brick(660, FY - 60, 96, 'F.relu', WARN, { op: on ? 1 : 0.4 }); el('line', { x1: 708, y1: FY - 60, x2: 800, y2: FY, stroke: on ? WARN : GRID, 'stroke-width': on ? 3.5 : 2 });
    card(840, FY, 60, 40, { rx: 20, text: 'out', fs: 15, mono: true });
    pill(460, 120, on ? 'use_relu=True' : 'use_relu=False', on ? WARN : INK, 1, { mono: true, fs: 15 });
    dot(on ? [[188, FY], [460, FY], [520, FY - 60], [800, FY], [810, FY]] : [[188, FY], [460, FY], [520, FY + 60], [760, FY + 60], [810, FY]], (u % 1.0) / 1.0, ACC, 7);
    sub(480, 395, '실행할 때마다 경로가 달라져도 평범한 if 문이다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 3. 부품 등록 — __setattr__ 문지기와 list 함정
  // =========================================================
  function gate(x, y, verdict, op) { el('rect', { x: x - 60, y: y - 34, width: 120, height: 68, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: op });
    mono(x, y - 8, '__setattr__', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
    tx(x, y + 16, 'Module 인가?', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op });
    if (verdict) mono(x, y + 56, verdict, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: verdict === 'Module ✓' ? GOOD : BAD, opacity: op }); }
  const listBox = (x, y, op, col) => { el('rect', { x, y, width: 220, height: 56, rx: 10, fill: PANEL, stroke: col || WARN, 'stroke-width': 2, opacity: op });
    mono(x + 10, y + 34, '[', { 'font-size': 20, fill: col || WARN, opacity: op }); mono(x + 208, y + 34, ']', { 'font-size': 20, fill: col || WARN, opacity: op, 'text-anchor': 'end' });
    [0, 1, 2].forEach((i) => card(x + 50 + i * 60, y + 28, 50, 34, { rx: 6, text: 'L' + i, fs: 13.5, mono: true, stroke: ACC, op })); };
  function s3(t, c) { const { k, u } = c;
    const fixed = k >= 3;
    tx(30, 40, fixed ? 'class Fixed(nn.Module)' : 'class Broken(nn.Module)', { 'font-size': 16, 'font-weight': 800, fill: fixed ? GOOD : BAD, class: 'mono' });
    if (k === 0 || k === 3) { const f = E(u, 0.3, 1.2);
      mono(30, 76, fixed ? 'self.layers = nn.ModuleList([...])' : 'self.layers = [nn.Linear(8, 8) for _ in range(3)]', { 'font-size': 15, fill: INK, opacity: fade(u, 0.1) });
      if (fixed) { el('rect', { x: lerp(60, 330, f) - 6, y: 150 - 6, width: 232, height: 68, rx: 12, fill: 'none', stroke: GOOD, 'stroke-width': 2.5 }); }
      listBox(lerp(60, 330, f), 150, 1, fixed ? GOOD : WARN);
      gate(480, 290, u > 1.2 ? (fixed ? 'Module ✓' : 'list ✗') : null, 1);
      grow(440, 215, 470, 250, E(u, 1.0, 1.3), MUT);
      drawer(660, 120, 270, fixed ? [['layers', 'ModuleList(3)', E(u, 1.6, 2.1)]] : [], { title: 'model._modules' });
      if (!fixed) { el('rect', { x: 660, y: 280, width: 270, height: 60, rx: 10, fill: SOFT, stroke: GRID, 'stroke-dasharray': '4 4', opacity: fade(u, 1.6) });
        mono(675, 316, '그냥 속성 (등록 안 됨)', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) }); grow(540, 300, 655, 310, E(u, 1.5, 1.9), BAD); }
      else grow(540, 270, 655, 160, E(u, 1.5, 1.9), GOOD);
      sub(330, 395, fixed ? '담기는 순간 등록이 보장된다 (이름표가 필요하면 ModuleDict)' : '에러 없이 대입됐지만 문지기를 지나지 않았다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1 || k === 4) { mono(30, 76, 'for layer in self.layers: x = layer(x)', { 'font-size': 15, fill: INK });
      const xs = [120, 300, 470, 640, 820];
      card(xs[0], 200, 60, 44, { rx: 22, text: 'x', fs: 18, mono: true, stroke: INFO, color: INFO });
      [1, 2, 3].forEach((i) => { grow(xs[i - 1] + 34, 200, xs[i] - 44, 200, E(u, 0.2 + i * 0.3, 0.5 + i * 0.3), MUT); card(xs[i], 200, 80, 48, { rx: 8, text: 'L' + (i - 1), fs: 15, mono: true, stroke: ACC }); });
      grow(xs[3] + 44, 200, xs[4] - 34, 200, E(u, 1.3, 1.6), ACC); card(xs[4], 200, 64, 44, { rx: 22, text: 'out', fs: 15, mono: true, s: pop(u, 1.5) });
      dot(xs.map((x) => [x, 200]), seg(u, 0.3, 1.8), ACC, 8);
      shapeTag(xs[0], 250, '(2,8)', 1); shapeTag(xs[4], 250, '(2,8)', fade(u, 1.7), GOOD); if (u > 1.9) check(xs[4], 140, 13, pop(u, 1.9));
      sub(480, 340, k === 1 ? '값은 멀쩡히 나온다 — 그래서 눈치채기 어렵다' : '순회 코드는 한 글자도 안 바뀐다', fade(u, 2.0), { 'font-size': 16, fill: k === 1 ? BAD : GOOD, 'font-weight': 700 }); return; }
    // k2 / k5: parameters()
    const n = k === 2 ? 0 : 6;
    mono(30, 76, `len(list(${fixed ? 'fixed' : 'broken'}.parameters()))`, { 'font-size': 15, fill: INK });
    mono(160, 200, String(n), { 'font-size': 96, 'font-weight': 800, 'text-anchor': 'middle', fill: n ? GOOD : BAD, opacity: fade(u, 0.3) });
    if (n) { ['layers.0.weight', 'layers.0.bias', 'layers.1.weight', 'layers.1.bias', 'layers.2.weight', 'layers.2.bias'].forEach((s, i) => {
        mono(320, 112 + i * 26, s, { 'font-size': 14, fill: ACC, opacity: fade(u, 0.5 + i * 0.15) }); mono(520, 112 + i * 26, i % 2 ? '(8,)' : '(8, 8)', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.15) }); });
      pill(420, 290, '3층 × (weight + bias) = 6 · 216개 값', GOOD, pop(u, 1.6), { fs: 14 }); }
    else { card(320, 150, 200, 56, { rx: 10, text: 'optimizer 에 넘길 것 없음', fs: 14, stroke: BAD, color: BAD, s: pop(u, 0.9) }); }
    // CPU→GPU 길
    const LX = 600, gy = [140, 260]; tx(LX, 100, 'model.to("cuda")', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: MUT });
    [['CPU', gy[0]], ['GPU', gy[1]]].forEach(([s, y]) => { el('rect', { x: LX, y: y - 34, width: 320, height: 68, rx: 10, fill: SOFT, stroke: GRID }); tx(LX + 12, y + 5, s, { 'font-size': 15, 'font-weight': 800, fill: MUT }); });
    const mv = E(u, 1.0, 2.0);
    card(LX + 120, lerp(gy[0], gy[1], mv), 76, 40, { rx: 8, text: 'model', fs: 14, mono: true, stroke: INFO });
    [0, 1, 2].forEach((i) => card(LX + 200 + i * 40, lerp(gy[0], n ? gy[1] : gy[0], mv), 34, 30, { rx: 6, text: 'L' + i, fs: 13.5, mono: true, stroke: n ? ACC : BAD }));
    if (!n && u > 2.0) sub(LX + 160, 340, '층들은 CPU 에 남는다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
    if (n && u > 2.0) sub(LX + 160, 340, '파라미터가 함께 따라간다', fade(u, 2.0), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
    sub(300, 395, n ? '학습·device 이동 정상' : '학습이 조용히 안 된다 — 에러도 없다', fade(u, 2.3), { 'font-size': 15, fill: n ? GOOD : BAD, 'font-weight': 700 }); }

  // =========================================================
  // 4. 모듈 합성 — BasicBlock 을 쌓아 트리
  // =========================================================
  function block(cx, cy, s, o) { o = o || {}; if (s <= 0) return; const g = R.G(cx, cy, s);
    el('rect', { x: -86, y: -46, width: 172, height: 92, rx: 12, fill: o.hot ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 2.2 }, g);
    mono(-76, -54, o.name || 'BasicBlock', { 'font-size': 14, 'font-weight': 700, fill: ACC }, g);
    card(-40, -12, 66, 30, { rx: 6, text: 'conv1', fs: 13.5, mono: true, stroke: INK, p: g }); card(40, -12, 66, 30, { rx: 6, text: 'conv2', fs: 13.5, mono: true, stroke: INK, p: g });
    if (o.skip) { el('path', { d: 'M -78 22 Q 0 46 78 22', fill: 'none', stroke: GOOD, 'stroke-width': 2.5 }, g); mono(0, 32, '+x', { 'font-size': 13.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }, g); } }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { block(260, 190, k === 0 ? pop(u, 0.2) : 1, { skip: k === 1 && u > 1.0 });
      if (k === 0) { pill(260, 290, 'Conv2d(16,16,3) × 2 · params 4,640', ACC, pop(u, 1.0), { mono: true, fs: 14 });
        card(680, 190, 360, 96, { rx: 12, text: '여러 번 나올 구조는\n작은 Module 로 한 번만 정의', fs: 16, stroke: INFO, s: pop(u, 1.6) }); return; }
      const xs = [500, 610, 720, 830], Y = 190;
      card(xs[0] - 30, Y, 50, 40, { rx: 20, text: 'x', fs: 17, mono: true, stroke: INFO, color: INFO });
      [['conv1', 1], ['relu', 2], ['conv2', 3]].forEach(([s, i]) => { grow(xs[i - 1] + (i === 1 ? -5 : 40), Y, xs[i] - 40, Y, E(u, 0.2 + i * 0.25, 0.5 + i * 0.25), MUT); card(xs[i] - 0, Y, 76, 36, { rx: 8, text: s, fs: 13.5, mono: true, stroke: i === 2 ? WARN : ACC, s: pop(u, 0.3 + i * 0.25) }); });
      el('polyline', { points: `${xs[0] - 30},${Y - 20} ${xs[0] - 30},${Y - 80} ${xs[3] + 50},${Y - 80} ${xs[3] + 50},${Y - 40}`, fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': `${E(u, 1.2, 2.0) * 900} 900` });
      mono(700, Y - 92, 'relu(x + out)', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      sub(480, 360, '블록 하나가 이미 완결된 잔차 구조다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k <= 4) { // TinyResNet 조립
      zone(30, 40, 900, 270, 'class TinyResNet(nn.Module)', { stroke: INFO, fill: C.INFOBG });
      card(130, 175, 120, 56, { rx: 10, text: 'stem', fs: 15, mono: true, stroke: INK, s: k === 2 ? pop(u, 0.4) : 1 });
      if (k === 2) { pill(130, 245, 'Conv2d(3,16) · 448', INK, pop(u, 1.0), { mono: true, fs: 13.5 }); sub(560, 175, '입력 3채널을 블록이 쓰는 16채널로 맞춘다', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      el('rect', { x: 230, y: 92, width: 680, height: 168, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: k === 3 ? fade(u, 0.2) : 1 });
      mono(244, 84, 'self.blocks = nn.ModuleList', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 3 ? fade(u, 0.2) : 1 });
      [0, 1, 2].forEach((i) => block(340 + i * 222, 175, k === 3 ? pop(u, 0.5 + i * 0.4) : 1, { name: `blocks[${i}]`, skip: true, hot: k === 4 && Math.floor(u * 1.3) - 1 === i }));
      if (k === 3) { pill(560, 340, 'n_blocks=3 → 블록 3개 등록', ACC, pop(u, 1.9), { fs: 14 }); return; }
      dot([[60, 175], [130, 175], [340, 175], [562, 175], [784, 175], [920, 175]], seg(u, 0.3, 2.4), INFO, 8);
      shapeTag(130, 350, '(2,3,32,32)', fade(u, 0.3)); shapeTag(450, 350, '→ (2,16,32,32)', fade(u, 1.0)); shapeTag(780, 350, '블록마다 (2,16,32,32) 그대로', fade(u, 1.8), GOOD);
      return; }
    if (k === 5) { terminal(30, 30, 560, 360, ['>>> print(net)', 'TinyResNet(', '  (stem): Conv2d(3, 16, kernel_size=(3, 3), ...)', '  (blocks): ModuleList(', '    (0-2): 3 x BasicBlock(', '      (conv1): Conv2d(16, 16, kernel_size=(3, 3), ...)', '      (conv2): Conv2d(16, 16, kernel_size=(3, 3), ...)', '    )', '  )', ')'], lerp(0, 10, E(u, 0.2, 2.0)), { fs: 13.5 });
      tx(620, 120, '들여쓰기 = 객체 계층', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(620, 160, '부품 → 블록 → 전체', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) });
      pill(760, 240, 'params 14,368', ACC, pop(u, 2.2), { mono: true, fs: 15 }); return; }
    // k6: 트리 순회
    const root = [480, 70], L1 = [[260, 170, 'stem'], [700, 170, 'blocks']], L2 = [[540, 270], [700, 270], [860, 270]];
    const order = [root, ...L1, ...L2]; const hit = Math.floor(E(u, 0.8, 2.4) * 12);
    L1.forEach(([x, y]) => el('line', { x1: root[0], y1: root[1] + 20, x2: x, y2: y - 20, stroke: GRID, 'stroke-width': 2 }));
    L2.forEach(([x, y]) => { el('line', { x1: 700, y1: 190, x2: x, y2: y - 20, stroke: GRID, 'stroke-width': 2 }); [-36, 36].forEach((d) => el('line', { x1: x, y1: y + 18, x2: x + d, y2: y + 62, stroke: GRID, 'stroke-width': 1.5 })); });
    card(root[0], root[1], 140, 40, { rx: 8, text: 'TinyResNet', fs: 14, mono: true, stroke: INFO, fill: hit >= 1 ? C.INFOBG : PANEL });
    L1.forEach(([x, y, s], i) => card(x, y, 110, 38, { rx: 8, text: s, fs: 14, mono: true, stroke: u < 0.8 ? GOOD : INK, sw: u < 0.8 ? 3 : 2, fill: hit >= 2 + i * 1 ? C.INFOBG : PANEL }));
    L2.forEach(([x, y], i) => { card(x, y, 100, 36, { rx: 8, text: 'Block' + i, fs: 13.5, mono: true, stroke: ACC, fill: hit >= 4 + i * 3 ? C.INFOBG : PANEL });
      [-36, 36].forEach((d, j) => card(x + d, y + 78, 64, 30, { rx: 6, text: 'conv' + (j + 1), fs: 13.5, mono: true, stroke: GRID, fill: hit >= 5 + i * 3 + j ? C.INFOBG : PANEL })); });
    tx(40, 150, 'children()', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: GOOD }); mono(40, 180, '→ 2개 (바로 아래만)', { 'font-size': 14, fill: GOOD });
    tx(40, 240, 'modules()', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: INFO, opacity: fade(u, 0.8) }); mono(40, 270, `→ ${Math.max(0, hit)}개`, { 'font-size': 14, fill: INFO, opacity: fade(u, 0.8) });
    sub(480, 405, 'apply(fn) 은 이 12개 모듈에 fn 을 재귀로 적용한다 (예: 가중치 초기화)', fade(u, 2.3), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 5. 실무 스타일 — 상태와 로직, model(x)
  // =========================================================
  function convNet(op, o) { o = o || {};
    zone(30, 40, 560, 250, 'class ConvNet(nn.Module)', { stroke: INFO, fill: C.INFOBG, op });
    tx(50, 90, '__init__ = 상태', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: o.init ?? op });
    const g = R.G(250, 154, o.seq ?? 1); el('rect', { x: -190, y: -30, width: 380, height: 60, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, g);
    [['Conv2d(3,16)', ACC, -110, 120], ['ReLU', WARN, 0, 64], ['MaxPool2d(2)', INFO, 110, 120]].forEach(([s, col, x, w]) => card(x, 0, w, 34, { rx: 6, text: s, fs: 13.5, mono: true, stroke: col, p: g }));
    if ((o.head ?? 1) > 0) brick(510, 154, 130, 'self.head', ACC, { s: o.head ?? 1 });
    tx(50, 222, 'forward = 로직', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: o.fwd ?? 0 }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { convNet(fade(u, 0.1), { seq: pop(u, 0.6), head: 0, init: fade(u, 0.3) });
      mono(70, 106, 'self.features = nn.Sequential(...)', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.0) });
      card(780, 140, 300, 110, { rx: 12, text: '전체 뼈대 = Module\n직선 구간 = Sequential', fs: 16, stroke: GOOD, s: pop(u, 1.5) });
      sub(310, 340, 'Sequential in Module — 표준 하이브리드', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { convNet(1, { head: pop(u, 0.3) }); pill(510, 204, 'Linear(16·16·16, 10)', ACC, pop(u, 0.7), { mono: true, fs: 13.5 });
      // 안티패턴: forward 안에서 새 Linear
      zone(620, 40, 320, 250, '✗ forward 안에서 생성', { stroke: BAD, fill: C.BADBG });
      mono(640, 90, 'def forward(self, x):', { 'font-size': 13.5, fill: INK }); mono(656, 114, 'fc = nn.Linear(...)', { 'font-size': 13.5, fill: BAD, 'font-weight': 700 });
      const call = Math.min(3, Math.floor(E(u, 0.6, 2.4) * 3) + (u > 0.6 ? 1 : 0));
      for (let i = 0; i < call; i++) { card(680 + i * 82, 180, 70, 40, { rx: 8, text: `새 W${i + 1}`, fs: 13.5, stroke: BAD, color: BAD }); mono(680 + i * 82, 222, `호출 ${i + 1}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
      sub(780, 262, '매번 새 가중치 → 학습 안 됨', fade(u, 2.2), { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      sub(310, 340, '층·파라미터·설정은 __init__ 에서 한 번만 만든다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { convNet(1, { fwd: fade(u, 0.2) }); const Y = 260, xs = [80, 250, 400, 510];
      [['x', INFO], ['features', ACC], ['flatten', MUT], ['head', ACC]].forEach(([s, col], i) => { const sc = pop(u, 0.3 + i * 0.35); card(xs[i], Y, i ? 96 : 44, 32, { rx: 8, text: s, fs: 13.5, mono: true, stroke: col, s: sc }); if (i) grow(xs[i - 1] + (i === 1 ? 24 : 50), Y, xs[i] - 50, Y, E(u, 0.3 + i * 0.35, 0.6 + i * 0.35), MUT); });
      dot(xs.map((x) => [x, Y]), seg(u, 1.4, 2.4), ACC, 7);
      [['(2,3,32,32)', 720, 90], ['(2,16,16,16)', 720, 140], ['(2,4096)', 720, 190], ['(2,10)', 720, 240]].forEach(([s, x, y], i) => shapeTag(x + 60, y, s, fade(u, 0.5 + i * 0.4), i === 3 ? GOOD : INFO));
      sub(780, 300, 'params 41,418', fade(u, 2.0), { 'font-size': 15, class: 'mono', fill: ACC, 'font-weight': 700 });
      sub(310, 340, '이미 선언된 부품을 쓰기만 한다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k3 / k4: model(x) vs model.forward(x)
    const direct = k === 4, cx = 330, cy = 200;
    pill(cx, 56, direct ? 'model.forward(x)' : 'model(x)', direct ? BAD : GOOD, 1, { mono: true, fs: 17 });
    el('rect', { x: cx - 230, y: 90, width: 460, height: 230, rx: 16, fill: direct ? SOFT : C.GOODBG, stroke: direct ? OFF : GOOD, 'stroke-width': 2.5, 'stroke-dasharray': direct ? '6 5' : null });
    mono(cx - 216, 114, '__call__', { 'font-size': 15, 'font-weight': 700, fill: direct ? OFF : GOOD });
    card(cx, 150, 260, 36, { rx: 8, text: 'forward pre-hook', fs: 14, mono: true, stroke: direct ? OFF : WARN, color: direct ? OFF : INK });
    card(cx, 205, 200, 44, { rx: 10, text: 'forward', fs: 16, mono: true, stroke: ACC, fill: ACCBG });
    card(cx, 262, 260, 36, { rx: 8, text: 'forward hook', fs: 14, mono: true, stroke: direct ? OFF : WARN, color: direct ? OFF : INK });
    dot(direct ? [[cx, 40], [cx, 182], [cx, 228], [cx, 360]] : [[cx, 40], [cx, 132], [cx, 182], [cx, 228], [cx, 244], [cx, 360]], seg(u, 0.3, 1.8), direct ? BAD : GOOD, 8);
    if (direct && u > 1.0) { cross(cx + 160, 150, 11, pop(u, 1.0)); cross(cx + 160, 262, 11, pop(u, 1.2)); }
    tx(640, 130, '등록한 hook 호출 횟수', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    mono(760, 210, direct ? '0' : '1', { 'font-size': 64, 'font-weight': 800, 'text-anchor': 'middle', fill: direct ? BAD : GOOD, opacity: fade(u, 1.6) });
    sub(760, 260, '실제로 돌려 센 값', fade(u, 1.8), { 'font-size': 14 });
    sub(480, 395, direct ? '에러 없이 hook 만 건너뛴다 — 조용한 버그' : 'out.shape → torch.Size([2, 10]), hook 까지 실행', fade(u, 2.2), { 'font-size': 15, fill: direct ? BAD : GOOD, 'font-weight': 700 }); }

  // ---------- 확인 문제 ----------
  const quiz = [
    { q: 'nn.Module을 상속한 __init__에서 super().__init__()를 빼고 self.fc1 = nn.Linear(...)를 쓰면 어떻게 되는가?',
      o: ['cannot assign module before Module.__init__() call 에러가 난다', '조용히 넘어가고 파라미터만 0 개가 된다', 'forward가 자동으로 만들어진다'], a: 0,
      why: 'super().__init__()가 부품을 담을 _modules 저장소를 만든다. 저장소가 없으니 대입하는 순간 AttributeError가 난다.' },
    { q: 'ResidualMLP의 forward에서 out = x + out이 가능한 이유는 무엇인가?',
      o: ['nn.Sequential이 덧셈 층을 지원해서', 'forward가 파이썬 함수라 x를 변수에 남겨 두었다가 더할 수 있어서', 'Linear가 입력을 자동 저장해서'], a: 1,
      why: 'out = self.block(x)가 x를 덮어쓰지 않으니 나중에 더할 수 있다. Sequential은 이전 층 출력만 넘겨 이게 안 된다.' },
    { q: 'self.layers = [nn.Linear(8, 8) for _ in range(3)]로 담은 모델에서 일어나는 일은 무엇인가?',
      o: ['forward에서 바로 에러가 난다', 'parameters()가 6 개를 돌려준다', 'forward는 돌지만 parameters()가 0 개라 학습이 안 된다'], a: 2,
      why: '파이썬 list는 __setattr__ 등록을 거치지 않는다. 값은 나오지만 옵티마이저에 넘길 파라미터가 없고, ModuleList로 바꾸면 6 개가 잡힌다.' },
    { q: 'TinyResNet(ch=16, n_blocks=3)에서 children()이 돌려주는 모듈 수는 몇인가?',
      o: ['2 개 (stem, blocks)', '12 개 (트리 전체)', '6 개 (conv 전부)'], a: 0,
      why: 'children()은 바로 아래 자식만 준다. 트리 전체 12 개를 도는 것은 modules()다.' },
    { q: 'model.forward(x)로 직접 부르면 model(x)와 무엇이 달라지는가?',
      o: ['출력 shape가 바뀐다', '등록한 hook이 실행되지 않는다', '파라미터가 새로 만들어진다'], a: 1,
      why: 'model(x)는 __call__이 forward 앞뒤로 hook을 부른다. 실제로 돌려 보면 hook 호출이 model(x)는 1번, forward 직접 호출은 0번이다.' },
  ];

  const summary = [
    'nn.Module은 __init__에 부품을 선언하고 forward에 흐름을 쓰는 두 메서드로 끝난다.',
    'forward는 파이썬 함수라 잔차 덧셈, 루프, 조건 분기, 여러 인자를 그대로 쓴다.',
    '층을 파이썬 list에 담으면 parameters()가 0 개라서 ModuleList나 ModuleDict로 담는다.',
    '블록을 작은 Module로 만들어 쌓고, 호출은 hook까지 도는 model(x)로 한다.',
  ];
  const review = [
    { q: '층 개수를 인자로 받아 for 문으로 만든 모델이 학습을 돌려도 손실이 전혀 안 줄어든다. 먼저 볼 곳은?',
      o: ['층을 list에 담았는지, len(list(model.parameters()))가 0 인지', '학습률을 10배 키우기', 'forward의 return 위치'], a: 0,
      why: 'list에 담긴 층은 등록되지 않아 옵티마이저가 받은 파라미터가 없다. ModuleList로 바꾸면 parameters()에 잡힌다.' },
    { q: 'BasicBlock 3개를 쌓은 모델에 가중치 초기화 함수를 한 번에 적용하려 한다. 알맞은 방법은?',
      o: ['children()을 돌며 직접 호출한다', 'model.apply(fn)을 부른다', 'forward 안에서 초기화한다'], a: 1,
      why: 'children()은 stem과 blocks 두 개만 준다. apply(fn)은 modules()처럼 트리 전체 12 개 모듈에 재귀로 적용한다.' },
    { q: '디버깅용 forward hook을 달았는데 로그가 하나도 안 찍힌다. 코드에서 먼저 찾을 것은?',
      o: ['super().__init__() 누락', 'ModuleDict 사용', 'model.forward(x)로 직접 부른 곳'], a: 2,
      why: 'hook은 model(x)의 __call__이 부른다. forward를 직접 부르면 에러 없이 hook만 건너뛴다.' },
  ];

  R.page({ title: 'nn.Module 해부', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
