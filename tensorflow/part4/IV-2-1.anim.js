/* IV-2-1 분산 전략 — MirroredStrategy — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: GPU 칩·모델 복제본·배치 격자(256칸)·기울기 막대·all-reduce·전략 지도.
 * 숫자: 4장·배치 64/256·lr 1e-3/4e-3 은 페이지 값, 학습 시간(4일·1일)은 페이지 예시 값.
 *       복제본별 손실(0.5734 …)·합 2.3030·잘못 나눈 합 9.2121 은 venv(tensorflow-cpu 2.21)에서
 *       논리 CPU 4개로 MirroredStrategy 를 돌린 실행값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, hbar, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const GC = [ACC, INFO, WARN, GOOD];

  // GPU 칩: 판 + 이름 + (선택) 모델 층 막대
  function gpu(cx, cy, name, o) { o = o || {}; const w = o.w || 150, h = o.h || 110, s = o.s ?? 1; if (s <= 0.01) return; const g = R.G(cx, cy, s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    for (let i = -2; i <= 2; i++) { el('line', { x1: i * 22, y1: -h / 2 - 7, x2: i * 22, y2: -h / 2, stroke: o.stroke || INK, 'stroke-width': 2 }, g); el('line', { x1: i * 22, y1: h / 2, x2: i * 22, y2: h / 2 + 7, stroke: o.stroke || INK, 'stroke-width': 2 }, g); }
    tx(-w / 2 + 10, -h / 2 + 20, name, { 'font-size': 14, 'font-weight': 800, fill: o.stroke || INK }, g);
    if (o.model) { const m = o.model; ['Dense 256', 'Dense 10'].forEach((n, i) => { const f = typeof m === 'number' ? clamp(m * 2 - i) : 1; if (f <= 0) return;
      el('rect', { x: -w / 2 + 12, y: -h / 2 + 32 + i * 30, width: (w - 24) * f, height: 24, rx: 5, fill: o.mcol || ACCBG, stroke: o.mstroke || ACC, 'stroke-width': 1.6 }, g);
      if (f > 0.7) mono(-w / 2 + 20, -h / 2 + 49 + i * 30, n, { 'font-size': 13.5, fill: INK }, g); }); }
    if (o.idle) mono(0, h / 2 - 12, '쉬는 중', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, g);
    return g; }
  // 배치 격자: n 칸 (cols 열), 색은 col(i)
  function grid(x, y, n, cols, cs, col, o) { o = o || {}; for (let i = 0; i < n; i++) { const s = o.reveal == null ? 1 : clamp(o.reveal * n - i); if (s <= 0) return;
    el('rect', { x: x + (i % cols) * cs, y: y + Math.floor(i / cols) * cs, width: cs - 2, height: cs - 2, rx: 1.5, fill: col(i), opacity: (o.op ?? 1) * (0.5 + 0.5 * s) }); } }
  const GX = [150, 370, 590, 810];

  // =========================================================
  // 1. 왜 분산인가
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k <= 4) {
      GX.forEach((x, i) => gpu(x, 300, `GPU ${i}`, { s: k === 0 ? pop(u, 0.2 + i * 0.2) : 1, model: i === 0 && k >= 2 ? (k === 2 ? E(u, 0.2, 1.2) : 1) : null, idle: i > 0, stroke: i === 0 ? INK : OFF, op: i === 0 ? 1 : 0.7 }));
      if (k === 0) { mono(60, 70, 'tf.config.list_physical_devices("GPU")', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
        mono(60, 104, `→ GPU ${Math.round(lerp(0, 4, E(u, 0.4, 1.4)))}장 사용 가능`, { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
        sub(480, 180, '장비는 4장인데 코드는 1장만 쓴다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
      // 배치 256 이 GPU 0 으로
      const f = k === 1 ? E(u, 0.2, 1.2) : 1;
      grid(60, 50, 256, 32, 9, () => ACC, { reveal: f, op: k === 1 ? 1 : 0.8 });
      mono(360, 70, '배치 256', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, k === 1 ? 0.6 : 0) });
      if (k === 1) for (let i = 0; i < 4; i++) dot([[200, 130], [150, 240]], ((t * 0.6 + i / 4) % 1), ACC, 5);
      if (k === 1) sub(560, 160, '배치 256을 한 장이 통째로 · 한 epoch 에 수 시간', fade(u, 1.3), { 'font-weight': 700, fill: INK });
      if (k === 2) sub(560, 160, 'Dense 256 → Dense 10 · 분산을 붙여도 거의 안 바뀐다', fade(u, 1.0), { 'font-weight': 700, fill: INK });
      if (k === 3) { ['m', 'v'].forEach((n, i) => card(250 + i * 0, 270 + i * 34, 40, 26, { rx: 5, text: n, fs: 14, mono: true, stroke: WARN, fill: WARNBG, s: pop(u, 0.3 + i * 0.3) }));
        tx(560, 140, 'compile: adam · sparse_categorical_crossentropy', { 'font-size': 14.5, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, 0.2) });
        sub(560, 170, 'Adam 은 가중치마다 m · v 상태 변수를 따로 든다', fade(u, 0.9), { 'font-weight': 700, fill: WARN }); }
      if (k === 4) { const pf = E(u, 0.2, 2.6) * 0.25;
        el('rect', { x: 460, y: 120, width: 400, height: 22, rx: 5, fill: SOFT }); el('rect', { x: 460, y: 120, width: 400 * pf, height: 22, rx: 5, fill: BAD });
        mono(460, 166, '전체 학습 ≈ 4일 (예시)', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4) });
        mono(460, 106, 'model.fit(train_ds, epochs=10)', { 'font-size': 14, opacity: fade(u, 0.1) }); }
      return; }
    if (k === 5) { const f = E(u, 0.3, 1.5);
      GX.forEach((x, i) => gpu(x, 300, `GPU ${i}`, { model: 1, stroke: GC[i], mstroke: GC[i], s: 1 }));
      for (let q = 0; q < 4; q++) { const sx = lerp(60 + q * 72, GX[q] - 36, f), sy = lerp(50, 150, f); grid(sx, sy, 64, 8, 9, () => GC[q]); mono(sx + 36, sy - 8, '64', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: GC[q], opacity: fade(u, 1.4) }); }
      if (f < 0.3) mono(360, 70, '배치 256', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      mono(480, 40, '모델은 4벌 복제, 배치는 64씩 나눠서', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      mono(480, 76, '전체 학습 4일 → ≈ 1일 (예시)', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) }); return; }
    // k6: 데이터 병렬 vs 모델 병렬
    [[240, '데이터 병렬', GOOD, true], [720, '모델 병렬', MUT, false]].forEach(([cx, name, col, dp], r) => { const f = fade(u, 0.2 + r * 0.9);
      tx(cx, 60, name, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: f });
      for (let i = 0; i < 2; i++) { const x = cx - 100 + i * 200; gpu(x, 220, `GPU ${i}`, { w: 170, h: 120, s: pop(u, 0.3 + r * 0.9 + i * 0.15), stroke: dp ? GC[i] : INK, model: dp ? 1 : null });
        if (!dp) { el('rect', { x: x - 73, y: 192, width: 146, height: 24, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 1.6, opacity: f }); mono(x - 65, 209, i ? 'Dense 10' : 'Dense 256', { 'font-size': 13.5, opacity: f }); }
        if (dp) { grid(x - 36, 100, 32, 8, 9, () => GC[i], { op: f }); } }
      if (!dp) { grid(cx - 136, 100, 64, 16, 9, () => OFF, { op: f }); grow(cx - 14, 220, cx + 14, 220, E(u, 1.4, 1.8), MUT); }
      mono(cx, 320, dp ? '같은 모델 복제 · 배치 분할' : '층을 장치마다 나눔 · 배치 통째로', { 'font-size': 14, 'text-anchor': 'middle', opacity: f });
      mono(cx, 346, dp ? '이 장의 주제 · PyTorch DDP 와 같은 발상' : '모델이 한 장에 안 들어갈 때만', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: f }); });
    check(240, 384, 12, pop(u, 1.8)); }

  // =========================================================
  // 2. MirroredStrategy 3줄 — scope 안에서 만든 변수는 모든 GPU 에
  // =========================================================
  const CL = ['strategy = tf.distribute.MirroredStrategy()', 'with strategy.scope():', '    model = tf.keras.Sequential([...])', '    model.compile(optimizer="adam", ...)', 'model.fit(train_ds, epochs=10)'];
  function s2(t, c) { const { k, u } = c, b = c.beat;
    const nl = [1, 2, 3, 4, 5, 5][k];
    // 코드 (왼쪽 위)
    CL.slice(0, nl).forEach((s, i) => { const fresh = i === nl - 1 && k < 5, f = fresh ? fade(u, 0.1) : 1, inScope = i >= 2 && i <= 3;
      if (fresh) el('rect', { x: 26, y: 38 + i * 28, width: 470, height: 26, rx: 4, fill: ACCBG, opacity: f });
      mono(34, 56 + i * 28, s, { 'font-size': 14, opacity: f, fill: inScope ? ACC : INK, 'font-weight': fresh ? 700 : 400 }); });
    // GPU 4장
    const gy = 300, scopeOn = k >= 1;
    if (scopeOn) { const f = k === 1 ? E(u, 0.3, 1.2) : 1; el('rect', { x: 40, y: 200, width: 880 * f, height: 176, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '8 6' });
      mono(56, 222, 'strategy.scope()', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: f }); }
    GX.forEach((x, i) => { const on = k === 0 ? pop(u, 0.6 + i * 0.2) : 1;
      gpu(x, gy, `GPU ${i}`, { s: on, w: 160, h: 110, stroke: GC[i], model: k >= 2 ? (k === 2 ? E(u, 0.3 + i * 0.02, 1.2) : 1) : null, mstroke: GC[i] });
      if (k >= 3) ['m', 'v', 'acc'].forEach((n, j) => card(x - 44 + j * 40, gy + 72, j === 2 ? 40 : 30, 24, { rx: 5, text: n, fs: 13.5, mono: true, stroke: WARN, fill: WARNBG, s: k === 3 ? pop(u, 0.4 + j * 0.2) : 1 })); });
    if (k === 0) { mono(560, 110, `num_replicas_in_sync = ${Math.round(lerp(0, 4, E(u, 0.6, 1.6)))}`, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
      sub(700, 150, '인자 없이 부르면 보이는 GPU 를 전부 잡는다', fade(u, 1.6)); }
    if (k === 1) sub(700, 130, '여기서 만든 변수 = 모든 GPU 에 복제', fade(u, 1.0), { 'font-weight': 700, fill: ACC });
    if (k === 2) { for (let i = 1; i < 4; i++) grow(GX[0] + 70, gy - 68, GX[i] - 70, gy - 68, E(u, 0.8, 1.6), ACC, { dash: '5 4' });
      mono(700, 130, 'MirroredVariable', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) }); sub(700, 156, '4장의 가중치가 늘 같은 값', fade(u, 1.8)); }
    if (k === 3) sub(700, 140, '옵티마이저 상태·metric 변수도 복제 대상', fade(u, 1.2), { 'font-weight': 700, fill: WARN });
    if (k === 4) { const f = E(u, 0.2, 1.0); // 데이터는 scope 밖에서 들어온다
      card(800, 120, 160, 40, { rx: 20, text: 'train_ds', fs: 14.5, mono: true, stroke: INFO, s: f > 0 ? 1 : 0, op: f });
      for (let i = 0; i < 4; i++) { const p = ((t * 0.5 + i / 4) % 1); dot([[800, 142], [800, 190], [GX[i], 190], [GX[i], 244]], p, INFO, 5); }
      if (k === 4) sub(560, 168, 'fit 은 scope 밖에서 평소처럼', fade(u, 1.2), { 'font-weight': 700, fill: INFO }); }
    if (k === 5) { const ins = b.insideScope || [], out = b.outsideScope || [];
      el('rect', { x: 520, y: 36, width: 420, height: 150, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.2) });
      tx(536, 60, 'scope 안', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) }); tx(736, 60, 'scope 밖', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.6) });
      ins.forEach((s, i) => tx(536, 88 + i * 26, s.replace('(compile 이 만드는 metric 변수)', 'metric 변수'), { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.2) }));
      out.forEach((s, i) => tx(736, 88 + i * 26, s, { 'font-size': 14, opacity: fade(u, 0.7 + i * 0.2) })); } }

  // =========================================================
  // 3. 내부 동작 — 글로벌 배치 분할, lr 스케일링, all-reduce
  // =========================================================
  function gradBars(cx, cy, hs, col, op, label) { hs.forEach((h, i) => el('rect', { x: cx - 30 + i * 16, y: cy - h, width: 12, height: h, rx: 2, fill: col, opacity: op }));
    if (label) mono(cx, cy + 18, label, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, opacity: op }); }
  const GH = [[30, 14, 40, 22], [18, 26, 34, 10], [36, 20, 26, 28], [24, 32, 44, 16]];   // 그림용 기울기 막대 (값 아님)
  function s3(t, c) { const { k, u } = c, b = c.beat, A = b.allreduce || {}, P = (c.prev && c.prev.allreduce) || {};
    const gy = 330;
    GX.forEach((x, i) => { const on = i < (k === 0 ? 1 + Math.round(E(u, 0.3, 1.3) * 3) : 4);
      gpu(x, gy, `GPU ${i}`, { w: 160, h: 100, stroke: on ? GC[i] : OFF, model: k >= 4 ? 1 : null, mstroke: GC[i], op: on ? 1 : 0.4 }); });
    if (k === 0) { mono(60, 70, 'N = strategy.num_replicas_in_sync', { 'font-size': 15, 'font-weight': 700 });
      mono(60, 104, `N = ${1 + Math.round(E(u, 0.3, 1.3) * 3)}`, { 'font-size': 22, 'font-weight': 800, fill: ACC });
      sub(560, 104, '숫자를 박지 않고 전략에서 읽는다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1 || k === 2) { const gb = A.globalBatch || 256;
      mono(60, 56, 'GLOBAL_BATCH = 64 × N = 256', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      const split = k === 2 ? E(u, 0.6, 1.8) : 0;
      for (let q = 0; q < 4; q++) { const x0 = lerp(60 + q * 74, GX[q] - 36, split), y0 = lerp(80, 210, split);
        grid(x0, y0, 64, 8, 9, () => (k === 2 || u > 1.0 ? GC[q] : ACC), { reveal: k === 1 ? E(u, 0.2 + q * 0.25, 0.6 + q * 0.25) : 1 });
        if (k === 2 && split > 0.9) mono(x0 + 36, y0 - 6, 'per-replica 64', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: GC[q] }); }
      if (k === 1) sub(620, 110, 'fit 에 주는 배치는 전체(글로벌) 배치', fade(u, 1.4), { 'font-weight': 700, fill: INK });
      if (k === 2) mono(400, 70, '.batch(GLOBAL_BATCH) → 전략이 N조각으로', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      return; }
    if (k === 3 || k === 4) { const lr = k === 3 ? lerp(1, 4, E(u, 0.6, 1.8)) : 4;
      tx(60, 64, '한 장일 때 배치 64 · lr 1e-3', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      tx(60, 92, '4장으로 넓히면 글로벌 배치 256', { 'font-size': 15, 'font-weight': 700 });
      mono(60, 150, 'scaled_lr = BASE_LR × N', { 'font-size': 15, 'font-weight': 700 });
      hbar(320, 136, 300, 1, 4, { h: 20, col: OFF, text: '1e-3' }); hbar(320, 166, 300, lr, 4, { h: 20, col: ACC, text: `${lr.toFixed(lr < 3.95 ? 1 : 0)}e-3` });
      if (k === 4) { el('rect', { x: 40, y: 240, width: 880, height: 150, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '8 6' });
        pill(770, 120, 'Adam(scaled_lr) · scope 안', ACC, pop(u, 0.3), { mono: true, fs: 13.5 }); sub(770, 160, '4개 복제본이 같은 lr 4e-3 으로', fade(u, 0.8)); }
      else sub(480, 222, '배치가 4배면 lr 도 대략 4배 (linear scaling)', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      return; }
    // k5, k6: 한 스텝
    if (k === 5) for (let q = 0; q < 4; q++) grid(GX[q] - 36, 70, 64, 8, 9, () => GC[q], { op: 0.85 });
    if (k === 5) { for (let q = 0; q < 4; q++) { dot([[GX[q], 145], [GX[q], 270]], seg(u, 0.3, 1.0), GC[q], 6); const f = E(u, 1.0, 1.8); gradBars(GX[q], 220, GH[q].map((h) => h * f), GC[q], f > 0 ? 1 : 0, f > 0.5 ? `g${q}` : null); }
      sub(480, 180, '각자 forward · backward → 자기 몫의 기울기', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    // k6: all-reduce: 평균 막대가 모두에게
    const avg = [0, 1, 2, 3].map((j) => GH.reduce((a, g) => a + g[j], 0) / 4), f1 = E(u, 0.3, 1.2), f2 = E(u, 1.3, 2.2);
    for (let q = 0; q < 4; q++) gradBars(GX[q] - 50, 210, GH[q], GC[q], 1 - f1 * 0.7, `g${q}`);
    if (f1 > 0) { el('ellipse', { cx: 480, cy: 110, rx: 120 * f1, ry: 30 * f1, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 4' }); mono(480, 116, '평균(g0…g3)', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: f1 }); }
    for (let q = 0; q < 4; q++) { if (f2 > 0) gradBars(GX[q] + 30, 210, avg.map((h) => h * f2), INK, 1, f2 > 0.6 ? 'ḡ' : null); }
    banner(480, 395, '같은 평균 기울기로 4개가 동시에 갱신 → 늘 같은 가중치', pop(u, 2.2)); }

  // =========================================================
  // 4. 커스텀 루프 — strategy.run · compute_average_loss · reduce
  // =========================================================
  const PRL = [0.5734, 0.5699, 0.5845, 0.5753];   // 복제본별 손실 (실행값)
  function lane(i, y, o) { o = o || {}; const x = 70;
    card(x, y, 100, 38, { rx: 8, text: `복제본 ${i}`, fs: 14, stroke: GC[i], sw: 2.2, op: o.op }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { for (let q = 0; q < 4; q++) { grid(150 + q * 180, 170, 64, 8, 12, () => GC[q], { reveal: E(u, 0.5 + q * 0.2, 1.0 + q * 0.2) }); mono(198 + q * 180, 290, `복제본 ${q} · 64`, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GC[q], opacity: fade(u, 0.8 + q * 0.2) }); }
      pill(480, 350, '손실의 분모 = 256 (전체)', ACC, pop(u, 1.9), { fs: 14.5 }); }
    if (k <= 1) { mono(60, 70, 'N = 4 · GLOBAL_BATCH = 64 × N = 256', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.2) : 1 });
      sub(480, 112, '이 상수가 뒤에서 손실을 나눌 분모가 된다', k === 0 ? fade(u, 1.2) : 1, { 'font-weight': 700, fill: INK });
      if (k === 1) { el('rect', { x: 60, y: 150, width: 840, height: 200, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '8 6' }); mono(76, 174, 'with strategy.scope():', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
        [['model', ACC], ['optimizer · Adam(1e-3 × N)', WARN], ['loss_obj · reduction=NONE', BAD]].forEach(([n, col], i) => card(200 + i * 270, 260, 240, 60, { rx: 10, text: n, fs: 14, mono: true, stroke: col, sw: 2.2, s: pop(u, 0.3 + i * 0.4) }));
        sub(480, 330, 'NONE: 평균을 내지 않고 샘플별 손실을 그대로 받는다', fade(u, 1.8), { 'font-weight': 700, fill: BAD }); }
      return; }
    if (k === 2 || k === 3) { lane(0, 110);
      grid(150, 76, 64, 16, 9, () => GC[0]); mono(150, 66, 'x: 64개 (자기 조각)', { 'font-size': 13.5, fill: GC[0], 'font-weight': 700 });
      grow(300, 110, 360, 110, k === 2 ? E(u, 0.3, 0.7) : 1, MUT); mono(400, 115, 'model', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
      grow(440, 110, 500, 110, k === 2 ? E(u, 0.7, 1.1) : 1, MUT);
      for (let i = 0; i < 32; i++) { const h = 8 + 26 * Math.abs(Math.sin(i * 1.7)), f = k === 2 ? clamp((u - 1.0) * 20 - i * 0.5) : 1; if (f <= 0) continue; el('rect', { x: 510 + i * 11, y: 130 - h * f, width: 8, height: h * f, rx: 1.5, fill: BAD, opacity: 0.8 }); }
      mono(510, 152, 'per_sample: 손실 64개 (32개만 그림)', { 'font-size': 13.5, fill: BAD, opacity: k === 2 ? fade(u, 1.6) : 1 });
      if (k === 2) { sub(480, 260, '아직 평균 전 · 복제본 하나는 64개만 본다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
      // ★ 나누는 수
      const rows = [[220, 'compute_average_loss(…, global_batch_size=256)', '각 복제본: 합 ÷ 256', GOOD, PRL.map((v) => v.toFixed(4)).join(' + '), '= 2.3030'],
        [330, 'mean(per_sample)  (÷ 64)', '각 복제본: 합 ÷ 64', BAD, '2.2936 + 2.2795 + 2.3378 + 2.3011', '= 9.2121']];
      rows.forEach(([y, code, how, col, sum, res], r) => { const f = fade(u, 0.3 + r * 1.0);
        mono(60, y - 30, code, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: f });
        mono(60, y - 6, how, { 'font-size': 13.5, fill: MUT, opacity: f });
        mono(60, y + 22, sum, { 'font-size': 14, opacity: fade(u, 0.6 + r * 1.0) }); mono(560, y + 22, res, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.9 + r * 1.0) }); });
      mono(700, 250, '한 장에서 256개 평균', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) }); mono(700, 272, '= 2.3030', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
      check(870, 238, 12, pop(u, 1.3)); cross(870, 348, 12, pop(u, 2.2)); mono(700, 360, '4배로 부푼다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) });
      return; }
    // 복제본 4줄
    const ly = (i) => 90 + i * 74;
    for (let i = 0; i < 4; i++) lane(i, ly(i));
    if (k === 4 || k === 5) { for (let i = 0; i < 4; i++) { const y = ly(i);
        const steps = ['forward', 'loss ÷256', 'gradient']; steps.forEach((s, j) => card(220 + j * 130, y, 118, 34, { rx: 6, text: s, fs: 13.5, mono: true, stroke: GC[i], sw: 1.6, s: k === 5 ? pop(u, 0.2 + j * 0.15) : 1 }));
        grow(482, y, 560, 237, E(u, k === 4 ? 0.5 : 1.4, k === 4 ? 1.2 : 2.0), GC[i]); }
      card(640, 237, 150, 60, { rx: 12, stroke: INK, sw: 2.4, s: pop(u, k === 4 ? 1.2 : 2.0) }); mono(640, 233, 'all-reduce', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, k === 4 ? 1.3 : 2.0) }); mono(640, 253, '(자동)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, k === 4 ? 1.3 : 2.0) });
      if (k === 4) { grow(716, 237, 800, 237, E(u, 1.6, 2.0), GOOD); mono(806, 242, 'apply', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) }); }
      if (k === 5) mono(220, 52, 'strategy.run(train_step, args=(inputs,)) · 네 줄이 동시에', { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 0.1) });
      return; }
    if (k === 6) { PRL.forEach((v, i) => { const f = E(u, 0.4 + i * 0.15, 1.4 + i * 0.15);
        card(lerp(250, 450, f), lerp(ly(i), 180 + i * 38, f), 90, 32, { rx: 6, text: v.toFixed(4), fs: 14, mono: true, stroke: GC[i], fill: PANEL });
        if (f >= 1) grow(497, 180 + i * 38, 563, 237, 1, GC[i], { plain: true }); });
      card(640, 237, 150, 70, { rx: 12, stroke: INK, sw: 2.4, s: pop(u, 1.6) });
      mono(640, 230, 'ReduceOp.SUM', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); mono(640, 256, '2.3030', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) });
      sub(640, 300, '이미 ÷256 했으니 MEAN 이 아니라 SUM', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    if (k === 7) { mono(220, 50, 'distribute_datasets_from_function(dataset_fn)', { 'font-size': 14.5, 'font-weight': 800 });
      [[150, 'batch(ctx.get_per_replica_batch_size(256))', 64, GOOD], [300, 'batch(GLOBAL_BATCH)  ✗', 256, BAD]].forEach(([y, code, n, col], r) => { const f = fade(u, 0.3 + r * 1.0);
        mono(220, y - 40, code, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: f });
        for (let q = 0; q < 4; q++) { const x0 = 220 + q * 175; grid(x0, y - 26, n, n === 64 ? 16 : 32, n === 64 ? 9 : 5, () => GC[q], { op: f, reveal: E(u, 0.4 + r, 1.2 + r) }); mono(x0 + 2, y + 54, `복제본 ${q}: ${n}개`, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: fade(u, 1.0 + r) }); } });
      sub(560, 400, '실행으로 확인: from_function 은 배치를 쪼개 주지 않는다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    // k8: 루프
    const ang = E(u, 0.2, 2.6) * Math.PI * 4;
    el('circle', { cx: 760, cy: 240, r: 70, fill: 'none', stroke: GRID, 'stroke-width': 6 });
    el('circle', { cx: 760 + 70 * Math.sin(ang), cy: 240 - 70 * Math.cos(ang), r: 10, fill: ACC });
    mono(760, 236, 'for batch', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' }); mono(760, 256, 'in dist_ds', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
    mono(560, 60, 'loss = distributed_step(batch)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
    sub(560, 360, '루프 모양은 한 장일 때와 같다 · 한 번 돌 때마다 4개가 동시에', fade(u, 1.0), { 'font-weight': 700, fill: INK }); }

  // =========================================================
  // 5. 전략 지도
  // =========================================================
  function machine(cx, cy, n, col, s, label) { if (s <= 0.01) return; const g = R.G(cx, cy, s);
    el('rect', { x: -70, y: -46, width: 140, height: 92, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2.2 }, g);
    for (let i = 0; i < n; i++) el('rect', { x: -58 + (i % 4) * 30, y: -30 + Math.floor(i / 4) * 30, width: 24, height: 22, rx: 3, fill: col, opacity: 0.75 }, g);
    if (label) tx(0, 66, label, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col }, g); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 200, 300, 70, { rx: 12, stroke: INK, sw: 2.4, s: pop(u, 0.2) }); mono(480, 206, 'make_strategy(kind)', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      ['"single_multi_gpu"', '"multi_node"', '"tpu"', '"param_server"'].forEach((s, i) => { pill(150, 90 + i * 74, s, INFO, pop(u, 0.6 + i * 0.2), { mono: true, fs: 13.5 }); grow(250, 90 + i * 74, 326, 200, E(u, 0.8 + i * 0.2, 1.1 + i * 0.2), INFO); });
      grow(632, 200, 720, 200, E(u, 1.8, 2.2), ACC); pill(800, 200, 'Strategy', ACC, pop(u, 2.2), { fs: 15 }); return; }
    if (k >= 6) return s5b(t, c);
    // 지도: 가로 = 장치 범위, 세로 = 동기/비동기
    el('line', { x1: 60, y1: 300, x2: 920, y2: 300, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '5 5' });
    mono(64, 290, '동기 all-reduce', { 'font-size': 13.5, fill: MUT }); mono(64, 322, '비동기', { 'font-size': 13.5, fill: MUT });
    const on = (i) => k >= 1 + i;
    if (on(0)) { machine(160, 170, 4, ACC, k === 1 ? pop(u, 0.2) : 1, 'Mirrored · 한 머신'); }
    if (on(1)) { const s = k === 2 ? pop(u, 0.2) : 1; machine(390, 130, 4, INFO, s, null); machine(390, 230, 4, INFO, s, 'MultiWorker · 여러 머신');
      grow(390, 177, 390, 183, s, INFO, { plain: true }); if (k === 2) { el('line', { x1: 390, y1: 176, x2: 390, y2: 184, stroke: INFO, 'stroke-width': 3 }); sub(560, 70, 'TF_CONFIG 로 클러스터 설정이 더 든다', fade(u, 1.0), { 'font-weight': 700, fill: INFO }); } }
    if (on(2)) { const s = k === 3 ? pop(u, 0.2) : 1; machine(630, 170, 8, WARN, s, 'TPUStrategy · TPU');
      if (k === 3) ['TPUClusterResolver()', 'initialize_tpu_system()'].forEach((n, i) => mono(560, 52 + i * 22, `${i + 1}. ${n}`, { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.3) })); }
    if (on(3)) { const s = k === 4 ? pop(u, 0.2) : 1; card(840, 350, 120, 40, { rx: 8, text: 'PS', fs: 15, stroke: BAD, sw: 2.2, s });
      ['워커 0', '워커 1'].forEach((n, i) => { card(660, 330 + i * 44, 90, 34, { rx: 6, text: n, fs: 13.5, stroke: BAD, s });
        if (k === 4) dot([[705, 330 + i * 44], [780, 350]], ((t * (0.5 + i * 0.27)) % 1), BAD, 5); });
      mono(900, 396, 'ParameterServer', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: s });
      if (k === 4) sub(560, 70, '복제본마다 다른 때 갱신 · 유일한 비동기', fade(u, 1.0), { 'font-weight': 700, fill: BAD }); }
    if (k === 5) { el('path', { d: 'M160,110 Q275,40 390,70', fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: fade(u, 0.6), 'marker-end': 'url(#ra-ah)' });
      banner(300, 380, 'Mirrored 로 시작 · 한 대로 모자랄 때만 넓힌다', pop(u, 1.2)); el('circle', { cx: 160, cy: 170, r: 92, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 0.3) }); }
  }
  function s5b(t, c) { const { k, u } = c;
    if (k === 6) { const names = ['MirroredStrategy()', 'MultiWorkerMirroredStrategy()', 'TPUStrategy(resolver)'], idx = Math.floor(E(u, 0.2, 2.6) * 2.99);
      mono(200, 120, `strategy = ${names[idx]}`, { 'font-size': 16, 'font-weight': 800, fill: [ACC, INFO, WARN][idx] });
      snippet(200, 150, ['with strategy.scope():', '    model = build_model()', '    model.compile(optimizer="adam", loss="mse")', 'model.fit(train_ds, epochs=10)'], { fs: 15 });
      sub(480, 330, '바뀌는 것은 첫 줄뿐 · 아래 네 줄은 그대로', fade(u, 1.0), { 'font-weight': 700, fill: INK }); }
    if (k === 7) {
      tx(480, 70, '다음 장 IV-2-2 · 분산 위에 얹는 두 가지', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
      card(260, 220, 340, 160, { rx: 14, stroke: ACC, sw: 2.4, s: pop(u, 0.4) }); tx(260, 170, '혼합 정밀도', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5) });
      el('rect', { x: 130, y: 200, width: 260, height: 22, rx: 4, fill: OFF, opacity: fade(u, 0.6) }); mono(140, 216, 'float32', { 'font-size': 13.5, opacity: fade(u, 0.6), fill: PANEL });
      el('rect', { x: 130, y: 236, width: 130 * E(u, 0.8, 1.4) + 1, height: 22, rx: 4, fill: ACC }); mono(140, 252, 'float16', { 'font-size': 13.5, fill: PANEL, opacity: fade(u, 1.2) });
      card(700, 220, 340, 160, { rx: 14, stroke: INFO, sw: 2.4, s: pop(u, 1.0) }); tx(700, 170, 'XLA 컴파일', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.1) });
      const m = E(u, 1.5, 2.2); ['mul', 'add', 'relu', 'mul'].forEach((n, i) => card(lerp(590 + i * 74, 700, m), 225, lerp(64, 200, m) / (m > 0.95 ? 1 : 1), 30, { rx: 6, text: m > 0.95 ? (i === 0 ? 'fused_kernel' : '') : n, fs: 13.5, mono: true, stroke: INFO, op: m > 0.95 && i ? 0 : 1 })); } }

  const quiz = [
    { q: '데이터 병렬에서 GPU 4장이 나눠 갖는 것과 똑같이 복제하는 것은 각각 무엇인가?',
      o: ['배치를 나누고, 모델을 복제한다', '모델 층을 나누고, 배치를 복제한다', '옵티마이저를 나누고, 데이터셋을 복제한다'], a: 0,
      why: '같은 모델을 GPU마다 두고 배치 256을 64씩 나눈다. 모델 자체를 쪼개는 것은 모델 병렬이다.' },
    { q: 'MirroredStrategy에서 strategy.scope() 안에서 만들어야 하는 것은 무엇인가?',
      o: ['tf.data 데이터셋과 전처리 함수', '모델·옵티마이저처럼 변수를 가진 것', 'model.fit 호출'], a: 1,
      why: 'scope는 그 안에서 만든 변수를 모든 GPU에 미러링하라는 표시다. 데이터셋과 fit 호출은 밖에 있어도 된다.' },
    { q: '한 장에서 배치 64·lr 1e-3 이던 학습을 GPU 4장(장당 64)으로 넓혔다. 맞는 설정은 무엇인가?',
      o: ['batch(64), lr 1e-3 그대로', 'batch(256), lr 1e-3 그대로', 'batch(256), lr 4e-3'], a: 2,
      why: 'fit에 주는 배치는 글로벌 배치라 64 × 4 = 256이고, 배치가 4배가 됐으니 lr도 대략 4배인 4e-3으로 키운다.' },
    { q: '커스텀 루프에서 복제본마다 샘플별 손실의 평균(÷64)을 내고 SUM으로 합치면 어떻게 되는가?',
      o: ['한 장일 때와 같은 2.3030이 나온다', '네 배로 부푼 9.2121이 나온다', '손실이 4분의 1로 줄어든다'], a: 1,
      why: '복제본 손실은 글로벌 배치 256으로 나눠야 합이 한 장 평균과 같다. 64로 나누면 실행값이 2.3030 대신 9.2121이 된다.' },
    { q: 'MultiWorkerMirroredStrategy가 필요한 때는 언제인가?',
      o: ['한 머신의 GPU를 다 쓰고도 모자라 여러 머신을 묶을 때', 'GPU가 한 장뿐일 때', '복제본을 비동기로 갱신하고 싶을 때'], a: 0,
      why: '출발은 한 머신 여러 GPU의 MirroredStrategy다. 한 대로 감당이 안 될 때 노드를 늘리고, 비동기는 ParameterServer의 몫이다.' },
  ];

  const summary = [
    'GPU 한 장으로 며칠 걸리는 학습은 모델을 복제하고 배치를 나누는 데이터 병렬로 줄인다.',
    'MirroredStrategy를 만들고 scope 안에서 모델과 compile을 하면 fit은 그대로 돈다.',
    '배치 64를 4장에 두면 글로벌 배치는 256이고, lr도 1e-3에서 4e-3으로 키운다.',
    '커스텀 루프는 손실을 256으로 나눠야 합이 2.3030으로 맞고, 64로 나누면 9.2121이 된다.',
  ];
  const review = [
    { q: 'GPU 4장으로 바꿨는데 배치를 64로 둔 채 fit 했더니 GPU 사용률이 낮다. 먼저 고칠 것은?',
      o: ['fit의 배치를 글로벌 배치 256으로 키우고 lr도 같이 맞춘다', 'scope 밖으로 모델을 옮긴다', 'ParameterServerStrategy로 바꾼다'], a: 0,
      why: 'fit의 배치는 전체 배치라 64를 넣으면 장당 16개만 받는다. 장당 64를 유지하려면 256으로 키우고 lr도 스케일한다.' },
    { q: '모델을 scope 밖에서 만든 뒤 scope 안에서 compile만 했더니 다른 GPU가 거의 쉰다. 원인은?',
      o: ['compile이 너무 늦게 불려서', '가중치 변수가 이미 한 장에만 만들어져 미러링되지 않았다', 'train_ds를 scope 밖에서 만들어서'], a: 1,
      why: '변수는 만들어지는 순간 위치가 정해진다. 모델·옵티마이저 생성 자체가 scope 안에 있어야 모든 GPU에 복제된다.' },
    { q: 'distribute_datasets_from_function 안에서 batch(GLOBAL_BATCH)로 묶고 손실은 256으로 나눴다. 무슨 일이 생기나?',
      o: ['아무 문제 없이 장당 64개씩 들어간다', 'interleave가 꺼져 읽기가 느려진다', '복제본마다 256개가 들어가 손실 배율이 어긋난다'], a: 2,
      why: 'from_function은 배치를 쪼개 주지 않는다. 실행해 보면 복제본마다 256개가 들어가므로 get_per_replica_batch_size로 64씩 묶어야 한다.' },
  ];

  R.page({ title: '여러 GPU로 나눠 학습', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
