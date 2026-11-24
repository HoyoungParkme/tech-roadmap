/* I-1-1 텐서 — numpy와 뭐가 다른가 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, fly, dot, cells, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // beat j 에서 a초부터 0→1 (그 뒤 beat 에서는 1)
  const at = (c, j, a = 0.2, d = 0.7) => (c.k > j ? 1 : c.k === j ? E(c.u, a, a + d) : 0);
  const pp = (c, j, a = 0.2) => (c.k > j ? 1 : c.k === j ? pop(c.u, a) : 0);
  const now = (c, j, a) => c.k > j || (c.k === j && c.u >= a);   // beat j 의 a초 이후인가

  // 한 줄 텐서 칸: 가운데 cx 기준
  function row(cx, y, vals, o) { o = o || {}; const w = o.w || 56, gap = o.gap ?? 6, W = vals.length * (w + gap) - gap;
    cells(cx - W / 2, y, vals, Object.assign({ w, h: o.h || 42, gap, fs: o.fs || 15 }, o)); return { x0: cx - W / 2, W, w, gap }; }
  // 칩(CPU/GPU): 핀 + 코어 격자
  function chip(cx, cy, w, h, name, o) { o = o || {}; const col = o.col || INK, g = R.G(cx, cy, 1, o.op ?? 1), np = Math.max(3, Math.floor(w / 34));
    for (let i = 0; i < np; i++) { const px = -w / 2 + 20 + (i * (w - 40)) / (np - 1);
      el('line', { x1: px, y1: -h / 2 - 9, x2: px, y2: -h / 2, stroke: col, 'stroke-width': 3 }, g); el('line', { x1: px, y1: h / 2, x2: px, y2: h / 2 + 9, stroke: col, 'stroke-width': 3 }, g); }
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5 }, g);
    const [cn, rn] = o.cores || [2, 1], cs = o.cs || 12, gp = 4, x0 = -(cn * (cs + gp) - gp) / 2, y0 = h / 2 - rn * (cs + gp) - 10;
    for (let r = 0; r < rn; r++) for (let q = 0; q < cn; q++) el('rect', { x: x0 + q * (cs + gp), y: y0 + r * (cs + gp), width: cs, height: cs, rx: 2, fill: o.lit ? col : SOFT, opacity: o.lit ? 0.3 + 0.5 * o.lit : 1 }, g);
    tx(-w / 2 + 16, -h / 2 + 26, name, { 'font-size': 16, 'font-weight': 800, fill: col }, g); return g; }
  // 둥근 노드 (그래프)
  function node(cx, cy, name, val, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('circle', { cx: 0, cy: 0, r: o.r || 40, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.6, 'stroke-dasharray': o.dash }, g);
    tx(0, -6, name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col }, g);
    if (val != null) mono(0, 17, val, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK }, g); return g; }
  // 켜고 끄는 스위치 (v 0→1)
  function toggle(cx, cy, v, label, col) { const on = v > 0.5;
    el('rect', { x: cx - 26, y: cy - 13, width: 52, height: 26, rx: 13, fill: on ? (col || ACC) : SOFT, stroke: on ? (col || ACC) : OFF, 'stroke-width': 2 });
    el('circle', { cx: cx - 13 + 26 * v, cy, r: 10, fill: PANEL, stroke: on ? (col || ACC) : OFF, 'stroke-width': 2 });
    if (label) mono(cx + 36, cy + 5, label, { 'font-size': 14, 'font-weight': 700, fill: on ? (col || ACC) : MUT }); }

  // =========================================================
  // 1. numpy 와 나란히 — 문법은 같고, 브리지는 메모리를 나눠 쓴다
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) {
      const L = 250, Rx = 710;
      pill(L, 62, 'import numpy as np', INFO, pp(c, 0, 0.2), { mono: true, fs: 15 });
      pill(Rx, 62, 'import torch', ACC, pp(c, 0, 0.6), { mono: true, fs: 15 });
      tx(480, 70, '≈', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: MUT, opacity: at(c, 0, 1.0) });
      zone(70, 96, 360, 300, 'numpy', { op: at(c, 0, 1.2) * 0.9, color: INFO });
      zone(530, 96, 360, 300, 'torch', { op: at(c, 0, 1.4) * 0.9, color: ACC });
      if (k === 0) { sub(480, 250, '같은 일을 두 줄에 나란히 적어 비교한다', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
      // k1: 배열 생성
      mono(L, 134, 'a = np.array([1, 2, 3])', { 'text-anchor': 'middle', 'font-size': 15, opacity: at(c, 1, 0.2) });
      mono(Rx, 134, 't = torch.tensor([1, 2, 3])', { 'text-anchor': 'middle', 'font-size': 15, opacity: at(c, 1, 0.6), fill: ACC, 'font-weight': 700 });
      const hi = k === 2 ? (u < 0.9 ? [0] : u < 1.5 ? [1, 2] : []) : [];
      const sty = (col, d) => (i) => ({ s: c.k > 1 ? 1 : pop(u, d + i * 0.2), stroke: hi.includes(i) ? WARN : col, sw: hi.includes(i) ? 3 : 2, fill: hi.includes(i) ? WARNBG : null });
      row(L, 148, [1, 2, 3], { style: sty(INFO, 0.4) }); row(Rx, 148, [1, 2, 3], { style: sty(ACC, 0.8) });
      sub(L, 212, 'a.shape → (3,)', at(c, 1, 1.4), { class: 'mono' }); sub(Rx, 212, 't.shape → torch.Size([3])', at(c, 1, 1.6), { class: 'mono' });
      if (k === 1) { sub(480, 300, '인자 모양이 그대로다. 바뀐 것은 이름뿐', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      // k2: 인덱싱·연산 표
      [['[0]', '1', 'tensor(1)'], ['[1:]', '[2 3]', 'tensor([2, 3])'], ['+ 10', '[11 12 13]', 'tensor([11, 12, 13])'], ['@ 자기 자신', '14', 'tensor(14)']].forEach(([op, a, b], i) => {
        const y = 256 + i * 36, op1 = fade(u, 0.2 + i * 0.55);
        pill(480, y - 5, op, MUT, op1 > 0 ? 1 : 0, { mono: true, fs: 14, op: op1 });
        mono(L, y, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: op1 });
        mono(Rx, y, b, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: op1 }); });
      return; }
    // k3~5: 브리지 — 한 메모리를 둘이 본다
    const MX = 480, MY = 168, w = 74, vals = [k > 3 || now(c, 3, 1.6) ? (k === 5 && u >= 1.7 ? 0 : 99) : 1, k > 4 || now(c, 4, 1.4) ? -1 : 2, 3];
    const flash = (i) => (k === 3 && i === 0 && u > 1.6 && u < 2.3) || (k === 4 && i === 1 && u > 1.4 && u < 2.1) || (k === 5 && i === 0 && u > 1.7 && u < 2.4);
    tx(MX, MY - 16, '메모리 한 덩어리 (float64)', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: at(c, 3, 0.1) });
    const r = row(MX, MY, vals.map((v) => v.toFixed(1)), { w, h: 46, style: (i) => ({ s: k > 3 ? 1 : pop(u, 0.15 + i * 0.12), fill: flash(i) ? WARNBG : SOFT, stroke: flash(i) ? WARN : INK, sw: flash(i) ? 3 : 2 }) });
    const L = r.x0, Rr = r.x0 + r.W;
    pill(150, MY + 23, 'arr  (numpy)', INFO, pp(c, 3, 0.4), { mono: true, fs: 15 }); grow(222, MY + 23, L - 6, MY + 23, at(c, 3, 0.5, 0.5), INFO);
    pill(810, MY + 23, 'shared  (torch)', ACC, pp(c, 3, 0.8), { mono: true, fs: 15 }); grow(728, MY + 23, Rr + 6, MY + 23, at(c, 3, 0.9, 0.5), ACC);
    if (k === 3) { pill(MX, 92, 'arr[0] = 99.0', WARN, pop(u, 1.3), { mono: true, fs: 15 });
      mono(MX, 268, 'print(shared) → tensor([99., 2., 3.], dtype=torch.float64)', { 'text-anchor': 'middle', 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(MX, 300, '복사가 아니다. 텐서 쪽도 99 가 됐다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 4) { pill(MX, 92, 'shared[1] = -1.0', WARN, pop(u, 1.1), { mono: true, fs: 15 });
      pill(MX, 300, 'back = shared.numpy()', INFO, pop(u, 0.3), { mono: true, fs: 15 }); grow(MX, 282, MX, MY + 52, E(u, 0.5, 1.0), INFO);
      mono(MX, 350, 'print(back) → [99. -1.  3.]', { 'text-anchor': 'middle', 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(MX, 384, '반대 방향도 같은 메모리', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 5) { const SY = 300;
      [99, -1, 3].forEach((v, i) => fly(L + i * (w + 6) + w / 2, MY + 66, L + i * (w + 6) + w / 2, SY + 23, seg(u, 0.3 + i * 0.12, 0.9 + i * 0.12), v.toFixed(1), { mono: true }));
      row(MX, SY, ['99.0', '-1.0', '3.0'], { w, h: 46, style: (i) => ({ s: u > 0.9 + i * 0.12 ? 1 : 0, stroke: ACC, fill: ACCBG }) });
      pill(810, SY + 23, 'safe = ….clone()', ACC, pop(u, 1.0), { mono: true, fs: 15 }); grow(718, SY + 23, Rr + 6, SY + 23, E(u, 1.1, 1.5), ACC);
      tx(150, SY + 28, '새 메모리', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      cross(MX, (MY + 46 + SY) / 2, 13, pop(u, 1.3));
      pill(MX, 92, 'arr[0] = 0.0', WARN, pop(u, 1.6), { mono: true, fs: 15 });
      if (u > 2.1) check(Rr + 30, SY + 23, 12, pop(u, 2.1));
      sub(MX, 392, 'arr 를 바꿔도 safe 는 99.0 그대로', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // =========================================================
  // 2. device — CPU 와 GPU 두 방, 섞으면 RuntimeError
  // =========================================================
  const CPU = [220, 205], GPU = [740, 205], CW = 300, CH = 190;
  function rooms(c, o) { o = o || {};
    chip(CPU[0], CPU[1], CW, CH, 'CPU', { cores: [4, 1], cs: 18, lit: o.cpu ? 1 : 0, col: INK });
    chip(GPU[0], GPU[1], CW, CH, 'GPU  cuda:0', { cores: [16, 2], cs: 9, lit: o.gpu ? 1 : 0, col: ACC });
    el('line', { x1: CPU[0] + CW / 2 + 4, y1: CPU[1] + 60, x2: GPU[0] - CW / 2 - 4, y2: GPU[1] + 60, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
    mono(480, CPU[1] + 50, '.to()', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); }
  function tens(cx, y, vals, col, s, tag, o) { o = o || {}; row(cx, y, vals, { w: o.w || 52, h: 38, style: () => ({ s, stroke: col, fill: o.fill }) });
    if (tag) mono(cx, y + 58, tag, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col, opacity: s > 0.5 ? 1 : 0 }); }
  function s2(t, c) { const { k, u } = c;
    rooms(c, { cpu: k === 1 || k === 6, gpu: k === 2 || k === 5 });
    if (k === 0) { const pu = E(u, 0.5, 1.2);
      pill(480, 46, 'torch.cuda.is_available()', INK, pop(u, 0.2), { mono: true, fs: 15 });
      grow(400, 60, CPU[0] + 40, CPU[1] - CH / 2 - 14, pu, MUT); grow(560, 60, GPU[0] - 40, GPU[1] - CH / 2 - 14, pu, ACC);
      mono(300, 74, 'False → "cpu"', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INK, opacity: fade(u, 1.2) });
      mono(660, 74, 'True → "cuda"', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      sub(480, 360, 'device 한 줄이 환경 차이를 흡수한다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    pill(480, 46, 'device = "cuda" or "cpu"', MUT, 1, { mono: true, fs: 14 });
    if (k <= 2) {
      tens(CPU[0], 150, ['1.', '2.', '3.'], INK, k === 1 ? pop(u, 0.2) : 1, 'x.device = cpu');
      if (k === 2) { fly(CPU[0] + 90, 169, GPU[0] - 90, 169, seg(u, 0.4, 1.4), '[1., 2., 3.]', { mono: true });
        tens(GPU[0], 150, ['1.', '2.', '3.'], ACC, pop(u, 1.4), 'x_gpu.device = cuda:0', { fill: ACCBG });
        sub(480, 362, '값은 그대로, 사는 곳만 바뀐다. 원본 x 는 CPU 에 남는다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      return; }
    // k3~6: a(GPU) · b(CPU)
    const bOn = k >= 5 ? (k === 5 ? (u < 0.4 ? 'cpu' : u < 1.2 ? 'fly' : 'gpu') : 'gpu') : 'cpu';
    if (k < 6 || u < 0.3) tens(GPU[0] - 60, 150, ['1.', '2.'], ACC, pp(c, 3, 0.2), 'a', { fill: ACCBG });
    if (bOn === 'cpu' && (k < 6)) tens(CPU[0], 150, ['3.', '4.'], INK, pp(c, 3, 0.5), 'b');
    if (bOn === 'fly') fly(CPU[0] + 60, 169, GPU[0] + 40, 169, seg(u, 0.4, 1.2), '[3., 4.]', { mono: true });
    if (bOn === 'gpu' && k === 5) tens(GPU[0] + 70, 150, ['3.', '4.'], ACC, 1, 'b', { fill: ACCBG });
    if (k === 3) sub(480, 362, 'a 는 GPU, b 는 CPU. 값은 멀쩡하다', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 4) { const m = E(u, 0.3, 1.1);
      fly(GPU[0] - 60, 169, 520, 120, m < 1 ? m : 0.999, 'a', { stay: true }); fly(CPU[0], 169, 440, 120, m < 1 ? m : 0.999, 'b', { stay: true, fill: INK });
      if (u > 1.1) { cross(480, 120, 16, pop(u, 1.1)); }
      card(480, 362, 640, 62, { rx: 10, fill: BADBG, stroke: BAD, sw: 2, s: pop(u, 1.4) });
      mono(180, 356, 'RuntimeError: Expected all tensors to be on the same device,', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) });
      mono(180, 378, 'but found cuda:0 and cpu', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) }); }
    if (k === 5) { tens(GPU[0], 216, ['4.', '6.'], ACC, pop(u, 1.8), null, { fill: ACCBG });
      mono(GPU[0] - 110, 240, 'c =', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      pill(480, 362, 'c = a + b.to("cuda")  →  tensor([4., 6.], device=\'cuda:0\')', ACC, pop(u, 2.0), { mono: true, fs: 14 }); }
    if (k === 6) { fly(GPU[0], 169, CPU[0], 169, seg(u, 0.3, 1.2), 'c [4., 6.]', { mono: true });
      tens(CPU[0], 150, ['4.', '6.'], INK, pop(u, 1.2), 'c.cpu()');
      pill(CPU[0], 300 - 20, 'result = c.cpu().numpy()', INFO, pop(u, 1.8), { mono: true, fs: 14 });
      sub(480, 372, '.numpy() 는 CPU 텐서에서만 된다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // =========================================================
  // 3. requires_grad — 텐서가 연산 이력을 기억한다
  // =========================================================
  function s3(t, c) { const { k, u } = c; const X = [150, 140], OP = [400, 140], Y = [650, 140];
    const dim = k === 5 || k === 6 ? 0.35 : 1;
    node(X[0], X[1], 'x', '3.0', { s: pp(c, 0, 0.2), col: ACC, op: k === 6 ? 1 : dim });
    if (k === 0) { toggle(X[0] - 30, 230, E(u, 0.8, 1.4), 'requires_grad=True');
      mono(560, 236, 'x.requires_grad → True', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(480, 330, '스위치만 켰다. 이제부터 x 가 낀 연산이 기록된다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    grow(X[0] + 42, X[1], OP[0] - 54, OP[1], at(c, 1, 0.2, 0.5), MUT, { op: dim });
    card(OP[0], OP[1], 104, 46, { rx: 23, text: 'x ** 2', fs: 16, mono: true, stroke: INK, s: pp(c, 1, 0.6), op: dim });
    grow(OP[0] + 54, OP[1], Y[0] - 44, Y[1], at(c, 1, 0.9, 0.5), MUT, { op: dim });
    node(Y[0], Y[1], 'y', '9.0', { s: pp(c, 1, 1.3), col: INK, op: dim });
    if (k === 1) { sub(OP[0], 92, '이 연산이 그래프에 한 칸 남는다', fade(u, 1.6), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); }
    if (k >= 2) { el('line', { x1: Y[0], y1: Y[1] + 40, x2: Y[0], y2: 212, stroke: ACC, 'stroke-width': 2, opacity: at(c, 2, 0.2) * dim });
      pill(Y[0], 226, 'grad_fn=<PowBackward0>', ACC, pp(c, 2, 0.3), { mono: true, fs: 15, op: dim });
      if (k === 2) sub(Y[0], 272, '"제곱으로 태어났다" 는 표식', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k >= 3 && k <= 4) { const route = [[Y[0] - 30, Y[1] + 30], [OP[0] + 10, 300], [X[0] + 30, X[1] + 32]];
      el('path', { d: `M${route[0][0]},${route[0][1]} Q${OP[0]},330 ${route[2][0]},${route[2][1]}`, fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: at(c, 3, 0.2) });
      pill(Y[0] + 150, Y[1], 'y.backward()', BAD, pp(c, 3, 0.2), { mono: true, fs: 15 });
      if (k === 3) { dot([[Y[0] - 30, Y[1] + 30], [OP[0] + 120, 296], [OP[0] - 110, 296], [X[0] + 30, X[1] + 32]], seg(u, 0.7, 2.2), BAD, 8);
        pill(OP[0], 330, '∂y/∂x = 2x', BAD, pop(u, 1.2), { mono: true, fs: 15 }); }
      if (k === 4) { card(X[0], 300, 170, 50, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.5, s: pop(u, 0.3) });
        mono(X[0], 306, 'x.grad = 6.0', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
        mono(OP[0], 330, '2 × 3 = 6', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
        sub(650, 330, '미분 공식을 쓴 적이 없다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }
    if (k === 5) {
      card(760, 300, 220, 64, { rx: 10, stroke: INFO, fill: INFOBG, sw: 2.2, s: pop(u, 0.2) });
      mono(760, 296, 'ndarray  9.0', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
      tx(760, 318, '값만 남는다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) });
      card(470, 300, 190, 46, { rx: 8, dash: '6 5', stroke: OFF, text: 'grad_fn 자리 없음', fs: 15, color: MUT, s: pop(u, 0.9) });
      grow(646, 300, 572, 300, E(u, 1.2, 1.6), OFF, { dash: '5 5' }); cross(612, 300, 12, pop(u, 1.7));
      sub(620, 380, '거슬러 올라갈 길이 없다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 6) { zone(330, 250, 600, 150, 'with torch.no_grad():', { fill: SOFT, stroke: OFF, dash: '6 5', op: fade(u, 0.2), color: INK });
      grow(X[0] + 20, X[1] + 40, 430, 320, E(u, 0.5, 1.0), OFF, { dash: '5 5' });
      card(500, 322, 120, 44, { rx: 22, text: 'x * 2', fs: 15, mono: true, s: pop(u, 0.8) });
      card(680, 322, 130, 44, { rx: 10, text: 'pred = 6.0', fs: 15, mono: true, s: pop(u, 1.1) });
      mono(840, 312, 'grad_fn = None', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(840, 336, 'requires_grad = False', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      sub(630, 384, '블록 안 연산은 기록되지 않는다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // =========================================================
  // 4. dtype — 비트 수가 다르고, 정수는 미분 스위치가 없다
  // =========================================================
  // 비트 띠: n 비트 (부호·지수·가수 칸을 진하기로 구분). fields=[부호, 지수] 비트 수
  function bits(x, y, n, col, u, fields) { const bw = 7.4, show = Math.round(n * clamp(u));
    for (let i = 0; i < show; i++) { const f = fields ? (i < fields[0] ? 0.95 : i < fields[0] + fields[1] ? 0.6 : 0.28) : 0.45;
      el('rect', { x: x + i * bw, y, width: bw - 1.2, height: 22, rx: 1.5, fill: col, opacity: f }); }
    return x + n * bw; }
  const DROWS = [92, 162, 232, 302, 372];
  function dLabel(y, name, small, col, op) { mono(28, y + 12, name, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op });
    tx(28, y + 32, small, { 'font-size': 13.5, fill: MUT, opacity: op }); }
  function s4(t, c) { const { k, u } = c, X0 = 236;
    tx(X0, 50, '부호', { 'font-size': 13.5, 'font-weight': 700, fill: INK, opacity: 0.9 }); tx(X0 + 44, 50, '지수', { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); tx(X0 + 92, 50, '가수 (비트 한 칸 = 1비트)', { 'font-size': 13.5, fill: MUT });
    // 0: float32
    dLabel(DROWS[0], 'torch.float32', 'torch 기본 · 4바이트', ACC, at(c, 0, 0.1));
    bits(X0, DROWS[0], 32, ACC, at(c, 0, 0.3, 1.0), [1, 8]);
    mono(940, DROWS[0] + 16, 't = tensor([1.0, 2.0])', { 'font-size': 14, 'text-anchor': 'end', fill: ACC, opacity: at(c, 0, 1.4) });
    // 1: float64 (브리지)
    if (k >= 1) { dLabel(DROWS[1], 'torch.float64', 'numpy 기본 · 8바이트', WARN, at(c, 1, 0.1));
      bits(X0, DROWS[1], 64, WARN, at(c, 1, 0.3, 1.0), [1, 11]);
      mono(940, DROWS[1] + 16, 'from_numpy(arr)', { 'font-size': 14, 'text-anchor': 'end', fill: WARN, 'font-weight': 700, opacity: at(c, 1, 1.4) });
      if (k === 1) sub(480, 400, 'numpy 의 float64 가 그대로 딸려 온다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    // 2: int64 → (k5) float
    if (k >= 2) { const fixed = k === 5 && u > 0.6, y = DROWS[2];
      dLabel(y, fixed ? 'g = ….float()' : 'torch.int64', fixed ? '정수 → float32' : '정수 · 8바이트', fixed ? ACC : INK, at(c, 2, 0.1));
      if (fixed) bits(X0, y, 32, ACC, E(u, 0.6, 1.2), [1, 8]); else bits(X0, y, 64, INK, at(c, 2, 0.3, 0.8));
      const sw = k === 2 ? (u > 0.9 ? 1 : 0) : k === 5 ? E(u, 1.4, 1.8) : 0;
      toggle(760, y + 11, k === 2 ? E(u, 0.9, 1.2) * 0.45 : sw, null, fixed ? ACC : BAD);
      if (k === 2 || (k > 2 && k < 5)) { cross(820, y + 11, 11, k === 2 ? pop(u, 1.2) : 1);
        if (k === 2) mono(X0, y + 52, 'Only Tensors of floating point and complex dtype can require gradients', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) }); }
      if (k === 5 && u > 1.8) { check(820, y + 11, 11, pop(u, 1.8)); mono(X0, y + 52, 'g.requires_grad_(True)  →  g.requires_grad = True', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.9) }); } }
    // 3: 섞으면 승격
    if (k >= 3) { const y = DROWS[3], g = k === 3 ? E(u, 0.8, 1.6) : 1;
      dLabel(y, '(a + b).dtype', 'float32 + float64', WARN, at(c, 3, 0.1));
      bits(X0, y, Math.round(32 + 32 * g), g > 0.5 ? WARN : ACC, at(c, 3, 0.2, 0.5), g > 0.5 ? [1, 11] : [1, 8]);
      mono(940, y + 16, '→ float64', { 'font-size': 15, 'text-anchor': 'end', fill: WARN, 'font-weight': 800, opacity: at(c, 3, 1.6) });
      if (k === 3) sub(480, 400, '에러도 경고도 없이 64비트가 된다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    // 4: .float() 로 통일
    if (k >= 4) { const y = DROWS[4], g = k === 4 ? E(u, 0.6, 1.4) : 1;
      dLabel(y, 'bridged.float()', 'float64 → float32', ACC, at(c, 4, 0.1));
      bits(X0, y, Math.round(64 - 32 * g), g > 0.5 ? ACC : WARN, 1, g > 0.5 ? [1, 8] : [1, 11]);
      if (g > 0.95) check(X0 + 32 * 7.4 + 24, y + 11, 11, k === 4 ? pop(u, 1.4) : 1);
      mono(940, y + 16, 'safe.dtype = float32', { 'font-size': 14, 'text-anchor': 'end', fill: ACC, 'font-weight': 700, opacity: at(c, 4, 1.6) }); } }

  // =========================================================
  // 5. 도구 상자 — 생성 · in-place · view / clone / detach
  // =========================================================
  const RN = [['1.54', '-0.29', '-2.18'], ['0.57', '-1.08', '-1.40']];   // torch.manual_seed(0) 의 randn(2,3) 실행 값
  function grid(x, y, vals, o) { o = o || {}; vals.forEach((rw, r) => cells(x, y + r * ((o.h || 40) + 4), rw, Object.assign({ w: o.w || 58, h: o.h || 40, gap: 4, fs: o.fs || 14.5 }, o, { style: o.style ? (i, v) => o.style(r, i, v) : null }))); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) {
      mono(60, 70, 'torch.zeros(2, 3)', { 'font-size': 15, 'font-weight': 700, opacity: at(c, 0, 0.1) });
      grid(60, 84, [['0.', '0.', '0.'], ['0.', '0.', '0.']], { style: (r, i) => ({ s: pp(c, 0, 0.2 + (r * 3 + i) * 0.05) }) });
      sub(147, 190, '↔ np.zeros', at(c, 0, 0.6), { class: 'mono' });
      mono(360, 70, 'torch.randn(2, 3)', { 'font-size': 15, 'font-weight': 700, opacity: at(c, 0, 0.6) });
      grid(360, 84, RN, { style: (r, i, v) => ({ s: pp(c, 0, 0.7 + (r * 3 + i) * 0.05), fill: v[0] === '-' ? BADBG : ACCBG }) });
      sub(447, 190, '↔ np.random.randn  (값 예: seed 0)', at(c, 0, 1.1), { class: 'mono' });
      mono(680, 70, 'torch.arange(0, 10, 2)', { 'font-size': 15, 'font-weight': 700, opacity: at(c, 0, 1.2) });
      cells(680, 84, [0, 2, 4, 6, 8], { w: 46, h: 40, gap: 4, style: (i) => ({ s: pp(c, 0, 1.3 + i * 0.08) }) });
      sub(797, 148, '↔ np.arange', at(c, 0, 1.6), { class: 'mono' });
      if (k === 0) { sub(480, 300, '이름 앞에 torch. 만 붙이면 대부분 맞는다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      // k1: zeros_like
      fly(447, 200, 447, 262, seg(u, 0.4, 1.1), '(2,3) · float32 · cpu', { mono: true });
      mono(360, 246, 'like = torch.zeros_like(r)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      grid(360, 262, [['0.', '0.', '0.'], ['0.', '0.', '0.']], { style: (r, i) => ({ s: pop(u, 1.1 + (r * 3 + i) * 0.05), stroke: ACC, fill: ACCBG }) });
      card(780, 300, 250, 92, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 1.6) });
      ['shape  (2, 3)', 'dtype  float32', 'device cpu'].forEach((s, i) => mono(672, 278 + i * 23, s, { 'font-size': 14.5, fill: INK, opacity: fade(u, 1.7 + i * 0.12) }));
      sub(780, 372, 'r 에서 셋을 물려받는다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { // in-place
      mono(480, 92, 'x.add_(10)', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.2) });
      const v = [1, 2, 3].map((a) => a + 10 * E(u, 0.8, 1.6));
      zone(300, 130, 360, 100, 'x 의 메모리 (그대로)', { fill: SOFT, op: fade(u, 0.2) });
      row(480, 166, v.map((a) => a.toFixed(0) + '.'), { w: 70, h: 46, style: () => ({ stroke: u > 0.8 ? WARN : INK, fill: u > 0.8 && u < 1.8 ? WARNBG : PANEL }) });
      ['1.', '2.', '3.'].forEach((s, i) => mono(480 - 76 + i * 76, 270, s, { 'text-anchor': 'middle', 'font-size': 15, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 1.7) }));
      tx(480, 300, '이전 값은 사라졌다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      sub(480, 370, '밑줄로 끝나는 메서드는 새 텐서를 만들지 않고 제자리를 덮는다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { // in-place + autograd
      tx(60, 56, '실행해 본 예:  h = w.exp()  뒤에  h.add_(1)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.1) });
      node(130, 170, 'w', null, { r: 34, col: ACC, s: pop(u, 0.2) }); grow(166, 170, 266, 170, E(u, 0.3, 0.6), MUT);
      card(330, 170, 120, 44, { rx: 22, text: 'exp', fs: 16, mono: true, s: pop(u, 0.5) }); grow(392, 170, 494, 170, E(u, 0.6, 0.9), MUT);
      node(530, 170, 'h', null, { r: 34, s: pop(u, 0.8) });
      card(330, 250, 210, 42, { rx: 8, dash: '5 4', stroke: ACC, text: '역전파에 쓸 h 를 저장', fs: 14, color: ACC, s: pop(u, 1.0) });
      pill(700, 170, 'h.add_(1)', WARN, pop(u, 1.3), { mono: true, fs: 15 }); grow(650, 170, 570, 170, E(u, 1.4, 1.7), WARN);
      if (u > 1.7) cross(455, 250, 12, pop(u, 1.7));
      card(480, 352, 760, 56, { rx: 10, fill: BADBG, stroke: BAD, sw: 2, s: pop(u, 2.0) });
      mono(120, 347, 'RuntimeError: one of the variables needed for gradient', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) });
      mono(120, 368, 'computation has been modified by an inplace operation', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k4~8: base 에서 view / clone / detach
    const BY = 96, bw = 56, bx0 = 480 - (6 * bw + 5 * 6) / 2, bcx = (i) => bx0 + i * (bw + 6) + bw / 2;
    mono(480, 64, 'base = torch.arange(6.0, requires_grad=True)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: at(c, 4, 0.1) });
    cells(bx0, BY, ['0.', '1.', '2.', '3.', '4.', '5.'], { w: bw, h: 42, style: (i) => ({ s: pp(c, 4, 0.3 + i * 0.08), stroke: ACC, fill: ACCBG }) });
    if (k === 4) { sub(480, 230, '이 base 하나에서 세 가지로 파생시킨다', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      ['view', 'clone', 'detach'].forEach((s, i) => pill(200 + i * 280, 300, s, MUT, pop(u, 1.7 + i * 0.2), { mono: true, fs: 15 })); return; }
    const YY = 236, cs = 40;
    // view (2,3)
    const vx = 110, vcx = (i) => vx + (i % 3) * (cs + 4) + cs / 2, vcy = (i) => YY + Math.floor(i / 3) * (cs + 4) + cs / 2;
    mono(vx, YY - 20, 'v = base.view(2, 3)', { 'font-size': 14.5, 'font-weight': 700, opacity: at(c, 5, 0.1) });
    [0, 1, 2, 3, 4, 5].forEach((i) => { const g = at(c, 5, 0.6 + i * 0.08, 0.4); if (g > 0) el('line', { x1: bcx(i), y1: BY + 42, x2: lerp(bcx(i), vcx(i), g), y2: lerp(BY + 42, vcy(i) - cs / 2, g), stroke: OFF, 'stroke-width': 1.4 }); });
    grid(vx, YY, [['0.', '1.', '2.'], ['3.', '4.', '5.']], { w: cs, h: cs, style: (r, i) => ({ s: pp(c, 5, 0.3) }) });
    // clone (새 메모리)
    const cx0 = 360;
    if (k >= 6) { mono(cx0, YY - 20, 'c = base.clone()', { 'font-size': 14.5, 'font-weight': 700, opacity: at(c, 6, 0.1) });
      if (k === 6) [0, 1, 2, 3, 4, 5].forEach((i) => fly(bcx(i), BY + 62, cx0 + i * 44 + 20, YY + 20, seg(u, 0.3 + i * 0.06, 0.9 + i * 0.06), String(i) + '.', { mono: true, fill: INFO }));
      cells(cx0, YY, ['0.', '1.', '2.', '3.', '4.', '5.'], { w: cs, h: cs, gap: 4, style: (i) => ({ s: k > 6 ? 1 : u > 0.9 + i * 0.06 ? 1 : 0, stroke: INFO, fill: INFOBG }) }); }
    // detach (같은 메모리, 그래프 끊김)
    const dx0 = 650;
    if (k >= 7) { mono(dx0, YY - 20, 'd = base.detach()', { 'font-size': 14.5, 'font-weight': 700, opacity: at(c, 7, 0.1) });
      [0, 1, 2, 3, 4, 5].forEach((i) => { const g = at(c, 7, 0.4 + i * 0.06, 0.4); if (g > 0) el('line', { x1: bcx(i), y1: BY + 42, x2: lerp(bcx(i), dx0 + i * 44 + 20, g), y2: lerp(BY + 42, YY, g), stroke: OFF, 'stroke-width': 1.4 }); });
      cells(dx0, YY, ['0.', '1.', '2.', '3.', '4.', '5.'], { w: cs, h: cs, gap: 4, style: () => ({ s: pp(c, 7, 0.3) }) }); }
    // 아래 표식: 메모리 / 그래프
    const tag = (x, y, mem, memCol, gf, gfCol, s) => { pill(x, y, mem, memCol, s, { fs: 14 }); pill(x, y + 36, gf, gfCol, s, { mono: true, fs: 13.5 }); };
    tag(176, 344, '메모리 공유', MUT, 'ViewBackward0', ACC, pp(c, 5, 1.2));
    if (k >= 6) tag(490, 324, '새 메모리 (복사)', INFO, 'CloneBackward0', ACC, pp(c, 6, 1.3));
    if (k >= 7) { tag(780, 324, '메모리 공유', MUT, 'grad_fn = None', MUT, pp(c, 7, 1.0)); if (k === 7) cross(870, 360, 10, pop(u, 1.4)); }
    if (k === 5) sub(700, 280, '같은 칸을 다른 모양으로 본다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 8) { mono(176, 408, 'True', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      mono(490, 408, 'True', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      mono(780, 408, 'False', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.9) });
      tx(30, 408, 'requires_grad', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.2) }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'arr 로 shared = torch.from_numpy(arr) 를 만든 뒤 arr[0] = 99.0 을 하면 shared 는 어떻게 되는가?',
      o: ['그대로다. from_numpy 는 값을 복사해 둔다', 'shared[0] 도 99.0 이 된다', '에러가 난다. numpy 배열은 바꿀 수 없다'], a: 1,
      why: 'from_numpy 는 같은 메모리를 가리킬 뿐이다. 원본을 지키려면 .clone() 으로 새 메모리를 잡아야 한다.' },
    { q: 'a 는 GPU, b 는 CPU 에 있을 때 a + b 를 실행하면 어떻게 되는가?',
      o: ['b 가 자동으로 GPU 로 옮겨져 계산된다', '결과가 CPU 에 만들어진다', 'RuntimeError 가 난다'], a: 2,
      why: '연산에 들어가는 텐서는 같은 device 에 있어야 한다. b.to("cuda") 로 먼저 모으면 [4., 6.] 이 나온다.' },
    { q: 'x = torch.tensor(3.0, requires_grad=True), y = x ** 2 에서 y.backward() 뒤 x.grad 는 무엇인가?',
      o: ['tensor(6.)', 'tensor(9.)', 'None'], a: 0,
      why: 'y 가 grad_fn=PowBackward0 으로 출처를 기억하므로 dy/dx = 2x 가 계산된다. x=3 이면 6 이다.' },
    { q: 'float32 텐서와 float64 텐서를 더하면 결과 dtype 은 무엇인가?',
      o: ['float32 로 맞춰진다', 'float64 로 조용히 승격된다', 'dtype 이 달라 곧바로 에러가 난다'], a: 1,
      why: '에러 없이 float64 가 되므로 메모리가 두 배가 되고 원인도 잘 안 보인다. 경계에서 .float() 로 통일한다.' },
    { q: 'base 에서 만든 v = base.view(2,3), c = base.clone(), d = base.detach() 중 requires_grad 가 False 인 것은?',
      o: ['v', 'c', 'd'], a: 2,
      why: 'view 와 clone 은 그래프에 이어져 True 이고, detach 만 그래프에서 잘려 False 다. 메모리는 v 와 d 가 base 와 공유한다.' },
  ];

  const summary = [
    'torch.tensor 는 np.array 와 문법이 거의 같지만 from_numpy 는 메모리를 공유한다.',
    '텐서는 사는 곳(device)을 가지며 CPU 텐서와 GPU 텐서를 섞어 연산하면 에러가 난다.',
    'requires_grad=True 인 텐서는 grad_fn 을 남기고, x=3 에서 y=x² 의 x.grad 는 6 이다.',
    'torch 기본은 float32 이고 정수 텐서는 미분할 수 없으니 경계에서 .float() 로 맞춘다.',
  ];
  const review = [
    { q: 'numpy 로 읽은 데이터를 from_numpy 로 텐서로 만든 뒤 numpy 쪽을 정규화했더니 모델 입력도 바뀌었다. 먼저 의심할 것은?',
      o: ['GPU 로 옮기면서 값이 바뀌었다', 'from_numpy 가 같은 메모리를 공유한다', 'float64 가 float32 로 잘렸다'], a: 1,
      why: 'from_numpy 와 .numpy() 는 복사가 아니다. 원본을 따로 두려면 .clone() 으로 새 메모리를 잡는다.' },
    { q: 'from_numpy 로 만든 입력을 float32 모델에 넣었더니 dtype 이 맞지 않는다는 에러가 났다. 알맞은 처치는?',
      o: ['입력에 .float() 를 붙인다', '입력에 requires_grad=True 를 켠다', '입력을 .detach() 한다'], a: 0,
      why: 'numpy 기본이 float64 라 텐서도 float64 로 넘어온다. 데이터가 들어오는 경계에서 .float() 로 맞춘다.' },
    { q: '검증할 때 모델 출력을 기록 없이 쓰고 싶다. 가장 알맞은 것은?',
      o: ['출력마다 .clone() 을 붙인다', 'x.add_() 같은 in-place 연산으로 메모리를 아낀다', 'with torch.no_grad(): 블록 안에서 예측한다'], a: 2,
      why: 'no_grad 블록 안 연산은 grad_fn 을 남기지 않아 requires_grad 가 False 다. clone 은 그래프 연결을 유지한다.' },
  ];

  R.page({ title: '텐서 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
