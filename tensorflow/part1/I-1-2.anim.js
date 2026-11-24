/* I-1-2 텐서·변수·즉시 실행 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 값은 venv(tensorflow-cpu 2.21)로 코드 블록을 다시 돌려 확인했다:
 *   A+10, A*A, matmul → [[4,5],[10,11]], reduce_sum axis0 [5,7,9] / axis1 [6,15], mean 3.5, A+bias [[11,22,33],[14,25,36]]
 *   assign_add 결과 [0.59999996, 0.15] / GradientTape dy/dw 6.0, watch 없으면 None / SGD 0.1 한 걸음 w 3.0 → 2.6
 *   루프 밖 Variable 에 0.1 을 1000번 더하면 99.99905 (float32) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, cells, zone,
    cross, check, lock, terminal, axes, person, spans, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const f1 = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(v));
  // 행렬: m[r][c], 칸 w×h, o.style(r,c) → {fill, stroke, color, op, s}
  function mat(x, y, m, o) { o = o || {}; const w = o.w || 54, h = o.h || 42, gap = o.gap ?? 5;
    m.forEach((row, r) => row.forEach((v, c) => { const st = (o.style && o.style(r, c)) || {};
      card(x + c * (w + gap) + w / 2, y + r * (h + gap) + h / 2, w, h, { rx: 6, text: v == null ? '' : (o.fmt ? o.fmt(v) : String(v)), fs: o.fs || 15, mono: true, fw: 700,
        fill: st.fill, stroke: st.stroke || INK, color: st.color, op: st.op, s: st.s, sw: st.sw || 2, dash: st.dash }); }));
    return { w: m[0].length * (w + gap) - gap, h: m.length * (h + gap) - gap }; }
  // 넘파이 · 텐서플로 두 세계
  function worlds(op) { zone(20, 20, 452, 380, 'TensorFlow 세계', { op, color: ACC }); zone(488, 20, 452, 380, 'NumPy 세계', { op, color: INFO }); }
  // 텐서 카드: 값 · shape · dtype 을 한 묶음으로
  function tensorCard(cx, cy, fillU, o) { o = o || {}; const op = o.op ?? 1;
    card(cx, cy, 300, 214, { rx: 14, stroke: ACC, sw: 2.5, fill: PANEL, op });
    mono(cx - 136, cy - 82, o.name || 'x  tf.Tensor', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: op });
    const V = [[1, 2], [3, 4]];
    mat(cx - 62, cy - 62, V, { w: 60, h: 46, fmt: (v) => v.toFixed(1), style: (r, c) => { const s = clamp(fillU * 4 - (r * 2 + c)); return { op: op * (s > 0 ? 1 : 0.35), s: s > 0 ? 0.7 + 0.3 * s : 1, fill: s > 0 ? ACCBG : PANEL, stroke: s > 0 ? ACC : GRID }; } });
    if (fillU >= 1) { pill(cx - 62, cy + 76, 'shape (2, 2)', o.hiShape ? WARN : MUT, 1, { mono: true, fs: 13.5, op });
      pill(cx + 70, cy + 76, 'float32', o.hiDtype ? WARN : MUT, 1, { mono: true, fs: 13.5, op });
      if (o.lock) lock(cx + 126, cy - 86, true, MUT, 0.9); } }

  // =========================================================
  // 1. tf.constant — 값·shape·dtype
  // =========================================================
  const PR = ['>>> print(x)', 'tf.Tensor(', '[[1. 2.]', ' [3. 4.]], shape=(2, 2), dtype=float32)'];
  function s1(t, c) { const { k, u } = c;
    if (k <= 5) { worlds(k === 0 ? fade(u, 0.1) : 1);
      if (k === 0) { pill(246, 80, 'import tensorflow as tf', ACC, pop(u, 0.5), { mono: true, fs: 15 }); pill(714, 80, 'import numpy as np', INFO, pop(u, 0.3), { mono: true, fs: 15 });
        card(246, 220, 300, 160, { rx: 14, stroke: GRID, dash: '6 5', fill: 'none', s: pop(u, 1.0) });
        mono(246, 214, 'x = ?', { 'font-size': 20, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
        tx(246, 244, '텐서는 다음 줄에서 만들어진다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
        tx(480, 364, '이 장은 두 세계를 오가며 값 · shape · dtype 을 함께 본다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
      const fillU = k === 1 ? E(u, 0.3, 1.6) : 1;
      tensorCard(246, 190, fillU, { lock: k >= 1 && fillU >= 1, hiShape: k === 3, hiDtype: k === 3 });
      if (k === 1) { pill(246, 340, 'x = tf.constant([[1., 2.], [3., 4.]])', ACC, pop(u, 0.1), { mono: true, fs: 13.5 });
        tx(714, 180, '쓰는 그 자리에서 값이 확정된다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
        ['placeholder', 'Session', 'feed_dict'].forEach((s, i) => { const op = fade(u, 1.9 + i * 0.15); card(714, 230 + i * 44, 170, 34, { rx: 8, text: s, fs: 14, mono: true, stroke: GRID, color: MUT, op }); if (op > 0) el('line', { x1: 638, y1: 230 + i * 44, x2: 790, y2: 230 + i * 44, stroke: BAD, 'stroke-width': 2.2, opacity: op }); });
        return; }
      if (k === 2) { terminal(504, 96, 420, 150, PR, lerp(0, 4, E(u, 0.2, 1.8)), { title: 'python', fs: 14 });
        tx(714, 290, '값 · shape · dtype 이 한 줄에', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
        sub(714, 318, 'TF1 의 Tensor("add:0") 좌절이 사라졌다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      if (k === 3) { // shape 괄호와 dtype
        el('path', { d: 'M168,132 l-10,0 l0,96 l10,0', fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 0.3) }); tx(150, 186, '2', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 0.4) });
        el('path', { d: 'M184,116 l0,-8 l124,0 l0,8', fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 0.6) }); tx(246, 100, '2', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
        [['x.shape', '(2, 2)'], ['x.dtype', "<dtype: 'float32'>"]].forEach(([a, b], i) => { const y = 140 + i * 70, op = fade(u, 0.9 + i * 0.5);
          mono(540, y, a, { 'font-size': 16, 'font-weight': 700, opacity: op }); mono(660, y, '→ ' + b, { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: op }); });
        card(714, 320, 380, 60, { rx: 12, text: 'shape → dtype → 값 순서로 본다', fs: 16, stroke: WARN, fill: WARNBG, s: pop(u, 2.0) }); return; }
      if (k === 4 || k === 5) { const f = k === 4 ? E(u, 0.4, 1.5) : 1;
        fly(246, 190, 714, 190, k === 4 ? seg(u, 0.4, 1.5) : 0, 'x.numpy()', { mono: true, fill: INFO });
        if (f >= 1) { card(714, 190, 240, 150, { rx: 12, stroke: INFO, fill: INFOBG });
          mono(714, 140, 'arr  np.ndarray', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
          mat(714 - 57, 160, [[1, 2], [3, 4]], { w: 54, h: 36, fmt: (v) => v.toFixed(1), style: () => ({ stroke: INFO }) });
          mono(714, 300, "<class 'numpy.ndarray'>", { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 1.6) : 1 }); }
        if (k === 4) { sub(246, 340, '꺼내도 원본 텐서는 그대로 (불변)', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
        const g = seg(u, 0.4, 1.4);
        el('path', { d: 'M714,314 C714,390 400,390 330,356', fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.2) });
        fly(714, 330, 246, 350, g, 'tf.convert_to_tensor(arr)', { mono: true });
        if (g >= 1) { pill(246, 350, 'y  tf.Tensor · float32', ACC, pop(u, 1.4), { mono: true, fs: 14 }); }
        tx(714, 384, '전처리는 넘파이, 학습은 텐서', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    }
    // k6, k7: dtype 함정
    const ca = k === 7 ? E(u, 0.3, 1.1) : 0;
    card(200, 120, 160, 70, { rx: 12, stroke: ca > 0.5 ? ACC : INFO, fill: ca > 0.5 ? ACCBG : INFOBG, s: k === 6 ? pop(u, 0.2) : 1 });
    mono(200, 116, ca > 0.5 ? '3.0' : '3', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ca > 0.5 ? ACC : INFO });
    mono(200, 142, ca > 0.5 ? 'float32' : 'int32', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
    tx(200, 66, 'a = tf.constant(3)', { 'font-size': 14.5, 'text-anchor': 'middle', class: 'mono', opacity: k === 6 ? fade(u, 0.2) : 1 });
    card(500, 120, 160, 70, { rx: 12, stroke: ACC, fill: ACCBG, s: k === 6 ? pop(u, 0.6) : 1 });
    mono(500, 116, '3.0', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); mono(500, 142, 'float32', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
    tx(500, 66, 'b = tf.constant(3.0)', { 'font-size': 14.5, 'text-anchor': 'middle', class: 'mono', opacity: k === 6 ? fade(u, 0.6) : 1 });
    tx(350, 130, '+', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle' });
    if (k === 6) { const hit = E(u, 1.0, 1.4);
      if (hit > 0) { cross(350, 128, 16, pop(u, 1.3)); }
      card(480, 290, 760, 104, { rx: 12, stroke: BAD, fill: BADBG, s: pop(u, 1.4) });
      mono(130, 272, 'InvalidArgumentError', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
      mono(130, 300, 'cannot compute AddV2 as input #1 was expected', { 'font-size': 14, fill: INK, opacity: fade(u, 1.7) });
      mono(130, 322, 'to be a int32 tensor but is a float tensor', { 'font-size': 14, fill: INK, opacity: fade(u, 1.8) });
      tx(760, 130, '정수 리터럴 → int32', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); tx(760, 156, '실수 리터럴 → float32', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    pill(200, 200, 'tf.cast(a, tf.float32)', ACC, pop(u, 0.2), { mono: true, fs: 14 });
    tx(620, 130, '=', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
    card(760, 120, 160, 70, { rx: 12, stroke: GOOD, fill: GOODBG, s: pop(u, 1.5) });
    mono(760, 116, '6.0', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.5) }); mono(760, 142, 'float32', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) });
    terminal(180, 250, 600, 80, ['>>> print(c)', ['tf.Tensor(6.0, shape=(), dtype=float32)', 'var(--good)']], lerp(0, 2, E(u, 1.6, 2.4)), { title: 'python' });
    sub(480, 372, 'dtype 기본값 · 정수 int32, 실수 float32 · 섞을 땐 cast', fade(u, 2.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 2. tf.Variable — assign 으로 바뀌는 상태
  // =========================================================
  function wCells(vals, o) { o = o || {}; vals.forEach((v, i) => { const x = 140 + i * 140;
      card(x, 170, 120, 70, { rx: 12, stroke: o.col || ACC, fill: o.fill || ACCBG, sw: 2.5, s: o.s ?? 1 });
      mono(x, 178, typeof v === 'string' ? v : v.toFixed(2).replace(/0$/, '').replace('-', '−'), { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: o.col || ACC, opacity: o.s ?? 1 }); }); }
  function history(steps, n, u, fresh) { tx(560, 80, '바뀐 기록', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    steps.slice(0, n).forEach((s, i) => { const y = 112 + i * 52, op = fresh && i === n - 1 ? fade(u, 0.3) : 1;
      el('rect', { x: 556, y: y - 22, width: 380, height: 40, rx: 8, fill: i === n - 1 ? ACCBG : SOFT, opacity: op });
      mono(570, y + 4, s.op, { 'font-size': 14, opacity: op }); mono(920, y + 4, '[' + s.values.map((v) => String(v)).join(', ') + ']', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: op }); }); }
  function s2(t, c) { const { k, u } = c, V = c.beat.variable || {}, steps = V.steps || [], pv = (c.prev && c.prev.variable && c.prev.variable.steps) || [];
    if (k <= 2) { const cur = steps[steps.length - 1].values, was = pv.length ? pv[pv.length - 1].values : cur;
      tx(40, 80, 'w = tf.Variable', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      history(steps, steps.length, u, steps.length > pv.length);
      if (k === 0) { wCells(cur, { s: pop(u, 0.3) }); pill(210, 266, 'trainable = True', GOOD, pop(u, 1.0), { mono: true, fs: 14 });
        mono(40, 330, "<tf.Variable 'Variable:0' shape=(2,) dtype=float32,", { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) });
        mono(40, 352, ' numpy=array([ 0.5, -0.2], dtype=float32)>', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.7) }); return; }
      if (k === 1) { const f = E(u, 0.4, 1.3);
        was.forEach((v, i) => mono(140 + i * 140, lerp(178, 260, f), v.toFixed(1).replace('-', '−'), { 'font-size': 22, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle', opacity: 1 - f, 'text-decoration': 'line-through' }));
        card(140, 170, 120, 70, { rx: 12, stroke: ACC, sw: 2.5 }); card(280, 170, 120, 70, { rx: 12, stroke: ACC, sw: 2.5 });
        cur.forEach((v, i) => mono(140 + i * 140, lerp(90, 178, f), v.toFixed(1), { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: f }));
        tx(210, 300, '현재 값을 무시하고 덮어쓴다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
        sub(210, 330, 'w = [...] 로 다시 대입하면 파이썬 이름만 바뀐다', fade(u, 1.9), { 'font-size': 14 }); return; }
      const add = [-0.3, 0.05];
      wCells([tween(was[0], cur[0], u, 1.4), tween(was[1], cur[1], u, 1.4)]);
      add.forEach((d, i) => { const g = seg(u, 0.1, 0.9); if (g > 0 && g < 1) fly(140 + i * 140, 90, 140 + i * 140, 160, g, (d > 0 ? '+' : '−') + Math.abs(d), { mono: true, fill: WARN }); });
      tx(210, 300, '현재 값에 더한다 · 학습의 갱신 한 걸음', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      mono(210, 332, 'print(w.numpy()) → [0.59999996 0.15]', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(210, 358, 'float32 반올림이라 0.6 이 0.59999996 으로 찍힌다', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    if (k === 3) { wCells([0.6, 0.15], { s: 1 }); tx(40, 80, 'w = tf.Variable', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      pill(210, 266, 'assign · assign_add 가능', GOOD, 1, { fs: 14 });
      tx(560, 80, 'c = tf.constant([1.0, 2.0])', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) });
      [1.0, 2.0].forEach((v, i) => card(640 + i * 140, 170, 120, 70, { rx: 12, text: v.toFixed(1), fs: 22, mono: true, stroke: INK, s: pop(u, 0.3 + i * 0.15) }));
      lock(850, 120, true, INK, pop(u, 0.8));
      fly(710, 330, 710, 214, seg(u, 1.0, 1.6), 'c.assign([...])', { mono: true, fill: BAD });
      if (u > 1.6) { cross(710, 266, 12, pop(u, 1.6)); mono(710, 306, 'AttributeError: … no attribute \'assign\'', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
      sub(480, 390, '학습되는 값이면 Variable, 고정 상수면 constant', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4, k5: Dense 층 안의 Variable
    pill(240, 44, 'Dense(3).build(input_shape=(None, 4))', INK, k === 4 ? pop(u, 0.1) : 1, { mono: true, fs: 13.5 });
    const ku = k === 4 ? E(u, 0.3, 1.6) : 1;
    tx(70, 92, 'kernel  (4, 3)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC });
    for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) { const s = clamp(ku * 12 - (r * 3 + q)); el('rect', { x: 70 + q * 56, y: 106 + r * 46, width: 50, height: 40, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: s }); }
    tx(290, 92, 'bias  (3,)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: k === 4 ? fade(u, 1.4) : 1 });
    for (let q = 0; q < 3; q++) el('rect', { x: 290 + q * 56, y: 106, width: 50, height: 40, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: k === 4 ? fade(u, 1.5 + q * 0.1) : 1 });
    if (k === 4) { mono(290, 200, 'kernel (4, 3) True', { 'font-size': 14.5, opacity: fade(u, 1.8) }); mono(290, 224, 'bias (3,) True', { 'font-size': 14.5, opacity: fade(u, 1.9) });
      tx(290, 270, '둘 다 trainable 한 Variable', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      card(720, 200, 300, 140, { rx: 14, stroke: GRID, s: pop(u, 2.0) });
      tx(720, 184, '모델을 열어 보면', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1) });
      tx(720, 212, 'Variable 목록이 있다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      sub(720, 240, '학습 = 이 목록을 갱신하는 일', fade(u, 2.4), { 'font-size': 14 }); return; }
    // k5: trainable=False 는 옵티마이저가 건너뛴다
    card(720, 126, 200, 60, { rx: 12, text: 'freeze = 1.0', fs: 18, mono: true, stroke: INFO, fill: INFOBG, s: pop(u, 0.2) });
    pill(720, 182, 'trainable = False', INFO, pop(u, 0.4), { mono: true, fs: 14 });
    person(560, 340, '옵티마이저', { s: pop(u, 0.5) });
    grow(540, 310, 210, 300, E(u, 0.8, 1.4), GOOD); grow(560, 304, 370, 156, E(u, 0.9, 1.5), GOOD);
    grow(590, 310, 690, 214, E(u, 1.3, 1.8) * 0.7, BAD, { plain: true });
    if (u > 1.8) cross(670, 240, 11, pop(u, 1.8));
    tx(790, 290, '갱신 대상에서 빠진다', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.0) });
    tx(790, 314, '전이학습에서 층을 얼릴 때', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) });
    sub(240, 400, 'model.trainable_variables = trainable=True 인 Variable 들', fade(u, 2.3), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 3. 연산 · reduce · 브로드캐스팅
  // =========================================================
  const A = [[1, 2, 3], [4, 5, 6]], AX = 70, AY = 120;
  function matA(o) { o = o || {}; return mat(AX, AY, A, Object.assign({ fmt: f1, style: (r, c) => ({ fill: o.hi && o.hi(r, c) ? ACCBG : PANEL, stroke: o.hi && o.hi(r, c) ? ACC : INK, s: o.s ? o.s(r, c) : 1, op: o.op }) }, o.m || {})); }
  function s3(t, c) { const { k, u } = c;
    tx(AX, AY - 22, 'A  (2, 3)', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    if (k === 0) { matA({ s: (r, q) => pop(u, 0.2 + (r * 3 + q) * 0.15) });
      tx(AX - 12, AY + 26, '샘플 1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.3) }); tx(AX - 12, AY + 73, '샘플 2', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      tx(AX + 87, AY + 120, '특성 3개', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      card(640, 170, 420, 110, { rx: 14, stroke: GRID, s: pop(u, 1.8) });
      tx(640, 160, 'shape 을 먼저 읽는다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      mono(640, 190, '(2, 3) = 샘플 2개 × 특성 3개', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { matA();
      tx(420, 100, 'A + 10', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: INFO, opacity: fade(u, 0.2) });
      mat(420, 112, [[11, 12, 13], [14, 15, 16]], { fmt: f1, w: 60, style: (r, q) => ({ stroke: INFO, s: pop(u, 0.3 + (r * 3 + q) * 0.08) }) });
      tx(420, 262, 'A * A  (같은 칸끼리 곱)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 1.0) });
      mat(420, 274, [[1, 4, 9], [16, 25, 36]], { fmt: f1, w: 60, style: (r, q) => ({ stroke: ACC, s: pop(u, 1.1 + (r * 3 + q) * 0.08) }) });
      sub(800, 200, '스칼라 10 이 모든 칸으로', fade(u, 0.8), { 'font-size': 14 });
      sub(800, 362, '* 는 행렬곱이 아니다', fade(u, 1.8), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 2) { matA({ hi: (r, q) => r === 0 && u > 0.6 });
      tx(310, 100, 'B  (3, 2)', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.2) });
      mat(310, 112, [[1, 0], [0, 1], [1, 1]], { fmt: f1, w: 48, h: 38, style: (r, q) => ({ s: pop(u, 0.2 + r * 0.1), fill: q === 0 && u > 0.6 ? ACCBG : PANEL, stroke: q === 0 && u > 0.6 ? ACC : INK }) });
      tx(470, 186, '=', { 'font-size': 28, 'font-weight': 800, opacity: fade(u, 1.0) });
      tx(510, 100, 'A @ B  (2, 2)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 1.1) });
      mat(510, 120, [[4, 5], [10, 11]], { fmt: f1, w: 60, style: (r, q) => ({ s: pop(u, 1.2 + (r * 2 + q) * 0.12), fill: r === 0 && q === 0 ? ACCBG : PANEL, stroke: r === 0 && q === 0 ? ACC : INK }) });
      mono(70, 300, '1·1 + 2·0 + 3·1 = 4', { 'font-size': 15, fill: ACC, opacity: fade(u, 1.3) });
      spans(70, 350, [['(2, ', {}], ['3', { fill: WARN, 'font-weight': 800 }], [') · (', {}], ['3', { fill: WARN, 'font-weight': 800 }], [', 2) → (2, 2)', {}]], { 'font-size': 17, opacity: fade(u, 1.8) });
      tx(700, 300, '안쪽 차원이 같아야 곱해진다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(700, 326, '결과에는 바깥 차원만 남는다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 3 || k === 4) { // reduce: 축 접기
      const ax0 = k === 3 ? E(u, 0.4, 1.4) : 1;
      if (k === 3) { matA({ m: { w: 60 } });
        [0, 1, 2].forEach((q) => { const x = AX + q * 65 + 30; grow(x, AY + 96, x, AY + 132, ax0, ACC); });
        mat(AX, AY + 150, [[5, 7, 9]], { fmt: f1, w: 60, style: (r, q) => ({ s: pop(u, 1.3 + q * 0.12), fill: ACCBG, stroke: ACC }) });
        mono(AX, AY + 230, 'axis=0 → [5. 7. 9.]', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
        tx(640, 170, '0번 축(행)을 접는다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        tx(640, 198, '행이 사라지고 열별 합만 남는다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.3) });
        tx(640, 250, '배치 평균 손실이 쓰는 축', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
      matA({ m: { w: 60 } });
      [0, 1].forEach((r) => { const y = AY + 21 + r * 47; grow(AX + 196, y, AX + 236, y, E(u, 0.3, 1.0), INFO); });
      mat(AX + 250, AY, [[6], [15]], { fmt: f1, w: 60, style: (r) => ({ s: pop(u, 1.0 + r * 0.15), fill: INFOBG, stroke: INFO }) });
      mono(AX, AY + 150, 'axis=0 → [5. 7. 9.]', { 'font-size': 15, fill: MUT });
      mono(AX, AY + 180, 'axis=1 → [6. 15.]', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.3) });
      mono(AX, AY + 216, 'reduce_mean(A) → 3.5', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.9) });
      tx(660, 170, '1번 축(열)을 접는다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      tx(660, 198, '행마다 하나씩 남는다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.1) });
      tx(660, 250, 'axis 를 생략하면 전부 접어 스칼라', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 5) { matA({ m: { w: 60 } });
      const bias = [10, 20, 30], f = E(u, 0.6, 1.4);
      tx(AX, 72, 'bias  (3,)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: WARN, opacity: fade(u, 0.1) });
      [0, 1].forEach((r) => mat(AX + 260, lerp(AY - 70, AY + r * 47, r === 0 ? f : E(u, 0.9, 1.7)), [bias], { fmt: f1, w: 56, h: 42, style: () => ({ stroke: WARN, fill: WARNBG, op: r === 0 ? 1 : fade(u, 0.9), dash: r ? '5 4' : null }) }));
      tx(AX + 240, AY + 50, '+', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle' });
      tx(AX + 450, AY + 50, '=', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      mat(AX + 480, AY, [[11, 22, 33], [14, 25, 36]], { fmt: f1, w: 60, style: (r, q) => ({ s: pop(u, 1.8 + (r * 3 + q) * 0.06), stroke: ACC }) });
      tx(480, 330, '(3,) 를 (1, 3) 으로 보고 매 행에 늘려 더한다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      sub(480, 360, '뒤 차원부터 맞추고 1 이면 늘린다 · 넘파이와 같은 규칙', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    // k6: PyTorch 표기 대응 + reshape
    const map = (c.beat.ops && c.beat.ops.mapping) || [];
    tx(500, 74, 'PyTorch', { 'font-size': 15, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle' }); tx(800, 74, 'TensorFlow', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    map.forEach((m, i) => { const y = 112 + i * 52, op = fade(u, 0.2 + i * 0.25);
      mono(500, y, m.torch, { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); grow(590, y - 5, 690, y - 5, E(u, 0.3 + i * 0.25, 0.7 + i * 0.25), ACC);
      mono(800, y, m.tf, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: op }); });
    matA({ op: 0.25, m: { w: 44, h: 34 } });
    tx(AX, 230, 'tf.reshape(A, (3, 2))', { 'font-size': 14.5, class: 'mono', 'font-weight': 700, opacity: fade(u, 1.5) });
    mat(AX, 246, [[1, 2], [3, 4], [5, 6]], { fmt: f1, w: 50, h: 34, style: (r, q) => ({ s: pop(u, 1.6 + (r * 2 + q) * 0.08), stroke: ACC }) }); }

  // =========================================================
  // 4. GradientTape — 기록하고 되감는다
  // =========================================================
  function reel(cx, cy, spin) { el('circle', { cx, cy, r: 22, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }); for (let i = 0; i < 3; i++) { const a = spin + i * 2.09; el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * 16, y2: cy + Math.sin(a) * 16, stroke: MUT, 'stroke-width': 2 }); } }
  function tape(x, y, items, rec, back, t) { const cw = 120, n = items.length; reel(x - 26, y + 20, (back ? -1 : 1) * t * 3); reel(x + n * cw + 26, y + 20, (back ? -1 : 1) * t * 3);
    el('rect', { x, y, width: n * cw, height: 40, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    items.forEach((s, i) => { const on = clamp(rec * n - i); if (on <= 0) return; el('rect', { x: x + i * cw + 3, y: y + 4, width: cw - 6, height: 32, rx: 4, fill: back ? BADBG : ACCBG, opacity: on });
      mono(x + i * cw + cw / 2, y + 25, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: back ? BAD : ACC, opacity: on }); }); }
  function varBox(cx, cy, name, val, auto, s) { card(cx, cy, 170, 70, { rx: 12, stroke: auto ? ACC : INK, fill: auto ? ACCBG : PANEL, sw: 2.5, s });
    mono(cx, cy - 4, val, { 'font-size': 21, 'font-weight': 800, 'text-anchor': 'middle', fill: auto ? ACC : INK, opacity: s }); tx(cx, cy + 22, name, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); }
  function eye(cx, cy, open, col, s) { const g = R.G(cx, cy, s ?? 1); el('path', { d: 'M-18,0 Q0,-14 18,0 Q0,14 -18,0 Z', fill: PANEL, stroke: col, 'stroke-width': 2.5 }, g); if (open) el('circle', { cx: 0, cy: 0, r: 5, fill: col }, g); else el('line', { x1: -20, y1: 12, x2: 20, y2: -12, stroke: col, 'stroke-width': 2.5 }, g); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { varBox(150, 110, 'tf.Variable', 'w = 3.0', true, k === 0 ? pop(u, 0.2) : 1);
      eye(260, 110, true, ACC, k === 0 ? pop(u, 0.8) : 1); tx(290, 116, '테이프가 자동으로 지켜본다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 1.0) : 1 });
      if (k === 0) { sub(480, 300, 'Variable 이면 tape.watch 를 부를 필요가 없다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      mono(90, 210, 'with tf.GradientTape() as tape:', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      const rec = k === 1 ? E(u, 0.4, 1.8) : 1;
      tape(150, 232, ['w = 3.0', 'w * w', 'y = 9.0'], rec, k === 2, t);
      if (k === 1) { dot([[150, 252], [510, 252]], seg(u, 0.4, 1.8), ACC, 7); sub(330, 316, '블록 안의 연산만 남는다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      dot([[510, 252], [150, 252]], seg(u, 0.2, 1.3), BAD, 7);
      pill(330, 316, 'tape.gradient(y, w)', BAD, pop(u, 1.2), { mono: true, fs: 14 });
      card(740, 252, 260, 120, { rx: 14, stroke: GOOD, fill: GOODBG, s: pop(u, 1.5) });
      mono(740, 238, 'dy/dw = 2w', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      mono(740, 274, '= 6.0', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) });
      sub(480, 390, '식을 손으로 미분하지 않았는데 답이 나왔다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3 || k === 4) { varBox(180, 110, 'tf.Variable', 'w = 3.0', true, 1); eye(290, 110, true, ACC, 1);
      varBox(180, 250, 'tf.constant', 'x = 3.0', k === 4 && u > 0.9, 1);
      const watched = k === 4 && u > 0.9; eye(290, 250, watched, watched ? ACC : MUT, 1);
      if (k === 3) { tx(330, 256, '기본으로는 지켜보지 않는다', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4) });
        terminal(560, 196, 360, 110, ['>>> tape.gradient(z, x)', ['None', 'var(--bad)']], lerp(0, 2, E(u, 0.8, 1.8)), { title: 'watch 없이' });
        sub(480, 380, '같은 3.0 이라도 constant 는 학습 대상이 아니라고 본다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      pill(180, 330, 'tape.watch(x)', ACC, pop(u, 0.3), { mono: true, fs: 15 }); grow(180, 312, 180, 290, E(u, 0.5, 0.9), ACC);
      terminal(560, 196, 360, 110, ['>>> tape.gradient(z, x)', ['tf.Tensor(6.0, shape=(), dtype=float32)', 'var(--good)']], lerp(0, 2, E(u, 1.0, 2.0)), { title: 'watch 한 뒤', fs: 13.5 });
      sub(480, 390, '입력에 대한 미분이 필요하면 직접 watch 를 부른다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5, k6: 손실 곡선 위 한 걸음
    const ax = axes(90, 60, 420, 280, { x: [-1, 4], y: [0, 9], xt: [-1, 0, 1, 2, 3, 4], yt: [0, 4, 9], xl: 'w', yl: 'loss = (w − 1)²', grid: true });
    const pts = []; for (let i = 0; i <= 50; i++) { const w = -1 + i / 10; pts.push([w, (w - 1) ** 2]); }
    R.line(ax, pts, k === 5 ? E(u, 0.2, 1.2) : 1, INK, { sw: 2.5 });
    el('circle', { cx: ax.X(1), cy: ax.Y(0), r: 5, fill: GOOD, opacity: k === 5 ? fade(u, 1.2) : 1 });
    tx(ax.X(1), ax.Y(0) - 14, '최소 w = 1', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: k === 5 ? fade(u, 1.3) : 1 });
    const w = k === 5 ? 3.0 : tween(3.0, 2.6, u, 1.0), L = (w - 1) ** 2;
    if (k === 5) { const s = E(u, 1.5, 2.1), d = 0.6; el('line', { x1: ax.X(3 - d), y1: ax.Y(4 - 4 * d), x2: ax.X(3 - d + 2 * d * s), y2: ax.Y(4 - 4 * d + 8 * d * s), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }); }
    el('circle', { cx: ax.X(w), cy: ax.Y(L), r: 8, fill: ACC, opacity: k === 5 ? fade(u, 1.2) : 1 });
    pill(760, 60, 'SGD(learning_rate=0.1)', INK, k === 5 ? pop(u, 0.4) : 1, { mono: true, fs: 14 });
    const rows = k === 5 ? [['w', '3.0'], ['loss', '4.0'], ['기울기 2(w − 1)', '4.0']] : [['w ← 3.0 − 0.1 × 4.0', ''], ['새 w', w.toFixed(2)], ['새 loss', L.toFixed(2)]];
    rows.forEach(([a, b], i) => { const y = 140 + i * 50, op = k === 5 ? fade(u, 1.2 + i * 0.35) : fade(u, 0.2 + i * 0.3);
      tx(600, y, a, { 'font-size': 15.5, 'font-weight': 700, class: i === 0 && k === 6 ? 'mono' : null, opacity: op }); if (b) mono(920, y, b, { 'font-size': 18, 'font-weight': 800, fill: i === 2 && k === 5 ? BAD : ACC, 'text-anchor': 'end', opacity: op }); });
    if (k === 6) tx(760, 330, 'apply_gradients 한 번 · 1 에 한 걸음', { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) }); }

  // =========================================================
  // 5. 실무 감각 — Variable 은 밖에서, 디버깅은 shape 부터
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tx(60, 60, 'for step in range(1000):  w = tf.Variable(0.0); w.assign_add(0.1)', { 'font-size': 14.5, class: 'mono', fill: BAD });
      for (let i = 0; i < 5; i++) { const s = pop(u, 0.3 + i * 0.35), x = 120 + i * 170, done = u > 0.6 + i * 0.35;
        mono(x, 120, `step ${i}`, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: s });
        card(x, 180, 120, 64, { rx: 12, text: done ? '0.1' : '0.0', fs: 22, mono: true, stroke: BAD, fill: BADBG, color: BAD, s, op: i < 4 && u > 0.9 + i * 0.35 ? 0.35 : 1 });
        tx(x, 236, '새 Variable', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); }
      card(480, 320, 520, 70, { rx: 12, stroke: BAD, s: pop(u, 2.0) });
      tx(480, 314, '매번 0.1 로 리셋 · 누적이 안 된다', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      tx(480, 340, '느린 것보다 학습이 아예 안 쌓이는 게 더 큰 문제', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    if (k === 1 || k === 2) { const n = k === 2 ? Math.round(lerp(0, 1000, E(u, 0.2, 2.2))) : 0;
      zone(380, 120, 540, 230, 'for step in range(1000):', { color: MUT });
      card(170, 200, 180, 90, { rx: 14, stroke: GOOD, fill: GOODBG, sw: 3, s: k === 1 ? pop(u, 0.3) : 1 });
      mono(170, 206, k === 2 ? (n >= 1000 ? '99.99905' : (n * 0.1).toFixed(1)) : '0.0', { 'font-size': n >= 1000 ? 20 : 24, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
      tx(170, 270, 'w  루프 밖에서 1번', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      if (k === 1) { tx(650, 220, '여기선 만들지 않는다', { 'font-size': 16, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        sub(480, 395, '모델 가중치도 같은 이유로 __init__ 에서 만든다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      for (let i = 0; i < 6; i++) dot([[650, 240], [262, 210]], ((t * 1.2 + i / 6) % 1) * (u < 2.2 ? 1 : 0), ACC, 5);
      card(650, 240, 220, 54, { rx: 10, text: 'w.assign_add(0.1)', fs: 15, mono: true, stroke: ACC });
      mono(650, 310, `step ${n} / 1000`, { 'font-size': 15, fill: MUT, 'text-anchor': 'middle' });
      hbar(400, 70, 420, n, 1000, { h: 16, text: '' + n, label: false });
      if (u > 2.2) sub(480, 395, 'float32 라 정확히 100 이 아니라 99.99905 · 그래도 상태는 쌓인다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const ops = ['assign_add', 'assign_add', 'assign_add', 'assign_add'];
      tx(70, 70, 'eager', { 'font-size': 16, 'font-weight': 800, fill: WARN });
      ops.forEach((o, i) => { const x = 130 + i * 95; card(x, 120, 84, 34, { rx: 8, text: '연산', fs: 14, stroke: WARN, s: pop(u, 0.2 + i * 0.15) });
        el('path', { d: `M${x - 20},${104} Q${x},${60} ${x + 20},${104}`, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 0.4 + i * 0.15) }); });
      tx(300, 186, '연산마다 파이썬을 왕복한다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) });
      tx(70, 250, '@tf.function', { 'font-size': 16, 'font-weight': 800, fill: ACC, class: 'mono', opacity: fade(u, 1.3) });
      card(300, 300, 380, 50, { rx: 10, text: '그래프 한 번에 실행', fs: 15.5, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 1.4) });
      el('path', { d: 'M150,282 Q300,236 450,282', fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 1.6) });
      card(740, 200, 320, 150, { rx: 14, stroke: GRID, s: pop(u, 1.8) });
      tx(740, 180, '작은 연산 × 아주 많은 반복', { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(740, 206, '이면 왕복 비용이 쌓인다', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(740, 240, '자세한 원리는 I-2-1', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    // k4, k5: 디버깅 루틴
    tx(80, 70, 'x = tf.constant([[1., 2., 3.]])', { 'font-size': 15, class: 'mono', 'font-weight': 700 });
    mat(80, 96, [[1, 2, 3]], { fmt: f1, w: 60, style: () => ({ stroke: ACC }) });
    el('path', { d: 'M68,96 l-8,0 l0,42 l8,0', fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); tx(50, 124, '1', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'end' });
    el('path', { d: 'M80,152 l0,8 l190,0 l0,-8', fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); tx(175, 180, '3', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
    const R3 = [['print(x.shape)', '(1, 3)', '행렬곱 안쪽 차원 불일치를 먼저 잡는다'], ['print(x.dtype)', "<dtype: 'float32'>", 'int32 와 float32 섞임을 잡는다'], ['print(x.numpy())', '[[1. 2. 3.]]', 'eager 라 값이 그냥 보인다']];
    R3.forEach(([cmd, out, why], i) => { if (k === 4 && i > 0) return; const y = 230 + i * 58, a = k === 4 ? 0.3 : (i === 0 ? 0 : 0.3 + (i - 1) * 0.6), op = k === 4 || i > 0 ? fade(u, a) : 1;
      card(52, y, 34, 34, { rx: 17, text: String(i + 1), fs: 15, fill: WARN, stroke: 'none', color: PANEL, op });
      mono(84, y + 5, cmd, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(300, y + 5, '→ ' + out, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: op });
      tx(560, y + 5, why, { 'font-size': 14, fill: MUT, opacity: op }); });
    if (k === 4) tx(600, 120, '값보다 shape 을 먼저 본다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    else tx(600, 120, 'shape → dtype → 값', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.6) }); }

  const quiz = [
    { q: 'int32 텐서 a 와 float32 텐서 b 를 a + b 로 더하면 어떻게 되나?',
      o: ['float32 로 자동 변환되어 6.0 이 나온다', 'InvalidArgumentError 가 난다', 'int32 로 잘려 6 이 나온다'], a: 1,
      why: 'TF 는 dtype 을 알아서 맞춰 주지 않는다. tf.cast(a, tf.float32) 로 맞춰야 6.0 이 나온다.' },
    { q: 'tf.Variable 과 tf.constant 의 차이로 맞는 것은?',
      o: ['Variable 만 assign 으로 내용을 바꿀 수 있다', 'constant 만 GPU 에 올라간다', 'Variable 은 print 로 값을 볼 수 없다'], a: 0,
      why: 'constant 에는 assign 이 없어 AttributeError 가 난다. 학습으로 바뀌어야 하는 가중치·편향이 전부 Variable 인 이유다.' },
    { q: 'A 가 [[1, 2, 3], [4, 5, 6]] 일 때 tf.reduce_sum(A, axis=0) 은 무엇인가?',
      o: ['[6. 15.]', '21.0', '[5. 7. 9.]'], a: 2,
      why: 'axis=0 은 행 축을 접어 열마다 더한다. 행별 합 [6. 15.] 은 axis=1 의 결과다.' },
    { q: 'tf.constant(3.0) 으로 만든 x 에 대해 watch 없이 tape.gradient(z, x) 를 부르면 무엇이 나오나?',
      o: ['6.0', 'None', '0.0'], a: 1,
      why: '테이프는 Variable 만 자동으로 지켜본다. constant 는 tape.watch(x) 를 불러야 6.0 이 나온다.' },
    { q: '학습 루프 안에서 매 스텝 w = tf.Variable(0.0) 을 새로 만들면 어떻게 되나?',
      o: ['값이 누적되지 않고 매번 처음으로 돌아간다', '자동으로 같은 변수를 재사용해 문제없다', '메모리만 조금 더 쓰고 결과는 같다'], a: 0,
      why: '매번 새 변수라 assign_add(0.1) 를 해도 항상 0.1 이다. 루프 밖에서 한 번 만들면 1000번 뒤 약 100 까지 쌓인다.' },
  ];

  const summary = [
    'TF2 의 텐서는 만드는 순간 값이 생기고 print 하면 값과 shape, dtype 이 함께 보인다.',
    '정수 리터럴은 int32, 실수는 float32 라서 섞어 더하면 에러가 나고 tf.cast 로 맞춘다.',
    '학습으로 바뀌는 가중치는 Variable 이고 assign_add 로 갱신하며 루프 밖에서 한 번 만든다.',
    'GradientTape 는 Variable 을 알아서 기록해 w² 의 기울기 6.0 을 되감아 준다.',
  ];
  const review = [
    { q: 'tf.matmul(x, W) 에서 에러가 났다. 디버깅 루틴대로라면 가장 먼저 찍어 볼 것은?',
      o: ['x.numpy() 로 값 전체', 'x.shape 와 W.shape', '옵티마이저 학습률'], a: 1,
      why: '행렬곱은 안쪽 차원이 같아야 한다. shape 를 먼저 보고 dtype, 값 순서로 좁힌다.' },
    { q: '커스텀 루프에서 tape.gradient 가 None 을 돌려줬다. 먼저 의심할 것은?',
      o: ['미분하려는 값이 Variable 이 아니라 constant 이거나 테이프 밖에서 계산됐다', '학습률이 너무 작다', 'GPU 메모리가 부족하다'], a: 0,
      why: '테이프는 블록 안에서 일어난 연산만, 그리고 Variable 만 자동으로 기록한다. constant 라면 watch 가 필요하다.' },
    { q: '전이학습에서 앞 층은 그대로 두고 마지막 층만 학습시키고 싶다. 무엇을 쓰나?',
      o: ['앞 층 가중치를 tf.constant 로 다시 만든다', '앞 층에 assign_add(0) 을 매번 부른다', '앞 층 Variable 을 trainable=False 로 둔다'], a: 2,
      why: '옵티마이저는 trainable_variables 만 갱신한다. trainable=False 인 Variable 은 그 목록에서 빠진다.' },
  ];

  R.page({ title: '텐서와 변수', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
