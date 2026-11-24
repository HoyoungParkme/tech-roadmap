/* V-1-1 추론 모드 — eval·no_grad·half — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   숫자 출처: 장면 1·2·3 은 venv torch 2.15(CPU)에서 코드 블록을 다시 돌린 값(장면 1 seed 3, 장면 3 seed 0).
   장면 2 의 메모리·속도 막대와 장면 4 의 처리량 곡선은 페이지의 예시 값이다(GPU 측정 아님). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tween, card, mono, sub, pill, banner, grow, dot, fly, cells, zone, check, cross, axes, hbar, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const f3 = (v) => (v < 0 ? '-' : '') + Math.abs(v).toFixed(3);

  // =========================================================
  // 1. train / eval 스위치 — Dropout 이 매번 다른 뉴런을 끈다
  // =========================================================
  const X = [-0.432, -1.861, 0.089, 0.024];
  const RELU = [0.557, 0.412, 0, 0.048, 0, 0, 0.469, 0.876];
  const DROP = [[6, 7], [6]];                        // 1회차·2회차에 꺼진 활성 뉴런 (seed 3 실행)
  const OUTS = [[-0.126, 0.495], [-0.275, 0.65], [-0.314, 0.578], [-0.314, 0.578]];
  const N = { ix: 80, hx: 330, ox: 520 };
  const iy = (i) => 135 + i * 52, hy = (j) => 78 + j * 38, oy = (j) => 185 + j * 70;
  function modeSwitch(cx, cy, f) { const w = 220, h = 40;
    el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 20, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    const kx = lerp(cx - w / 4, cx + w / 4, f);
    el('rect', { x: kx - w / 4 + 4, y: cy - h / 2 + 4, width: w / 2 - 8, height: h - 8, rx: 16, fill: f > 0.5 ? GOOD : BAD });
    mono(cx - w / 4, cy + 5, 'train()', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: f <= 0.5 ? PANEL : MUT });
    mono(cx + w / 4, cy + 5, 'eval()', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: f > 0.5 ? PANEL : MUT }); }
  // o: { g (선 자람), x (입력 보임), vals (은닉 값 보임), drop (꺼진 뉴런 배열|null), dropS (꺼짐 표시 크기), out (출력 값|null), evalOn }
  function net(o) {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 8; j++) { const g = o.g ?? 1; if (g > 0) el('line', { x1: N.ix + 38, y1: iy(i), x2: lerp(N.ix + 38, N.hx - 32, g), y2: lerp(iy(i), hy(j), g), stroke: GRID, 'stroke-width': 1.2 }); }
    for (let j = 0; j < 8; j++) for (let k = 0; k < 2; k++) { const g = clamp(((o.g ?? 1) - 0.4) / 0.6); if (g > 0) el('line', { x1: N.hx + 32, y1: hy(j), x2: lerp(N.hx + 32, N.ox - 40, g), y2: lerp(hy(j), oy(k), g), stroke: GRID, 'stroke-width': 1.2 }); }
    X.forEach((v, i) => card(N.ix, iy(i), 76, 34, { rx: 6, text: o.x ? f3(v) : '', mono: true, fs: 14.5, stroke: o.x ? INFO : GRID, fill: o.x ? INFOBG : PANEL, s: o.xs ? o.xs(i) : 1 }));
    RELU.forEach((v, j) => { const dead = v === 0, dr = o.drop && o.drop.includes(j);
      const show = o.vals && !dead, val = !o.vals ? '' : dead ? '0' : dr ? '0' : o.evalOn ? f3(v) : f3(v * 2);
      card(N.hx, hy(j), 64, 28, { rx: 6, text: val, mono: true, fs: 13.5, stroke: dr ? BAD : dead ? GRID : show ? ACC : INK, color: dr ? BAD : dead ? OFF : !o.evalOn && show ? ACC : INK, fill: dr ? BADBG : PANEL, dash: dr ? '4 3' : null, sw: 1.8 });
      if (dr && o.dropS > 0) cross(N.hx + 40, hy(j), 7, o.dropS); });
    [0, 1].forEach((k) => card(N.ox, oy(k), 80, 36, { rx: 8, text: o.out ? f3(o.out[k]) : '', mono: true, fs: 15, stroke: o.out ? ACC : GRID, color: ACC, fw: 700 }));
    mono(N.ix, 105, 'x (1, 4)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO });
    tx(N.hx, 46, 'ReLU(Linear(4, 8))', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, class: 'mono' });
    mono(N.ox, 150, 'Linear(8, 2)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
    const dOff = o.evalOn;
    tx(N.hx, 385, 'Dropout(0.5)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, class: 'mono', fill: dOff ? OFF : BAD, 'text-decoration': dOff ? 'line-through' : null });
    sub(N.hx, 406, dOff ? '꺼짐 — 8칸 모두 그대로 쓴다' : '켜짐 — 살아남은 값은 ×2', 1, { fill: dOff ? MUT : BAD }); }
  // 오른쪽 기록판
  function outRow(y, name, v, s, col) { if (s <= 0) return;
    mono(632, y + 5, name, { 'font-size': 15, 'font-weight': 700, opacity: s, fill: col || INK });
    cells(700, y - 17, v.map(f3), { w: 86, h: 34, fs: 14.5, style: () => ({ op: s, stroke: col || INK, color: col || INK }) }); }
  function s1(t, c) { const { k, u } = c;
    const f = k < 4 ? 0 : k === 4 ? E(u, 0.3, 1.0) : 1;
    modeSwitch(775, 40, f);
    if (k === 0) { net({ g: E(u, 0.2, 1.6) });
      pill(775, 110, '기본 모드 = train', BAD, pop(u, 1.6), { fs: 15 });
      sub(775, 160, 'model.training → True', fade(u, 2.0), { class: 'mono', 'font-size': 15, fill: INK }); return; }
    if (k === 1) { net({ x: true, xs: (i) => pop(u, 0.3 + i * 0.25) });
      pill(775, 110, 'x 는 고정 — 같은 입력을 반복', INFO, pop(u, 1.4), { fs: 14.5 });
      sub(775, 160, '흔들리면 원인은 입력이 아니라 모델이다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    zone(612, 72, 336, 300, '같은 x 를 넣은 기록', { fill: SOFT });
    if (k === 2) { const p = u >= 1.45 ? 1 : 0, a = 0.2 + p * 1.25;
      net({ x: true, vals: u > a + 0.4, drop: u > a + 0.55 ? DROP[p] : null, dropS: pop(u, a + 0.55, 0.4), out: u > a + 0.95 ? OUTS[p] : null });
      for (let i = 0; i < 4; i++) [0, 1].forEach((d) => dot([[N.ix + 38, iy(i)], [N.hx - 32, hy(i * 2 + d)]], seg(u, a, a + 0.4), ACC, 4));
      [0, 1, 3, 6, 7].filter((j) => !DROP[p].includes(j)).forEach((j) => [0, 1].forEach((q) => dot([[N.hx + 32, hy(j)], [N.ox - 40, oy(q)]], seg(u, a + 0.6, a + 0.95), ACC, 4)));
      outRow(115, 'out1', OUTS[0], fade(u, 1.15), BAD); outRow(160, 'out2', OUTS[1], fade(u, 2.4), BAD); return; }
    if (k === 3) { net({ x: true, vals: true, drop: DROP[1], dropS: 1, out: OUTS[1] });
      outRow(115, 'out1', OUTS[0], 1, BAD); outRow(160, 'out2', OUTS[1], 1, BAD);
      cross(650, 212, 10, pop(u, 0.3)); mono(672, 218, 'allclose → False', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4) });
      tx(632, 262, '꺼진 뉴런 (·= ReLU 가 이미 0)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9) });
      const m = (p) => RELU.map((v, j) => (v === 0 ? '·' : DROP[p].includes(j) ? '0' : '1'));
      [0, 1].forEach((p) => { const y = 276 + p * 44; mono(632, y + 22, p ? '2회차' : '1회차', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0 + p * 0.4) });
        cells(690, y, m(p), { w: 28, h: 30, gap: 3, fs: 14, style: (j, v) => ({ op: fade(u, 1.0 + p * 0.4), stroke: j === 7 ? BAD : v === '0' ? BAD : GRID, sw: j === 7 ? 3 : 1.5, color: v === '0' ? BAD : INK }) }); });
      return; }
    // k4~6: eval
    net({ x: true, vals: true, evalOn: true, out: k >= 5 ? OUTS[2] : null });
    const dim = k === 6 ? 0 : 0.35;
    if (k <= 5) { outRow(115, 'out1', OUTS[0], dim, BAD); outRow(160, 'out2', OUTS[1], dim, BAD); }
    if (k === 4) { card(775, 270, 300, 64, { rx: 10, text: 'BatchNorm 이 있으면\n배치 통계 → running_mean·var', fs: 14.5, stroke: INFO, color: INK, s: pop(u, 1.2) });
      sub(775, 330, '가중치는 그대로 — 레이어 동작만 바뀐다', fade(u, 1.9), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 5) { for (let i = 0; i < 4; i++) dot([[N.ix + 38, iy(i)], [N.hx - 32, hy(i * 2)], [N.ox - 40, oy(i % 2)]], seg(u, 0.2, 1.0), GOOD, 4);
      outRow(250, 'out3', OUTS[2], fade(u, 0.9), GOOD); outRow(295, 'out4', OUTS[3], fade(u, 1.5), GOOD);
      check(650, 345, 11, pop(u, 1.9)); mono(672, 351, 'allclose → True', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    // k6: 실무 관용구
    const L = [['load_state_dict(…)', INK, '가중치 읽기'], ['model.eval()', GOOD, '바로 다음 줄'], ['같은 x → 같은 답', ACC, '서빙'], ['model.train()', BAD, '재학습 때만']];
    L.forEach(([s, col, note], i) => { const y = 126 + i * 64, a = 0.2 + i * 0.45;
      if (i) grow(740, y - 44, 740, y - 22, E(u, a - 0.15, a), MUT);
      card(740, y, 210, 40, { rx: 8, text: s, mono: true, fs: 14.5, stroke: col, color: col, s: pop(u, a) });
      tx(856, y + 5, note, { 'font-size': 13.5, fill: MUT, opacity: fade(u, a + 0.2) }); }); }

  // =========================================================
  // 2. 그래프 기록 끊기 — grad_fn 사슬과 붙잡힌 텐서
  // =========================================================
  const OPS = [['Linear(4,8)', 'Addmm\nBackward0'], ['ReLU', 'Relu\nBackward0'], ['Linear(8,2)', 'Addmm\nBackward0']];
  const OX = [230, 380, 530], FY = 300, GY = 170;
  const SAVED = [[0, '(32,4) 512 B'], [1, '(32,8) 1,024 B'], [2, '(32,8) 1,024 B'], [2, '(8,2) 64 B']];
  const GAUGE = [['기본 (기록 ON)', 100, 100, BAD], ['no_grad()', 55, 130, WARN], ['inference_mode()', 48, 145, GOOD]];
  function tensorBlock(x, y, cols, rows, cs, u, col, label) { const n = cols * rows, shown = Math.floor(n * clamp(u));
    for (let i = 0; i < shown; i++) { const r = Math.floor(i / cols), c = i % cols; el('rect', { x: x + c * cs, y: y + r * cs, width: cs - 1, height: cs - 1, fill: col, opacity: 0.75 }); }
    el('rect', { x: x - 2, y: y - 2, width: cols * cs + 3, height: rows * cs + 3, fill: 'none', stroke: col, 'stroke-width': 1.5 });
    if (label) mono(x + cols * cs / 2, y - 10, label, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col }); }
  function fwd(o) { o = o || {};
    tensorBlock(48, 228, 4, 32, 4.5, o.xu ?? 1, INFO, 'x (32, 4)');
    OPS.forEach(([op], i) => { card(OX[i], FY, 116, 44, { rx: 8, text: op, mono: true, fs: 14.5, stroke: INK });
      grow(i ? OX[i - 1] + 58 : 72, FY, OX[i] - 60, FY, o.g ?? 1, MUT); });
    grow(OX[2] + 58, FY, 628, FY, o.g ?? 1, MUT);
    tensorBlock(632, 228, 2, 32, 4.5, o.ou ?? 0, ACC, 'out'); }
  function gauges(n, u0, k) { tx(712, 70, '메모리 · 속도 (예시 값)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    GAUGE.slice(0, n).forEach(([name, mem, sp, col], i) => { const y = 100 + i * 92, a = i === n - 1 ? u0 : 1;
      mono(712, y, name, { 'font-size': 14.5, 'font-weight': 700, fill: col });
      hbar(712, y + 12, 120, mem, 150, { h: 14, col, u: a, text: `메모리 ${mem}%` });
      hbar(712, y + 40, 120, sp, 150, { h: 14, col: INFO, u: a, text: `속도 ${sp}%` }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { fwd({ xu: E(u, 0.3, 1.6), g: E(u, 0.2, 1.2) });
      pill(300, 90, 'model.eval() ✓ 켜 둔 상태', GOOD, pop(u, 0.2), { fs: 15 });
      sub(330, 135, '레이어 스위치는 넘겼다 — 기록은 아직 그대로다', fade(u, 1.8), { 'font-size': 14.5, fill: INK });
      gauges(0); return; }
    if (k === 1) { fwd({ ou: E(u, 0.2, 0.8) });
      dot([[72, FY], [628, FY]], seg(u, 0.1, 0.8), ACC, 6);
      OPS.forEach(([, g], i) => { const a = 0.9 + (2 - i) * 0.3; card(OX[i], GY, 110, 46, { rx: 8, text: g, mono: true, fs: 13.5, stroke: WARN, color: INK, fill: WARNBG, s: pop(u, a) });
        el('line', { x1: OX[i], y1: GY + 24, x2: OX[i], y2: FY - 22, stroke: WARN, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', opacity: fade(u, a) });
        if (i) grow(OX[i] - 56, GY, OX[i - 1] + 57, GY, E(u, a + 0.1, a + 0.4), WARN); });
      SAVED.forEach(([i, s], n) => { const y = 344 + (n === 3 ? 30 : 0), a = 1.6 + n * 0.2; card(OX[i], y, 128, 26, { rx: 5, text: s, mono: true, fs: 13.5, stroke: BAD, color: BAD, fill: BADBG, sw: 1.5, s: pop(u, a) }); });
      tx(40, 70, 'backward 용으로 텐서 4개 · 2,624 B 를 붙잡는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) });
      mono(40, 100, 'out.requires_grad → True', { 'font-size': 14.5, fill: INK, opacity: fade(u, 0.9) });
      gauges(1, E(u, 1.8, 2.6)); return; }
    if (k === 2 || k === 3) { fwd({ ou: 1 });
      const gone = k === 2 ? E(u, 0.6, 1.4) : 1;
      if (gone < 1) { OPS.forEach(([, g], i) => card(OX[i], GY + gone * 40, 110, 46, { rx: 8, text: g, mono: true, fs: 13.5, stroke: WARN, fill: WARNBG, op: 1 - gone }));
        SAVED.forEach(([i, s], n) => card(OX[i], 344 + (n === 3 ? 30 : 0), 128, 26, { rx: 5, text: s, mono: true, fs: 13.5, stroke: BAD, color: BAD, fill: BADBG, sw: 1.5, op: 1 - gone })); }
      const lab = k === 2 ? 'with torch.no_grad():' : 'with torch.inference_mode():';
      el('rect', { x: 160, y: 250, width: 444, height: 92, rx: 12, fill: 'none', stroke: k === 2 ? WARN : GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: k === 2 ? fade(u, 0.2) : 1 });
      mono(170, 242, lab, { 'font-size': 15, 'font-weight': 800, fill: k === 2 ? WARN : GOOD, opacity: k === 2 ? fade(u, 0.2) : 1 });
      mono(40, 100, 'out.requires_grad → False   grad_fn → None', { 'font-size': 14.5, fill: INK, opacity: k === 2 ? fade(u, 1.4) : 1 });
      if (k === 2) tx(40, 70, '그래프를 만들지 않는다 — 붙잡는 텐서 0개', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      if (k === 3) { tx(40, 70, '한 발 더 — 내부 부기(bookkeeping)까지 끈다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.2) });
        card(380, GY, 200, 44, { rx: 8, text: '_version 카운터', mono: true, fs: 14.5, stroke: MUT, color: MUT, s: pop(u, 0.5) });
        if (u > 1.0) el('line', { x1: 285, y1: GY, x2: lerp(285, 475, E(u, 1.0, 1.5)), y2: GY, stroke: BAD, 'stroke-width': 3 });
        mono(632, 392, 'out.is_inference() → True', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
      gauges(k === 2 ? 2 : 3, k === 2 ? E(u, 1.4, 2.4) : E(u, 1.0, 2.2)); return; }
    if (k === 4) { fwd({ ou: 1 });
      el('rect', { x: 26, y: 200, width: 640, height: 210, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.2) });
      mono(40, 70, '@torch.inference_mode()', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      mono(40, 100, 'def predict(model, x):', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.6) });
      mono(60, 128, '    model.eval()', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.9) });
      pill(380, 165, 'return model(x).argmax(dim=1) → (32,)', ACC, pop(u, 1.4), { mono: true, fs: 14 });
      sub(346, 400, '함수가 곧 추론 경계 — 부를 때마다 기록이 꺼진다', fade(u, 2.0), { 'font-size': 14.5, fill: INK });
      gauges(3, 1); return; }
    // k5: 다시 학습 그래프에 넣으면
    fwd({ ou: 1 });
    el('rect', { x: 160, y: 250, width: 444, height: 92, rx: 12, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' });
    mono(170, 242, 'with torch.inference_mode():', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
    fly(642, 228, 470, 140, seg(u, 0.2, 1.0), 'out', { fill: ACC, mono: true, stay: true });
    card(330, 140, 200, 40, { rx: 8, text: '(out * w).sum().backward()', mono: true, fs: 13.5, stroke: INK, s: pop(u, 0.3) });
    if (u > 1.1) cross(470, 112, 11, pop(u, 1.1));
    card(330, 70, 600, 56, { rx: 10, text: 'RuntimeError: Inference tensors cannot be\nsaved for backward.', mono: true, fs: 14, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.4) });
    sub(330, 400, '학습 경로에는 다시 못 들어간다 — 순수 추론에만 쓴다', fade(u, 2.0), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
    gauges(3, 1); }

  // =========================================================
  // 3. fp16 — 비트를 반으로, 차이는 숫자로
  // =========================================================
  const HIST = [44, 41, 21, 9, 5, 5, 1, 2], HMAX = 0.000416, MEAN = 0.000097;
  const VALS = [[0.096283, 0.096130], [0.080087, 0.080017], [0.092196, 0.092346]];
  function bits(x, y, n, parts, u, lab) { const cw = 12; let i = 0;
    parts.forEach(([cnt, col]) => { for (let j = 0; j < cnt; j++, i++) { const s = clamp(u * n - i); if (s > 0) el('rect', { x: x + i * (cw + 1), y, width: cw, height: 22, rx: 2, fill: col, opacity: 0.25 + 0.6 * s }); } });
    tx(x, y - 9, lab, { 'font-size': 14.5, 'font-weight': 700, opacity: clamp(u * 3) }); }
  const B32 = [[1, WARN], [8, INFO], [23, ACC]], B16 = [[1, WARN], [5, INFO], [10, ACC]];
  function chip(cx, cy, name, col, s) { const g = R.G(cx, cy, s);
    el('rect', { x: -46, y: -38, width: 92, height: 76, rx: 8, fill: PANEL, stroke: col, 'stroke-width': 2.5 }, g);
    for (let i = 0; i < 4; i++) { el('line', { x1: -32 + i * 21, y1: -38, x2: -32 + i * 21, y2: -48, stroke: col, 'stroke-width': 2.5 }, g); el('line', { x1: -32 + i * 21, y1: 38, x2: -32 + i * 21, y2: 48, stroke: col, 'stroke-width': 2.5 }, g); }
    tx(0, 6, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, class: 'mono' }, g); }
  function hist(u, o) { o = o || {}; const ax = axes(570, 70, 330, 170, { x: [0, HMAX], y: [0, 50], yt: [0, 25, 50], yl: '개수 (출력 128개)' });
    [[0, '0'], [0.0002, '0.0002'], [0.0004, '0.0004']].forEach(([v, s]) => mono(ax.X(v), 260, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    tx(900, 282, '|fp32 − fp16|', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600, class: 'mono' });
    if (o.zero) { el('rect', { x: ax.X(0), y: ax.Y(50 * o.zero), width: 8, height: ax.Y(0) - ax.Y(50 * o.zero), fill: GOOD }); return ax; }
    const bw = (ax.X(HMAX) - ax.X(0)) / 8;
    HIST.forEach((n, i) => { const g = E(u, 0.1 + i * 0.12, 0.6 + i * 0.12), h = ax.Y(0) - ax.Y(n * g);
      if (h > 0) el('rect', { x: ax.X(0) + i * bw + 2, y: ax.Y(n * g), width: bw - 4, height: h, rx: 3, fill: ACC, opacity: 0.8 });
      if (g > 0.95) mono(ax.X(0) + i * bw + bw / 2, ax.Y(n) - 6, String(n), { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK }); });
    return ax; }
  function valTable(cols, u) { const hd = ['out_fp32[:3, 0]', 'out_fp16', '|차이|'];
    for (let c = 0; c < cols; c++) tx(70 + c * 140, 262, hd[c], { 'font-size': 14, 'font-weight': 700, fill: c === 2 ? BAD : MUT, class: 'mono', opacity: c === cols - 1 ? fade(u, 0.2) : 1 });
    VALS.forEach(([a, b], r) => [a, b, Math.abs(a - b)].slice(0, cols).forEach((v, c) => mono(70 + c * 140, 296 + r * 34, v.toFixed(6), { 'font-size': 15, fill: c === 2 ? BAD : c === 1 ? ACC : INK, opacity: c === cols - 1 ? fade(u, 0.4 + r * 0.25) : 1 }))); }
  function s3(t, c) { const { k, u } = c;
    bits(40, 64, 32, B32, k === 0 ? E(u, 0.2, 1.2) : 1, 'float32 — 부호 1 · 지수 8 · 가수 23 비트');
    if (k >= 2) { bits(40, 128, 16, B16, k === 2 ? E(u, 0.2, 1.0) : 1, 'float16 — 부호 1 · 지수 5 · 가수 10 비트');
      mono(470, 55, '최대 3.4e38', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); mono(470, 119, '최대 65504', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', 'font-weight': 700 });
      const bu = k === 2 ? E(u, 1.0, 1.9) : 1;
      mono(40, 192, '가중치 58개', { 'font-size': 14, fill: MUT }); hbar(140, 180, 220, 232, 232, { h: 14, col: OFF, u: bu, text: '232 B' }); hbar(140, 200, 220, 116 * bu + 232 * (1 - bu), 232, { h: 14, col: ACC, text: Math.round(116 * bu + 232 * (1 - bu)) + ' B' }); }
    if (k === 0) { chip(110, 310, 'CPU', MUT, 1); chip(340, 310, 'cuda', ACC, pop(u, 0.4));
      fly(110, 300, 340, 240, seg(u, 0.8, 1.8), 'model', { mono: true, stay: true }); fly(110, 320, 430, 310, seg(u, 1.1, 2.1), 'x', { mono: true, stay: true, fill: INFO });
      sub(235, 405, 'fp16 이득은 GPU 텐서코어에서 나온다', fade(u, 2.0), { 'font-size': 14.5, fill: INK });
      hist(0, { zero: 0 }); return; }
    if (k === 1) { valTable(1, u); hist(u, { zero: E(u, 0.6, 1.3) });
      pill(735, 330, '자기 자신과의 차이 = 0', GOOD, pop(u, 1.4), { fs: 14.5 }); return; }
    if (k === 2) { valTable(2, u); hist(0, { zero: 1 });
      pill(735, 330, 'out_fp16 — 아직 비교 전', ACC, pop(u, 1.6), { fs: 14.5 }); return; }
    if (k === 3) { [['Linear (행렬곱)', 'float16', ACC], ['가중치 저장', 'float32 그대로', INK], ['출력 out_amp', 'float16', ACC]].forEach(([a, b, col], i) => { const y = 270 + i * 46, s = pop(u, 0.3 + i * 0.4);
        card(130, y, 180, 36, { rx: 8, text: a, fs: 14.5, s }); grow(224, y, 290, y, E(u, 0.5 + i * 0.4, 0.9 + i * 0.4), col); mono(300, y + 5, b, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.8 + i * 0.4) }); });
      mono(40, 245, 'with torch.autocast(...):', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.1) });
      hist(0, { zero: 1 }); pill(735, 330, '블록을 나오면 원래 fp32 모델', INFO, pop(u, 1.8), { fs: 14.5 }); return; }
    if (k <= 6) valTable(3, k === 4 ? u : 3);
    const ax = hist(k === 4 ? u : 3);
    if (k === 4) { sub(735, 330, 'diff = (out_fp32 − out_fp16.float()).abs()', fade(u, 1.4), { class: 'mono', 'font-size': 14, fill: INK }); return; }
    const mx = k === 5 ? tween(0, HMAX, u) : HMAX, mn = k === 5 ? tween(0, MEAN, u) : MEAN;
    [[MEAN, GOOD], [HMAX, BAD]].forEach(([v, col], i) => { const x = ax.X(v), op = k === 5 ? fade(u, 0.8 + i * 0.4) : 1; el('line', { x1: x, y1: 66, x2: x, y2: 240, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: op }); });
    if (k === 5) { mono(600, 330, `max  ${mx.toFixed(5)}`, { 'font-size': 18, 'font-weight': 800, fill: BAD }); mono(600, 362, `mean ${mn.toFixed(6)}`, { 'font-size': 18, 'font-weight': 800, fill: GOOD });
      sub(735, 400, '평균만 보면 최악의 한 건을 놓친다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    // k6·k7: 로그 눈금에서 임계값과 비교
    const lx = (v) => 570 + (Math.log10(v) + 5) / 4 * 340;
    el('line', { x1: 570, y1: 345, x2: lerp(570, 910, k === 6 ? E(u, 0.1, 0.8) : 1), y2: 345, stroke: MUT, 'stroke-width': 2 });
    [[1e-5, '1e-5'], [1e-4, '1e-4'], [1e-3, '1e-3'], [1e-2, '1e-2'], [1e-1, '1e-1']].forEach(([v, s]) => { el('line', { x1: lx(v), y1: 340, x2: lx(v), y2: 350, stroke: MUT }); mono(lx(v), 372, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: k === 6 ? fade(u, 0.6) : 1 }); });
    [[MEAN, GOOD, 'mean'], [HMAX, BAD, 'max']].forEach(([v, col, s]) => { el('circle', { cx: lx(v), cy: 345, r: 7, fill: col }); mono(lx(v), 328, s, { 'font-size': 14, fill: col, 'text-anchor': 'middle', 'font-weight': 700 }); });
    const gx = lx(1e-2); el('rect', { x: gx, y: 318, width: 910 - gx, height: 54, fill: BAD, opacity: 0.12 * (k === 6 ? fade(u, 1.0) : 1) });
    el('line', { x1: gx, y1: 312, x2: gx, y2: 378, stroke: BAD, 'stroke-width': 3, opacity: k === 6 ? fade(u, 1.0) : 1 });
    mono(gx + 6, 318, 'assert < 1e-2', { 'font-size': 14, fill: BAD, 'font-weight': 800, opacity: k === 6 ? fade(u, 1.2) : 1 });
    if (k === 6) { pill(735, 404, '통과 — max 가 임계값의 1/24', GOOD, pop(u, 1.9), { fs: 14 }); return; }
    // k7
    [['출력 차이 max · mean', true], ['검증셋 정확도가 fp32 와 같은가', null], ['둘 다 통과해야 배포', null]].forEach(([s, ok], i) => { const y = 270 + i * 46, a = 0.3 + i * 0.5;
      card(250, y, 380, 38, { rx: 8, text: s, fs: 14.5, stroke: i === 2 ? ACC : INK, color: i === 2 ? ACC : INK, s: pop(u, a), fill: PANEL });
      if (ok) check(78, y, 10, pop(u, a + 0.2)); else if (i === 1) mono(78, y + 6, '?', { 'font-size': 18, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, a) }); });
  }

  // =========================================================
  // 4. 배치로 모아 넣기 — 처리량 곡선의 무릎
  // =========================================================
  const PTS = [[1, 8], [4, 28], [8, 48], [16, 78], [32, 100], [64, 108], [128, 110]];
  const NPT = [2, 3, 4, 5, 6, 7, 7, 7];                   // beat 마다 곡선에 찍힌 점 수 (페이지 데이터)
  const BS = [1, 8, 8, 32, 32, 32, 32, 32];
  function lanes(bs, u, o) { o = o || {}; const cs = 30, x0 = 60, y0 = 92, lit = Math.min(64, bs);
    tx(x0, 76, 'GPU 병렬 연산 칸 (그림)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < 64; i++) { const r = Math.floor(i / 8), c = i % 8, on = i < lit * clamp(u * 1.5);
      el('rect', { x: x0 + c * (cs + 4), y: y0 + r * (cs + 4), width: cs, height: cs, rx: 4, fill: on ? ACC : SOFT, stroke: on ? 'none' : GRID, opacity: on ? 0.85 : 1 }); }
    pill(196, 386, `batch_size = ${bs}`, ACC, o.s ?? 1, { mono: true, fs: 15 }); }
  function curve(n, u, o) { o = o || {}; const lg = (b) => Math.log2(b);
    const ax = axes(520, 70, 390, 250, { x: [0, 7], y: [0, 120], yt: [0, 50, 100], grid: true, yl: '처리량 (bs 32 = 100, 예시)' });
    PTS.forEach(([b]) => mono(ax.X(lg(b)), 340, String(b), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    tx(910, 362, 'batch_size', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
    const pts = PTS.slice(0, n).map(([b, v]) => [lg(b), v]);
    R.line(ax, pts, 1, ACC, { sw: 3 });
    pts.forEach(([x, y], i) => { const s = i === n - 1 && o.newPt ? pop(u, 0.4) : 1; el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 6 * s, fill: ACC });
      if (s > 0.9) mono(ax.X(x), ax.Y(y) - 12, String(PTS[i][1]), { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK, 'font-weight': 700 }); });
    return ax; }
  function s4(t, c) { const { k, u } = c, n = NPT[k], fresh = k === 0 || NPT[k] !== NPT[k - 1];
    const ax = curve(n, u, { newPt: fresh });
    if (k === 0 || k === 1 || k === 3 || k === 4) { lanes(BS[k], k === 0 || BS[k] !== BS[k - 1] ? u : 1);
      if (k === 0) pill(196, 40, 'model.eval().cuda() 고정', GOOD, pop(u, 0.2), { fs: 14.5 });
      if (k === 1) pill(196, 40, '@inference_mode  throughput(model, bs)', INFO, pop(u, 0.2), { fs: 14, mono: true });
      if (k === 3) { mono(372, 120, '호출 수', { 'font-size': 14, fill: MUT }); mono(372, 150, 'bs 1 → 2,000', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); mono(372, 178, 'bs 32 → 63', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.0) }); }
      if (k === 4) pill(196, 40, 'done / (끝 시각 − t0)', INFO, pop(u, 0.2), { fs: 14.5, mono: true });
      return; }
    if (k === 2) { tx(40, 70, 'GPU 는 비동기 — 줄을 세운 뒤 잰다', { 'font-size': 15, 'font-weight': 700 });
      mono(40, 140, 'CPU', { 'font-size': 15, 'font-weight': 700 }); mono(40, 230, 'GPU', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      for (let i = 0; i < 6; i++) { const a = 0.2 + i * 0.12; if (u > a) el('rect', { x: 100 + i * 22, y: 122, width: 16, height: 26, rx: 3, fill: INK, opacity: 0.7 }); }
      for (let i = 0; i < 6; i++) { const a = 0.5 + i * 0.25, w = 46 * E(u, a, a + 0.25); if (w > 0) el('rect', { x: 100 + i * 50, y: 212, width: w, height: 26, rx: 3, fill: ACC, opacity: 0.8 }); }
      const sx = 100 + 6 * 50 + 4; el('line', { x1: sx, y1: 100, x2: sx, y2: 270, stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 2.0) });
      mono(sx, 292, 'synchronize() → t0', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      mono(244, 180, '예약만 하고 바로 돌아온다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      sub(220, 360, '안 기다리면 시간이 말도 안 되게 짧게 찍힌다', fade(u, 2.2), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 5) { lanes(32, 1);
      const kx = ax.X(5), ky = ax.Y(100); el('circle', { cx: kx, cy: ky, r: 18 * pop(u, 0.6), fill: 'none', stroke: GOOD, 'stroke-width': 3 });
      pill(kx - 10, ky + 52, '무릎 = 32', GOOD, pop(u, 1.0), { fs: 15 });
      sub(715, 400, '그 너머는 처리량 +10% 남짓, 지연만 늘어난다', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 6) { tx(40, 70, 'torch.compile — 연산을 하나로 묶는다', { 'font-size': 15, 'font-weight': 700 });
      const m = E(u, 0.6, 1.6);
      if (m < 0.98) ['Linear', 'ReLU', 'Linear'].forEach((s, i) => card(lerp(110 + i * 130, 240, m), 180, 110, 50, { rx: 8, text: s, mono: true, fs: 15, stroke: INK, op: 1 - 0.6 * m }));
      else card(240, 180, 260, 50, { rx: 8, text: 'fused kernel 1개', mono: true, fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.6) });
      mono(110, 250, '커널 3번', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: 1 - m });
      sub(240, 300, '커널 호출 횟수가 줄어 오버헤드가 준다', fade(u, 1.9), { 'font-size': 14.5, fill: INK });
      pill(240, 360, '배치·정밀도 다음에 얹는다', INFO, pop(u, 2.2), { fs: 14 }); return; }
    // k7 warm-up
    tx(40, 70, 'fast = torch.compile(model) 호출 시간 (그림)', { 'font-size': 15, 'font-weight': 700 });
    [[260, '1번째 — 컴파일 (warm-up)', WARN], [60, '2번째', GOOD], [60, '3번째', GOOD]].forEach(([w, s, col], i) => { const y = 120 + i * 70, g = E(u, 0.2 + i * 0.5, 0.2 + i * 0.5 + (i ? 0.3 : 1.0));
      el('rect', { x: 60, y, width: Math.max(2, w * g), height: 30, rx: 4, fill: col, opacity: 0.85 }); tx(60, y - 8, s, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.5) }); });
    sub(220, 360, '첫 호출은 재지 않는다 — 데운 뒤에 잰다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); }

  // =========================================================
  // 5. 표준 조합을 한 함수에 — 텐서가 지나는 관문
  // =========================================================
  const ST = [['model.eval()', 'Dropout off'], ['@inference_mode', '그래프 off'], ['x.to(device)', '같은 device'], ['autocast fp16', '검증 후 켠다'], ['배치 + compile', '처리량']];
  const SX = (i) => 100 + i * 172;
  const MIST = [['eval 누락', '결과가 요청마다 흔들린다'], ['전처리 불일치', '정확도가 조용히 무너진다'], ['디바이스 혼선', 'RuntimeError']];
  const MK = [0, 0, 1, 2, 2, 3, 3];                   // beat 마다 보이는 실수 카드 수 (페이지 데이터)
  function s5(t, c) { const { k, u } = c, on = Math.min(k + 1, 5);
    el('line', { x1: SX(0) - 70, y1: 110, x2: SX(4) + 70, y2: 110, stroke: GRID, 'stroke-width': 4 });
    ST.forEach(([a, b], i) => { const lit = i < on, now = i === on - 1 && k <= 4;
      card(SX(i), 110, 150, 58, { rx: 10, text: a + '\n' + b, fs: 14.5, mono: false, stroke: lit ? GOOD : GRID, color: lit ? INK : OFF, fill: lit ? GOODBG : PANEL, s: now ? pop(u, 0.2) : 1 });
      if (lit) check(SX(i) + 62, 80, 9, now ? pop(u, 0.5) : 1); });
    tx(SX(0) - 70, 54, 'make_inferencer(model) 가 거치는 관문', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    // 텐서 꼬리표
    const tagAt = [SX(0), SX(1), SX(2), SX(3), SX(4)][Math.min(k, 4)];
    const tag = k < 2 ? 'x · cpu · float32' : k === 2 ? 'x · cuda · float32' : 'matmul · float16';
    pill(tagAt, 170, tag, k >= 3 ? ACC : k === 2 ? GOOD : INFO, k <= 4 ? pop(u, 0.8) : 1, { mono: true, fs: 13.5 });
    // 흔한 실수
    tx(40, 228, '현업 3대 실수', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: MK[k] ? 1 : 0 });
    MIST.slice(0, MK[k]).forEach(([a, b], i) => { const y = 262 + i * 52, fresh = i === MK[k] - 1 && (k === 0 || MK[k] !== MK[k - 1]);
      card(200, y, 320, 42, { rx: 8, stroke: BAD, fill: BADBG, sw: 1.8, s: fresh ? pop(u, 1.0) : 1 });
      tx(56, y + 5, a, { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fresh ? fade(u, 1.1) : 1 }); tx(170, y + 5, b, { 'font-size': 14, fill: INK, opacity: fresh ? fade(u, 1.1) : 1 }); });
    // 오른쪽 아래: 벤치마크 / 로그 / 다음 장
    if (k === 4) { tx(500, 228, 'benchmark(predict)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      el('rect', { x: 500, y: 250, width: 90 * E(u, 0.3, 0.9), height: 26, rx: 4, fill: WARN, opacity: 0.85 }); tx(500, 300, 'warm-up 1회', { 'font-size': 14, fill: WARN, opacity: fade(u, 0.8) });
      for (let i = 0; i < 9; i++) { const a = 1.0 + i * 0.12; if (u > a) el('rect', { x: 610 + i * 34, y: 250, width: 28, height: 26, rx: 3, fill: ACC, opacity: 0.8 }); }
      tx(610, 300, '이 구간만 잰다 (배치 32 × 반복)', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.4) }); }
    if (k === 5) terminal(500, 220, 440, 110, ['$ python inference_opt.py', ['throughput=…/s  latency=…ms', 'var(--term)']], lerp(0.5, 2, E(u, 0.3, 1.6)), { title: 'log' });
    if (k === 5) sub(720, 360, '두 숫자를 배포 로그에 남긴다', fade(u, 1.8), { 'font-size': 14.5, fill: INK });
    if (k === 6) { card(720, 250, 420, 44, { rx: 8, text: 'predict = make_inferencer(model)', mono: true, fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      grow(720, 276, 720, 318, E(u, 0.8, 1.3), ACC);
      card(720, 346, 420, 50, { rx: 10, text: '다음 장 V-1-2 · TorchScript · ONNX', fs: 15, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 1.3) }); } }

  const quiz = [
    { q: 'model.eval()을 부르지 않고 같은 입력을 두 번 넣었더니 답이 달랐다. 원인은 무엇인가?',
      o: ['학습 모드의 Dropout이 매번 다른 뉴런을 꺼서', '입력 x가 매번 조금씩 바뀌어서', 'eval()을 안 하면 가중치가 조금씩 학습되어서'], a: 0,
      why: '모델은 처음에 train 모드다. 그림의 실행에서 1회차는 h6·h7, 2회차는 h6만 꺼져 out1과 out2가 달랐다.' },
    { q: 'eval()을 이미 켰는데도 torch.no_grad()나 inference_mode()로 감싸는 이유는 무엇인가?',
      o: ['eval()은 레이어 동작만 바꾸고 autograd 기록은 그대로 두기 때문에', 'eval() 만으로는 Dropout이 꺼지지 않기 때문에', 'no_grad가 출력 값을 더 정확하게 만들기 때문에'], a: 0,
      why: '기록이 켜져 있으면 batch 32에서도 backward 용 텐서 4개(2,624 B)를 붙잡는다. 추론에는 역전파가 없으니 순수한 낭비다.' },
    { q: 'fp16 추론을 배포하기 전에 꼭 해야 하는 일은 무엇인가?',
      o: ['가중치를 다시 fp32로 저장하기', '같은 입력의 fp32 출력과 차이(max·mean)를 재고 정확도를 확인하기', '배치 크기를 1로 줄이기'], a: 1,
      why: 'fp16은 표현 범위가 좁아 출력이 미세하게 달라진다. 이 모델은 max 0.00042로 임계값 1e-2 안이었지만, 재 보기 전에는 알 수 없다.' },
    { q: '배치 크기를 계속 키우면 처리량은 어떻게 되는가?',
      o: ['배치 크기에 비례해 끝없이 늘어난다', '배치 크기와 상관없이 같다', '처음엔 크게 늘다가 무릎 이후 거의 늘지 않고 지연만 는다'], a: 2,
      why: '예시 곡선에서 1 → 32는 8 → 100으로 뛰었지만 32 → 128은 100 → 110에 그쳤다. 무릎에서 배치 크기를 정한다.' },
    { q: '입력 텐서와 모델이 서로 다른 device에 있으면 어떻게 되는가?',
      o: ['조용히 정확도가 떨어진다', 'PyTorch가 알아서 옮겨 준다', '바로 RuntimeError가 난다'], a: 2,
      why: 'device 혼선은 즉시 에러가 나서 오히려 찾기 쉽다. 그래서 predict 안에 x.to(device) 한 줄을 넣어 둔다.' },
  ];

  const summary = [
    '모델은 train 모드로 만들어져서, eval()을 빼먹으면 같은 입력에도 Dropout 때문에 답이 달라진다.',
    'eval()은 레이어만 바꾼다. 그래프 기록은 inference_mode()로 따로 꺼야 텐서를 붙잡지 않는다.',
    'fp16은 가중치 메모리를 232 B에서 116 B로 줄이지만, fp32 출력과 차이를 재고 나서 켠다.',
    '배치는 처리량이 포화되는 무릎에서 멈추고, compile은 warm-up 뒤에 잰다.',
  ];
  const review = [
    { q: '서비스에서 같은 요청에 가끔 다른 답이 나온다는 보고가 왔다. 먼저 확인할 것은?',
      o: ['fp16 출력 차이가 1e-2를 넘는지', '모델을 로드한 뒤 eval()을 불렀는지', '배치 크기가 무릎보다 큰지'], a: 1,
      why: '같은 입력에 답이 흔들리는 것은 학습 모드 Dropout의 전형적인 증상이다. 로드 직후 eval() 한 줄로 막는다.' },
    { q: 'inference_mode로 만든 예측 결과를 손실 계산에 넣어 미세조정하려다 에러가 났다. 알맞은 대응은?',
      o: ['학습 경로에서는 inference_mode를 빼고 돌린다', 'eval()을 한 번 더 부른다', 'autocast를 켜서 다시 돌린다'], a: 0,
      why: 'inference_mode 안에서 만든 텐서는 backward 용으로 저장될 수 없다. 학습에 쓸 경로는 기록을 켠 채 따로 돌려야 한다.' },
    { q: 'GPU 벤치마크에서 torch.compile 모델의 처리량이 오히려 낮게 나왔다. 가장 먼저 의심할 것은?',
      o: ['배치 크기가 너무 커서 메모리가 넘쳤다', 'fp16 출력 차이가 커서', '첫 호출(컴파일)과 동기화 없는 시간이 측정에 섞였다'], a: 2,
      why: 'compile은 첫 호출이 느리고, GPU는 비동기라 synchronize 없이 재면 숫자가 틀어진다. warm-up 뒤 동기화하고 잰다.' },
  ];

  R.page({ title: '추론 모드 3단 기어', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
