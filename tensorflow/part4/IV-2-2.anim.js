/* IV-2-2 혼합 정밀도·XLA — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: fp32/fp16 비트 칸, 수직선 위 표현 범위, 층별 dtype 칩, 손실 스케일, 커널 융합과 HBM 왕복, 스텝 시간 막대, 최적화 스택.
 * 숫자: 정책·dtype·초기 스케일 32768·fp16 한계(6.0e-8, 6.1e-5, 65504)·1e-8 의 스케일 결과는 venv(tensorflow-cpu 2.21·numpy) 실행값.
 *       스텝 시간(377.9 / 898.6 ms, 2.78 / 4.63 ms/step, 재컴파일 약 0.5~0.8초)은 같은 venv 에서 이 PC 의 CPU 로 잰 값이다.
 *       메모리 55%·처리량 250% 는 페이지의 예시 값(텐서코어 GPU 기준)이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, hbar, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 부동소수 비트 칸: 부호·지수·가수
  function bits(x, y, n, o) { o = o || {}; const e = n === 32 ? 8 : 5, cw = o.cw || 13, show = o.show ?? n;
    for (let i = 0; i < Math.round(show); i++) { const col = i === 0 ? BAD : i <= e ? WARN : INFO;
      el('rect', { x: x + i * cw, y, width: cw - 2, height: 22, rx: 2, fill: col, opacity: o.op ?? 0.8 }); }
    if (o.label) mono(x + n * cw + 10, y + 16, o.label, { 'font-size': 14, 'font-weight': 700, fill: o.lcol || INK, opacity: o.op ?? 1 }); }
  // 로그 수직선: 10^a ~ 10^b
  function logAxis(x, y, w, a, b, op) { const X = (v) => x + ((Math.log10(v) - a) / (b - a)) * w;
    el('line', { x1: x, y1: y, x2: x + w, y2: y, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    for (let p = a; p <= b; p += 2) { el('line', { x1: X(Math.pow(10, p)), y1: y - 5, x2: X(Math.pow(10, p)), y2: y + 5, stroke: MUT, opacity: op }); mono(X(Math.pow(10, p)), y + 22, `1e${p}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); }
    return X; }

  // =========================================================
  // 1. mixed_float16 정책
  // =========================================================
  function layerCard(cx, cy, comp, vari, o) { o = o || {};
    el('rect', { x: cx - 230, y: cy - 70, width: 460, height: 140, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.2, opacity: o.op ?? 1 });
    tx(cx - 214, cy - 44, 'Dense 층 하나', { 'font-size': 15, 'font-weight': 800, opacity: o.op ?? 1 });
    mono(cx - 214, cy - 10, '변수 W', { 'font-size': 14, fill: MUT }); bits(cx - 140, cy - 26, 32, { cw: 8.5, label: 'float32', lcol: vari === 'float32' ? GOOD : INK });
    mono(cx - 214, cy + 32, '연산', { 'font-size': 14, fill: MUT }); bits(cx - 140, cy + 16, comp === 'float16' ? 16 : 32, { cw: 8.5, show: o.cshow, label: comp, lcol: comp === 'float16' ? ACC : INK }); }
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k <= 3) { const on = k >= 1, sh = k === 1 ? lerp(32, 16, E(u, 0.6, 1.6)) : on ? 16 : 32;
      pill(160, 60, on ? 'policy = mixed_float16' : 'policy = float32 (기본값)', on ? ACC : MUT, k === 1 ? pop(u, 0.3) : 1, { mono: true, fs: 14 });
      layerCard(330, 210, on ? 'float16' : 'float32', 'float32', { cshow: sh });
      // 예시 게이지
      const G = (b.gauges && b.gauges.rows) || [];
      if (G.length) { tx(640, 120, '텐서코어 GPU 기준 (예시)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
        G.slice(0, 2).forEach((r, i) => { const pv = c.prev && c.prev.gauges ? c.prev.gauges.rows[i].fp16 : r.fp16, v = tween(pv, r.fp16, u);
          mono(640, 154 + i * 62, r.metric, { 'font-size': 14, 'font-weight': 700 });
          hbar(640, 164 + i * 62, 200, v, 250, { h: 18, col: v === 100 ? OFF : (i === 0 ? GOOD : ACC), text: `${Math.round(v)}%` }); }); }
      if (k === 0) sub(330, 330, '모듈만 가져왔다 · 아직 모두 float32', fade(u, 0.8), { 'font-weight': 700, fill: INK });
      if (k === 1) sub(330, 330, '이후 만드는 층의 연산이 16비트로 내려간다', fade(u, 1.6), { 'font-weight': 700, fill: ACC });
      if (k === 2) { R.terminal(100, 300, 460, 90, ['>>> print(policy.name)', 'mixed_float16'], lerp(1, 2, E(u, 0.3, 1.0)), { fs: 14 }); }
      if (k === 3) { R.terminal(100, 296, 460, 110, ['>>> policy.compute_dtype, policy.variable_dtype', "('float16', 'float32')"], lerp(1, 2, E(u, 0.3, 1.0)), { fs: 14 });
        el('rect', { x: 170, y: 178, width: 380, height: 30, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 2.4, opacity: fade(u, 1.2) });
        el('rect', { x: 170, y: 220, width: 270, height: 30, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, 1.5) }); }
      return; }
    if (k === 4) { // 표현 범위: 작은 기울기가 fp16 에서 0 이 된다
      const X = logAxis(80, 200, 800, -10, 6, 1);
      el('rect', { x: X(6.0e-8), y: 150, width: X(65504) - X(6.0e-8), height: 26, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 1.6, opacity: fade(u, 0.2) });
      mono(X(6.0e-8), 142, 'float16 이 담는 범위 6.0e-8 ~ 65504', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
      el('rect', { x: 80, y: 150, width: X(6.0e-8) - 80, height: 26, rx: 4, fill: BADBG, opacity: fade(u, 0.6) }); mono(84, 120, '여기는 0 이 된다', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.7) });
      el('rect', { x: 80, y: 230, width: 800, height: 20, rx: 4, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.4, opacity: fade(u, 1.0) }); mono(870, 245, 'float32 는 이 그림 전체를 담는다', { 'text-anchor': 'end', 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.1) });
      const g = X(1e-8); el('circle', { cx: g, cy: 200, r: 7, fill: BAD, opacity: fade(u, 1.4) }); grow(g, 262, g + 30, 282, E(u, 1.4, 1.7), BAD, { plain: true });
      mono(g + 34, 296, '기울기 1e-8 → float16(1e-8) = 0.0', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      sub(480, 360, '그래서 연산은 fp16 으로, 가중치(마스터)는 fp32 로 지킨다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    // k5: 하드웨어
    const H = b.hw || [];
    tx(80, 70, 'compute capability ≥ 7.0 (Volta 이후) 이면 텐서코어가 있다', { 'font-size': 15.5, 'font-weight': 700 });
    H.forEach((h, i) => { const y = 130 + i * 80, s = pop(u, 0.3 + i * 0.4);
      const g = R.G(150, y, s); el('rect', { x: -50, y: -28, width: 100, height: 56, rx: 8, fill: PANEL, stroke: h.ok ? GOOD : BAD, 'stroke-width': 2.4 }, g);
      for (let q = -2; q <= 2; q++) el('line', { x1: q * 16, y1: -34, x2: q * 16, y2: -28, stroke: h.ok ? GOOD : BAD, 'stroke-width': 2 }, g);
      tx(230, y + 6, h.chip, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.4) });
      tx(470, y + 6, h.gain, { 'font-size': 15, fill: h.ok ? GOOD : BAD, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) });
      if (h.ok) check(780, y, 12, pop(u, 0.6 + i * 0.4)); else cross(780, y, 12, pop(u, 0.6 + i * 0.4)); });
    sub(480, 390, '텐서코어가 없으면 형변환 비용만 붙어 오히려 느려질 수 있다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }

  // =========================================================
  // 2. 출력층 float32 + 손실 스케일링
  // =========================================================
  const LAY = [['Input (32, 32, 3)', 'float32'], ['Conv2D(32, 3)', 'float16'], ['GlobalAveragePooling2D', 'float16'], ['Dense(10) · logits', 'float16'], ['Activation("softmax", dtype="float32")', 'float32']];
  function stack(n, hot, u0, u) { LAY.slice(0, n).forEach(([name, dt], i) => { const y = 70 + i * 52, f = i >= u0 ? pop(u, 0.2 + (i - u0) * 0.3) : 1; if (f <= 0.01) return;
    card(220, y, 380, 40, { rx: 8, stroke: i === 4 ? GOOD : INK, sw: i === hot ? 3 : 1.8, s: f });
    mono(44, y + 5, name, { 'font-size': 13.5, opacity: clamp(f) });
    pill(380, y, dt, dt === 'float16' ? ACC : GOOD, f, { mono: true, fs: 13.5 }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { pill(220, 30, 'set_global_policy("mixed_float16")', ACC, 1, { mono: true, fs: 13.5 });
      if (k === 0) { card(220, 180, 380, 170, { rx: 12, stroke: GRID, dash: '6 5', s: pop(u, 0.4) }); sub(220, 186, '층은 정책을 켠 다음에 만든다', fade(u, 0.6), { 'font-weight': 700, fill: INK });
        sub(700, 180, '정책은 이후에 생성되는 층에만 적용된다', fade(u, 1.2)); return; }
      stack(k === 1 ? 4 : 5, k === 2 ? 4 : -1, k === 1 ? 1 : 4, u);
      if (k === 1) { card(700, 180, 340, 110, { rx: 12, stroke: WARN, sw: 2, s: pop(u, 1.5) }); tx(700, 170, '이대로 softmax · 손실을 fp16 으로 하면', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
        tx(700, 196, '확률이 뭉개지거나 NaN', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.7) }); }
      if (k === 2) { mono(640, 150, '출력 텐서 dtype (실행값)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.8) });
        [['Conv2D', 'float16'], ['Dense', 'float16'], ['softmax', 'float32']].forEach(([a, z], i) => mono(640, 180 + i * 26, `${a.padEnd(8)} → ${z}`, { 'font-size': 14, fill: z === 'float32' ? GOOD : ACC, opacity: fade(u, 1.0 + i * 0.25) }));
        mono(640, 280, '가중치는 모두 float32 · 파라미터 1,226개', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); }
      return; }
    if (k === 3 || k === 4) { const auto = k === 3;
      mono(60, 60, auto ? 'model.compile(optimizer="adam", ...)  →  model.fit(...)' : 'opt = mixed_precision.LossScaleOptimizer(Adam())', { 'font-size': 14.5, 'font-weight': 700 });
      const f = E(u, 0.4, 1.2); el('rect', { x: 340 - 150 * f, y: 230 - 80 * f, width: 300 * f, height: 160 * f, rx: 14, fill: 'none', stroke: WARN, 'stroke-width': 2.6, 'stroke-dasharray': '7 5' });
      if (f > 0.9) mono(206, 168, 'LossScaleOptimizer', { 'font-size': 14.5, 'font-weight': 800, fill: WARN });
      card(340, 240, 160, 60, { rx: 10, text: 'Adam', fs: 17, stroke: INK, sw: 2.2 });
      if (auto) { mono(560, 210, 'type(model.optimizer).__name__', { 'font-size': 14, opacity: fade(u, 1.4) }); mono(560, 236, "→ 'LossScaleOptimizer'", { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.7) });
        sub(700, 300, '정책이 켜져 있으면 compile 이 알아서 감싼다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }
      else { mono(560, 210, 'opt.initial_scale', { 'font-size': 14, opacity: fade(u, 1.4) }); mono(560, 236, '→ 32768.0 = 2¹⁵', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.7) });
        sub(700, 300, '커스텀 루프에서는 직접 감싼다 · 배율은 래퍼가 관리', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }
      return; }
    // k5, k6: 스케일 → 복원 (실행값)
    const X = logAxis(80, 230, 800, -10, 2, 1);
    el('rect', { x: X(6.0e-8), y: 182, width: 880 - X(6.0e-8), height: 24, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 1.4 }); mono(X(6.0e-8) + 8, 199, 'float16 범위', { 'font-size': 13.5, fill: ACC, 'font-weight': 700 });
    el('rect', { x: 80, y: 182, width: X(6.0e-8) - 80, height: 24, rx: 4, fill: BADBG });
    const g0 = X(1e-8), g1 = X(3.2759e-4);
    if (k === 5) { el('circle', { cx: g0, cy: 194, r: 8, fill: BAD });
      mono(g0 - 10, 150, '기울기 1e-8 · fp16 으로는 0', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' });
      const f = E(u, 0.6, 1.8); el('path', { d: `M${g0},${180} Q${(g0 + g1) / 2},${80} ${lerp(g0, g1, f)},${lerp(180, 182, f)}`, fill: 'none', stroke: WARN, 'stroke-width': 2.6, 'stroke-dasharray': '6 4' });
      if (f > 0.95) el('circle', { cx: g1, cy: 194, r: 8, fill: WARN });
      mono((g0 + g1) / 2, 100, '× 2¹⁵ (32768)', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      mono(g1, 290, 'float16(1e-8 × 32768) = 3.28e-4', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(480, 360, '손실에 2¹⁵ 를 곱하면 기울기도 2¹⁵ 배 · 범위 안으로 올라온다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    el('circle', { cx: g1, cy: 194, r: 8, fill: WARN });
    const f = E(u, 0.4, 1.6); el('path', { d: `M${g1},${208} Q${(g0 + g1) / 2},${320} ${lerp(g1, g0, f)},${lerp(208, 230, f)}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.6, 'stroke-dasharray': '6 4' });
    mono((g0 + g1) / 2, 290, '÷ 2¹⁵ 를 float32 로', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
    if (f > 0.95) el('circle', { cx: g0, cy: 230, r: 8, fill: GOOD });
    mono(g0 + 14, 326, '9.997e-9 · fp32 마스터 가중치에 적용', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7) });
    mono(80, 80, 'scaled_g = tape.gradient(scaled_loss, vars)', { 'font-size': 14, opacity: fade(u, 0.1) });
    mono(80, 106, 'grads = opt.get_unscaled_gradients(scaled_g)', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) }); }

  // =========================================================
  // 3. XLA — 작은 커널 넷을 하나로
  // =========================================================
  const OPS = ['mul', 'add', 'relu', 'mul'];
  function kernels(x0, y, fused, u, o) { o = o || {}; const hb = y + 150;
    el('rect', { x: x0 - 10, y: hb, width: 400, height: 34, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }); mono(x0, hb + 22, 'GPU 메모리 (HBM)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (!fused) { OPS.forEach((n, i) => { const x = x0 + 40 + i * 96, s = o.pop ? pop(u, 0.2 + i * 0.2) : 1; card(x, y, 78, 40, { rx: 8, text: n, fs: 15, mono: true, stroke: INFO, sw: 2.2, s });
        if (s > 0.5) { grow(x - 12, y + 24, x - 12, hb - 4, 1, WARN, { sw: 1.8 }); grow(x + 12, hb - 4, x + 12, y + 24, 1, WARN, { sw: 1.8 }); }
        if (o.flow) dot([[x - 12, y + 24], [x - 12, hb - 4], [x + 12, hb - 4], [x + 12, y + 24]], ((u * 0.6 + i * 0.25) % 1), WARN, 5); });
      mono(x0, y - 40, '커널 4번 · HBM 왕복 4번', { 'font-size': 15, 'font-weight': 800, fill: WARN }); }
    else { const cx = x0 + 184; card(cx, y, 340, 50, { rx: 10, stroke: ACC, sw: 2.6, fill: ACCBG, s: o.s ?? 1 });
      mono(cx, y + 5, 'fused_kernel(x, w, b, s)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: o.s ?? 1 });
      grow(cx - 30, y + 28, cx - 30, hb - 4, o.s ?? 1, WARN, { sw: 1.8 }); grow(cx + 30, hb - 4, cx + 30, y + 28, o.s ?? 1, WARN, { sw: 1.8 });
      mono(x0, y - 40, '커널 1번 · HBM 왕복 1번 · 중간값은 레지스터', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: o.s ?? 1 }); } }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { mono(60, 50, 'y = relu(x*w + b) * s', { 'font-size': 16, 'font-weight': 800 }); kernels(80, 160, false, u, { pop: true, flow: true });
      sub(720, 200, 'eager 와 평범한 tf.function 은', fade(u, 1.6)); sub(720, 224, '연산마다 커널을 따로 부른다', fade(u, 1.7), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1 || k === 2) { const m = E(u, 0.5, 1.5);
      mono(60, 50, k === 1 ? 'model.compile(..., jit_compile=True)' : '@tf.function(jit_compile=True)', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      if (m < 1) { OPS.forEach((n, i) => card(lerp(120 + i * 96, 264, m), 160, lerp(78, 60, m), 40, { rx: 8, text: n, fs: 15, mono: true, stroke: INFO, sw: 2.2, op: 1 - m * 0.8 })); }
      else kernels(80, 160, true, u, { s: pop(u, 1.5) });
      sub(720, 200, k === 1 ? 'fit() 경로 · 인자 하나' : '커스텀 루프 · 이 함수만 컴파일', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { el('rect', { x: 60, y: 70, width: 540, height: 280, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '8 6' });
      mono(76, 94, '@tf.function(jit_compile=True) def train_step', { 'font-size': 14, 'font-weight': 800, fill: ACC });
      ['model(x)', 'loss_fn', 'tape.gradient', 'apply_gradients'].forEach((n, i) => { const x = 160 + (i % 2) * 260, y = 160 + Math.floor(i / 2) * 110;
        card(x, y, 200, 50, { rx: 10, text: n, fs: 15, mono: true, stroke: i < 2 ? INFO : WARN, sw: 2.2, s: pop(u, 0.3 + i * 0.25) }); });
      sub(780, 200, '함수 안의 연산이', fade(u, 1.5)); sub(780, 224, '한 컴파일 단위가 된다', fade(u, 1.6), { 'font-weight': 700, fill: ACC });
      sub(780, 270, '함수를 잘게 쪼개면 융합할 거리도 준다', fade(u, 2.0)); return; }
    if (k === 4) { tx(60, 40, 'eager', { 'font-size': 16, 'font-weight': 800, fill: INFO }); tx(520, 40, 'XLA', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      kernels(40, 150, false, u, { flow: true }); kernels(520, 150, true, u, { s: 1 }); return; }
    // k5: 층 쌓기 + AMP 독립
    [['파이썬 함수 (eager)', '연산마다 커널', OFF], ['@tf.function (I-2-1)', '그래프로 · 1차', INFO], ['jit_compile=True (XLA)', '융합 컴파일 · 2차', ACC]].forEach(([n, d, col], i) => { const y = 320 - i * 80, s = pop(u, 0.2 + i * 0.4);
      card(240, y, 380, 60, { rx: 10, stroke: col === OFF ? MUT : col, sw: 2.2, s }); mono(70, y + 5, n, { 'font-size': 15, 'font-weight': 800, opacity: clamp(s) }); mono(420, y + 5, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: clamp(s) }); });
    card(700, 240, 300, 220, { rx: 14, stroke: GOOD, sw: 2.2, s: pop(u, 1.6), dash: '7 5' });
    tx(700, 180, 'AMP 와 XLA 는 독립', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.7) });
    tx(700, 214, '정밀도를 낮추는 것 × 연산을 합치는 것', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    tx(700, 248, '같이 켜면 이득이 곱해진다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }

  // =========================================================
  // 4. 측정과 함정 — 이 PC CPU 에서 잰 스텝 시간
  // =========================================================
  const T_NO = [377.9, 3.2, 2.9, 4.4, 4.6], T_JIT = [898.6, 5.2, 5.5, 5.1, 5.0], VS = [[60, 688.0], [61, 822.7], [62, 698.4], [63, 719.9], [64, 495.9], [60, 5.8], [61, 5.3]];
  const LY = (v, y0, h) => y0 + h - (Math.log10(v) / 3) * h;   // 1 ~ 1000 ms 로그 축
  function logY(x, y0, h, w, op) { [1, 10, 100, 1000].forEach((v) => { el('line', { x1: x, y1: LY(v, y0, h), x2: x + w, y2: LY(v, y0, h), stroke: GRID, 'stroke-dasharray': '3 4', opacity: op }); mono(x - 8, LY(v, y0, h) + 5, `${v}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); });
    mono(x - 8, y0 - 12, 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { tx(60, 60, 'benchmark(train_step, dataset, warmup=10, measure=100)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      for (let i = 0; i < 110; i++) { const f = clamp((u - 0.3) * 60 - i * 0.5); if (f <= 0) break; el('rect', { x: 60 + i * 7.6, y: 140, width: 6, height: 40, rx: 1.5, fill: i < 10 ? WARN : INFO, opacity: f }); }
      el('path', { d: 'M60,196 V204 H136 V196', fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.4) }); mono(60, 228, '워밍업 10 · 버림', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
      el('path', { d: 'M138,196 V204 H894 V196', fill: 'none', stroke: INFO, 'stroke-width': 2, opacity: fade(u, 1.7) }); mono(480, 228, '측정 100 · 평균', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) });
      sub(480, 320, '버릴 구간과 잴 구간을 처음부터 나눈다', fade(u, 2.1), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { const y0 = 70, h = 260; logY(120, y0, h, 760, 1);
      mono(120, 44, '처음 5스텝 (이 PC CPU 실행값, 작은 Conv 모델·배치 64)', { 'font-size': 14, 'font-weight': 700 });
      [T_NO, T_JIT].forEach((arr, r) => arr.forEach((v, i) => { const x = 160 + i * 150 + r * 50, f = E(u, 0.2 + i * 0.2 + r * 0.1, 0.8 + i * 0.2 + r * 0.1), top = LY(Math.max(1, v), y0, h);
        el('rect', { x, y: lerp(y0 + h, top, f), width: 40, height: (y0 + h - top) * f, rx: 3, fill: r ? ACC : INFO, opacity: i === 0 ? 1 : 0.7 });
        if (i === 0) mono(x + 20, top - 8, v.toFixed(0), { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: r ? ACC : INFO, opacity: fade(u, 1.0 + r * 0.2) }); }));
      [['tf.function', INFO], ['+ jit_compile', ACC]].forEach(([n, col], i) => { el('rect', { x: 640 + i * 150, y: 96, width: 14, height: 14, fill: col }); mono(660 + i * 150, 108, n, { 'font-size': 13.5, fill: col }); });
      mono(180, 372, '첫 스텝 = trace · 컴파일', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(560, 372, '이 구간이 평균에 섞이면 XLA 가 늘 느려 보인다', fade(u, 1.9), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2 || k === 3) { tx(60, 60, 't0 = time.perf_counter() → 100스텝 → (끝 - t0) / 100', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: k === 2 ? fade(u, 0.2) : 1 });
      const ms = [2.78, 4.63], sp = [360, 216];
      [['tf.function', INFO], ['tf.function + jit_compile', ACC]].forEach(([n, col], i) => { const y = 130 + i * 80;
        mono(60, y + 14, n, { 'font-size': 14.5, 'font-weight': 700, fill: col });
        const v = k === 2 ? ms[i] * E(u, 0.6 + i * 0.3, 1.6 + i * 0.3) : ms[i];
        hbar(330, y, 380, v, 5, { h: 22, col, text: `${v.toFixed(2)} ms/step` });
        if (k === 3) mono(330, y + 46, `${sp[i]} steps/s`, { 'font-size': 14, fill: col, opacity: fade(u, 0.3 + i * 0.2) }); });
      if (k === 3) { banner(480, 330, '이 CPU 에서는 XLA 가 0.6배 · 텐서코어 GPU 와 결과가 다르다', pop(u, 1.2));
        sub(480, 382, '배율로 비교하고, 내 하드웨어에서 직접 잰다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); }
      else sub(480, 330, '이 PC CPU 실행값 · 워밍업 10스텝을 뺀 100스텝 평균', fade(u, 2.0));
      return; }
    if (k === 4) { const y0 = 80, h = 230; logY(120, y0, h, 600, 1);
      mono(120, 50, '배치 크기를 매번 바꿔 넣은 jit_compile 스텝 (실행값)', { 'font-size': 14, 'font-weight': 700 });
      VS.forEach(([n, v], i) => { const x = 150 + i * 82, f = E(u, 0.2 + i * 0.22, 0.6 + i * 0.22), top = LY(v, y0, h), rep = i >= 5;
        el('rect', { x, y: lerp(y0 + h, top, f), width: 50, height: (y0 + h - top) * f, rx: 3, fill: rep ? GOOD : BAD, opacity: 0.85 });
        mono(x + 25, y0 + h + 22, `${n}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); if (f > 0.9) mono(x + 25, top - 8, v < 10 ? v.toFixed(1) : v.toFixed(0), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: rep ? GOOD : BAD }); });
      mono(150, y0 + h + 46, '배치 크기 →  새 모양마다 다시 컴파일 · 본 모양이면 빠르다', { 'font-size': 13.5, fill: MUT });
      card(820, 200, 200, 70, { rx: 10, stroke: GOOD, sw: 2.2, s: pop(u, 2.0) }); mono(820, 196, 'padded_batch', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.1) }); mono(820, 218, '모양을 고정', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    if (k === 5) { // 누적 시간: 짧은 실행은 컴파일 비용을 못 뽑는다 (개념도)
      const ax = R.axes(100, 70, 460, 250, { x: [0, 100], y: [0, 100], xl: '스텝 수', yl: '누적 시간' });
      R.line(ax, [[0, 0], [100, 60]], E(u, 0.2, 1.6), INFO); R.line(ax, [[0, 35], [100, 75]], E(u, 0.4, 1.8), ACC);
      mono(ax.X(100) + 8, ax.Y(60) + 5, '평범', { 'font-size': 13.5, fill: INFO }); mono(ax.X(100) + 8, ax.Y(75) + 5, 'XLA', { 'font-size': 13.5, fill: ACC });
      mono(ax.X(2), ax.Y(35) - 10, '첫 컴파일', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 0.6) });
      sub(330, 380, '선 모양은 개념도 · 스텝이 적으면 컴파일 비용이 남는다', fade(u, 1.8));
      card(790, 170, 280, 120, { rx: 12, stroke: WARN, sw: 2.2, s: pop(u, 1.4) });
      tx(790, 150, 'NaN · 형상 오류를 쫓을 때', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(790, 182, 'jit_compile=False', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.6) });
      tx(790, 210, '융합된 커널 안은 보이지 않는다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.7) }); return; }
    // k6: 숨은 이득 — 배치 키우기
    [[100, 'float32', 128, 100], [220, 'mixed_float16', 256, 55]].forEach(([y, n, bs, mem], r) => { const f = fade(u, 0.2 + r * 0.8);
      mono(60, y - 10, `${n} · 배치 ${bs}`, { 'font-size': 15, 'font-weight': 800, fill: r ? ACC : INK, opacity: f });
      el('rect', { x: 60, y, width: 600, height: 40, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: f });
      el('rect', { x: 60, y, width: 600 * mem / 100 * E(u, 0.3 + r * 0.8, 1.0 + r * 0.8), height: 40, rx: 6, fill: r ? ACC : OFF, opacity: 0.8 });
      if (r) el('rect', { x: 60 + 600 * 0.55, y, width: 600 * 0.45 * E(u, 1.6, 2.2), height: 40, rx: 6, fill: ACC, opacity: 0.35 });
      mono(680, y + 26, r ? '55% → 남는 칸을 배치로 (예시)' : '메모리 100%', { 'font-size': 14, 'font-weight': 700, fill: r ? ACC : MUT, opacity: fade(u, 0.6 + r * 0.8) }); });
    sub(480, 330, 'OOM 이 안 나는 선까지 배치를 키워 메모리를 처리량으로 바꾼다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }

  // =========================================================
  // 5. 최적화 스택
  // =========================================================
  const SLAB = { '④': [ACC, 4], '③': [WARN, 3], '②': [INFO, 2], '①': [GOOD, 1] };
  function s5(t, c) { const { k, u } = c, b = c.beat, S = b.stack || [], P = (c.prev && c.prev.stack) || [];
    const order = ['①', '②', '③', '④'];
    // 슬랩: 아래부터 ① ② ③ ④
    S.forEach((s) => { const key = s.layer.slice(0, 1), lv = SLAB[key] ? SLAB[key][1] : 1, col = SLAB[key] ? SLAB[key][0] : INK, fresh = !P.some((p) => p.layer === s.layer);
      const y = 360 - lv * 66, f = fresh ? E(u, 0.2, 0.9) : 1; if (f <= 0) return;
      const yy = y;
      el('rect', { x: 60, y: yy, width: 520 * f, height: 56, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2.6 });
      mono(76, yy + 24, s.layer, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: f }); mono(76, yy + 46, s.why, { 'font-size': 13.5, fill: MUT, opacity: f });
      mono(564, yy + 24, s.ref, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, opacity: f }); mono(564, yy + 46, s.gain, { 'font-size': 13.5, 'text-anchor': 'end', 'font-weight': 700, opacity: f }); });
    order.forEach((key, i) => { if (!S.some((s) => s.layer.startsWith(key))) { const y = 360 - (i + 1) * 66; el('rect', { x: 60, y, width: 520, height: 56, rx: 10, fill: 'none', stroke: GRID, 'stroke-width': 1.6, 'stroke-dasharray': '6 5' }); } });
    // 오른쪽: 이 beat 의 코드 한 줄 또는 체크리스트
    const LINES = ['strategy = tf.distribute.MirroredStrategy()', 'mixed_precision.set_global_policy("mixed_float16")', 'ds = make_dataset().batch(256).prefetch(AUTOTUNE)', 'ds = strategy.experimental_distribute_dataset(ds)', 'model.compile(..., jit_compile=True)'];
    if (k <= 4) { LINES.slice(0, k + 1).forEach((s, i) => { const fresh = i === k; mono(620, 70 + i * 26, s.length > 34 ? s.slice(0, 33) + '…' : s, { 'font-size': 13.5, fill: fresh ? ACC : MUT, 'font-weight': fresh ? 700 : 400, opacity: fresh ? fade(u, 0.3) : 1 }); });
      const note = ['가장 바깥 · 먼저 선언', '모델을 만들기 전에 켠다', '배치 128 → 256 (AMP 여유)', '커스텀 루프용 · fit 은 자동', 'scope 안에서 compile'][k];
      sub(760, 250, note, fade(u, 0.8), { 'font-weight': 700, fill: INK }); }
    if (k === 5) (b.checklist || []).forEach((cl, i) => { const y = 90 + i * 70, f = fade(u, 0.3 + i * 0.5);
      card(770, y, 330, 54, { rx: 10, stroke: INFO, sw: 2, op: f }); tx(620, y - 2, `${i + 1}. ${cl.item}`, { 'font-size': 14.5, 'font-weight': 700, opacity: f }); tx(620, y + 18, cl.note, { 'font-size': 13.5, fill: MUT, opacity: f }); });
    if (k === 6) { banner(770, 120, '다음 Part Ⅴ · SavedModel 로 저장·배포', pop(u, 0.3)); sub(770, 180, '쌓는 순서: 입력 → 융합 → 정밀도 → 여러 GPU', fade(u, 0.9), { 'font-weight': 700, fill: INK }); } }

  const quiz = [
    { q: 'mixed_float16 정책을 켰을 때 층의 compute_dtype과 variable_dtype은 무엇인가?',
      o: ['둘 다 float16', 'compute는 float16, variable은 float32', 'compute는 float32, variable은 float16'], a: 1,
      why: '실행하면 (float16, float32)가 나온다. 연산은 16비트로 내려 빠르게, 가중치는 32비트로 지켜 작은 갱신이 사라지지 않게 한다.' },
    { q: '혼합 정밀도에서 크기 1e-8인 기울기를 그대로 fp16으로 두면 어떻게 되는가?',
      o: ['0이 되어 학습 신호가 사라진다', '자동으로 float32로 올라간다', '65504로 잘린다'], a: 0,
      why: 'fp16이 담는 가장 작은 값은 약 6.0e-8이라 1e-8은 0이 된다. 손실에 2¹⁵ 를 곱하면 3.28e-4로 범위 안에 들어오고, 갱신 직전에 다시 나눈다.' },
    { q: 'XLA(jit_compile=True)가 속도를 올리는 주된 방법은 무엇인가?',
      o: ['숫자를 fp16으로 낮춘다', '작은 연산 여럿을 한 커널로 합쳐 메모리 왕복을 줄인다', '배치를 GPU 여러 장에 나눈다'], a: 1,
      why: 'mul·add·relu·mul이 커널 4번·HBM 왕복 4번이던 것을 융합 커널 1번으로 바꾼다. 정밀도를 낮추는 AMP 와는 독립이다.' },
    { q: '이 PC CPU에서 jit_compile 스텝을 처음 5번 재면 첫 스텝만 898.6ms다. 이 값을 어떻게 다뤄야 하는가?',
      o: ['그대로 평균에 넣는다', 'XLA가 느리다는 증거로 본다', '워밍업 구간으로 버리고 그 뒤 여러 스텝의 평균을 잰다'], a: 2,
      why: '첫 호출에서 trace와 컴파일이 일어난다. 워밍업을 버리고 재면 같은 CPU에서 4.63 ms/step 이었다.' },
    { q: '성능 스택에서 tf.data 파이프라인을 가장 먼저 챙기는 이유는 무엇인가?',
      o: ['입력이 병목이면 AMP·XLA·분산을 켜도 GPU가 데이터를 기다리기 때문에', 'tf.data가 있어야 mixed_float16을 켤 수 있어서', '분산 전략이 tf.data 없이는 만들어지지 않아서'], a: 0,
      why: 'GPU가 굶고 있으면 계산을 아무리 빠르게 해도 소용없다. 프로파일러로 입력 병목인지 계산 병목인지 먼저 본다.' },
  ];

  const summary = [
    'mixed_float16을 켜면 연산은 float16, 가중치는 float32로 나뉜다.',
    'fp16은 6.0e-8 아래를 0으로 만든다. 손실에 2¹⁵ 를 곱했다가 갱신 직전에 나눠 지킨다.',
    '출력층 softmax는 dtype float32로 두고, XLA는 작은 커널을 합쳐 메모리 왕복을 줄인다.',
    '첫 스텝은 컴파일이라 버리고 잰다. 이 PC CPU에서는 XLA가 오히려 느렸다.',
  ];
  const review = [
    { q: '텐서코어 GPU에서 mixed_float16을 켰더니 몇 스텝 뒤 손실이 NaN이 됐다. 커스텀 루프다. 먼저 확인할 것은?',
      o: ['출력층을 float32로 두고 LossScaleOptimizer로 손실 스케일링을 했는지', 'jit_compile을 켰는지', '배치를 더 키웠는지'], a: 0,
      why: 'softmax·손실을 fp16으로 하면 수치가 뭉개지고, 커스텀 루프는 스케일링을 직접 넣어야 한다. 두 안전장치부터 본다.' },
    { q: '가변 길이 문장을 그대로 넣고 jit_compile=True로 학습했더니 오히려 느려졌다. 가장 그럴듯한 원인과 처방은?',
      o: ['fp16 범위가 좁아서, float32로 되돌린다', '배치마다 모양이 달라 재컴파일이 반복되니, padded_batch로 모양을 고정한다', 'prefetch가 없어서, prefetch를 붙인다'], a: 1,
      why: '새 모양마다 수백 ms의 컴파일이 다시 일어난다. 실행해 보면 처음 보는 배치 크기는 0.5~0.8초, 이미 본 크기는 약 5ms 였다.' },
    { q: 'GPU 사용률이 40%에 머무는 학습에 AMP와 XLA를 켰는데 거의 빨라지지 않았다. 다음에 볼 것은?',
      o: ['loss scale을 2¹⁵ 보다 키운다', 'ParameterServer 전략으로 바꾼다', '입력 파이프라인의 prefetch·병렬 map을 본다'], a: 2,
      why: '계산 최적화는 GPU가 바쁠 때만 효과가 난다. 사용률이 낮으면 입력이 병목이라 tf.data부터 고친다.' },
  ];

  R.page({ title: '혼합 정밀도와 XLA', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
